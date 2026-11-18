# Lesen (e) PFLANZEN — Zensus der Kopplung, Code am b7ed841 (bis HEAD 856fa1f5 nur `vision/kopplung/` geändert), koordination 9102d555

Die Pflanzen sind im Code keine Simulation, sondern drei Funktionen der Saat plus eine Liste von Taten: das gefrorene Rauschen
`lebendig` (`worldFieldAt`, stamm/feld-leben.js:1793), die Bild-Gesetze der Bodenschicht (foundry-core `groundCover`, die Nah-Wiese
stamm/vegetation-wiese.js:108, die Nah-Streu :1294, die Streu-Regionen phyto-core.js:7027, der Wald phyto-core.js:2788/3047) und die
Taten `worldMeta.taten` (stamm/feld-leben.js:2626), aus denen Narbe, Asche und Sukzession als Funktion der Welt-Stunde folgen. Kein
Takt lässt eine Pflanze wachsen; es tickt nur der Nachwuchs der Taten (`_tickScatterRegrow`, stamm/vegetation-wiese.js:2226) und der
Brand (`_tickBrand`, stamm/feld-brand.js:470). Die Uhr ist die Welt-Uhr: 1 Welt-Stunde = 150 s `spielZeit` (`PEGEL_TAG_S` 3 600 s,
stamm/daten.js:165; `_weltStunde` stamm/feld-leben.js:2619).

## 1. Die Antworten in Kürze

- **Liest das Feuer Vegetation als Brennstoff? Teilweise, aus drei verschiedenen Quellen.** Die ART des Betts liest es aus dem Bild:
  „gras“, wo der Grün-Kanal der Boden-Karte ≥ 0,5 ist, „laub“, wo die Kronen-Streu der stehenden Kronen ≥ 0,5 ist
  (stamm/gelaende-kollision.js:1130–1132 über stamm/feld-brand.js:244–245). Die LAST liest es aus `lebendig`
  (stamm/feld-brand.js:222, :302 `w0 = last × min(1, leb)`), und das ist das Saat-Rauschen λ 200 m plus Leben-Overlay minus
  Narbe (stamm/feld-leben.js:1874), nicht die Gras-Bedeckung, die der Spieler sieht. Alles Übrige steht fest in der Anderson-Zeile
  (Last, Tiefe, σ, Heizwert, mx: stamm/bau-vorlagen.js:1646–1649). Die Tiefe des Gras-Betts ist `GRASS_BLADE_H` 0,42 m
  (stamm/stoff-material.js:3827) und nicht die Halm-Höhe des Studios.
- **Wächst Vegetation nach? Ja, als Funktion einer Tat, ohne Wetter.** Die Asche jeder ausgebrannten Zelle wird als Tat `brand`
  geschrieben (stamm/feld-brand.js:575). Ihre Dauer ist 72 h / max(0,1; Wuchs) (stamm/feld-leben.js:3102,
  stamm/vegetation-wiese.js:2215–2219). Den Wuchs misst die Tat EINMAL beim Schreiben (stamm/feld-brand.js:563,
  stamm/vegetation-wiese.js:2217). Die Sukzession geht Asche → Gras (Rest 0,08–0,3) → Busch (0,3–0,6) → Wald (0,6–1)
  (stamm/vegetation-wiese.js:3185–3194). Auf offener, trockener Wiese ist der Wuchs 0,75, die Dauer also 96 Welt-Stunden = 14 400 s
  Welt-Uhr ≈ 4 h Spiel. Das Gras ist nach 28,8 Welt-Stunden ≈ 72 min Spiel zurück.
- **Bild:** Die Halme fallen, wo Asche liegt (`_wieseGrund` × (1 − Asche), stamm/vegetation-wiese.js:783), und tragen im Saum einen
  versengten Ton (stamm/vegetation-wiese.js:184–188). Die Asche liegt als Kanal G der Boden-Decke im Fenster der Wege-Karte (512 m
  nah / 2 048 m fern, stamm/siedlung-wege.js:2922–2923). Die Kräuter der Nah-Streu kommen erst mit dem Busch zurück
  (stamm/vegetation-wiese.js:1387, :2188). Die Bäume des Walds verschwinden und kehren als Jungwuchs wieder
  (`_baumAlter` stamm/vegetation-wiese.js:2198 → stamm/vegetation-baum.js:1203–1208). Verkohlte Stämme gibt es nicht
  (grep `verkohl|charred`: 0 Treffer).
