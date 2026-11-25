# Zensus Referenz-Szenen — Gruppe himmel (Wetter · Kosmos · Licht und Bild · Klang)

Nur gelesen: punkte-maschine 5108f1b3 (front-tafel 25.11. 06:17, Stand 105 von 1 718), main 6c210411. Kein Commit, kein Lauf.

## Lage der Gruppe an der Front

Nach der Front-Tafel gebucht sind 8 Sprossen: wetter.lagen#1, wetter.klimazonen#1, wetter.vorhersage#1, kosmos.sternhimmel#1,
klang.raum#1, klang.ereignis#1 und #2, klang.landschaft#1. Die Fronten der Gruppe und was sie hält:

| Front | Was sie rot hält (Front-Tafel) | Art |
|---|---|---|
| planet.kosmos.himmelsmechanik#1 | Sprung 0,369 EV bei Uhr 0,226→0,228 (Sonne −8,6°, gerechnet aus welt-licht.js:804-823); Tag ≥ 10° 1 Punkt statt 0 | Richter + Welt; BEANSPRUCHT w28-licht-stetig |
| planet.kosmos.sternhimmel#2 | „0 Sterne bis mag 6“ | **Leser veraltet** (siehe R3) |
| planet.kosmos.systeme#1 | der Mond hat keine Bahn (welt-licht.js:826 mondRichtung = −Sonne); die Planeten stimmen (max 0,022°) | Macher fehlt; BEANSPRUCHT pm-beobachter |
| planet.kosmos.sterne#1, ereignisse#1, welten#1, eigengesetz#1, kunstwelten#1, galaxien#1 | Leser fehlt / keine Station / 0 Körper | Macher fehlt |
| erleben.bild.himmel#1 | „kein geeichtes k“ | **Leser veraltet** (EINHEIT_LX 16 090 steht, welt-licht.js:76) |
| erleben.bild.nacht#1 | Schatten-Kontrast 1,47 statt ≥ 3 | Welt; BEANSPRUCHT pm-nacht-front |
| erleben.bild.auge#1 | Flimmern 3,2 % statt ≤ 1 % | Welt |
| erleben.bild.ferne#1, flaeche#1 | keine Station | Richter fehlt |
| planet.wetter.wolken#1 | keine Station; die Mechanik steht (welt-licht.js:1010-1014: Muster zieht mit WIND_FELD.front.zugMS) | Richter fehlt |
| planet.wetter.lagen#2, vorhersage#2, extreme#1, klimazonen#2, fremde-atmosphaeren#1 | Wetter = drei Sinus-Wellen (phyto-core wetterAt), Höhe gestaucht 0,11 K/m, Flut gedeckelt | Macher fehlt |
| erleben.klang.raum#2 | 1 Raum in 60 s — RT60 der vier Räume steht headless (0,283 · 0,649 · 1,522 · 3,195 s) | **Stations-Rahmen** |
| erleben.klang.landschaft#2 | 0 Wagen an der Wiese | **Messort-Wahl** + 5 Biome fehlen |
| erleben.klang.getuemmel#1 | 3 Stimmen (Wiese im Regen), Hördauer 0,234 min statt 10, Duck 13,27 dB statt ≤ 12 | **Messort + Stations-Rahmen + erfundene Obergrenze** |
| erleben.klang.ereignis#3, stimme#1 | kein Kratzen/Gleiten/Bruch; keine Menschenstimme | Macher fehlt; stimme BEANSPRUCHT w28-klang-leib |
| erleben.klang.musik#1 | keine Station (KERN) | Richter fehlt |

Befund vorab: In dieser Gruppe sind die meisten Sollwerte schon Bänder aus äußeren Quellen (USNO Circular 171 in spec/farbe/tag-ref.json,
Koschmieder, Grenzgröße, Meeus, Bortle, Kyba 2017 in welt-licht.js:77). Rot halten vor allem drei Dinge: fehlende Mechanik (Mond, Wetter,
Stimme, Meteore), veraltete Leser (aMag, „kein k“) und Rahmen der Stationen (60-s-Leiter, Messort Wiese im Regen).

## Kann das Spiel heute an den Ort und in die Zeit?

