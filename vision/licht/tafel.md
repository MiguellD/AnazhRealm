# DIE TAFEL DES LICHTS — bereinigt aus den acht Zensus-Blättern (a–h)

Stand: Arbeitsbaum `strahler-leuchte` = 2ce8a033d, nur gelesen und gerechnet. Die Tafel kommt aus EINER Quelle:
`vision-licht/tafel-daten.cjs` (Datensatz) → `zaehle.cjs` (Zählung, Markdown). Die Nachrechnungen stehen in `rechnung.cjs` und
`fenster.cjs`, ihre Ausgaben in `rechnung.out.txt`, `fenster.out.txt` und `zaehle.out.txt`.

**Gegengelesen** (zweite Hand, nur gelesen und gerechnet): zehn Zeilen kamen dazu, sieben Zeilen wurden berichtigt (S2, N32, A21, Q2, L8, L11, X11), die Zahlen in
Abschnitt 2 sind neu gezählt. Jeder Fund steht mit „was stand, was gilt, datei:zeile“ in `tafel-gegenlese.md`. Der Stand vor der
Gegenlese liegt in `tafel.vor-gegenlese.md`, `tafel-daten.vor-gegenlese.cjs` und `zaehle.vor-gegenlese.out.txt`.

**Zählweise.** Eine **Zeile** ist eine benannte Größe, also eine Konstante oder ein Objekt mit Feldern gleicher Herkunft. **n** ist die
Zahl ihrer benannten Felder. Status:
- **FOLGT**: aus Physik oder einer anderen Größe gerechnet.
- **GESETZT mit Anker**: Physik, Norm, Literatur oder eine fremde Messung.
- **GESETZT, Anker eigenes Bild**: Look- oder Gerätemessung am eigenen Bild. Das ist kein photometrischer Anker.
- **GESETZT ohne Anker**.
- **ohne Leser**: in der Welt liest die Größe niemand.

Dazu zwei Marken: *Technik* (Auflösung, Takt, Schritte; trägt kein Lichtmaß) und *Kosmetik* (Bloom, Godray, Schärfe).
**„an der Quelle gelesen“** heißt: in dieser Welle selbst in `datei:zeile` nachgelesen. Ohne Marke ist die Zeile ein Bericht der Blätter.

Kürzel: WL welt-licht.js · FC fachwerk-core.js · FO foundry-core.js · PH phyto-core.js · GC gelaende-core.js · DK stamm/dirigent-kern.js ·
BH stamm/bild-himmel.js · BK stamm/bild-kosten.js · BS stamm/bild-schatten.js · BSI stamm/bild-sicht.js · SM stamm/stoff-material.js ·
SS stamm/studio-stoff.js · SW stamm/siedlung-wege.js · FB stamm/feld-brand.js · FL stamm/feld-leben.js · DA stamm/dirigent-ankunft.js ·
SD stamm/stoff-dach.js · SK stamm/stoff-karte.js · SI stamm/stoff-instanz.js · PC porta-core.js · VC vehicle-core.js ·
FW worlds/fachwerk/fachwerk.js.

## 1. Jede Größe einmal

Die Spalte „Blätter“ nennt die Zeilen der Blätter, die in dieser Zeile zusammenfielen (Buchstabe des Blatts und dessen Zeilennummer).
„— (kein Blatt; Gegenlese)“ heißt: kein Blatt las diese Größe, die Gegenlese fand sie im Baum.

### 1 Sonne · Atmosphäre · Wetter

| # | Name | Wert | Einheit | Anker | Def | Leser | Status | n | Blätter |
|---|---|---|---|---|---|---|---|---|---|
| S1 | KEY_BASE | 2,6 | Stellwert ohne Einheit | r128-Studio-Rig („Mittag ≈ 2.6·0.913“, Ziel dir/(amb+hemi) ≈ 15:1) | WL:49 | WL:783,789; BH:1889 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | a S1 · d 23 · f 1 · h B1 |
| S2 | LEGACY_LICHT | π | Faktor | three r155 (1/π-BRDF) | WL:53 | WL:783,789; BH:1889,2092; FW:652; DK:2012 (Augen-Licht: BH:2092 teilt durch π, DK:2012 multipliziert zurück — Hin und Rück ohne Wirkung) | GESETZT mit Anker · *an der Quelle gelesen* | 1 | a S2 · d 24 · f 2 · h B2 |
| S3 | E0 = KEY_BASE·π·lightIntensity | 8,168 (klarer Mittag) | Welt-Einheit | aus S1·S2 | WL:788-790 | BH:1506,1621-1628 | FOLGT | 1 | a S3 · d 25 |
| S4 | Richtlicht Sonne dl.intensity | KEY_BASE·π·lum·lightIntensity·direkt | Welt-Einheit | Durchlass Hillaire × S1 | BH:1889 | r184 jeder Standard-Stoff; BSI:2744; BH:2566 | FOLGT · *an der Quelle gelesen* | 1 | a W1 · d W1 · f 3 · h B3 |
| S5 | WX_LICHT sockel · sonne · direktHoch · himmelHub · himmelGrau (→ lightMul, direkt, grau) | 0,35 · 0,65 · 3 · 0,35 · 0,82 | Stellwert ohne Einheit | keiner | PH:4302 → stamm/daten.js:22-28 | BH:1194-1203,1889,1897,2492,1757 | **GESETZT ohne Anker** | 5 | a S4 · d 43 |
| S6 | WX_GESETZ fog · sun · grey · rain (5 Wetter-Zeilen) | z. B. klar 0,15/1/0/0 · sturm 0,7/0,15/0,88/1 | Stellwert ohne Einheit | Labor-Presets | PH:4287-4294 | BH:2274-2277; daten.js:22-28; dirigent-takt.js:2530 | **GESETZT ohne Anker** | 4 | d 42 |
| S7 | WEATHER_INTENSITY (→ cloudCover) | 0 · 0,45 · 0,8 · 1 · 1,35 | Stellwert ohne Einheit | keiner | stamm/daten.js:42 | BH:1764,2816-2817,2874 | **GESETZT ohne Anker** | 1 | d 44 |
| S8 | WEATHER_GREY_K | 0,7 | Stellwert ohne Einheit | „Browser-tunbar“ | stamm/daten.js:130 | BH:1290 | **GESETZT ohne Anker** | 1 | d 45 |
| S9 | WEATHER_TRANSITION | 45 | s | keiner (Zeitplan) | stamm/daten.js:144 | Wetter-Übergang | **GESETZT ohne Anker** | 1 | d §3 |
| S10 | Gefühls- und Aura-Tönung (joy/sorrow auf lightIntensity, auraTintStrength, ~18 Beiwerte) | 0,15 · 0,2 · 0,3 … | Stellwert ohne Einheit | keiner | BH:1216-1281 | BH:1303-1305 → U.toenung, E0 | **GESETZT ohne Anker** | 18 | a S5 · d 55 |
| S11 | Tönungs-Nenner _studioSky.top | 0x6a9ed0 | sRGB-Ton | Look | FO:115 | BH:1207-1208,1755-1756,2468-2470 | **GESETZT ohne Anker** | 1 | d 54 |
| S12 | Tönungs-Klammer | [0, 4] | Faktor | keiner | BH:1755 | BH:1756 | **GESETZT ohne Anker** · Technik | 1 | d 56 |
| S13 | ATMO erdeM / randM | 6 360 / 6 460 km | m | Bruneton/Hillaire | FO:291 | FO:343-344; WL:297-298 | GESETZT mit Anker | 2 | a A1 · d 1 |
| S14 | rayleighH | 8 000 | m | Physik | FO:292 | FO:327 | GESETZT mit Anker | 1 | a A2 · d 2 |
| S15 | rayleighTiefe | [0,044 0,1 0,23] | optische Tiefe | Bucholtz 1995 | FO:293 | FO:329,346; BH:1416 | GESETZT mit Anker | 1 | a A3 · d 3 |
| S16 | rayleighTiefe „ferne“ | [0,13 0,085 0,05] | optische Tiefe | keiner („roter Staub“) | stamm/daten.js:91 | BH:1413-1416 | **GESETZT ohne Anker** | 1 | d 4 |
| S17 | wellenNm | [680 550 440] | nm | Konvention der Kanäle | FO:294 | FO:336-341 | GESETZT mit Anker | 1 | a A4 · d 5 |
| S18 | mieG · mieAngstroem | 0,7 · 1,3 | ohne Einheit | AERONET (Dubovik 2002) | FO:299-300 | FO:337,340,350 | GESETZT mit Anker | 2 | a A5,A6 · d 6,7 |
| S19 | mieAlbedo | 0,9 | ohne Einheit | keiner | FO:301 | FO:340 | **GESETZT ohne Anker** | 1 | a A7 · d 8 |
| S20 | ozon mitte · halb · absorption | 25 / 15 km · [0,65 1,881 0,085]e-6 | m · 1/m | Hillaire (Kopf), keine Zahl-Quelle | FO:302 | FO:351-355,376 | GESETZT mit Anker | 3 | a A8 · d 9 |
| S21 | luft.sichtKlarM · sichtSturmM | 20 000 · 1 500 | m | Beobachtung ohne Zitat („Silhouetten 20 km“) | FO:305 | FO:324; BH:2274-2275 | GESETZT mit Anker · *an der Quelle gelesen* | 2 | a A9,A10 · d 10,11 |
| S22 | luft.betaRayleigh | 1,16e-5 | 1/m | Rayleigh 550 nm | FO:305 | FO:328,334; BH:2274-2277 | GESETZT mit Anker · *an der Quelle gelesen* | 1 | a A11 · d 12 |
| S23 | luft.kontrast | 0,02 | ohne Einheit | Koschmieder | FO:305 | FO:324; BH:2273,2303 | GESETZT mit Anker · *an der Quelle gelesen* | 1 | a A12 · d 13 |
| S24 | luft.skalenHoeheM | 1 000 | m | Grenzschicht (Größenordnung) | FO:305 | FO:347; BH:2330,2540 | GESETZT mit Anker · *an der Quelle gelesen* | 1 | a A13 · d 14 |
| S25 | Dunst- und Regen-Koeffizient | 1,2267e-3 · 1,7378e-3 | 1/m je fog/rain | aus S21–S23 und S6 | BH:2274-2275 | BH:2277 | FOLGT · *an der Quelle gelesen* | 2 | d 46,47 |
| S26 | β je Wetter-Wort | klar 1,96e-4 … sturm 2,61e-3 (Nebel 3,16 km Sicht) | 1/m | aus S25 | BH:2270-2278 | BH:1475,2304,2539 | FOLGT | 1 | d 48 |
| S27 | durchlassSchritte · ATMO_LUT mediumStufe/flug · SKY_ENV_REGEN_MIN_MS · luftProben | 40 · 0,02/8 · 500 ms · 8 | Schritte · log β · ms | Auflösung | FO:313; WL:26-27; BH:3414; DA:1965 | WL:34; BH:1438,1474,692,2380 | **GESETZT ohne Anker** · Technik | 5 | a A14 · d 20,57,58,59 |
| S28 | ATMO_BODEN | [0,1003 0,1385 0,0449] | Albedo linear | Albedo-Tafel (gemessen) | WL:39 | WL:780,1214; BH:1428; garage.js:48; schmiede.js:25 | GESETZT mit Anker | 1 | a B1 · d 21 · h B10 |
| S29 | ATMO_ERDE | 0,1236 | Albedo | Luma von S28 | WL:44-46 | WL:311 | FOLGT · *an der Quelle gelesen* | 1 | a B2 · d 22 |
| S30 | sonnenRichtung (z = sin(w/2)·0,4; Mittag 74,2°) | — | Richtung | gesetzt; Meeus „OFFEN“ | WL:806-812 | BH:1376-1378; WL:1216 | **GESETZT ohne Anker** | 1 | a T1 |
| S31 | Wolke: hoeheM · g · tauJeMenge | 800 m · 0,85 · 100 | m · ohne Einheit · τ | Kumulus-Basis, Mie, „Kumulus 20–100“ | WL:963,973,974 | WL:1050,1111,1127-1128; BH:138,175 | GESETZT mit Anker | 3 | d 34,35,36 · e 1e hoeheM |
| S32 | Wolke: deckung | [0,12 · 0,9] | Deckung | Look („0,32 las schon bewölkt“) | WL:970 | BH:151,1763-1764; WL:1268,1330 | **GESETZT ohne Anker** | 1 | d 37 · e 1e |
| S33 | Wolke: steilMin · mittelMin · karte · zelleM · zugS · rand | 0,05 · 0,05 · 512 · 16 m · 0,1 s · 0,8 | — | keiner | WL:964-969 | BH:117,137,176-183,209-221 | **GESETZT ohne Anker** · Technik | 6 | d 38,39 · e 1e |
| S34 | HIMMEL_GESETZ Wolken-Look (17 Felder) | projY 0,16 … deck 0,92 | Stellwert ohne Einheit | Studio-Look | FO:125-140 | WL:1022-1052,1097-1105 | **GESETZT ohne Anker** | 17 | d 40 |
| S35 | HIMMEL_GESETZ drift · drift2 · grad | — | — | — | FO:128-129,139 | ohne Leser in der Welt | **ohne Leser** | 3 | d 41 |
| S36 | Godray density · threshold · Abklang · schritte · skala · Tor | 0,55 · 0,8 · 0,96^i · 20 · 0,25 · smoothstep(WX.sun) | Stellwert ohne Einheit | GPU Gems 3 (Methode), Zahlen keiner | BK:2356-2357,1602,3033; BH:1391-1398 | BK:1583-1622; dirigent-takt.js:2531 | **GESETZT ohne Anker** · Kosmetik | 6 | d 67,68 · g 37-40 |
| S37 | REGEN_GESETZ farbe · deckung | 0xbcd2e2 · 0,72 | sRGB · Anteil | Labor | FO:203-204 | BH:1040,1093 | **GESETZT ohne Anker** | 2 | d 65 · f 58 |
| S38 | RAUCH_BILD deckMax · dunkel · woelbung · profil | 0,995 · 0,8 · 1,5 · 2 | ohne Einheit | keiner | stamm/siedlung-bewohner.js:3869-3882 | ebd. :228,254,262,264 | **GESETZT ohne Anker** | 4 | d 66 |
| S39 | WASSER_GESETZ.koerper kd · c | je Kanal see/fluss/bach | 1/m | Pope & Fry 1997, Zaneveld 2003 | FO:179 | BH:2524-2536 | GESETZT mit Anker | 2 | d 64 |
| S40 | DSL-Himmelstönung skybox_color: SKY_TINT_MAX · Farb-Lerp · Stärke-Rampe · Abklang | 0,6 · 0,08 · 0,12 · 0,001 je Bild | Stellwert ohne Einheit | keiner (ungültige Farbe still verworfen, feld-dsl.js:1007-1008) | stamm/feld-dsl.js:996-1009,2481; BH:1739-1746 | BH:1746 → himmelTint → U.toenung BH:1756 (Kuppel, Umgebung, E0-Tönung) | **GESETZT ohne Anker** · *an der Quelle gelesen* | 4 | — (kein Blatt; Gegenlese) |

