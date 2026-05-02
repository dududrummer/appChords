import { parseChord } from './music-theory';

export interface ChordBeat {
  chordName: string;
  valid: boolean;
  durationBeats: number;
}

export interface Measure {
  index: number;
  beats: ChordBeat[];
}

/**
 * Parse a progression string like:
 * "C7M | Em7 | Gm7 C7 | F7M Fm6 || D7 | Dm7 G7"
 *
 * Rules:
 * - | = single bar line (1 measure)
 * - || = double bar = chord lasts 2 full measures
 * - Multiple chords in a measure divide beats equally (2 chords = 2 beats each in 4/4)
 */
export function parseProgression(input: string, beatsPerMeasure = 4): Measure[] {
  if (!input.trim()) return [];

  // Normalise double bars: "||" → special placeholder
  const parts = input.trim()
    .replace(/\|\|/g, '|__DOUBLE__|')
    .split('|')
    .map(s => s.trim());

  const measures: Measure[] = [];
  let idx = 0;
  let lastBeats: ChordBeat[] | null = null;

  for (const part of parts) {
    if (part === '__DOUBLE__') {
      // Repeat previous measure content for 1 extra measure
      if (lastBeats) {
        measures.push({ index: idx++, beats: lastBeats.map(b => ({ ...b })) });
      }
      continue;
    }

    const names = part.split(/\s+/).filter(Boolean);
    if (names.length === 0) continue;

    const dur = beatsPerMeasure / names.length;
    const beats: ChordBeat[] = names.map(name => ({
      chordName: name,
      valid: parseChord(name) !== null,
      durationBeats: dur,
    }));

    measures.push({ index: idx++, beats });
    lastBeats = beats;
  }

  return measures;
}

/** All unique chord names from a progression */
export function uniqueChords(measures: Measure[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const m of measures) {
    for (const b of m.beats) {
      if (!seen.has(b.chordName)) {
        seen.add(b.chordName);
        result.push(b.chordName);
      }
    }
  }
  return result;
}
