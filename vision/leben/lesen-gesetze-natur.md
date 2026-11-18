# Leser: Natur-Gesetze als DATEN-Gesetz für Arten (main 18058dba, nur gelesen)

Gelesen: tetrapoda-core.js 40–296, 835–900, 1320–1440, 1605–1640, 1950–1975, 2160–2235, 3930–4130 · phyto-core.js 1–160,
2300–2560, 2823–2860, 3100–3140, 3260–3325 · foundry-core.js 630–650, 4713–4760, 5005–5095 · planet-core.js 1–62, 295–330 ·
stamm/koerper-leib.js 2440–2560 · stamm/kreatur-leben.js 135–175, 1384–1400, 1712–1730, 1940–2005 · stamm/bau-teile.js 1474–1510 ·
stamm/kreatur-verhalten.js 540–560 · stamm/bau-vorlagen.js 1555–1580. Alles andere: OFFEN.
Einheiten des Kerns: Masse kg (Volumen der Gestalt × MASSSTAB.dichteKgM3 1000, tetrapoda-core.js:3943), Länge m
(meterJeEinheit 1/3, ebd.), Hüft-Höhe L m, Tempo m/s, Zeit s Spiel-Zeit (alterS), Planet: km, Ma, °C, g m/s².

## (1) WAS TRÄGT — konsumierte Gesetze mit Leser

| Gesetz | Ort | Leser |
|---|---|---|
| Froude-Gangart Fr = v²/(gL): Trab 0,5, Galopp 2,5, Hysterese 0,2 (Alexander & Jayes 1983, Hoyt & Taylor 1981) | tetrapoda-core.js:1375–1386 | gangArt :1389, gangSchritt :1418 |
| Schrittlänge λ/L = 1,4 + 1,0·v̂; Tastgrad 0,65/0,5/0,3 | :1335–1361 | gangSchritt :1418 |
| Tempo-Einheit 0,34·√(gL), Sprint 3,0·√(gL) | :1618–1633 | tempoEinheit, sprintTempo (Wirt Steuer-Takt) |
| Beinmuskel ∝ (size/2,4)^0,67, Schädel ∝ (size/2,4)^0,25 | :853, :870 | deriveTierParams :839 → Kreatur-Ofen |
| Masse = Volumen × 1000 kg/m³ (Fuchs 15, Wolf 64, Hirsch 94, Bär 335 kg bei Größe 1) | :3940–3943 | _leibMasse (kreatur-leben.js:636, :749, :845), Stoff-Zeile bau-vorlagen.js:1570 |
| Kampf: Biss ∝ m^⅔, Haut ∝ m^⅓, Leben ∝ m^⅔, refKg 64 (Christiansen & Wroe 2007) | tetrapoda-core.js:3959 | kreatur-leben.js:749 |
| Temperament aus Kost + Masse (jagdKg 21,5 — Carbone 2007; wehr 200, koloss 600 kg) | :208–214, :1960 | _creatureTemperament kreatur-leben.js:619–636 |
| Beute ≤ 2,0 × eigene Masse | :167 | Jagd-Wahl (Wirt) |
| Bestand: logistisch (Verhulst), Holling-III-Riss, Kost-Nahrung | :2205–2230 | _creatureNaturalBirth kreatur-leben.js:1949 |
| Baum: McMahon D = (2H/k)^1,5, k 13–22; da Vinci r^Δ; Phyllotaxis 137,5° | phyto-core.js:79–80, :37–38 | growSkeleton :27 |
| Stamm aus der Krone (kd 21,5) / Konifere H/D 40–100 | :448–449, :95–115 | growSkeleton, gate:pflanzen-nah |
| Jugend: Blatt × alter^−¼ | :2540 | treeParams :2446 |
| Wald-Größen „reverse-J“ s = 0,55 + 1,45·u^1,45 | :3105 | planForestCell :3631 |
| Planet-Körper g = 9,81·R/6371·(0,8…1,2) | planet-core.js:313 | planetPlan; Leser im Gang: GANG_GESETZ.g = 9,81 fest (tetrapoda-core.js:1334) — ob der Wirt g der Welt setzt: OFFEN |

## (2) WÜRFE UND TABELLEN

