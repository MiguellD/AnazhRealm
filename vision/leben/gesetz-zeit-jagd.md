# LEBEN — das Gesetz der Zeit und der Jagd (19.11., gesetzt VOR dem dritten Spike)

Quelle des Entscheids: `quellen/zensus-zeit-code.md` (drei Zeit-Anker im Code) und `quellen/zensus-zeit-quellen.md` (Feld-Zahlen).
Zwei Gesetze von mir sind zuvor am Spike gefallen (Pyramide als Eingabe; „der Wolf lebt vom Riss, Plateau = Bedarf“). Dieses hier
stellt keine neue Formel nach, es zieht die EINHEITEN gerade: Zeit, Kopf, Raum.

## Das Gesetz

1. **EINE Uhr: das Leben.** Der Bestand kennt keine freie Zahl je Takt. Jede Rate steht als Zahl je echtem Jahr (oder je Leben) mit
   Quelle und wird über die EINE Raffung in Takte übersetzt: refS 2 100 s ≙ 8 Freiland-Jahre des 64-kg-Wolfs, also
   1 Takt = 13,9 Tage, 1 Jahr = 26,25 Takte; jede Zeit skaliert mit M^0,25 (leben-core, wie heute). Es fallen `geburt 0,1`,
   `hunger 0,2`, `riss 0,6`, `frass 0,016` als freie Zahlen je Takt.
2. **Je KOPF, nie je Gattung-und-Revier.** Geburt je reifer Mutter (Wurf-Größe aus der Quelle, nie die Verbands-Größe `herde.wurf`),
   Bedarf je kg^¾ je Tag, Tod je Kopf. Der Deckel „höchstens EIN Ereignis je Takt je Revier“ fällt.
3. **Der Raum der Jagd ist das Rudel-Revier.** In EINEM Takt (13,9 Tage, 22–28 km je Tag) begeht das Rudel sein ganzes Revier
   mehrfach: der Riss eines Takts verteilt sich über ALLE Reviere des Rudels nach deren verwundbarem Bestand (Reife und Alter, wie
   im zweiten Gang), nie auf das eine Stand-Revier. Das Rudel springt nicht; `rudel.ort` ist der Ort des letzten Risses.
4. **Zwei Stufen des Futters.** Sattheit (Freiland-Verbrauch) ist das Plateau des Risses; Erhaltung liegt darunter; der Wurf fällt,
   wenn die Deckung des letzten Jahres die Wurf-Schwelle trägt. So schließt das Plateau die Geburt nicht mehr aus.
   Die drei kg-Werte je Wolf je Tag kommen aus dem Quellen-Leser (`quellen/zensus-raten-quellen.md`), vor der Rechnung eingetragen.
5. **Das Verhältnis Wolf ÷ Beute ist PROBE, nie Eingabe.** Kein Wert der numerischen Antwort steht im Kern.
6. **Zwei Uhren, eine Kopplung.** Der Leib läuft in Sekunden (Sprint 75 m in 10 s), der Bestand in der Raffung. Der Leib ist die
   Aufführung eines Ereignisses des Bestands am Ort des Spielers (Riss, Geburt, Zug); er rechnet keinen Bestand.

Die Raten der Beute (Kitze je reifer Kuh je Jahr, Überleben Kitz und Kuh, Abwanderung) kommen aus demselben Leser; fehlt ein
Wert, steht er als benannte Hypothese mit Spanne im Kern und in dieser Tafel.

## Soll (vor der Rechnung; Raster 48 × 48 Reviere, 8 Saaten, ≥ 20 Wolfs-Leben = 4 200 Takte, Zuwanderung aus dem Nichts 0)

