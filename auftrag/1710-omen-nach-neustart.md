# Auftrag 17.10. abends (Koordinator, vor dem Reset) — OMEN nach dem Neustart

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Der Koordinator (Radeon) startet gleich neu und ist nach dem
Reset (~30 min) wieder da. Bis dahin und darüber hinaus arbeitest du diese Liste ab: Reihenfolge = Wert, zwischen den Schritten
keine Rückfrage. Berichte als ZWISCHENSTAND in `bericht/1710-n-*.md` (n = nach Neustart), Nachricht an den Koordinator nur
„neue Datei X + Urteil“. Erreichst du die Koordinator-Sitzung nicht, reicht die Datei im Zweig `koordination` — ich lese sie
zuerst.

Stand: main 1215d560 · integ-probe 25f53923 (V18.546.17, echt ROT: Lauf 39040554053, ebenso an dafe6c65 Lauf 39037428794) ·
spielgang 72676562 (SG1) · ankunft-takt be5efc5f (B4) · koordination mit diesem Auftrag.

## 0. Der Platz nach dem Neustart (≤ 10 min)

- **Läufer:** `Get-Service actions.runner.*` muss Running sein, sonst starten. Er trägt den Job `echt` (Label omen-gpu). Beleg in
  den Bericht.
- **GPU-Schloss:** `%TEMP%\claude\gpu-schloss` — nach dem Neustart lebt kein Besitzer mehr. Liegt es noch, den Inhalt von
  `besitzer.txt` in den Bericht, dann löschen. Ab jetzt um JEDEN echten Lauf: `mkdir` atomar + `besitzer.txt` = `omen-1710-n`,
  danach lösen. Der CI-Läufer wartet darauf; nie über einen ganzen Schritt halten, nur um den einzelnen Lauf.
- **Worktrees aufräumen — ja, auch auf dem OMEN.** Je Worktree im Mess-Klon (`git worktree list`):
  - Kopf in `origin/integ-probe` oder `origin/main` enthalten (`git merge-base --is-ancestor HEAD origin/integ-probe`) und
    `git status --porcelain` leer: lokale Rohdaten (ungetrackte Bilder, JSON, artifacts/) nach
    `artifacts/profiband/wt-archiv/<name>/` des Haupt-Klons, dann `git worktree remove <pfad>`.
  - eigener Werk-Zweig mit ungepushten Commits: erst `git push origin <zweig>`, dann wie oben.
  - schmutzig (geänderte getrackte Dateien): NICHT löschen, mit Grund in den Bericht.
  - danach `git worktree prune`. Der koordination-Worktree bleibt. Nie `git stash`.
  - hängende node/chrome/save-server aus früheren Sitzungen beenden (der Neustart nahm das meiste).
- `git fetch origin`; für die Schritte unten frische Worktrees mit eigenen Ports 7900–7909, je `npm ci`.
- Bericht `bericht/1710-n-platz.md`: Läufer, Schloss, Worktrees vorher → nachher (Zahl), was blieb und warum.

## 1. echt T2 — der Täter beim Namen (ZUERST: er sperrt integ-probe)

Befund der CI: `gate:weltbild-frost:echt` T2 hört den eingespielten GPU-Fehler nicht (Index-Wache, GPU-Wache 0 Meldungen, Bild
90 % bewegt), rot an dafe6c65 und 25f53923. Kandidaten: E2 Leib-Bündel 130ba565 (sein echt-Lauf 39036331423 wurde abgebrochen,
nie geurteilt) ODER D3d (das EINE Einschwingen `__weltStehtNach`, 780a71d1 … dafe6c65).

- **Nachstellen am Kopf:** Worktree auf 25f53923, `npm run gate:weltbild-frost:echt; echo EXIT=$?` mit Schloss → ROT erwartet.
  Ist es grün: dreimal fahren; bleibt es grün, ist es ein Wackler des Läufers — Bericht mit den drei Exit-Zeilen, dann Schritt 2.
- **Eingrenzen:** `git bisect start 25f53923 1215d560`, `git bisect run` über ein Skript im eigenen Scratch, das
  `npm run gate:weltbild-frost:echt` je Stand ZWEIMAL fährt (rot nur, wenn beide rot — ein Wackler urteilt nie) und das Schloss
  um jeden Lauf nimmt. ~100 s je Lauf, ≤ 5 Stufen. Ist schon 1215d560 rot, nenne das: dann ist es der Platz (Treiber, Chrome nach
  dem Neustart), nicht der Code.
