# DER EINS-PLAN — die gerechnete Differenz Vorlage ↔ AnazhRealm, und der Weg zur Einheit

> **STAND 04.07.2026 (V18.390) — DER MASTER-PLAN aus der vollen Differenz-Analyse.** Schöpfer-Auftrag:
> „analysiere die Differenzen, jedes Detail, von Licht über Wolken über das Platzieren — misse alles
> heraus, plane wie du es integrierst, ein perfekter Plan, der eins wird mit den beiden Codes. Dein
> Richter ist die gerechnete Differenz (Mathe, Dichte, Farben) — die Welt wird anders aussehen, aber
> gleich schlau, noch schlauer darunter." Sechs parallele Analysen vermassen BEIDE Codebasen
> (die Roh-Berichte mit allen Zeilen + Formeln: `docs/analyse/diff-A1..A6-*.md`). Dieser Plan ist
> die Synthese: die gemessenen Wurzeln, geordnet nach Wirkung, mit Code-Ort, Risiko und Beweis-Zahl.

---

## §0 — DIE FÜNF GEMESSENEN WURZELN DES „ATRAPPEN"-BEFUNDS (warum die Welt nicht glänzt)

Der Schöpfer-Browser zeigte: spärlicher Wald, flache Pappe-Bäume, schwarze Kronen, 3453 Draw-Calls
gegen 464 der Vorlage, 4–27 fps. Die Analyse fand FÜNF Zahlen-Wurzeln — keine davon ist „das Material"
(roughness/Atlas stimmen byte-treu):