| Nr | Probe | Soll | Feld-Anker |
|---|---|---|---|
| S1 | Wolf lebt am Ende | 8 von 8 Saaten | — |
| S2 | Wölfe je 1 000 Beute-Köpfe (Mittel der zweiten Hälfte) | 2–8 | 3,8–4,0 (Cariappa 2011; Boertje 1992) |
| S3 | Anteil des stehenden Beute-Bestands, den der Wolf je Jahr reißt | 0,05–0,25 | Wert aus dem Leser |
| S4 | Beute mit Wolf ÷ ohne Wolf | 0,5–0,9 | Elch 0,65 (Messier 1994) |
| S5 | Anteil Unreifer am Riss | 0,35–0,63 | Feld-Band des ersten Zensus |
| S6 | Junge, die reif werden, je Wolfs-Leben | 1,5–3 | ≈ 2 (Überleben 0,75 · 0,81 · 0,89) |
| S7 | Anteil der geborenen Beute, der reif wird (mit Wolf) | 0,25–0,6 | heute 0,04 |
| S8 | leere Reviere im Rudel-Revier (Mittel) | ≤ 0,10 | zweiter Gang 0,38–0,67 |
| S9 | Beute-Bestand gesamt, CV über die zweite Hälfte | ≤ 0,30 | erster Gang 0,076 |
| S10 | Erhaltungs-Brüche · Zuwanderung | 0 · 0 | — |
| S11 | Kosten je Takt je 256 Reviere | ≤ 0,25 ms | erster Gang 0,224 |
| S12 | Größen der Erbe-Linie p99 ÷ Start | ≤ 1,4 | erster Gang 1,17–1,19 |

## Werte (19.11. 04:40, vor der Rechnung, aus `quellen/zensus-raten-quellen.md`)

- Beute: Kitze je reifer Kuh je Jahr 1,36 (karg) ↔ 1,80 (gut), Jährling 0,62 ↔ 1,63 (Verme 1969, Abstract); Überleben je Jahr ohne
  Wolf Kitz 0,59 · Kuh 0,76, mit Wolf im Feld 0,31 · 0,79 (Probe, nie Eingabe); Abwanderung Jährlings-Böcke 80 %, -Kühe 13 %.
- Wolf: Erhaltung 0,1925 kg je Tag je kg^¾ (2,77 kg am 35-kg-Wolf, Głowaciński & Profus 1997, Volltext); Sattheit 0,396
  (5,7 kg, Yellowstone Frühwinter, Stahler 2006 über Zusammenfassung); Wurf-Schwelle HYPOTHESE 1,2 × Erhaltung (1,1–1,5; Peterson &
  Ciucci 2003 nicht gelesen); EIN Wurf je Rudel je Jahr, 6 Welpen; Nutz-Anteil des Risses HYPOTHESE 0,7 (0,6–0,8).
- S3-Anker: Wölfe nehmen in Ost-Polen 6,3–9,0 % der Huftier-Biomasse je Jahr (Volltext); nachhaltig tragbar am George Reserve
  33 % des Herbst-Bestands (McCullough 2001, Abstract).
- S2, vor der Rechnung benannt: Fuller 2003 linear W = 3,5 + 3,3·U gibt 3,5–6,8 Wölfe je 1 000 Köpfe; Cariappa sättigend gäbe bei
  der Beute-Dichte des Spiels (100–200 je km², Feld 1–15) unter 1. S2 urteilt am Band 2–8, beide Lesarten stehen neben der Zahl.
- NICHT gelesen: das Futter-Minimum für Reproduktion, Fuller im Original, r_max nach McCullough 1979, Rothirsch-Kälber je Kuh,
  Streifgebiet der Kuh in ha, der Riss-Anteil je Jahr für Isle Royale · Yellowstone · Białowieża · Minnesota.

## Lauf 1 (19.11. 04:50) — S1 ROT: Wolf 0 von 8, die Beute stirbt in allen 8 Saaten mit aus