- **Ort:** `reise <Breite> <Länge> [<Ma>]` steht (stamm/feld-leben.js:1278-1298, Planet-Faden `planet-ort`). Der Erd-Samen trägt die
  Erd-PARAMETER (planet-core.js:264 PLANET_ERDE: R 6 371 km, g 9,81, ε 0,4091 rad, 24 h, 365 d), aber keine Erd-Geografie. Der Heim-Anker
  liegt bei −45,48° Breite (k2-erleben spieler.zeit, Front-Tafel Zeile 50). Für Himmel und Licht zählt nur Breite × Datum × Uhr × Wetter,
  und die stehen in jeder Saat mit Erd-Parametern.
- **Zeit:** Uhr (`setTimeOfDay`), Tag der Welt (`worldMeta.tag`), Saison-Wort (`setSeason`), Zeitreise −4 000 … +1 000 Ma (der Himmel
  liest sie nicht). Die Sonne liest heute nur die Uhr (welt-licht.js:817-823, „feste Bahn“); die Meeus-Bahn aus Jahr × Breite stand gebaut
  und fiel an gate:tag-achse:echt (welt-licht.js:807-816). Laut Auftrag ist sie an der echten Station GRÜN und landet heute.
- **Messorte:** spec/profiband/haushalt.json hat 9 Orte (wiese, genesis, dorf, buehne, stadt, stadt-voll, ort-zeichen, hochhaus-dach,
  gipfel-blick). **Kein Messort trägt Uhr, Tag, Saison, Wetter oder Breite.** Die Szene braucht dort ein Feld `zeit` (Uhr, Tag, Wetter).
  Den offenen Horizont für Auf- und Untergang trägt gipfel-blick (172,2 m, „Blick über die Stadt zum Horizont“). Die Wiese hat im
  Nordosten einen Grat, und genau dort fiel die Meeus-Sonne (Azimut 76°, welt-licht.js:809-811).

---

## (a) Referenz-Szenen

### S1 — Der offene Horizont: klarer Tag bis Neumond-Nacht am Gipfel-Blick

**Ort/Zeit:** Heim-Saat, Messort gipfel-blick (offener Horizont), Anker-Breite −45,5°, Wetter `sunny`, Tag 80 (Tagundnachtgleiche),
172 und 355 (die Wenden), dazu 15 Tage später (Neumond ↔ Vollmond); Uhr 0 … 1, Ego.

**Bänder (13 mit gelesener Quelle):**

| Größe | Wert · Spanne | Quelle | URL |
|---|---|---|---|
| Sonnenstand-Genauigkeit | ±0,0003° (Jahre −2000 … 6000) → das Karten-Soll ±0,5° / ±1° hat viel Reserve | NREL SPA, Reda & Andreas 2004 (Suchergebnis, das PDF nicht gelesen) | https://midcdmz.nrel.gov/spa |
| Mittagshöhe bei −45,5° | 44,5° (Gleiche) · 68,0° (Dez.) · 21,1° (Juni) | gerechnet: 90° − 45,5° ± ε, ε 0,4091 rad (planet-core.js:264) | Gesetz |
| E Sonnenauf-/-untergang, klar | 400 lx | Wikipedia Lux | https://en.wikipedia.org/wiki/Lux |
| E am Ende der bürgerlichen Dämmerung | 3,4 lx (tag-ref: 3,01 lx bei −6°) | Wikipedia Lux; USNO 171 im Repo | https://en.wikipedia.org/wiki/Lux |
| E direkte Sonne · Tageslicht ohne Sonne · bedeckt | 32 000–100 000 · 10 000–25 000 · 1 000 lx | Wikipedia Lux | https://en.wikipedia.org/wiki/Lux |
| E Vollmond · Viertel · mondlos klar · mondlos bedeckt | 0,05–0,3 · 0,01 · 0,002 · 0,0001 lx → Neumond 4,6–7,2 EV unter Vollmond (gerechnet) | Wikipedia Lux | https://en.wikipedia.org/wiki/Lux |
| L mittlerer klarer Himmel · bewölkter Himmel | 8 kcd/m² · 2 kcd/m² (bewölkt mittags 1 kcd/m²) | Wikipedia Orders of magnitude (luminance) | https://en.wikipedia.org/wiki/Orders_of_magnitude_(luminance) |
| L Sonnenscheibe Mittag · am Horizont · Mond-Oberfläche | 1,6 Gcd/m² · 600 kcd/m² · 2,5 kcd/m² | ebd. | ebd. |
| L Nachthimmel · dunkelster Himmel | 1 mcd/m² · 400 µcd/m² | ebd. | ebd. |
| Schwellen des Auges | absolut 1 µcd/m²; skotopisch/mesopisch 5 mcd/m²; mesopisch/photopisch 5 cd/m² | ebd. | ebd. |
| Dämmerung | −6° / −12° / −18°; Venus und die hellsten Sterne in der bürgerlichen Dämmerung; mag 6 ab astronomischer Dämmerung; Dauer der bürgerlichen 33–48 min bei 51,5° N, 24 min am Äquator | Wikipedia Twilight | https://en.wikipedia.org/wiki/Twilight |
| Dunkler Himmel | Bortle 1: NELM 7,6–8,0, SQM 21,76–22,0, die Milchstraße wirft Schatten, Zodiakallicht sichtbar; Bortle 4: NELM 6,3–6,5 | Wikipedia Bortle scale | https://en.wikipedia.org/wiki/Bortle_scale |
| Sternzahl | 9 110 Objekte, davon 9 095 Sterne, bis 6,5 mag | Wikipedia Bright Star Catalogue | https://en.wikipedia.org/wiki/Bright_Star_Catalogue |
| Sichtweite | V = 3,912/β (2 % Kontrast); reine Rayleigh-Luft ≈ 296 km; Dunst 2–5 km; Nebel < 1 km | Wikipedia Visibility (Koschmieder) | https://en.wikipedia.org/wiki/Visibility |
| Farbtemperatur | Auf-/Untergang 1 850 K; bedeckt 6 500 K; klarer Polhimmel 15 000–27 000 K | Wikipedia Color temperature | https://en.wikipedia.org/wiki/Color_temperature |
| Mond | Bond-Albedo 0,136; Vollmond ≈ 1/380 000 der Sonne; Vollmond 0,05–0,1 lx typisch, bis 0,32 lx | Wikipedia Moonlight | https://en.wikipedia.org/wiki/Moonlight |

