# (c) LEUCHTE · FENSTER · EMISSIVE DER STADT — Befund (nur gelesen, Stand strahler-leuchte 2ce8a033d)

Kürzel: FC = fachwerk-core.js · DK = stamm/dirigent-kern.js · SM = stamm/stoff-material.js · SS = stamm/studio-stoff.js ·
BS = stamm/bild-schatten.js · BH = stamm/bild-himmel.js · ST = stamm/siedlung-tor.js · SZ = stamm/siedlung-satz.js ·
SO = stamm/siedlung-ort.js · WL = welt-licht.js · PC = porta-core.js · VC = vehicle-core.js · LAB = worlds/fachwerk/fachwerk.js.
Status: F = FOLGT (aus Physik/anderem Datum gerechnet) · GA = GESETZT mit Anker im Kommentar · G0 = GESETZT ohne Anker. n = Zahl der Skalare.

## 1. TAFEL DER GRÖSSEN

| # | Name | Wert | Einheit | Anker | Def. | Leser | n | St. |
|---|------|------|---------|-------|------|-------|---|-----|
| 1 | BRENNER.*.candela (docht, argand, gas, gluehstrumpf) | 1 · 10 · 16 · 100 | cd | Kerze = Einheit; Argand 6–10 Kerzen; 16-Kerzen-Gas; Auer 60–100 (FC:6434-6437) | FC:6443-6446 | `leuchte` FC:7637 (Verhältnis v), FC:7640; LICHT_GESETZ.laterne.candela FC:6458 | 4 | GA |
| 2 | BRENNER.gluehlampe.candela | 110 | cd | 1 380 lm ÷ 4π (FC:6438) | FC:6447 | `leuchte` FC:7637 | 1 | F |
| 3 | BRENNER.*.ab | −∞ · 1784 · 1826 · 1892 (gluehlampe: kein ab) | Jahr | Historie (FC:6434-6437) | FC:6443-6446 | `brennerVon` FC:6451 | 4 | GA |
| 4 | BRENNER.*.flammeM | 0,04 · 0,06 · 0,05 · 0,08 · 0,06 | m | keiner | FC:6443-6447 | `leuchte` FC:7636 (s = flammeM/2 → `kopf`) | 5 | G0 |
| 5 | Kelvin je Brenner | — | K | — | nicht gefunden (gesucht: `kelvin` in BRENNER, FC:6442-6448) | — | 0 | — |
| 6 | Elektro-Schwelle der Stadt: rj < 1895, plan.jahr < 1930, dL < 0,45, R9L·0,80, Exponent 0,82 | s. links | Jahr / Stellwert | „Berlin-Wahrheit" (narrativ) | FC:5686-5688 | `dorfLayout` FC:5688 (`brenner`) | 5 | G0 |
| 7 | LICHT_GESETZ.laterne.kelvin | 1900 | K | keiner („Gaslicht") | FC:6458 | `_lichtLinear` DK:1743 über DK:1627 (Glut) und DK:1705 (Pool); LAB:650 | 1 | G0 |
| 8 | LICHT_GESETZ.laterne.candela | 100 | cd | = BRENNER.gluehstrumpf | FC:6458 | `leuchte` FC:7640; Wandlaterne FC:6475; DK:1839 | 1 | F |
| 9 | LICHT_GESETZ.laterne.cdM2 | 960 | cd/m² | Kommentar: 100 cd über 0,26 × 0,40 m (FC:6423-6424) — als Zahl gesetzt, nicht gerechnet | FC:6458 | DK:1629 (`lichtGlut.laterne`), LAB:670; `leuchte` FC:7641 (Ergebnis ungelesen, s. #26) | 1 | GA |
| 10 | LICHT_GESETZ.laterne.abfall | 2 | — | 1/d² (Physik) | FC:6458 | Stoff SM:2435 (`farbe.a`), DK:1711, BS:499 | 1 | F |
| 11 | LICHT_GESETZ.laterne.kernM | 0,1 | m | keiner (die Fläche des Glases gäbe √(0,104/π) = 0,18; die Flamme 0,08) | FC:6458 | DK:1710, DK:1817, `laterneWandM` FC:9422, Wandlaterne FC:6468, BS:538 | 1 | G0 |
| 12 | LICHT_GESETZ.laterne.hoeheM | 3,6 | m | Lichthöhe des Labors (FC:6422-6423) | FC:6458 | AUS_MASS FC:8012, DK:1911, `laterneWandM` FC:9422 | 1 | GA |
| 13 | LICHT_GESETZ.fenster.kelvin | 2800 | K | Bild-Urteil V18.542 (FC:6421) | FC:6457 | DK:1627, LAB:650 | 1 | GA |
| 14 | LICHT_GESETZ.fenster.cdM2 | 20 | cd/m² | 80 lx · 0,8 ÷ π (FC:6421-6422) | FC:6457 | DK:1629, LAB:667, scripts/diag-pruefbuehne.cjs:471 | 1 | GA |
| 15 | wandlaterne hoeheM · armM | 2,8 · 0,4 | m | keiner | FC:6482 | FC:6466-6481, AUS_MASS FC:8022-8027, `wandLaternen` FC:9321 | 2 | G0 |
| 16 | Wand-Faktor K66 („die Wand trägt höchstens das Doppelte der Gasse") | 2 | Verhältnis | Gestaltungs-Regel | FC:6467 (`Math.pow(2, …)`), FC:9422 (`/ 2`) | Wandlaterne-Kern, `laterneWandM` | 1 | G0 |
| 17 | wandlaterne.kernM | 2,742 | m | aus #15, #16, #10, #11 | FC:6468, FC:6478 | DK:1710, DK:1817, BS:538 | 1 | F |
| 18 | wandlaterne.candela | 118,427 | cd | E unter ihr = E unter dem Mast | FC:6475 | `leuchte` FC:7640, DK:1839 | 1 | F |
| 19 | wandlaterne.cdM2 | 960 | cd/m² | = #9 | FC:6476 | `lichtGlut.wandlaterne` DK:1629 — kein Stoff liest den Schlüssel (s. Bruch B4) | 1 | F |
| 20 | KOPF_BODEN ueber · dick | 0,04 · 0,03 | m | Bau-Maß | FC:7615 | FC:7644, FC:7657-7658 | 2 | G0 |
| 21 | AUS_MASS.laterne kb · kh · hb · Haube | 0,26 · 0,40 · 0,20 · 0,20 | m | „die Gaslaterne der Gasse" ohne Quelle | FC:8011-8013 | `leuchte` FC:7644, `lichtLeib` FC:7979, `ausLaterneKopf` FC:7656-7672 | 4 | G0 |
| 22 | AUS_MASS.wandlaterne kb · kh · hb | 0,22 · 0,34 · 0,17 (≈ 0,85 × #21) | m | Faktor 0,85 gesetzt | FC:8023-8031 | wie #21 | 3 | G0 |
| 23 | `leuchte(id,brenner).kopf` | Laterne/Glühstrumpf [5; 5; 3,75; −4,25] | halbe Flammen-Höhen | aus #4, #20, #21 | FC:7644 | DK:1716 → `lichtKopf` → SM:2424-2432; DK:1819 (`kopfSicht`) | 1 | F |
| 24 | `leuchte().candela` | #8 × Brenner/100 | cd | aus #1 | FC:7640 | DK:1839 | 1 | F |
| 25 | `lichtLeib(id)` | Laterne 0,2 | m | max(Halb-Kopf-Höhe, kb/2) | FC:7974-7980 | DK:1988 → BS:539 | 1 | F |
| 26 | `leuchte().cdM2` (Brenner-skaliert) | #9 × Brenner/100 | cd/m² | aus #1 | FC:7641 | **ungelesen** (gesucht: `.cdM2` in stamm/, worlds/fachwerk/, scripts/) | 1 | F |
| 27 | LICHT_POOL plaetze · umkreisM · wahlS · wahlM · blendeS | 4 · 48 · 0,25 · 1 · 0,5 | Stück · m · s · m · s | keiner | SM:3899 | DK:1642, 1650, 1652, 1657, DK:1850 | 5 | G0 |
| 28 | Reichweiten-Raster | ½ | m | „die Karte des Wurfs liest sie als Stand" | DK:1850 (`ceil(R*2)/2`) | BS:516 | 1 | G0 |
| 29 | Höhen-Konvention des Eintrags | +0,5 / −0,5 | m | Konvention | SO:559 (`wy + 0.5`), ST:773, DK:1911 (`p.y - 0.5`) | Pool-Lage | 1 | G0 |
| 30 | LICHT_WURF nahM · kernAnteil · leibSaum · bezugM · wichtigAb · halten · takt | 0,05 · 1 · 0,02 · 2 · 0,25 · 1,25 · 3 | m · — · m · m · — · — · Bilder | Messung zu leibSaum (BS:535-537), sonst keiner | BS:1698-1708 | BS:496-539 | 7 | G0 |
| 31 | FENSTER_SCHLAF | 0,45 | Anteil | keiner („nicht jedes Haus wacht") | FC:2755 | `fensterSchlaeft` FC:2762 → FC:1080, FC:2798 | 1 | G0 |
| 32 | glas.opacity (Fenster und Laternen-Glas) | 0,42 | Deckkraft | keiner | FC:2071, FC:2090 | Durchlass `raumVon` FC:6027; SS:342 | 1 | G0 |
| 33 | INNEN_DAEMMER | 0,92 | Faktor | Messung 176 vs 60 (FC:2764-2765) | FC:2771 | FC:2776 | 1 | GA |
| 34 | RAUM_LICHT himmel · kante | 0,5 · 0,35 | Anteil · m | himmel: halbe Kuppel (Geometrie); kante keiner | FC:5999 | FC:6030, FC:6062 | 2 | F/G0 |
| 35 | RAUM kanteM · blendeS · blendeHellS · sprungM | 0,3 · 0,8 · 0,3 · 3 | m · s · s · m | keiner | stamm/stoff-dach.js:300 | BH:2025-2028 | 4 | G0 |
| 36 | AUGEN_LICHT karteM · abfall · kernM · reichweiteM | 2 · 1 · 8 · 20 | m · — · m · m | Bild-Messung Werkbank 11.10. (BH:3279-3281) | BH:3285-3288 | BH:2083-2086, BH:2110, DK:1848 | 4 | GA |
| 37 | AUGEN_LICHT kelvin | 4750 | K | Farbort des alten Hex 0xffe2c6 (BH:3281-3282) | BH:3289 | DK:1743 | 1 | GA |
| 38 | AUGEN_LICHT umkreisM · neuM | 4 · 0,25 | m | keiner | BH:3290-3291 | BH:2126 ff. | 2 | G0 |
| 39 | GLUT_GESETZ.candela (Tor) | 15 | cd je Labor-Einheit | „weniger als eine Gaslaterne" | PC:1732 | ST:776 | 1 | G0 |
| 40 | GLUT_GESETZ i0 · iOpen · pulseBase · pulseAmp | 0,3 · 3,4 · 0,8 · 0,28 | Stellwert ohne Einheit (r128-PointLight) | keiner | PC:1725-1728 | `glutIntensity` PC:1738 → ST:776; worlds/portale/porta.js:216 | 4 | G0 |
| 41 | GLUT_GESETZ color · ySpring | 0xffd9a0 · 0,55 | sRGB-Hex · Anteil | keiner | PC:1722, PC:1729 | DK:1745, ST:773 | 2 | G0 |
| 42 | GLUT_GESETZ dist | 14 | m | — | PC:1723 | Welt ungelesen; nur worlds/portale/porta.js:181 | 1 | G0 |
| 43 | GLUT_GESETZ decay · Tor-kernM | 2 · 0,5·spanW·scale | — · m | Physik · Geometrie | PC:1724, ST:771 | SM:2435, DK:1710 | 2 | F |
| 44 | Fahrzeug-Emissive ei: drl · lensW · lensR · lensA · Epoche-laterne · lichtKante | 0,9 · 1,1 · 0,85 · 0,8 · 1,0 · 1,6 (je mit Hex) | Stellwert ohne Einheit | keiner | VC:164-186, VC:340-341 | Brücke stamm/koerper-leib.js:1455-1457 → phyto `budgetRegler` phyto-core.js:5985-5986 → SS:344-346 bzw. SZ:85-91 → `aGlut` SS:724 | 12 | G0 |
| 45 | Porta-Rahmen-Emissive | lerp(0,04; 0,55; glow) · 0,3+0,6g · 0,4+0,6g · 0,4+0,5g | Stellwert | keiner | PC:1331-1334 | wie #44 | 4 | G0 |
| 46 | Glimmen der Bauten aus Tags: Boden · Skala · Deckel | 0,5 · 0,6 · 1,5 | Stellwert | keiner | SM:892-899 | `mat.emissiveIntensity` SM:900; stamm/siedlung-bauten.js:975, 995 | 3 | G0 |
| 47 | emissiveBoost Esse (Kohlen-Bett) · Kristall glow | 1,5 / 1,7 · 0,7–1,7 (×0,6) | Stellwert | keiner | stamm/bau-teile.js:1774, 1641, 1652 | SM:898 | 3 | G0 |
| 48 | Dorf-Licht LICHT_MARKE_M · DORF_LICHT_WEG · Mast-Abstand · Brunnen-Abstand | 10 · 25 · 9 · 2 | m | „nacht-wand 69 %" (Messung zum Rückgang von 25 auf 10, FC:9307-9308) | FC:9310, FC:5690-5692 | `wandLaternen` FC:9390; `setz` FC:5692 | 4 | G0 |
| 49 | `laterneWandM` | 2,55 | m | aus #10–#12, #16 | FC:9420-9423 | `mastWeicht` FC:9434, `laterneFrei` | 1 | F |

Summe n = 113 Skalare (Zeilen 1–49). F 14 (#2, #8, #10, #17, #18, #19, #23, #24, #25, #26, #34 himmel, #43 ×2, #49) · GA 18 (#1 ×4, #3 ×4, #9, #12, #13, #14, #33, #36 ×4, #37) · G0 81.

## 2. DIE RECHENWEGE

**W1 Leuchte → Licht-Pool im Stoff.** Plan: `dorfLayout` setzt `brenner` je Laterne (FC:5688, FC:5692; Wand: FC:9368 `lay.brenner`) → `spawnArchitecture` stempelt `entry.brenner` (SZ:1429-1435) → `_lichtDatumDerGestalt` ruft `leuchte(studioGestalt, brenner)` (DK:1977-1982, FC:7626-7646): candela [cd], kopf [halbe Flammen-Höhen] → `_leuchtCandela` candela × masse × (1 + Flackern) [cd] (DK:1834-1840) → `farbe = lichtFarbe(kelvin) × I ÷ Luma` (DK:1711-1712), `lichtKopf` (DK:1716) → Stoff: E = candela · (d² + k²)^(−abfall/2) · kopfSicht [lx] (SM:2433-2441) → Summe in lx → Auge `S(A)·((1+E/A)^q − 1)` (SM:2359-2365) → Welt-Einheit. Einheit bricht an SM:2362-2365 (lx → Skala S, welt-licht).

**W2 Leuchte → Becken am Auge (CPU-Zwilling von W1).** `_beckenAmAuge` (DK:1799-1832): dieselbe Candela ohne Flackern × Blende, E = I/(d²+k²) × `kopfSicht` (DK:1819) × Saum smoothstep [lx] → `augeMesser` × `augeMass` (BH:1957-1959) → Belichtung der Kamera. Liest den Kopf.

**W3 Leuchte → Reichweite, Wahl, Rang.** `augeReichweite(candela, Umgebung)` [m] (WL:144-148) isotrop → `_leuchtReichweite` Deckel `min(48, ceil(2R)/2)` und Boden `R > kernM` (DK:1846-1851) → `_leuchtQuellen` Kugel (q, R) gegen das Frustum, Rang 1e9/1e3 (DK:1877-1882). Kennt den Kopf nicht.

**W4 Leuchte → Wurf (Würfel-Schatten).** `_lichtWurfTakt` (BS:474-557): Wichtigkeit = `augeZeig(Luma(farbe) · (bezugM² + k²)^(−abfall/2) · Saum)` × (R/Abstand)² (BS:496-507), Kugel lage.w gegen Frustum (BS:493), Würfel-Kamera near = lichtLeib + leibSaum, far = R (BS:538-545). Kennt den Kopf nicht (kein `kopfSicht`, keine Halbschatten-Richtung; der Würfel zeichnet alle sechs Seiten).

**W5 Laternen-Kopf-Glut.** Glas-Stoff `laternenglas` trägt `__licht='laterne'` (FC:2097) → Brücke `mat.licht` (koerper-leib.js:1454, foundry-bruecke.js:709) → `_leuchtStoff`: emissive += `lichtGlut['laterne']` (SM:2141-2146) ← EIN Uniform je Schlüssel von LICHT_GESETZ mit cdM2 > 0 (SM:740-744) ← `_leuchtTakt`: Farbe `lichtFarbe(LG[k].kelvin)` auf Luma 1 × `augeGlut(LG[k].cdM2, Umgebung) × augeMass` (DK:1626-1631; WL:138-142: E = π·L [lx] → S(A+E)·E/(A+E)/π). Gelesen wird `LICHT_GESETZ.laterne`, nicht `leuchte(…, brenner)`. Einheit: cd/m² → lx (×π) → Skala S → Welt-Einheit.

**W6 Fenster-Glut.** `fensterSchlaeft` (FC:2756-2763, 45 % schlafen) wählt `glas` oder `glasdunkel` (FC:1080; fern FC:2798-2799) → `glas.__licht='fenster'` (FC:2098) → wie W5 mit `LICHT_GESETZ.fenster` (cdM2 20, 2800 K). Kein Beitrag zum Pool, kein Licht aus dem Fenster auf Gasse oder Raum.

**W7 Tor → Pool.** `_tickPortalLicht` (ST:753-777): candela = `glutIntensity(act, puls)` [Labor-Stellwert, 0,24–4,8] × 15 [cd] (PC:1734-1739, PC:1732), Farbe sRGB-Hex (DK:1745), kernM = halber Bogen → `_leuchtQuellen` (DK:1960-1961) → W1/W3/W4.

**W8 Tor-Membran (Ziel-Bild).** Zielbild × `uBelicht` vor dem Nacht-Auge (ST:271-278) — ein Bild, keine Leuchtdichte, keine Candela; unabhängig von W7.

**W9 Fahrzeug-Emissive.** Hex × ei (VC:162-189, VC:340-341, VC:361-363) → `mp.emissive`/`emissiveIntensity` (koerper-leib.js:1455-1457) → `budgetRegler` (phyto-core.js:5968, 5985-5986) → `mat.emissive`, `emissiveIntensity` (SS:344-346); seh „glut" → `_leuchtStoff` markiert „quelle" und kehrt zurück (SM:2122-2125): kein Auge, kein Pool. Stellwert in Welt-Einheit, mittags = nachts.

**W10 Porta-Rahmen-Emissive.** HSL × lerp(p.glow) (PC:1331-1334) → wie W9.

**W11 Glimmen der Bauten aus Tags.** `responseProfile.emissiv − 0,5` × 0,6 × emissiveBoost, Deckel 1,5 (SM:892-900); Esse-Kohlenbett boost 1,5/1,7 (bau-teile.js:1774). Stellwert, ohne Auge. (Das Licht derselben Esse geht als Strahler in den Pool: DK:1896-1904 — Bild und Licht aus zwei Quellen.)

**W12 Satz-Transport `aGlut`.** `_satzRegler`: glut = em × emI des Studio-Stoffs (SZ:85-91) → je Ecke derselbe Wert (SZ:460-466) → `emissiveNode = attribute("aGlut").xyz` (SS:723-724); `mp.licht` bleibt im Satz-Stoff (SZ:74-80) → W5 addiert dazu. Trägt W9/W10 in den Satz; Ausstattung (Laterne) und Tor zeichnen im Bau-Satz (SZ:1589-1594).

**W13 Licht des Auges (ersatz).** `_augenLichtStaerke(h, k)` = (2ⁿ − h) · zielKarte·π/0,18 ÷ (k · lichtAbfall(karteM)) (BH:2101-2112) ÷ LEGACY_LICHT (BH:2092) → `_laborLichtStaerke` × π (DK:2011-2013) → farbe × (1+k²)^(abfall/2) (DK:1711), Saum (1 − (d/R)⁴)² (SM:2447). Einheit: Belichtungs-Zahl der Kamera, kein cd, kein lx; außerhalb der Summe des Auges (SM:2356).

**W14 Raum-Licht und Blende.** Öffnungen (`lichtAuf` FC:323) → `raumLicht` Tageslicht-Quotient D (FC:6042-6065), `raumSonne` (FC:6072-6105) → `deckenZeile` → `_raumBlendeTakt` Stufen log2((D + Feld) × Himmels-Anteil), Tiefpass (BH:1983-2031) → Belichtung × 2^(…) (BH:1972-1974). Keine Lampe im Raum: nachts trägt der Raum nur, was von außen kommt.

**W15 Labor fachwerk (r128).** Fenster- und Kopf-Glut über dasselbe `augeGlut` mit `LICHT_GESETZ.fenster/laterne` (LAB:667-671) als `emissiveIntensity`; Herdfeuer als PointLight mit Legacy-Abfall, Strahler-Fläche π·kernM²/4 (LAB:652-655, 675, 1052). Die Laternen des Labors werfen kein Licht (gesucht: PointLight je Laterne in LAB — nicht gefunden).

**W16 Labor porta.** PointLight color/i0/dist/decay, Stärke `glutIntensity` ohne ×15 und ohne Auge, fail-soft-Literale (worlds/portale/porta.js:180-181, 215-216).

## 3. ZWILLINGE UND BRÜCHE

**B1 Die Kopf-Glut liest EINE Zahl je Schlüssel, nicht je Brenner (offener Punkt 1).** Die Glut der Laterne kommt aus `LICHT_GESETZ[k].cdM2` und `.kelvin` (DK:1626-1631) über EIN Uniform je Schlüssel (SM:740-744; ein Knoten je Datum SM:2113-2114, SM:2138-2146). `leuchte()` skaliert `cdM2` mit dem Brenner (FC:7641), das Ergebnis ist ungelesen (#26). Folge (aus den Zahlen gerechnet): Docht 1 cd im Pool, Kopf glüht mit 960 statt 9,6 cd/m² (×100); Gas 16 cd → ×6,25; Glühlampe 110 cd → ×0,91. Kelvin je Brenner existiert nicht (FC:6442-6448): Docht, Gas, Glühstrumpf und Glühlampe glühen und leuchten alle in 1900 K. Kanäle je Instanz, die es gibt: (a) Senke: `instanceMatrix` (Storage, stoff-instanz.js:319-320), `instanceColor` — r184 multipliziert ihn nur in die Albedo (`setupDiffuseColor`: `vInstanceColor.mul(s)`, vendor/three.webgpu.min.js), nie ins Emissiv; Fassade `aH0`/`aH0L`/`aKarte`/`aEin` (siedlung-instanz.js:341-370, 390-425; Leser LOD/Karte). (b) Bau-Satz (Laterne als `ausstattung`, SZ:1591): je Ecke `color` (× Instanz-Farbe gebacken, SZ:425-427), `aRegler`, `aGlut` (half×3 + aLageV, SZ:1624) — `aGlut` ist ein Emissiv-Kanal je Ecke, gefüllt je BEREICH aus dem Stoff (SZ:85-91, SZ:460-466), nicht aus dem Eintrag. Der Brenner reist bis `entry.brenner` (SZ:1434) und von dort nur in den Pool (DK:1980).

**B2 Der Kopf als Inkreis (offener Punkt 2).** `kopf` nimmt Haube `hb` und Boden `(kb + ueber)/2` als Radius (FC:7644); Kommentar FC:7622-7623 nennt es. `kopfSicht` (FC:7649-7653) und der Stoff (SM:2423-2432) rechnen mit der waagrechten Entfernung `a` allein — rotationssymmetrisch. `entry.rotationY` wird gesetzt (SO:568), reist aber nicht in den Pool-Eintrag (DK:1908-1917: x, y, z, L, leibM, masse, phase). Gerechnet aus den Maßen: in der Diagonale steht die Haubenkante bei 0,283 m statt 0,20 m — die Flamme ist dort ab 29,5° (statt 38,7°) angeschnitten und ab 40,3° (statt 50,2°) ganz verdeckt. Die Wandlaterne: Wandplatte und Arm (asymmetrisch zur Wand, FC:8027-8031) fehlen in `kopf` ganz. `lichtLeib` nimmt ebenfalls kb/2 (FC:7979), die Haube hb = 0,2 > kb/2 = 0,13 liegt außerhalb.

**B3 Reichweite, Rang und Wurf kennen den Kopf nicht (offener Punkt 3).** Drei Leser derselben Quelle mit Kopf: Stoff (SM:2420-2436) und Becken (DK:1819). Ohne Kopf: `_leuchtReichweite` (DK:1846-1851, `augeReichweite` isotrop WL:144-148), Kugel und Rang der Wahl (DK:1879-1882), `_lichtWurfTakt` — Wichtigkeit ohne `kopfSicht` (BS:496-504), Frustum-Kugel (BS:493), Würfel mit sechs Seiten und far = R (BS:531-545). Die Kugel über der Haube (wo der Stoff 0 zeigt) zählt für Wahl und Wurf voll. Kein Linsen-Leser von `kopf`/`kopfSicht`/`BRENNER` in scripts/ (gesucht: `leuchte(`, `kopfSicht`, `lichtKopf`, `brennerVon`, `BRENNER` — 0 Treffer).

**B4 `lichtGlut.wandlaterne` ungelesen.** Der Schlüssel entsteht, weil wandlaterne.cdM2 > 0 (SM:742) und wird je Bild geschrieben (DK:1626); das Glas der Wandlaterne ist dieselbe Rolle `laternenglas` mit `__licht='laterne'` (FC:2097, FC:7659) — kein Stoff trägt `licht:'wandlaterne'` (gesucht `__licht` in *.js).

**B5 Wandlaterne: Kern als Klammer, Candela ≠ Leuchtdichte × Fläche.** kernM 2,742 m (#17) ist keine Ausdehnung der Quelle (Kopf 0,22 m), sondern das Wand-Gesetz als Kern (FC:6462-6468); BS:535-537 und FC:7971-7972 nennen die Folge (nichts warf in 2,7 m). Candela 118,4 (FC:6475) gegen 960 cd/m² × Glas-Seite 0,22 × 0,31 m = 65,5 cd; bei der Laterne 0,26 × 0,37 = 0,096 m² → 92 cd gegen 100 (FC:6423-6424 rechnet 0,26 × 0,40 ohne KOPF_BODEN.dick). `kernM` heißt an drei Stellen dreierlei: Radius der Fläche (`strahler` FC:6544), Durchmesser des Betts (feuer.kernM 0,76 „Ø", FC:6420, LAB:653 `π·kernM²/4`), Wand-Klammer (Wandlaterne).

**B6 Fünf Emissions-Arten in der gebauten Welt.** (i) Candela-Datum mit Kopf (`leuchte`: Laterne, Wandlaterne); (ii) Candela als Labor-Stellwert × 15 mit sRGB-Farbe ohne Kelvin (Tor, PC:1721-1739, DK:1744-1745); (iii) Leuchtdichte-Fläche ohne Licht (Fenster, Kopf-Glas: `lichtGlut` je Schlüssel); (iv) Stellwert-Emissiv ohne Auge (Fahrzeug VC:162-189/340-341, Porta-Rahmen PC:1331-1334, Glimmen SM:892-900, Satz-`aGlut` SS:724) — leuchtet mittags wie nachts, wirft kein Licht; (v) Ersatz in der Zahl der Kamera (Auge, BH:2065-2112). Dazu (vi) das Bild der Membran (ST:271-278). Die Fahrzeug-Laterne (`EPOCHE_STOFF_ART.laterne`, VC:340: Hex 0xffb45a, ei 1,0) ist ein Zwilling der Fachwerk-Laterne (1900 K, 100 cd, 960 cd/m²) — Hex statt Kelvin, Stellwert statt Leuchtdichte, kein Licht.

**B7 Esse: Bild und Licht aus zwei Quellen.** Das Kohlen-Bett glüht im Glimm-Stellwert (bau-teile.js:1774 → SM:892-900), ihr Licht ist ein Strahler aus Temperatur × Fläche (DK:1896-1904, `_strahler` DK:1756-1782). Die Studio-Feuerstelle dagegen glüht über `LICHT_GESETZ.feuer.cdM2` 10 000 (FC:6529, SS:397-399).

**B8 Zwei Jahre, zwei Brenner-Regeln.** `dorfLayout` entscheidet Gas/Elektro nach dem Ring-Jahr `rj` (FC:5687), den Brenner nach `zeit.jahr` (FC:5688); `gluehlampe` hat kein `ab` (FC:6447) und ist über `brennerVon` nie wählbar (FC:6451) — die Elektro-Schwelle 1895/1930 steht im Layout (FC:5687), nicht in der Tafel. Wandlaternen tragen `lay.brenner = brennerVon(zeit.jahr)` (FC:5711, FC:9368): am elektrischen Saum brennt die Wandlaterne Glühstrumpf neben der Glühlampe des Masts.

**B9 Labor ≠ Welt.** Labor-Laternen werfen kein Licht, nur Glut (LAB:490-495, 670-671); Labor-Tor: PointLight mit `glutIntensity` ohne ×15 und ohne Auge, fail-soft-Literale (worlds/portale/porta.js:181, 216); `GLUT_GESETZ.dist` 14 liest nur das Labor (#42).

**B10 Klammern/Deckel/Böden im Lichtweg.** Reichweite `min(umkreisM 48, ceil(2R)/2)` und `R > kernM` (DK:1850); `kopfSicht` `clamp 0…1`, `min(1)`, `max(−1)`, `max(1e-4, a)` (FC:7651-7652, SM:2423-2432); Wandlaterne `k2 = max(kern², …)` (FC:6468); `lichtFarbe` 1667–25 000 K (FC:6488); Glimm-Deckel `min(1.5, …)` und Boden −0,5 (SM:892, SM:899); `_strahler`-Tafel `M.size > 512 → clear` (DK:1777); Wurf-Saum `min(1, max(0, …))` (BS:496); Raum-Blende `max(tief, …)`, dt ≤ 0,25 s (BH:1987, BH:2022).

**B11 Zeitpläne statt Gesetz.** Fenster: 45 % schlafen fest je Same (FC:2755-2762) — ein waches Fenster glüht die ganze Nacht, ein schlafendes nie; keine Stunde, kein Bewohner. Tor: Puls `pulseBase + pulseAmp·puls` (PC:1738). Brenner: Jahres-Tafel plus Layout-Schwellen (B8).

**B12 Kommentare, die etwas anderes sagen als der Code.** SM:3893-3894 „ein Feuer 9 m, eine Laterne 12 m, ein Tor 14 m" — die Reichweite folgt seit w28-strahler dem Auge (DK:1846-1851). DK:1595-1597 „Stärke … über die EINE Übersetzung Labor → Welt" — nur das Licht des Auges geht noch dort durch (DK:1836). DK:1750 „gegen den Anker `STRAHLER.ankerK`" — STRAHLER trägt kein `ankerK` (FC:6527).

## 4. ZAHLEN DER DOMÄNE

- Getrennte Lichtwege: **16** (W1–W16; davon 4 Leser derselben Leuchte W1–W4, 2 Labor-Wege W15–W16).
- Größen: **113** Skalare in 49 Zeilen der Tafel.
- Davon FOLGT: **14**; GESETZT mit Anker: **18**; **GESETZT ohne Anker: 81**.
- Emissions-Arten gebauter Quellen (Kernfrage): **6** (B6 i–vi) — nur Laterne und Wandlaterne sind ein Datum der Art `leuchte`; selbst dort lesen Licht (`leuchte`, je Brenner) und Kopf-Glut (`LICHT_GESETZ`-Schlüssel) zwei verschiedene Zahlen. Mit dem Strahler (Feuer, Brand, Lava, Stahl — Nachbar-Domäne) 7.

## 5. NICHT GELESEN · ÜBERGABEN

Nicht gelesen: `_lichtWurf`/`WurfSchatten`-Bau (BS:400-464), `_raumAmAuge`, `_raumSonneTakt`, `_dachTakt` (stamm/stoff-dach.js), `_portalLeuchte`-Weg jenseits ST:740-777 (Membran-Stoff ab ST:150), `_stahlGlut`-Werte `ESSE`/`ESSE_FEST` (feld-leben.js), vehicle-core.js jenseits der Stoff-Tafeln (welche Teile `drl`/`lensW` tragen: nur VC:1641-1710 überflogen), schmiede-core.js (kein Emissiv gefunden außer `stoffFarbe` schmiede-core.js:248), die Brücke foundry-bruecke.js jenseits Z. 700-710, `exportSettlement` (Weg von `l.brenner` in den Slot), `zeit.jahr` vs `plan.jahr` (nicht verfolgt). Nicht verifiziert: ob die Glut des durchsichtigen Glases (Deckkraft 0,42) unter der Mischung des Renderers mit der Deckkraft skaliert (Vendor-Stelle der Mischung nicht gefunden). Kein Bild, keine Zahl am Gerät.

Übergaben:
- (Auge) `augeGlut` vs `augeZeig`: zwei Formeln an einem Ort, vom Kommentar selbst benannt (WL:125-135); `AUGE.eps` 0,1 und `saum` 0,3 (WL:91-92) ohne Anker; `MESOPISCH.karte` 0,18 (WL:83).
- (Feuer/Strahler) `LICHT_GESETZ.feuer.cdM2` 10 000 (FC:6529) ohne Herleitung; `kernM` 0,76 als Durchmesser (FC:6420) gegen `bettRefM` aus klang (DK:1886); `STRAHLER.emissiv.flamme` 0,0012 (FC:6527); `_strahler`-Raster 25 K / ¼ m (DK:1759-1761).
- (Belichtung) `LEGACY_LICHT` π (WL:53) trägt nur noch das Licht des Auges (DK:2011-2013); `_augenLichtStaerke` (BH:2101-2112).
- (Schatten) LICHT_WURF kartePx 256, weichPx 2 (BS:1699, 1703); Würfel ohne Kopf-Abstrahlung.
- (Innenraum) Fenster tragen kein Licht in den Raum und auf die Gasse; RAUM_LICHT/raumLicht (FC:5999-6105) ist Tageslicht-Quotient ohne Lampe.
