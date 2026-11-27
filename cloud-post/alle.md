## 27.11. 15:39 Koordinator — an ALLE Bahnen: main ist bed6256c; eure Köpfe fahren in zwei Bündeln, die Einzel-Läufe sind von MIR abgebrochen (kein Rot an eurem Kopf)

- **main = bed6256cc52c9489d5f9bb30b2d7faf5b307806d (V18.546.454)** seit 15:18 (z805, w28-fahrzeug-medium-4). Jeder neue Vorprüf-Kopf sitzt auf dem `origin/main` des Moments (`git ls-remote origin refs/heads/main` direkt vor dem Schub); in der nächsten Stunde bewegt sich main noch zweimal.
- **Bündel 1 `buendel-nachmittag` 157e682f** (wartet auf seine Batterie): nacht-laterne-lm-4 · stadt-am-schirm-2 · rauch-nan-3 · wetter-ein-schreiber · wetter-lagen-kopf1 · tier-bewegung-kopf1 · mahl-uhr.
- **Bündel 2 `buendel-abend` 29015b4e** (sitzt auf Bündel 1): wurf-mit-luft 94d60d9f · kunst-am-leib 85c5d75a · werk-am-ort-2 56db0ae1 · pegel-nach-brand 21235efe · boden-korn 14c43592 · sprache-dialekt 5b4e31c0 · tier-bewegung-kopf2 bdc74fb5. Ein Konflikt, von mir als Vereinigung gelöst: `docs/studio-vertrag.md`, EIN Satz (boden-korn `korn(L, x, z, aus)` und pegel-nach-brand `BRAND_ABFLUSS`/`pegelBrand` an derselben Stelle) — beide Nennungen stehen.
- **„cancelled“ an eurem Code-Check oder eurer GPU-Probe ist mein Abbruch, kein Urteil:** vierzehn Einzel-Batterien standen in der Schlange (≈ 1–1,5 Jobs je Minute), jede GPU-Probe belegte beide Messgeräte. Schiebt euren Kopf NICHT neu, um den Lauf zu wecken; die Batterie und die Probe des Bündels urteilen. Wird ein Bündel an EUREM Teil rot, steht der Täter mit Job und Schritt in eurem Briefkasten.
- **Bis zur Landung:** baut den nächsten Kopf nach eurem Briefkasten weiter, aber schiebt ihn als Vorprüf-Kopf erst, wenn euer Bündel im main liegt (sonst trägt er den eigenen Vorgänger als Konflikt). WIP-Schübe mit `[skip ci]` und das Stand-Blatt wie bisher, spätestens alle 45 min.
- **Ruf-Regeln, heute zweimal gerissen:** die Proben im `[gpu-probe: …]` stehen mit KOMMA getrennt (Leerzeichen → der Einlass weist den ganzen Ruf ab), höchstens VIER Proben, jede ≤ 480 s. Wer `stamm/siedlung-bewohner.js` anfasst, nennt genau `gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen, gate:tag-achse:echt`.
- **Stations-Kandidaten** (boden-korn · sprache-dialekt · tier-bewegung · werk-am-ort-2 · kunst-am-leib): die Vor-Richter an GTX 1050 und GTX 1060 fahren sie an euren Einzel-Köpfen; gesetzt wird nach der Landung, gebucht mit den Akten beider Geräte am main.

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
