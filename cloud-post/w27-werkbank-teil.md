# Post an w27-werkbank-teil

## 10.11. 02:04 Cloud w27-werkbank-teil — Zuordnung des Zugs 20a0178 (ROT nur an der Fenster-Wand)
Lauf 42728340523 fiel allein an „Fenster-Wand“ (voll 16/18, `gate:fenster-wechsel`, Job 129539864863). Dieselbe Wand fiel schon im Zug davor ohne diesen Zweig: fbbeb31 (nur w25-gpu-wahl-2), Lauf 42724261493, voll 15/18, Job 129525946282. scripts/diag-fenster-wechsel.cjs liest transitiv 13 Module, keines davon berührt dieser Zweig (werkbank.cjs, lib/zerlege-linse.cjs, lib/haenger-linse.cjs, spec/ci/frist-rest.json). Der Kopf b8e11f05 bleibt; ich warte auf Post.

## 09.11. 23:57 — GPU-PROBE b8e11f05 auf radeon-890m: GRÜN in 523 s (gate:pruefbuehne-licht GRÜN 69 s auf radeon-890m · bild:wiese@0.5 GRÜN 65 s auf radeon-890m) → probe-post/w27-werkbank-teil/b8e11f05.md

## 09.11. 23:48 Cloud w27-werkbank-teil
ABGABE b8e11f050c820d2364cd3dc7668d71f795d311a3 — der echte Lauf und die GPU-Bank (Seiten-Funktionen `lauf`, `gpuBank`) wohnen in scripts/lib/zerlege-linse.cjs, die Werkbank ruft nur noch (`ZL.lauf`, `ZL.gpuBank`); scripts/werkbank.cjs 3975 → 3543 Zeilen (main 78d37554).

- Geschnitten: scripts/werkbank.cjs:255–687 (Stand main) → scripts/lib/zerlege-linse.cjs:395 (`lauf`) und :794 (`gpuBank`), neben Pass-Uhr, Zwei Gipfel, Stempel-Wache, Belegung und der Bank der Seite, die sie lesen. Kein Hunk von w25-gpu-wahl-2 (563ac9c) oder w26-eiche-kante (d57566f) berührt: merge-tree je 0 Konflikte (Werkbank 3566 bzw. 3533 Zeilen), alle drei zusammen 0 Konflikte und 3556 Zeilen.
- Gemessen: byte-gleich vorher ↔ nachher `node scripts/werkbank.cjs` (Hilfe, 9515 B) und `node scripts/werkbank.cjs lauf --selbsttest` (342 B), dazu takt, haenger, latenz, diaet --selbsttest; der Funktions-Text, den `page.evaluate` in die Seite trägt, sha256-gleich (lauf fc09884a, gpuBank 63b5304a), ZERLEGE_INSTALL und jeder alte Export der Linse gleich. DECKE scripts −19 Atome / 0 Dateien, Prüf −5. Konsum headless (swiftshader, je Seite eine frische Welt): `werkbank lauf 2 --ein 1` 259 ↔ 259 Antwort-Pfade, Exit 1 = 1 (BELEGUNG ROT auf dem CPU-Raster, beide Seiten); `werkbank gpu-bank 4` 7 ↔ 7 Pfade, Exit 0 = 0. check, playtest:fast 21/0, welt-boot GRÜN am Kopf.
- Mit gewandert: spec/ci/frist-rest.json:12 — die Warte-Wand zählt Frist-Schleifen je Datei, die `--ruhe`-Schleife des Laufs zog mit um (werkbank 2 → 1, zerlege-linse 0 → 1, Summe 3 = 3). Ohne das fällt gate:altlasten; es ist der eine Eintrag außerhalb von scripts/.
- Bezahlt in der Domäne: der zweite require im Selbsttest des Laufs fiel, der kurze Lauf vor Schirm und Bedienung ist EIN Ruf (`kurzLauf`, scripts/werkbank.cjs:1522).
- Ehrlich offen: die Zeiten des Laufs und der Bank (ms) auf echter GPU stehen aus (swiftshader trägt kein Zeit-Urteil); die Probe `[gpu-probe: gate:pruefbuehne-licht, bild:wiese@0.5]` fährt an diesem Kopf.
- FUND: scripts/diag-altlasten.cjs:3120 · der Selbsttest der Warte-Wand druckt beim Fall `scanWarteWand(gates)` ohne die Playtest-Kapitel und nennt eine Datei, die nicht fehlt (scripts/playtest/feld-leben.cjs), statt des Täters · gate:altlasten Warte-Wand · S
