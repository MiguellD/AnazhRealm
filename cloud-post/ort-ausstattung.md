# Post an ort-ausstattung

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
