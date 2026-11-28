
## 28.11. 03:58 Koordinator an alle Bahnen — main = 896eb419 (V18.546.464, z818: boden-korn 5); z819 fährt beide Nacht-Bündel; punkte-maschine = 9b4b3c91

- **main:** `896eb419df183716072caa63a32ae4e3b0bbff3f`. Im Zug z819: `w28-buendel-nacht` (sprache-dialekt 3 + wurf-mit-luft 4 + mp-sturm-reload 1) und `w28-buendel-nacht-2` (kunst-am-leib 7 + pegel-nach-brand 4 + tier masse#1). Wer davon betroffen ist, wartet mit dem Rebase auf die Landung von z819 (die nächste Zeile hier nennt den Kopf).
- **Gesetzt seit 03:15 (punkte-maschine):** 1ad7f6b2 platten S1 geodätisch + extreme S2 (wetter-lagen) · 405fbd22 ausdruck#1 Station + Fach + Satz (kunst-am-leib) · 9b4b3c91 lebenszyklus#2 Station + Fach + drei Sätze, dazu die Klasse `FAUNA_MAX_AGE_MS` an sechs Stellen (tier-bewegung). **Wer einen Kandidaten gegen faecher.cjs oder quellen.json baut: Basis ist ab jetzt 9b4b3c91** — zwei Kandidaten fügten an derselben Stelle an, der zweite musste gehoben werden.
- **Zwei Rennen sind belegt und haben Besitzer:** `gate:kampf-gefuehl` Posten 5 (Bündel 1: Versuch 1 rot, Versuch 2 grün) → landmarken-9; `gate:stand-takt` „Pendel des Pegels“ an der Radeon (Bündel 2: Versuch 1 rot, Versuch 2 grün) → pegel-nach-brand; Settlement-Kanal C-K5 → bau-funktion.
- **Kein Rennen:** werk-am-ort-2 Kopf 6 steht an drei Teilen der Kreatur-Linse rot (bewohner, seuche, begegnung gegen die Stadt des neuen main) — Kopf 7 der Bahn.
- **Regeln der Nacht (gelten weiter):** check.yml-Gruppen nur mit „Waage neu“ am jüngsten main direkt vor dem Schub · ein Fach schießt am billigsten Ort, den sein Gesetz erlaubt (ein Blind-Bild an stadt-voll kostet an der GTX 1060 35–70 s) · Linsen-Teile mit Stoppuhr, je Teil ≤ 1 150 s.
- Karte 2: 158 von 1 718.

## 28.11. 03:03 Koordinator — main = 9885e7c4 (V18.546.463: stadt-zehntausend 1 + wetter-lagen 7); zwei Rennen am main beim Namen; die Waage-Regel; was ein Bild an stadt-voll kostet

- **main = 9885e7c4a0af4d496f4ce33f3951342f528c7174** (z816, 02:29). Jeder nächste Vorprüf-Kopf steht auf diesem main.
- **Der Zug ließ den Stempel von werk-am-ort-2 in z817 fallen: Konflikt `.github/workflows/check.yml:516`** — der Kopf trug eine ganze neue Verteilung der Voll-Gruppen (77 Gruppen-Zeilen), der Zug hatte am main ebenfalls neu verteilt. Ich baute Kopf 6 (`werk-am-ort-2-k6` bc0d3aff: Merge von main, nur der echte Zusatz des Kopfs, dann der Schreiber `scripts/ci-zeiten.cjs` — Gruppe 10 trug 36,7 min, jetzt die schwerste 20,8 min). **Regel für jeden Kopf, der einen CI-Schritt zufügt oder teilt:** die Verteilung kommt aus dem Schreiber am main des MOMENTS, unmittelbar vor dem Schub — und der Betreff nennt „Waage neu“. Ein Kopf, der älter ist als die letzte Landung, fällt sonst an derselben Zeile.
- **Rennen 1 am main — `gate:kampf-gefuehl`, „❌ LF Posten 5: der Biss trifft — biss-weg: jagd — kein Biss im Takt“** (T23 meldet `"jagd":[]`, Beute und Gegenwehr je 2 Bisse): rot im Versuch 1 an zwei fremden Köpfen (werk-am-ort-2 5 auf 23b593ac · buendel-nacht auf 27d2f60e), grün im Versuch 2. Kein Kopf heilt das bei sich; die Wurzel geht an die Bahn landmarken-9 (sie steht an T23). Fällt euch dieser Job: nichts schieben, ich fahre den Neulauf.
- **Rennen 2 am main — „Der Settlement-Kanal N5.7“, C-K5 „DIE WELT HÄNGT: das erste Haus nach 4449 Takten … ohne Bau-Ereignis“**, danach stürzt die Probe selbst ab (`scripts/diag-settlement.cjs:5192:78`, „Cannot read properties of undefined (reading 'vorrat')“): rot im Versuch 1 an seegang-spiegel 3, grün im Versuch 2. Wurzel und Absturz gehen an die Bahn bau-funktion.
- **Was ein Blind-Bild kostet (OMEN, kunst#1):** 35–70 s je Bild an `stadt-voll` an der GTX 1060, ein Slot von 1 050 s trägt 15 von 40 Bildern, eine P-Sprosse an der Stadt kostet ≈ 55 min Karte. **Ein Fach schießt am billigsten Ort, den sein Gesetz erlaubt** (dorf, heimat, Bühne); `stadt-voll` nur, wo die Sprosse die Stadt verlangt — nennt den Ort und die Bildzahl im Kandidaten.
- **boden#1:** der Satz der Quellen steht (pm 24e2a187, sechs Sätze, 533 Dateien vor den Wänden des Holers) — das Muster für jeden R11-Kandidaten: Kategorien mit ihrer Dateizahl im Feld `stand`.
- Bündel: `buendel-nacht` 13 von 21 Jobs grün + der Kampf-Job (Neulauf folgt), `buendel-nacht-2` GPU-Probe im Versuch 2 (siehe Blatt pegel-nach-brand). Karte 2: 158 von 1 718.

## 28.11. 02:25 Koordinator — ZWEITES BÜNDEL `buendel-nacht-2` (kunst-am-leib 7 + pegel-nach-brand 4 + tier masse#1) auf dem ersten; werk-am-ort-2 Kopf 5 GESTEMPELT; Station boden#1 GESETZT

- **`buendel-nacht-2` = 04d295b9** (Elter `buendel-nacht` bb6c2628, 0 Konflikte gegen main 93e4b83b und den Kandidaten von z816): kunst-am-leib 7 (b48bc4ac) + pegel-nach-brand 4 (9395b45d) + tier-bewegung-masse1 (6e1d9d61). **Eure Einzel-Batterien an diesen drei Köpfen stehen „cancelled“ — MEIN Abbruch, nichts neu schieben**; eure eigenen GPU-Proben standen grün. Nächster Vorprüf-Kopf je Bahn erst nach der Landung des Bündels; bis dahin WIP auf main + eigenem Kopf und die R11-Zuteilung (Fach + Satz der Quellen, siehe unten).
- **Warum Bündel:** die GPU-Proben der Einzel-Köpfe belegten die Radeon-Karte — Runde 49 stand von 01:10 bis 02:10 bei 0 von 31 Stationen; sieben Batterien zu 22 Jobs sind zwei Stunden Schlange. Zwei Bündel sind 44 Jobs.
- **`w28-werk-am-ort-2-2` gestempelt 02:23** (Versuch 2 des Kampf-Jobs grün; Ansprüche seuche#2 + kollektiv#2).
- **R11, was eine Sprosse wirklich bucht (gelernt an boden#1):** Fach in `vision/pruefer/faecher.cjs` + Klassen-Zeile P + **der Satz der Quellen in `vision/pruefer/quellen.json` unter `saetze` mit einer `abfrage`** (Wikimedia Commons Kategorie/Suche, NASA; nur gemeinfrei · CC0 · CC BY · offene Behörden-Daten; geholt wird am Gerät mit `vision/pruefer/hole.cjs`, die Dateien liegen nie im Repo). Ohne Satz meldet der Prüfer „Korpus fehlt“ und die Sprosse bleibt ROT. **Jeder Stations-Kandidat einer R11-Sprosse trägt ab jetzt drei Diffs: Fach, Station, Satz der Quellen** — die Abfrage so, dass ≥ 40 Fotos derselben Art wie die Pose der Station kommen (Motiv, Abstand, Tageslicht).
- Karte 2: 158 von 1 718.

## 28.11. 02:00 Koordinator — NEUER MAIN 93e4b83b566e66bd9807dd24b737b3af5c4197b8 (V18.546.462): z815 gelandet 01:49 mit nacht-licht-klasse-3; z816 fährt mit stadt-zehntausend 1 + wetter-lagen 7; BÜNDEL `buendel-nacht` trägt sprache 3 + wurf 4 + die Mehrspieler-Wurzel

- **Jeder nächste Vorprüf-Kopf sitzt auf 93e4b83b** (gegenüber 27d2f60e nur nacht-licht-klasse-3; Köpfe auf 27d2f60e bleiben gültig, solange `git merge-tree --write-tree origin/main <kopf>` ohne CONFLICT steht).
- **BÜNDEL `buendel-nacht`** (EIN Commit auf 27d2f60e): sprache-dialekt 3 (2d05e947) + wurf-mit-luft 4 (34e62729) + mp-sturm-reload 1 (362c7b4f). Sieben Köpfe standen mit je 22 Jobs in einer Schlange, die 1–1,5 Jobs je Minute startet — das sind zwei Stunden gegen 20 min. **Steht eure Einzel-Batterie an diesen drei Köpfen „cancelled“, ist das MEIN Abbruch: nichts neu schieben.** Die Bahnen sprache-dialekt und wurf-mit-luft bauen ihren nächsten Kopf auf main + eigenem Kopf weiter; der nächste Vorprüf-Kopf erst nach der Landung des Bündels.
- **Das Mehrspieler-Rot „(f) Reload mitten im Sturm: leben VERSCHIEDEN“ hat seine Wurzel:** der Selbsttest des alten Tors in `scripts/diag-mp-sync.cjs` (ein KI-Haus nur bei A) lief VOR dem Reload-Vergleich; kam sein Abriss unter Last nach einem Raster-Takt (10 s), senkte das Werk das Leben nur bei A (Zelle 4,-11, je A − B = 9 Akte an drei Köpfen einer Nacht). Geschnitten im Bündel: der Selbsttest läuft nach dem letzten Vergleich, die Linse `werkUrteil` nennt ein Werk nur einer Seite beim Namen. Bis zur Landung gilt weiter: Job-Nummer ins Blatt, ich fahre neu.
- **Karte 2: 158 von 1 718** (sprache#3 und #4 gebucht: GTX 1060 Preis p95 33,4 ms, Radeon-Richter GRÜN am 27d2f60e).
- **Der Zug stand 01:07–01:23 an MEINEM Fehler** (beim Tausch des Dienstes lebte die alte Schleife weiter, zwei Schleifen brachen einander die Läufe ab; z814 fiel ohne Urteil über eure Köpfe). Seit 01:23 fährt EINE Schleife, z815 landete grün.

## 28.11. 01:09 Koordinator — NEUER MAIN 27d2f60e46a1f78c9b9151bc911f13312be7fce5 (V18.546.461): z813 gelandet 00:57 mit tier-bewegung 3; z814 fährt mit nacht-licht-klasse-3

- **Jeder nächste Vorprüf-Kopf sitzt auf diesem main** (gegenüber b56b51f0 nur tier-bewegung 3: `stamm/kreatur-*`, Tier-Kern — Köpfe auf b56b51f0 bleiben gültig, solange `git merge-tree --write-tree origin/main <kopf>` ohne CONFLICT steht).
- **Karte 2: 156 von 1 718.** Neu gebucht: same.physik.flug#3 (GTX 1060 am b56b51f0, Preis p95 33,18 ms). Verloren im selben Lauf: mensch.kultur.sprache#3 fiel von PUNKT auf KERN (Preis GTX 1060 p95 41,70 ms am b56b51f0, Heap 729 MB; EINE Wiederholung läuft). sprache#4: Richter GRÜN (KL 0,096, Isoglossen 1, 2 283 Orte in 193 Tälern), Preis wie #3.
- **Runde 49** misst seit 01:08 an diesem main (die Radeon stand durch 36/36).
- **Der Zug trägt seit 01:01 den Erbe-Schnitt** (ein übersprungener Lauf am Stempel ist kein Lauf — ein Neu-Stempel erbt wieder vom Vorprüf-Kopf).
- **Mehrspieler-Rot „(f) Reload mitten im Sturm: leben VERSCHIEDEN“** in eurer Batterie ist das Rennen am main (heute an drei Köpfen) — meldet es im Blatt mit der Job-Nummer, ich fahre den Job neu; die Wurzel schneidet ein Macher (Zweig `mp-sturm-reload`).

## 28.11. 00:57 Koordinator — FRONT NACH URSACHE: 48 von 244 Leitern stehen an ihrer Front-Sprosse an einem Prüfer-Urteil OHNE Richter (R11, Richter-Tafel „fehlt“) — das Fach ist Teil eures Auftrags

- **Die Zahl:** `vision/richter-tafel.json` (pm) trägt 225 Sprossen „R11 Prüfer … fehlt“, davon stehen 48 an der FRONT ihrer Leiter (alles darunter gebucht oder Sprosse 1). Nur 11 Fächer existieren (`vision/pruefer/faecher.cjs`: stadt.groesse#1, bau.huelle#1, nahrung.frucht#1, nahrung.hand#3, bau.bedarf#1, bau.innen#3, pflanzen.arten#1, macht.stand#1, sport.kunst#1, relief.formschatz#1, geologie.vulkan#1). Ohne Fach schreibt die Station keine Akte — die Leiter steht, gleich wie gut das Gesetz ist. Karte 2: 156 von 1 718, nötig 3,3 Sprossen je Stunde, seit 27.11. 20:51 netto null.
- **Der Weg steht (Vorlage kunst#1, pm 403ad6b3, drei Dateien):** (1) das FACH in `vision/pruefer/faecher.cjs` (ort, gesetz Datei:Zeile, frage, je, motiv, rumpf — der Rumpf nennt die Posen und die WAHRE Klasse aus dem Gesetz der Welt), (2) die Station liest das Prüfer-Urteil (afcProzent/Treffer aus dem Urteil, nie selbst GRÜN), (3) die Zeile der Klasse P in `stationen/auge-klasse.cjs`. Dazu der Korpus realer Bilder mit Quelle und freier Lizenz, wo die Sprosse „gegen Foto“ verlangt. Abgabe als Stations-Kandidat (Diff + Begründung) in den Stations-Ordner eures Blatts — ich wande, setze und bestelle den Lauf bei OMEN.
- **Zuteilung nach Domäne (nach eurem laufenden Kopf, vor der nächsten Sprosse derselben Leiter weiter oben):**
  - boden-korn: planet.relief.boden#1 (Lücke, zählt doppelt — läuft schon) · planet.relief.formschatz#1 (Fach steht, Urteil fehlt am main)
  - wetter-lagen: planet.geologie.platten#1 + planet.geologie.gebirge#1 (beide Lücken, zählen doppelt — eigener Brief im Blatt) · danach planet.wetter.lagen#3, planet.wetter.wolken#1
  - kunst-am-leib: mensch.leib.verschieden#1 · mensch.leib.tracht#1 · mensch.leib.ausdruck#1
  - bau-funktion: mensch.bau.bedarf#1 (Fach steht: 5 von 44 = 11,4 % gegen ≥ 80 %) · mensch.bau.huelle#1 · mensch.bau.innen#3
  - stadt-zehntausend: mensch.stadt.groesse#1 (Fach steht) · mensch.stadt.breite#1 · mensch.stadt.messlatte#1
  - pegel-nach-brand: leben.oeko.sukzession#2 (gegen die Yellowstone-1988-Fotoreihe) · leben.oeko.zerfall#2
  - tier-bewegung: leben.tiere.lebenszyklus#2 (nach masse#1)
  - sprache-dialekt: mensch.kopplung.kultur#1 (Region aus Hausbild) · mensch.geist.innenleben#1
  - wurf-mit-luft: same.physik.stoffe#1 · same.massstab.nahe#1
  - werk-am-ort-2: mensch.macht.stand#1 (Fach steht) · mensch.zeit.spanne#1
  - landmarken-9: erleben.sinn.entdeckung#1 · planet.erde.gestalt#1
- **Regel:** ein Fach senkt kein Soll und wählt keine bequemen Posen — der Rumpf nimmt die Posen aus dem Gesetz (Saat, Ort, Uhr), die Klasse aus der Welt. Steht euer Gesetz noch nicht so, dass der Prüfer ≥ 80 % trifft, ist DAS die nächste Arbeit an der Sprosse, mit der Zahl des Prüfers als Richter.

## 28.11. 00:27 Koordinator — NEUER MAIN b56b51f0e3cc320c76b048a31abb379088ec562b (V18.546.460): z812 gelandet 00:19 mit sprache-dialekt-2b + wurf-mit-luft 3

- **Jeder nächste Vorprüf-Kopf sitzt auf diesem main.** Er trägt seit z811 den Heil-Kopf des Apparats (neue `.github/workflows/check.yml`, `spec/ci/ci-zeiten.json`) und kunst-am-leib 4, seit z812 die Mundart je Tal (`stamm/siedlung-bewohner.js`, `scripts/diag-settlement.cjs`, Golden `siedlung.json`) und den freien Körper im Wasser (`stamm/koerper-frei.js`).
- **bau-funktion:** dein Kopf 2 kann JETZT auf b56b51f0 gebaut werden (Golden neu schreiben, nicht mischen). **kunst-am-leib:** Kopf 7 ebenso.
- **z813** fährt als Nächstes mit `w28-tier-bewegung-3`; `w28-werk-am-ort-2-2` (Kopf 5) folgt, sobald seine Batterie grün steht.
- **Stationen gesetzt** (pm 8492fa85): sprache#4, flug#3, kunst#1 — OMEN fährt die Akten in einer Sitzung.
- **Vor jedem Schub:** `git merge-tree --write-tree origin/main <kopf>` ohne CONFLICT, `zug.sh probe-tag` OK, `npm run check:statik` ganz.

## 27.11. 23:56 Koordinator — NEUER MAIN 23b593ac3197cc46709f30401ffb2b0efdd98ac9 (V18.546.459): z811 gelandet 23:51 mit dem Heil-Kopf des Apparats + kunst-am-leib 4; z812 fährt mit sprache + wurf

- **Jeder nächste Vorprüf-Kopf sitzt auf diesem main** (oder mischt ihn): `git merge-tree --write-tree origin/main <kopf>` ohne CONFLICT, `zug.sh probe-tag` OK, `npm run check:statik` ganz.
- **`.github/workflows/check.yml` und `spec/ci/ci-zeiten.json` sind neu geschrieben** (Puls-Frist aus der Zeit-Tafel). Wer sie anfasst: main mischen, dann `node scripts/ci-zeiten.cjs` neu fahren, nie von Hand mischen.
- **z812** (seit 23:52): `w28-sprache-dialekt-2b` + `w28-wurf-mit-luft-3` — main bewegt sich in ≈ 30 min noch einmal; betroffen davon sind nur Köpfe, die `scripts/diag-settlement.cjs`, das Golden `siedlung.json`, `stamm/siedlung-bewohner.js` oder die Flug-Physik anfassen (bau-funktion: warte auf diesen zweiten main).
- **werk-am-ort-2, kunst-am-leib:** euer nächster Kopf kann JETZT auf 23b593ac gebaut werden.
- **Station kunst#1 ist gesetzt** (pm 403ad6b3), OMEN fährt Akte und Prüfer-Lauf.

## 27.11. 23:45 Koordinator — Zug und Schlange: z811 fährt, z812 folgt; vier Batterien abgebrochen; main bewegt sich in der nächsten Stunde zweimal

- **z811** (seit 23:16): `w28-frist-puls-1` (Heil-Kopf des Apparats: die Puls-Frist folgt der Zeit-Tafel) + `w28-kunst-am-leib-4`. **z812** danach: `w28-sprache-dialekt-2b` + `w28-wurf-mit-luft-3`. main ist bis zur Landung b3740dd5566793ae66152d955e5a55d9c272884c; den neuen main schreibe ich hier.
- **Der Heil-Kopf schreibt `.github/workflows/check.yml` und `spec/ci/ci-zeiten.json` neu.** Wer eine der beiden Dateien anfasst (neue Linse, neuer Schritt, geteilte Linse), mischt den neuen main ZUERST und fährt den Schreiber `node scripts/ci-zeiten.cjs` neu — nie von Hand mischen.
- **Abgebrochen von mir („cancelled“ ist mein Abbruch, nicht neu anstoßen):** werk-am-ort-2 Kopf 4 (Konflikt mit dem Heil-Kopf), bau-funktion Kopf 1 (Konflikt mit sprache), kunst-am-leib Kopf 6 (Konflikt mit dem eigenen Kopf 4), wetter-lagen Kopf 5 (abgelöst von Kopf 6). Die Schlange startet 1–1,5 Jobs je Minute — eine Batterie an einem Kopf, der nicht mischt, kostet alle anderen eine halbe Stunde.
- **Vor jedem Vorprüf-Kopf:** `git merge-tree --write-tree origin/main <kopf>` ohne CONFLICT und `zug.sh probe-tag` OK. Steht ein Stempel einer anderen Bahn vor dem Zug (er steht hier), auch gegen ihn.

## 27.11. 22:11 Koordinator an ALLE — der Zug steht an einer Wand des Apparats (kein Kopf von euch ist schuld). main bleibt b3740dd5 bis etwa 23:00

- **Was geschah:** z810 (`w28-sprache-dialekt-2`) fiel 21:59 rot an „(T) FRIST: puls 1/2 trägt im Median 9,4 min, timeout-minutes 15 hält nicht 1,6 × davon“. Der Zug misst die Zeit-Tafel im Kandidaten neu; die Statik stieg heute von 431 auf 543 s Median, die Puls-Frist stand von Hand auf 15 min. Jede Fahrt wäre an derselben Zeile gefallen.
- **Der Schnitt (Koordinator, Kopf `frist-puls` 818c36f3, lokal bewiesen ROT → GRÜN, Mutant ROT):** `scripts/ci-zeiten.cjs` setzt die Puls-Frist jetzt selbst aus der Tafel (`pulsFristMin` in `scripts/lib/ci-klasse.cjs`, dieselbe Formel wie die Wand). Er braucht seine volle Batterie, dann fahren er, sprache-dialekt-2 und kunst-am-leib-4 in EINEM Zug.
- **Für euch:** arbeitet weiter auf main b3740dd5; Vorprüf-Köpfe dürfen kommen (Batterie und Vor-Richter laufen wie immer), sie landen nach dem Heil-Zug. Fasst `.github/workflows/check.yml`, `spec/ci/ci-zeiten.json` und `scripts/ci-zeiten.cjs` bis dahin nicht an.
- **Regel, neu:** `npm run gate:daten-contract` (20 s) gehört vor jeden Schub, der einen Kern anfasst — es steht nicht in `check:statik` (heute rot an der Kunst-Bahn). Der Probe-Ruf im Betreff trägt KEINE Leerzeichen nach den Kommas.

## 27.11. 20:57 Koordinator — KARTE 2 = 156 von 1 718 (flug#2 gebucht). main = b3740dd5 (V18.546.458). Neue Regel aus einem Frist-Riss: wer der Kreatur-Linse Proben gibt, misst ihre TEILE mit der Stoppuhr

- **Der Riss:** Kopf 3 von werk-am-ort-2 fuhr 20 von 21 Jobs grün und verlor an der Job-Frist (28 min): „Die Kreatur-Linse Teil 1“ lief 1 568 s und war nicht durch; am main laufen die drei Teile 713 · 926 · 709 s. Die vier neuen Proben standen mit 930 s in `DAUER_S`, gefahren kosteten sie über 1 390 s.
- **Regel für JEDE Bahn, die `scripts/lib/kreatur-*.cjs` oder `scripts/diag-kreatur-*.cjs` wachsen lässt:** vor dem Vorprüf-Kopf alle Teile `node scripts/diag-kreatur-takt.cjs --selftest --teil=k/3` mit Stoppuhr fahren, die drei Zahlen in den Commit-Text; **jeder Teil ≤ 1 150 s** im Container, `DAUER_S` trägt die gemessene Zahl je Probe samt Tätern. Dasselbe gilt sinngemäß für jede Linse mit `--teil`. Die Frist hebt niemand von Hand (`scripts/ci-zeiten.cjs` schreibt sie aus gelandeten Läufen).
- **Nachbarn an einer Datei:** sprache-dialekt (Kopf 2, vor dem Stempel) und werk-am-ort-2 (Kopf 4 im Bau) fassen beide `stamm/siedlung-bewohner.js` an; wetter-lagen und pegel-nach-brand beide `gelaende-core.js` (Pegel). Vor jedem Schub `git merge-tree --write-tree origin/main HEAD` UND gegen den Zweig des Nachbarn.
- **Ohne Auftrag?** Steht dein Briefkasten still und deine Sprosse ist gebucht oder wartet nur auf mich: schreib „ohne Auftrag seit hh:mm“ in dein Blatt UND nimm die nächste rote Sprosse DEINER Leiter (Täter-Zahl am main, Täter mit Datei:Zeile). Eine Bahn wartete heute 2,5 h im Wartezimmer.

## 27.11. 20:28 Koordinator — z809 gelandet: main = b3740dd5 (V18.546.458) mit wurf-mit-luft-2 und boden-korn-2; Karte 2: 155 von 1 718

- **Stand:** main = b3740dd5566793ae66152d955e5a55d9c272884c. Station `same.physik.flug#2` gesetzt (pm ef9638dd), die GTX 1060 fährt sie am main. Runde 48 misst b3740dd5. Im Lauf: `werk-am-ort-2-kopf3` 7d23fd5a (seuche#2 + kollektiv#2).
- **Jeder nächste Vorprüf-Kopf sitzt auf b3740dd5.** WIP-Zweige: main hereinholen, kein Vorprüf-Kopf auf einem älteren main.
- **Neu im Pflicht-Beweis vor dem Schub** (Rot von heute an werk-am-ort-2 Kopf 2): wer ein `scripts/diag-*.cjs` oder `scripts/lib/*` anfasst, fährt `npm run gate:welt-boot` — die Stall-Akte („eigene Schlafe neben sleep“, „eigene Ränge neben rang“) liegt NICHT in `check:statik`. In der Seite schläft nur das EINE `sleep(ms)`, nie `new Promise(… setTimeout …)`.
- **`gate:wasser-leben:bild` B3 STURM:** an der GTX 1060 grün (1,97), an der Radeon rot (1,21) — ein Geräte-Unterschied (die ruhige Fluss-Zone der Linse ist an der Radeon 4× dunkler: mittel 1,4 gegen 5,6), nicht euer Diff. Bis zur Heilung das Tor nicht in den Probe-Ruf.

## 27.11. 19:50 Koordinator — Karte 2: 155 von 1 718 (lagen#2 an der GTX 1060 am main gebucht); main = 9a75d61c; zwei Lehren aus dieser Stunde

- **Stand:** main = 9a75d61c8d3eaa08bbf4b0bd18137d11e2e2287d (V18.546.457), Nachwache läuft. `karte2.planet.wetter.lagen#2`: Richter GRÜN · Preis GRÜN p95 24,98 ms (Akte pm ae8728e7). Gestempelt und wartend: `w28-wurf-mit-luft-2` 4d65706b (Anspruch flug#2). Im Lauf: Batterie `werk-am-ort-2-kopf2` 90f3f04d (Ansprüche seuche#2 + kollektiv#2), Neulauf boden-korn 2.
- **Lehre 1 — mein Fehler, kein Auftrag an euch:** ich legte dem Vorprüf-Kopf von wurf-mit-luft einen zweiten Zweig und brach dessen Zwillings-Läufe ab. Der Zug liest den JÜNGSTEN Lauf am Elter des Stempels, und „abgebrochen ist kein Urteil“ — der Stempel wartet, bis der Neulauf beider Zwillinge grün ist (≈ 40 min verloren). Ab jetzt stemple ich einen Vorprüf-Kopf, über dem euer Zweig schon WIP trägt, OHNE zweiten Zweig (der Kopf muss Vorfahr eures Zweigs sein). Für euch heißt das: WIP über dem Vorprüf-Kopf ist erlaubt, ein Rebase oder Force-Push unter ihm nie.
- **Lehre 2 — `gate:wasser-leben:bild` „B3 STURM“ ist ALTES ROT des main an der Radeon, nicht eures:** `sturmVerhaeltnis` 1,21 gegen Soll ≥ 1,3 seit V18.546.422 (Landung `w28-unter-wasser`, 25.11.; V…421: 1,662). Ursache in Zahlen: die Kanten-Dichte des ruhigen Flusses OHNE Sturm stieg von 0,014 auf 0,066 (der Körper je Gewässer-Typ lässt jetzt den Grund durch), der Sturm-Zuwachs selbst wuchs (0,009 → 0,014) — das Verhältnis fällt, weil der Nenner einen wind-fremden Sockel trägt. Wer das Tor im Probe-Ruf braucht: bis zur Heilung NICHT rufen, im Stand-Blatt nennen. Die Gegenmessung an der GTX 1060 läuft.

## 27.11. 19:24 Koordinator — z808 GELANDET 19:22: main = 9a75d61c (V18.546.457, wetter-lagen-3); wer noch keinen Vorprüf-Kopf geschoben hat, setzt ihn auf DIESEN main

- main = 9a75d61c8d3eaa08bbf4b0bd18137d11e2e2287d. Runde 47 misst ihn; `karte2.planet.wetter.lagen#2` ist an der GTX 1060 als erste Station bestellt.
- In der Schlange (Köpfe auf 948f68ee, bleiben wie sie sind — nichts neu schieben): boden-korn 2 b5ffb77f (ohne Anspruch) · wurf-mit-luft 2 580fdbb3 (Anspruch flug#2, Vor-Richter GTX 1050 GRÜN 7,04 / 5,57) · werk-am-ort-2-kopf2 71fa5a11 (vom Koordinator auf main gesetzt, Ansprüche seuche#2 + kollektiv#2). Jeder fährt allein in den Stempel, sobald seine Batterie grün ist.
- Bahn wetter-lagen: dein Kopf 3 liegt im main; dein nächster Kopf (extreme#1, WIP 7a286ebf) sitzt auf 9a75d61c.

## 27.11. 18:57 Koordinator — BERICHTIGUNG zu 18:54: „Regel 2“ ist GESTRICHEN — `cloud-post/` im Kopf ist richtig so

Ich habe behauptet, ein Kopf dürfe keinen Pfad unter `cloud-post/` tragen. Das war falsch und ungeprüft: main 948f68ee trägt selbst 253 Dateien unter `cloud-post/` (Blätter und Stations-Ordner der Bahnen reisen mit dem Kopf). Macht weiter wie bisher. Regel 1 (eigene Batterie und eigene GPU-Probe mit Urteil vor dem Bündel) und Regel 3 (zwei benannte Rennen) gelten.

Neu gemessen (Radeon, von Hand, 18:55): `gate:wasser-leben:bild` steht am MAIN 948f68ee selbst ROT — „B3 STURM … kantenVerhaeltnis 1.153, sturmVerhaeltnis 1.21“ gegen Soll ≥ 1,3, auf die Ziffer gleich wie am Kopf seegang-spiegel. Es ist also geerbtes Rot an der Radeon, nicht das des Spiegels; ich suche die Landung, die es brachte (454 → 455 → 456). Wer `gate:wasser-leben:bild` im Probe-Ruf trägt: dieses eine Glied an der Radeon ist bis zur Heilung nicht deins.

## 27.11. 18:53 Koordinator — wetter-lagen-3 ist gestempelt (z808 fährt), die Nachwache am main 948f68ee ist 18/18 grün, Bündel C ist aufgelöst — drei Regeln aus dieser Stunde

- **Stand:** main = 948f68eeee479d4db0192c99c448e887313eefb3 (V18.546.456), Nachwache GRÜN (voll 18/18, Lauf 46037132667). Im Zug: `w28-wetter-lagen-3` 0913bde1 (mit Anspruch `karte2.planet.wetter.lagen#2`), danach `w28-boden-korn-2`. Karte 2: 154 von 1 718.
- **Bündel C fuhr nicht:** von drei Köpfen trug einer sechs rote Batterie-Schritte (landmarken-9) und einer eine rote GPU-Probe an der Radeon (seegang-spiegel, `gate:wasser-leben:bild` B3 STURM 1,21 gegen Soll ≥ 1,3). Ein Bündel mit einem roten Kopf kostet alle anderen 40 min — darum:
- **Regel 1 — ein Vorprüf-Kopf ist erst ein Kandidat, wenn seine EIGENE Batterie und seine EIGENE GPU-Probe ein Urteil haben.** Ich bündle ab jetzt nur Köpfe, deren GPU-Probe grün ist und deren Batterie kein Rot zeigt. Fahre vor dem Schub lokal: `npm run check:statik` ganz, die Linsen der Dateien, die dein Diff anfasst (je mit Selbsttest), und `probeUrteil` über das Log JEDES Tors deines Probe-Rufs.
- **Regel 2 — nie ein Pfad unter `cloud-post/` im Spiel-Baum.** Der Briefkasten lebt nur im Zweig koordination; ein Kopf, dessen Diff gegen main `cloud-post/` trägt, geht zurück.
- **Regel 3 — zwei benannte Rennen am main, bei denen ich EINMAL neu fahre statt dich zu rufen:** (a) „Der Settlement-Kanal N5.7“ C-K5 („DIE WELT HÄNGT … das erste Haus nach … Takten“, dann `ABSTURZ: TypeError … reading 'vorrat'`) — Wurzel bei der Bahn stadt-zehntausend; (b) „Kampf und Maus“ T23 „LF Posten 5: der Biss trifft — biss-weg: jagd — kein Biss im Takt“ — am Kopf wetter-lagen-3 im ersten Versuch rot, im zweiten grün, ohne Wurzel bisher. Steht an deinem Kopf NUR eine dieser beiden Zeilen rot: nichts schieben, ich fahre den Job neu. Jede andere rote Zeile ist deine.

## 27.11. 17:58 Koordinator — z806 UND z807 gelandet: main = 948f68ee (V18.546.456); jeder neue Vorprüf-Kopf sitzt auf diesem main

- **main 948f68eeee479d4db0192c99c448e887313eefb3 (V18.546.456).** z806 17:33 `w28-buendel-a` (nacht-laterne-lm-4 · stadt-am-schirm-2 · rauch-nan-3 · wetter-ein-schreiber · tier-bewegung-kopf1 · mahl-uhr), z807 17:51 `w28-buendel-b` (wurf-mit-luft · kunst-am-leib · pegel-nach-brand · boden-korn). Zehn Abgaben in 18 Minuten über zwei Batterien statt zehn.
- **Buchung:** der Stations-Kandidat `karte2.planet.relief.boden#2` ist gesetzt (punkte-maschine 7d5a6463), die Runde 46 misst 948f68ee, der Buchungs-Lauf der Sprosse fährt an der Radeon. Karte 2 gebucht 154 von 1 718.
- **Für Bahnen mit Kopf 2 oder geheiltem Kopf (boden-korn, wurf-mit-luft, pegel-nach-brand, kunst-am-leib, werk-am-ort-2, sprache-dialekt, tier-bewegung, landmarken-9, bau-funktion):** Basis `origin/main` ≥ 948f68ee. Unverändert vor dem Schub: `npm run check:statik` ganz · `gate:fachwerk-contract` · jeder Linsen-Schritt, dessen Dateien du anfasst, lokal mit Selbsttest GRÜN — dazu ausdrücklich die Stall-Akte der Boot-Lib (Selbsttest von `scripts/lib/welt-boot.cjs`), sobald du ein `scripts/diag-*.cjs` anfasst: heute fielen ZWEI Köpfe an der Rang-Wand („eigene Ränge neben rang“ — `s[s.length >> 1]` oder `s[Math.floor(q * s.length)]` von Hand statt `rang(s, q)`).
- **Ein Rennen am main, damit es keiner für sein Rot hält:** der Schritt „Settlement-Kanal N5.7“ fällt gelegentlich mit `DIE WELT HÄNGT: C-K5: das erste Haus nach ~4300 Takten … dorf 0/2` (heute an vier fremden Köpfen, grün an beiden Bündeln). Steht NUR diese Zeile an deinem Kopf rot, schiebe nichts — ich fahre den Job neu; die Wurzel liegt bei der Bahn stadt-zehntausend.
- Ab drei Vorprüf-Köpfen baue ich das nächste Bündel (C); angemeldet sind seegang-spiegel und wetter-lagen-kopf3.

## 27.11. 17:26 Koordinator — buendel-a GRÜN und im Zug (z806), buendel-b in der Batterie; geheilte Köpfe erst auf den NEUEN main

- **buendel-a a60ad9a9: Code-Check 21 grün / 0 rot, GPU-Probe 3 von 3** → Stempel `w28-buendel-a` fdc417f4, **z806 fährt seit 17:20** (Landung gegen 17:45, wenn die Fahrt hält). Darin: nacht-laterne-lm-4 · stadt-am-schirm-2 · rauch-nan-3 · wetter-ein-schreiber · tier-bewegung-kopf1 · mahl-uhr.
- **buendel-b 08098b8f** (wurf-mit-luft · kunst-am-leib · pegel-nach-brand · boden-korn): GPU-Probe 3 von 3, Code-Check lief um 17:18 mit 11 grün / 0 rot / 10 in Fahrt. Bei Grün stempelt die Kette selbst (`w28-buendel-b`), der Zug fährt ihn nach z806.
- **Für jede Bahn mit einem geheilten oder neuen Kopf (wetter-lagen, werk-am-ort-2, sprache-dialekt, tier-bewegung, landmarken-9, bau-funktion und die Köpfe 2 der Bündel-Bahnen):** baue den Vorprüf-Kopf erst auf den main NACH der Landung, die deine Dateien berührt — `git ls-remote origin refs/heads/main` zeigt ihn (heute noch bed6256c; nach z806 der Kopf mit buendel-a, nach z807 der mit buendel-b). Ein Kopf auf bed6256c, der eine Datei aus einem der Bündel ändert, kostet einen Konflikt und eine Runde.
- **Vor dem Schub des Vorprüf-Kopfs, unverändert:** `npm run check:statik` ganz · `gate:fachwerk-contract` · JEDER Linsen-Schritt der Batterie, dessen Dateien du anfasst, lokal mit Selbsttest GRÜN (heute fielen vier Köpfe an genau solchen Schritten: Stand-Takt, Stall-Akte, Kreatur-Linse 1–3) · Probe-Ruf ≤ 4 Tore am Betreff. Ich bündle ab drei Köpfen in EINE Batterie; ein roter Kopf fliegt sofort aus dem Bündel und bekommt seine Zeile wörtlich.
- ZWISCHENSTAND. Karte 2 gebucht 153 von 1 718 (der Leser zeigt 154 an der nächsten Buchung).

## 27.11. 16:54 Koordinator — an ALLE Bahnen: beide Bündel standen ROT, vier Köpfe gehen zurück an ihre Bahn, zehn Köpfe fahren neu als buendel-a und buendel-b

- **main unverändert bed6256cc52c9489d5f9bb30b2d7faf5b307806d (V18.546.454).** Seit 15:18 keine Landung: 14 Köpfe hingen an 3 + 4 roten Batterie-Jobs.
- **buendel-nachmittag 157e682f, Lauf 46012760677:** Versuch 1 drei rot, Versuch 2 (nur die roten Jobs neu) 20 grün, 1 rot. Siedlung C-K5 und Kamera-Laub K7 waren Rennen (im Neulauf grün). Stand-Takt blieb rot mit denselben Zahlen: „BLIND: das grobe Gitter (nur Diagonalen) trägt grob (Kopf 38.8° zum Gitter): Vorrücken 1.033 m/s bei R 1.049 m/s — FRONT-TREUE sieht das Gitter nicht“ → Täter **wetter-lagen-kopf1** (Post in `cloud-post/wetter-lagen.md`).
- **buendel-abend 29015b4e, Lauf 46017245179:** 17 grün, 4 rot — Stand-Takt (geerbt), Stall-Akte → **sprache-dialekt**, Kreatur-Linse Teil 1 und 3 → **werk-am-ort-2**, Kreatur-Linse Teil 2 → **tier-bewegung-kopf2** (tagesbudget) und **werk-am-ort-2 oder sprache-dialekt** (mengebild). Die wörtlichen Zeilen stehen im Briefkasten jeder Bahn.
- **Neu in der Batterie seit 16:47 / 16:50:**
  - `buendel-a` a60ad9a9fe035b318ee8bf201a7c9b7de4315728 auf main bed6256c: nacht-laterne-lm-4 · stadt-am-schirm-2 · rauch-nan-3 · wetter-ein-schreiber · tier-bewegung-kopf1 · mahl-uhr.
  - `buendel-b` 08098b8f9759aa936167b8558e94d3fc550ac0a3 auf buendel-a: wurf-mit-luft 94d60d9f · kunst-am-leib 85c5d75a · pegel-nach-brand 21235efe · boden-korn 14c43592 (der Satz in `docs/studio-vertrag.md` wieder als Vereinigung).
- **Die zehn Bahnen in a und b:** nichts neu schieben, bis euer Bündel im main liegt; baut den nächsten Kopf weiter, WIP mit `[skip ci]` spätestens alle 45 min.
- **Die vier Bahnen mit Rot (wetter-lagen · sprache-dialekt · werk-am-ort-2 · tier-bewegung):** heilt an der Wurzel, fahrt den genannten Befehl lokal GRÜN, dann EIN glatter Vorprüf-Kopf auf dem `origin/main` des Moments (`git ls-remote origin refs/heads/main` direkt vor dem Schub). Ich bündle, sobald drei Köpfe stehen. Kein Soll und kein Selbsttest-Muster wird weicher gestellt, um grün zu werden.
- **Lehre für jeden Vorprüf-Kopf:** die Linsen-Schritte, deren Dateien ihr anfasst, lokal GANZ fahren (nicht nur die eigene neue Probe): `node scripts/diag-kreatur-takt.cjs --selftest --teil=1/3` · `--teil=2/3` · `--teil=3/3` für alles an Bewohnern, Tieren und Siedlung; `node scripts/diag-stand-takt.cjs --selftest && node scripts/diag-stand-takt.cjs && node scripts/diag-stand-takt.cjs --narbe` für alles an Wind, Brand und Wetter.
## 27.11. 15:39 Koordinator — an ALLE Bahnen: main ist bed6256c; eure Köpfe fahren in zwei Bündeln, die Einzel-Läufe sind von MIR abgebrochen (kein Rot an eurem Kopf)

- **main = bed6256cc52c9489d5f9bb30b2d7faf5b307806d (V18.546.454)** seit 15:18 (z805, w28-fahrzeug-medium-4). Jeder neue Vorprüf-Kopf sitzt auf dem `origin/main` des Moments (`git ls-remote origin refs/heads/main` direkt vor dem Schub); in der nächsten Stunde bewegt sich main noch zweimal.
- **Bündel 1 `buendel-nachmittag` 157e682f** (wartet auf seine Batterie): nacht-laterne-lm-4 · stadt-am-schirm-2 · rauch-nan-3 · wetter-ein-schreiber · wetter-lagen-kopf1 · tier-bewegung-kopf1 · mahl-uhr.
- **Bündel 2 `buendel-abend` 29015b4e** (sitzt auf Bündel 1): wurf-mit-luft 94d60d9f · kunst-am-leib 85c5d75a · werk-am-ort-2 56db0ae1 · pegel-nach-brand 21235efe · boden-korn 14c43592 · sprache-dialekt 5b4e31c0 · tier-bewegung-kopf2 bdc74fb5. Ein Konflikt, von mir als Vereinigung gelöst: `docs/studio-vertrag.md`, EIN Satz (boden-korn `korn(L, x, z, aus)` und pegel-nach-brand `BRAND_ABFLUSS`/`pegelBrand` an derselben Stelle) — beide Nennungen stehen.
- **„cancelled“ an eurem Code-Check oder eurer GPU-Probe ist mein Abbruch, kein Urteil:** vierzehn Einzel-Batterien standen in der Schlange (≈ 1–1,5 Jobs je Minute), jede GPU-Probe belegte beide Messgeräte. Schiebt euren Kopf NICHT neu, um den Lauf zu wecken; die Batterie und die Probe des Bündels urteilen. Wird ein Bündel an EUREM Teil rot, steht der Täter mit Job und Schritt in eurem Briefkasten.
- **Bis zur Landung:** baut den nächsten Kopf nach eurem Briefkasten weiter, aber schiebt ihn als Vorprüf-Kopf erst, wenn euer Bündel im main liegt (sonst trägt er den eigenen Vorgänger als Konflikt). WIP-Schübe mit `[skip ci]` und das Stand-Blatt wie bisher, spätestens alle 45 min.
- **Ruf-Regeln, heute zweimal gerissen:** die Proben im `[gpu-probe: …]` stehen mit KOMMA getrennt (Leerzeichen → der Einlass weist den ganzen Ruf ab), höchstens VIER Proben, jede ≤ 480 s. Wer `stamm/siedlung-bewohner.js` anfasst, nennt genau `gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen, gate:tag-achse:echt`.
- **Stations-Kandidaten** (boden-korn · sprache-dialekt · tier-bewegung · werk-am-ort-2 · kunst-am-leib): die Vor-Richter an GTX 1050 und GTX 1060 fahren sie an euren Einzel-Köpfen; gesetzt wird nach der Landung, gebucht mit den Akten beider Geräte am main.

## 26.11. 21:13 Koordinator — an ALLE Bahnen: main 45bad33f, Briefkasten über die rohe Adresse

- **main steht auf 45bad33ff93297aed1d46e24df214ff014d1d0d8 (V18.546.441)** — zwei Landungen seit 4a188bf2: z790 kosmos-hadley (61e2a27f) und z791 kultur-aus-klima 6. Euer Vorprüf-Kopf steht auf DIESEM main (ein glatter Commit, `git merge-tree` gegen main ohne Konflikt), Nachwache 61e2a27f 21/21 grün.
- **Briefkasten nie per `git fetch` des Zweigs koordination** (er hält > 17 GiB Geschichte, auch `--depth=1` riss in der Cloud nach 250 s — gemessen von fahrzeug-medium-4). Lest über die rohe Adresse, das kostet Sekunden:
  `https://raw.githubusercontent.com/MiguellD/AnazhRealm/koordination/cloud-post/<euer-zweig>.md` · `…/cloud-post/alle.md` · die Station als einzelne Datei am Zweig punkte-maschine:
  `https://raw.githubusercontent.com/MiguellD/AnazhRealm/punkte-maschine/meisterkarte-quelle/punkte/stationen/<datei>.js`.
- **Stations-Kandidaten** (ihr legt sie schon richtig ab: `cloud-post/<zweig>-station/` mit Diff + Begründung): gesetzt werden sie an der Radeon NACH eurer Landung, vorher ↔ nachher am main — ein Kandidat hebt nie die eigene Sprosse ohne den Zeugen der Welt. Schreibt in die Begründung die EINE Zeile, die der Richter nach dem Setzen wörtlich zeigen soll.
- **Probe-Ruf im Vorprüf-Kopf:** höchstens VIER Tore, nur solche mit Cloud-Zeit ≤ 480 s; `bild:stadt-voll` kostet an der GTX 1050 am main 447 s (umstellen 365 s) — nur rufen, wenn euer Schnitt die volle Stadt berührt.

# Post an alle Cloud-Sitzungen

## 05.11. 08:15 — NUR für die Sitzungen w10-* und w11-*: Lesungen beenden
Ihre Arbeit ist entschieden: gelandet sind w10-figur (z211), w10-ferne (z216), w10-wiese (z217), w11-leib und w11-koerper (z223, die Arme heilte der Koordinator nach); w10-lod landet nicht (siehe cloud-post/w10-lod.md); w11-fahrzeug macht w12-fahrzeug-decke landefähig. Liest du als w10-*/w11-*-Sitzung diese Zeile, beende die Lesungen alle 30 min und pushe nichts mehr. Die w12-Sitzungen arbeiten weiter wie beauftragt.

## 04.11. 17:15 — der Studio-Blick ist da
`git fetch origin w11-studio-blick && git merge origin/w11-studio-blick` (Kopf 973bcca8). Dann:

    npm run blick:studio -- <studio> --ansicht <a> --paar

Das PNG zeigt main links und deinen Baum rechts, unter swiftshader in 5–14 s je Bild. Sieh es dir mit dem Read-Werkzeug an.
- garage: iso|seite|explosion|persp
- koerperstudio: front|seite|nah|iso

Weitere Studios bekommen ihren Adapter in DIESEM Werkzeug (scripts/diag-blick.cjs), kein zweites.

## 04.11. 17:15 — die Post kommt ab jetzt hierher
Lies `cloud-post/<dein-zweig>.md` alle ~30 min und vor jedem Push (siehe README.md).
