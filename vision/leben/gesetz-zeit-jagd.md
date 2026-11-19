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

## Lauf 3 (19.11. 05:38–05:46, der erste vollständige Lauf) — S1 GRÜN 8 von 8, S13 ROT: der Wolf steht am RAUM, nicht am Futter

9 GRÜN, 6 ROT (Tafel und Spur: `kern3/lauf-zeit-3.txt`). Wolf am Ende 34 · 40 · 44 · 36 · 36 · 39 · 35 · 46 (0 von 8 → 3 von 8 → 8 von 8).
ROT: S2 1,97 (Soll 2–8) · S4 0,904 (0,5–0,9) · S11 0,540 ms (≤ 0,25; ohne Wolf 0,509) · S13 Fall 12,9 %, in 1 von 8 Saaten ≥ 25 %
(Beute 98,4 %, Wolf lebt 8 von 8) · S14 −0,14 · +0,50 · −0,77 · S15 507 WÄ je Wolf (180–390).
Vorhersagen: S1 Treffer · S9 Treffer · Verzug Treffer (Median Jahr 3) · S2, S3 (0,061 statt 0,10–0,16), S4 Fehlschuss.

Die Sätze 3 und 4 HALTEN an ihren eigenen Proben: Riss ÷ Soll 1,0001; Wachstum in der Klasse D 0,9–1,2 ohne Wander-Tode −0,0015.
Was bricht, nennt das Gesetz nicht — es sind die Raum-Regeln des Kerns (`zeit-kern-3.cjs` Z. 679–716), meine benannte offene
Stelle: fünf Rudel dehnen sich bis zum Deckel 744 über ALLES Land (36,9 Wölfe in 4,8 Rudeln), „voll über 6“ (die Verbands-Größe
`herde.wurf`, die Satz 2 als Wurf schon verworfen hat) schickt Reifende hinaus, und ohne freies Land stirbt der Wanderer SOFORT:
45 % der Tode ab einem Jahr sind Wander-Tode (3 493 von 7 733). Der Bestand hält doppelt so viel Land, wie er braucht (V 507 —
Skandinaviens Zahl im Wieder-Besiedeln, 499), und der Eingriff S13 senkt D nur 1,26 → 1,11, über dem Gleichgewichts-Anker.
S11 bleibt ROT (Gerät lief langsamer: dieselbe Rechnung ohne Wolf 173 s gegen 132 s; das Soll bewege ich nicht).

## Satz 7 — der Raum (19.11. 05:50, gesetzt VOR Lauf 4, aus gelesenen Stütz-Punkten)

7. **Der Raum antwortet auf die Beute, nie auf einen Deckel und nie auf eine Rudel-Größe.**
   (a) Ein Rudel VERTEIDIGT nur seinen Bedarf: die Reviere, deren Beute seinen Köpfen V_halt = **258 WÄ je Wolf** trägt (das
       Null-Wachstum von Isle Royale, 43 Elche je Wolf × 6). Was es darüber hinaus begeht, ist offenes Land. Die Tages-Strecke
       (Deckel 744) bleibt allein als Grenze dessen, was ein Rudel begehen KANN.
   (b) Wer wandert, entscheidet das ALTER, nie „voll“ und nie „hungert“: jeder Nachkomme verlässt das Rudel im Alter 2–4 Jahre
       (Mittel 2,9; 77 % in diesem Fenster — Hayes & Harestad 2000). Die Rudel-Größe ist damit Folge (Paar + Welpen + Jährlinge),
       keine Eingabe. `herde.wurf` liest der Wolf nur noch für den Anfangs-Bestand.
   (c) Der Wanderer gründet, wo offenes Land — freies oder das Land eines Halters ÜBER dessen Bedarf — einem Paar V_halt trägt
       (der Halter gibt es ab: Reviere schrumpfen mit der Zahl der Nachbar-Rudel, Rich et al. 2012, Volltext; das Revier antwortet,
       nicht die Rudel-Größe, Kittle 2015), oder er füllt die leere Stelle eines Rudels ohne Zucht-Tier seines Geschlechts.
       Findet er nichts, bleibt er als Kopf im Geburts-Rudel (zählt dort in V und D, isst mit) und sucht im nächsten Takt wieder.
       Einen Tod „auf der Wanderung“ gibt es nicht: das Überleben ist dichte-unabhängig 0,81 / 0,89 gelesen (Hayes 2000), kein
       gelesener Wert trägt einen Wander-Tod. Es stirbt nur, wen die Tafel des Satzes 4 an seiner Deckung trifft.

