#!/bin/bash
# 1410-2: der CPU-Täter tickAffordances im laufenden Takt — Neubauten des Blocker-Netzes je Tick, Zeit des Affordanz-Takts je Tick. ./strahler2.sh <name> <baum> <instrument>
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1410b; N=$1; WT=$2; INS=$3; D=$H/strahler2
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
$W eval "return (async () => { for (let t = 0; t < 30; t++) { window.__buehne(); if (window.__ortSchritt) window.__ortSchritt(); r._gameLoopTick(performance.now()); await new Promise((res) => setTimeout(res, 50)); }
 const roh = r.tickAffordances; let ms = 0, n = 0, neu = 0; const lroh = r._blockerNetz; let gen0 = r._blockerNetz().gen; const listen = new Set();
 r.tickAffordances = function (dt) { const g = this._blockerNetz().gen; const t0 = performance.now(); const x = roh.call(this, dt); ms += performance.now() - t0; n++; return x; };
 const archId = []; for (let t = 0; t < 120; t++) { archId.push(r.state.architectures); r._gameLoopTick(performance.now()); await new Promise((res) => setTimeout(res, 16)); }
 delete r.tickAffordances; const gen1 = r._blockerNetz().gen; const ids = new Set(archId).size;
 const out = { ticks: 120, affordanzAufrufe: n, msJeAufruf: +(ms / Math.max(1, n)).toFixed(3), netzNeubauten: gen1 - gen0, archArrays: ids, arch: r.state.architectures.length };
 return JSON.stringify(out); })()" > $D/$N-zahl.txt 2>&1
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
mv $D/stand/$N/anazhRealmState.json $WT/ 2>/dev/null; true
echo "$N ende"; cat $D/$N-zahl.txt
