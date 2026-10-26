# R6 nach KONSUM — Karte r6-konsum (26.10., Spur FEUER/Werkzeug)

**Geschnitten.** Die Punkte-Maschine urteilt R6 nach dem, was eine Station WIRKLICH ausführte und las, statt nach ihren
Pfad-Globs. Der Zeuge `meisterkarte-quelle/punkte/konsum-zeuge.cjs` fährt (wie `gpu-zeuge.cjs`, NODE_OPTIONS `--require`) in
JEDEM node-Prozess der Station: Precise Coverage je Funktion jeder Seite und jedes Workers (angeheftet vor dem ersten Byte)
und des Node-Prozesses, geladene Skripte, ganz gelesene Dateien (fetch/JSON/Bild/Dokument, `readFileSync`), gelesene
Verzeichnisse, gelesene Funktions-Texte (toString/`__codeOf`); getötete Kinder schließen per Handschlag vor `kill()`
(Windows) bzw. SIGTERM/SIGINT ab, ein Prozess ohne Abschluss macht den Konsum ungültig (dann gilt der Glob). `fahreGruppe`
faltet ihn komprimiert in die Messung (`konsum`: je Datei die Zeilen-Spannen am Mess-SHA oder `*`), `frischUrteil` macht
eine Messung mit Konsum nur alt, wenn `git diff -U0 --no-renames` eine Welt-Zeile in einer Spanne ändert, eine ganz
gelesene Datei ändert oder einem gelesenen Verzeichnis eine Datei gibt oder nimmt; Stempel-Hunks fallen je Hunk.
Ohne Konsum (ältere Messungen) gilt der Glob — Mischbetrieb. Selbsttest 61/61 (Ende zu Ende mit Browser, Worker, Node,
getötetem Kind; Gegenproben ROT am Täter), `liste` Fehler 0.

**Warum in der Punkte-Maschine, nicht in `scripts/lib/welt-boot.cjs`.** Der Sammler in welt-boot wuchs `scripts/` um
3 318 Code-Atome (die Decke verlangt ≤ 0) und fasste nur Prozesse, die welt-boot laden. Als Preload der Maschine fasst er
jeden Browser-Start jeder Linse (Werkbank, Start-Rezept eingeschlossen) und jeden Node-Prozess an JEDEM SHA, auch vor jedem
Merge — der Spiel-Zweig `r6-konsum` blieb darum leer und ungepusht.

## Kosten des Zeugen (headless, Cloud-VM, 4 Kerne)

| Probe | ohne | mit Zeugen |
| --- | --- | --- |
| JS-Last im Browser, Median 6 Runden verschränkt | 31,6 ms | je Funktion 31,7 ms · Block-Coverage 53,4 ms (+69 %) · Block + Debugger 54,6 ms |
| wetter.K1#1 Wanduhr, 3 Runden A/B/C | 23,6 s | 26,8 s (+14 %) · ohne Debugger 25,2 s (+7 %) |
| mensch.K2#1 Wanduhr, 1 Paar | 381 s | 465 s (+22 %) |

Block-Coverage (`detailed: true`) hätte jede Zeit-Station verfälscht und riss am ersten Lauf den 16-min-Deckel von
mensch.K2#1 — der Zeuge misst darum je Funktion. Kein Urteil ändert sich mit dem Zeugen: die beiden ROT der Serie
(feld.K2#1 `gate:mp-sync ROT` am Kopf, tore.K5#1 an 28b262ff ohne die Zeilen des jüngeren Werkzeugs) fallen ohne ihn gleich.

## Beweis: 36 schnelle headless-Stationen × 5 SHAs mit Konsum

Kopf f85ddf35 (origin/main, V18.546.98) und die ersten Eltern der vier Züge, die Welt-Bytes ändern. Je SHA 33–35 GRÜN;
am Kopf 32/36 mit Konsum (vor dem Handschlag), an den Basen 36/36. Mess-Dateien ~300 KB je SHA (Konsum ~9 KB je Station).
Die Messungen sind NICHT eingecheckt (Cloud-Host, keine Buchung von hier).

## alt je Zug (`git log --merges --first-parent f85ddf35 -8`)

| Zug | Welt-Dateien | Glob alle Stationen (radeon · gtx · headless) | gemessene 36: Glob gegen Konsum | beide alt · nur Konsum · nur Glob |
| --- | --- | --- | --- | --- |
| lk4-steil | 1 | 25/49 · 25/49 · 43/83 | 19/35 gegen 31/35 | 16 · 15 · 3 |
| pk4-zaehl | 2 | 31/49 · 31/49 · 59/83 | 24/36 gegen 35/36 | 24 · 11 · 0 |
| tk5-zweit | 0 | 0 · 0 · 0 | 0 gegen 0 | — |
| bewohner-rand | 0 | 0 · 0 · 0 | 0 gegen 0 | — |
| bauen-k5-werke | 5 | 38/49 · 38/49 · 71/83 | 32/36 gegen 35/36 | 32 · 3 · 0 |
| siedlung-k3-trasse | 0 | 0 · 0 · 0 | 0 gegen 0 | — |
| feld-k1-kette | 0 | 0 · 0 · 0 | 0 gegen 0 | — |
| tk3-reittier | 1 | 6/49 · 6/49 · 12/83 | 6/36 gegen 16/36 | 6 · 10 · 0 |

**Das Urteil der Zahl.** Konsum macht an diesen Zügen NICHT weniger alt, sondern mehr — und das Mehr ist wahr: der Glob
buchte 15 · 11 · 3 · 10 Stationen frisch, die den geänderten Code ausführten oder lasen.
1. Heißer Pfad: lk4-steil ändert den Kamera-Drehpunkt (`stamm/koerper-bewegung.js` 1831–1852 in der Funktion 1814–2046),
   pk4-zaehl die Liefer-Marke in `_ofenBudget` und im Antwort-Weg der Foundry, bauen-k5-werke den Fachwerk-Kern — Code,
   den jede welt-bootende Station in jedem Takt ausführt.
2. Text-Scans: 16 der 36 Stationen lesen ALLE 52 Stamm-Dateien als Text (`scripts/lib/stamm.cjs`: `dateien(root)` und die
   Suche nach der Datei einer Methode, Z. 406 · 461 · 686 · 715 · 762). Sie sind nach jeder Stamm-Änderung alt; die 16
   Konsum-Treffer von tk3-reittier (`stamm/netz-portal.js`, P2P) sind genau diese 16 — ohne die Scans wäre der Zug 0/36.

## Offen (mit Grund und Messnamen)

- Die Mess-Dauer nach einem Zug sinkt durch R6 allein nicht, solange Züge den heißen Pfad ändern und Stationen den Stamm
  ganz scannen; Messname: die Tafel oben je neuem Zug (`node punkte.cjs run --offen` zählt mit Konsum).
- GPU-Stationen (radeon/gtx) mit Zeugen sind hier nicht gemessen (keine Karte in der Cloud); die Kosten an einer
  Zeit-Station gehören in ein OMEN-ABAB mit/ohne Zeugen.
- Ein hart getöteter Prozess (`taskkill /F`, SIGKILL) hinterlässt `.offen` → die Station fällt ehrlich auf den Glob.
- `run`/`fahreGruppe` (Karte gpu-bahnen) trägt drei Zeilen dieser Karte (`konsumAn`, `konsumFalten`, `--no-renames`); der
  Probe-Merge mit `gpu-bahnen-koord` ist konfliktfrei.
