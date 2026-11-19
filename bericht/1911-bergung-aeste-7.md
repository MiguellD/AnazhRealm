# Bergung: sieben Äste ohne Besitzer, Befund (nur gelesen)

Gelesen am 19.11.2026 15:19 (Systemuhr), main 986eff04, koordination 3ac7ab21 (LAGE). Nichts verschoben, nichts entschieden.

- **w28-weg-koerper · c · ÜBERHOLT.** Der Neubau w28-weg-koerper-neu a9d39b64 ist in main (Merge a2152dfe). Er geht mit WEG_GESETZ einen anderen Weg: der Bord wird im Boden-Stoff gemalt, „ohne Geometrie, dc +0“, „der Bord hat keinen Tritt“. Der Ast baut dagegen den Gehsteig als Erdbau mit Glieder-Pool und würde damit einen Zwilling bringen.
- **w28-baum-schirm · b · TRÄGT REST.** Netto −164 Zeilen, merge-tree sauber: die Verdeckung in Metern fällt, und `useOcclusionDemotion` steht in main unverändert (4 Treffer wie an der Basis). Der Gewinn ist Pop 0,0672 → 0,0537 % bei GPU −2,18 ± 3,36 Punkten. LAGE vom 18.11. sagt dazu schon „fällt offen, kein sichtbarer Gewinn“.
- **w28-fruehbild · c · ÜBERHOLT.** Ein zweites, früheres Bild steht hier neben der EINEN Regel in main „der Ladeschirm weicht dem fertigen Weltbild“ (dirigent-ankunft.js:780). Gemessen bewegt es Pflicht B rückwärts: Weltbild 21,3–23,6 → 23,9–28,3 s. LAGE 18.11.: „fällt offen, widerspricht ‚ein Bild unter dem Schirm, nie zwei‘“.
- **w28-reise-raeumt · b · TRÄGT REST.** Rund 434 Zeilen in 11 Dateien, nichts davon in main (`__anazhStoffe`, `_gruppeVergessen`, `stoffeWelt`, Linse speicher-sprung: je 0 Treffer). Der Ast greift genau das an, was die Register-Abgabe a7c3f12f selbst „ehrlich offen“ nennt: nodeBuilderCache 3,52 → 9,72 MB und Heap R2−R1 +9,3 MB ohne Täter. 2 Konflikt-Dateien, an der GPU ungeprüft.
- **w28-heap-zensus · a · IN MAIN GLEICHWERTIG.** Sein Kern, das V8-Sampling je Besteller, steht über w28-heap-zensus-2 499b6926 in der EINEN Runde (draw-zaehler.cjs:556–600, `heapBesteller`/`heapStichprobe`/`jsHeapUrteil`). Übrig bleiben die eigene Werkbank-Route, also ein Zwilling, und zwei Befund-Texte.
- **w28-heap-spiegel · c · ÜBERHOLT.** Er ist ganz in w28-heap-stichprobe enthalten (Vorfahr) und hat keinen eigenen Rest. Seine Frage ist mit Nein beantwortet: LAGE:624 „CPU-Kopien NICHT der Hebel“, 39,4 MB gespiegelt, ≈ 8,5 MB leserfrei.
- **w28-heap-stichprobe · b · TRÄGT REST.** In main fehlen der Müll-Modus (MB/s je Erzeuger, `includeObjectsCollectedBy…`: 0 Treffer), das Bewohner-Gewicht und die Textur-Wache. Sein Befund wurde schon verbraucht: das Tuch-Gitter fiel in w28-heap-dorf 7cb86d4d. Er landet nur als Modus von `heapStichprobe` in draw-zaehler, sonst entsteht ein Zwilling. Ein Konflikt (werkbank.cjs), der WIP-Stand „hing zweimal über 6 min“.

---

## 1. w28-weg-koerper b1ffbea3 (137 h, 388 Zeilen laut Trocken-Liste)

