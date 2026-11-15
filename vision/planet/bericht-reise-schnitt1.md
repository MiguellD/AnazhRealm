# BERICHT REISE · SCHNITT 1 — Der Planet im Faden: die Welt kennt ihren Ort (15.11.2026, 08:05) · ZWISCHENSTAND

Zweig `w28-planet-kern`, Kopf a7e1b9ca (gepusht), darin main **a6555b12** (V18.546.292) als Merge-Commit 3bd9380e — das Blatt nannte
01a6714a, main stand beim Antritt zwei Abgaben weiter. Kern `planet-h2-2`. Alle Spiel-Zahlen: Radeon 890M, 1920 × 1080, relativ.

**Drei Sätze.**
- **Geschnitten:** Der Planet steht im Manifest und rechnet im Neben-Faden „planet“ nach dem ersten Weltbild den Anker der Welt;
  `ortGesetz()` ist die EINE Tafel des Ort-Gesetzes im Gelände-Kern, der Nachbau im Richter samt dem Jahr 365,25 ist tot, und der
  Satz „reise“ der Konsole sagt die Lage (43,43° N · 12,08° O, Küste 289 km).
- **Gemessen:** Heimat byte-gleich im Gesetz (Byte-Abdruck main ↔ Kopf 103 von 103 SHA-256 gleich, gate:worker-dichte maxDiff 0,
  128 von 128 Goldens); Kosten-Zeile B t(Weltbild) kalt Median 13,36 s main ↔ 13,15 s Schnitt bei Spannweite main 2,49 s; der
  Anker im Faden trägt die Bytes des Kerns in node, der Faden entsteht 2,2 s NACH dem Weltbild und hält den Haupt-Faden 1,6 ms.
- **Ehrlich offen:** das Bildpaar der Heimat ist NICHT 0 Pixel (zwei Boots von main selbst weichen 1,1–2,4 % ab; main ↔ Schnitt liegt an drei von vier Boots darin, EIN Boot der Wiese steht in einem zweiten Zustand mit 19 % — Täter ungelesen);
  die Zeit im Faden ist im Spiel 0,60 s Wanduhr statt ≤ 0,45 s; gelesen wird vom Planeten nur der Anker — von den 23 Feldern des
  Orts 0.

---

## 1 Geschnitten (Datei:Zeile am Kopf)

