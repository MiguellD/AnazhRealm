# aufraeumen.ps1 — beendet, was Arbeiter und Augen-Runden liegen lassen (Lehre 14.10.: 11 h vergessener Spiel-Tab, Werkbank-Fenster,
# 7 save-server, Puppeteer-Browser, 13 journal-wache — sie zogen Radeon-Leistung und verrauschten die lokalen Messungen).
# Aufruf: powershell -File artifacts/profiband/werkzeug/aufraeumen.ps1 [-Trocken]
# Nach JEDER Welle, nach jeder Augen-Runde und bei der Notbremse. Der Spiel-Server des Schöpfers (Port 4312) bleibt immer stehen.
# Die Tabs im Chat-Browser schließt der Koordinator selbst (tabs_context → tabs_close) — preview_stop schließt KEINEN Tab.
param([switch]$Trocken)
$schoepferPort = 4312
$schutz = @{}
Get-NetTCPConnection -State Listen -LocalPort $schoepferPort -ErrorAction SilentlyContinue | ForEach-Object { $schutz[$_.OwningProcess] = $true }
$alle = Get-CimInstance Win32_Process -Filter "Name='node.exe' OR Name='chrome.exe'"
$ziele = $alle | Where-Object {
    $c = $_.CommandLine
    if (-not $c -or $schutz[$_.ProcessId]) { return $false }
    ($_.Name -eq 'node.exe' -and $c -match 'werkbank\.cjs|journal-wache\.cjs|save-server\.js|auge-server\.cjs|npm-cli\.js.* run (gate|playtest|diag)') -or
    ($_.Name -eq 'chrome.exe' -and $c -match '\\\.cache\\puppeteer\\')
}
foreach ($p in $ziele) {
    $kurz = $p.CommandLine.Substring(0, [Math]::Min(110, $p.CommandLine.Length))
    if ($Trocken) { "WÜRDE {0} {1}" -f $p.ProcessId, $kurz } else { taskkill /PID $p.ProcessId /T /F 2>$null | Out-Null; "BEENDET {0} {1}" -f $p.ProcessId, $kurz }
}
"Treffer: " + ($ziele | Measure-Object).Count + $(if ($schutz.Count) { " · geschützt: Spiel-Server :4312" } else { "" })
$schloss = Join-Path $env:TEMP 'claude\gpu-schloss'
if (Test-Path $schloss) { "GPU-SCHLOSS gehalten: " + (Get-Content (Join-Path $schloss 'besitzer.txt') -ErrorAction SilentlyContinue | Select-Object -First 1) }
