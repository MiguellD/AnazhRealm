#!/bin/bash
# 1310-18: der Instanz-Zensus an der Pose Wiese-Nord — ./zensus.sh <name> <worktree>
# Dieselben Pins wie bild.sh; nach dem Bild w-nord je Instanz-Gruppe (archInstanceKey) Anzahl, Sichtbarkeit, Stoff-Signatur und
# Wind der Art, dazu die Karten (Impostor) und der Fernwald — der Unterschied A↔B wird je Gruppe sichtbar.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k18
INS=/c/Users/micha/Desktop/AnazhRealm-OMEN/abab-i543
N=$1; WT=$2; SEITE=4312; export WERKBANK_PORT=4490
W="node $INS/scripts/werkbank.cjs"
D=$H/zensus; mkdir -p $D/$N
O=$(cd $D/$N && pwd -W)
stopp() {
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  sleep 2
}
stopp
mkdir -p $D/stand/$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/$N/ 2>/dev/null
(cd $WT && PORT=$SEITE node save-server.js > $D/$N-server.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:$SEITE/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $INS && node scripts/werkbank.cjs start --echt --port $WERKBANK_PORT --seite http://localhost:$SEITE > $D/$N-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $D/$N-werkbank.log 2>/dev/null && break; sleep 5; done
$W fenster 1920 1080 > /dev/null
$W eval "r._loopSkyboxZeit = function () { if (this.state.skyboxUniforms && this.state.skyboxUniforms.time) this.state.skyboxUniforms.time.value = 1000; }; r._loopSkyboxZeit(); window.__jitterStart = 0; const A0 = window.__ausgabeAufnahme; window.__ausgabeAufnahme = function (...a) { if (r.state.traaNode) r.state.traaNode._jitterIndex = window.__jitterStart; return A0.apply(this, a); }; return 1" > /dev/null
$W eval "const P = Object.getPrototypeOf(r); r._loopRender = function () { return P._loopRender.call(this, 1000); }; const nf = r.state.renderer._nodes.nodeFrame; nf.update = function () { this.frameId++; this.deltaTime = 0; this.time = 1000; }; return 1" > /dev/null
$W umstellen --ort wiese > $D/$N-umstellen.json 2>&1
$W eval "for (const c of r.state.creatures || []) c.visible = false; window.__buehne(); r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
$W bild -900 +1.7 -850 -900 +0 -880 --w 1920 --h 1080 --datei "$O/w-nord.png" > $D/$N-bild.txt 2>&1
$W eval "const out = {}; r.state.scene.traverse((o) => { if (!o.isMesh) return; const u = o.userData || {}; const key = u.archInstanceKey || u.inventar || u.chunkSatz || u.bauSatz || u.streuSatz || null; if (!key) return; const m = Array.isArray(o.material) ? o.material[0] : o.material; const mu = (m && m.userData) || {}; const k = key + (u.instanzWahl ? '#' + u.instanzWahl : ''); const e = (out[k] = out[k] || { n: 0, count: 0, sichtbar: 0 }); e.n++; e.count += o.isInstancedMesh ? o.count : 1; if (o.visible && (!o.parent || o.parent.visible !== false)) e.sichtbar++; e.sig = mu.foundrySignatur || null; e.wind = mu.windArt ? [mu.windArt.x, mu.windArt.y, mu.windArt.z].map((v) => +(+v).toFixed(3)).join('/') : null; e.pos = !!(m && m.positionNode); }); out.__regler = { dichte: r.state._foliageDensityScale, perf: r._lodPerfMul(), uPerf: r._ensureLodUniforms().uLodPerf.value }; return out;" > $D/$N-zensus.json 2>&1
stopp
echo "$N fertig"
