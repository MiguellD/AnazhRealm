# BAHNEN — nur was trägt, nur mit Richter

Diese Bahnen gelten für den Kern auf main `b7ed8419`: `planet-core.js` mit sha256 c4de4d615c78d337 und VERSION `planet-h2-4`.

- **Was hier eine Bahn ist:** Eine Bahn baut eine Bedingung, unter der `spike.md` TRÄGT BEDINGT urteilt, oder einen Bruch, den der
  Zensus gemessen hat.
- **Was jede Bahn trägt:**
  - einen exklusiven Besitz (`datei:zeile`, kein Bereich gehört zwei Bahnen);
  - einen Richter, der heute läuft;
  - einen numerischen Halt, je mit „heute → Soll“.
- **Was fehlt, wird keine Bahn.** Wo Richter oder Bereich fehlen, steht die Sache unten in „Ohne Bahn“, mit Grund.
- **Kein Bild:** Alle Halte sind headless. Was im Bild zu sehen ist, beweist keiner von ihnen.

## Für jede Bahn

- **Die gemeinsame Zeile.**
  - Was teilen sich alle Bahnen?
    - die VERSION in `planet-core.js:57`;
    - die Tafel `VERSION_SHA` in `scripts/diag-planet.cjs:880–884`.
  - Was die Tafel verlangt (R4 `bytes.version`): Wer Bytes bewegt, hebt VERSION und trägt seine Zeile ein.
  - Darum gehören die beiden Zeilen immer der Bahn, die gerade läuft.
  - Darum laufen die Bahnen **nacheinander**, in der Reihenfolge unten, und nie parallel.
- **Die Gegenprobe** muss nach jeder Bahn halten:
  - `spike/a-kosten.cjs erde-01 10000`:
    - a1: 4R ÷ R ≤ 1,35 (heute 1,11);
    - Heap nach GC ≤ +1 MB (heute +12 KB).
  - `spike/c-erde.cjs 10`:
    - c1 ≥ 9/10 (heute 10/10);
    - c2 Median in [22; 36] % (heute 29,9 %);
    - c4 ≥ 9/10 (heute 9/10 Nord, 10/10 Süd);
    - c5 ≥ ×2 (heute ×7,1);
    - c6 0 Kreise (heute 0).
  - `spike/e-zeit.cjs 5`:
    - Drift in [1; 10] cm/a (heute 3,29);
    - mitgeführt ≥ 70 % (heute ≥ 84,3 %).
  - `spike/f-naht.cjs 5`: Δ = 0 in 5/5.
  - `node scripts/diag-planet.cjs --richter ort` (18.11. gemessen, 5 s):
    - `ort.delta.null` 30/30;
    - `ort.landung` 400/400.
- **Der Kosten-Richter des Kerns steht heute ROT.** `node scripts/diag-planet.cjs --kosten`, zweimal am 18.11. gemessen, das zweite
  Mal allein auf der Maschine:
  - ROT:
    - `kosten.platten`: nP 7 → 19 kostet +82 % (Schwelle ≤ +40 %);
    - `kosten.radius`: 7,18 · 6,10 · 5,19 µs bei R 1 737 · 6 371 · 12 742 km, max ÷ min **1,382** (Schwelle ≤ 1,35).
  - GRÜN: `kosten.punkt` Median 6,02 µs.
  - Kein CI-Lauf ruft `diag-planet.cjs` (Grep über `.github/` und `package.json`: 0 Treffer).
  - Was jede Bahn hier hält: Diese beiden Zahlen dürfen nicht schlechter werden.

## Die Bahnen in Reihenfolge

### B1 · S2 Relief — die Naht gehört dem Paar, nicht der Seite

- **Besitz:**
  - `planet-core.js:1342–1408`: `punktRoh` von seinem Kopf bis vor „4 Ozean-Boden“; darin der Entscheid :1351–1353, die
    Versatz-Treppe :1375–1393 und die Naht G2.5 :1404–1408;
  - `planet-core.js:1254–1255`: der Ort, an dem `raender` den Abstand und `RX` liest;
  - `planet-core.js:273` und `:1596–1597` (e135, unten).
