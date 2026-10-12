# Bericht 1110-11 — Die Birke steht nie doppelt

1. **Geschnitten:** Die Blende maß je FRAGMENT, das Studio misst je INSTANZ. Jetzt messen Maske, Blattmaske, Karte und das
   Fenster der Instanz-Wahl vom Auge zum Ursprung der Instanz (Studio foundry-core `_iw = instanceMatrix[3].xz`).
2. **Gemessen:**
   - Wiese ABABABAB mit Takt, 8/8 GRÜN: gpu-bank −1,21 ms (Gier 0) und −1,67 ms (Gier −0,88), Frame p95 gleich.
   - Die Linse „Stufe ohne Bild" ist in main ROT (3/3 Boots, die Birke-L1 in 4,92 m beim Namen) und im Schnitt 0 in 7/7 Boots.
3. **Ehrlich offen:**
   - baum liegt bei 2,53 ms statt der erwarteten ~2,1. Die 2,1 ms waren A's Loch-Zustand.
   - Der CPU-Takt p95 steigt unter freiem Regler um 0,55 ms: Der Regler nimmt die frei gewordene GPU.
   - Die CPU-Mitgliedschaft behält im Rand M des Studios zwei Slots, gezeichnet wird davon nur die Stufe mit Bild.

Auftrag: `auftrag/1110-11-omen-doppel-birke.md`. Vorher gesichert: welle-m-e-torwurf WIP **1c2ceb4c** (gepusht).

- Branch **welle-m-birke** ab main **a0a05614** (per `git ls-remote`), Kopf siehe Schluss.
- GTX 1060, 1920 × 1080, Instrument `abab-i542` (omen-messfolge, Wiese-Folge unverändert).
- Rohdaten: `1110-11/` (`serie/` ABAB, Linse, Zerlegung und Bilder; `sitzung/` die Belege in EINER Sitzung; `waende/`).

## 1. Der Auslöser beim Namen

Keiner der drei Kandidaten (Cross-Fade-Rest, `_wahlHaelt` nach Boot-Rennen, Senke ohne Abschied) war es. Der Täter ist das
**Maß der Blende**.

- **Das Studio** (foundry-core.js Z. 628) misst die Dither-Blende je Instanz:
  `_iw = instanceMatrix[3].xz; _cd = length(cameraPosition.xz − _iw)`. Der ganze Baum blendet als eins. Die CPU-Mitgliedschaft
  (Mitte ± M) „überdeckt" diese exakte Blende nur (phytogenesis `updateTreeLOD`).
- **Der Stamm** maß je Fragment (`_lodCrossfadeMaskNode`: `length(uLodAuge.xz − positionWorld.xz)`). Sein Kommentar nannte das
  „per-Instanz korrekt". Das Fenster der Instanz-Wahl (W7, `_instanzFenster`) rechnete dafür mit der Weite der Gestalt
  (`_instanzWeite` + Wind-Saum).
- **Die Folge an der Wiese:** Die Birke steht 4,92 m vor dem Auge, ihre Krone reicht 10,06 m weit (`_naturKrone`).
  - Ihre fernen Äste liegen im Fade-Fenster [8, 12] und dahinter. Dort dithert ihr L0-Laub aus, also trug ihre L1 diese Äste,
    und W7 zeichnete die L1 ganz.
  - Beleg in EINER Sitzung auf main (`sitzung/b1-*`): Ohne den Band-Partner fällt die Bank im Kronen-Blick um 2,68 ms
    (13,77 → 11,09). 2,47 % des Bildes ändern sich, alles in der fernen Krone hinter dem Stamm (`b1-diff.png`). Der „schnelle"
    A-Zustand aus 1110-10 war also ein Loch.
- **Warum A 1/3 und B 7/7:** Die Band-Mitgliedschaft des Studios beginnt bei D0 − FADE0 − M = 12 − 4 − 3,4 = 4,6
  (Wahrnehmungs-Distanz). Die Birke liegt mit 4,92 m × min(12/15,19, 1) × Perf bei 4,66–4,85. Der Perf-Streck des Reglers
  (1,19–1,25) entscheidet, ob sie über die Schwelle kommt, und unter B's Last liegt er höher.

## 2. Der Schnitt (welle-m-birke)

| Stelle | vorher | jetzt |
|---|---|---|
| `_instanzMitteNode` (neu) | – | Welt-XZ des Instanz-Ursprungs als Vertex-Varying: `modelWorldMatrix × Spalte 3 der Instanz-Matrix`, ohne Instanzen der Objekt-Ursprung |
| Haken `_createInstanceMatrixNode` | nannte den Puffer | legt je Bau die Instanz-Matrix am Builder ab. r184 baut den InstancedMeshNode in `setupPosition` je Bau neu, auch im Schattenpass, vor jedem Fragment-Knoten |
| 3D-Stufen-Maske | `positionWorld` je Fragment | Ursprung der Instanz |
| Grammatik-Blattmaske | `positionWorld` je Vertex | Ursprung der Instanz |
| Karten-Maske | `√|h|²` zum Fragment des Quads | `_dA`, die schon gerechnete Anker-Distanz (Studio `vCD` aus `instanceMatrix[3]`) |
| W7 `_instanzFenster` | d ± (Weite × Norm + Schräglage + Wind-Saum + Halt) | d ± Halt; `_instanzWeite` fällt |

