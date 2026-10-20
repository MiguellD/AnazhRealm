# B-Plan 20.10. (Koordinator, Entwurf wf_db9a1976-3cf: drei Architekten-Winkel + pruefende Synthese)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

## Urteil
Nein, auch nicht ehrlich gerechnet. Mit diesen fünf Karten sinkt die GTX kalt von 15,25 s auf etwa 11,5–14,5 s (Mitte ~13 s). Der Haupt-Faden wird um 1,7–2,8 s leichter; heute wird davon höchstens ein Anteil von 0,35 zu früherem Bild (b-blick: 0,8 s → −0,28 s). Erst die Lade-Scheibe (Karte 4) kann diesen Anteil heben, und das ist ungemessen. Bis B ≤ 5 s fehlen auf der GTX ≥ 6–8 s.

Die Untergrenze ohne Strukturwechsel:
- Boot bis Buch 2,58 s.
- Danach der Erst-Bau-Rest 2,4–2,8 s, synchron. Er bleibt auch nach allen Programm-Schnitten, denn es sind die echten Signaturen des ersten Bilds.
- Dazu die Welt-Arbeit im Blick (Boden, Streu, Bauten, Karten) mit ≥ 3 s auf dem i7-8750H.
- Zusammen ≥ ~8 s, auch bei Umsetzungs-Anteil 1.

Der Grund: Knoten-Bau, Zeichnen und Welt-Arbeit teilen EINEN Faden, und die GTX-CPU ist in genau dieser Arbeit ~2,3× langsamer als der Ryzen AI (15,25 gegen 6,3–6,9 s).

Was zusätzlich fehlen würde, stets mit Zahl:
1. Den Erst-Bau in die Boot-Lücke legen. Bei 0–3 s sind ~1,7 s frei (blockiert 586/320/416 ms). Ungemessen ist, welche Stoffe vor dem Buch stehen.
2. Boot bis Buch: Blink-Erstlayout 0,53 · widget Shutdown 0,43 (Verdacht: Messrahmen) · _bootAnazhRealm 0,40 s.
3. Die Posten rundum: Fern-Ring 0,69 · Geomorph 0,86 · Skelett 0,27–0,57 · Wald-Urteil ≥ 0,48 · Render ohne Knoten-Bau 0,70 s.
4. Eine Teilung von Bild und Welt auf zwei Fäden, die in keinem Plan steht.

Radeon: Dieselben Anteile (−20…−30 %) ergeben aus 6,3–6,9 s ruhig etwa 4,6–5,5 s. B ist dort erreichbar-nah, aber ungemessen.

Voraussetzung jeder Karte: b-blick 48e499f8 erst zu Ende bauen und mergen. Offen sind dort die CI voll/10–18 und echt. Alle Karten setzen dessen _rangImBild voraus; sie zweigen danach vom Kopf von integ-probe ab.

## Summe
Haupt-Faden GTX, ohne Doppelzählung (von 13,9 s blockiert bis zum Bild):
- K1 Programme: 0,54–0,71 s (aus Radeon-Anteilen)
- K2 Chunk im Faden: 0,55–0,70 s (G nur 0,14 s)
- K3 Bau am Ereignis: 0,27–0,68 s
- K5 Streu im Blick: 0,3–0,7 s
- K4 Lade-Scheibe: 0 s (sie setzt um, statt zu sparen)
- Zusammen: −1,7…−2,8 s

Weltbild:
- Beim heutigen Umsetzungs-Anteil ≤ 0,35 (b-blick: 0,8 s → 0,28 s): −0,6…−1,0 s.
- Mit der Lade-Scheibe steigt der Anteil (ungemessen) und die Rundreisen fallen von 0,30 auf ≤ 0,02 s je Antwort: bis −2,5…−4 s.
- GTX kalt: 15,25 s → ~11,5–14,5 s (Mitte ~13 s).
- Ziel ≤ 5 s: verfehlt um ≥ 6 s.
- Radeon (heute 6,3–6,9 s): ~4,6–5,5 s, ungemessen.

