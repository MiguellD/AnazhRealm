# Abnahme Analog (Pflicht A–E)

> Die Frozen-Liste (`docs/PFLICHT-OFFEN.md`) setzt fünf Einträge: A Kreaturen · B Bäume ·
> C Architektur + Streu · D Wiese · E das Beweis-Paket. Hier steht je Klasse die Code-Wahrheit,
> darunter die Messung (Bild-Paare + Zahlen, dieselbe Sonde). **Stand 30.09. (V18.496):
> Schöpfer-Wort „am Ende AAA-Niveau, nicht Kapseln" — nah und mittel ist das Studio-Mesh mit
> seiner LOD-Kette die Gestalt, das Analog-Feld trägt nur fern (und bis ein Mesh steht). Offen:
> die dunklen Schattenseiten, die Wiese (D), der echte GPU-Trace.**

## Die Sonde

`node scripts/diag-beweis-e.cjs --tag <name> [--klassen kreatur,baum,haus,wiese] [--proto-min 90]` (npm run beweis:e)

- Echter Renderer (WebGPU über swiftshader-Vulkan), RT-Readback wie `diag-blick` — **der
  Null-Renderer des Gates ist für den ganzen Analog-Pfad blind** (Feld-Fit, Slots, March kehren
  headless früh zurück).
- Je Schuss ruht der Spiel-Loop (sonst zieht er Kamera, Tageszeit und Cull-Zustand zwischen
  Setzen und Render weiter), Mittag fest, die Schatten-Map wird neu markiert (ohne Loop blieb sie
  für die neue Kamera alt → schwarzer Boden). Die Sonde schwingt ein, bis die **Mesh-Zone GANZ
  steht** (Mesh-Zonen-Linse + Impostor-Zensus nennen, was fehlt), dann prüft die **Blick-Wahl** je
  Schuss-Art 12 Azimute (aktive Gestalt an/aus — Mesh oder Feld —, 160×90) und nimmt den mit den
  meisten Objekt-Pixeln; die **Zustands-Linse** meldet je Bau Mesh/Instanzen, LOD, servierte Stufe,
  Feld-Slot.
- Alle Klassen auf der **Mess-Wiese −900/−850** (die Welt ist seed-deterministisch → auf jedem
  Code-Stand dieselben Bühnen): flache, trockene Bühne je Klasse (Höhen-Spanne 1,2 / 3,6 / 4,8 m),
  der Spieler steht an der Kamera (Chunk-Ring, Foundry-Stufe und March folgen ihm), zwei Renders
  je Schuss, gezählt wird der zweite (`renderer.info`: Draw-Calls, Dreiecke dieses einen Renders).
- Vorher = Worktree des Mesh-Stands `d7ca0a1f` (19.07., vor dem Schöpfer-Wort „analog!"), dieselbe
  Sonde hineinkopiert. Holz-Profil in beiden Läufen „kienspan" (swiftshader: Ring ≤ 2, keine
  Schatten) — die Zahlen sind unter sich vergleichbar, nicht mit dem Schöpfer-Holz.
- Bilder: `artifacts/beweis-e/e-<tag>-<klasse>-<fern|arm>.png` (nicht im Repo — jederzeit neu
  erzeugbar), Zahlen: `artifacts/beweis-e/beweis-e-<tag>.json`. Alle acht Paare nebeneinander
  (privat, Schöpfer-Konto): https://claude.ai/artifact/K8wVXFNbHsc9x3dR9gzRKk

## Die Klassen im Code

**Gemeinsam:** EIN Welt-March (`_tickFeldPass`, Mesh `renderOrder 9999`, Tiefe = March-Tiefe)
über EINE Feld-Liste; **das Licht** liest `_feldLichtSync` aus denselben Quellen wie jedes
MeshStandard (vier Richt-Lichter, Ambient, Hemi, Himmels-Irradianz aus `_skyEnvTex`, Lambert =
albedo/π, `scene.fog`); Dedup je Vorlage im `kapselCache` (`_weltKapselHolen`/`_weltKapselSpawn`),
Bake-Takt `_weltBakeErlaubt` (16/s, 4/s über Budget). Voxel-Bricks nur noch als Region-Fern-Cache
(`dimRegion`); jeder andere Brick-Weg ist fail-closed (`_weltFeldSpawn("arch:…"|"baum:…")` → null).
Primitive-Kodierung (2 Texel je Primitiv, `pA.w`/`pB.w`):

