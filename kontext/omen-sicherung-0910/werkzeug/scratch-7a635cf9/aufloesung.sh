#!/bin/bash
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/AnazhRealm-mess
OUT=/c/Users/micha/Desktop/AnazhRealm-OMEN/aufloesung; mkdir -p $OUT
W="node scripts/werkbank.cjs"
npm start > $OUT/save-server.log 2>&1 &
sleep 5
$W start --echt > $OUT/start.log 2>&1 &
for t in $(seq 1 60); do grep -q "WERKBANK bereit" $OUT/start.log 2>/dev/null && break; sleep 5; done
echo "bereit $(date +%T)"
$W status > $OUT/status.json 2>&1
$W umstellen -900 -850 > $OUT/umstellen.json 2>&1
$W lauf 20 --ein 120 --ruhe 300 --tiere frei --regler frei > $OUT/lauf0.json 2>&1
echo "lauf0 fertig $(date +%T)"
i=0
for G in "1920 1080" "1280 720" "960 540" "1280 720" "1920 1080" "960 540"; do
  i=$((i+1)); set -- $G
  $W fenster $1 $2 > $OUT/s$i-fenster.json 2>&1
  $W schirm --datei $OUT/s$i-${1}x${2}.png > $OUT/s$i-schirm.json 2>&1
  $W gpu-bank 12 --runden 3 > $OUT/s$i-gpubank.json 2>&1
  $W lauf 8 --ein 3 --regler frei > $OUT/s$i-lauf.json 2>&1
  echo "schritt $i ${1}x${2} fertig $(date +%T)"
done
$W fenster 1920 1080 > $OUT/p-fenster.json 2>&1
$W profil 10 --regler frei --top 25 > $OUT/profil.txt 2>&1
echo "profil fertig $(date +%T)"
$W stop > /dev/null 2>&1
powershell -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server' | % { Stop-Process -Id \$_.ProcessId -Force }"
echo "ALLES ENDE $(date +%T)"
