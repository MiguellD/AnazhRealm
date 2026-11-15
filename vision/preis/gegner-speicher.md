# Gegner Speicher: „der Speicher folgt dem Blick ohne Loch“ (ZWISCHENSTAND)

Kopf: Zweig w28-preis-ort cab90667 (Schnitt 2 HEAP N1 N2 N3 + Schnitt 3), Spiel-Baum nur gelesen, keine Datei des Spiels geaendert.
Geraet: Radeon 890M, `werkbank start --echt --ort wiese` 1920 x 1080, GPU-Schloss `gegner-speicher`, 15.11. 04:15-04:33 (Rechner-Uhr).
Fahrt (kein Dauer-Werkzeug): `artifacts/profiband/auge/w28-preis-ort/gegner-speicher.cjs`, Roh `.../gegner-speicher/ergebnis.json` + `lauf.log`.
EINE Sitzung, die Schleife des Spiels laeuft (`__loop(true)`), Bild-Strom je rAF, Spione zur Laufzeit um 11 Methoden der Instanz
(`_saatGeht`, `_pruneDistantVoxelChunks`, `removeArchitecture`, `spawnArchitecture`, `_tickSaat`, `_forestPlantChunk` …), je Lesung
zwei GC (`/puffer`); die GC-Fenster sind aus dem Bild-Strom geschnitten.

Ablauf: Wiese (-280,4/-1045,6) einschwingen · DREI TATEN (Birke bei -280,19/-1030,43 gefaellt mit `harvestArchitecture(…, "player")`,
Werk `wandlaterne_dorf` gesetzt, `voxel_carve` 2,5 m: Boden 27,61 -> 25,11) · Teleport Wiese-Ost -> Dorf -> West -> Wiese ·
Pendeln an der Chunk-Grenze x = -302,4 (klein: +-8 m bei 6 m/s, 52 s; gross: +-90 m bei 40 m/s, 36 s) -> Wiese · Teleport 3,35 km
(+3000/+1500) -> Wiese. Bestand = jeder Eintrag in `state.architectures` binnen 150 m um die Wiese (Herkunft, Art, Ort auf 0,1 m).

## Was haelt (kein Fund)

- **Die Taten des Spielers ueberleben drei Rueckkehren:** der gefaellte Baum kehrt nicht wieder (`baumWieder` null, `_tatAm` wahr), das
  Werk steht, die Grube steht (25,11 an jeder Rueckkehr). Kein Doppel im Bestand (0 Orte doppelt, alle drei Rueckkehren).
- Kein Loch im Wald: 1410 Feld-Wuerfe vor, 1411 nach jeder Rueckkehr (die Abweichung unten).
- VRAM folgt dem Blick: 127,7 an der Wiese -> 122,9 / 126,4 / 124,2 an den Rueckkehren.

## Funde