| Art | pA.w | pB.w |
|---|---|---|
| Kapsel | r ≥ 0 | Farbe ≥ 0 |
| Kegel | r0 ≥ 0 | −(Farbe + (r1+1)/10) |
| Box / Ellipsoid / Prisma | −(c+1) | 0 / 1 / 2·3 |

- **A Kreaturen:** bis 55 m (Hysterese 65 m, `KREATUR_NAH_MESH`) ist das Studio-Tier
  (tierBaum-Mesh mit Fell) die Gestalt. Fern: `_tickKreaturZiegel` → `_kreaturGliederBacken` →
  `_gliedKapselFit` (Kapsel je Glied, Dedup Gattung×Glied); je Frame reist die Knochen-Matrix in
  die Liste (`_weltFeldMatrix`).
- **B Bäume:** die Streu-Bäume tragen die ganze Studio-LOD-Kette als Instanzen — L0/L1 Mesh, L2 das
  gebackene Studio-Billboard (Bäcker-Queue nah zuerst, EINE Bake-Uhr 45 s). Gesetzte Bäume
  (Architektur) fern: `_archFoundryZiegel` → `_baumKapselFit` mit Beipack `_baumGrammatikFit`
  (Ketten-Kegel Stamm + Hauptäste, Kronen-Lappen aus den Zweig-Punkten).
- **C Architektur + Streu:** `_archZiegelFern` — Häuser über `_archFachwerkFit` (Balken, Gefach,
  Verbände, Prisma-Dach, Gaube/Flügel; ≤ 24 Primitive), gesetzte Studio-Dinge über
  `_archFoundryZiegel` (Foundry-Flat; Bäume teilen Schlüssel + Fit mit der Streu), sonst
  `_archBoxFit` (≤ 24 AABB) — das ist die Gestalt JENSEITS der Mesh-Zone. Die Mesh-Zone ist der
  geregelte Cull-Radius (100–150 m): dort IST das Studio-Mesh mit seiner LOD-Kette die Gestalt
  (L0 < 12 m · L1 < 26 m · L2 darüber; Haus: `KIND_POLICY.haus.lodServe {1:2}` serviert im Ring
  12–26 m das L2-Destillat), bis es steht trägt das Feld. Bauten nah zuerst, das Budget zählt
  gebaute Meshes (≤ 24 Versuche je Takt), über Budget Takt-Garantie (1 je 250 ms). Fachwerk-Farben
  sRGB-dekodiert wie `THREE.Color`, bei vollem Fachwerk Silhouette vor Holz. Klein-Streu auf der
  Fern-Stufe (Zellen-LOD 2): `_streuGesetzSpawn` — ein Gesetz-Block je 64-m-Kachel, der March
  tract die Plätze (`einheit < 0`); nah und mittel Mesh-Instanzen.
- **D Wiese:** Boden-FUNKTION in `_terrainGeologyAlbedo` — Meadow-Grund (`MEADOW_GREEN`) fern,
  8-Schicht-Parallax-Relief nah (≤ 90 m, gated grün × flach × kein Fels × nicht trocken). Keine
  Halm-Geometrie (`voxelChunkGrass` → null je Chunk). Mess-Wiese: −900/−850.

## Die Messung (30.09.)

| Klasse · Schuss | Mesh-Stand 19.07. dc / Dreiecke | Analog (HEAD) dc / Dreiecke | Bild-Urteil |
|---|---|---|---|
| Wolf · fern | 135 / 527 475 | 17 / 34 933 | Mesh: helle Wiese mit Gras + Blumen, erkennbarer Wolf. Analog: brauner Kapsel-Rumpf auf Stab-Beinen, dunkle Kronen darüber |
| Wolf · Armlänge | 102 / 503 783 | 17 / 34 951 | Mesh: Tierkörper mit Fell-Strähnen. Analog: glatte, dunkle Kapseln |
| Eiche · fern | 31 / 183 495 | 12 / 24 801 | Mesh: Nebelwiese mit Halmen, die gesetzte Eiche ist NICHT im Bild (im Juli-Stand nach dem Einschwingen nicht gebaut — Ursache dort ungemessen). Analog: der Blick endet in einem massiven Kronen-Lappen (fast einfarbig) |
| Eiche · Armlänge | 32 / 183 503 | 12 / 24 801 | Mesh: Wiese mit Grasbüscheln, keine Eiche. Analog: dunkler Stamm-Kegel füllt das Bild |
| Haus · fern | 245 / 912 943 | 36 / 28 389 | Mesh: Wiese mit Halmen, das gesetzte Haus ist NICHT im Bild. Analog: das Haus als dunkler Box-Satz, darüber Kronen-Dach |
| Haus · Armlänge | 95 / 671 101 | 23 / 28 239 | Mesh: Hang mit Gras, kein Haus. Analog: dunkle Box-Flächen |
| Wiese · fern | 91 / 420 239 | 25 / 27 217 | Mesh: Grasbüschel, Pfad, Studio-Bäume mit Himmel zwischen den Ästen. Analog: fleckiger Boden ohne Halme (Parallax-Funktion), Kapsel-Wolf, dunkle Kronen |
| Wiese · Armlänge | 77 / 1 175 961 | 19 / 25 817 | Mesh: einzelne Halme und Blätter. Analog: fast einfarbig dunkel |

