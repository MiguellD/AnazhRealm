# Kartenkopf 24.10. — bindend für jeden Arbeiter dieser Woche

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Danach diesen Kopf, dann deine Karte. Nichts sonst ganz lesen.

## Ziel und Maß
- Das Maß ist die **Meisterkarte** (koordination `meisterkarte-quelle/src/gN.js`: Kriterium, Staffel wörtlich, Messung, Schlupfloch).
  Ein Punkt zählt nur, wenn die **Station** des Kriteriums (koordination `meisterkarte-quelle/punkte/stationen/gN.js`, Schlüssel
  `<bereich>.K<n>#<staffel>`) am Kopf deines Zweigs GRÜN urteilt. Die Karte endet erst, wenn die Staffel am Kopf kippt — nicht bei 80 %.
- Hat dein Kriterium keine Station: du baust sie mit (Befehl im Spiel-Baum, `urteil(j, lauf) → {gruen, zahl}`, `pfad`-Globs, `quelle`
  = der Staffel-Text wörtlich) und gibst den fertigen JS-Eintrag in der Rückgabe zurück (Feld `station`). Du committest NIE in koordination.
- Die Station fährst du in DEINEM Worktree mit deinen Ports (Befehl aus der Station, Platzhalter {PORT} {AUS} {BAUM} selbst ersetzen),
  nie über `punkte.cjs run` (der teilt einen Spiel-Baum je Gerät mit der laufenden Messung).

## Rahmen
- Haupt-Klon `C:/Users/micha/AnazhRealm-profiband` (Git-Bash). Basis ist **origin/main** (Kopf per `git ls-remote origin main`); vor dem
  letzten Push `git merge origin/main`, NIE origin/integ-probe (dort steht ein Zug-Kandidat, der fallen kann).
- Worktree `C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/<zweig>`; besteht er, `status` + `log --oneline -8` sichten und
  weiterbauen (WIP-Commits der Notbremse sind ungeprüft — prüfen, nichts ungesehen verwerfen). `node_modules` als Junction auf den
  Haupt-Klon (`cmd //c mklink /J`), sonst `npm ci`.
- Ports NUR aus deinem Block. Nie 3000, 4312, 4313, 7880, 7700–7799 (Punkte-Maschine).
- GPU nur über `bash C:/Users/micha/AnazhRealm-profiband/artifacts/profiband/werkzeug/gpu-lauf.sh <dein-key> <befehl…>` (EIN Lauf je
  Aufruf, Deckel 900 s, länger nur mit `GPU_LAUF_MAX_S`). Die Radeon fährt heute parallel eine 4-h-Punkte-Messung Station für Station
  — warte am Schloss, übernimm nie ein fremdes. Zeit-Serien (ms, A/B über Boots) misst nur die OMEN: nenne die Serie in der Rückgabe.
- Lange Läufe als Bash `run_in_background` mit EINER Meldung, Ausgaben gefiltert (`| tail -20`, grep auf Urteil/Exit). Lies gezielt
  (`npm run atlas -- --find <name>`, `sed -n` ≤ 80 Zeilen), nie ganze Dateien. Werkzeug-Verben aus der Hilfe
  (`node scripts/werkbank.cjs --help`), nie aus dem Quelltext.

## Das Macher-Gesetz (du trägst es VOR dem Push — es gibt keinen Prüfer-Agenten)
1. **Die Klasse ganz:** jede Stelle desselben Fehlers fällt in DIESER Welle (grep über stamm/, Kerne, worlds/, scripts/).
2. **Kein Zwilling:** existiert die Regel schon (dieselbe Datei, Vendor), rufe sie.
3. **Labor = Welt:** Plan-/Asset-Fehler heilen im Studio-Kern unter Byte-Beweis, nie als Host-Pflaster; die Welt verliert nichts still.
4. **Die Decke:** `node scripts/diag-betriebsgesetz.cjs --grund origin/main --kopf HEAD` ≤ 0 — bezahlt mit echtem Streichen
   (Linse ersetzt Linse), nie Pressen. (Die Umstellung auf Code-Atome ohne Kommentare läuft als eigene Karte `decke-code`.)
5. **Was fällt, fällt ganz:** verwaiste Kommentare, Doku-Zitate, Linsen-Verweise im selben Commit.
6. **Die Linse urteilt Verhalten** am Spieler-Weg (Ausgabe-Pfad, Ereignis statt Wanduhr), nie Text; nie aufweichen, damit es grün wird.
7. **Du entscheidest** nach Gesetz und Messung — keine Frage an den Schöpfer, keine Optionsliste.
8. **Bild- oder Programm-Pfad berührt** (Leib, Stoff, Bühne, Bündel, Schatten, Licht): die echt-Wände deiner Zone lokal auf der Radeon
   (gpu-lauf.sh) — die Zweig-CI überspringt echt.
9. **Kein Wackler an der eigenen Mechanik:** ein CI-Rot an einer Linse, deren Mechanik dein Schnitt berührt, ist ein Befund — heilen.
10. **Puls vor dem Push:** `node --check`, `npx eslint <geänderte>`, `npm run format:check`, `node scripts/diag-atlas.cjs --check` +
    `npm run stamm:lint` (bei Stamm-Schnitt), `npm run check` mit `TAILLE_PORT=<dein Port>`, `npm run playtest:fast` mit `FAST_PORT=<dein Port>`.

## Ablauf und Abgabe
- Linse/Station vorher ROT am Täter (Exit-Zeile, Zahl) → Schnitt an der EINEN Engstelle → Station GRÜN → Puls → Bild der Szene aus dem
  Ausgabe-Pfad (`scripts/lib/ausgabe-aufnahme.cjs`) selbst ansehen, wenn das Kriterium ein Bild hat → Push → enden.
- WIP alle ~45 min: `git commit -m "WIP <karte>: <stand> [skip ci]"` + push. Der LETZTE Push trägt `[ci voll]` und KEIN `[skip ci]`.
  **Warte NIE auf die CI** — der Zug liest sie (`zug.sh bereit`).
- Selbstgrenze: nach ~200 Schritten oder großem Kontext WIP committen + pushen und mit `prozent` < 100 und Übergabe zurückgeben.
- Commits deutsch, emoji-frei, Rumpf drei Sätze (geschnitten · gemessen · offen) ≤ 600 Zeichen, Zahl in der Message, keine
  Siegel-Wörter (fertig, RUND, vollendet, vollzogen, Schluss, SCOPE ZU — auch als Wortteil), Schluss-Zeile
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Nie git stash, nie force-push, nie in integ-probe/main mergen.
- Vor der Rückgabe: eigene Prozesse beendet, Ports frei, Baum sauber, Kopf gepusht (SHA per `git ls-remote origin <zweig>`).
- **Rückgabe (genau diese Felder):** `kopf` (SHA) · `prozent` · `station` (Schlüssel, vorher → nachher mit Zahl, Gerät; bei neuer
  Station der JS-Eintrag) · `beweis` (Exit-Zeilen Puls/check/playtest:fast, Bild-Pfad + was du sahst) · `offen` (Rest mit Grund) ·
  `omen` (eine Zeit-Serie, falls die Karte Takt/Bild-Kosten berührt: Zellen, A/B-SHAs).
