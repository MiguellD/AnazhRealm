# BEFUND STUFEN — jeder Fern- und Stufen-Schalter am EINEN Schirm-Gesetz (ZWISCHENSTAND)

Gelesen im Lese-Baum `lese-main` = main 68d24688 (V18.546.289), 14.11.2026 ab 22:29 (date). Keine GPU, keine Welt, kein Browser.
Neu geschrieben über den Vorgänger von 22:17 (2ee3b487): dessen Zeile „Nah-Streu" warf zwei Klassen zusammen (Ring 24 m und Streu-Regionen
64 m), ihm fehlten die Spalte 360 Zeilen, die Verdeckung 30 m, die Ankunfts-Ferne ×128 und das Urteil 5.
Herkunft: **[q]** Quelle Datei:Zeile · **[r]** von mir gerechnet · **[k]** Kommentar der Quelle (dort gemessen, nicht von mir).

## 0. Das Gesetz, ganz gelesen

- **Der Schirm**: `_schirmMessen` stamm/bild-kosten.js:3560–3573 liest `renderer.getDrawingBufferSize` (Zeilen samt Pixel-Verhältnis) und
  `pxJeM = zeilen / (2·tan(cam.fov/2))` mit dem LEBENDEN Sichtfeld der Kamera. Gemessen einmal je Takt vor allem anderen
  (stamm/dirigent-takt.js:107–108, auch wenn die Welt ruht) und im Resize-Griff (stamm/dirigent-ankunft.js:618–631: `_schirmMessen()` +
  `_stufenSchirm()`). `_schirm()` :3575 gibt den gemerkten Wert.
