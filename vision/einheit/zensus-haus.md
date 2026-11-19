# ZENSUS HAUS UND STADT ÜBER DIE ZEIT (Leser, main b7ed8419, 19.11., nur gelesen)

Kürzel: fc = fachwerk-core.js · sc = schmiede-core.js · vs = stamm/vegetation-streu.js · sw = stamm/siedlung-wege.js · fw = worlds/fachwerk/fachwerk.js.
Vorgänger (gelesen, nicht nachgerechnet): koordination `vision/bau/entscheid.md` §0 (18.11.): 0 von 100 Häusern tragen ihre Balkenlage,
97 % der spannenden Balkenlinien liegen über L_max, Welle 1 „nicht baureif“. Dieses Blatt wiederholt die Statik nicht, es zählt Zeit, Stil, Stoff und Stufe.

## 1 Was ein Haus im Gesetz ist (unterste Ebene)

- Einheit: `HAUS(THREE, mat, PARAMS)` fc:168 — EIN Bauer, Meter, Ursprung Grundriss-Mitte. Die Vorgaben sind ein Fachwerkhaus: W 9, D 7, 2 Geschosse,
  Neigung 50°, Ständer 0,16, Feld `bayMax` 1,7 m, EG 2,55 m, OG 2,35 m (fc:171–181). Geschosse geklemmt auf 1…12 (fc:183).
- Bauteile: 32 Teilsysteme in fester Folge (fc:1786), davon 12 Form-Zusätze mit eigenem Bauer (kuppel, portikus, hof, dachAlt, arkade, turm,
  zinnen, veranda, vorkragung, pilotis, terrasse, rundbau; fc:1501–1757). Dachquelle EINE: `ROOFMODE` mit 6 Modi (fc:217), dazu 7 Alt-Dächer
  (kegel, mansard, pult, pyramide, schmetterling, tonne, zwiebel; fc:1711–1720). Grundrisse 7 (I, L, U, T, kreuz, hof, rund; fc:509).
- Anker: die Fundament-Oberkante `baseY = foundH (+2,6 bei pilotis)` (fc:211); jede Höhe folgt aus `levels` (fc:214), Traufe, First (fc:215–216).
- Material am Bauteil: ein ROLLEN-Name als String (`beam(..., role)` fc:288). Der Stil tauscht Rollen gegen Rollen (`STILMODE.RM`, fc:190–197:
  „EIN Profil dreht Material-Hülle + Parameter (keine neue Geometrie)“, fc:187). Hinter der Rolle stehen 27 `MeshStandardMaterial` mit
  Rauheit als Literal (fc:2062–2090), 5 Leinwand-Texturen (fc:2063), die Farbe je Kultur (`col`, fc:2121–2154, `tintM` fc:2162).

## 2 Stile und Epochen heute (gezählt)

- STIL: 7 — alt, modern, huette, stein, glas, klinker, stroh (fc:188). Verteilung über die Kulturen: stein 13 · huette 7 · alt 5 · klinker 4 ·
  glas 2 · modern 1 · **stroh 0** (fc:2121–2154). `stroh` hat keinen Erzeuger in fc und stamm — toter Stil.
- KULTUR: 32 Zeilen mit Namen (fc:2156): alemannisch, fraenkisch, niedersaechsisch, mittelalterlich, holzhuette, franzoesisch, italienisch,
  modern, volle_moderne, hochhaus, roemisch, tudor, alpenchalet, hollaendisch, hanseatisch, georgian, viktorianisch, griechisch, spanisch,
  andalusisch, provenzalisch, pueblo, marokkanisch, skandinavisch, norwegisch, russisch, schwarzwald, japanisch, gotisch, barock, renaissance,
  chinesisch. **Keine Zeile trägt ein Jahr** (fc:2121–2154).
- EPOCHEN: 9 (fc:3622–3632): antike 80, fernost 1250, mittelalter 1320, mediterran 1520, hanse 1560, alpin 1620, barock 1700, gruenderzeit 1860,
  moderne 1935 (+70 = 2005). Früheste 80 n. Chr., späteste endet 2005. 4 von 9 tragen einen Kultur-Pool, 5 würfeln aus der Region.
- STADT_GRAMMATIK.zeit: 2 Bänder, mittelalter 500–1500 und fruehneuzeit 1500–1800 (fc:4321); „Antike und Moderne tragen keine Zeile“ (fc:4469).
- BAU_NUTZUNG: 18 Bau-Typen (fc:2182–2201), alle bis auf `wohnhaus` als Ops über das Haus der Kultur.

**Urteil Epoche:** die Epoche ist KEINE Größe des Haus-Gesetzes. `HAUS` liest `baujahr` 0-mal (fc:168–1800, grep 0 von 21 Treffern in fc);
das Jahr wirkt nur als Tafel-Wahl: EPOCHEN-Pool → Kultur-Name → fester Bauplan der Zeile (pitch/W/D/st/stil/Flags, `_bauweiseWurf` fc:2204–2216).
Die Burg ist ein `gotisch`-Haus mit `zinnen:1, turm:1, storeys:3, W 13–14, D 11` (fc:4473–4474), keine eigene Physik.

