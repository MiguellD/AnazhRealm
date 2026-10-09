#!/bin/bash
# Ein Boot am Werkplatz: ./boot.sh <name> <seite-port> [werkbank-port]
# startet die Werkbank aus host-vram gegen den save-server <seite-port>, stellt die Mess-Wiese wie die Messfolge,
# fährt band (einschwingen + VRAM), den Ziel-Zensus und den Bild-Satz, und stoppt die Welt.
P2=/c/Users/micha/Desktop/AnazhRealm-OMEN/p2
WT=/c/Users/micha/Desktop/AnazhRealm-OMEN/host-vram
N=$1; SEITE=$2; export WERKBANK_PORT=${3:-7900}
W="node $WT/scripts/werkbank.cjs"
say() { echo "$(date +%T) $N $*" | tee -a $P2/boot.log; }
(cd $WT && node scripts/werkbank.cjs start --echt --port $WERKBANK_PORT --seite http://localhost:$SEITE > $P2/werkbank-$N.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $P2/werkbank-$N.log 2>/dev/null && break; sleep 5; done
say "bereit"
$W eval "window.__gpuFehlerP2 = []; r.state.renderer.backend.device.addEventListener('uncapturederror', (e) => window.__gpuFehlerP2.push(String((e.error && e.error.message) || e).slice(0, 200))); return 1" > /dev/null
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > $P2/$N-umstellen.json
$W eval "return window.__buehne()" > /dev/null
$W eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
$W band --datei $P2/$N-band.json > $P2/$N-band.txt 2>&1
say "band $(head -1 $P2/$N-band.txt)"
$W ziele --n 12 --json $P2/$N-ziele.json > $P2/$N-ziele.txt 2>&1
say "ziele exit=$? $(grep -c '◀' $P2/$N-ziele.txt) markiert, $(grep -m1 'ZIEL-ZENSUS' $P2/$N-ziele.txt)"
bash $P2/bilder.sh $P2/bilder/$N $WERKBANK_PORT > $P2/$N-bilder.txt 2>&1
node $P2/bewegung.cjs $WERKBANK_PORT $P2/bilder/$N-bewegung >> $P2/$N-bilder.txt 2>&1
say "bilder $(ls $P2/bilder/$N | wc -l) bewegung $(ls $P2/bilder/$N-bewegung 2>/dev/null | wc -l)"
$W eval "return window.__gpuFehlerP2 || ['kein Hoerer']" > $P2/$N-gpufehler.txt
say "gpu-fehler: $(tr -d '\n' < $P2/$N-gpufehler.txt | cut -c1-160)"
$W stop > /dev/null 2>&1
sleep 3
say "gestoppt"
