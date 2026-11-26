## 26.11. 19:48 Koordinator — START-BRIEF (Welle 27.11.; dieser Abschnitt ist dein Auftrag, lies ihn GANZ)

## 26.11. 22:06 — GPU-PROBE a85350d0 auf gtx1050-desktop: ROT in 1157 s (bild:wiese@0.5 ROT 9 s — ROT: die Werkbank endete vor dem Start auf gtx1050-desktop · gate:pruefbuehne-licht GRÜN 104 s auf gtx1050-desktop · gate:tag-achse:echt GRÜN 276 s auf gtx1050-desktop · gate:studio-begehen GRÜN 490 s auf gtx1050-desktop · gate:webgl-probe GRÜN 101 s auf gtx1050-desktop) → probe-post/landmarken-geologie-8/a85350d0.md

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

# Sitzung: „Heimholer Landmarke: Wurf je Saat auf main“ (wegfindung#1)
- Sprosse: `karte2.erleben.spieler.wegfindung#1` · Zweig `landmarken-geologie-8` (Basis: heutiges `origin/main`, Code-Stand 4a188bf2) · Wartezimmer `cloud-post/landmarken-geologie-8.md` in koordination · Regel-Blatt `cloud-post/welle-2611-regeln.md`.
- Arbeite nach IPERKA (`.claude/agents/champion.md`); lade `.claude/skills/anazh-lehren/SKILL.md` vor Stamm-Code.

## DIE ROTE ZEILE (Station, Kopf 99649186, GTX 1060, Runde 39, 26.11.) — wörtlich
„ROT: S1 · ROT Leser fehlt: der Wurf der Landmarke ist keine Funktion der Saat: stamm/vegetation-baum.js:1482 _vegetationSampleSpawn liest die geladene Welt (_saatJe → worldMeta.seed, _landAt, _hydroDistAt, _voxelSurfaceY) — gemessen 1 von 51 Adressen (die geladene anazh-realm-seed: 0 Landmarken in 1–3 km, im Kegel-Anteil 0) · Fächer 1/51 Adressen (50 Saaten + 1) in 2 ms · Leser stamm/vegetation-baum.js:2607 · Gesetz stamm/vegetation-baum.js:1534 Landmarken-Pass · 50 ohne Fähigkeit (…) · schlechteste {"saat":"anazh-realm-seed"} n13 0 · Bild dort Saat anazh-realm-seed an der Wiese, ego, Blick in den Kegel der Landmarke (Kontrast im Bild) · ungemessen: Kontrast ≥ 0,1 der Landmarke gegen ihren Grund (ein Bild je Saat, am Gerät) (verlangt 50 Saaten der Sitzung, die Welt erzeugte 1)“

Soll der Station wörtlich (Zweig `punkte-maschine`, stationen/k2-erleben.js:396 ff.): `anteil_landmarke` ≥ 0,9, „Kontrast ≥ 0,1, ≥ 0,9“ · Umfang „N = 50 Saaten“.

## DER TÄTER (gelesen am main 4a188bf2) und WER IHN SCHON GESCHNITTEN HAT
- main: `stamm/vegetation-baum.js:1482` `_vegetationSampleSpawn` (Ruf :2650) und `:2565` `_rollGenome(\`${_saatJe(this)}|cx,cz\`, "landmarke")` — der Wurf liest nur die geladene Saat. Dazu sperrt die Station selbst: `LANDMARKE_AN` gibt für jede Saat ≠ `worldMeta.seed` sofort „fehlt“ zurück (k2-erleben.js:17–19) — ohne Stations-Kandidat bleibt es 1 von 51, was das Spiel auch kann.
- Geschnitten, NICHT gelandet: die Sitzung landmarken-geologie-3…7, letzter Kopf `origin/landmarken-geologie-7` 65cd4581 (WIP, Basis buendel-mittag 214e8da8, letzte Post 14:20 „Wartezimmer 4 h ohne Post“). Ihr Blatt (`git show 65cd4581:cloud-post/landmarken-geologie-3.md`): K4-1 `_landmarkenDesChunks(cx, cz, welt)` (Wurf für jede gereichte Welt, Station 1 → 51 von 51 Adressen) · K4-2 `_luftDurchlass` · K5-1…K5-5 Felsturm/Felsbogen in Landmarken-Größe (0,48 m → 8–68,6 m), Fern-Hülle · K5-6 `_landmarkenFern` Wurf ≤ 764 m → 3 000 m (an der Heimat 11 Würfe in 1–3 km). Offen dort: C₀ der Landmarke (Leuchtdichte des Himmels als CPU-Leser fehlt), Bild auf echter GPU.
- Der Stations-Kandidat: `origin/landmarken-station` 2096875d („die Landmarke im Bild statt im Bauplan — sichtbar 34 → 0 von 51 … das Gesetz wirft 720 in 1–3 km“), gemessen VOR K5.

