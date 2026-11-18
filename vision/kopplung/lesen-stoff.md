# Zensus Kopplung — (d) STOFF

**Kopf.** Der Stoff ist im Code EINE Laufzeit-Tafel `state.materials`, gebaut von `_defaultMaterials` (stamm/bau-vorlagen.js:1566–1954),
gelesen über den EINEN Leser `_stoff` (stamm/bau-buch.js:1554–1571). Die Tafel hat zwei Quellen: die Physik-Spalten (ρ, E, σ, n, Abbe,
c, T_schmelz, η, Rauheit) sind Zugriffe auf schmiede-core `STOFF_GESETZ` (schmiede-core.js:2860–3077), die Feuer-Spalten (`tZuend`,
`brenn`, `Lv`, `L`, `k`), die Reibung und die Körnung sind Host-Zahlen in bau-vorlagen.js:1619–1649. Daneben trägt jede Zeile Tag-Achsen
0..1 (`brennbar`, `dichte`, `wärmeleitung` …, bau-vorlagen.js:1756–1949). Kein eigener Takt: der Stoff wird gelesen, wenn Brand
(`_tickBrand`, feld-brand.js:470), Brennglas (`_tickFocusingAffordances`, koerper-fahrt.js:2289), Esse (`_tickEsse`, feld-leben.js:2499),
Lava (`_lavaZuendet`, siedlung-wege.js:625) oder Masse/Klang/Licht fragen.

## 1. DIE GRÖSSEN

