#!/bin/bash
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
OUT=$BASE/ab534; mkdir -p $OUT
BUEHNE="const b = window.__buehne(); return {b, wetter: r.state.weather, tag: r.state.timeOfDay}"
stopp() {
  (cd $BASE/mess-v533 && node scripts/werkbank.cjs stop >/dev/null 2>&1)
  powershell -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
i=0
for X in A B A B A B A B; do
  i=$((i+1)); N=$i$X
  [ $X = A ] && D=$BASE/mess-v533 || D=$BASE/mess-d
  stopp
  cd $D
  W="node scripts/werkbank.cjs"
  (PORT=4312 node save-server.js > $OUT/$N-save.log 2>&1 &)
  sleep 5
  $W start --echt --port 4490 --seite http://localhost:4312 > $OUT/$N-start.log 2>&1 &
  for t in $(seq 1 60); do grep -q "WERKBANK bereit" $OUT/$N-start.log 2>/dev/null && break; sleep 5; done
  echo "$N ($(git log -1 --format=%h)) bereit $(date +%T)"
  $W eval "window.__anazhAutoSettlement = false; return 1" > $OUT/$N-dorf.json 2>&1
  $W fenster 1920 1080 > $OUT/$N-fenster.json 2>&1
  if [ $X = B ]; then $W umstellen --ort wiese > $OUT/$N-umstellen.json 2>&1; else $W umstellen -900 -850 > $OUT/$N-umstellen.json 2>&1; fi
  $W eval "$BUEHNE" > $OUT/$N-buehne.json 2>&1
  $W eval "r.state.yaw = 0; r.state.pitch = 0; return {yaw: r.state.yaw}" > $OUT/$N-yaw0.json 2>&1
  $W lauf 30 --ein 20 --ruhe 300 --tiere frei --regler voll > $OUT/$N-lauf-voll.json 2>&1
  $W lauf 30 --ein 20 --ruhe 300 --tiere frei --regler frei > $OUT/$N-lauf-frei.json 2>&1
  echo "$N lauf fertig $(date +%T)"
  $W eval "r.state.yaw = 0; r.state.pitch = 0; return {yaw: r.state.yaw, wetter: r.state.weather}" > $OUT/$N-yaw0b.json 2>&1
  $W gpu-bank 12 --runden 3 > $OUT/$N-gpubank-yaw0.json 2>&1
  $W eval "r.state.yaw = -0.88; r.state.pitch = 0; return 1" > /dev/null 2>&1
  $W gpu-bank 12 --runden 3 > $OUT/$N-gpubank-yaw088.json 2>&1
  $W eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null 2>&1
  $W band > $OUT/$N-band-yaw0.txt 2>&1
  $W eval "r.state.yaw = -0.88; r.state.pitch = 0; return 1" > /dev/null 2>&1
  $W band > $OUT/$N-band-yaw088.txt 2>&1
  $W zaehlen > $OUT/$N-zaehlen.json 2>&1
  $W schirm --datei $OUT/$N-schirm-yaw088.png > $OUT/$N-schirm.json 2>&1
  $W eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null 2>&1
  $W profil 12 --regler voll --top 60 > $OUT/$N-profil.json 2>&1
  $W eval "return {wetter: r.state.weather, tag: r.state.timeOfDay, yaw: r.state.yaw, dorf: window.__anazhAutoSettlement}" > $OUT/$N-ende.json 2>&1
  echo "$N band/profil fertig $(date +%T)"
  if [ $N = 8B ]; then
    $W eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null 2>&1
    $W zerlegen --runden 6 --json artifacts/werkbank/zerlegen-omen-534.json > $OUT/8B-zerlegen.txt 2>&1; echo "8B zerlegen exit $? $(date +%T)"
    cp artifacts/werkbank/zerlegen-omen-534.json $OUT/ 2>/dev/null
    $W sicht --ruhe 300 --sonne 300 --drehen 360 --gehen 120 --regler voll > $OUT/8B-sicht.json 2>&1; echo "8B sicht exit $? $(date +%T)"
  fi
done
stopp
echo "ALLES ENDE $(date +%T)"
