# BRÜCKE — die alte Karte in der neuen

Die alte Karte (33 Bereiche, 165 Kriterien, je 0–2 Punkte) steht bei **223 von 330**. Jedes ihrer Kriterien ist hier einer Sprosse der neuen Karte zugeordnet — fast immer Sprosse 1 oder 2 einer Leiter mit 5–9 Sprossen. Darum werden aus 68 % der alten Karte 0,0 % gebucht und 0,9 % im Kern der neuen: die alte Karte misst den Fuß der Leitern, und gebucht wird in der neuen nur der eigene Richter am Kopf (Z2).

**Nichts Gemessenes fällt.** Jede gebuchte Station bleibt, wie sie in `meisterkarte-quelle/punkte/stand.json` steht, und bleibt der Beleg ihrer Sprosse. Was sich ändert, ist nur, was sie in der neuen Karte wiegt:

- **76 der 223 Punkte** stützen sich auf mindestens eine Station, die im echten Spiel an Radeon UND GTX grün ist — das sind die Anwärter auf den Kern; ein Punkt wird daraus erst mit einer Fahrt des Richters der Sprosse am Kopf.
- **23 Punkte** stehen im echten Spiel nur an EINEM Gerät, **124 Punkte** nur headless: Mechanik, kein Erlebnis (R2). Sie heben keine Sprosse, sie nennen aber genau, welcher Lauf im Fenster fehlt.
- **30 alte Kriterien (42 Punkte) messen einen WEG** statt eines Ergebnisses; sie stehen unten beim Namen mit dem Ergebnis-Richter, der sie ersetzt.
- In der neuen Karte zählen heute 0 Sprossen als Punkt und 19 als Kern. Von den alten Kriterien liegt die Messung bei keinem auf einer Punkt-Sprosse und bei 18 auf einer Kern-Sprosse.

Lesart der Tabellen: **gebucht** = Punkte der alten Karte und woran die Stationen je Staffel grün sind · **Sprosse** = Heim in der neuen Karte · **misst schon** = was die bestehende Station für diese Sprosse liefert · **zählt als** = Gewicht nach den Regeln Z1–Z8: **Kern** heißt im echten Spiel an beiden Geräten grün, ohne Preis oder ohne die Fahrt des eigenen Richters; einen **Punkt** gibt nur diese Fahrt.


## 1 · Gelände, Boden und Wasser — alt 8/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| gelaende.K1 | EIN 3D-Gesetz im Kern, Studio-Plan = Welt byte-gleich | 2/2 · 1: headless · 2: headless | `same.entfaltung.gleichheit` S 1 | — | WEG — ersetzt |
| gelaende.K2 | Das Wasser folgt jedem Edit: Graben, Damm, Ferne | 1/2 · 1: Radeon + GTX · 2: — | `mensch.nahrung.erdbau` S 1<br>auch: `same.physik.fluid`, `planet.relief.wandel` | Graben füllt sich im Ausgabe-Bild | **Kern** |
| gelaende.K3 | Wasser-Bild aus dem Gesetz an jeder Pose | 1/2 · 1: nur GTX | `planet.wasser.seegang` S 1<br>auch: `leben.wasser.bild` | spiegelTreue an 1 von 12 Posen | im Spiel an EINEM Gerät |
| gelaende.K4 | EIN Wasser-Spiegel für alle Leser | 2/2 · 1: headless · 2: headless | `planet.kopplung.siedlungslage` S 1<br>auch: `planet.relief.grossform`, `planet.wasser.stroemung`, `same.kopplung.kohaerenz` | 50-Punkte-Mutation, Läufe enden in See oder Meer | Mechanik (headless) |
| gelaende.K5 | EINE Boden-Höhe je Rolle: Huf, Rad, Fuß ≤ 3 cm | 2/2 · 1: headless · 2: Radeon + GTX | `planet.kopplung.siedlungslage` S 1<br>auch: `erleben.spieler.praesenz` | Kontakt p95 ≤ 3 cm im Bild | im Spiel gemessen, Richter der Sprosse oder Preis offen |

## 2 · Wetter und Klima — alt 9/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| wetter.K1 | Wetter = f(Saat, Ort, Zeit), nie aus der Wanduhr | 2/2 · 1: headless · 2: headless | `planet.wetter.lagen` S 1<br>auch: `same.entfaltung.gleichheit` | — | WEG — ersetzt |
| wetter.K2 | Nässe: Regen benetzt — EIN Zustand | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `planet.kopplung.wetter-welt` S 3 | Nässe im Bild an beiden Geräten; in der Glieder-Leiter zählt sie für sich (Z3) | **Kern** |
| wetter.K3 | Der Wasser-Kreislauf: Regen speist die Flüsse | 2/2 · 1: headless · 2: Radeon + GTX | `planet.wasser.kreislauf` S 1 | Pegel nach Sturm im Bild, Bilanz | **Kern** |
| wetter.K4 | Temperatur und Schnee-Decke mit Tiefe | 1/2 · 1: headless | `planet.wasser.eis` S 1<br>auch: `planet.wetter.klimazonen`, `planet.kopplung.bahn-klima` | Schnee-Deckung und Einsinken | Mechanik (headless) |
| wetter.K5 | Wind: EIN Feld, vom Gelände geformt | 2/2 · 1: headless · 2: headless | `planet.kopplung.wetter-welt` S 2<br>auch: `same.physik.flug` | Wind-Leser am Verhalten | Mechanik (headless) |

## 3 · Physik der Körper — alt 7/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| physik.K1 | EIN Körper-Gesetz: Masse aus Volumen × Stoff | 2/2 · 1: headless · 2: headless | `same.physik.koerper` S 1<br>auch: `same.physik.stoffe` | Masse, Impuls, Auftrieb der Leiber und Dinge | Mechanik (headless) |
| physik.K2 | Kontakt ohne Durchdringen im festen Takt | 1/2 · 1: headless · 2: — | `same.physik.koerper` S 1 | kein Durchdringen der Leiber | Mechanik (headless) |
| physik.K3 | Freie Körper und Trümmer: kippen, stapeln, brechen | 2/2 · 1: headless · 2: headless | `same.physik.koerper` S 1<br>auch: `same.physik.tragen` | Kisten ruhen, Fass fällt | Mechanik (headless) |
| physik.K4 | Seile, Tuch, Weiches — EIN Löser | 1/2 · 1: headless | `same.physik.verformung` S 1<br>auch: `mensch.leib.stoff` | das Seil am Leib | Mechanik (headless) |
| physik.K5 | Der aktive Leib: Gleichgewicht, Stolpern, Sturz | 1/2 · 1: headless | `mensch.sport.koerper` S 2 | Stoß → Ausfallschritt | Mechanik (headless) |

## 4 · Stoffe und Chemie — alt 9/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| stoffe.K1 | EINE Stoff-Tafel in SI, jede Wirkung liest sie | 1/2 · 1: headless | `same.physik.stoffe` S 1 | — | WEG — ersetzt |
| stoffe.K2 | Feuer: zünden, ausbreiten, verzehren, löschen | 2/2 · 1: headless · 2: headless | `same.physik.feuer` S 1<br>auch: `same.physik.reaktion` | Front im Rothermel-Band | Mechanik (headless) |
| stoffe.K3 | Phasen: Gefrieren, Schmelzen, Erstarren, Glühen | 2/2 · 1: headless · 2: headless | `same.physik.feuer` S 1<br>auch: `planet.geologie.vulkan`, `planet.wasser.eis` | Eis trägt, Lava erstarrt | Mechanik (headless) |
| stoffe.K4 | Verwitterung mit der Zeit: Rost, Vergrauen, Moos, Trampelpfad | 2/2 · 1: headless · 2: headless | `same.gedaechtnis.alter` S 1<br>auch: `same.gedaechtnis.pfad`, `leben.kopplung.leben-formt-planet` | Δ Albedo nach 30 Tagen | Mechanik (headless) |
| stoffe.K5 | Nährstoff, Nachwuchs, Sukzession | 2/2 · 1: headless · 2: headless | `leben.oeko.sukzession` S 1<br>auch: `leben.oeko.stoffe`, `same.kopplung.stoerung`, `same.kopplung.zeitreise` | Brand → Gras → Busch → Wald | Mechanik (headless) |

