# GPU-PROBE bddc439b — GRÜN

Zweig `w25-ankunft-block` · Kopf bddc439bb279b1def234d13c75b2a73d9c5bf260 · Läufer omen-gtx1060 · 08.11. 20:39 · Wanduhr ab Push 199 s · Lauf https://github.com/MiguellD/AnazhRealm/actions/runs/42515857005

Ruf: `gate:weltbild-frost:echt`

GPU NVIDIA GeForce GTX 1060 · node_modules bleiben (package-lock 14bd2eb7)
Schloss /c/Users/micha/AppData/Local/Temp/claude/gpu-schloss hält „ci-runner 42515857005/1 probe“
- Hook 2026-11-08 20:36:35 start ci-runner 42515857005/1 probe: Schloss genommen (refs/heads/w25-ankunft-block bddc439bb279b1def234d13c75b2a73d9c5bf260 ws=C:\actions-runner\_work\AnazhRealm\AnazhRealm)

### gate:weltbild-frost:echt — GRÜN · 158 s

Adapter: [linse-gpu] nvidia/pascal V18.546.226 · t(Kontrolle) 19.25/20.33/21.68/19.73 Median 20.03 s · Eigenmeldung 18.17/16.58/16.58/16.00 · BELEGT bis Kontrolle 15.43/17.79/18.87/17.30 Median 17.55 s · LongTasks 97/97/104/96 Σ 13.44/15.11/16.14/14.67 s · längste 560/655/634/651 ms