| Name | Einheit | Wert/Bereich | Anker | Schreiber | Leser | FOLGT/GESETZT |
|---|---|---|---|---|---|---|
| ρ Dichte je Stoff | kg/m³ | holz 720, gras 350, laub 300, kraut 400, erde 1500, stein 2650, asche 600, glut 400, eis 917 | schmiede-core.js:2892–2907; holz = `RHO.holz` schmiede-core.js:456 über 3071 | Kern (Tafel); Wirt `verbinde` für wasser/blech/fleisch/leib bau-vorlagen.js:1585–1588 | `_stoffRho` bau-buch.js:1628; Rothermel ρ_p feld-brand.js:303; Brennglas koerper-fahrt.js:2396; Esse feld-leben.js:2509; Schall schmiede-core.js:3029 | GESETZT (Tafel-Werte, Kommentar bau-vorlagen.js:1531–1533); gras 350 ohne benannten Anker; Metalle FOLGT (`mische` 2970–3006) |
| c Wärmekapazität | J/(kg·K) | holz 1700, gras/laub/kraut 1800, erde 800, stein 790, asche 840, glut 1000, wasser 4186, eis 2050 | schmiede-core.js:2888–2907 | Kern | Q_ig feld-brand.js:316; `_brennWaerme` koerper-fahrt.js:2396; Esse feld-leben.js:2509; Wasser-Säule bild-himmel.js:3050 | GESETZT (CRC/ToolBox, bau-vorlagen.js:1562–1565); Metalle FOLGT (Kopp-Neumann) |
| T_zünd `tZuend` | K | holz/leder/federn 573, glut 623, laub 523, gras/kraut 533; stein, erde, asche: null bzw. keine Zeile | bau-vorlagen.js:1621–1641 (Spalte 2) | Host-Tafel `SI` | Q_ig feld-brand.js:316; Brennglas koerper-fahrt.js:2398; Lava zündet siedlung-wege.js:637; Esse-Ausschluss feld-leben.js:2526 | GESETZT (ToolBox), Host-Zahl, nicht im Kern |
| `brenn.sigma` Oberfläche/Volumen | 1/m | gras 11 483, laub 8 202 | bau-vorlagen.js:1647–1648 | Host `BRENN` | feld-brand.js:302, 338 (`tr`) | GESETZT (Anderson 1982 FM1/FM9) |
| `brenn.last` Trocken-Last | kg/m² | gras 0,166, laub 0,654 | bau-vorlagen.js:1647–1648 | Host `BRENN` | feld-brand.js:302, 437 | GESETZT (Anderson: 0,034 / 0,134 lb/ft²) |
| `brenn.tiefe` Bett-Tiefe | m | gras 0,42 (= `GRASS_BLADE_H` stoff-material.js:3827), laub 0,061 | bau-vorlagen.js:1647–1648 | Host | feld-brand.js:302, 329 | GESETZT; gras weicht von Anderson FM1 (1 ft = 0,305 m) ab |
| `brenn.heiz` Heizwert | J/kg | 18 608 000 (gras und laub) | bau-vorlagen.js:1647–1648 | Host | I_R feld-brand.js:313; H·w 437 | GESETZT (Rothermel 8 000 Btu/lb) |
| `brenn.mx` Erlöschungs-Feuchte | kg/kg | gras 0,12, laub 0,25 | bau-vorlagen.js:1647–1648 | Host | feld-brand.js:310–312, 423 → `_brandSchritt` 509–514 | GESETZT (Anderson) |
| `leb` Anteil der Last | Stellwert ohne Einheit 0..1 | `auraAt().lebendig` | feld-leben.js:1849–1883 aus Rauschen `worldFieldAt` 1793–1840 + Overlay − Narbe | Rauschen (Saat), Leben-Overlay, Narbe | feld-brand.js:222, 224, 302, 437 | GESETZT (Rausch-Achse, nicht der gezeichnete Bestand) |
| `BRAND.minStoff` | Stellwert | 0,15 | feld-brand.js:900 | — | feld-brand.js:224 | GESETZT |
| M Brennstoff-Feuchte | kg Wasser/kg trocken | 0,06 + 0,29·boden + 2,5·naesse | `BRAND.feuchte` feld-brand.js:975 | Funktion `_brandFeuchte` feld-brand.js:282–285 | feld-brand.js:307, 509 | FOLGT aus Boden-Feuchte und Nässe; Koeffizienten GESETZT (Rothermel, Anderson, Matthews 2006) |
| Boden-Feuchte `_feuchteAt` | Stellwert 0..1 | Fluss-Abstand, Höhe über Spiegel | gelaende-boden.js:1538–1567, `FEUCHTE` 3220 | keiner (Funktion der Hydrosphäre) | feld-brand.js:268 (einmal je Brand gemessen, gemerkt 218–219); Wuchs vegetation-wiese.js:2081 | FOLGT (Gelände/Hydrosphäre) |
| `state.naesse` (der Film) | Stellwert 0..1 | 0 … 1, global eine Zahl | bild-himmel.js:3061–3089, `NAESSE` stoff-material.js:3788 | `_naesseTakt` bild-himmel.js:3080 | feld-brand.js:284; Lava siedlung-wege.js:626 | FOLGT (Wetter-Feld, Verdunstung) |
| L_v Verdampfung | J/kg | 2 257 000 | bau-vorlagen.js:1644 (`PHASE.wasser`) | Host | Q_ig feld-brand.js:316 | GESETZT, Host-Zahl |
| L, k des Eises | J/kg, W/(m·K) | 334 000, 2,2 | bau-vorlagen.js:1644 | Host | Eis-Dicke über `_wasserStoff` bild-himmel.js:3050 | GESETZT |
| Wärmeleitung jedes anderen Stoffs | Stellwert ohne Einheit (Tag) | holz 0,15, stein 0,25, eisen 0,7, gras 0,1 … | Tag `wärmeleitung` bau-vorlagen.js:1760–1945 | Host-Tags | Glimmen stoff-material.js:761–763; `heatResist` bau-buch.js:2542, `staminaMax` 2535 | GESETZT; keine W/(m·K)-Spalte, kein Feuer-Leser |
| Brennbarkeit (Tag) | Stellwert ohne Einheit | holz 0,8, laub 0,85, gras 0,75, kraut 0,7, glut 1,0 | Tag `brennbar` bau-vorlagen.js:1769, 1879, 1931 … | Host-Tags | Glimmen stoff-material.js:760–763; `heatResist` bau-buch.js:2542; Spawn vegetation-wiese.js:2353; UI werkstatt-bauen.js:1400, 1415; Gefühl feld-sprache.js:1495; Ton klang-core.js:1314 | GESETZT; kein Feuer-Leser |
| Tag `dichte` | Stellwert ohne Einheit | holz 0,4, stein 0,85 … | bau-vorlagen.js:1758–1945 | Host-Tags | AO stoff-material.js:759, 764; Tempo/Sprung/Angriff bau-buch.js:2522–2531 | GESETZT; „wiegt nichts" (bau-vorlagen.js:1534–1535) |
| `mineral.gesamt/frei` | kg/kg | 0,0555 / 0,01 | feld-brand.js:976 | — | nur I_R feld-brand.js:313 | GESETZT (Rothermel) — erzeugt keine Asche-Masse |
| Q_ig Zünd-Wärme | Btu/lb | 252,5 bei M 0,06, Luft 20 °C (nachgerechnet) | feld-brand.js:316 | — | R0 feld-brand.js:317–320 | FOLGT aus c, T_zünd, Luft-T (`_temperaturAt`), M, c_w, L_v |
| H·w Wärme des Betts | kJ/m² | gras 3 089 bei leb 1 (nachgerechnet) | feld-brand.js:437 | `_brandZuenden` | Flammen-Länge feld-brand.js:687; Rauch-Auftrieb 746 | FOLGT (heiz × last × leb) |
| Asche (Kanal G der Wege-Karte) | Stellwert 0..255 | n.m × asche × 255 | Speicher siedlung-wege.js:70–75 | `_ascheFlaeche` feld-brand.js:173–182 | Boden-Farbe siedlung-wege.js:1298–1300, 1360–1365; Boden-Stoff stoff-material.js:916–918, 3121–3124, 3247–3256; Halm vegetation-wiese.js:184–188, 783 | FOLGT aus Narbe × Sukzession (Rampen GESETZT) |
| Asche-Zeile ρ, c, Rauheit | kg/m³, J/(kg·K), — | 600, 840, 0,96 | schmiede-core.js:2904 | Kern | nur `rauheit` stoff-material.js:3249 | GESETZT; ρ und c ohne Leser |
| Asche-Albedo | sRGB-Hex | 0x45403a (Y 0,052) | foundry-core.js:105–107 | Kern-Palette | `BODEN_FARBE` siedlung-wege.js:1238, 1298 | GESETZT (Jin & Roy 2005) |
| `TAT_NARBE.brand` | tiefe Stellwert, Stunden, naehr Stellwert | 0,3 · 72 h · +0,4 | feld-leben.js:3102 | — | `_narbeAt` feld-leben.js:2684–2692; `_tatDauer` vegetation-wiese.js:2215–2219; `_naehrstoffAt` 2097–2109 | GESETZT |
| `SUKZESSION` | Anteil der Narbe | asche [0,08; 0,3], busch [0,3; 0,6], wald [0,6; 1] | vegetation-wiese.js:3185–3194 | — | `_sukzession` vegetation-wiese.js:2120–2135 | GESETZT |
| `BRAND.versengt`, `ascheKorn` | Farb-Faktor, Anteil | [0,9; 0,4; 0,2], 0,3 | feld-brand.js:897–898 | — | vegetation-wiese.js:186; stoff-material.js:1910, 3256 | GESETZT |
| Flammen-Temperatur | K | [3000; 1700] | feld-brand.js:943 | — | feld-brand.js:791–800 | GESETZT (nicht aus dem Stoff) |
| Rauch | Ballen/s, sRGB | jeS 12, 0x8d8881 | feld-brand.js:955, 965 | — | feld-brand.js:731, 764 | GESETZT; keine Masse |
| Brennfleck | m³, W/K, W/m² | 2·10⁻⁵, 0,85, 1000 | koerper-fahrt.js:3258–3260 | — | koerper-fahrt.js:2377, 2395–2396 | GESETZT |
| Esse | K, W/(m²·K) | feuerK 1573, α 300/60 | feld-leben.js:3120–3124 | — | feld-leben.js:2509–2510, 2526 | GESETZT; die Zeile `glut` liefert sie nicht |
| `BOGENMAT.holz.rho` | kg/m³ | 720 | schmiede-core.js:2837 | Kern | keiner gefunden (`bm.rho` 0 Treffer; `ableitenBogen` 3290 liest E, dehnung) | GESETZT, Zwilling von `RHO.holz` |
| `ARENA_RHO` | kg/m³ | stroh 120, polster 300, schnur 500, tuch 400, ton 1800 | schmiede-core.js:4184 | Kern | `arenaRho` 4188–4194 | GESETZT, neben `STOFF_GESETZ` |
| `ZIELMAT` μ/Härte | μ, Stellwert | holz μ 0,35 hart 0,2; kraut 0,3/0,05 | schmiede-core.js:2812–2822 | Kern | Werkzeugform-Gesetz | GESETZT, neben `SI` μ (holz 0,6, bau-vorlagen.js:1622) |

