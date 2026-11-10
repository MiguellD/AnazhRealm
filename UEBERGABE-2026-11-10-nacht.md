# Übergabe 10.11. 00:10 (Koordinator Konto 10, Fable-Woche 51 % um 00:04, +1 %/min)

**Stand:** main 78d37554, gebucht Σ 224 (Meisterkarte Version 2). Nichts wartet auf einen Handgriff, die Kette fährt ohne LLM.

**Kette (Protokolle `/tmp/claude/fahre-<id>.log`, `/tmp/claude/zug-sammler-<id>.log`):**
- z353 heim2-w20-wald-kosten: ROT ohne Wackler (Sicht-Arbeit Welle C, Kreatur-Linse Teil 3, Körper steht Welle L; Fenster-Wand ist auf main rot). Ein Champion ordnet zu und heilt nach `heim3-w20-wald-kosten`.
- z354 (00:06 Statik + Vorzug GRÜN, fährt): w26-winter-fichte-2, w27-karte-nadel, w27-zeiger, w27-ankunft-erstbild, w26-klang-schritt, w26-probe-node.
- z355: w25-gpu-wahl-2 · z356: w26-eiche-kante, w26-leib-raum, w27-werkbank-teil · z357: w27-takt-streu (enthält gpu-wahl-2).
- Nach jeder Landung: merge-base-Nachweis, `BUCHE_KOPF=<sha40> bash artifacts/profiband/werkzeug/buche.sh`, `punkte.cjs plan --kopf <neu> --vorher <alt>`, Meisterkarte neu.

**Ja des Schöpfers 10.11. 00:03 („Ja, landen“):** der Zweig `w27-decke-wurzel` (Atom-Decke fällt aus gate:betriebsgesetz, Wachstums-Wand urteilt am Zug, 4 000 Zeilen bleiben) landet, sobald er grün ist. Der Champion baut noch, der Zweig steht noch nicht auf origin. Vor dem Zug: Diff selbst lesen, `node scripts/diag-betriebsgesetz.cjs` + Selbsttest, Puls grün; dann in eine WARTENDE Schlange bündeln (alte Schlange töten, prüfen dass sie weg ist, mit dem Zweig neu starten — z356 oder z357). Das Ja gilt nur für diesen Zweig.

**In Arbeit (lokale Champions auf opus):** Stations-Deckel an der Wurzel (punkte-maschine, Push nur auf SELBSTTEST GRÜN, Baum `w4/pm-deckel`) · tor.dekl-Klasse der blinden Stationen (Baum `w4/pm-dekl`, Selbsttest lief 00:04 noch) · Rote Wände z353.
**Radeon:** Stau am Kopf 78d37554 in vier Scheiben (`/tmp/claude/w4/radeon-stau.out`), Scheibe A 6/6 UNGEMESSEN an Deckel/Frist, Scheibe B seit 23:36. Nach dem Ende buchen; nach dem Deckel-Schnitt Scheibe A neu messen.
**OMEN:** Bisektion ×1,47 GPU-ms im Spiel (185e99bb → 78d37554), Ergebnis als erledigt-Zeile + `bericht/0911-gpu-bank-stufe.md`. **GTX 1050:** w27-ort-pose.
**Cloud:** neun Sitzungen der Welle w27 (werkbank-teil abgegeben; offen wagen-spalt, tiere-sicht, studio-mesh, lod-baum, ferne-ton-5, boden-nah-2, haar-arm-2, verkehr-station) + takt-streu/winter-ähre/eiche-l1 per Post. Abgaben meldet `wache-k10.sh` (endet je Ereignis, neu starten).
**Budget:** alle Modelle 35 %, Fable 51 % (00:04), Reset 14.11. 21:00 UTC. Fable stieg seit 23:27 um ~1 %/min mit den neun Cloud-Sitzungen; ihr Modell stellt nur der Schöpfer um.

## Stand 00:35 (10.11.) — ZUERST LESEN

