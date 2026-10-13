#!/bin/bash
# 1310-8: EINE B-Sitzung an der Wiese (Gier 0): der Baum-Preis mit der Ankunfts-Folge im @wahl-Bündel, nach Stufe aufsteigend
# (L0 zuerst) und absteigend — je Schalter gpu-bank 12×3 mit Takt.
B=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$B/abab-b544; H=$B/p3/k8; K=$B/p3/k24; OUT=$H/B3; mkdir -p $OUT
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
wb eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
wb lauf 20 --ein 20 --ruhe 300 --tiere frei --regler voll > $OUT/lauf.txt 2>&1; echo "lauf EXIT=$?"
node $H/kinder.cjs 4490 zeigen > $OUT/folge-B.json 2>&1
node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");const j=JSON.parse(t.slice(t.indexOf("{")));console.log(JSON.stringify(j.ergebnis.folge))' $OUT/folge-B.json > $OUT/liste-B.json
node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");const j=JSON.parse(t.slice(t.indexOf("{")));console.log(JSON.stringify(j.ergebnis.folge))' $H/kinder-A.json > $OUT/liste-A.json
preis() { # $1 Etikett
  local i=0
  for m in an aus aus an; do
    i=$((i+1))
    node $K/art.cjs 4490 $m alle > /dev/null
    wb eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
    nvidia-smi --query-gpu=clocks.gr,clocks_throttle_reasons.active --format=csv,noheader,nounits -lms 100 > $OUT/takt-$1-$i-$m.csv 2>/dev/null &
    p=$!; wb gpu-bank 12 --runden 3 > $OUT/bank-$1-$i-$m.txt 2>&1; kill $p 2>/dev/null
  done
  node $K/art.cjs 4490 an alle > /dev/null
  echo "preis $1 fertig"
}
node $H/stufenfolge.cjs $OUT/liste-B.json auf $OUT/liste-auf.json > /dev/null
node $H/stufenfolge.cjs $OUT/liste-B.json ab $OUT/liste-ab.json > /dev/null
preis ankunft1
node $H/kinder.cjs 4490 setzen $OUT/liste-auf.json > /dev/null 2>&1
preis auf1
node $H/kinder.cjs 4490 setzen $OUT/liste-ab.json > /dev/null 2>&1
preis ab1
node $H/kinder.cjs 4490 setzen $OUT/liste-auf.json > /dev/null 2>&1
preis auf2
node $H/kinder.cjs 4490 setzen $OUT/liste-B.json > /dev/null 2>&1
preis ankunft2
wb stop > /dev/null 2>&1
echo SITZUNG-ENDE
