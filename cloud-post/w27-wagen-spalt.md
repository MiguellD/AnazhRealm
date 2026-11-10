## 10.11. 07:35 Koordinator — z361: dein Zweig ist Täter der Nässe-Wand, dazu rote CPU-Linsen

## 10.11. 11:31 — GPU-PROBE 3e4ed872 auf gtx1050-desktop: NACHGEGEBEN in 569 s (gate:naesse:echt GRÜN 269 s auf gtx1050-desktop · gate:kollision-bild NACHGEGEBEN 101 s auf gtx1050-desktop · bild:dorf@0.5 NACHGEGEBEN 2 s auf gtx1050-desktop) → probe-post/w27-wagen-spalt/3e4ed872.md
Dein Kopf 19f6479c fuhr in z361 mit w27-tiere-sicht (Kandidat 83d5408e, Lauf 42757129177) und fiel.
- **Nässe (echt-Job, Beweis auf der Radeon 890M unter dem GPU-Schloss an deinem Kopf allein):** `npm run gate:naesse:echt` → „NÄSSE ROT: dorf: Dach-Bauten trocken 0/2“ (Selbsttest 5/5). tiere-sicht an derselben Messung GRÜN, main 067bd771 GRÜN. Dein Diff berührt stamm/siedlung-instanz.js und siedlung-ort.js — die Dach-Bauten des Dorfs sind im Regen nicht mehr trocken.
- **Lab-Fahrprofil (voll 11/18):** „B-d/B2: FAHR-PROBE — nach 120 Fahr-Ticks: Eintrag > 1 m bewegt · Blocker ziehen mit · Snapshot trägt es — kind=instanced dist=14.40m fehlt:blocker,huelleKern“.
- **Voller Playtest (voll 1/18):** „Tier-Separation 0710-4 (D–F) LEIB AN LEIB: leib-durchdringung: Fuchs → Bär — die Leiber stecken 0.06 m ineinander“ (dein Schnitt „der Leib des Bären seine Haut“) und „Kreatur-Kosten (G) … ROT: gKi“; Stand-Takt: „RUHE: nahStreu (_tickNahStreu) arbeitet im Stand — 1014 Einheiten in 7 von 30 Frames“.
- Ob Kreatur-Linse Teil 2/3 (voll 6/18, 9/18) deine oder tiere-sichts sind, ist nicht getrennt — fahre beide am Kopf mit main gemischt.
Bitte: `git merge origin/main` (067bd771), heile an der Wurzel, beweise headless jede genannte Linse am Kopf GRÜN, dann neue Abgabe mit `[gpu-probe: gate:naesse:echt, gate:kollision-bild, bild:dorf@0.5]`.

# Post an w27-wagen-spalt

## 10.11. 02:50 — ABGABE w27-wagen-spalt (main a3782a65 eingemischt, Probe gate:kollision-bild GRÜN auf radeon-890m)
ABGABE 19f6479cc15394f4dc37ef6a2bb2d88d4c04f0b2
Geschnitten: der Täter des Spalts ist die Interpolation über den Stoß — der Wagen liegt bei 81,67 m/s genau EINEN Sim-Zustand an der Mauer, das Bild zeigte die Sehne davor; im Schritt eines Stoßes zeichnet es jetzt die Stoß-Lage (stamm/dirigent-takt.js:1118). Dazu: die Hülle des Wagens ist der gezeichnete Umriss (vehicle-core gestaltMass → Beipack __mass → `_wagenMassSetzen`, das Stütz-Polygon mit Nick und Wank, `_fahrHuelleStellen`), der Leib des Tiers deckt je Achse seine Haut (`_tierQuerMass`), ein Leib wird längs der Fläche seines Eintritts gestoßen, die Boxen des Ritts ziehen im Sim-Schritt mit (`_rittBlocker`); gate:kollision-bild nennt BILD ≠ KOLLISION jetzt ROT.
Gemessen (Station physik.K2#2 headless, main 78d37554 → Kopf): Wagen im Bild Spalt 0,235 → 0 m, Eindringen 0 → 0 m; gestoßener Bär im Bild Eindringen 0,135 → 0 m (GTX da0e790f vorher 0,218 / 0,157); physik.K2#1, L8, S1/K8, VK 10/23 Uhr, fahrzeug.K1, check und playtest:fast GRÜN; scripts −8 Atome.
Offen: die Breite der Hülle bleibt ±bw des Gesetzes (die Hüfte zeichnet 6–12 cm je Flanke breiter) — FUND vehicle-core.js:1004 haunch · Fahrbahn fachwerk VERKEHR_GESETZ (begegnungM 0,1) plant mit bw · mit der gezeichneten Breite VK 10 Uhr 2–27 Stöße, im Plan 17/20 Wagen ohne Ziel · pflicht.C/physik.K2 · Größe M.

## 10.11. 02:46 — GPU-PROBE 19f6479c auf radeon-890m: GRÜN in 433 s (gate:kollision-bild GRÜN 115 s auf radeon-890m) → probe-post/w27-wagen-spalt/19f6479c.md
