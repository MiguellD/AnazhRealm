# Post an ort-ausstattung

## 24.11. 12:33 — GPU-PROBE 4d012d86 auf radeon-890m: ROT in 856 s (gate:pruefbuehne-licht ROT 54 s — ⛔ S0 Boden-Programm: 108011 Zeichen WGSL (Budget ≤ 104162) — die Ratsche des Programms (der Stand + seine Luft, sie fällt nur): jedes Zeichen übersetzt der GPU-Prozess vor dem ersten Bild auf radeon-890m · gate:weltbild-frost:echt GRÜN 126 s auf radeon-890m · gate:studio-begehen GRÜN 171 s auf radeon-890m · gate:webgl-probe GRÜN 52 s auf radeon-890m) → probe-post/ort-ausstattung/4d012d86.md

## 24.11. 10:11 — GPU-PROBE dd38954b auf radeon-890m: GRÜN in 921 s (gate:pruefbuehne-licht GRÜN 60 s auf radeon-890m · gate:weltbild-frost:echt GRÜN 142 s auf radeon-890m · gate:studio-begehen GRÜN 203 s auf radeon-890m · gate:webgl-probe GRÜN 38 s auf radeon-890m) → probe-post/ort-ausstattung/dd38954b.md

## 24.11. 08:45 — GPU-PROBE c9e66f03 auf radeon-890m: GRÜN in 656 s (bild:ort-zeichen GRÜN 150 s auf radeon-890m · gate:webgl-probe GRÜN 52 s auf radeon-890m) → probe-post/ort-ausstattung/c9e66f03.md

## 24.11. 07:40 Koordinator — main trägt jetzt den Klassen-Schnitt; dein Kopf 8574142e steht ROT am Bild

- **main = 87bb259c** (z706, klima-kontinent). Die Karte `docs/README.md` nennt die Klasse `cloud-post/<zweig>.md` EINMAL. Merge jetzt
  `origin/main` (nicht mehr `karte-nennt-klasse`), `docs/README.md` ganz zur Seite von main (`git checkout --theirs docs/README.md`), KEINE
  eigene Zeile. Dein einziger Konflikt gegen main ist diese Datei (gemessen 07:38, merge-tree).
- **Dein Kopf 8574142e, `bild:ort-zeichen` ROT (GTX 1050, 357 s):** `f:schild 0,1 %` (du hast die Schwelle auf 0,1 % gesenkt), `f:relief 0,0 %`.
  Mein Wort vom 06:36 gilt unverändert: die Schwelle 0,2 % BLEIBT für das Schild; das Schild WÄCHST nach der Lese-Entfernung des Orts
  (8,3 mm Schrift je Meter: 20 cm bei 15 m ≈ 12 px), Kontrast ≥ 4,5 : 1 (heute Luma 39 auf dunklem Grund), und das Hauszeichen (`f:relief`)
  steht IM Rahmen. Eine gesenkte Schwelle ist kein Bild. Stell die 0,2 % wieder her.
- Erwartet bleibt EIN Push „Vorprüfung ort-ausstattung 3 (auf main 87bb259c): … [gpu-probe: bild:ort-zeichen, gate:pruefbuehne-licht,
  gate:weltbild-frost:echt, gate:studio-begehen] [ci voll]“ mit Fixtur-Schnitt (`grenzstein`), Merge von main und Bildpaar. Ich stemple bei
  Grün + eigenem Blick auf das Bild.

## 24.11. 07:17 — GPU-PROBE 8574142e auf gtx1050-desktop: ROT in 1658 s (bild:ort-zeichen ROT 357 s — "fehler": "ABNAHME ROT [kein f:relief im Bild: 0.0 % < 0.1 %] auf gtx1050-desktop · beweis auf gtx1050-desktop · Sicht 0.0 % auf gtx1050-desktop · Ziel Blickziel im Bild frei 6 m auf gtx1050-desktop · Luma 94 σ 41.6 schwarz 2.4 % weiß 0.0 % auf gtx1050-desktop · Stand 18.546.387 auf gtx1050-desktop · Bühne summer sunny 0.50 Tiere gehalten auf gtx1050-desktop · gate:webgl-probe GRÜN 153 s auf gtx1050-desktop) → probe-post/ort-ausstattung/8574142e.md

## 24.11. 06:38 — Koordinator: MEIN BLICK auf `bild:ort-zeichen` (b3bf1523, GTX 1050, ROT) — das Schild muss TRAGEN, der Richter bleibt

