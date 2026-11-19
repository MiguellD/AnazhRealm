# Zensus Antwort-Quellen — die Rückstell-Kraft des Wolfs im Feld (19.11., 30 Web-Schritte)

Ergänzt `zensus-zeit-quellen.md` und `zensus-raten-quellen.md` (Cariappa, Boertje, Hayes, Fuller-Abstract, Stahler, Messier-Plateau dort; hier nicht wiederholt).
Vermerk: **VT** = Volltext gelesen (Datei in `leben/dl-antwort/`) · **Abstr.** = nur Abstract · **Sek.** = Sekundär-Quelle · **Rechnung** = meine Arithmetik.
Achtung VT-Extraktion: pdftotext verliert in Vucetich 2002 Tab. 4 die Zeichen ×, − und ±; „4.19 102" lese ich als 4,19 × 10⁻². Die Probe dafür steht in Zeile 1.4.

## 1 · Funktionelle Antwort (Risse je Wolf gegen Beute)

| # | Größe | Wert | Einheit | Ort / Studie | Quelle | Vermerk |
|---|---|---|---|---|---|---|
| 1.1 | Modellwahl, 94 Rudel-Winter 1971–2001 | verhältnis-abhängig aN/(P+ahN) Rang 1 (AICc-Gewicht 0,335, R² 0,336); beute-abhängig Typ II nur R² 0,17, ΔAICc ≈ 20 | — | Isle Royale | Vucetich, Peterson & Schaefer 2002, Ecology 83:3003, Tab. 1 (isleroyalewolf.org/s/Vucetich_et_al_2002.pdf) | VT |
| 1.2 | Wolf-Dichte allein erklärt mehr als Elch-Dichte | R² 0,36 ↔ 0,17 | — | dito | Vucetich 2002, Abstract + Tab. 2 | VT |
| 1.3 | Parameter verhältnis-abhängig | a = 4,19 × 10⁻² (SE 7,51 × 10⁻³) · h = 0,58 (SE 6,42 × 10⁻²) | Risse/Wolf/Monat (Fig. 1, Tab.-3-Fußnote) | dito | Vucetich 2002, Tab. 4 | VT (Zeichen s. Kopf) |
| 1.4 | daraus Plateau 1/h · **Halb-Sättigung N/P = 1/(a·h)** | **1,72 Risse/Wolf/Monat · 41 Elche je Wolf** | — | Probe: beobachtet 0,44–1,69 Risse/Wolf/Monat (Vucetich & Peterson 2004) liegt unter dem Plateau | Rechnung | — |
| 1.5 | Parameter beute-abhängig Typ II aN/(1+ahN) | a = 1,48 × 10⁻³ · h = 0,42 → Plateau 2,38/Monat, Halb-Sättigung N = 1 609 Elche (≈ 2,9 Elche/km² bei ≈ 549 km²) | Elche (Insel) | dito | Vucetich 2002 Tab. 4; Fläche aus 50 Wölfen = 91/1 000 km² (Peterson & Page 1988) | VT + Rechnung |
| 1.6 | Schwelle θ (Beute, unter der kein Wolf lebt) | frei geschätzt 5,3 × 10⁻⁶ ± 405,8 (nicht bestimmbar); aus Messier: 4 Wölfe tragen 82 ± 81 Elche | Elche | dito | Vucetich 2002, S. 3010 | VT |
| 1.7 | Messier, 27 Elch-Studien, Michaelis-Menten | Plateau 3,36 Elche/Wolf/100 Tage (= 1,02/Monat, Rechnung); Prädationsrate dichte-abhängig 0–0,65 Elche/km², darüber invers | — | Nordamerika | Messier 1994, Ecology 75:478 (agris.fao.org) | Abstr. |
| 1.8 | Messier **Halb-Sättigung 0,46 Elche/km²** | — | — | — | Messier 1994 | **NICHT GELESEN** (steht nicht im Abstract; Volltext JSTOR gesperrt) |
| 1.9 | Skandinavien ↔ Isle Royale bei gleicher Elch-Dichte | Elche je Wolf 499 ↔ 55; Riss-Rate je Wolf × 3; bestes Modell ln[Elche/Wolf], R² 0,80–0,81, kein Orts-Unterschied der Steigung | — | Süd-Mittel-Skandinavien 2001–08 ↔ IR 1971–2010 | Sand, Vucetich, Zimmermann et al. 2012, Oikos 2012, doi 10.1111/j.1600-0706.2012.20082.x (isleroyalewolf.org/s/Sand_Vucetich_et_al_2012.pdf), S. 4 + Tab. 1 | VT |
| 1.10 | Riss-Rate sinkt mit Rudelgröße | beide Orte p < 10⁻⁴; kleine Rudel (2–4) in SCA weit über IR, 5–9 gleich | — | dito | Sand 2012, Fig. 1C | VT |
| 1.11 | Jost et al. 2005: Sättigung und Verhältnis-Abhängigkeit auf gemischter Skala | Parameter | — | Isle Royale | Jost, Devulder, Vucetich, Peterson & Arditi 2005, J. Anim. Ecol. 74:809 | Abstr.; Zahlen **NICHT GELESEN** |
| 1.12 | Hebblewhite 2013 · Zimmermann 2015 · Kolenosky 1972 · DelGiudice (Weißwedel) | — | — | — | — | **NICHT GELESEN** (Web-Budget) |

