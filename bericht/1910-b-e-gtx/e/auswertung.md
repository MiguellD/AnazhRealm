## E je Boot (lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei; Roh welt/<boot>/lauf.json, profil.json)

| Boot | CPU-Takt p50 | p95 | p99 | max | Frame p50 | p95 | fps | Ruhe | Wetter | Profil Frames | loop je Frame (Profil) ms | Tiere |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| E1 | 4.3 | 5.6 | 6.6 | 29.7 | 8.5 | 16.8 | 80.5 | ruhig 3 s | GRUEN | 1575 | 6.33 | – |
| E2 | 4.5 | 5.9 | 6.9 | 29.4 | 8.6 | 16.8 | 80.1 | ruhig 3 s | GRUEN | 1563 | 6.95 | – |
| E3 | 4.2 | 5.4 | 6.8 | 28.7 | 8.5 | 16.8 | 81.2 | ruhig 3 s | GRUEN | 1582 | 6.10 | – |
| E4 | 4.5 | 5.8 | 6.8 | 33.6 | 8.6 | 16.8 | 80.2 | ruhig 3 s | GRUEN | 1569 | 6.72 | – |

Median: CPU-Takt p50 4.40 · p95 5.70 · p99 6.80 ms; loop je Frame im Profil 6.53 ms

## Selbstzeit je Funktion (Profil 200 µs; ohne (idle)/(program); Anteil = an `loop` gesamt je Frame)

