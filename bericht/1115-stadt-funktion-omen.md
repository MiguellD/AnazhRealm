# Die Stadt als Funktion über Vierteln — der Schnitt, Wand 500 (OMEN GTX 1060, 15.11., ZWISCHENSTAND)

Abgabe b0f25c2d. Auftrag des Koordinators 14.11. 21:55 (b) und 15.11. 00:48 (diese Abgabe fährt mit der Wand 500; die Senkung ist eine eigene
Abgabe, die Kurve entscheidet sie). Zweig `w28-stadt-funktion` (auf w28-stadt-ankunft 5cc36b86, vereint mit main 01a6714a).
Roh auf der OMEN: `p3/n1411/sf2/` (Treiber `wende.cjs` · `byte.cjs` · `rang.cjs` · `viertel.cjs` · `radius.cjs` ·
`stadt-gang.cjs` · `gang-lese.cjs`; Läufe `gang3/` und `bild1/`), Ketten `p3/n1411/k33 … k47`.

## Was geschnitten ist

1. **Die Wende-Suche** (`verkehrsNetz`, byte-gleich): Paare nur der freien Bahnen hinein; die Sperren-Frage mit Radius liest
   flache Zahlen (Kosinus und Sinus einmal je Box) und fällt vor der Wurzel; der Gang vor der Nähe; die Außen-Seite der Spur
   einmal je Punkt und Ende.
2. **Der Kern**: `STADT_FUNKTION` (Wand 500 = die bisherige `GROESSE_WAND`, Schritt 4 Welt-Zellen = 1024 m), `viertelWort(samen,
   nH, i, k, epoche)` — Ringe um den Kern, Ring ρ trägt 8ρ Viertel, von innen voll, der letzte teilt den Rest auf Viertel von
   rund einem Viertel der Wand an den Kanten; zustandslos. `DORF` liest das Erbe des Kerns (Region, Jahr, Spanne). Der Export
   eines Worts über der Wand ist das Kern-Viertel und nennt seine Stadt (`stadt: {nH, kern, ringe}`) — der stille Klemmer ist tot.
3. **Der Wirt**: das Gedächtnis des Worts trägt die Zahl der Stadt (`stadt`); `_viertelInfo` steht vorn in
   `_autoSettlementCellInfo` — das Viertel IST eine Zelle der Welt: es wird bereitet, erwacht, kehrt wieder und reist nicht
   wie jede Zelle; kein zweiter Gründungs-Pfad, `_bauer` unberührt. Ein Ort des Rang-Gesetzes steht nicht im Reich des Kerns
   oder eines Viertels (die Summe beider `siedlungsReich`, wie der Rang verdrängt); die Dörfer der Welt zwischen den Vierteln
   bleiben. Der Kern ist ein Ort des Wegenetzes, Orte derselben Stadt sind über ihren Schritt Nachbarn.
4. **Die Linse**: gate:settlement Z4 und Selbst-Test S (`stadtFunktion`, lib/ort-proben.cjs): Summe, Wand, Erbe, zustandslos,
   Samen je Viertel verschieden; vier Mutanten ROT beim Namen.

## (1) Byte-gleich bis zur Wand — vorher (5cc36b86) ↔ nachher

| Probe | vorher | nachher |
|---|---|---|
| ortPlan dorf 21 · 36 / 144 / 300 | 14779d19 / a74e8044 / — | 14779d19 / a74e8044 / 38babe3c |
| ortPlan dorf 7 · 36 / 144 / 300 (stadt-voll) | caef0a03 / a7c587b5 / fa0a7350 | gleich |
| ortPlan dorf 3 · 36 / 144 / 300 | 35803906 / 177a08b6 / cd795c72 | gleich |
| Export dorf 7 36 · 144 · 300, dorf 21 144, dorf 3 300, dorf 7 18 hanse, dorf 7 300 gruenderzeit | e48dad76 · f62a3f85 · 52201a02 · bafdd284 · 0e94f996 · 1f089b40 · 2662f402 | gleich |
| Rang-Welt 64 × 64 Zellen („anazh-realm-seed“, 1929 Orte) | 56fef038 | gleich |
| ihre erste Zelle der obersten Stufe (12,−31: dorf 3318050558 127) Export / ortPlan | 778c5b7c / ccf5b004 | gleich |
| ihre größte Stadt (−14,−16: dorf 570977236 500, 489 Lose) Export / ortPlan | 700d5f0a / f9b580ff | gleich |
| Wort über der Wand: Export dorf 7 1000 | d8e80f5f | 3b8c8e5d (trägt `stadt`) |

dorf 21 300 hat keine Vorher-Zeile in ortPlan (die Kette maß 36 · 144 · 1000); sein Export ist nicht gemessen, sein Kern-Text ist
derselbe wie bei den zwölf anderen Worten.

