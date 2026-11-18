# Stadt-Schnitt — Synthese aus Karte, vier Entwürfen, vier Prüfungen (gelesen am Lese-Baum origin/main d3ddb51c)

Marken: [g] selbst gelesen · [r] gerechnet (node, Laptop) · [k] aus Karte/Prüfblatt übernommen, nicht nachgelesen · [s] geschätzt.

## 0 Was allen vier Entwürfen fehlt (beim Namen)
1. Keiner hat den Zweig `origin/w28-stadt-netz` gelesen (alle melden „Karte fehlt“). Er trägt das überlebende Prinzip schon gebaut:
   `kachelMassen` (fachwerk-core.js:3746 im Zweig [g]), `planMassen` und die EINE Regel `hausMasse` beider Stufen (Zweig, fachwerk-core.js
   nach :3790 [g]), den Ferne-Takt `_stadtFerneTakt` und den Halter `_stadtMasseStand` (Zweig, stamm/siedlung-wege.js:1450–1600 [g]).
   Main trägt davon 0 Symbole [g: git grep am d3ddb51c]. Abstand: 22 Commits vor, 510 hinter d3ddb51c; 16 Dateien, +1 407 / −279 [g].
2. Die „Plan-Decke“, an der INDEX, FELD und STREICHEN in der Prüfung brechen (Export 5,6–10,8 s je Viertel [k], EIN Export zur Zeit,
   stamm/siedlung-ort.js:2705 [g]), gilt für die Ferne nicht: Stufe 1 braucht nur `DORF` (die Hausliste, 6,9 ms je 500er-Viertel [k, Feld-
   Entwurf gemessen]) und das Netz, 2–4 ms je Kachel (Zweig-Kommentar über `STADT_MASSEN` [g]) — der Export trägt erst die echten Lose.
3. Mitspieler: das Portal sucht Bauten per id im Bestand (stamm/netz-portal.js:445, :743 [k]) — kein Entwurf sagt, was ein nicht gehobenes
   Haus dort antwortet. Ungelesen; Pflicht-Frage an Kopf 2.

## 1 Das Prinzip, das die Prüfung übersteht
STREICHEN + INDEX in ihrem Kern (beide Prüfungen: „das Prinzip steht“): ein Haus ist nur dort ein Eintrag, wo ein Leib es berühren kann;
überall sonst ist es EINE Masse in einem Pool der ganzen Stadt — gebaut aus derselben Hausliste, nie aus einem zweiten Gesetz.
Drei Stufen, EINE Regel (`hausMasse`):
| Stufe | Reichweite | Quelle | Daten je Haus | Kosten wachsen mit |
|---|---|---|---|---|
| Ferne (Stufe 1) | jenseits des Pixel-Horizonts des Hauses | `kachelMassen` = `viertelWort` → `DORF` → Netz-Plätze | 7 + 6 Float = 52 B Matrix-Quelle [g Zweig: lage n×7, ton n×6] | Kacheln im Bild |
| Mitte (Stufe 2) | diesseits des Horizonts, Plan exportiert | `planMassen(plan)` an den ECHTEN Losen | dieselben 52 B | Kacheln mit Plan |
| Leib (K0) | ≤ 325 m (nearM × fernFaktor, stamm/siedlung-bewohner.js:1585 [g]) | `spawnArchitecture`-Eintrag wie heute | Eintrag + Blocker + Mesh | Fläche, nie N: 279 Häuser [r: 500/(π·435²) · π·325²] |
Der Halter (aus dem Zweig, er heilt den härtesten STREICHEN-Bruch „Übergang ohne Halter“): die Masse eines Loses steht, solange das Haus
kein eigenes Bild trägt (`!entry._ziegelSlot && !_archIsRendered`, Zweig stamm/siedlung-wege.js:1577–1586 [g]) — kein Loch, kein Doppel.
Der Wechsel 1 → 2 (die Gefahr, die der Zweig selbst nennt: „Stufe 2 legt ihre Lose auf demselben Netz anders“ [g]) liegt am EIGENEN
Pixel-Horizont des Hauses — `_satzHorizont` (stamm/dienst.js:743–747 [g]), DASSELBE Gesetz, kein d_H-Zwilling (die FELD-Pfropfung ohne ihren
Fehler): bei 1080p/75° trägt ein Haus von 100 m² Ansicht dort 16 px² → 1 760 m [r: 704 · √(100/16)]. Der Vorrat muss also jedes Viertel mit
Anker bis Horizont + 0,5 km exportiert haben: 15 Viertel [r: π·2,26²/1,049], kalt 86–165 s Worker [r: 15 × 5,6–10,8 s].