## 2 · Numerische Antwort als Gradient (Wachstum, Wurf, Welpen, Abwanderung)

| # | Größe | Wert | Einheit | Ort / Studie | Quelle | Vermerk |
|---|---|---|---|---|---|---|
| 2.1 | **Wachstum gegen Riss-Rate, linear** | dP/(P·dt) = 0,50 · KR − 0,44 (R² 0,22; ohne Messfehler-Korrektur Steigung 0,36) | je Jahr; KR Risse/Wolf/Monat | Isle Royale 1971–2001 | Vucetich & Peterson 2004, Oikos 107:309, Gl. 3 (isleroyalewolf.org/s/Vucetich_and_Peterson_2004_Oikos.pdf) | VT |
| 2.2 | daraus Null-Wachstum bei | KR = 0,88 Risse/Wolf/Monat → mit 1.3: **≈ 43 Elche je Wolf** | — | — | Rechnung aus 2.1 + 1.3 | — |
| 2.3 | Spanne der Wachstumsrate | −0,53 bis +0,76 je Jahr; Modell-Grenzen −0,44 (KR 0) bis +0,42 (Plateau) | je Jahr | Isle Royale | Vucetich & Peterson 2004 S. 311; Grenzen Rechnung | VT |
| 2.4 | Netto-Wirkungsgrad Wolf aus Elch | 0,69 % ± 0,20 (bis 1,38 %, wenn Verzehr = ½ Riss) | kg Wolf je kg assimilierter Elch | dito | Vucetich & Peterson 2004 S. 312 | VT |
| 2.5 | Erklärte Varianz des Wolf-Wachstums | Beute-Verfügbarkeit 42 % (nach Krankheit + Elche ≥ 9 J.), Zufall der kleinen Zahl ≈ 30 %, Winter direkt 4 % | — | dito | Vucetich & Peterson 2004, Abstract | VT |
| 2.6 | Rudel-Phasen: Anstieg ↔ Einbruch ↔ Gleichgewicht | Rudel 9,5 ↔ 4,7 ↔ 6,5 · Überleben/Jahr 84–87 % ↔ 49 % ↔ 66–67 % · Rekruten 2 Welpen/Rudel (Gleichgewicht) | — | Isle Royale 1975–86 | Peterson & Page 1988, J. Mammal. 69:89 (digitalcommons.mtu.edu/michigantech-p/13826) | Abstr. |
| 2.7 | Welpen-Produktion je Wurf beim Hirsch-Einbruch | 1,5–3,3 Welpen/Wurf je Jahr; Reihenfolge: erst Welpen-Hunger, dann weniger Welpen, dann Rudel-Streit | Welpen | NO-Minnesota | Mech 1977, J. Mammal. 58:559 | Sek. (Suchauszug; usgs/openpolar 403) |
| 2.8 | Wachstum folgt Welpen je Rudel im November | korreliert; Würfe 6,6 bei Geburt → 3,2 Mitte Nov. | — | N-Minnesota | Fuller 1989 (wrrb.ca, Abstract-PDF) | Abstr. |
| 2.9 | Welpen-Überleben Nov–Apr gegen Beute je Wolf | 0,79 (SNF, ohne Beute-Bezug) | je Halbjahr | Superior NF 1968–2018 | Barber-Meyer, Wheeldon & Mech 2021, Biol. Conserv. 258:109145 | VT |
| 2.10 | Wurf-Größe/Brunst gegen WÄ je Wolf | im Vorzensus (Boertje 1992 Tab. 1), nicht wiederholt | — | — | — | — |
| 2.11 | Welpen-Überleben gegen Hirsche je Wolf (Fuller 1989 Kurve) · Harrington, Mech & Fritts 1983 · Fuller et al. 2003 Tafeln · **Abwander-Alter gegen Beute** | — | — | — | — | **NICHT GELESEN** (Monographie nur Abstract-PDF; UNL/USGS 403) |
| 2.12 | Abwanderung vor dem Einbruch | in den 2 Jahren vor 1980–82 hoch, Rudel schrumpften | — | Isle Royale | Peterson & Page 1988 | Abstr. |