Zeit von ortPlan (flacher Grund, Node, kalt / warm): dorf 21 mit 36 · 144 · 1000 Häusern 774 · 3982 · 13 386 ms → 352 · 1199 ·
3374 ms; dorf 3 144 1593 → 571 ms; dorf 3 300 2430 → 961 ms; dorf 7 und die kleinen Worte gleich (≤ 230 ms).

## (2) Im Spiel: „dorf 7 1000“ gegründet und begangen (GTX 1060, Welt in 1920 × 1080, `r._schirm()` = breite 1920, hoehe 1080)

Am Anker von stadt-voll, der Spieler am Anlauf (400/400). Zwei Läufe, beide gleich in der Stadt:

- Gründung des Worts: **42 s** (41,5 und 42,4 s) bis das Kern-Viertel steht. Gedächtnis `d:7@856,439` mit `nH 500, stadt 1000`.
- Summe der Worte: Kern 500 + 4 × 125 = **1000**. Die vier Viertel an den Kanten (−1,0 · 0,−1 · 0,1 · 1,0), jede Stelle trägt.
- Häuser am Grund: Kern Villaalto **357 Lose / 357 Häuser** (der Plan am echten Grund trägt 357 der 490 Lose des flachen
  Plans — Wasser und Hang; das ist der Plan der Wand, wie ihn „dorf 7 1000“ auch vor dem Schnitt trug), Viertel Terramare
  **133 / 133**, Viertel Castelmare **130 / 130**. Beide in mediterran 1238 wie der Kern.
- Wegenetz: Feldweg Kern ↔ Terramare **682 m** (122 Punkte), Kern ↔ Castelmare **605 m** (95 Punkte). Am Stand der Abgabe
  (Lauf `bild3/`) nennt der Kern seine vier Viertel (3,−3 · −1,1 · 7,1 · 3,5) und die Dörfer der Welt um ihn (2,−1 · 1,3 ·
  5,3) als Nachbarn, Terramare den Kern und das Dorf −3,2; der Feldweg Kern ↔ Terramare liegt wieder mit 682 m.
- Ehrlich zur Folge der Läufe: Gang und Fahrt (`gang3/`) fuhren am Stand vor zwei kleinen Wirt-Schnitten — danach bleibt ein
  Dorf der Welt zwischen den Vierteln stehen (nur im Reich von Kern oder Viertel fällt es), und zwischen zwei Orten EINER Stadt
  zählt als Dritter nur ein Ort dieser Stadt. Der Weg des Viertels zur Welt (Bereiten, Erwachen, Zug) ist derselbe Code; die
  Zahlen des Preises sind nicht neu gemessen.
- Bilder (`bericht/1115-stadt-funktion/`): `kern-rand-blick-viertel.png` — 90 m über dem Rand des Kerns (380 m von seinem
  Anker) der Blick auf das Viertel Terramare in 610 m, der Feldweg führt hin; `vor-dem-viertel-von-oben.png` — 400 m vor dem
  Viertel; `gasse-im-viertel.png` — am Boden auf seiner Gasse (das laufende Spiel). Am Boden vom Kern aus verdeckt der Wald
  das Viertel (der Schritt ist 1024 m).

## (3) Der Preis des Gangs vom Kern ins Nachbar-Viertel (Bild-Abstände der rAF-Zeit, echter Takt)

| Abschnitt | Gehen 4 m/s (990 m, 250 s) | Wagen-Tempo 20 m/s (1024 m, 65 s) |
|---|---|---|
| im Kern, vor dem Bereiten | 5805 Bilder · p95 33,3 · größtes 150 ms · > 33 ms **5,5 %** | 373 · p95 50,0 · 108 ms · **30,8 %** |
| Bereiten → Erwachen (Export, Ort-Wahl, Grund) | 47,1 s · 2802 · p95 33,4 · 183 ms · **8,1 %** | 14,8 s · 562 · p95 41,7 · 117 ms · **28,3 %** |
| der Zug der Häuser | 40,7 s · 2600 · p95 33,3 · 183 ms · **5,7 %** | 37,1 s · 2216 · p95 33,4 · 192 ms · **8,4 %** |
| danach | 4198 · p95 33,3 · 258 ms · 5,8 % | — |
| ganz | 15 441 · p95 33,3 · **258 ms** · **6,3 %** · 20 Bilder > 100 ms | 3224 · p95 41,6 · **192 ms** · **16,0 %** · 11 > 100 ms |

Die Gründung des Viertels hebt sich im Gehen kaum vom Grund ab (8,1 % gegen 5,5 %); die größten Bilder des Gangs (258 und
208 ms) liegen nach dem Zug, im Strom der Welt. Am Erwachen selbst: 117 ms (Gehen), 175 und 192 ms (Wagen-Tempo).

