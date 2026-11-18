# Lesen: Pflanzen in Studio und Welt (phytogenesis.js ganz + die Welt-Leser von phyto-core)

Stand main 18058dba. Gelesen: worlds/terrain/phytogenesis.js 1–4631 ganz; phyto-core.js 27–101, 440–520, 2296–2560,
2710–3360, 3609–3760, 5850–5895; foundry-core.js 440–800, 4700–5090; stamm/vegetation-wiese.js 2545–2875;
stamm/studio-gestalt.js 900–1020; stamm/vegetation-streu.js 180–290; stamm/stoff-karte.js 236–290, 870–915 (Ausschnitte).

Kurzbefund: eine Art ist heute ein Eintrag in einer Tabelle (5 Regler + Phänotyp-Zeile), ihr Platz ein Gewicht aus
festen Rausch-Bändern je Name, ihr Individuum einer von V = 2 Klonen. Die Gestalt wächst aus Gesetzen (Wuchs, Statik, Wind),
Wahl und Platz der Art aber nicht. Erbe gibt es an genau einer Stelle: der Sämling im Labor erbt mit p = 0,6 die Art des
Mutterbaums (phytogenesis.js:1369). In der Welt gibt es kein Erbe.

## (1) WAS TRÄGT — konsumierte Gesetze und ihre Leser

| Gesetz | Ort | Leser (Spielpfad) |
|---|---|---|
| Wuchs des Skeletts: da Vinci Δ, Phyllotaxis 137,5° (PHYLO_GESETZ), McMahon k = lerp(13,22,slim), D = (2H/k)^1,5 | phyto-core.js:27–81 | treeParams → emitTree; Labor `buildInstance` phytogenesis.js:2083, Welt über den Foundry-Kanal (`_foundryVariantFor` studio-gestalt.js:935) |
| Stamm aus der Krone: BHD = Schirm-⌀ / kd, kd 21,5 (Hemery 2005, als UNGEPRÜFT markiert) | phyto-core.js:448–468 | growSkeleton (Laubbaum mit Welt-Maß) |
| Welt-Maß: `ph.hoeheM` in m, `ph.hd` (H/D) der Konifere, Solitär/Bestand (FREISTAND, BESTAND) | phyto-core.js:2525–2532, 2743–2756 | treeParams → growSkeleton; Welt `_forestStehtFrei` (vegetation-baum.js:970) |
| Jugend-Gestalt `alter` ∈ (0,1): Kronenansatz·alter, Tiefe, Blatt·alter^−¼ | phyto-core.js:2542–2551 | Welt SUKZESSION nach Brand (vegetation-baum.js:1066–1091, vegetation-wiese.js:3185) |
| Phänotyp aus 5 Reglern: conifer ab api > 0,62, Strauch unter 0,22, Trauer aus trop | phyto-core.js:2300–2367, 2431–2434 | treeParams; laut Kommentar auch Fern-Farbe, Nadel der Karte, Pflanzen-Linsen |
| Wald-Plan der Welt: Geburt(sd)·Lichtung(st)·Waldgrenze(Schnee, wuchs.wald)·Saum(Ort), Wasser über dem Boden, Hang, Nische, reverse-J-Größe, Matérn-II-Schüchternheit, Schichten | phyto-core.js:3631–3739, 3204–3261, 3403 | `_forestGeborene` vegetation-wiese.js:2786–2836, Wald-Faden (vegetation-baum.js:13), Fernwald gelaende-fern.js:797 |
| Arten-Nische: Gewichte wF/wT/wE/wB/wW aus clim, dry, wet, open, patch; × wuchs.nadel / wuchs.laub | phyto-core.js:2823–2859, 3047–3090 | planForestCell; Labor plantForest phytogenesis.js:1231–1234 |
| Kronen-Deckung (Matérn II analytisch, die Fernform) | phyto-core.js:2974–3033 | Fernwald (gelaende-fern) |
| Boden-Gesetz: Trapez-Bänder licht/feucht/ufer/fels/hang/leben je Bodenart | phyto-core.js:5861–5894; Zeilen foundry-core.js:724–793 | Labor buildForest phytogenesis.js:2655; Welt-Nah-Streu (Zeile nicht nachgelesen, siehe OFFEN) |
| Kronendach-Licht im Labor: L = exp(−0,85·Σ e^(−q)) über die gesetzten Kronen | phytogenesis.js:1430–1457 | understoryNiche 1574, groundCover/wiesenTint 2252/2522, Bodenfarbe 1888 (nur im Labor) |
| Wind-Schlankheit δ = D(Brust)/H je Gestalt | phytogenesis.js:347–375 | aWindB je Klon, uWindBaum |
| Jahreslauf: SAISON_GESETZ.stuetzen (Tint, Präsenz, Blüte, Halm) — EINE Kurve für alle Arten | phytogenesis.js:3367–3380, 3426–3430 | uSeasonMul/uLeafPresence (global), Karten-Shader 2312 |
| Karte: der EINE Bäcker der Welt (`_karteWeltBacken`); das Labor fragt nur | phytogenesis.js:1675–1753; stoff-karte.js:1148 | Labor-Fernstufe, Welt-Karte |