Tiere
- **Körpergröße-Wurf** stamm/koerper-leib.js:2545 `_creatureBodySize`: FNV-Hash der netId → vier Bänder tetrapoda-core.js:253–260
  (klein 0,6–0,82 · normal 0,85–1,18 · groß 1,25–1,75 · Gigant 1,9–2,7). Uniformer Skalar (kreatur-leben.js:158) ⇒ Länge ×4,5,
  Masse (×s³) 0,216 → 19,7 = ×91 innerhalb EINER Art. Natur: Länge CV 4–10 % (unsicher), Masse ±~30 %, Geschlecht ×1,0–2,0.
  Ein Gigant-Wolf (64·19,7 ≈ 1 260 kg) wird „wehrhaft/wild“ und wiegt mehr als ein Bär — reine Würfelfolge. Leser:
  kreatur-leben.js:149 (Spawn), :1993 (Geburt im Bestand, Same = `rng()*1e9`, KEINE Eltern), kreatur-gehege.js:64, netz-p2p.js:1527.
- **Art = Tabellen-Zeile**: GATTUNGEN (4 Zeilen × 5 Dials) tetrapoda-core.js:62; ART_GESTALT (Rumpfprofil 3×11 Stationen, Glieder,
  Kopf, Fell-Farben je Art) :3973–4036; ANATOMIE_SOLL :4045. artGewichte :4062 mischt Gauß mit σ² 0,01 und fällt fern jeder Art
  auf „die nächste trägt allein“ (:4079) ⇒ zwischen/außerhalb der vier Presets entsteht KEINE neue Art; Farbe und Ohr-Form
  sind Wörter der stärksten Art (:4095).
- herde.wurf Kopfzahl je Gattung [3,6] [3,7] [1,1] [1,1] :289 — Tabelle mit Quelle, aber an den Namen gebunden.
- Temperament-Profile (4 Zeilen strike/flee) :215–220 — Stellwerte ohne Anker.
- BESTAND_GESETZ :2205: geburt 0,1, tod 0,2, kopfJeHa 25 GLEICH für jede Gattung — Natur: r_max ∝ M^−0,25, Dichte ∝ M^−0,75.
- Leine 18 m ± 10 m × bodySize :225 (der Gigant streift 2,7× weiter); Wander-Takt strideSec aus netId :228.
- Name-Wurf kreatur-leben.js:596 (harmlos).

Pflanzen
- **Art = Preset-Zeile**: foundry-core.js:4721–4760, 5014–5040 (eiche, fichte, birke, weide, mammut, tanne, strauch, blume, gras,
  buche, karst, totholz) mit hoeheM, hd, Rinde/Laub-Hex. FOREST_SPECIES 6 Namen phyto-core.js:3299.
- treePhenotype phyto-core.js:2300: Höhe lerp(2,2; 6,0) × 1,4 Konifere × 1,6 Sequoia; Rinden-Typ per Schwellen (slim > 0,66 →
  Birke); Farb-Tabellen BC/LC 6 Typen :2328–2342 — Gestalt aus Schwellen, nicht aus Ökonomie-Achsen.
- Individuum: treeParams-Strom IR = mulberry32(seed) :2478: Höhe × (1 ± 0,16), Dials ± 0,1, Blatt ± 0,12/0,16, Laubfarbe HSL-Wurf
  :2481–2505 — Streuung ohne Erbe, ohne Standort.
- **gestalten 1–2 je Art** foundry-core.js:639–650: die Welt trägt je Art 1–2 Individuen-Formen (+1 Solitär) — „jedes Individuum
  eigen“ ist heute für Bäume falsch; Größe kommt aus forestTreeSize, Gestalt aus 2 Klonen.
- forestNicheWeights :2853–2857: Art-Gewichte aus Hand-Koeffizienten (0,45·sF + 0,5·dry …) — Klima liest, aber ohne Merkmal.
- forestTreeSize 5 % Überhälter :3112; forestMammutRoll 2 % :3123; FOREST_LAB Schwellen :3264–3297.
Planet
- planetPlan koerper planet-core.js:311–325: Radius 2 500–12 000 km, g-Faktor 0,8–1,2, Tag 10–50 h, Jahr 100–800 d, Alter 3–6 Ga
  — gleichverteilte Würfe aus dem Samen (kein Sternentstehungs-Gesetz; außerhalb meines Felds, nur benannt).

## (3) GRÖSSEN — vorhanden (mit Einheit) / fehlend, und die Gesetze, die sie lesen müssten

