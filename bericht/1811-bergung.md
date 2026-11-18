# Bergung 18.11. — was ungelandet liegt (gelesen an main c50e6b61)

Zeilen 119 (Umfang A 56 seit 08.11. mit Inhalt < 85 % und neu ≥ 20; Umfang B 63 Abgabe-Zeilen davor mit Inhalt < 50 % und neu ≥ 60).
Richter je Zeile ist der Inhalt: die Pickaxe der neuen Kennungen in origin/main (pfad-begrenzt) plus die Textstelle in `koordination`.

| Urteil | Zeilen | Familien |
|---|---|---|
| IN MAIN | 2 | 2 |
| ENTSCHIEDEN | 24 | 20 |
| ÜBERHOLT | 18 | 12 |
| VERLOREN | 32 | 15 |
| UNGEKLÄRT | 40 | 21 |
| LAUFEND (nicht beurteilt) | 3 | 3 |

LAUFEND: w28-lava-nachlauf (670/71 %), w28-haus-stoff (186/1 %), vorrat8-ankunft (90/0 %).
Spalten unten: Größe = Dateien / neue Zeilen ≥ 30 Zeichen / Anteil davon in main. Überlappung = Dateien, die laufende Schnitte auch ändern.

## VERLOREN nach Rang

1. ~~w28-stadt-netz~~ — GELANDET 18.11. 03:58, main c1e6f29a (z609); Beleg am Inhalt: STADT_NETZ 11 Treffer, kachelNetz 8 in origin/main:fachwerk-core.js. Die Zeile ist gestorben.
2. **ferne-ton-Familie** (w26-ferne-ton, -2, -3, -3-vorher, -4, w27-ferne-ton-5 155abda9: 33 Dat. / 649 / 4 %). Spieler: die Ferne trägt den Farbton der gemessenen Wiese statt eines grauen Schleiers.
   Zahlen: Farbton bei 8 km 5,22° → 2,75°, B/G 0,13 → 0,24. FARB_SPEKTRUM · HALM_FARBE nie in main.
   Halt: ferne-ton-5 fragt „Welches dieser Maße der gemessenen Wiese folgt, setzt du“ — nie beantwortet; 13.11. „Liegt ohne Arbeiter“. -2 war Täter von z347 (Bodenfarbe steuerte die Rad-Haftung).
   Überlappung: vorrat8-ankunft (bild-kosten, dirigent-regler, siedlung-bauten, stoff-material), w28-haus-stoff (stoff-material), w28-lava-nachlauf (diag-stand-takt).
3. **w28-weg-koerper** b1ffbea3 (5 / 415 / 4 %). Spieler: Wege haben Körper (Bord, Belag, Höhe) statt einer Farbe auf dem Gras.
   Beleg: WEG_GESETZ nie in main; Byte-Beweis Dorf/Stadt steht, „im Bild noch UNGESEHEN“; die Kette „fassade + stoff-fuge + weg als EINE Abgabe“ fuhr nie.
   Überlappung: w28-haus-stoff (fachwerk-core), w28-lava-nachlauf (siedlung-wege).
4. **w4-b-code-Familie** (w4-b-code, -heim, -heil, -heil3…6, claude/youthful-albattani; heil6 f8c8e85a 92 / 446 / 36 %). Spieler: das erste Bild kommt früher, weil späte Module erst danach laden (Pflicht B).
   Zahlen: V8-Übersetzen vor dem Bild 1 259 → 223 ms. Beleg: _spaetLaden · SPAET_DATEIEN · type="spaet" nie in main; z117 ROT, „gehört zurück an seine Cloud-Sitzung“, niemand nahm ihn auf.
   Überlappung: breit (vorrat8-ankunft mit 8 Stamm-Dateien, w28-haus-stoff, w28-lava-nachlauf) — Bergung nur als Neubau am heutigen Boot, nicht als Merge.
5. **w4-stadt-orte** + claude/festive-hawking 4b958d88 (22 / 2 752 / 49 %). Spieler: Straßen nach Rang, Quartiere und ein Rundkurs in der Stadt (Pflicht C und F).
   Beleg: STRASSEN_RANG · Quartier · Rundkurs nie in main; kurs-C „Warum er nie fuhr, weiß ich nicht.“ Überlappung: alle drei laufenden Schnitte.
6. **w28-studio-seiten** ad504fbe (10 / 531 / 11 %). Spieler: Studio-Seiten der Werkstatt tragen die Gestalt aus dem Gesetz. Stand: WIP der Notbremse, ungeprüft, niemand nahm ihn auf.
   Überlappung: vorrat8-ankunft, w28-haus-stoff (studio-gestalt).
7. **w28-reise-raeumt** 6e659b8e (7 / 266 / 3 %). Spieler: nach jeder Reise räumt die alte Welt ab, der Heap wächst nicht pro Sprung. Zahl: Heap 500 → 1 975 MB über fünf Sprünge (FUND-REGISTER 15.11.); „Ruht … kein Schnitt gelandet“.
   Überlappung: vorrat8-ankunft (dirigent-ankunft, stoff-instanz), w28-lava-nachlauf (speicher-laden).
