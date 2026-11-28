# GTX 1050 — Stand beim Sichern 28.11. (ZWISCHENSTAND)

Gerät GTX 1050 (Richter-Gerät, kein Preis). Läuft nichts mehr von mir; nur die CI-Probe-Jobs der Köpfe.

## 1. Nachlauf am main bbb97563, pm 6e48112d (trägt e20826e1), ohne Akte — EINE Sitzung

Strom `SITZUNG Fahrt 1363.2 s (Soll ≤ 1800 s) · 2 Proben · Grundstellung 1×`; die Welt stand nach 21.1 s.

- **platten#1** (Welt davor 57 s, 987 Takte, 81 Chunks), wörtlich:
  „OFFEN karte2.planet.geologie.platten#1 · Wirt-Wache: die Arbeit der Probe läuft noch: /bild (Rufer tot seit 33.4 s) — kein Urteil, UNGEMESSEN (die Probe sah: S1 saaten 30 gegen Soll ≥ 30 ✓ · achseP30 4,386 gegen Soll ≥ 4 ✓ · guertelProzent 74,287 % gegen Soll ≥ 70 % ✓ · auge: Pose {px 0, py 1800, pz 2600, lx 0, ly 0, lz -2600} …“
  → saaten 30 bestätigt (die 23 kamen vom gerissenen Deckel). Ungemessen nur, weil `/bild` hing.
- **gebirge#1** wörtlich:
  „OFFEN karte2.planet.geologie.gebirge#1 · Wirt-Wache: die Arbeit der Probe läuft noch: /bild (Rufer tot seit 33.4 s) — kein Urteil, UNGEMESSEN (die Probe sah: S1 verformtProzent ungemessen gegen Soll ≥ 80 % ✗ · kratonProzent ungemessen gegen Soll ≤ 20 % ✗ · auge: Pose Ego 45 m über dem Spawn vor der nächsten Felswand …“
  → Kein Wurf mehr (8c0ec40d greift), aber auch KEINE Zeile „Leser fehlt: …felsEinfall…“: die Probe starb vorher an `/bild`. Reise: 2600 m (Ring 4 → -1).
- **boden#1** (Grundstellung 10.9 s, Welt davor 45.6 s, 829 Takte, 81 Chunks) wörtlich:
  „OFFEN karte2.planet.relief.boden#1 · der Deckel der Leiter riss nach 62,054 s, ehe afcProzent, anteilJeKorpus der Sprosse stand — kein Urteil, UNGEMESSEN … Täter: @@PUNKTE@@ PROBE 330.8 s · Exit 0“
  → Keine „Stille“ mehr (e20826e1 greift), Reise 10 272 m (Ring 4 → -1).
- **`gerendert` im Strom:** KEINE Zeile mit `gerendert` im Sitzungs-Strom (`grep gerendert` leer). Der Beweis, dass `/bild` den Zähler hebt, steht damit AUS. Die zwei Proben gebirge/platten starben genau an `/bild` (Rufer tot seit 33.4 s).
- Strom-Nachrede: gebirge#1 ließ 12 window-Felder stehen, boden#1 ließ 10 stehen (beide: `__rafferEnde · __rafferKurz · __ortZeit · __weltaktSpionBuch · __wetterSpionBuch · __buehneUhr · __imSchuss · __nahSpeicher · __letzteSpiegel`, dazu `__geoStich · __mundLagen · __abbruchEpoche` bzw. `__letzteTeilung`); dazu getauschte Glieder `r._bildZeit`, `r._wolkenZeit`, `r._gameLoopTick`, `r._loopFixedStep`, `r._setWeather`, `r._tickNahWiese`, `r._ruheImBild` → an die Bahn.

Vorher (04:30, pm 41bacbce): gebirge warf nach 49,031 s „G.felsEinfall is not a function“; platten saaten 23 (Deckel 327 s, Stille 134 s).

## 2. Nacht-Kopf (erleben.bild.nacht#2) — WIP, ohne Anspruch

Kopf **origin/nacht-fuell 603db3dc** (WIP [skip ci], auf main bbb97563): Laterne 2983 K, Rückwurf (Liu & Jordan, ρ = luma ATMO_BODEN), von Kries CAT02 (`FARB_ANPASSUNG`), Glocke (umkreisM 2000 / nachM 50), Halm-Narbe im Pool.

**Gras-Täter (f):** `stamm/stoff-material.js` `_lichtPoolTerm` (`_lichtPlatz` und `_lichtKarteTerm`): der Pool beleuchtete den Halm ohne seine Narbe. Der Schnitt dämpft jedes direkte Licht mit `phyto halmNarbe(...).direkt` (Λ = uv.y; die Zeile `const narbe = …` in `_leuchtStoff`). Die Durchlass-Hälfte (`laubDurchlass`) im Pool fehlt noch.

**Drei Stände, gleiche Pose 8** (Dorf Ego, Uhr 0,92, feste Kamera; vn3, 05:04–05:53):

| | vor (main) | ohne Narbe | nach (Kopf) |
|---|---|---|---|
| Bild sRGB | 0,401 · 0,220 · 0,116 | 0,306 · 0,295 · 0,308 | 0,265 · 0,256 · 0,283 |
| Flamme-Anteil (Ton 15–55°) | 0,547 | 0,004 | 0,001 |
| Luma Mittel / p95 | 0,251 / 0,612 | 0,298 / 0,785 | 0,260 / 0,664 |
| schwarz (v ≤ 0,02) | 0,274 | 0,074 | 0,054 |

Bilder: `2811-sichern-gtx1050/pose8-vor.png`, `pose8-ohne-narbe.png`, `pose8-nach.png`.

**Gepaarte Zahlen vor ↔ nach** (paar2):
- Gasse dev 2,41 → 1,98. Das Soll ≤ 0,5 ist ROT.
- p10 0,000816 → 0,001909 (+1,23 EV); p25 0,00532 → 0,00962 (+0,85 EV).
- Null-Pixel 12 568 → 9 028.
- Nacht-p95 66,86 ↔ 66,86 ms.

**Offen:**
- (c) schwarze Bewohner: in allen drei Ständen schwarze Silhouetten. Täter NICHT benannt. Befund: die nahen Leiber sind `leibSichtbar false`; gezeichnet wird der Satz `bewohner-satz` (pool true, em true, emissiveNode ≠ userData.__em). These, ungemessen: der Klon des Satz-Stoffs (`stoff-gang.js` `_gangSatz` :115–120) trägt den Pool-Term nicht.
- Die Masken GRAS/LEUTE der Sonde blieben leer (`auge8.js` meldet Exit 1, die Ausblende-Schüsse unterschieden sich nicht). Das Bildpaar oben trägt.
- Vor der Abgabe stehen noch aus: die Gates fachwerk-contract · atlas (grün am Kopf) · lint · prettier · statik; dann EIN Vorprüf-Commit mit `[gpu-probe: gate:studio-begehen, gate:tag-achse:echt]`. Golden: die Kelvin-Zeilen von laterne und wandlaterne sind auf die recipes von main gesetzt, der Hash = sha256 ohne Zeilenende.

## 3. Früher heute (gemeldet)
- boden#1 @efeabeda: Deckel 316 s gerissen, Stille seit 148.8 s, 10 272 m.
- extreme#2: GRÜN (dauerTage 6,9, amplitudeK 6,517).
- bewohner-Paar: ohne Maß (gebucht).
