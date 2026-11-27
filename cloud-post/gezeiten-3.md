# gezeiten-3 — Stand-Blatt (oberster Abschnitt = jüngster Stand; darunter die Geschichte der Bahn gezeiten-2)

## 27.11. 14:35 Wartezimmer zu — der Kopf 0078a6e2 steht in main, der Vor-Richter liest GRÜN (ZWISCHENSTAND)

Sprosse `karte2.planet.wasser.gezeiten#1`. Karte 2 gebucht 149 von 1 718 (Stand des Briefs; die Buchung setzt der Koordinator).

- **Gelandet in main:** „Abgabe w28-gezeiten-3“ 494538d über integ-probe, Versions-Stufe V18.546.452 (3008a66).
- **CI:** Code-Check 0078a6e2 success; GPU-Probe omen-gtx1060 GRÜN in 1 945 s (pruefbuehne-licht 55 s · weltbild-frost:echt
  166 s · studio-begehen 264 s · webgl-probe 54 s). Das lokale ROT „S0 Himmel“ war swiftshader, byte-gleich am main.
- **Vor-Richter GTX 1050, 13:10** (Post an gezeiten-3 im Zweig `koordination`): GRÜN mit dem Kandidaten — periodeH 12,353 gegen
  12,42 ± 2 %, Akte planet.wasser.gezeiten.1.b1fda1e4-gtx1050.json; 12:35 UNGEMESSEN durch den Wrapper in `stamm/bild-kosten.js`
  (rauch-nan, nicht dieser Kopf). Der Kandidat trägt; die Station im Zweig `punkte-maschine` nimmt ihn nur der Koordinator.
- **Offen** wie unten: dieselbe Klasse der Stations-Uhr (Zeilen 3829 … 6285, Linse Wand LÄNGE), der Preis der Nähe
  (`_gezeitMarke`, Messname `markiert`), das Watt-Bild ungemessen, `probe-tag` (zug.sh fehlt im Container).
- Kein GELANDET/ENDE im Briefkasten bis 14:35; das Wartezimmer schloss nach 4 h.

## 27.11. Vorprüfung gezeiten-3 1 — die Gezeit im Export, die Täter-Zahl des Vor-Richters (ZWISCHENSTAND)

Sprosse `karte2.planet.wasser.gezeiten#1`. Karte 2 gebucht 149 von 1 718.

- **Post:** 22:50 (Vor-Richter GTX 1050 ROT S1 am Kopf 2), 22:53 (Auftrag) und 10:32 (Start-Brief gezeiten-3) gelesen. Die frühere
  Wache sah sie nicht: `git fetch origin koordination:…` scheiterte „non-fast-forward“ (ohne `+`) und las den Stand 26.11. 21:34.
  Die Korrektur 10:42 gelesen: der Briefkasten kommt seither über die rohe Adresse (curl), nie mehr per Fetch des Zweigs.
- **Die rote Zeile gilt am main eef726c7** (unter der Tag-Länge der Bühne, s. Täter-Zahl).
- **Täter-Zahl** (`cloud-post/gezeiten-3-station/station-faecher.cjs`: `GEZEIT_AN` und die Maße wörtlich aus der Station
  geschnitten, 12 Saaten × 25 h + Heimat × 25 h, Null-Renderer). Die Station liegt im Zweig `punkte-maschine` unter
  meisterkarte-quelle/punkte/stationen/k2-planet.js (e1dfdc4).
  - Kopf 2, Tag 60 min: hubM 3,450 · periodeH 12,353 (die Heimat allein; 11 fremde Küsten je 0 m).
  - Kopf 2, Tag 10¹² min (die Bühne, `scripts/lib/ausgabe-aufnahme.cjs:394`): hubM 0 · periodeH ungemessen · Watt 0 · Uhr 25 — der
    Satz des Vor-Richters wörtlich. Die Gezeit läuft in Kalender-Zeit (`_gezeitStunde` → `_kalenderZeit`), die Station schiebt die
    Welt-Uhr um `normS / 24` (Zeile 3780 der Station) — unter der Bühne 10⁻¹¹ Stunden des Tags der Welt.
- **Geschnitten:** gelaende-core `wasserSpiegel` trägt die Gezeit der Lage (`gezeitHub`, derselbe Term wie `atlasSpiegel`); die
  Ufer-Bänder lesen denselben Export in Ruhe (`uferSpiegel` = `wasserSpiegel(lageRuhe(L))` in Wirt `_waterLevelAt` und Faden
  `waterLevelAt`, byte-gleich wie vorher); `lageZurStunde(L, t)` gibt einer Lage ohne Uhr den Träger.
