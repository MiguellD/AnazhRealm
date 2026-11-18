# ENTSCHEID DES RICHTERS — das EINE Gesetz des Lichts

Stand: Arbeitsbaum `strahler-leuchte` 2ce8a033d, main = origin/main b7ed8419. Ich habe nur gelesen und gerechnet: keine GPU, kein
Browser, keine Änderung im Repo. Meine Rechnungen liegen in diesem Ordner:
- `richter-ton.cjs`: beide Farbton-Halte in derselben Metrik, dazu Schulter, Spanne und Sättigung unter der Schulter.
- `richter-auge.cjs`: Toleranz aus der 8-Bit-Stufe, Krawczyk gegen den Fahrplan von main, Reichweite.
- `richter-zaehle.cjs` → `richter-fallend.json`: das Urteil je Zeile der Tafel.

**Das Urteil in einem Satz.** Die Grundlage ist der Entwurf QUELLE: ein Maß (cd/m²), eine Brücke (Vorbelichtung) und der Farbton-Halt
in Oklab. Vom Entwurf AUGE nehme ich drei Stücke: die Knoten der Kompensation in Leuchtdichte samt offener Blende am Vollmond, die
Bild-Anker steigung und −2,17, und den Bau der Kappe als Eigenschaft (b). Drei Stücke fallen aus beiden Entwürfen:
- Krawczyk, aus QUELLE: er weicht von main um bis zu +0,83 EV ab, und nicht monoton.
- die kodierte Mischung, aus AUGE: sie hält nur den HSV-Farbton; in Oklab driftet sie bis 14,5°.
- die Strahler-Marke im Alpha, aus QUELLE: das Szenen-Ziel ist rg11b10 und hat kein Alpha.

---

## 0. Geprüft an der Quelle und nachgerechnet (worauf das Urteil steht)

| Behauptung | Wer | Befund |
|---|---|---|
| Neutral 0,76 · 0,15 · Fuß 0,08/6,25/0,04; Mischung zum Weiß **linear**, `mix(e, vec3(u), l)` | beide | **hält**: vendor/three.webgpu.min.js `mT`, wörtlich gelesen. Die Kurve sitzt in dirigent-ankunft.js:167, die Belichtung 1,0 in :168 (2ce8 und main gleich). |
| Feuer-Gras (2 000 K × ATMO_BODEN): hellster Kanal = 2,10 × Luma, die Schulter beginnt bei Luma 0,362 | Q | **hält**: 2,099 → 0,362 (`richter-ton.cjs`) |
| Unter der Schulter trägt Feuer-Gras S_HSV 1,000 | Q | **hält**: k·L 0,05/0,15/0,30 → 91/55/0 · 152/95/0 · 208/132/0, S 1,000 |
| Neutral trägt von 0,76 bis Code 1 genau 6,77 Stufen (v₁ = 0,00697) | Q | **hält**: 6,77; bis 0,866 sind es 6,96 (so rechnet AUGE) |
| Spanne 0,188 EV = log-Elastizität ½ bei P 0,866 | A | **hält rechnerisch**: Elastizität 0,500 bei 0,866, g = 0,0048. Die ½ ist aber **gewählt**. |
| Die kodierte Mischung hält den Ton der leuchtenden Flächen | A | **hält nur in HSV** (≤ 2,0°). In Oklab driftet sie bis **14,5°** (Riss 1 650 K bei k·L 16), Neutral bis 16,1°. Das ist kaum besser als Neutral. |
| Der Oklab-Halt hält den Farbton | Q | **hält**: 0,0° in Oklab, durch die Konstruktion. In HSV bleiben ≤ 8,6°; HSV ist aber keine Wahrnehmungs-Metrik. |
| Krawczyk gibt in der Vollmond-Nacht −2,55 EV statt des Bild-Ankers −2,17 | Q | **hält**: −2,55. Dazu gerechnet: bei Sonne 10° −0,15 EV (main −0,87), bei 0° −0,47 (main −1,30), bei −6° −2,25 (main −1,56). Das sind Abweichungen von **+0,72 · +0,83 · −0,68 EV**, also nicht monoton. |
| Die Strahler-Marke steht im Alpha des Szenen-Ziels, „0 Byte mehr“ | Q | **fällt**: das Ziel ist rg11b10ufloat ohne Alpha (bild-kosten.js:2014-2019 auf 2ce8, :1989-2003 auf main). rgba16float bleibt es nur ohne das Geräte-Feature. |
| Mondlicht ≈ 4 100 K, E☾ im Zenit | beide | QUELLE nimmt 0,3965 lx (spec/farbe/tag-ref.json, USNO 171 / Brown 1952, Zeile −90°: 0,397), AUGE nimmt 0,27. **Ich nehme 0,3965**, weil das die zitierte Quelle im Baum ist. |
| BRENNER, STRAHLER, kopfSicht, leuchte(), augeGlut/Zeig/Lux, `_leuchtReichweite`, `_beckenAmAuge`, `_strahler`, `lichtAuge`, GLUT_LUMA, `leuchtdichte()`, AUGE | — | **auf main nicht vorhanden** (`git grep` auf origin/main: 0 Treffer). main fährt LICHT_GESETZ mit `staerke × zeit` (feuer nacht 45 · laterne staerke 19, fachwerk-core.js:6431-6435), `_lichtZeitplan` (dirigent-kern.js:1882) und `_laborLichtStaerke` (:1875). |

---

## 1. DAS GESETZ

### Die Kette (echte Einheiten)

