# zug.sh — der Merge-Zug

Geurteilt wird genau der SHA, der landet. Ein roter Zweig fällt aus dem Zug, die Spur bleibt frei.
Rumpf: `zug.cjs` (node fetch, Token per git credential wie `ci-lesen.sh`). Worktree `C:/Users/micha/AnazhRealm-zug`
(aus `AnazhRealm-integ`, dessen Checkout nie berührt wird; `node_modules` ist eine Junction auf integ).
Exit: 0 grün/bereit/gebaut · 1 rot/Abbruch · 3 läuft · 2 Fehler.

| Verb | tut |
|---|---|
| `bereit <zweig>[@sha] ...` | je Kopf: puls 1/2, 2/2 und voll 1–18 success (je Lauf gelesen, ein abgebrochener Zwillings-Lauf ist kein Rot); Rerun-grün zählt, wird als Wackler `<job>/<schritt>` gemeldet |
| `bau --basis <ref> <zweig>[@sha]... [--push <ziel>] [--lokal]` | merget je Zweig `--no-ff` „Merge <z> in integ-probe", löst nach Klasse, fällt Klasse d mit Datei:Zeile; dann diag-atlas --check · stamm:lint · betriebsgesetz --grund <basis> · Siegel-Wort · bump-version (sie legt auch den Korpus-Stand `spec/speicher-korpus/<v>.json.br` in den Index, ein Boot) · EIN Stufen-Commit `[ci voll]`. `--lokal` zusätzlich npm run check (TAILLE_PORT 7941) + playtest:fast (FAST_PORT 7942). Push nur mit `--push` |
| `urteil <sha> [--trocken]` | GRUEN · GRUEN mit Wackler · LAEUFT · ROT `<job>/<schritt>`; ein roter Versuch 1 bekommt genau EINEN Neulauf (rerun-failed-jobs), `--trocken` ohne. Kein Warten: erneut rufen |
| `teile <sha> [--trocken]` | ROT nach dem Neulauf: Zweige aus den Merge-Commits gegen die Basis, Hälften auf `zug-a` / `zug-b` (`[ci voll]`, Force-Push); echt fährt dort nicht — ein echt-only-Rot wird benannt |
| `wackler [--tage 7]` | Neulauf-Treffer je Schritt; ≥ 2 = KARTE beim Namen |
| `landen <sha> [--trocken]` | nur GRUEN + Zeile `<sha> nicht langsamer <bericht>` in koordination `zug/abab.txt` (nach pull) + Fast-Forward von origin/main → `git push origin <sha>:main` |
| `punkte <sha> [--geraet radeon|headless] [--nur id,id | --alle] [--id <auftrag>]` | ohne `--nur` nur die Stationen ohne frische Messung am SHA (`--offen`; `--alle` die ganze Liste); fährt die Punkte-Maschine (`meisterkarte-quelle/punkte/punkte.cjs run`) am Kandidaten im Worktree `koord-punkte` (ZUG_PUNKTE); radeon über `gpu-lauf.sh`, headless mit `LINSE_GPU=software`; schreibt `messung/<sha8>-<geraet>.json`, Exit 1 bei einer roten Station. Je Station EINE Zeile nach koordination `zug/fortschritt-radeon.txt` im Format des OMEN-Diensts (START · `<station> GRÜN|ROT <min> · i/n` · ENDE/ABBRUCH; id `--id`, sonst `<sha8>-<geraet>`), gelesen von `messplatz-blick.sh`. Die GTX fährt die OMEN (`zug/punkte-gtx.md`); gebucht wird an der Karte (`punkte.cjs buchen --kopf <main>`) |
| `selbsttest` | 7 Fälle der Auflösung, ohne Netz |

Der Blick auf beide Messplätze und die CI: `messplatz-blick.sh [--einmal]` — Text im Terminal, alle 60 s, statt der Actions-Seite
(OMEN-Fortschritt und offene Warteschlange, Radeon-Fortschritt, laufende/wartende Runs mit Jobs n/m und Läufer, Kopf). Ein
claude.ai-Artifact kann es nicht (CSP: fetch nur zu eigenen Dateien). Nie auf der OMEN starten.

Konflikt-Klassen (je Block, diff3-Sicht; Reihenfolge c · a · f · e · d, die Modul-Karte b als ganze Datei):

- **c** Version: beide Seiten gleich bis auf `?v=` / `"version"` / `AnazhRealm.VERSION` / Stand-Kopf → ours (die Stufe stempelt neu)
- **a** Kommentar: nach gemeinsamem Kopf/Fuß sind beide Seiten nur Kommentar/Leerzeile → die kürzere Seite
- **f** Leerraum: beide Seiten gleich bis auf Leerraum (eine prettier-gefaltet) → die Seite mit weniger Zeilen
- **e** benachbart: jede Basis-Zeile berührt höchstens EINE Seite (git konfliktet schon bei Abstand 0; ab Abstand 1 merget es dasselbe still) → beide gelten. Eine Einfügung am Rand einer fremden Änderung bleibt d
- **b** `spec/stamm/modul-karte.json`: Ordnung zeilenweise wie e, je Modul (ours ∪ theirs) ohne was eine Seite gegen die Basis strich, sortiert, Schlüssel-Reihe = Ordnung; danach diag-atlas --check
- **d** alles andere (dieselbe Zeile, dieselbe Einfügestelle, löschen gegen ändern, binär) → `merge --abort`, der Zweig fällt, der Zug fährt weiter