Vorhanden: Masse M kg (_leibMasse), Dichte 1000 kg/m³, L m, v m/s, g m/s² (Gang fest 9,81; Planet hat eigene g), alterS s,
taktS 10 s, revierM 113 m, kopfJeHa 25 /ha, Magen 0,2·M kg, verdauSec 600 s; Baum hoeheM m, H/D, kd 21,5; Planet g, alterMa Ma,
Klima-Temperatur °C, spendeMm (planet-core.js:43–44), Biom.
FEHLT: Stoffwechsel W, Lebensdauer, Generationszeit, Reife-Alter, Wurf-Intervall, Eltern-Bezug, Erb-Wert/h², Mutations-Varianz,
Art-ID ≠ Name, Stammbaum/Art-Alter, Luftdichte ρ_Luft (Flug), Flügel/Flossen, Wasser-Arten, Blatt-LMA, Blatt-N, Holzdichte je
Art (Stoff-Zeile „holz“ ist eine — OFFEN), Samenmasse, Blattfläche.

### KÖRPER (M in kg, Säuger, wo nicht anders)
- K1 Kleiber: B = 3,4·M^0,75 W (70 kcal/d·M^0,75; Kleiber 1932), 0,01–4 000 kg; Exponent 0,67–0,75 strittig (White & Seymour
  2003). Mit Temperatur (MTE): B = b₀·M^¾·e^(−E/kT), E ≈ 0,65 eV, k = 8,617·10⁻⁵ eV/K (Gillooly et al. 2001).
  Bild: Fress-/Ruhe-Takt, Magenleerung verdauSec ∝ M^0,25 statt 600 s fest. Ersetzt: verdauSec/fressSec-Stellwert :176–177.
- K2 Skelett: M_skel = 0,061·M^1,09 kg (Prange, Anderson & Rahn 1979). Bild: Knochenanteil 6 % (1 kg) → 12 % (1 t).
- K3 Glieder: Länge Femur ∝ M^0,35, Durchmesser ∝ M^0,36 (Alexander et al. 1979); elastische Ähnlichkeit d ∝ l^1,5 (McMahon
  1975). Kern hat Beinmuskel ∝ size^0,67 (≈ M^0,22 bei size ∝ M^⅓) — Bein-Dicke ∝ M^0,36 statt uniformer Skala. Bild: ein großes
  Tier hat relativ dickere Säulen-Beine; heute ist der Gigant ein aufgeblasener Normaler (uniformes setScalar, kreatur-leben.js:158).
- K4 Haltung/Knochen-Spannung: EMA ∝ M^0,26 hält σ_Knochen konstant bis ~300 kg, darüber steigt σ (Biewener 1989). Grenze
  aus Schwere: σ ∝ g·M^⅓ bei geometrischer Ähnlichkeit ⇒ M_max ∝ g^−3 (abgeleitet, unsicher als Gesetz; Erd-Land-Obergrenze
  ~5·10⁴–8·10⁴ kg Sauropoden, unsicher). Bild: Planet mit g 1,2× trägt Landtiere bis ~0,58× Masse, 0,8× bis ~2×.
- K5 Herz: f_H = 241·M^−0,25 /min (Stahl 1967). Atem 53,5·M^−0,26 /min (Stahl 1967, unsicher). Bild: Atem-Bob-Frequenz, Hecheln.
- K6 Lebensdauer max: t_max = 11,6·M^0,20 a (Sacher 1959 / Calder 1984; unsicher Konstante). Generationszeit
  T_gen ∝ M^0,25…0,28, Konstante ≈ 1–2 a·M^0,25 (unsicher; Gaillard et al. 2005). Reife α ∝ M^0,27 (unsicher).
  Ersetzt: alterS ohne Grenze (Tod nur „alter“-Ursache ohne Gesetz sichtbar, kreatur-leben.js:1715 — Uhr OFFEN).
- K7 Fortpflanzung: r_max ≈ 0,025…0,05·M^−0,26 /d? — Größenordnung r_max ∝ M^−0,25 (Fenchel 1974; Konstante unsicher).
  Ersetzt BESTAND geburt 0,1 / tod 0,2 je Takt, gleich für Fuchs und Bär.
- K8 Höchsttempo: log₁₀v = 1,478 + 0,259·log₁₀M − 0,0623·(log₁₀M)², v km/h (Garland 1983), Gipfel bei ~120 kg; besser
  v_max = a·M^b·(1−e^(−h·M^i)) (Hirt et al. 2017, Konstanten unsicher). Kern: Sprint 3,0·√(gL) ⇒ v ∝ M^⅙ ohne Gipfel.
  Bild: der Gigant läuft heute schneller als jeder Normale; real kippt Tempo über ~100 kg.