| Schritt | Formel | Einheit | Signatur (Ort auf main) |
|---|---|---|---|
| **Quelle: Wärmestrahler** (Flamme, Glutbett, Brand, Lava, Stahl, Funke) | L = ε · 683 · ∫B_λ(T) ȳ dλ. Die Farbe ist Planck → XYZ → lineares sRGB auf Luma 1; außerhalb des Gamuts wird **Weiß gleicher Luma zugemischt**, nicht geklemmt. I = L · A. | cd/m² · cd | `quelle(datum)` → {farbe, L, I, A, kern, kopf, drehY}; `planckFarbe(T)` ersetzt `lichtFarbe` (fachwerk-core.js:6464 main); `leuchtdichte(T)` als Muster aus 2ce8 FC:6532 |
| **Quelle: Lampe** (Brenner, Fenster, Tor, Fahrzeug, Augen-Licht) | I(ω) = I₀ · kopfSicht(kopf, drehY, ω); L_Glas = I₀ / A_Glas | cd · cd/m² | Muster `BRENNER` / `brennerVon(jahr)` / `leuchte(id, brenner)` / `kopfSicht` aus 2ce8 FC:6431-6447, :7621-7653; `BRENNER[*].kelvin` neu |
| **Quelle: Himmelskörper** | E⊥☉ = 133 800 lx über der Luft, 5 772 K; E⊥☾ = 0,3965 lx im Zenit (Vollmond), 4 100 K; L_Scheibe = E⊥/Ω | lx · cd/m² | Daten in foundry-core.js (`nacht`, :312) |
| **Quelle: Himmel** | L_Himmel(ω) = E⊥☉ · LUT_Hillaire(ω), nachts E⊥☾ · LUT + Nachthimmel 0,0005 lx / π | cd/m² | die bestehenden Tafeln, nur die Einheit des Faktors ändert sich |
| **Weg** | E(p) = I(ω) · cos θ / (d² + k²) · e^(−β d) · V(p); die Scheibe (Lava) als geschlossener Sichtfaktor · L | lx | `_lichtPlatz` (stoff-material.js:2335 main). Dieselbe Formel auf der CPU (`lichtAbfall` + `kopfSicht`) für Rang, Reichweite und Wurf |
| **Stoff** | L_aus = (ρ/π + f_GGX) · E; ein Strahler addiert sein L | cd/m² | `_punktLichtBrdf`, unverändert |
| **DIE BRÜCKE** (die eine) | **x = L · k**. Jede Quelle verlässt die CPU als Datum × k durch EINE Funktion `insBild(w) = w · k`: Richtlicht E·k, Pool I·k, Glut L·k, Himmels-Faktor E⊥·k. `toneMappingExposure` steht fest auf 1. Keine zweite Skala, kein KEY_BASE, kein LEGACY_LICHT, kein Zeitplan. | — | EIN Schreiber `_augeTakt` (ersetzt `_belichtungAusLicht` bild-himmel.js:1943 main) |
| **DAS AUGE** (das eine) | siehe unten | m²/cd | `_augeTakt()` |
| **Nacht-Auge** | m = clamp(ln(L/0,005) / ln 1000) je Pixel, mit L = x/k in cd/m² (CIE 191). Das Stäbchen-Grau trägt den Stäbchen-Farbort. | — | `_nachtAuge` (bild-kosten.js:2179 main) ohne `luxJeEinheit`, `bildZapfen`, `staebchenStaerke` |
| **Tonkurve** | Khronos-Schulter (0,76 / 0,15 / Fuß) für Helligkeit und Buntheit; der **Farbton bleibt der Oklab-Farbton der Eingangsfarbe**. Ein C außerhalb des Gamuts wird in 4 festen Bisektions-Schritten gesenkt. | linear | `schirm(x)` im Ausgabe-Knoten (`pp.outputNode`, bild-kosten.js:2483 main); `renderer.toneMapping = NoToneMapping` (dirigent-ankunft.js:167) |
| **Schirm** | sRGB-OETF, 8 Bit | Code | — |

### Das EINE Auge (der Zustand je Sicht)

1. **Zustand.** L_a = exp(Mittel ln(L + 10⁻⁶)) über das letzte Bild. Gelesen wird ein Histogramm auf ⅛-Auflösung (240 × 135),
   L = x / k_alt, ein Bild Verzug, ohne gewählte Perzentile (log-Mittel nach Reinhard 2002).
2. **Schlüssel.** Ich nehme die Knoten von AUGE, aber in Leuchtdichte und mit dem κ von QUELLE:
   - c(L_K) = 0,25 · log2(L_K / 6 713) für L_K ≥ L₁₀ = 634,8 cd/m².
   - zwischen L₁₀ und L☾ = 0,18 · 0,3965 / π = 0,0227 cd/m² linear in log2 L zu −2,17.
   - darunter bleibt c bei −2,17.

   Dabei ist L_K = κ · L_a, und κ = L_Karte / L_a an der Mess-Wiese am Mittag FOLGT (QUELLE rechnet 1,743).
   Der Schlüssel ist dann k_a = 0,22 · 2^c / max(L_K, L☾).
3. **Kappe (b).** k_c = 0,76 / L_diff,max. L_diff,max ist der hellste Kanal von p98 über die **diffusen** Proben des Histogramms.
   - Diffus ist eine Probe, wenn L ≤ ρ_max/π · E_Gesetz(p).
   - p wird aus der Tiefe rekonstruiert.
   - E_Gesetz ist dieselbe Weg-Funktion über die ≤ 4 Plätze + Sonne/Mond/Himmel, ohne Schatten, also eine obere Schranke.
   - ρ_max kommt aus `spec/farbe/albedo-tafel.json`.
4. **k = min(k_a, k_c)**, zeitlich τ ins Helle 0,3 s, ins Dunkle 0,8 s (RAUM.blendeHellS/blendeS, die eine Zeitkonstante). Unter L☾
   bleibt k_a bei k_a(L☾): die offene Blende (main w28-nacht-licht). Darunter fällt das Bild mit dem Licht.

