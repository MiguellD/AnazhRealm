# Zensus Auge, Bereich — was ist das adaptierende Feld? (am Text gelesen, 19.11.)

Lesart: **T** = am Volltext gelesen (Stelle genannt) · **A** = nur Abstract · **S** = sekundär (Wikipedia, Mirror, eine Quelle referiert eine andere) · **NG** = an keinem zugänglichen Text gefunden.
**Rechnung** = eigene Rechnung, keine Quelle. Volltexte liegen in `licht/dl2/` (PDF → `pdftotext -layout`). In PDF-Extrakten gehen π, √ und Minuszeichen teils verloren — wo das trifft, steht es dabei, samt Gegenprobe.
Vorblatt `zensus-auge.md` gilt weiter (Moon-Spencer Gl. 8 mit 0,913 Fovea-Gewicht, WRP97; UE-Perzentile 70–80/80–95; P21 Beleuchtungsstärke-Belichtung). Hier steht nur Neues oder neu Gelesenes.

## Quellen (Kürzel)

| Kürzel | Autor, Jahr, Titel | URL | Lesart |
|---|---|---|---|
| LR14 | Lagarde, de Rousiers 2014, „Moving Frostbite to Physically Based Rendering 3.0“ (SIGGRAPH-Kursnotizen) | seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf | T (dl2/frostbite.txt) |
| NK16 | Narkowicz 2016, „Automatic Exposure“ (Blog) | knarkowicz.wordpress.com/2016/01/09/automatic-exposure/ | T (dl2/narkowicz.txt) |
| VA15 | Vangorp, Myszkowski, Graf, Mantiuk 2015, „A Model of Local Adaptation“, ACM TOG 34(6) (Autorfassung) | cl.cam.ac.uk/~rkm38/pdfs/vangorp2015local_adapt.pdf | T (dl2/vangorp15.txt) |
| GI99 | Gilchrist et al. 1999, „An Anchoring Theory of Lightness Perception“, Psych Rev 106(4) (Manuskript-Fassung, 74 S.) | www2.eecs.berkeley.edu/Research/Projects/CS/vision/classes/cs294-appearance_models/sp2001/cache/gilchrist.pdf | T (Manuskript, Seiten ohne Druckpaginierung → Abschnitte) |
| MO00 | Moroney 2000, „Usage Guidelines for CIECAM97s“, IS&T PICS 2000, S. 161–165 | imaging.org/common/uploaded%20files/pdfs/Papers/2000/PICS-0-81/1611.pdf | T (π im Extrakt verloren, Gegenprobe s. u.) |
| SC18 | Schlömer 2018/2021, „Algorithmic improvements for the CIECAM02 and CAM16 color appearance models“, arXiv 1802.06067, Anhang A (gibt CAM16 nach Li et al. 2017 vollständig wieder) | ar5iv.arxiv.org/html/1802.06067 | T für den Text; für CIE 159 / Li 2017 selbst: S |
| FG06 | Frazor, Geisler 2006, „Local luminance and contrast in natural images“, Vision Res 46:1585–1598 | cns.nyu.edu/csh/csh06/PDFs/VR_2006_ContrastStats.pdf | T |
| KY17 | Kyba, Mohar, Posch 2017, „How bright is moonlight?“, Astron & Geophys 58(1) | academic.oup.com/astrogeo/article/58/1/1.31/2938178 | T (HTML) |
| UE | Epic, „Auto Exposure in Unreal Engine“ | dev.epicgames.com/documentation/en-us/unreal-engine/auto-exposure-in-unreal-engine | T |
| P21 | Patry 2021, „Real-Time Samurai Cinema“ (Ghost of Tsushima), SIGGRAPH Advances | advances.realtimerendering.com/s2021/jpatry_advances2021/index.html | T (Folien-Text) |
| AT | Tardif, „Histogram Luminance“ (Blog) | alextardif.com/HistogramLuminance.html | T |
| FSR | AMD, FidelityFX-FSR2 README | github.com/GPUOpen-Effects/FidelityFX-FSR2/blob/master/README.md | T (erste 100 000 Zeichen) |
| HO | Hollan (Masaryk-Univ.), „Luminances of a Flame of a Candle“ + Brief msg00023 | amper.ped.muni.cz/light/luminance/candle/ · amper.ped.muni.cz/jenik/letters/radiometry/msg00023.html | T (Web-Messprotokoll, kein Paper) |
| SS63 | Stevens, Stevens 1963, „Brightness Function: Effects of Adaptation“, JOSA 53:375–385 | opg.optica.org/abstract.cfm?URI=josa-53-3-375 | A (Volltext gesperrt) |
| W-CAM | Wikipedia „CIECAM02“ und „Color appearance model“ | en.wikipedia.org/wiki/CIECAM02 · …/Color_appearance_model | S |
| W-LM | Wikipedia „Light meter“ (gibt ISO 2720 wieder) | en.wikipedia.org/wiki/Light_meter | S |
| W-LX | Wikipedia „Lux“ und „Orders of magnitude (luminance)“ | en.wikipedia.org/wiki/Lux · …/Orders_of_magnitude_(luminance) | S |
| W-VF | Wikipedia „Visual field“ (zit. Rönne 1915, Traquair 1938, Spector 1990) | en.wikipedia.org/wiki/Visual_field | S (NCBI-Original hinter reCAPTCHA, nicht umgangen) |
| UE-SRC | UE `FPostProcessSettings`-Konstruktor (Scene.cpp), über Such-Auszug eines Dritt-Mirrors | (Such-Auszug) | S |

