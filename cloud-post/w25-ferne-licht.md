# Post an w25-ferne-licht

## 08.11. 22:49 — GPU-PROBE 1f8b19ed auf omen-gtx1060: ROT in 1964 s (bild:gipfel-blick@0.5 ROT 579 s · bild:wiese@0.5 GRÜN 49 s · bild:gipfel-blick@0.735 ROT 537 s) → probe-post/w25-ferne-licht/1f8b19ed.md

## 08.11. 21:40 — w25-ferne-licht: Nachtrag zur ABGABE 1f8b19ed

Die geschärfte NEUN-Seite des Zweigs w25-ferne-licht-pm (4b84b72) lief am Kopf 1f8b19ed ganz durch (swiftshader voll, Dorf, Teil B, nichts ausgelassen): ferne.K4 ohne den Schleier der Luft 0,4297 (Ls 0,0282 / Ll 0,0657, 21/64 Orte, Grat 5,33 km, Sonne 5,01°, luft 0, 30,6 s auf swiftshader) — 0,03 über dem Soll 0,4; der Rest ist der Grat-Himmel der 96-m-Karte (FUND unten).

## 08.11. 21:25 — w25-ferne-licht: ABGABE 1f8b19ed145a3a6f11cc1e2bf9adfa3492e1338e

ABGABE 1f8b19ed145a3a6f11cc1e2bf9adfa3492e1338e — Abgabe w25-ferne-licht (main 53b2fc7a im Kopf; Proben bild:gipfel-blick@0.5, bild:wiese@0.5, bild:gipfel-blick@0.735 am Kopf, dieselben drei am Vorher-Zweig w25-ferne-licht-vorher 888b476d = main-Licht + nur Linse und Decke).

Die acht Befunde von K1#2 (Radeon/GTX main) waren: 3× JE KANAL Uhr 0,27 ungemessen, 1× FARBTON 8 km 15°, 4× HIMMEL (Horizont grün, Duv +0,008 … +0,010). Sonnenseite 1,256/5,045 und fernes Weiß R/B 6,18 standen GRÜN — die Zahl der Karte nennt sie nur.

Geschnitten:
- welt-licht.js:44 `ATMO_ERDE` — Ψ_ms (Hillaire Gl. 5–9) sieht die Erde als Leuchtdichte der Welt-Albedo (Y 0,1236) ohne Buntheit; mit dem Laub (G/B 3,1) trug die Mehrfachstreuung den Horizont grün. Die untere Hälfte der Umgebung (jede nahe Spiegelung, der Film der Tore) behält ATMO_BODEN. CPU-Nachbau der Tafeln (trifft die Radeon auf 1 %): grüne Erde 107–134°, graue 215–217°.
- stamm/bild-sicht.js:699 — der Grat nimmt dem Hang die Himmels-Sicht der Atmosphäre (`himmelFarbe`, in jedem Stoff schon gebunden), nie die PMREM-Keule in Rauheit 0,5 (sie mittelte am Horizont den Boden mit); `gratRauheit` fällt.
- scripts/lib/licht-linsen.cjs:2094 `luftAufgeloest` — die Wache des Paars Rot/Blau zählt 8-bit-Stufen (≥ 12, wie der Grün-Kanal der Sicht), nie 0,05 · Blende linear; Selbsttest mit der Mutante der alten Wache ROT beim Namen.
- Zweig w25-ferne-licht-pm (4b84b72): ferne.K4 misst die Hänge ohne den Schleier der Luft (β 0, wie L0 der Luft-Linse). Die In-Streuung liegt gleich auf Licht- und Schattenhang (mit Luft 0,0355 / 0,0323, ohne 0,0171 / 0,0108), je N·L geteilt trägt sie allein das Verhältnis der N·L der Orte 0,29 / 0,41 = 0,71 — die Linse urteilte über die Luft (K1/K2), nie über den Grat. Mutante „durch den Schleier gemessen" ROT, `punkte.cjs selbsttest --ohne 3c` 162/162 GRÜN. Die NEUN-Seite ändert ihren Abdruck (die neun Stationen sind durch stamm/bild-* ohnehin neu zu messen).

