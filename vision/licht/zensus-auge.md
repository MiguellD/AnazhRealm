# Zensus Auge — die unterste Ebene der Helligkeits-Anpassung (am Text gelesen, 19.11.)

Lesart: **[T]** = am Volltext gelesen (Stelle genannt) · **[A]** = nur Abstract/Kurztext gelesen · **[S]** = sekundär (eine Quelle referiert eine andere) · **NICHT GEFUNDEN** = an keinem zugänglichen Text.
PDFs wurden lokal entpackt (Flate-Ströme, Text-Operatoren); bei gescannten PDFs lag eine OCR-Schicht vor. Minuszeichen gehen im Formel-Extrakt teils verloren — wo das trifft, steht es dabei.

## Quellen (Kürzel)

| Kürzel | Autor, Jahr, Titel | URL | Lesart |
|---|---|---|---|
| MWM92 | MacLeod, Williams, Makous 1992, „A Visual Nonlinearity Fed by Single Cones“, Vision Res 32(2) | aria.cvs.rochester.edu/papers/macleod-etal_VR1992.pdf | T (OCR) |
| SE84 | Shapley, Enroth-Cugell 1984, „Visual adaptation and retinal gain controls“, Prog Ret Res 3 | cns.nyu.edu/csh/csh06/PDFs/Shapley1984.pdf | T (OCR) |
| HM98 | He, MacLeod 1998, „Contrast-modulation flicker: dynamics and spatial resolution of the light adaptation process“, Vision Res 38 | (nur Katalog/Abstract) | A |
| WRP97 | Ward Larson, Rushmeier, Piatko 1997, „A Visibility Matching Tone Reproduction Operator for HDR Scenes“, IEEE TVCG 3(4) | graphics.cs.yale.edu/sites/default/files/1997tvcg_hdr_tonemapping.pdf | T |
| DD00 | Durand, Dorsey 2000, „Interactive Tone Mapping“, EGWR | graphics.cs.yale.edu/sites/default/files/2000_interactivetonemapping.pdf | T |
| R02 | Reinhard, Stark, Shirley, Ferwerda 2002, „Photographic Tone Reproduction for Digital Images“ (Tech-Report UUCS-02-001) | users.cs.utah.edu/docs/techreports/2002/pdf/UUCS-02-001.pdf | T |
| RD05 | Reinhard, Devlin 2005, „Dynamic Range Reduction Inspired by Photoreceptor Physiology“, IEEE TVCG 11(1) | pages.cs.wisc.edu/~lizhang/courses/cs766-2012f/projects/hdr/Reinhard2005DRR.pdf | T |
| K07 | Krawczyk 2007, Dissertation „Perception-inspired tone mapping …“ (enthält Krawczyk, Myszkowski, Seidel 2005 SCCG, Kap. 4) | people.mpi-inf.mpg.de/alumni/d4/2014/krawczyk/phd/krawczyk07phd_final.pdf | T |
| A01 | Artusi, Faisstnauer, Wilkie 2001, „A New Time-Dependent Tone Mapping Model“ (TU Wien) | cg.tuwien.ac.at/research/publications/2001/Artusi-2001-NTD/Artusi-2001-NTD-paper.pdf | T (für Pattanaik 2000: S) |
| RGH18 | Reeves, Grayhem, Hwang 2018, „Rapid Adaptation of Night Vision“, Front Psychol 9:8 | frontiersin.org/articles/10.3389/fpsyg.2018.00008/full | T |
| CML06 | Cameron, Mahroo, Lamb 2006, „Dark adaptation of human rod bipolar cells … b-wave“, J Physiol 575 | pmc.ncbi.nlm.nih.gov/articles/PMC1819465/ | T |
| ML04 | Mahroo, Lamb 2004, „Recovery of the human photopic ERG after bleaching exposures“, J Physiol 554 | (PMC1664777 gesperrt; Abstract über Suchauszug) | A/S |
| WV | Kalloniatis, Luu, „Light and Dark Adaptation“, Webvision | webvision.pitt.edu/?p=163 | T |
| HEE | Heeger, Vorlesungsnotizen „Light/Dark Adaptation“ (NYU) | cns.nyu.edu/~david/courses/perception/lecturenotes/light-adapt/light-adapt.html | T (Lehrtext) |
| CIE-G | Goodman 2013, „Developments in CIE mesopic photometry“ (BIPM CCPR WG-SP/13-WS-08, Folien zu CIE 191:2010) | bipm.org/documents/20126/47972998/WGSP-13-WS-08-… | T |
| V03 | Vos 2003, „On the cause of disability glare and its dependence on glare angle, age and ocular pigmentation“, Clin Exp Optom 86(6) | umcg-anes.netlify.app/publications/vos03 | A |
| BB22 | Bará, Bao-Varela 2022, „Skyglow inside your eyes: intraocular scattering …“ | arxiv.org/pdf/2212.09103 | T |
| UE | Epic Games, „Auto Exposure in Unreal Engine“ (Doku) | dev.epicgames.com/documentation/unreal-engine/auto-exposure-in-unreal-engine | T |
| P21 | Patry 2021, „Real-Time Samurai Cinema“ (Ghost of Tsushima), SIGGRAPH Advances in Real-Time Rendering | advances.realtimerendering.com/s2021/jpatry_advances2021/index.html | T |
| W22 | Wronski 2022, „Exposure Fusion – local tonemapping for real-time rendering“ | bartwronski.com/2022/02/28/exposure-fusion-local-tonemapping-for-real-time-rendering/ | T |
| BR | Bruop (Blog), „Automatic Exposure Using a Luminance Histogram“ | bruop.github.io/exposure | T |

