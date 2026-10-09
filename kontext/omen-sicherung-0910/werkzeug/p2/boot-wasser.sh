#!/bin/bash
# Ein Wasser-Boot: ./boot-wasser.sh <name> <seite-port>
P2=/c/Users/micha/Desktop/AnazhRealm-OMEN/p2
WT=/c/Users/micha/Desktop/AnazhRealm-OMEN/host-vram
N=$1; SEITE=$2; export WERKBANK_PORT=7900
W="node $WT/scripts/werkbank.cjs"
(cd $WT && node scripts/werkbank.cjs start --echt --port 7900 --seite http://localhost:$SEITE > $P2/werkbank-$N.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $P2/werkbank-$N.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > /dev/null
$W eval "return window.__buehne()" > /dev/null
$W band --datei $P2/$N-band.json > $P2/$N-band.txt 2>&1
bash $P2/wasser.sh $P2/bilder/w-$N 7900 > $P2/$N-wasser.txt 2>&1
echo "$(date +%T) $N wasser $(ls $P2/bilder/w-$N | wc -l) $(head -1 $P2/$N-band.txt | cut -c1-90)" >> $P2/boot.log
$W stop > /dev/null 2>&1; sleep 3
