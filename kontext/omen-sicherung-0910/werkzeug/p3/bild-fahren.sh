#!/bin/bash
# Bild-Beweis der Leben-Schau-Orte am echten Renderer: ./bild-fahren.sh <name> <seite-port>
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
WT=/c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-fahren
N=$1; SEITE=$2; export WERKBANK_PORT=7900
W="node $WT/scripts/werkbank.cjs"
OUT=$(cd $P3 && pwd -W)/bilder/$N; mkdir -p $P3/bilder/$N
(cd $WT && node scripts/werkbank.cjs start --echt --port 7900 --seite http://localhost:$SEITE > $P3/werkbank-$N.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $P3/werkbank-$N.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; window.__gpuFehlerP3 = []; r.state.renderer.backend.device.addEventListener('uncapturederror', (e) => window.__gpuFehlerP3.push(String((e.error && e.error.message) || e).slice(0, 200))); return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > /dev/null
for fall in ${3:-hangfuss spalt}; do
  node $P3/fahrt-bild.cjs 7900 $fall > $P3/$N-$fall.json
  seite=$(node -e "const o=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).ergebnis;console.log(o.seite)" $P3/$N-$fall.json)
  oben=$(node -e "const o=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).ergebnis;console.log(o.oben)" $P3/$N-$fall.json)
  $W bild $seite --w 1920 --h 1080 --datei "$OUT/$fall-seite.png" > /dev/null
  $W bild $oben --w 1920 --h 1080 --datei "$OUT/$fall-oben.png" > /dev/null
  echo "$N $fall $(cat $P3/$N-$fall.json | cut -c1-260)"
done
echo "$N gpu-fehler $($W eval 'return window.__gpuFehlerP3' | tr -d '\n')"
$W stop > /dev/null 2>&1; sleep 3
