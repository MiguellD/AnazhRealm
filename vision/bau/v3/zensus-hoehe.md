# ZENSUS HÖHE — Runde 3, Zahl 2 (Lese-Baum n1011-hg main b7ed8419, nur gelesen)

Kern FC = `fachwerk-core.js`, SHA-256 028cc2d0…bea06, byte-gleich mit der Kopie `p3/n1811/bau-spike3/kern/` (gedruckt und
verglichen). Skript `v3/zaehl-hoehe.cjs` (sha256 2b6d6f7f…), Ausgabe `v3/zaehl-hoehe.log`. Gezählt sind dieselben 2 595
Haushalts-Lose der 30 Pläne G (Saat 1–30, nH 90; pool.cjs:94–100), alle 30 städtisch, alle ummauert, Gründung −105 … 1549.
Laufzeit 57 s. Markierung: **belegt** · **gewählt** · **unsicher**.

## WAS NICHT HÄLT (zuerst)

1. **„Druck → Geschosse“ (v2) war am HEUTIGEN Kern nie gemessen.** Heute korreliert die Höhe mit dem Rang des Loses:
   ρ(Traufe, t) = −0,532, also mit dem v2-„Druck“ 0,5 + 0,5·(1 − t) +0,532. Die Kette der Runde 2 senkte das auf 0,125, weil
   ihr Druck die Häuser ungültig machte (spike-v2.md:49–55). Der Rang wirkt aber heute NICHT über einen Bodenpreis. Er wirkt
   über eine Wohlstands-Formel mit Würfel (FC:4438) und eine Schwelle (FC:4444). **belegt**
2. **Die „Traufe-Spanne 4,70 m“ ist ein grobes Maß.** Die Traufe ist an allen 2 595 Losen genau 3,10 + 2,35·(st − 1) (kein
   pilotis, kein egH/ogH im hp; FC:178, 211–215). Die Spanne Q90 − Q10 ist darum ein Vielfaches von 2,35 m: 4,70 = (st 3) − (st 1).
   Sie hält genau dann, wenn ≥ 10 % der Häuser 1 Geschoss haben und > 10 % mindestens 3 (heute 13,6 % und 41,2 %). Jede
   künftige Schwelle „≥ 4,70 m“ prüft also zwei Anteile, keine Streuung. **belegt**
3. **Die Höhe ist heute zu einem Fünftel reiner Würfel, zur Hälfte Tafel-Wert der Rolle, nur zu einem Achtel Ort und Zeit.**
   Das Zitat „die Höhe ist HEUTE verursacht“ (entscheid-v2.md:25) hält nur in dem Sinn, dass ein Rang-Eingang existiert. Die
   Spanne trägt eine Schwelle auf einem halb gewürfelten Wohlstand (unten). **belegt**
4. **Kein in der Wirklichkeit belegter Eingang erreicht heute die Geschosszahl.**
   - Die Lage im Plan (Markt, Mitte) entsteht in `dorfLayout` (FC:5357) erst NACH der Höhe (DORF FC:4428–4451).
   - Eine Los-Breite gibt es in den Plänen G nicht (`pl.lose` null, spike-v2.md:71–72).
   - Eine Höhen-Regel nach Straße oder Tiefe (`STADT_FORM.stab`, FC:4494) wirkt nur mit `DP.erbe`.
   - Eine Aufstockung gibt es nicht: `fr[]` ersetzt den früheren Bau (FC:4431, 4450), er hebt ihn nicht.

   **belegt**

## DER SATZ

**Die 4,70 m Spanne trägt heute allein die Wohl-Stufe FC:4444.** Sie gibt +1 Geschoss, wenn die Stadt städtisch ist,
`wohl > 0,9` und st < 4.
- Ohne sie fällt Q90 von 7,80 auf 5,45 m, die Spanne also auf 2,35 m.
- 825 der 1 070 Häuser mit ≥ 3 Geschossen stehen nur durch sie dort, 226 durch die Rolle, 19 schon durch die Kultur.
- `wohl` = (1,22 − 0,5·t) · (0,78 + 0,44·Würfel) (FC:4438): halb Gründungs-Rang t mit Tafel-Konstanten, halb Würfel. In der
  Varianz ist das 17,3 % Rang und 16,0 % Würfel.
- Die Rolle trägt 47,7 % der Varianz, aber 0 m der Spanne: ohne Rolle bleibt Q10/Q90 bei 3,10 / 7,80.

## (a) WORAUS DIE GESCHOSSZAHL HEUTE FOLGT — die Kette am Kern (belegt)