| Teil | Datei:Zeile | Was |
|---|---|---|
| K, der Kern-Schnitt | `planet-core.js` 55 · 2264–2266 · 38–50 · 2159 · 4 | VERSION `planet-h2-2`; `ORT_DELTA_KLIMA` trägt `sommerPhase` (Ort − Anker: 0 oder ±0,5); Kopf §6 und die Zeile der Brücke nennen keinen Verdrahtungs-Stand mehr, der überholte Verdrahtungs-Plan („Kragen“) fiel mit |
| die EINE Tafel | `gelaende-core.js` 5631–5647 · 7429 | Export `ortGesetz()`: `{ kuehlungKJeM, meerUnterBasisM, regler, klimaHeute }` aus `TEMPERATUR`, `SCHNEE`, `LANDFORM_REGLER`, `PEGEL` und der Boden-Tafel (5630); `spendeMm` im Jahr der Tafel (365); additiv, kein Leser der Heimat ruft sie |
| Manifest | `cores.manifest.json` 58–64 | Zeile `planet` (`ns` `__planetCore`, `funktion`) |
| spät laden | `stamm/gelaende-chunks.js` 3406 | `FADEN_QUELLE.spaet.planet` |
| der Auftrag | `voxel-worker.js` 359–364 · 1078–1092 | `planet-anker` → `planetAnker(msg)`: Kern spät laden, Plan (Körper `PLANET_ERDE`, Jahr aus `ortGesetz()`), Anker → `{ samen, version, breite, laenge, kuesteKm }`; liest weder die Lage des Fadens noch eine Uhr |
| der Wirt | `stamm/gelaende-chunks.js` 620–639 · 1262–1266 | `_planetAnker()`: EIN Versprechen je Samen, bestellt nach `_weltbildKommt()` im Leerlauf (`_imLeerlauf`), über `_nebenAuftrag("planet", …)`; bestellt mit jeder Welt in `generateTerrainWithParameters` |
| der Leser | `stamm/feld-leben.js` 1361–1392 · `stamm/daten.js` 986–988 | Zeile `reise` in `chatSystemPatterns` (kein DSL-Weg); drei Zeilen der Text-Tafel (Lage · kein Anker · „O“/„E“) |
| Register | `spec/stamm/modul-karte.json` 74 · `docs/studio-vertrag.md` 1094–1096, 1101–1115 | `_planetAnker` im Modul Gelaende/chunks; §9 erklärt `ortGesetz` und jeden Schlüssel von `__planetCore` |
| Richter des Kerns | `scripts/diag-planet.cjs` 389–393 · 541 · 616–627 · 863–864 · 1236–1242 · 1358–1360 | liest den Export; `deltaNull` liest `sommerPhase`; `ort.leser` urteilt ≥ 1; Tafel VERSION → SHA; Selbsttest `ort.delta.phase` (+ „feuert“); `--richter ort` (die zwei Zeilen der Brücke gezielt, 30 Saaten in ~15 s) |
| die Linse | `scripts/diag-worker-dichte.cjs` 1955–2046 · 2089–2096 · 1695–1714 · 1927–1935 · 1808–1811 | K6 in gate:worker-dichte `--faden` (§5); `--faden --planet` nur K6; die Hülle misst die Zeit im Faden, der Haken die Geburt im Haupt-Faden; Heilung des Hakens für die echte GPU |

**Was stirbt (im selben Zug):** `ortGesetzAusGelaende` im Richter samt der zweiten Jahreslänge 365,25 (`git grep` am Kopf: 0
Treffer) · die zwei Sätze „NICHT verdrahtet“ im Kern · die Zeile `ort.leser` „= 0, beim Namen“ (sie verlangt jetzt ≥ 1) · die Uhr
im Faden-Auftrag (mein erster Wurf las `performance.now`; die Wand der Gerätezeit nannte `planetAnker` — die Zeit misst jetzt die
Linse am Faden, das Gesetz liest keine Uhr).

---

## 2 Gemessen

