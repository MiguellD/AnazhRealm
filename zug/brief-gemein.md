Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Arbeite nach `.claude/agents/champion.md`; lade den Skill `anazh-lehren` vor Stamm-, Kern- oder Linsen-Chirurgie.

DER RICHTER ist die Station der Punkte-Maschine: `git fetch origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine"`, dann `git show origin/punkte-maschine:meisterkarte-quelle/punkte/stationen/<gN>.js` (Eintrag mit kriterium + staffel deines Auftrags: befehl, env, urteil, pfad, quelle). Beweis = der befehl der Station headless im Baum DEINES Zweigs (LINSE_GPU=software, {PORT} 7700, {AUS} eine json-Datei, {BAUM} dein Baum) und ihr urteil(j, lauf) per `node -e` (require der Station aus einem Checkout von punkte-maschine) → GRÜN, mit Zahl vorher (main) → nachher. NIE die Linse weich machen. Misst die Station nicht das Gesetz ihres Staffel-Texts, schärfe sie in einem eigenen Zweig `<dein-zweig>-pm` von origin/punkte-maschine (Mutante in `proben`, `node meisterkarte-quelle/punkte/punkte.cjs selbsttest --ohne 3c` grün); eine pm-Station nennt nur Pfade, die am main existieren.

TAKT: Push ab dem ersten Schritt je Schritt „WIP <zweig>: … [skip ci]“ — die Sitzung kann jederzeit enden, was nicht gepusht ist, ist verloren. Die Abgabe ist EIN Commit „Abgabe <zweig>: …“ OHNE [skip ci], mit drei Sätzen: geschnitten (Datei:Zeile) · gemessen (Zahl der Station vorher → nachher) · ehrlich offen. Vor der Abgabe `git merge origin/main` frisch (Konflikte selbst lösen) und am Kopf GRÜN: `npm run check`, `npm run playtest:fast` und jede voll-Linse, deren Familie deine Dateien liest (Befehle in `.github/workflows/check.yml`). Berührst du den Render-Pfad (stamm/stoff-*, bild-*, koerper-*, dirigent-*), fahre die Post-Kette- und die Ego-Schatten-Linse auf swiftshader und suche „[ERROR] STOFF“. Auf Zweigen läuft nur der Puls der CI; warte nie auf die volle Batterie.

POST: Der Koordinator schreibt dir per git. Lies alle ~30 min und vor jedem Push: `git fetch -q origin koordination && git show origin/koordination:cloud-post/<zweig>.md` (neueste Nachricht oben) und handle danach.

WÄNDE (jeder Zug fiel schon daran):
- Die DECKE: `scripts/` hat eine Atom-Decke (in `npm run check`). Wer dort wächst, bezahlt im SELBEN Zweig (toten Code, Zwillinge, doppelte Helfer löschen).
- Kein `bericht/`-Ordner im Spiel-Zweig (die Zitat-Wand). Kein Eintrag in docs/PFLICHT-OFFEN.md oder im Stand von CLAUDE.md (nur der Schöpfer setzt sie).
- Keine neue GPU-Probe (die Fahrt-Wand steht bei 1798/1800 s je Karte).
- Cloud hat keine GPU: swiftshader baut jede Pipeline synchron (42–292 s). Liefere Code + headless Beweis (Zähler, Byte-Diff, Faden-ms, Selbsttest der Linse) — KEINE Welt-Bilder zum Beweis; die Bilder macht der Koordinator auf der Radeon.

REGELN: Commit-Autor `git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit`. Verbotene Wörter in Commit-Nachrichten: fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU. Nie `git stash`. Gebot 4: EINE kanonische Quelle je Domäne — kein Zwilling, kein Flag, kein Sonder-Modul, kein stiller Fallback; schneide an der Wurzel. Nach der Fehler-Klasse eine Linse, die den Täter beim Namen nennt (Mutante ROT), in einer bestehenden Familie. PFADFINDER: was du auf dem Weg findest, heilst du in deinen Dateien und deiner Klasse mit (eigener Commit, Zahl); Größeres als „FUND: Datei:Zeile · Wurzel · Kriterium · Größe S/M/L“ in der Abgabe-Nachricht. Die Besten als Maßstab: nenne in der Abgabe, welche bekannte Lösung (Studio/Paper/Engine) dein Schnitt umsetzt. Kein „fertig“ — der Koordinator landet per Zug und misst auf der Farm.

