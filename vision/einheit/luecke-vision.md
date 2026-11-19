# LÜCKE PLAN ↔ VISION (Opus-Leser, 19.11., nur gelesen)

Gelesen an: Arbeitsbaum HEAD b7ed8419 (der Auftrag nennt dabd69bb — im Baum steht b7ed8419), origin/koordination fc3d0823.
Abkürzungen: MK2 = `vision/meisterkarte-2.json` (Zeile = Zeile der Leiter-ID), PLAN = `vision/PLAN-1712.md`, LAGE = `LAGE.md` (koordination).
Gezählt mit node über MK2 (1 718 Sprossen, 252 Leiter-IDs gefunden, `summe.kriterien` sagt 253 — eine Leiter ohne eindeutige ID-Zeile, unbelegt welche).

## 1 Je Kapitel: Sprossen · gebucht · EIN Gesetz · Zensus · wer baut heute

| Kapitel | Sprossen | gebucht | EIN Gesetz mit Datei | Zensus unterste Ebene | baut heute (19.11.) |
|---|---|---|---|---|---|
| planet | 180 | 4 | Entwurf ja: `ortGesetz()` aus gelaende-core (planet/ENTSCHEID-2.md:19–20), Konsum im Spiel 0 % (ENTSCHEID-2.md:7); in main nur Kommentar gelaende-core.js:1323 | ja (planet/befund-gesicht.md, befund-reise.md) | niemand belegt (LAGE:217–231 ohne Planet) |
| kosmos | 61 | 1 | nein | nein — „bestellt 20.11.“ (PLAN:41) | niemand |
| leben | 223 | 5 | ja: `leben-core.js` / `__lebenCore` (leben/entscheid.md:19–20); Datei NICHT in main (ls im Baum) | ja, 12 Leser-Blätter leben/lesen-*.md | Leben-Kern, Leben-Leser, Herde (LAGE:220, 223, 226–230) |
| mensch | 569 | 8 | nein — drei Teil-Gesetze: Bau `kulturParams` fachwerk-core.js:2025 (bericht/1811-stadt/bau-gesetz.md:9), Bau v2 „BESTEHT NICHT“ (vision/bau/v2/entscheid-v2.md:3), STADT_NETZ (stadt/ENTSCHEID-NETZ.md:1) | Bau ja (vision/bau/lesen-a…h, v3); Verkehr · Person „liegen 19.11.“ (PLAN:40) unbelegt | OMEN Los-Hülle, ROT (LAGE:222, 225) |
| erleben | 274 | 7 | nur Licht: cd/m² + Oklab (licht/entscheid.md:16) für die 6 Leitern erleben.bild (45 Sprossen) | Licht ja, 8 Blätter licht/zensus/a…h | GTX 1050 Licht Welle 1 + Lichtmesser (LAGE:221, 231) |
| same | 198 | 5 | nein | nein — „bestellt 20.11.“ (PLAN:41) | Runde gtx / Register, Preis (LAGE:218) |
| zusammenspiel | 213 | 5 | nein | „Kopplung liegt 19.11.“ (PLAN:40) — kein Blatt gefunden, unbelegt | niemand |
| **Summe** | **1 718** | **35** (beide Geräte 33, Nachwache 2; karte-2-stand.json) | 2 von 7 entschieden (leben, Licht-Teil von erleben), 0 von 7 in main konsumiert | 4 von 7 | 4 von 7 Kapiteln |

## 2 Wort des Schöpfers gegen Karte und Plan

PLAN trägt KEINES der Wörter: Epoche 0 · Fahrzeug 0 · Wagen 0 · Galax 0 · Stoff 0 · Material 0 · Belag 0 · Burg 0 · Hütte 0 · Spiegel 0 · Stufe 0 · LOD 0 · Studio 0 · Foto 0 (grep -ci). PFAD.md desgleichen außer Wagen 2 · Stufe 4. `docs/das-lebendige-feld.md` und `docs/roadmap.md`: Epoche · Fahrzeug · Galax · Stoff · Hütte · Burg je 0. Die Vision des Worts lebt NUR in MK2.

