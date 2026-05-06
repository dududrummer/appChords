import fs from 'fs';
import path from 'path';
import { findVoicings } from './src/lib/chord-finder';
import { parseChord, INSTRUMENT_PRESETS } from './src/lib/music-theory';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const QUALITIES = [
  '', 'm', '7', 'm7', '7M', 'm7b5', 'dim', '6', 'm6', '6/9', '9', 'm9', '7/13', '7/b13', 'sus4', '7/4', '5+', 'm7M'
];

const dict: Record<string, any[]> = {};
const tuning = INSTRUMENT_PRESETS.cavaquinho.tuning;

for (const note of NOTES) {
  for (const quality of QUALITIES) {
    const chordName = `${note}${quality}`;
    const parsed = parseChord(chordName);
    if (!parsed) continue;

    // Use findVoicings with cavaquinho constraints
    const voicings = findVoicings(parsed.noteIndices, tuning, {
      maxFret: 14,
      maxResults: 16,
      maxInternalResults: 300,
      allowOmissions: true,
      rootNoteIndex: parsed.noteIndices[0],
      bassNoteIndex: parsed.bassNoteIndex,
      minBarreStrings: 3
    });

    if (voicings.length > 0) {
      // Get best shapes (up to 8)
      dict[chordName] = voicings.slice(0, 8).map(v => ({
        chordName,
        frets: v.frets
      }));

      // Add inverted bass shapes for cavaquinho
      const finalShapes = [...dict[chordName]];
      for (const v of dict[chordName]) {
        if (v.frets[0] !== v.frets[3] && v.frets[0] !== -1 && v.frets[3] !== -1) {
          const inverted = [v.frets[3], v.frets[1], v.frets[2], v.frets[0]];
          const exists = finalShapes.some(s => s.frets.join(',') === inverted.join(','));
          if (!exists) {
            finalShapes.push({ chordName, frets: inverted });
          }
        }
      }
      dict[chordName] = finalShapes;
    }
  }
}

const outputPath = path.join(process.cwd(), 'src', 'config', 'cavaquinho-dictionary.json');
fs.writeFileSync(outputPath, JSON.stringify(dict, null, 2));
console.log(`Generated dictionary with ${Object.keys(dict).length} chords!`);
