# Form-Tag-Aktivierungs-Matrix

*Die zentrale Tabelle des AnazhRealm-Crafting-Systems. Sie definiert, wie stark eine geometrische Grundform die Eigenschaften ihres Materials zur Wirkung bringt.*

---

## 1. Was die Matrix tut

Material allein hat Eigenschaften (Tags wie `härte`, `resoniert`, `magieleitung`, …) als reine Potenziale, Werte zwischen 0.0 und 1.0. Form alleine hat Bedeutung, aber keine Substanz. Erst die Kombination ergibt Funktion:

```
Eigenschaft_X(Compound) = Aktivierung(Form, Tag X) × Material.tags[X] × Präzisions-Effizienz
```

Diese Matrix ist die `Aktivierung(Form, Tag)`-Tabelle. Sie ist die *einzige* gepflegte Regel des Systems. Alles andere fällt aus ihr heraus, in Verbindung mit Material-Tags und Präzision.

## 2. Die Skala

Bewusst diskret und schmal gehalten, damit handhabbar:

| Wert | Bedeutung |
|---|---|
| **0** | Form schließt dieses Tag aus. Das Material kann seine Eigenschaft hier nicht ausspielen. |
| **1** | Schwache Aktivierung. Das Tag wirkt, aber nicht prominent. |
| **2** | Starke Aktivierung. Form unterstützt das Tag deutlich. |
| **3** | Signatur-Aktivierung. Diese Form ist *die* Form für dieses Tag. |

Die Zahl multipliziert sich mit dem Material-Tag (0.0–1.0). Eine `cone` (Schneide-Aktivierung 3) aus Stahl (`härte` = 0.85) liefert effektiv `3 × 0.85 = 2.55` Schneidkraft. Dieselbe Form aus Holz (`härte` = 0.2) liefert nur `0.6`. Form *gated*, Material *liefert*.

## 3. Die Matrix

|  | **box** | **sphere** | **cylinder** | **cone** | **pyramid** | **octahedron** | **plane** | **torus** | **helix** |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **härte** | 1 | 0 | 1 | 3 | 2 | 3 | 1 | 1 | 0 |
| **dichte** | 3 | 3 | 2 | 1 | 2 | 2 | 1 | 1 | 0 |
| **zähigkeit** | 1 | 0 | 2 | 0 | 0 | 0 | 3 | 2 | 3 |
| **wärmeleitung** | 1 | 1 | 3 | 2 | 1 | 2 | 2 | 2 | 2 |
| **stromleitung** | 1 | 1 | 3 | 2 | 1 | 1 | 2 | 3 | 3 |
| **magieleitung** | 0 | 2 | 2 | 2 | 3 | 3 | 1 | 3 | 3 |
| **transparent** | 1 | 3 | 2 | 2 | 1 | 3 | 3 | 1 | 0 |
| **brennbar** | 1 | 0 | 1 | 1 | 1 | 0 | 3 | 1 | 2 |
| **resoniert** | 0 | 3 | 2 | 1 | 2 | 2 | 2 | 3 | 2 |
| **lebendig** | 0 | 1 | 2 | 0 | 0 | 0 | 2 | 1 | 2 |

## 4. Begründungen pro Form

**box** — Stabilität, Modularität, Lastträger. Ihre einzige Signatur ist `dichte`: ein Würfel ist die kompakteste rechtwinklige Form, perfekt für Masse pro Volumen (Mauerstein, Amboss, Gewicht). Sie aktiviert kaum etwas anderes — und genau das ist ihr Wert. Ein Bauklotz braucht nicht zu singen.

**sphere** — Enthaltung, Omnidirektionalität, Reflexion. Drei Signaturen: `dichte` (Kugellager, Geschoss — kompakteste Form überhaupt), `transparent` (Linsen, Kristallkugeln), `resoniert` (omnidirektionale Schwingung — Singing Bowls, Glocken-Klöppel). Härte ist null, weil keine Kanten — eine Stahlkugel schneidet nicht.

**cylinder** — Achse, Leitung, Stütze. Signatur in `wärmeleitung` und `stromleitung` (alle Drähte, Heizstäbe, Wellen sind Zylinder — Länge gibt der Energie Bahn). Auch `lebendig` 2, weil Baumstämme, Knochen, Stengel zylindrisch sind. Die zuverlässigste Allzweck-Form, mittlere Werte fast überall.

