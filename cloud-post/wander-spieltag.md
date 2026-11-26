## 26.11. 19:48 Koordinator — START-BRIEF (Welle 27.11.; dieser Abschnitt ist dein Auftrag, lies ihn GANZ)

## 27.11. 00:11 — GPU-PROBE c073a604 auf omen-gtx1060: GRÜN in 1117 s (gate:pruefbuehne-licht GRÜN 55 s auf omen-gtx1060 · gate:weltbild-frost:echt GRÜN 143 s auf omen-gtx1060 · bild:wiese@0.5 GRÜN 46 s auf omen-gtx1060 · gate:webgl-probe GRÜN 45 s auf omen-gtx1060) → probe-post/wander-spieltag/c073a604.md

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

# Sitzung: „Das Tier streift einen Spieltag lang“ (wanderung#2)
- Sprosse: `karte2.leben.tiere.wanderung#2` · Zweig `wander-spieltag` (Basis: heutiges `origin/main`, Code-Stand 4a188bf2) · Wartezimmer `cloud-post/wander-spieltag.md` in koordination · Regel-Blatt `cloud-post/welle-2611-regeln.md`.
- Arbeite nach IPERKA (`.claude/agents/champion.md`); lade `.claude/skills/anazh-lehren/SKILL.md` vor Kern- oder Stamm-Code.

## DIE ROTE ZEILE (Station, Kopf 99649186, GTX 1060, Runde 39, 26.11.) — wörtlich
„S2 ausdehnungM 12,927 m gegen Soll ≥ 100 m ✗ · spieltage 0,427 Spieltage gegen Soll ≥ 1 Spieltage ✗ · Täter: tetrapoda-core.js wandern.leashBaseM (die Leine um den Anker) / stamm/daten.js FAUNA_MAX_AGE_MS“

Soll wörtlich (Zweig `punkte-maschine`, stationen/k2-leben.js:3562): „Streifgebiet eines Individuums über 1 Spieltag“ — `ausdehnungM` ≥ 100 m (Umfang „10² m“) und `spieltage` ≥ 1. Messweg (k2-leben.js:3455–3491, Lauf `{ tage: 1, dt: 0.05, uhrJe: 1200, msDeckel: 20000 }` :3541): EIN Tier wird gesetzt, je Takt `takt(1, dt)`, die Uhr läuft mit; die Schleife endet, wenn der Tag voll ist, 20 s Wanduhr verstreichen ODER das Tier aus `s.creatures` fällt. `ausdehnungM` = größter Abstand der Bahn vom Setz-Ort.

## DER TÄTER (gelesen am main 4a188bf2) — zwei Glieder, EIN Gesetz des Lebens am Ort
- Die Leine: `tetrapoda-core.js:226` `leashBaseM: 18` (± `leashSpanM` 10, × bodySize), gelesen in `stamm/kreatur-verhalten.js:600` `leashM = (K.leashBaseM + K.leashSpanM·(2·mut−1))·bs`; jenseits zieht `anchorPull` heim → 12,9 m.
- Die Lebensdauer: die Zeile wanderte — `FAUNA_MAX_AGE_MS` steht am main in keiner *.js mehr (git grep leer); das Gesetz ist `leben-core.js:199` `lebensdauerS(M) = refS·(M∞/refKg)^lebenExp` (Selbsttest :74 „lebenWolf lebensdauerS(64) (Soll 2100)“ = 35 min). Die Station liest noch `A.FAUNA_MAX_AGE_MS` (k2-leben.js:3491, :2608) — für `lebensdauerS` ist das NaN; das ist Stations-Sache (Kandidat), nicht dein Spiel-Schnitt.
- ZUERST die Täter-Zahl (≤ 15 min, headless): endet die Schleife bei 0,427 Tagen am Tod des Tiers (`lebt` false), am `msDeckel` 20 s oder an etwas Drittem? Nur der Tod ist Spiel; der Deckel ist Station — dann Kandidat, nicht Spiel.

