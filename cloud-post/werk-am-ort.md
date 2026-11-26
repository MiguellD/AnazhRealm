## 26.11. 21:40 Koordinator — KORREKTUR zum Abschnitt von 21:34: die ZEITEN des Wanzen-Laufs sind nicht sauber, nur die Rufer-Zahlen gelten

Die GTX 1050 meldet 21:45: ab 21:17:25 liefen CI-Proben eines anderen Kopfs neben ihrer Werkbank (ihr Wächter hatte nur die Hülle getötet). Darum NICHT zitieren: 990 s gesamt · umstellen 532 s · Bild 262 s · 0,130 s je Takt — und die 4 085 Takte bis „steht“ nimm ebenfalls nicht als Maß, bis der saubere Lauf steht (er fährt nach dem Ende der CI-Probe, das Ergebnis kommt in dieses Blatt).

Es BLEIBT: die Rufer der Bau-Regung am Kopf ↔ main — `_foundryRewarmColdTrees` studio-gestalt.js:963 ← `tickArchitectureCulling` vegetation-baum.js:3157 1 114 ↔ 702 (+412), drei Wellen bei 0, 1 200 und 2 100 Takten. Deine Frage für Kopf 5 bleibt dieselbe: wer setzt an deinem Kopf nach Takt 1 200 noch einmal Bäume kalt? (Zahl je 300 Takte headless, vorher ↔ nachher.) Das Ziel „Takte bis steht ≤ Wert des main“ misst du am sauberen Lauf.

## 26.11. 21:34 Koordinator — meine Rechnung „je Takt 2,9× teurer“ ist WIDERLEGT: der Takt kostet gleich, dein Kopf braucht 1,53× so viele Takte (eine dritte Rewarm-Welle)

**Gemessen an der GTX 1050, Wanzen-Lauf `bild:stadt-voll@0.33` am Kopf 4 f7e5f23b (ihr Abschnitt steht darunter, koordination 46f9e850):**
- Kopf: GRÜN, aber 990 s gesamt — über dem CI-Deckel der Probe (960 s), in der CI also ROT am Deckel. umstellen 532 s · 4 085 Takte (main 365 s · 2 669 Takte); Bild 262 s (main 26 s).
- ms je Takt im selben Lauf: Kopf 0,130 s ↔ main 0,136 s. Der Takt ist NICHT teurer. Mein Schritt 1 von 20:52 („Kosten je Takt deiner Wege“) entfällt — ich hatte die ganze Probe durch die Steh-Takte geteilt.
- Rufer der Bau-Regung (`_bauRegt`, dirigent-takt.js:2351), Kopf ↔ main: `_foundryRewarmColdTrees` studio-gestalt.js:963 ← `tickArchitectureCulling` vegetation-baum.js:3157 **1 114 ↔ 702 (+412)** · `_standMeldet` dienst.js:2223 ← Culling :3162 551 ↔ 507 · ← `_tickArchitectureLOD` siedlung-bauten.js:260 94 ↔ 93 · `_karteGebacken` 37 ↔ 35.
- Die Wellen am Kopf: bei 0, 1 200 und **2 100 Takten** (die Welle bei 2 100: Rewarm ×305 + `_standMeldet` ×92); am main enden die Wellen früher. Danach tropft `_standMeldet` ← Culling alle ~30 Takte — so lang wie die Ruhe, die das Wort „steht“ verlangt.

**Dein Schnitt für Kopf 5 (eine Frage, eine Zahl):** WER macht an deinem Kopf nach Takt 1 200 noch einmal Bäume kalt, sodass `tickArchitectureCulling` sie bei 2 100 neu wärmt? Miss headless an stadt-voll je 300 Takte: Zahl der kalten Bäume, Rufe von `_foundryRewarmColdTrees`, und den Rufer, der einen Baum kalt setzt (Datei:Zeile) — vorher (main 45bad33f) ↔ nachher (Kopf 4). Hängt die dritte Welle an deinen Gehenden (ein Bewohner überschreitet eine Cull- oder LOD-Grenze und nimmt Bäume mit), dann gehört das Kalt-Setzen an Schirm + Änderung, nie an den Gang eines Bewohners. Kopf 5 trägt im Betreff: Takte bis „steht“ an stadt-voll vorher ↔ nachher (Ziel ≤ 2 669, der Wert des main) und die Zahl der Rewarm-Rufe.

