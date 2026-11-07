#!/bin/bash
# bildpaar.sh <tag> <baum> <port> <schuss-datei> — EINE echte Welt (Radeon) im Baum; jede Zeile der Schuss-Datei „<name> <werkbank-befehl …>“,
# ein bild-Befehl schreibt /tmp/claude/w3/bp/<tag>-<name>.png. Aufruf unter dem GPU-Schloss: gpu-lauf.sh bild-<tag> bash bildpaar.sh …
T=$1; W=$2; P=$3; F=$4; O=/tmp/claude/w3/bp; mkdir -p $O
S=$P; WB=$((P+1)); cd "$W" || exit 1
export WERKBANK_PORT=$WB
PORT=$S node save-server.js > $O/$T-save.log 2>&1 & SV=$!
node scripts/werkbank.cjs start --echt --port $WB --seite http://localhost:$S > $O/$T-welt.log 2>&1 & WP=$!
ende() { node scripts/werkbank.cjs stop --port $WB > /dev/null 2>&1 < /dev/null; sleep 3; for p in $WP $SV; do w=$(cat /proc/$p/winpid 2>/dev/null); [ -n "$w" ] && taskkill //F //T //PID $w > /dev/null 2>&1; kill $p 2>/dev/null; done; }
trap ende EXIT
for i in $(seq 1 240); do grep -q "WERKBANK bereit" $O/$T-welt.log && break; grep -q "WERKBANK-FEHLER" $O/$T-welt.log && { echo "[$T] Welt-Fehler: $(tail -3 $O/$T-welt.log | tr '\n' ' ')"; exit 3; }; sleep 1; done
echo "[$T] Welt bereit nach $i s"
while read -r name cmd; do
  case "$name" in ""|\#*) continue;; esac
  if [[ "$cmd" == bild* ]]; then r=$(timeout 300 node scripts/werkbank.cjs $cmd --port $WB --datei "$(cygpath -w $O/$T-$name.png)" 2>&1 < /dev/null | tail -1 | cut -c1-160)
  else r=$(timeout 300 node scripts/werkbank.cjs $cmd --port $WB 2>&1 < /dev/null | tail -1 | cut -c1-160); fi
  echo "[$T] $name: $r"
done < "$F"
