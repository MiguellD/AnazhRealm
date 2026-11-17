# Glut-Karte — was glüht, leuchtet, heizt (Stand origin/main 08a8397ba4, nur gelesen, nichts gemessen)

Kürzel: FC = fachwerk-core.js · GC = gelaende-core.js · PC = porta-core.js · DK = stamm/dirigent-kern.js · FL = stamm/feld-leben.js ·
SW = stamm/siedlung-wege.js · SM = stamm/stoff-material.js · SS = stamm/studio-stoff.js · BH = stamm/bild-himmel.js · BK = stamm/bild-kosten.js ·
WL = welt-licht.js · ST = stamm/siedlung-tor.js · GK = stamm/gelaende-kollision.js · VC = vehicle-core.js · KA = stamm/kampf.js
Der EINE Pool: Wahl `_leuchtQuellen` DK:1763, Schreiber `_leuchtTakt` DK:1599, Stärke `_leuchtStaerke` DK:1736 = π (LEGACY_LICHT WL:53) × staerke × masse × Zeitplan,
Abfall `lichtAbfall` FC:5946 ≙ `_lichtPlatz` SM:2329 (isotroper Punkt, (d²+k²)^(−abfall/2), Saum), 4 Plätze, Umkreis 48 m (SM:3770).

## 1. Die Tafel der Quellen

