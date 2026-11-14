# Verwitterung, Erosion und Boden — das Relief aus Abtrag und Ablagerung

## Die Vision hier

Jede Form der Oberfläche ist eine ERZÄHLTE Form: der Spieler steht im Tal und kann ablesen, welches Wasser, welches Eis, welcher Wind, welche Hand und welche Zeit es gegraben haben — der Prallhang trägt Kies, der Gleithang Sand, der Altarm verlandet zum Moor, das Delta fächert sich ins Meer, die Barchan-Düne wandert im Zeitraffer übers Erg, die Doline bricht über dem Höhlensystem ein, der Gletscher hinterlässt Kar, Trog, Moräne und Schafsrücken. Unter jedem Schritt liegt ein Boden mit Horizonten, gereift aus Gestein × Klima × Hang × Leben × Zeit, und unter dem Boden eine begehbare Tiefe aus Schichten, Klüften und Höhlen. Das gilt nicht für eine Karte, sondern für jeden Planeten (die Erde allein 5,1 × 10⁸ km²), für jede Epoche, die der Spieler bereist (das Relief der Eiszeit ist ein anderes als das heutige, das Relief vor 300 Mio. Jahren ein drittes), für fremde Welten, deren Agenzien Methan-Regen, CO₂-Eis oder Sandstürme unter dreifacher Schwerkraft sind — und für den Menschen als jüngstes Agens: Terrassen, Polder, Tagebau, aufgeschüttetes Land, auf dem Megastädte stehen, größer als Tokio. Alles aus EINEM Samen: das Relief ist das Gleichgewicht von Hebung und Abtrag, nicht ein Rauschen mit Nachbearbeitung — und es bleibt lebendig, weil der Spieler, das Wetter und die Zeit es weiter formen.

## Das Beste der Gegenwart

- **Microsoft Flight Simulator 2020/2024** (Asobo): die ganze Erde aus Satelliten-DEM und Photogrammetrie, gestreamt in Petabyte-Größe. Grenze: kopiert die Erde, erzeugt keine; kein Boden-Profil, keine Formveränderung, ohne Netz kein Bild.
- **Gaea / World Machine / Houdini Heightfield** (Offline-Werkzeuge): hydraulische und thermische Erosion, Sedimentablagerung, Flussbetten auf 8k-Höhenfeldern in Minuten. Grenze: begrenzte Kachel, offline, das Ergebnis wird als Asset gebacken.
- **Schott, Paris, Fournier, Guérin, Galin — „Large-scale Terrain Authoring through Interactive Erosion Simulation"** (ACM TOG 2023; Vorläufer Cordonnier et al. 2016): Relief aus gemalter Hebung + Stream-Power-Erosion, interaktiv; das Prinzip „Hebung − Abtrag = Form". Grenze: Fluvial allein, kein Boden, keine Gletscher/Wind/Karst, Region statt Planet.
- **From Dust** (Ubisoft, 2011): Wasser trägt Sand ab, Lava erstarrt, ein Damm staut — gekoppelte Stoffe in Echtzeit. Grenze: kleine Inseln, grobe Zellen.
- **No Man's Sky / Minecraft 1.18**: unendliche bzw. 18 Trillionen Welten aus Rauschen mit Spline-Feldern („Erosion" als Parameter-Feld). Grenze: das Wort Erosion ist nur ein Rauschkanal; keine Entwässerung, keine Sedimentsortierung, kein Boden.
- **Teardown / Deep Rock Galactic**: vollständig zerstörbarer Fels bzw. prozedurale Höhlen, die man gräbt. Grenze: kein geologisches Gesetz hinter Schicht und Hohlraum, kein Abtrag durch Wasser.
- **Die Wirklichkeit**: Landschaftsevolutionsmodelle (CHILD, Landlab, Badlands/goSPL) rechnen Kontinente über Millionen Jahre mit Fluvial-, Hang-, Küsten- und Karbonat-Prozessen; SoilGrids (ISRIC) kartiert Bodeneigenschaften weltweit in 250 m; die WRB kennt 32 Referenz-Bodengruppen; Jennys Gleichung s = f(cl, o, r, p, t) ist das Gesetz der Bodenbildung. Grenze: Stunden bis Wochen Rechenzeit, nie Echtzeit, nie begehbar.
- **Dünen-Modelle** (Werner 1995, zelluläre Sandflüsse): Barchane, Transversal- und Sterndünen aus EINER Regel von Wind × Sand-Angebot. Grenze: in Spielen nie gekoppelt mit Wetter und Gelände eingesetzt.