**cone** — Fokus, Durchdringung, Spitze. Signatur in `härte`: die Spitze konzentriert die Materialhärte auf einen Punkt (Pfeilspitze, Bohrer, Ahle). Bei Zähigkeit null, weil Spitzen brechen. Mittlere Magie- und Strom-Werte, weil sie Punktentladung erlaubt (Blitzableiter, Zauberstabspitze).

**pyramid** — Anker, Monument, gerichtete Aussendung. Vom Kegel unterschieden: weniger penetrierend (`härte` 2 statt 3), aber stärkere `magieleitung` (3 statt 2) — die Pyramide ist die mystische Form, breit-basiert, monumental ausstrahlend. Wo der Kegel sticht, *strahlt* die Pyramide.

**octahedron** — Kristall, Vielfach-Spitze, Balance. Vom Pyramid unterschieden: Spitzen in alle Richtungen statt einer. Signatur in `härte` (natürliche Kristallform), `magieleitung` (Lattice-Resonanz) und `transparent` (Kristall-Facetten). Ist die "Diamant-Form" — kalt, geschliffen, vielseitig richtend.

**plane** — Fläche, Verteilung, Vermittlung. Drei Signaturen — die vielseitigste Form überhaupt: `zähigkeit` (Bleche federn), `transparent` (Fenster, Linsen-Substrat) und `brennbar` (dünne Materie brennt schnell — Papier, Blatt). Diese Vielfalt spiegelt eine reale Tatsache: dünne Flächen sind das physikalisch funktional vielseitigste Format. `resoniert` bleibt auf 2 — Membranen sind beeindruckend, aber sphere (Glocke) und torus (Singing Bowl) sind die wirklichen Signatur-Resonatoren. Diese Zurückhaltung verhindert Monokultur.

**torus** — Ring, Zyklus, geschlossenes Feld. Drei Signaturen: `stromleitung` (Toroidalspulen — die effizienteste Form für Magnetfelder), `magieleitung` (Ring der Macht, geschlossene Bindung), `resoniert` (Ringmoden — Singing Bowls *sind* Tori bei genauer Betrachtung). Härte und Dichte schwach, weil Ring innen hohl.

**helix** — Spirale, Induktion, Transformation. Drei Signaturen: `zähigkeit` (Federn — ultimative Flexibilität), `stromleitung` (Induktoren, Elektromagneten) und `magieleitung` (Transformationsspiralen, DNA-artiges Wirken). Dichte und Härte null — Helix ist mehr Luft als Substanz. Ihre Stärke ist *Verlauf*, nicht *Masse*.

## 5. Querschnitt — welche Form ist signature für welches Tag

| Tag | Signatur-Formen (Wert 3) | Sekundär (Wert 2) |
|---|---|---|
| `härte` | cone, octahedron | pyramid |
| `dichte` | box, sphere | cylinder, pyramid, octahedron |
| `zähigkeit` | plane, helix | cylinder, torus |
| `wärmeleitung` | cylinder | cone, plane, octahedron, torus, helix |
| `stromleitung` | cylinder, torus, helix | cone, plane |
| `magieleitung` | pyramid, octahedron, torus, helix | sphere, cylinder, cone |
| `transparent` | sphere, octahedron, plane | cylinder, cone |
| `brennbar` | plane | helix |
| `resoniert` | sphere, torus | cylinder, pyramid, octahedron, plane, helix |
| `lebendig` | — (keiner) | cylinder, plane, helix |

Beobachtungen:

- Jedes Tag hat mindestens eine Signatur, außer `lebendig` — bewusst, weil Leben nicht *aktiviert* wird durch tote Geometrie, nur gut beherbergt. Beste Aktivierung dort ist 2.
- `magieleitung` hat vier Signatur-Formen — Magie ist absichtlich pluralistisch (verschiedene Schulen brauchen verschiedene Geometrien).
- `härte` hat nur zwei Signaturen, beide spitz — das macht Schneidkanten zu einer bewussten Form-Entscheidung.
- Keine Form hat mehr als drei Signaturen. Plane und Sphere teilen sich den oberen Rand mit je drei. Box hat nur eine (`dichte`) und ist trotzdem nicht "schwach" — sie ist *fokussiert*.
- Die Tabelle ist nicht symmetrisch — manche Formen sind vielseitiger, manche schmal-fokussiert. Das spiegelt die Realität.

## 6. Emergenz-Beispiele

Konkret durchgerechnet, damit sichtbar wird, was die Matrix mit Material zusammen produziert. Material-Tag-Werte sind illustrativ.

