# Post an w28-blatt-atlas-kalt

## 11.11. 05:55 UTC — ABGABE w28-blatt-atlas-kalt (main 523e3a38, Probe gate:boot-stage + bild:wiese@0.5 + bild:genesis@0.5)
ABGABE 609fb453713b989000e374fe188f8a619c841e40
Entschieden: Weg B ist die Wurzel, Weg A ist gemessen und NICHT geschnitten. Ein Laub-Körper braucht zum BAUEN keine Pixel: der Faden malt im Foundry-Modus nie (foundry-core.js:2559), die UV sind Gesetz (phyto-core `buildFoliageQuads`). `f.nachAtlas` (stamm/studio-bruecke.js:178) hält nur die Lieferung in die WELT, und die zeichnet erst mit Pixeln (kein fail-soft). Seriell ist allein die Schlange des Buch-Fadens (studio-bruecke.js:1099: der Atlas vor seinen Körpern); umstellen spart auf belegten Kernen keine Arbeit (dein FUND: vier Fäden schlechter als zwei) — die Kette schrumpft mit dem Preis des Auftrags.
Geschnitten (nur phyto-core.js, 1 Datei, +605/−328, kein Stamm, keine Linse):
- kleine Kerne statt kalter Monolithen: `mipBox` :4476 · `mipGlaette` :4495 (nur der Rahmen der Deckung) · `mipStufe0` :4519 · `mipBlutFarbe` :4546 · `mipAlphaGlatt` :4563 · `atlasMittel` :939 · `atlasZeile` :955 · `bcFarbBlock` :4923 · `bcBewerte` :4854 · `bc4Weise` :5093
- Tafeln statt Rechnung je Texel: der Gleichzug der Stufe 0 (`gleich`, bakeLeafAtlasBild :971) und die Vormultiplikation (`vorTafel` :1045; jede Stufe EINMAL statt je Kette)
- `glattSigma` :4382 klassifiziert Viertel statt jede Unterprobe; `bc3Kodiere` :5176 ohne Bild-Kopie, der leere und der einfarbige Block ohne Rechnung (Stufe 0: 47 014 von 65 536 Blöcken leer)
Gemessen (Cloud-CPU, 4 Kerne frei, kalt = ein Prozess bzw. ein frischer Worker je Lauf, 5 + 5 im Wechsel — es gilt das VERHÄLTNIS, nicht die Zahl):
- Node gesamt 1016 → 373 ms (−63 %): Mippen 362 → 155 · Stufe 0 236 → 47 · Vormultiplikation 105 → 15 · BC3 243 → 102 · Malen (JS-Seite) 33 → 30
- Node ohne optimierenden Compiler (`--no-opt`): 6,46 → 2,08 s (−68 %)
- Chromium-Worker mit echter OffscreenCanvas: 819–871 → 367–372 ms (−56 %); ohne TurboFan und Maglev 4,81 → 1,69 s (−65 %)
Beweis: SHA-256 der Fracht (11 rgba- + 6 BC3-Stufen, 2 795 868 B) d34db956b6b1a988 vorher = nachher, in Node UND im Chromium-Worker; ein Korpus aus 894 Fällen über jeden Modus von impostorMips (Atlas · Karte · Saum · entartete Maße), bc1/bc3Kodiere (auch versetzte und geklemmte Felder) und blattAtlasFracht: EIN SHA 963bebcc vorher = nachher; alle 16,8 Mio. einfarbigen Blöcke alt = neu.
Tore am Kopf grün: check · playtest:fast 21/0 · welt-boot · fluss · asset-contract · pack-contract · boot-stage · streu-wahrheit · pflanzen-nah (31 Fälle, darunter die Fracht).
FUND (nicht mein Schnitt): gate:foundry-impostor ist am UNBERÜHRTEN main 523e3a38 in der Cloud (swiftshader) rot — „C[rgba8] C5: Wache der Reihen (0 Meldungen, Soll 1)“, scripts/diag-foundry-impostor.cjs:509; am Zweig dieselben 43 Zeilen, dieselbe eine Verletzung. Ob sie auf der Karte steht, weiß ich nicht.
Ehrlich offen:
- Die Sekunden am ersten Weltbild urteilt deine Sonde. Die Obergrenze steht in deinem FUND: Platte nur mit dem Atlas 18,1 s gegen leer 19,4 s — der GANZE Atlas ist höchstens ~1,3 s des Bilds wert, dieser Schnitt nimmt davon den Rechen-Anteil.
- Deine 6,0–9,4 s sind „Antwort minus vorige Antwort“ (bau-lesen.cjs). Hier kostet die Rechnung allein 0,8–1,0 s; ohne Optimierer 4,8–6,5 s. Was auf der GTX 1050 davon Rechnung ist, was das Öffnen der Platte (`lies` wartet auf `platte`, studio-bruecke.js:962: SHA der Kerne, IDB) und was der Wettbewerb um die Kerne, ist NICHT getrennt gemessen — zwei Marken um `__replyBlattAtlas` (foundry-bruecke.js:590) trennen es.
- Der Gesetz-SHA von phyto-core wechselt: nach der Landung baut jedes Gerät seine Platte EINMAL neu, danach ist der Zweit-Boot wie zuvor (er liest den Atlas von der Platte, kein Byte geändert).
- Rest im Auftrag, nicht geschnitten: die BC3-Farbe der ~27 500 gemischten Blöcke (PCA + kleinste Quadrate, ~60 ms) und die Potenz je Texel der blutenden Stufe (`linZuSrgb8` in `mipBlutFarbe`, ~35 ms).
