#!/bin/bash
# (3) Dorf-VRAM: EIN Boot am Messort dorf — ./boot.sh <name> <worktree>. Werkbank (Instrument abab-i543) gegen den save-server
# aus <worktree>, Dorf wie die Messfolge (der Dorf-Zug läuft, der Ort schaltet ihn an), Band mit VRAM je Erzeuger, dann die
# Satz-Bilanz (Inhalt gegen Kapazität je Satz-Art) und der Puffer-Zensus.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/dorf
INS=${INS:-/c/Users/micha/Desktop/AnazhRealm-OMEN/abab-i543}
N=$1; WT=$2; export WERKBANK_PORT=4490
W="node $INS/scripts/werkbank.cjs"
D=$H/daten; mkdir -p $D
say() { echo "$(date +%T) $N $*" | tee -a $H/boot.log; }
stopp() {
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match '[s]ave-server|[w]erkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match '[w]erkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  sleep 2
}
stopp
(cd $WT && PORT=4312 node save-server.js > $D/$N-server.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $D/$N-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $D/$N-werkbank.log 2>/dev/null && break; sleep 5; done
say "bereit $(cd $WT && git log --oneline -1 | cut -c1-8) · anazhRealm.js $(curl -s http://localhost:4312/anazhRealm.js | sha256sum | cut -c1-16)"
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort dorf > $D/$N-umstellen.json
$W eval "return window.__buehne()" > /dev/null
[ -n "$LAUF" ] && $W lauf $LAUF --ein 5 --ruhe 300 --tiere frei --regler voll > $D/$N-lauf.txt 2>&1
$W band --ort dorf --datei $(cd $D && pwd -W)/$N-band.json > $D/$N-band.txt 2>&1
say "$(head -1 $D/$N-band.txt | cut -c1-170)"
$W eval "const out = {}; for (const [art, s] of r.state.chunkSaetze || []) { const m = s.mesh || s.satzMesh; const g = m && m.geometry; const at = g ? Object.fromEntries(Object.entries(g.attributes).map(([k, a]) => [k, [a.itemSize, a.array.constructor.name, a.array.length]])) : null; out[art] = { vInhalt: s.vInhalt, vKap: s.vKap, vEnde: s.vEnde, iKap: s.iKap, iEnde: s.iEnde, attr: at, index: g && g.index ? [g.index.array.constructor.name, g.index.array.length] : null }; } return out;" > $D/$N-saetze.json 2>&1
$W puffer > $D/$N-puffer.txt 2>&1
say "saetze $(head -c 300 $D/$N-saetze.json | tr -d '\n ')"
stopp
say "ENDE"