- **Stillstand-Alarm:** `/tmp/claude/w4/wache-geraete.cjs` (von `wache-k10.sh` je Runde gerufen, Stand in `w4/wache-stand/<GERÄT>.json`). Urteilt über Fortschritt statt Belegung: STILLSTAND (Job im Schritt · Schloss-Halter · offener Auftrag), LEERLAUF, VERWAIST, WACHE BLIND. `--blick` zeigt je Gerät den Stand, `--selbsttest` 9/9 GRÜN. Anlass: die OMEN stand 23:39–00:07 an einem verwaisten Schloss (Halter `omen-punkte-gtx-sitzung pid=17752`, per taskkill gestorben; der neue Treiber wartete in einer eigenen Schleife statt in `schloss_nehmen`). Die Wurzel im Schloss schneidet die OMEN-Sitzung (Auftrag `gpu-stufe`, START-Zeile in `zug/sitzung.txt`, Zwischenstand 00:20 in `zug/erledigt.txt`) — noch nicht geliefert.
- **Atom-Decke (Ja des Schöpfers 00:03):** `w27-decke-wurzel` @ 828232b1 fährt in **z356** mit (Schlange neu: `z355w → z356: w26-eiche-kante w26-leib-raum w27-werkbank-teil w27-decke-wurzel`). Allein ist der Zweig an seiner eigenen Wachstums-Wand ROT (Prüf +256 / Spiel +0), am Probe-Kandidaten der vier GRÜN (Prüf −964 / Spiel +7571, erlaubt 3785). `zug.cjs`: Einzel-Decke je Merge nach Klasse g gestrichen (b5386a8a9). Nach der Landung: Merge-Basis prüfen, dann `zug/brief-gemein.md:10`, Kommentare `zug.cjs:316/:355/:880`, `atome-je-datei.cjs:1`, `zug-sammler7.sh:64`, `w3/brief-regeln.md` nachziehen.
- **Kette:** z353 FAHRT ROT (Champion „Rote Wände z353“ → `heim3-w20-wald-kosten`), z354 Kandidat a3782a65 auf integ-probe seit 00:08 (CI + echt laufen), z355 w25-gpu-wahl-2, z356 siehe oben, z357 w27-takt-streu.
- **punkte-maschine 421edec74:** `tor.dekl` zieht den Abschluss (`tor.buendel`), SELBSTTEST GRÜN 166/166; danach neu messen: `fahrzeug.K2#1`, `K3#2`, `K4#1`, `K4#2` (Radeon). 20 Tor-Stationen wechseln den Abdruck. Champion „Stations-Deckel an der Wurzel“ läuft noch (rebase auf 421edec74).
- **Budget 00:25:** Woche 45 %, Fable 68 % (≈ 1 %/min bei neun Cloud-Sitzungen) — NOTBREMSE bei 98 %.

## Stand 00:50 (10.11.) — ZUERST LESEN (Fable 81 % um 00:43, rund 0,8 % je Minute)

