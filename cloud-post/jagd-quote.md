# jagd-quote — Stand-Blatt (GTX 1050, Kopf 2, 26.11.)

**Der Täter der Quote (Hebel-Tafel).** Kopf 2 senkte die Rudel-Quote nicht (Kopf 2 allein: 232/540 = 0,43): in der Bühne jagdkreis steht das Rudel windab, die Nase der Beute trägt dort nichts. Gesucht war darum der Hebel, der die Quote trägt. Je Hebel EIN Wert daneben, 240 verschiedene Jagden der Szene rudel (o 0–79 · 80–159 · 160–239: dieselben 60 Orte, andere Stellung des Rudels):

| Hebel (EIN Wert daneben) | Rudel-Quote | n |
|---|---|---|
| grund (Kopf 2) | 111/240 = 0,46 | 240 |
| Sprint der Beute × 1,1 | 16/240 = 0,07 | 240 |
| Biss je Treffer × 0,75 | 24/240 = 0,10 | 240 |
| pirschSichtM 5 → 15 m | 1/240 = 0,004 | 240 |
| dauerS 45 → 30 s | 26/80 = 0,33 | 80 |
| wundExp 0,9 → 0,8 | 23/80 = 0,29 | 80 |
| **Aufgabe-Strecke 237 m (Wikenros et al. 2009)** | **75/240 = 0,31** | 240 |

- Die Jagd währte fest 45 s (JAGD_GESETZ.dauerS), ohne Quelle. Die Hälfte der Jagden endete erschöpft (129 von 240), die übrigen im Riss.
- Tempo, Biss und Pirsch sind Messer-Kanten: ein Zehntel daneben, und die Quote fällt unter das Band. Sie scheiden aus.
- Eine Ausdauer der Beute und „der Gesunde stellt sich“ trägt das Gesetz nicht.
- Die Saat der Kreaturen (`_creatureNetSeq`) ändert die Jagden nicht: in EINER Seite wiederholt sich die Bühne bit-gleich. Die Stichproben sind darum verschiedene Jagden, nie verschiedene Saaten.

**Geschnitten (Kopf 2).**

1. **Die Aufgabe ist eine Strecke** (tetrapoda-core.js JAGD_GESETZ.aufgabeM 237 + `jagdDauerS`; stamm/kreatur-verhalten.js `_kreaturJagdEndet` an der Hüfte des Jägers).
   - Der Jäger gibt auf, wenn die Jagd so lange währt, wie sein Sprint für 237 m braucht.
   - Die Quelle: die Hetze der Wölfe misst in der Schnee-Spur im Mittel 237 m auf das Reh (64 Angriffe) und 76 m auf den Elch (252 Angriffe). Die Autoren lesen darin Größe und Wachsamkeit der Beute (Wikenros et al. 2009, Acta Theriol. 54:207). Der Hirsch der Welt flieht wie das Reh.
   - Der Wolf (Sprint 7,5 m/s) gibt nach 31,6 s auf statt nach 45 s, jeder andere Jäger nach seinem eigenen Sprint.
   - Die Bühne jagdkreis liest das Gesetz: sie sieht bis zur längsten Dauer des Rudels + 5 s. Ihr Band bleibt 0,2–0,4.
2. **Die Fahne trägt ihre Laufzeit** (stamm/koerper-seele.js `_scentSpur`, `_duftSpurSchreiben`, SCENT.spurTaktS 1 · spurN 128).
   - Jeder Leib schreibt im Takt der Kreaturen seine Spur (stamm/kreatur-verhalten.js).
   - Eine Quelle mit Spur riecht man nur dort, wo ihre Front schon angekommen ist: r ≤ v·τ, mit derselben Front v = u·cosθ + q wie die Fahne.
   - Eine Quelle, die lange stand, ist byte-gleich die alte Fahne. Ein eben gesetzter Jäger riecht noch niemand.
   - In Windstille läuft die Front mit dem Mäander σ0 0,5 m/s (Hanna 1990): 20 m in 40 s.
   - Bis Kopf 1 roch jede Beute jeden Jäger binnen 50 m sofort: In der Bühne jagd (u = 0) flohen 18 von 18 Kitzen im ersten Takt auf 20–26 m.
