# Lesen (g): LOD-Stufen und ferne Stadt — main 18058dba

**Feld:** fachwerk-core.js (12 518) · stamm/siedlung-wege.js (Ferne der Stadt, 2014–2388, 2969–2986) · stamm/studio-bruecke.js (Stufen-Grenzen 2916–2945, Hülle fern 3011–3029, Satz-Horizont 3606–3681) · stamm/vegetation-streu.js (LOD_SCHIRM 2881–3013) · stamm/stoff-instanz.js (2 682; `_foundryLodForEntry` 2636–2664) · stamm/siedlung-bauten.js (3 447; LOD-Takt 470–567) · stamm/dienst.js (`_satzHorizont` 725–757, WELT_MARCH 2303–2324) · stamm/dirigent-regler.js (Mesh-Zone 274–280, 2119) · stamm/siedlung-ort.js (Erwachen 3088–3099, 3609–3633) · foundry-core.js (lod d0/d1 432–438) · stamm/gelaende-fern.js (2 675) · stamm/siedlung-instanz.js (1 323; Baum-/Karten-Fassade, trägt kein Haus-Eigenes) · stamm/siedlung-satz.js (1 981) · stamm/stoff-karte.js (2 818).

**Kurzbefund.** Die vier Mesh- und March-Stufen eines Hauses (L0, L1, L2, Stufe-3-Satz) sind DERSELBE LEIB: alle lesen das eine `B` aus `HAUS`/`planBau` (`B.masse` mit eY/rY/hip/ovZ/ovX/dachRolle, fachwerk-core.js:1800) und denselben Samen (`buildInstance` 6321, `huelle` 3484). Die ferne Stadt (Masse Stufe 1 `kachelMassen` 4074 und Stufe 2 `planMassen` 4131) ist ein ZWILLING: `hausMasse` (4119) rechnet Traufe, First, Überstand, Dachform und Farbe aus dem Parameter-Vektor mit eigenen Zahlen (`STADT_MASSEN` 4072, `STADT_FERNE` siedlung-wege.js:2975), nie aus `B.masse`. Beim Wechsel Satz → Masse (300 m, `nahM`) springt jedes Haus 0,45–2,55 m in der Traufe, verliert Walm, Flügel, Stil-Dachfarbe und den gemessenen Wandton; beim Wechsel Masse Stufe 1 → Stufe 2 springt jedes Haus an ein anderes Los. Jenseits `reichM` 3000 m und am Horizont (gelaende-fern.js trägt kein Haus) steht nichts.

## (1) DIE STUFEN

Brennweite am Soll-Schirm: 1080 / (2·tan 37,5°) = 703,7 px/m (vegetation-streu.js:2997–3001, KAM_FOV_GRAD 75 koerper-fahrt.js:3251).