### 2 Nacht · Mond · Sterne · Tag-Achse · Ersatz-Lichter

| # | Name | Wert | Einheit | Anker | Def | Leser | Status | n | Blätter |
|---|---|---|---|---|---|---|---|---|---|
| N1 | MOND_STAERKE (MOONLIGHT.intensity) | 0,65 | Welt-Einheit | Bild-Luma „Boden ≥ 22“ (Radeon), kein Lichtmaß | WL:169 | WL:172,207,1232; BH:1624,1897 | GESETZT, Anker eigenes Bild · *an der Quelle gelesen* | 1 | a M1 · d 27 · f 4 · g 9 |
| N2 | MOND_E | 0,462 | Welt-Einheit | N1 × Luma 0x9fb8dc (roh als linear) | WL:172 | WL:180,225-226 | FOLGT · *an der Quelle gelesen* | 1 | a M2 · d 28 · g 9 |
| N3 | nachtKnotenE (Boden des Messers) | = MOND_E 0,462 | Welt-Einheit | aus N2 | WL:180 | WL:772 | FOLGT · *an der Quelle gelesen* | 1 | a AU6 · g 9 |
| N4 | nacht.mond (Ton) | 0x9fb8dc | sRGB-Ton | „Purkinje“ ohne Messung | FO:312 | WL:172,204-206; FO:393-395 | **GESETZT ohne Anker** | 1 | a N3 · d 17 |
| N5 | nacht.himmel (Ton) | 0x0d1931 | sRGB-Ton | an der alten Nacht ×1,3 geeicht | FO:312 | WL:228; BH:2467-2470 | GESETZT, Anker eigenes Bild | 1 | a N4 · d 18 |
| N6 | nacht.skala | 0,16 | sin Höhe | keiner | FO:312 | FO:390 | **GESETZT ohne Anker** | 1 | a N1 · d 15 |
| N7 | nacht.lum | 0,06 | Stellwert ohne Einheit | keiner | FO:312 | Welt: ungelesen (nur phytogenesis.js:3487) | **ohne Leser** | 1 | a N2 · d 16 |
| N8 | nacht.glutHoeheM | 90 000 | m | Airglow-Schicht | FO:312 | WL:611 | GESETZT mit Anker | 1 | a N5 · d 19 |
| N9 | mondRichtung = −Sonne (immer Vollmond) | — | Richtung | gesetzt, keine Phase | WL:815-817; Kopie BH:1150 | BH:2619; WL:1217 | **GESETZT ohne Anker** | 1 | a M3 · a Z15 |
| N10 | U.mondE · _mondDurchlass | 0,65·lightMul/E0 · Durchlass/Zenit | Bruchteil von E0 | aus N1 · Hillaire | BH:1623-1625,1798-1807 | WL:650,915; BH:1897 | FOLGT | 2 | a M4,M5 · d W11 |
| N11 | STERNENLICHT.leuchtdichte | MOND_E·0,0005/0,3965/π = 1,855e-4 | Welt-Leuchtdichte (LINEAR, nicht auf S) | USNO Circ. 171 (Verhältnis von Hand kopiert) | WL:225 | WL:239 → BH:1515-1520 → U.nachtE | FOLGT · *an der Quelle gelesen* | 1 | a ST1 · d 29 |
| N12 | STERNENLICHT.daemmer | MOND_E/π = 0,147 | Welt-Leuchtdichte | „bei −6° so viel wie der Vollmond“ — REF sagt 3,01 lx = 7,6 × Vollmond | WL:226 | WL:239 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | a ST2 · d 30 |
| N13 | DAEMMER_ENDE | tagAchse(sin −6°).daemmerung | ohne Einheit | aus N14 | WL:236 | WL:239 | FOLGT · *an der Quelle gelesen* | 1 | a ST3 |
| N14 | GRENZGROESSE (6 Knoten) | [10 −5] … [−18 6] | Grad · Größenklasse | Dämmerungs-Definitionen; drei Tag-Knoten gesetzt | WL:187-196 | WL:823-850; BH:3340 | GESETZT mit Anker · *an der Quelle gelesen* | 1 | a T2 · d 33 · g §3.3 |
| N15 | tagAchse.nacht (smoothstep 0 … sin −6°) | 0…1 | ohne Einheit | bürgerliche Dämmerung, Form gesetzt (Zeitplan) | WL:844,853 | BH:1396,2251,2492; WL:239; stamm/klang.js:2066 | GESETZT mit Anker | 1 | a T3 · d 31 |
| N16 | tagAchse.tag / nachtGrad (linear 0° … −32°) | −32 | Grad | keiner (astronomische Nacht −18°) | WL:182,851 | BH:1904 (nightFactor) | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | a T4 · g 11 |
| N17 | tagAchse.hell | 0,045 + 0,955·smoothstep((s+0,18)/0,6) | ohne Einheit | keiner | WL:838,854 | BH:2624-2625 | **GESETZT ohne Anker** | 1 | a T5 · d 32 |
| N18 | tagAchse.daemmerung | aus N14 | 0…1 | folgt | WL:850 | WL:238,1219 | FOLGT | 1 | a T6 |
| N19 | Ambient der Nacht | 0,04 · nacht | Welt-Einheit | Bild (Stadt 00 Uhr, Wand 3:1) | BH:2251 | r184 jeder Stoff; BSI:2747; BH:2228 | GESETZT, Anker eigenes Bild · *an der Quelle gelesen* | 1 | a E1 · d 52 · f 5 |
| N20 | Ambient-Gefühl (auch am Tag, nicht × nacht) | joy 0,08 · awe 0,05 · sorrow −0,04 | Welt-Einheit | keiner | BH:2252 | DK:1572-1589 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 3 | a E2 · d 52 · f 6 |
| N21 | Hemi der Nacht | 0,1 · nacht · lightMul | Welt-Einheit | Look („eigen getuned“), ohne Messzahl | BH:2492 | r184; BSI:2749-2756; BH:2227 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | a E3 · d 49 · f 7 |
| N22 | Hemi-Boden | 0x463c2e | sRGB-Ton | Vorlage phytogenesis | BH:2471 | BH:2489; BSI:2752 | **GESETZT ohne Anker** | 1 | a E4 · d 50 · f 8 |
| N23 | Hemi-Himmel | nacht.himmel × Tönung | linear | aus N5 | BH:2470 | BSI:2751 | FOLGT | 1 | d 51 · f 9 |
| N24 | Boot-Saat Ambient / Hemi | 0,6 · 0x88a0c8 · 0x3a2818 · 0,55 | — | „nur Saat“ | DA:356,455 | vor dem ersten Licht überschrieben | **ohne Leser** | 4 | d 53 |
| N25 | HIMMEL.sonneLeucht (Scheibe, Farbe fest 1/0,92/0,7) | 4 | Stellwert ohne Einheit | keiner | BH:3355,2612-2613 | Sonnen-Mesh | **GESETZT ohne Anker** | 1 | a K1 |
| N26 | HIMMEL.sonneWinkelGrad | 0,53 | ° | Physik | BH:3354 | DA:323 | GESETZT mit Anker | 1 | a K2 |
| N27 | HIMMEL.koerperAbstandM | 380 | m | Geometrie | BH:3353 | BH:2596; DA:323 | **GESETZT ohne Anker** · Technik | 1 | a K3 |
| N28 | Mondscheibe Radius · Farbe · Deckung | 9 m (2,71°) · 0xd0d4e0 · 0,9/0,98 | m · sRGB | keiner | DA:339-347 | BH:2625 | **GESETZT ohne Anker** | 3 | a K4 |
| N29 | HIMMEL.mondGegenHimmel | 0,5 | Verhältnis | „≈ 2 500 : 5 000 cd/m²“ ohne Zitat | BH:3349 | BH:2625 | **GESETZT ohne Anker** | 1 | a K5 |
| N30 | Sterne sternMagSchwach · sternZaehlung · wandelsterne | 6 · 0,47 · −4,2/−2,3/−1,0 | Größenklasse | Physik | BH:3341-3348 | BH:317,375,3361,3365 | GESETZT mit Anker | 3 | a K6,K7,K10 |
| N31 | sternKontrast · Sternfeld (2 800 Punkte, 3–6,5 px, Alpha × skyMul) | 0,6 | Stellwert ohne Einheit | keiner | BH:3343,318-376 | BH:386,410-411,1789 | **GESETZT ohne Anker** | 2 | a K8,K9 |
| N32 | tag-ref.json (16 Zeilen Sonnenhöhe → lx) | 123 790 … 0,397 | lx | USNO Circular 171 / Brown 1952 | spec/farbe/tag-ref.json | nur Linse licht-linsen.cjs:1228,1320 — die Welt liest die Datei nicht, trägt aber Handkopien (WL:179 −0,87/−2,17 aus der Spalte stufen; WL:225 0,0005/0,3965); die Spalte stufen ist selbst die Kamera der Welt (zirkulär) | **ohne Leser** | 1 | a R1 · h tag-ref |
| N33 | Aura-Tönung des Hemi-Bodens (lebendig 0,15/0,25 · glut 0,35/0,1 · magie 0,15/0,3) | 6 Beiwerte, × auraK (Vorgabe 0) | Stellwert ohne Einheit | keiner | BH:2474-2486 | BH:2489 (hl.groundColor) — derselbe tint.auraK fällt hier auf 0, in BH:1745 auf 1 zurück | **GESETZT ohne Anker** · *an der Quelle gelesen* | 6 | — (kein Blatt; Gegenlese) |

### 3 Das Auge · Belichtung · Tonkurve · Post

