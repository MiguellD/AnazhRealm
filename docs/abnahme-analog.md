# Abnahme Analog (Pflicht A–E)

> Die Frozen-Liste (`docs/PFLICHT-OFFEN.md`) setzt fünf Einträge: A Kreaturen · B Bäume ·
> C Architektur + Streu · D Wiese · E das Beweis-Paket. Hier steht je Klasse die Code-Wahrheit,
> darunter die Messung (Bild-Paare + Zahlen, dieselbe Sonde). **Stand 30.09. (V18.496):
> Schöpfer-Wort „am Ende AAA-Niveau, nicht Kapseln" — nah und mittel ist das Studio-Mesh mit
> seiner LOD-Kette die Gestalt, das Analog-Feld trägt nur fern (und bis ein Mesh steht). Offen:
> das Profi-Band auf jedem Standardgerät (Schöpfer-Wort 02.10.: „richter ist nicht mein rechner";
> die Überbelichtung fiel in V18.506–507, die Wiese auf Armlänge in V18.508).**

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
albedo/π, die EINE Luft `scene.fogNode` aus `_luftEnsure`, V18.530); Dedup je Vorlage im `kapselCache` (`_weltKapselHolen`/`_weltKapselSpawn`),
Bake-Takt `_weltBakeErlaubt` (16/s, 4/s über Budget). Die Voxel-Bricks sind verabschiedet (V18.528):
kein 3D-Atlas, kein Brick-Zweig im WGSL, kein Region-Ziegel — der Welt-March trägt EINE Payload.
Primitive-Kodierung (2 Texel je Primitiv, `pA.w`/`pB.w`):

| Art | pA.w | pB.w |
|---|---|---|
| Kapsel | r ≥ 0 | Farbe ≥ 0 |
| Box / Ellipsoid / Prisma | −(c+1) | 0 / 1 / 2·3 |

(Der Kegel-Stumpf fiel 05.10. mit dem Baum-Satz, der ihn allein trug.)

- **A Kreaturen:** bis 64 m (die EINE Nah-Grenze `ANALOG_NAH_M`, Hysterese 74 m, `KREATUR_NAH_MESH`) ist das Studio-Tier
  (tierBaum-Mesh mit Fell) die Gestalt. Fern: `_tickKreaturZiegel` → `_kreaturGliederBacken` →
  `_gliedKapselFit` (Kapsel je Glied, Dedup Gattung×Glied); je Frame reist die Knochen-Matrix in
  die Liste (`_weltFeldMatrix`).
- **B Bäume:** die Streu-Bäume tragen die ganze Studio-LOD-Kette als Instanzen — L0/L1 Mesh, L2 das
  gebackene Studio-Billboard (Bäcker-Queue nah zuerst, EINE Bake-Uhr 45 s). Gesetzte Bäume und
  Sträucher (Architektur, die Karten-Dinge `_archKartenPreset`) sind jenseits der Mesh-Zone ihre
  Karte bis zu ihrem Rand im Saum vor `SCATTER.outerM` (B2c `fernform: "karte"`, `_archInKartenZone`, `_archKartenHorizont`,
  gate:fernwald); ihr Analog-Satz (Ketten-Kegel + Kronen-Lappen) fiel 05.10. ganz — aus 45 m
  standen dort glatte, gestreifte, einfarbig hellgrüne Ellipsoide.
- **C Architektur + Streu:** `_archZiegelFern` — Häuser und Ausstattung über `_archFoundryZiegel` mit der Fernform
  `"huelle"` (S3: die Liste der NUR-WURF-Stufe 3 des Gesetzbuchs, Beipack `__fern`, der Leser `_huelleVon` — Wände,
  Keil-Dächer mit Walm, Kamin, Flügel, Anbau; ≤ 24 Teile; der Wirts-Fit `_archFachwerkFit` fiel), gesetzte Studio-Dinge
  ohne Karte (Fels, Kristall) über `_archFoundryZiegel` (Foundry-Flat, Box-Satz), sonst
  `_archBoxFit` (≤ 24 AABB) — das ist die Gestalt JENSEITS der Mesh-Zone. Die Mesh-Zone ist der
  geregelte Cull-Radius (100–150 m): dort IST das Studio-Mesh mit seiner LOD-Kette die Gestalt
  (L0 < 12 m · L1 < 26 m · L2 darüber — die Studio-Distanzen d0/d1, der Host-Umweg fiel; Haus seit V18.500: L1 = die Flächen-Stufe des Studios,
  17–33 % von L0, der Host-Umweg `lodServe` ist gefallen), bis es steht trägt das Feld. Bauten nah zuerst, das Budget zählt
  gebaute Meshes (≤ 24 Versuche je Takt), über Budget Takt-Garantie (1 je 250 ms). Fachwerk-Farben
  sRGB-dekodiert wie `THREE.Color`, bei vollem Fachwerk Silhouette vor Holz. Klein-Streu auf der
  Fern-Stufe (Zellen-LOD 2): `_streuGesetzSpawn` — ein Gesetz-Block je 64-m-Kachel, der March
  tract die Plätze (`einheit < 0`); nah und mittel Mesh-Instanzen.