Gemessen (swiftshader, das Urteil der Station über `werkbank licht --luft`):
- ferne.K1#2: 9 → 4 Befunde. JE KANAL Uhr 0,27 Azimut 90/180/270: ungemessen (0 Paare) → Δβ blau−rot 1,03 / 0,98 / 0,97 × Referenz (1 077 / 755 / 790 Paare); HIMMEL 4 → 0 (Ton 101–125° → 210–216°, Soll 222 ± 15); FARBTON 2 → 4 Azimute (10,5–16,4° → 14,7–25,7°).
- ferne.K1#1 T/T_soll 0,89–1,00 · ferne.K2#1 Restkontrast 0,6–1,4 % · K2-2 GRÜN — gehalten.
- ferne.K4 (swiftshader voll, Dorf, Sonne 5°, 21/64 Orte): mit Luft 0,629 → 0,622 (Radeon main 0,6352), ohne Luft 0,468 → 0,444 (Zerlegungs-Sonde; die geschärfte Station selbst 0,4297, Nachtrag); der Grat nimmt dem Schattenhang 3,6 → 6,2 % seines Himmels.
- Physik (CPU-Nachbau Hillaire je Probe): der 5,7-km-Weg aus 1 500 m trägt In-Streuung 0,0037 E0 (das Bild 0,0023) — durch die Luft der Referenz (Koschmieder 20 km) erreicht kein richtiges Bild 0,4.

Wände am Kopf GRÜN: check · lint · format:check · playtest:fast (21 ✅ · 0 ❌) · gate:welt-boot · gate:post-kette (kein [ERROR] STOFF) · gate:ego-schatten · gate:schatten-terminator · gate:betriebsgesetz (scripts +204 → −41 Atome: die `lin`-Tafeln und `Y`-Namen der Licht-Linsen waren Zwillinge von srgbLin/luma709, dazu Gleichschritte).

Ehrlich offen:
- FARBTON 8 km 15–26° — FUND stamm/daten.js:614 `WIESEN_GRUND` / stamm/gelaende-chunks.js:3214 `FERN_FARBE` · Wurzel: die Wiese der Ferne trägt keine Selbstbeschattung des Halm-Bestands (nur die Krone, `kronenSchatten` 0,32 auf Satelliten-Band), ohne Luft 0,75 der In-Streuung statt ~0,4 — gegen den nun blauen Horizont zeigt ihr Grün durch · ferne.K1#2 FARBTON · L (Nah-Fern-Naht, Soll-Tafel boden-nah).
- ferne.K4 ohne Luft 0,43 > 0,4 — FUND stamm/dirigent-ankunft.js:1797 `HORIZONT_KARTE` (`zelleM` 96 m) · Wurzel: die Karte liest nahe Grate (60–240 m vor dem Hang) bis 10° zu flach (Grat des Gesetzes 10,3° → Karte 8,1° im Median), der Abzug des Himmels 6,2 % statt 18,5 % (Nachbau, Band ±30°) — mit ihm ergäbe der Nachbau 0,38 · ferne.K4#1 · M.
- ferne.K1#2: 7 von 8 Befunden der Karte heil, FARBTON wuchs von 1 auf 4 Azimute; ferne.K4#1 nicht GRÜN.

Maßstab: Hillaire 2020 (Ψ_ms über einer grauen Erde wie Bruneton 2017), die CIE-Tageslicht-Ortskurve (Judd, MacAdam, Wyszecki 1964), Horizon-Based AO aus der Himmels-Sicht der Atmosphäre (UE5 SkyAtmosphere liest die Sky-View-LUT).

Ich warte im Wartezimmer.

## 22:55 Koordinator
ABGABE 1f8b19ed ist angenommen und fährt in **z330**. Das Wiesenbild habe ich gegen dein Vorher (888b476d) gelegt: praktisch gleich, Luma 55,1 → 54,6, kein Rückfall in der Nähe. Das Gipfel-Bild riss auf der GTX den Deckel von 480 s (579 bzw. 537 s), beide Male ohne Bild. Den Horizont misst darum nach der Landung die Station ferne.K1#1/#2 auf der Radeon.
**Nächster Auftrag im selben Faden (`w25-ferne-licht-2` vom Kopf 1f8b19ed):** deine beiden offenen Punkte, FARBTON 8 km 15–26° und ferne.K4 > 0,4. Dazu der Gipfel-Blick als Bild: Benenne, warum er auf der GTX über 480 s braucht. Ist es der Bau der Ferne bis zum Gipfel? Die Linse muss in ≤ 3 min ein Bild liefern. Richter ferne.K1#2 und ferne.K4, Bild `[gpu-probe: bild:gipfel-blick@0.5]`.
