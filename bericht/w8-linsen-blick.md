# w8-linsen-blick — drei Linsen am Gesetz (Radeon 890M)

Spiel-Zweig `w8-linsen-blick` (von main 8e6262cc), pm-Zweig `w8-linsen-blick-pm` (von punkte-maschine bfde705c).

## vegetation.K1#1 — Linse falsch (das Lineal), dann Spiel-Fund
- Wurzel: `scripts/werkbank.cjs` `/bild --abstand` trug die Bänder 0·2·5·10·14·30·80·200 m (der Radius der Welt); `wieseRinge`
  (g2.js) urteilte 10–14 · 14–30 · 30–80 · 80–200 statt der festen Ringe 2–5 · 5–10 · 10–20 · 20–40 m der Staffel.
- Schnitt: die Bänder tragen 2·5·10·20·40 als Kanten (Spiel), `wieseRinge` summiert je Ring des Gesetzes, ein Ring ohne Kanten
  ist UNGEMESSEN (pm); Mutante „die Bänder des Radius" ROT beim Namen, „der Radius im Ring 10–20 m" GRÜN.
- Am main 8e6262cc (pm-Linse): 10–20 und 20–40 UNGEMESSEN beim Namen (die Bänder 0/2/5/10/14/30/80/200 tragen die festen Ringe nicht).
- Zahl (Radeon, Zweig 006ca421): LAI 2–5 2,42 · 5–10 2,24 · 10–20 1,87 · 20–40 1,07 — ROT: die Wiese dünnt jenseits 20 m aus
  (der Verlauf (14/d)^4 von w4-gras-saum), das ist ein Spiel-Fund.
- Der Verdecker „Mesh in 3,98 m" (d880c8e8, nach mensch.K4#1) war am Kopf nicht nachzustellen; die Kamera-Linse nennt einen
  Verdecker ohne Namen jetzt beim Namen seines Trägers (`_taeterKlasse`, scripts/lib/kamera-nah.cjs).

## licht.K3#1 — Linse falsch (drei Wurzeln)
- `linsenZiel` (scripts/lib/licht-linsen.cjs, seit dd2ec8f6) verbarg nach dem Haken jedes Mesh außerhalb der Wahl — auch die
  Geometrie-Arena, die die Bäume zeichnet: Gestalt 0 px (ohne den Filter 35 955 px). Schnitt: die Arena fällt nie an der Wahl
  (sie zieht nur sichtbare Glieder), die Wahl der Linse ist ein Gesetz (`bundles(waehlt)`).
- Die Schwellen der Linse (0,3/0,6) erreichten die Wahl nie: `_baumGrenzen` hielt die Grenzen des letzten Schirms
  (stamm/vegetation-streu.js `_stufenSchirm`), und die Hysterese in Metern der Wahrnehmung (3,4) hielt die Fichte aus 8 m auf L0.
  Schnitt: die Grenzen folgen den Schwellen; die Linse urteilt die Bäume 40 m um das Auge sofort am Abstand ohne Zustand.
  Beweis: das Exemplar steht im Karten-Schuss auf L2 (`fimp:atlas:L2` am Fuß, vorher L0 gegen L0 — ein falsches Grün 1,06).
- Fichte und Tanne am Exemplar nächst dem Dorf (`--ort dorf`): der kalte Gang zur Mess-Wiese trug 18,1 s im 45-s-Deckel.
- Zahl (Radeon, Zweig 006ca421, 0,58 min im 45-s-Deckel): fichte 1,047 · 0,999 · 1,061 · tanne 0,973 · 1,087 · 1,149 · ring 1 ·
  0,998 · 1 — ROT allein an tanne@0,05 (die Karte der Tanne nachts 15 % heller als ihre Gestalt): ein Spiel-Fund. Am main 8e6262cc
  bleibt sie „kein Pixel" (die Heilung liegt im Spiel-Zweig).

## licht.K2#2 — Linse falsch (die Pose), dann Spiel-Fund
- Die Kugel-Reihe lag längs zur Sonne: bei 7° Sonne lag die Scheibe der Schatten-Kugel im Sonnen-Strahl der Sonnen-Kugel
  (A/B 0,760). Schnitt: die Reihe quer zur Sonne, 2 m Abstand, das Auge auf der Seite fern der Sonne (kugel.js, Blob 2f711530).
- Der Himmel zur Sonne fand an Mess-Wiese, Genesis und Dorf keine freie Stelle am Boden (144 je Ort, Tanne/Fichte im Strahl):
  dieselben Stellen je Stufe höher (0 · 10 · 20 · 30 · 45 · 60 m), dieselbe Prüfung.
- Zahl (Radeon, main 8e6262cc mit der pm-Linse): A/B 0,760 → 1,000; Uhr 0,27 klar 1,406 · 0,73 klar 1,35 (Soll ≥ 2,5) · Regen 0,5 2,054
  (Soll ≤ 1,5) · Himmel zur Sonne 1,146 (Soll ≥ 1,2, 20 m über dem Boden) — ROT, Spiel-Funde im Licht. licht.K2#1 GRÜN 5,492 /
  0,1821 mit der neuen Reihe.