Reihenfolge:
- K1, K2, K3 und K5 laufen parallel; ihre Dateien überlappen nicht.
- K4 startet nach dem Merge von K3.
- Richter je Karte: GTX-Kalt-ABAB 4+4, die Radeon parallel.

## Offen
Vor dem ersten Schnitt zu klären:
- Die Kette am Kopf von b-blick ist nicht zerlegt (p3/n2010/blick/blick.md ist leer). Ungemessen ist, welcher Term dort jetzt zuletzt fällt und wie viele Faden-Rundreisen auf dem kritischen Pfad liegen. Die Rundreisen sind der Richter der Lade-Scheibe.
- Der Umsetzungs-Anteil von freier Haupt-Faden-Zeit ins Bild beruht auf drei Stichproben: b-blick 0,35 · M −1,4 s Zeichnen → 0 · b-wald −7,8 s Schlange → −0,22 s.
- Die Programm-Anteile (K1) stammen aus Radeon-Läufen unter Fremdlast; ein GTX-Zensus mit dem Bau-Instrument fehlt.
- Die Radeon ist für alle Karten ungemessen.

Benannt, aber nicht in der Reihe:
- Arch2 S3, Schleifen: Licht-Pool 4× und Sonnen-Sicht 45× im Karten-Bake entrollt (stoff-material.js:1412, stoff-instanz.js:560). −0,17…−0,27 s; der Karten-Bake liegt auf dem karten-Term.
- Arch2 S4, Graph je Signatur (_foundryTreeMaterial): −0,08…−0,19 s.
- Arch3 S3, Wald-Urteil im Faden: ≥ 0,48 s; Kern phyto-core, überlappt die Streu.
- Arch3 S5, Skelett im Faden: 0,27–0,57 s; studio-gestalt.js, also erst nach K3.
- Lade-Bild als Bau ohne Zeichnen über DIESELBE Hülle _renderObjectDirect (statt compileAsync): ≤ 0,70 s.
- Dirty-Neubau am Schwanz (13–16 s: 95 / 110 / 35 ms): Chunks im Dorf werden vermutlich doppelt gebaut.
- Fern-Ring 0,69 s: ein Mesh, kein Blick-Hebel.
- Geomorph in _ensureVoxelChunkAt: 0,86 s.
- GC 0,31 s.

Ungeprüft:
- widget_base Shutdown 0,43 s (Verdacht: Messrahmen).
- Welche Stoffe vor dem Buch stehen, also ob der Erst-Bau in die freie Boot-Lücke (~1,7 s bei 0–3 s) passt.

Pflicht-OFFEN B bleibt stehen.

## Reihe

### K1 Programme: der Wurf ohne Farbe und die Diät ohne Schlüssel (Zweig b-programme)
- Sekunden GTX: Haupt-Faden −0,54…−0,71 s. Herleitung: Erst-Bau 3,57 s × Knoten-Bau-Anteil 0,84 = 3,0 s.
- Werfer ohne Ausschnitt (12,0–13,1 %): 0,36–0,39 s.
- Diät-Doppel (5,9–10,7 %): 0,18–0,32 s.

Die Anteile stammen aus 3 Radeon-Läufen unter Fremdlast; an der GTX ist nichts gemessen.