- **Die Brennweite der Stufen**: `_brennweite(zeilen)` stamm/vegetation-streu.js:2982–2986 = zeilen / (2·tan(KAM_FOV_GRAD/2)), KAM_FOV_GRAD = 75
  stamm/koerper-fahrt.js:3146 — das RUHE-Sichtfeld, nicht `cam.fov`. Also zwei Brennweiten im Spiel: Stufen (Ruhe-FOV) gegen Tuch, ferne
  Wiese, Himmel (`pxJeM`, lebendes FOV: stamm/koerper-fahrt.js:184, stamm/vegetation-wiese.js:1197, stamm/bild-himmel.js:1340). Gewollt laut
  Kommentar (:2958–2959 „Tempo und Fernglas legen keine Stufe um").
- **Zahlen**: tan 37,5° = 0,7673 → **f(1080) = 703,7 px**, **f(360) = 234,6 px** je Meter Größe in 1 m Abstand [r]. Pixel-Höhe = H·f/d.
- **`LOD_SCHIRM`** stamm/vegetation-streu.js:2880–2955: `px 1` (Soll), `zeilen 1080` (nur Rückfall ohne Zeichenpuffer), `hyst 0,1`,
  `leib {feldHystM 10, mengeKoerperM 1,8, mengePx 64, mengeHystM 4}`, `bewegungMS 1,4`, `fehler` je Art × Vorlage × Stufe:
  `tree: je({})` (LEER, :2892), `gate` 10 Vorlagen, `haus` 32 Vorlagen, `ausstattung` 6 Vorlagen (nur Stufe 1).
- **`_wechselGesetz(kind, stufe, groesse, zeilen, haushalt, vorlage)`** :2970–2979 = `max(e·f(zeilen)/px, h)·groesse`; e = Fehler der
  Vorlage, **0 ohne `vorlage`**; h = der mitgegebene Haushalt oder `_wechselHaushalt` :2990–2998 (Budget-Zeile `ab` des Buchs, sonst d0 12 /
  d1 26 m aus foundry-core.js:419–420, beim Baum /ref 12). Folge: **wer ohne Vorlage fragt, bekommt reine Meter — die Zeilen des Schirms
  wirken dann nicht**, obwohl der Ruf durch das Gesetz geht.
- **Woher „fehler"**: GEMESSEN am Bau, Station w25-lod-pop (`kantenVersatz`, L0 und Stufe je Peilung gerastert, Chamfer der Kanten),
  Kommentar :2866–2872 [k]; die Linse gate:haus-fern P misst jede Zeile an ihrer Grenze nach [k]. Eingetragen als Zahl von Hand in die Tafel
  (kein Leser rechnet sie zur Laufzeit), also ein eingefrorenes Messergebnis.
- **`_stufeNachGrenzen`** stamm/siedlung-bauten.js:3242–3252: wer die Stufe trägt, hält sie bis (1−h)·ab, hinein ab (1+h)·ab — **harter
  Index**; der Tausch selbst (Blende ja/nein) liegt beim Leser. **`_stufeGemerkt`** :3259–3297 rechnet nur neu bei neuem Grenzen-Objekt G,
  neuer Größe, neuer Stufe oder Weg > Spielraum.
- **Hysterese des Felds** `_feldGrenzen` stamm/vegetation-streu.js:1864–1883: N = min(ANALOG_NAH_M 64, 1,8·f/64) für die Menge, sonst 64;
  hm = 4 (Menge) bzw. 10 (Tier); ab = N + hm/2, h = hm/(2N+hm) → **hinein ins Feld jenseits N + hm, zurück diesseits N** [r aus der Formel].
- **Bewegung**: nur in der Nah-WAHL der Bewohner: `_bedeutung` :1906–1915 = H·f/d·(1 + Tempo/1,4) — wählt WER, nie WO getauscht wird.
- **Ankunft**: `_ankunftsFerne()` stamm/dirigent-ankunft.js:913–916 = **ANKUNFT_FERNE 128** (:1893) bis zum ersten Welt-/Fernbild, multipliziert
  jeden Abstand der Haus-/Baum-Wahl (stamm/siedlung-bauten.js:479–487, stamm/stoff-instanz.js:2598) → unter dem Ladeschirm alles grob.

## 1. Die Tafel

Spalten: # · Klasse · Datei:Zeile · Schwelle (Einheit) · liest Schirm? · davor → danach (Dreiecke/Draws, soweit gelesen) · Wechsel ·
H → Abstand am Tausch → **px bei 1080 / px bei 360** [r].

| # | Klasse | Datei:Zeile | Schwelle | Schirm? | davor → danach | Wechsel | H · d · px 1080 / 360 |
|---|---|---|---|---|---|---|---|
| 1 | Bewohner Nah-Wahl (Leib ↔ Satz der Gestalt) | stamm/siedlung-bewohner.js:3583–3585 (`nahM 8, nahHystM 1, nahLeiber 4`), Wahl :1619–1631, Tausch :1653–1656 | **8 m** (+1 zurück) UND die **4** Bedeutendsten | **nein** (Meter + Zahl; nur die Rangfolge liest f) | Leib L0 40 000 Dr./8 Draws (koerper-core.js:48) → Satz 1 700 Dr./1 Draw instanziert (koerper-core.js:55) | **hart** `g.visible = istNah` | 1,8 m · 8 m · **158 / 53 px**; der 5. Nächste steht schon näher im Satz |
| 2 | Leib-Grobstufe (Spieler, Peer, Nah-Leib) | koerper-core.js:49 `ab: 40`; `_gelenkGrenzen` stamm/vegetation-streu.js:1851–1857 | **40 m** × Skala | **nein** (`_wechselGesetz` ohne Tafel → Haushalt) | 40 000 → 14 000 Dr., 8 → 6 Draws | hart (`visible`), Hysterese der Ofen-Zeile | 1,8 m · 40 m · **32 / 11 px** |
| 3 | Feld der Menge (Satz → Glieder-Kapseln im Welt-March) | stamm/vegetation-streu.js:1864–1883; `mengePx 64` :2884; Leser stamm/siedlung-bewohner.js:1367, :1590–1611 | **64 px** (Leib 1,8 m), gedeckelt **64 m** | **ja** `_brennweite(z)` | 1 700 Dr. Instanz → Kapseln (ein Welt-March für alles) | Schwund 500 ms `WELT_SCHWUND_MS` stamm/dienst.js:2052 | 1080: zurück < **19,8 m** (64 px), hinein > **23,8 m** (53 px). 360: zurück < **6,6 m**, hinein > **10,6 m** — im Bild 1080 sind das **192 → 120 px** |
| 4 | Bewohner fort | stamm/siedlung-bewohner.js:1385; `nearM 260` stamm/siedlung-ort.js:3363 × `fernFaktor 1,25` :3582 | **325 m** um die MITTE der Siedlung | nein | Feld → **nichts** (`_bewohnerFort` :3469) | hart | 1,8 m · 325 m · **3,9 / 1,3 px** (am Leib, nicht am Ort) |
| 5 | Tier-Grobstufe | tetrapoda-core.js:46 `ab: 35`, `hyst 0,1` | **35 m** × Körpergröße | nein (Haushalt) | 62 000/8 → 7 000 Dr./5 Draws | hart | Fuchs 0,5 m · 35 m · **10 / 3,4 px**; Kommentar: Beinschwung dort ~2,7 px [k] |
| 6 | Tier-Feld | `ANALOG_NAH_M 64` stamm/kreatur-leben.js:3406; `_feldGrenzen(false)` | **64 m** (hinein 74, zurück 64) | **nein** (N fest 64) | Gestalt → Kapseln | Schwund 500 ms | Hirsch 1,5 m · 74 m · **14 / 4,8 px** |
| 7 | Fell (Strähnen, Schalen) | stamm/kreatur-verhalten.js:2846–2872; `_fellHoehe` :3924–3935 | **1 px** Höhe des Schalen-Stapels | **ja** `_brennweite(z)`, `_stufeGemerkt` | Strähnen ↔ Haut mit FELL_LOOK | hart (`visible`) | Höhe = Median der Schalen, AM MESH abgelesen — gemessen, nicht von Hand |
| 8 | Haus L0 → L1 → L2 | `_archStufenGrenzen` stamm/studio-bruecke.js:2918–2943; Tafel stamm/vegetation-streu.js:2911–2944; Wahl stamm/siedlung-bauten.js:482–488 | **max(e·f/1 px, 12 bzw. 26 m) × Welt-Skala** | **halb**: ja über `_wechselAbstand` mit `vorlage`, Haushalt als Untergrenze | 132 000/12 → 44 000/4 → 7 000/4 (fachwerk-core.js:99–101, Vorgänger-Zahl, nicht neu gelesen) | Index hart (`_stufeNachGrenzen`); Blende des Haus-Tauschs **nicht gelesen** | 8-m-Haus: L1 12 m **469 / 156 px**, L2 26 m **217 / 72 px**. Pixel-getrieben bei 1080 nur: L2 Hochhaus 32,9 · Pueblo 33,4 · Japanisch 36,5 · Chinesisch 43,5 · Marokkanisch 63,0 m; L1 Niedersächsisch 13,8 m. Bei 360 **kein einziges** (größtes e₂ 0,0895 → 21,0 m < 26) |
| 9 | Tor L1/L2 | Tafel :2895–2906; Leser stamm/siedlung-tor.js:714 | wie #8; Haushalt aus `budget.gate[s].ab` (Wert **nicht gelesen**) | halb | — | wie #8 | Geisttor L2 133,8 m @1080 / 44,6 m @360; Lyra 109,6 / 36,5 m; 6-m-Tor am Tausch je **31,5 px** |
| 10 | Ausstattung L1 | Tafel :2945–2952 | e·f ≤ 7,4 m @1080 < Haushalt → **Haushalt 12 m** | halb (Pixel-Term greift nie) | 3 400 → 620 Dr. (Vorgänger) | wie #8 | Brunnen 2 m · 12 m · **117 / 39 px** |
| 11 | Haus-Mesh-Zone → Hülle im Welt-March | `ARCH_QUALITY_RADIUS_MAX 150` stamm/dirigent-regler.js:1980, `_randSchirm` :266–271 | **150 m** | **nein**, ausdrücklich („sein Pixel-Term bindet an keinem Schirm", :266–268) | L2 → Hülle (Stufe-3-Liste) | Schwund 500 ms (Vorgänger) | 8 m · 150 m · **38 / 13 px** |
| 12 | Baum L0 → L1 → Karte | `_stufenSchirm` stamm/vegetation-streu.js:1922–1944; `_lodPerceptionDistance` :1813–1832; `tree: je({})` :2892 | **12 / 26 m Wahrnehmungs-Distanz** = d·min(12/H, 1) | **nein**: `_wechselAbstand("tree", s, ref)` ohne Vorlage, Tafel leer → reine Meter, `zeilen` wirkungslos | 12 000 → 2 900 → Karte 2 Dr. (8 mit Gitter ab 64/128 px, stoff-karte.js:2046) | **Dither-Blende** (fade 8, fade0 4, hyst 3,4; foundry-core.js:421–424) | H ≥ 12 m: L1 bei d = H → **704 / 235 px**; Karte bei d = 26·H/12 → **325 / 108 px**, für jede Höhe gleich. 6-m-Baum: L1 12 m 352/117, Karte 26 m 162/54 px. Gemessener Versatz Karte ↔ L0 **1,50–3,16 px** mit Relief (stoff-karte.js:2049–2052) [k] |
| 13 | Baum hinter Kronen-Masse → Karte | `OCCLUSION.occDist 30` stamm/siedlung-bauten.js:3379–3385; Leser :503–512 | **30 m** + Dichte-Schwelle 3,6 | nein | L0/L1 → L2 | über `entry._occluded` | 15-m-Baum · 30 m · **352 / 117 px** — Karte, wo das Gesetz L1 wählen würde |
| 14 | Strauch, Wagen (Karten-Arten) | KIND_POLICY stamm/studio-bruecke.js:3604–3620; „der Wagen in rohen Metern, Sichthöhe 0" :2915–2916 | **12 / 26 m** | nein | Wagen 32 000/12 → 10 600/10 (vehicle-core.js:47–48) → Karte | Dither wie #12 | Wagen 1,5 m: L1 12 m **88 / 29 px**, Karte 26 m **41 / 14 px**; Limousine-Versatz 0,02 px [k] |
| 15 | Laub-Rand | `PERF_FOLIAGE_RADIUS_MIN 70 / MAX 240` stamm/dirigent-regler.js:1985–1986; `_laubRand` :279 | **70 → 240 m**, +2,5 m je Tick | nein (ausdrücklich, :266) | Karte → nichts | Totband `CULL_TOTBAND_M 16` stamm/vegetation-baum.js:3281 | 15-m-Baum · 240 m · **44 / 15 px** |
| 16 | Karten-Horizont der Streu-Regionen | `SCATTER` stamm/siedlung-instanz.js:1246ff (`outerM 384`, Vorgänger) | **384 m** | nein | Karte → nichts (außer Kamm #17) | Totband 16 m | 15-m-Baum · 384 m · **27 / 9 px** |
| 17 | Kamm-Krone | `KAMM_KRONE` stamm/gelaende-fern.js:2155 | **384 → 6 000 m**, nur Kronen vor dem Himmel | nein | Umriss 8 Ecken | Saison-Neubau | nicht gerechnet |
| 18 | Nah-Streu-Ring (Gras/Farn/Schilf als Kachel-Ring) | `NAH_STREU` stamm/vegetation-wiese.js:1213–1217; `_nahStufe` stamm/vegetation-streu.js:1892–1901 | L0 bis **3,5 m** (+0,75), Ring bis **24 m** (+5) | nein | Farn 3 800 → 150, Schilf 2 200 → 300 Dr. (foundry-core.js, Vorgänger) → **Bodenfarbe** | Index hart, Rand-Band dünnt | Farn 1 m: L0-Ende 3,5 m **201 / 67 px**; Ende 24–29 m **29–24 / 10–8 px** |
| 19 | Streu-Regionen (Blume, Stein, Strauch) → Fernform | `_streuFernBahn` stamm/studio-bruecke.js:3030–3034 über `_feldTraegt(false)` | **64 m** (hinein 74) | nein (N fest 64) | L2-Mesh → Welt-March-Gesetz („gesetz") bzw. Karte | Schwund 500 ms | Stein 0,4 m · 74 m · **3,8 / 1,3 px** |
| 20 | Nah-Wiese L1/L2 | `NAH_WIESE {stufe1 5, radius 10}` stamm/daten.js:496–504 (Vorgänger) | **5 / 10 m** | nein | 1 000 → 130 Dr. | `_nahStufe`, hart | Halm 0,42 m · 5 m · **59 / 20 px** |
| 21 | Ferne Wiese (der bewiesene Fall) | `_wieseFern` stamm/vegetation-wiese.js:577; Pixel-Uniform :1196–1198 | **Fußabdruck je Pixel** (Anteil, Größe), Ende **200 m** + 20 m Saum | **ja** `pxJeM` je Takt (lebendes FOV) | stetig | Anteil + Saum | Halm · 200 m · **1,5 / 0,5 px** |
| 22 | Tuch rechnet / ruht | stamm/koerper-fahrt.js:184–197 | Schwung ≥ `TUCH_GESETZ.px`, höchstens **nahM 14 m** | **ja** `pxJeM`, mit Meter-Deckel | rechnet → Pose | — | Wirkung, keine Gestalt |
| 23 | Boden CDLOD | `BODEN_STUFEN` stamm/gelaende-boden.js:3123–3133 | **36 / 100 / 388,8 m** (Kasten), Bänder 12/12/40 | nein | Schritt 1,8 → 3,6 → 7,2 → 14,4 m | **Geomorph** | Zelle an der Grenze **35 / 12 · 25 / 8 · 13 / 4 px** |
| 24 | Chunk-Ring | `HOLZ_PROFILE ring 4/3/2` stamm/dirigent-regler.js:2038–2040 | **Ring 4** (~200 m, Kacheln à 43,2 m) | nein | Chunk → Fern-Ring | Naht-Weiche 6–24 m (gelaende-fern.js:2131, Vorgänger) | — |
| 25 | Fern-Ring | `FERN_RING` stamm/gelaende-fern.js:2117 (Schalen 800/3 000/8 000) ; `camera.far = aussen + 500` stamm/bild-sicht.js:2856–2858 | **0,8 / 3 / 8 km** | nein | Masche 6 → 24 → 64 m | Schalen-Grenze, Blende nicht gelesen | — |
| 26 | Feld-Pass / Panorama | `FELD_PASS rMaxM 40000` stamm/bild-sicht.js:3877 | **40 km** | nein | — | — | — |
| 27 | Fern-Wasser | `FAR_WATER` stamm/gelaende-fern.js:2103 (`maxRadius 720`) | **720 m** | nein | Kräusel → Spiegel | Rebuild-Hysterese 80 m | — |
| 28 | Wege-Karte | stamm/siedlung-wege.js:1862–1863 (Vorgänger) | **512 m @ 0,5 m / 2 048 m @ 2 m** Texel | nein | Texel 0,5 → 2 m | Umzug 48 / 256 m | 3-m-Weg · 256 m · **8 / 3 px** breit |
| 29 | Schatten-Reichweite | `HOLZ_PROFILE shadowRange 170/110/0`; `PERF_SHADOW_RANGE_MAX 170` stamm/bild-schatten.js:1634 | **170 m** | nein | Schatten → keiner | hart | 8-m-Haus · 170 m · **33 / 11 px** |
| 30 | Schatten-Kaskaden | `SCHATTEN_KASKADE` stamm/bild-schatten.js:1714 (Kontakt 15 m, Texel 4,5/17/47 cm) | **15 m**, dann 2 Kaskaden | nein | Texel-Sprung | Filter-Gesetz | 47 cm · 170 m · **2 / 0,6 px** |
| 31 | Pfeil steckend | `PFEIL_SICHT_M 40` stamm/kampf.js:2629 | **40 m** | nein | Pfeil → nichts | hart | 0,8 m · 40 m · **14 / 4,7 px** |
| 32 | Vogel-Schwarm (Simulation) | tetrapoda-core.js:2309–2310 `nahM 60, sichtM 320`; :2688 `nahM 48` | **60 / 320 / 48 m** | nein | Glied frei → Formation → nur Zentrum | — | Wirkung (Kommentar :2257–2263), Bild-Stufe nicht gelesen |
| 33 | Ankunft | `ANKUNFT_FERNE 128` stamm/dirigent-ankunft.js:1893, :913 | Abstand **× 128** bis zum ersten Bild | nein | alles grob | Wahl ohne Zustand danach (siedlung-bauten.js:473–480) | — |
| 34 | Prüfplatz-Plan | fachwerk-core.js:10609–10610 (`auge.bild [1920,1080]`, `fovGrad 75`, `regel nahM 30, fernPx 200, residentM 210`) | Meter + Pixel gemischt, Schirm **fest 1080** | Zwilling des Schirms (eigene 1080 + 75°) — nur Plan-Probe, kein Laufzeit-Schalter | — | — | — |

Die Luft kaschiert keinen Rand: Sicht klar 20 000 m (Vorgänger: foundry-core.js:298), Durchlass bei 384 m exp(−3,912·384/20000) = 0,93 [r].

## 2. Urteil 1 — wer steht unter dem Schirm-Gesetz

- **GANZ (Pixel, folgt dem Schirm)**: Fell (#7), ferne Wiese (#21, Ende 200 m in Metern), Tuch (#22, Deckel 14 m), die Rangfolge der Bedeutung.
  Das sind **3 Bild-Schalter von 34**.
- **HALB (Pixel-Term + Meter-Boden oder -Deckel)**: Feld der Menge (#3, Deckel 64 m), Haus (#8), Tor (#9), Ausstattung (#10). Bei 1080 tragen
  davon **6 von 32 Haus-Vorlagen** wirklich einen Pixel-Wechsel (5 L2 + 1 L1), die übrigen stehen am Haushalt 12/26 m; bei 360 **keine**.
  Die Ausstattung hat ihren Pixel-Term nie in Kraft (größtes e 0,0105 → 7,4 m < 12 m).
- **GAR NICHT (Meter-Zwilling)**: Bewohner-Nah-Wahl 8 m + 4 (#1), Leib-Grob 40 m (#2), Bewohner fort 325 m (#4), Tier-Grob 35 m (#5),
  Tier-Feld 64 m (#6), Mesh-Zone 150 m (#11), **Baum 12/26 m (#12) — er ruft das Gesetz, aber ohne Vorlage und mit leerer Tafel, also nur
  Meter**, Verdeckung 30 m (#13), Strauch/Wagen (#14), Laub 240 (#15), Horizont 384 (#16), Kamm (#17), Nah-Streu 3,5/24 (#18), Streu-Regionen
  64 (#19), Nah-Wiese 5/10 (#20), Boden (#23), Ring (#24), Fern-Ring (#25), Feld-Pass (#26), Wasser (#27), Wege (#28), Schatten (#29, #30),
  Pfeil (#31), Ankunft (#33). **27 Meter-Schalter.**
- `ANALOG_NAH_M = 64` ist EINE Zahl, die drei Klassen trägt: Deckel der Menge (#3), Tier-Feld (#6), Streu-Fernform (#19).

## 3. Urteil 2 — gemessen oder von Hand

- **Gemessen am Bau**: die 48 Fehler-Zeilen Haus/Tor/Ausstattung (w25-lod-pop, :2866–2872 [k]) — eingefroren als Zahl, nicht zur Laufzeit;
  die Fell-Höhe (Median am Mesh, kreatur-verhalten.js:3924–3935); der Karten-Versatz der fünf Bäume 1,50–3,16 px (stoff-karte.js:2049–2052)
  — **gemessen, aber nicht eingetragen** (`tree: je({})`), also ohne Wirkung auf die Schwelle.
- **Von Hand**: `mengePx 64` (kein Fehler des Mengen-Leibs gemessen, keine Zeile `koerper`); `px 1` (Soll, Nanite); 12/26 m (Labor-Distanzen
  des Buchs); 40 m Leib, 35 m Tier (Kommentar „~2,7 px Beinschwung", geschätzt); 8 m/4 Leiber; alle Meter-Ränder der Tafel.

## 4. Urteil 3 — Klassen ohne Fern-Stufe (enden einfach)

Bewohner jenseits **325 m um die Siedlungs-Mitte** (#4: eine Stadt mit mehr Radius endet mitten in der Menge); Bäume jenseits **240/384 m**
außerhalb des Kamms (#15, #16: kein Wald in der Fläche, nur Farbe des Fern-Rings); Nah-Streu jenseits **24–29 m** wird Bodenfarbe (#18);
Schatten jenseits **170 m** (HOLZ „nah" 110, „kienspan" 0, #29); Pfeil **40 m** (#31); ferne Wiese **200 m** (gewollt mit Saum, #21).
Tiere jenseits ihres Lebens-Radius: nicht gelesen.

## 5. Urteil 4 — Kosten an der Weltgröße

- `for (const S of alle.values())` stamm/siedlung-bewohner.js:1383 — je Takt über ALLE bekannten Siedlungen; jede mit Mitte < 325 m lebt ganz,
  jeder Kopf trägt einen Leib und läuft durch die Kopf-Schleife (:1586ff); Ruhende gestaffelt `fernS` (Vorgänger :1423). Kosten ∝ Bevölkerung
  im Umkreis, nicht ∝ Pixel — der Täter für „Millionen Personen".
- `WELT_MARCH felder 4096, kapseln 8192` stamm/dienst.js:2035–2042 — feste Plätze, kein Schirm-Gesetz.
- Tier-Takt `_tickKreatur…` stamm/kreatur-verhalten.js:3140–3150 läuft über die Liste der Tiere (Raum-Maximum je Takt) — Grenze der Liste nicht
  gelesen.
- archCull in Eimern `CULL_EIMER_M 2` (stamm/vegetation-baum.js:3289, Vorgänger) — laut Quelle geheilt, nicht nachgemessen.

## 6. Urteil 5 — wer folgt einem Wechsel der Fenstergröße nicht

- **Kein Leser liest die Zeilen NUR beim Bau.** Jeder Pixel-Leser fragt `_schirm()`, gemessen je Takt und im Resize-Griff, und merkt seine Grenzen
  am Schlüssel `zeilen` (`_gelenkGrenzen` :1853, `_feldGrenzen` :1868, `_archStufenGrenzen` studio-bruecke.js:2920, Fell `_fellG.z`
  kreatur-verhalten.js:2862, `_bedeutungF` :1909; die Baum-Schwellen `_stufenSchirm` :1927). Ein neues Grenzen-Objekt bricht auch `_stufeGemerkt`.
- **Aber die WAHL folgt erst dem nächsten Stufen-Takt.** Der Resize-Griff (dirigent-ankunft.js:618–631) rechnet Schirm und Baum-Schwellen neu,
  nicht die Stufe der Dinge; die tragen Haus-LOD-Takt, Bewohner-Takt (`NF` :1367), Tier-Takt. Ruht die Welt (`loopAus` scripts/werkbank.cjs:520,
  „die Welt steht zwischen den Befehlen"), zeigt das größere Bild (Fenster auf max(640, --w) bzw. 1920×1080, werkbank.cjs:2105–2111) die Wahl des
  640×360-Schirms (werkbank.cjs:523). Ob `bild()` (:857) einen Takt fährt: **nicht gelesen**.
- **Die Zahl dazu** [r]: am 360-Schirm geht die Menge ab 10,6 m ins Feld und kommt erst unter 6,6 m zurück — in 1080 Zeilen ist ein 1,8-m-Mensch
  dort **120–192 px** hoch. Das ist genau das Band der Klumpen-Stapel im Dorf-Bild (`b6d828a0-dorf-0.5.png`, laut LAGE 120–190 px). Der
  Bildfehler ist damit an der Quelle erklärt: Feld-Kapseln eines 360-Schirms, keine Gestalt-Schwäche des Mengen-Leibs.
- **Auch der Spieler**: zieht er das Fenster groß, gelten bis zum nächsten Takt die alten Stufen (ein Bild), danach die neuen — kein Dauerfehler.
  Der Dauerfehler am Spieler ist ein anderer: **der Atlas** (Zelle 128×256, foundry-core.js:788) ist fest; die Karte steht bei 325 px (1080) —
  Vergrößerung 1,27; bei 2160 Zeilen 650 px = 2,5 [r]. Die Zelle folgt dem Schirm nicht.
- **Was am Schirm ÜBERHAUPT nicht hängt** (also auch keinem Fenster folgt): die 27 Meter-Schalter aus Urteil 1. Bei 360 Zeilen sind sie dreimal
  zu fein, bei 2160 doppelt zu grob — eine Baum-Karte bei 650 px, ein Bewohner-Satz bei 316 px.

## 7. Ehrlich offen

- Haus-Blende (Dither oder hart), Haushalt `budget.gate[s].ab`, Fern-Ring-Grenze, Tier-Lebensradius, Tor-Vorschau, ob `bild()` einen Takt fährt:
  **nicht gelesen**. Die mit „Vorgänger" markierten Zeilen habe ich nur an der Zeilennummer bestätigt (`grep` der Konstanten), nicht den Inhalt neu.
- Kein Silhouetten-Fehler außer den Kommentar-Zahlen [k] ist gemessen; die Schätzungen des Vorgängers (Kapsel ~9 px, Traufe ~2 px) habe ich
  gestrichen, weil sie keine Quelle trugen.
- Keine Zahl dieser Datei ist am Bild geprüft; der Richter ist das wahre Bild nach w28-probe-schirm.
