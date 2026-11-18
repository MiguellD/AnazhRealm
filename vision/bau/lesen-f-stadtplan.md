# Lesen (f): Stadt-Plan — main 18058dba

**Feld:** fachwerk-core.js (12 518; Plan-Kern 3602–4540, 4587–4662, 5262–5700, 9722–10130) · stamm/siedlung-ort.js (3 712) · stamm/siedlung-wege.js (2 995) · gelaende-core.js (7 947; ERDBAU 2094, ORT_SIEDLUNG 5762) · stamm/gelaende-boden.js (3 253; ORT_WAHL 3179) · stamm/siedlung-bauten.js (3 447; nur 3432) · gelesen, ohne Plan-Größen: siedlung-tor.js (863, Portal-Membran, keine Stadttore), siedlung-satz/-instanz/-verkehr (Render/Fahrt).

**Kurzbefund.** Der Ort einer Siedlung ist ein **Hash der Welt-Zelle** (FNV-1a „seed:dorf:cx,cz", 1 von 2 Zellen), Gelände und Wasser wirken nur als **Veto** (Land, Hang ≤ Böschung, Krautschicht, Spawn-Abstand) — nichts zieht eine Siedlung an Fluss, Furt oder Hang. Die Größe kommt **aus dem Hash** (Zipf-Rang über 8er/16er-Raster, Pareto bis 500) und je Epoche aus einer Tafel (GROESSE_N); Bevölkerung FOLGT den Häusern (leuteVon), nie umgekehrt. Der Plan selbst ist ein gewachsener Graph (Triebe, Snap, Quergassen), dessen Gelände-Konsum echt ist (trasseLenk liest Hang + Wasser), dessen Form aber aus **~150 gesetzten Zahlen je Größenklasse/Jahrhundert** kommt (Triebzahl, Schritte, Krümmung, Mauerradius 26+8,4√n, Gassenteilung 28 m …). Die Zeit ist die stärkste echte Wurzel: Chronik/Jahresringe (Gründungsjahr je Los, Wachstum aus Leuten × Wohlstand), Belag nach Jahr × Klasse. Handel kommt nicht an (kein Markt-Einzug, keine Route zieht einen Ort); die Kachel-Stadt (> 500 Häuser) entsteht **nur aus dem Wort**, nie aus der Welt, und ihr Netz ignoriert das Gelände.

## (1) WAS TRÄGT

- **siedlungsZelle** fachwerk-core.js:3729 — Existenz (h % rarity), Anker (Zell-Mitte ± ¼ Zelle, :3737), Stufe (Sieger der 8er/16er-Raster, :3744–3766), Größe (:3700), Verdrängung (:3777). Leser: siedlung-ort.js:1427 (`_autoSettlementCellInfo`) → :3080 (`_autoSettlementZelle`, Takt).
- **_autoSettlementSiteOk / FindSite** siedlung-ort.js:1681 / :1726 — Veto-Kette Wildnis → Spawn-Abstand → `_landAt` → Hang ≤ ERDBAU.boeschung → `_ortNaehrt`; sonst 8 Proben auf Ringen 0,15/0,3 Zelle. Leser: :3114.
- **DORF** fachwerk-core.js:4403 — Region/Jahr/Spanne, nZiel, Klasse, Kernel, Lose mit Baujahr, Wohl, Breite, Geschosse, Kirche, Burg, Scheunen, Viertel, Chronik. Leser: exportSettlement :9733, viertelWort :4013, kachelMassen :4078.
- **strassengraph** :5262 + **trasseLenk** :4595 / **trasseSteil** :4611 — das Gerippe; Höhe H und Wasser H.nass gehen echt ein. Leser: dorfLayout :5365.
- **dorfLayout** :5357 — Mauerring Rw :5364, Quergassen :5377, Straßen-Gedächtnis :5405, Vorstadt/Faubourg :5412–5433, Markt :5439, Torplatz :5451, Gassen-Gesetz :5460–5481, Setzer tryPlace :5487, Viertel-Lage :5534ff.
- **mauerRing** :5328 · **schnittMauer** :5344 · **kachelMauer** :4037 — drei Mauern (s. §3). Leser der Maße STADTMAUER: siedlung-wege.js:2747 (`_stlMauerBuild`).
- **stadtPlan / stadtLambda / viertelWort / kachelNetz / kachelMassen** :3925 / :3903 / :4006 / :3844 / :4074 — Kachel-Stadt. Leser: siedlung-ort.js:1515 (`_viertelInfo`), siedlung-wege.js:2061 (`_stadtFerneTakt`), exportSettlement :9731/:9744.
- **ortPlan** :10348 (ORT_GESETZ :9997) — Plan v2 auf dem Gelände (Erdbau, Brücken). Leser: siedlung-ort.js:58 (`_ortPlanSetzen`).
- **gassenBelag / gehwegVon / wegArt** :10069 / :10074 / :10109 — Belag nach Klasse × Jahr. Leser: kachelMassen :4084, Setzer :5488, Wege-Karte (laut Kommentar :10058).
- **wachstum** :4255 — Ort wächst in Spielzeit aus Leuten × Wohl / Furcht. Leser: siedlung-ort.js:2878 (Takt SIEDLUNG_WACHS).
- **wegZwischen** (WEG_ZWISCHEN :4654, Kosten :4762) — Feldweg zwischen Orten, Hang- und Furt-Kosten. Leser: siedlung-ort.js:3313 (`_wegenetzLegen`).

## (2) DIE GRÖSSEN

Urteil: **G** = GESETZT ohne Anker · **G·A** = GESETZT mit Anker (Norm/Physik/Theorie/Befund laut Kommentar) · **F** = FOLGT (Kette genannt). Eine Zeile = eine Größe bzw. ein Bündel gleichrangiger Felder.

| # | Name | Wert | Einh. | datei:zeile | Anker | Leser | Urteil |
|---|---|---|---|---|---|---|---|
| 1 | SIEDLUNG.cellM | 256 | m | fwc:3662 | keiner | fwc:3739,3830,3845; ort:1108,1467,1736; wege:2028 | G |
| 2 | SIEDLUNG.rarity | 2 | 1/N Zellen | fwc:3662 | keiner („~7/km²" ist Folge) | fwc:3736 | G |
| 3 | SIEDLUNG.nHMin | 8 | Häuser | fwc:3662 | keiner | fwc:3702,4619; ort:1449,1713 | G |
| 4 | SIEDLUNG.nHSpan | 10 | Häuser | fwc:3662 | keiner | fwc:3702; ort:1449 | G |
| 5 | rang[0] zellen/nH | 8 / 24 | Zellen/Häuser | fwc:3675 | Zipf α=1 (nur Form) | fwc:3704,3747 | G·A |
| 6 | rang[1] zellen/nH | 16 / 96 | Zellen/Häuser | fwc:3676 | Zipf α=1 (nur Form) | fwc:3704,3747 | G·A |
| 7 | Größe Pareto a/(1−k·u) | aus Hash | Häuser | fwc:3706 | Pareto α=1 | fwc:3769 | F (Hash→Rang→Stufe) |
| 8 | reichM.kern | 30 | m | fwc:3678 | keiner | fwc:3714 → ort:1449,1509,3061; fwc:4619 | G |
| 9 | reichM.jeWurzel | 22 | m/√Haus | fwc:3678 | keiner | fwc:3714 | G |
| 10 | Anker-Jitter | ±0,25·cellM | m | fwc:3737 | keiner | fwc:3739 | G |
| 11 | Epochen-Legende | jede 3. Zelle | – | fwc:3722 | keiner | fwc:3723 | G |
| 12 | GROESSE_N | weiler 6 · dorf 12 · markt 21 · stadt 36 · grossstadt 90 · metropole 220 | Häuser | fwc:3680 | keiner | fwc:4415,4196,4202,4624 | G |
| 13 | GROESSE_WAND | 500 | Häuser | fwc:3682 | keiner | fwc:3706,3710,3818,4153,4236 | G |
| 14 | GROESSE_BAND | 8 · 17 · 27 · 49 · 141 | Häuser | fwc:4147 | keiner | fwc:4149 → 4421,4624,4063 | G |
| 15 | STADTMAUER.wand | hoch 5,6 · dick 1,6 · ueber 0,6 | m | fwc:3687 | keiner | wege:2747 | G |
| 16 | STADTMAUER.krone | y 5,9 · hoch 0,7 · dick 2,0 | m | fwc:3688 | keiner | wege:2747 | G |
| 17 | STADTMAUER.turm/dach | 3,6×8,4 / y 9,1 · 4,2 · 1,5 | m | fwc:3689–3690 | keiner | wege:2747 | G |
| 18 | STADTMAUER_FUSS_M | 1,5 | m | bauten:3432 | keiner | wege:2752 | G |
| 19 | STADT_FUNKTION.voll | = GROESSE_WAND | Häuser | fwc:3818 | – | fwc:3871,4009,4029,4415,9729; ort:1466 | F (Alias von #13) |
| 20 | STADT_FUNKTION.schritt | 1 | Zellen | fwc:3818 | keiner | ort:1499,1513 | G |
| 21 | STADT_FUNKTION.rest | 8 | Häuser | fwc:3818 | keiner | fwc:3928,4011 | G |
| 22 | STADT_NETZ.tore | 5 | je Kante | fwc:3819 | keiner | fwc:3830,3837 | G |
| 23 | STADT_NETZ.spiel | 0,4 | – | fwc:3819 | keiner | fwc:3831 | G |
| 24 | STADT_NETZ.jeKachel | 190 | Häuser | fwc:3819 | Befund Spike 15.11. (193 auf 6,5 ha, :3817) | fwc:3904,3926,4027,9975 | G·A |
| 25 | STADT_NETZ.torLueckeM | 3,5 | m | fwc:3819 | keiner | fwc:4041 | G |
| 26 | STADT_NETZ.mauerInnenM | 2,4 | m | fwc:3819 | keiner | fwc:4038,9751 | G |
| 27 | STADT_NETZ.turmJeM | 42 | m | fwc:3819 | keiner | fwc:4046 | G |
| 28 | Netz-Schritt DS | 3 | m | fwc:3845, 5263, 5362 | keiner | dieselben | G (3 Kopien) |
| 29 | Nebenstraße | strasseW·0,78 | m | fwc:3857, 5297, 5322 | keiner | Netz/Graph | G |
| 30 | STADT_FORM.randTeil | 0,1 | – | fwc:3892 | Clark-Profil (Form) | fwc:3899 | G·A |
| 31 | STADT_FORM.kern | 0,6 | λ | fwc:3892 | Clark (Form) | fwc:3895,3899 | G·A |
| 32 | λ, Radius, Ringe | aus nH | Kacheln | fwc:3898–3920,3869 | – | fwc:3928,4012; ort:1477 | F (nH→Σ Profil=nH) |
| 33 | STADT_FORM.spiel | 0,5 | – | fwc:3892 | keiner | fwc:3931 | G |
| 34 | STADT_FORM.kleinTeil | 0,065 | – | fwc:3892 | keiner | fwc:3928 | G |
| 35 | STADT_FORM.hochKern/hochRand | 3,3 / 0,3 | Faktor | fwc:3892 | keiner | fwc:3954–3955 | G |
| 36 | STADT_FORM.hochAbLam/hochPot | 2 / 1,6 | – | fwc:3892 | keiner | fwc:3954–3955 | G |
| 37 | STADT_FORM.mauerTeil | 0,55 | – | fwc:3892 | keiner | fwc:4027 | G |
| 38 | STADT_FORM.tonHub/tonWeite/tonStufen | 0,2 / 3 / 16 | –/Kacheln/– | fwc:3892 | keiner | fwc:3963,3972,3988 | G |
| 39 | Ton-Feld Rampe | 0,75…+1,5, ×1,5 | Kacheln | fwc:3966 | keiner | fwc:3975 | G |
| 40 | STADT_FORM.schlank | 1,5 | – | fwc:3892 | keiner | fwc:4492 | G |
| 41 | STADT_FORM.stab | 2 | Traufe/Tiefe | fwc:3892 | keiner | fwc:4102,4494 | G |
| 42 | STADT_FORM.breitMax/tiefMax | 7,5 / 11 | m | fwc:3892 | keiner | fwc:4493 | G |
| 43 | STADT_MASSEN.einzugM | 4,2 | m | fwc:4072 | keiner | fwc:4092,4102,4110 | G |
| 44 | STADT_MASSEN.platzM | 11 | m | fwc:4072 | keiner | fwc:4092 | G |
| 45 | STADT_MASSEN.eckeM | 9 | m | fwc:4072 | keiner | fwc:4092 | G |
| 46 | STADT_MASSEN.geschossM/sockelM | 2,7 / 0,5 | m | fwc:4072 | keiner | fwc:4102,4120,4492,4494 | G |
| 47 | STADT_MASSEN.flachGrad/strasseJe | 8° / 4 | –/Punkte | fwc:4072 | keiner | fwc:4119,4082 | G |
| 48 | Masse min/Spalt | 3 m / 0,8 / 0,6 | m | fwc:4110 | keiner | fwc:4112 | G |
| 49 | DORF_NORM.gap | 2,5 (Stadt 0,06, städt. 0,6) | m | fwc:3649, 4516 | keiner | fwc:5358→5511,5530 | G |
| 50 | DORF_NORM.strasseW | 5,0 | m | fwc:3649 | keiner | fwc:3857,5358 | G |
| 51 | DORF_NORM.laneW | 3,2 | m | fwc:3649 | keiner | fwc:5358 (lw) | G |
| 52 | DORF_NORM.gehweg | 1,2 | m | fwc:3649 | keiner | fwc:10075 | G |
| 53 | DORF_NORM.budget | 170 000 (80k–400k) | Verts | fwc:3649, 4516 | keiner | nur Labor worlds/fachwerk/fachwerk.js:222,262 | G (Spiel: tot) |
| 54 | DORF_NORM.laneiv | 17 | m | fwc:3649 | keiner | fwc:5676 | G |
| 55 | EPOCHEN jahr/spanne/groesse | 9 Zeilen (80…1935) | Jahr | fwc:3623–3631 | Historie (Epochen-Namen) | fwc:4405–4416,4157,4196 | G·A |
| 56 | REGION_HIST Bänder | 0…1965 | Jahr | fwc:3610–3615 | Historie | fwc:4424 | G·A |
| 57 | Region-Würfel | .30/.46/.64/.76/.88 | p | fwc:4410 | keiner | fwc:4410 | G |
| 58 | Jahr/Spanne-Würfel | 880+680u; 20–60/180–480/500–920 | Jahr | fwc:4411–4413 | keiner | fwc:4433 | G |
| 59 | Epochen-Jitter | ±25 | Jahr | fwc:4409 | keiner | fwc:4409 | G |
| 60 | nZiel Ersatz/Min | 18 / 4 | Häuser | fwc:4415 | keiner | fwc:4420 | G |
| 61 | Kernel-Wahl | brunnen .45 · anger .78 · kreuzung | p | fwc:4423 | keiner | fwc:5439,5447 | G |
| 62 | Ring-Gründung gr0 | min(jahr−150, 1150+260u) | Jahr | fwc:4418 | keiner | fwc:4426,4501 | G |
| 63 | Ersatzbau-Rate | 0,12 | p | fwc:4431 | keiner | fwc:4431 | G |
| 64 | Parzellen-Gedächtnis | W·(0,80+0,38t), 4,5–15 | m | fwc:4437 | keiner | fwc:4437 | G |
| 65 | Wohl-Gradient | (1,22−0,5t)(0,78+0,44u) | – | fwc:4438 | keiner | fwc:4439,4512,4340 | G |
| 66 | Breite aus Wohl | W·(0,84+0,30w), 5–15 | m | fwc:4439 | keiner | Export | G |
| 67 | Stadtkörper | ×(1,85−1,45t), ab 1880/1920, 7–11 G | – | fwc:4440–4443 | keiner | fwc:4445 | G |
| 68 | DOWNTOWN | i<0,22n, p .72, 8–23 G, ab 1905 | – | fwc:4453–4456 | keiner | Export | G |
| 69 | GEWERBE | ab 1850, n≥20, ab 0,78n, p .6 | – | fwc:4458–4460 | keiner | Export | G |
| 70 | Kirche ab | 8 | Lose | fwc:4463 | keiner | fwc:4465 | G |
| 71 | Burg | jahr<1700, n≥16, Münze .5, herrAb 49 | – | fwc:4470, 4322 | keiner | fwc:4471,4487 | G |
| 72 | Scheunen-Quote | .75/.55/.28/.06/.04/.03 | p | fwc:4476 | keiner | fwc:4478 | G |
| 73 | STADT_GRAMMATIK.zeit | MA 500–1500 · FNZ 1500–1800 | Jahr | fwc:4321 | Historie | fwc:4377,4469 | G·A |
| 74 | grund gasthaus/schmiede | ab 8 Los 1 / ab 10 Los 0,62n | Lose | fwc:4323 | keiner | fwc:4386,4468 | G |
| 75 | kirchhof.lose | [2, 3 (4 ab 27)] | Lose | fwc:4327 | keiner | fwc:4384 | G |
| 76 | markt.lose | 4 … 4+clamp(0,07n, 2, 18) | Lose | fwc:4330 | keiner | fwc:4384 | G |
| 77 | handwerk.lose | max(6+…, 0,55n) … +max(2, 0,14n) | Lose | fwc:4333 | keiner | fwc:4384 | G |
| 78 | Bau-Takte | kontor je 4 · backhaus 9 · speicher 7/6 · gerberei 5 · wohnturm 5 | je n-tes Los | fwc:4331–4340 | keiner | fwc:4390–4392 | G |
| 79 | wohnen.wenn | wohl ≥ 1,1/1,05, f < 0,45/0,5 | – | fwc:4340 | keiner | fwc:4390 | G |
| 80 | Stände raster/max | 5,2×4,6 / 12; Gräber 2,3×3,1 / 36 | m/Stück | fwc:4329,4332 | keiner | fwc:5443–5445 | G |
| 81 | STADT_DICHTE.gasseM | 2,8 | m | fwc:4353 | VERKEHR_GESETZ.breiteM (kein Wagen) | fwc:5463,5467,5477 | G·A |
| 82 | gasseTeilung | 28 | m | fwc:4353 | keiner | fwc:5479 | G |
| 83 | gasseAb / gasseHinterM | 14 / 22 | m | fwc:4353 | keiner | fwc:5480–5481 | G |
| 84 | gasseMinM / gasseLangM | 18 / 54 | m | fwc:4353 | keiner | fwc:5470,5474,5476 | G |
| 85 | fluchtM / mauerM | 7 / 16 | m | fwc:4353 | keiner | fwc:5471,5473,5480 | G |
| 86 | marktJeBreite / marktTief | 1,3 / [12, 24] | –/m | fwc:4354 | keiner | fwc:5439 | G |
| 87 | standRandM / marktGangM | 2,6 / 3,2 | m | fwc:4354 | keiner | fwc:5445 | G |
| 88 | wasserM | 3 | m | fwc:4355 | keiner | fwc:4602,5471,5503 | G |
| 89 | zugBurgM / zugKircheM | 24 / 16 | m | fwc:4355 | keiner | fwc:5542,5546,5606 | G |
| 90 | zugJeLosM2 / zugSeite / zugFremd | 170 / 0,6 / 300 | m²/–/m | fwc:4355 | keiner | fwc:5547–5548,5596–5597 | G |
| 91 | friedhof tiefM/randM/abM | 7,5 / 1,4 / 1,5 | m | fwc:4356 | keiner | fwc:5499,5558 | G |
| 92 | torplatz abM/winkel/halbM | 14 / 2 rad / 13 | m | fwc:4357 | Befund stadt-voll (:5450) | fwc:5176,5455,5458 | G·A |
| 93 | gehwegFahrM | 1,8 | m | fwc:4364 | Physik: 3×0,35+0,71 Kapseln (:4358–4363) | fwc:10075 | F (Kapsel→Gehweg) |
| 94 | platzFassM / platzFugeM | 30 / 1,5 | m | fwc:4365–4366 | keiner | fwc:9094,9139,9178 | G |
| 95 | standTrasseM | 3 | m | fwc:4367 | VERKEHR_GESETZ.ausweichM (Wort) | fwc:5442 | G |
| 96 | hafenM / hafenRasterM | 14 / 8 | m | fwc:4368–4369 | keiner | fwc:5608,5699 | G |
| 97 | Krümmung kruemm | Stadt .006 · <1500 .016 · <1800 .010 · sonst .003 | rad/m | fwc:5264 | keiner | fwc:5271,5275 | G |
| 98 | Raster-Stadt | antik ∨ (städt. ∧ ≥1800) | – | fwc:5265 | Historie implizit | fwc:5279 | G·A |
| 99 | Triebe nT | Dorf 2 · Stadt 3/4 · groß 4 | – | fwc:5277 | keiner | fwc:5279 | G |
| 100 | Trieb-Schritte | Dorf 6–8 · Stadt 4–5 · gross 7–8 · metro 16–17 | – | fwc:5280 | keiner | fwc:5283 | G |
| 101 | maxE Kanten | 8 · 24 · 54 · min(150, 40+0,36n) | – | fwc:5281 | keiner | fwc:5282 | G |
| 102 | Trieb-Länge | Stadt 34+30u · Dorf 26+26u | m | fwc:5286 | keiner | fwc:5286 | G |
| 103 | Snap Knoten/Kante | 16/13 · 12/9 | m | fwc:5290,5294 | keiner | – | G |
| 104 | Abzweig-p | .72 · .6 · .28 | p | fwc:5300 | keiner | – | G |
| 105 | Richtungs-Dämpfung | 0,028 | 1/m | fwc:5271,5275 | keiner | – | G |
| 106 | Verbindungspass | maxAdd 8/4/3/1, dm 55/80, d ≥ 24 | –/m | fwc:5305–5312 | keiner | – | G |
| 107 | mauerRing | NV 30, ±1,5 %, gA 0,30 rad, Turm je 5. Ecke | – | fwc:5328–5335 | keiner | fwc:5354, dorfLayout | G |
| 108 | MAUER_BIS | 1750 | Jahr | fwc:5342 | keiner (Epoche, kein Beleg) | fwc:5363,9746 | G |
| 109 | MAUER_SAUM | 6 | m | fwc:5342 | keiner | fwc:5346 | G |
| 110 | Tor-Mindestabstand | 0,5 | rad | fwc:5351,5419 | keiner | – | G |
| 111 | Mauerradius Rw | min(195, 26+8,4·√nG) | m | fwc:5364 | – | fwc:5270,5285,5504 | F (nG→Rw; Koeffizienten G) |
| 112 | jitAmp | Stadt .05 · <1500 .9 · <1780 .45 · .2 | m | fwc:5361 | keiner | fwc:5494 | G |
| 113 | Quergassen | qMax 8/6/4/2, 13–48 m, |sin| ≥ .55, frei 5,5 m, fu .35/.6/+.28 | – | fwc:5377–5395 | keiner | fwc:5393 | G |
| 114 | Straßen-Gedächtnis | w·(0,72+0,42·dN), ≥ 2,2, ab 1700 | m | fwc:5405–5410 | keiner | Setzer | G |
| 115 | Ausfallstraße flen | metro 230 · gross 110 · 70 | m | fwc:5421 | keiner | fwc:5425 | G |
| 116 | Ausfall/Faubourg | w sW·0,6; nq 5/2; Abzweig 26+…, 40+22u | m | fwc:5425–5433 | keiner | Setzer | G |
| 117 | Platz PW / PD | max(7, 5+0,30·min(nG,40)); Dorf max(6, 0,55PW) | m | fwc:5439 | keiner | fwc:5440 | G |
| 118 | Setzer-Fuge | gap·(0,22+0,78dN)+0,15u / 1,2u; 26 Versuche × 1,1 m | m | fwc:5530,5492,5532 | keiner | – | G |
| 119 | Mauerband | 2,0 / 2,2 / 1,2 | m | fwc:5504–5507 | keiner | – | G |
| 120 | ORT_GESETZ.glaettM | 6 | m | fwc:9998 | keiner | fwc:10828,11434 | G |
| 121 | ORT_GESETZ.gefaelle | 0,12 | – | fwc:9999 | Nordstern §6 (Projekt-Norm) | fwc:5461 | G·A |
| 122 | ORT_GESETZ.treppe | 0,3 | – | fwc:10000 | keiner | fwc:5461,5466 | G |
| 123 | ORT_GESETZ.trasse | 0,09 | – | fwc:10001 | „Marge zum Fuß" (aus #121) | fwc:4602,4613,4739 | G |
| 124 | ORT_GESETZ.saumM | 0,6 | m | fwc:10002 | keiner | fwc:10036,10180ff; ort:34 | G |
| 125 | vorplatzM / gasseM | 1,6 / 5 | m | fwc:10003–10004 | keiner | fwc:9451,10032,11047,11159 | G |
| 126 | hangPlattform / hangHanghaus | 1,5 / 4 | m | fwc:10005–10006 | keiner | fwc:11112 | G |
| 127 | brueckeM | 8 | m | fwc:10007 | keiner | fwc:10938 | G |
| 128 | umM / kreuzungM / kreuzSinus | 0,25 / 10 / 0,34 | m/m/– | fwc:10008–10010 | keiner | fwc:10466,10681–10719 | G |
| 129 | trasseLenk-Suche | 0,1 rad × 15 | rad | fwc:4605 | keiner | – | G |
| 130 | trasseRahmen | 1,5·Reich+60, /80, ≥ 4 | m | fwc:4619 | – | ort:285 | F (Reich→Rahmen) |
| 131 | wasserReich | Rw + flen + 15 | m | fwc:4626 | – | ort:273 | F (Zwilling #111/#115) |
| 132 | WEG_ZWISCHEN | steilMax .3 · hang 4 · glaett 16 · furt 20 | –/–/m/× | fwc:4654 | keiner | fwc:4739,4762 | G |
| 133 | BRUECKE_GESETZ | feldM 4 · lichtM 4 · gelaender 1,05 · pfahl 3,5 | m | fwc:4662 | lichtM: Wagen 1,9 / Feldweg 3,4 | Brücke | G·A |
| 134 | BELAG_GESETZ | jahr0 1200 · jeJahre 200 · ab 2/3/4/5/6 | Jahr/Stufe | fwc:10060 | Historie grob („Markt um 1200", :10053) | fwc:10064,10070 | G·A |
| 135 | WEGENETZ | maxM 720 · breiteM 3,4 · schritt 4 · rand 60/.35 · halb 1,2 · naht 48 · zugang 60 | m | ort:3559–3567 | keiner | ort:3313ff | G |
| 136 | WEGENETZ.entwurfKmh | 50 / 30 / 25 / 40 | km/h | ort:3568 | RASt 06, DWA-A 904 | ort:3541 | G·A |
| 137 | WERK_LAND_M | 0,2 | m | ort:3572 | keiner | ort:29,38 | G |
| 138 | ORT_WAHL | schrittM 16 · ringe 8 · grobM 2 · bodenTol .05 · trasseRunden 6 | m/– | boden:3179 | keiner | ort:3004,3010 | G |
| 139 | AUTO_SETTLEMENT.nearM | 260 | m | ort:3611 | keiner | ort:3045,3089 | G |
| 140 | vorlaufM / bereitS / bauZeitMaxS | 160 / 10 / 30 | m/s/s | ort:3615–3621 | Befund Fahrt-Probe (:3613) | ort:3090–3097 | G·A |
| 141 | spawnClearM | 320 | m | ort:3622 | keiner | ort:1687 | G |
| 142 | siteProbeR | [0,15, 0,3] | Zellen | ort:3623 | keiner | ort:1736,3108 | G |
| 143 | startRingeM | [24, 48, 72] | m | ort:3624 | keiner | ort:1951 | G |
| 144 | ORT_REICH_ZELLEN | 3 | Zellen | ort:3609 | Ableitung 522 m < 755 m (:3605–3608) | ort:1618 | F (Reich(500)→3) |
| 145 | ERDBAU.boeschung (Hang-Veto) | 0,6 | – | gc:2094 | Befund Mess-Dorf (ort:3664–3669) | ort:1691 | G·A |
| 146 | ORT_SIEDLUNG mensch / naehrt | [−0,3, −0,012] / 0,5 | Ma / – | gc:5762 | keiner | gc:5765; ort:1431,1710 | G |
| 147 | STADT_FERNE | reich 3000 · strassen 1200 · bandAb 768 · spiel 64 · hub .6 · dick 3 · sockel 2,5 · ueber .5 · jeTakte 6 · nah 300 | m/– | wege:2975–2985 | bandAb = 3 Kacheln (:2972) | wege:2026–2074 | G |
| 148 | SIEDLUNG_WACHS.taktS | 300 | s | ort:3604 | keiner | ort:2878 | G |
| 149 | WACHSTUM.kraftJeS | 1/1800 | 1/s | fwc:4254 | keiner („Verdopplung ≈ 21 min" ist Folge) | fwc:4284 | G |
| 150 | LEUTE_GESETZ | nutz .7 · flaeche 20 · wohlFlaeche 20 · max 12 | –/m² | fwc:9526 | keiner | fwc:9535–9537, 4512 | G |
| 151 | ORT_AUSSTATTUNG Kappen | brunnen 5 · stand 12 · baum 12 · grab 36 | Stück | ort:3579–3600 | keiner | ort (Schicht) | G |
| 152 | DORF_LICHT_WEG | 25 | m | fwc:5686 | keiner | fwc:5694 | G |
| 153 | Kachel-Außenkasten kd | 400 | m | fwc:9748 | keiner | fwc:9759–9762 | G |

## (3) ZWILLINGE UND TOTE

- **Zwei Lose-Setzer für dieselbe Kachel.** Stufe 1 (fern) `kachelMassen` fwc:4086–4106 setzt Häuser im Raster `platzM` 11 m mit `einzugM`/`eckeM`; Stufe 2 (nah) `dorfLayout`→`tryPlace` fwc:5487 mit `gap`/Cursor. Der Kern sagt es selbst: „Stufe 2 legt ihre Lose auf demselben Netz anders" (fwc:4067). Zahl, Maße, Ton sind EINE Quelle (DORF), die Orte nicht — Gebot 4 verletzt.
- **Drei Mauer-Gesetze:** `mauerRing` (Rw aus nG, NV 30, Turm je 5. Ecke, fwc:5328), `schnittMauer` (Radius aus Grundrissen + MAUER_SAUM 6, fwc:5344), `kachelMauer` (Kanten, turmJeM 42, fwc:4037). Turmabstand je Pfad anders gesetzt.
- **Rw/flen doppelt:** dorfLayout `min(195, 26+√nG·8,4)` + flen 230/110/70 (fwc:5364, 5421) und `wasserReich` dieselben Literale (fwc:4626) — eine Änderung an einer Stelle bricht das Wasser-Lesen still.
- **WERK_LAND_M als Literal:** `_autoSettlementSiteOk` ruft `_landAt(x, z, 0.2)` (ort:1689) statt `AnazhRealm.WERK_LAND_M` (ort:3572, gelesen :29, :38).
- **DS = 3 dreimal** (fwc:3845, 5263, 5362); **strasseW·0,78** dreimal (fwc:3857, 5297, 5322).
- **gap überschrieben:** DORF_NORM.gap 2,5 (fwc:3649) wird für Städte in `norm` auf 0,06/0,6 ersetzt (fwc:4516) — der Tafelwert gilt nur fürs Dorf.
- **Tot fürs Spiel:** `DORF_NORM.budget` — Leser nur das Labor worlds/fachwerk/fachwerk.js:222, 262 (Grep `norm\.budget` in stamm/: 0 Treffer).
- **Rang-Stadt wird nie Kachel-Stadt:** `siedlungsGroesse` klemmt auf GROESSE_WAND (fwc:3706), die Kachel verlangt `nH > voll` = GROESSE_WAND (fwc:3871, 9729). `_staedte` liest nur `c.stadt > SF.voll` (ort:1466) — die Welt selbst trägt keine Stadt über 500 Häuser, nur das Wort („dorf 7 4750").
- **Kachel-Netz ohne Gelände:** `kachelNetz(samen, ix, iz)` hat kein H (fwc:3844); dorfLayout nimmt `plan.netz` statt `strassengraph(…, H)` (fwc:5365). Die Hauptstraßen der großen Stadt laufen glatt über Hang und Wasser; das Gelände wirkt dort nur noch als Veto (Masse „was im Wasser stünde, steht nicht", wege:2018).
- **Region-Zweig doppelt:** `markBei` (fwc:4461) und `herr`/`bk` (fwc:4325, 4472) tragen „nordisch → norwegisch" je eigen.

## (4) WAS DER SAMEN ERREICHT

- **Samen:** ja, überall — Zell-Hash → Existenz, Anker, Stufe, Größe, Epoche (fwc:3729–3800, 3718); DORF-Strom `rnd` → Region, Jahr, Kernel, Lose (fwc:4404–4423); Kanten-Same → Tore der Kacheln (fwc:3831). Der Same ist die Hauptquelle, nicht das Gelände.
- **Gelände:** nur als **Veto** beim Ort (Hang ≤ 0,6, ort:1691; Wildnis, ort:1683; Krautschicht, ort:1707) und als **Lenkung** im Plan (trasseLenk/trasseSteil, fwc:4595–4614; Treppengasse fwc:5466; Torplatz auf flacherer Seite fwc:5455; Burg an der „hoehe", fwc:4336). Kein Ort wählt einen Hang, Sporn oder Pass.
- **Wasser:** Veto (`_landAt`, ort:1689) und Ausweichen (H.nass im Plan, fwc:4602, 5471, 5503; Brücken im Plan v2); Hafen-Viertel nur, „wenn Wasser am Ring" (fwc:4343). **Das Dorf liest kein Wasser** (`wasserReich` 0, fwc:4625). Keine Anziehung: keine Siedlung an Fluss, Furt, Quelle, Mündung — die Furt existiert nur als Kostenfaktor 20 für den Feldweg (fwc:4654).
- **Bevölkerung:** FOLGT den Häusern (`leuteVon`, fwc:9527) und speist nur das Wachstumstempo (fwc:4262); die Zielgröße kommt vom Hash/Wort/Klasse, nie aus Nahrung oder Leuten.
- **Epoche/Zeit:** die echte Wurzel — Chronik-Anker log-linear zwischen Epochen (fwc:4195–4225), Gründungsjahr je Los, Jahresringe, Ersatzbau, Grammatik-Bänder (fwc:4321), Belag nach Jahr (fwc:10060), Mauer bis 1750, Wachstum in Spielzeit (fwc:4255). Aber jede Wende (1500, 1700, 1750, 1800, 1850, 1880, 1905) ist eine gesetzte Schwelle.
- **Handel:** kommt nicht an. Kein Markt-Einzug, keine Route zwischen Orten beeinflusst Ort, Größe oder Rang; Kontore „je 4 Lose" (fwc:4331), Fremdkultur aus Tafel `fern` (fwc:4324). Das Wegenetz (WEGENETZ maxM 720, ort:3559) folgt den Orten, nicht umgekehrt.

**Schluss:** 153 Größen gesamt · davon GESETZT ohne Anker 128 · davon FOLGT 8 (17 GESETZT mit Anker).