Weltbild: Der Erst-Bau ist KEIN Term von _weltbildLuecken (dirigent-ankunft.js:980–1124). Er wirkt also nur über den Haupt-Faden: bei Anteil ≤ 0,35 sind das ≈ −0,2…−0,25 s. Dazu kommen kürzere LongTasks des Lade-Bilds (Deckel 100 ms je Render-Aufruf). Bauten bis zum Bild: 70 → ~45.
- Wurzel: stamm/stoff-material.js:_materialObserverDiaet:413
- Befund: `mat.setupObserver = function` ist eine aufzählbare eigene Eigenschaft. r184 getMaterialCacheKey liest Object.keys(material) und schreibt String(fn) in den Schlüssel. Das Render-Objekt entsteht aber VOR der Diät (bild-kosten.js:_configureRenderer:480 `_objects.get`, Diät erst :515). Der Bau-Cache schlüsselt nach initialCacheKey (vendor-anker:183).
- Folge: 27 von 70 Schlüsseln sind veraltet, es gibt 3 Doppel-Bauten, und jeder Versions-Sprung baut neu (vendor-anker:68).
- Schnitt A: `Object.defineProperty(mat, 'setupObserver', {value: fn, writable: true, configurable: true, enumerable: false})`.

stamm/bild-kosten.js:_configureRenderer, SCHATTEN-STOFF-Block :366–404
- Schnitt B: renderer._getShadowNodes (r184) EINMAL umhüllen.
- Ein Werfer ohne Ausschnitt (alphaTest 0, nicht transparent, ohne alphaHash/alphaMap/castShadowNode/maskShadowNode/maskNode) bekommt seine Schatten-Knoten ohne colorNode und ohne map, also das Standard-Fragment vec4(0,0,0,1). positionNode und depthNode bleiben.
- Gemerkt wird je (positionNode, depthNode) statt je Material.
- PCF (bild-kosten.js:16) liest keine Farbe; Werfer MIT Ausschnitt bleiben byte-alt.
- :537 (E.deckel) NICHT anfassen.
- Linse: gate:kamera-treue (Diät-Familie, Lehre 23), Teil „ein Stoff, ein Schlüssel“
- Nach der Erst-Zeichnung gilt für jedes Welt-Render-Objekt: ro.initialCacheKey === ro.getCacheKey().
- ROT an 48e499f8 beim Stoff-Namen (bauSatz, Karten-Bühne, geometrie-arena).
- Selbsttest: ein Stoff, der nach Anlage des Render-Objekts diätet wird, ist ROT.

gate:foundry-crossfade (Lehre 26), Teil „Wurf ohne Farbe“
- Ein Hauptpass-Fragment hat discard genau dann, wenn das Schatten-Fragment discard hat.
- Ein Werfer ohne Ausschnitt trägt kein Farb-Graph-Fragment.
- ROT beim Namen: „bau:esse wirft 35 118 Zeichen Farbe ohne Ausschnitt“.
- Selbsttest: ein alphaTest-0,5-Werfer behält sein discard.

Je Linsen-Aufruf höchstens EIN kalter Programm-Schlüssel; Anker für _getShadowNodes in gate:vendor-anker.

Konsum-Leser: r184 Nodes.getForRender / nodeBuilderCache. Richter: GTX-Zensus E.bauMs.
- Besitz: stamm/stoff-material.js (_materialObserverDiaet) · stamm/bild-kosten.js (_configureRenderer: SCHATTEN-STOFF-Block + neue _getShadowNodes-Hülle; nicht :537) · scripts/diag-kamera-treue.cjs · scripts/diag-foundry-crossfade.cjs · scripts/diag-vendor-anker.cjs. Läuft parallel zu den Karten 2, 3 und 5.
- Widerlegt/korrigiert: WIDERLEGT, Arch1 S5 (compileAsync statt Lade-Bild): r184 compileAsync setzt _handleObjectFunction = _createObjectPipeline und umgeht damit die Hülle _renderObjectDirect (bild-kosten.js:478), in der Diät (:515) und Erst-Bau-Deckel (:537) leben. Die Folgen:
- Programme ohne Diät (E: 2,9 ms je Bild Voll-Refresh, 17.10.).
- Unbegrenzter Bau in EINER Aufgabe.
- Ein Zwilling der EINEN Erst-Zeichnung.
Außerdem zeichnet der Lade-Takt ohnehin nur alle LADE_BILD_MS = 500 ms (dirigent-takt.js:440).

