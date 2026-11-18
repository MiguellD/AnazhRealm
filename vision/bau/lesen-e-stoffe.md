# Lesen (e): Stoffe und Farben — main 18058dba

**Feld (gelesen):** fachwerk-core.js (12 518) · stamm/stoff-material.js (3 859) · stamm/stoff-karte.js (2 818) · stamm/stoff-instanz.js (2 682) ·
stamm/stoff-dach.js (300) · stamm/stoff-gang.js (697) · stamm/studio-stoff.js (896) · welt-licht.js (1 370); dazu die Leser/Nachbarn
porta-core.js (1 855) · stamm/siedlung-satz.js (1 981) · stamm/siedlung-wege.js (2 995) · stamm/bau-vorlagen.js (2 152) · stamm/siedlung-ort.js (3 712) ·
phyto-core.js (7 234) · foundry-bruecke.js (1 060) · schmiede-core.js (5 320) · gelaende-core.js (7 947) · spec/farbe/albedo-tafel.json.

**Kurzbefund.** Jede Farbe eines Hauses ist ein Hex aus EINER von 32 festen Kultur-Paletten (fachwerk-core.js:2122–2153, 99 Einträge) oder dem
Rollen-Block (2065–2091, 27 Stoffe) — keine einzige stammt aus Gestein, Boden, Baum-Art oder Klima des Orts. Der Samen erreicht den Stoff nur
über die WAHL der Palette (Region gewürfelt 4410 oder Epoche gehasht 3718 → Pool nach Baujahr 4424 → Kultur 4435); Baujahr, Wohlstand und
Alter des Hauses ändern keinen Farbwert, die Verwitterung läuft ab Welttag 0 (siedlung-satz.js:796) und behandelt jedes Haus als „stein“
(1980). Raster und Fuge sind EINE Tafel für die ganze Welt (VERBAND_GESETZ 1847–1856), drei Maße mit Norm-Anker (NF), der Rest Stellwerte;
der Putz-Verband ist in der Welt die Identität (zugWelt 0). Von 420 gezählten Größen folgen 8 aus einer Kette, 10 tragen einen Anker, 402 sind gesetzt.

## (1) WAS TRÄGT