---

## 1. Das adaptierende Feld in Farberscheinungs-Modellen

**Befund.** Die Modelle teilen das Sehfeld in Reiz (2°), Hintergrund (bis 10–12°) und adaptierendes Feld/Umfeld (der Rest bis zur Sichtgrenze). L_A wird ausdrücklich NICHT aus dem Bildinhalt im Kegel, sondern aus der **Beleuchtungsstärke** der Umgebung abgeleitet: L_A = E/(5π) (MO00) bzw. L_A = (E_W/π)·(Y_b/Y_W) (CAM16 über SC18). Der Faktor 1/5 ist die Grauwelt-Annahme. D und F_L hängen nur von L_A ab; das Umfeld (average/dim/dark) ist kategorial, über das Verhältnis Umfeld-Weiß zu Szenen-Weiß.

| Aussage / Formel | wörtliche Stelle | Quelle, Stelle | Lesart |
|---|---|---|---|
| Geometrie: Reiz 2°, Hintergrund 10–12°, adaptierendes Feld = Rest | „the stimulus color or the 2-degree subtense in the center of the visual field. The 10 to 12 degrees around the stimulus is the background. The remainder of the visual field outside of the background is the adapting field.“ | MO00 S. 161–162 | T |
| Wikipedia-Fassung (CIECAM02): proximal field +2°, Hintergrund bis 10°, „adapting field“ = proximal + Hintergrund + Umfeld | „The totality of the proximal field, background, and surround is called the adapting field“ | W-CAM | S (weicht von MO00 ab: dort ohne Hintergrund) |
| L_A gemessen aus Beleuchtungsstärke | „a cosine detector or an integrating mechanism can be used to measure illuminance or lux“ | MO00 S. 162 | T |
| L = E·R/π; für L_A geteilt durch 5 (Grauwelt) | „for La this luminance is divided by 5 in order to incorporate a gray world assumption“ | MO00 S. 162, Gl. 1–2 | T (π im Extrakt verloren; Gegenprobe am Text: 64 lx → 20,4 cd/m² → L_A 4 ⇒ 64/π = 20,4 ✓) |
| Beispiele L_A | sRGB-Umgebung 64 lx → L_A = 4; Büro 350 lx → L_A = 22 | MO00 S. 162 | T |
| Schluss MO00 | „The luminance of the adapting field or La can be computed from measurements of the ambient illumination.“ | MO00 Conclusion | T |
| CAM16: L_A aus Weiß-Beleuchtungsstärke × Hintergrund-Faktor | L_A = (E_W/π)·(Y_b/Y_W) = L_W·Y_b/Y_W, „E_W = π L_W is the illuminance of reference white in lx“ | SC18 Anhang A | T (Text) / S (Li 2017) |
| Grauwelt-Rückfall | L_A = L_W/5, „If unknown, the adapting field can be assumed to have average reflectance“ | W-CAM | S |
| Grad der Adaptation | D = F·[1 − (1/3,6)·exp((−L_A − 42)/92)], auf [0,1] begrenzt | SC18 Anhang A | T |
| Leuchtdichte-Faktor | k = 1/(5L_A + 1); F_L = k⁴·L_A + 0,1·(1 − k⁴)²·(5L_A)^(1/3) | SC18 Anhang A | T |
| Hintergrund | n = Y_b/Y_W; z = 1,48 + √n; N_bb = N_cb = 0,725/n^0,2 | SC18 Anhang A | T |
| Umfeld-Tafel | average F 1,0 · c 0,69 · N_c 1,0 / dim 0,9 · 0,59 · 0,9 / dark 0,8 · 0,525 · 0,8 | SC18 Tab. 2 | T |
| Umfeld-Klassen (CIECAM97s) | dark 0 % · dim 0–20 % · average > 20 % der Szenen-Weiß-Leuchtdichte | MO00 S. 162, Tab. 1 | T |
| Umfeld-Klassen (CIECAM02, S_R = L_SW/L_DW) | average S_R > 0,15 · dim 0–0,15 · dark 0 | W-CAM | S (Schwelle 0,15 ≠ MO00 0,20) |
| Helligkeit Q ∝ F_L^(1/4) | Q = (4/c)·√(J/100)·(A_w + 4)·F_L^0,25 | W-CAM | S |
| Hintergrund Y_b = 20 als Vorgabe | „Generally, this value is set to a value of 20. This implicitly assumes a gray world“ | MO00 S. 162 | T |
| Stevens-Effekt (Exponent gegen Adaptation) | ψ = k(L − L0)^β; „β increases from 0.33 for the dark-adapted eye to 0.44 for the eye adapted to 1 lambert“ | SS63 Abstract | A (1 L ≈ 3 183 cd/m², **Rechnung**) |
| Stevens-, Hunt-, Bartleson-Breneman-Effekt (Definitionen) | „Contrast increases with luminance“ · „Colorfulness increases with luminance“ · Bildkontrast „increases with the luminance of surround lighting“ | W-CAM (Color appearance model) | S |
| Hunt-Modell (Eingänge, Stäbchen) | — | — | NG (nur W-CAM: „incorporating rod cell responses“) |
| Bartleson & Breneman 1967 Original | — | — | NG |

