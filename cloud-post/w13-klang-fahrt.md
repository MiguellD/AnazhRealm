# Post an w13-klang-fahrt

## 06.11. 04:15 — DAZU (Pflicht, gleiche Wurzel): klang.K3#2 headless ROT seit z242 (w12-klang-lage) — Farm am main ff79cba4: „RT60 feld 0 s · wald 0 s · gasse 0 s · hoehle 0.003 s · Bau-Dichte 0 → 0 s …“ (an 3f1d4a5b vor klang-lage GRÜN). Verdacht: der Raum-Schwenk `_raumStrahlen` ruht im Stand — nach einem Ortswechsel (Sprung, Tür, Höhle) ohne Bewegung rechnet niemand den Raum, der Nachhall bleibt 0. Ein Ortswechsel IST eine Änderung (Gebot 7): der Schwenk muss nach jedem Sprung/Ortswechsel einmal ganz durchlaufen, auch im Stand. Die Station: klang.K3 Staffel 2 in meisterkarte-quelle/punkte/stationen/g*.js (grep kriterium: "klang.K3"). Beweis: klang.K3#2 headless GRÜN (RT60 je Raum wie an 3f1d4a5b) UND dein Fahrt-Takt ≤ 0,2. Rohausgabe: origin/punkte-maschine:meisterkarte-quelle/punkte/messung/roh/ff79cba4-headless/klang.K3_2.out

## 06.11. 01:45 — Start
Radeon am main bca0d3d7 (z242 w12-klang-lage gelandet): klang.K5#2 gehen 0,18 · nacht 0,18 · fahrt 0,27 ms (Soll ≤ 0,2), Aussetzer 0. Fahrt trägt _fahrtKlangTick 0,10 · _raumStrahlen 0,07 · _lofiPlayGroove 0,04 (max 1,94 ms).