Damit sättigt der Bestand am FUTTER: ist alles Land verteilt, wachsen die Köpfe im Rudel, V fällt auf den Anker, D auf 1,05.

### Vorhersagen für Lauf 4 (vor der Rechnung; S1–S15 stehen unverändert)

S1 8 von 8 · S15 250–310 WÄ je Wolf · S2 3,2–4,0 · S3 0,085–0,11 · S4 0,80–0,88 · S13 GRÜN mit Fall 30–50 %, Tief im Jahr 2–3 ·
S14 bleibt ROT am reichen Ende (≈ +0,5 gegen Soll ≤ +0,45: meine Anker-Tafel ist dort reicher als die Gerade von Isle Royale —
die Tafel bewege ich nicht nach dem Ergebnis) · S11 bleibt ROT. Benanntes Risiko: ≈ 75 Wölfe in 10–12 Rudeln schwingen nach dem
Eingriff über, und der Zufall der kleinen Zahl trägt einzelne Saaten ins Aus.

## Lauf 4 (19.11. 06:09–06:25, der erste und einzige Voll-Lauf, kein Bug geheilt) — 12 GRÜN, 3 ROT: der Wolf sättigt am FUTTER

Tafel und Spur: `kern3/lauf-zeit-4.txt`. S1 8 von 8 (Wolf am Ende 68 80 61 66 74 56 63 69 in 9–15 Rudeln) · S2 3,99 · S3 0,084 ·
S4 0,861 · S5 0,605 · S7 0,479 · S8 0,0011 · S9 0,013 · S10 0 · 0 · S12 0,969 · **S13 GRÜN: Fall 38,3 % (7 von 8 Saaten ≥ 25 %), Beute
98,5 % nach 15 Jahren, Wolf lebt 8 von 8, Tief im Jahr 2–4** · S15 250,9 WÄ je Wolf, D 1,035. Wander-Tode 45 % → 0; Tode ab einem
Jahr: Deckung 94,9 %, Alter 5,1 %. Vorhersagen: 9 Treffer (S1, S15, S2, S4, S13 samt Fall 30–50 % und Tief Jahr 2–3, S14 ROT am
reichen Ende, S11 ROT), 1 Fehlschuss (S3 0,0841 gegen 0,085–0,11).

ROT, jede beim Namen, kein Soll bewegt:
- **S6 1,484 gegen 1,5–3** (Lauf 3: 2,26). Ursache ungemessen. Meine Lesart, als Hypothese: im stehenden, geschlossenen Bestand
  ohne Wander-Tod ersetzt jeder Kopf sich selbst; das Feld-Band stammt aus bejagten Beständen (menschlich 0,09 je Jahr).
- **S11 1,005 ms gegen 0,25** — das Gerät lief unter fremder Last 2,4 × langsamer; im selben Lauf kostet „ohne Wolf“ 1,222 ms, der
  Wolf kostet also nichts dazu. Ruhig stand die Beute-Seite allein bei 0,416 ms (Lauf 1): die Kosten trägt der Bestand je KOPF.
  Sie fallen nicht im Spike, sondern im Bau (Kosten an Schirm + Änderung, Satz „die Welt ist eine Funktion“).
- **S14 +0,033 · +0,84 · −4,38**: mein Soll steht auf der falschen EBENE. Die Gerade von Isle Royale beschreibt den ganzen
  Bestand je Jahr, ich habe sie an Rudel-Jahren geprüft — dort macht der EINE Wurf je Rudel das Wachstum zur Funktion der
  Rudel-Größe (reich sind junge Paare mit 2,5 Köpfen). S14 bleibt ROT, wie gesetzt.

Eigene Setzungen des Rechners, die das Gesetz nicht nennt (R1–R12 in der Lauf-Datei); die tragende und nach einem Blick gesetzte:
**R9** — Reihenfolge „leere Stelle, dann Gründung, dann Bleiben“, umgestellt VOR dem Voll-Lauf, nachdem die Mechanik-Probe mit
„Gründung zuerst“ im 24er-Raster ausstarb (49 Gründungen, 0 Beitritte). Die erste Reihenfolge ist nie voll gerechnet. Ich nehme
R9 ins Gesetz als Satz 7 (d), mit diesem Makel offen benannt.

### Nachtrag zum Soll (19.11. 06:30, gesetzt VOR der Auswertung, ersetzt S14 NICHT)