| # | Name | Erzeuger (datei:zeile) | Schwelle | was sie vom Haus trägt | woher die Maße |
|---|---|---|---|---|---|
| S0 | L0 „Ring A · Promotion" | fachwerk-core.js:6321 `buildInstance` → `HAUS` 168 | bis Grenze L1 = max(fehler₁·703,7, d0 12 m)·Skala (vegetation-streu.js:2993; studio-bruecke.js:2939), Hysterese ±10 % (vegetation-streu.js:2891/2898) — 12 m (alemannisch) bis 13,8 m (niedersächsisch) | alles: Innenleben, Türen, Fenster, Fachwerk, Kamin, Flügel | `P` aus Rezept+Samen; Traufe `eaveY` 215, First `ridgeY` 216 |
| S1 | L1 „Flächen-Stufe" | fachwerk-core.js:3571 `stapelBau(…{flaechig:1}, LOD1S/LOD1F)` | ab Grenze L1 bis Grenze L2 = max(fehler₂·703,7, d1 26 m): 26 m (alem.) · 33,4 (pueblo) · 36,5 (japan.) · 43,5 (chin.) · 63,0 m (marokk.) | Hülle ohne Innenleben, Fenster-Schlaf, Gefach-Fläche | derselbe `B` |
| S2 | L2 „Destillat" | fachwerk-core.js:3569–3588 (`DESTNUR`, `lod2Koerper` 3377, `fensterFern`) | ab Grenze L2 bis Mesh-Zone `ARCH_QUALITY_RADIUS_MAX` 150 m (dirigent-regler.js:2119, 279) | Körperliste (`koerperListe` 2954) mit Dachhaut, Ständer-Ring, Fern-Fenster, Ton des Solls | `B.masse` |
| S3 | Satz im Welt-March (Stufe 3 „Hülle") | fachwerk-core.js:3484 `huelle` → studio-bruecke.js:3495 `_weltKapselSpawn` mit `_huelleFern` 3018 | jenseits 150 m bis Pixel-Horizont pxJeM·√(A/16) (dienst.js:746; ≈ 1,1 km bei 40 m², 1,6 km bei 80 m²), Austritt ×1,1 (`satzBand`, studio-bruecke.js:3665); Stadthaus höchstens `nahM` 300 m (studio-bruecke.js:3656) | Kästen und Keile ≥ ¼ des größten (Haupt, Flügel, Turm, Dach mit Walm); Kamin, Gaube, Vorbau fallen (3011–3014) | `B.masse` über `koerperListe` |
| — | Stufe 3 nurWurf (Schatten, nie gezeigt) | fachwerk-core.js:89–103 | jede gezeigte Stufe wirft sie | ≤ 96 Dreiecke | `B.masse` |
| S4 | Masse Stufe 2 (Stadt, an echten Losen) | fachwerk-core.js:4131 `planMassen` → siedlung-wege.js:2224 `_stadtFerneBauen` | Stadthaus ohne Mesh und ohne Satz (`_stadtMasseStand` 2141–2152), Kachel bis `reichM` 3000 + Ringe·256 m (2033) | Kasten W×(Traufe+2,5)×D, Satteldach-Prisma oder nichts, zwei Farben | Vektor `sl.ov` → `hausMasse` 4119 (`STADT_MASSEN`) |
| S5 | Masse Stufe 1 (unerwachte Kachel) | fachwerk-core.js:4074 `kachelMassen` → siedlung-wege.js:2061 | Kachel ohne Plan bis `reichM`; fällt, sobald Plan/Vorrat da (2047–2059) | wie S4, an eigenen Plätzen | DORF-Liste (4078) + Platz-Regel (4092, 4110) + `hausMasse` |
| S6 | Ferne Gassen in der Wege-Karte | siedlung-wege.js:2346 `_stadtFerneStrassen` | d < `strassenM` 1200 m, fallen > 1200 + 256 m (2086) | Straßen der Kachel (Belag, Saum, Bord) | `kachelNetz` 3844 + `gassenBelag` (4084) |
| S7 | Straßen-Band | siedlung-wege.js:2284 `_stadtFerneBand` | d > `bandAbM` 768 m, zurück unter 768 − 64 m (2082) | EINE Kiste je Gasse (erster→letzter Punkt) | `kachelMassen.strassen`, `WEG_GESETZ`, `STEIN_GESETZ` |
| — | Horizont | stamm/gelaende-fern.js | — | kein Haus, keine Stadt (Treffer nur Zell-Merker 2496–2613) | — |

Wach-Schwelle der Kachel (S5/S4 → S0–S3): `nearM` 260 + `mehrM`, `vorlaufM` 160, Bau-Zeit ≤ 30 s (siedlung-ort.js:3089–3097, 3611–3621).

## (2) DIE GRÖSSEN

| # | Name | Wert | Einheit | datei:zeile | Anker | Leser | Urteil |
|---|---|---|---|---|---|---|---|
| 1 | foundH (Sockel Haus) | 0,55 | m | fachwerk-core.js:178 | keiner | 211, 437, 439 | GESETZT |
| 2 | egH | 2,55 | m | fachwerk-core.js:178 | keiner | 214, 521, 1503 | GESETZT |
| 3 | ogH | 2,35 | m | fachwerk-core.js:178 | keiner | 214, 1598 | GESETZT |
| 4 | ovEave (Traufüberstand) | 0,42 | m/Seite | fachwerk-core.js:181 | keiner | 1800 (`ovZ`) → 3035 | GESETZT |
| 5 | ovRake (Ortgang) | 0,32 | m/Seite | fachwerk-core.js:181 | keiner | 1800 (`ovX`) → 3050 | GESETZT |
| 6 | Neigungs-Deckel | 62 | ° | fachwerk-core.js:208 | keiner | 208 (nur HAUS) | GESETZT |
| 7 | STIL_GRENZNEIGUNG (6 Stile + 28 alt) | 14/30/18/4/22/38, 28 | ° | fachwerk-core.js:160, 165 | keiner | 208, 2230 | GESETZT (7) |
| 8 | Geschoss-Klammer | 1…12 | – | fachwerk-core.js:183 | keiner | 214 (nur HAUS) | GESETZT |
| 9 | kindStages.haus | [0,1,2,3] | – | fachwerk-core.js:87 | Lab-Stufen (Kopf 27–40) | 149, studio-bruecke.js:2934 | GESETZT (Anker) |
| 10 | budget.haus tris L0/L1/L2/S3 | 132 000 / 44 000 / 7 000 / 96 | Dreiecke | fachwerk-core.js:100–103 | Ratsche gate:asset-contract (74–76) | 2959, 6338 | GESETZT (Anker, 4) |
| 11 | KOERPER_TEILE_MAX | 24 | Teile | fachwerk-core.js:2953 | Welt-March-Kapazität (2951) | 2962 | GESETZT (Anker) |
| 12 | KOERPER_RANG | 14 Ränge | – | fachwerk-core.js:2952 | keiner | 2956 | GESETZT |
| 13 | KOERPER_INNEN wand/dach | 0,015 / 0,03 | m | fachwerk-core.js:2873 | keiner | 2976–2977, 3017 | GESETZT (2) |
| 14 | lod.d0 (Haushalt L1) | 12 | m | foundry-core.js:433 | ABAB Radeon (427–431) | vegetation-streu.js:3011 | GESETZT (Anker) |
| 15 | lod.d1 (Haushalt L2) | 26 | m | foundry-core.js:434 | ABAB Radeon (427–431) | vegetation-streu.js:3011 | GESETZT (Anker) |
| 16 | LOD_SCHIRM.px | 1 | px | vegetation-streu.js:2896 | Norm „< 1 Pixel" (2890) | 2993 | GESETZT (Anker) |
| 17 | LOD_SCHIRM.zeilen | 1080 | Zeilen | vegetation-streu.js:2897 | Soll-Schirm (2890) | 2999 | GESETZT (Anker) |
| 18 | LOD_SCHIRM.hyst | 0,1 | Anteil | vegetation-streu.js:2898 | keiner | studio-bruecke.js:2943 | GESETZT |
| 19 | LOD_SCHIRM.fehler.haus (32 Vorlagen × L1/L2) | 0–0,0196 / 0,0029–0,0895 | m | vegetation-streu.js:2926–2958 | Messung `kantenVersatz`, gate:haus-fern P (2881–2887) | 2992 | GESETZT (Anker, 64) |
| 20 | KAM_FOV_GRAD | 75 | ° | koerper-fahrt.js:3251 | keiner | vegetation-streu.js:2999 | GESETZT |
| 21 | ARCH_QUALITY_RADIUS_MAX (Mesh-Zone) | 150 | m | dirigent-regler.js:2119 | keiner | 279 → 338/386 | GESETZT |
| 22 | WELT_MARCH.satzPx | 16 | px² | dienst.js:2322 | keiner | 746 | GESETZT |
| 23 | WELT_MARCH.satzBand | 0,1 | Anteil | dienst.js:2323 | keiner | studio-bruecke.js:3665, 3681 | GESETZT |
| 24 | WELT_MARCH.weichFaktor | 1,25 | × | dienst.js:2324 | keiner | `_weltSatzWeichen` (dienst.js:739–741) | GESETZT |
| 25 | Hülle-fern-Viertel | 1/4 | Volumen | studio-bruecke.js:3027 | „bei 150 m unter drei Bildpunkten" (3014) | 3501 | GESETZT (Anker) |
| 26 | STADT_FERNE.reichM | 3000 | m | siedlung-wege.js:2976 | keiner | 2033 | GESETZT |
| 27 | STADT_FERNE.strassenM | 1200 | m | siedlung-wege.js:2977 | keiner | 2086 | GESETZT |
| 28 | STADT_FERNE.bandAbM | 768 | m | siedlung-wege.js:2978 | „drei Kacheln" = 3·256 (2972), Literal | 2074, 2082 | GESETZT (Anker) |
| 29 | STADT_FERNE.bandSpielM | 64 | m | siedlung-wege.js:2979 | keiner | 2082 | GESETZT |
| 30 | STADT_FERNE.bandHubM | 0,6 | m | siedlung-wege.js:2980 | keiner | 2321 | GESETZT |
| 31 | STADT_FERNE.bandDickM | 3 | m | siedlung-wege.js:2981 | keiner | 2321, 2323 | GESETZT |
| 32 | STADT_FERNE.sockelM (unter Grund) | 2,5 | m | siedlung-wege.js:2982 | keiner | 2242 | GESETZT |
| 33 | STADT_FERNE.ueberM (Dach ganz) | 0,5 | m | siedlung-wege.js:2983 | keiner | 2245 | GESETZT |
| 34 | STADT_FERNE.jeTakte | 6 | Takte | siedlung-wege.js:2984 | keiner | 2030–2031 | GESETZT |
| 35 | STADT_FERNE.nahM | 300 | m | siedlung-wege.js:2985 | keiner | studio-bruecke.js:3656 | GESETZT |
| 36 | STADT_MASSEN.einzugM | 4,2 | m | fachwerk-core.js:4072 | keiner | 4092, 4102, 4110 | GESETZT |
| 37 | STADT_MASSEN.platzM | 11 | m | fachwerk-core.js:4072 | keiner | 4092 | GESETZT |
| 38 | STADT_MASSEN.eckeM | 9 | m | fachwerk-core.js:4072 | keiner | 4092 | GESETZT |
| 39 | STADT_MASSEN.geschossM | 2,7 | m | fachwerk-core.js:4072 | keiner | 4102, 4120, 4492, 4494 | GESETZT |
| 40 | STADT_MASSEN.sockelM | 0,5 | m | fachwerk-core.js:4072 | keiner | 4102, 4120, 4492, 4494 | GESETZT |
| 41 | STADT_MASSEN.flachGrad | 8 | ° | fachwerk-core.js:4072 | keiner | 4119 | GESETZT |
| 42 | STADT_MASSEN.strasseJe | 4 | Punkte | fachwerk-core.js:4072 | keiner | 4082–4083 | GESETZT |
| 43 | Masse-Literale: Mindest-W/D, Fuge, Abstand, Rand | 3 / 0,8 / 0,6 / 1 | m | fachwerk-core.js:4110 (1 auch 4092, 4102) | keiner | 4110–4112 | GESETZT (4) |
| 44 | Band-Mindestbreite | 1,2 | m | siedlung-wege.js:2310 | keiner | 2310–2311 | GESETZT |
| 45 | SIEDLUNG.cellM (Kachel) | 256 | m | fachwerk-core.js:3662 | keiner | 3830, 3845; siedlung-wege.js:2028 | GESETZT |
| 46 | STADT_NETZ tore/spiel/jeKachel/torLuecke/mauerInnen/turmJe | 5 / 0,4 / 190 / 3,5 / 2,4 / 42 | –/–/Häuser/m/m/m | fachwerk-core.js:3819 | jeKachel: Spike 15.11. 193–194 (3817); sonst keiner | 3830–3866, 3904, 4038 | GESETZT (6, 1 mit Anker) — beide Stufen lesen es |
| 47 | STADT_FORM (16 Zahlen) | randTeil 0,1 … tiefMax 11 | gemischt | fachwerk-core.js:3892 | keiner | 3894–3995, 4102, 4492–4494 | GESETZT (16) — beide Stufen lesen es |
| 48 | AUTO_SETTLEMENT nearM/vorlaufM/bereitS/bauZeitMaxS | 260 / 160 / 10 / 30 | m/m/s/s | siedlung-ort.js:3611–3621 | vorlaufM Fahrt-Probe (3613), bereitS Export 8,3 s (3617); sonst keiner | 3089–3097 | GESETZT (4, 2 mit Anker) |
| 49 | Wasser-Rand der Ferne | 0,2 | m | siedlung-wege.js:2238 | keiner | 2238, 2316, 2367 | GESETZT |
| 50 | Grenze L1/L2 je Vorlage | 12–13,8 / 26–63 | m | vegetation-streu.js:2993 | — | studio-bruecke.js:2939, siedlung-bauten.js:487 | FOLGT (fehler × Brennweite, max Haushalt) |
| 51 | Pixel-Horizont des Satzes | ≈ 1 100–1 600 | m | dienst.js:746 | — | studio-bruecke.js:3654 | FOLGT (pxJeM · √(Ansicht/satzPx)) |
| 52 | Traufe/First/Walm/Überstand S0–S3 | eaveY/ridgeY | m | fachwerk-core.js:214–216, 1800 | — | 2995–3050 (`koerperListe`), 3377 | FOLGT (HAUS → B.masse → Liste) |
| 53 | Ton der Kachel am Ort | Palette ± tonHub | – | fachwerk-core.js:3971 | — | 4107, 4113 | FOLGT (STADT_FORM, netzHash) |

## (3) ZWILLINGE

| # | Größe | Stufe A (S0–S3, `HAUS`/`B.masse`) | Stufe B (S4/S5, `hausMasse`/`STADT_FERNE`) | sichtbare Folge beim Wechsel |
|---|---|---|---|---|
| Z1 | Traufhöhe | fachwerk-core.js:178, 214–215: 0,55 + 2,55 + (n−1)·2,35 → n=2 5,45 · n=4 10,15 · n=8 19,55 m | fachwerk-core.js:4120: n·2,7 + 0,5 → 5,90 · 11,30 · 22,10 m | an 300 m (`nahM`) wächst jedes Stadthaus um 0,45 / 1,15 / 2,55 m; der First steigt mit. Zweiter Leser derselben Zwillingszahl: der Grundriss des NAHEN Hauses wächst nach `geschossM` (4492, 4494), nicht nach egH/ogH |
| Z2 | Dachüberstand | fachwerk-core.js:181 → 1800: Traufe 0,42, Ortgang 0,32 m je Seite | siedlung-wege.js:2983, 2245: 0,5 m gesamt = 0,25 je Seite, an allen vier Seiten gleich | Dach schrumpft an der Traufe um 0,17 m je Seite |
| Z3 | Sockel | fachwerk-core.js:178, 211: foundH 0,55 (+2,6 bei pilotis) | fachwerk-core.js:4072/4120: sockelM 0,5, pilotis ignoriert; Kasten reicht 2,5 m unter den Grund (siedlung-wege.js:2242) | Pfahlhaus fällt fern auf den Grund |
| Z4 | Dachform | fachwerk-core.js:217, 1800: ROOFMODE sattel/alt/dome/stepped/flat/rund + `hip` → Keil mit `walm` (2998) | siedlung-wege.js:2177–2187: immer Sattel-Prisma; flach nur bei `dachTyp==="flach"` oder Neigung < 8° (4119) | Walm, Krüppelwalm, Kuppel, Rund, Terrasse werden an 300 m Satteldach |
| Z5 | Flach-Schwelle | fachwerk-core.js:160, 208: Glas trägt ab 4° ein Dach | fachwerk-core.js:4072, 4119: unter 8° kein First | Glas-Haus 4–8°: Dach verschwindet |
| Z6 | Dachfarbe | fachwerk-core.js:1800, 3069–3074: `dachRolle` = STILMODE RM.ziegel (modern/glas → dachmod, huette → stamm, stroh → stroh; 191–196) | fachwerk-core.js:4123: immer `_colFor("ziegel")` | Strohdach, Schindel und Flachdach-Moderne wechseln an 300 m auf Ziegelton |
| Z7 | Wandfarbe | fachwerk-core.js:2940–2945, 2995: Rollenfarbe × gemessener Fassaden-Ton `B.wandTon` (Klemme 0,25–1,7) | fachwerk-core.js:4123: Rollenfarbe ohne Faktor | Wandton springt (Fachwerk-Mittel fällt weg) |
| Z8 | Grundriss-Teile | fachwerk-core.js:2952: Haupt, Flügel, Hof-Arm, Turm, Anbau, Portikus, Kamin … (S3 behält jeden ≥ ¼, 3027) | fachwerk-core.js:4120: EIN Kasten W×D | L-Haus, Flügel, Turm, Anbau fallen an 300 m weg |
| Z9 | Lage und Maß Stufe 1 | Stufe 2: Lose aus `dorfLayout` (5365), `planMassen` an `sl.x/sl.z`, `p.W/p.D` (4135) | Stufe 1: eigene Plätze (einzugM 4,2, platzM 11, eckeM 9; 4092), W = max(3, min(p.W, breit−0,8)), D = min(p.D, tief−5,2) (4110); Grund = Gelände statt Slot-y (siedlung-wege.js:2237) | kommt der Plan der Kachel, springt jedes Haus an ein anderes Los und in andere Breite (eingestanden 4067, siedlung-wege.js:2019–2020) |
| Z10 | Klammern (latent) | fachwerk-core.js:183/208: Geschosse ≤ 12, Neigung ≤ 62° | fachwerk-core.js:4120: ungeklammert (`max(1,storeys)`, roher `pitchDeg`; das Rezept klemmt nur nach unten, 2230) | nur bei Vektoren jenseits der Klammer; nicht beobachtet |

Kein Zwilling: die Schwellen L0/L1/L2 (ein Gesetz `_wechselGesetz` für Takt und Kalt-Schätzer, stoff-instanz.js:2652 = siedlung-bauten.js:485), Kamin/Gaube/Fenster (fallen nach Regel `_huelleFern` aus derselben Liste), das Straßen-Netz (S5/S6/S7 und die wache Kachel lesen `kachelNetz`, fachwerk-core.js:5365, 9744), Ton der Kachel (S5 `stadtTonAn` 4107; S4 nimmt `p.col` „der Export trägt sie schon" 4122).

## (4) WAS DER SAMEN ERREICHT

- **S0–S3:** ja, gleich. `buildInstance(rezeptId, seed, lod, ov)` (fachwerk-core.js:6321) und `huelle(rezeptId, seed, ov)` (3484–3492) bauen aus demselben `p.seed` dasselbe `B`; Fenster-Schlaf würfelt in jeder Stufe gleich (Kopf 92–93), der Satz holt die Liste derselben Stufe (`_foundryFlattenFor`, studio-bruecke.js:3480).
- **S4 (Masse an Losen):** halb. Der Vektor `sl.ov` des Loses erreicht sie (W, D, storeys, pitchDeg, dachTyp, col, stil — fachwerk-core.js:4133–4136), der Bau `B` nicht: Traufe, Walm, Überstand, Flügel, Dachrolle und Wandton kommen nicht an (Z1–Z8).
- **S5 (Masse unerwachter Kachel):** schwächer. Der Same der Kachel (`viertelWort` 4015) erreicht dieselbe DORF-Liste (4078), aber Haus r steht an einem anderen Platz (Reihung nach Nähe zur Kreuzung, 4100–4106) und in beschnittener Breite (4110) — die Adresse des Hauses ist dort nicht dieselbe wie nah.
- **Dörfer ohne Stadt:** keine Masse; jenseits des Pixel-Horizonts (S3) steht nichts. **Jenseits `reichM` 3000 m und am Horizont** (gelaende-fern.js): kein Haus, keine Stadt.

Stufen: 8 (+ nurWurf-Schatten, Horizont leer) · Größen gesamt: 152 (53 Zeilen) · davon GESETZT ohne Anker: 69 · Zwillinge: 10 (davon 1 latent)