| # | Name | Wert | Einheit | Anker | Def | Leser | Status | n | Blätter |
|---|---|---|---|---|---|---|---|---|---|
| A1 | AUGE.welt | 7,83 | Welt-Einheit | Messung `werkbank licht --uhr 0.5`, als Konstante kopiert | WL:89 | WL:94,105; DK:1619; SM:714; FW:666 | GESETZT, Anker eigenes Bild · *an der Quelle gelesen* | 1 | a AU1 · d 26 · f 16 · g 16 |
| A2 | AUGE.lux | 115 000 | lx | keiner („Mittag der Mess-Wiese“; REF bei 74,2° ≈ 117 170) | WL:90 | WL:94,105; DK:1619; SM:714 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | a AU2 · d 26 · f 16 · g 17 |
| A3 | AUGE.p | 0,2 | Exponent | ln 13,1 / ln 385 000 — 13,1 ist selbst Folge von S1 und N1 (zirkulär) | WL:85 | WL:94,105; SM:2364,714; DK:1619 | FOLGT · *an der Quelle gelesen* | 1 | a AU3 · f 14 · g 12 |
| A4 | AUGE.q | 0,42 | Exponent | CIE L*, Feld 0,30–0,42, Randwert | WL:86 | WL:123,146; SM:2363 | GESETZT mit Anker · *an der Quelle gelesen* | 1 | f 15 · g 13 |
| A5 | AUGE.anteil | 0,25 | Anteil | Gasse k 1,14/0,96/0,84 (eigenes Bild) | WL:87 | WL:137 | GESETZT, Anker eigenes Bild · *an der Quelle gelesen* | 1 | f 19 · g 14 |
| A6 | AUGE.eps | 0,1 | Anteil | keiner | WL:91 | WL:146 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | f 18 · g 18 · c Übergabe |
| A7 | AUGE.saum | 0,3 | Anteil der Reichweite | keiner | WL:92 | SM:2446; BS:496 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | f 17 · g 19 |
| A8 | MESOPISCH staebchenCd · zapfenCd · karte | 0,005 · 5 · 0,18 | cd/m² · cd/m² · Albedo | CIE 191:2010 · 18-%-Karte | WL:83 | WL:88; BK:2211,2213 | GESETZT mit Anker · *an der Quelle gelesen* | 3 | a AU4 · g 20-22 |
| A9 | zustandMinLux | 0,0873 | lx | aus A8 | WL:88 | WL:117 | FOLGT · *an der Quelle gelesen* | 1 | a AU4 · g 15 |
| A10 | NACHT_AUGE.luxJeEinheit | 0,26/0,224 = 1,161 | lx je Welt-Einheit (linear) | „0,224 fachwerk LICHT_GESETZ“ — dort nicht auffindbar; Nacht heute 0,598 | BK:3011 | BK:2211 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | a AU5 · g 23 |
| A11 | NACHT_AUGE.bildZapfen | [0,18 ; 1] | k·L | „Mittelgrau bis Weiß“ — 0,18 ist der Wert NACH der Kurve, die Schwelle liest VOR ihr | BK:3014 | BK:2218 | **GESETZT ohne Anker** | 1 | g 24 |
| A12 | NACHT_AUGE.skotopisch | [0 ; 0,5437 ; 0,3599] | Gewichte | V′ nach Pattanaik 1998 | BK:3015 | BK:2225 | FOLGT | 1 | g 25 |
| A13 | NACHT_AUGE.staebchenStaerke · umkehrSchritte | 1,22 · 3 | Faktor · Anzahl | Boden S0 Luma 24,1 (eigenes Bild) · Linse (j) | BK:3016-3017 | BK:2225,2245 | GESETZT, Anker eigenes Bild · *an der Quelle gelesen* | 2 | g 26,27 |
| A14 | BELICHTUNG.kurve | NeutralToneMapping | — | Khronos PBR Neutral; Wahl gegen ACES/AgX am Bild (Radeon 15.10.) | WL:174 | DA:167; WL:1305,1406 | GESETZT mit Anker · *an der Quelle gelesen* | 1 | g 1 · h B8 |
| A15 | Neutral startCompression · desaturation · Fuß | 0,76 · 0,15 · 0,08/6,25/0,04 | k·L · Faktor | Khronos (Vendor `mT`) | vendor/three.webgpu.min.js (mT) | Ausgabe-Knoten | GESETZT mit Anker · *an der Quelle gelesen* | 3 | g 28,29,30 |
| A16 | Ausgabe-Farbraum | sRGB | — | Norm | Renderer-Vorgabe; WL:1306 | Ausgabe-Quad | GESETZT mit Anker | 1 | g 31 |
| A17 | zielKarte | 0,22 | k·L | Umkehr von Neutral: 18-%-Karte → sRGB 118 | WL:175 | WL:773; BH:2109 | FOLGT · *an der Quelle gelesen* | 1 | g 2 · h B6 |
| A18 | BELICHTUNG.min | 0,05 | k | „Wand gegen entartetes Licht“ | WL:176 | WL:773 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | a Z13 · g 3 |
| A19 | BELICHTUNG.steigung | 0,75 | ohne Einheit | Frostbite qualitativ, Folge am eigenen Bild | WL:177 | WL:755; BH:2018 | GESETZT, Anker eigenes Bild · *an der Quelle gelesen* | 1 | g 4 · h B7 |
| A20 | BELICHTUNG.gleitung | [12° ; 8°] | Grad | keiner | WL:178 | WL:753; BH:1974,2105 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 2 | g 5,6 · h B7 |
| A21 | BELICHTUNG.stufen, Knoten der Nacht | (−20°, −2,17) | Grad · EV | eigenes Bild (Nacht Luma 44, BH:3403-3404) | WL:179 | WL:744-751; BH:2018,2106 | GESETZT, Anker eigenes Bild · *an der Quelle gelesen* | 1 | g 8 · h B7 |
| A27 | BELICHTUNG.stufen, Knoten der Dämmerung | (10°, −0,87) | Grad · EV | = (1 − steigung) · log2(11 080 ÷ 123 790), tag-ref 10° gegen 90° (gerechnet −0,870): die Steigung des Tags am Knoten | WL:179 | WL:744-751; BH:2018,2106 | FOLGT · *an der Quelle gelesen* | 1 | g 7 · h B7 |
| A22 | nachtKnotenGrad | −6 | Grad | bürgerliche Dämmerung | WL:181 | WL:771 | GESETZT mit Anker · *an der Quelle gelesen* | 1 | g 10 |
| A23 | Start-Belichtung | 1,0 | k | Startwert | DA:168 | bis zum ersten BH:1939 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | g 50 |
| A24 | Ersatz ohne Lesung `_augeLux ?? 1` · `_augeMass ?? 1` · k-Ersatz 1 | 1 lx · 1 · 1 | lx · — · k | keiner (fail-soft) | DK:1621,1623,1629,1849; BS:503; BH:2071 | dort | **GESETZT ohne Anker** · *an der Quelle gelesen* | 3 | b 46 · g 51,52 · g §3.9 |
| A25 | Bloom threshold · strength · radius/px · Breite · Gewichte | 0,86 · 0,38 · 2,2/0,0018 · 0,25 · 0,227/0,094/0,056 | Welt-Luminanz VOR k · Faktor · UV | keiner | BK:2338-2340,2421-2441 | BK:2421-2442 | **GESETZT ohne Anker** · Kosmetik | 7 | g 32-36 |
| A26 | localContrast · ZEIT_SCHAERFE · SZENE_SKALA · ZEIT_KERN · ZEIT_GAMMA_RUHE | 0/0,0026 · 1 · 0,75 · 7 · 1,25 | — | Kosten/Regler | BK:2345-2349,3021,3025-3026; dirigent-takt.js:2703 | BK:2168,2482,1691,1697 | **GESETZT ohne Anker** · Technik · Kosmetik | 6 | g 41-45 |
| A28 | lichtGlut[datum] (Höhe der Glut je Datum, Farbe auf Luma 1) | augeGlut(cdM2, augeLux) · augeMass | Welt-Einheit | aus Q6, L8, L13 durch das Auge | DK:1626-1631 | SM:2142; SS:399 | FOLGT · *an der Quelle gelesen* | 1 | f 22 |
| A29 | lavaGlut | augeGlut(L Ausbruch) · augeMass | Welt-Einheit | Planck × Emissivität (Q10, Q9) durch das Auge | DK:1622 | siedlung-wege.js:546-560 | FOLGT · *an der Quelle gelesen* | 1 | f 23 |

### 4 Raum · Höhle · Augen-Licht

| # | Name | Wert | Einheit | Anker | Def | Leser | Status | n | Blätter |
|---|---|---|---|---|---|---|---|---|---|
| R1 | RAUM kanteM · blendeS · blendeHellS · sprungM | 0,3 · 0,8 s · 0,3 s · 3 m | m · s | keiner | SD:300 | SD:55; BH:2025-2028 | **GESETZT ohne Anker** | 4 | c 35 · d 62 · e 1f · g 46-48 |
| R2 | Raum-Deckel g ≤ 2 · dt ≤ 0,25 s · Ziel ≥ −8,68 EV | — | — · s · EV | keiner | BH:1987,2003,2018 | dort | **GESETZT ohne Anker** | 3 | g 49 · g §3.10 |
| R3 | raumLicht (Tageslicht-Quotient D je Decke) · RAUM_LICHT.himmel | je Haus · 0,5 | Anteil | fachwerk raumLicht (Geometrie) | FC:5998-6071; SD:44-50,194-216 | BSI:718,721; BH:2010-2022 | FOLGT | 2 | c 34 · d 63 · e 1f · f 12 |
| R4 | RAUM_LICHT.kante | 0,35 | m | keiner | FC:5999 | FC:6030,6062 | **GESETZT ohne Anker** | 1 | c 34 |
| R5 | INNEN_DAEMMER | 0,92 | Faktor | Messung 176 vs 60 (eigenes Bild) | FC:2771 | FC:2776 | GESETZT, Anker eigenes Bild | 1 | c 33 |
| R6 | AUGEN_LICHT karteM · abfall · kernM · reichweiteM | 2 · 1 · 8 · 20 | m | Werkbank 11.10. (eigenes Bild) | BH:3285-3288 | BH:2083-2086,2110; DK:1848 | GESETZT, Anker eigenes Bild | 4 | c 36 · d 61 |
| R7 | AUGEN_LICHT kelvin | 4750 | K | Farbort des alten Hex 0xffe2c6 | BH:3289 | DK:1743 | GESETZT, Anker eigenes Bild | 1 | c 37 · d 61 |
| R8 | AUGEN_LICHT umkreisM · neuM | 4 · 0,25 | m | keiner | BH:3290-3291 | BH:2126 ff. | **GESETZT ohne Anker** | 2 | c 38 · d 61 |
| R9 | HIMMELS_SICHT.m · Schritte-Deckel | 3 m · 120/1 % | m · — | keiner | GC:4309,4320 | GC:4315,4321 → aHimmel → SM:2003,2037 | **GESETZT ohne Anker** · Technik | 2 | d 60 · e 1f |

### 5 Quellen: Feuer · Brand · Lava · Stahl (Temperatur-Strahler)