## 5 · Das lebendige Feld — alt 9/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| feld.K1 | Kopplungs-Tiefe: eine Ursache, eine Kette über ≥ 4 Teilsysteme | 2/2 · 1: headless · 2: headless | `same.kopplung.kaskade` S 2 | Kette Regen → Nässe → Stoff → Brand → Licht mit Festhalte-Probe | Mechanik (headless) |
| feld.K2 | Gleich für alle: Saat + Schreib-Akte = Welt (byte-gleich) | 2/2 · 1: headless · 2: headless | `same.entfaltung.gleichheit` S 1<br>auch: `same.entfaltung.akte` | — | WEG — ersetzt |
| feld.K3 | Ruhe ist Null: in Ruhe arbeitet keine Simulation | 2/2 · 1: headless · 2: headless | `same.entfaltung.abwesenheit` S 1<br>auch: `same.preis.takt` | — | WEG — ersetzt |
| feld.K4 | Die Tat bleibt am Ort: Spur und Gedächtnis | 2/2 · 1: headless · 2: headless | `same.kopplung.zeitreise` S 1<br>auch: `same.entfaltung.akte` | Lichtung bleibt über Reload und wächst nach | Mechanik (headless) |
| feld.K5 | Das Feld wird gesehen: Konsum am Ort der Tat | 1/2 · 1: headless | `erleben.sinn.ziele` S 1<br>auch: `leben.oeko.partner` | Antwort am Ort der Tat | Mechanik (headless) |

## 6 · Vegetation — alt 4/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| vegetation.K1 | Die Wiese wurzelt dicht und bunt bis zum Saum | 0/2 · 1: — | `leben.pflanzen.dichte` S 1 | Ring-Bildanteil 0–40 m | ungemessen oder ROT |
| vegetation.K2 | Die sichtbare Böe | 1/2 · 1: Radeon + GTX | `leben.pflanzen.kraft` S 1 | Luma-Varianz mit Böen-Laufzeit | **Kern** |
| vegetation.K3 | Der Wald von innen | 0/2 · 1: — | `leben.pflanzen.dichte` S 1<br>auch: `leben.pflanzen.lebenslauf` | Stamm-Dichte und Unterholz gegen REF | ungemessen oder ROT |
| vegetation.K4 | Die Natur-Wand: kein Halm im Haus | 1/2 · 1: nur GTX · 2: — | `leben.kopplung.stadt-im-netz` S 1 | Halm-Pixel 0 je Haus-Box | im Spiel an EINEM Gerät |
| vegetation.K5 | Die Jahreszeit als Gestalt | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `leben.pflanzen.jahreslauf` S 1 | Kronen-Deckung Winter ↔ Sommer | **Kern** |

## 7 · Tiere — alt 8/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| tiere.K1 | Verband: Zusammenhalt, Ausrichtung, Alarm-Kette | 1/2 · 1: headless · 2: — | `leben.tiere.masse` S 1<br>auch: `leben.tiere.verhalten` | Kohäsion der Herde | Mechanik (headless) |
| tiere.K2 | Der Jagd-Kreislauf | 2/2 · 1: headless · 2: Radeon + GTX | `leben.tiere.verhalten` S 1 | Riss-Quote, Hetze im Bild | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| tiere.K3 | Gang und Leib: der Fuß steht | 2/2 · 1: headless · 2: Radeon + GTX | `leben.tiere.bewegung` S 1<br>auch: `leben.evolution.bauplan` | Schlupf, Gangart nach Froude | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| tiere.K4 | Lebensraum und Tagesrhythmus | 2/2 · 1: headless · 2: headless | `leben.kopplung.evolution-planet` S 1<br>auch: `leben.tiere.verhalten`, `leben.tiere.arten` | Gattung wählt Boden-Klasse | Mechanik (headless) |
| tiere.K5 | Begegnung im Bild, Dichte | 1/2 · 1: nur Radeon | `leben.oeko.vielfalt` S 1<br>auch: `leben.tiere.masse` | Sichtungen je 10 Spielminuten | im Spiel an EINEM Gerät |

## 8 · Ökologie — alt 10/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| oekologie.K1 | Die trophische Kaskade | 2/2 · 1: headless · 2: headless | `leben.oeko.dynamik` S 1<br>auch: `erleben.kopplung.emergenz` | Wölfe weg → Hirsche hinauf, Jungwuchs hinab | Mechanik (headless) |
| oekologie.K2 | Bestand aus Nahrung × Lebensraum | 2/2 · 1: headless · 2: headless | `leben.oeko.netz` S 1<br>auch: `leben.tiere.lebenszyklus` | Bestand folgt der Nahrung | Mechanik (headless) |
| oekologie.K3 | EIN Furcht-Gesetz: das Wesen erinnert | 2/2 · 1: headless · 2: headless | `leben.tiere.verhalten` S 1<br>auch: `leben.tiere.mensch` | Abstand nach Schlag | Mechanik (headless) |
| oekologie.K4 | Der Spieler im Kreislauf: Beute sein | 2/2 · 1: headless · 2: Radeon + GTX | `leben.tiere.mensch` S 1 | gepirscht und umstellt im Bild; die Annäherungs-Probe der Sprosse ist ungefahren | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| oekologie.K5 | Bindung und Ansteckung | 2/2 · 1: headless · 2: headless | `mensch.nahrung.tier` S 1<br>auch: `leben.tiere.mensch` | gebundenes Tier folgt ≥ 10 min | Mechanik (headless) |

## 9 · Menschen und Bewohner — alt 8/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| mensch.K1 | Besiedlung und Skala: der Plan wird Körper | 1/2 · 1: nur Radeon | `mensch.menge.bevoelkerung` S 1<br>auch: `mensch.menge.bild` | Zensus Körper ÷ Σ leute | im Spiel an EINEM Gerät |
| mensch.K2 | Tagesablauf: Rolle × Uhr × Ort | 2/2 · 1: headless · 2: Radeon + GTX | `mensch.geist.tag` S 1<br>auch: `mensch.menge.rhythmus`, `mensch.wirtschaft.beruf`, `same.entfaltung.abwesenheit`, `mensch.nahrung.strom` | Soll-Orte über 24 h | **Kern** |
| mensch.K3 | Wege und Raum: Gassen, Türen, keine Durchdringung | 2/2 · 1: headless · 2: headless | `mensch.menge.dichte` S 1 | Ausweichen ohne Berührung | Mechanik (headless) |
| mensch.K4 | Körper, Vielfalt, Ausdruck | 2/2 · 1: nur Radeon · 2: headless | `mensch.leib.gesicht` S 1<br>auch: `mensch.leib.verschieden`, `mensch.menge.bild` | Kopf im Third an der Soll-Tafel | im Spiel an EINEM Gerät |
| mensch.K5 | Begegnung, Gespräch, Gedächtnis | 1/2 · 1: nur Radeon | `mensch.geist.gespraech` S 1<br>auch: `mensch.menge.kollektiv` | Zuwendung ≤ 0,5 s, Berührung 0 | im Spiel an EINEM Gerät |