- **Boot und Delta:** Die Vegetation ist eine Funktion von Saat, Hydrosphäre und Kern-Gesetzen. Der veränderliche Teil sind NUR die
  Taten. Sie reisen im worldMeta, tragen `h`, den gemessenen Wuchs `w` und die Bett-Maske `bett` (stamm/feld-brand.js:563–575) und
  fallen geheilt aus der Liste (stamm/vegetation-wiese.js:2269). Danach ist die Welt wieder bootgleich. Das Feld des Brands und das
  Leben-Overlay werden NICHT gespeichert (stamm/feld-brand.js:203–204, stamm/feld-leben.js:2025).
- **Wetter:** Die Pflanzen lesen weder Regen-Nässe noch Temperatur noch Jahreszeit. Die Jahreszeit ist für sie reine Farbe
  (stamm/bild-himmel.js:891–924). Regen erreicht sie nur am Wasser: über den Pegel des Spiegels in `_feuchteAt`
  (stamm/gelaende-boden.js:1554 → stamm/wasser-hydro.js:57/79).

## 2. DIE GRÖSSEN

| Name | Einheit | Wert/Bereich | Anker | Schreiber | Leser | FOLGT / GESETZT |
|---|---|---|---|---|---|---|
| `lebendig` (Substrat) | Stellwert ohne Einheit | [0, 1]; Probe: p05 0,159 · p50 0,499 · p95 0,84 | Simplex `seed-veg-lebendig`, λ 200 m, Warp 40 m (stamm/feld-leben.js:1800, :1828, :2972, :2979) | keiner (Funktion der Saat) | `auraAt` stamm/feld-leben.js:1874 → Brand-Last stamm/feld-brand.js:222/302; Streu-Dichte phyto-core.js:7003/7065 über stamm/vegetation-streu.js:20; `_terrainMaterialAt` stamm/vegetation-wiese.js:2370; Affinität :2335 | FOLGT der Saat (Rauschen, keine Physik); λ GESETZT („Erst-Wurf genese-plan §Γ3“, :2971) |
| Leben-Overlay `lifeField.a` | Stellwert ohne Einheit | [−1, 0,7], Zerfall 0,008/s, Puls 0,25/0,1 | stamm/feld-leben.js:3077–3091 | `_depositLife` stamm/feld-leben.js:2047: der Fraß stamm/kreatur-leben.js:2195 (negativ), die Geburt :2437, der Feld-Akt stamm/feld-leben.js:2316 | `auraAt` :1854/:1874 (→ Brand-Last); `_lebenStufe` :2350 → Nah-Streu stamm/vegetation-wiese.js:1339 (phyto-core `bodenGewicht`) | GESETZT (Konstanten); wird nicht gespeichert (:2025) |
| Narbe `_narbeAt` | Stellwert ohne Einheit | [0, 0,6]; Brand tiefe 0,3 | `TAT_NARBE` stamm/feld-leben.js:3098–3107 | Taten (`_tatSchreiben` :2626) | `auraAt` :1856/:1874 | GESETZT |
| Heil-Dauer einer Tat `brand` | Welt-Stunden (h) | 72 / max(0,1; w); offene Wiese 96 h = 14 400 s | stamm/feld-leben.js:3102, stamm/vegetation-wiese.js:2215–2219 | `_tatIndex` stamm/feld-leben.js:2668 | `_sukzession` stamm/vegetation-wiese.js:2122, `_narbeAt`, `_naehrstoffAt`, `_tickScatterRegrow` :2253 | GESETZT (72 h) |
| Wuchs `w` | Stellwert ohne Einheit | (0,75 + 0,25·Feuchte) · Monod(N) · Licht · ort.decke; offene Wiese 0,75 | stamm/vegetation-wiese.js:2078–2089; `WUCHS` :3174 | einmal je Tat (stamm/feld-brand.js:563, stamm/vegetation-wiese.js:2217), dann eingefroren | `_tatDauer` :2218 | FOLGT (Wasser × Licht × Nährstoff); `wasserBasis` 0,75 GESETZT („der Regen allein“, :3169) |
| Nährstoff N | Stellwert ohne Einheit | [0, 1,6]; Asche +0,4, Fällen −0,3 | stamm/vegetation-wiese.js:2097–2109; `TAT_NARBE.naehr` | Taten | `_wuchsAt` :2082 | Form FOLGT (Monod), Beträge GESETZT |
| Sukzession asche/busch/wald/stubben | Stellwert ohne Einheit | Rampen [0,08–0,3] · [0,3–0,6] · [0,6–1], Achtel; Jugend [0,06; 0,18; 0,4; 0,7] | stamm/vegetation-wiese.js:2120–2135, :3185–3194 | keiner (f(Tat, Welt-Stunde)) | `_brandZelle` stamm/feld-brand.js:70; `_streuNachBrand` stamm/vegetation-wiese.js:2190; `_baumAlter` :2207 | GESETZT |
| Asche (Boden-Decke, Kanal G) | Stellwert ohne Einheit | Byte/255; Texel 0,5 m (Fenster 512 m) und 2 m (2 048 m) | stamm/feld-brand.js:3–7, :173–181; stamm/siedlung-wege.js:2922–2923 | `_ascheFlaeche` stamm/feld-brand.js:179 (aus `_brandMalen` :146 und `_sukzessionMalen` stamm/vegetation-wiese.js:2168) | `_wieseGrund` stamm/vegetation-wiese.js:783; versengter Halm :184; Boden-Stoff stamm/stoff-material.js:3121–3124 | FOLGT (Narbe × Sukzession) |
| Gras-Bedeckung (Wurf-Chance eines Büschels) | Stellwert ohne Einheit | [0, 1], Raster 0,72 m | `p = groundCover(L, m, rk).grass × wieseGrund` stamm/vegetation-wiese.js:172; foundry-core.js:3138–3154 | keiner (Funktion, Kachel-Neubau) | das Bild (Nah-Wiese, Ferne), die Mahd | FOLGT (Licht × Feuchte × Hang); Beiwerte 1,08/0,85/0,22 GESETZT |
| Grün-Kanal der Boden-Karte `gruen` | Stellwert ohne Einheit | [0, 1]; null ohne gebauten Chunk | stamm/gelaende-boden.js:94–116 (`gruenMap` aus dem Voxel-Faden, stamm/gelaende-chunks.js:67) | voxel-worker (Chunk-Bau, nicht gelesen) | Brennstoff-Art „gras“ stamm/gelaende-kollision.js:1132; `_wieseGrund` stamm/vegetation-wiese.js:781 | nicht bestimmt (Herkunft im Faden nicht gelesen) |
| Kronen-Streu `summe` | Stellwert ohne Einheit | 0 offen · 0,6 unter einer Krone · 1 geschlossen; nur im Fenster der Wege-Karte | stamm/siedlung-wege.js:417–423 | das Kronen-Register (`_kronenStreuNeu` stamm/vegetation-streu.js:675, die Wald-Bäume) | Brennstoff-Art „laub“ stamm/gelaende-kollision.js:1130; Boden, Klang | FOLGT (aus den stehenden Kronen) |
| Bodenlicht L (stehende Kronen) | Stellwert ohne Einheit | exp(−0,85 · Σ Deckung) | stamm/vegetation-wiese.js:43–73; `UNDERGROWTH` :3239–3243 | keiner | Gras-Wurf :167; Nah-Streu :1334; Wuchs :2086 | FOLGT (phytogenesis `canopyLight`) |
| Kronenlicht der Platzierung `_canopyLightAt` | Stellwert ohne Einheit | exp(−0,85 · clump·wet·hoch·wald) | stamm/vegetation-wiese.js:2490–2517 | keiner | Strauch-Teppich stamm/vegetation-baum.js:1343 | FOLGT der Saat und der Hydrosphäre; `PLACEMENT_DENSITY` GESETZT |
| Wald-Bestandsdichte `sd` | Stellwert ohne Einheit | [0, 1], fbm-Oktaven λ ≈ 71 m und 26 m | phyto-core.js:2788–2810, :2907 | keiner | `forestGeburt` :2814, Darts `planForestCell`, Fern-Krone `forestKronenDeckung` :2974 | FOLGT der Saat (Rauschen) |
| Streu-Dichte (Schichten tree/under) | Stellwert ohne Einheit | `floor + lebendig × 1,5` (× fdScale × klima), höchstens 0,95 | phyto-core.js:7057–7066; `SCATTER` stamm/siedlung-instanz.js:1246–1306 | keiner | `_streuWurf` stamm/vegetation-streu.js:620 | FOLGT der Saat (`lebendig` gefroren) |
| Baum-Alter `_baumAlter` | Stellwert ohne Einheit | 0 · Jugend-Stufen · 1 | stamm/vegetation-wiese.js:2198–2209 | keiner (f(Taten)) | stamm/vegetation-baum.js:1203, :1275; stamm/vegetation-streu.js:630; stamm/feld-leben.js:2712 | FOLGT (Sukzession) |
| Boden-Feuchte `_feuchteAt` | Stellwert ohne Einheit | [0, 1]: Fluss-Nähe und Höhe über dem Spiegel samt Pegel | stamm/gelaende-boden.js:1538–1563; `FEUCHTE` :3220 | keiner (f(Hydrosphäre, Pegel)) | Gras-Wurf stamm/vegetation-wiese.js:164; Nah-Streu :1324; Wuchs :2081; Wald-Nische phyto-core.js:3055; Streu-Felder :7002; Brand stamm/feld-brand.js:268 | FOLGT (Hydrosphäre; der Regen über `_pegelTafel` stamm/wasser-hydro.js:79) |
| Brennstoff-Last `last` | kg/m² | Gras 0,166 · Laub 0,654 (× min(1, lebendig)) | stamm/bau-vorlagen.js:1647–1648 (Anderson 1982 FM1/FM9) | keiner | stamm/feld-brand.js:302, :437 | GESETZT (Literatur) × Saat-Rauschen |
| Brennstoff-Tiefe `tiefe` | m | Gras 0,42 (`GRASS_BLADE_H`) · Laub 0,061 | stamm/stoff-material.js:3827; stamm/bau-vorlagen.js:1647–1648 | keiner | stamm/feld-brand.js:302, :329 | GESETZT; liest nicht die Halm-Höhe des Studios |
| σ des Betts | 1/m | Gras 11 483 · Laub 8 202 | stamm/bau-vorlagen.js:1647–1648 | keiner | stamm/feld-brand.js:302 ff. | GESETZT (Anderson) |
| Heizwert | J/kg | 18 608 000 | stamm/bau-vorlagen.js:1647–1648 | keiner | stamm/feld-brand.js:313, :437 | GESETZT (8 000 Btu/lb) |
| Erlöschungs-Feuchte `mx` | kg/kg | Gras 0,12 · Laub 0,25 | stamm/bau-vorlagen.js:1647–1648 | keiner | stamm/feld-brand.js:310, :423, :510 | GESETZT (Anderson) |
| Partikel-Dichte ρ | kg/m³ | Gras 350 · Laub 300 | schmiede-core.js:2907, :2901 | keiner | stamm/feld-brand.js:303 (β) | GESETZT; ohne Anker im Code — Rothermel 1972 setzt 32 lb/ft³ ≈ 513 kg/m³ |
| Feuchte des toten Fein-Brennstoffs M | kg/kg | 0,06 + 0,29·Boden + 2,5·Nässe | stamm/feld-brand.js:282–285, :975 | keiner | stamm/feld-brand.js:307, :509 | Boden und Nässe FOLGT; `trocken` 0,06 GESETZT (ohne Temperatur, Luftfeuchte, Saison, Tage ohne Regen) |
| Saison-Tönung `uSeasonMul` / Laub-Präsenz `uLaubPraesenz` | Stellwert ohne Einheit | Phase des Jahrs (Jahr 2 400 s) | stamm/bild-himmel.js:891–924, :933 | `_tickSeason` | nur das Bild | FOLGT der Welt-Uhr |
| Vergilben der Wiese (`wiesenTint` alter) | Stellwert ohne Einheit | höchstens 0,45 der Büschel, tr = Licht·(1 − Feuchte) | foundry-core.js:3099–3101 | keiner | nur das Bild | FOLGT (Licht × Feuchte), nicht der Zeit |
| Wuchs des Orts `ort.wuchs` (decke · wald · laub · nadel · oase) | Stellwert ohne Einheit | [0, 1], Heimat 1 | gelaende-core.js:5735–5752 | `ortGesetz` (Reise) | `_wuchsAt` stamm/vegetation-wiese.js:2087; Streu phyto-core.js:7037; Nah-Streu stamm/vegetation-wiese.js:1347; Wald phyto-core.js:3079 | FOLGT (Klima: Frost, Erdzeit, Wasser-Bilanz) — statisch je Ort |
| `BRAND.minStoff` | Stellwert ohne Einheit | 0,15 (Probe: 4,42 % der Zellen darunter) | stamm/feld-brand.js:900 | keiner | stamm/feld-brand.js:224 | GESETZT |

