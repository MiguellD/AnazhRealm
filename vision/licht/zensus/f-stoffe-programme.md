# (f) DIE STOFFE — wer liest welches Licht (Zensus, nur gelesen; Zweig strahler-leuchte 2ce8a033d)

Ich habe nur gelesen: nichts gebaut, keine GPU und kein Bild. Jede Zeile nennt `datei:zeile`. „r184“ ist die Lichtung von three r184
(PhysicalLightingModel) in jedem `Mesh*NodeMaterial`. Szenen-Lichter der Welt: Directional (Sonne/Mond) + CSM, Ambient und
Hemisphere (`stamm/dirigent-ankunft.js:356,358,455`), die Umgebung als `scene.environmentNode` = `_spiegelUmgebung`
(`stamm/bild-himmel.js:726`, `stamm/bild-sicht.js:684-730`). Ein MeshBasic-Stoff liest davon nichts.

## 0. DIE MATRIX — Programm × Lichtweg

Spalten: **Di** = Sonne/Mond direkt (r184 + Kaskade; die Sonnen-Sicht Horizont × Wolke hängt an der CSM, `dirigent-ankunft.js:424`) ·
**Am/He** = Ambient und Hemi · **IBL** = environmentNode (PMREM-Himmel × Raum-Himmel + Spiegel-Pass) · **Pool** = `_lichtPoolTerm`
im Emissiv · **Gl** = Glut/Emission · **Du** = Durchlass (Laub-Licht, `laubDurchlass`) · **Zw** = eigener Zwilling.
L = liest · – = liest nicht · Z = eigener Zwilling.

