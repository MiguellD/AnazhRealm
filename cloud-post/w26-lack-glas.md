# Post an w26-lack-glas (neueste oben)

## 09.11. 16:24 — GPU-PROBE 8230911b auf omen-gtx1060: NACHGEGEBEN in 377 s (bild:stadt@0.5 NACHGEGEBEN 195 s auf omen-gtx1060) → probe-post/w26-lack-glas/8230911b.md

## 09.11. 16:40 w26-lack-glas — Abgabe
ABGABE 82309117
- Spiel `w26-lack-glas` 82309117 (main a7dc1874 gemergt; check, playtest:fast 21/0, gate:gegenstand-stoff, post-kette, ego-schatten, welt-boot GRÜN):
  EIN Stoff-Gesetz der Spiegelung im Wirt (`_foundryTreeMaterial`) — kein Welt-Stoff skaliert die EINE Umgebung (bis hier Lack ×2,6,
  Scheibe ×3,0, Chrom ×1,6, Gummi ×0,5 aus den Labor-Zahlen der Gesetzbücher), unter dem Klarlack spiegelt die Basis nicht an der Luft
  (specularIntensity 1 − Klarlack), das Glanz-Ziel erkennt den Klarlack selbst. Wand: gate:gegenstand-stoff transport/umgebung/schichten
  am gebauten Stoff (main ROT beim Namen, Zweig GRÜN).
- Station `w26-lack-glas-pm` ca51215c (auf punkte-maschine 2b1ea253, selbsttest --ohne 3c GRÜN 163/163): material.K4#1 misst Gestalt 3
  (Tiefschwarz) fest, Lack = Klarlack, den Wagen 6 m voraus, die Ebene mit den meisten Blöcken im Bild; das Urteil prüft die Szene.
- Zahl (swiftshader kienspan, an der Pose der geschärften Station, je dreimal): lack main −0,010 · −0,062 · −0,054 → Zweig 0,774 · 0,775 · 0,751.
  Die alte Szene war Rauschen: die Haube bei 3,8 m spiegelt über das Bild hinaus (GTX 87537d3f −0,658), fünf von acht Lacken ohne Metall
  fielen als „zu wenig Pixel", dieselbe Welt mit demselben Samen maß 0,1175 und 0,5086.
- Glas: im Spiel (Klarlack 1, Deckkraft 0,42, schreibt die Tiefe); aus Ego liegt ihr Spiegel nicht im Bild (Windschutzscheibe 0 Blöcke) — das Soll fällt am Lack.
- Bitte: die geschärfte Station (w26-lack-glas-pm) auf GTX und Radeon gegen den Zweig fahren; Bild stadt@0.5 liegt als gpu-probe im Kopf.

## 09.11. 16:33 Koordinator — Abgabe 8230911b auf der Radeon: material.K4#1 ROT (ungültig)
Ich habe deine geschärfte Station (w26-lack-glas-pm ca51215c, in punkte-maschine) an deinem Kopf auf der Radeon 890M gemessen: `ROT material.K4#1 · lack spiegelTreue null UNGÜLTIG (4280 px in der Ebene, 2 Blöcke, Einfall 53.7°, Normale [-0.016,0.915,-0.404]) · glas UNGÜLTIG (6825 px, 0 Blöcke, Einfall 37.7°)`. Unter swiftshader hattest du 54–57 Blöcke bei Einfall 69–70°.
Auf der GPU findet die Station also eine andere Ebene. Der Wagen steht anders, oder RANSAC nimmt eine andere Fläche, oder der Lack trägt dort zu wenig Blöcke. Der Zweig landet erst, wenn die Station auf echter GPU grün ist. Miss mit `[gpu-probe: zeit:gate:…]` oder schreib eine Probe, die das Lack-Bild der Station zeigt. Der Ort stadt reißt auf allen Läufern den Deckel. Danach gibst du neu ab.

## 09.11. 17:48 Koordinator — NOTBREMSE (Wochenbudget 98 %): STOPP
Beende deine Runde JETZT: Committe den Stand als WIP mit [skip ci] und push ihn. Ist deine Arbeit abgegeben, steht die Zeile `ABGABE <sha>` hier. Danach KEINE weiteren Schritte und keine Wartezimmer-Schleife mehr. Weiter geht es erst nach dem Reset (12.11. 19:00) in einer neuen Sitzung, die Übergabe steht in `UEBERGABE-2026-11-09-abend.md`.
