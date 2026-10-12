#!/bin/bash
# 1110-9 Nachtrag: der Band-Täter (+1,24 ms GPU je Frame an der Genesis) in EINER Sitzung — B = welle-m-e-torwurf, Instrument
# abab-i543, Ort genesis wie die Messfolge; je Schalter Band-Paare Grund ↔ Schalter (3×), dazu einmal der Zwilling ganz weg.
B=/c/Users/micha/Desktop/AnazhRealm-OMEN; INSTR=$B/abab-i543; OUT=$B/p3/tor/toggle; LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
wb() { (cd $INSTR && node scripts/werkbank.cjs "$@"); }
band() { wb band --ort genesis > $OUT/band-$1.txt 2>&1; say "$1 $(grep -o 'GPU ms/Frame [0-9.]*' $OUT/band-$1.txt | head -1) · $(grep -o 'Befehle [0-9]*/' $OUT/band-$1.txt | head -1)"; }
schalt() { say "  $(node $OUT/schalter.cjs 4490 $1 $2)"; }
stopp
(cd $B/welle-m-e-torwurf && PORT=4312 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
say "START $(grep -m1 'WERKBANK bereit' $OUT/werkbank.log | cut -c1-80) · porta-core $(curl -s http://localhost:4312/porta-core.js | sha256sum | cut -c1-16)"
wb eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
wb fenster 1920 1080 > /dev/null
wb umstellen --ort genesis > $OUT/umstellen.txt 2>&1
wb eval "return window.__buehne()" > /dev/null
wb lauf 30 --ein 20 --ruhe 300 --tiere frei --regler voll > $OUT/lauf.txt 2>&1
say "eingeschwungen $(grep -o 'fps[^·]*' $OUT/lauf.txt | head -1)"
for i in 1 2 3; do band grund-s$i; schalt zwilling-stoff an; band stoff$i; schalt zwilling-stoff aus; done
for i in 1 2 3; do band grund-m$i; schalt fern-march an; band march$i; schalt fern-march aus; done
band grund-w1; schalt zwilling-weg an; band weg1; schalt zwilling-weg aus; band grund-w2
wb stop > /dev/null 2>&1
stopp
say "TOGGLE ENDE"