## 10 · Die Welt fühlt und wertet mit — alt 6/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| affekt.K1 | Die Wertung antwortet am Ort: der δ-Kreis | 2/2 · 1: headless · 2: Radeon + GTX | `erleben.sinn.ziele` S 1 | Gewöhnung und Antwort am Ort | **Kern** |
| affekt.K2 | Die Emotion formt die Welt | 1/2 · 1: headless | `erleben.kopplung.emergenz` S unter 1 | Stimmung verschiebt eine Größe am Ort | Mechanik (headless) |
| affekt.K3 | Der Nexus spielt mit: schreibt, wertet, lernt | 1/2 · 1: headless | `erleben.schoepfen.gespraech` S 6<br>auch: `erleben.kopplung.emergenz` | — | WEG — ersetzt |
| affekt.K4 | Die Welt erklärt sich: die Stimme des Felds | 0/2 · 1: — · 2: — | `erleben.sinn.legenden` S 1<br>auch: `erleben.klang.stimme` | jede Zeile eine wahre Tat mit Ort | ungemessen oder ROT |
| affekt.K5 | Die Musik liest das Feld | 2/2 · 1: headless · 2: headless | `erleben.klang.musik` S 1<br>auch: `erleben.klang.getuemmel` | Chroma folgt der Valenz; der Hörer-Blindtest der Sprosse ist ungefahren | Mechanik (headless) |

## 11 · Haar, Fell und Kleidung — alt 5/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| haar.K1 | Fell aus dem Gesetz im Bild | 1/2 · 1: Radeon + GTX | `leben.tiere.arten` S 1 | Klasse Fell an der Soll-Tafel | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| haar.K2 | Haar aus dem Gesetz | 0/2 · 1: — | `mensch.leib.gesicht` S 2 | Strähnen-Kohärenz gegen REF | ungemessen oder ROT |
| haar.K3 | Bewegung: im EINEN Wind und mit dem Leib | 1/2 · 1: headless | `mensch.leib.stoff` S 2 | Haar und Mähne korrelieren mit dem Wind | Mechanik (headless) |
| haar.K4 | Kleidung aus der Epoche, als Tuch am Leib | 2/2 · 1: headless · 2: headless | `mensch.leib.tracht` S 1<br>auch: `mensch.kultur.gestalt`, `mensch.leib.stoff` | zwei Epochen im Bild unterscheidbar | Mechanik (headless) |
| haar.K5 | Haar und Fell zahlen am Schirm (Befehle je Klasse) | 1/2 · 1: nur Radeon | `mensch.leib.gesicht` S 1<br>auch: `leben.tiere.arten` | — | WEG — ersetzt |

## 12 · Leben in Luft und Wasser — alt 10/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| luftwasser.K1 | Der Vogel fliegt und ruft aus seinem Körper | 2/2 · 1: headless · 2: headless | `leben.tiere.arten` S 1<br>auch: `erleben.klang.landschaft` | Vogel-Leib fliegt und ruft | Mechanik (headless) |
| luftwasser.K2 | Schwärme aus dem Verbands-Gesetz | 2/2 · 1: headless · 2: headless | `leben.tiere.masse` S 2 | Φ und Kohäsion des Schwarms | Mechanik (headless) |
| luftwasser.K3 | Fische lesen die Strömung | 2/2 · 1: headless · 2: headless | `leben.wasser.netz` S 1<br>auch: `leben.wasser.lebensraeume` | Ausrichtung gegen die Strömung, Pegel-Hub | Mechanik (headless) |
| luftwasser.K4 | Insekten und Bestäuber lesen das Feld | 2/2 · 1: headless · 2: headless | `leben.oeko.partner` S 1 | r(Bestäuber, Blüten) | Mechanik (headless) |
| luftwasser.K5 | Ein Schwarm ist fern EIN Agent (CPU-ms, Befehle) | 2/2 · 1: nur GTX · 2: Radeon + GTX | `leben.tiere.masse` S 3 | — | WEG — ersetzt |

## 13 · Licht, Himmel, Wolken, Tag-Achse — alt 4/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| licht.K1 | Die Tag-Kurve: monoton, stetig, golden, Nacht lesbar | 0/2 · 1: — | `planet.kosmos.himmelsmechanik` S 1<br>auch: `erleben.bild.himmel` | Sprung ≤ 0,1 EV je Uhrschritt | ungemessen oder ROT |
| licht.K2 | Licht-Bilanz an einer Kugel: Sonne zu Himmel | 1/2 · 1: Radeon + GTX · 2: — | `erleben.bild.himmel` S 1<br>auch: `planet.kosmos.welten` | Verhältnis 5–12,5 am Mittag | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| licht.K3 | EIN Lichtweg: alle Wege zeigen dieselbe Fläche gleich hell | 1/2 · 1: nur GTX · 2: — | `erleben.kopplung.bild` S 1 | Helligkeit nah ↔ fern im Band | im Spiel an EINEM Gerät |
| licht.K4 | Wolken mit Körper und Schatten | 1/2 · 1: nur Radeon | `planet.wetter.wolken` S 1 | Schatten wandert mit dem Wolkenfeld | im Spiel an EINEM Gerät |
| licht.K5 | Wetter und Nacht als Zustände des EINEN Mediums | 1/2 · 1: Radeon + GTX | `erleben.bild.himmel` S 3<br>auch: `erleben.bild.auge`, `planet.kopplung.wetter-welt` | Wetter-Zug ohne Sprung > 0,1 EV/s | im Spiel gemessen, Richter der Sprosse oder Preis offen |

## 14 · Ferne bis zum Horizont — alt 6/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| ferne.K1 | Die Luft macht Tiefe: Koschmieder je Kanal | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `erleben.bild.ferne` S 1 | Kontrast e^(−βd) im Band — die Luft-Hälfte des Richters | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| ferne.K2 | Die Welt hat keine Kante | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `erleben.bild.ferne` S 3<br>auch: `same.massstab.spanne` | Restkontrast am Rand ≤ 2 % | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| ferne.K3 | Bewaldete Grate tragen einen Saum bis 8 km | 0/2 · 1: — | `erleben.bild.ferne` S 3<br>auch: `same.massstab.spanne` | Kohärenz am Kamm gegen REF | ungemessen oder ROT |
| ferne.K4 | Grate werfen Abendschatten in ferne Täler | 1/2 · 1: nur Radeon | `erleben.bild.ferne` S 4 | Luma Schatten-/Lichthang | im Spiel an EINEM Gerät |
| ferne.K5 | Die Ferne im Wetter: Sicht, Vorhang, Dunst | 1/2 · 1: Radeon + GTX | `erleben.bild.ferne` S 5 | Sicht im Sturm 1,5 km | im Spiel gemessen, Richter der Sprosse oder Preis offen |

## 15 · Material-Tiefe — alt 5/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| material.K1 | Albedo im realen Band, Labor = Welt | 0/2 · 1: — · 2: — | `erleben.bild.flaeche` S 1<br>auch: `leben.pflanzen.arten` | Albedo je Klasse gegen Tabellenwert | ungemessen oder ROT |
| material.K2 | Mikro-Detail bis Armlänge | 1/2 · 1: Radeon + GTX | `same.massstab.nahe` S 1 | Korn, das der Pixel trägt | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| material.K3 | Dieselbe Albedo in jeder Stufe | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `same.massstab.spanne` S 1<br>auch: `mensch.bau.huelle` | kein Farbsprung am Stufenwechsel | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| material.K4 | Spiegelung aus EINER Quelle | 1/2 · 1: nur GTX | `erleben.bild.flaeche` S 2<br>auch: `planet.wasser.seegang` | spiegelTreue an Glas oder Lack | im Spiel an EINEM Gerät |
| material.K5 | Rauheit und Glanz aus der Stoff-Zeile | 1/2 · 1: Radeon + GTX | `erleben.bild.flaeche` S 2 | Glanz-Breite gegen gemessene BRDF | im Spiel gemessen, Richter der Sprosse oder Preis offen |