- **Stations-Kandidat** (`cloud-post/gezeiten-3-station/kandidat.diff` + `BEGRUENDUNG.txt`): Zeilen 3777/3778 die fremden Küsten
  lesen den Export zur Stunde, Zeile 3780 die Stunde der Heimat ist 1/24 des Tags DER WELT (`tagS`). Nachher, Tag 60 min UND Tag
  10¹² min: hubM 3,450 · periodeH 12,353 (−0,54 %) · benetztDiff 10 · 12 von 12 Küsten. Die Liste der Stationen am Kopf: Fehler 2 =
  die Basis (gelaende.K2#1/#2, Wand HAKEN).
- **Offen:** dieselbe Klasse (Welt-Uhr in Standard-Stunden) in der Station des Zweigs `punkte-maschine` an den Zeilen 3829 (S3),
  4693, 5120, 5176, 5521, 5962, 6016, 6226, 6285; die Linse dazu wäre die Wand LÄNGE der Stations-Maschine (`toteLaengen`). Der Preis
  der Nähe (`markiert`) ist der Kopf danach. Watt-Bild ungemessen. `probe-tag`: zug.sh fehlt im Container.

## 26.11. 20:15 — Vorprüf-Kopf 1 (ZWISCHENSTAND)

Sprosse `karte2.planet.wasser.gezeiten#1`. Karte 2 gebucht 131 von 1 718.

**Geschnitten (EIN Leser):**
- Das Meer im gezeichneten Sheet ist eine Funktion der Uhr. Sein Vertex liegt in der Ruhe-Höhe und trägt das Gewicht `aMeer`. Woher
  es kommt: gelaende-core `spiegelZurStufe` meldet `aus.meer`, wo das Meer samt Hub den Spiegel trägt (additiv, alle anderen Rufer
  byte-gleich). Gebaut in Main `_computeWaterSheetData` und Faden `buildWaterSheetGeometry`, byte-gleich.
- Bild und Körper heben das Meer um DENSELBEN Hub der Stufe aus `_gezeitGilt` (`_gezeitHubBild`):
  - das Bild über die Uniform `gezeit` im Wasser-Stoff, geschrieben im `_pegelTakt`;
  - der Körper über `_wasserBildAt` → `_wasserNetzHoehe(…, hub)`.
- Die Kachel der Nah-Streu fällt, wenn die Stufe wechselt und ihre Netze Meer tragen. Kein Schalter, kein zweiter Rechen-Weg.

**Gemessen** (Leser des Spiels `_koerperWasser`, Station `GEZEIT_AN` Heimat wörtlich, `taeter-zahl.cjs`, Küste x 0 / z 10 830, 25 h):

| Lage | vorher (main 4a188bf2) | nachher |
|---|---|---|
| Spieler an der Küste (Chunk geladen, 25 Chunks) | Hub 0,000 m · Periode ungemessen · Spiegel −3 an 25 h | Hub **3,450 m** · Periode **12,353 h** · benetztDiff 5 · Spiegel = Gesetz an 25 von 25 h |
| Küste fern (kein Chunk) | 3,450 m · 12,353 h | 3,450 m · 12,353 h (unverändert) |

Die Linse `gate:worker-dichte --gezeit` hat eine neue Familie KÖRPER. Sie stellt den Spieler an das Meer-Ende des Watt-Profils
(0|10 830), baut den Ring und liest 100 Viertelstunden ohne Neubau.
- Am main liest sie ROT: Hub 0,00 m, 99 von 100 neben dem Gesetz.
- Mit dem Schnitt liest sie GRÜN: Hub 3,50 m, 0 von 100.
- Selbsttest „der Körper ohne Hub“ (`_gezeitHubBild` 0) → KÖRPER beim Namen ROT. Der ganze Lauf `--gezeit --selftest` dauert 68 s.

**Die 12 Küsten des Fächers (ehrlich):** Die Station liest die Saaten 1–12 mit `G.wasserSpiegel` an einer Lage aus `lageAus`. Diese Lage
hat keine Uhr und keine Hydrosphäre. Dort steht der Spiegel = `waterLevel`, vorher wie nachher Hub 0 (11 Küsten, Saat 8 ohne Küste).
Auch der Kandidat `atlasSpiegel` mit Träger liest 0, denn ohne Hydrosphäre trägt keine Zelle Meer. `wasserSpiegel` ist der zeitlose
Bezug der Ufer-Bänder (die Linse LAND bewacht genau das). Der Leser des Spiels läuft im Fächer nur an der Heimat. `hubM` (Max) und
`periodeH` (Median der Küsten mit Hub) liest die Station deshalb aus der Heimat: 3,45 m und 12,353 h, im Band 12,42 ± 2 %.

**Offen:**
- Preis der Nähe: `_gezeitMarke` baut je Stufe jeden Meer-Chunk neu. Für die Höhe ist das jetzt unnötig (die Uniform hebt), für die
  Ausdehnung am Watt nicht. Messname `markiert` (gate:worker-dichte `--gezeit`, Ring-Takte).
- Station `planet.wasser.gezeiten` S1: die fremden Saaten brauchen ihre Hydrosphäre und den Träger, sonst misst der Fächer dort nur
  `waterLevel`. Der Kandidat dafür ist NICHT gebaut. Die Messung liegt in `cloud-post/gezeiten-3-station/taeter-zahl.cjs` (Teil „12
  Küsten“).
- Das Bild des trockenfallenden Watts: `ungemessen`, nur die Radeon schießt es.
- `zug.sh probe-tag` liegt in diesem Container nicht. `artifacts/profiband/werkzeug/*` ist nicht verfolgt (`.gitignore`). Der Ruf folgt
  dem Brief: vier Tore, je ≤ 480 s nach `spec/ci/ci-zeiten.json` (43 · 135 · 185 · 79 s).

## 26.11. 19:45 — Täter-Zahl (ZWISCHENSTAND, vor dem Schnitt)

Sprosse `karte2.planet.wasser.gezeiten#1`. Karte 2 gebucht 131 von 1 718.

**Heimholung geklärt:** der Zweig `origin/gezeiten` (2f1c74c9) ist NICHT verloren — er landete im Bündel `buendel-jagd` (5551bf64, Vorfahr
von main 4a188bf2): `GEZEIT` (M2 + S2), `gezeitStufe`, der Träger `_gezeitGilt`, die Marke `_gezeitMarke`, `_pegelTakt`, das Watt
(`hydroWatt`), `landSpiegel`, der Fern-Ring je Stufe. Der Kopf der Station (99649186) trägt ihn schon. Es gibt nichts heimzuholen; die
Lücke ist der Leser.

**Die Wurzel (gelesen):** `_koerperWasser` → `_koerperWasserSpiegel` (stamm/wasser-hydro.js) liest, wo ein Chunk geladen ist, das
GEZEICHNETE Sheet (`_wasserBildAt` → `_wasserNetz` → `_wasserNetzHoehe`, stamm/wasser-zellen.js), nie das Gesetz. Das Sheet trägt die
Stufe der Gezeit seines BAUS; `_pegelTakt` markiert die Chunks nur schmutzig. Am Gerät baut die Sitzung um den Spieler — die Küste der
Station steht im gezeichneten Ring, der Spiegel steht. Der Null-Renderer des Vorgängers (`heim-messung.cjs`) maß 3,45 m nur, weil die Küste
dort 10 km vom Spieler ungeladen war und der Leser aufs Gesetz fiel.

**Täter-Zahl** (`cloud-post/gezeiten-3-station/taeter-zahl.cjs`, Null-Renderer, Station `GEZEIT_AN` Heimat wörtlich, Küste x 0 /
z 10 430–10 830, Messpunkt z 10 830):

| Lage | Chunk am Messpunkt | hubM | periodeH | Spiegel über 25 h |
|---|---|---|---|---|
| Küste fern vom Spieler | nein | 3,450 | 12,353 | −3 … −4,75 … −1,3 (das Gesetz) |
| Spieler an der Küste (Ring 25 Chunks) | ja | **0,000** | **ungemessen** | **−3 an allen 25 Stunden** |

Das ist der Wortlaut am Gerät („Hub 0 m … Spiegel -3 m“). Das Gesetz schwingt an derselben Stelle 3,45 m.

**Der Schnitt (entschieden):** das Meer im gezeichneten Sheet wird eine Funktion der Uhr — die Vertices des Meers liegen in Ruhe-Höhe und
tragen das Gewicht `aMeer` (aus dem Gesetz: `atlasSpiegel` meldet, ob das Meer den Spiegel trägt); das Bild (Uniform des Hubs im Wasser-
Stoff) und der Körper (`_wasserNetzHoehe`) addieren denselben Hub der Stufe aus `_gezeitGilt`. EIN Leser, kein zweiter Rechen-Weg.
