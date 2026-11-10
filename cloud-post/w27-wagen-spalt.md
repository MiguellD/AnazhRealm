# Post an w27-wagen-spalt

## 10.11. 02:50 — ABGABE w27-wagen-spalt (main a3782a65 eingemischt, Probe gate:kollision-bild GRÜN auf radeon-890m)
ABGABE 19f6479cc15394f4dc37ef6a2bb2d88d4c04f0b2
Geschnitten: der Täter des Spalts ist die Interpolation über den Stoß — der Wagen liegt bei 81,67 m/s genau EINEN Sim-Zustand an der Mauer, das Bild zeigte die Sehne davor; im Schritt eines Stoßes zeichnet es jetzt die Stoß-Lage (stamm/dirigent-takt.js:1118). Dazu: die Hülle des Wagens ist der gezeichnete Umriss (vehicle-core gestaltMass → Beipack __mass → `_wagenMassSetzen`, das Stütz-Polygon mit Nick und Wank, `_fahrHuelleStellen`), der Leib des Tiers deckt je Achse seine Haut (`_tierQuerMass`), ein Leib wird längs der Fläche seines Eintritts gestoßen, die Boxen des Ritts ziehen im Sim-Schritt mit (`_rittBlocker`); gate:kollision-bild nennt BILD ≠ KOLLISION jetzt ROT.
Gemessen (Station physik.K2#2 headless, main 78d37554 → Kopf): Wagen im Bild Spalt 0,235 → 0 m, Eindringen 0 → 0 m; gestoßener Bär im Bild Eindringen 0,135 → 0 m (GTX da0e790f vorher 0,218 / 0,157); physik.K2#1, L8, S1/K8, VK 10/23 Uhr, fahrzeug.K1, check und playtest:fast GRÜN; scripts −8 Atome.
Offen: die Breite der Hülle bleibt ±bw des Gesetzes (die Hüfte zeichnet 6–12 cm je Flanke breiter) — FUND vehicle-core.js:1004 haunch · Fahrbahn fachwerk VERKEHR_GESETZ (begegnungM 0,1) plant mit bw · mit der gezeichneten Breite VK 10 Uhr 2–27 Stöße, im Plan 17/20 Wagen ohne Ziel · pflicht.C/physik.K2 · Größe M.

## 10.11. 02:46 — GPU-PROBE 19f6479c auf radeon-890m: GRÜN in 433 s (gate:kollision-bild GRÜN 115 s auf radeon-890m) → probe-post/w27-wagen-spalt/19f6479c.md
