#!/bin/bash
# 2210 Profiband K1 Zelle STURM mit der Stamm-Bühne (Vorher der Karte tier-satz), GTX: Werkzeug k1-buehnen (n2210-kb, Spiel = main e3dd2b67), 2 frische Boots.
# Je Boot: `start --ort wiese`, `umstellen --ort wiese --sicht ego`, einschwingen, dann `lauf 30 --ein 2 --wetter stormy --tiere 50
# --wandern bahn` (die Bühne stellt 50 Tiere frei im Ring, der Geher lebt im Lauf) und in JEDEM Boot `takt 20` mit derselben Bühne.
# Schloss je Boot, Nachtruhe.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$BASE/n2210-kb; H=$BASE/p3/n2210/sturm2; OUT=$H/roh; mkdir -p $OUT/stand
STOPP=$(cygpath -w $H/stopp.ps1); export WERKBANK_PORT=4490; W="node $WT/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $H/fortschritt.log; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $H/stopp.log 2>&1; sleep 3; }
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
kurz() { node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");try{const e=JSON.parse(t.slice(t.indexOf("{"),t.lastIndexOf("}")+1));const b=e.belegung&&e.belegung.belegungMs;process.stdout.write(`fps ${e.fps} F95 ${e.frameMs.p95} F99 ${e.frameMs.p99} C95 ${e.cpuTaktMs.p95} Bel95 ${b&&b.p95} Weg ${e.bahnM} Wetter ${e.wetter} Tiere ${e.buehnenTiere}`)}catch(x){process.stdout.write("LEER")}' "$1"; }
f95() { node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");try{console.log(JSON.parse(t.slice(t.indexOf("{"),t.lastIndexOf("}")+1)).frameMs.p95||0)}catch(x){console.log(0)}' "$1"; }
. $BASE/p3/gpu-schloss.sh
say "STURM START Kopf $(git -C $WT log -1 --format=%h)[$(git -C $WT status --porcelain | wc -l)]"
for N in 1 2; do
  P=$OUT/sturm-$N; [ -s $P-lauf.txt ] && continue
  nachtruhe; schloss_nehmen omen-2210-st; stopp
  mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
  (cd $WT && PORT=4312 node "$(cygpath -w $WT)\\save-server.js" > $P-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  (cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort wiese > $P-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $P-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
  $W fenster 1920 1080 > /dev/null 2>&1
  $W umstellen --ort wiese --sicht ego > $P-umstellen.txt 2>&1
  $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-ein.txt 2>&1
  $W eval 'return { tiere: r.state.creatures.length }' > $P-zensus.txt 2>&1
  $W lauf 30 --ein 2 --regler voll --tiere 50 --wetter stormy --wandern bahn > $P-lauf.txt 2>&1
  F=$(f95 $P-lauf.txt); ZER=""
  if true; then
    $W takt 20 --ein 2 --tiere 50 --wetter stormy --wandern bahn --json $(cygpath -m $P-takt.json) > $P-takt.out 2>&1; ZER="takt EXIT=$? $(head -1 $P-takt.out | cut -c1-200)"
  fi
  $W stop > /dev/null 2>&1; stopp
  mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
  schloss_loesen omen-2210-st
  say "sturm-$N $(kurz $P-lauf.txt) | umstellen[$(tr -d '\n ' < $P-umstellen.txt | cut -c1-160)] $ZER"
  sleep 15
done
say "STURM ENDE Kopf-Status[$(git -C $WT status --porcelain | wc -l)]"