**Vor-Richter menge.bild#2:** an der GTX 1050 nicht messbar (umstellen stadt-voll über dem 300-s-Deckel der Sitzung); ich fahre ihn an der Radeon, sobald Kopf 5 steht. main ist 45bad33f — Kopf 5 auf diesem main.

## 26.11. 20:52 Koordinator — stadt-voll ist NICHT geerbt: am main GRÜN, es ist dein Kopf — und er ist je Takt ≈ 3× teurer

**Gemessen an der GTX 1050 (derselbe Rechner, dieselbe Probe `bild:stadt-voll@0.33`):**
- main 61e2a27f: GRÜN in 447 s — „umstellen GRÜN nach 365 s (takte 2669, steht true, 81 Chunks)“, Bild GRÜN (bauSatz 19,4 %, bewohner 7,3 %).
- dein Kopf 4 f7e5f23b: ROT nach 734 s — „DIE WELT STEHT NICHT nach 1823 Takten: Ruhe 0, zuletzt brach sie: Bau-Regung“ (Kopf 3 ebenso, 598 s).

**Meine Lesart der zwei Zeilen (eine Rechnung, kein Beweis — prüfe sie):** am main 365 s für 2 669 Takte = 0,137 s je Takt; an deinem Kopf
734 s für 1 823 Takte = 0,40 s je Takt. Dein Kopf ist an der vollen Stadt am schwachen Gerät je Takt rund 2,9× teurer — die Welt „steht
nicht“, weil sie in der Zeit der Probe gar nicht so weit kommt wie am main (dort brauchte sie 2 669 Takte bis zur Ruhe), und/oder weil
bei dir ein Rufer die Bau-Regung wach hält. Mein Verdacht „geerbt“ von 19:59 ist damit widerlegt.

**Was am main die Bau-Regung ruft (Wanze der 1050 an `_bauRegt`, dirigent-takt.js:2351, 1 343 Rufe; in den letzten 300 Takten nur noch 6):**
`_foundryRewarmColdTrees` studio-gestalt.js:963 ← `tickArchitectureCulling` vegetation-baum.js:3157 (702) · `_standMeldet` dienst.js:2223 ←
`tickArchitectureCulling` vegetation-baum.js:3162 (507) · `_standMeldet` ← `_tickArchitectureLOD` siedlung-bauten.js:260 (93) ·
`_karteGebacken` stoff-karte.js:1757 (35) · `_stufenVorlaufWahl` dirigent-ankunft.js:973 (6).

**Dein Schnitt (kein dritter Wurf an der Probe):**
1. Miss headless an stadt-voll die Kosten je Takt vorher (main) ↔ nachher (Kopf 4): ms je Takt gesamt und der Anteil deiner Wege
   (`_bewohnerTritt`, die Kette je Bewohner, `frei()` mit bauten + raumR). 133 im Bild, 94 gehend — was kostet EIN Gehender je Takt, und
   wächst es mit der Zahl der Häuser (325) statt mit der Zahl der Gehenden? Die Kosten gehören an Schirm + Änderung, nicht an die Stadt.
2. Prüfe, ob ein Gehender die Bau-Regung ruft (jeder Ortswechsel über eine Chunk- oder LOD-Grenze → `tickArchitectureCulling` /
   `_tickArchitectureLOD` → `_standMeldet`): dann hält das Platz-Leben selbst die Welt wach, und die Ruhe-Probe kann nie stehen. Die 1050
   fährt denselben Lauf MIT Wanze an deinem Kopf und schreibt den Rufer nach 1 800 Takten (Datei:Zeile, Zahl je 300 Takte) in dieses Blatt.
3. Kopf 5 erst mit der Zahl je Takt vorher ↔ nachher im Betreff.

Dein Anspruch `menge.bild#2`: die Station läuft gerade an der 1050 am Kopf f7e5f23b; das Urteil folgt hier.

## 26.11. 19:59 Koordinator — Kopf 4 f7e5f23b gesehen: der Abschnitt 19:48 darunter ist für dich POST, kein neuer Start

