#!/bin/bash
# 2310 M36 siedlung.K5 neu an Zug 2 40d00ade (n2010-b2a, stadt-erwachen); Kopie von ms/m36.sh: werkbank --echt Station dorf; die Zelle −4,−6 (512 m südlich, Dorf-Info,
# Bauplatz) erwacht im Spielpfad gehend (4 m/s ab 450 m, durch den Vorlauf-Ring), nH 12 und nH 300 per Zell-Info; je Boot m36-erstes-haus.js:
# Erwachen → gesetzt → im Sichtradius → gezeichnet, Bau-Hash. Folge 12 300 12 300, frische Boots, Regler frei. Schloss, Vorfahrt, Nachtruhe.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$BASE/n2010-b2a; H=$BASE/p3/n2210/zug2; OUT=$H/m36; mkdir -p $OUT/stand
STOPP=$(cygpath -w $H/stopp.ps1); export WERKBANK_PORT=4490; W="node $WT/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $H/fortschritt.log; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $H/stopp.log 2>&1; sleep 3; }
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
worker() { tasklist //FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
. $BASE/p3/gpu-schloss.sh
say "M36 START Kopf $(git -C $WT log -1 --format=%h)[$(git -C $WT status --porcelain | wc -l)]"
for L in "1 12" "2 300" "3 12" "4 300"; do
  set -- $L; N=$1; NH=$2; P=$OUT/b$N-nh$NH; [ -s $P.txt ] && continue
  nachtruhe; while worker; do sleep 30; done; schloss_nehmen omen-2310-m36; stopp
  mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
  (cd $WT && PORT=4312 node "$(cygpath -w $WT)\save-server.js" > $P-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  (cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort dorf > $P-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $P-werkbank.log 2>/dev/null && break; sleep 5; done
  $W fenster 1920 1080 > /dev/null 2>&1
  $W umstellen --ort dorf --sicht ego > $P-umstellen.txt 2>&1
  $W lauf 10 --ein 20 --ruhe 120 --regler frei --tiere frei > $P-ein.txt 2>&1
  timeout 900 $W eval "window.__m36 = { zelle: [-4, -6], nH: $NH, start: 450, maxBilder: 15000 }; $(cat $H/m36-erstes-haus.js)" > $P.txt 2>&1
  $W stop > /dev/null 2>&1; stopp
  mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
  schloss_loesen omen-2310-m36
  say "m36-b$N nH $NH $(tr -d '\n ' < $P.txt | cut -c1-420)"
  sleep 15
done
say "M36 ENDE"