- **Urteil:**
  - Täter = LINSE (Einschwingen, Boot-Wartung, Frist, Reihenfolge Einspielen ↔ Warten): Schnitt an der Wurzel auf Zweig
    `echt-t2` ab integ-probe 25f53923, netto ≤ 0 Zeilen in `scripts/`. BEWEIS: `gate:weltbild-frost:echt` auf der GTX vorher ROT →
    nachher GRÜN (Exit-Zeilen, die Bilder zeigen die Welt), `npm run gate:weltbild-frost` (swiftshader) grün, `npm run check`
    grün, `npm run playtest:fast` grün, Push mit `[ci voll]`.
  - Täter = SPIEL (der Bündel-Pfad verschluckt den GPU-Fehler — ein verschluckter Fehler ist ein BRUCH, sein Melder ist
    `_bruchMelden`): ist die Wurzel EINE Methode, schneide sie auf `echt-t2` mit derselben Beweis-Kette plus vollem
    `npm run playtest` („Alle Invarianten OK“). Ist sie breiter: nicht schneiden, der Bericht nennt Methode (Datei:Zeile), Zahl,
    Bild; ich setze die Karte.
  - Ich merge nach Zweig-CI und fahre den echt-Neulauf an integ-probe per API.
- Bericht `bericht/1710-n-echt-t2.md` (bisect-Log, jede Exit-Zeile, der Täter-Commit, der Schnitt oder die Karte).

## 2. B4 die Ankunft auf der GTX — ABAB (ankunft-takt be5efc5f)

A = dafe6c65 (die Merge-Basis von B4, misst NUR B4), B = be5efc5f. Je Seite ≥ 4 kalte Boots, abwechselnd A B A B …:
`node scripts/diag-boot-stage.cjs --kalt --echt --json <roh>/<seite>-<n>.json --bild <roh>/<seite>-<n>.png` (Schloss um jeden
Lauf). Die Radeon nannte: Weltbild kalt 11,05 → 10,45 s, Ring ganz 9,9 → 3,3 s, Horizont 10,2 → 6–7 s, `_diaetGang` 585–708 →
3–6 ms. Je Größe Median + Spannweite je Seite, dazu Takt + Drossel (nvidia-smi) je Lauf. B4 rührt Streaming und Takt an: darum
dazu die Lauf-ABAB wie in `bericht/1710-buendel7.md` (Wiese + Genesis, Ego, stehend UND gehend). Urteil im Kopf des Berichts:
„nicht langsamer“ ja/nein, je Ort und Gang. Bericht `bericht/1710-n-b4.md`.

## 3. SG1 der Spielgang auf der GTX (spielgang 72676562)

`node scripts/diag-v1-pfad.cjs --selftest; echo EXIT=$?`, dann mit Schloss
`LINSE_GPU=karte node scripts/diag-v1-pfad.cjs --bilder <roh>/sg1; echo EXIT=$?`. Urteil je Station (ankunft, lichtung, fahrt,
wort, werkstatt): Exit, Laufzeit, und EIN Blick je Station auf ihr Bild — zeigt es die Station (Welt, nicht Ladeschirm; an der
Fahrt sitzt der Band-Partner L1 des GT am Fahrzeug, nicht am Aufstiegs-Ort). Was rot ist, beim Namen: Linse oder Spiel.
Bericht `bericht/1710-n-sg1.md`.

## 4. Danach (Werkpaket, nie Standby): G8 die Arena-Lage beim ersten Bau

Aus deinem `bericht/1710-k0.md`: jeder Spieler startet im teuren Zustand, k0 0,6 → 0,25 ms erst nach dem ersten Neubau. Zweig
`g8-arena` ab integ-probe 25f53923 (oder ab `echt-t2`, wenn Schritt 1 dort schnitt): die Arena liegt beim ersten Bau so wie
nach dem Neubau — an der Wurzel, EIN Bau-Weg, kein zweiter Auffrisch-Takt. BEWEIS: k0 am ersten Bild auf der GTX vorher →
nachher (gleiche Box, ≥ 4 Boots je Seite), `npm run check` + `npm run playtest:fast` grün, Push mit `[ci voll]`. Bericht
`bericht/1710-n-g8.md`.

Was du startest (Werkbank, Server, Browser), beendest du vor jedem Bericht. Jede Zahl mit Rohdatei, jedes „grün“ mit Exit-Zeile.
