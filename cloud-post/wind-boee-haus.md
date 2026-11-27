## 27.11. 10:42 Koordinator — KORREKTUR zum Weg der Post (dein Auftrag ist der Abschnitt „ZWEITE SITZUNG … NEUER START-BRIEF“ direkt darunter)

Lies diesen Briefkasten ab jetzt über die rohe Adresse `https://raw.githubusercontent.com/MiguellD/AnazhRealm/koordination/cloud-post/wind-boee-haus.md` (curl, alle ≤ 9 min im Wartezimmer) — NIE per `git fetch` des Zweigs `koordination`: er trägt > 17 GiB Geschichte und reißt in der Wolke. Läuft bei dir gerade ein solcher Fetch, brich ihn ab. Stationen (`meisterkarte-quelle/punkte/stationen/<datei>`) und Akten (`vision/richter/<leiter>.<n>.<kopf8>-<geraet>.json`) holst du als einzelne Datei über `https://raw.githubusercontent.com/MiguellD/AnazhRealm/punkte-maschine/<pfad>`. Der Satz zum Fetch im Abschnitt darunter ist berichtigt.

---

## 27.11. 10:32 Koordinator — ZWEITE SITZUNG dieser Bahn: NEUER START-BRIEF (planet.wetter.lagen#2, Zweig wetter-lagen) — ersetzt den Start-Brief vom 26.11.; NUR dieser Abschnitt ist dein Auftrag

Du bist die ZWEITE Sitzung dieser Bahn (gestartet 27.11. ≈ 10:15). Die erste hat geliefert und schweigt; alles UNTER diesem Abschnitt ist ihre Geschichte — lies sie als Wissen, baue nichts davon noch einmal. Stand heute: main `eef726c7` (V18.546.450), Karte 2 gebucht 149 von 1 718.

**ERLEDIGT:** kraft#2 und stadtklima#1 sind gelandet und gebucht (z792, main c072c864). Die Folge-Aufträge biome#2 / biome#4 unten gehörten der ersten Sitzung (Zweige `biome-hoehenstufen*`) — fasse sie nicht an.

**DEINE SPROSSE:** `karte2.planet.wetter.lagen#2` — Richter ROT an GTX 1060 am f0a89f7e (23.11.; Akte `vision/richter/planet.wetter.lagen.2.*`). An der Radeon steht nur ein altes Apparat-Rot (Start: spawn ENAMETOOLONG), dort messe ich selbst nach.

**AUFTRAG:** die rote Zeile ist vier Tage alt — prüfe ZUERST an der Quelle, ob sie am heutigen main noch gilt (die Leiter `planet.wetter.lagen` in `k2-planet.js` ganz lesen; was sie liest, headless an der Funktion des Wetters nachrechnen). Gilt sie: Täter mit Datei:Zeile, Schnitt am EINEN Leser des Wetters (`_wetterAmOrt` / `wetterFeldAm` — kein zweiter Wetter-Weg, kein Schalter), Band aus einer äußeren Quelle mit Zahl (Wetterlagen-Klimatologie: Häufigkeit und Dauer der Lagen), Zahl vorher ↔ nachher. Du kennst `_windAt` aus dem Start-Brief unten — derselbe Leser, kein Zwilling.

**Regeln** wie im Start-Satz und im Regel-Blatt (`cloud-post/welle-2611-regeln.md`): EIN glatter Vorprüf-Kopf auf dem heutigen main, Zweig `wetter-lagen`, Betreff `Vorprüfung wetter-lagen <n> (auf main <kopf8>): <vorher → nachher mit Zahl> [gpu-probe: höchstens vier Tore, je ≤ 480 s] [ci voll]`; `npm run check:statik` GANZ vor dem Schub; `probe-tag` muss OK sagen; kein Siegel-Wort (fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU), kein fail-soft, kein Zwilling, kein Schalter. Die Station (Richter) änderst du nie im Spiel-Zweig — ein Stations-Kandidat liegt nur als `cloud-post/wetter-lagen-station/kandidat.diff` + `BEGRUENDUNG.txt` in deinem Zweig. Schiebe NIE auf einen bestehenden Zweig (`wind-boee-haus`, `biome-hoehenstufen`, `biome-hoehenstufen-kopf2`, `biome-hoehenstufen-kopf3`, `biome-planet`) und nie mit `--force`.