## 3 · Revier-Größe und Rudel-Größe gegen Beute

| # | Größe | Wert | Einheit | Ort / Studie | Quelle | Vermerk |
|---|---|---|---|---|---|---|
| 3.1 | Holarktis-Modell, 14 Orte 42–66° N | bei 100 kg Huftier/km²: 140 km² (40° N) · 370 (50° N) · 950 (60° N); Breite + Beute-Biomasse die Haupt-Faktoren | km² | Holarktis | Jędrzejewski et al. 2007, Ecography 30:66 | Sek. (Suchauszug des Abstracts; Exponent **NICHT GELESEN**) |
| 3.2 | lokal Białowieża | Revier und Kern sinken mit Huftier-Begegnungsrate; Rudel 3–8 ohne Einfluss | — | Ost-Polen | Jędrzejewski 2007 | Sek. |
| 3.3 | Ontario | Habitat-Güte (Elch-Belegung) invers zur Revier-Größe, ohne Bezug zur Rudel-Größe | — | N-Ontario | Kittle et al. 2015, J. Anim. Ecol. 84:1177 | Abstr. |
| 3.4 | Skandinavien ↔ Isle Royale | Revier 960 (SE 136) ↔ 306 (SE 17) km² · Rudel 4,1 ↔ 6,3 · Elche je Wolf 499 ↔ 55 | km² | dito | Sand 2012 S. 4 | VT |
| 3.5 | Montana, 38 Rudel | 206–1 652 km², Mittel 556; Hirsch-Index nicht im besten Modell; Nachbar-Rudel je Fläche negativ, Gelände + Menschen positiv (R² 0,68) | km² | Montana 2008–09 | Rich, Mitchell, Gude & Sime 2012, J. Mammal. 93:722 | VT |
| 3.6 | Hirsch-Jäger Minnesota | Winter-Revier 78–153 km², „bezogen auf Hirsch-Dichte" | km² | N-Minnesota | Fuller 1989 | Abstr. |
| 3.7 | Rudel-Größe gegen Beute | klein bei wenig Beute (Messier 1985 via Dritte); Isle Royale 9,5 → 4,7 im Einbruch | Wölfe | — | Messier 1985 (Sek.); Peterson & Page 1988 (Abstr.) | Sek./Abstr. |
| 3.8 | Fuller 2003 Revier ~ Biomasse · Mattisson 2013 · Messier 1985 Zahlen | — | — | — | — | **NICHT GELESEN** (gesperrt/Budget) |

