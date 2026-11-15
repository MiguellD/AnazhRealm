# GEGNER „Die Reise im Spiel" — gespielt am Kopf des Zweigs, 15.11.2026 08:57–09:05 (Radeon 890M, echtes Fenster)

**Drei Sätze.**
- **Angegriffen:** Gespielt wurde der Stand `w28-planet-kern` f186f9af (lokal; = a7e1b9ca, gepusht, + Merge main 4ee205bd), denn
  Schnitt 2 lag beim Angriff UNCOMMITTET im Baum (gelaende-core.js, letzte Schreibung 08:32:24, ein Bauer arbeitete dort) und
  Schnitt 3 existiert nicht: Im echten Spiel kann der Spieler NICHT reisen — „reise 5 20", „reise -72 0", „reise 35 80",
  „reise -10 -140", „reise 30 -40", „reise 35 80 -100", „reise nach 35 80", „reise 5° N 20° O" antworten „Unbekannter Befehl.
  Meintest du: 'reise'?", „reise heim" antwortet „Meintest du: 'ziehe heim'?", die Welt bleibt byte-gleich (Welt-Id, Samen,
  Meer −3 m, Abdruck der Höhen 1220265353 vor und nach jedem Satz).
- **Gemessen:** „reise" sagt in der Heimat „43,43° N · 12,08° O, Küste 289 km (planet-h2-2)" 2 735 ms nach dem Enter (Enter
  191 ms nach dem ersten Weltbild); der Welt-Wechsel von heute (Satz → erstes Weltbild der Ziel-Welt) kostet bei einer frischen
  Welt 2 759 · 3 527 · 4 258 · 4 878 ms (Median 3 893 ms), bei einer schon besuchten 2 858 · 3 013 · 3 056 ms, das größte Bild in
  den 5 s danach 67–134 ms — die Annahme des Sprungs „≤ Welt-Wechsel + 0,7 s" heißt an der Radeon unter fremder Last ≈ 4,6 s.
- **Offen:** KONSUM-TIEFE im Spiel 0 von 23 Feldern (kein Gesetz liest den Planeten, nur eine Zeile der Konsole liest Lage und
  Küste), kein zweiter Ort, keine Zeit, kein Bild eines Ziels; zwei Funde treffen Schnitt 3, bevor er gebaut ist (F1 der Samen des
  Ankers ist der Samen der Welt, F2 der Planet-Faden rechnet die Hydrosphäre jeder Kachel mit).

---

## 0 Was gespielt wurde und wie

- Baum: eigener Arbeits-Baum `.claude/worktrees/gegner-reise-spiel`, detached an f186f9af (der geteilte Baum `w28-planet-kern`
  blieb unberührt — dort lag Schnitt 2 offen). main-Kopf beim Angriff: 4ee205bd (V18.546.292-Linie; das Blatt nannte 01a6714a).
- Welt: `werkbank start --echt --ort wiese` (1920 × 1080 ab dem Boot), je Bild `r._schirm()` = 1920 × 1080, 703,7 px je m.
  `r._laubRand()`: 129,6 m im ersten Bild der Heimat, 187,8–216 m nach dem Lauf.
- Weg des Spielers: der Satz geht ins Feld der Konsole (`chat-input`, Enter → der Lauscher `stamm/dirigent-ankunft.js` 641 →
  `processChatCommand`), nie eine Abkürzung der Werkbank. Die Antwort liest ein MutationObserver an `chat-output`.
- Sonde und Rohdaten: `artifacts/profiband/auge/planet-reise/gegner/gegner-reise.cjs`, Lauf 1 `…/gegner/lauf1/spiel.log`
  + `spiel.json`, Lauf 2 `…/gegner/lauf2/spiel-zwei.log` + `spiel-zwei.json`. Je Lauf EIN Griff am
  GPU-Schloss (`gpu-lauf.sh`, 2 min 9 s und 1 min 30 s), danach kein Port, keine Welt.
