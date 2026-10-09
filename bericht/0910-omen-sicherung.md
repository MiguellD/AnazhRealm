# Bericht 0910-S: der OMEN ist vor dem Kontowechsel gesichert

Auftrag: `auftrag/0910-omen-sicherung.md`. Stand 09.10.2026, ~16:45. Die alte OMEN-Sitzung (a67cd5fb) erreichte mitten in
§3 das Wochenlimit. §1 und der Großteil von §2 waren da schon erledigt. Die neue Sitzung hat §2 (Gedächtnis), §3, §4 und §5
nachgeholt.

## §1 Git: jeder Worktree des Mess-Klons

Geprüft per `git ls-remote origin` (Werkzeug `p3/sicherung-inventar.sh`). „Vorfahre“ heißt: der detached Kopf ist Vorfahre
einer Remote-Spitze, also auf origin erreichbar.

| Worktree | Branch | SHA | gepusht / auf origin |
|---|---|---|---|
| AnazhRealm-mess | main | 2b60988b | ja (Vorfahre von main 76c9624d). 4 unversionierte `messung-omen-*.md` liegen in kontext. Kein Push auf main. |
| abab-a535 | detached | 78ee56da | ja (Vorfahre von studio-s3-kreatur) |
| abab-b-nexus | detached | 91c44f0f | ja (Vorfahre von studio-s3-kreatur) |
| abab-b535 | detached | c966b9c3 | ja (Vorfahre von studio-s3-kreatur) |
| abab-b536 | detached | 76c9624d | ja (= main, integ-probe) |
| abab-boosts | detached | cce9da43 | ja (= welle-m-boosts) |
| abab-glas | detached | 3da7e286 | ja (= welle-m-brennglas) |
| AnazhRealm-csicht | detached | 44f41dcf | ja (Vorfahre von welle-lf-v1-ankunft) |
| AnazhRealm-gboden | detached | d812a15e | ja (Vorfahre von studio-s1-vertraege) |
| AnazhRealm-gfeldpass | detached | fd383b38 | ja (Vorfahre von studio-s1-vertraege) |
| AnazhRealm-gpost | detached | 24c955cc | ja (= welle-g-post) |
| AnazhRealm-kand | detached | cf9a07ba | ja (Vorfahre von studio-s1-vertraege) |
| AnazhRealm-kandz | detached | f2361bb1 | ja (= kandidat-zerlegen) |
| AnazhRealm-zerlegen | detached | 7ff4b81a | ja (= werkzeug-zerlegen) |
| host-vram | host-vram | 520e941d | ja |
| host-vram-kopf | detached | 7e5180d0 | ja (Vorfahre von welle-lf-v1-ankunft) |
| koordination | koordination | dieser Commit | ja |
| mess-a | detached | 2b60988b | ja (= claude/profi-band-pflanzen) |
| mess-b | detached | 251f2f72 | ja (= kandidat-v18532) |
| mess-c | detached | 516e704a | ja (Vorfahre von studio-s1-vertraege) |
| mess-d | detached | 78d66a63 | ja (Vorfahre von welle-lf-v1-ankunft) |
| mess-haenger | detached | a20e1444 | ja (Vorfahre von studio-s3-kreatur) |
| mess-kmw | detached | 9f50dc1d | ja (Vorfahre von welle-lf-v1-ankunft) |
| mess-v533 | detached | 2f237817 | ja (Vorfahre von welle-lf-v1-ankunft) |
| welle-m-boosts | welle-m-boosts | cce9da43 | ja |
| welle-m-brennglas | welle-m-brennglas | 3da7e286 | ja |
| welle-m-fahren | welle-m-fahren | 7f97d339 | ja |
| welle-m-impuls | welle-m-impuls | 35ba704c | ja |
| welle-m-nexus | welle-m-nexus | dc877d19 | ja |
| **welle-m-schatten** | welle-m-schatten | **bf01c035** | **ja, neu gepusht** (Zwischenstand-Sicherung, UNGEPRUEFT) |

- **Einziger neuer Commit:** welle-m-schatten bf01c035 (Basis main 76c9624d). Er enthält nur
  `scripts/diag-schatten-bias.cjs`, das halb gebaute Werkzeug von 0710-12.
