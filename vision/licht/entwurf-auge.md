# ENTWURF: das EINE Gesetz des Lichts, gedacht vom Auge her

Stand: Arbeitsbaum `strahler-leuchte` = 2ce8a033d. Nur gelesen und gerechnet, ohne GPU, Browser oder Änderung am Baum.
Die Rechnung steht in `vision-licht/auge.cjs`, ihre Ausgabe in `vision-licht/auge.out.txt`. Jede Zahl unten kommt von dort, wenn
nicht anders gesagt. Marken: **belegt** (Physik, Norm, Literatur) · **gewählt** · **unsicher**.

**Kern in zwei Sätzen.** Das Rosa hat zwei Ursachen, und die Rechnung trennt sie. Erstens schieben Mittel-Messer diffuse Flecke in
die Schulter (Herd 6,7 EV und Lava 8,6 EV über der Karte, bei 4,15 EV Platz). Zweitens mischt Neutral leuchtende Flächen linear zu
Grau, und das wird nach der sRGB-Kodierung Lachs: Bett 17°, Decke 5,5°, Riss 0° statt 31°, 20° und 27,5°. Der Entwurf löst beides
mit EINEM Zustand, der eine Kappe aus dem hellsten diffusen Fleck trägt, und mit derselben Schulter, nur im kodierten Raum entsättigt.

---

## 1. Die Kette in echten Einheiten

| Schritt | Formel | Einheit |
|---|---|---|
| **Quelle** | Lampe: I = Datum. Wärmestrahler: L = ε·L_P(T) (`leuchtdichte`, FC:6532), I = L·A. Sonne: E_⊙ = 128 000 lx × Durchlass (Hillaire). Mond: E_☾ = 0,27 lx × Durchlass. Himmel: dieselbe Tafel in lx | cd · cd/m² · lx |
| **Weg** | E(p) = I · kopfSicht(kopf, a, h) / (d² + k²) · T_Luft(d); die Scheibe als Sichtfaktor (SM:2399-2440); die Sonne × Schatten | lx |
| **Stoff** | L = ρ/π · E (Lambert-Anteil von `_punktLichtBrdf`); leuchtende Fläche: L direkt | cd/m² |
| **Auge** | Zustand L_a = log-Mittel der Sicht (10.–90. Perzentil). K = min(K_a, K_c) mit K_a = 0,22 · 2^c(L_a) / max(L_a, L_☾,Karte) und K_c = 0,866 / (L_diff,max · max_c) | 1/(cd/m²) |
| **Nacht-Auge** | s = 1 − clamp(ln(L/0,005)/ln 1000), L = x/K. gesehen = f(1 − s) + skot(f)·s (CIE 191 Band, Pattanaik V′) | — |
| **Tonkurve** | x = L·K → Khronos-Fuß → Schulter P′ = 1 − 0,0576/(P − 0,52) ab 0,76 → Entsättigung g = 1 − 1/(0,15(P − P′) + 1), **gemischt im sRGB-kodierten Raum** | k·L → sRGB |
| **Schirm** | sRGB-OETF, 8 Bit | Code 0–255 |

**DIE EINE BRÜCKE Einheit ↔ Szenen-Zahl heißt K, die Vorbelichtung** (pre-exposure; Lagarde/de Rousiers, „Moving Frostbite to PBR“
2014, §5.1, **belegt**): **x = L [cd/m²] · K [1/(cd/m²)]**. Jedes Licht verlässt die CPU als Datum × K, durch EINE Funktion `insBild(w) = w·K`:
- Richtlicht: E · K
- Pool: I · K
- Glut: L · K
- Tafel-Himmel: E_⊙ · K

`toneMappingExposure` ist fest 1. Kein Shader kennt eine andere Einheit, und die Szene liegt zu jeder Stunde um 0,22: ein
rg11b10-Ziel trägt Mittag (L_Karte 6 713 cd/m²) und Mondnacht (0,0155 cd/m²) mit derselben Mantisse. Es entfallen damit die
Welt-Einheit (Tag 14 690 lx je Einheit), die Skala S, die Nacht-Eichung 1,161 und der r128-Faktor π, also vier der sieben Einheiten der Tafel.

