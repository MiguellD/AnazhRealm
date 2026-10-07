# Bericht 0710-1 P2: die Familie HOST-VRAM am OMEN (GTX 1060)

**Urteil.**
- **Geschnitten:** Vier Commits auf `6f1aa252` senken die Host-Ziele an der Mess-Wiese von **108,8 auf 90,9 MB** (−17,9 MB, Ziel-Zensus, 1920×1080, gleiche Szene). Das Bild bleibt im Rausch-Boden, auch im Wasser und in EINER Welt mit live getauschter Tiefe.
- **Gemessen:** Die Zeit ist gleich im Rahmen der Streuung (ABAB 8/8, gpu-bank 14,88 → 15,07 ms und 13,59 → 13,88 ms, also +1–2 %, die Spannen überlappen). Band-VRAM 149,3 → 133,6 MB in 4 gegen 4 Boots.
- **Ehrlich offen:** Das Ziel „Host ≥ 25 MB unter heute“ fällt auf diesem Branch nicht. Mit der Spieler-Haut, die welle-k-haenger entfernt (5,9 MB, in h1/h2 belegt), sind es 23,8 MB, offen bleiben **1,2 MB**. Jedes verbleibende Host-Ziel hat einen Leser und das Format, das sein Leser braucht. Die Zahl und der Grund je Ziel stehen in §Offen.

## Branch

`host-vram` Kopf **884111fc** (gepusht, CI siehe §Wände). Basis `6f1aa252`, Commits:

| Commit | Schnitt |
|---|---|
| `7e6caf8a` | LINSE: der Ziel-Zensus (`werkbank ziele`, `scripts/lib/ziel-zensus.cjs`). Jede GPU-Textur mit Erzeuger, Schreiber und Leser je Pass, die Täter-Klassen des Auftrags, ein Selbsttest mit 5 eingeschmuggelten Tätern. Der VRAM-Abgriff zog nach `scripts/lib/vram-abgriff.cjs`. |
| `af7caf9e` | Die Schatten-Karte zeichnet ohne Farbe (`_kaskadenZiele`). |
| `7e5180d0` | Die Vortiefe der TRAA trägt 16 bit (`_traaVortiefe`). |
| **884111fc** | Die Leser der Szenen-Tiefe lesen ein Abbild in halber Auflösung (`_szeneTiefe`, `_tiefenAbbild`). |

## Geschnitten (Zensus GTX 1060, Mess-Wiese, 12 Frames, je ≥ 2 Boots je Seite, 0 rot)

| Ziel | vorher | nachher | Klasse | Beweis |
|---|---|---|---|---|
| `kaskade0:farbe`, `kaskade1:farbe` | 2 × r8 2048² = 8,0 MB | — | OHNE LESER (der Filter liest Farbe nur mit `shadowMap.transmitted`) | Zensus 108,8 → 100,8 MB (8 von 8 Boots), VRAM 149,5 → 141,5 MB. gate:ziel-zensus (b) zeichnet eine Kaskade ohne Farbe, Schatten-Bild im Rausch-Boden. |
| `TRAANode.history:tiefe` | depth24plus 7,91 MB | depth16unorm 3,96 MB | FORMAT (gelesen nur gegen die Schwelle 0,0005) | Zensus 100,8 → 96,8 MB (n7–n9). gate:ziel-zensus (d): Verlauf in 16 bit, Farbe der Geschichte unberührt. Ruhe und Bewegung im Rausch-Boden. |
| `szene:tiefenkopie` | depth24plus 1920×1080 7,91 MB | `szene:tiefenabbild` r32float 960×540 1,98 MB | TIEFE (eine volle Kopie, die keiner Pixel für Pixel liest) | Zensus 96,8 → 90,9 MB (k4, k5 → f3, f4). band-VRAM 139,9/140,6 → 131,9/133,8 MB. gate:post-kette (e). Bild siehe unten. |

