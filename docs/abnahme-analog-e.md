# Abnahme Analog E — Beweis-Paket

> Pflicht E: Bild-Paare vorher↔nachher MIT Armlängen-Schüssen je Klasse + Tris/dc/weltMarch-Zahlen, dieselbe Sonde.

## Status je Klasse (live CODE vs Bild · Puls .156 · 15.09. UTC+2)

> Honesty: Tabelle war stale **09.09.** (Grammatik-SDF/Prism „offen“, C-Bild „noch offen“) — **lügt vs PFLICHT**. Unten = CODE/Bild-Wahrheit. Metrologie-Spalte bleibt **offen** (Zahlen neben Bild). Snapshot `anazhRealmPerf.json` version **.63** stale ≠ live **18.491.157**; headless Kanal **GRÜN ≠ E-zu**. E bleibt **TEIL**. Kein Fake-ERLEDIGT E · keine erfundenen Tris/dc.

| Klasse | Code | Bild | Metrologie (Tris/dc/weltMarch) |
|--------|------|------|--------------------------------|
| A Kreaturen | CODE-PFAD geschlossen (Kapseln+Dedup+Chat-Fix) | Bild-Paar **TEIL** (Welt-Silhouette + Hof-Vorschau Wolf) | offen — Zahlen neben Bild |
| B Bäume | CODE **ZU V18.491.76** (Kegel-Fit/Pack/March + Kronen-Ellipsoid+Noise); Grammatik-SDF **nicht** offen | Fernwald **TEIL** (`analog-b-fernwald.png`; auch `analog-b-e-stempel.png`) | offen (Zahlen neben Bild) |
| C Arch/Streu | CODE denseness done-ish ≤.95 (FachwerkFit + Prism-Dach + Gaube/Flügel); Prism **nicht** offen | Bild **TEIL** (`AnazhRealm-denken/analog-c-mittag.png`; auch `analog-c-mittag-e.png`) — **nicht** „noch offen“ | offen (Zahlen neben Bild) |
| D Wiese | CODE+BILD **zu** (Parallax) | `analog-d-wiese-nah.png` @ −900/−850 | offen — Zahlen neben Bild |

## Messprotokoll (eine Sonde)

1. **Gleiche Kamera/Koordinaten** je Klasse (Armlänge + Fern wo nötig) — siehe A–D.
2. **Bild** speichern (vorher↔nachher wo Parallelpfad tot).
3. **Zahlen** im selben Moment:
   - Live-Konsole (kapselCache nur so):
     ```js
     const wm = anazhRealm.state.weltMarch;
     ({ belegt: wm.belegt, bricks: wm.brickCache.size, kapsel: wm.kapselCache.size, gesetzBloecke: wm.gesetzBloecke });
     const ri = anazhRealm.state.renderer.info.render;
     ({ dc: ri.drawCalls ?? ri.calls, tris: ri.triangles });
     ```
   - Oder Perf-Panel Screenshot (Version + frame/dc/tris) **und** Export → `anazhRealmPerf.json`.
4. Headless-Auswertung des Exports:
   ```bash
   node scripts/diag-analog-e-metrology.cjs
   # optional: node scripts/diag-analog-e-metrology.cjs /pfad/zu/trace.json
   ```

## Linse (ohne Browser)

