# Bericht 0710-12, Nachtrag: die gelben Punkte der Gegenprüfung an welle-m-schatten

Auftrag: `auftrag/0710-12-nachtrag.md` (koordination 4dff0329). Kopf: **welle-m-schatten 261b1b18** (per `git ls-remote`), auf 36191f63: 07657c74 (Punkte 1, 2, 4), 6110eadc (Punkt 8), 261b1b18 (Messungen 5–7).
CI: Lauf 37984819190 am Kopf 261b1b18 — 5 von 5 grün (check, erst-zeichnung, playtest 1/3, 2/3, 3/3); 6110eadc: 37975591341 5/5.

## In drei Sätzen

Geschnitten: Der Täter-Text der Quell-Wand faltet wieder Leerraum (`/\s+/g`), und der Selbsttest prüft ihn jetzt wörtlich. Sechs
Kommentare sagen jetzt, was r184 tut. Ohne `--echt` bricht die Bild-Probe laut ab. Fremde Instanzen derselben Art fallen aus der
Isolation. Der Bericht 0710-12 ist aus den Rohdateien richtiggestellt (koordination ca243d42).

Gemessen auf der GTX 1060 mit derselben Probe, vorher main 76c9624d (normalBias 1 m), nachher das Gesetz:
- Die Nah-Wiese trägt den Schatten jetzt: Boden-IoU mit Saum Wolf 0,09 → 0,96, Busch 0,22 → 0,91.
- Am echten Hang (20° und 35°, seitlich) wirft der Pfosten jetzt: 0,00 → 0,99, der Boden wirft auf sich ≤ 0,02 %.
- Bei 11° Sonne entsteht der Schatten jetzt (Pfosten 0 → 0,97, mittleres Abdunkeln 0 → 8 Luma). Wolf und Fuchs liegen dort aber
  mit 3,5–4,3 Luma unter der Schwelle der Probe.

Ehrlich offen:
- Bei 11° Sonne reicht die 8-Stufen-Schwelle für Wolf und Fuchs nicht. Ihre Zahl ist das mittlere Abdunkeln, kein IoU-Urteil.
- Nachts misst die Probe am Fleck nichts (Luma 0 auf beiden Seiten).
- Am 35°-Hang bei 11° trennt die Probe Relief-Schatten und Akne nur am Bild (dieselbe Form wie auf main), nicht als Zahl.

## 1. Der Regex (`scripts/diag-schatten-bias.cjs:95`)

- `/s+/g` wurde zu `/\s+/g`, geschrieben mit dem Edit-Werkzeug.
- Am Beispiel `licht.shadow.bias =\n        -0.0005 *  tiefe`: vorher „`licht. hadow.bia  =` …“, nachher „`licht.shadow.bias = -0.0005 * tiefe`“.
- Die Linse dazu: Der Selbsttest verlangt den Täter-Text des Tiefen-Nudge wörtlich (`sh.bias = -0.25 / 500`, Leerraum gefaltet).
  Gegenprobe an einer Kopie mit dem alten Regex: SELBSTTEST ROT, „der Täter-Text des Tiefen-Nudge ist verstümmelt (… h.bia …)“.
  Mit dem neuen Regex ist er grün.
- Alle Regex-Literale der Datei sind per Tokenizer gelistet. Nur `:95` hatte seinen Backslash verloren, `:107` trägt ihn.

## 2. Die Kommentare (`anazhRealm.js`)

Gezogen ist die ganze Klasse, nicht nur die vier genannten Stellen:
- `:350`: `shadowBias` ist der Hebel auf das Bias-Gesetz der Kaskaden (1 = 0,5 / 0,75 Texel), nicht der normalBias.
- `:91599`: Den Bias setzt das Gesetz (`_hauptSchattenBias`), die Reichweite den Default 170 (nicht 300).
- `:91634`: Die Kaskaden klonen den Bias nicht vom Haupt-Licht, jede setzt ihn bei ihrem Fit aus dem Gesetz.
- `:101687`: Der Rest „`biasM` −0,25 / −0,5 m“ fällt. Neu steht dort, welche Normale den Versatz trägt.
- `:28444–28446` (TERRAIN_NORMAL_FLATTEN) und `:27969` (`_voxelGradientNormals`) behaupteten, der Schatten-Versatz lese die echte
  Geometrie-Normale. Am Vendor belegt: Der Versatz ist `normalWorld × normalBias`. `normalWorld` ist `normalView.transformDirection`,
  und `normalView` ist außerhalb der NORMAL-Stufe `context.setupNormal()`, also die End-Normale des normalNode. Bei FLATTEN 1,0
  zeigt der Versatz darum auch am Hang senkrecht nach oben. Beide Kommentare sagen das jetzt.

## 3. Der Bericht 0710-12