| # | Wurzel | Vorlage | AnazhRealm | Faktor |
|---|--------|---------|------------|--------|
| 1 | **Licht-Verhältnis INVERTIERT** | key 2.85, ambient 0, hemi 0.19 → dir/(amb+hemi) ≈ **15:1** | dir 1.0, amb 0.60, hemi 0.60 → **0.83:1** | **~18×** — Füll-Licht wäscht jede NdotL-Schattierung aus → „flache Masse" |
| 2 | **Kandidaten-Darts zu dünn** | 0.382 Darts/m² (~55/Zelle) → Poisson ÜBERSÄTTIGT → wahre Maximaldichte | 0.097 (14/Zelle) → untersättigt | **3.9×** → Wald-Kern nur ½ dicht („spärlich") |
| 3 | **LOD-Distanzen 4× zu weit** | L0<20m, Billboard>40m | L0<80m, Billboard>160m | **16× Grundfläche** an 3D-Geometrie → Dreiecks-Kollaps → fps-Tod |
| 4 | **Draw-Call-Zersplitterung** | Bäume GLOBAL instanziert (~60 Baum-Calls); NUR Boden 12m-gekachelt | 8 Varianten × 4 Leaf-Gruppen × Region-Split → 768–1728 Baum-Calls | **20–40×** |
| 5 | **L0-Blatt = flaches Quad** | pushLeaf: 30-Vert gemuldete 3D-Klinge (Superformel) | buildFoliageQuads: 4-Vert-Quad für ALLE LODs | **15× weniger Geometrie** am nahen Baum → „Karten-Stapel" |

Plus: **kein unlit-Silhouetten-Floor** (Vorlage: `+albedo·pow(1-ndv,2.5)·0.55` → Krone glimmt im
Schatten; AnazhRealm: Laub fällt nachts ins Schwarze) und **Impostor halb gebaut** (1-View-Canvas
ohne Normal-Atlas vs 8-View-RTT mit per-Fragment-Licht → die „Attrappe" in der Ferne).

## §1 — DIE BAU-REIHENFOLGE (nach Wirkung aufs Schöpfer-Bild, mit Abhängigkeiten)

**WELLE 1 — DAS LICHT (A4-1+A4-2, größter Look-Hebel, heilt „dunkel/flach" direkt):**
`_atmosphere(e)` (Rayleigh/Beer-Lambert, Port Vorlage Z.2111: BETA r0.044/g0.10/b0.23, Mond-Purkinje)
als EINE Quelle in `_applyDayNightToScene`; dann das Licht-Rig: KEY_BASE ~2.6·atm.lum, ambient
0.60→0.06+0.10·sunHeight, hemi →(0.10+0.20·sunHeight), NEU `fillLight` (grünes Bounce
0x557a4a·0.62·atm.lum). Diag: `_atmosphere(1).lum∈[0.90,0.92]`, nachts dir/(amb+hemi)>1.5,
tags >3. Risiko: ACES-Belichtung kalibrieren; `diag-night-probe` + PBR-LUT-Böden prüfen.

**WELLE 2 — DER WALD-KOLLAPS (A1-A/B/C/D, heilt „spärlich + Pappe + fps"):**
(A) `FOREST.dartsPerCell 14→48` (Poisson-Sättigung; Kern ~7→~15 Zentren/Zelle).
(B) `LOD_DISTANCES thresh01 80→32, thresh12 160→64, fade 20→13, fade0 10→6, perfDistMulMax 1.5→1.3`
(16×→1× 3D-Fläche = der Dreiecks-Hebel; erst NACH Welle 3/Impostor look-sicher!).
(C) `VARIANTS_PER_SPECIES 8→3` (Vielfalt reitet auf scale/rotY/tint wie die Vorlage; −62 % Batches).
(D) Bäume GLOBAL instanzieren (tree-Schicht regionKey→null; die Vorlagen-Weisheit „Bäume global,
Boden kacheln") — SERIELL NACH A–C (frustumCulled=false trägt nur bei gesenkter Zahl; V18.300-Wand
`diag-turn-cull` darf nicht auf 0 fallen). Beweis: akzeptierte Zentren/Zelle, renderTris,
Baum-Draw-Calls →~72, Gesamt-dc → Richtung ~500.

**WELLE 3 — DER 8-VIEW-IMPOSTOR (A1-E, macht Welle 2B look-sicher, „Attrappe" → gedrehter
beleuchteter Baum):** `_ensureImpostorAtlas` → echter RTT-Bake des LOD1-Meshes aus 8 Y-Peilungen
(128×256) + Normal-Atlas + 2px-Dilation; `_buildImpostorCrossGeometry` → camera-facing Quad mit
aRot/vView-Dekodierung (Vorlagen-Shader Z.1820). WebGPU-Offscreen-Bake; headless graceful auf
Canvas-Fallback. Risiko hoch → eigene Welle, Schöpfer-A/B.

**WELLE 4 — DER NAHE BAUM (A3-P1+P2+P3, heilt den LOD0-Look):**
(P1) `buildLeafBlades` in phyto-core: die 30-Vert gemuldete 3D-Blatt-Klinge (Superformel-Port)
für L0; L1 behält die Karten (genau die Vorlagen-Teilung). Gegen `diag-phyto-core-parity`.
(P2) unlit-Silhouetten-Floor in `_applyVegetationResponse`: `+albedo·pow(1-ndv,2.5)·0.55`.
(P3) die zwei divergenten Blatt-Farb-Pfade (Phyto roh vs Fallback ·0.72/0.95/0.55) → EINE Quelle.

**WELLE 5 — DIE WIESE (A2-S1+S2, heilt „das Gras das alte"):**
(S1) `GRASS_MAX_BLADES 1400`-Cap + Dichte kalibrieren: 4.5→~27 Halme/m² (der Regler
`_foliageDensityScale` fängt die Perf, der Cap ist der Deckel — nicht umgekehrt).
(S2) Halm-Geometrie via phyto-core auf Euler-Kragträger (droop 0.35-1.35, gebogene Fontäne,
K=3) + Ähren/Rispen + Höhe 0.1-0.4m (statt 0.5-1.95 steif). Blumen sind SCHON reicher als die
Vorlage (3 Arten, 0.10/m²) — keine Lücke.

**WELLE 6 — JAHRESZEIT + WETTER (A5-A/B/C/D, „das Wetter nicht so genial steuerbar"):**
(A) SEASON-Uniforms (uLeafPresence/uBloom/uSeasonMul) + `_seasonPhenology(t)` (4-Keyframe-Ring:
Frühling 0x6a9a3e/pr0.72/bl0.85 · Sommer 0x4f7a30/1.0/0.12 · Herbst 0xb0702a/0.55/0 · Winter
0x6e6650/0.06/0) — das ganze Jahr in 3 Uniforms OHNE Rebuild (das Kontinuitäts-Gesetz der Vorlage);
wall-clock, NICHT in der Fixed-Step-Sim (Determinismus).
(B) Wetter 2-Skalar → 5-Kanal-Vektor {fog,sun,grey,wind,rain} (klar/bewölkt/nebel/sturm 1:1
Vorlagen-Werte); Wind-Kopplung 2.6×→16.7× (Sturm biegt den Wald); Regen-Partikel (1600 Streifen,
kamera-umlaufend, wind-geneigt); WXPLAY-3-Freq-Drift statt 120s-Flip. Fog ADDITIV über den
Lade-Stream-Nebel (die `_smoothFogEdge`/Wasser-Kappe HEILIG).
(C) Vegetations-Shader-Hook: zuerst die FARBE (uSeasonMul aufs Laub, billig), die ENTLAUBUNG
(aCenter-mix) als eigene Sub-Welle (HISM/Impostor-Kopplung = das harte Stück).
(D) Tag-Länge saison-gekoppelt lerp(9.0,15.8h) + Saison-Slider/DSL.

**WELLE 7 — TERRAIN-FELD-INTELLIGENZ (A6-1/2/3, „das Terrain nicht gleich schlau"):**
(1) Feuchte-Dach: `FEUCHTE.hoeheGewicht 0.6→~0.9` (BEIDE Mirrors, `diag-genese` misst zuerst) ODER
nur die Wald-Achse lokal heben. (2) Kronendach-Licht in die Terrain-Albedo:
`albedo·(0.58+0.46·_canopyLightAt)` im Vertex-Bäcker (Makro-Schatten gratis — der Waldboden
dunkelt unterm Dach). (3) Wildpfad-Feld: zuerst das billige `pathDist` (Sinus-Wellen, Vorlage
Z.1308) → Baum-Ausschluss <3.6m, Birken-Saum <8m, nackte Erde <3.4m, Gras-Unterdrückung —
4 Konsumenten, EIN Feld. (4) De-Entropie: prüfen ob `_vegetationSampleSpawn`-isTree-Zweig noch
lebt (Doppel-Spawn) → schneiden.

**WELLE 8 (Kür, eigener Bogen) — Volumetrik/Godrays (A4-4) + Zwei-Pass-Foliage-Composite (A3-P4):**
höchstes Wow, höchstes Risiko (neue WebGPU-Pässe, Perf-Regler-Stellgröße) — NACH allem anderen.

## §2 — DIE WÄNDE (verbindlich für jeden Bau-Agenten)

1. **Monolith = seriell committen** (V18.388: keine worktree-Isolation weit vor main; ein Agent
   nach dem anderen im Haupt-Baum, jeder verifiziert + committet).
2. **Konstanten-Wellen (2A/2B/2C) sind parallel-sicher** (disjunkte frozen-Blöcke) — aber am
   Monolithen trotzdem als EIN Commit-Zug.
3. **Look-Reihenfolge:** Welle 3 (Impostor) VOR/MIT Welle 2B (LOD-Distanzen) — sonst poppt
   sichtbare Pappe näher heran.
4. **Determinismus:** Saison/Wetter wall-clock (wie `_tickWorldRules`), NIE in der Fixed-Step-Sim;
   `diag-replay-determinism` bleibt die Wand. Worker-Mirror-Pflicht bei `_feuchteAt`.
5. **EINE Quelle:** `_atmosphere(e)` speist ALLES Licht (kein LUT-Parallel-Pfad — die LUT wird
   Fallback/Tint-Träger); der 5-Kanal-Wetter-Vektor ersetzt die 2 Skalare (kein drittes System).
6. **Beweis = die gerechnete Zahl** (Dichte/m², dir/(amb+hemi), dc-Zahl, presence 0.06) + am Ende
   jeder Welle das Schöpfer-Browser-Bild. Ein grüner Gate beweist die Mechanik, NIE den Glanz.

## §3 — DIE ERFOLGS-ZAHLEN (der gerechnete Richter)

| Welle | Zahl vorher | Ziel (=Vorlage) |
|-------|-------------|------------------|
| 1 Licht | dir/(amb+hemi) 0.83:1 | ≥3:1 tags, ≥1.5:1 nachts |
| 2 Wald | ~7 Zentren/Zelle · 3453dc · 16× 3D-Fläche | ~15/Zelle · dc→~500 · 1× |
| 3 Impostor | 1 View, kein Licht | 8 Views + Normal-Atlas |
| 4 Baum nah | 4-Vert-Quad-Blatt | 30-Vert-Klinge L0 |
| 5 Wiese | 4.5 Halme/m², steif 0.5-1.95m | ~27/m², gebogen 0.1-0.4m |
| 6 Saison | existiert nicht | presence 1.0↔0.06, uSeasonMul-Herbst r≈2.23 |
| 7 Terrain | Feuchte-Cap 0.6 · kein Pfad-Feld | Dach ~1.0 · pathDist mit 4 Konsumenten |