- **main 78d37554, gebucht Σ 224.** Die Kette fährt ohne LLM: z354 (Kandidat a3782a65, Code-Check GRÜN 00:45, echt läuft) → z355 `w25-gpu-wahl-2` → z356 `w26-eiche-kante` + `w26-leib-raum` + `w27-werkbank-teil` + **`w27-decke-wurzel`** (Atom-Decke fällt, Ja des Schöpfers 10.11. 00:03; allein ROT mit +256 Prüf-Atomen, in der Summe GRÜN gemessen) → z357 `w27-takt-streu`. Logs `/tmp/claude/fahre-z35Xw.log`.
- **Nach jeder Landung ohne LLM:** `/tmp/claude/w4/nach-landung.sh` (Stand in `/tmp/claude/w4/nach-landung.log`): buchen am neuen Kopf → die Radeon misst `run --offen` → buchen. Das Artifact der Meisterkarte veröffentlicht nur der Koordinator: `meisterkarte.html` im Baum koordination lesen (Diff) und nach https://claude.ai/artifact/88XjFnv9yZbDG2PhbwJsYx veröffentlichen.
- **Nach z356:** die Landung von `w27-decke-wurzel` beweisen (`git merge-base --is-ancestor 828232b1 origin/main`), dann die alten Decke-Worte nachziehen: `zug/brief-gemein.md:10`, `zug.cjs:316/:355/:880`, `atome-je-datei.cjs:1`, `zug-sammler7.sh:64`, `w3/brief-regeln.md`.
- **punkte-maschine 0ddbfffd:** die tor.dekl-Klasse (421edec7, blinde Rufe 2 von 8 → 0 von 8) und der Stations-Deckel an der Leine (0ddbfffd; 1 460 Deckel-Risse seit 01.11., mit Urteil 0 → 605; Selbsttest 168/168). Offen: `deckel.json` ist nicht neu geschrieben (die Tafel ergibt 4 Teile, erlaubt sind 3), der Zwilling `H.quelle` (`stationen/seite.cjs:48`), klang.K5#2 fällt weiter als „Stille“. Auf der Radeon nachmessen: fahrzeug.K2#1, K3#2, K4#1, K4#2 (ihre Tor-Rufe waren blind).
- **Radeon-Stau am 78d37554** (`radeon-stau.sh`, Scheibe 3 von 4 lief um 00:45): Scheibe 2 ROT material.K2#1, material.K4#1, tiere.K1#2; ohne Urteil vegetation.K4#2 (Deckel), studios.K2#2 und studios.K3#2 (Frist).
- **OMEN (Sitzung „Herrscher des Omens“):** die Schloss-Wurzel ist geschnitten, koordination a81c428f (`gs_uebernimm`: der Wartende bricht ein verwaistes Schloss und übernimmt es; die ci-runner-Regel ist mit Mutante belegt; das eigene `frei()` der 34 Treiber fragt `gpu_frei` der Quelle; `p3/anhalten.sh` hält an und löst das Schloss). Vom Koordinator geprüft: der Commit steht, koordination × punkte-maschine mergt sauber, der Radeon-Hook `/c/actions-runner/hooks/job-start.sh:97` bricht ci-runner-Schlösser beim Start. Nicht nachgemessen: ihr Selbsttest (h) (i) (j). Bisekt der GPU-ms-Stufe ×1,47: [18/36] 1e783008 (Merge w22-geh-bild) ist langsam (Wiese Ego 32,65 und 31,92 ms), die Stufe liegt in den ersten 18, weiter bei bb421ed6 [9/36]; danach der GTX-Stau am Kopf.
- **Stillstand-Alarm:** `/tmp/claude/w4/wache-geraete.cjs` (`--blick`, `--selbsttest` 9/9), gerufen von `wache-k10.sh`; an einem echten Stillstand hat er noch nicht gefeuert.
- **Champion K7** (opus, Zweig `w27-k7-l2-rand`, Baum `w4/k7-rand`): die Wurzel ist der L2-Rand-Leser `_wieseGrund`; bei „ZUG JA“ mit `heim3-w20-wald-kosten` @ f5283f22 in EINEN Zug (z358). Kommt kein Bericht: den Zweig lesen.
- **Cloud:** neun Sitzungen laufen (Post nur per git `cloud-post/<zweig>.md`). GPU-PROBE: w27-boden-nah-2 2145a4a2 GRÜN, w27-haar-arm-2 fc424db8 GRÜN (Radeon), w27-ferne-ton-5 6b7d389a lief 00:42 auf der GTX 1050, w27-lod-baum 28e4b083 ABGEWIESEN. Abgaben in gebündelte Züge.
- **Beim Schöpfer am Gerät:** AppHelperCap.exe (OMEN), GitHub-Login der GTX 1050, Modell der Cloud-Sitzungen.

## Stand 01:00 (10.11.) — Nachtrag zum Block 00:50

- **z354 gelandet 00:48:** main = `a3782a65` (V18.546.239), sechs Zweige per merge-base in main belegt (w26-winter-fichte-2, w27-karte-nadel,
  w27-zeiger, w27-ankunft-erstbild, w26-klang-schritt, w26-probe-node). Gebucht ohne LLM: **224/330 am Kopf a3782a65** (Σ unverändert);
  Meisterkarte neu veröffentlicht 01:00.
- **Kette (ohne LLM):** z355 = w25-gpu-wahl-2 (Kandidat fbbeb318 auf integ-probe seit 00:55) → z356 = w26-eiche-kante + w26-leib-raum +
  w27-werkbank-teil + w27-decke-wurzel → z357 = w27-takt-streu → **z358 = w27-boden-nah-2 + w27-stadt-bild** (neu angehängt).
- **nach-landung.sh** läuft seit 00:46 (Log `/tmp/claude/w4/nach-landung.log`): je Landung buchen → Radeon `run --offen` am neuen Kopf → buchen.
  Die Radeon-Messung am a3782a65 beginnt, sobald Stau-Scheibe 3 (am alten Kopf 78d37554) endet; die Stau-Schleife ist nach Scheibe 3
  beendet (Scheibe 4 am alten Kopf entfällt, `--offen` am neuen Kopf deckt sie).
