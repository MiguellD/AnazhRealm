#!/bin/bash
# Karte (2) Tor-Satz: EIN Boot an der Genesis — ./boot.sh <name> <worktree>. Werkbank (Instrument abab-i543) gegen den
# save-server aus <worktree>, Genesis wie die Messfolge, Lauf voll, Band, dann der Bild-Satz der Tore (Tiere aus, Wind-,
# Knoten- und Himmels-Uhr fest 1000, TRAA-Phase je Aufnahme ab __jitterStart 0 — wie p3/hv2/boot.sh), GPU-Fehler gesammelt.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/tor/satz
INS=/c/Users/micha/Desktop/AnazhRealm-OMEN/abab-i543
N=$1; WT=$2; export WERKBANK_PORT=4490
W="node $INS/scripts/werkbank.cjs"
D=$H/daten; mkdir -p $D $H/bilder/$N
O=$(cd $H/bilder/$N && pwd -W)
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
say "bereit $(cd $WT && git log --oneline -1 | cut -c1-8) $(cd $WT && git status --short | grep -c .) geändert · anazhRealm.js $(curl -s http://localhost:4312/anazhRealm.js | sha256sum | cut -c1-16)"
$W eval "window.__gf = []; r.state.renderer.backend.device.addEventListener('uncapturederror', (e) => window.__gf.push(String((e.error && e.error.message) || e).slice(0, 200))); return 1" > /dev/null
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort genesis > $D/$N-umstellen.json
$W eval "return window.__buehne()" > /dev/null
$W lauf 30 --ein 20 --ruhe 300 --tiere frei --regler voll > $D/$N-lauf.txt 2>&1
$W band --ort genesis --datei $(cd $D && pwd -W)/$N-band.json > $D/$N-band.txt 2>&1
say "lauf $(grep -o '"fps": [0-9.]*' $D/$N-lauf.txt | head -1) · $(head -1 $D/$N-band.txt | cut -c1-150)"
say "bau $(grep -m1 '^bau ' $D/$N-band.txt | tr -s ' ' | cut -c1-160)"
$W eval "r._loopSkyboxZeit = function () { if (this.state.skyboxUniforms && this.state.skyboxUniforms.time) this.state.skyboxUniforms.time.value = 1000; }; r._loopSkyboxZeit(); window.__jitterStart = 0; const A0 = window.__ausgabeAufnahme; window.__ausgabeAufnahme = function (...a) { if (r.state.traaNode) r.state.traaNode._jitterIndex = window.__jitterStart; return A0.apply(this, a); }; return 1" > /dev/null
$W eval "for (const c of r.state.creatures || []) c.visible = false; const P = Object.getPrototypeOf(r); r._loopRender = function () { return P._loopRender.call(this, 1000); }; const nf = r.state.renderer._nodes.nodeFrame; nf.update = function () { this.frameId++; this.deltaTime = 0; this.time = 1000; }; return 1" > /dev/null
b() { $W bild $2 --w 1920 --h 1080 --datei "$O/$1.png" | tr -d '\n' | sed 's/  */ /g' | cut -c1-110; echo; }
say "ring    $(b ring  '36 +1.7 0 0 +4 0')"
say "nah     $(b nah   '13 +1.7 2 0 +4 0')"
say "seite   $(b seite '4 +1.7 22 0 +4 0')"
say "hoch    $(b hoch  '40 +18 18 0 +2 0')"
say "fern    $(b fern  '75 +6 30 0 +4 0')"
say "gpu-fehler $($W eval 'return window.__gf.length + " " + JSON.stringify(window.__gf.slice(0, 3))' | tr -d '\n' | cut -c1-200)"
stopp
say "ENDE"
