# Bahnen Person — nur für das, was trägt

**Status: ZWISCHENSTAND.** Bahnen bekommt nur, was im Spike (`spike.md`) TRÄGT und einen Richter im Spiel hat. Alle Zeilen beziehen
sich auf main b7ed8419, wie in `zensus.json`; nachgeprüft am 18.11. für SB:1544–1850, 2302–2414, 2792–2811, 3901–3991 und DT:1700–1708.

Kürzel:
- KC = `koerper-core.js`
- SB = `stamm/siedlung-bewohner.js`
- SO = `stamm/siedlung-ort.js`
- DT = `stamm/dirigent-takt.js`
- FC = `fachwerk-core.js`

## Reihenfolge

| # | Bahn | trägt aus | Abhängigkeit | Stopp (Zahl) |
|---|---|---|---|---|
| 1 | Ort(t): der Weg als reine Funktion der Uhr | c TRÄGT · e TRÄGT | keine auf Leben Welle 1 und Bau v2; nach dem Merge von Verkehr C | 0 Sprünge · 0 Schlaf außerhalb · ±0 m nach Uhr-Sprung · 0 Leser der 7 Takt-Konstanten |
| 2 | Die Abfrage am Schirm (`person.abfrage`) | a TRÄGT BEDINGT · a Treue TRÄGT · e TRÄGT | nach Bahn 1; Bau v2 unabhängig (ein Leser); keine auf Leben Welle 1 | p50(5·10⁶) ÷ p50(5·10⁵) ≤ 1,1 · Treue 0/100 · 0 fehlend, 0 doppelt |

## Bahn 1 — Ort(t)

**Was.** Die Lage eines Bewohners zur Uhr t setzt sich aus drei Teilen zusammen:

- die letzte Wende seines `tagesPlan` (KC:5326). Er bleibt die EINE Plan-Quelle mit Akten, Rollen und Regen. Die Stunden-Tafel aus
  `gesetz.md` §5 kommt nicht hinein: sie war der Stellvertreter der Prüf-Stadt, im Spiel wäre sie ein Zwilling;
- der Ort auf dem Weg dorthin (`_bewohnerWeg`, unverändert);
- das Tempo seines Leibs (die bestehende Quelle; der Gang des Reglers FÄLLT, d Gang).

Wechselt das Ziel mitten im Weg (Regen, KC:5330 `nass`), beginnt die neue Route am Ort der Wende. Die Wende findet
`_bewohnerWende` (SB:2403–2414), auch das ist eine Funktion.

Was wegfällt: der Plan-Takt (t17), das Nachspielen nach Uhr-Sprung und Geburt (t18, t20, z20), die Ankunfts-Staffel (t21) und das
Aufholen (b5).

