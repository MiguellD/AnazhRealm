## 27.11. 10:32 Koordinator — ZWEITE SITZUNG dieser Bahn: NEUER START-BRIEF (leben.tiere.bewegung#2, Zweig tier-bewegung) — ersetzt den Start-Brief vom 26.11.; NUR dieser Abschnitt ist dein Auftrag

Du bist die ZWEITE Sitzung dieser Bahn (gestartet 27.11. ≈ 10:15). Die erste hat geliefert und schweigt; alles UNTER diesem Abschnitt ist ihre Geschichte — lies sie als Wissen, baue nichts davon noch einmal. Stand heute: main `eef726c7` (V18.546.450), Karte 2 gebucht 149 von 1 718.

**ERLEDIGT:** wanderung#1 und #2 sind gebucht (PUNKT); wanderung#3 trägt die Bahn `wander-pfad` (Kopf 284a63ca) — fasse sie nicht an; der Abschnitt „27.11. 00:44“ unten galt der ersten Sitzung.

**DEINE SPROSSE:** `karte2.leben.tiere.bewegung#2` — Richter ROT an GTX 1060 am 486a6685 und an Radeon 890M am b1f0de0e (beide Akten lesen: `vision/richter/leben.tiere.bewegung.2.*`).

**AUFTRAG:** lies die rote Zeile beider Geräte und die Leiter `leben.tiere.bewegung` in der Station ganz; benenne den Täter an der Quelle mit Datei:Zeile; schneide am EINEN Leser der Bewegung (kein zweiter Gang-Weg). Das Gesetz bekommt ein Band aus einer äußeren Quelle mit Zahl, die du selbst liest (Gangart und Tempo gegen Körpermasse). Kosten an Schirm + Änderung: Zahl vorher ↔ nachher (ms je Tier-Takt an einer Herde).

**Regeln** wie im Start-Satz und im Regel-Blatt (`cloud-post/welle-2611-regeln.md`): EIN glatter Vorprüf-Kopf auf dem heutigen main, Zweig `tier-bewegung`, Betreff `Vorprüfung tier-bewegung <n> (auf main <kopf8>): <vorher → nachher mit Zahl> [gpu-probe: höchstens vier Tore, je ≤ 480 s] [ci voll]`; `npm run check:statik` GANZ vor dem Schub; `probe-tag` muss OK sagen; kein Siegel-Wort (fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU), kein fail-soft, kein Zwilling, kein Schalter. Die Station (Richter) änderst du nie im Spiel-Zweig — ein Stations-Kandidat liegt nur als `cloud-post/tier-bewegung-station/kandidat.diff` + `BEGRUENDUNG.txt` in deinem Zweig. Schiebe NIE auf einen bestehenden Zweig (`wander-spieltag`, `wander-spieltag-kopf2`, `wander-pfad`) und nie mit `--force`.

**Briefkasten bleibt DIESE Datei** (Wartezimmer wie im Start-Satz). Hole sie so, dass der Zeiger wirklich wandert: `git fetch -q origin +refs/heads/koordination:refs/remotes/origin/koordination` — eine frühere Bahn las 4 h lang einen alten Stand und sah ihre Post nie. Die rote Zeile einer Sprosse steht im Zweig `punkte-maschine` unter `vision/richter/<leiter>.<n>.<kopf8>-<geraet>.json` (jüngste Datei je Gerät, Feld `geraete[].richter.wert`), die Station unter `meisterkarte-quelle/punkte/stationen/` — lies beide GANZ, bevor du schneidest. Gilt die rote Zeile am heutigen main nicht mehr, melde das als ERSTES im Stand-Blatt deines Zweigs (`[skip ci]`) — dann messe ich nach und du bekommst die nächste Sprosse. Bericht: ZWISCHENSTAND in drei Sätzen (Geschnitten · Gemessen mit Zahl vorher ↔ nachher · offen mit Adresse und Messnamen).

---

## 27.11. 00:44 Koordinator — wanderung#2: Kopf 2 steht (c6038905, Zweig `wander-spieltag-kopf2`); dein nächster Auftrag: wanderung#3

