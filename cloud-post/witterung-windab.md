# Vorprüfung witterung-windab — die Witterung ist eine Fahne windab der Quelle

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 105 von 1 718 (die Stand-Datei der Karte 2 im Zweig
`punkte-maschine` 0108404). Die Abgabe beansprucht `karte2.erleben.sinne.geruch#1`, buchen kann sie nur die Station.

**Geschnitten:** `_scentAt` (stamm/koerper-seele.js:1624) ist das Gesetz einer Fahne im Wind der EINEN Quelle (`_rauchWindAt`
→ `_windAt`, in Nasen-Höhe 1 m). σ = √(σ0² + (i·u)²), q = √(σ² − u²·sin²θ), v = u·cosθ + q; die Witterung ist
q/σ · exp(−(r/80 m)·σ/v), und sie ist 0, wo q² ≤ 0 oder v ≤ 0. Bei Windstille ergibt das exp(−r/80) exakt, wie bisher. Gegen
den Wind ist sie 0 ab u > 0,51 m/s. Quer zum Wind fällt sie bis zum Rand des Kegels (asin σ/u). Windab reicht sie
R·(1 + u/σ) weit und sättigt bei 334 m. Die Nase `_scentNase` (:1662) setzt die Schwelle exp(−50/80) = 0,535: ohne Wind sind
das genau 50 m im Kreis, wie bisher. Kein Flag, kein Zwilling; Rest-Sockel und Richtungs-Faktor fallen ganz.
**Gemessen:** Station geruch#1 (ihr Lauf wörtlich, headless an der Wiese, 4,5 m/s): `suchzeit_faktor_wind` **1,0 → 3,2**
(Deckel), `faktor_aus` 3,2 → 3,2. Linse witterung (4 m/s): Suchzeit gegen den Wind 1,0× → ≥ 6,9×. Die Jäger-Frage kostet
15,4 µs (main 2,1–5,4 µs; die Fahne vor ihren zwei Kosten-Schnitten 69 µs).
**Ehrlich offen:** die Quer-Suche (Casting) ist nicht gebaut. Das Welt-Bild auf echter GPU fehlt. Die Beute flieht weiter nur
auf Sicht. Das Rudel kann auf dem Ring kreisen (`rudelPlatz` im Kern, unten).

Basis: main e1a54023; vor dem Kopf main 804ca10c und f63a69ef hineingemergt (sie berühren keine Datei der Bahn; `git
merge-tree` eine Zeile).

## Zahlen vorher ↔ nachher

Alle Zeilen: Null-Renderer, dieselbe Bühne. „vorher“ ist main e1a54023 bzw. das Gesetz von main als Leihe in derselben Seite.

| Größe | main | witterung-windab | Ort |
| --- | --- | --- | --- |
| **Station geruch#1** `suchzeit_faktor_wind` (Wolf 40 m windab, `_windAt` gedreht) | **1,0** (12,6 s ↔ 12,6 s) | **3,2** (Deckel, kein Fund in 40,4 s, nächster Abstand 37,9 m) | `jagdSeite` der Station, Wiese, Wind 4,5 m/s (Nase 3,24) |
| Station geruch#1 `suchzeit_faktor_aus` | 3,2 | 3,2 | dieselbe |
| Station: Suchzeit mit Witterung | 12,63 s · 33,8 m | 12,63 s · 33,8 m | dieselbe |
| Windstille: Abweichung von exp(−r/80), 4 Richtungen × 10 · 40 · 80 m | 0,53 | 0 | Linse witterung, `gesetz.ruhe` |
| gegen den Wind in 10 · 40 m, bei 2 · 4 · 8 m/s | 0,353 · 0,243 (Rest-Sockel) | 0 · 0 | `gesetz.gegen` |
| quer in 20 m bei 4 m/s, 0 · 5 · 10 · 20 · 45 · 90° | 0,779 · 0,777 · 0,772 · 0,751 · 0,642 · 0,312 | 0,952 · 0,890 · 0,675 · 0 · 0 · 0 | `gesetz.quer` |
| Reichweite windab bis zur Kante, 0 · 2 · 4 · 8 · 16 m/s | 50 · 50 · 50 · 50 · 50 m | 50 · 178 · 252 · 304 · 325 m (Deckel 334) | `gesetz.reich` |
| Suche Wolf → Reh 40 m, 4 m/s: windab · quer+ · gegen · quer− (Fund ≤ 8 m) | 13,1 · 13,1 · 13,1 · 13,3 s | 13,1 s · — · — · — (90 s ohne Fund) | `suche` |
| Weg windab · Anteil quer | 34,8 m · 0,18 | 34,8 m · 0,18 (gerade) | `suche.windab` |
| Faktor Suchzeit gegen ↔ windab | 1,0 | ≥ 6,9 | Urteil ≥ 3 |
| Rudel: der Wolf 20 m quer, ohne eigene Witterung | — | jagt mit im selben Takt (0,02 s) | `rudel` (neu) |