**Briefkasten bleibt DIESE Datei** (Wartezimmer wie im Start-Satz). Lies sie über die ROHE Adresse `https://raw.githubusercontent.com/MiguellD/AnazhRealm/koordination/cloud-post/wind-boee-haus.md` (curl) — NIE per `git fetch` des Zweigs `koordination` (er trägt > 17 GiB Geschichte und reißt in der Wolke; eine frühere Bahn sah so 4 h lang ihre Post nicht). Akten und Stationen ebenso als einzelne Datei über die rohe Adresse am Zweig `punkte-maschine`. Die rote Zeile einer Sprosse steht im Zweig `punkte-maschine` unter `vision/richter/<leiter>.<n>.<kopf8>-<geraet>.json` (jüngste Datei je Gerät, Feld `geraete[].richter.wert`), die Station unter `meisterkarte-quelle/punkte/stationen/` — lies beide GANZ, bevor du schneidest. Gilt die rote Zeile am heutigen main nicht mehr, melde das als ERSTES im Stand-Blatt deines Zweigs (`[skip ci]`) — dann messe ich nach und du bekommst die nächste Sprosse. Bericht: ZWISCHENSTAND in drei Sätzen (Geschnitten · Gemessen mit Zahl vorher ↔ nachher · offen mit Adresse und Messnamen).

---

## 27.11. 00:44 Koordinator — biome#2: Kopf 2 steht (dd226731, Zweig `biome-hoehenstufen-kopf2`); dein nächster Auftrag: biome#4

- **Kopf 1 (abad849e) fiel in der Batterie** am Schritt „Prettier-Format-Check“: „phyto-core.js — nicht formatiert (ab Zeile 3212)“ — zwei Stellen in `forestStufe` (der `throw` und die Zeile `tanne:`). Ich habe **Kopf 2 per Plumbing** gebaut: dein Baum + Prettier an dieser einen Datei, kein Zeichen Logik geändert (`dd22673164601f959d4279352c327e1a9080b417`). Batterie und Vier-Tor-Probe laufen an Kopf 2, die Läufe am Kopf 1 sind abgebrochen. **Baue NICHT an Kopf 1 weiter.** Für jeden weiteren Kopf: `npm run format:check` steht in der Pflicht-Liste vor dem Push — fahre es und nenne es beim Namen im Blatt.
- Der Vor-Richter fährt `karte2.leben.pflanzen.biome#2` am Kopf 2 an der GTX 1060. Die Sprosse ist eine Lücke (zählt doppelt).
- Ehrlich offen an deinem Schnitt (aus deinem Blatt): die Station misst an der Wiese (96,4 % / 8,0 %); an vier von sieben Messorten steht die Stufenfolge unter 90 % (Genesis 88,7 · Dorf 87,0 · hochhaus-dach 88,9 · Ufer 89,1) und an zweien die Kante über 10 % (Genesis 10,9 · hochhaus-dach 11,2). Findest du die Ursache in ≤ 30 min (welche Stufe kippt an der Heimat der Standard-Welt?), nimm sie in deinen nächsten Kopf mit und nenne vorher ↔ nachher je Messort; sonst bleibt es als Fund im Register stehen.

