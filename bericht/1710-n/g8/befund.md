# Befund G8 (Finder): k0 oben/unten an der Wiese — die Arena ist es nicht

**Status: ZWISCHENSTAND.** Baum `n1710-g8` (f45ee994), OMEN GTX 1060, Wiese Ego, 1920 × 1080, Regler voll, 5 frische Boots (s1–s5).
Zahlen: `p3/n1710/g8/zahlen.txt` (§), `lager-vergleich.txt`, `s2-analyse.txt`, roh `s1…s5.json`; Proben `g8-helfer.js` + `g8-*.cjs` als Werkbank-`eval`, Stamm unberührt.

## IST
- Der „Zustand" ist der Median `lauf.gpuJePassMs.k0.p50` (scripts/werkbank.cjs:559) über die Pass-Uhr (scripts/lib/zerlege-linse.cjs:82, :146).
  - Je Pass hat k0 zwei Gipfel: unten 0,227–0,232 ms, oben 0,63–0,65 ms, Abstand konstant +0,40–0,41 ms (14 von 16 Läufen, zwei 0,51; §5).
  - Der Anteil oben liegt je Lauf bei 0,02–0,56. Der p50 springt, sobald der Anteil 0,5 kreuzt — das ist „0,62 ↔ 0,24".
- Was der Erstbau anders trägt (lager-vergleich.txt):
  - L2 hat iCap 138 816 (= „46 272 Dreiecke") gegen 127 872 nach Genesis, bei gleicher Belegung (51 898 Vertices, 125 724 Indizes).
  - Der Rest ist 0,25 MB Brache, die `Lager.ordnen` (stamm/stoff-instanz.js:1917) bis 1/8 duldet. `bauen` (:1934) legte beim Boot die damals gehaltenen Gestalten.
  - Nach Genesis sind die drei k0-Arenen neue Objekte (`_fallen` :2164 → `_arenaNimmt` :1507), Instanz-Seite 248 statt 164–172.
- Gleich bleiben in k0: 13 + 1 + 1 Züge, 32 + 4 + 4 Instanzen, die Reihe, die Programme und die GPU-Pipelines (§3).
  Aufträge, Index, Lage und Matrizen sind auf der GPU gleich der CPU und den Quellen der Glieder (§2).

## Messung: oben ↔ unten in EINER Welt
1. **Es kippt ohne jede Arena-Änderung.**
   - s1, dieselben Objekte #2648/#2649/#2650: `lauf` 0,62 → 0,24 → 0,60 → 0,24 (§1, §2; die Umschalter-Folge mit Reihe und 0-Instanz-Zügen in §7).
   - s2: `LAUB_VERSATZ` zurück auf 1 ergibt wieder 0,60, bei denselben Arenen #5850/#5851/#5854 (§1, §3).
2. **Ohne Präsentieren gibt es keinen oberen Gipfel** (§4).
   - Bank-Render in der oben-Welt: k0 0,251 bei leerer GPU vor jedem Frame (0/72 oben) bzw. 0,265 bei dichten Frames (3/72); nach Genesis 0,234 / 0,250.
   - gpu-bank 12,12 gegen 12,10 ms/Frame. Die Arena-Lage kostet in k0 höchstens 0,02 ms.
3. **Trennung** (s5, §6).
   - Präsentierender rAF-Loop NUR mit dem Bank-Render: Anteil oben 0,54 / 0,45, Gipfel 0,229 | 0,632. Voller Spiel-Takt ohne Präsentieren: 0,02–0,04.
   - Der Block kommt also mit dem Präsentieren, nicht mit Spiel-Takt, Arena oder Lager.
4. **Der Block ist fremde Zeit.**
   - Mit allen Arena-Zügen auf 0 zeigt k0 p50 0,06, p95 0,46–0,47 — derselbe Versatz (§7).
   - Je länger k0 läuft, desto öfter liegt der Block darin. Die Baum-Werfer-Arena trägt 0,165 ms eigene Arbeit (s3 #2465/#5844 aus/an, §4).
5. **Phase.**
   - Takt 6 ms nach dem rAF versetzt: Anteil oben 0,02–0,36 statt 0,32–0,56 (§5); Takt-Abstand 6–9 ms 0,53–0,63, ≥ 20 ms 0,00 (s2-analyse.txt).
   - `lauf`-Durchsatz oben 12,3–12,6 ms, unten 12,3–12,9 ms (§1): kein Kostenunterschied.

## WURZEL
Der EINE Chokepoint liegt im Richter, nicht in der Welt: `lauf` → `gpuJePassMs` (werkbank.cjs:559–564).
Er bildet den Median über Pascal-Pass-Stempel. Darin zählt in 2–56 % der k0-Pässe ein präsentations-gebundener GPU-Block von +0,41 ms mit, der nicht unsere Arbeit ist.
**Klasse:** Pass-Stempel im präsentierenden Loop tragen fremde GPU-Zeit. Sie trifft jeden Pass früh nach dem Präsentieren (k0 zuerst) und jedes Urteil,
das k0 aus `lauf` als Kosten liest (Bündel 7, G7, E2: „k0 je Boot oben/unten", bericht/1710-k0.md).

## Der Schnitt (entschieden)
- **Kein Schnitt an der Arena.** Erstbau wie Neubau trägt in k0 höchstens 0,02 ms (§4); ein solcher Bau-Weg wäre Theater. Die 0,25 MB Brache sind eine VRAM-Frage.
- **Der Schnitt liegt in `lauf` (werkbank.cjs:559–564), am EINEN Leser jeder Pass-Zahl.**
  - Je Pass werden die Frame-Werte an der größten Lücke in zwei Gipfel geteilt.
  - Gemeldet wird `{ p50, p95, frames, rein = p50 des unteren Gipfels, anteilOben, versatz }`.
  - ABAB-Urteile über Pass-Kosten lesen `rein` oder gpu-bank, nie den gemischten p50.
- **Was stirbt:** der „k0-Sitzungs-Zustand" als Kostenbefund, die Arena-Hypothese der Karte, das Mitschreiben „k0 je Boot".
- **Selbsttest der Linse** (Familie Pass-Uhr in zerlege-linse.cjs, ≤ 3 min): Bank-Render ohne Präsentieren ergibt `anteilOben` ≤ 0,05, der Loop an der GTX `versatz` 0,40 ± 0,05.

## Beweis-Plan
- GTX, ≥ 4 frische Boots je Seite, gleiche Box (die k0-Probe von bericht/1710-s2b.md).
- A, der heutige `lauf`: am Anfang 5 von 5 Boots bei 0,61–0,63, nach Genesis 3 von 3 bei 0,24–0,25 (§1).
- B, der geteilte `lauf`: `rein` am Anfang und nach Genesis gleich (± 0,02 ms), `anteilOben` gemeldet, gpu-bank je Stelle ± 0,05 ms.
- Danach `npm run check` und `npm run playtest:fast`.

## Ehrlich offen
- Wer den Block legt (Chrome-Compositor, DWM oder Dawns Präsentier-Weg), ist nicht beim Namen gemessen; es lief kein GPU-weiter Trace (GPUView/PIX).
- Die Wirkung auf das Frame-Pacing ist nicht gemessen; Durchsatz und gpu-bank sind gleich.
- Unerklärt bleiben 0,017 ms (phase-leer 0,251 gegen 0,234). Die Radeon ist nicht gemessen.
- **Zwischenfall s1:** Eine Rest-Instanz des Erst-Starts löste das Schloss 02:24:40, neu genommen 02:25:51; `lauf anfang` lief teils ohne Schloss (kein CI-Job wartete, fortschritt.log).