## 2. Die Daten, die übrig bleiben

**Quelle: Temperatur · Leistung oder Candela · Geometrie.** Alle Quellen sind Daten derselben Art. Das Licht und das Bild der
Fläche lesen dasselbe I und dasselbe L = I/A.

| Quelle | T (K) | Maß | Geometrie | Marke |
|---|---|---|---|---|
| Sonne | aus Hillaire | E_⊙ 128 000 lx außerhalb der Luft | Scheibe 0,53° (N26) | belegt |
| Mond | wie Sonne (≈ 4 100 K) | E_☾ 0,27 lx im Zenit, Vollmond | Scheibe; mondRichtung | belegt (Größenordnung 0,25–0,3) |
| Sterne/Nachthimmel | Ton N5 | 0,0005 lx (USNO, tag-ref) | Halbkugel | belegt |
| Himmel | — | FOLGT aus E_⊙ über die Tafel | — | folgt |
| Herd | 2 000 (Q1) | I 249 cd (aus 10–20 kW × 0,16 lm/W, FC:6516) | Bett 0,4536 m², Höhe 0,35 m | belegt (Größenordnung) |
| Brand | Flammen-T je Zelle (FB:994) | ε_Flamme (Q8) | Zellfläche | Q8 folgt aus Herd |
| Lava | 1 650 → 798 (Q23, Q21) | ε 0,95 (Q9) | Decke, Scheibe | belegt |
| Glut/Esse | 1 573 (Q26) | ε 0,8 (Q9) | 0,06 m² | — |
| Laterne | **T je Brenner** (fehlt heute) | I je Brenner (L1) | Kopf (L17/L18) | belegt (Kerze 1 cd) |
| Fenster | T des Brenners der Stube | L = ρ_Stube · E_Stube/π · τ_Glas | Scheibe | FOLGT, sobald die Stube ihren Brenner trägt |
| Tor | Farbe als Absicht (PC:1722) | I 15 cd (L28) | Rahmen | gewählt |
| Fahrzeug | T der Lampe | I je Lampe (heute Stellwert E1) | Linse | wird Datum |

**Stoff: Albedo ρ** je Stoff (vorhanden, E16).

**Auge: EIN Zustand L_a**, gelesen aus dem Bild. Dazu fünf Zahlen:

| Zahl | Wert | Marke |
|---|---|---|
| zielKarte | 0,22 | FOLGT: Neutral(0,2212) = 0,18 |
| steigung | 0,75 | Bild-Anker (Frostbite), bleibt |
| Nacht-Stufe | −2,17 EV | Bild-Anker Luma 44, bleibt |
| Spanne über der Schulter | 0,188 EV | FOLGT: Elastizität der Schulter = ½ bei P 0,866 |
| τ der Anpassung | 0,8 s / 0,3 s | heute RAUM.blendeS/HellS, bleibt als die EINE Zeitkonstante |

Die Knoten der Kompensation sitzen **in Leuchtdichte, nicht in Sonnenhöhe**:
- L_Mittag = 0,18 · 117 168/π = 6 713 cd/m², Stufe 0
- L_10 = 634,8 cd/m², Stufe −0,851 (FOLGT aus steigung; Tafel A27: −0,870)
- L_☾ = 0,0155 cd/m², Stufe −2,17

Unter L_☾ bleibt K bei 3,16 stehen: die Blende ist ganz offen, und das Bild fällt mit dem Licht. Am Mittag zeigt die Karte 118,0
(Lehre 21 hält). Bei Sonne 0° liegt die Stufe 0,12 EV unter dem heutigen Fahrplan (−1,180 gegen −1,303).

**Die Reichweite folgt aus der Schwelle des Auges** (TVI, Ferwerda et al. 1996, **belegt**) und ersetzt `AUGE.eps`. Bei Vollmond
ist der Weber-Bruch 0,48. Daraus reichen:

| Quelle | Reichweite |
|---|---|
| Docht | 2,8 m |
| Gas | 11,1 m |
| Glühstrumpf | 27,7 m |
| Herd | 43,8 m |

## 3. Signaturen und der EINE Chokepoint je Schritt

