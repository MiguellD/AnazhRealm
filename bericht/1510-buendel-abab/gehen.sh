#!/bin/bash
# 1510-buendel-abab: GEHEN an der Wiese (K55) wie boden3 — integ-probe e8a370ad gegen main 0bbee8fc; der Spieler geht geradeaus nach −z, 0 → −60 m und zurück,
# 4 m/s, im echten Loop (Haken in tickAffordances, 25a.js je Frame); werkbank lauf unter Regler voll: CPU-Takt und Frame je Lauf,
# zuerst stehend, dann zweimal gehend. ./gehen.sh <name> <baum>
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510b; N=$1; WT=$2; INS=/c/Users/micha/Desktop/AnazhRealm-OMEN/abab-pe8a; D=$H/gehen
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
$W umstellen --ort wiese > $D/$N-umstellen.txt 2>&1
$W lauf 25 --ein 10 --regler voll --tiere frei > $D/$N-steht.txt 2>&1
$W eval "const P = Object.getPrototypeOf(r); const pm = r.state.playerMesh.position; const g = (window.__bodenGeher = { x: pm.x, z: pm.z, s: 0, dir: -1, wege: 0 }); r.tickAffordances = function (dt) { if (Number.isFinite(dt) && dt > 0) { g.s += g.dir * 4 * Math.min(dt, 0.1); if (g.s <= -60) { g.s = -60; g.dir = 1; g.wege++; } if (g.s >= 0) { g.s = 0; g.dir = -1; g.wege++; } pm.x = g.x; pm.z = g.z + g.s; } return P.tickAffordances.call(this, dt); }; return { ein: true, x: g.x, z: g.z };" > $D/$N-geher.txt 2>&1
for R in 1 2; do $W lauf 30 --ein 2 --regler voll --tiere frei > $D/$N-geht-$R.txt 2>&1; done
$W eval "delete r.tickAffordances; const g = window.__bodenGeher; return g ? { s: +g.s.toFixed(1), wege: g.wege } : null;" > $D/$N-geher-ende.txt 2>&1
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
echo "$N ende"
