param(
  [string]$TranscriptDir = "transcripts",
  [string]$VoiceMapFile = "assets/audio/voice-map.json",
  [string]$Filter = "",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# ── Load voice map ──
$mapPath = Join-Path $PSScriptRoot $VoiceMapFile
if (!(Test-Path $mapPath)) { throw "Voice map not found: $mapPath" }
$voiceMap = Get-Content $mapPath -Raw | ConvertFrom-Json

# ── API key ──
$apiKey = $env:ELEVENLABS_API_KEY
if (!$apiKey) {
  Write-Warning "ELEVENLABS_API_KEY not set — using embedded key (single-session only). For production, set the env var."
  $apiKey = "1b6d2589eb165dce9923482b03750ff2dcb0fd51599126e4c8d8cc85c127a06d"
}

$headers = @{
  'xi-api-key' = $apiKey
  'Content-Type' = 'application/json'
}

$TTS_URI = 'https://api.elevenlabs.io/v1/text-to-speech'

# ── Stats ──
$generated = 0; $skipped = 0; $errors = 0

function Get-VoiceId($key) {
  $v = $voiceMap.voices.$key
  if ($v) { return $v.id }
  throw "Unknown voice key: $key"
}
function Get-VoiceName($key) {
  $v = $voiceMap.voices.$key
  if ($v) { return $v.name }
  return $key
}

function Invoke-GenerateAudio {
  param($Entry, $Section, $Index)
  $src = $Entry.src -replace '^\.\./', ''
  $outPath = Join-Path $PSScriptRoot $src
  $relDir = (Split-Path $src -Parent) -replace '/', '\'
  $filename = [System.IO.Path]::GetFileNameWithoutExtension((Split-Path $src -Leaf))
  $transcriptFile = [System.IO.Path]::Combine($PSScriptRoot, $TranscriptDir, $relDir, "$filename.txt")

  if (!(Test-Path $transcriptFile)) {
    Write-Warning "Transcript not found: $transcriptFile — skipped"
    $script:skipped++; return
  }

  if (!$Filter -or $src -like "*$Filter*") {
    Write-Host "─── [$Section`#$Index] $filename ───" -ForegroundColor Cyan
  }

  $voiceList = @()
  if ($Entry.speaker) { $voiceList += @{ role = "speaker"; key = $Entry.speaker } }
  else {
    if ($Entry.female) { $voiceList += @{ role = "female"; key = $Entry.female } }
    if ($Entry.male)   { $voiceList += @{ role = "male";   key = $Entry.male } }
  }
  if ($voiceList.Count -eq 0) { $script:skipped++; return }

  $lines = Get-Content $transcriptFile
  $tempFiles = @(); $lineNum = 0

  :lines foreach ($line in $lines) {
    $lineNum++; $line = $line.Trim()
    if (!$line -or $line -match '^#|^//') { continue }
    $role = ""
    if ($line -match '^\[(female|male|speaker)\]\s*(.*)') {
      $role, $text = $matches[1], $matches[2]
    } else { $text = $line }
    if (!$text) { continue }

    if ($role -eq "speaker" -and $Entry.speaker) { $voiceKey = $Entry.speaker }
    elseif ($role -eq "female" -and $Entry.female) { $voiceKey = $Entry.female }
    elseif ($role -eq "male" -and $Entry.male) { $voiceKey = $Entry.male }
    else { $voiceKey = $voiceList[0].key }

    $voiceId = Get-VoiceId $voiceKey
    $voiceDisplay = Get-VoiceName $voiceKey

    if (!$Filter -or $src -like "*$Filter*") {
      Write-Host "  [$voiceDisplay] $text" -ForegroundColor DarkGray
    }

    $bodyJson = @{
      text = $text
      voice_settings = @{ stability = 0.45; similarity_boost = 0.75 }
    } | ConvertTo-Json

    $tempFile = [System.IO.Path]::GetTempFileName() + ".mp3"
    $tempFiles += $tempFile

    try {
      $resp = Invoke-WebRequest -Uri "$TTS_URI/$voiceId" -Headers $headers -Body $bodyJson -Method Post -ContentType 'application/json' -ErrorAction Stop
      [IO.File]::WriteAllBytes($tempFile, $resp.Content)
    } catch {
      Write-Error "  TTS failed line $lineNum ($voiceDisplay): $($_.Exception.Message)"
      $script:errors++; continue lines
    }
  }

  if ($tempFiles.Count -eq 0) { $script:skipped++; return }

  # ── Concatenate ──
  $outDir = Split-Path $outPath -Parent
  if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

  # ElevenLabs returns valid single-voice MP3 per call.
  # MP3 frames are self-delimiting — simple concatenation works.
  try {
    $combined = [System.Collections.Generic.List[byte]]::new()
    foreach ($tf in $tempFiles) { $combined.AddRange([IO.File]::ReadAllBytes($tf)); Remove-Item $tf -Force -ErrorAction SilentlyContinue }
    [IO.File]::WriteAllBytes($outPath, $combined.ToArray())
    Write-Host "  → $((Get-Item $outPath).Length / 1KB -as [int]) KB written" -ForegroundColor Green
    $script:generated++
  } catch { Write-Error "  Failed: $_"; $script:errors++ }
}

# ── Main ──
Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  MET Audio Generator (ElevenLabs)   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Cyan

$sections = @{
  "Instructions" = $voiceMap.instructions
  "Part 1"       = $voiceMap.part1
  "Part 2"       = $voiceMap.part2
  "Part 3"       = $voiceMap.part3
}

foreach ($section in $sections.Keys) {
  $entries = $sections[$section]
  if (!$entries) { continue }
  $idx = 0
  foreach ($entry in $entries) {
    $idx++
    if (!$Filter -or $entry.src -like "*$Filter*") {
      Invoke-GenerateAudio -Entry $entry -Section $section -Index $idx
    }
  }
}

Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Generated: $generated   Skipped: $skipped   Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { 'Red' } else { 'Green' })
