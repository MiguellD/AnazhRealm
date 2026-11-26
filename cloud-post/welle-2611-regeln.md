# Regeln der Cloud-Welle vom 26.11. — Teil jedes Start-Briefs, GANZ lesen, bevor du etwas anfasst

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Arbeite nach IPERKA (`.claude/agents/champion.md`); lade den Skill
`.claude/skills/anazh-lehren/SKILL.md` vor Kern- oder Stamm-Code. Der Koordinator (Fable, Laptop mit Radeon) liest dich NUR über git.

## 1 Informieren (vor dem ersten Schnitt)
- Die Station jeder deiner Sprossen GANZ: `git fetch origin punkte-maschine` · `git grep -n "<leiter>" origin/punkte-maschine --
  vision/richter-tafel.json meisterkarte-quelle/punkte/stationen/` — Richter wörtlich, Umfang, Zeuge, Leser, Preis-Klasse. Die jüngste
  Akte je Gerät liegt unter `vision/richter/<leiter>.<n>.<sha8>-<geraet>.json`.
- Den Befund des Lesers zu deiner Sprosse: `git show origin/leser-2611:bericht/2611-stationen/halter.json` (Schlüssel = Sprosse, `warum`
  nennt Zahl und Täter mit Datei:Zeile).
- Die Profis: eine äußere Quelle mit Zahl wird ein Band im Gesetz, zitiert (Autor, Jahr, Zahl) — nie ein kopiertes Asset.

## 2 Bauen
- TÄTER-ZAHL zuerst (≤ 15 min, EINE Zahl, in node oder headless), mit Datei:Zeile ins Stand-Blatt, BEVOR du schneidest.
- Schnitt an der EINEN Wurzel: kein Flag, kein Zwilling, kein Sonder-Pfad, kein stiller Rückfall. Die KLASSE fällt ganz — nennt dein Brief
  mehrere Sprossen, fallen sie aus EINEM Gesetz, nicht aus mehreren Pflastern. Kosten hängen an Schirm und Änderung, nie an der Weltgröße.
- Bleibe in den Funktionen deines Auftrags; formatiere fremde Zeilen nicht um (andere Bahnen schneiden in denselben Dateien).
- Linse (Gebot 10): in einer bestehenden Familie, vorher ROT am Täter, Selbsttest mit gepflanztem Täter, ≤ 3 min CI, benannter
  Konsum-Leser. Selbsttest-Zeilen nennen ihre Mutante mit „→ ROT“ / „ist ROT“ oder ✅ — nie ein bloßes „ROT“ (der Probe-Leser liest jede Zeile).
- Bricht dein Schnitt eine Invariante oder Linse des ALTEN Gesetzes (Playtest, Klang-Linse, Sicht-Arbeit, Satz-Wand …), ist das DEIN Rot:
  die Linse zieht mit dem Gesetz um (neues Soll mit Quelle), sie wird nie stumm gestellt und nie gelöscht.
- Stations-Änderungen NIE im Spiel-Zweig: als Kandidat im eigenen Zweig unter `cloud-post/<zweig>-station/` (Diff gegen
  `origin/punkte-maschine` + BEGRUENDUNG.txt). Jeder Kandidat hält drei Wände: `node punkte.cjs liste` (Basis genau zwei ROT
  `gelaende.K2#1/#2` „Wand HAKEN“, sonst nichts) · eine Leiter misst in ≤ 60 s · wer im Kern fächert (node, worker_threads), behält eine
  Stichprobe durch den Leser des SPIELS und der Zeuge verlangt Gleichheit an denselben Saaten.

## 3 GPU-Probe (du hast keine GPU — swiftshader taugt für Mechanik, nie für Bild oder Zeit)
- Der Ruf steht im Betreff des Vorprüf-Kopfs: `[gpu-probe: gate:<tor> … bild:<messort>@<uhr>]`. Er weckt die Radeon (Urteil in ≈ 8–15 min).
  Nur Tore mit Cloud-Zeit ≤ 480 s (`spec/ci/ci-zeiten.json`), längere richtet die Batterie `[ci voll]`; EIN zu langes Tor weist den ganzen Ruf ab.
