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
  const rotated = Array.from({ length: 12 }, (_, i) => profile[(i + root) % 12]);
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
    const maj = correlate(counts, MAJOR_PROFILE, r);
    if (maj > best) { best = maj; root = r; isMinor = false; }
    const min = correlate(counts, MINOR_PROFILE, r);
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
