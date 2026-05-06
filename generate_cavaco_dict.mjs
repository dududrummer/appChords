import fs from 'fs';
import path from 'path';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getNoteIndex(note) {
  return NOTES.indexOf(note);
}

const dict = {};

function addChord(name, frets) {
  if (frets.some(f => f < 0 || f > 14)) return;
  if (!dict[name]) dict[name] = [];
  const fretStr = frets.join(',');
  if (!dict[name].find(v => v.frets.join(',') === fretStr)) {
    dict[name].push({ chordName: name, frets });
  }
}

function generate(quality, templates) {
  for (let rootIndex = 0; rootIndex < 12; rootIndex++) {
    const rootName = NOTES[rootIndex];
    const chordName = `${rootName}${quality}`;
    
    templates.forEach(t => {
      const stringOpenNote = [2, 7, 11, 2][t.rootString]; 
      let baseFret = (rootIndex - stringOpenNote - t.rootFretOffset) % 12;
      if (baseFret < 0) baseFret += 12;
      
      [baseFret, baseFret + 12].forEach(bf => {
        const frets = t.shape.map(offset => offset === -1 ? -1 : bf + offset);
        addChord(chordName, frets);
        
        // Cavaquinho specific: The 1st and 4th strings are both D. 
        // We can swap the frets played on those strings to get another valid voicing (inversion/different bass).
        if (frets[0] !== frets[3] && frets[0] !== -1 && frets[3] !== -1) {
          const invertedFrets = [frets[3], frets[1], frets[2], frets[0]];
          addChord(chordName, invertedFrets);
        }
      });
    });
  }
}

// Major Templates
generate('', [
  { shape: [0, 0, 0, 0], rootString: 1, rootFretOffset: 0 }, // G shape
  { shape: [2, 0, 1, 2], rootString: 2, rootFretOffset: 1 }, // C shape
  { shape: [0, 2, 3, 4], rootString: 0, rootFretOffset: 0 }, // D shape
  { shape: [2, 1, 0, 2], rootString: 0, rootFretOffset: 2 }, // E shape
]);

// Minor Templates
generate('m', [
  { shape: [0, 2, 3, 3], rootString: 0, rootFretOffset: 0 }, // Dm shape
  { shape: [2, 2, 1, 2], rootString: 1, rootFretOffset: 2 }, // Am shape
  { shape: [2, 0, 0, 2], rootString: 0, rootFretOffset: 2 }, // Em shape
  { shape: [1, 0, 1, 1], rootString: 2, rootFretOffset: 1 }, // Cm shape
]);

// Dominant 7 Templates
generate('7', [
  { shape: [0, 0, 0, 3], rootString: 1, rootFretOffset: 0 }, // G7 shape
  { shape: [0, 2, 1, 4], rootString: 0, rootFretOffset: 0 }, // D7 shape
  { shape: [2, 3, 1, 2], rootString: 2, rootFretOffset: 1 }, // C7 shape
  { shape: [0, 1, 0, 2], rootString: 0, rootFretOffset: 0 }, // E7 shape
]);

// m7b5 Templates (from Image 4)
generate('m7b5', [
  { shape: [0, 2, 0, 0], rootString: 2, rootFretOffset: 0 }, // Cm7b5 shifted to B: [0,2,0,0] -> C is [1,3,1,1]
  { shape: [0, 1, 1, 0], rootString: 0, rootFretOffset: 0 }, // Dm7b5 shape
  { shape: [1, 1, 0, 1], rootString: 0, rootFretOffset: 3 }, // Fm7b5 shape [1,1,0,1] -> F is fret 3 on D string
]);

// Diminished 7 Templates (from Image 5)
// Diminished chords repeat every minor 3rd (3 frets).
// One shape is enough, but we transpose it natively!
generate('dim', [
  { shape: [1, 2, 0, 1], rootString: 0, rootFretOffset: 1 }, // Cdim shape
]);

const outputPath = path.join(process.cwd(), 'src', 'config', 'cavaquinho-dictionary.json');
fs.writeFileSync(outputPath, JSON.stringify(dict, null, 2));
console.log('Premium Cavaquinho Dictionary Generated!');