## AUFTRAG: heimholen, nicht neu bauen
1. `git fetch origin landmarken-geologie-7 landmarken-station`; lies Blatt und Diff ganz. Der Kopf wird EIN glatter Commit der Arbeit K4–K5 auf dem heutigen `origin/main` (merge-tree zuerst; der Teil K1–K3 liegt schon in main über buendel-mittag).
2. Den Stations-Kandidaten auf den Stand nach K5 heben (`cloud-post/landmarken-geologie-8-station/`): `LANDMARKE_AN` ruft für jede Saat den EINEN Werfer des Spiels (`_landmarkenDesChunks` mit der Lage `_gelaende(saat)` — die gibt es seit spanne-auge am main, stamm/gelaende-boden.js:837) und zählt sichtbare Landmarken in 1–3 km; die Stichprobe an der geladenen Saat geht durch den Leser des Spiels und muss gleich sein.
3. Der Kontrast C₀·Durchlass (Koschmieder 1924) bleibt Gerät: die Station misst ihn am Bild — das ist der Vor-Richter, nicht du.

## IPERKA — das Band
Steht schon im Blatt (Sächsische Schweiz N = 233, Median 20 m; Prebischtor/Kuhstall; Koschmieder). Neu zu belegen nur, was dein Heimholen ändert; ein Band mit N = 2 (Bögen) bleibt als „offen“ mit Grund stehen.

## ABGABE
- Beleg: `gate:phyto-core` Messnamen „LANDMARKE Fern-Wurf an (0, 0)“ und „LANDMARKE IM BILD … gezeichnet“ GRÜN am Kopf; der Kandidat headless an 51 Adressen mit Zahl; Station nicht gefahren: GPU → Vor-Richter fährt `wegfindung#1` mit Kandidat.
- Probe-Ruf: `bild:wiese@0.5` (der Messort der Station) · `gate:pruefbuehne-licht` · `gate:tag-achse:echt` (berührt der Diff `stamm/bild-himmel.js`) · `gate:studio-begehen` (berührt er `foundry-core.js`/`stamm/studio-bruecke.js`) — höchstens vier, `probe-tag` entscheidet.
- Ehrlich offen: Kontrast C₀ als CPU-Leser; das Bogen-Band N = 2.

