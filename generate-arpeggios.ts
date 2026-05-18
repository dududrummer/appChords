import fs from 'fs';
import { parseChord, getNoteIndex, CHROMATIC_NOTES } from './src/lib/music-theory';

const dictPath = './src/config/cavaquinho-dictionary.json';
const dictRaw = fs.readFileSync(dictPath, 'utf8');
const dict = JSON.parse(dictRaw);

// Cavaquinho standard tuning: D4, G4, B4, D5
// Using arbitrary pitch integers where C4 = 60
const TUNING_NOTES = ['D', 'G', 'B', 'D'];
const TUNING_PITCHES = [62, 67, 71, 74];
const tuningIndices = TUNING_NOTES.map(getNoteIndex);

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
    
    const candidates: { s: number, f: number, pitch: number }[] = [];
    
    for (let stringIdx = 0; stringIdx < 4; stringIdx++) {
      const openNote = tuningIndices[stringIdx];
      const stringPitch = TUNING_PITCHES[stringIdx];
      
      // Check open string (fret 0)
      if (notes.has(openNote) && start <= 2) {
         candidates.push({ s: stringIdx, f: 0, pitch: stringPitch });
      }
      
      for (let fret = start; fret <= end; fret++) {
        const noteIdx = noteIndexAtFret(openNote, fret);
        if (notes.has(noteIdx)) {
          candidates.push({ s: stringIdx, f: fret, pitch: stringPitch + fret });
        }
      }
    }
    
    const byPitch = new Map<number, { s: number, f: number, pitch: number }[]>();
    for (const c of candidates) {
      if (!byPitch.has(c.pitch)) byPitch.set(c.pitch, []);
      byPitch.get(c.pitch)!.push(c);
    }
    
    const arpeggioFrets: number[][] = [[], [], [], []];
    
    for (const [pitch, list] of byPitch.entries()) {
       let best = list[0];
       let bestScore = -100;
       
       for (const c of list) {
          let score = 0;
          // Prefer if it's the exact same string/fret used in the original chord
          if (frets[c.s] === c.f) score += 10;
          // Prefer closer to start fret to minimize finger stretching
          score -= Math.abs(c.f - start);
          if (score > bestScore) {
             bestScore = score;
             best = c;
          }
       }
       
       if (!arpeggioFrets[best.s].includes(best.f)) {
           arpeggioFrets[best.s].push(best.f);
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
console.log('Arpeggio dictionary generated successfully without unisons.');
