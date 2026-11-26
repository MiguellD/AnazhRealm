# spanne-auge — der Regen liest den Eingriff, das Auge steigt über die Saat

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 119 von 1 718. Beansprucht: `karte2.same.kopplung.terraform#1`,
`karte2.same.massstab.spanne#1`. Basis origin/main 4c9e6aab.

## A · same.kopplung.terraform#1 — die Täter-Zahl (vor dem Schnitt)

**Der „Rückfall“ hat keinen Commit.** Gerechnet in der echten Welt (Null-Renderer, Fächer der Station nachgebaut: Ziel 5 · Lee 5 ·
fern 3 · Karte 1, ohne ↔ mit „rainy“, Spieler an der Wiese −280,4/−1045,6):

- f63a69ef und 2da17e2e geben an 6 gleichen Uhren (0 · 600 · 1 200 · 3 600 · 7 200 · 20 000 s) **byte-gleiche** Zahlen
  (bilanzVerh 0,8625 · 1,4491 · 0,9753 · 1,3132 · 0,9742 · 0,6262). Kein Commit in f63a69ef..2da17e2e ändert das Feld.
- Die Bilanz ist eine Lotterie der Welt-Uhr: an main, 200 Uhren 0–39 203 s, liegt bilanzVerh nur an **12 von 200** (6 %) in 1 ± 10 %,
  Spanne 0,455 … 62,3. Die Radeon-Akten springen mit der Uhr ihrer Sitzung: b1f0de0e 0,79 · 486a6685 1,003 · f63a69ef 0,975 ·
  2da17e2e 0,807 (Ziel ohne 0,4203477358052692 an b1f0de0e UND 2da17e2e, bis zur letzten Stelle gleich: dieselbe Lage, nicht derselbe Code).

**Der Mechanismus (Täter):** phyto-core.js:5157 `wetterEingriff` — der Ausgleich des Lee ist EIN Faktor c = Σ g·(Wort − Natur) ÷
Σ gL·Natur über die ganze Region (96 Punkte bis 6 600 m, **ohne Relief**), angewandt als `rain · (1 − c·gL)` an jedem Lee-Ort
(phyto-core.js:5230). Die Station mittelt 5 Orte im Kern (1 485 m) und 5 im Lee, MIT Relief. Die Fronten tragen Wellen von 6 600 ·
4 100 · 2 500 m: der Kern der Region ist eine andere Stichprobe als ihre Summe, das Relief fehlt in der Summe — die Bilanz der
Station hält nur zufällig. Dazu: im Kern des Eingriffs (g = 1, bis 3 300 m um den Spieler) ist das Feld das Wort OHNE Relief
(phyto-core.js:5209) — ein Hang, den der Spieler hebt, kann den Regen dort nie ändern; und die Höhe des Regens
(`_wetterFeldAm` stamm/bild-himmel.js:3196 `_terrainMacroSurfaceY(…, false)`) liest keinen Edit des Spielers.

## A · der Schnitt (Kopf 1)

**Geschnitten — EIN Gesetz, die Verlagerung Ort für Ort** (phyto-core `wetterZug`, `wetterFeldAm`): der Regen, den der Eingriff an p
zieht, fehlt an seinem Lee-Partner q = p + `leeM` windab zur selben Uhr: Δ = g(p)·(T − R(p)), T = min(1, ρ·Wort), R die Natur am
Ort, beide mit dem Relief ρ desselben Orts; Δ ≤ R(q) (das Ziel nimmt nur, was das Lee getragen hätte — WMO 2017), Δ ≥ R(q) − 1.
Der Faktor der Region (`wetterEingriff`, 96 Spiral-Punkte, `WETTER_ORT.spirale`) fiel ganz. Das Relief formt jetzt auch den Kern
des Eingriffs (dort stand das Wort ohne Relief). Die Höhe des Regens trägt die Edits des Spielers (`_wetterFeldAm`
stamm/bild-himmel.js: `_terrainMacroSurfaceY` + gelaende-core `editHoehe` über `editsAm`, derselbe Leser wie `_fernNass`).

**Gemessen** (Null-Renderer, Fächer der Station nachgebaut, Spieler an der Wiese, Wort „rainy“, 200 Uhren 0–39 203 s):