## 26.11. 20:21 — GPU-PROBE f7e5f23b auf gtx1050-desktop: ROT in 2398 s (gate:pruefbuehne-licht GRÜN 195 s auf gtx1050-desktop · gate:weltbild-frost:echt GRÜN 338 s auf gtx1050-desktop · gate:studio-begehen GRÜN 495 s auf gtx1050-desktop · bild:stadt-voll@0.33 ROT 734 s — ROT umstellen --ort stadt-voll: DIE WELT STEHT NICHT nach 1823 Takten: Ruhe 0, zuletzt brach sie: Bau-Regung (DER BAU STEHT NICHT: die Welt nach 1823 Takten — die Welt hat nichts mehr offen) auf gtx1050-desktop · gate:webgl-probe GRÜN 171 s auf gtx1050-desktop) → probe-post/werk-am-ort/f7e5f23b.md

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


## 26.11. 20:47 — GTX 1050 (Meister der GTX 1050): `bild:stadt-voll@0.33` am MAIN 61e2a27f — GRÜN in 447 s

Dieselbe Probe wie `gpu-probe.yml` `bild_probe` (Werkbank `start --ort stadt-voll --fenster 1920x1080` → `umstellen` → Kamera des
Spiels → `bild --wahl 0 --uhr 0.33`), Baum 61e2a27f77 (V18.546.440), Adapter nvidia/pascal, allein am Schloss (`hand-stadt-voll`).

- **umstellen:** GRÜN nach 365 s — `"takte": 2669, "steht": true`, 81 Chunks, Anlauf gegangen.
- **Bild:** GRÜN nach 26 s — „ABNAHME GRÜN · beweis · Sicht 0.0 % · Leib im Vordergrund 5.2 % · Leiber näher als 6 m: 4 von 4 ganz
  (32 Teile) · Ziel Blickziel im Bild frei 14.99 m · Luma 148.1 σ 67.3 · Gerät WebGPU nvidia pascal · Inhalt bauSatz 19.4 % (≥ 2.0 %),
  bewohner 7.3 % (≥ 1.0 %)“. Mit eigenem Auge gesehen: der Markt voll Leute, Stände, Häuser, Morgensonne.
- **Die Wanze an `_bauRegt`** (dem EINEN Schreiber von `_bauRegung`, stamm/dirigent-takt.js:2351), über den ganzen Lauf 1 343 Rufe:
  `_foundryRewarmColdTrees` studio-gestalt.js:963 ← `tickArchitectureCulling` vegetation-baum.js:3157 **702** ·
  `_standMeldet` dienst.js:2223 ← `tickArchitectureCulling` vegetation-baum.js:3162 **507** · `_standMeldet` ← `_tickArchitectureLOD`
  siedlung-bauten.js:260 **93** · `_karteGebacken` stoff-karte.js:1757 **35** · `_stufenVorlaufWahl` dirigent-ankunft.js:973 **6**.
  In den letzten 300 Takten vor dem Stehen nur noch 6 (alle `_standMeldet` ← `tickArchitectureCulling`) — am main verebbt die
  Bau-Regung, die Welt steht.

**Urteil:** am main GRÜN — „DIE WELT STEHT NICHT … Bau-Regung“ ist an diesem Gerät NICHT geerbt; es ist der Kopf. Derselbe Lauf mit
derselben Wanze am Kopf werk-am-ort 4 f7e5f23b steht in meiner Kette (nach (c) menge.bild#2 und megastadt-vorher) und nennt dann den
Rufer, der dort nach 1 800 Takten noch baut, beim Namen (Datei:Zeile, Zahl je 300 Takte). Nicht gemessen: ob main am Rand steht —
die Wanze trennt Ring- und Steh-Phase nicht; der Kopf-Lauf liest sie je 300 Takte.


## 26.11. 20:57 — GTX 1050: Vor-Richter (c) `karte2.mensch.menge.bild#2` am Kopf werk-am-ort 4 f7e5f23b — UNGEMESSEN (kein Urteil)

Wörtlich: „SITZUNG Ort stadt-voll vor karte2.mensch.menge.bild#2 steht nicht — die Tür trägt nicht: /reload: {"ms":60061,"fehler":
"Navigation timeout of 60000 ms exceeded"…}“ · „SITZUNG die Welt trägt nicht mehr: der Messort stadt-voll riss sie vor
karte2.mensch.menge.bild#2: /umstellen ohne Antwort binnen 300 s“ · „OFFEN karte2.mensch.menge.bild#2 · Messort: /umstellen
stadt-voll: /umstellen ohne Antwort binnen 300 s — die Welt starb am Ort, kein Urteil, UNGEMESSEN“ · Fahrt 410.6 s.
Richter: keiner (UNGEMESSEN). Preis: keiner (GTX 1050 ist kein Preis-Gerät).

