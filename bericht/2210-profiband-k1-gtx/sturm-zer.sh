#!/bin/bash
# 2210 Profiband K1 Nachlauf STURM-Zerlegung: in serie.sh endete der Geher (geher-ende.js) VOR dem takt — die Zerlegung stand still (Bahn null m). Hier läuft der Geher durch lauf UND takt, der takt läuft in jedem Boot.
# --echt 1920×1080, Regler voll, Tiere frei. Je Boot: einschwingen (lauf 30 --ein 20 --ruhe 300), die Bewegung der Zelle, dann
# `lauf 30 --ein 2` IN der Bewegung (Frame p95/p99, CPU-Takt p95, Belegung). Liegt Frame p95 > 33 ms, zerlegt derselbe Boot den Takt
# (`takt 20 --ein 2 --wandern aus`, die Bewegung der Zelle läuft weiter). Zellen: w-ego (Wiese Ego, Geher 4 m/s) · g-third (Genesis
# Third, Geher) · sprint (Wiese Ego, Geher mit state.sprintSpeed) · fahrt (Wiese, GT 8–12 m/s, Third ↔ Ego je 120 Takte) · sturm
# (Wiese Ego, Geher, „stormy“ + 50 Tiere). Messort stadt: nicht im Haushalt (Werkzeug fehlt). Schloss je Boot, Nachtruhe.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$BASE/n2010-b2b; H=$BASE/p3/n2210/k1; OUT=$H/roh; mkdir -p $OUT/stand
STOPP=$(cygpath -w $H/stopp.ps1); export WERKBANK_PORT=4490; W="node $WT/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $H/fortschritt.log; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $H/stopp.log 2>&1; sleep 3; }
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
kurz() { node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");try{const j=JSON.parse(t.slice(t.indexOf("{"),t.lastIndexOf("}")+1));const e=j.ergebnis||j;const b=e.belegung&&e.belegung.belegungMs;process.stdout.write(`fps ${e.fps} F95 ${e.frameMs&&e.frameMs.p95} F99 ${e.frameMs&&e.frameMs.p99} C95 ${e.cpuTaktMs&&e.cpuTaktMs.p95} Bel95 ${b&&b.p95}`)}catch(x){process.stdout.write("LEER")}' "$1"; }
f95() { node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");try{const j=JSON.parse(t.slice(t.indexOf("{"),t.lastIndexOf("}")+1));console.log(((j.ergebnis||j).frameMs||{}).p95||0)}catch(x){console.log(0)}' "$1"; }
. $BASE/p3/gpu-schloss.sh
say "STURMZ START Kopf $(git -C $WT log -1 --format=%h)[$(git -C $WT status --porcelain | wc -l)] ZELLEN=${ZELLEN:-w-ego g-third sprint fahrt sturm}"
for Z in sturmz; do
  case $Z in g-third) ORT=genesis; SICHT=third;; fahrt) ORT=wiese; SICHT=third;; *) ORT=wiese; SICHT=ego;; esac
  for N in 1 2; do
    P=$OUT/$Z-$N; [ -s $P-lauf.txt ] && continue
    nachtruhe; schloss_nehmen omen-2210-k1; stopp
    mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
    (cd $WT && PORT=4312 node "$(cygpath -w $WT)\\save-server.js" > $P-save.log 2>&1 &)
    for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
    (cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort $ORT > $P-werkbank.log 2>&1 &)
    for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $P-werkbank.log 2>/dev/null && break; sleep 5; done
    $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
    $W fenster 1920 1080 > /dev/null 2>&1
    $W umstellen --ort $ORT --sicht $SICHT > $P-umstellen.txt 2>&1
    $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-ein.txt 2>&1
    case $Z in
      w-ego|g-third) $W eval "window.__geherV = 4; $(cat $H/geher.js)" > $P-auf.txt 2>&1;;
      sprint) $W eval "window.__geherV = r.state.sprintSpeed; $(cat $H/geher.js)" > $P-auf.txt 2>&1;;
      sturmz) $W eval "$(cat $H/sturm.js)" > $P-sturm.txt 2>&1; $W eval "window.__geherV = 4; $(cat $H/geher.js)" > $P-auf.txt 2>&1;;
      fahrt) $W eval "$(cat $H/fahrt.js)" > $P-auf.txt 2>&1;;
    esac
    $W eval "$(cat $H/tiere-zensus.js)" > $P-zensus.txt 2>&1
    $W lauf 30 --ein 2 --regler voll --tiere frei > $P-lauf.txt 2>&1
    F=$(f95 $P-lauf.txt)
    $W takt 20 --ein 2 --wandern aus --json $(cygpath -m $P-takt.json) > $P-takt.out 2>&1; ZER="takt EXIT=$? $(head -2 $P-takt.out | tr '\n' ' ' | cut -c1-200)"
    $W eval "$(cat $H/geher-ende.js)" > $P-pruef.txt 2>&1
    $W stop > /dev/null 2>&1; stopp
    mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
    schloss_loesen omen-2210-k1
    say "$Z-$N $(kurz $P-lauf.txt) | auf[$(tr -d '\n ' < $P-auf.txt | cut -c1-120)] pruef[$(tr -d '\n ' < $P-pruef.txt | cut -c1-160)] $([ -s $P-sturm.txt ] && echo "sturm[$(tr -d '\n ' < $P-sturm.txt | cut -c1-120)]") $ZER"
    sleep 15
  done
done
say "STURMZ ENDE Kopf-Status[$(git -C $WT status --porcelain | wc -l)]"
