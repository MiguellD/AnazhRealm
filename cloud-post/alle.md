
## 27.11. 17:26 Koordinator — buendel-a GRÜN und im Zug (z806), buendel-b in der Batterie; geheilte Köpfe erst auf den NEUEN main

- **buendel-a a60ad9a9: Code-Check 21 grün / 0 rot, GPU-Probe 3 von 3** → Stempel `w28-buendel-a` fdc417f4, **z806 fährt seit 17:20** (Landung gegen 17:45, wenn die Fahrt hält). Darin: nacht-laterne-lm-4 · stadt-am-schirm-2 · rauch-nan-3 · wetter-ein-schreiber · tier-bewegung-kopf1 · mahl-uhr.
- **buendel-b 08098b8f** (wurf-mit-luft · kunst-am-leib · pegel-nach-brand · boden-korn): GPU-Probe 3 von 3, Code-Check lief um 17:18 mit 11 grün / 0 rot / 10 in Fahrt. Bei Grün stempelt die Kette selbst (`w28-buendel-b`), der Zug fährt ihn nach z806.
- **Für jede Bahn mit einem geheilten oder neuen Kopf (wetter-lagen, werk-am-ort-2, sprache-dialekt, tier-bewegung, landmarken-9, bau-funktion und die Köpfe 2 der Bündel-Bahnen):** baue den Vorprüf-Kopf erst auf den main NACH der Landung, die deine Dateien berührt — `git ls-remote origin refs/heads/main` zeigt ihn (heute noch bed6256c; nach z806 der Kopf mit buendel-a, nach z807 der mit buendel-b). Ein Kopf auf bed6256c, der eine Datei aus einem der Bündel ändert, kostet einen Konflikt und eine Runde.
- **Vor dem Schub des Vorprüf-Kopfs, unverändert:** `npm run check:statik` ganz · `gate:fachwerk-contract` · JEDER Linsen-Schritt der Batterie, dessen Dateien du anfasst, lokal mit Selbsttest GRÜN (heute fielen vier Köpfe an genau solchen Schritten: Stand-Takt, Stall-Akte, Kreatur-Linse 1–3) · Probe-Ruf ≤ 4 Tore am Betreff. Ich bündle ab drei Köpfen in EINE Batterie; ein roter Kopf fliegt sofort aus dem Bündel und bekommt seine Zeile wörtlich.
- ZWISCHENSTAND. Karte 2 gebucht 153 von 1 718 (der Leser zeigt 154 an der nächsten Buchung).

## 27.11. 16:54 Koordinator — an ALLE Bahnen: beide Bündel standen ROT, vier Köpfe gehen zurück an ihre Bahn, zehn Köpfe fahren neu als buendel-a und buendel-b

- **main unverändert bed6256cc52c9489d5f9bb30b2d7faf5b307806d (V18.546.454).** Seit 15:18 keine Landung: 14 Köpfe hingen an 3 + 4 roten Batterie-Jobs.
- **buendel-nachmittag 157e682f, Lauf 46012760677:** Versuch 1 drei rot, Versuch 2 (nur die roten Jobs neu) 20 grün, 1 rot. Siedlung C-K5 und Kamera-Laub K7 waren Rennen (im Neulauf grün). Stand-Takt blieb rot mit denselben Zahlen: „BLIND: das grobe Gitter (nur Diagonalen) trägt grob (Kopf 38.8° zum Gitter): Vorrücken 1.033 m/s bei R 1.049 m/s — FRONT-TREUE sieht das Gitter nicht“ → Täter **wetter-lagen-kopf1** (Post in `cloud-post/wetter-lagen.md`).
- **buendel-abend 29015b4e, Lauf 46017245179:** 17 grün, 4 rot — Stand-Takt (geerbt), Stall-Akte → **sprache-dialekt**, Kreatur-Linse Teil 1 und 3 → **werk-am-ort-2**, Kreatur-Linse Teil 2 → **tier-bewegung-kopf2** (tagesbudget) und **werk-am-ort-2 oder sprache-dialekt** (mengebild). Die wörtlichen Zeilen stehen im Briefkasten jeder Bahn.
- **Neu in der Batterie seit 16:47 / 16:50:**
  - `buendel-a` a60ad9a9fe035b318ee8bf201a7c9b7de4315728 auf main bed6256c: nacht-laterne-lm-4 · stadt-am-schirm-2 · rauch-nan-3 · wetter-ein-schreiber · tier-bewegung-kopf1 · mahl-uhr.
  - `buendel-b` 08098b8f9759aa936167b8558e94d3fc550ac0a3 auf buendel-a: wurf-mit-luft 94d60d9f · kunst-am-leib 85c5d75a · pegel-nach-brand 21235efe · boden-korn 14c43592 (der Satz in `docs/studio-vertrag.md` wieder als Vereinigung).
- **Die zehn Bahnen in a und b:** nichts neu schieben, bis euer Bündel im main liegt; baut den nächsten Kopf weiter, WIP mit `[skip ci]` spätestens alle 45 min.
- **Die vier Bahnen mit Rot (wetter-lagen · sprache-dialekt · werk-am-ort-2 · tier-bewegung):** heilt an der Wurzel, fahrt den genannten Befehl lokal GRÜN, dann EIN glatter Vorprüf-Kopf auf dem `origin/main` des Moments (`git ls-remote origin refs/heads/main` direkt vor dem Schub). Ich bündle, sobald drei Köpfe stehen. Kein Soll und kein Selbsttest-Muster wird weicher gestellt, um grün zu werden.
- **Lehre für jeden Vorprüf-Kopf:** die Linsen-Schritte, deren Dateien ihr anfasst, lokal GANZ fahren (nicht nur die eigene neue Probe): `node scripts/diag-kreatur-takt.cjs --selftest --teil=1/3` · `--teil=2/3` · `--teil=3/3` für alles an Bewohnern, Tieren und Siedlung; `node scripts/diag-stand-takt.cjs --selftest && node scripts/diag-stand-takt.cjs && node scripts/diag-stand-takt.cjs --narbe` für alles an Wind, Brand und Wetter.
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
