/**
 * Pre-defined progression templates in Roman numeral degrees,
 * organized by category, with transposition logic.
 */

// ── Templates ───────────────────────────────────────────────────────────────
export interface ProgressionTemplate {
  id: string;
  name: string;
  category: 'Maiores' | 'Menores' | 'Dissonantes';
  degrees: string;
}

export const CATEGORIES = ['Maiores', 'Menores', 'Dissonantes'] as const;
export type Category = typeof CATEGORIES[number];

export const PROGRESSION_TEMPLATES: ProgressionTemplate[] = [
  // ── Cadências Maiores ───────────────────────────────────────────────────
  { id: 'maior-1',     category: 'Maiores', name: 'Cadência 1',            degrees: 'I | VI7 | IIm | V7' },
  { id: 'maior-q2',    category: 'Maiores', name: 'Cadência Quadrada 2',   degrees: 'I | IIIm | IV | V7' },
  { id: 'maior-q3',    category: 'Maiores', name: 'Cadência Quadrada 3',   degrees: 'I | I7 | IV | V7' },
  { id: 'maior-1-ext', category: 'Maiores', name: 'Cadência Maior 1 (Extensa)', degrees: 'I | I | VIIm7(b5) | III7 | VIm | VIm | Vm | I7 | IV | V7 | I' },
  { id: 'maior-2',     category: 'Maiores', name: 'Cadência Maior 2',      degrees: 'I | VIIm7(b5) III7 | VIm | Vm I7 | IV | IVm | IIIm | VI7 | IIm | V7 | I' },
  { id: 'maior-3',     category: 'Maiores', name: 'Cadência Maior 3',      degrees: 'I | VI7 | IIm | V7 | Vm I7 | IV | IVm | IIIm | VI7 | IIm | V7 | I' },
  { id: 'maior-4',     category: 'Maiores', name: 'Cadência Maior 4',      degrees: 'I | IIIm | Vm I7 | IV | IVm | IIIm | VI7 | II7 | IIm | V7 | I' },
  { id: 'maior-5',     category: 'Maiores', name: 'Cadência Maior 5',      degrees: 'I | I | V | V | VIm | VIm | IIIm | IIIm | IV | IIIm | IIm | V7' },
  { id: 'maior-6',     category: 'Maiores', name: 'Cadência Maior 6',      degrees: 'I | I | V | III7 | VIm | VIm | IV | V7' },

  // ── Cadências Menores ──────────────────────────────────────────────────
  { id: 'menor-1',     category: 'Menores', name: 'Cadência Menor 1',      degrees: 'Im | III7 | VI | V7' },
  { id: 'menor-2',     category: 'Menores', name: 'Cadência Menor 2',      degrees: 'Im | Im | VIIm | III7 | VI | VI | IIm7(b5) | V7' },
  { id: 'menor-3',     category: 'Menores', name: 'Cadência Menor 3',      degrees: 'Im | I7 | IVm | V7' },
  { id: 'menor-4',     category: 'Menores', name: 'Cadência Menor 4',      degrees: 'Im | I7 | IVm | VII7 | III | VI | IIm7(b5) | V7' },
  { id: 'menor-5',     category: 'Menores', name: 'Cadência Menor 5',      degrees: 'Im | Im | VIIm | III7 | VI | bII | IIm7(b5) | V7' },
  { id: 'menor-6',     category: 'Menores', name: 'Cadência Menor 6',      degrees: 'Im | III7 | VI | V7 | Im | I7 | IVm | VII7 | III | VI | IIm7(b5) | V7' },

  // ── Cadências Dissonantes ─────────────────────────────────────────────
  { id: 'dissonante-menor-base', category: 'Dissonantes', name: 'Sequência Dissonante Menor Base', degrees: 'Im7(9) | I7 | IVm7(9) | VII7 | III7M | VI7M | IIm7(b5) | V7(13)' },
];

// ── Key options ─────────────────────────────────────────────────────────────
export interface KeyOption {
  label: string;
  value: string;
  isMinor: boolean;
}