- K9 Transportkosten Lauf: P/M = 10,7·M^−0,316·v + 6,03·M^−0,303 W/kg (Taylor, Heglund & Maloiy 1982; unsicher in Ziffern).
  Schwimmen COT ~ 1/10 Lauf (Schmidt-Nielsen 1972, unsicher). Wasser hebt die Schwere-Grenze: Blauwal ~1,5·10⁵ kg.
- K10 Flug: Flächenlast W/S ∝ M^⅓ (geometrisch), Mindest-Tempo v_min = √(2·M·g/(ρ_Luft·S·C_L,max)), C_L,max ≈ 1,5–1,6
  (Pennycuick 2008); Leistung nötig ∝ M^7/6, verfügbar ∝ M^⅔…¾ ⇒ Schlagflug-Grenze ~12–15 kg (Pennycuick), Segler bis ~70 kg
  (Argentavis, unsicher). Braucht ρ_Luft und g des Planeten (beides als Quelle: g ja, ρ nein).
- K11 Gang: Froude-Schwellen 0,5/2–3 (schon Kern), Gehen nur Fr < 1 (Alexander 1989). Bei anderem g: gleiche Fr ⇒ v ∝ √(gL).

### ERBE
- E1 Infinitesimal-Modell (Fisher 1918; Bulmer 1971): Zuchtwert Kind A_K = (A_V + A_M)/2 + N(0, V_A/2·(1−F̄));
  Phänotyp z = A + N(0, V_E). Eltern-Mittel-Regression: E[z_K] = μ + h²·(z̄_Eltern − μ).
  Bild: Wurf-Geschwister ähneln einander und den Eltern; ersetzt den Hash-Wurf je netId.
- E2 Züchter-Gleichung R = h²·S (Lush 1937); multivariat Δz̄ = G·β (Lande & Arnold 1983).
- E3 Typische h² (Mousseau & Roff 1987): Morphologie ~0,46, Physiologie ~0,33, Verhalten ~0,30, Lebenslauf ~0,26.
- E4 Mutations-Varianz je Generation V_M ≈ 10⁻³·V_E (h²_M 0,0001–0,01; Houle et al. 1996, Lynch & Walsh 1998; unsicher Spanne).
- E5 Phänotypische Streuung je Art: lineare Maße CV 4–10 %, Masse CV ~10–30 % (unsicher; Yablokov 1974). Größen-Dimorphismus
  Säuger M_♂/M_♀ 1,0–2,0, wächst mit M (Rensch 1950/Abouheif & Fairbairn 1997, unsicher). Ersetzt die Bänder ×4,5 Länge.
- E6 Raten: beobachtet 0,01–0,1 haldane (σ je Generation, Gingerich 2001; unsicher). Bild: Arten wandern sichtbar erst über
  10³–10⁵ Generationen — die Welt braucht die Zeitachse des Planeten (alterMa), nicht den Spiel-Takt.

### STAMMBAUM
- S1 Geburt-Tod-Prozess: Artbildung λ, Aussterben μ je Linie und Ma; N(t) = N₀·e^((λ−μ)t). Säuger/Vögel r = λ−μ ~0,05–0,2 /Ma,
  Umsatz ε = μ/λ ~0,5–0,9 (unsicher). Aus EINEM Samen + planet alterMa ⇒ Artenzahl folgt, kein Stellwert.
- S2 Baumgestalt: reale Bäume unbalancierter als Yule; Aldous-β ≈ −1 (Yule 0, PDA −1,5; Blum & François 2006). Colless/Sackin
  normiert liegen zwischen Yule und PDA (Mooers & Heard 1997). γ < 0 häufig (Verlangsamung; Pybus & Harvey 2000).
- S3 Merkmals-Evolution: Brown Var(Δz) = σ²·t; OU dz = α(θ−z)dt + σ dW, Halbwertszeit ln2/α (Hansen 1997). log M meist nahe
  Brown, Blomberg K ≈ 1, Pagel λ 0,9–1 (Blomberg et al. 2003; unsicher je Klade). Mantel-r Gestalt ↔ Baum-Distanz > 0 als Band.
  Bild: Verwandte sehen sich ähnlich, Konvergenz nur unter gleichem θ (Nische).
- S4 Arten-Größenverteilung je Klade: log M rechtsschief, Modus klein (Säuger ~40–100 g), harte Untergrenze ~2 g, Aussterben
  steigt mit M (Clauset & Erwin 2008: Diffusion in log M mit Wand; unsicher Konstanten). Cope-Bias: Tochter/Mutter-Masse
  Mittel leicht > 1 (~1,04 je Artbildung, unsicher). Ersetzt die 4 Größen-Bänder UND die 4 GATTUNGEN-Zeilen.