Zählung: **28 Größen**. Davon folgen 15 (4 nur aus dem Rauschen der Saat: `lebendig`, Kronenlicht der Platzierung, Bestandsdichte
`sd`, Streu-Dichte), 12 sind GESETZT und 1 ist nicht bestimmt (der Grün-Kanal). 20 tragen keine Einheit.
Es FEHLT als Größe: die Feuchte des lebenden Brennstoffs und sein Vergilben über das Jahr. Es gibt keine Zeile, die Gras im Spätsommer
trockener macht.

## 3. DIE FLÜSSE

| von (Pflanzen) | an | Leser datei:zeile |
|---|---|---|
| `lebendig` (Substrat + Overlay − Narbe) → Last des Betts | Feuer | stamm/feld-brand.js:222, :302, :437 |
| `lebendig` < 0,15 → kein Bett | Feuer | stamm/feld-brand.js:224 |
| Grün-Kanal ≥ 0,5 → Bett „gras“ | Feuer | stamm/gelaende-kollision.js:1132 → stamm/feld-brand.js:244 |
| Kronen-Streu ≥ 0,5 → Bett „laub“ | Feuer | stamm/gelaende-kollision.js:1130 → stamm/feld-brand.js:244 |
| Tat `brand` in der Zelle → kein Bett, bis sie GANZ heilt | Feuer | stamm/feld-brand.js:217 |
| Asche-Tat → Nährstoff +0,4 → schnellerer Wuchs späterer Taten | Pflanzen | stamm/vegetation-wiese.js:2106 |
| Narbe/Sukzession → Asche, Halme, Kräuter, Wald | Bild | stamm/feld-brand.js:177; stamm/vegetation-wiese.js:783, :1387; stamm/vegetation-baum.js:1203 |
| Wiese/Laub als Stoff unter dem Fuß | Klang, Rad, Huf | stamm/gelaende-kollision.js:1119–1120 (Leser `_schrittMaterialAt`, `_kreaturStossSchritt`) |
| `lebendig` → das Wohl des Orts | Nexus, Gemüt | stamm/feld-leben.js:1890–1892 |

