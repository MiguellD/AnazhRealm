#!/bin/bash
# 1510-k72-abab: DER SCHATTEN DES SPIELERS IM BILD — bewegt er sich mit? K72 hält die Werfer-Wahl je Schatten-Pass, solange
# Lage, Werfer und Instanz-Wahl stehen; die Probe setzt den Spieler an der Wiese (Third, Mittag-Bühne der Messfolge nicht nötig:
# das Wetter hält die Werkbank) per Takt-Haken auf x0, x0+3, x0+6 m und nimmt je Lage den Schirm (1 s echter Loop), dazu einen
# Schirm im Gehen (4 m/s längs −z). Je Seite eine Sitzung, A (main 2031b3e4) und B (02fe5b6d), EIN Instrument abab-p02f.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510k72; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; D=$H/schatten; L=$H/fortschritt.log
INS=$R/abab-p02f; export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"; mkdir -p $D
stopp() { $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2; }
HAKEN='const P = Object.getPrototypeOf(r); const pm = r.state.playerMesh.position; const g = (window.__schattenZiel = { x0: pm.x, z0: pm.z, dx: 0, dz: 0, gehen: false, s: 0 }); r.tickAffordances = function (dt) { if (g.gehen && Number.isFinite(dt) && dt > 0) g.s -= 4 * Math.min(dt, 0.1); pm.x = g.x0 + g.dx; pm.z = g.z0 + g.dz + g.s; return P.tickAffordances.call(this, dt); }; return { x0: g.x0, z0: g.z0 };'
for S in A B; do
  WT=$R/abab-p203; [ $S = B ] && WT=$R/abab-p02f
  [ -f $D/$S-geh.png ] && continue
  echo "$(date +%T) schatten $S start" >> $L; stopp
  mkdir -p $D/stand/$S; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/$S/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $D/$S-server.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $D/$S-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/$S-werkbank.log 2>/dev/null && break; sleep 5; done
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort wiese --sicht third > $D/$S-umstellen.txt 2>&1
  $W lauf 10 --ein 30 --ruhe 300 --regler voll --tiere frei > $D/$S-ein.txt 2>&1
  $W eval "$HAKEN" > $D/$S-haken.txt 2>&1
  $W schirm --datei $D/$S-0.png > $D/$S-0.txt 2>&1
  $W eval "window.__schattenZiel.dx = 3; return 3" > /dev/null; $W schirm --datei $D/$S-3.png > $D/$S-3.txt 2>&1
  $W eval "window.__schattenZiel.dx = 6; return 6" > /dev/null; $W schirm --datei $D/$S-6.png > $D/$S-6.txt 2>&1
  $W eval "window.__schattenZiel.dx = 6; window.__schattenZiel.gehen = true; return 1" > /dev/null; $W schirm --datei $D/$S-geh.png > $D/$S-geh.txt 2>&1
  $W eval "delete r.tickAffordances; const g = window.__schattenZiel; return g ? { dx: g.dx, s: +g.s.toFixed(1) } : null;" > $D/$S-ende.txt 2>&1
  stopp; echo "$(date +%T) schatten $S ende" >> $L; sleep 20
done
echo "$(date +%T) SCHATTEN FERTIG" >> $L