**Bild (Ausgabe-Pfad, Uhren fest, Tiere aus):**
- **Ruhe:** 6 Blicke, je 4 Quer-Paare im Rausch-Boden, gemessen mit MSSIM und neu mit Farbton-Blöcken (16×16, Δ(R−G, B−G) > 6). Reine Luma übersah das türkise Becken.
- **Bewegung:** Drehen 4 von 4. Gehen 3 von 4: k4↔f4 0,846 gegen 0,871. Die heißesten Zellen sind dieselben wie im Rausch-Paar k4↔k5 (Halm-Kanten, Wolken).
- **Wasser:** Das Becken am Nord-Ufer ist in allen vier Boots 99/130/116. Der vec4-Weg, also der Fehler vor dem Skalar-Schnitt, gab 104/163/145.
- **EINE Welt mit live getauschter Tiefe** (Abbild, r184, Abbild, r184; je 36 Wasser-Meshes über `_tiefenLeserNeuBinden` umgehängt): drei Wasser-Blicke im Rausch-Boden, das Becken in allen vier Aufnahmen 119/146/129. Über Boots hinweg streuen die Quer-Paare am Nord-Ufer mit der Welt (0,966–0,976 bei Boden 0,988). Das sind Wolken und gestreamtes Schilf, nicht die Tiefe.

## Runde 2 — die fünf Fragen (Zahl oder Grund, Datei:Zeile am Kopf)

**1. `szene:tiefenkopie` — wer liest sie, und warum eine Kopie?** Es gibt zwei Leser des EINEN Knotens `_szeneTiefe` (anazhRealm.js:32780):
- Das Wasser (`_ensureHydroSurfaceMaterial` :32944) rechnet den optischen Weg zum Grund (:33154) und schreibt selbst Tiefe (`depthWrite` :33300).
- Der Welt-March nutzt die Szenen-Tiefe als Grenze (:35823) und schreibt seine Fragment-Tiefe (:35836).

Beide schreiben in denselben Tiefen-Anhang, den sie lesen. r184 kennt keinen nur-lesend angehängten Tiefen-Anhang, `depthReadOnly` kommt in `vendor/three.webgpu.min.js` 0-mal vor. Damit ist Lesen nur über eine Kopie im Pass-Bruch möglich.
- **Hinter das Pass-Ende legen:** Das geht nicht. Das Wasser blendet in die Szenen-Farbe, und der March komponiert per Tiefentest. Beide brauchen den Anhang.
- **Aufgelöste Tiefe:** Ohne MSAA gibt es keine.

Pixel für Pixel braucht die Kopie aber keiner. **Schnitt:** ein Abbild in halber Auflösung, je Texel die fernste Tiefe seiner 2×2 Pixel (`_tiefenAbbild` :32812), gezogen in r184s eigenem Pass-Bruch. **−5,93 MB.**

Die Lehre am Weg: Der Knoten einer r32float-Farbtextur liefert vec4. Roh weitergereicht rechnete das Wasser vec4, Beer-Lambert weitete `vec3(wK)` mit 1,0 auf, und das Becken wurde türkis. Die Leser bekommen deshalb `.x`. gate:post-kette (e) hält das jetzt fest: Wasser über hellem Grund, Abbild gegen r184s Viewport-Tiefe, der vec4-Weg landet etwa 130 daneben. Die Bühnen-Ebene der Wand trug bis heute die falsche Wicklung (der Stoff zeichnet BackSide), ihr Wasser zeichnete nie ein Pixel.

**2. TRAA `history:tiefe`.** r184 liest die Vortiefe wirklich:
- `vendor/TRAANode.js:537` `samplePreviousDepth`
- `:669` die Vortiefe an der Geschichts-UV
- `:675` `isDisocclusion` gegen `depthThreshold` 0,0005 (`:95`)

Die Geschwindigkeit je Pixel kommt nur aus der Kamera, freigelegte Kanten erkennt allein die Vortiefe. Ein Ping-Pong mit der Szenen-Tiefe spart nichts, zwei Tiefen bleiben zwei. **Schnitt:** depth16unorm über einen Vollbild-Zug statt Kopie (`_traaVortiefe` :89778). Eine Stufe ist 1,5e-5, also 33-fach unter der Schwelle. **−3,95 MB.**

