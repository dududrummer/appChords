/**
 * Pre-defined progression templates in Roman numeral degrees
 * and transposition logic to convert degrees → actual chord names.
 */

// ── Templates ───────────────────────────────────────────────────────────────
export interface ProgressionTemplate {
  id: string;
  name: string;
  category: string;
  degrees: string; // e.g. "Im7(9) | I7 | IVm7(9) | ..."
}

export const PROGRESSION_TEMPLATES: ProgressionTemplate[] = [
  {
    id: 'dissonante-menor-base',
    name: 'Sequência Dissonante Menor Base',
    category: 'Cadências Dissonantes',
    degrees: 'Im7(9) | I7 | IVm7(9) | VII7 | III7M | VI7M | IIm7(b5) | V7(13)',
  },
];

// ── Key options ─────────────────────────────────────────────────────────────
export interface KeyOption {
  label: string;
  value: string;
  isMinor: boolean;
}

export const KEY_OPTIONS: KeyOption[] = [
  // Maiores
  { label: 'C  (Dó maior)',   value: 'C',  isMinor: false },
  { label: 'Db (Réb maior)',  value: 'Db', isMinor: false },
  { label: 'D  (Ré maior)',   value: 'D',  isMinor: false },
  { label: 'Eb (Mib maior)',  value: 'Eb', isMinor: false },
  { label: 'E  (Mi maior)',   value: 'E',  isMinor: false },
  { label: 'F  (Fá maior)',   value: 'F',  isMinor: false },
  { label: 'F# (Fá# maior)', value: 'F#', isMinor: false },
  { label: 'G  (Sol maior)',  value: 'G',  isMinor: false },
  { label: 'Ab (Láb maior)',  value: 'Ab', isMinor: false },
  { label: 'A  (Lá maior)',   value: 'A',  isMinor: false },
  { label: 'Bb (Sib maior)',  value: 'Bb', isMinor: false },
  { label: 'B  (Si maior)',   value: 'B',  isMinor: false },
  // Menores
  { label: 'Cm  (Dó menor)',  value: 'Cm',  isMinor: true },
  { label: 'C#m (Dó# menor)', value: 'C#m', isMinor: true },
  { label: 'Dm  (Ré menor)',  value: 'Dm',  isMinor: true },
  { label: 'Ebm (Mib menor)', value: 'Ebm', isMinor: true },
  { label: 'Em  (Mi menor)',  value: 'Em',  isMinor: true },
  { label: 'Fm  (Fá menor)',  value: 'Fm',  isMinor: true },
  { label: 'F#m (Fá# menor)', value: 'F#m', isMinor: true },
  { label: 'Gm  (Sol menor)', value: 'Gm',  isMinor: true },
  { label: 'G#m (Sol# menor)',value: 'G#m', isMinor: true },
  { label: 'Am  (Lá menor)',  value: 'Am',  isMinor: true },
  { label: 'Bbm (Sib menor)', value: 'Bbm', isMinor: true },
  { label: 'Bm  (Si menor)',  value: 'Bm',  isMinor: true },
];

// ── Scale degree notes per key ──────────────────────────────────────────────
// Index 0=I, 1=II, 2=III, 3=IV, 4=V, 5=VI, 6=VII
const SCALE_NOTES: Record<string, string[]> = {
  // Major keys
  'C':  ['C','D','E','F','G','A','B'],
  'Db': ['Db','Eb','F','Gb','Ab','Bb','C'],
  'D':  ['D','E','F#','G','A','B','C#'],
  'Eb': ['Eb','F','G','Ab','Bb','C','D'],
  'E':  ['E','F#','G#','A','B','C#','D#'],
  'F':  ['F','G','A','Bb','C','D','E'],
  'F#': ['F#','G#','A#','B','C#','D#','F'],
  'G':  ['G','A','B','C','D','E','F#'],
  'Ab': ['Ab','Bb','C','Db','Eb','F','G'],
  'A':  ['A','B','C#','D','E','F#','G#'],
  'Bb': ['Bb','C','D','Eb','F','G','A'],
  'B':  ['B','C#','D#','E','F#','G#','A#'],
  // Minor keys (natural minor)
  'Cm':  ['C','D','Eb','F','G','Ab','Bb'],
  'C#m': ['C#','D#','E','F#','G#','A','B'],
  'Dm':  ['D','E','F','G','A','Bb','C'],
  'Ebm': ['Eb','F','Gb','Ab','Bb','B','Db'],
  'Em':  ['E','F#','G','A','B','C','D'],
  'Fm':  ['F','G','Ab','Bb','C','Db','Eb'],
  'F#m': ['F#','G#','A','B','C#','D','E'],
  'Gm':  ['G','A','Bb','C','D','Eb','F'],
  'G#m': ['G#','A#','B','C#','D#','E','F#'],
  'Am':  ['A','B','C','D','E','F','G'],
  'Bbm': ['Bb','C','Db','Eb','F','Gb','Ab'],
  'Bm':  ['B','C#','D','E','F#','G','A'],
};

// ── Roman numeral → degree index ────────────────────────────────────────────
const ROMAN_TO_INDEX: Record<string, number> = {
  'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5, 'VII': 6,
};

const DEGREE_RE = /^([b#]?)(VII|VI|IV|V|III|II|I)(.*)$/;

/**
 * Transpose a single degree token like "Im7(9)" into "Cm7(9)" given key "Cm".
 */
function transposeDegree(degree: string, key: string): string {
  const m = degree.match(DEGREE_RE);
  if (!m) return degree; // not a degree token, return as-is

  const [, accidental, roman, quality] = m;
  const scaleNotes = SCALE_NOTES[key];
  if (!scaleNotes) return degree;

  const idx = ROMAN_TO_INDEX[roman];
  if (idx === undefined) return degree;

  let note = scaleNotes[idx];

  // Handle accidentals (b/# before the Roman numeral)
  if (accidental === 'b') {
    const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const ENHARMONIC: Record<string, string> = {
      'Db':'C#','Eb':'D#','Fb':'E','Gb':'F#','Ab':'G#','Bb':'A#','Cb':'B',
    };
    const norm = ENHARMONIC[note] ?? note;
    const ci = CHROMATIC.indexOf(norm);
    if (ci !== -1) {
      const newIdx = (ci - 1 + 12) % 12;
      // Pick flat name if original used flats
      const FLAT_NAMES = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
      note = FLAT_NAMES[newIdx];
    }
  } else if (accidental === '#') {
    const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const ENHARMONIC: Record<string, string> = {
      'Db':'C#','Eb':'D#','Fb':'E','Gb':'F#','Ab':'G#','Bb':'A#','Cb':'B',
    };
    const norm = ENHARMONIC[note] ?? note;
    const ci = CHROMATIC.indexOf(norm);
    if (ci !== -1) {
      note = CHROMATIC[(ci + 1) % 12];
    }
  }

  return note + quality;
}

/**
 * Transpose a full degree progression string to actual chord names.
 * e.g. "Im7(9) | I7 | IVm7(9)" + key "Cm" → "Cm7(9) | C7 | Fm7(9)"
 */
export function transposeDegrees(degreesStr: string, key: string): string {
  return degreesStr
    .split(/(\s*\|\s*)/) // keep the separators
    .map(part => {
      const trimmed = part.trim();
      if (trimmed === '|' || trimmed === '||' || trimmed === '') return part;
      // Could be multiple chords in one measure separated by spaces
      return trimmed
        .split(/\s+/)
        .map(token => transposeDegree(token, key))
        .join(' ');
    })
    .join('');
}