| Stufe | Zeile | Eingang | Natur |
|---|---|---|---|
| Kultur wählen | FC:4435 `pool[(rnd()·pool.length)|0]`; Pool = `poolAt(by)` FC:4424 = REGION_HIST-Ära der Region am Baujahr | Region (Planwürfel FC:4410), Baujahr (Würfel FC:4433), Würfel | Ort/Zeit + Würfel |
| Kultur-Geschosse | KULTUR[k].st FC:2121–2153 über `_bauweiseWurf` FC:2210 (Streuung ±1,5 nur für st ≥ 4) | Tafel | Tafel-Wert |
| Wohlstand +1 | FC:4438 (wohl), FC:4444 (`staedtisch && w > 0,9 && st < 4`) | Los-Index i → t, Würfel | Rang-Formel + Würfel |
| Stadtkörper / Turm | FC:4440–4443 (nur jahr > 1880), FC:4453–4457 (Moderne), FC:4445/4491–4495 (`DP.erbe`) | — | in den Plänen G nicht aktiv |
| Rolle des Loses | Viertel nach Los-Index (FC:4384, STADT_GRAMMATIK FC:4326–4344), Patrizier/Wohnturm nach wohl ≥ 1,1 ∧ f < 0,45 (FC:4340), Grund-Satz Gasthaus/Schmiede (FC:4323, 4468) → Maß-Zeile BAU_NUTZUNG (FC:2184–2200), angewandt FC:2227–2228 | Index (Lage), wohl | Tafel-Wert |
| Traufe | FC:178, 211–215: foundH 0,55 + egH 2,55 + ogH 2,35·(st − 1) | st | reine Funktion von st |

Die Kette ist an 2 571 von 2 595 Losen nachgebaut (Rest 24, 0,5 % der Varianz; Ursache **unsicher**; die sechs gedruckten sind Wohnhäuser,
nachgebaut um 1 Geschoss zu tief). Gebaut = Plan: `slot.ov.storeys = hp.storeys` an 2 595/2 595.

**Zerlegung** Var(st) = 0,764 (Traufe 4,22 m² = 2,35²·Var(st)), Anteil = Cov(Δ, st)/Var(st), Summe 100 % (zaehl-hoehe.cjs:92–107):

| Ursache | Anteil | Urteil |
|---|---|---|
| Rolle / Viertel-Zeile (FC:2184–2200) | **47,7 %** | Tafel-Wert. Die Lage der Rolle ist Los-Index (Kern = Markt) und wohl. Der Wert (Patrizier „≥ 3“, Kaufhaus „≥ 3“, Wohnturm „6“, Schmiede/Backhaus „1“) trägt keinen Anker |
| Wohl → +1, Rang-Teil (FC:4438/4444) | 17,3 % | Rang = Gründungsfolge. Echt ist nur die Richtung (Kern reicher); 1,22 − 0,5·t und die Schwelle 0,9 sind Tafel |
| Wohl → +1, Würfel-Teil (FC:4438) | 16,0 % | reiner Würfel |
| Ort/Zeit (Region × Ära des Pools, FC:4424) | 12,2 % | in der Welt begründet: die Bauweise der Region und Zeit. Die Geschosszahl je Kultur ist Tafel |
| Kultur-Würfel im Pool (FC:4435) | 6,2 % | reiner Würfel |
| Maß-Würfel st ≥ 4 (FC:2210) | 0,0 % | in diesen Plänen ohne Wirkung |
| Rest (Nachbau ≠ Plan) | 0,5 % | unsicher |

**Reiner Würfel zusammen: 22,3 %.** Je Rolle (n · st Ø · t Ø):
- Wohnhaus 1 691 · 2,15 · 0,59
- Patrizier 355 · 3,0 · 0,26
- Werkstatt 204 · 1,85
- Kaufhaus 102 · 3,0 · 0,07
- Wohnturm 57 · 6,0
- Schmiede 30 · 1
- Backhaus 25 · 1

## (b) WAS DIE WIRKLICHKEIT BELEGT, UND OB DER EINGANG IM SPIEL SCHON EXISTIERT

