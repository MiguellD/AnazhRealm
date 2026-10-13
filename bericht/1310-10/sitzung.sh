#!/bin/bash
# 1310-10: EINE Sitzung an der Wiese mittags (Bühne): die Licht-Bilanz je Term und je Blick zwei Bilder mit und zwei ohne
# Sonnenschatten (shadow.intensity 1/0, Live-Uniform) aus dem Ausgabe-Pfad. WT=<arbeitsbaum> L=<etikett> bash sitzung.sh
B=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=${WT:?}; L=${L:?}; H=$B/p3/k10; OUT=$H/$L; mkdir -p $OUT
export WERKBANK_PORT=4490
wb() { (cd $WT && node scripts/werkbank.cjs "$@"); }
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match '[s]ave-server|[w]erkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match '[w]erkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
sleep 2
(cd $WT && PORT=4312 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
grep -m1 "WERKBANK bereit" $OUT/werkbank.log || { echo "KEIN START"; exit 1; }
wb eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
wb fenster 1920 1080 > /dev/null
wb umstellen --ort wiese > $OUT/umstellen.txt 2>&1
wb eval "return window.__buehne()" > /dev/null
wb lauf 15 --ein 15 --ruhe 300 --tiere halten --regler voll > $OUT/lauf.txt 2>&1; echo "lauf EXIT=$?"
wb licht > $OUT/licht.json 2>&1; echo "licht EXIT=$?"
wb eval "const p = r.state.playerMesh.position; const gy = r._voxelSurfaceY(p.x, p.z); const dl = r.state.directionalLight; return { spieler: [p.x, p.z], boden: gy, sonne: dl.position.clone().sub(dl.target.position).normalize().toArray(), intensitaet: dl.intensity, schattenIntensitaet: dl.shadow.intensity }" > $OUT/lage.json 2>&1
schalte() { wb eval "r.state.directionalLight.shadow.intensity = $1; r.state.scene.traverse((o) => { if (o.isBundleGroup) o.needsUpdate = true; }); return r.state.directionalLight.shadow.intensity" > /dev/null; }
wb eval "return window.__buehne()" > /dev/null
for z in mit ohne; do
  [ $z = mit ] && schalte 1 || schalte 0
  for n in 1 2; do
    mkdir -p $OUT/bild/$z$n
    wb bild -900 26.3 -850 -900 25.5 -880 --datei $OUT/bild/$z$n/wiese.png --w 1920 --h 1080 > /dev/null 2>&1
    wb bild -896 29 -838 -902 25.5 -846 --datei $OUT/bild/$z$n/birke.png --w 1920 --h 1080 > /dev/null 2>&1
  done
done
schalte 1
wb stop > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match '[s]ave-server' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
echo SITZUNG-ENDE
