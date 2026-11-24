# Vorprüfung klang-leib — Raum · Stimme · Donner · Duck

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 77 von 1 718 (diese Abgabe bucht keine Sprosse — gebucht wird
erst, wenn der Richter im Zweig `punkte-maschine` sie grün misst).

**Geschnitten:** EIN Weg zum Ohr für jede verortete Quelle (Laufzeit d/c(T), Luft nach ISO 9613-1, Kopf), EINE Röhre der Stimme
aus dem Leib für Mensch und Tier (der Bewohner hat seine Stimme, Laut ohne Sprache), der Donner als Ereignis des EINEN
Wetter-Felds am Ort (Blitz → Laufzeit → Donner), das Gespräch duckt die Musik in der Mitte des Bands. **Gemessen:** Einsatz
0 → 12 von 12 nach d/c(T); Stimme 120 von 120 Werten ±15 % zu Peterson & Barney (Mittel 1,78 %); Donner 12 von 12 Einsätzen
±2 % zu d/c(T), in der Welt 0 → 2 Blitze je Minute Sturm-Wort, je Verhältnis 1,0000; Duck 12,0 → 10,0 dB. **Ehrlich offen:**
das Kontakt-Gesetz (ereignis#3), die sieben Stimmen und die Dauer des Getümmels, die Grillen (die Wurzel liegt im
Gelände-Kern, außerhalb des Reviers), Zeile für Zeile unten.

Basis: main f287dfb, dann main 60e8909 (w28-wetter-am-ort) hineingemergt — der Donner liest seither das EINE Feld am Ort.

## Je Sprosse: vorher ↔ nachher (eigene Konsum-Probe, gleiche Bedingungen)

| Sprosse | vorher | nachher | Probe |
| --- | --- | --- | --- |
| `erleben.klang.raum#1` (laufzeit_pct) | Einsatz flach 1,6 ms an 3 · 8 · 20 m: 0 von 12 nach d/c | d/c(T) + 1,6 ms an 12 von 12; Luft 0,5–4 kHz über 300–3 000 m ±1,8 dB zur Norm | Ruf im OfflineAudioContext; Linse (V) 18/18, (Ra) 24/24 |
| `erleben.klang.stimme#1` | kein Gesetz, der Bewohner stumm (Dorf 40 s: 0 Laute) | F0 · F1 · F2 · F3 je Mann · Frau · Kind × 10 Vokale am Abgriff: 120/120 ±15 %, Mittel 1,78 %, max 9,0 % (Kind); Dorf 40 s: 33 Laute bestellt, 33 gespielt; nach dem Merge 30 s neben den Bewohnern: 12 Laute, 14 Rufe gespielt | Linse (St) am Abgriff: YIN + Kovarianz-LPC 14. Ordnung im freien Ausklingen; Tier-Ruf 59/60 byte-gleich (1 um 1,2e-35) |
| `erleben.kopplung.ein-ereignis#2` (Donner) | kein Blitz, kein Donner | Dn 12/12 Einsätze, Verhältnis zu d/c(T) 1,0000–1,0002 (−10 · 20 · 35 °C × 400 · 1 500 · 5 000 · 12 000 m); Welt Dorf: Sonne 15 s 0 Blitze, Sturm-Wort 60 s 2 Blitze (673 m, 2 346 m), 2 Donner, je 1,0000 | Linse (Dn), (Db); Welt-Probe Werkbank |
| dasselbe, das Feld am Ort | 8976b3e: das Wort galt auf der ganzen Scheibe (9 Blitze in 60 s bis 16 km, Anteil 12 km fern = 1) | Anteil des Sturms im Feld: am Spieler 1 / Sonne 0; 5 km 0,477 (die Mischung des Eingriffs); 12 km in 8 Richtungen unter Sturm-Wort und Sonne gleich (7 × 0/0, die natürliche Front 180° 1/1), im Lee nie mehr | Linse (Db): 29 Kern-Anteile exakt ±1e-9 |
| `erleben.klang.getuemmel#1` (duck_db) | Duck −12 dB, die Station las 13,27 dB (Band 8–12) | Duck −10 dB, Gain-Verhältnis am Bus 12,0 → 10,0 dB; die Station erwartet ≈ 11,3 dB (Richter: der nächste Lauf) | Gain am Musik-Bus |

