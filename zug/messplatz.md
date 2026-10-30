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
| `abab` | `A=<sha40> B=<sha40> zellen=w-ego,g-third,d-ego[,stadt,fahrt,sturm]` | das warme ABAB (Zellen, Größen, Urteil wie `bericht/2310-abab-zug5/serie.sh`, je Zelle ein Boot je Seite, siehe unten), Urteil-Zeile `<B> nicht-langsamer\|LANGSAMER\|UNENTSCHIEDEN <id>` in `zug/abab.txt` |
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

Aus `serie.sh` gelten:
- Schloss (`p3/gpu-schloss.sh`) und `vorfahrt` bei `Runner.Worker` je Mess-Fenster: zwischen zwei Fenstern ist das Schloss frei, der
  echt-Job hat Vorrang, die warmen Welten schlafen derweil.
- Seiten-Wache (Fingerabdruck) bei jedem Öffnen der Pforte :4312 und nach jedem Fenster.
- `stopp.ps1` je Zelle (davor und danach), ein frischer Spielstand je Boot, eine Frist mit HÄNGER-Zeile an jedem Werkbank-Befehl.

**DAS WARME ABAB (30.10., `serie.sh`; vorher bootete jede Seite für jede Messung neu, ein Boot 3,8–7,5 min, davon ~1 min Messung):**
- Je Zelle bootet jede Seite EINMAL (A, dann B). Danach wechseln die Mess-Fenster in den warmen Welten, in Thue-Morse-Folge
  A1 B1 B2 A2 (| B3 A3 A4 B4): die GPU bleibt ohne Boot-Pause heiß, jede lineare (und bei 4+4 quadratische) Drift fällt aus A − B.
- EINE SEITE ZUR ZEIT: die ruhende Welt ist eingefroren und minimiert (`werkzeug/schlaf.cjs`, CDP `Page.setWebLifecycleState`), ihr
  save-server aus; die gemessene Seite besitzt die Pforte `http://localhost:4312` wie bisher. Eine schlafende Welt altert nicht:
  Fenster k von A und von B treffen Welten gleichen Alters; jedes Fenster stellt den Ort neu und räumt, was ein Fenster hinterließ.
- Der Beweis je Fenster steht in `<zelle>-warm.txt` und in der Tabelle: CPU-Sekunden der ruhenden Chrome-Prozesse im Fenster (gegen
  die gemessene Seite), die längste Stille ihres 1-Hz-Zeitgebers gegen die Dauer ihrer Ruhe, die System-Last je Seite.
- Liegt nach dem ersten 2+2 eine Größe zwischen 1σ und 2σ (gepoolt) oder schlägt der Kern-Richter an, verlängert die Serie diese Zelle
  sofort in DENSELBEN Welten auf 4+4; sonst steht das Urteil nach 2+2 (KLAR NACH 2+2 wie bisher).
- Das Urteil je Größe lautet Δ ≤ max(2σ, Auflösung), wie bisher; σ ist die Streuung der Fenster.

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
