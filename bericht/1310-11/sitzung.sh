#!/bin/bash
# 1310-11: EINE Sitzung an der Wiese (Bühne): Albedo der Geröll- und Fels-Klassen, die Geröll-Gruppen (Schatten, Stoff, Ecken-Farbe),
# ein Nahbild des nächsten Haufens (zwei Aufnahmen). WT=<arbeitsbaum> L=<etikett> bash sitzung.sh
B=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=${WT:?}; L=${L:?}; H=$B/p3/k11; OUT=$H/$L; mkdir -p $OUT
export WERKBANK_PORT=4490
wb() { (cd $WT && node scripts/werkbank.cjs "$@"); }
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match '[s]ave-server|[w]erkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match '[w]erkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
sleep 2
(cd $WT && PORT=4312 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
grep -m1 "WERKBANK bereit" $OUT/werkbank.log || { echo "KEIN START"; exit 1; }
wb eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
wb fenster 1920 1080 > /dev/null
wb umstellen --ort wiese > $OUT/umstellen.txt 2>&1
wb eval "return window.__buehne()" > /dev/null
wb lauf 15 --ein 15 --ruhe 300 --tiere halten --regler voll > $OUT/lauf.txt 2>&1; echo "lauf EXIT=$?"
wb albedo --nur "geroell|findling|fels|stein" > $OUT/albedo.txt 2>&1; echo "albedo EXIT=$?"
node $H/stein.cjs 4490 > $OUT/stein.json 2>&1
P=$(node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");const j=JSON.parse(t.slice(t.indexOf("{")));console.log((j.ergebnis||{}).blick||"")' $OUT/stein.json)
echo "blick $P" | tee $OUT/blick.txt
wb eval "return window.__buehne()" > /dev/null
if [ -n "$P" ]; then for n in 1 2; do mkdir -p $OUT/bild/$n; wb bild $P --datei $OUT/bild/$n/stein.png --w 1920 --h 1080 > /dev/null 2>&1; done; fi
# der feste Blick der Gegenseite (BLICK="x y z tx ty tz"): das Bild-Paar an DERSELBEN Stelle
if [ -n "$BLICK" ]; then for n in 1 2; do mkdir -p $OUT/fest/$n; wb bild $BLICK --datei $OUT/fest/$n/stein.png --w 1920 --h 1080 > /dev/null 2>&1; done; fi
wb stop > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match '[s]ave-server' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
echo SITZUNG-ENDE
