# (h) Studios und Prüfbühnen: rechnen sie das Licht der Welt oder einen Zwilling?

Stand: Zweig `strahler-leuchte` = 2ce8a033d, nur gelesen. Alle Pfade sind relativ zu C:\AnazhRealm.

## 0. Die Matrix: Studio × (Renderer · Licht · Belichtung · Tonkurve · Stoff)

W = Welt (dieselbe Funktion bzw. dasselbe Objekt wie im Spiel), Z = Zwilling (eigene Rechnung oder eigene Zahlen), H = Hybrid (Zahlen der Welt in einer eigenen Rechnung), — = kein 3D-Licht.

| Studio | Renderer | Licht | Belichtung | Tonkurve | Stoff | Beleg |
|---|---|---|---|---|---|---|
| garage | W: r184 WebGPU über `AnazhHuelle.buehne` | W: `__weltLicht.buehne`, nur am Tag | W- (ohne Becken und Raum, siehe Bruch 3.3) | W Neutral | **Z**: `VC.materials()` / `VC.lackStoff` (vehicle-core), MeshStandard am Boden | garage.js:24-27, 48, 77-80; welt-licht.js:1202-1375 |
| schmiede | W (wie garage) | W | W- | W | **Z**: `matCol` MeshStandardMaterial, Hex-Farben | schmiede.js:17-18, 25, 105, 435 |
| gelaende | W: das Spiel selbst (`index.html?studio=gelaende`) | W | W | W | W | gelaende/studio.js:1-13; index.html:10091 |
| fachwerk | **Z**: r128 `WebGLRenderer` | **Z/H**: Sonne + Hemi + Ambient aus `ZEIT_GESETZ` (4 gesetzte Tageszeiten); Herd, Fenster und Laterne über das Auge der Welt (`augeLux`, `augeGlut`, `augeZeig`) | **Z** 1,12 | **Z** ACES | **Z**: `FC.materials()` (r128, fachwerk-core) + 19 MeshLambert | fachwerk.js:22, 637-669; fachwerk-core.js:11383-11393 |
| portale | **Z** r128 | **Z**: Hemi 0,6 · Key 3,0 · Rim 2,0 · Punktlicht `GLUT_GESETZ` | **Z** 1,1 | **Z** ACES + Bloom/FXAA/Cine | **Z**: GLSL-Membran, Stein per onBeforeCompile | porta.js:49, 140-150, 175-184 |
| terrain | **Z** r128 | **H**: Farbe und Luminanz der Sonne aus `ATMO_RECHNUNG.sonne` (Kern der Welt), dazu eigene Basen (3,13/2,65), eigene Sonnenbahn, Hemi + Rim + Fill + Back | **Z** 1,0 | **Z** ACES + Bloom | **Z**: GLSL für Wasser (`WASSER_GESETZ.fresnel`), Gelände, Impostor und Himmel | phytogenesis.js:455, 531-579, 626, 1906-1990, 2279, 3338-3498 |
| koerperstudio | **Z** r128 | **Z**: Hemi 0,6 · Key 3,0 · Rim 2,0 (gleiche Zahlen wie portale) | **Z** 1,0 | **Z** ACES + Bloom | **Z**: foundry-core-Guss (r128) + GLSL Haut/Haar/Gewebe | koerperstudio.js:83, 113-125, 245-254 |
| tetrapoda | **Z** r128 | **Z**: Hemi 0,45 · Key 3,5 · Rim 1,4 · Fill 0,7 · Back 0,5 | **Z** 1,25 | **Z** ACES + Bloom | **Z**: GLSL Fell (onBeforeCompile) | tetrapoda.js:70-80, 186-191 |
| translated | **Z** r130 | **Z**: Dir 1 · Hemi 0,7 | keine (Vorgabe) | keine (NoToneMapping) | **Z** Lambert | translated.js:98-107; index.html:58-60 |
| fluid | **Z**: eigenes three-Modul (lib/three.module.min.js) | — (2D-Strömung, ShaderMaterial) | — | — | — | fluid.js:34, 67 |
| klang · begegnung · schwarm | — (Canvas 2D) | — | — | — | — | klang.js:2651; begegnung/index.html:71; schwarm/index.html:126 |
| skeleton | — (DOM, kein THREE) | — | — | — | — | skeleton.js:35 |
| neuntes-buch | — (nur Kern `stele-core.js`) | — | — | — | — | — |
| huelle (Panorama-Backen) | Renderer des Studios | Licht des Studios | — | **NoToneMapping** beim Backen | Stoff des Studios | huelle.js:1462-1500 |

