---
description: 
---

# Workflow: /smartoken

Este workflow intercepta o prompt do usuário e o envia para o sistema de otimização local antes da execução final.

## 🚀 Fluxo de Execução

1.  **Análise do Prompt**: Captura o texto após o comando `/smartoken`.
2.  **Verificação do Servidor**: Verifica se o `ai-memory-system` está rodando na porta 3000.
3.  **Otimização**: Envia o prompt para `POST /optimize`.
4.  **Entrega**: Retorna o prompt otimizado e denso para o usuário.

## 🛠️ Comando

// turbo
```powershell
# Exemplo de chamada interna que o Antigravity fará
$prompt = "{user_prompt}"
$body = @{ prompt = $prompt } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/optimize" -Method Post -Body $body -ContentType "application/json"
$response.optimizedPrompt
```

## 📝 Instruções para o Usuário
Sempre que você quiser economizar tokens, use:
`/smartoken [seu prompt]`
