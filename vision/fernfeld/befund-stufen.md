# BEFUND STUFEN — das Inventar der Fern- und Stufen-Schalter (ZWISCHENSTAND)

Gelesen im Lese-Baum `lese-main` = main 68d24688 (V18.546.289), 14.11.2026 ab 22:17 (date). Keine GPU, keine Welt. Ein Bild selbst
angesehen: `artifacts/profiband/auge/w28-auge/b6d828a0-dorf-0.5.png`. Herkunft jeder Zahl: **[q]** Quelle Datei:Zeile ·
**[r]** gerechnet · **[b]** am Bild abgelesen · **[k]** Kommentar der Quelle (dort gemessen, nicht von mir).

## Der Schirm, gegen den gerechnet wird

- Sichtfeld vertikal **75°** in Ruhe: `KAM_FOV_GRAD = 75` stamm/koerper-fahrt.js:3146 [q]; die Kamera nimmt es stamm/dirigent-ankunft.js:467 [q]
  (Spieler-Wahl 60–100°, Tempo/Fernglas legen laut Kommentar keine Stufe um).
- Brennweite bei 1080 Zeilen: f = 1080 / (2·tan 37,5°) = **703,7 px je Meter Größe in 1 m Abstand** [r] — dieselbe Formel wie
  `AnazhRealm._brennweite` stamm/vegetation-streu.js:2982 [q]. Pixel-Höhe = H · 703,7 / d.
- Das Soll des Wechsels: `LOD_SCHIRM.px = 1` Bildpunkt Kanten-Versatz stamm/vegetation-streu.js:2881 [q].
- Die Luft ist KEIN Fern-Mittel: physikalische Extinktion, Sicht klar 20 000 m (`luft.sichtKlarM` foundry-core.js:298 [q],
  stamm/bild-himmel.js:2155–2176). Durchlass bei 384 m: exp(−3,912·384/20000) = 0,928 [r] — **jeder Pop unter ~400 m ist voll sichtbar**,
  nichts kaschiert ihn.

## Die Tafel (EINE Zeile je Schalter)

Spalten: Klasse · Ort · Schwelle (Einheit) · Stufe davor → danach · Wechsel · Leser · Höhe H → px an der Schwelle [r] · Silhouetten-Fehler
der groben Stufe an der Schwelle (wie geschätzt).

