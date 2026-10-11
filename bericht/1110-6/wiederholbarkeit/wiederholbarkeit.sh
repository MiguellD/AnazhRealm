#!/bin/bash
# 1110-6: die Wiederholbarkeit des Toggle-Orts — vier frische Boots `omen-messfolge --ort buehne` (Instrument = Zweig
# welle-m-messort-buehne, Seite = derselbe Stand 27e369d8), dann `--streuung`; danach die Eich-Probe in EINER Sitzung (Licht
# des Auges an · aus · an, je zwei lange Bänke an der Pose s0-hang).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-messort-buehne
OUT=$BASE/mb; LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
seite() { (cd $INSTR && PORT=4312 node save-server.js > $OUT/$1-save.log 2>&1 &); for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done; }
say "1110-6 WIEDERHOLBARKEIT START $(git -C $INSTR log -1 --format=%h)"
for k in 1 2 3 4; do
  stopp; seite b$k
  (cd $INSTR && timeout 1800 node scripts/omen-messfolge.cjs --ort buehne --seite http://localhost:4312 --datei $OUT/buehne-$k.json > $OUT/buehne-$k.log 2>&1)
  say "buehne-$k exit=$? $(grep -aE 'gpu-bank Pose' $OUT/buehne-$k.log | sed 's/(.*//' | tr '\n' ' ')"
  sleep 20
done
stopp
(cd $INSTR && node scripts/omen-messfolge.cjs --streuung $OUT/buehne-1.json $OUT/buehne-2.json $OUT/buehne-3.json $OUT/buehne-4.json > $OUT/streuung.txt 2>&1); say "streuung exit=$?"
# die Eich-Probe
seite eich
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/eich-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/eich-werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort buehne --pose ost > $OUT/eich-umstellen.txt 2>&1
$W eval "return window.__buehne()" > /dev/null
BL='r.state.pitch = 0; for (let i = 0; i < 20; i++) { window.__wetterHalten(); window.__ortSchritt(); r._gameLoopTick(performance.now()); await new Promise((s) => setTimeout(s, 16)); } r.state.renderer.setAnimationLoop(null); return 1;'
bank() { $W eval "$BL" > /dev/null; $W gpu-bank 60 --runden 1 > /dev/null; for i in 1 2; do $W gpu-bank 120 --runden 6 2>&1 | grep -o '"gpuJeFrameMs": [0-9.]*' | cut -d' ' -f2; done | tr '\n' ' '; }
say "eich an   $(bank)"
$W eval "const L = r.state.augenLicht; window.__alP = L.parent; L.parent.remove(L); return 1" > /dev/null
say "eich aus  $(bank)"
$W eval "window.__alP.add(r.state.augenLicht); return 1" > /dev/null
say "eich an   $(bank)"
$W eval "const L = r.state.augenLicht; L.parent.remove(L); return 1" > /dev/null
say "eich aus  $(bank)"
stopp
say "1110-6 WIEDERHOLBARKEIT ENDE"
