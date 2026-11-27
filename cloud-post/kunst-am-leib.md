# Stand-Blatt kunst-am-leib (Bahn der Welle 27.11., Sprosse `karte2.mensch.sport.kunst#1`) — ZWISCHENSTAND

## Kopf 2 (Post des Koordinators 13:51: S1 ROT 2 von 3 an der OMEN, der Kampf-Meister der Stadt ist eine Wache)

Täter am Kopf 1: `tagesHaltung` gab jeder Rolle mit `haltung: false` (Wache · Nachtwache · Fahrer · Nachtfahrer) in JEDEM Akt null — der
Kunst-Zweig danach sprang über, der Leib der Wache im Zweikampf trug weder Name noch Tun. Dazu stand der Hieb der Wache (ihr Zweikampf mit
dem Täter) ohne Haltung und ohne Kunst. Schnitt (koerper-core, die EINE Stelle): die Rolle ohne Haltung steht an ihrem WERK neutral (der
Akt der Kunst „haupt“: arbeit · jagd · fischfang); eine BENANNTE Kunst (Zweikampf, Brett, Hieb) hängt nicht an diesem Tor — ihr Leib
trägt sie wie jeder. `TAGES_GESETZ.haltung.hieb = "fight"`, `LEIB_SATZ.kunst.hieb = "kampf"`; die Namen des Satzes bleiben 18.

Am Ort (Sonde `kunst-wache`: der Stations-Rumpf KUNST — der Kandidat 2 der OMEN, derselbe Rumpf — im Wirt `grundWirt`, eine Stadt, deren
Kampf-Meister (Können 1,2) eine Wache ist; Meister ↔ Anfänger, 3 Zyklen à 30 Hz):

| Kunst | vorher (Kopf 1) Züge · CV | nachher (Kopf 2) Züge · CV |
|---|---|---|
| Handwerk | 23 ↔ 11 · 0,0507 ↔ 0,1492 | 23 ↔ 11 · 0,0507 ↔ 0,1492 |
| Kampf (Meister = Wache) | **0** ↔ 12 · 0 ↔ 0,1527 (der Wert der OMEN) | **18 ↔ 12** (50 ↔ 33,3 /min) · 0,0500 ↔ 0,1527 |
| Brett | 23 ↔ 11 · 0,0507 ↔ 0,1492 | 23 ↔ 11 · 0,0507 ↔ 0,1492 |

Teile 1 ↔ 2 und Hüfte 7,07 ↔ 14,35 mrad in allen drei; mit dem Fahrer als Kampf-Meister dieselben Zahlen. Gegenlauf (Sonde `posten`,
tagesHaltung Kopf 1 ↔ Kopf 2 über 14 Rollen × 19 Akte × 4 Sätze = 1 064 Fälle): anders NUR hieb (56, jede Rolle), zweikampf (16) und brett
(16, je die 4 Rollen ohne Haltung) — die Wache am Posten (arbeit), auf der Streife und in jedem anderen Akt byte-gleich.

Linse L7 (gate:koerper-kern) wächst um die Klasse: je Kunst auch der Hieb, und jede Rolle ohne Haltung in Zweikampf, Brett und Hieb
(16 Fälle), dazu „die Rolle ohne Haltung steht am Werk neutral“ (4 Rollen × Können × krank). Vorher ROT an Kopf 1: 13 von 16 Fällen
„null ↔ null: Züge 0 ↔ 0“; nachher 16 von 16 trennen (Kampf 18 ↔ 12 · CV 0,050 ↔ 0,153), 0 am Werk nicht neutral. Selbsttest
„kunstAmTor“ (die Kunst hängt am Tor der Rolle, der Stand von Kopf 1) → ROT an L7 (✅), „leibOhneKunst“ → ROT an L7 (✅).

GPU-Probe Kopf 1 (918ffa21, GTX 1050): GRÜN — gate:stand-takt 521 s · gate:mensch-zuege 51 s · bild:dorf@0.5 248 s (ABNAHME GRÜN) ·
gate:webgl-probe 160 s. Das Bild selbst gesehen: das Dorf am Mittag, die Bewohner stehen und gehen, keine gebrochene Pose — es zeigt
kein Paar Meister ↔ Anfänger nah, beweist also das Nicht-Brechen, nicht das Trennen. Vor-Richter OMEN (GTX 1060, stadt-voll) an Kopf 1:
S1 2 von 3 (Kampf-Meister 0 Züge) — der Bruch, den Kopf 2 schneidet.

## Kopf 1 — Geschnitten (koerper-core.js, EIN Gesetz am Chokepoint)

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
