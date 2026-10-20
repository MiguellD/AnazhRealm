#!/bin/bash
# 2010 Bündel-ABAB (Auftrag koordination auftrag/2010-omen-buendel-abab.md, Vorrang vor b-blick; Vorlage p3/n2010/lauf/serie.sh):
# A = n1910-integ (main 80258f0e, V18.546.23) gegen B = n2010-buendel (integ-probe f5b66780, V18.546.25 = A + f1-rest + E-Diät +
# Apparat-Diät). EIN Instrument: werkbank.cjs aus A (A↔B byte-gleich; methoden.txt: das Instrument ruft keine in B fehlende Methode).
# Die Seite liefert nur die Welt (save-server 4312 aus ihrem Baum, absoluter Pfad). Je Boot EINE frische Werkbank-Sitzung (--echt,
# 1920×1080, Regler voll, Tiere frei), je Zelle A1 B1 … A4 B4 verschränkt:
#   g-third: steht (E-Form lauf 30 --ein 20 --ruhe 300) · profil 20 --top 60 (stehend; `_diaetRefresh` inklusiv je Frame) · Geher ·
#            geht (lauf 30 --ein 2)
#   w-ego:   steht · Geher · geht
#   fahrt:   Wiese Third, lauf 10 --ein 20 --ruhe 300 (die Welt ruht) · fahrt.js (GT, aufsitzen, Fahrer 8–12 m/s, Wechsel Third ↔ Ego
#            je 120 Takte in voller Fahrt) · lauf 20 --ein 2 · fahrt-pruef.js
#   blick:   B1 A1 je eine Sitzung, blick.js (Steilhang bergab 8–11 m/s, Third 70 → Ego bis 75° → Third, Schüsse Bild 1–3 danach)
# GPU-Schloss omen-2010 NUR um jeden Boot; Seiten-Wache vor und nach; 20 s Pause; fortsetzbar. Kill nur eigene Prozesse (stopp.ps1).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=$BASE/n1910-integ; B=$BASE/n2010-buendel; INS=$BASE/n1910-integ
OUT=$BASE/p3/n2010/buendel; LOG=$OUT/fortschritt.log; K14=$BASE/p3/k14; mkdir -p $OUT/stand $OUT/gehen $OUT/fahrt $OUT/blick
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
kurz() { node -e 'for (const f of process.argv.slice(1)) { try { const t = require("fs").readFileSync(f, "utf8"); const j = JSON.parse(t.slice(t.indexOf("{"))); const e = j.ergebnis || j; process.stdout.write(`${f.replace(/^.*-/, "").replace(".txt", "")}: fps ${e.fps} F95 ${e.frameMs && e.frameMs.p95} C95 ${e.cpuTaktMs && e.cpuTaktMs.p95} k0 ${e.gpuJePassMs && e.gpuJePassMs.k0 ? e.gpuJePassMs.k0.p50 : "-"} | `); } catch (x) { process.stdout.write("LEER | "); } }' "$@"; }
werkbank_an() { # $1 Datei-Präfix, $2 Ort
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort $2 > $1-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $1-werkbank.log 2>/dev/null && break; sleep 5; done
}
. $BASE/p3/gpu-schloss.sh
for f in geher.js geher-ende.js kreatur-uhr-an.js kreatur-uhr-lesen.js tiere-zensus.js stopp.ps1 fahrt.js fahrt-pruef.js blick.js jpg.cjs; do [ -s $OUT/$f ] || { echo "FEHLT $OUT/$f"; exit 4; }; done
L8="A1 B1 A2 B2 A3 B3 A4 B4"
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
say "SERIE START A=$(git -C $A log -1 --format=%h)[$(git -C $A status --porcelain | wc -l)] B=$(git -C $B log -1 --format=%h)[$(git -C $B status --porcelain | wc -l)] Instrument=$(git -C $INS log -1 --format=%h) ZELLEN=${ZELLEN:-g-third w-ego fahrt blick}"
for Z in ${ZELLEN:-g-third w-ego fahrt blick}; do
  case $Z in g-third) ORT=genesis; SICHT=third;; w-ego) ORT=wiese; SICHT=ego;; fahrt|blick) ORT=wiese; SICHT=third;; esac
  LISTE=${LAEUFE:-$L8}; [ $Z = blick ] && LISTE=${BLICKE:-B1 A1}
  for N in $LISTE; do
    NAME=$Z-$N
    case $Z in fahrt) D=$OUT/fahrt; FERTIG=$D/$NAME-pruef.txt;; blick) D=$OUT/blick/$N; FERTIG=$D/blick.txt;; *) D=$OUT/gehen; FERTIG=$D/$NAME-geht-1.txt;; esac
    mkdir -p $D; [ -s $FERTIG ] && { say "$NAME steht schon"; continue; }
    case $N in A*) WT=$A;; B*) WT=$B;; esac
    schloss_nehmen omen-2010; stopp; seite $NAME $WT
    say "$NAME start FP=$FP gpu[$(gpu)]"
    P=$D/$NAME; [ $Z = blick ] && P=$D/blick
    smi_an $P-smi.csv
    werkbank_an $P $ORT
    $W eval "window.__gf = []; r.state.renderer.backend.device.addEventListener('uncapturederror', (e) => window.__gf.push(String((e.error && e.error.message) || e).slice(0, 200))); return 1" > /dev/null 2>&1
    $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
    $W fenster 1920 1080 > /dev/null 2>&1
    $W umstellen --ort $ORT --sicht $SICHT > $P-umstellen.txt 2>&1
    case $Z in
    g-third|w-ego)
      $W eval "$(cat $OUT/tiere-zensus.js)" > $P-zensus-0.txt 2>&1
      $W eval "$(cat $OUT/kreatur-uhr-an.js)" > $P-kiuhr-an.txt 2>&1
      $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-steht.txt 2>&1
      $W eval "$(cat $OUT/kreatur-uhr-lesen.js)" > $P-kiuhr-steht.txt 2>&1
      [ $Z = g-third ] && $W profil 20 --regler voll --top 60 --tiere frei > $P-profil.json 2>&1
      $W eval "$(cat $OUT/geher.js)" > $P-geher.txt 2>&1
      $W eval "$(cat $OUT/kreatur-uhr-lesen.js)" > /dev/null 2>&1
      $W lauf 30 --ein 2 --regler voll --tiere frei > $P-geht-1.txt 2>&1
      $W eval "$(cat $OUT/kreatur-uhr-lesen.js)" > $P-kiuhr-geht-1.txt 2>&1
      $W eval "$(cat $OUT/geher-ende.js)" > $P-geher-ende.txt 2>&1
      $W eval "$(cat $OUT/tiere-zensus.js)" > $P-zensus-1.txt 2>&1
      ERG="$(kurz $P-steht.txt $P-geht-1.txt) $(tr -d '\n ' < $P-geher-ende.txt | cut -c1-90)" ;;
    fahrt)
      $W lauf 10 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-ein.txt 2>&1
      $W eval "$(cat $OUT/fahrt.js)" > $P-auf.txt 2>&1
      $W lauf 20 --ein 2 --regler voll --tiere frei > $P-lauf.txt 2>&1
      $W eval "$(cat $OUT/fahrt-pruef.js)" > $P-pruef.txt 2>&1
      ERG="$(kurz $P-lauf.txt) auf[$(tr -d '\n ' < $P-auf.txt | cut -c1-110)] pruef[$(tr -d '\n ' < $P-pruef.txt | cut -c1-260)]" ;;
    blick)
      $W lauf 10 --ein 20 --ruhe 300 --regler voll --tiere frei > $D/lauf-0.txt 2>&1
      $W eval "$(cat $OUT/blick.js)" > $D/antwort.txt 2>&1
      node $OUT/jpg.cjs "$(cd $D && pwd -W)/antwort.txt" "$(cd $D && pwd -W)" > $D/blick.txt 2>&1
      ERG="$(tr '\n' ' ' < $D/blick.txt | cut -c1-700)" ;;
    esac
    $W eval "return { gf: window.__gf || [] }" > $P-gpufehler.txt 2>&1
    $W stop > /dev/null 2>&1; kill $SMI 2>/dev/null
    FP2=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
    [ "$FP2" = "$FP" ] || say "$NAME SEITEN-WACHE NACHHER ROT"
    say "$NAME ende gpu[$(gpu)] $ERG"
    stopp; aufraeumen $NAME-nach $WT; schloss_loesen omen-2010; sleep 20
  done
done
say "SERIE ENDE A-status[$(git -C $A status --porcelain | wc -l)] B-status[$(git -C $B status --porcelain | wc -l)]"