| Nr | Probe | Soll | Feld-Anker |
|---|---|---|---|
| S14b | Wachstum des GANZEN Wolf-Bestands je Jahr gegen die mittlere Deckung D des Jahres (alle Saaten, Haupt-Lauf und S13-Zweige, Jahre in D-Klassen von 0,1) | Steigung 0,25–0,60 je D · Null-Durchgang bei D 0,95–1,15 | 0,418 · D − 0,44 (Vucetich & Peterson 2004) |

### Urteil

Das Gesetz der Zeit und der Jagd steht in sieben Sätzen (1, 2, 3 und 4 in zweiter Fassung, 5, 6, 7). Der Spike trägt die
entscheidenden Proben: der Wolf lebt 8 von 8, das Verhältnis ist Probe (3,99 je 1 000, Feld 3,8–4,0), die Rückstell-Kraft wirkt mit
dem Verzug des Felds. Damit öffnet der BAU: Welle 1 und die Jäger-Ebene als EINE Welle auf `leben-erbe`, der Bestand als reine
Funktion im Kern, der Stamm als Leser. Erster Beweis des Baus: der Kern im Spiel rechnet `lauf-zeit-4` zahlengleich nach.

## Auswertung nach Lauf 4 (19.11. 07:08, Opus-Leser; `kern3/auswertung-4b.txt`, Kern unverändert, Prüfsumme gleich)

- **S14b ROT an der Steigung, GRÜN am Null-Durchgang.** 2 224 Jahr-Paare (Haupt-Lauf 1 272, S13-Zweige 952): Wachstum =
  1,085 · D − 1,128 — Steigung 1,085 gegen 0,25–0,60, Null bei D 1,040 (Soll 0,95–1,15). Je D-Klasse: 0,9–1,0 −0,074 (455 Jahre) ·
  1,0–1,1 +0,010 (1 478) · 1,1–1,2 +0,094 (256). Gegenprobe, kein Urteil: D von Jahresmitte zu Jahresmitte gemessen gibt 0,356.
  Das Soll bewege ich nicht; warum die Mess-Spanne von D die Steigung um den Faktor 3 verschiebt, ist UNGEMESSEN. Meine Lesart, als
  Hypothese: die Anker-Tafel des Satzes 4 (die Zuordnung der Feld-Phasen zu D ist MEINE) antwortet steiler als die Gerade von Isle
  Royale. Erster Punkt der nächsten Runde.
- **S6 — Hypothese bestätigt.** S6 = 8 · 0,4056 (Anteil Reifer) · 0,4572 (Tod je Reif-Jahr) = 1,483, gemessen 1,484: die Probe misst
  den WECHSEL der Reifen, nicht die Fortpflanzung. Bilanz 13,164 werden je Jahr reif, 13,150 Reife sterben; jedes reife Leben
  hinterlässt als Mutter 1,005 reif gewordene Kinder. Von den Geborenen werden 0,321 Jährling, 0,249 reif; Reife werden 3,84 Jahre
  alt. S6 bleibt ROT (1,484 gegen 1,5–3), das Band stammt aus bejagten Beständen.
- **R9 trägt das Ergebnis — der Gegenlauf „Gründung zuerst“ ist jetzt VOLL gerechnet** (`kern3/lauf-zeit-4g.txt`, nur der
  Beitritts-Block verschoben, ohne S13-Block): Wolf lebt 8 von 8, aber 35 16 44 27 18 35 16 23 statt 68 80 61 66 74 56 63 69 ·
  S2 1,72 (ROT) · S15 685 (ROT) · 11,0 Rudel × 2,84 Köpfe · 80 % der Rudel sind EIN Wolf · 0,19 Würfe je Rudel-Jahr · D 1,35 ·
  Gründungen 2,48, Beitritte 0,09 je Jahr. Mit „Gründung zuerst“ bremst die Paar-Bildung den Bestand, nicht das Futter. Der Makel
  „nie voll gerechnet“ ist damit geheilt; Satz 7 (d) steht — und er ist ein Stellvertreter: was er wirklich sagt, ist „das PAAR
  kommt vor dem Land“. Ein Gesetz, das die Gründung an das Paar bindet statt an eine Reihenfolge, ist der zweite Punkt der
  nächsten Runde (Zensus: wie finden sich Wanderer, Feld-Zahl der Paar-Bildung).

Der Bau bleibt offen wie entschieden: sein erster Beweis ist `lauf-zeit-4` zahlengleich; S6, S14, S14b ROT und die zwei Punkte der
nächsten Runde stehen beim Namen.
