#!/bin/bash
# 1810 F6 Schritt 2 (Seiten nach WEITER des Koordinators): Lauf-ABAB A = n1810-f6m (main f45ee994) gegen B = n1810-f6b (e5db7566,
# Baum 8e54c6c7 = f6-buendel 018945d5 = integ 419efefc + merge nacht-fernfarbe), je Ort × Sicht A1 B1 A2 B2 A3 B3 A4 B4 (Vorlage
# p3/n1710/b4/serie.sh, Sicht als Variable). EIN Instrument: omen-messfolge.cjs + werkbank.cjs aus n1710-g8 (g8-arena 9b3acc1d =
# f45ee994 + G8, meldet `rein` je Pass; A selbst meldet es nicht); die Seite liefert nur die Welt (save-server 4312 aus ihrem Baum).
# Phase STEHEN: omen-messfolge --ort <o> --sicht <s> (--basis A-Boot für B). Phase GEHEN: frische Werkbank-Sitzung, umstellen --ort <o>
#   --sicht <s>, lauf 25 stehend, Geher (4 m/s geradeaus −z 0 → −60 m und zurück, Haken in tickAffordances), zweimal lauf 30 --ein 2.
# GPU-Schloss omen-1710-n NUR um jeden Lauf; Seiten-Wache (p3/k14/fingerabdruck.cjs) vor und nach jedem Welt-Lauf; 60 s Pause; fortsetzbar.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=$BASE/n1810-f6m; B=$BASE/n1810-f6b; INS=$BASE/n1710-g8
OUT=$BASE/p3/n1810/f6; LOG=$OUT/fortschritt.log; K14=$BASE/p3/k14; mkdir -p $OUT/stand $OUT/stehen $OUT/gehen
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil|puppeteer' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
seite() { # $1 Lauf, $2 Baum -> save-server 4312 + FP
  mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null
  (cd $2 && PORT=4312 node save-server.js > $OUT/stand/$1-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  FP=$(node $K14/fingerabdruck.cjs $2 2>>$LOG) || { say "$1 SEITEN-WACHE ROT ($2)"; stopp; schloss_loesen omen-1710-n; exit 3; }
}
aufraeumen() { # Spielstände der Seite beiseite (nach dem Lauf)
  mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null; return 0
}
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
smi_an() { nvidia-smi --query-gpu=timestamp,clocks.gr,clocks.mem,temperature.gpu,power.draw,pstate,clocks_throttle_reasons.active,memory.used --format=csv,noheader -l 1 > $1 2>/dev/null & SMI=$!; }
. $BASE/p3/gpu-schloss.sh
L8="A1 B1 A2 B2 A3 B3 A4 B4"
say "SERIE START A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h) Instrument=$(git -C $INS log -1 --format=%h) PHASEN=${PHASEN:-stehen gehen} ORTE=${ORTE:-wiese genesis} SICHTEN=${SICHTEN:-ego third}"
for PH in ${PHASEN:-stehen gehen}; do
 case $PH in
 stehen)
  for ORT in ${ORTE:-wiese genesis}; do for SICHT in ${SICHTEN:-ego third}; do K=${ORT:0:1}-$SICHT
  for N in ${LAEUFE:-$L8}; do
    NAME=$K-$N; [ -f $OUT/stehen/$NAME.json ] && { say "$NAME steht schon"; continue; }
    case $N in A*) WT=$A;; B*) WT=$B;; esac
    schloss_nehmen omen-1710-n
    for versuch in 1 2; do
      stopp; seite $NAME $WT
      say "$NAME start gpu[$(gpu)]"
      BASIS=""; [ ${N:0:1} = B ] && [ -f $OUT/stehen/$K-A${N:1}.json ] && BASIS="--basis $OUT/stehen/$K-A${N:1}.json"
      smi_an $OUT/stehen/$NAME-smi.csv
      (cd $INS && timeout 1500 node scripts/omen-messfolge.cjs --ort $ORT --sicht $SICHT --seite http://localhost:4312 --datei $OUT/stehen/$NAME.json $BASIS > $OUT/stehen/$NAME.log 2>&1); ec=$?
      kill $SMI 2>/dev/null
      FP2=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
      [ "$FP2" = "$FP" ] || say "$NAME SEITEN-WACHE NACHHER ROT"
      say "$NAME exit=$ec gpu[$(gpu)] $(grep -aE 'laufVoll|band ' $OUT/stehen/$NAME.log | tr -s ' ' | tail -2 | tr '\n' ' ' | cut -c1-200)"
      ROTREST=$(grep -a "^  ROT " $OUT/stehen/$NAME.log | grep -v "BAND-LINSE" | head -3)
      { grep -aq "MESS-FOLGE ROT" $OUT/stehen/$NAME.log && [ -f $OUT/stehen/$NAME.json ]; } || ROTREST="ohne Befund-Zeile (Absturz/Frist)"
      [ $ec -ne 0 ] && [ -z "$ROTREST" ] && say "$NAME rot NUR am Band-Urteil — Messung gilt"
      if [ $ec -eq 0 ] || [ -z "$ROTREST" ] || [ $versuch -eq 2 ]; then break; fi
      mv $OUT/stehen/$NAME.json $OUT/stehen/$NAME-verworfen-$versuch.json 2>/dev/null; mv $OUT/stehen/$NAME.log $OUT/stehen/$NAME-verworfen-$versuch.log 2>/dev/null
      say "$NAME rot ($ROTREST) — einmal neu"; sleep 30
    done
    stopp; aufraeumen $NAME-nach $WT; schloss_loesen omen-1710-n; sleep 60
  done; done; done ;;
 gehen)
  export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
  for ORT in ${ORTE:-wiese genesis}; do for SICHT in ${SICHTEN:-ego third}; do K=${ORT:0:1}-$SICHT
  for N in ${LAEUFE:-$L8}; do
    NAME=$K-$N; [ -f $OUT/gehen/$NAME-geht-2.txt ] && { say "geh-$NAME steht schon"; continue; }
    case $N in A*) WT=$A;; B*) WT=$B;; esac
    schloss_nehmen omen-1710-n; stopp; seite geh-$NAME $WT
    say "geh-$NAME start gpu[$(gpu)]"
    smi_an $OUT/gehen/$NAME-smi.csv
    (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort $ORT > $OUT/gehen/$NAME-werkbank.log 2>&1 &)
    for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $OUT/gehen/$NAME-werkbank.log 2>/dev/null && break; sleep 5; done
    $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
    $W fenster 1920 1080 > /dev/null 2>&1
    $W umstellen --ort $ORT --sicht $SICHT > $OUT/gehen/$NAME-umstellen.txt 2>&1
    $W lauf 25 --ein 10 --regler voll --tiere frei > $OUT/gehen/$NAME-steht.txt 2>&1
    $W eval "const P = Object.getPrototypeOf(r); const pm = r.state.playerMesh.position; const g = (window.__bodenGeher = { x: pm.x, z: pm.z, s: 0, dir: -1, wege: 0 }); r.tickAffordances = function (dt) { if (Number.isFinite(dt) && dt > 0) { g.s += g.dir * 4 * Math.min(dt, 0.1); if (g.s <= -60) { g.s = -60; g.dir = 1; g.wege++; } if (g.s >= 0) { g.s = 0; g.dir = -1; g.wege++; } pm.x = g.x; pm.z = g.z + g.s; } return P.tickAffordances.call(this, dt); }; return { ein: true, x: g.x, z: g.z };" > $OUT/gehen/$NAME-geher.txt 2>&1
    for R in 1 2; do $W lauf 30 --ein 2 --regler voll --tiere frei > $OUT/gehen/$NAME-geht-$R.txt 2>&1; done
    $W eval "delete r.tickAffordances; const g = window.__bodenGeher; return g ? { s: +g.s.toFixed(1), wege: g.wege } : null;" > $OUT/gehen/$NAME-geher-ende.txt 2>&1
    $W stop > /dev/null 2>&1; kill $SMI 2>/dev/null
    FP2=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
    [ "$FP2" = "$FP" ] || say "geh-$NAME SEITEN-WACHE NACHHER ROT"
    say "geh-$NAME ende gpu[$(gpu)] $(cat $OUT/gehen/$NAME-geher-ende.txt | tr -d '\n' | cut -c1-80)"
    stopp; aufraeumen geh-$NAME-nach $WT; schloss_loesen omen-1710-n; sleep 60
  done; done; done ;;
 esac
done
stopp
say "SERIE ENDE"