---

## 1. Räumliche Bündelung — lokal oder global?

**Befund.** Die Licht-Anpassung ist LOKAL. Für Zapfen zeigt MWM92 mit Laser-Interferenz-Gittern, dass der empfindlichkeits-regelnde Ort nur durch die Licht-Integration im EINZELNEN Zapfen unscharf ist; für Stäbchen gibt es dagegen keine streng lokale Regelung (Pool, Rushton 1965). Die Elektrophysiologie setzt den Pool höchstens gleich dem rezeptiven Feld der Ganglienzelle (SE84 §2.1.6.4); psychophysisch summiert Westheimer bis ~0,75° Durchmesser. Die Grafik-Literatur benennt ~1° (WRP97) und nennt das globale Modell ausdrücklich eine Effizienz-Vereinfachung (DD00 §1.1). Die Pupille ist global und trägt nur 16–64× (≈ 1,2–1,8 log) des Bereichs.

| Größe | Wert | Quelle, Stelle | Zitat / Paraphrase |
|---|---|---|---|
| Zapfen: Ort der Regelung | Einzel-Zapfen | MWM92, Abschn. „Size and site of adaptation pools“, S. 360–361 | „only resolution losses … due to the integration of absorbed light energy within the individual cone“ (Paraphrase+Teilzitat) |
| Zapfen: Pool | „strictly local regulation“ | MWM92, ebd. | „strictly local regulation of sensitivity of the cone system“ |
| Stäbchen: Pool | nicht streng lokal | MWM92, ebd. (zit. Rushton 1965; MacLeod et al. 1989; Baylor et al. 1984) | „no suggestion of any strictly local regulation“ (Stäbchen) |
| Stäbchen-Pool-Größe (Grad) | — | — | **NICHT GEFUNDEN** (Rushtons 0,5°-Gitter-Argument ist laut SE84 nicht repliziert, Barlow & Andrews 1967) |
| Pool vs. rezeptives Feld | Pool ≤ RF der Ganglienzelle | SE84 §2.1.6.4 (zit. Cleland & Enroth-Cugell 1968; Green et al. 1977) | „size of an adaptation pool is equal to … or less than“ das RF |
| Räumliche Summation (psychophys.) | Schwelle ∝ Fläche bis ~0,75° Ø; darüber fällt sie | SE84 §2.1.6.4, zit. Westheimer 1965 [S] | Testfleck 0,1°, Adaptationsscheibe variabel |
| Lokale Nichtlinearität | auflösbar bis 100 c/deg | HM98, Abstract [A] | Nichtlinearität in oder direkt nach den Einzel-Rezeptoren |
| Grafik: Adaptationswinkel | ~1° | WRP97 §3 (vor Abb. 6) | „the eye rapidly adapts to … a relatively small angle … about 1°“ |
| Grafik: lokal vs. global | alle Mechanismen lokal; global nur aus Effizienz | DD00 §1.1 | „all of these mechanisms are local“ |
| CIE-Fahrerstudien | lokale Adaptation dominiert Umfeld | CIE-G, Folie „JTC-1 results to date“ (TC1-58) | „Local adaptation dominates over surround luminance“ |
| CIE: Adaptationsfeld | nicht definiert | CIE-G, Folie „Issues for implementation“ | „Does NOT state what is relevant adaptation field“ |
| Pupille | Ø 1–2 mm bis ~8 mm → Fläche 16–64× | HEE, Abschn. Pupille [Lehrtext] | „pupil diameter only ranges from 1 or 2 mm to about 8 mm“ |
| Pupille, effektiv | ~1 log von ~9 log | Suchauszug (entokey.com), [S] | 8 → 2,5 mm ≈ 10× Fläche |
| Gesamtbereich | ~10^10 (3·10⁻⁵ … 3·10⁵ cd/m², aus SE84 Einleitung abgeleitet) | SE84 §1 (OCR) | Mondlicht-Papier 3·10⁻² · Sonnen-Papier 3·10⁴ cd/m², ±3/+1 Dekade |
| Lokal, Lehrtext | lokal am gereizten Netzhautort (Nachbild-Beleg) | HEE | „light adaptation is local to the region of the retina“ |