Herein:

| von | an Pflanzen | Leser datei:zeile |
|---|---|---|
| Wasser: Boden-Feuchte (Fluss-Nähe, Höhe über dem Spiegel samt Pegel) | Gras-Wurf, Nah-Streu, Wuchs, Wald-Nische, Streu | stamm/vegetation-wiese.js:164, :1324, :2081; phyto-core.js:3055, :7002 |
| Wetter (Regen-Pegel, Schmelze) → Spiegel → Boden-Feuchte | dieselben, nur am Wasser | stamm/wasser-hydro.js:79–116 → stamm/gelaende-boden.js:1554 |
| Tiere: Fraß (negatives Overlay) | Brand-Last, Nah-Streu | stamm/kreatur-leben.js:2195 → stamm/feld-leben.js:1874; stamm/vegetation-wiese.js:1339 |
| Klima des Orts (Reise) | Wuchs, Streu, Wald | gelaende-core.js:5735 → stamm/vegetation-wiese.js:2087, :1347; phyto-core.js:7037, :3079 |
| Uhr: Welt-Stunde | Sukzession, Narbe, Nachwuchs | stamm/feld-leben.js:2619 → stamm/vegetation-wiese.js:2123, :2226 |
| Jahreszeit | nur Farbe und Laub-Fall im Bild | stamm/bild-himmel.js:916–918 |

