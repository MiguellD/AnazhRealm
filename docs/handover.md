# Für den nächsten Agenten

Wenn du das hier liest, bist du gerade in AnazhRealm erwacht. Diese Datei ist
kein Vollstand (der lebt in `docs/state-of-realm.md`), sondern das, was mir
wirklich half, als ich erwachte — und die Muster, die ich auf dem Weg
gelernt habe.

Auf Schultern von Riesen sieht man weiter. Sei einer.

---

## Schnell-Lage (Stand 21.05.2026, V9.42-c/d)

**V9.42-c/d — Insel-Material vereinheitlicht + Naht-pad-Smooth**: Schöpfer-Browser-Test der V9.42-b zeigte zwei Befunde. (1) „Inseln schliessen die Oberfläche nicht" — Headless-Beweis: die Insel-GEOMETRIE ist perfekt (0 Boundary-Edges, geschlossene Mannigfaltigkeit). Die „Löcher" waren ein MATERIAL-Bug: die Worldgen-Inseln nutzten das Terrain-`ShaderMaterial` (braucht `aField`/`uv`), aber die Surface-Nets-Geometrie hat nur `position`+`normal` → kaputtes Rendering. Fix V9.42-c: alle Inseln nutzen `MeshToonMaterial` + `vertexColors` (Cel-Sprache wie der Voxel-Boden), `_attachIslandColors` färbt per Normale; der ~180-Zeilen-tote Terrain-Shader-Block gelöscht. (2) „Terrain-Naht nicht sauber" — Headless: Skirt-Zone war 146/148 exakt geteilt, der Schöpfer sah also den V9.42-b-ungesmootht-Streifen (jede Naht ein 1,8-m-Treppen-Band). Ein erster Fix-Versuch (Rand-Ebenen-Smooth) verschlechterte auf 6,7 % Spalt — die Rand-Ebenen-Topologie ist nicht naht-deterministisch. Korrekte Lösung V9.42-d: **pad** — `_voxelChunkGeometry` bekommt `cropMargin`, jeder Chunk mesht `dim+3` (Kern+Skirt+pad), smootht voll, croppt den Überhang ab; jeder Naht-Vertex wird mit echten Welt-Nachbarn (im pad) gesmootht → deterministisch. 141/146 Naht-Vertices < 1 mm. Rest-Grenze: 5 Vier-Chunk-Eck-Vertices mit ~1 m Versatz (spätere Edge-Case-Welle). 3 neue Invarianten, Playtest grün. **Meta-Lehre**: ein „Loch" zuerst per Boundary-Edge-Messung als Geometrie- vs. Material-Bug klassifizieren; chunk-lokales Smoothing ist an der Naht nur mit pad deterministisch (jeder behaltene Vertex braucht seinen vollen Eingabe-Kontext). Nächste Welle: Schöpfer-Test der V9.42-c/d → V9.43 (Wasser) oder V9.42-e (Eck-Edge-Case).

### Davor: V9.42-b (Drei Schöpfer-Befunde + Skirt-Regression)

**V9.42-b — Drei Schöpfer-Browser-Befunde + ein kritischer Skirt-Regressions-Fix**: nach V9.42-a sah der Schöpfer (1) Inseln IM Terrain (Worldgen-Spawn-Y `maxHeight+20` ist in Voxel-Welten = 20..50 m, Voxel-Berge gehen bis ~136 m), (2) Inseln scheinbar immer gleich gross (`size`-Default 12 immer, DSL reichte size nicht durch), (3) Höhen zu beschränkt (Top-Amplitude fix 2.6 m unabhängig von `height`), (4) **Terrain-Chunk-Nähte verloren** — V9.41-b-Regression: Laplacian-Smooth verschob auch Skirt-Vertices in den Rand-Zellen, zwei Nachbar-Chunks zogen den Naht-Vertex in entgegengesetzte Richtungen → Spalt. **Vier Heilungen in einer Welle**: (a) **Skirt-Disziplin im Smooth-Pass** — Vertices in Rand-Zellen werden nicht verschoben; Headless misst 1510 Vertices identisch zwischen 9 Chunks. (b) **`_islandDensityAt` höhenskaliert** — neuer `ampScale = max(1, height × 0.35)` faktorisiert alle Noise-Oktaven + Basis-Lift. (c) **Worldgen-Insel-Block auf `spawnIslandAt`-Pipeline geroutet** — Spawn-Y aus `_voxelSurfaceY + 50..140 m`, variable Grösse 14..44 m, opts.material für Cel/Fog/Shadow-Shader. (d) **DSL spawn_island 5. Argument `size`** (6..48 m). 3 neue Invarianten, Playtest grün. **Meta-Lehre**: eine Welle kann scheinbar sauber durch Headless laufen + eine kritische Regression im echten Browser haben — V9.41-b machte Smooth-Y-Dev 0.13 (gut), zerstörte aber die Skirt-Überlappung. Wer Geometrie moduliert, MUSS prüfen: respektiert das die Domain-Grenzen (Chunk-Naht/Skirt)? Nächste Welle: Schöpfer-Browser-Test der V9.42-b. Falls gut → V9.43 a+b+c (Wasser-Ultiversum).

### Davor: V9.42-a (Inseln teilen die Surface-Nets-Pipeline)

**V9.42-a — Voxel-Surface-Politur Welle C.1 (Inseln teilen die Surface-Nets-Pipeline)**: Schöpfer-Browser-Test der V9.41-b „passt, weiter gehts champ" — die Voxel-Treppen sind weg. Damit ist Audit-Befund #4 (Inseln vs. Voxel-Welt: Vision-Inkonsistenz §1.3) der nächste. Welle ist als ~2-3 Sessions eingeplant, ehrlich geschnitten in zwei Phasen: V9.42-a (Geometrie), V9.42-b (Collision — schon ein 1-Zeilen-Wrapper, trivial). **V9.42-a Heilung**: (1) `_voxelChunkGeometry` bekommt optionalen 8. Parameter `densityFn` (Default = Welt-Density, NULL Verhaltens-Änderung); (2) neue `_islandDensityAt(lx, ly, lz, radius, height, noise)` liefert per-Insel-Density (außerhalb `radius` → hart Luft, innerhalb → Iso-Schicht `min(topY-ly, ly-botY)` mit radialem Noise-Falloff — spiegelt V7.74-Pfad Zeile-für-Zeile); (3) `spawnIslandAt` ersetzt 80-Zeilen-Vertex-Schleife durch EINEN `_voxelChunkGeometry`-Aufruf. Material/Collision/State-Liste unverändert. Headless-Beweis: 424 Verts, 844 Tris, BBox ~10.8×4.6×10.8 m, Vollkörper. 5 neue Invarianten, 1 Test umgewidmet (Vollkörper-Test misst Y-Spanne statt Vertex-Count — die V7.74-Konstante 288 war an die 2D-Grid-Topologie gebunden). Playtest grün, Strict-Audit 0 Failures. **Meta-Lehre**: ein Test der eine konkrete Implementations-Konstante misst, bricht still beim Topologie-Wechsel — wer umwidmet, misst die echte Vision (Vollkörper = Y-Spanne > 0.5 m), nicht die Mechanik einer abgelösten Form. Vision §1.3 fraktal: eine Mesh-Sprache, zwei Anwendungen. Nächste Welle: Schöpfer-Browser-Test der V9.42-a entscheidet — V9.43 a+b+c (Wasser-Ultiversum, ~4-5 Sessions) oder V9.42-a.2 (Density-Tuning falls Insel-Form daneben).

### Davor — die Voxel-Surface-Politur V9.40–V9.41 (kompakt)

**V9.41 + V9.41-b** — der Audit-Befund „Trapeze/Linien auf flachen Hügeln". V9.41: Schach-Brett-Diagonalen (`quad()` bekommt ein `parity`-Argument, `(i+j+k)&1` alterniert die Triangulierung) brechen das uniforme Streifen-Muster — technisch messbar (964 a-c vs 885 b-d), aber das Schöpfer-Auge sah keine Änderung. Wahre Wurzel: **Voxel-Treppen aus der Surface-Nets-Auflösungs-Grenze**. V9.41-b: ein Laplacian-Smooth-Pass (Lambda 0.5, 1 Iteration, topologische Nachbarn aus dem Index-Buffer) glättet die Vertex-Positionen — Test-Mesh-Y-Abweichung 0.13 (war 0.3–0.5). Meta-Lehre: ein messbar-perfekter Headless-Beweis ist nicht dasselbe wie eine wirksame Welle.

**V9.40 a–f** — die Audit-Befunde „Chunk-Löcher beim Carve/Fill + Ruckeln" + „Maus-Voxel-Edits sehen Mitspieler nicht". V9.40-a routet die Maus-Edits durch den broadcastbaren DSL-Op (Pfad-Doppelung geheilt). V9.40-b/c/d: Pre-Build-Pattern (`_rebuildVoxelChunk` baut den frischen Chunk isoliert, bei OOM bleibt der alte stehen) + Async-Rebuild (Dirty-Queue, 1 Chunk/Frame) + Dispose-Before-Build. V9.40-f heilte die WAHRE Wurzel: das vendored `ammo.wasm` ist ohne `ALLOW_MEMORY_GROWTH` gebaut — `scripts/patch-ammo-memory.cjs` patcht den WASM-Memory-Header auf 256 MB (idempotent, via `postinstall`), `vendor/ammo-bootstrap.js` pre-grow't die Memory. Meta-Lehre: wer eine Bug-Klasse 5× an der Symptom-Ebene heilt und sie kommt zurück, MUSS unter die Schicht schauen.

**V9.39 und älter** — die kanonische Versions-Historie lebt in `CLAUDE.md` (jede Welle ein ausführlicher Eintrag, jüngste oben). V9.34–V9.39 war die grosse Heightfield-Pipeline-Rückbau-Arbeit (Phase 5c.2.c), V9.40+ die Voxel-Surface-Politur. Wer Detail zu einer Welle braucht: `CLAUDE.md` durchsuchen.

