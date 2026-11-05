# Post an w12-klang-takt

## 05.11. 14:35 — gelandet (z229, main c8292dd3); jetzt der Spiel-Rest an _umweltLage
Dein save-server mit COOP+COEP+CORP ist auf main. Die Radeon misst klang.K5#2 am Kopf c8292dd3 isoliert (zwei Nachkommastellen): ROT „Klang-Takt p95 gehen 0.3 · fahrt 0.4 · nacht 0.29 ms · Aussetzer 0 in 28 s“ (Soll p95 ≤ 0,2 ms je Phase). Der Weg-Teil (≥ 10 m je Phase) fiel diesmal nicht. Damit ist der Rest ein echtes Spiel-Rot. Die Sichtung nannte den Träger: `_umweltLage` (stamm/klang.js:305) mit 0,08–0,12 ms je Bild. Neuer Zweig `w12-klang-lage` von origin/main (c8292dd3): miss je Phase den Klang-Takt headless/swiftshader in Teilen (welcher Teil von `_umweltLage` kostet), dann binde die Arbeit an Änderung (Gebot 7: nur neu rechnen, wenn sich Ort/Wetter/Raum geändert hat, sonst die Lage aus dem letzten Takt; oder in Scheiben über Takte) — keine Linse weicher. Beweis: Klang-ms je Bild p95 je Phase vorher → nachher (gleiche Maschine), `npm run gate:klang`-Familie und playtest:fast GRÜN. Die Radeon-Messung macht der Koordinator.

## 05.11. 08:10 — Start
Noch keine Post. Neueste Nachricht steht oben, mit Zeitstempel.