**Wie die Skill-Aussage steht** (SKILL.md:28-30, gleichlautend huelle.js:2087): „portale · fachwerk · terrain · koerperstudio · tetrapoda zeichnen r128 mit eigenem Licht": **belegt** (Zeilen oben). Dazu kommen zwei, die der Satz nicht nennt: translated (r130, ohne Tonkurve) und fluid (eigenes three-Modul).
„Ein GLSL-Zwilling des Welt-Stoffs (Stein, Membran, Fell, Haar, Laub)": Stein porta.js:49, Membran porta.js:140-150, Fell tetrapoda.js:76, Haar koerperstudio.js:119 sind **belegt**. Laub ist nur indirekt belegt: das Impostor-ShaderMaterial in phytogenesis.js:2279; ein eigener Laub-onBeforeCompile wurde nicht gefunden (gesucht: onBeforeCompile in phytogenesis.js, Treffer nur :1906 Gelände und :1957 Wasser).
„Kein Studio ruft `werk` (der Stoff der Welt läuft in 0 von 7)": **belegt und strenger**. `B.werk` (huelle.js:2434) ruft kein Studio auf; die einzigen Rufer sind Linsen (scripts/diag-blick.cjs:246, scripts/diag-studio-uebergabe.cjs:30). garage ruft nur `werkSteht` (garage.js:710). Auch auf der Bühne der Welt zeichnen garage und schmiede also eigene Stoffe. Der Stoff der Welt läuft in 0 von 9 Studios mit 3D-Bild; nur gelaende hat ihn, weil gelaende das Spiel selbst ist.

## 1. Tafel der Größen (Licht der Studios)

F = FOLGT (hergeleitet), G = GESETZT ohne Anker, A = gesetzt mit Anker (Norm oder Messung).
Leser: wo nichts anderes steht, ist es die Zeile selbst (der Renderer liest das Licht bzw. den Wert, den er setzt).

### Die Bühne der Welt (garage, schmiede)
| # | Name | Wert | Einheit | Anker | Definition | Leser | Art |
|---|---|---|---|---|---|---|---|
| B1 | KEY_BASE | 2,6 | Stellwert (Welt-Einheiten) | Kommentar: „aus dem r128-Studio kopierte Rig-Werte" | welt-licht.js:47-49 | `e0` :810, buehne :1225, `belichtungAnker` :783 | G |
| B2 | LEGACY_LICHT | π | Faktor | Physik: die 1/π-Normierung der BRDF zwischen r128 und r184 | welt-licht.js:53 | e0, belichtungAnker; fachwerk.js:652 | F |
| B3 | Stärke und Farbe der Sonne | E0 · a.lum, a.col | Welt-Einheiten | Durchlass über `ATMO_RECHNUNG.sonne` | welt-licht.js:1250, 1301-1303 | buehneZeichnet :1404; huelle.js `zielen` :2287 | F |
| B4 | Stunden der Bühne | Vorgabe 0,5; früh und spät bei Sonne 15° | Uhr 0..1 bzw. Grad | — | huelle.js:2273, 2307-2313 | lichtAn huelle.js:2302 | G (15°) |
| B5 | Auge der Luft hKm | 0,001 | km | „Bezug der Luft" | welt-licht.js:1224 | U.hKm, AR.sonne :1250 | G |
| B6 | zielKarte | 0,22 | k·L | Neutral legt die 18-%-Karte auf sRGB 118 (`kartenEichung`) | welt-licht.js:175 | belichtung :773 | F |
| B7 | steigung / gleitung / stufen / min | 0,75 / [12, 8] / [[10, −0,87], [−20, −2,17]] / 0,05 | Stufen, Grad | Kommentar „Frostbite: Kompensation", keine Messung genannt | welt-licht.js:176-179 | belichtungStufen :743; bild-himmel.js:2037 | G |
| B8 | Tonkurve | NeutralToneMapping | — | Norm (Khronos PBR Neutral) | welt-licht.js:174 | buehne :1305; buehneZeichnet :1406 | A |
| B9 | GLANZ_RAUHEIT | [0,25, 0,45] | Rauheit | — | welt-licht.js:978 | BuehnenUmgebung :1289 | G |
| B10 | ATMO_BODEN (Boden der Werkbank) | [0,1003, 0,1385, 0,0449] | Albedo, linear | „gemessene Welt-Albedo" | welt-licht.js:39 | garage.js:48; schmiede.js:25; buehne :1213 | A |