## Die Leser, deren Verhalten sich ändert

`_scentAt` hat genau zwei Leser, beide über dieselbe Nase `_scentNase`:

1. **Die Jagd** `_creatureScentHuntDir` (stamm/kreatur-verhalten.js:192). Gefunden wird nur, was die Schwelle trägt. Die Weite
   ist bei Windstille 50 m, windab bei 2 · 4 · 8 · 16 m/s 178 · 252 · 304 · 325 m, gegen den Wind 0 und quer zum Wind 0 außerhalb
   des Kegels (vorher 50 m von jeder Seite). Zwei Hände kamen dazu, beide ohne eigenes Feld:
   - **Das Auge hält** `_kreaturHaelt` (:353). Eine Beute, die der Jäger schon hat, behält er, solange sie in 50 m und in
     seinem Blick liegt (`_kreaturSiehtM`). Ohne sie verlor das Rudel auf dem Ring gegen den Wind seine Beute.
   - **Das Rudel jagt als eines** (:236). Wer nichts wittert, jagt die Beute eines Glieds seines Verbands mit, sobald er sie
     hält. Band: die Quote je Jagd des Rudels (MacNulty 2012).
   - Gemessen in der Familie gate:kreatur-takt:
     - jagdkreis: Rudel-Quote 13/60 → 16–24/60 in neun Läufen (Band 0,2–0,4: 0,22 → 0,27–0,40), erster Riss 54 → 27–59 s,
       Einzel-Wolf 0/20 → 0/20, Kitz 20/20 → 20/20.
     - rudel: umstellt 15,8 → 20,3 s, Lücke beim Biss 76° → 75°.
     - jagd (Windstille): Risse im Nah-Kreis 2 · 3 · 2 · 3 (main, vier Läufe) → 6 · 6 · 6 (drei Läufe).
   - **Im Wind der Welt** (die Bühne von jagd in den Wind gedreht, gemessen, nicht im Tor): das Kitz flieht windauf, der Wolf
     dahinter bleibt in seiner Fahne (150 m bei 1,07 m/s an der Nase statt 50 m). Die Hetze steigt 5,5–6,5 k → 17–21 k Takte,
     die Risse fallen 70–145 m windauf, im Nah-Kreis 0–3 je Lauf. Die Probe jagd liest deshalb die Riss-Kette in der
     Windstille (ihre Bühne wie main); den Wind lesen witterung, jagdkreis, mahl und rudel.
2. **Das Aas** `_kreaturAasZug` (stamm/kreatur-verhalten.js:273) hat dieselbe Nase je kg Fleisch. Ohne Witterung hält der
   Fresser im Blick (:308):
   - den Kadaver, den er schon hat;
   - seinen eigenen Riss — die Beute der Jagd IST der Kadaver, derselbe Leib (`leichname.push(creature)`);
   - den Kadaver eines Glieds seines Verbands.

   Der erste Lauf des ganzen Tors zeigte, warum: Ein Jäger auf der Luv-Seite seines Risses wittert ihn nie. Das Rudel fraß
   0 kg in 120 s, rot nach der Lage zum Wind.

   Gemessen an mahl (die Gäste 30 m windab, 6 m zu beiden Seiten; vorher 18 m, das sind 31° neben der Achse, außerhalb des
   Kegels ab 1,1 m/s), drei Läufe: das Rudel frisst 29 · 35,3 · 35,8 kg, der Fuchs kommt nach 18,1 · 18,5 · 18,4 s, der Bär
   nach 15,9 · 16,8 · 16,7 s. main lief heute bei mahl selbst rot: die Gäste kamen nie, das Rudel fraß 50,4 kg ohne sie.

Unverändert: die Flucht der Beute liest nur den Blick, und der Spieler hat keine Nase.

## Die Kosten

Die Nase reicht windab bis 334 m statt 50 m: je Jäger-Frage stehen 54 Leiber in ihrer Weite statt ~4. Gemessen an 64
Leibern (16 Wölfe, 48 Rehe in 300 m), Null-Renderer, Median aus 7 Runden à 50 Takten, je Runde ein Takt:

