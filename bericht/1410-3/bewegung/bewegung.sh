#!/bin/bash
# 1410-3 Bewegungs-Regel: in EINER Sitzung das alte Gesetz (vor 1410-3) gegen das neue, STEHEND und GEHEND+DREHEND (4 m/s, 90°/s), je 2 Läufe — ./bewegung.sh <name> <baum> <ort> <sicht>
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1410g; N=$1; WT=$2; ORT=$3; SICHT=$4; INS=/c/Users/micha/Desktop/AnazhRealm-OMEN/abab-id47; D=$H/bewegung
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2
mkdir -p $D/stand/$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/$N/ 2>/dev/null
(cd $WT && PORT=4312 node save-server.js > $D/$N-server.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
(cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $D/$N-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/$N-werkbank.log 2>/dev/null && break; sleep 5; done
$W fenster 1920 1080 > /dev/null
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W umstellen --ort $ORT --sicht $SICHT > $D/$N-umstellen.txt 2>&1
$W lauf 40 --ein 10 --regler voll --tiere frei > $D/$N-lauf.txt 2>&1
$W eval "const P = Object.getPrototypeOf(r); window.__gesetzNeu = P._loopShadowUpdate; window.__gesetzAlt = function () { const rr = this.state.renderer; if (!rr || !rr.shadowMap) return; const dl = this.state.directionalLight; const frame = (this._shadowFrame = (this._shadowFrame || 0) + 1); if (!this._shadowLast) this._shadowLast = { sx: 0, sy: 0, sz: 0, k: [] }; const L = this._shadowLast; const sx = dl ? dl.position.x : 0, sy = dl ? dl.position.y : 0, sz = dl ? dl.position.z : 0; const sunMoved = (sx - L.sx) ** 2 + (sy - L.sy) ** 2 + (sz - L.sz) ** 2 > 4.0; if (sunMoved) { L.sx = sx; L.sy = sy; L.sz = sz; } const T = this.constructor.SCHATTEN_TAKT; const minInterval = Math.max(1, Math.round(this.state._shadowMinInterval || 1)); const csm = this.state.csmNode; const lichter = csm && csm.lights && csm.lights.length ? csm.lights : dl ? [dl] : []; for (let i = 0; i < lichter.length; i++) { const sh = lichter[i].shadow; if (!sh) continue; sh.autoUpdate = false; const takt = i === 0 ? Math.min(T.nahMax, minInterval) : minInterval * T.fernFaktor; if (sunMoved || !(frame - (L.k[i] != null ? L.k[i] : -1e9) < takt)) { sh.needsUpdate = true; L.k[i] = frame; } } }; const Z = (window.__bw = { frames: 0, bewegt: 0 }); const eps = r.constructor.SCHATTEN_RUHE_EPS; let alt = null; window.__zaehleBewegt = function () { const me = r.state.camera.matrixWorld.elements; let b = false; if (alt) for (let j = 0; j < 16; j++) if (!(Math.abs(me[j] - alt[j]) <= eps)) { b = true; break; } alt = Float64Array.from(me); Z.frames++; if (b) Z.bewegt++; }; const pm = r.state.playerMesh.position; const g = (window.__geher = { an: false, x: pm.x, z: pm.z, s: 0, dir: -1 }); r.tickAffordances = function (dt) { window.__zaehleBewegt(); if (g.an && Number.isFinite(dt) && dt > 0) { const d = Math.min(dt, 0.1); g.s += g.dir * 4 * d; if (g.s <= -30) { g.s = -30; g.dir = 1; } if (g.s >= 0) { g.s = 0; g.dir = -1; } pm.x = g.x; pm.z = g.z + g.s; r.state.yaw = (r.state.yaw || 0) + (Math.PI / 2) * d; } return P.tickAffordances.call(this, dt); }; return 1;" > $D/$N-haken.txt 2>&1
for MODUS in steht geht; do
  if [ $MODUS = geht ]; then $W eval "window.__geher.an = true; return 1" > /dev/null; fi
  for R in 1 2; do
    for G in alt neu; do
      case $G in alt) GN=Alt;; neu) GN=Neu;; esac
      $W eval "r._loopShadowUpdate = window.__gesetz$GN; window.__bw.frames = 0; window.__bw.bewegt = 0; return 1" > /dev/null
      $W lauf 20 --ein 3 --regler voll --tiere frei > $D/$N-$MODUS-$G-$R.txt 2>&1
      $W eval "return window.__bw;" > $D/$N-$MODUS-$G-$R-bw.txt 2>&1
    done
  done
done
$W eval "delete r._loopShadowUpdate; delete r.tickAffordances; window.__geher.an = false; return 1" > /dev/null
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
echo "$N ende"