### fachwerk (r128)
| # | Name | Wert | Einheit | Anker | Definition | Leser | Art |
|---|---|---|---|---|---|---|---|
| F1 | toneMappingExposure | 1,12 | Stellwert | — | fachwerk.js:640 | Renderer | G |
| F2 | Tonkurve | ACES | — | Wahl, weicht von der Welt (Neutral) ab | fachwerk.js:640 | Renderer | G |
| F3 | ZEIT_GESETZ i / h / a | z. B. Mittag 2,1 / 0,62 / 0,22 (4 Stunden, also 12 Zahlen) | r128-Legacy-Intensität | „Feel-Entscheid .228" | fachwerk-core.js:11383-11388 | setZeit fachwerk.js:659 | G |
| F4 | ZEIT_GESETZ c / bg / p | Farben, Hintergrund, Sonnenposition | Hex, m | — | fachwerk-core.js:11384-11387 | fachwerk.js:659 | G |
| F5 | Ersatz-Literale für ZEIT | dieselben 24 Werte noch einmal | — | fail-soft, ein Zwilling der Tafel | fachwerk.js:654-657 | `_zeitPart` :650 | G |
| F6 | Hemi-Farben | 0xbcd2f0 / 0x4d4636 | Hex | — | fachwerk.js:646 | Renderer | G |
| F7 | Nebel | 55–150 | m | — | fachwerk.js:641 | Renderer | G |
| F8 | Lux des Labors | augeLux(AUGE.welt · Σ(i+h+a) / Σ_Mittag) | lx (aus einer Summe von Legacy-Intensitäten) | — | fachwerk.js:660 | `_feuerLab`, `augeGlut` :660-667 | F (aus G; die Einheit bricht) |
| F9 | Boden der Feuer-Reichweite | max(R, 2,5) | m | — | fachwerk.js:652 | fire.distance | G |
| F10 | Stärke des Herdfeuers | augeZeig(cd/(4+k²), lux) / LEGACY_LICHT / (1−2/R)^abfall | Legacy-Intensität | `FC.strahler` | fachwerk.js:652 | fire.intensity | F (auf 2 m geeicht) |
| F11 | Glut von Fenster und Laterne | augeGlut(cdM2, lux) / Luma der Farbe | Emissiv | LICHT_GESETZ.cdM2 | fachwerk.js:661-667 | Glas-Stoffe | F |
| F12 | Boden | 0x4a5238, Rauheit 1 | Hex | weicht von ATMO_BODEN ab | fachwerk.js:669 | Renderer | G |

### portale (r128)
| # | Name | Wert | Anker | Definition | Art |
|---|---|---|---|---|---|
| P1 | Belichtung | 1,1 | — | porta.js:175 | G |
| P2 | Tonkurve | ACES | — | porta.js:175 | G |
| P3 | Hemi | 0xffffff / 0x444444 · 0,6 | — | porta.js:177 | G |
| P4 | Key | 0xffe0b0 · 3,0, Position (5, 8, 5) | — | porta.js:178 | G |
| P5 | Rim | 0x33aaff · 2,0 | — | porta.js:179 | G |
| P6 | Umgebung | Canvas-Verlauf #aabbcc / #333 / #050505 → PMREM | — | porta.js:176 | G |
| P7 | Punktlicht des Portals | GLUT_GESETZ i0 0,3 · dist 14 · decay 2, dazu fail-soft-Literale | porta-core | porta.js:180-181 | G |
| P8 | Post | Bloom 0,24 / 0,5 / 1,05 · FXAA · Cine (Vignette, Korn) | — | porta.js:182-185 | G |
| P9 | Fresnel der Membran | FI.fresnel (Daten geteilt mit der Welt) | Anker nicht gelesen | porta.js:149; Welt siedlung-tor.js:304 | dieselben Zahlen, zweimal gerechnet (GLSL / TSL) |