Lebende Phase (Jahre 0–16): Wölfe je 1 000 Köpfe 3,3–4,6 (S2-Band), Unreife am Riss 0,57–0,66, Geborene reif 0,29–0,41, ohne Wolf
Überleben Kitz 0,611 · Kuh 0,742 (Feld 0,59 · 0,76) und CV 0,010. Aber: 51–59 Risse je Wolf je Jahr (Feld 15–28 Hirsche),
9,5–10,2 kg Riss je Wolf je Tag, Deckung ÷ Erhaltung 2,04 → 1,81 bis zuletzt, Beute 12 458 → 136; alle neun Zellen der
Empfindlichkeits-Reihe enden bei 0. Kosten ohne Wolf bei 19 900 Köpfen 0,416 ms je 256 Reviere (S11 ROT, bleibt ROT).

**MEIN FEHLER in der Werte-Tafel, beim Namen:** die Sattheit 5,7 kg je Tag ist bei Stahler schon Riss-BRUTTO; die Tafel gab sie
als Futter aus, der Kern teilte nochmals durch den Nutz-Anteil — 12,8 statt 9,0 kg Riss je Tag am erwachsenen 64-kg-Wolf.
Folge: der Wolf reißt als feste Quote das Zwei- bis Dreifache des Felds, über dem Zuwachs der Beute (0,39–0,44 Geburten gegen
0,16–0,25 Verlust je Kopf je Jahr).

**Lauf 2, VOR der Rechnung gesetzt:** genau EINE Korrektur — das Plateau ist 0,396 kg Riss-brutto je Tag je kg^¾, gefressen wird
Riss × Nutz-Anteil, die Deckung misst Gefressenes ÷ Erhaltung. Soll S1–S12 unverändert. Vorhersagen: Deckung am Plateau 1,44 bei
Nutz 0,7; Risse je Wolf je Jahr 24–44; bei Wurf-Schwelle 1,5 stirbt der Wolf aus (1,44 < 1,5), bei Nutz 0,6 wirft er nur knapp
(1,23). Fällt Lauf 2 an S1, fallen die Sätze 3 und 4 des Gesetzes (feste Quote ohne Antwort auf die Beute-Dichte vor der
Erschöpfung), und es geht an den Zensus der funktionellen Antwort (Messier) — ohne dritte Formel am selben Tag.

## Lauf 2 (19.11. 05:08) — S1 ROT: Wolf 3 von 8; die Sätze 3 und 4 FALLEN

Die eine Korrektur stand in 4 Kern-Zeilen, ohne Wolf sind Lauf 1 und 2 zahlengleich. Vorhersagen: Deckung am Plateau 1,43
(gesetzt 1,44) trifft; Risse je Wolf je Jahr 46,2 (gesetzt 24–44) trifft nicht; „bei Wurf-Schwelle 1,5 stirbt der Wolf aus“
trifft nicht (er lebt 4 von 4, Deckung 1,48). Die Spur: der Wolf bleibt bei 44–59 Köpfen satt (Deckung 1,36–1,50 bis hinab zu
1 409 Beute-Köpfen), während die Beute 14 159 → 8 013 fällt — eine FESTE QUOTE; Riss ÷ Zuwachs 0,99–1,005 in den drei lebenden
Saaten (die Beute driftet auch dort −1,2 bis −1,9 % je 10 Jahre), 1,06–1,10 in den fünf gefallenen. Es fehlt die Rückstell-Kraft.
Die einzige Zelle der Reihe, die in 4 von 4 Saaten trägt (Wurf-Schwelle 1,5 × Nutz 0,7: Beute 15 803–17 066, S3 0,116, S4 0,768,
S9 0,056, S2 1,42), trägt, WEIL dort die Schwelle am Plateau liegt und der Wurf auf das Futter antwortet — sie ist ein Zeiger auf
die Ursache, kein Wert, den ich nachträglich setze.

