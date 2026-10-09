#!/bin/bash
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
OUT=$BASE/abab; mkdir -p $OUT
stopp() {
  (cd $BASE/AnazhRealm-mess && node scripts/werkbank.cjs stop >/dev/null 2>&1)
  powershell -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
i=0
for V in A B A B; do
  i=$((i+1))
  [ $V = A ] && D=$BASE/AnazhRealm-mess || D=$BASE/AnazhRealm-kand
  stopp
  cd $D
  W="node scripts/werkbank.cjs"
  npm start > $OUT/b$i-save.log 2>&1 &
  sleep 5
  $W start --echt > $OUT/b$i-start.log 2>&1 &
  for t in $(seq 1 60); do grep -q "WERKBANK bereit" $OUT/b$i-start.log 2>/dev/null && break; sleep 5; done
  echo "boot $i ($V $(git log -1 --format=%h)) bereit $(date +%T)"
  $W status > $OUT/b$i-status.json 2>&1
  $W umstellen -900 -850 > $OUT/b$i-umstellen.json 2>&1
  $W band > $OUT/b$i-band.txt 2>&1
  echo "boot $i band fertig $(date +%T)"
  $W eval "r.state.yaw = 0; if (typeof r.state.pitch === 'number') r.state.pitch = 0; return {yaw: r.state.yaw, pitch: r.state.pitch}" > $OUT/b$i-blick.json 2>&1
  $W gpu-bank 12 --runden 3 > $OUT/b$i-gpubank.json 2>&1
  $W lauf 30 --ein 120 --ruhe 300 --tiere frei --regler voll > $OUT/b$i-voll.json 2>&1
  echo "boot $i voll fertig $(date +%T)"
  $W lauf 30 --ein 120 --ruhe 300 --tiere frei --regler frei > $OUT/b$i-frei.json 2>&1
  echo "boot $i frei fertig $(date +%T)"
done
stopp
echo "ALLES ENDE $(date +%T)"