### koerperstudio (r128)
K1 Belichtung 1,0 · K2 ACES · K3 Hemi 0,6 · K4 Key 0xffe0b0 3,0 · K5 Rim 0x33aaff 2,0 · K6 Canvas-Umgebung (derselbe Verlauf wie P6) · K7 Bloom 0,3 / 0,4 / 0,9 (koerperstudio.js:83, 246, 251-254): alle **G**. Das Rig ist Zahl für Zahl das von portale.
K8 Klarlack der Haut: `HL.clearcoat` (HAUT_LOOK) aus koerper-core, koerperstudio.js:115. Dieselbe Quelle liest auch der Welt-Stoff (studio-stoff.js:296); die Zahl ist geteilt, der Shader zweimal geschrieben.

### tetrapoda (r128)
T1 Belichtung 1,25 · T2 ACES · T3 Hemi 0xffeecc / 0x332211 0,45 · T4 Key 0xffd8a0 3,5 · T5 Rim 0x5588ff 1,4 · T6 Fill 0xaa7744 0,7 · T7 Back 0xff8833 0,5 · T8 Canvas-Umgebung #ccaa88 · T9 Bloom 0,35 / 0,4 / 0,85 (tetrapoda.js:186-191): alle **G**.

### terrain (r128)
| # | Name | Wert | Definition | Art |
|---|---|---|---|---|
| R1 | Belichtung | 1,0 | phytogenesis.js:537 | G |
| R2 | Tonkurve | ACES | :536 | G |
| R3 | Umgebung | Canvas #cfe0d6 / #5a6b5e / #0a0f0a | :541-553 | G |
| R4 | Basis der Sonne | 3,13 (Wald) / 2,65 × atm.lum × WX_LICHT | :3487 | G |
| R5 | Hemi | 0,78 · (0,1 + 0,9 lum) · (1 + 0,35 grey) · (0,25 im Wald) | :3490 | G |
| R6–R8 | Rim / Fill / Back | 1,25 / 0,62 / 0,52 × lum | :3496-3498 | G |
| R9 | Boden der Umgebungs-Dimmung | clamp(0,06 + 0,94 lum / lumZenit, 0,06, 1) | :3450 | G |
| R10 | Sonnenbahn | eigene Bahn (sr / ss, lift = max(e, 0,1)), nicht `sonnenRichtung` der Welt | :3440-3448 | G (ein Zeitplan) |
| R11 | Farbe und Luminanz der Sonne | `ATMO_RECHNUNG.sonne` (derselbe Kern wie die Welt) | :3338-3342 | F |
| R12 | Hemi beim Albedo-Backen | 1,05 | :267 | G |
| R13 | Impostor-Sonne ×0,46, Streulicht-Boden 0,06 + 0,3 lum | „kalibriert gegen das reale Rig" | :3515-3519 | G |
| R14 | WASSER_GESETZ.fresnel | [0,02, 0,98, 5] | foundry-core.js:157, gelesen in :1985 | A (f0 von Wasser, Exponent nach Schlick) |
| R15 | WASSER licht / spec / spiegel.dim | [0,86, 0,18, 0,08] / [120, 1,35] / 0,68 | foundry-core.js:158-160 | G |
| R16 | Bloom, feste Sonne | 0,18 / 0,5 / 0,9; Key 3,05 / 2,4, Hemi 0,5 | :626, 2895-2896, 2991-2992 | G |

