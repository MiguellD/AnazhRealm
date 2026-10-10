# Bericht 0910-4: das Genesis-Band — die Passage zeichnet nur im Blick und schläft außerhalb des Graphen, der Rest ist S3 tor

Auftrag: `auftrag/0910-4-omen-genesis-band.md`.
Kopf: **welle-m-genesis-band ee39087f** (per `git ls-remote`), ab main 7dd944e6, zwei Commits (fd3a0dff, ee39087f). CI: Lauf 38021693010 auf ee39087f, 5 von 5 grün.

## In drei Sätzen

**Geschnitten:**
- Die Portal-Membran trägt eine Hülle um die Amplitude ihrer Welle, das Culling bleibt an. Der Nebel-Kasten genauso.
- Die schlafende Passage (jenseits 180 m) verlässt mit ihrem Nebel den Graphen, und der EINE Kehraus nimmt ihre Puffer.

**Gemessen:**
- Blick weg vom Ring: Membranen 8 → 0, Nebel 7 → 0, das Hauptbild 1,24 → 1,11 M Dreiecke.
- Genesis-Band in je 2 frischen Boots: main 266 Befehle / 2 490k / 156,9 MB, Kopf 259 / 2 425k / 156,1 MB.
- An der Wiese hält die Passage 1,98 → 0 MB.

**Ehrlich offen:** Der Mehrbetrag von Genesis ist die Tor-L0 (32,2 MB, S3 tor). Darin stecken 5,0 MB doppelt hochgeladene
Drachentor-Geometrie. Die Wurzel liegt in den Kernen: Porta, Fahrzeug und Schmiede melden 16 Gestalten bei reserviertem
Seed.

## Teil 1: die Portal-Membran zeichnet ohne Blick

**Wurzel:**
- Die Welle (`positionNode = (x, y, d0)`) verschiebt jede Ecke NUR in z.
- |d0| ≤ der Amplitude des Gesetzes: `zFace · (aktivDepth[0] + aktivDepth[1]) · (waveDepthK[0] + waveDepthK[1] · wave)`,
  denn h ist auf ±1 geklemmt.
- Das Gesetz kennt sie also. `frustumCulled = false` war nie nötig.

**Schnitt** (`_membranGeometryFor`, `AnazhRealm._membranAmplitude`): Die geteilte Geometrie je Gestalt trägt die Amplitude
in ihrer Hülle (geisttor ±1,12 · drachentor ±1,22 · verkalkt ±0,90 · maschine ±0,88 · kathedrale ±1,50 · maurentor
±0,84 · ruine ±0,89 m). Das Culling bleibt an. Der Nebel-Kasten verformt nichts, seine Hülle ist exakt.

**Werkbank** (GTX 1060, Genesis, `werkbank zaehlen`):

| Blick | main | Kopf |
|---|---|---|
| 70 m vor dem Ring, vom Ring weg: Membran / Nebel | 8 / 129 600 Dreiecke · 7 | **0 · 0** |
| dasselbe, Hauptbild | 101 Befehle · 1 240 839 Dreiecke | 86 · 1 111 155 |
| Ring-Mitte nach −x: Membran / Nebel | 8 / 129 600 · 7 | 5 / 81 000 · 4 |
| dasselbe, Hauptbild | 132 · 1 366 004 | 127 · 1 320 885 |

**Bild-Paar am Ring** (Instrument fest: TRAA-Phase, Himmels- und Knoten-Uhr, Membran-Zeit 1000 und act 0,6):
- **In EINER Welt** (Kopf, Culling aus ↔ an), gegen das Rauschen zweier gleicher Aufnahmen:
  - Ring Δ>0 1,414 % gegen 1,407 %;
  - Geisttor 0,99 % gegen 0,99–21 %.
- **Die Membran im Blick ist unverändert.** Über zwei Sitzungen (main ↔ Kopf) liegt die Helligkeit auf ±0,7; die
  Unterschiede am Geisttor (Δ>8 4,7 %) sitzen in den Baumschatten des Bodens, also im Weltzustand.
- Dateien: `ring-*`, `geist-*`, `maschine-*.jpg`, `geist-eine-{aus,an}-1.jpg`.

