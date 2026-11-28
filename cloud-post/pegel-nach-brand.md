# Stand-Blatt pegel-nach-brand — ZWISCHENSTAND

Sprosse: `karte2.same.kopplung.stoerung#3` (Richter: Tierdichte −50 % sofort, Rückkehr 3–10 a; Pegel-Spitze ≥ 1,3 ×).
Basis: origin/main 7e73426e (V18.546.453).

## 27.11. 12:58 — Täter-Zahl (headless, Rumpf S3 der Station, null-Renderer, Kopf 7e73426e)
- `pegelSpitzeFaktor` **1** — Flusstiefe 0,758 m → 0,758 m an den 8 Flusspunkten 249–275 m vom Brand-Block (7 × 7 Zellen à 16 m, 49 Taten „brand“, 1,25 ha), Wetter sunny, 2 Regen-Stempel, Pegel-Zustand gereist.
- Täter: `stamm/wasser-hydro.js:287` `_pegelZustand` → `gelaende-core.js:1787` `pegelLauf` / `:1902` `pegelTafel`: die Tafel ist eine Funktion von (Höhe y, Lag-Klasse j) allein — kein Glied liest die Taten „brand“, der Abflussbeiwert des Regens ist die Konstante 0,3 der Wiese (`PEGEL.regen`).
- Plan: der verbrannte Anteil des Einzugsgebiets je Knoten des Flussnetzes (Taten „brand“ über `knotenFluss` stromab geführt, gerechnet je Änderung der Taten) hebt den Abflussbeiwert; die Erholung folgt der Uhr der Narbe.

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 13:10 — Schnitt im Kern steht, der Befund der Krone
- Geschnitten: gelaende-core `pegelBrand` (die Taten „brand“, gewogen mit ihrer Asche, stromab durch das Knoten-Netz: Ebene 2 → `knotenFluss` → Mündung `aus.von` → Ebene 1/0; je Knoten b = Fläche/Einzugsgebiet, m = 1 + b·(0,56/0,3 − 1)), `laufQ` (EIN Abfluss je Klasse, m-fach der Regen), `pegelTafel(…, brand)` (je verbranntem Knoten seine Reihe), `KANAL_FELDER` 11 → 12 (Feld 11: der Knoten des Glieds), die Leser `flussAm` · `spiegelQuer` · `flussRand` und `pegelKlassen.knoten` (die Marke des Chunks); stamm/wasser-hydro.js `_pegelTafel` liest die Taten, `_pegelMarkeVon` die Paare.
- Gemessen (headless, Mess-Bach der Station, 8 Punkte, Knoten der Ebene 1): Brandfläche 81 Zellen → m 1,112 · 2 601 Zellen → 1,867/1,487 · 10 201 Zellen → 1,867 an allen 8; `pegelBrand` 0,3–1,7 ms. Erholung an der Uhr der Asche: m 1,867 (0 a) → 1,855 (0,5 a) → 1,477 (1 a) → 1,001 (2 a).
- BEFUND: der Mess-Bach steht beim Boot bordvoll (Hub 0,20 m = Krone, F₄ 0,40) und jeder Regen sättigt an der Krone (`pegelHubVon` deckelt bei `krone` 0,2 m: q über 0,00055 m/d trägt die Aue, „nicht gerechnet“; der Regen der Wiese führt 0,072 m/d je Stärke 1 = 80 × die Spende). Die Tiefe am Bach bleibt darum 0,758 → 0,758 m auch mit m 1,867 — die Station liest 1 ×, bis die Aue den Überschuss trägt.
- Unter der Krone (leichter Regen ρ 0,002–0,004, 1 800 s Kalender) hebt der Brand die Tiefe: 0,548 → 0,638 m (×1,164) · 0,578 → 0,678 m (×1,17) · 0,478 → 0,538 m (×1,13). Die Tiefe folgt Manning q^0,6, der Brand multipliziert nur den Regen-Anteil: unter der Krone ist ×1,3 in der Tiefe mathematisch unerreichbar (b = 1 → höchstens ×1,21 an der Krone). Die Pegel-Spitze ≥ 1,3 × verlangt die Aue (Hub über der Krone) — sie bleibt offen an `gelaende-core.js pegelHubVon` (krone).

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 13:40 — Gegenlauf und Linse
- Gegenlauf ohne Brand, main 7e73426e ↔ Zweig, byte-gleich: Tafel 304478915ec09a1b · Marken ed0a3cba23ca39b1 (169 Chunks, 77 mit Wasser) · Spiegel 98dae146d090ddb6 (400 Punkte) · Quer/Rand 1aab84a5b5e487a3 (100).
- Linse in der Familie `scripts/diag-wetter-wache.cjs` (Teil A „Abfluss nach Brand“, Leser `brandAbflussRot`): am main 7e73426e ROT (Tiefe 0,658 → 0,658 m, ×1,000), am Zweig GRÜN (0,658 → 0,744 m, ×1,131); gepflanzt am lebenden Kern (`pegelBrand` → null) → ROT an (A) BRAND; Gegenlauf 0,658 m byte-gleich; Selbsttest drei Täter je genau einmal ROT; Lauf 58 s.
- Offen: die Aue (Pegel-Spitze ≥ 1,3 ×) · das Tier flieht nicht (`_kreaturNahrung`, stamm/kreatur-leben.js — eine andere Bahn) · die Seen lesen den Brand nicht (`waterLauf`).

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 14:30 — Vorprüfung 1 (auf main 7e73426e)
- Statik ganz grün (die Wachstums-Wand gegen origin/integ-probe: Prüf +1 516 / Spiel +1 165 Atome) · format:check grün · lint 0 Fehler · stamm-umzug --nach-karte 0 Abweichungen · `pegelBrand`/`BRAND_ABFLUSS` in studio-vertrag §9.
- Kandidat der Station unter `cloud-post/pegel-nach-brand-station/`: die Spitze im Regen statt im trockenen Wetter; Soll und Richter unverändert, die Sprosse bleibt damit ROT (×1,13–1,16 < 1,3).
- `zug.sh probe-tag` steht in keinem lesbaren Zweig dieses Containers (wie mischwald und spanne-auge melden); die Tore nach den Pfaden: gate:webgl-probe, bild:dorf@0.5, gate:worker-dichte (Kanal 12 Felder), gate:wetter-wache (die Linse).

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 14:40 — Antwort auf 14:31: die RECHNUNG der Aue vor dem Bau (Ergebnis unter 1,3)
Gemessen am Mess-Bach der Station (8 Punkte 249–275 m vom Block, Lag-Klassen j 4/5, Knoten kn 1 und kn −2), Boot sunny, Kopf 21235efe:
- **Der Block der Station (7 × 7 Zellen, 1,25 ha) ist ein kleiner Teil des Einzugsgebiets:** m = **1,064** (kn 1) und **1,004** (kn −2). Mit ±6 Zellen 1,147/1,033 · ±12 1,338/1,216 · ±25 1,835/1,867. Damit liegt jedes Abflussgesetz mit Beiwert 0,3 → 0,56 an diesem Bach unter ×1,04, auch ohne Krone: Tiefe ∝ (Spende + q)^0,6, (35,06/33,01)^0,6 = 1,037.
- **Die Aue als gegliederter Querschnitt** Q = Q_Bett(h) + R·Q_Aue(h − Krone), Manning je Teil, R = (B_Aue/B_Bett)·(n_Bett/n_Aue), n_Aue 0,035–0,10 nach Chow 1959. Lauf beim Boot: F₄ 0,40, grund 1,0098, q/Spende 33,0 (52 × der Abfluss der Krone). Tiefe vorher → nachher:

| m | R 0 (ohne Aue) | R 3 | R 10 | R 30 | R 100 |
|---|---|---|---|---|---|
| 1,064 (Block der Station) | 4,85 → 5,03 ×1,037 | ×1,030 | ×1,024 | ×1,017 | ×1,011 |
| 1,338 (±12 Zellen) | ×1,187 | ×1,149 | ×1,119 | ×1,087 | ×1,055 |
| 1,867 (b = 1) | 4,85 → 7,01 ×1,446 | 2,67 → 3,61 ×1,355 | 1,83 → 2,35 ×1,282 | 1,35 → 1,62 ×1,207 | 1,05 → 1,19 ×1,131 |

- **Bewertung:** ×1,3 entsteht nur, wenn das GANZE Einzugsgebiet des Bachs brennt (m 1,867) UND die Aue schmal ist (R ≤ ~5); dann stehen die Täler schon beim Boot im Sonnenschein **1,9 m über den Ufern** (Tiefe 2,67 m gegen die Krone 0,8 m). Mit dem Block der Station liest keine Aue mehr als ×1,04. Die Aue baue ich darum nicht in diesen Kopf, bevor du entscheidest.
- **Warum bordvoll beim Boot? Das Gesetz der Welt, nicht die Bühne der Station:** `stamm/wasser-hydro.js _pegelVergangenheit` faltet den Regen, den die Front in den `LAUF.fenster` Spieltagen vor dem ersten Stempel trug, in den Zustand (`pegelZustand`); gelaende-core `PEGEL.regen` 0,072 m/d je Stärke 1 (= 80 × die Spende 0,0009) trägt dann F₄ 0,40 → q 33 × Spende, der Hub sättigt an der Krone 0,2 m. Jeder Fluss der Welt steht damit nach einem Regen der Front bordvoll. Eigener Befund mit Zahl, kein Schnitt in diesem Kopf.
- **Nachbar boden-korn** (5e7904e0): `git merge-tree --write-tree origin/boden-korn HEAD` sauber, kein Konflikt.
- **Linse (A):** ihr Band 1,08 war eine eigene Zahl, nicht die der Karte. Kopf 2 misst am Bach der Station und urteilt am Gesetz: die Tiefe mit Brand muss die Manning-Tiefe aus dem m der Kopplung tragen (Konsum der Kopplung, Typ „eine Kopplung liest ihren Elternknoten nicht“). Das Soll ×1,3 bleibt das Urteil der Station; der Betreff nennt ehrlich „pegelSpitzeFaktor 1 → 1 an der Station“.

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 15:12 — Vorprüfung 2 (auf main 7e73426e), ohne Anspruch
- Die Aue trägt die Station nicht (Rechnung 14:40): Kopf 2 kommt ohne Anspruch, der Betreff nennt „pegelSpitzeFaktor 1 → 1 an der Station“; die Aue steht offen an `gelaende-core.js pegelHubVon` (Krone 0,2 m) mit der Tafel oben.
- Linse (A) urteilt am Gesetz statt am eigenen Band: m > 1 am Bach und die Tiefe steigt um ≥ eine Stufe des Hubs (`PEGEL.stufe` 0,01 m); live m 1,851, 0,658 → 0,744 m; gepflanzt `pegelBrand` → null → ROT; Selbsttest vier Täter, je einmal ROT.
- Statik ganz grün · format:check grün · lint 0 Fehler · boden-korn ohne Konflikt.

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 15:23 — Sprosse `karte2.planet.wetter.extreme#1`: Täter-Zahl und Plan
- **S1 headless am Kopf 45443bab** (Rumpf FLUT_AN, Saat der Welt + Saaten 0–2 × Jahre 0–9 = 40 Adressen): regenMaxMm **16** · hubMax **0,200 m = Krone** · ueberAueM **0** · bordvoll **40 von 40**. Gesetzter Stempel 100 mm (Stärke 1 über 10 h der Welt-Uhr, davor trocken): Hub 0,20 m zu jeder Stunde 0–64, ueber 0.
- **Das Wetter der Welt** (Ort 0/0, 10 Jahre): Zug 120 s, Jahr 2 400 s = 20 Züge, Regen-Mittel 0,298, rainy 0,6 · stormy 1, die stärkste Strecke 14,4 mm. Jahresmaxima des schnellen Abflusses F_j: j 2 0,85–0,92 · j 4 0,70–0,81 · j 8 0,50–0,55 · j 20 0,20–0,32. Mit `PEGEL.regen` 0,072 trägt jeder Sturm-Zug 30–40 × den Abfluss der Krone.
- **Plan (EINE Stelle je Teil):**
  1. Eichung = der Anfangsverlust: der Abflussanteil des Regens folgt dem Curve-Number-Verfahren (USDA SCS NEH-4 / TR-55: Q = (P − 0,2 S)²/(P + 0,8 S), S = 25 400/CN − 254 mm), der Regen der Strecke kumuliert. Wiese CN 58 (TR-55 Meadow, Boden B): Ia 36,8 mm, die gewöhnliche Strecke ≤ 16 mm bleibt im Boden, das 100-mm-Ereignis fließt mit dem Anteil bis 0,45 ab. `PEGEL.regen` wird der Regen selbst (10 mm/h = 0,24 m/d), der Anteil sitzt an den Knoten der Stempel. `_pegelVergangenheit` faltet dieselbe Eichung. Der Brand ist dieselbe Kurve mit CN 95 (BAER): b verbrannt mischt die zwei Faltungen. Damit fällt der feste Beiwert 0,56/0,3.
  2. Die Aue = der gegliederte Querschnitt in `pegelHubVon`: über der Krone Q = Q_Bett(h) + R·Q_Aue(h − Krone), R = (2F − B)/B · n_Bett/n_Aue aus den zwei Gesetzen des Kerns (Auen-Breite F je Ebene, `flussBreite` B; Chow 1959: n 0,030 Bett, 0,035 Aue mit hohem Gras): R ≈ 10,6 (Ebene 1, 1 km²) … 10,8 (Ebene 0, 100 km²).
  3. Das Bild: `flussAm` reicht über die Böschung hinaus, solange der Hub über der Krone steht (die Aue steigt 0,6 % quer, `AUE_QUER`); die Marke des Chunks trägt es.
