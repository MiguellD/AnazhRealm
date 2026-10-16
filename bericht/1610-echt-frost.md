# Bericht 1610 Echt-Gruppe §2 — die Frost-Wand auf der Karte (Zweig `frost-echt`, Auftrag `auftrag/1610-omen-echt-frost.md`)

**Status: ZWISCHENSTAND.**

## Urteil

**Die Frost-Wand ist auf der GTX grün und fährt im Job `echt`.**
- Vorher war sie ROT: B 0,57 % an der Ankunft und 3,41 % in der dritten Person; beide Schüsse zeigten den Ladeschirm.
- Nachher steht B bei 91,1 % und 85,7 %, und die Schüsse zeigen die Welt.
- swiftshader bleibt grün, `npm run check` ist grün, `scripts/` netto 0 Zeilen.

## Geschnitten (Zweig `frost-echt`, gemergt auf integ-probe 5df4c709; Kopf und CI siehe unten)

- **(a) Die Boot-Wartung.** Im `--echt`-Weg wartet die Boot-Schleife von `scripts/diag-weltbild-frost.cjs` auch auf `state._weltbildDa`,
  in derselben Zeile.
  - Bleibt das erste Weltbild aus, ist die Wand ROT beim Namen („die Welt steht mit ihrem ersten Weltbild …“).
  - Die Boot-Zeile nennt die Zeit, z. B. `"weltbild":"23.8 s"`.
- **Entscheid nach Messung: nur der `--echt`-Weg wartet.**
  - In JEDEM Weg kostete das Warten auf swiftshader 56 s: Boot +7 s → +63 s, das Weltbild kommt erst über `WELTBILD_DECKEL_MS`.
    Der Lauf wuchs von 122 s auf 165 s, und Gruppe 18 (Waage 6,2 min) läge über ihrem 7-min-Deckel.
  - Headless urteilt B das Rücklese-Bild der Welt-GPU. Der Ladeschirm ist DOM und kommt in dieses Bild nie hinein.
- **(b) Der Selbsttest meldet sich als Selbsttest.**
  - `scripts/lib/welt-boot.cjs` kennt `selbsttest(name)`. Ab dem Aufruf stehen `console.error` und `pageerror` der Seite laut als
    `[welt-boot] SELBSTTEST <name> …` im Log und nicht in der Sammlung der Welt-Fehler.
  - Die Frost-Wand ruft `selbsttest("T2 (der geweitete Mensch-Index)")` unmittelbar vor T2. Es gibt keinen Muster-Filter auf den
    Meldungstext; ein Absturz des Browsers zählt weiter.
- **(c) Die Ausnahme fällt.** `gate:weltbild-frost:echt` ist aus den `AUSNAHMEN` von `diag-ci-deckung` gestrichen, mit ihr der
  falsche Index-Satz.
  - Der Schritt „Frost-Wand auf der Karte“ fährt im Job `echt`, vor der GPU-Fehler-Linse.
  - Der Kopf-Kommentar des Jobs nennt ~100 s und die vier roten Schritte ohne Frost.
  - `ci-deckung` ist grün mit 1 Ausnahme (arch-feld, FRIST); die Ausnahme von perf-parity fiel mit K1.

## Gemessen (GTX 1060, CI=true, CI_KLASSE=gpu, LINSE_GPU=karte; Rohdaten `bericht/1610-echt-frost/`)

| Lauf | Kopf | Boot / Weltbild | Ankunft B | dritte Person B | Werkstatt · Ich · Hof | T2 | EXIT |
|---|---|---|---|---|---|---|---|
| vorher `echt-vorher.txt` | 826717ed | +9 s / — | **0,57 %** | **3,41 %** | 100 · 85 · 86 % | „kein Ziel“ | **1** |
| nachher `echt-nachher.txt` | 826717ed + Schnitt | +24 s / 23,8 s | 91,10 % | 85,70 % | 85 · 85 · 86 % | grün (364 Meldungen) | 0 |
| Endstand `frost-echt-ende.txt` | 826717ed + Schnitt (Endfassung) | +24 s / 24,1 s | 89,39 % | 85,42 % | 85 · 85 · 87 % | grün | 0 |

- **Bilder:**
  - `vorher-ankunft-a.png`: der Ladeschirm „Die Welt erwacht …“.
  - `nachher-ankunft-a.png`: die Genesis-Portale aus der Ego-Sicht.
  - `nachher-dritte-person-b.png`: der Spieler am Platz.
- **swiftshader (wie Gruppe 18):**
  - vorher 119 s, EXIT 0 (`linse-vorher.txt`);
  - mit Warten in jedem Weg 163 s, EXIT 0 (`linse-nachher.txt`);
  - Endstand 108 s, Boot +8 s, EXIT 0 (`frost-linse-ende.txt`).
- **Marker (b), Probe `p3/k1610f/marker-probe.cjs`:** eine `console.error` vor dem Marker, eine danach und ein Wurf danach.
  - Vorher (826717ed) zählt die Sammlung 3 Fehler der Welt (`marker-probe-vorher.txt`).
  - Nachher zählt sie 1, die echte Meldung vor dem Marker; die zwei Täter-Meldungen stehen als SELBSTTEST (`marker-probe.txt`).
- `npm run check`: EXIT 0 vor dem Merge (315 s, `p3/k1610f/check.txt`) und am gemergten Kopf d3dc06e8 (297 s, `p3/k1610f/check-merge.txt`).
- `diag-ci-deckung` mit Selbsttest: EXIT 0.

## Ehrlich offen

- **Die SELBSTTEST-Zeile kam in den drei Frost-Läufen nach dem Schnitt auf der GTX nicht vor.** r184 meldete die T2-Validierung dort
  nur als `uncapturederror`, ohne seine THREE-Konsolenzeile (offene Fehler-Bereiche 0). Am 16.10. kam sie einmal (Bericht
  `1610-frost-echt.md`). Der Weg ist durch die Probe belegt, nicht durch einen Lauf der Wand.
- Im Vorher-Lauf fand T2 keinen schmalen Mensch-Index („kein Ziel“), im Lauf vom 16.10. ~12:45 schon. Nach dem Schnitt ist T2 an
  jedem Lauf grün.

## Status ZWISCHENSTAND + Übergabe

- Zweig `frost-echt`, Kopf **d3dc06e8** (Merge von integ-probe 5df4c709, `[ci voll]`), gepusht; die Zweig-CI ist noch zu lesen. Den Merge macht der Koordinator nach der Zweig-CI.
- Der Job `echt` fährt die Wand erst nach dem Merge auf integ-probe; die Zweig-CI fährt nur die swiftshader-Form (Gruppe 18).
- §3 (die vier roten Schritte) steht in `bericht/1610-echt-vier.md`.