### translated (r130)
X1 Dir 0xffffff · 1 · X2 Hemi 0xbfd0ff / 0x404048 · 0,7 · X3 keine Tonkurve und keine Belichtung (translated.js:103-107): alle **G**.

### huelle (Panorama)
Y1 NoToneMapping beim Backen, sechs 256²-Ziele in HalfFloat (huelle.js:1462-1500): **F**, ein lineares Ziel. Sie liest das Licht des jeweiligen Studios.

## 2. Die Rechenwege

1. **Bühne der Welt** (garage, schmiede): `AnazhHuelle.buehne` (huelle.js:2265) → `__weltLicht.buehne` (welt-licht.js:1202).
   - Die Tafeln der einen Atmosphäre und die Sonne E0 · Durchlass rechnen in Welt-Einheiten (E0 = 2,6 π).
   - Die Belichtung ist `belichtung(E, Anker, e)` (:1371). E ist die waagrechte Bestrahlung aus Sonne und Tafel, ebenfalls in Welt-Einheiten; der Anker sitzt auf der Zenit-Sonne.
   - Die Tonkurve ist Neutral.
   - Die Treue prüft jedes Bild (`buehneZeichnet` :1392): kein fremdes Licht, keine envMap, Belichtung und Sonne identisch.
   - Wo die Einheit bricht: E0 hat keine Lux-Einheit. Lux entsteht erst im Auge (`augeLux`, AUGE.welt 7,83 ↔ 115 000 lx), und das Auge ruft die Bühne nicht.
2. **fachwerk**: `ZEIT_GESETZ` (r128-Legacy-Intensität, gesetzt) → Sonne, Hemi und Ambient.
   - Für das Herdfeuer wird aus der Summe i+h+a eine Lux-Zahl: lux = augeLux(7,83 · Σ / Σ_Mittag) (fachwerk.js:660).
   - Daraus folgen `augeZeig` und `augeGlut` (welt-licht) für Herd, Fenster und Laterne.
   - Das Feuer läuft als PointLight im r128-Legacy-Abfall (1−d/R)^abfall. Es wird über ÷ LEGACY_LICHT ÷ (1−2/R)^abfall nur bei 2 m auf das Gesetz geeicht (:652).
   - Bild: ACES 1,12.
   - Wo die Einheit bricht: Legacy-Intensität → Verhältnis → „Welt-Einheit" → Lux. Das ist eine Skala ohne Messung.
3. **portale / koerperstudio / tetrapoda**: feste Rigs (Hemi, Key, Rim, bei tetrapoda auch Fill und Back) in r128-Legacy-Intensität, dazu ein Canvas-Verlauf als PMREM-Umgebung. Danach ACES mit 1,1 / 1,0 / 1,25, dann Bloom, FXAA und Cine. Keine Stufe trägt eine physikalische Einheit.
4. **terrain**:
   - `ATMO_RECHNUNG.sonne` (Kern der Welt) liefert col und lum, dimensionslos als Durchlass.
   - Das Licht entsteht aus lum × gesetzten Basen (3,13 / 2,65; 0,78; 1,25; 0,62; 0,52) in Legacy-Intensität, auf einer eigenen Sonnenbahn.
   - Bild: ACES 1,0. Wasser: Schlick mit f0 0,02 im GLSL (:1985).
   - Wo die Einheit bricht: der Durchlass der Welt geht in gesetzte r128-Basen.
5. **translated**: Dir 1 + Hemi 0,7 in Lambert, ohne Tonkurve.
6. **Panorama → Tor der Welt**: Das Studio-Bild wird mit dem Renderer des Studios gebacken, NoToneMapping, linear in HalfFloat (huelle.js:1462-1500), in die Datei `worlds/<id>/panorama.f16` geschrieben und in tor-ziele.json gestempelt. Die Tor-Membran der Welt liest es (porta.js:145 `uPano`; Welt siedlung-tor.js). So reist das r128-Rig eines Studios in das Bild der Welt.
7. **Linse S0 Feuerkreis** (diag-pruefbuehne.cjs:906-944): Die Linse vergleicht drei Schüsse:
   - mit Feuer,
   - ohne Feuer,
   - einen Eich-Schuss mit der Candela aus `FG.strahler` (:202-216).
   Gerechnet wird linear in der Ausgabe, je Schuss ÷ k. Das Urteil ist relativ, Bild gegen Bild.