KORRIGIERT, Arch2: Die Sekunden sind Radeon-Anteile, kein GTX-Maß. Die Graph-Teilung über Stoffe (S1 ii) trägt nur 2 Doppel; sie läuft mit, ist aber nicht der Hebel.

NICHT in dieser Karte: Arch2 S3 (Schleifen; braucht den Byte-Diff des Bake-Ausgangs) und S4 (Graph je Signatur; Wirt-Memo nach Lehre 11).

### K2 Kein Chunk-Stoff im Haupt-Faden vor dem Faden-Ack (Zweig b-strom-faden)
- Sekunden GTX: Haupt-Faden −0,55…−0,70 s.
- PM1, Sekunde 3–4: Boden 642 ms.
- Die Top-8 dieser Sekunde sind ganz der Sync-Bau: _voxelExtractSurfaceVertices 79 · _voxelHoehlenGraph 58 · _voxelSampleDensityGrid 33 ms usw.
- Boden-Klasse über den ganzen Lauf: M 0,67–0,72 s, PG1 nur 0,14 s. Die Klasse wächst, je früher der Strom vor dem Ack läuft (M zieht den Leib 4,8 s vor). An main gilt also ~0,65 s.

Weltbild: Der Schnitt wirkt früh im Boot; der Umsetzungs-Anteil ist ungemessen. boden ist kein letzter Term (9,4–11,4 s), und die ~9 Chunks rechnet der Voxel-Faden parallel.
- Wurzel: stamm/gelaende-chunks.js:_acquireVoxelChunkBuild:1246
- Befund: Stufe 1 fragt den Faden nur bei voxelWorkerReady. Das setzt erst der init-Ack (_voxelWorkerSyncState:299), dabei sind init und state-set längst gesendet und WorldgenSynced=true (_voxelWorkerSyncWorldgenState:962–963). Bis der Ack am Ende einer LongTask ankommt, baut der Strom (_ensureVoxelChunkAt ~:1927, forceSync:false) jeden Chunk still in Stufe 3 (:1270) synchron. Damit ist Lehre 14 gebrochen.
- Schnitt: Den Faden fragen, sobald init gesendet ist (voxelWorker && voxelWorkerWorldgenSynced).
- Die EINE init-Zusage merken. _voxelWorkerComputeChunkMesh:325 und _voxelWorkerComputeDensity:309 (ebenso :346 und :440) warten auf sie, statt _voxelWorkerSyncState() neu zu rufen. Heute sendet jeder solche Ruf einen zweiten vollen Snapshot-Klon (Lehre 24). Bis zur Zusage gilt 'pending'.
- Stufe 3 bleibt NUR mit forceSync: Fußabdruck siedlung-satz.js:2954, Test-Naht :2881, _drainDirty :2818.
- Ein Strom ohne Faden meldet laut über _bruchMelden.
- Stufe 2 (Faden-Dichte für Mesh-ungeeignete Chunks) bleibt.
- Zweite Zeile (Lehre 24): _buildVoxelChunkDataFromWorkerMesh:746 übernimmt die übertragenen Arrays als BufferAttribute statt sie über Float32BufferAttribute zu kopieren (9 Kopien je Chunk).
- Linse: gate:worker-dichte (scripts/diag-worker-dichte.cjs, Familie Lehre 7/14), neuer Teil „kein Chunk-Stoff im Haupt-Faden“
- Im Kalt-Boot gilt: Rufe von _buildVoxelChunkData ohne forceSync = 0. Sonst ROT mit Aufrufer-Kette.
- ROT an 48e499f8: „_acquireVoxelChunkBuild Stufe 3 vor dem Ack: N Chunks“.
- Selbsttest: Ein Faden mit verzögertem Ack liefert 'pending', nie einen Sync-Bau. Ein zweiter init-Klon vor dem Ack ist ROT.
- Der Null-Renderer genügt (CPU-Pfad), ≤ 3 min.

