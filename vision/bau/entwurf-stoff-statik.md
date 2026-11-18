# ENTWURF A — Stoff und Statik: das Gesetz des Bauens von unten (main 18058dba, nur gelesen)

Gelesen: die acht Lese-Blätter a–h ganz; das Muster leben/entscheid.md. An der Quelle nachgeprüft: fachwerk-core.js:155–224,
418–474, 773–795, 2118–2216; schmiede-core.js:2841–2962 (STOFF_GESETZ, `tragSpannung`); stamm/bau-buch.js:1857–1919
(`_failsUnderLoad`); gelaende-core.js:1270–1469 (SCHNEE, TEMPERATUR, EIS, SCHMELZE), 1558–1600 (PEGEL), 3341–3410 (FELS),
5727–5915 (ortWuchs, ORT_SIEDLUNG, kahlGrund, ortGesetz); planet-core.js:20–53, 268, 1730–1746; phyto-core.js:92–121, 2830–2858,
3035–3069 (forestNische). Gerechnet mit node (Scratch, kein Spiel-Code): statik.cjs, dach.cjs, gesetz.cjs.
Kürzel: fc = fachwerk-core.js · sc = schmiede-core.js · gc = gelaende-core.js · pc = phyto-core.js · bb = stamm/bau-buch.js.

## DAS GESETZ (Vorschlag)

Ein Haus ist die Antwort des STOFFS DES ORTS auf die LAST DES ORTS. Der Ort liefert drei Dinge, die die Welt schon rechnet: das Holz
(die Art mit dem größten Gewicht der Wald-Nische am Anker, `forestNische` pc:3047 → wF Kiefer · wT Tanne · wE Eiche), den Schnee
(das Wasser-Äquivalent des Schnee-Pegels, gc:1444–1469, s_k = ρ_w·g·SWE_max) und den Stein/Lehm (der Fels-Stoff gc:3349 und der
kahle Grund gc:5835). Aus dem Stamm folgt der Querschnitt (das Kreuzholz größter Tragkraft aus dem Rundholz), aus Querschnitt, Stoff
und Last die Spannweite (Durchbiegung l/300 bzw. l/250 final, Biegung, EN 1995-1-1), aus der Spannweite die Zahl der SCHIFFE
(Längsunterzüge) bei gegebener Tiefe D, aus der Balkenhöhe die Geschosshöhe, aus dem Sparren und dem Schnee die Zahl der Pfetten,
aus der Deckung die Grenzneigung, aus dem Mauer-Format die Wandstärke, und aus Stoff und BAUJAHR die Verwitterung. Der Same
würfelt nichts Neues: die Würfel-Folge pitch → W → D → st (fc:2204–2210, deren Bytes fc:2170 benennt) bleibt; das Gesetz legt
deterministisch das TRAGWERK unter die gewürfelte Hülle. Lage: Rechnung im Plan (`DORF` fc:4403, Haupt-Faden, liest
`__schmiedeCore.STOFF_GESETZ` und gc), Ergebnis als Zahlen im `slot.ov` (fc:5923) — `HAUS` im Faden liest nur `P`.

## (1) SIGNATUREN UND KONSTANTEN

### 1.1 Konstanten (jede mit Anker; „unsicher" = aus dem Gedächtnis, nicht nachgeschlagen)