**Die Kopplungen, die FEHLEN:**
- Die Nässe des Regens (`state.naesse`, geschrieben stamm/bild-himmel.js:3080) schreibt keine Boden-Feuchte, die der Wuchs liest.
  `_wuchsAt` liest `_feuchteAt` (stamm/vegetation-wiese.js:2081), und der Wuchs einer Tat ist ab ihrem Schreiben eingefroren (:2217).
  Regen nach einem Brand beschleunigt den Nachwuchs also nicht.
- Temperatur und Jahreszeit erreichen den Wuchs nicht. Der Code sagt das selbst: „die Tag-Achse kennt keine Saison“
  (stamm/vegetation-wiese.js:2073). `_temperaturAt` nennt als Leser nur Grillen, Esse, Lava und Zünd-Wärme (stamm/bild-himmel.js:2869–2870).
- Jahreszeit und Dürre erreichen den Brennstoff nicht. `BRAND.feuchte.trocken` 0,06 gilt jeden Tag (stamm/feld-brand.js:975).
  Die Dürre (`_regenMittel`) liest nur der Pegel (stamm/wasser-hydro.js:87).
- Der Fraß senkt die Brand-Last und die Kräuter, aber nicht die Halme der Nah-Wiese: `groundCover` liest kein `lebendig`
  (stamm/vegetation-wiese.js:172).
- Kraut, Strauch und Busch der Nah-Streu brennen nicht. „kraut“ trägt keine `brenn`-Zeile (stamm/bau-vorlagen.js:1646–1649), und
  `_kontaktStoffAt` nennt es nie. Kronen brennen nicht: es gibt kein Kronenfeuer, der Baum fällt nur über die Tat.
- Die Streu-Schicht „under“ (64–384 m, `promotable: false`, stamm/siedlung-instanz.js:1280–1290) fragt weder Narbe noch Alter
  (stamm/vegetation-streu.js:630 fragt nur `promotable`). Die Fern-Krone `forestKronenDeckung` (phyto-core.js:2974) liest keinen Brand.
  In stamm/gelaende-fern.js gibt es keinen Leser für `_ascheAt`, `kronen.asche`, `brandFeld` oder `_brandNarbe`.

## 4. DIE BRÜCHE