| Teil des Worts | in MK2 | Lücke |
|---|---|---|
| Epochen | 113 Sprossen nennen „Epoche“; Leiter mensch.zeit.spanne (Z. 11392, 7 Sprossen, 0 gebucht) | in keinem Plan |
| Fahrzeuge ihrer Zeit | mensch.fahrzeug.gestalt Sprosse 2 „Land −5000 bis 2150, Gestalt je Epoche“ (Z. 9003); erleben.kopplung.epoche-ganz 3 (Z. 19334) | in keinem Plan |
| Fahrzeug passt zur Stadt / Umgebung | KEINE Sprosse koppelt Fahrzeug-Gestalt an Epoche und Kultur der Stadt, in der es fährt; nur indirekt epoche-ganz 3 | Lücke in Karte UND Plan |
| keine Spiegel-Schlieren bei Fahrt | 0 Sprossen (Spiegel/Reflex/Schliere × Fahrt/Bewegung) | Lücke in Karte UND Plan |
| Millionen Fahrzeuge | mensch.netz.verkehr Sprosse 6 „10⁷ Fahrzeuge“ (Z. 8309) | Plan/Pflicht C endet bei 20 Wagen (PFAD.md:29) |
| Materialien der Häuser | mensch.bau.huelle 2 „Fuge, Maserung, Verwitterung“ (Z. 8621); erleben.bild.flaeche 5 „Stoffe aus dem Gesetz … Putz/Ziegel/Beton der Epoche“ (Z. 14469) | in keinem Plan |
| Beläge | keine Leiter; 8 Sprossen nennen Belag/Pflaster/Asphalt nebenbei (z. B. mensch.stadt.form 6) | Lücke in Karte UND Plan |
| erste Laubhütte | 0 Sprossen „Hütte“; frühestes Bauen mensch.zeit.spanne 3 „Lager, Dorf ohne Metall“ | Lücke (nur implizit) |
| Burg | mensch.macht.wehrbau (Z. 10254, 8 Sprossen, 1 gebucht) | in keinem Plan |
| größte Bauten der Zukunft | mensch.bau.bedarf 5 Megastruktur (Z. 8553); same.entfaltung.schirm 6 Türme bis 2 km (Z. 16027) | in keinem Plan |
| fotorealistisch | 58 Sprossen mit Foto-Blindpaar im Richter | in keinem Plan |
| Galaxien | planet.kosmos.galaxien (Z. 2902) + 21 Sprossen „Galax“ | kosmos ohne Gesetz, ohne Zensus |
| Einheit statt LOD je Studio | keine Leiter misst „EIN Stufen-Gesetz für alle Arten“; nächstes: erleben.bild.ferne „Ferne = Nähe“ (Z. 14280), mensch.bau.huelle 2 „Stufenwechsel unsichtbar“ | PLAN:33 ordnet nach Kapitel-Gewicht, nie nach geteiltem Gesetz |

Schnitt: PLAN §2.3 (Z. 33) fällt; an seine Stelle tritt die Reihenfolge nach Grundgesetz aus §4 dieses Blatts, und die drei Lücken (Fahrzeug×Stadt-Epoche, Spiegel bei Fahrt, Belag) werden je EINE Sprosse in den bestehenden Leitern mensch.fahrzeug.gestalt, erleben.bild.flaeche und mensch.stadt.form (keine neue Leiter).

## 3 Die Rechnung

- Verlauf `vision/karte-2-stand.json` (git log koordination): 15.11. 12:50 heute 0 (erster Commit der Datei) → 17.11. 14:18 Gipfel 40 → 19.11. 11:21 heute 35 (beide 33).
- Rate letzte 7 Tage (12.–19.11.): 35 ÷ 7 = **5,0 je Tag**; ab der ersten Buchung 35 ÷ 3,94 Tage = 8,9 je Tag; seit dem Gipfel **−5 in 45 h** (Rückfall).
- Offen: 1 718 − 35 = 1 683. Tage 19.11. → 17.12.2026: 28. Nötig: **60,1 je Tag** = das **12,0-fache** der 7-Tage-Rate (6,8-fach der Rate seit Buchungsbeginn).
- Bei 5,0 je Tag stehen am 17.12. 175 von 1 718 (**10,2 %**); bei 8,9 je Tag 284 (16,5 %). PLAN:65 rechnete 270 bei 8 je Tag — dieselbe Größe.
- Zwilling im Plan: PLAN:20 „Richter-Tafel 61 Zeilen, 1 657 können nicht fallen“ — die Tafel trägt heute 1 716 Zeilen (1 434 „gleich“, 282 „fehlt“; richter-tafel.json, Falte 19.11. 05:13). Die Bremse des Plans ist gefallen, die Rate nicht gestiegen: der Engpass ist nicht mehr der Richter, sondern Gesetz + Preis.

Schnitt: PLAN:18–20 und :65 werden durch EINE Zeile ersetzt, die buche-2.cjs schreibt (Rate 7 Tage aus dem git-Verlauf von karte-2-stand.json, nötige Rate, Faktor) — keine Hand-Zahl mehr im Plan.

## 4 Grundgesetze, an denen viele Leitern hängen (gezählt an umfang + tiefe + richter jeder Sprosse)

Muster (node, nur Sprossen-Text, nicht Leiter-Name): Stufe = `Stufe|Ferne|Fernsicht|Orbit|ohne Lade|nahtlos|LOD|Übergang`; Stoff = `Stoff|Material|Belag|Oberfläche|Textur|Albedo|Holz|Ziegel|Lehm|Beton|Glas|Metall|Pflaster|Asphalt`; Zeit = `Epoche|Jahrhundert|Jahrtausend|Äon|Zeitalter|Zeitsprung|datier|Zeitreise`.