## 2. Linear oder log — wovon folgt der Zustand?

**Befund.** Physiologisch ist die Eingangsgröße der Photonenfang je Rezeptor — eine LINEARE Integration der absorbierten Energie (MWM92) über die jüngste Vergangenheit (RD05 §II). Augenbewegungen und Streulicht machen daraus ein räumlich gewichtetes Mittel (RD05 §II, zit. Baxter et al. 1982). Das log-Mittel der Grafik ist eine Konvention ohne physiologische Herleitung: R02 nennt es „useful approximation to the key“, K07 „approximation of the adapting luminance“; weder R02 noch K07 noch DD00 begründen „log statt linear“ mit Daten.

| Aussage | Quelle, Stelle | Zitat / Paraphrase |
|---|---|---|
| Rezeptor integriert absorbierte Energie (linear, im Zapfen-Querschnitt) | MWM92 S. 361 | „integration of absorbed light energy within the individual cone photoreceptor“ |
| Zustand = Funktion der jüngst gesehenen Intensitäten | RD05 §II (nach Gl. 1) | „function of the light intensities … exposed to in the recent past“ |
| Sakkaden + Streulicht → räumlich gewichtetes Mittel | RD05 §II, zit. [30] Baxter, Ravindra, Normann 1982 | „saccadic eye movements as well as ocular light scatter“ |
| Moon-Spencer: Adaptationsleuchtdichte LINEAR aus Fovea + Umfeld | WRP97 §5.1 Gl. 8 | L_a = 0,913·L_f + K·∬_{θ>θ_f} L(θ,φ)·cosθ·sinθ/θ² dθdφ, K = 0,0096, θ_f = 0,5° |
| log-Mittel = Key-Näherung | R02 §3.1 Gl. 1 | „log-average luminance as a useful approximation to the key“ |
| Gl. 1 (R02) | R02 §3.1 | L̄_w = (1/N)·exp(Σ log(δ + L_w(x,y))) — so gedruckt; δ gegen log 0 |
| log-Mittel als Adaptations-Näherung | K07 §4.2.1 Gl. 4.1 | „logarithmic average … an approximation of the adapting luminance“ |
| DD00 rendert log-Farben und mittelt sie | DD00 §4.1 | Mittel der log-Pixel auf 64×64 bzw. 128×128 |
| WRP97: log für Helligkeit, nicht für Adaptation | WRP97 §4 | Histogramm „based on a logarithmic approximation of brightness“; Proben = 1°-Mittel |
| Herkunft „log“ in WRP97: Frei (Histogramm-Ausgleich) | WRP97 §2 | „Frei approximated brightness using the logarithm“ |
| Tumblin & Rushmeier 1993 / Ward 1994: Begründung des log-Mittels | — | **NICHT GEFUNDEN** am Text (nur Kataloge; WRP97 nennt T&R: Stevens-Helligkeit) |
| Spiel-Praxis: Histogramm in log2, Mittel im log | BR, „Calculating the Average“ | gewichtetes Mittel der Bin-Indizes → exp2 |