**Zählung:** 34 Größen, davon 7 FOLGT (M, Boden-Feuchte, naesse, Q_ig, H·w, Asche-Kanal, die Metalle in ρ/c als Teil-FOLGT nicht extra
gezählt), 27 GESETZT; 12 ohne Einheit (leb, minStoff, Boden-Feuchte, naesse, Wärmeleitung-Tag, brennbar-Tag, dichte-Tag, Asche-Kanal,
TAT_NARBE tiefe/naehr, SUKZESSION, versengt/ascheKorn, ZIELMAT-Härte).

**Literatur, wo der Code eine Entsprechung hat (nur Nennung):** Heizwert trockenes Holz ~18–19 MJ/kg, Gras ~17–18 MJ/kg — der Code trägt
18,6 MJ/kg nur für gras/laub (bau-vorlagen.js:1647–1648), holz hat keinen. Gras-Last Anderson FM1 0,166 kg/m² — trifft
(bau-vorlagen.js:1647). Partikel-Dichte Rothermel ρ_p 32 lb/ft³ = 513 kg/m³ für jedes Modell — der Code liest gras 350 / laub 300
(feld-brand.js:303). Zündung Holz ~573 K (pilotiert), Holzkohle ~620 K — trifft (bau-vorlagen.js:1622, 1633). Wärmeleitung Holz quer
~0,12–0,17 W/(m·K), Granit ~2,8, Eisen ~80 — im Code nur als Tag 0,15/0,25/0,7 (bau-vorlagen.js:1767 ff.). Asche-Anteil Gras ~5–10 %,
Holz ~0,5–2 % — im Code nur `mineral.gesamt` 0,0555 (feld-brand.js:976), ohne Masse. Lebende Gras-Feuchte 30–300 % — im Code nicht da
(das Gras brennt als toter Fein-Brennstoff mit 6 %).

