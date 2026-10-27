#!/bin/bash
# p3/messplatz/serie.sh — die EINE ABAB-Serie des Messplatz-Dienstes (koordination zug/messplatz.md; aus p3/n2210/zug6/serie-takt.sh):
# MP_A, MP_B (Bäume), MP_OUT (Roh-Ordner), MP_LOCK (Schloss-Name), ZELLEN, LAEUFE, MP_INS (Instrument: A = Vorgabe, die Werkbank von main (Koordinator 23.10.), B, oder seite =
# die Werkbank des Baums jedes Boots). Bootet das Instrument eine Seite nicht binnen 3 min (z9: die Werkbank aus B wartete auf
# `anazhRealm.erwacht`, das A nicht trug), fällt dieser Boot auf die Werkbank seines eigenen Baums zurück — benannt im Log
# (`INSTRUMENT`). Helfer unter werkzeug/.
# Je Boot frisch: Schloss, Seiten-Wache (Fingerabdruck vor und nach), Vorfahrt Runner.Worker, stopp.ps1, save-server :4312.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=${MP_A:?}; B=${MP_B:?}; case ${MP_INS:-A} in B) INS=$B;; *) INS=$A;; esac; WZ=$BASE/p3/messplatz/werkzeug
OUT=${MP_OUT:?}; LOG=$OUT/fortschritt.log; K14=$BASE/p3/k14; mkdir -p $OUT/stand $OUT/gehen $OUT/fahrt $OUT/blick
STOPP=$(cygpath -w $WZ/stopp.ps1)
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; sleep 3; }
seite() { # $1 Lauf, $2 Baum -> save-server 4312 + FP
  mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null
  (cd $2 && PORT=4312 node "$(cygpath -w $2)\\save-server.js" > $OUT/stand/$1-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  FP=$(node $K14/fingerabdruck.cjs $2 2>>$LOG) || { say "$1 SEITEN-WACHE ROT ($2)"; stopp; schloss_loesen ${MP_LOCK:?}; exit 3; }
}
seite_neu() { seite "$(basename $1)-rueckfall" $2; } # nach einem Instrument-Rückfall: frischer Stand und save-server am Baum des Boots
aufraeumen() { mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null; return 0; }
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
smi_an() { nvidia-smi --query-gpu=timestamp,clocks.gr,clocks.mem,temperature.gpu,power.draw,pstate,clocks_throttle_reasons.active,memory.used --format=csv,noheader -l 1 > $1 2>/dev/null & SMI=$!; }
kurz() { node -e 'for (const f of process.argv.slice(1)) { try { const t = require("fs").readFileSync(f, "utf8"); const j = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1)); const e = j.ergebnis || j; process.stdout.write(`${f.replace(/^.*-/, "").replace(".txt", "")}: fps ${e.fps} F95 ${e.frameMs && e.frameMs.p95} C95 ${e.cpuTaktMs && e.cpuTaktMs.p95} k0 ${e.gpuJePassMs && e.gpuJePassMs.k0 ? e.gpuJePassMs.k0.p50 : "-"} | `); } catch (x) { process.stdout.write("LEER | "); } }' "$@"; }
werkbank_an() { # $1 Datei-Präfix, $2 Ort, $3 Baum des Boots -> setzt W auf das Instrument, das bereit wurde
  local ins=$INS; [ "${MP_INS:-A}" = seite ] && ins=$3
  for versuch in 1 2; do
    rm -f $1-werkbank.log; (cd $ins && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort $2 > $1-werkbank.log 2>&1 &)
    for t in $(seq 1 36); do grep -qE "bereit|FEHLER" $1-werkbank.log 2>/dev/null && break; sleep 5; done
    W="node $ins/scripts/werkbank.cjs"
    grep -q "bereit" $1-werkbank.log 2>/dev/null && { echo "$(git -C $ins log -1 --format=%h)" > $1-instrument.txt; return 0; }
    [ "$ins" = "$3" ] && break
    say "$(basename $1) INSTRUMENT $(git -C $ins log -1 --format=%h) bootet die Seite nicht in 3 min - Rückfall auf die Werkbank des eigenen Baums"
    $W stop > /dev/null 2>&1; stopp; seite_neu $1 $3; ins=$3
  done
  say "$(basename $1) WERKBANK NICHT BEREIT"; return 1
}
. $BASE/p3/gpu-schloss.sh
for f in geher.js geher-ende.js kreatur-uhr-an.js kreatur-uhr-lesen.js tiere-zensus.js stopp.ps1 fahrt.js fahrt-pruef.js blick.js jpg.cjs; do [ -s $WZ/$f ] || { echo "FEHLT $WZ/$f"; exit 4; }; done
L8="A1 B1 A2 B2"; L16="A1 B1 A2 B2 A3 B3 A4 B4"
worker() { tasklist -FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
# VORFAHRT je Boot: das Schloss ist zwischen zwei Boots frei (schloss_loesen am Boot-Ende); ein laufender oder wartender CI-Job
# geht vor, danach setzt die Zelle mit dem nächsten Boot fort — jede Seite bekommt gleich viele Boots unter gleichen Bedingungen.
# 25.10.: die Wartezeit als Zeile `<id> VORFAHRT <zelle-boot> gewartet <min>` nach zug/fortschritt.txt (fortschritt aus messplatz.sh).
vorfahrt() { local w=0 t0=$(date +%s); while worker || ci_wartet; do [ $w = 0 ] && say "VORFAHRT: CI-Job läuft oder wartet - warte"; w=1; sleep 30; done
  [ $w = 1 ] && type fortschritt > /dev/null 2>&1 && fortschritt "${MP_ID:-serie} VORFAHRT $NAME gewartet $(awk -v s=$(( $(date +%s) - t0 )) 'BEGIN { printf "%.1f", s / 60 }')"; return 0; }
# STORNO je Boot (25.10.: takt2-abab lief storniert weiter): Exit 5, der Dienst bucht nichts
storno_probe() { [ -n "${MP_ID:-}" ] && type storniert > /dev/null 2>&1 && git -C "$MK" fetch -q origin koordination 2>/dev/null && storniert "$MP_ID"; }
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
say "SERIE START A=$(git -C $A log -1 --format=%h)[$(git -C $A status --porcelain | wc -l)] B=$(git -C $B log -1 --format=%h)[$(git -C $B status --porcelain | wc -l)] Instrument=$(git -C $INS log -1 --format=%h) ZELLEN=${ZELLEN:-fahrt d-ego w-ego g-third stadt}"
for Z in ${ZELLEN:-fahrt d-ego w-ego g-third stadt}; do
  case $Z in g-third) ORT=genesis; SICHT=third;; w-ego|w-tier|hieb|takt) ORT=wiese; SICHT=ego;; d-ego|d-takt) ORT=dorf; SICHT=ego;; sturm) ORT=wiese; SICHT=ego;; stadt) ORT=stadt; SICHT=ego;; fahrt|blick) ORT=wiese; SICHT=third;; esac
  LISTE=${LAEUFE:-$L8}
  for N in $LISTE; do
    NAME=$Z-$N
    case $Z in fahrt) D=$OUT/fahrt; FERTIG=$D/$NAME-pruef.txt;; blick) D=$OUT/blick/$N; FERTIG=$D/blick.txt;; d-ego|g-third) D=$OUT/gehen; FERTIG=$D/$NAME-bank.txt;;
    w-tier) D=$OUT/tier; FERTIG=$D/$NAME-bank-mit2.txt;;
    hieb) D=$OUT/hieb; FERTIG=$D/$NAME-latenz.json;;
    takt|d-takt) D=$OUT/takt; FERTIG=$D/$NAME-takt.txt;; *) D=$OUT/gehen; FERTIG=$D/$NAME-geht-1.txt;; esac
    mkdir -p $D; [ -s $FERTIG ] && { say "$NAME steht schon"; continue; }
    case $N in A*) WT=$A;; B*) WT=$B;; esac
    storno_probe && { say "$NAME STORNO - die Serie bricht ab"; exit 5; }
    vorfahrt; schloss_nehmen ${MP_LOCK:?}; stopp; seite $NAME $WT
    say "$NAME start FP=$FP gpu[$(gpu)]"
    P=$D/$NAME; [ $Z = blick ] && P=$D/blick
    smi_an $P-smi.csv
    werkbank_an $P $ORT $WT
    $W eval "window.__gf = []; r.state.renderer.backend.device.addEventListener('uncapturederror', (e) => window.__gf.push(String((e.error && e.error.message) || e).slice(0, 200))); return 1" > /dev/null 2>&1
    case $Z in d-ego|d-takt|stadt) ;; *) $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1;; esac
    $W fenster 1920 1080 > /dev/null 2>&1
    $W umstellen --ort $ORT --sicht $SICHT > $P-umstellen.txt 2>&1
    case $Z in
    w-ego|sturm|stadt)
      $W eval "$(cat $WZ/tiere-zensus.js)" > $P-zensus-0.txt 2>&1
      $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-steht.txt 2>&1
      [ $Z = w-ego ] && $W gpu-bank 12 --runden 5 > $P-bank.txt 2>&1
      case $Z in
        sturm) $W lauf 30 --ein 2 --regler voll --tiere 50 --wetter stormy --wandern bahn > $P-geht-1.txt 2>&1;;
        *) $W lauf 30 --ein 2 --regler voll --tiere frei --wandern bahn > $P-geht-1.txt 2>&1;;
      esac
      $W eval "$(cat $WZ/tiere-zensus.js)" > $P-zensus-1.txt 2>&1
      ERG="$(kurz $P-steht.txt $P-geht-1.txt)" ;;
    w-tier)
      $W eval "$(cat $WZ/tiere-zensus.js)" > $P-zensus-0.txt 2>&1
      $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-steht.txt 2>&1
      $W gpu-bank 12 --runden 5 > $P-bank-mit.txt 2>&1
      $W eval "r.toggleCreatures(false); return r.state.creaturesHidden" > $P-aus.txt 2>&1
      $W lauf 3 --ein 1 --regler voll --tiere frei > $P-lauf-ohne.txt 2>&1
      $W gpu-bank 12 --runden 5 > $P-bank-ohne.txt 2>&1
      $W eval "r.toggleCreatures(true); return r.state.creaturesHidden" > $P-an.txt 2>&1
      $W lauf 3 --ein 1 --regler voll --tiere frei > $P-lauf-mit2.txt 2>&1
      $W gpu-bank 12 --runden 5 > $P-bank-mit2.txt 2>&1
      ERG="$(kurz $P-steht.txt) bank[$(for b in mit ohne mit2; do grep -o '"gpuJeFrameMs": [0-9.]*' $P-bank-$b.txt | cut -d' ' -f2 | tr '
