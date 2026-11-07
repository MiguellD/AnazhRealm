# GPU-PROBE f825cdee — GRÜN

Zweig `w22-gpu-probe` · Kopf f825cdee36ff3102db2d73580ea5e88eb2e91f60 · Läufer omen-gtx1060 · 07.11. 20:53 · Wanduhr ab Push 128 s · Lauf https://github.com/MiguellD/AnazhRealm/actions/runs/42408237895

Ruf: `gate:ego-schatten bild:wiese@0.3`

GPU NVIDIA GeForce GTX 1060 · node_modules bleiben (package-lock 33508917)
Schloss /c/Users/micha/AppData/Local/Temp/claude/gpu-schloss hält „ci-runner 42408237895/1 probe“
- Hook 2026-11-07 20:51:55 start ci-runner 42408237895/1 probe: Schloss genommen (refs/heads/w22-gpu-probe f825cdee36ff3102db2d73580ea5e88eb2e91f60 ws=C:\actions-runner\_work\AnazhRealm\AnazhRealm)

### gate:ego-schatten — GRÜN · 43 s

Adapter: [linse-gpu] nvidia/pascal

```text
  ✅ Selbsttest „Zwilling geweckt" → rot: fein: ZWILLING: ein Knoten, der nur in den Kaskaden lebt, trägt nach 1st → 3rd die Maske 5 — die Haupt-Kamera sähe ihn
  ✅ Selbsttest „visible geschaltet" → rot: fein: ZURÜCK: die Regel schaltet visible an 2 Knoten
  ✅ Selbsttest „Haupt-Kamera sieht die Zwillings-Ebene" → rot: fein: VERTRAG: die Haupt-Kamera sieht Ebene 2
  ✅ Selbsttest „Bühne ohne Schatten" → rot: fein: BLIND: die 3rd-Person wirft auf der Bühne 3 px (Soll ≥ 400) — die Linse sähe keinen Schatten
  ✅ Selbsttest „Gegenprobe blind" → rot: fein: GEGENPROBE: die Regel „main: visible" fällt nicht als LEIB WIRFT NICHT (grün) — die Linse ist blind
  ✅ Selbsttest „Grob-Leib liest die Karte des vorigen Schusses (CI Gruppe 17)" → rot: grob: LEIB WIRFT NICHT: in der Ego-Sicht 0 px Schatten des Spielers am Boden (3rd-Person: 1500 px) — die Ego-Regel nimmt dem Leib den Wurf · grob: AUGE: die Haupt-Kamera sieht in der Ego-Sicht Leib — 1075 Bildpunkte vor dem Auge, 0 sichtbare Leib-Meshes auf Ebene 0
  ✅ Selbsttest „Bühne schreitet nicht (Gegenprobe Karte steht blind)" → rot: grob: GEGENPROBE: die Regel „Karte steht" fällt nicht als LEIB WIRFT NICHT (grün) — die Linse ist blind
  ✅ Selbsttest „Bühne am falschen Leib" → rot: STUFE: die Bühne „fein" misst den Leib mit nahStufe 1 statt 0 — nicht den, den der Spieler nach dem Bild trägt
✅ SELBSTTEST GRÜN — jeder injizierte Täter fällt rot und wird beim Namen genannt.
✅ GRÜN — in der Ego-Sicht wirft der Leib Schatten am Boden, grob 793 px (IoU 0.9937) und fein 797 px (IoU 0.9925) gegen dieselbe Pose in der 3rd-Person; die Haupt-Kamera sieht 0 Bildpunkte Leib, kein Leib-Mesh liegt auf Ebene 0; das Gerät bleibt auf Ebene 0, ein Zwilling in den Kaskaden, 3rd gibt jede Maske zurück, visible wechselt nie; je Stufe fallen die 6 Gegenproben beim Namen (LEIB WIRFT NICHT · AUGE · LEIB WIRFT NICHT · GERÄT · ZWILLING · LEIB WIRFT NICHT).
```

### bild:wiese@0.3 — GRÜN · 44 s

Adapter: [linse-gpu] nvidia/pascal

```text
Kamera des Spiels → Blick (10.0 m): -280.40 29.71 -1045.60 -289.61 29.71 -1049.50
 "abnahme": "ABNAHME GRÜN · beweis · Sicht 0.0 % · Ziel Blickziel im Bild frei 10 m · Luma 88.2 σ 36.4 schwarz 0.0 % weiß 0.0 % · Stand 18.546.212 · Bühne summer sunny 0.30 · Gerät WebGPU nvidia pascal",
```

![bild:wiese@0.3](f825cdee-wiese-0.3.png)
