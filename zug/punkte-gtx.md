# Punkte-Maschine an der GTX (OMEN)

Die OMEN misst keine Serie und schreibt keinen Prosa-Bericht mehr für registrierte Kriterien: sie fährt die
Maschine am SHA und committet EINE Ergebnis-Datei. Gebucht wird am Radeon-Host (`punkte.cjs buchen --kopf <main>`).

## Einmal einrichten

1. Koord-Baum der OMEN auf den Zweig mit der Maschine: `git fetch origin && git checkout koordination && git pull`
   (bis zum Merge: `git checkout -B punkte-maschine origin/punkte-maschine`).
2. Der Spiel-Klon ist das Repo hinter dem Koord-Baum (`git rev-parse --path-format=absolute --git-common-dir`, dessen
   Ordner). Dort muss `node_modules` liegen (`npm ci` einmal); der Läufer legt `.claude/worktrees/punkte-gtx` an und
   hängt `node_modules` als Junction ein.
3. Das GPU-Schloss ist Pflicht, auch an der allein genutzten GTX — ohne es ist jede GPU-Station ROT
   („gpu-lauf.sh fehlt"). Erwartet unter `<Spiel-Klon>/artifacts/profiband/werkzeug/gpu-lauf.sh` oder per
   `PUNKTE_GPU_LAUF=<pfad>`. Das Skript ist das des Radeon-Hosts (mkdir-Schloss unter `$TEMP/claude/gpu-schloss`,
   `GPU_LAUF_MAX_S`, Exit 75 bei blockiert, 124 bei Deckel).
4. Git-bash unter `C:/Program Files/Git/bin/bash.exe` (sonst `PUNKTE_BASH`). Port 4312 bleibt frei; die Stationen
   nehmen 7700–7759 und je +20000.

## Je Kandidat

```bash
cd <Koord-Baum der OMEN>
node meisterkarte-quelle/punkte/punkte.cjs selbsttest            # muss SELBSTTEST GRÜN melden
node meisterkarte-quelle/punkte/punkte.cjs run --sha <sha> --geraet gtx
git add meisterkarte-quelle/punkte/messung/<sha8>-gtx.json meisterkarte-quelle/punkte/messung/roh/<sha8>-gtx
git commit -m "Punkte-Messung <sha8> gtx: <n> grün / <m> rot"
git push origin HEAD
```

- 28 GPU-Stationen, Summe der Soll-Minuten 244 (Deckel je Station 2 × minuten). Teil-Lauf: `--nur id,id`
  (z. B. `--nur speicher.K1#1,profiband.K4#1`); die Datei sammelt je SHA alle Stationen, ein zweiter Lauf ergänzt.
- Jede Station steht als GRÜN/ROT mit Zahl und Grund in der Datei; ROT ist ein Ergebnis, kein Grund für Nacharbeit
  an der OMEN. Keine Station von Hand nachmessen, kein Urteil am Text ändern: eine geänderte Station ändert ihren
  Abdruck, und die alte Messung zählt nicht mehr.
- Roh-Ausgaben (`roh/<sha8>-gtx/*.out`, `*-werk/`) mit committen; Bilder über 5 MB nicht (`git add` der .json und .out
  genügt dem Beleg).
- Staffel 2 einer GPU-Station zählt nur, wenn Radeon UND GTX am gleichen Abdruck grün sind (R2); R6 fällt die Messung,
  sobald `git diff --name-only <sha> <kopf>` ihren Pfad berührt.