Über alle acht Paare: **Dreiecke 7–46× weniger** (Median ~15×), **Draw-Calls 2,6–8× weniger**.
Welt-March im Analog-Lauf: 261–371 Feld-Einträge, 102–107 Kapsel-Sätze (Dedup), 0 Bricks;
der Feld-Pass war ab dem ersten Takt sichtbar, 0 Takte mit unsichtbarem Tier. Im Mesh-Stand
erschienen die gesetzte Eiche und das gesetzte Haus in der Einschwing-Zeit nicht — dessen
Baum-/Haus-Zahlen sind die Szene ohne diese Objekte.

### Nach den Licht- und Fit-Schnitten (V18.495, Tag `analog3`, Blick-Wahl)

| Schuss | dc / Dreiecke | Bild |
|---|---|---|
| Wolf · fern | 22 / 26 077 | beleuchteter Kapsel-Wolf (brauner Rumpf, dunkle Beine) neben einem echten Studio-Baum (Stufe 0), grüne Analog-Kronen dahinter, Boden grün |
| Wolf · Armlänge | 15 / 26 127 | Rumpf und Beine füllen das Bild — scharfe Kanten, glatte Kapseln, Schattenseite dunkel |
| Eiche · fern | 27 / 35 137 | grünes Kronendach aus Lappen, Wolf und Stämme darunter; einzelne Lappen zeigen noch Wellen-Rippen |
| Eiche · Armlänge | 23 / 35 093 | der Stamm-Kegel (Feld): das Stufe-0-Mesh der gesetzten Eiche stand nach 28 Takten noch nicht (Foundry-Flat LOD 0 lädt asynchron) |
| Haus · fern/Arm | 28 / 26 913 · 15 / 26 745 | **kein Haus im Bild** — die Blick-Wahl fand zu dem Zeitpunkt keinen Feld-Slot am Haus (Sonden-Lücke, offen) |
| Wiese · fern/Arm | 34 / 27 605 · 16 / 25 439 | Boden im Waldschatten fast schwarz — die Bühne neben dem Wolf liegt unter Kronen; die Halm-Funktion ist dort nicht zu sehen |

### AAA nah (V18.496, Schöpfer-Wort 30.09., Tag `aaa8`)

Nah und mittel das Studio-Mesh, fern das Feld. Die Sonde schwingt vor der Blick-Wahl ein, bis die
Mesh-Zone GANZ steht, wählt den Blick je Schuss-Art und berichtet je Bau, was im Bild steht
(Zustands-Linse: Mesh/Instanzen · LOD · servierte Stufe · Feld-Slot).

| Schuss | dc / Dreiecke | Gestalt (Zustands-Linse) · Bild |
|---|---|---|
| Wolf · fern | 263 / 831 937 | Studio-Tier zwischen Studio-Büschen und -Bäumen; zwei Hauswände im Ring 12–26 m als glattes L2-Destillat |
| Wolf · Armlänge | 222 / 635 557 | Studio-Tier: Rumpf und Läufe mit Fell-Strähnen, Pfoten |
| Eiche · fern | 192 / 254 453 | Instanzen · LOD 1 (serviert 1) · Feld-Slot aus — Studio-Eiche mit Laub, Ästen, Wurzeln |
| Eiche · Armlänge | 97 / 27 505 | Instanzen · LOD 0 · Feld-Slot aus — Stamm, Astgabeln, Blattwerk gegen den Himmel |
| Haus · fern | 283 / 252 361 | Instanzen · LOD 1 (serviert 2 = Destillat) · 20 m — ein Studio-Busch füllt den Vordergrund |
| Haus · Armlänge | 154 / 415 363 | Instanzen · LOD 0 · 7,5 m — das Studio-Fachwerk: Balken, Streben, Backstein-Gefach, Tür |