| # | Name | Wert | Einheit | Anker | Def | Leser | Status | n | Blätter |
|---|---|---|---|---|---|---|---|---|---|
| Q1 | LICHT_GESETZ.feuer.kelvin | 2000 | K | „Holzfeuer 1 800–2 000 K“ ohne Quelle | FC:6456 | DK:1903,1923,1930; FW:652,675 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | b 1 |
| Q2 | LICHT_GESETZ.feuer.abfall | 2 | Exponent | 1/d² | FC:6456 | nur Labor FW:655,675 (die Welt liest Q7 STRAHLER.abfall) | GESETZT mit Anker · *an der Quelle gelesen* | 1 | b 2 |
| Q3 | LICHT_GESETZ.feuer.kernM | 0,76 | m (als Ø gelesen) | „wie klang bettRefM“ | FC:6456 | nur Labor FW:652 — Welt ungelesen | **ohne Leser** · *an der Quelle gelesen* | 1 | b 3 · c B5 |
| Q4 | LICHT_GESETZ.feuer.hoeheM | 0,35 | m | keiner | FC:6456 | DK:1903,1911; FW:748 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | b 4 |
| Q5 | feuer.flacker amp · hz · Gewichte 0,6/0,4 | 0,18 · [6,3 9,7] · 0,6/0,4 +2,1p+1,3 | relativ · Hz | „die Flamme atmet in 6–10 Hz“ ohne Quelle | FC:6456,6553 | DK:1838; FW:1052 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 3 | b 5,6,7 |
| Q6 | LICHT_GESETZ.feuer.cdM2 (gemaltes Bett) | 10 000 | cd/m² | keiner, keine Rechnung | FC:6529 | DK:1629 (lichtGlut.feuer); SM:742; FW:666 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | b 8 · c B7 · h Übergabe |
| Q7 | STRAHLER.abfall | 2 | Exponent | 1/d² | FC:6527 | FC:6545 → DK:1712 | GESETZT mit Anker · *an der Quelle gelesen* | 1 | b 9 |
| Q8 | STRAHLER.emissiv.flamme | 0,0012 | ohne Einheit | kalibriert: Ø 0,76 m ≈ 250 cd (Kerze 0,16 lm/W) | FC:6527 | DK:1756; FW:652 | FOLGT · *an der Quelle gelesen* | 1 | b 10 · h Übergabe |
| Q9 | STRAHLER.emissiv.lava · stahl | 0,95 · 0,8 | ohne Einheit | keiner | FC:6527 | DK:1788; SW:602; FL:2575 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 2 | b 11,12 |
| Q10 | leuchtdichte(T) = 683·∫B_λ·V(λ) | 2000 K → 4,57e5 | cd/m² | Planck, CIE 1924 (Gauß-Näherung) | FC:6532-6539 | FC:6542; DK:1788; SW:602 | GESETZT mit Anker · *an der Quelle gelesen* | 1 | b 13 |
| Q11 | lichtFarbe(K) Kim–Kang, Klemme 1 667–25 000 K | 2000 K → [1 0,256 0,008] | linear sRGB | Kim–Kang 2002 · IEC 61966-2-1 | FC:6487-6498 | DK:1743; SW:570; FB:850; FW:650; kampf.js:930 | GESETZT mit Anker · *an der Quelle gelesen* | 1 | b 14 |
| Q12 | GLUT_LUMA (→ __leucht 2,907) | 0,344 | Luma | Farbe 0,75/0,25/0,08, die keine Ecke malt | FC:2107 | FC:2099 → SS:398 | **GESETZT ohne Anker** | 1 | b 15 |
| Q13 | gemalte Glut-Töne Bett/Scheit · FLAMME.ton | 0,30/0,10/0,03 … · R 0,55−0,10t … | linear | keiner (kein kelvin) | FC:7111,7155,11336 | Vertex-Farbe → SS:398; FC:7188 | **GESETZT ohne Anker** | 2 | b 16,17 |
| Q14 | UMWELT.stimmen.glut.bettRefM · klang-Literal 0,4536 | 0,76 m · 0,4536 m² | m · m² | „fachwerk Glutbett Ø 0,76“ (Kopie) | klang-core.js:469,521,524 | DK:1886; klang-core.js:915 | FOLGT · *an der Quelle gelesen* | 2 | b 18,19 |
| Q15 | BRAND.aufS | 4 | s | keiner | FB:946 | FB:564 → DK:1930 | **GESETZT ohne Anker** | 1 | b 20 |
| Q16 | LIFE_FIELD.cell (Deckel der Brand-Fläche r ≤ 8 m) · Brand-Licht-Höhe +1 m | 16 m · 1 m | m | Raster | FL:3074; FB:639 | DK:1922,1929,1931 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 2 | b 21,22 |
| Q17 | BRAND.licht · flamme.schein | 4 · 7,5 | — · Welt-Einheit | — | FB:964,997 | ohne Leser (nur Kommentare DK:1753,1755) | **ohne Leser** · *an der Quelle gelesen* | 2 | b 23,26 · f 32,33 |
| Q18 | BRAND.bild.flamme kelvin · mantel | [3000 · 1700] · 1 | K · — | keiner | FB:994,996 | FB:841,849,894 | **GESETZT ohne Anker** | 2 | b 24,27 · f 31 |
| Q19 | BRAND.bild.flamme.ziel | 1,6 | Bild-Zahl vor der Kurve (÷ k) | keiner | FB:995 | FB:896 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | b 25 · f 30 · g W11 |
| Q20 | T⁴-Gewicht der Flammen-Tafel | (K/3000)⁴ | ohne Einheit | „Stefan–Boltzmann“ — für sichtbares Licht falsch (FC:6518) | FB:850 | FB:851 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | b 28 · f 31 |
| Q21 | LAVA.glueht (Draper) · stein tSchmelz | 798 K · 1 500 K | K | Draper · Stoff-Tafel | GC:1822; schmiede-core.js:2892 | SW:530-533; GC:1832,1843 | GESETZT mit Anker | 2 | b 29,31 |
| Q22 | LAVA.ueberhitzung | 150 | K | keiner | GC:1818 | SW:533; GC:1843 | **GESETZT ohne Anker** | 1 | b 30 |
| Q23 | Ausbruch t0 = tSchmelz + ueberhitzung | 1 650 | K | aus Q21, Q22 | SW:533 | SW:570,591; DK:1788 | FOLGT | 1 | b 32 |
| Q24 | GLUT_BILD c₂ · λ [611 549 464] | 1,438777e-2 · nm | m·K · nm | CODATA 2018 · sRGB | SW:3034-3037 | SW:571-575 | GESETZT mit Anker | 1 | b 33 · f 24 |
| Q25 | LAVA_KRUSTE sigma · offen · platte · randDicke | 0,25 · 0,17 · 0,62 · [0,5 1] | — · m | Bild-Maße | SW:3044-3049 | SW:597-601,626 | **GESETZT ohne Anker** | 4 | b 34 |
| Q26 | ESSE.feuerK · flaecheM2 · handHoeheM | 1573 K · 0,06 m² · 1,1 m | K · m² · m | „gelbe Glut 1 300 °C“ ohne Quelle | FL:3118,3125-3126 | FL:2512,2526,2561,2567,2572 | **GESETZT ohne Anker** | 3 | b 35,36,37 |
| Q27 | FUNKEN.kelvin · leucht | 1900 · 4 | K · Stellwert | keiner | kampf.js:2683-2684 | kampf.js:930 | **GESETZT ohne Anker** | 2 | b 38 · f 34 |
| Q28 | _strahler-Raster 25 K · ¼ m Kern (k4 ≥ 1 → ≥ 108 cd) · Speicher 512 · _lavaLeucht 5 K/128/½ m | — | K · m | keiner | DK:1759-1777,1953; SW:587,596 | DK:1903,1930,1954; FL:2570 | **GESETZT ohne Anker** · Technik · *an der Quelle gelesen* | 6 | b 43,44 · c B10 |
| Q29 | M.feuer emissive 0xff5212 × 1,5 | — | sRGB-Hex | keiner | FC:2073 | im Bild vom Knoten ersetzt (SS:398, FC:2112) | **ohne Leser** | 1 | b 42 |
| Q30 | Platz-Stärke des Pools (Candela ÷ Luma der Farbe) | I ÷ luma(lichtFarbe(K)) | cd (auf Luma 1) | aus Q10/L19 und Q11 | DK:1711-1713 | lichtFarbe[k] → SM:2391 ff. (_lichtPlatz) | FOLGT · *an der Quelle gelesen* | 1 | f 13 |

### 6 Quellen: Leuchte · Fenster · Tor (Candela-Daten)

| # | Name | Wert | Einheit | Anker | Def | Leser | Status | n | Blätter |
|---|---|---|---|---|---|---|---|---|---|
| L1 | BRENNER.candela docht · argand · gas · gluehstrumpf | 1 · 10 · 16 · 100 | cd | Kerze; Argand 6–10; 16-Kerzen-Gas; Auer 60–100 | FC:6443-6446 | FC:7637,7640; FC:6458 | GESETZT mit Anker · *an der Quelle gelesen* | 4 | c 1 |
| L2 | BRENNER.gluehlampe.candela | 110 | cd | 1 380 lm ÷ 4π | FC:6447 | FC:7637 | FOLGT · *an der Quelle gelesen* | 1 | c 2 |
| L3 | BRENNER.ab | −∞ · 1784 · 1826 · 1892 (gluehlampe ohne) | Jahr | Historie | FC:6443-6446 | brennerVon FC:6451 | GESETZT mit Anker · *an der Quelle gelesen* | 4 | c 3 |
| L4 | BRENNER.flammeM | 0,04 · 0,06 · 0,05 · 0,08 · 0,06 | m | keiner | FC:6443-6447 | FC:7636 (s → kopf) | **GESETZT ohne Anker** · *an der Quelle gelesen* | 5 | c 4 |
| L5 | Elektro-Schwelle der Stadt (rj < 1895, plan.jahr < 1930, dL < 0,45, R9L·0,80, ^0,82) | — | Jahr · Stellwert | „Berlin-Wahrheit“ (narrativ) | FC:5686-5688 | dorfLayout FC:5688 | **GESETZT ohne Anker** | 5 | c 6 |
| L6 | LICHT_GESETZ.laterne.kelvin (für JEDEN Brenner) | 1900 | K | keiner („Gaslicht“) | FC:6458 | DK:1743 über DK:1627,1705; FW:650 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | c 7 |
| L7 | LICHT_GESETZ.laterne.candela | 100 (= gluehstrumpf) | cd | aus L1 | FC:6458 | FC:7640,6475; DK:1839 | FOLGT · *an der Quelle gelesen* | 1 | c 8 |
| L8 | LICHT_GESETZ.laterne.cdM2 | 960 | cd/m² | aus L7 und L17: 100 cd ÷ (0,26 × 0,40 m²) = 961,5, als Literal 960 gesetzt (Herleitung im Kommentar FC:6423-6424) — Zwilling von L20 | FC:6458 | DK:1629 (lichtGlut.laterne); FW:670 | FOLGT · *an der Quelle gelesen* | 1 | c 9 |
| L9 | LICHT_GESETZ.laterne.abfall | 2 | Exponent | 1/d² | FC:6458 | SM:2435; DK:1711; BS:499 | GESETZT mit Anker · *an der Quelle gelesen* | 1 | c 10 |
| L10 | LICHT_GESETZ.laterne.kernM | 0,1 | m | keiner (Glas gäbe 0,18, Flamme 0,08) | FC:6458 | DK:1710,1817; FC:9422,6468; BS:538 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | c 11 |
| L11 | LICHT_GESETZ.laterne.hoeheM | 3,6 | m | Lichthöhe des eigenen Labors („Nordstern Fachwerk-Soll“, Straße 3,7 m; FC:6422-6423) — kein fremder Anker | FC:6458 | FC:8012; DK:1911; FC:9422 | GESETZT, Anker eigenes Bild · *an der Quelle gelesen* | 1 | c 12 |
| L12 | LICHT_GESETZ.fenster.kelvin | 2800 | K | Bild-Urteil V18.542 | FC:6457 | DK:1627; FW:650 | GESETZT, Anker eigenes Bild · *an der Quelle gelesen* | 1 | c 13 |
| L13 | LICHT_GESETZ.fenster.cdM2 | 20 | cd/m² | 80 lx · 0,8 ÷ π | FC:6457 | DK:1629; FW:667 | GESETZT mit Anker · *an der Quelle gelesen* | 1 | c 14 |
| L14 | wandlaterne hoeheM · armM · K66-Wandfaktor | 2,8 · 0,4 · 2 | m · Verhältnis | Gestaltungs-Regel | FC:6466-6482 | FC:6466-6481,8022-8027,9321 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 3 | c 15,16 |
| L15 | wandlaterne kernM · candela | 2,742 m · 118,427 cd | m · cd | aus L14 und Laterne (Wand-Klammer, keine Ausdehnung) | FC:6468,6475,6478 | DK:1710,1817,1839; BS:538 | FOLGT · *an der Quelle gelesen* | 2 | c 17,18 · c B5 |
| L16 | wandlaterne cdM2 (lichtGlut.wandlaterne) | 960 | cd/m² | = L8 | FC:6476 | Uniform geschrieben DK:1626, KEIN Stoff liest den Schlüssel | **ohne Leser** · *an der Quelle gelesen* | 1 | c 19 · c B4 |
| L17 | KOPF_BODEN ueber · dick · AUS_MASS.laterne kb·kh·hb·Haube · AUS_MASS.wandlaterne kb·kh·hb | 0,04 · 0,03 · 0,26/0,40/0,20/0,20 · 0,22/0,34/0,17 | m | Bau-Maß ohne Quelle | FC:7615,8011-8013,8023-8031 | FC:7644,7656-7672,7979 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 9 | c 20,21,22 · e 1c |
| L18 | leuchte(id,brenner).kopf (Inkreis) | Glühstrumpf [5 ; 5 ; 3,75 ; −4,25] | halbe Flammen-Höhen | aus L4, L17 | FC:7644 | DK:1716 → SM:2423-2432; DK:1819 | FOLGT · *an der Quelle gelesen* | 1 | c 23 · e 1c |
| L19 | leuchte().candela | L7 × Brenner/100 | cd | aus L1 | FC:7640 | DK:1839 | FOLGT · *an der Quelle gelesen* | 1 | c 24 |
| L20 | leuchte().cdM2 (Brenner-skaliert) | L8 × Brenner/100 | cd/m² | aus L1 | FC:7641 | ohne Leser (gesucht `.cdM2` in stamm/: nur LG[k].cdM2) | **ohne Leser** · *an der Quelle gelesen* | 1 | c 26 |
| L21 | lichtLeib(id) / leibM | Laterne 0,2 | m | max(Halbkopf, kb/2) | FC:7974-7980 | DK:1914,1988 → BS:539 | FOLGT | 1 | c 25 · e 1b leibM |
| L22 | LICHT_POOL plaetze · umkreisM · wahlS · wahlM · blendeS | 4 · 48 · 0,25 · 1 · 0,5 | Stück · m · s · m · s | keiner | SM:3899 | DK:1642-1657,1850 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 5 | c 27 · e Übergabe |
| L23 | Reichweiten-Raster · Höhen-Konvention des Eintrags | ½ m · ±0,5 m | m | keiner | DK:1850,1911; siedlung-ort.js:559 | BS:516 | **GESETZT ohne Anker** · Technik · *an der Quelle gelesen* | 2 | c 28,29 |
| L24 | FENSTER_SCHLAF | 0,45 | Anteil (fest je Same) | keiner („nicht jedes Haus wacht“) | FC:2755 | FC:2762 → FC:1080,2798 | **GESETZT ohne Anker** | 1 | c 31 |
| L25 | glas.opacity | 0,42 | Deckkraft | keiner | FC:2071,2090 | FC:6027; SS:342 | **GESETZT ohne Anker** | 1 | c 32 |
| L26 | Dorf-Licht LICHT_MARKE_M · DORF_LICHT_WEG · Mast- · Brunnen-Abstand | 10 · 25 · 9 · 2 | m | „nacht-wand 69 %“ (eigenes Bild, nur zu 25 → 10) | FC:9310,5690-5692 | FC:9390,5692 | **GESETZT ohne Anker** | 4 | c 48 |
| L27 | laterneWandM | 2,55 | m | aus L9–L11, L14 | FC:9420-9423 | FC:9434 | FOLGT | 1 | c 49 |
| L28 | GLUT_GESETZ.candela (Tor) | 15 | cd je Labor-Einheit | „weniger als eine Gaslaterne“ | PC:1732 | stamm/siedlung-tor.js:776 | **GESETZT ohne Anker** | 1 | c 39 |
| L29 | GLUT_GESETZ i0 · iOpen · pulseBase · pulseAmp · color · ySpring | 0,3 · 3,4 · 0,8 · 0,28 · 0xffd9a0 · 0,55 | r128-Stellwert · sRGB | keiner | PC:1722-1729 | PC:1738 → siedlung-tor.js:773-776; DK:1745; porta.js:216 | **GESETZT ohne Anker** | 6 | c 40,41 · h P7 |
| L30 | GLUT_GESETZ.dist | 14 | m | — | PC:1723 | Welt ungelesen (nur porta.js:181) | **ohne Leser** | 1 | c 42 |
| L31 | GLUT_GESETZ decay · Tor-kernM | 2 · 0,5·spanW·scale | — · m | Physik · Geometrie | PC:1724; siedlung-tor.js:771 | SM:2435; DK:1710 | FOLGT | 2 | c 43 |

