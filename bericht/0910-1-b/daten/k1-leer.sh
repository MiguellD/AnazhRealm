#!/bin/bash
# 0910-1 B Kandidat 3: liegen in den Fern-Blicken überhaupt k1-Schatten? Dieselben Blicke mit k1 an und k1 aus (shadow.intensity 0),
# in EINER Welt, feste Uhren und TRAA-Phase. Ist an == aus, ist das Bild-Paar 2048 ↔ 1024 vakuös.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/hv2
INS=/c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-host-vram-2
WT=${1:-/c/Users/micha/Desktop/AnazhRealm-OMEN/hv2-c}; N=${2:-k1leer}
export WERKBANK_PORT=7904
W="node $INS/scripts/werkbank.cjs"
D=$H/daten; mkdir -p $D $H/bilder/$N-an $H/bilder/$N-aus
say() { echo "$(date +%T) $N $*" | tee -a $H/boot.log; }
stopp() {
  $W stop > /dev/null 2>&1; sleep 3
  powershell -NoProfile -c "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | ? { \$_.LocalPort -ge 7900 -and \$_.LocalPort -le 7909 } | % { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil-790' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  sleep 2
}
stopp
(cd $WT && PORT=7903 node save-server.js > $D/$N-server.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7903/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $INS && node scripts/werkbank.cjs start --echt --port $WERKBANK_PORT --seite http://localhost:7903 > $D/$N-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $D/$N-werkbank.log 2>/dev/null && break; sleep 5; done
say "bereit $(cd $WT && git log --oneline -1 | cut -c1-8)"
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > /dev/null
$W eval "return window.__buehne()" > /dev/null
$W eval "r._loopSkyboxZeit = function () { if (this.state.skyboxUniforms && this.state.skyboxUniforms.time) this.state.skyboxUniforms.time.value = 1000; }; r._loopSkyboxZeit(); window.__jitterStart = 0; const A0 = window.__ausgabeAufnahme; window.__ausgabeAufnahme = function (...a) { if (r.state.traaNode) r.state.traaNode._jitterIndex = window.__jitterStart; return A0.apply(this, a); }; for (const c of r.state.creatures || []) c.visible = false; const P = Object.getPrototypeOf(r); r._loopRender = function () { return P._loopRender.call(this, 1000); }; const nf = r.state.renderer._nodes.nodeFrame; nf.update = function () { this.frameId++; this.deltaTime = 0; this.time = 1000; }; return 1" > /dev/null
uhr() {
  $W eval "const st = r.state; window.__buehneTag = window.__buehneTag || window.__buehne; const o = window.__buehneTag; const T = $1; window.__buehne = T == null ? o : function () { const v = o(); st.timeOfDay = T; if (st.world) st.world.timeOfDay = T; st._skyEnvLastRegenMs = -Infinity; r._ensureSkyEnvironment(false); r._applyDayNightToScene(); return v; }; return T;" > /dev/null
}
satz() {
  local O; O=$(cd $H/bilder/$1 && pwd -W)
  b() { $W bild $2 --w 1920 --h 1080 --datei "$O/$1.png" | tr -d '\n' | sed 's/  */ /g' | cut -c1-110; echo; }
  uhr null
  b fern        "-900 +25 -850 -900 +0 -1050"
  b fern-ost    "-900 +25 -850 -700 +0 -850"
  b fern-flach  "-900 +1.7 -850 -900 +0 -1050"
  b flach-ost   "-900 +1.7 -850 -700 +0 -850"
  b flach-west  "-900 +1.7 -850 -1100 +0 -850"
  uhr 0.76
  b a-fern      "-900 +25 -850 -900 +0 -1050"
  b a-flach-west "-900 +1.7 -850 -1100 +0 -850"
  b a-flach-ost "-900 +1.7 -850 -700 +0 -850"
  uhr null
}
k1() { $W eval "const l = r.state.csmNode.lights[1]; l.shadow.intensity = $1; return { intensity: l.shadow.intensity, castShadow: l.castShadow };" | tr -d '\n ' ; echo; }
{
  k1 1
  satz $N-an
  k1 0
  satz $N-aus
  k1 1
} > $D/$N.txt 2>&1
say "k1 an/aus: $(grep -c datei $D/$N.txt) Aufnahmen"
stopp
say "gestoppt"
