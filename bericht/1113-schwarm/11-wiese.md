# 11 Wiese und Gras in allen Stufen — aus Auge, Hang, Hügel, Dach

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
BILD = C:/Users/micha/AppData/Local/Temp/claude/fa3ae9100e9cef81/d8d2df10-ebf6-4cbd-9974-a3e064fbe5d4/scratchpad/wiese-mitte/
- Augenhöhe heute `heute-wiese-fov20-rot.png`: bis ~8 m echte Halme; 10–30 m eine Wand aus gleich hohen, gezackten Karten-Reihen
  (Sägezahn-Kanten, flach, ohne Tiefe) — die Schale.
- Augenhöhe Kandidat `kand4-wiese-fov20-rot.png`: bis ~8 m Halme; 10–30 m liegen breite, flache, gefaltete Platten auf dem Boden
  wie Papier-Terrassen, hell/dunkel gebändert. Die Zacken sind weg, an ihrer Stelle Platten. `kand4-wiese.png` (Third): Nähe sehr
  gut (Ähren, Tiefe), ab ~12 m dieselben liegenden Platten als Saum vor dem Wald.
- Hügel 12 m heute `oben-heute-huegel.png`: mittlere Ferne als große flache Dreiecks-Zacken, sichtbar als Teppich aus Spitzen.
  Kandidat `oben-kand-huegel.png`: Zacken weg, dafür waagrechte Schraffur/Streifen im mittleren und oberen Drittel.
- Dach 25 m heute `oben-heute-dach.png` und Kandidat `oben-kand-dach.png`: rechte Bildhälfte in beiden lange gelbe Striche, alle
  gleich gerichtet, wie gekämmtes Stroh; der Kandidat kaum anders. Die Nah-Wiese in der Bildmitte liest in beiden als Rasen.
- Dorf-Hang (wo der Spieler ankommt) heute `oben-heute-dorf-rot.png`: riesige gelbgrüne Zacken-Bänder liegen quer über dem Felshang.
  Kandidat `oben-kand-dorf-rot.png`: einzelne Büschel, aber viele davon stehen MITTEN auf dem Fels, oben links flach geneigte
  gelbe Paddel (verbreiterte Halme).
Gemeinsamer Nenner in allen fünf Blicken: was bricht, ist nie die Nähe (echtes L1), sondern jede Stelle, an der die Ferne die
GESTALT verformt — Karte (Zacken), gespreizte Füße (Striche von oben), verbreiterter geneigter Halm (Platten, Paddel).

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
SPIEL = .claude/worktrees/leib-kanon-urteil (main ec281422)
- Drei Stufen liegen übereinander: Nah-Wiese L1 bis `radius` 10 m; Ferne = L2-Büschel 10–200 m (`NAH_WIESE.fern`, stamm/daten.js:557-582);
  Schale = Karten bis 80 m (daten.js:571-581, 13 Dreiecke, elf Zacken); dahinter Boden-Shading `WIESEN_GRUND` (daten.js:616-635).
- Das Gesetz der Ferne `_wieseFern` (stamm/vegetation-wiese.js:574-588) hat ZWEI Regler: Anzahl (`anteil`) UND Verformung
  (`streck` s = max(Q/10, (Q/14)³) bis `streckMax` 14, daten.js:563). Bei s = 14 trägt ein Büschel 7,4 m Radius (daten.js:502).
- Q = dist·(h/S)^⅓ (`_wieseFuss`, vegetation-wiese.js:623-629): die Augenhöhe h geht ein — vom Hügel/Dach ist Q bei gleichem
  Abstand größer, die Verformung größer. Darum bricht jede Eichung an einer anderen Höhe: kurs-A zählt 9 Landungen in 13 Tagen an
  derselben Stufe (KO bericht/1113-kurs-A-liegendes-werk.md:40-53).
- Der Stoff spreizt die Füße um `spreiz` und hält den Halm ≥ 1 Pixel (stamm/stoff-material.js:62-130, Zeile 85). Die Wahl der GPU
  rechnet dasselbe als WGSL, Art 6 Büschel, Art 7 Schale (stamm/bild-kosten.js:3853-3876; WIESE_WGSL vegetation-wiese.js:593-604).
- Widerspruch im Kommentar: vegetation-wiese.js:561 „der Halm hält nur den Pixel, nie um s breiter" gegen :569 „macht jeden Halm
  quer um s breiter". Der Stoff (stoff-material.js) hält heute den Pixel.
