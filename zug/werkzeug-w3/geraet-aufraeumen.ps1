# geraet-aufraeumen.ps1 — räumt EIN Messgerät auf, ohne Systemeinstellungen zu ändern (10.11. 21:00, Schöpfer: „verwaiste Prozesse,
# Hintergrundanwendungen, ein File, damit sich diese schließen, falls es von den Rechten her nicht anders geht").
# Beendet NUR eigene Waisen: puppeteer-Chrome und node-Prozesse des Projekts, deren Eltern-Prozess nicht mehr lebt, und die
# git-fsmonitor-Dämonen (sie starten bei Bedarf neu). Fremde Apps schließt es nur, wenn der Schöpfer sie mit -Apps nennt.
# Danach druckt es den Stand: RAM, Platte, die größten Prozesse, Worktrees — und was nur der Schöpfer entscheiden kann.
# Aufruf: powershell -ExecutionPolicy Bypass -File geraet-aufraeumen.ps1 [-Repo C:\Pfad\zum\Repo] [-Apps "OneDrive,Teams"]
param([string]$Repo = "", [string]$Apps = "")
$p = Get-CimInstance Win32_Process; $lebt = @{}; $p | ForEach-Object { $lebt[[int]$_.ProcessId] = 1 }
$waise = { param($x) -not $lebt.ContainsKey([int]$x.ParentProcessId) }
$weg = @()
$weg += $p | Where-Object { $_.ExecutablePath -match 'puppeteer|chrome-headless-shell' -and (& $waise $_) }
$weg += $p | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match 'Anazh|punkte\.cjs|werkbank|save-server|playtest' -and (& $waise $_) }
$weg += $p | Where-Object { $_.CommandLine -match 'fsmonitor--daemon' }
foreach ($x in $weg) { try { Stop-Process -Id $x.ProcessId -Force -ErrorAction Stop } catch {} }
"Beendet: $($weg.Count) (verwaister puppeteer-Chrome, verwaiste Projekt-node, git-fsmonitor-Dämonen)"
if ($Apps) {
    foreach ($a in ($Apps -split ',')) { $n = $a.Trim(); if ($n) { Get-Process -Name $n -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; "App geschlossen (auf Wunsch): $n" } }
}
if ($Repo -and (Test-Path $Repo)) { git -C $Repo worktree prune 2>$null; "Worktrees: " + ((git -C $Repo worktree list) | Measure-Object).Count + " (prune: nur Einträge ohne Ordner entfernt)" }
$os = Get-CimInstance Win32_OperatingSystem
"RAM frei {0:N1} von {1:N1} GB · C: frei {2:N1} GB" -f ($os.FreePhysicalMemory / 1MB), ($os.TotalVisibleMemorySize / 1MB), ((Get-PSDrive C).Free / 1GB)
"== die größten Prozesse (MB, Anzahl):"
Get-Process | Group-Object Name | ForEach-Object { [pscustomobject]@{ N = $_.Name; MB = [int](($_.Group | Measure-Object WorkingSet64 -Sum).Sum / 1MB); Z = $_.Count } } |
    Sort-Object MB -Descending | Select-Object -First 12 | ForEach-Object { "  $($_.N) $($_.MB) MB x$($_.Z)" }
"== nur der Schöpfer entscheidet (Systemeinstellungen, nie ein Agent):"
"  - Defender-Ausnahme für die Repo-Ordner (MsMpEng scannt jede Datei jedes Worktrees mit)"
"  - Autostart-Apps abschalten (Einstellungen > Apps > Autostart) — oder einmalig: -Apps `"Name1,Name2`""
"  - alte Worktrees löschen: nur saubere, deren Zweig auf origin liegt (ihr artifacts/-Ordner kann Messdaten tragen)"
