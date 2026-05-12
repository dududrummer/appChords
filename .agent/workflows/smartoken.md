---
description: 
---

# /smartoken - Smart Token Optimizer

$ARGUMENTS

---

## Task

This command intercepts the user's prompt and sends it to the local AI Memory System (http://localhost:3000) for optimization before consuming API credits.

### Steps:

1. **Capture Prompt**
   - Take everything after `/smartoken` as the user prompt

2. **Send to Memory System**
   - Call `POST http://localhost:3000/optimize?mode=fast` with the prompt
   - The server will: compress, enrich with context, apply token budget, search vector memories
   - Mode `fast` skips Ollama AI call for instant response (~1s instead of ~120s)

3. **Display Results**
   - Show the optimized prompt returned by the server
   - Report token savings stats

4. **Execute Optimized Prompt**
   - Use the optimized/enriched context to continue working on the user's request
   - The AI assistant (Antigravity) should use the enriched context to give a better response

---

## Execution Command

// turbo
```powershell
$prompt = "$ARGUMENTS"
$body = @{ prompt = $prompt } | ConvertTo-Json -Compress
$response = Invoke-RestMethod -Uri "http://localhost:3000/optimize?mode=fast" -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -ContentType "application/json; charset=utf-8"
Write-Host "--- SMARTOKEN STATS ---"
Write-Host "Economia: $($response.stats.savings)"
Write-Host "Context Items: $($response.stats.contextItems)"
Write-Host "Skills: $($response.stats.skills -join ', ')"
Write-Host "Tempo: $($response.stats.processingMs)ms"
Write-Host "--- PROMPT OTIMIZADO ---"
$response.optimized
```

---

## Usage Examples

```
/smartoken Crie um sistema de login com JWT
/smartoken Refatore o componente Header para usar React hooks
/smartoken Explique a arquitetura do projeto
```

---

## Requirements

- AI Memory System must be running (`start.bat` in `C:\AI\ai-memory-system`)
- Server must be accessible at `http://localhost:3000`