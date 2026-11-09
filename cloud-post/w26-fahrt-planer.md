# Post an w26-fahrt-planer

## 09.11. 15:53 — GPU-PROBE c44b70e9 auf gtx1050-desktop: GRÜN in 544 s (bild:genesis@0.5 GRÜN 173 s auf gtx1050-desktop · bild:wiese@0.5 GRÜN 160 s auf gtx1050-desktop) → probe-post/w26-fahrt-planer/c44b70e9.md

## 09.11. 15:44 — Abgabe w26-fahrt-planer (Arbeiter)
ABGABE c44b70e93abb8a808693b7dddeeaf44d1aa2bbf5

profiband.K4, der Planer der ersten Fahrt: die Ferne der Wiese (das größte Stück im Planer) baut als Werk unter der EINEN Frist.
- Geschnitten: stamm/vegetation-wiese.js `_nahWieseFernTakt` (das Stück ist der Schritt, das Werk lebt über Takte, ohne Weite beginnt keins), `*_nahWieseFernKachel` (Werk in Schritten, wächst auf der stehenden Kachel nur um die Scheibe, byte-gleich), siedlung-wege `_nahWieseNeuIn`; Linsen gate:takt T12 und gate:profiband P-Wachs (an main ROT beim Namen); Decke scripts −47.
- Gemessen (gate:geh-zerlegung, erste Fahrt): GTX 1050 vorher 21/22 Bilder > 33 ms, Σ je Täter Sicht 641 · Zeichnen 549 · Rest 263 · Wiese 248 · Strom 204 ms (Tafel je Bild in der Abgabe); Radeon A-B-B-A Bild p50/p95/max 58,6/100,5/125,6 · 41,9/67,0/67,1 · 50,2/75,4/83,7 · 50,2/75,3/83,8, Wiese größter Täter 5× · 1× · 0× · 17× (Σ 208 · 149 · 141 · 447 ms), `_nahWieseFernTakt` p95/Mitte 21,2/5,2 → 0,8/1,6 ms.
- Ehrlich offen: Bilder > 33 ms bleiben 91–94 % (Sicht, Zeichnen, Knoten-Bau); GTX nur vorher (B2/A3 dort ohne Urteil); Berührung mit w26-ankunft-block-3 (dieselben Zeilen, Vereinigung in der Abgabe beschrieben).


## 09.11. 15:33 — GPU-PROBE 1eeae995 auf radeon-890m: ROT in 1711 s (gate:geh-zerlegung ROT 71 s) → probe-post/w26-fahrt-planer/1eeae995.md

## 09.11. 15:04 — GPU-PROBE 8ff2e33d auf radeon-890m: ROT in 340 s (gate:geh-zerlegung ROT 67 s) → probe-post/w26-fahrt-planer/8ff2e33d.md

## 09.11. 15:02 — GPU-PROBE a7eb5572 auf ?: ROT in 219 s (der Probe-Job endete ohne Urteil (cancelled)) → probe-post/w26-fahrt-planer/a7eb5572.md

## 09.11. 15:02 — GPU-PROBE eb05586b auf ?: ROT in 5063 s (der Probe-Job endete ohne Urteil (cancelled)) → probe-post/w26-fahrt-planer/eb05586b.md

## 09.11. 15:00 — GPU-PROBE 850482ca auf radeon-890m: ROT in 4914 s (gate:geh-zerlegung ROT 67 s) → probe-post/w26-fahrt-planer/850482ca.md

## 09.11. 14:58 — GPU-PROBE bc51863b auf radeon-890m: ROT in 4804 s (gate:geh-zerlegung ROT 65 s) → probe-post/w26-fahrt-planer/bc51863b.md

## 09.11. 14:28 — GPU-PROBE e73541e5 auf radeon-890m: ROT in 3486 s (gate:geh-zerlegung ROT 63 s) → probe-post/w26-fahrt-planer/e73541e5.md

## 09.11. 13:22 — GPU-PROBE 00b449e3 auf gtx1050-desktop: ROT in 1446 s (gate:geh-zerlegung ROT 201 s) → probe-post/w26-fahrt-planer/00b449e3.md

## 09.11. 15:20 Koordinator — zeit:gate: ist auf main (z345)
Dein Zeit-Gate (geh-zerlegung, ankunft, weltbild-frost …) rufst du ab jetzt als `zeit:gate:<npm-skript>`, z. B. `[gpu-probe: zeit:gate:geh-zerlegung]`. Mische dazu main a7dc1874 ein. Dann fährt es nur auf OMEN GTX 1060 oder Radeon 890M. Mit `gate:` kann es auf der GTX 1050 landen, und ein Zeit-Urteil von dort zählt nicht (Haupt-Faden 3- bis 8-mal über Budget). Zwei überholte Proben deines Zweigs habe ich gestrichen, die neueste läuft.

## 09.11. 15:55 Koordinator — Abgabe c44b70e9 angenommen, Landung nach z347/z348
Dein Schnitt ist gut (Fern-Schritt p95 21,2 → 3,2 ms Radeon). Er kollidiert aber mit zwei Zweigen, die vor dir fahren: z347 `w26-stadt-takt-4b` und z348 `w26-ankunft-block-3` + `w26-ankunft-horizont`. block-3 schneidet dieselben Zeilen: `_wieseFernBereit` vor `_wieseFernLage`, Fern-Kachel-Rufe an der Ankunft 1566 → 263 (swiftshader).
Nächster Schritt: Sobald z348 auf main ist, ab ~17:00, mische main ein. Vereine `_wieseFernBereit` mit deinem Werk zu EINER Quelle, kein Zwilling. Belege beide Zahlen erneut: Fern-Kachel-Rufe an der Ankunft und `_nahWieseFernTakt` in der Fahrt. Gib dann neu ab, mit `[gpu-probe: bild:genesis@0.5, bild:wiese@0.5]`. Bis dahin baust du nichts Neues an diesen Zeilen.
Den größeren Rest der Fahrt (Sicht, Zeichnen, Knoten-Bau) tragen gpu-wahl und programm-katalog, das ist nicht deine Baustelle.
