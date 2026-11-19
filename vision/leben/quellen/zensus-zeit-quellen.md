# Zensus Zeit-Quellen — Feld-Zahlen ohne Jahres-Anker (19.11.)

Ergänzt `zensus-pyramide.md` (dort schon: Pyramide, 1 : 29 Elch, Messier-Plateau, kg/Tag, Kälber-Anteil, Obergrenze 69/1 000 km²).
„gelesen" = **ja** (Volltext in `dl-zeit/`, Zeile/Tafel genannt) · **Abstr.** (nur Abstract/Suchauszug) · **nein** (nicht gelesen).
Lebensdauern für „je Leben": Wolf **L_W = 4,5 J** (NPS Yellowstone, Park 4–5 J, außerhalb 2–3 J; Abstr.); Spanne 2–9 J aus
Überleben S: erwartete Restzeit 1/(1−S) mit S = 0,6–0,89 (Hayes 2000; wolf.org Great Lakes 0,6–0,8). Beute: kein gelesener Wert (s. 3).
UBI = Huftier-Biomasse-Index in **Weißwedel-Äquivalenten (WÄ) je km²**: Hirsch 1 · Caribou 2 · Wapiti 3 · Elch 6 · Bison 8
(Boertje 1992 Tab. 1 Fußnote; Hayes 2000 S. 3; Mech & Barber-Meyer 2015 Tab. 1 „one elk equals three white-tailed deer").

## 1 · Numerische Antwort des Wolfs (Dichte gegen UBI)

| Größe | Wert (Spanne) | Einheit | Umrechnung | Quelle | gel. |
|---|---|---|---|---|---|
| Typ 1, ohne Achsenabschnitt, n = 32 | K0 = 3,81 | Wölfe/1 000 km² je WÄ/km² | 1 Wolf je **262 WÄ** | Cariappa et al. 2011, Fig. 1a | ja |
| dito, n = 28 (4 bejagte/wachsende raus) | K0 = 3,95 | dito | 1 Wolf je 253 WÄ | Cariappa 2011, Fig. 1b | ja |
| Typ 2 WD = K1·U/(K2+U), n = 32 | K1 104,56 · K2 19,77 | Wölfe/1 000 km², WÄ/km² | Halbsättigung bei U = 19,8 | Cariappa 2011, Fig. 1a | ja |
| Typ 2, n = 28 | K1 81,54 (SE 35,6) · K2 12,85 | dito | Anfangssteigung K1/K2 = 6,3 | Cariappa 2011, Fig. 1b, S. 727 | ja |
| Typ 3 WD = K3·U²/(K4+U²), n = 28 | K3 35,23 (SE 3,9) · K4 9,14 | dito | Halbsättigung U = 3,0 | Cariappa 2011, Fig. 1b | ja |
| Modellgewichte AICc n = 32 / n = 28 | T1 49/45/6 % · 22/57/21 % (T1/T2/T3) | — | Selbstregulation 51 % bzw. 78 % | Cariappa 2011, Tab. 1, 3 | ja |
| gemitteltes Plateau | 69,3 | Wölfe/1 000 km² | — | Cariappa 2011, Tab. 5 | ja |
| Fuller 2003 linear (mit Achsenabschnitt) | r² = 0,64, n = 32; Gleichung selbst | Wölfe/1 000 km² | Koeffizienten **nicht gelesen** | Kuzyk et al. 2014 S. 878 zitiert | Abstr. |
| Keith 1983 / Fuller 1989 | r² 0,94 (n 7) / 0,72 (n 24) | — | — | Kuzyk 2014 S. 878 | ja (zitiert) |
| Kuzyk quadratisch, Achse 0, n = 26 | ŷ = 5,40·x − 0,166·x², r² 0,85 | Wölfe/1 000 km², x WÄ/km² | Gipfel bei x = 16,3 → 43,9 | Kuzyk 2014 S. 879 | ja |
| Yellowstone NR 2005–12 | 54 Wölfe/1 000 km² bei UBI 14,98 (4,99 Wapiti/km² × 3); Fuller-Modell sagt 55 | — | 1 Wolf je 277 WÄ | Mech & Barber-Meyer 2015 Tab. 1, S. 500 | ja |
| gewichtete Regression (32−6 + YNP) | r² 0,79 → 0,81 | — | linear trägt bis UBI 15 | Mech & Barber-Meyer 2015 S. 501 | ja |
| Gegen-Analyse | Daten tragen keine soziale Regulation | — | — | McRoberts & Mech 2014 | Abstr. |
| Yukon-Prüfung | UBI 1,95 → vorhergesagt 10,6, beobachtet 10,4–10,6 | Wölfe/1 000 km² | Zuwachs-Stopp genau dort | Hayes & Harestad 2000 S. 41 | ja |
| **kg Wolf je kg Huftier** | 0,0038 Wolf/WÄ × m_Wolf/m_WÄ | — | m_WÄ (Weißwedel-Masse) **nicht gelesen**; z. B. 38 kg ÷ 60 kg (Annahme) → 0,24 % | Rechnung | — |

## 2 · Riss und Bedarf je Leben

| Größe | Wert (Spanne) | Einheit | je Leben (L_W 4,5 J; Spanne 2–9) | Quelle | gel. |
|---|---|---|---|---|---|
| Verzehr (aus Pyramide) | 0,13–0,19 | × Körpermasse je Tag | **214–312 × eigene Masse** (95–624) | ME66 via Pyramide | ja (dort) |
| Mindestbedarf (aus Pyramide) | ≈ 3,7 kg/Tag | kg/Tag | ≈ 6 000 kg ≈ 95–160 × Masse (35–64 kg) | MZ16 via Pyramide | ja (dort) |
| Elch-Risse (aus Pyramide) | 10,7 | Elche/Wolf/Jahr | ≈ 48 Elche je Wolfsleben (21–96) | ME66 | ja (dort) |
| Weißwedel-Risse je Wolf/Jahr | — | — | — | Fuller 1989 | nein |
| Wapiti-Risse (aus Pyramide) | 19–27 | Wapiti/Wolf/Jahr | 86–122 je Leben | SM04 | ja (dort) |
| Rubner: Lebens-Umsatz je kg | 191 600 kcal/kg ≈ 800 kJ/g (Rechnung aus kcal) | kJ je g Leib je Leben | — | Rubner 1908, Sekundärauszug | Abstr. |
| Streuung Rubner-Zahl (RMR-Basis) | Faktor 1,5 über Arten; Exponent −0,08…+0,08 | — | etwa massen-unabhängig | Speakman 2005 JEB 208:1717 | Abstr. |
| Gegenbefund (DEE-Basis) | Lebens-Umsatz je g **nicht** massen-unabhängig: kleine Säuger mehr | — | — | Speakman 2005 | Abstr. |

## 3 · Beute je Leben

| Größe | Wert (Spanne) | Einheit | je Leben | Quelle | gel. |
|---|---|---|---|---|---|
| George Reserve, Aufbau aus 6 Tieren (1928) | ≈ 60 %/Jahr (6 Jahre) | Zuwachs/Jahr | r ≈ ln 1,6 = 0,47/Jahr | O'Roke & Hamerstrom 1948 JWM | Abstr. |
| r_max Weißwedel (McCullough 1982) | — | — | — | McCullough 1982 JWM 46:1079 | nein |
| maximaler Dauerertrag Weißwedel | bei N = 56 % K; 49 Tiere/Jahr (stochastisch 43) | Anteil K | Anteil des Bestands **nicht gelesen** | McCullough 2001 (Auszug) | Abstr. |
| Föten je Weißwedel-Kuh | adult 1,85–1,88 · Jährling 1,59–1,89 · Kitz 0,17–0,85 (68 % trächtig) | Föten/Kuh/Jahr | Lebenszahl mangels Lebensdauer **nicht** | Ohio-Studien (Tab. 1), Readyhough et al. | Abstr. |
| Wapiti-Kuh 2–8 J., Überleben | 0,84–0,97 | je Jahr | erwartete Restzeit 6–33 J | MacNulty et al. 2016 S. 4, Fig. 2a | ja |
| Wapiti-Kuh adult (S-Dakota) | 0,95 (0,87–0,99); λ 1,03 (0,93–1,13) | je Jahr | — | Lukacs et al. 2018 | Abstr. |
| Rothirsch r_m, Erstgeburt, Lebensdauer | — | — | — | Caughley 1977; Clutton-Brock (Rum) | nein |

## 4 · Wie stark der Wolf die Beute drückt

| Größe | Wert | Verhältnis · ln | Mit-Ursachen | Quelle | gel. |
|---|---|---|---|---|---|
| Elch-Gleichgewicht Modell | 2,0 ohne → 1,3 Elche/km² mit Wolf allein | 0,65 · −0,43 | Futter-Dichteabhängigkeit; Wolf+Bär → 0,2–0,4 | Messier 1994 Ecology 75:478 | Abstr. |
| Wolf-Prädationsrate dichteabhängig | 0–0,65 Elche/km², darüber invers | — | — | Messier 1994 | Abstr. |
| Yellowstone-Nord, Zählung | 19 045 (Jan 1994) → 3 915 (2013) | 0,21 · −1,58 in 19 J | Rückgang begann **vor** dem Wolf (−2 254 bis Dez 1994); Jagd 940–2 465/J 1995–2002; Bären-Anteil an Kalb-Toden 23 % → 60 %; Pumas +76 %; Zählung übersieht 9–51 % | MacNulty et al. 2016 S. 1–3 | ja |
| Yellowstone 1995–2004 | 17 000 → 8 000 (−8,1 %/J); Modell Jagd+Klima allein −7,9 %/J | 0,47 · −0,75 | Jagd „super-additiv" | Vucetich, Smith & Stahler 2005 Oikos | Abstr. |
| Wolf-Anteil an Kalb-Toden | 14–17 %; Winter-Überleben Kälber 90 % | — | — | Barber-Meyer 2008 via MacNulty 2016 | ja (zitiert) |
| Alter wolfsgerissener Kühe | 89 % von 640 > 10 J; Mittel 14,7 J (14,3–15,0) | — | Madison: 9,1 J (Winter härter) | MacNulty 2016 Fig. 2 | ja |
| Kälber-Anteil an Wolfs-Rissen | ≈ ½; Sommer 62 %, Frühwinter 49 % | — | Jäger nahmen fruchtbare junge Kühe | MacNulty 2016; Metz 2012 | ja |
| kompensatorisch? | „primär kompensatorisch" 1995–2004 | — | umstritten (Montana, Wyoming) | Vucetich 2005 | Abstr. |
| Ripple & Beschta (Kaskade) | — | — | — | Ripple & Beschta 2012 | nein |

## 5 · Raum in einem Zeitfenster

| Größe | Wert (Spanne) | Einheit | Umrechnung | Quelle | gel. |
|---|---|---|---|---|---|
| Tages-Strecke | ♀ 22,1 · ♂ 27,6 | km/Tag | — | Jędrzejewski et al. 2001 CJZ 79:1993 | Abstr. |
| Luftlinie Tag zu Tag | 4,4 km = 21 % der Strecke | km | — | dito | Abstr. |
| Tages-Fläche | 21,4 km² = 9 % des Reviers | km²/Tag | Revier ≈ 238 km²; ≥ 11 Tage je Durchlauf (Rechnung, ohne Überlapp) | dito | Abstr. |
| Wiederkehr an denselben Ort | ≈ alle 6 Tage (Herbst/Winter); Sommer an Bau/Rendezvous gebunden | Tage | — | dito | Abstr. |
| Strecke vor ↔ nach Riss | länger vor dem Riss; kürzer bei mehr Beute | — | — | dito | Abstr. |
| Riss-Lage | Rand gemieden: Hirsche überleben in Puffer-Zonen zwischen Revieren | — | Kern-Dichte < Rand | Mech 1977 Science | Abstr. |
| Rand-Nutzung | äußere 2 km weniger genutzt (418 Ortungen) | — | — | Mech & Harper 2002 | Abstr. |
| Wolf-Abwanderung | 5–100 km; Jahresrate adult 0,17 · Jährling 0,49 · Welpe 0,10 | km; je Jahr | — | Fuller 1989 Abstract | ja |
| Wolf-Abwanderer | Alter 2,9 ± 0,3 J; 77 % zwischen 2–4 J | — | ≈ 0,6 L_W | Hayes & Harestad 2000 S. 40 | ja |
| Hirsch-Abwanderung (Jährlings-Böcke) | Strecke steigt mit sinkender Waldbedeckung (r² 0,94); Dichte ohne Einfluss | — | Median km, Anteil **nicht gelesen** | Long et al. 2005 J Mamm 86:623 | Abstr. |

## 6 · Wurf des Wolfs

| Größe | Wert (Spanne) | Einheit | je Leben / Umrechnung | Quelle | gel. |
|---|---|---|---|---|---|
| Würfe je Rudel | 1 (kein Rudel mit 2 Würfen) | je Jahr | — | Hayes & Harestad 2000 S. 39 | ja |
| Welpen je Wurf bei Geburt | 5,7 ± 0,4 (Yukon) · 6,6 (Minnesota) | Welpen | — | Hayes 2000 · Fuller 1989 | ja |
| Welpen im März / Nov. | 4,3 (Überleben 0,75) · 3,2 Mitte Nov. | Welpen/Rudel | ≈ 0,48 Rekruten je Wolf/J (4,3 ÷ 9) → ≈ 2,1 je Wolfsleben (Rechnung) | Hayes 2000 · Fuller 1989 | ja |
| Überleben Jährling / adult | 0,81 / 0,89 (gesamt 0,84) | je Jahr | dichte-unabhängig | Hayes 2000 S. 39 | ja |
| Würfe nach Beute je Wolf (UBI/Wolf) | hoch 500–850: 6,9 Föten, 96 % aktiv · mittel 180–390: 5,7, 97 % · **niedrig 96–105: 4,6, 66 %** | WÄ je Wolf | Schwelle zwischen 105 und 180 WÄ/Wolf | Boertje & Stephenson 1992 Tab. 1 | ja |
| NA-Spanne UBI/Wolf | 112–659, Mittel 249 (n 25); Fuller-8: 161–659, Wurf ohne Bezug (r 0,37) | WÄ je Wolf | Mittel 249 ≈ 1/K0 (262) | Boertje 1992 S. 2441–2443 | ja |
| Rudelgröße | Elch-Jäger ≈ 10 (Yukon 6–10; 9,0–9,2 bei 2–3 × Beute-Unterschied) · Hirsch-Jäger 5–9 Nov., 4–6 März | Wölfe | Futter je Wolf invers zu Rudelgröße | Hayes 2000 S. 42; Fuller 1989 | ja |
| Zuwachs Minnesota | λ 1,02; Dichte 39–59 Nov. → 29–40 März (16 % Einzelgänger) | je Jahr | Saison-Schwankung ≈ 0,7 | Fuller 1989 Abstract | ja |
| Keith-1983-Schwelle UBI/Wolf | — | — | — | Keith 1983 | nein |

## Fünf Sätze

1. **Tragen:** Die Wolfsdichte hängt am Futter in Weißwedel-Äquivalenten mit einer Steigung von 3,8–4,0 Wölfen je 1 000 WÄ
   (1 Wolf je ≈ 250–280 WÄ). Das bestätigen drei unabhängige Wege: Cariappa K0, Yellowstone 54 bei UBI 15 und Boertjes Mittel von
   249 WÄ je Wolf. Darunter (96–105 WÄ/Wolf) fallen Brunst (66 %) und Wurf (4,6 statt 6,9). Ohne Zeit-Anker lesbar sind auch der
   Raum (9 % des Reviers je Tag, Wiederkehr in ≈ 6 Tagen) und der Wurf (1 je Rudel, ≈ 0,5 Rekruten je Wolf und Jahr).
2. **Tragen nicht:** Kein gelesener Text gibt r_max, Lebensdauer oder Erstgeburt-Alter von Weißwedel, Rothirsch oder Wapiti als
   Bruchteil des Lebens. Die 60 %/Jahr am George Reserve und die Ertrags-Lage bei 56 % K kommen nur aus Auszügen, und den
   entnehmbaren Bestands-Anteil fand ich nicht. Damit fehlt der Beute-Seite der eigene Lebens-Anker. Die Weißwedel-Masse eines WÄ
   ist nicht gelesen, die kg-Quote Wolf/Huftier bleibt also Annahme.
3. **Widerspruch 1 (Form):** Dieselben 32 Punkte geben linear (Mech, r² 0,81 mit Yellowstone) oder sättigend (Cariappa 78 %
   Gewicht; Typ 2 Halbsättigung bei UBI 13–20; Kuzyk-Gipfel 16,3). Yellowstone liegt bei UBI 15 und damit gerade an der Stelle,
   wo die Lesarten sich trennen. Hayes zeigt dieselbe Dichte bei 2–3 × Beute-Unterschied, also einen Deckel im Kleinen.
4. **Widerspruch 2 (Druck):** Messier gibt im Modell 0,65 (ln −0,43) für den Wolf allein. Yellowstone fiel auf 0,21 (ln −1,58),
   doch die Abnahme begann vor dem Wolf, Jagd und Klima erklären allein −7,9 von −8,1 %/J (Vucetich), und Bären töten mehr
   Kälber als Wölfe. Die Yellowstone-Zahl misst also das Mehr-Räuber-plus-Mensch-System, nicht den Wolf.
5. **Kompensation:** Adulte Kühe tragen das Kompensatorische (89 % der Gerissenen > 10 J, Mittel 14,7 J, Prime-Kühe 84–97 %
   Überleben). Bei Kälbern ist es offen: Wolf-Anteil an Kalb-Toden 14–17 % gegen ≈ ½ Kälber unter den Rissen, und das
   Kalb-Kuh-Verhältnis fällt mit der Wolfszahl. Eine Prozentzahl „wäre ohnehin gestorben“ steht in keinem gelesenen Text.

Quellen-Dateien: `leben/dl-zeit/` — cariappa2011.txt · kuzyk2014.txt · mech2015.txt · hayes2000.txt · boertje1992.txt ·
fuller1989.txt (nur Abstract) · macnulty2016.txt · mech-dwc.txt. Fuller 2003 (core.ac.uk) und Long 2005 (pgc.pa.gov) luden nicht.