| Programm (Bau-Stelle) | Di | Am/He | IBL | Pool | Gl | Du | Zw / Eigenheit |
|---|---|---|---|---|---|---|---|
| Boden/Voxel-Chunk (`wasser-zellen.js:1486` → `stoff-material.js:854`, geomorph+himmelsSicht) | L, Schatten × Zuwendung `stoff-material.js:1966-1971` | L × aoNode = aHimmel × Kontakt `:2003` | L × aoNode | L mit Himmels-Sicht `:2037` | Lava-Glut `:991-992` | – | Z: AERIAL-Faktor auf dem ganzen Ausgang samt Pool und Glut `:822-845` |
| Fern-Ring (`gelaende-fern.js:508`) | L | L, **ohne** aoNode (keine himmelsSicht) | L | L ohne Himmel | Wasser-Anteil als Emissiv `stoff-material.js:983-989` | – | Z: Wasser im Ring über `_weltLicht().at` + eigener Glanz `gelaende-fern.js:1704-1726` |
| Kamm-Krone des Rings (`gelaende-fern.js:1084`) | L | L | L | L | – | **–** (kein `foliageLeaf`, `stoff-material.js:3601`) | Laub ohne Laub-Licht |
| Haus/Studio-Stoff, Satz und Verband (`studio-stoff.js:230`) | L | L | L × Raum-Himmel `bild-sicht.js:718-721` | L `studio-stoff.js:879` | Fenster/Laterne: `lichtGlut` über `augeGlut` `stoff-material.js:2141-2145`; `aGlut` je Ecke `studio-stoff.js:724` | – | – |
| Laub Studio-Gestalt (foliage/foliageTex) | L + Laub-Licht `studio-stoff.js:887` | L | L | L, aber BRDF ohne Durchlass `stoff-material.js:2487-2505` | – | L nur am Richtlicht `stoff-instanz.js:120-130` | Pool und Sonne: zwei BRDFs |
| Rinde/Stamm | L | L | L | L | – | – | – |
| Baum-Karte/Impostor (`stoff-material.js` Karten-Zweig) | L × **Karten-Sonnen-Sicht** `stoff-material.js:1552-1566` | L | L | L `:2037` | – | L `:1787` | Z: eigene Selbst-Verschattung (Bake `stoff-karte.js:1326-1360`, `KARTE_SONNEN_SICHT` `:2076`) |
| Schatten-Zwilling Baum (`vegetation-baum.js:741`) | nur Wurf | – | – | angehängt `:743`, zeichnet nie Farbe | – | – | – |
| Gras Nah-Wiese / Nah-Streu (`studio-stoff.js:751,888`) | L × Narbe exp(−K(θ)Λ) `stoff-instanz.js:115-119` | L × aoNode = Narbe-Himmel `stoff-material.js:39` | L × Narbe | L als Volumen `stoff-material.js:2137,2457-2465`, **ohne** Narbe und Durchlass | – | L am Richtlicht | Pool ≠ Sonne am Halm |
| Gras der Ferne (`_halmFerne`, `stoff-material.js:121`; `vegetation-wiese.js:928`) | L, **Laub-Licht vermutlich verloren** (s. Bruch B7) | L | L | L (emissiveNode wird kopiert) | – | ? | Klon ohne `setupLightingModel` |
| Leib: Haut skin/haut (MeshPhysical + Klarlack, `studio-stoff.js:290-312`) | L + Klarlack | L | L | L, ohne Klarlack | **SSS-Saum als Emissiv** `studio-stoff.js:598-600` | – | Z: Look-Additiv, ohne Licht |
| Leib: Fell (Tier) | L | L | L | L | **Rim + Sheen + Sparkle als Emissiv** `studio-stoff.js:601-612` | – | Z: Wrap-Faktor auf dem Ausgang samt Pool `studio-stoff.js:656-662` |
| Leib: Haar | Kajiya-Kay `studio-stoff.js:54-88` | L | L | L, Lambert+GGX statt Kajiya | – | – | Pool ≠ Sonne |
| Wagen (Studio-Gestalt, Klarlack aus `budgetRegler`) | L + Klarlack | L | L + Spiegel-Pass | L, ohne Klarlack | Leuchten `emissiveIntensity` 0,8–1,6 `vehicle-core.js:164-186,340-341`; `seh: glut` → Quelle ohne Pool, ohne Platz | – | Leuchte strahlt kein Licht und zeigt am Tag wie nachts denselben Wert |
| Wasser (MeshBasic, `bild-sicht.js:1578`) | über `_weltLicht().at(oben, –, Sonnen-Sicht)` `bild-sicht.js:1442-1443`, **keine** Kaskade | über `at()` | eigene Sonde (32×16) statt r184-IBL; Himmel = Spiegel-Pass + `himmelFarbe` `wasser-hydro.js:813-815` | **–** | – | – | Z: Sonnen-Glanz pow(·,120)·1,35·uLight `wasser-hydro.js:819-820`, uLight ≥ 0,22 `bild-himmel.js:2566` |
| Lava-Decke (Teil des Boden-Stoffs) | wie Boden | wie Boden | wie Boden | L (eigener Platz steht flach darunter, `stoff-material.js:2472`) | `_lavaGlutNode` × `lavaGlut` `siedlung-wege.js:552-561` | – | Glut × AERIAL-Faktor |
| Feld-March (`bild-sicht.js:2151,2185`) | `at(n, p)`: nur N·L diffus, Sonnen-Sicht, keine Kaskade | `at()` | Sonde nur diffus, kein Glanz | **–** | – | **–** | Z: eigene Lichtung |
| Panorama (`bild-sicht.js:2215,2226`) | `at(vec3(0,1,0), p)` | `at()` | Sonde diffus | **–** | – | **–** | Z: Normale fest „oben“ — der Hang trägt kein Licht |
| Spiegel-Pass Feld (`bild-sicht.js:1113-1119`) | `at()` × Beer-Lambert der Krone | `at()` | Sonde | **–** | – | – | Z: eigene Krone (laubGrund/laubTiefe) |
| Rauch (`siedlung-bewohner.js:219`, Standard, transparent) | L | L | L | L `:162` als Fläche (keine Phasenfunktion) | – | – | Normale gewölbt `:262` |
| Flamme (MeshBasic, `feld-brand.js:866`) | – | – | – | – (Quelle) | Planck-Ton × `ziel`/Belichtung `feld-brand.js:896` | – | Z: **nicht** über `augeGlut` |
| Funken (MeshBasic, `kampf.js:929`) | – | – | – | – | `lichtFarbe(1900 K)` × `leucht` 4 `kampf.js:930` | – | Stellwert |
| Regen (Points, `bild-himmel.js:1040`) | – | – | – | – | Farbe `REGEN_GESETZ.farbe` unbeleuchtet | – | liest **kein** Licht |
| Wege/Zaun/Mauer-Kisten (`siedlung-wege.js:2080`) | L | L | L | L `:2082` | – | – | – |
| Gefäß (`bau-teile.js:2921`) | L | L | L | L `:2928` | – | – | – |
| Werkstatt-Vorschau (`werkstatt-vorschau.js:767`) | eigenes Rig: Ambient 0,55, Key 0,85, Fill 0,35 `:333-338` | eigenes Rig | – | L `:769` | – | – | eigene Szene |
| Kronendach-Chunk (`bild-himmel.js:573`, Flag `canopyStreaming` = false `dirigent-kern.js:364`) | L | L | L | L | – | – | Albedo roh linear 0,16 + c · 0,08 … `bild-himmel.js:566-568` |