' ' '; done)] ohne[$(node $WZ/szene.cjs $P-lauf-ohne.txt | cut -c1-40)] mit2[$(node $WZ/szene.cjs $P-lauf-mit2.txt | cut -c1-40)]" ;;
    takt)
      $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-steht.txt 2>&1
      timeout 600 $W takt 30 --ein 2 --wandern bahn --tiere frei --json "$(cygpath -w $P-takt.json)" > $P-takt.txt 2>&1
      ERG="$(kurz $P-steht.txt) takt[$(head -12 $P-takt.txt | tr "
" " " | cut -c1-400)]" ;;
    d-takt) # z13 (24.10.): die Zerlegung des CPU-Takts im Dorf stehend, je Methode (p3/n2410/z13/takt-delta.cjs); ohne Kreatur-Uhr (ihre Hülle läge im Profil)
      $W eval "$(cat $WZ/uhr8.js)" > $P-uhr.txt 2>&1
      $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-steht.txt 2>&1
      timeout 900 $W takt 60 --ein 2 --wandern aus --regler voll --tiere frei --json "$(cygpath -w $P-takt.json)" > $P-takt.txt 2>&1
      ERG="$(kurz $P-steht.txt) takt[$(head -1 $P-takt.txt | cut -c1-200)]" ;;
    hieb)
      $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-steht.txt 2>&1
      timeout 900 $W latenz --proben 30 --sicht ego --verb hieb --json "$(cygpath -w $P-latenz.json)" > $P-latenz.txt 2>&1
      ERG="$(kurz $P-steht.txt) latenz[$(tr -d n < $P-latenz.txt | cut -c1-260)]" ;;
    g-third)
      $W eval "$(cat $WZ/tiere-zensus.js)" > $P-zensus-0.txt 2>&1
      $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-steht.txt 2>&1
      $W gpu-bank 12 --runden 5 > $P-bank.txt 2>&1
      ERG="$(kurz $P-steht.txt)" ;;
    d-ego)
      $W eval "$(cat $WZ/uhr8.js)" > $P-uhr.txt 2>&1
      $W eval "$(cat $WZ/tiere-zensus.js)" > $P-zensus-0.txt 2>&1
      $W eval "$(cat $WZ/kreatur-uhr-an.js)" > $P-kiuhr-an.txt 2>&1
      $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-steht.txt 2>&1
      $W eval "$(cat $WZ/kreatur-uhr-lesen.js)" > $P-kiuhr-steht.txt 2>&1
      $W gpu-bank 12 --runden 5 > $P-bank.txt 2>&1
      $W eval "return { uhr: +r.state.timeOfDay.toFixed(4) }" > $P-uhr-ende.txt 2>&1
      ERG="$(kurz $P-steht.txt) $(node $WZ/szene.cjs $P-steht.txt) uhr[$(tr -d '
 ' < $P-uhr.txt | cut -c1-80)] ende[$(tr -d '
 ' < $P-uhr-ende.txt | cut -c1-50)]" ;;
    fahrt)
      $W lauf 10 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-ein.txt 2>&1
      $W eval "$(cat $WZ/fahrt.js)" > $P-auf.txt 2>&1
      $W lauf 20 --ein 2 --regler voll --tiere frei > $P-lauf.txt 2>&1
      $W eval "$(cat $WZ/fahrt-pruef.js)" > $P-pruef.txt 2>&1
      ERG="$(kurz $P-lauf.txt) auf[$(tr -d '\n ' < $P-auf.txt | cut -c1-110)] pruef[$(tr -d '\n ' < $P-pruef.txt | cut -c1-260)]" ;;
    blick)
      $W lauf 10 --ein 20 --ruhe 300 --regler voll --tiere frei > $D/lauf-0.txt 2>&1
      $W eval "$(cat $WZ/blick.js)" > $D/antwort.txt 2>&1
      node $WZ/jpg.cjs "$(cd $D && pwd -W)/antwort.txt" "$(cd $D && pwd -W)" > $D/blick.txt 2>&1
      ERG="$(tr '\n' ' ' < $D/blick.txt | cut -c1-700)" ;;
    esac
    $W eval "return { gf: window.__gf || [] }" > $P-gpufehler.txt 2>&1
    $W stop > /dev/null 2>&1; kill $SMI 2>/dev/null
    FP2=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
    [ "$FP2" = "$FP" ] || say "$NAME SEITEN-WACHE NACHHER ROT"
    say "$NAME ende gpu[$(gpu)] $ERG"
    stopp; aufraeumen $NAME-nach $WT; schloss_loesen ${MP_LOCK:?}; sleep 20
  done
done
say "SERIE ENDE A-status[$(git -C $A status --porcelain | wc -l)] B-status[$(git -C $B status --porcelain | wc -l)]"