8. **Linse Tag-Achse** (licht-linsen.cjs:1078-1289): Sie macht je Uhr einen Schuss und rechnet Y, X (durch die Umkehr von Neutral :1097) und EV gegen Mittag. Die REF-Stufen kommen aus spec/farbe/tag-ref.json.

## 3. Zwillinge und Brüche beim Namen

1. **Sechs Licht-Zwillinge mit eigener Engine**: fachwerk, portale, terrain, koerperstudio, tetrapoda (r128) und translated (r130); Zeilen in der Matrix.
   - Vier verschiedene Belichtungen (1,0 / 1,1 / 1,12 / 1,25), ACES statt Neutral, eine Ausnahme ganz ohne Tonkurve.
   - portale und koerperstudio tragen dasselbe Rig, kopiert (porta.js:177-179 = koerperstudio.js:251-253).
   - Ihr Bild geht über panorama.f16 in die Tore der Welt (huelle.js:1462-1500, worlds/tor-ziele.json:7-47).
2. **Der Stoff ist auch auf der Bühne ein Zwilling**: garage zeichnet `VC.lackStoff` / `VC.materials()` (garage.js:77-80), schmiede `matCol` (schmiede.js:105).
   - Der Welt-Stoff `_foundryTreeMaterial` (stamm/studio-stoff.js:230) entsteht nur über `B.werk` (huelle.js:2434), und das ruft kein Studio.
   - Die Treue `buehneZeichnet` prüft Licht und envMap, nicht den Stoff (welt-licht.js:1396-1404).
3. **Die Belichtung der Bühne ist ein vereinfachter Zwilling der Welt-Belichtung.**
   - Bühne: `belichtung(E, A.belichtung, s[1])` mit den Vorgabe-Stufen (welt-licht.js:1371).
   - Welt: `_belichtungAusLicht` (stamm/bild-himmel.js:1945-1975) liest zusätzlich das Becken (`augeMesser`, :1957-1959) und den Raum (`_raumStufen`, :1973-1974).
   - Die Bühne trägt die Nacht nicht, sie bricht laut (welt-licht.js:1215-1221); das ist eine benannte Grenze, kein stiller Rückfall.
4. **Fresnel des Wassers, zwei Rechnungen**:
   - Terrain-GLSL: f0 0,02 gesetzt (`WASSER_GESETZ.fresnel`, foundry-core.js:157, phytogenesis.js:1985).
   - Welt: F0 je Kanal aus n(λ) nach Cauchy (stamm/wasser-hydro.js:782-795). Der Kommentar dort nennt die 0,02 „bis w28", trotzdem liest das Studio sie weiter.