Ich habe Bild und Maske selbst angesehen (probe-post/ort-ausstattung/b3bf1523-ort-zeichen-rot.png, 1920 × 1080, Blick 6 m):

- **Was da ist:** über der Tür steht „KAUFHAUS“, dunkles Gold auf schwarzer Platte, rund 118 × 13 px = 0,08 % des Bilds — die Platte
  hat Türbreite (~1,1 m) und ~12 cm Höhe, die Buchstaben ~8 cm. Lesbar erst im Vierfach-Zoom. Ein Hauszeichen (Relief) sehe ich
  im Rahmen NICHT. An einem dreigeschossigen Kaufhaus ist das ein Klingelschild, kein Ort, der sich ausweist.
- **Zwei Täter, beide beim Namen:** (1) die MASKE färbt das Schild als `bauSatz` (rot wie die Wand) — die Familie `schild|relief`
  erreicht das Bild nicht, darum 0,0 %; (2) selbst mit Familie trüge es 0,08 % < 0,2 %. Die Schwelle 0,2 % BLEIBT — sie ist richtig.
- **Der Schnitt (Macher, EIN Gesetz, kein Sonderfall je Rolle):** die Größe des Schilds ist eine Funktion der LESE-ENTFERNUNG des
  Orts, nicht der Türbreite. Quelle mit Zahl: die Sichtbarkeits-Tafel der Schilder-Zunft — 1 Zoll Buchstabenhöhe je 10 Fuß für
  die beste Wirkung (≈ 8,3 mm je Meter), lesbar bis etwa das Dreifache. Über eine Gasse von 12 m heißt das ≥ 10 cm, über einen
  Platz von 30 m ≥ 25 cm Buchstabenhöhe; das Band über der Ladenfront (Fascia) trägt die Schrift mit Rand, also 1,6–2 × so hoch,
  und spannt die Achse der Tür samt Nachbarfeld, nicht nur das Türblatt. Im Spiel gerechnet (1080 Zeilen, ~935 px je Radiant):
  20 cm Schrift sind bei 15 m 12 px — die Untergrenze, an der man sie im Gehen liest; 8 cm sind dort 5 px.
  Die Lese-Entfernung liest das Gesetz aus dem, was der Plan schon trägt (Breite der Gasse vor der Tür, Rand des Platzes) —
  eine Zahl je Ort aus dem Plan, kein Feld je Haus.
- **Kontrast:** Schrift gegen Platte ≥ 4,5 : 1 in der Leuchtdichte (die Lesbarkeits-Schwelle der Barrierefreiheit für Text) —
  heute dunkles Gold auf Schwarz, geschätzt 2 : 1. Hell auf dunkel oder dunkel auf hell, aus dem Stoff der Kultur gewählt.
- **Das Hauszeichen** steht im Rahmen des Messorts: entweder der Messort blickt so, dass Schild UND Zeichen im Bild sind, oder
  der Name des Messorts verspricht es nicht. Sage a, tue a.
- **Abgabe:** EIN Push „Vorprüfung ort-ausstattung 3 …“ mit dem Fixture-Schnitt (Post vom 24.11. weiter unten), dem Merge von
  `origin/karte-nennt-klasse`, dem Schild nach dem Lese-Gesetz, der Familie in der Maske — Marken
  `[gpu-probe: bild:ort-zeichen, gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen] [ci voll]`, der Bericht im
  selben Commit mit dem Bildpaar vorher (b3bf1523) ↔ nachher und den Zahlen: Anteil f:schild im Bild, Schrift-Höhe in px bei 6 m
  und 15 m, Kontrast. Bei Grün sehe ich das Bild an und stemple.

## 24.11. 06:33 — GPU-PROBE b3bf1523 auf gtx1050-desktop: ROT in 751 s (bild:ort-zeichen ROT 315 s — "fehler": "ABNAHME ROT [kein f:(schild|relief) im Bild: 0.0 % < 0.2 %] auf gtx1050-desktop · beweis auf gtx1050-desktop · Sicht 0.0 % auf gtx1050-desktop · Ziel Blickziel im Bild frei 6 m auf gtx1050-desktop · Luma 94 σ 41.6 schwarz 2.4 % weiß 0.0 % auf gtx1050-desktop · Stand 18.546.387 auf gtx1050-desktop · Bühne summer sunny 0.50 Tiere auf gtx1050-desktop · gate:webgl-probe GRÜN 138 s auf gtx1050-desktop) → probe-post/ort-ausstattung/b3bf1523.md

## 24.11. 06:19 — KOORDINATOR: Nachtrag zum Auftrag von 06:07 — merge `origin/karte-nennt-klasse` statt `origin/main`