**Probe (nachgerechnet, NICHT das Spiel):** `node scratchpad/stoff/rothermel.cjs` (die Formel aus feld-brand.js:299–338 mit den Zeilen
oben, flach): gras leb 1, M 0,06, 20 °C, windstill R = 0,041 m/s — eine 16-m-Zelle in 391 s; Wind 2/5/10 m/s in 10 m → 142/31/8 s.
Laub windstill 0,0069 m/s (2 324 s je Zelle), 10 m/s → 219 s. Mit ρ_p 513 und Rothermels Q_ig = 250 + 1116·M fiele gras auf 0,030 m/s.
Pfad der Datei: /tmp/claude-0/-home-user-AnazhRealm/d169edf0-889e-5d2b-b305-7451b621a8b7/scratchpad/stoff/rothermel.cjs.

## 2. DIE FLÜSSE

- Stoff → Feuer: σ, last, tiefe, heiz, mx, ρ, c, T_zünd der Zeile unter der Zelle (`_kontaktStoffAt` gelaende-kollision.js:1121–1134 →
  `_brandStoff` feld-brand.js:244–245 → `_brandTempo` 299–338). Nur gras und laub tragen `brenn` (bau-vorlagen.js:1646–1649).
- Stoff → Brennglas: ρ·V·c und T_zünd des nächsten Teils (koerper-fahrt.js:2381–2398).
- Stoff → Lava: T_zünd des Betts (siedlung-wege.js:637); der Stein der Kruste (feld-leben.js:2484–2486).
- Wasser → Stoff/Feuer: `naesse` (global) und `_feuchteAt` (Hydrosphäre) über `_brandFeuchte` (feld-brand.js:282–285); `_nassAt` sperrt
  das Bett (224); c_w, L_v in Q_ig (315–316).