- **Wurzel** (`spike.md` „Die Wurzeln“, Linse `spike/wurzel-b.cjs`):
  - Entscheid ≠ Abstand: 39 von 102 Platten-Sprüngen;
  - Versatz-Treppe `:1390`: 21 von 102;
  - der K1-Schalter `aufKruste` `:1352`: 42 von 102, dazu 65 von 74 Krusten-Sprüngen und 214 von 223 Schollen-Sprüngen, die an
    derselben Kante liegen.
- **Richter:** `spike/b-stetig.cjs erde-01 400`, Klassen Platte, Scholle und Kruste.
- **Halt:**
  - Höhen-Sprünge (an einer Querung über 1 cm |Δh| > 0,01 m), je von 400 Querungen:
    - Platte 102 → **0**;
    - Scholle 223 → **0**;
    - Kruste 74 → **0**.
  - Höhe je Adresse in `a-kosten`: Median 8,02 → **≤ 8 µs**.
- **Mit B1 fällt e135.** Die Konstante `BEZUG_MA` (`:273`) ist tot: `git grep BEZUG_MA` findet nur ihre Definition. Ihr Wert lebt
  als Literal 5 × 20 Ma in `sigmaRef` (`:1596–1597`).
  - Halt: Zahl der Namen ohne Leser 1 → 0.
  - Die Relief-SHA von erde-09 bleibt `cc2f8284…` (`diag-planet.cjs --bytes`), denn 5 × 20 = 100.

### B4 · S2 Relief — der Anden-Bogen an den Rand

- **Besitz:** `planet-core.js:1280–1286`. Das sind der Bogen-Abstand `xAnden` (`:1281`) und die beiden Anden-Profile (`:1285`,
  `:1286`).
- **Wurzel** (`spike/c3-wurzel.cjs`):
  - `xAnden` ist Schürze·R + 300 km und liegt damit 450–750 km hinter der Grenze, jenseits des 500-km-Fensters von c3.
  - Hochland in Rand-Nähe ≤ 500 km: erde-04 2 %, erde-07 2 %.
- **Richter:** `spike/c-erde.cjs 10`, Zeile c3.
- **Halt:** c3 ≥ ×2 in jeder Saat, heute 8/10 → **10/10** (heute erde-04 ×0,76 und erde-07 ×0,83).
- **Gegenprobe zusätzlich:** b-stetig Platte bleibt bei 0/400, wie von B1 gesetzt.
- **Was der Besitz nicht trägt:** In erde-04 hat das erloschene Orogen 50 % Anteil (K4), und dieses liegt nicht in diesem Bereich.
  Hält ×2 nach dem Schnitt nicht, so steht die Bahn ROT, und der Täter ist benannt.
- **Warum nach B1:** c3 misst Höhen, die aus `mHaupt` folgen, und B1 schneidet `mHaupt` (`:1255` liest es).

### B2 · S4 Klima — die Küste ohne Schalter, EINE Verdunstung

- **Besitz:**
  - `planet-core.js:1944–2094`: `kontGrob` und `planetKlimaR`;
  - `planet-core.js:2143–2145`: die zweite PET in `pflanzenDeckung`.
- **Wurzel** (`spike.md`):
  - `land = hKm > 0` (`:1955`) schaltet die Feuchte-Kette (`:1972`), `fak` (`:2058`), `cL` (`:2066`) und den Trocken-Zuschlag
    (`:2070`). Die Höhe geht an der Küste stetig durch 0, das Klima nicht.
  - Die Kosten der Feuchte-Knoten stehen in `:1972–2020` (BERICHT-2 Z. 163; nicht zerlegt).
  - Die PET `400 + 45·T` steht zweimal im Kern (`:2069`, `:2144`).
- **Richter:**
  - `spike/b-stetig.cjs erde-01 400`, Klasse Küste;
  - `spike/a-kosten.cjs erde-01 10000`;
  - Absenz-Grep `400 + 45` in `planet-core.js`.