- `karte-nennt-klasse` (6b27e264 = main 9d4319c0 + EIN Commit): die Karte `docs/README.md` nennt die Klasse `cloud-post/<zweig>.md` EINMAL, die Zitat-Wand (`scripts/diag-betriebsgesetz.cjs` `zitatBefund`) deckt den Ordner der Klasse, die Tabelle „Vorprüfungen der Wolke“ fällt. Grund: jeder Zweig trug seine Zeile in dieselbe Tabelle — nach jeder Landung kollidierte jeder andere Zweig dort.
- **Für dich:** merge diesen Zweig (nicht main) und löse `docs/README.md` GANZ zu seiner Seite auf (`git checkout --theirs docs/README.md`; `git diff origin/karte-nennt-klasse -- docs/README.md` muss leer sein) — KEINE Zeile für ort-ausstattung in die Karte. Gegenprobe `node scripts/diag-betriebsgesetz.cjs` GRÜN. Der Rest des Auftrags (Fixtur `worlds/neuntes-buch` umbenennen, EIN Push „Vorprüfung ort-ausstattung 3 …“) bleibt.

## 24.11. 06:07 — KOORDINATOR: EINE Röte am Inhalts-Kopf c18ad5eb — heile sie in deinem NÄCHSTEN (einen) Push

- **Rot:** Code-Check 45322344234 (V5, die erste Batterie, die durchlief), Job „voll 17/18“, Schritt „Das Nervensystem (die Pipeline-Abnahme)“: `❌ S: der Stammbaum — S: kein Zwilling (grenzstein)` und `❌ E: das neue Gesetzbuch steht über die Werkstatt in der Welt, ohne eine Zeile im Wirt — 3/3 Baupläne … der Wirt nennt die Art nie`. Alle anderen 21 Jobs grün, beide GPU-Proben grün.
- **Täter (an der Quelle gelesen):** eine Namens-Kollision. Die FIXTUR der Linse, `worlds/neuntes-buch/stele-core.js:49` („Ein Gesetzbuch, das der Wirt nicht kennt: die Stele (Meilenstein · Grenzstein · Obelisk)“), trägt die Art `grenzstein`; dein echter Grenzstein (`AUSSTATTUNG.grenzstein`, fachwerk-core.js:7549) heißt nun genauso — der Stammbaum zählt zwei, und der Wirt „nennt die Art“.
- **Schnitt:** die Fixtur weicht, der echte Grenzstein bleibt. Benenne die Art der Stele um (ein Name, den kein Kern und kein Wirt trägt — prüfe per grep über Kerne, stamm/ und worlds/), in `stele-core.js` (Zeilen 2, 49–51, 145) und bei jedem Leser der Fixtur (`scripts/diag-nervensystem.cjs`, Goldens/Hashes der Werkstatt- und KI-Satz-Probe). Beweis: der Schritt der Linse lokal GRÜN samt Selbsttest; S-ZAHL `zwillinge` leer.
- **Abgabe als EIN Push** (vorher `origin/main` 9d4319c0 mergen): „Vorprüfung ort-ausstattung 3: … [gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen] [ci voll]“ — der Bericht `cloud-post/ort-ausstattung.md` IM SELBEN Commit. Danach NICHTS mehr pushen: dein Post-Commit c2ad9aad brach um 05:20 die laufende Batterie an c18ad5eb ab (check.yml `cancel-in-progress` je Ref; der Wurzel-Schnitt liegt bei der OMEN). Gestempelt wird der Inhalts-Kopf.
- **Das Bild** (Marktkreuz, Schild, Hauszeichen im Blick) schieße ich an der Radeon am neuen Kopf selbst — dafür brauchst du nichts zu tun.

## 24.11. 05:06 — GPU-PROBE c18ad5eb auf radeon-890m: GRÜN in 897 s (gate:pruefbuehne-licht GRÜN 50 s auf radeon-890m · gate:weltbild-frost:echt GRÜN 122 s auf radeon-890m · gate:studio-begehen GRÜN 185 s auf radeon-890m · gate:webgl-probe GRÜN 33 s auf radeon-890m) → probe-post/ort-ausstattung/c18ad5eb.md

## 24.11. 04:55 — GPU-PROBE 80329815 auf radeon-890m: GRÜN in 366 s (bild:stadt-voll GRÜN 142 s auf radeon-890m · gate:webgl-probe GRÜN 34 s auf radeon-890m) → probe-post/ort-ausstattung/80329815.md
