#!/bin/bash
# 2310 ABAB Zug 5 (Koordinator 23.10.): A = n2010-b2b (main 452972a6) gegen B = n2010-b2a (7c6f4b49, V18.546.73 = main + material-mikro +
# material-lack). Instrument = werkbank aus B. Zellen je 2+2: w-ego (Wiese Ego steht + gpu-bank + geht), g-third (Genesis Third steht +
# gpu-bank), d-ego (Dorf −4,−4 Ego 8 Uhr steht + gpu-bank). Kopie von zug4/serie.sh.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=$BASE/n2010-b2b; B=$BASE/n2010-b2a; INS=$BASE/n2010-b2a
OUT=$BASE/p3/n2210/zug5; LOG=$OUT/fortschritt.log; K14=$BASE/p3/k14; mkdir -p $OUT/stand $OUT/gehen $OUT/fahrt $OUT/blick
STOPP=$(cygpath -w $OUT/stopp.ps1)
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; sleep 3; }
seite() { # $1 Lauf, $2 Baum -> save-server 4312 + FP
  mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null
  (cd $2 && PORT=4312 node "$(cygpath -w $2)\\save-server.js" > $OUT/stand/$1-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  FP=$(node $K14/fingerabdruck.cjs $2 2>>$LOG) || { say "$1 SEITEN-WACHE ROT ($2)"; stopp; schloss_loesen omen-2310-z5; exit 3; }
}
aufraeumen() { mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null; return 0; }
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
smi_an() { nvidia-smi --query-gpu=timestamp,clocks.gr,clocks.mem,temperature.gpu,power.draw,pstate,clocks_throttle_reasons.active,memory.used --format=csv,noheader -l 1 > $1 2>/dev/null & SMI=$!; }
kurz() { node -e 'for (const f of process.argv.slice(1)) { try { const t = require("fs").readFileSync(f, "utf8"); const j = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1)); const e = j.ergebnis || j; process.stdout.write(`${f.replace(/^.*-/, "").replace(".txt", "")}: fps ${e.fps} F95 ${e.frameMs && e.frameMs.p95} C95 ${e.cpuTaktMs && e.cpuTaktMs.p95} k0 ${e.gpuJePassMs && e.gpuJePassMs.k0 ? e.gpuJePassMs.k0.p50 : "-"} | `); } catch (x) { process.stdout.write("LEER | "); } }' "$@"; }
werkbank_an() { # $1 Datei-Präfix, $2 Ort
  rm -f $1-werkbank.log; (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort $2 > $1-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $1-werkbank.log 2>/dev/null && break; sleep 5; done
}
. $BASE/p3/gpu-schloss.sh
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
for f in geher.js geher-ende.js kreatur-uhr-an.js kreatur-uhr-lesen.js tiere-zensus.js stopp.ps1 fahrt.js fahrt-pruef.js blick.js jpg.cjs; do [ -s $OUT/$f ] || { echo "FEHLT $OUT/$f"; exit 4; }; done
L8="A1 B1 A2 B2"; L16="A1 B1 A2 B2 A3 B3 A4 B4"
worker() { tasklist //FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
vorfahrt() { local w=0; while worker; do [ $w = 0 ] && say "VORFAHRT: Runner.Worker läuft - warte"; w=1; sleep 30; done; }
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
say "SERIE START A=$(git -C $A log -1 --format=%h)[$(git -C $A status --porcelain | wc -l)] B=$(git -C $B log -1 --format=%h)[$(git -C $B status --porcelain | wc -l)] Instrument=$(git -C $INS log -1 --format=%h) ZELLEN=${ZELLEN:-w-ego g-third d-ego}"
for Z in ${ZELLEN:-w-ego g-third d-ego}; do
  case $Z in g-third) ORT=genesis; SICHT=third;; w-ego|w-tier|hieb) ORT=wiese; SICHT=ego;; d-ego) ORT=dorf; SICHT=ego;; sturm) ORT=wiese; SICHT=ego;; stadt) ORT=stadt; SICHT=ego;; fahrt|blick) ORT=wiese; SICHT=third;; esac
  LISTE=${LAEUFE:-$L8}
  for N in $LISTE; do
    NAME=$Z-$N
    case $Z in fahrt) D=$OUT/fahrt; FERTIG=$D/$NAME-pruef.txt;; blick) D=$OUT/blick/$N; FERTIG=$D/blick.txt;; d-ego|g-third) D=$OUT/gehen; FERTIG=$D/$NAME-bank.txt;;
    w-tier) D=$OUT/tier; FERTIG=$D/$NAME-bank-mit2.txt;;
    hieb) D=$OUT/hieb; FERTIG=$D/$NAME-latenz.json;; *) D=$OUT/gehen; FERTIG=$D/$NAME-geht-1.txt;; esac
    mkdir -p $D; [ -s $FERTIG ] && { say "$NAME steht schon"; continue; }
    case $N in A*) WT=$A;; B*) WT=$B;; esac
    nachtruhe; vorfahrt; schloss_nehmen omen-2310-z5; stopp; seite $NAME $WT
    say "$NAME start FP=$FP gpu[$(gpu)]"
    P=$D/$NAME; [ $Z = blick ] && P=$D/blick
    smi_an $P-smi.csv
    werkbank_an $P $ORT
    $W eval "window.__gf = []; r.state.renderer.backend.device.addEventListener('uncapturederror', (e) => window.__gf.push(String((e.error && e.error.message) || e).slice(0, 200))); return 1" > /dev/null 2>&1
    case $Z in d-ego|stadt) ;; *) $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1;; esac
    $W fenster 1920 1080 > /dev/null 2>&1
    $W umstellen --ort $ORT --sicht $SICHT > $P-umstellen.txt 2>&1
    case $Z in
    w-ego|sturm|stadt)
      $W eval "$(cat $OUT/tiere-zensus.js)" > $P-zensus-0.txt 2>&1
      $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-steht.txt 2>&1
      [ $Z = w-ego ] && $W gpu-bank 12 --runden 5 > $P-bank.txt 2>&1
      case $Z in
        sturm) $W lauf 30 --ein 2 --regler voll --tiere 50 --wetter stormy --wandern bahn > $P-geht-1.txt 2>&1;;
        *) $W lauf 30 --ein 2 --regler voll --tiere frei --wandern bahn > $P-geht-1.txt 2>&1;;
      esac
      $W eval "$(cat $OUT/tiere-zensus.js)" > $P-zensus-1.txt 2>&1
      ERG="$(kurz $P-steht.txt $P-geht-1.txt)" ;;
    w-tier)
      $W eval "$(cat $OUT/tiere-zensus.js)" > $P-zensus-0.txt 2>&1
      $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-steht.txt 2>&1
      $W gpu-bank 12 --runden 5 > $P-bank-mit.txt 2>&1
      $W eval "r.toggleCreatures(false); return r.state.creaturesHidden" > $P-aus.txt 2>&1
      $W lauf 3 --ein 1 --regler voll --tiere frei > $P-lauf-ohne.txt 2>&1
      $W gpu-bank 12 --runden 5 > $P-bank-ohne.txt 2>&1
      $W eval "r.toggleCreatures(true); return r.state.creaturesHidden" > $P-an.txt 2>&1
      $W lauf 3 --ein 1 --regler voll --tiere frei > $P-lauf-mit2.txt 2>&1
      $W gpu-bank 12 --runden 5 > $P-bank-mit2.txt 2>&1
      ERG="$(kurz $P-steht.txt) bank[$(for b in mit ohne mit2; do grep -o '"gpuJeFrameMs": [0-9.]*' $P-bank-$b.txt | cut -d' ' -f2 | tr '
