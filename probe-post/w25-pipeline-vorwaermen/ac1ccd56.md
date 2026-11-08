# GPU-PROBE ac1ccd56 — ROT

Zweig `w25-pipeline-vorwaermen` · Kopf ac1ccd5646301aad7f020dcf857cb4da6667ad23 · Läufer omen-gtx1060 · 08.11. 21:53 · Wanduhr ab Push 282 s · Lauf https://github.com/MiguellD/AnazhRealm/actions/runs/42522015033

Ruf: `gate:geh-zerlegung`

GPU NVIDIA GeForce GTX 1060 · node_modules bleiben (package-lock 14bd2eb7)
Schloss /c/Users/micha/AppData/Local/Temp/claude/gpu-schloss hält „ci-runner 42522015033/1 probe“
- Hook 2026-11-08 21:50:16 start ci-runner 42522015033/1 probe: Schloss genommen (refs/heads/w25-pipeline-vorwaermen ac1ccd5646301aad7f020dcf857cb4da6667ad23 ws=C:\actions-runner\_work\AnazhRealm\AnazhRealm)

### gate:geh-zerlegung — ROT · 97 s

Adapter: [linse-gpu] nvidia/pascal

```text
GEH ROT genesis Fahrt Third Zeichnung ab p95 4/100 Takte: 0 54.5/21.7 · 1scene.onBeforeRender 26.8/12.8 · 2_passSicht 26.8/12.8 · 1renderer._renderObjects 18.3/5.1 · 2_renderObjects 18.3/5.1 · 1renderer._renderBundles 4.5/1.6 · 2_renderBundles 4.5/1.6 · 1updateMatrixWorld 2.2/0.4 · 2updateMatrixWorld 2.1/0.4 ‖ Selbst _passTrifft 199 · _hoehlenSichtLicht 195 · _instanzBehalten 87 · createBuffer 33 · _nahWieseFernTakt 12 · _passTrifftBox 11
GEH GRÜN Ankunft Weltbild 18618 ms (Ferne 17603) · Knoten bis jetzt 57 Σ 6154.2 ms · Pipelines 70 · Vorwärmen (Messung) vor dem Gehen: {"n":27,"rufe":200,"verw":0,"offen":0,"zeit":true,"arten":[],"q":[],"gt":[]}
GEH ROT genesis Gehen: Stand Bild 16.7/50/58.4/58.4 GPU 0.43/2.63/2.63/2.63 · Bild p50/95/99/max 50/91.7/125/125 · 88.6 % > 33 ms · Takt 46.5/93.1/126.1/126.1 · 79 Bilder · Weg 23 m · Tasten {"v":5} · > 33 ms 70 (TAKT 70 NEBEN 0 GC 0 GPU 0) · Bau 439 Σ 285.9 ms [["haupt arena fscatter:blume:L2",243.5],["Point Light Shadow [ licht:wurf ] - Face 1 arena f:sitzbank:L0",18.3],["Point Light Shadow [ licht:wurf ] - Face 1 bauSatz",10.3],["Point Light Shadow [ licht:wurf ] - Face 1 arena leer:f:eiche:L1",6.5]] · Pipe sync 0 · Ursachen 33× 1942/100 TAKT: renderer._renderScene › _renderSc
GEH ROT genesis Gehen Bau im Fenster: Knoten fertig 5 Σ 275.9 ms · vorgewärmt davor 27 offen 0 im Fenster 0 · Pipelines 4 (Gerät async 4 sync 0) [["Point Light Shadow [ licht:wurf ] - Face 1 spieler",1],["haupt arena fscatter:blume:L2",1],["Point Light Shadow [ licht:wurf ] - Face 1 bauSatz",1],["Point Light Shadow [ licht:wurf ] - Face 1 arena f:sitzbank:L0",1]] · max-Schritt 77.5 ms, 6 > 16,7 ms
GEH GRÜN Vorwärmen (Messung) vor der Fahrt Ego: {"n":44,"rufe":225,"verw":0,"offen":0,"zeit":true,"arten":[],"q":[],"gt":[]}
GEH ROT genesis Fahrt Ego: Bild p50/95/99/max 58.4/125/208.3/208.3 · 98.3 % > 33 ms · Takt 58.4/124.8/212.1/212.1 · 59 Bilder · Weg 108 m · Tasten {"wagen":"werkbank-fahrt","aus":null,"ein":"werkbank-fahrt"} · > 33 ms 58 (TAKT 58 NEBEN 0 GC 0 GPU 0) · Bau 1332 Σ 299.9 ms [["haupt arena f:gt:L0",174.3],["k0 arena f:gt:L0",93.2],["k0 arena fscatter:geroell:L0",11.8],["Point Light Shadow [ licht:wurf ] - Face 1 arena f:eiche:L1",7.2]] · Pipe sync 0 · Ursachen 41× 2992/208 TAKT: renderer._renderScene › _renderScene [three.webgpu.min.js] | 14× 708/67 TAKT: verteilt | 3× 317/133 TAKT:
GEH ROT genesis Fahrt Ego Bau im Fenster: Knoten fertig 9 Σ 111.2 ms · vorgewärmt davor 44 offen 0 im Fenster 0 · Pipelines 2 (Gerät async 1 sync 0) [["k1 bau:esse",1]] · max-Schritt 81.8 ms, 3 > 16,7 ms
GEH GRÜN Vorwärmen (Messung) vor der Fahrt Third: {"n":61,"rufe":328,"verw":0,"offen":0,"zeit":true,"arten":[],"q":[],"gt":["gt|6|0:0@zi#1","gt|6|0:1@zi#1","gt|6|0:2@zi#1","gt|6|0:3@zvi#1","gt|6|0:4@zvi#1","gt|6|0:5@zvi#1"]}
GEH ROT genesis Fahrt Third: Bild p50/95/99/max 41.6/66.7/100.1/100.1 · 82.0 % > 33 ms · Takt 36.1/63.6/91.8/91.8 · 100 Bilder · Weg 103 m · Tasten {"wagen":"werkbank-fahrt","aus":null,"ein":"werkbank-fahrt"} · > 33 ms 82 (TAKT 82 NEBEN 0 GC 0 GPU 0) · Bau 62 Σ 13.1 ms [["k0 arena f:eiche:L1",11.4],["Point Light Shadow [ licht:wurf ] - Face 1 bauWurf",0.4],["k0 f:fichte:L1",0.3],["haupt bauSatz",0.2]] · Pipe sync 0 · Ursachen 59× 2675/100 TAKT: renderer._renderScene › _renderScene [three.webgpu.min.js] | 16× 566/50 TAKT: verteilt | 6× 325/58 TAKT: scene.onBeforeRender › _passS
GEH ROT genesis Fahrt Third Bau im Fenster: Knoten fertig 1 Σ 11.4 ms · vorgewärmt davor 61 offen 0 im Fenster 0 · Pipelines 0 (Gerät async 0 sync 0) [] · max-Schritt 5.2 ms, 0 > 16,7 ms
```
