# leib-liest-satz-2 — Stand-Blatt (ZWISCHENSTAND)

Zweig `leib-liest-satz-2`. Basis: origin/main 64fcf12e (V18.546.430, trägt `w28-absicht-zug-4`) + `leib-liest-satz-kopf2` f768ab96
(der Kopf 1 mit dem Format des Koordinators, Post 06:33), bis er gelandet ist. Auftrag (Post 06:08): das „Offen“ von leib-liest-satz ganz,
in der Reihenfolge des Bilds — 1. der Gang des Kranken · 2. Umkleiden im Verweilen · 3. die Werk-Geste des Lehrlings.

## Kopf 1 — der Gang des Kranken (Rest von `karte2.mensch.menge.seuche#1` im Bild)

### Geschnitten — EINE Zeile für Stand und Gang

`koerper-core.js` LEIB_SATZ.krank ist EINE Zeile `{ pose, tempo }` (Lasselin et al. 2020, Tab. 1 — die Studie hat IM GEHEN gemessen):
`pose` Kopf +0,0436 rad, Knie −0,0325, Arm-Streckung −0,0262; `tempo` −0,185 m/s. Schrittlänge und Schrittzeit tragen KEINE eigene
Zahl — sie folgen aus dem Tempo im EINEN Gang-Gesetz (tetrapoda `gangSchritt`). Drei Leser derselben Zeile, kein Zwilling:

- **Der Stand** liest `pose` über `leibSatzProfil` (wie bisher, Kopf 1).
- **Der Gang** liest `pose` über `leibSatzPose(name)` in `leibRigPose` (×w über den Beinen des Gesetzes; der Stand ×(1−w) trägt
  dasselbe Delta im Profil — die Mischung trägt es ganz). `_animateHumanoidRig` reicht den Namen des Gemüts („idle/krank“) durch.
- **Das Tempo** schreibt EIN Glied `_bewohnerGang(b)`: `leibSatzTempo(tempoBand × lauf, b)` und das Band seines Gangs
  (`leibSatzBand` → `b.gangBand`) — gerufen von der Geburt und an der Kante seines Satzes (`_bewohnerGemuet`, Tag · Akt · Rolle).
  Bis hier setzte allein die Geburt `tempo = tempoBand × lauf`: der Kranke ging im Tempo des Gesunden.
- **Der ferne Leib** liest dieselbe Zeile: der Satz der Menge und die Lagen jeder Gestalt tragen `LEIB_SATZ.baender` Bänder
  ([null, „krank“]) — `_bewohnerGangPose` backt je Band seinen Gang (Tempo aus `leibSatzTempo`, Pose aus `tagesHaltung` des Satzes),
  das Feld (`_bewohnerFeldLage`) und die Instanz des Satzes (`_gangSatzInstanz`) lesen `b.gangBand`. Bis hier buk der Satz EIN Band.

### Gemessen — vorher → nachher (`gate:mensch-anatomie`, Linse `gang.krank` / `gang.fern`, Familie Bewohner; 100 Leiber, 2 Pläne)

| Maß | vorher | nachher | Lasselin 2020 (95 %) |
|---|---|---|---|
| Gang-Tempo krank ↔ gesund | 0,000 m/s | **−0,185 m/s** an 100 von 100 | −0,185 [−0,243; −0,126] |
| Doppelschritt, Erwachsene (67) | 0,000 m | **−0,082 m** (alle 100: −0,075) | −0,093 [−0,117; −0,070] |
| Zeit des Doppelschritts, Erwachsene | 0,0 ms | +99,6 ms → gemittelt mit zwei Läufen am Metronom (Δ/3) **33,2 ms** | +27,9 [13,1; 42,7] |
| Kopf im Gehen, nah | 0,00° | **+2,50°** an 100 von 100 | +2,50 [0,92; 4,08] |
| Kopf der fernen Zeile (Lagen des Felds) | 0,00° | **+2,50°** | dasselbe Band |
| Fuß der fernen Zeile (Weg je Doppelschritt) | 0,000 m | **−0,045 m** | kürzer |
| Band des Satzes gesund → krank | 0 → 0 | 0 → 1 an 100 von 100 | — |

Die Zahl „vorher“ misst derselbe Lauf an den Tätern GT1–GT3 zugleich (der Stand vor diesem Kopf). Selbsttest im Hauptlauf:
GT1 (die Geburt setzt das Tempo ohne Satz) ✅ → ROT an `gang.krank tempo` · GT2 (der Gang ohne die Pose des Satzes) ✅ → ROT an
`gang.krank kopf` · GT3 (die Gestalt backt EIN Band) ✅ → ROT an `gang.fern kopf`.