| | main 4c9e6aab | Zweig |
|---|---|---|
| bilanzVerh in 1 ± 10 % | 12 von 200 (Spanne 0,455 … 62,3) | **200 von 200** (0,9961 … 1,0010) |
| alle drei Soll der Sprosse (Ziel höher · Lee tiefer · Bilanz) | 12 von 200 | 158 von 200 |
| fern \|Δ\| ≤ 0,02 | 200 von 200 | 200 von 200 |

Der gehobene Kamm (14 Füllungen `fillVoxel` r 12 in zwei Lagen quer zum Grundwind, Grat 29,6 → 77,6 m, 400 m windauf vom Spieler,
Mittel über 6 Uhren):

| Regen | main vorher → nachher | Zweig vorher → nachher |
|---|---|---|
| auf dem Grat, Wort „rainy“ (im Eingriff) | 0,600 → 0,600 | **0,535 → 0,771** |
| 600 m windab, Wort „rainy“ | 0,600 → 0,600 | **0,352 → 0,183** |
| auf dem Grat, Natur (Eingriff fern) | 0,471 → 0,471 | **0,471 → 0,624** |
| 600 m windab, Natur | 0,252 → 0,252 | **0,252 → 0,122** |
| 600 m windauf (Kontrolle) | 0,643 → 0,643 | 0,643 → 0,643 |

**Die Linse** (gate:wetter-wache, Familie (O), am echten Kern im Selbsttest): PAAR (Ort ↔ Lee-Partner mit = ohne, ≤ 1e-9, über einem
Hügel-Relief) · BEREICH [0, 1] · EINGRIFF (das Wort am Ort des Eingriffs, wo das Lee trägt) · RELIEF IM EINGRIFF (Kontrast ≥ ½ des
Kontrasts draußen, Smith & Barstad 2004) · KAMM in der Welt (`fillVoxel` → Regen am Grat steigt, windab sinkt). Am alten Kern ROT:
PAAR 1,4 · RELIEF IM EINGRIFF 0,000 gegen 0,498; am alten Leser KAMM 0,4713 → 0,4713. Gepflanzt: „das Lee zahlt nicht“ → ROT an
(O) PAAR · „ohne die Grenze des Lee“ → ROT an (O) BEREICH · „das Relief nicht im Eingriff“ → ROT an (O) RELIEF IM EINGRIFF · „die
Höhe des Regens ohne Edits“ → ROT an (O) KAMM. Am Zweig: Paar 8,0e-15 · Kamm in der Welt 0,1145 → 0,1460, windab 0,1455 → 0,1200.
Wand 77 → 82 s (Deckel 90 s).

**Kosten:** je Bild ~9 Rufe des Felds, 99 % im Kern ohne Höhe; der Eingriff fragt je Ruf zwei Naturen (p, q) statt einer — die
96-Punkte-Summe je Uhr fiel. Edits kosten eine Karten-Frage je Höhe (`editsAm`, gemerkter Chunk), nur wenn Edits stehen.

**Ehrlich offen:**
- `zielMehr` hält an 158 von 200 Uhren (main 194, aber dort ohne Bilanz): an 35 Uhren trägt die Front an einem Ziel-Ort mehr Regen
  als das Wort „rainy“ (0,6) — der Wunsch beruhigt den Sturm, sein Regen fällt ins Lee; an 7 Uhren trägt das Lee keinen Regen, den
  das Ziel ziehen könnte (WMO 2017: verlagert, erfindet nicht). Messname `karte2.same.kopplung.terraform#1` zielMehr an der Uhr der Sitzung.
- Der Lee-Schatten eines Kamms liegt genau `relief.schrittM` (600 m) windab — der Hang ist eine Zwei-Punkt-Steigung. Die Drift des
  Kondensats (Smith & Barstad: U·τ ≈ 11 km bei Zug 11 m/s, τ 1 000 s) trägt das Gesetz nicht.
- Regen-Bild und Pfützen am Spieler (`_tickRain`, `_weatherFieldFor`) lesen das Wort, nicht das Feld.
- `zug.sh probe-tag` liegt in diesem Container nicht (artifacts/profiband ist nicht verfolgt); das Tag folgt der Regel „Licht
  (bild-himmel.js) → gate:tag-achse:echt“ (Lage des Koordinators, 20.11.).

## B · same.massstab.spanne#1

(folgt)
