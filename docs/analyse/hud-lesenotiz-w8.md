# HUD-Lesenotiz für die W8-Abnahme — wie die dc-Zahl JETZT zu lesen ist

**Zweck (Plan §W8 Schritt 1):** die 38108-Fehldeutung darf sich mit der korrekten, aber
unintuitiven NEUEN Zahl nicht in der Abnahme wiederholen. Diese Notiz ist die Lesehilfe
für den Schöpfer-Browser — VOR dem ersten HUD-Blick lesen.

## Die eine Regel

**`dc` im HUD/Overlay ist seit V18.427 `renderer.info.render.drawCalls`** — die Draw-Calls
EINES Frames, summiert über ALLE Render-Pässe seit dem EINEN `info.reset()` in `_loopRender`
(Haupt-Pass + Schatten-Pass + Post-FX + Env/Bake-Pässe, ~5–7 Pässe je Frame).

- **Erwartetes Band bei voller Bühne: ~900–1600 dc.** Das ist die ehrliche Summe aller
  Pässe — NICHT „zu hoch". Die Szenen-Zensus-Sonde (Null-Renderer, Emitter zählen) maß
  ~1100 echte Szene-Emitter; `gate:render-tap` bewacht dc_tap ∈ [0.3×..2.5×] Zensus.
- **NICHT 436:** die historische „436 dc"-Zahl (V18.413 S3) war der r184-LEBENSZEIT-Zähler
  `render.calls` früh in der Session gelesen — kein Frame-Wert. Sie war nie die Wahrheit.
- **NICHT 38108 (oder jede session-wachsende Zahl):** `render.calls` zählt render()-AUFRUFE
  über die ganze Sitzung (`Info.reset()` löscht ihn NICHT — nur drawCalls/frameCalls/
  triangles). Wächst eine HUD-Zahl mit der SPIELZEIT statt mit der Szene, liest dort
  wieder jemand den Lebenszeit-Zähler → das wäre eine Regression der V18.427-Klasse
  (`gate:render-tap` + die Constitution-Zeile „kein nackter render.calls-Read" fangen sie).

## Was daraus folgt (für die Abnahme)

1. **Stabil = gesund:** dc soll beim STEHEN in einer geladenen Szene um einen festen Wert
   pendeln (Schatten-Cache-Skips machen kleine Sprünge). Session-lineares Wachstum = rot.
2. **Der Regler liest dieselbe Zahl:** `renderLoadMs = drawCalls × 0.011` ist jetzt eine
   Szene-Größe, keine Phantom-Last — die V18.427-Endlos-Drossel-Schleife (Dauer-Drosselung
   plus Thin-Re-Streams) kann aus dieser Quelle nicht mehr entstehen (`gate:regler-sim` S4:
   Session-Zeit-Invarianz).
3. **Flugschreiber-Traces:** nur Traces mit `version >= 18.427` vergleichen — ältere tragen
   die vergiftete Zahl in `drawCalls`-Feldern und sind für dc-Vergleiche unbrauchbar.
4. **Die Szene ist VERTEX-gebunden, nicht draw-call-gebunden** (V18.413 S3: ~31,5 M Tris
   ungecullt, Batching greift): ein dc-Wert im Band bei schlechten FPS zeigt auf die
   Geometrie-Last (Foundry-Bäume ~76k Verts/L0 — der benannte Dezimierungs-Faden), nicht
   auf einen dc-Fehler.

## Die drei Linsen zum Nachmessen (alle hardware-unabhängig)

- `npm run gate:render-tap` — r184-Semantik-Vertrag (Fake-Info: calls wächst, drawCalls pro
  Frame; HUD trägt den beschränkten Wert).
- `npm run gate:regler-sim` — der Regelkreis auf der geheilten Zahl (S1–S4, inkl.
  Session-Zeit-Invarianz).
- `node scripts/diag-render-load.cjs` — die Szene nach Quelle aufgebrochen (Zensus, Tris,
  per-Art) — der richtige Ort, wenn dc plausibel ist, aber die FPS nicht.