**Rechnung (aus SC18-Formeln).** D(F=1): L_A = 0,003 → 0,824 · 3 → 0,830 · 30 → 0,873 · 318 → 0,994 · ≥ 3 000 → 1,000. F_L^0,25: L_A = 0,016 (Vollmond 0,25 lx·0,2/π) → 0,35 · 0,32 → 0,59 · 7 000 (Mittag 110 klx·0,2/π) → 1,35. Über ~18,7 EV Beleuchtung (0,25 → 110 000 lx) wächst der Helligkeits-Faktor nur ≈ 3,9×: das Modell sagt „Nacht wirkt dunkler“, aber stark komprimiert. Gültigkeit unterhalb photopisch (Stäbchen) ist für CIECAM02/CAM16 nicht am Text belegt (NG).

## 2. Blick gegen Umfeld beim Menschen

**Befund.** Physiologisch ist der Zustand LOKAL an der Fixation: VA15 misst ein Plateau bei 0,5° Durchmesser, Ringe ab 6° sind vernachlässigbar, das beste Einfach-Modell ist ein log-Gauß mit σ = 0,131°. Blickwechsel (Sakkaden > 4–7°) bringen je Fixation (200–300 ms) eine neue, unkorrelierte Leuchtdichte, in einer typischen Szene über > 1 Dekade (FG06). Helligkeits-Konstanz dagegen verankert an der HÖCHSTEN Leuchtdichte, nicht am Mittel, gewichtet über Rahmen = „Regionen gemeinsamer Beleuchtung“ (GI99) — das ist die Stelle, an der „Licht am Ort“ psychologisch auftaucht.

| Aussage | wörtliche Stelle | Quelle, Stelle | Lesart |
|---|---|---|---|
| Sichtfeld einäugig | „approximately 60 degrees nasally … 107 degrees temporally … approximately 70 degrees above and 80 below“ | W-VF (zit. Spector 1990 u. a.) | S |
| Beidäugig ≈ 214° × ~150° | (2 × 107° horizontal; 70 + 80 vertikal, Brauen/Nase nicht abgezogen) | — | **Rechnung**; die Zahl „200° × 130°“ NG am Text |
| Ausdehnung der lokalen Adaptation | „levels off around a diameter of 0.5 of visual angle, which is smaller than the 1+ extent used in most ad hoc models but larger than the extent of about 0.1 proposed by Wilson [1997]“ | VA15 §5.2 (Exp. 3), Abb. 8 | T |
| Fernwirkung | „the long-range effect of rings of 6 diameter or more is negligible compared to no ring at all. The short-range effects are clearly dominant.“ | VA15 §5.3, Abb. 9 | T |
| Bestes Modell | L_a = α·n1⁻¹(n1(L_O)⊛g1) + (1−α)·n2⁻¹(n2(L_O)⊛g2), α = 0,654, σ1 = 0,428°, σ2 = 0,0824°; L_O = Netzhautbild nach OTF (Pupille 4 mm) | VA15 §6.2 Gl. 10 | T |
| Einfach-Modell #7 | log-Gauß, σ = 0,131°; „adaptation to a single pixel may be a better approximation than adaptation to a heavily blurred image“ | VA15 §6.3 | T |
| Pool wächst bei wenig Licht | Träger „substantially wider for model #1“ bei niedriger Leuchtdichte (Rezeptor → postrezeptoral, Dunn 2007) | VA15 §6.3 | T |
| Stäbchen-Pool | „the spatial adaptation pool for rods in the human retina can be 10 minutes of arc in diameter [Hess et al. 1990, p. 82]“ | VA15 §2 | S (schließt eine Lücke des Vorblatts) |
| Pupille | „reduce retinal luminance by a moderate factor of 8 (often much less)“ | VA15 §2 | T |
| Globale Modelle sind ad hoc | „Many tone mapping operators and color and image appearance models assume that the eye is adapted to a "global" luminance level regardless of the gaze position“ | VA15 §2 | T |
| Hunt / Pattanaik: L_A = ⅕ Weiß | „Pattanaik et al. consider one-fifth of the white-point luminance (as originally proposed in [Hunt 1995])“ | VA15 §2 | S |
| Gültigkeit | Fovea, stationär, 1–5 000 cd/m², achromatisch | VA15 §1, §8 | T |
| Blick am Schirm | „When viewing images on a regular (LDR) display, the adaptation changes to a lesser degree“; Blick-abhängige Tonabbildung braucht Eye-Tracker | VA15 §7.5 | T |
| Fixationsdauer, Sakkaden | „the eyes typically fixate a given location for only 200–300 ms“; mittlerer Fixations-Abstand > 4° (Suche), > 7° natürlich (Becker 1975) | FG06 S. 1585–1586; S. 1591 | T (Becker: S) |
| Spanne je Szene | 95 %-Spanne der lokalen Leuchtdichte „somewhat greater than a factor of 10“; Laub/Boden ~3×, Himmel ~2×; volle Spannen „usually more than 2 log units“ | FG06 Abstract S. 1585; §3 S. 1588 | T |
| Folgerung FG06 | „there will be little correlation in the contrast or luminance on a receptive field from one fixation to the next, and thus rapid contrast and luminance gain control are essential“ | FG06 Abstract | T |
| Anker-Regel: höchste Leuchtdichte, nicht Mittel | Halbkugel halb schwarz, halb mittelgrau: „The middle gray half was seen as fully white … This outcome decisively favors the highest luminance rule over the average luminance rule.“ | GI99 §3.2 | T |
| Helson-Regel (Mittel = Mittelgrau) | „the average luminance in the visual field is perceived as middle gray“ — durch §3.2 widerlegt | GI99 §2.4 | T |
| Rahmen = gemeinsame Beleuchtung | „regions of the image they called fields or frameworks. These are regions of common illumination.“ | GI99 §5.1 (vor 5.2) | T |
| Gewichtung lokal/global | PR = W_l·(L_t/L_hl·90 %) + (1−W_l)·(L_t/L_hg·90 %) (Gl. 3; im Text als „(W-1)“ gedruckt) | GI99 §5.4 Gl. 3 | T |
| Konstanz-Versagen | „Complete global anchoring is equivalent to luminance matching … zero lightness constancy. Complete local anchoring would produce 100% lightness constancy“ | GI99 §8.1 | T |
| Selbstleuchter brechen die Anker-Regel | „There is one phenomenon, however, that directly contradicts the highest luminance rule: the perception of self-luminous surfaces“ | GI99 §3.3 | T |
| Blendung/Schleier als Zustands-Glied | Moon-Spencer, 0,913·L_f + Umfeld (K = 0,0096) | Vorblatt (WRP97 §5.1) | T (Vorblatt) |