**Linse: `gate:portal-membran` Stufe B**
- **Aufbau:**
  - echter Frame, WebGPU auf swiftshader, am Ring;
  - gezählt wird, was der Renderer nach dem Culling zeichnet;
  - die Wand hat jetzt einen CI-Schritt in Gruppe 1 (lokal 23 s, CI 0,2–0,3 min); das Job-Log kann ich nicht lesen, die Dauer
    passt zu lokal.
- **Vorher main ROT, 3 Verletzungen beim Namen:**
  - B1: 7 von 7 Membranen zeichnen aus der Mitte;
  - B2: 70 m vor dem Ring zeichnen 14 Täter, „portal-membran ruine (79 m) · … · portal-nebel maurentor (81 m)“;
  - B3: keine Hülle.
- **Kopf GRÜN:** B1 4 von 7, B2 0 Befehle, B3 trägt die Amplitude. Der Selbsttest mit `frustumCulled = false` nennt 7 von 7.

## Teil 2: buf:szene an Genesis zerlegt

**Werkbank, EINE Welt** (`werkbank band`, Szenen-Puffer je Klasse):

| Klasse | Genesis | Wiese |
|---|---|---|
| **buf:szene** | **59,22 MB** | **33,43 MB** |
| Tor-L0 (drachentor 8,67 · maurentor 5,49 · verkalkt 5,15 · maschine 4,77 · kathedrale 3,57 · ruine 2,73 · geisttor 1,80) | **32,18** | 0 |
| bodenSatz | 13,99 | 13,99 |
| bauSatz · formationenSatz · streuSatz · wasserSatz | 3,48 · 1,17 · 0,71 · 0,23 | 5,50 · 0,83 · 2,42 · 0,54 |
| portal-membran | 1,98 | 1,98 (schlafend) |
| f:gt:L0 (Vorschau Wagen) | 0,97 | 0 |
| Bäume (L0/L1, Karten) | 3,18 | 6,97 |

Wer trägt den Unterschied:
- **Die Tor-L0, ganz.** +32,2 MB nur an Genesis, an der Wiese freigegeben. Das schneidet S3 tor. Die Tor-Kerne habe ich
  nicht angefasst.
- **Darin doppelt hochgeladen:** Das Ring-Tor `welt_strom` (Gestalt 7) und die Vorschau `tor_drachentor` (Gestalt 15)
  tragen in 13 von 13 Teilen byte-gleiche Geometrie. Das sind 5,01 MB CPU / 4,34 MB GPU und 13 Befehle doppelt
  (`f:drachentor:L0` 208 Puffer gegen 104 je Tor).
  - **Die Wurzel steht im Kern:** Porta reserviert den Seed. `buildInstance(id, 7) == buildInstance(id, 12345)` ist
    byte-gleich und in den Goldens cv:4 eingefroren. Trotzdem meldet der Kern `GESTALTEN_JE_REZEPT = 16`.
  - Die Foundry baut Drachentor, Geisttor und Maurentor in den Gestalten 1, 2, 3, 7, 8, 9, 15 und 16 byte-gleich
    (`gestalten-probe.txt`). Der Wirt schlüsselt den Körper nach Gestalt und lädt jede gezogene Gestalt neu hoch.
  - Dasselbe Muster tragen der Fahrzeug- und der Schmiede-Kern (beide Seed reserviert, beide 16). In der offenen Welt
    sind das bis zu 16 Kopien je Rezept.
  - **Das ist ein S3-Posten:** Die Gestalten-Zahl gehört nach dem Vertrag dem Gesetzbuch (`docs/studio-vertrag.md` B2c).
- **Sätze:** keine Kapazität über Inhalt von Gewicht.
  - Der Boden ist an beiden Orten gleich (13,99 MB) und zu 77 % (Vertices) / 90 % (Indizes) gefüllt; der Bau, die Streu
    und das Wasser sind klein.
  - Den Boden trägt die Wiese genauso, er erklärt den Genesis-Mehrbetrag nicht.
- **Vorschauen:** Sie werden an der Wiese freigegeben (f:gt, bau:esse, die Werkstätten welt_*, f:drachentor: 0). Die Ausnahme war die Passage, sie bleibt
  im Graphen: **geschnitten.**

**Schnitt** (`_tickPortalMembranes`, Fern-Schlaf):
- **Vorher:** Der Fern-Schlaf setzte nur `visible = false`. Der Kehraus lässt, was ein Objekt des Graphen trägt, also blieben
  1,98 MB `szene:portal-membran` an der Wiese, 1 000 m vom Ring.