1. **Ändert** (Basis 22872718, 13.11.; ein WIP-Commit „im Bild noch UNGESEHEN“): fachwerk-core.js +114, stamm/siedlung-wege.js +526, worlds/fachwerk/fachwerk.js 73, koerper-leib.js 7, diag-asset-inventory 5, modul-karte 2. Insgesamt 6 Dateien, +670 / −57. Für den Spieler wäre der Gehsteig ein Erdbau 12 cm über der Fahrbahn gewesen. Bord, Kantstein und Platten wären als Glieder im Kisten-Pool gebaut worden (`_wegKoerperStand/-Takt/-Fuellen/-At`), dazu eine Fußgängerzone von 11 m um den Platz (`wegZone`).
2. **In main:** w28-weg-koerper-neu a9d39b64 (Merge a2152dfe, 18.11. 12:31; V18.546.335). Dort steht `fachwerk-core.js:10393–10440` WEG_GESETZ mit `wegArt`/`wegQuerschnitt` (dieselben Namen), Zeile 10405: „Der Bord hat keinen Tritt: der Boden bleibt eine Ebene (12 cm ohne Stufe)“. Der Leser ist `stamm/siedlung-wege.js:820` (Fahrbahn als zweite Höhe) und `:1376` „DER BORD DES WEGS (TSL …)“. Die Abgabe-Message sagt: „ohne Geometrie und ohne Befehl (dc +0)“, Frame p95 25,05 → 25,01 ms (GTX). Am main-Kopf haben `_wegKoerperStand`, `_wegKoerperBau`, `_kopfsteinMittel` und `wegZone` je 0 Treffer.
3. **merge-tree:** CONFLICT in stamm/siedlung-wege.js. Die übrigen 5 Dateien mergen automatisch.
4. **Urteil (c) ÜBERHOLT.** main hat den Weg-Körper als Stoff gelöst (Bord gemalt, kein Tritt, dc +0). Der Ast würde einen zweiten Weg-Körper als Geometrie mit eigenem Stufen-Gelände daneben stellen. Die Entscheidung „Geometrie mit Tritt ja/nein“ hat main mit Nein getroffen.
5. —

## 2. w28-baum-schirm bef69ba3 (99 h, 98 Zeilen)

1. **Ändert** (Basis 4ee205bd, 15.11.): 18 Dateien, +113 / −277, davon siedlung-bauten.js −171, phytogenesis.js −65, siedlung-instanz.js 34, dirigent-regler.js 26, werkbank 16, diag-* (altlasten, ankunft, fernwald, foundry-crossfade, stand-takt) und schirm-proben. Netto bleibt nur Schnitt 3 (24dc4a3c): „die Verdeckung in Metern stirbt — Kronen-Gitter, Marsch, occDist 30 m, Schalter useOcclusionDemotion und das Urteil _occluded fallen; VOLL trägt die Brücke (`_lodSlotVollNachzug`, vollNode)“. Dazu kommt `_laubZiel` als EINE Funktion des Laub-Rand-Ziels. Die Schnitte 1, 4 und 5 fielen offen und wurden zurückgenommen. Der Spieler würde einen Baum hinter einer Krone nicht mehr als Karte sehen, sondern nach Abstand gestuft. Gemessen (koordination vision/fernfeld/bericht-baum-schnitt3.md:84): Pop-Median 0,0672 → 0,0537 %, GPU −2,18 ± 3,36 Punkte, „Karten über ihrem Gesetz im Blick 3 → 0“. Die Heilung 137f2d55 sagt: „baum 154 Instanzen / 333 946 Dreiecke gleich, Karten −2, GPU unaufgelöst“.
2. **In main nicht getragen:** `useOcclusionDemotion` hat main 4 / Basis 4 / Ast 1 Treffer, `_occluded` 12/12/2, `occDist` 7/7/3, `_laubZiel` 0/0/4, `_lodSlotVollNachzug` 0/0/8. Seit der Basis hat main die Verdeckung nicht angefasst und auch nichts anderes an ihre Stelle gesetzt.
3. **merge-tree:** sauber (Baum 42851b29, 1 Zeile).
4. **Urteil (b) TRÄGT REST:** 18 Dateien, netto −164 Zeilen, ein Klassen-Schnitt durch Löschen. Zur Heilung fehlen eine Vorprüfung `[ci voll]` am heutigen Kopf, das Bildpaar und die Pop-Zahl am Kopf. Die Basis ist vier Tage alt, die Überlappung mit späteren main-Schnitten in siedlung-bauten (w28-halter-register fed3ab96, w28-haus-stoff) ist textuell konfliktfrei, aber ungemessen. Stehender Entscheid in LAGE (koordination, Block „Bergung 18.11.“): „fällt offen: … w28-baum-schirm (Pop 0,0672 → 0,0537 %, kein sichtbarer Gewinn)“, ebenso UEBERGABE-2026-11-18.md:83.
5. Leiter `leben.pflanzen.dichte` (Saum springt) und Pflicht E nur, wenn die GPU-Zeit fällt (heute −2,18 ± 3,36, nicht signifikant). Keine Pflicht-Zeile wird belegt bewegt.

