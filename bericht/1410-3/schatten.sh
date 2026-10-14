#!/bin/bash
# 1410-3: Schatten-Takt verschränkt (je Frame höchstens EINE Kaskade) gegen den Stand, in EINER Sitzung abwechselnd — ./schatten.sh <name> <baum> <ort> <sicht>
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1410g; N=$1; WT=$2; ORT=$3; SICHT=$4; INS=/c/Users/micha/Desktop/AnazhRealm-OMEN/abab-id47; D=$H/schatten
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
$W eval "const P = Object.getPrototypeOf(r); const T = r.constructor.SCHATTEN_TAKT; window.__schattenNeu = function () { const rr = this.state.renderer; if (!rr || !rr.shadowMap) return; const dl = this.state.directionalLight; const frame = (this._shadowFrame = (this._shadowFrame || 0) + 1); if (!this._shadowLast) this._shadowLast = { sx: 0, sy: 0, sz: 0, k: [] }; const L = this._shadowLast; const sx = dl ? dl.position.x : 0, sy = dl ? dl.position.y : 0, sz = dl ? dl.position.z : 0; const sunMoved = (sx - L.sx) ** 2 + (sy - L.sy) ** 2 + (sz - L.sz) ** 2 > 4.0; if (sunMoved) { L.sx = sx; L.sy = sy; L.sz = sz; } const minInterval = Math.max(1, Math.round(this.state._shadowMinInterval || 1)); const csm = this.state.csmNode; const lichter = csm && csm.lights && csm.lights.length ? csm.lights : dl ? [dl] : []; let eine = false; for (let i = 0; i < lichter.length; i++) { const sh = lichter[i].shadow; if (!sh) continue; sh.autoUpdate = false; const takt = i === 0 ? T.nahMax : Math.max(T.nahMax, minInterval) * T.fernFaktor; const faellig = !(frame - (L.k[i] != null ? L.k[i] : -1e9) < takt); if (sunMoved || (faellig && !eine)) { sh.needsUpdate = true; L.k[i] = frame; eine = true; } } }; return 1;" > $D/$N-haken.txt 2>&1
for R in 1 2; do
  $W eval "delete r._loopShadowUpdate; return 1" > /dev/null
  $W lauf 20 --ein 3 --regler voll --tiere frei > $D/$N-alt-$R.txt 2>&1
  $W eval "r._loopShadowUpdate = window.__schattenNeu; return 1" > /dev/null
  $W lauf 20 --ein 3 --regler voll --tiere frei > $D/$N-neu-$R.txt 2>&1
done
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
echo "$N ende"