- **Jetzt:** Die schlafende Passage verlässt mit ihrem Nebel den Graphen und kehrt beim Erwachen zurück. Stoff und Pipeline
  stehen weiter, `gate:erstarren` (c) prüft kein Neubau, schlafend außerhalb, wach darin.

Werkbank, dieselbe Welt:

| Ort | `szene:portal-membran` |
|---|---|
| Genesis | 0,85 MB in 9 Puffern (mit dem Culling aus Teil 1 lädt eine Membran im Rücken ihre Gestalt-Geometrie nie hoch; vorher 1,98) |
| Wiese | **0** (alle 8 außerhalb des Graphen; buf:szene 30,21 MB) |
| zurück an Genesis | alle 8 wieder im Graphen, 5 Membranen und 4 Nebel zeichnen, 0,85 MB wieder hochgeladen; Bild `geist-kopf-erwacht.jpg` |

## Teil 3: das Genesis-Band, main ↔ Kopf

- Je Seite 2 frische Boots, A B A B, die Messfolge `--ort genesis`. Alle 4 GESTELLT, `tex:r184-ausgabe` 0.
- Das Instrument ist der Kopf, die Seiten-Wache steht vor jedem Boot.
- Gemessen auf fd3a0dff (Teil 1). Teil 2 ändert Genesis nicht, nur die Orte fern des Rings.

| | 1A main | 3A main | 2B Kopf | 4B Kopf |
|---|---|---|---|---|
| Befehle | 266 | 266 | 259 | 259 |
| Dreiecke | 2 490k | 2 490k | 2 425k | 2 425k |
| VRAM MB | 156,9 | 157,0 | 156,1 | 156,1 |
| buf:szene MB | 64,0 | 64,0 | 63,2 | 63,1 |
| einzelstuecke (Befehle · Dreiecke) | 26 · 154k (Membran 8, Nebel 7) | 26 · 154k | 19 · 89k (Membran 4, Nebel 4) | 19 · 89k |
| bau (Tor-L0) | 181 · 1 827k | 181 · 1 827k | 181 · 1 827k | 181 · 1 827k |
| GPU ms/Frame | 22,7 | 21,83 | 21,48 | 21,88 |

Das Band bleibt an Genesis ROT. Der Grund ist `bau` mit 181 Befehlen und 1 827k Dreiecken gegen ein Soll von 40 / 60k,
also die Tor-L0: S3.

## Wände

| Wand | Urteil |
|---|---|
| gate:portal-membran (Null-Renderer + Stufe B) | Kopf GRÜN (23 s), main ROT 3; CI-Schritt Gruppe 1 |
| gate:erstarren (c) Schlaf außerhalb des Graphen | GRÜN (26 s) |
| npm run check | GRÜN |
| lint | 0 Fehler |
| CI | Lauf 38021693010 auf ee39087f: 5 von 5 grün (check 2,5 · erst-zeichnung 8,4 · playtest 1/3 21,4 · 2/3 18,4 · 3/3 18,8 min; Portal-Membran 0,3 min); fd3a0dff: Lauf 38013116492 5 von 5 |

Rohdaten: `bericht/0910-4/` (Zählungen, Gates vorher/nachher, Puffer, Band, Sätze, Gestalten-Probe, `serie/`, Bilder, Werkzeuge).

## Offen (mit Grund und Zahl)

- **S3 tor:** die Tor-L0 an Genesis 32,2 MB und `bau` 181 Befehle / 1 827k Dreiecke. Darin die doppelte Drachentor-Gestalt
  (4,34 MB GPU, 13 Befehle).
- **S3, die Kerne:** Porta, Fahrzeug und Schmiede melden 16 Gestalten bei reserviertem Seed, die Welt lädt byte-gleiche
  Körper je Gestalt.
- **Die Tor-Instanzgruppen zeichnen ohne Blick:**
  - Blick vom Ring weg: im Hauptbild noch 86 Befehle / 1,11 M Dreiecke, fast alle Tor-L0 hinter der Kamera.
  - Die globalen Instanz-Gruppen tragen keine Hülle (`frustumCulled = false`, „welt-verteilte Instanzen“).
  - Das ist die Klasse der Membran, im Feld von S3 tor. Ich habe sie nicht geschnitten.
- **`gate:erstarren`** steht in keinem CI-Schritt. Die Familie waende-ci baut die Deckung um.