3. **Gefürchtet wird nur der eigene Jäger** (stamm/kreatur-furcht.js `_creatureWarinessEigen`, Auge wie Nase).
   - Der Gate ist `_kreaturIstBeute(j, tier)`: gleiche Gehege, Masse ≤ beuteMasse × Jäger.
   - In der Bühne mahl floh der Bär (335 kg, keine Wolfsbeute) unter Kopf 1 auf 28 m vor dem Rudel, der Fuchs auf 27,7 m.

**Gemessen** (headless auf diesem Rechner, gate:kreatur-takt):

| Bühne | main 2da17e2e | Kopf 1 0c9b8df3 | Kopf 2 |
|---|---|---|---|
| jagdkreis: Rudel-Quote (Band 0,2–0,4) | 113/240 = 0,47 | 349/890 = 0,39 | **78/240 = 0,325** (19 · 30 · 29 je 80) |
| jagdkreis: einWolf (Band 0–0,1) · kitz (Band 0,6–1) | | | 0/19 · 20/20 |
| jagd: Risse im Nah-Kreis | 4 | 0 | 4 |
| jagd: hetzFrames | 19 767 | 6 208 | 17 201 |
| jagd: Fluchten im ersten Takt | 0 von 18 | 18 von 18 (Nase, 20–26 m) | 0 von 18 |
| mahl: Fuchs kommt | 18,5 s | flieht auf 27,7 m | 18,3 s (frisst 43,0 s) |
| mahl: Bär kommt | 15,9 s | flieht auf 28 m | 15,8 s (frisst 35,7 s) |

- Selbsttest der Linse an jagd, mahl, witterung, rudel: Täter 16 von 16 rot beim Namen, Grund 4 von 4 grün.
- kaskade unter dem GPU-Schloss grün: p95 3,66 ms je Takt (Soll ≤ 5,8), Gau 1,5 ms (Soll ≤ 2); das Rot 7,15 ms war die Last daneben.

**Die Linse „beute“** (Bühne witterung) fragt das Gesetz ohne Takt, jetzt mit Laufzeit. Ein eben gesetzter Wolf 30 m luvwärts ist ungemerkt, seine Front braucht 8,4 s bei 4 m/s. Mit seiner Spur aus 1,5·r/v ist er gemerkt. Windab bleibt er ungemerkt.

Täter, die sie beim Namen ROT macht (Selbsttest 4 von 4):
- beute-ohne-nase
- fahne-ohne-laufzeit
- witterung-sockel (die Suche gegen den Wind)
- witterung-allein (das Rudel jagt nicht als eines)

**Offen.**
- Die Aufgabe ist eine Uhr der Strecke, nicht ihr Weg: die Pirsch zwischen den Hetzen zählt mit. Eine Beute, die sich stellt (Elch, 76 m), und ihre Ausdauer trägt das Gesetz nicht.
- Die Nase des Jägers und der Aas-Leser lesen ihre Quellen noch ohne Spur, also im Gleichgewicht. Der Schnitt trägt die Laufzeit dort, wo die Beute den Jäger merkt.
- **erleben.kopplung.wahrnehmung#2 trägt Kopf 2 nicht mit** (die Station im Zweig punkte-maschine, `KITZ_AN`: 5 Orte × 3 Läufe × 300 Schritte, das Kitz allein mit dem Spieler).
  - Die Fahne fragt den Wind (`_rauchWindAt` → `_windAt`) nur je Jäger in der Fluchtdistanz. Allein mit dem Spieler riecht das Kitz nichts.
  - Den Menschen liest es nur mit dem Auge (stamm/kreatur-furcht.js `_creatureWarinessSpieler`, `_kreaturSiehtM`). Der Spieler als Quelle der Fahne fehlt: dieselbe Wurzel, eine fehlende Zeile.
  - Die Station selbst misst ihr Soll ueberlebenFaktor ≥ 1,5 nicht. Ihr `roh[2].werte` trägt nur lageWindM.
- karte2.erleben.sinne.geruch#1 ist an diesem Kopf an der Station nicht gemessen.
- Die Rudel-Quote an 80 Jagden trägt σ ≈ 0,05 (die Stücke 0,24 · 0,375 · 0,36); das Urteil steht an 240.