- **Halt:**
  - Klima-Sprünge an der Küste bei stetiger Höhe (|ΔT| > 0,001 K oder |ΔP| > 0,1 mm/a): 390/400 → **0/400**;
  - Klima+Biom an Land, Median: 55,3 → **≤ 25 µs**;
  - Stellen der PET-Formel: 2 → **1**.
- **Warum nach B1 und B4:** Die Küste ist dort, wo die Höhe durch 0 geht. Gemessen wird erst, wenn das Relief steht.
- **Befund (Welle 1, 19.11.):** Der Spike-Richter `a-kosten` (Median EINES Durchgangs) liest Klima+Biom an Land am Kopf
  20,7 · 36,9 · 20,2 µs und urteilt dabei über die Last der Maschine (Wasser derselben Fahrt 2,50 statt 1,30 µs), während
  `diag-planet --kosten bau2` verschränkt 20,1 · 20,8 µs gegen main 44,5 · 49,1 µs misst — das Soll ≤ 25 hält am Kern, der
  Richter a braucht den Schätzer von G3 (`welle-1.md`).

### B3 · S5 Wasser — der Prototyp zieht in den Kern

- **Besitz:**
  - `planet-core.js`: ein neuer Abschnitt zwischen `:2172` und `:2173` (nach der Biom-Farbe, vor „bau3: die Brücke“) sowie die
    Export-Zeile `:2391`;
  - `vision/planet/spike/lib.cjs:70–155`: Der Prototyp wird zum dünnen Aufruf des Kerns. Die Namen `wasserGitter` und `wasserAt`
    bleiben, damit die Richter a, b und c unverändert lesen.
- **Wurzel:**
  - Die Stufe S5 lebt nur im Spike.
  - Sie trägt eine dritte Abschrift der PET (`lib.cjs:119`, `400 + 45 * …`). Nach B2 liest sie die EINE PET.
- **Richter:**
  - `spike/c-erde.cjs 10`, Zeile c6;
  - `spike/b-stetig.cjs erde-01 400`, Wasser-Zelle;
  - `spike/a-kosten.cjs erde-01 10000`, Wasser.
- **Halt:**
  - c6:
    - 0 Kreise;
    - End-See-Land Median in [10; 30] % (heute 18,5 %);
    - P/PET End ÷ Meer ≤ 0,8 (heute 0,50);
    - Abfluss ins Meer Median in [18 600; 74 600] km³/a (heute 34 375).
  - |ΔQ|/Q ≤ 10⁻³ (heute 2,8·10⁻⁶).
  - Wasser lesen: 10,5 → **≤ 8 µs**.
  - Wasser-Gitter: 4R ÷ R ≤ 1,35 (heute 0,83).
  - Zahl der PET-Formeln im Code von `lib.cjs` (`:119`): 1 → **0**.
- **Warum nach B2:** S5 liest die Höhe (S2), den Abfluss und die PET (S4).

### B5 · Die Naht — der Anker wird dort gesucht, wo er gelesen wird

- **Besitz:**
  - `planet-core.js:2205–2243`: `planetAnker`;
  - `vision/planet/zensus/e-mess.cjs:5–6`: Der Kern-Pfad wird `PLANET_KERN` wie in `spike/lib.cjs`, heute ist er ein fester Pfad.
- **Wurzel** (`zensus/e-planet-kern.md`, e-mess §G/§H):
  - `planetAnker` sucht bei fuss 40 (`:2214`).
  - `ortRoh` und der Faden lesen bei fuss 16 (`:2309`, `voxel-worker.js:1182`).
  - Der Anker sucht 18/−4 °C auf Meeres-Niveau und liest das Biom auf der wahren Höhe.
  - Fällt der Wald am Anker auf 0, so setzt `:2300` jedes Wald-Verhältnis auf 1.
- **Richter:**
  - `node vision/planet/zensus/e-mess.cjs`, Abschnitte §G und §H, 30 Erd-Saaten;
  - Gegenprobe `diag-planet.cjs --richter ort` und `spike/f-naht.cjs 5`.