- Der Stand beim Boot ändert sich (bordvoll → Ruhe-Spiegel, −0,20 m an jedem Fluss): die Abdrücke folgen mit Zahl.

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 15:35 — Lebenszeichen: Eichung und Aue stehen im Kern (unbebucht, WIP)
- **Eichung (CN, `ABFLUSS_CN`):** der schnelle Abfluss faltet den Regen nach seinem Anfangsverlust (Wiese CN 58, Ia 36,8 mm; Brandfläche CN 95, Ia 2,7 mm), das Ereignis endet am ersten trockenen Stück. `PEGEL.regen` 0,072 → 0,24 m/d (10 mm/h des Regens selbst); `_pegelVergangenheit` liest dieselbe Faltung (`pegelZustand`), EINE Stelle.
- **S1 headless (40 Adressen):** gewöhnliche Front hubMax 0,200 → **0,05 m**, ueberMax 0 → **−0,15**, bordvoll **40 → 0 von 40**; der gesetzte 100-mm-Stempel (Stärke 1 über 10 Stunden): Hub 2,47 / 1,93 / 1,65 / 1,33 / 1,02 / 0,75 / 0,52 / 0,15 m nach 0/1/2/4/8/16/32/64 h, **ueberAueM 2,27 m**.
- **Die Aue (`pegelHubVon`, gegliederter Querschnitt):** über der Krone Q = Q_Bett + R·Q_Aue, R = (2F − B)/B · n_Bett/n_Aue = 10,68 (F 45,1 m `auenBreite`, B 6,7 m `flussBreite`, n 0,030/0,035 Chow 1959).
- **Das Bild (`flussAm` → `auenFlut`):** jenseits der Krone, solange die Tafel `flut` trägt, steht das Wasser des nächsten Segments binnen F (dieselbe Breite wie im Abfluss), der Boden entscheidet; die Marke des Chunks liest dieselbe Reichweite (`pegelKlassen`). Ohne Flut kein Zweig — die Ruhe byte-gleich (Abdrücke folgen).
- **Echter Pfad gemessen** (100 mm in `state.regenStempel` → `_pegelTakt` → `atlasSpiegel`): nasse Breite quer zum Bach (−383/−866) **0 → 92 m**, am Bach (−134/243) **0 → 68 m**; Spiegel 2,23 m über dem Ruhe-Spiegel, Boden der Aue +0,08…+0,38 m.
- **Pose der Station:** `wiese` (−280,4/−1045,6) steht **204 m** vom nächsten Bach, NICHT an der Aue. Bildpaar-Orte (Bach −383/−866, Normale −0,674/0,739): **Bett** −383/−866 · **Ufer** −386/−863 (d 4 m) · **Aue** −399/−848 (d 24 m, Boden +0,38 m).
- Weiter: Bildpaar mit echtem Renderer, Linse (A) auf Sturm-Regen und b, Vertrag §9, Abdrücke, Kopf 3.

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 16:10 — Zwischenstand Kopf 3 (wartet auf die Landung von Bündel 2, Post 15:42)
- **Linse wetter-wache (A) am neuen Gesetz:** Sturm 20 mm (Stärke 1 über 2 Kalender-Stunden — unter Ia der Wiese, über Ia der Brandfläche), Urteil b > 0 und +1 Stufe. Zweig: b **0,981**, Tiefe **0,558 → 3,280 m** (die Aue trägt die Flut), gepflanzt `pegelBrand` → null 0,558 (ROT), Gegenlauf 0,558 byte-gleich. main bed6256c: b 0, 0,758 → 0,758 (ROT). Selbsttest grün (4 Täter je eine Klinge).
- **S3-Kandidat** (`pegel-nach-brand-station/`, nur Messung; Soll und Richter unverändert): Sturm 20 mm statt Regen 0,004 — am eigenen 7×7-Block der Station **0,558 → 1,005 m · ×1,801**, Gegenlauf byte-gleich; derselbe Kandidat an main ×1,000; der Rumpf wie er steht (trocken) ×1,000.
- **Abdrücke beim Boot (gewollt, die Eichung):** Tiefe am Mess-Bach 0,758 → 0,558 m (nicht mehr bordvoll); Tafel 304478915ec09a1b → ff8763219702f2eb · Marken ed0a3cba23ca39b1 → e83da138ff05dc3e (Chunks mit Pegel-Marke **77 → 2**) · Spiegel 98dae146d090ddb6 → d6d5bba64568565f · quer 1aab84a5b5e487a3 → 48649307a1e9b69f.
- **Bildpaar:** dieser Container schießt kein Weltbild — WebGPU auf swiftshader verliert das Gerät (auch an main bed6256c, `npm run blick`), der WebGL2-Rückweg kommt in 900 s nicht zur Ruhe. Die drei Orte (15:35) stehen; das Paar gehört an die GPU-Probe.
- **Nachbar boden-korn** (8bb76c6): mein Kopf 2 und Kopf 1 stießen an `docs/studio-vertrag.md` (die Brand-Zeile neben der Korn-Zeile); die Pegel-Deklarationen stehen jetzt einen Satz weiter, `git merge-tree --write-tree origin/boden-korn HEAD` **sauber**.
- Statik ganz grün · format:check grün · lint 0 Fehler.

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 16:55 — Lebenszeichen: Kopf 3 steht auf dem Bündel, wartet auf main
- Gates am Zweig: gate:wetter-wache **grün** (Abfluss nach Brand b 0,981, 0,558 → 3,280 m ×5,881, gepflanzt ROT), worker-dichte Spiegel byte-gleich (28 Gitter, maxDiff 0, Flut-Saat Main ↔ Worker 0) · `--kern` grün · `--gezeit` grün; `--faden --selftest` ROT an Zweig UND main bed6256c gleich (der K4-Zähler zählt eine Injektion des Selbsttests — dieser Container, nicht der Schnitt).
- Probe-Baum `git diff 21235efe HEAD | git apply -3` auf `buendel-abend` 29015b4e: ein Konflikt, `docs/studio-vertrag.md` (der Vereinigungs-Satz Korn + Brand) — gelöst: der Korn-Satz bleibt, die Pegel-Deklarationen (`ABFLUSS_CN`, `AUE`/`auenBreite`, `pegelBrand`) stehen einen Satz weiter; Statik ganz grün auf diesem Baum.
- Schub als Vorprüf-Kopf erst nach der Landung (Post alle 15:39).

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 17:40 — Lebenszeichen: Täter am eigenen Schnitt gefunden (gate stand-takt), geschnitten, Nachlauf läuft
- Nach der Lehre der Post 16:54 (Wind, Brand, Wetter → `diag-stand-takt` ganz): am Zweig hing die Messung > 600 s („Ruhe 0“, archLod · streuLod · nahWiese), main bed6256c grün in ~4,5 min. Stempel je Phase: (WN) samt Flut-Mutante 5 s, der Hänger danach.
- **Täter:** die Flagge `flut` stand schon beim Boot (Sommer-Schmelze auf 136–158 m hebt den Hub über die Krone, 23 Zeilen der Tafel) — dann zahlte JEDE Abfrage nahe einem Fluss die Ring-Suche der Aue (Streu und Wald fragen den Land-Spiegel je Kandidat).
- **Schnitt:** `T.flut` ist das Höhenband [unten, oben] der Zeilen mit Hub über der Krone; `auenFlut` fragt nur Buckets, deren Spiegel-Band (`kanalBand`, einmal je Kanal) es schneidet. Die Flut im echten Pfad unverändert (0 → 92 m / 0 → 68 m).

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 18:20 — Lebenszeichen: der zweite Täter im Stand-Takt beim Namen, geschnitten; Bündel B im main 948f68ee
- Stempel je Warter: der Hang stand in (WS) „am Fluss nächst der Mess-Wiese“ (`weltSteht#14`, 21 Chunks offen) — nach dem Regen des Brand-Herds über die Welt-Uhr 36 900 … 40 000. Gegenprobe main 948f68ee (trägt Kopf 1): `diag-stand-takt` GRÜN — der Täter ist der Aue-Schnitt.
- **Täter:** über der Krone lief die Flut (Hub 3,0 m) in 1-cm-Stufen je Lag-Klasse ab: ~40 Tafel-Wechsel je 3 000 Takte, jeder baute ~23–28 Chunks neu, ein Auftrag unter gewechselter Marke verfällt — die Welt stand nie (main deckelt an der Krone).
- **Schnitt (EIN Quantisierer `pegelHubVon`):** über der Krone die Stufe der Überflutungs-Karten, `AUE.stufe` 0,3048 m (USGS FIM: eine Karte je 1 ft Stand ab bankvoll). Dazu liest die Chunk-Marke den Hub nur an den Höhen ihres Wassers (`pegelKlassen` → `band`: Spiegel sA/sB der Segmente, `waterY` der Seen) statt ±40 m um die Chunk-Mitte (`PEGEL_RAND_M` fällt); ein trockener Chunk, den die Flut erreicht, baut neu. Nachstellung: offene Chunks am Fluss 21–36 dauernd → 0 ab Takt 1 000, Tafel-Wechsel ~40 → 1 je 3 000 Takte.
- Läuft: `diag-stand-takt --selftest && diag-stand-takt && --narbe`; danach S1, wetter-wache, worker-dichte, Statik neu und Kopf 3 auf 948f68ee.

