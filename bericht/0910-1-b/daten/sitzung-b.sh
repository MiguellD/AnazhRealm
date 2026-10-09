#!/bin/bash
# 0910-1 B, eine Sitzung am Kopf (welle-m-host-vram-2): (1) der Größenwechsel — überlebt das rg11b10-`output` samt Neustart-Zug
# jede Fenstergröße ohne GPU-Fehler (Leben-Schau 2: das Tiefen-Abbild aus host-vram überlebte es nicht)? (2) das Bild-Paar k1 1856²
# (das Raster) gegen 1024² (Kandidat 3 des Auftrags) fern, Mittag und Abend, in EINER Welt mit fester TRAA-Phase.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/hv2
INS=/c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-host-vram-2
WT=${1:-$INS}; N=${2:-sb}
export WERKBANK_PORT=7904
W="node $INS/scripts/werkbank.cjs"
D=$H/daten; mkdir -p $D $H/bilder/$N-k1856 $H/bilder/$N-k1024
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
$W eval "window.__gf = []; r.state.renderer.backend.device.addEventListener('uncapturederror', (e) => window.__gf.push(String((e.error && e.error.message) || e).slice(0, 200))); return 1" > /dev/null
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > /dev/null
$W eval "return window.__buehne()" > /dev/null
# (1) DER GRÖSSENWECHSEL: je Größe 40 echte Frames, dann Format, Größe des GPU-Ziels und die GPU-Fehler seit Beginn
groesse() {
  $W fenster $1 $2 > /dev/null
  $W eval "const st = r.state, rend = st.renderer, be = rend.backend; for (let i = 0; i < 40; i++) { r._gameLoopTick(performance.now()); await new Promise((s) => setTimeout(s, 20)); } rend.setAnimationLoop(null); await be.device.queue.onSubmittedWorkDone(); const t = st.scenePass.renderTarget.texture; const g = be.get(t) && be.get(t).texture; const db = rend.getDrawingBufferSize(new T.Vector2()); const N = r._traaNeustartGpu; return { fenster: [$1, $2], leinwand: [db.x, db.y], output: g && [g.format, g.width, g.height], neustartZiel: N && N.ziel && [N.ziel.width, N.ziel.height], gpuFehler: window.__gf.length, ersterFehler: window.__gf[0] || null };" | tr -d '\n' | sed 's/  */ /g'
  echo
}
{
  groesse 1920 1080
  groesse 1280 720
  groesse 1920 1080
  groesse 1600 900
  groesse 1366 768
  groesse 1920 1080
} > $D/$N-groesse.txt 2>&1
say "groesse: $(grep -o '"gpuFehler": [0-9]*' $D/$N-groesse.txt | tr '\n' ' ')"
# (2) DAS BILD-PAAR k1: Uhren fest (Wind, Knoten, Himmel 1000), TRAA-Phase je Aufnahme 0, Tiere aus
$W eval "r._loopSkyboxZeit = function () { if (this.state.skyboxUniforms && this.state.skyboxUniforms.time) this.state.skyboxUniforms.time.value = 1000; }; r._loopSkyboxZeit(); window.__jitterStart = 0; const A0 = window.__ausgabeAufnahme; window.__ausgabeAufnahme = function (...a) { if (r.state.traaNode) r.state.traaNode._jitterIndex = window.__jitterStart; return A0.apply(this, a); }; for (const c of r.state.creatures || []) c.visible = false; const P = Object.getPrototypeOf(r); r._loopRender = function () { return P._loopRender.call(this, 1000); }; const nf = r.state.renderer._nodes.nodeFrame; nf.update = function () { this.frameId++; this.deltaTime = 0; this.time = 1000; }; return 1" > /dev/null
uhr() {
  $W eval "const st = r.state; window.__buehneTag = window.__buehneTag || window.__buehne; const o = window.__buehneTag; const T = $1; window.__buehne = T == null ? o : function () { const v = o(); st.timeOfDay = T; if (st.world) st.world.timeOfDay = T; st._skyEnvLastRegenMs = -Infinity; r._ensureSkyEnvironment(false); r._applyDayNightToScene(); return v; }; return T;" > /dev/null
}
satz() { # $1 = Ordner
  local O; O=$(cd $H/bilder/$1 && pwd -W)
  b() { $W bild $2 --w 1920 --h 1080 --datei "$O/$1.png" | tr -d '\n' | sed 's/  */ /g' | cut -c1-110; echo; }
  uhr null
  b fern      "-900 +25 -850 -900 +0 -1050"
  b fern-ost  "-900 +25 -850 -700 +0 -850"
  b fern-flach "-900 +1.7 -850 -900 +0 -1050"
  uhr 0.76
  b a-fern    "-900 +25 -850 -900 +0 -1050"
  b a-fern-ost "-900 +25 -850 -700 +0 -850"
  b a-fern-flach "-900 +1.7 -850 -900 +0 -1050"
  uhr null
}
k1() {
  $W eval "const l = r.state.csmNode.lights[1]; l.shadow.mapSize.set($1, $1); r._schattenAlleNeu && r._schattenAlleNeu(); for (let i = 0; i < 10; i++) { r._loopRender(1000); } await r.state.renderer.backend.device.queue.onSubmittedWorkDone(); const sm = l.shadow.map; const dt = sm && sm.depthTexture; const g = dt && r.state.renderer.backend.get(dt) && r.state.renderer.backend.get(dt).texture; return { k1: $1, gpu: g && [g.format, g.width, g.height], gpuFehler: window.__gf.length };" | tr -d '\n' | sed 's/  */ /g'
  echo
  $W ziele --n 4 2>&1 | grep -a "kaskade[01]:tiefe\|ZIEL-ZENSUS" | sed 's/  */ /g' | cut -c1-120
}
{
  k1 1856
  satz $N-k1856
  k1 1024
  satz $N-k1024
  k1 1856
} > $D/$N-k1.txt 2>&1
say "k1: $(grep -o '"gpu": \[[^]]*\]\|"gpuFehler": [0-9]*' $D/$N-k1.txt | tr '\n' ' ' | cut -c1-200)"
$W eval "return { n: window.__gf.length, erste: window.__gf.slice(0, 3) }" > $D/$N-gpufehler.txt
say "gpu-fehler gesamt: $(tr -d '\n ' < $D/$N-gpufehler.txt | cut -c1-200)"
stopp
say "gestoppt"
