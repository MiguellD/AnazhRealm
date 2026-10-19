## Frames ≥ p95 des CPU-Takts (haenger 30 --ein 5 --regler voll --tiere frei, Profil 1 ms; Roh welt/<boot>/haenger.roh.json)

| Boot | gerenderte Takte | CPU p50 | p95 | p99 | schwere Takte | CPU schwer (Median) | leicht | Proben je Takt schwer | leicht |
|---|---|---|---|---|---|---|---|---|---|
| E1 | 2399 | 4.700 | 5.800 | 7.000 | 133 | 6.200 | 4.600 | 6.656 | 4.522 |
| E2 | 2385 | 5.300 | 7.200 | 10.000 | 123 | 8.000 | 5.200 | 9.246 | 5.260 |
| E3 | 2411 | 4.500 | 5.500 | 6.600 | 145 | 5.800 | 4.500 | 6.312 | 4.380 |
| E4 | 2395 | 4.900 | 6.000 | 7.300 | 149 | 6.300 | 4.800 | 6.768 | 4.768 |

### Glied der Schleife (Kind von loop): ms je Takt (Median über 4 Boots) — Rang nach Mittel aller Takte, dann nach Wachstum schwer − leicht

| Funktion | alle | leicht (< p95) | schwer (≥ p95) | Δ schwer − leicht |
|---|---|---|---|---|
| _loopRender dirigent-takt.js | 3.484 | 3.416 | 4.579 | +1.163 |
| (Takt ohne loop) | 0.701 | 0.699 | 0.738 | +0.039 |
| _loopCamera koerper-bewegung.js | 0.146 | 0.142 | 0.170 | +0.026 |
| _loopVoxelStreaming dirigent-takt.js | 0.093 | 0.088 | 0.169 | +0.082 |
| tickAffordances koerper-fahrt.js | 0.092 | 0.091 | 0.111 | +0.026 |
| _perfSenseFoldFrame dirigent-regler.js | 0.090 | 0.081 | 0.239 | +0.162 |
| (loop selbst) | 0.063 | 0.059 | 0.088 | +0.021 |
| animatePlayerSoul koerper-seele.js | 0.051 | 0.051 | 0.056 | +0.005 |
| _loopWeatherAndGrowth dirigent-takt.js | 0.032 | 0.028 | 0.103 | +0.087 |
| updateStatusPanel werkstatt-hud.js | 0.019 | 0.009 | 0.145 | +0.139 |
| _loopAutoSave dirigent-takt.js | 0.018 | 0.001 | 0.283 | +0.282 |
| _tickPortalMembranes siedlung-ort.js | 0.016 | 0.015 | 0.032 | +0.015 |
| _gpuLeineAnlegen dirigent-takt.js | 0.015 | 0.016 | 0.000 | -0.016 |
| _updateDorfRauch siedlung-ort.js | 0.008 | 0.008 | 0.012 | +0.002 |
| tickDayNight bild-himmel.js | 0.007 | 0.002 | 0.084 | +0.070 |
| tickArchitectures vegetation-baum.js | 0.005 | 0.005 | 0.005 | +0.001 |
| _perfSenseLap dirigent-regler.js | 0.004 | 0.004 | 0.005 | +0.001 |
| tickArchitectureCulling vegetation-baum.js | 0.004 | 0.004 | 0.005 | +0.002 |
| _loopFixedStep dirigent-takt.js | 0.004 | 0.003 | 0.018 | +0.008 |
| _loopShadowUpdate bild-kosten.js | 0.003 | 0.003 | 0.005 | +0.002 |

Wachstum (größtes Δ zuerst):