**Warum nicht Krawczyk:** Er ist ein belegtes Modell. Unter Neutral mit Fuß-Umkehr rechnet er aber gegen main +0,72 EV bei Sonne
10°, +0,83 EV bei 0° und −0,68 EV bei −6°. Die Abweichung ist nicht monoton und kippt am Knie von log10(L+1). Am Abend wäre das Bild
sichtbar heller als heute, und dafür gibt es keinen Beleg. Die zwei Bild-Anker stehen dagegen auf gemessenen Bildern der Welt
(Radeon, w28-nacht-licht). Sie bleiben, mit der Marke **gewählt**, und werden **kein Tor**.

---

## 2. DIE DATEN, die übrig bleiben — und die ZAHL

| Gruppe | Datum | Zahl | Anker | Marke |
|---|---|---|---|---|
| Sonne | E⊥, T, Winkel | 133 800 lx · 5 772 K · 0,53° | Darula/Kittler/Gueymard 2005 · IAU 2015 · N26 | belegt |
| Mond | E⊥ Zenit, T | 0,3965 lx · 4 100 K | tag-ref.json (USNO 171, Brown 1952) · Jensen et al. 2001 | belegt |
| Nachthimmel | E_h | 0,0005 lx | tag-ref.json | belegt |
| Luft | S13–S24, S31 (Rayleigh, Mie, Ozon, β, Koschmieder) | wie heute | Bruneton/Hillaire, AERONET | belegt (S19, S21, S24 ohne Zitat) |
| Herd | T, I, Höhe, L_Flamme | 2 000 K · 249 cd · 0,35 m · 10 000 cd/m² (A = I/L folgt) | Holzfeuer 1 800–2 000 K; Kerzenflamme ≈ 1 sb | I belegt (Größenordnung), T unsicher |
| Glutbett | T | 1 100 K | Holzkohle 900–1 200 K | unsicher |
| Lava | T, ε | 1 650 → 798 K · 0,95 | Q21/Q23, Basalt-Schmelze | belegt |
| Esse/Stahl/Funke | T, ε | 1 573 K · 0,8 | Q26 | ε unsicher |
| Brenner | I je Brenner, Jahr, flammeM, **kelvin** | 1 · 10 · 16 · 100 · 110 cd; 1 850 · 1 950 · 2 000 · 2 700 · 2 856 K | BRENNER (Muster), Kerze, CIE A | cd belegt; K: Docht und Glühlampe belegt, Argand/Gas/Glühstrumpf unsicher |
| Kopf | AUS_MASS, KOPF_BODEN (L17) | 9 Felder | Bau-Maß | gewählt (Form) |
| Fenster | Stube d, ρ (L folgt aus dem Brenner des Hauses) | 2 m · 0,5 · τ 0,8 | — | gewählt |
| Tor | I, Farbort | 15 cd · 0xffd9a0 | Absicht | gewählt |
| Fahrzeug | I je Leuchte | Tagfahr 400–1 200 · Rücklicht 4–12 · Brems 60–185 cd | ECE R87, R7 | belegt |
| Augen-Licht | T, I | 4 750 K (R7) | — | gewählt |
| Stoff | ρ je Kanal, Rauheit, Metall | albedo-tafel.json, ATMO_BODEN, MERL | E16, S28, E12 | belegt |
| Auge | MESOPISCH 0,005/5 cd/m² · V′ | — | CIE 191, A8, A12 | belegt |
| Auge | τ 0,3/0,8 s | — | R1 | gewählt (Bild) |
| Auge | steigung 0,75 · Knoten −2,17 EV | — | A19, A21 (Bild-Anker) | **gewählt, kein Tor** |
| Auge | Stäbchen-Farbort (Blau der Nacht) | — | Jensen et al. 2001 (Blauverschiebung) | unsicher |
| Kurve | Khronos 0,76 · 0,15 · 0,08/6,25/0,04; Oklab (Ottosson 2020); sRGB | — | A14–A16 | belegt |
| Absicht | Gefühls- und Aura-Tönung S10, N20, N33 | 27 Felder | Absicht | **verlassen die Licht-Kette**; sie werden EINE Farbkorrektur nach der Kurve im Knoten `graded` (Bahn A) |

**DIE ZAHL** (`richter-zaehle.cjs`; Grundlage ist das Zeilen-Urteil von QUELLE mit sechs Abweichungen des Richters: S10, N20 und N33
als Absicht, L24 unberührt, A19 und A21 bleiben, A27 folgt):

- **Gemeldet 571 → bereinigt 583 Felder.** Davon liegen 407 in der Licht-Kette, 176 sind Technik, Kosmetik oder Studios.
- **Gesetzt in der Kette: 338 Felder** (GA 66 · GB 20 · G0 252). Davon:
  - **103 FALLEN**, weil sie aus der Kette folgen oder ein Zwilling sind: G0 81, GB 13, GA 9.
  - **115 bleiben Datum.** GA 57 sind belegt. G0 53 und GB 5 bleiben gesetzt, und zwar aus drei Gründen:
    - Form und Bau (Kopf-Maße, Höhen, Fenster der Stube).
    - Welt-Dynamik (Wetter-Zeilen, Flacker, Sonnenbahn, Vollmond).
    - die zwei Bild-Anker des Auges.

    Keine dieser Zahlen ist ein Tor.
  - **27 bleiben Absicht** (die Farbkorrektur nach der Kurve).
  - **93 sind unberührt**: Look und Form innerhalb der Kette, also Wolken-Look, Stoff-Looks und Membran-Look.
- Dazu fallen **11 bisher FOLGENDE** Felder (ihre Quelle fällt) und **15 der 17 Felder ohne Leser**.
- **Fällt insgesamt: 129 von 407 Feldern der Kette (31,7 %).** Datum danach: 118 + 14 neue (Sonne E⊥ und T, Mond T, Glutbett T,
  5 × Kelvin, Stube d und ρ, Stäbchen-Farbort, Tapetum des Tier-Auges, Nachthimmel-Farbort) = **132**.

Gruppen (fällt/Datum): Sonne/Luft 16/30 · Nacht/Mond 27/7 · Auge/Kurve 19/11 · Raum 7/4 · Strahler 15/17 · Leuchten 14/32 ·
Emission/Stoff 30/17 · Verdeckung 1/0.