- S5 Erd-Maß (nur Band, unsicher): ~8,7·10⁶ Eukaryoten-Arten (Mora et al. 2011), Säuger ~6 400, Vögel ~11 000, Gefäßpflanzen
  ~3,5–3,9·10⁵.

### PFLANZEN
- P1 Globales Spektrum (Díaz et al. 2016, Nature 529:167): 6 Merkmale (Höhe, Stammdichte, Blattfläche, LMA, Blatt-N, Samenmasse);
  zwei Achsen erklären ~74 %: (a) Größe der Pflanze und Organe (Höhe, Samenmasse), (b) Blatt-Ökonomie (LMA ↔ N); Split der
  Varianz unsicher. Bild: jede Art ein Punkt auf zwei Achsen statt api/slim/trop-Schwellen.
- P2 Blatt-Ökonomie (Wright et al. 2004, GLOPNET): LMA 14–1 500 g/m² (typisch 30–300); Lebensdauer ↑, N_mass ↓, A_mass ↓ mit LMA
  (Exponenten unsicher). Bild: dunkle, dicke, langlebige Blätter (Nadel/Hartlaub) vs. hell-dünne Pionier-Blätter.
- P3 Blattgröße × Klima: groß warm-feucht, klein kalt/trocken (Wright et al. 2017, Science 357:917).
- P4 Rohr-Modell: Splintfläche ∝ getragene Blattmasse (Shinozaki et al. 1964); da Vinci Σr² = r₀², gemessen Δ 1,8–2,3 (Eloy 2011).
  Kern hat Δ (delta 2,05–2,4) und Stamm aus Krone — passt.
- P5 Knick-Grenze: H_krit = 0,79·(E/(ρ·g))^⅓·D^⅔ (Greenhill 1881/McMahon 1973), Sicherheit ~4 (Niklas 1994). Mit Planet-g:
  H_max ∝ g^−⅓ bei gleichem D (abgeleitet). Hydraulische Höchsthöhe Erde 122–130 m (Koch et al. 2004).
- P6 Corner-Regeln (Corner 1949; Westoby & Wright 2003): dickere Zweige tragen größere Blätter; Blattgröße ↔ Blatt-Dichte je
  Zweigvolumen negativ (Kleiman & Aarssen 2007). Kern: leafSize aus leaf-Dial unabhängig vom Zweig.
- P7 Metabolische Bäume: Wuchs dM/dt ∝ M^¾ (Enquist et al. 1999); Bestands-Selbstausdünnung N ∝ M^−¾ bzw. −3/2 (Yoda 1963).

### ÖKOLOGIE UND RAUM
- O1 Damuth: D ∝ M^−0,75; Pflanzenfresser log₁₀D = 4,23 − 0,75·log₁₀M (D /km², M g; Damuth 1981, Konstante unsicher) ⇒ Hirsch
  ~3/km², Fuchs (15 kg) ~11/km². Fleischfresser: 10 000 kg Beute tragen 90·M^−1,05 Räuber (Carbone & Gittleman 2002).
  Ersetzt kopfJeHa 25 für alle (tetrapoda-core.js:2209) — als RELATIVE Dichte, falls Spiel-Verdichtung bleibt.
- O2 Bergmann: innerhalb einer Klade M ↑ mit Kälte (gilt bei ~65–70 % der Arten; Meiri & Dayan 2003); Stärke unsicher.
  Allen: Ohren/Glieder/Rute relativ ↓ mit Kälte (Allen 1877; Serrat et al. 2008). Leser: planetOrt klima °C. Bild: Fuchs des
  Nordens größer, kurzohrig.
- O3 Insel-Regel: kleine Arten werden größer, große kleiner (Foster 1964, Lomolino 2005); Kipppunkt ~0,1–1 kg (unsicher).
- O4 Arten-Areal: S = c·A^z, z ≈ 0,25 Inseln, 0,12–0,17 Festland-Teilflächen (Preston 1962, Rosenzweig 1995).
- O5 Breiten-Gradient / Energie: ln S ∝ −E/(kT), E ≈ 0,65 eV (Allen, Brown & Gillooly 2002); Tropen ~10× Arten je Fläche
  (Größenordnung, unsicher). Leser: Klima-Temperatur des Planeten.

## (4) NAHT

