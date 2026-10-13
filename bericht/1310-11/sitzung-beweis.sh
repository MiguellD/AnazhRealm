#!/bin/bash
# 1310-11 Nebenterm-Beweis auf dem Schnitt: EINE Sitzung an der Wiese, der stehende Satz wirft aus dem Code (an), live aus
# und wieder an (wurf.cjs) — je Schalter zwei Bilder von oben und von der Seite am Geröll-Haufen.
# WT=<arbeitsbaum> L=<etikett> SEITE="x y z tx ty tz" OBEN="x y z tx ty tz" bash sitzung-beweis.sh
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
node $H/wurf.cjs 4490 zaehle > $OUT/code.json 2>&1
bild() { # $1 Etikett
  wb eval "return window.__buehne()" > /dev/null
  for n in 1 2; do
    mkdir -p $OUT/$1/$n
    wb bild $OBEN --datei $OUT/$1/$n/oben.png --w 1920 --h 1080 > /dev/null 2>&1
    wb bild $SEITE --datei $OUT/$1/$n/seite.png --w 1920 --h 1080 > /dev/null 2>&1
  done
}
bild code
node $H/wurf.cjs 4490 aus > $OUT/schalter-aus.json 2>&1
bild aus
node $H/wurf.cjs 4490 an > $OUT/schalter-an.json 2>&1
bild an
wb stop > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match '[s]ave-server' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
echo SITZUNG-ENDE
