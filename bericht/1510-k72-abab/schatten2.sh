#!/bin/bash
# 1510-k72-abab, SCHATTEN-PROBE 2: der Schatten des Spielers auf der Stein-Plattform an Genesis (Third), die Uhr auf 0,70 (tiefe
# Sonne, der Schatten fällt lang neben den Spieler; auf der Wiese verdeckte die Grasnarbe ihn mittags). Spieler per Takt-Haken
# auf 0, 2, 4 m (x), je ein Schirm, dazu einer im Gehen. Je Seite eine Sitzung, A main 2031b3e4, B 02fe5b6d, EIN Instrument abab-p02f.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510k72; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; D=$H/schatten2; L=$H/fortschritt.log
INS=$R/abab-p02f; export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"; mkdir -p $D
stopp() { $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2; }
HAKEN='const P = Object.getPrototypeOf(r); const pm = r.state.playerMesh.position; const g = (window.__schattenZiel = { x0: pm.x, z0: pm.z, dx: 0, dz: 0, gehen: false, s: 0 }); r.tickAffordances = function (dt) { if (g.gehen && Number.isFinite(dt) && dt > 0) g.s -= 4 * Math.min(dt, 0.1); pm.x = g.x0 + g.dx; pm.z = g.z0 + g.dz + g.s; return P.tickAffordances.call(this, dt); }; return { x0: g.x0, z0: g.z0 };'
for S in A B; do
  WT=$R/abab-p203; [ $S = B ] && WT=$R/abab-p02f
  [ -f $D/$S-geh.png ] && continue
  echo "$(date +%T) schatten2 $S start" >> $L; stopp
  mkdir -p $D/stand/$S; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/$S/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $D/$S-server.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $D/$S-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/$S-werkbank.log 2>/dev/null && break; sleep 5; done
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort genesis --sicht third > $D/$S-umstellen.txt 2>&1
  $W lauf 10 --ein 30 --ruhe 300 --regler voll --tiere frei > $D/$S-ein.txt 2>&1
  $W eval "r._uhrSetzen(0.70, \"werkbank\"); return r.state.timeOfDay" > $D/$S-uhr.txt 2>&1
  $W eval "$HAKEN" > $D/$S-haken.txt 2>&1
  $W schirm --datei $D/$S-0.png > $D/$S-0.txt 2>&1
  $W eval "window.__schattenZiel.dx = 2; return 2" > /dev/null; $W schirm --datei $D/$S-2.png > $D/$S-2.txt 2>&1
  $W eval "window.__schattenZiel.dx = 4; return 4" > /dev/null; $W schirm --datei $D/$S-4.png > $D/$S-4.txt 2>&1
  $W eval "window.__schattenZiel.dx = 4; window.__schattenZiel.gehen = true; return 1" > /dev/null; $W schirm --datei $D/$S-geh.png > $D/$S-geh.txt 2>&1
  $W eval "delete r.tickAffordances; const g = window.__schattenZiel; return g ? { dx: g.dx, s: +g.s.toFixed(1) } : null;" > $D/$S-ende.txt 2>&1
  stopp; echo "$(date +%T) schatten2 $S ende" >> $L; sleep 20
done
echo "$(date +%T) SCHATTEN2 FERTIG" >> $L