## 4 · Sterblichkeit des Wolfs mit der Dichte (Rudel-Kampf, Hunger)

| # | Größe | Wert | Einheit | Ort / Studie | Quelle | Vermerk |
|---|---|---|---|---|---|---|
| 4.1 | Todes-Ursachen 1968–2018 (261 Tote) | natürlich 102 = 51 Kampf + 41 Hunger/Krankheit + 10 andere; menschlich 111; unbekannt 48 | Tiere | Superior NF (Minnesota) | Barber-Meyer et al. 2021, S. 6 | VT |
| 4.2 | Raten adult je Jahr | natürlich 0,09 · davon Kampf 0,05, Hunger/Krankheit 0,03 · menschlich 0,09 | je Jahr | dito | Barber-Meyer 2021 Tab. 2 | VT |
| 4.3 | Welpen Nov–Apr | natürlich 0,06, Hunger/Krankheit 0,06 die größte natürliche Ursache | je Halbjahr | dito | Barber-Meyer 2021 Tab. 2 | VT |
| 4.4 | Kampf-Tode gegen Wolfsdichte | **kein** Bezug (P 0,74; Vorjahr 0,69) bei 17–47 Wölfen/1 000 km²; Jahresrate 0,0048 | — | Superior NF | Mech & Barber-Meyer 2017, J. Mammal. 2017, doi 10.1093/jmammal/gyx113 | VT |
| 4.5 | Kampf + Gesamt-Sterblichkeit steigen ab | **55–60 Wölfe/1 000 km²** | Wölfe/1 000 km² | Yellowstone-Nord | Cubaynes et al. 2014 via Mech & Barber-Meyer 2017 S. 7 | Sek. |
| 4.6 | Dichte-abhängiges Überleben durch Kampf, unabhängig von Beute; im beute-armen Inneren keine Dichte-Abhängigkeit (280 Wölfe, 13 J.) | — | — | Yellowstone | Cubaynes et al. 2014, J. Anim. Ecol. 83:1344 | Abstr. |
| 4.7 | Kampf-Anteil an natürlichen Toden | ≈ ⅔; Nord-Dichte 20,1–98,5, Mittel 52,9 Wölfe/1 000 km² | — | Yellowstone | Yellowstone Science 24-1, „Territoriality and Inter-Pack Aggression" (nps.gov) | Sek. |
| 4.8 | Kampf-Anteil, bejagte Population | 10 % der Toten; 80 % menschlich | — | N-Minnesota | Fuller 1989 | Abstr. |
| 4.9 | Isle Royale Einbruch | Überleben 84–87 % → 49 %; Ursachen Hunger + Rudel-Kampf (Anteile **NICHT GELESEN**); Krankheit (Parvovirus) mit im Spiel | — | 1980–82 | Peterson & Page 1988 (Abstr.); Vucetich & Peterson 2004 S. 309 (VT) | Abstr./VT |
| 4.10 | Mech 1977 Anteile Hunger/Kampf in Zahl | — | — | NO-Minnesota | — | **NICHT GELESEN** (nur Reihenfolge, Sek.) |

## 5 · Zeit-Verzug, Schwingung, Zusammenbruch