Was steht: die Sätze 1, 2, 5, 6 (EINE Uhr, je Kopf, Verhältnis als Probe, Leib als Aufführung) und die Beute-Seite (ohne Wolf
Überleben Kitz 0,611 · Kuh 0,742 gegen Feld 0,59 · 0,76, CV 0,010). Was fällt: Satz 3 in der Fassung „der ganze verwundbare
Bestand ist je Takt greifbar“ und Satz 4 „Wurf an einer Schwelle weit unter dem Plateau“. Zurück an den Zensus:
`quellen/zensus-antwort-quellen.md` (funktionelle Antwort, numerische Antwort als Gradient, Revier gegen Beute-Dichte,
dichte-abhängiger Tod, Zeit-Verzug). Mein Zusatz „keine dritte Formel am selben Tag“ war eine Kalender-Bremse ohne Mess-Zweck;
es gilt die Methode selbst: das nächste Gesetz nur aus gelesenen Stütz-Punkten, Soll vor der Rechnung.

Fällt das Gesetz an S1 oder an drei der Proben S2–S8, geht es zurück an den Zensus; ein Soll, das nach einem Ergebnis geändert
wird, steht hier offen mit Datum und Grund.

## Zweite Fassung der Sätze 3 und 4 (19.11. 05:22, gesetzt VOR Lauf 3, nur aus gelesenen Stütz-Punkten)

Quelle: `quellen/zensus-antwort-quellen.md` (Zeilen 1.3, 1.4, 2.1, 2.2, 2.6, 5.1) und der Vorzensus (`zensus-zeit-quellen.md`
Zeilen 8, 88–94). Die Sätze 1, 2, 5, 6 stehen unverändert.

3. **Der Riss antwortet auf das VERHÄLTNIS, nie auf eine Quote.** Risse je Wolf = Plateau × V ÷ (V + V½). V = Beute im Rudel-Revier
   je Wolf des Rudels, in Weißwedel-Äquivalenten (WÄ: Hirsch 1 · Elch 6). V½ = **246 WÄ je Wolf** (Isle Royale, 94 Rudel-Winter:
   a = 4,19 × 10⁻², h = 0,58 → Halb-Sättigung 41 Elche je Wolf × 6; Vucetich 2002, Volltext). Das Plateau bleibt die Sattheit aus
   Satz 4 alt (Kern-Wert unverändert). Der Raum bleibt das ganze Rudel-Revier; WELCHER Kopf fällt, entscheidet weiter der Rang der
   Verwundbarkeit (Reife, Alter) — als Reihenfolge, nie als Zahl je Takt. Die Verwundbarkeits-Quote 16 des Kerns fällt ersatzlos.
4. **Der Wolf antwortet auf seine Deckung als GRADIENT, nie als Schwelle.** Deckung D = Riss ÷ Erhaltung über das letzte Jahr.
   Wurf und Überleben sind stetig in D, linear zwischen drei Ankern, außerhalb gehalten (Überleben und Anteile in 0…1 geklemmt):

   | Anker | D | Fähen mit Wurf | Welpen je Wurf | Welpe wird Jährling | Überleben je Jahr (ab Jährling) |
   |---|---|---|---|---|---|
   | arm | 0,60 | 0,66 | 4,6 | 0 | 0,49 |
   | Gleichgewicht | 1,05 | 0,97 | 5,7 | 0,36 | 0,66 |
   | reich | 1,50 | 0,96 | 6,9 | 0,75 | 0,85 |

   Gelesen sind die Werte: Fähen und Föten nach Beute je Wolf niedrig ↔ mittel ↔ hoch (Boertje 1992 Tab. 1), Überleben Einbruch ↔
   Gleichgewicht ↔ Anstieg 0,49 ↔ 0,66–0,67 ↔ 0,84–0,87 und 2 Rekruten je Rudel im Gleichgewicht (Peterson & Page 1988, Abstract),
   Welpen-Überleben 0,75 bei guter Beute (Hayes 2000). MEINE Zuordnung, nicht gelesen: welche Deckung die drei Phasen tragen. Sie
   folgt aus Satz 3: Boertjes Stufen 100 · 285 · 675 WÄ je Wolf geben V ÷ (V + 246) = 0,29 · 0,54 · 0,73 des Plateaus, mal
   Sattheit ÷ Erhaltung 2,057 = D 0,60 · 1,10 · 1,51. 0,36 = 2 Rekruten ÷ (5,7 × 0,97) ist Rechnung; die 0 am armen Anker ist die
   Verlängerung der Geraden (Mech 1977: erst hungern die Welpen — nur Reihenfolge, Sekundär-Quelle).
   Die Wurf-Schwelle und die Fasten-Tage 30 des Kerns fallen ersatzlos; ein Rudel hat weiter EINEN Wurf je Jahr.

