#!/bin/bash
# 0910-7 Teil B: formationen an Genesis (+9,2k Dreiecke von 7dd944e6 auf 66005ca6) — je Stand der ersten Eltern-Linie EIN
# Genesis-Boot (omen-messfolge --ort genesis: boot · dorf-aus · fenster · umstellen --ort genesis · buehne · band; nur
# GESTELLT zählt). Instrument abab-b538 (66005ca6 + Kompat-Zeile `_streuWartet`), Seite :4312 aus takt-bisekt, Werkbank :4490.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-b538
WT=$BASE/takt-bisekt
OUT=$BASE/p3/tf/genesis; mkdir -p $OUT
LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
STAENDE="7dd944e6 d3ebfc79 e65e9208 90307589 e18c1951 c503eaad e3836ce3 70b957f3 76c036b0 66005ca6"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  node $INSTR/scripts/werkbank.cjs stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
say "GENESIS-BISEKTION START"
for C in $STAENDE; do
  stopp
  rm -f $WT/scripts/diag-takt-atem.cjs
  git -C $WT -c core.autocrlf=false checkout -q --detach $C || { say "$C checkout ROT"; continue; }
  (cd $WT && PORT=4312 node save-server.js > $OUT/$C-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  for V in 1 2 3; do
    (cd $INSTR && timeout 1800 node scripts/omen-messfolge.cjs --ort genesis --seite http://localhost:4312 --datei $OUT/$C.json > $OUT/$C.log 2>&1)
    U=$(node -e "try { const j = require(process.argv[1]); console.log(j.urteil + ' | ' + (j.abbruch || '')); } catch (e) { console.log('KEIN-JSON'); }" $OUT/$C.json)
    case "$U" in GRUEN*) break;; esac
    say "$C Versuch $V: $U"
    [ -f $OUT/$C.json ] && mv $OUT/$C.json $OUT/$C-verworfen-$V.json
  done
  F=$(node -e "try { const m = require(process.argv[1]).schritte.find((x) => x.name === 'band').ergebnis.messung; const k = m.klassen.find((x) => x.id === 'formationen'); console.log(JSON.stringify({ ort: m.ortGestellt, ist: k.ist, je: k.je })); } catch (e) { console.log('-'); }" $OUT/$C.json)
  say "$C $U formationen $F"
done
stopp
git -C $WT -c core.autocrlf=false checkout -q --detach 66005ca6
say "GENESIS-BISEKTION ENDE"