### 7 Emission ohne Lichtmaß · Stoffe · Wasser

| # | Name | Wert | Einheit | Anker | Def | Leser | Status | n | Blätter |
|---|---|---|---|---|---|---|---|---|---|
| E1 | Fahrzeug-Leuchten ei (drl, lensW, lensR, lensA, laterne, lichtKante) je mit Hex | 0,9 · 1,1 · 0,85 · 0,8 · 1,0 · 1,6 | Stellwert ohne Einheit | keiner | VC:164-186,340-341 | koerper-leib.js:1455 → PH:5985 → SS:344-346 / aGlut SS:724 | **GESETZT ohne Anker** | 12 | c 44 · f 29 |
| E2 | Porta-Rahmen-Emissiv | lerp(0,04 ; 0,55 ; glow) … | Stellwert | keiner | PC:1331-1334 | wie E1 | **GESETZT ohne Anker** | 4 | c 45 |
| E3 | Glimmen aus Tags: Formel 0,55/0,6 · Boden 0,5 · ×0,6 · Deckel 1,5 · Stoff glut 0xff5a14 · Esse boost 1,5/1,7 · Kristall glow | I ≈ 0,59 / 0,884 / 1,002 | Stellwert | keiner | SM:787,794,892-899; bau-vorlagen.js:1861-1869; bau-teile.js:1641,1652,1771-1774 | SM:893-900 | **GESETZT ohne Anker** | 9 | b 39,40,41 · c 46,47 · f 25 |
| E4 | Studio-Emissiv mp.emissive × emissiveIntensity · leucht ohne Datum · aGlut je Ecke | — | Stellwert | Labor-Stoff | PH:5968,5985-5986; SS:312,724 | SS:344-347,398; r184 Emissiv | **GESETZT ohne Anker** | 3 | f 26,27,28 |
| E5 | HAUT_LOOK.sss | pow 3 · [1 0,4 0,25] · 0,05 | Emissiv-Stellwert | eigenes Bild (Kopf-Kontrast 0,61 → 0,65) | koerper-core.js:775-780 | SS:598-600 | GESETZT, Anker eigenes Bild | 1 | f 35 |
| E6 | FELL_LOOK koerper · straehne · wrap | Rim/Sheen/Sparkle · TipRim/Spec · 0,5 | Emissiv-Stellwert · Faktor | „verbatim“ Labor-GLSL | tetrapoda-core.js:3712-3738 | SS:588-612,656-662 | **GESETZT ohne Anker** | 3 | f 36,37,38 |
| E7 | HAAR_LOOK.kk | wrap 0,5 · R 0,046 · p 80 … | — | R: Keratin-F0; Rest gesetzt | koerper-core.js:836-843 | SS:54-88 | GESETZT mit Anker | 1 | f 39 |
| E8 | LAUB_LICHT τ · Keule | 1,0/0,5 · g 0,7 n 8 | — | PROSPECT-D; Keule am Soll geeicht | PH:6786-6791 | SI:121-130 | GESETZT mit Anker | 1 | f 40 |
| E9 | Halm-Narbe K(θ) · narbe.x · kHimmel · fussNarbe | Campbell · 0,7 · 0,7 · 1,86 | — | Campbell 1986, Monsi & Saeki (folgt) | PH:6809ff.,6855; stamm/daten.js:516 | SI:115-119; SM:39,1988-1990 | FOLGT | 4 | e 1g · f 41 |
| E10 | HALM_VOLUMEN · F_Schlick-Beiwerte | 0,89/0,34 · −5,55473/−6,98316 | — | Geometrie · r184 | SM:3898,2496 | SM:2458-2463,2496 | FOLGT | 2 | f 20,21 |
| E11 | environmentIntensity · envMapIntensity | 1 · mp oder 1 | Faktor | r184-Vorgabe · Labor | Vendor; PH:5983 | BSI:2758,2776; SS:343 | **GESETZT ohne Anker** | 2 | f 10,11 |
| E12 | STOFF_GESETZ rauheit · metall | MERL · Bindung | GGX α | MERL | schmiede-core.js:2853-2905 | bau-buch.js:1594-1598 → SM:857-859,3369 | GESETZT mit Anker | 2 | f 51 |
| E13 | Studio-Rauheit Rinde/Laub · Host-Rauheit ohne Zeile · GLANZ_RAUHEIT der Bühne | 0,93/0,62 · 0,7/0 · [0,25 0,45] | Rauheit | keiner | PH:5973-5980; SM:858-859; WL:978 | SS:258; SM:858; WL:1289 | **GESETZT ohne Anker** | 4 | f 52,53 · h B9 |
| E14 | AERIAL micro · aoStrength · aoCap · cavityAO (3 Vorgaben 0,35/1/1) | 0,14 · 0,38 · 0,18 · … | Faktor | „Schöpfer-Sign-off 04.06.“ (cavityAO); sonst keiner | SM:3943-3946; DK:344; speicher-welten.js:1380; SM:648 | SM:822-845 (auf dem FERTIGEN Ausgang) | **GESETZT ohne Anker** | 4 | e 1g · f 54 |
| E15 | sRGB-EOTF (5 Dekodierer) · Balken-Licht-Boden | IEC 61966-2-1 · Luma ≥ 0,14 | — | Norm · „Michis schwarze Balken“ | stamm/daten.js:551; FC:2330-2333; FO:5239,8229; VC:289 | jeder Paletten-Leser | GESETZT mit Anker | 2 | f 55,56 |
| E16 | Albedo-Tafel Karte · Toleranz | 0,18 · 0,1 | Reflexionsgrad · ln | 18-%-Karte | spec/farbe/albedo-tafel.json | nur scripts/lib/albedo-tafel.cjs:232 | GESETZT mit Anker | 2 | f 57 |
| E17 | Wasser uLight | max(0,22 ; dl.intensity) | Welt-Einheit | keiner (Boden) | BH:2566 | wasser-hydro.js:820; gelaende-fern.js:1725 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 1 | a Z13 · d Klammern · f 43 |
| E18 | WASSER_GESETZ spec · licht · spiegel.dim · Schaum-Farbe | [120 1,35] · [0,86 0,18 0,08] · 0,68 · [0,93 0,96 0,98] | — | Labor | FO:158-162 | wasser-hydro.js:819-820; BSI:1265,1561; phytogenesis.js | **GESETZT ohne Anker** | 4 | f 44,48 · h R15 |
| E19 | Wasser-F0 je Kanal (Cauchy n 1,333/1,309) · R∞ Gordon | — | — | STOFF_GESETZ · Gordon 1975 | schmiede-core.js:2889-2890; FO:166 | wasser-hydro.js:787-794; BSI:1263 | FOLGT | 2 | f 45,47 |
| E20 | WASSER_GESETZ.fresnel | [0,02 0,98 5] | — | Schlick f0 Wasser | FO:157 | Welt ungelesen; nur phytogenesis.js:1985 | **ohne Leser** | 1 | f 46 · h R14 |
| E21 | Kapsel-Rückfall-Farbe · Kronendach-Albedo · SPIEGEL laubGrund/laubTiefe | {0,55 0,5 0,45} · 0,16 + c·0,08 · nicht gelesen | linear | keiner | dienst.js:1138; BH:566-568; BSI:3926 | BSI:2061; Kronendach hinter Flag DK:364; BSI:1111 | **GESETZT ohne Anker** | 3 | f 49,50 · f B13 |
| E22 | Tier-Augen-Glut TIER_MATERIAL_KLASSEN.tierauge glut · ei | 0,29 · 0,3 | Stellwert ohne Einheit (Anteil der Iris-Farbe · emissiveIntensity) | keiner („das Lab-Verhältnis 0x44 : 0xee“) | tetrapoda-core.js:3692 | foundry-core.js:8211-8240 → r184 Emissiv des Tier-Stoffs; Tag und Nacht gleich hell | **GESETZT ohne Anker** · *an der Quelle gelesen* | 2 | — (kein Blatt; Gegenlese) |
| E23 | MEMBRAN_GESETZ.film Look: kugel · brechung · dicke (6) · rand · basis · gewichtMax · act · glanz · tiefe · spiegel · farbe · fresnel-F0 | 4 · 0,12 · … · 0,24 · 0,55 · … · 2,6 · 0,04 | Stellwert ohne Einheit | Lagarde & Zanuttini 2012 (Methode der Kugel); Zahlen keiner — F0 0,04 widerspricht n 1,33 (F0 0,020) | PC:1662-1680 | siedlung-tor.js:249-300 | **GESETZT ohne Anker** · *an der Quelle gelesen* | 12 | h P9 (nur fresnel, im Labor) |
| E24 | MEMBRAN_GESETZ.film Physik: n · welle | 1,33 · [1 1,22 1,44] (650/532/450 nm) | Brechzahl · Verhältnis | Seifenfilm, Dünnschicht-Interferenz | PC:1664,1678 | siedlung-tor.js:293-297 | GESETZT mit Anker · *an der Quelle gelesen* | 2 | — (kein Blatt; Gegenlese) |
| E25 | membranPalette warm · cold · dWarm · dCool · dCryst · sat | [1,95 1,45 0,85] · [0,4 0,6 1,5] · … · 0,42 + 0,34·energy | Stellwert (über 1) | keiner | PC:1602-1616 | siedlung-tor.js:70,163,297 | **GESETZT ohne Anker** | 6 | — (kein Blatt; Gegenlese) |

### 8 Schatten und Verdeckung

