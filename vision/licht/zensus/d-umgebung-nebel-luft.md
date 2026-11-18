# d — Umgebungs- und Halbraum-Licht · Nebel · Luft-Streuung · Wetter · Wolken

Stand: Zweig `strahler-leuchte` = 2ce8a033d, nur gelesen.
Kürzel der Dateien: fc = foundry-core.js · wl = welt-licht.js · ph = phyto-core.js · gc = gelaende-core.js ·
bh = stamm/bild-himmel.js · bs = stamm/bild-sicht.js · bsc = stamm/bild-schatten.js · bk = stamm/bild-kosten.js ·
sm = stamm/stoff-material.js · sd = stamm/stoff-dach.js · sb = stamm/siedlung-bewohner.js · da = stamm/daten.js ·
dan = stamm/dirigent-ankunft.js · dt = stamm/dirigent-takt.js · dk = stamm/dirigent-kern.js · pg = worlds/terrain/phytogenesis.js ·
vd = vendor/three.webgpu.min.js.

Klassen der Herkunft: **A** gesetzt mit Anker (Physik/Norm/Messung mit Quelle im Kommentar) · **M** gesetzt, geeicht am eigenen Bild
(Look-Messung, Radeon/GTX) · **G** gesetzt ohne Anker · **F** folgt (aus anderen Größen gerechnet) · **T** Technik (Auflösung, Takt,
Schrittzahl, Klemme; trägt kein Licht-Maß).

## 1. Tafel der Größen

