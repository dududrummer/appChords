import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : '';

async function extractFromPdf(pdfPath) {
  const bytes = fs.readFileSync(pdfPath);
  const base64 = bytes.toString('base64');
  
  const prompt = `You are a music theory and computer vision expert. I am giving you a PDF containing Cavaquinho arpeggio diagrams.
The standard Brazilian cavaquinho tuning is D-G-B-D (4 strings, from top/lowest-pitch to bottom/highest-pitch).

Please extract ALL the arpeggio shapes/diagrams present in this PDF.
For each diagram, identify the chord name (e.g., C, F, G) and the exact fingering (which frets are pressed on which strings). 

Return ONLY a raw JSON array.
Format:
[
  {
    "chordName": "C", 
    "frets": [[0, 4], [0, 5], [0], [0, 4, 7]] 
  }
]

Note: 
- The frets property MUST be an array of exactly 4 arrays, corresponding to strings D, G, B, D from top to bottom.
- Each string can have multiple notes in an arpeggio. List all frets played on that string.
- If a string is not played, use an empty array [].
- Look carefully at the dots and any starting fret numbers (e.g., '3ª') next to the diagram.`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "application/pdf", data: base64 } }
        ]
      }
    ],
    generationConfig: { temperature: 0.1 }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  console.log(`Sending ${path.basename(pdfPath)} to Gemini...`);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  const data = await response.json();
  if (data.error) {
    console.error("API Error:", data.error);
    return;
  }
  
  const text = data.candidates[0].content.parts[0].text;
  let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  console.log("Raw JSON output:\n", cleanText);
  
  try {
    const parsed = JSON.parse(cleanText);
    console.log("Parsed successfully! Found", parsed.length, "arpeggios.");
    fs.writeFileSync('raw_arpeggios.json', JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.error("Failed to parse JSON", e);
  }
}

extractFromPdf('C:\\Projects\\appChords\\diagramas\\Shapes e arpejos\\Arpejo MAIOR.pdf').catch(console.error);