| # | Funktion (Datei) | ms je Frame (Median) | Anteil am Takt | Boots in Top-60 | je Boot ms |
|---|---|---|---|---|---|
| 1 | AnazhRealm._diaetRefresh bild-kosten.js | 0.273 | 4.2 % | 4/4 | 0.260 · 0.356 · 0.250 · 0.286 |
| 2 | update three.webgpu.min.js | 0.226 | 3.5 % | 4/4 | 0.203 · 0.232 · 0.220 · 0.251 |
| 3 | updateMatrixWorld three.core.min.js | 0.163 | 2.5 % | 4/4 | 0.161 · 0.201 · 0.153 · 0.166 |
| 4 | loop dirigent-takt.js | 0.155 | 2.4 % | 4/4 | 0.149 · 0.161 · 0.145 · 0.171 |
| 5 | equals three.webgpu.min.js | 0.153 | 2.5 % | 4/4 | 0.150 · 0.187 · 0.156 · 0.145 |
| 6 | _projectObject three.webgpu.min.js | 0.147 | 2.3 % | 4/4 | 0.143 · 0.155 · 0.142 · 0.151 |
| 7 | get three.webgpu.min.js | 0.146 | 2.2 % | 4/4 | 0.130 · 0.155 · 0.151 · 0.141 |
| 8 | updateByType three.webgpu.min.js | 0.131 | 2.1 % | 4/4 | 0.126 · 0.149 · 0.128 · 0.134 |
| 9 | writeBuffer | 0.126 | 1.9 % | 4/4 | 0.117 · 0.127 · 0.125 · 0.129 |
| 10 | updateCreatures kreatur-verhalten.js | 0.120 | 1.8 % | 4/4 | 0.114 · 0.118 · 0.121 · 0.122 |
| 11 | renderer._renderObjectDirect bild-kosten.js | 0.102 | 1.6 % | 4/4 | 0.104 · 0.098 · 0.104 · 0.101 |
| 12 | _update three.webgpu.min.js | 0.100 | 1.6 % | 4/4 | 0.098 · 0.102 · 0.099 · 0.105 |
| 13 | setVertexBuffer | 0.082 | 1.3 % | 4/4 | 0.083 · 0.092 · 0.080 · 0.082 |
| 14 | _tickScatterStreaming vegetation-streu.js | 0.082 | 1.3 % | 4/4 | 0.081 · 0.063 · 0.084 · 0.087 |
| 15 | writeTexture | 0.082 | 1.2 % | 4/4 | 0.071 · 0.088 · 0.085 · 0.079 |
| 16 | AnazhRealm._diaetGeteiltSchreiben bild-kosten.js | 0.080 | 1.2 % | 4/4 | 0.079 · 0.081 · 0.065 · 0.092 |
| 17 | submit | 0.079 | 1.2 % | 4/4 | 0.081 · 0.077 · 0.073 · 0.083 |
| 18 | _draw three.webgpu.min.js | 0.076 | 1.2 % | 4/4 | 0.079 · 0.072 · 0.066 · 0.090 |
| 19 | zeichne bild-kosten.js | 0.074 | 1.1 % | 4/4 | 0.080 · 0.075 · 0.065 · 0.073 |
| 20 | AnazhRealm._diaetVorTextur bild-kosten.js | 0.070 | 1.1 % | 3/4 | 0.070 · – · 0.059 · 0.072 |
| 21 | flaeche gelaende-core.js | 0.070 | 1.1 % | 4/4 | 0.069 · 0.079 · 0.063 · 0.071 |
| 22 | _terrainColumnContextIn gelaende-boden.js | 0.064 | 1.0 % | 4/4 | 0.051 · 0.068 · 0.064 · 0.064 |
| 23 | _blockerUmPlatz gelaende-kollision.js | 0.063 | 1.0 % | 4/4 | 0.066 · 0.068 · 0.059 · 0.061 |
| 24 | o.needsRefresh stoff-material.js | 0.063 | 0.9 % | 4/4 | 0.060 · 0.067 · 0.052 · 0.069 |
| 25 | AnazhRealm._diaetObjektGang bild-kosten.js | 0.062 | 1.0 % | 4/4 | 0.062 · 0.065 · 0.062 · 0.062 |
| 26 | _pruefen stoff-instanz.js | 0.061 | 1.0 % | 4/4 | 0.063 · 0.071 · 0.058 · 0.060 |
| 27 | beginRenderPass | 0.060 | 0.9 % | 4/4 | 0.055 · 0.066 · 0.059 · 0.061 |
| 28 | _ordnen stoff-instanz.js | 0.047 | 0.7 % | 4/4 | 0.046 · 0.049 · 0.037 · 0.053 |
| 29 | setBindGroup | 0.047 | 0.7 % | 4/4 | 0.050 · 0.056 · 0.042 · 0.045 |
| 30 | getCacheKey three.webgpu.min.js | 0.047 | 0.7 % | 4/4 | 0.050 · 0.049 · 0.040 · 0.046 |

## Gesamtzeit je Funktion (inklusiv; Rahmen der Schleife eingeschlossen)