## Der Same

**Massenbilanz der Oberfläche: ∂h/∂t = Hebung − Abtrag(Agens, Gestein, Klima) + Ablagerung**, mit Sediment als ERHALTENER Größe — was oben fehlt, liegt unten (Aue, Delta, Schwemmfächer, Düne, Moräne, Aufschüttung). Der Abtrag hat genau eine Form je Agens: Stream-Power für Wasser (E = K·A^m·S^n), Diffusion für Hangkriechen, Grenzwinkel für Rutschung, Eisfluss-Gleiten für Gletscher, Sättigungsfluss für Wind, Lösung für Karst — und der Mensch als Agens mit Zweck (Ebene für Acker, Damm für Wasser, Fläche für Stadt). Der Boden ist dieselbe Bilanz senkrecht: Verwitterungsfront frisst ins Gestein, Abtrag nimmt oben weg — die Mächtigkeit ist das Gleichgewicht (Humphreys-Heimsath-Bodenproduktionsfunktion), die Horizonte sind seine Schichtung; begrabene Böden sind die Bilanz früherer Epochen. Gelöst hat das die **Geomorphologie mit ihren Landschaftsevolutionsmodellen**, für die Echtzeit-Seite die **Hydrologie-Ingenieurskunst** (Abflussrouting D8/MFD) und die **Film-VFX** (gebackene Erosion). Unsere Wendung: die Bilanz wird nicht über Millionen Jahre simuliert, sondern als GLEICHGEWICHTS-Funktion abfragbar (das Flussnetz zuerst, die Profile analytisch), und nur dort, wo der Schirm hinsieht oder ein Ereignis wirkt, zeitlich gelöst. Die Fähigkeit, die zählt: aus EINEM Satz Konstanten (Hebung, Gestein, Klima, Schwere, Agenzien) folgt JEDE Form — nicht hundert einzeln gebaute Formen.

## Die Leitern

Preis-Kürzel: **P0** = Bild p95 ≤ 33 ms auf dem Standardgerät (Radeon 890M / GTX 1060), Ankunft ≤ 5 s kalt, 0 MB Download über das Skript hinaus, Kosten an Schirm + Änderung (nie an Weltgröße). Jede Sprosse nennt, was zu P0 hinzukommt; ohne P0 gilt keine.

### L1 Relief aus Abtrag — wie wahr die Großform ist (Statistik gegen die Erde)
Misst, ob das Relief über wachsende Fläche die Kennzahlen echter Landschaften trägt (Hack-Gesetz, Horton-Verhältnisse, Hangverteilung, Hypsometrie) — gezählt an N zufälligen Saaten, gefahren im Spiel (Flug, Ego), nie nur am Kern.

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Saat, Netz bis Horizont | jeder Lauf endet in See oder Meer | P0 | Anteil der Läufe, die in See oder Meer enden = 100 %, im Spiel an 20 Orten auf der sichtbaren Fläche nachgefahren | headless gehalten (293/293), im Spiel nie gefahren → **unter der Sprosse** |
| 2 | 10² km², 20 Saaten | Hack L ∝ A^0,5–0,6 und Bifurkation 3–5 | P0, Fernsicht 10 km | Anteil der Saaten, deren sichtbares Netz beide Kennzahlen trägt ≥ 80 % | |
| 3 | 10⁴ km², 50 Saaten | Hangverteilung + Hypsometrie-Integral im Band der Erd-DEM-Klasse (Copernicus 30 m) gleichen Klimas | P0, Fernsicht 30 km | Wasserstein-Abstand Hangverteilung ≤ 3°, Anteil plausibler Saaten ≥ 80 % | |
| 4 | 10⁶ km² (Kontinent) | Relief = Gleichgewicht Hebung × Abtrag; Wasserscheiden, Durchbruchstäler, Becken folgen dem Hebungsfeld | P0 im Flug 2 km Höhe, 300 m/s ohne Hänger | Blind-Paar Luftbild-Spiel vs Satellit gleicher Klasse: Fehlerquote der Betrachter ≥ 35 % (50 % = ununterscheidbar) | |
| 5 | Planet (5,1 × 10⁸ km²), 100 Saaten | Anteile der 10 Geomorphon-Klassen ±20 % der Erde; Kontinente, Schelfe, Gebirgsgürtel an Plattengrenzen | P0 vom Orbit bis zum Boden ohne Ladepause; Ankunft an JEDEM zufälligen Ort ≤ 5 s | Geomorphon-Histogramm vs Erde; Orbitbild-Blindpaar ≥ 35 % Fehler | |
| 6 | jede Welt: Stichprobe 100 Planeten aus beliebigen Konstanten (g, Atmosphäre, Flüssigkeit, Gestein) | fremde Agenzien erzeugen eigenständige, physikalisch stimmige Großformen | P0 je Planet, Planetenwechsel ≤ 5 s | Anteil der Stichproben-Planeten, deren Kennzahlen (Hack, Hang, Hypsometrie) in den aus ihren Konstanten vorhergesagten Bändern liegen ≥ 80 %; Blindpaar vs Mars-/Titan-Bilder ≥ 35 % Fehler | |