Konsum-Leser: _finalizeVoxelChunkBuild über den Worker-Mesh-Pfad; _perfMark('workerMesh') entspricht der Chunk-Zahl des Rings. Der boden-Term in gate:ankunft bleibt grün.
- Besitz: stamm/gelaende-chunks.js (_acquireVoxelChunkBuild · _voxelWorkerSyncState · _voxelWorkerCompute* · _voxelWorkerSyncWorldgenState · _buildVoxelChunkDataFromWorkerMesh) · scripts/diag-worker-dichte.cjs. Läuft parallel zu den Karten 1, 3 und 5.
- Widerlegt/korrigiert: KORRIGIERT, Arch3 S2:
- „Stufe 2/3 fällt für den Strom“: Stufe 2 ist Faden-Arbeit und bleibt.
- Der benannte Zweit-Fehler ist der init-Neusand der ensureReady-Stellen (gelaende-chunks.js:309/325).
- „Nachrichten-Ordnung garantiert …“ ist unnötig: die Aufträge hängen an der init-Zusage.
- Die Sekunden sind eine Spanne, kein Punkt: M ~0,65 s, PG1 0,14 s.

BESTÄTIGT: Auch der Spieler-Chunk geht nicht mehr über forceSync (_ensureVoxelChunkAt ruft forceSync:false). Die 642 ms sind also der Rückfall vor dem Ack.

### K3 Der Bau wacht am Ereignis; vor dem Bild nur im Blick (Zweig b-bau-ereignis)
- Sekunden GTX: Haupt-Faden −0,27…−0,68 s.
- Rewarm je Foundry-Antwort plus im Cull-Takt: PM1 336 + 165 ms = 0,50 s (PG1 105 + 38 = 0,14 s).
- Dazu _foundryPlatzBereit 0,25 s und _archZiegelFern 0,05 s, mal den Anteil außer Blick (~0,56, geometrisch, ungemessen): ≈ 0,17 s.

Weltbild: bauten ist ein letzter Term (K2 14,89 s · M 15,28–15,89 s). Bei Anteil 0,35 ≈ −0,1…−0,25 s. Der Hauptwert der Karte: ohne sie vervielfacht die Lade-Scheibe (Karte 4) jeden Scan über den Bestand.
- Wurzel: stamm/studio-gestalt.js:_foundryRewarmColdTrees:492
- Befund: Jeder Ruf fegt state.architectures ganz (Filter, _foundryPresetForEntry, Sortierung; :522–546). Gerufen wird er je Foundry-Antwort: `nach` in studio-gestalt.js:830 (Körper) und studio-bruecke.js:1648 (Karte). Lehre 25 ist gebrochen.
- Schnitt: Wer kalt bleibt, meldet sich in _foundryFlattenFor/_foundryZug unter seinem Körper- oder Karten-Schlüssel an (Map key → Set entry; der Schlüssel aus _foundryKoerperKey trägt die ov).
- `nach` weckt NUR diese Einträge, nah zuerst, durch das placeBudget.
- Der Cull-Takt (vegetation-baum.js:tickArchitectureCulling:2404) bleibt der EINE Feger. Unter dem Ladeschirm läuft er nur auf ein Bau-Ereignis (Stand-Wache).
- Zweite Zeile: Vor _weltbildDa sind Kandidaten von nahOffen (~:2344), ziegelOffen (~:2386) und Rewarm nur Einträge mit _rangImBild(e.position, dingM). Die billigen Filter laufen zuerst: Distanz, dann Blick, erst dann das Preset.
- Zurückgehaltene zählen in der Stand-Wache archCull (:2406) als offen. _weltbildSteht ruft _bauRegt(), und der Nachlauf setzt sie nah zuerst.
- Linse: gate:takt (scripts/diag-takt.cjs, Lehre 25), neuer Teil „der Bau wacht am Ereignis“
- Besuchte Einträge je Foundry-Antwort ≤ Wartende ihres Schlüssels + O(1).
- ROT an 48e499f8 beim Namen: „_foundryRewarmColdTrees besucht je Antwort alle N Einträge“.
- Zweiter Teil: Bauten, die vor _weltbildDa außer Blick gesetzt werden, = 0.
- Selbsttest: Einen nicht angemeldeten kalten Eintrag findet der Feger, sonst ROT „verwaist“. Ein Baum 30 m hinter dem Spieler bleibt bis zum Bild ungesetzt und steht nach dem Nachlauf.
- Null-Renderer plus gestubbte Foundry, ≤ 3 min.

