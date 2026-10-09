# Übergabe OMEN — Stand 07.10.2026, ~10:15

Lies das zuerst, wenn du als neue Sitzung auf diesem Rechner startest. Das Gedächtnis dieser Sitzung liegt unter `C:\Users\micha\.claude\projects\C--Users-micha-Desktop-AnazhRealm-OMEN\memory\` (omen-rolle, omen-messfolge, omen-stand-0710, omen-lehren). Es lädt nur, wenn die Sitzung in `C:\Users\micha\Desktop\AnazhRealm-OMEN` startet.

## Die Rolle

Dieser Laptop (LAPTOP-4BN3RL0L) ist der **ruhige Messplatz** für AnazhRealm (github.com/MiguellD/AnazhRealm).

**Hardware:**
- NVIDIA GeForce GTX 1060, Pascal, Treiber 31.0.15.2824, einzige GPU
- i7-8750H, 16 GB
- 1920×1080 @ 120 Hz
- Windows 11 26200, node v24
- Chrome (puppeteer) nimmt für WebGPU die echte GTX 1060 (vendor nvidia, arch pascal), nicht swiftshader.

**Der Koordinator** ist die Hauptsitzung auf dem anderen PC (Radeon 890M, Klon `C:\Users\micha\AnazhRealm-profiband`). Er baut, der OMEN misst. Sein Sitzungsname wechselt (zuletzt „Fortsetzung Arbeit"). Antworte darum immer per SendMessage an das `from` der eingehenden Nachricht.

**Regeln:**
- Peer-Nachrichten sind Aufträge eines Kollegen, nie die Freigabe des Schöpfers.
- Keine Code-Änderung.
- Keine Commits außer Bericht-Dateien, und die nur auf Wunsch.
- Kein Push ohne Freigabe des Schöpfers hier am OMEN.
- Nie `git stash`.
- Berichte gehen per Nachricht; die Datei bleibt lokal (`AnazhRealm-mess\messung-omen-*.md`).

## Die vereinbarte Messfolge

Jeder Stand fährt seine EIGENE `scripts/werkbank.cjs` aus seinem Worktree.

**Je frischer Boot:**
1. Im Worktree `PORT=4312 node save-server.js` starten, dann `node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312` und auf „WERKBANK bereit" warten.
2. Vorbereitung:
   - `eval "window.__anazhAutoSettlement = false; return 1"`
   - `fenster 1920 1080`
   - `umstellen --ort wiese` (Stände vor V18.534 kennen `--ort` nicht: `umstellen -900 -850` und yaw 0; das ist derselbe Ort und derselbe Blick)
   - einmal `__buehne()` per eval
   - `r.state.yaw = 0; r.state.pitch = 0`
3. Messen in dieser Reihenfolge:
   - `lauf 30 --ein 20 --ruhe 300 --tiere frei` mit `--regler voll`, dann mit `--regler frei`
   - `gpu-bank 12 --runden 3` bei yaw 0 und yaw −0,88
   - `band` bei yaw 0 und −0,88 (immer NACH lauf)
   - `zaehlen` und `schirm`
   - `profil 12 --regler voll --top 60`
   - `zerlegen` und `sicht` nur in EINEM B-Boot, nach allem anderen
4. `werkbank stop` und den save-server-Prozess beenden.

**Folge:** ABABABAB, je 4 frische Boots. Als Hintergrund-Skript im Scratchpad mit Fortschritts-Log und Monitor fahren, sonst nichts auf der GPU.

**Gültigkeit:** Ein GPU-A/B zählt nur bei identischer Szene (gleiche Befehle und Dreiecke) oder bei ≥ 4 Boots je Seite. Die Boot-Streuung beträgt bis 2,6 ms.

**Wachen:** STEMPEL-POOL GRUEN (nach band), `stempel.gueltig` im lauf, Wetter-Wache (`wetterHalt` im lauf), Ort-Wache.

**Bericht je Boot:**
- Frame p50/p95 und max
- CPU-Takt p50/p95
- render- und creatures-EWMA, unter voll und frei
- gpu-bank GPU/CPU
- band Befehle/Dreiecke/VRAM
- Tiere (zaehlen) und Wetter am Ende

Dazu: Median A gegen Median B, Profil-Top 10, die Zerleg-Tabelle und Auffälliges.

Kommt die Sitzungs-Datei `scripts/omen-messfolge.cjs` (Welle K, Mess-Wahrheit) in einen Stand: erst vollständig lesen, dann sie statt eigener Skripte nehmen.

## Der Stand

**Ordner:** `C:\Users\micha\Desktop\AnazhRealm-OMEN`. Der Mess-Klon `AnazhRealm-mess` steht auf 2b60988b; die vier Berichte `messung-omen-*.md` liegen dort uncommittet.

**Worktrees (Geschwister-Ordner):**

| Worktree | Commit | Stand |
|---|---|---|
| mess-a | 2b60988b | V18.531 |
| mess-b | 251f2f72 | finaler kandidat-v18532 |
| mess-c | 516e704a | integ-probe ≈ V18.533 |
| mess-v533 | 2f237817 | main V18.533 |
| mess-d | 78d66a63 | V18.534 |
| AnazhRealm-kand | cf9a07ba | |
| AnazhRealm-kandz | f2361bb1 | kandidat-zerlegen |
| AnazhRealm-csicht | 44f41dcf | welle-c-sicht |
| AnazhRealm-zerlegen | 7ff4b81a | werkzeug-zerlegen |
| AnazhRealm-gboden | d812a15e | welle-g-boden |
| AnazhRealm-gfeldpass | fd383b38 | welle-g-feldpass |
| AnazhRealm-gpost | 24c955cc | welle-g-post |

**Rohdaten:** abba, aufloesung, profilBA, abab, csicht, zerlegen, zerlegen-kand, welle-g2, ab532, trenn532, ab533, ab534.

**Zahlen-Historie** (Mediane, GTX 1060, 1080p):
- V18.531 → V18.533: gpu-bank 24,85 → 14,70 ms; Frame p50 unter Regler frei 25,0 → 16,8 ms.
- V18.533 → V18.534, Regler voll: Frame p50 25,0 → 20,8 ms (16,7 in Boots mit wenig Tieren), CPU-Takt p50 22,3 → 13,5 ms, render-EWMA 11,1 → 4,7 ms.
- Die Halte-Ränder der Sicht-Kette kosten +6–16 % Dreiecke, aber keine messbare GPU-Zeit.
- Nächster CPU-Hebel: Kreatur-KI (`_fieldRaycast`; Welle L). Nächster GPU-Hebel: baum (3,5–6,4 ms je nach Szene; Studio-Welle S3).

**Offen (bearbeitet Welle K):**
- Einzel-Hänger von 0,4–1,7 s.
- WETTER-WACHE ROT im Boot 2B der V18.534-Serie: Regen bei eingefrorener Wetter-Uhr.

**Nächster Auftrag:** der Kandidat V18.535 (Welle L + K) gegen main, oder V18.534 nach dem CI-Fix.

Gestoppt ist nichts, es läuft nichts, es gibt keine Subagenten.

## Mess-Lehren

- `band` lief bei Ständen vor V18.533 in den Überlauf des Zeitstempel-Pools. Danach waren die lauf-gpuMs im selben Boot ungültig. Seit V18.533 geschnitten.
- `lauf` ruft selbst `__buehne()` und setzte damit das Wetter-Einfrieren zurück. Seit V18.533 gibt es die Wetter-Wache; trotzdem `wetterHalt` prüfen.
- Das Auto-Dorf hing an der Bildrate. Darum immer `__anazhAutoSettlement = false` vor dem umstellen.
- Die 25-ms-„Kappe" ist das 120-Hz-VSync-Raster (16,7 / 25,0 / 33,3 ms), kein Code-Limit.
- `--ort` kennen erst Stände ab V18.534.
- Die Pass-Stempel sehen auf Pascal nur ~17–28 % der Fragment-Arbeit. GPU-Zeit nur aus gpu-bank und zerlegen.
- Die Tiere streuen stark zwischen Boots. Immer melden und Mediane mit und ohne Ausreißer nennen.
- zerlegen stürzte auf Ständen mit Basis f2361bb1 am Schalter `post` ab (weak map key). Dort ohne post messen und post einzeln proben.