| # | Annahme des Blatts | vorher (main a6555b12 bzw. Kern h2-1) | nachher (Kopf) | Urteil |
|---|---|---|---|---|
| 1a | Heimat byte-gleich: Byte-Abdruck (`gate:worker-dichte --abdruck`, 40 Gitter Main + Faden, Makro 3 Saaten, Bühne, Leser) | 103 SHA-256 | 103 von 103 gleich | hält |
| 1b | gate:worker-dichte (Standard · Bühne · Kern-Probe) | — | 12 Gitter 659 982 Ecken maxDiff 0 · 28 Gitter 1 539 958 Ecken maxDiff 0 · 4/4 Mutationen | hält |
| 1c | Goldens (gate:asset-contract) | — | 128 von 128 byte-gleich | hält |
| 1d | Bildpaar Mittag main ↔ Kopf, Soll 0 Pixel | main ↔ main (zwei Boots): Genesis 48 947 px (2,36 %; 249 > 8/255) · Wiese 22 404 px (1,08 %; 229 > 8/255) | main ↔ Schnitt: Genesis 3,01–3,27 % · Wiese 1,91–1,99 % am zweiten Boot des Schnitts, 19,3–19,5 % am ersten (der weicht auch vom zweiten Boot des Schnitts um 19,4 % ab) | **reißt** — s. §4 |
| 2a | `diag-planet --bytes` | VERSION h2-1 → cc2f8284 | 7 Zeilen GRÜN (`planet.bytes.engines` bleibt OFFEN: keine zweite Engine am Platz), `bytes.version` h2-2 → cc2f8284 = Tafel | hält |
| 2b | `--selbsttest` ≥ 43/43 | 42/42 | 44/44 (neu `ort.delta.phase`: Süd-Anker erde-01 −45,38°, Phase-Δ am Anker +0, jenseits des Äquators −0,5; gepflanzt Ort − Tafel → ROT) | hält |
| 2c | `ort.delta.null` über das neue Feld 30/30 | Kern h2-1: 0/6 ROT | 30/30 (davon 14 Anker im Süden) | hält |
| 2d | `npm run check` am Zweig | am Zweig nie gelaufen; am Antritt ROT an der Zitat-Wand (4 Zitate von Blättern des Zweigs koordination) | GRÜN (412 s) | hält |
| 3a | Anker im Faden = Anker in node, Bytes gleich | — | Float64-Bitmuster gleich: 43,432° N · 12,076° O, Küste 288,6 km, `planet-h2-2` (Null-Renderer und echte GPU) | hält |
| 3b | Plan + Scheibe + Anker im Faden ≤ 0,45 s CPU | — | node 0,35 s (Plan 50 · Scheibe 285 · Anker 16 ms); im Spiel 0,60 s **Wanduhr** vom späten Laden bis zur Antwort (ein Lauf, 2,2 s nach dem Bild, während die Welt weiter strömt); CPU im Spiel ungemessen | als Wanduhr **reißt** (+0,15 s) |
| 4a | Kosten-Zeile B: t(Weltbild) kalt, A B B A A B, je Seite 3 | A 11,71 · 14,20 · 13,36 s → Median 13,36 s, Spannweite 2,49 s | B 11,43 · 13,85 · 13,15 s → Median 13,15 s; Δ −0,21 s | hält (Δ ≤ Spannweite; das Maß löst den Schnitt nicht auf) |
| 4a′ | dazu t(Kontrolle) von außen | Median 14,09 s, Spannweite 2,27 s | Median 13,81 s; Δ −0,28 s | hält |
| 4b | 0 Aufträge an den Planet-Faden vor dem Weltbild | — | der Faden entsteht 2 174 ms NACH `_weltbildDa` (echte GPU) | hält |
| 4c | kein Bild im Haupt-Faden über 100 ms durch den Schnitt | — | die Geburt des Fadens (voller Stand) hält den Haupt-Faden 1,6 ms (echte GPU; Null-Renderer 2,1–6,1 ms); Bruch-Buch am ersten Weltbild leer in 4 von 4 Kalt-Boots des Kopfs | hält |
| 5 | `ort.leser` 0 → 1, beim Namen | 0 | 1 (`voxel-worker.js`); den Ort als Differenz (`planetOrt`) lesen 0 | hält |

Die Kalt-Zeile ist an beiden Ständen ROT am Soll 5 s (PFLICHT-OFFEN B steht; die Folge lief 06:18–06:20 unter fremder Last, die
absoluten Sekunden gelten nicht). Was der Schnitt vor dem Bild wirklich kostet, liegt unter ihrer Auflösung: +1 synchroner Abruf
von 178 KB im Faden der Quelle und das Auswerten des Kerns in den vier Studio-Fäden (das Blatt maß das Laden in node mit 6–10 ms).

---

## 3 Leser-Liste (vor dem Schnitt an der Quelle nachgelesen)

`_quelleFaden` (`stamm/gelaende-chunks.js` 309–316: holt jede Datei aus `spaet` synchron vor der Adresse der Fäden) ·
`_fadenQuelle` (269–279) · `voxel-worker.js` Kopf 39–42 · `_nebenFaden` (567–611) · `_nebenAuftrag` (612–619) · `_weltbildKommt`
(`stamm/koerper-bewegung.js` 2282) · `_imLeerlauf` (`stamm/dirigent-takt.js` 2379, nur gerufen) · `chatSystemPatterns`
(`stamm/feld-leben.js` 1154 ff.) über `processChatCommand` (799–827: Portal-Route, Regeln und DSL-Parse stehen DAVOR — „reise“
kommt durch) · ungefragt: die Lade-Liste der Studio-Fäden (`stamm/studio-bruecke.js` 325–338, 833–839), `diag-studio-vertrag.cjs`
(§9: jeder Schlüssel eines Gesetz-Kerns steht in der Erklärung), `diag-atlas.cjs` (287), `diag-fluss.cjs` (46, S9b).