Was bleibt: das Ausweichen der nahen Leiber (mensch.menge.dichte#1, heute 1) als örtliche Abweichung um Ort(t). Ihre Wiederkehr
steht unter ≤ 2 m (mensch.menge.rhythmus#1, heute 1).

**Besitz (exklusiv).**
- KC:5326–5335: `tagesPlan` wird gelesen, nicht geändert. Daneben kommt die reine Funktion `ortZurZeit` hinzu.
- SB:1545–1550, 1618, 1638–1674, 1676–1703, 1772, 1837, 2213, 2302–2309, 2348–2414, 2792–2811, 3086 (Leser von `aufholen`),
  3906–3917, 3953–3973.

**Abhängigkeit.** Keine von Leben Welle 1, denn Ort(t) liest kein Erbe. Keine von Bau v2, denn die Orte kommen aus `tagesBindung`,
nicht aus dem Gewerbe. Verkehr C (eigene Sitzung) liest `S.ankunftOffen` (SB:1837) und `b.amSteuer` (SB:1698, 1702). Bahn 1 läuft
deshalb nach dem Merge von C, und der Besitzer von C entscheidet über `ankunftOffen`.

**Stopp.** Im echten Modul an der Stadt-Szene, gemessen wie Probe c:
- 1 000 Bewohner × 7 Spieltage, jede Minute: **0** Schritte über Tempo·60 s, **0** Schlaf-Minuten außerhalb des eigenen Hauses;
- 100 Sprünge der Uhr: Lage = Funktion **±0 m**;
- Absenz-Grep: **0** Leser von `planH`, `sprungH`, `ankunftH`, `ankunftWenden`, `ankunftJeTakt`, `wegeJeTakt`, `aufholen`;
- mensch.menge.dichte#1 bleibt bei Berührung 0.

**Sprossen, die fallen KÖNNEN** (zusammen mit Bahn 2):
- `mensch.menge.bevoelkerung#1`: 20 Stichproben Ort × Uhr, ±10 %, niemand fehlt, niemand doppelt;
- `mensch.menge.bevoelkerung#2`: 20 Stichproben-Personen ±2 m. Ort(t) gibt ±0 m; Werk ≠ Heim gilt, wo `tagesBindung` ein Werk
  findet (ohne Werk ist der Hof das Werk, KC:5320).

## Bahn 2 — die Abfrage am Schirm

**Was.** Bahn 2 beantwortet, wer zur Uhr t im Kreis (c, r) ist:

- Kandidaten sind die Häuser mit Heim im Abstand ≤ r + dem größten Weg des Plans: `wegM.markt` 200 m (KC:5194), `besuchFernM`
  40 m. Diese Grenze hängt nie an der Stadtgröße.
- Je Kandidat gibt es k < Kopf-Quelle(Haus) Personen mit dem Samen aus SB:848. Ort(t) kommt aus Bahn 1; der Kreis filtert.
- Leiber bekommen nur die Treffer; Leiber und Ring sind Schirm-Budget (z7, Datum).
- Was wegfällt: die Liste (h2), der Abschied (z18), die Ruhigen-Staffel (z19), die Obergrenze je Ort (z3) und die Kopf-Felder (z9, z10).
- Neu: ein eigener Messname `person.abfrage` (z17).

**Besitz (exklusiv).**
- SB:271–272, 443–460, 779, 837–899, 956–969, 1241, 1544, 1589–1617, 1619–1637, 1675, 1849, 1947–1948, 2022–2033, 3823–3855,
  3901, 3926, 3941–3942, 3991.
- SO:3611 (nearM).
- DT:1701–1708: der Messname neben `creatures`.

**Abhängigkeit.** Bahn 2 kommt nach Bahn 1, denn sie liest `ortZurZeit`. Die Kopf-Quelle liest sie nur über EINEN Leser (SB:839).
FC:9526–9537 (`leuteVon`, `hp.leute`) gehört Bau v2. Kein Ort wird geteilt, also läuft Bahn 2 vor oder nach Bau v2, ohne Konflikt.
Keine Abhängigkeit von Leben Welle 1: die Abfrage liest kein Erbe.

**Stopp.**
- `person.abfrage` im echten Modul, gemessen wie Probe a: p50 bei 5·10⁶ ÷ p50 bei 5·10⁵ **≤ 1,1** (der Spike misst 1,02) und
  Treue **0** von 100 gegen den Sack-Scan.
- Im Spiel an der Stadt: 20 Stichproben Ort × Uhr gegen die Funktion **±10 %**, **0** fehlend, **0** doppelt.
- Absenz-Grep: **0** Leser von `_bewohnerFort`, `ruhSoll`, `fernS` und der Liste (SB:1597–1602).

**Sprossen, die fallen KÖNNEN:** `mensch.menge.bevoelkerung#1` und `#2`, beide mit Bahn 1.

`#3` fällt nicht: die Alters- und Haushaltsverteilung (KS ≤ 0,1) hängt am Hauslauf, und b Pyramide und b Haushalt FALLEN. Damit
bleibt die Leiter darüber stehen. `#4` (100 Teleports) und `#5` (10⁶) trüge die Abfrage: 10,06 ms bei 5 131 026 Personen.

## Keine Bahn — und warum

| Teil | Spike | Grund |
|---|---|---|
| Hauslauf (§2) als Kopf-Quelle | b Pyramide · b Haushalt FÄLLT | 0–14 22,8 %, e₀ 32,3 J, Gesinde 28,3 %. Er würde eine falsche Demographie ins Spiel setzen; die Kopf-Quelle bleibt `leuteVon` bzw. Bau v2 |
| Leib (§3) | b Größe · Streuung · Reife FÄLLT | 5 von 12 Zellen, SD ×1,42 / 1,49, Reife der Frau 15,49 J |
| Erbe-Kette (§2.5) | b Erbe TRÄGT | ohne Richter im Spiel: das Erbe wird nur über den Leib sichtbar, und der fällt. `mensch.geist.generationen#2` verlangt Ähnlichkeit im Bild |
| Regler (§4) | d Gang · Sprint · Weitsprung · Wurf FÄLLT | Sprint F/W 1,065 statt 1,646; der Stoß hat keine Feder |
| Stand-Sprung | d TRÄGT BEDINGT | die Bedingung φ_s ≥ 30° hat keine Quelle; `mensch.sport.koerper#1` verlangt auch das Tempo (Sprint FÄLLT) |
| Determinismus | e TRÄGT | kein Ort im Code, sondern der Richter in Bahn 1 und Bahn 2 |

Sprossen, die mit dem Gesetz NICHT fallen können:

| Sprosse | Grund |
|---|---|
| `mensch.geist.generationen#1` | Kinder 22,8 % statt ≥ 35 % |
| `mensch.geist.generationen#3` | e₀ 32,3 J |
| `mensch.sport.koennen#1` | CV der 100-m-Zeit 5,9 % statt 10–20 % |
| `mensch.sport.koerper#1` | Tempo |
| `mensch.sport.koerper#3` | Kraft statt Konstante: Sprint und Wurf fallen |
| `mensch.geist.tag#2` | ≥ 12 Akte verlangt; Bahn 1 behält die 6 des Plans |
| `mensch.menge.rhythmus#2` | am `tagesPlan` nicht gemessen |