- Die Basisklasse `Node` exportiert `window.THREE` nicht; sie kommt über die Oberklasse des `InstanceNode` (Typ „Node" geprüft).
  Eine Vendor-Drift meldet sich laut (`log … ERROR`).
- **Benannt, nicht geschnitten:** Der `try/catch` in `_lodCrossfadeMaskNode` fängt jeden Fehler und gibt `null` zurück; der
  Stoff steht dann still ohne Maske. In dieser Sitzung zeigte er es einmal (der erste Bau ohne `THREE.Node`). Das ist ein altes
  fail-soft, das die nächste Welle trifft.

## 3. Die Linse (Familie Stufen-Wahrheit, `gate:foundry-crossfade`)

- **(8) STUFE OHNE BILD**, rein in Node: `_instanzFenster` aus dem Stamm über eine Birke (Sichthöhe 15,19 m, Skala 0,928) und
  eine Eiche (18,64 m, 1,147), Perf 1,21, 0–60 m in 0,1 m, je Stufe (L0 · L1 · einzige Nah-Stufe · Karte).
  - Gezählt werden Stufen, die gezeichnet werden, obwohl das Gesetz (`lodCrossfadeMask`) an der Instanz-Distanz nichts behält
    („doppelt außerhalb des Fade-Fensters"), und umgekehrt Löcher. Toleranz ±1 cm, die Bisektions-Kante von `_blendeKanten`.
  - Jetzt: **4800 Proben, 0 ohne Bild, 0 Löcher.**
- **MASS DER BLENDE**, statisch: Maske, Blattmaske, Karte und Fenster messen die Instanz; der Haken legt die Matrix ab.
- **Selbsttest GRÜN:**
  - Die Weite der Gestalt kehrt ins Fenster zurück (Krone 10 m): Die Linse nennt die L1 der Birke unter 8 m (790 Proben ohne Bild).
  - Je ein Bruch für Maske zum Fragment, Karte zum Quad und Haken ohne Matrix: jeder wird genannt.
- **Live** (`sitzung/stufe-ohne-bild.js`, jeder Boot an der Wiese eingeschwungen, über jede lebende Instanz jeder Gruppe mit Maske):

| Boot | Seite | Instanzen | ohne Bild | beim Namen |
|---|---|---|---|---|
| l2A · l4A · l6A | main a0a05614 | 721 · 806 · 807 | **43 · 40 · 37** | `f:birke` L1 in 4,92 m (alle drei), dazu Strauch und Tanne L1/Nah-Stufe in 21–32 m |
| l1B · l3B · l5B · l7B · l8B · l9B · l10B | Schnitt | 746 · 746 · 882 · 927 · 1063 · 882 · 883 | **0 in 7/7** | – |

## 4. Beweis: Wiese ABABABAB mit Takt (`serie/auswertung.md`)

| Größe | A main a0a05614 | B Schnitt | B − A |
|---|---|---|---|
| gpu-bank Gier 0 (ms) | 13,22 · 13,11 · 13,17 · 13,28 → **13,20** | 12,35 · 11,63 · 11,60 · 12,42 → **11,99** | **−1,21** |
| gpu-bank Gier −0,88 (ms) | 12,13 · 12,18 · 12,19 · 12,07 → **12,16** | 10,46 · 10,51 · 10,33 · 10,58 → **10,48** | **−1,67** |
| Takt der Bänke (MHz, Median) | 1711 / 1717 | 1705 / 1711 | −6 (0,4 %) |
| Frame p50 / p95 frei und voll | 16,6 / 16,8 | 16,6 / 16,8 | 0 |
| CPU-Takt p95 frei / voll | 5,05 / 5,55 | 5,60 / 5,75 | +0,55 / +0,20 |
| Befehle · Dreiecke (Lauf voll) | 81 · 514k | 77,5 · 471k | −3,5 · −43k |
| VRAM (Band) | 112,50 MB | 111,95 MB | −0,55 |

- 8 von 8 Boots im ersten Versuch GRÜN, Seiten-Wache sha256 je Boot (A 3960d575e001be8a, B f842fa19bae52606).
- **Zerlegung im selben Blick** (Linsen-Boots l2A gegen l1B): baum 3,40 → **2,53 ms**, Gesamt 13,13 → 11,99 ms, boden 1,08 → 1,22
  (der Schnitt berührt den Boden nicht; zwischen Boots streut boden 0,89–1,22 ms, 1110-10).
  - Die Erwartung ~2,1 ms war A's Loch-Zustand: Die L0 der Birke verwarf ihre fernen Fragmente.
  - Jetzt zeichnet die L0 die ganze Krone, ohne L1. 2,53 ms ist der Preis des vollen Bilds.
- **CPU-Takt p95 frei +0,55 ms:** Unter freiem Regler nimmt die Welt die frei gewordene GPU. Zwei B-Boots fahren frei mit
  460k statt 384k Dreiecken (w4B, w6B). Voll liegt +0,20 im Streuen der Wiese.

## 5. Das Bild der Birke auf 5 m (`serie/`)

- `l2A-birke-auge.png` gegen `l1B-birke-auge.png`: Augenhöhe, Blick in die Krone der Birke 4,92 m vor dem Auge. Beide zeigen die
  Krone ganz.
- `diff-auge.png`: 3,58 % der Pixel ändern sich, in der fernen Krone (L0-Laub statt L1-Laub) und an den Bäumen im Fade-Fenster
  dahinter, die jetzt als Ganzes blenden statt quer über ihre Krone. Kronen-Blick: 3,70 % (`diff-krone.png`).
- In EINER Sitzung (`sitzung/`): `b1-mit.png` (main, mit Band), `b1-ohne.png` (main, Band entfernt: Löcher, `b1-diff.png`),
  `b3-schnitt.png` (Schnitt, die Krone voll aus der L0).

## Wände (`waende/`, je EXIT=0)

gate:vendor-anker · gate:kopplung · gate:kamera-treue · gate:sicht-arbeit · gate:foundry-crossfade (mit (8) und Selbsttest) ·
gate:scatter-lod · `npm run check` (113 s) · playtest:fast (20 ✅ · 0 ❌) · lint · format:check · gate:worker-dichte.
`ci-lokal` (alle 160 CI-Schritte seriell) läuft zur Abgabe noch; die CI der Abgabe richtet `[ci voll]`.

## Offen (mit Zahl)

1. **Die Mitgliedschaft im Rand M:** Die CPU hält im Studio-Rand M (3,4 m) außerhalb des Fensters zwei Slots je Baum (die Birke
   in 4,92 m: L0 + L1-Band). Gezeichnet wird nur die Stufe mit Bild (Linse 0), die Slot-Pflege bleibt CPU-Arbeit. Ein Rand aus der
   echten Latenz der Stufen-Wahl statt der Studio-Zahl wäre der nächste Schnitt, falls der CPU-Takt ihn verlangt.
2. **CPU-Takt p95 frei +0,55 ms** (der Regler nimmt die GPU; voll +0,20).
3. **Das fail-soft der Blende:** `_lodCrossfadeMaskNode` verschluckt jeden Fehler (`null`, der Stoff ohne Maske).
4. **Aus 1110-10 bleiben benannt:**
   - Bühne s5-bucht +0,15 ms ohne Namen.
   - A zweigipflig an der Bühne (b7A). Wahrscheinlich dieselbe Klasse (ein Objekt der Bühne mit zwei Stufen im Fragment-Maß),
     nicht geprüft.
   - Die Instrument-Variante der Genesis-Folge.
5. Der WIP-Commit ef5bd38c trägt 608 Zeichen Rumpf, 8 über dem Kartenmaß.

## Geschnitten · Gemessen · Pflicht-OFFEN Rest

- **Geschnitten:** Das Maß der Blende ist die Instanz (Maske, Blattmaske, Karte, W7), `_instanzWeite` fällt. Die Linse (8) samt
  Selbsttest steht in gate:foundry-crossfade, die Roadmap-Zeile nennt das Maß.
- **Gemessen:**
  - Wiese gpu-bank −1,21 / −1,67 ms, Linse main 43/40/37 → Schnitt 0 in 7/7, baum 3,40 → 2,53 ms, Frame p95 gleich.
  - Bild: die Krone ganz in beiden Ständen, im Schnitt aus der L0.
- **Pflicht-OFFEN Rest:** A · B · C · E stehen.

## Status: ZWISCHENSTAND · Übergabe

- welle-m-birke **80912b9d** (per ls-remote): WIP ef5bd38c (Schnitt + Linse) und der Abgabe-Commit mit der Roadmap-Zeile
  `[ci voll]`. CI 38219933869 lief zur Abgabe (queued).
- Worktrees `welle-m-birke`, `bisekt-vor-k11`, `bisekt-k11`, `abab-b541`, `abab-b542`, `abab-i542` bleiben stehen.
- Danach: zurück zu welle-m-e-torwurf (WIP 1c2ceb4c: Stufe 3 bis 16 380 Dreiecke über der Zeile 12 000, W geisttor 0,767).