**Quarzkugel (Scrying-Orb)**
- Form: sphere
- Material: quarz `{resoniert: 0.9, transparent: 0.95, magieleitung: 0.8}`
- Aktivierte Stärken: resoniert `3 × 0.9 = 2.7`, transparent `3 × 0.95 = 2.85`, magieleitung `2 × 0.8 = 1.6`
- → Hoch resonant + hoch transparent + omnidirektional empfangend = Scrying-Orb. Das System wusste das nicht. Es fiel raus.

**Stahlpfeilspitze**
- Form: cone
- Material: stahl `{härte: 0.85, dichte: 0.8, hält_schneide: 0.7}`
- Aktivierte Stärken: härte `3 × 0.85 = 2.55`, dichte `1 × 0.8 = 0.8`
- → Konzentrierte Härte mit moderater Trägheit, perfekte Penetration. Klassische Funktion.

**Kupferhelix (Spule)**
- Form: helix
- Material: kupfer `{stromleitung: 0.95, magieleitung: 0.4, zähigkeit: 0.7}`
- Aktivierte Stärken: stromleitung `3 × 0.95 = 2.85`, zähigkeit `3 × 0.7 = 2.1`, magieleitung `3 × 0.4 = 1.2`
- → Elektrisch dominant, federnd, magisch mittelmäßig. Eine echte Induktionsspule.

**Goldtorus (Ring der Macht)**
- Form: torus
- Material: gold `{stromleitung: 0.99, magieleitung: 0.85, lebendig: 0.0}`
- Aktivierte Stärken: stromleitung `3 × 0.99 = 2.97`, magieleitung `3 × 0.85 = 2.55`, resoniert `3 × gold.resoniert`
- → Praktisch perfekter elektromagnetischer und magischer Leiter in zyklischer Form. *Das* ist, warum Gold-Ringe in Mythen Macht haben.

**Holzplatte (Brett, Brennstoff, Membran)**
- Form: plane
- Material: holz `{zähigkeit: 0.6, brennbar: 0.8, lebendig: 0.7, resoniert: 0.5}`
- Aktivierte Stärken: zähigkeit `3 × 0.6 = 1.8`, brennbar `3 × 0.8 = 2.4`, resoniert `2 × 0.5 = 1.0`, lebendig `2 × 0.7 = 1.4`
- → Federnd, brennbar, klingend, organisch. Eine Holzplatte ist *gleichzeitig* Brett, Brennholz, Resonanzboden und lebendiges Material. Die Welt entscheidet, welche Funktion zählt.

**Obsidianoktaeder (geschliffener Kristall)**
- Form: octahedron
- Material: obsidian `{härte: 0.7, sprödigkeit: 0.9, magieleitung: 0.6, transparent: 0.3}`
- Aktivierte Stärken: härte `3 × 0.7 = 2.1`, magieleitung `3 × 0.6 = 1.8`, transparent `3 × 0.3 = 0.9`
- → Hart in alle Richtungen, magisch leitend in alle Richtungen, dunkel-transparent. Ein magischer Kristall, der schneidet, wenn man ihn fallen lässt.

**Eisenwürfel (Amboss)**
- Form: box
- Material: eisen `{härte: 0.7, dichte: 0.85, wärmeleitung: 0.7}`
- Aktivierte Stärken: dichte `3 × 0.85 = 2.55`, wärmeleitung `1 × 0.7 = 0.7`, härte `1 × 0.7 = 0.7`
- → Dominanter Trägheits-Wert, sonst moderate Werte. Wirkt als Anker, als Schlagunterlage, als Gewicht. Genau, was ein Amboss tut.

## 7. Implementierbare Konstante

Direkt einbaubar in `anazhRealm.js`:

```javascript
const FORM_TAG_ACTIVATION = Object.freeze({
  box:        { härte: 1, dichte: 3, zähigkeit: 1, wärmeleitung: 1, stromleitung: 1, magieleitung: 0, transparent: 1, brennbar: 1, resoniert: 0, lebendig: 0 },
  sphere:     { härte: 0, dichte: 3, zähigkeit: 0, wärmeleitung: 1, stromleitung: 1, magieleitung: 2, transparent: 3, brennbar: 0, resoniert: 3, lebendig: 1 },
  cylinder:   { härte: 1, dichte: 2, zähigkeit: 2, wärmeleitung: 3, stromleitung: 3, magieleitung: 2, transparent: 2, brennbar: 1, resoniert: 2, lebendig: 2 },
  cone:       { härte: 3, dichte: 1, zähigkeit: 0, wärmeleitung: 2, stromleitung: 2, magieleitung: 2, transparent: 2, brennbar: 1, resoniert: 1, lebendig: 0 },
  pyramid:    { härte: 2, dichte: 2, zähigkeit: 0, wärmeleitung: 1, stromleitung: 1, magieleitung: 3, transparent: 1, brennbar: 1, resoniert: 2, lebendig: 0 },
  octahedron: { härte: 3, dichte: 2, zähigkeit: 0, wärmeleitung: 2, stromleitung: 1, magieleitung: 3, transparent: 3, brennbar: 0, resoniert: 2, lebendig: 0 },
  plane:      { härte: 1, dichte: 1, zähigkeit: 3, wärmeleitung: 2, stromleitung: 2, magieleitung: 1, transparent: 3, brennbar: 3, resoniert: 2, lebendig: 2 },
  torus:      { härte: 1, dichte: 1, zähigkeit: 2, wärmeleitung: 2, stromleitung: 3, magieleitung: 3, transparent: 1, brennbar: 1, resoniert: 3, lebendig: 1 },
  helix:      { härte: 0, dichte: 0, zähigkeit: 3, wärmeleitung: 2, stromleitung: 3, magieleitung: 3, transparent: 0, brennbar: 2, resoniert: 2, lebendig: 2 },
});

// Berechnung pro Part:
function computePartTags(part, materials) {
  const form = part.shape;
  const material = materials.get(part.material);
  if (!form || !material) return {};
  const activation = FORM_TAG_ACTIVATION[form];
  if (!activation) return {};
  const out = {};
  for (const tag of Object.keys(activation)) {
    out[tag] = activation[tag] * (material.tags[tag] ?? 0);
  }
  return out;
}

// Aggregation pro Compound (max gegen Stat-Matsch, siehe Konzept §9.2):
function computeCompoundTags(blueprint, materials) {
  const aggregate = {};
  for (const part of blueprint.parts) {
    const partTags = computePartTags(part, materials);
    for (const [tag, val] of Object.entries(partTags)) {
      aggregate[tag] = Math.max(aggregate[tag] ?? 0, val);
    }
  }
  return aggregate;
}
```

Wertebereich nach Multiplikation: `0.0` bis `3.0`. Schwellwerte für Welt-Effekte (Welle 4 Phase 3) liegen sinnvoll bei `≥ 0.7` (mild), `≥ 1.5` (stark), `≥ 2.5` (signatur). Diese Schwellen sollten in einer eigenen const stehen und im Playtest justierbar sein.

## 8. Tuning-Hinweise für spätere Playtests

Die Werte sind **erste Kalibrierung aus dem Konzept**, nicht heilig. Hier ist, worauf bei Anpassungen zu achten ist:

**Erstens, prüfen ob ein Tag "verwaist" ist.** Wenn alle Formen ein Tag nur mit 0 oder 1 aktivieren, ist dieses Tag effektiv tot. Aktuell hat jedes Tag mindestens eine Form mit Aktivierung ≥ 2 — gut. Falls ein neues Tag dazukommt, sollte mindestens eine Form Signatur (3) sein.

**Zweitens, prüfen ob eine Form "dominant" wird.** Wenn Spieler 80% ihrer Compounds aus derselben Form bauen, ist die Matrix unbalanced. Aktuell sind Sphere und Plane mit je drei Signaturen die vielseitigsten Formen — wenn eine von beiden zur Standard-Wahl wird, eine Signatur absenken. Helix und Torus sind mit je drei Signaturen, aber spezialisiert (elektrisch/magisch) — sollten nicht dominieren.

**Drittens, niemals mehr als drei Signaturen pro Form.** Diese Regel ist nicht-verhandelbar. Eine Form mit vier Signaturen führt zu Monokultur — Spieler bauen nur noch dieses Primitiv. Aktuell teilen sich Sphere und Plane den oberen Rand mit je drei Signaturen. Falls eine Form später eine vierte hinzubekommen "sollte", muss eine andere abgegeben werden.