stamm/koerper-leib.js:2545 `_creatureBodySize(idStr)` — heute: FNV-Hash(netId) → Band-Wahl → range (tetrapoda-core.js:253).
Das Gesetz müsste hier eintreten als: log M_Individuum = log M̄_Art(Stammbaum S3/S4, Klima O2) + Erbe E1 (Eltern statt netId)
+ N(0, CV E5); M ist die unabhängige Größe JEDES Körper-Gesetzes (K1–K10, O1). Leser des Rückgabewerts (bodySize):
kreatur-leben.js:149 (Spawn, vor hp), :1993 (Geburt im Bestand), kreatur-gehege.js:64, netz-p2p.js:1527 (Peer); weiter über
userData.bodySize: _leibMasse → Kampf :749, Temperament :636, Aas :845; Leine/Tempo-Memo kreatur-verhalten.js:542–560; 36
bodySize-Treffer in 8 stamm-Dateien. Die Art selbst (GATTUNGEN tetrapoda-core.js:62 → _ofenKreaturDials koerper-leib.js:1022 →
deriveTierParams :839) und der Baum (treeParams phyto-core.js:2446) gehen NICHT durch diese Naht — siehe OFFEN.

## (5) PREIS

- Tier-Art: EIN Ofen-Bake je Art (Template-Memo + Prefetch, koerper-leib.js:2472–2478); Kosten des Bakes: OFFEN (Kommentar nennt
  nur den Spieler-Leib: Rohguss 17–36 ms, Gelenk-Gestalt 13–24 ms headless, koerper-leib.js:2137).
- Tier-Individuum: Klon ~1 ms, Geometrie/Material geteilt (:2474); Größe = uniformer Skalar ⇒ kein Bake je Individuum.
  Ein Allometrie-Gesetz (K3: Glieder ∝ M^0,36 ≠ uniform) macht die Gestalt größenabhängig ⇒ Bake je Größen-Klasse oder
  Knochen-Skalierung je Glied (Kosten OFFEN).
- Pflanzen-Art: gestalten V (1–2) × Stufen (L0/L1/Karte) je Art, Nah-Streu „je Gestalt × Stufe × Stoff EINEN Befehl“
  (foundry-core.js:631–638) ⇒ Draw-Calls ∝ Arten × V × Stufen × Stoffe. Mit 10⁶ Arten unbezahlbar ohne Gesetz der Sichtbarkeit
  (am Schirm nur die Arten des Orts — O4 S = c·A^z liefert die Zahl je Sichtfläche).
- Planet-Plan „eifrig, ms, KB“ (planet-core.js:9). Tris je Baum, MB je Art, Takt-ms je Tier: nicht gelesen → OFFEN.

## (6) OFFEN / unsicher

- Ob der Wirt GANG_GESETZ.g durch die g des Planeten ersetzt (Kommentar tetrapoda-core.js:1407 sagt ja; Leser nicht gelesen).
- Alters-Uhr: wann `_creatureNaturalDeath(…,"alter")` feuert, nicht gelesen (kreatur-leben.js:1715 nur Kopf).
- computeCreatureStats/speed aus Tags (kreatur-leben.js:1388) — ob Masse das Tempo trägt: nicht gelesen.
- Der Pflanzen-Zwilling der Naht: treeParams-Wurf (phyto-core.js:2478) und forestTreeSize (:3105) — ein Erbe-Gesetz bräuchte dort
  dieselbe Eintrittsstelle; ob EINE Naht für Tier + Pflanze möglich ist (`_rollGenome` stamm/bau-teile.js:1479 trägt
  creature-size und tree-genome, aber NICHT die treeParams-Streuung), ungeklärt.
- Holzdichte/E je Art: Stoff-Zeile „holz“ in schmiede-core STOFF_GESETZ nicht gelesen.
- Unsicher markierte Konstanten oben: K4 M_max-Band, K6/K7 Konstanten, K8/K9 Ziffern, K10 Segler-Grenze, E4 Spanne, E5 CV/
  Dimorphismus, E6, S1 Raten, S3 je Klade, S4 Konstanten, S5, P1 Varianz-Split, P2 Exponenten, O1 Achsenabschnitt, O2 Stärke,
  O3 Kipppunkt, O5 Faktor.
- Karte 2 Leitern leben.* nicht gelesen (git show origin/koordination:vision/meisterkarte-2.json nicht geöffnet).
- Wasser-Arten (leben.wasser.*): kein Kern-Code gefunden/gelesen; Fische, Insekten, Vögel: kein Körper-Gesetz im Kern.