8. **w4-e-buendel** 4e707672 (110 / 1 654 / 8 %). Spieler: flüssigerer Takt durch gebündelte Zeichen-Befehle (Pflicht E). Zahl: −54…−79 % direkte Draws. bRuecke nie in main; zuletzt in UEBERGABE 01.11. gelistet. Überlappung: vorrat8-ankunft breit.
9. **w4-gehege-Familie** (gehege, 2, 3 f82209de: 15 / 353 / 13 %). Spieler: Tiere im Gehege (Wolfs-Gehege des Prüfplatz-Plans, Pflicht F). GEHEGE_GESETZ nie in main; z124 fiel an Atlas R2 (4 004 > 4 000), nie neu gefahren. Keine Überlappung.
10. **heap-zensus-Familie** (w28-heap-stichprobe f41d8a36 2 / 335, -spiegel 171, -zensus 69). Spieler: nichts direkt; das Werkzeug, das LAGE zitiert („CPU-Kopien NICHT der Hebel“), steht in keinem Stand von main (HEAP_ZENSUS nie). Keine Überlappung.
11. **w28-baum-schirm** bef69ba3 (17 / 98 / 0 %). Spieler: weniger Baum-Aufploppen am Schirmrand. Zahl: Pop 0,0672 → 0,0537 %; Lauf stand mitten im Heilen. Überlappung: vorrat8-ankunft (7 Dateien), w28-haus-stoff.
12. **w28-fruehbild** 313303c4 (4 / 129 / 8 %). Spieler: ein Bild nach 14,7 s statt 23,0 s, aber Weltbild +1,9 s — Pflicht B. „Ruht“ (LAGE). Überlappung: vorrat8-ankunft (bild-kosten, dirigent-ankunft, dirigent-takt), w28-lava-nachlauf (bild-himmel).
13. **w28-rasen-schnitt** 5787be8a (4 / 224 / 7 %), Rest nach dem Entscheid: Feuchte dunkelt den Boden (Versatz 0,250 → 0,033), _pflegeAt nie in main; „Das Maehen faellt, die Wiese bleibt“ — die Wiese fuhr nie. Keine Überlappung.
14. **w28-reibellipse** 92879eab (3 / 68 / 3 %). Spieler: Reifen haften nach Reibellipse statt getrennter Längs/Quer-Grenze. „Kein Zug, bis das Mass der Invariante entschieden ist“ — offen. Keine Überlappung.
15. **w28-seiten-stille** 4e0f2942 (1 / 30 / 0 %). „nur der Abgabe-Commit fehlt“ (UEBERGABE 13.11.). Keine Überlappung.

## IN MAIN (je Zeile)

- w28-stadt-netz b0438afc — z609, main c1e6f29a (18.11. 03:58).
- w4-z140-rueckfall — e9e72c1d · 6ec77269 „Abgabe w4-z140-rueckfall“.
- schatten-k1-zuwachs — als schatten-k1-zuwachs-neu 42c3c967, Merge e55b67b3.

## ENTSCHIEDEN (je Familie, Zitat · Quelle)

- w28-geister-wand, w28-baum-wechsel, w28-stoff-stufe-null, w28-samen-karten-stufe, -live-tausch, -lichtweg, -wiese, -fahrzeug (8) — „TOT, offen benannt, NICHT gelöscht“ · FUND-REGISTER.
- w28-stoff-fuge — „FÄHRT NICHT und bleibt liegen“ · FUND-REGISTER, Entscheid Dach.
- w28-baum-ganz — „(WIP 850bfcf2, NICHT landen)“ · FUND-REGISTER.
- w28-wiese-mitte — „der Stand landet nicht (von oben liest die Karte als Streifen)“ · LAGE.
- w28-griff-ellbogen — „GEPARKT … schlechter als a071dc“ · FUND-REGISTER.
- w28-beet-feuchte — „zurückgezogen — geht in w28-rasen-schnitt auf“ · LAGE.
- w26-lack-glas — „material.K4#1 Radeon UNGÜLTIG“, zurückgehalten · Schwarm 13.11.
- w26-programm-katalog + -vorher, w25-pipeline-vorwaermen + -vorher — „Gewinn nicht belegt“ · UEBERGABE 09.11. abends (das Vorwärmen steckte im Katalog).
- w22-zug-auswahl — „kein Zug-Gewinn; ersetzt durch Vorlauf/Nachlauf“ · zug/abgeloest.txt.
- w23-wiese-zurueck — „Revert abgesagt 08.11. (Schöpfer: vorwärts heilen)“ · abgeloest.txt.
- w23-pruef-welt + -heim — „offen gefallen mit Zahl w23-pruef-welt-heim“ · heimholer.
- w22-zeitraffer — „gemessen 1,11× statt Ziel ≥ 5× — geparkt ohne Punkt“ · abgeloest.txt.
- w17-bild-kollision — „fiel offen (VK 142 → 56 Ankünfte, Pflicht C)“ · abgeloest.txt.