Ungebaut in der Mesh-Zone: 148–195 (Läufe `aaa3`–`aaa5`, vor den Nah-zuerst-Schnitten) → **0** an
allen Bühnen; Bäcker 149 Karten gebacken, 0 hängend (vorher 7–8 hängend). Kosten gegen `analog3`:
15–28 dc / 26–35k Dreiecke → 97–283 dc / 28–832k — die Größenordnung des Mesh-Stands 19.07.
(31–245 dc / 183k–1,18 M). Die Trias-Linse hält fest, wo dein Holz stockt (~1 M Dreiecke): der
Wolf-Schuss liegt mit 832k knapp darunter — die schwersten Posten sind Studio-Stufen selbst
(Konifere L0 ~170k Vertices, Fachwerk L1 75k ≈ L0 88k).

### Tier-Haut, Schalen-Fell, Kopf-Häute (V18.497–499, Tag `aaa9`)

Dieselbe Sonde, dieselbe Bühne; der Wolf-Leib ist eine geskinnte Haut mit 6 Fell-Schalen, Kopf und
Kiefer starre Häute.

| Schuss | dc / Dreiecke (aaa8 → aaa9) | Bild |
|---|---|---|
| Wolf · fern | 263 / 831 937 → **177 / 77 493** | der Blick stand hinter einer Birke — kein Urteil über das Fern-Bild |
| Wolf · Armlänge | 222 / 635 557 → **141 / 78 949** | ein durchgehender Leib mit Pelz und weicher Kontur statt der Kugel-Kette mit Strähnen-Flecken |

Der Haus-Armlängen-Schuss war in `aaa9` leer: der Bau stand bei 7,5 m noch auf L1 (serviert 2),
die Sonde galt nach 40 Takten als eingeschwungen, weil sie nur „Repräsentation zugewiesen" zählte.
Die Wiederholung in derselben Reihenfolge (`aaa9b`) ist grün (LOD 0 bei 7,5 m). Seitdem wartet die
**Stufen-Linse** vor dem Schuss auf das Ziel-Objekt im L0-Band (≤ 600 Takte) und benennt eine
ausstehende Stufe im Protokoll.

**Die Licht-Linse** (`diag-arch-feld` D): eine Feld-Box und eine MeshStandard-Box (Albedo 0,5,
roughness 1) am SELBEN Ort, gemeinsame Pixel-Maske. Vorher **0,67** (Feld rgb 70/77/86, Mesh
97/115/151 — zu dunkel und ohne Himmels-Blau), nachher **0,98** (62/69/81 vs. 64/71/80).

## Was die Messung an Fehlern fand (geheilt in V18.494)

1. **Gesetzte Studio-Dinge blieben unsichtbar** (Eiche, Tor, Fahrzeug …): der Feld-Fit baute ein
   Async-Mesh temporär, sah es leer, gab nach 8 Versuchen auf — 26 von 28 Weltgen-Bauten mit
   Versuchen waren ausgebrannt. Jetzt Fit aus der Foundry-Flat (`_archFoundryZiegel`).
2. **Bake-Takte verhungerten** in Listen-Reihenfolge: eine frisch gesetzte Eiche auf Platz 98 von
   100 bekam in 150 Takten keinen Versuch. Jetzt nah zuerst, ferne nach Distanz.
3. **Der Baum-Fit war nicht maßtreu:** 5 Stücke desselben Stamms, Krone 5× zu klein und schwebend.
   Jetzt Ketten-Kegel (Stamm + Hauptäste) + Kronen-Lappen aus den Zweig-Punkten.

4. **Das Feld las nur 2 von 5 Lichtquellen** (Sonne + Ambient/Hemi-Mittel, ohne /π, mit eigener
   Ton-Klemme): Fill-, Rim-, Back-Licht und die Himmels-Umgebung fehlten — Schattenseiten fast
   schwarz. Jetzt `_feldLichtSync` (V18.495).
5. **Jedes Welt-Haus war eine schwarze 3×3-m-Flachdach-Hütte:** im Fachwerk-Fit galt
   `Number(null) === 0` als Wert (`n(ov && ov.W, 9)` → 0 → W=3, Dach 8° → flach; `hexRgb(null)` →
   Schwarz). Dazu fraß bei vollem Fachwerk das Holz (prio 2) alle 24 Plätze — Wände und Dach
   fielen. Und Hex-Farben galten roh als linear (Feld heller als das Mesh derselben Farbe).
6. **In der Hand-Blase zeichneten Mesh UND Feld** (Häuser, gesetzte Foundry-Dinge): der
   konservative Box-Satz lag vor dem Mesh. Und über Budget (auf dem Schöpfer-Holz immer) baute
   die Hand-Blase nie ein Mesh — die Tür blieb Feld.
