#!/bin/bash
# 1310-10: die Ankunft (kein Umstellen) — ab dem Start der Seite je 0,5 s: steht scene.environment, welche Himmelsfarbe, die
# Uhr, die Sonne; dann das Schatten-Bildpaar am Ankunftsort (Bühne mittags). WT=<arbeitsbaum> L=<etikett> bash ankunft.sh
B=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=${WT:?}; L=${L:?}; H=$B/p3/k10; OUT=$H/ankunft-$L; mkdir -p $OUT
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
wb eval "const st = r.state; window.__envProben = []; const t0 = performance.now(); window.__envTimer = setInterval(() => { const e = st.scene && st.scene.environment; const c = st._skyEnvLastColor; const dl = st.directionalLight; window.__envProben.push([+((performance.now() - t0) / 1000).toFixed(1), e ? 1 : 0, c ? [+c.r.toFixed(3), +c.g.toFixed(3), +c.b.toFixed(3)] : null, st.timeOfDay != null ? +(+st.timeOfDay).toFixed(3) : null, dl ? +dl.intensity.toFixed(2) : null]); }, 500); return { spieler: [st.playerMesh.position.x, st.playerMesh.position.z], env: !!st.scene.environment, zeit: st.timeOfDay };" > $OUT/start.json 2>&1
wb lauf 20 --ein 5 --ruhe 300 --tiere halten --regler voll > $OUT/lauf.txt 2>&1
wb eval "clearInterval(window.__envTimer); return window.__envProben;" > $OUT/proben.json 2>&1
wb eval "return window.__buehne()" > /dev/null
wb licht > $OUT/licht.json 2>&1
P=$(wb eval "const p = r.state.playerMesh.position; const gy = r._voxelSurfaceY(p.x, p.z); return [p.x.toFixed(1), (gy + 1.7).toFixed(1), p.z.toFixed(1), (p.x - 4).toFixed(1), (gy + 0.5).toFixed(1), (p.z - 10).toFixed(1)].join(' ');" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d.slice(d.indexOf("{")));console.log(j.ergebnis)})')
echo "blick $P" > $OUT/blick.txt
schalte() { wb eval "r.state.directionalLight.shadow.intensity = $1; r.state.scene.traverse((o) => { if (o.isBundleGroup) o.needsUpdate = true; }); return 1" > /dev/null; }
for z in mit ohne; do
  [ $z = mit ] && schalte 1 || schalte 0
  for n in 1 2; do mkdir -p $OUT/bild/$z$n; wb bild $P --datei $OUT/bild/$z$n/ankunft.png --w 1920 --h 1080 > /dev/null 2>&1; done
done
schalte 1
wb stop > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match '[s]ave-server' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
echo SITZUNG-ENDE
