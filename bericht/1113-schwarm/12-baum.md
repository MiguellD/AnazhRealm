# 12 Bäume: Krone, Laub, Stamm, Karten-Stufen, Wechsel der Stufen

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
Bilder: `BILD/ks/bild2/` (Radeon, Wiese, Mittag, Exemplar 12,5 m; Stand vor/nach w28-karte-stamm).
- `baum_buche-heute-vor-voll.png` ↔ `baum_buche-schnitt-vor-voll.png` ↔ `-schnitt-netz-voll.png`: im Spiel-Blick fast gleich.
  Die Kronen rechts im Mittelgrund (x 1500–1900) sind verwischte Farbflächen ohne Blatt-Büschel, wie Aquarell. Die Stämme
  sind dünne dunkle Striche, mehrere Bäume wirken wie Lutscher (Stab und Ball). Mit dem Netz (L0) stehen bei x ~350 und ~600
  Stämme, die die Karte nicht zeigt.
- `baum_fichte-welt.png` (Ausschnitt, Spalten Netz · Karte · Karte fern): in Spalte 3 ist die Krone eine glatte grüne Wäsche
  ohne Lücken und ohne Büschel, die Netz-Krone (Spalte 1) hat Himmel-Löcher und Lappen. Die Karte füllt die Löcher der Krone.
  Das zeigt sich IM INNEREN der Krone, nicht nur am Rand.
- `baum_fichte-frei.png`, `baum_buche-frei.png` (oben heute, unten Schnitt): heute eine Sprenkel-Wolke um die Krone und ein
  gepunkteter Stamm. Nach dem Schnitt ist der Umriss sauberer, aber die Krone ist kompakter als das Netz, dicht wie ein Laib.
  Rechts unten steht eine LÜCKE zwischen Kronen-Fuß und Stamm, und der Stamm ist eine gepunktete Linie.
- `baum_buche-fern44-frei.png`: bei 44 m ein Klecks mit Pixel-Rand. Der Stamm ist abgesetzt und schwebt, darüber steht ein Loch.
- Widerspruch im Bild: die Dateien `baum_fichte-*` zeigen einen breitkronigen Laubbaum, keinen Kegel. Exemplar oder Name
  stimmt nicht. Nicht geklärt.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
- Stand: `w28-karte-stamm` ist GELANDET (origin/main 7f778d44 „V18.546.276 nach w28-karte-stamm", Merge e32b931b). Die Wurzel SPIEL
  (ec281422) trägt den Schnitt noch NICHT. Zeilen unten: `git show origin/main:phyto-core.js`.
- Die Karte erfindet ihren Rand. Der Schlüssel `karteSaumSchluessel` (phyto-core.js:4393–4434) wählt über dem Kronen-Fuß nach dem
  VERWISCHTEN Band g (`karteSaumBand` :4314, ein 17×17-Binomialkern, `saumBand` 8). Dazu kommen Hub und Zellmuster
  (`karteSaumMuster` :4455, `saum` 1,8, `saumZelle` 2,5, `saumWeite` 3) und seit karte-stamm das Gestalt-Gewicht
  (`karteSaumEigen` :4346, `karteSaumGestalt` :4355, `saumGestalt` [0,15, 0,3]). Die Konstanten stehen in KARTEN_GESETZ
  phyto-core.js:4170–4188. Gewählt werden die M größten Schlüssel, M ist deckungstreu (:4307, `saumWahl` :4436).
- Unter dem Kronen-Fuß gilt der Stamm zeilenweise massentreu (:4407–4419, GPU `stammK` stoff-karte.js:2353). Das ist die einzige
  Stufe, die die Gestalt treu kopiert.
- Die GPU-Ablage rechnet dasselbe als Zwilling: stoff-karte.js:2192 `saumMuster` · :2230 `band` · :2251 `bandZug` ·
  :2283 `eigenK` · :2307 `gestaltW` · :2367 `saumK` · :2411 `grenzeK`. Der Wirt reicht die Werte über `_karteSaumVon` :1541,
  die Ablage liegt in `_karteAblage` :1822. Die Karten-Zelle ist 128×256 bei 8 Ansichten und den Hebungen −20/0/40/80
  (foundry-core.js:788).
- Was die Welt konsumiert, gemessen an ec281422 vor karte-stamm (`PM/.../messung/roh/ec281422-radeon/lod.K1_1.json.d/*.abnahme.json`,
  Wert ist die kante, Soll ≤ 0,22):
  - Tafel: alle Netze ≤ 0,22 (f:birke:L0 0,194 · L1 0,209 · f:fichte:L1 0,184 · f:tanne:L1 0,218). Die Karten: birke 0,200 ·
    buche 0,197 · eiche 0,177 · fichte 0,184 · tanne 0,178 · strauch **0,294**.
  - Spielgang: buche **0,2303** · strauch **0,271**, die übrigen Karten ≤ 0,208.
  - Die Tafel-Pose der Station selbst bricht: „Ziel tanne nicht gezeichnet" (ebd. Zeile „zahl").
