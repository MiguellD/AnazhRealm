# Vorrat 16.11., zweite Welle — der Brief der Bau-Batterie

**Zweck (vor jeder Zahl):** Die Lese-Batterie hat alle 253 Leitern der Meisterkarte 2 eingeordnet (`vision/vorrat/RANGLISTE.md`,
`rangliste.json`, je Paket ein Blatt `NN-*.md` + `.json`). Punkte entstehen erst am echten Fenster an Radeon UND GTX (R2) — und das
Fenster ist der Engpass. Du nimmst ihm Arbeit ab: du baust, was OHNE Fenster gebaut werden kann, so weit, dass danach nur noch
gemessen werden muss. Das Konto dieser Sitzung wechselt bald; **nur was auf deinem Zweig auf dem Server liegt, überlebt.** Niemand
integriert dir hinterher: dein Zweig und seine Commit-Message sind die ganze Übergabe.

## Regeln für alle

- **Du hebst keine Sprosse und meldest keine.** Was du baust, ist „gebaut, headless geprüft, am Fenster ungemessen“ — mit ehrlichem
  Prozent. Schreibe nie „grün“ über etwas, das kein Fenster gesehen hat.
- **Lies die Quelle, bevor du schneidest.** Die Blätter sind am Spiel-Kopf e4eeee08 GELESEN, nicht gemessen; main steht inzwischen auf
  a635bfee. Vor dem Schnitt: `git log e4eeee08..origin/main -- <Datei>` an jeder Datei, die du anfasst. Widerspricht der Code dem
  Blatt, gilt der Code; steht der Schnitt schon in main, melde das und nimm die nächste Zeile deines Auftrags.
- **Schneide an der Wurzel, kein Zwilling, kein Flag, kein stiller Fallback.** Eine Quelle je Domäne. Trägt ein bestehendes Gesetz die
  Sache schon, lies es und hänge dich an — baue nichts daneben.
- **Datei-Besitz:** du änderst nur die Dateien, die dein Auftrag nennt (und was dort unmittelbar gerufen wird). Brauchst du einen
  Schnitt in einer fremden Datei, schreibe ihn in die Commit-Message unter „Offen“ — schneide ihn nicht.
- **Kein Fenster:** keine Werkbank, kein Browser, kein Playwright, kein Server, keine GPU — außer dein Auftrag nennt ausdrücklich EINEN
  Lauf über das GPU-Schloss. Kein Lauf nimmt Zeiger oder Fokus des Menschen. Kein Vordergrund-Prozess über 2 min; Längeres in den
  Hintergrund mit Frist.
- **Dein eigener Baum** (nie in einem fremden arbeiten, nie im Haupt-Klon, nie `git stash`):
  `git -C C:\Users\micha\AnazhRealm-profiband fetch origin main koordination` und dann
  `git -C C:\Users\micha\AnazhRealm-profiband worktree add -b <dein-zweig> <dein-ordner> <basis>` — `<basis>` nennt dein Auftrag
  (`origin/main` für Spiel-Schnitte, `origin/koordination` für Stationen). Scheitert es an einer Sperre, nach 20 s noch einmal.
  Node-Module: `NODE_PATH=C:/Users/micha/AnazhRealm-profiband/node_modules` vor jedem node-Ruf im eigenen Baum.
- **Prüfen ohne Fenster:** `npx prettier --check <jede angefasste Datei>` (nie `--write` auf eine Datei, die schon VOR deinem Schnitt
  nicht sauber war — dann nur deine Zeilen im Stil der Datei); im Spiel-Baum `npm run check:statik`; für Kerne der Selbsttest des
  Kerns, den das Repo schon hat (suche ihn, erfinde keinen neuen Rahmen); für Stationen der Selbsttest der Punkte-Maschine (unten).
- **Sichern:** nach jedem tragenden Schritt committen und schieben: `git push origin HEAD:refs/heads/<dein-zweig>`. Du schiebst NIE
  auf main, koordination, punkte-maschine, integ-probe oder vorrat-1611.