## PFLICHT (Regel-Blatt `cloud-post/welle-2611-regeln.md` in koordination GANZ lesen — die Abschnitte 13:10 und 10:27 zählen; Karte 2 steht heute bei 130, nicht 119)
- Briefkasten: lies alle ~30 min und vor jedem Push `git fetch -q origin koordination && git show origin/koordination:cloud-post/landmarken-geologie-8.md` und `…/alle.md` (oberster Abschnitt `## … Koordinator`). Vor dem ersten Schnitt einmal.
- Station: je beanspruchter Sprosse eine Zeile im Rumpf `karte2.…#n · GRÜN|ROT · <Wortlaut>`. Alle Stationen der Karte sind GPU-Stationen; in der Wolke stürzt der GPU-Prozess ab (kultur-aus-klima, 26.11.) → schreibe „Station nicht gefahren: GPU“ und daneben den Rumpf der Station headless (Null-Renderer) mit Zahl. Der Vor-Richter (GTX 1050) fährt sie am Vorprüf-Kopf, sein Urteil kommt in deinen Briefkasten (≤ 15 min). ROT dort = weiter schneiden, neuer Kopf. In den Betreff nur, was grün liest.
- Stations-Änderung NIE im Spiel-Zweig: Kandidat unter `cloud-post/landmarken-geologie-8-station/` (Diff gegen `origin/punkte-maschine` + BEGRUENDUNG.txt), drei Wände: `node punkte.cjs liste` (Basis genau zwei ROT `gelaende.K2#1/#2` „Wand HAKEN“) · Leiter ≤ 60 s · Fächer im Kern behält eine Stichprobe durch den Leser des SPIELS. Du änderst NIE ein Soll und nie den Richter-Text; hältst du ein Soll für falsch, steht es mit Quelle im Blatt — ich entscheide.
- IPERKA: eine äußere Quelle mit Zahl wird das Band des Gesetzes, zitiert im Kern in EINER Zeile (Autor, Jahr, Zahl) und im Commit-Rumpf; nie ein kopiertes Asset; Suchen ohne Projekt- und Personennamen.
- Schnitt: EINE Wurzel, kein Flag, kein Zwilling, kein stiller Rückfall; Kosten an Schirm und Änderung, nie an Weltgröße. Keine Konstante an der Zeile `AnazhRealm.VERSION` (stamm/dirigent-kern.js). Kein Feld am Spiel, das eine Siedlung überlebt. Fremde Zeilen nicht umformatieren.
- Linse (Gebot 10): bestehende Familie, vorher ROT am Täter, Selbsttest mit gepflanztem Täter; Selbsttest-Zeilen nennen die Mutante mit „→ ROT“/„ist ROT“ oder ✅, nie ein bloßes „ROT“.
- Vor dem Push, alles GRÜN, beim Namen im Blatt: `npm run check:statik` GANZ (≈ 6 min; `npm run check` bleibt lokal verboten) · `node scripts/stamm-umzug.cjs --nach-karte` nach jeder neuen Stamm-Methode · `npm run format:check` · `npm run lint` · jede Linse der Familie aus `.github/workflows/check.yml` (`grep -i` nach dem Familien-Wort) GANZ, ohne `--nur-…` · ein Pfad aus einem anderen Zweig in `cloud-post/…` trägt im SELBEN Satz „Zweig `punkte-maschine`“.
- Kopf: `git fetch origin main` · `git merge-tree --write-tree origin/main HEAD` Exit 0 (bei Konflikt `git merge origin/main`, beide Seiten ganz) · dann EIN glatter Commit auf dem heutigen `origin/main` (`git reset --soft origin/main && git commit`) · Betreff GENAU `Vorprüfung landmarken-geologie-8 <n> (auf main <kopf8>): <vorher → nachher mit Zahl> [gpu-probe: …] [ci voll]` · keine Versions-Stufe · kein PR.
- Probe-Ruf: Pflicht, sobald der Diff `stamm/`, `worlds/`, `index.html` oder eine `*.js` der Wurzel berührt; höchstens VIER Proben, jedes Tor ≤ 480 s Cloud-Zeit (`spec/ci/ci-zeiten.json`; zu lang z. B. gate:kreatur-takt 2567 s, gate:fahr-leben 982 s, gate:settlement 570 s — die richtet `[ci voll]`), mindestens ein Tor neben gate:webgl-probe; `sh artifacts/profiband/werkzeug/zug.sh probe-tag landmarken-geologie-8@<sha>` muss „PROBE-TAG OK“ sagen; vorher `probeUrteil` (`scripts/lib/urteil-zeile.cjs`, wie `.github/workflows/gpu-probe.yml` ihn ruft) über das Log jedes lokal gefahrenen Tors → GRÜN mit 0 roten Zeilen. Das Urteil steht in `probe-post/landmarken-geologie-8/<sha8>.md` (koordination); SIEH das Bild selbst an.
- Prozesse: beende nur eigene PIDs, nie chrome.exe/node.exe nach Muster.
- KEIN Siegel-Wort irgendwo (Betreff, Rumpf, WIP, Blatt): fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU.
- Stand-Blatt `cloud-post/landmarken-geologie-8.md` in DEINEM Zweig, früh geschoben (nach der Täter-Zahl), WIP-Commits mit `[skip ci]`.

## WARTEZIMMER (nach dem Vorprüf-Kopf NICHT enden)
Bis zu 4 h: je Schritt ≤ 9 min (`sleep 270`, zweimal), dann `git fetch -q origin koordination main` und prüfe (a) den Briefkasten auf einen neuen Abschnitt `## … Koordinator`, (b) `probe-post/landmarken-geologie-8/`, (c) ob der Stempel `w28-landmarken-geologie-8` in `origin/main` liegt. Post abarbeiten (neuer glatter Kopf n+1), dann weiter warten; zwischen den Schritten die nächste rote Sprosse derselben Leiter beginnen. Ende nur bei „GELANDET“ oder „ENDE“ im Briefkasten oder nach 4 h ohne Post — vorher der letzte Stand im Blatt: Geschnitten · Gemessen (vorher → nachher) · Offen (Grund, Messname, Adresse) · Kopf (40 Zeichen) · beanspruchte Sprossen (voller Name) · Karte 2 gebucht <n> von 1 718 · Status ZWISCHENSTAND.
