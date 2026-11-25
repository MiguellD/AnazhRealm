# Vorprüfung markt-klang — Markt der Metropole: das Getümmel

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 108 von 1 718 (der Stand der Karte im Zweig
`punkte-maschine`, 37a8dd0; diese Abgabe bucht keine Sprosse — gebucht wird erst, wenn der Richter sie grün misst).

**Geschnitten:** Der Markt klingt aus seiner MENGE: jeder Bewohner in Hörweite, dessen Akt redet, ist ein Sprecher im
Wechsel von Rede und Pause (ITU-T P.59), seine Rede ein Laut SEINES Leibs, sein Pegel das Stimm-Gesetz + Stufe + Lombard am
Sprecher — EIN Gesetz `klang:MENGE` für jeden Hörort, der Markt ist Eichung; kein Laut der Menge duckt mehr die Musik (die
Wurzel der gesenkten Musik), der Duck bleibt das EINE Gesetz `MUSIK.duck` (tiefstes Glied 10 dB). **Gemessen:** 10 min am
Abgriff des Mischers: Stimmen zugleich P50 4 → 10, L_Aeq 37,9 → 64,1 dB(A), Spitze −9,6 → −1,1 dBFS, Musik gesenkt 63,2 % →
12,5 % der Zeit, Duck am Bus 10,00 dB in 30 von 30 Proben. **Ehrlich offen:** die Station hört an der Wiese im Regen nur den
Graphen und liest den Duck an einer verrauschten Linie (Kandidat unter `cloud-post/markt-klang-station/`, Sache des
Richters), dazu die Zeilen unten.

Basis: main e1a54023, vor der Abgabe main 804ca10c hineingeholt (Vorlauf); `git merge-tree --write-tree origin/main HEAD` gibt eine Zeile.

## Was die Station liest (wörtlich, `meisterkarte-quelle/punkte/stationen/k2-erleben.js` im Zweig `punkte-maschine`, Leiter `erleben.klang.getuemmel`)

- **Leser:** `getuemmelSeite(o)` im Lauf `getuemmelLauf`, Sprosse 1 (`L.je(1, …)`).
- **Hörort:** `L.ort("wiese", "ego")`, Wetter `"rainy"`, Hördauer `sek = Math.max(6, Math.min(14, L.rest() - 10))`.
- **Messfunktion:** je 40 ms die Spitze am Ausgang der Spitzen-Wand (`s.spitze.ausgang`) und die Stimmen des Graphen
  (`umwelt.graph.zensus`, an); nach `vorMs = sek · 300` ruft sie `r._musikDuck("gespraech", 30)` und liest 300 ms später
  `duck = G.duck.l0 − G.duck.l1`: die Linie eines 15-kHz-Mess-Tons am Ausgang des Duck-Busses vor gegen nach der Stimme;
  `erzeugt = G.stimmenMax`; `dauer_min = G.ms / 60000`.
- **Soll (feld richter):** `spitze_dbfs ≤ 0` und `dauer_min ≥ 10` („Spitzen ≤ 0 dBFS über 10 min“) · `duck_db ≥ 8` und
  `duck_db_bis ≤ 12` („Duck 8–12 dB bei Stimme“).
- **Umfang:** verlangt 7, Einheit „Stimmen zugleich“ („7 Stimmen zugleich“).
- **Welt:** `proben ≥ 50` (Spitzen-Proben am Ausgang der Wand) · `duck_wechsel_db ≥ 1`.

Der Zensus vom 25.11. maß dort 13,27 dB Duck. Die Linie trägt die Musik selbst (ihre Höhen auf der 15-kHz-Linie): am Markt las
sie bei einer EXAKT gleichen Gain-Stufe von 10,00 dB in 30 Proben 8,46 … 11,44 dB (ein früherer Lauf 8,85 … 14,56 dB). Der
Mischer senkt höchstens 10 dB, denn `_musikDuck` nimmt das tiefste Glied von `MUSIK.duck` (schritt −9 · ruf −10 ·
gespraech −10), nie eine Summe. Die 13,27 dB sind Rauschen der Linie, kein Bruch des Mischers. Die Wurzel der GESENKTEN Musik
war eine andere: vorher duckte jeder Laut der Menge (967 von 980 Lauten), die Musik lag 63,2 % der Zeit gesenkt. Der Schnitt
nimmt den Duck aus `_bewohnerLaut`; es duckt nur noch, was zu DIR spricht.

## Gemessen — vorher ↔ nachher

Gleiche Bedingungen: stadt-voll (Haushalt), Pose `platz`, 10 Uhr, die Musik spielt, Master 0,35, null-Renderer
(swiftshader), 600 s je Lauf, je 250 ms eine Probe am Abgriff `s.spitze.ausgang` (Terz-Bänder, A-Bewertung, Spitze), dieselben
Definitionen. Vorher = main mit derselben Sonde, nachher = `node scripts/diag-klang-zensus.cjs --markt --sek 600`.

