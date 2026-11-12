Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Arbeite nach `.claude/agents/champion.md`; lade den Skill `anazh-lehren` vor Stamm-, Kern- oder Linsen-Chirurgie.

DER RICHTER ist die Station der Punkte-Maschine: `git fetch origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine"`, dann `git show origin/punkte-maschine:meisterkarte-quelle/punkte/stationen/<gN>.js` (Eintrag mit kriterium + staffel deines Auftrags: befehl, env, urteil, pfad, quelle). Beweis = der befehl der Station headless im Baum DEINES Zweigs (LINSE_GPU=software, {PORT} 7700, {AUS} eine json-Datei, {BAUM} dein Baum) und ihr urteil(j, lauf) per `node -e` (require der Station aus einem Checkout von punkte-maschine) → GRÜN, mit Zahl vorher (main) → nachher. NIE die Linse weich machen. Misst die Station nicht das Gesetz ihres Staffel-Texts, schärfe sie in einem eigenen Zweig `<dein-zweig>-pm` von origin/punkte-maschine (Mutante in `proben`, `node meisterkarte-quelle/punkte/punkte.cjs selbsttest --ohne 3c` grün); eine pm-Station nennt nur Pfade, die am main existieren.

TAKT: Push ab dem ersten Schritt je Schritt „WIP <zweig>: … [skip ci]“ — die Sitzung kann jederzeit enden, was nicht gepusht ist, ist verloren. Die Abgabe ist EIN Commit „Abgabe <zweig>: …“ OHNE [skip ci], mit drei Sätzen: geschnitten (Datei:Zeile) · gemessen (Zahl der Station vorher → nachher) · ehrlich offen. Vor der Abgabe `git merge origin/main` frisch (Konflikte selbst lösen) und am Kopf GRÜN: `npm run check`, `npm run playtest:fast` und jede voll-Linse, deren Familie deine Dateien liest (Befehle in `.github/workflows/check.yml`). Berührst du den Render-Pfad (stamm/stoff-*, bild-*, koerper-*, dirigent-*), fahre die Post-Kette- und die Ego-Schatten-Linse auf swiftshader und suche „[ERROR] STOFF“. Auf Zweigen läuft nur der Puls der CI; warte nie auf die volle Batterie.

POST: Der Koordinator schreibt dir per git. Lies alle ~30 min und vor jedem Push: `git fetch -q origin koordination && git show origin/koordination:cloud-post/<zweig>.md` (neueste Nachricht oben) und handle danach.

WÄNDE (jeder Zug fiel schon daran):
- Die WACHSTUMS-WAND (seit main 20a01782, 10.11.; die Atom-Decke von `scripts/` ist gefallen): `scripts/` + `spec/` dürfen im Fenster des ZUGS höchstens halb so viele Code-Atome wachsen wie das Spiel (`stamm/`, Wurzel-`*.js`, `index.html`, `worlds/`). Dein Zweig druckt nur seinen Stand (`gate:betriebsgesetz`), geurteilt wird an der Summe des Zugs. Presse deshalb nichts mehr für eine Decke. Nenne im Abgabe-Rumpf die Zeile „Wachstum … Prüf +X / Spiel +Y“: ein Linsen-Zweig fährt mit Spiel-Zweigen im selben Zug (z357 fiel allein an Prüf +1672 / Spiel +1217). Die Datei-Decke von 4 000 Zeilen bleibt.
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

## 10.11. 23:10 Koordinator (Konto 11) — DER ZUG-DIENST und die BREITE
- **Die Zug-Maschine ist EIN versionierter Dienst** (koordination `zug/dienst/`, Einstieg `start.sh`): er sammelt alle 5 min die Zweige
  `w27-*` und `w28-*`, deren Kopf-Commit mit „Abgabe“ beginnt, deren Code-Check GRÜN ist und — sobald der Zweig das Spiel berührt — deren
  GPU-Probe GRÜN ist, bündelt höchstens vier konfliktfreie mit grüner Wand-Summe, fährt, urteilt und landet. Es gibt keine Hand-Fahrt mehr.
  Ein gefahrener Kopf fährt erst mit NEUEM Kopf wieder. Neue Arbeit heißt `w28-<name>`.
- **Die BREITE ist offen** (Schöpfer 10.11.: „Ja, Breite öffnen“): Gesetzbuch-Tiefe in den Kernen und Studios, je Auftrag EIN Kriterium der
  Staffel Breite (`BEFUND-GROSSES-BILD-2026-11-10.md` §5), mit einem KONSUM-LESER im Ego-Lauf (Probe in einer bestehenden Familie + Selbsttest
  + Mutante), bevor ein Punkt zählt. Den Stations-Eintrag liefert der Macher als eigenen Zweig `<zweig>-pm` von origin/punkte-maschine.
- **Datei-Besitz der Breite:** `fachwerk-core.js` und `stamm/siedlung-ort.js · siedlung-bauten.js · siedlung-satz.js` gehören
  `w28-stadt-grammatik`. Wer sie braucht, liest sie und schreibt seinen Wunsch nach `cloud-post/w28-stadt-grammatik.md`.
- **Was das Auge am 10.11. sah** (main 4e2df19b, „dorf 7 300“): ein Mauerring R 173 m, innen fast leer; Häuser als Einzelreihe an Erdwegen,
  Gras in der Gasse; 6 Rollen, 2 Kulturen; der Markt zwei Stände. Das ist der Ausgangspunkt, an dem jede Breite-Arbeit sich misst.

## 12.11. 10:52 Koordinator (Konto 12) — DIE VOLLE BATTERIE VOR DEM ZUG, und das Bild als Richter
- **Sechs von zehn Zügen dieser Nacht fielen rot, jedes Mal an einer voll-Linse, die der Macher nie gefahren hatte** (stadt-grammatik 6 Linsen, probe-urteil 2×, baum-programm Rausch-Gesetz, verkehr-graph Takt-Wand, mensch-samen MESHFREI). Die alte Regel „auf Zweigen nur der Puls" ist damit aufgehoben: **der Abgabe-Commit trägt neben der Probe-Marke `[ci voll]` im Betreff** — die volle Batterie richtet dann DEINEN Kopf, der Zug-Dienst nimmt ihn erst bei grünem Code-Check. Ein Rot dort heilst du selbst, bevor du „Abgabe" sagst; ein Zug ist kein Prüfstand.
- **Probe-Marken:** nur Bilder und kurze Tore — der Deckel einer Probe ist 480 s; ein ganzes Zeit-Tor (kreatur-takt, fahr-leben) reißt ihn. Zeit-Urteile nur als `zeit:gate:<kurzes tor>`. Eine Abgabe OHNE `[gpu-probe: …]` wird übersprungen und wartet ewig.
- **Urteils-Wache (in main seit z401):** eine gedruckte ROT/❌-Zeile bei Exit 0 ist ein Fehler. Erwartete Fänge einer Linse heißen GEFANGEN.
- **Wachstum** (Wort des Schöpfers 12.11.: „Wachstum mit Struktur und Übersicht sollte kein Problem sein"): eine Linse oder Tafel, die urteilt und ihren Leser hat, darf wachsen; was keinen Leser hat, fällt weiterhin.
- **Der Maßstab ist AAAA im BILD** (Schöpfer 12.11.: „Fokus Richtung AAAA"): jede Abgabe nennt das Bild-Paar vorher ↔ nachher an derselben Pose, vom Macher selbst angesehen, und sagt in EINEM Satz, was ein Art-Director daran noch als Amateur erkennt. Eine grüne Zahl ohne dieses Bild ist keine Abgabe.