- **Stillstand-Alarm feuerte erstmals echt (00:50, GTX 1050 nach 17 min):** Job GPU-Probe w27-ferne-ton-5 stand im Start-Hook. Ursache: eine
  stehende Hand-Sitzung der GTX-1050-Sitzung hielt das Schloss (pid 10920 seit 00:26:37, gegen die Vorfahrt der CI). Sitzung beendet 00:54:13,
  der Hook nahm das Schloss 4 s vor seiner 25-min-Frist. Zeilen: `zug/sitzung.txt` + `zug/erledigt.txt` (gtx1050-hook, 893b12f4).
  Selbst-Regel der GTX 1050: keine Hand-Sitzung hält das Schloss länger als eine Probe (≤ 8 min). Nebenfund ort-pose: stadt-voll ROT
  (Platz-Mitte liegt in der Fahrbahn), Einzelheiten kündigt das Gerät an.
- **Budget 00:53:** Woche 55 %, Fable 84 % — NOTBREMSE bei 98 % (ab ~95 % einleiten).

## Stand 01:42 (10.11.)

- **z355 gelandet 01:15:** main = `fbbeb318` (V18.546.240), w25-gpu-wahl-2 per merge-base belegt; gebucht **224/330 am fbbeb318** (01:28).
  Ein ROT als Wackler ohne Täter gewertet: Fenster-Wand (voll 15/18) — steht in den Protokollen von 14 Zügen seit z330, Ursache ungeprüft.
- **Kette neu: `/tmp/claude/w4/nach-landung2.sh`** (Aufgabe b839b0970, Start-Kopf a3782a65): misst am JÜNGSTEN Kopf, bucht neben der
  Messung, nie zwei Buchungen zugleich, ein Lauf ohne Urteil steht als „KEIN URTEIL“ im Log. Am fbbeb318 sind 124 Radeon-Stationen
  offen (Deckel Σ 74 min), Messung läuft seit 01:25. Die alte `nach-landung.sh` ist beendet.
- **Abgabe w27-studio-mesh-pm 4846d777** (studios.K4-Probe, punkte-maschine-Seite): gehalten, bis die Abgabe von w27-studio-mesh in main
  steht — `/tmp/claude/w4/pm-nach-main.sh w27-studio-mesh-pm w27-studio-mesh` (Log `pm-nach-main.log`), Push nur auf SELBSTTEST GRÜN.
  Post: `cloud-post/w27-studio-mesh.md`.
- **GTX 1050, w27-ort-pose:** Entscheid A (Abgabe dorf + stadt, stadt-voll offen als Folgeschnitt nach z356). Patch 10 Dateien +254/−152
  liegt nur am Gerät — er landet nach dem GitHub-Login des Schöpfers dort.
- **Budget 01:50:** Fable 91 %, Woche 61 % (Reset 14.11. 22:00 MEZ). Ab ~95 % Notbremse: TaskStop (Wache, K7-Champion) +
  `bash artifacts/profiband/werkzeug/notbremse.sh`. Die Ketten ohne LLM laufen weiter: Schlangen z356 → z357 → z358, `nach-landung2.sh`,
  `pm-nach-main.sh`. Handarbeit danach: Meisterkarte je Buchung veröffentlichen (heute Version 4 am fbbeb318), merge-base-Beweis für
  w27-decke-wurzel 828232b1 nach z356, K7 `w27-k7-l2-rand` mit heim3-w20-wald-kosten bündeln.

## Stand 02:00 (10.11.)

- **K7-Champion zurück, Abgabe `w27-k7-l2-rand` 71367ab5** (1 Datei `scripts/diag-koerper-stand.cjs`, +79/−99): der Spiel-Leser ist
  unschuldig, die Linse zählte die Wiese gegen die Kachel-Fläche und rechnete mit Poisson ± 3 %. Neu: je Zelle des Gitters, Jackknife
  über die Chunks. K7 L2 an main 1,242 → 1,118 ± 0,151 (Zahlen des Champions, von mir nur der Diff gelesen). **Fährt als z359** nach z358
  (Aufgabe bilh2rnsl). Die Wand ist dafür gröber: Fund-Register 10.11. 02:00.
- **`heim3-w20-wald-kosten` f5283f22 merget nicht mehr:** Konflikt in `scripts/diag-sicht-arbeit.cjs` schon gegen main fbbeb318, dazu
  fünf gemeinsame Dateien mit w27-takt-streu (z357). Er braucht EINEN Heim-Schnitt nach der Landung von z357 und fährt dann hinter z359
  (K7 war sein einziges ROT). Das ist der erste bereite Hebel nach z357.

## Stand 02:22 (10.11.) — die Wachstums-Wand urteilt jetzt am Zug

