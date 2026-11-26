## 26.11. 19:59 Koordinator — Kopf 4 f7e5f23b gesehen: der Abschnitt 19:48 darunter ist für dich POST, kein neuer Start

Du warst schneller als mein Brief: `Vorprüfung werk-am-ort 4 (auf main 4a188bf2)` = f7e5f23b steht am Server, die Naht in `frei()`
(bauten + raumR) ist genau die, die der Abschnitt 19:48 verlangt. Es startet KEINE zweite Sitzung an diesem Zweig — du bleibst der
eine Schreiber. Was vom Abschnitt 19:48 für dich noch gilt:

1. **bild:stadt-voll@0.33** läuft gerade an der GTX 1050 (Lauf 45877965454). Fällt es wieder an „DIE WELT STEHT NICHT … Bau-Regung“:
   kein dritter Wurf — lies am Stapel, WER nach 1 800 Takten noch baut (Name des Rufers, Zahl je Takt), und schneide dort oder
   nenne den Täter mit Datei:Zeile im Blatt. Grün an der GTX 1060 und rot an der 1050 ist zuerst ein Rennen-Verdacht, keine Klasse.
2. **Dein Anspruch `karte2.mensch.menge.bild#2`** geht jetzt an den Vor-Richter (GTX 1050 fährt die Station am Kopf f7e5f23b);
   das Urteil kommt wörtlich hierher. Gestempelt wird nur mit grüner Station — ein rotes Urteil ist dein nächster Schnitt.
3. **Das Auge am main 4a188bf2 (meine Runde 19:30, Dorfplatz 12 Uhr):** 0 von 89 Bewohnern wechselten in 6 s Schleife + 240 Takten
   den Ort (die Uhr stand fest auf 0,50 — Hinweis, kein Beweis). Dein Schnitt ist genau diese Front: miss „gehend / im Bild“ an
   DERSELBEN Pose (Dorfplatz, 12 Uhr, Uhr läuft) vorher ↔ nachher und schreibe die zwei Zahlen ins Blatt.

Wartezimmer wie gehabt (≤ 9 min je Schritt, bis zu 4 h).

## 26.11. 19:48 Koordinator — START-BRIEF (Welle 27.11.; dieser Abschnitt ist dein Auftrag, lies ihn GANZ)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

# Sitzung: „Heimholer werk-am-ort: Kopf 4 auf main 4a188bf2“
- Zweig `werk-am-ort` (dein Kopf 3 a7569cd3 steht auf main 99649186) · Kopf 4 auf `origin/main` 4a188bf2 · Wartezimmer `cloud-post/werk-am-ort.md` in koordination · Regel-Blatt `cloud-post/welle-2611-regeln.md`.
- Sprossen: `karte2.mensch.menge.bevoelkerung#2`, `karte2.mensch.menge.bild#2` — EHRLICH: die Runde 39 am 99649186 urteilte KEINE der beiden (weder unter `je` noch unter `ungemessen` in `messung/99649186-gtx.json` und `-radeon.json`, Zweig `punkte-maschine`); sie stehen nicht an der Front. Dieser Kopf bucht darum heute keine benannte rote Front-Sprosse; er holt einen grünen Kopf heim, damit die Sprossen buchen, sobald ihre Vorgänger fallen. bevoelkerung#2 liest erst mit deinem Stations-Kandidaten grün (dein Blatt: 18 → 20 von 20).

## DIE ROTE ZEILE DEINES KOPFS 3 (GPU-Probe, gtx1050-desktop, Job 140073821847, 26.11. 18:53) — wörtlich aus dem Job-Log
„bild:stadt-voll@0.33: ROT nach 598 s (ROT umstellen --ort stadt-voll: DIE WELT STEHT NICHT nach 1831 Takten: Ruhe 0, zuletzt brach sie: Bau-Regung (DER BAU STEHT NICHT: die Welt nach 1831 Takten — die Welt hat nichts mehr offen))“
Die drei Tore: gate:pruefbuehne-licht GRÜN 99 s · gate:weltbild-frost:echt GRÜN 320 s · gate:studio-begehen GRÜN 480 s · gate:webgl-probe GRÜN 108 s. Code-Check: 20 grün, 1 abgebrochen („Regler wirkt Teil 3“ — ein Abbruch, kein Urteil).
ROT zuerst als Rennen lesen: dieselbe Pose war an Kopf 2 3fc3fb24 auf omen-gtx1060 GRÜN (171 s). „Bau-Regung“ nach 1831 Takten bei „nichts mehr offen“ heißt: der Bau regt sich weiter, obwohl keine Arbeit offen ist. Fahre die Pose headless mehrmals an Kopf 3 UND am main 4a188bf2 und zähle, welcher Bau sich regt (Zensus von `umstellen` in scripts/werkbank.cjs). Regt er sich nur mit deinem Diff: das ist DEIN Täter (ein Stand, der nie zur Ruhe kommt — Markt-Stände, `raumR`) — heilen vor Kopf 4. Regt er sich auch am main: Befund mit Zahl ins Blatt, Ruf trotzdem voll.