ECHTE GPU (seit z303, 07.11. 22:40 auf main — vorher `git merge origin/main`): VOR der Abgabe prüfst du jedes sichtbare Ergebnis selbst auf echter GPU (OMEN GTX 1060 oder Radeon 890M), nicht auf swiftshader:
1. In der Kopf-Commit-Message (ohne [skip ci]): [gpu-probe: gate:ego-schatten, bild:wiese@0.3]
2. Erlaubt: gate:<npm-skript aus package.json>, zeit:gate:<npm-skript> (seit z345, 09.11. 15:16: dasselbe Gate, aber NUR auf einem Band-Gerät OMEN GTX 1060 / Radeon 890M — Pflicht für jedes Gate mit Zeit-Urteil wie geh-zerlegung oder ankunft, Beispiel `[gpu-probe: bild:wiese@0.5, zeit:gate:ankunft]`) und bild:<wiese|genesis|dorf|buehne|stadt|stadt-voll|hochhaus-dach|gipfel-blick>[@uhr 0..1], höchstens drei.
3. Nach 2–4 min: git fetch -q origin koordination && git show origin/koordination:cloud-post/<zweig>.md | head -5
4. Urteil und letzte Zeilen: git show origin/koordination:probe-post/<zweig>/<sha8>.md
5. Bild: git show origin/koordination:probe-post/<zweig>/<sha8>-<ort>.png > bild.png, dann mit Read ansehen — vergleiche mit demselben Ort an main.
Der Zug-echt-Job hat Vorrang; eine Probe dauert höchstens 8 min.
WEITERE WÄNDE (07.11.): Boden-WGSL ≤ 100 000 Zeichen (S0-Linse; main steht knapp darunter — jede Shader-Zeile bezahlen); Siegel-Wörter werden auch als Wortteil getroffen („Kronenschluss“); `npm run gate:welt-boot` am Kopf grün (ein Aufruf einer umbenannten Funktion bricht den Zug-Bau).

## WARTEZIMMER (bindend seit 08.11.; der einzige Weg, wie Post dich erreicht)
Nachrichten anderer Sitzungen erreichen eine Cloud-Sitzung NICHT (gemessen: 0 von 6). Nach deiner Zeile `ABGABE <sha>` in `cloud-post/<zweig>.md` beendest du die Runde NICHT. Fahre Warte-Schritte von je ≤ 9 min: alle 5 min `git fetch origin koordination` und prüfe, ob in `cloud-post/<zweig>.md` nach deiner ABGABE ein neuer Abschnitt `## … Koordinator` steht. Kommt Post, arbeitest du sie ab und gibst wieder ab; danach wartest du erneut. Kommt 3 h nichts, darfst du enden.

## REFERENZ-ATLAS (bindend seit 08.11. 21:30)
`REFERENZ-ATLAS.md` in koordination legt fünf Domänen neben die Architektur der Besten: LOD (Nanite, ≤ 1 px), CPU-Takt (GPU-Wahl je Instanz, Haar/Aaltonen), Pipeline (Programm-Katalog, UE PSO-Precache), Körper (EIN Leib-Raum, SMPL) und Verkehr (Raum-Zeit-Reservierung, Dresner & Stone). Je Domäne gibt er Code mit Datei:Zeile, die Lücke und EINEN Schnitt an. Wer an einer dieser Domänen arbeitet, liest zuerst seinen Abschnitt und übernimmt den Brief-Baustein (f) wörtlich. Ein Schnitt, der davon abweicht, nennt im Commit den Grund.

## DRITTER PROBE-LÄUFER (seit 09.11. 13:20)
`gtx1050-desktop` (GTX 1050, i7-950 von 2009) fährt die Proben. Bilder (`bild:<ort>`) und Gates ohne Zeit-Urteil sind dort gültig. **Ein Gate mit Zeit-Urteil (ms, Takt, Ankunft: geh-zerlegung, ankunft, takt …) zählt von diesem Läufer NICHT.** Sein Haupt-Faden liegt 3- bis 8-mal über dem Budget, egal welcher Code läuft. Lies in deinem Probe-Bericht die Zeile `Läufer`. Mit `zeit:gate:` fährt dein Zeit-Gate nie auf diesem Läufer. Steht dort gtx1050-desktop und ist dein Gate eine Zeit-Linse, miss die Zeit im eigenen ABAB oder warte auf die Rufart `zeit:<gate>`, die nur auf OMEN und Radeon läuft. Ich melde sie hier, sobald sie in main ist.

## 09.11. 19:40 Koordinator — WIEDERANLAUF (Konto 10), die Notbremse ist aufgehoben
Die Arbeit läuft wieder. Der STOPP vom 17:48 gilt nicht mehr.
- **GitHub Actions hatte um 19:20 einen großen Ausfall** (githubstatus.com: Actions major_outage). Solange er dauert, laufen weder Puls noch `[gpu-probe: …]`. Ein Lauf endet dann als „failure“ mit 0 Jobs, und das ist kein Urteil über deinen Code. Prüfe den Stand mit `curl -s https://www.githubstatus.com/api/v2/summary.json`. Arbeite bis dahin am Code und am headless-Beweis weiter. Nach dem Ausfall setzt du die Probe mit einem neuen Kopf-Commit, der den Tag trägt.
- **Keine WIP-Nachricht mit Siegel-Wort**, auch nicht als Wortteil. w25-gpu-wahl fiel in z350 an „fertig“ in einer alten WIP-Nachricht. Der Zug prüft JEDEN Commit des Zweigs.
- **Neu: ein Bau-Schloss im Zug** (`zug.cjs bau`). Den Zug fährt nur der Koordinator.
