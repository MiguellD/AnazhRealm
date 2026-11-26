# gpu-lauf-winpid, OMEN-Fassung `zug/dienst-omen/ort/gpu-lauf.sh` — Kandidat 2 (GTX 1050, 26.11. 23:00)

Gegen punkte-maschine (dort `gpu-lauf.sh` = Blob f6410812, `gpu-lauf-selbsttest.sh` = Blob 77822fd8). ZWEI Dateien,
`omen/gpu-lauf.sh` und `omen/gpu-lauf-selbsttest.sh`; der Diff beider steht in `omen/omen.diff`. Dasselbe Gesetz wie der
Kandidat der Punkte-Maschine (koordination 8a16951e, Radeon-Selbsttest GRÜN g h i j): **der Wächter steht VOR dem Nehmen.**

## Der Befund an dieser Fassung

- `"$@" & KIND=$!` und gleich danach `WK=$(cat /proc/$KIND/winpid)` (Zeile 63–64) lesen die winpid vor dem exec des Kinds.
  Am Deckel und bei der Verdrängung fällt `taskkill -F -T -PID "$WK"` darum ins Leere oder trifft den fork-Stumpf, und
  `kill -9 $KIND` fällt nur die Bash des Kinds. Werkbank und Chrome laufen weiter, bei der Verdrängung neben dem CI-Job.
- `taskkill /F /T` auf gpu-lauf (punkte.cjs `baumTot`) erreicht das Kind nie: In Git-Bash reißt die Windows-Kette am exec.
  besitzer.txt nennt dann einen toten Halter, und der Start-Hook löst das Schloss neben der lebenden Werkbank.
- Nur die EXIT-Falle ist gesetzt. Auf TERM löst sie das Schloss, während das Kind weiterläuft.

## Der Schnitt

- **Der Wächter je Halte-Spanne** (`gpu-lauf.sh --waechter`, `wache_an`) startet VOR jedem `nimm`: am Anfang und nach jeder
  Verdrängung. Er läuft per fork + exec, in Windows nicht unter gpu-lauf, und schreibt nichts in die Leitung (das Gesetz von Fall e).
- **Er meldet seine winpid selbst** (`<schloss>.wache.<pid>.win`), BEVOR er die Schloss-Bibliothek einbindet. Deren Ort kommt aus
  `node schloss-ort.cjs`, die erste Messung (Meldung nach dem Einbinden) brauchte 0,9–1,9 s, b lag damit bei 16 s (Soll 7–14).
  Mit der Meldung zuerst sind es 0,6–1,3 s, und b steht bei 11 s.
- **`nimm` schreibt SEINE winpid** in besitzer.txt (bis hier Zeile 50 die winpid von gpu-lauf, jetzt Zeile 141). Kein Augenblick bleibt, in dem ein Halter mit gpu-lauf stirbt.
  Meldet er sich nicht binnen 60 s, nimmt gpu-lauf kein Schloss (Exit 70, ROT beim Namen).
- **Das Kind erfährt er aus `<wache>.kind`.** Er fällt den Baum, sobald gpu-lauf es will (`<wache>.stop`: Deckel, Verdrängung,
  TERM/INT) oder ohne Falle starb. Gefällt werden jede msys-Nachfahrin (ppid, `ps -e`), unter jeder ihr Windows-Baum
  (`taskkill /T`), dann einzeln, was noch lebt. Die winpid liest er erst beim Fällen.
- **Starb gpu-lauf,** löst er das Schloss erst, wenn kein Glied mehr lebt; sonst nennt besitzer.txt den Überlebenden.
  **Lebt gpu-lauf,** nennt besitzer.txt wieder gpu-lauf, und `<wache>.bleibt` trägt den Überlebenden.
- **TERM/INT** sind eigene Fallen: `abbau` (der Wächter fällt den Baum), dann `halte_ueberlebenden`, Exit 143/130.

## Selbsttest (`gpu-lauf-selbsttest.sh [<gpu-lauf.sh>]`): a–f wie bisher, neu g h i j

Die Fälle g h i j sind die des Kandidaten der Punkte-Maschine (Schnitt am Zustand, nie an der Uhr). j schneidet im Start-Fenster,
sobald besitzer.txt steht. Gefahren an der GTX 1050 auf ruhiger Maschine, beide Fassungen hintereinander.

Der Prüfstand ist nur hier und wird nicht abgegeben:

- `GPU_LAUF_SCHLOSS_SH` = die Kopie von `ort/gpu-schloss.sh`.
- `GPU_SCHLOSS_ORT_CJS` = ein Ort im Temp.
- Ein `tasklist` auf dem PATH blendet den echten Runner.Worker aus.
- Die Fälle b/c rufen `p3/gpu-verdraengt.ps1`, das es an der GTX nicht gibt. Die Fehlzeile steht in aus.txt, das Urteil liest sie nicht.

```
== OMEN Kandidat 2 (Meldung vor der Bibliothek) 22:52:03
GRÜN a  der Lauf maß zu Ende (12 s), der Job wartete, keine Verdrängung
GRÜN b  nach 11 s Lauf verdrängt (6 s gewartet), Neustart nach dem Job, Exit 0 (37 s)
GRÜN c  ohne WEICH sofort verdrängt (nach 4 s), Exit 0 (29 s)
GRÜN d  der Lauf starb beim Weichen (Exit 139): die Zeile nennt den Absturz, nie „ganz“ (9 s)
GRÜN e  das node-Kind an der geteilten Leitung maß zu Ende (11 s): kein Wort des Wicklers in die Leitung, solange es lebt
GRÜN f  der Wartende sprach 5-mal in 26 s am fremden Schloss, dann nahm er es, Exit 0
GRÜN g  deckel: Exit 124, Enkel tot, das Schloss gelöst (10 s)
GRÜN h  term: Exit 143, Enkel tot, das Schloss gelöst (beim Schnitt nannte es Wächter) (6 s)
GRÜN i  taskkill: Exit 0, Enkel tot, das Schloss gelöst (beim Schnitt nannte es Wächter) (eine Sekunde danach: Halter lebt) (3 s)
GRÜN j  start: Exit 0, Enkel tot, das Schloss gelöst (beim Schnitt nannte es Wächter) (eine Sekunde danach: Halter lebt) (4 s)
Exit 0
== f6410812 22:54:32
GRÜN a  der Lauf maß zu Ende (10 s), der Job wartete, keine Verdrängung
GRÜN b  nach 10 s Lauf verdrängt (6 s gewartet), Neustart nach dem Job, Exit 0 (33 s)
GRÜN c  ohne WEICH sofort verdrängt (nach 4 s), Exit 0 (26 s)
GRÜN d  der Lauf starb beim Weichen (Exit 139): die Zeile nennt den Absturz, nie „ganz“ (9 s)
GRÜN e  das node-Kind an der geteilten Leitung maß zu Ende (10 s): kein Wort des Wicklers in die Leitung, solange es lebt
GRÜN f  der Wartende sprach 6-mal in 28 s am fremden Schloss, dann nahm er es, Exit 0
GRÜN g  deckel: Exit 124, Enkel tot, das Schloss gelöst (9 s)
GRÜN h  term: Exit 143, Enkel tot, das Schloss gelöst (beim Schnitt nannte es gpu-lauf) (2 s)
ROT i  taskkill: Exit 0 · Enkel tot: ja · Schloss steht · beim Schnitt nannte es gpu-lauf · Halter eine Sekunde nach dem Schnitt: tot (Soll lebt oder gelöst) · 21 s
ROT j  start: Exit 0 · Enkel tot: ja · Schloss steht · beim Schnitt nannte es gpu-lauf · Halter eine Sekunde nach dem Schnitt: tot (Soll lebt oder gelöst) · 21 s
Exit 1
```

## Offen, beim Namen

- Zwischen `abbau` und `schloss_loesen` der Verdrängung (dort läuft `gpu-verdraengt.ps1`) und zwischen dem Ende des Wächters und
  der EXIT-Falle nennt besitzer.txt wieder gpu-lauf. Ein Schnitt dort lässt einen toten Halter stehen, aber der Baum ist schon
  gefallen: Der Hook löst ein Schloss, neben dem nichts mehr läuft.
- Ein Glied, das die Verdrängung überlebt, nennt `<wache>.bleibt`. gpu-lauf gibt das Schloss trotzdem an den wartenden Job, wie
  bisher; dahinter räumt `gpu-verdraengt.ps1`, an der GTX ungemessen.
- Wie im Kandidaten der Punkte-Maschine: der Augenblick zwischen `"$@" &` und der Zeile `<wache>.kind`; ein Enkel, der das
  NORMALE Ende seines Kinds überlebt; `taskkill /F` auf den Wächter selbst.