| # | Name | Wert | Einheit | Anker | Def | Leser | Status | n | Blätter |
|---|---|---|---|---|---|---|---|---|---|
| V1 | SCHATTEN_KASKADE mit Anker: sonneTan · rampeTexel · bezugAspekt · Fade-Saum | 0,00925 · 0,6 · 16/9 · 0,125a² | rad · Texel | Sonnenscheibe · bilinear · Norm · Vendor | BS:1733-1736; BS:678-679 | BS:1073-1095,1119,1123; DA:1558,1760,1800 | FOLGT | 4 | e 1a |
| V2 | SCHATTEN_KASKADE gemessen: rasterTeiler · normalTexel · tiefeTexel · zuwendungSaum · SCHATTEN_TAKT (2) | 8 · 0,5 · 0,75 · 0,08 · 2/3 | Texel · N·L · Bilder | Messungen 04.10./09.10., CPU-p95 | BS:1739,1742-1745,1652 | BS:807,30; SM:3879,1968; SK:1339; BS:1312-1344 | GESETZT, Anker eigenes Bild · Technik | 6 | e 1a |
| V3 | SCHATTEN_KASKADE gesetzt: kontaktM · texelM · filterTexel · sucheM · karteMax · karteRaster · randM · luftM · laubTexel · cascades · Bruch 0,85 · FERN_FAKTOR · RANGE_MAX · Rückfall mapSize/near/far · lightDist · Vogel 5 · lichtRandTexel · RUHE_EPS · sunMoved · BLENDE_RASTER · TWIN_LAYER | 15 m · [0,045 0,17 0,47] · … · 3 · 0,85 · 1,8 · 170 m … | m · Texel · — | keiner (texelM: alter Stand V18.529) | BS:1646-1659,1729-1744; DA:361-364,410-414; BH:1816; bild-wahl.js:909 | BS, DA, SI:30, r184 CSM | **GESETZT ohne Anker** · Technik | 23 | e 1a |
| V4 | shadowRange (drei Vorgaben 170 / 300 / Klemme 80–400) · HOLZ shadowRange · shadowBias | 170 · 300 · voll 170/nah 110/kienspan 0 · 1,0 | m · Stellwert | keiner | DK:357-358; speicher-welten.js:1384; dirigent-regler.js:2197-2199 | SM:3843-3879; DA:369; dirigent-regler.js:539-540; speicher-laden.js:613-614 | **GESETZT ohne Anker** | 4 | e 1a · e B-11 |
| V5 | LICHT_WURF kartePx · nahM · leibSaum · weichPx · bezugM · wichtigAb · halten · takt · Würfel-Start | 256 · 0,05 · 0,02 · 2 · 2 m · 0,25 · 1,25 · 3 · 90°/0,5/500 | Texel · m · Anteil · Bilder | keiner | BS:1698-1708,410 | BS:422-545 | **GESETZT ohne Anker** · Technik · *an der Quelle gelesen* | 9 | c 30 · e 1b |
| V6 | LICHT_WURF.kernAnteil | 1 | — | Radeon, Keile am Glutbrunnen (eigenes Bild) | BS:1701 | BS:539 | GESETZT, Anker eigenes Bild · *an der Quelle gelesen* | 1 | c 30 · e 1b |
| V7 | HORIZONT_KARTE gitter · zelleM | 768 · 32 m | Punkte · m | Messung Grat 0,77° bei 32 m | DA:1955,1957 | DA:1469-1713; BK:2923 | GESETZT, Anker eigenes Bild · Technik | 2 | e 1d |
| V8 | HORIZONT_KARTE karte · schrittM×schritte · nachM · zeilenJeAuftrag · lichtRad · bandM · leerM · gratRad · treffer · messer | 320 · 60×50 · 1000 · 16 · 0,05° · 1,5 m · 10000 · 30° · 8/4 · 4×8/3000 | Texel · m · rad | keiner | DA:1954-1967 | DA:1471-1826; BK:2897-2944; SK:745 | **GESETZT ohne Anker** · Technik | 15 | e 1d |
| V9 | NAESSE dachPlaetze · dachUmkreisM · dachSchrittM · dachArten | 8 · 64 · 4 · Liste | — · m | keiner | SM:3922-3925 | SM:728,731; SD:170-270 | **GESETZT ohne Anker** · Technik | 4 | e 1f |
| V10 | KONTAKT.radiusM | 1,5 | m | Messung Leib 0,79 vs 0,76 | BS:1669 | BS:1476,1519-1521 | GESETZT, Anker eigenes Bild | 1 | e 1g |
| V11 | KONTAKT saum · scheiben · schritte · duenn · nahM · minPx · potenz (XeGTAO nennt 2,2) · tiefeRand · Auflösung ½ | 0,4 · 2 · 4 · 0,7 · 0,08 · 2 · 2,5 · 0,04 | — | keiner | BS:1670-1677,1608-1609 | BS:1420-1574 | **GESETZT ohne Anker** · Technik | 9 | e 1g |
| V12 | KARTE_SONNEN_SICHT richtungen · karte · Kachel-Box | 9 · 256 px · 1,15·max | ° · px · m | keiner | SK:2073-2083,2090,1324 | SK:1020 ff.,1306,1327-1335 | **GESETZT ohne Anker** · Technik | 3 | e 1h · f 42 |
| V13 | KARTE_SONNEN_SICHT spanne | [−0,5 1,5] … | Beiwerte | Fit-Grenzen | SK:2084-2089 | SK:1065,2766; SM:1557-1559 | FOLGT | 1 | e 1h · f 42 |

### 9 Studios und Labore (eigene Rigs)

| # | Name | Wert | Einheit | Anker | Def | Leser | Status | n | Blätter |
|---|---|---|---|---|---|---|---|---|---|
| X1 | Bühne der Welt: Stunden (Sonne 15°) · hKm | 0,5 / 15° · 0,001 km | Uhr · Grad · km | keiner | huelle.js:2273,2307-2313; WL:1224 | huelle.js:2302; WL:1250 | **GESETZT ohne Anker** | 2 | h B4,B5 |
| X2 | fachwerk: Belichtung 1,12 · ACES · ZEIT_GESETZ i/h/a/c/bg/p (4 Stunden) · Ersatz-Literale · Hemi · Nebel · Boden · Feuer-Boden 2,5 m | 1,12 · 2,1/0,62/0,22 … | r128-Legacy-Intensität | „Feel-Entscheid .228“ | FW:640-669; FC:11383-11388 | r128-Renderer; setZeit FW:659 | **GESETZT ohne Anker** | 9 | h F1-F7,F9,F12 · a Z12 · b 45 |
| X3 | fachwerk: Lux des Labors · Herd-Stärke · Glut von Fenster/Laterne | augeLux(7,83·Σ/Σmittag) · augeZeig(cd/(4+k²))/π/(1−2/R)² · augeGlut(cdM2) | lx (aus Legacy-Summe) | aus X2 und dem Auge der Welt | FW:652-667 | FW:660-671,1052 | FOLGT | 3 | h F8,F10,F11 · a Z12 · b W11 |
| X4 | portale: Belichtung 1,1 · ACES · Hemi 0,6 · Key 3,0 · Rim 2,0 · Canvas-Umgebung · Post · Punktlicht-Literale | — | r128-Legacy-Intensität | keiner | porta.js:175-185 | r128-Renderer | **GESETZT ohne Anker** | 8 | h P1-P8 |
| X5 | koerperstudio: Belichtung 1,0 · ACES · Hemi/Key/Rim (= portale) · Canvas · Bloom | — | r128-Legacy-Intensität | keiner | koerperstudio.js:83,246-254 | r128-Renderer | **GESETZT ohne Anker** | 7 | h K1-K7 |
| X6 | tetrapoda: Belichtung 1,25 · ACES · Hemi/Key/Rim/Fill/Back · Canvas · Bloom | — | r128-Legacy-Intensität | keiner | tetrapoda.js:186-191 | r128-Renderer | **GESETZT ohne Anker** | 9 | h T1-T9 |
| X7 | terrain: Belichtung · ACES · Canvas · Sonnen-Basen 3,13/2,65 · Hemi 0,78 · Rim/Fill/Back · Dimm-Boden · eigene Sonnenbahn · Albedo-Hemi · Impostor · Bloom/Key · Labor-Nebel 120 m · Labor-Hemi | — | r128-Legacy-Intensität | keiner | phytogenesis.js:267,536-558,626,2895-2992,3440-3519; FO:412-413 | r128-Renderer | **GESETZT ohne Anker** | 16 | h R1-R10,R12,R13,R16 · d 69,70 · a Z11 |
| X8 | terrain: Farbe/Luminanz der Sonne aus ATMO_RECHNUNG.sonne | — | Durchlass | Kern der Welt | phytogenesis.js:3338-3342 | ebd. | FOLGT | 1 | h R11 |
| X9 | translated: Dir 1 · Hemi 0,7 · keine Tonkurve | — | r130-Intensität | keiner | translated.js:103-107 | r130-Renderer | **GESETZT ohne Anker** | 3 | h X1-X3 |
| X10 | Werkstatt-Bühnen (hof, sozial, vorschau, …): Ambient/Key/Fill | 0,6 · 0,6 · 0,65 · 0,55 · Key 0,95/0,85 · Fill 0,4/0,35 | Stellwert | keiner | werkstatt-hof.js:698,1348; werkstatt-sozial.js:1168; werkstatt-vorschau.js:333-338 | eigene Szenen | **GESETZT ohne Anker** | 4 | d 71 · f Werkstatt-Vorschau |
| X11 | huelle Panorama-Backen NoToneMapping, linear HalfFloat | — | — | lineares Ziel | huelle.js:1462-1500 | Tor-Membran der Welt (panorama.f16 je Ziel, worlds/tor-ziele.json): zehn Studios tragen eins — fachwerk, fluid, garage, klang, koerperstudio, portale, schmiede, skeleton, terrain, tetrapoda; fluid, klang und skeleton zeichnen ohne Licht-Rig | FOLGT · *an der Quelle gelesen* | 1 | h Y1 |

### Was zusammenfiel (Doppelzählung der Blätter)

In 101 der 221 Zeilen fielen Zeilen aus mehr als einem Blatt zusammen (gezählt aus der Spalte „Blätter“). Die schwersten Fälle:
- **Vier Blätter, eine Größe:**
  - KEY_BASE (a S1 · d 23 · f 1 · h B1), LEGACY_LICHT (a S2 · d 24 · f 2 · h B2) und das Richtlicht der Sonne (a W1 · d W1 · f 3 · h B3).
  - MOND_STAERKE (a M1 · d 27 · f 4 · g 9), AUGE.welt (a AU1 · d 26 · f 16 · g 16) und AUGE.lux (a AU2 · d 26 · f 16 · g 17).
  - Die RAUM-Zeile (c 35 · d 62 · e 1f · g 46-48) und raumLicht (c 34 · d 63 · e 1f · f 12).
- **Drei Blätter:**
  - Ambient, Ambient-Gefühl, Hemi, Hemi-Boden (a E1–E4 · d 49–52 · f 5–8).
  - Wasser-Boden 0,22 (a Z13 · d · f 43).
  - Glimmen aus Tags (b 39–41 · c 46–47 · f 25).
  - Feuer cdM2 10 000 (b 8 · c B7 · h).
  - Flamme ziel (b 25 · f 30 · g W11).
  - Das Labor fachwerk (a Z12 · b 45/W11 · h F1–F12).
- **a und d** decken die EINE Atmosphäre doppelt ab (26 Zeilen: S3–S29, N4–N17).
- **c und e** decken Kopf, Leib, Pool und Wurf doppelt ab (L17, L18, L21, L22, V5, V6).
- **b und f** decken die Brand-Flamme doppelt ab (Q17–Q20, Q24, Q27).

Nicht in der Tafel: die **29 Soll-Zahlen der Linsen** (Blatt h, Tafel „Soll-Zahlen“). Sie sind Prüf-Maße und keine Glieder der Kette.
Von ihnen trägt nur `tag-ref.json` eine Licht-Größe; sie steht als N32 in der Tafel.

Fünf Zeilen las kein Blatt (Gegenlese): S40 DSL-Himmelstönung, N33 Aura-Tönung des Hemi-Bodens, E22 Tier-Augen-Glut, E24 und E25
die Physik und die Palette der Tor-Membran. E23 (der Film der Membran) streifte nur Blatt h am Fresnel des Labors.

## 2. Die Zahlen

Neu gezählt nach der Gegenlese (`node zaehle.cjs` → `zaehle.out.txt`); in Klammern der Stand davor.

| | Zeilen | Felder |
|---|---|---|
| Summe der Blätter, wie gemeldet (a 61 · b 46 · c 113 Skalare · d 71 · e 102 · f 58 · g 52 · h 68) | — | 571 (gemischte Zählweisen) |
| **bereinigt, alle Größen** | **221** (211) | **583** (548) |
| davon FOLGT | 41 (36) | 57 (52) |
| davon GESETZT mit Anker (Physik, Norm, Literatur, fremde Messung) | 41 (42) | 66 (66) |
| davon GESETZT, Anker nur am eigenen Bild | 18 (17) | 28 (28) |
| **davon GESETZT ohne Anker** | **110** (105) | **415** (385) |
| **davon ohne Leser in der Welt** | **11** (11) | **17** (17) |
| die Licht-Kette allein (ohne Technik, Kosmetik, Studios) | 192 (182) | 407 (372) |
| … davon GESETZT ohne Anker | **86** (81) | **252** (222) |
| … davon GESETZT, Anker nur am eigenen Bild | 16 (15) | 20 (20) |
| … davon mit photometrischem Anker oder FOLGT | 79 (75) | 118 (113) |