## (2) WÜRFE UND TABELLEN

### Art-Tabellen (die Art ist ein Eintrag, kein Ergebnis)
- **PRESETS**: jede Art = 5 Regler `s:{api,delta,slim,trop,leaf}` + `ph`-Zeile (foundry-core.js:4721–5044): 10 Baum- und Strauch-Arten,
  Blume, Gras, 5 Waldboden-Arten. `hoeheM` stammt aus der Literatur (Eiche 15,55, Fichte 26,2, Mammut 39,9 m). Was man sieht:
  jede Art hat genau eine Gestalt-Familie, eine neue Art braucht eine Hand-Zeile.
- **Rinden- und Laub-Farben je barkType** (BC/LC): phyto-core.js:2328–2343. Die Klasse kommt aus Schwellen
  (slim > 0,66 → Birke, slim < 0,4 → Sequoia). Was man sieht: 6 Farbfamilien für alle Bäume.
- **CROWN**: Kronenradius in m je Art (phyto-core.js:3159–3168), einmal an der L0 gemessen und als Tabelle abgelegt. Das
  Pflanzgesetz liest die Tabelle, nicht die gewachsene Krone des Individuums. Auto-Arten bekommen pauschal 4 m (3713).
- **placement.scale**: Meter je Vorlagen-Einheit je Art (foundry-core.js:686–710), dazu treeScaleMul 0,82 nur für Bäume (685).
- **budget.gestalten**: Zahl der Individuen je Art (foundry-core.js:639–659): Eiche, Fichte, Birke, Tanne, Buche je 2;
  Weide, Mammut, Strauch je 1; '*' 16. **Das ist die Obergrenze der Individualität**: in der Welt gibt es je Art V (+1 Solitär)
  verschiedene Bäume. Den Rest tragen Skala, Drehung und Tönung.
- **FOREST_SPECIES**: Tabelle der Namen Labor ↔ Wirt (phyto-core.js:3299–3318), verjPool [birke, eiche, fichte, tanne].
- **Alias-Tabelle Wirt → Studio**: baum_zypresse → tanne, baum_palme → weide (studio-bruecke.js:3843–3844). Die „Palme“ der
  Tropen wird mit dem Körper der Trauerweide gezeichnet.
- **Bodenarten-Zeilen** (foundry-core.js:724–793): Toleranz-Bänder je Art. Das ist die Form eines Gesetzes; die Zahlen sind
  aber Hand-Trapeze und nicht aus Physiologie abgeleitet.

### Ungebundene Würfe (Hash oder Zufall ohne Gesetz)
- **Individuum** (treeParams, phyto-core.js:2454–2516): IR(seed) streut api, delta, slim und trop um ±0,1, leafD um ×(1±0,16),
  die Höhe um ×(1±0,16), leafSize um ±12 % und die Laubfarbe in HSL; die Bruchhöhe des Totholzes ist 0,42 + 0,26·IR. Kein Erbe
  und keine Umwelt dahinter. Was man sieht: die zwei Gestalten einer Art unterscheiden sich darin.
- **Seed → Gestalt** (studio-gestalt.js:943–944): Knuth-Hash h·V/2³². Was man sieht: Klone im Abstand der Raster-Periode
  (der Kommentar 929–931 nennt den alten 54-m-Klon).
- **Wahl der Art** (planForestCell phyto-core.js:3689–3706): rng()·Σw über 5 feste Arten + extras.
- **Mammut-Promotion** mit p = 0,02, wenn sd > 0,72 und clim > 0,5 (phyto-core.js:3118–3126). Ein Würfel macht aus einem Baum eine
  andere Art.