Konsum-Leser: _rebuildArchitectureMesh; der Term bauten und _rundumDa (gate:ankunft bleibt grün, die Menge im Blick am Weltbild ist gleich).
- Besitz: stamm/studio-gestalt.js (_foundryRewarmColdTrees · Anmeldung in _foundryFlattenFor · nach :830) · stamm/studio-bruecke.js (nur `nach` :1648 und die Anmeldung in _foundryZug) · stamm/vegetation-baum.js (tickArchitectureCulling) · scripts/diag-takt.cjs. Läuft parallel zu den Karten 1, 2 und 5; MUSS vor Karte 4 gemergt sein.
- Widerlegt/korrigiert: DOPPELZÄHLUNG: Arch1 S1 (0,83 s) und Arch3 S4 (0,50 s) enthalten beide denselben Rewarm von 0,50 s; hier zählt er EINMAL.

SPANNE: Der Rewarm schwankt zwischen M 0,50 s und G 0,14 s.

NICHT in dieser Karte: Arch1 S1 „Pflanz-Schlange außer Blick“. Ihre Kosten sind das Skelett in _naturSetzen (Arch3 S5, spätere Welle, gleiche Datei studio-gestalt.js).

VERWORFEN für die Reihe: Arch1 S2 (Dorf-Zug im Blick). Allein ≈ 0 s am Weltbild (Rechnung des Architekten selbst); der Hebel wäre die Schale von w0.

### K4 Die Lade-Scheibe: EINE Frist je Aufgabe für jeden Leser, die Fortsetzung hinter den Faden-Antworten (Zweig b-lade-scheibe)
- Sekunden GTX: 0 s am Haupt-Faden: die Karte spart keine Arbeit, sie setzt freie Zeit in ein früheres Bild um.
- Verweildauer je Faden-Antwort heute 0,30 s (Wald K2: 12,57 s / 42; 38 kamen am Ende einer LongTask an). Danach ≤ 1 Scheibe.
- Die Rundreisen auf dem kritischen Pfad sind ungezählt. Bei 5–10 Schritten (Kette K2: Zusage → Abriss → Neubau → Karte → zweiter Abriss) ist 1,4–2,8 s die Obergrenze.
- Sie hebt außerdem den Umsetzungs-Anteil der Karten 1–3 und 5 (heute ≤ 0,35).

