
## 27.11. 16:54 Koordinator — Kopf 56db0ae1 fährt NICHT in buendel-b mit: die Kreatur-Linse reißt an deinen drei Proben (Reihenfolge der Dorf-Proben), dazu mengebild offen

- **Das Rot, wörtlich** (Batterie buendel-abend 29015b4e, Lauf 46017245179):
  - Job 140568376097, Kreatur-Linse Teil 1 (`node scripts/diag-kreatur-takt.cjs --selftest --teil=1/3`):
    `❌ seuche    {"fehler":"seuche lief im Start-Dorf, das bewohner wachsen ließ — die Dorf-Proben laufen zuletzt"}`
  - Job 140568376135, Teil 3 (`--teil=3/3`):
    `❌ werkort   {"fehler":"werkort lief im Start-Dorf, das begegnung wachsen ließ — die Dorf-Proben laufen zuletzt"}`
    `❌ schreck   {"fehler":"schreck lief im Start-Dorf, das begegnung wachsen ließ — die Dorf-Proben laufen zuletzt"}`
    Urteil dort: `❌ SELBST-TEST ROT — 3 Täter unsichtbar oder nicht beim Namen genannt, 2 Probe(n) im Grund verletzt.`
  - Job 140568376209, Teil 2 (`--teil=2/3`), Zuordnung offen zwischen dir und sprache-dialekt (beide ändern `stamm/siedlung-bewohner.js`):
    `❌ mengebild … ↳ Menschen im Bild 24 (Soll ≥ 100) um 8.053 Uhr · Gehende im Bild 17 (Soll ≥ 40)` — Zensus: `"bewohner":144,"draussen":96,"unterwegs":36,"aus":{"drinnen":48,"ausserBild":64,"verdeckt":7}`, Tafel u. a. `"ausser arbeit":31,"drinnen morgen":40`.
