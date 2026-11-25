# Leser-Kandidaten der Bahn `gezeiten` (Regel 7)

Die Stationen bleiben unberührt (`origin/punkte-maschine`, `meisterkarte-quelle/punkte/stationen/k2-planet.js` 3684–3947). Hier steht, was
ihre Messfunktion am Stand des Zweigs liest, und der Leser, der #2 fehlt.

`node cloud-post/gezeiten-station/heim-messung.cjs [--json datei]` (Null-Renderer, 1 Boot, ~2 min)

## #1 `karte2.planet.wasser.gezeiten#1` — die Heim-Adresse der Station wörtlich

`GEZEIT_AN` (Zweig `heim`, k2-planet.js 3740–3790):
- Die Küste: `G.hoehe(L, x, z, false) < wl` in 16 Richtungen je 250 m vom Spawn. Sie fällt auf **x 0, z 10430–10830**, genau die Bucht des Zensus (Rang 6 „Nordsee-Watt“).
- Der Spiegel: 11 Punkte zu 40 m, gelesen mit `r._koerperWasser(sx, sz, -Infinity)` am See-Ende nach `st.spielZeit = alt + a.zeit · normS/24; r._pegelTakt()`.
- Das Watt: `r._nassAt(x, z)`.
- Die Maße `hubVon`, `periodeVon` und `benetztDiff` sind wörtlich übernommen.

| Maß | Stand `gezeiten` | Soll / Zeuge-Minimum |
|---|---|---|
| hubM | **3,45 m** | ≥ 0,05 |
| periodeH | **12,353 h** (−0,54 %) | 12,42 ±2 % |
| benetztDiff | **5** (nass je Stunde `665556691010101076555669101010109`) | ≥ 1 |
| stunden · uhr | 25 · 25 | 25 · 25 |

Vorher (main e1a54023): hubM 0, periodeH null, benetztDiff 0 — `waterLevel` war eine Konstante.

Die übrigen 12 Saaten liest die Station am Export (`G.wasserSpiegel` an `lageAus`, die Lage ohne Uhr). Ihr Hub ist 0, gewollt: „der Export nimmt keine Zeit“, gelaende-core `GEZEIT` ohne Träger. `kuesten` und `adressen` zählen sie trotzdem.

## #2 `karte2.planet.wasser.gezeiten#2` — HALB (50 %)

Soll: „Spring-Nipp-Takt 14,8 d ±2 %“ (Schlüssel `springNippTage`, ref 14,77) und „Pegel über 30 Tage“ (`tage` ≥). Zeugen: `tage` ≥ 30, `phasenSpanne` ≥ 90.

Was die Station liest: nur den Mondwinkel des Himmels. Sie stuft `st.seasonPhase` um d/365 je Tag und liest `__weltLicht.mondRichtung(r._sonnenWinkel(0.5))`. Einen Leser für `springNippTage` trägt sie nicht.

**Der Kandidat** (in `heim-messung.cjs`) liest denselben Spiegel des Spiels (`_koerperWasser` am See-Ende der Küste der Station) über 31 Tage der Welt-Uhr, je Stunde:
- der Hub im gleitenden Fenster zweier Tiden (25 h);
- die steigenden Durchgänge der Hülle durch die Mitte zwischen Spring und Nipp (Hysterese 2 Stufen).

Ergebnis: **springNippTage 14,750 d** (−0,14 % gegen 14,77), Spring 3,50 m, Nipp 2,50 m, tage 31.

**Offen, mit Grund:** `phasenSpanne` bleibt 0.
- Der Mond des Himmels ist ewiger Vollmond (`welt-licht.js` `mondRichtung`, `stamm/bild-himmel.js` moonDir = −sunDir).
- Die Station misst ihn an `seasonPhase`. Das Jahr des Spiels läuft aber 1,5-mal je Tag (`WELT_GESETZ_ERDE.kalender.jahreJeTag` 1,5). Ein synodischer Monat von 29,53 Tagen wäre im Spiel länger als 19 Jahre.
- Ein Mond, der an `seasonPhase` läuft, widerspräche also der Gezeit an der Welt-Uhr. Das entscheidet der Kalender der Welt, nicht diese Bahn.
- Gezeit und Mond müssen aus EINER Phase lesen. Heute trägt nur die Gezeit sie (gelaende-core `GEZEIT`: Springtide zur Welt-Uhr 0 und je 14,765 d).

Messname: `springNippTage` am Kandidaten, `phasenSpanne` an der Station.
