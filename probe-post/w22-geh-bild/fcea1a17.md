# GPU-PROBE fcea1a17 — ROT

Zweig `w22-geh-bild` · Kopf fcea1a17b476102c03fb2c8226a3f5ddf4e87bf9 · Läufer omen-gtx1060 · 08.11. 00:26 · Wanduhr ab Push 357 s · Lauf https://github.com/MiguellD/AnazhRealm/actions/runs/42424832527

Ruf: `gate:geh-zerlegung`

GPU NVIDIA GeForce GTX 1060 · node_modules bleiben (package-lock 4c7ceb0e)
Schloss /c/Users/micha/AppData/Local/Temp/claude/gpu-schloss hält „ci-runner 42424832527/1 probe“
- Hook 2026-11-08 00:24:33 start ci-runner 42424832527/1 probe: Schloss genommen (refs/heads/w22-geh-bild fcea1a17b476102c03fb2c8226a3f5ddf4e87bf9 ws=C:\actions-runner\_work\AnazhRealm\AnazhRealm)

### gate:geh-zerlegung — ROT · 114 s

Adapter: [linse-gpu] nvidia/pascal

```text
GEH ROT wiese-ego Bild p50/95/99/max 33.4/83.3/141.6/150 · CPU-Takt 34.3/76.6/137.4/145.8 · 244 Bilder 244 Takte · >33: 173 (TAKT 171 NEBEN 2 GC 0 GPU 0) · Weg 47 m · Pipelines sync 0/async 0/Shader 0 · Knoten-Bau 0 Σ 0 max 0 ms · 
GEH ROT wiese-ego Ursachen >33 [n Σms max]: 100 4699 150 TAKT: renderer._renderScene › _renderScene [three.webgpu.min.js] | 58 2650 142 TAKT: verteilt | 6 442 92 TAKT: _knotenRate › build [three.webgpu.min.js] | 3 275 117 TAKT: renderer.renderObject › renderer._renderObjectDirect | 2 108 58 TAKT: _loopVoxelStreaming › _runFrameScheduler | 2 83 50 NEBEN: _kammKroneBau | 1 67 67 TAKT: renderer._renderObjectDirect › _knotenRate | 1 33 33 TAKT: scene.onBeforeRender › _passSicht · je Hänger [dt Klasse TAKT/NEBEN/GC/GPU]: 141.7 TAKT 140/1/1/0, 91.6 TAKT 95/1/0/0, 116.7 TAKT 117/2/2/0,
GEH ROT wiese-ego Takt-Spitze CPU 34.3/76.6/137.4/145.8 (Spitze·Mitte ms): renderer._renderScene 65.01·18.97 ›_renderScene 64.94·18.95 ››renderer._renderBundles 35.57·1.19 ›››_renderBundles 35.57·1.18 ››scene.onBeforeRender 17.01·12.1 ›››_passSicht 17.01·12.08 ››_renderObjects 10.05·4.03 ›››renderer.renderObject 7.08·2.52 ›››i 2.97·1.48 _loopVoxelStreaming 25.74·9.57 ›_runFrameScheduler 25.74·9.56 ››_dispatchFrameJobs 18.35·6.04 ›››run 12.14·5.85 ›››_tickVoxelChunkStreaming 6.09·0.15 ››_tickArchitectureLOD 3.3·2.35 ›
GEH ROT wiese-ego Lauf 6 s: Bild 25/41.7/41.8/50 · CPU 24.7/38.8/41.9/46.2 · GPU 3/4/4.2/4.2 (n 24, echt) · Durchsatz 25.4/39.8/45.7/121.3 · Leine aus 0 % · Befehle p95 84 · Dreiecke p95 487607 · Belegung 25.3/39.4// · außer Takt 0.5/0.8// · Pflicht 0.3/0.6// · Weg 24 m · Skala 0.75 · Last 1
GEH ROT genesis-third Bild p50/95/99/max 33.3/50.1/66.7/91.6 · CPU-Takt 29.2/50.6/59.2/93.8 · 306 Bilder 306 Takte · >33: 178 (TAKT 177 NEBEN 1 GC 0 GPU 0) · Weg 45 m · Pipelines sync 0/async 1/Shader 0 · Knoten-Bau 0 Σ 0 max 0 ms · 
GEH ROT genesis-third Ursachen >33 [n Σms max]: 114 4326 92 TAKT: renderer._renderScene › _renderScene [three.webgpu.min.js] | 59 2358 67 TAKT: verteilt | 2 100 58 TAKT: _loopVoxelStreaming › _runFrameScheduler | 2 84 50 TAKT: renderer._renderScene | 1 33 33 NEBEN: _kammKroneBau · je Hänger [dt Klasse TAKT/NEBEN/GC/GPU]: 91.6 TAKT 93/1/0/0, 50 TAKT 50/1/1/0, 66.7 TAKT 64/2/0/0, 58.3 TAKT 55/6/0/0, 50 TAKT 43/1/0/0, 41.7 TAKT 41/1/0/0
GEH ROT genesis-third Takt-Spitze CPU 29.2/50.6/59.2/93.8 (Spitze·Mitte ms): renderer._renderScene 28.05·15.61 ›_renderScene 27.99·15.54 ››scene.onBeforeRender 14.07·8.09 ›››_passSicht 14.07·8.07 ››_renderObjects 5.68·3.82 ›››renderer.renderObject 3.27·2.72 ›››i 2.41·1.07 ››renderer._renderBundles 3.39·1.75 ›››_renderBundles 3.32·1.74 ››_renderTransparents 2.15·0.26 ›››_renderObjects 2.15·0.26 ››_projectObject 0.53·0.34 _loopVoxelStreaming 16.57·7.65 ›_runFrameScheduler 16.54·7.63 ››_dispatchFrameJobs 9.5·5.62 ›››r
GEH ROT genesis-third Lauf 6 s: Bild 25/33.4/41.7/50 · CPU 23.7/36.1/40.8/51.2 · GPU 0.5/3.6/3.7/3.7 (n 24, echt) · Durchsatz 24.8/37.4/45.4/111.6 · Leine aus 0 % · Befehle p95 94 · Dreiecke p95 503091 · Belegung 24.8/36.7// · außer Takt 0.5/0.8// · Pflicht 0.3/0.6// · Weg 25 m · Skala 0.75 · Last 1
```