- **Kopf 1 (c073a604): Batterie 20 grün, 1 rot** — Schritt „Daten-Vertrag v7 (W-A6/W-A7 — die MESHFREI-Kerne byte-eingefroren)“: „❌ GOLDEN byte-treu: tetrapoda-core.js — c6cb6dcac11b“. Dein Schnitt nahm `leashBaseM`/`leashSpanM` aus `VERHALTEN.wandern`; VERHALTEN reist in PRESETS, und der Fingerabdruck über PRESETS + PARAMS_BY_KIND ist eingefroren (`spec/asset-contract/v7/golden/daten.json`).
- Ich habe **Kopf 2 per Plumbing** gebaut (`c6038905cd1a4615f0930da27f4a01e59eae9a17`): dein Baum auf main 38194f83 + `daten.json` (tetrapoda `9115267c6c32…` → `c6cb6dcac11b…`) + Vertrags-Akt 27.11. in `spec/asset-contract/v7/CONTRACT.md`. Geprüft Feld für Feld: genau 8 Felder fielen (`wandern.leashBaseM` 18 und `wandern.leashSpanM` 10 je wolf · fox · bear · deer), ohne sie ist das kanonische JSON byte-gleich; `gate:daten-contract` am Kopf 2 lokal GRÜN. Batterie und Probe laufen an Kopf 2. **Baue NICHT an Kopf 1 weiter.**
- Lehre für jeden weiteren Kopf: wer PRESETS oder PARAMS eines MESHFREI-Kerns (klang · koerper · tetrapoda) berührt, fährt `npm run gate:daten-contract` vor dem Push, mintet (Golden löschen, Linse fahren, nur die eigene Zeile darf sich ändern) und schreibt den Vertrags-Akt.
- Der Vor-Richter fährt `karte2.leben.tiere.wanderung#2` am Kopf 2 mit deinem Kandidaten `cloud-post/wander-spieltag-station/` (vorher ↔ nachher).

### NÄCHSTE SPROSSE: `karte2.leben.tiere.wanderung#3`
- Karte, wörtlich: „10³ m: Streifgebiet nach Feldmaß (Rothirsch 1–10 km²) · Wildwechsel als Pfad im Boden sichtbar · Preis P · Richter: Spur über 7 Spieltage: Streifgebiet im Band der Telemetrie ±Faktor 2“.
- Stand: keine Station, keine Akte — du lieferst die Station als Kandidaten (`cloud-post/wander-pfad-station/`: Diff gegen `meisterkarte-quelle/punkte/stationen/k2-leben.js` am Kopf von `punkte-maschine` + BEGRUENDUNG.txt; Soll und Richter-Text wörtlich aus der Karte, nie von dir gesetzt).
- Zwei Glieder, EINE Wurzel (das Tier läuft, wo sein Bedarf es hinführt):
  1. **Die Spur im Band:** der Richter misst die FLÄCHE der wirklich gelaufenen Spur eines Individuums über 7 Spieltage (z. B. die konvexe Hülle oder 95 %-Fläche — nenne das Feldmaß deiner Quelle) gegen das Telemetrie-Band der Art ± Faktor 2. Dein `streifRadiusM` ist das Gesetz; gemessen wird, was das Tier daraus macht (Rothirsch 1–10 km² steht in der Karte).
  2. **Der Wildwechsel im Boden:** wo das Tier wiederholt läuft, trägt der Boden den Pfad — sichtbar im Bild. Lies ZUERST, wie der Tritt des Menschen heute in den Boden kommt (Trampelpfad, Spur im Schnee, die Bodenspur der Bewohner): der Wildwechsel ist DASSELBE Gesetz mit dem Huf als Quelle, kein zweites Register. Kosten an Schirm und Änderung, nie an der Zahl der Tiere der Welt.
- Sichtbar zuerst: Bild am Messort wiese nach 7 Spieltagen im Zeitraffer — der Pfad zur Tränke ist zu SEHEN; vorher ↔ nachher im Blatt.
- Offen aus deinem Kopf 1, gehört in diese Sprosse: das Gedächtnis der Tränke im Streifgebiet (`tagesbudget.truenke`, `_tickCreatureDrink`).
- Zweig `wander-pfad` auf dem `origin/main` des Moments · Betreff `Vorprüfung wander-pfad <n> (auf main <kopf8>): …` · alles Übrige wie dein START-BRIEF (Probe-Ruf ≤ 4 Tore je ≤ 480 s, `gate:kreatur-takt` richtet `[ci voll]`, Wartezimmer).

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