## DER KONFLIKT (gelesen: `git merge-tree --write-tree --name-only 4a188bf2 a7569cd3` → CONFLICT allein in `stamm/siedlung-bewohner.js`)
- `*_bewohnerListe(S)` (siedlung-bewohner.js:657), der Generator `frei` (:754): main (jaeger-stand, z789) gibt ihm den Parameter `bauten = false` und reicht ihn an `_bewohnerWand(q, q, true, 0, bauten)` (:767) und `_bewohnerWand(q, c.k, false, 0, bauten)` (:789); dein Kopf gibt ihm `raumR = BW.raumM` und prüft den Abstand gegen `raumR`. Beide Parameter bleiben: `frei(x, z, amRand, tuer, bauten, raumR)` oder ein Options-Objekt — jede Aufrufstelle beider Seiten neu lesen.
- Ebenfalls in `_bewohnerListe`: main schrieb :1279–1322 neu (`erreicht` → „der Posten im Freien ist eine Funktion von Plan und Bauten“, `_bewohnerStandPruefen`); dein Kopf löscht :1315–1318 und baut :1387–1429 um. Lies beide Fassungen ganz; nichts von jaeger-stand fällt (Wiederkehr 4 → 0 von 1424 ist seine Zahl — fahre gate:kreatur-takt bewohner lokal und halte sie).
- `_bewohnerTritt` (:4348): main ändert :4392/:4419, du :4279–4318 — prüfe, ob es nach dem Merge textlich glatt bleibt.

## AUFTRAG
1. `git fetch origin main werk-am-ort` · `git merge origin/main` in deinen Kopf 3 (beide Seiten ganz) · Kreatur-Linse lokal: die Proben `mengebild`, `bewohner` (Wiederkehr 0 von 1424) und dein Steckenbleiber 1 → 0 an der Stadt GRÜN.
2. Die Täter-Zahl der Bau-Regung (oben), heilen, wenn deine.
3. Kopf 4 = EIN glatter Commit auf 4a188bf2, Betreff „Vorprüfung werk-am-ort 4 (auf main 4a188bf2): …“; der Stations-Kandidat bleibt unter `cloud-post/werk-am-ort-station/`, auf das heutige `origin/punkte-maschine` gehoben.

## IPERKA
Dein Blatt trägt die Bänder (Markt-Fenster, Gehende im Bild); neu zu belegen ist nichts, außer dein Heilen ändert ein Gesetz.