Die Felder bleiben grob, weil die Blätter verschieden zählten: Blatt c zählte Skalare, die übrigen Zeilen. Belastbar sind die
Verhältnisse. **In der Licht-Kette sind 62 % der Felder ohne jeden Anker gesetzt (252 von 407; vorher 60 %); mit den Bild-Ankern
sind es 67 % (252 + 20 von 407; vorher 65 %).** Nur 29 % der Felder (118 von 407) tragen einen photometrischen Anker oder folgen.

**Ohne Leser in der Welt (11 Zeilen):**
- S35 HIMMEL_GESETZ drift/drift2/grad
- N7 `nacht.lum`
- N24 Boot-Saat Ambient/Hemi
- N32 `tag-ref.json` (nur die Linse liest sie)
- Q3 `feuer.kernM` (nur das Labor)
- Q17 `BRAND.licht` und `flamme.schein`
- Q29 `M.feuer.emissive`
- L16 `lichtGlut.wandlaterne`: das Uniform wird geschrieben, kein Stoff liest den Schlüssel
- L20 `leuchte().cdM2` je Brenner
- L30 `GLUT_GESETZ.dist`
- E20 `WASSER_GESETZ.fresnel`

### Licht-Systeme, die nebeneinander fahren (bereinigt)

Die Blätter meldeten zusammen 106 Lichtwege, dazu 2 außerhalb (a 12 · b 11 · c 16 · d 19+2 · e 15 · f 13 · g 12 · h 8). Bereinigt
bleiben **57 Systeme** (vor der Gegenlese 56). Davon bringen **31** Licht bis ans Pixel, **10** verdecken, **9** messen oder bilden ab, und **7** sind
Studio-Zwillinge mit eigenem Rig.

**A. Licht bis ans Pixel (31):**
1. Sonnen-Richtlicht: Durchlass × KEY_BASE·π (a W1 · d W1 · f L1 · h Bühne)
2. Himmel und IBL der Tafeln, je E0 (a W2 · d W2, W4)
3. Mond-Richtlicht, 0,65 (a W3 · d W11)
4. Mond-Himmel in den Tafeln (a W4)
5. Sternen- und Dämmerlicht, linear aus MOND_E (a W5 · d W10)
6. Ambient der Nacht (a W6 · d W9)
7. Hemi der Nacht, dazu die Aura-Tönung seines Bodens N33 (a W6 · d W8; N33 fand die Gegenlese)
8. Wetter-Licht WX lightMul/direkt/grau als zweite Trübung neben dem Medium (d W13)
9. **Pool**: Candela → lx → q-Gesetz → Emissiv (c W1 · f L4 · b W1–W5 · c W7 Tor)
10. **Glut über `augeGlut`** (S-Form): Fenster, Laternen-Kopf, gemaltes Bett, Lava-Bild (b W6, W7 · c W5, W6 · f L8 · g W9)
11. Brand-Flammen-Bild: Planck × T⁴ × ziel/k (b W8 · f L9)
12. Glimmen aus Tags (b W9 · c W11)
13. Roher Emissiv-Stellwert: Fahrzeug, Porta-Rahmen, Studio-emissive, aGlut, Funken, Tier-Augen-Glut E22 (b W10 · c W9, W10, W12 · f L10; die Tier-Augen fand die Gegenlese)
14. Look-Additive als Emissiv: SSS, Rim, Sheen, Sparkle (f L11)
15. Licht des Auges `ersatz` (c W13 · d W17)
16. Welt-Licht `at()` für Feld, Panorama, Spiegel, Wasser (d W19 · f L5)
17. Wasser-Glanz Phong und Unterwasser (f L6 · d W7)
18. Sonnen- und Mondscheibe (a W11)
19. Sterne als Punkte (a W12)
20. Wolke im Himmel (d W3)
21. Luft/Nebel-Knoten (d W6)
22. Godrays (d W14 · g W12)
23. Rauch als Lambert-Fläche (d W15)
24. Regen unbeleuchtet (d W16 · f L13)
25. Tor-Membran, Studio-Panorama, Seifenfilm E23–E25 (c W8 · h 6; den Film fand die Gegenlese)
26. Raum-Licht und Decken (c W14 · d W18 · e W9 · g W3)
27. Laub-Licht (f L2)
28. Haar Kajiya-Kay (f L3)
29. Karten-Sonne (f L7 · e W13)
30. Post-Faktoren AERIAL × Kavität und Fell-Wrap auf dem fertigen Ausgang (f L12 · e W12)
31. DSL-Himmelstönung `skybox_color` → `himmelTint` → Tönung der Kuppel und von E0 (S40; kein Blatt, Gegenlese: feld-dsl.js:996-1009, BH:1739-1756)

**B. Verdeckung (10):** Kaskaden (e W1) · Gelände-Horizont (e W2) · Wolken-Wurf (e W3) · Grat-Himmel (e W4) · Luftschatten (e W5) ·
Pool-Wurf, EINE Quelle (c W4 · e W6) · Kopf analytisch (e W7) · aHimmel der Höhle (e W8) · GTAO (e W10) · Halm-Narbe (e W11).

**C. Messen und Abbilden (9):**
1. Lichtmesser → k (a W7 · d W5 · g W1)
2. Skala S, augeLux, augeMass (a W8)
3. Becken am Auge, CPU (c W2 · e W15 · g W2)
4. Reichweite und Wahl (c W3 · g W10)
5. CPU-Zwilling Horizont und Karten (e W14)
6. Nacht-Auge (a W10 · g W5)
7. Umkehrer von k (g W11)
8. Tonkurve Neutral und Ausgabe (g W6)
9. Bloom (g W12)

**D. Studio-Zwillinge mit eigenem Rig (7):** fachwerk r128 · portale r128 · terrain r128 · koerperstudio r128 · tetrapoda r128 ·
translated r130 · Werkstatt-Bühnen und -Vorschau (eigenes Rig, Ende ohne Kurve; g W7, d 71). Die Bühne der Welt (garage, schmiede) ist
ein Rufer derselben Funktionen und kein Zwilling; ihr Stoff ist es (h §3.2).

**Einheiten, in denen dasselbe Licht unterwegs ist: sieben.**
1. lx: Pool, Becken, Reichweite
2. cd und cd/m²: Daten der Quellen, Glut
3. Welt-Einheit linear: Tag, 1 = 14 690 lx
4. Welt-Einheit auf der Skala S: Nacht, 0,598 ≙ 0,2988 lx
5. Welt-Einheit als Stellwert ohne Lux: Emissiv-Arten 11–14
6. k·L: Bild-Zahlen vor der Kurve (ziel 1,6, bildZapfen)
7. r128-Legacy-Intensität: Studios und Tor-Candela

## 3. Die Brüche der Kette, geordnet nach Wirkung am Bild

1. **Die Schulter macht warmes Licht rosa, und kein Glied davor kennt sie (Klammer, Einheiten-Bruch am Ende).**
   - Vendor `neutralToneMapping` (`mT`: 0,76 / 0,15, *an der Quelle gelesen*); gesetzt in DA:167 (*gelesen*).
   - Gerechnet für die reine Quellfarbe `lichtFarbe(K)`, auf Luma genormt (fenster.cjs):
     - 2000 K: der sRGB-Farbton fällt ab k·L-Luma 0,435 unter 28°, die Sättigung fällt erst ab 0,536 unter 0,75. Das Fenster der Linse S0_TON (28–45°, ≤ 0,75; diag-pruefbuehne.cjs:959, *gelesen*) ist für 1 667, 1 900 und 2 000 K **leer**; erst 2 400 K (0,57–0,71) und 2 800 K (0,33–1,07) treffen es.
     - Unter der Schulter bleibt 2000 K satt orange (k·L 0,3: sRGB 225/120/1, Sättigung 0,996). In ihr wird es Lachs (k·L 1: 252/166/118, Farbton 21,5°; k·L 2: 254/192/164, 18,7°).
   - Vorbehalt (berichtigt in der Gegenlese): S0_TON misst ZWEI Größen an zwei Bildern (diag-pruefbuehne.cjs:955-962). Der Farbton ist NETTO, mit Feuer minus ohne Feuer im linearen Licht der Ausgabe. Die Sättigung ist BRUTTO, das Bild mit der Nacht; netto trägt jedes Licht seine volle Sättigung (der Kommentar dort: das Feuer allein 0,96). Die Rechnung oben prüft beide an derselben reinen Quellfarbe. „Das Fenster ist leer“ gilt darum nur für die reine Quellfarbe und ist kein Urteil über die Linse. Den Boden (Albedo × Licht) und die Mischung mit der Nacht habe ich nicht gerechnet.
   - Der Bruch der Klasse: Glut (10), Pool (9) und Flamme (11) legen ihre Höhe vor k fest, ohne die Kurve zu lesen. Die Höhe ist die S-Form, das q-Gesetz oder `ziel` 1,6 (FB:995). Kein Glied hält die Farbe unter 0,76 oder gleicht das Weiß ab (Runde 4: `_augeAngleich` ist fort, g §3).
2. **Die Welt rechnet nachts in einer gestauchten Einheit, die zwei gesetzte Zahlen erzeugen (Einheiten-Bruch).**
   - Die zwei Zahlen: KEY_BASE 2,6 (WL:49, r128-Rig, *gelesen*) und MOND_STAERKE 0,65 (WL:169, Bild-Luma, *gelesen*). Sie geben 12,6 : 1 direkt und 13,1 : 1 gemessen statt 385 000 : 1.
   - Die Skala S (WL:94) wird aus genau dieser Stauchung abgeleitet: p = ln 13,1/ln 385 000 (WL:57, :85). AUGE.welt 7,83 ist eine Mess-Kopie (WL:89), AUGE.lux 115 000 ist ohne Quelle (WL:90). Der Anker ist zirkulär: 0,2988 lx = S⁻¹(0,598) = 115 000/385 000 (gerechnet).
   - Die Pool-Quellen tragen echte lx (Candela/d²). Die Umgebung, gegen die sie gezeigt werden, ist dagegen ein Stellwert, der auf S zurückgerechnet wird. Daher hat ein Herd von 249 cd gegen eine Nacht von 0,3 lx keinen Verlauf; das ist der Befund der Runde 1.
   - Eine Zahl, zwei Maße: `_waagrechtIrradianz` (BH:2186-2229) summiert den linearen Tag und den Ersatz auf S. `augeLux` trennt sie über den Boolean `tag` wieder (WL:102-106, *gelesen*; BH:2209).
3. **Zwei Augen am selben Ort (Zwilling).**
   - `augeZeig` (q-Gesetz mit S-Deckel, WL:120-124) gilt für Becken und Pool, `augeGlut` (S-Form, WL:138-142) für jede leuchtende Fläche. Der Kommentar benennt die Lücke selbst: Karte 0,80, Fenster 0,53 bei gleicher Leuchtdichte (WL:133-135, *gelesen*).
   - Folge: die Laterne und ihr eigener Kopf, das Feuer und sein Bett stehen auf verschiedenen Kurven.
4. **Zwei Leuchtdichten je Quelle (Zwilling, Einheiten-Bruch).**
   - Feuer: Pool 548 cd/m² (2000 K × ε 0,0012, FC:6527) gegen das gemalte Bett 10 000 cd/m² (FC:6529, ohne Anker, *gelesen*). Das ist Faktor 18,25; ε für 10 000 wäre 0,0219 (gerechnet).
   - Laterne: das Licht liest `leuchte(id, brenner).candela` (FC:7640, DK:1839). Die Kopf-Glut liest `LICHT_GESETZ[k].cdM2` je Schlüssel (DK:1626-1631, *gelesen*). Docht ×100, Argand ×10, Gas ×6,25 zu hell (gerechnet).
   - Esse: Bett-Bild über Glimmen (E3) und Licht über `_strahler` 2000 K, die Stahl-Temperatur dagegen 1 573 K (Q26).
   - Brand: das Licht brennt in `feuer.kelvin` 2000 K (DK:1922, 1930, *gelesen*), das Bild der Flamme läuft von 3000 K an der Wurzel bis 1700 K an der Spitze (FB:994; b 124). Eine Flamme, zwei Temperaturen (Gegenlese).
5. **Weg ohne Luft und ohne Verdeckung (Weg-Bruch).**
   - Der Pool-Abfall `(d² + k²)^(−a/2)` hat keine Extinktion und keine In-Streuung (SM:2433-2441, *gelesen*). Die Luft löscht nur den Rückweg, weil der Pool im Emissiv steht.
   - Nur EINE Quelle wirft (BS:488-513, *gelesen*). Die übrigen drei Plätze leuchten durch Wand, Dach, Gelände und Leib (e B-1).
   - Ambient und Hemi kennen kein Dach (BH:2251, 2492, *gelesen*; e B-5).
   - Der Kopf deckt nur den Punkt-Anteil (SM:2436, *gelesen*), nicht die flache Scheibe.
