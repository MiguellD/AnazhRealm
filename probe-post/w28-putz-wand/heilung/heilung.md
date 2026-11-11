# w28-putz-wand — Heilung nach z384 (OMEN, 11.11.) · ZWISCHENSTAND

Kopf **3c8dce7974b2aac836b1fbe929292422efdcc43d** auf main 2cb2865b (ein Commit; gebaut und gemessen auf e699a834, umgesetzt ohne Konflikt). Vorgänger: Abgabe 05f2ba5f (z384 ROT an drei Wänden, die nur der Zug fährt).

## Die drei Wände und ihre Wurzel

| Wand im Zug | Text | Wurzel | Heilung |
|---|---|---|---|
| Regler wirkt 2/3, QUOTE | haus:L1 0,666 · 0,599 · haus:L2 0,288 | Die Quote ist ein Verhältnis: mit der glatten Wand fällt die L0 um 34 %, und in der Flächen-Stufe kürzte außer Dach, Boden und Brüstung KEIN Teil (Fenster, Bogen, Hof, Kuppel, Türen, Wandfelder: 1,00). Die Wand nennt nur das Höchste — die Klasse sind 78 + 4 von 984 Regler-Fällen. | Das Gesetz der Stufe am Teil (unten) |
| Regler wirkt 3, BUDGET | bend=1 an gotisch L0: draws 13 > 12 | Die Stufe liegt jetzt UNTER ihrer Dreiecks-Zeile und streckt nicht mehr (119 224, vorher gestreckt 105 694); das Austritts-Gesetz plant ceil(353 856 Ecken / 196 608) = 2 Teile, fügt aber der Reihe nach: 122 016 · 173 844 · 57 996 = 3. | Plan und Fügung EINE Rechnung, `phyto-core.js:5530` `_budgetStuecke` (Plan `:5617`, Fügung `:5695`) |
| Asset-Vertrag v1 | „Selbsttest der Budget-Wand feuert nicht" (haus[2].tris) | Die Zeile 7 250 war an marokkanisch/1 (7 224) gemessen; schwerster Rezept-Fall jetzt 3 594 (fraenkisch/7), halbiert 3 625 wird nicht rot. Goldens 128/128 byte-gleich. | `fachwerk-core.js:102` 7 250 → 7 000, dazu der eingefrorene Umschlag `spec/asset-contract/v1/golden/render-config.json` |

## Das Gesetz der Stufe am Teil (fachwerk-core.js)

| Teil | Zeile | Flächen-Stufe (L1) | Dreiecke |
|---|---|---|---|
| glatte Wand | `:661` `wandFelder` (Flügel-Bau `rs`) | je Spalte EINE Platte, geteilt nur am Knick des Kontakt-Schattens `AO_KNIE` (`:2069`, EINE Zahl für Bake und Wand) und im Verband an Sockel · Stein · Gesims | Teil 1,00 → 0,64 |
| Fensterflügel | `:993` `windowSash`, `:982` `flaechen` | Rahmen als RING (vorn, hinten, Außenkante), Kreuz und Scheibe als Flächen auf den Tiefen der L0 | 84 → 36 |
| Keilsteine, Zwickel, Kämpfer | `:1044` · `:1057` · `:1050` | ohne vergrabene Stoß- und Lagerflächen (`prisma` kennt `ohne`), Kämpfer-Rundung 2 statt 6 Sehnen (1 mm) | Fenster-Bögen 1,00 → 0,62 (marokkanisch 2 940 → 1 820), Arkade 1,00 → 0,68 |
| Brüstungs-Stab | `:1522`, `:990` `stab` | ohne Kopf und Fuß (stecken im Riegel) | 12 → 8 |
| Kellermaul-Brüstung | `:850` | schläft im Innern wie `railSeg` | −492 je Haus |
| Walm | `:828` | Ziegel-Band je Reihe als REGEL der Stufe (bisher nur über der Zeile) | gotisch hip=1 L1/L0 0,522 → 0,113 |
| Kuppel, ferne Stufe (L2) | `:1723` | 12 statt 18 Bänder, Feld-Schritt × 3, keine Teile im Innern des Kastens | 1 196 → 864; japanisch kuppel=1 L2/L0 0,288 → 0,074 |

