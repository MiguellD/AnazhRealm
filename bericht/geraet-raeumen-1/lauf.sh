#!/bin/bash
# zug/geraet-raeumen.sh — Station (30.10.): beendet die ALTE Dienst-Kette der OMEN (`p3/messplatz.sh`, läuft seit 25.10. 20:15 neben dem
# Dienst `p3/messplatz/messplatz.sh`), nur wenn ihr Log seit ≥ 60 min schweigt. Den laufenden Dienst (er fährt diese Station) trifft das
# Muster nie: dort steht `p3/messplatz/messplatz.sh`. HP-Dienste (OMEN Command Center) bleiben — sie halten das Leistungsprofil der Messungen.
powershell -NoProfile -Command '
$alt = @(Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match "AnazhRealm-OMEN/p3/messplatz\.sh" })
"alte Kette: " + (($alt | ForEach-Object { "$($_.ProcessId)<-$($_.ParentProcessId) $($_.Name) $($_.CreationDate.ToString("dd. HH:mm"))" }) -join " | ")
if (-not $alt.Count) { "nichts zu räumen"; exit 0 }
$log = $null; foreach ($p in $alt) { if ($p.CommandLine -match ">>\s*([^\s\x22]+)") { $log = $Matches[1] -replace "^/c/", "C:/" } }
$still = 9999; if ($log -and (Test-Path $log)) { $still = [math]::Round(((Get-Date) - (Get-Item $log).LastWriteTime).TotalMinutes) }
"Log $log schweigt seit $still min"
if ($still -lt 60) { "LEBT — nichts beendet"; exit 3 }
foreach ($p in $alt) { try { Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop; "beendet $($p.ProcessId) $($p.Name)" } catch { "nicht beendet $($p.ProcessId): $($_.Exception.Message)" } }
' 2>&1 | tee "$OUT/raeumen.txt"