## IPERKA — das Band
Das Streifgebiet (home range) und die Tagesstrecke der Arten, die das Spiel setzt (Reh/Hirsch, Wolf, Fuchs, Bär), nach Körpermasse — Literatur mit Zahl (z. B. Allometrie home range ∝ M^~1); dazu die Lebensdauer wilder Säuger je Masse. Die Leine wird eine Funktion von Masse und Art aus diesem Band, keine neue Zahl 100.

## DER SCHNITT (an EINER Wurzel)
- Die Leine ist das Streifgebiet der Art: `leashBaseM` fällt als freie Zahl; die Reichweite kommt aus dem EINEN Gesetz des Lebens (leben-core, neben `lebensdauerS`) und wird an der einen Stelle `kreatur-verhalten.js:600` gelesen. Kein Zwilling in der Station, kein Schalter.
- Lebt das Tier kürzer als einen Spieltag, weil Spielzeit und Lebenszeit dieselbe Uhr sind: entscheide an der Quelle (Spieltag gegen `refS`), mit Zahl im Blatt — nie ein stilles Hochsetzen.
- Bricht ein Glied der Kreatur-Linse (Revier, Herde, Jagd), zieht die Linse mit neuem Soll und Quelle um. Das Jagd-Gesetz fasst du nicht an (Regel-Blatt §4).

## ABGABE
- Beleg: der Messweg der Station headless am eigenen Kopf (dieselben Parameter), Zeile „ausdehnungM 12,927 → x · spieltage 0,427 → y“ im Rumpf; Station nicht gefahren: GPU → Vor-Richter. Braucht die Station einen Kandidaten (`FAUNA_MAX_AGE_MS` → `lebensdauerS`, Deckel), liegt er unter `cloud-post/wander-spieltag-station/`.
- Familie kreatur|tetrapoda|leben|tier ganz lokal (gate:kreatur-takt 2567 s nur lokal und `[ci voll]`).
- Probe-Ruf: `gate:pruefbuehne-licht` · `gate:weltbild-frost:echt` · `bild:wiese@0.5` — `probe-tag` entscheidet; höchstens vier.
- Ehrlich offen darf bleiben: wanderung#3 (7 Spieltage) und #6 (Spieljahr) — eigene Stationen.

