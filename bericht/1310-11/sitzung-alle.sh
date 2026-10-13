#!/bin/bash
# 1310-11 Nebenterm-Beweis: EINE Sitzung an der Wiese auf dem Schnitt, je Instanz der stehenden Nah-Streu (alle.cjs, höchstens 4)
# ein Bild von oben mit Wurf (Code) und ohne (wurf.cjs aus), dann wieder an. WT=<arbeitsbaum> L=<etikett> bash sitzung-alle.sh
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
node $H/alle.cjs 4490 > $OUT/alle.json 2>&1
node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");const j=JSON.parse(t.slice(t.indexOf("{")));for(const i of ((j.ergebnis||j).instanzen||[]).slice(0,4))console.log(i.oben)' $OUT/alle.json > $OUT/blicke.txt
echo "blicke $(wc -l < $OUT/blicke.txt)"
node $H/wurf.cjs 4490 zaehle > $OUT/code.json 2>&1
schuss() { # $1 Etikett
  wb eval "return window.__buehne()" > /dev/null
  local n=0
  while read -r P; do n=$((n+1)); mkdir -p $OUT/$1; wb bild $P --datei $OUT/$1/oben-$n.png --w 1920 --h 1080 > /dev/null 2>&1; done < $OUT/blicke.txt
}
schuss an1
node $H/wurf.cjs 4490 aus > $OUT/schalter-aus.json 2>&1
schuss aus
node $H/wurf.cjs 4490 an > $OUT/schalter-an.json 2>&1
schuss an2
wb stop > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match '[s]ave-server' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
echo SITZUNG-ENDE