| Name | Wert | Einheit | Anker |
|---|---|---|---|
| E₀,mean Vollholz | 11 000 | MPa | EN 338 C24 und D30 (unsicher für D30: EN 338:2009 nannte 10 000; Spannweite ×0,969). Gleich dem STOFF_GESETZ holz E 1,1e10 (sc:2893) — Zahl gegen Zahl stimmt |
| f_m,k Eiche (D30) · Nadel (C24) | 30 · 24 | MPa | EN 338 (unsicher, Klassen-Zuordnung je Art Annahme) |
| f_c,0,k · E₀,₀₅ Nadel (C24) | 21 · 7 400 | MPa | EN 338 (unsicher) |
| ρ_mean Eiche · Nadel | 640 · 420 | kg/m³ | EN 338 (unsicher); sc:2910 verweist holz-ρ auf RHO.holz 720 (sc:456) — Zwilling |
| k_mod · γ_M | 0,8 · 1,3 | – | EN 1995-1-1 Tab. 3.1 (NKL 1, mittlere Dauer) · Tab. 2.3 (Vollholz) |
| k_def · ψ₂ | 0,6 · 0,3 | – | EN 1995-1-1 Tab. 3.2 · EN 1990 Tab. A1.1 (Kat. A) |
| γ_G · γ_Q | 1,35 · 1,5 | – | EN 1990 |
| Grenze w_inst · w_net,fin | l/300 · l/250 | – | EN 1995-1-1 Tab. 7.2 (Bereichswerte; Wahl im Band) |
| g Holzbalkendecke mit Lehm-Einschub | 1,5 | kN/m² | DIN 1055-1 Größenordnung (unsicher) |
| q Wohnen inkl. Trennwand | 2,0 | kN/m² | EN 1991-1-1/NA Kat. A2 1,5 + Zuschlag (unsicher) |
| μ₁(α) | 0,8 (≤30°) · 0,8(60−α)/30 · 0 (≥60°) | – | EN 1991-1-3 Tab. 5.2 |
| s_k des Orts | ρ_w·g·max_Saison schneePegel | kN/m² | gc:1444–1469 (Grad-Tag, Braithwaite 1995; fall 1,5 mm/Frosttag gc:1459, Hock 2003) — keine neue Zahl |
| Kreuzholz aus Rundholz | b = d/√3, h = d·√(2/3) (h:b = √2, max b·h²) | m | Balkentheorie; Zuschreibung (Parent 1713) unsicher |
| Knick-Beiwert k_c, β_c | nach EN 1995-1-1 §6.3.2, β_c 0,2 | – | EN 1995-1-1 |
| Deckungs-Grenzneigung Biber-Doppel · Schiefer altdt. · Reet · Holzschindel · Hohlpfanne · Mönch-Nonne | 30 · 25 · 45 · 22 · 35 · 40 (mediterrane Praxis 17–25) | ° | ZVDH-Fachregeln, Regeldachneigung (alle unsicher) |
| Deckungs-Eigenlast Ziegel · Reet · Schiefer · Schindel | 0,75 · 0,70 · 0,50 · 0,25 | kN/m² Dachfläche | DIN 1055-1 Größenordnung (unsicher) |
| Mauer-Modul NF | 0,24 × 0,115 × 0,071, Fuge 0,011 | m | DIN 105; im Spiel schon VERBAND mauerwerk fc:1850 |
| Wand tragend min · Schlankheit h_k/d | 0,115 · ≤ 25 | m · – | DIN 1053-1 (unsicher) |
| σ₀ Vollziegel Mz 12 / MG II | 1,2 | MN/m² | DIN 1053-1 Tab. 4a (unsicher) |
| Spritzwasser-Sockel | ≥ 0,30 | m | DIN 68800-2 (unsicher) |
| Holz-Vergrauung, Erosion | Grau nach Monaten; ~6 mm je Jahrhundert | – | USDA Wood Handbook Kap. 16 (Zahl unsicher; der Anker steht schon bau-vorlagen.js:1666/1685) |

### 1.2 Funktionen (rein, ohne Zustand, ohne Zufall) — Kern `BAU_STATIK` in fc neben KULTUR