### L2 Formschatz — die Kraft, Landformen aus Agenzien entstehen zu lassen
Misst nicht die Zahl gebauter Formen, sondern ob der Same sie UNGERUFEN hervorbringt und ob sie dem Klima folgen: dieselbe Saat mit anderem Klima trägt den Formschatz, den die Erde an solchem Klima trägt.

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel) | Stand |
|---|---|---|---|---|---|
| 1 | 3 Klassen | Profil-Gesetz (V-Tal/Trog-Profil, Aue, Schichtstufe/Tafelberg) | P0 | Blind-Klassifikation von Ego-Bildern an 20 Saaten: Trefferquote ≥ 80 % für 3 Klassen | aus dem Code gelesen, nie blind geprüft → **unter der Sprosse** |
| 2 | 10 Klassen, 1 Agens (Wasser) voll | + Mäander mit Prall/Gleithang, Schwemmfächer, Schutthang, Talsee, Kerbtal, Terrasse | P0 | Blind-Klassifikation: Trefferquote ≥ 80 % je Klasse | |
| 3 | 30 Klassen, 4 Agenzien (Wasser, Hang, Wind, Eis) | + Delta, Altarm, Kar, Moräne, Barchan, Strandwall, Badlands, Canyon | P0 | Blind-Klassifikation ≥ 80 %, Foto-Blindpaar ≥ 25 % Fehler | |
| 4 | ganzer Erd-Formschatz (~100 Klassen, alle 7 Agenzien inkl. Karst, Küste, Vulkan) | KLIMA-ANTWORT: dieselbe Saat bei arid / humid / glazial trägt den Formschatz ihres Klimas | P0 | Klima-Tausch an 50 Saaten: Klassen-Verteilung vs Erd-Referenz gleichen Klimas (Wüste: Pediment, Wadi, Erg; Kaltzeit: Kar, Trog, Os) — Rangkorrelation ≥ 0,8; Foto-Blindpaar ≥ 35 % | |
| 5 | jede Klasse über 4 Größenordnungen | dieselbe Form vom 1-m-Rippel bis zur 100-km-Draa, vom Rinnsal-Delta bis zum Ganges-Delta | P0 | Längen-Breiten-Gesetz je Klasse über 4 Größenordnungen gehalten (gemessen an Bildern im Spiel) | |
| 6 | jede physikalisch mögliche Welt (Stichprobe 100 Planeten) | Formen, die die Erde nicht kennt, die Physik aber verlangt (Sublimations-Mulden, Methan-Karst, Niedrig-g-Rutschungen) | P0 je Planet | Fachjury-Blindurteil „physikalisch möglich" ≥ 80 % je Stichprobe; Konstanten-Tausch ändert die Formen vorhergesagt | |

