# auge-farbe — Stand-Blatt (GTX 1050, 26.11.)

**Die Täter (an der Station gesehen, Basis dce6473d).** Zwei Täter, EIN Auge.

1. **Das Auge sah jeden Leib weiß.** `_sichtZiel` (stamm/kreatur-furcht.js) las die Ecke nur, wenn das Flag `vertexColors` an war.
   - Die Leiber (Spieler, Wolf, Hirsch) tragen den Node-Stoff des Studios: er liest die Vorlagen-Farbe im Farb-Knoten (`colorNode = attribute("color")`) und trägt das Flag aus.
   - Gelesen wurde darum die Stoff-Farbe Weiß [1, 1, 1], die nie gezeichnet wird. Das Fell des Hirschs zeigte sich auf jedem Boden: S2 getarnt 487 m ↔ offen 606,8 m, −19,7 %.
2. **Die Helle zählte als Farbe.** `augeAbstand` (tetrapoda-core.js) zählte die ln-Differenz jeder Klasse für sich: die Helle stand in jeder Klasse noch einmal, der S-Fang des Hirschs trug Leuchtdichte.
   - Orange und Grün GLEICHER Leuchtdichte lagen im Hirsch-Auge 26,4 ↔ 45,7 Schritte vom Boden. Der Hirsch sah den Spieler in Orange auf 296,9 m, in Grün auf 387,1 m: 23,3 %.
   - Das Warn-Orange der Jäger trennt der Zweifarben-Seher nicht von Grün.

**Geschnitten.**

1. **EIN Abstand des Auges** (tetrapoda-core.js `sinnSchritte`, gelesen von `augeAbstand` und `augeEntdeckung`).
   - Die Farbe liegt in den n − 1 Gegenfarben: bei gleichem Rauschen ω der Teil der ln-Differenzen quer zur Hell-Achse, ΔS² = Σ(Δfᵢ − Δf̄)² / ω² (Vorobyev & Osorio 1998, Proc. R. Soc. B 265:351, Gl. 3/4).
   - Die Helle liegt im längsten Zapfen allein, |Δf_lang| / ω. Die S-Zapfen tragen nichts zur Leuchtdichte (Eisner & MacLeod 1980, J. Opt. Soc. Am. 70:121); der Hell-Kanal der Säuger und der Biene ist der lange Zapfen (Kelber, Vorobyev & Osorio 2003, Biol. Rev. 78:81).
   - Beide gepoolt: √(Farbe² + Helle²).
   - Der volle Kontrast der Entdeckung kommt aus derselben Funktion: Weiß gegen die Rauschgrenze, alle Klassen gleich weit, ln(1/ω)/ω = 59,9 Schritte. Vorher stand dort √n · 59,9, die Summe des alten Abstands.
   - Ohne die Zahl der Klassen bricht die Entdeckung laut.
2. **Das Ziel liest die gezeichnete Albedo** (stamm/kreatur-furcht.js `_sichtZiel`, stamm/studio-stoff.js).
   - Die Albedo folgt r184 `setupDiffuseColor`: (Farb-Knoten ?? Stoff-Farbe) × (vertexColors ? Ecke : 1).
   - Der Studio-Stoff sagt, dass sein Farb-Knoten die Ecke liest, mit der EINEN Marke der Klasse `eckeImKnoten` (wie stoff-material). Nur der Wurf-Teil und das Unbeleuchtete zeichnen schwarz und tragen sie nicht.
   - Kein Bild ändert sich: die Marke liest sonst nur das Altern der Bau-Teile, und deren Stoffe kommen aus `_buildToonNodeMaterial`.

**Gemessen.**

| Station (GTX 1050) | dce6473d | Schnitt |
|---|---|---|
| gesehen#1 Orange ↔ Grün (Soll ≤ 15 %) | 296,9 ↔ 387,1 m = 23,3 % | **387,2 ↔ 378,9 m = 2,2 %** |
| gesehen#2 getarnt ↔ offen (Soll ≥ 30 %) | 487 ↔ 606,8 m = 19,7 % | **204,7 ↔ 355,8 m = 42,5 %** |
| das Fell des Hirschs im Auge | [1, 1, 1] | [0,261, 0,155, 0,104] |
| Schritte getarnt ↔ offen | 52,5 ↔ 83,4 | 7,7 ↔ 24 |

Die Linse `auge` (Probe furcht, gate:kreatur-takt): ein Hirsch 30 m vor dem Spieler, jede Ecke des Spielers auf eine Farbe.

| | Basis | Schnitt |
|---|---|---|
| Orange ↔ Grün gleicher Leuchtdichte | 1 006 ↔ 1 006 m | 839,1 ↔ 812,2 m (3,3 %) |
| Dunkel ↔ Hell | 1 006 ↔ 1 006 m | 388 ↔ 887,7 m (2,3×) |

- Selbsttest furcht · witterung · rudel · mahl · jagd · jagdkreis: Täter 29 von 29 rot beim Namen, Grund 6 von 6 grün.
- Die neuen Täter: `auge-ecke` (das Ziel weiß: alle vier 977,7 m) und `auge-helle` (der alte Abstand: 763,3 ↔ 939,1 m).
- Unverändert: jagd 4 Risse im Nah-Kreis, hetzFrames 17 201 wie Kopf 2 · jagdkreis Rudel 20/60, einWolf 0/19, kitz 20/20 · mahl Fuchs 18,5 s, Bär 16,1 s · die Flucht des Kontroll-Hirschs vor dem Spieler 117,6 m wie an der Basis. Die Flucht beginnt in der Aura, weit unter der Distanz des Auges.

**Die Station muss die Ecke färben.** Ihr Färben setzt die Stoff-Farbe, die der Node-Stoff nie zeichnet, und schaltet die Ecke aus.
- Mit dem ehrlichen Leser liest S1 an diesem Kopf sonst Kleidung gegen Kleidung: 0 %, falsch-grün.
- Die Messung oben lief mit einer Station, die zusätzlich jede Ecke des Leibs auf die Farbe setzt und sie im selben Ruf zurückstellt. An main liest sie byte-gleich dasselbe (dort liest das Auge die Stoff-Farbe).

**Offen.**
- gesehen#3 ist an diesem Kopf nicht gebucht (das Bildpaar lief nicht). Am Ort des Hirschs: Wolf 294,3 m ↔ Mensch 1 756,4 m; vorher 587,2 ↔ 3 084,6 m.
- Die Helle des Menschen liest den L-Zapfen allein; seine Leuchtdichte trägt L und M (V(λ)).
- Das Rauschen des Hell-Kanals ist ω wie das der Zapfen; eine eigene Weber-Schwelle der Säuger trägt das Gesetz nicht.
- Das Unbeleuchtete liest das Auge mit seiner Stoff-Farbe, nicht mit seinem Leuchten.
- Den Ton je Leib eines Bewohners (`_tonFaktor`) liest das Auge nicht: das Wild sieht keinen Bewohner (gesehen#5).
