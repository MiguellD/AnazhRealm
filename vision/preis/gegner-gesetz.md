# GEGNER GESETZ: w28-preis-ort gegen die GOLDENE DEFINITION und das BETRIEBSGESETZ (ZWISCHENSTAND)

Gelesen: `git diff origin/main...w28-preis-ort` (Basis ffb005db, Kopf cab90667, 33 Dateien, +1325 −319), der BERICHT
(`vision/preis/BERICHT.md`, Schnitte 1–3), die Akten unter `vision/richter/`, die Weg-Fahrten unter
`artifacts/profiband/auge/w28-preis-ort/heap-weg{,-main,-kopf}/`. Nur Gesehenes und Gemessenes.

## Bestaetigte Funde

### F1 Die Toleranz der Weg-Ratsche liegt ueber der gemessenen Streuung
`spec/profiband/weg-wiese-radeon.json:4` `"toleranzMB": 10`; derselbe Eintrag (Zeile 2) und der BERICHT (Schnitt 2, Linse) begruenden sie
als „die Streuung zweier Fahrten“, gemessen 0,7–4,7 MB. Nachgerechnet aus `heap-weg/weg.json` (V18.546.287) gegen `heap-weg-main/weg.json`
(V18.546.290) je Pose: 0,7 · 1,3 · 0,9 · 4,4 · 4,7 MB — das Maximum 4,7. Die Toleranz ist das 2,1-Fache der eigenen Begruendung; die
Ratsche laesst 5,3 MB Zuwachs je Pose ungerichtet durch. Zudem sind die beiden Fahrten nicht „desselben Stands“ (zwei verschiedene
main-SHAs, zwei Versionen). Fehler: ein Band weiter als das Gemessene ist eine weiche Ratsche (Ratschen fallen nur auf Gemessenes).

### F2 Die Weg-Linse H8 hat keinen Leser im Zug; ihr Erzeuger liegt ausserhalb des Repos
`scripts/diag-profiband.cjs:1585` liest `--weg <weg.json>` nur, wenn das Argument gegeben ist. Absenz-Grep im ganzen Baum (`--weg`,
`heap-weg`, `weg-wiese-radeon`): kein Workflow, keine Station, kein Werkbank-Befehl ruft H8; der einzige Erzeuger einer `weg.json` ist
`artifacts/profiband/auge/w28-preis-ort/heap-weg.cjs` — `artifacts/*` ist ignoriert (`.gitignore:6`). Der Selbsttest
(`scripts/lib/draw-zaehler.cjs:1433` `wegSelbsttest`) mutiert nur ein Spielzeug-Objekt in `wegUrteil`, nie den Stamm. Fehler (Gebot 10,
Gebot 5): die Ratsche `spec/profiband/weg-wiese-radeon.json` hat keinen benannten Leser, der im Zug laeuft; wer N1 · N2 · N3 morgen
zuruecknimmt, sieht kein ROT.

### F3 Die Naehte N1 · N2 · N3 und das Tuch-Gitter im Faden haben keine Linse am Taeter
Absenz-Grep in `scripts/` nach `_renderObjektLoesen`, `_saatGeht`, `_knotenBauEntkernen`, `tuch-gitter`, `_tuchGitterFaden`: 0 Treffer
(einzig `_vorbauDran` hat T15 in `gate:takt`). `gate:vendor-anker` pinnt nur die Vendor-Zeilen von N3, nicht den Ruf
(`stamm/dirigent-ankunft.js:263`). Fuer das Gitter im Faden (`voxel-worker.js` `tuch-gitter`, `stamm/koerper-fahrt.js`
`_tuchGitterFaden`) gibt es keinen Beweis, dass es dem Gitter des Haupt-Fadens gleicht (kein byte-Diff, kein Gate). Fehler (Gebot 10:
Linse mit Mutant ROT am Taeter; Gebot 4/5: zwei Wege zum selben Gitter, nur einer bewiesen).

### F4 Der Sprung hat kein Soll — nur einen Lesewert; dort steht am Kopf die groesste Zahl des Laufs
ENTSCHEID.md Zusatz 1 (Zeile 170–172): „die ersten Sekunden … tragen ein EIGENES SOLL“. `vision/richter-akte.cjs:57–61` nimmt die Bilder der
ersten 5 s aus Bild p95 und groesstem Bild und schreibt ihr Maximum nur als `einlauf.bild_max_ms` — kein Urteil liest es (der Selbsttest
:221–225 verlangt sogar GRUEN bei 150 ms in der Spanne). Akte `leben.pflanzen.kraft.1.72561da7-radeon.json` (origin/koordination):
`bild_max_ms` 100,23, `einlauf.bild_max_ms` **217,79** — main 50564dea 125,71 (Arbeitskopie), Kopf a 94f2e615 92,53. Der BERICHT
(Schnitt 3) fuehrt die Zeile mit „eigenes Soll“ in der Spalte Preis, ein Soll existiert nicht. Fehler: das Zaehl-Fenster wurde geaendert,
die Schlagzeile 167,3 → 100,2 ms steht nach dem Schnitt, waehrend das groesste Bild des Laufs (217,8 ms) ungerichtet steigt.

### F5 Die Akten der Schnitt-3-Spalten main und Eltern stehen nicht im Zweig; sie ueberschreiben die von Schnitt 2
Schnitt 3 zitiert fuer main 50564dea 167,3 / p95 83,62 / f 2,04 und Eltern 1ca0611c 167,4 / p95 76,73 die Akten
`vision/richter/leben.pflanzen.kraft.1.<sha8>-radeon.json`. Auf origin/koordination tragen diese Dateien die Werte von Schnitt 2
(50564dea: p95 75,58 · max 192,52 · Heap 413,6 · f 1,926 · ohne `einlauf`; 1ca0611c: 65,67 · 133,59 · 297,2 · f 1,372). Die Werte von
Schnitt 3 leben nur als ungesicherte Aenderung in der Arbeitskopie `koord-hebel` (`git status`: M). Fehler: zwei Laeufe je SHA unter
EINEM Dateinamen; die Zahl im Bericht hat keinen gesicherten Beleg, und wer sie sichert, loescht den Beleg von Schnitt 2.

### Nachgerechnet und stimmig
- Weg Kopf e00c5cbd (`heap-weg-kopf/weg.json`): 297,2 − 254,4 = 42,8 MB in (329 + 183 + 285 + 280) s = 17,95 min → 2,38 MB/min — BERICHT
  „+42,8 in 18,0 min = 2,4“ stimmt. main 50564dea: 506,7 − 383,7 = 123,0 in 916 s = 15,27 min → 8,06 — „8,1“ stimmt.
- Schnitt 3 Kopf 72561da7: Akte 100,23 / 75,24 / f 1,745 / Heap 380,5 / VRAM 133,4 — stimmt mit der Tafel.
- Schnitt 1 ffb005db / 9fba231b: Akte 58,33 / 125,57 / 417,9 / 140,3 und 58,68 / 150,57 / 411,7 / 127,5 — stimmt.

## Gates am Kopf
(folgt)
