#!/bin/bash
# 14.10. DIE GTX-RATSCHEN NEU auf dem Bündel 51cc19af ($WT) — Instrument abab-i551b (Orte lokal: Wiese K55 −278/−1038, Genesis 0/0; Draw-Zähler d6e4b259), je Ort × Sicht zwei Serien
# aus Erst- und Zweit-Boot (`--serie`: das benannte Profil hält die Platte für den Zweit-Boot) = 4 Läufe je Ratsche. Vor jedem
# Erst-Boot fällt der Spielstand der Seite beiseite (frischer Start), der Zweit-Boot behält, was der Erst-Boot schrieb.
# SICHTEN="ego third" ORTE="wiese genesis dorf" bash serie.sh
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=${INSTR:-$BASE/abab-i551b}; WT=${WT:-$BASE/abab-p551}; SICHTEN=${SICHTEN:-"ego third"}; ORTE=${ORTE:-"wiese genesis dorf"}
OUT=$BASE/p3/k1410d; LOG=$OUT/fortschritt.log; mkdir -p $OUT
export WERKBANK_PORT=4490
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
seite() { # $1 Lauf
  (cd $WT && PORT=4312 node save-server.js > $OUT/$1-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  # die Seiten-Wache als Fingerabdruck (1310-14): index.html + jedes lokale Skript byte-genau gegen den Arbeitsbaum
  HASH=$(node $BASE/p3/k14/fingerabdruck.cjs $WT 2>>$LOG) || { say "$1 SEITEN-WACHE ROT"; stopp; exit 3; }
}
say "SERIE START Seite=$(git -C $WT log -1 --format=%h) Instrument=$(git -C $INSTR log -1 --format=%h)+lokal Sichten=$SICHTEN Orte=$ORTE"
for SICHT in $SICHTEN; do
for ORT in $ORTE; do
  for S in 1 2; do
    SERIE="k1410-gtx-$ORT-$SICHT-$S"
    rm -rf "$INSTR/artifacts/werkbank/profil-$SERIE"
    for B in erst zweit; do
      N="$ORT-$SICHT-$S-$B"
      stopp
      if [ $B = erst ]; then mkdir -p $OUT/stand-$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand-$N/ 2>/dev/null; fi
      seite $N; h=$HASH
      (cd $INSTR && timeout 1800 node scripts/omen-messfolge.cjs --ort $ORT --sicht $SICHT --serie $SERIE --seite http://localhost:4312 --datei $OUT/$N.json > $OUT/$N.log 2>&1)
      ec=$?
      FP2=$(node $BASE/p3/k14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
      [ "$FP2" = "$h" ] || say "$N SEITEN-WACHE NACHHER ROT: $FP2 statt $h"
      say "$N fp=$h exit=$ec $(grep -aE 'laufVoll|band ' $OUT/$N.log | tr -s ' ' | tail -2 | tr '\n' ' ' | cut -c1-220)"
      sleep 20
    done
  done
done
say "$SICHT ENDE"
done
stopp
say "SERIE ENDE"