## 3. Zeit — Hell- und Dunkel-Anpassung, Zapfen und Stäbchen

**Befund.** Es gibt zwei getrennte Prozesse: einen schnellen neuralen (Zehntel-Sekunden) und einen langsamen Pigment-Prozess, der nur nach BLEICHEN zählt. Nach schwachem, nicht bleichendem Licht kehren Stäbchen binnen 0,6 s zurück (Baker 1961 via RGH18), Schwellen fallen binnen 200–600 ms nahe absolut (RGH18); Grafik-Modelle setzen τ ≈ 0,1 s (Zapfen) und 0,4 s (Stäbchen). Minuten-Konstanten (τ₂ = 1,8 min Stäbchen; Zapfen-Erholung ~4 min) gehören zu Bleichungen; nach kleinen Bleichungen (< 10 %) verhält sich die Erholung wie das Verblassen eines „äquivalenten Hintergrunds“ (CML06).

| Prozess | Zapfen | Stäbchen | Quelle, Stelle | Lesart |
|---|---|---|---|---|
| Hell-Anpassung, Exponentialfilter | τ_C = 0,1 s | τ_R = 0,4 s | DD00 §3.3; übernommen K07 Gl. 4.6 | T |
| Neuraler Filter (Pattanaik-Modell) | 80 ms | 150 ms | A01 §4.2 Gl. 9–10 | T (für Pattanaik 2000: S) |
| Pigment (Bleichen/Regeneration) | 110 s | 400 s | A01 Gl. 14, 16 | T (für Pattanaik 2000: S) |
| Hell-Anpassung, Messkurve | ~3 min bis max. Empfindlichkeit | ~75 % in 400 ms | K07 §3.1.5, Abb. 3.6 | S |
| Hell→Dunkel voll / Dunkel→Hell voll | bis 30 min / ~5 min | — | K07 §3.1.5 | S |
| Erholung nach SCHWACHEM Licht | Schwelle 40× → ~6× in 200 ms (1,2 log cd/m²) | voll binnen 0,6 s nach 0,03 cd/m² (Baker 1961) | RGH18 Results Abb. 5; Introduction | T (Baker: S) |
| „schnell, aber nicht ganz“ | Rest bis 2 min (Verstärkungs-Erholung) | dunkle Felder: 0,05–0,15 log über absolut bei 600 ms | RGH18 Discussion, Abb. 2 | T |
| Zeitkonst. nach mäßigem Licht (Farbbahnen) | ~15 s (b–y), 16–20 s (r–g) | — | RGH18 Introduction | T (zit.) |
| Blendquelle (Scheinwerfer) | 0,8 s jung · 2,1 s alt | — | RGH18 Introduction (Schieber 1994) | S |
| Dunkel-Anpassung nach Bleichen (Stäbchen) | — | S2: 0,24 Dek./min (τ₂ = 1,8 min); S3: 0,06 Dek./min (τ₃ = 7,2 min) | CML06 Results „Conversion to equivalent background“ | T |
| Regeneration ratenbegrenzt (Stäbchen) | — | v = 0,085 min⁻¹, K_m = 0,2 | CML06 Methods, Abb. 10 | T |
| Kleine Bleichung < 10 % | — | wie verblassender äquivalenter Hintergrund | CML06 Results „Qualitative features“ | T |
| Zapfen-Pigment | Erholung ~4 min; Anfangsrate ≈ ½ Pigment/min; K_m ≈ 20 % | — | ML04 Abstract | A/S |
| Stäbchen-Zapfen-Knick | nach 5–8 min | — | WV „Dark adaptation“ | T |
| Absolute Schwelle | — | ~10⁻⁵ cd/m² nach ~40 min | WV „Dark adaptation“ | T |
| Hecht, Haig & Chase 1937; Pugh 1975; Lamb & Pugh 2004 | — | — | Volltexte gesperrt | **NICHT GEFUNDEN** |
| Pattanaik et al. 2000 Volltext | — | — | Cornell-Server verweigert, KSU-Kopie TLS-Fehler | **NICHT GEFUNDEN** (nur über A01) |

