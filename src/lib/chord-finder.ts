import { getNoteIndex, noteIndexAtFret } from './music-theory';

export interface Voicing {
  frets: number[];
  startingFret: number;
  barres: BarreDef[];
  mutedStrings: number[];
  omitted: string[];
  fingerCount: number;
}

export interface BarreDef {
  fret: number;
  startString: number;
  endString: number;
}

interface FindOptions {
  maxFret?: number;
  allowMuted?: boolean;
  maxSpan?: number;
  maxResults?: number;
  allowOmissions?: boolean;
  rootNoteIndex?: number;
  bassNoteIndex?: number;
  minBarreStrings?: number; // 2=violão (default), 3=cavaquinho
}

// ── Barre detection ───────────────────────────────────────────────────────────
function detectBarres(frets: number[], minBarreStrings = 2): BarreDef[] {
  const pressed = frets.map((f, i) => ({ f, i })).filter(x => x.f > 0);
  if (pressed.length < 2) return [];

  const barres: BarreDef[] = [];
  const fretValues = [...new Set(pressed.map(x => x.f))].sort((a, b) => a - b);

  for (const fretVal of fretValues) {
    // Find consecutive string runs at this fret
    const stringsAtFret = frets
      .map((f, i) => (f === fretVal ? i : -1))
      .filter(i => i !== -1);

    if (stringsAtFret.length < minBarreStrings) continue;

    // Check there's no muted string between first and last
    const first = stringsAtFret[0], last = stringsAtFret[stringsAtFret.length - 1];
    const hasMutedBetween = frets.slice(first, last + 1).some(f => f === -1);
    if (hasMutedBetween) continue;

    // All strings between first and last must be >= fretVal (can't play below a barre)
    const allPlayable = frets.slice(first, last + 1).every(f => f === 0 || f >= fretVal);
    if (!allPlayable) continue;

    barres.push({ fret: fretVal, startString: first, endString: last });
    break; // one barre per voicing is enough
  }
  return barres;
}

// ── Playability: count distinct fingers needed ────────────────────────────────
function countFingers(frets: number[], barres: BarreDef[]): number {
  // Which (string, fret) combos are covered by a barre
  const barredKeys = new Set<string>();
  for (const b of barres) {
    for (let s = b.startString; s <= b.endString; s++) {
      barredKeys.add(`${s},${b.fret}`);
    }
  }
  let count = barres.length;
  for (let i = 0; i < frets.length; i++) {
    if (frets[i] > 0 && !barredKeys.has(`${i},${frets[i]}`)) count++;
  }
  return count;
}

// ── Core search ───────────────────────────────────────────────────────────────
function findVoicingsForNotes(
  required: number[],
  tuning: string[],
  opts: Omit<FindOptions, 'allowOmissions' | 'rootNoteIndex'>,
  omitted: string[]
): Voicing[] {
  const { maxFret = 12, allowMuted = false, maxSpan = 4, minBarreStrings = 2 } = opts;
  const n = tuning.length;

  const validFrets: number[][] = tuning.map(note => {
    const base = getNoteIndex(note);
    if (base === -1) return [];
    const v: number[] = [];
    if (allowMuted) v.push(-1);
    for (let f = 0; f <= maxFret; f++) {
      if (required.includes(noteIndexAtFret(base, f))) v.push(f);
    }
    return v;
  });

  const collected: Voicing[] = [];

  function bt(si: number, cur: number[], cov: Set<number>) {
    if (collected.length >= 80) return;
    if (si === n) {
      if (!required.every(x => cov.has(x))) return;
      const pressed = cur.filter(f => f > 0);
      if (pressed.length >= 2 && Math.max(...pressed) - Math.min(...pressed) > maxSpan) return;
      const barres = detectBarres(cur, minBarreStrings);
      const fingers = countFingers(cur, barres);
      if (fingers > 4) return; // physically impossible
      const sf = pressed.length > 0 ? Math.min(...pressed) : 1;
      collected.push({
        frets: [...cur], startingFret: sf, barres,
        mutedStrings: cur.reduce<number[]>((a, f, i) => f === -1 ? [...a, i] : a, []),
        omitted, fingerCount: fingers,
      });
      return;
    }
    for (const f of validFrets[si]) {
      const pressed = [...cur.filter(x => x > 0), ...(f > 0 ? [f] : [])];
      if (pressed.length >= 2 && Math.max(...pressed) - Math.min(...pressed) > maxSpan) continue;
      const nc = new Set(cov);
      if (f >= 0) {
        const base = getNoteIndex(tuning[si]);
        if (base !== -1) nc.add(noteIndexAtFret(base, f));
      }
      cur.push(f); bt(si + 1, cur, nc); cur.pop();
    }
  }

  bt(0, [], new Set());
  return collected;
}

// ── Public API ────────────────────────────────────────────────────────────────
export function findVoicings(
  noteIndices: number[],
  tuning: string[],
  options: FindOptions = {}
): Voicing[] {
  const { allowOmissions = false, rootNoteIndex, bassNoteIndex, maxResults = 12, ...rest } = options;
  const allRaw: Voicing[] = [];

  allRaw.push(...findVoicingsForNotes(noteIndices, tuning, rest, []));

  if (allowOmissions && rootNoteIndex !== undefined) {
    const fifth = (rootNoteIndex + 7) % 12;
    const hasFifth = noteIndices.includes(fifth);
    const isBassRoot = bassNoteIndex === rootNoteIndex;
    const isBassFifth = bassNoteIndex === fifth;

    if (hasFifth && !isBassFifth) {
      const noFifth = noteIndices.filter(n => n !== fifth);
      allRaw.push(...findVoicingsForNotes(noFifth, tuning, rest, ['s/ 5ª']));
      const noFifthNoRoot = noFifth.filter(n => n !== rootNoteIndex);
      if (noFifthNoRoot.length > 0 && !isBassRoot)
        allRaw.push(...findVoicingsForNotes(noFifthNoRoot, tuning, rest, ['s/ 5ª', 's/ fund.']));
    }
    if (!isBassRoot) {
      const noRoot = noteIndices.filter(n => n !== rootNoteIndex);
      if (noRoot.length > 0)
        allRaw.push(...findVoicingsForNotes(noRoot, tuning, rest, ['s/ fund.']));
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  let unique = allRaw.filter(v => {
    const k = v.frets.join(',');
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });

  // Filter by bass note
  if (bassNoteIndex !== undefined) {
    unique = unique.filter(v => {
      const li = v.frets.findIndex(f => f !== -1);
      if (li === -1) return false;
      const base = getNoteIndex(tuning[li]);
      return base !== -1 && noteIndexAtFret(base, v.frets[li]) === bassNoteIndex;
    });
  }

  // Sort: full chord > fewer fingers > lower fret
  unique.sort((a, b) => {
    if (a.omitted.length !== b.omitted.length) return a.omitted.length - b.omitted.length;
    if (a.fingerCount !== b.fingerCount) return a.fingerCount - b.fingerCount;
    return a.startingFret - b.startingFret;
  });

  return unique.slice(0, maxResults);
}
