#!/bin/bash
# gpu-schloss-blick.sh (Station, nur lesen, 30.10.): der Zustand des GPU-Schlosses der OMEN — takt24c (3 Stationen), takt25b (38) und
# takt25p (5) blieben ungemessen mit „gpu-lauf.sh schwieg 600 s beim Warten“, ohne CI-Job auf der OMEN. gpu-lauf.sh meldet beim Warten
# alle 60 s; schweigt es, hängt ein Befehl davor (Verdacht: tasklist der Vorfahrt-Probe `worker`, oder der Start der Git-Bash selbst).
# Jeder Aufruf mit Frist und Uhr — die Station hängt nie selbst.
set -u
H=$(dirname "$(dirname "$OUT")"); mkdir -p "$OUT"; o=$OUT/blick.txt
S="${TEMP:-/tmp}/claude/gpu-schloss"
uhr() { local t=$(date +%s%N); timeout "$1" "${@:2}" 2>&1; local r=$?; echo "   [exit $r · $(( ($(date +%s%N) - t) / 1000000 )) ms${r:+$([ $r = 124 ] && echo ' · HÄNGT')}]"; }
{
  echo "== $(date '+%F %T') Schloss $S"; ls -la "$S" 2>&1; echo "-- besitzer.txt:"; cat "$S/besitzer.txt" 2>&1; echo
  [ -d "$S" ] && echo "-- Alter: $(( $(date +%s) - $(stat -c %Y "$S") )) s"
  p=$(grep -oE 'pid=[0-9]+' "$S/besitzer.txt" 2>/dev/null | head -n 1 | cut -d= -f2)
  [ -n "$p" ] && { echo "-- Halter pid $p:"; uhr 30 tasklist -FI "PID eq $p" -NH; }
  echo "== die Vorfahrt-Probe von gpu-lauf (worker):"; uhr 30 tasklist -FI "IMAGENAME eq Runner.Worker.exe"
  echo "== tasklist ohne Filter (Zahl):"; uhr 30 bash -c 'tasklist -NH | wc -l'
  echo "== Start einer Git-Bash:"; uhr 30 bash -c 'echo bash lebt'
  echo "== Prozesse (gpu-lauf · werkbank · serie · punkte · messplatz · chrome mit Debug-Port):"
  uhr 60 powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { \$_.CommandLine -match 'gpu-lauf|werkbank|serie\.sh|punkte\.cjs|messplatz\.sh|remote-debugging-port' } | ForEach-Object { '{0} <-{1} {2:HH:mm:ss} {3}' -f \$_.ProcessId, \$_.ParentProcessId, \$_.CreationDate, \$_.CommandLine.Substring(0,[Math]::Min(180,\$_.CommandLine.Length)) }"
  echo "== bash-Prozesse: $(uhr 30 bash -c 'tasklist -FI "IMAGENAME eq bash.exe" -NH | grep -c bash')"
  for id in takt25b-gtx takt25p-gtx z83-abab z82b-abab; do
    for f in "$H/lauf/$id.out" "$H/lauf/$id/punkte.out"; do [ -f "$f" ] && { echo "== $f ($(wc -l < "$f") Zeilen, Ende)"; grep -v '^\s*$' "$f" | tail -n 25 | cut -c1-240; }; done
    [ -d "$H/lauf/$id" ] && { echo "-- $H/lauf/$id:"; ls -la "$H/lauf/$id" | tail -n 6; }
  done
} > "$o" 2>&1
cat "$o"
