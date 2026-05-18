import fs from 'fs';
import { parseChord, getNoteIndex, CHROMATIC_NOTES } from './src/lib/music-theory';

const dictPath = './src/config/cavaquinho-dictionary.json';
const dictRaw = fs.readFileSync(dictPath, 'utf8');
const dict = JSON.parse(dictRaw);

const TUNING = ['D', 'G', 'B', 'D'];
const tuningIndices = TUNING.map(getNoteIndex);

const arpeggioDict: Record<string, any[]> = {};

function noteIndexAtFret(openNoteIndex: number, fret: number): number {
  return (openNoteIndex + fret) % 12;
}

for (const [chordName, voicings] of Object.entries(dict)) {
  const parsed = parseChord(chordName);
  if (!parsed) {
    console.warn(`Could not parse chord: ${chordName}`);
    continue;
  }
  
  const notes = new Set(parsed.noteIndices);
  
  arpeggioDict[chordName] = (voicings as any[]).map(v => {
    const frets = v.frets;
    const pressed = frets.filter((f: number) => f > 0);
    const startingFret = pressed.length > 0 ? Math.min(...pressed) : 1;
    const maxFret = Math.max(...pressed);
    
    // We want the arpeggio in the same region.
    // Let's define the region as startingFret to startingFret + 3 (4 frets total)
    // If maxFret - startingFret > 3, we use maxFret as the upper bound.
    const start = startingFret;
    const end = Math.max(start + 3, maxFret);
    
    const arpeggioFrets: number[][] = [[], [], [], []];
    
    for (let stringIdx = 0; stringIdx < 4; stringIdx++) {
      const openNote = tuningIndices[stringIdx];
      // Check open string (fret 0)
      if (notes.has(openNote) && start <= 1) { // Maybe only include open string if region is near nut
         // Actually, arpeggios usually include open strings if applicable and in lower positions
         // Let's just include it if start is 1 or 2
         if (start <= 2) {
             arpeggioFrets[stringIdx].push(0);
         }
      }
      
      for (let fret = start; fret <= end; fret++) {
        const noteIdx = noteIndexAtFret(openNote, fret);
        if (notes.has(noteIdx)) {
          // If this is the chord's fret, we can just leave it or still add it.
          // Since the UI can draw arpeggio notes and chord notes, we can add it, 
          // or we can let the UI handle the overlap. Let's add all arpeggio notes.
          if (!arpeggioFrets[stringIdx].includes(fret)) {
              arpeggioFrets[stringIdx].push(fret);
          }
        }
      }
    }
    
    return {
      chordName: v.chordName,
      frets: v.frets,
      arpeggioFrets
    };
  });
}

fs.writeFileSync('./src/config/arpeggio-dictionary.json', JSON.stringify(arpeggioDict, null, 2));
console.log('Arpeggio dictionary generated successfully.');