6. **Klammern, Deckel und Böden, die eine Farbe oder Stärke festhalten.**
   - `lichtFarbe` klemmt bei 1 667 K (FC:6488, *gelesen*). Lava von 798 bis 1 650 K und Stahl bis 1 573 K leuchten alle [1, 0,176, 0], während das Lava-Bild über Wien auskühlt (b Z4).
   - Der Wasser-Boden `max(0,22, dl.intensity)` (BH:2566, *gelesen*) hält das Wasser nachts hell.
   - Reichweite ≤ 48 m (DK:1850, *gelesen*).
   - Der Brand hat mindestens 0,196 m² und damit 107,6 cd, auch bei einer eben gezündeten Zelle (DK:1759, *gelesen*, gerechnet).
   - `nachtKnotenE` als Boden des Messers (WL:180, 772).
   - Fail-soft-Ersatz `_augeLux ?? 1` lx, `_augeMass ?? 1` und k = 1 (DK:1621-1629, 1849, BS:503, *gelesen*; BH:2071).
   - Derselbe `tint.auraK` fällt ohne Zahl zweimal verschieden zurück: auf 1 für die Himmelstönung (BH:1745), auf 0 für den Hemi-Boden (BH:2474). Eine ungültige DSL-Himmelsfarbe wird still verworfen (feld-dsl.js:1007-1008). Beides Gegenlese, *gelesen*.
7. **Zeitplan statt Gesetz.**
   - Die Kamera ist ein Fahrplan über die Sonnenhöhe: gleitung 12/8°, stufen 10/−20°, nachtGrad −32° (WL:173-183, *gelesen*). Die Nacht ist an vier Tiefen „ganz“: −6, −18, −20, −32°.
   - `tagAchse.nacht` schaltet Ambient, Hemi und Dämmerlicht (WL:853).
   - Die Sonnenbahn ist gesetzt, Meeus steht „OFFEN“ (WL:797-812). Der Mond ist immer voll (WL:815).
   - Fenster schlafen fest je Same (FC:2755).
   - Fahrzeug-Leuchten und Glimmen sind mittags so hell wie nachts (VC:164-186, SM:892-900).
8. **Drei Eichungen Lux ↔ Welt-Einheit (Zwilling).**
   - Tag linear 14 690 lx je Einheit (WL:105).
   - Nacht auf S: 0,447 lx je Einheit beim Vollmond (gerechnet).
   - NACHT_AUGE linear 1,161 (BK:3011, *gelesen*). Ihr Anker „0,224, fachwerk LICHT_GESETZ“ (BK:2996, *gelesen*) steht dort nicht.
   - Dazu fünf Lux-Werte für EINEN Vollmond: 0,26 · 0,18 · 0,3965 · 0,397 · 0,2988 (a Z1).
   - Sterne und Dämmerlicht stehen linear und nicht auf S (WL:225-226, *gelesen*), entgegen dem Kommentar WL:58 (*gelesen*). Das Sternenlicht ist dadurch um den Faktor 286 dunkler als S(0,0005 lx) (gerechnet).
   - Zwei Quellen derselben Himmelsbestrahlung (a Z14, in der Tafel vorher nicht genannt): die synchrone Tafel `_himmelsBestrahlung` (BH:1715; gelesen von BH:2211, 2221, Messer und Kamera) und die zurückgelesene Umgebung `_himmelsIrradianz` (BH:2526, Unterwasser; BSI:2770).
9. **Studio-Rigs in der Welt (Zwilling).**
   - Sechs r128/r130-Rigs mit ACES und eigener Belichtung (h §3.1). Ihr lineares Panorama geht über `panorama.f16` in die Tor-Membran der Welt (huelle.js:1462-1500).
   - KEY_BASE selbst ist ein kopierter Rig-Wert (WL:47-51, *gelesen*).
10. **Kommentare, die etwas anderes sagen als der Code:**
    - `STRAHLER.ankerK` (DK:1750-1751): existiert nicht; *gelesen*, `git grep`.
    - „T⁴ trägt nie das Licht“ (FC:6518, *gelesen*) gegen FB:850 (*gelesen*).
    - Die Sterne „stehen auf S“ (WL:58).
    - `BRAND.licht` und `schein` werden genannt, haben aber keinen Leser (*gelesen*, `git grep`).
    - FB:975 sagt „der Mond trägt 0,224“; der Mond trägt heute MOND_E 0,462 (WL:172) (Gegenlese).
    - Die Membran trägt `n` 1,33 und dazu `fresnel` F0 0,04 (PC:1664, 1667). Zu n 1,33 gehört F0 0,020; der Wasser-Stoff trägt richtig 0,02 (FO:157) (Gegenlese, gerechnet).
    - Das Augen-Licht teilt seine Stärke durch π (BH:2092) und `_laborLichtStaerke` multipliziert sie zurück (DK:2012). Die „EINE Übersetzung Labor → Welt“ hat an dieser Stelle keine Wirkung (Gegenlese).

## 4. Die drei alten offenen Punkte in der Tafel

1. **Kopf-Glut und Kelvin je Brenner.**
   - Zeilen L1–L4 (BRENNER ohne `kelvin`, FC:6442-6448, *gelesen*), L6 (`laterne.kelvin` 1 900 für jeden Brenner), L8 (`laterne.cdM2` 960), L20 (`leuchte().cdM2` je Brenner, **ohne Leser**) und L16 (`lichtGlut.wandlaterne`, **ohne Leser**).
   - Der Bruch sitzt in DK:1626-1631 (*gelesen*): EIN Uniform je Schlüssel von `LICHT_GESETZ`, nicht je Eintrag.
   - Ein Emissiv-Kanal je Instanz fehlt. `aGlut` je Ecke ist aus dem Stoff gefüllt (c B1).
2. **Kopf als Inkreis.**
   - Zeilen L17 (AUS_MASS, KOPF_BODEN) und L18 (`kopf`, FC:7644, *gelesen*; Kommentar FC:7622-7623, *gelesen*).
   - Die Drehung fehlt im Pool-Eintrag: DK:1908-1917 trägt x, y, z, L, leibM, masse und phase, aber keine `rotationY` (*gelesen*).
   - Gerechnet: frei bis 38,7° und dunkel ab 50,2° im Inkreis; in der Diagonale frei bis 29,5° und dunkel ab 40,3°.
   - Auch `lichtLeib` (L21) nimmt kb/2, also 0,13 m, kleiner als die Haube mit 0,20 m.
3. **`_lichtWurfTakt` kennt den Kopf nicht.**
   - Zeilen V5 (LICHT_WURF: bezugM, wichtigAb, halten, takt, weichPx) und L22 (LICHT_POOL umkreisM).
   - Die Wichtigkeit ist `augeZeig(Luma·(bezugM² + k²)^(−a/2)·Saum)` ohne `kopfSicht`, die Kugel gegen das Frustum ist isotrop (BS:493-507, *gelesen*).
   - Dieselbe Blindheit haben `_leuchtReichweite` (DK:1846-1851, *gelesen*) und Rang und Kugel der Wahl (DK:1879-1882, *gelesen*). Nur Stoff (SM:2423-2436) und Becken (DK:1819) lesen den Kopf (*gelesen*).
   - Gerechnet aus den Maßen (e B-2): die Haube wird zusätzlich im Würfel gezeichnet, weil near 0,22 m < Haubenboden 0,225 m.

## 5. An der Quelle gelesen (diese Welle)

92 Zeilen tragen die Marke (82 vor der Gegenlese; die Gegenlese las dazu S40, N33, A27, A28, A29, Q30, E22, E23, E24 und X11). Die zehn schwersten Aussagen, je mit dem Ort, an dem ich sie gelesen habe:
1. KEY_BASE 2,6 aus dem r128-Rig, LEGACY_LICHT π (WL:47-53).
2. AUGE p 0,2, q 0,42, welt 7,83, lux 115 000, eps, saum, anteil; dazu die Herleitung von p und die Behauptung „Sterne auf S“ (WL:54-93).
3. MOND_STAERKE 0,65, MOND_E, BELICHTUNG mit stufen, gleitung und nachtGrad −32 (WL:169-183).
4. NACHT_AUGE luxJeEinheit 0,26/0,224 und ihr Anker-Text (BK:2995-2998, 3011).
5. Neutral 0,76/0,15/0,08/6,25/0,04 im Vendor `mT`; `renderer.toneMapping` (DA:167-168).
6. BRENNER ohne kelvin; LICHT_GESETZ feuer 2000 K, laterne 1900 K / 960 cd/m², fenster 2800 K / 20 cd/m²; STRAHLER ε 0,0012 auf 250 cd kalibriert; `feuer.cdM2 = 10000` gesetzt; die Klemme 1 667 K (FC:6442-6545).
7. Kopf als Inkreis (Kommentar FC:7622-7623); `leuchte()` skaliert cdM2 (FC:7641), das niemand liest; `kopfSicht` (FC:7649-7653).
8. Die Kopf-Glut liest `LG[k].cdM2` je Schlüssel (DK:1626-1631); `_strahler` mit k4 ≥ 1 und Speicher 512 (DK:1756-1782); Reichweite isotrop mit Deckel 48 (DK:1846-1851); der Pool-Eintrag ohne Drehung (DK:1908-1917).
9. `_lichtWurfTakt` ohne Kopf (BS:486-547); der Pool-Term ohne Extinktion, Kopf nur am Punkt (SM:2352-2450).
10. Sonne `KEY_BASE·π·lum·…` und Mond `0,65·lightMul·…` (BH:1884-1898); Ambient 0,04·nacht mit Gefühl (BH:2246-2252); Hemi 0,1 (BH:2492); Wasser `max(0,22)` (BH:2566); Flamme T⁴ und ziel/k (FB:850, 896); die Luft-Konstanten und `_luftBeta` (FO:303-305, BH:2268-2277); S0_TON (diag-pruefbuehne.cjs:955-962).

**Abweichungen vom Bericht der Blätter:**
- Blatt f, Zeile 4, nennt MOND_STAERKE „mit Anker Skala S (0,26 lx → 0,58)“. An der Quelle ist 0,65 ein Bild-Anker (WL:155-168); die Skala S ist aus ihm abgeleitet, nicht umgekehrt. Die Tafel führt sie als Bild-Anker.
- Blatt d (#10, #11) führt die Sichtweiten als ohne Quelle, Blatt a als Beobachtung. Die Quelle sagt „beobachtbare Sichtweiten“, ohne Zitat (FO:303-305). Die Tafel führt sie als Anker ohne Zitat.
- Gegenlese: Blatt g (7) und h (B7) führen beide Knoten von `stufen` als Bild-Maß. Der Knoten 10° folgt aber aus `steigung` und der REF: 0,25 · log2(11 080 / 123 790) = −0,870 (gerechnet; BH:3401-3404). Nur der Knoten −20° (−2,17, Luma 44) ist ein Bild-Maß. Die Tafel trennt sie jetzt in A21 und A27.

## 6. Nicht gelesen, nicht gerechnet

- **Nicht selbst nachgelesen** sind alle Zeilen ohne Marke. Darunter:
  - der ganze Schatten-Block (V1–V4, V7–V13)
  - die Stoff-Looks (E5–E9)
  - Wolken (S31–S34)
  - Lava- und Esse-Zahlen (Q21–Q26)
  - die Studios (X1–X11)
  - die Zeilen der Blätter zu `_lavaLeucht`, `_brandGlutUm`, `_nachtAuge` im Rumpf, `_raumBlendeTakt`, `_spiegelUmgebung`
- **Nicht gerechnet:**
  - der Farbton am beleuchteten Boden (Albedo × Quelle, netto gegen die Nacht), also das, was S0_TON wirklich misst
  - die Wäsche des Herds auf der Wiese als Zahl
  - die Bestrahlung einer Laterne gegen S(A) über den Abstand
  - jede Zahl am Gerät (kein GPU-Lauf, kein Bild)
- **Die Zählung der Felder ist grob.** Die Blätter zählten verschieden, und Bündel wie S10 (18 Beiwerte) oder V3 (23 Schatten-Größen) sind aus den Blättern übernommen, nicht einzeln an der Quelle gezählt.
- **Die 57 Systeme sind die Bereinigung der 108 gemeldeten Wege, dazu der eine, den die Gegenlese fand.** Wo zwei Blätter denselben Weg verschieden schnitten (z. B. Decke als Licht c W14 gegen Decke als Verdeckung e W9), habe ich EINEN gezählt.