- Wetter → Feuer: Luft-T `_temperaturAt` in Q_ig (feld-brand.js:315); Wind (`_windAt`, 321).
- Feuer → Boden: Tat `brand` (feld-brand.js:575) → Asche-Kanal (173–182) → Boden-Farbe, Boden-Stoff, Nah-Wiese (s. Tafel).
- Feuer → Pflanzen: Narbe senkt `lebendig` (feld-leben.js:2684–2692, `tiefe` 0,3), Bäume in der Narbe fallen still
  (vegetation-baum.js:1203–1207, 1275–1276), Kräuter dünnen aus (vegetation-wiese.js:1387, 2188–2191), Nährstoff +0,4 (2097–2109).
- Feuer → Bild/Klang/Tiere: Flammen aus H·w (feld-brand.js:687), Licht (dirigent-kern.js:1804), Knistern (klang.js:376), Furcht
  (kreatur-furcht.js:93).
- Feuer → Gitter/Uhr: 16-m-Zelle `LIFE_FIELD.cell` (feld-leben.js:3078), Welt-Stunde (feld-leben.js:2604–2607), 1 Welt-Stunde = 150 s
  (`PEGEL_TAG_S` 3600 s, daten.js:165–167).

**Was FEHLT (Kopplung nicht vorhanden):**
- Regen schreibt keine Boden-Feuchte: `_feuchteAt` ist eine reine Funktion der Hydrosphäre (gelaende-boden.js:1538–1567); der Regen wirkt
  nur über die EINE globale `naesse` (bild-himmel.js:3080) — kein Ort trocknet anders als ein anderer.
- Jahreszeit, Sonne und Luftfeuchte schreiben keine Brennstoff-Feuchte: `trocken` 0,06 steht fest (feld-brand.js:975); das grüne
  Sommergras brennt wie totes.
- Die Last folgt nicht dem gezeichneten Bestand: `leb` ist die Rausch-Achse `lebendig` (feld-leben.js:1849–1883), nicht Halm-Dichte
  oder Kronen-Masse; die Bett-Tiefe ist eine feste Halm-Höhe (stoff-material.js:3827).
- Holz brennt im Feld nicht: holz hat T_zünd 573 K, aber kein `brenn` (bau-vorlagen.js:1622, 1646–1649) — Bäume, Totholz und Holz-Bauten
  tragen keine Front; die Bäume haben keine Masse im Kern (phyto-core.js: 0 Treffer für ρ/Brennstoff).
- Feuer erhält keine Masse: die Last wird nie verbraucht, die Zelle sperrt per Tat (feld-brand.js:217); keine Asche-Masse aus
  `mineral.gesamt`, kein Gas, der Rauch ist eine Ballen-Zahl (feld-brand.js:955).
- Feuer schreibt keine Wärme in den Stoff: keine Temperatur an Boden, Stein, Holz; Wärmeleitung gibt es physikalisch nur im Eis
  (bau-vorlagen.js:1644).
- Feuer schadet keinem Leib: `damagePlayer` hat keinen Brand-Rufer (Rufer: kreatur-verhalten.js:1553, dirigent-takt.js:1144,
  feld-dsl.js:1842).
- Die Feuerstelle verbraucht nichts: ihre Glut ist eine Fläche aus Teilen „glut" (klang.js:326–345), ewig, und zündet kein Feld.

## 3. DIE BRÜCHE