| Kandidat | Beleg (Quelle · Zahl) | Status | Eingang im Spiel |
|---|---|---|---|
| **Straßenrang → Geschosse** (Bauordnung) | London Rebuilding Act 1667, §§ III, VII–X: by-lanes 2 Geschosse, streets and lanes of note 3, high and principal streets 4 (jeweils ohne Keller und Dachgeschoss), Geschosshöhen 9 / 10 / 10½ / 9 / 8½ ft; Mansion houses ≤ 4 ([British History Online](https://www.british-history.ac.uk/node/40002)) | **belegt** (Gesetzestext, Abschnitte paraphrasiert) | Straßen-Graph im Export (`ex.roads`/`graph`), aber erst nach der Höhe (FC:5357 nach FC:4451); ob die Kanten einen Rang tragen, ist **nicht gelesen** → **fehlt** als Eingang der Höhe |
| **Traufhöhe nach Straßenbreite** | Paris: Déclaration royale 10.4.1783 + Lettres patentes 1784 binden Fassadenhöhe an Straßenbreite ([actu-juridique](https://www.actu-juridique.fr/histoire-du-droit/des-fiacres-aux-trottinettes-paris-face-au-defi-de-la-reglementation-urbaine/)); Zahl „~18 m“ ([safekipedia](https://safekipedia.com/adventurer/wiki/Paris_in_the_18th_century)) | Regel **belegt**, Zahl **unsicher** | Straßenbreite `N.strasseW`/`laneW` in dorfLayout (FC:5358), nach der Höhe; `STADT_FORM.stab` (Traufe ≤ stab·D) nur mit erbe (FC:4494) → **fehlt** |
| **Bodenpreis / Lage am Markt** | Burgage-Lose: die Schmalheit „rationiert die wertvolle Straßenfront“ am Markt (Society of Antiquaries of Scotland, [PSAS](https://journals.socantscot.org/index.php/psas/article/download/9608/9575/9560)). Höhe fällt mit dem Abstand vom Zentrum (Alonso-Muth-Mills, Stadtökonomie) — für vormoderne Städte nicht nachgeschlagen | Front-Rationierung **belegt**; Höhe ↔ Bodenpreis vormodern **unsicher** | Lage existiert: `slot.x/z`, `ex.platz` (FC:9849–9864). Sie wird nach der Höhe gerechnet; die Höhe liest nur den Index t (FC:4438), aus dem auch die Lage wächst (`edepth` FC:5369) → **Schatten, kein Eingang** |
| **Schmales Los → in die Höhe** | Amsterdam: Steuer nach Frontbreite → Häuser oft < 9 m breit, bis 30 m tief, „up to seven stories“ ([dutchreview](https://dutchreview.com/culture/amsterdam-canal-houses/), Lincoln Institute über [progress.org](https://www.progress.org/wiki/lincoln-institute-past-forward-property-tax-history/)) | **unsicher** (Reiseseiten; die Steuer selbst mehrfach genannt) | **fehlt**: kein Los in den Plänen G; W ist Hausfront und zu 58 % Würfel (entscheid-v2.md:24) |
| **Stadtmauer-Enge** | Edinburgh: Flodden-Mauer (um 1513, [Canmore](https://canmore.org.uk/site/119866)), Häuser innerhalb der Mauer bis 14 Geschosse ([RCPE](https://www.rcpe.ac.uk/heritage/overcrowding)); Genf: Aufstockung der Altstadt beim Flüchtlings-Zuzug, weil die Stadt nicht nach außen wachsen konnte ([Musée de la Réforme](https://www.musee-reforme.ch/content/2files/in-the-footsteps-of-the-reformation.pdf), [geneve.ch](https://www.geneve.ch/en/what-geneva/discover-geneva-districts/eaux-vives-cite/anecdotes); Datum 16. oder 17. Jh. strittig) | Richtung **belegt**, Zahlen 12–14 **unsicher** | Mauer existiert: `walled`, `Rw = 26 + 8,4·√nG` (FC:5363–5364). Die Mauer folgt aber der Häuserzahl, nicht die Höhe der Mauer → **Eingang da, liest die Höhe nicht** |
| **Zeit / Aufstockung** | Genf (oben): bestehende Häuser bekamen Geschosse aufgesetzt | **belegt** (Richtung) | Baujahr existiert (FC:4433); einen Mechanismus „aufstocken“ gibt es nicht (fr[] = Ersatzbau FC:4431, 4450) → **fehlt** |
| **Stoff (Fachwerk-Stockwerkbau, Stein)** | Stockwerkbau: jedes Geschoss auf eigener Schwelle, darum konnten Häuser in die Höhe wachsen; ab dem 15. Jh. oft auf gemauertem EG ([Planet Wissen](https://www.planet-wissen.de/gesellschaft/arbeit/handwerk/fachwerkhaeuser-100.html), [Baunetz](https://www.baunetzwissen.de/holz/fachwissen/holzbausysteme/fachwerkbauweise-7820010)); keine Geschosszahl gefunden | Ermöglichung **belegt**, Zahl **fehlt** | `stil` existiert (FC:188, Kultur) → **Eingang da** |
| **Wohlstand des Haushalts** | allgemein (größerer Haushalt, mehr Raum); nicht nachgeschlagen | **unsicher** | `wohl` FC:4438 (Rang + Würfel), Haushalt in Plänen G ohne Köpfe |

## (c) DIE KANDIDATEN GEGEN DIE HEUTIGEN DATEN (zaehl-hoehe.log; 2 595 Lose; ρ mit Geschossen = ρ mit Traufe, da linear)

| Kandidat | Beleg | Eingang im Spiel | ρ heute (alle · Median je Plan · nur Wohnhäuser) | η² | Urteil |
|---|---|---|---|---|---|
| Abstand zum Markt | belegt (Front), Höhe unsicher | Lage ja, liest die Höhe nicht | −0,339 · −0,398 · −0,253 | 0,12 | Korrelation ohne Kausalpfad: Höhe und Lage folgen beide dem Los-Index |
| Abstand zur Mitte | wie oben | wie oben | −0,351 | 0,13 | wie oben |
| Gründungs-Rang t (Index) | — (Konstruktion) | ja, FC:4438 | −0,532 · −0,604 · −0,360 | 0,26 | die heutige Ursache. Belegt ist nur die Richtung „alter Kern höher“, nicht die Formel |
| Wohlstand wohl | unsicher | ja, FC:4438/4444 | +0,667 · +0,726 · +0,582 | 0,41 | trägt die Spanne. Halb Würfel |
| Front-Breite W (statt Los) | unsicher | Los fehlt; W halb Würfel | +0,063 · +0,25 · −0,065 | 0,08 | **keine Ursache**: die Richtung „schmal → hoch“ fehlt ganz (Vorzeichen null bis positiv) |
| Tiefe D | — | ja | +0,015 | 0,10 | keine |
| Baujahr (Zeit) | belegt (Aufstockung) | Baujahr ja, Aufstockung fehlt | −0,039 | 0,03 | **keine Ursache** heute |
| Stoff (stil) | belegt (ermöglicht) | ja | — | 0,05 | trägt nicht |
| Kultur | — | ja | — | 0,15 (Wohnhäuser 0,47) | Tafel-Wert; im Wohnhaus der stärkste Einzel-Eingang |
| Rolle | belegt nur Wohnturm-Typ (nicht nachgeschlagen) | ja | — | **0,60** | Tafel-Wert, größter Varianz-Anteil, 0 m Spanne |
| Region / Plan | — | ja | — | 0,08 / 0,09 | schwach |
| Mauer-Enge (Häuser/ha je Plan) | belegt (Richtung) | Rw ja, liest die Höhe nicht | +0,283 über 30 Pläne | — | **nicht prüfbar**: die Dichte streut nicht (Q10/Q90 26,0 / 27,0 Häuser je ha, alle 30 ummauert). Rw folgt nG (FC:5364) |

**Für die nächste Runde, damit sie keine Ursache behauptet, die keine ist:**
1. Ein Rang-, Lage- oder Druck-Eingang korreliert heute schon mit 0,53. Eine Kette, die ihn hat und darunter fällt, verliert
   eine heutige Ursache. Sie ist dann nicht „noch ohne Ursache“.
2. Die belegten Eingänge sind:
   - Straßenrang (London 1667: 2 / 3 / 4 Geschosse);
   - Straßenbreite (Paris 1783/84);
   - Mauer-Enge;
   - Aufstockung über die Zeit.

   Davon existiert im Plan heute nur die Mauer, und auch sie erst nach der Höhe. Ein Gesetz, das die Höhe aus der Straße
   ableitet, muss die Reihenfolge DORF → dorfLayout umkehren oder die Straßen-Klasse vor die Höhe ziehen. Das ist **nicht
   gelesen**: ob `strassengraph` (FC:5365) einen Rang je Kante trägt.
3. Die Schwelle „≥ 4,70 m“ hält, solange > 10 % der Häuser 3 Geschosse haben und ≥ 10 % eines. Als Maß taugt besser die
   Verteilung der Geschosszahl je Straßen-Klasse, z. B. gegen London 2 / 3 / 4 (**gewählt**, Vorschlag).

## WAS UNSICHER BLEIBT
- Die 24 nicht nachgebauten Lose (0,5 %).
- Die „Rang-Teil / Würfel-Teil“-Trennung des Wohl-Sprungs: E[Sprung | t-Dezil] ist eine Näherung, kein exakter Nachbau des
  Würfels. Der Würfel `rnd()` in FC:4438 ist nicht einzeln zurückgerechnet.
- Alle Web-Belege sind Zusammenfassungen von Such- und Abrufseiten. Gelesen ist nur der Text des London Act (British History
  Online, Abschnitte VII–X), und auch der nur als Paraphrase des Abrufs. Paris 54 pieds / 18 m sind nicht bestätigt.
- Nur Pläne G (Gründung ≤ 1549, nH 90). Epochen, Ringe (jahr > 1700), Moderne und das Erbe der Kachel (FC:4440–4445, 4491–4495)
  sind nicht gezählt. Dort greifen weitere Höhen-Eingänge.