1. **Zwilling „wie viel Gras steht hier“, drei Quellen.** Die Last des Brands kommt aus `lebendig`, dem Saat-Rauschen λ 200 m
   (stamm/feld-brand.js:222/302). Die sichtbare Bedeckung ist `groundCover(L, m, rk).grass × wieseGrund`
   (stamm/vegetation-wiese.js:172). Die Art des Betts ist der Grün-Kanal ≥ 0,5 (stamm/gelaende-kollision.js:1132). Eine dicht
   gezeichnete Wiese mit `lebendig` 0,16 brennt mit 16 % Last. Eine kahle Stelle mit Grün 0,5 und `lebendig` 0,9 brennt voll.
2. **Zwilling `lebendig`, zwei Zustände unter einem Namen.** Die Streu liest das gefrorene `worldFieldAt`
   (stamm/vegetation-streu.js:20 → phyto-core.js:7065), der Brand `auraAt` = Substrat + Overlay − Narbe (stamm/feld-leben.js:1874).
3. **Zwilling Wald-Dichte.** Der Wald-Generator pflanzt nach `sd` (fbm, phyto-core.js:2788). Die Baum-Schicht der Streu setzt nach
   `lebendig` (phyto-core.js:7065). Der Code bestätigt beide Quellen (stamm/siedlung-wege.js:121).
4. **Zwilling Bodenlicht.** Es gibt `_bodenLichtFeld` (stehende Kronen, stamm/vegetation-wiese.js:43) und `_canopyLightAt`
   (Treiber der Platzierung, :2490; Leser stamm/vegetation-baum.js:1343). Der Zwilling ist benannt in `UNDERGROWTH` (:3234–3238).
5. **Bild ≠ Brennstoff nach dem Brand.** Das Gras steht ab Rest 0,3 wieder im Bild (`SUKZESSION.asche`,
   stamm/vegetation-wiese.js:3188). Der Brand verweigert die Zelle aber bis zur vollen Heilung (stamm/feld-brand.js:217). Das sind
   70 % der Dauer, auf offener Wiese 67 Welt-Stunden ≈ 2,8 h Spiel, in denen sichtbares Gras unbrennbar ist.
6. **Der Brennstoff hängt am Fenster des Auges.** Die Art des Betts liest `_bodenSichtAt`. Das ist null ohne gebauten Chunk
   (stamm/gelaende-boden.js:108), und dann fällt die Zelle auf `_terrainMaterialAt`, das nie „gras“ oder „laub“ liefert
   (stamm/vegetation-wiese.js:2362–2400). Die Laubstreu liest das Fenster der Wege-Karte und ist außerhalb davon 0
   (stamm/siedlung-wege.js:421–440, Fenster 2 048 m). Die Brennbarkeit einer Zelle ist damit eine Funktion des Bild-Caches und
   nicht der Welt.
7. **Eingefrorener Wuchs.** `w` wird beim Schreiben der Tat gemessen und reist mit ihr (stamm/vegetation-wiese.js:2211–2219).
   Spätere Feuchte, ein späterer Pegel oder ein späteres Licht ändern die Heilung nicht.
8. **Tiefe des Betts ≠ Halm.** `GRASS_BLADE_H` 0,42 m (stamm/stoff-material.js:3827) hat genau einen Leser, die BRENN-Zeile
   (stamm/bau-vorlagen.js:1647). Die gezeichnete Halm-Höhe (Studio-Vorlage, `HALM_GESETZ` phyto-core.js:6846) liest der Brand nicht.
9. **Konstanten ohne Anker:** Gras ρ 350 kg/m³ (schmiede-core.js:2907; Rothermel ≈ 513), `WUCHS.wasserBasis` 0,75 (gesetzt gegen
   eine Linse, stamm/vegetation-wiese.js:3169–3171), `TAT_NARBE.brand` 72 h · tiefe 0,3 · naehr 0,4 (stamm/feld-leben.js:3102),
   `SUKZESSION`-Rampen (stamm/vegetation-wiese.js:3188–3193), `minStoff` 0,15 (stamm/feld-brand.js:900),
   `FIELD_CHARACTER.lambdaLebendig` 200 („Erst-Wurf“, stamm/feld-leben.js:2971).
10. **Tote Wirkung:** Die Narbe der Brand-Tat senkt `lebendig` (tiefe 0,3), aber der Brand liest die vernarbte Zelle nie
    (stamm/feld-brand.js:217 kehrt vorher zurück). Für das Feuer wirkt die Narbe nur über Fällen, Ernte und Riss.