| `_creatureScentHuntDir` je Frage | µs | Treffer |
| --- | --- | --- |
| Gesetz von main (Leihe in derselben Seite) | 2,1–5,4 | 0,19 |
| Fahne, Kopf 672e3a26 | 69 | 0,50 |
| Fahne + Wind je Quelle einmal je Takt + Beute-Frage nach der Witterung | **15,4** | 0,50 |

Die zwei Schnitte ändern kein Ergebnis (Treffer gleich, Tor unten). Der Wind an der Quelle (`_rauchWindAt`, 1,66 µs) trug
60 % der Frage: jeder der 16 Wölfe las ihn für jeden Leib neu. `_scentAt` liest ihn jetzt im Kreatur-Takt einmal je Quelle
(`_scentTakt` leert das Gedächtnis vor der Tier-Schleife, außerhalb des Takts liest es frisch, stamm/koerper-seele.js). Die
Beute-Frage `_kreaturIstBeute` (0,47 µs) fällt erst, wo die Witterung trägt (Lehre 25). Offen: die Frage bleibt 3–7× main,
das ist die Weite der Nase. Im Spiel stehen höchstens 20 Leiber (stamm/dirigent-kern.js:281), dort ist es nicht gemessen.

## Die Linse (gate:kreatur-takt, Probe witterung)

scripts/lib/kreatur-proben.cjs, `buehne("witterung")` mit Urteil und zwei Tätern:

- **gesetz**: die Werte von `_scentAt` im geliehenen Wind (Richtung und Tempo, `_windAt`) — Windstille, gegen, quer, Reichweite.
  Täter `witterung-sockel` (das Gesetz von main als Leihe) wird rot am Namen „gegen den Wind > 0: 0,353 …“.
- **rudel**: zwei Wölfe eines Verbands, einer 20 m windab, einer 20 m quer. Täter `witterung-allein` (der Verband teilt nichts)
  wird rot am Namen „das Rudel jagt nicht als eines: … null s“.
- **suche**: der Wolf sucht das Reh in vier Windrichtungen; das Urteil verlangt den Weg windab ≤ 1,3 × 32 m und die Suchzeit
  gegen den Wind ≥ 3×.

Selbsttest: Täter 2 von 2 rot beim Namen, Grund 1 von 1 grün. Die Bühnen von jagdkreis, mahl und rudel stehen im Wind der Welt
(das Rudel windab der Beute); jagd steht in der Windstille. Das Spielband `checkBandV18202GeruchFeld`
(scripts/playtest/koerper-seele.cjs:2884) hält dasselbe Gesetz (N3a/N3b/N5a–c).

**Das ganze Tor auf dem Stand des Kopfs** (`diag-kreatur-takt.cjs --selftest --teil=k/3`, die drei Teile parallel, Null-Renderer,
25.11. 17:08–17:30):

| Teil | Grund | Täter beim Namen | Exit |
| --- | --- | --- | --- |
| 1/3 (witterung, rudel, …; 1 009 s) | 9 von 9 | 47 von 47 | 0 |
| 2/3 (herde, mahl, …; 1 137 s) | 15 von 15 | 55 von 56 | 1 |
| 3/3 (jagd, jagdkreis, …; 778 s) | 12 von 12 | 46 von 46 | 0 |

Der eine Täter ist `herde-revier`: rot, aber nicht aus seinem Grund („Bewegung hängt am Blick: 45,9246 m“). main e1a54023
zeigt dieselbe Zahl (unten, offen). In diesem Lauf: jagdkreis Rudel 17/60, erster Riss 59 s; mahl Rudel 33,1 kg, der Fuchs
nach 19,3 s, der Bär nach 15,9 s. jagdkreis und mahl liefen dazu dreimal mit Selbsttest: grün, Täter 8 von 8, Rudel 20 · 22 ·
16 von 60. `npm run check:statik`: EXIT=0.

## Das Bild

`cloud-post/witterung-windab-bild/bahn-vorher.png` ↔ `bahn-nachher.png` zeigen dieselbe Bühne in der dritten Person: 20 m
hinter dem Start des Wolfs, 7 m über Grund, Blick zur Mitte. Der Wind ist gedreht (4 m/s, er weht vom Wolf zum Reh, der Wolf
steht also gegen den Wind), und die Perlen markieren den Wolf alle 0,1 s.