---

## 3. WAS FÄLLT (datei:zeile auf 2ce8 → Stand auf main)

„nur Zweig“ heißt: auf origin/main gibt es das Symbol nicht (`git grep`, 0 Treffer). Die Bau-Welle schneidet auf main neu, die alten
Runden werden nicht gemergt. BRENNER, brennerVon, leuchte und kopfSicht gehen als **Muster** ein, nicht als Merge.

**Die zweite Skala und das alte Auge**

| Was | 2ce8 | main |
|---|---|---|
| KEY_BASE · LEGACY_LICHT | WL:49, :53 | WL:49, :53 |
| AUGE p/q/anteil/welt/lux/eps/saum, zustandMinLux, augeS/Lux/Mass/Zeig/Glut/Reichweite/Messer | WL:84-148 | nur Zweig |
| `lichtAuge`, `_beckenAmAuge`, Ersatz `?? 1` | DK:1609, :1799, :1621-1629, :1849; BS:503; BH:2071 | `lichtAuge`/`_beckenAmAuge` nur Zweig; den Ersatz an den main-Orten neu greppen |
| MOND_STAERKE · MOND_E als Welt-Einheit · nachtKnotenE · nachtKnotenGrad | WL:169, :172, :180-181 | WL:74, :77, BELICHTUNG :78ff |
| BELICHTUNG min · gleitung (die Sonnenhöhe als Fahrplan); `belichtungStufen(h, q)` · `belichtung()` | WL:173-183, :743, :769 | WL:78ff, :648, :674 |
| NACHT_AUGE luxJeEinheit · bildZapfen · staebchenStaerke · umkehrSchritte | BK:3011-3017 | BK:2981ff (Leser :2186, :2200) |
| tagAchse als Lichtschalter (nacht/tag/hell/daemmerung), GRENZGROESSE als Tafel, DAEMMER_ENDE | WL:823-854, :187-196, :236 | WL:728ff, :92, :141 |
| `_belichtungAusLicht`, `_waagrechtIrradianz` als Messer, Raum-Deckel (g ≤ 2, Ziel ≥ −8,68) | BH:1945, :2186, :1987/2003/2018 | BH:1943, :2171, `_raumBlendeTakt` :1968 |
| Start-Belichtung 1,0 als Eichung · `renderer.toneMapping = Neutral` | DA:167-168 | DA:167-168 |

**Die Ersatz-Lichter der Nacht**

| Was | 2ce8 | main |
|---|---|---|
| Ambient 0,04·nacht · Ambient-Gefühl (wird Farbkorrektur) | BH:2251-2252 | BH:2232 |
| Hemi 0,1·nacht · Hemi-Boden · Aura des Hemi-Bodens (wird Farbkorrektur) | BH:2470-2492 | BH:2473 |
| Boot-Saat Ambient/Hemi | DA:356, :455 | DA:356, :455 |
| STERNENLICHT.daemmer | WL:226 | WL:123ff |
| nacht.mond 0x9fb8dc · skala · lum · himmel-Ton | FO:312 | FO:312 |
| sonneLeucht 4 · mondGegenHimmel · sternKontrast · Mondscheibe 9 m | BH:3343-3355; DA:339-347 | BH:3338-3344; DA:339-347 |
| Wasser `max(0,22, dl.intensity)` | BH:2566 | BH:2547 |
| INNEN_DAEMMER | FC:2771 | FC:2767 |
| AUGEN_LICHT karteM/abfall/kernM/reichweite (wird `quelle` mit I) · ÷π (BH:2092) ↔ ×π (DK:2012) | BH:3284-3288 | BH:3273ff; `_laborLichtStaerke` DK:1875 |

**Wetter als Licht-Stellwert:** WX_LICHT (PH:4302, beide Stände), WEATHER_GREY_K (daten.js:129/130), rayleighTiefe „ferne“
(daten.js:91), Tönungs-Nenner (FO:115) und Klammer (BH:1755), die DSL-Stärke-Rampe (feld-dsl.js:996-1009). Die Farbe des Satzes
bleibt als Datum der Luft.

**Zwillinge der Quellen**

| Was | 2ce8 | main |
|---|---|---|
| LICHT_GESETZ feuer abfall/kernM, laterne kelvin/cdM2/abfall/kernM, fenster kelvin/cdM2, wandlaterne kernM/candela/cdM2 | FC:6455-6482 | FC:6431-6459, dazu **nur main**: `staerke`, `zeit` (feuer nacht 45 · mittag 1,6 · abend 2,2), `reichweiteM` und `_lichtZeitplan` (DK:1882). Sie fallen auf main; die Tafel zählte sie nicht, weil der Zweig sie schon ersetzt hatte. |
| `lichtFarbe` (Klemme 1 667 K) → `planckFarbe` | FC:6487 | FC:6464 |
| STRAHLER.abfall · emissiv.flamme | FC:6510-6527 | nur Zweig |
| GLUT_LUMA · gemalte Glut-Töne · FLAMME.ton · M.feuer | FC:2099/2107, :7111, :7155, :11336, :2073 | GLUT_LUMA nur Zweig; die Töne am main-Ort neu greppen |
| Uniform je Schlüssel `lichtGlut[k]` | DK:1626-1631 | DK:1607-1608, × `_lichtZeitplan`. Daraus wird `aGlut` je Instanz = L·k. |
| `lavaGlut` als S-Form | DK:1622 | DK (7 Treffer) |
| BRAND ziel 1,6 · T⁴ · licht/schein · zweite Flammen-Temperatur | FB:850, :964, :994-997 | FB:944 (`ziel`), :846 |
| FUNKEN leucht | kampf.js:2684 | dito |
| Tor i0/iOpen/pulse/dist/decay | PC:1720-1729 | PC:1720ff |
| Porta-Rahmen | PC:1331 | dito |
| Membran F0 0,04 → 0,020 (folgt aus n 1,33) | PC:1658ff | dito |
| Fahrzeug `ei` (6 Felder) → cd | VC:340 | VC:340 |
| Glimmen aus Tags | SM:787-900 | am main-Ort neu greppen |
| Studio-Emissiv | SS:344-347, PH:5968 | dito |
| Tier-Augen-Glut | tetrapoda-core.js:3692 | dito |
| environmentIntensity | — | dito |
| `kernAnteil` | BS:394/1701 | BS:394 |
| `_leuchtReichweite` (isotrop, Deckel 48 m) → `reichweite(I, k)` | DK:1687/1846 | nur Zweig; main: `reichweiteM` des Datums |

