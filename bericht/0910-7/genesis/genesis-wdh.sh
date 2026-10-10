#!/bin/bash
# 0910-7 Teil B: wie oft trägt Genesis die schwere Formation? Je Seite N Genesis-Boots (Instrument abab-b538).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-b538
OUT=$BASE/p3/tf/genesis-wdh; mkdir -p $OUT
export WERKBANK_PORT=4490
stopp() {
  node $INSTR/scripts/werkbank.cjs stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
for i in 1 2 3; do
  for S in main kopf; do
    [ $S = main ] && WT=$BASE/takt-bisekt || WT=$BASE/welle-m-takt-frei
    stopp
    (cd $WT && PORT=4312 node save-server.js > $OUT/$S-$i-save.log 2>&1 &)
    for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
    (cd $INSTR && timeout 1800 node scripts/omen-messfolge.cjs --ort genesis --seite http://localhost:4312 --datei $OUT/$S-$i.json > $OUT/$S-$i.log 2>&1)
    node -e "try { const j = require(process.argv[1]); const m = j.schritte.find((x) => x.name === 'band').ergebnis.messung; const k = m.klassen.find((x) => x.id === 'formationen'); console.log(process.argv[2], j.urteil, JSON.stringify(k.ist), JSON.stringify({ haupt: k.je.haupt && k.je.haupt.dreiecke, k0: k.je.k0 && k.je.k0.dreiecke }), 'gesamt', m.summe.befehle, Math.round(m.summe.dreiecke / 1000) + 'k'); } catch (e) { console.log(process.argv[2], 'FEHLER', e.message); }" $OUT/$S-$i.json $S-$i
  done
done
stopp