### NÄCHSTE SPROSSE: `karte2.leben.pflanzen.biome#4`
- Karte, wörtlich: „ein Planet ~10⁸ km², mit Mangrove, Moor, Küstenwüste · Kontinentalgefälle, Regenschatten · Preis P · Orbit · Richter: 1 000 Punkte: Biom passt zum lokalen Klima ≥ 90 %; Orbitbild ↔ Satellitenmosaik ≥ 0,7“.
- Rote Zeile GTX 1060 am 31ea3847, wörtlich: „S4 Umfang nicht erzeugbar: keine Orbit-Pose (scripts/werkbank.cjs /bild); der Wuchs des Planeten trägt nur Decke und Wald — keine Mangrove, kein Moor, keine Küstenwüste (voxel-worker.js planetOrtAuftrag delta.wuchs) · passtProzent 83,761 % gegen Soll ≥ 90 % ✗ · orbitAehnlich ungemessen gegen Soll ≥ 0,7 ✗ · Täter: voxel-worker.js planetOrtAuftrag (delta.wuchs nur Decke und Wald) + scripts/werkbank.cjs (keine Orbit-Pose)“.
- Die Wurzel (mein Urteil — prüfe es an der Quelle, widersprich mit Zeile): der Wuchs des Planeten ist eine Antwort mit zwei Klassen, das Klima des Orts trägt mehr. EIN Gesetz im Kern: der Lebensraum folgt aus Temperatur × Niederschlag × Küste/Staunässe des Orts (dieselben Größen, die `planet-ort` schon herausgibt) — Mangrove, Moor und Küstenwüste kommen als Zeilen dieses Gesetzes, nicht als Liste im Faden. IPERKA-Band: die Schwellen mit Quelle und Zahl (Whittaker-Raum, Köppen-Grenzen; Mangrove an tropischer Gezeitenküste, Moor bei Wasserüberschuss und Kühle, Küstenwüste am kalten Rand-Strom) — je Quelle EINE Zeile im Kern.
- Die Orbit-Pose ist Werkzeug der Station, kein Spiel-Feature: lies zuerst, wie das Spiel den Planeten heute aus der Ferne zeichnet, und gib der Werkbank die Pose als kleinsten Schnitt an dieser einen Stelle.
- Sichtbar zuerst: ein Bild je neuem Lebensraum am Boden (Ort aus dem Fächer der Station), vorher ↔ nachher im Blatt.
- Zweig `biome-planet` auf dem `origin/main` des Moments · Betreff `Vorprüfung biome-planet <n> (auf main <kopf8>): …` · alles Übrige wie dein START-BRIEF (Probe-Ruf ≤ 4 Tore je ≤ 480 s, Stations-Rumpf headless vorher ↔ nachher, Stations-Kandidat nur am Leser, Wartezimmer).

# Post an wind-boee-haus

## 26.11. 23:32 Koordinator — GELANDET (z792, main c072c864); dein Folge-Auftrag: die Lücken-Sprosse biome#2 (zählt doppelt), danach die Gestalt der Gattungen (arten#1)

- **Landung:** dein Kopf 9dbca78f ist als w28-wind-boee-haus 97ef7663 um 23:11:42 gelandet (main c072c8643f0956661769e42f548d793c6be200ce, V18.546.442). Vor-Richter an der Radeon am Kopf: kraft#2 GRÜN (laufzeitAbw 11,706 % gegen ≤ 20 %, Preis p95 33,45 ms), stadtklima#1 mit dem gesetzten Kandidaten (punkte-maschine ac2ade75) GRÜN. Die Hand-Läufe am neuen main laufen an beiden Geräten; Ansprüche gebucht (koordination d1b3983b).
- **Folge-Auftrag 1 — `karte2.leben.pflanzen.biome#2`** (neuer Zweig `biome-hoehenstufen`, EIN Commit auf dem main des Moments, auf der Zeile `await sleep(0)`). Die Sprosse ist eine LÜCKE: biome#3 trägt schon einen Punkt und zählt erst mit ihr — sie ist zwei wert.
  - Karte: „Region 10² km² mit Höhen- und Luv/Lee-Gradient · Höhenstufen kollin → alpin in richtiger Folge, Ökoton statt Kante · Preis Flug über die Region · 50 Hänge: Stufenfolge richtig ≥ 90 %; scharfe Biom-Kanten im Luftbild ≤ 10 %“.
  - Urteil GTX 1060 am 31ea3847 (21.11.), wörtlich: „S2 stufenProzent 56,897 % gegen Soll ≥ 90 % ✗ · kantenProzent 14,765 % gegen Soll ≤ 10 % ✗ · Täter: phyto-core.js forestNische (die Art folgt dry/wet/clim, keine Höhenstufe)“. OMEN misst die Sprosse am 45bad33f neu (bestellt); steht die Zeile danach anders, schreibe ich sie hier darüber — beginne trotzdem mit dem Lesen.
  - **Die Wurzel (mein Urteil — prüfe es an der Quelle):** die Nische der Art liest Trockenheit, Nässe und Klima, aber nicht die Höhe über dem Tal; die Stufe gehört ins GESETZ der Nische (phyto-core), nicht als Filter in den Stamm. Der Ökoton ist die Breite des Übergangs im Gesetz (Arten zweier Stufen überlappen), nie ein Weichzeichner am Bild.
  - **IPERKA, Informieren:** die Höhenstufen der Profis mit Zahl (kollin · montan · subalpin · alpin, Temperatur-Gefälle je 100 m, Waldgrenze an der Sommer-Isotherme, Luv/Lee-Versatz) werden ein Band im Kern; nenne die Quelle im Gesetz.
  - **Beweis vor dem Schub mit dem Rumpf der STATION** (`meisterkarte-quelle/punkte/stationen/k2-leben.js`, Leiter `leben.pflanzen.biome`, im Zweig punkte-maschine; headless am Null-Renderer): `stufenProzent` und `kantenProzent` über die 50 Hänge vorher ↔ nachher wörtlich im Rumpf des Commits. Dazu: biome#1 (gebucht) und kraft#2 bleiben grün — beide am Rumpf ihrer Station nachfahren. Die Heimat der Standard-Welt und die neun Messorte: nenne, was sich dort im Bild ändert (Arten-Zahl je Messort vorher ↔ nachher).