## 3. Fotografie: Licht- gegen Objektmessung

| Aussage / Formel | wörtliche Stelle | Quelle, Stelle | Lesart |
|---|---|---|---|
| Objektmessung (reflected) | N²/t = L·S/K | W-LM; LR14 Gl. 11 (EV = log2(L_avg·S/K)) | LR14: T · ISO: S |
| ISO 2720:1974, K | „ISO 2720:1974 recommends a range for K between 10.6 and 13.4. Two values for K are in common use: 12.5 (Canon, Nikon, and Sekonic) and 14 (Minolta, Kenko, and Pentax)“ | LR14 S. 26 | T (ISO selbst: S) |
| 12,5 = halbe Blende unter 18 % | „The value 12.5 is roughly half a stop below middle grey to provide some headroom: 18%/√2 = 12.7%.“ | LR14 S. 26 Fußn. 19 | T (√ im Extrakt verloren) |
| Lichtmessung (incident) | N²/t = E·S/C; C flach 240–400 lx (üblich 250), Kalotte 320–540 (Minolta 320, Sekonic 340) | W-LM | S |
| „18 %“ ist keine Reflexions-Eichung | „It is commonly stated that reflected-light meters are calibrated to an 18% reflectance, but the calibration has nothing to do with reflectance“; K = 14 ⇒ 17,6 % | W-LM | S |
| Implizite Reflexion R = π·K/C | 12,5·π/250 = 15,7 % · 14·π/250 = 17,6 % | — | **Rechnung** (deckt W-LM 17,6 %) |
| Objektmessung versagt bei hellen Motiven | „An unusual scene with a preponderance of light colors or specular highlights would have a higher reflectance … and lead to underexposure.“ Lichtmessung vermeidet das, „but not in the setting-sun case“ | W-LM | S |
| Schnee/Kohle ausdrücklich | — | — | NG am Text (W-LM nennt Sonnenuntergänge, nicht Schnee) |
| Spot-Messung | „a very tight cone, typically with a one degree circular angle of view“ | W-LM | S |
| Matrix-/Mehrfeld-Messung | nur „multi-segment … measure the luminance of different parts of the scene“ | W-LM | S; Herstellerlogik NG |
| EV100 | EV100 = log2(N²/t) − log2(S/100) (Gl. 67); EC: EV100' = EV100 − EC (Gl. 68); aus Leuchtdichte EV100 = log2(L_avg·100/12,5) (Listing 28) | LR14 S. 82–85 | T |
| EV ↔ L | L = 2^EV·12,5/100 = 2^(EV−3); Tafel 7: EV100 0 → 0,125 · 10 → 128 · 15 → 4 096 cd/m² | LR14 S. 26–27 Gl. 12, Tab. 7 | T |
| Sättigung | H_sbs = 78/S; L_max = 78·N²/(S·q·t), q = 0,65 ⇒ L_max = 1,2·2^EV100 | LR14 S. 84–85 Gl. 72–75, Listing 28 | T |
| Sunny 16 | „On a sunny day, set aperture to f/16 and shutter speed to the ISO settings speed“; Tafel 13: f/22 Schnee/Sand · f/16 sonnig · f/11 leicht bedeckt · f/8 bedeckt · f/5.6 stark bedeckt · f/4 Schatten/Sonnenuntergang | LR14 S. 87–88 §5.1.4, Tab. 13 | T |
| Sunny 16 ⇒ EV100 ≈ 14,6–15; ⇒ E ≈ 2,5·2^EV ≈ 61–82 klx | E = C·2^EV/S mit C = 250, S = 100 | — | **Rechnung**; liegt im Bereich der LR14-Messung (Tab. 11: Sonne+Himmel 85–114 klx) |
| Sunny 16 ist eine Lichtmessung | die Regel stellt nach der Beleuchtungsart ein, nicht nach dem Motiv; Schnee bekommt f/22 (mehr Licht am Ort durch Rückstreuung, LR14 Tab. 13) | — | **Deutung**, nicht wörtlich |

