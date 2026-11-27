# gezeiten-2 — Stand-Blatt (oberster Abschnitt = jüngster Stand)

## 27.11. 00:20 — Letzter Stand nach dem Wartezimmer (ZWISCHENSTAND)

- **Ergebnis des Wartezimmers:** 4 h ohne Post (20:20–00:20).
  - Briefkasten `cloud-post/gezeiten-2.md` unverändert (Blob 9d51a59).
  - Kein `probe-post/gezeiten-2/`.
  - Kein Stempel in main.
- **Vorprüf-Kopf:** `36fc4266` (auf main 45bad33): „Vorprüfung gezeiten-2 1 … Hub 0 → 3,45 m, Periode ungemessen → 12,353 h am
  geladenen Chunk“. Gegen den heutigen main 38194f8 ist er konfliktfrei (`git merge-tree`, Überlapp nur `spec/stamm/modul-karte.json`).
  Dieser Blatt-Commit darüber trägt nur das Blatt `[skip ci]`; der Kopf zum Stempeln ist `36fc4266`.
- **Geschnitten:** Das Meer des gezeichneten Sheets trägt den Hub der Uhr (`aMeer` + Uniform `gezeit`). Körper und Bild lesen
  denselben Hub (`_gezeitHubBild`).
- **Gemessen:**
  - Leib am geladenen Chunk: Hub 0 → 3,450 m, Periode ungemessen → 12,353 h.
  - Linse KÖRPER: am main ROT (99 von 100 neben dem Gesetz), am Kopf 0 von 100.
- **Offen** (jeweils mit Grund und Messname):
  - Neubau je Stufe (`markiert`).
  - S1 der fremden Saaten (Station: die Lage ohne Uhr und Hydrosphäre, Kandidat ungebaut).
  - Watt-Bild ungemessen.
  - `probe-tag`: zug.sh fehlt im Container.
- **Beanspruchte Sprosse:** `karte2.planet.wasser.gezeiten#1`. Karte 2 gebucht 131 von 1 718. Status ZWISCHENSTAND.

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
  `waterLevel`. Der Kandidat dafür ist NICHT gebaut. Die Messung liegt in `cloud-post/gezeiten-2-station/taeter-zahl.cjs` (Teil „12
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

**Täter-Zahl** (`cloud-post/gezeiten-2-station/taeter-zahl.cjs`, Null-Renderer, Station `GEZEIT_AN` Heimat wörtlich, Küste x 0 /
z 10 430–10 830, Messpunkt z 10 830):

| Lage | Chunk am Messpunkt | hubM | periodeH | Spiegel über 25 h |
|---|---|---|---|---|
| Küste fern vom Spieler | nein | 3,450 | 12,353 | −3 … −4,75 … −1,3 (das Gesetz) |
| Spieler an der Küste (Ring 25 Chunks) | ja | **0,000** | **ungemessen** | **−3 an allen 25 Stunden** |

Das ist der Wortlaut am Gerät („Hub 0 m … Spiegel -3 m“). Das Gesetz schwingt an derselben Stelle 3,45 m.

**Der Schnitt (entschieden):** das Meer im gezeichneten Sheet wird eine Funktion der Uhr — die Vertices des Meers liegen in Ruhe-Höhe und
tragen das Gewicht `aMeer` (aus dem Gesetz: `atlasSpiegel` meldet, ob das Meer den Spiegel trägt); das Bild (Uniform des Hubs im Wasser-
Stoff) und der Körper (`_wasserNetzHoehe`) addieren denselben Hub der Stufe aus `_gezeitGilt`. EIN Leser, kein zweiter Rechen-Weg.