### L3 Boden — Gestein wird Boden mit Horizonten
Misst, ob unter jedem Ort ein gereifter Boden liegt, der im Anschnitt Horizonte zeigt und dessen Typ aus Gestein × Klima × Hang × Leben × Zeit folgt. (Was der Boden für andere Systeme bewirkt, misst L6.)

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel) | Stand |
|---|---|---|---|---|---|
| 1 | Fels hat Stoff | Schutt, Flechte, Moos aus Steile und Feuchte; Erdboden-Farbe = Rauschen | P0 | Anteil der Bodenfarb-Varianz im Ego-Bild, der aus Gesetz-Größen (Steile, Feuchte, Höhe) erklärt wird ≥ 50 % | Fels-Teil gelesen, Erdboden Rauschen; nie gemessen → **unter der Sprosse** |
| 2 | 1 Bodenart-Feld, Planet | Korngröße Sand/Schluff/Ton aus Herkunft (Hang, Aue, Wind); im Bild als Farbe und Textur | P0 | Korngröße im Bild nimmt stromab ab: Rangkorrelation an 20 Läufen ≥ 0,7 | |
| 3 | Horizonte überall | O/A/B/C im Anschnitt jedes Grabens, Mächtigkeit aus Bodenproduktion − Abtrag | P0, Anschnitt sichtbar ≤ 2 s nach dem Graben | Graben an 50 zufälligen Orten: Horizonte sichtbar; Mächtigkeit Kuppe < Unterhang in ≥ 90 % | |
| 4 | 10 WRB-Gruppen | Podsol, Schwarzerde, Gley, Moor, Rendzina, Wüstenboden … nach Klima × Gestein | P0 | Bodentyp-Anteile vs SoilGrids-Region gleichen Klimas ±25 % | |
| 5 | 32 WRB-Gruppen | Munsell-Farbe und Gefüge im Anschnitt | P0 | Bildpaar Anschnitt vs Referenzprofil-Foto (ISRIC): ΔE ≤ 10, Blindpaar ≥ 35 % Fehler | |
| 6 | Planet × Epoche × fremde Welt | begrabene Paläoböden, Lössdecken der Kaltzeit, Regolith luftloser Welten, Perchlorat-Böden | P0, Zeitsprung ≤ 5 s | Zeitreise/Planetenwechsel: Anschnitt zeigt begrabene Böden in stratigraphisch richtiger Folge an ≥ 90 % der Stichproben; Regolith-Blindpaar vs Mond-/Mars-Fotos ≥ 35 % | |

### L4 Lebendige Form — das Relief ändert sich in Spielzeit und über Epochen
Misst, ob Abtrag und Ablagerung als EREIGNIS sichtbar werden: was der Spieler, das Wetter oder der Zeitraffer anstößt, formt die Oberfläche messbar um — bis zur Zeitreise durch die Geschichte eines Planeten.

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel) | Stand |
|---|---|---|---|---|---|
| 0 | statische Form | Graben füllt sich mit Wasser, gräbt aber nichts | — | — | HEUTE (unter der Leiter) |
| 1 | 1 Graben | Wasser im Spieler-Graben am Hang vertieft und weitet ihn, Sediment setzt sich am Fuß ab | P0 während des Ereignisses | Volumen-Bilanz: Abtrag oben = Ablagerung unten ±10 %, sichtbar in ≤ 10 min Spielzeit | |
| 2 | 1 ha, 1 Starkregen | Rinnen, Schwemmkegel, Hangrutsch an Übersteilung | P0 während des Regens | Zahl neuer Rinnen wächst mit der Regenmenge (Rangkorrelation ≥ 0,8 an 10 Läufen); Bildpaar vorher/nachher | |
| 3 | 10 km Fluss, 10² Jahre Zeitraffer | Mäander wandert, schnürt Altarm ab, Hochwasser legt Auenlehm ab | P0 im Zeitraffer | Migrationsrate 1–5 % Breite/Jahr; Abschnürung tritt ein; Bildfolge vs Landsat-Zeitreihe eines Tieflandflusses | |
| 4 | 10² km², 10³ Jahre | Delta wächst, Düne wandert (Barchan 10–30 m/a), Küste verlagert sich | P0 im Zeitraffer | Raten im Band der Messwerte; Bildfolge vs Satellit | |
| 5 | 10⁴ km², 10⁵ Jahre | Eiszeit-Zyklus: Gletscher stößt vor, schleift Trog, hinterlässt Moräne, See, Löss | P0, Zeitsprung ≤ 5 s | nach dem Zyklus: glaziale Formschatz-Klassen ≥ 8, an ≥ 90 % oberhalb der Kaltzeit-Schneegrenze | |
| 6 | Planet, 10⁹ Jahre, jede Epoche bereisbar | Gebirge entsteht und wird abgetragen, Peneplain, Rumpfflächen; Übergänge stetig | P0, Zeitsprung an jeden Ort und jede Epoche ≤ 5 s | Zeitreise an 100 Orten × 10 Epochen: Relief-Kennzahlen in L1-Bändern; Erd-Saat: Relief vs paläogeographische Rekonstruktion (Hang, Gewässernetz) im Band | |
| 7 | jede Welt × ihre ganze Geschichte (Stichprobe 100 Planeten × 10 Epochen) | jede Welt trägt ihre eigene Abtragsgeschichte aus ihren Konstanten | P0 | Anteil plausibler Planet-Epoche-Paare ≥ 80 % | |