| Gesetz / Funktion | datei:zeile | Leser |
|---|---|---|
| `materials()` — der Rollen-Block (Farbe · Rauheit · Metall) | fachwerk-core.js:2062–2100 | `mat()` 2111 (jeder Bauteil-Bau) · `_HEX` 2096 → `_colFor` 2325 · `_mmFor` 2308 · foundry-bruecke.js:671–672 (roughness/metalness → out.mat) → phyto-core.js:5974/5981 `budgetRegler` → siedlung-satz.js:87–91 `_satzRegler` (Rauheit/Metall je Ecke im Bau-Satz) |
| `_colFor(role,kol)` — Kultur-Hex → sRGB-Absicht → linear (`_lin`, IEC 61966-2-1) | 2324–2333 | `_baseFor` 2337 → `bakeHaus` 2418 · `bakeLOD` 2456 (Vertex-Farbe = was die Welt liest) · `_innenFaktor` 2769 · `fensterFern` 2792 · `_wandFaktor` 2942 · `_koerperRoh` 2983 · `innenTon` 2350 · `verbandZeilen` 1894 |
| `KULTUR[k].col` über `_bauweiseWurf` → `hp.col` | 2121–2153, 2215 | `bakeLOD(…, B.p.col, …)` 2669/3407/3561 · `_koerperRoh` 2975 · Labor `tintM` 2162 ← worlds/fachwerk/fachwerk.js:35 |
| Kultur-Wahl: `DORF` Region/Pool/Baujahr · `siedlungsEpoche` · `stadtViertel` | 4403–4451 · 3718–3724 · 4376–4401 | siedlung-ort.js:1226/1545/1990 (der Wirt ruft DORF mit `epoche`) |
| `STILMODE.RM` — Rollentausch je Stil (Putz statt Holz usw.) | 190–197 | der Bau `HAUS` (Rollen-Auflösung im Builder) |
| `VERBAND_GESETZ` → `verbandZeilen()` | 1847–1856 → 1883–1921 | studio-stoff.js:142 `_verbandStoff` → :740 colorNode (Welt, EINE uniform-Tafel :175–179) · Labor-Karten `texZiegelwand/texDach/texPutz/texStein` 1949–1992 |
| `_wandLage` — Gefüge der fernen Fachwerk-Wand | 1928–1945 | `bakeLOD` 2459–2471 (`aWand`) → studio-stoff.js:194–196 |
| `NOISEAMP` × `_noise01` (Welt-Lage-Hash je Ecke) | 2320–2322 | `bakeHaus` 2426 · `bakeLOD` 2468 |
| `woodTint`/`tintWood` (Patina je Brett, Lage-Hash) | 265–268 | Holz-Rollen im Bau (WOODSET 265) |
| `wandTonAus` (gemessener Fassaden-Ton) | 2480–2492 | 3577 `B.wandTon` → `_wandFaktor` 2940 (Fernkörper) · `_innenFaktor` 2770 |
| `innenTon` + `INNEN_HOLZ` | 2346–2358 | `bakeLOD` 2457/2469 |
| `porta STEIN_GESETZ` (Quader, Kopfstein, Steinfarben) | porta-core.js:301–305 | siedlung-wege.js:1332–1336 + 1589–1592 `_kopfsteinFarbe` (Pflaster der Gassen) · porta-core.js:1330 (Tor-Stein) |
| `WEG_GESETZ.ton` (Bord, Rinne, Flanke) | fachwerk-core.js:10096–10108 | siedlung-wege.js:1376–1487 (Bord des Wegs) |
| `WERK_ALTER` + Stoff-Schichten `ALTER` | siedlung-satz.js:1971–1981 · bau-vorlagen.js:1684–1692 | `_satzAlter` siedlung-satz.js:1129–1149 · `_werkAlter` 788–799 · `_werkAlterStufe` 825–829 |
| Gestalt-Paletten `ausFarben` + Alters-Konstanten `AUS_*` | fachwerk-core.js:8886–8901 · 6861–6865 | `ausHuelle` 8879 (Marktstand, Laterne, Grabstein, Geräte) · `W = p.verwitterung` 6976 ff. |
| `GLANZ_RAUHEIT` (ab welcher Rauheit ein Stoff spiegelt) | welt-licht.js:880 | welt-licht.js:1195 — trifft Glas 0,15/0,22/0,25, nicht Metall 0,5 |

Nicht in dieser Domäne: stoff-karte.js (Laub-Atlas), stoff-instanz.js (Instanz-Senken, Laub-Licht), stoff-gang.js (Gang-Satz) — Grep
`fachwerk|haus|verband|putz|ziegel` 0 / 1 / 0 Treffer; stoff-dach.js ist die Regen-Decke der Dächer (Himmels-Sicht, :1–30), keine Farbe.

## (2) DIE GRÖSSEN

Urteil: **FOLGT** (Kette genannt) · **ANKER** (gesetzt, aber mit Norm/Messung im Code belegt) · **GESETZT** (keiner).

