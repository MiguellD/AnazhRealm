#!/bin/bash
# 0910-6: greift die Bühne auf B wie auf A? Je Seite: Bühne, Tageszeit lesen, 120 s echter Loop (lauf), Tageszeit lesen.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-b538
OUT=$BASE/abab538
export WERKBANK_PORT=7904
W="node $INSTR/scripts/werkbank.cjs"
stopp() {
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | ? { \$_.LocalPort -ge 7900 -and \$_.LocalPort -le 7909 } | % { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil-790' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  sleep 2
}
LES='const st = r.state; const L = st.directionalLight; const d = L.position.clone().sub(L.target.position).normalize(); return { tageszeit: +(+st.timeOfDay).toFixed(4), welt: st.world ? +(+st.world.timeOfDay).toFixed(4) : null, sonneHoehe: +(Math.asin(d.y) * 57.2958).toFixed(1), wetter: st.weather, uhrWetter: st.weatherEffectTime };'
for S in A B; do
  [ $S = A ] && D=$BASE/abab-b537 || D=$BASE/abab-b538
  stopp
  (cd $D && PORT=7903 node save-server.js > $OUT/uhr-$S-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7903/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  (cd $INSTR && node scripts/werkbank.cjs start --echt --port 7904 --seite http://localhost:7903 > $OUT/uhr-$S-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/uhr-$S-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W umstellen --ort wiese > /dev/null
  $W eval "window.__buehne(); $LES" > $OUT/uhr-$S-vor.json
  $W lauf 120 --ein 5 --ruhe 60 --tiere frei --regler voll > $OUT/uhr-$S-lauf.txt 2>&1
  $W eval "$LES" > $OUT/uhr-$S-nach.json
  echo "$S vor: $(tr -d '\n ' < $OUT/uhr-$S-vor.json)"
  echo "$S nach: $(tr -d '\n ' < $OUT/uhr-$S-nach.json)"
done
stopp