---

## 4. DER PREIS

Alles ist geschätzt, nichts davon am Gerät gemessen. Die Zahl richtet die Bau-Welle an der GTX 1050.
- **Stoff:** Je Platz kommt ein `exp(−βd)` dazu. Der Zeitplan fällt auf der CPU. Ein neuer Uniform entsteht nicht, weil k in den
  Quell-Uniforms reist. `aGlut` je Instanz liegt schon als Ecken-Kanal vor.
- **Kurve:** Der Oklab-Halt im Ausgabe-Knoten kostet je Pixel zwei Oklab-Wandlungen und 4 Bisektions-Schritte, etwa 40 ALU ×
  2,07 Mpx. Geschätzt sind das ≈ 0,05 ms. Vendor-Neutral fällt, dafür kommt kein Durchgang dazu.
- **Auge:**
  - +2 Rechen-Programme: Histogramm mit Diffus-Probe auf 32 400 Proben ≤ 4 Plätze, dazu die Reduktion. Geschätzt 0,05–0,1 ms.
  - +1 mapAsync je Bild, ein bis drei Bilder Verzug.
  - Auf der CPU fallen Lichtmesser, Fahrplan und Raum-Deckel weg.
- **Programme:** Neu sind nur die 2 Rechen-Programme. Der Text der Boden- und Wand-Programme ändert sich, deshalb wird alles einmal
  kalt neu übersetzt. Das berührt Pflicht-OFFEN B; die Zahl misst die Bahn W kalt vorher↔nachher.
- **VRAM:** Neu sind nur Histogramm-Puffer (< 1 kB). rg11b10 bleibt; der Rückweg auf rgba16float (+7,9 MB, Pflicht-OFFEN E) ist
  ausgeschlossen.
- **Zahlbereich:** Die Vorbelichtung hält x um 0,22. Die Sonnenscheibe am Mittag liegt bei ≈ 6,1·10⁴ < 65 024 (rg11b10 max). Das ist
  knapp und ungerechnet für 90°. Bahn A misst es.
- **Bild für den Spieler:** am Mittag wie main.
  - Abends: wie main ± 0,12 EV.
  - Vollmond: die Wände stehen grau-blau im Stäbchen-Ton, das Mondlicht ist warm.
  - Am Feuer läuft ein Verlauf über 8 Stufen bis ins Schwarz der fernen Wiese.
  - Lava und Glut bleiben orange bis ins Weiß, ohne Rosa.

---

## 5. DIE BAHNEN

**Reihenfolge:** SPIKE ∥ Bahn L. Danach laufen Q, W und A parallel. Die API von Q (Signaturen aus §1) steht am ersten Tag fest; W und
A bauen gegen sie. Q, W und A landen als **EINE Integration**: kein Zwischenstand auf main, weil eine halbe Kette zwei Maße wäre.
Erst danach wird Bahn L grün, im echten Spiel auf derselben Bühne.

| Bahn | Dateien (exklusiv, main) | Inhalt |
|---|---|---|
| **L — Linse** | scripts/diag-pruefbuehne.cjs, scripts/lib/licht-linsen.cjs | Familie `gate:pruefbuehne-licht`. Die Fälle (a) ORDNUNG, (b) SCHULTER, (c) FARBTON-OKLAB, (d) ZUSTAND-JE-SICHT, MITTAG-KARTE und QUELLE-EIN-DATUM (statisch: jede Glut-Leuchtdichte im Bild = I/A desselben Datums). Der Fall S0_TON-Sättigung 0,75 (diag-pruefbuehne.cjs:955-962) fällt. Die Fälle sind zuerst ROT auf main. Der Selbsttest feuert mit drei Mutanten: Vendor-Neutral zurück → (c) rot an lava-nah; Kappe aus → (b) rot an herd-nah; k aus der Sonnenhöhe → (d) rot. |
| **Q — Quelle** (Kerne additiv + Abdruck) | fachwerk-core.js, foundry-core.js, porta-core.js, vehicle-core.js, tetrapoda-core.js, kampf.js, worlds/fachwerk/fachwerk.js | `quelle()`, `planckFarbe`, `leuchtdichte`, BRENNER + kelvin, brennerVon, leuchte, kopfSicht im Rechteck mit drehY, Fenster aus der Stube, Mond 4 100 K / E⊥ 0,3965, Tor und Fahrzeug in cd, Membran-F0 0,020. Das Labor liest dasselbe Gesetz. |
| **W — Weg + Brücke** | stamm/dirigent-kern.js (1 984), stamm/stoff-material.js (3 865: Rest 135 Zeilen, netto ≤ 0 verlangt), stamm/bild-schatten.js, stamm/feld-brand.js, stamm/siedlung-wege.js, stamm/siedlung-tor.js, stamm/studio-stoff.js | `insBild` an jedem Quell-Schreiber. `aGlut` je Instanz = L·k. Lava L·k. Die Brand-Flamme in der Temperatur des Herds. `e^(−βd)` in `_lichtPlatz`. `reichweite(I, k) = √(k·I·ρ_max/(π·v₁))`, v₁ 0,00697. Rang, Wurf und Reichweite über dieselbe I(ω). drehY im Pool-Eintrag. Zeitplan und Labor-Stärke fallen. |
| **A — Auge + Kurve + Himmel** | welt-licht.js, stamm/bild-himmel.js (3 417), stamm/bild-kosten.js (3 111), stamm/dirigent-ankunft.js, stamm/stoff-dach.js, stamm/feld-dsl.js, stamm/daten.js, phyto-core.js, stamm/werkstatt-vorschau.js | `_augeTakt` (Histogramm, Diffus-Probe, Schlüssel, Kappe, τ). `schirm` im Ausgabe-Knoten mit NoToneMapping; die zweite Ausgabe der Werkstatt läuft über dieselbe `schirm`. Das Nacht-Auge in cd/m². Sonne, Mond und Himmel über `insBild`. Ersatz-Lichter, Wetter-Stellwerte und tagAchse-Schalter fallen. Die Gefühls-Tönung wird EINE Farbkorrektur in `graded`. |

