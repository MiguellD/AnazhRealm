---
name: dirigieren
description: "Schöpfer 07.10.: Organisation ist der Hebel — OMEN als Mess- UND Werkplatz, Journal-Wache statt Barriere, GPU-Schloss, eigener Scratch je Agent, Prüf-Proportion, Kosten-Soll je Linse"
metadata:
  node_type: memory
  type: feedback
  originSessionId: bd24003f-04f9-42c3-b62b-aa42986e5cb8
  modified: 2026-10-18T08:57:34.179Z
---

Schöpfer (07.10.2026): „während der omen meist im standby, hier überlast und kollision, überschreiben, dirigieren und organisieren scheint
ein wichtiger hebel, subagenten nicht unnötig viele tokens burnen". Dazu am 10.10.: „den omen gerade auf standby?“

**Why:** Hier liefen 7 schwere Arbeiter bei 79 % CPU, Zeit-Linsen doppelt so lang, die zweite Maschine ruhte, und Ergebnisse lagen
unbemerkt im Journal.

**How to apply:**
- **OMEN:** Messaufträge haben Vorrang. Dazwischen trägt er IMMER ein Werkpaket in eigenem Worktree mit Ports 7900–7909, nie Standby.
  - Datei-Kanal ist der Waisen-Branch `koordination` (Worktree .claude/worktrees/koordination): `auftrag/` schreibt der Koordinator,
    `bericht/` der OMEN.
  - Nachrichten tragen nur „neue Datei X + Urteil". Siehe [[omen-messplatz]].
- **Keine Barriere-Blindheit:** Jedes Agenten-Ergebnis kommt sofort an. Dafür sorgt
  `bash artifacts/profiband/werkzeug/ereignis-warte.sh <merk-ordner> name=<workflow-dir>` als Bash run_in_background: ein Wecker je Ereignis,
  danach neu starten.
- **Kollisionen:**
  - GPU-SCHLOSS: atomar `mkdir %TEMP%\claude\gpu-schloss` + `besitzer.txt`, NUR um den einzelnen echten Lauf. Lösen nur mit dem eigenen
    Namen; älter als 60 min gilt als verwaist.
  - Je Agent ein EIGENER Scratch: Am 07.10. und 13.10. überschrieben sich Agenten im geteilten Ordner.
  - Exklusive Worktrees und Port-Blöcke.
- **Prüf-Proportion:**
  - Familien fahren die Gates ihrer berührten Methoden + playtest:fast; die CI richtet die Batterie.
  - Der Integrator fährt den VOLLEN Playtest je Merge. Ohne ihn blieb am 08.10. ein Merge-Bruch über drei Merges unentdeckt.
  - Die volle Batterie läuft einmal je Version.
  - Arbeiter-Prompts verlangen: jede Zahl mit Rohdatei, jedes „grün“ mit Exit-Zeile.
- **Ressourcen (Schöpfer 13.10.: „den omen noch im griff, er scheint oft zu stehen … swiftshader … nutzt du deine ressourcen effizient?“):**
  - Der OMEN wartet nie auf einen Kopf; der Messauftrag kommt mit einem Werkpaket dahinter (13.10.: 1310-3 E an der Genesis).
  - 40 Render-Linsen fuhren lokal swiftshader (42–292 s je Pipeline-Bau), die Radeon lag still. K39 (Branch linsen-gpu) misst, ob Linsen ohne Zeit-Urteil lokal auf den Hardware-Adapter gehen. Die CI bleibt swiftshader, das Schloss nur für Zeit und Beweis-Bühnen.
  - Das Auge ist an bei Runden, sonst aus (36 % GPU); dem Schöpfer sagen, wann es steht.
- **Kosten-Soll:** Jede neue Linse ≤ 3 min CI, Laufzeit vorher/nachher in der Commit-Message. Wände ohne CI-Schritt sind Wachsamkeit.
- **Fluss 14.10. (bewährt):** Fertigsteller je Karte auf eigenem Zweig ab integ-probe; der Koordinator merged SELBST (Konflikte meist „beide Seiten“),
  dann check:statik + playtest:fast + Push, CI-Warter als Bash run_in_background auf head_sha (alle Status abfangen, nicht nur in_progress).
  Mehrere fertige Zweige ins EINE Bündel → EINE OMEN-ABAB, EINE Augen-Runde, EIN FF. Budget-Puls: Bash `sleep 900` im Hintergrund, dann get_usage.
- **Worktrees** nach dem Merge entfernen (14.10.: 151 → 24); ihre lokalen Roh-Daten vorher nach artifacts/profiband/wt-archiv/<name>.
- **Linsen-Absturz:** Eine Werkbank-Linse, die abstürzt und Exit 0 meldet, ist still grün (gate:nah-fern seit K16 bis 14.10.).
- **Nachbesserung:** bis zu drei Runden automatisch, denn bei tiefen Klassen fand jede Prüfrunde die nächste Ecke.
- **Tokens:** Synthese-Agenten bekommen den Journal-PFAD (`<transcriptDir>/journal.jsonl`, Zeilen type "result") statt `JSON.stringify(x).slice(0, N)` — am 13.10. schnitt so ein slice 5 von 8 Scheiben der Grok-Sichtung weg, die Synthese urteilte über die Hälfte. Ein Arbeiter je Paket, kein Fan-out-Theater.
- Siehe [[selbst-organisieren]], [[werkzeug-lehren]], [[verdichtung]].
- **Rohdaten nie in den Baum:** artifacts/ ist gitignored. Die Bitte „Übergabe mit committen“ ließ Arbeiter `git add -f` fahren (14.10.: 201 Dateien, 217 MB, davon 82 schon auf main). Übergaben gehören nach koordination oder bleiben unverfolgt; die Archiv-Wand in gate:betriebsgesetz (`git ls-files -ci --exclude-standard`) ist seit 533e2360 rot dagegen.
- **Zweig-CI am EXAKTEN Kopf vor dem Merge** (15.10., K68): ein Kopf aus WIP-Commits mit [skip ci] hat keine CI — der Merge brach zwei
  Text-Linsen (geänderter Methoden-Kopf), integ-probe fing es erst eine CI-Runde später. Vor jedem Merge `ci-lesen.sh <kopf>`; fehlt sie, erst pushen lassen.