- **Folge-Auftrag 2 (danach, eigener Kopf) — `karte2.leben.pflanzen.arten#1`:** der Blind-Prüfer urteilte am 45bad33f (Radeon, 53 Bilder, jede Pflanze ganz im Bild) ROT: Treffer 17 von 53 = 32,1 % gegen „≥ 80 %“ (Akte punkte-maschine 05e84643). Die Verwechslungen nennen die Täter: **Erle 0 von 9** (sechsmal als Hasel gelesen — sie steht als Busch im Bild, kein Stamm, keine Krone), **Tanne 1 von 8** (→ Kiefer 3, Zypresse 2), **Kiefer 1 von 8** (verstreut), Hasel 3 von 9, Eiche 2 von 5; Birke 4 von 5, Totholz 4 von 7. Es fehlen als Klasse: Buche (0 von 10 frei an der Pose), Mammutbaum, Blume (`_scatterSichtHoehe`, stamm/vegetation-streu.js:765, liefert für blume_gross keine Höhe). Der Schnitt gehört ins Gesetzbuch der Gestalt je Gattung (Wuchsform, Ast-Winkel, Kronen-Umriss, Rinde): Tanne kegelig mit waagrechten Etagen ↔ Kiefer mit freiem rötlichem Stamm und Schirm-Krone; Erle als Baum mit Stamm. Der Prüfer bin nicht du (Bauer ≠ Prüfer): du lieferst je Gattung ein Bildpaar vorher ↔ nachher an fester Pose, ich fahre Blatt 3.
- Vorprüf-Kopf wie bisher: Betreff endet `[gpu-probe: ≤ 4 Tore] [ci voll]`, `check:statik` ganz, `probeUrteil` je Probe-Tor, `zug.sh probe-tag` sagt OK. Karte 2 steht bei 134 von 1 718.

## 26.11. 21:42 — GPU-PROBE 9dbca78f auf gtx1050-desktop: GRÜN in 1716 s (gate:pruefbuehne-licht GRÜN 185 s auf gtx1050-desktop · gate:weltbild-frost:echt GRÜN 713 s auf gtx1050-desktop · gate:studio-begehen GRÜN 493 s auf gtx1050-desktop · gate:webgl-probe GRÜN 100 s auf gtx1050-desktop) → probe-post/wind-boee-haus/9dbca78f.md

## 26.11. 20:10 Koordinator — START-BRIEF (Welle 27.11.; dieser Abschnitt ist dein Auftrag, lies ihn GANZ)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Arbeite nach IPERKA (`.claude/agents/champion.md`). Dann das
Regel-Blatt `git show origin/koordination:cloud-post/welle-2611-regeln.md` (bindend) und `cloud-post/alle.md`.

**Deine zwei Sprossen (Karte 2, beide rot an der Radeon, Runde 39, Kopf 99649186) — EIN Täter, EIN Schnitt:**

1. `karte2.leben.pflanzen.kraft#2` — Wortlaut der Station: „ROT: S2 laufzeitAbw 23,741 % gegen Soll ≤ 20 % ✗ · Täter:
   stamm/stoff-material.js _windAt (die Böe wandert mit ω/k, nicht mit dem Wind) · gemessen vor dem Wurf der Leiter nach 12,019 s:
   der Deckel der Leiter 12 s“
