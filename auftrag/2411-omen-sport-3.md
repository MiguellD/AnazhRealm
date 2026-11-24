# Auftrag OMEN (GTX 1060) — sport-regeln 3 (Heilung), 24.11. 12:05, Koordinator

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

**BEFUND:** `sport-regeln` 998254beb8c387ef090f8e1f2e541970696a6c31 — GPU-Probe GRÜN, Code-Check 20 von 21 grün, EIN Job ROT und zwar
deterministisch (Versuch 4 Job 138364956747 und Versuch 5 Job 138388472155, dieselbe Zeile): „voll 11/18 · Die Kreatur-Linse Teil 1“ →
`❌ SELBST-TEST ROT — 1 Probe(n) im Grund verletzt`, Probe `bewohner`:
„Stadt: Wege 4–12 …, 1 Steckenbleiber (pfarrhaus #723323 um 18.80 Uhr bei 662.1/426.8 → 661.2/425.3 (1.8 m) · 1 Leiber um ihn,
Wahl -0.00/0.07, ohne Weg, Fahrbahn false, Wagen limousine steht 55.7 m v 0.0 leibS 0)“.
Dieselbe Probe ist an main und an den anderen Macher-Köpfen desselben Stands grün — der Täter liegt im Beitrag des Zweigs (der Sport zieht
Bewohner als Spieler und Zuschauer; geprüft ist diese Ursache NICHT, nur naheliegend).

**AUFTRAG (NACH ort-ausstattung 2, VOR scherbe-liegt — vier Sport-Sprossen hängen daran):**
1. `git fetch origin main sport-regeln`, `git merge origin/main` in `sport-regeln` (Merge-Commit).
2. Den Täter LESEN, nicht raten: `node scripts/diag-kreatur-leben.cjs --proben bewohner` (oder der Ruf des Jobs) am Kopf — vorher ROT an derselben
   Zeile. Wer gibt dem Bewohner des Pfarrhauses um 18,8 Uhr ein Ziel ohne Weg? Der Schnitt gehört an den EINEN Ort, an dem der Sport ein Ziel
   vergibt (kein Pflaster in der Linse, kein Ausschluss des Pfarrhauses, kein gelockertes Soll).
3. Pflicht vor dem Push, nur CPU, alle GRÜN: die Probe `bewohner` und der Selbsttest der Kreatur-Linse Teil 1 · `npm run check:statik` ·
   `format:check` · `lint` · `stamm-umzug --nach-karte` · gate:betriebsgesetz · probe-tag · Merge-Probe.
4. Betreff „Vorprüfung sport-regeln 3 (auf main <kopf8>): … [gpu-probe: wie am Kopf 998254be] [ci voll]“, EIN Push, EIN Bericht mit dem neuen
   Kopf (40 Zeichen), der Ursache in einem Satz mit Datei:Zeile und dem exit der Merge-Probe. Der Stempel-Satz liegt bei mir.

Findet sich die Ursache in 30 min nicht: stopp, Bericht mit dem, was gelesen ist — kein Blindflug.