**„Das Viertel steht, ehe es im Blick ist“ — NEIN, bei beiden Tempi.**
- Gehen: bereitet 614 m vor seinem Anker, Vorrat 5,6 s später, erwacht bei 425 m, erstes Haus 0,2 s danach, **Zug-Ende 40,7 s
  später bei 262 m** — der Spieler steht dann 19 m vor dem äußersten Haus (r_max 243 m) und sah 133 Häuser entstehen.
- Wagen-Tempo: bereitet 764 m, Vorrat 6,3 s, erwacht bei 467 m, Zug-Ende 37,1 s später — **der Spieler steht 13 s vor dem
  Zug-Ende in der Mitte des Viertels**.
Der Zug hebt 3,3–3,6 Häuser je Sekunde, gleich in welchem Tempo: damit ein Viertel von 125 Häusern steht, ehe sein Rand auf
100 m naht, müsste es bei Wagen-Tempo rund 1100 m vor dem Anker erwachen (heute 467 m), im Gehen rund 500 m (heute 425 m).

## (4) Die Kurve: Export kalt / warm, Plan, r_max je Wand (dorf 7, Node auf der OMEN, eine Zeile je Lauf)

| Häuser des Viertels | Lose | Export kalt | Export warm | Plan | r_max |
|---|---|---|---|---|---|
| 36 | 37 | 380–742 ms | 44–104 ms | 93 KB | 99 m |
| 88 / 125 | 94 / 133 | 1320 / 1151–1743 ms | 215 ms / — | 200 / 262–277 KB | 160 / 243 m |
| 144 | 152 | 1788–2132 ms | 349–441 ms | 332 KB | 359 m |
| 160 | 166 | 2268–2416 ms | 410–586 ms | 364 KB | 371 m |
| 300 | 308 | 4684–6130 ms | 1202–1272 ms | 604 KB | 416 m |
| 500 | 490 | 7260–9189 ms | 2454–3144 ms | 885 KB | 435 m |

Die Stadt mit 36 · 144 · 1000 Häusern gründet ihr Wort in 0,4–0,7 s · 1,8–2,1 s · der Zeit der Wand: bei Wand 500 7,3–9,2 s
(885 KB), bei 300 4,7–6,1 s (604 KB), bei 160 2,3–2,4 s (364 KB) — danach je Viertel im Blick, nie mit der Stadt: eine Frage
nach einem Viertel kostet 13–27 µs bei 10⁴ wie bei 10⁶ Häusern. Der Radius sättigt (371 m bei 160, 435 m bei 500): der Schritt
zweier voller Viertel ist bei 160 drei Zellen (768 m), ab 300 vier (1024 m).

## Befunde am Rand (nicht geschnitten)

- **Ein Dorf des Worts im Reich der Stadt:** in beiden Läufen gründete die Welt selbst ein Dorf mit `d:`-Schlüssel (Portomare,
  13 Lose, mediterran 1360, bei −96/644; Brandau, 21 Lose, alpin 1081, bei 498/537 — 371 m vom Anker des Kerns, im Radius
  seiner Häuser). `_wortOrtVerdraengt` und das Reich der Stadt halten nur Zellen fern, kein Wort eines anderen Sprechers.
- **Der Zug wartet ohne Ende auf ein Haus unter dem Spieler:** steht der Spieler am Anlauf, während dort die Zelle eines Dorfs
  erwacht, bleibt ihr Zug bei 12 von 13 stehen (`_dorfOffen` 1, mein erster Lauf: 230 s ohne Ende) — die Werkbank am Ort
  stadt-voll umgeht es (der Zug ruht bis nach der Gründung).
- **Der Macher am GPU-Schloss** gibt nach 600 s auf (FUND-REGISTER 15.11. 00:40).

Geschnitten: Wende-Suche byte-gleich; `viertelWort` + Erbe im Kern, das Viertel als Zelle der Welt im Wirt, der Kern am Wegenetz; Z4 + Selbst-Test S.
Gemessen: ortPlan dorf 21 1000 13 386 → 3374 ms bei gleichem sha; alles bis 500 byte-gleich (12 ortPlan-Worte, 8 Exporte, Rang-Welt 56fef038); dorf 7 1000 im Spiel = 357 + 133 + 130 Häuser gesetzt von 357 + 133 + 130 Losen, Feldwege 682 und 605 m; Gang > 33 ms 6,3 % (größtes Bild 258 ms), Fahrt 16,0 % (192 ms); das Viertel steht bei keinem Tempo, ehe es im Blick ist (Zug 37–41 s für 130 Häuser).
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND
