#!/bin/bash
# 0710-11 Gelb (Gegenprüfung 0710-10): die drei Klassen-Mitglieder mit Kosten an der Mess-Wiese — `_tickPortalMembranes`
# (1 Hz über den Bestand, isPortal), `_tickHausTueren` (1 Hz über den Bestand, 40 m), `_hasMagnifyingInSight` (Z-Taste:
# Meshes des Bestands sammeln, ein Strahl). B-Welt welle-m-boosts.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-boosts
OUT=$BASE/p3/boosts/gelb; mkdir -p $OUT
export WERKBANK_PORT=7902
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $OUT/fortschritt.log; }
(cd $INSTR && PORT=7901 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7901/ 2>/dev/null | grep -q 200 && break; sleep 1; done
say "Seite $(curl -s http://localhost:7901/anazhRealm.js | sha256sum | cut -c1-16)"
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 7902 --seite http://localhost:7901 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > $OUT/umstellen.txt 2>&1
$W eval "return window.__buehne()" > /dev/null
$W lauf 20 --ein 10 --regler voll --tiere frei > $OUT/lauf-ein.txt 2>&1
say "an der Wiese"
$W takt 1200 --extra _tickPortalMembranes,_tickHausTueren,_hasMagnifyingInSight,tickArchitectures > $OUT/takt.txt 2>&1
say "takt $(tr -d '\n ' < $OUT/takt.txt | cut -c1-120)"
$W eval "
const P = Object.getPrototypeOf(r);
const st = r.state;
const zeit = (fn, n) => { const t = []; for (let i = 0; i < n; i++) { const t0 = performance.now(); fn(); t.push(performance.now() - t0); } t.sort((a, b) => a - b); return { mittel: +(t.reduce((a, b) => a + b, 0) / n).toFixed(3), p50: +t[n >> 1].toFixed(3), max: +t[n - 1].toFixed(3) }; };
const bestand = st.architectures.length;
const portale = st.architectures.filter((e) => e && e.affordances && e.affordances.isPortal).length;
const pm = st.playerMesh.position;
const nah40 = st.architectures.filter((e) => e && e.position && Math.hypot(e.position.x - pm.x, e.position.z - pm.z) <= 40).length;
// die Sekunden-Scans erzwingen: die Uhr der Scans zurücksetzen, dann je Ruf scannen
const membran = zeit(() => { r._membranScanAt = -1e9; P._tickPortalMembranes.call(r, performance.now() / 1000); }, 50);
const tueren = zeit(() => { r._hausTuerScanT = -1e9; P._tickHausTueren.call(r, performance.now()); }, 50);
const lupe = zeit(() => P._hasMagnifyingInSight.call(r), 50);
return { bestand, portale, nah40, membranScan: membran, tuerenScan: tueren, lupe };
" > $OUT/gelb.json 2>&1
say "gelb $(tr -d '\n ' < $OUT/gelb.json | cut -c1-300)"
$W stop > /dev/null 2>&1
sleep 3
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server' | ? { \$_.ProcessId -in (Get-NetTCPConnection -State Listen -LocalPort 7901 -ErrorAction SilentlyContinue | % OwningProcess) } | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
say "ENDE"
