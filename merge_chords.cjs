const fs = require('fs');

function normalizeName(name) {
    let n = name.replace(/\(|\)/g, '');
    n = n.replace(/-/g, 'b').replace(/\+/g, '#');
    n = n.replace(/5b/g, 'b5');
    n = n.replace(/5#/g, '#5');
    n = n.replace(/9b/g, 'b9');
    n = n.replace(/9#/g, '#9');
    n = n.replace(/11#/g, '#11');
    n = n.replace(/13b/g, 'b13');
    n = n.replace(/75b/g, '7b5');
    n = n.replace(/75#/g, '7#5');
    return n;
}

function formatCustomJson(data) {
    let lines = ["{"];
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        lines.push(`  "${key}": [`);
        let chords = data[key];
        for (let j = 0; j < chords.length; j++) {
            let chord = chords[j];
            let fretsStr = JSON.stringify(chord.frets).replace(/\s/g, '');
            let chordStr = `{"chordName":"${chord.chordName}","frets":${fretsStr}}`;
            let comma = j < chords.length - 1 ? "," : "";
            lines.push(`    ${chordStr}${comma}`);
        }
        let commaKey = i < keys.length - 1 ? "," : "";
        lines.push(`  ]${commaKey}`);
    }
    lines.push("}");
    return lines.join("\n");
}

function main() {
    let targetStr = fs.readFileSync('src/config/cavaquinho-dictionary.json', 'utf8');
    let target = JSON.parse(targetStr);
    
    let sourceStr = fs.readFileSync('diagramas/diagramas_the_best/diagramas-the_best.json', 'utf8').trim();
    sourceStr = sourceStr.replace(/,\s*$/, '');
    if (!sourceStr.startsWith('[')) {
        sourceStr = '[' + sourceStr + ']';
    }
    let source = eval('(' + sourceStr + ')');
    
    let targetKeysNormalized = {};
    for (let k of Object.keys(target)) {
        targetKeysNormalized[normalizeName(k)] = k;
    }
    
    let addedExamples = {};
    let toAddPerKey = {};
    
    for (let item of source) {
        if (!item || !item.frets) continue;
        let origName = item.chordName;
        let frets = item.frets.map(f => (f === 'x' || f === 'X') ? -1 : f);
        
        let normName = normalizeName(origName);
        let targetKey;
        if (targetKeysNormalized[normName]) {
            targetKey = targetKeysNormalized[normName];
        } else {
            targetKey = origName.replace(/-/g, 'b').replace(/\+/g, '#').replace(/\(|\)/g, '');
            targetKeysNormalized[normName] = targetKey;
            target[targetKey] = [];
        }
        
        if (!toAddPerKey[targetKey]) {
            toAddPerKey[targetKey] = [];
        }
        
        let existsInNew = toAddPerKey[targetKey].some(x => JSON.stringify(x.frets) === JSON.stringify(frets));
        let existsInTarget = target[targetKey].some(x => JSON.stringify(x.frets) === JSON.stringify(frets));
        
        if (!existsInNew && !existsInTarget) {
            let newItem = { chordName: targetKey, frets: frets };
            toAddPerKey[targetKey].push(newItem);
            
            if (!addedExamples[targetKey]) {
                addedExamples[targetKey] = [];
            }
            addedExamples[targetKey].push(newItem);
        }
    }
    
    for (let key in toAddPerKey) {
        if (toAddPerKey[key].length > 0) {
            target[key] = toAddPerKey[key].concat(target[key]);
        }
    }
    
    fs.writeFileSync('src/config/cavaquinho-dictionary.json', formatCustomJson(target), 'utf8');
    fs.writeFileSync('added_examples.json', JSON.stringify(addedExamples, null, 2), 'utf8');
}

main();
