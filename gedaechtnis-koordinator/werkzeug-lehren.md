---
name: werkzeug-lehren
description: "Backslash-haltige Ersetzungen (Regex, WGSL-\\n) nie per node -e oder Heredoc-Template schreiben — Edit-Werkzeug nehmen"
metadata:
  node_type: memory
  type: feedback
  originSessionId: c019394d-5e88-4b23-a069-7e916f3a8967
  modified: 2026-10-06T17:15:51.273Z
---

Ersetzungen, die Backslashes tragen (Regex-Literale wie `\|\d+`, WGSL-Strings mit `\n`), verlieren sie auf dem
Weg durch Bash-Quoting (`node -e '…'`) und durch JS-Template-Literale in Heredoc-Skripten (`\\|` → `|`). Am
04.10.2026 dreimal passiert (Metrologie-Anker, Crossfade-Regex beim Merge, Kapsel-Probe) — einmal wurde ein
kaputter Regex sogar committet.

Und Byte-Goldens müssen plattformgleich rechnen: V8 rundet `Math.sin/cos` je OS verschieden (Linux glibc-libm,
Windows fdlibm). Auslöschungs-Reste (~1e-18, mathematisch 0) tragen dieses letzte Bit in float32 sichtbar —
04.10. war die Linux-CI rot, lokal grün (tanne-s12345-L1, eine Nadel-Karte). Linse: gate:asset-contract schreibt
bei Divergenz die gebauten Bytes ins CI-Log (DIVERGENZ-BYTES), Vergleich gegen den lokalen Bau.

Und (06.10.2026, Welle L): `git stash` ist über ALLE Worktrees EIN Stapel (refs/stash). Zwei parallele Familien
(auge-v1, wasser) stashten gleichzeitig und tauschten beim pop ihre Änderungen (der Wasser-Shader-Schnitt landete im
falschen Worktree; auge-v1 rettete ihn als Patch). Jeder Arbeiter-Prompt für parallele Worktrees enthält: NIE git stash —
Vorher-Läufe per `git show BASIS:datei` oder temporärem `git worktree add`, Zwischenstände als WIP-Commit.

Und (06.10.2026, Welle L): NIE SendMessage an Agenten, die ein WORKFLOW gestartet hat. Die Antwort „Resuming agent …"
heißt: es lief eine ZWEITE Instanz aus demselben Transkript an — zwei Agenten schrieben in denselben Worktree (fremde
Hunks, fremder git-Worktree unter artifacts/), und TaskStop auf die ID beendete beide, Workflow tot. Nachrichten nur an
Agenten, die ich selbst per Agent-Tool startete („Message queued"); Workflow-Agenten informiert man über eine Datei, die sie
lesen, oder man stoppt den Workflow und setzt ihn mit einem Fortsetzungs-Auftrag neu auf.

**Why:** der Fehler ist still — das Skript läuft grün, der Regex matcht danach nichts mehr.
**How to apply:** Regex-/Escape-Änderungen immer mit dem Edit-Werkzeug; nach jeder Skript-Ersetzung die Zielzeile
zurücklesen (grep) und den Regex an Beispiel-Schlüsseln ausführen, bevor committet wird.

Und (08.10.2026): im Haupt-Klon AnazhRealm-profiband aktualisiert `git fetch origin <branch>` den Zeiger `origin/<branch>` NICHT (enge fetch-Konfiguration) — `git rev-parse origin/integ-probe` zeigte einen Stand von Stunden vorher, und ein OMEN-Messauftrag nannte kurz die falsche Seite B. SHAs fuer Auftraege, Merges und main-Vorspulen IMMER per `git ls-remote origin <branch>` holen.

Und (11.10.): Ein Resume nach einer Änderung am Vorlagen-Text (z. B. KOPF in workflows/karte.js) trifft den Cache nur bis zum ersten Agenten,
dessen Prompt den geänderten Text trägt — Bauer/Nachbesserer laufen dann frisch. Darum trägt jeder WIP-Commit die Übergabe im Rumpf
(≤ 15 Zeilen): der frische Arbeiter liest sie aus `git log` und verliert nichts. Und: die Übergabe am Kontext-Deckel braucht JEDE
Arbeiter-Rolle (Bau UND Nachbesserung) — ein halber Stand wird nie geprüft.

Und (14.10., K54): ein `save-server.js`, gestartet mit `cd <baum> && node save-server.js`, trägt KEINEN Pfad in der Befehlszeile —
ein Abräumen per CommandLine-Muster verfehlt ihn, der nächste Boot findet den Port belegt (EADDRINUSE im Server-Log) und misst still
die ALTE Seite (B-Boot zeigte A-Zeilennummern). Abräumen per Port (`Get-NetTCPConnection -LocalPort <p> -State Listen` → OwningProcess)
und je Boot `git log -1` des bedienten Baums ins Protokoll. Und: TaskStop auf ein Serien-Skript tötet seine Kinder (boot.sh) nicht.

Und (15.10., Wachstums-Wand): nie `prettier --write` über scripts/ — format:check deckt sie nicht, der Lauf bläht Zeilen auf und die
Wachstums-Wand nennt das ROT (+17 ohne Spiel). Heredocs im Bash-Werkzeug können `\` zu `\` falten: Skripte mit Regex-Backslashes per Write.

Und (17.10.2026): `npm run check` lokal nur mit `TAILLE_PORT=<frei>` — gate:taille startet seinen Save-Server ohne Angabe auf
4312 (dem Port des Schöpfers) und reißt dann mit „server timeout". Integrator-Pflege nach mehreren Merges: `gate:ci-deckung`
(T) ALT → `GH_TOKEN=… node scripts/ci-zeiten.cjs` misst und verteilt in EINEM Befehl, dann committen.
- 18.10.: Ein cherry-pick trägt die Message mit — ein `[skip ci]` vom WIP-Zweig ließ den integ-Kopf dd4de393 ohne CI. Nach jedem Pick die Message prüfen (`git log -1 --format=%B | grep "skip ci"`), sonst `cherry-pick -e` und den Marker streichen. Den Marker NIE wörtlich in eine Message schreiben, auch nicht zitiert — GitHub findet ihn überall (2fa90f58 lief darum ebenfalls ohne CI).

**21.10.:** Integrator-Ketten mit `; git push` pushen trotz rotem check — Push nur in `if [ $C -eq 0 ]`. TAILLE_PORT nie in einem Port-Block laufender Karten (7911 lag in kamera-fuss 7910–7919) — nimm 7991. ci-zeiten.cjs alle ~8 Merges neu (Wand T ALT).