## 4. Stand der Kunst in Spielen

### 4a. Belichtung aus Beleuchtungsstärke

| Aussage | wörtliche Stelle | Quelle, Stelle | Lesart |
|---|---|---|---|
| Problem der Leuchtdichte-Messung | „these methods suffer from exposing based on pixel luminance multiplied by albedo. This means that if the scene is fully 10% grey or fully 90% grey, it will result in the same color.“ | LR14 S. 84 §5.1.1 | T |
| Ausweg und Preis | „An alternative is to expose based on the luminance before the multiplication with albedo [Koj+13]. However in practice it is expensive to maintain a separate lighting buffer with white-only luminance. In Frostbite, we have adopted the histogram method.“ | LR14 S. 84 | T |
| Hoffman-Vorschlag | „Naty Hoffman in his talk proposed to adapt to illuminance instead of final pixel luminance [Hof13]. This way material reflectance won't influence automatic exposure – dark corridors will remain dark and snow will be pure white as expected.“ | NK16 „Adapting to illuminance“ (Hof13 = i3D 2013 „Outside the Echo Chamber“) | T (Hoffman selbst: S) |
| Befund am Schnee | „a wall painted in white will just look just like a wall painted in black. We had this kind of issue in dark corridors, where part of them were covered in snow“ | NK16 ebd. | T |
| Himmel bleibt Leuchtdichte (bewusst blickabhängig) | „We settled on luminance, as we want exposure to change depending on camera direction (bright white clouds near sun should have different exposure than darker parts of the skybox …)“ + Himmel-EC von Hand | NK16 ebd. | T |
| Umsetzung | Diffus-Licht vor Multiplikation mit diffuseColor; „every object is treated as a white diffuse surface“ | NK16 Kommentar-Antwort | T |
| Ghost of Tsushima | „Switched to a primarily illuminance-based exposure system“ · „Use luminance only if highlight luminance exceeds threshold“ · „E.g. Fire particles, bright specular highlights“ · Anlass: „Exposure ⇔ Albedo feedback loop“ (Infamous) | P21 „Tonemapping | Exposure“ | T (keine Formel, keine Schwelle als Zahl) |
| Virtuelles Lichtmessgerät am Kamera-Ort | geschätzte Belichtung „can be calculated from a virtual light meter placed at camera position, can be estimated from lightmap values at the center of the screen or can be estimated from light probes at camera position“ (für FX-Helligkeit) | NK16 „Exposure compensation curve“ ff. | T |
| The Last of Us Part II, Belichtung aus Beleuchtungsstärke | — (Vortrag Doghramachi 2020 behandelt Ambient-Licht; kein Belichtungs-Text gefunden) | — | NG |
| Tardif | 256 log2-Bins, log-Bereich −10…+2, Bin 0 (fast schwarz) ausgeschlossen, Adaptation `1 − exp(−Δt·τ)`, τ = 1,1; Mittenbetonung nur als Vorschlag; Beleuchtungsstärke nicht erwähnt | AT | T |

### 4b. Mess-Masken, Perzentile, Kompensations-Kurve

| Aussage | wörtliche Stelle | Quelle, Stelle | Lesart |
|---|---|---|---|
| Perzentil-Schnitt (Praxis) | „skip a large percentage (50%-80%) of the darkest pixels, a smaller percentage (2%-20%) of the brightest pixels and calculate the average from the remaining ones“ | NK16 „Histogram“ | T |
| Warum Histogramm | „if a player hides behind a dark tree, metering will result in very low average … Instead we want to expose for the dominant one.“ | NK16 ebd. | T |
| Mittenbetonung | „metering in the small circle in the center of the image or by giving more influence to luminance values located in the center of the screen [Hen14]“ | NK16 „Center weighted metering“ | T |
| UE: Histogramm 64 Bins, Standard-Modus | „Auto Exposure Histogram constructs a 64-bin, histogram …“, „the default exposure metering mode“ | UE | T |
| UE Low/High Percent, Doku-Empfehlung | Start 70–80 / 80–95 | UE | T |
| UE Low/High Percent, Konstruktor-Vorgabe | 10 / 90 | UE-SRC (Scene.cpp über Mirror) | S |
| UE Kompensations-Kurve | „the X-axis is presented by the Average Scene EV100 value“; y = Exposure Compensation | UE | T |
| UE Metering Mask | „Use your own texture mask to meter exposure“; „Giving importance to pixels toward the center of the screen rather than along the edges“ | UE | T |
| Kurven-Begründung | „As a rule, we want to have a darker image in low light conditions and a brighter image in high light conditions. This way viewer has a clue as to how bright the lighting is“ (Krawczyk-Key) | NK16 „Exposure compensation curve“ | T |
| Messung nach dem Opak-Pass | „compute automatic exposure basing on scene luminance just after the main opaque pass … skip all translucents, emissive and debug meshes“; „fixes feedback loop issues“ | NK16 | T |
| Was adaptieren, was nicht | „we want to adapt to something that's constant on the screen like fire particles, but don't want to adapt to temporary FX like muzzle flashes or explosions“ | NK16 | T |