| # | Funktion (Datei) | ms je Frame (Median) | Anteil am Takt | Boots in Top-60 | je Boot ms |
|---|---|---|---|---|---|
| 1 | loop dirigent-takt.js | 6.526 | 100.0 % | 4/4 | 6.335 · 6.951 · 6.102 · 6.718 |
| 2 | _loopRender dirigent-takt.js | 4.232 | 65.0 % | 4/4 | 4.103 · 4.576 · 3.971 · 4.361 |
| 3 | renderer._renderScene bild-kosten.js | 4.116 | 63.3 % | 4/4 | 3.980 · 4.445 · 3.865 · 4.252 |
| 4 | render three.webgpu.min.js | 4.111 | 63.2 % | 4/4 | 3.980 · 4.436 · 3.858 · 4.241 |
| 5 | _renderScene three.webgpu.min.js | 4.108 | 63.2 % | 4/4 | 3.972 · 4.437 · 3.860 · 4.243 |
| 6 | _renderObjects three.webgpu.min.js | 3.970 | 61.0 % | 4/4 | 3.832 · 4.286 · 3.718 · 4.108 |
| 7 | renderer.renderObject bild-kosten.js | 3.969 | 61.0 % | 4/4 | 3.831 · 4.285 · 3.717 · 4.107 |
| 8 | renderObject three.webgpu.min.js | 3.968 | 61.0 % | 4/4 | 3.830 · 4.284 · 3.717 · 4.106 |
| 9 | renderer._renderObjectDirect bild-kosten.js | 3.966 | 61.0 % | 4/4 | 3.829 · 4.283 · 3.714 · 4.104 |
| 10 | zeichne bild-kosten.js | 3.927 | 60.4 % | 4/4 | 3.789 · 4.242 · 3.681 · 4.065 |
| 11 | updateBefore three.webgpu.min.js | 3.855 | 59.3 % | 4/4 | 3.712 · 4.174 · 3.609 · 3.998 |
| 12 | updateBeforeNode three.webgpu.min.js | 3.854 | 59.3 % | 4/4 | 3.711 · 4.173 · 3.607 · 3.997 |
| 13 | updateBefore bild-kosten.js | 3.853 | 59.3 % | 4/4 | 3.710 · 4.172 · 3.606 · 3.996 |
| 14 | o.needsRefresh stoff-material.js | 2.037 | 31.6 % | 4/4 | 1.950 · 2.222 · 1.925 · 2.124 |
| 15 | AnazhRealm._diaetRefresh bild-kosten.js | 1.970 | 30.6 % | 4/4 | 1.888 · 2.152 · 1.871 · 2.052 |
| 16 | renderer._renderBundles bild-kosten.js | 1.358 | 20.9 % | 4/4 | 1.294 · 1.480 · 1.260 · 1.421 |
| 17 | _renderBundles three.webgpu.min.js | 1.342 | 20.7 % | 4/4 | 1.278 · 1.462 · 1.249 · 1.407 |
| 18 | renderer._renderBundle bild-kosten.js | 1.341 | 20.7 % | 4/4 | 1.277 · 1.457 · 1.248 · 1.405 |
| 19 | _renderBundle three.webgpu.min.js | 1.317 | 20.3 % | 4/4 | 1.255 · 1.422 · 1.228 · 1.378 |
| 20 | AnazhRealm._diaetGeteiltSchreiben bild-kosten.js | 1.087 | 16.8 % | 4/4 | 1.038 · 1.173 · 1.025 · 1.136 |
| 21 | _update three.webgpu.min.js | 0.664 | 10.1 % | 4/4 | 0.610 · 0.697 · 0.650 · 0.679 |
| 22 | updateShadow three.webgpu.min.js | 0.615 | 9.4 % | 4/4 | 0.594 · 0.666 · 0.568 · 0.637 |
| 23 | renderShadow three.webgpu.min.js | 0.610 | 9.3 % | 4/4 | 0.588 · 0.661 · 0.564 · 0.632 |
| 24 | _passSicht bild-kosten.js | 0.537 | 8.2 % | 4/4 | 0.528 · 0.576 · 0.491 · 0.546 |
| 25 | scene.onBeforeRender dirigent-ankunft.js | 0.501 | 7.6 % | 4/4 | 0.493 · 0.527 · 0.453 · 0.509 |
| 26 | i three.webgpu.min.js | 0.449 | 6.8 % | 4/4 | 0.431 · 0.475 · 0.415 · 0.467 |
| 27 | _loopWeatherAndGrowth dirigent-takt.js | 0.437 | 6.7 % | 4/4 | 0.434 · 0.444 · 0.417 · 0.440 |
| 28 | update three.webgpu.min.js | 0.431 | 6.6 % | 4/4 | 0.392 · 0.447 · 0.415 · 0.457 |
| 29 | AnazhRealm._diaetObjektGang bild-kosten.js | 0.402 | 6.2 % | 4/4 | 0.363 · 0.420 · 0.385 · 0.424 |
| 30 | updateCreatures kreatur-verhalten.js | 0.382 | 5.9 % | 4/4 | 0.380 · 0.388 · 0.371 · 0.385 |
