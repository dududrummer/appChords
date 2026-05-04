import fs from 'fs';
import path from 'path';

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyANP5-ynwDgJXwgoEUpn8wO4OOx9caza2E';
const FOLDER_PATH = './diagramas';
const OUTPUT_FILE = './src/config/cavaquinho-dictionary.json';

const PROMPT = `
You are a music theory and computer vision expert. I have an image containing several Cavaquinho chord diagrams.
The standard Brazilian cavaquinho tuning is D-G-B-D (4 strings, from top/lowest-pitch to bottom/highest-pitch).

Please extract ALL the chord diagrams present in this image.
For each chord, identify the chord name (e.g. C, G7, Am, Dm7(b5)) and the fingering (which frets are pressed).

Return ONLY a raw JSON array (without markdown backticks like \`\`\`json).
Format:
[
  {
    "chordName": "C",
    "frets": [0, 0, 0, 3]
  },
  {
    "chordName": "D7",
    "frets": [2, 2, 1, 0]
  }
]

Note: 
- Use 0 for open strings.
- Use -1 if a string is marked with an X (muted).
- The "frets" array must always have exactly 4 numbers, corresponding to the strings D, G, B, D in that order.
- Look very carefully at the dots, barre lines, and any starting fret numbers next to the diagram (e.g., if it says '3ª' next to the diagram, the top line is the 3rd fret).
`;

async function processImage(filePath) {
  console.log(`Processando: ${path.basename(filePath)}...`);
  const imageBytes = fs.readFileSync(filePath);
  const base64Image = Buffer.from(imageBytes).toString('base64');
  const mimeType = filePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

  const body = {
    contents: [
      {
        parts: [
          { text: PROMPT },
          { inline_data: { mime_type: mimeType, data: base64Image } }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1
    }
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`Erro na API para ${filePath}:`, err);
    return [];
  }

  const data = await response.json();
  try {
    const text = data.candidates[0].content.parts[0].text;
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error(`Erro ao fazer parse do JSON para ${filePath}:`, e);
    return [];
  }
}

async function main() {
  if (!fs.existsSync(FOLDER_PATH)) {
    console.error(`A pasta ${FOLDER_PATH} não existe.`);
    return;
  }

  const files = fs.readdirSync(FOLDER_PATH).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
  if (files.length === 0) {
    console.log('Nenhuma imagem encontrada na pasta.');
    return;
  }

  console.log(`Encontradas ${files.length} imagens. Iniciando extração...`);
  
  let allChords = {};

  // Process sequentially to respect rate limits
  for (const file of files) {
    const filePath = path.join(FOLDER_PATH, file);
    const chords = await processImage(filePath);
    
    for (const c of chords) {
      if (!allChords[c.chordName]) {
        allChords[c.chordName] = [];
      }
      // Evita duplicatas se a mesma posição for extraída várias vezes
      const fretStr = c.frets.join(',');
      const exists = allChords[c.chordName].some(existing => existing.frets.join(',') === fretStr);
      if (!exists) {
        allChords[c.chordName].push(c);
      }
    }
    
    // Pequeno delay para não estourar limite da API gratuita (15 req/min)
    await new Promise(r => setTimeout(r, 4500)); 
  }

  const configDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allChords, null, 2));
  console.log(`\n✅ Extração concluída! Dicionário salvo em: ${OUTPUT_FILE}`);
  console.log(`Total de acordes únicos mapeados: ${Object.keys(allChords).length}`);
}

main();