| # | Größe | Wert | Einheit | Ort / Studie | Quelle | Vermerk |
|---|---|---|---|---|---|---|
| 5.1 | **Verzug Wolf hinter Beute** | Wolfsdichte folgt der Elch-Sterberate (= Futter je Rudel) mit **2–3 Jahren** | Jahre | Isle Royale 1975–86 | Peterson & Page 1988 | Abstr. |
| 5.2 | Gipfel und Einbruch | 50 Wölfe (91/1 000 km²) 1980 → Einbruch 1980–82 → 20–24 (wie 1960er) | Wölfe | dito | Peterson & Page 1988 | Abstr. |
| 5.3 | dito, Projekt-Seite | 1981 tiefste Riss-Rate (< ⅓ typisch), Bestand 30 → 14; höchste Riss-Rate 1992 (> 2 × Mittel) | — | dito | isleroyalewolf.org/population-dynamics | Sek. (widerspricht 5.2 im Startwert: 50 ↔ 30) |
| 5.4 | Futter erklärt Wachstum schlecht | Elche je Wolf erklärt Riss-Rate R² 0,53, Prädationsrate 0,63, Wolf-Wachstum nur 0,19 | — | dito | isleroyalewolf.org/population-dynamics | Sek. |
| 5.5 | Deterministisch stabil ↔ beobachtet instabil | verhältnis-abhängige Modelle geben stabile Punkt-Gleichgewichte; IR schwankt, Winter erklärt weitere 10–15 % der Riss-Varianz | — | dito | Vucetich 2002 S. 3009 | VT |
| 5.6 | **Insel ohne Menschen: Zusammenbruch** | 117 km² (45 sq mi), 4 Wölfe 1960 → ≥ 13 (1964) → 3 (Feb 1966; Losung 7 ↔ 201 im Vorjahr; 6 von > 100 Losungen nur Wolf = Kannibalismus) → 1 (1968) → keiner (1983), Hirsche wieder zahlreich | Wölfe | Coronation Island, SO-Alaska | Klein 1995 (ADFG-PDF ist Scan, nicht lesbar) via Rozell 2004, Alaska Science Forum | Sek. |
| 5.7 | Gipfel → Ende | 4 Jahre Anstieg, 2 Jahre Fall auf 3, 8 Jahre bis 1 Wolf | Jahre | dito | Rechnung aus 5.6 | — |
| 5.8 | Elch-Absturz ohne Wolf | 1996 starben 80 % der Elche, vor allem Hunger, nach Hoch bei wenig Wölfen 1980–96 | — | Isle Royale | Peterson 1999 via Suchauszug | Sek. |
| 5.9 | Mehr-Gleichgewicht | 2,0 ohne Räuber · 1,3 mit Wolf · 0,2–0,4 Elche/km² bei Wolf + Bär oder schlechtem Habitat | Elche/km² | Modell, 27 Studien | Messier 1994 | Abstr. |
| 5.10 | Minnesota-Verzug in Jahren | — | — | — | Mech 1977 | **NICHT GELESEN** |

## Widersprüche

- Form 1: Isle Royale wählt das Verhältnis-Modell (Halb-Sättigung ≈ 41 Elche/Wolf), aber es erklärt nur 34 %. Messier passt über 27 Orte ein Beute-Dichte-Modell (Plateau 1,02/Monat). Mit 1,72/Monat liegt das IR-Plateau 1,7 × höher.
- Form 2: Sand 2012 trägt ln[Elche/Wolf] bis 499 Elche je Wolf ohne erkennbares Plateau, und die Riss-Rate liegt dort 3 × über IR. Ein Plateau aus IR-Daten (55 Elche/Wolf im Mittel) ist also extrapoliert.
- Dichte-Bremse: Yellowstone (Cubaynes) zeigt Kampf-Tode, die mit der Dichte steigen, ab 55–60/1 000 km². Superior NF zeigt keinen Bezug bis 47/1 000 km². Die Bremse wirkt also nur oberhalb einer Dichte, die die meisten Bestände nie erreichen.
- Isle Royale 1980: Startwert 50 (Peterson & Page) gegen 30 (Projekt-Seite für 1981). Der Einbruch hat zwei Ursachen, Futter und Parvovirus (Vucetich & Peterson 2004).

Dateien in `leben/dl-antwort/`: Vucetich_et_al_2002 (.pdf/.txt, v2002raw.txt) · Vucetich_and_Peterson_2004_Oikos · Vucetich_PredationRate_2011 ·
Sand_Vucetich_et_al_2012 · snf2021 · seas367 · rich2012 · nps-ys24.txt · fuller1989 (nur Abstract) · ibs1672 (Nowak 2008, Fehltreffer) · cub.html, mech1977.html, coronation.pdf (leer/HTML).
