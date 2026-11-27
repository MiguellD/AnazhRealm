# Briefkasten stadt-bodenwert (neueste Nachricht oben)

## 27.11. 05:08 — GPU-PROBE d4c0829b auf radeon-890m: GRÜN in 889 s (gate:pruefbuehne-licht GRÜN 60 s auf radeon-890m · gate:weltbild-frost:echt GRÜN 132 s auf radeon-890m · gate:studio-begehen GRÜN 220 s auf radeon-890m · bild:stadt-voll@0.5 GRÜN 166 s auf radeon-890m · gate:webgl-probe GRÜN 56 s auf radeon-890m) → probe-post/stadt-bodenwert/d4c0829b.md

## 27.11. 00:23 Koordinator — START-BRIEF (dieser Abschnitt ist dein Auftrag, lies ihn GANZ)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

# Sitzung: „Viertel aus dem Bodenwert“ (stadt.form#2)
- Sprosse: `karte2.mensch.stadt.form#2` · Zweig `stadt-bodenwert` (Basis: `origin/main` des Moments, Code-Stand 38194f83) · Wartezimmer `cloud-post/stadt-bodenwert.md` · Regel-Blatt `cloud-post/welle-2611-regeln.md` (beide im Zweig koordination, zu lesen NUR über die rohe Adresse, siehe PFLICHT).
- Arbeite nach IPERKA (`.claude/agents/champion.md`); lade `.claude/skills/anazh-lehren/SKILL.md` vor Kern- oder Stamm-Code.
- Die Sprosse ist eine LÜCKE: form#3 trägt schon einen Punkt und zählt erst mit ihr — sie ist ZWEI wert. Karte 2 steht bei 135 von 1 718.

## DIE SPROSSE (Karte, wörtlich)
„Großstadt: Viertel aus dem Bodenwert · nicht aus einer Typen-Liste · Preis P · Straße · Richter: Blindtest Lage und Wohlstand aus 20 Straßenbildern ≥ 70 %“.

## DIE ROTE ZEILE (GTX 1060 und Radeon 890M am 2da17e2e) — wörtlich
„S2 ROT: Umfang nicht erzeugbar: Großstadt 10⁴ Häuser mit Vierteln aus dem Bodenwert: die Stadt trägt 307 stehende Häuser in 7 Vierteln; dorf 7 9310 steht erst nach ~154 s, über dem Deckel von 60 s (gemessen 307)“.
Den Umfang trägt inzwischen der Blind-Prüfer in EINER langen Sitzung (Stadt „dorf 7 9310“, 9 376 Häuser in 145 Kacheln; Fächer `vision/pruefer/faecher.cjs`, Zweig `punkte-maschine`). Offen ist die WAHRHEIT, gegen die er prüft.

## DER TÄTER (gelesen am main 38194f83, Blatt des Prüfer-Arbeiters 26.11. 23:56)
- `fachwerk-core.js:5267` `stadtPlan` → `{ R, g }`: je Kachel NUR die Zahl ihrer Häuser.
- `fachwerk-core.js:5348` `viertelWort` → seed · nH · epoche · erbe {region, jahr, spanne, samen, hoch} · ring.
- `fachwerk-core.js:5843` `wohl = (1,22 − 0,5 · i/(n − 1)) · (0,78 + 0,44 · Spiel)`: der Wohlstand eines Hauses ist sein RANG in der Liste SEINER Kachel — jede Kachel hat ihre eigenen Reichen und Armen. Kein Feld `bodenwert` in Stamm oder Kern. Die Stadt hat Dichte, aber kein Viertel: Lage und Wohlstand hängen nicht zusammen.
- Prüfe jede der drei Zeilen an der Quelle, bevor du schneidest (die Zeilennummern wandern mit jeder Landung).

## IPERKA — das Band
Wie fällt der Bodenwert realer Städte mit der Lage? Belege mit einer äußeren Quelle und Zahl: das Gebots-Renten-Gefälle vom Zentrum (Erreichbarkeit von Markt und Kern), der Aufschlag an Wasser, Platz und Aussicht, der Abschlag an Lärm, Gewerbe und Hang — und wie stark Hausgröße, Stockwerke, Stoff der Fassade und Parzellen-Breite dem Bodenwert folgen. Die Zahlen werden das Band des Gesetzes im Kern (EINE Zeile je Quelle: Autor, Jahr, Zahl), nie eine Typen-Liste und nie ein kopiertes Asset. Suchen ohne Projekt- und Personennamen.

## DER SCHNITT (an EINER Wurzel: der Plan der Stadt)
- Der Plan trägt den **Bodenwert als Feld** — eine Funktion von Saat und Lage (Kern-Nähe, Platz, Wasser, Hang, Rand), nicht ein Sack je Stadt: Kosten an Schirm und Änderung, nie an der Stadtgröße.
- Das **Viertel folgt aus dem Bodenwert** (zusammen mit Ring und Epoche): `viertelWort` und `wohl` LESEN das Feld. Der Rang in der Kachel bleibt nur die kleine Streuung um den Wert der Lage. Kein Flag, kein Zwilling neben `stadtPlan`, kein stiller Rückfall auf die alte Formel.
- **Sichtbar an der Straße:** der Richter ist ein Blindtest an Straßenbildern in Augenhöhe. Lies, welche Glieder des Hauses heute `wohl` lesen (Höhe, Breite, Stoff, Schmuck, Zustand, Parzelle, Straßenbreite) — was der Wohlstand nicht sichtbar bewegt, kann kein Prüfer lesen. Nenne im Blatt je Glied vorher ↔ nachher, was das Auge unterscheidet.
- **Die Wahrheit für den Prüfer:** der Plan gibt den Bodenwert je Kachel und je Haus über den Leser des SPIELS heraus (dieselbe Funktion, die das Haus liest) — der Fächer des Prüfers rechnet nichts nach. Liefere dafür den Kandidaten unter `cloud-post/stadt-bodenwert-station/` (Diff gegen `vision/pruefer/faecher.cjs` und, falls nötig, die Station im Zweig `punkte-maschine` + BEGRUENDUNG.txt): Lage in drei Klassen (Kern · Mitte · Rand) und Wohlstand in drei Klassen (arm · mittel · reich) als Wahrheit je Straßenbild.