## 1. TAFEL DER GRÖSSEN

| # | Name | Wert | Einheit | Anker | Definition | Leser | F/G |
|---|---|---|---|---|---|---|---|
| 1 | KEY_BASE | 2,6 | Stellwert | gesetzt (Ziel dir/(amb+hemi) ≈ 15:1, „Vorlage“) | `welt-licht.js:49` | `bild-himmel.js:1889` | G, ohne Anker |
| 2 | LEGACY_LICHT | π | Faktor | three r155 Konvention (1/π-BRDF) | `welt-licht.js:53` | `bild-himmel.js:1889` | G (Konvention) |
| 3 | Sonne `dl.intensity` | KEY_BASE·π·lum·tint·direkt | Welt-Einheit | Atmosphäre | `bild-himmel.js:1889` | r184 (jeder Standard-Stoff); `bild-sicht.js:2744`; `bild-himmel.js:2566` | F |
| 4 | MOND_STAERKE | 0,65 | Welt-Einheit (Skala S) | Skala S (Vollmond 0,26 lx → 0,58, `welt-licht.js:59`) | `welt-licht.js:169,207` | `bild-himmel.js:1897` | G mit Anker |
| 5 | Ambient | 0,04 · nacht | Stellwert | Bild-Messung (Stadt 00 Uhr 2,95 : 1) | `bild-himmel.js:2251` | r184; `bild-sicht.js:2746-2748`; `bild-himmel.js:2228` | G mit Anker |
| 6 | Emotions-Hub am Ambient | joy 0,08 · awe 0,05 · sorrow −0,04 | Stellwert | – | `bild-himmel.js:2252` | `_emotionModulate` | G, ohne Anker |
| 7 | Hemi-Stärke | 0,1 · nacht · lightMul | Stellwert | – („eigen getuned“) | `bild-himmel.js:2492` | r184; `bild-sicht.js:2749-2756`; `bild-himmel.js:2227` | G, ohne Anker |
| 8 | Hemi-Boden | 0x463c2e | sRGB-Hex (THREE → linear) | Vorlage phytogenesis | `bild-himmel.js:2471` | r184 Hemi; `bild-sicht.js:2752-2756` | G, ohne Anker |
| 9 | Hemi-Himmel | ATMO_GESETZ.nacht.himmel × Tönung | linear | Gesetz | `bild-himmel.js:2470` | r184 | F |
| 10 | environmentIntensity | 1 | Faktor | r184-Vorgabe | (Vendor) | `bild-sicht.js:2758,2776` | G (Konvention) |
| 11 | Studio `envMapIntensity` | mp oder 1 | Faktor | Labor-Wert | `phyto-core.js:5983` | `studio-stoff.js:343` | G, ohne Anker |
| 12 | Raum-Licht `dachMass.w` | Tageslicht-Quotient | Anteil | fachwerk `raumLicht` | `stoff-dach.js:44-50` | `bild-sicht.js:718,721` | F |
| 13 | Platz-Candela (Luma von `lichtFarbe`) | je Quelle | cd | `_strahler` / LICHT_GESETZ | `dirigent-kern.js:1756` | `stoff-material.js:2479` | F |
| 14 | AUGE.p | 0,2 | – | ln 13,1 ÷ ln 385 000 | `welt-licht.js:85` | `stoff-material.js:2364` | F |
| 15 | AUGE.q | 0,42 | – | CIE L*-Band 0,30–0,42 (Randwert) | `welt-licht.js:86` | `stoff-material.js:2363` | G mit Anker |
| 16 | AUGE.welt / AUGE.lux | 7,83 / 115 000 | Welt-Einheit / lx | Messung (werkbank) / Physik | `welt-licht.js:89-90` | `dirigent-kern.js:1619` → `lichtAuge` | F |
| 17 | AUGE.saum | 0,3 | Anteil der Reichweite | – | `welt-licht.js:92` | `stoff-material.js:2446` | G, ohne Anker |
| 18 | AUGE.eps | 0,1 | Anteil | – | `welt-licht.js:91` | `welt-licht.js:144-147` (Reichweite = `lage.w`) | G, ohne Anker |
| 19 | AUGE.anteil | 0,25 | Anteil | Messung an der Gasse | `welt-licht.js:87` | `welt-licht.js:137` | G mit Anker |
| 20 | HALM_VOLUMEN | quer 0,89 · hoch 0,34 | Anteil | gemessen an der Geometrie | `stoff-material.js:3898` | `stoff-material.js:2458-2463` | F |
| 21 | F_Schlick-Beiwerte | −5,55473 / −6,98316 | – | r184 | `stoff-material.js:2496` | ebd. | F (Vendor) |
| 22 | `lichtGlut[datum]` | augeGlut(cdM2) · Maß | Welt-Einheit | LICHT_GESETZ cdM2 | `dirigent-kern.js:1626-1631` | `stoff-material.js:2142-2144`; `studio-stoff.js:399` | F |
| 23 | `lavaGlut` | augeGlut(Ausbruch) · Maß | Welt-Einheit | Planck × Emissivität | `dirigent-kern.js:1622` | `siedlung-wege.js:560` | F |
| 24 | GLUT_BILD | c₂ 1,438777e-2; λ 611/549/464 | m·K; nm | CODATA, sRGB | `siedlung-wege.js:3035-3038` | `siedlung-wege.js:571-575` | F |
| 25 | Glimm-Achse | 0,55 · 0,6 · Boden 0,5 · ×0,6 · Deckel 1,5 | Stellwert | – | `stoff-material.js:787,794,892,899` | `stoff-material.js:893-900` | G, ohne Anker |
| 26 | Studio-Emissiv | mp.emissive × emissiveIntensity | Stellwert | Labor-Stoff | `phyto-core.js:5968,5985-5986` | `studio-stoff.js:344-347`; `koerper-leib.js:1455-1457` | G, ohne Anker |
| 27 | Studio `leucht` ohne Licht-Datum | mp.leucht | Stellwert | „Maß des Gemalten“ | `studio-stoff.js:312` | `studio-stoff.js:398` | G, ohne Anker |
| 28 | `aGlut` je Ecke (Satz) | Studio-Emissiv | Stellwert | – | `studio-stoff.js:724` | r184 Emissiv | G, ohne Anker |
| 29 | Fahrzeug-Leuchten | ei 0,9 · 1,1 · 0,85 · 0,8 · Laterne 1,0 · Lichtkante 1,6 | Stellwert | – | `vehicle-core.js:164-186,340-341` | über mp → `studio-stoff.js:344-347` | G, ohne Anker |
| 30 | Flamme `ziel` | 1,6 | Stellwert vor Tonkurve (÷ Belichtung) | – | `feld-brand.js:995` | `feld-brand.js:896` | G, ohne Anker |
| 31 | Flamme `kelvin` · Strahlung | [3000, 1700] · (K/K₀)⁴ | K | Planck-Ort, Stefan–Boltzmann | `feld-brand.js:994` | `feld-brand.js:849-850` | F |
| 32 | Flamme `schein` | 7,5 | Welt-Einheit | – | `feld-brand.js:997` | **ungelesen** (letzter Leser fiel, `dirigent-kern.js:1753`) | – |
| 33 | BRAND.licht | 4 | – | – | `feld-brand.js:964` | **ungelesen** (nur Kommentar `dirigent-kern.js:1755,1940`) | – |
| 34 | FUNKEN.leucht | 4 | Stellwert | – | `kampf.js:2684` | `kampf.js:930` | G, ohne Anker |
| 35 | HAUT_LOOK.sss | pow 3 · [1, 0,4, 0,25] · 0,05 | Emissiv-Stellwert | Bild-Messung (Kopf-Kontrast 0,61 → 0,65) | `koerper-core.js:775-780` | `studio-stoff.js:598-600` | G mit Anker |
| 36 | FELL_LOOK.koerper | Rim pow 4 ×0,5 · Sheen pow 5 ×0,15 · Sparkle 500/0,55/0,3 | Emissiv-Stellwert | „verbatim“ Labor-GLSL | `tetrapoda-core.js:3712-3729` | `studio-stoff.js:601-612` | G, ohne Anker |
| 37 | FELL_LOOK.straehne | TipRim pow 3 · Spec pow 8 ×0,4 | Emissiv-Stellwert | Labor-GLSL | `tetrapoda-core.js:3731-3738` | `studio-stoff.js:588-591` | G, ohne Anker |
| 38 | FELL wrap | 0,5 (Ausgang × (0,5 + 0,5·N·V)) | Faktor | Labor-GLSL | `tetrapoda-core.js:3721` | `studio-stoff.js:656-662` | G, ohne Anker |
| 39 | HAAR_LOOK.kk | wrap 0,5 · kd 1 · jit 0,2 · R 0,046 · p 80 · TRT 0,5/20 | – | R: Keratin-F0; Rest gesetzt | `koerper-core.js:836-843` | `studio-stoff.js:54-88` | G mit Anker (nur R) |
| 40 | LAUB_LICHT | τ 1,0/0,5 · Keule g 0,7 n 8 | – | τ: PROSPECT-D; Keule am Soll ≥ 1,3 geeicht | `phyto-core.js:6786-6791` | `stoff-instanz.js:121-130` | G mit Anker |
| 41 | Halm-Narbe K(θ), kHimmel | Campbell 1986, Monsi & Saeki | – | Literatur | phyto HALM_GESETZ (`phyto-core.js:6809ff.`) | `stoff-instanz.js:115-119`; `stoff-material.js:39,1988` | F |
| 42 | KARTE_SONNEN_SICHT | 9 Richtungen, Spannen c0 −0,5…1,5 usw. | Anteil | gebacken aus der Tiefe der Krone | `stoff-karte.js:2076-2093` | `stoff-material.js:1552-1566` | F (Richtungen gesetzt) |
| 43 | Wasser `uLight` | max(**0,22**, dl.intensity) | Welt-Einheit | – | `bild-himmel.js:2566` | `wasser-hydro.js:820`; Ring `gelaende-fern.js:1725` | G, ohne Anker (Boden) |
| 44 | WASSER_GESETZ.spec | [120, 1,35] | Exponent, Gewinn | Labor | `foundry-core.js:160` | `wasser-hydro.js:819-820` | G, ohne Anker |
| 45 | Wasser-F0 je Kanal | aus n 1,333 / Eis 1,309 (Cauchy) | – | STOFF_GESETZ | `schmiede-core.js:2889-2890` | `wasser-hydro.js:787-794` | F |
| 46 | WASSER_GESETZ.fresnel | [0,02, 0,98, 5] | – | Labor | `foundry-core.js:157` | **ungelesen** in der Welt (gesucht `WG.fresnel` in stamm/: 0 Treffer) | – |
| 47 | Wasser-Körper R∞ | 0,33·b_b/(a+b_b), b_b 0,1 | – | Gordon 1975 | `foundry-core.js:166` | `bild-sicht.js:1263` | F |
| 48 | Schaum-Farbe | [0,93, 0,96, 0,98] | linear | – | `foundry-core.js:162` | `bild-sicht.js:1265,1561` | G, ohne Anker |
| 49 | Spiegel `laubGrund` / `laubTiefe` | Wert nicht gelesen | Anteil / m | – | SPIEGEL (`bild-sicht.js:3926`) | `bild-sicht.js:1111` | ? |
| 50 | Kapsel-Rückfall-Farbe | {0,55, 0,5, 0,45} | linear | – | `dienst.js:1138` | Feld-March `bild-sicht.js:2061` | G, ohne Anker |
| 51 | Rauheit/Metall der Stoff-Zeile | STOFF_GESETZ `rauheit` (MERL), `metall` aus Bindung | GGX α=r² | MERL, Bindung | `schmiede-core.js:2853-2905` | `bau-buch.js:1594-1598` → `stoff-material.js:857-859`; `stoff-material.js:3369` | F |
| 52 | Studio-Rauheit-Vorgaben | Rinde 0,93 · Laub 0,62 · Halm HALM_GESETZ | – | – | `phyto-core.js:5973-5980` | `studio-stoff.js:258` | G, ohne Anker |
| 53 | Host-Rauheit ohne Zeile | 0,7 / Metall 0 | – | – | `stoff-material.js:858-859` | ebd. | G, ohne Anker |
| 54 | AERIAL | micro 0,14 · ao 0,38 · Deckel 0,18 | Faktor | – | `stoff-material.js:3943-3946` | `stoff-material.js:822-845` | G, ohne Anker |
| 55 | sRGB-EOTF (FARB-GESETZ) | IEC 61966-2-1 | – | Norm | `daten.js:551`, `fachwerk-core.js:2333`, `foundry-core.js:5239`, `foundry-core.js:8229`, `vehicle-core.js:289` (+ THREE ColorManagement still) | jeder Paletten-Leser | F |
| 56 | Balken-Licht-Boden | Luma ≥ 0,14 (sRGB) | – | „Michis schwarze Balken“ | `fachwerk-core.js:2330-2331` | `fachwerk-core.js:2333` | G, ohne Anker |
| 57 | Albedo-Tafel | Karte 0,18 · Toleranz 0,1 | Reflexionsgrad / ln | 18-%-Karte (Norm) | `spec/farbe/albedo-tafel.json` | `scripts/lib/albedo-tafel.cjs:232` | G mit Anker |
| 58 | Regen-Farbe | REGEN_GESETZ.farbe (Wert nicht gelesen) | Hex | – | foundry REGEN_GESETZ | `bild-himmel.js:1040` | G, ohne Anker |

