# Abnahme Analog (Pflicht A–E)

> Die Frozen-Liste (`docs/PFLICHT-OFFEN.md`) setzt fünf Einträge: A Kreaturen · B Bäume ·
> C Architektur + Streu · D Wiese · E das Beweis-Paket. Hier steht je Klasse die Code-Wahrheit,
> darunter die Messung (Bild-Paare + Zahlen, dieselbe Sonde). **Stand 30.09. (V18.494):
> gemessen — die Wette wartet auf die Entscheidung des Schöpfers und einen echten GPU-Trace.**

## Die Sonde

`node scripts/diag-beweis-e.cjs --tag <name> [--klassen kreatur,baum,haus,wiese] [--proto-min 45]`

- Echter Renderer (WebGPU über swiftshader-Vulkan), RT-Readback wie `diag-blick` — **der
  Null-Renderer des Gates ist für den ganzen Analog-Pfad blind** (Feld-Fit, Slots, March kehren
  headless früh zurück).
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
über EINE Feld-Liste; Dedup je Vorlage im `kapselCache` (`_weltKapselHolen`/`_weltKapselSpawn`),
Bake-Takt `_weltBakeErlaubt` (16/s, 4/s über Budget). Voxel-Bricks nur noch als Region-Fern-Cache
(`dimRegion`); jeder andere Brick-Weg ist fail-closed (`_weltFeldSpawn("arch:…"|"baum:…")` → null).
Primitive-Kodierung (2 Texel je Primitiv, `pA.w`/`pB.w`):

| Art | pA.w | pB.w |
|---|---|---|
| Kapsel | r ≥ 0 | Farbe ≥ 0 |
| Kegel | r0 ≥ 0 | −(Farbe + (r1+1)/10) |
| Box / Ellipsoid / Prisma | −(c+1) | 0 / 1 / 2·3 |

- **A Kreaturen:** `_tickKreaturZiegel` → `_kreaturGliederBacken` → `_gliedKapselFit` (Kapsel je
  Glied, Dedup Gattung×Glied); je Frame reist die Knochen-Matrix in die Liste
  (`_weltFeldMatrix`). Das Mesh ist unsichtbar (`KREATUR_ZIEGEL_DIST = 0`, kein Rückweg).
- **B Bäume:** Streu-Zellen-LOD ≥ 1 → `_baumFeldSpawn` (Schlüssel `abaum:preset:variant`, ohne
  Stufe → kein Churn), LOD 0 bleibt Instanz-Geometrie (Anfassen/Fällen). Fit `_baumKapselFit` →
  mit Beipack `_baumGrammatikFit` (Ketten-Kegel Stamm + Hauptäste, Kronen-Lappen aus den
  Zweig-Punkten), ohne Beipack AABB-Kapseln.
- **C Architektur + Streu:** `_archZiegelFern` — Häuser über `_archFachwerkFit` (Balken, Gefach,
  Verbände, Prisma-Dach, Gaube/Flügel; ≤ 24 Primitive), gesetzte Studio-Dinge über
  `_archFoundryZiegel` (Foundry-Flat; Bäume teilen Schlüssel + Fit mit der Streu), sonst
  `_archBoxFit` (≤ 24 AABB). Hand-Blase (16 m): Mesh als unsichtbarer Interaktions-Körper, Häuser
  sichtbar. Klein-Streu LOD ≥ 1: `_streuGesetzSpawn` — ein Gesetz-Block je 64-m-Kachel, der March
  tract die Plätze (`einheit < 0`). Band 0 bleibt Mesh (Anfassen).
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

## Was die Messung an Fehlern fand (geheilt in V18.494)

1. **Gesetzte Studio-Dinge blieben unsichtbar** (Eiche, Tor, Fahrzeug …): der Feld-Fit baute ein
   Async-Mesh temporär, sah es leer, gab nach 8 Versuchen auf — 26 von 28 Weltgen-Bauten mit
   Versuchen waren ausgebrannt. Jetzt Fit aus der Foundry-Flat (`_archFoundryZiegel`).
2. **Bake-Takte verhungerten** in Listen-Reihenfolge: eine frisch gesetzte Eiche auf Platz 98 von
   100 bekam in 150 Takten keinen Versuch. Jetzt nah zuerst, ferne nach Distanz.
3. **Der Baum-Fit war nicht maßtreu:** 5 Stücke desselben Stamms, Krone 5× zu klein und schwebend.
   Jetzt Ketten-Kegel (Stamm + Hauptäste) + Kronen-Lappen aus den Zweig-Punkten.

Stehende Linse: `node scripts/diag-arch-feld.cjs` (Eiche + Haus bekommen ihren Feld-Slot,
0 ausgebrannte Foundry-Bauten, die Eiche teilt den Kapsel-Satz der Streu).

## Das Urteil (ehrlich, für die Entscheidung)

- **Kosten:** Analog senkt die Dreiecke je Bild um 7–46× (Median ~15×), die Draw-Calls um
  2,6–8× — genau das Versprechen der Wende.
- **Nähe:** auf Armlänge und bis ~20 m ist jede Analog-Klasse sichtbar gröber als das Studio-Mesh:
  Tiere sind Kapsel-Figuren, Kronen sind massive Körper (ein luftiges Blätterdach lässt sich mit
  gefüllten Ellipsoiden nicht darstellen — aus der Nähe wird es eine Wand), Häuser dunkle Boxen,
  die Wiese hat keine Halme mehr.
- **Offen, nur im echten Browser entscheidbar:** ob die Stufen-Übergabe beim echten Laufen nahe
  Bäume rechtzeitig als Mesh zeigt (die Sonde teleportiert — Zellen-Stufen können veraltet sein),
  und die FPS auf dem Schöpfer-Holz (letzter Trace 14.07., 4–12 FPS, vor der Wende).

**Die zwei Wege:** (a) Analog überall, wie am 21.07. entschieden — billig, nah grob; (b) HYBRID:
nah das Studio-Mesh (wie schon bei der Streu-Stufe 0 und bei Häusern in der Hand-Blase), fern die
Analog-Silhouette — die Kosten-Ersparnis bleibt dort, wo sie am größten ist.

## Der echte GPU-Trace (Schöpfer-Holz)

1. `npm run leuchtturm` (save-server + signaling), Welt im Browser öffnen, Holz-Profil „voll".
2. Die Wege aus `docs/abnahme-drehbuch.md` Schritte 1–5 gehen (ankommen, laufen, umsehen).
3. Im Chat `metrologie` tippen (die Zahlen-Zeile landet im Flugschreiber), dann 60 s laufen.
4. Der Flugschreiber schreibt `anazhRealmPerf.json` (save-server `/api/perf-trace`) —
   `node scripts/diag-analog-e-metrology.cjs` liest daraus steady/worst dc·tris·weltMarch.
5. Maßstab der Ziellinie: p95 ≤ 33 ms (roadmap §0.v1).

Die Metrologie-Linse ohne Browser: `node scripts/diag-analog-e-metrology.cjs [trace.json]`
(Selbst-Test: ein Trace ohne `weltMarch` ist ROT).