## 3. w28-fruehbild 313303c4 (91 h, 119 Zeilen)

1. **Ändert** (Basis 63655917, 15.11.; 3 WIP-Commits): dirigent-ankunft.js +163, bild-himmel.js 38, dirigent-takt.js 18, bild-kosten.js 2, modul-karte 4. Insgesamt 5 Dateien, +212 / −13. Ein frühes Bild unter dem Ladeschirm, sobald der Spieler-Kreis steht (`_fruehbildFrage/-Gilt/-Gezeichnet`), mit einem Dunst-Radius über die offenen Posten (`_dunstKreis/-Ziel/-Radius`). Messung in der Message (GTX 1050 kalt, n 8): frühes Bild 13,2–16,1 s, **Weltbild 23,9–28,3 s gegen heute 21,3–23,6 s**, 18–27 % der Bilder über 100 ms. Dazu „am kahlen Ankunfts-Platz zeigt das frühe Bild nur Boden im Dunst; keine Linse; Gates nicht gefahren“.
2. **In main:** alle Symbole des Asts haben 0 Treffer. main hat die EINE Regel `stamm/dirigent-ankunft.js:780` „DAS ERSTE WELTBILD … Der Ladeschirm … weicht nach dem ersten Frame, in dem das Weltbild FERTIG ist (`_weltbildFehlt` leer)“ (`_ankunftsBild`). Pflicht B geht main über den Haupt-Faden an (Squash 2ac706fa w28-ankunft-stapel).
3. **merge-tree:** sauber (Baum 5cfe8f98).
4. **Urteil (c) ÜBERHOLT.** Textuell würde er landen, aber er stellt neben `_ankunftsBild` ein zweites Erst-Bild und verschlechtert die Zahl, die Pflicht B misst (Weltbild +2,6 s Median laut zug/erledigt.txt:1193 „kostet den Haupt-Faden 2,6 s“). LAGE 18.11.: „fällt offen: … w28-fruehbild (widerspricht ‚ein Bild unter dem Schirm, nie zwei‘)“. Die Frage in uebergabe/1811-gtx1050.md:68 „(c) fruehbild verwerfen?“ ist damit beantwortet.
5. —

## 4. w28-reise-raeumt 6e659b8e (86 h, 257 Zeilen)