| Quelle | (a) Temperatur / Zustand | (b) Farbe | (c) Stärke (Einheit) | (d) Weg des Scheins | (e) Wärme-Wirkung |
|---|---|---|---|---|---|
| Brand-Flamme | KONSTANTE T [3000, 1700] K FL:3923; Zustand GESETZ Rothermel FL:2700–2724, `b.glut` | GESETZ Planck: Zunge `lichtFarbe(K)`·(K/K0)⁴ FL:3155; Licht `LICHT_GESETZ.feuer` 2000 K DK:1730 | KONSTANTE `schein` 7,5 × k²/(1+k²) × glut DK:1732, FL:3926 (Welt-Einheit Bestrahlung); Bild KONSTANTE `ziel` 1,6 ÷ Belichtung FL:3201 | Licht: Pool DK:1803–1809. Zunge: EIGENER WEG, ans Bild gebunden + Umkehr des Nacht-Auges FL:3201 | NACHBARSCHAFT: Front zündet Nachbar-Zellen (Rothermel, Huygens) FL:2751–2760 |
| Feuerstelle / Glutbrunnen | fehlt (kein T) | Licht GESETZ Planck 2000 K FC:5897; Bett und Zunge PALETTE Vertex-Farben × `LEUCHT_FEUER` 2,5 FC:1957–1963, Zunge `FLAMME.ton` FC:10650 | KONSTANTE `feuer.staerke` 1 × Zeitplan {mittag 1,6 · abend 2,2 · nacht 45} FC:5897 × Skala² DK:1795 | Licht: Pool (fx.licht FC:5990 → GK:1181). Bett: Emissiv ohne Pool („Quelle“) SM:2082 | fehlt (sie zündet nichts; nur die Fackel in der Hand am Boden KA:2435–2446) |
| Esse (Glutbett der Schmiede) | fehlt (Feuer gilt als `ESSE.feuerK` 1573 K FL:3978, das Licht trägt 2000 K) | Licht Planck 2000 K (`_lichtDatum` → feuer DK:1836); Bett-Stoff ungelesen | KONSTANTE feuer × Zeitplan × Glut-Fläche/Bezugsbett DK:1784, :1795 | Pool | KONTAKT: Hand im Bett-Radius + `armM` FL:3320–3335, dann GESETZ Newton `waermeGang` FL:3297 |
| Herdfeuer im Haus | fehlt | PALETTE `feuer`-Balken FC:909 × LEUCHT_FEUER FC:1957 | KONSTANTE 2,5 | EMISSIV OHNE QUELLE: das Haus kommt nie in „licht“ (GK:1181 nur über fx.licht/Glut-Fläche; Haus-Teile ungelesen) | fehlt |
| Fenster | fehlt (Zeitplan statt Zustand) | GESETZ Planck 2800 K FC:5898 | KONSTANTE Zeitplan {abend 0,42 · nacht 0,85} FC:5898, `lichtGlut` DK:1606–1607 | EMISSIV OHNE QUELLE SM:2100–2102 (kein Pool-Platz, kein Licht auf der Gasse) | fehlt |
| Laterne / Wandlaterne | fehlt | GESETZ Planck 1900 K FC:5899 (Glas und Licht dasselbe Datum FC:1955) | KONSTANTE `staerke` 19 FC:5899; Wandlaterne abgeleitet FC:5907–5924; Glas-Glut = Zeitplan 1 | Licht Pool; Glas Emissiv `lichtGlut` | fehlt |
| Lava-Decke | GESETZ `lava` → `waermeGang` Newton, τ = ρ·c·d/α aus Zeile stein GC:1835–1852 | Decke GESETZ Planck + Wien je Kanal SW:552–565; Licht KONSTANTE 2000 K (feuer, nicht ihre T) DK:1814, :1730 | Licht `schein` 7,5 × 64/65 × `glutAus` (T⁴) DK:1814–1820, GC:1831; Decke KONSTANTE LEUCHT_FEUER 2,5 × Wien SW:562 | Licht Pool (k = 8 m, R = 32 m, auf Bodenhöhe `a.y`) DK:1820; Decke Emissiv, ohne Bild-Bindung, Nacht-Auge-Umkehr widerlegt SW:1298 | NACHBARSCHAFT: 8 Zellen, wenn T > tZuend SW:625–643 |
| Stahl der Esse | GESETZ Newton `waermeGang` FL:3297, Glut `glutAus` FL:3346 | GESETZ Planck an eigener T FL:3361 | Glut × `flaecheM2` 0,06 / Bezugsbett FL:3366 × feuer-Datum MIT Zeitplan (Object.assign behält `zeit`, nacht 45) FL:3354 | Licht Pool; die Klinge selbst glüht nicht (kein Emissiv-Leser) | fehlt |
| Tor / Portal | Zustand `_act` (Öffnung) ST:742 | PALETTE Hex 0xffd9a0 PC:1719 („kein Wärmestrahler“ DK:1706) | KONSTANTE i0 0,3 + 3,4·act, Puls 0,8 + 0,28·p PC:1722–1732, kein Zeitplan | Licht Pool, Kern = halber Bogen ST:771; Ziel-Bild EIGENER WEG ÷ Belichtung ST:646 + Nacht-Auge-Umkehr ST:278 | fehlt |
| Sonne | GESETZ Stand der Bahn WL:699ff | GESETZ Durchlass der EINEN Atmosphäre (Hillaire) WL:312–322 | KONSTANTE `KEY_BASE` 2,6 × π WL:49, :693 × Durchlass | Richtlicht (Szenen-Licht) BH:2177 | GESETZ nur im Brennglas `_brennWaerme` P/(ρVc) (bau-vorlagen:1544, koerper-fahrt:2394); Nässe trocknet global über `wf.sun` SM:2230–2233; das Temperatur-Feld ist Saison×Uhr×Wetter, keine Bestrahlung BH:2880 (Kern ungelesen) |
| Mond | fehlt | PALETTE `ATMO_GESETZ.nacht.mond` WL:109–111 | KONSTANTE 0,65 WL:74 | Richtlicht | fehlt |
| Funken | fehlt (T gesetzt 1900 K) | GESETZ Planck 1900 K KA:2679, :930 | KONSTANTE `leucht` 4 KA:2680 | EMISSIV OHNE QUELLE (MeshBasic) KA:929–930 | fehlt (kein Entfachen in `_funkenTakt` KA:906–940) |
| Fahrzeug-Licht | fehlt | PALETTE Hex drl 0xbcd8ff · lensW 0xcfe6ff · lensR 0xff2616 · lensA 0xff7400 VC:162–189 | KONSTANTE emissiveIntensity 0,8–1,1 VC:165–186, Tag = Nacht | EMISSIV OHNE QUELLE | fehlt |
| (Licht des Auges, kein Strahler) | — | Planck `AUGEN_LICHT.kelvin` BH:2067 | GESETZ der Kamera `_augenLichtStaerke` BH:2086–2097 | Pool, Himmels-Ersatz | — |
| (Blitz) | fehlt ganz: 0 Treffer „blitz/lightning“ in Stamm und Kernen außer Studio-Tönung worlds/schmiede:558 | | | | |

