# Messplatz GTX: eine Warteschlange statt Chat (23.10.)

Bisher kam jeder GTX-Auftrag als Chat-Nachricht an die OMEN-Sitzung. Eine Nachricht landet aber erst am Ende ihrer laufenden Runde.
Am 23.10. warteten deshalb vier Aufträge 2 h, während die Sitzung die Serie für Zug 6 fuhr. Außerdem schrieb die Sitzung je Zug
`serie.sh` neu. Ab jetzt gilt:
- Die Aufträge stehen als Zeilen in `zug/warteschlange.txt`.
- Ein Dienst auf der OMEN arbeitet sie ab, ohne LLM in der Schleife.
- Die OMEN-Sitzung meldet sich nur bei ROT, UNENTSCHIEDEN oder einem Absturz des Dienstes.

## Warteschlange `zug/warteschlange.txt` (schreibt NUR der Koordinator, nur anhängen)

`<id> <prio> <art> schluessel=wert …`. Eine Zeile mit `#` ist ein Kommentar.

- **prio 1:** Landetor, also das ABAB eines Kandidaten mit grünem echt.
- **prio 2:** Punkte, also die GTX-Stationen am Kopf oder Kandidaten.
- **prio 3:** Forschung.
- Bei gleicher prio gilt die Reihenfolge in der Datei.
- Eine id läuft genau einmal.
- Zurückziehen geht mit der Zeile `<id> 0 storno`.

| art | Schlüssel | tut |
|---|---|---|
| `abab` | `A=<sha40> B=<sha40> zellen=w-ego,g-third,d-ego[,stadt,fahrt,sturm]` | die Serie (Folge, Zellen, Größen, Urteil wie `bericht/2310-abab-zug5/serie.sh`, sequentiell, siehe unten), Urteil-Zeile `<B> nicht-langsamer\|LANGSAMER\|UNENTSCHIEDEN <id>` in `zug/abab.txt` |
| `punkte` | `sha=<sha40> geraet=gtx [nur=<ids>]` | je Zeile von `punkte.cjs gruppen --geraet gtx [--nur …]` (Zwillinge in EINEM Lauf) ein `node meisterkarte-quelle/punkte/punkte.cjs run --sha <sha> --geraet gtx --nur <ids>` aus einem Baum des Zweigs `punkte-maschine`, die Mess-Datei (ohne `*-werk/`) nach `punkte-maschine` |
| `station` | `sha=<sha40> lauf=<datei unter zug/>` | ein benanntes Skript aus koordination am Baum `<sha>` (Forschung, prio 3) |

## Der Dienst `p3/messplatz.sh` (OMEN, läuft im Hintergrund, startet nach Neustart wieder)

Schleife:
1. `git fetch origin koordination punkte-maschine`.
2. `zug/warteschlange.txt` lesen, und zwar per `git show origin/koordination:…`.
3. Die erste offene Zeile nach prio wählen. Offen heißt: die id steht nicht in `zug/erledigt.txt` und ist nicht storniert.
4. Den Auftrag fahren.
5. `<id> <urteil> <kurz>` an `zug/erledigt.txt` anhängen, ebenso Ergebnis und Roh-Ordner `bericht/<id>/`.
6. `commit` + `pull --rebase` + `push` nach koordination. Der Dienst berührt nur seine eigenen Dateien: `zug/abab.txt`, `zug/erledigt.txt`, `bericht/<id>/`.
7. Ist nichts offen, 60 s schlafen.

Bäume:
- `git worktree add` am SHA, je SHA einmal, sauber geprüft (`status --porcelain` leer).
- Keine Hand-Bäume mehr (`n2010-b2a` …).

Unverändert aus `serie.sh` gelten:
- Schloss (`p3/gpu-schloss.sh`) und Seiten-Wache (Fingerabdruck).
- `vorfahrt` bei `Runner.Worker`, also hat der echt-Job Vorrang.
- Nachtruhe, `stopp.ps1` und frischer save-server je Boot.

**Sequentiell, die GTX-Zeit an der Frage:**
- Je Zelle zuerst 2+2 (A1 B1 A2 B2).
- Liegt eine Größe zwischen 1σ und 2σ (gepoolt) oder schlägt der Kern-Richter an, wird nur diese Zelle auf 4+4 verlängert.
- Sonst steht das Urteil nach 2+2.
- Das Urteil je Größe lautet Δ ≤ max(2σ, Auflösung), wie bisher.

**Bericht:**
- Die Tabelle der Zellen (wie `2310-abab-zug5.md`, ohne Prosa) wird aus den Roh-Dateien erzeugt.
- Die Urteil-Zeile ist das Erzeugnis, gelesen von `zug.sh landen`.

## Die OMEN-Sitzung

- Sie startet den Dienst einmal.
- Danach handelt sie nur bei:
  - `LANGSAMER`: eine Zeile mit dem Täter in `bericht/<id>.md`.
  - `UNENTSCHIEDEN` nach 4+4.
  - Absturz des Dienstes, Seiten-Wache ROT oder einem Schloss älter als 2 h.
- Forschung (prio 3) darf die Sitzung selbst einreihen, mit ids `omen-…`.
