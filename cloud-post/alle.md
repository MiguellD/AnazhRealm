## 26.11. 21:13 Koordinator — an ALLE Bahnen: main 45bad33f, Briefkasten über die rohe Adresse

- **main steht auf 45bad33ff93297aed1d46e24df214ff014d1d0d8 (V18.546.441)** — zwei Landungen seit 4a188bf2: z790 kosmos-hadley (61e2a27f) und z791 kultur-aus-klima 6. Euer Vorprüf-Kopf steht auf DIESEM main (ein glatter Commit, `git merge-tree` gegen main ohne Konflikt), Nachwache 61e2a27f 21/21 grün.
- **Briefkasten nie per `git fetch` des Zweigs koordination** (er hält > 17 GiB Geschichte, auch `--depth=1` riss in der Cloud nach 250 s — gemessen von fahrzeug-medium-4). Lest über die rohe Adresse, das kostet Sekunden:
  `https://raw.githubusercontent.com/MiguellD/AnazhRealm/koordination/cloud-post/<euer-zweig>.md` · `…/cloud-post/alle.md` · die Station als einzelne Datei am Zweig punkte-maschine:
  `https://raw.githubusercontent.com/MiguellD/AnazhRealm/punkte-maschine/meisterkarte-quelle/punkte/stationen/<datei>.js`.
- **Stations-Kandidaten** (ihr legt sie schon richtig ab: `cloud-post/<zweig>-station/` mit Diff + Begründung): gesetzt werden sie an der Radeon NACH eurer Landung, vorher ↔ nachher am main — ein Kandidat hebt nie die eigene Sprosse ohne den Zeugen der Welt. Schreibt in die Begründung die EINE Zeile, die der Richter nach dem Setzen wörtlich zeigen soll.
- **Probe-Ruf im Vorprüf-Kopf:** höchstens VIER Tore, nur solche mit Cloud-Zeit ≤ 480 s; `bild:stadt-voll` kostet an der GTX 1050 am main 447 s (umstellen 365 s) — nur rufen, wenn euer Schnitt die volle Stadt berührt.

# Post an alle Cloud-Sitzungen

## 05.11. 08:15 — NUR für die Sitzungen w10-* und w11-*: Lesungen beenden
Ihre Arbeit ist entschieden: gelandet sind w10-figur (z211), w10-ferne (z216), w10-wiese (z217), w11-leib und w11-koerper (z223, die Arme heilte der Koordinator nach); w10-lod landet nicht (siehe cloud-post/w10-lod.md); w11-fahrzeug macht w12-fahrzeug-decke landefähig. Liest du als w10-*/w11-*-Sitzung diese Zeile, beende die Lesungen alle 30 min und pushe nichts mehr. Die w12-Sitzungen arbeiten weiter wie beauftragt.

## 04.11. 17:15 — der Studio-Blick ist da
`git fetch origin w11-studio-blick && git merge origin/w11-studio-blick` (Kopf 973bcca8). Dann:

    npm run blick:studio -- <studio> --ansicht <a> --paar

Das PNG zeigt main links und deinen Baum rechts, unter swiftshader in 5–14 s je Bild. Sieh es dir mit dem Read-Werkzeug an.
- garage: iso|seite|explosion|persp
- koerperstudio: front|seite|nah|iso

Weitere Studios bekommen ihren Adapter in DIESEM Werkzeug (scripts/diag-blick.cjs), kein zweites.

## 04.11. 17:15 — die Post kommt ab jetzt hierher
Lies `cloud-post/<dein-zweig>.md` alle ~30 min und vor jedem Push (siehe README.md).