## 4. Vollständigkeit — volle Kompensation oder nicht?

**Befund.** Volle Kompensation (Weber, Steigung 1) ist das Ideal und gilt nur in einem Bereich; darunter gilt Quadratwurzel/de Vries-Rose (Steigung ½, Stäbchen oft 0,6). Im Rezeptor-Modell nach Hood et al. 1979 wandert die Halbsättigung als σ(I_a) = (f·I_a)^m mit m zwischen 0,2 und 0,9 — d. h. die Verstärkung fällt wie I_a^(−m), UNVOLLSTÄNDIG (RD05 §II). Krawczyks Key-Formel macht die Ziel-Helligkeit absolut-leuchtdichte-abhängig, gibt aber zu, dass es dafür keine Daten gibt (K07 §4.3.1).

| Gesetz / Daten | Inhalt | Quelle, Stelle | Zitat / Paraphrase |
|---|---|---|---|
| Weber | ΔI_T = k_w·I_B → Kontrastempfindlichkeit konstant; Abb. 7: 10⁻² … 10² td | SE84 §2.1.2 Gl. 16 | „constant contrast sensitivity is the ideal which light adaptation must strive for“ |
| Weber-Brüche | Stäbchen 0,14; Zapfen 0,02–0,03; S-Zapfen ~0,09 | WV „Light adaptation“ (zit. Cornsweet 1970; Davson 1990; Stiles 1959) | S |
| Minimale Weber-Kontrastschwelle | Stäbchen ~0,08; Zapfen → 0,008 (Blackwell 1946) | SE84 §2.1.2 | S |
| de Vries-Rose | Steigung ½, Quanten-Rauschen; Stäbchen ~0,6 (Hallett 1969) | WV „Light adaptation“ | T |
| Übergang √ → Weber | hängt von Größe, Dauer, Exzentrizität ab | SE84 §2.1.1–2.1.3 | große, lange Flecken: Steigung ≈ 1 über ganzen Stäbchen-Bereich |
| Naka-Rushton | R = I/(I + I_s)·R_max; ohne Adaptation „saturation catastrophe“ | SE84 Gl. 6–9 | Kontrastverstärkung ∝ 1/I_B ohne Regelung |
| σ wandert unvollständig | V = I/(I + σ(I_a))·V_max, σ(I_a) = (f·I_a)^m, m ∈ [0,2; 0,9] | RD05 §II Gl. 1 (zit. Hood, Finkelstein, Buckingham 1979) | „for m it is found to lie between 0.2 and 0.9“ |
| Teil-Anpassung lokal/global | I_a = a·I_pixel + (1−a)·I_av | RD05 §III Gl. 7 | Rezeptor „neither completely adapted“ an Pixel noch an Mittel |
| m aus dem Bild (Technik) | m = 0,3 + 0,7·k^1,4, k = (L_max − L_av)/(L_max − L_min) im log | RD05 Gl. 2, 4 | „chosen for engineering purposes“ |
| Krawczyk-Key | a(Ȳ) = 1,03 − 2/(2 + log10(Ȳ + 1)) | K07 Gl. 4.11 (= KMS05 SCCG) | „no scientifically based experimental data“ — empirisch interpoliert |
| Key-Skala | 0,05 low · 0,18 mittel · 0,8 high | K07 §4.3.1 | — |
| Ferwerda-TVI (Grafik) | Steigung-1-Ast ab log L_aR ≥ 1,44 (Stäbchen) bzw. log L_aC ≥ 1,9 (Zapfen) | DD00 Gl. 1–2 (Ferwerda 1996 übernommen) | S; **Vorzeichen im Extrakt verloren** |
| Stevens & Stevens 1963 | Helligkeit als Funktion der Adaptation | — | **NICHT GEFUNDEN** (K07 zitiert Stevens & Stevens 1960 nur als Herkunft von T&R) |

## 5. Schwellen photopisch / mesopisch / skotopisch

