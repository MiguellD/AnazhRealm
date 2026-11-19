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

Fällt das Gesetz an S1 oder an drei der Proben S2–S8, geht es zurück an den Zensus; ein Soll, das nach einem Ergebnis geändert
wird, steht hier offen mit Datum und Grund.
