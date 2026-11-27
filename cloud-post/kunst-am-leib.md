# Stand-Blatt kunst-am-leib (Bahn der Welle 27.11., Sprosse `karte2.mensch.sport.kunst#1`) — ZWISCHENSTAND

## Geschnitten (koerper-core.js, EIN Gesetz am Chokepoint)

`LEIB_SATZ.koennen` + `leibKunst(k)`: das Können k ∈ [0, 1] der geübten Kunst formt die Größen der Bewegung — Takt, Streuung der
Periode (Baer 2013: CV 2,5 % ↔ 5,8 %) und des Endpunkts (Nasu 2014: ×3,05), Teilbewegungen/Nachkorrektur (Meyer 1988),
Steife (Vereijken 1992: Freiheitsgrade eingefroren — Schulter −60 %, Kopf +0,16 rad, Ellbogen +0,3 rad) und Schwanken (Lin 2019: ×2,03).
Die Stufe trägt drei Wörter (lehrling < 0,5 · geselle < 1 · meister), jeder Akt einer Kunst trägt sein Wort im Namen; der Leib liest es
über die EINE Naht (`tagesHaltung` → Name → `leibSatzProfil` · `leibStandTun` → `_animateHumanoidRig`). Der Zweikampf stößt aus der
Deckung (`STAND.kunstTun.fight`: vorher 0 Züge). Deterministisch aus Zahl und Seite des Zugs; kein Math.random, kein Flag, kein Zwilling.

## Gemessen (headless, Wirt `grundWirt`, Sonde `kunst-spur`: 5 Zyklen à 7,2 s, 30 Hz, Mann 1,80 m; Meister 1,05 · Geselle 0,75 · Lehrling 0,3)

| Kunst | Stufe | Name | Züge/min | CV Periode | CV Ausschlag | Teile je Zug | log₁₀ Ruck (dimensionslos) | Schwanken (Hüfte → Kopf, cm) |
|---|---|---|---|---|---|---|---|---|
| Handwerk vorher | Meister | pwalk | 65 | 0 % | 24,7 % | 1 | 3,82 | 1,17 |
| Handwerk vorher | Lehrling | pwalk/lehrling | 31,7 | 0 % | 26,2 % | 1 | 3,88 | 1,17 |
| Handwerk | Meister | pwalk/meister | 65 | 2,8 % | 4,8 % | 1 | 3,84 | 1,17 |
| Handwerk | Geselle | pwalk/geselle | 48,3 | 5,3 % | 14,9 % | 1,31 | 4,38 | 1,78 |
| Handwerk | Lehrling | pwalk/lehrling | 31,7 | 5,2 % | 14,6 % | 2 | 5,61 | 2,38 |
| Kampf vorher | beide | fight · fight/lehrling | 0 | — | — | — | — | 1,17 |
| Kampf | Meister | fight/meister | 50 | 3,1 % | 3,6 % | 1 | 3,43 | 1,17 |
| Kampf | Geselle | fight/geselle | 33,3 | 6,5 % | 14,1 % | 1,25 | 4,11 | 1,78 |
| Kampf | Lehrling | fight/lehrling | 33,3 | 4,7 % | 14,1 % | 2 | 5,51 | 2,38 |
| Brett | wie Handwerk (pwalk) | | | | | | | |

Ausschlag der Hand: Meister 35,2 cm ↔ Lehrling 22,1 cm (die Steife nimmt der Schulter den Zug). Gegenlauf gleich (dieselbe Uhr, derselbe
Name, dieselbe Spur: true). Kosten je Leib (`_animateHumanoidRig`, Median 9 × 600 Rufe, ABAB): vorher 14,9 · 25,3 µs ↔ nachher 14,2 · 16,0 µs
(pwalk), Lehrling 17,3 · 16,3 ↔ 14,8 · 15,1 µs — gleich im Rauschen; die Namen des Satzes 10 → 18 (je 24 Zeilen gebacken, einmal).

## Linse (Gebot 10): gate:koerper-kern L7 „der Leib zeigt sein Können“

Leser `_bewohnerGemuet` → `_animateHumanoidRig` (Schulter mit ↔ ohne `leibStandTun`, Hüfte). Vorher ROT an main eef726c4: arbeit CV
0,261 ↔ 0,276 · Teile 1 ↔ 1 · Hüfte 7,07 ↔ 7,07 mrad; zweikampf 0 Züge. Nachher: arbeit Züge 23 ↔ 11 · CV 0,051 ↔ 0,149 · Teile 1 ↔ 2 ·
Hüfte 7,07 ↔ 14,35 mrad; zweikampf 18 ↔ 12 · 0,050 ↔ 0,153 · 1 ↔ 2 · 7,07 ↔ 14,35. Selbsttest „leibOhneKunst“ → ROT an L7 (✅).

## Prüfung lokal

check:statik ganz GRÜN (8 min; die Wachstums-Wand braucht `origin/integ-probe` im Klon) · format:check · lint (0 Fehler) · gate:koerper-kern
GRÜN · gate:mensch-anatomie GRÜN (15 min) · gate:stand-takt GRÜN · gate:mensch-zuege GRÜN — probeUrteil je Log GRÜN.

## Stations-Kandidat

`cloud-post/kunst-am-leib-station/` (k2-mensch-sport.diff · faecher.diff · BEGRUENDUNG.txt): S1 misst an einem nahen Rig der Stadt statt
`K.leser`, Fach „Meister oder Anfänger?“ (je 22 je Klasse im Wechsel, Selbsttest 15 GRÜN). Station nicht gefahren: GPU.

## Ehrlich offen

- Tanz: kein Tanz-Akt in der Welt (LEIB_SATZ.kunst nennt keinen) — `mensch.sport.kunst#3`.
- Der Blindtest ≥ 80 % am Bild urteilt erst das Blatt (GPU); ein Standbild trägt Steife und Augenblick, nicht Takt und Nachsetzen.
- CV Periode des Lehrlings 5,2 % gegen Baer 5,8 %: je Seite nur 2 Züge je Zyklus (Takt ×0,5), die Streuung normiert über 2 Intervalle.

Karte 2 gebucht 149 von 1 718 (der Stand der Karte 2 im Zweig punkte-maschine am 27.11.). Status ZWISCHENSTAND.