**Gibt es EINE Material-Quelle?** Zur Laufzeit ja (`state.materials` über `_stoff`, bau-buch.js:1554); als Gesetz nein: die Physik steht
im Kern (schmiede-core.js:2878–2907), Zündung, Brennstoff-Bett, Verdampfung, Reibung im Wirt (bau-vorlagen.js:1619–1649). Die SKILL-Zeile
„STOFF = EIN Gesetz … Heute stehen … Reibung, Zündung, Körnung … in eigenen Tafeln" (.claude/skills/anazh-lehren/SKILL.md:73–78) stimmt.

Zwillinge:
1. Brennbarkeit dreifach: Tag `brennbar` (bau-vorlagen.js:1769, 1879, 1931), `tZuend` null/Zahl (1621–1641), Spalte `brenn` (1646–1649).
   Das Feuer liest nur die beiden letzten; Bild (stoff-material.js:760–763), Kampf (bau-buch.js:2542) und Spawn (vegetation-wiese.js:2353)
   lesen den Tag.
2. Dichte zweifach: ρ (Kern) und Tag `dichte` (bau-vorlagen.js:1758 ff.), letzterer treibt AO und Tempo (stoff-material.js:759;
   bau-buch.js:2522–2531).
3. Wärmeleitung: nur Tag (bau-vorlagen.js:1760 ff.) und Eis-k (1644) — zwei Arten derselben Größe, keine gemeinsame Spalte.
4. Holz-Dichte: `RHO.holz` 720 (schmiede-core.js:456) und `BOGENMAT.holz.rho` 720 (2837), Letzterer ohne Leser.
5. Dichten außerhalb der Tafel: `ARENA_RHO` (schmiede-core.js:4184).
6. Reibung: `ZIELMAT.mu` (schmiede-core.js:2812–2822) neben `SI` μ (bau-vorlagen.js:1621–1641).
7. Asche-Farbe dreifach: Palette `asche` 0x45403a (foundry-core.js:107), Feuerstelle `tonAsche` [0,5; 0,5; 0,52] × lehm
   (fachwerk-core.js:7024–7031), versengter Halm `BRAND.versengt` (feld-brand.js:898).
8. Holz-Vergrauung zweifach: `ALTER.holz` lin(0x6b665e) (bau-vorlagen.js:1685) und fachwerk `AUS_SILBER` [0,2; 0,2; 0,19]
   (fachwerk-core.js:6857).

Tote Schreiber: Asche-Zeile ρ 600, c 840, E, σ (schmiede-core.js:2904) — gelesen wird nur `rauheit` (stoff-material.js:3249); `asche` steht
nicht in der Wirts-Liste (bau-vorlagen.js:1755–1950), `_kontaktStoffAt` nennt sie nie (gelaende-kollision.js:1121–1134) — auf Asche
klingt und reibt der Schritt wie Gras (der Grün-Kanal `_bodenSichtAt` liest die Asche nicht, gelaende-boden.js:94–114).
`BOGENMAT.*.rho` (schmiede-core.js:2837–2839). `glut.tZuend` 623 K ohne `brenn`: die Glut-Fläche des Bodens (`_terrainMaterialAt`
vegetation-wiese.js:2372, Lava gelaende-kollision.js:1126) trägt kein Bett.

Konstanten ohne Anker: gras ρ 350 (schmiede-core.js:2907; der Kommentar bau-vorlagen.js:1531–1533 nennt Laub 300 und Kraut 400, Gras
nicht); `BRAND.minStoff` 0,15 (feld-brand.js:900); `TAT_NARBE.brand` 0,3 / 72 h / +0,4 (feld-leben.js:3102); `SUKZESSION`-Rampen
(vegetation-wiese.js:3185–3194); `BRAND.versengt`, `ascheKorn` (feld-brand.js:897–898).

Fallback: ein eigener Stoff (DSL `define_material`) liest die Zeile seines Tag-nächsten Verwandten (bau-buch.js:1561–1570) — seine Zündung
und sein Bett folgen dem Tag-Abstand, nicht einer eigenen Zahl.