- **Meine Lesung (Deutung, nicht gemessen):** `seuche`, `werkort`, `schreck` sind deine Proben; die Linse verlangt, dass Proben am Start-Dorf NACH den Proben laufen, die es wachsen lassen (`bewohner`, `begegnung`) — „die Dorf-Proben laufen zuletzt“. Deine drei stehen in der Reihenfolge oder in der Teilung `--teil=n/3` davor. Dein Einzel-Lauf wurde in genau diesen Schritten abgebrochen (kein Urteil), das Rot war also am eigenen Kopf noch nie zu sehen.
- **Die Heilung:** die drei Proben an die Stelle der Dorf-Proben (das Gesetz der Reihenfolge lesen, nicht die Meldung umgehen); die „3 Täter unsichtbar“ beim Namen nennen lassen (jede deiner Mutanten fällt mit ihrem Namen). Für mengebild: fahre `--teil=2/3` an deinem Kopf allein auf main bed6256c — steht „Menschen im Bild“ unter 100, ist es dein Werk-am-Ort (wer arbeitet, steht `ausser arbeit` 31 statt im Bild): dann trägt die Probe um 8 Uhr den Weg zur Arbeit im Bild, nicht ein gesenktes Soll.
- **Beweis vor dem Schub:** `--teil=1/3`, `--teil=2/3`, `--teil=3/3` GANZ und GRÜN (je ≈ 10–15 min headless), `npm run check:statik`. Dann EIN glatter Vorprüf-Kopf auf dem `origin/main` des Moments. Deine Vor-Richter (kollektiv#2 · seuche#2) stehen an der GTX 1060 in der Reihe.
# Briefkasten werk-am-ort-2 (neueste Nachricht oben)

## 27.11. 15:06 — GPU-PROBE 56db0ae1 auf radeon-890m: GRÜN in 3097 s (gate:pruefbuehne-licht GRÜN 80 s auf radeon-890m · gate:weltbild-frost:echt GRÜN 154 s auf radeon-890m · gate:studio-begehen GRÜN 177 s auf radeon-890m · bild:stadt-voll@0.33 GRÜN 210 s auf radeon-890m · gate:webgl-probe GRÜN 82 s auf radeon-890m) → probe-post/werk-am-ort-2/56db0ae1.md

## 27.11. 01:00 Koordinator — BERICHTIGUNG zum START-BRIEF: Kopf 5 wird NICHT gestempelt, du erbst ihn als Basis

Der Vor-Richter an der Radeon 890M hat den Kopf 5 (`werk-am-ort-kopf5` cecf1d71) an beiden Ansprüchen ROT gelesen — gestempelt wird nur Grünes. Dein Zweig `werk-am-ort-2` setzt darum auf dem Baum des Kopfs 5 auf (zusammengeführt mit dem `origin/main` des Moments, EIN glatter Commit), und dein ERSTER Schnitt schließt diese zwei Lücken, bevor kollektiv#2 und seuche#2 folgen:

1. `karte2.mensch.menge.bild#2` — Radeon am cecf1d71, wörtlich: „S2 ROT an Umfang 87 < 100 Menschen im Bild — Täter: im Bild 87 (drinnen 533, außer Bild 548, verdeckt 174) · Gehende im Bild 51 (Soll ≥ 40) · Zwillinge im Bild 0 (Soll ≤ 0) · Umfang 87 (Soll ≥ 100 Menschen im Bild) · Stände 1356 … Auge [836.7,58,453.4], third, tod 0.3356“ · Preis GRÜN p95 33,48 ms. Die Bahn meldete headless „im Bild 133“ — der Null-Renderer zählt keine Verdeckung (174 verdeckt) und um 8 Uhr sind 533 von 1 356 drinnen. Die Lücke ist 13 Menschen im Bild am Markt zur Marktzeit: wer einkauft, steht am Markt, nicht hinter der Wand.
2. `karte2.mensch.menge.bevoelkerung#2` — Radeon am cecf1d71, VORHER (gültige Station) und NACHHER (Stations-Kandidat 8d2e694d der Bahn) wortgleich: „S2 ROT an Stichproben-Personen ± 2 m angetroffen 18 verfehlt ≥ 20 — Täter: nicht angetroffen: wohnhaus einkauf 7.1 m, wohnhaus arbeit 376.4 m · Umfang 1356 (Soll ≥ 1000 Bewohner der Stadt) · 20 Personen über die Liste der Stadt (307 Häuser) um 10.01 Uhr, Wohnort ≠ Arbeitsort (> 20 m) 12 von 20“ · Preis GRÜN p95 33,52 ms. Headless meldete die Bahn mit dem Kandidaten 20 von 20 — in der echten Sitzung bleiben zwei: einer 7,1 m neben dem Punkt seiner Kette beim Einkauf, einer 376,4 m von seiner Arbeit. Lies beide an der Quelle (`tagesKette`, `_bewohnerPfad`): ist der Zweite ein Bewohner ohne Weg zur Arbeit (Pfad bricht) oder einer, dessen Kette am Ort nicht ankommt?

Regel für deine Abgabe: headless grün ist bei diesen zwei Stationen KEIN Beleg (beide lasen headless grün und am Gerät rot). Nenne im Rumpf, was am Gerät anders ist (Verdeckung, echte Takte, Uhrzeit), und gib dem Vor-Richter je Sprosse die EINE Zahl, die er lesen soll.

## 27.11. 00:23 Koordinator — START-BRIEF (dieser Abschnitt ist dein Auftrag, lies ihn GANZ)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

# Sitzung: „Schreck und Seuche wandern zwischen Leibern“ (kollektiv#2, seuche#2)
- Sprossen: `karte2.mensch.menge.kollektiv#2` und `karte2.mensch.menge.seuche#2` — ZWEI Front-Sprossen an EINER Wurzel · Zweig `werk-am-ort-2` (Basis: `origin/main` des Moments, Code-Stand 38194f83) · Wartezimmer `cloud-post/werk-am-ort-2.md` · Regel-Blatt `cloud-post/welle-2611-regeln.md` (beide im Zweig koordination, zu lesen NUR über die rohe Adresse, siehe PFLICHT).
- Arbeite nach IPERKA (`.claude/agents/champion.md`); lade `.claude/skills/anazh-lehren/SKILL.md` vor Kern- oder Stamm-Code.
- Du übernimmst die Bahn werk-am-ort (ihre Sitzung schweigt seit 26.11. 19:41). Ihr Kopf 5 (`werk-am-ort-kopf5` cecf1d71: wer Platz machte, kehrt zurück — 9 Dateien, darunter `stamm/siedlung-bewohner.js`, `koerper-core.js`) steht vor dem Stempel; landet er, liegt er im main des Moments. Vor deinem Kopf: `git merge-tree` gegen `origin/main`. Ihr Blatt: `https://raw.githubusercontent.com/MiguellD/AnazhRealm/werk-am-ort-kopf5/cloud-post/werk-am-ort.md`. Karte 2 steht bei 135 von 1 718.

## DIE SPROSSEN UND IHRE ROTEN ZEILEN — wörtlich
1. `karte2.mensch.menge.kollektiv#2` — Karte: „10² · Schreck über Sicht und Klang · Preis Markt · Schreck-Front 3–8 m/s, Flucht weg ≥ 0,9“. Urteil GTX 1060 am 2d6a0447 (24.11.): „S2 ROT an Schreck-Front in m je s 51.72 verfehlt 3–8 — Täter: stamm/siedlung-bewohner.js _bewohnerZeuge: jeder Zeuge ≤ 25 m erinnert die Tat im selben Takt, kein Schreck wandert über Sicht und Klang · Anteil Zeugen auf der Flucht weg 0.777 (Soll ≥ 0.9) · Umfang 148 (Soll ≥ 100 Zeugen der Tat)“.
2. `karte2.mensch.menge.seuche#2` — Karte: „10² Dorf-Ausbruch · Ansteckung aus echten Kontakten · Preis Dorf · Kurve S-I-R, R0 im Band des Erregers“. Urteil GTX 1060 am 31ea3847 (20.11.): „S2 ROT: fehlender Leser: kein Erreger und keine Ansteckung: der Satz des Bewohners trägt keine Gesundheit (0 von 1213 mit einem Feld der Krankheit) (stamm/siedlung-bewohner.js:887)“.

## DIE WURZEL (mein Urteil — prüfe es an der Quelle, widersprich mit Zeile)
EIN Gesetz der Übertragung zwischen Leibern: ein Zustand wandert zwischen Bewohnern über das, was sie wirklich wahrnehmen und wem sie wirklich nah sind.
- Schreck: wer die Tat oder einen Fliehenden sieht oder hört, reagiert nach der Laufzeit des Reizes plus seiner Reaktionszeit — daraus entsteht eine Front mit Tempo, nicht ein Kreis im selben Takt.
- Seuche: wer einem Ansteckenden nah ist (Abstand × Dauer), steckt sich mit der Wahrscheinlichkeit des Erregers an. Die Kontakte kommen aus der Kette des Tags (`tagesKette`) — auch für Bewohner, die nicht gezeichnet sind: die Welt ist eine Funktion, kein zweites Register neben dem Tag.

## IPERKA — das Band
Die Profis mit Zahl als Band im Gesetzbuch (Kern), der Stamm liest es. Schreck: Reaktionszeit und Ausbreitung in Menschenmengen — nenne Quelle und Zahl, aus der 3–8 m/s folgen. Seuche: ein benannter Erreger der Epoche mit R0-Band, Generationszeit und Quelle. Eine äußere Quelle wird ein Band (EINE Zeile im Kern: Autor, Jahr, Zahl), nie ein kopiertes Asset. Suchen ohne Projekt- und Personennamen.

## ABGABE
- Beweis vor dem Schub mit dem Rumpf der STATIONEN (`meisterkarte-quelle/punkte/stationen/k2-mensch-menge.js`, Zweig `punkte-maschine`, headless am Null-Renderer): vorher ↔ nachher wörtlich im Rumpf des Commits — Schreck-Front m/s, Anteil Flucht weg, Umfang; S-I-R-Kurve, R0, Umfang.
- Liest eine Station nach deinem Schnitt am falschen Feld (seuche#2 meldet heute „kein Feld der Krankheit“), liefere den Stations-Kandidaten unter `cloud-post/werk-am-ort-2-station/` (Diff gegen den Kopf von `punkte-maschine` + BEGRUENDUNG.txt): nur der Leser, kein Soll, keine Schwelle.
- Sichtbar im Spiel: der Schreck ist am Markt zu SEHEN (Köpfe wenden, die Front läuft, die Flucht führt weg von der Tat); der Kranke bleibt daheim. Nenne im Rumpf, was das Auge sieht — ein grüner Zensus ohne Bild ist halb.
- Die gebuchten Sprossen der Leitern `mensch.menge.*` unter deinen beiden bleiben grün am Rumpf ihrer Station (wörtliche Zeilen im Blatt).
- Probe-Ruf (der Diff berührt `stamm/siedlung-*`): `gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen` und als vierte Probe `bild:stadt-voll@0.33`; `probe-tag` entscheidet.

## PFLICHT
- Regel-Blatt GANZ lesen (Abschnitte 13:10 und 10:27 zählen): `https://raw.githubusercontent.com/MiguellD/AnazhRealm/koordination/cloud-post/welle-2611-regeln.md`.
- Briefkasten: lies alle ~30 min und vor jedem Push `https://raw.githubusercontent.com/MiguellD/AnazhRealm/koordination/cloud-post/werk-am-ort-2.md` und `…/cloud-post/alle.md` (oberster Abschnitt `## … Koordinator`) — NIE per `git fetch` des Zweigs koordination (er trägt > 17 GiB Geschichte und reißt in der Wolke). Stationen holst du als einzelne Datei über dieselbe rohe Adresse am Zweig `punkte-maschine`.
- WARTEZIMMER: nach der Abgabe NICHT enden — bis zu 3 h in Warte-Schritten von ≤ 9 min alle 5 min den Briefkasten auf einen neuen Abschnitt `## … Koordinator` prüfen, Post abarbeiten, wieder warten.
- Station: je beanspruchter Sprosse eine Zeile im Rumpf `karte2.…#n · GRÜN|ROT · <Wortlaut>`; in der Wolke stirbt der GPU-Prozess → „Station nicht gefahren: GPU“ und daneben der Rumpf der Station headless (Null-Renderer) mit Zahl. In den Betreff nur, was grün liest. Du änderst NIE ein Soll und nie den Richter-Text.
- Schnitt: EINE Wurzel, kein Flag, kein Zwilling, kein stiller Rückfall; Kosten an Schirm und Änderung, nie an Weltgröße. Keine Konstante an der Zeile `AnazhRealm.VERSION` (stamm/dirigent-kern.js). Kein Feld am Spiel, das eine Siedlung überlebt. Fremde Zeilen nicht umformatieren.
- Linse (Gebot 10): bestehende Familie, vorher ROT am Täter, Selbsttest mit gepflanztem Täter; Selbsttest-Zeilen nennen die Mutante mit „→ ROT“ oder ✅, nie ein bloßes „ROT“.
- Vor dem Push, alles GRÜN, beim Namen im Blatt: `npm run check:statik` GANZ (`npm run check` bleibt verboten) · `node scripts/stamm-umzug.cjs --nach-karte` nach jeder neuen Stamm-Methode · `npm run format:check` · `npm run lint` · jede Linse der Familie aus `.github/workflows/check.yml` GANZ. `gate:kreatur-takt` (2567 s) und `gate:settlement` (570 s) richtet `[ci voll]`, nie dein Probe-Ruf.
- Kopf: `git fetch origin main` · `git merge-tree --write-tree origin/main HEAD` Exit 0 · EIN glatter Commit auf dem `origin/main` des Moments · Betreff GENAU `Vorprüfung werk-am-ort-2 <n> (auf main <kopf8>): <vorher → nachher mit Zahl> [gpu-probe: …] [ci voll]` · keine Versions-Stufe · kein PR.
- Probe-Ruf: höchstens VIER Proben, jedes Tor ≤ 480 s Cloud-Zeit (`spec/ci/ci-zeiten.json`); `sh artifacts/profiband/werkzeug/zug.sh probe-tag werk-am-ort-2@<sha>` muss „PROBE-TAG OK“ sagen; vorher `probeUrteil` (`scripts/lib/urteil-zeile.cjs`) über das Log jedes lokal gefahrenen Tors.
- Prozesse: beende nur eigene PIDs, nie chrome.exe/node.exe nach Muster.
- KEIN Siegel-Wort irgendwo (Betreff, Rumpf, WIP, Blatt): fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU.
- Stand-Blatt `cloud-post/werk-am-ort-2.md` in DEINEM Zweig, früh geschoben (nach der Täter-Zahl), WIP-Commits mit `[skip ci]`.
