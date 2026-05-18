import fs from 'fs';
import path from 'path';
import { getNoteIndex, CHORD_FORMULAS } from './src/lib/music-theory';

const TUNING_MIDI = [62, 67, 71, 74]; // D, G, B, D

function getChordNotes(root: string, quality: string): number[] {
    const rootIdx = getNoteIndex(root);
    if (!CHORD_FORMULAS[quality]) {
        return [];
    }
    const intervals = CHORD_FORMULAS[quality].intervals;
    return intervals.map(interval => (rootIdx + interval) % 12);
}

function processUserArpeggios() {
    const inputPath = path.resolve('diagramas/Shapes e arpejos/arpejos.json');
    if (!fs.existsSync(inputPath)) {
        console.error("arpejos.json not found!");
        return;
    }
    const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

    const processedArpeggios: any[] = [];
    
    for (const diag of rawData.diagramas) {
        if (!diag.casas || !diag.tom) continue;
        
        let root = diag.tom;
        // The tom might be "C# ou Db". Pick the first one.
        if (root.includes(' ou ')) {
            root = root.split(' ou ')[0].trim();
        }
        
        // Parse the quality from the chord name.
        // E.g., diag.nome: "C X" -> "C" (Major)
        // E.g., "Cm", "C7", "C7M", etc.
        let chordName = diag.nome.split(' ')[0]; 
        
        // Let's guess the quality based on diag.nome or diag.tituloFonte
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
        
        // Normalize chordName just in case
        chordName = `${root}${quality}`;
        
        const validNotes = getChordNotes(root, quality);
        if (validNotes.length === 0) {
            console.log(`Failed to parse valid notes for ${diag.tituloFonte} | root: ${root} | q: ${quality}`);
            continue;
        }

        const resolvedFrets: number[][] = [[], [], [], []];
        let usedStrings = new Set<number>();
        
        // We need to map each array in diag.casas to a string index (0 to 3)
        // Since arrays are in SOME visual order, we try to map them in increasing or decreasing string index.
        for (const fretsArray of diag.casas) {
            let possibleStrings = [];
            for (let s = 0; s < 4; s++) {
                if (usedStrings.has(s)) continue;
                
                let allValid = true;
                for (const fret of fretsArray) {
                    const pitch = TUNING_MIDI[s] + fret;
                    const noteClass = pitch % 12;
                    if (!validNotes.includes(noteClass)) {
                        allValid = false;
                        break;
                    }
                }
                if (allValid) {
                    possibleStrings.push(s);
                }
            }
            
            if (possibleStrings.length > 0) {
                // If there's ambiguity, we could pick the one that makes the visual order consistent.
                // For now, let's just pick the first possible string that matches.
                // Wait, if we pick naively, we might consume a string needed by the next array.
                // Let's just pick the first valid one.
                const bestString = possibleStrings[0];
                resolvedFrets[bestString] = fretsArray;
                usedStrings.add(bestString);
            } else {
                console.log(`Could not find a valid string for frets ${fretsArray} in chord ${chordName} (${validNotes})`);
            }
        }
        
        // Find starting fret
        let minFret = 99;
        resolvedFrets.forEach(arr => {
            arr.forEach(f => {
                if (f > 0 && f < minFret) minFret = f;
            });
        });
        if (minFret === 99) minFret = 0;

        processedArpeggios.push({
            chordName: chordName,
            frets: [-1,-1,-1,-1],
            startingFret: minFret,
            arpeggioFrets: resolvedFrets
        });
    }

    fs.writeFileSync('./src/config/arpeggio-dictionary-user.json', JSON.stringify(processedArpeggios, null, 2));
    console.log(`Successfully mapped ${processedArpeggios.length} arpeggios from user's JSON.`);
}

processUserArpeggios();