### L5 Korn bis Orbit — Detail und Sortierung über alle Maßstäbe
Misst, ob das Relief vom Kiesel bis zur Bergkette dasselbe Gesetz zeigt: Sortierung, Rippel, Klasten, Bänke — ohne sichtbaren Bruch zwischen Nah und Fern.

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel) | Stand |
|---|---|---|---|---|---|
| 1 | Nahfeld ~20 m | Wiese trägt, Fels mit Schutt aus dem Schicht-Gesetz, Ufersand per Rauschen | P0 | Ego-Bild 1 m: Foto-Blindpaar ≥ 15 % Fehler | nie blind geprüft → **unter der Sprosse** |
| 2 | 1–100 m | Kies am Prallhang, Sand am Gleithang, Blöcke unter Kliff | P0 | Klastengröße im Bild passt zum Ort (Prall/Gleit, Hangfuß) an ≥ 80 % von 50 Orten | |
| 3 | 1 cm – 1 km | Rippel im Sand, Trockenrisse, Spülsaum; Korn am Fuß sichtbar | P0 | Bildpaar Ego 1 m vs Foto: Blind-Fehler ≥ 25 % | |
| 4 | 1 cm – 30 km | Nah und Fern zeigen dieselbe Form | P0 im Flug 1 m → 3 km | Flug-Video: Betrachter melden ≤ 1 sichtbaren Sprung / Flimmern je Minute; Bildfolge-Differenz ohne Stufen über der Rauschschwelle | |
| 5 | 1 mm – Orbit | Korn bis Kontinent ohne Ladepause | P0 auf dem ganzen Weg | Bildpaare an 5 Maßstäben (1 m, 10 m, 1 km, 100 km, Orbit) je Blind-Fehler ≥ 35 % | |

### L6 Kopplung — Relief und Boden als gelesene Ursache, der Mensch als Agens
Misst, wie viele Systeme der Welt das Relief und den Boden LESEN, und ob der Mensch es zurück formt (R7: Vulkan formt Küste formt Stadt formt Verkehr — und die Stadt formt das Land).

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel) | Stand |
|---|---|---|---|---|---|
| 1 | Wasser-Spiegel + Boden-Höhe | Leser folgen EINEM Spiegel; Huf, Rad, Fuß stehen auf dem Boden ≤ 3 cm | P0 | Kern-Mutation an 50 Punkten: Anteil der Leser, die im Bild folgen = 100 % | headless 6/6 Orte; im Spiel nicht an 50 Punkten → **unter der Sprosse** |
| 2 | + Boden-Leser (≥ 5) | Pflanzenwahl nach Bodenart und Feuchte, Rad sinkt in Schlamm, Ernte, Fundament-Tragfähigkeit, Farbe | P0 | Mutation der Bodenart ändert ≥ 5 Leser beobachtbar im Bild | |
| 3 | + Siedlung | Siedlung an Furt, Terrasse, Hochwasserlinie; Acker auf Aue/Löss | P0 | Anteil der Siedlungen an relief-plausiblen Orten ≥ 80 % (Zufallsorte ≤ 30 %) | |
| 4 | + Verkehr | Trassen folgen Tälern und Pässen, Brücken an Engstellen | P0 | Trassen-Steigung ≤ Grenze in ≥ 95 %; Pass-Anteil vs kürzestem Weg | |
| 5 | + Ereignis-Kaskade | Starkregen → Rutschung → Straße gesperrt → Umweg; Fluss verlagert → Stadt baut Deich | P0 während der Kaskade | Ereignis-Kette an 20 Saaten: Folge tritt ein und ist sichtbar | |
| 6 | Mensch als Agens, Stadt-Maßstab | Terrassenbau, Polder, Tagebau, Landgewinnung; die Megastadt steht auf geformtem Land (Aufschüttung, Kanäle, eingeebnete Hügel) | P0 in der Stadt | Bildpaar Relief vor/nach der Besiedlung: bewegtes Volumen im Band realer Städte gleicher Größe; Luftbild-Blindpaar vs Tokio-Bucht/Rotterdam/Reisterrassen ≥ 35 % Fehler | |
| 7 | Planet × Zeit | Kulturen entstehen am Relief ihrer Epoche (Flusskulturen, Oasen, Terrassen) und hinterlassen es verändert | P0, Zeitsprung ≤ 5 s | Zeitreise: Anteil der Siedlungsorte jeder Epoche an Relief-Gunst ≥ 80 %; Spuren früherer Epochen (Terrassen, Tells, Halden) im Relief späterer sichtbar an ≥ 80 % | |