Richtiggestellt in koordination ca243d42. Jede Zahl steht jetzt so in `wand-nachher-kopf.txt` / `wand-vorher-main.txt` /
`rand-sweep.txt`:
- Nachher-Tabelle aus der Rohdatei des Kopfs: Wolf seitlich 0,981 (0,66), Pfosten mittags 0,985 (0,554), Zähne 10,62 %.
- Fern-Busch: 29 statt 27 px. „vorher 1“ fällt, weil die Fern-Probe im main-Lauf nicht lief (nur das Bild).
- Die Rand-Zeile „1 / 1,5 (erster Bau)“ fällt, sie hat keine Rohdatei.
- Die Quell-Wand nennt auf main sechs Befunde.
- Das Gate steht nicht in `npm run check`. Die CI fährt `npm run gate:schatten-bias` = Selbsttest (check.yml:297–303).

## 4. Der swiftshader-Modus

- Ohne `--echt` bricht die Bild-Probe jetzt laut ab: EXIT 2, mit Grund.
- Der Grund: swiftshader landet ohne `?holz` auf kienspan, also ohne Schatten-Karte. Mit `?holz=voll` kostet jedes Programm 50–70 s,
  der Lauf brach nach 1200 s ohne Urteil ab.
- Der Kopf-Kommentar sagt „NUR `--echt`“. Die toten swiftshader-Zweige (Größe, Argumente, Tag „sw“) sind gefallen.
- `--selftest` bleibt der CI-Teil.

## 8. Die Probe sauber (Fremde derselben Art)

- `isoEbene` schaltete die Ebene der ganzen Instanz-Gruppe, also warfen fremde Büsche derselben Art unter der Isolation mit.
- Jetzt fällt vor dem Leer-Schuss jeder Slot der Art auf Skala 0 und kehrt nach dem zweiten Leer-Schuss zurück.
  - Gemerkt wird je Slot-Halter (`slotRef`), nie je Index, weil die Gruppe beim Freigeben verdichtet und je Pass tauscht.
  - Alle drei Schüsse sehen dieselbe Welt, der gemessene Werfer ist der einzige seiner Art.
- Setzt ein Stufen-Wechsel Fremde während der Messung neu, fällt der Werfer ROT mit Zahl (Selbsttest +1 Fall).
- Gemessen (Kopf-Lauf, GRÜN):
  - Am Busch fallen 141 Fremde derselben Art aus, 0 werden nachgezogen. Der erste Lauf zählte die Band-Slots des eigenen Buschs
    als „2 Fremde“ — der Werfer zählt jetzt über seinen Eintrag nie als fremd.
  - Ohne Fremde sinkt die Busch-IoU seitlich von 0,897 (0,694) auf 0,883 (0,682), mittags bleibt sie 0,98. Die Verunreinigung
    war klein und hob die IoU leicht.

## 5.–7. Gemessen (kein Merge-Tor; `SB_NACHTRAG=1`)

Rohdateien: `bericht/0710-12-nachtrag/wand-nachtrag-kopf.txt` (nachher, welle-m-schatten 261b1b18) und
`wand-nachtrag-vorher-main.txt` (vorher, main 76c9624d, dieselbe Probe als Kopie). Beide 960×540, GTX 1060.

Zwei Proben-Fehler fielen auf dem Weg:
- Am Hang lag die Erwartung neben dem Schatten, weil die Zwei-Schritt-Projektion auf dem 35°-Hang nicht konvergiert. Jetzt schneidet
  ein Marsch mit dem Höhenfeld den Strahl, wo die Projektion mehr als 5 cm neben dem Boden bleibt; die ebene Bühne bleibt gleich.
- Je Messung stehen jetzt die Helligkeit der Erwartung im Leer-Schuss und ihr mittleres Abdunkeln im Mit-Schuss dabei. Das ist
  der Kontrast, den die Schwelle von 8 Stufen sehen kann.

**7. Tiefe Sonne (11°, eben, Boden-IoU mit Saum; Abdunkeln der Erwartung in Luma-Stufen):**

| Werfer | vorher IoU | nachher IoU | vorher Abdunkeln | nachher Abdunkeln | Helligkeit |
|---|---|---|---|---|---|
| Wolf | 0 | 0,004 | −0,2 | 3,5 | 42 |
| Fuchs | 0 | 0,043 | −0,1 | 4,3 | 38 |
| Busch | 0,042 | 0,405 | 0,9 | 5,2 | 43 |
| Pfosten | 0 | **0,965** | 0 | 8,0 | 38 |

- Bei 11° trägt die Sonne auf ebenem Boden nur N·L 0,19. Ein k0-Texel (0,156 m) streckt sich längs des Bodens auf 0,82 m.
- Main warf dort gar nichts (Abdunkeln ≈ 0). Mit dem Gesetz dunkelt jeder Werfer ab, aber Wolf und Fuchs nur um 3,5–4,3 Stufen,
  unter der Schwelle der Probe.
- Im Bild (`wolf-0.28-ueber-*`) liegt die gemessene Fläche am Kopf-Ende der langen Erwartung.

