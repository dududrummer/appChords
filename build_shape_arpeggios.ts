import fs from 'fs';
import path from 'path';
import { getNoteIndex, CHORD_FORMULAS } from './src/lib/music-theory';

const TUNING_MIDI = [62, 67, 71, 74]; // D, G, B, D

function getChordNotes(root: string, quality: string): number[] {
    const rootIdx = getNoteIndex(root);
    if (!CHORD_FORMULAS[quality]) return [];
    return CHORD_FORMULAS[quality].intervals.map(interval => (rootIdx + interval) % 12);
}

function processShapes() {
    const inputPath = path.resolve('diagramas/Shapes e arpejos/arpejos.json');
    const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

    // Map: Quality -> Array of Shapes
    // Shape: { name: string, rootString: number, rootFret: number, frets: number[][] }
    const shapeDictionary: Record<string, any[]> = {};
    
    for (const diag of rawData.diagramas) {
        if (!diag.casas || !diag.tom) continue;
        
        let root = diag.tom.split(' ou ')[0].trim();
        let quality = '';
        if (diag.tituloFonte.includes('MAIOR') && !diag.tituloFonte.includes('7') && !diag.tituloFonte.includes('(#5)')) quality = '';
        else if (diag.tituloFonte.includes('MENOR') && !diag.tituloFonte.includes('7') && !diag.tituloFonte.includes('(b5)')) quality = 'm';
        else if (diag.tituloFonte.includes('X7') && !diag.tituloFonte.includes('M')) quality = '7';
        else if (diag.tituloFonte.includes('X7M')) quality = '7M';
        else if (diag.tituloFonte.includes('Xm7(b5)')) quality = 'm7b5';
        else if (diag.tituloFonte.includes('Xm7')) quality = 'm7';
        else if (diag.tituloFonte.includes('Xº')) quality = 'dim';
        else if (diag.tituloFonte.includes('X(#5)')) quality = '+';
        else if (diag.tituloFonte.includes('Xm(b5)')) quality = 'm(b5)';
        else if (diag.tituloFonte.includes('Xm7M')) quality = 'm7M';
        
        const validNotes = getChordNotes(root, quality);
        if (validNotes.length === 0) continue;

        const resolvedFrets: number[][] = [[], [], [], []];
        let usedStrings = new Set<number>();
        
        for (const fretsArray of diag.casas) {
            let possibleStrings = [];
            for (let s = 0; s < 4; s++) {
                if (usedStrings.has(s)) continue;
                let allValid = true;
                for (const fret of fretsArray) {
                    const pitch = TUNING_MIDI[s] + fret;
                    if (!validNotes.includes(pitch % 12)) {
                        allValid = false; break;
                    }
                }
                if (allValid) possibleStrings.push(s);
            }
            if (possibleStrings.length > 0) {
                resolvedFrets[possibleStrings[0]] = fretsArray;
                usedStrings.add(possibleStrings[0]);
            }
        }

        // Find the ROOT note in these frets to anchor the shape
        const rootNoteClass = getNoteIndex(root);
        let rootString = -1;
        let rootFret = -1;

        // Try to find the root note that is visually the "bass" of the shape
        // Usually, the lowest pitched root note is the anchor.
        for (let s = 0; s < 4; s++) {
            for (const f of resolvedFrets[s]) {
                if ((TUNING_MIDI[s] + f) % 12 === rootNoteClass) {
                    if (rootString === -1 || TUNING_MIDI[s] + f < TUNING_MIDI[rootString] + rootFret) {
                        rootString = s;
                        rootFret = f;
                    }
                }
            }
        }
        
        // If we couldn't find the root in the arpeggio, maybe it's implied. 
        // We will just calculate relative offsets from the first fret found.
        if (rootString === -1) {
            rootString = 0;
            rootFret = resolvedFrets.flat().filter(f => f >= 0)[0] || 0;
        }

        // Store relative shape
        const relativeFrets = resolvedFrets.map(arr => arr.map(f => f - rootFret));

        if (!shapeDictionary[quality]) shapeDictionary[quality] = [];
        
        shapeDictionary[quality].push({
            name: diag.shape || `Shape_${quality}_${rootString}`,
            rootString,
            relativeFrets,
            originalRoot: root
        });
    }

    fs.writeFileSync('./src/config/arpeggio-shapes.json', JSON.stringify(shapeDictionary, null, 2));
    console.log("Shapes extracted and saved!");
}

processShapes();