Tote Zahl: `BRAND.licht` 4 FL:3893 — kein Leser (nur Kommentare DK:1720, :1812).

## 2. Die Belichtung und das Auge

| Was | Wo | Zahl / Befund |
|---|---|---|
| Schreiber der Belichtung | `_dayNightApplyBelichtung` BH:1933–1938 → `toneMappingExposure` BH:1937 | EIN Schreiber (Ladebild 1,0 dirigent-ankunft:168) |
| Was sie liest | `_waagrechtIrradianz` BH:2171–2194: Richtlicht × Horizont-Sicht + Himmels-Bestrahlung (+Hemi, Ambient laut BH:1924) | KEINE Leuchtquelle des Pools; Boden des Messers `nachtKnotenE` = MOND_E (0,65 × Luma Mond) WL:77, :677 |
| Belichtung Tag ↔ Nacht | WL:6, :66 | Mittag 0,511 · Mitternacht Dorf 1,59 · hoher Mond 1,85 → jede zeitfeste Leuchtdichte steht nachts 3,1–3,6× heller im Bild |
| Nacht-Auge | Post-Kette BK:2464 (`_nachtAuge` BK:2179–2225), Gewicht `nightFactor` = 1 − tag BH:1902 | `NACHT_AUGE` BK:2981–2989: staebchenCd 0,005 · zapfenCd 5 · bildZapfen [0,18, 1] · staebchenStaerke 1,22 |
| Sonderweg 1: Brand-Zunge | FL:3201 | Ton × `ziel` 1,6 ÷ Belichtung, dann Umkehr des Nacht-Auges (`vor` = true) |
| Sonderweg 2: Tor-Ziel | ST:278, ST:646 | Ziel-Bild × 1/Belichtung, Umkehr des Nacht-Auges |
| Kein Sonderweg (bewusst) | Lava-Decke SW:1298 | Umkehr widerlegt; Decke = physische Leuchtdichte × Belichtung |
| Zeitplan als zweite Belichtung | `_lichtZeitplan` DK:1881–1889 | feuer: nacht/mittag = 45/1,6 = 28× gegen die 3,1–3,6× der Kamera — das Herdfeuer steht nachts ~8× heller im Bild als mittags |

## 3. Die Brüche, nach dem, was der Spieler sieht

