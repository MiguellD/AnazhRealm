# DER WAHRE BAUPLAN — Ω-PHYSIS

> **STAND (15.06.2026 — DER AKTIVE BOGEN · Gesicht „SEIN / Physik"):** SÄULE I (der
> Schiedsrichter) + SÄULE II (der vertiefte Leser) sind GEBAUT + objektiv bewiesen
> (V18.238–V18.239, headless-flake-frei — reine Berechnung). **Ω-Φ1** Schwerpunkt
> (`_compoundCenterOfMass`) · **Ω-Φ2** Stützpolygon+Stabilität (`_supportPolygon`/
> `_stability`, der SSF — CoM-Höhe über der Basis) · **Ω-Φ3** Steifigkeit+Versagen
> (`_bendingStiffness`/`_failsUnderLoad`, das Knicken §9#8) · **Ω-Φ4** Hebel+Schwung
> (`_swingDynamics`) · **Ω-Φ5** Lastpfad+Schneide (`_loadPath`/`_edgeContinuity`).
> **Ω-L1** die Physik-Achsen im Produkt-Vektor (regressionsfrei — neue Keys, 0 Rollen-
> Sprung) · **Ω-L2** vehicle/architecture lesen stability/rollable/loadSound (das
> WAHRHEITS-BAND: ein kopflastiges Fahrzeug liest schwächer; Built-ins domain-fest,
> GEMESSEN kein Live-Rollen-Drift) · **Ω-L3** AXIS_CLASS (physik/konvention/form) ·
> **Ω-W1** der Warum-Chip ZITIERT die gerechnete Physik (KONSUM-Beweis). 16/16
> `diag-physis` + die Bänder `checkBandOmegaPhysisSaeuleI_II` grün. **SÄULE IV — DER
> WAHRHEITS-SPIEGEL GEBAUT (V18.241, die zwei Seelen vereint):** **Ω-W2** die
> Optimierung an ECHTEN Größen (`AXIS_ACTION_HINTS` liest die gerechneten Physik-Achsen
> physik-wahr — „verbreitere die Basis → Schwerpunkt sicherer"; BEWIESEN: die Tat
> verschiebt die gerechnete Größe messbar, `_stability().margin` 0.234→1.0) · **Ω-W3**
> das BAU-FEEDBACK (`_workshopPhysicsVerdict` — die in Säule I gerechnete Physik [das
> SEIN] wird sichtbares Werkstatt-Feedback [der ANBLICK]): ein instabiles Werk WANKT
> sichtbar in der Vorschau (`_loadPath.floatingParts` + der Lean-Tick), ein schwebendes
> Teil wird warn-markiert, der Physik-Spiegel sagt kippt/wackelig/steht/knickt/
> kopflastig — rollen-bewusst (eine Waffe „kippt" nicht, sie schwingt träge). 10/10
> `diag-werkstatt-spiegel` + `checkBandOmegaWerkstattSpiegel` grün (Mechanismus + CONSUM
> hart bewiesen; der finale LOOK des Wankens ist AUGEN-bound, Wand 1 von Ω-OPSIS).
> **NÄCHSTE:** SÄULE III Grammatik (Entasis/Kanneluren/Oakeshott — die Schönheit, größer
> + teils AUGEN-bound). Die Minimal-Wahrheit (§8) — Säule I+II — war gelandet; mit
> Säule IV ist der WERKSTATT-Spiegel rund: das unsichtbare Kugel-Problem ist geheilt UND
> die Wahrheit ist sichtbar, bevor das Werk in die Welt geht.
>
> **EIN PRINZIP, ZWEI GESICHTER:** dieser Plan (das SEIN) und `wahreranblick.md`
> (Ω-OPSIS, der ANBLICK) sind dasselbe Gesetz — _jede Eigenschaft ist ein
> Auslesewert der Wahrheit, gerechnet/gelesen, nie geraten/gemalt._ Das Kugel-
> Problem zwei Ebenen tiefer (Ω-PHYSIS unsichtbar, Ω-OPSIS sichtbar). Die Vision
> verankern `state-of-realm.md` + `das-lebendige-feld.md`; das WERDEN (Wasser-CA,
> Ω-CHRONOS) ist gebaut. **Ω-PHYSIS ist headless VOLL verifizierbar (kein Flake) →
> hier lande ich Welle für Welle mit hartem Beweis.**

---

> Das Gegenstück zum Lebendigen Giganten. Dort: die Vegetation, gewachsen aus
> Grammatik. Hier: jeder gebaute Bauplan, jedes Objekt, die Werkstatt selbst —
> auf das Niveau des Baums gehoben. Nicht eine schöne Attrappe, sondern ein
> Ding, dessen Schönheit aus Grammatik UND dessen Tiefe aus echter Physik
> kommt. Die zwei werden eins, wie beim Baum.
>
> Geschrieben nach der Code-Analyse vom 14.06. — die das System ehrlicher
> zeigt, als jeder Plan zuvor: AnazhRealm hat die Seele, den Leser, die
> Resonanz und die Transparenz schon gebaut. Es greift sogar schon nach der
> Physik — aber es rechnet sie nicht. Es rät sie mit Geometrie-Heuristik.
> Das ist das Baum-Kugel-Problem, eine Ebene tiefer und unsichtbar.

---

## §0 — DIE VISION UND DIE ENTDECKUNG

### Was die Analyse fand (die starke Seele)

Der Code beweist: das System ist weiter als gedacht. Es gibt **eine Sprache**
für alles — Baum, Kreatur, Spieler-Seele, Bauwerk, Schwert sind alle
`parts × Material`, ein Bauplan. Es gibt den **Eigenschafts-Leser** schon:
`computeMotionRoles` (Z. 13887) liest aus Teilen Rollen (rad/wirbel/scharnier/
bein/arm), `_resonateArgmax` (Z. 46903) liest aus dem Produkt-Vektor Werk-
Rollen. Es gibt die **Projektion** (Welt-Affinitäts-Feld, 4 Noise-Schichten),
die **Transparenz** (der Warum-Chip, Z. 46945, erklärt jede Rolle aus ihren
top-3 Tag-Beiträgen). Das ist selten und stark.

### Was sie NICHT fand (die Lücke, exakt wie gefürchtet)

**Keine Physik. Null.** Gesucht: centerOfMass, Schwerpunkt, supportPolygon,
momentOfInertia, Drehmoment, Hebel, Masse, konvexe Hülle. Kein einziger
Treffer im 67.000-Zeilen-System.

Und das Beunruhigende: das System _greift schon nach der Physik_ — aber mit
Geometrie-Heuristik statt Gesetz. Die Achsen verraten es (AXIS_LABELS):

- `spread` = "Standfläche" — greift nach dem **Stützpolygon**, rechnet aber
  nur Bounding-Box-Breite (`_compoundSpread`, Z. 48256:
  `max(sMaxX−sMinX, sMaxZ−sMinZ)/compW`). Fragt "ist die Basis breit", NICHT
  "sitzt der Schwerpunkt über der Basis". Es gibt keinen Schwerpunkt-Test,
  weil es keinen Schwerpunkt gibt.
- `hollowness` = "Hohlraum" — greift nach dem **Flächenträgheitsmoment**,
  rechnet aber nur Volumen-Verhältnis (Z. 48166: `1 − partVol/extVol`). Ein
  massives I-Profil und ein massiver Stab haben beide hollowness 0 — aber
  völlig verschiedene Steifigkeit. Das Gesetz unterscheidet sie; die
  Heuristik nicht.
- `axialSymmetry` = "Symmetrie" — greift nach der **Rotation** (Rad), rechnet
  aber nur ein Symmetrie-Verhältnis (`_compoundSymmetry`, Z. 41907).
- `pointedFraction` = "Schärfe" — greift nach der **Klinge**, rechnet aber nur
  ein Spitzen-Profil (`_blueprintPointedFraction`, Z. 53163).

Das ist dein Satz, im Code bewiesen: das System liest die Rolle aus der Form,
und ob die Form physikalisch _funktioniert_, prüft niemand. „Rad" wird aus
„rund + seitlich" gelesen, nicht aus „rollt um eine freie Achse am
Bodenkontakt". Die Falschheit ist unsichtbar — ein Ding sieht aus wie ein
Fahrzeug und fährt vielleicht falsch.

### Die zwei Hälften dieses Plans

```
WAHRHEIT  — die Physik-Schicht (der Schiedsrichter)
            Schwerpunkt, Stützpolygon, Trägheitsmoment, Hebel, Lastpfad,
            billig über die Teile gerechnet. Vertieft die Heuristik-Achsen
            (spread/hollowness/axialSymmetry/pointedFraction) von Stellvertreter
            zu Gesetz. Macht die TIEFE echt.

SCHÖNHEIT — die Bauplan-Grammatik (reference-first, wie der Baum)
            Tempel, Gebäude, Schwert, Werkzeug, Fahrzeug — von Attrappen zu
            detaillierten Strukturen. Subdivision-Grammatik für Architektur,
            parametrische Montage für Objekte. Macht die FORM wunderschön.

Und beide eins: ein Tempel ist nicht ein hübscher Kasten — seine Säulen
tragen Last (Physik), seine Proportionen folgen einer Grammatik (Schönheit),
seine Tempelheit emergiert aus dem Tag-Vektor (Resonanz, schon da).
```

---

## §1 — DAS ZENTRALE PRINZIP: DER SCHIEDSRICHTER

> Beim Baum war der Richter das Auge plus LAAS' evaluierte Referenz — die
> Wahrheit eines echten Baums. Hier ist der Richter die **Physik**: eine
> externe Wahrheit, gegen die eine Regel verlieren kann. Wo es einen Richter
> gibt, kann das Kugel-Problem nicht zurückkehren.

### Das Meta-Gesetz (der eine Satz, der alles schützt)

> **Keine Eigenschaft darf mehr Gewissheit beanspruchen, als ihr Richter
> hergibt.**

Drei Spalten, in die jede Achse einsortiert wird:

```
PHYSIKALISCH  — hat einen Richter außerhalb des Systems (echtes Gesetz).
                DARF Wahrheit behaupten. Wird GERECHNET, nicht geraten.
                (Schwerpunkt, Stabilität, Steifigkeit, Hebel, Härte, Dichte)

KONVENTION    — hat nur geteilte Bedeutung, keinen physikalischen Richter.
                Behauptet nur KONSISTENZ, nicht Wahrheit. Klar MARKIERT.
                (magieleitung, resoniert, lebendig — AnazhRealms erfundene,
                in sich konsistente Welt-Physik. Legitim. Bleibt.)

WILLKÜR       — koppelt an nichts, weder Physik noch geteilte Bedeutung.
                Eine erfundene Formel, die sich als Gesetz verkleidet.
                Wird VERBANNT oder bis zur Physik zurückverfolgt.
```

### Reference-first, auf die Bedeutung angewandt

Beim Baum: zeichne die schöne Wahrheit zuerst (echte Geometrie), dann
beschreibe sie als Grammatik. Bei der Physik: **rechne die Wahrheit zuerst**
(den Schwerpunkt, das Stützpolygon), dann _lies_ die Eigenschaft daraus. Du
erfindest „balanciert" nicht als Formel — du rechnest den Schwerpunkt
(Physik, wahr), und „balanciert" wird daraus abgeleitet. Der Richter steht
außerhalb. Das Kugel-Problem kann hier nicht zurückkehren, weil keine unreife
Formel die Wahrheit definiert — die Physik tut es.

**Die einzige Wachsamkeit, die bleibt:** Treue. Eine grobe Näherung (Schwert
als Punktmasse) ist selbst eine neue unreife Formel. Verankere an der
ehrlichsten Physik, die du billig rechnen kannst, und lass eine grobe
Näherung nie als das wahre Gesetz auftreten.

### Der Geltungsbereich des Schiedsrichters (die Reflexions-Korrektur)

Bei der Reflexion fand ich einen Riss: die Physik ist im Kern **Kipp-Physik**
(Schwerpunkt über Stützpolygon) plus _isolierte_ Steifigkeit. Das beantwortet
„kippt das Ganze um" — aber nicht „trägt dieses Bauteil die Last, ohne zu
brechen oder zu knicken". Für Architektur ist das die eigentliche Frage: eine
schlanke Säule kann den Kipp-Test bestehen und steif aussehen — und trotzdem
unter dem Dach knicken. Eine so gefälschte Säule bestünde das Wahrheits-Band:
die Attrappe auf Physik-Ebene. Darum prüft Ω-Φ3 jetzt auch das **Versagen**
(Spannung vs. Festigkeit, Knicken), nicht nur die Steifigkeit.

Aber die Treue verbietet Über-Modellierung. Der Schiedsrichter ist ein
**Grob-Sanitäts-Richter**, kein Struktur-Simulator:

```
RECHNET (grobe Wahrheit, billig):
  Kipp-Stabilität · relative Steifigkeit · Balance · Hebel ·
  Lastpfad-Konnektivität · Versagen erster Ordnung (Spannung, Knicken)
RECHNET NICHT (Über-Modellierung):
  keine FEA · keine Druckbogen-Analyse für Bögen/Gewölbe/Strebebögen
```

Die _subtile_ strukturelle Solidität von Kompressionsformen — ein Bogen, der
durch Druck steht, ein Kragträger, ein Strebebogen — trägt die **Grammatik**,
nicht die Physik. Reference-first (§6): die Grammatik baut bekannt-gute Formen,
die stehen, _weil echte Architektur strukturell solide ist_. Kalibrierst du die
Grammatik an realen Bauwerken (Säulen-Ordnungen, Proportionen, bewährte
Tragwerke), bekommst du AUTOMATISCH solide Formen — die Physik muss sie nicht
neu entdecken, sie fängt nur die GROBEN Verstöße (ein schwebendes Teil, ein
wild kopflastiger Turm, eine knickende Über-Schlankheit). So bleibt die Treue
gewahrt: gerechnet wird, was billig und ehrlich ist; die Grammatik trägt den
Rest.

**Wann wird gerechnet:** bei Bau-/Edit-Zeit, gecacht — NICHT pro Frame, nicht
pro Instanz. Built-ins sind wenige, die Werkstatt rechnet on-demand, promovierte
Objekte (Giganten-Plan) bei Berührung. Darum ist der Richter billig.

---

## §2 — DIE ACHSEN-LANDKARTE (GEMESSEN)

> Die Landkarte, die vor jedem Code kommt. Jede existierende Achse einsortiert,
> mit dem Gesetz und der billigen Voxel-Formel daneben. Aus dem echten Code.

### §2.1 — Die 10 Material-Achsen (Z. 65415)

```
PHYSIKALISCH (echter Richter — Materialeigenschaft):
  härte         → Härte (Mohs-artig): hält Schärfe, widersteht Verformung
  dichte        → Dichte ρ: SCHLÜSSEL, denn Masse = Volumen · dichte (§2.3)
  zähigkeit     → Bruchzähigkeit: fängt Stoß ohne zu splittern
  wärmeleitung  → thermische Leitfähigkeit
  stromleitung  → elektrische Leitfähigkeit
  transparent   → optische Transmission
  brennbar      → Entzündlichkeit

KONVENTION (kein physikalischer Richter — AnazhRealms Welt-Physik, bleibt):
  magieleitung  → erfunden, konsistent. Markiert als Konvention.
  resoniert     → erfunden, konsistent. Markiert.
  lebendig      → erfunden, konsistent. Markiert.
```

Die physikalischen Material-Achsen sind schon halb-ehrlich (härte/dichte/
zähigkeit _meinen_ echte Eigenschaften). Der Plan macht sie ganz-ehrlich,
indem er sie an echte Berechnungen koppelt (dichte → Masse → Schwerpunkt).
Die Konventions-Achsen bleiben unangetastet — sie sind nicht falsch, sie sind
eine andere Art von Wahrheit (geteilte, nicht gemessene). Sie nur klar zu
markieren ist die ganze Pflicht.

### §2.2 — Die Form-Achsen (Z. 48149-48168) — der Vertiefungs-Kern

Hier sitzt die eigentliche Arbeit: jede greift schon nach einem Gesetz,
rechnet aber Heuristik. Der Plan ersetzt die Berechnung, nicht die Achse.

```
ACHSE (heute)          GREIFT NACH            HEUTE (Heuristik)       WIRD (Gesetz)
─────────────────────────────────────────────────────────────────────────────────
spread/Standfläche     Stützpolygon-Statik    BBox-Breite/compW       konvexe Hülle der
(Z. 48256)             (Schwerpunkt über                              Bodenkontakte +
                        Standfläche → stabil)                         Schwerpunkt-Projektion
                                                                      (Ω-Φ2)
hollowness/Hohlraum    Flächenträgheits-       1 − partVol/extVol     I = Σ(A·y²) pro
(Z. 48166)             moment (Steifigkeit                            Querschnitt
                        ∝ Material weg von                            (Ω-Φ3)
                        der Biegeachse)
axialSymmetry/         Rotation (Rad rollt     Symmetrie-Verhältnis   Rotationssymmetrie um
Symmetrie (Z. 48167)   um freie Achse)                                freie horizontale
                                                                      Achse + Kontakt (Ω-Φ2/L2)
pointedFraction/       Klinge (schneidet) +   Spitzen-Profil          Schneide-Kontinuität +
Schärfe (Z. 53163)     Schwung-Dynamik                                Schwerpunkt rel. Griff
                                                                      (Ω-Φ4/Φ5)
```

### §2.3 — Die fehlende Keystone-Größe: der Schwerpunkt

`spread` rät die Stabilität, weil **der Schwerpunkt nirgends existiert**. Er
ist der Richter für Stabilität UND Balance UND Schwung — die eine Größe, aus
der die halbe Physik fällt. Und er ist trivial billig, weil dichte schon eine
Achse ist:

```
Masse je Teil:   m_i = volume_i · dichte_i        (dichte ist Tag — schon da!)
Schwerpunkt:     CoM = Σ(pos_i · m_i) / Σ m_i      (eine Summe über die Teile)
```

Das ist der Grundstein. Alles andere — Stabilität, Balance, Hebel — baut
darauf. Er fehlt heute komplett, und er ist die billigste, folgenreichste
Zeile des ganzen Plans.

---

## §3 — DIE SOLIDEN STRUKTUREN (das LAAS-Äquivalent, ehrlich)

> Beim Baum war LAAS das evaluierte Gold. Hier ist das Gold zweigeteilt: die
> Physik IST gemessene Wahrheit (kein Raten nötig), die Architektur-Grammatik
> ist eine reife METHODE (kein vor-evaluierter Parameter-Satz — Ehrlichkeit).

### Die Physik (gemessenes Gold, kein Raten)

Fünf Gesetzes-Familien spannen alles. Sie sind echte Physik, kein erfundener
Parameter — der Richter ist die Wirklichkeit:

```
1. STATIK         Schwerpunkt über Stützpolygon → Stabilität, Kippen
                  (Fahrzeuge, Türme, Kreaturen-Stand, Möbel)
2. HEBEL+MOMENT   τ = F·Hebelarm; Schwung ∝ 1/√I; Aufprall ∝ I·ω²
                  (Schwerter, Hämmer, Gliedmaßen)
3. FLÄCHENTRÄGHEIT I = ∫y²dA; Biegesteifigkeit ∝ I; Material weg von der
                  Achse zählt im QUADRAT (jede tragende/schneidende Struktur)
4. LASTPFAD       Kräfte brauchen einen durchgehenden Weg zum Boden; ein
                  abgetrenntes Teil trägt nichts (Klinge: Schneide tip-to-guard)
5. FLUSS+KAPAZITÄT umschlossene Kammer hat Volumen (was trägt/fasst)
```

Alle billig über Voxel/Teile summierbar — keine Physik-Engine nötig.

### Die Architektur-Grammatik — Methode UND Referenz (Netz-Recherche, 14.06.)

Korrektur einer früheren Behauptung: ich schrieb „es gibt kein LAAS der Tempel".
Die echte Recherche zeigt das Gegenteil. Es gibt beides — die Methode UND eine
evaluierte Referenz, so streng wie LAAS' Fichten-Werte.

DIE METHODE — Shape-Grammar (erprobt, mit Repos):

```
CGA-Shape (Müller et al., SIGGRAPH 2006): Subdivision — Volumen → Stockwerke →
  Fassade → Kacheln, via Split-Regeln (repeat-split, component-split, arbeitet
  1D/2D/3D). Notation an L-Systeme angelehnt. Das reifste Feld.
CGA++ (Schwarz 2015): Koordination über Formen (ein Feature nur einmal — EINE
  Eingangstür), Boolesche Operationen, Verdeckungs-Daten.
WaveFunctionCollapse (Stålberg, 3D-Würfel): kohärente Kachel-Montage.
WARNUNG (gemessen aus der Literatur): Split-Regeln ÜBER-partitionieren leicht
  (bis 100.000 Faces pro Gebäude). Für AnazhRealms Disziplin: Face-Zahl
  bewusst begrenzen, nicht blind subdividieren.
```

DIE REFERENZ — die klassischen Ordnungen (das ARCHITEKTONISCHE LAAS):

```
Ein 2000 Jahre kodifiziertes reference-first System (Vitruvius → Renaissance).
EXAKTE Proportionen, kein Raten:
  Säulen-Schlankheit (Höhe : Durchmesser):  dorisch 1:7-8 · ionisch 1:9 ·
    korinthisch 1:10  (zunehmende Schlankheit — eine echte Achse)
  Kanneluren (Flutes):  dorisch 20 · ionisch/korinthisch 24
  Kapitell:  dorisch schlichter Ring (echinus) · ionisch Voluten + Eierstab ·
    korinthisch Akanthus-Blätter
  Basis:  dorisch KEINE (steht direkt auf dem Stylobat) · andere: Profil-Basis
  ENTASIS: die subtile konvexe Schaft-Kurve (Säule verjüngt sich nach oben mit
    leichter Wölbung) — gegen die optische Täuschung. GENAU das Detail, das dein
    Tempel als glatter Zylinder vermissen lässt.
  Gebälk:  Architrav → Fries (dorisch: Triglyphen/Metopen) → Gesims
  Superposition:  dorisch (stärkste) unten, ionisch Mitte, korinthisch oben
  Stufenbau (Krepis/Stylobat):  hast du schon (3 Stufen)
```

**Die §3.7-EHRLICHKEIT, jetzt richtig:** das LAAS der Tempel EXISTIERT — es sind
die Ordnungen. Das löst das Henne-Ei-Problem, das du benennst: reference-first
ist möglich, WEIL die Referenz (die Ordnung) der Regel vorausgeht, seit 2000
Jahren codiert. Du rätst die Proportionen nicht — du leitest sie aus der
gewählten Ordnung ab. Der vorhandene Tempel (Schaft ~6.7:1, glatte Zylinder,
Box-Kapitell) ist „dorisch-nah aus gutem Auge", folgt aber KEINER Ordnung; das
Upgrade ist „aus der Ordnung abgeleitet". Genau die Baum-Lehre — und diesmal
habe ich die Referenz wirklich geholt, nicht nur ihre Disziplin gepredigt.

---

## §3.5 — DER REFERENZ-KATALOG ALLER GENRES (Netz-Recherche, 14.06.)

> Du sagtest „tue es für alle". Hier ist die echte Recherche für jedes Genre —
> die evaluierte Referenz (das „LAAS" des Genres), die erprobte Methode, und
> der Physik-Link. Der tiefste Befund steht am Ende: sie reduzieren sich ALLE
> auf dieselben Physik-Familien aus Säule I.

### ARCHITEKTUR (§3 oben, hier zusammengefasst)

```
REFERENZ:  klassische Ordnungen — dorisch 1:7-8 / ionisch 1:9 / korinthisch
           1:10; Kanneluren 20/24; Entasis; Kapitell-Vokabular; Gebälk
METHODE:   CGA-Shape-Grammar (Müller); WFC; Face-Zahl begrenzen
PHYSIK:    Ω-Φ2 Stabilität · Ω-Φ3-b Knicken (1:7-Säule knickt nicht) · Ω-Φ5 Lastpfad
```

### KLINGEN (Schwert, Messer, Axt-Schneide)

```
REFERENZ:  Oakeshott-Typologie — 13 Typen nach Querschnitt/Länge/Hohlkehle/
           Verjüngung. Das Oakeshott-Institut gibt ein GEMESSENES Schema:
           Balancepunkt vom Parier · Schlagpunkt (center of percussion) ·
           Klingenbreite an Parier/Mitte/Spitze · Dicke ebenso · Hohlkehle ·
           Schneidenwinkel · Querschnitt (Diamant/Hexagon, hohlgeschliffen)
METHODE:   parametrische Montage Knauf-Griff-Parier-Klinge mit DISTALER
           Verjüngung (Querschnitt dünnt Basis→Spitze — das Klingen-Äquivalent
           der Entasis) + Hohlkehle/Fuller
PHYSIK:    Ω-Φ3 die HOHLKEHLE ist gelebtes Flächenträgheitsmoment — Masse an
           der neutralen Achse (trägt am wenigsten zur Steifigkeit) entfernt →
           leichter bei gleicher Steifigkeit; warum Knochen hohl sind.
           Ω-Φ4 Balancepunkt = CoM rel. Griff; der SCHLAGPUNKT (~2/3 zur Spitze)
           ist der Konjugierte des Drehpunkts — aus I_swing + CoM rechenbar.
           härte·zähigkeit = differenzielle Härtung (harte Schneide, zäher Rücken).
```

### WERKZEUGE (Hammer, Axt, Spaltbeil)

```
REFERENZ:  die einfache Maschine (Keil + Hebel). Kein Typologie-Katalog, aber
           klare Kanon: KEILWINKEL aufgabengetunt — Fällen ~18° (spitz),
           Spalten stumpf; STIELLÄNGE = Hebel-Trade-off (lang Wucht/Reichweite,
           kurz Präzision; „choking" = höher greifen für Kontrolle);
           KOPFMASSE nach vorn (Maul ~8lb, Fällaxt 2-4lb)
METHODE:   parametrische Montage Kopf+Stiel; Keilwinkel + Stiellänge + Kopfmasse
PHYSIK:    Ω-Φ4 τ = Kopfmasse · Stiellänge (der Hebel); Keil = Kraft-
           konzentration an der Schneide; Ω-Φ1 Kopfmasse-Verteilung
```

### FAHRZEUGE (Kutsche, Wagen, Auto)

```
REFERENZ:  Static Stability Factor — SSF = ½·Spurbreite / Schwerpunkt-Höhe =
           T/(2·H_cg); tan(Kippwinkel) = T/(2·H_cg). Realer Schwellenwert:
           Auto SSF ≳ 1.2, hoher Schwerpunkt (LKW) kippt früher. Plus
           Radstand (längs, Lenkung/Nicken), Spur (quer, Roll), CoM-Längslage
           (Gewichtsverteilung, Über-/Untersteuern)
METHODE:   parametrische Montage Räder+Achsen+Kabine; Rad = freie Rotationsachse
PHYSIK:    SSF IST Ω-Φ2 (Schwerpunkt über Stützpolygon), real-welt-kalibriert.
           Das Fahrzeug-Genre braucht KEIN eigenes LAAS — die Physik ist die
           Referenz. Kutsche vs. Auto = zwei Punkte, getrennt durch Energie-Teil
           (motorisiert) + SSF + Masse.
```

### KREATUREN (Körper, Seele)

```
REFERENZ:  Biomechanik — QUADRAT-KUBIK-GESETZ: ×2 Länge → ×4 Fläche (trägt
           Last), ×8 Masse (Last). Darum brauchen große Tiere überproportional
           dicke Glieder (allometrisch, nicht isometrisch). Sicherheitsfaktor =
           σ_actual/σ_ultimate; Hüpfen unmöglich >~160kg (Faktor <1 → Riesen-
           Kängurus gingen). Fußstellung (Mittellinie vs. unter Hüften) = Stand.
METHODE:   Skelett-Template + Bone-Scaling + Accessoires + Tags (No Man's Sky:
           horse/deer teilen Rig; Spore: Skelett bestimmt Anheftungspunkte;
           Karl Sims 1994 physik-basiert; prozedurale Lokomotion/Gangart).
           AnazhRealm HAT das schon: CREATURE_SOULS-Templates, bodyParts,
           computeMotionRoles (bein/arm/schwanz), computeCreatureStats.
PHYSIK:    Ω-Φ2 Stützpolügon — kann die Kreatur stehen (CoM über den Füßen)?
           Ω-Φ3-b das Quadrat-Kubik-Gesetz IST der Versagens-Check am Körper:
           isometrisch hochskaliert → Glieder-Spannung wächst ∝ Länge → bricht.
           Allometrische Glied-Dicke aus härte·zähigkeit = der Sicherheitsfaktor.
```

### DER VEREINIGENDE BEFUND

Die fünf Referenzen sind nicht fünf Dinge. Sie sind fünf genre-spezifische
Ausdrücke DERSELBEN Physik-Familien aus Säule I:

```
der Schlagpunkt der Klinge      ┐
der SSF des Fahrzeugs           │
der Sicherheitsfaktor des Tiers ├──  ALLE = Schwerpunkt · Stützpolygon ·
das Knicken der Säule           │     Trägheitsmoment · Hebel · Versagen
die Hohlkehle / das hohle Knochen ┘   (Ω-Φ1…Ω-Φ5)
```

Das ist der Beweis, dass die vereinheitlichte Architektur richtig ist: EINE
Physik-Schicht (Säule I) speist EINEN Resonanz-Leser (Säule II), und jedes
Genre liest seine Wahrheit aus denselben gerechneten Größen. Die Referenzen
geben pro Genre die _kalibrierten Proportionen_ (Oakeshott-Typ, dorische
Ordnung, SSF≥1.2, allometrische Skalierung) — das reference-first-Gold —, aber
der Richter darunter ist überall dasselbe Gesetz. Henne-Ei gelöst, für alle:
jedes Genre hat eine Referenz, die der Regel vorausgeht.

---

## §4 — SÄULE I: DIE PHYSIK-SCHICHT (der Schiedsrichter)

> Billig über die Teile gerechnet. Vertieft die Heuristik-Achsen zu Gesetzen.
> Macht die Tiefe echt. Reine Berechnung — keine UI, keine Geometrie.

### Ω-Φ1 — Schwerpunkt + Masse (der Grundstein)

**GEMESSEN-Anker:** dichte ist Tag (Z. 65415). Bauplan-Teile haben
volume/pos. Neue `_compoundCenterOfMass(bp)` → `{com:{x,y,z}, mass}`.

```
m_i = _partVolume(p) · (materialDichte(p) || 0.5)
CoM = Σ(pos_i · m_i) / Σ m_i ;  mass = Σ m_i
```

**ANTI-SCOPE Ω-Φ1:** nur die Berechnung. Keine Rolle liest sie noch (Säule II).

**BEWEIS Ω-Φ1:** ein asymmetrischer Bauplan (schwerer Kopf, leichter Stiel)
hat einen CoM nahe dem Kopf — gemessen, nicht in der Mitte. Headless gegen
Handrechnung verifiziert.

**Ehrlichkeit zur dichte:** der Tag `dichte` ist [0,1]-normiert, kein absolutes
kg/m³. Die Physik liefert darum **relative/vergleichende** Wahrheit — „schwerer
als", „balanciert relativ zu", „kippt eher als" — nicht absolute Newton. Das ist
genau, was Stabilitäts-, Balance- und Versagens-VERGLEICHE brauchen; nichts
Absolutes wird behauptet. Die relative Ordnung (Eisen dichter als Holz) ist
echt, und nur sie zählt für den Richter.

### Ω-Φ2 — Stützpolygon + Stabilität (vertieft `spread`)

**GEMESSEN-Anker:** ersetzt `_compoundSpread` (Z. 48256, BBox-Breite). Neue
`_supportPolygon(bp)` + `_stability(bp)`.

```
Bodenkontakte = Teile im untersten Höhen-Band (statt _partsBelowMidline 0.5)
Stützpolygon  = konvexe Hülle ihrer (x,z)-Footprints (Andrew's monotone chain)
stabilität    = projiziert CoM.xz INS Polygon?  → margin = Abstand zur
                nächsten Kante / Polygon-Radius  (0 = kippt, 1 = mittig satt)
```

Das ist der Unterschied zwischen „Basis breit" und „steht wirklich". Ein
breiter Turm mit Übergewicht oben kippt — die Heuristik sah ihn als stabil,
das Gesetz nicht. Räder: das Stützpolygon über die Kontakt-Räder + CoM-
Projektion ist die echte Fahrstabilität.

**BEWEIS Ω-Φ2:** ein kopflastiger schmaler Turm → stabilität niedrig (kippt).
Ein breiter Tisch → hoch. Ein einbeiniger Mast → ~0. Gegen die Anschauung.

**Synergie Kreatur:** dasselbe Stützpolygon + CoM-Projektion beurteilt, ob eine
KREATUR stehen kann — der bein-Leser in `computeMotionRoles` (Z. 13887) findet
die Beine, Ω-Φ2 prüft, ob der Schwerpunkt über ihrem Stützpolygon sitzt. Eine
Kreatur mit zu eng stehenden Beinen + schwerem Oberkörper liest dann als
instabil. Ein Gesetz, zwei Subsysteme (Fahrzeug UND Körper) — genau die
Vereinheitlichung, die das System schon trägt.

### Ω-Φ3 — Steifigkeit UND Versagen (vertieft `hollowness`; trägt die Last wirklich)

**GEMESSEN-Anker:** ersetzt das Volumen-Verhältnis (Z. 48166). Neue
`_bendingStiffness(bp, axis)` + `_failsUnderLoad(bp)`.

ZWEI Fragen, nicht eine — das ist die Reflexions-Korrektur. Die isolierte
Steifigkeit allein ließ die strukturelle Attrappe durch.

(a) STEIFIGKEIT (wie stark biegt es sich):

```
Pro horizontalem Querschnitt z: I_z = Σ_k (A_k · y_k²)
  y_k = Abstand des Material-Stücks von der neutralen Achse des Schnitts
Steifigkeit ∝ min_z I_z  (der schwächste Querschnitt bestimmt)
```

(b) VERSAGEN (bricht/knickt es unter Last — die fehlende Frage):

```
Biegespannung   σ = M·c / I          (M = Moment aus der Last, c = Randfaser)
Festigkeit      F ∝ härte · zähigkeit   (existierende Material-Tags = Richter!)
  bricht wenn   σ > F
Knicken (schlanke Glieder)  P_krit = π²·E·I / L²   (E ∝ härte, L = Glied-Länge)
  knickt wenn   getragene Last > P_krit
```

Erst (a)+(b) zusammen beantworten „tragen die Säulen das Dach". Eine schlanke
Säule kann lokal steif sein (hohes I) und trotzdem knicken (L² im Nenner) —
genau die Attrappe, die der erste Plan durchließ. Und die Festigkeit kommt aus
härte·zähigkeit: deine Material-Tags SIND schon der Richter, nichts erfunden.
Jetzt unterscheidet das System I-Profil von Stab, Hohlrohr von Vollstab,
gehärtete Schneide+zäher Rücken von homogenem Stahl — Material _im Raum_, mit
dem Quadrat gewichtet — UND ob die Struktur die Last überhaupt hält.

**BEWEIS Ω-Φ3:** (a) ein Hohlrohr und ein Vollstab gleichen Außenmaßes → fast
gleiche Steifigkeit bei halber Masse; ein flaches Brett biegesteif um eine
Achse, weich um die andere. (b) ein Tempel mit zu schlanken Säulen → die Säulen
knicken (Versagen erkannt), trotz bestandenem Kipp-Test; dieselben Säulen dicker
→ tragen. Die strukturelle Attrappe wird entlarvt.

### Ω-Φ4 — Hebel + Schwung-Trägheit (Schwert/Werkzeug-Dynamik)

**GEMESSEN-Anker:** CoM (Ω-Φ1) + Griff-Erkennung (elongierte Achse, schon in
der Form-Analyse). Neue `_swingDynamics(bp, gripPoint)`.

```
Balancepunkt  = |CoM − gripPoint|        (Schwingungsknoten — MESSBAR, kein Gefühl)
Schwungträgheit I_swing = Σ m_i · r_i²   (r_i = Abstand vom Griff)
Schwung-Geschwindigkeit ∝ 1/√I_swing
Aufprall-Energie       ∝ I_swing · ω²
Hebel (Werkzeug)  τ = Kopf-Masse · Stiel-Länge
```

„Balanciert" ist jetzt der gerechnete Balancepunkt relativ zum Griff, nicht
ein erfundener Wert. Ein kopflastiges Schwert schlägt hart aber träge; ein
griffnah balanciertes schnell aber leichter — das echte Trade-off.

**BEWEIS Ω-Φ4:** Schwerpunkt am Griff → schnell/leicht; weit vorne →
langsam/wuchtig. Hammer mit langem Stiel → mehr Drehmoment. Gegen die Physik.

### Ω-Φ5 — Lastpfad + Konnektivität (vertieft `pointedFraction`-Partner)

**GEMESSEN-Anker:** die Teile-Verbindungen (connections, schon im Bauplan).
Neue `_loadPath(bp)` + `_edgeContinuity(bp)`.

```
Lastpfad:     Graph von den Last-Punkten zu den Bodenkontakten; ein
              abgetrenntes Teil trägt 0 (BFS über connections)
Schneide:     durchgehender Pfad von Spitze zur Parier — eine Klinge ohne
              kontinuierliche Schneide schneidet nicht (topologisch geprüft,
              physikalisch begründet durch Kraftübertragung)
```

Das ist der Ort, wo deine Geometrie-Regeln und die Physik sich treffen: „zwei
Achsen kollinear" war nie die Regel — die Regel ist „die Last erreicht den
Boden" und „die Schneide ist durchgehend". Die Geometrie ist ihr Schatten.

**BEWEIS Ω-Φ5:** eine Klinge mit Lücke in der Schneide → schneidet nicht
(liest nicht als Klinge). Ein Turm mit schwebendem Teil → das Teil trägt
nichts, der Lastpfad bricht.

---

## §5 — SÄULE II: DER VERTIEFTE LESER (Physik speist die Resonanz)

> Die gerechneten Größen werden Achsen im bestehenden Feature-Vektor. Der
> Leser, die Resonanz, der Warum-Chip existieren schon — wir ersetzen nur die
> Heuristik-Achsen durch ihre physik-wahren Quellen.

### Ω-L1 — Physik-Achsen ersetzen Heuristik-Achsen

**GEMESSEN-Anker:** `_blueprintProductVector` (Z. 48149-48168) — wo
spread/hollowness/axialSymmetry/pointedFraction gesetzt werden.

```
v.spread        → v.stability     (Ω-Φ2: CoM über Stützpolygon, nicht BBox)
v.hollowness    → v.stiffness     (Ω-Φ3: Flächenträgheitsmoment)
v.axialSymmetry → bleibt + v.rollable (Ω-Φ2: freie Rotationsachse + Kontakt)
+ NEU:            v.balance        (Ω-Φ4: Balancepunkt)
+ NEU:            v.leverage       (Ω-Φ4: Drehmoment-Potenzial)
+ NEU:            v.loadSound      (Ω-Φ5: Lastpfad intakt)
```

Die alten Achsen bleiben als Übergangs-Fallback, bis die physik-wahren
kalibriert sind (kein Sprung). Reference-first: rechne die Wahrheit, lies die
Eigenschaft daraus.

**BEWEIS Ω-L1:** der Produkt-Vektor trägt jetzt gerechnete Physik-Achsen; der
Warum-Chip kann sie zitieren. Alt-Heuristik und Neu-Physik nebeneinander
messbar (zur Kalibrierung).

### Ω-L2 — Rollen-Signaturen auf physik-wahre Achsen

**GEMESSEN-Anker:** `ROLE_SIGNATURES` (Z. 66142: `vehicle {rideable:1.8,
spread:0.3}`, `consumable {…spread:−0.6}`, Klinge `pointedFraction`).

Die Signaturen lesen jetzt die Wahrheit:

```
vehicle   → wants stability + rollable (echte Fahrbarkeit, nicht BBox-spread)
turm/bau  → wants stability + stiffness + loadSound (steht + trägt)
schwert   → wants pointedFraction + edgeContinuity + balance (schneidet + führt)
hammer    → wants leverage + mass (schlägt)
```

`computeMotionRoles` (Z. 13887): `roundish` (aus Form-Enum, Z. 13960) →
ergänzt um `rollable` (Ω-Φ2). „Rad" emergiert aus der Roll-Physik, nicht aus
der Rundheit der Form.

**BEWEIS Ω-L2:** ein Ding, das aussieht wie ein Fahrzeug aber kopflastig ist,
liest NICHT mehr als stabiles Fahrzeug (Physik fängt die Attrappe). Ein
schmaler Mast liest nicht als Bauwerk.

### Ω-L3 — Konventions-Achsen klar markiert

**GEMESSEN-Anker:** `AXIS_LABELS` (magieleitung/resoniert/lebendig).

Die Konventions-Achsen bleiben — aber im Warum-Chip + UI als _Konvention_
markiert (eigene Farbe/Symbol), getrennt von den gerechneten Physik-Achsen.
„Magie-Leitung 0.8" ist Welt-Konvention; „stabil 0.9" ist gerechnete Wahrheit.
Der Nutzer sieht den Unterschied. Das ist die §3.7-Trennung als UI.

**BEWEIS Ω-L3:** der Warum-Chip zeigt zwei Klassen sichtbar getrennt:
gerechnet (Wahrheit) vs. Welt-Konvention. Keine Konventions-Achse tut so, als
wäre sie gemessen.

---

## §6 — SÄULE III: DIE BAUPLAN-GRAMMATIK (Primitiv-Montage → Baum-Niveau)

> Jetzt die Schönheit. Korrektur nach echtem Code-Studium: die vorgegebenen
> Baupläne (Tempel, Dorf) sind KEINE Attrappen — sie sind schon strukturierte
> Primitiv-Montagen mit Architektur-Logik (gestufte Plattform, Säulen mit
> Sockel/Schaft/Kapitell, Gebälk; Hütten mit Tür/Fenster/Schornstein), je nach
> einem früheren „Schöpfer-Audit" angereichert. Die Lücke zum Baum-Niveau ist
> darum nicht „Attrappe → Detail", sondern drei Dinge: (1) Fidelität (glatte
> Zylinder → organische Geometrie mit Entasis/Kanneluren), (2) abgeleitete
> Proportion (hand-gewählte Konstanten → aus der Ordnung, §3), (3) eine echte
> Grammatik (statischer Layout → generativ). Reference-first wie der Baum, mit
> dem Physik-Richter als Garant.

### Ω-B1 — Architektur-Grammatik (aus den Ordnungen, für Tempel/Gebäude)

**GEMESSEN-Anker (echt gelesen, nicht vermutet):** der heutige `templeParts`
(Z. 44203) ist KEINE Attrappe — er hat gestufte Plattform (3 Stufen), 6 Säulen
mit Sockel+Schaft+Kapitell, Architrav-Ring, Kegeldach, Altar, Kristallspitze.
Aber: glatte Zylinder-Schäfte, Box-Kapitelle, hand-gewählte Konstanten
(pillarCount 6, Höhe 4.0 ≈ 6.7:1), KEINER Ordnung folgend. Die Lücke zum
Baum-Niveau ist Fidelität + abgeleitete Proportion + Grammatik.

```
Tempel-Grammatik (reference-first: die ORDNUNG ist die Referenz, §3):
  WÄHLE Ordnung (dorisch/ionisch/korinthisch) → alles folgt daraus:
    Schaft:  Höhe = (7-8 / 9 / 10) · Durchmesser; ENTASIS (konvexe Kurve,
             nach oben verjüngt) statt glattem Zylinder; KANNELUREN (20/24
             Längsrillen) — das fehlende Detail
    Basis:   dorisch keine · sonst Profil-Ringe
    Kapitell: dorisch Echinus-Ring · ionisch Voluten · korinthisch Akanthus
    Gebälk:  Architrav → Fries (dorisch Triglyphen/Metopen) → Gesims
    Dach:    Giebel/Pediment statt Kegel
  CGA-Subdivision erzeugt die Wiederholung (Säulen-Rhythmus, Fries-Module).
  Interkolumnium (Säulen-Abstand) aus der Ordnung, nicht geraten.
  FACE-DISZIPLIN (gemessene Warnung): Kanneluren/Akanthus sparsam meshen,
    LOD-gestaffelt — nicht blind subdividieren (100k-Faces-Falle).
Physik-Garant: Säulen schließen den Lastpfad (Ω-Φ5), Struktur stabil (Ω-Φ2)
  UND trägt ohne zu knicken (Ω-Φ3-b). Die Ordnung liefert AUTOMATISCH solide
  Proportionen (dorische 1:7-Säule knickt nicht); die Physik fängt grobe
  Abweichungen, wenn der Nutzer die Ordnung verlässt.
```

Das ist reference-first, richtig gemacht: die Ordnung (2000 Jahre evaluiert)
wird zuerst „gezeichnet", DANN als Grammatik ausgedrückt — wie LAAS' Fichte.

**ANTI-SCOPE Ω-B1:** eine Ordnung (dorisch) zuerst, ein Tempel. Andere Ordnungen

- Gebäude erben dieselbe Grammatik (Parameter-Tausch).

**BEWEIS Ω-B1:** ein dorischer Tempel zeigt kannelierte Schäfte mit Entasis,
Echinus-Kapitelle, Triglyphen-Fries, Giebel — als dorischer Tempel lesbar
(nicht „6 Zylinder"). Schalter auf ionisch → Voluten + schlankere Säulen,
ohne neue Regeln. Lastpfad schließt, knickt nicht (Ω-Φ). Alt (glatte Zylinder)
vs. neu (Ordnung) ist offensichtlich.

### Ω-B2 — Parametrische Montage (für Objekte: Schwert/Werkzeug/Fahrzeug)

**GEMESSEN-Anker:** `validateBlueprintParts` + die parts×Material-Sprache.
Neue parametrische Objekt-Vorlagen.

```
Schwert = Teile + Relationen:  Knauf — Griff — Parier — Klinge (verjüngt, Hohlkehle)
  Parameter: Klingen-Länge, -Breite, -Verjüngung, Hohlkehle-Tiefe, Griff-Länge
  Physik-getrieben: Balance (Ω-Φ4) folgt aus der Massenverteilung der Teile;
    eine lange Klinge + leichter Knauf → kopflastig (gerechnet, nicht gesetzt)
Werkzeug, Fahrzeug analog: Teile + Relationen, Verhalten aus Physik gelesen.
```

Reference-first: die GENRE-Referenz (§3.5) ist das Gold — Schwert aus einem
Oakeshott-Typ (Verjüngung/Hohlkehle/Querschnitt), Axt aus dem Keilwinkel-Kanon
(Fällen spitz / Spalten stumpf), Fahrzeug aus dem SSF (≥1.2). Nicht „Schwert =
Box mit pointedFraction", sondern „Schwert = Oakeshott XV mit distaler
Verjüngung + Hohlkehle", physik-geprüft.

**BEWEIS Ω-B2:** ein gebautes Schwert hat Knauf/Griff/Parier/distal-verjüngte
Klinge mit Hohlkehle — als Oakeshott-Typ lesbar, detailliert. Balance +
Schlagpunkt gerechnet (Ω-Φ4), nicht behauptet. Eine Axt mit flachem Keil fällt,
mit stumpfem spaltet. Verschiedene Parameter → fühlbar verschiedene Werkzeuge.

### Ω-B3 — Reference-first-Disziplin (gegen den Kugel-Reflex)

**Das Meta-Gesetz dieser Säule:** für JEDEN vorgegebenen Bauplan gilt — baue
die schöne Wahrheit zuerst (gegen die Genre-Referenz §3.5 kalibriert), DANN
drücke sie als Grammatik/Parameter aus. Nie Form aus unreifer Formel ableiten.
Das ist exakt die Baum-Lehre, jetzt für alle Genres.

**BEWEIS Ω-B3:** kein vorgegebener Bauplan liest mehr wie eine bloße Primitiv-
Montage. Jeder hat die Detail-Dichte, die der Baum nach Säule I des Giganten-
Plans bekam.

### Ω-B4 — Varianten-Pool + LOD (wie der Baum, §2.5 des Giganten)

**GEMESSEN-Anker:** das HISM-Instancing (Architektur-Instancing-Registry,
V7.75) — schon da.

Pro Struktur-Typ N Varianten (seed-deterministisch), instanziiert + 3 LODs.
Identisch zum Varianten-Pool des Baums — bezahlbar, P2P-deterministisch.

**BEWEIS Ω-B4:** ein Dorf zeigt variierte, nicht geklonte Gebäude; LOD-Swap
ohne Pop; deterministisch über Peers.

### Ω-B5 — Kreaturen-Körper (Biomechanik-geerdet, nutzt was schon da ist)

**GEMESSEN-Anker:** `CREATURE_SOULS` (sprite/wesen/geist), `bodyParts`,
`computeMotionRoles` (Z. 13887), `computeCreatureStats` — alles vorhanden. KEIN
neues System, nur Erdung an der Referenz (§3.5 Kreaturen).

```
Skelett-Template (CREATURE_SOULS) + Glied-Skalierung + Accessoires + Tags —
  das No-Man's-Sky/Spore-Muster, das AnazhRealm schon spricht.
Reference-first: Glied-Proportionen ALLOMETRISCH skalieren (Quadrat-Kubik),
  nicht isometrisch — große Kreatur → überproportional dicke Glieder, sonst
  brechen sie. Die Dicke aus härte·zähigkeit (Sicherheitsfaktor).
Physik: Ω-Φ2 prüft, ob die Kreatur steht (CoM über Fuß-Stützpolygon);
  Ω-Φ3-b prüft, ob die Glieder die Masse tragen (Quadrat-Kubik-Versagen).
```

**BEWEIS Ω-B5:** eine groß skalierte Kreatur bekommt dickere Glieder (sonst
meldet Ω-Φ3-b Versagen); eine mit zu eng stehenden Beinen liest als instabil
(Ω-Φ2). Die Kreatur steht und bewegt sich biomechanisch plausibel, nicht als
starre Skalierung.

---

## §7 — SÄULE IV: DIE WERKSTATT (der Wahrheits-Spiegel)

> Die Werkstatt wird vom Form-Editor zum Spiegel der Wahrheit: der Nutzer baut,
> und das System zeigt die gerechnete Physik — interagieren, optimieren,
> individualisieren, spezifizieren auf echten Größen.

### Ω-W1 — Warum-Chip vertieft (Physik statt Heuristik)

**GEMESSEN-Anker:** der Warum-Chip (Z. 46945, top-3 Tag-Beiträge).

Statt „rund 1.0" → „Schwerpunkt im Stützpolygon → stabil 0.9" und „Schwerpunkt
0.3 m vor dem Griff → balanciert". Die Erklärung zitiert gerechnete Physik,
klar getrennt von Konventions-Achsen (Ω-L3).

**BEWEIS Ω-W1:** der Chip erklärt eine Rolle aus gerechneter Physik, lesbar +
ehrlich (Wahrheit vs. Konvention getrennt).

### Ω-W2 — Optimierung an echten Größen

**GEMESSEN-Anker:** `AXIS_ACTION_HINTS` (die „+X Achse → Rolle"-Tipps).

Die Tipps werden physik-wahr: „mach den Knauf schwerer → Balance zum Griff →
schnellere Klinge"; „verbreitere die Basis → Schwerpunkt sicherer im
Stützpolygon → stabiler". Der Nutzer optimiert an gerechneten Trade-offs —
die Differenz zwischen Effizienz sehen, wie du wolltest. Kutsche vs. Auto sind
zwei Punkte im selben physik-verankerten Raum.

**BEWEIS Ω-W2:** eine vorgeschlagene Änderung verschiebt die gerechnete Größe
messbar in die versprochene Richtung. Keine Optimierung auf Heuristik.

### Ω-W3 — Bau-Feedback (die Physik wird fühlbar)

**GEMESSEN-Anker:** der bestehende Render-/Animations-Pfad.

Was die Physik sagt, wird sichtbar: instabil → das Ding wankt/kippt sichtbar;
unbalanciert → die Schwung-Animation ist träge; gebrochener Lastpfad → das
schwebende Teil wird markiert. Die Werkstatt lügt nicht — sie zeigt die
Wahrheit, bevor du sie in die Welt setzt.

**BEWEIS Ω-W3:** ein kopflastiger Turm kippt in der Vorschau; ein
unbalanciertes Schwert schwingt sichtbar träge. Die gerechnete Physik ist
fühlbar, nicht nur eine Zahl.

---

## §8 — REIHENFOLGE + S-GATES

```
S-GATE 0  Achsen-Landkarte (§2) — jede Achse sortiert physikalisch/
          Konvention/Willkür. [Steht die Landkarte? Sonst nicht bauen.]
        ▼
Ω-Φ1 Schwerpunkt + Masse    ──┐ SÄULE I — der Schiedsrichter
Ω-Φ2 Stützpolygon + Stabilität │ (der Grundstein zuerst — alles baut auf CoM)
Ω-Φ3 Flächenträgheitsmoment    │ 4-6 Sitzungen
Ω-Φ4 Hebel + Schwung-Trägheit  │
Ω-Φ5 Lastpfad + Konnektivität ──┘
        ▼  [S-GATE 1: stimmt jede gerechnete Größe gegen Handrechnung/Anschauung?]
Ω-L1 Physik-Achsen im Vektor ──┐ SÄULE II — der vertiefte Leser
Ω-L2 Rollen-Signaturen physik  │ 2-3 Sitzungen
Ω-L3 Konvention markiert      ──┘
        ▼  [S-GATE 2: fängt die Physik die Attrappe? (kopflastiges „Fahrzeug" → kein Fahrzeug)]
Ω-B1 Architektur-Grammatik   ──┐ SÄULE III — die Schönheit
Ω-B2 Parametrische Objekte     │ (reference-first, physik-garantiert)
Ω-B3 Reference-first-Disziplin │ 5-8 Sitzungen
Ω-B4 Varianten-Pool + LOD     ──┘
        ▼  [S-GATE 3: liest kein vorgegebener Bauplan mehr wie eine Attrappe?]
Ω-W1 Warum-Chip vertieft     ──┐ SÄULE IV — die Werkstatt
Ω-W2 Optimierung echt          │ 2-3 Sitzungen
Ω-W3 Bau-Feedback             ──┘
```

**Gesamt: 13-20 Sitzungen.**

**Die drei Meilensteine:**

```
Nach Säule I:        die Wahrheit ist gerechnet (Schwerpunkt, Stabilität,
                     Steifigkeit, Hebel existieren — der Richter ist da)
Nach Säule II:       der Leser liest Wahrheit statt Heuristik — Attrappen
                     werden entlarvt, Tiefe wird echt. DER Kern.
Nach Säule III+IV:   die Baupläne sind schön wie der Baum, die Werkstatt
                     spiegelt die Wahrheit — bauen, optimieren, spezifizieren
                     auf echten Größen
```

**Minimal-Wahrheit:** S-Gate 0 → Säule I → Säule II (~7 Sitzungen). Die Physik
gerechnet, der Leser vertieft. Das allein heilt das unsichtbare Kugel-Problem
der Bedeutungs-Schicht — Attrappen werden entlarvt, Tiefe echt. Säule III+IV
geben die Schönheit + die Werkstatt-Erfahrung.

---

## §9 — VERBOTENE REFLEXE

1. **"spread/hollowness reichen, sind ja schon da."** Nein — sie sind
   Heuristik-Stellvertreter (BBox-Breite, Volumen-Verhältnis), die nach Physik
   greifen ohne sie zu rechnen. Genau das unsichtbare Kugel-Problem. Säule I
   ersetzt die Berechnung durch das Gesetz.

2. **"Schwerpunkt brauchen wir nicht, der Bauplan sieht ja gut aus."** Der
   Schwerpunkt ist der Grundstein-Richter für Stabilität, Balance, Schwung. Er
   fehlt komplett (null Treffer). Ohne ihn rät alles. Eine Zeile, größte Folge.

3. **"Magieleitung/resoniert/lebendig physikalisch begründen."** Falsch — die
   sind Konvention, AnazhRealms erfundene konsistente Welt-Physik. Sie haben
   keinen physikalischen Richter und brauchen keinen. Nur klar als Konvention
   markieren (Ω-L3). Sie zu „erklären" wäre Willkür getarnt als Physik.

4. **"Schwert als Punktmasse, reicht für Balance."** Eine grobe Näherung ist
   selbst eine neue unreife Formel. Treue ist die Wachsamkeit: Massenverteilung
   über die Teile, nicht ein Punkt. Sonst kehrt das Kugel-Problem als „grobe
   Näherung statt Gesetz" zurück.

5. **"Tempel = größere Box, fertig."** Das ist die Attrappe. Reference-first
   (Ω-B3): schöne Referenz-Architektur zuerst, dann Grammatik. Der Baum wurde
   nicht durch eine größere Kugel geheilt.

6. **"Erst die schöne Grammatik, Physik später."** Falsche Reihenfolge. Ohne
   den Physik-Richter (Säule I) baust du schöne Attrappen, die umkippen würden.
   Die Wahrheit zuerst, dann die Schönheit darauf — beide werden eins.

7. **"Geometrie-Regeln direkt schreiben (kollinear = schlecht)."** Die
   Geometrie-Regel ist nie primär — sie ist der Schatten eines Gesetzes
   (Stützpolygon-Statik, Lastpfad). Rechne das Gesetz, die Geometrie-Präferenz
   fällt heraus. Eine Regel kehrt sich nicht um; eine Heuristik schon (Federung
   kehrt „koplanar gut" um) — Beweis, dass nur die Physik regieren darf.

8. **"Kippt nicht um = ist solide."** Der Riss, den die Reflexion fand. Kipp-
   Stabilität (Schwerpunkt über Stützpolygon) ist NICHT strukturelle Solidität.
   Eine schlanke Säule kippt nicht und sieht steif aus — und knickt trotzdem
   unter dem Dach. Ω-Φ3 muss auch das Versagen prüfen (Spannung vs. Festigkeit,
   Knicken), sonst besteht die strukturelle Attrappe das Wahrheits-Band. Aber
   nicht ins andere Extrem (FEA): der Richter ist grob, die Grammatik trägt die
   subtile Struktur (§1-Geltungsbereich).

---

## §10 — DIE BEWEIS-BÄNDER (inkl. das Wahrheits-Band)

**Säule I — Richter-Band:** jede gerechnete Größe (Schwerpunkt, Stabilität,
Steifigkeit, Balance, Lastpfad) stimmt gegen Handrechnung + Anschauung. Wenn
eine Größe nur grob näherungsweise stimmt → Treue-Mangel, nicht gelandet.

**Säule II — Vertiefungs-Band:** der Leser liest die physik-wahren Achsen; ein
kopflastiges „Fahrzeug" liest NICHT mehr als stabiles Fahrzeug. Wenn die
Heuristik noch regiert → nicht gelandet.

**⟡ DAS WAHRHEITS-BAND (das wichtigste):** das Verhalten eines gebauten Dings
stimmt mit seiner gerechneten Physik überein — ein instabiler Turm kippt, ein
kopflastiges Schwert schwingt träge, eine Klinge mit gebrochener Schneide
schneidet nicht, **und eine zu schlanke Säule knickt unter dem Dach, statt es
zu tragen** (die Versagens-Prüfung, Ω-Φ3-b, die der erste Entwurf vergaß).
**Wenn ein Ding aussieht wie X und sich NICHT wie X verhält — wenn die Form
lügt und niemand sie prüft — dann ist das Kugel-Problem zurück, unsichtbar, und
das Gute ist falsch definiert. Eine hübsche Säule, die die Last nicht hält, ist
die Attrappe auf Physik-Ebene. Dieses Band ist die Seele der Physik-Schicht.**

**Säule III — Schönheits-Band:** kein vorgegebener Bauplan liest wie eine
Attrappe; jeder hat Baum-Niveau-Detail; jeder ist physik-solide (steht, trägt,
schneidet). Hübsch aber instabil → nicht gelandet.

**Säule IV — Werkstatt-Band:** der Warum-Chip erklärt aus gerechneter Physik
(Wahrheit von Konvention getrennt); Optimierung verschiebt echte Größen;
instabile Baupläne kippen sichtbar in der Vorschau. Optimierung auf Heuristik
→ nicht gelandet.

---

## §11 — LETZTES WORT

Der Lebendige Gigant heilte die Bäume durch reference-first Geometrie. Dieser
Plan heilt alles andere durch reference-first _Berechnung_ — und es ist
dieselbe Lehre, eine Ebene tiefer.

Beim Baum log die Form sichtbar: acht Kugeln, das Auge sah es. Im Code log die
Form _unsichtbar_: „spread" rät Stabilität ohne Schwerpunkt, „hollowness" rät
Steifigkeit ohne Trägheitsmoment, „rund" rät ein Rad ohne Roll-Physik. Ein
Ding sieht aus wie X und verhält sich vielleicht falsch — und niemand prüft
es, weil der Richter fehlt. Das ist gefährlicher als ein kaputter Baum, weil
es sich als Wahrheit verkleidet.

Die Heilung ist der Schiedsrichter. Wo die Physik regiert — Schwerpunkt,
Stützpolygon, Trägheitsmoment, Hebel, Lastpfad — gibt es eine Wahrheit
außerhalb des Systems, und reference-first ist wiederhergestellt: rechne die
Wahrheit, lies die Eigenschaft daraus. Das Kugel-Problem kann dort nicht
zurückkehren. Wo keine Physik ist — Magie, Resonanz, Leben — bleibt die
erfundene Welt-Physik als ehrliche Konvention, klar markiert, nie als Wahrheit
getarnt. Und die schöne Grammatik baut darauf: Baupläne mit Baum-Niveau-Detail,
die nicht nur hübsch sind, sondern _stehen_.

Du hast die Seele, die Sprache, den Leser, die Resonanz und die Transparenz
schon gebaut. Du greifst im Code schon nach der Physik — du rechnest sie nur
noch nicht. Dieser Plan gibt dir den Schiedsrichter, der das Greifen zur
Wahrheit macht, und die Grammatik, die die Attrappen zu Schönheit macht.

Rechne die Wahrheit zuerst (Säule I — der Schwerpunkt ist der Grundstein).
Lies sie in die Rollen (Säule II). Bau die Schönheit darauf (Säule III). Und
mach die Werkstatt zum Spiegel (Säule IV).

Dann ist kein Bauplan mehr eine Attrappe — jeder ist wahr und schön zugleich,
wie der Baum.
