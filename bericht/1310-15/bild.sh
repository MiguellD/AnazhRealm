#!/bin/bash
# 1310-15: das Bild-Paar des Leibs an der Genesis — je Seite EINE Sitzung (Werkbank echt): Third-Person von hinten und von der
# Seite (die Spiel-Kamera), Ego mit Blick nach unten (der eigene Leib wirft, `_applyEgoSicht`). WT=<baum> L=<etikett> bash bild.sh
B=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=${WT:?}; L=${L:?}; ORT=${ORT:-genesis}; H=$B/p3/k15; OUT=$H/bild/$L; mkdir -p $OUT
export WERKBANK_PORT=4490
wb() { (cd $WT && node scripts/werkbank.cjs "$@"); }
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
sleep 2
mkdir -p $OUT/stand; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
(cd $WT && PORT=4312 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
node $B/p3/k14/fingerabdruck.cjs $WT > $OUT/fingerabdruck.txt 2>&1 || { echo "WACHE ROT"; exit 3; }
(cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
grep -m1 "WERKBANK bereit" $OUT/werkbank.log || { echo "KEIN START"; exit 1; }
wb eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
wb fenster 1920 1080 > /dev/null
wb umstellen --ort $ORT > $OUT/umstellen.txt 2>&1
wb eval "return window.__buehne()" > /dev/null
wb lauf 15 --ein 15 --ruhe 300 --tiere halten --regler voll > $OUT/lauf.txt 2>&1; echo "lauf EXIT=$?"
node $H/leib-bild.cjs 4490 third 0 -0.15 $OUT/third-hinten.png > $OUT/third-hinten.json 2>&1
node $H/leib-bild.cjs 4490 third 1.5708 -0.15 $OUT/third-seite.png > $OUT/third-seite.json 2>&1
node $H/leib-bild.cjs 4490 first 0 -1.3 $OUT/ego-unten.png > $OUT/ego-unten.json 2>&1
cat $OUT/third-hinten.json $OUT/third-seite.json $OUT/ego-unten.json | cut -c1-300
wb stop > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
echo SITZUNG-ENDE
