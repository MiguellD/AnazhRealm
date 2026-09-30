# Asset-Vertrag v5 (`cv: 5`) — Klingen & Werkzeuge

> **NORMATIV.** Die Naht zwischen dem Klingen-Studio-Kern (`schmiede-core.js`,
> Namensraum `__schmiedeCore` — Vertrag v1.1 §7) und jedem Empfänger
> (Schmiede-Shell heute, AnazhRealm-Foundry-Worker seit dem W-A4a-Andocken).
> Jeder Produzent, der diesen Vertrag spricht, MUSS die eingefrorenen Goldens
> in `golden/` byte-genau treffen (`npm run gate:schmiede-contract`). Die
> Goldens sind EINGEFROREN (Taille-Disziplin) — NIE regenerieren; ein bewusster
> Re-Mint ist `MINT_FORCE=1` und eine eigene Entscheidung mit Begründung.
>
> Eingefroren bei W-A4a-Grün (Kern-Split worlds/schmiede/index.html →
> schmiede-core.js, Shell-Verhaltens-Parität 21/21 Fälle hash-identisch
> vor/nach Split — 21 Gattungen, Original-Inline-Slices vs. Kern).

## Die Bau-Funktion

```
__schmiedeCore.buildInstance(rezeptId, seed, lod, ov?) → THREE.Group | null
```

- `rezeptId` ∈ `langschwert · saebel · degen · grossschwert · dolch · messer ·
langbogen · kriegsbogen · reiterbogen · recurvebogen · streitkolben ·
kriegsaxt · kriegshammer · keule · faellaxt · spaltmaul · vorschlaghammer ·
beil · spitzhacke · spaten · schaufel` (Schlüssel aus
  `__schmiedeCore.PRESETS`, Namensraum `[a-z0-9_-]+`; jedes Rezept trägt
  `kind:"weapon"` + `lab` (der Schöpfer-Wortlaut der Gattungs-Buttons) + `s`
  (die FLACHEN numerischen Dials der Gattung) + `fx` (domänen-eigene
  Ausstattung: `place {mode:"hand"}` — das Platzierungs-Gesetz als Daten,
  Wörterbuch v1 §2.4/N5.5: Spawn/Befehl/Hand, KEIN Worldgen · `tool: true` an
  den Werkzeug-Gattungen · `task` = die Aufgaben-DNA des Labs)). KEIN
  `fx.wield`: das Lab trägt keine gezeichneten Reichweiten-/Schwung-Zahlen —
  seine Lehren sind aus der Geometrie GEMESSEN, der Wield-Richter ist Ω-PHYSIS
  im Host (N6.6, M3/M9).
- `seed` (int): **RESERVIERT — cv:5 ist SEED-INVARIANT.** Der Waffen-Bau des
  Labs ist eine reine Funktion der Parameter (kein stochastischer Term;
  Math.random lebt nur in der Shell-Deko der Arena). Derselbe Bauplan bei
  seed 7 und 12345 ist byte-gleich; das Gate prüft die Invarianz AKTIV.
- `lod`: Waffen/Werkzeuge tragen NUR Stufe 0
  (`PORTAL_RENDER_CONFIG.lod.kindStages = { weapon: [0] }`); jede andere Stufe
  wird auf 0 geklemmt — L1=L0-Grade und L2-Auto-Impostor sind Sache des Wirts
  (Studio-Vertrag B2/N7.5-Merge).
- `ov` (optional): Parameter-Override im P-Raum (die B4-PARAMS-ids), gemergt
  NACH Gattung × Aufgabe × Tradition — exakt die Lab-Slider-Semantik (Slider
  schreiben P nach dem Gattungs-/Traditions-Zug; für `modus:"wucht"` bleibt
  `schaftR` lab-treu aus dem Greifer-Kontakt `griffD(intentControl(P))·0.5`
  abgeleitet und übersteuert einen ov-Wert).
- TRADITION: im Wirts-Kanal LAB-FEST `Frank` (der Lab-Startzustand;
  `setTradition` ist die Shell-Naht). Eine Traditions-Variation im Wirts-Kanal
  ist ein bewusster Golden-Re-Mint, kein Drift.
- Ausgang: EINE Group (Klinge: Loft + Gehilz/Griff/Knauf · Wucht: Schaft +
  Kopf · Bogen: Riser + Wurfarme + Sehne), `updateMatrixWorld(true)` gelaufen,
  `userData {kind:"weapon", rezeptId, seed, lod:0}`. Die Naht sind die
  Float32-Attribute ihrer Meshes (G2.2) — kein Renderer-Objekt nötig. Die
  Overlay-/Didaktik-Ebenen des Labs (Rückgrat-Zeichnung · Schnitt-Karte ·
  Maßlinien · Masse-Streifen · Harmonik · Prüfstand) sind BEWUSST nicht Teil
  der Substanz (Lehr-Visualisierung der Shell).

## Der Fingerabdruck (golden/klingen.json)

Je Fall `<rezeptId>-s<seed>-L<lod>[-ov_<keys>]`: `{ objects, vertices, sha256 }`.
sha256 über den kanonischen Byte-Strom in traverse-Reihenfolge — je Objekt mit
Geometrie: Typ · `matrixWorld` (Float64-Bytes) · Material-Signatur (Farbe/
Emissive/roughness/metalness/opacity/transparent) · alle Geometrie-Attribute
(Namen sortiert: itemSize + rohe Puffer-Bytes) · Index-Puffer. Ein einziges
abweichendes Byte kippt den Hash.

Fälle: 21 Gattungen × 2 Seeds (7, 12345) × LOD 0 + 2 ov-Fälle
(langschwert+klinge/fuller, spitzhacke+schaft — friert auch die
Override-Merge-Semantik ein) = 44; plus die aktiven Proben (nicht
golden-gespeichert): lod-Klemme (lod 2 == lod 0) und die Split-Parität
`buildInstance(id,7,0) == buildWeaponModel(<Gattung>)` je Gattung (der
Waffenständer der Lab-Arena baut über buildWeaponModel — Kern und Shell-Pfad
bleiben EIN Bau).