## 16 · Schatten und indirektes Licht — alt 4/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| schatten.K1 | Schatten scharf am Kontakt, weich mit Abstand | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `erleben.bild.flaeche` S 1 | Halbschatten am Fuß und Zuwachs je Meter | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| schatten.K2 | Ruhige Schatten unter Bewegung | 1/2 · 1: nur Radeon | `erleben.bild.auge` S 1<br>auch: `erleben.bild.flaeche` | unerklärte Randpixel beim Gehen | im Spiel an EINEM Gerät |
| schatten.K3 | Jedes Ding steht: Kontakt-Verdeckung | 0/2 · 1: — | `erleben.bild.flaeche` S 2 | Kontaktband am Sockel | ungemessen oder ROT |
| schatten.K4 | Licht springt einmal: Rückstrahlung und Innenraum | 1/2 · 1: nur Radeon | `erleben.bild.flaeche` S 2 | Gewinn an der Schattenwand; der Innenraum ist Sprosse 3 | im Spiel an EINEM Gerät |
| schatten.K5 | Nachts wirft das Feuer | 0/2 · 1: — | `erleben.bild.nacht` S 1 | Schatten-Kontrast am Pfosten | ungemessen oder ROT |

## 17 · Die LOD-Kette ohne Pop — alt 3/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| lod.K1 | Der Umriss hält in jeder Stufe (Laub-Kante) | 0/2 · 1: — | `leben.pflanzen.dichte` S 1<br>auch: `same.massstab.spanne` | Laub-Kante 0,2635 > 0,22 (ROT) | ungemessen oder ROT |
| lod.K2 | Kein Pop unter Bewegung und Sicht-Wechsel | 1/2 · 1: nur Radeon | `same.massstab.spanne` S 1<br>auch: `same.entfaltung.reise` | Pop-Pixel je Sekunde | im Spiel an EINEM Gerät |
| lod.K3 | Aus jeder Blick-Hebung (Karten-Deckung, IoU) | 1/2 · 1: nur GTX | `same.massstab.spanne` S 1 | — | WEG — ersetzt |
| lod.K4 | Der Stufenwechsel in Ruhe ist unsichtbar | 1/2 · 1: nur Radeon | `same.massstab.spanne` S 1 | Luma-Sprung je Klasse | im Spiel an EINEM Gerät |
| lod.K5 | Fehler ≤ 1 Pixel am Wechsel | 0/2 · 1: — · 2: headless | `same.massstab.spanne` S 1<br>auch: `mensch.bau.huelle` | Kanten-Versatz am Wechsel | Mechanik (headless) |

## 18 · Die acht Studios — alt 6/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| studios.K1 | Jeder Griff wirkt sichtbar oder hörbar | 2/2 · 1: headless · 2: headless | `erleben.schoepfen.satz` S 2 | — | WEG — ersetzt |
| studios.K2 | Griff → Bild ohne Warten | 1/2 · 1: headless · 2: — | `erleben.schoepfen.hebel` S 1 | — | WEG — ersetzt |
| studios.K3 | Kosten-Wahrheit am Griff (Thermometer) | 1/2 · 1: headless · 2: — | `same.entfaltung.schirm` S 1 | — | WEG — ersetzt |
| studios.K4 | Studio = Welt im Bild | 0/2 · 1: — · 2: — | `erleben.schoepfen.hebel` S 1<br>auch: `mensch.bau.huelle`, `mensch.bau.bauen` | Bild-Differenz Labor ↔ Welt — Teil des Richters | ungemessen oder ROT |
| studios.K5 | Ein neuntes Gesetzbuch dockt an | 2/2 · 1: headless · 2: headless | `erleben.schoepfen.gesetz` S 2 | Gesetzbuch steht über die Werkstatt in der Welt | Mechanik (headless) |

## 19 · Die Pipeline — alt 9/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| pipeline.K1 | Der Griff steht in der Welt: alle 8 Arten, byte-gleich | 2/2 · 1: headless · 2: headless | `erleben.schoepfen.hebel` S 1 | — | WEG — ersetzt |
| pipeline.K2 | EIN Karten-Bäcker | 2/2 · 1: headless · 2: headless | `same.massstab.spanne` S 1 | — | WEG — ersetzt |
| pipeline.K3 | Kosten am Asset: jede Stufe reduziert nach Gesetz | 2/2 · 1: headless · 2: headless | `same.entfaltung.schirm` S 1 | — | WEG — ersetzt |
| pipeline.K4 | Wärme: Platte und Gesetz-SHA tragen jede Lieferung | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `same.preis.ankunft` S 3 | — | WEG — ersetzt |
| pipeline.K5 | EIN Bauer auf der Engine der Welt | 1/2 · 1: headless | `same.preis.ankunft` S 2<br>auch: `same.preis.bytes` | — | WEG — ersetzt |

## 20 · Die KI im System — alt 7/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| ki.K1 | Satz → Tat mit echtem Modell: eingefrorener Korpus | 2/2 · 1: headless · 2: headless | `erleben.schoepfen.satz` S 1 | Korpus gültig, Absicht am Bild | Mechanik (headless) |
| ki.K2 | Die KI spricht das ganze Gesetz (Anteil erreichbarer Zeilen) | 2/2 · 1: headless · 2: headless | `erleben.schoepfen.satz` S 2 | — | WEG — ersetzt |
| ki.K3 | Die Seele erinnert sich im Gespräch | 1/2 · 1: headless | `mensch.geist.gespraech` S 2<br>auch: `erleben.sinn.legenden` | Antworten nennen Erinnerungen | Mechanik (headless) |
| ki.K4 | Die Regeln des Modells laufen durch dieselbe Wertung | 1/2 · 1: headless | `erleben.schoepfen.gesetz` S 1 | — | WEG — ersetzt |
| ki.K5 | Antwort und Kosten: die KI hält den Takt | 1/2 · 1: headless | `erleben.schoepfen.satz` S 1 | Satz → Bild ≤ 6 s, 0 Hänger | Mechanik (headless) |

## 21 · Spieler-Bauen — alt 9/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| bauen.K1 | Vom Willen zum stehenden Werk: ≤ 3 Eingaben, ≤ 1 s | 1/2 · 1: headless · 2: — | `erleben.schoepfen.hebel` S 1 | Klicks und Zeit am Ereignis-Strom | Mechanik (headless) |
| bauen.K2 | Das gesetzte Haus gehört dem Ort (Byte-Vergleich des Plans) | 2/2 · 1: headless · 2: headless | `erleben.schoepfen.hebel` S 2 | — | WEG — ersetzt |
| bauen.K3 | Das Teil gehorcht dem Gesetz: Statik und Wirkung aus der Form | 2/2 · 1: headless · 2: headless | `erleben.schoepfen.hebel` S 1<br>auch: `same.physik.tragen` | Konstruktions-Prüfsatz | Mechanik (headless) |
| bauen.K4 | Bauen in jeder Höhe und auf Gebautem | 2/2 · 1: headless · 2: headless | `erleben.schoepfen.hebel` S 1 | Turm 60 m hält über Reload | Mechanik (headless) |
| bauen.K5 | Das Werk wird benutzt | 2/2 · 1: headless · 2: Radeon + GTX | `erleben.spieler.rolle` S 1<br>auch: `mensch.kopplung.antwort` | jedes gesetzte Werk trägt seine Verben | **Kern** |

