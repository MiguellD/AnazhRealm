#!/bin/bash
# 0910-8 Makro-Bild aus 420 m und Blick aus 60 m, Ausgabe-Pfad (`werkbank bild` → __ausgabeAufnahme), main gegen Kopf an
# derselben Stelle der Mess-Wiese nach `lauf 30` (Regler frei, Ring 4).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-weisse-masse
OUT=$BASE/p3/wm2/bild2; mkdir -p $OUT
export WERKBANK_PORT=7904
W="node $INSTR/scripts/werkbank.cjs"
stopp() { $W stop > /dev/null 2>&1; sleep 2; powershell -NoProfile -c "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | ? { \$_.LocalPort -ge 7900 -and \$_.LocalPort -le 7909 } | % { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil-790' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; sleep 3; }
for S in main kopf; do
  [ $S = main ] && WT=$BASE/abab-b541 || WT=$INSTR
  stopp
  (cd $WT && PORT=7903 node save-server.js > $OUT/$S-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7903/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  (cd $INSTR && node scripts/werkbank.cjs start --echt --port 7904 --seite http://localhost:7903 > $OUT/$S-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$S-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort wiese > /dev/null
  $W eval "return window.__buehne()" > /dev/null
  $W lauf 30 --ein 20 --regler frei --tiere halten > $OUT/$S-lauf.txt 2>&1
  $W eval "const k = r.state.fernKroneNah; return { ring: r._builtRingRadius(), karte: k ? { bereit: k.U.bereit.value, mitte: k.U.mitte.value.toArray(), groesse: k.U.groesse.value, waldR: k.U.waldR.value, job: k.job ? k.job.i : null } : null };" > $OUT/$S-karte.json 2>&1
  $W bild -900 "+420" -849 -900 "+0" -850 --datei "C:/Users/micha/Desktop/AnazhRealm-OMEN/p3/wm2/bild2/$S-420.png" --w 960 --h 540 > /dev/null 2>&1
  $W bild -900 "+60" -850 -780 "+0" -700 --datei "C:/Users/micha/Desktop/AnazhRealm-OMEN/p3/wm2/bild2/$S-60.png" --w 960 --h 540 > /dev/null 2>&1
  $W albedo --nah-fern --datei "C:/Users/micha/Desktop/AnazhRealm-OMEN/p3/wm2/bild2/$S-linse.json" > $OUT/$S-linse.txt 2>&1
  echo "== $S linse EXIT=$?"
done
stopp
echo BILD-ENDE
