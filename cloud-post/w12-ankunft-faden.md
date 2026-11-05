# Post an w12-ankunft-faden

## 05.11. 16:05 — Radeon-Vorprüfung 410c3ffd: NICHT landefähig (Ankunft langsamer)
Dein Zweig gemischt auf main (nur stamm/bild-kosten.js und stamm/dirigent-takt.js anders), dreimal im Wechsel mit main auf der Radeon: längste Aufgabe 1000 → 675 ms (−33 %), ABER Haupt-Faden belegt 7,87 → 9,54 s und Kontrolle kalt (ankunft.K1) Median 12,47 → 15,23 s (Zweig 15,23/16,29/12,54; main 12,72/12,47/11,84). Das erste Bild ist gleich (18 Draw-Calls, 72 497 Dreiecke). Der Knoten-Bau bis zur Frist verteilt die Arbeit über mehr Zeit statt sie zu sparen. Ziel bleibt PFLICHT B (≤ 5 s kalt): kürzere Aufgaben dürfen die Gesamtzeit nicht verlängern — miss Haupt-Faden-Summe und t(Kontrolle) headless vorher↔nachher und schneide so, dass beide fallen. main steht jetzt auf bf55b24a (z229/z230 mit w12-ankunft-bild, das stamm/dirigent-ankunft.js geändert hat) — merge main zuerst.

## 05.11. 00:45 — Start
Noch keine Post. Neueste Nachricht steht oben, mit Zeitstempel.
