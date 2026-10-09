#!/bin/bash
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
OUT=$BASE/profilBA; mkdir -p $OUT
stopp() {
  (cd $BASE/AnazhRealm-mess && node scripts/werkbank.cjs stop >/dev/null 2>&1)
  powershell -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
for V in B A; do
  [ $V = A ] && D=$BASE/AnazhRealm-mess || D=$BASE/AnazhRealm-kand
  stopp
  cd $D
  W="node scripts/werkbank.cjs"
  npm start > $OUT/$V-save.log 2>&1 &
  sleep 5
  $W start --echt > $OUT/$V-start.log 2>&1 &
  for t in $(seq 1 60); do grep -q "WERKBANK bereit" $OUT/$V-start.log 2>/dev/null && break; sleep 5; done
  echo "$V ($(git log -1 --format=%h)) bereit $(date +%T)"
  $W fenster 1920 1080 > $OUT/$V-fenster.json 2>&1
  $W umstellen -900 -850 > $OUT/$V-umstellen.json 2>&1
  $W eval "r.state.yaw = 0; if (typeof r.state.pitch === 'number') r.state.pitch = 0; return {yaw: r.state.yaw, pitch: r.state.pitch}" > $OUT/$V-blick.json 2>&1
  $W lauf 20 --ein 120 --ruhe 300 --tiere frei --regler voll > $OUT/$V-lauf.json 2>&1
  echo "$V lauf fertig $(date +%T)"
  $W profil 12 --regler voll --top 400 > $OUT/$V-profil.json 2>&1
  $W takt 300 > $OUT/$V-takt.json 2>&1
  $W zaehlen --alle > $OUT/$V-zaehlen.json 2>&1
  echo "$V profil/takt/zaehlen fertig $(date +%T)"
done
stopp
echo "ALLES ENDE $(date +%T)"