- karte-stamm (a9b7a0d9, Rumpf, geschärfte Linse `rindeAus`) hebt die Kante in 4 von 6 Klassen (Tafel / Spielgang):
  fichte 0,165 → **0,222** · tanne 0,159 → 0,197 / 0,215 · eiche 0,141 → 0,187 · birke 0,174 → 0,204. Neu rot: buche frei
  0,0035 → **0,010** im Spielgang (Soll ≤ 0,007, 12 Inseln). lod.K4#1 fällt von 1,69 auf 1,52 %.
- Die Kosten von karte-stamm sind GPU-Zeit der Ablage je Karte: Buche 27,0 → 31,5 ms, Fichte 25,9 → 33,8 ms, die Züge
  steigen von 39 auf 69. Der Haupt-Faden bleibt bei 0,10 ms je Ablage (ebd.).
- Der Kreis: dieselbe Stufe hatte **10 Landungen in 13 Tagen**, zweimal wurde „≤ 0,22" gemeldet und danach rot gemessen
  (`KO/bericht/1113-kurs-A-liegendes-werk.md:69–70`).
- Der Zielkonflikt Fläche ↔ Rand in EINEM Schlüssel (`KO/FUND-REGISTER.md:201`): der eigene Schlüssel mit `saum` 3,6 bringt
  lod.K4 auf 1,05 %, aber buche auf 0,244. Der Befund (FUND:219): „der Rand der Baum-Karte ist ein Gesetz der KARTE … nicht der
  Gestalt; wo die Gestalt keinen Rand trägt (Buche 0,544 / 0,632) … muss der Rand in die Gestalt der Buche".
- Das Wechsel-Gesetz KANN Stufen nach ihrem Fehler legen (vegetation-streu.js:2969–2978). Der Baum trägt aber keine Zeile:
  `tree: je({})` (:2892), sein Wechsel steht am Haushalt (:2873). lod.K5 misst Baum 3,12 px gegen ein Soll von ≤ 1 px
  (`KO/bericht/1113-kurs-B-meisterkarte.md:140`). Den Wechsel hinauszuschieben sprengt das Dreiecks-Budget: 685k bis 1,25 Mio
  gegen das Soll von 680k (FUND:158).
- Der Stamm aus der Krone (`w28-stamm-krone` 31f4607c, nicht in main): Solitär-Eiche BHD 0,42 → 0,76 m, Krone/BHD
  41,9 → 23,3 bei gleichen 6 016 Dreiecken; gate:pflanzen-nah (H) wird von 5 Verletzungen grün. Er lag rot in z416 an
  `gate:kamera-leib` K4 „Gang haus_alemannisch, Bau 39,1 %" (kurs-A:15). Das Gate betrifft kein Baum-Ding. Derselbe Gate kippt
  laut ÜBERGABE §6 auf der GTX 1050 am baum-gleichen Kopf.