| # | Fund | Ort | Zahl | Warum es ein Fehler ist |
|---|---|---|---|---|
| F1 | **Der Heap kehrt nicht zurueck**, er waechst an derselben Pose mit jeder Fahrt | Lesungen nach zwei GC | Wiese 263,8 -> zurueck 316,6 -> nach dem Pendeln 332,8 -> nach 3,35 km 349,9 MB; +86,1 MB in 14,0 min = **6,1 MB/min** (Preis 5); die erste Runde allein +52,8 MB in 6,4 min = 8,3 MB/min | Die Annahme des Schnitts 2 („Zuwachs 2,4 MB/min“) haengt am Tempo der Fahrt: dieselbe Posen-Folge (BERICHT: +42,8 MB) in 6,4 statt 18 min reisst den Preis. Das Wachstum ist eine Funktion des WEGS, die Linse teilt durch die Wanduhr — wer langsam faehrt, wird GRUEN |
| F2 | **Ein Halter ausserhalb des Schnitts und ausserhalb der Offen-Liste:** `_trittSchwach` | `stamm/siedlung-wege.js:1014` (setzt je betretener 2-m-Zelle), geleert nur je Welt-Tag `:1118-1120` | 4 814 -> **31 919 Eintraege** (Wiese -> Rueckkehr 3) | „die Datei waechst mit den Aenderungen, nie mit dem Weg“ (`:1009`) gilt fuer den Stand; das fluechtige Gedaechtnis daneben waechst genau mit dem Weg und faellt nie nach Abstand |
| F3 | **Die Wald-Gedaechtnisse wachsen weiter** (im BERICHT als offen benannt, hier mit Zahl nach dem Schnitt) | `r._forestDartMemo`, `_waldFlugVon`, `_freistandMemoVon`, `_freistandMemo`, `state.scatterLookup`, `state.scatterPromoted`, `state.lifeField`, `_pegelOrte` | 2 229 -> 7 413 (x3 Karten gleichen Schluessels), 1 580 -> 6 701, 2 375 -> 9 298, 1 028 -> 4 137, 312 -> 669, 98 -> 422 | raeumen nie nach Abstand |
| F4 | **Der Abschied der Saat liegt ausserhalb der Frist** — Bilder ueber 100 ms beim Teleport | `stamm/gelaende-fern.js:57` `this._saatGeht(drop)` NACH der Frist-Schleife `:26-28`; je entfallenem Chunk jeder Baum einzeln `removeArchitecture` (`:91-92`) | Bild 124,3 ms: `_pruneDistantVoxelChunks` 67,1 ms, davon `_saatGeht` 66,2 ms mit 87 x `removeArchitecture` 64,1 ms (Teleport weit zurueck); Bild 102,3 ms: `_saatGeht` 39,7 ms, 128 Abbauten 37,8 ms (Dorf); Bild 126,3 ms: `_saatGeht` 18,8 ms (West) | Die Frist (`_bauFrist("abraeumen")`) zaehlt nur `_disposeVoxelChunk`; die Abbau-Kosten des Chunks (0,74 ms je Baum) kommen danach ungedeckelt in dasselbe Bild — „kein Bild ueber 100 ms“ |
| F5 | **Der Wald kehrt anders zurueck** als er stand | Bestand binnen 150 m, vor der ersten Fahrt gegen jede Rueckkehr | **6 von 1410** Feld-Wuerfen getauscht: 6 Feuerstellen (`glutbrunnen` bei -209,5/-1000,1 · -291,6/-1082,2 · -313,2/-1086,5 · -308,9/-1090,8 · -339,1/-1099,4 · -175,0/-1142,6) fehlen, an ihrer Stelle stehen 7 Baeume/Straeucher 0,4-1,8 m daneben (Kiefer, Tanne, Eiche, Hasel); identisch an allen drei Rueckkehren | Der Schnitt behauptet „Kehrt er wieder, saet er aus dem Samen neu“ (`stamm/gelaende-fern.js:63-64`) — die Wiederkehr ist eine andere Welt als der Boot. Die Ursache ist nicht gelesen (Verdacht: der Boot saet mit der Probe im Haupt-Faden, die Wiederkehr mit dem Feld des Fadens, `stamm/vegetation-baum.js` `_saatFeldBestellen`) |
| F6 | **Pendeln reisst die Saat ab und saet neu**, auch ohne den Ring zu verlassen | `stamm/gelaende-fern.js:14-18` (`bleibt`: Ring um den Spieler + 1 ODER Ring um den Vorlauf-Punkt `_bedarfVoraus`), N2 haengt die Saat daran | +-8 m um die Grenze, 6 m/s, 52 s: **115 Chunks entsorgt**, 124 neu gepflanzt, 320 Wuerfe neu gesetzt, p95 38,7 ms (70 Bilder > 50 ms); +-90 m bei 40 m/s, 36 s: 1 001 Chunks entsorgt, 902 neu, 2 483 Wuerfe, `_tickSaat` 1 778 ms + `_forestPlantChunk` 752 ms + Pflanz-Schlange 1 152 ms im Haupt-Faden, **12 Bilder > 100 ms, groesstes 196,5 ms** | Der Vorlauf-Ring kippt mit jeder Umkehr; seit N2 bezahlt jede Umkehr den Neubau des Walds im Haupt-Faden (vor N2 fiel `voxelPopulatedChunks` nie) |
| F7 | `renderer.info.memory.geometries` steigt monoton | Lesungen | 288 -> 345 -> 419 -> 498 -> 565 -> 676 -> 758 -> **817** (Texturen 51 konstant) | Nach N1 noch derselbe Anstieg wie im Befund Heap vorher (275 -> 510); wer die Geometrien haelt, ist nicht gelesen |

Typed-Halter (`__heapHalter`) Wiese -> Rueckkehr 3: `state.hydroTiles` 3,27 -> 9,62 MB (offen benannt), `_foundry.cache` 17,2 -> 22,2,
`_erstZeichnung.imFlug` 0 -> 2,97, `state.leichname` 0 -> 2,89, `_leibWegA.q` 0 -> 2,65. Summe Typed 124,4 -> 145,5 MB: von den +86 MB
liegen +21 in Typed-Arrays, der Rest in Objekten ohne Zensus (F2, F3, F7).

## Bild-Strom je Strecke (ohne GC-Fenster)

| Strecke | Bilder | p95 ms | groesstes ms | > 100 ms |
|---|---|---|---|---|
| Teleport Wiese-Ost | 3 730 | 21,3 | 92,8 | 0 |
| Teleport Dorf | 3 945 | 33,6 | 102,3 | 1 |
| Teleport West | 4 083 | 28,3 | 126,3 | 1 |
| Teleport Wiese zurueck | 6 435 | 26,9 | 103,3 | 2 |
| Pendeln klein | 3 123 | 38,7 | 77,1 | 0 |
| Pendeln gross | 2 186 | 65,8 | 196,5 | 12 |
| Wiese nach dem Pendeln | 6 191 | 44,5 | 105,9 | 2 |
| Teleport weit hin | 3 067 | 52,8 | 83,7 | 0 |
| Teleport weit zurueck | 4 773 | 51,0 | 124,3 | 1 |

Ehrlich offen: keine Referenzfahrt in dieser Sitzung (p95 nicht gegen die Ruhe gerichtet); kein Bildpaar der getauschten Feuerstellen;
die Ursache von F5 und der Halter von F7 sind nicht gelesen; F6 ohne Gegenfahrt am Stand vor N2.