| Grenze | Wert | Quelle, Stelle | Lesart |
|---|---|---|---|
| CIE 191:2010 obere Mesopik-Grenze | L_mes ≥ 5,0 cd/m² → m = 1 (photopisch) | CIE-G, Folie „CIE 191: System for mesopic photometry“ | T |
| CIE 191:2010 untere Grenze | L_mes ≤ 0,005 cd/m² → m = 0 (skotopisch) | CIE-G, ebd. | T |
| CIE 191 Adaptations-Koeffizient | m_n = 0,7670 + 0,3334·log10(L_mes,n−1), iterativ | CIE-G, Folie „Step 2“ | T |
| Webvision Zapfen/Stäbchen | Zapfen „above about 0.03 cd/m²“ | WV „Light adaptation“ | T |
| Riggs 1965 | Stäbchen untere 3 Dekaden, Zapfen obere 6, geteilt um 0,1 cd/m² | SE84 §1 | S |
| CIE 191 Grenze laut Hersteller | < 0,005 cd/m² nur Stäbchen | Konica-Minolta-Erklärseite (Suchauszug) | S |

## 6. Blendung / Schleier

**Befund.** Disability Glare ist intraokulares STREULICHT (V03 Abstract; BB22 §1) — also ein Bild-Glied (Punktbild-Verbreiterung, zustandslos), das additiv auf der Netzhaut liegt. Zusätzlich hebt es die Adaptationsleuchtdichte an der Fixation (WRP97 §5.1, Moon-Spencer). Die Stiles-Holladay-Form ist L_v/E = 10/θ² (θ in Grad) für 1°–30°; die CIE-General-Formel gilt 0,1°–100° mit Alter A und Pigment p (wirkt > 30°), ihre Gestalt fand ich NICHT am Text.

| Formel | Gültigkeit | Quelle, Stelle | Lesart |
|---|---|---|---|
| Altersbereinigte Stiles-Holladay: L_veil/E_glare = 10·(1 + (A/70)⁴)/θ² | 1°–30° | V03 Abstract | A |
| CIE General Disability Glare Equation (CIE 146:2002) | 0,1°–100°, Pigment p > 30° wirksam | V03 Abstract; Suchauszug zu CIE 146 | A; **Formel NICHT GEFUNDEN** |
| p-Werte | 0 dunkle · 0,5 braune · 1,0 blau-grüne Augen | Suchauszug (Sekundär-Paper) | S |
| Moon-Spencer-Adaptationsleuchtdichte | Gl. 8: L_a = 0,913·L_f + K∬…, K = 0,0096, θ_f = 0,5°; Umfeld < 9 % ohne helle Quellen | WRP97 §5.1 | T |
| Schleier je Fixation | Gl. 9: L_v,i = 0,0087·Σ_j L_j·cosθ_ij/θ_ij² (Rad) | WRP97 §5.1 | T |
| Schleier = Bild-Glied? | JA: „veil image represents luminance that has scattered within the eye“ | WRP97 §5.1 | T |
| Ursache | „intraocular scatter“ | V03 Abstract | A |
| Streulicht als PSF, Ausdehnung | Streukern reicht „several tens of degrees“ | BB22 §1 | T |
| Glare im Spiel-TMO | Y_glare = Y_gmap·(1 − 0,9/(0,9 + Y_gmap)) aus Gauß-Pyramide | K07 Gl. 4.14 | T |

## 7. Stand der Kunst in Echtzeit-Grafik (kleiner heller Fleck in dunkler Sicht)