## 22 · Tore zu anderen Welten — alt 3/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| tore.K1 | Der Durchgang: Schwelle → Kontrolle und zurück | 0/2 · 1: — | `same.massstab.sprung` S 1<br>auch: `planet.kosmos.welten` | Sekunden bis zum ganzen Bild nach dem Durchgang | ungemessen oder ROT |
| tore.K2 | Die Membran zeigt, wohin du gehst | 0/2 · keine Station | `same.massstab.sprung` S 1 | Membran ↔ Ankunftsbild | ungemessen oder ROT |
| tore.K3 | Was der Spieler trägt, reist mit | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `same.entfaltung.akte` S 1<br>auch: `planet.kosmos.welten` | Leib, Inventar, Gehaltenes nach Tor hin und zurück | **Kern** |
| tore.K4 | Mitspieler: man sieht sich, man baut zusammen | 0/2 · keine Station | `erleben.spieler.gemeinsam` S 1<br>auch: `erleben.kopplung.geteilter-sinn` | zwei physische Geräte | ungemessen oder ROT |
| tore.K5 | Teilen in EINER Geste | 1/2 · 1: headless | `erleben.schoepfen.teilen` S 2 | A teilt, B mit frischem Profil öffnet | Mechanik (headless) |

## 23 · Fahrzeuge und Fahrgefühl — alt 8/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| fahrzeug.K1 | Das Fahr-Gesetz: Reifen, μ aus der Stoff-Zeile × Nässe | 2/2 · 1: headless · 2: headless | `mensch.fahrzeug.medium` S 1<br>auch: `mensch.fahrzeug.form` | Bremsweg je Boden und Nässe | Mechanik (headless) |
| fahrzeug.K2 | Die Fahrt kommt durch: das Wegenetz trägt das Rad | 1/2 · 1: Radeon + GTX | `mensch.netz.verkehr` S 1<br>auch: `mensch.netz.gestalt` | 2-km-Route ohne Steckenbleiber | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| fahrzeug.K3 | Die Kamera atmet das Tempo | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `erleben.spieler.praesenz` S 2 | FOV und Arm aus v/vmax | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| fahrzeug.K4 | Übergänge unter Bewegung: Sicht-Wechsel, Auf- und Absteigen | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `erleben.spieler.praesenz` S 2<br>auch: `mensch.fahrzeug.medium` | Übergänge im Bild gehalten | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| fahrzeug.K5 | Rückmeldung: der Körper fühlt die Fahrt | 1/2 · 1: Radeon + GTX | `mensch.fahrzeug.medium` S 1<br>auch: `erleben.klang.ereignis` | Kanäle mit gemessenem Paar | im Spiel gemessen, Richter der Sprosse oder Preis offen |

## 24 · Siedlung — alt 9/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| siedlung.K1 | Das Haus von innen: Tür, Treppe, Keller, Dachboden | 1/2 · 1: headless · 2: — | `mensch.bau.innen` S 1<br>auch: `mensch.stadt.vertikal` | Gang ohne Sprung > 0,3 m | Mechanik (headless) |
| siedlung.K2 | Die Stadt in Reichweite, nach Rang und Größe | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `mensch.stadt.siedlungsnetz` S 1<br>auch: `mensch.macht.wehrbau`, `mensch.macht.grenze` | Stadt binnen 2 km, Zipf | **Kern** |
| siedlung.K3 | Gelände-Treue: der Ortsplan liest den Boden | 2/2 · 1: headless · 2: headless | `mensch.netz.gestalt` S 1<br>auch: `planet.kopplung.siedlungslage`, `mensch.nahrung.flur` | Gassen-Gefälle | Mechanik (headless) |
| siedlung.K4 | Durch die Jahrhunderte — Parameter, dann Wachstum | 2/2 · 1: headless · 2: Radeon + GTX | `mensch.zeit.palimpsest` S 1<br>auch: `mensch.zeit.spanne`, `mensch.zeit.kausal`, `mensch.kopplung.antwort`, `mensch.leib.tracht`, `mensch.kultur.gestalt` | Wachstum; Jahresringe = Sprosse 2 | **Kern** |
| siedlung.K5 | Das erste Haus steht sofort | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `mensch.stadt.groesse` S 1<br>auch: `mensch.netz.gestalt` | erstes Haus ≤ 0,5 s nach dem Erwachen der Zelle | im Spiel gemessen, Richter der Sprosse oder Preis offen |

## 25 · Der Spieler-Leib — alt 7/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| leib.K1 | Die Taste bewegt den Leib im Bild: Eingabe-Latenz | 0/2 · 1: — · 2: — | `erleben.spieler.praesenz` S 1<br>auch: `same.preis.eingabe`, `erleben.spieler.hand` | Taste → Bild p95 | ungemessen oder ROT |
| leib.K2 | Der Fuß steht: Hang, Stufe, Sprung | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `erleben.spieler.praesenz` S 1<br>auch: `mensch.sport.koerper`, `mensch.leib.ausdruck` | Fuß p95 am 25°-Hang | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| leib.K3 | Wasser und Höhle: Ufer, Schwimmen, Tauchen, Sicht unter Wasser | 2/2 · 1: headless · 2: Radeon + GTX | `planet.wasser.tiefsee` S 1<br>auch: `leben.wasser.bild`, `planet.geologie.unterwelt` | Übergang ohne Sprung, Unterwasser-Bild | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| leib.K4 | Die Kamera zu Fuß | 1/2 · 1: Radeon + GTX · 2: — | `erleben.spieler.praesenz` S 1 | Kamera nie im Fels | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| leib.K5 | Das Gamepad lenkt jedes Verb analog | 2/2 · 1: headless · 2: headless | `same.preis.eingabe` S 2 | Verben über Gamepad | Mechanik (headless) |

## 26 · Halten und Führen — alt 10/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| halten.K1 | Der Treffer aus dem Gesetz: Trägheit, Masse, Schneide | 2/2 · 1: headless · 2: Radeon + GTX | `erleben.spieler.hand` S 1<br>auch: `mensch.macht.krieg` | Schwung-Dauer ∝ √I, Treffer am Leib | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| halten.K2 | Das Gefühl: Eingabe → Schwung, Hit-Stop, Funken, Klang | 2/2 · 1: nur GTX · 2: headless | `erleben.spieler.hand` S 1 | Eingabe → erstes Schwung-Bild | im Spiel an EINEM Gerät |
| halten.K3 | Das Werkzeug wirkt nach seiner Form | 2/2 · 1: headless · 2: headless | `erleben.spieler.hand` S 2<br>auch: `mensch.nahrung.hand` | Axt fällt, Spaten gräbt, Sichel erntet | Mechanik (headless) |
| halten.K4 | Der Bogen schießt ballistisch, der Pfeil bleibt | 2/2 · 1: headless · 2: headless | `same.physik.flug` S 1 | Flugbahn gegen die Parabel | Mechanik (headless) |
| halten.K5 | Lebenswerte, Sturz, Tod und Wiederkehr als Zustand | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `erleben.sinn.tod` S 1 | Tod und Wiederkehr als Zustand; die Bildfolge am Todesort ist ungefahren | im Spiel gemessen, Richter der Sprosse oder Preis offen |

## 27 · Der gespielte Pfad — alt 5/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| spielgang.K1 | Die fünf Schritte in EINER Sitzung | 1/2 · 1: headless | `erleben.spieler.rolle` S 1<br>auch: `same.preis.ausdauer` | Schritte des v1-Pfads in einer Sitzung | Mechanik (headless) |
| spielgang.K2 | Der erste Eindruck erklärt sich | 0/2 · keine Station | `erleben.schoepfen.gespraech` S 1<br>auch: `erleben.sinn.takt` | Blind-Spieler findet die Verben | ungemessen oder ROT |
| spielgang.K3 | Bedienung: HUD und Menü antworten | 1/2 · 1: nur GTX | `same.preis.eingabe` S 1 | INP ≤ 200 ms | im Spiel an EINEM Gerät |
| spielgang.K4 | Zugänglichkeit aus dem Gesetz | 2/2 · 1: headless · 2: headless | `same.preis.zugang` S 2 | Untertitel, Farb-Modus | Mechanik (headless) |
| spielgang.K5 | Die Welt spricht die Sprache des Spielers | 1/2 · 1: headless · 2: — | `same.preis.zugang` S 1<br>auch: `mensch.kultur.sprache` | DE/EN aus EINER Tafel | Mechanik (headless) |

