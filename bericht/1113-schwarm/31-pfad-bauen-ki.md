# 31 v1-Pfad 3+4: Werkstatt bauen und mit der KI erschaffen — der Wille wartet hinter dem Strom

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
Kein Bild gesehen: in BILD (`genom-spiel/`, `genom/c-bau/` = Mensch, `studio-welt/`, `wiese-mitte/`) und in `probe-post/` liegt kein Bild des
Akts „F gedrückt → Werk im Bild". Was die Zahl über den Spieler sagt (nicht das Auge): nach dem Setzen steht das Werk im Datum, aber das
Bild zeigt es 1–5 s lang NICHT (Phase „bild" unten). Ein Haus aus der Hotbar erscheint warm erst nach 1,1–1,8 s, ein GT kalt nach 3,4–4,9 s.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
- Meisterkarte (PM `punkte/stand.json`): bauen 9/10 · ki 7/10 · physik 7/10. Offen in bauen NUR `bauen.K1#2` „Wille → Werk ≤ 1 s" (Z. 264–296):
  GTX ec281422 ROT „6/8 Werke in L0 im Bild · werkstatt p95 kalt 3881 · warm 1812 ms · hotbar kalt 4631 · warm 1826", Radeon UNGEMESSEN
  (Werkbank-Absturz Exit 3221226505 an 36f9d45a). ki offen: K3#2, K4#2 ohne Station, K5#2 „kein Werkzeug" (Z. 1346–1392). physik offen:
  K2#2 beide ungemessen, K4#2/K5#2 ohne Station (Z. 2638–2730; Kurs-B-Blatt Z. 123, 165–166).
- Die Station zerlegt jeden Fall in fünf Phasen ab der ersten Taste (`scripts/diag-werkstatt-weg.cjs:1128`: eingabe · steht · l0 · bild · gpu;
  `bild` = Werk steht in L0, aber zog noch nicht für die Kamera, Z. 1027–1038). Rohe Zeilen `messung/roh/<sha>-<gerät>/bauen.K1_2.out`, Z. 273–280
  (ec281422-gtx), dasselbe Muster an 5b9c6427-gtx, b1531071-gtx, 1cd1c408-radeon, dc9eacb0-radeon, 350e6b11-radeon:

  | Fall | eingabe | l0 | bild | Summe (GTX ec281422) |
  |---|---|---|---|---|
  | werkstatt · Eiche · Ego kalt | 1302–2322 | 1353–2801 | 6–45 | 3881 |
  | rezeptbuch · Haus · Third kalt | 1810–3047 | 333–2691 | 14–2559 | 6136, Bau-Hash ≠ L0 (Stufe 1) |
  | hotbar · GT · Ego kalt | 203–406 | 0 | **3448–4923** (dc9eacb0-radeon: 28) | 4631 |
  | werkstatt · Teil · Third kalt | 584–944 | 0 | **1163–1542** | 2602 |
  | hotbar · Haus · Ego warm | 114–233 | 0 | **1087–1841** | 1826 |
  | werkstatt · GT · Ego warm | 517–1352 | 0 | 11–40 | 1812 |

  Summe über die 8 Fälle an ec281422-gtx: bild 9 831 ms · eingabe 9 176 ms · l0 1 756 ms — **die größte Phase ist „steht, aber nicht im Bild"**.
- Wurzel der Phase bild, zwei Bauer an EINER Frist:
  (a) Haus = Satz-Art: eine neue Gruppe tritt mit Budget 0 in Raten ein (`stamm/siedlung-satz.js:133` `ohne ? Infinity : 0`, `:158` →
  `_bauSatzRateNeu`), Stück 2048 Ecken (`:1651`), je Takt nur bis `_bauFrist("satz")` (`:137`), nah zuerst (`:355`). Ein Haus trägt
  36k–108k Ecken (Kommentar `:101`) = 18–53 Stücke; bekommt „satz" nur sein Pflicht-Stück je Takt, sind das 18–53 Bilder = die gemessenen 1,1–1,8 s.
  (b) GT/Teil kalt: jeder neue Stoff baut seinen Knoten-Graphen in Raten (`stamm/bild-kosten.js:745` `_knotenRate`, `:876`
  `_bauFrist("knoten", true)`), 60–100 ms je Stoff (`:850`). dc9eacb0-radeon zeigt bild 28 ms für den GT kalt: stand sein Stoff schon in der Welt, fällt die Phase.
- DIE EINE Frist (`stamm/dirigent-takt.js:1847` `_bauFrist`, `BAU_FRIST_MS = 6`, `BAU_ALTER_MS = 3`, `:2455–2459`): Vortritt kennt sie nur aus
  dem HUNGER (`:1859–1862`), nie aus dem Akt des Spielers. Das Werk, das der Spieler eben setzte, baut wie Strom, Wald, Karte und Streu.
- Der Vorbau der Bedienung (`stamm/siedlung-bauten.js:1365` `_vorbauBedienung`, `:1386` `_geistVorbau`) baut je Hotbar-Bauplan den GEIST
  (Stoff `_ghostMaterialFor`, `:1261`, mit Tönung `:1197`) — nie die Stoffe des Werks selbst. Das Gesetzbuch KANN den Vorbau ohne Raum
  (`_vorbauGast`, `:1440`); die Welt KONSUMIERT ihn für den Geist, das gesetzte Werk zahlt seinen Knoten-Bau danach.
- Ein Weg für Werkstatt, Rezeptbuch, Hotbar und KI: `fertigeBlueprint` → `confirmBuild` (`stamm/koerper-seele.js:1300–1308`,
  `stamm/werkstatt-bauen.js:376`); der KI-Satz über `spawn_studio` → `_dslSpawnStudioItems` → `spawnArchitecture`/`_naturSetzen`
  (`stamm/feld-dsl.js:2067–2151`), Stempel `_studioStampFor` (`stamm/werkstatt-vorschau.js:864`). Ohne Schlüssel trägt der Satz-Parser
  `spawn_studio` (`stamm/feld-sprache.js:521–563`). Die KI-Werke zahlen dieselbe Phase bild.
- KI gemessen: `ki.K1#2` 41/41 gegen qwen3:4b über ollama (lokal, ohne Schlüssel); `ki.K5#1` p95 Satz → Welt 2,41 s (Soll ≤ 6 s). Drehbuch-
  Schritt 18 (`docs/abnahme-drehbuch.md:30`) mit fremdem Schlüssel: kein Lauf gefunden.

## Die EINE begrenzende Entscheidung
**Das Werk des Willens ist nie Strom.** Was der Spieler setzt (Werkstatt, Rezeptbuch, Hotbar, sein Satz an die KI), hat in der EINEN
Bau-Frist Vortritt vor jedem anderen Bauer, bis es im Bild steht — und der Vorbau, der heute nur den Geist baut, baut die Stoffe des Werks
mit. Die Frist je Takt bleibt 6 ms (+3 Alterung): nur die Reihenfolge ändert sich, nie die Kosten am Schirm.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Stufen (alle in EINER Welle, jede Phase des Akts):
1. Akt → Marke: `confirmBuild` (`werkstatt-bauen.js:376`) und `_dslSpawnStudioItems` mit menschlicher Quelle (`feld-dsl.js:2111/2137`,
   `werk: !this._feldHandelt(ctx)`) tragen den Schlüssel des gesetzten Werks in EINEN Stand `st.wille` (Gruppe · Render-Objekte · Takt).
2. `_bauFrist` (`dirigent-takt.js:1847`): solange `st.wille` offen ist, ist der Bauer des Willens der Vortritt (wie der Hungrigste, `:1861`),
   vor dem Hunger. Die Marke fällt, sobald das Werk für die Kamera zog (dieselbe Lesung wie die Station: `diag-werkstatt-weg.cjs:1033`).
3. Satz (`siedlung-satz.js:133/137/352`): der Bereich des Willens legt ab dem Akt mit der vollen Frist, nicht mit Budget 0.
4. Knoten (`bild-kosten.js:745/876`): ein Render-Objekt des Willens geht dem `_erstWartet`-Rest voraus.
5. Vorbau (`siedlung-bauten.js:1386–1428`): je Hotbar-Bauplan neben dem Geist das Werk selbst (L0-Blätter mit eigenem Stoff,
   `_foundryFlattenFor(werk, preset, 0)` wie `:1255`) als Gast ohne Raum — der GT-Stoff steht vor dem ersten F.
Leser-Liste (wer liest, was sich ändert): jeder Rufer von `_bauFrist` verliert in den Takten des Willens seinen Vorrang — Strom
`gelaende-chunks.js:2780` · Planer-Jobs `dirigent-takt.js:1723` · Pflanzung `vegetation-baum.js:2405/2924` · Streu `vegetation-streu.js:1165` ·
Karte `stoff-karte.js:891/1207` · Hüllen `studio-gestalt.js:106` · Stufen `siedlung-bauten.js:195` · Fern `gelaende-fern.js:25/1979` ·
Altern `siedlung-satz.js:1090`; Leser der Satz-Raten `dirigent-takt.js:632` (`o.bau` zählt sie, Welt steht); der Vorbau-Gast:
`_vorbauFehlt` (`siedlung-bauten.js:1466`), `_gastOhneRaum` (`:1458`); Linsen: `scripts/diag-werkstatt-weg.cjs:1020–1038` (L0-Senken),
`gate:takt` T9 (Kommentar `dirigent-takt.js:1820`), `gate:werkstatt-weg` (Gast im Freiraum, `siedlung-bauten.js:1438`).
Kosten-Zeile: je Takt unverändert ≤ BAU_FRIST_MS 6 ms + 3 ms Alterung; der Vorbau läuft nur bei ruhender Eingabe (`:1368`) mit
ERST_BAU_MS 4 je Render-Aufruf (`bild-kosten.js:3728`); je zusätzlichem Hotbar-Werk ein Gast mehr im Vorbau (bis 8). Ankunft B: der
Vorbau beginnt erst nach `_weltbildDa` (`:1368`), das Weltbild zahlt nichts.
Kriterien: `bauen.K1#2` Ist 1/2, GTX ROT werkstatt kalt 3881 · hotbar kalt 4631 · warm 1826 ↔ Soll p95 kalt und warm ≤ 1000 ms,
8/8 L0 — Station `bauen.K1#2` (gtx + radeon, Bild-Weg). Erwartung (nicht gemessen): Haus warm bild 1,1–1,8 s → ~0,2 s (60 ms Arbeit
bei 6 ms je Takt), GT/Teil kalt bild → wie dc9eacb0 (28 ms). Mit-Gewinn: `ki.K5#1` (Satz → Welt) misst dieselbe Phase.
Bildpaar: Dorf am Prüfplatz, feste Kamera Ego hinter dem Spieler, Hotbar-Haus und Hotbar-GT, Schuss +0,3 s nach F — vorher leer, nachher Werk.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Kein Zweig trägt den Vortritt des Willens (Suche über `origin/w2*`: werk|bau|vorbau|satz|knoten — keiner).
- `w28-richter-hand3-pm` 8afcd41a (Punkte-Maschine, nicht Spiel): der Mess-Halt `wetterHalten` verweigerte KI- und Teilen-Werke in
  `bauen.K5#2` (`feld-dsl.js:305 _messHalt`); muss vor jeder neuen bauen-Messung in der PM stehen, sonst misst die Station den Halt.
- `w28-ki-tat-reist` eae278d5 GELANDET (Tat der KI reist zum Mitspieler, gate:mp-sync GRÜN Radeon).
- Bis zur Landung fehlt alles aus „Der Schnitt"; Radeon-Station `bauen.K1#2` braucht erst eine Werkbank, die nicht stirbt (Exit 3221226505, unbenannt).

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Nicht gemessen: dass „satz" und „knoten" in diesen Fällen nur ihr Pflicht-Stück bekommen — die Zahl „1,1–1,8 s = 18–53 Stücke" ist
  gerechnet aus `:101` und `:1651`, die Ecken-Zahl des Hauses nicht gelesen. Messname vor dem Schnitt: `_bauHunger.get("satz"|"knoten")`
  je Takt zwischen F und `bildT` im Fall hotbar · Haus · warm.
- Phase eingabe (0,6–3,0 s kalt, Summe 9,2 s) nicht zerlegt: Kandidat `selectBlueprintForEdit` → `_renderWorkshopDOM` +
  `_workshopRebuildPreviewMesh` synchron (`stamm/bau-buch.js:2448–2452`) — nicht gemessen, auch Puppeteer-Anteil unbekannt.
- Phase l0 Eiche kalt 1,3–2,8 s (Foundry-Worker) — der Vortritt hilft nur, wenn die Worker-Schlange voll ist; nicht gelesen.
- Rezeptbuch × Third zeigt Stufe 1 statt L0 (Bau-Hash ≠ L0, beide Geräte, jede Messung): Gesetz der Stufen (Auge = Kamera) gegen das
  Kriterium — nicht entschieden, kein Soll bewegt.
- Drehbuch 18 mit fremdem Schlüssel nie gelaufen; physik.K2#2 („Bild ≠ Kollision", Bär Spalt 0,033 m) nicht gegraben.
- `stamm/bau-vorlagen.js` nicht gelesen (der Schnitt berührt es nicht).

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Wirkung 4 (jedes gesetzte Werk, auch das der KI, erscheint im nächsten Bruchteil statt nach 1–5 s; +1 Punkt bauen.K1#2 nur, wenn auch
eingabe und l0 fallen) · Aufwand M · Risiko: der Vortritt hungert in den Takten nach dem Akt Strom und Wald aus — der Bodenstrom beim
Gehen nach dem Setzen muss im selben Lauf an `gate:takt` T9 grün bleiben.