Gegenprobe vor der Rechnung, zwei unabhängige Quellen: Null-Wachstum liegt auf Isle Royale bei 0,88 Rissen je Wolf und Monat =
0,51 des Plateaus (Vucetich & Peterson 2004); Erhaltung ÷ Sattheit der Stoffwechsel-Quellen ist 0,486 (Głowaciński 1997 ÷ Stahler
2006). Und Null-Wachstum bei 43 Elchen je Wolf = 258 WÄ je Wolf trifft das Nordamerika-Mittel 249 WÄ je Wolf (Boertje 1992, n 25).

### Soll, Zusatz (S1–S12 stehen unverändert; kein Soll wird nach dem Ergebnis bewegt)

| Nr | Probe | Soll | Feld-Anker |
|---|---|---|---|
| S13 | Rückstell-Probe: im Jahr 40 fällt die Hälfte der Beute (Zufall je Kopf, als benannter Eingriff, 8 Saaten) | Wolf fällt binnen 4 Jahren um ≥ 25 % · Beute steht nach 15 Jahren bei ≥ 85 % des Vor-Stands · Wolf lebt 8 von 8 | Verzug 2–3 Jahre (Peterson & Page 1988) |
| S14 | Wolf-Wachstum je Jahr gegen D (Rudel-Jahre in Klassen) | D 0,9–1,2: −0,10…+0,10 · D ≥ 1,5: +0,15…+0,45 · D ≤ 0,6: ≤ −0,15 | 0,418 · D − 0,44 (Vucetich & Peterson 2004, umgerechnet) |
| S15 | Beute je Wolf am lebenden Plateau | 180–390 WÄ je Wolf | NA-Mittel 249, Null-Wachstum 258 |

### Vorhersagen (vor der Rechnung, zählen als Treffer oder Fehlschuss)

S1 8 von 8 · S2 3,5–4,5 Wölfe je 1 000 Köpfe · S3 0,10–0,16 je Jahr · S4 0,60–0,80 · S9 ≤ 0,15 · Verzug Wolf hinter Beute in S13
2–4 Jahre. Benanntes Risiko: bei 55–70 Wölfen trägt der Zufall der kleinen Zahl (Feld: ≈ 30 % der Wachstums-Varianz) über 160
Jahre einzelne Saaten ins Aus — fällt S1 daran, steht es als Befund, nicht als Formel-Fehler.

### Nicht im Gesetz, benannt offen

- Revier-Größe gegen Beute: das Feld sagt „das Revier antwortet, nicht die Rudel-Größe“ (Kittle 2015; Sand 2012: 960 ↔ 306 km²);
  der Exponent ist NICHT gelesen. Der Revier-Deckel 744 des Kerns bleibt als benannte eigene Setzung.
- Dichte-Bremse durch Rudel-Kampf: wirkt im Feld erst ab 55–60 Wölfen je 1 000 km² (Cubaynes 2014, Sekundär-Quelle), darunter kein
  Bezug (Mech & Barber-Meyer 2017). Der Raum der Welt ist gerafft (48 × 48 Reviere = 92 km² mit 14 000 Köpfen), die Zahl je km²
  ist nicht übertragbar; die Bremse steht NICHT im Kern.
- Widerspruch Skandinavien: 3 × höhere Riss-Rate bei gleichem Verhältnis, kein Plateau bis 499 Elche je Wolf (Sand 2012). Das
  Plateau des Gesetzes kommt aus dem Stoffwechsel, V½ von EINEM Ort; ob a vom Elch auf den Hirsch trägt, ist nicht gelesen —
  die Brücke ist allein der WÄ-Faktor 6.