Karte 2 gebucht 153 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 19:25 — Lebenszeichen: der dritte Täter beim Namen — die Strecke der Kurvenzahl wuchs über Tage
- Nach dem 18:20-Schnitt bleibt `diag-stand-takt` an (WS) ROT (Warter #17, Zeit 40 365): der Spieler treibt 50 m, Hub am Fluss 1,11 m (0,91 über der Krone), Flut-Band die ganze Höhe.
- **Messung im Warter:** Grund 0,709 (unter dem Klima-Mittel 0,298), schneller Abfluss F 0,127 — der Stempel hält „bewölkt“ (0,12 = 28,8 mm je Tag) über 7,8 Kalender-Tage (die Ruhe-Phasen halten das Wetter); die Strecke der Kurvenzahl summiert 225 mm zu EINEM Ereignis. Im freien Klima (6 Jahre, Eich-Probe) ist die längste Strecke 3 Züge, 14,4 mm, F je Jahr 0.
- **Schnitt (EIN Ort, `cnStempel`, `ABFLUSS_CN.tagH` 24):** die Kurvenzahl ist auf den Regen EINES Tags geeicht (NEH-4 Kap. 10; Hawkins et al. 2009) — die Strecke endet auch nach 24 h. Der Sturm 100 mm/10 h (S1) und 20 mm/2 h (S3) liegen in einem Tag, unverändert. Nachlauf läuft.

Karte 2 gebucht 153 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 20:05 — Vorprüf-Kopf 3 auf main 948f68ee (Bündel B trägt Kopf 1)
- **Stand-Takt** nach dem 24-h-Schnitt der Kurvenzahl: `--selftest` · ganz · `--narbe` je GRÜN (vorher ROT an (WS), Warter #17).
- **S1 (extreme#1):** freies Klima 3 Saaten × 10 Jahre: bordvoll **0 von 40** (main 40 von 40), Hub max 0,05 m; 100-mm-Stempel (Stärke 1, 10 h): Hub 2,33 m → **ueberAueM 2,13 m**, nach 64 h 0,15 m. Die Station-Pose steht 204 m vom Bach (nicht an der Aue); Bildpaar-Orte Bett −383/−866 · Ufer −386/−863 · Aue −399/−848 — das Bild gehört an die GPU-Probe (dieser Container schießt keins).
- **S3-Kandidat (stoerung#3):** 0,558 → **1,063 m · ×1,905**, Gegenlauf 0,558 byte-gleich; main ×1,000. Linse A 0,558 → 3,310 m (×5,934), gepflanzt ROT.
- **Abdrücke beim Boot (main → Kopf):** Tafel 304478915ec09a1b → ff8763219702f2eb · Marken ed0a3cba23ca39b1 → ad3e87bd4d2dd3a2 (Chunks mit Pegel-Marke **77 → 0**: die Marke liest nur das Band ihres Wassers) · Spiegel 98dae146d090ddb6 → d6d5bba64568565f · quer 1aab84a5b5e487a3 → 48649307a1e9b69f.
- **Batterie am Kopf-Baum lokal GRÜN:** check:statik ganz · format:check · lint · gate:fachwerk-contract · wetter-wache (Selbsttest + Lauf) · worker-dichte (Spiegel, `--faden`, `--kern`, `--gezeit`, `--faden --planet`) · planet `--anker` · Boot-Lib `--selbsttest` · stand-takt (Selbsttest, ganz, Narbe).
- Konflikt beim Auftrag auf main: `docs/studio-vertrag.md` (Korn-Satz neben Pegel-Satz), gelöst wie Kopf 2.
- **Nachbar boden-korn** f6e0b02: `git merge-tree --write-tree origin/boden-korn HEAD` meldet EINEN Konflikt, `docs/studio-vertrag.md` — boden-korn verlängert die Zeile „Boden-Farbe am Fluss … lesen es) und den“ (`flussSohle`/`SOHLE`, `flussBank`), mein Satz „DER PEGEL IM REGEN …“ beginnt zwei Zeilen tiefer; Lösung: beide Sätze stehen nebeneinander, kein Wort fällt.

Karte 2 gebucht 154 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 20:40 — Lebenszeichen: main sprang zweimal (9a75d61c, b3740dd5), der Kopf steht neu auf b3740dd5
- **Täter am main 9a75d61c** (wetter-lagen-3, stehende Fronten bis 89 mm): am Gesetz des Kopfs stand der Fluss **100 %** der Zeit über der Krone (Median 0,81 m) — der Hub las den Regen absolut, nicht gegen das Klima des Flusses.
- **Schnitt (`laufQ`):** Q/Q̄ = (s·B + r·F)/(s + r·F̄), F̄ das Mittel des CN-Abflusses im Klima (`pegelKlima`, die Lage `abflussMittel`); bei F̄ 0 byte-gleich. Linse (A) KRONE IM KLIMA in `diag-wetter-wache`: 100 % → 23,3 % über der Krone, Median 0,81 → 0,05 m; gepflanzt ROT.
- Am Baum auf 9a75d61c lokal GRÜN (stand-takt ×3, S1, S3 ×3,398, wetter-wache, worker-dichte ×5, anker, Boot-Lib, Statik). Auf b3740dd5 (boden-korn-2: Vertrags-Satz neben dem Pegel-Satz, beide stehen) läuft die Batterie neu.

Karte 2 gebucht 155 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 20:55 — Vorprüf-Kopf 3 auf main b3740dd5 (wetter-lagen-3, boden-korn-2, wurf-mit-luft-2 im main)
- **Täter beim Sprung des main 9a75d61c:** wetter-lagen-3 bringt stehende Fronten (Strecken bis 89 mm) — am alten Gesetz stand der Fluss **100 %** der Zeit über der Krone (Median 0,81 m): der Hub las den Regen absolut, nicht gegen das Klima des Flusses.
- **Schnitt (EIN Ort, `laufQ`):** Q/Q̄ = (s·B + r·F)/(s + r·F̄) — F̄ das Mittel des CN-Abflusses im Klima (`pegelKlima`, die Lage `abflussMittel`, gerechnet aus dem EINEN Klima-Stempel in `_regenMittel`); bei F̄ 0 byte-gleich zum alten Gesetz. Bankvoll ≈ 1,6 Q̄ (Leopold, Wolman & Miller 1964; Williams 1978: 1–2 Jahre).
- **Linse (A) KRONE IM KLIMA** in `diag-wetter-wache`: 60 Läufe am Ort des Klimas, abflussMittel 0,042 → Median **0,050 m** (Krone 0,200), über ihr **23,3 %** der Zeit; gepflanzt abflussMittel 0 → Median 0,810, 100 % → ROT an (A) KRONE. Selbsttest mit zwei Mutanten.
- **S1 (extreme#1):** 40 Läufe, Regen max 89,3 mm, Hub max 0,5 m; 100-mm-Stempel: Hub 0,5 m → **ueberAueM 0,30 m** (eine Stufe Aue, 1 ft), nach 16 h 0,02 m. Station-Pose 204 m vom Bach; Bildpaar-Orte Bett −383/−866 · Ufer −386/−863 · Aue −399/−848 — Bild an die GPU-Probe.
- **S3-Kandidat (stoerung#3):** 0,098 → **0,333 m · ×3,398**, Gegenlauf 0,098 byte-gleich; main b3740dd5 0,758 ×1,000. Linse A 0,098 → 1,290 m (×13,234), gepflanzt ROT.
- **Abdrücke beim Boot (main b3740dd5 → Kopf; 9a75d61c gleich):** Tafel 3ecfa33ab28a6065 → ba34b56f6bc4afd4 · Marken 63e1d65ed4974611 → d3cba52496b68d0d (77 → 77) · Spiegel 4a13a23a4ef3b3a6 → 04fcaee70f080016 · quer f433399bbc878de7 → a86adb0d84573235.
- **Batterie am Kopf-Baum lokal GRÜN:** check:statik ganz · format:check · lint · gate:fachwerk-contract · wetter-wache (Selbsttest + Lauf) · worker-dichte (5 Läufe) · planet `--anker` (Selbsttest + Lauf) · Boot-Lib `--selbsttest` · stand-takt (Selbsttest, ganz, Narbe).
- S1, S3, Gegenlauf und Abdrücke am Kopf auf b3740dd5 byte-gleich zum Kopf auf 9a75d61c; der Vertrags-Satz von boden-korn-2 (`flussSohle`, `flussBank`) und der Pegel-Satz stehen nebeneinander.
- **Nachbar boden-korn** 6c572d1: `git merge-tree --write-tree origin/boden-korn HEAD` sauber (boden-korn-2 steht im main).
- **Ehrlich offen:** Basisabfluss-Index ≈ 0,09 (Profi 0,5–0,7) · bankvoll trägt nur 1,6 Q̄ (Bett-Geometrie des Kerns) · Bildpaar · der Bach nach trockenem Wetter 0,098 m tief.

Karte 2 gebucht 155 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 21:40 — Stations-Kandidat S3 ist ein echter Patch (auf den Auftrag 21:27)
- `cloud-post/pegel-nach-brand-station/k2-zusammenspiel-S3.diff` neu als `git diff` gegen den pm-Kopf **1522407a** (die Station k2-zusammenspiel im Zweig punkte-maschine, Teil S3, 4 Hunks): `spitze()` (Sturm Stärke 1 über 300 s Kalender, 20 mm) liest `blockVor.fluss` und `block.nach.fluss`, `zurueck.fluss` den Gegenlauf; Aufruf `regen: 1, regenS: 300`. Soll und Richter-Text unverändert.
- Geprüft: `node --check` GRÜN; `git apply --check` an frischem pm-Baum GRÜN, angewendet byte-gleich zum Kandidaten.
- `npm run gate:welt-boot` (= `welt-boot.cjs --selbsttest`) war vor dem Schub von Kopf 3 GRÜN (Batterie am Kopf-Baum, 18/18).
- „Aue über der Krone“ ist meins im Kopf 3 (die Bahn wetter-lagen schneidet sie nicht, Rücknahme 21:08).

Karte 2 gebucht 155 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 22:05 — Lebenszeichen: die Wurzel der drei Roten am Kopf 3 gemessen — der Bezug des Hubs, nicht das Bett
- **Messung ohne Regen** am breitesten Fluss-Punkt (Playtest V9.43-d, −986,8/1012,7): Sohle 13,171 · Bank 13,971 · Breite 10,60 · D 0,80 — main und Kopf 3 **byte-gleich**; die Lesart „das Bett ändert sich“ fällt. Der Spiegel: main Hub **+0,20** (an der Krone, bordvoll — das alte Gesetz mit dem Klima von wetter-lagen-3), Kopf 3 Hub **−0,37** → Tiefe 0,80 → 0,43 m (< 0,5: V9.43-d rot), der Mess-Bach 0,758 → 0,098 m (keine Furt 0,5–0,75: F rot).
- **Täter (`laufQ`):** Kopf 3 bezog den Hub auf das Mittel inkl. Regen, und der Basisabfluss trug nur die Erd-Spende (BFI 0,08) — der trockene Tag ließ den Fluss auf 8 % seines Mittels fallen.
- **Schnitt im Bau:** der Bezug bleibt der Basisabfluss wie im main (trocken = Hub 0 = das geschnitzte Bett), seine Größe folgt dem Klima: g = max(s, r·F̄·bfi/(1−bfi)), `PEGEL.bfi` 0,6 (Base-Flow-Index, Beck et al. 2013); bei F̄ = 0 byte-gleich zum main-Gesetz. Gemessen: breitester Fluss 0,71 m (Hub +0,11), Mess-Bach 0,558 m (Hub 0). Läuft: werk-im-wasser, wetter-wache, S1, kamera-laub, Playtest.
- Ehrlich: der S3-Kandidat liest damit ×1,197 (< 1,3).

Karte 2 gebucht 156 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 23:10 — Lebenszeichen: Kopf-4-Baum, Batterie GRÜN bis auf `gate:wasser-leben` (P4) — der Täter beim Namen, geschnitten
- Am Kopf-4-Baum (bfi 0,7) GRÜN: Playtest „✅ Alle Invarianten OK“ (V9.43-d), WERK-IM-WASSER (Furt F), `gate:kamera-laub` (K7), stand-takt ×3, worker-dichte ×5, wetter-wache, welt-boot, statik, format, lint, daten-contract. Breitester Fluss trocken 0,71 m (main 0,80, Kopf 3 0,43), Mess-Bach 0,558 m.
- `gate:wasser-leben` ROT (3): „P4 REGEN: {"hub":0.01,"post":1,"koerper":0.01,"fest":0}“ und zweimal K10 LEER. **Täter P4:** `gelaende-core.js` `cnStempel` zählte die Strecke der Kurvenzahl nur bis zum letzten Knoten — ein gehaltenes Wort (der Sturm der Linse: 240 Takte ohne Knoten) hielt P = 0, kein Abfluss. **Schnitt** in `laufFalte`: der Weg bekommt einen Knoten auf jetzt mit dem Regen des letzten; trocken ist das Stück null. Gemessen: nach 20 min Sturm F der schnellen Klasse 0 → 0,31, q 0 → 4,6·10⁻³ m/Tag (über der Krone).
- K10 LEER (die Höhlen-Probe fand 8 statt ≥ 20 Proben, Spieler/Kamera/Tier 0) — läuft in der Batterie gegen main gemessen.

Karte 2 gebucht 156 von 1 718 · Status ZWISCHENSTAND.

## 28.11. 00:30 — Lebenszeichen: Kopf 4 am main 23b593ac gemessen; main b56b51f0 (sprache-dialekt-2b, wurf-mit-luft-3) gemischt, glatt — die Batterie läuft neu
- **Schnitte:** `laufQ` misst den Hub über dem Grund (trocken im geschnitzten Bett, Hub 0), der Grund trägt `PEGEL.bfi` 0,7 seines Klimas (Beck et al. 2013); `laufFalte` gibt der Kurvenzahl den Knoten auf jetzt (der gehaltene Sturm fließt ab); Linse wetter-wache (A) KRONE streng mit Mutant.
- **Die vier Namen vom 22:31-Blatt:** `gate:wasser-leben` GRÜN bis auf K10 LEER (8 Proben — am main b3740dd5 in derselben Kiste wortgleich: die Kiste, nicht der Kopf), P4 REGEN Hub 0,01 → 0,20 m, Körper 0,20 · Playtest „Voxel V9.43-d → Welle L“ ✅ · WERK-IM-WASSER GRÜN (Furt F) · `gate:kamera-laub` K7 ✅.
- **Zahlen:** breitester Fluss trocken 0,43 → 0,71 m; über der Krone im Klima 23 % → 1,7 % der Zeit (Median 0,160 < 0,200); S1 ueberAueM 0,30 m, regenMax 89,3 mm, bordvoll 20 → 29 von 40; Linse Brand ×1,896; S3-Kandidat ×1,134. Gegenlauf ohne Brand am gemischten Baum byte-gleich (tafel cf236202…, spiegel 65038fad…).
- Dazu grün: stand-takt ×3, worker-dichte ×5, anker, welt-boot, fachwerk, statik, format, lint, daten-contract, betriebsgesetz.
- **offen:** stoerung#3 ROT (×1,134 < 1,3); das Bildpaar der Flut an der Station ungefahren (Kandidat S1-Bild, Richter die GTX 1060).

Karte 2 gebucht 156 von 1 718 · Status ZWISCHENSTAND.

## 28.11. 01:00 — Kopf 4 am main b56b51f0 gemessen (die ganze Batterie); main 27d2f60e (tier-bewegung-3) gemischt, glatt
- Die ganze Batterie am gemischten Baum noch einmal: dieselben Zahlen wie am main 23b593ac (oben), dieselben Fingerabdrücke; `gate:wasser-leben` P4 Hub 0,20 · K10 LEER wie am main in dieser Kiste; Playtest V9.43-d ✅ · WERK-IM-WASSER GRÜN · `gate:kamera-laub` K7 ✅ · stand-takt ×3 · worker-dichte ×5 · wetter-wache · S1 · S3 ×1,134 · welt-boot · fachwerk · statik · format · lint · betriebsgesetz · daten-contract.
- Beide Stations-Kandidaten (S3, S1-Bild) stehen auch am pm-Kopf ca4c8a2d: `git apply --check` GRÜN.

Karte 2 gebucht 156 von 1 718 · Status ZWISCHENSTAND.

## 28.11. 01:25 — Vorprüf-Kopf 4 auf main 27d2f60e (gemischt über Kopf 3, kein Umschreiben)
- Am gemischten Baum (tier-bewegung-3: Massen der Fauna) gezielt: Gegenlauf byte-gleich (tafel cf236202…, spiegel 65038fad…) · `gate:wasser-leben` P4 Hub 0,20, Tier-Glieder K6/E3 grün, K10 LEER wie am main in dieser Kiste · Playtest „Voxel V9.43-d → Welle L“ ✅ · welt-boot · stand-takt Selbsttest · statik · format · lint · betriebsgesetz. Die übrigen Zahlen gelten vom main b56b51f0 (oben).
- `merge-tree` gegen main, wetter-lagen, boden-korn: 0 CONFLICT. `zug.sh probe-tag` ist von hier nicht erreichbar (koordination) — der Probe-Ruf: 4 Tore ohne Leerzeichen, darunter gate:webgl-probe und bild:dorf@0.5.
- **offen:** stoerung#3 ROT (×1,134 < 1,3) · das Bildpaar der Flut ungefahren (Kandidat S1-Bild, Richter die GTX 1060).

Karte 2 gebucht 156 von 1 718 · Status ZWISCHENSTAND.

## 28.11. 01:35 — Wartezimmer (Kopf 4 9395b45); die Brand-Reihe am Mess-Bach von stoerung#3; Zuteilung 00:57 gelesen
- Brand-Reihe (headless, Kandidat S3: Sturm 20 mm, derselbe Mess-Bach, 8 Punkte; b = der verbrannte Anteil am heißesten der Knoten): 7×7 Zellen (1,25 ha) b 0,074 → ×1,134 · 13×13 (4,3 ha) b 0,170 → ×1,242 · 21×21 (11,3 ha) b 0,304 → ×1,358 · ±400 m b 0,981 → ×1,896. Die 1,3 trägt das Gesetz ab b ≈ 0,25; der Block der Station verbrennt an keinem Knoten mehr als 7,4 %. Soll, Richter und Block bleiben: die Sprosse steht ROT mit dieser Zahl.
- Zuteilung (Koordinator an alle, 00:57): sukzession#2 und zerfall#2. Befund sukzession#2: die Narbe `brand` heilt in 72 h ÷ Wuchs ≈ 5,6 Spieljahre (Jahr = 16 Welt-Stunden), der Wald steht ab ~3,4 a; Yellowstone 1988 trägt nach 25 Jahren Jungwald von wenigen Metern und Totholz-Stangen. Der Täter von zerfall#2 ist `stamm/kreatur-leben.js` `_tickLeichname` — die Datei ist dieser Bahn gesperrt (Start-Brief): ich nehme sukzession#2 zuerst, zerfall#2 braucht die Freigabe.

Karte 2 gebucht 156 von 1 718 · Status ZWISCHENSTAND.

## 28.11. 02:05 — sukzession#2, der Gesetz-Schnitt: der Wald nach dem Brand geht seine eigene Uhr
- Geschnitten (die EINE Uhr der Tat geteilt, kein Zwilling): `TAT_NARBE.brand.waldJahre` 60 — die Tat `brand` lebt, bis ihr Wald steht (`_tatDauer`: 60 Spieljahre ÷ Wuchs); ihr Boden heilt wie bisher nach 72 h ÷ Wuchs (`_tatBoden`, Index `boden`): Narbe, Nährstoff, Asche, Busch und das Brand-Bett lesen ihn, der Jungwuchs die Wald-Uhr (`_sukzession` `sw`, `_sukzessionNaechste` je Rampe ihre Uhr).
- Gemessen (headless, 16 Orte im Ring wie der Rumpf der Station, Wuchs 0,75): Jungwuchs nach 5 / 25 / 60 a Stufe 0,4 / 0,7 / 0,7 → 0,06 / 0,18 / 0,4 (die 0,18 sind ~3–4 m: Yellowstone nach 24 a, Turner u. a. 2016), der Wald steht nach 6 → 80 a; Asche, Narbe (0,3 → 0 in 6 a), Nährstoff und das Bett (sperrt bis 6 a) byte-gleich; Gegenlauf (Tafel, Marken, Spiegel, Quer) byte-gleich; S3 ×1,134 unverändert. sukzession#3 „Wald ≥ 50 % nach 10–100 a“: im Band 0 → 100 % der Orte (ein Soll von dreien).
- Offen an sukzession#2: das Fach (Fächer, Prüfer-Urteil, Korpus der NPS-Fotoreihe) · die stehenden Totholz-Stangen (der Körper liegt im Pflanzen-Kern, dieser Bahn gesperrt) · der Flächenbrand mit Überlebenden-Inseln. `--brand` der Linse stand-takt bootet hier nicht (die Welt steht nicht, am main ebenso).

Karte 2 gebucht 156 von 1 718 · Status ZWISCHENSTAND.

## 28.11. 02:35 — Wartezimmer: GPU-Probe Kopf 4 GRÜN (02:02), main 93e4b83b gemischt glatt; der Korpus von sukzession#2 gesichtet
- `merge-tree` Kopf 4 und dieser Kopf gegen main 93e4b83b: 0 CONFLICT. Kopf 4 bleibt gültig.
- Korpus „Yellowstone 1988, Fotoreihe“ (Commons + NPGallery, Lizenz gemeinfrei · CC BY · CC BY-SA, je Datei gelesen): 199 Kandidaten, 46 nach Titel, Bild für Bild gesichtet. Das Motiv (eine Brandfläche im Lodgepole-Wald, Jahre seit dem Brand am Foto lesbar) tragen 25: ~1 a (1989/90) 8 · 9–12 a (1997–2000, Arnica 2009→2019, Norris 2007→2019) 9 · 18–31 a (2006–2019) 8. Fielen: Löschbilder, Rauch, Luftbilder, Satellit, Nahaufnahmen, Dubletten, geothermisch getötete Bäume.
- **offen:** Korpus 25 von 40, die Stufe 5 a ohne ein freies Foto (das nächste: 9 a). Das Fach senkt kein Soll — die Reihe trägt 25 Paare, das Blatt braucht 40.

Karte 2 gebucht 158 von 1 718 · Status ZWISCHENSTAND.

## 28.11. 02:41 — sukzession#2: das Fach als Kandidat (Fächer, Pose der Station, Korpus-Satz)
- Geschnitten (Kandidat `sukzession-2-fach.diff` im Stations-Ordner, gegen pm bafab955, `git apply --check` GRÜN): das FACH liest Orte, Spieljahr und die Jahre des Solls am Wortlaut der Station (wirft bei Änderung), schreibt an den 16 Orten der Folge EINE rückdatierte Tat „brand“ je Ort (1/5/25 a im Wechsel) und rahmt ihre Zelle (RAHMEN) — kein größerer Brand, kein Überflug. Dazu die Pose im Auge S2 und der Satz `yellowstone-1988` (Liste mit den Jahren je Foto).
- Gemessen (headless, Rumpf in der Seite): 48 Posen (1 a 18 · 5 a 15 · 25 a 15), die Taten tragen 1/5/25 a genau; Selbsttest des Fächers 16 → 17 GRÜN, zwei Mutanten der Station ROT.
- **offen:** Korpus 25 von 40 (Stufe 5 a ohne freies Foto) · die Bilder ungefahren (swiftshader: die Welt steht hier nicht) · das Urteil des Prüfers.

Karte 2 gebucht 158 von 1 718 · Status ZWISCHENSTAND.

## 28.11. 02:58 — main 9885e7c4 gemischt glatt; der Fach-Kandidat sukzession#2 neu gegen pm 9c09df5e, Korpus 28 von 40
- main 9885e7c4 gemischt (merge-tree 0 CONFLICT, Statik GANZ, format, lint, welt-boot, fachwerk, stand-takt-Selbsttest GRÜN). Kein Vorprüf-Kopf bis zur Landung des Bündels.
- Geschnitten: `sukzession-2-fach.diff` neu gegen pm 9c09df5e (sechs neue Sätze am selben Ort, beide Seiten bleiben, summe.saetze 36); `git apply --check` GRÜN, Selbsttest des Fächers 17 GRÜN · 0 ROT.
- Gemessen: Korpus 25 → 28 von 40 (drei Fotos der Maple-Narbe 2016, Foto 2018, 2 a, gemeinfrei; zwei Dubletten und eine Nahaufnahme fielen).
- **offen:** 28 von 40, die Stufe 5 a ohne freies Foto · die Bilder ungefahren · das Urteil des Prüfers · zerfall#2 (der Leser liegt in einer Datei, die diese Bahn nicht berührt).

Karte 2 gebucht 158 von 1 718 · Status ZWISCHENSTAND.
