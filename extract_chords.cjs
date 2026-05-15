const fs = require('fs');
const path = require('path');

const DIR_PATH = path.join(__dirname, 'diagramas');
const OUTPUT_FILE = path.join(__dirname, 'diagramas_extraidos.json');

async function main() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("Erro: A variável de ambiente OPENAI_API_KEY não está definida.");
        console.error("No Windows (PowerShell), defina antes de rodar usando:");
        console.error("$env:OPENAI_API_KEY=\"sua-chave-aqui\"");
        process.exit(1);
    }

    // Lê apenas os arquivos do diretório raiz "diagramas" que sejam imagens
    const files = fs.readdirSync(DIR_PATH).filter(f => {
        const fullPath = path.join(DIR_PATH, f);
        return fs.statSync(fullPath).isFile() && /\.(jpg|jpeg|png)$/i.test(f);
    });

    console.log(`Encontradas ${files.length} imagens no diretório ${DIR_PATH}.`);

    let allChords = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(DIR_PATH, file);
        console.log(`[${i + 1}/${files.length}] Processando ${file}...`);

        const base64Image = fs.readFileSync(filePath).toString('base64');
        const mimeType = file.toLowerCase().endsWith('png') ? 'image/png' : 'image/jpeg';

        const payload = {
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Você é um especialista em música e cavaquinho. Sua tarefa é analisar imagens de dicionários de acordes e extrair os dados precisos para o formato JSON."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Analise esta página de dicionário de acordes de cavaquinho. Extraia todos os diagramas de acordes presentes. Retorne APENAS um array JSON válido com objetos contendo 'chordName' e 'frets'. O array 'frets' deve ter 4 inteiros, representando as casas pressionadas da 4ª corda (mais grave) até a 1ª corda (mais aguda). Use 0 para corda solta e -1 para corda não tocada/abafada. Exemplo de saída esperada: [{\"chordName\": \"C\", \"frets\": [2, 0, 1, 2]}]. Não inclua blocos de código (```json) ou qualquer outro texto explicativo, apenas o array JSON puro."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1500,
            temperature: 0.2
        };

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.text();
                console.error(`  -> Erro na API HTTP ${response.status}: ${err}`);
                continue;
            }

            const data = await response.json();
            let content = data.choices[0].message.content.trim();
            
            // Remove possíveis blocos markdown que o modelo ainda possa retornar
            if (content.startsWith('```json')) content = content.slice(7);
            if (content.startsWith('```')) content = content.slice(3);
            if (content.endsWith('```')) content = content.slice(0, -3);

            try {
                const chords = JSON.parse(content.trim());
                if (Array.isArray(chords)) {
                    allChords.push(...chords);
                    console.log(`  -> Sucesso: Extraídos ${chords.length} acordes.`);
                    
                    // Salva o progresso no arquivo a cada iteração, garantindo que não se perca nada se o script for interrompido
                    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allChords, null, 4), 'utf-8');
                } else {
                    console.log(`  -> Aviso: Retorno da API não é um array JSON. Conteúdo retornado:`, content);
                }
            } catch (parseErr) {
                console.error(`  -> Erro ao parsear JSON. Conteúdo retornado:`, content);
            }

        } catch (err) {
            console.error(`  -> Erro ao conectar/processar ${file}:`, err.message);
        }
    }

    console.log(`\nProcessamento concluído! Total de ${allChords.length} acordes salvos no arquivo ${OUTPUT_FILE}`);
}

main();
