# gezeiten 1 — Vorprüfung (ZWISCHENSTAND)

Zweig `gezeiten`, Sprossen `karte2.planet.wasser.gezeiten#1` und `#2` (Zensus Rang 6 „Nordsee-Watt“). Diese Abgabe bucht keine
Sprosse; gebucht wird, was der Richter grün misst. Karte 2 gebucht 108 von 1 718 (`vision/karte-2-stand.json` im Zweig `punkte-maschine`).

## Geschnitten

Der Chokepoint ist der EINE Spiegel des Gelände-Kerns (`gelaende-core.js` `wasserSpiegel` → `atlasSpiegel`), den Stamm und jeder
Voxel-Faden rufen.

- **Das Gesetz.** `GEZEIT` = M2 (12,4206012 h, 1,505 m) + S2 (12,0000 h, 0,235 m), η = −Σ A·sin(2πt/T). Quelle: Doodson; Pegel
  Cuxhaven (de.wikipedia „Gezeiten“: Tidenhub Spring 3,48 m, Nipp 2,54 m). Der Spiegel geht in Stufen zu 5 cm (k ∈ [−35, 35]).
  EIN Träger `{stunde, k}` (`_gezeitGilt`) wechselt nur mit der Stufe. Der Takt des Pegels (`_pegelTakt`) trägt ihn in Lage und
  Faden. Die Uhr ist die Kalender-Zeit (`_gezeitStunde`), nie der Tag der Sicht; zur Welt-Uhr 0 steht das Meer im Mittel.
- **Nur das Meer.** Die Gezeit hebt Meer-Zellen und das Watt am Meer; Seen, Flüsse und Stau stehen. Was gesetzt wird (Wald,
  Genesis-Ort, `_landAt`), fragt den Spiegel des Lands (`landSpiegel`, das höchste Hochwasser) und steht nie auf dem Watt.
- **Das Watt.** Bei Ebbe fällt es trocken und trägt Schlick (`wattSchlick` in `_bodenFarbeAt`). Ein Chunk mit Meer oder geflutetem
  Watt im Fuß trägt die Marke der Gezeit und baut je Stufe neu. Das Fern-Wasser baut neu, wenn der Träger wechselt.
- **Der Fern-Ring (diese Welle).** Bis hier zeichnete die Ferne die Stunde ihres Baus: die Flut stand als Rechteck der gebauten
  Chunks, rundum trockenes Watt. Jetzt rechnet der Fern-Faden je Punkt die sieben Teile seines Spiegels (`spiegelTeile`). Der Wirt
  setzt sie zur Stufe zusammen (`spiegelZurStufe` — dieselbe Zusammensetzung, die `atlasSpiegel` ruft; der Abdruck des Kerns ist
  byte-gleich). Bei jedem Wechsel der Stufe legt `_fernRingWasserNeu` die Punkte der Gezeit neu, unter der EINEN Frist des
  Horizonts (`_bauFrist("horizont")`, wie das Einhängen).
- **Was fällt.** `meerSpiegel` und `meerKoerper` (ohne Leser). Kein Zwilling, kein Schalter.
- **Der Wirt am Gesetz** (`scripts/lib/welt-orte.cjs`) trägt den Kalender der Geburt (`dayLengthMinutes`). Die Gezeit liest die
  Kalender-Zeit, ein Wirt ohne Tag-Länge wirft beim Namen; die Wiese misst gleich (Hang 1,81°, Krone 0,043).

## Gemessen

**Die Linse** `gate:worker-dichte --gezeit --selftest` am gemergten Baum (main fbbd597c; Null-Renderer, Zensus-Bucht x 0,
z 10 430–10 830, 11 Punkte zu 40 m). Die volle `gate:worker-dichte` ist grün in 365 s (Probe ≤ 480 s).

| Maß | vorher (main) | nachher | Soll / Quelle |
|---|---|---|---|
| Hub am Meer über 24,84 h | 0 m | **3,50 m** | Cuxhaven Spring 3,48 · Nipp 2,54 |
| Periode (2 Durchgänge) | — | **12,363 h** (−0,47 %) | M2 12,4206 h ±1 % |
| Spring-Nipp (31 d, Hülle im 25-h-Fenster) | — | **14,750 d** | 14,765 d (Station 14,77) |
| Stamm ↔ Faden | — | 3 300 Werte, maxDiff **0** | 0 |
| Land unter Gegen-Tide | — | 1 100 Werte, **0** anders | 0 |
| Watt nass Ebbe ↔ Flut | 11 ↔ 11 | **4 ↔ 10** von 11 | trocken bei Ebbe |
| Fern-Ring, neben dem Gesetz | Stunde des Baus | **0 von 9 408** (nass 2 472 · 5 199 · 7 200 bei k −35 · 0 · 35) | 0 |