| # | Klasse | Datei:Zeile | Schwelle | davor → danach | Wechsel | Leser | H → px | Silhouetten-Fehler |
|---|---|---|---|---|---|---|---|---|
| 1 | Bewohner Nah-Wahl (Leib → Mengen-Leib „Kapsel") | stamm/siedlung-bewohner.js:3583–3585 (`nahM 8`, `nahHystM 1`, `nahLeiber 4`), Wahl :1619–1631 | **8 m** UND höchstens **4 Leiber** nach „Bedeutung" (Größe am Schirm × Gang, :1621) | Leib L0 40 000 Dr./8 Draws (koerper-core.js:48) → Satz der Mengen-Stufe 2: 1 700 Dr., 1 Draw, instanziert (koerper-core.js:55) | **harter Tausch**: `g.visible = istNah` :1653–1655 | `_tickBewohner` (`nah`, `b.kreis`), `_bewohnerSatzSchreiben` | 1,8 m → **158 px** bei 8 m; der 5. Nächste schon darunter. Bild: Klumpen-Figur 160 px hoch (y 550–710) ≈ 7,9 m, Gruppe 92 px ≈ 13,8 m [b] | Arme und Beine in EINER Hülle (SDF-Guss „auf gröberem Raster", koerper-core.js:50–54), Spalt Arm–Rumpf/Bein–Bein ~0,1 m geschätzt → **≈ 9 px** bei 8 m; Soll 1 px. **Keine Zeile** in `LOD_SCHIRM.fehler` |
| 2 | Leib Grobstufe (Spieler, Peer, Nah-Leib) | koerper-core.js:49 `ab: 40`; Wahl stamm/koerper-leib.js:406 über `_gelenkGrenzen` stamm/vegetation-streu.js:1851 | **40 m** × Skala (Haushalt; Pixel-Term 0, keine Tafel) | L0 40 000 → L1 14 000 Dr. | harter Tausch (`visible`, Ebenen) koerper-leib.js:417–423, Hysterese `hyst` der Ofen-Zeile | `_gelenkStufe` (Bewohner, Tier, Peer, Werkstatt) | 1,8 m → 32 px | nicht gemessen (keine Zeile); L1 = 35 % der L0 laut Kommentar :45 |
| 3 | Feld der Menge (Mengen-Leib → Glieder-Kapseln im Welt-March) | stamm/vegetation-streu.js:1864–1882 (`mengeKoerperM 1.8`, `mengePx 64`, `mengeHystM 4`, :2884) | **64 px** → N = min(64 m, 1,8·703,7/64) = **19,8 m** [r]; zurück unter 19,8, hinein ab ≈ 23,8 m | 1 700 Dr. Instanz → Kapseln (WELT_MARCH, 1 Draw für alles) | Dither-Schwund 500 ms `WELT_SCHWUND_MS` stamm/dienst.js:2052 | `_feldTraegt`, `_tickBewohner` :1592–1594 | 1,8 m → **64 px** (per Definition) | Kapsel ↔ Hülle ~0,05 m → ≈ 2 px [r, geschätzt] |
| 4 | Bewohner fort (keine Stufe) | stamm/siedlung-bewohner.js:1385, `nearM 260` stamm/siedlung-ort.js:3363 × `fernFaktor 1.25` :3582 | **325 m** (Siedlungs-Mitte, nicht der Leib) | Feld → **nichts** (`_bewohnerFort`) | harter Abgang | `_tickBewohner` | 1,8 m → 4 px | ganzer Leib, 4 px |
| 5 | Tier Grobstufe | tetrapoda-core.js:46 `ab: 35` | **35 m** × Skala | L0 → L1 7 000 Dr./5 Draws | harter Tausch (#2) | `_gelenkStufe` (kreatur-verhalten.js:2901) | Fuchs 0,5 m → 10 px | nicht gemessen |
| 6 | Tier Feld | `ANALOG_NAH_M = 64` stamm/kreatur-leben.js:3406, `feldHystM 10` | **64 m** (Meter, nicht Pixel) | Gelenk-Gestalt → Kapseln | Schwund 500 ms | `_feldGrenzen(false)` | Hirsch 1,5 m → 16 px; Fuchs → 5 px | nicht gemessen |
| 7 | Haus L0→L1→L2 | Gesetz `_wechselGesetz` stamm/vegetation-streu.js:2970; Haushalt `d0 12 / d1 26` foundry-core.js:419–420; Fehler je Vorlage :2905–2950; Leser `_archStufenGrenzen` stamm/studio-bruecke.js:2918 | **max(Fehler·703,7/1 px, 12 bzw. 26 m) × Welt-Skala**: fränkisch L2 26 m, Pueblo L2 33,4 m, Hochhaus L2 32,9, Chinesisch 43,5, Marokkanisch 63,0 m [r] | 132 000/12 Draws → 44 000/4 → 7 000/4 (fachwerk-core.js:99–101) | Wahl mit Hysterese 0,1 (`_stufeNachGrenzen`); Blende des Tauschs im Haus-Pfad **nicht gelesen** | siedlung-bauten.js:482, stoff-instanz.js:2596, siedlung-tor.js:714 | 8 m → 469 px bei 12 m, 217 px bei 26 m | **≤ 1 px** — gemessen je Vorlage (w25-lod-pop, Kommentar :2870–2877) [k]. Die glatten Fassaden im Dorf-Bild stehen < 12 m = **L0**: das ist die Wand-Gestalt (w28-putz-wand, fachwerk-core.js:97–99), kein Stufen-Fehler |
| 8 | Tor / Ausstattung / Bank / Leiter / Brücke | dasselbe Gesetz; Zeilen gate/ausstattung stamm/vegetation-streu.js:2888–2946; fachwerk-core.js:104–135 | Geisttor L2 133,9 m, Lyra L2 109,6 m [r]; Brunnen L1 12 m (Haushalt) | Ausstattung 3 400 → 620 Dr.; Stufe 3 nur Wurf | wie #7 | wie #7 | Tor ~6 m → 32 px bei 134 m | ≤ 1 px gemessen [k] |
| 9 | Haus Mesh-Zone → Hülle im Welt-March | `ARCH_QUALITY_RADIUS_MAX = 150` stamm/dirigent-regler.js:1980; Fernform `huelle` fachwerk-core.js:103 | **150 m** (Meter, Rand des Regler-Radius) | L2 7 000 Dr. → Stufe-3-Liste ≤ 96 Dr. als Kästen im Feld-Pass | Schwund 500 ms | archCull stamm/vegetation-baum.js:2700ff | 8 m → 38 px | Traufe ~0,5 m, Fenster, Gaube fallen → ≈ 2 px Traufe [r, geschätzt]; nicht gemessen |
| 10 | Baum L0→L1→Karte | `_stufenSchirm` / `_lodPerceptionDistance` stamm/vegetation-streu.js:1814–1832; d0 12 / d1 26 / ref 12 / fade 8 / fade0 4 / hyst 3,4 foundry-core.js:419–424 | **12 / 26 m Wahrnehmungs-Distanz**, real × H/12 für H ≥ 12 m (Sichthöhe, Kappe 24 m) | 12 000 Dr. → 2 900 → **2 Dr. Karte** (8 mit Gitter ab 64/128 px, stoff-karte.js:2046) | **Dither-Überblendung** (Bänder fade/fade0, Masken uLodD0/uLodD1) | CPU-Wahl, Masken, Stand-Stempel (:1838ff) | Karte bei **325 px** für jeden Baum ≥ 12 m (12·703,7/26, unabhängig von H) [r]; 6-m-Baum 162 px | **gemessen 1,50–3,16 px** mit Relief (Eiche 1,50, Birke 1,58, Karst 2,41, Fichte 2,66, Weide 3,16; stoff-karte.js:2048–2055) [k] > Soll 1 px; der Baum trägt **keine** Fehler-Zeile (`tree: je({})` :2885). Atlas-Zelle 128×256 (foundry-core.js:788) bei 325 px gezeigt = Vergrößerung 1,27 [r], 8 Ansichten = 45° |
| 11 | Strauch, Wagen (Karten-Arten) | KIND_POLICY impostor; der Wagen „in rohen Metern, Sichthöhe 0" stamm/studio-bruecke.js:2913–2916 | **12 / 26 m** | Strauch 12 000 → 1 100 → Karte 2 Dr. (foundry-core.js:536–546) | Dither (wie #10) | wie #10 | Wagen 1,5 m → 41 px; Strauch 2 m → 54 px | Limousine 0,02 px [k] |
| 12 | Laub-Rand (Vegetation füllt) | `PERF_FOLIAGE_RADIUS_MIN 70 / MAX 240` stamm/dirigent-regler.js:1985–1986 | **70 → 240 m**, wächst 2,5 m je Tick | Karte → nichts | Saum/Totband `CULL_TOTBAND_M 16` vegetation-baum.js:3281 | archCull :2734 | 15-m-Baum → 44 px bei 240 m | ganzer Baum |
| 13 | Karten-Horizont der Deko-Streu | `SCATTER innerM 64 / outerM 384 / promoteM 64` stamm/siedlung-instanz.js:1246ff | **384 m** | Karte → **nichts**, außer am Kamm | Totband 16 m | archCull, Kamm-Krone | 15-m-Baum → 27 px | ganzer Baum, außer er schneidet den Himmel |
| 14 | Kamm-Krone (Umriss am Grat) | `KAMM_KRONE` stamm/gelaende-fern.js:2155 (`dBis 6000`, `augen [2,25,60,120]`, `azN 1024`) | **384 → 6 000 m**, nur Kronen, die einem Auge den Himmel nehmen | Ellipsen-Umriss 8 Ecken | Saison-Neubau | Fern-Ring | — | nicht gerechnet |
| 15 | Nah-Streu L0/L1 und Ende | `NAH_STREU {stufe0 3.5, stufe0Rand .75, radius 24, rand 5}` stamm/vegetation-wiese.js:1213–1217; `_nahStufe` vegetation-streu.js:1890 | **3,5 m** und **24 m** (Meter) | Farn 3 800 → 150, Schilf 2 200 → 300, Gestrüpp 3 700 → 400, Totholz 5 400 → 640, Blume 3 600 → 380, Stein 1 300 (eine Stufe) (foundry-core.js:579–614) | Hysterese (`rand`); Tausch hart | Nah-Streu-Takt, Zellen-Chokepoint (`_foundryFernForm` studio-bruecke.js:2957) | Farn 1 m → **29 px** bei 24 m; Stein 0,4 m → 12 px | Fernform `boden` (Gras/Farn/Schilf/Gestrüpp/Totholz): das Ding wird **Bodenfarbe** → Fehler = das ganze Ding, ~29 px; `gesetz` (Blume, Stein): Gesetz-Block im Welt-March (`gesetzKachelM 64` dienst.js:2048) |
| 16 | Nah-Wiese L1/L2 | `NAH_WIESE {kachel 6, stufe1 5, radius 10}` stamm/daten.js:496–504 | **5 m**, **10 m** | Gras L1 1 000 → L2 130 Dr. (foundry-core.js:579–580) | `_nahStufe` (Hysterese) | Wiese-Takt | Halm 0,42 m (stoff-material.js:3917) → 59 px bei 5 m | nicht gemessen |
| 17 | **Ferne Wiese** (der bewiesene Fall) | `_wieseFern` stamm/vegetation-wiese.js:577; `fern {kachel 12, bis 200, saum 20, fuss 13.8, skalaMax 2.5}` daten.js:509–518 | **Fußabdruck-Abstand Q je Pixel**, Ende **200 m** mit 20 m Saum | Anteil a = min(1, 10/Q, (13,8/Q)³), Größe s = √(Lücke/Anteil) ≤ 2,5 | **stetig** (Anteil + Saum-Smoothstep) | Takt, TSL-Stoff, WGSL-Wahl — EINE Algebra | Halm → 1,5 px bei 200 m | Deckung im Blick erhalten (Gesetz), danach Boden |
| 18 | Boden CDLOD | `BODEN_STUFEN` stamm/gelaende-boden.js:3123–3133 | **36 / 100 / 388,8 m** (Chebyshev-Kasten), Bänder 12/12/40 | Schritt 1,8 → 3,6 → 7,2 → 14,4 m | **Geomorph** (Vertex wandert ins gröbere Netz) | `_voxelChunkLodFor` | Zellbreite an der Grenze 35 / 25 / 13 px [r] | Höhenfehler nicht gemessen (hängt am Relief); Zellen 13–35 px breit — **Meter, nicht Pixel** |
| 19 | Chunk-Ring | `HOLZ_PROFILE ring 4 / 3 / 2` stamm/dirigent-regler.js:2038–2040; Spanne 43,2 m (gelaende-boden.js:3119) | **Ring 4 ≈ 200 m** (Kacheln) | Voxel-Chunk → Fern-Ring | Naht-Weiche 6–24 m (gelaende-fern.js:2131) | Streaming | — | Naht p95 1,3 m, max 4,3 m [k] |
| 20 | Fern-Ring | `FERN_RING schalen 800/3000/8000, snap 6/24/64` stamm/gelaende-fern.js:2117–2124; `camera.far = aussen + 500` bild-sicht.js:2858 | **800 / 3 000 / 8 000 m** | Maschen 6 → 24 → 64 m | Schalen-Grenze, keine Blende gelesen | Fern-Ring-Bau | — | nicht gemessen |
| 21 | Feld-Pass / Panorama | `FELD_PASS rMaxM 40000` stamm/bild-sicht.js:3877 | **40 km** | — | — | Feld-Pass | — | — |
| 22 | Fern-Wasser | `FAR_WATER maxRadius 720, step 10.8` stamm/gelaende-fern.js:2103–2111 | **720 m** | Nah-Kräusel → flacher Spiegel | Rebuild-Hysterese 80 m | Wasser | — | Spiegel 0,35 m unter Nah-Zone |
| 23 | Wege-Karte | stamm/siedlung-wege.js:1862–1863 | Fenster **512 m @ 0,5 m** / **2 048 m @ 2 m** Texel | Texel 0,5 → 2 m | Umzug 48 / 256 m | Boden-Stoff | 3-m-Weg bei 256 m → 8 px breit | Kante ±1 m → ≈ 3 px [r] |
| 24 | Schatten-Reichweite | `HOLZ_PROFILE shadowRange 170 / 110 / 0` dirigent-regler.js:2038–2040; `PERF_SHADOW_RANGE_MAX 170` bild-schatten.js:1634 | **170 m** (Frustum-Halbbreite) | Schatten → **keiner** | hart | Kaskaden | 8-m-Haus → 33 px bei 170 m | der ganze Schatten |
| 25 | Schatten-Kaskaden | `SCHATTEN_KASKADE kontaktM 15, texelM [0.045, 0.17, 0.47]` bild-schatten.js:1714–1717 | **15 m** Kontakt, dann 2 Kaskaden | Texel 4,5 → 17 → 47 cm | Filter-Gesetz | `_schattenFilter` | — | 47 cm Texel bei ~170 m → 2 px [r] |
| 26 | Schatten-Takt | `SCHATTEN_TAKT {nahMax 2, fernFaktor 3}` bild-schatten.js:1639 | Takt, nicht Abstand | — | — | — | — | — |
| 27 | Pfeil steckend | `PFEIL_SICHT_M 40` stamm/kampf.js:2629 | **40 m** | Pfeil → nichts | hart | `_pfeilSteckenSicht` | 0,8 m → 14 px | ganz |
| 28 | Tuch (Simulation) | `nahM 14` koerper-core.js:8352 | **14 m** | Tuch rechnet → ruht in Pose | — | `_tuchTakt` | — | Bewegung, keine Gestalt |
| 29 | Tier-Leben (Vogel, zweite Art) | tetrapoda-core.js:2309–2310 `nahM 60, sichtM 320`; :2688 `nahM 48` | **60 / 320 / 48 m** | Bedeutung nicht gelesen | — | — | — | **nicht gelesen** |
| 30 | Tor-Vorschau / Regel | fachwerk-core.js:10513, 10609 (`nahM 14/30, fernPx 200, residentM 210`) | Meter **und** Pixel gemischt | — | — | Tor-Bau | — | **nicht gelesen** |

Nicht gelesen: Fahrzeug-Kern vehicle-core.js (eigene Stufen? nur die Karten-Regel #11 gelesen), Wasser-Zellen, Werkstatt-Vorschau,
Gras-Biegung `GRAS_BEND_CREATURE_DIST_SQ 324` (stoff-material.js:3950, = 18 m, Wirkung), Boden-Sicht `_bodenSichtAt`.

## Urteil 1 — wie viele Abstands-Gesetze, wer teilt schon eine Quelle

**Es gibt EINE gemeinsame Funktion, aber sie rechnet fast nirgends in Pixeln.** `AnazhRealm._wechselGesetz` + `_stufeNachGrenzen`
(stamm/vegetation-streu.js:2970) lesen schon: Baum, Strauch, Wagen (über die Masken), Haus, Tor, Ausstattung, Bank/Leiter/Brücke,
Leib- und Tier-Grobstufe, das Feld der Menge und der Tiere, Nah-Streu und Nah-Wiese (`_nahStufe`). Doch die Funktion ist
`max(Fehler·f/px, Haushalt)` — und **nur Haus, Tor, Ausstattung tragen eine Fehler-Zeile**. Alle anderen fahren allein ihren
Haushalt in Metern: 12/26 (Baum, Strauch, Wagen), 40 (Leib), 35 (Tier), 64 (Tier-Feld), 3,5/24 (Streu), 5/10 (Wiese). Das ist
die Form des Gesetzes mit **9 Meter-Zahlen als Inhalt**.

Daneben fahren **17 eigene Abstands-Schalter außerhalb** der Funktion (#1, #4, #9, #12, #13, #14, #17–#25, #27, #28; #29/#30 ungelesen):
Bewohner-Nah-Wahl (8 m + Zahl 4), Bewohner fort 325 m, Mesh-Zone 150 m, Laub-Rand 70–240 m, Karten-Horizont 384 m, Kamm 6 km,
ferne Wiese 200 m, Boden-CDLOD 36/100/388,8, Chunk-Ring 4, Fern-Ring 0,8/3/8 km, Fern-Wasser 720, Wege 512/2048, Schatten 170 und 15,
Pfeil 40, Tuch 14. **Summe: 18 Abstands-Gesetze** (1 geteilt + 17 eigene). In Pixeln rechnen davon genau **zwei** ganz: die ferne
Wiese (#17, Fußabdruck je Pixel) und das Feld der Menge (#3, 64 px) — und die Fehler-Zeilen von Haus/Tor/Ausstattung.

## Urteil 2 — Schwellen, an denen das Ding noch groß im Bild steht

- **Bewohner-Kapsel: BESTÄTIGT und schärfer.** Der Tausch Leib → Mengen-Leib hängt an 8 m UND an der Zahl 4 (#1), nie am Pixel.
  Bei 8 m steht der Mensch 158 px hoch [r]; im Dorf-Bild steht die nächste Klumpen-Figur 160 px hoch (≈ 7,9 m) [b] — nicht ~100 px.
  Fehler ≈ 9 px gegen das Soll 1 px; die Stufe hat keine Fehler-Zeile, also prüft sie niemand. Zwischen 8 m und 19,8 m trägt diese
  Stufe jeden Bewohner (158 → 64 px).
- **Baum-Karte bei 325 px.** Jeder Baum ab 12 m Sichthöhe tauscht auf die 2-Dreieck-Karte, wenn er 325 px hoch steht (#10) — die
  Formel H/12 hält die Pixel-Höhe am Tausch konstant hoch. Gemessener Versatz 1,5–3,2 px > Soll; der Baum ist aus der Fehler-Tafel
  ausgenommen. Das passt zu „Kronen als verschmierte Flächen" im Genesis-Bild (nicht selbst angesehen).
- **Streu → Bodenfarbe bei 24 m**: ein 1-m-Farn verschwindet mit 29 px (#15).
- **Haus → Hülle bei 150 m**: 38 px, Traufe ~2 px (#9) — klein, aber ungemessen.
- **Bäume enden bei 240 m (44 px) bzw. 384 m (27 px)** (#12, #13).
- **Schatten enden bei 170 m** — ein Hausschatten von ~33 px fällt weg (#24).
- Gut: Haus/Tor/Ausstattung ≤ 1 px gemessen (#7, #8); ferne Wiese stetig (#17); Boden geomorpht (#18).

## Urteil 3 — Klassen ohne Fern-Stufe (enden einfach)

- **Bewohner jenseits 325 m** — gar nichts (#4); bei einer Stadt größer als 325 m Radius endet die Menge mitten in der Stadt.
- **Bäume jenseits 240/384 m** außerhalb des Kamms (#12–#14): keine Fernform für den Wald in der Fläche, nur der Grat-Umriss und die
  Farbe des Fern-Rings.
- **Streu der Fernform „boden"** jenseits 24 m (#15): Gestalt endet, nur Farbe bleibt.
- **Schatten jenseits 170 m** (#24, HOLZ „nah" 110 m, „kienspan" 0).
- **Pfeil jenseits 40 m** (#27).
- Tiere jenseits ihres Lebens-Radius: **nicht gelesen** (#29).
- Die Luft kaschiert keinen dieser Ränder (Durchlass 0,93 bei 384 m).

## Urteil 4 — Kosten an der Weltgröße statt am Schirm

- **Bewohner (der Täter für „Millionen Personen")**: jede Siedlung, deren Mitte < 325 m liegt, lebt GANZ — jeder Bewohner trägt einen
  Leib (Gruppe, Rig) und läuft je Takt durch die Schleife `for (const b of koepfe)` stamm/siedlung-bewohner.js:1467ff (Ruhende
  gestaffelt `fernS 0,25 s`, :1423). Laut Kommentar :1406: stadt-voll 1 094 Bewohner, davon 140 im Nah-Ring. Kosten ∝ Bevölkerung im
  Umkreis, nicht ∝ Pixel. Dazu `for (const S of alle.values())` :1383 über ALLE bekannten Siedlungen je Takt.
- **WELT_MARCH-Plätze fest**: `felder 4096`, `kapseln 8192` stamm/dienst.js:2036–2039 — eine Zahl, kein Schirm-Gesetz; eine Stadt mit
  mehr Leibern im Feld erschöpft sie („schreit EINMAL laut").
- archCull lief früher über den ganzen Bestand (Kommentar stamm/dienst.js:1923: 90 000 Abweisungen in 31 s); heute in Eimern
  `CULL_EIMER_M 2` (vegetation-baum.js:3289) — geheilt laut Quelle, nicht nachgemessen.
- Streu-Verdichtung `for (const [key, region] of map)` stamm/vegetation-streu.js:1790: über geladene Regionen (Ring ±1) — begrenzt.

## Die Entscheidung (der Entwurf des EINEN Fernfeld-Gesetzes)

**Eine Stufe verdient ihre Schwelle selbst.** `_wechselGesetz` bleibt der EINE Schalter; jede Klasse trägt je Stufe eine GEMESSENE
Fehler-Zeile (Kanten-Versatz zur L0 in Metern, wie w25-lod-pop für Haus/Tor), und die Schwelle ist allein `Fehler·f/px` — der Meter-
Haushalt fällt als Inhalt und bleibt nur als Kosten-Deckel in Pixeln. Wo die Schwelle so zu teuer wird, wird die **grobe Stufe besser**,
nie der Meter verschoben. Reihenfolge nach Bild-Schaden:
1. **Mengen-Leib**: Fehler-Zeile für `koerper` Stufe 2 messen (gleiche Station wie Haus); Nah-Wahl von „8 m + 4" auf das Gesetz.
   Bei ~9 px Fehler läge die Schwelle bei ~63 m — unbezahlbar (Leib 14 000–40 000 Dr.); also trägt die GESTALT der Mengen-Stufe den
   Schnitt (das ist w28-gesicht-grob auf der GTX 1050 — dort einfädeln, nicht daneben bauen).
2. **Baum**: die leere Zeile `tree: je({})` füllen (die fünf gemessenen Werte stehen schon in stoff-karte.js:2048–2055), damit die Karte
   erst bei ≤ 1 px kommt — oder die Karte besser (Relief, Zelle).
3. **Ränder ohne Fernform** (#4, #12–#15, #24) bekommen je eine Fernform im Welt-March statt eines Endes; die Kosten binden an die
   Kapseln im Bild, und die festen Plätze `felder/kapseln` werden ein Schirm-Gesetz.
4. **Bewohner-Takt**: die Siedlung lebt nach Pixeln ihrer Leute (Feld = Satz ohne Rig), nicht nach 325 m um ihre Mitte.

Preis: jeder Schritt muss unter der Preis-Treppe (vision/REGELN.md) bleiben; den laufenden Schnitt „Preis des Orts" (vision/preis/ENTSCHEID.md,
VRAM/Heap/größtes Bild) habe ich nur angelesen.

## Ehrlich offen

- Silhouetten-Fehler von #1, #3, #9 sind GESCHÄTZT (Spaltbreite × f/d), nicht gemessen; #2, #5, #6, #16, #18–#20 ohne Fehlerzahl.
- #29, #30, vehicle-core.js, Haus-Blende (Dither oder hart) nicht gelesen.
- Das Genesis-Bild und die übrigen Bild-Ordner nicht angesehen; nur das Dorf-Bild.