7. **Der Kronen-Noise skalierte mit der Kronengröße** (Amplitude ∝ hn bei fester Frequenz →
   Gradient ∝ hn): Streifen und Lipschitz-Bruch auf großen Kronen. Jetzt im größen-normierten Raum.

Mit dem AAA-Schnitt (V18.496):

8. **Die Staging-Entlassung nullte Arrays mit offenem Upload:** ein gerade ungerenderter Batch
   sammelte Teil-Uploads, die Gnadenfrist lief ab, der nächste Render las die Range aus dem
   Null-Array (`writeBuffer … too large`, jeder Schuss nach dem Einschwingen). Die Upload-Probe
   prüft jetzt offene Versionen und Ranges.
9. **Das Mesh-Zonen-Budget zählte Versuche:** die nächsten Karten-Wartenden fraßen jeden Takt das
   Budget, bereite Eichen dahinter standen. Jetzt zählt der gelungene Bau.
10. **Bäcker-Queue und Foundry-Rewarm gingen in Anfrage-/Listen-Reihenfolge** (105 von 112 Karten
    wartend). Jetzt nah zuerst.
11. **Zwei Bake-Uhren:** der 15-s-Watchdog gab Bakes auf, während der serielle Worker noch
    rechnete, und schob den nächsten nach — Kaskade (7 hängend, 3 gescheitert, 0 gebacken). Jetzt
    EINE Uhr (45 s).

Stehende Linsen: `node scripts/diag-arch-feld.cjs` (A Slots · B 0 ausgebrannt · C geteilter
Kapsel-Satz · D Feld-Licht ≙ Mesh-Licht, Band 0,8–1,25) und `node scripts/diag-arch-fachwerk-fit.cjs`
(Welt-Haus ohne `studioOv`: Maße aus Defaults, Sattel-Dach, keine schwarze Farbe; volles
Fachwerk behält Dach und Wände).

## Das Urteil (ehrlich)

- **Die Form ist AAA-Studio, wo man hinsieht:** nah und mittel das Studio-Mesh mit seiner
  LOD-Kette (Wolf mit Fell, Eiche mit Laub/Ästen/Wurzeln, das Fachwerk-Haus mit Balken und
  Backstein-Gefach, Fichten, Büsche), die Mesh-Zone steht (0 ungebaut). Das Feld trägt fern und in der Streaming-Rampe; dort bleibt es ein grober Satz,
  klein im Bild.
- **Kosten:** zurück in der Größenordnung des Mesh-Stands (bis ~830k Dreiecke, bis 283 dc je Bild
  auf kienspan), knapp unter der Stock-Schwelle deines Holzes (~1 M) — die schwersten Posten sind
  Studio-Stufen ohne echte Reduktion (Konifere L0, Fachwerk L1). Der Richter ist der echte
  GPU-Trace (Ziellinie p95 ≤ 33 ms).
- **Ehrlich offen:** die Schattenseiten sind sehr dunkel (MeshStandard-Box Albedo 0,5 liest
  rgb ≈ 64/71/80 — key-dominantes Licht ohne Boden-Bounce); das Haus zeigt im Ring 12–26 m das
  L2-Destillat, weil das Studio-L1 (75k) kaum billiger ist als L0 (88k) — ein echtes Mittel-LOD
  fehlt im Studio; einzelne Billboard-Karten scheitern in swiftshader („ohne brauchbaren Payload");
  D (Wiese) — die Wiesen-Linse (`npm run lens:wiese`) findet die besonnte Stelle, aus Augenhöhe
  liest der Boden grau (Halm-Kontrast 0,20 / 0,05); der echte GPU-Trace auf dem Schöpfer-Holz.

## Der echte GPU-Trace (Schöpfer-Holz)

1. `npm run leuchtturm` (save-server + signaling), Welt im Browser öffnen, Holz-Profil „voll".
2. Die Wege aus `docs/abnahme-drehbuch.md` Schritte 1–5 gehen (ankommen, laufen, umsehen).
3. Im Chat `metrologie` tippen (die Zahlen-Zeile landet im Flugschreiber), dann 60 s laufen.
4. Der Flugschreiber schreibt `anazhRealmPerf.json` (save-server `/api/perf-trace`) —
   `node scripts/diag-analog-e-metrology.cjs` liest daraus steady/worst dc·tris·weltMarch.
5. Maßstab der Ziellinie: p95 ≤ 33 ms (roadmap §0.v1).

Die Metrologie-Linse ohne Browser: `node scripts/diag-analog-e-metrology.cjs [trace.json]`
(Selbst-Test: ein Trace ohne `weltMarch` ist ROT).