Selbsttest 4 von 4 beim Namen: „Spiegel steht“ in Wirt und Faden → STEHT; nur im Faden → SPIEGEL; „Land mit Uhr“ → LAND;
„der Ring steht“ (`_fernRingWasserNeu` sieht den Wechsel der Stufe nicht) → RING.

**Die Stationen wörtlich** (Quelle `meisterkarte-quelle/punkte/stationen/k2-planet.js` 3685–3947 im Zweig `punkte-maschine`). Der
Lauf: `node cloud-post/gezeiten-station/heim-messung.cjs [--json datei]` (Null-Renderer, ein Boot, ~2 min). Er übernimmt die
Heim-Adresse der Station und ihre Maße wörtlich; die Stationen bleiben unberührt (Regel 7).

- **#1** — Leser: der Fächer `GEZEIT_AN`. Die Heimat liest den Spiegel des Spiels `r._koerperWasser(sx, sz, -Infinity)` am
  See-Ende der Küste nach `st.spielZeit = alt + a.zeit · normS/24; r._pegelTakt()`, das Watt über `r._nassAt(x, z)`. Die übrigen
  12 Saaten lesen `G.wasserSpiegel` an `lageAus`, der Lage ohne Uhr; ihr Hub ist 0, gewollt (der Export nimmt keine Zeit). Messfunktion: `hubVon`, `periodeVon` (steigende Durchgänge
  durchs Mittel, Median je Saat), `benetztDiff`. Soll: „Periode ±2 %“ (`periodeH`, ref 12,42 h). Zeuge-Minimum: adressen 200 ·
  kuesten 5 · stunden 25 · uhr 25 · hubM 0,05 · benetztDiff 1. Umfang `u`: saaten 12 · stunden 25 · bisM 20 000 · ms 12 000.
  Die Küste der Heimat fällt auf x 0, z 10 430–10 830, die Bucht des Zensus.
  **Stand: hubM 0 → 3,45 m · periodeH null → 12,353 h (−0,54 %) · benetztDiff 0 → 5.**
- **#2** — Leser: der Mondwinkel des Himmels, `__weltLicht.mondRichtung(r._sonnenWinkel(0.5))` über `st.seasonPhase` + d/365 an
  31 Tagen. Soll: „Spring-Nipp-Takt 14,8 d ±2 %“ (`springNippTage`, ref 14,77 d) und „Pegel über 30 Tage“ (`tage` ≥). Zeuge-Minimum:
  tage 30 · phasenSpanne 90. Umfang `u`: tage 30. Einen Leser für `springNippTage` trägt die Station nicht; der Kandidat liegt unter
  `cloud-post/gezeiten-station/heim-messung.cjs` (Regel 7). Er liest denselben Spiegel des Spiels (`_koerperWasser` am See-Ende
  der Küste der Station) über 31 Tage der Welt-Uhr je Stunde: den Hub im gleitenden Fenster zweier Tiden (25 h), dann die
  steigenden Durchgänge der Hülle durch die Mitte zwischen Spring und Nipp (Hysterese 2 Stufen).
  **Stand am Kandidaten: springNippTage 14,750 d (−0,14 %) · tage 31 · phasenSpanne 0.**

**Der Preis über 24 h.** Das Gesetz wechselt die Stufe 242,4-mal in 24,84 h (Spring 282, Nipp 205). Am Standard-Tag (60 min)
heißt das eine Stufe alle ~15 s, bei Spring alle ~13 s.

- **Der Fern-Ring** (Null-Renderer, CPU dieses Containers, nur relativ): je Stufe 5 198–7 199 Punkte neu. Am Stück kostet das
  22–31 ms in einem Bild; unter der Frist sind es 4–5 Takte, der längste 6,2–8,6 ms.
- **Die nahen Chunks** (WebGL2 swiftshader, Profil voll, Ring 81 Chunks; nur relativ, kein echtes Gerät):
  - eine Stufe (5 cm): 72 von 81 Chunks bauen neu, 74 Takte, 61,8 s Wand, der längste Takt 81 ms;
  - ohne Sprung der Uhr: 0 Chunks, 0 Takte, 0,45 ms.

