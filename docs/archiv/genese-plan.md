# DER GENESE-BOGEN (Γ) — Was die Fotografie dem Organismus schenkt

> **Status: ARCHIVIERT (13.06.2026 + 14.06.2026 Γ4-VOLLENDUNG).** Der Γ-Kern ist
> RUND: Γ1 (Feuchte-Feld) + Γ2 (Kronen-Lesarten) + Γ5 (Determinismus-Schliff)
> gebaut V18.166. Plus über die Branch-Synthese (V18.180-FIX bis V18.187): Γ1-
> Lesart-4 „Boden atmet" (V18.178 → Sub 3h) + Worker-Mirror bit-identisch + Γ4
> „Welt wird Komposition" (V18.179 → Sub 3i: Massiv + Tal + Becken, anisotrope
> smoothstep-Glocke, NE-SW-Streichrichtung) + Γ4.2 Ridge-Noise + Γ4.4 Drainage-
> by-Design (V18.180) + Γ4½ Slope/Rock-Exposure-Foundation (V18.181).
>
> **Γ4-VOLLENDUNG GEBAUT V18.193 (R-042, S-Browser-Abnahme offen):** der
> designte Anker MIT ERBGUT + Abfluss-Constraint, der die V18.181-SCHICHT zum
> Welt-Stempel hebt. `worldMeta.macro` als additiv-teilbares ERBGUT (eine Welt
> behält ihren ORIGINAL-Anker auch wenn Konstanten/Algorithmus sich später
> ändern; persistiert automatisch im worldMeta-Spread). Abfluss-Invariante
> GEMESSEN über 10 Seeds grün (`diag-makro-anker.cjs`: Rim-Spannweite 51-246 m
> vs Schwelle 8-9 m — die geerbte LAAS-Narbe „Becken ohne Abfluss-Sattel
> flutet" strukturell ausgeschlossen). `_isValidMacroAnker` Form-Schutz (must-
> ignore Taille-Geist). `_macroSpillpointAnalysis` als Verifikations-Wand.
> Worker-Mirror reicht den Erbgut-Anker (`snap.macroAnker` im
> `_voxelWorkerSnapshotState`, Worker liest IHN statt selbst zu bauen → Main↔
> Worker Identität auch bei Konstanten-Wechsel). 18 Wände
> `checkBandV18193MakroErbgut`.
>
> **Reste sind klein/optional und leben in `docs/aktiv.md` §4.A:** Γ7 Baum-
> Varianten (video-getrieben zuletzt) · Γ1 Lesart 5 (Ψ2-Nase, Geruch des Feldes) ·
> Γ3 Feld-Charakter (Domain-Warp, optional) · Γ-M Multi-Class-Material (Strata/
> Iron-Bands/Lichen — ersetzt das alte Γ8) · Γ8 Kies+Saum (schrumpft) · Γ2 Totholz-
> Option (Entscheid 4) · Γ6-Beförderung (vier Alt-diags → stehende Bänder). Diese
> Reste sind reine Pickel — keine Bogen-Phasen.
>
> Das hier ist die VOLLE historische Plan-Datei mit dem LAAS-Transfer-Prinzip
> („NEUE FELDER, ALTE LESER"), allen Lesart-Karten, den Verifikations-Anhang §V
> + den Schöpfer-Entscheiden. Nachschlagbar für jede künftige Γ-Welle.

Schöpfer-Dokument 12.06.2026 (LAAS-Transfer-Analyse, `Braffolk/fable5-world-demo` ~21k Z. TypeScript gegen `anazhRealm.js`) — hier verankert mit **Bau-Status + Verifikations-Anhang** (§V). Schwester-Bogen zu Ω (taille-spec), Ψ (Wellen), Λ (Licht), W (Wasser).

**Das eine Prinzip dieses Bogens: NEUE FELDER, ALTE LESER.** LAAS implementiert „ein Feld, viele Leser" mit handgeschriebenen Dichtefunktionen, weil es kein Resonanz-Organ hat. AnazhRealm hat eins. Jede Welle hier schreibt ein neues Feld (oder eine neue Lesart) und schließt es an existierende Organe an: spawnAffinity, KLEIN-Arten, `_terrainMaterialAt`, Terrain-Farbe, Kreaturen-Nase (Ψ2), Klang-Antennen (Ψ3). Kein neues Subsystem. Kein neues Vokabular außerhalb der dafür vorgesehenen Räume.

## §0 — Die ehrliche Rahmung

Was LAAS ist: eine **Fotografie**. 4×4 km, einmal beim Boot gebakt, danach unveränderlich. Keine Kreaturen, kein Crafting, kein Multiplayer, keine Mutation, keine Persistenz. Was AnazhRealm ist: ein **Organismus** — mutierbar, P2P-synchron, mit Provenienz und Immunsystem. Der Transfer betrifft darum ausschließlich **Genese-Qualität** (wie die Welt geboren wird), niemals Welt-Natur (wie sie lebt). Das CA-/Iso-Wasser, die Voxel-Edits, die DSL bleiben souverän über das Leben; die Genese schreibt nur bessere Anfangsbedingungen.

Drei Vermessungs-Korrekturen (der Bogen baut auf Stärken — diese Dinge existieren bereits und werden NICHT neu gebaut):

1. **Hydrologie existiert** (V9.43–V9.49): Priority-Flood, D8, Flow-Accumulation, Carving (`_hydrosphereCarveAt`), Seen (`_hydrosphereLakeAt`), Tarns, Wasserfälle. „Das Drainage-Netz ist Welt-Identität" — die Disziplin, auf der Γ1/Γ4 stehen, ist schon Gesetz.
2. **Klump-Rauschen existiert** (V18.102, `_clumpAt`): seed-deterministisch, mittelwert-neutral, zwei Leser (Gras λ~28 m; Bäume λ~167 m).
3. **Understory existiert** (`KLEIN_VEGETATION_SPECIES`): sechs Arten, datengetrieben, EIN Streu-Mechanismus, field/floor-Gating, Wind, Impostor-Fernfeld, Ernte.

Was bewusst NICHT übernommen wird: WebGPU/TSL/Compute-Bake (CPU-Genese zur Chunk-Zeit ist für eine mutierbare Welt der richtige Ort). Der Boot-Bake. LOD-/Impostor-Maschinerie über das Vorhandene hinaus (DETAIL_CASCADE U4 deckt das). Wind-Systeme (`wind:true` teilt die Gras-Wind-positionNode). Der Modul-Split sowieso.

Die LAAS-Lektion über LAAS selbst: **das Brief-Muster** — verbotene Outcomes als Spezifikations-Sprache („keine schwarzen Schatten, keine geklonten Bäume, kein Nebel als Vertuschung"), automatisiert asserted statt angeschaut. Das ist die Form der Γ6-Beweise.

## Die Wellen

| Welle | Inhalt | Status |
| --- | --- | --- |
| **Γ0** Mess-Welle | Feuchte-Blindheit · Klump-Kopplungs-Matrix · Math.random-Zensus · diag→Band-Kandidaten | **✓ GEMESSEN (V18.166)** — Befunde in §V.1 |
| **Γ5** Determinismus-Schliff | Math.random-Fallback fällt · Zensus-Band · Stream-Gesetz | **✓ GEBAUT (V18.166)** |
| **Γ2** Klump-Lesarten | `kronen: unter/lichtung/rand` auf dem EINEN Klump-Feld (λ~167 m, dasselbe c wie der Baum-Leser) · Doppel-Gating-WAND · B5+-Mittelwert-Neutralität | **✓ GEBAUT (V18.166)** — Totholz-Option offen (Entscheid 4) |
| **Γ1** Feuchte-Feld | `_hydroDistAt` + `_feuchteAt` · fünfte Welt-Stimme · Lesarten 1–3 (Affinität · KLEIN-Arten [farn dual, schilf neu] · Boden) · genVersion | **✓ KERN GEBAUT (V18.166)** — Lesart 4 (Farbe) + Lesart 5 (Ψ2-Nase) offen, §V.4 |
| **Γ6** diag→Band | jede visuelle Narbe wird beim Heilen Band | **TEILWEISE** — diag-genese steht als Werkzeug + `checkBandGammaGenese` (9 Invarianten); die vier Alt-Kandidaten (snowband/chunk-seam/false-swim/arch-water-solid) = eigene Beförderungs-Welle |
| **Γ3** Feld-Charakter | Domain-Warp + Frequenz-Fächer der vier Stimmen | OFFEN (optional — das kontinuierliche Feld interdigitiert schon; Entscheid 5) |
| **Γ4** Makro-Anker | designte Geographie (Massiv·Tal·Becken) gejittert · Abfluss-Invariante (die geerbte LAAS-Narbe) · `worldMeta.macro` als Erbgut | **✓ GEBAUT V18.193** — Erbgut + Abfluss-Invariante + Worker-Mirror, 18 Wände, S-Abnahme offen |
| **Γ7** Baum-Varianten | `_growTreeBlueprint`-Grammatik emittiert Bauplan-Varianten in der bestehenden Parts-Sprache | OFFEN — zuletzt, video-getrieben |

### Γ1 — Das Feuchte-Feld (das Herzstück, Kern gebaut)

LAAS-Vorbild (`FlowRivers.ts`): moisture = Blur aus Wasserpräsenz, distanz-gefadet → Kausalkette **Terrain → Wasser → Feuchte → Leben** statt Zufall. Die Anazh-Wahrheit, die es billig macht: die teuerste Zutat — Distanz zum Wasser — existiert als Maschinerie (`riverBuckets`-Walk in `_hydrosphereCarveAt`).

Gebaut (alle Anker GEMESSEN, diag-genese):

- **`_hydroDistAt(x,z)`** — derselbe Segment-Walk wie der Carve (gleiche Buckets, EINE Quelle), gibt `{dist, halfW}`. **Abweichung vom Plan-Wortlaut:** liest die **3×3-Bucket-Nachbarschaft** — die Feuchte-Reichweite (26 m > Bankbreite) überschreitet den Ein-Bucket-Horizont des Carve (§V.3).
- **`_feuchteAt(x,z,surfY?)`** — zwei Terme, `max()`: (a) Fluss-Nähe (smoothstep über die echte Segment-Distanz, `inner = max(1, halfW)`, `outer = inner + 26 m`); (b) Höhe überm Wasserspiegel (Niederungen an See/Ozean: voll feucht ≤ 1.5 m, trocken ab 7 m, Gewicht 0.6 — deckt See-/Ozean-Nähe ohne eigenen See-Term, weil `_waterLevelAt` den lokalen Spiegel kennt). Konstanten in `AnazhRealm.FEUCHTE` (frozen, Erst-Wurf browser-justierbar).
- **Lesart 1 — Affinität:** fünfter Term in `spawnAffinityForBlueprint` nach dem glut→brennbar-Präzedenz: `feuchte × tags.lebendig × 0.8`. Bäume folgen Flüssen; Glutbrunnen meiden sie gratis (brennbar resoniert nicht mit feuchte). Der Populator misst die Feuchte EINMAL pro Sample und reicht sie (kein Hot-Path-Walk je Kandidat).
- **Lesart 2 — KLEIN-Arten:** `field:"feuchte"` ist gültiger Daten-Wert. **farn** dual (`feldNass:"feuchte"`, `floorNass:0.3` in Genese-2; Legacy behält lebendig — das Gesicht bleibt). **schilf** neu (field feuchte, floor 0.62, `minGen:2` — das schmale Ufer-Band, GEMESSEN 51 Instanzen am echten Fluss-Chunk).
- **Lesart 3 — Boden:** `_terrainMaterialAt`: feuchte hebt die erde-Achse (`+ feuchte × 0.35`) — Ufer grabbar weich.
- **Lesart 4 — Farbe:** OFFEN (braucht den bit-identischen Worker-Spiegel `attachFieldColors`; eigener Schnitt, §V.4).
- **Lesart 5 — Ψ2-Nase:** vorgemerkt, nicht dieser Bogen.

**Wo die Feuchte LEBT (Abweichung mit Grund, §V.3):** am GENESE-LESER (Spawn/Streu/Boden), NICHT in `worldFieldAt` — der Bucket-Walk gehört nicht in den Hot-Path (`auraAt` läuft pro Frame), und der Höhen-Term braucht surfY, das die Genese-Leser schon tragen. Die „fünfte Stimme" ist die SEMANTIK (eigene Achse statt lebendig-Drift), nicht der Speicherort.

### Γ2 — Klump-Lesarten (gebaut)

`kronen: "unter" | "lichtung" | "rand"` in den Arten-Daten + EIN Multiplikator `_kronenMult` an BEIDEN Gating-Stellen (nah-Streu + Fernfeld — die Doppel-Gating-WAND; Source-Probe im Band). `c = _clumpAt(x,z,0.006)` = exakt der Baum-Leser-Wert → die Kopplung an die realen Wälder ist strukturell, ohne je eine Baum-Position abzufragen. Zuordnung: farn=unter, blume=lichtung, gestruepp=rand, fels/spore/pollen=null. **Mittelwert-Neutralität (B5+):** die Norm-Faktoren `AnazhRealm.KRONEN` sind diag-KALIBRIERT (§V.2) — Mittel-Multiplikator 0.999/1.000/0.999.

### Γ5 — Determinismus-Schliff (gebaut)

1. Der stille `Math.random`-Fallback in `_vegetationSampleSpawn` ist GESTRICHEN — `worldFieldAt()` lazy-initialisiert das seed-gebundene RNG vor dem ersten Wurf (bei fehlendem Feld würfelte vorher jeder Peer lautlos anders — P2P-Drift-Klasse).
2. Das Band: kein `Math.random` im CODE der worldgen-erreichbaren Pfade (Kommentar-gestrippt; 12 Fn im diag, 9 im Band).
3. **Das Stream-Gesetz (jetzt expliziter Satz):** seed-deterministische RNG-Streams pro Zweck (`seed + ":clump"`, `":voxel"`, `"-veg-*"`) — ein Draw mehr in einem Stream re-rollt nie einen anderen; pro Zweck ein Suffix; NIE `Math.random` in einem Pfad, der Welt-Substanz formt.

### Γ3 — Feld-Charakter: Warp + Frequenz-Fächer (offen, optional — die Subschritte für die spätere Welle)

Heute leben alle vier Welt-Stimmen auf EINER Skala (`s = 0.005`, λ~200 m in `worldFieldAt`) — gleich große Simplex-Blobs, nur dekorreliert. Die Welle (wenn sie kommt):

1. **Domain-Warp** in `worldFieldAt`: `(x,z) += warpNoise(x,z) · A` VOR den vier Reads — eigener Stream `seed + "-veg-warp"` (das Stream-Gesetz), Erst-Wurf A ≈ 40 m.
2. **Frequenz-Fächer** pro Stimme: lebendig λ200 · dichte λ340 · glut λ520 · magieleitung λ160 (Erst-Wurf). Der Ecotone-Effekt an den argmax-Grenzen (`_terrainMaterialAt`) und der AFFINITY_FLOOR-Linie (0.18) kommt gratis mit.
3. **genVersion-Schleuse zwingend** (ändert JEDE Welt bei gleichem Seed → nur Genese ≥ 3 oder hinter demselben 2er-Tor wie Γ1, Entscheid bei Bau).
4. **Beweis:** `diag-region-histogramm` (Region-Größen-Verteilung vorher/nachher) + Schöpfer-Auge.

Bewusst zurückgestellt (Entscheid 5): das kontinuierliche Feld interdigitiert schon von Natur aus — diese Welle ist Charakter, kein Heilen.

### Γ4 — Makro-Anker (offen, der nächste große Wurf des Bogens)

Designte Geographie statt Noise-Statistik: `makeMacroAnker(seed)` → `{ massivC, massivR, massivRot, talPolyline[], talFloors[], talBreite, beckenC, beckenR }` aus den Streams `seed + "-macro-anker"` / `"-macro-tal"` (pro Seed nur GEJITTERT, ≈ ±10 % der Weltskala; getrennte Streams — ein Draw mehr re-rollt nie andere). Drei additive Terme in `_terrainMacroSurfaceY` (Ridge-Anhebung anisotrop entlang massivRot · Tal-Trog über Punkt-zu-Polyline-Distanz [der riverBuckets-Walk in grob] · Becken-Mulde); Worker bit-identisch — die Determinismus-Wand ist die Abnahme. Hydro-Kopplung gratis (die bestehende Pipeline findet das Becken als See, sammelt den Flow im Tal — kein Hydro-Code wird angefasst). **Die geerbte LAAS-Narbe als Invariante ab Tag 1:** Becken-Spillpunkt < minimale Randhöhe Richtung Kartenrand/Ozean — ein Becken ohne Abfluss-Sattel flutet (Konstruktions-Constraint in makeMacroAnker UND Band). Anker nach `worldMeta.macro` (Entscheid 3: Geographie als diffbares/teilbares Erbgut; Welten ohne Feld = Legacy-Noise-Makro, der `_carryUnknown`-Geist). **Γ0-Nachmessung beim Bau:** dürfen Tarns (`_hydroSeedTarns`) im Tal landen? Beweis: Tal-Fluss-Band (längster Fluss ≥ 60 % im Korridor, über Seeds) + der bestehende Längster-Fluss-Test bleibt grün + 9-Shot-Bookmark-diag (Massiv-Vista · Tal-Blick · Becken-Ufer).

### Γ7 — Baum-Varianten (offen, zuletzt)

`_growTreeBlueprint(speziesParams, rng)` emittiert `parts[]` in der bestehenden Sprache (Stamm-Kette mit wander/taper, Whorl-Äste, Zweig-Ebene 2, Laub NUR an Ebene-2-Enden — die Species.ts-Regel: Laub sitzt nie auf Primärästen). 6 Varianten pro Spezies aus `seed + "-veg-grammatik"`, `instanced:true` bleibt, `computeCompoundTags` unverändert. Rein ästhetisch — nur wenn das Video zeigt, dass die Wälder es brauchen.

## Reihenfolge & Abhängigkeiten

```
Γ0 (messen)                      ✓ V18.166
 ├─ Γ5 (Determinismus)           ✓ V18.166
 ├─ Γ6 (diag→Band)               teilweise (diag-genese + Band stehen; Alt-Beförderung offen)
 ├─ Γ2 (Klump-Lesarten)          ✓ V18.166
 ├─ Γ1 (Feuchte)                 ✓ Kern V18.166 (Lesart 4 Farbe + Lesart 5 Nase offen)
 │    └─ Γ3 (Feld-Charakter)     offen, optional (gleiche genVersion-Schleuse)
 └─ Γ4 (Makro-Anker)             offen — der große Wurf
      └─ Γ7 (Baum-Varianten)     offen, video-getrieben zuletzt
```

## Souveräne Entscheide (genommen 12.06.2026, je Plan-Empfehlung — Erst-Wurf-Regel)

1. **genVersion: legacy-erhaltend.** Fehlendes Feld = 1 (alte Genese, bestehende Welten behalten ihr Gesicht — das Drainage-Netz-Gesetz konsequent). 2 bekommen: brandneuer Spieler (ensureWorldMeta fresh — kein Gesicht zu bewahren, „identisch für alle" bleibt wahr), `createNewWorld`, die Fusion (neues Terrain aus newSeed). Eine GELADENE Welt ohne Feld bleibt 1; der Welt-Tor-Import erbt die Version des Artefakts (Spread).
2. **feuchte als fünfte Welt-Stimme** (lebendig ist vierfach überladen — der W4/Ψ0-Geist). KEINE Taille-Frage: Welt-Stimmen reisen in keinem Produkt. (Vermerkt: feuchte als MATERIAL-Achse — nasses Holz — WÄRE Taille; heute nicht.)
3. **worldMeta.macro:** entschieden wird mit Γ4 (vorgemerkt: ja — Geographie als Erbgut füttert die Portal-Vision).
4. **Totholz:** Vermerk, nicht jetzt (ein `stamm_gefallen`-Bauplan, kronen=unter — eine Tabellenzeile, wenn die Wälder stehen).
5. **Γ3:** bewusst zurückgestellt — das kontinuierliche Feld interdigitiert schon; Charakter-Welle, kein Heilen.

---

## §V — VERIFIKATIONS-ANHANG (V18.166, alles GEMESSEN via `scripts/diag-genese.cjs` + `checkBandGammaGenese`)

### V.1 Die Γ0-Befunde

- **Feuchte-Blindheit (Befund 1):** bestätigt — vor Γ1 sah die Vegetation die Hydrosphäre nur binär (`_isAboveWaterAt`, 0.4 m). Nach Γ1: feuchte am echten Fluss-Ufer **0.935**, trocken+hoch **exakt 0**, Legacy **exakt 0**.
- **Klump-Kopplung (Befund 2):** vorher 2 gleichsinnige Leser, 6 KLEIN-Arten blind. Nachher: farn=unter · blume=lichtung · gestruepp=rand auf demselben c wie der Baum-Leser.
- **Math.random-Zensus (Befund 3):** EIN worldgen-erreichbarer Treffer (der `_vegetationSampleSpawn`-Fallback) — GESTRICHEN. 12 Genese-Funktionen sauber (Band bewacht; Kommentare gestrippt — die Verbots-KOMMENTARE dürfen das Wort tragen, der Code nicht).
- **diag→Band-Kandidaten (Befund 4):** diag-snowband · diag-chunk-seam · diag-false-swim · diag-arch-water-solid — notiert für die Γ6-Beförderungs-Welle.

### V.2 Die KRONEN-Kalibrierung (Erst-Wurf → GEMESSEN)

220×220 Proben @ 7 m (≈ 9 Wellenlängen des λ~167-m-Felds): `E[ss(c)]=0.2981`, `E[ss(−c)]=0.2967`, `E[gauss(c/0.18)]=0.2149` → Norm-Faktoren **3.35 / 3.37 / 4.65** (Erst-Wurf 2.9/2.9/2.4 war zu klein — exakt wofür die Kalibrier-Messung da ist). Mittel-Multiplikator danach: **0.999 / 1.000 / 0.999** = B5+-neutral (die Verteilung verschiebt sich, die Chunk-Gesamtmenge bleibt).

### V.3 Abweichungen vom Plan-Wortlaut (mit Grund)

1. **Feuchte lebt am GENESE-LESER, nicht in `worldFieldAt`:** der Plan sagt „worldFieldAt liefert zusätzlich feuchte". Gebaut ist die eigene Funktion `_feuchteAt`, von den Genese-Lesern konsumiert. Grund: (a) `worldFieldAt`/`auraAt` ist Hot-Path (pro Frame) — der Bucket-Walk gehört nicht hinein; (b) der Höhen-Term braucht surfY, das die Genese-Leser (Spawn/Streu) schon in der Hand halten — `worldFieldAt` müsste es teuer scannen. Die Plan-ABSICHT (fünfte semantische Stimme, eigene Achse statt lebendig-Drift) ist voll erfüllt.
2. **`_hydroDistAt` liest die 3×3-Bucket-Nachbarschaft:** der Carve kommt mit EINEM Bucket aus (~Bankbreite), die 26-m-Feuchte-Reichweite nicht — ohne Nachbarn gäbe es Feuchte-Kanten an Bucket-Grenzen.
3. **Fernfeld-surfY aus der V18.97-Karte** (`_chunkSurfaceAt`, 5-Arg-Signatur — ein 3-Arg-Tippfehler beim Bau hätte still auf den teuren `_voxelSurfaceY`-Scan zurückgefallen; beim Selbst-Review gefangen).
4. **Lesart 4 (Terrain-Farbe) bewusst NICHT in diesem Schnitt:** sie zieht den bit-identischen Worker-Spiegel (`attachFieldColors`) — eigener Schnitt mit der Determinismus-Wand als Abnahme, sonst wächst diese Welle über die Naht.

### V.4 Offen im Bogen (geordnet)

1. **Γ1-Lesart 4** — Terrain-Vertex-Farbe satter/dunkler bei feuchte (Worker-Spiegel-Schnitt; Naht-Wand + Determinismus-Band sind die Abnahme).
2. **Γ6-Beförderung** — die vier Alt-diags bekommen Schwellwerte als stehende Bänder.
3. **Γ4 Makro-Anker** — eigener Abschnitt (mit Entscheid 3 + Abfluss-Invariante ab Tag 1; Γ0-Nachmessung Tarn-im-Tal).
4. **Γ3 / Γ7 / Totholz / Ψ2-Nase** — vorgemerkt (Entscheide 4/5, video-getrieben).
5. **Die offenen BEWEIS-Schritte des Dokuments** (gebaut ist der Mechanismus-Beweis; das EMERGENTE Outcome misst die jeweils nächste Welle): (a) das **Baum-Dichte-Ufer-Band** (≥ 1.8× im 15-m- vs 120-m-Band, über Seeds — der sichtbare „Wald folgt dem Fluss"; heute bewiesen: Affinitäts-Δ 0.28 = der Mechanismus, nicht die emergente Dichte) → reist mit der Γ1-Farb-/Look-Welle; (b) das **Γ2-Korrelations-Band** (`corr(farnDichte, c) > 0.4` · `corr(blumeDichte, c) < −0.3` über M Chunks; heute bewiesen: der Multiplikator an kontrollierten c-Polen) + der Waldrand-Shot; (c) die **See-/Ozean-Ufer-Probe** (der Höhen-Term deckt sie per Konstruktion über `_waterLevelAt`, GEMESSEN ist nur das Fluss-Ufer); (d) das **Γ0-Shot-Paar** (Flussufer vs 200 m landeinwärts — das Auge; headless steht die Zahl).

### V.5 Beweis-Lage

- `scripts/diag-genese.cjs` (stehendes Werkzeug): A genVersion · B KRONEN-Kalibrierung · C Feuchte (Ufer 0.935 / trocken 0 / Legacy 0) · D Ufer-Leben END-TO-END (`_buildVoxelChunkScatter` am echten Fluss-Chunk: **schilf 51, farn 50; trockener Chunk 0; Legacy 0 [minGen-Tor]**) · E Zensus. **Alles grün.**
- `checkBandGammaGenese` (Playtest, 9 Invarianten): Struktur/frozen · Feuchte-am-Fluss · Legacy-Tor · Affinitäts-KONSUM kontrolliert (V17.32: derselbe Punkt, feuchte 1 vs 0 → exaktes Δ) · KRONEN-Verhalten an kontrollierten c-Polen · Doppel-Gating-WAND (Source-Probe BEIDER Stellen + Boden + Spawn-Pass) · Arten-Daten · Zensus · genVersion-im-Snapshot (V8.59-Klasse).

### V.6 Die eine Zahl

LAAS brauchte ~21'000 neue Zeilen für eine Welt, die atmet — und sie ist eine Fotografie. Der gebaute Γ-Kern (Γ0+Γ5+Γ2+Γ1) sind **~200 Zeilen Engine** + Messgerät/Band, weil fast jedes Organ schon existierte: die Hydrologie, das Klump-Feld, der Streu-Mechanismus, das Resonanz-Organ, die diag-Kultur. Was fehlte, waren Verbindungen, keine Systeme. **Neue Felder, alte Leser.**
