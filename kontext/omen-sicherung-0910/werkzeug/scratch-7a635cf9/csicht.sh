#!/bin/bash
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
OUT=$BASE/csicht; mkdir -p $OUT
B=$BASE/AnazhRealm-csicht
W="node $B/scripts/werkbank.cjs"
stopp() {
  (cd $B && $W stop >/dev/null 2>&1)
  powershell -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
for X in A B; do
  [ $X = A ] && D=$BASE/AnazhRealm-kand || D=$B
  stopp
  (cd $D && PORT=4312 node save-server.js > $OUT/$X-save.log 2>&1 &)
  sleep 5
  cd $B
  $W start --echt --port 4490 --seite http://localhost:4312 > $OUT/$X-start.log 2>&1 &
  for t in $(seq 1 60); do grep -q "WERKBANK bereit" $OUT/$X-start.log 2>/dev/null && break; sleep 5; done
  echo "$X ($(cd $D && git log -1 --format=%h)) bereit $(date +%T)"
  $W eval "r.state.perfTargetMs = 1000; return 1" > $OUT/$X-perf.json 2>&1
  $W fenster 1920 1080 > $OUT/$X-fenster.json 2>&1
  $W umstellen -900 -850 > $OUT/$X-umstellen.json 2>&1
  $W lauf 5 --ein 90 --ruhe 300 --regler voll --tiere frei > $OUT/$X-lauf.json 2>&1
  echo "$X lauf fertig $(date +%T)"
  $W eval "r.state.yaw = 0; r.state.pitch = 0; r.state.dayLengthMinutes = 1e12; return {perf: r.state.perfTargetMs, wetter: r.state.weather}" > $OUT/$X-blick.json 2>&1
  $W profil 12 --regler voll --top 400 > $OUT/profil-$X.json 2>&1
  $W takt 300 --extra _passSicht,_chunkSatzPass,_hoehlenSicht,_hoehlenSichtLicht,_instanzWahlPass,_tickFernRing,_fernRingRefresh > $OUT/takt-$X.json 2>&1
  echo "$X profil/takt fertig $(date +%T)"
  $W sicht --ruhe 300 --drehen 360 --gehen 120 --tag laeuft > $OUT/sicht-$X.json 2>&1
  echo "$X sicht exit $? $(date +%T)"
  $W zaehlen > $OUT/$X-zaehlen.json 2>&1
done
stopp
echo "ALLES ENDE $(date +%T)"
