# GPU-PROBE dcbb5a20 — ROT

Zweig `w28-pop-treue` · Kopf dcbb5a20b0981dabd1a71577d5299ebfb48c8128 · Läufer radeon-890m · 21.11. 04:02 · Wanduhr ab Push 610 s · Lauf https://github.com/MiguellD/AnazhRealm/actions/runs/44858183528

Ruf: `gate:pop gate:kamera-treue`

## Läufer radeon-890m — ROT

GPU AMD Radeon(TM) 890M Graphics · node_modules bleiben (package-lock 42ac545e)
Schloss /c/Users/micha/AppData/Local/Temp/claude/gpu-schloss hält „ci-runner 44858183528/1 probe“
- Hook 2026-11-21 03:55:15 start ci-runner 44858183528/1 probe: Schloss genommen (refs/heads/w28-pop-treue dcbb5a20b0981dabd1a71577d5299ebfb48c8128 ws=C:\actions-runner\_work\AnazhRealm\AnazhRealm)

### gate:pop — ROT · 124 s · Läufer radeon-890m

Adapter: ungenannt (die Probe nannte keinen Browser-Adapter) · lod.K2#1 ROT 0.0749 % Pop-Pixel/s (1554 px) · 56*+7@189/91*+5@185/134*+8@154/653*+4@185/194*+6@190/144*+7@186/161*+5@155/121+7@189 · Laub 216 · dc, Dreiecke 92,359171 · GPU 19.83 ms, CPU 5.58 ms je Bild

```text
lod.K2#1 ROT 0.0749 % Pop-Pixel/s (1554 px) · 56*+7@189/91*+5@185/134*+8@154/653*+4@185/194*+6@190/144*+7@186/161*+5@155/121+7@189 · Laub 216 · dc, Dreiecke 92,359171 · GPU 19.83 ms, CPU 5.58 ms je Bild
BLOCK-TREUE GRÜN 192 Blöcke treu · Selbsttest nennt MeshStandardNodeMaterial · nahWiese:L1:0:0 · instanzFarbe: 1/917 Instanzen fremd
 "fehler": "lod.K2#1 ROT 0.0749 % Pop-Pixel/s > 0,05"
```

### gate:kamera-treue — ROT · 47 s · Läufer radeon-890m

Adapter: [linse-gpu] amd/rdna-3 · ❌ ROT — 1 Verletzung(en): SCHLÜSSEL: instanz-zeichner ×1 — nach der Erst-Zeichnung ein anderer Schlüssel als der des Baus

```text
  ✅ Selbsttest „alphaTest-0,5-Werfer verliert discard" → rot: WURF: wurf:schnitt — Hauptpass verwirft true, Wurf verwirft false
  ✅ Selbsttest „Farb-Graph im Wurf" → rot: WURF: wurf:voll — ohne Ausschnitt trägt der Wurf den Farb-Graphen
  ✅ Selbsttest „Stand blind" → rot: STAND direkt: DIÄT: keine Diät-Prüfung gezählt — die Linse ist blind
  ✅ Selbsttest „Stempel überlebt den verschachtelten Render" → rot: VERSCHACHTELT replay: nach einem verschachtelten Render über die Vendor-Bahn (Werfer ohne Diät) zeichnet die Diät 0.1099 gleich mit dem vollen Refresh (Soll ≥ 0.999) — ein Stempel überlebte den verschachtelten Render, die nächste geteilte Gruppe trug dessen Kamera
  ✅ Selbsttest „Verschachtelt blind (Täter)" → rot: VERSCHACHTELT direkt: ein Stempel nur aus der Render-Id zeichnet 1 gleich (Soll < 0.98) — die Probe ist blind (oder der Gang liest seinen Render-Abschnitt nicht aus `rend.info.calls`)
  ✅ Selbsttest „kein verschachtelter Render" → rot: VERSCHACHTELT replay: kein verschachtelter Render im Bild der Diät — die Probe ist blind
  ✅ Selbsttest „Spiel-Frame in der Bühne" → rot: LAUF: 2 Spiel-Bilder während der Bühne, der GPU-Kehraus nahm 51 Geometrie-Puffer — der Spiel-Loop lief hinein, der Lauf ist ungültig
  ✅ Selbsttest „Kehraus ohne Spiel-Bild" → rot: LAUF: 0 Spiel-Bilder während der Bühne, der GPU-Kehraus nahm 3 Geometrie-Puffer — der Spiel-Loop lief hinein, der Lauf ist ungültig
✅ SELBSTTEST GRÜN — jeder injizierte Täter fällt rot und wird beim Namen genannt.
❌ ROT — 1 Verletzung(en): SCHLÜSSEL: instanz-zeichner ×1 — nach der Erst-Zeichnung ein anderer Schlüssel als der des Baus
```