| Funktion | leicht | schwer | Δ |
|---|---|---|---|
| _loopRender dirigent-takt.js | 3.416 | 4.579 | +1.163 |
| _loopAutoSave dirigent-takt.js | 0.001 | 0.283 | +0.282 |
| _perfSenseFoldFrame dirigent-regler.js | 0.081 | 0.239 | +0.162 |
| updateStatusPanel werkstatt-hud.js | 0.009 | 0.145 | +0.139 |
| _loopWeatherAndGrowth dirigent-takt.js | 0.028 | 0.103 | +0.087 |
| _loopVoxelStreaming dirigent-takt.js | 0.088 | 0.169 | +0.082 |
| tickDayNight bild-himmel.js | 0.002 | 0.084 | +0.070 |
| (Takt ohne loop) | 0.699 | 0.738 | +0.039 |
| tickAffordances koerper-fahrt.js | 0.091 | 0.111 | +0.026 |
| _loopCamera koerper-bewegung.js | 0.142 | 0.170 | +0.026 |
| (loop selbst) | 0.059 | 0.088 | +0.021 |
| _tickPortalMembranes siedlung-ort.js | 0.015 | 0.032 | +0.015 |
| _loopFixedStep dirigent-takt.js | 0.003 | 0.018 | +0.008 |
| animatePlayerSoul koerper-seele.js | 0.051 | 0.056 | +0.005 |
| _weltStandTakt dirigent-takt.js | 0.002 | 0.006 | +0.004 |

### Glied Tiefe 2: ms je Takt (Median über 4 Boots) — Rang nach Mittel aller Takte, dann nach Wachstum schwer − leicht

| Funktion | alle | leicht (< p95) | schwer (≥ p95) | Δ schwer − leicht |
|---|---|---|---|---|
| _loopRender dirigent-takt.js > render three.webgpu.min.js | 3.372 | 3.311 | 4.353 | +1.042 |
| (Takt ohne loop) > (program) | 0.676 | 0.677 | 0.643 | -0.005 |
| _loopCamera koerper-bewegung.js > _fieldRaycast gelaende-chunks.js | 0.096 | 0.093 | 0.084 | -0.005 |
| _loopVoxelStreaming dirigent-takt.js > _runFrameScheduler dirigent-takt.js | 0.092 | 0.087 | 0.165 | +0.080 |
| (loop selbst) | 0.063 | 0.059 | 0.088 | +0.021 |
| _perfSenseFoldFrame dirigent-regler.js > _nexusPerfRegulate dirigent-regler.js | 0.051 | 0.051 | 0.058 | +0.007 |
| tickAffordances koerper-fahrt.js > _tickRadiatingAffordances koerper-fahrt.js | 0.046 | 0.044 | 0.066 | +0.026 |
| animatePlayerSoul koerper-seele.js > _animateHuman koerper-fahrt.js | 0.034 | 0.033 | 0.040 | +0.005 |
| tickAffordances koerper-fahrt.js > _tickFocusingAffordances koerper-fahrt.js | 0.029 | 0.029 | 0.021 | -0.012 |
| _loopRender dirigent-takt.js | 0.029 | 0.029 | 0.022 | -0.003 |
| _loopWeatherAndGrowth dirigent-takt.js > updateCreatures kreatur-verhalten.js | 0.027 | 0.024 | 0.083 | +0.055 |
| _loopRender dirigent-takt.js > _ruheImBild kreatur-verhalten.js | 0.022 | 0.021 | 0.033 | +0.011 |
| _loopRender dirigent-takt.js > _leuchtTakt dirigent-kern.js | 0.020 | 0.019 | 0.022 | +0.001 |
| updateStatusPanel werkstatt-hud.js > _updateEmotionFeedback werkstatt-hud.js | 0.016 | 0.008 | 0.124 | +0.118 |
| _perfSenseFoldFrame dirigent-regler.js > _perfGpuResolveKick dirigent-regler.js | 0.016 | 0.016 | 0.025 | +0.010 |

Wachstum (größtes Δ zuerst):