- **Halt** (heute → Soll):
  - Anker bei fuss 16 im Meer: 1/30 → **0/30**;
  - Anker mit Wald 0: 8/30 → **0/30**;
  - Anker mit Spende 0: 1/30 → **0/30**;
  - Anker in Köppen E: 3/30 → **0/30**;
  - erde-29: Land-Ziele, die `ortGesetz` ablehnt, 135/200 → **0/200**;
  - weiter gilt `ort.delta.null` 30/30 und f-naht Δ = 0 in 5/5.
- **Warum zuletzt:** Der Anker liest S2 und S4 (`wert`, `:2212–2219`), und die Naht muss am Kern halten, der am Ende steht.

## Welche Sprossen fallen KÖNNEN

Keine Sprosse fällt durch eine Bahn allein. Jede Sprosse verlangt ihren Richter im echten Spiel und den Preis P in derselben Fahrt
(MEISTERKARTE-2 Z. 27–29), und alle Halte oben sind headless. Je Bahn ist hier die EINE Sprosse genannt, deren Kern-Teil die Bahn
liefert, und was danach noch fehlt (Namen aus `meisterkarte-2.json`, über `zensus/f-sprossen.json`):

| Bahn | Sprosse | die Bahn liefert | danach fehlt |
|---|---|---|---|
| B1 + B4 | `planet.geologie.platten/S1` | keine geraden Stufen an Nähten mehr in der Schummerung; Gebirge am Rand (c3) | eine Messung der Gürtel-Achsen ≥ 4:1 (kein Skript), das Blindpaar Schummerung, P im Überflug |
| B2 | `planet.wetter.klimazonen/S3` | die Kontinentalität `cL` ohne Sprung an der Küste | Rang der Jahresamplitude gegen den Meeresabstand an 30 Orten im Spiel (Δ Sommer und Winter liefert die Reise, `voxel-worker.js:1180–1200`), P |
| B3 | `planet.relief.grossform/S1` | jeder Lauf endet in einem See oder im Meer (c6: 0 Kreise), im Kern | Das Spiel zeichnet keinen Planeten-Fluss. 20 Läufe im Spiel nachgefahren, P |
| B5 | `same.massstab.sprung/S4` | „jeder Ort“: ein Land-Ziel wird nicht mehr abgelehnt (erde-29: 135/200 → 0) | ganz ≤ 2 s; die Ankunft kalt braucht heute 16,6 s an der GTX (PFLICHT-OFFEN B) |

## Ohne Bahn — mit Grund

| Sache | Grund |
|---|---|
| S6 Gestein und Boden (10 Größen FOLGT) | kein Spike, kein Richter |
| Tag und Jahr (7 Größen FOLGT; die Sonne ohne Breite, `welt-licht.js:711`) | kein Spike, kein Richter |
| Die Heimat als Adresse im Spiel (Q_Heimat + Δ beim Boot, `gesetz.md` §5) und mit ihr 15 der 16 FÄLLT-Setzer (12 Heimat, dazu e217, e222 und e223, die das Ort-Gesetz des Spiels als Pflicht liest) | Kein Richter misst den Boot-Pfad. `ort.leser` (`diag-planet.cjs:641–645`) zählt Dateien, die `planetOrt(` nennen. Heute sind das 2, also GRÜN, und doch liest der Pfad ohne Reise den Kern nicht: Konsum-Tiefe 0 (`zensus.md` §2). Die Linse misst Existenz, nicht Konsum |
| `kosten.platten` +82 %, `kosten.radius` 1,382 | ROT gemessen, aber die Wurzel ist nicht zerlegt, also gibt es keinen Besitz-Bereich |
| 105 Kern-Konstanten BLEIBT (`gesetz.md` §6) | Kein Richter je Konstante: spike §c und Linse bau3 eichen nur das Ganze |
| Grundwasser (b66 FOLGT S5) | nicht im Prototyp S5, kein Richter |
| d: 100 Planeten erst bei 40 000 Adressen unterscheidbar | eine Messbedingung, kein Code |
| d2: Land-Anteil R² 0,46 | Der Land-Anteil folgt aus der Gestalt der Schollen, die der Same zieht (SAME). Das ist kein Fehler im Code |