- **z356 ist in main: 20a01782 (V18.546.241), darin `w27-decke-wurzel` 828232b1.** Die Atom-Decke von `scripts/` ist gefallen (Schöpfer
  10.11. 00:03 „Ja, landen“, nur für diesen Zweig). Es urteilt die Wachstums-Wand: `scripts/` + `spec/` ≤ ½ Spiel-Wachstum, in Atomen,
  im Fenster des ZUGS (`scripts/diag-betriebsgesetz.cjs` Abschnitt 6, gerufen von `zug.cjs` mit `--grund <basis>`). Gebucht ist noch
  224 am fbbeb318; die Kette `nach-landung2.sh` misst die Radeon weiter und bucht am neuen Kopf.
- **z357 (`w27-takt-streu` allein) FAHRT ROT 02:02 an genau dieser Wand:** Prüf +1672 bei Spiel +1217, erlaubt 608 (Täter
  `diag-hitch-telemetrie.cjs` +1234, `diag-chunk-satz.cjs` +396, `diag-altlasten.cjs` +105). Kein Wackler. Statik und Playtest des
  Kandidaten waren GRÜN.
- **Die Regel daraus: Züge nach WAND-SUMME bündeln.** Werkzeug ohne LLM: `bash zug/werkzeug-w3/wand-summe.sh <zweig> [<zweig> …]`
  (misst je Zweig und das Bündel gegen origin/main mit dem Gesetz von main; letzte Zeile BÜNDEL GRÜN/ROT/KONFLIKT; erprobt 02:19 am
  Bündel von z359). Gemessen gegen 20a01782 (Prüf / Spiel, erlaubt):
  takt-streu +1672 / +1217 (608, ROT) · boden-nah-2 −10 / +445 · k7-l2-rand −88 / 0 · studio-mesh 0 / +1334 (667) ·
  heim3-wald-kosten +52 / +3239 gegen seine Basis (1619) · ort-pose +330 / +1156 (578, Zahl der GTX 1050) ·
  takt-streu + wald-kosten rund +1724 / +4456 (2228, GRÜN).
- **z358 fährt seit 02:03**, Kandidat dcc33615 (V18.546.242) mit `w27-boden-nah-2`. `w27-stadt-bild` e9ac6f9b fiel heraus: Konflikt in
  `scripts/werkbank.cjs:653` (main trägt dort w25-stadt-takt-3). **stadt-bild ist zurückgezogen**, sein Inhalt (die Gründung wartet auf
  den Akt statt auf den Deckel) lebt in `w27-ort-pose` der GTX 1050 auf dem neuen main; die Anker der Spec bleiben wie an main.
- **z359** startet das Werkzeug `/tmp/claude/w4/z359-buendel.sh` (Aufgabe b776fsy8d) nach z358: `w27-k7-l2-rand` und, wenn seine
  GPU-Probe am Kopf GRÜN ist, `w27-studio-mesh` da9919e3 (Wand des Bündels −88 / +1334, GRÜN). Danach pusht `pm-nach-main.sh` die
  Probe-Seite `w27-studio-mesh-pm` nur auf SELBSTTEST GRÜN.
- **z360 (noch nicht eingestellt):** Champion (opus) baut `w27-wald-kosten-heim` = main + takt-streu + heim3-wald-kosten als Merge (beide
  Köpfe bleiben Vorfahren), Worktree `/tmp/claude/w4/wald-heim`, meldet „ZUG JA/NEIN“. Dazu `w27-ort-pose`, sobald der Patch der
  GTX 1050 da ist (sie kann nicht pushen: `git format-patch -1 | gzip -9 | base64 -w0`, dazu Basis, Tree-ID, sha256; ich pushe nur bei
  gleicher Tree-ID), und `w27-fenster-wand`, wenn dessen Champion „ZUG JA“ meldet. Vor dem Einstellen `wand-summe.sh` über das Bündel,
  dann `zug-schlange6.sh z359w "z360:<zweige>"`.
- **Stillstand-Alarm 02:14 an der GTX 1050 war ein Melde-Loch, kein Stillstand:** das Gerät arbeitete, seine Zeilen lagen als Nachricht
  bei mir. Ich trage sie bei jeder Nachricht sofort in `zug/erledigt.txt` ein (02:03, 02:11, 02:19 stehen).
- **OMEN:** Bisektion der GPU-ms-Stufe läuft mit Lebenszeichen; erste Linie Täter = Merge b5012e8b (w20-fern-hang), im Zweig bei
  [11/23] 0ab95ff4 = gut (wiese-ego 23,0 ms). Schließende Zeile `gpu-stufe` steht aus.