**Was das eigene Auge vor dem Spiel fing** (Albedo-Paare am Kern, `p3/n1011/pw/schau.sh`, Kern vor ↔ nach):
- Der Flügel als geschlossener Kasten (erste Fassung, 84 → 24) läge als Holz hinter dem durchsichtigen Glas, und sein Kreuz stünde vor der Scheibe statt wie in L0 dahinter → Rahmen-Ring mit den Schichten der L0 (`:993`).
- Die zusammengelegte Wandplatte verliert den Kontakt-Schatten: der Bake dunkelt nur Teile ≤ 4,2 m, je Ecke, linear bis 2,6 m. chinesisch L1 Wand-Ton +10 %, und die fernen Stufen erben ihn (`sollTon` misst am L1-Bild) → Teilung am `AO_KNIE` (`:661`, `:2069`).
- Die Lager der End-Keile bleiben: der Kämpferstein ist 6 cm schmaler, 3 cm des Lagers sieht man von unten (`:1044`).

## Gemessen

**Quote am Kern** (wie die Wand misst: Saat 1 — `scripts/diag-regler-wirkt.cjs:55` `const SEED = 1`, EINE Saat; 32 Rezepte × Grund-Bau + jeder Regler-Rand = 984 Fälle; `p3/n1011/pw/quote-alle.cjs`, Roh `p3/n1011/pw/quote/{alt,neu0,neu2}-*.json`):

| | main e699a834 | Abgabe 05f2ba5f | geheilt |
|---|---|---|---|
| L1/L0 > 0,5 | 0 | 78 | **0** |
| L2/L0 > 0,15 | 0 | 4 | **0** |
| höchste L1 | 0,490 marokkanisch terrasse=1 | 0,666 marokkanisch terrasse=1 | 0,484 chinesisch kuppel=1 |
| höchste L2 | 0,136 barock D=5 | 0,288 japanisch kuppel=1 | 0,145 chinesisch terrasse=1 · 0,144 holzhuette kuppel=1 · 0,142 pueblo roofCurve=1 |
| Grund-Bau 32 Rezepte, Dreiecke L0 · L1 · L2 | 2 177 522 · 540 298 · 99 770 | 1 782 098 · 433 462 · 51 290 | 1 782 098 · 355 822 · 50 958 |

L0 aller 984 Fälle gleich zur Abgabe 05f2ba5f; L1 leichter in 959 Fällen, schwerer in 0; L2 leichter in 59, schwerer in 0. Über einer Zeile (132 000 · 44 000 · 7 000): 0 (L1 höchstens 39 562, L2 höchstens 6 236).

**Faltung** (echte Brücke, alle Arten × Regler-Ränder, 9 112 Lieferungen, 3 580 gefaltet; alter ↔ neuer Kern bei gleichem Haus-Kern, `p3/n1011/pw/faltung-dump.cjs`, Roh `quote/faltung-{altphyto,neu}.json`): **6 Lieferungen ändern sich**, alle Haus-L0 an Regler-Rändern — gotisch bend=1 13 → 12 Draws; alemannisch bend=1, fraenkisch bend=1, gotisch storeys=12, hanseatisch roofCurve=1, marokkanisch storeys=12 mit gleicher Draw-Zahl und anderer Fügung. Kein Grund-Bau, keine andere Art, kein Fall mit mehr Draws. Über der Draw-Zeile danach: 0.