## 2 Der EINE Chokepoint
`_dorfZugSchritt` (stamm/siedlung-ort.js:2293 [g]) — Zeile 2342 `neu.push(this._spawnSettlementSlot(sl, q.origin, f, so))` [g] macht JEDES
Los des Plans ohne Blick auf den Abstand zum Eintrag (einzige Ausnahme: der Spieler-Freiraum, :2321–2330 [g]). Hier sitzt die Liste je Haus:
Bestand, Blocker, Satz-Anmeldung, Laternen (:504–513, :540 [g]); die drei Prüfungen INDEX, STROM und die Karte benennen dieselbe Stelle.
Der Schnitt: der Zug URTEILT jedes Los (Wasser-Wand `_fundamentLand`, Bau-Wand `_bauFrei`, :494–503 [g]) und schreibt das Urteil in
`plan.gefallen` (:2338–2341 [g], dort schon nicht aufzählbar, Plan-Hash bleibt byte-gleich) — er HEBT den Eintrag nur im Leib-Ring und
senkt ihn beim Verlassen. Das heilt den Bruch „fern ≠ nah“ (INDEX- und STREICHEN-Prüfung): die Bau-Wand liest Genesis-Flächen als
Funktion (`_genesisFlaeche`, :340 [g]) und fremde Einträge über `_blockerUmPlatz` (:355 [g]) — die Lose eines Plans überlappen sich nicht,
also urteilt sie fern wie nah, wenn sie am Zug-Akt einmal je Los fragt. Speicherstand trägt das: Orts-Häuser sind `ausGesetz: true`, „der
Stand trägt ihn nie“ (:525 [g]).

## 3 Die Köpfe (Reihenfolge; zwei Schneider teilen nie eine Datei, gleichzeitig laufen nur Köpfe ohne gemeinsame Datei)
**Kopf 1 — der Zweig landet (EIN Schneider, allein, er sperrt seine 16 Dateien).**
Fällt: die Absenz jenseits der wachen Kacheln (grep „skyline|fern-stadt“ in stamm: 0 [k]); der Satz je Stadt-Haus jenseits 300 m
(3266c01fe2 [k]). Spieler sieht: die Netz-Stadt steht als Massen bis zum Horizont statt neun Kacheln auf der Wiese. Zahl: Häuser mit Bild
÷ Häuser des WORTS im Blick (Nenner Σ `viertelWort(...).nH`, die korrigierte Zahl der STREICHEN-Prüfung) am Messort der Netz-Stadt — der Zweig
meldet 42 750 Häuser im Bild, p95 25,0 ms [k, bericht/1115-stadt-gross]. Dateien: die 16 aus `git diff --stat d3ddb51c...origin/w28-stadt-netz`
[g], darunter fachwerk-core.js, stamm/siedlung-ort.js, stamm/siedlung-wege.js, scripts/lib/ort-proben.cjs; dazu spec/profiband/haushalt.json
(neuer Messort „dorf 7 4750“, den die Karte und zwei Prüfungen vermissen). Nebenwirkung: `breite.siedlung#1` wird messbar (heute ROT am
fehlenden `kachelNetz` [k]).