| Schritt | Funktion (Eingang → Ausgang) | Chokepoint |
|---|---|---|
| Quelle | `strahler(q)` / `leuchte(id, brenner)` → { kelvin, candela, cdM2 = I/A, flaecheM2, kernM, kopf, drehY } | fachwerk-core.js:6540 / :7626; dazu `BRENNER[*].kelvin` (FC:6442) |
| Weg | `beleuchtung(punkt, platz)` → lx (I·kopfSicht/(d²+k²), Scheibe, T_Luft) | TSL `_lichtPlatz` (SM:2391). Die CPU-Kopie wird `_beckenAn(p)` (heute `_beckenAmAuge`, DK:1799) und liest dieselbe Formel an jedem Punkt |
| Stoff | `brdf(ρ, E, N·L)` → cd/m² | `_punktLichtBrdf` (SM). Der Pool-Term summiert lx und **staucht nichts** (SM:2359-2365 fällt) |
| Auge | `auge(La, LdMax)` → K (1/(cd/m²)) · `insBild(w)` → w·K | welt-licht.js, ersetzt `belichtung`/`augeZeig`/`augeGlut` (WL:102-148, 743-774). EIN Schreiber: `_dayNightApplyBelichtung` (BH:1935) |
| Zustand | Histogramm des Bilds (¼ Auflösung, log L = log(x/K_alt)) → L_a; Feld der sichtbaren Bodenpunkte → L_diff,max | ein Compute-Pass mit Rücklese (neu). Das Feld ist `_beckenAn` an ~32 Punkten im Frustum |
| Nacht-Auge | `nachtAuge(x, K)`, s aus x/K in cd/m² | `_nachtAuge` (BK:2204) ohne `luxJeEinheit`, `bildZapfen` und `nacht`-Uniform |
| Tonkurve | `schirm(x)` → sRGB: Neutral-Schulter, Mischung im kodierten Raum | der Ausgangsknoten `pp.outputNode` (BK:2508). `renderer.toneMapping = NoToneMapping` (DA:167), `toneMappingExposure` 1 |

## 4. Was fällt

Gezählt mit `auge.cjs` §7 gegen `tafel-daten.cjs`: **41 Zeilen, 57 Felder**. In der Licht-Kette fallen **57 von 407 Feldern (14,0 %)**.
Davon sind **32 von 252 ankerlos gesetzten Feldern (12,7 %)**, 10 Felder ohne Leser und 5 Bild-Anker.

**Neu gesetzt werden 5 Zahlen:**
- E_⊙ 128 000 lx, **belegt**
- E_☾ 0,27 lx, **belegt**
- TVI nach Ferwerda, als Formel, **belegt**
- die Perzentile 10/90, **gewählt** (UE-Konvention)
- die Elastizität ½ als Maß der Spanne, **gewählt**; die EV-Zahl der Spanne folgt aus der Kurve

| Fällt | datei:zeile | Felder |
|---|---|---|
| AUGE welt · lux · p · q · anteil · eps · zustandMinLux (A1–A6, A9) | WL:84-93 | 7 |
| Skala S, augeLux, augeMass, augeZeig, augeGlut, augeMesser, augeReichweite (Funktionen) | WL:94-148 | (Funktionen, in A1–A6) |
| NACHT_AUGE luxJeEinheit · bildZapfen · staebchenStaerke (A10, A11, A13) | BK:3011, 3014, 3016 | 3 |
| BELICHTUNG min · gleitung · nachtKnotenGrad (A18, A20, A22) | WL:176, 178, 181 | 4 |
| Start-Belichtung 1,0 (A23) | DA:168 | 1 |
| Ersatzwerte `?? 1` (fail-soft, A24) | DK:1621, 1623, 1629, 1849; BS:503; BH:2071 | 3 |
| lichtGlut / lavaGlut als S-Form-Höhe (A28, A29): sie werden L·K | DK:1622-1632 | 2 |
| MOND_STAERKE · MOND_E · nachtKnotenE (N1–N3) | WL:169, 172, 180 | 3 |
| nacht.lum (N7, ohne Leser) · daemmer (N12) · nachtGrad (N16) | FO:312; WL:226, 182 | 3 |
| Ambient der Nacht · Ambient-Gefühl · Hemi · Hemi-Boden · Aura-Tönung des Bodens · Boot-Saat (N19–N22, N24, N33) | BH:2251-2252, 2470-2492; DA:356, 455 | 16 |
| KEY_BASE · LEGACY_LICHT (S1, S2) | WL:49, 53 | 2 |
| feuer.cdM2 10 000, der Zwilling des Pools (Q6) | FC:6529 | 1 |
| BRAND.licht/schein (Q17, ohne Leser) · Flamme ziel 1,6/k (Q19) · M.feuer emissive (Q29, ohne Leser) | FB:964, 995, 997; FC:2073 | 4 |
| laterne.cdM2 · wandlaterne.cdM2 · leuchte().cdM2 (L8, L16, L20): eine L = I/A je Brenner | FC:6458, 6476, 7641 | 3 |
| Wasser-Boden max(0,22) (E17) | BH:2566 | 1 |
| Raum-Deckel und Ziel ≥ −8,68 (R2) · RAUM.sprungM (R1) | BH:1987, 2003, 2018; SD:300 | 4 |