| | |
|--|--|
| Script | `scripts/diag-analog-e-metrology.cjs` |
| Quelle | `anazhRealmPerf.json` (Flugschreiber-Export) |
| Misst aus JSON | `steadyState.weltMarch.{belegt,bricks,gesetzBloecke,…}`, dc/tris aus `worstFrames` (steady oft 0 bei Idle) |
| Code-Vertrag | Export trägt belegt/bricks/gesetzBloecke/**kapseln** + steady dc/tris + **`eMetrologieStamps`** (letzte Chat-Stempel); Chat `_analogEMetrologieZeile` + `_analogEMetrologieStempelLog` (metrologie\|analog e\|zahlen) |
| Selbst-Test | Fake ohne `weltMarch` → ROT; Function-Extrakt `_analogEMetrologieZeile` → E OK inkl. kapseln |

## Stand Metrologie · Puls .156 (15.09. Nachmittag UTC+2) — ehrlich

Lauf: `node scripts/diag-analog-e-metrology.cjs` → **Kanal GRÜN** (Metrologie-Vertrag). **Kanal GRÜN ≠ E-zu.**

On-Disk Trace `anazhRealmPerf.json` · version **18.491.63** · savedAt 2026-09-09T13:26:48.162Z (= **15:26 Europe/Zurich**) — **stale Snapshot ≠ live Code 18.491.157** (Snapshot ≠ live; Kanal GRÜN ≠ E-zu):

| Feld | Wert (nur gelesen) |
|------|--------------------|
| weltMarch.belegt | **121** |
| weltMarch.bricks | **0** |
| weltMarch.gesetzBloecke | **0** |
| weltMarch.gesetzPlaetze | **0** |
| weltMarch.seiten | **4** |
| frei bloecke/einheiten/felder | **128** / **0** / **3975** |
| kapseln | **37** |
| steady dc / tris | **117** / **1021103** |
| worstPick dc / tris | **8** / **15261** @ 36581.9ms (n=12) |
| eMetrologieStamps | **absent** (fail-soft) |

E bleibt **TEIL** (Bild-Stempel A/C/D + Tris neben Bild fehlen; B TEIL). Kein Fake-ERLEDIGT E. Nächster: **human Bild**.

## Stand Metrologie (09.09. ~12:25 MESZ) — historisch

Lauf: `node scripts/diag-analog-e-metrology.cjs` → **GRÜN**.

Trace `anazhRealmPerf.json` · version **18.491.53** · savedAt 09.09. 12:25 MESZ (UTC 10:25):

| Feld | Wert |
|------|------|
| weltMarch.belegt | 176 |
| weltMarch.bricks | 0 |
| weltMarch.gesetzBloecke | 0 |
| weltMarch.gesetzPlaetze | 0 |
| weltMarch.seiten | 9 |
| frei bloecke/einheiten/felder | 128 / 0 / 3920 |
| steady dc / tris | 0 / 0 (Idle-Export) |
| worstPick dc / tris | **73** / **378827** @ 30198.8 ms |

## Lücken (fail-closed)

1. ~~**`kapselCache.size` nur Live**~~ — **geschlossen im Kanal:** Flugschreiber exportiert `weltMarch.kapseln`; Chat-Zeile nennt `kapseln=` (Linse + Extrakt-Smoke).
2. **Sonden-gebundene Zahlen** — der Trace ist Session-weit, nicht „dieselbe Sonde neben dem Bild“. E-Schließung braucht die Console/Panel/Chat-Zahlen **am Bildmoment** je Klasse A–D.
3. **steady dc/tris = 0** möglich bei Idle-Export — für Beleg neben Bild `worstFrames`, Live-`renderer.info` oder Chat `metrologie` nutzen.
4. Metrologie neben Bild A–D offen (Zahlen am Bildmoment); human Bild-Rest A/C formal — CODE B Grammatik zu .76 / C Prism denseness done-ish (siehe A–D-Abnahmen). Kein Fake „SDF/Prism offen“.

## PULS (09.09. ~18:40 MESZ) — ehrlich

**Kanal GRÜN** (Quell-Vertrag + `diag-analog-e-metrology` Extrakt-Smoke + `scripts/diag-puls`): Flugschreiber trägt `kapseln`, `_analogEMetrologieZeile` liefert `E OK`/`E ROT` inkl. Kapseln. **Bild-Stempel A–D weiterhin menschlich/Feel** — keine Desktop-Sonden in diesem Puls; Screenshot-Roulette bleibt bewusst aus.

## Stand .90 (09.09. ~19:25 MESZ) — Stempel im Flugschreiber

**V18.491.90:** Chat `metrologie`/`analog e`/`zahlen` schreibt fail-soft in den Ring `_eMetrologieStamps` (cap 32); Export `steadyState.eMetrologieStamps` (slice −8) in `anazhRealmPerf.json` — **das ist der echte Disk-Pfad** neben Session-Trace. Optional-Hook `window.__anazhEMetrologieLog`. Linse: Stamps absent → fail-soft GRÜN; weltMarch-Vertrag weiter fail-closed.

**Bild-Stempel A/C/D** weiterhin menschlich; **B TEIL** (`analog-b-e-stempel.png`). Kein Screenshot-Roulette in diesem Cut.

## Noch für E-Schließung

1. Einheitliche Sonde (gleiche Kamera/Koordinaten) je Klasse — mit Zahlenblock aus Protokoll.
2. Tris/dc/weltMarch (+ Live `kapselCache` wo Dedup zählt) **neben** Bild (Chat-Zeile + Export-Stamps).
3. Vorher↔nachher-Paare wo Parallelpfad totgelegt wurde.

Gates: `node scripts/diag-puls-konsum.cjs` · `node scripts/diag-analog-e-metrology.cjs` · VERSION **18.491.157**. E **nicht** zu.

## Stempel-Fortschritt (09.09.)
| Klasse | Datei | Zeile |
|--------|-------|-------|
| B | `analog-b-e-stempel.png` | `E OK V18.491.59 tris=258821 dc=43 belegt=84 bricks=0 kapseln=36 gesetzB=0 gesetzP=0 pos=48/52/0` |
| A/C/D | — | offen |