## PFLICHT (Regel-Blatt `cloud-post/welle-2611-regeln.md` in koordination GANZ lesen — die Abschnitte 13:10 und 10:27 zählen; Karte 2 steht heute bei 130, nicht 119)
- Briefkasten: lies alle ~30 min und vor jedem Push `git fetch -q origin koordination && git show origin/koordination:cloud-post/wander-spieltag.md` und `…/alle.md` (oberster Abschnitt `## … Koordinator`). Vor dem ersten Schnitt einmal.
- Station: je beanspruchter Sprosse eine Zeile im Rumpf `karte2.…#n · GRÜN|ROT · <Wortlaut>`. Alle Stationen der Karte sind GPU-Stationen; in der Wolke stürzt der GPU-Prozess ab (kultur-aus-klima, 26.11.) → schreibe „Station nicht gefahren: GPU“ und daneben den Rumpf der Station headless (Null-Renderer) mit Zahl. Der Vor-Richter (GTX 1050) fährt sie am Vorprüf-Kopf, sein Urteil kommt in deinen Briefkasten (≤ 15 min). ROT dort = weiter schneiden, neuer Kopf. In den Betreff nur, was grün liest.
- Stations-Änderung NIE im Spiel-Zweig: Kandidat unter `cloud-post/wander-spieltag-station/` (Diff gegen `origin/punkte-maschine` + BEGRUENDUNG.txt), drei Wände: `node punkte.cjs liste` (Basis genau zwei ROT `gelaende.K2#1/#2` „Wand HAKEN“) · Leiter ≤ 60 s · Fächer im Kern behält eine Stichprobe durch den Leser des SPIELS. Du änderst NIE ein Soll und nie den Richter-Text; hältst du ein Soll für falsch, steht es mit Quelle im Blatt — ich entscheide.
- IPERKA: eine äußere Quelle mit Zahl wird das Band des Gesetzes, zitiert im Kern in EINER Zeile (Autor, Jahr, Zahl) und im Commit-Rumpf; nie ein kopiertes Asset; Suchen ohne Projekt- und Personennamen.
- Schnitt: EINE Wurzel, kein Flag, kein Zwilling, kein stiller Rückfall; Kosten an Schirm und Änderung, nie an Weltgröße. Keine Konstante an der Zeile `AnazhRealm.VERSION` (stamm/dirigent-kern.js). Kein Feld am Spiel, das eine Siedlung überlebt. Fremde Zeilen nicht umformatieren.
- Linse (Gebot 10): bestehende Familie, vorher ROT am Täter, Selbsttest mit gepflanztem Täter; Selbsttest-Zeilen nennen die Mutante mit „→ ROT“/„ist ROT“ oder ✅, nie ein bloßes „ROT“.
- Vor dem Push, alles GRÜN, beim Namen im Blatt: `npm run check:statik` GANZ (≈ 6 min; `npm run check` bleibt lokal verboten) · `node scripts/stamm-umzug.cjs --nach-karte` nach jeder neuen Stamm-Methode · `npm run format:check` · `npm run lint` · jede Linse der Familie aus `.github/workflows/check.yml` (`grep -i` nach dem Familien-Wort) GANZ, ohne `--nur-…` · ein Pfad aus einem anderen Zweig in `cloud-post/…` trägt im SELBEN Satz „Zweig `punkte-maschine`“.
- Kopf: `git fetch origin main` · `git merge-tree --write-tree origin/main HEAD` Exit 0 (bei Konflikt `git merge origin/main`, beide Seiten ganz) · dann EIN glatter Commit auf dem heutigen `origin/main` (`git reset --soft origin/main && git commit`) · Betreff GENAU `Vorprüfung wander-spieltag <n> (auf main <kopf8>): <vorher → nachher mit Zahl> [gpu-probe: …] [ci voll]` · keine Versions-Stufe · kein PR.
- Probe-Ruf: Pflicht, sobald der Diff `stamm/`, `worlds/`, `index.html` oder eine `*.js` der Wurzel berührt; höchstens VIER Proben, jedes Tor ≤ 480 s Cloud-Zeit (`spec/ci/ci-zeiten.json`; zu lang z. B. gate:kreatur-takt 2567 s, gate:fahr-leben 982 s, gate:settlement 570 s — die richtet `[ci voll]`), mindestens ein Tor neben gate:webgl-probe; `sh artifacts/profiband/werkzeug/zug.sh probe-tag wander-spieltag@<sha>` muss „PROBE-TAG OK“ sagen; vorher `probeUrteil` (`scripts/lib/urteil-zeile.cjs`, wie `.github/workflows/gpu-probe.yml` ihn ruft) über das Log jedes lokal gefahrenen Tors → GRÜN mit 0 roten Zeilen. Das Urteil steht in `probe-post/wander-spieltag/<sha8>.md` (koordination); SIEH das Bild selbst an.
- Prozesse: beende nur eigene PIDs, nie chrome.exe/node.exe nach Muster.
- KEIN Siegel-Wort irgendwo (Betreff, Rumpf, WIP, Blatt): fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU.
- Stand-Blatt `cloud-post/wander-spieltag.md` in DEINEM Zweig, früh geschoben (nach der Täter-Zahl), WIP-Commits mit `[skip ci]`.

## WARTEZIMMER (nach dem Vorprüf-Kopf NICHT enden)
Bis zu 4 h: je Schritt ≤ 9 min (`sleep 270`, zweimal), dann `git fetch -q origin koordination main` und prüfe (a) den Briefkasten auf einen neuen Abschnitt `## … Koordinator`, (b) `probe-post/wander-spieltag/`, (c) ob der Stempel `w28-wander-spieltag` in `origin/main` liegt. Post abarbeiten (neuer glatter Kopf n+1), dann weiter warten; zwischen den Schritten die nächste rote Sprosse derselben Leiter beginnen. Ende nur bei „GELANDET“ oder „ENDE“ im Briefkasten oder nach 4 h ohne Post — vorher der letzte Stand im Blatt: Geschnitten · Gemessen (vorher → nachher) · Offen (Grund, Messname, Adresse) · Kopf (40 Zeichen) · beanspruchte Sprossen (voller Name) · Karte 2 gebucht <n> von 1 718 · Status ZWISCHENSTAND.