| # | Bruch (ein Satz) | Bild |
|---|---|---|
| B1 | Das Herdfeuer trägt seine Stärke als Zeitplan `nacht 45` FC:5897 (eine zweite Belichtung), obwohl der Brand dasselbe Feuer zeitfest aus `schein` × Fläche rechnet DK:1714–1732: am Bett Bestrahlung π·45·(1+0,58)/0,58 ≈ 385 gegen π·7,5 ≈ 24 der Brand-Flamme (≈ 16×, aus dem Code gerechnet). | (ii) die weiße Scheibe um den Glutbrunnen; die Esse und der Stahl erben denselben Zeitplan (DK:1836, FL:3354) |
| B2 | Das Lava-Licht ist ein isotroper Punkt auf Höhe der Decke mit Kern 8 m und R 32 m in 2000 K DK:1814–1820, obwohl die Decke ein waagrechter Lambert-Strahler ihrer eigenen T ist (GC:1844, SW:558): der Boden am Rand sieht ihn streifend (N·L ≈ 0), jeder Stamm frontal, der Kern hält den Abfall über die Zelle flach. Die Decke selbst leuchtet als LEUCHT_FEUER 2,5 × Belichtung SW:562 (rot 2,5 → 4,0–4,6 im Bild nachts). | (i) Waldsaum so hell wie das Gras, Kern weiß; jenseits 32 m vom Zellmittel trägt der Pool 0 — ein Schein bei 40–80 m hat dort keine Wurzel im gelesenen Code (ungelesen: Fern-Ring/Luft) |
| B3 | Das Brand-Licht hat Kern = Halbmesser der Front bis 8 m und R bis 32 m DK:1726–1732, eine feste Farbe 2000 K und keinen Durchlass durch den Rauch, obwohl der Rauch-Stoff ein Medium mit τ ist (stamm/siedlung-bewohner:224): jeder Ballen bis 32 m steht im fast flachen Licht derselben Farbe, die Unterseite zum Feuer gedreht (:258). | (iii) die Fahne bis oben gleich hell orange |
| B4 | Das Tor trägt Hex 0xffd9a0 und `i0 + iOpen·act` ohne Zeitplan PC:1718–1732, mit Kern = halbem Bogen ST:771, obwohl der Pool jede Fläche über (d²+k²) mit Kern rechnet: der Rahmen-Stein liegt ganz im Kern, flach beleuchtet, und die Nacht-Belichtung hebt ihn 3,1–3,6×. Stein-Emissiv des Tors ungelesen. | (iv) der Tor-Stein nachts flächig hell |
| B5 | Fenster und Herd sind nur Emissiv (`lichtGlut` SM:2100, LEUCHT_FEUER FC:1957); kein Haus kommt ins Verzeichnis „licht“ (GK:1181, fx.licht nur für AUSSTATTUNG FC:5990), obwohl das Fenster ein Planck-Datum trägt FC:5898. | (v) 0 Quellen „fenster“/„herd“ im Dorf, die Gasse dunkel neben glühenden Scheiben |
| B6 | Zwei Emissiv-Wege im Satz-Stoff: ein Glut-Stoff (`mp.leucht` > 0) nimmt Vertex-Farbe × leucht SS:288–289 und überspringt `aGlut` SS:611–612, obwohl `aGlut` (Emissiv-Luma × Intensität, phyto-core:6042, siedlung-satz:1576) je Ecke reist. | (vi) `aGlut` ungelesen an den Ecken des Glut-Stoffs — Speicher ohne Bild |
| B7 | Zwei Flammen aus derselben Zunge `FLAMME.zunge` FC:10649: der Brand tönt nach Planck FL:3155, die Feuerstelle nach der Palette `FLAMME.ton` FC:10650 und M.feuer-Vertex-Farben. | Lagerfeuer und Steppenbrand verschieden gefärbt bei gleicher Hitze |
| B8 | Der Stahl leuchtet nur als Pool-Licht in der Hand, die Klinge selbst trägt kein Glühen (kein Leser von `_stahl.T` außer FL:3361). | Licht ohne glühenden Körper |
| B9 | Fahrzeug- und Funken-Licht sind Hex/Konstante ohne Pool-Platz und ohne Zeitplan (VC:162–189, KA:2680). | Scheinwerfer werfen nichts auf die Straße, tags wie nachts gleich |
| B10 | Keine Quelle erwärmt den Leib, trocknet die Nässe oder schmilzt Schnee: das Temperatur-Feld ist Saison × Uhr × Wetter BH:2880–2887, die Nässe ein einziger Uniform SM:698; Wärme wirkt nur über Nachbar-Zellen (Brand, Lava) oder Kontakt (Esse). | Am Feuer bleibt der Boden nass, nichts dampft |

## 4. Die Zahl der Einheit (N = 13 Strahler der Tafel, ohne Auge und Blitz)

