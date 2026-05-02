// Note system and chord theory

export const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

const ENHARMONIC_MAP: Record<string, string> = {
  Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Bb: 'A#', Cb: 'B',
  'E#': 'F', 'B#': 'C',
};

export function normalizeNote(note: string): string {
  return ENHARMONIC_MAP[note] ?? note;
}

export function getNoteIndex(note: string): number {
  const normalized = normalizeNote(note);
  return CHROMATIC_NOTES.indexOf(normalized as typeof CHROMATIC_NOTES[number]);
}

export function noteIndexAtFret(openNoteIndex: number, fret: number): number {
  return (openNoteIndex + fret) % 12;
}

export const CHORD_FORMULAS: Record<string, { intervals: number[]; name: string }> = {
  // ── Tríades ──────────────────────────────────────────────────────────────
  '':       { intervals: [0, 4, 7],                 name: 'Maior' },
  'M':      { intervals: [0, 4, 7],                 name: 'Maior' },
  'maj':    { intervals: [0, 4, 7],                 name: 'Maior' },
  'm':      { intervals: [0, 3, 7],                 name: 'Menor' },
  'min':    { intervals: [0, 3, 7],                 name: 'Menor' },
  'dim':    { intervals: [0, 3, 6],                 name: 'Diminuto' },
  'aug':    { intervals: [0, 4, 8],                 name: 'Aumentado' },
  'aum':    { intervals: [0, 4, 8],                 name: 'Aumentado' },   // BR
  '+':      { intervals: [0, 4, 8],                 name: 'Aumentado' },
  '5':      { intervals: [0, 7],                    name: 'Power Chord' },
  // ── Suspensas ─────────────────────────────────────────────────────────────
  'sus2':   { intervals: [0, 2, 7],                 name: 'Sus2' },
  'sus4':   { intervals: [0, 5, 7],                 name: 'Sus4' },
  // ── Sétimas ──────────────────────────────────────────────────────────────
  '7':      { intervals: [0, 4, 7, 10],             name: 'Dominante 7' },
  'maj7':   { intervals: [0, 4, 7, 11],             name: 'Maior 7' },
  'M7':     { intervals: [0, 4, 7, 11],             name: 'Maior 7' },
  '7M':     { intervals: [0, 4, 7, 11],             name: 'Maior 7' },     // BR
  'm7':     { intervals: [0, 3, 7, 10],             name: 'Menor 7' },
  'min7':   { intervals: [0, 3, 7, 10],             name: 'Menor 7' },
  'dim7':   { intervals: [0, 3, 6, 9],              name: 'Diminuto 7' },
  'm7b5':   { intervals: [0, 3, 6, 10],             name: 'Menor 7b5 (ø)' },
  'm(b5)':  { intervals: [0, 3, 6, 10],             name: 'Menor 7b5 (ø)' }, // BR
  'mmaj7':  { intervals: [0, 3, 7, 11],             name: 'Menor com Maior 7' },
  // ── Sextas ───────────────────────────────────────────────────────────────
  '6':      { intervals: [0, 4, 7, 9],              name: 'Maior 6' },
  'm6':     { intervals: [0, 3, 7, 9],              name: 'Menor 6' },
  '6/9':    { intervals: [0, 4, 7, 9, 2],           name: 'Maior 6/9' },
  // ── Nonas ────────────────────────────────────────────────────────────────
  '9':      { intervals: [0, 4, 7, 10, 2],          name: 'Dominante 9' },
  'maj9':   { intervals: [0, 4, 7, 11, 2],          name: 'Maior 9' },
  '9M':     { intervals: [0, 4, 7, 11, 2],          name: 'Maior 9' },     // BR
  'm9':     { intervals: [0, 3, 7, 10, 2],          name: 'Menor 9' },
  'add9':   { intervals: [0, 4, 7, 2],              name: 'Add9' },
  'com9':   { intervals: [0, 4, 7, 2],              name: 'Add9' },        // BR
  // ── Alterados / Jazz ─────────────────────────────────────────────────────
  '7b9':    { intervals: [0, 4, 7, 10, 1],          name: 'Dominante 7(b9)' },
  '7#9':    { intervals: [0, 4, 7, 10, 3],          name: 'Dominante 7(#9)' },
  '7#11':   { intervals: [0, 4, 7, 10, 6],          name: 'Dominante 7(#11)' },
  '9#11':   { intervals: [0, 4, 7, 10, 2, 6],       name: 'Dominante 9(#11)' },
  '7b9#11': { intervals: [0, 4, 7, 10, 1, 6],       name: 'Dominante 7(b9#11)' },
  '7b13':   { intervals: [0, 4, 7, 10, 8],          name: 'Dominante 7(b13)' },
  '7alt':   { intervals: [0, 4, 7, 10, 1, 3, 8],    name: 'Dominante 7 alt' },
  'maj7#11':{ intervals: [0, 4, 7, 11, 6],          name: 'Maior 7(#11)' },
  // ── Décimas ──────────────────────────────────────────────────────────────
  '11':     { intervals: [0, 4, 7, 10, 2, 5],       name: 'Dominante 11' },
  'm11':    { intervals: [0, 3, 7, 10, 2, 5],       name: 'Menor 11' },
  '13':     { intervals: [0, 4, 7, 10, 2, 9],       name: 'Dominante 13' },
  'm13':    { intervals: [0, 3, 7, 10, 2, 5, 9],    name: 'Menor 13' },
  'maj13':  { intervals: [0, 4, 7, 11, 2, 9],       name: 'Maior 13' },
};


export interface ParsedChord {
  root: string;
  quality: string;
  qualityName: string;
  noteIndices: number[];
  displayName: string;
}

export function parseChord(input: string): ParsedChord | null {
  if (!input.trim()) return null;
  const rootMatch = input.trim().match(/^([A-G][b#]?)/);
  if (!rootMatch) return null;

  const root = rootMatch[1];
  const quality = input.trim().slice(root.length);
  const formula = CHORD_FORMULAS[quality];
  if (!formula) return null;

  const rootIndex = getNoteIndex(root);
  if (rootIndex === -1) return null;

  const noteIndices = [...new Set(formula.intervals.map(i => (rootIndex + i) % 12))];

  return { root, quality, qualityName: formula.name, noteIndices, displayName: `${root}${quality}` };
}

export const INSTRUMENT_PRESETS: Record<string, { label: string; tuning: string[]; strings: number }> = {
  violao:     { label: 'Violão / Guitarra (6)', tuning: ['E', 'A', 'D', 'G', 'B', 'E'], strings: 6 },
  ukulele:    { label: 'Ukulele (4)',            tuning: ['G', 'C', 'E', 'A'],            strings: 4 },
  cavaquinho: { label: 'Cavaquinho (4)',          tuning: ['D', 'G', 'B', 'D'],            strings: 4 },
};