export const KEY_OPTIONS: KeyOption[] = [
  { label: 'C  (Dó maior)',    value: 'C',  isMinor: false },
  { label: 'Db (Réb maior)',   value: 'Db', isMinor: false },
  { label: 'D  (Ré maior)',    value: 'D',  isMinor: false },
  { label: 'Eb (Mib maior)',   value: 'Eb', isMinor: false },
  { label: 'E  (Mi maior)',    value: 'E',  isMinor: false },
  { label: 'F  (Fá maior)',    value: 'F',  isMinor: false },
  { label: 'F# (Fá# maior)',   value: 'F#', isMinor: false },
  { label: 'G  (Sol maior)',   value: 'G',  isMinor: false },
  { label: 'Ab (Láb maior)',   value: 'Ab', isMinor: false },
  { label: 'A  (Lá maior)',    value: 'A',  isMinor: false },
  { label: 'Bb (Sib maior)',   value: 'Bb', isMinor: false },
  { label: 'B  (Si maior)',    value: 'B',  isMinor: false },
  { label: 'Cm  (Dó menor)',   value: 'Cm',  isMinor: true },
  { label: 'C#m (Dó# menor)',  value: 'C#m', isMinor: true },
  { label: 'Dm  (Ré menor)',   value: 'Dm',  isMinor: true },
  { label: 'Ebm (Mib menor)',  value: 'Ebm', isMinor: true },
  { label: 'Em  (Mi menor)',   value: 'Em',  isMinor: true },
  { label: 'Fm  (Fá menor)',   value: 'Fm',  isMinor: true },
  { label: 'F#m (Fá# menor)',  value: 'F#m', isMinor: true },
  { label: 'Gm  (Sol menor)',  value: 'Gm',  isMinor: true },
  { label: 'G#m (Sol# menor)', value: 'G#m', isMinor: true },
  { label: 'Am  (Lá menor)',   value: 'Am',  isMinor: true },
  { label: 'Bbm (Sib menor)',  value: 'Bbm', isMinor: true },
  { label: 'Bm  (Si menor)',   value: 'Bm',  isMinor: true },
];

// ── Scale degree notes per key ──────────────────────────────────────────────
const SCALE_NOTES: Record<string, string[]> = {
  'C':['C','D','E','F','G','A','B'], 'Db':['Db','Eb','F','Gb','Ab','Bb','C'],
  'D':['D','E','F#','G','A','B','C#'], 'Eb':['Eb','F','G','Ab','Bb','C','D'],
  'E':['E','F#','G#','A','B','C#','D#'], 'F':['F','G','A','Bb','C','D','E'],
  'F#':['F#','G#','A#','B','C#','D#','F'], 'G':['G','A','B','C','D','E','F#'],
  'Ab':['Ab','Bb','C','Db','Eb','F','G'], 'A':['A','B','C#','D','E','F#','G#'],
  'Bb':['Bb','C','D','Eb','F','G','A'], 'B':['B','C#','D#','E','F#','G#','A#'],
  'Cm':['C','D','Eb','F','G','Ab','Bb'], 'C#m':['C#','D#','E','F#','G#','A','B'],
  'Dm':['D','E','F','G','A','Bb','C'], 'Ebm':['Eb','F','Gb','Ab','Bb','B','Db'],
  'Em':['E','F#','G','A','B','C','D'], 'Fm':['F','G','Ab','Bb','C','Db','Eb'],
  'F#m':['F#','G#','A','B','C#','D','E'], 'Gm':['G','A','Bb','C','D','Eb','F'],
  'G#m':['G#','A#','B','C#','D#','E','F#'], 'Am':['A','B','C','D','E','F','G'],
  'Bbm':['Bb','C','Db','Eb','F','Gb','Ab'], 'Bm':['B','C#','D','E','F#','G','A'],
};

// ── Transposition ───────────────────────────────────────────────────────────
const ROMAN_TO_INDEX: Record<string, number> = {
  'I':0, 'II':1, 'III':2, 'IV':3, 'V':4, 'VI':5, 'VII':6,
};
const DEGREE_RE = /^([b#]?)(VII|VI|IV|V|III|II|I)(.*)$/;
const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const FLAT_NAMES = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const ENHARMONIC: Record<string,string> = {
  'Db':'C#','Eb':'D#','Fb':'E','Gb':'F#','Ab':'G#','Bb':'A#','Cb':'B',
};

function transposeDegree(degree: string, key: string): string {
  const m = degree.match(DEGREE_RE);
  if (!m) return degree;
  const [, acc, roman, quality] = m;
  const notes = SCALE_NOTES[key];
  if (!notes) return degree;
  const idx = ROMAN_TO_INDEX[roman];
  if (idx === undefined) return degree;
  let note = notes[idx];
  if (acc === 'b' || acc === '#') {
    const norm = ENHARMONIC[note] ?? note;
    const ci = CHROMATIC.indexOf(norm);
    if (ci !== -1) {
      const shift = acc === 'b' ? -1 : 1;
      const ni = (ci + shift + 12) % 12;
      note = acc === 'b' ? FLAT_NAMES[ni] : CHROMATIC[ni];
    }
  }
  return note + quality;
}

export function transposeDegrees(degreesStr: string, key: string): string {
  return degreesStr
    .split(/(\s*\|\s*)/)
    .map(part => {
      const trimmed = part.trim();
      if (trimmed === '|' || trimmed === '||' || trimmed === '') return part;
      return trimmed.split(/\s+/).map(t => transposeDegree(t, key)).join(' ');
    })
    .join('');
}