5. **Himmel-Zwilling im terrain**: eigenes `skyMat` ShaderMaterial (phytogenesis.js:455), eigene Sonnenbahn (:3440-3448). Die Welt hat `himmelSicht` und `sonnenRichtung`.
6. **fail-soft im Lichtweg**:
   - fachwerk `_zeitPart` mit 24 Ersatz-Literalen (fachwerk.js:650-657).
   - portale `GLUT_GESETZ` mit Literalen (porta.js:180-181, Kommentar „fail-soft Literale").
   - fachwerk `EXPL_FALLBACK` (:684, kein Licht).
7. **Klammern und Böden im Lichtweg**:
   - fachwerk: `fire.distance = max(R, 2,5)` (fachwerk.js:652).
   - terrain: clamp 0,06 … 1 der Umgebung (:3450), lift max(e, 0,1) (:3446).
   - welt-licht: `belichtung` max(B.min …) und Boden `nachtKnotenE` (welt-licht.js:772-773).
8. **Zeitplan statt Gesetz**: fachwerk ZEIT_GESETZ (vier Stunden als Daten, fachwerk-core.js:11383); terrain Sonnenbahn (R10).
9. **Konstante ohne Anker als Wurzel der Welt-Sonne**: KEY_BASE 2,6, laut Kommentar „aus dem r128-Studio kopierte Rig-Werte" (welt-licht.js:47-49). Die Sonne der Welt ist in einem Studio-Rig geeicht.
10. **Die Linsen prüfen Verdrahtung, nicht das Gesetz**:
    - **Tag-Achse REF**: die Spalte `stufen` in tag-ref.json ist `BELICHTUNG` selbst, angewandt auf die USNO-Lux. Der Selbsttest verlangt das: `_belichtungStufen` muss sie auf ±0,005 treffen (licht-linsen.cjs:1324-1329). REF prüft also die Szene gegen die Kamera-Kurve der Welt; unabhängig ist nur die Lux-Spalte.
    - **S0 Messer**: `kGesetz` (diag-pruefbuehne.cjs:1642-1653) setzt `_belichtungAusLicht` aus denselben Gliedern nach (`augeZeig`, `augeLux`, `augeMass`, `belichtung`, `_belichtungStufen`, `_belichtungAnker`); dasselbe gilt für tagKurve `gesetz` (licht-linsen.cjs:1109-1115). Das prüft nur, ob das Becken gelesen wird.
    - **S0 Eich-Schuss**: die Candela kommt aus `FG.strahler` (diag-pruefbuehne.cjs:210), derselben Funktion, die der Wirt `_strahler` hat (stamm/dirigent-kern.js:1756); unabhängig ist das Bild-gegen-Bild.
    - **S0 Laterne und Fenster** (:449, 471-472) mit `augeReichweite` / `augeGlut` sowie **N7 / L5** (diag-stand-takt.cjs:1219-1232, 1293-1302): jedes Soll wird „zur Laufzeit aus dem Gesetz" gerechnet, mit denselben Funktionen, Toleranz 0,001.
    - **gate:studio-huelle H9** = `buehneZeichnet`: eine Wand der Identität, gewollt.
    - **Unabhängig sind**: `kartenEichung` (eigene ACES- und Neutral-Formel, licht-linsen.cjs:2826-2846), die Umkehr `vor` (:1097, eine zweite Form von Neutral in derselben Datei), S0_TON (Pixel-Farbton gegen 28–45°), S0_NACHT und TAG ANKER (Luma der 18-%-Karte).
11. **Ungelesen**: der Kopf von diag-pruefbuehne.cjs:21 nennt „Bestrahlung in 2 m ≥ 2× die Nacht". Ein Leser oder eine Konstante dafür wurde nicht gefunden (gesucht: `S0_NACHT_MAL`, `nachtMal`, `>= 2 *`). Die Prüfung ist dort durch das Gesetz (`S0_KREIS`) ersetzt, der Kommentar :193-194 blieb ohne Zeile.

### Soll-Zahlen der Linsen
| Linse | Zahl | Anker | Definition |
|---|---|---|---|
| S0_KREIS.gesetz | 0,15 | G | diag-pruefbuehne.cjs:923 |
| S0_KREIS.platz | 0,2 | A: das Flackern `flacker.amp` 0,18 | :223, 923 |
| S0_KREIS.kontrast | 1,5 | G (gemessen am Kopf 1,57) | :923 |
| S0_TON.hue | 28–45° | 28: A (1 800 K → 29,6° in sRGB); 45: G | :959 |
| S0_TON.satMax | 0,75 | G („Wand", K66) | :959 |
| S0_NACHT luma / schwarz | 22 / 0,05 | G | :1229 |
| S0_MESSER.ev | 0,02 EV | G (Toleranz) | :1236 |
| S0_MESSER.ueberLux | 2 157 lx | A: Messung an der Mess-Wiese | :1236 |
| S0_LICHT_M | 10 m | G | :195 |
| TAG_SOLL.karte | Luma 110–130 | A: Mittelgrau sRGB 118 | licht-linsen.cjs:1216 |
| TAG_SOLL sprung / buckel / gold / warm / nacht / nachtLuma / ref / async / messer | 0,1 / 0,15 / −1…−0,5 / 1,3 / −5…−3 EV / 22 / 0,3 / 0,05 / 0,02 | G | :1216 |
| tag-ref.json lux | 123 790 … 0,397 lx | A: USNO Circular 171 / Brown 1952 | spec/farbe/tag-ref.json:2-24 |
| tag-ref.json stufen | 0 … −2,17 | F, zirkulär: aus BELICHTUNG | ebd.; geprüft licht-linsen.cjs:1324-1329 |
| N7 candelaAbw / Band / UHR | 0,001 / ±1 % / ±2 % | G (Toleranz) | diag-stand-takt.cjs:1227-1258 |
| L5 kern / FARBE / KEULE-Nachbar | ±0,4 m / ±25 K / 0,6 m | G | diag-stand-takt.cjs:1298-1302 |

## 4. Zahlen der Domäne

- **Getrennte Lichtwege: 8.** Das sind die Bühne der Welt, die sechs eigenen Rigs (fachwerk, portale, terrain, koerperstudio, tetrapoda, translated) und die Panorama-Brücke in die Tore. fluid ist ohne Licht; gelaende ist der Weg der Welt.
- **Größen der Studio-Lichter: 68** (Tafel 1: Bühne 10, fachwerk 12, portale 9, koerperstudio 8, tetrapoda 9, terrain 16, translated 3, huelle 1).
- **Davon GESETZT ohne Anker: 55** (Bühne 5, fachwerk 9, portale 8, koerperstudio 7, tetrapoda 9, terrain 14, translated 3).
- **Soll-Zahlen der Linsen: 29.** Davon 23 gesetzt, 5 mit Anker und 1 zirkulär.
- **Linsen-Urteile, die dieselbe Funktion wie der Wirt rufen** (nur Verdrahtung): 7 von 11 gelesenen (S0 Messer, S0 Eich-Candela, S0 Laterne, S0 Fenster, Tag MESSER, Tag REF, N7/L5). Unabhängig sind 4 (S0 Ton, S0 Nacht, Tag ANKER, kartenEichung).

## 5. Nicht gelesen und Übergaben

Nicht gelesen:
- diag-albedo-tafel.cjs nur der Kopf (:1-60): sie vergleicht die Albedo unter weißem Licht, also den Stoff, nicht das Licht.
- scripts/lib/albedo-tafel.cjs.
- licht-linsen.cjs `albedoSicht`, `lichtBilanz` (ab :805), `nahFernSicht`, `laubGegenlicht`, `luftTiefe`, `naesseSicht`, `kontaktSicht`.
- werkbank.cjs `/licht` (:3147ff), außer den Rufern.
- diag-stand-takt.cjs außer N7 und L5.
- diag-studio-huelle.cjs außer H5 und H9.
- porta-core.js `FILM`/FI (die Anker des Membran-Fresnel).
- foundry-core-Stoffe (13 Bauer) und vehicle-core `materials()`.
- klang.js-Canvas.

Übergaben:
- **Welt-Licht / Kamera**: KEY_BASE als Anker der Sonne aus einem r128-Rig (welt-licht.js:47-49); BELICHTUNG stufen, steigung und gleitung ohne Messung (welt-licht.js:176-179).
- **Stoff**: `_foundryTreeMaterial` (stamm/studio-stoff.js:230) gegen vehicle-core `lackStoff` (vehicle-core.js:311) und `materials()` (:70): welchen Stoff zeichnet die Welt am Wagen? Gesucht wurde `__lack` in stamm; ohne Treffer.
- **Tor / Portal**: panorama.f16 (Rig des Studios, linear) in der Membran der Welt (stamm/siedlung-tor.js:304; worlds/tor-ziele.json).
- **Wasser**: `WASSER_GESETZ.fresnel` / `licht` / `spec` gegen `_wasserOptik` (stamm/wasser-hydro.js:782-868).
- **Leuchtquellen**: `STRAHLER.emissiv.flamme` 0,0012, auf 250 cd geeicht, und `LICHT_GESETZ.feuer.cdM2` 10 000 gesetzt (fachwerk-core.js:6527-6529).
