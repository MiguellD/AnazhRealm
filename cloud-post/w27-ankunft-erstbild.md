# Post an w27-ankunft-erstbild

## 09.11. 20:42 — GPU-PROBE a47f70bc auf gtx1050-desktop + radeon-890m (Band-Gerät): GRÜN in 183 s (bild:wiese@0.5 GRÜN 98 s auf gtx1050-desktop · zeit:gate:ankunft GRÜN 120 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ankunft-erstbild/a47f70bc.md

## 09.11. 20:39 — ABGABE w27-ankunft-erstbild (zweite, auf 70197657; Probe zeit:gate:ankunft + bild:wiese@0.5)
ABGABE a47f70bc00971bd01e511ba248df9fb2d1785018
Geschnitten: stamm/bild-himmel.js — das Sternfeld baut erst nach dem Rundblick, wenn das Ankunftsbild keinen Stern zeigt (EINE Sichtbarkeits-Frage für Feld und Bau, `STERN_HELLSTE` als Gesetz); scripts/lib/abnahme-urteil.cjs zurück auf main (R6), die Decke trägt ci-klasse (scripts −6).
Gemessen headless kalt: Bau des Sternfelds vor 9 s 21–64 ms → 0; längste Aufgabe main 704 · 644 → Zweig 384 · 517 · 456 ms; belegt bis 9 s im Rauschen (6,55–6,88 s). check · playtest:fast 21/0 · boot-stage · welt-boot · post-kette · ego-schatten grün.
Ehrlich offen: 2 von 5 Gliedern gefallen (Einmal-Render, Sternfeld). Offen: der Bild-Takt als EIN Budget mit dem Draw (dirigent-takt.js:1760; das Guthaben trägt die Erst-Zeichnungs-Wand Teil 1 — Schnitt nur mit ihr als Richter), der Leib-Guss in Raten (koerper-fahrt.js:2609), der Fern-Ring-Stoff an der Frist (gelaende-fern.js:277), die losen Renders ohne Sammler (Term im Weltbild nötig). belegt ≤ 4 s fällt nicht: die Messung je Bau „zeigt das Bild ihn?“ (Pixel-Diff an der Ankunfts-Pose) ist nicht gebaut — die Sitzung endet an ihrer 6-h-Frist.

## 09.11. 20:28 — GPU-PROBE 70197657 auf gtx1050-desktop + radeon-890m (Band-Gerät): GRÜN in 380 s (bild:genesis@0.5 GRÜN 109 s auf gtx1050-desktop · zeit:gate:ankunft GRÜN 128 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ankunft-erstbild/70197657.md

## 09.11. 20:30 Koordinator — Abgabe 70197657 angenommen, die Klasse fällt in DERSELBEN Welle
Gut geschnitten und ehrlich berichtet: Einmal-Render am Stück 451/398 → 0 ms, die längste Aufgabe 704/644 → 384/517 ms. Der Zweig fährt im nächsten Zug (z352), sobald deine Probe grün ist. Den Kopf tausche ich, wenn du neu abgibst.

Weiter auf DEINEM Zweig. Das Ziel ist ankunft.K5 Staffel 1: längste Aufgabe ≤ 250 ms UND belegt bis zur Kontrolle ≤ 4 s. Deine fünf FUNDe SIND die Klasse „lange Aufgabe unter dem Ladeschirm“. Sie fallen zusammen, nicht einzeln (Gebot 2):
1. `stamm/dirigent-takt.js:1760` — der Bild-Takt (Jobs bis zur Mitte + Zeichnung bis zur Frist + Guthaben + Draw ohne Budget, 250–360 ms). Das ist der Chokepoint: EIN Budget je Aufgabe, der Draw zählt hinein.
2. `applyPlayerSoul` → `_buildHumanoidRig` 129–140 ms: der Guss der Grobstufe in Raten an derselben Frist, oder in den Worker.
3. `gelaende-fern.js:277` `_buildToonNodeMaterial` 64–74 ms: an die Frist.
4. `bild-himmel.js:384` das Sternfeld 64 ms: Mittags zeigt das Bild keinen Stern, also baut es NACH der Kontrolle (Gesetz des ersten Bilds: was das Bild nicht zeigt, kommt danach). Das senkt auch „belegt“.
5. Die losen Renders ohne Sammler (Kontakt-Pass `bild-schatten.js:1582`, Post-Kette): derselbe Leser-Vertrag „nicht ganz“ wie der Einmal-Render.

Für „belegt ≤ 4 s“ reicht Verschieben nicht. Was das erste Bild nicht zeigt, darf vor der Kontrolle nicht bauen. Miss je Bau, ob das Bild ihn zeigt (Pixel-Diff mit/ohne an der Ankunfts-Pose), und schiebe die, die es nicht zeigt, hinter die Kontrolle.

Achtung, Linse: Dein Zweig ändert `scripts/lib/abnahme-urteil.cjs` (−1 Zeile). Jede Änderung dort macht über R6 fast jede Station ungemessen. Ist die Zeile für deinen Schnitt nicht nötig, nimm sie zurück. Ist sie nötig, bleibt sie, und ich lege sie in denselben Zug wie w26-boden-nah, das die Datei auch ändert.

Abgabe wie gehabt, danach das Wartezimmer.

## 09.11. 20:22 — ABGABE w27-ankunft-erstbild (main da0e790f, Probe zeit:gate:ankunft + bild:genesis@0.5)
ABGABE 70197657dd7dc19ca86bc88109f914a5e2042bd9
Geschnitten: stamm/bild-kosten.js (Fremd-Szenen-Zweig der Erst-Zeichnung): der Knoten-Bau jedes Einmal-Renders (Umgebung/PMREM, Atmosphären-Tafeln, Rückstrahl, Spiegel) geht in Raten an der EINEN Frist der Aufgabe (`_knotenRate` → `_bauFrist`), wartet er, ist der Render nicht ganz und sein Leser zeichnet im nächsten Takt neu; scripts/diag-boot-stage.cjs: die Halter-Linse der Kalt-Zeile urteilt bis zur Kontrolle wie die Station K5 (Decke: scripts −8 Atome).
Gemessen headless kalt (swiftshader, 4 Kerne, CPU-Teil bis 9 s, 2 + 2 Boots im Wechsel, main ↔ Zweig): Knoten-Bau am Stück in Einmal-Renders 451 · 398 → 0 · 0 ms, längste Aufgabe 704 · 644 → 384 · 517 ms, belegt bis 9 s 6,55 · 6,59 ↔ 6,61 · 6,69 s (gleich). check · playtest:fast 21/0 · welt-boot · boot-stage · post-kette · ego-schatten · Erst-Zeichnungs-Wand 1+2 grün.
Ehrlich offen: K5 verlangt dazu belegt ≤ 4 s — dafür fällt hier nichts (die Arbeit wandert); ob die längste Aufgabe auf der Radeon ≤ 250 ms steht, misst die Station; über 250 ms tragen headless noch der Bild-Takt (Zeichnung samt Guthaben und Draw), der Fern-Ring-Stoff, der Leib-Guss und das Sternfeld (je FUND in der Abgabe-Nachricht); K3/K1 nicht bewegt.
