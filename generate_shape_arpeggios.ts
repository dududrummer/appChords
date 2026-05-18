import fs from 'fs';
import path from 'path';
import { CHORD_FORMULAS, getNoteIndex } from './src/lib/music-theory';

const TUNING = ['D', 'G', 'B', 'D'];
const TUNING_MIDI = [62, 67, 71, 74]; 

function getChordNotes(root: string, quality: string): number[] {
    const rootIdx = getNoteIndex(root);
    const intervals = CHORD_FORMULAS[quality].intervals;
    return intervals.map(interval => (rootIdx + interval) % 12);
}

// Generate the classic 3 shapes (CAGED) for any chord
function generateShapesForChord(chordName: string, root: string, quality: string) {
    const notes = getChordNotes(root, quality);
    const shapes = [];

    // We will generate 3 shapes, based on finding the root on strings 0, 1, and 2.
    for (let rootString = 0; rootString <= 2; rootString++) {
        // Find the fret of the root on this string
        const rootMidiBase = TUNING_MIDI[rootString];
        const rootNoteClass = getNoteIndex(root);
        
        // Find the lowest fret for this root on this string
        let rootFret = (rootNoteClass - (rootMidiBase % 12) + 12) % 12;
        if (rootFret === 0) rootFret = 12; // Avoid open string as base for movable shape
        
        // The region is [rootFret - 2, rootFret + 3]
        const minFret = Math.max(1, rootFret - 2);
        const maxFret = Math.min(15, rootFret + 3);

        const shapeFrets: number[][] = [[], [], [], []];
        const usedPitches = new Set<number>();

        // Go string by string, finding notes that belong to the chord
        for (let s = 0; s < 4; s++) {
            const stringBaseMidi = TUNING_MIDI[s];
            for (let f = minFret; f <= maxFret; f++) {
                const pitch = stringBaseMidi + f;
                const noteClass = pitch % 12;
                
                if (notes.includes(noteClass)) {
                    // Check if we already have this exact pitch (unison)
                    if (!usedPitches.has(pitch)) {
                        shapeFrets[s].push(f);
                        usedPitches.add(pitch);
                    }
                }
            }
        }
        
        // Filter out shapes that are unplayable (e.g., more than 2 notes per string)
        // Usually, a good shape has at least one note on each string
        const hasEmptyStrings = shapeFrets.some(arr => arr.length === 0);
        if (!hasEmptyStrings) {
            shapes.push({
                chordName,
                frets: shapeFrets
            });
        }
    }
    
    return shapes;
}

const ALL_ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const QUALITIES = [
    { suffix: '', name: 'major' },
    { suffix: 'm', name: 'minor' },
    { suffix: '7', name: 'dominant7' },
    { suffix: 'm7', name: 'minor7' },
    { suffix: '7M', name: 'major7' },
    { suffix: 'm7(b5)', name: 'halfDiminished' },
    { suffix: 'dim', name: 'diminished' },
    { suffix: '(#5)', name: 'augmented' },
];

const dictionary: Record<string, any[]> = {};

for (const root of ALL_ROOTS) {
    for (const q of QUALITIES) {
        const chordName = `${root}${q.suffix}`;
        let formulaKey = q.suffix;
        if (q.suffix === '(#5)') formulaKey = '5#';
        
        const shapes = generateShapesForChord(chordName, root, formulaKey);
        
        if (!dictionary[chordName]) {
            dictionary[chordName] = [];
        }
        dictionary[chordName].push(...shapes);
    }
}

const finalOutput = {
    cavaquinho: Object.keys(dictionary).map(key => {
        return {
            chordName: key,
            frets: [0, 0, 0, 0], // dummy for legacy
            arpeggioFrets: dictionary[key].map(s => s.frets)
        };
    })
};

// Flatten the array of shapes into individual entries so VoicingSearch works naturally
const flatOutput: any[] = [];
Object.keys(dictionary).forEach(key => {
    dictionary[key].forEach(shape => {
        // Calculate the starting fret (min fret in the shape)
        const allFrets = shape.frets.flat();
        const minFret = Math.min(...allFrets);
        
        flatOutput.push({
            chordName: key,
            frets: [-1,-1,-1,-1], // Dummy, we only use arpeggioFrets
            startingFret: minFret,
            arpeggioFrets: shape.frets
        });
    });
});

fs.writeFileSync('./src/config/arpeggio-dictionary.json', JSON.stringify(flatOutput, null, 2));
console.log("Shapes dictionary generated successfully!");