- **18.10. wiederholt:** B4 (Takt/Streaming) kam nach Radeon-Prüfern, aber VOR der echt-Batterie am EXAKTEN Kopf nach integ → echt
  3× rot an 3 Schritten (Ego-Schatten, Foundry-Impostor, Nah-Linse S), Revert ab97f0a8. Die OMEN-ABAB maß einen alten Kopf
  (be5efc5f); nach drei Nachbesserungen ist das kein Maß mehr. Regel: Takt-/Streaming-Karten vor integ IMMER echt-Batterie +
  ABAB am exakten Kopf auf der GTX.
- **integ-probe nur für Gemessenes** (14.10.): K51-3 kam vor seiner ABAB hinein und sperrte Welt-Boot und Archiv-Wand (Umweg main-naechst per cherry-pick). Riskantes (Streaming, Takt, Pixel) bleibt auf seinem Zweig bis zur ABAB; jede solche ABAB misst auch GEHEND (K51-3: stehend gleich, gehend Frame p95 28,7 → 41,6 ms).
- **Versions-Stufe nach jedem Bündel** (`npm run bump`): sonst tragen geänderte Kerne den alten `?v=` (14.10. vergessen, sechs Kerne). H2b erlaubt eine Minor-Version Abstand zu den Ratschen — vor 18.N+1 die Ratschen neu prägen, sonst Patch-Stufe.
- **Aufräumen nach jeder Welle** (14.10.: vergessene Werkbank-Fenster, Puppeteer-Browser, 7 save-server, 13 journal-wache, 4 Studio-Tabs im Chat): `powershell -File artifacts/profiband/werkzeug/aufraeumen.ps1` (schützt den Spiel-Server :4312) + Chat-Browser-Tabs schließen. Arbeiter-Prompts verlangen: was du startest (Werkbank, Server, Browser, Tabs), beendest du vor der Rückgabe.
- **CI-Plätze (16.10., Karte CW):** das Konto hat 20 Läufer-Plätze, ein voller Lauf belegt 18 + Puls; laufen mehrere `[ci voll]` zugleich,
  wartet jeder bis 14–15 min auf Plätze (Wanduhr 23–30 min statt ~8). Darum: integ nur gebündelt pushen, Karten-Wellen nicht alle in
  dieselbe Viertelstunde legen; `gate:ci-deckung` (ALT) wird ROT nach > 7 Merges ohne `node scripts/ci-zeiten.cjs` (Token) — Integrator-Pflege.

**19.10. Lehre (Paket B4+B5):** Nie einen Zweig mergen, dessen eigener Kopf nie durch die VOLLE CI lief — OMEN-WIP-Köpfe tragen
`[skip ci]`; „echt grün“ allein deckt die 18 Voll-Gruppen nicht (W7-Zeit-Kreis in Gruppe 18, zerstörter Puffer in Gruppe 8 kamen erst
an integ ans Licht). Vorher: Zweig-Kopf mit `[ci voll]` pushen, grün abwarten, dann merge. Und: Gate-Ketten vor einem Push mit `&&`
binden — ein `;` pushte trotz CHECK EXIT=1.

**19.10. 10:40 Schöpfer: „von Minuten zu Stunden statt weniger Minuten?“** Gemessen: je Karte 1,5–3,5 h, main wartete 3 h auf ein
GTX-ABAB der vollen Matrix. Ursache: vierfacher Beweis (Schneider · Prüfer · Integrator je check + voller Playtest · integ-CI) +
ABAB über alle Zellen. REGEL (Gebot 9 proportional): der volle Playtest läuft EINMAL in der CI (Gruppe 1); der Prüfer fährt nur die
Linse ROT→GRÜN + Diff + CI lesen + Blick (karten-welle.js geschnitten); der Integrator merged bei Basis = integ-Kopf ohne lokalen
Doppel-Playtest; ABAB nur die Zellen, die die Karte berührt, 4+4, ≤ 45 min.
Gemessen 19.10.: die Zeit steckt in den SCHRITTEN der Agenten (60–300 Werkzeuge × ~15 s, drei Agenten nacheinander je Karte), nicht in
der CI (voll ~10 min, Puls ~2 min). Geschnitten: `direkt: true` in karten-welle.js = EIN Macher (Linse + Schnitt + Push) wenn die Wurzel
bekannt ist; main wartet NICHT auf das GTX-ABAB bei Karten ohne Bild-/Streaming-Arbeit (integ-CI inkl. echt grün → FF; ABAB folgt,
bei Minus Revert). Erstmals angewandt: F1 → main e93134f4 ohne Warten.