- **Konkurrenz**: wer im Konflikt gewinnt, entscheidet `prio = rng()` (phyto-core.js:3723, forestPrioWins 3338). Nicht Größe,
  Licht oder Alter; der Kommentar 3724 nennt `keep` als Perf-Kappung.
- **Größe**: reverse-J s = 0,55 + 1,45·ue^1,45, Überhälter mit p = 0,05 (phyto-core.js:3105–3114). Die Verteilung ist statistisch
  gestempelt, es wächst nichts.
- **Nischen-Bänder ohne Physik**: clim und patch sind fbm-Rauschen (phyto-core.js:3059–3060). Jede Art hat ein festes
  Patch-Zentrum 0,15/0,36/0,58/0,82 (2832–2836). dry = (relH+6)/dryScale ist relative Höhe, keine Temperatur und kein
  Niederschlag. Was man sieht: Reinbestände als Flecken im Rauschen.
- **Neue Arten (Auto-Arten)**: w0 = 0,18 pauschal, das Patch-Zentrum ist der FNV-Hash des Namens (vegetation-wiese.js:2583–2589).
  Die Nische einer neuen Art ist also der Hash ihres Namens.
- **Zwillings-Wähler in der Welt**: `_scatterSpeciesForCell` (vegetation-streu.js:202–230) wählt die Art der Streu-Krone
  (Ring 64–384 m, SCATTER siedlung-instanz.js:1246–1252) aus Hash-Bändern (pick < 128 Erle usw.) über lebendig/moisture.
  Das ist eine zweite Artenwahl neben forestNicheWeights, mit anderen Arten (Buche, Palme, Zypresse, Karst). Unterwuchs nach
  Schwellen, Fels nach `hash % 100 < 12` (236–251).
- **Labor-Wald**: Art-Umtausch nur per Hash (phytogenesis.js:2442–2448): h > 0,97 → Totholz, h > 0,94 → Karst,
  Eiche/Birke mit h < 0,35 → Buche. Totholz und Karst stehen damit ohne Standort-Gesetz.
- **Labor-Showcase**: Mammut-Garantie „mind. 2, volle Artenvielfalt sichtbar“ (1314–1355). Birke ×1,5 am Pfad (1251).
  Verjüngung: 5–10 Sämlinge je Altbaum bei r·(0,15–0,6), erbt die Art mit p = 0,6, sonst aus dem Pool (1356–1385).
  Schattenverdrängung mit killChance 0,92·(1−d/R) (1386–1406).
- **Unterwuchs im Labor**: Gras-Skala 0,7 + 0,7·RNG, ×1,45 bei moist > 0,8 (2529); Vorlage RNG < 0,5 (2524); Blume ganz
  RNG (2551); Strauch 0,8 + 0,5·RNG (2574).
- **Tönung je Instanz**: Hash der Position ±11 % Luminanz auf der Karte (phytogenesis.js:2310), dazu der Welt-Tint (vegetation-streu.js:288).
- **Fail-soft-Zwillinge im Labor**: alle Kern-Formeln stehen als Inline-Fallback daneben (phytogenesis.js:1104–1109,
  1146–1194, 1235–1250, 1288–1299). Wenn der Kern fehlt, läuft das Labor still auf den alten Literalen weiter.
- **Erklärter Doppel-Plan**: FOREST_TOPOLOGY lab "disk" gegen host "cell", „intentional dual topology … Do NOT merge“
  (phyto-core.js:3140–3143). Nur im Labor gibt es Verjüngung, Schatten-Kill und Garantie (FOREST_LAB 3264–3295). Nur in der
  Welt gibt es Lichtung, Waldgrenze, Saum, Schichten und extras. Studio und Welt pflanzen also NICHT denselben Wald; nur der
  Körper (treeParams) und die Karte sind dieselben.

## (3) GRÖSSEN — Zahl mit Einheit, lesbar für ein Erbe-/Evolutions-Gesetz

