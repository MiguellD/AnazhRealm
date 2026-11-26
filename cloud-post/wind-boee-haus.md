# Post an wind-boee-haus

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