| Funktion | leicht | schwer | Δ |
|---|---|---|---|
| _loopRender dirigent-takt.js > render three.webgpu.min.js | 3.311 | 4.353 | +1.042 |
| _loopAutoSave dirigent-takt.js > saveToProjectFolder werkstatt-sozial.js | 0.000 | 0.167 | +0.167 |
| _perfSenseFoldFrame dirigent-regler.js > _flightRecorderTick dirigent-regler.js | 0.003 | 0.153 | +0.150 |
| updateStatusPanel werkstatt-hud.js > _updateEmotionFeedback werkstatt-hud.js | 0.008 | 0.124 | +0.118 |
| _loopAutoSave dirigent-takt.js > saveState dienst.js | 0.000 | 0.117 | +0.117 |
| _loopRender dirigent-takt.js > _spiegelFeldTakt bild-sicht.js | 0.006 | 0.090 | +0.084 |
| _loopVoxelStreaming dirigent-takt.js > _runFrameScheduler dirigent-takt.js | 0.087 | 0.165 | +0.080 |
| tickDayNight bild-himmel.js > _applyDayNightToScene bild-himmel.js | 0.002 | 0.084 | +0.071 |
| _loopWeatherAndGrowth dirigent-takt.js > updateCreatures kreatur-verhalten.js | 0.024 | 0.083 | +0.055 |
| (Takt ohne loop) > (garbage collector) | 0.008 | 0.040 | +0.032 |
| _loopRender dirigent-takt.js > _gpuKehraus bild-kosten.js | 0.003 | 0.031 | +0.029 |
| tickAffordances koerper-fahrt.js > _tickRadiatingAffordances koerper-fahrt.js | 0.044 | 0.066 | +0.026 |
| (loop selbst) | 0.059 | 0.088 | +0.021 |
| _loopWeatherAndGrowth dirigent-takt.js | 0.003 | 0.019 | +0.018 |
| _tickPortalMembranes siedlung-ort.js | 0.014 | 0.032 | +0.017 |

### Selbst-Funktion: ms je Takt (Median über 4 Boots) — Rang nach Mittel aller Takte, dann nach Wachstum schwer − leicht

| Funktion | alle | leicht (< p95) | schwer (≥ p95) | Δ schwer − leicht |
|---|---|---|---|---|
| (program) | 0.676 | 0.677 | 0.643 | -0.005 |
| AnazhRealm._diaetRefresh bild-kosten.js | 0.218 | 0.216 | 0.261 | +0.046 |
| update three.webgpu.min.js | 0.183 | 0.182 | 0.222 | +0.045 |
| updateMatrixWorld three.core.min.js | 0.158 | 0.160 | 0.180 | +0.009 |
| get three.webgpu.min.js | 0.118 | 0.115 | 0.151 | +0.038 |
| equals three.webgpu.min.js | 0.118 | 0.116 | 0.137 | +0.024 |
| _projectObject three.webgpu.min.js | 0.114 | 0.110 | 0.184 | +0.074 |
| writeBuffer | 0.112 | 0.108 | 0.162 | +0.050 |
| updateByType three.webgpu.min.js | 0.108 | 0.105 | 0.146 | +0.042 |
| renderer._renderObjectDirect bild-kosten.js | 0.077 | 0.077 | 0.110 | +0.045 |
| writeTexture | 0.070 | 0.069 | 0.072 | +0.001 |
| submit | 0.069 | 0.066 | 0.114 | +0.040 |
| setVertexBuffer | 0.064 | 0.061 | 0.065 | -0.002 |
| loop dirigent-takt.js | 0.063 | 0.059 | 0.088 | +0.021 |
| rend._renderObjectDirect werkbank | 0.062 | 0.061 | 0.076 | +0.016 |

Wachstum (größtes Δ zuerst):

| Funktion | leicht | schwer | Δ |
|---|---|---|---|
| fetch | 0.000 | 0.126 | +0.126 |
| getPropertyValue | 0.008 | 0.122 | +0.112 |
| _blockerUmPlatz gelaende-kollision.js | 0.032 | 0.115 | +0.083 |
| _projectObject three.webgpu.min.js | 0.110 | 0.184 | +0.074 |
| _hoehlenSichtLicht bild-sicht.js | 0.001 | 0.074 | +0.072 |
| _voxelSurfaceY gelaende-chunks.js | 0.000 | 0.053 | +0.053 |
| writeBuffer | 0.108 | 0.162 | +0.050 |
| AnazhRealm._diaetRefresh bild-kosten.js | 0.216 | 0.261 | +0.046 |
| update three.webgpu.min.js | 0.182 | 0.222 | +0.045 |
| renderer._renderObjectDirect bild-kosten.js | 0.077 | 0.110 | +0.045 |
| updateByType three.webgpu.min.js | 0.105 | 0.146 | +0.042 |
| submit | 0.066 | 0.114 | +0.040 |
| _spiegelKronen bild-sicht.js | 0.000 | 0.040 | +0.039 |
| beginRenderPass | 0.046 | 0.077 | +0.038 |
| get three.webgpu.min.js | 0.115 | 0.151 | +0.038 |