**Dazu fallen ohne eigene Tafel-Zeile:**
- die Umkehrer von k: Augen-Licht (BH:2101-2111), Tor 1/k (siedlung-tor.js:646), Zapfen-Schwelle l·k (BK:2218)
- die Tag-Achse als Schalter des Lichts: `tagAchse.nacht`/`tag` für Ambient, Hemi und nightFactor (WL:851-853)
- der Augen-Licht-Hin-und-Rück ÷π·π (BH:2092, DK:2012)
- die zweite Ausgabe ohne Kurve (stamm/werkstatt-vorschau.js:1547/1562), die über dieselbe `schirm` läuft

## 5. Die vier Runden, nachgerechnet, und wo der Entwurf bricht

Modell (alles **unsicher**):
- Gras ρ = 0,151/0,182/0,044 (Spike r3).
- Herd 249 cd in 0,35 m Höhe, k² = 0,144, als Punkt ohne Halm-Volumen.
- Lava: Decke πL = 14 500 lx bei 1 300 K, Riss bei 1 650 K × 0,95; die Ufer-E aus dem Spike.
- Gasse 1320 mit Docht-Wandlaterne (I 1,184 cd, k² 7,52, aus FC:6466-6482 nachgerechnet).
- Bildanteile geschätzt.

**Die Wand, an der alle vier scheiterten.** Ein Messer, der aus dem Mittel misst, legt die Karte des Zustands nachts auf
0,22·2^−2,17. Bis Schulter + Spanne (0,866) bleiben **4,15 EV** Platz, am Tag 1,98 EV. Liegt der hellste diffuse Fleck weiter über
der Karte, landet er in der Schulter, und Neutral mischt ihn linear zu Grau. Nachgerechnet:

| Sicht | Messer | hellster diffuser Fleck über der Karte | Ergebnis |
|---|---|---|---|
| Herd-nah | R4 (Feld-Mittel 5,99 lx) | 6,73 EV | Gras 0,75 m: 207,6 (254/198/166), H 21,8°, S 0,35 → Lachs |
| Lava | R4 (9,25 lx) | 8,63 EV | Ufer-Saum: 231,9 (255/226/222), H 7,3° → rosa-weiß |
| Lava | R3 (568 lx) | 2,69 EV | kein Rosa (Saum 71, S 1,0) |

Zur Lava unter R3: das Rosa dort kam nicht aus k, sondern aus dem k-festen Glut-Pfad (Spike: Baumlinie +155). Diesen Pfad gibt es
im Entwurf nicht mehr.

- **R1, q-Gesetz.** Der Verlauf des Grases von 0,75 m bis 4 m ist physikalisch 4,29 EV, gezeigt 0,88 EV (Anteil 0,20). Gras in 4 m
  über der Mondwiese ist physikalisch 5,85 EV, gezeigt 1,68 EV. Der Exponent 0,42 auf E/A frisst den Verlauf: „wäscht ohne Verlauf“.
- **R3, A + 0,25·ΣE.** Zustand 2,88 lx. Gras 0,75 m liegt bei k·L 4,68 und wird 225,9 (254/220/202), S 0,20. Die Sättigung 0,948
  der Runde ist dieselbe Klasse: ein diffuser Fleck in der Schulter.