## Die EINE begrenzende Entscheidung
**Die Karte erfindet keinen Rand mehr, sie kopiert ihre Gestalt.** Jede Stufe wählt nach ihrer EIGENEN Box-Deckung c, ohne Band,
ohne Muster und ohne Gestalt-Gewicht. Wie viele Texel sie wählt, bleibt deckungstreu (M wie bisher). Der Stamm bleibt
zeilenweise massentreu. Wo eine Art danach über 0,22 liest, wird nicht an der Karte gestellt: der Rand wächst in die
Gestalt der Art (die Blatt-Anker am Kronen-Umriss, L0 und L1), und die Karte erbt ihn. Begründung: die Netze halten heute
jede ≤ 0,22. Die Karte ist die einzige Stufe, die Fläche gegen Rand tauscht, und 10 Landungen an ihr fanden keinen festen Punkt.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
**Stufen in EINER Welle:**
1. Gestalt L0/L1: Krone und Stamm. `w28-stamm-krone` 31f4607c auf main einmischen (Konflikt in phyto-core mit karte-stamm
   erwartet). Den Stamm folgen lassen. Dazu kommt der Rand der Buchen-Krone im Wuchs (`growSkeleton`, Blatt-Anker am Umriss).
2. Karte, alle Stufen 0–n: der Schlüssel über dem Fuß ist c (+1e-6·Lage). Diese Teile fallen in CPU und GPU zugleich:
   - CPU: `karteSaumBand`, `karteSaumMuster`, `saumHash`, `karteSaumEigen`, `karteSaumGestalt`, `saumSchritt` und die
     KARTEN_GESETZ-Zeilen saum, saumZelle, saumBand, saumMin, saumWeite, saumGestalt, saumEigen, saumTensor.
   - GPU: `band`, `bandZug`, `saumMuster`, `eigenK`, `gestaltW`.
   - Es bleiben `stammK`, `grenzeK` und der Fuß aus `karteSaumRinge` (phyto-core.js:4258).
3. Der Wechsel bleibt am Haushalt (tree: keine Zeile). Er wird in diesem Schnitt NICHT bewegt.

**Leser-Liste (vor dem Schnitt; Zeilen am Stand a9b7a0d9 bzw. main 7f778d44):**
- `phyto-core.js:4739 impostorMips`: die Stufe 0 mit Saum :4797–4820, Stufe k :4899–4900.
- `stamm/stoff-karte.js`: :1541 `_karteSaumVon` · :1822 `_karteAblage` · :568 `_impostorAtlasMaterial` · :623 `_impostorWurfLeaf` ·
  :689 `_kartenWurfWerfer` · :1135 `_kartePlatteFragen`. Der Gesetz-SHA ändert sich, also backt die Platte einmal neu.