**Was die Quelle anders sagt als das Blatt.**
1. **Die Wand der Gerätezeit** (`spec/uhr/geraetezeit.json`, gate:wetter-wache W) nennt jeden Leser der Uhr: der Auftrag im Faden
   trägt darum keine Zeiten; die Linse misst sie von außen.
2. **Die Zitat-Wand** (gate:betriebsgesetz): `planet-core.js` und der Richter zitierten vier Blätter des Zweigs koordination mit
   Datei-Endung — ROT seit dem Antritt des Zweigs; die Zitate nennen jetzt Zweig und Pfad ohne Endung.
3. **`_voxelZustandPost`** (`stamm/gelaende-chunks.js` 440–446) schickt JEDE Zustands-Nachricht an JEDEN Neben-Faden: der
   Planet-Faden bekommt nicht nur die Regionen bei der Geburt (Gefahr 5 des Blatts), sondern jeden Stand, jedes Delta und jede
   Hydro-Bestellung danach und rechnet jede Region mit, die er nie liest (gemessen: `planet:state-update` 0,04 MB im Boot, 0,02 MB
   in zwei Minuten Gang; K5 der Familie hält mit 1,16–1,70 MB/min ≤ 5).
4. **Die Küste des Ankers** ist 288,6 km, nicht 280 km; der Satz sagt 289 km.
5. **`_weltbildKommt` allein reicht nicht:** die Geburt des Fadens trägt einen vollen Stand im Haupt-Faden; sie geht darum einen
   Leerlauf später (`_imLeerlauf`, Frist 2 s) — nach dem Bild kam der Leerlauf erst an der Frist (2,2 s).
6. **`.claude/skills/anazh-lehren/SKILL.md` Zeile 20** nennt „9 Kerne in 10 Dateien“; es sind jetzt 10 in 11. Ich habe `.claude/`
   nicht angefasst.
7. **Der Haken der Faden-Linse** (`fadenSeite`, `postMessage`) las `m.daten` als Stand des Speichers; an der echten GPU trägt
   die Fern-Teilung (`stamm/gelaende-fern.js` 1330, gesperrt, nicht berührt) `daten` als Feld — der Haken warf in jedem Auftrag,
   `gate:worker-dichte --faden --echt` stand still (auch am Stand main). Geheilt in der Linse (1808–1811).

---

## 4 Bilder (alle 1920 × 1080 ab dem Boot, `werkbank start --fenster 1920x1080`, Uhr 0,5, Bühne Sommer · klar · Tiere gehalten)

Ordner: `C:/Users/micha/AnazhRealm-profiband/artifacts/profiband/auge/planet-reise/schnitt1/`

| Bild | Datei | `r._schirm()` | `r._laubRand()` |
|---|---|---|---|
| Konsole mit der Ort-Zeile (Schnitt, Genesis-Ort) | `schnitt-konsole.png` (dazu `schnitt-konsole.json`: Anker und Zeile) | 1920 × 1080 | 216 |
| Genesis-Ort, Kamera 0 / +1,7 / 0 → −10 / +1,7 / 0 | `main-genesis-1.png` · `main2-genesis-1.png` · `schnitt-genesis-1.png` · `schnitt2-genesis-1.png` | 1920 × 1080 | 216 |
| Mess-Wiese, Kamera −280,4 / +1,7 / −1045,6 → −289,6 / +1,7 / −1049,5 | `main-wiese-1.png` · `main2-wiese-1.png` · `schnitt-wiese-1.png` · `schnitt2-wiese-1.png` | 1920 × 1080 | 216 |
| Differenz ×8 | `diff-genesis-main-schnitt.png` · `diff-wiese-main-schnitt.png` · `diff-genesis-main-main2.png` · `diff-wiese-main-main2.png` · `diff-wiese-main-schnitt2.png` · `diff-wiese-schnitt-schnitt2.png` | | |

