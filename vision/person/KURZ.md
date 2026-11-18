# KURZ — Person · ZWISCHENSTAND (Zweig `zensus-person`, alles unter `vision/person/`)

**Geschnitten:** EIN Gesetz der Person (`gesetz.md`), Prototyp `spike/person.cjs`, 15 Proben gegen das vorher gesetzte Soll und 2 Bahnen. **Gemessen:** 4 TRÄGT, 2 TRÄGT BEDINGT, 9 FÄLLT; die Abfrage kostet 10,06 ms bei 5 131 026 Personen. **Offen:** nichts unbenannt, die 9 FÄLLT stehen unten mit Wurzel, die 2 Bahnen sind gebaut als Plan, nicht als Code.

**Zensus** (`zensus.md`, `zensus.json`): 119 Größen, davon 34 aus Samen oder Physik, 68 gesetzt, 8 abgeleitet, 7 fehlen, 2 tot; 12 Bewegungs-Systeme, 10 Zwillinge, ≈ 4 744 B je Kopf. `urteil.json`: FOLGT 27 · FÄLLT 28 · DATUM 64.

**Das Gesetz in fünf Sätzen.**
1. Eine Person ist ein Wert ihrer Adresse: (Welt-Same, Haus, Generation, Platz) → Hash; kein Speicher, kein Zufall.
2. Der Hauslauf (Heirat 24,5 / 27 J, Geburt alle 924 d bis 35,68 J, Siler-Tod, Erbe = ältester Überlebender) gibt zu jeder Zeit Bewohner und Rolle; das Gesinde kommt aus `haushalt()` des Bau-Gesetzes.
3. Das Erbe kommt aus `kind()` von leben-core mit den Eltern desselben Hauses, der Leib aus den WHO-Ankern über die Wachstumskurve des Kerns.
4. EIN Regler vom Leib (Stoß und Stemmen) soll Gang, Sprung, Sprint und Weitsprung tragen.
5. Ort(t) ist eine reine Funktion des Tag-Plans; die Abfrage liest nur Häuser, deren Bewohner im Kreis sein können.

| Probe | Soll | gemessen | Urteil |
|---|---|---|---|
| a Kosten | p50(5·10⁶) ÷ p50(5·10³) ≤ 1,5 | 6,22 → 9,83 → 10,06 ms, Quotient 1,62 | TRÄGT BEDINGT: ab 5·10⁵ Personen ×1,02 |
| a Treue | 0/100 Abweichung | 0/100 | TRÄGT |
| b Pyramide | 60+ 6–10 % · 0–14 ≥ 35 % · e₀ 35–40 J | 6,8 % · 22,8 % · 32,3 J | FÄLLT |
| b Größe | 12/12 Zellen WHO ± 1 SD | 5/12 | FÄLLT |
| b Streuung | 0,75–1,25 × WHO-SD | 1,42 / 1,49 | FÄLLT |
| b Reife Frau | 14,43 ± 0,5 J | 15,49 J | FÄLLT |
| b Haushalt | 4,25–5,25 · ≥ 6 > 0,5 · Gesinde 10,4–16,4 % | 4,62 · 0,463 · 28,3 % | FÄLLT |
| b Erbe | 100 % · h² 0,46 ± 0,05 | 47 272/47 272 · 0,455 | TRÄGT |
| c Tag | 0 Schlaf außerhalb · 0 Sprünge · Ids eindeutig | 0 · 0 · 5 286/5 286 | TRÄGT |
| d Gang | Erwachsene 1,27–1,46 · Kind ≤ 1,04 · Greisin ≤ 1,08 m/s | 1,51 / 1,45 · 1,28 · 1,46 | FÄLLT |
| d Stand-Sprung | 4 Zellen im FUPRECOL-Band · 75 J < 30 J | 4/4 · 111 < 138 cm | TRÄGT BEDINGT: φ_s ≥ 30° |
| d Sprint | v_top 6,2–11,1 m/s · CV 10–20 % | 3,06 m/s · 5,9 % | FÄLLT |
| d Weitsprung | Mittel-Mann > eigener Stand-Sprung | 0,62 < 1,38 m | FÄLLT |
| d Wurf | 18,6–27,8 m/s | kein Wert | FÄLLT |
| e Determinismus | sha gleich · anderer Same anders | gleich · anders | TRÄGT |

**Bahnen** (`bahnen.md`), in dieser Reihenfolge:
1. Ort(t) über `tagesPlan`. Stopp: 0 Sprünge, ±0 m nach Uhr-Sprung, 0 Leser der 7 Takt-Konstanten.
2. Die Abfrage `person.abfrage`. Stopp: Quotient ≤ 1,1, Treue 0/100. Sprossen `mensch.menge.bevoelkerung#1` und `#2`.

**Was FÄLLT, mit Wurzel** (`spike.md`):
- **Leib:** EINE Potenz der Wachstumskurve kennt keinen Säuglings- und keinen Pubertäts-Schub. Nur die Achse lnM streut. EIN Zeit-Anker am Mann.
- **Hauslauf:** höchstens 4 Geburten je Ehe. Das Gesinde des Bau-Gesetzes (1,31 je Haus) ist doppelt so groß wie bei Kussmaul. Die !Kung-Siler-Kurve trägt e₀ 32,6 J.
- **Regler:** Der Stoß hat keine Feder (F/W 1,065 statt 1,646), daher fallen Sprint und Weitsprung. Der Wurf hat kein Primitiv, und der Gang kennt weder Alter noch Reife.
- **Stand-Sprung:** trägt nur an einer Knie-Grenze ohne Quelle.