### L7 Die Tiefe — Schicht, Kluft, Höhle und Karst unter der Oberfläche (NEU)
Misst, ob unter dem Relief eine begehbare Tiefe liegt, die aus demselben Gesetz folgt: Schichten, die das Tal anschneidet, Höhlen, wo Wasser Kalk löst, Dolinen, wo die Decke bricht.

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel) | Stand |
|---|---|---|---|---|---|
| 1 | Höhlen-Feld, Mündung im Fels | Höhlen 16 m unter dem Boden, Mund nur an Felsflanke 40–50° | P0 beim Betreten | Mündungen je km² an 3 Saaten im Band; Mund steht im Bild an ≥ 90 % im Fels | Gesetz steht (`gelaende-core.js:2800-2806`, 5 · 1 · 14 Mündungen/km² gemessen), im Spiel nie blind gefahren → **unter der Sprosse** |
| 2 | Anschnitt = Schicht | jede Grabung, jedes Kliff zeigt dieselbe Schichtfolge wie die Nachbarwand | P0 | Graben an 50 Orten: Schichtgrenzen setzen sich über ≥ 100 m stetig fort (Versatz nur an Störungen) | |
| 3 | Karst aus Lösung | Höhlen nur in löslichem Gestein, Dolinen über Hohlräumen, Quellen am Höhlenausgang, Ponore | P0 | Anteil der Höhlen in Karbonat ≥ 90 %; Dolinen-Dichte vs Höhlen-Dichte korreliert ≥ 0,7; Foto-Blindpaar Karstfeld ≥ 25 % | |
| 4 | System 10 km, begehbar | verzweigte Höhlensysteme mit Tropfstein, Siphon, unterirdischem Fluss, der oben als Quelle austritt | P0 unter Tage | Höhlenplan-Statistik (Verzweigung, Gangquerschnitt) im Band realer Systeme; Bildpaar ≥ 35 % Fehler | |
| 5 | Planet × fremde Welt | Lava-Röhren, Eis-Höhlen, Methan-Karst; Tiefe bis zur Kruste begehbar | P0 | Stichprobe 100 Planeten: Höhlentyp folgt Gestein und Lösungsmittel an ≥ 80 % | |

### L8 Lesbare Geschichte — das Relief erzählt, wer es formte (NEU)
Misst die Vision des ersten Satzes: kann ein Kundiger aus dem Bild ablesen, welches Agens und welche Zeit diese Landschaft formte? Das Ergebnis aller Leitern oben, geprüft wie ein Geologe im Feld.

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Agens je Ort | das dominante Agens (Wasser/Eis/Wind/Hang) ist im Bild lesbar | P0 | Fachjury bestimmt aus 50 Ego-Bildern das dominante Agens: Trefferquote ≥ 70 % (Zufall 25 %) | |
| 2 | Agens + Abfolge | zwei Agenzien nacheinander (Gletschertal, später fluvial zerschnitten) sind lesbar | P0 | Jury bestimmt die Abfolge an ≥ 60 % von 50 Orten | |
| 3 | Zeit | Alter der Form (jung/alt) und Klima der Bildung lesbar, inkl. menschlicher Spuren | P0 | Jury ordnet 20 Orte nach Alter: Rangkorrelation ≥ 0,6 mit der wahren Geschichte | |
| 4 | jeder Ort jeder Welt | Spurenlesen gelingt auf fremden Welten aus deren Physik | P0 | Stichprobe 100 Planeten: Jury-Trefferquote ≥ 60 % für Agens und Abfolge | |

## Stand heute