## 28 · Das Ultiversum — alt 9/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| ultiversum.K1 | Das Welt-Gesetz: Konstanten, die ein Leser liest | 1/2 · 1: headless | `planet.kosmos.welten` S 1 | — | WEG — ersetzt |
| ultiversum.K2 | Welten heiraten: Fusion deterministisch (byte-gleich) | 2/2 · 1: headless · 2: headless | `same.entfaltung.gleichheit` S 1<br>auch: `erleben.schoepfen.teilen` | — | WEG — ersetzt |
| ultiversum.K3 | Die Bibliothek: signiert, klein, forkbar | 2/2 · 1: headless · 2: headless | `erleben.schoepfen.teilen` S 1 | Bauplan signiert, gleich | Mechanik (headless) |
| ultiversum.K4 | Spieler schreiben Gesetze und teilen sie | 2/2 · 1: headless · 2: headless | `erleben.schoepfen.gesetz` S 1 | Regel wirkt und reist | Mechanik (headless) |
| ultiversum.K5 | Vertrauen: eine fremde Welt kann meine nicht töten | 2/2 · 1: headless · 2: headless | `erleben.schoepfen.schutz` S 1 | verbotene Tat benannt abgewiesen | Mechanik (headless) |

## 29 · Ankunft — alt 1/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| ankunft.K1 | Kalt bis zur Kontrolle an beiden Geräten | 0/2 · 1: — · 2: — | `same.preis.ankunft` S 1 | GTX 16,6 s (18.10.), Radeon ≈ 11 s (17.10.), am Kopf nicht nachgemessen; ≤ 20 s mit ganzem Bild ist Sprosse 2, ≤ 5 s Sprosse 4 | **Kern** |
| ankunft.K2 | Das Bild bei der Kontrolle ist ganz, auch in jeder Richtung | 1/2 · 1: nur Radeon | `same.preis.ankunft` S 2 | Lücke ≤ 2 % gegen 60 s Ruhe; die 180°-Drehung ist Sprosse 3 | im Spiel an EINEM Gerät |
| ankunft.K3 | Wiederkehr warm und nach der Versions-Stufe | 0/2 · 1: — | `same.preis.ankunft` S 3 | warm ≤ 3 s | ungemessen oder ROT |
| ankunft.K4 | Der erste Blick ist AAAA: jede Klasse am Spawn | 0/2 · 1: — | `leben.pflanzen.dichte` S 1<br>auch: `mensch.bau.huelle`, `planet.wasser.seegang`, `same.preis.ankunft` | Soll-Tafel am Spawn (3 von 12 gemessen): jede Klasse ist die Tiefe einer Inhalts-Sprosse; die Preis-Leitern verlangen nur das volle Bild | ungemessen oder ROT |
| ankunft.K5 | Das Lade-Bild lebt, der Haupt-Faden atmet | 0/2 · 1: — | `same.preis.ankunft` S 2 | — | WEG — ersetzt |

## 30 · Streaming und Fäden — alt 5/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| streaming.K1 | Keine Lücke im Blick unter Tempo | 0/2 · 1: — | `same.entfaltung.reise` S 1 | Lücken-Bilder bei Sprint und Fahrt | ungemessen oder ROT |
| streaming.K2 | Bereit vor Bedarf: EIN Rang (Anteil Chunks vor dem Sichtkegel) | 0/2 · 1: — | `same.entfaltung.reise` S 1 | — | WEG — ersetzt |
| streaming.K3 | Der Sprung hält die Kadenz | 1/2 · 1: Radeon + GTX | `same.massstab.sprung` S 1 | Teleport 1 km: p95 und t(ganz) | im Spiel gemessen, Richter der Sprosse oder Preis offen |
| streaming.K4 | Kein stiller Ersatz im Haupt-Faden | 2/2 · 1: headless · 2: Radeon + GTX | `same.preis.takt` S 3 | — | WEG — ersetzt |
| streaming.K5 | Bytes reisen, nie Kopien (Klon-MB je Minute) | 2/2 · 1: headless · 2: headless | `same.preis.ausdauer` S 2<br>auch: `same.preis.speicher` | — | WEG — ersetzt |

## 31 · Das Profi-Band — alt 1/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| profiband.K1 | Flüssig in Bewegung | 0/2 · 1: — · 2: — | `same.preis.takt` S 3<br>auch: `same.entfaltung.schirm` | Frame p95 in jeder Bewegungszelle | ungemessen oder ROT |
| profiband.K2 | Der CPU-Takt als ganze Belegung | 0/2 · 1: — · 2: — | `same.preis.takt` S 2 | — | WEG — ersetzt |
| profiband.K3 | Der GPU-Haushalt (Befehle, Dreiecke, VRAM) | 0/2 · 1: — · 2: — | `same.preis.speicher` S 1<br>auch: `same.preis.takt` | — | WEG — ersetzt |
| profiband.K4 | Glätte: keine Hänger | 1/2 · 1: nur Radeon · 2: — | `same.preis.takt` S 3<br>auch: `mensch.netz.verkehr` | Frames > 100 ms und > 33 ms | im Spiel an EINEM Gerät |
| profiband.K5 | Ausdauer: 20 min ohne Drift | 0/2 · 1: — · 2: — | `same.preis.ausdauer` S 1<br>auch: `same.preis.speicher` | 1,06 min ohne Absturz, aber Heap +185 MB/min und Bild-p95 67,2 ms: ROT; 20 min = Sprosse 3 | ungemessen oder ROT |

## 32 · Klang aus dem Gesetz — alt 9/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| klang.K1 | Der Ort klingt nach dem, was dort ist | 2/2 · 1: headless · 2: headless | `erleben.klang.landschaft` S 1 | Klang-Zensus je Ort | **Kern** |
| klang.K2 | Gesehen = gehört | 2/2 · 1: Radeon + GTX · 2: headless | `erleben.klang.landschaft` S 1<br>auch: `erleben.kopplung.ein-ereignis`, `erleben.kopplung.klang` | Wind Bild ↔ Ohr r ≥ 0,6 | **Kern** |
| klang.K3 | Raum: Richtung, Verdeckung und Hall aus der Welt | 2/2 · 1: headless · 2: headless | `erleben.klang.raum` S 2 | ILD/ITD, RT60, Verdeckung | **Kern** |
| klang.K4 | Der Körper klingt aus Stoff und Bewegung | 2/2 · 1: nur Radeon · 2: Radeon + GTX | `erleben.klang.ereignis` S 2 | Schritt je Stoff, Motor, Landung | **Kern** |
| klang.K5 | Kosten am Hörbaren, null Aussetzer | 1/2 · 1: headless · 2: nur GTX | `erleben.klang.raum` S 1<br>auch: `erleben.klang.getuemmel` | — | WEG — ersetzt |

## 33 · Speicher und Persistenz — alt 10/10

| alt | Kriterium der alten Karte | gebucht | → Sprosse der neuen Karte | misst schon | zählt als |
|---|---|---|---|---|---|
| speicher.K1 | Nichts geht verloren — auf dem Pfad des Spielers | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `same.entfaltung.akte` S 1 | Tab-Tod: Stand ≤ 10 s alt | **Kern** |
| speicher.K2 | Speichern kostet keinen Frame | 2/2 · 1: Radeon + GTX · 2: Radeon + GTX | `same.entfaltung.akte` S 1 | — | WEG — ersetzt |
| speicher.K3 | Die Datei wächst mit den Änderungen, nie mit dem Weg | 2/2 · 1: headless · 2: headless | `same.entfaltung.akte` S 2 | ≤ 100 kB je 1000 Edits | Mechanik (headless) |
| speicher.K4 | Die Wiederkehr zeigt dieselbe Welt | 2/2 · 1: headless · 2: Radeon + GTX | `same.entfaltung.akte` S 1 | bild-diff ≤ 1 % über Reload | **Kern** |
| speicher.K5 | Über Versionen hinweg | 2/2 · 1: headless · 2: headless | `same.entfaltung.akte` S 3 | Korpus alter Stände lädt | Mechanik (headless) |