**Kopf 2 — Eintrag nur im Leib-Ring (nach Kopf 1; EIN Schneider).**
Fällt: der Eintrag je Stadt-Haus jenseits 325 m samt Blockern, Cull-Wache, Laternen-Eintrag; die Zug-Wartezeit je Viertel (37–41 s für 130
Häuser [k, b0f25c2db4]) als Bedingung des Bildes — Stufe 2 steht, sobald der Export da ist. Dazu: der Vorrat zieht den Export bis Horizont
+ 0,5 km vor (erst nach dem ersten Weltbild — Pflicht B darf keine Last bekommen); `_staedte` (stamm/siedlung-ort.js:1430 [g]) liest die
Sieger des Rangs neben den Gedächtnissen (für Kopf 4). Spieler sieht: dasselbe Bild (der Halter), aber die Stadt wartet nicht mehr auf den
Zug. Zahl: Stadt-Einträge in `state.architectures` an der Netz-Stadt stehend — 1 829 (stamm/dienst.js:726 [g]) → ≤ 279 [r]. Dateien:
stamm/siedlung-ort.js, stamm/siedlung-bauten.js, stamm/siedlung-bewohner.js (das Heim als (Viertel, Los-Index), `_bewohnerMelden` liest
schon den Plan, :625 [k]), stamm/netz-portal.js (Antwort für ein nicht gehobenes Haus).

**Kopf 3 — Stufe 1 → 2 am Pixel-Horizont (parallel zu Kopf 2 nach Kopf 1; EIN Schneider).**
Fällt: der Wechsel der Massen erst beim Zug-Ende (Zweig: `_stadtMasseZugEnde` [g]); neu wechselt eine Kachel auf `planMassen`, sobald ihr Plan
im Vorrat liegt, und jedes Haus steht diesseits seines Horizonts an seinem Plan-Los. Spieler sieht: kein Springen der Häuser beim Nahen —
der Ortswechsel des Loses fällt hinter 16 px². Zahl: Anteil der Häuser diesseits ihres Horizonts, die an ihrem Plan-Los stehen, über eine
Fahrt mit 20 m/s auf die Stadt zu (Schwelle ≥ 0,99). Dateien: stamm/siedlung-wege.js (liest `_satzHorizont` aus stamm/dienst.js, ändert sie nicht).

**Kopf 4 — die große Stadt im Spieler-Pfad (nach Kopf 2; EIN Schneider).**
Fällt: die Wand im Weltwurf `Math.min(GROESSE_WAND, …)` für die OBERSTE Rang-Stufe (fachwerk-core.js:3454 [g], „die oberste ist offen“
steht im Kommentar :3452 [g] — sie öffnet ihren Schwanz in `stadt`, die Viertel trägt `viertelWort`); die zahlenlose KI: `spawn_village`
nimmt `[positionNode, seed, gier, tanH, jahr]` ohne Häuserzahl (stamm/feld-dsl.js:1092 [g]) → ein Zahl-Argument. Spieler sieht: von der Ankunft
aus die Metropole der Standard-Saat (heute 500 Häuser, 3,0 km [k]) als Netz-Stadt über die Wand; der Satz „gründe eine Stadt“ gründet eine.
Zahl: Häuser der größten Stadt im Umkreis 5 km der Ankunft (heute 500 [k]). Dateien: fachwerk-core.js (nur `siedlungsGroesse`, additiv mit
Byte-Beweis für alle Stufen unter der obersten), stamm/feld-dsl.js, stamm/feld-leben.js (Wort „stadt|metropole“, heute „Keine Epoche“ [k]).

**Kopf 5 — die Nacht der Ferne (nach Kopf 3, derselbe Schneider wie Kopf 3: stamm/siedlung-wege.js).**
Fällt: die dunkle Ferne (grep „glut“ in stamm/bild-sicht.js: 0 [k]). Weg ohne Zwilling: der Packer wertet das EINE Fenster-Gesetz
(`fensterFern`/`fensterSchlaeft`, fachwerk-core.js:11894–11895 [k]) in JS je Haus über die Uhr-Stufen aus und legt je Haus einen Glut-Plan
in die Instanz (4 B [s]); die GPU liest nur das Byte, sie würfelt nie (die INDEX-Prüfung verwirft den WGSL-Port zu Recht). Ungelesen: welche
Eingänge der Würfel je Fenster braucht (fachwerk-core.js:2511–2518 [k]) und ob `hausMasse` sie liefert. Spieler sieht: die Stadt leuchtet
nachts bis zum Horizont. Zahl: leuchtende Häuser jenseits 325 m ÷ Häuser, deren Gesetz um Mitternacht Licht sagt (Schwelle ≥ 0,95).