| # | Name | Wert | Einheit | Anker | Def | Leser | Kl. |
|---|------|------|---------|-------|-----|-------|-----|
| 1 | ATMO_GESETZ.erdeM / randM | 6 360 000 / 6 460 000 | m | Bruneton/Hillaire (fc:284) | fc:291 | fc:343-344, wl:297-298 | A |
| 2 | rayleighH | 8000 | m | Skalenhöhe Rayleigh (Physik) | fc:292 | fc:327 → M.HR → wl:304,357 | A |
| 3 | rayleighTiefe | [0,044 · 0,1 · 0,23] | opt. Tiefe (ohne Einheit) | Bucholtz 1995 | fc:293 | fc:329,346; Welt ersetzt je Gesetz bh:1416 | A |
| 4 | rayleighTiefe „ferne" | [0,13 · 0,085 · 0,05] | opt. Tiefe | keiner („roter Staub") | da:91 | bh:1413-1416 | G |
| 5 | wellenNm | [680 · 550 · 440] | nm | Konvention der Kanäle | fc:294 | fc:336,339 | A |
| 6 | mieG | 0,7 | — | AERONET, Dubovik 2002 | fc:299 | fc:350 → wl:308,433 (phaseM) | A |
| 7 | mieAngstroem | 1,3 | — | AERONET Europa 1,2–1,4 | fc:300 | fc:337,340 | A |
| 8 | mieAlbedo | 0,9 | — | keine Quelle | fc:301 | fc:340 | G |
| 9 | ozon.mitteM / halbM / absorption | 25 000 / 15 000 / [0,65 · 1,881 · 0,085]e-6 | m / m / 1/m | nur Kopf „Hillaire" (fc:284), keine Zahl-Quelle | fc:302 | fc:351-355,376; wl:351-353 | A (schwach) |
| 10 | luft.sichtKlarM | 20 000 | m | „beobachtbar", ohne Quelle | fc:305 | fc:324 (betaKlar), bh:2274 | G |
| 11 | luft.sichtSturmM | 1 500 | m | „beobachtbar", ohne Quelle | fc:305 | bh:2275 | G |
| 12 | luft.betaRayleigh | 1,16e-5 | 1/m | Rayleigh 550 nm Meereshöhe | fc:305 | fc:328,334; bh:2274-2277 | A |
| 13 | luft.kontrast | 0,02 | — | Koschmieder-Norm | fc:305 | fc:324; bh:2273,2303; pg:3538 | A |
| 14 | luft.skalenHoeheM | 1 000 | m | Grenzschicht ~1 km (Größenordnung) | fc:305 | fc:347 (HM); bh:2330,2540 (Nebel-Knoten) | A (grob) |
| 15 | nacht.skala | 0,16 | sin(Höhe) | keiner | fc:312 | fc:390 | G |
| 16 | nacht.lum | 0,06 | Stellwert | keiner | fc:312 | fc:397; Welt-Leser unter dem Horizont nicht gefunden (bh:1890-1897 nimmt den Mond-Pfad) | G / ungelesen (Welt) |
| 17 | nacht.mond (Ton) | 0x9fb8dc | sRGB-Ton | „Purkinje", ohne Messung | fc:312 | wl:172,204-206; fc:393-395 | G |
| 18 | nacht.himmel (Ton) | 0x0d1931 | sRGB-Ton | geeicht an der alten Nacht (×1,3) | fc:312 | wl:228 (nur Ton); bh:2467 (Hemi-Farbe) | M |
| 19 | nacht.glutHoeheM | 90 000 | m | Airglow-Schicht | fc:312 | wl:611 | A |
| 20 | durchlassSchritte | 40 | Schritte | — | fc:313 | wl:34; bh:1438,1455,1802 | T |
| 21 | ATMO_BODEN | [0,1003 · 0,1385 · 0,0449] | Albedo | Albedo-Tafel (gemessen) | wl:39 | wl:45,780; bh:1428 | A |
| 22 | ATMO_ERDE | 0,1236 (grau) | Albedo | folgt aus #21 | wl:44 | wl:311 | F |
| 23 | KEY_BASE | 2,6 | Stellwert | r128-Rig, keiner | wl:49 | wl:783,789; bh:1889 | G |
| 24 | LEGACY_LICHT | π | — | r155-Umstellung | wl:53 | wl:783,789; bh:1889,2092 | A (Konvention) |
| 25 | E0 | 2,6·π·lightIntensity = 8,17 am klaren Mittag | „Welt-Einheit" | folgt aus #23 × #24 × Wetter | wl:788 | bh:1506,1622 → U.licht (wl:317) | F (aus G) |
| 26 | Brücke Welt ↔ lx (AUGE.welt/lux) | 7,83 ↔ 115 000 (1 Einheit Tag = 14 687 lx) | Welt-Einheit / lx | Mess-Wiese Mittag | wl:89-90 | wl:94,105 | M (Übergabe Auge) |
| 27 | MOONLIGHT.intensity | 0,65 | Welt-Einheit | Look-Messung Boden-Luma ≥ 22 (Radeon) | wl:169 | wl:172,207,1232; bh:1624,1897 | M |
| 28 | MOND_E | 0,462 | Welt-Einheit | folgt (0,65 × Luma 0x9fb8dc) | wl:172 | wl:180,225-226 | F |
| 29 | STERNENLICHT.leuchtdichte | MOND_E·0,0005/0,3965/π | Welt-Einheit (Leuchtdichte) | USNO Circ. 171 (Verhältnis) | wl:225 | wl:239 → bh:1515 → U.nachtE | F |
| 30 | STERNENLICHT.daemmer | MOND_E/π | Welt-Einheit | REF 3 lx bei −6° | wl:226 | wl:239 | F |
| 31 | tagAchse.nacht | smoothstep 0° … −6° | 0…1 | bürgerliche Dämmerung (Norm), Form gesetzt | wl:853 | bh:2251,2492,1396; wl:239 | Zeitplan |
| 32 | tagAchse.hell | 0,045 + 0,955·smooth((s+0,18)/0,6) | 0…1 | keiner | wl:854 | bh:2624 | G |
| 33 | GRENZGROESSE | Tafel 6 Knoten | Größenklasse | Astronomie der Dämmerung | wl:187 | wl:824-850 | A |
| 34 | WOLKEN_SCHICHT.hoeheM | 800 | m | Kumulus-Basis 0,6–1,5 km | wl:963 | wl:1050,1111; bh:138,175,1774 | A |
| 35 | tauJeMenge | 100 | τ je Menge | „Kumulus 20–100" (Rand der Spanne) | wl:973 | wl:1127 | A (schwach) |
| 36 | WOLKEN_SCHICHT.g | 0,85 | — | Mie der Tröpfchen | wl:974 | wl:1128 | A |
| 37 | WOLKEN_SCHICHT.deckung | [0,12 klar · 0,9 Regen] | Stellwert | Look („0,32 las schon bewölkt") | wl:970 | bh:151,1763-1764; wl:1268,1330 | G |
| 38 | steilMin · mittelMin | 0,05 · 0,05 | sin / Anteil | — | wl:964,969 | bh:176,209,219 | T (Klemme) |
| 39 | karte · zelleM · zugS · rand | 512 · 16 m · 0,1 s · 0,8 | — | — | wl:965-968 | bh:117,137,177-183,213 | T |
| 40 | HIMMEL_GESETZ (Wolken-Look, 17 Felder) | projY 0,16 · s1/s2 · dens · mixN · hor · litGrau · litSonne · litSa · bedeckt · bedecktK · edge · deck 0,92 · fbm | Stellwerte | Studio-Look, keiner | fc:125-140 | wl:1022-1052,1097-1105; bh:138,1774 | G |
| 41 | HIMMEL_GESETZ.drift · drift2 · grad | — | — | — | fc:128-129,139 | Welt: ungelesen (gesucht `HG.(grad|drift)`) | G / ungelesen |
| 42 | WX_GESETZ fog·sun·grey·rain (5 Zeilen) | z. B. klar 0,15/1/0/0 · nebel 1/0,48/0,46/0 · sturm 0,7/0,15/0,88/1 | Stellwerte | Labor-Presets, keiner | ph:4287-4294 | da:113-118 → bh:2274-2277 (fog,rain→β), da:22-28 (sun,grey→Licht), dt:2530 (sun→Godray), bh:1081-1093 (rain→Regen) | G |
| 43 | WX_LICHT sockel · sonne · direktHoch · himmelHub · himmelGrau | 0,35 · 0,65 · 3 · 0,35 · 0,82 | Stellwerte | keiner | ph:4302 | da:16,25-28 → bh:1194-1203,1889,1897,1303-1305,1757 | G |
| 44 | WEATHER_INTENSITY | sunny 0 · foggy 0,45 · cloudy 0,8 · rainy 1 · stormy 1,35 | Stellwert | keiner | da:42 | bh:2816-2817 (cloudCover bh:1764), bh:2874 | G |
| 45 | WEATHER_GREY_K | 0,7 | — | „Browser-tunbar" | da:130 | bh:1290 | G |
| 46 | Dunst-Koeffizient | 1,2267e-3 | 1/m je fog | folgt aus #10,#12,#13, WX.klar.fog | bh:2274 | bh:2277 | F (aus G) |
| 47 | Regen-Koeffizient | 1,7378e-3 | 1/m je rain | folgt aus #11,#12,#13,#46, WX.sturm | bh:2275 | bh:2277 | F (aus G) |
| 48 | β je Wort (gerechnet) | klar 1,96e-4 (20 km) · bewölkt 7,11e-4 (5,5 km) · nebel 1,24e-3 (3,16 km) · regen 1,55e-3 (2,53 km) · sturm 2,61e-3 (1,5 km) | 1/m (Sicht m) | folgt | bh:2270-2278 | bh:1475 (Medium), bh:2539 (Nebel-Knoten), bh:2304 | F |
| 49 | Hemi Stärke | 0,1 · nacht · lightMul | Welt-Einheit | Look („Nachthimmel-Boden") | bh:2492 | bs:2750-2756; bh:2227 | M |
| 50 | Hemi Boden-Farbe | 0x463c2e | sRGB | „Vorlagen-Hemi-Boden phytogenesis" | bh:2471 | bh:2489; bs:2752 | G |
| 51 | Hemi Himmel-Farbe | nacht.himmel × Tönung | — | folgt aus #18 | bh:2470 | bs:2751 | F (aus M) |
| 52 | Ambient Stärke | 0,04 · nacht (+ joy 0,08 · awe 0,05 · sorrow −0,04) | Welt-Einheit | Look (Stadt 00 Uhr Radeon) | bh:2251-2252 | bs:2747-2748; bh:2228 | M |
| 53 | Boot-Saat Ambient / Hemi | 0,6 / 0x88a0c8 · 0x3a2818 · 0,55 | — | „nur Saat" | dan:356,455 | überschrieben vor dem Licht (bh:2251,2470-2492) | ungelesen |
| 54 | Nenner der Tönung (_studioSky.top) | 0x6a9ed0 | sRGB | Look | fc:115 | bh:1207-1208,1755-1756,2468-2470 | G |
| 55 | Aura/Emotion-Tönung (auraTintStrength + ~18 Koeffizienten) | 0,3 · 0,3/0,6/1,0/0,4 · 0,4/0,3/0,6 · 0,25/0,7/0,5/0,15 · 0,5/0,2 · 0,35/0,6/0,5 · 0,15 | Stellwerte | keiner | bh:1216-1281 | bh:1303-1305 → U.toenung, E0 | G |
| 56 | Tönungs-Klammer | [0, 4] | Faktor | — | bh:1755 | bh:1756 | T (Klemme) |
| 57 | ATMO_LUT.mediumStufe · flug | 0,02 · 8 | log β / Stufen | — | wl:26-27 | bh:1474,2219 | T |
| 58 | SKY_ENV_REGEN_MIN_MS | 500 | ms Welt-Zeit | — | bh:3414 | bh:692 | T |
| 59 | HORIZONT_KARTE.luftProben | 8 | Proben | — | dan:1965 | bh:2380 | T |
| 60 | HIMMELS_SICHT.m (Höhle) | 3 | m (je Netz-Kante) | keiner | gc:4309 | gc:4315 | G |
| 61 | AUGEN_LICHT (Höhle) karteM · abfall · kernM · reichweiteM · kelvin · umkreisM · neuM | 2 · 1 · 8 · 20 · 4750 · 4 · 0,25 | m / — / m / m / K / m / m | Look (Werkbank 11.10.) | bh:3284-3292 | bh:2082-2085,2110,2121-2150 | M |
| 62 | RAUM kanteM · blendeS · blendeHellS · sprungM | 0,3 · 0,8 · 0,3 · 3 | m / s / s / m | keiner | sd:300 | sd:55; bh:2025-2028 | G |
| 63 | Raum-Licht je Decke (raumLicht) | Tageslicht-Quotient | Anteil | fachwerk `raumLicht` (Physik) | sd:194-216 | bs:718,721 (nur Umgebung); bh:2010-2022 | F |
| 64 | WASSER_GESETZ.koerper kd · c | see/fluss/bach je Kanal | 1/m | Pope & Fry 1997, Zaneveld 2003 | fc:179 | bh:2524-2536; pg:3538 | A |
| 65 | REGEN_GESETZ.farbe · deckung | 0xbcd2e2 · 0,72 | sRGB / Anteil | Labor, keiner | fc:203-204 | bh:1040,1093 | G |
| 66 | RAUCH_BILD deckMax · dunkel · woelbung · profil | 0,995 · 0,8 · 1,5 · 2 | — | keiner | sb:3869-3882 | sb:228,254,262,264 | G |
| 67 | GODRAY density · threshold · Abklang · schritte · skala | 0,55 · 0,8 · 0,96^i · 20 · 0,25 | — | GPU Gems 3 (Methode), Zahlen keiner | bk:2356-2357,1602; bk:3033 | bk:1583,1597-1602,1622 | G |
| 68 | Godray-Tor | smoothstep(0,5; 0,95; WX.sun) × (1 − nacht) | — | keiner | bh:1391-1398 | dt:2531-2532 | G |
| 69 | Labor-Nebel (Studio) | sight 120 m · fogNearMul 0,35 (linear) | m | keiner | fc:412-413 | pg:2918,3540-3541 (Welt: ungelesen) | G |
| 70 | Labor-Hemi (Studio) | 0xdfeecc / 0x463c2e / 0,55 | — | keiner | pg:558 | pg (eigene Szene) | G |
| 71 | Werkstatt-Bühnen (4 Rigs) | Ambient 0,6 · 0,6 · 0,65 · 0,55; Key 0,95/0,85; Fill 0,4 | — | keiner | stamm/werkstatt-hof.js:698,1348 · werkstatt-sozial.js:1168 · werkstatt-vorschau.js:333 | eigene Szenen | G |

## 2. Die Rechenwege

**W1 Durchlass der Sonne (Luft → Richtlicht).** `_luftBeta` (bh:2270, 1/m bei 550 nm) → in log-Stufen gerastet `_atmoMediumJetzt`
(bh:1475) → `ATMO_RECHNUNG.medium` (fc:326: Aerosol = β − βR, ×1000 → 1/km; Dunst nach Ångström, Tropfen neutral) →
`durchlass` am Ort des Spielers (fc:359, km, 40 Schritte) → `sonne` (fc:386: col = T/max, lum = max) → `dl.intensity =
KEY_BASE·π·lum·lightIntensity·direkt` (bh:1889). Einheit bricht: 1/m → 1/km → Durchlass (ohne Einheit) → Welt-Einheit (Stellwert
2,6·π); erst die Brücke #26 macht daraus lx. Danach × WX-Tafel (lightMul, direkt) — die Luft ist in derselben Zahl schon drin (s. Z1).

**W2 Himmel der Kuppel.** Medium-Uniforms (bh:1605-1613) → `passHimmel` (wl:635: Marsch 32 Schritte, Phase R + HG, Ψ_ms, Boden =
ATMO_BODEN, Sterne `nachtE` mit van Rhijn) → Tafel je Einheit E0 → `himmelFarbe` = × E0 × Tönung, Ergrauen `grau` (wl:934-938) →
`himmelSicht` (wl:1087) → Kuppel `colorNode` (bh:249). Einheit: 1/km im Marsch → Strahldichte je E0 → Welt-Einheit. Die Tönung (#54,
#55) ist ein Verhältnis zu einem Look-Blau, kein Licht.

**W3 Wolke im Himmel.** cloudCover = 0,12 + 0,78·WEATHER_INTENSITY (bh:1764, da:42) → `wolkenFeld` fbm + smoothstep (wl:999-1043,
Look-Zahlen #40) → Menge → τ = 100·Menge (wl:1127) → Zwei-Strom-Durchlass 1/(1+¾(1−g)τ) (wl:1129) × Licht der Oberseite
(Durchlass bis 800 m + Zenit-Himmel, wl:1111-1117) + HG-Saum (wl:1138) → `mix(sicht, …, Menge)` (wl:1140). Leser: Kuppel,
`himmelTafel` (Spiegel, Bühne). NICHT in rtEq/IBL, nicht in der Bestrahlungs-Tafel, nicht in der In-Streuung der Luft.

**W4 Umgebung (IBL) jedes Stoffs.** `passUmgebung` = Tafel ohne Wolken (wl:668) → rtEq 128×64 → PMREM (bh:719) →
`himmelDerStoffe` × E0 × Tönung × grau (wl:947) → `_spiegelUmgebung` (bs:680): Bestrahlung − Grat (`_horizontHimmel`) + Rückstrahl-
Boden (bsc:101) × Raum-Licht (sd:51) → `scene.environmentNode`. Boden zusätzlich `aoNode = aHimmel × Kontakt` (sm:2003).

**W5 Bestrahlungs-Tafel → CPU.** `passBestrahlung` (wl:676, 65 Sonnenhöhen, cos-gewichtet) → Rücklesung (bh:1678) → `bestrahlung`
(wl:898) → `_waagrechtIrradianz` = Richtlicht·Sicht + Himmel + Hemi + Ambient (bh:2186-2229) → Belichtung (bh:1960) und Umgebung A
der Pool-Skala (dk:1611-1619, `augeLux`). Einheit: Welt-Einheit → lx über #26 (Tag linear, Nacht-Ersatz über S⁻¹).

**W6 Die Luft (Nebel-Knoten).** β (#48) × Spektrum (bh:2289: (βR+mieExt)/1000β je Kanal) → `faktor` 1 − e^{−τ}, τ = β·s·e^{−(yAuge−y0)/H}
·d·(1−e^{−k})/k mit H = 1000 m für den GANZEN β (bh:2340-2354) → In-Streuung `farbeMit` = Himmels-Sicht ohne Wolken in
Blickrichtung (Blick nach unten auf y = 0 geklemmt, bh:2411) × (1 − Einfach-Anteil × (1 − Luftschatten)) (bh:2409-2418) →
`scene.fogNode` (bh:2453) für jeden Stoff mit `fog` (Vendor-Vorgabe fog = !0, vd); Feld/Panorama/Spiegel über `mische` (bs:1127,2145).
Einheit: 1/m durchgehend, Farbe Welt-Einheit.

**W7 Unter Wasser.** β = c[1] des Körpers, H → 1e9 (bh:2533-2534), Farbe = e^{−kd·Tiefe} × Luma der Himmels-Irradianz
(`_himmelsIrradianz`, bs:2770) (bh:2526-2532). 1/m, Anker #64.

**W8 Hemi der Nacht.** Ton nacht.himmel × Tönung, Boden 0x463c2e, Stärke 0,1·nacht·lightMul (bh:2467-2492) → r184-Hemi jedes
beleuchteten Stoffs + `_weltLicht` (bs:2750) + Belichtung (bh:2227). Welt-Einheit auf der Skala S, kein lx.

**W9 Ambient der Nacht.** 0,04·nacht ± Gefühl (bh:2251) → jeder Stoff + bs:2747 + bh:2228. Welt-Einheit, kein Wetter.

**W10 Sterne + Dämmerlicht.** `nachtHimmel` (wl:237-240) → `_atmoSternenLicht` (bh:1513) → U.nachtE / E0 (bh:1628) → im Marsch
über dem Horizont (wl:610-614) und letzte Spalte der Bestrahlungs-Tafel (wl:678-686).

**W11 Mond.** Direkt: 0,65 × lightMul × direkt × Durchlass(y)/Durchlass(Zenit) (bh:1897, bh:1798-1806). Im Himmel: mondE =
0,65·lightMul/E0 als Gewicht auf dem ABSOLUTEN Durchlass im Marsch (bh:1624-1625, wl:592-597).

**W12 Wurf der Wolken.** Karte 512² (bh:110-145) aus `wolkenFeld` × Gewicht (bh:150) → `_wolkenSchatten` = (1 − Menge)/(1 − Mittel),
höchstens 1/lightMul (bh:204-223) → Sonnen-Sicht jedes Empfängers. Das Mittel der Sonne trägt die WX-Tafel (lightMul), die Karte nur
das WO.

**W13 Wetter-Licht.** WX_GESETZ-Zeile (ph:4287) → WEATHER_TINTS: lightMul = 0,35 + 0,65·sun, direkt = (1−grey)³, himmel = 1 + 0,35·grey,
grau = 0,82·grey (da:22-28) → E0 (Himmel, Umgebung), dl.intensity (bh:1889), Hemi (bh:2492), U.grau (bh:1757).

**W14 Godrays.** Bild-Raum-Marsch zur Sonne (bk:1590-1603), Schwelle 0,8 auf der Luma des Bilds, Abklang 0,96^i, Stärke = Tor(WX.sun,
nacht) × Sicht der Scheibe (dt:2506-2532). Kein β, keine Phase, keine Einheit.

**W15 Rauch.** τ je Teilchen = −ln(1 − Deckung) (sb:228), Beer-Lambert auf einer Fläche, MeshStandard rau mit Kugel-Normale (sb:219,262)
+ Licht-Pool über `_leuchtStoff` (sb:162) + Luft (fog). Pool-Licht trifft ihn als Lambert-Fläche, nicht als Volumen.

**W16 Regen.** PointsNodeMaterial, Farbe 0xbcd2e2 fest, Deckung rain·0,72 (bh:1040,1093); NodeMaterial-Vorgabe lights = !1 (vd) —
die Schliere trägt kein Licht der Welt, nur Luft und Belichtung.

**W17 Höhle.** `himmelsSicht` je Netz-Kante e^{−step/3} (gc:4310-4336) → aHimmel → aoNode des Bodens (sm:2003) + Gewicht des
Augen-Lichts (sm:2396) + `_himmelAmAuge` → `_augenLichtStaerke` (bh:2101-2112, Pool-Platz mit Ersatz).

**W18 Raum.** Decke des Dach-Pools → Raum-Licht D + q·Σ Seiten (sd:113-133) → Faktor auf der Umgebung (bs:718,721) und der Blende
(bh:1972-1974, 2010-2029).

**W19 Licht der Welt (Feld, Panorama, Spiegel, Wasser).** (direkt·Sicht + Ambient + Hemi)/π + Sonde der PMREM-Stufe 1 + Rückstrahl
(bs:2683-2696). Liest dieselben Uniforms wie W4/W8/W9, ohne Raum-Faktor und ohne aHimmel.

**Pool-Quellen in der Luft (Kernfrage).** Quelle → Fläche: (d² + k)^(−a/2), Scheibe oder Punkt (sm:2433-2441) — KEINE Extinktion.
Fläche → Auge: der Pool steht im Leuchten (`em.add(_lichtPoolTerm)`, sm:2146) und läuft so durch `scene.fogNode` (bh:2448-2453) —
er wird gelöscht wie jede Fläche. In-Streuung: `farbeMit` liest nur die Himmels-Sicht (Sonne, Mond, Sterne; bh:2409-2417) — kein
Pool-Term (gesucht: `lichtLage|_lichtPoolTerm|atmoUniforms` in `_luftEnsure` bh:2315-2456: nicht gefunden). Antwort: die Luft rechnet
in 1/m aus EINEM Gesetz (Koschmieder-Anker fc:305 → Hillaire-Medium) für Sonne, Mond und Sterne; Laterne, Feuer und Lava streut sie
NICHT (kein Lichthof, kein Kegel im Dunst), sie löscht nur ihren Rückweg zum Auge.

## 3. Zwillinge und Brüche

Z1 **Das Wetter dämpft das Licht dreifach, aus zwei Tafeln.** (a) Medium: WX fog/rain → β (bh:2277) → Aerosol/Tropfen im Durchlass und
in den Tafeln (fc:328-341); im Sturm Zenit-τ ≈ 2,6 + 0,31 → T ≈ 0,05 (gerechnet). (b) dieselbe Sonne × lightMul × direkt (bh:1889):
Sturm 0,4475 × 0,0017. (c) Himmel × lightMul (E0) × himmelHub × grau (da:25-28, bh:1757). (b)/(c) sind Stellwerte ohne Anker (#42, #43),
(a) folgt aus Koschmieder — die Physik und die Tafel tragen dieselbe Trübung nebeneinander.

Z2 **Drei Wolken-Achsen.** cloudCover über WEATHER_INTENSITY (da:42, bh:1764) · Licht über WX sun/grey (da:22-28) · Trübung über WX fog/rain
(bh:2277). Nebel: cloudCover 0,47, WX nebel sun 0,48, grey 0,46 — keine folgt aus der anderen. Die gesehene Wolke (τ = 100·Menge,
wl:1127) dämpft kein Licht; die dämpfende Wolke (lightMul) ist unsichtbar; das IBL jedes Stoffs ist wolkenlos (wl:668) und die
In-Streuung der Luft auch (bh:2412-2417).

Z3 **Rayleigh zweimal.** luft.betaRayleigh 1,16e-5/m (fc:305) gegen rayleighTiefe[G]/rayleighH = 0,1/8000 m = 1,25e-5/m (fc:293,346).
Die Welt „ferne" tauscht rayleighTiefe (da:91, bh:1416), betaRayleigh bleibt der Erde — das Aerosol der Ferne (fc:328, bh:2274) zieht
den falschen Rayleigh ab.

Z4 **Zwei Skalenhöhen derselben Luft.** Tafeln: Rayleigh 8 km, Aerosol 1 km (fc:327,347). Nebel-Knoten: der ganze β mit 1 km
(bh:2330,2351,2387). Ab Höhe des Auges ≫ 1 km fällt im Knoten auch der Rayleigh-Anteil auf e^{−h/1000}.

Z5 **Mond in zwei Konventionen.** Direkt relativ zum Zenit (bh:1805-1806), im Himmel absolut (wl:592) — klare Luft G-Kanal ≈ 0,73
(gerechnet: τ 0,10 + 0,18 + Ozon 0,03): Mond-Himmel gegen Mond-Licht 27 % dunkler als Sonne-Himmel gegen Sonne. Unter Wetter: direkt
× lightMul × direkt, im Himmel × lightMul allein (bh:1624, bh:1897).

Z6 **Hemi und Ambient kennen kein Dach.** `_raumHimmel` hat genau zwei Leser, beide in der Umgebung (bs:718,721); Hemi 0,1·nacht und
Ambient 0,04·nacht (bh:2492,2251) erreichen jeden Innenraum ganz. aHimmel (aoNode) trägt nur der Boden-Stoff (sm:2003).

Z7 **Die Luft kennt kein Dach und keine Höhle.** In-Streuung = Himmel in Blickrichtung (bh:2409-2417) ohne Raum-/aHimmel-Faktor: im
Haus und in der Höhle legt der Nebel Himmelsfarbe vor die Wand (Sturm, 20 m: 5 %, gerechnet).

Z8 **Die Umgebung A der Pool-Skala ist immer draußen.** dk:1607-1619 liest `_belichtungE` „unter freiem Himmel" (bh:2186-2229 ohne
Raum, ohne aHimmel) — in Raum und Höhle steht A auf dem Licht von draußen (Übergabe Auge/Pool).

Z9 **Kuppel unter der Luft.** Sonne/Mond `fog: false` (dan:330,344), die Kuppel nicht (bh:251-256; Vendor fog = !0, vd) — der Knoten
mischt die Wolken auf 500 m mit wolkenlosem Himmel: am Horizont klar 9 %, Sturm 73 % (gerechnet, G-Kanal, Auge am Bezug).

Z10 **Godrays neben dem Luftschatten.** Zwei Wege der Sonnen-In-Streuung: der Luftschatten im Knoten (bh:2379-2405, aus β und
Horizont-Karte) und der Bild-Raum-Marsch (bk:1590-1603) mit gesetzter Dichte/Schwelle, Tor an WX.sun statt β (bh:1397).

Z11 **Boden-Albedo zweimal.** ATMO_BODEN gemessen (wl:39) gegen Hemi-Boden 0x463c2e (bh:2471) aus der Vorlage.

Z12 **Nebel ist kein Nebel.** WX nebel → β 1,24e-3 → Sicht 3,16 km (gerechnet aus bh:2274-2277); WMO-Nebel < 1 km. Die Zahl folgt aus
Stellwerten (#42), nicht aus einer Sichtweite des Worts.

Z13 **Regen ohne Licht.** Feste Farbe 0xbcd2e2, kein Licht-Leser (bh:1040; NodeMaterial lights = !1, vd): die Schliere ist mittags und
nachts gleich hell vor der Belichtung.

Z14 **Rauch ist eine Fläche, Luft ein Volumen.** Rauch nimmt Pool-Licht als Lambert-Fläche (sb:162,262), die Luft nimmt es gar nicht
(s. Kernfrage); die Phase der Tröpfchen/des Aerosols (fc:299, wl:974) liest der Rauch nicht.

Z15 **Labor und Werkstatt außerhalb des Gesetzes.** Labor: linearer Nebel 42–120 m (pg:2918,3540-3541, fc:412-413) und Hemi 0,55
(pg:558) gegen Koschmieder 20 km der Welt; vier Werkstatt-Bühnen mit eigenem Ambient/Key/Fill (#71).

Klammern, Deckel, Böden im Lichtweg: Tönung [0, 4] (bh:1755) · mittelMin 0,05 und Deckel 1/lightMul im Wolken-Wurf (bh:219-220) ·
steilMin 0,05 (bh:176,209) · Blick nach unten auf y = 0 (bh:2411) · max(0,22, dl.intensity) im Wasser (bh:2566) · Grau-Klemme
WEATHER_GREY_K (bh:1290) · himmelsSicht ≤ 120 Kanten (gc:4320) · tauSonne 28 bei Leuchtdichte 0 (bh:1461) · zustandMinLux (wl:88).
Zeitpläne statt Gesetz: tagAchse.nacht (wl:853) schaltet Hemi, Ambient und Dämmerlicht; tagAchse.hell (wl:854); WEATHER_TRANSITION
45 s (da:144); cloudCover linear über die Wort-Achse (bh:2817). Der Kommentar nennt „OFFEN" nur die Sonnenbahn (wl:797-805).

## 4. Zahlen der Domäne

- Getrennte Lichtwege: **19** in der Welt (W1–W19), dazu **2** außerhalb (Labor-Nebel/Hemi, Werkstatt-Rigs) = 21.
- Größen (Zeilen der Tafel): **71**.
- Davon GESETZT ohne Anker (G): **28** (#4, 8, 10, 11, 15, 16, 17, 23, 32, 37, 40, 41, 42, 43, 44, 45, 50, 54, 55, 60, 62, 65, 66, 67, 68,
  69, 70, 71); dazu 3 Zeilen, die nur aus G folgen (#25 E0, #46, #47) und 6 am eigenen Bild geeichte (M: #18, 26, 27, 49, 52, 61).
  Übrige: A 18 · F 10 (davon 3 aus G) · T 7 · Zeitplan 1 (#31) · nur Saat 1 (#53). Ungelesen in der Welt: #16, #41, #53, #69.
- Ambient-/Hemi-Terme nebeneinander: Tag **1** (IBL, × Grat × Rückstrahl × Raum, Boden × aHimmel); Nacht **4** (IBL mit Mond +
  Sterne/Dämmerlicht, Hemi, Ambient, Mond-Richtlicht als Füllung); Raum **1** Faktor (nur auf IBL); Höhle **2** (aHimmel, Augen-Licht);
  dazu 1 Labor-Hemi und 4 Werkstatt-Ambients.
- Einheiten-Brüche: 1/m (Luft, bh) → 1/km (Medium, fc) → Durchlass → Welt-Einheit (KEY_BASE·π, G) → lx nur über #26 (Tag linear, Nacht S⁻¹).

## 5. Nicht gelesen · Übergaben

Nicht gelesen: worlds/terrain/phytogenesis.js über die genannten Zeilen hinaus; bs Feld-Pass/Panorama/Spiegel außer bs:1127,2145 und
bs:2640-2817; dan `_horizontSicht`/`_horizontHimmel` (dan:1552-1640, nur Konstanten); bsc Rückstrahl-Pass ab bsc:133; fachwerk
`raumLicht`/`raumSonne`/`LICHT_GESETZ`; stamm/wasser-*.js (Spiegel des Wassers); bk NACHT_AUGE (bk:3009) und die Post-Kette;
stamm/stoff-instanz.js:44 (`BU.hell`); stamm/feld-brand.js (Brand-Rauch, nur bis zum Aufruf); Studios unter worlds/ außer pg.

Übergaben:
- Auge/Belichtung: AUGE p/q/welt/lux (wl:84-93), Umgebung A immer draußen (dk:1607-1619), zielKarte/steigung/stufen (wl:173-183).
- Pool/Quellen: Abfall ohne Luft (sm:2433-2441), `_leuchtTakt` (dk:1600), Augen-Licht als Pool-Platz (bh:2065-2093).
- Sonne/Mond-Körper: sonneLeucht 4, mondGegenHimmel 0,5 (bh:3349-3355), Sonnenbahn OFFEN (wl:797).
- Material/Nässe: `_naesseImStoff` (sm:2126), AERIAL (sm:3943, Name trügt: keine Luft).
- Wasser: Spiegel-Himmel `_himmelSicht` (bh:227), WASSER_GESETZ.spiegel.dim (fc:158).
- Studio/Bühne: `buehne` ohne Luft und ohne Nacht (wl:1219-1223,1301), Labor-Nebel (pg:2918), Werkstatt-Rigs (#71).
