# Bericht Schluss-ABAB 14.10. — Bündel integ-probe 51cc19af gegen main 9fb869a5

**Status: ZWISCHENSTAND.**

**Urteil (OMEN, GTX, Regler voll, Auto-Dorf aus, 2 Boots je Seite, 2σ gepoolt):** Das Bündel ist an allen vier Orten ×
Sichten auf der GPU und im Frame **nicht langsamer**, sondern deutlich schneller. Es hält das Profi-Band in Frame p95,
Befehlen, Dreiecken und VRAM. Es reißt das Band nur im **CPU-Takt p95: 6,0–7,8 ms gegen ≤ 5,8**. Main reißt es dort an
drei von vier Orten ebenso (6,0–7,4).
- **GPU:** gpu-bank −2,5 / −1,2 ms (Wiese Ego), −4,5 / −2,9 ms (Wiese Third). Band-GPU −4,4 / −4,9 / −8,2 / −5,4 ms.
- **Frame p95:** an Genesis 25,1 → 16,7 / 16,8 ms (die VSync-Stufe fällt). An der Wiese gleich, 16,8.
- **fps:** Wiese 79 → 99 und 67 → 96, Genesis 52 → 100 und 56 → 80.
- **VRAM:** −18 / −24 / −20 / −28 MB. Dreiecke −0,10 / −0,30 / −0,20 / −0,37 M, Befehle +14 / +13 / +5 / +11.
- **CPU-Takt p95 voll:** +0,6 (Wiese Ego, in 2σ), +0,5 (Wiese Third, 2σ 0,2: LANGSAMER), +0,3 (Genesis Ego, in 2σ),
  +0,4 ms (Genesis Third, 2σ 0,3: LANGSAMER).

## Das Profi-Band absolut (B = 51cc19af; in Klammern main)

| Ort × Sicht | Frame p95 ≤ 33 | Befehle ≤ 208 | Dreiecke ≤ 680k | VRAM ≤ 118 MB | CPU-Takt p95 ≤ 5,8 |
|---|---|---|---|---|---|
| Wiese Ego | 16,7 ✓ (16,8) | 75 ✓ (61) | 285 840 ✓ (388 352) | 94,7 ✓ (112,9) | **6,0 ✗** (5,4 ✓) |
| Wiese Third | 16,8 ✓ (16,8) | 85 ✓ (72) | 323 149 ✓ (627 058) | 95,9 ✓ (119,5 ✗) | **6,5 ✗** (6,0 ✗) |
| Genesis Ego | 16,7 ✓ (25,1) | 157 ✓ (152) | 462 175 ✓ (658 182) | 98,7 ✓ (118,9 ✗) | **6,8 ✗** (6,5 ✗) |
| Genesis Third | 16,8 ✓ (25,1) | 191 ✓ (180) | 586 548 ✓ (953 199 ✗) | 104,2 ✓ (131,7 ✗) | **7,8 ✗** (7,4 ✗) |

- B bleibt am Rand der Render-Ziele unter dem Haushalt von 60 MB. Main reißt ihn an jedem Ort mit 71,4 MB (TRAANode
  history 19,8 + resolve 15,8).
- Die GPU-Ersparnis trägt zum Teil die TAAU mit `szeneSkala` 0,75.

## Je Ort × Sicht (Mittel je Seite, Werte je Boot in `auswertung-*.md`)

| Ort × Sicht | gpu-bank (Gier 0 · −0,88) A → B | Band-GPU A → B | Takt Bank A / B MHz | CPU p95 voll · frei A → B |
|---|---|---|---|---|
| Wiese Ego | 10,50 · 10,37 → 8,04 · 9,18 | 14,52 → 10,14 | 1 727 / 1 730 | 5,4 · 5,7 → 6,0 · 6,3 |
| Wiese Third | 13,23 · 11,99 → 8,74 · 9,10 | 15,55 → 10,68 | 1 730 / 1 692 (in 2σ) | 6,0 · 5,5 → 6,5 · 7,2 |
| Genesis Ego | (keine Bank im Genesis-Lauf) | 18,48 → 10,32 | – | 6,5 → 6,8 |
| Genesis Third | – | 17,19 → 11,80 | – | 7,4 → 7,8 |

**Drossel** (nvidia-smi je Boot, Start und Ende): in allen 16 Boots 0x0 oder 0x1 (GpuIdle), nie Leistung oder Hitze.
79–83 °C am Boot-Ende, beide Seiten.

## Der CPU-Term je Frame (Profil der Wiese, Ego + Third, 4 Boots je Seite, µs je Frame statt je Sekunde)

B zeichnet 30–45 % mehr Frames je Sekunde. Darum je Frame normiert (`profil-diff.cjs … gesamt|selbst`).
- **Inklusiv:** Der Render-Objekt-Pfad (`_renderObjectDirect` → `renderObject`) kostet 3,41 → 4,00 ms je Frame (+0,60 ms).
  Das deckt das Δ des CPU-Takts p95 (+0,5 bis +0,6).
  - Die TAAU (`updateBefore` 25c.js) ersetzt TRAANode.updateBefore: 3,32 → 3,91 ms inklusive, darin die Szene.
