#!/bin/bash
# Wartet auf das NÄCHSTE Ereignis aus Workflow-Journalen (Ergebnis, Ende, Stillstand) und endet dann — als Bash run_in_background
# gestartet ist das genau EIN Wecker je Ereignis, ohne den 30-min-Ablauf eines Monitors. Danach neu starten.
# Aufruf: [NUR=<regex>] ereignis-warte.sh <merk-ordner> <name>=<workflow-dir> [<name>=<workflow-dir> …]
WZ=$(dirname "$0"); M="$1"; shift; mkdir -p "$M"; DIRS=()
for p in "$@"; do n=${p%%=*}; d=${p#*=}; DIRS+=("$d")
  ( node "$WZ/journal-wache.cjs" "$d/journal.jsonl" --merke "$M/wache-$n.merk" --einmal ${NUR:+--nur "$NUR"} | sed -u "s/^/[$n] /" ) & done
( node "$WZ/stillstand-wache.cjs" 60 "${DIRS[@]}" --merke "$M/stillstand.merk" --einmal ) &
wait -n; sleep 2
# die Geschwister enden: node läuft unter Unter-Shells, die Merk-Pfade sind je Lauf eindeutig
ps -ef | grep -F -e "$M/wache-" -e "$M/stillstand.merk" | grep -v -F "grep" | awk '{print $2}' | xargs -r kill 2>/dev/null; exit 0