Die Zeile der Konsole im Bild: „> reise · Diese Welt liegt bei 43,43° N · 12,08° O auf ihrem Planeten, die Küste 289 km entfernt
(Samen „anazh-realm-seed", Kern planet-h2-2).“

**Das Paar der Heimat, gezählt** (Pixel mit irgendeiner Abweichung · davon über 8/255 · größte Abweichung):

| Paar | Genesis-Ort | Mess-Wiese |
|---|---|---|
| derselbe Boot, zweimal geschossen (main, Schnitt) | 0 · 0 · 0 | 0 · 0 · 0 |
| main ↔ main (zwei Boots) | 48 947 (2,36 %) · 249 · 129 | 22 404 (1,08 %) · 229 · 75 |
| main ↔ Schnitt | 67 732 (3,27 %) · 502 · 129 | 399 748 (19,28 %) · 25 407 · 88 |
| main (zweiter Boot) ↔ Schnitt | 65 662 (3,17 %) · 588 · 129 | 404 145 (19,49 %) · 25 425 · 88 |
| main ↔ Schnitt (zweiter Boot) | 64 114 (3,09 %) · 888 · 77 | 41 216 (1,99 %) · 727 · 91 |
| main (zweiter Boot) ↔ Schnitt (zweiter Boot) | 62 437 (3,01 %) · 993 · 129 | 39 678 (1,91 %) · 790 · 91 |
| Schnitt ↔ Schnitt (zwei Boots) | 58 609 (2,83 %) · 1 162 · 129 | 402 080 (19,39 %) · 25 535 · 91 |

**Was die Zahlen sagen.** In EINER Welt ist das Bild Byte für Byte wiederholbar (0 Pixel, an jedem der vier Boots). Zwischen zwei
Boots ist es das nie, auch an main nicht: die Welt eines Boots trägt je andere Dreiecke (Wiese: main 381 326 · main 378 870 ·
Schnitt 380 462 · Schnitt 387 582 bei je 94 Befehlen), das Rauschen sitzt in Kronen, Vögeln und Portal-Membranen, Himmel und
Boden sind gleich. Am Genesis-Ort liegt jedes der sechs Paare bei 2,4–3,3 %. An der Wiese stimmen drei Boots auf 1,1–2,0 % überein
(beide von main und der zweite des Schnitts); der erste Boot des Schnitts weicht von JEDEM der drei um 19,3–19,5 % ab, auch vom
zweiten Boot desselben Stands — ein zweiter Zustand der Welt zwischen Boots, kein Unterschied der Stände. Sichtbar ist er als
anderer Kronen-Schatten auf dem Gras in mittlerer Ferne und im Laub der Kronen (`diff-wiese-main-schnitt.png`,
`diff-wiese-schnitt-schnitt2.png`); Halme, nahes Gras, Himmel und die mittlere Farbe des Bilds (76,6 / 92,0 / 32,0) sind gleich.
**Der Täter des zweiten Zustands ist ungelesen.** Er fiel in 1 von 2 Boots des Schnitts und in 0 von 2 an main — bei zwei Boots
je Seite ist nicht zu trennen, ob der Schnitt seine Häufigkeit ändert (`heimat.bild.zweizustand`). Der Boot mit dem zweiten
Zustand war der einzige, der als zweite Sitzung desselben Halts unmittelbar hinter einer anderen Welt startete.

---

## 5 Die Linse (Gebot 10): K6 in der Familie gate:worker-dichte `--faden`

Der Fall: „die Welt kennt ihren Ort nicht“ / „der Anker im Faden ist nicht der Anker des Kerns“. Die Linse bootet kalt, wartet auf
`_planetAnker()`, rechnet denselben Anker in node (derselbe Kern, die Tafel `ortGesetz()` des gemessenen Baums — kein Nachbau),
spricht „reise“ durch `processChatCommand` und liest die Zeile der Konsole.

| | |
|---|---|
| ROT beim Namen | der Wirt trägt keinen Leser (`_planetAnker` fehlt) · Samen des Planeten ≠ Samen der Welt · Version des Kerns · Float64-Bits von Breite und Länge ≠ node · Faden vor dem ersten Weltbild geboren · `__planetCore` im Haupt-Faden · der Satz sagt die Lage nicht |
| am Stand davor | main a6555b12 (`--wurzel`): „⛔ K6: die Welt kennt ihren Ort nicht — der Wirt trägt keinen Leser des Planeten (`_planetAnker` fehlt)“, Exit 1 |
| am Kopf | GRÜN (Null-Renderer und echte GPU) |
| Selbsttest | fünf gepflanzte Täter durch DENSELBEN Leser (der Anker eines fremden Samens aus dem Faden, der Kern im Haupt-Faden, ein Faden vor dem Bild, kein Satz, ein Wirt ohne Leser): jeder fällt ROT beim Namen |
| Kosten | im `--faden`-Lauf der CI +2 s (der Lauf: 103–111 s lokal); gezielt `--faden --planet [--selftest]` 14 s |
| Lesewerte, kein Urteil | Zeit im Faden (die Hülle der Linse: vom späten Laden bis zur Antwort) · Geburt des Fadens im Haupt-Faden |
| Leser | `npm run gate:worker-dichte` (volle Batterie), `--faden --echt` an der Karte |

Dazu im Richter des Kerns: `ort.leser` (≥ 1, beim Namen) und `ort.delta.null` samt Phase, gezielt über `--richter ort`.

---

## 6 Tore am Kopf

`npm run check` GRÜN (412 s) · gate:worker-dichte GRÜN (307 s) · gate:fluss GRÜN · gate:ankunft GRÜN (L2b: „hilfe“ nennt das
Beispiel „reise“) · gate:sprache GRÜN · gate:asset-contract GRÜN (128/128) · gate:betriebsgesetz GRÜN · gate:wetter-wache
`--quelle` GRÜN · format:check · lint · stamm:lint · diag-atlas `--check` GRÜN · playtest:fast 21 von 21 · voller Playtest am
Kopf: der erste Lauf ROT an (M7a) Game-Loop-Regen (der Wackler steht seit 14.11. im FUND-REGISTER, Kopf 7ccf6200), zwei weitere
„Alle Invarianten OK“, main im Wechsel daneben 2 von 2 · `diag-planet --selbsttest` 44/44 · `--bytes` GRÜN.

---

## 7 Ehrlich offen (mit Messnamen)

- **`ort.konsum`: 0 von 23 Feldern.** Der Schnitt liest vom Planeten den Anker (Lage, Küste, Version) und sagt ihn — keine Größe
  des Orts ändert ein Bild der Welt. Konsum-Tiefe im Sinn der Welle: 0 %. Das Δ wirkt erst mit Schnitt 2 und 3.
- **`heimat.bildpaar`: nicht 0 Pixel.** §4. Byte-gleich ist die Heimat im Gesetz (Abdruck, maxDiff 0, Goldens), nicht im Bild
  zweier Boots.
- **`heimat.bild.zweizustand`:** die Wiese steht in 1 von 4 Boots in einem zweiten Zustand (19 % der Pixel, Kronen-Schatten);
  Täter ungelesen, und ob der Schnitt ihn häufiger macht, ist bei 2 Boots je Seite ungemessen. Die Probe dafür: ≥ 5 Boots je
  Seite an der Wiese, gezählt wird der Zustand.
- **`planet.faden.zeit`: 0,60 s Wanduhr im Spiel** (Soll ≤ 0,45 s CPU; node 0,35 s). Ein Lauf, 2,2 s nach dem Bild.
- **`planet.faden.zustand`:** der Planet-Faden trägt den vollen Stand der Welt und rechnet jede Hydro-Region mit, die nach
  seiner Geburt bestellt wird — Kosten an der Weltgröße in einem Faden, der nur den Samen liest. Bytes gemessen (§3 Punkt 3), die
  Rechenzeit der Regionen im Faden und sein Arbeitsspeicher (`planet.faden.ram`) ungemessen. Der saubere Schnitt wäre eine Rolle
  ohne Zustand in `_nebenFaden`; ich habe den EINEN Weg der Fäden nicht um einen Sonderweg ergänzt.
- **`quelle.spaet.planet`:** die Kosten-Zeile löst den zusätzlichen Abruf nicht auf (Δ −0,21 s bei Spannweite 2,49 s, je Seite 3).
- **GTX 1060 und GTX 1050: 0 Messungen.** Alles Radeon, relativ.
- **Samen ohne Anker:** in 90 Saaten (60 freie, 30 der Liste) warf `planetAnker` nie; wirft er, sagt der Satz den Befund und das
  Log den Bruch beim Namen — im Spiel ungesehen.
- **Süd-Halbkugel im Spiel ungesehen:** 14 der 30 Saaten und 34 von 60 freien tragen den Anker im Süden; die Phase als Δ ist nur
  im Richter bewiesen.
- **Welt-Wechsel:** ein neuer Samen bestellt seinen eigenen Anker im selben Faden — gelesen an der Quelle, im Spiel nicht gefahren.
- **Zwei Fehler am Apparat, meine:** ein mit TaskStop beendeter Warte-Auftrag lief weiter und hielt 06:02–06:04 das Schloss für
  eine Bild-Sitzung, deren Bilder überschrieben wurden; der erste Lauf `--faden --echt` stand 06:20–06:31 unter dem Schloss an
  dem Haken aus §3 Punkt 7, bis ich ihn beendete.

---

## 8 Sprossen

Dieser Schnitt bewegt **keine** Sprosse (R2: es hebt nur, was der Spieler im echten Fenster sieht oder tun kann — er sieht eine
Zeile). Er ist die Voraussetzung dafür, dass die Welle `same.massstab.sprung` 4 und 5 und `planet.wetter.klimazonen` 3 und 5
richtbar macht; `same.kopplung.zeitreise` 4 und `same.entfaltung.reise` berührt er nicht.

---

## 9 Für Schnitt 2 und 3 (im selben Baum)

- Der Haken des Wirts ist `_planetAnker()` (`stamm/gelaende-chunks.js` 627), der Faden `_nebenAuftrag("planet", …)`; der Auftrag
  `planet-ort` gehört neben `planet-anker` (`voxel-worker.js` 359). Der Faden hält keinen Plan zwischen zwei Aufträgen — das Memo
  des Kerns hängt am Plan-Objekt; wer den Plan je Sprung nicht neu zahlen will (50 ms), hält ihn im Faden.
- `ortGesetz()` nimmt noch kein Argument; die Kühlung steht zweimal im Kern (die Tafel und `temperaturFeld` 1316) — Schnitt 2
  macht die Tafel zur Quelle.
- Die Linse der Welle wohnt in gate:worker-dichte: K6 (`planetSeite` · `planetSoll` · `planetUrteil`), gezielt `--faden --planet`.
- Kein Skript mit Backslash aus der Shell schreiben: mein Bild-Skript verlor ihn und schrieb beide Stände in dieselbe Datei.
- Ein Bildpaar zweier Boots trägt 1–3 % Rauschen; „0 Pixel“ hält nur in EINER Welt (zweimal geschossen: 0).