' ' '; done)] ohne[$(node $OUT/szene.cjs $P-lauf-ohne.txt | cut -c1-40)] mit2[$(node $OUT/szene.cjs $P-lauf-mit2.txt | cut -c1-40)]" ;;
    hieb)
      $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-steht.txt 2>&1
      timeout 900 $W latenz --proben 30 --sicht ego --verb hieb --json "$(cygpath -w $P-latenz.json)" > $P-latenz.txt 2>&1
      ERG="$(kurz $P-steht.txt) latenz[$(tr -d n < $P-latenz.txt | cut -c1-260)]" ;;
    g-third)
      $W eval "$(cat $OUT/tiere-zensus.js)" > $P-zensus-0.txt 2>&1
      $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-steht.txt 2>&1
      $W gpu-bank 12 --runden 5 > $P-bank.txt 2>&1
      ERG="$(kurz $P-steht.txt)" ;;
    d-ego)
      $W eval "$(cat $OUT/uhr8.js)" > $P-uhr.txt 2>&1
      $W eval "$(cat $OUT/tiere-zensus.js)" > $P-zensus-0.txt 2>&1
      $W eval "$(cat $OUT/kreatur-uhr-an.js)" > $P-kiuhr-an.txt 2>&1
      $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-steht.txt 2>&1
      $W eval "$(cat $OUT/kreatur-uhr-lesen.js)" > $P-kiuhr-steht.txt 2>&1
      $W gpu-bank 12 --runden 5 > $P-bank.txt 2>&1
      $W eval "return { uhr: +r.state.timeOfDay.toFixed(4) }" > $P-uhr-ende.txt 2>&1
      ERG="$(kurz $P-steht.txt) $(node $OUT/szene.cjs $P-steht.txt) uhr[$(tr -d '
 ' < $P-uhr.txt | cut -c1-80)] ende[$(tr -d '
 ' < $P-uhr-ende.txt | cut -c1-50)]" ;;
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
    stopp; aufraeumen $NAME-nach $WT; schloss_loesen omen-2310-z5; sleep 20
  done
done
say "SERIE ENDE A-status[$(git -C $A status --porcelain | wc -l)] B-status[$(git -C $B status --porcelain | wc -l)]"