Weltbild: ungemessen. Richter ist ein GTX-Kalt-ABAB 4+4.
- Wurzel: stamm/dirigent-takt.js:_kappeOffen:1107
- Befund: Die Bedingung `n < kappe || now < frist` lässt unter dem Ladeschirm jeden Kappe-Leser sein Mindest-Stück auch nach der Frist setzen (4× _naturSetzen, je bis 51 ms Skelett). Die Fix-Takte nach dem Dispatcher (_runFrameScheduler:1274–1288: _tickScatterLod, _tickFernRing, _tickDirtyVoxelChunks, _tickImpostorBake) haben gar keine Frist. So dauern Lade-Aufgaben 0,15–1,0 s (M1 Median 289 ms, p90 839 ms).
- Schnitt: LADE_TAKT_MS (:1589) wird die Scheibe. Start bei 12 ms; der Wert wird an GTX und Radeon gemessen.
- Im Lade-Takt hält JEDER Leser die EINE _ladeFrist (:1092); die Fix-Takte werden Kappe-Leser.
- Das Mindest-Stück gilt EINMAL je rAF-Takt, nie je Scheibe (Lehre 25: nie verhungert).
- Endet eine Scheibe mit offener Arbeit, postet der Planer sich über EINEN MessageChannel-Port. In dieser Aufgabe fährt er NUR _runFrameScheduler mit frischer Frist, nie Sim, Bild, Kamera oder Cull-Scan.
- _weltbildDa beendet die Pumpe; der rAF-Takt bleibt die EINE Uhr.
- Der Erst-Bau-Deckel bild-kosten.js:537 bleibt bei 100 ms.
- Linse: gate:takt T9 (scripts/diag-takt.cjs:20/301/457), neuer Teil T9-Scheibe
- Synthetisches Budget (_makeFrameBudget addSynthetic), nie die Wanduhr.
- Jeder Leser des Lade-Takts hält an der Frist; in einer Pumpen-Scheibe setzt kein Leser nach der Frist ein zweites Stück.
- Ereignis-Zählung: Eine Faden-Antwort, die während einer Scheibe ankommt, verbraucht ihr Leser in der nächsten.
- ROT an 48e499f8 beim Namen: _tickFernRing, _tickDirtyVoxelChunks und _tickScatterLod ohne Frist; _tickPendingVegSpawns setzt 4 Stück nach der Frist.
- Selbsttest: Ein ungegateter Leser ist ROT.
- Null-Renderer plus erzwungener Lade-Takt, ≤ 3 min.

Konsum-Leser: _weltbildLuecken (gate:ankunft) und die Verweildauer je Wald-Antwort im OMEN-Trace (heute 0,30 s). Am Trace wird auch die FIFO-Annahme geprüft (Port-Nachricht hinter den Worker-Antworten).
- Besitz: stamm/dirigent-takt.js (_ladeFrist · _kappeOffen · LADE_TAKT_MS · _runFrameScheduler · die neue Pumpe) · scripts/diag-takt.cjs. Startet ERST nach dem Merge von Karte 3: gleiche Linsen-Datei, und ohne Karte 3 vervielfacht jede Scheibe den Rewarm-Scan.
- Widerlegt/korrigiert: KORRIGIERT, Arch3 S1 „der Erst-Bau-Deckel bild-kosten.js:537 gehört in die Scheibe“: nein. Mit 12 ms je Render-Aufruf und einem Lade-Bild alle 500 ms käme der Erst-Bau (2,4–3,0 s) nicht nach; das Weltbild-Bild zöge alles in einem Frame nach oder zeichnete mit Löchern. Der Deckel bleibt (Arch3 nennt das selbst als Risiko b).

KORRIGIERT, „das Mindest-Stück fällt“: es bleibt einmal je rAF-Takt, sonst verhungern späte Leser.

OFFEN: „MessageChannel reiht hinter die Antworten“ ist ein Chrome-Detail. Es wird am Trace geprüft, nicht vorausgesetzt.

NICHT in dieser Karte: _tickFoundryIngest (studio-bruecke.js). Es bleibt im rAF-Takt; seine Freigaben werden mit Karte 3 billig.

### K5 Die Streu des Bilds: vor dem Bild setzt die Scheibe nur Zellen im Blick, der Rest ist ihre Fortsetzung (Zweig b-streu-blick)
- Sekunden GTX: Haupt-Faden −0,3…−0,7 s.
- Basis: Streu-Klasse 1,22–1,28 s plus _tickScatterLod 0,26 s.
- Davon fällt nur die Zellen-Phase. Die Feld-Bake-Phase _bakeRegionFields läuft je Region rundum und bleibt.
- Anteil außer Blick ~0,6, geometrisch und ungemessen: 4 Regionen zu 256 m um die gemeinsame Ecke des Spielers, Ring 64–384 m.

