# Bericht 1310-1 (3) — Dorf-VRAM

**Status: ZWISCHENSTAND.**

**Urteil:** Das „Dorf-VRAM 125,8 > 118 MB“ war der Mess-Zeitpunkt, nicht der Inhalt.
- Die Band-Messung schwang nach 40 Takten ein. Die Sätze dürfen nach ihrem eigenen Gesetz (`_chunkSatzVerdichten`, W7) erst
  nach 600 Render-Takten auf ihren Inhalt schrumpfen.
- Der Schnitt ist eine Linse: Das Einschwingen kennt jetzt den anstehenden Schrumpf (`satzSchrumpft`).
- Mit ihr misst das Dorf **118,3 MB** (Soll 118).

Schnitt: **welle-m-e-satz-ruhe c956311e** `[ci voll]` (ab welle-m-e-torwurf 198e80f3, nur `scripts/`).

## Gemessen (GTX 1060, Messort dorf, je ein Boot; `1310-1/dorf/`)

| Boot | Instrument | Einschwingen | VRAM MB | buf:szene MB | Sätze MB (Puffer / Inhalt) |
|---|---|---|---|---|---|
| D1 | abab-i543 (alte Liste) | 40 Takte | **124,6** | 39,5 | 33,9 / 19,9 |
| D2 | abab-i543 + 20 s Lauf vorher | 40 Takte | 118,4 | 33,3 | 27,5 |
| D3 | satz-ruhe (neue Liste) | **843 Takte (62 s)** | **118,3** | 33,2 | — |

- **Die Sätze am Dorf vor dem Schrumpf** (`D1-saetze.json`): 9 Bau-Sätze mit 24 bis 1180 Ecken trugen je 8192 Ecken und
  16 384 Indizes (je 0,44 MB). Der Boden-Index stand bei 1,31 M für 654 k im Gebrauch.
- **Nach dem Schrumpf** (`D2-saetze.json`): die kleinen Bau-Sätze bei 1024 Ecken und 3840 Indizes, der Boden-Index bei
  653 k. Die Ecken des Boden-Satzes (229 k für 134 k Inhalt, 1,71×) liegen im Gesetz (Ziel 1,25 × Schwelle 1,5).

## Die Linse

- `scripts/lib/band-urteil.cjs` `einschwingOffen`: Jeder Satz mit `ueberSeit` ≥ 0 hält das Einschwingen offen. Jeder Satz
  tickt je Render, gezeichnet oder nicht, also löst sich ein anstehender Schrumpf immer auf.
  - Wächst der Inhalt weiter (ein Dorf, das einströmt), beginnt die Frist neu.
  - Dann bleibt die Messung offen, und die Ratsche verweigert zu Recht.
- `gate:profiband` S28 (Puls, check:statik): Ein Satz über seinem Ziel hält offen, ein ruhender nicht.
  - **Vorher rot** an der alten Liste: EXIT=1, „1 von 33 Selbsttests feuern nicht“ (`profiband-st-vorher.txt`).
  - Jetzt 33/33.
- Puls ci-lokal 18/18 (`puls-ci-lokal.log`).
- Der Konsum-Leser ist die Band-Messung (`werkbank band`, die Messfolge an jedem Ort). Das Einschwingen am Dorf dauert damit
  ~60 s länger.

## Pflicht-OFFEN Rest

- 0,3 MB über 118 am Dorf.
- Wiese, Genesis und Prüfbühne mit der neuen Liste neu einschwingen. Ihre Bänder und Ratschen enthielten denselben
  Ankunfts-Puffer, wo ein Satz noch schrumpfte.
- Karte (2) bleibt offen mit dem Flügel-Hebel (`bericht/1310-1-band-delta.md` §7).

## Status ZWISCHENSTAND + Übergabe

- Branch welle-m-e-satz-ruhe, Kopf c956311e, gepusht, Arbeitsbaum sauber.
- welle-m-e-torwurf 198e80f3 bleibt der Kandidat für V18.544 (die Reihe der Bündel). satz-ruhe sitzt darauf und kann mit ihm
  oder danach in die Version.
- Werkzeug: `p3/dorf/boot.sh` (`INS=` Instrument, `LAUF=` Vorlauf).