Vorhanden:
- Höhe ausgewachsen `hoeheM` [m] je Art (foundry-core.js:4726–5035); Schlankheit `hd` [H/D] der Konifere; Freistand hd·0,45.
- Kronenradius CROWN [m bei Größe 1] (phyto-core.js:3159); KRONE_MAX_M 36 m (siedlung-ort.js:3673).
- kd = Kronen-⌀/BHD = 21,5 [−] (phyto-core.js:448); McMahon k 13–22.
- Welt-Skala [m je Vorlagen-Einheit] (foundry-core.js:686).
- Größenspan s ∈ [0,55; 1,95] [× Art] (phyto-core.js:3183); Schicht-Alter [0,7; 0,4] [Anteil].
- Dichte im Bestand: pack 1,16, dartsPerM2 1,2, Stämme/ha gemessen (Kommentar 3174–3192); Boden-Dichte [je 100 m²] (foundry-core.js:731 ff.).
- ufer [m über dem Wasser], hang [|∇h|], Waldgrenze = Schnee-Anteil 0,1, Saum 40 m (phyto-core.js:3202).
- Blattgröße am Strauch 4–16 cm (Kommentar 2766); Wind δ.
- Morphospace-Regler api/delta/slim/trop/leaf: dimensionslos 0..1. Das sind die einzigen kontinuierlichen „Gene“ einer Gestalt.

Fehlt (nirgends als Zahl mit Einheit gelesen):
- Alter in Jahren, Wachstumsrate (m/a), Lebensdauer, Sterblichkeit. `alter` ist nur ein Gestalt-Anteil 0..1.
- Licht in physikalischer Einheit (W/m² oder PAR) und Schattentoleranz je Art. canopyLight ist relativ und lebt nur im Labor.
- Temperatur [°C], Niederschlag [mm/a], Bodenfeuchte [Vol-%] je Art als Toleranz. Heute stehen dafür fbm clim/dry/wet
  und die Faktoren wuchs.wald/laub/nadel (Herkunft in gelaende-core nicht gelesen).
- Samenmasse, Ausbreitungsdistanz, Ausbreitungsweg (Wind/Tier), Keimrate, Reifealter.
- Holzdichte, Blattflächenindex, Blattlebensdauer, Phänologie-Termine je Art (der Jahreslauf ist global).
- Abstammung oder Verwandtschaft (Stammbaum, Genom-Abstand) — fehlt vollständig.

## (4) NAHT

**Die eine Stelle: `artPhaenotyp(dials, art)` in `treeParams` (phyto-core.js:2431–2457).** Jeder Leser der Gestalt geht durch
sie: der Labor-Bau (`buildInstance` phytogenesis.js:2083, `emitGestalt` 378), der Foundry-Worker der Welt (über
`_foundryVariantFor` studio-gestalt.js:935), der EINE Kartenbäcker (`_karteWeltBacken` stoff-karte.js:1148, er backt die L1
desselben Samens), der gefühlte Baum (`_baumGestaltTeile`) und die Pflanzen-Linsen (Kommentar 2427–2430).

Was dort heute steht: `dials` = die Preset-Tabelle PRESETS[art].s (im Labor das Regler-Objekt `__dials`), `art.ph` = die
Hand-Zeile, `seedInt` = die Gestalt-Nummer 1..V+1 (NICHT das Individuum), dazu der IR-Wurf ±0,1.

Was ein Genom-Gesetz dort bräuchte und heute davor bricht:
1. Vor der Naht fällt das Individuum weg: `_foundryVariantFor` macht aus dem Samen eine Gestalt 1..V (V = 2), damit pro Art nur
   V+1 Körper und Karten existieren (studio-gestalt.js:935–945, 1009–1019). Ein Genom je Individuum kommt nie an.
2. Hinter der Naht wählt der Platz die Art nicht aus Merkmalen: planForestCell (phyto-core.js:3689–3706) kennt 5 Arten mit
   fest verdrahteten Gewichten, Auto-Arten nach Namens-Hash. Die zweite Artenwahl `_scatterSpeciesForCell`
   (vegetation-streu.js:202) kennt andere Arten. Damit Platz und Gestalt dasselbe Genom lesen, müssten die Nischen-Gewichte
   aus den Toleranzen des Genoms kommen (dieselbe Zeile, die artPhaenotyp liest), und der Zwilling in der Streu müsste fallen.
3. Die Kronen-Tabelle CROWN, die Welt-Skala und gestalten[art] sind Art-Konstanten, die Pflanzung, Kollision
   (`FOREST.crown`, studio-gestalt.js:974), Kronen-Deckung und Karte lesen. Ein Genom-Gesetz müsste sie liefern
   (Krone = f(Genom), nicht Tabelle[Name]).

## (5) PREIS — je Art, je Individuum

Je Art × Gestalt (wächst linear mit Arten·(V+1)):
- **Karte**: eine Schicht je (Art × Gestalt). BC 0,55 MiB je Schicht, rgba8 2,8 MiB je Schicht (stoff-karte.js:240–242);
  der Atlas wächst in Schritten (32 Schichten für 18 Karten, +4 MB, 282).
