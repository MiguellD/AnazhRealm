# Auftrag 0910-7 an den OMEN — der Takt unter Regler frei (Regression in main V18.538)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. **main = V18.538 `66005ca6`** (vorgespult nach deinem
0910-6: im Bild nicht langsamer, GPU −16 %, Wiese IM BAND). Dein Befund ist jetzt eine Regression IN main — sie geht vor:
0910-5 (welle-m-ego-schatten) als WIP sichern + pushen, dann 0910-7, danach 0910-5 weiter.

Eigener Worktree, Branch `welle-m-takt-frei` ab **main 66005ca6** (per ls-remote), Ports 7900–7909.

## Teil A: der Streaming-Takt ringt mit einer Last, die er nicht steuert
Befund 0910-6: unter Regler frei CPU-Takt p95 5,8 → 10,9 ms (alle vier B-Boots), unter voll 5,7 → 5,0. Profil frei:
`_loopVoxelStreaming` 2,5–7,9 → 13,5–14,5 % (darin `_tickArchitectureLOD`, `_lodTreeVisHeight`, `_foundrySichtHoehe`),
`_passSicht` 1,5–4,4 → 11 % (darin `_chunkSatzPass`, `_hoehlenSicht`, `_hoehlenSichtLicht`), Diät 4,8–6,9 → 12,4 %. In 2B senkt der
Regler loadScale bis 0,11, der Streaming-Takt bleibt bei 15,8 ms. 7A und 6B bei gleicher Stellung: 4,7 gegen 10,9 ms.
1. **Den Zweig benennen:** die sieben Merges stehen auf der ersten Eltern-Linie `git log --first-parent 7dd944e6..66005ca6`
   (fix-ankunft, welle-m-schatten, studio-s3-kreatur, studio-s3-wiese-gestalten, studio-s3-pflanzen, schau2-uhr-wetter,
   welle-m-host-vram-2). Je Merge-Commit `profil 12 --regler frei` nach `lauf frei` (zwei Sitzungen genügen) — der erste Merge,
   an dem der Streaming-Takt springt, ist der Täter. Verdacht (nicht gemessen): pflanzen (`_lodTreeVisHeight`,
   `_foundrySichtHoehe` sind dort neu oder neu verdrahtet).
2. **Die Wurzel schneiden (Lehre 25):** der Takt kostet, was ihn betrifft, nie die Weltgröße. Wenn der Regler atmet (Laub-Radius,
   Dichte, Schatten-Intervall wechseln), darf das kein Neu-Rechnen über den ganzen Bestand auslösen — nur über die Betroffenen
   (die Ring-Differenz), billige Filter zuerst. Dasselbe für die Pass-Wahl: `_chunkSatzPass`/`_hoehlenSicht` je Frame nur bei
   Änderung von Kamera-Zelle oder Satz, nicht je Frame über alles.
3. **Linse vorher ROT:** ein CI-Schritt (≤ 3 min, Takt-Zähler statt Wanduhr): unter simuliertem Regler-Atmen (loadScale
   1 → 0,1 → 1 in festen Schritten) zählt er die Aufrufe/Einträge von `_tickArchitectureLOD`, `_lodTreeVisHeight`,
   `_foundrySichtHoehe`, `_chunkSatzPass`, `_hoehlenSicht` je Takt — ROT an 66005ca6 mit dem Täter beim Namen, Selbsttest.
4. **Messen hier:** ABAB A = main 66005ca6, B = dein Kopf: CPU-Takt p95 frei muss auf ≤ voll + 1 ms fallen (Soll ~5 ms),
   Frame p95 und gpu-bank nicht schlechter, Band unverändert.

## Teil B: formationen an Genesis +9,2k Dreiecke
23,6k → 32,8k (haupt 9 480 → 13 880, k0 13 160 → 18 000, je 5 Befehle), Ratsche `formationenSatz` ROT. Welcher der sieben
Zweige trägt es (dieselbe Bisektion, `band --ort genesis` nur an den zwei Kandidaten)? Ist es Absicht (Gestalt-Lüge fiel mit
wiese-gestalten?), dann die Ratsche mit Begründung neu setzen; sonst schneiden.

## Bericht
`bericht/0910-7-takt-frei.md` + JSONs: der Täter-Zweig mit Zahl, Linse vorher/nachher, ABAB, CI-Lauf, Teil B, offen mit Zahl.
