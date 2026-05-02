import { getNoteIndex, noteIndexAtFret } from './music-theory';

export interface Voicing {
  frets: number[];        // -1=muted, 0=open, 1-12=fret position
  startingFret: number;   // lowest non-open fret (for display window)
  barres: BarreDef[];
  mutedStrings: number[]; // string indices that are muted
}

export interface BarreDef {
  fret: number;
  startString: number;
  endString: number;
}

interface FindOptions {
  maxFret?: number;      // default 12
  allowMuted?: boolean;  // default false
  maxSpan?: number;      // default 4
  maxResults?: number;   // default 12
}

export function findVoicings(
  chordNoteIndices: number[],
  tuning: string[],
  options: FindOptions = {}
): Voicing[] {
  const { maxFret = 12, allowMuted = false, maxSpan = 4, maxResults = 12 } = options;
  const numStrings = tuning.length;

  // For each string, compute which frets produce a chord tone
  const validFretsPerString: number[][] = tuning.map(openNote => {
    const openIdx = getNoteIndex(openNote);
    if (openIdx === -1) return [];
    const valid: number[] = [];
    if (allowMuted) valid.push(-1);
    for (let fret = 0; fret <= maxFret; fret++) {
      if (chordNoteIndices.includes(noteIndexAtFret(openIdx, fret))) {
        valid.push(fret);
      }
    }
    return valid;
  });

  const collected: Voicing[] = [];

  function backtrack(strIdx: number, current: number[], covered: Set<number>) {
    if (collected.length >= maxResults * 4) return;

    if (strIdx === numStrings) {
      if (!chordNoteIndices.every(n => covered.has(n))) return;
      const pressed = current.filter(f => f > 0);
      if (pressed.length >= 2) {
        const span = Math.max(...pressed) - Math.min(...pressed);
        if (span > maxSpan) return;
      }
      const startingFret = pressed.length > 0 ? Math.min(...pressed) : 1;
      collected.push({
        frets: [...current],
        startingFret,
        barres: detectBarres(current),
        mutedStrings: current.reduce<number[]>((a, f, i) => (f === -1 ? [...a, i] : a), []),
      });
      return;
    }

    for (const fret of validFretsPerString[strIdx]) {
      // Pruning: check span won't exceed maxSpan
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

  // Deduplicate
  const seen = new Set<string>();
  const unique = collected.filter(v => {
    const key = v.frets.join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort: by startingFret, then fewest muted strings
  unique.sort((a, b) =>
    a.startingFret !== b.startingFret
      ? a.startingFret - b.startingFret
      : a.mutedStrings.length - b.mutedStrings.length
  );

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
  if (start !== -1 && end > start) {
    return [{ fret: minFret, startString: start, endString: end }];
  }
  return [];
}