- **D Wiese:** nah (≤ 14 m um die Kamera) die NAH-WIESE — Studio-Gras (Foundry „gras", L1 ≤ 5 m,
  L2 bis 14 m) nach dem Studio-Gesetz (`understory.grassStep` · `groundCover.grass`) im Kachel-Ring
  (`_tickNahWiese`), Fuß auf der Boden-Karte; jenseits die Boden-FUNKTION in `_terrainGeologyAlbedo` —
  Meadow-Grund (`MEADOW_GREEN`) fern, 8-Schicht-Parallax-Relief (≤ 90 m, gated grün × flach × kein
  Fels × nicht trocken). Je Chunk keine Halm-Geometrie (`voxelChunkGrass` → null). Mess-Wiese: −900/−850.

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
Kapsel-Satz · D Feld-Licht ≙ Mesh-Licht, Band 0,8–1,25) und `npm run gate:haus-fern` (S3: der Fernkörper des
Gesetzbuchs — Wurf-Deckung zur L0, Umriss L1 ↔ L2, First auf x, Aufblähung, innen; die Linse des Wirts-Fits
`diag-arch-fachwerk-fit.cjs` fiel mit ihm).

## Das Urteil (ehrlich)

- **Die Form ist AAA-Studio, wo man hinsieht:** nah und mittel das Studio-Mesh mit seiner
  LOD-Kette (Wolf mit Fell, Eiche mit Laub/Ästen/Wurzeln, das Fachwerk-Haus mit Balken und
  Backstein-Gefach, Fichten, Büsche), die Mesh-Zone steht (0 ungebaut). Das Feld trägt fern und in der Streaming-Rampe; dort bleibt es ein grober Satz,
  klein im Bild.
- **Kosten:** zurück in der Größenordnung des Mesh-Stands (bis ~830k Dreiecke, bis 283 dc je Bild
  auf kienspan), knapp unter der Stock-Schwelle deines Holzes (~1 M) — der schwerste Posten ohne
  echte Reduktion ist die Konifere L0 (Fachwerk L1 geheilt: V18.500 Flächen-Stufe, unten). Der Richter ist der echte
  GPU-Trace (Ziellinie p95 ≤ 33 ms).