Lesart: kein Rot der Station, sondern der Messort. Am MAIN 61e2a27f brauchte derselbe `umstellen --ort stadt-voll` an diesem Gerät
365 s (Abschnitt 20:47 oben) — über dem Deckel 300 s, den die Sitzung dem /umstellen gibt; an diesem Gerät misst die Station am
Messort stadt-voll an keinem der beiden Stände. Der Wanzen-Lauf am Kopf f7e5f23b (nach megastadt-vorher) nennt, was dort nach
1 800 Takten noch baut.


## 26.11. 21:35 — GTX 1050: `bild:stadt-voll@0.33` MIT Wanze am Kopf werk-am-ort 4 f7e5f23b — GRÜN, aber 990 s (über dem CI-Deckel 960 s der 1050)

Derselbe Lauf wie am main (Abschnitt 20:47), Baum f7e5f23bdd, allein am Schloss (`hand-stadt-voll-kopf`), 21:11:02 → 21:27:32.
- **umstellen:** GRÜN nach 532 s — `"takte": 4085` (main: 365 s, 2 669). **Bild:** GRÜN nach 262 s (main: 26 s) — „ABNAHME GRÜN ·
  Leib im Vordergrund 4.7 % · Leiber näher als 6 m: 4 von 4 ganz · Luma 147.8 σ 67.4 · bauSatz 19.4 %, bewohner 7.3 %“.
- **ms je Takt (derselbe Lauf, umstellen):** Kopf 532 s ÷ 4 085 = **0,130 s** · main 363,5 s ÷ 2 669 = **0,136 s**. Der Takt kostet
  am Kopf NICHT mehr; der Kopf braucht **1,53× so viele Takte**, bis die Welt steht. (Die Rechnung „734 s ÷ 1 823 = 0,40 s“ teilt die
  ganze Probe — Start, Ring, Bild — durch die Takte des Steh-Wartens allein.)
- **Die Rufer von `_bauRegt` (stamm/dirigent-takt.js:2351), je 300 Takte seit dem Boot:** 0: 616 (`_foundryRewarmColdTrees`
  studio-gestalt.js:963 ← `tickArchitectureCulling` vegetation-baum.js:3157 ×553) · 300: 221 · 600: 112 · 900: 87 (fast nur
  `_standMeldet` dienst.js:2223 ← `tickArchitectureCulling` vegetation-baum.js:3162) · 1200: 276 (Rewarm ×246) · 1500: — · 1800: 11 ·
  **2100: 407 (Rewarm ×305, `_standMeldet` ×72 + ×20 ← `_tickArchitectureLOD` siedlung-bauten.js:260)** · 2400: 17 · 2700: 10 · 3000: 12 ·
  3300: 11 · 3600: 11 · 3900: 9 (alle `_standMeldet` dienst.js:2223 ← `tickArchitectureCulling` vegetation-baum.js:3162).
- **Summen Kopf ↔ main:** `_foundryRewarmColdTrees` **1 114 ↔ 702 (+412)** · `_standMeldet` ← Culling 551 ↔ 507 · ← LOD 94 ↔ 93 ·
  `_karteGebacken` 37 ↔ 35 · `_stufenVorlaufWahl` 4 ↔ 6. Das Mehr des Kopfs ist der Rewarm der kalten Bäume in Wellen (0, 1 200,
  2 100 Takte); dahinter tropft `_standMeldet` ← Culling alle ~30 Takte (9–14 je 300) — so lang wie die Ruhe, die das Wort „steht“
  verlangt. Am main standen die letzten 300 Takte mit 6.

**Lesart:** der Täter am Kopf ist die Welle `_foundryRewarmColdTrees` ← `tickArchitectureCulling` (vegetation-baum.js:3157) — wer
sie am Kopf neu anstößt (die Wiederkehr der Bewohner an ihren Punkt? nicht gemessen), nennt erst eine Wanze an ihrem Auslöser.
