# BERICHT: der Preis des Orts (ZWISCHENSTAND)

## Schnitt 1 — VRAM (Zweig w28-preis-ort, Kopf 9fba231b, Basis main ffb005db)

**Geschnitten** (Datei:Zeile am Kopf):
- 1.0 Der Zähler nennt jeden Puffer: `scripts/werkbank.cjs:2616` (`/puffer` liest `__pufferZensus()` VOR `__vramBericht`) · die Akte führt
  jeden Posten ab 0,25 MB und den Rest als EINE Zeile (`meisterkarte-quelle/punkte/punkte.cjs` `POSTEN_MIN_MB`, `postenListe`; Zweig
  koordination). Linse (a): `scripts/lib/band-urteil.cjs` `PUFFER_OHNE_NAMEN_MB` — `buf:?` ab 0,25 MB ist ROT `unbenannt`, Selbsttest S7b
  in `scripts/diag-profiband.cjs` (Mutante „Liste vor Zensus“ 32,4 MB → ROT, 0,1 MB still), 42/42 GRÜN.
- 1.1 Kaskaden auf den Bedarf ihres Gesetzes, auf 16 gerastert: `stamm/bild-schatten.js:1110` (`_kaskadenKarten`, `karteRaster` 16 in
  `SCHATTEN_KASKADE`); k0 1024 → 992, k1 2048 → 1904, k2 2048 → 1840. `gate:schatten-werfer` K5 urteilt die kleinste Seite im Raster.
- 1.2 Feld-Panorama rgba16float (Float16Array, die CPU-Werte bleiben Float32): `stamm/bild-sicht.js:1670`.
- 1.3 Punkt-Schatten depth16 (`WurfSchatten.setupRenderTarget`): `stamm/bild-schatten.js:438`.
- 1.4 (Normale, Farbe) Das Eck-Format der EINEN Pipe: `stamm/studio-gestalt.js:390` `_eckForm` / `_eckDicht` (Normale snorm8 × 4, Farbe
  half × 4), gerufen in `_foundryBuildMesh` (:217), der Haut-Verschmelzung `stamm/koerper-leib.js:1115` und der Kamm-Krone
  `stamm/gelaende-fern.js:837`; der Bau-Satz liest dicht (`stamm/siedlung-satz.js:467`). Haut und Tuch (`seh` haut · stoff) tragen die
  Normale weiter in Float32: das Tuch-Gesetz liest sie dicht (koerper-core `_tuchBind`), three `computeVertexNormals` summiert beim
  Drapieren in das Attribut. Linse (b): `gate:asset-contract` Eck-Wand (E) — 252 Gestalten, 0 Täter, Mutante „Pipe in Float32“ ROT
  beim Namen der Art; der Gate fährt mit `--js-float16array` (Node 22 der CI).

**Gemessen** (Radeon 890M, Preis-Lauf der Karte 2 an der Pose `vegetation.K2#1`, je eine frische Sitzung; Akten
`vision/richter/leben.pflanzen.kraft.1.{ffb005db,9fba231b}-radeon.json`):

| Größe | main ffb005db | Kopf 9fba231b | Δ | Preis |
|---|---|---|---|---|
| VRAM nach zwei GC | 132,8 MB | **124,9 MB** | −7,9 | ≤ 118 — ROT |
| VRAM live (Spitze im Fenster) | 140,3 | 127,5 | −12,8 | |
| Heap nach GC | 371,9 | 369,2 | −2,7 | ≤ 400 |
| Heap live | 417,9 | 411,7 | −6,2 | ≤ 400 — ROT |
| Typed-Arrays (Halter-Zensus) | 129,8 | 120,9 | −8,9 | |
| Bild p95 | 58,33 ms (f 1,298) | 58,68 ms (f 1,389) | — | ungemessen unter Last (f außerhalb der Ruhe) |
| größtes Bild | 125,6 ms | 150,6 ms | — | dito (Schnitt 3) |
| `buf:?` | 30,86 MB | 0 | | Linse (a) |

Posten des Kopfs nach GC (Auszug): Geometrie-Arena 9,19 · Boden-Satz 4,32 · Fuchs 2,31 · Wolf 2,22 · Wesen 2,06 · Spieler 2,00 ·
Kamm-Krone 1,62 · Fern-Ring 1,27 · Bau-Satz 1,23 · Formationen 0,78 — Puffer zusammen ≈ 27,0 (main 30,86 ohne Namen); Kaskaden 1,88 +
6,92 + 6,46 (main 2,0 + 8 + 8); Panorama 0,94 (1,88); Punkt-Schatten 0,75 (1,5). Texturen −4,4 MB, Puffer −3,9 MB.

**Die Annahme fällt nicht:** 124,9 MB > 118, es fehlen 6,9 MB. Ursachen: (1) die Puffer gaben −3,9 statt der gerechneten −5,4 MB
für Normale und Farbe (der Rest der Gestalt-Ecken liegt in Lage, Stempel und verschränkter Ecke); (2) 1.4 Stempel, verschränkte Ecke und
`skinIndex`, 1.3 Anlage beim ersten Wurf und 1.5 Licht-Karte BC5 sind nicht gebaut (siehe ehrlich offen).

**Bildpaare** (`artifacts/profiband/auge/w28-preis-ort/`, oben main, unten Kopf): siehe Nachtrag unten.
Headless vorab (swiftshader, Werk-Blick, gleiche Bühne): eiche 7 Pixel über 8 Stufen von 930 240 (max 19), gt 216 Pixel (max 84, Glanz-
Lichter des Lacks) — nicht schlechter.

**Ehrlich offen:**
- 1.4 Stempel je Gestalt (`aLodLevel`·`aH0`·`aH0L`): r184 kennt für ein Attribut der Größe 1 keine Halb- oder 8-Bit-Form (`BC`-Tafel des
  Vendors), je Gestalt hieße Uniform je Objekt oder Instanz-Schritt — die Arena und die Fassade (`_lodInstanceFacade`) teilen die
  Puffer der Quelle; ungebaut.
- 1.4 `skinIndex` u8: r184 weitet jedes nicht normierte 8/16-Bit-Attribut beim Anlegen auf 32 Bit (`createAttribute`: Uint16 → Uint32)
  — ohne Vendor-Eingriff nicht erreichbar; der Schnitt fällt aus der Tafel.
- 1.4 verschränkte Ecke 24 → 12 B: ungebaut (der Stoff `_jahrLage` liest die Mitte als Lage).
- 1.3 Anlage beim ersten Wurf: ungebaut (das Wachsen zerstört die gebundene Würfel-Tiefe sofort, `RenderTarget.setSize` → `dispose`;
  die Klasse „Destroyed texture [PointShadowDepthTexture]“, speicher-welten.js:3396) — Linse (c) entfällt mit ihr.
- 1.5 Licht-Karte in zwei BC5: ungebaut (Kodierer der Ablage).
- Bild p95 und größtes Bild beider Läufe stehen unter Last (f 1,30 / 1,39: die GPU war im Wechsel mit zwei Befund-Arbeitern und dem
  CI-echt-Job belegt) — kein Urteil.
- Keine Band-Ratsche bewegt: der Kopf liegt über der Ratsche vom 14.10. (112,5 MB), nach unten fällt nichts.
