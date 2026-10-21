#!/bin/bash
# 2010 Bündel-2-ABAB Zelle BLICK bei Uhr 0,27 (Wiese, Ego): je Seite EINE Werkbank-Sitzung (--echt, Instrument A n2010-b2a, die Seite
# liefert nur die Welt), dorf-aus · fenster 1920×1080 · umstellen --ort wiese --sicht ego · lauf 10 --ein 20 --ruhe 300 (die Welt ruht) ·
# die Kamera des Spielers lesen (Auge + 60 m voraus) · `bild … --uhr 0.5` (Mittag, Vergleich) und `bild … --uhr 0.27` (Tiefsonne), je
# 1920×1080, `--wahl 0` (genau diese Pose). Frage: an A über Mittag ausgewaschen, an B goldene Tiefsonne dunkler als Mittag?
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INS=$BASE/n2010-b2b
OUT=$BASE/p3/n2110/buendel3; D0=$OUT/blick; LOG=$OUT/fortschritt.log; K14=$BASE/p3/k14; mkdir -p $D0 $OUT/stand
STOPP=$(cygpath -w $OUT/stopp.ps1)
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; sleep 3; }
beiseite() { mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null; return 0; }
. $BASE/p3/gpu-schloss.sh
for N in ${BLICKE:-B1 A1}; do
  case $N in A*) WT=$BASE/n2010-b2a;; B*) WT=$BASE/n2010-b2b;; esac
  D=$D0/$N; mkdir -p $D; [ -s $D/uhr-027.png ] && { say "blick-$N steht schon"; continue; }
  schloss_nehmen omen-2010; stopp; beiseite blick-$N $WT
  (cd $WT && PORT=4312 node "$(cygpath -w $WT)\\save-server.js" > $D/save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  FP=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || { say "blick-$N SEITEN-WACHE ROT"; stopp; schloss_loesen omen-2010; exit 3; }
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort wiese > $D/werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/werkbank.log 2>/dev/null && break; sleep 5; done
  say "blick-$N start $(git -C $WT log -1 --format=%h) FP=$FP"
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
  $W fenster 1920 1080 > /dev/null 2>&1
  $W umstellen --ort wiese --sicht ego > $D/umstellen.txt 2>&1
  $W lauf 10 --ein 20 --ruhe 300 --regler voll --tiere frei > $D/lauf-0.txt 2>&1
  POSE=$($W eval "const c = r.state.camera; const d = c.getWorldDirection(new window.THREE.Vector3()); const p = c.position; return [p.x, p.y, p.z, p.x + d.x * 60, p.y + d.y * 60, p.z + d.z * 60].map((v) => +v.toFixed(2)).join(' ');" 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s.slice(s.indexOf("{")));console.log(j.ergebnis)}catch(e){console.log("")}})')
  echo "$POSE" > $D/pose.txt
  for U in 0.5 0.27; do
    $W bild $POSE --datei $(cygpath -m $D/uhr-${U/./}.png) --w 1920 --h 1080 --uhr $U --wahl 0 > $D/bild-${U/./}.txt 2>&1
  done
  $W stop > /dev/null 2>&1
  FP2=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
  [ "$FP2" = "$FP" ] || say "blick-$N SEITEN-WACHE NACHHER ROT"
  say "blick-$N ende pose[$POSE] $(ls $D/*.png 2>/dev/null | wc -l) Bilder"
  stopp; beiseite blick-$N-nach $WT; schloss_loesen omen-2010; sleep 20
done
say "BLICK ENDE"
