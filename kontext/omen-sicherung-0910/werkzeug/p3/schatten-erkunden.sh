#!/bin/bash
# 0710-12 Erkunden: die Werkbank (echte GPU) auf welle-m-schatten (main 76c9624d), der Wolf an der Wiese bei seitlicher Sonne,
# normalBias 1,0 · 0,5 · 0,25 · 0,15 m — Bilder nach p3/schatten/erkunden
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-schatten
OUT=$BASE/p3/schatten/erkunden; mkdir -p $OUT
export WERKBANK_PORT=7902
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $OUT/fortschritt.log; }
(cd $INSTR && PORT=7901 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7901/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 7902 --seite http://localhost:7901 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1280 720 > /dev/null
$W umstellen --ort wiese > $OUT/umstellen.txt 2>&1
say "an der Wiese"
for Z in 0.32; do
  $W eval "window.__erk = { zeit: $Z, biase: [1.0, 0.5, 0.25, 't1', 't1.5', 't2'], kamRel: { dx: 1.0, dy: 2.6, dz: 3.0, lx: -1.0, ly: 0, lz: 0 } }; $(cat $BASE/p3/schatten-erkunden.js)" > $OUT/erk-$Z.json 2>&1
  node -e '
const fs=require("fs");const j=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));const e=j.ergebnis;if(!e){console.log("FEHLER",JSON.stringify(j).slice(0,400));process.exit(0)}
console.log("zeit",process.argv[2],"sonne",JSON.stringify(e.sonne),"hoehe",e.hoeheGrad,"fits",JSON.stringify(e.fitsVorher));
for(const b of e.bilder){fs.writeFileSync(process.argv[3]+"/wolf-z"+process.argv[2]+"-b"+b.bias+".png",Buffer.from(b.png.split(",")[1],"base64"));fs.writeFileSync(process.argv[3]+"/leer-z"+process.argv[2]+"-b"+b.bias+".png",Buffer.from(b.pngLeer.split(",")[1],"base64"));console.log("  bias",b.bias,"dunkler",b.dunkler,"heller",b.heller,"texel",JSON.stringify(b.fits))}' $OUT/erk-$Z.json $Z $OUT | tee -a $OUT/fortschritt.log
done
$W stop > /dev/null 2>&1
sleep 3
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server' | ? { \$_.ProcessId -in (Get-NetTCPConnection -State Listen -LocalPort 7901 -ErrorAction SilentlyContinue | % OwningProcess) } | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
say "ENDE"