```
holzDesOrts(nische)                         → 'eiche'|'kiefer'|'tanne'   argmax(wE, wF, wT) von forestNische (pc:3047); Birke/Erle sind kein Bauholz
holzZeile(art)                              → {E Pa, fmk Pa, fc0k Pa, E005 Pa, rho kg/m³}   Zeile aus STOFF_GESETZ (sc:2878, je Art neu, s. 1.3)
kreuzholz(d)                                → {b m, h m}       b = d/√3, h = d·√(2/3); d = Stamm-Durchmesser der Art am Ort
balkenSpann(b, h, holz, e, g, q)            → m   min(∛(384EI/(5·300·w)), ∛(384EI/(5·250·w_fin)), √(8·k_mod·f_m,k/γ_M·W/w_d))
schiffe(D, Lmax)                            → {n, spann m}     n = ⌈D/Lmax⌉, spann = D/n (n−1 Längsunterzüge mit Ständerreihe)
raehmFeld(b, h, holz, spann)                → m   Ständerabstand-Obergrenze (Rähm unter halber Spannweite), l/300
raster(W, aMax, aGefach)                    → {n, a m}         a = W/⌈W/min(aMax, aGefach)⌉
geschossH(licht, h)                         → m   licht + h + diele 0,06
schneeLast(L, y)                            → kN/m²   s_k = 9,81·max_s schneePegel(L, y, s)  (gc:1467)
neigung(deckung, kulturPitch)               → °   max(DECKUNG[deckung].min, kulturPitch)
pfetten(Dhalb, sparren, e, sk, deckung, α)  → n   ⌈(D/2)/Lh⌉ Felder je Dachseite (1 = nur Fuß- und Firstpfette)
knickTraegt(b, L, holz, N)                  → bool  N/A ≤ k_c·k_mod·f_c,0,k/γ_M
wandDicke(stoff, geschosse, hGeschoss)      → m   kleinstes NF-Modul (0,115·0,24·0,365·…) mit σ ≤ σ₀ und h/d ≤ 25; Naturstein s. Punkt 6
stoffTon(stoff, ort)                        → lin RGB  holz: Art-Ton · stein: felsMittelWerte am Anker (gc:3399) · lehm: kahlGrund (gc:5835)
patina(stoff, alterJahre, feuchte)          → lin RGB  ALTER-Zeile des Stoffs (bau-vorlagen.js:1684–1692) über alter = Welt-Jahr − baujahr
```
`DORF` (fc:4403) bekommt das Argument `ort = {nische, stammD, sk, felsTon, lehmTon}`, je Siedlung EINMAL am Anker gerechnet; das Labor
liest die Heimat (`ortGesetz(null)`, gc:5843). Der Haus-Datensatz `hp` trägt: holz, b, h, schiffe, spann, a, egH, ogH, pfetten, wandD, deckung.

