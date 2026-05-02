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
  // ── Sus com sétima ───────────────────────────────────────────────────────
  '7sus2':    { intervals: [0, 2, 7, 10],           name: 'Dominante 7 Sus2' },
  '7sus4':    { intervals: [0, 5, 7, 10],           name: 'Dominante 7 Sus4' },
  '9sus4':    { intervals: [0, 5, 7, 10, 2],        name: 'Dominante 9 Sus4' },
  '13sus4':   { intervals: [0, 5, 7, 10, 2, 9],     name: 'Dominante 13 Sus4' },
  // ── Alterados / Jazz ─────────────────────────────────────────────────────
  '7b5':      { intervals: [0, 4, 6, 10],           name: 'Dominante 7(b5)' },
  '7#5':      { intervals: [0, 4, 8, 10],           name: 'Dominante 7(#5)' },
  '7b9':      { intervals: [0, 4, 7, 10, 1],        name: 'Dominante 7(b9)' },
  '7#9':      { intervals: [0, 4, 7, 10, 3],        name: 'Dominante 7(#9)' },
  '7b9b13':   { intervals: [0, 4, 7, 10, 1, 8],     name: 'Dominante 7(b9b13)' },
  '7#9b13':   { intervals: [0, 4, 7, 10, 3, 8],     name: 'Dominante 7(#9b13)' },
  '7b9#9':    { intervals: [0, 4, 7, 10, 1, 3],     name: 'Dominante 7(b9#9)' },
  '7b9#11':   { intervals: [0, 4, 7, 10, 1, 6],     name: 'Dominante 7(b9#11)' },
  '7#9#11':   { intervals: [0, 4, 7, 10, 3, 6],     name: 'Dominante 7(#9#11)' },
  '7#11':     { intervals: [0, 4, 7, 10, 6],        name: 'Dominante 7(#11)' },
  '7b13':     { intervals: [0, 4, 7, 10, 8],        name: 'Dominante 7(b13)' },
  '7#5b9':    { intervals: [0, 4, 8, 10, 1],        name: 'Dominante 7(#5b9)' },
  '7#5#9':    { intervals: [0, 4, 8, 10, 3],        name: 'Dominante 7(#5#9)' },
  '7alt':     { intervals: [0, 4, 7, 10, 1, 3, 8],  name: 'Dominante 7 Alt' },
  '9b13':     { intervals: [0, 4, 7, 10, 2, 8],     name: 'Dominante 9(b13)' },
  '9#11':     { intervals: [0, 4, 7, 10, 2, 6],     name: 'Dominante 9(#11)' },
  '13b9':     { intervals: [0, 4, 7, 10, 1, 9],     name: 'Dominante 13(b9)' },
  '13#9':     { intervals: [0, 4, 7, 10, 3, 9],     name: 'Dominante 13(#9)' },
  '13#11':    { intervals: [0, 4, 7, 10, 2, 6, 9],  name: 'Dominante 13(#11)' },
  // ── Maior com alterações ──────────────────────────────────────────────────
  'maj7#5':   { intervals: [0, 4, 8, 11],           name: 'Maior 7(#5)' },
  'maj7#11':  { intervals: [0, 4, 7, 11, 6],        name: 'Maior 7(#11)' },
  'maj9#11':  { intervals: [0, 4, 7, 11, 2, 6],     name: 'Maior 9(#11)' },
  // ── Menor com alterações ──────────────────────────────────────────────────
  'mmaj7':    { intervals: [0, 3, 7, 11],           name: 'Menor com Maior 7' },
  'mmaj9':    { intervals: [0, 3, 7, 11, 2],        name: 'Menor com Maior 9' },
  'm7#5':     { intervals: [0, 3, 8, 10],           name: 'Menor 7(#5)' },
  'madd9':    { intervals: [0, 3, 7, 2],            name: 'Menor Add9' },
  'm6/9':     { intervals: [0, 3, 7, 9, 2],         name: 'Menor 6/9' },
  'm(b5)':    { intervals: [0, 3, 6, 10],           name: 'Menor 7b5 (ø)' },  // BR
  // ── Décimas ──────────────────────────────────────────────────────────────
  '11':       { intervals: [0, 4, 7, 10, 2, 5],     name: 'Dominante 11' },
  'm11':      { intervals: [0, 3, 7, 10, 2, 5],     name: 'Menor 11' },
  'maj11':    { intervals: [0, 4, 7, 11, 2, 5],     name: 'Maior 11' },
  '13':       { intervals: [0, 4, 7, 10, 2, 9],     name: 'Dominante 13' },
  'm13':      { intervals: [0, 3, 7, 10, 2, 5, 9],  name: 'Menor 13' },
  'maj13':    { intervals: [0, 4, 7, 11, 2, 9],     name: 'Maior 13' },
};


export interface ParsedChord {
  root: string;
  quality: string;
  qualityName: string;
  noteIndices: number[];   // all required notes (includes bass if slash chord)
  bassNoteIndex?: number;  // for slash chords like E/G#, C/G
  displayName: string;
}

export function parseChord(input: string): ParsedChord | null {
  if (!input.trim()) return null;

  // Detect slash chord: split on last '/' that is NOT part of chord quality
  // e.g. "C/G" → chord="C", bass="G" | "m6/9" → chord="m6/9", no slash
  // Strategy: look for /<Note> at the end
  const slashMatch = input.trim().match(/^(.+)\/([A-G][b#]?)$/);
  let chordPart = input.trim();
  let bassNote: string | undefined;

  if (slashMatch) {
    // Validate: left side must be a valid chord
    const leftRoot = slashMatch[1].match(/^([A-G][b#]?)/);
    if (leftRoot) {
      const leftQuality = slashMatch[1].slice(leftRoot[1].length);
      // Only treat as slash chord if left quality is valid
      if (leftQuality in CHORD_FORMULAS || leftQuality === '') {
        chordPart = slashMatch[1];
        bassNote = slashMatch[2];
      }
    }
  }

  const rootMatch = chordPart.match(/^([A-G][b#]?)/);
  if (!rootMatch) return null;

  const root = rootMatch[1];
  const quality = chordPart.slice(root.length);
  const formula = CHORD_FORMULAS[quality];
  if (!formula) return null;

  const rootIndex = getNoteIndex(root);
  if (rootIndex === -1) return null;

  const noteIndices = [...new Set(formula.intervals.map(i => (rootIndex + i) % 12))];

  let bassNoteIndex: number | undefined;
  if (bassNote) {
    const bi = getNoteIndex(bassNote);
    if (bi === -1) return null;
    bassNoteIndex = bi;
    // Ensure bass note is in the required notes
    if (!noteIndices.includes(bi)) noteIndices.push(bi);
  }

  const displayBass = bassNote ? `/${bassNote}` : '';
  return {
    root, quality, qualityName: formula.name,
    noteIndices, bassNoteIndex,
    displayName: `${root}${quality}${displayBass}`,
  };
}

export const INSTRUMENT_PRESETS: Record<string, { label: string; tuning: string[]; strings: number }> = {
  violao:     { label: 'Violão / Guitarra (6)', tuning: ['E', 'A', 'D', 'G', 'B', 'E'], strings: 6 },
  ukulele:    { label: 'Ukulele (4)',            tuning: ['G', 'C', 'E', 'A'],            strings: 4 },
  cavaquinho: { label: 'Cavaquinho (4)',          tuning: ['D', 'G', 'B', 'D'],            strings: 4 },
};