## Die Schnitte (Datei:Zeile)

- **Raum:** `raumWeg` (klang-core.js:1063) — Anschlag d/c(T) über `schallC`, die Luft `luftLeiter` (klang-core.js:1022, ISO 9613-1
  als Hochregal-Leiter je Oktave), Woodworth-ITD und Kopfschatten in derselben Luft; der StereoPanner fiel aus Graph und Nachhall,
  die Zwillinge 343 m/s lesen `schallC`.
- **Stimme:** `STIMME` (klang-core.js:1520) mit `bezug` (Mann) und `bezugFrau`; `roehre` (klang-core.js:1566) F_n = k_n(2n−1)c/(4L_t),
  `stimmLeib` (klang-core.js:1572: L_t, L_f, f0 aus Höhe, Geschlecht, Reife), `STIMME_FORM` (klang-core.js:1580) und `stimmForm`
  (klang-core.js:1594: die Form des Vokals folgt der Reife zwischen den Ankern Frau und Mann, Fant 1966), `stimmPuffer`
  (klang-core.js:1608: Rosenberg-Puls, Klatt-Kaskade). `rufPuffer` (klang-core.js:1454) wählt Leib · Blitz · Tier. Der Bewohner:
  `_bewohnerLautTakt` (stamm/klang.js:839, nur Siedlungen im Nah-Ring, je Takt ein Abstand je Leib) → `_bewohnerLaut`
  (stamm/klang.js:921) → die Werkstatt → `rufSpielen` (stamm/klang.js:192).
- **Donner:** `DONNER` (klang-core.js:1675), `blitzAnteil` (klang-core.js:1694: der duale Vektor der EINEN Tafel WEATHER_FIELD,
  das Lee nimmt den Sturm mit dem Regen), `donnerPuffer` (klang-core.js:1747: der gewundene Kanal, je 0,7 m eine N-Welle nach dem
  Relaxations-Radius); `_donnerTakt` (stamm/klang.js:873, Poisson mit Verdünnung), `_blitzAnteilAm` (stamm/klang.js:891, liest
  `_wetterFeldAm`), `_blitz` (stamm/klang.js:900); `rufSpielen` (klang-core.js:1465) setzt den Einsatz ab dem Blitz (`t0`) vom
  nächsten Punkt des Kanals; der Untertitel „Donner grollt“ zur Ankunft (stamm/werkstatt-hud.js:3200, stamm/daten.js:1355).
- **Duck:** `MUSIK.duck.gespraech.db` −12 → −10 (klang-core.js:384).

## Die Linse (gate:klang-zensus, eine Klinge je neuer Größe)

(V) Rw · Rl · Rp der Weg (`wegSeite`, scripts/diag-klang-zensus.cjs:1468), (St) die Stimme (`stimmSeite`, :1547), (Dn) der
Donner (`donnerSeite`, :1647), (Db) der Blitz am Ort (`blitzSeite`, :1683). Selbsttest: S18–S20 der Weg ohne Laufzeit · ohne
Luft · mit Panner, S21 der Mann ohne Pubertät (10 rot), S22 der Donner ohne Laufzeit, S23 das Wort gilt überall — jeder Täter
beim Namen. Voller Lauf mit Selbsttest lokal 4 min 18 s, GRÜN, Exit 0. `npm run check` GRÜN.

## Kosten an hörbaren Quellen

Ein Laut und ein Donner werden nur bestellt, wenn ihr Pegel am Ohr über der Hörschwelle liegt (`rufPegel`); der Puffer entsteht
in der Klang-Werkstatt, nie im Haupt-Thread, nie je Bild (Donner 3 km: 25 ms, 14 421 Strahler, 8,24 s Klang). Der Leser des
Felds kostet 1,94 µs je Kandidat, die Kandidaten kommen mit der vollen Dichte (≈ 8 je Minute auf der Scheibe von 16 km). Die
Bewohner: nur Siedlungen im Nah-Ring, nie die Welt.