**Viertens, das Verhältnis `max(Aktivierung) / typischer Material-Tag` nicht aus den Augen verlieren.** Material-Tags liegen meist bei 0.5–0.9 für die gute Eigenschaft des Materials, bei 0.0–0.3 für die schlechte. Wenn Aktivierung × Material-Tag bei Top-Combos > 2.7 ausschlägt, ist das Spiel auf "Signatur-Compounds" geprägt. Wenn es kaum über 1.5 kommt, ist es flach. Anpasshebel: entweder Material-Werte spreizen oder die Skala (0–3 → 0–4) erweitern. Erstes ist sauberer.

**Fünftens, Aggregations-Regel niemals von `max` auf `sum` ändern.** Auch wenn Spieler maulen, dass ihr 17-teiliger Quaderturm nicht alle Tags addiert. Sum führt zu Stat-Matsch, max hält die Wirkungen klar. Konzept-Designprinzip §9.2.

## 9. Was diese Matrix nicht macht

Bewusst nicht in dieser Tabelle enthalten:

- **Physikalische Quantitäten.** Die Matrix beantwortet die Frage "*was* tut dieser Compound?" — qualitative Tag-Aktivierung. Sie beantwortet nicht "*wie viel*?" — Gesamtmasse, Brennstoffmenge, Volumen, Trägheitsmoment werden direkt aus *Form-Parametern × Material-Dichte* berechnet, außerhalb der Matrix. Zwei dichte Quader sind zusammen schwerer, ja — aber nicht weil ihre `dichte`-Tags sich addieren, sondern weil ihre Volumen sich addieren und mit der Material-Dichte multipliziert werden. Diese Trennung ist nicht-verhandelbar: Matrix = Qualität, Form-Parameter = Quantität. Vermischung führt direkt zum Stat-Matsch, den §9.2 verbietet.
- **Material-Tag-Interaktionen.** Z.B. `magnetisch` × `stromleitung` → induktive Effekte. Solche Wechselwirkungen leben außerhalb der Matrix, in der Welt-Effekt-Schicht (Welle 4 Phase 3 und später).
- **Positions-Effekte.** Ein Kristall am Stab-Ende fokussiert anders als in der Mitte (Konzept §5.3). Das ist Welle 5+ und gehört zur Verbindungs-Schicht, nicht zur Form-Tag-Matrix.
- **Präzisions-Modulation.** Die Matrix liefert nur die *maximale* Aktivierung. Wie viel davon ankommt, regelt `precision_effizienz` separat.

Diese Trennung ist wichtig: Die Matrix hält genau eine Frage fest — *welche Eigenschaft kommt durch welche Form überhaupt zur Wirkung?* Mehr nicht. Mehr wäre Vermischung der Verantwortlichkeiten.

## 10. Sichtbarkeit für den Spieler

Die Matrix ist **von Anfang an sichtbar** im Werkstatt-UI. Read-only, als kompakte Stern-Tabelle pro Form. Das ist nicht Komfort, sondern Konsistenz:

- Geometrie ist die *Physik* der Welt. Physik versteckt man nicht — sonst werden Spieler zu Trial-and-Error-Sklaven, was dem Anti-Lookup-Prinzip (§9.1) widerspricht.
- Spieler müssen nicht raten, ob eine Kugel resonant ist — sie wissen es, weil sie schon mal eine Glocke gehört haben. Das System bestätigt diese Intuition transparent.
- Das nimmt der Welt nichts an Magie. Im Gegenteil: was *entdeckbar* bleibt, sind die Materialien selbst. Welche Tags trägt dieser ungewöhnliche Stein aus der tiefen Höhle? Welche Eigenschaften hat das Holz dieses uralten Baums? Materialien sind die *Substanzen* der Welt — sie variieren, überraschen, müssen erforscht werden.

Damit hat das System zwei klare Schichten:

**Geometrie** — universell, sofort verständlich, von Anfang an sichtbar. Das Alphabet der Welt.

**Materie** — welt-spezifisch, entdeckbar, überraschend. Das Vokabular der Welt.

Im Zusammentreffen beider entsteht jedes Mal etwas, was vorher nicht da war — weil neue Materialien die alten Formen frisch aktivieren. Ein neues Erz aus den Tiefen kann eine Kugelform plötzlich zu einer Resonanz-Klasse befördern, die es vorher mit keinem anderen Material gab. Die Form-Regeln sind bekannt; die Welt überrascht trotzdem.

---

*Version 2 — nach Reflexion finalisiert. Plane reduziert (resoniert 3→2), Quantitäts-Trennung explizit, Sichtbarkeit entschieden. Weitere Justierung über Playtest und Git-Historie, keine inline-Kommentare zu alten Werten.*