- `zug/brief-gemein.md` nennt jetzt die Wachstums-Wand statt der Decke.

## Stand 02:41 (10.11.) — Fable 96 %, die Züge fahren ohne LLM weiter

- **Budget:** Weekly · Fable **96 %** um 02:38 (alle Modelle 66 %, Reset 14.11. 21:00 UTC). Notbremse bei 98 %.
- **Die Zug-Kette ohne LLM:** z358 fährt (boden-nah-2 + stadt-bild, Vorzug GRÜN 02:09). z359 = `z359-buendel.sh` (K7-Linse; studio-mesh
  nur mit grüner Probe, sie ist ROT → die Linse fährt allein). **z360–z365 = `zug/werkzeug-w3/zug-nie-leer.sh z359 360 365`** (läuft seit
  02:38, genau EINE Instanz, Log `/tmp/claude/w4/zug-nie-leer.log`, Wartende mit Grund in `zug-nie-leer.wartet`). Es sammelt nach jedem
  Zug-Urteil die Abgaben auf **w27-*** (nie `-pm`, nie w26: die alten fuhren schon), deren Kopf noch in keinem Zug stand
  (`/tmp/claude/w4/zug-gefahren.txt`), mit Code-Check GRÜN, mit GPU-Probe GRÜN, sobald der Zweig das Spiel berührt, konfliktfrei und mit
  Wand-Summe GRÜN (`wand-summe.sh`), höchstens 4 je Zug. Ein gefahrener Kopf fährt erst mit neuem Kopf wieder. **Starte nie eine zweite
  Schlange daneben** (`ps -ef | grep zug-nie-leer`). Der Blick 02:38: z360 würde `w27-lod-baum` e15fbe92 fahren.
- **ROT an der Probe, beide warten auf einen neuen Kopf ihrer Cloud-Sitzung:**
  `w27-studio-mesh` da9919e3: `gate:studio-huelle` ROT (H8 GPU-ms Leiste ↔ Messung an koerperstudio, tetrapoda, terrain; H7 p95 Neubau
  1521 ms > 1000 ms). Gemessen unter fremder Last der Radeon; Linse oder Spiel ist NICHT entschieden, der Vergleich an main fehlt. Post
  liegt in `cloud-post/w27-studio-mesh.md`.
  `w27-ferne-ton-5` 80bcd308: `gate:luft-tiefe:echt` ROT nach 85 s (K2-1 Restkontrast 0,02149 > 0,02 bei 35,6 km · K1-2 FARBTON 166,33° von
  der Luft bei 8 km · K1-2 JE KANAL Uhr 0,27 ungemessen, 0–1 Paare < 30 · K1-2 HIMMEL nicht blau). Kein Post von mir, der Probe-Bericht
  liegt in `probe-post/w27-ferne-ton-5/80bcd308.md`.
- **w27-ort-pose (GTX 1050, kann nicht pushen):** Dreier GRÜN am Baum 870532b4 auf 20a01782 (dorf, stadt, welt-boot; stadt-voll OFFEN).
  Der Patch kommt als 3 Nachrichten (gzip + base64, sha256 des Patches 351a79a0f4ae2c8a94f0d1a9492132a451b07dbe1e68f3a4a16be018b5e1c8e2).
  Weg: die Teile aus dem Transkript dieser Sitzung schneiden (nicht abtippen), `base64 -d | gunzip`, sha256 prüfen, `git am` auf 20a01782,
  pushen NUR bei Tree-ID 870532b41e92504913e077f3de2a088afdb2d3ca. Danach sammelt `zug-nie-leer.sh` den Zweig von selbst, sobald
  Code-Check und Probe grün sind. Wand: Prüf +330 / Spiel +1156, erlaubt 578.
- **Champions (opus), beide noch ohne Bericht:** `w27-wald-kosten-heim` (takt-streu + heim3-w20-wald-kosten auf main, Worktree
  `/tmp/claude/w4/wald-heim`) und `w27-fenster-wand` (`/tmp/claude/w4/fenster-wand`). Mit Abgabe + grüner CI fahren sie von selbst.
- **Buchung:** steht bei 224/330 am fbbeb318. main ist 20a01782 (z356, Decke gefallen); `nach-landung2.sh` misst noch `--offen` am
  fbbeb318 (seit 01:25) und bucht danach den neuen Kopf. Meisterkarte Version 4 = 224.