- **Großform**: `gelaende-core.js:359-378, 565-602` — Kontinentalität, ein Feld namens „Erosion" (λ ≈ 3 km) und Stil als glatte Rausch-Felder durch Splines (Minecraft-1.18-Prinzip); das Wort Erosion ist hier ein Parameterfeld, kein Abtrag.
- **Hebung**: BERICHTIGT — ein Feld U existiert (`gelaende-core.js:598`, U = 0,55 + rel/240 + off/160) und steilt die Flüsse (ks = ks₀·U, Zeile 564, 720-721). Es ist aber aus dem Rausch-Relief ABGELEITET, nicht dessen Ursache: keine Platte, keine Störung, keine Hebungsgeschichte. Die Kausalität läuft verkehrt.
- **Flussnetz zuerst**: `gelaende-core.js:364-370` — drei Ebenen (1600/400/100 m), Sohle nach Stream-Power S = ks·A^−θ, Entwässerung garantiert; gemessen HEADLESS: Läufe 293 von 293 in See oder Meer (MEISTERKARTE.md:240, an d3708675). Im Spiel nie nachgefahren.
- **Talprofile**: V bis Trog über einen Exponenten (`gelaende-core.js:387-388, 909`, „trog" 0,7 im Hochgebirge) — der Trog ist eine Profilform, kein Gletscher; keine Kare, Moränen, Schafsrücken.
- **Mäander**: `gelaende-core.js:765-784` — sinus-erzeugte Kurve (Langbein & Leopold), Sinuosität ≈ 1,49, abhängig vom Gefälle; kinematisch, wandert nie, keine Altarme, kein Prall/Gleithang-Sediment.
- **Flussbreite**: hydraulische Geometrie W ∝ A^0,37 (`gelaende-core.js:744-746`).
- **Schicht-Gesetz**: Pediment → Schutthang (33–37°) → Kliff → Bank (`gelaende-core.js:374-375`), Schutt als Bild-Attribut (`stamm/gelaende-boden.js:2399-2425`, `aSchutt`).
- **Höhlen**: ERGÄNZT — ein Höhlen-Feld 16 m unter dem Boden mit Mündung im Fels (`gelaende-core.js:2800-2806`), gemessen 5 · 1 · 14 Mündungen/km² an drei Saaten. Ohne Bezug zu Gestein oder Lösung: kein Karst.
- **Boden**: keine Horizonte, keine Bodenarten, keine Bodentypen. Erdboden-Farbe aus Rausch-Flecken und Ufer-Sand (`stamm/gelaende-boden.js:2459-2556`); `sediment` ist eine Farbe des Seebodens (`foundry-core.js:89,100`) und eine Fels-Sorte der Streu (`foundry-core.js:679,697`); „karst" ist eine Baum-/Streu-Art (`foundry-core.js:635,688`), keine Landform.
- **Nichts** zu: Delta (die Mündung ist eine Senke, `gelaende-core.js:618`), Schwemmfächer, Dünen, Karst-Formen, Moor, Gletscherschliff, Terrassen, Rutschungen, Sedimentsortierung, menschlicher Formung, Formveränderung in Spielzeit. Ein Spieler-Graben füllt sich mit Wasser (MEISTERKARTE.md:238), das Wasser gräbt aber nicht.
- Kein Relief-Kennwert (Hack, Horton, Hangverteilung) wurde je gegen ein Erd-DEM gemessen; kein Blindpaar lief. Ehrlich eingeordnet steht das Blatt auf **keiner Sprosse im echten Spiel** — die Gesetze tragen L1-1, L2-1, L6-1 und L7-1 im Kern, der Richter im Spiel lief nie.

## Abhängigkeiten

- **Planet und Geologie** liefert Hebung, Gesteinsart und -härte, Störungen, Löslichkeit — ohne echtes Hebungsfeld ist der Same nur halb (L1 ab 4, L7 ab 2).
- **Atmosphäre, Wetter und Klima** liefert Niederschlag, Temperatur, Wind — treibt Abtragsrate, Bodentyp (L3 ab 4), Klima-Antwort (L2-4), Starkregen (L4 ab 2).
- **Ozean, Wasser und Eis** besitzt Wasser und Gletscher; dieses Blatt besitzt, was sie am Gestein HINTERLASSEN (Delta, Trog, Moräne, Küstenform, Höhle).
- **Tiefe Zeit** liefert Zeitachse und Epochen-Zustände (L4 ab 5, L3-6, L6-7).
- **Pflanzen und Biome / Ökosysteme** — Wurzeln bremsen Abtrag, Streu wird Humus; Kopplung beidseitig (L3 ab 2, L6-2).
- **Siedlung und Stadt, Netze und Verkehr, Landwirtschaft** — Leser UND Agens des Reliefs (L6 ab 3).
- **Maßstab-Kontinuum** und **Licht, Bild und Horizont** — tragen L5 technisch.
- **Physik und Stoff** — Korn, Schüttwinkel, Schlamm unter dem Rad, Grabung.
- **Der Same: Architektur der Entfaltung** — die Gleichgewichts-Abfrage statt Zeitsimulation muss dort als Muster stehen.

## Was die alte Karte hier misst

Domäne 1 „Gelände, Boden und Wasser" (MEISTERKARTE.md:224-241, 8/10) misst fast nur Wasser und Konsistenz, nicht das Relief:
- **K1** EIN 3D-Gesetz, Dichte/Edit/Spiegel bit-gleich → keine Sprosse; Bauweise (Architektur-Blatt), nicht Ergebnis.
- **K2** Wasser folgt jedem Edit → Vorstufe von L4-1 (der Graben füllt sich; dass er sich formt, ist die Sprosse).
- **K3** Wasser-Bild an 12 Posen → Wasser-Blatt.
- **K4** EIN Wasser-Spiegel, Läufe enden in See/Meer → L1-1 und L6-1 (headless; im Spiel offen).
- **K5** EINE Boden-Höhe je Rolle, Kontakt ≤ 3 cm → L6-1.
- Formschatz, Boden, Relief-Statistik, Formveränderung, Tiefe und Lesbarkeit haben dort keine Spalte.

## Zweifel

- Die Blind-Paar-Schwellen (15/25/35 % Fehlerquote) und Bänder (Wasserstein ≤ 3°, ±20 %, ±25 %) sind gesetzt, nicht kalibriert — sie brauchen einen ersten Lauf mit echten DEM-Kacheln und Fotos.
- Ob die Gleichgewichts-Abfrage Altarm, Delta, Moräne und Paläoboden tragen kann, ist offen; diese Formen sind Geschichte, nicht Gleichgewicht — L4 ab 3 verlangt wohl eine lokale Zeit-Lösung, deren Preis bei 33 ms unbekannt ist.
- Jury-Richter (L2-6, L8) sind teuer und langsam; ob ein trainierter Klassifikator die Jury ersetzen darf, ohne dass die Welt auf ihn hin gebaut wird, ist offen.
- Die Grenze zum Ozean-, Geologie- und Tiefe-Zeit-Blatt ist an Delta, Küste, Gletscher, Höhle und Epochen-Relief verwischt; Doppelzählung droht.
- L1-6, L4-7, L7-5 haben Referenzen (wenige Planetenbilder, Rekonstruktionen), die selbst unsicher sind — eher offene Frage als Punkt, bis eine Referenz-Sammlung steht.

## Gegenlese — was sich änderte und was strittig bleibt

- **Stand berichtigt (3 Proben im Code):** (1) „ohne Hebung als Ursache" stimmte halb — ein Hebungsfeld U existiert (`gelaende-core.js:598`), ist aber aus dem Rauschen abgeleitet, also Folge statt Ursache; (2) 293/293 stimmt, ist aber HEADLESS gemessen — nach der Goldenen Definition beweist das Mechanik, nie das Spiel, daher stehen L1-1, L2-1, L3-1, L5-1, L6-1 jetzt **unter der Sprosse**, nicht HEUTE; (3) „Nichts zu Karst" stimmt, aber ein Höhlen-Feld mit Mündungs-Gesetz existiert (`gelaende-core.js:2800-2806`) und fehlte ganz.
- **Doppelt:** alte L1-7 (Paläo-Relief) = alte L4-6 → in L4-6 vereint; alte L3-6 (Boden als Leser-Netz) = alte L6-2 → in L6-2 vereint.
- **Neu:** L7 Die Tiefe (Schicht, Höhle, Karst — die Wurzel liegt schon im Code) und L8 Lesbare Geschichte (die Vision des ersten Satzes bekam vorher keinen Richter); L6-6 der Mensch als Agens (Tokio steht auf aufgeschüttetem Land — ohne das bleibt die Megastadt auf einer Wiese).
- **Fleiß → Fähigkeit:** L2 zählt nicht mehr Klassen allein; ab Sprosse 4 richtet der KLIMA-TAUSCH an derselben Saat — die Kraft des Samens, nicht der Katalog.
- **Richter:** L5-4 „Pixel-Sprung an LOD-Grenzen" schrieb eine Bauweise vor → ersetzt durch sichtbare Sprünge je Minute im Flug-Video; L3-1 bekam eine Schwelle; alle „dito"-Preise wurden P0 + Zusatz (Fernsicht, Flug, Zeitsprung, Ankunft an jedem Ort).
- **Gehoben:** L1-6 von „10³ Planeten" auf eine Stichprobe aus BELIEBIGEN Konstanten (R4); L4 bis 10⁹ Jahre; L3-6 schließt fremden Regolith ein.
- **Strittig:** ob L8 (Jury-Lesbarkeit) ein Richter oder eine offene Frage ist; ob der Mensch als Agens hier oder im Stadt-Blatt zählt; ob „unter der Sprosse" für headless-Gesetze zu hart ist, wenn die Messung im Spiel nur Stunden kostet.