## Die alten Kriterien, die einen WEG messen — und der Richter, der sie ersetzt

Ein Weg-Kriterium belohnt, WIE die Welt gebaut ist (eine Quelle, byte-gleich, ein Löser, Befehle je Bild, Fäden, Platte). Die neue Karte richtet nur, was der Spieler davon hat (R2). Der Weg bleibt Werkzeug und Linse; der Punkt kommt vom Ergebnis.

| alt | misst den Weg | alt gebucht | Ergebnis-Richter der neuen Karte |
|---|---|---|---|
| gelaende.K1 | EIN 3D-Gesetz im Kern, Studio-Plan = Welt byte-gleich | 2/2 | `same.entfaltung.gleichheit` S 1: Bild zweier Geräte an gleicher Pose: Horizont-Linie ≤ 2 px — die Gleichheit am Bild statt am Byte |
| wetter.K1 | Wetter = f(Saat, Ort, Zeit), nie aus der Wanduhr | 2/2 | `planet.wetter.lagen` S 1: Wetter wandert: Regen an A bei trockenem B ≥ 20 % der Zeit, im Spiel gesehen |
| stoffe.K1 | EINE Stoff-Tafel in SI, jede Wirkung liest sie | 1/2 | `same.physik.stoffe` S 1: Blind-Jury erkennt den Stoff am Fallen, Klingen, Brechen, Brennen ≥ 70 % |
| feld.K2 | Gleich für alle: Saat + Schreib-Akte = Welt (byte-gleich) | 2/2 | `same.entfaltung.gleichheit` S 1: zwei Geräte, zwei Peers: dasselbe Bild an derselben Koordinate |
| feld.K3 | Ruhe ist Null: in Ruhe arbeitet keine Simulation | 2/2 | `same.entfaltung.abwesenheit` S 1: fortgehen und wiederkommen: jeder steht, wo er gestanden hätte — und der Preis selbst (same.preis.takt) |
| affekt.K3 | Der Nexus spielt mit: schreibt, wertet, lernt | 1/2 | `erleben.schoepfen.gespraech` S 6: die Welt als dritter Mitspieler schlägt vor, und der Mensch nimmt es an — gerichtet am Vorschlag, nicht an der inneren Auslese |
| haar.K5 | Haar und Fell zahlen am Schirm (Befehle je Klasse) | 1/2 | `mensch.leib.gesicht` S 1: P in der Szene des Gesichts und des Tiers (R3): Bild p95 ≤ 33 ms an beiden Geräten |
| luftwasser.K5 | Ein Schwarm ist fern EIN Agent (CPU-ms, Befehle) | 2/2 | `leben.tiere.masse` S 3: die Masse im Bild unter P: 10³ Glieder bei Bild p95 ≤ 33 ms an beiden Geräten |
| lod.K3 | Aus jeder Blick-Hebung (Karten-Deckung, IoU) | 1/2 | `same.massstab.spanne` S 1: Steigflug 0,5 m → 700 m hin und zurück: keine Stufe verrät sich im Bild |
| studios.K1 | Jeder Griff wirkt sichtbar oder hörbar | 2/2 | `erleben.schoepfen.satz` S 2: der ganze Ausdrucksraum eines Werks kommt im Spiel-Bild an: „knorrige alte Eiche“ sieht knorrig und alt aus |
| studios.K2 | Griff → Bild ohne Warten | 1/2 | `erleben.schoepfen.hebel` S 1: Wille → Bild ≤ 1 s im Spiel |
| studios.K3 | Kosten-Wahrheit am Griff (Thermometer) | 1/2 | `same.entfaltung.schirm` S 1: der Preis P in der Szene jeder Sprosse (R3), nie eine Anzeige |
| pipeline.K1 | Der Griff steht in der Welt: alle 8 Arten, byte-gleich | 2/2 | `erleben.schoepfen.hebel` S 1: das Werk steht, trägt, wirkt und gleicht dem Studio-Werk im Bild |
| pipeline.K2 | EIN Karten-Bäcker | 2/2 | `same.massstab.spanne` S 1: Stufenwechsel unsichtbar im Flug |
| pipeline.K3 | Kosten am Asset: jede Stufe reduziert nach Gesetz | 2/2 | `same.entfaltung.schirm` S 1: Kosten am Schirm UND das Bild hält dem Foto stand |
| pipeline.K4 | Wärme: Platte und Gesetz-SHA tragen jede Lieferung | 2/2 | `same.preis.ankunft` S 3: Ankunft warm ≤ 3 s, von außen gestoppt |
| pipeline.K5 | EIN Bauer auf der Engine der Welt | 1/2 | `same.preis.ankunft` S 2: Ankunft kalt und Bytes über das Netz (same.preis.bytes) |
| ki.K2 | Die KI spricht das ganze Gesetz (Anteil erreichbarer Zeilen) | 2/2 | `erleben.schoepfen.satz` S 2: 100 Regler-Sätze: Blindurteil „passt“ ≥ 70 % am Bild |
| ki.K4 | Die Regeln des Modells laufen durch dieselbe Wertung | 1/2 | `erleben.schoepfen.gesetz` S 1: eine im Spiel geschriebene Regel wirkt im Bild bei A und B |
| bauen.K2 | Das gesetzte Haus gehört dem Ort (Byte-Vergleich des Plans) | 2/2 | `erleben.schoepfen.hebel` S 2: Bildpaar Spieler-Hof ↔ Gesetz-Hof: blind nicht unterscheidbar |
| ultiversum.K1 | Das Welt-Gesetz: Konstanten, die ein Leser liest | 1/2 | `planet.kosmos.welten` S 1: auf zwei Welten stehen: eigene Schwere, eigener Himmel, im Bild und im Sprung gemessen |
| ultiversum.K2 | Welten heiraten: Fusion deterministisch (byte-gleich) | 2/2 | `same.entfaltung.gleichheit` S 1: die fusionierte Welt ist auf zwei Geräten dasselbe Bild |
| ankunft.K5 | Das Lade-Bild lebt, der Haupt-Faden atmet | 0/2 | `same.preis.ankunft` S 2: Sekunden vom Klick bis zur ersten Eingabe im ganzen Bild — von außen gestoppt |
| streaming.K2 | Bereit vor Bedarf: EIN Rang (Anteil Chunks vor dem Sichtkegel) | 0/2 | `same.entfaltung.reise` S 1: Anteil ganzer Bilder unterwegs ≥ 98 % |
| streaming.K4 | Kein stiller Ersatz im Haupt-Faden | 2/2 | `same.preis.takt` S 3: 0 Frames > 100 ms in jeder Bewegungszelle |
| streaming.K5 | Bytes reisen, nie Kopien (Klon-MB je Minute) | 2/2 | `same.preis.ausdauer` S 2: Heap-Drift ≤ 5 MB/min über 5 min Spielgang |
| profiband.K2 | Der CPU-Takt als ganze Belegung | 0/2 | `same.preis.takt` S 2: Frame p95 am Spieler-Bild an beiden Geräten — der Takt des Bilds, nicht der des Fadens |
| profiband.K3 | Der GPU-Haushalt (Befehle, Dreiecke, VRAM) | 0/2 | `same.preis.speicher` S 1: Heap ≤ 400 MB und VRAM ≤ 118 MB an beiden Geräten; Bild p95 in same.preis.takt |
| klang.K5 | Kosten am Hörbaren, null Aussetzer | 1/2 | `erleben.klang.raum` S 1: der Preis steht in jeder Klang-Sprosse (Klang ≤ 0,2 ms, 0 Aussetzer) und wird dort mit gerichtet |
| speicher.K2 | Speichern kostet keinen Frame | 2/2 | `same.entfaltung.akte` S 1: P gilt in der Szene mit den Taten (R3): Bild p95 ≤ 33 ms während gespeichert wird |