**VERTRAGS-AKT haeuser.json** (258 Fälle): gegen die Abgabe 05f2ba5f **183 neu — L0 0 von 65 (0 Bytes Differenz) · L1 62 von 64 (31 Rezepte, Gestalt; hochhaus gleich) · L2 61 von 65 · L3 60 von 64**. L2/L3 nur im Ton (Saat 7: L2 Median 0,09 %, größte 0,84 % chinesisch; L3 Median 0,20 %, größte 2,33 % modern), Gestalt nur barock L2 (Kuppel). Gegen main e699a834: 230 von 258 (L0 40 = die 20 Rezepte der glatten Wand).

**lod.K5 am Bau** (dieselbe `wechselProbe`, 32 Rezepte, Saat 1; `p3/n1011/pw/pop.cjs`, Roh `quote/pop-{alt,vorheil,neu2}.txt`): kein Täter, alles ≤ 1 px.

| | main | Abgabe 05f2ba5f | geheilt |
|---|---|---|---|
| L1 Median · schlechtester | 0,20 · niedersaechsisch 0,92 | 0,20 · niedersaechsisch 0,92 | 0,20 · niedersaechsisch 0,92 |
| L2 Median · schlechtester | 0,43 · pueblo 0,93 | 0,41 · japanisch 0,89 | 0,41 · japanisch 0,89 |

Durch die HEILUNG steigt nur: barock L2 0,03 → 0,10 px (Kuppel-Profil) · chinesisch L1 0,03 → 0,06 px (Walm-Band). italienisch L1 0,18 → 0,42 px und franzoesisch 0,80 → 0,86 px kommen vom Schnitt B (glatte Wand), nicht von der Heilung; hochhaus L1 0,73 → 0,08 ebenso.

**Bildpaare** (Albedo am Kern, 960 × 540; Anteil der Pixel mit Kanal-Differenz > 8 und > 24 von 255; `p3/n1011/pw/bild-diff.cjs`):

| Ansicht | L0 vor ↔ nach | L1 vor ↔ nach Heilung | L0 ↔ L1 vorher | L0 ↔ L1 nachher |
|---|---|---|---|---|
| alemannisch 12 m (Fachwerk) | 0 | 0,04 % · 0 % | 5,60 % · 5,42 % | 5,64 % · 5,42 % |
| marokkanisch terrasse=1 12 m | 0 | 1,03 % · 0,03 % | 0,50 % · 0,21 % | 1,51 % · 0,24 % |
| marokkanisch terrasse=1 17 m | 0 | 0,80 % · 0,04 % | 0,83 % · 0,50 % | 1,59 % · 0,54 % |
| barock 17 m | 0 | 0,44 % · 0 % | 0,01 % · 0 % | 0,46 % · 0 % |
| chinesisch 17 m (Walm) | 0 | 0,10 % · 0 % | 0,06 % · 0,06 % | 0,16 % · 0,06 % |
| barock 28 m, L2 (Kuppel) | 0 | L2 0,00 % · 0 % | L0↔L2 1,08 % · 0,17 % | L0↔L2 1,08 % · 0,18 % |

Was zwischen L0 und L1 der glatten Wand bleibt, ist das Rauschen des Bakes (weiß, je Ecke, ±7 %): weniger Ecken, anderes Muster — weiche Töne bis 9 %, keine Kante, kein Loch (die zwei Pixel > 40 am marokkanischen Haus sind Kanten-Pixel). Bilder in diesem Ordner.

## Linsen (Gebot 10)

- `scripts/diag-fachwerk-contract.cjs:692` **DIE STUFE AM TEIL**: am Haus mit allen Teilen (marokkanisch + Arkade · Terrasse · Kuppel) je Teilsystem Stufe / L0 gegen sein Soll — gefache 0,64 · fenster 0,63 · hof 0,70 · arkade 0,68 · terrasse 0,57 · Kuppel fern 0,72. Vorher jedes 1,00 (ROT am Täter). Selbsttest: ein Kern, der die Stufe nicht an seine Teile reicht (Objekt-Mutant, kein Quelltext).
- `scripts/diag-asset-contract.cjs:894` **DIE FÜGUNG HÄLT DEN PLAN** (Selbsttest 14 der Budget-Wand): drei Teile eines Stoffs zu 122 016 · 173 844 · 57 996 Ecken auf 2 Draws → 2; der Reihe nach gefügt 3.
- `scripts/diag-regler-wirkt.cjs:594` **DIE KLASSE BEIM NAMEN**: die Quoten-Zeile nennt neben dem Höchsten die Zahl der Fälle über dem Soll und die schwersten sechs.