11. **Probe: Tempo der Front aus der Last** (echte `_brandTempo`, Zeilen wie in stamm/bau-vorlagen.js, M 0,06, eben, 20 °C).
    Gras ohne Wind: R 0,028–0,041 m/s bei `lebendig` 0,15–1, also 391–575 s je 16-m-Zelle. Bei 3 m/s: 0,053–0,207 m/s
    (78–303 s). Bei 6 m/s: 0,053–0,74 m/s (22–303 s). Laub: 0,0064–0,05 m/s. Unter Wind hängt das Tempo stark an der
    Rausch-Last (×3,9 bei 3 m/s, ×14 bei 6 m/s), weil die Wind-Kappe `min(0,9·IR, u)` (stamm/feld-brand.js:330) bei kleiner Last
    greift. Ohne Wind braucht die Front 7–10 min je Zelle. Das passt zum FUND `same.kopplung.kaskade#1` „trocken brennt nach 60 s
    EINE Zelle (Soll ≥ 200)“ (koordination LAGE.md:136, am 18058dba), solange Wind und Last klein sind. Am Kopf gemessen ist das
    nicht, siehe §6. Die Sprosse `same.physik.feuer` S2 schreibt „Front mit Wind und Hang 0,5–2 m/s“. Als Front-Tempo gelesen
    erreicht die Probe das nur bei 6 m/s Wind und `lebendig` ≥ 0,5 (0,526–0,74 m/s). Bei 3 m/s und dem Median `lebendig` 0,5
    liegt sie bei 0,202 m/s.
12. **Stale Anker in meisterkarte-2.** `same.physik.feuer` belegt mit „stamm/feld-leben.js:2477-2620“ (MEISTERKARTE-2.md:4223).
    Dort steht heute der Lava-Index (stamm/feld-leben.js:2477–2480); der Brand liegt in stamm/feld-brand.js:214–339 und :470.
    `leben.oeko.stoffe` belegt mit „stamm/feld-leben.js:3736“ (MEISTERKARTE-2.md:1533), aber die Datei hat 3 139 Zeilen. Der
    Nährstoff steht in `TAT_NARBE` stamm/feld-leben.js:3098–3107.

## 5. Sprossen aus meisterkarte-2

Gelesen aus `origin/koordination:vision/MEISTERKARTE-2.md` (9102d555). Kopie im Scratchpad unter `pflanzen/mk2.md`. Alle
Sprossen unten stehen HEUTE 0. Die alten Namen, die der Code zitiert, gehören so zu den neuen: stoffe.K2/K3 → `same.physik.feuer`;
stoffe.K5 → `leben.oeko.sukzession`, `leben.oeko.stoffe` und `same.kopplung.stoerung`; feld.K1 → `same.kopplung.kaskade`;
vegetation.K5 → `leben.pflanzen.jahreslauf`; vegetation.K3 → `leben.pflanzen.lebenslauf`.

