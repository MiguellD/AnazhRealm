#!/bin/bash
# 1410-2: der CPU-Täter tickAffordances — wie viele Einträge liest der Takt an der Wiese, was kostet ein Aufruf. ./strahler.sh <name> <baum> <instrument>
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1410b; N=$1; WT=$2; INS=$3; D=$H/strahler
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
$W eval "return (async () => { for (let t = 0; t < 60; t++) { window.__buehne(); if (window.__ortSchritt) window.__ortSchritt(); r._gameLoopTick(performance.now()); await new Promise((res) => setTimeout(res, 50)); }
 const n = (k) => r._blockerMit(k).length; const out = { arch: (r.state.architectures || []).length, radiating: n('radiating'), broadcasting: n('broadcasting'), focusing: n('focusing'), balancing: n('balancing'), lifting: n('lifting') };
 const typen = {}; for (const e of r._blockerMit('radiating')) typen[e.type] = (typen[e.type] || 0) + 1; out.radiatingTypen = typen;
 const tb = {}; for (const e of r._blockerMit('broadcasting')) tb[e.type] = (tb[e.type] || 0) + 1; out.broadcastingTypen = tb;
 const p = r.state.playerMesh.position; out.spieler = [p.x, p.y, p.z].map((v) => +v.toFixed(1));
 const mess = (f) => { const t0 = performance.now(); for (let i = 0; i < 300; i++) f(); return +((performance.now() - t0) / 300).toFixed(3); };
 out.msTickAffordances = mess(() => r.tickAffordances(1 / 60)); out.msRadiating = mess(() => r._tickRadiatingAffordances(1 / 60)); out.msFocusing = mess(() => r._tickFocusingAffordances(1 / 60));
 return JSON.stringify(out); })()" > $D/$N-zahl.txt 2>&1
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
mv $D/stand/$N/anazhRealmState.json $WT/ 2>/dev/null; true
echo "$N ende"; cat $D/$N-zahl.txt