- **Bake**: ca. 55 ms Haupt-Faden je Karte, GTX kalt; 14 Karten im Blick 11,4 → 14,0 s bis zum Weltbild (stoff-karte.js:905–906).
  Swiftshader: eine Karte mit 4 Ringen 3,3 s (879).
- **Vor V18.528**: je Karte 2 CanvasTextures, 1 Material, 1 Programm — 31 MB, ~90 Pipelines (stoff-karte.js:242–243).
- **Labor**: höchstens 32 Zellen (KARTE_LABOR_MAX, phytogenesis.js:1682); heute 10 Baum- und Strauch-Arten mit 15 Gestalten
  + 5 Solitäre (aus budget.gestalten + solitaerGestalt gerechnet, nicht gemessen).
- **Draws im Labor** je Art × Gestalt, unabhängig von der Zahl der Instanzen: L0-Teilmeshes + L1-Teilmeshes + Schatten-Zwilling
  + 1 Karte (phytogenesis.js:2346–2436); laut Budget draws = 2 je Stufe, also etwa 7. Welt: ein leafKey je
  Art:Gestalt:LOD:Teil im HISM (studio-gestalt.js:923–924).
- **Foundry-Bau**: je Gestalt × Stufe ein Bau im Worker; die Bake-ms je Bau stehen in keiner der gelesenen Stellen (OFFEN).

Je Individuum (Instanz):
- Dreiecke je Stufe: Baum L0 12 000 / L1 2 900 / Karte 2 (foundry-core.js:506–530); Strauch 12 000 / 1 100 / 2; Gras 1 000 / 130;
  Blume 3 600 / 380; Farn 3 800 / 150. Laut stoff-karte.js:2047 trägt jede Karten-Instanz 8 Dreiecke (die 2 der Budget-Zeile
  sind nur das Quad).
- Plan: eine frische Wald-Zelle (12 m) kostet 1–3 ms in planForestCell, etwa 160 Sichthöhen (vegetation-wiese.js:2838).
  Haupt-Faden-Spitzen vom Wald stehen in den Kommentaren (551 ms für 366 Zellen vor K69, 2840–2841).
- Im Labor wächst das Lichtvolumen mit Voxeln × Kronen: 48×20×48 × alle Bäume, gecacht in 48 Slots (phytogenesis.js:3634–3728).

Was mit der Zahl der Arten wächst: Karten, VRAM, Bake-Zeit bis zum Weltbild, Draws und Programme (je Stoff), der Foundry-Bau
je Gestalt × Stufe, die Pick-Schleife über extras. Die Folge: das Kostenmodell ist an die Gestalt gebunden. „Jedes Individuum
eigen“ hieße heute eine Karte, einen Bau und eigene Draws je Baum. Es geht nur, wenn die Variation des Genoms aus der
Gestalt-Geometrie in Instanz-Parameter wandert (parametrische Karte oder Shader) oder ein Gestalt-Cache Ähnliche
zusammenfasst. Keine der gelesenen Stellen trägt so einen Weg.

## (6) OFFEN

- gelaende-core `ortGesetz(teil).wuchs` (wald/laub/nadel): wie das Klima dort entsteht, nicht gelesen.
- foundry-core `groundCover` und `__terrainCore.wiesenTint` (die Nische von Gras, Blume, Strauch, Kies): nicht gelesen.
- Der Leser von `bodenGewicht` in der Welt-Nah-Streu (Datei und Zeile) wurde nicht gefunden.
- growSkeleton ab Zeile 101 nicht ganz gelesen: wie stark seq/IR die Topologie über die Regler hinaus würfelt.
- Ob Nadelbäume im Winter-Shader ihre Nadeln behalten (uLeafPresence ist global; aType im Wind-Shader nicht gelesen).
- vegetation-baum.js (Promotion, Sukzession, Wald-Faden) und voxel-worker `wald` nur an Ankern gesehen.
- gelaende-fern: wie die Fernfarbe die Arten mischt, nicht gelesen.
- Bake-ms eines Foundry-Baus je Art und Stufe (Worker) sowie Karten-Bake auf der Radeon: keine Zahl gefunden.
- Wie viele Auto-Arten (`_forestExtraSpecies`) das live gelieferte Buch heute trägt: Laufzeit-Wert, nicht gemessen.