- **Commit-Message:** Betreff beginnt mit `WIP <dein-zweig>:` und endet mit `[skip ci]`; das Wort „Abgabe“ kommt nirgends vor (der
  Zug nähme den Zweig sonst). Verboten in JEDER Message: fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU. Der Rumpf des
  LETZTEN Commits ist die Übergabe: **Geschnitten** (Datei:Zeile, ein Satz je Schnitt) · **Geprüft ohne Fenster** (Befehl und
  Ergebnis) · **Offen am Fenster** (welche Station/Probe an welcher Pose welche Zahl zeigen muss, je Gerät; welches Bildpaar) ·
  **Stand in Prozent**. Schlusszeile `Co-Authored-By: Claude Opus <noreply@anthropic.com>`.
- **Deckel:** 90 Minuten oder 400 000 Token. Reißt er, schiebe den ehrlichen Stand.
- **Schluss-Bericht:** höchstens 4 Zeilen — Zweig, Kopf-SHA, Stand in Prozent, was am Fenster offen ist. Keine Prosa.

## Zusatz für Stations-Bauer (Basis `origin/koordination`)

- Dein Besitz ist EINE Datei `meisterkarte-quelle/punkte/stationen/gN.js` und deine neue Datei `vision/vorrat/tafel-gN.json` (die
  Tafel-Zeilen, die du vorschlägst, als Liste `{station, leiter, sprosse, richter: "gleich", grund}`). Du änderst NICHT
  `vision/richter-tafel.json`, nicht `punkte.cjs`, keine andere `gN.js`, kein Spiel.
- Dein Eingang: in `vision/vorrat/rangliste.json` (Zweig vorrat-1611, lesbar im geteilten Baum, den dein Auftrag nennt) alle Zeilen
  der Klassen T, F und R, deren `station`, `rezept` oder `messgroesse` auf deine `gN.js` zeigt. Beginne oben (T vor F vor R, Bau S
  zuerst). Je Zeile: das Blatt des Pakets lesen, die Muster-Station an ihrer Fundstelle lesen (±60 Zeilen, nie die ganze Datei —
  bis 470 kB), dann die Station der Sprosse bauen: `kriterium: "karte2.<leiter>"`, `karte2: true`, `staffel: <sprosse>`,
  `geraet: ["radeon","gtx"]`, `beide: true`, `probe` in der warmen Sitzung (bestehende Probe wiederverwenden, wo sie die Zahl schon
  trägt — ein zweites Urteil auf demselben Lauf kostet keine GPU-Minute), `urteil`, `proben` (mindestens: ein Grün, je Bedingung des
  Richters ein Rot, swiftshader rot), `pfad`, `quelle: "KARTE2 <leiter> S<n> = <Richter wörtlich>"`. Das Format steht in
  `punkte.cjs:54`, das nächste lebende Muster ist `karte2.same.preis.zugang` in `stationen/g5.js` (suche `kriterium:
  "karte2.same.preis.zugang"`).
- Der Richter der Sprosse gilt WÖRTLICH. Misst die bestehende Probe nur einen Teil (anderer Umfang, ein Gerät, andere Schwelle),
  baue den fehlenden Teil in die Seiten-Funktion der Probe oder nenne die Zeile ehrlich „halb“ — setze nie eine weichere Schwelle.
- Selbsttest: `node meisterkarte-quelle/punkte/punkte.cjs selbsttest` im Hintergrund mit Frist 15 min, höchstens drei Läufe; fünf
  andere Stations-Bauer fahren ihn gleichzeitig in ihren Bäumen — scheitert er an einem belegten Port oder einer Sperre, ist das kein
  Befund über deinen Bau: 2 min warten, einmal wiederholen, sonst im Commit nennen. Sein Ergebnis steht in der Commit-Message.

## Zusatz für Spiel-Schnitte (Basis `origin/main`)

- EIN Schnitt, den ein Spieler sieht, hört oder tun kann — der, den dein Auftrag nennt. Trägt das Trocken-/Ruhe-Verhalten heute eine
  grüne Station (z. B. der Tagesplan „bit-gleich“), bleibt es ohne den neuen Eingang byte-gleich; belege das headless.
- Ändert dein Schnitt legitim einen Bake (Golden der Kerne), friere NICHT neu ein — nenne die Klassen unter „Offen“.
- Versions-Stempel (`?v=`), CHANGELOG und Karten fasst du nicht an; das macht die Landung.