1. **Ändert** (Basis eb8f82c7, 15.11.): 11 Dateien, +434 / −40. Davon speicher-laden.js 93, bild-diaet.js 49, stoff-instanz.js 35, dirigent-ankunft.js 11, werkstatt-hud.js 9, speicher-welten.js 4, speicher-proben.cjs +221 (Linse Sprung: `werkbank weg --sprung`, `gate:speicher-sprung:echt`), vendor-anker.json +42, check.yml +8, package.json, ci-zeiten.json. Für den Spieler: Nach einem Welt-Wechsel geht die verlassene Welt ganz. Der Knoten-Stand fällt mit dem Stoff seiner Welt (`__anazhStoffe`, Radeon „104 → 238 Stände, Cache 7,0 → 63,0 MB“). Die Sampler-Vorlage hört nicht mehr an der Textur (`_onTextureDispose` abgenommen, „Hörer an der Würfel-Tiefe 299 → 461“). Gestalten außerhalb der Szene gehen wie die in ihr, die Bewohner- und Tier-Räumer laufen vor dem Fall des Gedächtnisses („Vorlagen 14 → 201“). Die Geburt hält keinen Pfeil-Kontext mehr („67 von 77 MB Zuwachs“). Schnitt B: der Abschied kopiert keine Reihe mehr („0,9 von 0,92 s“).
2. **In main nicht getragen:** `reise-raeumt` 0, `__anazhStoffe` 0, `_gruppeVergessen` 0, `stoffeWelt` 0, `_renderLists` 0, `speicher-sprung` 0, `--sprung` 0. `nodeBuilderCache` hat in main 7 Treffer wie an der Basis (bild-kosten.js:566/892/942, stoff-instanz.js:2063), aber kein Abschied je Stoff. Die Register-Abgabe a7c3f12f nennt diesen Rest selbst als „ehrlich offen“: „`renderer._nodes.nodeBuilderCache[]` 3,52 → 9,69 → 9,72 MB am Kopf … der Cache der Shader-Bauer je neuem Material“ und „Heap R2 − R1 +9,3 MB > 5 am Kopf … ohne Täter beim Namen“. Laut koordination uebergabe/1811/register.md:58 bleibt reise-raeumt „außerhalb dieses Schnitts“ (anderer Schlüssel-Raum: die Welt, nicht die Zelle).
3. **merge-tree:** CONFLICT in scripts/lib/speicher-proben.cjs und spec/ci/ci-zeiten.json. Die Stamm-Dateien mergen automatisch (dirigent-ankunft, speicher-laden, speicher-welten, stoff-instanz, werkstatt-hud).
4. **Urteil (b) TRÄGT REST:** 11 Dateien, +434 / −40. Zur Heilung gehören 2 Konflikt-Dateien (die Linse speicher-sprung muss neben die Runde in speicher-proben.cjs, die die Register-Welle seither umgebaut hat), die Runde reise am Kopf vorher ↔ nachher (Richter: draw-zaehler, die 4 roten Halter, nodeBuilderCache, Heap R2−R1), die Vorprüfung `[ci voll]` und der Lauf der Linse. Laut Kopf-Message ist sie „an der GPU noch UNGEPRUEFT, weder ROT am alten Stamm noch GRUEN am Kopf“. Ein Bild braucht er nicht (keine sichtbare Änderung). Der Entscheid in LAGE 18.11. lautet: „Register-Schneider liest w28-reise-raeumt“.
5. Keine Pflicht-Zeile direkt (E misst VRAM und Takt, nicht den Heap über Sprünge). Er bewegt die Leitern `same.entfaltung.reise` (Reise ohne Bruch) und `same.preis.speicher`, außerdem den offenen Rest der Register-Abgabe a7c3f12f.

## 5. w28-heap-zensus 47294070 (86 h, 61 Zeilen)

