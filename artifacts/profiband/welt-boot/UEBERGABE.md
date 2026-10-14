# Z2b-1 EIN WELT-BOOT — Übergabe (Zweig `welt-boot` ab integ-probe db940ecd)

Stand: 14.10. — der nächste Agent setzt hier fort.

## Zahlen

- Eigen-Starts in scripts/ (Zählung der BOOT-WAND, AST): **153 → 17** (`BOOT_REST` in `scripts/diag-altlasten.cjs`).
- Zeilen scripts/: **211 272 → 208 056** (−3 216; 152 Dateien, +717 / −3 933 gegen db940ecd).
- `npm run check` grün, `npm run lint` grün (0 Fehler), gate:start-rezept grün, gate:altlasten samt Selbsttest grün.

## Was steht

- `scripts/lib/welt-boot.cjs`: `statikServer({ start, seiten, keinCache })` (byte-gleich zum alten Server: 8/8 Pfade
  Status/Typ/SHA1) · `starteBrowser({ art, frist, zusatz, headless, viewport, profil, dumpio, erwartet })` über die
  Rezepte `null · webgl · standard · linse · echt` (linse/echt aus `software-gpu.cjs`, jede WebGPU-Linse druckt ihren
  Adapter im Boot) · der FEHLER-SAMMLER an jeder Seite (pageerror inkl. unbehandelter Rejection, console.error ohne die
  harmlosen Netz-Meldungen des Page-Error-Wächters, Absturz, Trennung ohne Abbau) — die Wache am Prozess-Ende macht aus
  Exit 0 mit gesammeltem Fehler Exit 1 und nennt jeden Fehler · `oeffneWelt` · `warteAufWelt` · `buehne`.
- DIE BOOT-WAND in gate:altlasten (`npm run check`): Eigen-Starts am AST (`puppeteer.launch(` · `http.createServer(`),
  `BOOT_REST` schrumpft nur (tote Zeile ROT), Selbsttest: neuer Start rot, neuer Server rot, Kommentar/Text still.
- `erwartet` ist benannt, nie pauschal: boot-foliage-ring (die Linse gibt den Null-Renderer als echten aus → Stoff-Bruch
  `getMaterialNodeClass`), fenster-wechsel (Selbsttest ES MUSS „Destroyed texture … szene:tiefenabbild" ernten).

- KOSTEN: ein Budget-Bruch (`[budget] …` aus foundry-bruecke, `BUDGET-BRUCH` im Stamm) ist ein Kosten-Urteil mit eigenem
  Richter (gate:asset-contract, regler-wirkt) — der Sammler druckt ihn beim Namen, färbt aber nicht jede Linse. Befund der
  Zweig-CI 38578219795: gotisch L1/L2 (ankunft, blocker-netz) und kathedrale L3 (regler-wirkt Selbsttest) brechen ihr Budget.

## Urteil vorher = nachher (ABAB, Basis-Worktree gegen Zweig, gleiche Ports, Verdikt-Zeilen mit maskierten Zahlen + Exit)

- webgl: boot-foliage-ring\* · foundry-memory · weather-vector · v1-resolve · portal-boot · no-second-treebuilder ·
  seam-normal · foundry-warm · foundry-deadlock · webgl-probe
- null: page-error · carve · existenz-boden · grass-thin · godray · perf-panel · schatten-takt · feld-stellvertreter ·
  fern-wasser · erstarren
- linse/standard/Rest: gpu-fehler · fenster-wechsel* · portal-konformanz · studio-begehen · schirm-monotonie · taille ·
  look-golden · fluss · weltgrenze · boot-rettung (nur die Zufalls-Kennungen der Welten anders) · asset-contract ·
  baecker-kanal · fahrzeug-fern · foundry-parity (Exit 1 → 1, schon an der Basis rot) · render-tap · garage-labor
- Summe: 36 Gates, Urteil 36/36 gleich; dazu npm run check, lint, playtest:fast (22/0) grün
- \* zuerst ANDERS: der Sammler fand einen bis dahin stummen Fehler, beide als `erwartet` benannt (s. o.), danach gleich.

## Werkzeug (Scratch `C:\Users\micha\AppData\Local\Temp\claude\welt-boot\`)

- `codemod.cjs <repo> --art <familie> [--schreib] dateien…` — zieht Server + Start, Beweis je Datei: Server-Rumpf in
  Normalform = Standard (oder Seiten-/Start-Variante), Start-Optionen alt ≡ `browserOptionen(neu)` (headless "new" ≡ true
  in puppeteer 24, Schalter als Menge, `--disable-setuid-sandbox` neben `--no-sandbox` wirkungslos).
- `abab.cjs <aus.json> gate:a …` — Urteil vorher = nachher gegen `welt-boot-basis` (db940ecd, node_modules als Junction).
- `restliste.cjs [--aufbau] [--nur liste]` — pflegt `BOOT_REST` aus der Wand selbst.
- Falle: Backslashes in Bash-Heredocs gehen verloren (`\b` wurde Backspace) — Regex nur per Write/Edit.

## CI

- Zweig-CI 38579928983 an db479ffd: **12/13**. ROT nur `voll 8/11` gate:verdeckungs-abfrage: der Sammler fand 6× pageerror
  `TypeError: Invalid value used in weak set` in r184 `resolveOccludedAsync` (swiftshader, CI) — an der Basis stumm.
  ERSTER SCHRITT des nächsten Agenten: klären, ob der Selbsttest der Linse den Täter selbst zieht (dann `erwartet` benennen
  wie fenster-wechsel) oder die Welt eine Verdeckungs-Abfrage mit totem Objekt stellt (dann im Stamm heilen); danach
  `[ci voll]` bis 13/13, dann merge-bereit.

## Offen (benannt) — die 17 der Rest-Liste

- Eigene Server-Rümpfe mit Patch/Überlagerung: haus-welt, koerper-stand, kamera-laub, klang-zensus, studio-begehen,
  boot-rettung (`/__leer`), weltgrenze (verzögertes Senden), portal-konformanz (`/__fremd.html`), gpu-fehler (eine Seite
  für jeden Pfad), studio-huelle (ohne Startseite), fluss (eigener Kern-Server), parity (Start über eine Variable).
- Bedingte Starts mit Profil: boot-stage, pruefbuehne, albedo-tafel (`echt ? … : …` samt Fenster).
- `playtest.cjs` (eigener Boot, kein Schnitt in dieser Welle) und `werkbank.cjs` (Steuer-Server, der Statik-Server ist
  gezogen).
- Nächster Schritt: `statikServer` um einen Liefer-Haken `liefere(p, data)` erweitern (deckt haus-welt, koerper-stand,
  studio-begehen, kamera-laub, klang-zensus), die drei bedingten Starts wie weltbild-frost ziehen, danach `oeffneWelt`
  für die Folge newPage → Null-Renderer → goto → waitForFunction in den ~100 Linsen, die sie wörtlich tragen.