### 4c. Vor-Belichtung

| Aussage | wörtliche Stelle | Quelle, Stelle | Lesart |
|---|---|---|---|
| Frostbite: Lichtpuffer Float16, vorbelichtet | „Light buffer Float16. Exposure is pre-applied.“ | LR14 S. 89 | T |
| Grund | Float16 „maximum value is too low (65504) and the minimum value is too small (6.10·10⁻⁵)“; Mehrpass-Akkumulation „could easily saturate the buffer and create infinite values“ | LR14 S. 89 §5.2 | T |
| Formate | 11-bit Float: kein Vorzeichen, 6 bit Mantisse / 5 bit Exponent, max 65 024, min 6,10·10⁻⁵, ~2,5 Dezimalstellen; alle kleinen Floats ≈ 30 Blenden; Farbstich bei R11G11B10, weil 10 bit ungenauer als 11 bit | LR14 S. 89–90 Tab. 14 | T (Tafel-Extrakt verschoben, nach bekannten Grenzwerten zugeordnet) |
| Relative Stufe R11 | 2⁻⁶ ≈ 1,6 % je Stufe; Spanne log2(65 024/6,1·10⁻⁵) ≈ 30,0 Blenden | — | **Rechnung** |
| Mechanik | „We either use a fixed exposure or use the exposure calculated by auto-exposure of the previous frame.“ Epilog `color * exposureMultiplier` in allen Licht-Shadern | LR14 S. 90 Listing 31 | T |
| Nebenwirkung: Sprung/Teleport/erstes Bild | „common pitfalls of using the previous frame's exposure with quick or large camera movements (including teleporting) and as well as the first rendered frame. But it can be perceived as eye adaptation time“ | LR14 S. 90 | T |
| Umkehrbar | „If required, the pre-exposure can be undone to retrieve the absolute luminance value.“ | LR14 S. 90 | T |
| Bloom-Schwelle an der Belichtung | Emissive in EC relativ zu `currentEV` des Vorbilds: `bloomEV = currentEV + bloomEC`, „ensure it blooms at all exposures“ | LR14 S. 87 Listing 29 | T |
| Valve als Ursprung, R11G11B10 | „just like we pre-expose the image (multiply shader outputs by adaptation from a previous frame, so we can store HDR data in R11G11B10Float buffers without any precision issues). By the way scene pre-exposure was also introduced by Valve in HL2: Episode One.“ | NK16 „Histogram“ | T (Valve: S) |
| UE | „The amount of exposure applied in the shader is called pre-exposure“; es „reduces the risk of arithmetic overflow for low-precision render target formats when using very bright lights“ | UE | T |
| Temporale Verfahren (FSR2) | Pre-Exposure ist „a value by which we divide the input signal to get back to the original signal produced by the game“; Exposure wird in „Adjust input color“ und „Reproject & Accumulate“ benutzt | FSR | T (Geschichts-Umrechnung im Detail nicht gelesen: Rest der Datei ungelesen) |
| Nebel unter Vor-Belichtung | — | — | NG |
| UE-Geschichte (TAA-Umrechnung mit Belichtungs-Verhältnis) | — | — | NG am Text |

### 4d. Physikalische Leuchtdichten / Beleuchtungsstärken

| Größe | Wert | Quelle, Stelle | Lesart |
|---|---|---|---|
| Sonnenscheibe | ≈ 1,6·10⁹ cd/m²; Raumwinkel 6,6–7,1·10⁻⁵ sr; ⇒ 105–114 klx ohne Atmosphäre | LR14 S. 36 Fußn. 28–29 | T |
| Sonne + Himmel gemessen (Stockholm, Juli) | 85,5–113,6 klx horizontal; Himmel allein 19–29 klx; Sonne senkrecht 79–123 klx | LR14 S. 36 Tab. 11 | T |
| Klarer / bedeckter Himmel | „around 8000 cd.m⁻² and an overcast around 2000 cd.m⁻²“ | LR14 S. 59–60 | T |
| Mondscheibe | „The luminance of the moon is around 2500 cd.m⁻²“ | LR14 S. 60 | T |
| Nacht unter Straßenlicht (Probe) | „3000 to 5000 cd.m⁻² are not uncommmon under street light illumination“ (sic, im Text; vermutlich Lichtquellen im Bild); Objekte „< 1cd.m⁻²“ | LR14 S. 60 | T (Wert fraglich) |
| Vollmond, Beleuchtungsstärke | max. horizontal ≈ 0,3 lx (0,26 lx bei 55,5°, senkrecht 0,30; Zenit ≈ 0,32); typisch 0,05–0,1 lx (Sommer, gemäßigte Breiten), meist 0,05–0,2 lx | KY17 | T |
| Sternenhimmel | 0,002 lx klar mit Airglow · 0,0001 lx bedeckt | W-LX (zit. Schlyter) | S |
| Nachthimmel-Leuchtdichte | 1 mcd/m² · dunkelster 400 µcd/m² · bedeckt ohne Mond 100 µcd/m² | W-LX | S |
| Kerzenflamme | heißester Teil ≈ 16 kcd/m² („16 knit“); „2e4 cd/m2 is a safe upper value for such a flame“; Flamme 0,7 cd | HO | T (Einzelmessung, Web) |
| Kerze, Farbtemperatur | 1 850–1 930 K | LR14 S. 22 (Tafel Farbtemperatur) | T |
| FX-Spanne im Spiel | „direct sunlight (~100000 LUX) … full moon lighting (~0.25 LUX)“ | NK16 | T |
| Glut / Lava (Schwarzkörper, ε = 1) | 900 K ≈ 0,2 · 1 000 K ≈ 2,6 · 1 100 K ≈ 22 · 1 200 K ≈ 135 · 1 400 K ≈ 2 400 cd/m² | — | **Rechnung** (Planck × Gauß-Näherung von V(λ), 683 lm/W; Gegenprobe 5 778 K → 1,9·10⁹ ≈ LR14 1,6·10⁹) |
| Holzfeuer-Flamme, Öl-Laterne, Glut, Lava gemessen | — | — | NG |