| Grundgesetz | Sprossen | Leitern | je Kapitel (Sprossen) | dichteste Leitern |
|---|---|---|---|---|
| ZEIT (Epoche als Funktion) | **169** | 116 | mensch 70 · same 25 · zusammenspiel 25 · erleben 23 · leben 11 · planet 10 · kosmos 5 | mensch.zeit.spanne 5, leben.evolution.zeitreise 4, mensch.leib.tracht 4, mensch.geist.generationen 4, mensch.zeit.erde 4, same.gedaechtnis.schicht 4 |
| STOFF (ein Stoff-Gesetz für Bild, Klang, Physik) | **100** | 71 | mensch 30 · same 22 · erleben 17 · zusammenspiel 12 · leben 8 · kosmos 6 · planet 5 | erleben.bild.flaeche 4, same.physik.feuer 4, same.physik.stoffe 4, mensch.leib.stoff 3, erleben.klang.ereignis 3 |
| STUFE (Ferne = Nähe, Kosten am Schirm) | **91** | 66 | mensch 25 · planet 18 · erleben 17 · same 12 · zusammenspiel 9 · leben 8 · kosmos 2 | erleben.bild.ferne 9, same.kopplung.aufwaerts 4, mensch.stadt.vertikal 3, mensch.stadt.siedlungsnetz 3, same.massstab.spanne 3 |
| Vereinigung | **339** (19,7 % der Karte) | — | 21 Sprossen tragen zwei der drei | — |
| PREIS (Bedingung jeder Sprosse, PLAN:76) | 1 718 | 253 | alle | same.preis.takt |

Lesart: die Muster sind ein Wortzähler, keine Abhängigkeits-Analyse — die echte Abhängigkeit ist größer (z. B. braucht jede Sprosse mit „10⁴ Bauten im Blick“ die Stufe, ohne das Wort zu tragen); die Zahl ist die Untergrenze.

Zwilling STUFE im Code (die Frage des Schöpfers „einzelne LOD-Systeme je Studio“): das FORMAT ist geeint — 7 Kerne tragen dieselbe Karte `lod.kindStages/budget` mit 11 Arten (vehicle-core.js:40, tetrapoda-core.js:41, koerper-core.js:39, porta-core.js:63, schmiede-core.js:61, fachwerk-core.js:86, worlds/neuntes-buch/stele-core.js:25), phyto liest sie (phyto-core.js:6170). Die GRENZE nicht: „ab welchem Abstand fällt die Stufe“ beantworten zwei Stellen verschieden — je Art in Metern (`ab:` 35 tetrapoda-core.js:46 · 40 koerper-core.js:49 · 9,5/12 porta-core.js:87–88 · 14/32 stele-core.js:30–31) und global foundry-core.js:433–434 (d0 12, d1 26 m), dazu eigene Pfade phyto-core.js:3769 (`lodCrossfadeMask`), worlds/terrain/phytogenesis.js:2731 (`updateTreeLOD`), worlds/fachwerk/fachwerk.js:131 (`lodTick`). Welcher Leser `ab:` liest: unbelegt.

Schnitt STUFE: die Grenze wird EINE Funktion der projizierten Größe am Schirm (Gebot 7) im Foundry-Kern; die sechs `ab:`-Meter und d0/d1 sterben im selben Commit, phyto und fachwerk-Studio lesen dieselbe Funktion — bewegt die 91 Stufen-Sprossen und die Preis-Bedingung zugleich.
Schnitt STOFF: `same.physik.stoffe` wird die EINE Stoff-Zeile (Albedo, Rauheit, Klang, Bruch, Brand, Epoche), aus der erleben.bild.flaeche 5, mensch.bau.huelle 2 und der Belag lesen; himmel-korn `korn` und `farbe.pflaster` (LAGE, 18.11. 06:50) ziehen in diese Zeile statt eigener Spalten.
Schnitt ZEIT: die Epoche wird EIN Argument `epoche(Saat, Ort, Jahr)` im Kern, das Bau (`kulturParams` fachwerk-core.js:2025), Tracht, Fahrzeug-Gestalt und Licht lesen — die 169 Sprossen hängen an einem Leser statt an sieben.

## 5 Zwillinge beim Namen

- Kapitel-Zählung: `vision/kapitel/*.json` sagt mensch 609 Sprossen / 17 erreicht, same 283 / 12, planet 297 / 0, leben 251 / 4, erleben 310 / 0 (gezählt; kapitel/mensch.md:9 „17 von 609“) — MK2 sagt 569 / 8, 198 / 5, 180 / 4, 223 / 5, 274 / 7. Schnitt: kapitel/*.json verlieren `heute` und Summen, MK2 ist die einzige Zahl.
- Plan-Bremse: PLAN:20 (61 Zeilen) gegen richter-tafel.json (1 716) — s. §3.
- Gesetz ohne Haus: `leben-core.js` entschieden (leben/entscheid.md:19), nicht in main; `planet-core.js` in main, Konsum 0 % (ENTSCHEID-2.md:7) — „Gesetz deklariert, Zwilling fährt“ in zwei Kapiteln.

Unbelegt: welche Leiter die 253. ist; Zensus Kopplung/Verkehr/Person (PLAN:40) ohne Blatt; Leser von `ab:`; ob ein Planet-Arbeiter heute fährt; die Abhängigkeit über das Wort hinaus (§4 ist Untergrenze).