- Welche Tore deine Dateien verlangen, sagt `sh artifacts/profiband/werkzeug/zug.sh probe-tag <zweig>@<sha>` — es muss OK antworten.
- Vor dem Kopf: `probeUrteil` (`scripts/lib/urteil-zeile.cjs`, so wie `.github/workflows/gpu-probe.yml` ihn ruft) über das Log des lokalen
  Laufs jedes genannten Tors → GRÜN mit 0 roten Zeilen.
- Das Ergebnis liegt in koordination: `probe-post/<zweig>/<sha8>.md` und die Bilder `probe-post/<zweig>/<sha8>-<ort>-<uhr>.png`. SIEH das
  Bild selbst an (Datei lesen) und urteile gegen dein Ziel — das Bild ist der Beweis, ein grünes Tor allein nicht. Verlange mit `bild:` die
  Pose, an der dein Schnitt sichtbar ist (Messorte: `spec/profiband/haushalt.json`).

## 4 Abgabe
- Zweig-Name und Basis wie im Brief. WIP-Commits mit `[skip ci]`. Dein Stand-Blatt liegt in DEINEM Zweig unter `cloud-post/<zweig>.md`
  und wird früh geschoben (nach der Täter-Zahl).
- Vor dem Vorprüf-Kopf: `npm run check:statik` (≈ 6 min CPU) · `git fetch origin main` · der Kopf ist EIN glatter Commit auf dem
  heutigen `origin/main` (`git reset --soft origin/main && git commit` nach dem Einmergen; ein Siegel-Wort irgendwo im Verlauf wirft den
  Stempel) · `probe-tag` OK.
- Betreff GENAU: `Vorprüfung <zweig> <n> (auf main <kopf8>): <ein Satz vorher → nachher mit Zahl> [gpu-probe: …] [ci voll]`.
- KEIN Siegel-Wort in Betreff oder Rumpf, auch nicht als Sach-Wort, auch nicht in WIP: fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU.
- Die Kreatur-Linse Teil 3 (jagdkreis) ist am main anfällig (Riss-Quote 0,43–0,47 gegen das Band 0,2–0,4; die Heilung `jagd-quote-2` baut
  die GTX 1050). Fasse das Jagd-Gesetz nicht an. Ist an deinem Kopf NUR dieser Schritt rot, steht das im Briefkasten — dann warten, nicht heilen.

## 5 Briefkasten
- Post des Koordinators an dich: `git fetch -q origin koordination && git show origin/koordination:cloud-post/<zweig>.md` (neueste Nachricht
  oben, Abschnitt `## <Uhrzeit> Koordinator`). Lies ihn alle ≈ 30 min und vor JEDEM Push. Rote Jobs deiner Batterie stehen dort mit Job und Zeile.
- Halte nicht an, um zu fragen: entscheide an der Quelle und nenne den Entscheid mit Zahl im Blatt. Was nur halb fällt, heißt halb, mit Prozent.
- Kein neuer Plan, keine neue Doktrin, kein Wellen-Name. Der einzige Scope ist die Meisterkarte 2.

## 6 Wartezimmer (nach der Abgabe NICHT enden)
- Nach dem Vorprüf-Kopf wartest du bis zu 4 Stunden: je Schritt höchstens 9 min (`sleep 270`, zweimal), dann `git fetch -q origin
  koordination main` und prüfe (a) den Briefkasten auf einen neuen Abschnitt `## … Koordinator`, (b) `probe-post/<zweig>/` auf das Urteil
  deines Kopfs, (c) ob dein Stempel `w28-<zweig>` in `origin/main` liegt.
- Post wird abgearbeitet (neuer glatter Kopf n+1, neuer Vorprüf-Betreff), danach wieder warten. Zwischen den Warte-Schritten ist Zeit für
  die nächste Sprosse deines Briefs — beginne sie, statt nur zu warten.
- Ende erst bei der Zeile „GELANDET“ oder „ENDE“ im Briefkasten oder nach 4 Stunden ohne neue Post. Vor dem Ende: letzter Stand im Blatt.

## 7 Letzter Stand im Blatt
Geschnitten · Gemessen (Zahl vorher → nachher) · Offen (Grund, Messname) · Kopf (40 Zeichen) · beanspruchte Sprossen (voller Name) ·
Karte 2 gebucht 119 von 1 718 · Status ZWISCHENSTAND.
