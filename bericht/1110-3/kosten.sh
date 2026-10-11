#!/bin/bash
# 1110-3 Kosten-Wachen: je Seite eine frische Sitzung an der Wiese. A: Attribut-Bytes je Name. B: Attribut-Bytes, dann gpu-bank
# wie es ist · ohne Ego-Wurf (Leib-Knoten auf Ebene 2 → Maske 0) · ohne Licht des Auges (aus der Szene) · wieder wie es ist.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
OUT=$BASE/abab540/kosten; mkdir -p $OUT
INSTR=$BASE/abab-b540
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
stopp() {
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
ATTR='const m = new Map(); const seen = new Set(); r.state.scene.traverse((o) => { const g = o.geometry; if (!g || !g.attributes) return; for (const [n, a] of Object.entries(g.attributes)) { const arr = a.isInterleavedBufferAttribute ? a.data.array : a.array; if (!arr || seen.has(arr)) continue; seen.add(arr); m.set(n, (m.get(n) || 0) + arr.byteLength); } }); const o = {}; let s = 0; for (const [n, b] of [...m].sort((x, y) => y[1] - x[1])) { o[n] = +(b / 1048576).toFixed(3); s += b; } o.SUMME = +(s / 1048576).toFixed(3); return o;'
for S in A B; do
  stopp
  [ $S = A ] && WT=$BASE/abab-b539 || WT=$BASE/abab-b540
  (cd $WT && PORT=4312 node save-server.js > $OUT/$S-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  (cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/$S-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$S-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort wiese > /dev/null
  $W eval "return window.__buehne()" > /dev/null
  $W lauf 20 --ein 20 --regler voll --tiere halten > $OUT/$S-lauf.txt 2>&1
  $W eval "$ATTR" > $OUT/$S-attribute.json 2>&1
  if [ $S = B ]; then
    $W gpu-bank 240 --runden 3 > $OUT/B-bank-1-wie.txt 2>&1
    $W eval "let n = 0; r.state.playerMesh.traverse((o) => { if (o.layers.mask === 4) { o.userData.__kostenMaske = 4; o.layers.mask = 0; n++; } }); return n" > $OUT/B-ego-aus.json 2>&1
    $W gpu-bank 240 --runden 3 > $OUT/B-bank-2-ohneEgoWurf.txt 2>&1
    $W eval "let n = 0; r.state.playerMesh.traverse((o) => { if (o.userData.__kostenMaske) { o.layers.mask = o.userData.__kostenMaske; delete o.userData.__kostenMaske; n++; } }); const L = r.state.augenLicht; const p = L && L.parent; if (p) p.remove(L); window.__augenLichtEltern = p; return { zurueck: n, licht: !!p, I: L && L.intensity }" > $OUT/B-licht-aus.json 2>&1
    $W gpu-bank 240 --runden 3 > $OUT/B-bank-3-ohneAugenLicht.txt 2>&1
    $W eval "const L = r.state.augenLicht; if (window.__augenLichtEltern) window.__augenLichtEltern.add(L); return !!L.parent" > /dev/null
    $W gpu-bank 240 --runden 3 > $OUT/B-bank-4-wie.txt 2>&1
    $W zaehlen > $OUT/B-zaehlen-wie.txt 2>&1
  fi
done
stopp
echo KOSTEN-ENDE