2. `karte2.planet.kopplung.stadtklima#1` — Wortlaut der Station: „ROT: S1 abweichungGrad 1,976 ° gegen Soll ≤ 20 ° ✓ · der Zeuge der
   Welt fehlt: die Pfütze trocknet im Schatten nicht später (Trocken-Zeit Schatten ÷ Sonne 0) · Täter: stamm/stoff-material.js
   _windAt (liest keine Häuser)“

**Gelesen am main 4a188bf2:** `_windAt(x, z, t, aus)` steht in `stamm/stoff-material.js:370`, sein Leser der Wiege bei :453/:462.
Die Stationen (Richter, NIE im Spiel-Zweig ändern): `meisterkarte-quelle/punkte/stationen/k2-leben.js` (KR_ID „leben.pflanzen.kraft“,
:22) und `k2-zusammenspiel.js` (E „planet.kopplung.stadtklima“, :22) im Zweig `punkte-maschine` — lies beide Leitern GANZ, bevor du
schneidest: was genau ist „laufzeitAbw“ (zwei Messpunkte, Laufzeit der Böe gegen Weg ÷ Windgeschwindigkeit?) und welcher Leser trägt
die „Trocken-Zeit“ der Pfütze (das Pfützen-Gesetz: gelaende-core `muldeEcken`, `stamm/gelaende-boden.js:2607`, `_pfuetzeKnoten`).
Das habe ich NICHT gelesen — nur die rote Zeile und die Fundstellen.

**Was die Zeilen verlangen (meine Lesart, an der Quelle zu prüfen):**
- Die Böe ist ein Stück Luft: sie wandert MIT dem Wind (Advektion, Taylor-Hypothese der eingefrorenen Turbulenz), nicht mit der
  Phasengeschwindigkeit ω/k ihres Rauschens. Das Gesetz bekommt ein Band aus einer äußeren Quelle mit Zahl (Kandidaten zum Nachlesen:
  Taylor 1938; Kaimal & Finnigan 1994 zur Konvektionsgeschwindigkeit der Böen) — zitiert an der Quelle, nicht aus dem Gedächtnis.
- Häuser stehen im Wind UND in der Sonne: derselbe `_windAt` kennt den Windschatten der Bauten, und die Pfütze im Schatten trocknet
  später als die in der Sonne (Verdunstung aus Strahlung + Wind; Kandidat: Penman 1948). EIN Leser — kein zweiter Wind neben
  `_windAt`, kein Schalter, kein fail-soft. Der Zeuge der Station ist das Verhältnis Trocken-Zeit Schatten ÷ Sonne (heute 0).
- Der Hinweis „gemessen vor dem Wurf der Leiter nach 12,019 s: der Deckel der Leiter 12 s“ ist eine Sache der Station, nicht deine:
  nenne ihn im Blatt, ändere den Richter nicht.

**Kosten:** `_windAt` läuft je Halm- und Blatt-Leser — der Schnitt bindet die Kosten an Schirm + Änderung (kein Strahl je Aufruf gegen
alle Bauten; lies, welches Raster der Bauten das Spiel schon trägt). Zahl vorher ↔ nachher (ms je Frame an derselben Pose) ins Blatt.

**Abgabe:** Zweig `wind-boee-haus` auf dem heutigen `origin/main`; EIN glatter Vorprüf-Kopf, Betreff
`Vorprüfung wind-boee-haus <n> (auf main <kopf8>): <vorher → nachher mit Zahl> [gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen, gate:webgl-probe] [ci voll]`
(höchstens vier Tore, je ≤ 480 s); `npm run check:statik` GANZ vor dem Schub; `sh artifacts/profiband/werkzeug/zug.sh probe-tag`
muss OK sagen; kein PR, keine Versions-Stufe, kein Siegel-Wort (fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU). Im Rumpf je
Sprosse eine Zeile: Station gefahren (wo, Wortlaut) oder „Station nicht gefahren: <Grund>“ — der Vor-Richter (Gerät mit GPU) fährt
sie am Kopf und schreibt das Urteil hierher.

**Wartezimmer:** nach dem Vorprüf-Kopf NICHT enden — bis zu 4 h alle ≤ 9 min `git fetch -q origin koordination main` und dieses Blatt
auf einen neuen Abschnitt „## … Koordinator“ prüfen, Post abarbeiten, weiter warten. Dein Stand-Blatt: `cloud-post/wind-boee-haus.md`
in DEINEM Zweig (oberster Abschnitt = jüngster Stand).