| Größe | vorher (main) | nachher (markt-klang) | Soll |
|---|---|---|---|
| Stimmen zugleich P50 (Graph + Laute im Flug + Fahrt) | 4 | **10** | ≥ 7 |
| Stimmen zugleich max | 11 | 19 | |
| Anteil der Proben mit ≥ 7 Stimmen | 22,3 % | 71,3 % | |
| L_Aeq am Ohr | 37,87 dB(A) | **64,13 dB(A)** | Markt 52,9–74,1 |
| L_eq am Abgriff | −29,75 dBFS | −16,07 dBFS | |
| Spitze über 10 min | −9,6 dBFS | **−1,1 dBFS** | ≤ 0 |
| Zeit mit gesenkter Musik | 63,2 % | **12,5 %** | |
| Laute, die die Musik senken | 967 von 980 (Menge) | 0 von 5 017 (Menge); nur die 30 Proben-Rufe `gespraech` | 0 |
| Duck am Bus bei Stimme | 0,18 … 11,72 dB (10 Proben, Linie) | **10,00 dB** in 30 von 30 (Linie 8,46 … 11,44) | 8–12 |
| Sprecher zugleich P50 | — | 47 | |
| Lärm am Sprecher P50 | — | 64 dB(A) | |
| Lombard P50 / max | — | 7,72 / 9,84 dB | |
| Rede-Laute | — | 4 904 in 600 s (8,2 je s) | |

Bild: `cloud-post/markt-klang-bild/markt-10min-vorher-nachher.png` zeigt die Terz-Bänder über 10 min, darunter die Stimmen
zugleich gegen das Soll 7 und die Zeit, in der die Musik gesenkt ist. Vorher eine dünne Folge von Einzel-Lauten und fast
durchgehend gesenkte Musik; nachher das breite Sprach-Band der Menge (250 Hz … 4 kHz) und nur die Proben-Rufe als Duck.

## Die Linse — Wand Mk in `gate:klang-zensus`

`scripts/diag-klang-zensus.cjs` (die Klang-Familie, CI-Schritt „Die Klang-Linse“, ohne neuen Schritt) hört nach dem Zensus
auf FRISCHER Seite (die Zensus-Bühne friert den Tag) den Markt von stadt-voll und urteilt: Menge stumm (Sprecher P50 > 0 und
Rede-Anteil ≥ Soll/2) · Stimmen zugleich P50 ≥ 7 · L_Aeq im Markt-Band · Spitze ≤ 0 · jedes Glied von `MUSIK.duck` ≥ −12 ·
Duck am Bus 8–12 · kein Laut der Menge duckt · Lombard an, wo der Lärm am Sprecher über 48,3 dB(A) liegt. Der Selbsttest
mutiert und nennt den Täter beim Namen: S24 „Mk Duck 13.27 dB“ (das Gesetz auf −13,27) · S25 „Mk Menge stumm“ · S26 „Mk die
Menge duckt die Musik“ · S27 „Mk Lombard aus“. Lokal: `--markt --selftest` 3 min 01 s, das ganze Gate 7 min 53 s, beide EXIT 0.

## Das Gesetz (`klang-core.js`, additiv)

`MENGE.gespraechM` 1 m und `mengeLaerm(quelleDbA)`: der Lärm am Sprecher aus der Rede der anderen in der Scheibe
(I = Σ I_i(1 m) · 2·ln(H / r0) / H², H = Hörweite 30 m, r0 = 1 m). `rufPegel` nimmt die Anstrengung, `stimmPuffer` die Silben
(Vorgabe byte-gleich). Der Stamm (`_bewohnerLautTakt`) rechnet den Lombard am Sprecher, nie am Ohr des Spielers (das war die
Selbst-Rückkopplung des ersten Schnitts).

Quellen mit Zahl: ITU-T P.59 (1993): Rede 1,004 s, Pause 1,587 s · Forum Acusticum 2025, Beitrag 654: normale Rede 60 dB(A) in
1 m · Acoustics Today, Jan. 2007, S. 31: laute Rede 74 dB(A) · Bottalico et al., JASA 2016: Lombard ab 48,3 dB(A), 0,5 dB je dB
· Gök Tokgöz, Fiebig & Altinsoy 2023 (DOI 10.61782/fa.2023.0983): Märkte 52,9–74,1 dB(A).

## Ehrlich offen

- **Die Sprosse ist nicht gebucht.** Die Station hört die Wiese im Regen, zählt nur den Graphen (`stimmenMax`), liest den Duck
  an der Linie, und 10 min übersteigen den Deckel einer Leiter (60 s). Der Kandidat
  `cloud-post/markt-klang-station/getuemmel-s1.js` ändert nur den Leser (Hörort Markt, Laute im Flug, P50, Gain des Busses).
  Ob die Station ihn übernimmt und wie die 10 min gehört werden, entscheidet der Richter (Regel 7: Soll und Richter-Text
  unverändert).
- **Die Mittags-Senke:** von Minute 4 bis 7,5 (Uhr ≈ 11:40–13:00) fallen die Sprecher von ≈ 64 auf 2–3 und die Stimmen
  zugleich auf 3–6. Die Bewohner verlassen den Platz oder ihr Akt redet nicht; die Ursache ist ungeprüft. Darum liegen
  „≥ 7 Stimmen“ in 71,3 % der Zeit und nicht in 100 %.
- **Der Deckel von 7 Graph-Stimmen** lässt am Ohr ≈ 25–28 % der Energie der Menge fallen (Rest P50 0,25–0,28).
- **Lombard in der Scheibe:** eine gleichmäßige Scheibe statt der echten Lagen der Sprecher.
- **Die Kosten der Rede-Synthese** (8,2 Laute je s, je Laut ein Puffer aus `stimmPuffer`) sind auf echten Geräten ungemessen;
  an echter GPU ungemessen.
- **Die Zeit des Gates:** `gate:klang-zensus` braucht lokal 7 min 53 s (CI vorher 273 s für den Zensus allein). Das liegt nahe
  an der Probe-Frist von 480 s.
- **Sprossen 2–6** sind unberührt; ihre Station meldet weiter „Leser fehlt“ oder „Umfang“.
