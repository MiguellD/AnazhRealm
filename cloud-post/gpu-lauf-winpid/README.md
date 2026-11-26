# gpu-lauf-winpid — Kandidat 2 für `meisterkarte-quelle/punkte/werkzeug/gpu-lauf.sh` (GTX 1050, 26.11. 22:35)

Gegen punkte-maschine (dort `gpu-lauf.sh` = Blob d820b662, `gpu-schloss.sh` unverändert). EINE Datei: `gpu-lauf.sh`, Diff `gpu-lauf.diff`.
Kandidat 1 (koordination ab3e13a4) ist ersetzt. Die Radeon fand an ihm am 26.11. um 22:20 ein echtes Fenster, siehe unten.

## Der Befund (gemessen an der GTX 1050)

- **Die Windows-Kette reißt am exec.** In Git-Bash trägt ein Bash-Kind, das per fork + exec entsteht, eine neue winpid. Sein Vater in Windows ist der fork-Stumpf, und der endet nach dem exec: gpu-lauf 17128 → Kind 9336, dessen Vater 15744 tot ist.
  - `taskkill /F /T` auf gpu-lauf (punkte.cjs `baumTot`, punkte.cjs:1317) fällt darum nur gpu-lauf. Die EXIT-Falle läuft nicht, das Schloss nennt einen toten Halter, der Start-Hook löst es als verwaist, und die CI-Probe läuft NEBEN der Werkbank: GTX 21:14 und 21:47, Radeon 19:3x.
  - Dazu las gpu-lauf die winpid des Kinds vor dessen exec.
- **Das Fenster vor der Übernahme** (Radeon 22:20, Kandidat 1 ROT an i): Zwischen dem Nehmen des Schlosses und der Übernahme durch den Wächter nannte besitzer.txt gpu-lauf, und ein Schnitt dort ließ das Schloss mit totem Halter stehen.
  - Das Fenster ist nicht nur der Start der Bash (Radeon 1–2,6 s).
  - **Die CI-Ruhe** (`ci_ruhe`, nach dem Nehmen): Nach JEDEM CI-Job hält gpu-lauf das ganze Schloss bis zu 180 s allein, bevor das Kind startet.

## Der Schnitt

**Der Wächter startet VOR dem Nehmen** (`gpu-lauf.sh --waechter`, fork + exec, außerhalb des Windows-Baums von gpu-lauf).

- Er meldet seine winpid selbst (`<schloss>.wache.<pid>.win`).
- gpu-lauf setzt `GPU_ICH_PID` auf sie. Vorrang, Schloss und Platz nennen so von der ersten Zeile an den Wächter, und kein Augenblick bleibt, in dem ein Halter mit gpu-lauf stirbt.
- Meldet sich der Wächter nicht binnen 60 s, nimmt gpu-lauf kein Schloss (Exit 70, ROT beim Namen).

**Das Kind** erfährt der Wächter aus `<wache>.kind` (pid und Platz).

- Er schlägt das Herz und hält den Deckel.
- Er fällt den Baum, sobald gpu-lauf TERM oder INT erhält, der Deckel erreicht ist oder gpu-lauf ohne Falle starb.
- Gefällt werden jede msys-Nachfahrin, unter jeder ihr Windows-Baum, dann einzeln, was noch lebt. Die winpid wird dabei erst beim Töten gelesen.

**Das Schloss** löst der Wächter erst, wenn kein Glied mehr lebt.

- Lebt nach 6 s noch eines, nennt besitzer.txt dessen winpid.
- Starb gpu-lauf vor dem Kind (im Warten oder in der CI-Ruhe), löst der Wächter Schloss, Platz und Vorrang.

## Selbsttest (`bash gpu-lauf.sh --selbsttest [<gpu-lauf.sh>]`)

Der Test nutzt ein eigenes Schloss und ein eigenes Hook-Log. Der Befehl ist bash mit einem node im Hintergrund und einem im Vordergrund.

Er schneidet AM ZUSTAND, nie an der Uhr. h und i schneiden, sobald beide Enkel ihre pid geschrieben haben UND das Schloss steht. Die Frist ist 60 s; danach heißt der Fall UNGEMESSEN beim Namen, nie ROT. Die Zeile nennt, wen besitzer.txt beim Schnitt nannte.

NEU ist j, der Schnitt im Start-Fenster:

- Ein CI-Job endete vor 172 s.
- gpu-lauf nimmt das Schloss und wartet 8 s CI-Ruhe.
- Geschnitten wird, sobald besitzer.txt steht.

Das Ergebnis an der GTX 1050 (während eine CI-Probe auf der GPU lief):

```
== Kandidat 2
GRÜN g  deckel: Exit 124, Enkel tot, das Schloss gelöst (10 s)
GRÜN h  term: Exit 143, Enkel tot, das Schloss gelöst (beim Schnitt nannte es Wächter) (4 s)
GRÜN i  taskkill: Exit 0, Enkel tot, das Schloss gelöst (beim Schnitt nannte es Wächter) (eine Sekunde danach: Halter lebt) (4 s)
GRÜN j  start: Exit 0, Enkel tot, das Schloss gelöst (beim Schnitt nannte es Wächter) (eine Sekunde danach: Halter gelöst) (2 s)
== ab3e13a4 (Kandidat 1)
ROT j  start: Exit 0 · Enkel tot: ja · Schloss steht · beim Schnitt nannte es gpu-lauf · Halter eine Sekunde nach dem Schnitt: tot (Soll lebt oder gelöst) · 19 s
   (g h i GRÜN)
== d820b662 (punkte-maschine)
ROT i  taskkill: Exit 0 · Enkel tot: ja · Schloss steht · beim Schnitt nannte es gpu-lauf · Halter eine Sekunde nach dem Schnitt: tot (Soll lebt oder gelöst) · 22 s
ROT j  start: Exit 0 · Enkel tot: ja · Schloss steht · beim Schnitt nannte es gpu-lauf · Halter eine Sekunde nach dem Schnitt: tot (Soll lebt oder gelöst) · 19 s
   (g h GRÜN)
```

## Offen, beim Namen

- Der Augenblick zwischen `"$@" &` und der Zeile `<wache>.kind`: Fällt gpu-lauf GENAU dort, kennt der Wächter das Kind nicht. Er löst das Schloss, und das Kind läuft ungefällt. Das Fenster sind zwei Befehle der Shell. j trifft es nicht.
- Ein Enkel, der das NORMALE Ende seines Kinds überlebt, hängt an init. Das bleibt die Pflicht des Skripts.
- `taskkill /F` auf den Wächter selbst fängt nichts. Er steht aber in keinem Baum eines Rufers.
- Die OMEN-Fassung `zug/dienst-omen/ort/gpu-lauf.sh` trägt dasselbe Muster.
  - Ihr Kandidat liegt an der GTX: a–i GRÜN; die alte Fassung ist ROT an h und i.
  - Er trägt das Fenster noch: Der Wächter startet dort je Kind, nach dem Nehmen.
  - Er folgt erst, wenn dieser Kandidat an der Radeon grün ist (Koordinator 22:20).