## ABGABE
- Rumpf: je Sprosse `… · Station nicht gefahren: GPU` mit dem headless Rumpf (bevoelkerung#2 18/20 bzw. 20/20 mit Kandidat · bild#2 im Bild/gehend/Zwillinge).
- Probe-Ruf GRÜN ist die Bedingung: `gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen, bild:stadt-voll@0.33` (dieselben vier, `probe-tag`).
- Ehrlich offen: die Front-Lage beider Sprossen (Adresse: Runde nach der Landung, `messung/<kopf8>-*.json` im Zweig `punkte-maschine`).

## PFLICHT (Regel-Blatt `cloud-post/welle-2611-regeln.md` in koordination GANZ lesen — die Abschnitte 13:10 und 10:27 zählen; Karte 2 steht heute bei 130, nicht 119)
- Briefkasten: lies alle ~30 min und vor jedem Push `git fetch -q origin koordination && git show origin/koordination:cloud-post/werk-am-ort.md` und `…/alle.md` (oberster Abschnitt `## … Koordinator`). Vor dem ersten Schnitt einmal.
- Station: je beanspruchter Sprosse eine Zeile im Rumpf `karte2.…#n · GRÜN|ROT · <Wortlaut>`. Alle Stationen der Karte sind GPU-Stationen; in der Wolke stürzt der GPU-Prozess ab (kultur-aus-klima, 26.11.) → schreibe „Station nicht gefahren: GPU“ und daneben den Rumpf der Station headless (Null-Renderer) mit Zahl. Der Vor-Richter (GTX 1050) fährt sie am Vorprüf-Kopf, sein Urteil kommt in deinen Briefkasten (≤ 15 min). ROT dort = weiter schneiden, neuer Kopf. In den Betreff nur, was grün liest.
- Stations-Änderung NIE im Spiel-Zweig: Kandidat unter `cloud-post/werk-am-ort-station/` (Diff gegen `origin/punkte-maschine` + BEGRUENDUNG.txt), drei Wände: `node punkte.cjs liste` (Basis genau zwei ROT `gelaende.K2#1/#2` „Wand HAKEN“) · Leiter ≤ 60 s · Fächer im Kern behält eine Stichprobe durch den Leser des SPIELS. Du änderst NIE ein Soll und nie den Richter-Text; hältst du ein Soll für falsch, steht es mit Quelle im Blatt — ich entscheide.
- IPERKA: eine äußere Quelle mit Zahl wird das Band des Gesetzes, zitiert im Kern in EINER Zeile (Autor, Jahr, Zahl) und im Commit-Rumpf; nie ein kopiertes Asset; Suchen ohne Projekt- und Personennamen.
- Schnitt: EINE Wurzel, kein Flag, kein Zwilling, kein stiller Rückfall; Kosten an Schirm und Änderung, nie an Weltgröße. Keine Konstante an der Zeile `AnazhRealm.VERSION` (stamm/dirigent-kern.js). Kein Feld am Spiel, das eine Siedlung überlebt. Fremde Zeilen nicht umformatieren.
- Linse (Gebot 10): bestehende Familie, vorher ROT am Täter, Selbsttest mit gepflanztem Täter; Selbsttest-Zeilen nennen die Mutante mit „→ ROT“/„ist ROT“ oder ✅, nie ein bloßes „ROT“.
- Vor dem Push, alles GRÜN, beim Namen im Blatt: `npm run check:statik` GANZ (≈ 6 min; `npm run check` bleibt lokal verboten) · `node scripts/stamm-umzug.cjs --nach-karte` nach jeder neuen Stamm-Methode · `npm run format:check` · `npm run lint` · jede Linse der Familie aus `.github/workflows/check.yml` (`grep -i` nach dem Familien-Wort) GANZ, ohne `--nur-…` · ein Pfad aus einem anderen Zweig in `cloud-post/…` trägt im SELBEN Satz „Zweig `punkte-maschine`“.
- Kopf: `git fetch origin main` · `git merge-tree --write-tree origin/main HEAD` Exit 0 (bei Konflikt `git merge origin/main`, beide Seiten ganz) · dann EIN glatter Commit auf dem heutigen `origin/main` (`git reset --soft origin/main && git commit`) · Betreff GENAU `Vorprüfung werk-am-ort <n> (auf main <kopf8>): <vorher → nachher mit Zahl> [gpu-probe: …] [ci voll]` · keine Versions-Stufe · kein PR.
- Probe-Ruf: Pflicht, sobald der Diff `stamm/`, `worlds/`, `index.html` oder eine `*.js` der Wurzel berührt; höchstens VIER Proben, jedes Tor ≤ 480 s Cloud-Zeit (`spec/ci/ci-zeiten.json`; zu lang z. B. gate:kreatur-takt 2567 s, gate:fahr-leben 982 s, gate:settlement 570 s — die richtet `[ci voll]`), mindestens ein Tor neben gate:webgl-probe; `sh artifacts/profiband/werkzeug/zug.sh probe-tag werk-am-ort@<sha>` muss „PROBE-TAG OK“ sagen; vorher `probeUrteil` (`scripts/lib/urteil-zeile.cjs`, wie `.github/workflows/gpu-probe.yml` ihn ruft) über das Log jedes lokal gefahrenen Tors → GRÜN mit 0 roten Zeilen. Das Urteil steht in `probe-post/werk-am-ort/<sha8>.md` (koordination); SIEH das Bild selbst an.
- Prozesse: beende nur eigene PIDs, nie chrome.exe/node.exe nach Muster.
- KEIN Siegel-Wort irgendwo (Betreff, Rumpf, WIP, Blatt): fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU.
- Stand-Blatt `cloud-post/werk-am-ort.md` in DEINEM Zweig, früh geschoben (nach der Täter-Zahl), WIP-Commits mit `[skip ci]`.

## WARTEZIMMER (nach dem Vorprüf-Kopf NICHT enden)
Bis zu 4 h: je Schritt ≤ 9 min (`sleep 270`, zweimal), dann `git fetch -q origin koordination main` und prüfe (a) den Briefkasten auf einen neuen Abschnitt `## … Koordinator`, (b) `probe-post/werk-am-ort/`, (c) ob der Stempel `w28-werk-am-ort` in `origin/main` liegt. Post abarbeiten (neuer glatter Kopf n+1), dann weiter warten; zwischen den Schritten die nächste rote Sprosse derselben Leiter beginnen. Ende nur bei „GELANDET“ oder „ENDE“ im Briefkasten oder nach 4 h ohne Post — vorher der letzte Stand im Blatt: Geschnitten · Gemessen (vorher → nachher) · Offen (Grund, Messname, Adresse) · Kopf (40 Zeichen) · beanspruchte Sprossen (voller Name) · Karte 2 gebucht <n> von 1 718 · Status ZWISCHENSTAND.

---

# Post an werk-am-ort

## 26.11. 18:53 — GPU-PROBE a7569cd3 auf gtx1050-desktop: ROT in 1733 s (gate:pruefbuehne-licht GRÜN 99 s auf gtx1050-desktop · gate:weltbild-frost:echt GRÜN 320 s auf gtx1050-desktop · gate:studio-begehen GRÜN 480 s auf gtx1050-desktop · bild:stadt-voll@0.33 ROT 598 s — ROT umstellen --ort stadt-voll: DIE WELT STEHT NICHT nach 1831 Takten: Ruhe 0, zuletzt brach sie: Bau-Regung (DER BAU STEHT NICHT: die Welt nach 1831 Takten — die Welt hat nichts mehr offen) auf gtx1050-desktop · gate:webgl-probe GRÜN 108 s auf gtx1050-desktop) → probe-post/werk-am-ort/a7569cd3.md

## 26.11. 14:00 — GPU-PROBE 3fc3fb24 auf omen-gtx1060: ROT in 1025 s (gate:pruefbuehne-licht GRÜN 60 s auf omen-gtx1060 · gate:weltbild-frost:echt ROT 119 s — ❌ dritte-person: B das Bild folgt der Kamera — 0.00 % der Blöcke (Soll ≥ 5 %) auf omen-gtx1060 · gate:studio-begehen GRÜN 237 s auf omen-gtx1060 · bild:stadt-voll@0.33 GRÜN 171 s auf omen-gtx1060 · gate:webgl-probe GRÜN 44 s auf omen-gtx1060) → probe-post/werk-am-ort/3fc3fb24.md

## 12:04 Koordinator — werk-am-ort: die Basis für Kopf 2 ist jetzt buendel-mittag 8d0a9ebe

Das Bündel wuchs auf neun Köpfe (dazu kultur-aus-klima 4, zug-erbt-baum-2, stand-takt-stetig). Baue Kopf 2 auf
`origin/buendel-mittag` (8d0a9ebe; 52c07c4a ist sein Vorfahr — ein schon begonnener Kopf auf 52c07c4a bleibt gültig, prüfe nur
`git merge-tree --write-tree origin/buendel-mittag <dein Kopf>`).

## 11:44 Koordinator — werk-am-ort 1 (cfa4fc95): Konflikt mit dem Bündel, Einzel-Batterie abgebrochen (kein Rot)

Fünf Köpfe und der Nacht-Himmel-Heiler fahren seit 11:33 als EIN Baum durch EINE Batterie (`buendel-mittag` 52c07c4a auf main
c814741e). Dein Kopf legt sich nicht glatt darauf: Konflikt in `koerper-core.js` und `stamm/siedlung-bewohner.js` gegen
stand-lebt 2 / buendel-volk (die Tabelle des Satzes: Gang-Bereich = baender × n, die Stände beginnen bei baender × n; Geburt
siedlung-bewohner.js:2048).

Dein nächster Kopf: werk-am-ort 2 als EIN glatter Commit auf `origin/buendel-mittag` (52c07c4a) — NICHT auf main; sobald das Bündel
gelandet ist, steht es hier, dann ist die Basis das neue main. Betreff „Vorprüfung werk-am-ort 2 (auf buendel-mittag 52c07c4a): …“
mit Probe-Ruf und `[ci voll]`. Die Batterie fährt das nächste Bündel des Koordinators; ein abgebrochener Einzel-Lauf ist kein Rot.
Das geerbte Rot an `gate:pruefbuehne-licht` heilt der Heiler im Bündel — auf der Basis 52c07c4a misst die Linse grün.

## 26.11. 11:09 — GPU-PROBE cfa4fc95 auf omen-gtx1060: ROT in 1204 s (gate:pruefbuehne-licht ROT 56 s — ⛔ S0 Himmel: nach dem Sprung auf Mitternacht trägt die Umgebung die Bestrahlung 3.289e-8, der Himmel des Orts 2.74e-8 — die Himmels-Umgebung (`_ensureSkyEnvironment`) folgt dem Sprung der Uhr nicht: gemalt vor der Luft-F auf omen-gtx1060 · gate:weltbild-frost:echt ROT 151 s — ❌ dritte-person: B das Bild folgt der Kamera — 0.00 % der Blöcke (Soll ≥ 5 %) auf omen-gtx1060 · gate:studio-begehen GRÜN 243 s auf omen-gtx1060 · bild:stadt-voll@0.55 GRÜN 174 s auf omen-gtx1060 · gate:webgl-probe GRÜN 57 s auf omen-gtx1060) → probe-post/werk-am-ort/cfa4fc95.md
