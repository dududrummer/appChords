import fs from 'fs';
const path = 'src/config/cavaquinho-dictionary.json';

try {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    let output = '{\n';
    const keys = Object.keys(data);

    keys.forEach((key, i) => {
        const variations = data[key];
        // Sort variations by frets lexicographically
        variations.sort((a, b) => {
            for (let k = 0; k < a.frets.length; k++) {
                if (a.frets[k] !== b.frets[k]) return a.frets[k] - b.frets[k];
            }
            return 0;
        });

        output += `  "${key}": [\n`;
        variations.forEach((varObj, j) => {
            const line = JSON.stringify(varObj);
            const comma = j < variations.length - 1 ? ',' : '';
            output += `    ${line}${comma}\n`;
        });

        const commaOuter = i < keys.length - 1 ? ',' : '';
        output += `  ]${commaOuter}\n`;
    });

    output += '}';
    fs.writeFileSync(path, output, 'utf8');
    console.log('Sucesso: Dicionário organizado e formatado.');
} catch (e) {
    console.error('Erro:', e.message);
}