**Ungeprüft (nicht gelesen):** Zenit-Leuchtdichte des CIE-Klarhimmels als Funktion der Sonnenhöhe (Karayel et al. 1983, NBSIR 85-3251:
Quelle gefunden, Zahlen nicht gelesen); die Zahl der Sterne bis 6,0 mag (≈ 5 000, ungeprüft).

**Sprossen, die S1 richtet:** karte2.planet.kosmos.himmelsmechanik#1, karte2.planet.kosmos.himmelsmechanik#2,
karte2.planet.kosmos.himmelsmechanik#3, karte2.planet.kosmos.sternhimmel#2, karte2.planet.kosmos.sternhimmel#3,
karte2.planet.kosmos.systeme#1, karte2.planet.kosmos.ereignisse#1, karte2.erleben.bild.himmel#1, karte2.erleben.bild.himmel#2,
karte2.erleben.bild.ferne#1, karte2.erleben.bild.ferne#3, karte2.erleben.bild.auge#3, karte2.planet.wetter.fremde-atmosphaeren#1
(Nachbar außerhalb der Gruppe: karte2.erleben.spieler.zeit#1).

**Heute im Spiel:** Tag-Ref USNO 171 (spec/farbe/tag-ref.json, 16 Zeilen); die Kamera folgt ihr in den Knoten (welt-licht.js:84-101,
737-750: −6° → −1,563, −12° → −1,823 Stufen, gleich der Ref); GRENZGROESSE (welt-licht.js:151-160); EINE Skala 1 Einheit = 16 090 lx
(welt-licht.js:76); Vollmond 0,26 lx nach Kyba 2017 (welt-licht.js:77-78); Hillaire-Atmosphäre (welt-licht.js:18-48); das Sternfeld ist die
Kosmos-Funktion der Saat mit Größenklassen in `userData.mags` (stamm/bild-himmel.js:318-362); Planeten auf Kepler-Bahnen (kosmosZeit).

**Fehlt:** eine Bahn des Monds (welt-licht.js:824-828: „steht der Sonne voll gegenüber“) samt Phase, Terminator und Neumond; die Breite und
das Datum in der Sonne (landet heute); ein Leser der Himmels-Leuchtdichte in cd/m², obwohl die Skala geeicht ist; Uhr und Tag am Messort;
Meteore; die Milchstraße als Band (Band-Anteil 0,276, Front-Tafel Zeile 303).

**Wo das Gesetz lebt:** welt-licht.js `sonnenRichtung` :817, `mondRichtung` :826, `MOND_LX` :78, `belichtung` :763, `tagAchse` :834,
`GRENZGROESSE` :151, `KOSMOS` :1464; foundry-core ATMO_GESETZ (nicht geöffnet); spec/farbe/tag-ref.json.

**ERSTE Welle S1:** *Chokepoint: welt-licht.js:826 `mondRichtung` — der Mond wird ein Körper der Kosmos-Funktion (synodisch 29,53 d,
Bahnneigung ungeprüft 5,1°), seine Helligkeit eine Funktion der Phase. Es stirbt der Zwilling „Mond = −Sonne“ und die feste Vollmond-Zahl
`MOND_LX` als Boden der Belichtung (welt-licht.js:62-70, 765).* Dateien: welt-licht.js (mondRichtung, MOND_E → Phase, kosmosZeit),
stamm/bild-himmel.js (Mondkörper, skyOffset :2588/2600, Phase :2793). Gestalt: Sichel am Abendhimmel, die Neumond-Nacht wird dunkel.
An der Front ehrlich: **+1** (karte2.planet.kosmos.systeme#1, sein einziger benannter Täter ist der Mond); himmelsmechanik#3 erst, wenn #1
und #2 stehen. **≈ 6 h.** Bildpaar: gipfel-blick, Ego, Uhr 0,0, Tag t (Vollmond) gegen Tag t+15 (Neumond) — Soll aus dem Band: E im
HDR-Puffer × 16 090 fällt um 4,6–7,2 EV, dazu die Sichel bei Sonne −6° am Westhimmel.

### S2 — Die Front zieht durch: Sommer-Nachmittag mit Gewitter am Stadtrand

**Ort/Zeit:** Heim-Saat, Messort stadt (Wiese und Gasse in Hörweite), Sommer, Uhr 0,55 → 0,75, Wetter `sunny → rainy → sturm`.

**Bänder (8 mit gelesener Quelle):**

| Größe | Wert | Quelle | URL |
|---|---|---|---|
| Bedeckung global · Land · Meer | 67–68 % (56–73 % je Schwelle) · 55 % · 72 % | Wikipedia Cloud cover | https://en.wikipedia.org/wiki/Cloud_cover |
| Okta | 0/8 heiter … 8/8 bedeckt; 9 = Himmel verdeckt (Nebel, Starkschnee) | Wikipedia Okta | https://en.wikipedia.org/wiki/Okta |
| Donner-Abstand | ≈ 3 s je km | Wikipedia Thunder | https://en.wikipedia.org/wiki/Thunder |
| Donner-Pegel nah | 165–180 dB, bis über 200 dB | ebd. | ebd. |
| Schallgeschwindigkeit | 343,2 m/s bei 20 °C; 331,3 m/s bei 0 °C; c ≈ 331,3 + 0,606·θ | Wikipedia Speed of sound | https://en.wikipedia.org/wiki/Speed_of_sound |
| Sichtweite im Regen | Koschmieder V = 3,912/β; Dunst 2–5 km, Nebel < 1 km | Wikipedia Visibility | https://en.wikipedia.org/wiki/Visibility |
| Licht unter der Decke | E bedeckt 1 000 lx; L bewölkter Himmel 2 kcd/m² (mittags 1 kcd/m²) | Wikipedia Lux; Orders of magnitude | (s. S1) |
| Farbe unter der Decke | 6 500 K | Wikipedia Color temperature | (s. S1) |

**Ungeprüft:** Luftdämpfung ISO 9613-1 bei 1 kHz, 20 °C, 70 % ≈ 4,7 dB/km (Tafel hinter der Bezahlschranke, nicht gelesen); die Abfolge
Cirrus → Altostratus → Nimbostratus der Warmfront (Bjerknes) mit Vorlauf 12–24 h (nicht gelesen).

**Sprossen:** karte2.planet.wetter.wolken#1, karte2.planet.wetter.wolken#2, karte2.planet.wetter.wolken#3, karte2.planet.wetter.wolken#4,
karte2.planet.wetter.lagen#2, karte2.planet.wetter.lagen#6, karte2.planet.wetter.vorhersage#2, karte2.erleben.bild.himmel#3,
karte2.erleben.klang.raum#5, karte2.erleben.klang.ereignis#5, karte2.erleben.bild.ferne#5.

**Heute im Spiel:** die Wolkenschicht 800 m, τ = 100 · Menge, g 0,85 (welt-licht.js:980-993); das Muster zieht mit dem Wind
(welt-licht.js:1010-1014); das Wetter am Ort sind drei Sinus-Wellen ohne Druck und ohne Gattung (phyto-core wetterAt, Front-Tafel Zeile 168);
Sicht je Wetter-Wort `_luftSichtM` (stamm/bild-himmel.js:2280, laut Station); kein Blitz, kein Donner.

**Fehlt:** Druckfeld und Front als Körper; die Wolkengattung aus Feuchte, Hebung und Stabilität; Donner als Ereignis; die Station für
wolken#1 (Front-Tafel Zeile 97: KEINE STATION).

**Wo das Gesetz lebt:** phyto-core.js wetterAt (≈ :4423 laut Front-Tafel), WIND_FELD (phyto-core windGrund), welt-licht.js WOLKEN_SCHICHT
:980, wolkenFeld :1017.

**ERSTE Welle S2:** *Chokepoint: der fehlende Leser von wolken#1 — Station in k2-planet.js, die die Schattenkante der Wolkenkarte
(`_wolkenSchatten`) über Δt = 60 s gegen WIND_FELD.front.zugMS × Δt misst (Band aus dem Gesetz, ±10 %). Es stirbt „KEINE STATION“ an einer
Sprosse, deren Mechanik steht.* Die Gestalt steht schon: ziehende Wolkenschatten. An der Front ehrlich: **+1** (karte2.planet.wetter.wolken#1);
wolken#2 braucht Foto-Blindtest, lagen#2 das Druckfeld (≥ 20 h, eigene Welle). **≈ 3 h.** Bildpaar: Wiese, Uhr 0,5, `sunny` Menge 0,4,
zwei Bilder im Abstand von 60 s — die Schattenkante versetzt sich um zugMS × 60 m.

### S3 — Der Markt der Metropole von Mittag bis Mitternacht

**Ort/Zeit:** Messort stadt-voll (1 092 Bewohner, Markt mit Ständen, Wagen), Uhr 0,5 → 0,0, Sommer, klar, ein Feuer und Laternen am Platz.

**Bänder (8 mit gelesener Quelle):**

| Größe | Wert | Quelle | URL |
|---|---|---|---|
| Gespräch in 1 m | 40–60 dB SPL | Wikipedia Sound pressure | https://en.wikipedia.org/wiki/Sound_pressure |
| Pkw 30 km/h in 10 m | 65–70 dB SPL | ebd. | ebd. |
| Gehörschaden · Schmerz | 85 dB · 120–134 dB | ebd. | ebd. |
| Nachhall | Sabine T60 ≈ 0,161 V/(S·a); Eyring −0,161 V/(S·ln(1−a)) | Wikipedia Reverberation | https://en.wikipedia.org/wiki/Reverberation |
| Formanten (Mann) | /i/ 240/2400 Hz · /u/ 250/595 Hz · /a/ 850/1610 Hz | Wikipedia Formant (Catford 2001) | https://en.wikipedia.org/wiki/Formant |
| Grillen-Takt | T_C = 5 + N₈ (Zirpen in 8 s), Dolbear 1897 — steht im Kern (klang-core.js:945, 7·(T−10)+40 je min) | Wikipedia Dolbear's law | https://en.wikipedia.org/wiki/Dolbear%27s_law |
| Feuer · Glühlampe | 1 850 K (Kerze) · 2 400 K | Wikipedia Color temperature | (s. S1) |
| Stadthimmel | Bortle 7: NELM 4,6–5,0, SQM 18,0–18,5; Bortle 8–9: ≤ 4,5 | Wikipedia Bortle scale | (s. S1) |

**Ungeprüft:** Peterson & Barney 1952 (nicht gelesen; die Karte nennt ±15 %); Straßenlicht 5–30 lx (Wert der Karte, nicht gelesen);
Walker's Law (nicht gelesen).

**Sprossen:** karte2.erleben.klang.getuemmel#1, karte2.erleben.klang.getuemmel#2, karte2.erleben.klang.landschaft#2,
karte2.erleben.klang.landschaft#3, karte2.erleben.klang.raum#2, karte2.erleben.klang.raum#3, karte2.erleben.klang.stimme#1,
karte2.erleben.klang.musik#1, karte2.erleben.bild.nacht#1, karte2.erleben.bild.nacht#2, karte2.erleben.bild.nacht#3.

**Heute im Spiel:** Stimmen-Deckel 7, Spitzen-Wand, Musik-Duck −10 dB fürs Gespräch (klang-core.js:378-384); RT60 von vier Räumen
headless gemessen; Verkehr K-nah (stamm/klang.js:1092-1110 laut Karte); 568 Leuchtquellen erzeugt, Feuer-Wurf gebaut (Kontrast 1,47);
Grille nach Dolbear (klang-core.js:494-501, 945). Die Klang-Stationen fahren an der Wiese (Front-Tafel: „Wiese im Regen“, 0 Wagen).

**Fehlt:** Menschenstimme aus dem Leib (BEANSPRUCHT w28-klang-leib); der Markt als Hörort der Stationen; Kratzen, Gleiten, Bruch.

**Wo das Gesetz lebt:** klang-core.js (MUSIK.duck :378, Stimmen-Deckel :417, UMWELT :494), stamm/klang.js, stamm/stoff-material.js:3849
(Licht-Pool), stamm/bild-schatten.js:383-391 (Feuer-Wurf).

**ERSTE Welle S3:** *Chokepoint: der Hörort der Klang-Stationen in k2-erleben.js (getuemmel, landschaft, raum: `L.ort("wiese")` →
stadt-voll). Es stirbt die Wiese im Regen als Messort für Gedränge und Verkehr, dazu die erfundene Duck-Obergrenze 12 dB (R9).* An der
Front ehrlich: **+1 unsicher** (getuemmel#1, wenn die 10 Minuten Hördauer in den Preis-Lauf gehen); landschaft#2 bleibt rot (5 Biome × Tag/Nacht
× Regen), raum#2 bleibt rot (keine Höhle am Markt). **≈ 4 h.** Beweis: Abgriff am Markt über 10 min (7 Stimmen, Spitze ≤ 0 dBFS) und das
Bild vom Markt mit den Wagen im Blick.

**Summe der drei ersten Wellen:** ehrlich 2–3 Sprossen an der Front in ≈ 13 h. Den größten Hebel der Gruppe hat keine Szene: zwei veraltete
Leser (R3, R4), jeder ≈ 1 h.

---

## (b) Richter-Urteil

| # | Station / Linse | Soll wörtlich | Herkunft | Urteil | Grund |
|---|---|---|---|---|---|
| R1 | himmelsmechanik#1 Sprung (g3.js:4294-4295) | „Sprung ≤ 0,1 EV je Uhrschritt über die ganze Bahn, Ego und Third, beide Geräte“ | erfunden | band | Die Zahl hängt an der Schrittweite 0,002 der Uhr. Das Band kommt aus der Ref: tag-ref durch die Kamera fällt −6° → −12° um 0,26 Stufen = 0,03 EV je Schritt (gerechnet), also ≤ 3× Ref-Steigung. Den echten Sprung, wenn die Sonnenscheibe (0,53°) hinter einem Grat hervortritt, muss das Band ausnehmen: diese Linse hielt die Meeus-Sonne draußen (welt-licht.js:807-816). Sie fand aber auch echte Knicke am Boden der Belichtung (welt-licht.js:760-762) — Leser bleibt, Soll wird Band. |
| R2 | himmelsmechanik#1 Sterne (g3.js:4299-4308) | „≥ 10° nichts … ≥ −3° ≤ 3 … ≤ −18° ≥ 5 … halbe Nacht ≤ −6° … γ ≥ 0,8“ | aussen | bleibt | Folgt der Grenzgröße der Dämmerung (Wikipedia Twilight: mag 6 bei −18°, die hellsten in der bürgerlichen). |
| R3 | sternhimmel#2 (k2-kosmos.js:242-244) | „~9 000 Sterne bis mag 6“ · „Zählkurve ±10 % gegen Bright-Star-Katalog“ | aussen (Zählkurve) · Leser veraltet | band | Der Leser liest `geometry.attributes.aMag`, das es in stamm/ und welt-licht.js nicht mehr gibt (Grep leer; die Größen stehen seit kosmos-umfang in `userData.mags`, bild-himmel.js:356-358) → „0 Sterne bis mag 6“ ist ein Fehler der Station. Seine eigene Zeile meldet 8 wandernde Punkte und schreibt dazu „feste Punkte“. Das Band: BSC 9 110 Objekte bis 6,5 mag. Die Zahl im Umfang („9 000 bis mag 6“) passt nicht genau zum Katalog. |
| R4 | bild.himmel#1 (k2-erleben.js:4178-4180) | „Himmels-Leuchtdichte gegen gemessenen Klarhimmel ±0,3 EV“ | aussen · Leser-Grund veraltet | band | „kein geeichtes k“ stimmt nicht mehr: EINHEIT_LX 16 090 (welt-licht.js:71-76) eicht jede Einheit in cd/m². Das Band: mittlerer Klarhimmel 8 kcd/m² (Wikipedia). Für eine Kurve je Sonnenhöhe fehlt eine gelesene Zenit-Tafel (ungeprüft). |
| R5 | bild.himmel#2 (k2-erleben.js:4203-4236) | „Belichtungskurve über 24 h gegen Referenzkurve, max. Abweichung ≤ 0,3 EV“ | aussen | bleibt | USNO Circular 171 / Brown 1952 in spec/farbe/tag-ref.json. |
| R6 | himmelsmechanik#3 (k2-kosmos.js:111) | „Neumond-Nacht ≥ 2 EV dunkler als Vollmond“ | erfunden (zu weich) | band | Die Wirklichkeit liegt bei 4,6–7,2 EV (0,002 gegen 0,05–0,3 lx, Wikipedia Lux). ≥ 2 EV ließe einen halbhellen Neumond durch. |
| R7 | bild.nacht#1 (k2-erleben.js:3856-3861) | „Schatten-Kontrast ≥ 3:1 an einem Pfosten 2 m vom Feuer; Gasse in der Kelvin-Farbe ±200 K“ | gesetz + aussen | bleibt | Bei mondloser Umgebung von 0,002 lx ist 3:1 die weiche Untergrenze. Die Linse fand einen echten Fehler (0,248 → 1,47). Kelvin gegen 1 850 K für Feuer. |
| R8 | bild.auge#1 (g3.js, Front-Tafel Zeile 54) | „zeitliche Pixel-Varianz in ruhenden Bildbereichen ≤ 1 % der Fläche über Schwelle“ (18 Luma) | erfunden | bleibt | Sie fand echtes Flimmern (3,2 %). Die Schwelle 18 Luma und die 1 % haben keine Quelle; Flimmern hat kein Wirklichkeits-Band (das echte Bild flimmert nicht). |
| R9 | getuemmel#1 (Front-Tafel Zeile 55) | „Spitzen ≤ 0 dBFS über 10 min; Duck 8–12 dB bei Stimme“ | erfunden (Duck) · Rahmen (Dauer) | faellt (Duck-Obergrenze) · nur-bericht (10 min) | 13,27 dB statt ≤ 12 ist kein Fehler, den ein Spieler hört, und es gibt keine Quelle. Die 10 Minuten trägt die 60-s-Leiter nie: sie gehören in den Preis-Lauf. 3 statt 7 Stimmen liegen am Messort Wiese im Regen, nicht an der Welt. |
| R10 | klang.raum#2 (Front-Tafel Zeile 204) | „Nachhall paarweise ≥ 1,3× verschieden; hinter Haus/Hang ≥ 6 dB leiser“ · Umfang 4 Raumklassen | erfunden (1,3×, 6 dB) · Rahmen (60 s) | band | Die Welt erfüllt es headless (0,283 · 0,649 · 1,522 · 3,195 s; Haus −11,2 dB); rot hält nur der eine Raum je 60-s-Leiter. Das Band: RT60 je Ort gegen Sabine 0,161 V/(S·a) seiner Geometrie. |
| R11 | klang.landschaft#2 (Front-Tafel Zeile 205) | „Kreuzkorrelation Bild ↔ Ohr ≥ 0,6 je Biom; Wagenpegel ∝ Abstand“ · 20 Wagen | gesetz (Pegel ∝ Abstand) · Rahmen (Messort) | band | 0 Wagen liegen an der Wiese als Messort; stadt/stadt-voll tragen Wagen. Pegel-Band: Pkw 30 km/h in 10 m 65–70 dB. Den Insekten-Takt trägt Dolbear schon im Kern. |
| R12 | wetter.klimazonen#2 (Front-Tafel Zeile 169) | „Baum- und Schneegrenze im Bild auf Erd-Höhe ihrer Breite ±20 %“ (Station: Schnee 2 900, Baum 2 100 m) | aussen (Soll) · unklar (Zahl der Station) | bleibt | Sie fand einen echten Fehler: die Höhe ist gestaucht (0,11 K/m statt Erd-Gradient ≈ 0,0065 K/m, ungeprüft gelesen). Die Station setzt aber Alpen-Werte; am Anker −45,5° gilt die Breite des Ankers (die Zahl für die Südhalbkugel nicht gelesen). |

## (c) Widerspruch — wo die These in dieser Gruppe nicht trägt

1. **Die Eichung ist hier schon geschehen.** Licht und Kosmos messen bereits gegen äußere Quellen (USNO 171, Koschmieder, Grenzgröße, Meeus,
   Bortle, Kyba). Von 12 Richtern sind nur 4 erfundene Schwellen (R1, R6, R8, R9). Rot hält vor allem **fehlende Mechanik**: der Mond ohne
   Bahn, das Wetter aus drei Sinus-Wellen, keine Stimme, keine Meteore, kein Galaxie-Band. Eine Referenz-Szene liefert Bänder, aber keinen
   Macher.
2. **Der Erd-Samen ist kein Abbild der Erde.** Er trägt Erd-Parameter, keine Erd-Geografie (planet-core.js:264), und die Kosmos-Funktion
   würfelt einen Saat-Himmel statt Hipparcos. Für den Himmel genügt das (Breite × Datum × Uhr). Ein Sternbild-Vergleich mit Orion oder ein
   Foto-Vergleich eines bestimmten Orts ist aber nicht möglich, nur die Statistik (Zählkurve, NELM). Der „korrekte Ort“ ist in dieser Gruppe
   ein Zustand (Breite, Tag, Uhr, Wetter), kein Kolosseum.
3. **Punkte gibt nur die Front.** S1 richtet 13 Sprossen, aber drei davon stehen in derselben Leiter hintereinander (himmelsmechanik#1–#3).
   Ohne #1 bringen #2 und #3 null. Ehrlich bringen die drei Szenen in der ersten Welle 2–3 Sprossen.
4. **Wo die These trägt, ist der Täter benennbar und klein:** veraltete Leser (R3 aMag, R4 „kein k“), der Rahmen der Stationen (60-s-Leiter,
   R9 und R10) und der Messort (Wiese im Regen als Hörort, R9 und R11). Diese Schärfe auf das Falsche heilt der Messort der Szene. Die
   deutlichste Bestätigung ist R1: eine Schwelle je Uhrschritt hielt eine physikalisch richtige Sonne wochenlang aus main, weil die Wirklichkeit
   hinter einem Grat selbst springt.
5. **Klang hat keine Daten-Szene im Spiel.** Pegel, RT60, Formanten und Dolbear sind Zahlen, also Bänder. FAD, Jury und Blindtest
   (ereignis#3, landschaft#4, stimme#2) brauchen aber einen Korpus von Aufnahmen oder ein Panel. Aufnahmen sind Assets, die nach dem Gesetz
   nie kopiert werden; siehe die Decke ohne Panel.

## (d) Nicht gelesen

k2-planet.js (die Wetter-Stationen nur über die Front-Tafel); g3.js außerhalb von :4176-4310 (auge#1, nacht); stamm/klang.js trefferTon
und schrittBand; foundry-core ATMO_GESETZ; SKILL.md „Die Quelle je Domäne“; licht-linsen.cjs tagKurve; der Zweig w28-licht-stetig (was
er am Sprung ändert); bild-himmel.js Mond :2588-2800; die Primär-PDFs (NREL SPA, USNO Circular 171, CIE-Klarhimmel / Hosek-Wilkie /
Bruneton, ISO 9613-1, ISCCP-Daten, Peterson & Barney). Die Zahl der gebuchten Sprossen meiner Leitern ist aus den Front-Positionen der
Tafel abgeleitet (die Tafel sagt 103, die Stand-Datei 105); meisterkarte-2.json trägt den Stand vom 14.11. Den Täter des Sprungs 0,369 EV
habe ich nicht im Code verfolgt (die Sonne bei −8,6° ist gerechnet, die Ursache ungeprüft).