## 4. WAS NACH DEM BRAND BLEIBT

- **Boden:** die Tat `brand` { x, z, h, w, bett } in `worldMeta.taten` (feld-brand.js:575 → feld-leben.js:2626–2643), gespeichert mit der
  Welt (`_scheduleEditSave` feld-leben.js:2640); nach dem Laden malt `_ascheStufeMalen` den Kanal neu (vegetation-wiese.js:2235). Das
  brennende Feld selbst reist nicht (`GRUND_TAFEL` „brand", speicher-laden.js:2648–2651, 2691–2701). Gezeichnet: Asche-Albedo,
  Rauheit 0,96, Korn 0,3, kein Halm, versengter Saum. Die Asche liegt voll bis 8 % der Narbe und ist bei 30 % nachgegrünt
  (vegetation-wiese.js:3188); bei Wuchs 1 sind das 5,8 h bzw. 21,6 h Welt-Stunden = 14 bzw. 54 min Spielzeit, die Narbe heilt nach
  72 h = 3 h (bei Wuchs 0,1 zehnfach).
- **Bäume:** kein verkohlter Stamm, kein Snag — der Baum in der Narbe (m ≥ 0,5) fällt still (vegetation-baum.js:1203–1207), wächst als
  Jungwuchs der Sukzession nach (vegetation-wiese.js:2198–2209). Liegendes Totholz (Ernte „holz") bleibt unversehrt stehen
  (vegetation-wiese.js:1387, 2184–2187).
- **Bauten:** das Feld-Feuer erreicht keinen Bau (holz ohne `brenn`). Nur das Brennglas verbrennt ein Werk — es verschwindet ganz
  (`removeArchitecture` koerper-fahrt.js:2356), es bleiben die Journal-Zeile „loss" (2349–2353) und der Feld-Brand darunter (2355).
- **Masse:** keine Bilanz. Brennstoff → Asche + Gas existiert nicht; die Asche ist ein Byte Deckung, kein kg; der Nährstoff +0,4 ist
  gesetzt (feld-leben.js:3102).

## 5. SPROSSEN AUS MEISTERKARTE-2

Nicht gelesen: `origin/koordination` fehlte im Lauf (zweimal geprüft, `git rev-parse --verify origin/koordination` leer); die Leitern
`same.kopplung.*` und die Station `karte2.same.kopplung.kaskade#1` konnte ich nicht wörtlich zitieren. Im Code genannt sind
stoffe.K1 (die Tafel, bau-vorlagen.js:1537), stoffe.K2 / K2#2 (Brand, Asche, feld-brand.js:194, 3), stoffe.K4 (Alter,
bau-vorlagen.js:1663), stoffe.K5#2 (Sukzession, vegetation-wiese.js:2111), feld.K3#2 (Brand im Feld), wetter.K2 (Nässe).

## 6. NICHT VERIFIZIERT

- Kein Spiellauf, keine GPU, keine Linse gelaufen (gate:gegenstand-stoff `--tafel`/`--gesetz` nicht gelaufen). Die Zahlen R, Q_ig, H·w
  oben sind die Formel nachgerechnet, nicht im Spiel gemessen; Böe und `_windWob` = 1 angenommen.
- Ob `_bodenSichtAt` auf Asche je Grün < 0,5 liefert, nur bis gelaende-boden.js:114 gelesen; dass der Schritt auf Asche Gras ist, folgt aus
  dem Lesen, nicht aus einer Probe.
- Die tatsächlich gezeichnete Halm-Höhe der Nah-Wiese gegen `GRASS_BLADE_H` 0,42 m nicht verglichen.
- Ob ein Brennglas einen Wald-Baum (Eintrag `_waldDart`) als Ziel trifft, nicht geprüft.
- Die Fachwerk-Asche `tonAsche` als Albedo: gelesen als Faktor auf die Rolle „lehm" (fachwerk-core.js:6872–6900), die Ziel-Albedo nicht
  ausgerechnet.