Die Bürgschaft „Der Richter am Spieler-Weg“ (Schlupf, Richter außerhalb des Gerichteten, Posen-Matrix, Urteil in ≤ 3 min, kein Fehl-ROT) zählte schon in der alten Karte nicht. Sie beschreibt den Apparat, nicht die Welt: in der neuen Karte ist sie Regel (R2, R3 „dichteste Pose“, R11), keine Leiter.

## Die Pflicht (PFLICHT-OFFEN) in der neuen Karte

Die fünf Einträge der Frozen-Liste sind keine eigenen Leitern; sie liegen auf Sprossen, die es schon gibt. Die Karte ändert an der Liste nichts.

| Pflicht | liegt auf | was sie in der neuen Karte ist |
|---|---|---|
| A · AAAA je Klasse | `leben.pflanzen.dichte` S 1 · `mensch.bau.huelle` S 1 · `planet.wasser.seegang` S 1 und die Sprosse 1 jeder weiteren Klasse | die Tiefe-Achse der Inhalts-Leitern: jede Klasse der Soll-Tafel ist die Tiefe einer Sprosse 1, gerichtet in derselben Fahrt wie der Preis; die Laub-Kante ist Teil des Richters der Wiese. Die Preis-Leitern verlangen nur noch das volle Bild der Auslieferung |
| B · Ankunft ≤ 5 s kalt | `same.preis.ankunft` S 4 | Teil von P ab der Klasse Stadt (R8): ohne sie zählt keine Sprosse einer Stadt, Megastadt oder eines Planeten |
| C · Verkehr | `mensch.netz.verkehr` S 2 | 10 Wagen, je ein Bewohner am Steuer, 0 Berührung, 0 Stillstand |
| E · Profi-Band | `same.preis.takt` S 1–2 (Stand, beide Geräte) und S 3 (jede Bewegungszelle) · `same.preis.speicher` S 1 | der Bild- und Speicher-Preis P jeder Sprosse (R3, R8): ohne ihn bleibt jeder Kern ein Kern |
| F · Prüfplatz | `mensch.sport.regeln` S 1–2 · `mensch.sport.arena` S 1 · `mensch.macht.krieg` S 1 | Wettkampf mit Sieger, Spielfeld aus dem Ort-Gesetz, Arena, Zweikampf — am Ort jeder Ankunft |

## Was die bestehenden Stationen in der neuen Karte schon heben

Kein Punkt, weil kein Richter der neuen Karte am Kopf gefahren ist (Z2) — aber diese Sprossen stehen im Kern:

| Leiter | HEUTE | Kern | gestützt auf |
|---|---:|---:|---|
| `planet.wasser.kreislauf` | 0 | 1 | Pegel nach Sturm im Bild an beiden Geräten (wetter.K3), Bilanz als Zahl headless; Bild-Preis nicht gemessen. |
| `leben.pflanzen.jahreslauf` | 0 | 1 | Richter an beiden Geräten grün (vegetation.K5); Bild-Preis nur an der GTX belegt, die Radeon fehlt. |
| `leben.pflanzen.kraft` | 0 | 1 | die nahe Böe an beiden Geräten grün (vegetation.K2); Bild-Preis an der Radeon fehlt. |
| `mensch.sport.koerper` | 0 | 1 | Tempo und Sprung an beiden Geräten gebucht (leib.K2); Bild-Preis in Bewegung an der Radeon ROT (gehend 66 % der Bilder über 33 ms). |
| `mensch.geist.tag` | 0 | 1 | Soll-Orte an beiden Geräten grün (mensch.K2); der Bild-Preis reißt am Dorfplatz (Radeon ≈ 37 ms). |
| `mensch.stadt.siedlungsnetz` | 0 | 1 | an beiden Geräten grün (siedlung.K2); Bild-Preis am Hügel an der Radeon nicht gemessen. |
| `mensch.nahrung.erdbau` | 0 | 1 | Graben füllt sich im Ausgabe-Bild an beiden Geräten (gelaende.K2); Bild-Preis beim Graben nicht gemessen. |
| `mensch.zeit.palimpsest` | 0 | 1 | Wachstum an beiden Geräten grün (siedlung.K4); Bild-Preis nicht gemessen. |
| `erleben.spieler.rolle` | 0 | 1 | Werk wird benutzt (bauen.K5), Hieb trifft (halten.K1), Fahrt (fahrzeug.K3/K4) je an beiden Geräten im Bild; Bild-Preis in Bewegung an der Radeon ROT. |
| `erleben.sinn.ziele` | 0 | 1 | die Antwort am Ort an beiden Geräten, Tag und Nacht, Ego und Third (affekt.K1); Bild-Preis nicht gemessen. |
| `erleben.klang.raum` | 0 | 2 | am Abgriff gemessen (klang.K3); Bild-Preis in der Szene nicht gemessen; das alte Klang-Budget (an der Radeon 0,25 ms gegen 0,2) ist kein Preis mehr (R8). |
| `erleben.klang.ereignis` | 0 | 2 | am Abgriff an den Geräten gemessen (klang.K4); Bild-Preis in der Szene nicht gemessen; das alte Klang-Budget ist kein Preis mehr (R8). |
| `erleben.klang.landschaft` | 0 | 1 | Zensus am Abgriff, Wind gesehen = gehört an beiden Geräten (klang.K1, klang.K2); Bild-Preis in der Szene nicht gemessen; das alte Klang-Budget ist kein Preis mehr (R8). |
| `same.entfaltung.akte` | 0 | 1 | Bildpaar vor ↔ nach Reload an beiden Geräten grün (speicher.K4); der Bild-Preis in dieser Szene ist an der Radeon nicht gemessen. |
| `same.preis.ankunft` | 0 | 1 | 0 — kein Lauf des Richters am Kopf (Z2). Kern 1: ≤ 60 s kalt ist an beiden Geräten gemessen. Sprosse 2 nicht im Kern: das ganze Bild (≤ 2 % Lücke) ist nur an der Radeon gebucht (ankunft.K2). |
| `planet.kopplung.wetter-welt` | 0 | 2 | die Front im Licht (licht.K5) und die Nässe (wetter.K2) stehen je an beiden Geräten im Bild; als Glieder zählt jede für sich (Z3). Der Wind-Leser ist nur headless; Bild-Preis im Sturm an der Radeon nicht gemessen. |

Aus dem Kern gefallen sind mit der Prüfung: `mensch.menge.rhythmus` und `mensch.kopplung.antwort` (dieselbe Messung hob zweimal, R9), `mensch.macht.krieg` (Jagd ist kein Krieg), `erleben.sinn.tod` (Zustand statt Bild), `erleben.klang.musik` (der Hörer-Blindtest fehlt), `same.preis.takt`, `same.preis.bytes`, `same.preis.ausdauer` (ein Gerät, eine Datei-Summe, eine rote Messung).

## Was die alte Karte nicht misst

Die neue Karte trägt 113 Leitern ohne jedes alte Kriterium — Platten, Gebirge, Gezeiten, Tiefe Zeit, die echte Erde, Sterne, Systeme und Galaxien, Welten mit eigenem Gesetz, Stammbaum und Evolution, Sport, Markt, Recht, Sprache, Glaube, Kunst, Innenleben, die Zivilisation nach uns, fremde Sinne, Legenden, der Sog des Spiels, Katastrophen, die Rechnung ohne Zuschauer. Dort beginnt die Vision, wo die alte Karte aufhört.