- **Keinen `sicherung/omen-0910-*`-Branch:** kein Detached-Worktree trug Änderungen (`git status --short` leer in allen 24).
  Darum gibt es auf origin bewusst keinen solchen Branch.

## §1/§2 Kopien nach `kontext/omen-sicherung-0910/` (350 Dateien, 41 MB)

Die vollständige Liste mit Größen steht in `kontext/omen-sicherung-0910/LISTE.txt`.

| Gruppe | Dateien | Inhalt |
|---|---|---|
| `<worktree>/artifacts/werkbank/*.json` | 68 | band-, zerlegen- und Mess-JSON (ignoriert im Worktree) |
| `<worktree>/anazhRealmPerf.json` | 20 | Perf-Spuren der Mess-Worktrees |
| `welle-m-schatten/artifacts/schatten-bias/vorher-echt/*.png` | 36 (34 MB) | Beweisbilder des Vorher-Laufs 0710-12 (GTX 1060) |
| `AnazhRealm-mess/messung-omen-*.md` | 4 | die unversionierten Mess-Berichte V18.532 bis V18.534 |
| `ordner/` | 21 | UEBERGABE-OMEN-0710.md, UEBERGABE-OMEN-0910.md, Fortschritts-Logs, Serien-stdout |
| `werkzeug/p2`, `werkzeug/p3` | 26 + 151 | Serien-Hüllen, Auswertungen, Zähler, Patches, Bericht-Entwürfe |
| `werkzeug/scratch-7a635cf9`, `werkzeug/scratch-a67cd5fb` | 14 + 4 | Skripte, die nur in `%TEMP%` lagen (auch in `AnazhRealm-OMEN\werkzeug-0910\`) |
| `gedaechtnis/` | 5 | das ganze Gedächtnis (auch in `AnazhRealm-OMEN\gedaechtnis-0910\`) |
| `UEBERGABE-OMEN-0910.md` | 1 | die Übergabe an die nächste OMEN-Sitzung (auch im Ordner) |

**Nicht kopiert:**
- `anazhRealmState.json`: nur die Spielstand-Sicherung des save-servers, die beim Boot nicht gelesen wird.
- `node_modules`.
- `welle-m-schatten/artifacts/schatten-bias/debug*`: Fehlersuche, kein Beweis.
- `%TEMP%\…\main-76c.js`: eine Stamm-Kopie.
- Die Rohdaten-Ordner (`abab*`, `ab53*`, `mess-*`, …) liegen ohnehin im verknüpften Ordner `AnazhRealm-OMEN`.

**Schlüssel-Prüfung:** jede Datei wurde vor der Kopie gegen ein Token-Muster geprüft. Ausgelassen wurde nur
`p3/sicherung-kopieren.sh` selbst, weil es das Muster enthält. Es liegt im Ordner.

## §3 Übergabe

`C:\Users\micha\Desktop\AnazhRealm-OMEN\UEBERGABE-OMEN-0910.md`, Kopie hier unter `kontext/omen-sicherung-0910/`. Sie enthält:
- den Stand je Auftrag 0710-1..12;
- 0710-12 im Einzelnen: Vorher-Zahlen, sechs bekannte Sonden-Fehler, das entschiedene Gesetz, die nächsten Schritte;
- die Worktree-Tabelle;
- wo die Instrumente liegen;
- wie das Gedächtnis aus `gedaechtnis-0910\` zurückkommt.

## §4 Ruhe

| Prüfung | Ergebnis |
|---|---|
| Lauschende Ports 3000, 4312, 4490, 7900–7909 | keine |
| node.exe / chrome.exe | keine |
| GPU-Schloss `%TEMP%\claude\gpu-schloss` | nicht vorhanden |

**Offene Prozesse: 0.**

## Weiter

Als Nächstes setzt der OMEN 0710-12 auf welle-m-schatten fort: zuerst den WIP bf01c035 ganz sichten.

Sobald der Kandidat V18.537 gepusht ist, hat dessen Messauftrag Vorrang:
1. WIP sichern.
2. Ruhe herstellen.
3. ABABABAB messen.