| Sprosse (MEISTERKARTE-2.md) | Soll | Was der Code dazu trägt |
|---|---|---|
| `same.physik.feuer` S1 (:4229) | Fackel an trockenes/nasses Gras: zündet / zündet nicht | M = 0,06 + 0,29·Boden + 2,5·Nässe gegen mx 0,12 (stamm/feld-brand.js:282–285, :509–510). Die Fackel ist nicht gelesen. |
| `same.physik.feuer` S2 (:4230) | Front mit Wind und Hang 0,5–2 m/s; Halt an nassem Gras; Regen löscht | Probe: Gras 0,028–0,74 m/s, im Band nur bei 6 m/s und `lebendig` ≥ 0,5 (§4.11). Die Last ist Rauschen (Bruch 1). |
| `same.physik.feuer` S4 (:4232) | 1 km² Wald: Boden → Krone, Funkenflug | Fehlt: Busch und Krone tragen kein `brenn` (stamm/bau-vorlagen.js:1646–1649); kein Kronenfeuer. |
| `same.physik.feuer` S7 (:4235) | Rate aus Klima; das Ökosystem liest die Asche | Die Asche liest es (Sukzession, stamm/vegetation-wiese.js:2120). Eine Rate aus dem Klima fehlt: `trocken` ist konstant (stamm/feld-brand.js:975). |
| `leben.oeko.sukzession` S1 (:1519) | Brand-Zellen ums Dorf: Asche → Gras → Busch → Wald, Asche düngt; Halm-, Asche- und Sämling-Zahlen im Fenster | Die Mechanik steht (stamm/vegetation-wiese.js:2120–2135, :2106). Das Bild antwortet in Halm, Kraut, Wald und Boden, aber nicht in der Streu „under“ und nicht in der Fern-Krone (§3). |
| `leben.oeko.sukzession` S2 (:1520) | 1 km² Waldbrand aus Brennstoff und Wind, Inseln Überlebender | Fehlt: der Brennstoff ist Bild-Fenster und Rauschen (Bruch 1, 6); kein Kronenfeuer. |
| `same.kopplung.stoerung` S2 (:5279) | 1 Spieljahr: Nachwuchs auf Asche, r(Tempo, Feuchte × Licht) ≥ 0,5 | Das Tempo ist w/72 h mit w = Feuchte × Licht × N × decke, EINMAL beim Schreiben gemessen (Bruch 7). Das r folgt aus der Formel; später fallender Regen wirkt nicht. |
| `same.kopplung.kaskade` S1/S2 (:5221–5222) | Regen löscht Brand; Regen → Nässe → Stoff → Brand → Licht | Regen → Nässe → Feuchte des Betts liest das Feuer (stamm/feld-brand.js:284). Das Glied „Regen → Pflanze“ fehlt (§3). FUND #1 am 18058dba: nach 60 s EINE Zelle (LAGE.md:136). |
| `leben.pflanzen.jahreslauf` S1 ◐ (:1155) | Krone Winter ≤ 0,3 × Sommer, Wiese ≤ 0,5 × Sommer | Nur im Bild (uSeasonMul, uLaubPraesenz, stamm/bild-himmel.js:916–918). Brennstoff und Wuchs lesen die Jahreszeit nicht. |
| `leben.pflanzen.lebenslauf` S4/S6 (:1139, :1141) | Rückkehr nach 50 Jahren: der gewachsene Wald; der Zustand ist eine Funktion der Zeit | Eine Funktion der Zeit gibt es nur für eine Tat (Sukzession aus `tat.h` und Welt-Stunde). Ohne Tat ist die Vegetation zeitlos: Saat, Hydrosphäre, Ort. |
| `same.kopplung.kohaerenz` S2 (:5242) | Relief → Wasser → Feuchte → Pflanze; die Pflanzen-Dichte fällt monoton mit dem Abstand zum Wasser | Der Gras-Wurf liest Feuchte (Gewicht 0,22, foundry-core.js:3138–3154), ebenso die Wald-Nische (phyto-core.js:3055). Kein Wasser lesen die Brand-Last `lebendig` (stamm/feld-leben.js:1828) und die Dichte der Streu-Schichten tree/under (phyto-core.js:7065). Die Feuchte liest dort nur der Fels-Zweig (:7062). Nicht gemessen. |
| `leben.pflanzen.biome` (Beleg :1113) | Biome aus Temperatur × Niederschlag | Der Beleg stimmt mit dem Code: die Streu folgt `lebendig` (phyto-core.js:7065); ein Klimafeld T × N fehlt (§3). |

## 6. Nicht verifiziert

- **Gelaufen** (headless node, je < 1 s, Skripte im Scratchpad `pflanzen/`):
  - `node tempo-probe.cjs /home/user/AnazhRealm`: die echte `_brandTempo` mit gestubbtem Wind und Temperatur. Zahlen in §4.11.
  - `node lebendig-probe.cjs /home/user/AnazhRealm anazh-realm-seed 2048`: die echte `worldFieldAt` über 65 536 Zellen
    (4 096 m Kante). Ergebnis: p05 0,159 · p25 0,314 · p50 0,499 · p75 0,69 · p95 0,84; unter `minStoff` 4,42 %, unter 0,3
    23,1 %. Die Saat ist der Fallback „anazh-realm-seed“, nicht die Saat der Mess-Wiese.
- **Nicht gelaufen:**
  - `gate:stand-takt --brand` (Welt-Boot, über 60 s).
  - Die Station `same.kopplung.kaskade#1`: ihr FUND „nach 60 s EINE Zelle“ steht in LAGE.md:136 (am 18058dba). Ihr Ort, Wind und
    `lebendig` sind nicht gelesen, darum ist §4.11 eine Erklärung und kein Befund. Später zählt die Station Flammen-Pixel unter
    ruhendem Licht, nicht die Ausbreitung (Radeon +244 … +284 px, LAGE.md:196, :238).
  - Kein Bild und keine Blick-Sonde.
- **Nicht gelesen:**
  - wie der voxel-worker `gruenMap` schreibt (die Quelle des Grün-Kanals);
  - ob ein Regen ein neues `state.hydrosphere`-Objekt anlegt und so den Wald-Plan neu stellt (stamm/vegetation-wiese.js:2636 behauptet es);
  - ob Streu-Regionen nach einem Brand neu gewürfelt werden. Gefunden ist nur das Räumen durch Bauten (stamm/vegetation-baum.js:2313–2327); einen Leser für den Brand gibt es dort nicht;
  - die Labor-Seite `worlds/terrain/phytogenesis.js` über grep hinaus: kein Feuer, kein Nachwuchs, die Saison nur als Tönung (:23–25).