- **Vorher** (das Gesetz von main als Leihe): der Wolf findet das Reh in 12,68 s und läuft geradeaus (35,7 m).
- **Nachher**: in 13,5 s kein Fund. Der Wolf wandert 30,8 m ohne Richtung und biegt schräg vom Reh ab.

**Ehrlich: Das ist ein Ersatz-Bild und kein Welt-Schuss.** Unter swiftshader stürzt der GPU-Prozess der Werkbank beim Boot ab
(„gpu-process · Ausnahme 0xffffffff“), und `bild` hängt bis zum Deckel. Das liegt an diesem Container; die Bahn brand-feld
meldete denselben Absturz. Bahn und Gelände sind gemessen (dieselbe Bühne wie die Probe witterung, Teil suche „gegen“, Null-Welt), die
Perspektive ist in 2D gezeichnet. Das Welt-Bild auf echter GPU ist offen.

## Ehrlich offen (mit Adresse)

- **Die Quer-Suche (Casting).** Der Zensus erwartete hinter dem Schnitt eine Suche quer zum Wind. Gebaut ist sie nicht: ohne
  Witterung wandert der Wolf nach seinem Charakter (`_creatureCharacterWander`, stamm/kreatur-verhalten.js, Zweig wild), mit
  29–33 m Weg in 90 s und einem Anteil quer 0,38–0,9, aber ohne Richtung. Eine gerichtete Suche ist eine zweite Schicht des
  Verhaltens mit eigenem Band (Fährtensuche). Sie hätte den Faktor ≥ 3 gefährdet und gehört nicht in diesen Schnitt.
- **Die Flucht der Beute** liest den Geruch nicht. Das Reh windab des Wolfs wittert ihn nicht. Adresse: die Flucht in
  stamm/kreatur-verhalten.js (liest `_kreaturSiehtM`).
- **Das Rudel kann auf dem Ring kreisen.** Jagd #35 des Rudels (jagdkreis, das Rudel windab) steht in 3 von 4 Läufen 50 s
  auf dem Ring (5,7–6,3 m), ohne zu hetzen. Zwei Wölfe ballen sich (≈ 30°), die Plätze hängen am Winkel-Mittel des Rudels
  (tetrapoda-core.js `rudelPlatz`). Wer seinen Platz anläuft, zieht das Mittel mit, und der Ring dreht ≈ 10°/s. Die größte
  Lücke bleibt 140–154° > 135° (anderthalb Plätze), „umstellt“ fällt nie, die Hetze beginnt erst mit der Flucht bei 65 s. Das
  Gesetz endet sie nach dauerS 45 s, also bei 110 s. Das feste 90-s-Fenster der Probe hieß das „ohne Ende“ (1 von 36–42).
  Geschnitten ist das Fenster: es reicht jetzt bis zur ersten Hetze + dauerS + 5 s, mindestens 90 s. Der Täter
  `jagd-ohne-ende` bleibt rot beim Namen. Das Kreisen selbst ist ein Gesetz des Kerns (Kerne additiv, Goldens gefroren) und
  nicht Datei dieser Bahn. Messname: jagdkreis, Rudel #35, Pirsch bis zur ersten Hetze 65 s.
- **herde-revier** (gate:kreatur-takt Teil 2) ist rot, aber nicht aus seinem Grund: „Bewegung hängt am Blick: 45,9246 m“.
  main e1a54023 zeigt dieselbe Zahl auf vier Stellen (`--proben herde --selftest`, Täter 8 von 9), der Täter liegt also nicht
  in dieser Bahn.
- **Die Turbulenz-Klasse ist D fest** (σθ 10°). Pasquill A–F aus Sonne, Wolke und Wind des Wetters ist nicht gelesen. Adresse:
  `SCENT.turbulenz` (stamm/koerper-seele.js:1849).
- **Die Station** misst der Koordinator an echter GPU. Ihr Wind hängt an ihrer Sim-Uhr; die Zahl 3,2 oben ist ihr eigener Lauf,
  headless am Null-Renderer.
- **Die GPU-Probe**: gate:kreatur-takt misst in der Cloud 2 484 s, über dem Deckel je Probe (480 s); der Einlass weist es ab, sein
  Richter ist die Cloud-Batterie ([ci voll]). Die Marke ruft deshalb nur die GL-Wand. Der Prüfer `zug.sh probe-tag` liegt in
  diesem Container nicht (artifacts/profiband ist nicht verfolgt), die Marke ist gegen den Einlass-Leser des Workflows geprüft.
  Die Pflicht-Wände (PROBE_PFLICHT: Bau, Haus, Licht) betreffen keinen Pfad der Bahn.
