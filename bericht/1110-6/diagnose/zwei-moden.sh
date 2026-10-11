#!/bin/bash
# 1110-6 Diagnose: warum kippt die Bühne je Sitzung zwischen „leicht" (s0 7,1 ms) und „schwer" (13,0 ms)? Vier frische
# Sitzungen an s0-hang (V18.540 wie es ist): je Bank 120×6 ×2, zaehlen, ein Zustands-Abzug und ein Bild aus dem Ausgabe-Pfad.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-messort-buehne
OUT=$BASE/mb/moden; mkdir -p $OUT; LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
ZUSTAND='const s = r.state, R = s.renderer; const sicht = {}; s.scene.traverse((o) => { if (!(o.isMesh || o.isPoints || o.isSprite)) return; let v = true; for (let p = o; p; p = p.parent) if (!p.visible) v = false; if (!v) return; let k; try { k = r._taeterKlasse(o); } catch (_e) { k = "?"; } sicht[k] = (sicht[k] || 0) + 1; }); return { pixelRatio: R.getPixelRatio(), canvas: [R.domElement.width, R.domElement.height], traa: !!s.traaNode, kaskaden: s.csmNode && s.csmNode.lights ? s.csmNode.lights.length : 0, wetter: s.weather, uhr: s.timeOfDay, saison: s.seasonPhase, wasser: s.waterLevel, chunks: s.voxelChunks.size, fern: !!(s.fernRing && s.fernRing.meshes && s.fernRing.meshes[0].visible), feldPass: !!(s.feldPass && s.feldPass.mesh && s.feldPass.mesh.visible), stell: [s.foliageRadius, s.architectureCullingRadius, s._foliageDensityScale, s.perfTargetMs], lodPerf: r._lodPerfMul ? r._lodPerfMul() : null, belichtung: R.toneMappingExposure, sichtbar: sicht };'
BL='r.state.pitch = 0; for (let i = 0; i < 20; i++) { window.__wetterHalten(); window.__ortSchritt(); r._gameLoopTick(performance.now()); await new Promise((s) => setTimeout(s, 16)); } r.state.renderer.setAnimationLoop(null); return 1;'
PIN='r._loopSkyboxZeit = function () { if (this.state.skyboxUniforms && this.state.skyboxUniforms.time) this.state.skyboxUniforms.time.value = 1000; }; if (!window.__roh) window.__roh = window.__ausgabeAufnahme; window.__ausgabeAufnahme = function (...a) { if (r.state.traaNode) r.state.traaNode._jitterIndex = 0; return window.__roh.apply(this, a); }; return 1;'
say "MODEN START"
for k in 1 2 3 4; do
  stopp
  (cd $INSTR && PORT=4312 node save-server.js > $OUT/m$k-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  (cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/m$k-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/m$k-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort buehne --pose s0-hang > $OUT/m$k-umstellen.txt 2>&1
  $W eval "return window.__buehne()" > /dev/null
  $W eval "$BL" > /dev/null; $W gpu-bank 60 --runden 1 > /dev/null
  B=$(for i in 1 2; do $W gpu-bank 120 --runden 6 2>&1 | grep -o '"gpuJeFrameMs": [0-9.]*' | cut -d' ' -f2; done | tr '\n' ' ')
  $W eval "$ZUSTAND" > $OUT/m$k-zustand.json 2>&1
  $W zaehlen > $OUT/m$k-zaehlen.txt 2>&1
  $W eval "$PIN" > /dev/null
  mkdir -p $OUT/bild/m$k
  $W bild 0 "+1.7" 0 0 "+1.5" 20 --datei "C:/Users/micha/Desktop/AnazhRealm-OMEN/mb/moden/bild/m$k/s0.png" --w 960 --h 540 > /dev/null 2>&1
  say "m$k bank $B"
done
stopp
say "MODEN ENDE"
