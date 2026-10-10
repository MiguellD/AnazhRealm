#!/bin/bash
# 0910-4 Teil 3: das Genesis-Band main ↔ Kopf, A B A B — je Boot die Messfolge `--ort genesis` (boot · dorf-aus · fenster ·
# umstellen --ort genesis · buehne · band) mit EINEM Instrument (der Kopf), die Seite liefert nur die Welt (:7903, Seiten-Hash-
# Wache vor jedem Boot). „NICHT GESTELLT" ist ROT und wiederholt (höchstens 2×). Ports 7900–7909.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-genesis-band
OUT=$BASE/p3/gb/serie; mkdir -p $OUT
LOG=$OUT/fortschritt.log
A=$BASE/rf-main                 # main 7dd944e6 (anazhRealm.js unverändert)
B=$BASE/welle-m-genesis-band    # Kopf
MAXWDH=2
export WERKBANK_PORT=7904
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
ruhe() {
  local g; g=$(nvidia-smi --query-gpu=temperature.gpu,clocks.gr,utilization.gpu,pstate --format=csv,noheader 2>/dev/null)
  echo "GPU[$g]"
}
seite() { # $1 = Worktree, $2 = Soll-Hash, $3 = Name
  (cd $1 && PORT=7903 node save-server.js > $OUT/$3-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7903/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  IST=$(curl -s http://localhost:7903/anazhRealm.js | sha256sum | cut -c1-16)
  if [ "$IST" != "$2" ]; then say "$3 SEITEN-WACHE ROT: geliefert $IST, soll $2 — Abbruch"; stopp; exit 3; fi
  say "$3 Seite geliefert ($IST)"
}
say "SERIE START  A=$(git -C $A log -1 --format=%h) (main)  B=$(git -C $B log -1 --format=%h) (Kopf, Arbeitsbaum)  Instrument=Kopf"
shaA=$(sha256sum $A/anazhRealm.js | cut -c1-16); shaB=$(sha256sum $B/anazhRealm.js | cut -c1-16)
say "anazhRealm.js  A=$shaA  B=$shaB"
i=0
for X in A B A B; do
  i=$((i+1)); N=$i$X
  [ $X = A ] && D=$A && SOLL=$shaA || { D=$B; SOLL=$shaB; }
  gw=0
  while :; do
    stopp
    say "$N genesis-boot (Versuch $((gw+1)))  $(ruhe)"
    seite $D $SOLL $N
    (cd $INSTR && timeout 1800 node scripts/omen-messfolge.cjs --ort genesis --seite http://localhost:7903 --datei $OUT/genesis-$N.json > $OUT/genesis-$N.log 2>&1)
    gec=$?
    GU=$(node -e "try { const j = require(process.argv[1]); console.log(j.urteil + ' | ' + (j.abbruch || '') + ' | ' + j.befunde.slice(0, 4).join(' ; ')); } catch (e) { console.log('KEIN-JSON | ' + e.message); }" $(cd $OUT && pwd -W)/genesis-$N.json)
    say "$N genesis exit=$gec  $GU  $(grep -aE 'band:|ORT genesis' $OUT/genesis-$N.log | head -2 | tr '\n' ' ' | cut -c1-220)"
    case "$GU" in GRUEN*) break;; esac
    gw=$((gw+1))
    [ -f $OUT/genesis-$N.json ] && mv $OUT/genesis-$N.json $OUT/genesis-$N-verworfen-$gw.json
    mv $OUT/genesis-$N.log $OUT/genesis-$N-verworfen-$gw.log 2>/dev/null
    if [ $gw -gt $MAXWDH ]; then say "$N genesis nach $MAXWDH Wiederholungen weiter rot — keine Genesis-Zahl"; break; fi
    sleep 30
  done
  stopp
  say "$N Pause 60 s  $(ruhe)"
  sleep 60
done
stopp
say "SERIE ENDE"