1. **Ändert** (Basis 3e4f99cd, 15.11.): scripts/lib/heap-zensus.cjs +95, werkbank.cjs +40 (`start --heap-zensus`, `heap-zensus`), zwei Befund-Texte artifacts/profiband/auge/w28-heap-zensus/ +266. Insgesamt 4 Dateien, +400 / −1. Davon hätte nur ein Mess-Leser etwas: lebende Bytes je Allokations-Stelle und je Besteller (Genesis: Heap 245,6 MB, Sampling 81,2 MB; Dorfplatz 454,2 MB, 952 SkinnedMesh mit eigenen Skeletten).
2. **In main gleichwertig:** w28-heap-zensus-2 499b6926 (Merge c7b07173, V18.546.336), Message: „der Sampling-Heap-Profiler von V8 aus w28-heap-zensus liegt in der EINEN Runde“. Am main-Kopf: `scripts/lib/draw-zaehler.cjs:556` „DER BESTELLER DES JS-HEAPS (aus w28-heap-zensus in die Runde gehoben)“, `heapBesteller` :562, `heapStichprobe` :593 (`HeapProfiler.startSampling` / `getSamplingProfile`). a7c3f12f hängt `jsHeapUrteil` an das EINE Wachs-Urteil. Der Befund des Dorfplatzes (Skelette je Leib) ist über w28-kandidat-1611 verbraucht (LAGE: Skelette 619 → 97).
3. **merge-tree:** CONFLICT in scripts/werkbank.cjs.
4. **Urteil (a) IN MAIN GLEICHWERTIG.** Die Fähigkeit steht in der Runde. Der Rest ist eine zweite Route `werkbank heap-zensus` neben `werkbank runde`, also ein Zwilling, plus zwei Befund-Texte, die nach koordination gehören, nicht nach main.
5. —

## 6. w28-heap-spiegel c164349f (85 h, 153 Zeilen)

1. **Ändert** (Basis 3e4f99cd): w28-heap-zensus und dazu heap-zensus.cjs auf 300 Zeilen (`spiegel`, `spiegelTafel`: CPU-Spiegel hochgeladener Attribute je Erzeuger, Modi zaehlen · wache · frei) sowie werkbank.cjs +60. Insgesamt 4 Dateien, +625 / −1. Einen Leser gab es nur für die Frage „hält der Heap CPU-Kopien der GPU-Puffer?“.
2. **In main:** `spiegel`/`memoryMap`-Spiegel-Tafel 0 Treffer. Die Antwort steht in koordination LAGE.md:624: „Am Heap sind CPU-Kopien hochgeladener Geometrie NICHT der Hebel (39,4 MB gespiegelt, ≈ 8,5 MB leserfrei)“. main nennt die Puffer stattdessen beim Halter in der Runde: draw-zaehler.cjs:317–330 „DIE GPU-PUFFER BEIM NAMEN“ (szene · bild · ruhend · verwaist) und :457 „DER TEXTUR-ZENSUS je Erzeuger“.
3. **merge-tree:** CONFLICT in scripts/werkbank.cjs.
4. **Urteil (c) ÜBERHOLT:** c164349f ist Vorfahr von w28-heap-stichprobe f41d8a36, ein eigener Rest außerhalb des Stichproben-Asts ist 0. Die Frage ist mit Nein beantwortet, und die Puffer-Halter urteilt main im EINEN Register. Ein eigenes `/heap-spiegel` wäre eine zweite Puffer-Zählung daneben.
5. —

## 7. w28-heap-stichprobe f41d8a36 (84 h, 316 Zeilen)