## 4 Der erste Spike (≤ 1 Tag, EIN Schneider = Kopf 1)
Rebase der 22 Zweig-Commits auf main; die EINE Zahl vor jedem Weiterbau: Konflikt-Stellen je Datei (stamm/siedlung-ort.js 188 Zeilen,
stamm/siedlung-wege.js 537 Zeilen geändert [g Stat]) und danach Kopf-1-Zahl am Messort. Lebt: Rebase trägt, die Probe misst ≥ 0,9 der Häuser des Worts
im Blick bei p95-Delta ≤ +1 ms gegen main am selben Ort. Stirbt: verlangt der Rebase eine zweite Fassung des Zugs neben der von main,
fällt der Zweig — dann baut Kopf 1 `kachelMassen`/`planMassen`/`hausMasse` neu auf main (fachwerk-core.js + stamm/siedlung-wege.js),
nie als Zwilling neben dem alten Satz.

## 5 Der kürzeste Weg in den echten Spieler-Pfad
Kopf 1 (Massen-Ferne an main) → Kopf 4 (oberste Rang-Stufe über die Wand + Zahl im KI-Satz). Danach steht die große Stadt am Weg von
der Ankunft, ohne Wort von Hand; Kopf 2 und 3 machen sie beim Nahen tragfähig. Die Standard-Saat braucht dafür EINEN Plan je Viertel im
Horizont — nicht 66 (STREICHEN) oder 241 (FELD).

## 6 Verworfen (je eine Zeile)
- FELD (Höhenfeld im March): 40 Schritte je Eintrag überspringen Dachkanten (stamm/bild-sicht.js:1987–1989 [k]), d_H 880 m ist ein Zwilling
  von `_satzHorizont` (1 760 m [r]), neue Primitive im Shader; gepfropft wird nur: der Horizont als Schalter.
- STROM (Gestalt-Bibliothek): der Same formt den Körper (fachwerk-core.js:5422 [k]), 100 statt 59 Gestalten je Viertel [k], kein Multi-Draw
  in r184 (stamm/siedlung-instanz.js:461–465 [k]) — Befehle bis ~6 200; gepfropft: nichts außer dem Chokepoint.
- INDEX (GPU-Tafel aus `huelle()`): 38–79 ms je Los Ableitung [k], Tafel ohne Bau-Wand, Fenster-WGSL als Zwilling; gepfropft: der Chokepoint,
  K0 unabhängig von N, der Puffer-Weg (stamm/stoff-instanz.js:483 [k]).
- STREICHEN-Teppich (Hash-Lose jenseits 4,7 km): zweite Stadt-Form, der Plan wächst sequentiell (fachwerk-core.js:3605–3608 [k]);
  `kachelMassen` ersetzt ihn aus derselben Hausliste. Der Rest von STREICHEN ist das Prinzip dieses Schnitts.
- Ehrlich offen in diesem Schnitt: die Massen sind Kasten + Satteldach, gröber als die Hülle `_huelleFern` (3,3 Teile, stamm/studio-bruecke.js:
  3011–3029 [k]) zwischen 300 m und dem Horizont; der CPU-Takt der Leiber (28,7 ms p95 bei 326 Häusern [k]) ist ein eigener Schnitt.

## 7 Nur die GPU entscheidet (drei Fragen)
1. Ist der Stufen-Wechsel am Horizont unsichtbar? Bildpaar desselben Hauses bei 0,9 × und 1,1 × Horizont, Tag, in Bewegung (Kopf 3).
2. Was kostet der Massen-Pool der Netz-Stadt an main: Frame- und CPU-Takt-p95 Kopf ↔ main am selben Ort, GTX + Radeon am SELBEN Kopf (Kopf 1).
3. Wie viel der 28,7 ms CPU-Takt an stadt-voll fällt mit Kopf 2 (Einträge) — und wie viel bleibt den Leibern.