| Verfahren | Was es löst | Was es kostet | Quelle, Stelle |
|---|---|---|---|
| Histogramm + Perzentile (UE Low/High Percent) | Ausreißer (kleine helle Flecken) aus dem Mittel schneiden; Start 70–80 / 80–95 % | 1 Histogramm-Pass; global — der Fleck selbst bleibt unkompensiert | UE „Histogram Settings“ |
| Belichtungs-Kompensations-Kurve (UE) | Ziel-Helligkeit je mittlerer Szenen-EV100 (Nacht dunkler lassen) | Kurve, kein Pass | UE „Key Concepts“: x = Average Scene EV100, y = Kompensation |
| Adaptations-Geschwindigkeit (UE) | getrennt auf/ab, in Blendenstufen je Sekunde | — | UE „Exposure Change Speed“ |
| UE Local Exposure (bilateral) | Basis-/Detail-Zerlegung der Leuchtdichte, Kontrast der Basis skaliert: Highlight/Shadow Contrast 0,6–1, Detail Strength 1, Blurred Luminance Blend 0,4–0,6, Kernel in % Schirm | Gitter-Auflösung nicht dokumentiert | UE „Local Exposure Settings“ |
| UE Local Exposure (Fusion) | mehrere synthetische Belichtungen nach Gütemaß | — | UE „Method“ |
| Bilaterales Gitter Ghost of Tsushima | I_o = c·(B − M) + d·(I_i − B) + M; B = bilateral gefilterte log-Leuchtdichte | 64 × 32 × 64 (log-Lum.), ~250 µs PS4 @1080p; Ringing-Mix 40 % bilateral / 60 % Gauß (r 13, auf 256×128 hochgetastet) | P21 „Tonemapping | Bilateral Grid“ |
| Belichtung aus Beleuchtungsstärke (GoT) | löst Albedo-Belichtungs-Rückkopplung; Leuchtdichte nur über Schwelle (Feuer, Spekulares) | — | P21 „Tonemapping | Exposure“ |
| Exposure Fusion (Wronski) | 3 synthetische Belichtungen, Laplace-Pyramide, Blend ab Mip 5–6 | ¼ × ¼ Auflösung + geführtes Hochtasten; geschätzt < 1 ms (nicht profiliert) | W22 |
| Gauß-Blend (God of War) | lokale Belichtung | „pretty bad halos“, unter Kamerabewegung sichtbar | W22 (über God of War) |
| Bilateral Grid (Chen, Paris, Durand 2007) | kantenerhaltende lokale Tonabbildung | 70×70×10 für 8 MP | Wiki-Auszug [S]; Volltext **NICHT GEFUNDEN** |
| Dodging & Burning (R02) | lokaler Key je Pixel über Zentrum-Umfeld-Skalen | FFT-Faltungen, mehrere Skalen | R02 §3.2 |
| 1°-Proben + Histogramm (WRP97) | lokale Adaptationsniveaus, ordnungserhaltend, ohne Halo | Proben je 1°, Histogramm-Angleich | WRP97 §4 |
| Lokale σ-Karte (RD05) | Rezeptor-σ aus lokalem Mittel; bilateral bringt wenig Vorteil, lokales Mittel „ringing“ | — | RD05 §II, §IV |

---

## SCHLUSS

**A) Was FOLGT (je Frage ein Satz)**
1. Die Anpassung ist lokal — Zapfen im Einzel-Zapfen, Pool höchstens rezeptives Feld, in der Grafik ~1° (MWM92, SE84, WRP97); die Pupille trägt global nur ≈ 1–1,8 log.
2. Der Zustand folgt dem LINEAREN Photonenfang (Zeit- und Sakkaden-Mittel, Moon-Spencer linear); das log-Mittel ist Grafik-Konvention ohne Datenbeleg (R02, K07).
3. Nach nicht bleichendem Licht dauert die Erholung Zehntel-Sekunden (τ 0,1 s / 0,4 s; Baker 0,6 s); Minuten gelten nur nach Bleichen (τ₂ 1,8 min, Zapfen ~4 min).
4. Die Kompensation ist unvollständig: σ ∝ I_a^m mit m = 0,2–0,9 (Hood 1979 via RD05); Weber gilt nur oberhalb der √-Zone.
5. CIE 191: photopisch ≥ 5 cd/m², skotopisch ≤ 0,005 cd/m², dazwischen m = 0,767 + 0,3334·log10 L.
6. Der Schleier ist Streulicht und damit ein zustandsloses Bild-Glied (10/θ² für 1°–30°), das zusätzlich die Adaptationsleuchtdichte an der Fixation anhebt.
7. Die Praxis löst den hellen Fleck LOKAL (bilaterales Gitter 64×32×64 in ~0,25 ms; Fusion in ¼-Auflösung), Perzentile nur global.

**B) Stellwert heute → Datum mit Quelle**