```text
✅ KALT 4× [linse-gpu] nvidia/pascal V18.546.226 · t(Kontrolle) 19.25/20.33/21.68/19.73 Median 20.03 s · Eigenmeldung 18.17/16.58/16.58/16.00 · BELEGT bis Kontrolle 15.43/17.79/18.87/17.30 Median 17.55 s · LongTasks 97/97/104/96 Σ 13.44/15.11/16.14/14.67 s · längste 560/655/634/651 ms
✅ PHASEN (t · belegt, Median): welt 2.30·2.02 | erstes Lade-Bild 4.46·3.62 | Buch da 2.52·2.25 | licht 5.71·4.85 | boden 6.10·5.46 | leib 4.70·4.06 | pflanzung 9.08·8.02 | horizont 14.11·12.90 | karten 15.91·14.67 | streu 15.95·14.74 | bauten 16.50·15.14 | Weltbild 16.58·15.22 | Kontrolle 20.03·17.55 | Ring am Ziel 26.17·17.65
✅ KLASSEN bis Kontrolle (Median s, verschachtelt je): Jobs 6.69 · Bild 4.84 · Knoten-Bau 4.17 · Programm 1.87 · Himmel 0.55 · GC 0.33 · Saat 0.31 · Streu 0.29 · Buch 0.16 · Bauten 0.14 · Gruppen-Bau 0.13 · Boden 0.12 · Wald-Plan 0.07 · Gestalt 0.02
✅ KNOTEN-BAU bis Kontrolle: 40/41/41/40 Bauten fertig · Σ 3766/4398/4456/4126 ms (Median 4262) · je Szene W 3071 · B 0 · K 330 · E 855 · ? 0 · Raten 3407 · am Stück 855 ms · Code Σ 1738k Zeichen
✅ BAU je Stoff (ms/fertig/Code, Szene): MeshStandard@geometrie-arena 1302/5/130kW · MeshStandard@Mesh 837/4/152kKW · MeshStandard@bodenSatz 405/1/140kW · MeshBasic@Mesh 359/3.5/134kWE · spiegel:strahl@spiegel:strahl 222/1/77kE · MeshStandard@formationenSatz 193/1/98kW · MeshStandard@geometrie-arena⟂ 139/4/37kW · horizont-karte@horizont-karte 81/1/40kE · kontakt:verdeckung@kontakt:verdeckung 78/1/34kE · MeshBasic@himmel 75/1/36kW · TRAA.resolve@TRAA 66/1/25kE · RenderPipeline@Render Pipeline 54/1/19kE
✅ INKL 1: takt [dirigent-takt.js:400] 13712 · loop [dirigent-takt.js:6] 13706 · _loopVoxelStreaming [dirigent-takt.js:2077] 6679 · _runFrameScheduler [dirigent-takt.js:2038] 6678 · renderer._renderScene [bild-kosten.js:215] 6606 · renderer.renderObject [bild-kosten.js:392] 6163 · renderer._renderObjectDirect [bild-kosten.js:499] 6149 · zeichne [bild-kosten.js:463] 5611 · _loopRender [dirigent-takt.js:2116] 4827 · updateBefore [bild-kosten.js:1455] 4095 · _dispatchFrameJobs [dirigent-takt.js:1656] 3782 · run [dirigent-takt.js:1850] 3775 · _knotenRate [bild-kosten.js:722] 3323 · _
✅ INKL 2: _nahWieseFernTakt [vegetation-wiese.js:432] 2445 · _buehneRender [werkstatt-vorschau.js:1481] 1842 · _nahWieseFernKachel [vegetation-wiese.js:674] 1805 · _tickImpostorBake [stoff-karte.js:589] 1581 · _tickKarteWelt [stoff-karte.js:602] 1574 · _karteWeltBacken [stoff-karte.js:863] 1552 · _nahWieseKachelBueschel [vegetation-wiese.js:104] 1414 · renderer._renderBundles [bild-kosten.js:257] 989 · renderer._renderBundle [bild-kosten.js:170] 987 · _bodenSichtAt [gelaende-boden.js:19] 962 · o.needsRefresh [stoff-material.js:535] 906 · AnazhRealm._diaetRefresh [bild-diaet.js:594
✅ SYSTEME selbst (Median ms): vendor/three.webgpu.min.js 5701 · (program) 1867 · stamm/vegetation-wiese.js 1475 · stamm/gelaende-boden.js 1377 · gelaende-core.js 617 · vendor/three.core.min.js 572 · koerper-core.js 500 · stamm/vegetation-streu.js 366 · (garbage collector) 333 · stamm/gelaende-fern.js 309 · stamm/studio-bruecke.js 302 · stamm/dirigent-takt.js 251 · stamm/bild-kosten.js 242 · stamm/bild-diaet.js 234 · (nativ) 229 · stamm/siedlung-wege.js 221 · stamm/stoff-instanz.js 210 · phyto-core.js 185
✅ NACH DEM BILD je Boot (ab Eigenmeldung, ms): Taste 358 · Halten 346(vor) · Weg 629 · K 1078 · rAF/s 2/0/19/18 · Lücke 1542 · Bilder 31 aus 7 | Taste 818 · Halten 2359(vor) · Weg 2593 · K 3754 · rAF/s 1/0/3/7 · Lücke 1966 · Bilder 9 aus 1 | Taste 1004 · Halten 2521(vor) · Weg 2655 · K 5104 · rAF/s 1/0/4/7 · Lücke 2108 · Bilder 11 aus 0 | Taste 1007 · Halten 2452(vor) · Weg 2602 · K 3729 · rAF/s 1/0/4/5 · Lücke 2083 · Bilder 8 aus 1
✅ AUFGABEN (Boot 1, längste vor der Kontrolle): 4.53 s 560 ms _runFrameScheduler (verteilt) 114+_buildPbrNodeMaterial 89 | 18.08 s 441 ms folger [koerper-core.js] 130+tuchGitter [koerper-core.js] (verteilt) 77 | 5.10 s 436 ms build [three.webgpu.min.js] 69+build [three.webgpu.min.js] 52 | 15.82 s 294 ms build [three.webgpu.min.js] 74+_runFrameScheduler 51 | 5.56 s 290 ms build [three.webgpu.min.js] 54+_renderScene [three.webgpu.min.js] 52 | 18.53 s 274 ms build [three.webgpu.min.js] 65+build [three.webgpu.min.js] 64
```
