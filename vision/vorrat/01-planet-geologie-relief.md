# Vorrat 16.11. — Blatt 01-planet-geologie-relief (Spiel-Kopf e4eeee08)

**Zählung:** A 0 · T 0 · F 1 · R 4 · B 6 (11 Leitern, je Sprosse 1). **Gelesen:** 11 von 11 Leitern, ehrlich ~70 % der Tiefe — jede
Ziel-Sprosse gegen Kern/Stamm mit Datei:Zeile; die alten Stationen an ihren Fundstellen gelesen (g1.js:1874, :2149, :2229, :3556;
g5.js:4775, :4803); nicht gelesen: die Seiten-Funktionen der Proben selbst (treibtSitzungProbe, UNTERWASSER_PROBE) bis ins Letzte.
Alles „gelesen“, nichts gemessen.

## Die fünf billigsten Sprossen

1. **planet.relief.grossform S1 (F, gpuMin 3, bau S).** Die Läufe-Probe (`wasserLaeufe`, scripts/lib/wasser-linse.cjs:2967) lebt nur
   headless (293/293); sie gehört als zweite Seiten-Funktion neben `treibt` in die Karten-Hälfte von gelaende.K4#2 (g1.js:2229), an
   20 Fluss-Orten mit Bild. Preis-Risiko: die Pose liegt am Fluss (p95 41,9 > 34 ms an der Radeon).
2. **planet.geologie.unterwelt S1 (R, gpuMin 6, bau S).** Mund-Gesetz und Mündungs-Suche stehen (gelaende-core.js:2849-2865,
   diag-hoehlen-sicht.cjs:83), die GPU-Probe leib.K3#2 fährt schon eine Höhle; es fehlt die Zählung je km² in der Sitzung und je
   Mund das Fels-Urteil im Bild — 3 Saaten verlangen drei Welten derselben Sitzung.
3. **planet.geologie.vulkan S1 (R, gpuMin 4, bau M).** Lava per DSL glüht und erstarrt nach Newton (gelaende-core.js:1835), nur
   headless geurteilt (stoffe.K3#2). Gelesen: τ ≈ 4 h für 1 m Decke, gemessene Oberflächen-Glut erlischt in Minuten, und eine Kruste
   als Haut kennt das Spiel nicht — der Richter fiele wahrscheinlich rot, bis der Oberflächen-Gang im Kern steht.
4. **planet.geologie.inneres S1 (B, gpuMin 12, bau S).** Kein Feld, kein Kompass (Grep leer). Kleinster Bau: Dipol `planetFeld`
   neben `planetOrt` (planet-core.js:2290) und eine Nadel im HUD (stamm/werkstatt-hud.js); die 20 Orte kosten 20 Reisen.
5. **planet.geologie.einschlag S1 (B, gpuMin 4, bau M).** Kein Krater-Term (Grep leer). Kleinster Bau: Term `krater` in der
   Term-Tafel (gelaende-core.js:35-67, erbgutNormal :87) mit d/D 1:5 und Übergang ∝ 1/g, gelegt als Tat wie die Lava.

## Funde über das Paket hinaus

- **Der Beleg zu planet.geologie.platten stimmt nicht mehr:** „Grep 14.11. ohne Treffer für Tektonik“ — am Kopf steht planet-core.js
  mit Platten, Rändern, Orogen-Gürteln, Gräben, Hotspots (planet-core.js:4-33, 1149-1173). Im Spiel fließt davon nur ein Teil: der
  Satz `reise` (stamm/feld-leben.js:1365-1480) setzt SKALARE Regler je Welt (planet-core.js:2320-2330); die 9×9-Leit-Stützen der Höhe
  (planet-core.js:2341-2350) liest kein Leser im Gelände. EIN Schnitt — die Leit-Stützen als langwellige Hülle in die Großform der
  Reise-Welt (gelaende-core.js:403) — trüge zugleich platten S1, das Orogen von gebirge S2 und die Hypsometrie von platten S2.
- **EIN Orts-Feld der Geologie trüge drei Leitern:** gebirge S1 (Verformung der Bänke), lagerstaette S1 (Genese der Wand) und Teile
  von boden S1 lesen dieselbe Frage „was ist die Geschichte dieses Orts“ — planetOrt reicht `rand` und `vulkan` schon (planet-core.js:
  2351-2353), aber der Fels-Stoff ist eine Konstante für die ganze Welt (gelaende-core.js:3349-3351: Einfallen 4°, Streichen 0,6).
  Ein Erbgut-Feld `geologie` in der Tafel des Orts (gelaende-core.js:5698), gelesen vom Fels-Stoff, ist der gemeinsame Chokepoint.
- **Keine Jury-Maschine:** sechs Richter dieses Pakets verlangen Blindpaar, 2AFC oder Jury (platten, vulkan, gebirge, lagerstaette,
  formschatz, boden); die Punkte-Maschine kennt keine (Grep 2AFC/Jury/Blindpaar in meisterkarte-quelle/punkte leer). Das ist EIN
  Apparat für viele Leitern quer über die Karte — ohne ihn bleibt jeder dieser Richter halb.
- **Viele Saaten in einer Sitzung:** unterwelt (3), formschatz (20), inneres (20 Orte), platten (30) brauchen viele Welten; der Weg
  ist die Reise in der warmen Sitzung — ihr Preis ist die Ankunft (Pflicht-OFFEN B), nicht der Richter.
- **Beleg boden veraltet:** „Erdbodenfarbe aus Rausch-Flecken, Stand 0“ gilt nur in der Heimat — die Reise-Welt legt den kahlen Grund
  nach der Wärme des Orts (stamm/gelaende-boden.js:2521-2529, Welle 3).
