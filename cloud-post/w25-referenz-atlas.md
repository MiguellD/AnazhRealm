# Post an w25-referenz-atlas

## 08.11. 21:38 — w25-leib-raum: Zwischenstand (Messung vor dem Schnitt, WIP 493fade7)

Gemessen am Mengen-Leib (Stufe 2, 852 Ecken / 1 700 Dreiecke, Raster 6 cm), Ofen-Funktionen in Node, je Person gegen ihren direkten Guss (Abstand Ecke→Fläche):
- heute, die geometrisch beste von 8 Gestalten (optimistisch): Mittel 11,1–21,1 mm, p95 32–57 mm.
- Leib-Raum, Feld-Re-Fit (Vorlage mit den Primitiven getragen, per Newton auf das smin-Feld der Person, als Differenz zur Vorlage): Mittel 10,4–11,5 mm, p95 26–27 mm — auf dem Raster-Rauschen des Gusses; 32–47 ms je Person statt 469–968 ms Guss.
- Formziele je Dial getrennt (dieselbe Re-Fit-Rechnung, je Dial sein Verlauf): Mittel 9,9–16,8 mm, p95 24–61 mm (die Wechselwirkung Masse × Muskel an Extremen).
- Widerlegt: rein lineare Formziele (Mittel bis 26 mm, p95 bis 117 mm) und Formziele aus dem nächsten Punkt (schlechter als die Vorlage allein). Die Höhe ist die Skala der Instanz, sie wirkt im Guss nicht.
Der Schnitt baut darum: je Stufe EINE Vorlage + je Dial eine Knoten-Tafel ihres Re-Fit-Verlaufs (Speicher-Puffer, der Gang-Satz-Knoten liest sie vor dem Skinning). Güsse je Siedlung 8 Gestalten × 4 Stufen → die Vorlagen.
Korrektur am Atlas (Domäne 4, (e)): „der Leib-Guss verlässt den Ankunftspfad“ gilt nur warm — kalt gießt der Ofen die Vorlage einmal wie heute den Leib des Spielers; der Gewinn der Ankunft ist der Mengen-Guss, nicht der Spieler-Leib.

## 08.11. 21:16 — w25-referenz-atlas: ABGABE 8eb8a885ee3abc8dceb38f9844b92f2ff0ee14b2

ABGABE 8eb8a885ee3abc8dceb38f9844b92f2ff0ee14b2 — `REFERENZ-ATLAS.md` im Zweig w25-referenz-atlas (nur koordination-Dateien, merge-bereit auf
koordination bab65218): fünf Domänen, je Quelle · Kern-Gesetz · Code mit Datei:Zeile · gemessene Lücke · EIN Schnitt mit Machbarkeit in r184 ·
Brief-Baustein. Die Schnitte: (1) die LOD-Kette folgt dem Fehler (Nanite-Invariante, kein DAG: Tor 7,8 / Haus 2,30 px → ≤ 1 px),
(2) EINE GPU-Wahl für jede Instanz (die Arena und `_instanzWahlGpu` stehen, gelten heute nur dem Gang-Satz; `_passSicht` 10–12,5 → ≤ 2 ms
geschätzt), (3) der Programm-Katalog (UE PSO-Precache; `compileAsync` bringt in r184 nichts, die Knoten baut es synchron; Bau im Bild 92 → 0 ms),
(4) EIN Leib-Raum (SMPL: Vorlage + Formziele statt Guss je Person), (5) EINE Raum-Zeit-Reservierung je geteiltem Raum (Dresner & Stone, pflicht.C).
Ehrlich offen: die erwarteten Zahlen sind Schätzungen bis zum ersten A/B. Ich warte im Wartezimmer.

## 21:35 Koordinator
ABGABE 8eb8a885 ist angenommen und liegt in koordination als `REFERENZ-ATLAS.md` (5b1cb89c). Im Wartezimmer (`zug/brief-gemein.md`) ist der Atlas jetzt die gemeinsame Grundlage je Domäne. Deine zwei FUND-Zeilen sind notiert: bild-kosten.js:3233 geht an w25-spike-gpu-vegetation, vegetation-streu.js:2882 an w25-lod-pop.

**Nächster Auftrag, der Atlas wird gebaut: Schnitt 4 · EIN Leib-Raum.** Diese Domäne bearbeitet keine andere Sitzung.
- Zweig `w25-leib-raum` von origin/main. Lies vorher die GOLDENE DEFINITION in CLAUDE.md.
- Ziel: Der Ofen gießt je Stufe EINE Vorlage an den Mittel-Dials. Dazu kommt je Dial sein Formziel. Ein Leib ist dann ein Punkt in diesem Raum (Gewichte), kein eigener Guss je Person.
- Richter: mensch.K4 und ankunft.K1. Zahl vorher↔nachher: Güsse je Person und die Leib-Bau-ms im Ankunfts-Trace.
- Bild-Beweis per GPU-Probe-Dienst: `[gpu-probe: bild:start-dorf@0.5, gate:<deine Linse>]` im Kopf-Commit. Ergebnis in `probe-post/w25-leib-raum/`. Vergleiche mit main: Die Gesichter und Gestalten bleiben verschieden.
- Kein Zwilling: Der alte Guss-Pfad stirbt im selben Commit.
- Abgabe wie gehabt: Zeile `ABGABE <sha>` hier, dann ins Wartezimmer.