### 1.3 Was fehlt, damit die Signaturen Konsum sind (gelesen, nicht erfunden)
- STOFF_GESETZ kennt EINE Zeile `holz` (sc:2893, „gemessen als Ganzes"): Arten fehlen. Vorschlag: Zeilen eiche/kiefer/tanne dort, nie
  eine zweite Tafel in fc.
- Der Stamm-Durchmesser der Art ist ein Mess-Ergebnis von phyto (pc:120 „Eiche 0,330 m", Vermutung: Radius); eine reine Funktion
  `stammD(art, ort)` ist nicht gefunden → Punkt 3.
- Lithologie je Ort gibt es nicht: FELS ist EIN Stoff für die ganze Welt (gc:3349), die Palette kennt rock ↔ wueste (gc:5836). Der
  „Stein des Orts" ist darum heute nur sein Ton, nicht seine Art (Sandstein/Kalk/Granit).
- Das Klima des Planeten (`niederschlagMm`, `koeppen`, pc:1746) lädt nur im Faden (Vermutung nach leben/entscheid.md §2); der Ort
  erreicht den Haupt-Faden als Δ in `ortGesetz` (gc:5898–5905). Das genügt für s_k, nicht für Regen-Intensität.

## (2) DURCHGERECHNET (node, Zahl gegen Zahl)

**Eichenbalken 16 × 20 cm, D30, g 1,5 + q 2,0 kN/m²** (statik.cjs):

| Balkenabstand e | l/300 inst | l/250 final | Biegung | **L_max** |
|---|---|---|---|---|
| 1,70 m (Spiel: Balken auf jedem Ständer, fc:467–470) | 3,70 | 3,54 | 4,29 | **3,54 m** |
| 1,00 m | 4,41 | 4,23 | 5,60 | **4,23 m** |
| 0,85 m | 4,66 | 4,47 | 6,07 | **4,47 m** |

Maßgebend ist die Durchbiegung (Kriechen), nie der Bruch. Folge für die Hausbreite: EIN Schiff trägt ≤ 3,5–4,5 m; jede Tiefe darüber
verlangt einen Längsunterzug mit Ständerreihe (zweischiffig ≤ 7–9 m, dreischiffig ≤ 10,6–13,4 m).

**Der Spiel-Balken 15 × 21 bei e 1,7** (fc:179, Spannweite = volle Tiefe D, kein Unterzug, fc:470): L_max 3,64 m (Eiche wie Nadel).
| D (fc:2209) | Durchbiegung | l/300 | Faktor | σ_d Bemessung | f_m,d Eiche / C24 |
|---|---|---|---|---|---|
| 5 m | 38 mm | 17 mm | 2,3× | 24,2 MPa | 18,5 / 14,8 |
| 7 m (Default) | 146 mm | 23 mm | 6,3× | 47,5 MPa | 18,5 / 14,8 |
| 9 m (alemannisch) | 399 mm | 30 mm | 13,3× | 78,5 MPa | 18,5 / 14,8 |
| 11 m (gotisch) | 891 mm | 37 mm | 24,3× | 117,2 MPa | 18,5 / 14,8 |
Jedes Haus der Welt ab D 5 bricht rechnerisch (Blatt b, Gegenrechnung 2,5 kN/m²: 104/636 mm, hier nachgerechnet und bestätigt).

**Der Querschnitt selbst passt:** das Kreuzholz aus d = 0,258 m ist b 0,149 × h 0,212 m — der Spiel-Balken 0,15 × 0,21 (h:b 1,40 = √2)
ist genau das tragfähigste Kreuzholz aus einem 26-cm-Stamm. Vermutung: Zufall, fc:179 nennt keinen Anker.

**Das Gesetz über 11 Kulturen** (gesetz.cjs, Eiche d 0,258, e 0,85, Biber, s_k 1,51): L_max 4,59 m → alemannisch D 9: 2 Schiffe à 4,50;
fränkisch/niedersächsisch D 7: 2 à 3,50; gotisch D 11: 3 à 3,67; römisch D 10: 3 à 3,33; Holzhütte D 5: 2 à 2,50 (Blockbau trägt
anders, Punkt 7). Sparren 10 × 15 bei e 0,85 tragen horizontal 3,14–3,53 m → jede Tiefe > ~6,8 m braucht eine Mittelpfette je Seite
(alemannisch, schwarzwald, gotisch, italienisch, römisch: 2 Felder je Seite). Das Spiel baut nur Fuß- und Firstpfette (fc:776–777).

**Raster, Ständer, Fenster.** Das Rähm 16 × 16 unter halber Spannweite (6,2 kN/m) trägt Ständerabstände bis 2,92 m (l/300), Biegung
3,36 m → `bayMax` 1,7 (fc:181) liegt sicher darunter, FOLGT aber nicht aus der Last: das Maß des Gefachs (Ausfachung, Zapfen) setzt es
→ Punkt 5. Ständer 16 × 16, 3 Geschosse, Feld 1,7 × 3,7: N 43,1 kN, σ 1,68 MPa gegen k_c·f_c,0,d = 0,736 · 12,9 = 9,51 MPa (λ 55);
auch 12 × 12 trüge (σ 2,99 gegen 6,63) — der Ständer-Querschnitt kommt aus dem Stamm und der Verbindung, nicht aus dem Druck.
Gegenprobe zum Werkstatt-Richter: `tragSpannung` mit PHYSIS knick 500 / druck 10 (bb:1892, sc:2959) gibt für denselben Ständer
0,071 MPa — 24× unter der wirklichen Spannung; dieser Richter darf nie über ein Haus urteilen. Fensterbreite aus dem Gefach: lichte
Gefachbreite a − post = 1,54 m bei a 1,7; die Kappe 1,05 und der Abzug 0,34 (fc:495) folgen nicht aus Statik (Glasgröße = Epoche).

**Geschosshöhe.** geschossH(licht 2,20, h 0,212) = 2,47 m, (2,00) = 2,27 m gegen egH 2,55 / ogH 2,35 (fc:178), Stadt 2,70 (fc:4072),
PROXYHAUS 2,75 (fc:4542). Das Gesetz bindet die drei Zwillinge an EINE Funktion; die lichte Höhe bleibt Eingang (Punkt 2).

**Schnee am Ort** (Konstanten gc:1313/1459/5850 nachgerechnet, nicht die Funktion gerufen): Heimat am Meer 102 Frosttage,
SWE 0,154 m → s_k 1,51 kN/m²; 60 m über dem Meer 2,63; 120 m 3,73 (die Welt staucht die Höhe 0,11 K/m, gc:1305); Ort +6 K: kein Schnee;
Ort −6 K: 2,53. Firstpfette 14 × 18 (fc:180) bei Stielabstand ~3,4 m (jeder 2. Kehlbalken, fc:786/792; Vermutung aus dem Code): 1,13×
(D 7) bis 1,39× (D 9) über l/300.

**Neigung.** Last je Grundriss g/cos α + μ₁ s_k (Ziegel, s_k 1,0): 1,67 kN/m² bei 30°, Minimum 1,43 bei 50°, 1,50 bei 60° — die Statik
zieht schwach zu 45–55°, nie stark. STIL_GRENZNEIGUNG (fc:160) gegen ZVDH (unsicher): alt 28 ↔ Biber 30 · stroh 38 ↔ Reet 45 ·
huette 30 ↔ Schindel 22 · klinker 22 ↔ Hohlpfanne 35 · stein 18 ↔ Mönch-Nonne 40 (mediterrane Praxis 17–25). Drei von fünf weichen ≥ 7° ab.

**Mauer.** 24 cm, 3 Geschosse: σ 0,25 MPa; 11,5 cm, 2 Geschosse: 0,27 MPa (h/d 22,6); 24 cm, 5 Geschosse: 0,41 MPa — alles ≪ σ₀ 1,2.
Der Druck bestimmt keine historische Wand; Schlankheit und Modul tun es. Die Spiel-Wand 0,16 (fc:678) ist kein NF-Modul.

**Preis-Messung:** die Funktionen 1.2 je Haus 0,23 µs (gesetz.cjs, 2·10⁵ Häuser).

## (3) WAS FÄLLT (beim Namen)
1. Der Default-Block fc:178–181: egH, ogH (→ geschossH), post, sill, raehm, balkenB, balkenH (→ kreuzholz(stammD)), spar, pfetteB,
   pfetteH (→ Prüfung 1.2), bayMax (→ raster); tot ganz: `jetty` fc:171, `sparH` fc:180 (Blatt b #10, #16).
2. VERBAND_GESETZ.fachwerk feldM 1,7 · staenderM 0,16 · riegelStarkM 0,13 (fc:1848) — liest das Raster des Hauses (Zwilling Blatt b/c/e).
3. STADT_MASSEN.geschossM 2,7 · sockelM 0,5 (fc:4072, Leser fc:4102, 4120, 4492, 4494) und PROXYHAUS 2,75 (fc:4542) → geschossH
   (Zwilling Z1 Blatt g: Traufsprung 0,45–2,55 m an 300 m fällt mit).
4. STIL_GRENZNEIGUNG + Rest 28 (fc:160, 165) → DECKUNG.min mit Anker; die drei Leser, die sie heute umgehen, lesen sie: Anbau-Pult
   0,20 (fc:541), Balkon-Dächlein (fc:1452), Vordach (fc:1571).
5. Wanddicke fünffach: fc:678 (= post), 1773 (0,34), 432 (0,30), 1683 (0,26) → wandDicke(stoff, …) im NF-Modul von fc:1850.
6. `woodFor` Positions-Hash hart/weich (fc:1123) → holzDesOrts; Möbel-HOLZ spanMax 0,78/1,12 (fc:1121–1122) → dieselbe balkenSpann für
   das Brett (Vermutung: trägt, ungerechnet).
7. Kultur-Farben der STOFFE (fc:2122–2153: holz 12, stein 2, gefach 5 als Lehm) und DEFCOL holz/stein/lehm (fc:2119) → stoffTon(ort).
   Bleiben: Anstrich (Falunrot fc:2147), Ziegel-Brand, Putz-Kalk (Punkt 8).
8. Verwitterung ab Welttag 0 und „jedes Haus ist stein" (stamm/siedlung-satz.js:796, 1980) → patina(stoff, Welt-Jahr − baujahr).
   Zwillinge AUS_SILBER/AUS_ROST (fc:6861, 6863) → ALTER.holz/eisen (bau-vorlagen.js:1685–1686, USDA/FeO(OH)).
9. Dachziegel-Zwilling 0,26 × 0,34 (fc:233, 841) gegen 0,18 × 0,32 (fc:1851) → EINE Format-Spalte der Deckungs-Zeile.
10. RHO.holz 720 (sc:456) gegen ρ der Art → STOFF_GESETZ-Zeile der Art (RHO_VON sc:2910 zeigt schon dorthin).
Absenz-Grep der Welle: `egH:|ogH:|bayMax|balkenH|geschossM|STIL_GRENZNEIGUNG|woodFor|jetty|sparH` außerhalb BAU_STATIK = 0.

## (4) DER PREIS
- **Rechnung:** 0,23 µs je Haus (gemessen am Scratch-Prototyp); je Siedlung einmal am Anker: schneePegel (geschlossen, gc:1467),
  forestNische (pc:3047), felsMittelWerte (gc:3399) — Mikrosekunden, kein Takt.
- **Geometrie:** je weiteres Schiff und Geschoss ein Unterzug + W/a Ständer (W 9, a 1,7: ~7 Kästen, ~84 Dreiecke), je Mittelpfette
  ein Balken + Stiele — gegen 132 000 Dreiecke L0 (fc:100) unter 1 %. L1/L2/S3 tragen den Unterzug nicht (Innenleben).
- **Byte-Vertrag:** keine neue Würfel-Ziehung, die Folge pitch → W → D → st bleibt (fc:2170); W, D, Lose und Layout bleiben
  byte-gleich. Es ändern sich Höhen (egH/ogH je Ort), Querschnitte, Innen-Tragwerk → JEDES Haus ändert seine Bytes: eine benannte
  Wandlung, keine stille. Neu gemessen werden müssen: LOD_SCHIRM.fehler.haus (64 Werte, vegetation-streu.js:2926–2958), die Platte
  (IDB) wird kalt → Ankunft (Vermutung), `gate:studio-huelle` H9 Box-Maße (huelle.js:1659).
- **Samen-Vertrag:** das Haus wird Funktion von (Same, Kultur, ORT) statt (Same, Kultur). `slot.ov` wächst um ~11 Felder (~150 Zeichen
  von 8 192, siedlung-bauten.js:3437). Das Labor baut an der Heimat (ortGesetz(null)) — Studio = Welt am Prüfplatz.

## (5) WAS DIESER WINKEL NICHT ERKLÄRT (ehrlich)
- **Programm:** wie viele Räume, wie hoch lichte Höhe, welche Nutzung (Blatt a). Die Statik sagt, dass eine Tiefe von 9 m eine
  Längswand braucht — nicht, ob dahinter Stube oder Stall liegt. Die lichte Höhe 2,20/2,00 ist ein Eingang, kein Ergebnis.
- **Epoche:** Glasgröße (Fensterkappe 1,05, fc:495), Säge statt Beil (Querschnitt ≠ Kreuzholz-Optimum), Normen (MBO 2,40 m lichte
  Höhe), Ziegel gegen Holz durch Bauordnung und Brandschutz — Zeit, nicht Last.
- **Wohlstand und Sitte:** Breite W über das Raster hinaus, Zierfachwerk (brace, fc:2122 ff.), Geschosszahl, Neigung oberhalb der
  Grenzneigung (alemannisch 55° statt 30°), Überstand 0,42/0,32 (fc:181: Schutz vor Schlagregen, keine Statik), Anstrich.
- **Gegenläufige Wahrheit:** Statik zieht die Neigung schwach zu ~50°, das Alpenhaus baut 32° (fc:2134), um den Schnee als Dämmung
  zu halten — Kultur schlägt das Lastminimum. Der Spike muss das stehen lassen, nicht wegrechnen.
- **Blockbau, Lehmbau, Flachdach:** Holzhütte (Wand trägt als Blockwand), Pueblo/Kykladen (Lehm-Flachdach 8–12°, fc:2141, 2145) liegen
  außerhalb von Balken-und-Deckung; jede braucht ihre eigene Zeile (Punkt 7).

## (6) DER SPIKE, der das Gesetz zu widerlegen versucht
Behauptung: „aus Stamm, Last und Spannweite folgen Schiffigkeit, Pfettenzahl und Geschosshöhe historischer Häuser". Widerlegt, wenn
an ≥ 20 dokumentierten Häusern (Bauaufnahmen: Fachwerk-Hallenhaus, Ernhaus, Schwarzwaldhaus, Kontorhaus; Literatur z. B. Großmann
„Der Fachwerkbau" — unsicher, nicht gelesen) die gemessene Tiefe je Schiff > 1,3 · L_max(gemessener Querschnitt, e) liegt oder die
Geschosshöhe − Balkenhöhe nicht im Band 1,9–2,6 m steht. Dazu im Spiel: gate-Probe am ECHTEN `DORF`-Export (30 Saaten, alle Lose):
Anteil der Häuser mit spann ≤ L_max = 100 %, Absenz-Grep 0, Bild F1 (Gasse, Third 20 m): Unterzug-Ständerreihe sichtbar in Tür und
Fenster, Traufen von Satz und Masse an 300 m ohne Sprung (Z1 Blatt g gemessen vorher 0,45–2,55 m → nachher 0).

## ERSTE PUNKTE DER NÄCHSTEN RUNDE
1. **Spike (6) gegen Quellen und Saaten** — erst danach eine Bau-Welle. Fällt er, fällt die Schiffigkeit als Gesetz, nicht die Zahl.
2. **Lichte Höhe** an Entwurf a (Programm) übergeben: ohne seinen Wert bleibt geschossH = licht + h + 0,06 mit licht als benanntem Rest.
3. **stammD(art, ort)** als reine Funktion aus phyto (pc:92–121): Mess-Ergebnis „Eiche 0,330 m" klären (Radius oder Durchmesser?),
   sonst bleibt d ein Stellwert.
4. **Holz-Zeilen je Art** in STOFF_GESETZ (sc:2878) — EN-338-Klassen nachschlagen (D30 E₀,mean 10 oder 11 GPa), danach erst Code.
5. **Gefach-Maß a_Gefach** (Ausfachung Lehmstaken/Backstein): die Statik gibt nur ≤ 2,92 m; ohne Quelle bleibt bayMax ein benannter
   Stellwert, mit ihr folgt die Fensterbreite = a − post.
6. **Naturstein- und Kellerwand** (Erddruck, Bruchstein-Schlankheit) und **Gründungstiefe aus Frost** (Stefan-Integral wie eisDicke
   gc:1404 auf den Boden): ungerechnet.
7. **Zeilen für Blockbau, Lehm-Flachdach, Glas/Stahl** — oder offen benannt aus dem Gesetz heraus (Kultur-Zeilen holzhuette, pueblo,
   griechisch, hochhaus).
8. **Ziegel-Brand und Kalk:** Farbe aus dem Lehm des Orts verlangt Eisengehalt/Lithologie, die gc nicht trägt (gc:3349, 5836) —
   bleibt Kultur, bis der Planet Gestein je Ort liefert.
9. **PHYSIS knickSicherheit 500** (bb:2592): ob der Werkstatt-Richter auf EN-1995-k_c umzieht, gehört nicht diesem Kapitel — der
   Befund (24× zu streng) geht als Zeile an den Werkstatt-Halter.
10. **Wind und Aussteifung:** Zahl der Streben/Kopfbänder aus Windlast je Wand ist ungerechnet; die Strebenfigur bleibt Kultur.
