#!/bin/bash
# Gang-Sequenz: die Kamera steht, der Spieler (Bezug der Stufen-Wahl) geht 8 x 2 m ueber eine Chunk-Grenze
TAG=${1:-vorher}; NUR=${NUR:-0}
WT=${WT:-/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/boden-stufen}
S=/c/Users/micha/AppData/Local/Temp/claude/boden-stufen
OUT=${OUT:-/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/boden-stufen/artifacts/profiband/welle-95/boden-stufen/bilder}; mkdir -p $OUT
export WERKBANK_PORT=${WERKBANK_PORT:-8900}; cd $WT
W=1920; H=1080
# Gang +x ueber die Grenze -864 (Chunk -21 | -20), z -850; Kamera hinten, Blick +x
# Gang -z ueber die Grenze -864 (Chunk -20 | -21), x -900; Kamera hinten (z -846), Blick -z
GX=${GX:--900}; Z0=${Z0:--853}; CZ=${CZ:--850}; CY=${CY:-+3}; LZ=${LZ:--930}; LY=${LY:-+0}
node scripts/werkbank.cjs eval "window.__nurBoden = $NUR === 1; window.__serie = {}; window.__W=$W; window.__H=$H; return 1" > /dev/null
for i in 0 1 2 3 4 5 6 7; do
  ZI=$(node -e "console.log($Z0 - 2*$i)")
  node scripts/werkbank.cjs eval "window.__sp={x:$GX,z:$ZI}; window.__si=$i; return 1" > /dev/null
  echo "$TAG $i $(node scripts/werkbank.cjs eval "$(cat $S/pump.js)" | tr -d '\n ' | head -c 300)"
  [ $i = 0 ] && node scripts/werkbank.cjs bild $GX $CY $CZ $GX $LY $LZ --w $W --h $H --wahl 0 > /dev/null 2>&1
  node scripts/werkbank.cjs bild $GX $CY $CZ $GX $LY $LZ --w $W --h $H --wahl 0 --datei $OUT/$TAG-gang-$i.png > $S/$TAG-bild-$i.txt 2>&1
  node scripts/werkbank.cjs eval "$(cat $S/merk.js)" > /dev/null
  if [ $i = 0 ]; then
    node scripts/werkbank.cjs bild $GX $CY $CZ $GX $LY $LZ --w $W --h $H --wahl 0 > /dev/null 2>&1
    node scripts/werkbank.cjs eval "window.__serie.r0 = window.__letzteAufnahme.slice(0); return 1" > /dev/null
  fi
done
node scripts/werkbank.cjs eval "window.__reg=[0.2,0.48,0,0.85]; $(cat $S/diff.js)" > $OUT/$TAG-sprung.json
cat $OUT/$TAG-sprung.json