## Tore lokal (OMEN, am Kopf)

Am Baum des Kopfs (auf main 2cb2865b), jedes unter `p3/gpu-lauf.sh` (`p3/n1011/pw/tore/`):

| Tor | Urteil | Zeit | Zahl |
|---|---|---|---|
| gate:fachwerk-contract | GRÜN | 15:24 | Goldens der Häuser byte-gleich, DIE WAND DES STILS und DIE STUFE AM TEIL samt Selbsttests |
| gate:regler-wirkt Teil 2 | GRÜN | 15:26 | 11/11 Regler wirken · über Budget 0 · über der Quote 0 · 2 136 Bauten über die echte Brücke |
| gate:regler-wirkt Teil 3 | GRÜN | 15:29 | 10/10 · über Budget 0 · über der Quote 0 |
| gate:regler-wirkt Teil 1 | GRÜN | 16:50 | 131/131 · über Budget 0 · über der Quote 0 (samt Selbsttest) |
| gate:asset-contract | ROT 16:55 → GRÜN 17:02 | | erster Lauf: `render-config: … haus.2.tris: 7000 ≠ eingefroren 7250` (der eingefrorene Umschlag `spec/asset-contract/v1/golden/render-config.json`, nachgezogen, 1 Zeile); zweiter Lauf Goldens 128/128 byte-gleich, Budget-Wand haus[1] 26 778/44 000 · haus[2] 3 594/7 000, Fügung 2 (der Reihe nach 3) |
| gate:source-probes · gate:betriebsgesetz | GRÜN | | am Kopf |

Vor dem Umsetzen auf 2cb2865b (derselbe Haus-Kern, auf e699a834): gate:haus-fern GRÜN (Pop 47 Vorlagen, 0 Täter; Glas L1/L0 Glut Median 0,986 [0,860–1,102], main 0,986 [0,851–1,102]) · gate:settlement GRÜN.

NICHT lokal gelaufen (Neustart des Rechners 16:03 durch Windows Update, danach das Fenster für die Abgabe): check:statik als Ganzes, gate:studio-vertrag, gate:haus-welt, gate:nervensystem-fachwerk — sie fahren im Code-Check und werden unter dem Schloss nachgeholt.

## ABAB und Messschuld

ABAB 2+2 gegen main und die Messschuld (lod.K5#1 und material.K3 zuerst, dann lod · material · schatten · siedlung) fahren NACH dem Push (Wort des Koordinators 15:55); die Zahlen folgen in zug/abab.txt und zug/erledigt.txt. Die GPU-Probe am Kopf: `[gpu-probe: bild:stadt@0.5]`.

## Offen

- holzhuette kuppel=1 L2/L0 0,144 und chinesisch terrasse=1 0,145 gegen 0,15: fest, solange die Wand an EINER Saat misst (Saat 1).
- FUND (nicht geheilt, nicht mein Schnitt): die 12 Fenster des Kuppel-Tambours liegen in der Wand (Glas 0,05 m mittig in 0,22 m Putz, `fachwerk-core.js` `kuppel`) — kein Pixel, 144 Dreiecke je Stufe.
- FUND: das Rauschen des Bakes ist weiß je Ecke; zwei Stufen derselben Wand mit verschiedenen Ecken tragen verschiedene Muster. Ein Rausch-Feld mit Welt-Wellenlänge (statt Hash je Ecke) nähme der glatten Wand den Rest-Ton am Wechsel.

Status ZWISCHENSTAND.