**3. Farb-Formate.** Die Kette hat diese Reihenfolge:
- Szene (`output`, PassNode)
- TRAA (`new THREE.TRAANode` :89891)
- Ausgabe-Fragment mit den Taps für Bloom, Godrays und Kontrast (:89980ff)
- ACES + sRGB im Ausgabe-Quad (:90062, `renderer.toneMapping` :87128)

Alle drei Farb-Ziele (`output`, `TRAANode.history`, `TRAANode.resolve`) liegen damit VOR dem Tonemapping, keines dahinter. rgba8 hinter dem Tonemap verlangte, TRAA hinter den Tonemap zu legen. Dann trüge die Geschichte 8 bit, und bei 5 % Mindestgewicht des aktuellen Frames (`vendor/TRAANode.js:686`) bliebe sie bis ±10 Stufen neben dem wahren Wert stehen: 5 % von < 10 Stufen sind < ½ Stufe. Bloom und Godrays tasten zudem HDR vor dem Tonemap. **0 MB**, alle drei bleiben rgba16float.

**4. Niederfrequente Effekte.** Bloom, Godrays und die Nachbild-Stufen haben **kein eigenes Ziel**, sie sind Taps im Ausgabe-Fragment (anazhRealm.js:89980ff, Godrays :90012ff, hinter ihrer Stärke). Der Zensus nennt kein Ziel für sie. **0 MB** zu schneiden.

**5. `buf:szene` 34,6 / 40,6 bimodal.** Den Modus entscheidet die Spieler-Haut, 5,94–5,99 MB. Hochgeladen hat sie der Avatar-Warm-Compile `_warmCompilePipeline(group, false)` (anazhRealm.js:49836): `compileAsync` lädt auch die unsichtbare Geometrie (den Kopf in der Ich-Sicht) hoch, und r184 hält jedes Attribut in `memoryMap`. welle-k-haenger entfernt alle `_warmCompilePipeline`-Aufrufe. In den haenger-Boots h1/h2 hat der Spieler 0 MB (2 von 2). Dort ist der Mechanismus belegt. Ich schneide ihn hier nicht, weil es die Konflikt-Zone ist.

## Gemessen

- **Zensus je Stand** (MB = MiB, wie `werkbank band`): Basis 29 Texturen 108,8 → Kaskaden 27 / 100,8 → Vortiefe 27 / 96,8 → Abbild **27 / 90,9**.
- **Zeit** (ABABABAB, das EINE Instrument `omen-messfolge.cjs` aus mess-kmw 9f50dc1d, A = Basis mess-d `78d66a63`, B = Kopf `884111fc`; Rohdaten `p2/abab2`, Auswertung `abab2/auswertung.md`, deren Spalte „B“ trägt fest den alten Namen 9f50dc1d, gemessen ist 884111fc):
  - Serie: 8 von 8 Slots GRÜN. Drei Boots wurden verworfen und wiederholt, je Regen beim Namen: 1A durch `_tickWorldRules`, 2B und 3A durch `_loopNexusUpdate`. Beide Seiten haben keinen Wetter-Halt.
  - gpu-bank Gier 0: **14,88 → 15,07 ms** (+0,20, +1 %; A 13,26–15,06, B 14,83–15,27, ohne 5A mit 85 Tier-Befehlen +0,09).
  - gpu-bank Gier −0,88: **13,59 → 13,88 ms** (+0,29, +2 %).
  - Band-GPU: 16,16 → 16,25 ms.
  - Band-VRAM: **149,3 → 133,6 MB** (−15,7, 4/4 gegen 4/4 ohne Überlappung: A 148,5–149,7, B 132,0–135,3).
  - Frame p50 frei: 16,7 / 16,8 ms. Unter Regler voll ist die CPU gebunden, und die Tier-Lage streut (B 16,7–24,9 im 120-Hz-Raster).
  - Die zwei neuen Vollbild-Züge (Abbild bei halber Auflösung, Vortiefe) kosten also höchstens 0,1–0,3 ms GPU. Unter der Streuung von n = 4 ist das nicht von 0 zu trennen.
  - Die erste Serie (B = `af7caf9e`, nur der Kaskaden-Schnitt) gab 15,27 → 14,90 und 13,62 → 14,59 ms.
