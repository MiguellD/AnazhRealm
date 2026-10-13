#!/bin/bash
# 1310-5 (je Art): EINE Sitzung je Stand an der Wiese (Gier 0): je Art die Bäume an/aus (an, aus, an, aus), dazu die Masse je Art.
# mitgeschrieben (nvidia-smi, Mittel). WT=<arbeitsbaum> L=<A|B> bash sitzung.sh
B=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=${WT:?}; L=${L:?}; H=$B/p3/k24; OUT=$H/art-$L; mkdir -p $OUT
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
node $H/art.cjs 4490 mass > $OUT/mass.txt 2>&1; cat $OUT/mass.txt
for art in eiche fichte birke tanne weide strauch; do
  i=0
  for m in an aus an aus; do
    i=$((i+1))
    node $H/art.cjs 4490 an > /dev/null
    [ $m = aus ] && node $H/art.cjs 4490 aus $art > /dev/null
    wb eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
    nvidia-smi --query-gpu=clocks.gr,clocks_throttle_reasons.active --format=csv,noheader,nounits -lms 100 > $OUT/takt-$art-$i-$m.csv 2>/dev/null &
    p=$!; wb gpu-bank 12 --runden 3 > $OUT/bank-$art-$i-$m.txt 2>&1; ec=$?; kill $p 2>/dev/null
    echo "bank-$art-$i-$m EXIT=$ec"
  done
done
node $H/art.cjs 4490 an > /dev/null
wb stop > /dev/null 2>&1
echo SITZUNG-ENDE