## 5. Was die Quellen zusammen sagen

| Lesart | Belege | Gegen-Belege |
|---|---|---|
| „Zustand aus dem Licht am Ort“ | CAMs definieren L_A aus Umgebungs-Beleuchtungsstärke (MO00 Gl. 1–2; CAM16 L_A = E_W/π·Y_b/Y_W); Fotografie misst inzident (Sunny 16, C); Spiele, die den Albedo-Fehler loswerden wollten, gingen zur Beleuchtungsstärke (Hof13 via NK16, P21, LR14 [Koj+13]); Gilchrists Rahmen = Regionen gemeinsamer Beleuchtung | CAM-L_A ist eine Konvention für Oberflächen-Farben (Grauwelt ⅕), keine Messung des Auges; GI99 verankert an der höchsten LEUCHTDICHTE, nicht an E |
| „begrenzter Blick-Anteil“ | Moon-Spencer, VA15 | Beim Menschen ist der Blick-Anteil der HAUPTanteil: 0,913 Fovea (WRP97), Plateau bei 0,5°, > 6° vernachlässigbar (VA15); je Fixation neue Leuchtdichte (FG06) |
| Perzentil-Kegel + Kurve | NK16, UE (Standard der Industrie) | LR14 S. 84 und NK16 benennen genau dessen Fehler: Albedo × Licht, Schnee = Kohle |
| Ausnahmen, die alle Spiel-Quellen machen | Selbstleuchter (Feuer, Spekulares über Schwelle, Himmel) werden als LEUCHTDICHTE gemessen (P21, NK16); GI99: Selbstleuchter brechen die Anker-Regel | — |

---

## NICHT am Text gefunden (ehrlich)

- **NG:** CIE 159:2004 und Li et al. 2017 (CAM16) im Original (Formeln nur über SC18); Hunt-Modell (Eingänge, Stäbchen-Glied); Bartleson & Breneman 1967; Stevens & Stevens 1963 Volltext (nur Abstract); die Zahl „200° × 130°“; Schnee/Kohle als ausdrückliches Beispiel in einer Messgeräte-Quelle; ISO 2720/2721 im Original; Matrix-Messung (Hersteller-Logik); The Last of Us Part II, Belichtung aus Beleuchtungsstärke; Hoffman 2013 i3D Volltext; Formel und Schwelle der GoT-Belichtung; Nebel- und TAA-Geschichts-Nebenwirkung der Vor-Belichtung (UE); gemessene Leuchtdichten von Holzfeuer, Öl-Laterne, Glut, Lava; Gültigkeit von CIECAM02/CAM16 unter ~1 cd/m²; jede Arbeit, die misst, welchen Anteil die PERIPHERIE (> 10°) am Zustand trägt (VA15 misst nur bis 6° Fovea-Feld; Moon-Spencer nur über WRP97).
- **Nur sekundär/Abstract:** ISO-2720-Konstanten C (W-LM); 18-%-Diskussion (W-LM); UE-Vorgabe 10/90 (Mirror); Sichtfeld-Grenzen (W-VF); Stevens-/Hunt-/B-B-Definitionen (W-CAM); Sternenlicht 0,002 lx (W-LX); Stäbchen-Pool 10′ (Hess 1990 via VA15); Valve HL2:EP1 als Ursprung der Vor-Belichtung (via NK16).
- Geladen, aber nicht verwendet: `dl2/luo2006.pdf` (Luo, Cui, Li 2006, UCS auf CIECAM02 — keine Feld-Definition gebraucht).

---

## SCHLUSS

**(i) Größe → Datum mit Quelle**