## 2. DIE RECHENWEGE (je Lichtweg)

- **L1 r184-Mesh-Lichtung**: Sonne `KEY_BASE·π·lum·tint` (`bild-himmel.js:1889`) in „Welt-Einheit“ → r184 `directDiffuse = lightColor·N·L·albedo/π` + GGX, Schatten der
  CSM × Sonnen-Sicht (`dirigent-ankunft.js:424`). Ambient/Hemi (`bild-himmel.js:2251,2492`) → indirectDiffuse × aoNode. Die Umgebung
  (`himmelDerStoffe` × `_rueckstrahlHalbraum` × `_raumHimmel`, `bild-sicht.js:688,718-721`) → indirekt + Glanz. Einheit überall Welt-Einheit.
- **L2 Laub-Licht** (`stoff-instanz.js:107-131`): erweitert NUR `direct` (r184 ruft es nur für Punkt-, Spot- und Richt-Lichter der Szene,
  die Welt hat nur das Richtlicht): + lightColor · τ·max(−N·L,0)·Keule · albedo/π; die Narbe dämpft lightColor vorher.
- **L3 Haar-Licht** (`studio-stoff.js:45-90`): Kajiya-Kay je direktem Licht, Wrap 0,5; der Rest Standard.
- **L4 Pool** (`stoff-material.js:2327-2367`): Candela → E = F·N in Lux (`_lichtPlatz` `:2391-2480`, Scheibe/Punkt/Kopf/Saum) → Lambert+GGX
  (`:2487-2505`) → Summe in Lux → `zeig = S(A)·((1+E/A)^q − 1)` gedeckelt (`:2362-2364`) → ins **Emissiv** (`:2146`). Hier bricht die Einheit:
  lx → S-Skala → Welt-Einheit (× `augeMass`), dieselbe Zahl, in der die Sonne aus L1 steht.