- Falle der Sonde (Lauf 1): die Werkbank hält den Takt zwischen ihren Befehlen an — die Heimat stand bei den Sätzen 1–10 noch
  unter dem Ladeschirm („Die Welt erwacht … 6 Bäume und Bauten wachsen", Bilder `lauf1/00-heimat.png` bis `06-reise-heim.png`).
  Die Antworten „Unbekannter Befehl" gelten (der Satz-Abgleich hängt nicht am Bild), der stumme erste „reise" in Lauf 1 ist die
  Falle der Sonde, kein Fund. Lauf 2 lässt den Takt laufen wie beim Spieler.

## 1 Die Ziele (je Ziel: Satz · Werte · Bild · Urteil)

| Ziel | Satz | Antwort der Konsole | Welt danach | Bild | Urteil |
|---|---|---|---|---|---|
| Heimat | `reise` | „Diese Welt liegt bei 43,43° N · 12,08° O …, die Küste 289 km entfernt (Samen „anazh-realm-seed", Kern planet-h2-2)" nach 2 735 ms | unverändert | `lauf2/10-heimat-takt.png` (Wald der Wiese, Laub 129,6 m) | der Anker kommt und stimmt mit dem Blatt des Bauers |
| Äquator-Wüste 5° N 20° O | `reise 5 20` | beim ersten Mal keine (Ladeschirm), beim zweiten Mal (Satz 11) „Unbekannter Befehl. Meintest du: 'reise'?" | Id, Samen, Meer −3, Abdruck gleich | `lauf1/01-…png` (Ladeschirm) | **kein Ort** — die Heimat steht, nicht einmal mit anderem Etikett |
| Polar-Küste 72° S 0° | `reise -72 0` | keine (Ladeschirm) | gleich | `lauf1/02-…png` | kein Ort |
| Hochgebirge 35° N 80° O | `reise 35 80` | „Unbekannter Befehl. Meintest du: 'reise'?" (126 ms) | gleich | `lauf1/03-…png` | kein Ort |
| Insel im Ozean 10° S 140° W | `reise -10 -140` | „Unbekannter Befehl …" | gleich | `lauf1/04-…png` | kein Ort |
| im Meer 30° N 40° W | `reise 30 -40` | „Unbekannter Befehl …" | gleich | `lauf1/05-…png` | kein Ort |
| mit Zeit | `reise 35 80 -100` | „Unbekannter Befehl …" | gleich | — | keine Zeit |
| Schreibweisen | `reise 5° N 20° O` · `reise nach 35 80` | „Unbekannter Befehl …" · „Unbekannter Befehl — sag „hilfe" …" | gleich | — | Schnitt 3 muss sie lesen oder beim Namen abweisen |
| heim | `reise heim` | „Unbekannter Befehl. Meintest du: 'ziehe heim'?" | gleich | `lauf1/06-…png` | **Falle für Schnitt 3:** der Vorschlag zeigt auf einen fremden Satz |

Was der Auftrag je Ziel fragt (Schnee, Meer, Gestalt, Wetter, Nähte an der Ankunft, Siedlung/Bewohner/Tore, Wasser über oder unter
dem Land, schwebende Dinge, Gebautes nach `reise heim`, zweimal derselbe Satz, Abbruch, Speichern und Laden am Ziel): **an keinem
Ziel prüfbar, es gibt kein Ziel.** Diese Prüfungen stehen offen für den Kopf mit Schnitt 3, mit dieser Sonde (Phase eins: die
Ziel-Liste, Phase zwei: Takt und Konsole) in ~2 min je Lauf wiederholbar.

## 2 Der Preis: der Welt-Wechsel von heute als Maß des Sprungs

Satz → `_weltBetreten`/`createNewWorld` → `_weltWechsel` (`stamm/speicher-laden.js` 1232) → erstes Weltbild des neuen Stands
(`state._weltbildDa`, der EINE Schreiber `stamm/dirigent-ankunft.js` 884), Takt läuft, Radeon unter fremder Last (2–6 Wartende am
Schloss, Schwärme aktiv) — gilt nur relativ.

| Wechsel | Satz → erstes Weltbild | größtes Bild im Tausch (Ladeschirm) | größtes Bild 5 s danach | p95 danach |
|---|---|---|---|---|
| Heimat → frisch a | 4 878 ms | 628 ms | 134 ms | 33,8 ms |
| a → Heimat (besucht) | 2 858 | 494 | 67 | 33,3 |
| Heimat → frisch b | 3 527 | 611 | 117 | 42,2 |
| b → a (besucht) | 3 056 | 728 | 75 | 33,8 |
| Heimat → frisch c | 4 258 | — | — | — |
| c → Heimat, Enter 119 ms nach dem ersten Bild von c (Abbruch) | **6 284** | — | — | — |
| Heimat → c (besucht) | 3 013 | — | — | — |
| c → frisch d | 2 759 | — | — | — |

- Frisch: Median 3 893 ms (2 759–4 878); besucht: 3 013 ms (2 858–3 056). Das Soll des Sprungs aus dem Blatt („≤ Welt-Wechsel von
  heute + 0,7 s") ist damit an der Radeon ≈ 4,6 s bis zum ersten Bild. Die Sprosse `same.massstab.sprung` 1 misst „ganz"
  (≤ 2 % Lücke), nicht das erste Bild — diese Zahl ist die untere Schranke, nicht der Richter.
- Der Wechsel, der direkt am ersten Bild der vorigen Welt geht, kostet 6,3 s statt 2,9–3,1 s: der Tausch wartet auf den Speicher-
  Faden der Welt, die gerade erst entsteht (`_speicherVerlassen` → `_speicherStill`, `stamm/speicher-laden.js` 1245–1247). Ein
  Spieler, der „reise …" zweimal schnell tippt, zahlt das. Schwere: sichtbar (Ladeschirm 6 s).
- Kosten-Zeile B (Ankunft kalt): nicht neu gemessen (ein Boot je Lauf ist kein ABAB); der Bauer misst 13,36 s main ↔ 13,15 s Kopf
  bei Spannweite 2,49 s. Neu gelesen: das Manifest lädt `planet-core.js` (173 417 B) in JEDEN Studio-Faden vor dem ersten Weltbild
  (`stamm/studio-bruecke.js` 325–336 holt jedes `scripts` des Manifests, 803–870 wertet sie aus); Laden + Auswerten des Kerns in
  node 8–20 ms je Faden (drei Läufe) — klein gegen die Spannweite, aber eine Kosten-Zeile der Ankunft, die kein Leser vor dem Bild
  braucht.

## 3 Funde

| # | Fund | Ort | Beleg | Wurzel (Datei:Zeile) | Schwere |
|---|---|---|---|---|---|
| F0 | Die Reise existiert im Spiel nicht: kein Satz `reise <B> <L>`, kein `reise heim`, keine Zeit; Schnitt 2 lag beim Angriff uncommittet im Baum des Bauers, Schnitt 3 ist nicht begonnen | alle fünf Ziele | `lauf1/spiel.log` Sätze 4–11 | `stamm/feld-leben.js` 1361–1392: die einzige Zeile `re: /^reise$/i` (1367) | **bricht die Annahme** (das Ziel der Welle) |
| F1 | Der Samen des Ankers ist der Samen der WELT, nicht der des Planeten. Jede `erschaffe welt` hat einen eigenen Samen (`w-c0e8967d616e-wdie9k`, `w-efebe4bce16e-jqoej9`, `w-857a84024230-9yt99l`, `w-b1bc3f048b60-l9hirr`) und damit einen EIGENEN Planeten. Eine Reise-Welt mit Ort-Saat `<Samen>@<B>_<L>_<Zeit>` (ENTSCHEID-REISE §1) läse dort einen dritten Planeten: „reise" am Ziel nennte eine falsche Lage, und jede Weiter-Reise von dort rechnete auf einem fremden Körper | Heimat 43,43° N 12,08° O; a 45,14° S 96,38° W; b 43,75° S 49,17° W; c 44,21° S 82,38° W; d 46,18° S 63,94° W | `lauf1/spiel.log`, `lauf2/spiel-zwei.log` | `stamm/gelaende-chunks.js` 628 (`const samen = this._gelaende().seed`), `stamm/gelaende-boden.js` 738–740; der Planet-Samen muss aus `worldMeta.gesetz.ort` kommen, nicht aus der Saat der Welt | **bricht die Annahme** von Schnitt 3, ehe er gebaut ist |
| F2 | Der Planet-Faden ist ein voller Neben-Faden: Geburt mit dem ganzen Zustand der Welt + jeder Region per Kopie (`hydro-an`), danach JEDE Zustands-Nachricht, und jede neue Hydro-Kachel rechnet er SELBST (`hydro` reist an jeden Neben-Faden) — für eine reine Funktion des Samens, die keinen Weltzustand liest und je Samen einmal läuft. Mit jeder Kachel, in die der Spieler läuft, rechnet ein vierter Faden die Hydrosphäre umsonst | jede Welt | Code gelesen, ungemessen | `stamm/gelaende-chunks.js` 598–601 (Geburt), 440–446 (`_voxelZustandPost` an alle Neben-Fäden), `stamm/gelaende-boden.js` 371, `voxel-worker.js` 127–138 (`hydroRegion` in jedem Faden), 143–151 | Kosten (ungemessen; Gebot 7: Kosten an Bewegung statt an Nutzen) |
| F3 | Jede Welt liegt auf ihrem Planeten bei 43–46° Breite: der Anker ist die Stelle, an der das Klima der Heimat gilt — und das Klima ist in jeder Welt dasselbe. Die Lage ist darum keine Eigenschaft der Welt, sondern eine Konstante des Gesetzes; Leser im Spiel: keiner | 5 Welten | Liste in F1 | `voxel-worker.js` 1085–1092 (`planetAnker` am konstanten `ortGesetz()`) | Rand (erwartet, aber der Satz klingt nach Information) |
| F4 | `reise heim` schlägt heute `ziehe heim` vor — trägt Schnitt 3 `reise heim` nicht als eigene Zeile VOR der Ähnlichkeit, landet der Spieler in einem fremden Satz | Heimat | `lauf1/spiel.log` Satz 10 | Vorschlag der Konsole (`_chatHandleConversationalFallback`, `stamm/feld-leben.js` 1139 → 1637) | Rand |
| F5 | Abbruch am Fenster des Ankers (Welt c verlassen 119 ms nach ihrem ersten Bild, zurück, `reise`): die Antwort kommt nach 3 ms, kein Hängen; die Tafel `_planetAnkerJe` trägt danach nur den Samen von c — sie lebt je Welt, nicht je Sitzung | c | `lauf2/spiel-zwei.log` | `stamm/gelaende-chunks.js` 629, `stamm/speicher-laden.js` 1339 | hält (Angriff abgewehrt) |
| F6 | Der Anker kommt 2,9 s nach dem ersten Weltbild (Enter 191 ms nach dem Bild, Antwort 2 735 ms danach): wer „reise" sofort tippt, wartet ~3 s auf eine Zeile ohne Zeichen des Wartens | Heimat | `lauf2/spiel-zwei.log` | `stamm/gelaende-chunks.js` 632–636 (Bild → Leerlauf ≤ 2 s → Faden-Geburt → Auftrag) | Rand |

## 4 Konsum-Tiefe und Sprossen

- Konsum-Tiefe im Spiel heute: **0 von 23 Feldern** des Planeten bewegen ein Gesetz oder ein Bild; ein Leser (die Zeile der
  Konsole) liest 3 Größen (Breite, Länge, Küste) als Text. „ort.leser 1 (voxel-worker.js)" des Bauers zählt den Rechner des
  Ankers, keinen Leser des Orts.
- Sprossen: diese Welle bewegt heute **keine** — `same.massstab.sprung` 1 (Teleport, ganz ≤ 30 s) verlangt einen Sprung an einen
  nie besuchten Ort, `same.entfaltung.reise` und `same.kopplung.zeitreise` verlangen Ort und Zeit; gemessen ist nur die Tür, durch
  die der Sprung gehen soll (Abschnitt 2).
- Nicht angefasst, nicht gebraucht: keine der gesperrten Stellen (studio-gestalt, gelaende-fern, dirigent-takt, Kaskaden,
  vegetation-streu, stoff-material, dirigent-regler, gelaende-chunks 1073–1103, daten 663–679, fachwerk-core, Siedlungs-Wirt,
  foundry-core/koerper).
