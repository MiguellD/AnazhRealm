#!/bin/bash
# 1310-11 Nebenterm: EINE Sitzung an der Wiese (Bühne), die stehende Nah-Streu wirft live an/aus (wurf.cjs): ihr Preis
# (Instanzen, Dreiecke), das Bild am Geröll-Haufen je Schalter (zwei Aufnahmen), gpu-bank 12 × 3 je Schalter (aus an an aus).
# WT=<arbeitsbaum> L=<etikett> BLICK="x y z tx ty tz" bash sitzung-wurf.sh
B=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=${WT:?}; L=${L:?}; BLICK=${BLICK:?}; H=$B/p3/k11; OUT=$H/$L; mkdir -p $OUT
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
node $H/wurf.cjs 4490 zaehle > $OUT/zaehle.json 2>&1
bild() { # $1 Schalter
  node $H/wurf.cjs 4490 $1 > $OUT/schalter-$1.json 2>&1
  wb eval "return window.__buehne()" > /dev/null
  for n in 1 2; do mkdir -p $OUT/bild-$1/$n; wb bild $BLICK --datei $OUT/bild-$1/$n/stein.png --w 1920 --h 1080 > /dev/null 2>&1; done
}
bild aus
bild an
node $H/wurf.cjs 4490 aus > /dev/null 2>&1
i=0
for m in aus an an aus; do
  i=$((i+1))
  node $H/wurf.cjs 4490 $m > /dev/null 2>&1
  wb eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
  nvidia-smi --query-gpu=clocks.gr,clocks_throttle_reasons.active --format=csv,noheader,nounits -lms 100 > $OUT/takt-$i-$m.csv 2>/dev/null &
  p=$!; wb gpu-bank 12 --runden 3 > $OUT/bank-$i-$m.txt 2>&1; kill $p 2>/dev/null
done
node $H/wurf.cjs 4490 zaehle > $OUT/zaehle-ende.json 2>&1
wb stop > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match '[s]ave-server' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
echo SITZUNG-ENDE