- `stamm/siedlung-instanz.js:390 _lodSlotStamp` · `stamm/stoff-material.js:3251 _lodAuge`, :1186 Relief.
- `stamm/gelaende-fern.js:1675` liest die Karte nicht (eigene Textur „fern-krone-nah"). Nur prüfen.
- Linsen: `scripts/diag-streu-wahrheit.cjs:57/:109` · `scripts/diag-foundry-impostor.cjs:695` (C10 Ablage = Kern) ·
  `scripts/werkbank.cjs karteRinde` → `scripts/lib/abnahme-urteil.cjs rindeAus`.
- Goldens: `spec/asset-contract/v1/golden/*` (stamm-krone trägt 60 von 128 neu).

**Kosten-Zeile:** an den Schirm gebunden (je Karten-Ablage), nie an die Weltgröße.
- Die Erwartung ist, dass die Ablage unter heute fällt, weil Band, Tensor und die acht Gestalt-Gänge sterben. Heute sind es
  31,5 / 33,8 ms je Karte und 69 Züge. Ungemessen.
- Der Haupt-Faden bleibt bei ≤ 0,10 ms je Ablage. Die Ankunft backt einmal neu. Dreiecke wie heute, denn stamm-krone ist
  dreiecksgleich.

**Kriterien:**
- lod.K1#1 (radeon/gtx, 0/2, ungemessen): Ist im Spielgang buche 0,2303 / strauch 0,271 ↔ Soll kante ≤ 0,22 und frei ≤ 0,007
  je Teil-Klasse. Station: Spielgang. Die Tafel-Pose ist kaputt (tanne nicht gezeichnet).
- lod.K4#1 (radeon, 1 Punkt gehalten): Ist 1,66 % (ec281422) bzw. 1,52 % (karte-stamm) ↔ Soll < 2 %. Die Erwartung ist ~1,05 %
  (FUND:201, eigener Schlüssel).
- licht.K3#2: fichte/tanne „Karte und Gestalt teilen kein Pixel" ↔ alle 33 Werte im Band 0,9–1,1.
- lod.K5#1: Baum 3,12 px ↔ ≤ 1 px. Wird nicht bewegt und offen benannt.
- Pflicht A (laub-kante je Klasse). Das Bildpaar steht am Dorf des Prüfplatzes, feste Kamera auf Bäume in 30–60 m, Ego und
  Third.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w28-karte-stamm` 9597ffb2 liegt in main 7f778d44. Der Stamm ist in der Karte, der Saum aus der Gestalt auch: die Basis des
  Schnitts.
- `w28-stamm-krone` 31f4607c steht 106 hinter. Es fehlt: main einmischen (phyto-core), Goldens neu, eine Probe am neuen Kopf.
  Der Gate aus z416 betrifft kein Baum-Ding und wird nur gegen main zugeordnet.
- `w28-laub-luma` 8f62f28f (TOT): sein Kandidat (1), der eigene Schlüssel, ist der nächste Verwandte dieser Entscheidung, mit
  Zahlen.
- Befund `w28-samen-karten-stufe` 5d6f899e `samen/karten-stufe/BEFUND.md` (nicht gelesen, nur FUND:219).

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- Nicht gemessen: die reine eigene Deckung ohne `saum` (laub-luma maß sie nur mit `saum` 3,6). Buche und Strauch reißen dabei
  wahrscheinlich. Dann trägt Stufe 1 (der Rand der Gestalt) die Last. Den Wuchs der Buchen-Krone (`growSkeleton`) habe ich
  nicht gelesen.
- Widerspruch: FUND:219 sagt „Buche trägt keinen Rand" (0,544/0,632 im Kartenmaß). Das Spiel misst fimp:buche 0,197 / 0,230
  (ec281422). Die beiden Maße sind verschieden und nicht verglichen.
- Das Innere der Krone („Aquarell", `baum_fichte-welt.png` Spalte 3) klärt der Rand-Schnitt nicht. Ob BC1 oder die
  Vergrößerung der Zelle 128×256 schuld ist (FUND:158: > 1,27 px je Texel), ist nicht gemessen.
- Atlas-Bytes je Schicht und die Zahl der Schichten nicht gelesen. Darum keine Aussage zu einer größeren Zelle (VRAM GTX
  99,6–111,2 von 118 MB).
- Der Name der Bilder `baum_fichte-*` stimmt nicht zum Bild. Strauch gehört nicht zu diesem Bereich, fällt aber als
  Teil-Klasse von lod.K1 mit.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- Wirkung 4: jeder Baum ab der Karten-Stufe am Dorf trägt Löcher und Büschel seiner Gestalt statt eines Laibs, der Kreis an
  dieser Stufe endet, und die Ablage wird billiger.
- Aufwand M: CPU und GPU löschen, Goldens neu, stamm-krone einmischen. Bei Buche ist es L, wenn ihr Rand in den Wuchs muss.
- Risiko: Buche und Strauch können am Spielgang über 0,22 steigen, bis der Rand in ihrer Gestalt steht. Das ist kein
  Rückweg zur erfundenen Kante, sondern die Stufe 1 derselben Welle.
