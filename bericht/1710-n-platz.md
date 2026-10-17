# Bericht 1710-n Schritt 0 — der Platz nach dem Neustart

**Status: ZWISCHENSTAND.** Läufer lauscht, kein Schloss lag, 182 Worktrees → 40 (+5 frische für diesen Auftrag); 142 entfernt, 39
schmutzige bleiben mit Grund, nichts ging verloren (Rohdaten im Archiv, zwei lose Köpfe als Ref, ein Zweig gepusht).

## Läufer

- `Get-Service actions.runner.*` → **0 Dienste**: der Läufer ist auf der OMEN kein Windows-Dienst, sondern die geplante Aufgabe
  **„OMEN actions-runner"** (State **Running**, `conhost --headless cmd /c C:\actions-runner\run.cmd >> run.log`), so seit der
  Einrichtung 14.10. Nichts zu starten.
- `Runner.Listener.exe` PID 17788 seit 22:24:54 (nach dem Neustart), Name `omen-gtx1060`, Version 2.338.0.
- run.log: `2026-10-17 20:26:34Z: Listening for Jobs` (davor zwei „A session for this runner already exists" — die Sitzung vor dem
  Neustart lief ab, dann verbunden). Beleg: `bericht/1710-n/platz/runner-run-log.txt`.

## GPU-Schloss

- `%TEMP%\claude\gpu-schloss` lag nach dem Neustart **nicht** — kein Besitzer, nichts zu löschen.
- Ab jetzt um JEDEN echten Lauf `besitzer.txt = omen-1710-n`, gelöst nach dem Lauf (`p3/n1710/frost.sh`, `p3/n1710/b4/serie.sh`);
  die Vorfahrt des CI-Jobs (`ci_wartet`) und die CI-Ruhe gelten weiter. Letzter CI-Job im Hook-Log: 16:39 (39040554053).

## Worktrees (Mess-Klon `AnazhRealm-mess`)

| | Zahl |
|---|---|
| vorher (`git worktree list` ohne Haupt-Klon) | 182 |
| entfernt | **142** |
| — Kopf in origin/integ-probe oder origin/main, sauber | 136 (93 losgelöst, 43 Zweige) |
| — Kopf auf einem anderen origin-Zweig, sauber (abab-e2b, gtx-ratschen-1410, welle-m-nah-fern) | 3 |
| — Kopf nur lokal, losgelöst → Ref `refs/archiv/wt/<name>` im Haupt-Klon (abab-pk62 4e8270bc, abab-s18 73ad95ce) | 2 |
| — eigener Zweig mit ungepushtem Kopf → `git push origin echt-gruppe` (1fe13222 → c3b175fb, FF), dann entfernt | 1 |
| bleiben: schmutzig (geänderte getrackte Dateien) | **39** |
| bleibt: koordination | 1 |
| nachher (+ n1710-t2, n1710-echt-t2, n1710-b4a, n1710-b4b, n1710-sg1) | 45 |

- Rohdaten (ungetrackt + ignoriert, ohne node_modules) jedes entfernten Baums liegen in
  `AnazhRealm-mess/artifacts/profiband/wt-archiv/<name>/` (116 Ordner; meist anazhRealmState/Perf.json, artifacts/).
- Jede node_modules-Verbindung wurde vor `git worktree remove` mit `rmdir` gelöst (sonst folgt das Löschen ins Ziel); das Ziel
  `welle-m-fahren/node_modules` stand danach unversehrt. `git worktree prune` ok. Nie `git stash`.
- Platte C: 38 → 42 GB frei.
- Rohlisten: `bericht/1710-n/platz/inventur.tsv` (je Baum Kopf · Zweig · Klasse · geändert · Verbindung), `aufraeumen.log`,
  `bleibt.tsv`; Werkzeug `inventur.sh` / `aufraeumen.sh` daneben.

**Was blieb und warum** — alle 39 tragen einen lokalen Mess-Eingriff an getrackten Dateien (Instrument-Weichen der Serien,
Haushalt-Orte, Probe-Patches); 38 Köpfe sind gemergt, nur `ego-probe` (35a900b5) ist lokal. `ego-kampf` steht mitten in einem Merge
(`UU anazhRealm.js`). Je Baum die Dateien: `bleibt.tsv`. Gruppen:
- `scripts/diag-boot-stage.cjs` (Ankunfts-Instrument): abab-ak1, -b2a, -b2b, -bba, -bbb, -g2a, -g7b, -s2b, -am (+ foundry-bruecke, stamm/20a), -wk1 (+ stamm/15b, 20b, 20c)
- `scripts/werkbank.cjs` / `omen-messfolge.cjs` (Stations-Weichen): abab-b538, -b7b, -i542, -i543, -p015
- `spec/profiband/haushalt.json` (Messort-Stand): abab-i17e, -i546b, -i551a, -i5e2, -i9d3, -id47, -if09, -im062; abab-i551b (+ band-urteil, draw-zaehler, 6 Ratschen)
- Linsen-Proben: frost-probe, s5-a (diag-weltbild-frost, welt-boot), ego-probe, linse-probe, rf-alt, rf-main, zz-vorher, zz-nachher
- Kerne/Stamm-Proben: albedo-ab (gelaende-core), albedo-bisekt, albedo-kontrolle (albedo-tafel), hv2-d (anazhRealm.js), tw-gesetz, tw-ohne-zwilling (porta-core)
- ego-kampf: offener Merge (19 Dateien)

Hängende Prozesse: keine (nach dem Neustart lief nur `Runner.Listener`). `git fetch origin` gelaufen; frische Bäume je `npm ci`
EXIT=0 (`p3/n1710/npmci-*.log`), Linsen-Ports 7901/7902, Mess-Ports 4312/4490 wie immer.

## Übergabe

Die 39 schmutzigen Bäume räume ich nicht weiter ab, solange nichts anderes angesagt ist (jeder Eingriff wäre ein Wegwerfen).
Weiter mit Schritt 1 (echt T2), dann 2–4.
