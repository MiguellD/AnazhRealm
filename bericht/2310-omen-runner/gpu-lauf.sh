#!/bin/bash
# gpu-lauf.sh der OMEN für die Punkte-Maschine (koordination meisterkarte-quelle/punkte/punkte.cjs, PUNKTE_GPU_LAUF=<dieser Pfad>):
#   gpu-lauf.sh <name> <exe> [args…]
# Nimmt DASSELBE Schloss wie der Runner-Hook (p3/gpu-schloss.sh: mkdir $TEMP/claude/gpu-schloss, besitzer.txt Zeile 1 der Name, Zeile 2
# pid=<Windows-PID> dieses Laufs) mit Vorfahrt für einen wartenden oder laufenden CI-Job (Runner.Worker) und der Nachtruhe 03:25–04:15.
# Ein Halter, dessen pid nicht lebt, ist verwaist (schloss_verwaist). Exit 75, wenn das Schloss nach GPU_LAUF_WARTE_S (Vorgabe 2700) nicht
# frei wird. Der Befehl läuft mit dem Deckel GPU_LAUF_MAX_S: am Deckel fällt der GANZE Prozessbaum (taskkill -F -T; 23.10.: Git-Bash-
# `timeout` tötete nur das direkte Kind, Chrome zeichnete weiter), Exit 124. Ein Herzschlag frischt besitzer.txt alle 5 min auf.
. /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh
NAME="omen-${1:?name}"; shift
WARTE=${GPU_LAUF_WARTE_S:-2700}; MAX=${GPU_LAUF_MAX_S:-3600}; T0=$(date +%s)
worker() { tasklist -FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
nacht() { local hm=$((10#$(date +%H%M))); [ $hm -ge 325 ] && [ $hm -lt 415 ]; }
until ! nacht && ! worker && ! ci_wartet && mkdir "$GPU_SCHLOSS" 2>/dev/null; do
  schloss_verwaist
  [ $(( $(date +%s) - T0 )) -ge "$WARTE" ] && { echo "gpu-lauf: Schloss nach $WARTE s nicht frei ('$(schloss_erster)')" >&2; exit 75; }
  sleep 15
done
printf '%s\npid=%s\n' "$NAME" "$(cat /proc/$$/winpid 2>/dev/null)" > "$GPU_SCHLOSS/besitzer.txt"
trap 'kill $HERZ 2>/dev/null; schloss_loesen "$NAME"' EXIT
ci_ruhe
# der Herzschlag hält keine Ausgabe offen: sonst wartete jeder Leser der Ausgabe auf sein `sleep 300` (jede GTX-Station dauerte k × 5 min)
( while sleep 300; do [ "$(schloss_erster)" = "$NAME" ] && touch "$GPU_SCHLOSS/besitzer.txt"; done ) >/dev/null 2>&1 </dev/null & HERZ=$!
"$@" & KIND=$!
WK=$(cat /proc/$KIND/winpid 2>/dev/null)
ENDE=$(( $(date +%s) + MAX ))
while kill -0 $KIND 2>/dev/null; do
  if [ $(date +%s) -ge $ENDE ]; then
    echo "gpu-lauf: Deckel $MAX s - der Prozessbaum ab pid $WK faellt" >&2
    [ -n "$WK" ] && taskkill -F -T -PID "$WK" > /dev/null 2>&1
    kill -9 $KIND 2>/dev/null; wait $KIND 2>/dev/null
    exit 124
  fi
  sleep 2
done
wait $KIND