## ÜBERHOLT (je Familie, Ersatz in main)

- w24-wiese-ferne + -z — w24-wiese-ferne-y in main (z339) · abgeloest.txt.
- w25-ankunft-block-2 — w26-ankunft-block-3; _wieseFernBereit stamm/vegetation-wiese.js:534.
- w25-ankunft-horizont — w26-ankunft-horizont (ZWEIG-INVENTAR).
- w25-stadt-takt — w26-stadt-takt-4b.
- w25-leib-raum — __leibRaumRefit foundry-core.js:7421 (52b38779 „Abgabe w26-leib-raum“).
- w25-spike-gpu-vegetation — gebaut in w25-gpu-wahl; PASS_WAHL_WGSL stamm/bild-wahl.js:630.
- w26-fahrt-planer — _nahWieseFernKachel stamm/vegetation-wiese.js:451; sein FARB_SPEKTRUM-Teil zählt zur ferne-ton-Familie.
- w17-gesicht, w4-mensch-kopf + claude/trusting-cerf — __leibHaut foundry-core.js:7166 (erst f72a7137 w21-leib-bau).
- w12-/w13-ankunft-faden + claude/zealous-dijkstra, claude/eloquent-bardeen — _eingabeRuht stamm/dirigent-ankunft.js:497 (55ca13d2), w27-ankunft-faden und Squash 2ac706fac.
- w4-p2-spielgang-k3 — 55ca13d2 und e0f979a9 („Abgabe w4-p-spielgang-k3-heil“), stamm/werkstatt-hud.js:649.
- w4-proben-tempo — w4-proben-tempo2 7521ca51.
- feld-peers — _feldAkt stamm/feld-leben.js:2259 (erst d7b71daf w14-wunsch-akt).

## UNGEKLÄRT (je Familie, was fehlt)

- w25-ankunft-wiese-nach (2 776 / 54 %) — KONFLIKT, ABAB-Messung WIP; fehlt der Abgleich gegen die heutige Ankunft-Karte.
- w23-vorlauf (525 / 3 %) — zugForm nie in main; fehlt der Beleg, dass der Zug-Dienst ihn ersetzt (er liegt im Zug-Werkzeug, nicht im Spiel).
- w28-wiese-fern (297 / 7 %) — „KEINE Abgabe, solange Ego reißt“, die +7,3 ms bestätigten sich nicht; fehlt, ob w28-wiese-schale (187a30f0 in main) seine Ferne-Dichte trägt.
- w28-heap-haus (28 / 0 %, Abgabe) — _foundry.cache 82,5 → 75,3 MB, „Gesamt-Heap ohne messbaren Gewinn“, Preis ROT 417,9 > 400; fehlt der Entscheid.
- w28-damm-ferne (20 / 5 %) — Probe-Fix gelaende.K2, in keinem Text erwähnt.
- fluss-webgl-Familie (w4-fluss-webgl, -2, heil-fluss, -2, heil-webgl, -2, heil-webgl-diag, e-vram-heim, ankunft-3, ankunft-5, claude/intelligent-carson; 11 Zeilen) — FOUNDRY_UV nie in main, z124 fiel; fehlt, ob die Fluss-/WebGL-Fehlerklasse heute anders geheilt ist.
- w4-stadt-takt3/4/5 + claude/relaxed-euler — _bewohnerZahl nie in main, stadt-takt2 landete (20c412d6); fehlt, ob die Bewohnerzahl heute anders getragen wird.
- w4-licht-baustein + claude/inspiring-albattani — main zitiert ihn nur (scripts/diag-wasser-leben.cjs:761), checkBandLichtBaustein nie.
- spike-stadt-koerper + claude/quirky-sagan — „Spike, nie abgegeben zum Zug“ (kurs-C); _stadtKoerperBestellen nie; fehlt das Spike-Urteil.
- w4-stadt-takt, w4-b-himmel, w4-b-dorf, w4-p2-profiband-k1, w4-p2-vegetation-k1, w4-takt-drift + claude/practical-ptolemy, w4-takt-z80 + claude/relaxed-heisenberg, w3w-wald, spike-ci-konsum, physik-bild + claude/vibrant-galileo, spike-pixel-statt-welt + claude/nice-cray, claude/modest-volta (spike-satz-faden) — Kennungen nie in main, letzte Textspur 29.–31.10. (z76/z95, Konflikt-Listen); fehlt je Familie der Abgleich gegen die heutige Lösung der Klasse.

## Wache

`ungelandet.cjs` (dieser Ordner): eine Zeile mit allen Zweigen der letzten N Tage, deren Inhalt < 85 % in main steht, Abgabe zuerst. Selbsttest an c50e6b61 GRÜN 4/4 (nennt w28-stadt-netz, nicht die drei Squash-Zweige), Laufzeit 7,9 s; `--tage 7` an origin/main 15,1 s (44 Zweige gemessen, 32 genannt).
