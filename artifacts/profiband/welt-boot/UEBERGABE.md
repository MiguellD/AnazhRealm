# Z2b-1 EIN WELT-BOOT — Übergabe (Zweig `welt-boot` ab integ-probe db940ecd)

Stand: 14.10. — der nächste Agent setzt hier fort.

## Was steht

- `scripts/lib/welt-boot.cjs`: `statikServer()` (der eine Statik-Server, byte-gleich zum alten: 8/8 Pfade gleich
  Status/Typ/SHA1) · `starteBrowser({ art, frist, zusatz, headless, viewport, profil, erwartet })` über die Rezepte
  `null · webgl · standard · linse · echt` (linse/echt aus `software-gpu.cjs`, die Linse druckt ihren Adapter selbst) ·
  der FEHLER-SAMMLER an jeder Seite (pageerror inkl. unbehandelter Rejection, console.error ohne die harmlosen
  Netz-Meldungen des Page-Error-Wächters, Absturz, Trennung ohne Abbau) — die Wache am Prozess-Ende macht aus Exit 0
  mit gesammeltem Fehler Exit 1 und nennt jeden Fehler · `oeffneWelt` · `warteAufWelt` · `buehne`.
- DIE BOOT-WAND in `scripts/diag-altlasten.cjs` (gate:altlasten, in `npm run check`): zählt Eigen-Starts am AST
  (`puppeteer.launch(` · `http.createServer(`), `BOOT_REST` ist die Liste der noch eigenen, sie schrumpft nur (eine
  tote Zeile ist ROT), Selbsttest feuert (neuer Start rot, neuer Server rot, Kommentar/Text still, tote Zeile rot).

## Werkzeug (Scratch `C:\Users\micha\AppData\Local\Temp\claude\welt-boot\`)

- `codemod.cjs <repo> --art <familie> [--schreib] dateien…` — zieht Server + Start je Familie, Beweis je Datei:
  Server-Rumpf in Normalform = Standard, Start-Optionen alt ≡ `browserOptionen(neu)` (headless "new" ≡ true in
  puppeteer 24, Schalter als Menge, `--disable-setuid-sandbox` neben `--no-sandbox` wirkungslos).
- `abab.cjs <aus.json> gate:a gate:b …` — Urteil vorher = nachher: Basis-Worktree `welt-boot-basis` (db940ecd,
  node_modules als Junction) gegen den Zweig, Ports 8930+, Verdikt-Zeilen mit maskierten Zahlen + Exit.
- `restliste.cjs [--aufbau] [--nur liste]` — pflegt `BOOT_REST` aus der Wand selbst.
- Falle: Backslashes in Bash-Heredocs gehen verloren (`\b` wurde Backspace) — Skripte mit Regex nur per Write/Edit.

## Familien (Rezept des Starts)

| Familie | Dateien | Zeilen | ABAB (Urteil gleich) |
|---|---|---|---|
| webgl | 62 | −1 437 | 9/10 gleich; boot-foliage-ring wurde ROT: die Linse setzt `_isHeadlessNull = false` am Null-Renderer, der Stoff-Bau bricht laut (`getMaterialNodeClass`) — als `erwartet` benannt |
| null · linse · standard · gemischt · echt · rest | 89 | ~−1 900 | siehe Commits |

## Offen (benannt)

- Rest-Liste: die Eigen-Starts mit eigenem Server-Rumpf (Seiten-Patcher, Studio-Startseiten) und bedingten Rezepten
  (`ECHT ? … : …`), dazu `playtest.cjs` (eigener Boot, kein Schnitt hier) und `werkbank.cjs` (Steuer-Server).
- Nächster Schritt: die bedingten Starts auf `starteBrowser({ art: ECHT ? "echt" : "linse", … })`, die Seiten-Server
  auf `statikServer({ seiten, start })`, dann `oeffneWelt` für die Folge newPage/Null-Renderer/goto/waitForFunction.