- **Selbstzeit, die größten Δ je Frame:**

  | Posten | Δ je Frame |
  |---|---|
  | `_projectObject` | +97 µs |
  | Gelände-Kern K16 (`talgrund` +110, `flaeche` +53) gegen die gefallene Wildnis (`wildnisY` −76, `noise2D` −88, `ankerBeitrag` −52) | netto −53 µs |
  | `_kaskadenWerferOben` | +54 µs |
  | `updateNode` | +51 µs (`updateForRender` −51) |
  | `_blockerUmPlatz` | +47 µs |
  | `_fassade` (meine Instanz-Fassade, je Zugriff ein Abgleich der Attribute) | +37 µs |
  | `_tickRadiatingAffordances` | −83 µs (K54 hält) |

- **Benannt, nicht geschnitten:** der Render-Objekt-Pfad je Befehl (+13 Befehle) und `_fassade` (ein Versions-Stempel
  statt Abgleich je Zugriff).

## Ein Linsen-Fehler, gefunden und am selben Tag geschnitten

- **Befund:** Die Band-Linse meldete auf B eine L0-Stufe in der Ferne: `f:tanne:L0` bis 1 075 m an der Wiese,
  `f:fichte:L0` und `fscatter:geroell:L0` bis 91–93 m an Genesis.
  - 1 075 m ist genau der Abstand Kamera −278/−1038 → Ursprung. 91–93 m ist die Kamerahöhe über 0/0.
  - Jede Zeichner-Klasse stand im Nah-Zweig des Draw-Zählers am Ursprung. Der Zweig las `object.instanceMatrix`, und
    der Zeichner (1410-1) trägt keine.
- **Schnitt:** welle-m-e-instanz **d6e4b259** [ci voll]. Der Zähler liest Matrizen, Zahl und Einträge der Senke.
- **Gleicher Blick nachher:** fichte L1 86, tanne L1 51, mammut L1 88, fichte L0 41 m (Wand 64), die Stufen-Wand ohne Rot.
- gate:profiband, ziel-zensus und kamera-treue lokal grün. CI 38558937383 läuft (Nachtrag folgt).
- Die Bilder waren nie betroffen, nur die Linse. Auf main ist `fscatter:geroell:L0` bis 71 m (Wiese Third) echt.

## Orte und Instrument

- **Instrument:** omen-messfolge aus 51cc19af, zwei Kopien (`abab-i551a` A, `abab-i551b` B). Lokal gepatcht in
  `spec/profiband/haushalt.json` (`ort-patch-*.diff`):
  - Wiese = der Eintrag aus mess-wiese 54c78ff3 (K55): −278/−1038, Blick −z, beide Seiten gleich.
  - Genesis = die Ring-Mitte jeder Seite: main 36/0, B 0/0, Blick −10/0. So wie abgestimmt, denn der Anker
    `_genesisMitte` hält den Ort.
- **Seiten-Wache** vor und nach jedem Boot: nie rot. Spielstand vor jedem Boot beiseite. A1 B1 A2 B2 je Kombi, 60 s Pause.
- **GPU-Schloss:** Während der Boots lief keine andere Last.
- **Band-Urteile:** Rot war jeder Boot nur am Band-Urteil. Die Ratschen sind die GTX-Ratschen von V18.545 am alten
  Wiesen-Ort, das ist kein Neulauf-Grund. Neu zu prägen sind sie im nächsten Schritt.
- **Rohdaten** `bericht/1410-schluss/`: 16 Boot-JSONs, `auswertung-*.md`, `profil-wiese-*.md`, `band-fix/`, `serie.sh`,
  `auswertung.cjs`, `profil-diff.cjs`.

## Pflicht-OFFEN Rest

- **E (Profi-Band):**
  - Der CPU-Takt p95 reißt das Band an allen vier Orten (6,0–7,8 > 5,8), main ebenso an dreien.
  - Der größte benannte Posten ist der Render-Objekt-Pfad (+0,6 ms je Frame).
  - Frame, Befehle, Dreiecke und VRAM halten.

## Status ZWISCHENSTAND + Übergabe

- **Code:** welle-m-e-instanz d6e4b259 (Draw-Zähler-Nachzug), CI 38558937383 läuft (Nachtrag folgt).
- **Messbäume:** `abab-z545` (A), `abab-p551` (B 51cc19af), `abab-i551a`/`abab-i551b` (Instrument, Orte lokal gepatcht;
  `i551b` trägt den gefixten Draw-Zähler lokal).
- **Weiter, wenn Budget bleibt:** die GTX-Ratschen auf den Kopf neu prägen (Wiese neu, Genesis, Dorf; Ego und Third),
  als Zweig mit Commit.