- **L5 Welt-Licht `at()`** (`bild-sicht.js:2654-2700`): E/π = (l0c·max(N·l0d,0)·s + ambient + mix(hemiUnten, hemiOben, n.y))/π + Sonde(n) —
  nur diffus, ohne Kaskade, ohne Pool, ohne aoNode; Leser: Wasser `:1443`, Ring-Wasser `gelaende-fern.js:1720`, Feld-March `:2185`,
  Panorama `:2226` (n = oben), Spiegel `:1115,1118`.
- **L6 Wasser-Glanz** (`wasser-hydro.js:818-820`): sunCol·pow(R·V,120)·1,35·max(0,22, dl.intensity)·Sonnen-Sicht — Phong neben dem GGX der Welt.
- **L7 Karten-Sonne** (`stoff-material.js:1552-1566`): v(d) = c0 + c·d aus dem Bake (9 Richtungen, `stoff-karte.js:2076`), × receivedShadow.
- **L8 Glut über das Auge** (`dirigent-kern.js:1622-1631`): cd/m² → augeGlut = S(A+E)·E/(A+E)/π → `lichtGlut`/`lavaGlut` → Emissiv. Der Kommentar
  nennt „ZWEI Formeln an diesem Ort“ (Pool q-Gesetz vs. Glut S-Form, `welt-licht.js:133-135`).