Weltbild: streu ist in 3 von 4 M-Läufen der letzte Term (15,45 / 16,09 / 16,23 s). Die Wirkung ist direkt; Arch1 schätzt 0,3–0,5 s, ungemessen.
- Wurzel: stamm/vegetation-streu.js:_scatterPass:701–702
- Befund: Eine Zelle fällt nur nach innerM/outerM heraus, also rundum. Alle 4 Ankunfts-Regionen berühren den Blick, weil der Spieler an ihrer gemeinsamen Ecke steht (dirigent-ankunft.js ~:1106: imBlick mit regionM·√½).
- Schnitt: Vor _weltbildDa setzt _scatterPass nur Zellen mit _imErstenBlick(tf.x, tf.z, dingM). Gefragt wird gegen den Blick, der in der Region eingefroren ist (region._blick), damit beide Mengen disjunkt bleiben.
- Die übersprungenen Zellen trägt region._cont als Rest-Phase: Index-Liste in cz/cx-Ordnung.
- _streuRegionWartet zählt die Rest-Phase vor dem Bild als stehend, wie _bildWartet in b-blick.
- Nach dem Bild setzt finish-first die Rest-Zellen an DIESELBE Region: kein Abriss, kein Pop im Blick.
- _tickScatterLod (:1091) geht vor dem Bild nur über Zellen im Blick.
- Die Kappe `emitted < cap` (:684–685) zählt über beide Phasen in der Original-Ordnung. Erreicht eine Ankunfts-Region die Kappe, MUSS die Rest-Phase das Urteil der übersprungenen Zellen in Ordnung nachholen, sonst entsteht ein anderer Satz.
- Linse: gate:ankunft L2a (scripts/diag-ankunft.cjs, l2aFaelle:1688), Fall „Streu außer Blick vor dem Bild“
- Zellen, die vor _weltbildDa außerhalb des ersten Blicks gesetzt wurden, > 0 ist ROT.
- ROT an 48e499f8 beim Namen: „_scatterPass setzte N Zellen außer Blick vor dem Bild“.

gate:scatter-ab
- Nach dem Nachlauf ist der Satz byte-gleich dem One-Shot; die Kappe zählt über beide Phasen.

Selbsttest: eine Region mit je einer Zelle vorn und hinten; eine Region, die die Kappe erreicht.

Konsum-Leser: _streuWartet rundum, der Term streu und _rundumDa.
- Besitz: stamm/vegetation-streu.js (_scatterRegionScheibe · _scatterPass · _tickScatterLod · _streuRegionWartet) · scripts/diag-ankunft.cjs · die Skripte von gate:scatter-ab. Läuft parallel zu den Karten 1, 2 und 3.
- Widerlegt/korrigiert: KORRIGIERT, Arch1 S3: 0,88 s ist eine Obergrenze. Die Bake-Phase je Region (_scatterRegionScheibe:598–607) ist rundum und lässt sich ohne Feld-Umbau nicht teilen.

ÜBERLAPPUNG mit Arch3 S3: Das Wald-Urteil (0,48 s Top-8) wird aus _scatterFoundrySeed in der Zelle gerufen und steckt teils in der Streu-Klasse. Beide Posten nie addieren; diese Karte nimmt den Anteil außer Blick vor dem Bild mit.

VERWORFEN als Karte: Arch1 S4 (Karten im Blick). _tickKarteWelt sortiert schon nach _bedarfD2 (stoff-instanz.js:440), die Karten im Blick backen also zuerst. Der Halt spart nur Haupt-Faden außer Blick (≤ 0,42 s × Anteil); der Term fällt nicht früher.

## Lauf
- K1 b-programme und K2 b-strom-faden laufen auf der Radeon (wf_96f82e17-a9e) ab integ-probe 55da6efb.
- K3 und K5 starten nach dem Merge von b-blick (sie lesen _rangImBild), K4 nach K3.
- Strukturfrage fuer B <= 5 s auf der GTX: Bild und Welt auf zwei Faeden (Untergrenze ohne Wechsel ~8 s) — offen benannt.
