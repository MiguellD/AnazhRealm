#!/bin/bash
# gpu-schloss-blick.sh (Station, nur lesen, 30.10.): der Zustand des GPU-Schlosses der OMEN — takt24c (3 Stationen) und takt25b (alle 38)
# blieben ungemessen mit „gpu-lauf.sh schwieg 600 s beim Warten“, ohne CI-Job auf der OMEN. Zeigt Besitzer, Alter, ob der Halter lebt,
# Runner.Worker, die Prozesse um Schloss/Werkbank/Sitzung und das Ende der Job-Logs.
set -u
H=$(dirname "$(dirname "$OUT")"); mkdir -p "$OUT"; o=$OUT/blick.txt
S="${TEMP:-/tmp}/claude/gpu-schloss"
{
  echo "== $(date '+%F %T') Schloss $S"; ls -la "$S" 2>&1; echo "-- besitzer.txt:"; cat "$S/besitzer.txt" 2>&1; echo
  [ -d "$S" ] && echo "-- Alter: $(( $(date +%s) - $(stat -c %Y "$S") )) s"
  p=$(grep -oE 'pid=[0-9]+' "$S/besitzer.txt" 2>/dev/null | head -n 1 | cut -d= -f2)
  [ -n "$p" ] && { echo "-- Halter pid $p:"; tasklist -FI "PID eq $p" 2>&1 | tail -n 2; }
  echo "== Runner.Worker:"; tasklist -FI "IMAGENAME eq Runner.Worker.exe" 2>&1 | tail -n 3
  echo "== Prozesse (gpu-lauf · werkbank · serie · punkte · chrome der Werkbank):"
  powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { \$_.CommandLine -match 'gpu-lauf|werkbank|serie\.sh|punkte\.cjs|messplatz\.sh|remote-debugging-port' } | ForEach-Object { '{0} <-{1} {2:HH:mm:ss} {3}' -f \$_.ProcessId, \$_.ParentProcessId, \$_.CreationDate, \$_.CommandLine.Substring(0,[Math]::Min(180,\$_.CommandLine.Length)) }"
  for id in takt25b-gtx takt25p-gtx z82b-abab; do
    for f in "$H/lauf/$id.out" "$H/lauf/$id/punkte.out"; do [ -f "$f" ] && { echo "== $f ($(wc -l < "$f") Zeilen, Ende)"; grep -v '^\s*$' "$f" | tail -n 30 | cut -c1-240; }; done
    [ -d "$H/lauf/$id" ] && { echo "-- $H/lauf/$id:"; ls -la "$H/lauf/$id" | tail -n 6; }
  done
} > "$o" 2>&1
cat "$o"