- **L9 Flammen-Ton** (`feld-brand.js:849-850,896`): Planck-Ort · (K/K₀)⁴ als 8-Bit-Tafel · `ziel` 1,6 ÷ toneMappingExposure → `_nachtAuge`. Kein augeGlut.
- **L10 roher Emissiv-Stellwert**: Glimmen (`stoff-material.js:892-900`), Studio-emissive (`studio-stoff.js:344-347`), `leucht` ohne Datum (`:398`),
  `aGlut` (`:724`), Fahrzeug-Leuchten, Funken (`kampf.js:930`), MeshBasic-Brücke `leucht = 1` (`koerper-leib.js:1463-1467`).
- **L11 Look-Additive** (`studio-stoff.js:487-612`): Rim/SSS/Sheen/Sparkle/TipRim/Spec aus N·V als Emissiv — ohne Lichtquelle.
- **L12 Post-Faktoren**: AERIAL `outputNode` (`stoff-material.js:838-845`) und Fell-Wrap (`studio-stoff.js:656-662`) multiplizieren den
  FERTIGEN Ausgang samt Emissiv (Pool, Glut).
- **L13 Unbeleuchtet**: Regen (`bild-himmel.js:1040`), Schatten-Quads und Marker (MeshBasic in `bau-teile.js:2286,2340,2388,2449`).