1. **Ändert** (Basis 71839b1e nach Merge von main 16.11.): w28-heap-spiegel und dazu heap-zensus.cjs auf 693 Zeilen. Neu sind `BEWOHNER` (Besteller in siedlung-bewohner/-wege, kreatur-*, koerper-*, stoff-gang), `sek` = Müll-Modus (gesammelte Objekte, MB/s), `bewohnerGewicht`/`bewohnerTafel` (Bytes je Feld der Bewohner, V8-Form geschätzt) und `texturen`/`texturTafel` (`image.data` hochgeladener Texturen, Wache auf Leser). werkbank.cjs +95. Insgesamt 4 Dateien, +1 053 / −1. Der Mess-Leser hätte den Müll beim Erzeuger: FUND-REGISTER 16.11. 02:45 „Tuch-Gitter … 9,5 MB/s Müll … Platz 71,3 MB/s, Wiese 32,1“, weitere Posten `_knotenRate` 4,5 MB/s, erdbauY 3,9, stoff-instanz 4,3. „Verdacht (unbewiesen): die Spitzen 90–110 ms in `_tickBewohner` sind GC-Pausen.“
2. **In main teilweise:** Die lebenden Bytes je Besteller stehen gleichwertig in draw-zaehler.cjs:556–600 (siehe Ast 5). Der Befund ist verbraucht: w28-heap-dorf 7cb86d4d „das Tuch-Gitter fällt, wenn 10 s kein Leib es trägt — Heap gehalten am Dorfplatz 406,6 → 381,7 MB“ (in main). **Nicht in main:** der Müll-Modus (`includeObjectsCollectedBy…` am main-Kopf 0 Treffer, im Ast 1), Bewohner-Gewicht und Textur-Kopien-Wache (`bewohnerGewicht`, `texturen-wache` 0 Treffer).
3. **merge-tree:** CONFLICT in scripts/werkbank.cjs.
4. **Urteil (b) TRÄGT REST:** etwa 400 der 693 Zeilen heap-zensus.cjs (Müll-Modus, Bewohner-Gewicht, Textur-Wache) und der Route-Teil von werkbank.cjs. Er landet nur als Modi von `heapStichprobe` in draw-zaehler.cjs, sonst steht ein zweiter Heap-Zensus neben der Runde. Das heißt Neubau statt Merge, 1 Konflikt-Datei, Selbsttest in der Familie. Offen ist auch der eigene WIP-Befund „der Abdruck … hing zweimal über 6 min“. Laut register.md:58 bleibt die Familie draußen, „das Register misst mit `__zellZensus`“.
5. Pflicht E nur über den unbewiesenen GC-Verdacht (Spitzen in `_tickBewohner`), sonst Leiter `same.preis.speicher`. Ohne den Beweis „Spitze = GC-Pause“ bewegt er keine Pflicht-Zeile.

---

## ZUSATZ: die 15 Familien des Bergungs-Blatts gegen die Trocken-Liste (1911-frist-trocken.txt, 171 Zweige = 7 BERGUNG + 164 FÄLLT)