| Stellwert | Datum | Quelle |
|---|---|---|
| log-Mittel der Sicht | linearer Photonenfang, lokal (~1°) gemittelt; log nur Grafik-Konvention | MWM92 S. 361; WRP97 §3, §5.1 Gl. 8; R02 §3.1 |
| k ∝ 1/Zustand (voll) | k ∝ L_a^(−m), m = 0,2–0,9 (σ = (f·L_a)^m) | RD05 §II Gl. 1 (Hood et al. 1979) |
| τ Zapfen | 0,1 s neural (Pattanaik-Modell 80 ms [S]); Pigment 110 s nur nach Bleichen | DD00 §3.3; A01 Gl. 10, 16 |
| τ Stäbchen 120 s | 0,4 s neural, Erholung nach 0,03 cd/m² ≤ 0,6 s; 400 s / τ₂ 1,8 min nur nach Bleichen | DD00 §3.3; RGH18; A01 Gl. 14; CML06 |
| L_min 0,005 cd/m² | = CIE-191-Grenze skotopisch (m = 0), KEINE Verstärkungs-Decke; absolute Schwelle ~10⁻⁵ cd/m² | CIE-G; WV |

**C) Gesetz-Vorschlag**
Der Anpassungs-Zustand ist ein FELD, kein Skalar: je Schirm-Ort L_a(x) = linearer Mittelwert der Leuchtdichte über ~1° Sehwinkel plus Moon-Spencer-Schleier (WRP97 Gl. 8–9, K = 0,0096, θ_f = 0,5°), auf einem Schirm-Gitter, dessen Kosten an Auflösung und Sichtwinkel hängen, nie an der Welt. Die Antwort je Pixel ist V = L/(L + σ(L_a)) mit σ = (f·L_a)^m, m ∈ [0,2; 0,9] (RD05 Gl. 1 nach Hood 1979), sodass der Feuer-Fleck sein EIGENES L_a trägt und unvollständig kompensiert heller bleibt als das Feld, statt am dunklen Mittel auszubrennen. L_a(x) läuft je Zelle mit τ = 0,1 s (Zapfen) bzw. 0,4 s (Stäbchen) hinterher (DD00 §3.3); der Minuten-Ast greift nur, wenn die Zelle gebleicht wurde (A01 Gl. 14/16; CML06). Der Schleier selbst wird als zustandsloses Streulicht-Bild addiert (WRP97 §5.1). Ungeprüft bleiben: f und das genaue m (die Spanne 0,2–0,9 ist weit), ob 1° für Zapfen UND Stäbchen gilt (Stäbchen-Pool-Größe NICHT GEFUNDEN), die Halo-Grenze eines lokalen L_a (RD05 §II „ringing“; P21 mischt 40/60), und wie das lokale L_a beim Blick auf den Bildschirm (Betrachter adaptiert an den Monitor) zu übertragen ist.

**D) NICHT GEFUNDEN / nur sekundär**
- NICHT GEFUNDEN: Pattanaik et al. 2000 Volltext (Zahlen nur via A01); Hecht, Haig & Chase 1937; Pugh 1975; Lamb & Pugh 2004; Hood 1998 (Annual Review); Stevens & Stevens 1963; CIE-146-General-Formel (Gestalt); Tumblin & Rushmeier 1993 und Ward 1994 Begründung des log-Mittels; Stäbchen-Pool-Größe in Grad; Chen/Paris/Durand-2007-Volltext; UE-Gitter-Auflösung der Local Exposure; eine Quelle für eine Verstärkungs-Untergrenze L_min.
- Nur sekundär/Abstract: Westheimer 1965 (0,75°, via SE84); Baker 1961 (via RGH18); Hood-et-al.-1979-m-Spanne (via RD05); Ferwerda-1996-TVI (via DD00, Vorzeichen verloren); Mahroo & Lamb 2004 (Abstract); He & MacLeod 1998 (Abstract); Vos 2003 (Abstract); Pupillen-„1 log von 9“ (Suchauszug); Riggs 1965 (via SE84); Hell-Anpassungs-Messkurven 75 %/400 ms und 3 min (K07 Abb. 3.6); Bilateral-Grid 70×70×10 (Wiki).