- **Ehrlich offen:** die „sehr dunklen Schattenseiten" (Box 0,5 las rgb ≈ 64/71/80) waren das
  lineare Render-Target der Sonde; im echten Frame lasen sie blaustichig (V18.504 geheilt, unten);
  offen ist die Überbelichtung der geeichten Licht-Kette (18-%-Karte 212 statt ~120);
  der ferne Haus-Satz (jenseits der Mesh-Zone, S3 die Hülle des Gesetzbuchs) trägt je Teil EINE Farbe (die Wand
  den gemessenen Fassaden-Ton, kein Gefach-Muster); einzelne Billboard-Karten scheitern in swiftshader („ohne brauchbaren Payload");
  D (Wiese) — die Wiesen-Linse (`npm run lens:wiese`) findet die besonnte Stelle, aus Augenhöhe
  liest der Boden grau (Halm-Kontrast 0,20 / 0,05); der echte GPU-Trace auf dem Schöpfer-Holz.

## V18.500 — die Haus-Flächen-Stufe (`aaa10`, dieselbe Sonde)

- **Nah (7,5 m, L0):** die Backsteine stehen rot (aaa9c: weiß-blau — die Karten-Rolle backte Weiß,
  die Welt liest nur Vertex-Farben). 140 dc / 153k Dreiecke im Bild.
- **20 m (L1, serviert 1):** Rahmen, Fenster, Giebel, Schornstein statt der L2-Kiste — 181 dc /
  27,5k Dreiecke im Bild (aaa9c mit L2: 234 / 28,3k).
- **Studio (32 Kulturen, seed 7):** L1 2251k → 561k Dreiecke, L1 17–33 % von L0 (vorher 74–89 %);
  Bild-Abstand L0↔L1 (Distanz-emuliert, alemannisch) 0,026 → 0,028 bei 4× weniger Dreiecken.

## V18.501 — das Gabel-Gesetz der Rinde (Welt-Zensus, Mess-Wiese −900/−850)

Die Zensus-Sonde zählt nach dem Einschwingen je Vorlage × Stufe die residenten Dreiecke × Instanzen
und die im Sichtkegel (vier Blickrichtungen). Alle Streu-Pflanzen stehen dort auf L1; der Strauch
war der teuerste Einzelposten (69k je Busch, davon 24k Gelenk-Kugeln im Mutter-Ast).

| | vorher | nachher |
|---|---|---|
| resident (Pflanzen) | 0,69 M | 0,53 M |
| im Sichtkegel Ø / schwerste Richtung | 0,28 / 0,37 M | 0,22 / 0,30 M |
| Strauch L1 resident | 281k | 182k |

Dreikant-Nadeln jenseits L0 wurden gemessen und verworfen (sichtbar: 5 % mittlere Abweichung).

## V18.503 — die Linse wird ehrlich, der Boden trägt (01.10.)

Drei Täuschungen der Look-Sonden, je mit Gegenprobe gemessen und an EINER Stelle geschnitten:

| Täuschung | Gegenprobe | Schnitt |
|---|---|---|
| Eigenes Render-Target = linear, ungetont (r184: Tonemapping/sRGB nur am Ausgabe-Ziel) | graue Prüf-Kiste: im RT navy, im Canvas hell-lavendel | `scripts/lib/ausgabe-aufnahme.cjs`: das RT wird Ausgabe-Puffer, der echte Frame läuft hinein |
| Wetter (Auto-Zug 120 s) und Jahreszeit (Jahr 2400 s) liefen frei | dieselbe Wiese: Sonne 90,2 · Regen 40,3 · Sturm 16,8 Boden-Helligkeit | die Bühne `__buehne()`: Mittag · Sonne · Sommer fest |
| Höhe = erster Fels-Gitterpunkt (1,2-m-Raster) | Kamera 0,5 m über dem Wert stand im Gelände; 600 Punkte: Ø 0,60 m / max 1,20 m zu tief | `_voxelSurfaceY` interpoliert den Nulldurchgang (Ø 6 mm / max 0,20 m) |

Der Höhen-Schnitt ist ein Spiel-Schnitt, keiner der Sonde: 25 Leser (Tier-Boden, `spawn_studio`,
Streu, `getTerrainHeightAt`) setzten Dinge bis 1,2 m in den Hang — im Bild `aaa12` verschluckte er
Tür und Erdgeschoss-Fenster des Hauses.

**Die Wiese unter der Bühne** (Stelle −1004/−790, Spieler 25 m hinter der Kamera, echte Augenhöhe):

| Blick | vorher (`wiese-ausgabe2`: Sturm, Kamera zu tief) | nachher (alt2) |
|---|---|---|
| fern (1,7 m, 10 m voraus) | 29,0 · Kontrast 1,32 | 96,0 · 3,04 — besonnte Wiese, Büschel mit Tiefe |
| schräg (1,6 m, 3 m voraus) | — | 95,7 · 1,87 — getreppte Relief-Büschel (8 Schichten), ferne Hänge türkis überglänzt |
| Knie (0,5 m) | Boden von unten (Kamera im Gelände) | 91,9 · 1,65 — die Wiese von oben |
| Armlänge (1,6 m, 0,8 m voraus) | 25,3 · 0,08 | 101,5 · 0,32 — ein glatter grüner Schleier mit Himmels-Spiegelflecken |

Rot-Proben (Albedo hart rot / Halm-Farbe rot): der Arm-Boden IST `_terrainGeologyAlbedo`; der
Schleier ist die Eigenglätte der 9/m-Relief-Funktion auf 1–3 m, kein Fremd-Layer (Fern-Ring,
Feld-Pass, Transparente ausgeblendet: Bild gleich). Verworfen nach Messung: eine Halm-Feinschicht
(ein Halm je 1,8-cm-Zelle, 8 Schalen) — Armlänge 0,32 → 0,35, Knie dunkler (91,9 → 80,6), fern ein
Rausch-Teppich statt Halmen. Über dem Hügel standen damals je Sitzung zufällig drei Himmels-Planeten
(`Math.random`-Kugeln) — Deko, kein Feld-Befund; sie fielen V18.530 (die Wandelsterne leben im Sternfeld).

## V18.504 — das Licht der Welt (Graukarten an der Wiese, Werkbank)

Paneele mit Albedo 0,18 / 0,5 (roughness 1) an der Wiese −1004/−790, Mittag, Ausgabe-Pfad. Jede
Variante ~45 s in der Werkbank (eine offene Welt, Lichter live geschaltet):

| Licht | 18-%-Karte | 50 % Sonnenseite | 50 % Schattenseite |
|---|---|---|---|
| V18.503: Umgebung aus `nebulaColor` + Studio-Rig | 204/202/199 | 191/198/212 | 162/181/202 (blaustichig) |
| dieselbe Umgebung, nur Sonne | 200/197/192 | 185/189/203 | 0/25/102 (kein Rot) |
| sichtbarer Himmel + Studio-Rig | 210/209/205 | 214/219/221 | 208/217/222 (flach) |
| **V18.504: sichtbarer Himmel + Sonne + Hemi** | 212/212/209 | 220/225/227 | 154/177/189 (kühl-neutral) |

Verhältnis Schatten : Sonne (linear, Belichtung 0,4 ohne Clipping): Rig 0,50 → Himmel + Sonne
0,16–0,21, das Maß der Realität (0,15–0,2). **Belichtung:** eine physikalische Belichtung (0,28:
18-%-Karte 126/125/119) macht die Wiese zum trüben Abend (Gras G 36 statt ~100) — die Asset-Albedos
sind mit Belichtung 1,0 im Studio geeicht; die Belichtung bleibt, die Überbelichtung ist benannt.

## V18.506 — die Albedo-Wahrheit und das Farb-Gesetz der Vegetation (01.10.)

Die Überbelichtung (18-%-Karte 212) war eine Zahl ohne Täter; drei Linsen zerlegen sie
(`werkbank albedo` · `werkbank licht` · `scripts/diag-albedo-zensus.cjs`, Karte liest 0,180):

| Albedo Y (linear) | vorher | V18.506 | Natur |
|---|---|---|---|
| Laub Eiche · Strauch · Weide · Birke | 0,42 · 0,40 · 0,48 · 0,53 | 0,16 · 0,15 · 0,21 · 0,27 | 0,06–0,16 |
| Nadel Fichte · Tanne · Mammut | 0,31 | 0,09 | 0,04–0,09 |
| Gras-Büschel (mit Samen) · Blüten-Stiel | 0,47 · 0,38 | 0,25 · 0,13 | 0,06–0,16 |
| Blüte (gelb) | 0,71 | 0,52 | 0,45–0,55 |
| Boden-Gras (Welt) · Rinde · Fell · Haut | 0,085 · 0,10–0,15 · 0,08 · 0,30 | unverändert | im Band |
| Kalkputz · Fachwerk-Holz · Fels | 0,66–0,82 · 0,30 · 0,22–0,61 | unverändert | Band bzw. hell |

Die Wurzel: das FARB-GESETZ in foundry-core (Hex = sRGB-Absicht, nach linear gerechnet) galt nur im
Kreatur-Bäcker; die Vegetation las Hex roh (r128). Seit V18.506 liest der Bäcker (`vegFarbe`) jede
Vegetations-Palette als sRGB — Labor, Welt, Karte und Fern-Fit tragen dieselben Bytes; im Golden
ändert sich nur der `color`-Puffer des Laub-Teils (Positionen, Normalen, Indizes byte-gleich). In
der Welt liest die Krone jetzt 0,11–0,12 (Eiche), 0,085 (Tanne) — im selben Band wie das Boden-Gras.

**Licht-Bilanz** (Karte über dem Kronendach, Mittag): Sonne E 7,18 waagrecht; der Himmel zählt
dreifach — Umgebung 1,89 + Hemi 0,53 + Ambient 0,16 = 2,58, das sind 0,36 der Sonne (klarer Himmel
real 0,12–0,16); Schattenseite : Sonnenseite 0,57 (real 0,35–0,4).

## V18.507 — EIN Himmel und die Belichtung aus dem Licht (01.10.)

Am Tag ist die Himmels-Umgebung der Himmel; Hemi und Ambient tragen nur noch den Nachthimmel-Boden
(0,10 · 0,04, eingeblendet mit derselben Tag-Achse wie der Nebel) — ohne sie war Mitternacht schwarz
(Helligkeit 1,8 statt 39,7), mit dem Boden bleibt die Nacht wie geeicht (40,5). Die Belichtung kommt aus
dem Licht: die Karte liest L = 0,18/π · E (Sonne auf der Waagrechten + Umgebung + Hemi + Ambient), die
Kamera legt sie auf Mittelgrau + 1 EV (ACES-Fit-Eingang 0,26227 · 2 · 0,6 = 0,3147; Deckel 1,0 hält
Nacht und Dämmerung, die schon bei ~35° Sonne wieder bei 1,0 liegen).

| Ausgabe-Pfad (Mittag, Bühne) | V18.506 | V18.507 |
|---|---|---|
| Belichtung | 1,0 | 0,616 |
| 18-%-Karte waagrecht | 212 | 173/172/164 (Mittelgrau +1 EV ≈ 165) |
| 50-%-Karte · 85-%-Karte | — · Clip | 233 · 247 (ungeclippt) |
| Licht-Bilanz E oben (Sonne · Umgebung · Hemi · Ambient) | 7,18 · 1,89 · 0,53 · 0,16 | 7,18 · 1,89 · 0 · 0 |
| Schattenseite : Sonnenseite | 0,57 | 0,52 |
| Bild (Werkbank, Mess-Wiese) | Himmel weißlich, Laub satt | Himmel blau mit Wolken, Laub satt |

**Beweis-Paket `aaa15`** (dieselbe Sonde, Licht V18.507): alle acht Schüsse stehen — zum ersten Mal
seit `aaa12` vollständig (`aaa13` brach am Haus ab, `aaa14` lief ins Zeitlimit; die Foundry-Frist
V18.505 trägt), 0 ungebaut in der Mesh-Zone, 0 Page-Errors; 57–224 dc / 73–285k Dreiecke je Schuss.
Bild gegen `aaa13`: die Kronen satt grün mit Tiefe statt pastell-minzig, Fachwerk mit Ziegel-Gefach
und Fenstern, Wolf-Fell und Wiese satt. Sichtbar offen: der Horizont auf Augenhöhe blass-grau (die
Nebel-Anker, s. u.), Birken-Laub hell-limettig (0,27), der Findling sehr hell (Fels 0,475 roh);
benannt aus jeder Sonde seit `aaa10`: je Lauf eine Impostor-Karte ohne brauchbaren Payload (wechselnde
Art: birke · weide · strauch · fichte).

Benannt, nicht geschnitten: die Umgebung allein liest 0,26 der Sonne (klarer Himmel real 0,12–0,16) —
der sichtbare Himmel (Nebel-Anker 0xa6d2ec, roh gelesen) ist hell und blass; seine Anker unter das
Farb-Gesetz zu stellen dunkelt auch die Nacht-Ferne (0x0a1326 dekodiert ≈ schwarz) und ist nicht gemessen.

## Der echte GPU-Trace (Schöpfer-Holz)

1. `npm run leuchtturm` (save-server + signaling), Welt im Browser öffnen, Holz-Profil „voll".
2. Die Wege aus `docs/abnahme-drehbuch.md` Schritte 1–5 gehen (ankommen, laufen, umsehen).
3. Im Chat `metrologie` tippen (die Zahlen-Zeile landet im Flugschreiber), dann 60 s laufen.
4. Der Flugschreiber schreibt `anazhRealmPerf.json` (save-server `/api/perf-trace`) —
   `node scripts/diag-analog-e-metrology.cjs` liest daraus steady/worst dc·tris·weltMarch.
5. Maßstab der Ziellinie: p95 ≤ 33 ms (roadmap §0.v1).

Die Metrologie-Linse ohne Browser: `node scripts/diag-analog-e-metrology.cjs [trace.json]`
(Selbst-Test: ein Trace ohne `weltMarch` ist ROT).

## V18.508 — Die Nah-Wiese und die Boden-Karte (01.10.)

Der Armlängen-Schleier hatte zwei Täter. Der erste ist die Relief-Funktion selbst (9/m-Büschel auf
1–3 m glatt). Der zweite ist der Boden: Halme auf der Gesetzes-Höhe steckten im SICHTBAREN Boden. Rot-weiße
Pfähle (10-cm-Ringe) an der Mess-Wiese −1004/−790 standen 20–30 cm tief. Die Surface-Nets-Fläche (1,8-m-Netz
+ Glättung) liegt neben `_voxelSurfaceY`: an der Mess-Wiese ±0,22 m (q05–q95, max +0,43), im Spawn-Chunk im
Median 46 cm (8 % ≤ 5 cm). Ohne Boden (Werkbank, Terrain ausgeblendet) stand der volle Halm-Teppich da.

| Schnitt | Messung |
|---|---|
| Boden-Karte = gerenderter Boden (`_bodenKarteAusMesh`: 0,45-m-Gitter aus dem fertigen Mesh, oberste nicht-steile Fläche + Grün-Kanal); der Dichte-Spalten-Zwilling (`_gridSurfaceMap` + Worker-Spiegel) fällt | Karte ↔ Mesh im Median 0,9 cm, 81 % ≤ 5 cm (Spawn-Chunk, 256 Punkte; Mess-Wiese q95 1,7 cm) |
| Streu-Stücke stehen je auf IHREM Ort (vorher alle Stücke einer 5,4-m-Zelle auf der Zellmitten-Höhe) | `gate:scatter-ab` · `gate:scatter-slice` grün |
| Nah-Wiese: Studio-Gras nach dem Studio-Gesetz im Kachel-Ring (6-m-Kacheln, L1 ≤ 5 m, bis 14 m, Rand-Band 4 m dünnt über `count`), nur wo die Boden-Funktion Wiese zeichnet | 30 Kacheln · 1099 Büschel; 2,5 ms je Kachel-Bau, eine je Takt |
| Wind: das Studio-Gras wiegt mit der EINEN Böen-Welle, der Spieler biegt die Halme; das Höhen-Gewicht liest `positionGeometry` (r184 instanziert VOR dem positionNode — `positionLocal` war bei jeder InstancedMesh die Welt-Höhe) | 1,3 s Wind: 14 434 Pixel bewegt, Spitzen-Ausschlag wenige cm |

**Die Wiesen-Linse** (`npm run lens:wiese`, Ausgabe-Pfad, Bühne; die Stelle wählt jetzt das Gesetz —
Büschel in 3×3 Kacheln × Grün × Helligkeit; die Pixel-Wertung allein wählte ein graues Geröllfeld):

| Blick | V18.503 (Funktion allein) | V18.508 (Nah-Wiese) |
|---|---|---|
| fern (1,7 m, 10 m voraus) | 96,0 · Kontrast 3,04 | 85,3 · Kontrast 9,85 — Grashügel aus Büscheln mit Rispen |
| Armlänge (1,6 m, 0,8 m voraus) | 101,5 · Kontrast 0,32 (Schleier) | 103,7 · Kontrast 10,99 — einzelne Halme scharf, Rispen |
| Bild-Last | — | 39 dc / 386k · 33 dc / 364k Dreiecke (Werkbank-Wiese: Nah-Wiese +14–22 dc, +190–350k) |

Sichtbar offen, benannt (kein neuer Eintrag — die setzt der Schöpfer): zwischen den Büscheln trägt die
Relief-Funktion (auf Knie-Höhe Moos-Polster statt Grasnarbe; eine Grasnarbe aus Halm-Patches, 320/m², wurde
gemessen und nicht übernommen: auf dem Gesetzes-Boden begraben, im Bodenton kaum lesbar — auf der Boden-Karte
nicht nachgemessen); L2
(5–14 m) zeigt breite Blatt-Fächer; Büschel werfen keine Schatten; das 0,72-m-Raster liest am Hang als
Reihe. Körper (Spieler, Tiere, Bäume) stehen weiter auf dem Gesetz — deterministisch für den Lockstep,
±0,2 m neben dem sichtbaren Boden.

## V18.509 — die Starr-Bindung der Körper (02.10., Werkbank, Holz voll, 640×360)

Die Frame-Zerlegung an der Mess-Wiese −1004/−790 (je Pass an/aus, Zeit bis `onSubmittedWorkDone`) nannte den
CPU-Täter: 5 nahe Wölfe = 421 von 474 Draws — je Wolf 35 starre Teile als eigene Meshes, jedes mit Schatten-Draws
je Kaskade. Der Ofen-Chokepoint verschmilzt Teile gleichen Materials zu EINEM starr gebundenen SkinnedMesh
(Mensch UND Tier); jede geskinnte Hülle cullt gegen ihre Körper-Kugel.

| Szene | vorher dc / Dreiecke | nachher dc / Dreiecke |
|---|---|---|
| 5 Wölfe im Blick (3–12 m) | 730 / 1 092 738 | 310 / 1 092 738 |
| dieselben 5, Blick weg | 252 / 772 424 | 127 / 372 824 |
| Wölfe am Bildrand | 537 / 989 366 | 245 / 911 706 |
| ein Mensch (isoliert) | 127 / 567 317 | 51 / 500 285 |

Kodier-Zeit des Renders (CPU, Median aus 9) 49,5 → 38,0 ms. Bild-Vergleich bei eingefrorener Zeit (isolierter Wolf,
auch mitten im Gang): 2,3 % der Wolf-Pixel über 8 Stufen gegen 2,0 % Rauschen zweier gleicher Läufe — am selben Ort
(Fell-Kanten, Kopf). Die Pose-Probe (`gate:kreatur-kosten` R) hält 0 von 252 480 Vertices eines gehenden Wolfs außerhalb
seiner Kugeln.

Benannt aus derselben Zerlegung, nicht geschnitten: der Feld-Pass (Welt-March) trug 34 % der GPU-Zeit (swiftshader) —
fast ganz in den inneren Marches von 64 gesetzten Bäumen 4–75 m vor der Kamera, die in der Mesh-Zone als Kapsel-Satz
standen, weil ihre L2-Karte noch nicht gebacken war (1 von 111 Karten nach 30 min; ein Bake dauert 0,8–4 s).

## V18.510 — die Draw-Wahrheit (02.10., Werkbank `--holz voll`, 640×360)

Der Zähler je Pass (`node scripts/werkbank.cjs zaehlen`: jeder Renderer-Draw, Region-Bundles für den Zähl-Frame neu
aufgenommen) nannte an der Mess-Wiese −1004/−790 den Täter, den das HUD nicht sah: `renderer.info` bucht im
Bundle-Replay nichts (HUD 79 dc, die GPU führte 7 770 Befehle im Hauptbild aus). 97,5 % der Befehle kamen aus 58
Region-BatchedMeshes — r184-WebGPU kennt kein Multi-Draw, der Batch gibt je INSTANZ einen `drawIndexed` aus; Geröll
kam als 16 Einzelsteine EINES Materials (16 Draws je Haufen und Pass). Jede der drei CSM-Kaskaden zeichnete alle
Werfer ihrer Box, die dritte für einen 5-%-Streifen (Band-1-Kante 367 m jenseits jeder geregelten Reichweite).

| je Frame mit Schatten-Update | vorher (V18.509) | nachher (V18.510) |
|---|---|---|
| GPU-Draw-Befehle gesamt | 29 943 | 1 091 |
| Hauptbild | 7 770 | 532 |
| je Kaskade | 7 391 (×3) | 279 (×2) |
| Dreiecke | 8,88 M | 6,90 M |
| Render-Pipelines (frische Welt, nach den ersten Bildern) | 780 | 92 |
| Vertex-Programme | 761 | 72 |
| Frame eingeschwungen (swiftshader, pixelgebunden) | 14,8 s | 13,3–13,6 s |
| Render-CPU je Frame (Median) | 23–32 ms | 11–12 ms |

Die Programm-Zahl: r184 nennt einen Puffer ohne Namen im WGSL `NodeBuffer_<id>` — jede Geometrie-Form bekam ihren
eigenen Quelltext (675 Programme, ohne Ziffern 39 Familien); die Instanz-Matrix heißt jetzt fest und lebt als
Storage-Puffer (die Kapazität steht nicht mehr im Shader). Bild bei eingefrorener Zeit und Böe (gleiches Protokoll,
frische Welt, 360 s wachsen): Boden-Blick 1,0 % der Pixel über 8 Stufen (0,02 % über 24), Weit- und Abend-Blick
3,7–3,8 % — an fernen Bäumen, deren Bau-Stand von Lauf zu Lauf streut (in beiden Ständen Kapsel-Kronen, solange die
L2-Karte fehlt: 2–5 von 112 Karten nach 8 min). Was swiftshader nicht zeigt: wie viel 28 852 gesparte Befehle und
688 gesparte Pipelines auf dem Schöpfer-Holz bringen — das misst der nächste Flugschreiber-Trace, dessen dc jetzt
die echten Draws zählt.
