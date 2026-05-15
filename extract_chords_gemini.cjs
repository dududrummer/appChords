const fs = require('fs');
const path = require('path');

const DIR_PATH = path.join(__dirname, 'diagramas');
// Usando um nome diferente para o arquivo de teste
const OUTPUT_FILE = path.join(__dirname, 'diagramas_extraidos_teste.json');

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Erro: A variável de ambiente GEMINI_API_KEY não está definida no .env");
        process.exit(1);
    }

    const files = fs.readdirSync(DIR_PATH).filter(f => {
        const fullPath = path.join(DIR_PATH, f);
        return fs.statSync(fullPath).isFile() && /\.(jpg|jpeg|png)$/i.test(f);
    });

    // Limitar o processamento a apenas 2 imagens
    const maxTestes = 2;
    const filesToProcess = files.slice(0, maxTestes);

    console.log(`Encontradas ${files.length} imagens no total.`);
    console.log(`Modo de TESTE ativado: Processando apenas as primeiras ${filesToProcess.length} imagens.`);

    let allChords = [];

    for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const filePath = path.join(DIR_PATH, file);
        console.log(`[${i + 1}/${filesToProcess.length}] Processando ${file} com a API do Gemini...`);

        const base64Image = fs.readFileSync(filePath).toString('base64');
        const mimeType = file.toLowerCase().endsWith('png') ? 'image/png' : 'image/jpeg';

        const payload = {
            contents: [
                {
                    parts: [
                        {
                            text: "Analise esta página de dicionário de acordes de cavaquinho. Extraia todos os diagramas de acordes presentes. Retorne APENAS um array JSON válido com objetos contendo 'chordName' e 'frets'. O array 'frets' deve ter 4 inteiros, representando as casas pressionadas da 4ª corda (mais grave) até a 1ª corda (mais aguda). Use 0 para corda solta e -1 para corda não tocada/abafada. Exemplo de saída esperada: [{\"chordName\": \"C\", \"frets\": [2, 0, 1, 2]}]. Não inclua blocos de código (como ```json) ou qualquer outro texto explicativo, devolva APENAS o array JSON puro."
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

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.text();
                console.error(`  -> Erro na API HTTP ${response.status}: ${err}`);
                continue;
            }

            const data = await response.json();
            
            if (!data.candidates || data.candidates.length === 0) {
                console.log(`  -> Nenhum resultado retornado pelo modelo para a imagem ${file}.`);
                continue;
            }

            let content = data.candidates[0].content.parts[0].text.trim();
            
            // Remove possíveis blocos markdown caso a API os adicione mesmo com o prompt pedindo pra não adicionar
            if (content.startsWith('```json')) content = content.slice(7);
            if (content.startsWith('```')) content = content.slice(3);
            if (content.endsWith('```')) content = content.slice(0, -3);

            try {
                const chords = JSON.parse(content.trim());
                if (Array.isArray(chords)) {
                    allChords.push(...chords);
                    console.log(`  -> Sucesso: Extraídos ${chords.length} acordes.`);
                    
                    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allChords, null, 4), 'utf-8');
                } else {
                    console.log(`  -> Aviso: Retorno da API não é um array JSON. Conteúdo:`, content);
                }
            } catch (parseErr) {
                console.error(`  -> Erro ao parsear JSON. Conteúdo retornado:`, content);
            }

        } catch (err) {
            console.error(`  -> Erro ao conectar/processar ${file}:`, err.message);
        }
    }

    console.log(`\nTeste concluído! Total de ${allChords.length} acordes salvos no arquivo ${OUTPUT_FILE}`);
}

main();