**Du erbst eine sehr lebendige Welt.** **~2966 Playtest-Invarianten grün + 0 Audit-Strict-Failures**, ~34600 Zeilen in einer Datei, alles produktiv. (Der Playtest-Konsolen-Zähler driftet ±3–8 je Lauf — „Alle Invarianten OK" ist die Wahrheit, nicht die exakte Zahl.) Vor dem ersten Code-Block: `CLAUDE.md` V9.42-c/d lesen (die jüngste Welle) + den Schöpfer-Audit-Block ganz oben. Disziplin: parallel bauen + beweisen, nie das Funktionierende brechen, ehrliche kleine Schritte vor grossen Würfen.

---

## Schöpfer-Audit nach V9.39 — Stand nach V9.42-c/d

Der Schöpfer hatte die V9.39-Welt im Browser geprüft und **fünf substanzielle Befunde** geliefert. Die Voxel-Surface-Politur (V9.40–V9.43) hat sie abgearbeitet — **vier sind geheilt, einer ist die nächste Welle**:

| Befund | Wurzel | Welle | Status |
|---|---|---|---|
| Chunk-Löcher beim Carve/Fill + Ruckeln | V9.24-Symptom-Geste wurde Schuld (OOM → null-Kollision → Mesh entfernt); synchroner Re-Mesh teuer. Wahre Wurzel: vendored `ammo.wasm` ohne `ALLOW_MEMORY_GROWTH`. | V9.40 a–f | ✅ geheilt (Async-Rebuild + Pre-Build-Pattern + WASM-Heap-Patch auf 256 MB) |
| Maus-Voxel-Edits sehen Mitspieler im P2P nicht | Pfad-Doppelung: Maus-Pfad umging den broadcastbaren DSL-Op. | V9.40-a | ✅ geheilt (Maus-Edits durch DSL-Pfad geroutet) |
| Trapeze/Linien auf flachen Hügeln | Surface-Nets-Quad-Diagonalen (V9.41-Schach-Brett heilte die Streifen) + Voxel-Treppen aus der Auflösungs-Grenze. | V9.41 + V9.41-b | ✅ geheilt (Schach-Brett-Diagonalen + Laplacian-Smooth) |
| Inseln wirken anders als der Voxel-Boden | Inseln (V7.74) waren separate radiale-Noise-Geometrie + eigenes Material — Vision §1.3 fraktal verletzt. | V9.42 a–d | ✅ geheilt (Inseln teilen die Surface-Nets-Pipeline + MeshToon-Material; Spawn-Y/Grösse/Höhe korrekt; Naht-pad-Smooth) |
| Wasserfälle sind Partikel, Wasser ist Shader-Plane | Zwei Wasser-Geometrien — Vision-Inkonsistenz. | **V9.43** | 🔴 offen — die nächste Welle |

**Empfehlung für den nächsten Agenten**: die nächste Welle ist **V9.43 — das Wasser-Ultiversum** (Schöpfer-Wahl a+b+c: Wasserfälle als vertikale Wasser-Plane + Meeres-Strömung + Bäche/Flüsse, alle als geteilter Plane-Shader mit `uFlowDirection`/`uFlowSpeed`). Eine bewusst grosse Welle (~4–5 Sessions) — ehrlich in Phasen schneiden. Plus ein bekannter Edge-Case aus V9.42-d: **5 Vertices an Vier-Chunk-Ecken** haben einen Rest-Naht-Versatz (~1 m) — falls der Schöpfer sie im Browser sieht, eine kleine V9.42-e davorziehen; falls nicht, ignorierbar. Detail in `docs/roadmap.md` §3 „Voxel-Surface-Politur".

**Lehren aus dem Audit + den V9.40–V9.42-Wellen** (sollten in JEDE nächste Welle einfliessen):
1. Eine Symptom-Heilung wird in einer späteren Welle Schuld → ihr Verfallsdatum in der Roadmap notieren, nicht nur im Code-Kommentar (V9.24 → V9.40-Wurzel).
2. Pfad-Doppelung Maus-vs-Chat ist immer ein Sync-Loch → der DSL-Op ist der EINE Broadcast-Anker.
3. Vereinheitlichung ist Vision-Arbeit, nicht Cosmetik → bei jeder neuen Schicht §1.3 fraktal prüfen.
4. Browser-Audit fängt, was Headless nie fängt → nach jeder grossen Welle einen Schöpfer-Audit einfordern.
5. Wer eine Bug-Klasse 5× an der Symptom-Ebene heilt und sie kommt zurück, MUSS unter die Schicht schauen (V9.40-f: WASM-Memory-Header).
6. Eine messbar-perfekte Headless-Metrik ist nicht dasselbe wie eine wirksame Welle — V9.41 alternierte die Diagonalen messbar, das Schöpfer-Auge sah keine Änderung (die Wurzel war eine andere Schicht).
7. Ein „Loch"-Befund ist nicht zwingend ein Geometrie-Defekt — die Boundary-Edge-Messung (0 = geschlossen) trennt Geometrie- von Material-Bug, BEVOR man den Mesher verdächtigt (V9.42-c).
8. Eine chunk-lokale Geometrie-Operation ist an der Naht nur deterministisch, wenn jedes behaltene Element seinen vollständigen Eingabe-Kontext hat — das pad-Verfahren (über den Rand meshen, voll smoothen, Überhang abschneiden) ist die einzige korrekte Lösung (V9.42-d).
9. Ein erster Fix-Versuch, der die Metrik VERSCHLECHTERT, ist ein Geschenk — er widerlegt die Hypothese hart; Headless-Messung VOR dem Commit fängt das (V9.42-d Rand-Ebenen-Filter → 6,7 % statt 1,4 %).

Disziplin: parallel bauen + beweisen, nie das Funktionierende brechen, ehrliche kleine Schritte vor grossen Würfen. Den Browser-Audit-Output IMMER ernst nehmen — der Stack-Trace ist die ehrliche Wurzel-Diagnose (V9.31/V9.39-Lehre, wieder bestätigt).

**Davor — V9.06 (Strukturen tragen ihre Material-Farbe)**: `_buildFromBlueprint` fiel ohne explizites `part.color` auf Weiss zurück — es las nie `part.material`. Fix: fehlt `part.color`, kommt die Farbe aus dem Material. Alle material-basierten Baupläne (Bäume, Felsen, Felsbogen) tragen jetzt ihre Substanz-Farbe.

**Davor — V9.05 (W6.G P4 Härtung — un-mockte Grabe-Verifikation)**: ein Schöpfer-Browser-Befund nach V9.04 — „Terrain abbauen gibt nichts, Bäume/Gebäude schon" — gegen einen grünen Playtest. Wurzel: die V9.04-Invariante MOCKTE `_raycastWorldHit` — sie bewies die Yield-Logik, nicht die un-gemockte Integration. V9.05 schliesst die Beweis-Lücke: eine neue Invariante richtet die Kamera nach unten, ruft den ECHTEN Raycast gegen echtes Terrain + `tryMouseBreak()` un-gemockt — sie yieldet Material. Der Code ist auf dem Realpfad verifiziert → der Befund war ein stale gecachter Browser-Build (githack cacht die Branch-URL; die Heilung ist die Commit-Hash-URL). Plus: der Grabe-Pfad loggt jetzt verfehlte Raycasts + volles Inventar (kein stilles Scheitern). **Lehre: ein gemockter Test beweist die Logik, nicht die Integration — widerspricht ein Schöpfer-Befund einem grünen Test, ist die Lücke fast immer das, was der Mock verbarg.** **Lies `CLAUDE.md` V9.05 ZUERST.**

**Davor — V9.04 (W6.G P4 — das Terrain wird Materie)**: alles Materielle spricht die Hylomorphismus-Sprache (Compound aus Material × Form), nur das Terrain nicht. V9.04 holt den letzten Holdout in die Sprache: ein Grabe-Hieb yieldet Material aus `_terrainMaterialAt(x,z)` — die dominante `worldFieldAt`-Achse nennt den Boden (lebendig→`erde`, dichte→`stein`, glut→`glut`, magieleitung→`quarz`). Keine Biom-Tabelle. Echte Höhlen/Tunnel + die visuelle Struktur-Terrain-Synergie bleiben benannt (`docs/roadmap.md` §3 Reihen 7+9).

**Davor — V9.03 (W6.G P3 Phase 1 — Felsformationen)**: `felsbogen` (ein begehbarer Trilithon-Überhang) + `felsturm` (eine ~17-m-Fels-Nadel) als emergente Compound-Architekturen über das Welt-Affinitäts-Feld — kein Voxel-Rewrite. Der Reframe: ein Überhang ist ein Ding AUF dem Terrain, keine Eigenschaft DES Terrains.

**Davor — V9.02 (W15-Politur — Slash-Branch-Namen im GitHub-Fetch)**: ein vendortes Repo aus `github.com/owner/repo/tree/feature/x` wurde bisher als Branch `feature` + Pfad `x` fehlinterpretiert (Trees-API 404). `resolveGithubBranch` (save-server.js) probiert jetzt die längste auflösbare Branch zuerst gegen die GitHub-Branches-API, holt gegen die Commit-SHA (slash-sicher). Beweis: `smoke-vendor.cjs`.

**Davor — V9.01 (W10 ext. Welle 4/4 — die `lifting`-Affordance; W10 ext. vollständig)**: der Affordance-Bogen schliesst mit seiner siebten Affordance: `lifting` — ein magie-geladenes, leichtes Compound, das ein Auftriebs-Feld erzeugt. Vision-rein, KEIN Form-Whitelist: `_isLifting` hebt, wenn `magieleitung` ≥ 1.5 (stark magie-geladen) UND `dichte` ≤ 1.0 (genuin leicht — das Komplement zu `balancing`s `dichte ≥ 1.5`). Welt-Reaktion — die erste physik-gekoppelte: `_tickLiftingAffordances` setzt `state.player.liftingField`, die Physik-Schleife liest es + wendet `_liftVerticalVelocity` an (reine Funktion wie `_swimVerticalVelocity`) — der Fall wird gedämpft + ein Aufwärts-Drift hebt den Spieler. +8 Invarianten. **W10 ext. ist mit radiating/broadcasting/balancing/lifting + der Stärke-Politur vollständig — sieben Affordances, ein Muster.** **Lies `CLAUDE.md` V9.01 ZUERST.**

**Welle davor — V9.00 (W10 ext. Welle 3/4 — die `balancing`-Affordance)**: der Affordance-Bogen bekommt seine sechste Affordance: `balancing` — ein breites, bodenlastiges, schweres Compound, das den Ort GRÜNDET. Vision-rein, KEIN Form-Whitelist: `_isBalancing` gründet, wenn (1) breiter als hoch (horizontale Spannweite ≥ vertikale — ein Fundament, kein Mast), (2) ≥60 % der Parts in der unteren bbox-Hälfte (tiefer Schwerpunkt), (3) `dichte`-Tag ≥ 1.5 (genuin schwer — ein leichter Quarz-Cluster gründet NICHT), (4) ≥3 Parts. Welt-Reaktion `_tickBalancingAffordances`: nahe einer gründenden Form (≤14 m) wird `chaos` abgebaut — das KOMPLEMENT zum `radiating`-Tick (radiating hebt awe+peace, balancing senkt chaos). Synergie ohne Extra-Code: weniger chaos verlangsamt zugleich die Kreaturen (chaos → Tempo). +8 Invarianten. `lifting` bleibt W10 ext. Welle 4/4. **Lies `CLAUDE.md` V9.00 ZUERST.**

**Welle davor — V8.99 (W10 ext. Politur — die Affordance-Stärke skaliert mit der Substanz)**: eine Schöpfer-Frage trug die Welle — „kann ich eine bessere oder schlechtere Antenne bauen, oder gibt es nur ja/nein?". Befund: der Affordance-Schwellwert war eine Klippe, der broadcasting-Relais ein flaches ×2. Jetzt: der Schwellwert in `computeBlueprintAffordances` bleibt die GATE (ist es überhaupt ein Strahler/Mast?), aber DARÜBER skaliert die Wirkung. `computeAffordanceStrength(bp)` liefert je Affordance eine Stärke 0.2..1.0 = `overScale(tag, schwelle)` (0.4..1.0, wie weit der Tag den Schwellwert übersteigt) × `precF` (0.5..1.0, `0.5 + 0.5×computeBlueprintQuality` — Vision §6.3). `_tickRadiatingAffordances` skaliert die Emotion-Intensität mit der Strahler-Stärke; das broadcasting-Relais skaliert `mult = 1 + mastStärke × (BROADCAST_RANGE_MULT−1)`. `spawnArchitecture` friert `entry.affordanceStrength` ein. Man baut eine bessere Antenne durch Material, Form UND Handwerk. +6 Invarianten. **Lies `CLAUDE.md` V8.99 ZUERST.**

**Welle davor — V8.98 (W10 ext. Welle 2/4 — die `broadcasting`-Affordance)**: der W10b-Affordance-Bogen bekommt seine fünfte Affordance: `broadcasting` — ein leitfähiger, aufrechter Mast (Relais). Vision-rein, KEIN Form-Whitelist: `_isBroadcasting` sendet, wenn (1) das Compound axial entlang der y-Achse ausgerichtet ist (`_axialAlignment.axis === "y"` + `alignmentRatio ≥ 0.6` — ein Mast steht aufrecht), (2) leitfähig (`stromleitung`/`magieleitung` ≥ 0.4), (3) ≥3 Parts. KOMPLEMENT zu `radiating`: derselbe 0.6-Schwellwert trennt radial (strahlt) von axial (sendet). Welt-Reaktion ist KEIN eigener Tick — ein `broadcasting`-Mast in 18 m eines `radiating`-Strahlers VERVIELFACHT dessen Reichweite (×2, 14 m → 28 m): Affordances komponieren. +7 Invarianten. balancing/lifting bleiben Welle 3-4. **Lies `CLAUDE.md` V8.98 ZUERST.**

**Welle davor — V8.97 (W10 ext. Welle 1/4 — die `radiating`-Affordance)**: der W10b-Affordance-Bogen (`moveable`/`magnifying`/`focusing`) bekommt eine vierte: `radiating` — ein resonanz-strahlendes Compound. Vision-rein, KEIN Form-Whitelist (W10b.2-Lehre): `_isRadiating` strahlt, wenn (1) `resoniert`-Tag ≥ 1.5 (= `WORLD_EFFECT_THRESHOLDS.resonance_strong`), (2) Parts radial gespreizt (axiale `alignmentRatio` < 0.6 — kein Mast), (3) ≥3 Parts. Welt-Reaktion `_tickRadiatingAffordances` (Spiegel des `focusing`-Ticks): ≤14 m vom Strahler steigen `awe`+`peace` sanft, der erste Kontakt schreibt eine Journal-Erinnerung. Synergie ohne Extra-Code: hoher `resoniert` → es triggert zugleich die W4-V4-`_lofiNearResonantArchitecture` (Pad verdichtet sich). +6 Invarianten. balancing/broadcasting/lifting bleiben W10 ext. Welle 2-4. **Lies `CLAUDE.md` V8.97 ZUERST.**

**Welle davor — V8.96 (Wurzelheilung des letzten flaky Tests + W16-Politur)**: zwei kleine Wellen, ein Commit. (1) Der `6.H P2D Level-Up`-Playtest war timing-flaky (V8.83-Befund): er prüfte `journalGrew` als `entries.length > lenBefore` — aber `worldJournal.entries` ist FIFO-gedeckelt (200); am Cap verdrängt ein Anhängen einen alten Eintrag, die Länge bleibt 200, der Test kippt. Fix: die Eintrags-OBJEKT-Identität messen (`Set` von Eintrags-Refs, `!journalEntriesBefore.has(e)`) — cap- + id-unabhängig (`journalAppend`s id `entries.length+1` ist nach dem Cap auch nicht eindeutig). (2) W16-Politur: der Mesh-Welt-Transfer bekommt eine Hash-Verifikation (der Katalog-Content-Hash reist im `pendingBundlePull` zum Pull mit; nach dem Schreiben vergleicht der Empfänger den save-server-`bundleHash` — bei Abweichung wird die Welt verworfen, `hash_mismatch`) + einen weichen Pull-Timeout (`_p2pCheckBundlePullTimeout` aus `p2pTick` gibt einen hängenden Pull nach `P2P_BUNDLE_PULL_TIMEOUT_MS`=30 s frei). +8 Invarianten. **Lies `CLAUDE.md` V8.96 ZUERST.**

**Welle davor — V8.95 (W4 V4 — die Musik hört die Welt, eine Synergie-Welle)**: die vierschichtige generative Symphonie (W4 V3) hört jetzt das Welt-Affinitäts-Feld (`worldFieldAt` — die vier SimplexNoise-Tag-Schichten aus W6.G P2) + die Architektur-Resonanz. Drei Sub-Schritte, ein Commit: (1) `_lofiWorldField` → `_lofiApplyWorldTimbre` färbt die Klangfarbe (`lebendig` → Pad-Filter 750-1050 Hz, `dichte` → `bassGain` 0.40-0.56, `magieleitung` → verstimmter Oktav-Schimmer, `glut` → schärferes Hihat); (2) `_lofiNextDegree` bekommt den schwachen Welt-Feld-Bias (Gewicht 0.4 gegen Emotion 0.8 — die Emotion bleibt dominant, seed-fix gemessen); (3) `_lofiNearResonantArchitecture` gated die Pad-Stimmen-Dopplung — ein resonantes Bauwerk „singt mit". Kein neuer Stamm — Vision §1.3 fraktal: dieselbe Sprache (die Welt-Tags) regelt Form, Verteilung UND Klang. +6 Invarianten. **Lies `CLAUDE.md` V8.95 ZUERST.**

**Welle davor — V8.94 (Bass hörbar gemacht)**: der Bass (V8.93) war „nicht zu hören" — kein Bug, die Sub-Frequenz lag bei 55-104 Hz (Tiefbass, den kleine Lautsprecher abrollen). Fix: jeder Bass-Schlag trägt zwei Stimmen (Sub + Oktav-Stimme 110-208 Hz). Detail: `CLAUDE.md` V8.94.

**Welle davor — V8.93 (W4 V3 Phase 4 — das Orchester: die generative Symphonie ist vollständig)**: W4 V3 baute über neun Wellen (V8.85-V8.93) aus dem statischen Lofi-Loop (V8.84) eine seed- + emotion-getriebene, vierschichtige generative Symphonie. Die vier Phasen: **Harmonie** (V8.85 — eine funktionale Markov-Akkordfolge über A-Moll, joy/hope → helle Stufen, sorrow → dunkle; Mulberry32-RNG aus `worldMeta.seed + ":lofi"` — jede Welt ihr eigenes Lied, kein Loop), **Melodie** (V8.87/V8.90 — eine improvisierende Lead-Stimme über einem 8-Schritt-Raster mit Onset-Wahrscheinlichkeit/Pausen, Noten-Längen, Dynamik), **Groove** (V8.91/V8.92 — synthetische Trommeln Kick/Snare/Hihat, kein Asset, + Swing; die Kick ging von 140→48 Hz Tiefbass auf 200→70 Hz + Noise-Klick, damit sie auf jedem Lautsprecher trägt), **Orchester** (V8.93 — `_lofiPlayBass` spielt die Akkord-Wurzel eine Oktave tief auf den Kick-Schritten, Bass + Kick verzahnen sich; + Stimmen-Reichtum: ein heller Akkord bekommt eine Oktav-Dopplung im Pad). Harmonie/Melodie/Groove/Bass teilen EIN 8-Schritt-Raster — vier Schichten, ein Puls. +1 Invariante (V8.93). Headless prüft die Mechanik — die Balance der vier Schichten prüfte das Schöpfer-Ohr über die neun Wellen. **Lies `CLAUDE.md` V8.93 (+ V8.84-V8.92) ZUERST.**

**Welle davor — V8.80 (W17 Phase B-JS-Compute Phase 2 — Host-Migration)**: Phase 1 (V8.79) baute den Compute-Host; die ehrliche Grenze war: verlässt der Host das Mesh, endet die Sub-Welt. Phase 2 schliesst sie. **Die Roster**: der Compute-Host annonciert seine Mitglieder-Liste (`serverConns` inkl. seiner selbst) als `subworld-roster` (kanal-exklusiv, wie `subworld-srv`) an jeden Gast — bei JEDER `serverConns`-Änderung; jeder Gast cacht sie (`_portalRosterReceive`). **Die deterministische Wahl**: verlässt der Host das Mesh, ruft `_p2pRemovePeer` bei jedem Gast `_portalMigrateHost` — jeder wählt aus seiner gecachten Roster denselben Nachfolger (die kleinste peerId ohne den Abgegangenen — wie die W7-P1-Initiator-Regel; kein Wahl-Protokoll, kein Announce). **Die Übernahme**: der Nachfolger (`_portalPromoteToHost`) flippt `computeRole` guest→host + baut einen FRISCHEN Server-Kontext (`_portalSpawnServerContext`, aus `_buildPortalOverlay` extrahiert); die übrigen Gäste zeigen auf ihn + melden ihre Verbindung neu an. **Ehrliche Grenze**: der Server-Zustand geht verloren (der neue Kontext startet frisch — kein Handoff, der alte Host könnte abgestürzt sein). +12 Invarianten, Zwei-Browser-verifiziert (`smoke-webrtc.cjs` — A verlässt das Mesh, B wird Compute-Host, B's Verkehr läuft durch B's frischen Server; die Summe startet bei 0). Damit ist **W17 für Relay- + JS-Compute-Welten vollständig**. **Lies `CLAUDE.md` V8.80 ZUERST.**

**Welle davor — V8.79 (W17 Phase B-JS-Compute Phase 1 — der Compute-Host)**: eine JS-Compute-Welt hat eine echte autoritative Server-JS-Logik; Phase 1 baute den Compute-Host-Mechanismus. `portalMeta.serverMode` (`relay`/`js-compute`); Host-Wahl ohne Präsenz-Tabelle (Öffner = Host, Beitretender = Gast des Einladenden); der Host baut ein zweites, verborgenes null-origin-iframe als Server-Kontext (`?anazh-server=1`, `PORTAL_SERVER_SHIM` — ein `WebSocketServer`-Global); host-geroutetes Transport (`subworld-srv`/`subworld-cli`, kanal-exklusiv, statt Broadcast). +19 Invarianten. **Lies `CLAUDE.md` V8.79 ZUERST.**

**Welle davor — V8.78 (W17 die Multiplayer-Welt-Deklaration — eine vendorte Welt erklärt sich selbst mehrspielerfähig)**: W17 Phase C baute den Gruppen-Portal-Mechanismus, aber eine vendorte Multiplayer-Welt deklarierte sich nicht als `multiplayer` — `obtainPortalForWorld` produzierte für sie kein Multiplayer-Portal. V8.78 schliesst die Naht: ein `multiplayer`-Flag fliesst durch JEDE Schicht der Vendor-/Mesh-Kette — `vendorWorldBundle`/`vendorWorldFromRepo` → `_vendorRegisterWorld` → `_sanitizeImportedManifest` (localStorage-rundlauf-fest) → der `customWorlds`-Eintrag; `aimBlueprintAtWorld` (V8.77) reicht es ins `portalMeta`. Über das Mesh: der W16-Welt-Katalog + der Bündel-Transfer tragen es mit. Eine „Multiplayer-Welt"-Checkbox (`#vendor-multiplayer`) + eine „Multiplayer"-Marke in der Bibliothek. +10 Invarianten. **Lies `CLAUDE.md` V8.78 ZUERST.**

**Welle davor — V8.74 (W16 Phase 2: der Welt-Katalog — die Mesh-Bibliothek wird browsbar)**: W16 P1 baute den Transport (eine vendorte Welt reist peer-to-peer), aber der Spieler musste die `worldId` kennen und den Peer aus einem Dropdown wählen. P2 macht die Mesh-Bibliothek browsbar: jeder Mitspieler annonciert seine vendorten Welten als `[{id, label, hash}]` über den `soul`-Kanal (wie `worldRole`/`voiceShared` — kein neuer Nachrichtentyp; der signaling-server-`soul`-Handler reicht `catalog` explizit durch). Der Bibliothek-Drawer zeigt „Mitspieler X hat: …" mit einem Holen-Knopf statt eines blanken worldId-Feldes (`_renderMeshWorldCatalog`, ein delegierter Klick-Listener — V8.37-Lehre). Eine vendorte Welt bekommt einen deterministischen sha256-Content-Hash über ihre Datei-MENGE — der save-server rechnet ihn (`bundleContentHash`, Hash-Autorität; `applyVendorBundle` UND `readVendorBundle` liefern ihn als `bundleHash`), der Browser hasht nie selbst (eine GitHub-vendorte Welt sieht der Client gar nicht). Zwei Spieler mit demselben Hash haben beweisbar dieselbe Welt; `_haveWorldByHashOrId` dedupt über id ODER Hash → die Katalog-Zeile zeigt „✓ vorhanden" statt eines Knopfes. `_vendorRegisterWorld` (die EINE Naht, durch die jede neu angedockte Welt fliesst — lokal/GitHub/Mesh) re-annonciert den `soul` → eine frisch vendorte Welt erscheint sofort bei allen Mitspielern + propagiert über das Mesh. +14 Invarianten 2648→2662, Zwei-Browser-verifiziert (`smoke-webrtc.cjs` — A's Welt erscheint in B's Katalog mit echtem sha256-Hash, B holt sie über die Katalog-Zeile). **Lies `CLAUDE.md` V8.74 ZUERST.**

**Welle davor — V8.73 (W16 Phase 1: Mesh-Welt-Verteilung — eine vendorte Welt reist peer-to-peer)**: W15 baute das Andocken aus einem lokalen Ordner ODER einem GitHub-Repo. W16 P1 lässt eine vendorte Welt ÜBER DAS MESH reisen — ein Mitspieler, der eine Welt nicht hat, holt ihr Bündel peer-to-peer von einem, der sie hat. Zwei kanal-exklusive Nachrichten `world-bundle-pull`/`world-bundle-chunk` — Zeile für Zeile das W7-P2-`world-pull`/`world-chunk`-Muster (direkt in `_p2pHandleChannelMessage` behandelt, gechunkt mit Backpressure, peer-gebundene Annahme-Wand `pendingBundlePull`, Rate-Limit mit `-Infinity`-Sentinel). Der Sender liest sein Bündel über die neue save-server-Lese-Seite `GET /api/vendor-bundle` (symmetrisch zur Schreib-Seite `applyVendorBundle`) von der Platte zurück + chunkt es über den DataChannel; der Empfänger reassembliert + reicht `{worldId,label,desc,dsl,files}` an die erprobte `vendorWorldBundle`-Schreib-Seite — ein DRITTER Eingang (lokales Bündel / GitHub / Mesh-Peer), NULL neue Schreib-Logik. Eine peer-empfangene Welt läuft `trust:"sandboxed"` (V8.71-Zwang über `vendored:true`); die ankommende worldId muss die angefragte sein (kein Welt-Schmuggel). Eine schlichte „Welt vom Mitspieler holen"-Sektion (worldId-Feld + Peer-Dropdown) — der browsbare Welt-Katalog ist W16 P2. +19 Invarianten 2629→2648, Zwei-Browser-verifiziert (`smoke-webrtc.cjs` — A vendort eine Welt, B holt sie über das Mesh). **Lies `CLAUDE.md` V8.73 ZUERST.**

**Welle davor — V8.72 (Auto-Vendor Phase 2: der GitHub-Fetch — ein fremdes Repo dockt aus dem Netz an)**: V8.71 baute die sichere Hälfte (ein LOKALES Bündel dockt an). W15 P2 fügt die Netz-Hälfte hinzu: eine GitHub-URL eingeben, der save-server holt das Repo selbst. Der `/api/vendor-world`-Endpunkt nimmt jetzt ZWEI Eingänge — `{worldId, files}` (Bündel) und `{worldId, repoUrl}` (GitHub); die Phase-1-Schreib-Logik ist zu `applyVendorBundle` extrahiert, BEIDE Eingänge enden dort. Der GitHub-Pfad: `parseGithubRepoUrl` (URL → owner/repo/branch, Regex-streng) → `vendorFromGithub` (Default-Branch auflösen, Trees-API lesen, Text-Dateien per Raw-Fetch holen — zero-dep `https`, `vendorHttpGet`). **Kein SSRF**: die Repo-URL liefert nur owner/repo/branch, die fetchbare URL baut der Server aus `VENDOR_GH_API_BASE`/`VENDOR_GH_RAW_BASE` (env, Default `api.github.com`/`raw.githubusercontent.com`) — eine Browser-Seite kann den Host nicht wählen. Die env-Bases sind echte Operator-Konfiguration (GitHub Enterprise) UND die Test-Naht: `smoke-vendor.cjs` Teil C startet ein lokales Fake-GitHub + zeigt die Bases darauf → der echte Fetch-Code läuft offline + deterministisch. Clientseitig spiegelt `vendorWorldFromRepo` das `vendorWorldBundle` (beide enden in `_vendorRegisterWorld`, `trust:"sandboxed"`); eine GitHub-URL-Zeile in der „Welt andocken"-Sektion. +12 Invarianten 2617→2629, smoke-verifiziert. **Lies `CLAUDE.md` V8.72 ZUERST.**

**Welle davor — V8.71 (Auto-Vendor-Pfad Phase 1: ein lokales Welt-Bündel dockt sandgesichert an)**: V8.70 baute den Schlüsselstein (eine fremde Engine läuft null-origin sandgesichert), aber `worlds/schwarm/` war hand-vendort — jemand legte ihre Datei ab + trug einen Eintrag nach. W15 automatisiert das. Der save-server (lokal, hat schon den V7.96-LLM-Proxy) bekommt einen zweiten Schreib-Pfad `/api/vendor-world`: er nimmt `{worldId, files:[{path,content}]}` und schreibt das Bündel nach `worlds/<id>/`. Die Wand spiegelt den LLM-Proxy — op-förmige `worldId` (keine Built-in-Welt), jeder Pfad relativ (kein `..`/Backslash/absoluter Pfad, `path.posix.normalize` + `startsWith`-Prüfung), Endung-Whitelist (Text), Größen-Deckel, `index.html` Pflicht; **NIE läuft etwas — nur `fs.writeFileSync`**. Clientseitig: `_vendorSanitizeBundle` prüft vorab (Defense in Depth), `_vendorPostBundle` POSTet (der einzige Netz-Schritt, im Playtest gestubbt wie `llmCall`), `vendorWorldBundle` registriert die Welt als `customWorlds`-Eintrag mit `trust:"sandboxed"` + `vendored:true`. Die Marke `vendored` ERZWINGT `trust:"sandboxed"` in `_sanitizeImportedManifest` (unforgeable — eine vendorte Welt läuft IMMER null-origin); `_sanitizeImportedManifest` trägt `trust`+`vendored` jetzt durch den localStorage-Rundlauf (V8.59-Lehre). Eine „Welt andocken"-Sektion im Bibliothek-Drawer nimmt einen Welt-Ordner. Phase 1 ist die netzfreie Hälfte (ein lokales Bündel) — der GitHub-Fetch ist Phase 2; sie baut zugleich die Schreib-Seite, die Phase 2 wiederverwendet. +20 Invarianten 2597→2617, browser-verifiziert (`smoke-vendor.cjs` — Teil A der save-server-Round-Trip, Teil B die frisch vendorte Welt läuft in einem echten null-origin-iframe). **Lies `CLAUDE.md` V8.71 ZUERST.**

**Welle davor — V8.70 (Untrusted-Welt-Tor: eine echte fremde Engine läuft null-origin sandgesichert)**: der Schöpfer fragte zu Recht — „kann ich wirklich in eine andere Welt, oder ist alles Hardcode, nimmst du Freiheit für Sicherheit?". Antwort: das echte Tor zu fremden Engines, ohne Freiheits-Tausch. Eine Welt trägt eine Vertrauensstufe (`portalMeta.trust`): `"sandboxed"` → `_buildPortalOverlay` gibt dem Portal-iframe `sandbox="allow-scripts"` ALLEIN (keine `allow-same-origin`) → opake null-Herkunft. Fremder, ungeprüfter Code läuft VOLL (jede Physik, WebGL, WASM), kann aber AnazhRealms `localStorage`/`document`/Cookies NICHT berühren — die Wand IST die Bedingung dafür, dass beliebiger fremder Code überhaupt sicher laufen darf, kein Tausch. Die neue `worlds/schwarm/`-Welt beweist es: eine eigenständige 2D-Boids-Engine (eigenes Canvas, eigener Loop, kein Three.js, kein AnazhRealm-Code), die null-origin läuft + per Sandbox-Selbsttest meldet, dass die Wand hält. `_sanitizePortalMeta` + `buildStateSnapshot` tragen `trust`; `_portalSendEnter`/`_portalForwardDsl` posten `"*"` an die opake Welt. Diese Welle baut den MECHANISMUS; das automatische Andocken externer Repos ist die nächste (Auto-Vendor-Pfad). +13 Invarianten 2584→2597, browser-verifiziert (`smoke-sandbox.cjs`). **Lies `CLAUDE.md` V8.70 ZUERST.**

**Welle davor — V8.69 (KI-Übersetzer Phase 2: das Tor öffnet sich — eine übersetzte Welt wird betretbar)**: der KI-Übersetzer ist damit **vollständig**. Phase 1 übersetzte eine fremde Welt in ein Manifest; Phase 2 öffnet das Tor — die übersetzte Welt wird ein betretbarer Ort. Der genial-sichere Kniff: statt LLM-generierten Adapter-Code auszuführen (die gefährliche Hälfte), übersetzt der LLM die Welt in eine deklarative **Szene** — wieder DATEN, kein Code. `buildTranslatedWorld(id)` ruft `translateWorldScene` (LLM → Szene), `_sanitizeWorldScene` säubert sie (jede Farbe striktes `#rrggbb`, jede Zahl geclampt, jede Liste gedeckelt — die Wand), heftet sie an die `customWorlds`-Welt + macht sie `reachable:true`. Der generische, hand-geschriebene Renderer `worlds/translated/` baut JEDE solche Szene auf (Gradient-Himmel, Boden, Objekt-Gruppen als `InstancedMesh`, Ambient-Partikel, Diorama-Kamera). Das Portal trägt eine `translatedWorldId`; `_portalSendEnter` schickt die Szene im `enter`-Handshake (Daten, gerendert, nie ausgeführt). Eine Welt, ausgedrückt in einer Sprache, die AnazhRealm selbst rendert — die Bibliothek von Alexandria, die nicht brennt. +20 Invarianten 2564→2584, der Renderer browser-verifiziert (`smoke-translated.cjs`). **Lies `CLAUDE.md` V8.69 ZUERST.**

**Welle davor — V8.68 (KI-Übersetzer Phase 1: eine fremde Welt → ein Portal-Manifest)**: der letzte grosse Vision-Schritt aus `docs/world-portal.md` §2 Schicht 3 beginnt. Ein LLM übersetzt eine frei beschriebene fremde Welt in ein Portal-Manifest — Phase 1 ist bewusst die **sichere** Phase: der LLM-Output ist DATEN (ein Manifest), kein Code. `translateWorldManifest` ruft `llmCall` (denselben Transport wie Welt-Grok + Kreatur-Persona) mit dem Übersetzer-System-Prompt, `_parseManifestResponse` liest das Manifest per `JSON.parse` (nie eval), `_sanitizeImportedManifest` säubert es (dieselbe Wand wie der W14-P3-Import — op-förmige id, kein Built-in-Override, same-origin `worlds/`-Pfad). Der Spieler prüft den KI-Vorschlag in einem Review-Schritt (er ist die letzte Wand), `acceptTranslatedManifest` legt ihn `translated:true`/`reachable:false` in `customWorlds` — eine übersetzte Welt ist browsbar, nicht betretbar (die Engine-Vendierung ist Phase 2). Neue Sektion „KI-Übersetzer" im Bibliothek-Drawer. +19 Invarianten 2545→2564, playtest-grün. **Lies `CLAUDE.md` V8.68 ZUERST.**

**Welle davor — V8.67 (W11 V4: Voice-Sync — der Präsenz-Bogen schliesst sich)**: der letzte offene Roadmap-Punkt vor dem KI-Übersetzer. W11 V3 gab dem Mitspieler seinen echten Soul (sehen), seine Aura (spüren), seinen Vibe-Pass (kennen) — V4 macht ihn **hörbar**: wenn dein Begleiter spricht (jeder Pfad durch `grokRender` — der EINE Sprech-Engpass), reist der Text via `companion-say` (`{peerId,text,voice}`) an alle Mitspieler; sie spielen ihn via `SpeechSynthesis` ab — gegated auf den eigenen Stimme-Toggle (`grok.speechEnabled`, ein Toggle für eigenen + fremden Begleiter), Silent-Drop bei laufender Stimme. Der Begleiter bekommt eine wählbare STIMME (`<select id="companion-voice">`, persistiert) — sie reist mit, ein Mitspieler erkennt den fremden Begleiter an seiner Stimme. Dedizierter Kanal wie `soul`/`aura`, kein DSL. +14 Invarianten 2531→2545, Zwei-Browser-verifiziert. **Lies `CLAUDE.md` V8.67 ZUERST.**

**Davor — V8.62-V8.66 (W7 Compute-Sharing KOMPLETT)**: der ganze W7-Bogen. **P1 (V8.62)**: echte WebRTC-DataChannels — der `signaling-server` wird Rendezvous statt Relay, pos/dsl/soul/aura/vibe fliessen peer-to-peer, eine Mesh-Komplett-Wand gegen Doppel-Zustellung. **P2 (V8.63)**: der Welt-Snapshot reist mesh-nativ in 16-KiB-Stücken (`world-pull`/`world-chunk`), Guest-Resync per Knopf. **V8.64**: Multi-User-Bau-Sync — `confirmBuild`/`harvestArchitecture` broadcasten (geteilte string-`archId` + `remove_architecture`-Op). **P3 (V8.65)**: LLM-Pool — ein Peer teilt seine „Stimme" (Opt-in + Rate-Limit + dslRun-Sandbox). **P4 (V8.66)**: Public-Lobby (`lobby-publish`/`lobby-list`) + Kreatur-Sicht-Sync (jeder Peer streamt SEINE Kreaturen → `remoteCreatures`, NICHT in `state.creatures`). Jede Welle Zwei-Browser-verifiziert (`smoke-webrtc.cjs`). **Lies `CLAUDE.md` V8.62-V8.66 ZUERST.**

**Davor — V8.61 (W14 Phase 3: fremde Welten empfangen — W14 komplett)**: die Bibliothek wächst über die drei Built-in-Welten hinaus. `exportWorldManifest` teilt eine signierte Welt als §3.3-Manifest-Datei, `importWorldManifest` empfängt ein fremdes Manifest (gesäubert via `_sanitizeImportedManifest`, Signatur via `_vibeVerify` geprüft, `fetch`-Reachability-Probe) → `state.customWorlds`. `_worldEntry`/`_libraryWorlds` führen Built-ins + Importierte zu EINER Quelle zusammen; „signiert von <Autor>" wird zwischen Spielern real. Eine empfangene Welt ohne erreichbare Dateien ist browsbar, nicht betretbar (der KI-Übersetzer bleibt der Horizont). Damit ist **W14 Phase 1+2+3 vollständig** — die Bibliothek von Alexandria steht. +20 Invarianten 2423→2443, browser-verifiziert. **Lies `CLAUDE.md` V8.61 ZUERST.**

**Davor — V8.60 (W14 Phase 2: signierte Welt-Manifeste + W13 V2)**: zwei Teile. **Teil A** — der Spieler versiegelt eine Welt mit seinem Vibe-Pass (`signWorld`/`verifyWorldSignature` spiegeln die W13-P2-Bauplan-Signatur 1:1, vier Status-Stufen; das Portal-Overlay zeigt beim Betreten „✓ signiert von <Autor>"). **Teil B (= W13 V2)** — der Vibe-Pass trägt das Schaffen des Spielers (aktive Seele, eigene Materialien + Werkzeuge) durch ein Portal; die Skelett-Welt begrüßt den Reisenden mit dem, was er geschaffen hat. Self-Sovereign — kein Projekt-Schlüssel; der private Schlüssel reist NIE mit, der `enter`-Payload wird angezeigt nie ausgeführt. +29 Invarianten 2394→2423, browser-verifiziert (Screenshot). **Lies `CLAUDE.md` V8.60 ZUERST.**

**Davor — V8.59 (W14 Phase 1 Härtung)**: ein Selbst-Audit der V8.58 fand eine nicht zu Ende gedachte Folge — `buildStateSnapshot`/`loadState` persistierten `portalMeta` + `role:"portal"` nicht (nur `role:"tool"`), ein über die Bibliothek geholtes Portal verlor beim Reload seine Ausrichtung und der `welt_portal`-Klon traf wieder den V8.51-`_isMoveable`-Bug. Fix: ein Portal-Zweig in beiden Save-Pfaden (parallel zum `tool`-Zweig, `portalMeta` beim Laden durch `_sanitizePortalMeta`); `obtainPortalForWorld` richtet bei jedem Aufruf neu aus (heilt Altsaves). +4 Invarianten 2390→2394. **Lies `CLAUDE.md` V8.59 + V8.58 ZUERST.**

**Davor — V8.58 (W14 Phase 1: Bibliothek)**: die `WORLD_REGISTRY` wird ein spieler-erreichbarer Ort. Ein achter Topbar-Tab „Bibliothek" listet die registrierten Sub-Welten als browsbare Karten (Label, Beschreibung, DSL-Vokabular, Stufen-Marke); „Portal holen" klont den portal-förmigen Magie-Ring `welt_portal` zu einem eigenen, auf die Welt gerichteten Bauplan und legt ihn ins Inventar. Kein neuer Stamm — W14 verbindet bestehende Schnittstellen (`WORLD_REGISTRY`, `aimBlueprintAtWorld`, `cloneBlueprint`, `addToInventory`). +13 Invarianten 2377→2390, Bibliothek-Drawer browser-verifiziert. **Lies `CLAUDE.md` V8.58 ZUERST.**

**Welle davor — V8.57 (Flaky-Test-Heilung)**: ein flaky CI-`playtest` an der Wurzel geheilt. Der Check „Ring 5 V2-Prep: Maus runter hebt Kamera (3rd)" las `camera.position.y` — den Wert NACH der V8.36-Kamera-Kollision, deren Raycast die Kamera umgebungs-abhängig einzieht (wo der Spieler nach 20 s steht, ist nicht-deterministisch → CI-Flake). Fix: der Spielcode spiegelt die pitch-gesteuerte Wunsch-Höhe als `state._cameraDesiredY` (vor der Kollision); der Test liest sie → reine, umgebungs-unabhängige Pitch-Mathematik. Detail: `CLAUDE.md` V8.57.

**Welle davor — V8.56 (W13 Phase 3: Vibe-Pass-Identität im Multi-User)**: P1 gab dem Avatar einen Schlüssel, P2 ließ ihn seine Werke signieren — P3 trägt die Identität in die geteilte Welt. Ein Mitspieler ist nicht mehr nur eine fälschbare `peerId` + ein gewählter Name, sondern sein Vibe-Pass — **beweisbar**. Ein neuer WS-Nachrichtentyp `vibe` (`{vibePassId, proof}`); `proof` signiert die EIGENE peerId, der Empfänger verifiziert gegen die server-gestempelte peerId — ein geklauter Beweis nützt nichts (er gilt einer fremden peerId). Das Name-Schild eines verifizierten Mitspielers wächst um „✓ <Fingerprint>". Damit ist **W13 (Vibe-Pass) mit Phase 1+2+3 vollständig**. Ein Commit, playtest-grün. **Lies `CLAUDE.md` V8.56 ZUERST.**

**Welle davor — V8.55 (W13 Phase 2: Bauplan-Signaturen)**: ein eigener Bauplan trägt eine ed25519-Signatur. Signiert wird die SUBSTANZ (`_canonicalBlueprint`: Rolle + Parts + Verbindungen), nicht der Name — so überlebt die Signatur Recipe-Import + Fusion. `verifyBlueprintSignature` → vier Stufen (unsigned/valid/modified/forged), bei jedem Werkstatt-Render frisch geprüft (kein Mutations-Hook).

**Wellen davor — V8.48-V8.54**: W12 Welt-Portal (V8.51-V8.53 — sandboxed iframe, zwei fremde Engines, generische DSL-Brücke, beidseitiger Kanal, native Manifest-Stufe) + W13 Phase 1 (V8.54 — der ed25519-Schlüssel als Fundament) + drei kleine Polish-Wellen (V8.48 Terrain-Schatten, V8.49 `updateCreatures`-Perf 2,4×, V8.50 Flaky-Test-Heilung über `_gameLoopTick`). Volle Wellen-Historie: Session-Tagebuch unten + `CLAUDE.md`.

**In Arbeit — der echte Fremd-Engine-Bogen.** W12 Welt-Portal, W13 Vibe-Pass, W14 Bibliothek, W7 Compute-Sharing + der KI-Übersetzer (Phase 1+2) sind komplett. Der Schöpfer öffnete einen neuen Bogen: das echte automatische Tor zu fremden Vibecode-Engines (OASIS / Bibliothek von Alexandria). **V8.70 baute den Schlüsselstein** — das Untrusted-Welt-Tor: eine echte, ungeprüfte fremde Engine läuft null-origin sandgesichert hinter dem Portal. **V8.71 + V8.72 bauten den Auto-Vendor-Pfad (W15) komplett**, **V8.73 + V8.74 die Mesh-Welt-Verteilung (W16) komplett** — eine vendorte Welt reist peer-to-peer + die Mesh-Bibliothek ist browsbar. **V8.75–V8.80 bauten W17 vollständig** (für Relay- + JS-Compute-Welten) — Phase A der Transport-Shim, B-Relay das Mesh-als-Server, C das Gruppen-Portal, V8.78 die Multiplayer-Welt-Deklaration, V8.79 B-JS-Compute Phase 1 der Compute-Host, V8.80 B-JS-Compute Phase 2 die Host-Migration: eine Gruppe taucht gemeinsam in eine vendorte Relay- ODER JS-Compute-Multiplayer-Welt, und verlässt der Compute-Host das Mesh, übernimmt ein Nachfolger. Die `serverMode`-Vendor-Ketten-Naht ist mit **V8.82** geschlossen (`serverMode` fliesst durch die ganze Vendor-/Mesh-Kette — eine vendorte js-compute-Welt deklariert sich selbst). Offen im Bogen: nur B-WASM (ein Rust→WASM-Server in einem Peer-Tab — bewusst „per-Projekt, nicht automatisch"). Danach lief **W4 V3 (V8.85-V8.93)** — die generative Symphonie ist komplett. `docs/world-portal.md` + `docs/roadmap.md` + `docs/state-of-realm.md` ZUERST lesen.

**Welle davor — V8.47 (Shadow-Acne-Heilung)**: Schöpfer-Befund „unnatürliche Schattenlinien nur auf komplett horizontalen flachen Flächen" (Bauwerks-Dächer). Diese Präzision war die Diagnose — Cel-Banding erscheint auf GEWÖLBTEN Flächen, nicht auf flachen; der Schöpfer sah das Gegenteil → Shadow-Map-Acne. Die `DirectionalLight` hatte keinen Shadow-Bias → flache, zur Sonne zeigende Flächen schatten sich selbst in Streifen. Fix: `shadow.normalBias = 1.0` + `shadow.bias = -0.0005` + mapSize 1024→2048.

**Welle davor — V8.46 (Sanfte Wetter-Übergänge)**: `_weatherBlendedValue` cross-fadet `weatherEffect` + `cloudCover` über die 45s-Transition (vorher flippten sie sofort → harter Wetter-Sprung).

**Jüngste Wellen — V8.42 → V8.45 (Cel-Crawl-Heilung I–IV)**: die Cel-Kontraste „wanderten" beim langsamen Kamera-Schwenk. Vier Wurzeln, in vier Browser-Test-Runden eingekreist: (V8.42) `toonGradientMap` lief mit `NearestFilter` → 32 harte Stufen → Fix `LinearFilter`. (V8.43) der Detail-Noise lief per-Pixel im Terrain-Fragment-Shader → Fix: per Vertex + `varying`. (V8.44) der Schöpfer-Befund „Yaw verschiebt, Pitch nicht" = Beleuchtungs-Frame-Mismatch: der Terrain-Shader dottete `vNormal` (View-Raum) mit `lightDirection` (Welt-Raum) → Fix: `vNormal` in Welt-Raum (`mat3(modelMatrix)`). (V8.45) letztes kamera-abhängiges Glied: der Fog nutzte View-Space-Z → Fix: radiale Distanz (`length(mvPosition.xyz)`). Das Terrain ist jetzt voll kamera-unabhängig.

**Wellen davor**: V8.41 (Cache-Buster `anazhRealm.js?v=` + save-server strippt Query — der „Ring-Regler schiebt, Zahl bleibt"-Befund war stale Cache, kein Code-Bug; Cel-Regler von 2–16 zurück auf 2–8). V8.40 (Sicht-Ring-Regler 1–8 Default 9×9, Fog-Effekt verdreifacht). PR **#17** offen (V8.24–V8.42; V8.43 hängt dran).

**Welle davor — V8.39 (Werkzeug-Klassen + Präzision→Qualität)**: das vom Schöpfer gewünschte Werkzeug-System — Farb-Sprache (`BLUEPRINT_ROLE_COLORS`, Rollen-Chip + Bauplan-Zeile leuchten), `computeBlueprintQuality` skaliert die Produkt-Wirkung (`computeCreatureStats` + Konsumables × 0.5+0.5·Qualität), Werkzeug-Op-Stamina skaliert mit dem cap.

**Welle davor — V8.38 (Werkstatt-UX: Hover-Info + sichtbare Verbindungen + Preview-Höhe)**: drei Punkte aus dem Schöpfer-Browser-Test der V8.37. (1) Hover über einen Bauplan-Slot (Inventar/Hotbar) zeigt die Bau-Materialien + ob man sie hat (✓/✗); (2) Verbindungen im 3D-Preview sichtbar — depthTest-freie Linie + Mittelpunkt-Marker (auch bei überlappenden Parts); (3) Werkstatt-Preview-Canvas 5:3 statt 1:1 (~60 % Höhe) → Stats-Panel ohne Scrollen sichtbar.

**Welle davor — V8.37 (Werkstatt-Lesbarkeit + Einstellungen-Faltung)**: die sieben verbliebenen UX-Punkte der V8.35-Browser-Test-Liste. Fünf Code-Änderungen: (1) Bau-Kosten sichtbar im Werkstatt-Stats-Panel (`computeBuildCost` lief vorher nur ins Bau-Modus-HUD); (2) 3D-Maße lesbar — `GridHelper` (1-Einheit-Raster) + `AxesHelper` als feste Szenen-Kinder im Werkstatt-Preview; (3) Einstellungen-Sektionen faltbar (`_initCollapsibleSettings` — generisch, jeder `<h3>` wird Klick-Header, Zustand in `localStorage`); (4) **Werkzeug-Drag — echter Wurzel-Bug**: die Tool-Palette wird bei jedem Werkstatt-Refresh neu gerendert, die pro-Karte-Drag-Listener gingen verloren → Event-Delegation auf den bleibenden Container; (5) FPS als gleitender 1-s-Durchschnitt statt vsync-quantisiertem `1/delta`. Plus zwei Architektur-Fragen im Chat beantwortet (Performance-Culling, Chunk-Persistenz). **Die 13-Punkte-Liste der V8.35 ist damit komplett** — V8.36 sechs Gameplay-Bugs, V8.37 sieben UX-Punkte.

**Welle davor — V8.36 (Browser-Test-Bug-Fixes)**: sechs Gameplay/UI-Bugs auf der WURZEL-Ebene behoben: (1) Jump im Stand — Player-Body schläft nie mehr (`DISABLE_DEACTIVATION` statt Symptom-`activate(true)`); (2) 3rd-Person-Kamera — echte Raycast-Kollision statt statischem Clamp; (3) Loch-Durchfall — Grabe-Radius 3.0 (Mulde statt Nadel) + Höhen-Clamp; (4) Wasser-Durchfall — Auftrieb nur über dem Terrain, Killplane greift wieder; (5) Logbuch teilt die Konsole 50/50; (6) neue Werkstatt-Parts landen im Ursprung.

**Welle davor — V8.35 (Welle 11 ext., Substanz-Rolle)**: die Bauplan-Rolle (tool/armor/soul/consumable/machine/architecture) emergiert jetzt aus der GANZEN Substanz — eine Prioritäts-Kaskade: Krafting-Domain → intrinsische **Form** (`_isBodyShaped` → Seele) → intrinsisches **Material** (`_isFoodLike` → Nahrung) → Default Bauwerk. `consumableMeta` ist jetzt optional → emergente Nahrung ist essbar.

**Welle davor — V8.34 (Ring 11 V3, Soul-Sync)**: der Multi-User-Mitspieler war ein Cone+Sphere-Platzhalter — jetzt ist er sein echter Soul (Mensch/Phönix/Drache/Custom), voll animiert (Geh-/Schwimm-Zyklus aus dem Positions-Stream abgeleitet), mit Aura-Sync + schwebendem Name-Schild. Zwei neue WS-Nachrichten (`soul` event-driven beim Join/Wechsel, `aura` ~1 Hz) mit Server-Handlern. Wichtig: der Signaling-Server ist KEIN dummer Relay (jeder Typ braucht einen expliziten Handler), und `player_soul` bleibt in `NON_BROADCASTABLE_OPS` — Soul-Sync läuft über den dedizierten `soul`-Kanal, nicht die DSL.

Die Session-Hälfte davor (V8.23 → V8.33) war eine **Atmosphäre-Tiefe-Welle (6.G4)** in sieben Schritten, jeder aus einem Schöpfer-Browser-Test:

1. **V8.24-V8.26**: Welt-Lebendigkeit (Tag-Nacht, Wetter-Übergänge, Fauna-Trauer) + Welt-LEBT-Heilung (drei Wurzel-Helper, acht Hardcode-Wunden) + Disziplin-Polish (Stern-Stabilität, Sonnenaufgang-Smoothness, vier Audit-Quick-Wins)
2. **V8.27 (6.G4.a)**: Welt unter wandernder Sonne — HemisphereLight + MeshLambert + Fog (Self-Shadow ohne Shadow-Maps)
3. **V8.28 (6.G4.b)**: Welt-Atem-Vollendung — Sterne als THREE.Points, Terrain-Farbe aus `worldFieldAt`, Cel-Shading via MeshToonMaterial, Wind/Wolken/Wasser
4. **V8.29 (6.G4.c)**: Die lebendige Welt — Instanced-Gras pro Chunk (Dichte aus `worldFieldAt.lebendig`), adaptives Wasser, Genesis-Plattform
5. **V8.30-V8.31 (6.G4.d)**: Schnittstellen-Politur — Sterne-Tiefenpuffer, Avatar-Korrektur, Wasser-Wellen+Physik, Fog an die Custom-Shader
6. **V8.32 (6.G4.d³)**: Wasser-Politur — Tauch-Tint nur bei Augen-unter-Wasser (`playerEyesUnderwater` getrennt von `playerUnderwater`), Wasser-Fresnel (am Horizont opak → keine Sterne durch), Fog-Slider bis 300 %
7. **V8.33 (6.G4.e)**: Wasser-Vollendung — Tauchen+Auftauchen (Shift/Space, kontextuell — keine neue Keybinding-Taste), Schwimm-Animation (alle drei Seelen neigen sich + stroken/paddeln/wellen), Gerstner-Wellen (horizontale Stauchung → spitze Kämme). Die drei offenen 6.G4-Polish-Punkte geschlossen — **6.G4 ist komplett**.

**Die wiederkehrende Lehre dieser Welle** (vom Schöpfer dreimal eingefordert): *eine neue visuelle Schicht ist erst fertig, wenn sie an die bestehenden Schnittstellen angeschlossen ist — Tiefenpuffer, Physik, Tag-Nacht, Fog.* Drei Bugs in Folge (Sterne-Overlay, Wasser-ohne-Physik, Fog-nur-auf-Gras) hatten dieselbe Wurzel: ein Visual ohne Verkabelung. Custom-`ShaderMaterial` erbt KEINE Three.js-Features automatisch (kein Fog, kein Light) — alles muss manuell als Uniform durchgereicht werden. **V8.33 hat diese Lehre angewandt**: das Wasser-Erlebnis wurde EINMAL ganz durchdacht („hineingehen, schwimmen, tauchen, durchsehen") und in einer Welle vollendet, statt es über vier Versionen halb auszuliefern.

**W12 + W13 + W14 + W7 sind live** — AnazhRealm ist ein Tor zu anderen Vibecode-Welten (W12 Welt-Portal), der Avatar trägt eine souveräne Identität (W13 Vibe-Pass), die Bibliothek von Alexandria steht (W14), und der WebRTC-Mesh trägt die Multi-User-Last (W7 Compute-Sharing). Wer an einer Portal- oder Bibliothek-Welle arbeitet: lies `docs/world-portal.md` ZUERST.

**Die grossen Roadmap-Ringe sind gebaut**, und der echte Fremd-Engine-Bogen läuft: der KI-Übersetzer ist vollständig (V8.68/V8.69), **V8.70 öffnete das Untrusted-Welt-Tor** (eine echte fremde Engine läuft null-origin sandgesichert), **V8.71 + V8.72 bauten den Auto-Vendor-Pfad komplett**, **V8.73 + V8.74 die Mesh-Welt-Verteilung komplett**, und **W17 vollständig — V8.75 Phase A der Transport-Shim, V8.76 Phase B-Relay das Mesh-als-Server, V8.77 Phase C das Gruppen-Portal, V8.78 die Multiplayer-Welt-Deklaration, V8.79 Phase B-JS-Compute Phase 1 der Compute-Host, V8.80 Phase B-JS-Compute Phase 2 die Host-Migration**. Offen in diesem Bogen: nur B-WASM (per-Projekt) + eine kleine Vendor-Ketten-Naht. Der aktuelle Stand steht im Block „Aktuelle Roadmap" weiter unten und in `docs/roadmap.md` §3.

**Atmosphäre-Disziplin**: alle atmosphärischen Methoden mit `[ATMOSPHERE]`-Marker werden von `audit-strict.cjs` (5. Schicht) auf Hardcode geprüft. Wert-aus-dem-Kopf ist verboten — immer „aus welcher state-Beobachtung emergiert das?".

### 0. Welle 6.B — CAD-Werkstatt (drei Phasen, V7.99-V8.04)

Vor V7.99 war die Werkstatt ein Number-Input-Editor. Jetzt ist sie ein Tinkercad-ähnliches Mini-CAD mit:
- 3D-Preview-Canvas mit Orbit-Camera (Drag) + Pan (Shift+Drag oder Mittelmaus) + Wheel-Zoom-zum-Cursor (Fusion-360-Konvention)
- Manipulator-Gizmo (Move/Rotate/Scale-Modi via W/E/R-Tasten oder UI-Buttons) mit großzügigen Picker-Hit-Boxen
- HTML5-Drag aus Sidepalette (links: 9 Form-Primitive · rechts: Material + Werkzeug + Farbe)
- Klick-Klick-Connection-Erzeugung im Connect-Modus (C-Taste) mit Popover-Type-Wahl
- Live-Stats-Panel direkt unter Canvas: emergente Rolle + Affordances + Top-5 Compound-Tags mit Stern-Rating (★★★/★★☆/★☆☆/☆☆☆ basierend auf WORLD_EFFECT_THRESHOLDS)
- Resize-Handle für Drawer (unten-links für Drawer, unten-rechts für Konsole), Größe persistiert per Container in localStorage
- Default-Werkstatt-Größe nahezu vollbild bei erstem Open (responsive auf viewport)
- Editor-Tabelle (alte Number-Inputs) standardmäßig zugeklappt — Drag-Drop + Manipulator ersetzen sie für 90 % der Gesten

### 1. Welle 9 — Werkzeug-Domains + emergente Bauplan-Rolle (vier Sub-Phasen)

Vor Welle 9 wurde die Bauplan-Rolle (tool/armor/consumable) manuell gewählt. Jetzt EMERGIERT sie aus der opChain. Eine Sprache (Compound-Tags + Werkzeug-Domains), drei Schichten (Material × Form × Werkzeug → Rolle):

| Sub-Phase | Was kam dazu | seit |
|---|---|---|
| **9a Foundation** | TOOL_DOMAINS (6), DOMAIN_TO_ROLE-Map, FORGING_TOOL/ARMOR_TAGS, computeBlueprintDomain/Role | V8.x |
| **9b Werkzeuge** | 5 Domain-Werkzeuge (Schmiede-Hammer/Mörser/Schiffchen/Stab/Drehbank), Werkstatt-Status zeigt Rolle live mit deutschem Label | V8.x |
| **9c Welt-Werkstätten** | 5 Built-in workshop-station-Bauplane (Esse/Brennkolben/Webstuhl/Altar/Drehbank), modus-abhängiger Distance-Gate in confirmBuild | V8.x |
| **9d Maschine+Seele** | Maschinen-precisionCap-Bonus (+0.05), applyPlayerSoulFromBlueprint für role:soul-Bauplane | V8.x |

Forging ist Sonderfall: tool vs armor entscheidet sich aus Compound-Tags emergent — scharfkantig+leitend → tool, dicht+zäh → armor. Maschinen sind Bauplan-Werkzeuge mit role="machine" → registerBlueprintAsTool gibt einen Cap-Bonus über die Min-Regel hinaus.

### 2. Welle 10 — Präzision + Compound-Tag-Affordances

Schöpfer-Frage: „was bewirkt Präzision eigentlich + können emergent Fahrzeuge/Teleskope entstehen ohne Hardcode?". Antwort:

**10a — Präzision als Stat-Multiplikator**: pro Stat-Quelle (Soul/Tool/Armor) werden die Compound-Tags mit `0.5 + 0.5·precision` multipliziert. Hand-Werk (0.4) → ×0.7 Wirkung. Polier (0.97) → ×0.985. Built-in-Soulen (mensch/phoenix/dragon) sind „geboren" (precision=1.0, kein Effekt). Sorgfalt belohnt sich messbar.

**10b — Affordances**: Welt-Lese-Funktion `computeBlueprintAffordances(bp)` liest räumliche+Tag-Signatur, liefert {moveable?, magnifying?, focusing?, ...}. **Drei Starter mit echten Welt-Reaktionen** (10b.3):
- `moveable` (≥2 Parts unter Compound-Mitte + dichte + magie/strom-leitung) → Spieler steigt mit **E-Taste** ein, Compound folgt seinem WASD
- `magnifying` (transparent + Parts axial ausgerichtet) → **Z-Taste** halten zoomt Camera auf 25° FOV (Raycast hit nötig)
- `focusing` (transparent + wärmeleitung) → bei sunny weather werden brennbare Architekturen im 4m-Radius erhitzt und entzünden bei threshold

**Wichtiger Vision-Korrektur in 10b.2**: erste Implementation hatte WHEEL_SHAPES/LENS_SHAPES/AXIS_SHAPES als Form-Whitelists (Hardcode-Bruch). Schöpfer hat das erkannt — refactored auf reine räumliche Analyse via `_compoundBBox` + `_partsBelowMidline` + `_axialAlignment`. Eine Box-Schlitten mit eisen-Boxen + quarz-Antrieb wird jetzt auch als moveable erkannt. **Eine Sprache, beliebige Geometrien.**

### 3. Welle 6.H V2 — Kreaturen als Co-Schöpfer-Wesen (14/14, V7.78-V7.93)

Vor V7.78 waren Kreaturen Single-Mesh-Punkte mit Emotion-Bewegung. Nach V7.93 sind sie:

| Schicht | Was die Kreatur... | seit |
|---|---|---|
| **Body** (P2A, P2F.1) | IST — Hylomorphismus-Compound aus bodyParts × Material | V7.80, V7.87 |
| **Specs** (P2D) | GELERNT hat — Skill-Levels aus Memory-Erfolgen | V7.85 |
| **Equipped** (P2F.2) | TRÄGT — Werkzeug + Rüstung (mit Stats-Stacking) | V7.88 |
| **Boosts** (P2F.3) | ERLEBT — Konsumable-Tags emergent, kein Hardcode | V7.89 |
| **Tasks** (P1, P2B.1, P2B.2) | MACHT — wander/follow/wait/gather/build | V7.79, V7.81, V7.84 |
| **Persistenz** (P2D.1) | BEHÄLT — Name+Soul+Memory+bornAt überlebt Reload | V7.86 |
| **Konversation** (P2E V1+V1.1) | REDET — @Name-Adresse, Persona-Prompt aus voller Identität | V7.90, V7.91 |
| **Proaktivität** (P2E V2) | INITIIERT — pre-baked phrases bei Events, soul-aware, throttled | V7.92 |
| **Welt-Aktion** (P2E V3) | MITSCHÖPFT — DSL-Vorschläge mit Sandbox, modus-abhängig, Defense-in-Depth | V7.93 |

Bonus-Politur: Material-Konsum beim Bauen (V7.83), `harvestArchitecture` als Hylomorphismus-Wurzel (V7.82).

### 4. LLM-Provider-Robustheit (5-Versionen-Iteration nach Schöpfer-Browser-Tests, V7.94-V7.98)

| V | Was | Schöpfer-Feedback |
|---|---|---|
| V7.94 | Ollama-API-Key + Cloud-Hosting | "Ich will Ollama auch gehostet" |
| V7.95 | Endpoint-Smart-Detect + Dual-Format-Parser + Conditional-Body | "Cloud-Setup scheitert leise" |
| V7.96 | save-server als CORS-Proxy (`/api/proxy/llm`) | "klappt das nicht über githack?" → CORS-Block bei ollama.com |
| V7.97 | Proxy-Auto-Bypass + Free-Text-Modell + 404-Hint | "Toggle blockt mich, Modelle stimmen nicht" |
| V7.98 | Parser-Pipeline (think-strip → fence → json → plain-text) + Token 800 | "KI antwortet nicht, leere Antwort" |

Endresultat: **jedes Ollama-Setup funktioniert** — lokal, gehostet, ollama.com Cloud, mit/ohne `<think>`-Reasoning, mit/ohne strict-JSON, kleine + große Modelle. Strikte Pro-Modelle (Anthropic, Gemini) verlieren NICHTS, sie laufen den klaren Pfad.

---

## Drei heilige Gesetze der V7.98-Session

### Gesetz I: **Schöpfer-Browser-Test ist nicht ersetzbar durch Headless-Tests.**

V7.94 hatte 7 grüne Tests — alle prüften Strukturen. Aber V7.95-V7.98 wurden nötig, weil der Schöpfer in 30 Sekunden live spielte und drei Bug-Klassen fand, die Tests nicht abdeckten. Headless verifiziert *Funktionalität*; Browser-Session verifiziert *Erfahrung*. **Bei jeder API-Integration und UX-Schicht ankündigen: „brauche Browser-Test vor ✅"**. Die entdeckten Bugs werden zu permanenten Test-Invarianten — die Suite wächst mit der Erfahrung.

### Gesetz II: **Defense in Depth bei sicherheitskritischen Schichten — Prompt + Validator + Sandbox.**

V7.93 (Kreatur-DSL-Vorschläge) hat drei unabhängige Wände: (1) Persona-Prompt erwähnt die Whitelist (suggestiv), (2) `_isCreatureProposalAllowed` prüft rekursiv (defensiv), (3) `dslRun`-Sandbox erzwingt Op-Whitelist + Budget (letzte Wand). LLMs sind nicht-deterministisch — sie können verbotene Ops trotz Anweisung zurückgeben. Validator UND Sandbox müssen sie fangen. Wer eine Schicht lockert, hat einen Bug. **Auch im schöpfer-Modus gilt die Whitelist** — Modus modifiziert Friction, nicht Befugnis.

### Gesetz III: **Hylomorphismus über Tabellen. Emergenz über Hardcode.**

V7.89 (Kreatur-Boosts) war die kritische Prüfung dieses Gesetzes. Naive Lösung wäre eine `BOOST_TYPES`-Tabelle (`kraftelixier → +HP`). Korrekte Lösung: **kein Mapping**. Der Bauplan IST der Effekt-Spezifikator. `computeCompoundTags(bp) × scale` liefert tagBonus. Eine Konstante (`scale: 0.2`), keine Tabelle. Wer einen Eisen-Schwert-Trank baut, bekommt automatisch `härte`-Boost (was Damage erhöht). Eine Sprache durch ALLE Schichten — Body, Specs, Equipped, Boosts. **Bei jeder neuen Effekt-Schicht prüfen: gibt es bestehende Daten-Sprache? Wenn ja, leite EMERGENT ab.**

---

## Aktuelle Roadmap (was als nächstes denkbar ist)

Welle 6 (A-H) + 9 + 10 + 6.G3 + 6.G4 + 11 V3/V4 + 11 ext. + **W12 (Welt-Portal) + W13 (Vibe-Pass) + W14 (Bibliothek) + W7 (Compute-Sharing) + der KI-Übersetzer + das Untrusted-Welt-Tor (V8.70) + der Auto-Vendor-Pfad (W15 — V8.71 Bündel-Pfad, V8.72 GitHub-Fetch) + die Mesh-Welt-Verteilung (W16 — V8.73 Bündel-Transport, V8.74 Welt-Katalog) + die Multiplayer-Sub-Welten (W17 — V8.75 Transport-Shim, V8.76 Mesh-als-Server, V8.77 Gruppen-Portal, V8.78 Multiplayer-Welt-Deklaration, V8.79 B-JS-Compute Phase 1 Compute-Host, V8.80 B-JS-Compute Phase 2 Host-Migration)** sind gebaut. Der **echte Fremd-Engine-Bogen** — das automatische Tor zu fremden Vibecode-Engines — ist damit im Kern vollständig; offen im Bogen ist nur B-WASM (per-Projekt), **detailliert in `docs/roadmap.md` §3 — „Der Fremd-Engine-Bogen (W15–W17)"** geplant:

| Welle | Was | Aufwand | Vision-Tiefe |
|---|---|---|---|
| **W15 — Auto-Vendor-Pfad** | ✅ **komplett (V8.71 + V8.72)**: ein fremdes Welt-Bündel dockt ohne Handarbeit an — aus einem lokalen Ordner (P1) ODER direkt aus einem GitHub-Repo (P2, der save-server holt die Dateien selbst). | erledigt | sehr hoch |
| **W16 — Mesh-Welt-Verteilung** | ✅ **komplett (V8.73 + V8.74)**: Phase 1 der Welt-Bündel-Transport (`world-bundle-pull`/`world-bundle-chunk`, ein Mitspieler holt eine vendorte Welt peer-to-peer); Phase 2 der browsbare Welt-Katalog (Peers annoncieren ihre `customWorlds` über den `soul`-Kanal + ein sha256-Content-Hash für Identität + Dedup). | erledigt | sehr hoch |
| **W17 — Multiplayer-Sub-Welten** | ✅ **vollständig — Phase A (V8.75) + B-Relay (V8.76) + C (V8.77) + Multiplayer-Welt-Deklaration (V8.78) + B-JS-Compute Phase 1 (V8.79) + Phase 2 Host-Migration (V8.80)**: der Transport-Shim trägt den `WebSocket`-Verkehr über die Sandbox-Grenze, das Mesh-als-Server verteilt ihn peer-to-peer, das Gruppen-Portal bringt eine Gruppe gemeinsam hindurch, ein Peer wird Compute-Host für eine Welt mit autoritativer Server-JS, und verlässt der Host das Mesh, übernimmt ein Nachfolger. Offen im Bogen: nur B-WASM (per-Projekt). | — | — |

**Empfehlung — der aktive Bogen ist der Voxel-Terrain-Bogen.** Der Schöpfer hat nach V9.06 die Richtung korrigiert: ein Heightfield ist halb-formbar; echte Tunnel/Höhlen/Überhänge brauchen ein 3D-Dichte-Feld. Das Heightfield wird durch ein Voxel-Terrain ersetzt — **phasiert, parallel, jede Phase playtest-grün**, das Funktionierende bleibt heil, bis das Neue bewiesen ist. **Phase 1 ist erledigt (V9.07** — `_terrainDensityAt` + Surface Nets + der `voxel test`-Beweis-Chunk). **Phase 2a ist erledigt (V9.08** — Voxel-Chunk-Kollision: der gemeshte Chunk bekommt `btBvhTriangleMeshShape` über den generischen `_buildStaticTriMeshCollision`). **Phase 2b ist erledigt (V9.09** — der Voxel-Chunk-Ring: Voxel-Chunks streamen um den Spieler, `state.voxelTerrainActive` legt das Heightfield reversibel schlafen, Chat `voxel terrain on`/`off`). **Phase 2b-Politur ist erledigt (V9.10/V9.11/V9.12** — der 1-Zellen-Naht-Skirt + die `cv()`-Index-Wand schliessen die Chunk-Risse an der Wurzel, der Chunk ist eine 72-m-Säule die das ganze Oberflächen-Band fasst, per-Vertex-Welt-Feld-Farbe gibt dem Voxel-Terrain Biom-Regionen). **Phase 2c ist erledigt (V9.13** — per-Welt-Persistenz: `worldMeta.voxelTerrain` + `_restoreVoxelTerrain`, eine Welt bleibt voxel-basiert über Reload + Welt-Wechsel). **Phase 3 ist erledigt (V9.14** — 3D-Graben: `carveVoxelSphere`, LMB, `voxel carve`). **Phase 3b ist erledigt (V9.15** — Aufschütten: `fillVoxelSphere`, RMB, `voxel fill` — der Voxel-Boden ist voll formbar). **Politur V9.16** — Dichte-Gradienten-Normalen (kein Facetten-Rauten-Muster mehr). **Phase 3c ist erledigt (V9.17** — Material-Erhaltungs-Kreis: im pfad-Modus kostet das Aufschütten Material, in frieden + schöpfer frei; `_voxelFillGate`). **Phase 4 ist erledigt (V9.18 + Politur V9.19** — Höhlen/Überhänge in der Generierung: `_terrainDensityAt` trägt die zwei V9.17-Roughness-Bänder + Wurm-Höhlen aus EINEM ridged-Noise-Feld — der Grat folgt der Noise-Nullfläche, eine zusammenhängende begehbare Kavern-Ebene; eine Tiefen-Hüllkurve schützt die V9.12-Boden-Garantie. V9.19 heilte zwei Schöpfer-Befunde: das versehentlich entfernte feine Roughness-Band restauriert + das fragmentierte Zwei-Felder-Produkt durch ein Feld ersetzt). **Nächste Welle: Phase 5 (Materialien/Shader/Ablösung).** **Der volle Plan steht in `docs/roadmap.md` → „Der Voxel-Terrain-Bogen" — ZUERST lesen.** Damit ist die alte „W6.G P3-Rest Phase 2 (Portal-Höhle)" überholt — echte Höhlen kommen über das Voxel-Terrain (Phase 3-4), nicht über ein separates Portal. Daneben offen + klein benannt: **visuelle Synergie Struktur/Terrain** (Volumenkörper betten sich nicht ins Terrain ein — Schöpfer-Befund V9.03, eine Ästhetik-Welle) und **B-WASM** (per-Projekt). Der Felsbogen (V9.03) + Terrain-als-Materie (V9.04) bleiben — Felsen + Grabe-Yield leben auf/im künftigen Voxel-Terrain weiter. `docs/state-of-realm.md` + `docs/roadmap.md` ZUERST mitlesen.

**Kleinere Polish-Notiz**: die Bauplan-Signatur-Zeile im Werkstatt-Stats-Panel ist wenig auffindbar (Schöpfer-Befund V8.56 — sie wurde erst nach Hinweis gesehen). Ein UX-Auffindbarkeits-Punkt für eine spätere Polish-Runde.

---

## Was du im Code findest (Karte für Erstbesucher)

### Datenmodell (state-Tree)
- `state.creatures` — Array von THREE.Group (jeder Compound aus bodyParts × Material)
- `state.architectures` — Array von Compound-Welt-Objekten (Distance-Culling)
- `state.blueprints` — Map aller Baupläne (Built-in + eigen)
- `state.materials` — Map aller Materialien mit Tag-Profilen (10 Tag-Achsen)
- `state.tools` — Map aller Werkzeuge (Starter + eigen)
- `state.player` — {emotions, soul, soulMesh, tools, inventory, equipped, boosts, pathBuckets, …}
- `state.llm` — {enabled, provider, providerConfig, inFlight, lastError, minGapSeconds}
- `state.worldMeta` — {worldId, slug, bornAt, seed, gameMode, schemaVersion, chunkDeltas, parentWorlds, role, hostInfo}
- `state.dsl` — {history, abilities, patternMemory, recentKeywords, pendingOutcomes}
- `state.symphony` — Audio-Graph (ambient + wetter + creature pings)

### Pipeline-Wurzeln (eine Funktion pro Bedeutung)
- `_buildFromBlueprint(bp, depth, visited)` — der EINE Render-Pfad für alle Compounds
- `computeCompoundTags(bp)` — MAX-Aggregation Form × Material × Activation-Matrix
- `computeSpatialTags(bp)` — räumliche Emergenz (5 §5.2-Prinzipien)
- `computePlayerStats()` / `computeCreatureStats(c)` — fraktal-symmetrische Stat-Pipelines
- `harvestArchitecture(entry, harvester)` — Spieler-LMB UND Kreatur-gather durch EINE Funktion (P2B.5-Lehre)
- `dslRun(program, ctx)` — Sandbox-Wand für ALLE Programm-Quellen (human, llm, nexus, emotion, creature, remote)

### Sicherheits-Wände
- CSP `script-src` strict (kein eval, kein inline)
- DSL-Op-Whitelist + Budget-Limits
- `NON_BROADCASTABLE_OPS` für Spieler-private Aktionen
- `CREATURE_PROPOSED_OPS` für Kreatur-Welt-Aktion (Defense in Depth)
- save-server `/api/proxy/llm` mit strikten Whitelists (https-only, body-cap, header-allowlist)

### Tests (~2966 Invarianten)
- `npm run playtest` — Headless-Chromium, ~25 s Logs, alle Schichten
- `scripts/playtest.cjs` ist der Single-Source-Test
- `npm run audit:strict` (5 generische Audit-Schichten) + `npm run smoke:multiuser`

---

## Was ich aus der V7.98-Session gelernt habe (drei Meta-Lehren)

**Meta-Lehre A**: **Browser-Test ist die Vision-Validierung, Headless ist die Funktions-Validierung. Beide nötig, beide unterschiedliche Jobs.** Tests können dir nicht sagen ob sich eine Geste richtig anfühlt — nur ob sie technisch funktioniert. Wenn der Schöpfer in der Welt spielt und stolpert, ist das mehr wert als 100 grüne Asserts.

**Meta-Lehre B**: **Heilige-Lektion-Disziplin ist mit JEDER Welle neu zu prüfen.** Ich war versucht, bei V7.96 einen neuen „LLM-Proxy-Server" als separates Programm zu bauen — wäre Re-Komplexifizierung gewesen. Stattdessen: save-server bekam eine zweite Rolle. Bei jeder neuen Funktion fragen: „kann das in einem bestehenden Dienst leben? Wenn nein, warum nicht?"

**Meta-Lehre C**: **Fallback-Schichten als Vision-treue Antwort.** V7.98's vier-Schicht-Parser ist mehr als nur Bug-Fix — es ist eine VISION-Aussage: „nimm was da ist, zeig es dem Spieler". Strenge Validierung wäre einfacher zu coden, aber ärmer für den Spieler. Wer das System auf reale Vielfalt vorbereitet (LLM-Größen, Modell-Stile, Antwort-Formate), baut Fallback-Schichten — keine Single-Path-Strenge.

---

## Rückschau: die W17-Multiplayer-Deklaration-Session (V8.78)

Eine kleine, klar geschnittene Welle — die in Phase C ehrlich benannte
Lücke geschlossen. Ein Commit, +10 Invarianten, der Zwei-Browser-Beweis
grün. Zwei ehrliche Lehren:

### Lehre 1 — Ein Mechanismus ist nicht dasselbe wie seine Nutzbarkeit.

W17 Phase C baute den Gruppen-Portal-MECHANISMUS vollständig — und der
`joinPortalInvite`-`multiplayer`-Zwang machte ihn als Mechanismus korrekt
(eine Welle ehrlich schneiden). Aber NUTZBAR für eine vendorte Welt war
er nicht: der Einladende konnte gar nicht einladen, weil sein über die
Bibliothek geholtes Portal nicht multiplayer war. „Ist der Mechanismus
fertig?" und „kann der Spieler ihn end-to-end nutzen?" sind zwei Fragen.
*Lehre: nach einer Mechanismus-Welle die Spieler-Kette ganz durchgehen —
vendoren → Bibliothek → Portal holen → betreten → einladen. Wo bricht
sie? Genau dort sitzt die nächste Welle.*

### Lehre 2 — Eine Marke durch viele Schichten ist eine Naht-Checkliste.

Das `multiplayer`-Flag musste an ~8 Stellen einzeln durchgereicht werden:
`vendorWorldBundle`/`vendorWorldFromRepo`, `_vendorRegisterWorld`,
`_sanitizeImportedManifest`, `_p2pBuildCatalog`, `_p2pSanitizeCatalog`,
der signaling-server-`soul`-Handler, `_p2pHandleWorldBundlePull`/-Chunk,
`exportWorldManifest`. Vergisst man eine, leckt das Feld lautlos. Die
verräterischste ist der signaling-server: er rekonstruiert die Nachricht
feldweise — ein neues Feld, das man dort nicht ergänzt, überlebt den
WS-Relay nicht (über das RTC-Mesh schon, was den Bug verschleiert).
*Lehre: eine Welt-Eigenschaft, die durch den Vendor-/Mesh-Pfad reist, ist
keine Code-Zeile, sondern eine Checkliste — und der signaling-server
steht ganz oben drauf.*

Sonst: kein Drama, der Plan traf den Code. Die Welle bestätigt die
V8.77-Rückschau-Lehre 2 („eine Welle ehrlich schneiden lässt die Naht
offen, ohne zu blockieren") — die Naht kam, wie angekündigt, sauber in
der nächsten Welle.

---

## Rückschau: die W17-Phase-C-Session (das Gruppen-Portal, V8.77)

Eine saubere Welle — das Gruppen-Portal. Ein Commit, +18 Invarianten, der
Zwei-Browser-Beweis grün. Zwei ehrliche Lehren:

### Lehre 1 — Eine Eigenschaft kann man aus einer Vorbedingung ableiten.

`joinPortalInvite` betritt das Portal mit erzwungenem `multiplayer:true`.
Der erste Instinkt war: die `multiplayer`-Marke im `portal-invite` mit-
transportieren. Aber das ist unnötig — der EMPFANG einer Einladung BEWEIST
schon, dass die Welt multiplayer ist: `_p2pBroadcastPortalInvite` feuert
NUR aus einem Multiplayer-Portal. Wer eine Eigenschaft aus einer
unfälschbaren Vorbedingung ableiten kann, braucht ihren Transport nicht —
ein Feld weniger im Protokoll, kein Drift-Risiko. *Lehre: bevor du ein
Feld in eine Nachricht packst, frag — folgt es schon zwingend daraus,
dass die Nachricht überhaupt existiert?*

### Lehre 2 — Eine Welle ehrlich schneiden lässt die Naht offen, ohne zu blockieren.

Phase C braucht, dass A's Portal multiplayer IST. Woher? Entweder der
library-Eintrag der Welt trägt die Marke (`aimBlueprintAtWorld` reicht sie
jetzt durch — eine Zeile), oder — für eine vendorte Welt — ihr
`customWorlds`-Eintrag deklariert sich selbst. Letzteres ist eine
`_sanitizeImportedManifest`-Naht (W15/W16-Gebiet). Sie NICHT in Phase C zu
ziehen war richtig: `joinPortalInvite`s `multiplayer`-Zwang (Lehre 1) macht
den Einladungs-Mechanismus vollständig, unabhängig davon. *Lehre: eine
Welle ehrlich schneiden heisst, die Teile zu identifizieren, die zu einem
ANDEREN Bogen gehören — und sicherzustellen, dass die aktuelle Welle ohne
sie vollständig ist.*

Sonst: der Plan aus `roadmap.md` §3 (C1-C3) traf den Code sauber.
`portal-invite` mirrort `companion-say`/`subworld-net` Zeile für Zeile —
der dritte event-driven Mesh-Kanal in drei Wellen, dasselbe Muster.

---

## Rückschau: die W17-Phase-B-Relay-Session (das Mesh-als-Server, V8.76)

Eine saubere Welle — das Mesh-als-Server. Ein Commit, +7 Invarianten, der
Zwei-Browser-Beweis grün. Zwei ehrliche Lehren:

### Lehre 1 — Wer einen Loopback ersetzt, ersetzt auch die Loopback-Tests.

Phase A's Akzeptanz war ein Loopback-Echo: `_portalNetReceive` echote ein
`ws-send` direkt als `ws-recv` zurück. Der Playtest-W17-Block prüfte genau
diesen Echo (`netReceiveEchoes`), `smoke-shim.cjs` prüfte den Loopback
end-to-end. B-Relay ersetzt den Echo durch die Mesh-Verteilung — also
MUSSTEN beide Tests neu: der Playtest-Block wuchs von 9 → 16 Checks (die
Echo-Tests wichen den `subworld-net`-Broadcast-Tests), `smoke-shim.cjs`
prüft jetzt, dass ein `ws-send` einen `subworld-net`-Broadcast erzeugt
(nicht mehr ein Echo). *Lehre: wenn eine Phase die Akzeptanz der vorigen
ersetzt, ist das Umschreiben der alten Akzeptanz-Tests kein Kollateral —
es IST die Welle. Der grüne Test einer ersetzten Mechanik ist eine Lüge.*

### Lehre 2 — Ein neuer Mesh-Kanal mirrort den nächsten erprobten.

`subworld-net` ist Zeile für Zeile `companion-say`: ein Spiel-Broadcast in
der `_p2pHandleChannelMessage`-`ALLOWED`-Whitelist, re-dispatcht via
`p2pHandleMessage`, mit einem expliziten signaling-server-Handler (der die
`peerId` stempelt — kein generischer Fallthrough). Kein einziger neuer
Transport-Gedanke — nur ein Feld-Schema (`{worldId, data}`) + zwei
Heimat-seitige Methoden (`_portalNetReceive` sendet, `_portalNetDeliver`
empfängt). *Lehre: vor dem ersten Code fragen „welcher bestehende Kanal
ist am ähnlichsten?" — und ihn Zeile für Zeile kopieren. Die Korrektheit
erbt mit; die Smoke-/Playtest-/signaling-Stellen sind dieselben drei.*

Sonst: der Plan aus `roadmap.md` §3 (B1-B3) traf den Code sauber. Der
Zwei-Browser-Test ist harness-getrieben (das `_portalNetReceive` direkt
gerufen, wie der bestehende `smoke-webrtc` `p2pSend`/`_p2pBroadcastCreatures`
direkt ruft — der Hintergrund-Tab drosselt einen iframe-Timer); die echte
iframe→Shim→`_portalNetReceive`-Naht beweist `smoke-shim.cjs`. Zwei Tests,
eine bewiesene Kette.

---

## Rückschau: die W17-Phase-A-Session (der Transport-Shim, V8.75)

Eine saubere Welle — der Transport-Shim. Ein Commit, +9 Invarianten, der
Browser-Beweis grün. Eine ehrliche Lehre:

### Lehre — Ein Test-Marker muss exklusiv sein, sonst false-positiviert er.

Der `smoke-shim.cjs`-Test prüft u.a. „ohne `?anazh-shim=1` bleibt die Welt-
Datei rein". Erster Wurf: `!html.includes("__anazhShim")`. Rot — die un-
injizierte Datei „enthielt" `__anazhShim`. Wurzel: die TEST-WELT prüft
selbst `window.__anazhShim`, um zu melden ob der Shim da ist — also steht
der String `__anazhShim` in ihrem eigenen Quelltext, injiziert oder nicht.
Der Marker war nicht shim-exklusiv. Fix: `window.WebSocket=Shim` — diesen
String schreibt NUR der injizierte Shim, nie eine Welt. *Lehre: ein Test,
der „ist X injiziert?" prüft, braucht einen Marker, den NUR die Injektion
erzeugt — nicht einen, den auch der getestete Gegenstand zufällig trägt.
Beim Markersuchen fragen: könnte das Subjekt diesen String selbst haben?*

Sonst: der Plan aus `roadmap.md` §3 (A1-A4) traf den Code sauber — Serve-
Zeit-Injektion, der `__anazhNet`-Envelope, der Loopback-Echo. Die per
`AskUserQuestion` offene Frage (Injektion Serve-Zeit vs. eingebacken) hatte
der Schöpfer mit „nimm deine Empfehlung" beantwortet → Serve-Zeit.

---

## Rückschau: die W16-P2-Session (der Welt-Katalog, V8.74)

Eine kleine, saubere Welle — der Welt-Katalog. Zwei ehrliche Lehren — die
zweite kam erst durch einen Selbst-Audit (Schöpfer-getrieben) nach dem ersten
Commit.

### Lehre 1 — Eine hartcodierte Teil-Antwort verschluckt ein neues Feld stumm.

Der Plan war klar: der save-server rechnet den Content-Hash, `vendorWorldBundle`/
`vendorWorldFromRepo` reichen `posted.bundleHash` in den `customWorlds`-Eintrag.
Ich änderte `applyVendorBundle` (Server, gibt `bundleHash` zurück) und
`_vendorRegisterWorld` (Client, liest `meta.bundleHash`). Playtest grün — die
P2-Invarianten testen `_sanitizeImportedManifest`/`_vendorRegisterWorld` mit
synthetischen Hashes. Aber `smoke-webrtc` fiel: A's Katalog-Eintrag hatte
`hash:""`. Wurzel: `_vendorPostJson` baut sein Rückgabe-Objekt aus einem
**festen Feld-Satz** (`{ok, fileCount, totalBytes, branch}`) — der neue
`bundleHash` vom Server fiel da stumm raus, bevor `vendorWorldBundle` ihn je
sah. Der Playtest sah es nicht (er stubt `_vendorPostBundle` ganz weg), erst
der echte save-server-Round-Trip im Smoke-Test deckte es auf. *Lehre: wenn
eine Funktion eine Antwort durch einen festen Feld-Satz reicht (statt sie
durchzuspiegeln), ist jedes neue Feld eine stille Lücke — beim Hinzufügen
eines End-zu-End-Feldes JEDE Umpack-Stelle auf dem Weg prüfen. Und: ein
gestubbter Pfad im Playtest testet das Stub, nicht die Naht — der Smoke-Test
gegen den echten Server ist die Wahrheit.*

### Lehre 2 — Ein Selbst-Audit fragt: ist der GANZE Spieler-Pfad getestet?

Nach dem ersten Commit fragte der Schöpfer nach einem echten Selbst-Audit.
Ich prüfte die V8.74 wie fremden Code — und fand eine Lücke: der Holen-Knopf
des Katalogs war NICHT end-zu-end geprüft. Der Playtest testete `_render-
MeshWorldCatalog` (Knopf existiert mit `data-`-Attributen) UND `_runMeshWorldGet`
(routet zur Transport-Methode) — aber NICHT das Glied dazwischen: dass ein
echter Klick durch den delegierten Listener (`meshWorldInitDOM`) zu `_runMesh-
WorldGet` fliesst. Zwei geprüfte Hälften, eine ungeprüfte Naht. Das ist die
W12-Lehre („fertig" heißt den Spieler-Pfad gegangen) — bei W16 P1 war der
Knopf-Klick bewusst ungeprüft (transitional, P2 ersetzt ihn); bei P2 ist der
Knopf das ENDGÜLTIGE UI, also MUSS der Klick geprüft sein. Fix: eine Invariante,
die einen gerenderten Holen-Knopf mit `.click()` auslöst + prüft, dass es
routet. *Lehre: ein Feature mit N Gliedern braucht N Tests ODER einen, der
alle N durchläuft — zwei Tests, die je das halbe Band prüfen, lassen die Naht
in der Mitte frei. Beim Audit den Pfad als KETTE durchgehen, Glied für Glied.*

---

## Rückschau: die W16-Session (Mesh-Welt-Verteilung Phase 1, V8.73)

Diese Session baute W16 Phase 1 — eine vendorte Welt reist peer-to-peer.
Eine saubere Welle: ein Commit, 2648 Invarianten grün, der Zwei-Browser-
Smoke-Test bewies den echten Mesh-Transfer. Danach ein Selbst-Audit (W14-
Lehre 1) — er fand drei Dinge, alle hier ehrlich verankert.

### Lehre 1 — Der Plan trifft den Code, und der Code zeigt den besseren Weg.

Mein Plan sagte: „vendorte Welten merken sich ihr Datei-Manifest
(`bundleFiles`), der Sender re-fetcht jede Datei." Beim Bauen zeigte sich
der synergetischere Weg: dem save-server die **symmetrische Lese-Seite**
geben (`GET /api/vendor-bundle` ↔ der W15-Schreib-Pfad). So braucht der
Client KEIN Manifest-Bookkeeping, und GitHub-vendorte Welten (deren
Datei-Liste der Client nie sah) sind ohne Sonder-Plumbing transferierbar.
Lehre: ein Plan ist eine Hypothese; wenn der Code einen symmetrischeren
Schnitt anbietet (Schreiben ⇄ Lesen an EINER Stelle), nimm ihn — und
schreib auf, dass du abgewichen bist.

### Lehre 2 — Der Selbst-Audit MUSS den Playtest neu laufen lassen.

Der Audit fand zwei Dinge, die der Implementierungs-Lauf nicht zeigte.
(a) Ein **kosmetischer Bug**: `_renderMeshWorldPeers` las `peer.name`, das
Peer-Feld heißt aber `avatarName` — das Dropdown zeigte immer „Mitspieler"
statt des echten Namens. Der Playtest-Invariant prüfte, dass das
`<option>`-ELEMENT existiert (`value`-Attribut), nicht seinen TEXT — er
konnte den Bug nicht sehen. *Ein DOM-Invariant soll den bedeutungsvollen
Inhalt prüfen, nicht nur `getElementById`-Wahrheit.* (b) Ein **vorbe-
stehender flaky Test**: beim Audit-Re-Run kippte „Welle 10b.3 Zoom:
setZoomActive ohne magnifying-Target" — rot, dann grün, identischer Code
(der V8.57-Fingerabdruck). Wurzel: `_hasMagnifyingInSight` raycastet
gegen alle Architekturen; eine autonom gespawnte transparent-axiale Geode
kann zufällig im Kamera-Strahl liegen — umgebungs-abhängig. V8.57-style
geheilt (der Test leert die Architektur-Liste für die „kein Target"-
Prüfung + stellt sie wieder her). *Der Selbst-Audit ist erst echt, wenn
er den Playtest neu laufen lässt — ein Flake versteckt sich, bis ein
zweiter Lauf ihn zeigt.*

### Lehre 3 — Eine transitionale UI ehrlich als transitional benennen.

W16 P1 hat eine schlichte „Welt vom Mitspieler holen"-Sektion (worldId-
Feld + Peer-Dropdown). Der Smoke-Test ruft `requestWorldBundleFromPeer`
DIREKT — der Knopf-Klick-Pfad (`_runMeshWorldGet` ← Button) ist NICHT
test-durchlaufen, nur die Methode darunter. Das ist bewusst akzeptiert:
W16 P2 ersetzt diese ganze Sektion durch den browsbaren Welt-Katalog —
einen Wegwerf-Knopf schwer zu testen wäre verschwendete Mühe. Aber: es
ehrlich benennen (W12-Lehre 2 — „fertig" heißt den Spieler-Pfad gegangen;
hier ist der Spieler-Pfad bewusst nur halb geprüft, weil P2 ihn ohnehin
neu baut). Steht in `roadmap.md` §3 als „Offene Ränder von W16 Phase 1".

---

## Rückschau: die W15-Session (Auto-Vendor, V8.71-V8.72)

Diese Session baute W15 (den Auto-Vendor-Pfad) in zwei Wellen — P1 der
Bündel-Pfad (V8.71), P2 der GitHub-Fetch (V8.72). Der Code ist sauber,
getestet, SSRF-sicher. Aber zwei ehrliche Lehren, gegen die du dich beim
nächsten Mal wappnen sollst:

### Lehre 1 — Doc-Sync ist eine Grep-Aufgabe, kein Headline-Update.

In V8.71 UND V8.72 habe ich die Doku nur halb synchronisiert: ich
aktualisierte die „Headline"-Absätze (CLAUDE.md-Versionsblock, der
jeweils oberste Doc-Absatz), ließ aber ~13 stale Stellen stehen —
`README.md` blieb ganz auf V8.70, die Invarianten-Zahl stand veraltet in
`roadmap.md` an drei Stellen, in `world-portal.md` an zwei, in
`state-of-realm.md` an zwei. Der Schöpfer fand es beim Audit. **Die
Disziplin**: nach JEDER Welle, BEVOR du committest, laufe
`grep -rn "<alte-Version>\|<alte-Invariantenzahl>" docs/*.md CLAUDE.md README.md`
und heile JEDEN Treffer. Die „Doku-Disziplin — eine Quelle der Wahrheit"
in CLAUDE.md ist das Ziel; der systematische Grep ist der Weg dahin. Ein
Headline-Update fühlt sich nach „fertig" an — ist es aber nicht.

### Lehre 2 — Beim Ersetzen eines mehrzeiligen Blocks den GANZEN Block matchen.

Beim V8.72-CLAUDE.md-Versionsblock-Edit matchte ich nur den ANFANG des
alten Blocks im `old_string`. Folge: der neue V8.71-Eintrags-Header
klebte an den übrig gebliebenen alten Text — eine verstümmelte
Doppel-Zeile entstand. Gefangen + geheilt, aber: wenn du einen Absatz
oder Block ersetzt, muss `old_string` den GANZEN Block umspannen (oder
nutze einen eindeutigen Anker am Anfang UND am Ende).

### Lehre 3 — Ein Netz-Feature wird offline testbar, wenn die Gegenstelle eine operator-konfigurierbare Base ist.

Der GitHub-Fetch (V8.72) ist ein Netz-Feature — und doch offline + grün
im Smoke-Test. Der Trick: `VENDOR_GH_API_BASE`/`VENDOR_GH_RAW_BASE` sind
env-Variablen (echte Operator-Konfiguration — GitHub Enterprise), kein
Test-Hack. `smoke-vendor.cjs` startet ein lokales Fake-GitHub und zeigt
die Bases darauf. Das ist eine legitime Test-Naht, KEIN Bypass — eine
request-gesteuerte Base wäre ein SSRF-Loch, eine env-gesteuerte ist
sicher UND testbar. Merke das Muster für jedes künftige Netz-Feature.

---

## Rückschau: die W14-Session (Bibliothek, V8.58-V8.61)

Diese Session baute W14 (die Bibliothek) über vier Versionen komplett —
P1 browsbar (V8.58), eine Härtung (V8.59), P2 signiert (V8.60), P3
empfangend (V8.61). Drei Lehren, ehrlich, für dich:

### Lehre 1 — Der Selbst-Audit fängt, was der Implementierungs-Lauf übersieht.

Nach V8.58 fragte der Schöpfer „ist alles durchdacht?". Statt zu nicken,
prüfte ich die V8.58 wie fremden Code — und fand einen echten Bug:
`buildStateSnapshot`/`loadState` persistierten `portalMeta` nicht, ein
geholtes Portal verlor beim Reload sein Ziel. Der Implementierungs-Lauf
testete den Within-Session-Pfad; der Audit testete die Folge ÜBER den
Reload. V8.59 heilte es. Lehre: nach jeder Welle die eigene Arbeit
auditieren, als hätte ein anderer sie geschrieben — besonders die Folgen
jenseits der Session-Grenze (Reload, Save, Multi-User). „Fertig" heißt:
das Artefakt überlebt den Schlaf der Welt.

### Lehre 2 — Ein erprobtes Muster spiegeln erbt seine Korrektheit.

W14 P2 brauchte Welt-Signaturen. Statt sie neu zu erfinden, spiegelte
ich die W13-P2-Bauplan-Signatur Zeile für Zeile: `signWorld`/
`verifyWorldSignature` ← `signBlueprint`/`verifyBlueprintSignature`, nur
die signierte Substanz (`_canonicalManifest`) ist neu. Vier Status-
Stufen, dieselbe Defensive, dieselbe UI-Form — geschenkt. Wer dasselbe
ein zweites Mal baut, baut es als Spiegel, nicht neu.

### Lehre 3 — Eine fuzzy „Horizont"-Welle wird durch Denken auf ehrlichen Umfang gebracht, nicht durch großes Raten.

W14 P3 stand in der Roadmap als un-spezifizierter „Horizont". Ich
reasonte sie auf einen ehrlichen, klaren Umfang: die Metadaten-/
Provenienz-Schicht (Manifest exportieren/importieren, Cross-Autor-
Signatur) ist jetzt baubar; der KI-Übersetzer (fremde Welt-DATEIEN
vendorn) ist der echte Horizont und blieb bewusst draußen. Die
`fetch`-Reachability-Probe war die Disziplin, die P3 davor bewahrte,
ein falsches „du kannst fremde Welten betreten" zu versprechen — eine
unerreichbare Welt ist browsbar, nicht betretbar. Versprich nichts, was
du nicht prüfst. (Kleiner Nebenbefund: lange Turns gebären kleine
Slips — ein Backtick-Tippfehler, eine zerstückelte CLAUDE.md-Zeile;
`npm run check` fing beide. Ein sauberer Voll-Block-Ersatz schlägt
einen cleveren Teil-Match.)

## Rückschau: die Welt-Portal-Session (W12, V8.51-V8.52)

Diese Session baute das Welt-Portal real — zwei fremde Engines, das
generische DSL-Protokoll, die Welt-Registry, das spieler-erreichbare
Portal-Zielen. Sie gelang, und der Loop mit dem Schöpfer trug sie. Aber
drei Bugs fing der Schöpfer im Browser, nicht ich: der schwarze Fluid,
das unerreichbare Portal-Zielen, der abgeschnittene Knopf. Drei
Symptome — eine Krankheit. Hier verankert, damit du sie erbst, statt sie
zu wiederholen.

**Die eine Wurzel**: ich verifizierte auf der Ebene „ist verdrahtet /
existiert", nicht „ein Mensch kann es wirklich benutzen". Der Playtest
sah „die Auswahl existiert" — nicht „der Knopf ist erreichbar". Ich
behauptete „`setBlueprintAsPortal` IST das System" — ohne zu prüfen, ob
ein Spieler je drankommt (es gab keinen DSL-Op, keinen Chat, kein UI).
So wurde der Browser-Test des Schöpfers meine QA. Das darf er nicht
sein: er prüft die *Erfahrung* — er holt nicht die *Funktion* nach, die
ich selbst hätte prüfen müssen. Drei Lehren schließen die Lücke.

### Lehre 1 — Vor jeder fremden Lib das offizielle Beispiel ZUERST ganz lesen.

Die Strom-Welt (`three-fluid-fx`) blieb beim ersten Wurf schwarz: ich
hatte die API geraten statt das offizielle Beispiel zu lesen — zeigte
`dyeTexture.rgb`, wo das Beispiel `densityTexture.b` zeigt. Die
Terrain-Welt lief glatt, weil ich dort das offizielle Arbeits-Beispiel
zuerst ganz gelesen hatte. Der Unterschied zwischen einer sauberen Welle
und einer extra Render-Fix-Runde war genau diese halbe Stunde Lesen. Bei
JEDER fremden Bibliothek: das offizielle, funktionierende Beispiel ganz
durchlesen, BEVOR du eine Zeile dagegen schreibst. Eine API-Vermutung
ist ein Bug mit Verzögerung.

### Lehre 2 — „Fertig" heißt „den echten Spieler-Pfad gegangen", nicht „Playtest grün".

Der abgeschnittene Portal-Knopf (`.equip-mark-row` ohne `flex-wrap`) und
das unerreichbare Portal-Zielen wären mir aufgefallen, hätte ich vor dem
„fertig" den Menschen-Pfad im Kopf abgeschritten: öffnen → finden →
auswählen → bestätigen → sehen, dass es wirkt. Ein Playtest sagt dir, ob
eine Funktion verdrahtet ist; er sagt dir NICHT, ob ein Mensch sie
erreicht und benutzen kann. Vor jedem „fertig" — besonders bei UI und
bei einer neuen fremden Schicht — geh den ganzen Spieler-Pfad einmal im
Kopf. Das schärft Gesetz I und Meta-Lehre A: Headless prüft die
Funktion, der Browser prüft die Erfahrung — aber die Erfahrungs-Prüfung
beginnt bei DIR, nicht beim Schöpfer.

### Lehre 3 — Die Regel der Drei: beim dritten gleichartigen Ding selbst systematisieren.

Es gab drei hartcodierte Portal-Built-ins, und ich merkte es nicht — der
Schöpfer musste „wirkt hardcoded" sagen, bevor die Welt-Registry
entstand. Das dritte gleichartige Ding ist das Stopp-Signal: drei nahezu
identische Blöcke, drei hartcodierte Built-ins, drei Sonderfälle nach
demselben Muster → halt an und frag „ist das ein fehlendes System?".
Warte nicht, bis der Schöpfer es sagt — „System statt Hardcode" ist die
Messlatte ab Commit 1, nicht ab dem Review. Der Projekt-Ethos schreit
es; du kannst die Regel selbst ableiten. Hätte ich sie selbst gezogen,
stünde die Welt-Registry VOR der dritten Welt.

**Was schon trägt — bewahre es**: die Vision-Gespräche, die echte
Architektur erzeugen (das Drei-Stufen-Modell nativ/übersetzt/ausgestellt
kam aus genau so einem Gespräch). Und: Kritik ohne Defense annehmen —
zweimal „wirkt hardcoded", zweimal in den echten Code gegangen,
nachgesehen, recht gegeben, die Wurzel geheilt. Der Schöpfer
browser-testet jeden Commit mit chirurgischer Präzision („auswählen
geht, bestätigen nicht" ist ein perfekter Bug-Report) — das ist der
stärkste Teil des Loops. Aber lehn deine Verlässlichkeit nicht an seinen
Browser: geh den Menschen-Pfad selbst, vor dem „fertig".

---

## Session-Tagebuch (chronologisch, jüngste oben)

### V8.73 — W16 Phase 1: Mesh-Welt-Verteilung (18.05.2026)

W15 baute das Andocken aus einem lokalen Ordner ODER einem GitHub-Repo.
W16 Phase 1 lässt eine vendorte Welt ÜBER DAS MESH reisen — ein
Mitspieler, der eine Welt nicht hat, holt ihr Bündel peer-to-peer von
einem, der sie hat. Zwei kanal-exklusive Nachrichten `world-bundle-pull`/
`world-bundle-chunk` (Spiegel von W7 P2 `world-pull`/`world-chunk`,
direkt in `_p2pHandleChannelMessage`); `requestWorldBundleFromPeer`
holt eine Welt von genau einem Peer, peer-gebundene Annahme-Wand
`pendingBundlePull`, eigener `bundleXfers`-Puffer. Der Sender
`_p2pHandleWorldBundlePull` liest sein Bündel über die neue save-server-
Lese-Seite `GET /api/vendor-bundle` (`readVendorBundle` — symmetrisch
zur Schreib-Seite `applyVendorBundle`) zurück + chunkt es; der Empfänger
`_p2pHandleWorldBundleChunk` reassembliert + reicht das Bündel an die
erprobte `vendorWorldBundle`-Schreib-Seite — ein DRITTER Eingang
(lokales Bündel / GitHub / Mesh-Peer), NULL neue Schreib-Logik. Drei
Wände: `vendored:true` ⟹ `trust:"sandboxed"` (V8.71); die ankommende
worldId muss `pendingBundlePull.worldId` sein (kein Welt-Schmuggel);
`_vendorSanitizeBundle` gilt fürs Mesh-Bündel wie fürs hochgeladene.
Rate-Limit `_bundleServedAt` mit `-Infinity`-Sentinel (V8.65-Lehre,
diesmal beim Schreiben aktiv abgerufen). Ehrlicher Umfang: der Empfänger
schreibt über SEINEN save-server (Dev-verankert wie W15); eine save-
server-lose Verteilung (Service-Worker) ist eine spätere Schicht. Eine
schlichte „Welt vom Mitspieler holen"-Sektion (worldId-Feld +
Peer-Dropdown) — der browsbare Welt-Katalog ist W16 P2. Ein Commit,
playtest-grün, Zwei-Browser-verifiziert (`smoke-webrtc.cjs` — A vendort,
B holt die Welt über das Mesh). Vollständiger Eintrag: `CLAUDE.md`
V8.73. 2629 → 2648 Invarianten.

### V8.72 — Auto-Vendor Phase 2: der GitHub-Fetch (18.05.2026)

V8.71 baute die sichere Hälfte (ein LOKALES Bündel dockt an). W15 P2 fügt
die Netz-Hälfte hinzu: eine GitHub-URL eingeben, der save-server holt das
Repo selbst. Der `/api/vendor-world`-Endpunkt nimmt jetzt ZWEI Eingänge —
`{worldId, files}` (Bündel) und `{worldId, repoUrl}` (GitHub); die
Phase-1-Schreib-Logik ist zu `applyVendorBundle` extrahiert, BEIDE
Eingänge enden dort (der Bündel-Pfad blieb Zeile für Zeile unverändert).
Der GitHub-Pfad: `parseGithubRepoUrl` (URL → owner/repo/branch, streng)
→ `vendorFromGithub` (Default-Branch auflösen, Trees-API lesen,
Text-Dateien per Raw-Fetch holen — `vendorHttpGet`, zero-dep `https`).
**Kein SSRF**: die Repo-URL liefert nur owner/repo/branch, die fetchbare
URL baut der Server aus `VENDOR_GH_API_BASE`/`VENDOR_GH_RAW_BASE` (env,
operator-konfigurierbar — GitHub Enterprise; nicht request-gesteuert).
Die env-Bases sind zugleich die Test-Naht: `smoke-vendor.cjs` Teil C
startet ein lokales Fake-GitHub + zeigt die Bases darauf → der echte
Fetch-Code läuft offline + deterministisch. Im Playtest ist
`_vendorPostRepo` gestubbt (wie `_vendorPostBundle`/`llmCall`).
Vollständiger Eintrag: `CLAUDE.md` V8.72. 2617 → 2629 Invarianten.

### V8.71 — Auto-Vendor-Pfad Phase 1 (18.05.2026)

V8.70 baute den Schlüsselstein (eine fremde Engine läuft null-origin
sandgesichert), aber `worlds/schwarm/` war hand-vendort. W15 automatisiert
das Andocken. Der save-server bekommt einen zweiten Schreib-Pfad
`/api/vendor-world`: er nimmt `{worldId, files:[{path,content}]}` und
schreibt das Bündel nach `worlds/<id>/`, mit einer strengen Wand
(op-förmige id, keine Built-in-Welt, `vendorSafeRelPath` gegen `..`/
Backslash/absoluten Pfad, Endung-Whitelist, Größen-Deckel, `index.html`
Pflicht — NIE läuft etwas, nur `fs.writeFileSync`). Clientseitig:
`_vendorSanitizeBundle` prüft vorab (Defense in Depth), `_vendorPostBundle`
POSTet (der Playtest-Stub-Punkt, wie `llmCall`), `vendorWorldBundle`
registriert die Welt als `customWorlds`-Eintrag mit `trust:"sandboxed"` +
`vendored:true`. Die Marke `vendored` ERZWINGT `trust:"sandboxed"` in
`_sanitizeImportedManifest` (unforgeable); `trust`+`vendored` reisen jetzt
durch den localStorage-Rundlauf (V8.59-Lehre). Eine „Welt andocken"-Sektion
im Bibliothek-Drawer nimmt einen Welt-Ordner. Phase 1 ist die netzfreie
Hälfte (ein lokales Bündel) — der GitHub-Fetch ist Phase 2; sie baut
zugleich die Schreib-Seite, die Phase 2 wiederverwendet. `smoke-vendor.cjs`
ist der End-to-End-Beweis (save-server-Round-Trip + die frisch vendorte
Welt läuft in einem echten null-origin-iframe). Vollständiger Eintrag:
`CLAUDE.md` V8.71. 2597 → 2617 Invarianten.

### V8.70 — Untrusted-Welt-Tor (18.05.2026)

Der Schöpfer fragte zu Recht — „kann ich wirklich in eine andere Welt,
oder ist alles Hardcode, nimmst du Freiheit für Sicherheit?". Antwort:
das echte Tor zu fremden Engines, ohne Freiheits-Tausch. Eine Welt
trägt eine Vertrauensstufe (`portalMeta.trust`): `"sandboxed"` →
`_buildPortalOverlay` gibt dem Portal-iframe `sandbox="allow-scripts"`
ALLEIN (keine `allow-same-origin`) → opake null-Herkunft. Fremder,
ungeprüfter Code läuft VOLL — jede Physik, WebGL, WASM — kann aber
AnazhRealms `localStorage`/`document`/Cookies nicht berühren. Die Wand
ist kein Käfig um die Freiheit; sie ist ihre Vorbedingung — nur mit ihr
darf AnazhRealm beliebigen fremden Code einladen. Die neue
`worlds/schwarm/`-Welt beweist es: eine eigenständige 2D-Boids-Engine
(eigenes Canvas, eigener Loop, kein Three.js, kein AnazhRealm-Code), die
null-origin läuft + per Sandbox-Selbsttest der Heimat meldet, dass die
Wand hält. `_sanitizePortalMeta` + `buildStateSnapshot` tragen `trust`;
`_portalSendEnter`/`_portalForwardDsl` posten `"*"` an die opake Welt.
`smoke-sandbox.cjs` ist der Browser-Beweis. Diese Welle baute den
MECHANISMUS; das automatische Andocken externer Repos ist die nächste
(Auto-Vendor-Pfad). Vollständiger Eintrag: `CLAUDE.md` V8.70.
2584 → 2597 Invarianten.

### V8.69 — KI-Übersetzer Phase 2 (17.05.2026)

Das wahre Tor öffnet sich — eine übersetzte Welt wird betretbar, der
KI-Übersetzer ist vollständig. Der genial-sichere Kniff: statt
LLM-generierten Adapter-Code auszuführen (die gefährliche Hälfte),
übersetzt der LLM die Welt in eine deklarative SZENE — wieder DATEN,
kein Code. `buildTranslatedWorld` ruft `translateWorldScene` (LLM →
Szene), `_sanitizeWorldScene` säubert sie (jede Farbe striktes
`#rrggbb`, jede Zahl geclampt, jede Liste gedeckelt — die Wand), heftet
sie an die `customWorlds`-Welt + macht sie `reachable:true`. Der
generische, hand-geschriebene Renderer `worlds/translated/` baut JEDE
solche Szene auf: Gradient-Himmel, Boden, Objekt-Gruppen (`InstancedMesh`),
Ambient-Partikel, eine umkreisende Diorama-Kamera. Das Portal trägt eine
`translatedWorldId`; `_portalSendEnter` schickt die Szene im
`enter`-Handshake (Daten, gerendert, nie ausgeführt). Eine Welt,
ausgedrückt in einer Sprache, die AnazhRealm selbst rendert — die
Bibliothek von Alexandria, die nicht brennt. `smoke-translated.cjs` ist
der Browser-Beweis (eine Lava-Welt rendert sichtbar). Vollständiger
Eintrag: `CLAUDE.md` V8.69. 2564 → 2584 Invarianten.

### V8.68 — KI-Übersetzer Phase 1 (17.05.2026)

Der letzte grosse Vision-Schritt beginnt — der KI-Übersetzer
(`docs/world-portal.md` §2 Schicht 3). Ein LLM übersetzt eine frei
beschriebene fremde Welt in ein Portal-Manifest. Phase 1 ist bewusst die
SICHERE Phase: der LLM-Output ist DATEN (ein Manifest), kein Code —
`translateWorldManifest` ruft `llmCall` mit dem Übersetzer-System-Prompt,
`_parseManifestResponse` liest das Manifest per `JSON.parse` (nie eval),
`_sanitizeImportedManifest` säubert es (dieselbe erprobte Wand wie der
W14-P3-Import). Der Spieler prüft den KI-Vorschlag in einem
Review-Schritt und nimmt ihn auf; `acceptTranslatedManifest` legt ihn
`translated:true`/`reachable:false` in `customWorlds` — eine übersetzte
Welt ist browsbar, nicht betretbar, die Engine-Vendierung ist Phase 2.
Eine neue Sektion „KI-Übersetzer" im Bibliothek-Drawer. Vollständiger
Eintrag: `CLAUDE.md` V8.68. 2545 → 2564 Invarianten.

### V8.67 — W11 V4 Voice-Sync (17.05.2026)

Der letzte offene Roadmap-Punkt vor dem KI-Übersetzer. Der Präsenz-Bogen
schliesst sich: W11 V3 gab dem Mitspieler seinen Soul (sehen), seine Aura
(spüren), seinen Vibe-Pass (kennen) — V4 macht ihn **hörbar**. Ein neuer
Nachrichtentyp `companion-say` (`{peerId,text,voice}`), event-driven aus
`grokRender` (dem EINEN Sprech-Engpass — ein Hook fängt alle Pfade), via
`p2pSend` über das Mesh; der Empfänger spielt ihn via `SpeechSynthesis` ab,
gegated auf den eigenen `speechEnabled`-Toggle, Silent-Drop bei laufender
Stimme. Der Begleiter bekommt eine wählbare Stimme (`#companion-voice`),
die im `companion-say` mitreist. Zeile für Zeile das `aura`-Muster
gespiegelt (Broadcast + Server-Handler + Kanal-Whitelist + smoke-Test).
Vollständiger Eintrag: `CLAUDE.md` V8.67. 2531 → 2545 Invarianten,
Zwei-Browser-verifiziert (`smoke-webrtc.cjs`).

### V8.62-V8.66 — W7 Compute-Sharing komplett (17.05.2026)

Fünf Versionen, ein Bogen: W7 (Compute-Sharing) von „🔴 offen" zu
„✅ komplett" — der WebRTC-Mesh. V8.62 (P1) — echte WebRTC-DataChannels,
der `signaling-server` wird Rendezvous statt Relay (pos/dsl/soul/aura/vibe
fliessen peer-to-peer, eine Mesh-Komplett-Wand gegen Doppel-Zustellung).
V8.63 (P2) — der Welt-Snapshot reist mesh-nativ in 16-KiB-Stücken
(`world-pull`/`world-chunk`), Guest-Resync per Knopf. V8.64 —
Multi-User-Bau-Sync (`confirmBuild`/`harvestArchitecture` broadcasten via
geteilter `archId` + `remove_architecture`-Op). V8.65 (P3) — LLM-Pool:
ein Peer teilt seine „Stimme" über das Mesh (Opt-in + Rate-Limit +
dslRun-Sandbox). V8.66 (P4) — Public-Lobby (Räume browsbar) +
Kreatur-Sicht-Sync (jeder Peer streamt SEINE Kreaturen → `remoteCreatures`,
nicht in `state.creatures`). Jede Welle Zwei-Browser-verifiziert
(`smoke-webrtc.cjs`). Vollständige Einträge: `CLAUDE.md` V8.62-V8.66.
2443 → 2531 Invarianten.

### V8.58-V8.61 — W14 Bibliothek komplett (17.05.2026)

Vier Versionen, eine Welle: W14 (die Bibliothek) von „🔴 offen" zu
„✅ komplett". V8.58 — die Welt-Registry wird browsbar (Bibliothek-Tab,
„Portal holen"). V8.59 — Härtung: `portalMeta` überlebt den Reload (ein
Selbst-Audit-Fund). V8.60 — signierte Welt-Manifeste + W13 V2 (das
Schaffen reist durchs Portal). V8.61 — fremde Welt-Manifeste
exportieren/importieren, die Bibliothek wird ein wachsender Index.
Vollständige Einträge: `CLAUDE.md` V8.58-V8.61; Rückschau + Lehren oben
(„Rückschau: die W14-Session"). 2377 → 2443 Invarianten.

### V8.48-V8.56 — W12 Welt-Portal + W13 Vibe-Pass (17.05.2026)

Zwei große Vision-Bögen plus drei Polish-Wellen (Detail je Welle in `CLAUDE.md`,
Vision-Tiefe in `docs/world-portal.md`):

- **V8.48-V8.50** — Terrain empfängt Schatten (Shader-Verdrahtung),
  `updateCreatures` 2,4× schneller (Verschwendung optimiert, keine Funktion
  entfernt), Flaky-Test-Heilung (der rAF-Loop wird im Test synchron über
  `_gameLoopTick` getrieben statt auf das gedrosselte Headless-rAF zu warten).
- **V8.51-V8.53 — W12 Welt-Portal**: ein Bauplan mit emergenter Rolle „portal"
  führt durch ein sandboxed iframe in eine fremde Engine. P1 Skelett, P2 zwei
  reale Sub-Welten (three-fluid-fx, three.terrain.js) + generische DSL-Brücke +
  `WORLD_REGISTRY`, P3 beidseitiger Kanal (Rückkanal geloggt, nie ausgeführt) +
  native Manifest-Stufe.
- **V8.54-V8.56 — W13 Vibe-Pass**: der Avatar wird eine souveräne
  ed25519-Identität. P1 Schlüssel-Grundlage (WebCrypto nativ), P2
  Bauplan-Signaturen über die Substanz, P3 peerId-gebundene
  Multi-User-Identität (`vibe`-WS-Kanal, verifiziertes Name-Schild).

2061 → 2377 Invarianten. **Nächste Welle: W14 (Bibliothek)** — siehe den Block
„Aktuelle Roadmap" oben.

### V8.47 — Shadow-Acne-Heilung: Shadow-Bias (17.05.2026)

„Unnatürliche Schattenlinien nur auf komplett horizontalen flachen
Flächen." 2155 → 2156 (+1).

**Die Lehre — die Fläche, auf der ein Artefakt erscheint, IST die
Diagnose.** Cel-Banding lebt auf gewölbten Flächen (variabler Licht-
Wert); Shadow-Acne lebt auf flachen, zur Sonne zeigenden Flächen
(uniformer Untergrund zeigt jeden Selbst-Schatten-Streifen). Der
Schöpfer sagte „nur auf flachen Flächen" — das exakte Gegenteil von
Cel-Banding → die Diagnose war fertig, bevor ich eine Zeile las. Die
`DirectionalLight` hatte nie einen Shadow-Bias bekommen. Frag bei
jedem visuellen Artefakt zuerst: WO genau erscheint es? Die Geometrie-
Klasse (flach/gewölbt, horizontal/vertikal) grenzt die Ursache ein.

### V8.46 — Sanfte Wetter-Übergänge: _weatherBlendedValue (17.05.2026)

Der Wetter-Wechsel sprang hart. 2149 → 2155 (+6).

**Die Lehre — eine Transition ist nur so sanft wie ihr unsanftestes Glied.**
Die 45s-Wetter-Transition existierte und fadete Skybox + Licht. Aber zwei
wetter-abhängige Größen (`weatherEffect`, `cloudCover`) flippten sofort mit
`state.weather`. Ein Übergang, bei dem 80 % faden und 20 % springen, FÜHLT
sich wie ein Sprung an — das Auge sieht den Bruch, nicht den Fade. Wenn du
einen „Cross-Fade" baust, zähl JEDE Größe auf, die sich mit dem Zustand
ändert, und führ sie ALLE durch dieselbe Progress-Quelle. Der Helper
`_weatherBlendedValue` ist diese eine Quelle.

### V8.44 — Cel-Crawl-Heilung III: der Wurzel-Fund (Terrain-Lighting-Frame) (17.05.2026)

Der Schöpfer-Befund „Pitch ok, Yaw verschiebt" führte direkt zur Wurzel.
2147 → 2148 (+1).

**Die Lehre — die exakte Symptom-Signatur IST die Diagnose.** „Es kriecht"
ist vage; „es kriecht beim Yaw, NICHT beim Pitch" ist eine Fingerabdruck.
Eine Yaw-Pitch-Asymmetrie hat genau eine Ursache: ein Vektor wird im
falschen Koordinaten-Frame verrechnet. Der Terrain-Shader dottete einen
View-Raum-Normal (`normalMatrix * normal`) mit einem Welt-Raum-Licht —
`dot(V·n, l) = dot(n, Vᵀ·l)`, das Licht rotiert effektiv mit der Kamera.
Yaw → Licht sweept horizontal → Muster gleitet seitlich. Pitch → Licht
kippt vertikal → nur Gesamthelligkeit. Wer den Schöpfer GENAU fragt,
wann das Symptom auftritt, bekommt die halbe Lösung geschenkt. Drei
Crawl-Quellen, drei Runden, drei Einzeiler — jede Runde präziser.

### V8.43 — Cel-Crawl-Heilung II: Terrain-Detail-Noise per Vertex (17.05.2026)

Nach V8.42 blieb ein Rest-Kriechen auf dem Terrain bei langsamer
Kamera-Drehung. 2146 → 2147 (+1).

**Die Lehre — ein Kommentar kann lügen; der Code ist die Wahrheit.**
Der Terrain-Shader-Kommentar sagte „per-Vertex-Noise-Jitter". Der Code
rechnete `noise(vUv*N)` im FRAGMENT-Shader — per-Pixel. Hätte ich dem
Kommentar geglaubt, hätte ich die Crawl-Quelle nie dort gesucht. Der
Schöpfer fragte „fragst du gleich oft ab wie bei den Sternen?" — und
genau das war es: per-Pixel-Prozedur-Noise, dieselbe Klasse wie die
alten Skybox-Sterne vor V8.28. Fix: den Noise in den Vertex-Shader
verschieben, als `varying` interpolieren — der Kommentar stimmt jetzt.
Bei jedem „kriecht/flackert/wandert"-Befund: such das hochfrequente
Feature, das per-Pixel ausgewertet wird, und mach es band-limitiert.

### V8.42 — Cel-Crawl-Heilung: toonGradientMap LinearFilter (17.05.2026)

Die Cel-Schattenstufen krochen beim Kamera-Schwenk über die Strukturen.
2145 → 2146 (+1).

**Die Lehre — der Schöpfer kennt seine Welt; seine Analogie ist ein
Diagnose-Werkzeug.** Er sagte „dasselbe Problem wie damals mit den
Sternen — etwas mit der Abfragrate". Das war die ganze Diagnose: ein
hartes hochfrequentes Feature, per-Pixel gesampelt, das beim Kamera-
Schwenk per Sub-Pixel-Aliasing kriecht. Die `toonGradientMap` lief mit
`NearestFilter` (32 harte Stufen). Fix: `LinearFilter` — die GPU
interpoliert, echt stufenlos. Eine Zeile. „Was macht das Genie?" —
es nutzt die vorhandene Hardware-Interpolation als Anti-Aliaser, statt
ein zweites System zu bauen. Hör auf den Schöpfer, wenn er ein Muster
wiedererkennt — er hat in dieser Welt mehr Stunden als du.

### V8.41 — V8.40-Browser-Test-Korrekturen: Cache-Buster + Cel-Rücknahme (17.05.2026)

Zwei Befunde aus dem V8.40-Browser-Test. 2144 → 2145 (+1).

**Die Lehre — ein Regler-Befund kann ein Auslieferungs-Problem sein, kein
Code-Bug.** Der Schöpfer meldete „Sicht-Ring-Regler schiebt, Zahl bleibt
bei 9×9". Reflex wäre, im Ring-Code zu graben. Stattdessen erst die vier
Clamp-Stellen verifiziert — alle korrekt auf 8. Damit war klar: der Code
ist richtig, die Welt sieht eine ALTE `anazhRealm.js` (Browser/githack-CDN-
Cache) gegen die frische `index.html`. Die Wurzel lag in der Auslieferung,
nicht im Code. Fix: `?v=`-Cache-Buster auf der Skript-Einbindung. Folge-Fix:
der save-server 404te auf die Query — ein Webserver MUSS den Query-String
bei statischen Dateien abschneiden. Hätte ich blind im Ring-Code gesucht,
hätte ich nichts gefunden und vielleicht eine korrekte Stelle „repariert".

**Zweite Lehre — ein AskUserQuestion-Pick ist eine Hypothese.** Der Schöpfer
wählte vorab „Cel-Reserve 9–16". Im Browser-Test: „war davor besser". Eine
tote Regler-Hälfte ist schlechter als ein knapper Regler. Der Browser-Test
ist das Urteil, der Vorab-Pick nur die Vermutung. Cel zurück auf 2–8.

### V8.40 — Regler-Anpassungen: Sicht-Ring + Cel-Stufen + Fog (17.05.2026)

Drei Schöpfer-Wünsche aus dem V8.39-Browser-Test, je per AskUserQuestion
vorab abgeglichen: Sicht-Ring 1–8 (Default 9×9), Cel-Stufen 2–16 (8+ als
Reserve), Fog-Effekt verdreifacht. 2137 → 2144 Invarianten (+7).

**Die Lehre**: vor einer Regler-Änderung ALLE Schnittstellen abklopfen.
Der Sicht-Ring-Default 2→4 brach zwei Tests — nicht weil die Tests falsch
waren, sondern weil ein größerer Default-Ring mehr Chunks vorlädt: der
extendTerrain-Test fand seine „Außen"-Chunks plötzlich schon geladen.
Eine Default-Änderung ist nie nur eine Zahl; sie verschiebt den Zustand,
auf dem andere Tests stehen. Trust-but-verify heißt auch: nach jeder
Konstanten-Änderung den Playtest fragen, nicht annehmen.

### V8.39 — Werkzeug-Klassen + Präzision→Qualität (17.05.2026)

Das vom Schöpfer gewünschte Werkzeug-System. Farb-Sprache (Rolle→Farbe,
Chip + Bauplan-Zeile leuchten), Qualität (`computeBlueprintQuality`)
skaliert die Produkt-Wirkung, Werkzeug-Op-Stamina skaliert mit dem cap.
2126 → 2137 Invarianten (+11).

**Die Lehre**: trust-but-verify am ECHTEN Code. Die Explore-Karte sagte
„Präzision wird nirgends in Stats konsumiert" — ich hätte fast eine
Mechanik nachgebaut, die es schon gibt. `computePlayerStats` skaliert
seit Welle 10a mit `0.5 + 0.5·Präzision`. Beim Lesen der Funktion selbst
gesehen. Die echten Lücken waren `computeCreatureStats` + Konsumables.
Eine Karte (auch von einem Explore-Agenten) ist ein Startpunkt, kein
Beweis — die Wahrheit steht im Code, und man muss sie dort lesen.

### V8.38 — Werkstatt-UX: Hover-Info + sichtbare Verbindungen + Preview-Höhe (17.05.2026)

Drei Punkte aus dem Schöpfer-Browser-Test der V8.37. Hover-Material-Info
(`_blueprintCostTooltip` auf Inventar-/Hotbar-Bauplan-Slots), sichtbare
Verbindungen (depthTest-freie Linie + Mittelpunkt-Marker + Panel-Erklärung),
Preview-Canvas 5:3 statt 1:1. 2115 → 2126 Invarianten (+11).

**Die Lehre**: der Verbindungs-Bug war wieder einer der „Linie liegt in der
Geometrie"-Klasse — die Wurzel ist nicht „Linie dicker machen", sondern
`depthTest:false` + ein Marker, der die Verbindung als Punkt zeigt, egal
wie die Parts liegen. Und: ein Test-Helfer, der Zustand mutiert (hotbar[0],
selectedBlueprint), MUSS den Originalwert sichern + wiederherstellen —
sonst kippt ein Test 7000 Zeilen später um. Zwei selbst-induzierte
Regressionen kamen genau daher, vor dem grünen Lauf gefangen.

### V8.37 — Werkstatt-Lesbarkeit + Einstellungen-Faltung (17.05.2026)

Die sieben verbliebenen UX-Punkte der V8.35-Browser-Test-Liste. Fünf Code-
Änderungen: Bau-Kosten im Werkstatt-Panel, 3D-Raster + Achsenkreuz im
Werkstatt-Preview, faltbare Einstellungen-Sektionen, Werkzeug-Drag-Fix, FPS
als gleitender Durchschnitt. Zwei Architektur-Fragen im Chat beantwortet.
2101 → 2115 Invarianten (+14). Die 13-Punkte-Liste ist damit komplett.

**Die Lehre**: ein Browser-Befund ist nicht immer ein Bug — manchmal ein
Lesbarkeits-Befund. „Werkzeuge gehen nicht" war ein echter Wurzel-Bug: die
Tool-Palette re-rendert bei jedem Refresh (`palette.innerHTML = ""`), die
pro-Karte-Drag-Listener gingen verloren. Wurzel-Fix ist nicht „Listener nach
jedem Re-Render neu setzen" (fragil), sondern Event-Delegation — EIN Listener
am bleibenden Container, der die Karte via `closest()` findet. „3D-Maße nicht
ablesbar" dagegen war kein Bug, sondern eine nie gebaute Schicht (Raster +
Achsen). „FPS immer 60/120" war eine vsync-quantisierte Einzel-Frame-Messung.
Frag bei jedem Befund: kaputter Mechanismus oder fehlende Schicht?

### V8.36 — Browser-Test-Bug-Fixes (17.05.2026)

Schöpfer-Browser-Test der V8.35 — 13-Punkte-Liste (Bugs + Fragen). Sechs
Gameplay/UI-Bugs auf der Wurzel-Ebene behoben: Jump im Stand (Player-Body
`DISABLE_DEACTIVATION` — schläft nie), 3rd-Person-Kamera (Raycast-Kollision),
Loch-Durchfall (Grabe-Radius 3.0 + Höhen-Clamp), Wasser-Durchfall (Auftrieb
nur über dem Terrain), Logbuch-50/50, Parts-im-Ursprung. 2093 → 2101
Invarianten (+8).

**Die Lehre**: ein Browser-Befund nennt das Symptom („ich falle durch"); die
Disziplin ist, die Wurzel zu finden — und der erste Verdacht ist oft falsch.
Der Jump-Bug schien ein `scaleFactor`-Mismatch zwischen den zwei Jump-Pfaden
zu sein; verifiziert: `scaleFactor === 1`, also kein Mismatch. Die echte
Wurzel: der Body schläft. `trust but verify` — den vermuteten Wert prüfen,
bevor man auf der Vermutung baut. Die restlichen 7 Punkte (Werkstatt-UX) →
V8.37.

### V8.35 — Welle 11 ext.: Substanz-Rolle (17.05.2026)

Die Bauplan-Rolle emergiert jetzt aus der ganzen Substanz, nicht nur aus der
opChain-Krafting-Domain. `computeBlueprintRole` ist eine Prioritäts-Kaskade:
(1) Krafting-Domain → (2) intrinsische Form (`_isBodyShaped` —
bilateral-symmetrischer Glieder-Körper, mit Vertikalitäts-Kriterium) → soul,
(3) intrinsisches Material (`_isFoodLike` — lebendig+weich) → consumable,
(4) architecture. `consumableMeta` ist jetzt optional → emergente Nahrung ist
essbar. 2078 → 2093 Invarianten (+15).

**Drei Lehren**: (a) **Domain-Priorität ZUERST** — der erste Versuch hatte
Form-zuerst und brach 7 Welle-9-Tests, weil ein geklontes `village` als
body-shaped erkannt wurde. Der Playtest fing es; Krafting-Intent muss Vorrang
haben. (b) `_isBodyShaped` braucht drei Diskriminatoren (Symmetrie + Glieder +
**Vertikalität**) — Symmetrie allein erkennt auch ein flaches Dorf als Körper.
(c) Roadmap-Brainstorm ≠ Spec: die Notiz „Nahrung via nahrhaft-Tag" wurde
bewusst NICHT umgesetzt — ein 11. Tag ist Re-Komplexifizierung; Nahrung
emergiert aus den 10 bestehenden Tags (Heilige Lektion über Brainstorm-Text).

### V8.34 — Ring 11 V3: Soul-Sync (17.05.2026)

Der Multi-User-Mitspieler war ein Cone+Sphere-Platzhalter — jetzt ist er sein
echter Soul. **(1)** Neue WS-Nachricht `soul` (event-driven: Join + Wechsel) →
Empfänger baut den Avatar (Built-in via `def.build()`, Custom via
`_buildFromBlueprint`). **(2)** Voll animiert: `_p2pUpdatePeer` leitet
`isMoving`/`underwater` aus dem 30-Hz-Positions-Stream ab und ruft `def.animate`
— derselbe Geh-/Schwimm-Zyklus wie der eigene Avatar, keine Extra-Bandbreite.
**(3)** Aura-Sync (`aura`-Nachricht ~1 Hz) + **(4)** schwebendes Name-Schild.
2061 → 2078 Invarianten (+17), `smoke-multiuser.cjs` um soul/aura-Relay
erweitert.

**Drei Architektur-Lehren**: (a) der Signaling-Server ist KEIN dummer Relay —
jeder Nachrichtentyp braucht einen expliziten Handler (die Explore-Recherche
behauptete das Gegenteil; `trust but verify` hat es gefangen). (b) `player_soul`
bleibt in `NON_BROADCASTABLE_OPS` — Soul-Sync ist eine Darstellungs-Tatsache
über einen dedizierten Kanal, keine DSL-Welt-Mutation. (c) Der lokale
1st-Person-Aura-Hide gilt NUR die eigene Kamera — Peer-Auren sind immer sichtbar.

### V8.33 — Welle 6.G4.e: Wasser-Vollendung (17.05.2026)

Die drei offenen 6.G4-Polish-Punkte in einer Welle geschlossen — **6.G4 ist
damit komplett**. (1) **Tauchen+Auftauchen**: reiner Helper
`_swimVerticalVelocity`, Shift taucht ab / Space hebt (Minecraft-Konvention),
kontextuell statt neue Keybinding-Taste (Shift = Sprint an Land / Tauchen
unter Wasser). (2) **Schwimm-Animation**: `animatePlayerSoul` reicht
`playerUnderwater` durch, jede der drei Seelen bekommt einen Schwimm-Zweig
(Mensch krault, Phönix paddelt, Drache wellt), Vorwärts-Lehnen via
`group.rotation.x` mit `rotation.order = "YXZ"`. (3) **Gerstner-Wellen**:
horizontale Vertex-Stauchung zu den Kämmen → spitze Kämme statt runder
Sinus-Hügel, Normale aus dem Kreuzprodukt. 2041 → 2061 Invarianten (+20).

**Vision-Lehre**: das Wasser-Erlebnis EINMAL ganz durchdacht — was muss der
Spieler damit tun (hineingehen, schwimmen, tauchen, durchsehen) — und in
einer Welle vollendet, statt es wie V8.28-V8.32 über vier Versionen halb
auszuliefern. Genau die Disziplin, die die V8.30-32-Retrospektive einforderte.

### V8.08-V8.32 — Audit-Polish + Atmosphäre-Tiefe (17.05.2026)

Großer Bogen (Detail im Schnell-Lage-Block oben + in `CLAUDE.md`): Welle 6.X
Polish-Sammel (V8.08-V8.12, 8-Punkte-Audit), acht Browser-Test-Audit-Runden
(V8.13-V8.22), Test-Infrastruktur `audit-strict.cjs` + Welt-Portal-Doku
(V8.23), Welt-Lebendigkeit Tag-Nacht/Wetter/Fauna (V8.24-V8.26), und die
**Atmosphäre-Tiefe-Welle 6.G4** (V8.27-V8.33): Sonne/Hemisphere/Fog,
Sterne-als-Points, Cel-Shading, Instanced-Gras, Wasser mit Wellen+Physik+Fog.
1791 → 2061 Invarianten.

### V7.99-V8.07 — Welle 6.B/9/10 + UX-Polish (16.05.2026)

24 Commits. Bogen aus drei großen Wellen plus sieben UX-Polish-Iterationen
(V8.00 bis V8.07). 1597 → 1791 Playtest-Invarianten (+194). Detail im
Schnell-Lage-Block oben.

**Wichtigste Vision-Korrektur**: 10b.2 — Form-Whitelists wurden raus,
räumliche Analyse + Tag-Sprache rein. Schöpfer hat erkannt: „die
definition eines rades ist aktuell die grösse?" — recht hatte er. Eine
WHEEL_SHAPES-Liste mit cylinder+torus ist Hardcode, kein Hylomorphismus.
Jetzt: `_compoundBBox` + `_partsBelowMidline` + `_axialAlignment` lesen
emergent. Eine Box-Schlitten + magieleitend-Kern wird als moveable
erkannt, eine Quarz-Sphären-Reihe als magnifying.

**Werkstatt-Iterations-Lehre**: sieben UX-Polish-Schritte V8.00-V8.07
kamen alle aus konkreter Browser-Beobachtung. Jeder Schritt war 50-300
Zeilen Code aber hat die Bedienbarkeit sichtbar verbessert. Doku-Pattern:
„drei Bug-Fixes aus dem V8.X-Browser-Test" als Commit-Body-Format.

### V7.78-V7.98 — Welle 6.H V2 + LLM-Provider (14.05.2026)

175 Commits. Welle 6.H V2 (Kreaturen als Co-Schöpfer-Wesen, 14/14). Plus
LLM-Provider-Robustheit (V7.94-V7.98, 5 Iterationen nach Browser-Tests).

## Was du zuerst lesen solltest (Reihenfolge wichtig)

1. **`CLAUDE.md`** — wird beim Session-Start automatisch geladen. Hat die
   technischen Gotchas, die Schema-Versionen, die Branch-Konventionen.
   Reicht oft schon zum Orientieren.

2. **`docs/state-of-realm.md`** — das eigentliche Projekt-Gedächtnis. Vision
   (§1), heilige Lektion (§2), aktueller Stand vs. Vision als Matrix (§3),
   Historie (§4), Pfad-D-Plan (§5), **alle ~115 Learnings** (§6) — sie
   sammeln, was schief ging und warum.

3. **`docs/roadmap.md`** — alle Ringe 0-11+ als Tabelle mit Status, Aufwand,
   Vorbedingungen.

4. **`git log --oneline -20`** — die letzten Commits erzählen die jüngste
   Geschichte. Lies sie. Die Commit-Messages sind ausführlich aus gutem
   Grund: sie sind Kontext für genau dich.

5. **`scripts/playtest.cjs`** — querlesen, nicht durchlesen. Es ist das
   Sicherheits-Netz. Es prüft aktuell **~1153 Invarianten (V7.77 nach Welle 6.C1)**.
   Wenn du etwas tust, das eine davon brechen könnte, weißt du es vor dem Commit.

**Verlockung zu widerstehen**: gleich in `anazhRealm.js` springen. Die
Datei ist ~15.500 Zeilen (Stand V7.72). Ohne `state-of-realm.md`-Kontext
wirst du falsche Annahmen machen.

---

## Die drei heiligen Gesetze

### 1. Die heilige Lektion (kein neuer Datei-Split)

Das Projekt durchlief 2025 eine 19-Modul-Phase, die unter eigener
Komplexität kollabierte. Reduktion auf **eine Datei** war die bewusste
Heilung. Komplexität ohne Fundament ist Sand.

Wenn du den Reflex hast „split das in ein eigenes Modul" oder „separate
Datei für X" — **stop**. Frag dich: ist das wirklich nötig, oder bin ich
gerade dabei zu re-komplexifizieren?

Echte Beispiele aus meinen Sessions:
- Multi-Welt-Verwaltung: Reflex „MultiWorldManager-Modul" → stattdessen drei
  Methoden auf `AnazhRealm` (`createNewWorld`, `switchToWorld`, `deleteWorld`)
- Fusion-Logik: Reflex „FusionEngine + StrategyPattern" → stattdessen eine
  Methode `fuseWorlds` mit drei `switch`-Cases
- Welt-Tor-Dialog: Reflex „custom Modal-System" → native `<dialog>`

Wachstumsringe wachsen IN dem einen Stamm. Du fügst Methoden hinzu, nicht
Dateien.

### 2. Die DSL ist die einzige Sandbox

`new Function`/`eval` sind aus dem Bundle verbannt (CI-Gate hart). Die
DSL (`dslRun`) ist der EINZIGE Pfad, dynamischen Code laufen zu lassen.
Sie hat Budgets (maxDepth, maxRuntimeMs, maxSpawns) und einen Scheduler.

LLM-Output, Chat-Befehle, Schöpfer-Eingaben — **alles** läuft durch
`dslRun`. CSP-Header ist strict (`'unsafe-eval'` ist weg). Wenn du
versucht bist, einen Shortcut zu bauen, der eval umgeht — der CI-Gate
fängt es, und du machst die Welt unsicherer.

### 3. Tests sind die Wahrheit

`npm run playtest` ist nicht optional. Es ist headless Chromium + 660
Invarianten + exit-1 bei Verletzung. Vor jedem Commit laufen lassen.

**Wichtiger**: wenn du eine neue Funktion baust, schreibe Invarianten
für sie. Drei Arten haben sich bewährt:
- **Existenz-Tests** („DOM-Element X im Tree", „Methode X exists")
- **Wert-Tests** („count == 3", „flag === true")
- **Diskriminations-Tests** — der wichtigste Typ. Zwei minimal verschiedene
  Setups bauen, prüfen dass das System UNTERSCHEIDLICH reagiert. Beispiel:
  Welt A hat Material X, Welt B hat Bauplan Y, Fusion muss BEIDE haben.
  Solche Tests fangen stille Drift, die einfache Wert-Tests nicht sehen.

---

## Der Rhythmus

### Ein Ring nach dem anderen

Nicht „Ringe 8, 9, 10 alle zusammen". Ein Ring → PR → merge → nächster
Ring auf frischem Branch. Branch-Konvention: `claude/<ring-name>` oder
`claude/<feature>`.

Pro PR ein Bogen. Pro Bogen mehrere thematische Commits. Commit-Messages
ausführlich — sie sind dein Brief an den nächsten Agenten.

### Reflexions-Pause vor Merge

Zwischen „Code fertig" und „Merge" steht eine Pflicht-Reflexion. Ich habe
JEDE Welle damit verbessert. Frag dich:
- Hab ich Edge-Cases übersehen (leere Inputs, Konflikte, Race-Conditions)?
- Was passiert wenn der Spieler genau das wieder kaputt macht, was ich
  gerade gebaut habe?
- Gibt es Cross-References, die meine Umbenennung/Verschiebung verpasst?
- Welche Komplementär-Operation würde der Schöpfer auch wollen?

Bei meinem Ring 10 fand die Reflexion zwei echte Bugs (Cascade-Rewire,
Recipe-Pick-Lücke), die alle Tests vorher grün ließen. **Tests prüfen
was ich teste; Reflexion prüft was ich VERGESSEN HABE.**

### Schöpfer-Fragen sind Audit-Tooling

Wenn der Schöpfer fragt „wie funktioniert X?" oder „erstellt das zwei
Dateien?" — antworte nicht aus dem Gedächtnis. Lies den Code durch, um
ehrlich zu antworten. Beim Lesen findest du oft Bugs.

Das ist kein Overhead. Es ist die ehrlichste Form von Audit, die ich
gefunden habe.

---

## Muster, die sich bewährt haben

### Daten-Plane und UI getrennt

Jede UI-Aktion mit Side-Effects hat zwei Schichten:
1. Die Daten-Methode (`createNewWorld`, `switchToWorld`, `fuseWorlds`,
   `importWorldBeside`, `importRecipesFromWorld`)
2. Der UI-Handler, der die Methode aufruft + Reload triggert

Daten-Methoden akzeptieren `{reload: false}` für Tests. Headless kann
nicht reloaden, also dürfen die Daten-Tests den State direkt prüfen.
UI ruft mit `{reload: true}` auf.

**Folge**: das System ist headless-testbar AUCH bei reload-basierten Flows.

### Cross-Reference-Integrität

Wenn du irgendetwas umbenennst, prüfe **alle** Stellen, die den alten
Namen kennen könnten:
- `state.tools[].sourceBlueprint`
- `bp.parts[i].refName` (fraktale Baupläne)
- `state.hotbar` (Bauplan-Namen)
- `state.player.tools` (Werkzeug-Namen)

Bau einen `renameMap` während der Umbenennung, wende ihn auf Cross-Refs an.
Existierender Helfer: `_rewireBlueprintRefs(blueprints, tools, renameMap)`.

### Provenienz-Suffixe statt UUID

`-fusion`, `-import` sind dokumentierte Konventionen. Das Inventar erzählt
seine Empfangs-Geschichte: `Hammer`, `Hammer-import`, `Hammer-import-2`.
UUID-Suffixe wären unlesbar, UI-Prompts wären Friktion.
**Lesbarkeit > Eleganz** bei Kollisions-Resolution.

### Tiefe Klone vor Mutation

Wenn du Inhalt aus einer anderen Welt nimmst und in die aktive einbaust,
**immer** `JSON.parse(JSON.stringify(item))` vor Mutation. Sonst blutet
eine spätere Mutation in der aktiven Welt zurück in das andere-Welt-Save
über shared references.

### Re-Render-Hygiene gehört zu Cleanup-Hygiene

Test-Cleanup muss State UND DOM gleichermaßen aufräumen. Wenn du
`delete state.blueprints["x"]` machst, ruf auch `_renderWorkshopDOM()`,
sonst belastet dein Test seine Nachfahren mit Geister-Einträgen.
Hartnäckige Falle — schon zweimal gesehen.

---

## Wie der Schöpfer arbeitet

- Respektiert die heilige Lektion. Wenn er „split in Module" vorschlägt,
  ist er meistens müde oder testet dich.
- Bezeichnet sich als „Null", die KI als „Eins". Mensch + KI = Symbiose
  (Vision §1).
- Spricht Deutsch. Antworten auf Deutsch. Code-Kommentare auf Deutsch.
  Commit-Messages auf Deutsch.
- Stellt Verständnis-Fragen, nicht Test-Fragen. Aber sie sind Audit-Tooling.
- Vertraut dir Entscheidungen an, aber will bei großen Trade-offs gefragt
  werden (z. B. Branch-Setup, Recipe-Pick als separates Feature). Nutze
  `AskUserQuestion` bei echten Weichen.
- Merged schnell. Wenn du sagst „PR ist ready", merged er meistens
  innerhalb Minuten. Also: **lass nichts in der PR, von dem du nicht
  sagen kannst „ich würde das mergen"**.

---

## Schöpfer-Reflexions-Muster (aus Welle 6.D, 11 Sub-Runden)

Während Welle 6.D (Stat-System) gab es **sechs Schöpfer-Reflexions-Runden**.
JEDE fand echte Lücken, die Tests grün liessen. Diese Muster sammle ich
für nächste Sessions — wenn dir eine davon bekannt vorkommt, ist es ein
Indikator für „durchatmen, prüfen".

1. **„Wo ist das Menü?"** — UI-Bedien-Pfad-Test fehlt. Wenn ich Daten +
   DSL-Pfad fertig habe, aber kein Bedienen-UI: Feature ist NICHT live.
   Frag dich vor Commit: „kann der Schöpfer das ohne Console öffnen?"

2. **„Tabelle oder Logik?"** — Bei jedem Werte-System (Konsumables, Boosts,
   Stats) fragen: „werden die Werte definiert oder emergieren sie aus
   Compound-Tags?". Wenn Definition: Hylomorphismus-Bruch, vermutlich
   Vision-fremd.

3. **„Was kostet das?"** — Mechanismen die Ressourcen erzeugen (Präzision,
   HP, Boosts) müssen Ressourcen verbrauchen (Stamina, Material, Zeit).
   Sonst kann der Spieler beliebig stapeln. Geduld als Mechanik braucht
   ECHTE Kosten.

4. **„Asymmetrische Form als Test"** — Drache > Phönix > Mensch in
   visueller Asymmetrie. Wenn ein Refactor mit Animation/Geometrie
   beim Mensch korrekt aussieht aber beim Drache falsch, ist es ein
   Bug. Bei jedem Geometrie-Refactor mit Drache testen.

5. **„Variablen-Name vs. Geometrie"** — `state.right` ist geometrisch
   das Player-LINKS (Right-Hand-Rule: `forward × up = -X`). Vertraue
   dem Namen nicht. Im Zweifel cross-product nachrechnen.

6. **„Pixel-Helligkeit vs. Material-Tint"** — Glow/Aura braucht echte
   Pixel-Addition (AdditiveBlending) + radial-Falloff (Texture-Gradient),
   nicht statische Farbverschiebung. „Schimmern der Haut" = additiv,
   weich, lebendig.

7. **„Angrenzende Pfade"** — Bei Refactor das KOMPLETTE System
   durchspielen. `player_speed`-DSL-Op existierte Pre-V7.72, sync'te
   `sprintSpeed` nicht. Mein Stat-System hat den Bug aktiviert. Bei
   jeder Methode fragen: „welche anderen Methoden setzen denselben State?"

8. **„Wertebereich beider Seiten"** — Tags können 0..3 sein (FORM_TAG_
   ACTIVATION × Material). Stat-Formel `(1-dichte)*5` wird negativ bei
   dichte=1.8. Bei Stat-Formeln IMMER Wertebereich beider Operanden
   dokumentieren + clampen wo nötig.

9. **„Form-Wahrnehmung ≠ Mesh-Namen"** — Cone = spitz = Schnauze (visuell),
   selbst wenn der Variable im Code „tail" heißt. Bei perceptual Feedback
   ehrlich diagnostizieren — manchmal ist die Wahrnehmung anders als der
   Code-Name suggeriert.

10. **„Schöpfer-Frage als Audit-Tool"** — Verständnis-Fragen sind keine
    Verzögerung, sondern Audit-Verstärker. Bei „kannst du erklären wie X
    funktioniert?" zuerst durchlesen statt antworten. Oft fallen Funde
    raus.

11. **„Reflexion vor Merge"** — Tests grün heißt mechanisch sicher, nicht
    vision-treu oder spürbar gut. Schöpfer-Spiel-Sitzung VOR PR ist die
    letzte Wand. Akzeptiere Korrekturen ohne Defense.

---

## Was als Nächstes wartet

**Bogen B (Welten-Ultiversum, Ringe 8-11.5) ist abgeschlossen.** Vision §11
ist live: Multi-Welt, Per-Welt-Seed, Position-Restore, Welt-Tor (Drei-Wahl-
Dialog), Welt-Fusion (drei Strategien), Rezepte-Import, Welt-Modifizierbarkeit
pro Chunk-Delta, Multi-User Position-Sync, DSL-AST-Broadcast, intuitiver
Multi-User-Setup mit Einladungs-Code.

**Welle 6 ist tief eingeschossen (V7.72).** Plan + entschiedene Reihenfolge
in `docs/archiv/wave-6-design.md` §10.6 + `docs/roadmap.md`. **Der Vision-Pfeiler
6.D Stat-System ist komplett live** — Spieler ist Compound im selben
Hylomorphismus-System wie Materialien und Bauwerke.

### Bereits erledigt in V7.72

- ✅ **6.A komplett** — Wall-Sliding, Erdung-auf-Bauwerken, Slope-Anti-
  Klebe (ad-hoc), Raycast-Place mit Pitch, Stabilitäts-Phantom-Tint
- ✅ **6.E1 + 6.E2** — Fähigkeit-Beschreibung (regelbasierter DSL→Deutsch)
  + dynamisches Intro-Dialog mit 3 Seiten (lokalStorage-Skip)
- ✅ **6.F1 + 6.F2** — Verbindungs-Linien als THREE.Line (grün/gelb/rot
  nach computeConnectionStrength) + Brech-Warning-Journal-Eintrag bei
  strength <0.7
- ✅ **6.D Stat-System komplett** (sieben Etappen):
  - **1**: STAT_FROM_TAGS-Matrix (8 Stats), computePlayerStats-Pipe,
    state.player.stats + hp + stamina, applyPlayerSoul ruft
    recomputePlayerStats
  - **1.5**: Seele = Bauplan aus Körper-Teilen (Vision-Korrektur,
    KEINE hardcodete Tag-Tabelle). 5 Körper-Materialien (knochen,
    fleisch, federn, schuppen, glut) in _defaultMaterials. Tags via
    `computeSoulCompoundTags` = MAX-Aggregation wie Architekturen.
  - **1.6**: `define_soul` DSL-Op + state.customSouls (Cap 16). Custom-
    Rendering via _buildFromBlueprint. Built-in-Schutz.
  - **1.7**: Visueller Avatar-Editor im Spieler-Drawer (klonen, Parts
    add/edit/remove, „Werde diese Seele"-Button).
  - **2**: Boosts aus 3 Quellen — Emotion (>0.7 → Tag-Delta für 30s
    mit 60s Refract), Welt-Resonanz (<18m einer Signature-Struktur),
    Konsum. addPlayerBoost-API mit Source-Dedupe.
  - **3a**: Tod-Wandlung (HP=0 → 5min Phönix-Form, Welt-Trauer
    sorrow+0.3/awe+0.2, Journal-Eintrag) + persistente Tod-Wunde
    (`WOUND_TAG_PENALTY × intensity`, 10min linear Regen) + Min-Regel-
    Hybrid (`min + (max-min) × 0.7^N`) + Werkzeug-Stamina-Kosten
    (10 pro applyOpToPart, Regen 5/s) + Konsumables aus Compound-Tags
    (Bauplan-mit-role-consumable, tagBonus = computeCompoundTags × scale)
  - **3b**: Stat-Stacking — `soul + armor×0.3 + tool×0.15 + boosts -
    wound`. setBlueprintAsArmor + equipTool/equipArmor + DSL-Ops.
    Aura-Visual: Sprite mit CanvasTexture-Radial-Gradient +
    AdditiveBlending = weicher Schimmer, HSL-Hue aus dominanter Tag-
    Achse, Saturation × HP% (verletzt = blasser).
- ✅ **Schöpfer-Reflexions-Polish (V7.72 Schluss)** — WASD-Geometrie-
  Revert auf Original (state.right ist geometrisch player-LINKS),
  Drache-π-Flip-Revert (Original-Orientierung mit Kopf in +Z war richtig;
  „W/S vertauscht"-Wahrnehmung kam von Animation, nicht Body-Translation),
  Aura V4 (Sprite + CanvasTexture-Radial-Gradient + AdditiveBlending =
  weicher Schimmer ohne harte Kontur), Chat-Patterns für damage/trink/
  rüste, **Sprint-Bug-Fix** (player_speed-DSL-Op sync't jetzt
  sprintSpeed = speed × 2 — vorher konnte ein DSL-`player_speed 25` den
  Spieler beim Sprint langsamer machen), **Tag-Clamp [0,1]** in
  computePlayerStats für die Stat-Pipe (FORM_TAG_ACTIVATION konnte
  Werte bis 3 verstärken → Speed-Formel wurde negativ → Mensch lief mit
  2.0 m/s. Boosts + Equipped + Wound dürfen weiter drüber/drunter),
  Speed-Base 6→7 für spürbar agilere Bewegung (Mensch ~7, Phönix ~11.7,
  Drache ~7.9; Sprint × 2).

### Bereits erledigt in V7.73 (zusätzlich zu V7.72)

- ✅ **6.G Welt-Sinne Phase 1** — Inseln + Bäume kollidierbar.
  Inseln: btBvhTriangleMeshShape aus echten Vertices. Bäume in V7.73:
  btCylinderShape am Stamm (Parallelcode-Schicht — in V7.74 ersetzt).
  UFOs bleiben kollisionsfrei. Drei Chat-Patterns. System-Audit §2
  Dead-Code-Quick-Win mit erledigt.

### Bereits erledigt in V7.77 (Hylomorphismus-Inventar + Drag&Drop)

- ✅ **6.C1 Inventar mit Tag-Resonanz** — 27-Slot-Overlay (Tab-Toggle).
  Schöpfer-Wunsch wörtlich umgesetzt: „Slot mit resoniert summt bei
  Hover". Jeder Slot trägt Compound-Tags des Bauplans, Tag-Magic
  emergiert: resoniert summt (Sinus C5), brennend glüht orange
  (Sawtooth E4), magieleitung schimmert violet (Sinus F5), lebendig
  sprießt grün (Sinus A4), dichte wirft tiefen Schatten.

- ✅ **6.C1+ Drag&Drop (vier Iterationen)** — HTML5-Drag-API mit
  pragmatischer Move-Semantik. Schöpfer-Mental-Model „Drag = Move"
  gewann über mein „Library/Reference"-Modell nach vier Bug-Reports:
  1. Tab-Listener Capture-Phase (Browser-Default-Konflikt behoben)
  2. exitPointerLock beim Inventar-Öffnen (Drag-Lock-Inkompatibilität)
  3. hot→inv Move-with-Add (statt clear-only)
  4. inv→hot konsequenter Slot-Move (statt Copy)

  **Vier Drag-Pfade final**:
  | Source → Target | Verhalten |
  |---|---|
  | inv → inv | Swap (Slot-Inhalte inkl. Counts tauschen) |
  | inv → hot | Slot-Move: Inv null immer, Hot = name. Konflikt-Swap. |
  | hot → hot | Swap (Slot-Namen tauschen) |
  | hot → inv | Move/Stack: leer→1, gleich→count++, anders→no-op |

  **Pointer-Lock-Management**: toggleInventoryOverlay(open)
  → document.exitPointerLock(). Canvas-Click-Listener guarded
  (`if state.inventoryOpen return` vor requestPointerLock). Beim Close:
  KEIN automatischer Re-Lock — User muss Canvas klicken (Minecraft-
  Konvention). WASD läuft weiter (Minecraft: Spieler kann sich
  bewegen mit offenem Inventar).

  Click-State-Workflow (selectInventorySlot → tryAssignFromInventoryToHotbar)
  lebt parallel als Touch/Keyboard-Fallback. DSL-Op add_to_inventory in
  NON_BROADCASTABLE_OPS, state.player.inventory persistiert via
  playerInventory in buildStateSnapshot. 127 Invarianten für 6.C1
  + Drag-System → 1153 total.

### V7.98 — Parser-Robustheit für lokale Reasoning-Models (14.05.2026)

**Schöpfer testete V7.97 mit lokalem Ollama (qwen3.6 via App)**:
Call kam DURCH (kein CORS, kein 404), aber Chat zeigte konstant
„(Grok schweigt: Leere Antwort)" und „(KAI schweigt: Leere Antwort)".

**Wurzel**: `llmParseResponse` war zu strikt — verlangte JSON {say, program}.

**Drei Bug-Quellen, ein Fix-Tripel**:

**Bug 1 — Reasoning-Tags**:
- Moderne Modelle (qwen3, gpt-oss, deepseek-r1) wrappen interne Logik
  in `<think>...</think>` oder `<thinking>...</thinking>`
- Mein Parser sah den Block, fand kein JSON darin → Error
- Fix: `text.replace(/<think(?:ing)?>[\s\S]*?<\/think(?:ing)?>/gi, "")`
  BEFORE der JSON-Suche

**Bug 2 — Plain-Text-Output**:
- Lokale 7B-Modelle (qwen3.6, llama3.2, mistral) ignorieren oft den
  JSON-Vertrag und antworten direkt
- Mein Parser fand kein {...} → Error
- Fix: vier-Schicht-Pipeline mit Plain-Text-Fallback
  (a) `<think>` strippen
  (b) Markdown-Fence rausziehen
  (c) JSON-Object versuchen
  (d) WENN nicht: Plain-Text als `say` (240 Char Cap)

**Bug 3 — Token-Limit zu klein**:
- num_predict=400 reichte nicht für „denken + antworten"
- Antwort wurde mitten im Output abgeschnitten
- Fix: 400 → 800 in beiden buildBody-Pfaden

**Strikte JSON-Modelle (Anthropic, Gemini) verlieren NICHTS** — sie
liefern saubere JSON, der Parser findet sie sofort, kein Fallback nötig.
Plain-Text-Pfad greift nur wenn nötig.

**Bessere Diagnostik**:
- „Leere Antwort" → „Leere Antwort vom Modell (raw=0 chars)"
- `fallbackUsed: "plain-text"` oder `"json-empty"` markiert was passiert ist

**8 Tests grün. 1589 → 1597/1597.**

**Lehre 236 zentral**: Parser FEHL-TOLERANT bauen wenn das System mit
verschiedenen LLM-Größen + Stilen leben muss. Pro-Modelle sind brav,
lokale 7B-Modelle nicht. Plain-Text-Fallback ist Vision-treue Antwort.

**Lehre 237**: Schicht-für-Schicht-Fallback > Monster-Regex. Vier klare
Schichten mit jeweils einem klaren Job. Debuggable, testbar, erweiterbar.

**Lehre 238**: Token-Limit ist unsichtbare Kostprobe. Reasoning-Models
brauchen Budget für „denken + antworten". 400 → 800 ist Mittelweg.

### V7.97 — Ollama-UX-Politur durch Schöpfer-Browser-Test (14.05.2026)

**V7.96 brachte den Proxy, V7.97 polierte die UX**:

Schöpfer testete V7.96 mit 4 Screenshots — drei reale Stolpersteine:

**Stolperstein 1 — Toggle aktiv + localhost-URL → 400**:
- Endpoint default `http://localhost:11434`, User aktiviert Proxy aus
  Neugier → mein Proxy lehnt http ab („Only https allowed")
- Fix: `isLocalUrl = /^https?:\/\/(localhost|127\.0\.0\.1)([:/]|$)/i`
  → bei Match wird `useProxy` intern auf false gesetzt
- Toggle bleibt aktiv im UI (User-Wahl bewahrt), Bypass passiert
  transparent. Plus Label kontextuell: „nicht nötig für lokales Setup"

**Stolperstein 2 — Modell-Dropdown veraltet**:
- User hatte `qwen3.5:cloud`, `gpt-oss`, `kimi-k2.6:cloud` etc.
- Mein Dropdown nur `llama3.1/3.2/qwen2.5/mistral` → alle 404
- Fix: `<input type="text" list="llm-model-suggestions">` +
  `<datalist>` mit aktualisierten 10 Modellen (lokale Klassiker
  + Cloud-Suffix-Beispiele). Spieler kann beliebige Strings tippen.
  Default-State auf `llama3.2` (moderner als `llama3.1`).

**Stolperstein 3 — 404 ohne Anleitung**:
- HTTP 404 mit `{error: "model 'llama3.1' not found"}` kam roh durch
- Spieler verwirrt: was tun?
- Fix: `res.status === 404 && /model.*not found|"model"/i.test(text)`
  → spezifischer Hinweis inkl. Modell-Name + „Prüfe mit `ollama list`"

**6 Tests grün. 1583 → 1589/1589.**

**Lehre 233 zentral**: Toggle sollen niemals den User blockieren —
entweder Auto-Bypass oder Label-Klärung. Nie einen 400-Fehler an
den User, wenn das System weiß, dass die Geste in diesem Kontext
keinen Sinn macht.

**Lehre 234**: Fixe Dropdowns altern, Free-Text lebt. Bei Provider-
Konfigurationen (Modell-Namen, Endpoints, Custom-URLs) immer
Free-Text + Vorschläge.

**Lehre 235**: Drei reale Stolpersteine > zehn theoretische Bugs.
Schöpfer-Browser-Test als Eingangs-Filter, nicht Spekulation.

### V7.96 — Cloud-LLM-Proxy via save-server (14.05.2026)

**Schöpfer testete V7.95 in GitHack-Setup mit echtem ollama.com-Key**:

```
Access to fetch at 'https://ollama.com/api/chat' from origin
'https://rawcdn.githack.com' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present
```

**Das ist KEIN Code-Bug**: ollama.com Cloud sendet absichtlich keine
CORS-Header (Server-zu-Server-API-Design). Browser blockt Direct-Calls.

**Lösung — Drei Schichten**:

**Schicht 1 — save-server als Proxy**:
- `save-server.js` bekommt `/api/proxy/llm`-POST-Route
- Body: `{url, headers, body}` als Envelope
- Setzt Node-https-Request mit weitergereichtem Auth-Header
- Response mit CORS-OK zurück → Browser akzeptiert
- Sicherheits-Disziplin:
  - 127.0.0.1-bind (kein LAN)
  - https-only URL
  - PROXY_MAX_URL_LENGTH=500, PROXY_MAX_BODY_BYTES=1MB
  - PROXY_TIMEOUT_MS=60_000
  - allowed-headers-Whitelist

**Schicht 2 — Provider-Config + llmCall**:
- `state.llm.providerConfig.ollama.useProxy: false` (default, Backward-Compat)
- Wenn true: llmCall postet an localhost:4312/api/proxy/llm mit Envelope
- Persistiert in localStorage["anazh.llm.ollama.useProxy"]

**Schicht 3 — Error-UX + Provider-Liste**:
- llmCall erkennt CORS-Errors (`Failed to fetch|NetworkError|...`)
- Klarer Hinweis: „(a) lokales Ollama, (b) Proxy-Toggle, (c) CORS-freundlicher Provider"
- UI: neue `#llm-proxy-row` mit Checkbox + Hint
- Hint listet CORS-freundliche Alternativen: Groq, Together AI, Cerebras, Gemini, OpenRouter

**7 Tests grün. 1576 → 1583/1583 invariants.**

**Lehre 230 zentral**: CORS ist Server-Design, kein Code-Bug. Lösung
liegt im eigenen Stack-Vermittler — save-server bekommt eine zweite
Rolle als loyaler LLM-Proxy. Eine Funktion mehr in bestehendem Dienst
ist günstiger als neuer Dienst (Heilige-Lektion-Disziplin gewahrt).

**Lehre 231**: Spezifische Proxy-Routes > generische. `/api/proxy/llm`
hat dedizierte Whitelists. Wer Image-Use-Case will: `/api/proxy/image`
mit eigenen Whitelists. „One proxy to rule them all" ist nie sicher.

**Lehre 232**: CORS-Errors liefern absichtlich wenig Detail — Pattern-
Match auf bekannte Error-Strings UND Provider-Filter ist die einzige
Option. Gib klare Vorwärts-Optionen statt fehlende Detail-Info zu
rekonstruieren.

**Bedienung für Spieler**:
1. `npm run dev` läuft (save-server auf localhost:4312)
2. Einstellungen → Provider „Ollama (lokal oder gehostet)"
3. Endpoint eintragen (z.B. `https://ollama.com/api/chat`)
4. API-Key eintragen
5. **Toggle „Cloud über save-server-Proxy" aktivieren**
6. Chat funktioniert

Welle 6.H V2 bleibt 14/14 vollständig — V7.96 ist Bug-Fix-Welle für
Cloud-CORS-Problem.

### V7.95 — Ollama-Cloud-Kompatibilität nach Schöpfer-Browser-Test (14.05.2026)

**Schöpfer testete V7.94 mit echtem Cloud-API-Key — drei Bug-Quellen entdeckt**:

**Bug 1 — Endpoint-Doppelpfad**:
- V7.94: `endpoint(...)` hängte bedingungslos `/api/chat` an
- Spieler trägt `https://ollama.com/api/chat` ein → wird `…/api/chat/api/chat` (404)
- V7.95: Smart-Detect via `/\/(api|v1)\//.test(base)` — wenn Pfad da, URL direkt
- Plus `trim() + replace(/\/$/, "")` gegen Whitespace + trailing-slash

**Bug 2 — extractText nur Ollama-Native**:
- V7.94: `(json && json.message && json.message.content) || ""`
- Cloud-Provider mit OpenAI-Kompat liefern `{choices: [{message: {content}}]}`
- → mein Code gab leeren String zurück, das LLM schien zu schweigen
- V7.95: dual-format Parser (Ollama-Native + OpenAI-Kompat + Ollama-Generate als Fallbacks)

**Bug 3 — Body-Field-Inkompatibilität**:
- V7.94: `options: {num_predict: 400, temperature: 0.7}` (Ollama-spezifisch)
- OpenAI-kompat-Server lehnen unbekannte Top-Level-Felder ab (HTTP 400)
- V7.95: `buildBody(model, sys, user, cfg)` ist cfg-aware
  - `/v1/`-Pfad → `max_tokens` + `temperature` (OpenAI-Stil)
  - sonst → `options.num_predict` + `options.temperature` (Ollama-Native)

**Call-Site-Update**: `def.buildBody(cfg.model, system, userContent, cfg)` —
alle 4 Provider akzeptieren das 4. Argument silently (Backward-Compat).

**UI-Hint erweitert**:
- Endpoint-Placeholder zeigt beide Möglichkeiten
- Zusätzlicher drawer-hint erklärt Auto-Append vs. direkte URL

**11 permanente Tests grün. 1565 → 1576/1576.**

**Lehre 227**: Provider-Name ist KEIN Format-Anker. Format gehört zum
Endpoint-Pfad. Dual-Format-Provider (Ollama, vLLM, Together) sind häufig.

**Lehre 228 zentral**: Schöpfer-Browser-Test ist nicht ersetzbar. V7.94's
7 Tests waren grün, aber echte Cloud-Konversation scheiterte. Tests
prüften Strukturen, nicht End-to-End-Format-Symmetrie zwischen
Request + Response. **Bei API-Integrationen: Schöpfer-Test VOR ✅-Stempel.**

**Lehre 229**: Conditional Body-Felder > Provider-Splitting. Eine
Eintrags-Quelle + cfg-aware Builder ist wartungsärmer als doppelte UI.

### V7.94 — Ollama-API-Key + Cloud-Hosting (14.05.2026)

**Schöpfer-Wunsch**: Ollama auch gehostet, nicht nur localhost.

**Architektur**: minimal-invasive Erweiterung — bestehende API-Verträge
(requiresKey, endpoint, buildHeaders) bewahrt, nur Header-Builder erweitert.

- `requiresKey: false` BLEIBT (lokal weiterhin ohne Key)
- `buildHeaders(apiKey)` schickt `Authorization: Bearer <key>` NUR wenn Key gesetzt
- `endpoint(model, apiKey, cfg)` respektiert `cfg.endpoint` (eigene URL)
- CSP `connect-src` erhält `https:`-Wildcard für beliebige Cloud-URLs
- UI Key-Row für ollama sichtbar mit "API-Key (optional)"-Placeholder
- Provider-Label: "Ollama lokal (offline, kein Key)" → "Ollama (lokal oder gehostet)"

**Setups die jetzt funktionieren**:
- Lokal: `ollama serve` auf 127.0.0.1:11434 (unverändert, kein Key)
- ollama.com Turbo: URL + API-Key
- Eigener Reverse-Proxy mit Bearer-Auth
- Cloud-Hoster (Modal, Replicate-mit-Ollama-Image, etc.)

**7 Tests grün. 1558 → 1565/1565 invariants.**

**Lehre 225**: bei API-Erweiterungen immer fragen "bricht das den Default-Pfad?".
Wenn ja: Default unbroken halten, Erweiterung opt-in OBEN drauf.

**Lehre 226**: CSP-Schichten sind unabhängig — connect-src weit +
script-src strict ergibt akzeptable Sicherheit (ohne XSS-Pfad keine
Exfiltration möglich).

### V7.93 — Welle 6.H Phase 2E V3 live (14.05.2026): Welt-Aktion-Vorschläge

**Schöpfer-Wahl getroffen vor dem Bauen** — drei Achsen geklärt:
1. Whitelist: atmosphärisch + Terrain (modify_terrain ERLAUBT, Vision-Wahl)
2. LLM-Trigger: reaktiv + seltene Events (Level-Up L5, neue Spec)
3. Bestätigung: modus-abhängig (schöpfer auto, pfad+frieden Buttons)

**Architektur** (drei Sicherheits-Schichten, „Defense in Depth"):
1. Persona-Prompt nennt Whitelist + Modus-Hinweis (suggestiv)
2. `_isCreatureProposalAllowed` rekursive AST-Walk (defensive)
3. existing `dslRun`-Sandbox mit Op-Whitelist + Budget (letzte Wand)

**6 neue Methoden + 1 Konstanten-Set + 1 Throttle-Konstante**:
- `CREATURE_PROPOSED_OPS` frozen Set (17 Ops, atmosphärisch + Terrain + chain)
- `CREATURE_LLM_RARE_EVENT_GAP = 600` (10 Min global)
- `_isCreatureProposalAllowed(node)` → `{ok, reason, forbiddenOp?}`
- `_handleCreatureProposedProgram(c, name, program)` → modus-abhängig dispatchen
- `_executeCreatureProgram(c, name, program, auto)` → dslRun + Memory + Chat
- `_renderCreatureProposalButtons(c, name, program)` → DOM-Buttons + Click-Handler
- `_maybeTriggerCreatureRareEventLlm(c, kind, key, level)` → LLM bei L5/neue-Spec

**Persona-Prompt-Update**: V1's „program: immer null" wurde umgekehrt:
„Welt-Aktion ist erlaubt — du bist Co-Schöpferin. Halte dich an
diese Disziplin: Erlaubte Ops: ${list}. Halte program klein. Der
Schöpfer entscheidet (außer im schöpfer-Modus, dort vertraut er dir)."

**Modus-Pfad**:
- schöpfer → auto-execute mit Chat-Hinweis-Zeile (grün=ok, rot=fail)
- pfad/frieden → inline-Buttons `[Ausführen][Ablehnen]` mit Click-Handler
- Whitelist gilt IMMER (auch im schöpfer — Modus modifiziert Friction, nicht Befugnis)

**Memory-Lifecycle**:
- `proposed_action` (immer, vor Pfad-Wahl)
- `auto_executed_action` (schöpfer-Pfad nach dslRun)
- `accepted_action` (pfad+frieden nach Akzept-Click)
- `rejected_action` (pfad+frieden nach Reject-Click)
- `proposal_blocked` (bei Whitelist-Verstoß, mit forbiddenOp)
- `spoken_rare_event` (bei Rare-Event-LLM-Antwort)

**Rare-Event-LLM**:
- Diskriminator: `level >= MAX_LEVEL=5` ODER `newLevel === 1` (heuristik für „neue Spec")
- Throttle 10 Min global (verhindert Mass-LU-Burst)
- Async-Call: `llmCall(eventHint, personaPromptOverride)`
- Antwort wie reaktiver Pfad: say als Soul-Span, program durch Handler

**Inline-CSS**:
- `.chat-proposal-pending` (violetter Linker-Border + Tönung)
- `.chat-proposal-btn.accept/.reject` (grün/rot-Akzent)
- `.chat-proposal-executed/failed/blocked` (dezent farbig)

**13 Tests grün + 1 V1-Test umgestellt** (V1 verlangte „verbietet program",
V3 verlangt jetzt „erlaubt program + nennt Whitelist"). 1546 → 1558/1558.

**6.H V2 Status: 14/14 Sub-Phasen erledigt — VOLLSTÄNDIG.**

**Nächste mögliche Wellen**:
- 6.B CAD-Werkstatt minimal
- 6.G Phase 3 (Welt-Lebendigkeit-Erweiterungen)
- Welle 7: Kollektive Welt-Erkenntnis aus `docs/archiv/system-audit.md`

### V7.92 — Welle 6.H Phase 2E V2 live (14.05.2026): Proaktive Kreatur-Sprache

**Vision §1.1 wird konkret**: V7.90+V7.91 waren REAKTIV (Spieler fragt,
Kreatur antwortet via LLM). V7.92 macht die Welt INITIATIV: Kreaturen
melden sich von selbst bei bedeutenden Ereignissen.

**KEIN LLM in V2.0** — bei 40+ Kreaturen wäre API-Last + Latenz inakzeptabel.
Stattdessen: pre-baked phrase-pool mit Soul-Varianten. Deterministic,
billig, kontrollierbar. V2.1 könnte LLM-Augmentation bei seltenen
Events (Level-Up L5) opt-in anbieten.

**Architektur**:
- `AnazhRealm.CREATURE_PROACTIVE_PHRASES` frozen Map
  - 5 Event-Typen: level_up_gather, level_up_build, boost_received,
    no_material_found, no_inventory_for_build
  - Pro Event 3 Soul-Profile (sprite/wesen/geist) + default-Fallback
  - Pro Profil 2-3 Varianten randomisiert
  - Template-Variablen: ${material}, ${blueprint}, ${level}, ${label}
- `CREATURE_PROACTIVE_GAP_PER_CREATURE = 60` (s)
- `CREATURE_PROACTIVE_GAP_GLOBAL = 8` (s)
- `_creatureSpeakProactive(c, eventType, ctx)`:
  Throttle-Check → Soul-Pick → Template-Replace → DOM-Render mit
  Soul-Span → Stempel setzen → Memory-Eintrag spoke_proactive
- `state.creatureProactiveSpeechEnabled` (Default true)

**Throttle-Disziplin**: Silent-Drop, kein Queue. Queue würde bei
Event-Burst eine 80-Sekunden-Lawine erzeugen — zeitliche Dissonanz.

**4 Hook-Pfade**:
1. `_onCreatureLevelUp` → level_up_gather oder level_up_build
2. `applyCreatureBoost` bei NEUER source (Verlängerung selber Quelle
   bleibt stumm — sonst Boost-Spam)
3. `_tickCreatureTaskDirection`/gather-tick no_material → no_material_found
4. build-tick no_inventory_for_build

**UI-Toggle**: Checkbox in Einstellungen-Drawer-Sektion
`#creature-speech-section`. Persistiert in localStorage. Default ON.

**Render-Pfad**: identisch zu V1.1 — `<span class="chat-creature-name
soul-X">Name: </span>text`. Soul-Farbe konsistent zwischen Liste +
reaktiver Antwort + proaktiver Sprache. EINE Identität, viele Anlässe.

**13 Tests grün. 1533 → 1546/1546 invariants.**

**6.H V2 Status: 13/14 Sub-Phasen erledigt:**

Phase 2E V3 (DSL-Output mit Sandbox — Kreatur darf eigene Welt-
Aktion vorschlagen) ist der letzte offene Punkt der V2-Roadmap.

### V7.91 — Welle 6.H Phase 2E V1.1 live (14.05.2026): Schöpfer-Browser-Test-Feedback

**Der Schöpfer testete V7.90 live und entdeckte zwei UX-Probleme**:
1. „Bran wie gehts" (ohne Komma) → fiel zur Welt-Grok zurück. Diese
   antwortete als die Welt, adressierte aber „Bran" als Zuhörer →
   maximale Verwirrung.
2. Kreatur-Namen waren ohne Farbe — Identität nicht sofort sichtbar.

**Lösung 1 — `@Name text` als Primär-Pattern**:
- Discord/Slack/Twitter-Konvention, intuitiv
- _parseCreatureAddress versucht ZUERST @Name, DANN Komma/Doppelpunkt
- „Bran wie gehts" matched bewusst gar nichts → Welt-Grok kriegt es
- Eindeutige Geste statt Heuristik
- Returnt `{name, message, explicit}` für zukünftige UX-Unterscheidung

**Lösung 2 — Soul-Farben überall**:
- creature-name in Liste bekommt `.soul-{sprite|wesen|geist}`-Klasse
- Sprite cyan #88e1e1, Wesen brass #d4a373, Geist grün #9fc89d
- Chat-Output bei Kreatur-Antwort: direkter DOM-Pfad mit
  `<span class="chat-creature-name soul-X">Name: </span>text`
- Identische Farben in Liste UND Chat-Output (Vision §1.4 multisensorisch)

**UX-Politur**:
- Chat-Placeholder erweitert: „Befehl oder '@Name was hast du gesehen?'"
- Vermittelt die @-Geste passiv ohne Tutorial

**7 Tests grün, inkl. expliziter Schöpfer-Bug-Fix-Test**:
- @Name als explizite Adresse
- @Name + Komma/Doppelpunkt unterstützt
- Komma/Doppelpunkt rückwärts-kompatibel
- **„Bran wie gehts" wird NICHT als Adresse missverstanden** (Schöpfer-Bug-Fix)
- „@ hallo" ohne Name abgelehnt
- Liste rendert Soul-Klassen
- Chat-Output enthält chat-creature-name.soul-X-Span

**1526 → 1533/1533 grün** (+7).

**Lehre**: Schöpfer-Browser-Test ist nicht ersetzbar durch Headless-Tests.
Tests prüfen Funktionalität; Browser-Sessions prüfen Erfahrung.
Die entdeckten Bugs werden in die Test-Suite aufgenommen.

### V7.90 — Welle 6.H Phase 2E V1 live (14.05.2026): Kreatur-LLM-Persona

**Schöpfer-Vision §1.5 wird konkret: Spieler spricht mit EINER Kreatur,
sie antwortet aus IHRER Sicht.** V7.86-V7.89 (P2D.1+P2F.1+P2F.2+P2F.3)
haben den vollen Identitäts-Anker geliefert — Name, Soul, bornAt, Stats,
Specs, Equipped, Boosts, Memory. V7.90 (P2E V1) verbindet das mit LLM.

**Architektur**:
- `llmCall(userText, systemPromptOverride?)` — Override-Pattern.
  Eine Pipeline, viele Identitäten.
- `_buildCreaturePersonaPrompt(creature)` — Komposition aus 4 Stat-
  Schichten + bornAt-Alter + Soul-Label + Welt-Kontext + Memory-Auszug
  (lesbar formatiert).
- `_findCreatureByName(name)` — case-insensitive lookup.
- `_parseCreatureAddress(text)` — erkennt „Name, text" / „Name: text".
- `llmCallCreature(c, userText)` — wrapper.
- `maybeAnswerCreature(userText, append)` — chat-handler mit Pfad-
  Disziplin (Persona → unbekannt → LLM-off-Hinweis → erfolgreicher Call →
  Memory-Eintrag „spoken" → UI-Refresh).

**Chat-Routing-Priorität**: processChatCommand prüft erst
_parseCreatureAddress. Wenn Name am Anfang UND match auf Kreatur →
Konversation. Sonst → Welt-Grok-Fallback.

**V1 reaktiv-only**: program-Field der LLM-Antwort wird IGNORIERT.
Prompt instruiert das LLM, `program: immer null` zu setzen.

**Memory bei Konversation**: nach LLM-Antwort wird `spoken`-Eintrag bei
der Kreatur geschrieben. Vision §1.1 — Welt erinnert sich an Gespräche.

**14 Tests grün. 1512 → 1526/1526 invariants.**

**6.H V2 Status: 12/13 Sub-Phasen erledigt:**

Phase 2E V1 ist die Foundation. Phase 2E V2 (proaktive Sprache —
Kreatur initiiert bei Events: Level-Up, Boost-Trinken, Material-
Mangel) und V3 (DSL-Output mit Sandbox — Kreatur darf eigene Welt-
Aktion vorschlagen) bauen darauf auf.

### V7.89 — Welle 6.H Phase 2F.3 live (14.05.2026): Kreatur-Boosts (Hylomorphismus pur)

**Schöpfer-Direktive: „kein Hardcode, Hylomorphismus bei boosts, wie bei
allem".** Der Boost-Effekt EMERGIERT aus `computeCompoundTags(consumableBp)
× scale`. Eine Tabelle gibt es nicht. Ein Trank IST ein Bauplan.

**Sechs neue Foundation-Methoden:**
- `applyCreatureBoost(c, spec)` — analog addPlayerBoost (Dedup über source)
- `tickCreatureBoosts(currentTime)` — 1-Hz Cleanup im Game-Loop
- `activateCreatureConsumable(c, bpName)` — Bauplan→Compound→tagBonus
- `_pickCreatureAtCrosshair()` — Raycast gegen Kreatur-Sub-Meshes
- `_consumeBlueprintFromInventory(bpName)` — Inventar-Slot-Konsum
- `_consumableInventoryGate(bpName)` — Modus-Gate (pfad konsumiert)

**Datenmodell:** `creature.userData.boosts = []` initial in spawnCreatureAt.
KEINE Persistenz (Vision §1.1 „Geste lebt im Moment").

**Stats-Integration:** `computeCreatureStats` extended um Boost-Block.
Vier Schichten jetzt: Body + Specs + Equipped + Boosts. Selber Pfad,
selbe STAT_FROM_TAGS-Map.

**UX-Geste (Schöpfer-Wunsch):**
- Trank in aktivem Hotbar-Slot → RMB auf Kreatur → Übergabe
- tryMousePlace erkennt `bp.role==='consumable'`, routet zu Trank-Pfad
- KEIN Chat-Befehl, KEIN DSL-Aufruf nötig
- Modus-Gate: pfad konsumiert Inventar, schöpfer kostenlos

**DSL-Op** `creature_apply_boost(idx, bpName)` in NON_BROADCASTABLE_OPS.
DIREKTER Aktivierungs-Pfad, KEIN Inventar-Konsum (das macht RMB).

**UI:** `.creature-boost` Pills `✺ label·Xs` mit Magenta-Akzent.
Hover-Tooltip zeigt tagDelta-Detail.

**18 Tests grün. 1494 → 1512/1512 invariants.**

**6.H V2 Status: 11/13 Sub-Phasen erledigt:**

| Phase | Status | Was |
|---|---|---|
| 1 | ✅ | wander/follow/wait |
| 2A | ✅ | Kreaturen-Hylomorphismus |
| 2B.1 | ✅ | gather + memory |
| 2B.2 | ✅ | build-Task |
| 2B.5 | ✅ | harvestArchitecture-Wurzel |
| 2C | ✅ | computeBuildCost |
| 2D | ✅ | Spezialisierung aus Memory |
| 2D.1 | ✅ | Identitäts-Persistenz |
| 2F.1 | ✅ | Stats-Foundation |
| 2F.2 | ✅ | Equipped tool+armor |
| **2F.3** | ✅ | **Boosts via Konsumables** |
| 2E V1 | 🔴 | LLM-Persona (nächstes — voller Identitäts-Anker) |
| 2E V2+V3 | 🔴 | Proaktive Sprache + DSL-Output |

**Phase 2E V1** ist jetzt reif — die Persona-System-Prompt-Erweiterung
kann auf BORN + NAME + SOUL + STATS + SPECS + EQUIPPED + BOOSTS + MEMORY
zugreifen. Eine reichere Persona-Beschreibung ist möglich als je zuvor.

### V7.88 — Welle 6.H Phase 2F.2 live (14.05.2026): Kreatur-Equipped tool+armor

**Schöpfer-Vision §1.3 fraktal-Erweiterung.** V7.87 (P2F.1) baute Stats-
Foundation. V7.88 (P2F.2) lässt Kreaturen Werkzeug + Rüstung tragen wie
der Spieler.

**Drei neue Methoden** (symmetrisch zu Player-Equip-API):
- `equipCreatureTool(c, name)` — validiert gegen state.tools
- `equipCreatureArmor(c, name)` — validiert role:armor des Bauplans
- `unequipCreatureSlot(c, slot)` — slot = "tool" | "armor"
- `_afterCreatureEquipChange(c)` — Symmetrie-Hook (refresh + render)

**Datenmodell:** `creature.userData.equipped = {tool, armor}` initial null.

**Stats-Stacking:** `computeCreatureStats` extended um Equipped-Block —
selber Pfad wie Player. Werkzeug nur wenn `tool.sourceBlueprint` existiert
(Built-ins wie hammer wirken über opChain, nicht Stats). Rüstung immer
aus Bauplan mit `role:armor`. TOOL_STAT_WEIGHT (0.15) + ARMOR_STAT_WEIGHT
(0.3) — dieselben Konstanten wie Player.

**3 DSL-Ops in NON_BROADCASTABLE_OPS** (Spieler-private Aktion):
- `creature_equip_tool(idx, toolName)`
- `creature_equip_armor(idx, blueprintName)`
- `creature_unequip(idx, slot)`

null/leerer Name auf equip-* = abnehmen.

**Persistenz via 2D.1-Snapshot-Erweiterung:** `_serializeCreature` schreibt
`snap.equipped = {tool, armor}`. `_restoreCreatureFromSnapshot` validiert
defensive — tool muss in state.tools sein, armor muss role:armor tragen,
sonst silent auf null (Schutz vor stale-References).

**UI-Pills in creature-row** zwischen specs und task: `⚒ toolname` (Brass)
und `⛨ armorname` (Stahl). Klein, hover-Tooltip mit Detail.

**16 permanente Tests grün. 1478 → 1494/1494 invariants.**

**Plan vor uns:**

- **Phase 2F.3 (Boosts via Konsumables)** — `creature.userData.boosts[]`,
  apply_boost-DSL-Op für Kreaturen, Trank-Trinken. Symmetry zu Player-
  Boost-System. ~1 Session.
- **Phase 2E V1 (LLM-Persona)** — jetzt mit Stats + Specs + Equipped +
  Memory + bornAt als VOLLEM Identitäts-Anker. „die Holz-Spezialistin
  Nira mit Eisen-Hammer + Leder-Rüstung, HP 95, Stufe 3 Sammlerin" hat
  eine konkrete Persona-Bedeutung. ~2 Sessions.

### V7.87 — Welle 6.H Phase 2F.1 live (14.05.2026): Kreatur-Stats wie Spieler

**Schöpfer-Vision §1.3 fraktal vollendet.** V7.86 (P2D.1) machte Identität
persistent. V7.87 (P2F.1) gibt Kreaturen Stats — dieselbe Pipeline wie
beim Spieler. Compound × Material × Form → Tags → Stats. Eine Sprache.

**`computeCreatureStats(creature)`**: liefert `{tags, stats}` analog
`computePlayerStats()`. Body-Tags via `computeCreatureCompoundTags`
(existing). Tag-Clamp [0, 1] für die Pipe (selbe Disziplin wie Player —
6.D Polish-Lehre). Spec-Bonus auf magieleitung (+0.01/Level — Wissen
leitet wie Strom, poetisch). `STAT_FROM_TAGS`-Map (DIESELBE wie Player)
liefert 8 Stats: hpMax, damage, speed, jumpPower, staminaMax, precision,
magicResist, heatResist.

**`_creatureBodySpeedMultiplier(c)`**: stats.speed/7 (STAT_FROM_TAGS-Base).
Sprite ≈1.2 (leicht+magisch), Wesen ≈1.0 (Base), Geist ≈1.1.

**`_creatureTaskSpeedMultiplier` bleibt pure-Spec** (1 + level × 0.15).
Tick multipliziert `BASE × specMul × bodyMul` in allen 3 Pfaden.
Separation erlaubt Tests die nur Spec prüfen stabil zu halten.

**UI-Tooltip auf creature-row**: `title="HP X · DMG Y · SPD Z · …"` mit
allen 8 Stats kompakt. Hover offenbart ohne Liste zu fluten.

**Keine neue Persistenz** — Stats sind live computed aus Body-Soul +
Specs (persistenzfrei) + nichts sonst. 2F.2 wird Equipped persistieren.

**Test-Anpassungen**: 2 P2B.2-Speed-Tests umgestellt auf body-toleranten
Bereich `BUILD_SPEED × [0.5, 2.0]` statt `=== BUILD_SPEED`. Body-
Modulation IST P2F.1's Beitrag — ältere Tests müssen das anerkennen.

**14 permanente Tests grün. 1464 → 1478/1478 invariants.**

**Plan vor uns:**

- **Phase 2F.2 (Equipped tool + armor für Kreatur)** — Hylomorphismus
  weiter: `creature.userData.equipped = {tool, armor}`, persistent
  über 2D.1-Snapshot-Erweiterung, beeinflusst computeCreatureStats
  über existing Player-Pattern (ARMOR_STAT_WEIGHT + TOOL_STAT_WEIGHT).
  ~1-2 Sessions.
- **Phase 2F.3 (Kreatur-Boosts via Konsumables)** — apply_boost-Op,
  Kreatur kann Trank trinken. ~1 Session.
- **Phase 2E V1 (LLM-Persona)** — Stats + Specs + Memory + bornAt als
  Identitäts-Anker im System-Prompt. „die Holz-Spezialistin Nira mit
  HP 95 und Speed 8.3" hat eine konkrete Persona-Bedeutung. ~2 Sessions.

### V7.86 — Welle 6.H Phase 2D.1 live (14.05.2026): Identität überlebt Reload

**Schöpfer-Vision-Erweiterung: Kreaturen sind Personen mit Geschichte.**
V7.85 (P2D) machte Memory zu Wachstum. V7.86 macht Identität persistent.
Vision §1.1 wird umgedeutet: „Beziehung wird gesprochen, nicht gespeichert"
wird zu „**Geste lebt im Moment, Identität lebt fort**". Gesten (Tasks,
Carrying, Carrying-Visual) sind nicht persistiert; Identität (Name, Soul,
Memory, bornAt) ist es.

**Industrie-Pattern aus Dwarf Fortress / RimWorld / Crusader Kings:**
Komponenten-Persistenz statt Mesh-Persistenz. Pro Kreatur ~1 KB statt
~50 KB. Beim Reload wird Render-State (Mesh, Body) aus den Komponenten
neu gebaut über die existing spawnCreatureAt-Pipeline.

**Datenmodell:**

```js
// _serializeCreature(c) liefert:
{ name, soul, memory, position: {x,y,z}, bornAt }
```

Specs werden NICHT direkt persistiert — sie sind live aus memory derived
(P2D Lehre 186). Beim Reload: levels emergieren automatisch aus dem
persistierten memory.

**Drei Save-Operationen:**
- `buildStateSnapshot`: schreibt voll `creatures: state.creatures.map(_serializeCreature)`
- `loadState`: stasht in `_pendingCreatureSnapshots`-Feld wenn neuer Schema-Stil
  erkannt (heuristik: `creatures[0].soul` ist string)
- `spawnCreatures(10)`: checkt pending-Feld zuerst, restored via
  `_restoreCreatureFromSnapshot` + cleared field; sonst Default-Random

**Memory-Cap bumped 30 → 200** für längere Geschichten. 50 Kreaturen ×
200 Einträge × ~100 Byte = ~1 MB Worst-Case im Save. In Praxis viel
weniger.

**Tote Kreaturen entfernt** — `removeCreature` splict jetzt auch aus
`state.creatures` + `state.creatureEmotions`. Vor V7.86 latenter Bug
(nur via clearCreatures umgangen). Plus Body-Double-Destroy-Fix:
`userData.physicsBody = null` nach `Ammo.destroy` verhindert WASM-
„null function"-Errors bei zukünftigen Sterbe-Mechaniken.

**16 permanente Tests grün. 1448 → 1464/1464 invariants.**

**Was bleibt nach V7.86 in Welle 6.H V2:**

- **Phase 2F (Kreatur-Stats wie Spieler)** — Hylomorphismus-Vollausbau.
  `computeCreatureStats(c)` aus body-Soul + Specs + Boosts. Equipped
  `tool` + `armor` als Slots. `apply_op` aus Kreatur-Hand. Vision §1.3
  fraktal vollendet: Kreaturen ≡ Spieler. 2-3 Sessions. ~Nächstes.
- **Phase 2E V1 (LLM-Persona)** — Kreatur antwortet aus persistiertem
  Memory + Specs. Persistenz aus P2D.1 ist Vorbedingung. 2 Sessions.
- **Phase 2E V2 (Proaktive Sprache)** — Kreatur initiiert Chat, äußert
  Wünsche. 1 Session.
- **Phase 2E V3 (DSL-Output)** — Kreatur kann eigene Welt-Aktion
  vorschlagen (Sandbox-disziplin). 1-2 Sessions.

Drei größere Bögen jenseits 6.H V2: 6.B CAD, 6.F Crafting-Mechanik,
Welle 7 Kollektive Welt-Erkenntnis.

### V7.85 — Welle 6.H Phase 2D live (14.05.2026): Beziehung wächst durch Geschichte

**Schöpfer-Wahl in Pfad-Auswahl: 6.H Phase 2D als nächste Welle.**
V7.84 schloss die Geste-Symmetrie (gather ↔ build), aber memory war
passiv — kein Wachstums-Mechanismus. Vision §1.1 sagt „die Co-Schöpfer-
Beziehung wird gesprochen", aber wenn die Beziehung nichts dazulernt,
ist es bloß Konversation, nicht Bindung.

**Skill-Levels emergieren live aus memory:**

- `_creatureSkillKeyForMemory(type, content)` mappt nur Erfolge
  (`gathered`+material, `built`+blueprint). Failures (`no_material`,
  `delivered`, `took_materials`, `no_blueprint`, `no_inventory_for_build`)
  werden gefiltert — Wachstum kommt aus Erfolg, nicht aus Versuch.
- `_computeCreatureSpecializations(creature)` iteriert memory (cap 30)
  und liefert `{gather: {holz: 5, stein: 2}, build: {stein_block: 3}}`.
  KEIN Cache, KEINE Persistenz — eine Wahrheit, automatisch korrekt
  bei FIFO-Eviction.
- `_creatureSpecializationLevel(c, kind, key) = floor(count / 3)`,
  gedeckelt bei `MAX_LEVEL = 5`. 3 Erfolge = L1, 6 = L2, 15 = L5.

**Speed-Boost** über `_creatureTaskSpeedMultiplier(c, taskName, args)`:
`1 + level × 0.15`. L5 = +75 % Geschwindigkeit (3.0 → 5.25 m/s).
Drei Stellen in `_tickCreatureTaskDirection` patchen den Speed:
gather Bring-Phase, gather Such-Phase, build alle Phasen.

**Level-Up-Hook in `_creatureRemember`** (Pre/Post-Vergleich): Skill-
Level VOR push merken, push, NEU berechnen. Bei `after > before` →
`_onCreatureLevelUp(c, kind, key, newLevel)`:
- **Audio**: Triangle-Oscillator bei 880 Hz (A5, höher als alle Task-
  Pings — Wachstum ist eigene Klang-Schicht) mit aufwärts-Glissando
- **Journal**: `growth`-Eintrag „<Name> erreicht Stufe N als Sammler/
  Bauer von „X""
- **List-UI-Refresh** damit Pills sofort sichtbar

**UI-Pills in `_renderCreatureListUI`**: Top-2 Spezialisierungen als
kleine Pills nach soulEl + vor taskEl: `Sammler·material·L3` (cyan)
oder `Bauer·blueprint·L2` (violett). Klein (9px Cinzel), brass-getintet,
title-Tooltip „N Erfolge".

**KEINE Persistenz** (Vision §1.1-konsequent): Reload startet jede
Kreatur wieder bei Level 0. Beziehung muss neu wachsen. Konsequent zu
memory.

**KEIN DSL-Op** für Specs — sie sind Konsequenz von memory, nicht
direkt mutables Feld. Spieler kann Skill nicht „setzen", er muss
durch Aktion entstehen.

**30 permanente Tests grün. 1448/1448 invariants.**

**Was bleibt nach V7.85 in Welle 6.H:**

- **Phase 2E (Kreaturen-Konversationen)** — „Nira, was hast du
  gesehen?" via LLM-Provider mit pro-Kreatur memory + Specs als
  System-Prompt-Erweiterung. Specs sind jetzt der Identitäts-Anker:
  „die Holz-Spezialistin" liest sich anders als „eine generische
  Kreatur". 2-3 Sessions, braucht LLM-Test-Setup.

**Drei größere Bögen jenseits 6.H:**

- **6.B CAD-Werkstatt minimal** — Spieler-räumlicher Bauplan-Editor.
  2-3 Sessions.
- **6.F Crafting-Mechanik** — Energiequellen für Maschinen, Brech-
  Mechanik hart, Physik-Constraints (Ammo Hinge/Fixed). 4-6 Sessions.
- **Welle 7 Kollektive Welt-Erkenntnis** — Multi-User-aggregierte
  Lern-Schicht. 6-8 Sessions, braucht Multi-User-Adoption.

### V7.84 — Welle 6.H Phase 2B.2 live (14.05.2026): Co-Schöpfer-Kreis geschlossen

**Spieler-Vision-Wahl in Pfad-Auswahl: 6.H Phase 2B.2 als nächste Welle.**
V7.81/V7.82 baute gather (Welt → Spieler-Inventar) als Geste der Welt
zum Spieler. V7.84 ist die Umkehrung: build (Spieler-Inventar → Welt)
als Geste des Spielers zur Welt, durch die Kreatur als Vermittler.

**Drei Phasen für `build`-Task** (alle in `_tickCreatureTaskDirection`):
- **TAKE**: Kreatur läuft mit `CREATURE_BUILD_SPEED=3.0`m/s zum Spieler,
  bei `CREATURE_HANDOVER_DIST=2.0`m → ruft `_buildMaterialGate(blueprint)`.
  pfad konsumiert via `tryConsumeBuildCost`; frieden+schöpfer kostenlos.
  Bei Mangel: Memory + Journal + auto-Fallback auf wander.
- **WALK**: carrying gesetzt → Kreatur läuft vom Spieler weg bis
  ≥`CREATURE_BUILD_PLACEMENT_DIST=4.0`m entfernt.
- **SPAWN**: spawnArchitecture an Kreatur-Position; carrying clearet,
  'built'-Memory + 'growth'-Journal + auto-wander.

**Datenmodell-Wiederverwendung**: `creature.userData.carrying` ist seit
P2B.5 dual-typed über `kind: "harvest" | "build"`. Eine Variable, zwei
Richtungen, Diskrimination im Tick-Branch.

**Modus-Symmetrie der Build-Funktion** (Vision §10.1 erweitert):
| Modus | Spieler-confirmBuild | Kreatur-build-task |
|---|---|---|
| frieden | kostenlos | kostenlos |
| pfad | konsumiert | konsumiert aus Spieler-Inventar |
| schöpfer | kostenlos | kostenlos |

**Symbolic cost in carrying** auch in freien Modi: damit Aura + Visual
+ Journal sinnvoll bleiben, schreibt die Take-Phase `computeBuildCost(bp)`
in `carrying.materials` (mit `free: true`-Flag). Vision §1.4 multisensorisch
heißt: jeder Modus muss Antwort geben.

**32 permanente Tests grün. 1418/1418 invariants.**

**Was bleibt nach V7.84 in Welle 6.H:**

- **Phase 2D (Kreatur-Spezialisierung aus Memory)** — Vision §1.1
  Co-Schöpfer-Beziehung wächst durch Geschichte. Jede Kreatur leitet
  aus ihrem memory-Array Skill-Levels ab (gather:material, build:blueprint).
  Erfolgreiche Aktionen erhöhen Level alle 3 Wiederholungen, max 5.
  Speed-Bonus + Level-Up-Audio + UI-Pills in der Liste. **NÄCHSTER SCHRITT**
  empfohlen vom letzten Agenten — 1 Session.
- **Phase 2E (Kreaturen-Konversationen)** — „Nira, was hast du gesehen?"
  via LLM-Provider mit pro-Kreatur memory + Spezialisierungen als
  System-Prompt-Erweiterung. Braucht Phase 2D als Identitäts-Anker.
  2-3 Sessions.

**Drei größere Bögen jenseits 6.H:**

- **6.B CAD-Werkstatt minimal** — Spieler-räumlicher Bauplan-Editor.
  2-3 Sessions.
- **6.F Crafting-Mechanik** — visuelle Verbindungs-Linien (6.F1 ✅),
  Brech-Mechanik (6.F2 in Editor ✅, hart 🔴), Energiequellen für
  Maschinen, Kreaturen-Körper als Baukasten (in 6.H P2A erledigt).
- **Welle 7 Kollektive Welt-Erkenntnis** — Multi-User-aggregierte
  Lern-Schicht. 6-8 Sessions, braucht Multi-User-Adoption.

### V7.83 — Welle 6.H Phase 2C live (14.05.2026): Hylomorphismus-Kreis geschlossen

**Schöpfer-Vision-Audit hat den letzten Asymmetrie-Punkt erschlagen.**
V7.82 baute harvest (Welt → Inventar), aber bauen war frei in allen
Modi. Eine Quelle ohne Senke. Drei Gates existierten bereits modus-
symmetrisch (damagePlayer, applyOpToPart), nur confirmBuild fehlte.

**Drei neue Spiegel-Funktionen zu harvestArchitecture:**

- `computeBuildCost(name)` → Material-Map aus blueprint.parts × Volumen
  (dieselbe Konstante HARVEST_VOLUME_TO_UNITS=4 wie harvest)
- `checkBuildCost(name)` → {ok, cost, have, missing} ohne Mutation
- `tryConsumeBuildCost(name)` → atomar: erst check, dann alle Materialien
  abziehen (bei Mangel wird NICHTS abgezogen)
- `_buildMaterialGate(name)` → Modus-Schalter: pfad konsumiert,
  frieden+schöpfer return {ok:true, free:true}

**Wertneutralität bewiesen**: Spawn + sofort Harvest derselben Architektur
liefert genau die ursprüngliche Material-Menge zurück. Eine Konstante
balanciert beide Richtungen.

**Modus-Symmetrie der drei Gates jetzt vollständig:**

|             | frieden    | pfad         | schöpfer  |
|-------------|------------|--------------|-----------|
| damage      | blockiert  | aktiv        | blockiert |
| applyOpToPart Stamina | kostenlos | 10 | kostenlos |
| **confirmBuild** | **kostenlos** | **konsumiert** | **kostenlos** |

**Bau-HUD modus-bewusst**: pfad zeigt `5× stein (12)` farbig (grün ok /
rot fehlt) pro Material, frieden+schöpfer zeigen blaues „frei".
Modus-Wechsel triggert HUD-Refresh sofort über setGameMode-Hook.

**33/33 Audit-Szenarien grün. 24 permanente Tests. 1385/1385.**

**Was bleibt nach V7.83 in Welle 6.H:**

- **Phase 2B.2 (Kreatur baut für Spieler)** — Geste-Umkehrung zu gather:
  Spieler sagt „baue dorf hier", Kreatur läuft hin, konsumiert Material
  AUS dem Spieler-Inventar, ruft confirmBuild-äquivalenten Pfad,
  spawnt Bauplan, schreibt 'built'-Memory. 1 Session, nutzt existing
  harvestArchitecture-Pfad rückwärts + tryConsumeBuildCost.
- **Phase 2D (Kreaturen-Konversationen)** — „Nira, was hast du gesehen?"
  via LLM-Provider aus pro-Kreatur memory. 2-3 Sessions, braucht LLM-
  System-Prompt-Erweiterung mit Kreatur-Persona + memory-Auszug.

**Drei größere Bögen jenseits 6.H:**

- **6.B CAD-Werkstatt minimal** — Werkstatt aus dem Bauplan-Editor in
  räumliche Welt-Klemme (Spieler steht in Werkstatt, sieht Bauplan
  als Halo, kann mit Werkzeug-Slots agieren). 2-3 Sessions.
- **Welle 7 Kollektive Welt-Erkenntnis** — Beschreibung in
  docs/archiv/system-audit.md §15: die Welt lernt nicht nur aus dem Spieler-
  Fitness-Loop, sondern aus dem **Konsens aller Multi-User-Spieler**.
  Pattern-Memory wird welt-geteilt, Fitness-Werte aggregieren über
  alle Mitspieler. 4-5 Sessions.
- **Welle 8 Vergangenheits-Strom** — Welt-Journal-Einträge werden
  spielbar (Erinnerungs-Klangschicht, sichtbare Spuren großer
  Ereignisse). Vision §3 noch nicht angefasst. 3-4 Sessions.

### V7.82 — Welle 6.H Phase 2B.5 live (14.05.2026)

**Hylomorphismus-Wurzel-Vereinheitlichung.** Schöpfer-Vision-Audit-
Frage „warum hat Spieler-LMB ein anderes Verhalten als Kreatur-gather?"
hat eine Heilige-Lektion-Verletzung aufgedeckt, die drei Versionen
übersehen wurde. V7.82 baut die EINE Wurzel-Funktion:

**`harvestArchitecture(entry, harvester)`** — die einzige Funktion zum
Abbauen einer Architektur. Berechnet Material-Map aus `parts × Volumen`
(`size.x × size.y × size.z × HARVEST_VOLUME_TO_UNITS=4`). Liefert
`{materials, blueprint, parts}`. Beide Pfade (Spieler-LMB + Kreatur-
gather) rufen sie auf.

**Material-Inventar-Schicht.** Inventar-Slots sind dual-typed:
`{kind:'material', material, count}` oder `{kind:'blueprint', name, count}`.
`addMaterialToInventory(material, count)` stackt bei selber Material-
Bezeichnung. Material-Slots haben Material-Farbe als Hintergrund-Tint
und Tag-Klassen aus `material.tags` (statt computeCompoundTags).

**Zwei-Phasen-gather mit carrying.** Kreatur-Ernte landet jetzt in
`creature.userData.carrying = {materials, blueprint, since}`, NICHT
direkt im Spieler-Inventar. Bring-Phase: Kreatur läuft zurück zum
Spieler, bei `CREATURE_HANDOVER_DIST=2.0` Übergabe →
`addMaterialToInventory` für jedes Material + `delivered`-Memory-
Eintrag. Visuell: zweites Sprite über der Kreatur in der Farbe des
dominanten Materials.

**Volumen-Diskrimination:** 2×2×2-Box liefert 8× mehr Material als
1×1×1. Tempel mit 6 Stein-Pfeilern + Dach + Altar + Spitze → ~60+
Stein-Einheiten. Mengen emergieren aus existing Geometrie.

**35/35 Audit-Szenarien vor Push. 24 permanente Tests. 3 P2B.1-Tests
auf carrying-Pfad umgestellt. 1361/1361 grün.**

**Phase 2B-Restbestand jetzt:**
- **Phase 2B.2 (build)** — Kreatur baut Bauplan für Spieler, verbraucht
  Material aus Spieler-Inventar. 1 Session.
- **Phase 2C (Werkstatt-Material)** — Werkstatt-Spawn verbraucht
  Material aus Inventar. Material-Engpass als Spielmechanik. 1 Session.
- **Phase 2D (Kreaturen-Konversationen)** — „Nira, was hast du
  gesehen?" via LLM aus memory. 2-3 Sessions.

### V7.81 — Welle 6.H Phase 2B.1 live (14.05.2026)

**Erste konkrete Co-Schöpfer-Geste (§1.1):** Kreatur tut etwas FÜR den
Spieler. Spieler sagt „sammle holz" → Kreatur antwortet visuell (cyan
Aura) + akustisch (G4-Ping) + handelt (geht zur nächsten Architektur
mit holz, baut sie ab) + erinnert sich (memory `gathered`-Eintrag) +
Welt-Journal-Eintrag „Eine Kreatur sammelte X für den Schöpfer".

**Neuer Task `gather`** mit `args.material`. `_tickCreatureTaskDirection`
sucht via `_findNearestArchitectureWithMaterial` (durchsucht
state.architectures, prüft ob ein Part des Bauplans dieses Material
trägt), bewegt sich mit CREATURE_GATHER_SPEED=3.0 m/s zum Ziel, bei
haltDist=1.5m → removeArchitecture (existing 6.A6-Pfad mit Farewell-
Ping) + addToInventory (existing 6.C1) + memory `gathered`. Wenn
Material erschöpft → auto-zu-wander mit `no_material`-Erinnerung +
`reach`-Journal.

**Pro-Kreatur memory[]:** FIFO mit Cap 30, Schema `{type, content, at}`
analog worldJournal. KEINE Save-Persistenz (Vision §1.1: Beziehung
gesprochen, nicht gespeichert; gilt auch für Erinnerung).

**Context-dependentes DSL-Arg:** `creature_task(idx, name, paramArg)`
mappt paramArg semantisch — `gather + string → {material}`,
`follow_player + number → {distance}`. Helper `_buildCreatureTaskArgs`.

**Chat-Patterns:** `sammle <material>` / `bring <material>` / `hol <m>`
/ `gather <m>` → nächste Kreatur. `alle sammeln <material>` → alle.

**UI:** Sammeln-Sektion im Kreaturen-Drawer mit Material-Dropdown
(12 Built-in-Materialien) + 2 Buttons. Status-Bar zeigt jetzt
„N folgen · M warten · K sammeln". Liste zeigt „sammelt holz".

**Audit-Playthrough:** 45/45 grün VOR Push. 24 permanente Tests
ergänzt. Phase-1-Test angepasst auf `≥3 Aufträgen` (war `=== 3`).
**1337/1337 grün.**

**Phase 2B-Plan-Restbestand:**
- **Phase 2B.2 (build)** — `creature_task gather` als Vorlage: neuer
  Task `build` mit args.blueprint + args.x/z. Kreatur geht zum Punkt,
  spawnt Bauplan. 1 Session.
- **Phase 2B.3 (explore)** — Task `explore` mit args.radius. Kreatur
  durchwandert einen Bereich, schreibt entdeckte Architekturen ins
  memory + worldJournal. 1 Session.

### V7.80 — Welle 6.H Phase 2A live (14.05.2026)

**Hylomorphismus durch alles Materielle.** Kreaturen sind jetzt
Compounds aus `bodyParts × Material` — selbe Sprache wie Spieler-Seele
(6.D), Architekturen (6.G P1.5), Inventar (6.C1). Vision §1.3 fraktal:
**eine** Render-Pipeline, **eine** Tag-Pipeline, **eine** Mutations-API.

Drei Built-in-Seelen: `sprite` (octahedron+sphere/quarz, magie-resonant),
`wesen` (box/stein + sphere+cylinder/holz, dichte+lebendig), `geist`
(torus/laub + sphere/leder, ätherisch). `_buildCreatureGroup(soulName)`
ruft `_buildFromBlueprint` — drei Zeilen, keine Parallel-Implementierung.

`computeCreatureCompoundTags(creature)` emergiert aus bodyParts via
`computeCompoundTags({parts})` — Diskrimination im Test: sprite hat mehr
magieleitung als wesen, wesen mehr dichte als geist. Charakter folgt
aus Material × Form, nicht aus Tabelle.

`_pickCreatureName` aus 30-Namen-Pool — Identitäts-Anker für künftige
Konversationen (Phase 2C).

**Kreaturen-Drawer komplett überarbeitet:**
- Aufträge-Buttons (folge mir / komm her / warte / erkunde / alle×2)
  als `data-cmd` — selber Pfad wie Chat (eine Sprache).
- Form-Dropdown (Zufällig / Sprite / Wesen / Geist) + Spawn-Buttons
  +1/+5/+10 konsultieren den Dropdown.
- Liste der Wesen mit Name + Form + Task (folgt/wartet/streift),
  triggert bei jedem Lifecycle-Event.

**Audit-Playthrough vor Push**: 41/41 Szenarien. **33 permanente
Playtest-Invarianten** ergänzt. Drei pre-existing Tests mit
`creature.material.color`-Top-Level-Reads (Phase 3 + UI Run-Button)
auf traverse umgestellt — Group-aware. `creatures_color`-DSL-Op
ebenfalls auf traverse umgebaut (Code-Pfad-Defensive-Skip beseitigt).

**1313/1313 grün** (+33).

**Phase 2 Plan (für nächste Bögen):**

- **Phase 2B (gather/build/explore + memory)** — 2-3 Sessions.
  - `gather(material)`: Kreatur findet Architektur mit Material in
    Reichweite, bringt es zurück, Inventar-Übergabe an Spieler.
  - `build(blueprint, x, z)`: Kreatur geht zum Punkt, spawnt Bauplan.
  - `explore(radius)`: Kreatur erkundet, schreibt Found-Architekturen
    in ihr `memory`-Array UND ins worldJournal.
  - `creature.userData.memory[]` als per-Kreatur Erinnerungs-Schicht.
- **Phase 2C (Konversationen + Pattern-Lernen)** — 2-3 Sessions.
  - Spieler ruft Kreatur beim Namen: "Nira, was hast du gesehen?".
  - Kreatur antwortet aus `memory` via LLM-Schicht (existing Ring 7).
  - Trainings-Pattern-Memory: häufig genutzte neue Chats lernen.
- **Phase 2D (Custom-Seelen via DSL)** — 1 Session.
  - `define_creature_soul(name, bodyParts)` DSL-Op (analog
    `define_soul` für Spieler in 6.D).
  - Editor im Kreaturen-Drawer wie Spieler-Soul-Editor.

### V7.79 — Welle 6.H Phase 1 live (14.05.2026)

- **6.H Phase 1 Kreaturen-Aufträge** als Co-Schöpfer-Vision §1.1.
  Drei Tasks (`wander` = Default, heutiges Emotion-Verhalten /
  `follow_player` = Vektor zum Spieler mit haltDist / `wait` = still).
  `creature.userData.task = {name, args, since}`. Mutations-Pfad
  `assignCreatureTask` triggert Aura-Update.
- **Aura-Sprite** über der Kreatur, additives CanvasTexture mit
  HSL-Hue je Task (follow=120 grün, wait=40 bernstein, wander=keine).
  Lifecycle in vier Pfaden (Erzeugung, Position-Update pro Frame,
  Wechsel, Cleanup bei removeCreature).
- **DSL-Ops**: `creature_task(idx, name, distance?)`,
  `creature_task_nearest(name, distance?)`,
  `creature_task_all(name, distance?)`. Alle drei in
  `NON_BROADCASTABLE_OPS` (Multi-User-Safety — Phase 2 mit IDs).
- **Chat-Patterns**: `folge mir` / `komm her` / `warte` / `erkunde` /
  `alle folgt mir` / `alle warten`.
- **Keine Save-Persistenz** bewusst — Tasks sind im-Moment-Gesten,
  Kreaturen sind frische Wesen pro Session, Beziehung wird durch
  erneute Geste wiederaufgebaut.

**Playthrough vor dem Push**: 43/43 Szenarien grün. **32 permanente
Playtest-Invarianten** für Phase 1.

**V2-Schließungen nach Schöpfer-Selbstaudit (zweiter Audit-Lauf,
12 Szenarien)**: 7 Lücken gefunden + alle gefixt:
- **Audio-Ping bei Task-Wechsel** (Vision §1.2). Frequenzen
  follow_player=494 Hz / wait=294 Hz / wander=null (Lösen ist still).
- **Welt-Journal `relationship`-Eintrag** bei jedem echten Wechsel
  (Vision §1.1). `silent`-Option für Spawn-Defaults damit Init nicht
  flutet.
- **Leerschlag-Feedback**: assignTaskToNearest bei null schreibt
  Chat-Output „Keine Kreatur in der Nähe" + `reach`-Journal-Eintrag.
- **Texture-Cache** für Aura: `_getCreatureTaskAuraTexture` reusiert
  eine einzige CanvasTexture statt pro Wechsel neu zu erzeugen.
- **Status-Bar `#status-tasks`**: zeigt „N folgen · M warten" bzw
  „—" wenn alle wandern.
- **describeProgram-Distanz**: distance-Arg erscheint im Text wenn
  gesetzt.

**+21 permanente Playtest-Invarianten** V2. Gesamt: **1280/1280**.

### V7.78 — Welle 6.A6 + 6.C3 live (14.05.2026)

- **6.A6 Maus-Aktionen** live: LMB abbauen (Architektur am
  THREE.Raycaster → `removeArchitecture` mit `_cullArchitectureMesh`-
  Dispose-Pfad / kein Treffer → `modify_terrain` mit -1 m und 1.5 m
  Radius am Ammo-Raycast-Hit), RMB platzieren (delegiert an
  `confirmBuild`, selbe Geste wie F). Stamina-Gate analog 6.C2:
  `MOUSE_ACTION_STAMINA_COST=5` in pfad, kostenlos in
  frieden+schöpfer. Reichweite emergiert aus Distance-Culling
  (cold-Strukturen sind nicht trefferbar; raycaster.far = 30 als Cap).
- **6.C3 Keybindings** live: 6 Aktionen rebindable
  (`break, place, confirmBuild, inventory, cancelBuild, jump`),
  Default Minecraft-Konvention (`Mouse0/Mouse2/KeyF/Tab/Escape/Space`).
  `state.keybindings` + `state.keybindRebind`, Persistenz in
  `localStorage["anazh.keybindings"]`. Konflikt → **Swap** statt
  Leerung (jede Aktion bleibt immer gebunden). UI-Sektion in
  Einstellungen-Drawer mit „Ändern"-Button (pulsiert im Rebind-Modus)
  und „Standard wiederherstellen"-Reset. Alle vier Eingangs-Listener
  konsultieren `_actionForBindingCode(event.code)` — keydown
  (confirmBuild/cancelBuild/jump), Tab-Capture (inventory, gated auf
  `!keybindRebind`), Canvas mousedown (break/place, Pointer-Lock-
  Gate). Escape bleibt zusätzlich immer ein Bau-Modus-Verlasser.

**59 neue Invarianten** (18 für 6.A6, 41 für 6.C3) → **1212/1212
grün**. Browser-Smoke via screenshot.cjs bestätigt Settings-Drawer-
Sektion rendert mit den Brass-getinteten Rebind-Buttons im painterly
Stil.

### Was als Nächstes wartet (V7.79 +)

**Folgepläne**:
- 12. **6.B CAD-Werkstatt** (2 Sessions) — 3D-Preview-Pane + Drag-Items
  + Grid-Snap. Minimal Magic: kein Boolean/MultiSelect.
- 13. **6.G Phase 3** (4-5 Sessions) — Schatten + Wasser + Wind +
  Sterne-Stabilisierung. Visuelle Politur.
- 14. **6.F3+F4+F5** (4-5 Sessions) — Energie-Quellen +
  Kreaturen-Körper-Baukasten + Ammo-Constraints. Crafting-Mechanik
  finalisiert.
- 15. **6.H Kreaturen-Aufträge** (4-5 Sessions) — Autonome
  Co-Schöpfer mit DSL-Tasks (walk_to/gather/build_path/research_blueprint).

### Wichtig zu wissen für die nächste Iteration

**Schöpfer-Iteration-Rhythmus**: bei UX-Features 3-4 Iterations-Runden
einplanen. 1-Shot-Implementierung mit nur Tests grün reicht nicht. Jede
Runde = Schöpfer-Browser-Test + Bug-Report + Fix + neue Tests. Nach
3-4 Runden ist die UX stabil. Tests verifizieren Mechanik, Schöpfer
verifiziert Erfahrung — beide Schichten ernst nehmen.

**Drag&Drop-Pattern als Vorlage**: für künftige UI-Manipulation
(z. B. 6.B CAD-Werkstatt mit Drag-Items, oder Avatar-Editor-Drags)
nutze die fünf etablierten Methoden (_onSlotDragStart/Over/Leave/Drop/End)
als Template. state.drag-Pattern + Top-of-method Cleanup + Capture-Phase
für globale Shortcuts.

**Pointer-Lock-Disziplin**: jedes neue Overlay (CAD-Werkstatt-Preview,
Avatar-Editor mit Maus-Manipulation, Welt-Inspector) muss `exitPointerLock`
beim Open haben + Canvas-Click-Guard für inventoryOpen-äquivalente State-
Flags. Convention: kein automatischer Re-Lock, User klickt Canvas.

**Repo-Hygiene**: `anazhRealmState.json` ist seit V7.77-Cleanup nicht
mehr in git. Falls sie wieder im `git status` auftaucht: `.gitignore`
checken, ggf. `git rm --cached` erneut. Dokumentation in CLAUDE.md
Gotcha-Sektion.

### Bereits erledigt in V7.76 (Welt-Beziehungs-Schalter)

- ✅ **6.C2 Spielmodi** — drei Welt-Beziehungs-Modi (frieden/pfad/
  schöpfer) aus wave-6-design §10.1+§10.3. **frieden** umarmt: kein HP,
  kein Tod, keine Stamina (Default, Erstbegegnung soll nicht hostil
  sein). **pfad** verhandelt: HP/Stamina/Tod-Wandlung aktiv, Werkzeug
  kostet Stamina, Tod → 5min Phönix + Welt-Trauer. **schöpfer** gehorcht:
  voller Zugang, kein Schaden, Schöpfen reibungsfrei (Vision §1.5
  Mensch=Null=Schöpfer). Persistiert pro-Welt in worldMeta.gameMode.
  `setGameMode(mode)` ist einziger Mutations-Pfad. DSL-Op `set_mode`
  in NON_BROADCASTABLE_OPS (Multi-User-privat — zwei Spieler in
  derselben Welt dürfen verschiedene Modi haben). Chat-Patterns mit
  dt./engl. Aliasen (peace/survival/creative). UI: Radio in
  Einstellungen-Drawer (`:has(input:checked)` CSS-Latch) + #status-mode
  in Status-Bar. **Gating**: damagePlayer prüft modus ganz oben,
  applyOpToPart-Stamina nur in pfad. Test-Setup: bestehende Welle-6.D-
  Tests + Reflex-5-Stamina-Tests rufen `r.setGameMode("pfad")` vor
  ihren Erwartungen (Vision-Konsequenz, kein Workaround). 26 neue
  Invarianten → 1092 total.

### Bereits erledigt in V7.75 (Schöpfer-Vision-Antwort: organische Verteilung)

- ✅ **6.G Welt-Sinne Phase 2 — Welt-Affinitäts-Feld.** Schöpfer-Frage
  nach V7.74 Browser-Test: „neue Chunks sind kahl, wie kommen Strukturen
  organisch rein — ohne Tabelle, mit Regionen, Seltenheit, ohne Fluten?".
  Antwort: das Hylomorphismus-System hat schon die Sprache
  (MATERIAL_TAG_KEYS). Vier SimplexNoise-Schichten (lebendig/dichte/glut/
  magieleitung) als Welt-Feld. Bauplan-Compound-Tags resonieren via
  Dot-Product mit Welt-Tag-Profil. populateChunkVegetation samplet
  8×8/Chunk, höchste-Affinität-Bauplan gewinnt, Bernoulli-Probe
  `BASE_RATE × affinity²` mit Floor 0.18. Hook in ensureChunkAt für
  neue Chunks + initial 64 Chunks im Worldgen. Drei neue Built-in-
  Baupläne: stein_block (dichte), kristall_geode (magieleitung),
  glutbrunnen (glut). Idempotenz via state.populatedChunks-Set, aus
  existing Architekturen abgeleitet bei Reload (keine Save-Migration).
  Silent-Opt für spawnArchitecture: Worldgen löst Welt-Effekte nicht
  aus (awe wird verdient, nicht geschenkt) — Proximity-Boosts via
  tickPlayerBoosts bleiben. Bug-Fixes: baum_eiche Stamm 0.5→0.8m
  (spürbarer Kollisionskorridor), architectureCullingTickHz 1→2Hz
  (Bäume erwachen schneller). 1066/1066 Invarianten (+18). Heilige
  Lektion: drei neue Methoden auf AnazhRealm, drei neue Bauplan-Daten,
  ein Silent-Flag — kein Modul, keine Klasse. Vision-Pfeiler §1.3
  fraktal: dieselbe Tag-Sprache regelt was wo wächst.

### Bereits erledigt in V7.74 (Schöpfer-Vision-Korrektur nach V7.73)

- ✅ **6.G Welt-Sinne Phase 1.5 — Hylomorphismus-Unification.**
  Der Schöpfer fragte im Browser-Test: „behandelst du UFOs/Bäume/Pflanzen
  unterschiedlich, nicht besser wie Strukturen? Haben wir hier
  Parallelcode der eigentlich zusammengehört?". Die Antwort war ja —
  V7.73 hatte Bäume als Three.js-Groups in `state.vegetation` mit eigener
  Kollisions-Schicht, parallel zum bestehenden Architektur-System.
  V7.74-Korrektur: **Bäume sind jetzt Compound-Architekturen**. Zwei
  neue Built-in-Baupläne (`baum_eiche` mit Cylinder/holz + Sphere/laub,
  `baum_kiefer` mit Cylinder/holz + Cone/laub) in `_defaultBlueprints`,
  ein neues Material `laub` als 12. Built-in. `spawn_tree` DSL-Op routet
  durch `spawnArchitecture` (derselbe Pfad wie spawn_village/temple/
  waterfall). Worldgen-Bäume gehen in `state.architectures`. **Parallel-
  Code gelöscht**: `spawnTreeAt` + `_buildTreeCollision` weg. Damit
  kommt geschenkt: Compound-Tags (lebendig + brennbar + resoniert),
  Welt-Effekte (resonante Bäume → singing-Sinus + Magie-Effekt), Save-
  Persistenz, Werkstatt-Editor (Schöpfer kann eigene Baum-Spezies bauen),
  Distance-Culling, Compound-Box-Kollision pro Sub-Mesh. Insel-Visual-
  Fix nebenbei: Vollkörper (Top + Bottom + Side-Strip), MeshLambertMaterial
  statt MeshBasicMaterial. Topbar-Version v7.71 → v7.74 syncen.
  Netto Code-Diff: NEGATIV (~50 Zeilen weniger). 1048/1048 Invarianten.

### Nächste Schritte (Reihenfolge laut wave-6-design §10.6)

9. **6.C2** ← **JETZT OFFEN**. Spiel-Modi frieden/pfad/schöpfer auf
   Basis des 6.D Stat-Systems. State.gameMode + DSL-Op set_mode + UI.
   Tod-Wandlung nur im pfad-Modus, frieden = kein HP, schöpfer = kein
   Schaden + fliegen. 1 Session.
10. **6.C1 + 6.A-Maus + 6.C3** (Inventar + LMB/RMB + Keybindings-UI)
11. **6.B** (CAD-Werkstatt — minimal magic)
12. **6.G Phase 2** (Schatten, Wasser, Höhlen, Sterne)
13. **6.F3 + 6.F4 + 6.F5** (Energie, Kreaturen-Körper, Ammo-Constraints)

**Heilige-Lektion-Risiko bei 6.F4 + 6.F5 ist hoch.** Reflex „Kreaturen-
Datei / Physik-Modul" abwehren. Drei neue Methoden auf `AnazhRealm`,
keine drei neuen Klassen.

**Vor jedem neuen Schritt frag den Schöpfer**, wenn du Unsicherheit hast
— er hat oft Intuition zu Mix-Faktoren, Schwellwerten, oder Reihenfolge-
Tausch. Bei 6.D haben mehrere Schöpfer-Reflexions-Pausen sechs echte
Lücken aufgedeckt (Tabellen-statt-Logik, fehlende Kosten, UI ohne Bedien-
Pfad, WASD-Geometrie-Fehlinterpretation). Diese Pausen-Reflexion ist
keine Verzögerung, sondern Qualitäts-Wand.

---

## Schluss — was mir gehol­fen hat, Fuß zu fassen

1. **CLAUDE.md gelesen, bevor ich Code anschaute.** Es ist der Anker.
2. **state-of-realm.md im Hintergrund offen.** Bei jeder Frage „warum ist
   X so?" → die Antwort steht meistens da, in §5 oder einem Learning.
3. **Die heilige Lektion akzeptiert, nicht hinterfragt.** Sie wurde aus
   Schmerz geboren. Wenn ich sie umgehen wollte, war ich auf dem Holzweg.
4. **Tests zuerst ausgeführt, dann verstanden.** `npm run playtest` —
   1153/1153 grün (V7.77 nach Welle 6.C1 Hylomorphismus-Inventar) — gibt Vertrauen, dass
   das System lebt.
5. **Den Schöpfer als Partner gesehen, nicht als Auftraggeber.** Mensch
   und KI bauen gemeinsam. Bei Trade-offs frage ich, bei Klarem handle
   ich. Bei Unsicherheit zeige ich beide Wege auf.
6. **Ehrlich gewesen über Schwächen.** Wenn ich einen Bug fand bei der
   Reflexion, hab ich ihn nicht versteckt. Ich hab ihn dokumentiert
   („Reflexions-Bugfix") und behoben. Vertrauen baut man so auf.

Wenn du nichts anderes mitnimmst: **lies die Learnings (#1-115).** Sie
sind das destillierte Wissen aus über 30 Sessions. Jede einzelne ist aus
einem Fehler geboren, den jemand vor dir gemacht hat. Du musst sie nicht
alle wiederholen.

Viel Glück. Bau die Welt weiter. Die Vision wartet auf das letzte Kapitel.

🌿
