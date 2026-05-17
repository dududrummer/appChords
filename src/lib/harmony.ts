import { parseChord, getNoteIndex } from './music-theory';
import type { Measure } from './progression';

// ── Krumhansl-Schmuckler key profiles ────────────────────────────────────────
const MAJOR_PROFILE = [6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
const MINOR_PROFILE = [6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];
const NOTE_NAMES    = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const MAJOR_SCALE   = [0,2,4,5,7,9,11];
const MINOR_SCALE   = [0,2,3,5,7,8,10];
const ROMAN         = ['I','II','III','IV','V','VI','VII'];

export interface ChordAnalysis {
  romanNumeral: string;
  harmonicFunction: 'T' | 'SD' | 'D';
  functionLabel: string;
  color: string; // tailwind color name
}

export interface HarmonicAnalysis {
  keyRoot: number;
  isMinor: boolean;
  keyName: string;
  analyses: Record<string, ChordAnalysis>; // chordName → analysis
}

// ── Pearson correlation ───────────────────────────────────────────────────────
function correlate(counts: number[], profile: number[], root: number): number {
  const rotated = Array.from({ length: 12 }, (_, i) => profile[(i - root + 12) % 12]);
  const n = 12;
  const mA = counts.reduce((a, b) => a + b, 0) / n;
  const mB = rotated.reduce((a, b) => a + b, 0) / n;
  let num = 0, dA = 0, dB = 0;
  for (let i = 0; i < n; i++) {
    const a = counts[i] - mA, b = rotated[i] - mB;
    num += a * b; dA += a * a; dB += b * b;
  }
  return dA === 0 || dB === 0 ? 0 : num / Math.sqrt(dA * dB);
}

function isMinorQuality(quality: string): boolean {
  return /^m(?!aj)/i.test(quality) && quality !== '';
}

function isDiminishedQuality(quality: string): boolean {
  return quality.startsWith('dim');
}

function isDominantQuality(quality: string): boolean {
  return /^7(?!M|maj)/i.test(quality) || quality === '7';
}

function getExpectedQuality(isMinorKey: boolean, degreeIndex: number): 'major' | 'minor' | 'dim' {
  if (isMinorKey) {
    return (['minor', 'dim', 'major', 'minor', 'minor', 'major', 'major'] as const)[degreeIndex] ?? 'major';
  }
  return (['major', 'minor', 'minor', 'major', 'major', 'minor', 'dim'] as const)[degreeIndex] ?? 'major';
}

function qualityFitsKey(quality: string, isMinorKey: boolean, degreeIndex: number): boolean {
  const expected = getExpectedQuality(isMinorKey, degreeIndex);
  if (expected === 'minor') return isMinorQuality(quality);
  if (expected === 'dim') return isDiminishedQuality(quality);
  return !isMinorQuality(quality) && !isDiminishedQuality(quality);
}

function scoreKey(
  measures: Measure[],
  counts: number[],
  root: number,
  isMinor: boolean
): number {
  const scale = isMinor ? MINOR_SCALE : MAJOR_SCALE;
  const profile = isMinor ? MINOR_PROFILE : MAJOR_PROFILE;
  const parsedBeats = measures
    .flatMap(m => m.beats)
    .map(beat => ({ beat, parsed: parseChord(beat.chordName) }))
    .filter((item): item is typeof item & { parsed: NonNullable<ReturnType<typeof parseChord>> } => item.parsed !== null);

  let score = correlate(counts, profile, root) * 4;

  for (const { beat, parsed } of parsedBeats) {
    const chordRoot = getNoteIndex(parsed.root);
    const degree = (chordRoot - root + 12) % 12;
    const degreeIndex = scale.indexOf(degree);

    if (degreeIndex !== -1) {
      score += beat.durationBeats * 0.45;
      if (qualityFitsKey(parsed.quality, isMinor, degreeIndex)) score += beat.durationBeats * 0.25;
    } else {
      score -= beat.durationBeats * 0.35;
    }

    if (degree === 0) score += beat.durationBeats * 1.2;
    if (degree === 7) score += beat.durationBeats * 0.65;
    if (degree === 5) score += beat.durationBeats * 0.3;
    if (degree === 7 && isDominantQuality(parsed.quality)) score += beat.durationBeats * 0.65;
  }

  const first = parsedBeats[0];
  const last = parsedBeats[parsedBeats.length - 1];
  for (const item of [first, last]) {
    if (!item) continue;
    const chordRoot = getNoteIndex(item.parsed.root);
    const degree = (chordRoot - root + 12) % 12;
    if (degree === 0) score += 2.5;
    if (degree === 7 && isDominantQuality(item.parsed.quality)) score += 0.8;
  }

  for (let i = 0; i < parsedBeats.length - 1; i++) {
    const current = parsedBeats[i].parsed;
    const next = parsedBeats[i + 1].parsed;
    const currentRoot = getNoteIndex(current.root);
    const nextRoot = getNoteIndex(next.root);
    const currentDegree = (currentRoot - root + 12) % 12;
    const nextDegree = (nextRoot - root + 12) % 12;

    if (currentDegree === 7 && nextDegree === 0) score += isDominantQuality(current.quality) ? 2.2 : 1.2;
    if (currentDegree === 5 && nextDegree === 7) score += 0.8;
    if (currentDegree === 5 && nextDegree === 0) score += 0.6;
  }

  return score;
}

// ── Key detection ─────────────────────────────────────────────────────────────
export function detectKey(measures: Measure[]): { root: number; isMinor: boolean; name: string } {
  const counts = new Array(12).fill(0);
  for (const m of measures) {
    for (const b of m.beats) {
      const p = parseChord(b.chordName);
      if (p) p.noteIndices.forEach(n => (counts[n] += b.durationBeats));
    }
  }
  let best = -Infinity, root = 0, isMinor = false;
  for (let r = 0; r < 12; r++) {
    const maj = scoreKey(measures, counts, r, false);
    if (maj > best) { best = maj; root = r; isMinor = false; }
    const min = scoreKey(measures, counts, r, true);
    if (min > best) { best = min; root = r; isMinor = true; }
  }
  return { root, isMinor, name: `${NOTE_NAMES[root]} ${isMinor ? 'menor' : 'maior'}` };
}

// ── Roman numeral + function for one chord ────────────────────────────────────
function analyseOne(
  chordName: string,
  nextChordName: string | null,
  keyRoot: number,
  isMinor: boolean
): ChordAnalysis {
  const parsed = parseChord(chordName);
  if (!parsed) return { romanNumeral: '?', harmonicFunction: 'T', functionLabel: '?', color: 'zinc' };

  const chordRoot = getNoteIndex(parsed.root);
  const degree = (chordRoot - keyRoot + 12) % 12;
  const scale = isMinor ? MINOR_SCALE : MAJOR_SCALE;
  const degIdx = scale.indexOf(degree);

  const isChordMinor = /^m(?!aj)/i.test(parsed.quality) && parsed.quality !== '';
  const isDiminished = parsed.quality.startsWith('dim');
  const isDom7 = /^7(?!M|maj)/i.test(parsed.quality) || parsed.quality === '7';

  // ── Diatonic chord ──────────────────────────────────────────────────────────
  if (degIdx !== -1) {
    let rn = ROMAN[degIdx];
    if (isChordMinor || isDiminished) rn = rn.toLowerCase();
    if (isDiminished) rn += 'ø';
    if (parsed.quality.includes('7') || parsed.quality.includes('7M')) {
      rn += parsed.quality.includes('maj7') || parsed.quality.includes('7M') ? '△7' : '7';
    }

    const FUNC_MAJOR: Record<number, [ChordAnalysis['harmonicFunction'], string, string]> = {
      0: ['T',  'Tônica',       'blue'],
      1: ['SD', 'Supertônica',  'yellow'],
      2: ['T',  'Mediante',     'blue'],
      3: ['SD', 'Subdominante', 'yellow'],
      4: ['D',  'Dominante',    'red'],
      5: ['T',  'Submediante',  'blue'],
      6: ['D',  'Sensível',     'red'],
    };
    const FUNC_MINOR: Record<number, [ChordAnalysis['harmonicFunction'], string, string]> = {
      0: ['T',  'Tônica',       'blue'],
      1: ['SD', 'Supertônica',  'yellow'],
      2: ['T',  'Mediante',     'blue'],
      3: ['SD', 'Subdominante', 'yellow'],
      4: ['D',  'Dominante',    'red'],
      5: ['SD', 'Submediante',  'yellow'],
      6: ['D',  'Subtônica',    'red'],
    };
    const map = isMinor ? FUNC_MINOR : FUNC_MAJOR;
    const [hf, label, color] = map[degIdx] ?? ['T', '?', 'zinc'];
    return { romanNumeral: rn, harmonicFunction: hf, functionLabel: label, color };
  }

  // ── Secondary dominant (V7/X) ───────────────────────────────────────────────
  if (isDom7 && nextChordName) {
    const nextParsed = parseChord(nextChordName);
    if (nextParsed) {
      const nextRoot = getNoteIndex(nextParsed.root);
      const expectedDom = (nextRoot + 7) % 12; // dominant is 7 semitones above target
      if (chordRoot === expectedDom) {
        const nextDeg = scale.indexOf((nextRoot - keyRoot + 12) % 12);
        const targetRoman = nextDeg !== -1 ? ROMAN[nextDeg] : nextParsed.root;
        return {
          romanNumeral: `V7/${targetRoman}`,
          harmonicFunction: 'D',
          functionLabel: `Dom. sec. de ${targetRoman}`,
          color: 'orange',
        };
      }
    }
  }

  // ── Borrowed / chromatic chord ──────────────────────────────────────────────
  const altRoman = NOTE_NAMES[degree] !== undefined ? `(${NOTE_NAMES[degree]})` : '?';
  return { romanNumeral: altRoman, harmonicFunction: 'SD', functionLabel: 'Empréstimo modal', color: 'purple' };
}

// ── Full progression analysis ─────────────────────────────────────────────────
export function analyseProgression(measures: Measure[]): HarmonicAnalysis {
  const { root, isMinor, name } = detectKey(measures);

  // Flatten all beats in order for next-chord look-ahead
  const allBeats = measures.flatMap(m => m.beats);
  const analyses: Record<string, ChordAnalysis> = {};

  allBeats.forEach((beat, i) => {
    if (analyses[beat.chordName]) return; // already done
    const next = allBeats[i + 1]?.chordName ?? null;
    analyses[beat.chordName] = analyseOne(beat.chordName, next, root, isMinor);
  });

  return { keyRoot: root, isMinor, keyName: name, analyses };
}
