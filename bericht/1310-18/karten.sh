#!/bin/bash
# 1310-18: wächst die Karten-Belegung nach dem Einschwingen weiter? ./karten.sh <name> <worktree>
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k18; INS=/c/Users/micha/Desktop/AnazhRealm-OMEN/abab-i543
N=$1; WT=$2; export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"; D=$H/zensus
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2
mkdir -p $D/stand/$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/$N/ 2>/dev/null
(cd $WT && PORT=4312 node save-server.js > $D/$N-server.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $INS && node scripts/werkbank.cjs start --echt --port $WERKBANK_PORT --seite http://localhost:4312 > $D/$N-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $D/$N-werkbank.log 2>/dev/null && break; sleep 5; done
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > $D/$N-umstellen.json 2>&1
$W eval "return (async () => { const zaehl = () => { let fenster = 0, gruppe = 0; r.state.scene.traverse((o) => { const u = o.userData || {}; if (u.archInstanceKey === 'impostor#fimp:atlas') { if (u.instanzWahl === 'haupt') fenster += o.count; else if (!u.instanzWahl) gruppe += o.count; } }); const at = r._impostorAtlas ? r._impostorAtlas() : null; return { fenster, gruppe, schichten: at ? at.n : null }; }; const out = [zaehl()]; for (let i = 0; i < 20; i++) { for (let t = 0; t < 30; t++) { window.__buehne(); r._gameLoopTick(performance.now()); await new Promise((res) => setTimeout(res, 50)); } out.push(zaehl()); } return out; })()" > $D/$N-karten.json 2>&1
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
echo "$N: $(node -e "const j=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); const e=j.ergebnis||j; console.log(Array.isArray(e)? e.map(x=>x.fenster+'/'+x.gruppe+'/'+x.schichten).join(' '): JSON.stringify(e).slice(0,300))" $D/$N-karten.json)"