| Größe | Wert | Einheit | datei:zeile | Anker | Leser | Urteil |
|---|---|---|---|---|---|---|
| holz | 0x5a4632 · r .88 · m 0 | sRGB/1 | fachwerk-core.js:2065 | keiner | _colFor 2325, foundry-bruecke 671 | GESETZT |
| blockholz | 0x8a6a3e · .9 · 0 (Kultur: holz×1,4 via tintM 2162) | | 2066 | keiner | dito | GESETZT |
| gefach | 0xd9d0c1 · .97 · 0 | | 2067 | keiner | dito | GESETZT |
| stein | 0x8d857a · .96 · 0 | | 2068 | keiner | dito | GESETZT |
| ziegel | 0x9c4a35 · .82 · 0 | | 2069 | keiner | dito | GESETZT |
| boden | 0x7d5c39 · .8 · 0 | | 2070 | keiner | dito | GESETZT |
| glas | 0x33576a · .15 · 0 · opak .42 | | 2071 | keiner | dito + welt-licht 1195 | GESETZT |
| dunkel | 0x14161a · 1 · 0 | | 2072 | keiner | dito | GESETZT |
| feuer | 0xff8636 · emissiv 0xff5212 ×1,5 · .7 | | 2073 | keiner | `LEUCHT_FEUER` 2105 | GESETZT |
| moebel | 0x6a4a2c · .86 · 0 | | 2074 | keiner | dito | GESETZT |
| metall | 0x6b6b73 · .5 · .55 | | 2075 | keiner | dito | GESETZT |
| nagel | 0x402c1c · .9 · 0 | | 2076 | keiner | 1260 | GESETZT |
| lattung | 0x967852 · .9 · 0 | | 2077 | keiner | dito | GESETZT |
| ziegel2 | 0x803a28 · .85 · 0 | | 2078 | keiner | dito | GESETZT |
| backstein | 0x964e3e · .92 · 0 | | 2079 | keiner | dito | GESETZT |
| lehm | 0xbfb09a · .98 · 0 | | 2080 | keiner | dito | GESETZT |
| putz | 0xe7e3da · .94 · 0 | | 2081 | keiner | dito | GESETZT |
| dachmod | 0x3b3e44 · .62 · .08 | | 2082 | keiner | STILMODE 191/194 | GESETZT |
| gras · weg · laub · stamm | 0x5b7a3a/1 · 0xb7ab8e/.98 · 0x4f6f33/.97 · 0x5b4327/.95 | | 2083–2086 | keiner | dito | GESETZT |
| stroh | 0xcaa44e · 1 · 0 | | 2087 | keiner | STILMODE 196 | GESETZT |
| kupfer | 0x5a917c · .55 · .35 | | 2088 | keiner | Kuppel 1758 | GESETZT |
| glasdunkel | 0x2b4457 · .25 · .1 · opak .92 | | 2089 | keiner | fensterFern 2794 | GESETZT |
| laternenglas | 0x33576a · .15 · 0 · .42 | | 2090 | keiner (Kopie von glas) | Laterne `__licht` 2097 | GESETZT |
| glasfern | 0x46687e · .22 · .45 | | 2091 | keiner | `_wandRolle` 2938 | GESETZT |
| **Summe Rollen-Block** | 27 Farben + 27 Rauheiten + 26 Metalle + 2 Emissiv + 3 Deckkraft = **85** | | 2065–2091 | keiner | s. (1) | 85 GESETZT |
| DEFCOL | 15 Hex, alle = Rollen-Block | sRGB | 2119 | keiner | _colFor 2325, tintM 2162 | 15 GESETZT (Zwilling) |
| KULTUR.col (32 Kulturen) | 99 Hex: ziegel 28 · ziegel2 19 · putz 15 · holz 12 · stamm 7 · gefach 5 · backstein 4 · dachmod 3 · glas 2 · metall 2 · stein 2 | sRGB | 2122–2153 | nur Namen („Falunrot“ 2147, „Schiefer“ 2127, „Terrakotta“ 2128) | _bauweiseWurf 2215 → bakeLOD 2669 | 99 GESETZT |
| REGION_HIST | 6 Regionen, 26 Pool-Stufen nach Jahr | Jahr→Kultur | 3609–3616 | keiner | poolAt 4424 | 6 GESETZT |
| EPOCHEN (pool/region/jahr) | 9 Zeilen | | 3622–3632 | keiner | DORF 4405, siedlungsEpoche 3718 | 9 GESETZT |
| Region-Würfel | .30/.46/.64/.76/.88 | Anteil | 4410 | keiner | DORF 4410 | 1 GESETZT |
| STILMODE.RM | 7 Stile × Rollentausch | | 190–197 | keiner | HAUS-Bau | 7 GESETZT |
| Mauerwerk steinM · hoeheM · fugeM | 0,24 · 0,071 · 0,011 | m | 1850 | **NF-Format** (Kommentar 1949) | verbandZeilen 1913, texZiegelwand 1951 | 3 ANKER |
| Mauerwerk versatz · ton · fuge · grund | 0,5 · [0,84 0,3] · 0xb7b0a2 · 0x964e3e (= DEFCOL.backstein) | | 1850 | keiner | dito | 4 GESETZT |
| Deckung breiteM · deckM · spaltPx · reihePx · schattenPx · schatten · versatz · ton · grund | 0,18 · 0,32 · 2 · 1 · 3 · 0,27 · 0,5 · [0,82 0,32] · 0x9c4a35 (= DEFCOL.ziegel) | m/px | 1851 | nur Name „Biberschwanz“ 1830 | verbandZeilen 1914, texDach 1963 | 9 GESETZT |
| Putz sprenkel · ton · korn · deck · kornPx · zug · zugFarbe · zugDeck · grund · zugWelt | 5200 · [0,86 0,2] · [255 255 252] · 0,5 · [1 2] · [9 7] · [120 116 108] · 0,1 · 0xffffff · 0 | px/sRGB | 1852 | keiner | texPutz 1975 (Labor); Welt: verbandZeilen 1904–1916 — mit zugWelt 0 Identität | 10 GESETZT |
| Naturstein steinM · hoeheM · fugeM · versatz · ton · fuge · stein | 0,46 · 0,28 · 0,016 · 0,5 · [0,88 0,24] · 0x6f6a60 · [0,92 0,9 0,86] | m | 1853 | keiner | verbandZeilen 1917, texStein 1985 | 7 GESETZT |
| Fachwerk feldM · riegelM · staenderM · riegelStarkM | 1,7 · 0,85 · 0,16 · 0,13 | m | 1848 | keiner (Kopie bayMax 1,7 / post 0,16 aus 181) | verbandZeilen 1919, _wandLage 1929 | 4 GESETZT |
| pxJeM | 128 | px/m | 1849 | keiner | 1951/1963/1985 | 1 GESETZT |
| texDach ziegel2-Literal · 5 Karten-Samen | 0x803a28 · 7/11/13/17/23 | | 2063 | keiner | Labor-Karten | 6 GESETZT |
| VERBAND_WELLE | welle [1,7 0,73 0,5] · phase 1,3 · steil 2,065 | 1/Reihe | studio-stoff.js:896 | keiner | studio-stoff.js:197–198 | 3 GESETZT |
| Verband-Zeilen der Welt (lM, Fugen-Ton, eins, kreuz) | aus der Tafel gerechnet | | 1883–1921 | — | studio-stoff.js:142 | 1 FOLGT (Tafel → Zeilen) |
| sRGB→linear `_lin` | IEC-Kurve auf 2^-16 | | 2333 | **IEC 61966-2-1** | _colFor 2329 | 1 ANKER |
| Fugen-Ton (kartenlos) | Stein-Anteil × Stein + Rest × Fuge | | 2337–2338 | — | bakeHaus 2418 | 1 FOLGT |
| NOISEAMP | 18 Rollen 0,02–0,08 (putz .07 · stein .08 · backstein .055 · ziegel .045 · holz .035 …) | ±Anteil | 2320 | keiner | 2426, 2468 | 18 GESETZT |
| woodTint | Lum 0,86+0,22·r · warm ±0,06 · Klemme 1,15/0,78 | Faktor | 267 | keiner | tintWood 268 | 5 GESETZT |
| Balken-Licht-Boden | Luminanz ≥ 0,14 | sRGB | 2327–2328 | Auge („Michis schwarze Balken“) | _colFor | 1 GESETZT |
| Kontakt-AO | 0,76 · AO_KNIE 2,6 m · Paneel ≤ 4,2 m | | 2318, 2422, 2462 | keiner | bakeHaus/bakeLOD | 3 GESETZT |
| INNEN_HOLZ | frisch 2,2 · anstrich .35 · wand [.25 .35] · diele [.25 .4] · dieleMal 1,15 | | 2346 | keiner | innenTon 2347 | 5 GESETZT |
| innenTon | aus holz der Kultur × frisch, geklemmt | linear | 2347–2358 | — | bakeLOD 2469 | 1 FOLGT (← KULTUR.holz) |
| tintM blockholz | holz × 1,4 | | 2162 | keiner | Labor | 1 GESETZT |
| wandTon | flächengewichtetes Mittel der Stufe-1-Fassade | linear | 2480–2492 | gemessen am eigenen Bau | 3577 → 2940, 2770 | 1 FOLGT |
| _wandFaktor-Klemme | 0,25 … 1,7 | Faktor | 2944 | keiner | _koerperRoh 2981 | 2 GESETZT |
| INNEN_DAEMMER | 0,92 | Faktor | 2767 | interne Messung (Leuchtdichte 176 vs 60, Kommentar 2760–2761) | _innenFaktor 2772 | 1 ANKER |
| FENSTER_SCHLAF | 0,45 | Anteil | 2751 | keiner | fensterSchlaeft 2758 | 1 GESETZT |
| STEIN_GESETZ.kopfstein steinM · fuge | 0,1 · 0,004 | m | porta-core.js:304 | **DIN EN 1342 / DIN 18318** (288–289) | siedlung-wege.js:1590 | 2 ANKER |
| STEIN_GESETZ übrige (quader 6, kopfstein 9) | fase .015 · fuge .008 · fugeTon .45 · ton .12 · platteM .9 · korn 0 · kuppe .25 · sehneM 1,6 · stichM .32 · fall .6 … | | porta-core.js:302–304 | keiner | siedlung-wege.js:1590, porta 1330 | 15 GESETZT |
| STEIN_GESETZ.farbe granit · sandstein · pflaster | 0x8e939a · 0xb59a74 · 0x70747a | sRGB | porta-core.js:303 | Behauptung „frischer Bruch 0,28“ / Auge Messort dorf 7 4750 (292–294), keine Messquelle | siedlung-wege.js:1334, porta 1330 | 3 GESETZT |
| WEG_GESETZ.ton | fahr .84 · rinne .72 · bord 1,12 · flanke .62 · kant .8 · schatten .42 | Faktor | fachwerk-core.js:10099 | keiner | siedlung-wege.js:1376 ff. | 6 GESETZT |
| Gestalt-Paletten `ausFarben` | 36 Hex (Feuerstelle 6, Markt 5, Laterne 2, Grabstein 3, Geräte 9, Werke 3, Rest 8) + AUS_PLANE 5 + NATURTUCH 1 | sRGB | 8886–8900 | Namen („Kalkstein, Sandstein, Granit“ 8896, „Krapp · Ocker · Salbei · Waid · Malve“ 8882) | ausHuelle 8879 | 42 GESETZT |
| tuch · ware | 0xb0533a/.93 · 0xffffff/.78 | | 6535–6536 | keiner | Marktstand | 4 GESETZT |
| AUS_SILBER · FRISCH · ROST · BELAG · MOOS_NORD · RUSS | [.2 .2 .19] · [1,08 .9 .72] · [.26 .05 .01] · [.09 .12 .04] · [.069 .111 .019] · [.2 .19 .18] | linear | 6845, 6861–6865 | keiner (MOOS = Kopie FELS.moos) | Werke mit `verwitterung` 6976 ff. | 6 GESETZT |
| WERK_ALTER | tauTage 40 · nassMin 1 · regen 1 · stufen 32 · frei [.7 .3] · oben [.3 .9] · lauf {6 · .35 · .5} · seh {stoff→stein, metall→eisen} | Tage/… | siedlung-satz.js:1971–1981 | intern geeicht (stoffe.K4#2, 1961) | 788–829, 1129–1149 | 9 GESETZT |
| ALTER.holz ziel | lin(0x6b665e) = .147/.133/.112 | linear | bau-vorlagen.js:1685 | **USDA Wood Handbook 2021 Kap. 16** (1666) | _werkAlterFaerbe (Bau-Teile); Häuser NIE (s. 3) | 1 ANKER |
| ALTER.eisen ziel | lin(0x8c5426) = .262/.089/.019 | linear | 1686 | **FeO(OH)** Farbton 25° (1668) | dito | 1 ANKER |
| ALTER.stein ziele (Moos nord, Flechte oben, Moos lauf) | FELS.moos .069/.111/.019 · FELS.flechte .27/.26/.15 | linear | 1688–1690 | — | _satzAlter 1145 | 3 FOLGT (← gelaende-core.js:3379/3382) |
| ALTER Tage (holz 200/40, eisen –/10, stein –/40 · 300/60 · –/60) | 8 Werte | Tage | 1685–1690 | keiner | _werkAlterStufe 826 | 8 GESETZT |
| Alters-Tempo je Ort | nassMin + `_feuchteAt` | Faktor | siedlung-satz.js:792 | — | _werkAlter 798 | 1 FOLGT (← Feuchte des Orts) |
| Zaun-Holz | 0x6a4e32 | sRGB | siedlung-wege.js:2731 | keiner | _stlZaunAddStrip | 1 GESETZT |
| GLANZ_RAUHEIT | [0,25 0,45] | Rauheit | welt-licht.js:880 | keiner | 1195 | 2 GESETZT |
| Werkstatt-Stoffe stein · holz · eisen | 0x7a7a7a · 0x5e3a1c · 0x484850 | sRGB | bau-vorlagen.js:1756/1763/1773 | keiner | `make` (Werkstatt-Bau) | 3 GESETZT |
| STOFF_GESETZ rauheit eisen · glas | 0,54 · 0,05 | | schmiede-core.js:2922/2924 | eisen **MERL** (bau-vorlagen.js:1657); glas keiner | _stoffOptik bau-buch.js:1594 | 1 ANKER · 1 GESETZT |

## (3) ZWILLINGE UND TOTE

**Zwillinge (derselbe Stoff, zwei Zahlen):**
- **Glas** fünffach: glas 0x33576a r .15 opak .42 (2071) · glasfern 0x46687e r .22 m .45 opak (2091) · glasdunkel 0x2b4457 r .25 (2089) ·
  Kultur-Glas 0x9fb8c4/0x80a1b6 (2130/2131) · Stoff-Gesetz glas rauheit 0,05 (schmiede-core.js:2924). laternenglas (2090) ist eine Byte-Kopie von glas.
- **Silbergraues Holz** zweifach: AUS_SILBER [.2 .2 .19] (6861) gegen ALTER.holz .147/.133/.112 (bau-vorlagen.js:1685, USDA-Anker).
- **Rost** zweifach: AUS_ROST [.26 .05 .01] (6863) gegen ALTER.eisen .262/.089/.019 (bau-vorlagen.js:1686) — G um 78 % verschieden.
- **Moos**: AUS_MOOS_NORD (6865) ist eine Literal-Kopie von FELS.moos (gelaende-core.js:3382), nicht gelesen.
- **Stein** vierfach: fachwerk stein 0x8d857a (2068) · Werkstatt 0x7a7a7a (bau-vorlagen.js:1756) · STEIN_GESETZ granit 0x8e939a / pflaster 0x70747a
  (porta-core.js:303) · Grabstein-Palette 0xa8a294/0x9c9282/0x8a8a86 (8896).
- **Holz** fünffach ohne Bezug: Fachwerk 0x5a4632 · lattung 0x967852 · Gestalt 0x8e7860… (8894) · Zaun 0x6a4e32 (siedlung-wege.js:2731) · Werkstatt 0x5e3a1c (1763).
- **Metall**: fachwerk metall r .5 m .55 (2075) gegen Stoff-Gesetz eisen r .54 m 1 (MERL, schmiede-core.js:2922).
- **Verband gegen DEFCOL statt gegen das Haus:** `verbandZeilen()` nimmt kein Argument (1883); Fugen-Ton und Balken-Kontrast rechnen gegen
  DEFCOL (`_colFor("holz", null)` / `("gefach", null)` 1894, `mauerwerk.grund` = DEFCOL.backstein 1850). Die Welt trägt EINE uniform-Tafel
  (studio-stoff.js:175–179). Folge: der ferne Balken ist Gefach-der-Kultur × (holz_def ÷ gefach_def) — bei niedersaechsisch (gefach 0x9c5440,
  2124) nicht der Balken der Kultur. Mörtel 0xb7b0a2 skaliert mit jedem Kultur-Backstein mit.
- **Deckungs-Raster** EINES (Biberschwanz 18 × 32 cm, 1851) für jedes Dach: Schiefer (franzoesisch 2127), Mönch-Nonne/Terrakotta (italienisch 2128),
  chinesisch (2136), Ziegel und Ziegel2 (Rolle → deckung 1855).
- **Raster-Kopien:** feldM 1,7 / staenderM 0,16 (1848) = bayMax / post (181), nicht gelesen; texDach-ziegel2 0x803a28 (2063) = DEFCOL.ziegel2;
  deckung.grund = DEFCOL.ziegel; DEFCOL (2119) = 15 Werte des Rollen-Blocks noch einmal.
- **Labor ≠ Welt Putz:** Labor-Karte zieht Kellenzüge über die ganze Karte (texPutz 1980), Welt zieht keinen (zugWelt 0, 1852; offen benannt 1835–1838).
- **Downtown-Neubau** setzt `p.kultur` neu, `p.col` nicht (4455–4456): der Turm trägt die Palette des alten Hauses (Glas fällt auf DEFCOL glasfern zurück).
  Gewerbe-Halle setzt `stil='klinker'` ohne col (4459): Backstein der alten Kultur oder DEFCOL 0x964e3e.

**Tote / ohne Wirkung in der Welt:**
- **Putz-Verband** (1852, 10 Werte): mit zugWelt 0 wird pZ = 1 (1909), tonU = [1 1 1], ton 0 (1916) → Zeile 3 ist die Identität
  (kreuz = min(1,1) − 1 = 0, eins = 1). sprenkel, korn, deck, kornPx, zug, zugFarbe, zugDeck, grund wirken nur im Labor (texPutz 1973–1981).
- `naturstein.stein` (1853) bestimmt nur das Verhältnis Fuge/Stein, nie die Farbe (die Karte ist Relief, `_karte` 2001–2005; Farbe = DEFCOL.stein).
- Häuser altern NIE als Holz: `WERK_ALTER.seh.stoff = "stein"` (siedlung-satz.js:1980), `_satzAlter` liest die Seh-Klasse (1135) — Fachwerk-Balken
  bekommen Moos/Flechte, das USDA-Silber (bau-vorlagen.js:1685) erreicht kein Haus. AUS_SILBER/AUS_FRISCH (6861–6862) lesen nur Werke mit Regler `verwitterung`.
- `kulturFromSeed` (2164): Leser nur das Labor (worlds/fachwerk/fachwerk.js:34/627/836/848/1143); die Welt wählt über DORF (4435).
- spec/farbe/albedo-tafel.json „haus“ (635–736) misst Labor ↔ Welt (Y 0,1491 / 0,1592), ist KEIN äußerer Albedo-Anker für Putz, Ziegel oder Holz.

## (4) WAS DER SAMEN ERREICHT

| Eingang | erreicht den Stoff? | Kette / Beleg |
|---|---|---|
| **Samen** | ja, nur als WAHL einer festen Palette | Zell-Same → `siedlungsEpoche` (1 von 3, 3722) oder Region-Würfel (4410) → `poolAt(baujahr)` (4424) → `kn = pool[rnd]` (4435) → `KULTUR[kn].col` (2215). Innerhalb einer Kultur ist jede Farbe gleich für jedes Haus. |
| **Ort / Geologie** | **nein** | Region ist ein Würfel aus dem Samen (4410), kein Gestein, Klima oder Biom; fachwerk-core liest weder `__gelaendeCore` noch `__planetCore` noch `__phytoCore` (die Treffer für „gelaende-core“ 2898 … 12427 sind Erdbau und Höhe). Die Geologie des Bodens (`_terrainGeologyAlbedo` stoff-material.js:3000) endet am Boden. |
| **Holz aus den Bäumen der Region** | **nein** | Holz-Hex je Kultur (2122–2153); keine Leitung von vegetation/phyto zu `holz`/`stamm`. |
| **Ort (Feuchte)** | ja, nur das Alters-TEMPO | `_feuchteAt` → `entry._nass` (siedlung-satz.js:792) → `_werkAlter` 798; Wetter `nassTage` 797. |
| **Epoche** | nur über die Wahl der Kultur | EPOCHEN.pool / REGION_HIST nach Jahr (3609–3632). Eine Kultur malt 1320 und 1900 gleich. |
| **Wohlstand** (`p.wohl`) | **nein** | gesetzt 4438, liest nur Breite/Geschosse/Balkon (4439–4448), Patrizierhaus-Regel (4340); kein Leser in stoff-*, studio-stoff, siedlung-satz (Grep `wohl` 0). |
| **Alter des Hauses** (`p.baujahr`) | **nein** (nur Kultur-Wahl) | Grep `baujahr` in stoff-*.js, studio-stoff.js, siedlung-satz.js, -instanz, -bauten: 0. Die Verwitterung zählt ab `entry.geburt \|\| 0` = Welttag 0 (siedlung-satz.js:760–761, 796): ein Bau von 1320 und einer von 1960 sind gleich verwittert. |
| **Varianz je Haus** | nur Lage-Rauschen | NOISEAMP × Welt-Hash (2426/2468), woodTint je Brett-Lage (266), Ton je Stein im Verband (studio-stoff.js:201–209, steinZiehung porta 313), Fenster-Schlaf aus Samen (2752). Kein Farbton, keine Helligkeit, keine Patina je Haus aus Samen. |

**Schluss:** 420 Größen gesamt · davon GESETZT ohne Anker 402 · davon FOLGT 8 (dazu 10 mit Anker: NF ×3, DIN ×2, IEC, USDA, FeO(OH), MERL, interne Leuchtdichte-Messung).
