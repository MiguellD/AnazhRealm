#!/bin/bash
# 2010 (1) B-Wald im Lauf (Auftrag koordination auftrag/2010-omen-b-blick.md §1, ≤ 45 min; Vorlage p3/n1910/f1/serie.sh Phase GEHEN):
# A = n1910-f1b (main e93134f4, V18.546.22) gegen B = n1910-integ (integ-probe 80258f0e, V18.546.23 = A + b-wald + Versions-Stufe).
# EIN Instrument: werkbank.cjs aus A (A↔B byte-gleich; methoden.txt: B entfernt keine Stamm-Methode). Die Seite liefert nur die Welt
# (save-server 4312 aus ihrem Baum, mit absolutem Pfad gestartet: stopp.ps1 kennt ihn so beim Namen).
# Je Boot EINE frische Werkbank-Sitzung (--echt, 1920×1080, Regler voll, Tiere frei): dorf-aus, fenster, umstellen --ort --sicht,
#   Tier-Zensus, KI-Uhr an `updateCreatures`,
#   STEHT = die Lauf-Form der E-Zelle (omen-messfolge lauf-voll: lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei; die Bühne
#   stellt der Lauf selbst), danach der Geher (geher.js: 4 m/s geradeaus −z 0 → −60 m und zurück, Haken in tickAffordances),
#   GEHT = lauf 30 --ein 2 (ein Hin und Zurück), Geher-Ende (gesetzter Weg, Abweichung der Lage), Zensus.
# Zellen: Genesis Third (steht = E-Zelle, geht) und Wiese Ego (geht; steht nebenbei), je A1 B1 … A4 B4 verschränkt.
# GPU-Schloss omen-2010 NUR um jeden Boot; Seiten-Wache (p3/k14/fingerabdruck.cjs) vor und nach jedem Boot; 25 s Pause;
# fortsetzbar (ein fertiger Boot wird übersprungen). Kill nur der eigenen Prozesse über stopp.ps1.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=$BASE/n1910-f1b; B=$BASE/n1910-integ; INS=$BASE/n1910-f1b
OUT=$BASE/p3/n2010/lauf; LOG=$OUT/fortschritt.log; K14=$BASE/p3/k14; mkdir -p $OUT/stand $OUT/gehen
STOPP=$(cygpath -w $OUT/stopp.ps1)
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; sleep 3; }
seite() { # $1 Lauf, $2 Baum -> save-server 4312 + FP
  mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null
  (cd $2 && PORT=4312 node "$(cygpath -w $2)\\save-server.js" > $OUT/stand/$1-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  FP=$(node $K14/fingerabdruck.cjs $2 2>>$LOG) || { say "$1 SEITEN-WACHE ROT ($2)"; stopp; schloss_loesen omen-2010; exit 3; }
}
aufraeumen() { mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null; return 0; }
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
smi_an() { nvidia-smi --query-gpu=timestamp,clocks.gr,clocks.mem,temperature.gpu,power.draw,pstate,clocks_throttle_reasons.active,memory.used --format=csv,noheader -l 1 > $1 2>/dev/null & SMI=$!; }
. $BASE/p3/gpu-schloss.sh
for f in geher.js geher-ende.js kreatur-uhr-an.js kreatur-uhr-lesen.js tiere-zensus.js stopp.ps1; do [ -s $OUT/$f ] || { echo "FEHLT $OUT/$f"; exit 4; }; done
L8="A1 B1 A2 B2 A3 B3 A4 B4"
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
say "SERIE START A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h) Instrument=$(git -C $INS log -1 --format=%h) ZELLEN=${ZELLEN:-genesis:third wiese:ego}"
for Z in ${ZELLEN:-genesis:third wiese:ego}; do ORT=${Z%%:*}; SICHT=${Z##*:}; K=${ORT:0:1}-$SICHT
for N in ${LAEUFE:-$L8}; do
  NAME=$K-$N; [ -s $OUT/gehen/$NAME-geht-1.txt ] && { say "$NAME steht schon"; continue; }
  case $N in A*) WT=$A;; B*) WT=$B;; esac
  schloss_nehmen omen-2010; stopp; seite $NAME $WT
  say "$NAME start FP=$FP gpu[$(gpu)]"
  smi_an $OUT/gehen/$NAME-smi.csv
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort $ORT > $OUT/gehen/$NAME-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $OUT/gehen/$NAME-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
  $W fenster 1920 1080 > /dev/null 2>&1
  $W umstellen --ort $ORT --sicht $SICHT > $OUT/gehen/$NAME-umstellen.txt 2>&1
  $W eval "$(cat $OUT/tiere-zensus.js)" > $OUT/gehen/$NAME-zensus-0.txt 2>&1
  $W eval "$(cat $OUT/kreatur-uhr-an.js)" > $OUT/gehen/$NAME-kiuhr-an.txt 2>&1
  $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $OUT/gehen/$NAME-steht.txt 2>&1
  $W eval "$(cat $OUT/kreatur-uhr-lesen.js)" > $OUT/gehen/$NAME-kiuhr-steht.txt 2>&1
  $W eval "$(cat $OUT/geher.js)" > $OUT/gehen/$NAME-geher.txt 2>&1
  $W eval "$(cat $OUT/kreatur-uhr-lesen.js)" > /dev/null 2>&1
  $W lauf 30 --ein 2 --regler voll --tiere frei > $OUT/gehen/$NAME-geht-1.txt 2>&1
  $W eval "$(cat $OUT/kreatur-uhr-lesen.js)" > $OUT/gehen/$NAME-kiuhr-geht-1.txt 2>&1
  $W eval "$(cat $OUT/geher-ende.js)" > $OUT/gehen/$NAME-geher-ende.txt 2>&1
  $W eval "$(cat $OUT/tiere-zensus.js)" > $OUT/gehen/$NAME-zensus-1.txt 2>&1
  $W stop > /dev/null 2>&1; kill $SMI 2>/dev/null
  FP2=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
  [ "$FP2" = "$FP" ] || say "$NAME SEITEN-WACHE NACHHER ROT"
  KURZ=$(node -e 'for (const f of process.argv.slice(1)) { try { const t = require("fs").readFileSync(f, "utf8"); const j = JSON.parse(t.slice(t.indexOf("{"))); const e = j.ergebnis || j; process.stdout.write(`${f.match(/-(steht|geht-1)\.txt$/)[1]}: fps ${e.fps} F95 ${e.frameMs && e.frameMs.p95} C95 ${e.cpuTaktMs && e.cpuTaktMs.p95} k0 ${e.gpuJePassMs && e.gpuJePassMs.k0 ? e.gpuJePassMs.k0.p50 : "-"} | `); } catch (x) { process.stdout.write("LEER | "); } }' $OUT/gehen/$NAME-steht.txt $OUT/gehen/$NAME-geht-1.txt)
  say "$NAME ende gpu[$(gpu)] $KURZ $(tr -d '\n ' < $OUT/gehen/$NAME-geher-ende.txt | cut -c1-110)"
  stopp; aufraeumen $NAME-nach $WT; schloss_loesen omen-2010; sleep 25
done; done
say "SERIE ENDE"