## 3 Stufen (L0/L1/L2/L3) und wo sie vom Nah-Bild abweichen

- Vertrag: `kindStages.haus [0,1,2,3]` (fc:87), Budget L0 132 000 / Band 40 000 · L1 44 000 / 10 000 · L2 7 000 / 2 000 · L3 96 nurWurf
  (fc:99–102). **Jede Stufe liegt 3,3× / 4,4× / 3,5× über ihrem Band.**
- Bauer der Stufe: EINE Quelle `fragFuer(B, stufe)` (fc:3564) für 1–3, `stufe0Bau` (fc:6140) für 0; `buildStufe` (fc:6174) mischt `fragFuer` — kein Zwilling.
  Sieben Filter-Tafeln steuern, was je Stufe gebaut wird: KULLVOL, DESTNUR, TURMNUR, MASSNUR (fc:2289–2304), LOD1F, LOD1S, L1NUR (fc:2436–2442).
- Ton: `tonUebertrag` trägt 2 Klassen (Wand |n_y|<0,25, sonst flach; fc:2522–2524), nur Stoffe mit Seh-Klasse stoff/metall, nie Glas (fc:2517–2520),
  angewandt an Stufe 2, Turm-1 und Hülle (fc:3586, 3417). **Abweichung 1:** das Soll misst sich für Nicht-Türme an der L1 (`fragFuer(B,1)`,
  fc:2672–2678), nicht an der L0 — die Stufen gleichen sich an eine Stufe ohne Innenleben, Möbel, Gelände (LOD1F fc:2436) an, nicht an das Nah-Bild.
- **Abweichung 2 (laut Kommentar, nicht nachgemessen):** Kanten-Versatz zur L0 Pueblo L2 1,34 px (fc:2293), Hochhaus L2 1,15 px (fc:2300) —
  über dem Soll 1 px (`LOD_SCHIRM.px` vs:2896).
- Einheit über die Studios: das UMSCHALTEN ist eins (`LOD_SCHIRM` vs:2884–2896, `LOD_DISTANCES` aus dem Gelände-Buch vs:2865). Das BAUEN der
  Stufe ist je Kern eigen: `kindStages` in 7 Kernen deklariert (fc:87, foundry-core.js:446, koerper-core.js:40, porta-core.js:64,
  schmiede-core.js:62, tetrapoda-core.js:42, vehicle-core.js:41); 5 Stufen-Bauer (fc:3564, porta-core.js:1519/1542, foundry-core.js:2026,
  phyto-core.js:2372) und 2 `huelle` (fc:3484, porta-core.js:1567). Das ist die Antwort auf „bauen wir je Studio ein LOD-System“: ja, beim Bauen.

## 4 Zwillinge (zwei Stellen, eine Frage, zwei Antworten)

| Frage | Stelle 1 | Stelle 2 |
|---|---|---|
| Rauheit des Stoffs | fc:2065 holz 0,88 · fc:2068 stein 0,96 · fc:2071 glas 0,15 | sc:2893 holz 0,84 · sc:2892 stein 0,85 · sc:2924 glas 0,05 (STOFF_GESETZ) |
| Stoff-Antwort je Kern (Klasse) | Rauheits-Literale: fc 29 · vehicle-core 37 · foundry-core 7 · porta-core 5 = **78** | EIN `STOFF_GESETZ` sc:2860, Leser in fc: **0** |
| Ab wann ist ein Bau hoch | `turmBau` ≥ 6 Geschosse fc:2683, 3569, 3570, 6138 | Stapel > 11 fc:2734, 5880, 6141 · Klemme 12 fc:183, 2209 |
| Kultur des Herrn | `SG.herr[region]‖'gotisch'` fc:4325, 4378 | `region==='nordisch'?'norwegisch':'gotisch'` fc:4472 |
| Bauer der Stadtmauer | Studio fw:350–355 (Box je Segment) | Welt sw:2743 `_stlMauerBuild` — dieselbe Tafel STADTMAUER, zwei Bauer |
| Ende der frühen Neuzeit | Herr bis Jahr < 1700 fc:4470 | MAUER_BIS 1750 fc:5342 · Band bis 1800 fc:4321 |
| Spannweite aus Festigkeit | Möbel: `HOLZ.weich/hart.spanMax` 0,78 / 1,12 fc:1121–1122 | Haus: `bayMax` 1,7 fest für jeden Stoff fc:181, 420 |

## 5 Die Lücke zum Wort: EIN Haus-Gesetz von der Laubhütte bis zum Zukunfts-Bau

Gezählte Reichweite heute: frühestes Jahr 80 (fc:3623), spätestes 2005 (fc:3631); höchster Bau 12 Geschosse (fc:183), das Hochhaus würfelt
`st 7 ± 1,5` → 6–9 Geschosse (fc:2131, 2209) = Traufe 0,55 + 2,55 + 8 × 2,35 ≈ 21,9 m; breitester Körper W ≤ 15, D ≤ 11 m (fc:2207–2208,
2270), Fuß ≤ 165 m² (fc:2256). Die größten Gebäude der Menschheit (≥ 100 m Spannweite, ≥ 300 m Höhe) liegen außerhalb jeder Klemme.

