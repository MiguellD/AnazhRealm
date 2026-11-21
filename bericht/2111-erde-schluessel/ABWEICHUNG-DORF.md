# Die 683 Abweichungen am Messort dorf (Abdruck c445936d → e89a151f; Genesis und Wiese sind byte-gleich)

Welche Felder: D3 166 Zeilen, davon 158 Baum-Plätze des Plans um das Dorf („dorf|plan|bau:baum_* nur in A/B“: die Bäume rücken um rund 200 m,
weil der Ort einen anderen Grundriss hat), archInstanceGroups 503/1280 (die Haus-Instanzen griechisch → roemisch), wegeKarte,
Zaun, gebaute Fläche. Dazu folgen die anderen Domänen dem neuen Grundriss: D1 voxelChunks 469/2169 (Erdbau), D2 Wiese, D5 Bewohner,
D7 Impostor-Atlas, D8 Foundry-Cache, D4 Vogel, D9 tonTafel.

Warum: das Standard-Dorf der Zelle −4,−4 (Same 4291161376, 13 Häuser, ohne Epoche) würfelt die Region antik im Jahr −136.
- main: griechisch 14 / roemisch 2, gewachsen (Kykladen-Dächer am Rhein, im Fernbild dorf-main-rot.png blau zu sehen)
- Kopf: der Wirt reicht die Heimat (47,53 / 7,72) → Schlüssel rom/antik/antike, Dach nach dem gemäßigten Gürtel (50,6°):
  roemisch 12 / griechisch 5, Form raster (headless, `dorf-kopf.cjs`). NICHT das Jahr des Orts (der Fix d5bbc9cd ändert hier nichts).

Offen: das Bildpaar main 9502aa0e ↔ Kopf am Messort dorf mit gleicher Kamera ist nicht geschossen. Das Schloss der Radeon hing
seit 20:42 hinter den Mess-Sitzungen der Punkte-Maschine; der erste Lauf (19:27) hatte eine falsche Pose (Hügel im Bild).
Nächster Handgriff: `GPU_LAUF_WARTE_S=5400 bash artifacts/profiband/werkzeug/gpu-lauf.sh erde-schluessel-dorf bash dorf-paar.sh`
(main-Baum C:\Users\micha\AnazhRealm-erde-main @9502aa0e mit node_modules-Junction; Pose aus dem main-Dorf in bild/pose.txt).
Ist das Kopf-Dorf schlechter oder zufällig anders: heilen (das Standard-Dorf ohne gesetzten Ort wie an main), nie begründen.

Laternen im Jahr 100: offen. Das Dorf-Licht (fachwerk-core `DORF` Laternen-Gesetz, Zweig `else` „DAS DORF-LICHT K10“) setzt Pfahl-
Laternen in JEDES Dorf; vor der Epoche der Straßenbeleuchtung (1667) fiele das Licht jedes mittelalterlichen Standard-Dorfs,
die Nacht trüge keine Quelle mehr (gate:settlement O „≥ 4 Quellen in der Gasse nachts“). Es braucht eine zweite Stelle
(die Wandlaterne/Fackel als Ersatz-Quelle, `wandLaternen` über `marken`) — darum nicht geschnitten.
