#!/bin/bash
# 1410-1: Befehle und Dreiecke je Pass und Klasse am Genesis-Blick Süd (g-sued der Bild-Serie) — ./zaehl2.sh <name> <worktree> (Instrument abab-i546b)
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1410; INS=/c/Users/micha/Desktop/AnazhRealm-OMEN/abab-i546b
N=$1; WT=$2; export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"; D=$H/zaehl2; mkdir -p $D
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2
mkdir -p $D/stand/$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/$N/ 2>/dev/null
(cd $WT && PORT=4312 node save-server.js > $D/$N-server.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
(cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $D/$N-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/$N-werkbank.log 2>/dev/null && break; sleep 5; done
$W fenster 1920 1080 > /dev/null
$W umstellen --ort genesis > /dev/null 2>&1
$W eval "return (async () => { for (let t = 0; t < (${TICKS:-60}); t++) { window.__buehne(); if (window.__ortSchritt) window.__ortSchritt(); r._gameLoopTick(performance.now()); await new Promise((res) => setTimeout(res, 50)); } for (const c of r.state.creatures || []) c.visible = false; window.__buehne(); r._membranScanAt = -1e9; for (let i = 0; i < 200; i++) r._tickPortalMembranes(1000); r.state.yaw = 0; r.state.pitch = 0; return 1; })()" > /dev/null
$W zaehlen 0 +4 0 0 +2 30 --alle > $D/$N-sued.txt 2>&1
$W eval "const T = r.state.scene; const m4 = new THREE.Matrix4(), v = new THREE.Vector3(); const out = []; T.traverse((o) => { if (!o.isInstancedMesh) return; const n = o.count | 0; let nah = 0; for (let i = 0; i < n; i++) { o.getMatrixAt(i, m4); v.setFromMatrixPosition(m4).applyMatrix4(o.matrixWorld); if (v.z > 0 && v.z < 30 && Math.abs(v.x) < 20) nah++; } if (nah) out.push({ name: o.name || o.userData.instGroupKey || '?', zeichner: !!o.__zeichner, sichtbar: o.visible, count: n, nah, kugel: o.boundingSphere ? [o.boundingSphere.center.x, o.boundingSphere.center.y, o.boundingSphere.center.z, o.boundingSphere.radius].map((x) => +x.toFixed(1)) : null, fc: o.frustumCulled, layers: o.layers.mask }); }); return out;" > $D/$N-nah.txt 2>&1
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
echo "$N fertig"
