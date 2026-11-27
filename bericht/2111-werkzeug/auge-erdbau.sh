#!/bin/bash
# bash auge-erdbau.sh <sha40> <ausgabe-ordner> — das Auge am Erdbau an EINEM Kopf (eigener save-server :4851, Werkbank --echt :4852,
# Messort wiese). Geht NICHT durchs GPU-Schloss: vorher besitzer.txt lesen, nie neben einer Hand-Sitzung.
export NODE_PATH="C:/Users/micha/AnazhRealm-profiband/node_modules"; export MSYS_NO_PATHCONV=1
S="C:/Users/micha/AppData/Local/Temp/claude/3c7f7ef9549389d2/9198e0cd-302f-42e2-be9b-9e3a035ce699/scratchpad"
cd C:/Users/micha/AnazhRealm-auge-4a188 || exit 2
git fetch -q origin "$1"; git checkout -q --detach "$1" || exit 3
echo "KOPF $(git rev-parse --short=8 HEAD) · START $(date +%H:%M:%S)"
PORT=4851 node save-server.js > "$S/auge-server.log" 2>&1 & SPID=$!
sleep 6
node scripts/werkbank.cjs start --echt --seite http://localhost:4851 --port 4852 --ort wiese > "$S/auge-werk.log" 2>&1 & WPID=$!
bereit=0; for i in $(seq 1 480); do grep -q "WERKBANK bereit" "$S/auge-werk.log" 2>/dev/null && { bereit=1; break; }; kill -0 $WPID 2>/dev/null || break; sleep 1; done
echo "BEREIT $bereit nach ${i} s · $(date +%H:%M:%S)"
[ "$bereit" = 1 ] && { node "$S/auge-erdbau.cjs" "$2"; echo "RUNDE Exit $? · $(date +%H:%M:%S)"; }
node scripts/werkbank.cjs stop --port 4852 >> "$S/auge-werk.log" 2>&1; sleep 2; kill $WPID $SPID 2>/dev/null
echo "ENDE $(date +%H:%M:%S)"