**Das Bildpaar** `cloud-post/gezeiten-bild/` — WebGL2 swiftshader (der Rückfall der Welt, `__anazhForceWebGL`), KEIN echtes
Gerät. Die Ausgabe-Aufnahme, gleiche Kamera p (0, 40, 10 390) → (0, −3, 10 620), Ebbe Stunde 3,1 (k −35) ↔ Flut 9,3 (k 35),
+6,2 h. Vor dem ersten Schuss pumpt die Probe Takte, bis der Ring der Chunks 30 Takte steht; beide Bilder tragen denselben Ring.

- `*-voll-*`: Ring 81 Chunks, Abnahme GRÜN (Luma 105,8 ↔ 85,2). Bei Ebbe liegt das Watt als Sand- und Schlick-Band trocken; bei Flut
  ist es eine See bis zum Horizont, ohne Rechteck.
- `*-kienspan-*`: ohne Fern-Wasser (`farWater: false`); hier trägt der Ring die Gezeit allein (Ring 25 Chunks, Luma 101,1 ↔ 80,0).
  Bei Ebbe liegt das Watt trocken wie in `voll`. Bei Flut trägt der Ring die See bis zum Horizont; nahes Wasser und Ring liegen in
  gleicher Tiefe nah beieinander (Luma 37,0 ↔ 44,5). Offen: die Naht, unten.

## Ehrlich offen

- **#2 halb (50 %).** Der Takt ist Gesetz und gemessen (14,750 d), doch die Station misst ihn nicht. Ihr Zeuge `phasenSpanne`
  bleibt 0: der Mond des Himmels ist ewiger Vollmond (`welt-licht.js` `mondRichtung`, `stamm/bild-himmel.js` moonDir = −sunDir).
  Ein Mond an `seasonPhase` (`jahreJeTag` 1,5) widerspräche der Gezeit an der Welt-Uhr: ein synodischer Monat dauerte im Spiel über
  19 Jahre. Gezeit und Mond müssen aus EINER Phase lesen; das entscheidet der Kalender der Welt. Messname `phasenSpanne`.
- **Der Preis der Nähe.** Jede Stufe baut jeden Chunk mit Meer im Fuß neu (72 von 81 an der Bucht), obwohl sich bei 5 cm nur die
  Wasserlinie bewegt. Der Spiegel als Größe des Wasser-Stoffs würde den Neubau auf die Chunks binden, deren Linie die Stufe
  kreuzt; dieser Schnitt ist offen. Messname: `markiert` je Stufe in der Bild-Probe.
- **Die Stufe auf flachem Watt.** Hier fällt das Watt ~1 : 180 (z 10 470 → 10 590: −2,01 → −2,67 m). Eine Stufe von 5 cm rückt die
  Linie um ~9 m, in Sprüngen und nicht stetig.
- **Was zur Stunde des Baus steht.** Der Feld-Pass jenseits von 8 km sowie Kronen- und Kamm-Karte zeichnen das Meer zur Stufe ihres
  Baus. Die Stau-Felder am Meer sind gegen den Spiegel ihres Baus gerechnet.
- **Die Bühne hält die Uhr.** Probe-Bilder (`__buehne`) frieren die Gezeit ein. Der Messort `profiband s5-bucht` sieht die Gezeit
  nun; seine Zahlen hängen an der Stunde.
- **Die Naht in `kienspan`.** An der Kante des nahen Wassers steht bei Flut eine helle Linie von 2 px (Luma 99–126 gegen ~30,
  Zeilen 334–335 in `flut-kienspan-swiftshader.png`), und die Wasserlinie des Rings geht in Treppen seiner Masche. Die Ursache ist
  nicht gelesen. Messname: die Luma der Naht im Bild.
- **Die Geburt unter `tagNull` 0,5.** Die Linse maß sie, bis die Ein-Schreiber-Wand griff: eine Probe schreibt `tagNull` nicht.
  Gemessen ist nur die Welt-Uhr 0; dass die Gezeit `_kalenderZeit` liest und nie `tagNull`, steht in der Quelle, nicht in einer
  Probe. Messname: `Geburt`.
- **`gate:fern-wasser`** ist rot am Zweig wie auf main e1a54023 („gebaut: false · Quads 0“); es ist hier kein Beweis.
- **Die Bilder** sind WebGL2 swiftshader, nicht die echte GPU (Lehre 17); die Preise in ms sind nur relativ.
- **BSH** war nicht erreichbar; der Hub steht auf Cuxhaven laut de.wikipedia und Doodson. Die BSH-Zahl fällt.
