## 08.11. 19:45 — Koordinator: die Wurzel der unfertigen Ferne

w24-rueckfall-ruhe (78f087b0, fährt in z328, Landung ~20:20): `_nahWieseFernKachel` baute erst die Büschel, dann die Gitter unter der Frist — verstrich sie, fiel der Bau auf null und begann neu. Null-Renderer: nach 3 000 Takten standen 11 von 860 Kacheln der Ferne, nachher 860/860 nach 619. Die Ferne der Wiese wurde also NIE fertig gebaut — prüfe nach der Landung (`git merge origin/main`) deine drei Bildziele neu: Ein Teil von Himmel-Halmen, Weg-Gras und Ton kann am unfertigen Bau gelegen haben. Miss deine Bilder dann gegen den neuen main.

## 08.11. 19:04 — w24-wiese-ferne: ABGABE 9f13b2377880979ef4ad0fcc20221bf61585909a

## 08.11. 19:14 — GPU-PROBE 9f13b237 auf omen-gtx1060: ROT in 696 s (bild:wiese@0.5 GRÜN 54 s · bild:dorf@0.5 ROT 99 s · bild:genesis@0.5 GRÜN 48 s) → probe-post/w24-wiese-ferne/9f13b237.md

ABGABE 9f13b2377880979ef4ad0fcc20221bf61585909a — Himmel am Dorf main 338 → 0 Pixel über der Silhouette; Weg ab 20 m 0 Karten (main 43, Genesis 156); Fern-Band Luma +5,3 % / +4,9 % gegen vorher (main −17,9 % / −17,6 %); vegetation.K1#1 GRÜN (LAI 20–40 m 1,93); check · playtest:fast · sicht-arbeit · stand-takt · welt-boot GRÜN am Kopf. Den Fege-Takt fasse ich nicht an; der Ruhe-Fix (w24-rueckfall-ruhe) wird gemergt, sobald er auf main liegt. Ich warte im Wartezimmer.

## 08.11. 18:00 — Koordinator: die Welt kommt nicht zur Ruhe (nahWiese/nahStreu)

Beide GPUs messen am main 77265b04: „DIE WELT STEHT NICHT nach 702/1800 Takten: Fege-Takt nahWiese wartet, nahStreu wartet“ (Radeon mensch.K1#1 Start-Dorf, GTX wetter.K2#1 Dorf /umstellen). Die OMEN sah es schon am Zweig w22-wiese-nachzug. Ein lokaler Champion bisektiert und heilt das als w24-rueckfall-ruhe — fasse den Fege-Takt in vegetation-wiese.js NICHT parallel an; merge origin/main, sobald der Fix gelandet ist. Wenn du beim Lesen den Täter siehst, schreib ihn als FUND in deine Abgabe.

# Post an w24-wiese-ferne

## 08.11. 16:27 — GPU-PROBE c7f70e6a auf radeon-890m: NACHGEGEBEN in 1549 s (bild:wiese@0.5 GRÜN 53 s · bild:dorf@0.5 GRÜN 62 s · bild:genesis@0.5 NACHGEGEBEN 54 s) → probe-post/w24-wiese-ferne/c7f70e6a.md

## 08.11. 16:01 — GPU-PROBE 98cbfda3 auf omen-gtx1060: ROT in 1083 s (bild:wiese@0.5 GRÜN 56 s · bild:dorf@0.5 ROT 98 s · bild:genesis@0.5 GRÜN 50 s) → probe-post/w24-wiese-ferne/98cbfda3.md

## 08.11. 15:36 — GPU-PROBE fefeba7e auf omen-gtx1060: ROT in 728 s (bild:wiese@0.5 GRÜN 60 s · bild:dorf@0.5 ROT 120 s · bild:genesis@0.5 ROT 97 s) → probe-post/w24-wiese-ferne/fefeba7e.md

## 08.11. 15:19 — GPU-PROBE 249f2374 auf omen-gtx1060: ROT in 1571 s (bild:wiese@0.5 GRÜN 57 s · bild:dorf@0.5 ROT 98 s · bild:genesis@0.5 GRÜN 53 s) → probe-post/w24-wiese-ferne/249f2374.md

## 08.11. 14:52 — GPU-PROBE d3508466 auf omen-gtx1060: NACHGEGEBEN in 179 s (bild:wiese@0.5 NACHGEGEBEN 2 s · bild:dorf@0.5 NACHGEGEBEN 3 s · bild:genesis@0.5 NACHGEGEBEN 2 s) → probe-post/w24-wiese-ferne/d3508466.md

## 08.11. 14:43 — GPU-PROBE 722b35ec auf omen-gtx1060: ROT in 244 s (bild:wiese@0.5 GRÜN 52 s · bild:dorf@0.5 ROT 99 s · bild:genesis@0.5 GRÜN 58 s) → probe-post/w24-wiese-ferne/722b35ec.md

## 08.11. 14:36 — GPU-PROBE 5071550e auf omen-gtx1060: ROT in 243 s (bild:wiese@0.5 GRÜN 57 s · bild:dorf@0.5 ROT 100 s · bild:genesis@0.5 GRÜN 52 s) → probe-post/w24-wiese-ferne/5071550e.md

## 08.11. 14:09 — GPU-PROBE 54977dd9 auf radeon-890m: GRÜN in 412 s (bild:wiese@0.5 GRÜN 41 s · bild:dorf@0.5 GRÜN 46 s · bild:genesis@0.5 GRÜN 39 s) → probe-post/w24-wiese-ferne/54977dd9.md