- **Kaskaden-Auflösung nach Bedarf:** Die Karten-Größe folgt schon dem Texel-Gesetz `SCHATTEN_KASKADE.texelM` [0,17; 0,47] m (anazhRealm.js:90553, `_kaskadenKarten`).
  - k0: 328 m Diagonale / 0,17 = 1929 Texel, also 2048.
  - k1: 859 m / 0,47 = 1828 Texel, also 2048.
  - Beide liegen knapp unter der nächsten Zweierpotenz. k1 auf 1024 gäbe 0,84 m je Texel, und das verwarf schon Prüfer W7 (04.10.).
  - An der Wiese gemessen (`p2/kaskade-dichte.cjs`, eingeschwungen, Fenster 1920×1080, 75°), Texel an der langen Achse gegen den Fuß eines Leinwand-Pixels an der fernen Kante:
    - k0: Box 317,9 × 140,9 m, also 0,155 × 0,069 m je Texel, Bereich 0,1–112,8 m, Pixel bei 112,8 m 0,16 m.
    - k1: Box 836,1 × 253,4 m, also 0,408 × 0,124 m je Texel, Bereich 103,3–306 m, Pixel 0,147–0,435 m.
  - Jede Karte trifft den Pixel nur an ihrer fernen Kante, näher ist sie gröber als er. Es gibt nichts Überabgetastetes, **0 MB**.

## Offen (Zahl und Grund)

Rest gegen das 25-MB-Ziel: **7,1 MB** auf diesem Branch, **1,2 MB** nach dem Merge mit welle-k-haenger. Was am Kopf steht (90,9 MB):

| Ziel | MB | warum es steht |
|---|---|---|
| `output`, `TRAANode.history`, `TRAANode.resolve` | 3 × 15,82 | HDR vor dem Tonemap (Frage 3). TRAA liest die Szene in der Nachbarschaft, also kann es nicht in sie schreiben. Ein Ping-Pong von Geschichte und Auflösung spart nur die Kopie, keine Textur. |
| `depth` (PassNode) | 7,91 | Tiefentest der Szene, Quelle für TRAA, Vortiefe und Abbild. depth16 bricht bei near 0,1 m und far 1000 m. |
| `kaskade0:tiefe`, `kaskade1:tiefe` | 2 × 8,00 | depth16, Größe nach Texel-Gesetz (oben) |
| `TRAANode.history:tiefe` | 3,96 | depth16 (Frage 2) |
| `szene:tiefenabbild` | 1,98 | r16float verlöre 0,000244 absolut. Bei near 0,1 m fiele jede Tiefe jenseits von etwa 200 m zusammen. |
| Karten (`wege-karte` 2 × 2,0, `feld-pass-panorama` 1,88, `welt-march-*` 0,75, Atlanten 4,67, `rausch-atlas` 0,75, `kronen-streu` 0,5, PMREM-Farbe 0,66) | 13,2 | Jede mit Leser im Zensus. Der g-Kanal der Wege-Karte trägt die Äcker (:65600), an der Wiese leer, in Siedlungen nicht. Die rgba32float-Listen verlören in 16 bit bis 100 %. |
| `PMREM.cubeUv:tiefe` (r184 intern) | 2 × 0,16 | Tiefe ohne Leser im r184-PMREMGenerator: die einzige Täter-Klasse, die noch steht, unter 0,5 MB. Ein Schnitt hieße, den Vendor-Ziel-Bau zu flicken. |

## Wände

Lokal am Kopf, seriell, Ports 7900/7905–7909 (`p2/waende-voll.sh`). Grün sind:
- format:check, lint (0 Fehler, dieselben 3 Warnungen wie an der Basis), check, profiband (H3: 20 Textur-Erzeuger benannt)
- page-error, fenster-wechsel, feld-stellvertreter, schatten-takt, schatten-werfer, fluss, godray, luft-sicht, himmel-tag
- gpu-lens, analog-nah, post-kette (mit dem neuen Wasser-A/B), ziel-zensus, kamera-treue, look-lens, look-golden, playtest:fast

