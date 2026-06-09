# AnazhRealm — Crafting-Konzept

*Ein Crafting-System nach dem Prinzip der Natur: wenige Regeln, unendliche Folge.*

---

## Inhaltsverzeichnis

1. [Das Grundprinzip](#1-das-grundprinzip)
2. [Die Bausteine](#2-die-bausteine)
3. [Operationen](#3-operationen)
4. [Werkzeuge und Maschinen](#4-werkzeuge-und-maschinen)
5. [Räumliche Verbindung — Compounds](#5-räumliche-verbindung--compounds)
6. [Wie Funktion entsteht](#6-wie-funktion-entsteht)
7. [Anwendungsdomänen](#7-anwendungsdomänen)
8. [Die Spieler-Reise](#8-die-spieler-reise)
9. [Designprinzipien](#9-designprinzipien)
10. [Offene Fragen und nächste Schritte](#10-offene-fragen-und-nächste-schritte)

---

## 1. Das Grundprinzip

Das System ruht auf einer einzigen Aussage:

> **Jeder Gegenstand und jedes Bauwerk ist eine räumliche Anordnung parametrischer Formen aus Materialien mit Eigenschaften, hergestellt durch Operationen aus vier Klassen. Funktion entsteht, wenn Formen die Eigenschaften ihrer Materialien räumlich aktivieren.**

Philosophisch ist das **Hylomorphismus** — Aristoteles' Idee, dass jedes Ding aus *Form* und *Materie* zusammengesetzt ist und seine Eigenschaften aus dem Zusammenspiel beider entstehen. Spielmechanisch ist es ein vollständiger Bruch mit *Rezept-basiertem* Crafting (Lookup-Tabelle: A+B+C → Item X) zugunsten von *emergentem* Crafting (Tags und Geometrie reagieren miteinander, das Resultat fällt aus den Regeln).

Die Konsequenz dieses Prinzips ist radikal: Das Spiel kennt keine Liste "aller Gegenstände". Es kennt nur Formen, Materialien, Operationen und räumliche Regeln. Was daraus wird, definiert der Spieler — und auch er nicht, sondern die Physik des Systems, sobald er etwas zusammensetzt.

---

## 2. Die Bausteine

Vier Begriffe genügen, um jeden Gegenstand vollständig zu beschreiben.

### 2.1 Formen — die geometrischen Primitive

Sieben parametrische Primitive decken den Raum aller funktional unterscheidbaren Gestalten ab:

| Primitiv | Parameter | Semantischer Kern |
|---|---|---|
| **Kugel** | Radius | Enthaltung, Rotation, Omnidirektionalität, Balance |
| **Zylinder** | Länge, Radius | Leitung, Stütze, Achsrotation |
| **Kegel / Pyramide** | Länge, Basisbreite | Fokussierung, Richtung, Durchdringung |
| **Quader / Prisma** | L × B × H | Stabilität, Modularität, Flächentragung |
| **Scheibe** | Radius, Dicke | Flächenverteilung, Reflexion, Ablenkung |
| **Torus** | Hauptradius, Nebenradius | Zyklus, Ringfeld, Verkettung |
| **Helix** | Länge, Windungen, Steigung | Induktion, Transformation, Drehmoment |

Jede dieser Formen trägt einen *semantischen Kern*, der für Spieler intuitiv ist, weil er aus der echten Welt kommt. Eine Spitze richtet, eine Kugel enthält, eine Helix windet — das muss niemand erklären.

Aspect-Ratio macht die Vielfalt: ein langer dünner Kegel ist eine Nadel, ein kurzer dicker ist ein Meissel, ein sehr langer mit Schliff-Tag ist ein Schwert. Es gibt nicht "Schwert" und "Dolch" als Form — es gibt *einen* Kegel mit verschiedenen Parametern.

### 2.2 Materialien — als Tag-Profile

Materialien sind keine Statblöcke, sondern Träger einer Handvoll boolescher oder ordinaler Eigenschaften. Vorgeschlagene Tag-Achsen:

| Tag | Bedeutung |
|---|---|
| `härte` | Mohs-artige Skala 1–10 |
| `dichte` | Masse pro Volumen, bestimmt Trägheit |
| `zähigkeit` ↔ `sprödigkeit` | absorbiert Energie vs. bricht |
| `wärmeleitung` | leitet Hitze |
| `stromleitung` | leitet Elektrizität / Blitz |
| `magieleitung` | leitet arkane Energie |
| `magnetisch` | reagiert auf Magnetfelder |
| `transparent` | lässt Licht durch |
| `brennbar` | entzündet sich |
| `oxidiert` | reagiert mit Luft / Wasser |
| `hält_schneide` | bleibt scharf |
| `resoniert` | trägt Schwingung |
| `lebendig` | wächst, heilt, verändert sich über Zeit |

Eichenholz und Eschenholz unterscheiden sich vielleicht nur in zwei Werten. Das genügt für unterschiedliches Verhalten beim Spalten, Biegen, Brennen. Es ist nicht nötig, fünfzig Holzarten zu *designen* — jede bekommt ein anderes Tag-Profil, und ihr Verhalten in der Welt folgt.

### 2.3 Präzision — ein kontinuierlicher Qualitätswert

Präzision (0.0–1.0) beschreibt, wie nah ein gefertigtes Objekt seinem geometrischen Ideal kommt. Sie wird *nicht zugewiesen*, sondern *gemessen* — sie ergibt sich aus der Prozesskette.

**Kernregel:** Jede Operation hat ein eigenes Präzisionsdach. Die finale Präzision ist gedeckelt durch die *schlechteste* Operation in der Kette.

| Operation | Typischer Cap |
|---|---|
| Knappen, Spalten von Hand | 0.3–0.5 |
| Schmieden mit Hammer | 0.5–0.7 |
| Gussform | 0.4–0.6 |
| Sägen | 0.6–0.75 |
| Drehbank (handbetrieben) | 0.7–0.85 |
| Hobeln, Feilen | 0.8–0.9 |
| Schleifen | 0.9–0.95 |
| Polieren / Läppen | 0.95–0.99+ |

Eine Kugel, die zuerst gegossen (0.5) und dann poliert (0.99) wurde, bleibt bei 0.5 — die Rauheit aus dem Guss ist drin. Erst Schleifen *vor* dem Polieren hebt das Dach.

**Sichtbar wird Präzision ohne UI-Anzeige:** Eine 0.3-Kugel ist lumpig, eine 0.9 wirkt rund, eine 0.99 reflektiert symmetrisch und klingt rein beim Anschlagen. Spieler hören Glocken, sehen Rollverhalten, fühlen ob Klingen rein schneiden.

### 2.4 Alignment — die zweite Qualitätsachse

Alignment ist orthogonal zur Präzision und trägt zwei Bedeutungen:

**Physisch.** Kristallachse, Holzmaserung, Schmiederichtung. Ein Schwert quer zur Faser bricht. Ein Quarz entlang der c-Achse geschliffen resoniert anders als quer dazu. Alignment ist die *Orientierung der inneren Struktur* relativ zur Form.

**Symbolisch.** Bei welchem Mondstand, an welchem Ort, durch wen geschmiedet. Eine Klinge, die zur Tagundnachtgleiche an einem Bachlauf gehärtet wurde, trägt andere Tags als eine in einer profanen Werkstatt. Das erlaubt, denselben Gegenstand mehrfach mit Varianten zu haben, ohne neue Formen oder Materialien zu brauchen.

---

## 3. Operationen

Alles Handeln am Werkstoff fällt in eine von vier Klassen.

### 3.1 Die vier Klassen

**Subtraktiv** — Material wird entfernt. Sägen, Meisseln, Spalten, Feilen, Bohren, Schleifen, Knappen. Aus einem grösseren Volumen wird ein kleineres geschnitten. Spannreste fallen ab.

**Plastisch** — Material wird umgeformt, kein Verlust. Schmieden, Walzen, Ziehen, Pressen, Biegen. Volumen bleibt konstant, Form ändert sich. Material-Tags können dabei sekundär ändern (Kaltverfestigung beim Schmieden).

**Additiv** — Material wird zusammengefügt. Giessen, Schweissen, Löten, Kleben, Nageln, Wickeln, Nähen, Mauern (mit Mörtel), magisches Binden. Verbindungen entstehen.

**Phasenwechsel** — Material-Tags ändern sich. Schmelzen, Erstarren, Härten, Tempern, Karbonisieren, Trocknen, Brennen (Keramik), Garen. Form bleibt, *was das Material ist* ändert sich.

Diese vier Klassen sind erschöpfend. Jede konkrete Tätigkeit lässt sich genau einer zuordnen. Maschinen sind klassifiziert nach den Operations-Klassen, die sie ausführen.

### 3.2 Material × Operations-Kompatibilität

Eine kleine Matrix legt fest, welche Operation auf welcher Materialklasse überhaupt möglich ist:

- **Holz**: subtraktiv (alle), plastisch nur bei Dampf/Hitze (Biegen), additiv (Leim, Zapfen, Nagel), phasenwechsel begrenzt (Verkohlen).
- **Stein**: subtraktiv (Spalten, Meisseln, Schleifen), nicht plastisch, additiv nur via Mörtel, phasenwechsel begrenzt (Brennen → Kalk).
- **Metalle**: alle vier Klassen voll zugänglich, abhängig von Temperatur.
- **Glas / Keramik**: phasenwechsel zentral (Schmelzen, Brennen), plastisch nur im heissen Zustand, subtraktiv möglich aber riskant (Sprödigkeit).
- **Organisch (Leder, Sehne, Stoff)**: subtraktiv (Schneiden), plastisch (Formen, Walken), additiv (Nähen, Kleben), phasenwechsel (Trocknen, Gerben).

### 3.3 Verkettung und Caps

Operationen verketten sich zu einem **Prozess-Lebenslauf** des Werkstücks. Jeder Schritt ist nachvollziehbar dokumentiert (intern als Liste). Daraus ergeben sich automatisch:

- Finale Präzision (Minimum aller Schritt-Caps, modifiziert durch Werkzeug- und Spielerqualität)
- Eventuelle Tag-Änderungen durch Phasenwechsel
- Material-Verlust (bei subtraktiven Operationen) oder Verbrauch von Bindemittel (bei additiven)

---

## 4. Werkzeuge und Maschinen

### 4.1 Die drei Maschinen-Achsen

Jede Maschine ist vollständig beschrieben durch drei Werte. Mehr braucht es nicht.

**Arbeitsvolumen.** Wie gross darf das Werkstück sein. Schraubstock = faustgross. Werkbank = brettgross. Bauhütte = balkengross. Trockendock = schiffsgross. Dies bestimmt nur, *was reinpasst*, nicht *was rauskommt*.

**Operationsklasse(n).** Welche der vier Klassen führt die Maschine aus. Drehbank = subtraktiv-rotativ. Amboss = plastisch-schlagend. Walzwerk = plastisch-quetschend. Schmelzofen = phasenwechselnd. Webstuhl = additiv-fadenförmig. Maschinen können mehrere Klassen kombinieren, aber je mehr, desto schwerer sind sie zu bauen und zu kalibrieren.

**Präzisionsdach und Energiequelle.** Wie fein sie maximal arbeitet und woher die Kraft kommt. Handgeführt → niedrig, variabel durch Spielerskill. Wasserrad → mittel, gleichmässig, dauerhaft. Dampf → hoch, regelbar. Magisch → potentiell beliebig, aber materialgebunden.

### 4.2 Tier-Progression durch Engpass-Auflösung

Jeder Maschinen-Sprung löst genau **einen Engpass** des Handwerkers. Das macht den Tech-Tree organisch — der Spieler baut die Maschine, *wenn* er den Engpass selbst gefühlt hat, nicht weil ein Forschungsbaum sie freischaltet.

| Engpass | Lösung | Was sie eigentlich verschiebt |
|---|---|---|
| Werkstück verrutscht | Werkbank, Schraubstock | Stabilität → Präzisions-Cap steigt |
| Symmetrie schwer von Hand | Drehbank | Maschine garantiert Rundlauf statt Spielerskill |
| Eisen lässt sich nicht formen | Esse + Blasebalg | Neue Operations-Klasse zugänglich (Phasenwechsel Metall) |
| Bleche brauchen ewig | Walzwerk | Wiederholungs-Operationen automatisiert |
| Muskelkraft begrenzt | Wassermühle / Windmühle / Dampf | Energie wird konstant, stark, regelbar |
| Schiff zu gross für Werkstatt | Trockendock | Bauraum skaliert |

Keine dieser Maschinen muss als Rezept *freigeschaltet* werden. Sie sind alle aus dem System bauubar. Sobald der Spieler die nötigen Halbzeuge fertigen kann, kann er auch die Maschine bauen.

### 4.3 Maschinen sind selbst Compounds

Eine Drehbank ist: ein Gestell (Quader aus Holz, mittlere Präzision), eine Spindel (langer präziser Zylinder aus Stahl), Lager (zwei Tori aus Bronze, hohe Präzision), eine Welle, ein Antriebsrad (Scheibe), ein Werkzeughalter. Alles aus den selben sieben Formen und denselben Materialien wie alles andere im Spiel.

Daraus folgt eine wichtige Rekursion: **Die Präzision der Maschine kommt aus der Präzision ihrer Bauteile.** Eine schief gebaute Drehbank fertigt nur schiefe Drehkörper. Wer hochpräzise Werkstücke will, muss zuerst eine hochpräzise Maschine bauen. Wer eine hochpräzise Maschine bauen will, braucht Werkzeuge mittlerer Präzision. Und so weiter, bis hinunter zum Faustkeil.

Das System schliesst sich von selbst und schafft eine natürliche Lernkurve ohne künstliche Gating-Mechanismen.

---

## 5. Räumliche Verbindung — Compounds

Ein Gegenstand mit mehr als einem Teil ist ein **Compound**: eine räumliche Anordnung von Primitiven, verbunden durch Verbindungselemente.

### 5.1 Die Verbindungstypen

Verbindungen sind eine kleine geschlossene Liste, jede mit eigener Belastbarkeit:

| Typ | Wirkprinzip | Stark gegen | Schwach gegen |
|---|---|---|---|
| **Hafting** (Stiel in Loch) | Reibschluss, Keilung | Druck | Zug, seitliche Last |
| **Lashing** (Wickeln) | Umschnürung mit Faden/Sehne | Zug | Druck, scharfe Kanten |
| **Pinning / Genieten** | Querverbindung durch Stift | Scherung | Auseinanderziehen ohne Stift-Bruch |
| **Schweissen / Löten** | Atomare Verbindung gleicher Materialien | Alle Lasten, wenn sauber | Hitze, Wiederholungs-Spannung |
| **Kleben / Leim** | Adhäsion | Schub | Hitze, Feuchtigkeit |
| **Mauern / Mörteln** | Druckschluss + Bindemittel | Druck | Zug, Erdbeben |
| **Nähen** | Garn durch Material | Zug in Materialebene | Schneiden quer zur Naht |
| **Magische Bindung** | Tag-Resonanz | Variabel nach Tag | Gegen-Resonanz |

Jede Verbindung trägt eine maximale Last, ableitbar aus den Tags der beteiligten Materialien und der geometrischen Kontaktfläche. Wird sie überschritten, versagt die Verbindung — nicht das Bauteil.

### 5.2 Die fünf räumlichen Prinzipien

Statt zu jedem möglichen Compound eine Funktionsregel zu definieren, brauchst du nur fünf räumliche Prinzipien:

1. **Spitze richtet nach aussen.** Wo ein Compound spitz zuläuft, treten seine aktivierten Tags nach aussen aus. (Schwertspitze, Pfeilkopf, Pyramidenkristall, Antennenspitze.)
2. **Hohlraum enthält, dämpft oder verstärkt.** Geschlossene Volumen halten Dinge drinnen, dämpfen Schwingung, oder — bei resonierenden Materialien — verstärken sie. (Becher, Glocke, Helmpolster, Truhe.)
3. **Symmetrieachsen tragen Alignment.** Drehsymmetrische Compounds richten Energie entlang ihrer Achse. Spiegelsymmetrische verteilen sie symmetrisch. (Stab, Schwert, Schild.)
4. **Kontakt überträgt Tags.** Wo zwei Materialien fest verbunden sind, fliessen Eigenschaften ineinander (Wärme, Strom, Magie, Schwingung). (Gehäuse aus Stahl mit Kristall innen → Stahl wird zur Antenne.)
5. **Abstände erzeugen Resonanz oder Interferenz.** Mehrere aktive Elemente in geometrischen Verhältnissen verstärken sich (passende Wellenlänge) oder löschen sich aus. (Kristall-Arrays, Glockenspiele, Anti-Magie-Käfige.)

Diese fünf Regeln reichen, um aus den sieben Formen und ~15 Materialien funktional Hunderte unterschiedlicher Artefakte emergieren zu lassen, ohne einen einzigen davon zu *designen*.

### 5.3 Position auf dem Trägerobjekt ist eine Eigenschaft

Ein Kristall am *oberen Ende* eines Stabes fokussiert Magie nach aussen (Prinzip 1: Spitze richtet). Derselbe Kristall in der *Mitte* eingelassen wird zum Leiter (Prinzip 4: Kontakt überträgt). Am *unteren Ende* erdet er die Energie ins Boden-Tag.

Spieler arbeiten mit räumlichen Werkstücken im Bauraum der Maschine. Sie *legen* Bauteile *an Stellen*, nicht in Slots. Das ist die echte Räumlichkeit, die Minecraft mit seiner 3×3-Matrix nur simuliert.

---

## 6. Wie Funktion entsteht

### 6.1 Die Form-Tag-Aktivierungs-Matrix

Die gesamte Crafting-Regelmenge passt in **eine Tabelle**: Welche Form-Eigenschaft aktiviert welches Material-Tag in welcher Stärke?

|   | Schneide-Tag | Resonanz-Tag | Leitung-Tag | Magnet-Tag | Reflexion-Tag | Trägheit-Tag | Halt-Tag | Brand-Tag |
|---|---|---|---|---|---|---|---|---|
| **Kugel** | – | ★★★ | ★ | ★ | ★★ | ★★ | – | – |
| **Zylinder** | – | ★ | ★★★ | ★ | – | ★ | ★★★ | – |
| **Kegel** | ★★★ | ★ | ★★ | ★ | – | ★ | – | ★ |
| **Quader** | ★ | – | ★ | ★ | ★ | ★★★ | ★★ | – |
| **Scheibe** | ★★ | – | – | ★★ | ★★★ | – | – | – |
| **Torus** | – | ★★ | ★★ | ★★★ | – | – | ★ | – |
| **Helix** | – | ★★ | ★★★ | ★★★ | – | – | – | – |

(Werte sind illustrativ — die echte Kalibrierung erfolgt im Balancing.)

Das ist die **gesamte Logik des Systems** in einer Tabelle. ~7 Formen × ~8 Tags = 56 Zellen. Alles andere fällt aus dieser Tabelle plus Präzision, Material-Dichte und räumlichen Verbindungen heraus.

### 6.2 Beispiel: Wie ein Scrying-Orb entsteht

Der Spieler nimmt einen Quarzkristall (Material-Tags: `resoniert`, `transparent`, `magieleitend`), formt ihn auf der Drehbank zur Kugel (Form-Tag: aktiviert `resoniert` ★★★ und `reflexion` ★★), und schleift ihn auf Präzision 0.95.

Das resultierende Objekt trägt automatisch:
- Resonanz-Tag stark aktiviert → speichert und verstärkt magische Schwingungen
- Reflexion-Tag aktiviert → projiziert das Gespeicherte als sichtbares Bild
- Transparenz → das Bild ist im Inneren sichtbar
- Omnidirektionalität (aus der Kugelform) → empfängt aus allen Richtungen
- Hochpräzision → wenig Verlust, klares Bild

Die Funktion *Scrying* wurde nirgends hartcodiert. Sie ist die natürliche Konsequenz dieser Tag-Konfiguration. Das System muss "Scrying" nicht als Konzept kennen. Andere Compounds mit ähnlichem Tag-Profil tun ähnliche Dinge — und der Spieler entdeckt es.

### 6.3 Stat-Berechnung — drei Stufen, nicht Addition

**Form gated** welche Material-Eigenschaften überhaupt aktiv werden (Tabelle 6.1).
**Material liefert** die Stärke dieser Eigenschaften (Tag-Werte).
**Präzision moduliert** wie sauber sich diese Wirkung entfaltet (0.0–1.0 als Multiplikator oder Effizienz-Wert).

`Eigenschaft_X = Aktivierung(Form) × Stärke(Material-Tag) × Präzision_Effizienz`

Es gibt kein lineares Aufaddieren beliebiger Tags. Das verhindert Stat-Matsch und hält die Wirkungen klar und vorhersagbar.

---

## 7. Anwendungsdomänen

Dasselbe System macht alles. Was sich unterscheidet ist nur, *welche Tags wofür nützlich werden*.

### 7.1 Werkzeuge — konzentrierte Energie

Ein Werkzeug ist ein Compound, der Spielerkraft auf einen bestimmten Ort und in eine bestimmte Wirkrichtung übersetzt.

- **Hammer** = Quader (dichtes Material, Kopf) + Zylinder (Holz, Stiel). Hebel × Masse × kleine Auftrefffläche = Schlagkraft.
- **Meissel** = Kegel (hart) + Quader (Griff). Kegel konzentriert Hammer-Energie auf Punkt → Spaltung.
- **Säge** = lange Scheibe mit Zähnen (Reihe kleiner Kegel) aus hartem Material. Ziehbewegung × viele kleine Schneidpunkte = kontrollierter Schnitt.
- **Drehbank-Stahl** = Kegel an Stiel, fest gehalten gegen rotierendes Werkstück.

### 7.2 Waffen — gerichtete Zerstörung

Schaden ist eine Funktion, nicht ein Statwert:

`Schaden = Energie × Konzentration ÷ Trefferfläche × Material-Schärfe ÷ Zielwiderstand`

Wobei:
- **Energie** = Masse × Schwunggeschwindigkeit (Form-Parameter + Spielerbewegung)
- **Konzentration** = Aspect-Ratio der Auftrefffläche (spitz vs. flach)
- **Material-Schärfe** = Material-Tag `hält_schneide` × `härte`
- **Zielwiderstand** = Rüstungs-Tags an der getroffenen Stelle

Daraus ergeben sich automatisch alle Waffenklassen:
- **Klingen**: langer schlanker Kegel mit Schliff
- **Stichwaffen**: kurzer extremer Kegel
- **Wuchtwaffen**: dichter Quader oder Kugel mit Spikes
- **Geschosse**: kompakte Kugel oder Kegel mit hoher Anfangsgeschwindigkeit
- **Stäbe**: langer Zylinder mit Endkomponenten (Magie via Form/Material/Position)

### 7.3 Rüstung — Energie verteilen statt absorbieren

Rüstung kehrt die Angriffsphysik um. Statt zu konzentrieren, *verteilt* sie:

- **Grosse Fläche** verteilt Druck → Platte
- **Wölbung** lenkt ab → plastisch geformte Platte
- **Schichtung** dämpft → Polsterung unter Platte
- **Beweglichkeit** macht tragbar → viele kleine starre Elemente flexibel verbunden (Schuppen, Kettenglieder, Lamellen)

Eine **Kettenrüstung** ist ein Compound aus tausend Tori, miteinander räumlich verschränkt (Topologie-Regel: jeder Ring greift in vier Nachbarn). Tag-Profil: zäh-flächig, dehnbar, gut gegen Schnitte, schlecht gegen Stiche (Tori haben Löcher). Eine **Plattenrüstung** ist ein Compound aus gewölbten Scheiben/Quadern, vernietet oder geriemt. Tag-Profil: hart-flächig, steif, gut gegen Schneiden und Stiche, schwer.

**Treffer-Auflösung ist räumlich:** nicht "Rüstungsklasse 15", sondern "an *dieser* Stelle des Körpers überlappen sich Brustplatte (Stahl, gewölbt, dick) und Gambeson (Leinen, gepolstert)". Stich von vorne: trifft Platte → Energie verteilt → Rest auf Gambeson → absorbiert. Stich seitlich ins Achselloch: nur Gambeson → durchschlägt. Realismus emergiert aus Geometrie, nicht aus Tabellen.

### 7.4 Bauen — Last verteilen

Häuser, Brücken, Wagen, Schiffe sind grosse Compounds aus parametrischen Primitiven mit räumlichen Regeln. Bauteile sind alle Quader unterschiedlicher Aspect-Ratios:

- **Balken** (langer Quader, Holz) trägt Last in Längsrichtung
- **Pfosten** (vertikaler Balken) trägt Druck senkrecht
- **Brett** (flacher Quader) deckt Fläche, trägt nur quer
- **Sturz** (horizontaler Balken über Öffnung) leitet Last seitlich um
- **Mauerstein** (Quader, Stein) stapelt sich, trägt Druck, keinen Zug

Die statische Regel ist einfach: Jede Verbindung trägt eine bestimmte Last (aus Tags + Verbindungstyp). Jedes Element leitet Last entlang seiner Längsachsen. Alles muss letztendlich zum Boden geleitet werden. Wenn an einer Stelle die Belastbarkeit überschritten ist, bricht es. Du brauchst keine Baupläne — du kannst aus Brettern und Balken alles bauen, was statisch geht.

Das Spiel sagt nicht *was* du bauen darfst, es zeigt nur *was steht* und *was nicht*.

### 7.5 Maschinen — Energie transformieren

Bereits in Abschnitt 4 behandelt. Hier nur die Pointe: Wassermühlen, Windmühlen, Dampfmaschinen sind keine *Werkzeugmaschinen*, sondern **Energiequellen**, die andere Maschinen antreiben. Sie generieren Drehmoment auf Wellen (Zylinder mit `leitet_drehmoment`-Tag), das über Riemen und Zahnräder (Scheiben, Tori) verteilt wird.

Antriebs-Topologie ist selbst ein kleines Subsystem: Energie hat Verluste an jeder Übertragung, jede Übersetzung tauscht Drehzahl gegen Drehmoment. Eine schlecht gebaute Mühle (Rad nicht rund) liefert ungleichmässige Kraft, die nachgeschaltete Werkzeugmaschinen unpräziser macht.

---

## 8. Die Spieler-Reise

### 8.1 Entdeckung statt Anleitung

Es gibt keinen Rezept-Browser. Es gibt keinen Forschungsbaum. Stattdessen:

- **NPCs** erwähnen beiläufig Beobachtungen ("Mein Kupferring zuckt, wenn ich am Magnetstein vorbeigehe.")
- **Bücher** beschreiben Phänomene, nicht Anleitungen ("Quarze klingen, wenn man sie schlägt — und sie klingen *länger*, je runder sie sind.")
- **Welt-Phänomene** zeigen Tags in Aktion (ein Wasserfall dreht ein wildes Wasserrad an einem verlassenen Hof; der Spieler sieht: *so* macht man also Rotationsenergie aus Wasser)
- **Versuch und Irrtum** wird belohnt durch eine Welt, in der nichts "falsch" sein kann, höchstens unbrauchbar — und das ist Information.

### 8.2 Engpass-getriebene Progression

Der Spieler baut Maschinen, wenn er den Engpass selbst gefühlt hat. Niemand sagt ihm "baue jetzt eine Drehbank". Er hat versucht, eine Kugel von Hand zu schmirgeln, ist gescheitert, sucht nach einer Lösung, sieht irgendwo eine Drehbank oder hört davon, und baut sie.

Das macht jeden Tech-Sprung *persönlich verdient*. Es gibt keine objektive Reihenfolge — Spieler, die nur Bauen wollen, brauchen nie eine Esse. Spieler, die nur Magie machen, brauchen nie ein Walzwerk.

### 8.3 Lernkurve durch Kohärenz

Wer das Prinzip einmal verstanden hat, kann es überall anwenden. Ein Spieler, der weiss, dass eine Kugel Resonanz aktiviert, weiss das beim Glockenbau genauso wie beim Magiekristall, beim Kugellager und beim Wurfgeschoss. Es gibt nur **eine** Logik zu lernen, dann läuft alles.

Das ist das Versprechen der Natur, eingelöst: wenige Regeln, unendliche Anwendung.

---

## 9. Designprinzipien

### 9.1 Was zu bewahren ist

- **Keine Rezept-Lookups.** Niemals "Form A + Material B = Item X" in einer Tabelle. Immer Tags und Geometrie.
- **Werkzeuge erlauben, sie erzeugen nicht.** Ein Werkzeug schaltet *Form-Möglichkeiten* frei und setzt *Präzisionsdächer*, es spuckt kein Item aus.
- **Räumlichkeit ist echt, nicht symbolisch.** Spieler arbeiten am Werkstück im 3D-Bauraum, nicht an einem Pictogramm in einer Matrix.
- **Präzision ist Prozess-Ergebnis, nicht Zugewiesenes.** Sie ergibt sich aus der Operationskette.
- **Rekursivität.** Maschinen sind aus dem System gebaut. Werkzeuge sind aus dem System gebaut. Alles aus denselben Bausteinen.
- **Tags interagieren nicht direkt miteinander. Geometrie aktiviert Tags.** Das hält die Logik klein.

### 9.2 Was zu vermeiden ist

- **Die 3×3-Versuchung.** Minecrafts Matrix als UI übernehmen und nur die Logik dahinter ändern. Das verliert die Hauptkraft des Systems, weil Spieler weiterhin symbolisch denken statt räumlich.
- **Tag-Addition.** Wenn alle Tags zusammengezählt werden, wird das Ergebnis Stat-Matsch. Form *gated* Tags, Tags werden nicht summiert.
- **Hartcodierte Funktionsnamen.** Das System soll "Scrying", "Schwert", "Bogen" nicht als Konzepte kennen müssen. Es kennt nur Tags und Geometrie.
- **Versteckte Rezept-Tabellen.** Auch wenn die UI emergent wirkt, darf die Implementierung nicht im Hintergrund nachschlagen. Sonst zerbricht die Konsistenz, sobald Spieler Grenzfälle ausprobieren.
- **Statwerte ohne sichtbare Ursache.** Eine 0.95-Präzisions-Kugel muss anders *aussehen, klingen, sich verhalten* als eine 0.5er, nicht nur eine andere Zahl tragen.

---

## 10. Offene Fragen und nächste Schritte

Drei Bereiche, die für die Umsetzung als nächste konkret durchgearbeitet werden müssen:

**Die 7 × 8 Form-Tag-Aktivierungs-Matrix kalibrieren.** Welche Form aktiviert welches Tag wie stark. Das ist die wichtigste Tabelle des ganzen Systems. Sie muss handgemacht und durchgetestet werden. Erst wenn die Matrix steht, kann emergent gebalancierte Funktion entstehen.

**Die Verbindungstopologien formalisieren.** Hafting, Lashing, Pinning, Schweissen, Kleben, Mauern, Nähen, magisch — jede mit klarer Lastformel aus Tags und Geometrie. Dies ist die zweite Tabelle, die das System trägt.

**Die Energie- und Antriebs-Topologie scharf machen.** Wellen, Übersetzungen, Verluste, Drehmoment-vs-Drehzahl-Trades. Die Mechanik der Energieübertragung ist der unterschätzte zweite Hebel, um Tier-Sprünge spürbar zu machen.

Weitere offene Fragen:

- **Entdeckbarkeit ohne Spoiler.** Welcher Mix aus NPC-Hinweisen, Welt-Phänomenen, Büchern und Versuch-und-Irrtum trägt die Lernkurve, ohne die Magie der Entdeckung zu zerstören?
- **UI für räumliches Arbeiten.** Wie greift der Spieler effizient ins 3D-Werkstück ein, ohne dass jede Operation eine eigene Minigame-Schikane wird?
- **Performance bei rekursiven Compounds.** Ein Schiff kann zehntausend Bauteile haben. Wie aggregieren sich Tags und Lastrechnungen, ohne die Engine zu sprengen?
- **Modifikation existierender Compounds.** Kann der Spieler einen bereits gebauten Hammer umarbeiten? Was passiert mit der Präzisions-Historie der bestehenden Teile?

---

## Schlussbemerkung

Was dieses System auszeichnet ist nicht Komplexität — es ist **Konsistenz**. Es gibt nur ein Prinzip (Form × Material × Operation → räumlicher Compound mit emergenten Tags), und dieses Prinzip skaliert vom Pfeil bis zum Palast. Spieler lernen eine Logik. Designer pflegen zwei Tabellen. Die Welt liefert unendliche Vielfalt.

Das ist die Wette: dass weniger wirklich mehr ist, wenn das Wenige *richtig* gewählt ist.