## 3. ZWILLINGE UND BRÜCHE

- **B1 Emission ohne Einheit, fünf Wege neben dem EINEN Glut-Weg (L8)**: L9, L10, L11. Haut und Fell leuchten aus N·V im Schatten und nachts
  (der Kern sagt es selbst: „leuchtet im Schatten wie in der Sonne“, `koerper-core.js:777`); F6 strich dasselbe Band an den Host-Stoffen
  (`stoff-material.js:813-819`), an der Studio-Gestalt steht es. Fahrzeug-Leuchten (`vehicle-core.js:164-186`) zeigen am Mittag wie um Mitternacht
  denselben Wert und tragen keinen Pool-Platz (`seh: glut` → `stoff-material.js:2122-2124`).
- **B2 Der Pool rechnet eine andere BRDF als die Sonne** (`_punktLichtBrdf` Lambert+GGX, `stoff-material.js:2487-2505`): ohne Durchlass (Laub, Halm,
  Karte), ohne Narbe (Halm), ohne Kajiya (Haar), ohne Klarlack (Haut, Lack). Und **der Pool fehlt** in L5: Wasser, Ring-Wasser, Feld,
  Panorama und Spiegel-Feld bleiben unter jeder Laterne dunkel.
- **B3 Wasser rechnet sein Licht selbst**: Glanz-Phong mit Labor-Reglern (`foundry-core.js:160`) und dem **Boden 0,22** an der Licht-Stärke
  (`bild-himmel.js:2566`); keine Kaskade (nur Horizont × Wolke, `bild-sicht.js:1442`). Ein Labor-Zwilling `WASSER_GESETZ.fresnel`
  (`foundry-core.js:157`) steht ungelesen neben dem F0 aus STOFF_GESETZ.
- **B4 Panorama: die Normale steht fest oben** (`bild-sicht.js:2226`), der Feld-March liest die wahre (`:2185`), der Ring die Masche (`stoff-material.js:1904-1906`):
  drei Normalen für EINEN Boden jenseits 8 km; der Kommentar `stoff-material.js:1880` behauptet „dieselbe Physik“.
- **B5 Karten-Sonne**: eigene Selbst-Verschattung aus 9 Richtungen ab 15° Höhe (`stoff-karte.js:2077-2087`); eine tiefere Sonne oder der Mond wird
  linear extrapoliert und auf [0,1] geklemmt (`stoff-material.js:1565`). Sie gilt nur für das Richtlicht, nie für den Pool.
- **B6 Albedo nicht in Reflexionsgraden geeicht**: die Albedo-Tafel misst nur Labor ↔ Welt (Soll = ln(1 + 0,1), `scripts/lib/albedo-tafel.cjs:232`), keine Zeile
  trägt ein Natur-Band (13 Zeilen, `birke`/`fichte` ohne Ist; `spec/farbe/albedo-tafel.json`). Die Karte 0,18 eicht die Belichtung, nicht
  den Stoff. STOFF_GESETZ hat keine Albedo-Spalte (`schmiede-core.js:2911`). Rinde und Fachwerk liegen „roh im Band“ (`foundry-core.js:5236`).
  Der Balken-Boden 0,14 hebt dunkles Holz vor der Dekodierung an (`fachwerk-core.js:2330`). **Fünf** sRGB-Dekodierer (Größe 55), dazu die stille THREE-Wandlung (Rauch `0x8d8881`, Hemi-Boden).