Das sind 21 Schritte. Der volle playtest ist grün („Alle Invarianten OK“). Sein erster Lauf fiel an „DER HÜPFER“ ohne Scheitel-Werte („Scheitel ? / ? m“), heute zweimal gesehen, jede Wiederholung grün. Das ist eine flackernde Messung des Sprungs und berührt keines der Ziele.

Die Wand zog zwei Fehler im Abbild-Commit ans Licht, beide im selben Commit behoben:
- eslint kannte `GPUCommandEncoder` nicht.
- gate:profiband H3 wollte die 1×1-Attrappe als benannte Variable.

**CI** am Kopf, Lauf 37646473869:
- Der check-Job ist grün.
- Der playtest-Job fiel in Schritt 32 `gate:sicht-arbeit`, und die Schritte 33–81 liefen nicht mehr. Dieselbe Wand fiel in der CI auch an der Basis `6f1aa252` (integ-probe), an `af7caf9e` war sie grün. Lokal ist sie am Kopf grün (Dreh-Treue 758 geprüft, 0 Löcher). Sie flackert also in der CI und hängt nicht an diesem Branch. Das CI-Log selbst kann ich ohne Anmeldung nicht lesen (403).
- Die 40 CI-Schritte hinter 32, die nicht schon in der Wand-Liste oben stehen, fuhr ich lokal (`p2/waende-rest.sh`), Ergebnis **40 von 40 grün** (`0710-1-p2/waende-rest.log`).
- Damit ist jeder CI-Schritt am Kopf grün belegt: die Schritte 1–31 und der check-Job in der CI, Schritt 32 und die Schritte 33–81 lokal.

**Rohdaten** in `bericht/0710-1-p2/`:
- beide Zeit-Auswertungen
- die Zensus-Tabellen Kopf/Abbild
- die Kaskaden-Dichte
- die Wand-Logs
- `bild-vergleiche.txt` (alle MSSIM- und Farbton-Tabellen, die Becken-Farben)
- `vergleich.cjs` mit der Farb-Spalte

Bilder, Boot-Logs und JSONs liegen auf dem OMEN unter `Desktop/AnazhRealm-OMEN/p2`.

## Konflikte (git merge-tree, Kopf gegen die Wellen)

- **welle-k-haenger** (`0febe3ef`):
  - `anazhRealm.js` führt konfliktfrei zusammen.
  - `scripts/werkbank.cjs` hat 2 Textstellen: beide Seiten hängen an derselben Stelle einen `require` und ein `page.evaluate(…_INSTALL)` an. Auflösung: beide behalten.
  - Semantisch: haenger entfernt `_warmCompilePipeline` (Frage 5), die Spieler-Haut fällt dort. Er berührt den `_passSicht`-Kommentar 7 Zeilen nach `_kaskadenZiele`, mein Schnitt im `_kaskadenZiele`-Körper bleibt eindeutig.
- **welle-k-diaet-bundles** (`dbc7271f`):
  - `anazhRealm.js` führt konfliktfrei zusammen, `_configureRenderer` ist von mir unberührt.
  - `.github/workflows/check.yml` hat 1 Textstelle: beide fügen CI-Schritte an derselben Stelle an. Auflösung: beide behalten.
- **main** (`839adf07`): 0 Konflikte.

## Lehren (für die Linsen)

- Ein Knoten auf einer Farbtextur liefert vec4. Wer eine Tiefe als Farbe trägt, reicht `.x` weiter, sonst promoviert TSL jede Folge-Rechnung.
- `QuadMesh` steht nicht im globalen `THREE` der Seite (`vendor/three-bootstrap.js:88`). Ein Vollbild-Zug ist dort eine eigene Szene mit Ortho-Kamera.
- Bild-Vergleiche brauchen eine Farb-Spalte neben der Luma, und eine Tiefen-Frage gehört in EINE Welt mit live getauschter Quelle. Über Boots hinweg streut das Wasser mit Wolken und Streaming.
- Eine Wand mit einem Stoff braucht die Wicklung, die der Stoff zeichnet (BackSide).