| Größe | Datum | Quelle |
|---|---|---|
| L_A aus Beleuchtungsstärke | L_A = E/(5π) cd/m² (Grauwelt ⅕) | MO00 S. 162 Gl. 1–2 [T] |
| L_A in CAM16 | L_A = (E_W/π)·(Y_b/Y_W), Y_b = 20 Vorgabe | SC18 Anh. A [T]; MO00 [T] |
| D | F·[1 − (1/3,6)·e^((−L_A−42)/92)]; ≥ 0,99 ab L_A ≈ 300 | SC18 [T]; Werte: Rechnung |
| F_L | k⁴L_A + 0,1(1−k⁴)²(5L_A)^⅓, k = 1/(5L_A+1); Q ∝ F_L^¼ | SC18 [T]; W-CAM [S] |
| Umfeld c / N_c / F | 0,69/1,0/1,0 · 0,59/0,9/0,9 · 0,525/0,8/0,8 | SC18 Tab. 2 [T] |
| Ausdehnung lokaler Zustand | Plateau 0,5°; > 6° vernachlässigbar; log-Gauß σ = 0,131° | VA15 §5.2, §5.3, §6.3 [T] |
| Wechsel je Fixation | 200–300 ms; Sprung > 4–7°; 95 %-Spanne > 10× je Szene | FG06 S. 1585, 1591 [T] |
| Anker der Helligkeit | höchste Leuchtdichte je Rahmen (nicht Mittel), lokal/global gewichtet | GI99 §3.2, §5.4 [T] |
| K, C | K 10,6–13,4 (12,5 / 14); C flach 240–400 (250) | LR14 S. 26 [T]; W-LM [S] |
| EV100 | log2(N²/t·100/S) = log2(L·100/12,5); L = 2^(EV−3) | LR14 Gl. 12, 67, 69 [T] |
| Sonne / Himmel | 1,6·10⁹ cd/m²; Sonne+Himmel 85–114 klx; Himmel klar 8 000, bedeckt 2 000 cd/m² | LR14 S. 36, 59 [T] |
| Mond | Scheibe 2 500 cd/m²; Vollmond max 0,3 lx, typisch 0,05–0,2 lx | LR14 S. 60 [T]; KY17 [T] |
| Sternenlicht | 0,002 lx (klar, Airglow) · 0,0001 lx (bedeckt) | W-LX [S] |
| Kerzenflamme | ≈ 16 kcd/m², obere Grenze 2·10⁴ cd/m² | HO [T] |
| Vor-Belichtung | k des Vorbilds in jedem Licht-Shader; Grund: Float16/R11 max 65 504/65 024, min 6,1·10⁻⁵ | LR14 S. 89–90 [T]; NK16 [T] |

**(ii) Fünf Sätze**

1. **Es trägt:** Jede Quelle, die eine Belichtung oder ein L_A aus einer FESTEN Messvorschrift ableitet, nimmt das Licht am Ort — CAMs rechnen L_A = E/(5π) aus der Umgebungs-Beleuchtungsstärke (MO00, CAM16), die Fotografie misst inzident (Sunny 16, Konstante C), und die Spiele, die den Albedo-Fehler loswerden wollten, wechselten genau dorthin (Hoffman 2013 über NK16, Ghost of Tsushima P21, Frostbite [Koj+13]), mit derselben Ausnahme: Selbstleuchter über einer Schwelle (Feuer, Spekulares, Himmel) gehen als Leuchtdichte ein.
2. **Es trägt nicht:** Das physiologische Auge adaptiert nicht an den Ort, sondern an die Fixation — Plateau bei 0,5°, Ringe ab 6° vernachlässigbar (VA15), 0,913 Fovea-Gewicht bei Moon-Spencer, eine neue Leuchtdichte je Fixation (FG06) —, also ist der „begrenzte Blick-Anteil“ beim Menschen der HAUPTanteil, und Gilchrist verankert die Helligkeit an der höchsten Leuchtdichte im Beleuchtungs-Rahmen, nicht am mittleren E.
3. **Die Teilung, die der Text stützt,** ist eine andere als „Ort + kleiner Blick“: der GLOBALE Faktor k ist das Erscheinungs-Anker-Glied (Szenen-Weiß/Beleuchtungsstärke am Ort, CAM-L_A, Lichtmessung), plus eine Kompensations-Kurve über das Szenen-EV, die Nacht dunkler lässt (UE, NK16 nach Krawczyk; F_L^¼ komprimiert 18,7 EV auf ≈ 3,9×, Rechnung); das fixations-lokale Auge ist ein zweites, LOKALES Glied, das ein globaler k nicht tragen kann (VA15 braucht dafür Eye-Tracker oder eine lokale Karte).
4. **Unentscheidbar am Text:** ob der helle Himmel den Anker setzen soll — GI99 sagt, Selbstleuchter brechen die Anker-Regel, NK16 lässt den Himmel absichtlich als Leuchtdichte in die Messung, damit die Belichtung mit der Blickrichtung wechselt, und beides ist Geschmack, nicht gemessen; ebenso fehlt jede Messung, wie viel die Peripherie (> 10°) zum Zustand trägt, und wie ein Spieler vor einem LDR-Schirm adaptiert (VA15 §7.5 sagt nur „to a lesser degree“).
5. **Die eine Falsifikation:** Man nehme EIN Mittags-Bild mit Himmel im Kegel und einer 18-%-Graukarte im Vordergrund, rechne an der Fixation „Graukarte“ L_a nach dem veröffentlichten VA15-Modell (Gl. 10; Matlab-Code laut Such-Auszug auf resources.mpi-inf.mpg.de/LocalAdaptation, Seite selbst 403) und vergleiche es mit dem Ort-Gesetz L_A = E_W/π·0,2. Liegt das VA15-L_a an typischen Fixationen im Vordergrund mehr als 1 EV über dem Ort-Wert, weil Streulicht des Himmels den Zustand hebt, dann ist „Ort + begrenzter Blick“ für den Mittag widerlegt und der Kegel-Spike (−1,06 EV) hatte recht. Liegt es innerhalb von 1 EV, trägt die Hypothese an dieser Stelle (dort, wo Himmel und Graukarte im Bild ≥ 0,5° auseinander liegen).
