#!/bin/bash
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/AnazhRealm-mess
OUT=../abba; mkdir -p $OUT
W="node scripts/werkbank.cjs"
npm start > $OUT/save-server.log 2>&1 &
sleep 5
i=0
for R in frei voll voll frei; do
  i=$((i+1))
  $W stop > /dev/null 2>&1
  sleep 3
  $W start --echt > $OUT/start$i.log 2>&1 &
  for t in $(seq 1 60); do grep -q "WERKBANK bereit" $OUT/start$i.log 2>/dev/null && break; sleep 5; done
  echo "boot $i ($R) bereit $(date +%T)" >> $OUT/fortschritt.log
  $W status > $OUT/b$i-status.json 2>&1
  $W umstellen -900 -850 > $OUT/b$i-umstellen.json 2>&1
  $W lauf 30 --ein 120 --ruhe 300 --tiere frei --regler $R > $OUT/b$i-lauf.json 2>&1
  $W gpu-bank 12 --runden 3 > $OUT/b$i-gpubank.json 2>&1
  if [ $i -eq 4 ]; then
    $W takt 300 > $OUT/b4-takt.txt 2>&1
    $W zaehlen > $OUT/b4-zaehlen.txt 2>&1
  fi
  echo "boot $i fertig $(date +%T)" >> $OUT/fortschritt.log
done
$W stop > /dev/null 2>&1
powershell -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server' | % { Stop-Process -Id \$_.ProcessId -Force }"
echo "ALLES ENDE $(date +%T)" >> $OUT/fortschritt.log
