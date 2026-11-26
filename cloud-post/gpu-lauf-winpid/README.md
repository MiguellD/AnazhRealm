# gpu-lauf-winpid — Kandidat für `meisterkarte-quelle/punkte/werkzeug/gpu-lauf.sh` (GTX 1050, 26.11. 22:05)

Gegen punkte-maschine 0ec54d84 (die Datei dort: Blob d820b662). EINE Datei: `gpu-lauf.sh`, Diff `gpu-lauf.diff`.

## Der Befund (gemessen an der GTX 1050, nicht geraten)

- In Git-Bash trägt ein Bash-Kind, das per fork + exec entsteht, eine neue winpid. Sein Vater in Windows ist der fork-Stumpf, und der endet nach dem exec. Die Windows-Kette von gpu-lauf reißt darum am Kind: gpu-lauf hatte winpid 17128, das Kind 9336 mit dem Windows-Vater 15744, einem toten Stumpf. Native Enkel hängen dagegen sauber unter dem Kind (9336 → 17744 → node 3704).
- Darum fällt bei `taskkill /F /T` auf gpu-lauf nur gpu-lauf. Das betrifft punkte.cjs `baumTot` (punkte.cjs:1317) und jeden Wächter eines Rufers, der so tötet. Die EXIT-Falle läuft nicht. Das Schloss nennt einen toten Halter, der Start-Hook löst es als verwaist, und die CI-Probe läuft NEBEN der Werkbank und ihrem Chrome:
  - GTX 21:14: ci-runner 45889523490 neben hand-stadt-voll-kopf;
  - Radeon 19:3x: „SCHLOSS VERWAIST … Halter pid=35452 lebt nicht“.
- Dazu las gpu-lauf die winpid des Kinds sofort nach `&`, also vor dessen exec. Ohne sie fiel `baum_ab` auf `pkill`, das Git-Bash nicht hat.

## Der Schnitt

**DER WÄCHTER** (`gpu-lauf.sh --waechter`, gestartet per fork + exec):

- Er steht in Windows NICHT unter gpu-lauf und überlebt so ein `taskkill /F /T` auf gpu-lauf.
- Er übernimmt das Schloss: besitzer.txt nennt SEINE winpid.
- Er schlägt das Herz und hält den Deckel.
- Er fällt den Baum, sobald gpu-lauf TERM oder INT erhält, der Deckel erreicht ist oder gpu-lauf ohne Falle starb.

**Die Baumfällung:**

- Die winpid wird erst beim Töten gelesen.
- Gefällt wird jede msys-Nachfahrin des Kinds (ppid aus `ps -e`, denn die msys-Kette reißt am exec nicht) und unter jeder ihr Windows-Baum per `taskkill /F /T` (node → Chrome).
- Was dann noch lebt, fällt einzeln. Dafür wird der Windows-Baum vor dem Schnitt gemerkt; ein Kind ist nie älter als sein Vater, so gerät keine wiederverwendete pid hinein.

**Das Schloss:**

- Der Wächter löst es erst, wenn kein Glied mehr lebt.
- Lebt nach 6 s noch eines, nennt besitzer.txt dessen winpid. Die Hooks lösen dann erst nach dessen Ende.

## Selbsttest (`bash gpu-lauf.sh --selbsttest [<gpu-lauf.sh>]`)

Der Test nutzt ein eigenes Schloss und ein eigenes Hook-Log. Der Befehl hat die Form des Bruchs: bash mit einem node im Hintergrund (die Werkbank) und einem im Vordergrund. Drei Fälle:

- g: der Deckel greift.
- h: gpu-lauf erhält TERM.
- i: `taskkill /F /T` auf gpu-lauf.

Vorher, mit der Fassung d820b662 (`bash gpu-lauf.sh --selbsttest gpu-lauf.alt.sh`):

```
GRÜN g  deckel: Exit 124, beide Enkel tot, das Schloss gelöst (11 s)
GRÜN h  term: Exit 143, beide Enkel tot, das Schloss gelöst (5 s)
ROT i  taskkill: Exit 0 · Enkel tot: ja · Schloss steht · Halter eine Sekunde nach dem Schnitt: tot (Soll lebt oder gelöst) · 25 s
```

Nachher, mit dem Kandidaten:

```
GRÜN g  deckel: Exit 124, beide Enkel tot, das Schloss gelöst (10 s)
GRÜN h  term: Exit 143, beide Enkel tot, das Schloss gelöst (8 s)
GRÜN i  taskkill: Exit 0, beide Enkel tot, das Schloss gelöst (eine Sekunde nach dem Schnitt: Halter lebt) (8 s)
```

Zum ROT von i an d820b662: Die Enkel starben im Test erst nach dem Ende ihrer Leitung. Die echte Werkbank schreibt in eine Datei und lebte weiter (GTX 21:14 und 21:47, zweimal). Der Halter war jedenfalls tot und das Schloss stand: Genau diese Lage löst der Start-Hook als verwaist.

## Offen, beim Namen

- Ein Enkel, der das NORMALE Ende seines Kinds überlebt (ein Skript, das seine Werkbank nicht stoppt), hängt danach an init: Ihn findet weder die msys- noch die Windows-Kette. Das bleibt die Pflicht des Skripts.
- `taskkill /F` auf den Wächter selbst: Den fängt nichts. Er steht aber in keinem Baum eines Rufers.
- Die OMEN-Fassung `zug/dienst-omen/ort/gpu-lauf.sh` (WEICH und Verdrängung) trägt dasselbe Muster (`KWIN` sofort nach `&`) und ist hier NICHT angefasst.
