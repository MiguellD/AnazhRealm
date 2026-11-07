#!/bin/bash
# winter-bild.sh <n> — Welt in hz-<n> starten, Winter-Fernsicht schießen, Welt stoppen
n=$1; cd /tmp/claude/w3/hz-$n || exit 1
P=4493
node scripts/werkbank.cjs start --port $P > /tmp/claude/w3/wb-$n.log 2>&1 &
WB=$!
for i in $(seq 1 90); do grep -qiE "bereit|steht|lauscht|listening|:$P" /tmp/claude/w3/wb-$n.log && break; sleep 2; done
sleep 5
node scripts/werkbank.cjs bild 446.82 49.75 457.43 405.77 40.34 663.79 --saison winter --uhr 0.5 --w 1280 --h 720 --datei "$(cygpath -w /tmp/claude/w3/winter-$n.png)" --port $P 2>&1 | tail -2 | cut -c1-200
node scripts/werkbank.cjs bild 446.82 49.75 457.43 405.77 40.34 663.79 --uhr 0.5 --w 1280 --h 720 --datei "$(cygpath -w /tmp/claude/w3/sommer-$n.png)" --port $P 2>&1 | tail -1 | cut -c1-200
node scripts/werkbank.cjs stop --port $P > /dev/null 2>&1
sleep 2; kill $WB 2>/dev/null