Fehlende Größen, je mit der Stelle, die sie heute als Konstante oder Enum beantwortet, und EIN Schnitt:

1. **Baujahr als Größe.** Heute: KULTUR ohne Jahr (fc:2121–2154), HAUS liest kein `baujahr` (fc:168–1800). Schnitt: jede KULTUR-Zeile trägt
   ihre Spanne [von, bis] und Region; die Wahl Region × Jahr → Kultur ist EINE Funktion, die EPOCHEN-Pools (fc:3622–3632) und STADT_GRAMMATIK.zeit
   (fc:4321) aus dieser Spanne ablesen statt selbst zu tragen; die drei Jahr-Grenzen 1700/1750/1800 (fc:4470, 5342, 4321) werden Zeilen derselben Achse.
2. **Baustoff der Zeit und des Orts.** Heute: Stoff = Stil-Enum mit Rollen-Tausch (fc:188–197). Schnitt: `P.stoff` (Wand, Decke, Dach) folgt aus
   Ort × Jahr und ist ein Zeilen-Name in `STOFF_GESETZ`; dazu fehlen dort die Zeilen Lehm, gebrannter Ziegel, Kalkputz, Beton, Stahlbeton,
   Reet/Laub (REIN sc:2875–2915 trägt 26 Zeilen, MISCH sc:2920–2925 vier: stahl, eisen, bronze, glas — keine der sechs). Die 27 Rauheits-Literale
   von fc:2062–2090 lesen `STOFF_GESETZ.zeile(stoff).rauheit`; der tote Stil `stroh` wird die Zeile Reet/Laub der frühesten Spanne.
3. **Tragwerk als Größe.** Heute: jeder Bau ist ein Fachwerk-Skelett mit Feld 1,7 m (fc:181, 420, 451–470); `GLATT` malt das Skelett weg
   (fc:207), der Glasturm ist ein Fachwerk mit Rolle `metall` (fc:194). Schnitt: `tragwerk` folgt aus Stoff × Spannweite (Stab-Zelt/Laubhütte,
   Block, Fachwerk, Massivwand, Gewölbe, Skelett Stahl/Beton, Schale); `bayMax` und Schiff-Zahl folgen aus E und σ der Stoff-Zeile — dieselbe Regel,
   die das Möbel schon trägt (fc:1121–1122), am Bau (Rechnung im Plan nach `vision/bau/entwurf-stoff-statik.md`, ohne fail-soft-Heimat).
4. **Spannweite als Größe.** Heute: W 5…15, D 4…11 (fc:2207–2208), Packer Wn ≤ 15, D ≤ 11 (fc:2269–2270), Fuß ≤ 165 m² (fc:2256). Schnitt: die
   Klemmen fallen; die größte freie Spannweite ist L_max(tragwerk, stoff), der Körper teilt sich in Schiffe dieser Breite.
5. **Geschoss-Zahl und -Höhe als Größe.** Heute: Klemme 12 (fc:183, 2209), Hoch-Schwelle an 6 Stellen (Tabelle §4), Geschosshöhen 2,55/2,35 fest
   (fc:179). Schnitt: EINE Konstante „hoch“ ersetzt die 6 Stellen; die Geschoss-Zahl begrenzt die Druckfestigkeit/Eigenlast der Wand-Zeile
   (Mauerwerk niedrig, Skelett hoch), die Geschosshöhe folgt aus Balkenhöhe + lichter Höhe der Nutzung; der Stapel (`stapelBau` fc:2731) bleibt
   der Bauer, die Klemme fällt.
6. **Stufe am Nah-Bild.** Heute: Soll aus L1 (fc:2672–2678), Glas ohne Ton (fc:2517–2520), Budgets 3,3–4,4× über Band (fc:99–101). Schnitt: das
   Soll misst sich an der L0 (`stufe0Bau`), die Hülle der Stufe 3 wird die EINE `huelle` für Haus und Tor (porta-core.js:1567 liest fc:3484).

## 6 Unbelegt

- Ob die Kanten-Versätze (Pueblo 1,34 px, Hochhaus 1,15 px) am heutigen Kopf noch stimmen: nur Kommentar (fc:2293, 2300), nicht gemessen.
- Ob die L1-Soll-Abweichung (§3, Abweichung 1) im Bild sichtbar ist: kein Bildpaar, kein GPU-Lauf (verboten in diesem Lauf).
- Die Zählung 882 Größen / 40 Zwillinge des Vorgängers (koordination vision/bau/entscheid.md §0) — nicht nachgezählt.
- Ob ein anderer Kern (vehicle-core.js:4875 `epocheStufe`) die Epoche als Größe trägt und das Haus sie lesen könnte — außerhalb dieser Domäne nicht gelesen.
- Gebäude über ~22 m Traufe im Spielpfad (Messort stadt-voll): ob je ein Bau > 9 Geschosse in der Welt steht, nicht gezählt.
