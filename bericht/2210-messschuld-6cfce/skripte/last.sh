#!/bin/bash
# last.sh <tag> — die Fremdlast vor einem Lauf: CPU-Last %, Takt, fremde Browser/Node-Prozesse, das GPU-Schloss
echo "$1 $(date -Iseconds) $(powershell -NoProfile -c '$c=Get-CimInstance Win32_Processor; $l=(Get-Counter "\Prozessorinformationen(_Total)\% Prozessorzeit" -ErrorAction SilentlyContinue).CounterSamples.CookedValue; if(-not $l){$l=$c.LoadPercentage}; "cpu%=" + [math]::Round($l) + " chrome=" + (Get-Process chrome -ErrorAction SilentlyContinue).Count + " node=" + (Get-Process node -ErrorAction SilentlyContinue).Count')"
