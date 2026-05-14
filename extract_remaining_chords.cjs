const fs = require('fs');
const path = require('path');

// Manually parse .env to avoid dependency issues
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const DIR_PATH = path.join(__dirname, 'diagramas');
const OUTPUT_FILE = path.join(__dirname, 'diagramas_extraidos_309_fim.json');

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Erro: A variável de ambiente GEMINI_API_KEY não está definida no .env");
        process.exit(1);
    }

    // List files and filter by number >= 309
    const files = fs.readdirSync(DIR_PATH).filter(f => {
        const fullPath = path.join(DIR_PATH, f);
        if (!fs.statSync(fullPath).isFile()) return false;
        if (!/\.(jpg|jpeg|png)$/i.test(f)) return false;
        const match = f.match(/-(\d+)\.(jpg|jpeg|png)$/i);
        if (!match) return false;
        const num = parseInt(match[1]);
        return num >= 309;
    }).sort((a, b) => {
        const numA = parseInt(a.match(/-(\d+)\./)[1]);
        const numB = parseInt(b.match(/-(\d+)\./)[1]);
        return numA - numB;
    });

    // Clear output file at start
    if (fs.existsSync(OUTPUT_FILE)) fs.unlinkSync(OUTPUT_FILE);

    console.log(`Encontradas ${files.length} imagens a partir da 309.`);

    let allChords = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(DIR_PATH, file);
        console.log(`[${i + 1}/${files.length}] Processando ${file} com a API do Gemini...`);

        const base64Image = fs.readFileSync(filePath).toString('base64');
        const mimeType = file.toLowerCase().endsWith('png') ? 'image/png' : 'image/jpeg';

        const payload = {
            contents: [
                {
                    parts: [
                        {
                            text: "Analise esta página de dicionário de acordes. Instruções CRÍTICAS para precisão:\n" +
                                  "1. IDENTIFIQUE o nome do acorde no topo da página (ex: E2, B2). Use este nome exato para todos os itens.\n" +
                                  "2. OBSERVE os números romanos (IV, IX, XIV, etc) ao lado dos diagramas. Eles indicam a posição no braço.\n" +
                                  "   - Exemplo na Imagem: Se 'XIV' está alinhado com a 3ª linha de casas, significa que a 3ª casa do desenho é o traste 14. Portanto, a 1ª casa é o 12 e a 2ª é o 13.\n" +
                                  "   - Se um diagrama NÃO tem número romano, a primeira casa é o traste 1.\n" +
                                  "3. CADA PONTO (círculo amarelo com número) deve ser convertido para o traste real calculado.\n" +
                                  "4. ORDEM DAS CORDAS: A 4ª corda é a da esquerda (mais grave), a 1ª corda é a da direita (mais aguda).\n" +
                                  "5. RETORNE um array JSON puro: [{\"chordName\": \"...\", \"frets\": [C4, C3, C2, C1]}].\n" +
                                  "6. NÃO INVENTE acordes. Siga apenas o que está desenhado. Se houver uma seta amarela cruzando o braço com um número (ex: IV), é uma pestana naquele traste."
                        },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Image
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.1
            }
        };

        let success = false;
        let retries = 0;
        const maxRetries = 3;

        while (!success && retries < maxRetries) {
            try {
                // Use Gemini 2.5 flash model via Google Generative Language API
                const modelName = 'gemini-2.5-flash';
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.status === 429) {
                    const waitTime = 30 + (retries * 30);
                    console.log(`  -> Rate limit atingido (429). Aguardando ${waitTime}s antes de tentar novamente...`);
                    await new Promise(r => setTimeout(r, waitTime * 1000));
                    retries++;
                    continue;
                }

                if (!response.ok) {
                    const err = await response.text();
                    console.error(`  -> Erro na API HTTP ${response.status} com modelo ${modelName}: ${err}`);
                    retries++;
                    continue;
                }

                const data = await response.json();
                
                if (!data.candidates || data.candidates.length === 0) {
                    console.log(`  -> Nenhum resultado retornado pelo modelo para a imagem ${file}.`);
                    success = true; // Skip this file
                    continue;
                }

                let content = data.candidates[0].content.parts[0].text.trim();
                
                // Remove possíveis blocos markdown
                if (content.startsWith('```json')) content = content.slice(7);
                if (content.startsWith('```')) content = content.slice(3);
                if (content.endsWith('```')) content = content.slice(0, -3);

                try {
                    const chords = JSON.parse(content.trim());
                    if (Array.isArray(chords)) {
                        allChords.push(...chords);
                        console.log(`  -> Sucesso: Extraídos ${chords.length} acordes.`);
                        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allChords, null, 4), 'utf-8');
                        success = true;
                    } else {
                        console.log(`  -> Aviso: Retorno da API não é um array JSON. Tentando novamente...`);
                        retries++;
                    }
                } catch (parseErr) {
                    console.error(`  -> Erro ao parsear JSON. Tentando novamente...`);
                    retries++;
                }

            } catch (err) {
                console.error(`  -> Erro ao conectar/processar ${file}:`, err.message);
                retries++;
            }
        }

        // Delay entre imagens para evitar rate limits preventivamente
        if (i < files.length - 1) {
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    console.log(`\nExtração concluída! Total de ${allChords.length} acordes salvos no arquivo ${OUTPUT_FILE}`);
}

main();