| # | Familie | gelandet in main | lebender Zweig | unter den 7 | unter den 164 FÄLLT |
|---|---|---|---|---|---|
| 1 | w28-stadt-netz | ja, z609 c1e6f29a (b0438afc ist Vorfahr von main); vorrat11-stadt-netz 718d1389 ebenfalls in main | w28-stadt-netz b0438afc, vorrat11-stadt-netz | nein | nein |
| 2 | ferne-ton (w26-ferne-ton, -2, -3, -3-vorher, -4, w27-ferne-ton-5) | nein (FARB_SPEKTRUM, HALM_FARBE 0 Treffer) | ja, alle sechs, Kopf w27-ferne-ton-5 155abda9 | nein | nein |
| 3 | w28-weg-koerper | als Neubau w28-weg-koerper-neu a9d39b64 (Merge a2152dfe) | w28-weg-koerper, w28-weg-koerper-neu | **ja** (b1ffbea3) | nein |
| 4 | w4-b-code (…-heil6 f8c8e85a, claude/youthful-albattani) | nein (`_spaetLaden`, SPAET_DATEIEN 0) | ja: w4-b-code = claude/youthful-albattani-2oc40m 54d6090f, -heim, -heil…-heil6 | nein | nein (der FÄLLT-Eintrag claude/amazing-albattani d919bccc ist ein anderer Zweig) |
| 5 | w4-stadt-orte + claude/festive-hawking | nein (STRASSEN_RANG, Rundkurs 0) | ja, 4b958d88 (beide Namen), w4-stadt-orte-koord | nein | nein |
| 6 | w28-studio-seiten | ja: ad504fbe ist Vorfahr von main; Abgabe w28-studio-seiten-2 d96d0abf (Merge 9ae2c23a), berg-studio-seiten cd0c7ce2 | w28-studio-seiten, -2, berg-studio-seiten | nein | nein |
| 7 | w28-reise-raeumt | nein | ja | **ja** (6e659b8e) | nein |
| 8 | w4-e-buendel | nein (bRuecke 0) | ja, 4e707672 | nein | nein |
| 9 | w4-gehege (gehege, 2, 3) | als Neubau w28-gehege 9677522b (V18.546.335; GEHEGE_GESETZ 10 Treffer) | w4-gehege, -2, -3 f82209de (nicht in main), w28-gehege | nein | nein |
| 10 | heap-zensus (zensus, spiegel, stichprobe) | Kern als w28-heap-zensus-2 499b6926 und berg-heap-zensus 9150868d (beide Vorfahren von main) | ja, alle drei, dazu w28-heap-zensus-2, berg-heap-zensus | **ja** (47294070, c164349f, f41d8a36) | nein |
| 11 | w28-baum-schirm | nein | ja | **ja** (bef69ba3) | nein |
| 12 | w28-fruehbild | nein | ja | **ja** (313303c4) | nein |
| 13 | w28-rasen-schnitt | nein (`_pflegeAt` 0; 5787be8a nicht Vorfahr) | ja, 5787be8a | nein | nein |
| 14 | w28-reibellipse | ja: 92879eab Vorfahr von main, Abgaben w28-reibellipse 5c757e03/2c099f24, -3 19f5281e, berg-reibellipse 51758920 in main; nur -2 af64ebf7 nicht Vorfahr (von -3 abgelöst) | w28-reibellipse, -2, -3, berg-reibellipse | nein | nein |
| 15 | w28-seiten-stille | ja: 4e0f2942 Vorfahr von main, Abgabe -2 6564ad8d (V18.546.336), berg-seiten-stille 8df782d4 | w28-seiten-stille, -2, berg-seiten-stille | nein | nein |

**Stille Fälle unter den 15 VERLOREN:** keiner. Keine der 15 Familien steht unter den 164 FÄLLT.

**Außerhalb der 15, beim Namen:** Unter den 164 FÄLLT stehen Familien, die das Bergungs-Blatt als **UNGEKLÄRT** führt, also ohne Urteil. Diese Fälle wären still:
- w28-wiese-fern 476a3ed9 („fehlt, ob w28-wiese-schale seine Ferne-Dichte trägt“)
- w28-damm-ferne 23b5d366 („Probe-Fix gelaende.K2, in keinem Text erwähnt“)
- w25-ankunft-wiese-nach 79b2cdcf (2 776 Zeilen / 54 %, „fehlt der Abgleich gegen die heutige Ankunft-Karte“)
- claude/relaxed-euler-7t7fyk 8faabbf9 (Familie w4-stadt-takt3/4/5, `_bewohnerZahl` nie in main)
- spike-stadt-koerper und claude/quirky-sagan-4siejx 593c3bbd („fehlt das Spike-Urteil“)
- physik-bild und claude/vibrant-galileo-vlutq5 af9406f9
- spike-pixel-statt-welt und claude/nice-cray-al56cy f653389d
- claude/modest-volta-3a111c 6a5b5b9a (spike-satz-faden)
- spike-ci-konsum 3db2e739

Die übrigen Blatt-Namen in FÄLLT sind entschieden, überholt oder in main (z. B. w28-geister-wand, w28-samen-*, w25-leib-raum, feld-peers, schatten-k1-zuwachs).

Nebenbefund: Unter refs/archiv/2026-11-19/ liegen schon 9 Refs (die ersten neun FÄLLT-Zeilen, z. B. claude/clever-gauss-nuh9lq d0f0ec10). Die Verschiebung hat also begonnen.