- **R4, Feld-Mittel + von Kries.** Lava und Herd siehe oben. In der Gasse gibt der Zustand 2,63 lx gegen echte ≈ 0,27 lx: das sind
  3,3 EV zu dunkel, die Mondwand steht bei 8,2. Die Gewinne 0,83/1,11/3,27 (grob je Kanal) machen sie 1,6 (5/0/7), H 283°:
  blau-schwarz.

**Der Entwurf an denselben Flecken** (K = min(K_a, K_c), Nacht-Auge in cd/m², kodierte Schulter):

| Sicht | Fleck | Bild | Ton |
|---|---|---|---|
| Herd-nah (K_c bindet, 0,0238) | Gras 0,75 / 1,25 / 1,75 / 2,5 / 4 m | Luma 149 / 105 / 78 / 53 / 29 | H 35–31°, S 1,00 |
| Herd-nah | Bett | 237,7 | H 30,7° (Neutral 17,1°) |
| Herd-nah | Flamme | 254 | — |
| Lava (K_c bindet, 0,0041) | Ufer-Saum / vorn / Gras 15 m / Baumlinie | 114 / 90 / 59 / 34 | H 22–19,5°, S 1,00 |
| Lava | Decke | 242,6 | H 20,9° (Neutral 5,5°) |
| Lava | Riss | 253 | H 30° (Neutral 0°) |
| Gasse (K_a bindet: offene Blende 3,16) | Mondwand / Gasse unter Laterne + Mond / Wand an der Laterne / Wand im Mondschatten | 21 / 55 / 23 / 0 | — |
| Gasse | Fenster, Datum 20 cd/m² | 251,5 | — |
| Gasse | Fenster, aus der Stube (0,48 cd/m², **unsicher**) | 202,5 | H 28° |

Die Eigenschaften der SOLL-Karte, in allen vier Sichten nachgerechnet:
- **(a) Ordnung:** monoton in allen vier.
- **(b) Schulter:** der hellste diffuse Kanal liegt genau auf 0,866, durch die Kappe.
- **(c) Ton:** größter Fehler diffus 1,8° (Herd), 4,3° (Lava), 5,2° (Gasse, mesopisch).
- **(d) Zustand je Sicht:** Herd und Lava binden an der Kappe, die Gasse am Zustand.

**Warum keine dieser Sichten dieselbe Wand trifft:**
- Die Kappe macht (b) zur Konstruktion statt zum Glück.
- Die kodierte Mischung hält den Ton der leuchtenden Flächen. Bei k·L 16: Riss 27,3° gegen Neutral 12,0°, Fenster 30,0° gegen 24,0°,
  Gras 33,8° gegen 18,9°.
- Die Gasse kennt keinen Weißabgleich, und ihre offene Blende ist der Boden des Monds.

**Die 0,75 des Tors fällt.** Feuerlicht × Gras ist physikalisch schon gesättigt (linear 0,998). Das Nacht-Auge nimmt in 1/2/3 m nur
s = 0/0,07/0,18, der Schirm zeigt S 1,00. Die Zahl folgt nicht aus dem Gesetz. (c) ersetzt sie.

**Wo der Entwurf am ehesten bricht: die ferne Wiese neben dem Feuer.** Gras in 0,75 m gegen die Mondwiese sind 10,9 EV (hellster
Kanal). Die Kurve trägt von Schulter + Spanne bis Code 1 nur 6,96 EV. Die Wiese steht damit rund 4 EV unter Code 1 und wird
schwarz (Luma 0, an Herd und Lava). Das ist die Kamera, nicht das Auge, das örtlich anpasst. Ein globaler Zustand mit (b) kann
beides nicht zeigen. Dieser Bruch ist benannt, nicht geheilt.

