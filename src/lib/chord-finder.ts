import { getNoteIndex, noteIndexAtFret } from './music-theory';

export interface Voicing {
  frets: number[];        // -1=muted, 0=open, 1-12=fret position
  startingFret: number;   // lowest non-open fret (for display window)
  barres: BarreDef[];
  mutedStrings: number[]; // string indices that are muted
  omitted: string[];      // e.g. ['5ª'] or ['fund.'] or ['5ª','fund.']
}

export interface BarreDef {
  fret: number;
  startString: number;
  endString: number;
}

interface FindOptions {
  maxFret?: number;        // default 12
  allowMuted?: boolean;    // default false
  maxSpan?: number;        // default 4
  maxResults?: number;     // default 12
  allowOmissions?: boolean;// default false — omit 5th/root for small instruments
  rootNoteIndex?: number;  // required when allowOmissions=true
}

// ── Internal: find voicings for a given set of required notes ───────────────
function findVoicingsForNotes(
  requiredNotes: number[],
  tuning: string[],
  options: Omit<FindOptions, 'allowOmissions' | 'rootNoteIndex'>,
  omitted: string[]
): Voicing[] {
  const { maxFret = 12, allowMuted = false, maxSpan = 4 } = options;
  const numStrings = tuning.length;

  const validFretsPerString: number[][] = tuning.map(openNote => {
    const openIdx = getNoteIndex(openNote);
    if (openIdx === -1) return [];
    const valid: number[] = [];
    if (allowMuted) valid.push(-1);
    for (let fret = 0; fret <= maxFret; fret++) {
      if (requiredNotes.includes(noteIndexAtFret(openIdx, fret))) {
        valid.push(fret);
      }
    }
    return valid;
  });

  const collected: Voicing[] = [];

  function backtrack(strIdx: number, current: number[], covered: Set<number>) {
    if (collected.length >= 60) return;

    if (strIdx === numStrings) {
      if (!requiredNotes.every(n => covered.has(n))) return;
      const pressed = current.filter(f => f > 0);
      if (pressed.length >= 2 && Math.max(...pressed) - Math.min(...pressed) > maxSpan) return;
      const startingFret = pressed.length > 0 ? Math.min(...pressed) : 1;
      collected.push({
        frets: [...current],
        startingFret,
        barres: detectBarres(current),
        mutedStrings: current.reduce<number[]>((a, f, i) => (f === -1 ? [...a, i] : a), []),
        omitted,
      });
      return;
    }

    for (const fret of validFretsPerString[strIdx]) {
      const tentative = [...current, fret];
      const pressed = tentative.filter(f => f > 0);
      if (pressed.length >= 2 && Math.max(...pressed) - Math.min(...pressed) > maxSpan) continue;

      const newCovered = new Set(covered);
      if (fret >= 0) {
        const openIdx = getNoteIndex(tuning[strIdx]);
        if (openIdx !== -1) newCovered.add(noteIndexAtFret(openIdx, fret));
      }
      current.push(fret);
      backtrack(strIdx + 1, current, newCovered);
      current.pop();
    }
  }

  backtrack(0, [], new Set());
  return collected;
}

// ── Public API ───────────────────────────────────────────────────────────────
export function findVoicings(
  chordNoteIndices: number[],
  tuning: string[],
  options: FindOptions = {}
): Voicing[] {
  const { allowOmissions = false, rootNoteIndex, maxResults = 12, ...restOpts } = options;

  const allRaw: Voicing[] = [];

  // 1. Full chord (all notes required)
  allRaw.push(...findVoicingsForNotes(chordNoteIndices, tuning, restOpts, []));

  if (allowOmissions && rootNoteIndex !== undefined) {
    const perfectFifth = (rootNoteIndex + 7) % 12;
    const hasPerfectFifth = chordNoteIndices.includes(perfectFifth);

    // 2. Omit perfect 5th (never omit b5/aug5 — they define the chord)
    if (hasPerfectFifth) {
      const noFifth = chordNoteIndices.filter(n => n !== perfectFifth);
      allRaw.push(...findVoicingsForNotes(noFifth, tuning, restOpts, ['s/ 5ª']));

      // 3. Omit 5th AND root
      const noFifthNoRoot = noFifth.filter(n => n !== rootNoteIndex);
      if (noFifthNoRoot.length > 0) {
        allRaw.push(...findVoicingsForNotes(noFifthNoRoot, tuning, restOpts, ['s/ 5ª', 's/ fund.']));
      }
    }

    // 4. Omit root only
    const noRoot = chordNoteIndices.filter(n => n !== rootNoteIndex);
    if (noRoot.length > 0) {
      allRaw.push(...findVoicingsForNotes(noRoot, tuning, restOpts, ['s/ fund.']));
    }
  }

  // Deduplicate (keep first occurrence = fullest chord wins)
  const seen = new Set<string>();
  const unique = allRaw.filter(v => {
    const key = v.frets.join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort: full chords first, then by startingFret, then fewer muted strings
  unique.sort((a, b) => {
    const ao = a.omitted.length, bo = b.omitted.length;
    if (ao !== bo) return ao - bo;
    if (a.startingFret !== b.startingFret) return a.startingFret - b.startingFret;
    return a.mutedStrings.length - b.mutedStrings.length;
  });

  return unique.slice(0, maxResults);
}

function detectBarres(frets: number[]): BarreDef[] {
  const pressed = frets.filter(f => f > 0);
  if (pressed.length < 2) return [];
  const minFret = Math.min(...pressed);
  let start = -1, end = -1;
  for (let i = 0; i < frets.length; i++) {
    if (frets[i] === minFret) {
      if (start === -1) start = i;
      end = i;
    }
  }
  if (start !== -1 && end > start) return [{ fret: minFret, startString: start, endString: end }];
  return [];
}
