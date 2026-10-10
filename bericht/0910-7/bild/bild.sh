#!/bin/bash
# 0910-7 (O1 Abnahme „Bild unverändert"): je Seite zwei frische Sitzungen (A B A B), Wiese, Bühne, lauf 30 --regler frei (der
# gemessene Zustand), dann EIN Bild aus dem Ausgabe-Pfad mit fester TRAA-Phase und Himmels-Uhr. Instrument = Kopf, Seite :7903.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-takt-frei
OUT=$BASE/p3/tf/bild; mkdir -p $OUT
export WERKBANK_PORT=7904
W="node $INSTR/scripts/werkbank.cjs"
stopp() {
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | ? { \$_.LocalPort -ge 7900 -and \$_.LocalPort -le 7909 } | % { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil-790' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  sleep 2
}
PIN='r._loopSkyboxZeit = function () { if (this.state.skyboxUniforms && this.state.skyboxUniforms.time) this.state.skyboxUniforms.time.value = 1000; }; if (!window.__roh) window.__roh = window.__ausgabeAufnahme; window.__ausgabeAufnahme = function (...a) { if (r.state.traaNode) r.state.traaNode._jitterIndex = 0; return window.__roh.apply(this, a); }; return 1;'
i=0
for S in A B A B; do
  i=$((i+1)); N=$S$i
  [ $S = A ] && WT=$BASE/takt-bisekt || WT=$BASE/welle-m-takt-frei
  stopp
  (cd $WT && PORT=7903 node save-server.js > $OUT/$N-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7903/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  (cd $INSTR && node scripts/werkbank.cjs start --echt --port 7904 --seite http://localhost:7903 > $OUT/$N-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$N-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort wiese > /dev/null
  $W eval "return window.__buehne()" > /dev/null
  $W eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
  $W lauf 30 --ein 20 --ruhe 300 --tiere halten --regler frei > $OUT/$N-lauf.txt 2>&1
  $W eval "$PIN" > /dev/null
  $W eval "const st = r.state; return { dichte: st._foliageDensityScale, laub: st.foliageRadius, arch: st.architectureCullingRadius }" > $OUT/$N-stell.json
  P=$(tr -d '\n ' < $OUT/$N-stell.json | grep -o '"ergebnis":{[^}]*}')
  # Blick der Mess-Wiese (Auge 1,7 m über dem Boden, nach +z)
  $W bild -900 "+1.7" -850 -900 "+1.5" -830 --datei "C:/Users/micha/Desktop/AnazhRealm-OMEN/p3/tf/bild/$N.png" --w 1280 --h 720 > $OUT/$N-bild.txt 2>&1
  echo "$N $P $(grep -E 'hell|kontrast' $OUT/$N-bild.txt | tr -d '\n ' | cut -c1-80)"
done
stopp