**DAS ZIELBILD je Bahn.** Geurteilt wird am Integrations-Kopf, mit den Kameras des Vor-Spikes und der Runden. Marken stehen in
Klammern.

| Bahn | Ort · Kamera | (a) Ordnung | (b) Schulter | (c) Farbton | (d) Zustand | Linse |
|---|---|---|---|---|---|---|
| Q | **gasse-nacht**, Ego in der Gasse von 1320, Wandlaterne in 6–8 m | Kopf-Glas > Wand unter der Laterne > Mondwand > Wand im Mondschatten | Kopf-Glas darf in die Schulter, er ist ein Strahler | Kopf = Oklab-h von Planck(1 850 K) ± Δh_tol; Glühstrumpf (Dorf 1900) = Planck(2 700 K) | — | QUELLE-EIN-DATUM, (a), (c) |
| W | **herd-nah** (Ego, 3 m, Blick über das Bett) · **herd-fern** (25 m) | Gras 0,75 > 1,25 > 1,75 > 2,5 > 4 m > Wiese 14 m, über alle Flecke monoton (die Luma-Werte 149/105/78/53/29 sind unsicher, Geometrie gewählt) | — | Bett = Planck(1 100 K) | — | (a) |
| W | **lava-nah** (3 m am Ufer) | Ufer 0,5 m > Ufer 15 m > Baumlinie; Riss > Decke > Saum | — | — | — | (a) |
| A | **Mittag**, Mess-Wiese, Sonne 74,2° | — | — | — | Karte sRGB 118 gegen main im Rauschen (belegt: Lehre 21, zielKarte FOLGT) | MITTAG-KARTE |
| A | **herd-nah / herd-fern** | — | hellster diffuser Kanal ≤ 0,76 + Fuß-Versatz (Spanne 0, hergeleitet) | Gras im Oklab-h von Feuer × ATMO_BODEN ± Δh_tol | k_nah ≠ k_fern; QUELLE rechnet 0,0411 gegen 0,261 (unsicher) | (b), (c), (d) |
| A | **lava-nah** | — | Saum ≤ 0,76 | Saum, Decke und Riss im Oklab-h ihrer T ± Δh_tol; Neutral bricht dort mit 9–16° | Kappe bindet | (b), (c) |
| A | **wiese / Vollmond** (ohne Quelle, Mond im Zenit) | — | — | Erwartung = mesopische Mischung mit dem Stäbchen-Farbort (unsicher) | k = offene Blende k_a(L☾) | (c), (d) |
| A | **gasse-nacht** | — | — | Mondwand nicht H 283° blau-schwarz (Runde 4); die Erwartung ist mesopisch | Zustand aus der Sicht, Gasse ≠ Herd | (d) |

**Δh_tol ist hergeleitet und nicht gewählt.** Es ist die größte Oklab-Farbton-Änderung bei ±1 Code je Kanal am erwarteten Pixel
(8-Bit-Stufe des Schirms). Satt-orange liegt sie bei 1,0–2,5°, blass bei 1,6–2,6°. Nahe Weiß (12,7°) und im Dunkel (11–36°) wird sie
von selbst groß; dort sagt (c) nichts aus. Unsicher ist, was Bloom und TRAA zusätzlich am Farbton tun.

**Die 0,75 des Tors `gate:pruefbuehne-licht` FÄLLT.** Herleitung:
- Unter der Schulter trägt Feuer × Gras S_HSV 1,000 (k·L 0,05/0,15/0,30).
- Eine weiße Karte trägt im Band Luma 90–150 eine Sättigung von 0,89–1,00 (vor-spike-pruefung.md).
- S ≤ 0,75 gibt es nur in der Schulter (Peak ≥ 0,76) oder durch mitleuchtende Umgebung.

Das Tor verlangt also genau das, was (b) verbietet. An seine Stelle treten (c) im Oklab-Farbton und (b).

**Die Schulter der Tonkurve, wo sie (c) bricht:** Ihre lineare Mischung zum Weiß dreht den Oklab-Farbton um bis zu 16,1°: Riss,
Herd und Gras bei k·L 16, Glut 1 100 K schon bei k·L 1 um 9,7°. Das ist das Rosa. Was daraus folgt:
- Die Zahlen der Schulter bleiben: Beginn 0,76, Entsättigung 0,15, Fuß.
- Ihre Mischrichtung fällt. Der Farbton kommt aus der Eingangsfarbe in Oklab, Helligkeit und Buntheit aus Khronos.
- Der Vendor-Aufruf fällt (NoToneMapping), und die EINE Kurve lebt im Ausgabe-Knoten.
- Die kodierte Mischung des Entwurfs AUGE fällt mit Zahl: Oklab bis 14,5°.

---

## 6. OFFEN-REGEL (die drei alten Punkte)