Die Wand des Könnens zog mit (gate:kreatur-takt bewohner): der Täter `bewohner-koennen` deckte die Geburt — seit dieser Kopf das
Tempo am EINEN Schreiber `_bewohnerGang` setzt (Geburt UND Kante des Satzes), schrieb die Kante das Gesetz zurück, der Täter blieb
unsichtbar (49 von 50 beim Namen). Er deckt nun `_bewohnerGang`; der Messer des Könnens liest das Gesetz samt Satz (`leibSatzTempo`
auf Bein × lauf, das Tempo des Gangs `gangTempo` statt des geliehenen im Lauf).

Kosten: die Zeilen der Ferne je Gestalt und je Satz 40 → 56 (2 Bänder × 16 Phasen + 24 Stände), 0,18 ms je Zeile (node-CPU) —
+16 Zeilen ≈ +2,9 ms einmal je Gestalt und je Satz, im Leerlauf gebacken (`_bewohnerGangBacken`, je Takt `gangJeTakt`); die
Textur des Satzes +40 % Zeilen. Auf dem Gerät misst es die Probe.

### Offen (Grund, Mess-Name)

- **Die Spur (+5 mm, Lasselin):** das Gang-Gesetz trägt keine Spurbreite je Satz — nicht modelliert. Mess-Name: `gang.krank spur`.
- **Der Deckel des Schritts:** wer schnell geht (lauf ≥ ≈ 1,1), steht gesund und krank am Deckel λ ≤ 2L·tan(0,47)/tast des
  Gang-Gesetzes — sein Doppelschritt ändert sich nicht (7 von 67 Erwachsenen, 15 von 100 gesamt), nur sein Takt. Gesetz von
  tetrapoda `gangSchritt`, nicht dieses Schnitts. Mess-Name: `gang.krank` „am Deckel des Schritts“.
- **Das Kind trabt im Gehen:** 6 von 33 gesunden Kindern gehen ihr Tempo des Tags über Fr 0,5 (lauf ≥ 1,38) — das Gang-Gesetz
  wählt den Trab; krank fallen sie in den Schritt (Doppelschritt bis −0,215 m). Darum urteilt die Linse Schritt und Zeit an den
  Erwachsenen (die Menge der Studie). Mess-Name: `gang.krank` alle ↔ Erwachsene.
- **Die Zeit ist ANGENOMMEN gemittelt:** die Studie druckt die Schrittzeit über drei Läufe, zwei davon am Metronom (76 Schritte/min,
  feste Kadenz); die Linse vergleicht Δ/3 — kein Mittel des Placebos gedruckt.
- **Der Kranke geht selten ins Bild:** krank sitzt er vor seiner Tür (`tagesPlan`), es gehen nur die Posten (Wächter, Fahrer,
  Händler: `regenfest`) — 2,7 % krank am Tag. Das Bild `stadt-voll@0.55` zeigt die Menge, der kranke Gang ist dort selten.
- **2. Umkleiden im Verweilen** und **3. die Werk-Geste des Lehrlings** folgen als Kopf 2 und 3 dieses Zweigs.

### Wände (lokal, vor dem Kopf)

| Wand | Ausgang | Zeit |
|---|---|---|
| `check:statik` (ganz) | EXIT 0 | 525 s |
| `format:check` | EXIT 0 | 17 s |
| `gate:koerper-kern` | EXIT 0, Selbsttest ✅ | 17 s |
| `gate:mensch-anatomie` | EXIT 0, GT1–GT3 ✅ | 1 071 s |
| `gate:kreatur-takt` (bewohner) | vor der Heilung EXIT 1: der Täter `bewohner-koennen` unsichtbar (49 von 50 beim Namen); geheilt am EINEN Schreiber (s. o.), die Probe `bewohner` misst nach (Kopf 2), hier richtet `[ci voll]` | 952 s |
| `gate:pruefbuehne-licht` | EXIT 0, probeUrteil GRÜN (0 rote Zeilen) | 103 s |
| `gate:studio-begehen` | EXIT 0, probeUrteil GRÜN (0 rote Zeilen) | 337 s |
| `gate:weltbild-frost:echt` | hier nicht messbar (swiftshader: device lost) | — |

### Quellen

- Lasselin J, Sundelin T, Wayne PM, Olsson MJ, Paues Göranson S, Axelsson J, Lekander M. Biological motion during inflammation in
  humans. Brain Behav Immun 2020; 84:147–153, Tab. 1 (LPS 2 ng/kg gegen Placebo, 19 Gesunde, Kinect v1 auf 5,5 m; der erste Lauf
  frei, zwei am Metronom): Tempo −0,185 [−0,243; −0,126] m/s · Doppelschritt −0,093 [−0,117; −0,070] m · Zeit +27,9 [13,1; 42,7] ms ·
  Spur +0,005 [0,002; 0,008] m · Kopf −2,50 [−4,08; −0,92]° · Arm-Streckung −1,50 [−2,15; −0,85]° · Knie +1,86 [1,04; 2,69]°.

## Status

ZWISCHENSTAND · Karte 2 gebucht 120 von 1 718 · Kopf 1 gesandt (Wände oben), Kopf 2 und 3 folgen.