- **B7 Gras der Ferne verliert vermutlich das Laub-Licht**: `_halmFerne` klont den Halm (`stoff-material.js:121`); r184 `NodeMaterial.copy`
  (vendor/three.webgpu.min.js) kopiert die Plätze `…Node`, nicht die Instanz-Funktionen `setupLightingModel`/`customProgramCacheKey`, die
  `_laubLichtStoff` setzt (`stoff-instanz.js:65,95`). So gelesen in der Quelle, nicht im Bild geprüft.
- **B8 Rauheit aus zwei Quellen**: STOFF_GESETZ (Werk-Stoff, `bau-buch.js:1594`) neben den Studio-Vorgaben 0,93/0,62 (`phyto-core.js:5973-5980`) und 0,7 (`stoff-material.js:858`).
- **B9 Post-Faktoren auf dem Licht**: AERIAL × Kavität (`stoff-material.js:838-845`) und Fell-Wrap (`studio-stoff.js:661`) skalieren Pool und Glut mit.
- **B10 Fail-soft-Farbe**: Feld-Kapsel `{0,55, 0,5, 0,45}`, wenn `def.farbe` fehlt (`dienst.js:1138`); die Farbe reist 8 Bit **linear** (`dienst.js:1140-1143`)
  — dunkles Laub (0,01) landet auf 3/255.
- **B11 Drei Uniforms für dieselbe Richtung**: `windUniforms.uSunDir` (`bild-himmel.js:1910`), `hydroSurfaceUniforms.sunDir` (`:2572`) und `weltLicht.l0d`
  (`bild-sicht.js:2739-2742`). Jede hat einen eigenen Schreib-Ort; die Quelle ist dieselbe.
- **B12 Klammern im Lichtweg**: `max(0,22, …)` Wasser; Glimmen `min(1,5, …)`; der Deckel `min(S(A+E)·E/(A+E))` im Pool (`stoff-material.js:2364`);
  Karten-Sicht `clamp(0,1)`; AO `clamp(0, aoCap)` (`stoff-material.js:837`); Hemi-Boden-Aura `min(1, …)` (`bild-himmel.js:2479-2486`, hinter auraK = 0 aus).
- **B13 Kronendach** hinter Flag (`dirigent-kern.js:364`) mit roher linearer Albedo (`bild-himmel.js:566-568`): ein Zwilling bleibt im Code.

## 4. ZAHLEN

- Getrennte Lichtwege der Stoffe: **13** (L1–L13).
- Größen in der Tafel: **58**.
- Davon FOLGT: **18**; GESETZT mit Anker (Norm, Messung, Konvention): **10**; **GESETZT ohne Anker: 26**; ungelesen: **3** (#32, #33, #46);
  Wert nicht gelesen: 1 (#49).
- Programme in der Matrix: 27. Davon lesen den Pool 19; der Schatten-Zwilling trägt ihn dazu, zeichnet aber nie Farbe. Kein Pool in Wasser,
  Feld, Panorama, Spiegel, Flamme, Funken und Regen (7).

## 5. NICHT GELESEN — ÜBERGABEN

Nicht gelesen: `stoff-material.js:994-1835` (Geologie-Albedo, `_terrainGeologyAlbedo`, `_substanceCharacter`); `stoff-gang.js`, `studio-glieder.js`,
`studio-bruecke.js`; `welt-licht.js:1202-1478` (die Bühne der Studios) nur überflogen; die Labore `worlds/*`; der Wert von `BLATT_UNTERSEITE`
(`stoff-instanz.js:41`); `REGEN_GESETZ.farbe`; SPIEGEL `laubGrund`/`laubTiefe`; NAESSE/Lagarde (`stoff-material.js:2160-2248`) nur am Rand.
Übergaben: Belichtung/AUGE → `welt-licht.js:84-147,743-790`; Sonne/Mond-Stärke → `bild-himmel.js:1880-1898`; Quellen/Strahler →
`dirigent-kern.js:1600-1760`; Himmel/PMREM → `bild-himmel.js:694-727`, `welt-licht.js:921-948`; Nacht-Auge → `_nachtAuge` (bild-kosten);
Luft → `bild-himmel.js:2440-2460`; Farb-Paletten der Kerne → `foundry-core.js:80`, `vehicle-core.js:271-289`, `porta-core.js:285`.
