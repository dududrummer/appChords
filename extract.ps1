$ApiKey = "AIzaSyAtDRxpOMLo2C7b_Tspww7SPBQgsTv5dIs"
$FolderPath = "C:\Projects\appChords\diagramas"
$OutputFile = "C:\Projects\appChords\src\config\cavaquinho-dictionary.json"

If (-Not (Test-Path $FolderPath)) {
    Write-Host "Pasta não encontrada: $FolderPath"
    Exit
}

$Files = Get-ChildItem -Path $FolderPath -Include *.png,*.jpg,*.jpeg -Recurse
If ($Files.Count -eq 0) {
    Write-Host "Nenhuma imagem encontrada na pasta."
    Exit
}

Write-Host "Encontradas $($Files.Count) imagens. Iniciando extração com a API do Google..."

$AllChords = @{}
$Headers = @{
    "Content-Type" = "application/json"
}

$Prompt = @"
You are a music theory and computer vision expert. I have an image containing several Cavaquinho chord diagrams.
The standard Brazilian cavaquinho tuning is D-G-B-D (4 strings, from top/lowest-pitch to bottom/highest-pitch).

Please extract ALL the chord diagrams present in this image.
For each chord, identify the chord name (e.g. C, G7, Am, Dm7(b5)) and the fingering (which frets are pressed).

Return ONLY a raw JSON array (without markdown backticks like ```json).
Format:
[
  {
    "chordName": "C",
    "frets": [0, 0, 0, 3]
  }
]

Note: 
- Use 0 for open strings.
- Use -1 if a string is marked with an X (muted).
- The "frets" array must always have exactly 4 numbers, corresponding to the strings D, G, B, D in that order.
- Look very carefully at the dots, barre lines, and any starting fret numbers next to the diagram (e.g., if it says '3ª' next to the diagram, the top line is the 3rd fret).
"@

foreach ($File in $Files) {
    Write-Host "Processando: $($File.Name)..."
    
    $Bytes = [System.IO.File]::ReadAllBytes($File.FullName)
    $Base64 = [System.Convert]::ToBase64String($Bytes)
    $MimeType = if ($File.Extension -match "png") { "image/png" } else { "image/jpeg" }

    $BodyObj = @{
        contents = @(
            @{
                parts = @(
                    @{ text = $Prompt },
                    @{ inline_data = @{ mime_type = $MimeType; data = $Base64 } }
                )
            }
        )
        generationConfig = @{ temperature = 0.1 }
    }
    
    $JsonBody = $BodyObj | ConvertTo-Json -Depth 10

    try {
        $Uri = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$ApiKey"
        $Response = Invoke-RestMethod -Uri $Uri -Method Post -Headers $Headers -Body $JsonBody -ErrorAction Stop
        
        $Text = $Response.candidates[0].content.parts[0].text
        $CleanText = $Text -replace '```json', '' -replace '```', ''
        $CleanText = $CleanText.Trim()
        
        $ChordsArray = $CleanText | ConvertFrom-Json
        
        foreach ($Chord in $ChordsArray) {
            $Name = $Chord.chordName
            $FretsStr = $Chord.frets -join ","
            
            if (-Not $AllChords.ContainsKey($Name)) {
                $AllChords[$Name] = @()
            }
            
            $Exists = $false
            foreach ($Existing in $AllChords[$Name]) {
                if (($Existing.frets -join ",") -eq $FretsStr) {
                    $Exists = $true
                    break
                }
            }
            
            if (-Not $Exists) {
                $AllChords[$Name] += $Chord
            }
        }
        
        # Salva o arquivo a cada imagem processada
        $ConfigDir = Split-Path $OutputFile
        If (-Not (Test-Path $ConfigDir)) { New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null }
        $AllChords | ConvertTo-Json -Depth 10 | Set-Content -Path $OutputFile -Encoding UTF8

    } catch {
        Write-Host "Erro ao processar $($File.Name): $($_.Exception.Message)"
    }

    # Pausa para respeitar limite da API gratuita (15 req/min)
    Start-Sleep -Seconds 4
}

Write-Host "✅ Extração concluída com sucesso! Dicionário salvo em: $OutputFile"
