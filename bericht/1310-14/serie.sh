#!/bin/bash
# 1310-14: DER GESCHNITTENE MONOLITH (integ-probe 9fb869a5, der Stamm in 48 Zonen unter stamm/) gegen main 6898706f per Boots —
# A = main ($A), B = der Kandidat ($B), Instrument $INSTR (dasselbe wie 1310-12). DER HARNISCH UMGEZOGEN: die Seiten-Wache prüft
# nicht mehr die EINE Datei anazhRealm.js, sondern den Fingerabdruck der ausgelieferten index.html samt jedem lokalen Skript
# (fingerabdruck.cjs, byte-genau gegen den Arbeitsbaum). Vor JEDEM Boot fällt der Spielstand der Seite beiseite (frischer Start).
# (1) Boot über den save-server (boot.cjs: kalt + zweit je Aufruf), A B A B; (2) die Messfolge Genesis und Wiese, je 2 + 2 Boots.
# TEILE="boot folge" bash serie.sh
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=${A:-$BASE/abab-b545}; B=${B:-$BASE/abab-z545}; INSTR=${INSTR:-$BASE/abab-i543}; TEILE=${TEILE:-"boot folge"}
OUT=$BASE/p3/k14; LOG=$OUT/fortschritt.log; mkdir -p $OUT/stand
export WERKBANK_PORT=4490
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge|k14.boot' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil|k14-boot' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
seite() { # $1 Lauf, $2 Baum
  mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null
  (cd $2 && PORT=4312 node save-server.js > $OUT/$1-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  FP=$(node $OUT/fingerabdruck.cjs $2 2>>$LOG) || { say "$1 SEITEN-WACHE ROT ($2)"; stopp; exit 3; }
}
say "SERIE START A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h) Instrument=$(git -C $INSTR log -1 --format=%h)+Genesis-Variante Teile=$TEILE"
for T in $TEILE; do
  if [ $T = boot ]; then LAEUFE=${BOOTL:-"bA1 bB1 bA2 bB2"}; else LAEUFE=${FOLGEL:-"gA1 gB1 gA2 gB2 wA1 wB1 wA2 wB2"}; fi
  for N in $LAEUFE; do
    case $N in ?A*) WT=$A;; ?B*) WT=$B;; esac
    stopp; seite $N $WT
    if [ $T = boot ]; then
      timeout 600 node $OUT/boot.cjs $INSTR $OUT/$N.json > $OUT/$N.log 2>&1; ec=$?
      say "$N fp=$FP exit=$ec $(tr '\n' ' ' < $OUT/$N.log | cut -c1-330)"
    else
      case $N in g*) ORT="--ort genesis";; w*) ORT="";; esac
      (cd $INSTR && timeout 1800 node scripts/omen-messfolge.cjs $ORT --seite http://localhost:4312 --datei $OUT/$N.json > $OUT/$N.log 2>&1); ec=$?
      say "$N fp=$FP exit=$ec $(grep -aE 'laufVoll|band ' $OUT/$N.log | tr -s ' ' | tail -2 | tr '\n' ' ' | cut -c1-200)"
    fi
    # die Wache NACH dem Lauf: dieselbe Seite lieferte bis zum Ende
    FP2=$(node $OUT/fingerabdruck.cjs $WT 2>>$LOG) || FP2="ROT"
    [ "$FP2" = "$FP" ] || say "$N SEITEN-WACHE NACHHER ROT: $FP2 statt $FP"
    sleep 20
  done
done
stopp
say "SERIE ENDE"