Die nächsten Risse, mit Zahl:
- **Fenster:** das Datum 20 cd/m² brennt in der Mondgasse weiß (251,5).
- **Blau der Nacht:** der Mond als Sonnenlicht (≈ 4 100 K) nimmt der Nacht ihr Blau; die Wände stehen warm-grau, H 20–28°.
- **Kappe:** sie springt, wenn der nächste helle Bodenpunkt ins Feld tritt. Gegen den Sprung trägt nur τ 0,3 s.
- **Dämmerung:** das Nacht-Auge liest s aus L, bei −6° ist s ≈ 0,49 an der Karte. Die Dämmerung entsättigt also stärker als heute.

## 6. Der Preis und die drei alten offenen Punkte

**Preis.** Grob geschätzt, nichts davon gemessen.

| Posten | Änderung | Kosten |
|---|---|---|
| Pool-Term | −2 pow, −1 min je Fragment im Pool | spart |
| Nacht-Auge | −1 smoothstep, −1 Konstante | spart |
| Tonkurve im Ausgangsknoten | +6 pow (kodieren und zurück) je Ausgabe-Pixel, ≈ 40 ALU × 2,07 Mio px | ≈ 0,05 ms auf der GTX 1050 |
| Histogramm | +2 Compute-Programme (Histogramm über ¼ Auflösung, 64 Fächer, atomar; Mittel und τ in einem Faden) | ≈ 0,05–0,1 ms, **unsicher** |
| Rücklese | +1 mapAsync je Bild, 2–3 Bilder Verzug, unter τ unschädlich | — |
| Feld der Kappe | 32 Punkte × ≤ 4 Plätze auf der CPU je Wahl (0,25 s) | µs |
| Uniforms | −lichtAuge (vec3); lichtGlut/lavaGlut bleiben, tragen aber L·K; K reist als vorhandenes `toneMappingExposure`-Glied | netto 0 neue |
| Render-Programme | keines neu; der Text der Boden- und Wand-Programme ändert sich (kalt neu übersetzen, Pflicht-OFFEN B) | — |

**Die drei alten offenen Punkte an ihrem Platz.**
1. **Kopf-Glut und Kelvin je Brenner: Schritt Quelle.** `BRENNER[*]` bekommt `kelvin`:
   - Kerze 1 850 K (belegt)
   - Glühlampe 2 856 K (CIE A, belegt)
   - Argand, Gas und Glühstrumpf (unsicher)

   Die Kopf-Glut ist L = I_Brenner / A_Glas je Eintrag. Damit fallen L8, L16 und L20. Die Glut reist je Instanz als L·K. Das
   eine Uniform je Schlüssel (DK:1626-1631) fällt, und Docht ×100, Argand ×10 und Gas ×6,25 sind weg.
2. **Kopf als Inkreis: Schritt Quelle/Weg.** `leuchte()` gibt dem Kopf die Drehung mit. Der Pool-Eintrag (DK:1908-1917) trägt
   `drehY`, und `kopfSicht` rechnet das Quadrat statt des Inkreises: frei bis 29,5° in der Diagonale statt 38,7°.
3. **`_lichtWurfTakt` ohne Kopf: Schritt Weg/Verdeckung.** Die Wichtigkeit ist das Bild selbst, w = K·ρ/π·I·kopfSicht/(d² + k²) am
   Bezug. Sie misst gegen die Schwelle des Auges (TVI) statt gegen `augeZeig`. Wahl, Reichweite und Wurf lesen damit dieselbe
   Kette wie der Stoff (BS:493-507, DK:1846-1851, 1879-1882).

---

**Nicht gelesen, nicht gerechnet:**
- die Tafeln von Hillaire in absoluten Einheiten (ob 128 000 lx × Durchlass die heutige Mittags-REF 117 168 lx trifft)
- ob r184-TSL atomare Compute-Histogramme und `getArrayBufferAsync` so trägt
- der Weg durch die Luft (T_Luft) und die Verdeckung bis ans Pixel
- die Studios und die Panoramen der Tor-Membran
- jede Zahl am Gerät und jedes Bild

Die Bildanteile, die Albedo von Wand und Baum, die Flammen-Leuchtdichte 1e4 cd/m², das Fenster der Stube und die Gewinne von
von Kries je sRGB-Kanal statt in LMS sind Annahmen. Das Gras-E beruht auf dem Punkt-Modell ohne Halm-Volumen (der Spike traf damit
3 von 11 Flecken auf ±20 %).