## Ehrlich offen (Sprosse · Grund)

- `erleben.klang.ereignis#3` (Rollen · Gleiten · Schaben): das Kontakt-Gesetz ist nicht gebaut; der Klang kennt den Stoß
  (`trefferPaar`), die Kontakt-Geschwindigkeit je Fuge müsste der Körper-Löser liefern (koerper-core nur LESEN).
- `erleben.klang.getuemmel#1`: die sieben Stimmen und `dauer_min` sind nicht geschnitten, nur der Duck rückte in die Mitte des
  Bands. Der Grund steht im Urteil des Richters (Zweig `punkte-maschine`, die Akte der Leiter getuemmel, Sprosse 1, Ort
  31ea3847, GTX 1060, 20.11.): „nur 3
  Stimmen zugleich an der Wiese im Regen (wind, regen, glut)“ — der Ort der Station trägt drei Quellen, der Deckel des Gesetzes
  (7, die lautesten gewinnen) greift dort nie; und „die Leiter hört 0.234 min — 10 min übersteigen den Deckel einer Leiter
  (60 s)“ — die Dauer ist der Rahmen der Station. Beides liegt an der Station, die dieser Auftrag nicht ändert.
- `erleben.kopplung.epoche-ganz#1` (Grillen still): das Grillen-Gesetz (Dolbear, stumm unter 12 °C) ist richtig, die Wärme am
  Ort falsch — im Hochsommer liest das Dorf auf 91 m Luft 2,6–12,6 °C, Boden 4,2–11,0 °C, weil der Gelände-Kern mit
  `kuehlungKJeM` = TEMPERATUR.sommer / mittlere Schneegrenze = 0,1108 K/m kühlt (gelaende-core.js:5918, angewandt :1334: 10,1 K
  auf 91 m, das 17-Fache der Norm-Atmosphäre 6,5 K/km). Die Wurzel liegt außerhalb des Reviers; den Zeugen zu heilen wäre der
  Zwilling.
- `erleben.kopplung.ein-ereignis#2`, der Rest: das Bild des Blitzes (stamm/bild-himmel.js, nicht im Revier), `unterDach`
  (stamm/siedlung-bewohner.js, nicht anzufassen), der Regen je Zugzeit; die Dichte `blitzJeKm2Min` 0,01 trägt QUELLE
  UNGEPRUEFT (die Suche nennt ≈ 3 Blitze je Minute und Gewitter nach dem Optical Transient Detector; die Quelle antwortete 503).
- `erleben.klang.raum#5`: die Fahrt geht noch nicht über `raumWeg`.

## Quellen

ISO 9613-1 (Luftdämpfung) · Peterson & Barney 1952 (über Praat und CRAN phonTools `pb52`) · Fitch & Giedd 1999 · Nordström &
Lindblom 1975 · Fant 1966 · Klatt 1980 · de Cheveigné & Kawahara 2002 (YIN) · Few 1969 ([NAP, The Earth's Electrical
Environment](https://books.nap.edu/read/898/chapter/30), [Wikibooks Thunder acoustics](https://en.wikibooks.org/wiki/Engineering_Acoustics/Thunder_acoustics)) ·
[NWS Lightning: Thunder](https://www.weather.gov/safety/lightning-science-thunder) · [Molnar](https://par.nsf.gov/servlets/purl/10346754) ·
Grillen [Exeter](https://ore.exeter.ac.uk/rest/bitstreams/193483/retrieve), [Springer](https://link.springer.com/article/10.1007/BF00195962) ·
Lewis & Shedler 1979 (Verdünnung einer Poisson-Folge).

## Kopf

Der Kopf ist der Commit, der diese Datei trägt; seine sha40 steht in der letzten Nachricht der Sitzung — eine Datei kann ihren
eigenen Commit nicht nennen.