## ABGABE
- Beleg vor dem Kopf, headless, mit Zahl im Rumpf des Commits: (1) Bodenwert gegen Abstand zum Kern über die Stadt „dorf 7 9310“ (Gefälle und Bestimmtheitsmaß gegen dein Band); (2) Wohlstand der Häuser gegen den Bodenwert ihrer Lage (Rang-Korrelation, vorher ≈ 0); (3) form#1 und form#3 bleiben grün am Rumpf IHRER Station (geschlossene Wand Kern ↔ Rand ≥ 2:1; exponentieller Fit R² ≥ 0,8, Höhen-Median Kern/Rand ≥ 5) — wörtliche Zeilen; (4) was sich am Messort `stadt-voll` (307 Häuser) und am Heimat-Dorf der Standard-Welt ändert: Häuser je Viertel vorher ↔ nachher.
- Station nicht gefahren: GPU → der Prüfer fährt das Blatt, der Vor-Richter die Stationen form#1/#3 am Vorprüf-Kopf.
- Probe-Ruf (der Diff berührt `fachwerk-core.js` und wohl `stamm/siedlung-*`): `gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen` und als vierte Probe `bild:stadt-voll@0.5`; `probe-tag` entscheidet.
- Ehrlich offen darf bleiben: form#4–#7 (eigene Stationen).

## PFLICHT
- Regel-Blatt GANZ lesen (Abschnitte 13:10 und 10:27 zählen): `https://raw.githubusercontent.com/MiguellD/AnazhRealm/koordination/cloud-post/welle-2611-regeln.md`.
- Briefkasten: lies alle ~30 min und vor jedem Push `https://raw.githubusercontent.com/MiguellD/AnazhRealm/koordination/cloud-post/stadt-bodenwert.md` und `…/cloud-post/alle.md` (oberster Abschnitt `## … Koordinator`) — NIE per `git fetch` des Zweigs koordination (er trägt > 17 GiB Geschichte und reißt in der Wolke). Stationen und den Fächer holst du als einzelne Datei über dieselbe rohe Adresse am Zweig `punkte-maschine`.
- WARTEZIMMER: nach der Abgabe NICHT enden — bis zu 3 h in Warte-Schritten von ≤ 9 min alle 5 min den Briefkasten auf einen neuen Abschnitt `## … Koordinator` prüfen, Post abarbeiten, wieder warten.
- Station: je beanspruchter Sprosse eine Zeile im Rumpf `karte2.…#n · GRÜN|ROT · <Wortlaut>`; in der Wolke stirbt der GPU-Prozess → „Station nicht gefahren: GPU“ und daneben der Rumpf der Station headless (Null-Renderer) mit Zahl. In den Betreff nur, was grün liest. Du änderst NIE ein Soll und nie den Richter-Text.
- Schnitt: EINE Wurzel, kein Flag, kein Zwilling, kein stiller Rückfall. Keine Konstante an der Zeile `AnazhRealm.VERSION` (stamm/dirigent-kern.js). Fremde Zeilen nicht umformatieren.
- Linse (Gebot 10): bestehende Familie, vorher ROT am Täter (Wohlstand folgt der Lage nicht), Selbsttest mit gepflanztem Täter; Selbsttest-Zeilen nennen die Mutante mit „→ ROT“ oder ✅, nie ein bloßes „ROT“.
- Vor dem Push, alles GRÜN, beim Namen im Blatt: `npm run check:statik` GANZ (`npm run check` bleibt verboten) · `node scripts/stamm-umzug.cjs --nach-karte` nach jeder neuen Stamm-Methode · `npm run format:check` · `npm run lint` · jede Linse der Familie aus `.github/workflows/check.yml` GANZ.
- Kopf: `git fetch origin main` · `git merge-tree --write-tree origin/main HEAD` Exit 0 · EIN glatter Commit auf dem `origin/main` des Moments · Betreff GENAU `Vorprüfung stadt-bodenwert <n> (auf main <kopf8>): <vorher → nachher mit Zahl> [gpu-probe: …] [ci voll]` · keine Versions-Stufe · kein PR.
- Probe-Ruf: höchstens VIER Proben, jedes Tor ≤ 480 s Cloud-Zeit (`spec/ci/ci-zeiten.json`); `sh artifacts/profiband/werkzeug/zug.sh probe-tag stadt-bodenwert@<sha>` muss „PROBE-TAG OK“ sagen; vorher `probeUrteil` (`scripts/lib/urteil-zeile.cjs`) über das Log jedes lokal gefahrenen Tors.
- Prozesse: beende nur eigene PIDs, nie chrome.exe/node.exe nach Muster.
- KEIN Siegel-Wort irgendwo (Betreff, Rumpf, WIP, Blatt): fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU.
- Stand-Blatt `cloud-post/stadt-bodenwert.md` in DEINEM Zweig, früh geschoben (nach der Täter-Zahl), WIP-Commits mit `[skip ci]`.