**Nacht (Mond, Tageszeit 0):** Am Fleck ist die Helligkeit 0 auf beiden Seiten (`pfosten-0-mit-nachher.png`). Die Probe misst dort
nichts, Wolf und Pfosten haben IoU 0 vorher wie nachher.

**6. Die Nah-Wiese als Empfänger (seitlich, das Gras im Bild):**

| Werfer | vorher | nachher | Abdunkeln nachher |
|---|---|---|---|
| Wolf | 0,093 | **0,958** | 18,3 |
| Busch | 0,215 | **0,908** | 17,3 |

**5. Der echte Hang** (der Sonne zugewandt, um die Bühne gesucht; „Boden wirft auf sich“ = Anteil des Mittel-Fensters, den der
Boden-Satz unter der Isolation abdunkelt; „Sonne“ = Strahl zur Sonne über das Höhenfeld):

| Hang | Sonne | vorher: Boden auf sich · Pfosten | nachher: Boden auf sich · Pfosten |
|---|---|---|---|
| 21,3° (n·l 0,69) | 26°, frei | 0,01 % · 0,002 | 0,02 % · **0,994** |
| 35,4° (n·l 0,82) | 26°, frei | 0,01 % · 0 | 0,00 % · **0,995** |
| 21,3° (n·l 0,50) | 11°, nach 22 m verdeckt | 70,3 % · 0 | 84,2 % · 0,022 |
| 35,4° (n·l 0,65) | 11°, frei | 9,7 % · 0 | 31,9 % · 0,004 |

- Bei 26° hat der Boden keine Akne, weder vorher noch nachher. Der Pfosten wirft am Hang erst mit dem Gesetz.
- Bei 11° liegt der 20°-Hang im Relief-Schatten des Geländes (der Strahl zur Sonne trifft nach 22 m den Hang davor).
- Am 35°-Hang ist die Sonne am Mittelpunkt frei, aber der untere Teil des Fensters dunkelt ab: vorher 9,7 %, nachher 31,9 %.
  - Im Bild (`hang35-boden-0.28-ueber-vorher/-nachher`) hat die Fläche auf beiden Seiten dieselbe Form, eine zusammenhängende
    Kante quer zum Hang, keine Streifen. Nachher ist sie größer.
  - Das passt zu Relief-Schatten des Buckels im Vordergrund, den der 1-m-Versatz von main zum Teil wegnahm (die Empfänger saßen
    1 m über dem Boden). Akne läge als Streifen auf der besonnten Fläche.
  - Die Probe trennt das nur am Bild. Ein Sonnen-Strahl je Pixel bräuchte die Welt-Lage jedes Pixels, die die Probe nicht hat.
- Der Pfosten bei 11° (IoU 0,02 / 0,004) wird unter der Isolation gemessen; der Boden wirft dort nicht, Relief erklärt es also nicht.
  - Im Bild (`pfosten-hang20-0.28`) ist die Erwartung ein dünner Strich auf dunklem, stark gemustertem Boden. Wie auf ebenem
    Boden bei 11° bleibt sein Abdunkeln unter der Schwelle.
  - Sein mittleres Abdunkeln gibt die Hang-Zeile nicht aus (offen).

**Übergang k0 → k1:** Die Grenze liegt an der Wiese bei 112,8 m (seitlich) bzw. 113,8 m (mittags). Das Spielbild über die Grenze
(`uebergang-0.32/0.5-mit-nachher.png`, ohne Isolation, alle Werfer) zeigt keine Naht.

## Wände

Exit UND Urteils-Zeile gelesen, am Kopf 261b1b18:

| Wand | Urteil |
|---|---|
| check | `GRÜN arch-fachwerk-fit` |
| lint | 0 Fehler, 3 Warnungen wie auf main |
| format:check | „All matched files use Prettier code style!“ (auch `scripts/diag-schatten-bias.cjs`) |
| gate:vendor-anker | steht, 167 Anker |
| gate:schatten-bias (Selbsttest) | SELBSTTEST GRÜN, darin der Täter-Text wörtlich und „Fremde nachgezogen“ |
| diag-schatten-bias --echt (SB_NACHTRAG=1) | GRÜN (`wand-nachtrag-kopf.txt`); main: ROT (`wand-nachtrag-vorher-main.txt`) |
| CI | 37984819190 am Kopf 261b1b18: 5 von 5 grün |

## Offen (mit Grund)

- **Tiefe Sonne, Wolf, Fuchs und der Pfosten am Hang:** Bei 11° bleibt ihr Abdunkeln (eben 3,5–4,3 Stufen) unter der Schwelle der
  Probe. Ein Urteil
  bräuchte eine Kontrast-Schwelle, die von der Sonnenhöhe abhängt; die habe ich nicht gesetzt, weil sie das Urteil der Hauptprobe
  ändert.
- **Nacht:** Die Probe misst am Fleck nichts (Luma 0). Ob der Mond Schatten wirft, beantwortet sie nicht.
- **35°-Hang bei 11°:** Relief-Schatten und Akne trennt die Probe nur am Bild.