- Kandidat w28-wiese-fern 476a3ed9 (Rumpf gelesen): Schale fällt, dafür phyto-core `halmFerne` mit `breit` bis 2,5×
  (HALM_GESETZ.ferne) — die Spreizung bleibt, eine zweite Verformung kommt dazu. Kern KANN schon das Richtige: `deckung.voll/q`
  ist Beer-Lambert längs des flachen Strahls (Diff phyto-core.js, Kommentar „ferne").
- Gemessen im Commit-Rumpf 476a3ed9 (Radeon 890M, 1920×1080): Ego 37,5 → 45,3 ms (Paare +7,0/+2,3/+12,6), Third 27,0 → 26,8 ms;
  Dreiecke 365 797 → 351 275, Befehle 94 → 93; Zerlegung heute Ego nahWiese 5,63 · Büschel der Ferne 3,02 · Schale 0,57 ms.
  Der Gras-Stoff trägt alphaTest (kein früher Tiefentest): breitere Halme = mehr verworfene Fragmente.
- Die Station vegetation.K1#1 (PM stationen/g2.js:1848-1897): Grund = `bodenSatz`, Halm = `nahWiese:*|streuSatz` (g2.js:1856-1857),
  jeder feste Ring 2/5/10/20/40 m LAI ≥ 1,7 oder satt, Sprung ≤ 15 %, nahWiese ≤ 4 Befehle / 80 000 Dreiecke. Folge: der Boden
  darf an der Third/Ego-Pose die Deckung NICHT tragen — bis 40 m muss Geometrie decken. Von oben misst K1 nicht.

## Die EINE begrenzende Entscheidung
Ein Büschel wird nie verformt. Die Ferne hat genau EINEN Regler: die ANZAHL (Ordnung o < Anteil), nie die Gestalt.
Spreizung, Halm-Breite über dem Pixel und Karten fallen als eine Klasse. Der Anteil folgt der Lücke des Strahls (Beer-Lambert mit
μ = S/dist, beide rechnet `_wieseFuss` schon): flacher Blick braucht wenige echte Büschel, steiler Blick mehr, bis zur Kappe
„Büschel je Pixel ≤ heute". Jenseits der Kappe zeigt die Lücke die Narbe des Bodens (`WIESEN_GRUND`). Von oben ist das
richtig, denn von oben sieht man zwischen den Büscheln wirklich Grund. Eine Gestalt, ein Regler, alle Augenhöhen. Kein Kreis,
weil keine Verformung mehr an eine Höhe geeicht wird.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Stufen in EINER Welle: Auge Ego 1,7 m · Third 2,43 m · Dorf-Hang (zugewandt) · Hügel 12 m · Dach 25 m. Die vier Kameras stehen im
Rumpf von 476a3ed9, die fünfte ist `--ort dorf` von oben.
Schnitt auf dem Zweig w28-wiese-fern:
1. `_wieseFern` (vegetation-wiese.js:574-588): `streck`/`spreiz` fallen (s ≡ 1). `anteil` = Lücke des Strahls aus phyto-core
   `halmFerne` mit `breit.max` 1 und `deckung` über μ statt q. `streckMax` (daten.js:563) und `schale{}` (daten.js:571-581) fallen.
2. Leser, die mitfallen oder umgestellt werden:
   - Tafel und Schranke: `WIESE_FERN_TAFEL` vegetation-wiese.js:646-655 (die Spalte streck fällt) und `_wieseFernSchranke` :663-684.
   - Grenze der Streckung: `_wieseFernGrenzen` :870-915 fällt ganz (ohne Spreizung keine Grenze).
   - Die Grenze in der Instanz-Matrix: :1218 und :1336-1346.
   - Schale ganz: `_wieseSchale` :610-616 · `_wieseSchaleDaten` :1029 · `_wieseSchaleSenke` :1132-1200 · `_wieseSchaleHalm` :1383 ·
     Takt `karten` :462-464, :541, :764 · Senke :1513 · Konstante :3758.
   - WGSL: `WIESE_WGSL` :593-604 und `PASS_WAHL_WGSL` Art 6/7 (bild-kosten.js:3853-3876; die Kugel-Formel um `max(G.y,1)` fällt).
   - Stoff: `_halmFerne` (stoff-material.js:62-130): `sp1`/Spreizung und `G.breit` fallen, der Pixel-Halt bleibt.
   - Kommentare mit Schale/Streckung: stoff-instanz.js:201 · studio-gestalt.js:247 · studio-bruecke.js:3791 · foundry-core.js:262.
   - Linsen: im Diff von 476a3ed9 berührt sind diag-profiband P-Ferne, diag-pflanzen-nah, diag-altlasten, diag-studio-vertrag
     (am main nicht gelesen).
Kosten-Zeile (Radeon 890M, 1920×1080, Mess-Wiese, `gpu-bank 16 --runden 3`, Seiten im Wechsel): Ego ≤ 37,5 ms (heute) ·
Third ≤ 27,0 ms · Dreiecke ≤ 351 275 · Befehle ≤ 93. Die Kappe Büschel je Pixel bindet die Kosten an den Schirm, nie an die Weite.
Der Schnitt nimmt Overdraw weg: kein alphaTest-Halm wird mehr 2,5× breit, keine 27 820 Karten-Dreiecke.
Kriterien:
- vegetation.K1#1 (radeon, gtx), 0 Punkte, beide ungemessen (PM stand.json:4419-4441). Ist Naht 5 m −16,9 % gtx / −18,3 % radeon
  (KO 1113-kurs-B:124), Soll ≤ 15 %. Ringe LAI ≥ 1,7 oder satt, nahWiese ≤ 4/80k. Station g2.js:1926 (`wieseStation`).
- E Profi-Band (PFLICHT-OFFEN), Ego-Bildzeit: Ist am Kandidaten +7,3 ms, Soll ≤ heute.
Abgabe-Bedingung: Bildpaar an allen fünf Kameras, heute ↔ Schnitt, dazu die Ego-Paare.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- origin/w28-wiese-fern 476a3ed9 (WIP, Code a674ee31, 16 Dateien +359/−590): Schale gefallen, `halmFerne` im Kern, Goldens gras L2.
  Es fehlt: Spreizung und `breit` auf 1 (dieser Schnitt), die Ego-Kosten, main 36f9d45a einmischen (merge-tree laut Rumpf ohne
  Konflikt), der Schale-Kommentar in `_halmFerneAuge`.
- Die billigste Gegenprobe ist zugleich die Probe dieser Entscheidung: `breit.max` 1 und `spreiz` 1 am Kandidaten, Ego-Paar gegen
  heute plus die fünf Bilder. Fällt Ego auf ≤ 37,5 ms und verschwinden Platten und Striche, trägt die Entscheidung. Die Licht-
  Gegenprobe des Rumpfs (`_laubLichtStoff` am Klon) läuft im selben Paar als zweite Zeile.
- wiese-mitte 0bfb8da9 (KO 1113-kurs-A:18), WIP, „von oben Streifen". Dieselbe Stufe; geht in diesem Schnitt auf, kein eigener Weg.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Welcher Stand `kand4-*` ist (a674ee31 oder ein früherer): nicht geprüft. Der Rumpf sagt „Kandidat liest in jedem besser".
  Ich sehe an Augenhöhe Platten statt Zacken und vom Dach kaum Unterschied.
- Gerechnet, nicht gemessen: Anteil echter Büschel bei flachem Blick, damit Third 20–40 m satt bleibt. Grob: Lücke
  exp(−0,5·0,6·2,4·a/μ) bei μ ≈ 0,08 verlangt a ≈ 0,95 für 0,02 %. Das kann über 80k nahWiese-Dreiecke führen, dann reißt K1-Budget.
- Widerspruch Budget: K1 erlaubt nahWiese ≤ 80 000 Dreiecke (g2.js:1887), der Rumpf nennt Lf 90 266 (Kandidat) und 77 201 + 27 820
  (heute). Ob `budget` dieselbe Zählung ist: nicht gelesen.
- Büschel auf dem Fels am Dorf-Hang (oben-kand-dorf-rot.png) gegen die Maske `_wieseGrund` (daten.js:512-526): Ursache nicht gelesen.
- Nicht gelesen: `_nahWieseKachelDaten` (:1251-1370), `_nahWieseBestand`, die Linsen am main, phyto-core außerhalb des Diffs,
  FUND-REGISTER Z.193/224.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Wirkung 5 (jede Höhe, die Ankunft am Dorf-Hang, und Ego-Takt +7,3 ms zurück) · Aufwand M (die Gegenprobe S, der Rückbau der
Schalen-/Grenzen-Leser M) · Risiko: ohne Spreizung braucht Third 20–40 m fast volle Dichte echter Büschel. Hält die Kappe dort
nicht, wird K1 „satt" an Dreiecken bezahlt, und das zeigt erst das Ego/Third-Paar.