| Punkt | Bahn | Wie er fällt |
|---|---|---|
| Kopf-Glut und Kelvin je Brenner | **Q** (W liest) | BRENNER[*].kelvin, fünf Daten. Kopf-Glas L = I/A_Glas aus derselben `leuchte()`. W schreibt es je Instanz als L·k (`aGlut`). Das Uniform je Schlüssel fällt (main DK:1607-1608), mit ihm Zeitplan, L8, L16 und L20. |
| Kopf als Inkreis | **Q** (W trägt drehY) | `kopfSicht` rechnet im Rahmen des Kopfs über das Rechteck: in der Diagonale frei bis 29,5° statt 38,7°. `leuchte()` gibt drehY; `lichtLeib` nimmt die Haube (0,20 m). |
| `_lichtWurfTakt` kennt den Kopf nicht | **W** | Die Wichtigkeit ist k·ρ/π·I·kopfSicht/(d² + k²) am Bezug, gegen v₁. Rang, Reichweite und Wurf lesen dieselbe I(ω) wie der Stoff (bild-schatten.js:474 main). |
| In-Streuung der Quellen im Dunst | — | **FINAL gestrichen** für dieses Gesetz. Grund (QUELLE, grob gerechnet, unsicher): bei klarer Luft ≤ 10⁻³ cd/m² neben 10⁻² cd/m² Mondwiese, unter Code 1. Die Extinktion e^(−βd) ist verdrahtet (W). |
| Schatten der drei Plätze ohne Würfel | — | Gehört nicht zum Auftrag „Gesetz des Lichts“; die Tafel führt ihn unter §3.5. Er steht in keiner Bahn und nicht als neuer OFFEN-Punkt dieser Welle. Ich benenne ihn, ich setze ihn nicht. |

Kein Punkt steht zweimal: Jeder alte Punkt hat genau eine besitzende Bahn.

---

## 7. DIE SCHWÄCHSTE STELLE — der Auftrag an den Spike

**Die Kappe (b) braucht die hellste DIFFUSE Leuchtdichte der Sicht, und das Bild trägt keinen Kanal, der diffus von leuchtend
trennt.** Das Szenen-Ziel ist rg11b10ufloat ohne Alpha (bild-kosten.js:1989-2003 main). Die „Strahler-Marke im Alpha“ des Entwurfs
QUELLE existiert also nicht. Ohne Trennung landet p98 an der Lava in den Rissen (32 400 cd/m²), und das Ufer wird schwarz. Mit zu
weicher Trennung rutscht das Gras am Herd in die Schulter. Das sind genau die zwei Orte, an denen die Runden 3 und 4 rot wurden.

Gesetzt ist die **Diffus-Probe im Histogramm-Durchgang**: p aus der Tiefe, E_Gesetz(p) aus derselben Weg-Funktion (≤ 4 Plätze +
Sonne/Mond/Himmel, ohne Schatten), diffus ⇔ L ≤ ρ_max/π·E_Gesetz(p).

**Spike:** rein gerechnet und danach EIN GPU-Paar (main ↔ Spike-Kopf), an **lava-nah** und **herd-nah**. Gemessen wird
log2(p98_Probe / L_diff,wahr). L_diff,wahr ist der hellste diffuse Fleck aus Stoff × Licht: Ufer-Saum bzw. Gras 0,75 m. Zu zeigen
ist dabei:
- Riss und Decke werden ausgeschlossen.
- Das Glutbett (≈ 20 cd/m² unter einer Schranke von ≈ 148 cd/m²) verschiebt p98 nicht über 2 % Fläche.

**Rot**, wenn |Δ| > 0,5 EV an einem der beiden Orte. Dann geht der Befund mit Zahl an den Richter zurück. Einen stillen Rückweg auf
rgba16float gibt es nicht (+7,9 MB, Pflicht-OFFEN E).

**Nicht gelesen, nicht gerechnet (benannt):**
- die Luft-Stelle der Post-Kette und Bloom unter der Vorbelichtung;
- ob r184-TSL atomare Histogramme und `getArrayBufferAsync` trägt;
- die Tafeln von Hillaire in absoluten Einheiten (ob 133 800 lx × Durchlass die REF 117 168 lx trifft);
- die main-Zeilen von Glimmen, Glut-Tönen und `?? 1`, die ich nicht einzeln gegrept habe;
- die Geometrie der Sichten, die in beiden Entwürfen gewählt ist;
- jede Zahl am Gerät.

---

## 8. NACH DEM SPIKE — was hält, was am Gesetz geändert ist, was der erste Punkt der Bau-Welle ist

Geschrieben vom Kopf des Kapitels LICHT (GTX 1050) nach `spike.md`, `widerleger-rechnung.md` und `widerleger-annahmen.md`. An der
Quelle selbst gelesen habe ich: Szenen-Ziel rg11b10ufloat ohne Alpha (stamm/bild-kosten.js:2017-2049), `LAVA_KRUSTE.platte` 0,62
(stamm/siedlung-wege.js:3048), `LICHT_GESETZ.feuer.cdM2` 10 000 „Mittel über das Bett" neben `STRAHLER.emissiv.flamme` 0,0012
(fachwerk-core.js:6527-6529), und auf origin/main BRENNER · kopfSicht · augeZeig je 0 Treffer, `_lichtZeitplan` 5. Selbst gerechnet:
`vor-spike-pruefung.cjs`. Alles andere in diesem Abschnitt steht auf den Rechnungen der Arbeiter.

**Das Urteil.** Der Spike sagt „ein Gesetz hält nicht alles zugleich"; die Widerleger halten das Ergebnis und widerlegen die
Begründung. Kern und Form des Gesetzes stehen (ein Maß cd/m², eine Brücke, ein Zustand je Sicht aus der Leuchtdichte, die Kappe als
Eigenschaft (b), der Farbton-Halt in Oklab; das Tor 0,75 fällt). Fünf Stücke aus §1–§7 gelten so NICHT mehr:

| # | Stand in §1–§7 | Befund | Was jetzt gilt |
|---|---|---|---|
| 1 | Kappe am **p98** der diffusen Proben | p98 ist ein gewähltes Perzentil und sieht den Feuerkreis aus der Ferne nicht (0,11–0,32 % des Bilds): herd-fern Gras +4,55 EV über der Schulter, crèmeweiß (R1, von beiden Widerlegern gehalten) | Die Kappe liest das **Maximum** der diffusen Proben. p98 fällt. |
| 2 | Diffus-Probe aus dem Bild (L ≤ ρ_max/π·E_Gesetz) | sie lässt das Glutbett als „diffus" durch; ab 1,4 % Bild-Anteil kippt k um −2,2 EV (R2; in 2–2,5 m trägt das Bett 1,9–2,9 %) | Diffus/leuchtend entscheidet das **Datum der Quelle** (ihre Geometrie schließt ihre eigene Fläche aus), nicht eine Schranke am Pixel. Der Bau dieser Trennung ist ungerechnet → erster Punkt der Welle. |
| 3 | (a) Ordnung, gemessen in Code-Luma | die Khronos-Form staucht in der Schulter nach dem hellsten Kanal und zieht im Fuß nach dem dunkelsten ab: 1 063 von 39 607 Farbpaaren kehren sich um (2,7 %, bis 2,74 EV), der Fuß-Fall ist die Gasse (graue Mondwand gegen orange Laternen-Wand) | (a) wird in **Leuchtdichte Y** geurteilt. Ob Fuß und Schulter der EINEN Kurve nach Leuchtdichte statt nach Kanal stauchen müssen, ist ungerechnet → zweiter Punkt. |
| 4 | Nacht-Knoten −2,17 EV und Anker S0 ≥ 22 (stamm/bild-kosten.js:3003-3005) | zwei **gewählte** Zahlen stoßen zusammen: mit dem physikalischen Mond liegt die Mondwiese bei Luma ≈ 5 statt ≈ 32 wie auf main, die Gasse im Mondschatten bei 0 (R3) | Keine der beiden ist ein Tor. Die Helligkeit der Mondnacht ist eine **Bild-Entscheidung des Schöpfers** (physikalisch dunkel oder spielbar hell) — sie steht als EIN benanntes Datum im Auge, nicht als Skala im Licht. |
| 5 | „Sonnenscheibe < 65 024 in rg11b10" · „S ≤ 0,75 nur in der Schulter" · „6,77 Stufen bis Code 1" | unter 35° Sonnenhöhe steht die Scheibe bei 1,1–1,6·10⁵ · Gras in 4 m hat mit Umgebung S 0,76 ohne Schulter · 6,77 gilt nur für Grau, satte Feuerfarbe trägt 12,3 EV | Die Scheibe ist ein Strahler mit eigenem Zahlbereich (Bahn A nennt die Klemme beim Namen). Das Tor 0,75 fällt weiterhin (Ring S 0,97–1,00). |

**Was der Spike NICHT entschieden hat (ehrlich):** sein Rechenmodell ist auf Fleck-Ebene ROT (7 von 10 unabhängigen Größen der
Runden 1 und 3 getroffen: k 4 von 4, Flecke 3 von 6); alle absoluten Luma-Zahlen der Zielbilder gelten als ungeprüft. Die Geometrie
der Sichten ist gewählt. Die Lava rechnete er mit 1 650 K statt mit den Daten des Spiels (Kruste 0,62 × Inneres); die Lava-Zahlen
gelten nicht. Mesopik und Stäbchen-Farbort sind unsicher: (c) urteilt nachts gegen die mesopische Erwartung mit benannter Toleranz,
oder gar nicht.

**Die Spannung, die bleibt, beim Namen.** Am Herd spannt die Szene 9–11 Stufen, die Kurve trägt für Grau knapp 7. Mit der Kappe am
Maximum bleibt das Gras am Feuer orange im Farbton (Luma ≈ 73 in 0,75 m, unsicher), und die Mondwiese hinter dem Feuer wird schwarz.
Das ist das Bild eines Menschen am Lagerfeuer — und es ist die EINE Stelle, an der Physik und Spielbarkeit auseinandergehen. Sie
wird am Bild entschieden, nicht in dieser Rechnung.

**DER ERSTE PUNKT DER BAU-WELLE (OFFEN-REGEL: was hier offen steht, ist der Anfang der nächsten Runde):**
1. **Rechnung vor jedem Bau:** die Trennung diffus/leuchtend aus dem Datum der Quelle (Punkt 2) und die Kurve nach Leuchtdichte
   (Punkt 3) — als Skript gegen die 39 607 Farbpaare und gegen herd-nah mit dem Bett bei 1–3 % Bild-Anteil.
2. **EIN GPU-Spike** (Lehre 18) vor den Bahnen Q · W · A: Kappe am Maximum + Oklab-Kurve als Post-Schritt auf main, an herd-nah,
   herd-fern, lava-nah, gasse-nacht, Vollmond-Wiese, Mittag — Paare main ↔ Spike. Er entscheidet die Spannung am Herd und die
   Helligkeit der Mondnacht am Bild. Erst danach schneiden die Bahnen.
3. **Bahn L** fährt parallel: die Linsen (a)–(d) rot auf main, (a) in Y.

**Die Zahlen der Tafel** (bereinigt, nach der Gegenlese): 571 gemeldete → 221 Größen mit 583 Feldern · 110 Größen (415 Felder)
gesetzt ohne Anker · 57 Licht-Systeme nebeneinander, 31 bis ans Pixel · sieben Einheiten für dasselbe Licht · in der Licht-Kette
(407 Felder) 62 % ohne Anker. Nach dem Gesetz fallen 129 der 407 Felder (31,7 %), 132 Daten tragen die Kette (118 + 14 neue),
27 bleiben als Absicht (Gefühls-Tönung, eine Farbkorrektur nach der Kurve), 93 sind unberührt. Die Feldzahlen sind grob (die Blätter
zählten verschieden).
