#!/bin/bash
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
OUT=$BASE/zerlegen; mkdir -p $OUT
cd $BASE/AnazhRealm-zerlegen
W="node scripts/werkbank.cjs"
npm start > $OUT/save.log 2>&1 &
sleep 5
$W start --echt > $OUT/start.log 2>&1 &
for t in $(seq 1 60); do grep -q "WERKBANK bereit" $OUT/start.log 2>/dev/null && break; sleep 5; done
echo "bereit $(git log -1 --format=%h) $(date +%T)"
$W fenster 1920 1080 > $OUT/fenster.json 2>&1
$W umstellen -900 -850 > $OUT/umstellen.json 2>&1
$W eval "r.state.yaw = 0; if (typeof r.state.pitch === 'number') r.state.pitch = 0; return {yaw: r.state.yaw, pitch: r.state.pitch}" > $OUT/blick.json 2>&1
$W lauf 10 --ein 30 --ruhe 300 --tiere frei > $OUT/lauf.json 2>&1
echo "lauf fertig $(date +%T)"
$W gpu-bank 12 --runden 3 > $OUT/gpubank-vor.json 2>&1
$W zerlegen --selbsttest > $OUT/selbsttest.txt 2>&1; echo "selbsttest exit $? $(date +%T)"
$W zerlegen --runden 6 --json artifacts/werkbank/zerlegen-omen.json --bilder $OUT/bilder > $OUT/voll.txt 2>&1; echo "voll exit $? $(date +%T)"
$W zerlegen --nur haupt,tiefenkopie,traa,nachbild,bloom,godrays,kontrast,feldPass,leer --runden 8 > $OUT/nur.txt 2>&1; echo "nur exit $? $(date +%T)"
$W gpu-bank 12 --runden 3 > $OUT/gpubank-nach.json 2>&1
$W schirm --datei $OUT/schirm-nach.png > $OUT/schirm.json 2>&1
cp artifacts/werkbank/zerlegen-omen.json $OUT/ 2>/dev/null
$W stop > /dev/null 2>&1
powershell -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
echo "ALLES ENDE $(date +%T)"