| Spalte | aus einem Gesetz | wer |
|---|---|---|
| (a) Temperatur | 2 von 13 | Lava, Stahl (beide `waermeGang`) |
| (b) Farbe Planck/Atmosphäre an eigener T, Schein UND Licht | 6 von 13 | Brand, Fenster, Laterne, Stahl, Funken, Sonne (Lava fällt: Licht 2000 K ≠ ihre T) |
| (c) Stärke aus T × Fläche | 1 von 13 | Lava-Licht (`glutAus` × Zellfläche × Anker 7,5); Stahl fällt am Zeitplan |
| (d) im EINEN Pool mit dem EINEN Abfall | 7 von 13 | Brand, Feuerstelle, Esse, Laterne, Lava, Stahl, Tor (Licht); davon tragen 4 ihren Schein zusätzlich auf eigenem Weg |
| (e) Wärme über Strahlung/Abstand | 1 von 13 | Sonne (nur Brennglas); Nachbarschaft/Kontakt: Brand, Lava, Esse (3); fehlt: 9 |

Wege für (c): 12 — feuer-Datum×Zeitplan×π×masse · `schein`×k²/(1+k²)×glut · `glutIntensity` · LEUCHT_FEUER×Palette · LEUCHT_FEUER×Wien ·
`lichtGlut`=Planck×Zeitplan · `ziel`÷Belichtung · FUNKEN.leucht · emissiveIntensity-Hex · KEY_BASE·π·Durchlass · MOND_STAERKE · `aGlut`/budgetGlut.
Wege für (d): 4 in der Welt — Pool `_lichtPoolTerm` · Richtlicht (Sonne/Mond) · Emissiv ohne Quelle · Bild-gebunden + Nacht-Auge-Umkehr (+ 1 im Labor: PointLight worlds/fachwerk/fachwerk.js:676).

## 5. Vorschlag (die Gestalt)

Der Chokepoint ist `_flammenLicht(r)` DK:1724 — schon heute die einzige Stelle, die Licht aus FLÄCHE (Kern = Halbmesser) statt aus Datum×Zeitplan baut;
er wird `strahler(T, A, n)` neben `lichtFarbe`/`lichtAbfall` in FC (FC:5929/5946): aus Temperatur K und Fläche m² (Stoff-Zeile, `waermeGang`/`glutAus` GC:1827–1834)
folgen kelvin = T, Leuchtdichte ∝ glutAus(T) (EIN Anker statt 7,5 / 2,5 / 45 / 19 / 4), staerke = Leuchtdichte × A, kernM = √(A/π), und die Normale n
macht den Abfall zum Lambert-Strahler (cos am Strahler in `_lichtPlatz` SM:2329 — die Lava strahlt nicht mehr waagrecht in den Waldsaum).
Dieselbe {T, A} gibt die Bestrahlung E(d) = Leuchtdichte·A·cos/(d²+k²) an die Zündung (gegen tZuend der Zeile, wie SW:637) und an Nässe/Leib — die 8-Nachbarn-Regel der Lava SW:634 fällt.
Leser, die umziehen: alle Zweige von `_leuchtQuellen` DK:1777–1824 (Glut-Einträge, Brand, Lava, Stahl), `_lavaGlutNode` SW:552, die Zunge FL:3155, das Bett/der Herd
(M.feuer FC:1957), Fenster und Laterne (Glühfaden/Flamme als T, Glas als A; das Haus tritt mit seinen Fenstern in „licht“ GK:1181), die Funken KA:930.
FÄLLT: `LICHT_GESETZ.feuer.zeit` (nacht 45) und `.staerke`, `LEUCHT_FEUER`, `FLAMME.ton`, `BRAND.bild.flamme.schein` und `ziel` samt Umkehr FL:3201, `BRAND.licht` (tot),
`FUNKEN.leucht`, die Glut-Palette der Vertex-Farben, `aGlut` am Glut-Stoff. Tor und Fahrzeug bleiben Nicht-Wärmestrahler, tragen aber dieselbe Einheit Leuchtdichte × Fläche.
