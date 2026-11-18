# Lesen: das lebendige Feld (stamm/feld-leben.js ganz, docs/das-lebendige-feld.md ganz) — main 18058dba

Vorweg: feld-leben.js (3 139 Z.) ist zu etwa 60 % kein Feld. Z. 1–1 787 und 2 765–2 945 sind Sprung, Frustum, Chat-Dispatch,
Hilfe, DSL-Beschreibung, Nexus-Evolution, Metrologie-Zeilen, Werk-Ort am Ufer und Ergebnis-Satz. Das Feld liegt in
Z. 1 788–2 765 und in den Konstanten 2 967–3 139. Die Vision im Dokument (§1–§2) ist ein Feld aus Gefühl, Wertung und
DSL. Stoff- und Energiefluss, Nahrungsnetz und Population stehen dort nicht, auch nicht unter „Vektor vorwärts“ (§6–§7).
Die Ökologie wohnt in tetrapoda-core.js und stamm/kreatur-leben.js. Gelesen habe ich davon nur die Stellen, an die das Feld
anschließt (unten mit Zeile genannt).

## (1) WAS TRÄGT — Gesetze, die im Spiel konsumiert werden, mit Leser

| Gesetz / Funktion | Ort | Leser (gelesen) |
|---|---|---|
| `worldFieldAt(x,z)`: vier Simplex-Achsen lebendig/dichte/glut/magieleitung ∈ [0,1], λ 200/340/520/160 m, Domain-Warp ±40 m | feld-leben.js:1793–1843, FIELD_CHARACTER 2970–2981 | `auraAt` 1850. `_attachFieldAttribute` 2768 (Terrain-Shader, vec4 je Vertex). Geburt am Ort: Resonanz-Score Seelen-Tags × Feld, kreatur-leben.js:1963–1970 |
| `auraAt(x,z,t)`: lebendig = clamp(frozen + Overlay − Narbe), glut + Brand + Lava, emotion = global ⊕ Ortsabdruck | feld-leben.js:1849–1881 | 28 Aufrufe von auraAt/worldFieldAt in 14 Stamm-Dateien (Grep-Zählung). Der Doc nennt 17 Lese-Stellen (§4.1). Für die Ökologie zählt: `_kreaturNahrung` kreatur-leben.js:2101–2104 (Äsung = auraAt.lebendig) |
| `_depositLife`: 3×3-Kern, Mitte 0,25, Rand 0,1, geklemmt auf [kahl −1, max 0,7], Zerfall e^(−0,008·Δt) (HWZ ≈ 87 s) | feld-leben.js:2047–2083, LIFE_FIELD 3077–3091 | Schreiber: `_feldAktWirkt` 2316 (Akt „leben“). `_kreaturFrass` kreatur-leben.js:2191–2197 (negativ, Fraß des Bestands). `_tickCreatureLifeTrickle` 2444 (0,05 alle 3 s, nur tendsLife). Laut Doc §4.2 auch Geburt/DSL, Tod und Spielertod |
| Feld-Akt-Lockstep (`_feldAkt`, `_feldAktWirkt`, `_feldHorizont`, `_feldFolgeSteht`) | feld-leben.js:2096–2335 | p2p (`_feldAktFremd` 2140), Stand (`_lebenImStand` 2173, `_lebenAusStand` 2212). Der Bestand reist je Tier als {id, soul, g, bs, alterS, x, z, v, name, gehege} (2185–2196) |
| Leben-Stufen (8 je Einheit) mit Wecker-Heap | feld-leben.js:2350–2438 | Nah-Streu: `_nahStreuNeuIn` 2381. Die gepflegte oder abgeäste Wiese ändert sich sichtbar |
| Tat-Gedächtnis `_tatSchreiben`/`_tatIndex`/`_narbeAt`: TAT_NARBE je Klasse (tiefe, stunden, naehr) | feld-leben.js:2626–2713, 3098–3107 | `auraAt` 1856 (Narbe senkt lebendig). Nährstoff `_naehrstoffAt` vegetation-wiese.js:2097. Heildauer `_tatDauer` vegetation-wiese.js:2215 (über `_wuchsAt`). Sukzession, Stumpf, Ernte (`_geerntetIn` 2696), Sperre des Wurfs (`_tatSperrt` 2710) |
| Welt-Uhr `_weltTag`/`_weltStunde` (PEGEL_TAG_S) | feld-leben.js:2604–2621 | Narbe, Lava, Nährstoff, Sukzession |
| Lava: Zustand als Funktion der Welt-Zeit, gelaende-core `lava` auf der Stoff-Zeile `stein` | feld-leben.js:2460–2488 | auraAt.glut 1865/1876 |
| Esse/Stahl: τ = ρ·c·(d/2)/α, `waermeGang`, `glutAus` ∝ T⁴ | feld-leben.js:2499–2584, ESSE 3120–3131 | `_leuchtQuellen`, Licht in der Hand |
| Emotion-Overlay `_depositEmotion` (HWZ ≈ 58 s, max 0,8) | feld-leben.js:2718–2763, 3133–3139 | auraAt.emotion zu Welt-Tint, Klang, Appraisal (Doc §4.1) |
| Wertung: `_observeFieldWohl` (EMA τ 120 s je 16-m-Zelle), `_playerSituationWohl` (0,6·lebendig + 0,4·HP − umstellt·`_spielerUmstellt`) | feld-leben.js:1890–1975 | Regel-Fitness, Spieler-Appraisal (Doc §4.3) |
| Die Ökologie am Feld (außerhalb gelesen): K = kopfJeHa × Σ_Zellen lebensraum(g,klasse) × ha × Nahrung(diet, Äsung, Beute). Verhulst-Bilanz, Holling-III-Riss, Fraß | tetrapoda-core.js:2172–2229, kreatur-leben.js:2114–2150 | Geburt und Tod je Region alle 10 s (taktS). Fraß schreibt zurück ins Feld. Die Schleife Feld → Äsung → K → n → Fraß → Feld ist geschlossen |

Die physikalisch verankerten Gesetze am Rand des Felds sind Wuchs = Feuchte × Licht × Monod(N) (vegetation-wiese.js:2078–2089),
Lava und Esse. Die Äsung der Tiere liest davon nichts (siehe 2).

## (2) WÜRFE UND TABELLEN

| Wurf / Tabelle / Stellwert | Ort | Wirkung |
|---|---|---|
| **Äsung = Rauschen.** `_kreaturNahrung` = auraAt.lebendig, das frozen Simplex-Rauschen (λ 200 m, „Erst-Wurf aus genese-plan §Γ3“, 2971) plus Overlay. Die Funktion liest weder `_wuchsAt` (Feuchte × Licht × Nährstoff) noch Biomasse. Wasser, Licht, Temperatur und Boden-Nährstoff fehlen in K | kreatur-leben.js:2101–2104, feld-leben.js:1828 | K und damit die Zahl der Tiere je Region folgen einem Rauschmuster ohne Physik. Ein trockener Hang und eine nasse Aue mit gleichem Rauschwert ernähren gleich viele Hirsche. Das Wuchs-Gesetz bestimmt nur, wie schnell eine Narbe heilt (Kommentar vegetation-wiese.js:2074–2075 bestätigt, dass vorher auch die Heilung am Rauschen hing) |
| Die vier Feld-Achsen sind dimensionslose Rauschwerte. dichte, glut und magieleitung bleiben frozen; glut heben nur Brand und Lava | feld-leben.js:1793–1843 | Resonanz-Score der Geburt (kreatur-leben.js:1966–1970) und Spawn-Affinität der Baupläne. Ort ↔ Seele gehen über Tag-Tabelle × Rauschen, nicht über Klima |
| **Gattungs-Tabelle** LEBENSRAUM_GESETZ.gattung: genau 4 Gattungen (deer/fox/wolf/bear) × 5 Bodenklassen, Eignung 0/0,5/1 von Hand, `haeufigkeit` 1/0,4/0,35/0,25 von Hand | tetrapoda-core.js:2072–2084 | Bestimmt, wer wo geboren wird (`lebensraumWahl` 2157) und K. Eine Art ist eine Tabellenzeile. Neue Arten brauchen neue Zeilen. Die Häufigkeit ist gesetzt, nicht aus Masse oder Trophiestufe gefolgert |
| **kopfJeHa = 25**, für alle Gattungen gleich und massenunabhängig. Kommentar: von 8 auf 25 angehoben, damit die Karte 150 Tiere im 500-m-Ring sieht | tetrapoda-core.js:2189–2201 | Damuth (D ∝ M^−0,75) fehlt. Ein Bär (Hunderte kg) und ein Fuchs (wenige kg) teilen dieselbe Dichte je ha Eignung; nur `haeufigkeit` trennt sie |
| BESTAND_GESETZ: geburt 0,1, tod 0,2, fress 0,016, riss 0,6, rissHalb 0,1, beuteVoll 30 Köpfe — je Takt, ohne Masse oder Stoffwechsel | tetrapoda-core.js:2197–2208 | Raten unabhängig von Körpergröße (kein Kleiber M^0,75, keine Generationszeit ∝ M^0,25) |
| **Körpergröße ist ein Wurf.** Die Geburt ruft `_creatureBodySize("b"+key+"."+floor(rng·1e9))`, das sind Bänder aus VERHALTEN.groessen | kreatur-leben.js:1991–1994, koerper-leib.js:2545–2557 | `bs` geht kubisch in die Masse ein (`_bestandKg` = leibV × bs³ × ρ, kreatur-leben.js:2344–2346). Die Masse entscheidet über Beute/Jäger (`_bestandJagd` 2175) und Temperament (wild, 2351). Ein Wurf ohne Gesetz steuert also das Nahrungsnetz |
| Wurfgröße `herde.wurf[g]` [min,max], gleichverteilt gewürfelt | kreatur-leben.js:1987–1988 | Kopfzahl je Geburt aus Tabelle |
| LIFE_FIELD: decayPerSec 0,008, pulseCenter 0,25, max 0,7, trickle 0,05 — Stellwerte, kommentiert, ohne Anker in Biomasse oder Zeit | feld-leben.js:3077–3091 | Nachwuchs des Verbisses mit HWZ 87 s Spielzeit, unabhängig von Wuchs, Feuchte und Licht. Der Fraß senkt das Overlay, das Nachwachsen ist der Zerfall des Overlays, nicht `_wuchsAt` |
| TAT_NARBE tiefe/stunden/naehr je Tatklasse von Hand (Fällen 0,12/48 h/−0,3; Brand 0,3/72 h/+0,4 …) | feld-leben.js:3098–3107 | Narbentiefe und Nährstoff-Verschiebung. Die Dauer wird immerhin über `_wuchsAt` skaliert |
| `updateCreatureEmotions`: 10 % je Tier gewürfelt, Wetter → feste Achsen-Inkremente (+0,15/+0,18 …) | feld-leben.js:1744–1768 | Gefühl der Kreaturen aus Wetter-Tabelle |
| `proactiveSuggestions`: `Math.random()` (nicht deterministisch) | feld-leben.js:1741 | nur Chat |
| `generateEvolution`: Nexus komponiert zufällige DSL (Strom `_bauSame("nexus")`). Der Doc nennt das „Evolution“, es ist Programm-Mutation, keine Biologie | feld-leben.js:445–470 | Weltregeln, keine Arten |
| `_werkOrtSuchen` Startwinkel `wurf()` | feld-leben.js:2816 | nur Bau-Ort |

## (3) GRÖSSEN — Zahl mit Einheit (lesbar für ein Erbe-/Evolutions-Gesetz) und was fehlt

Liegen vor:
- **Masse** kg je Tier: `_bestandKg` = Volumen der Gattungsgestalt bei Größe 1 (m³) × bs³ × ρ (kreatur-leben.js:2344–2346). Hüfthöhe `beinL` m (`_gattungLeib` 2355–2358).
- **Temperatur** °C an Höhe y: `_temperaturAt(y, traegTage)` über gelaende-core `temperaturAus` mit Saison, Tageszeit und Wetter (bild-himmel.js:2874). Gelesen von Lava (feld-leben.js:2484) und Esse (2509). Die Ökologie liest sie nicht.
- **Feuchte des Bodens** ∈ [0,1] aus der Hydrosphäre: `_feuchteAt` (gelaende-boden.js:1538). Einheitenlos, aber physikalisch hergeleitet.
- **Licht am Boden** unter den Kronen ∈ [0,1]: `_bodenLichtFeld` (vegetation-wiese.js:43).
- **Nährstoff** relativ (1 = eigener Grund, max 1,6): `_naehrstoffAt` (vegetation-wiese.js:2097). **Wuchs** ∈ [0,1] = Feuchte × Monod(N) × Licht × Krautdecke (2078).
- **Zeit**: Welt-Stunde h (feld-leben.js:2619), taktS 10 s, Zerfallsraten 1/s, Halbwertszeiten.
- **Fläche** ha je Rasterzelle (`feld.ha`, rasterM 50 m, revierM 113 m; tetrapoda-core.js:2198–2200). Dichte als Köpfe/ha (kopfJeHa).
- **Ernährung** diet ∈ [0,1] je Gattung (GATTUNGEN, `_bestandDiet` kreatur-leben.js:2152). Magen kg, Äsung kg/s (`aesung` tetrapoda-core.js:2142).
- **Stoffwerte** ρ, c, T_schmelz, T_zünd (Stoff-Tafel, ESSE feld-leben.js:2511/2526). Wärmeübergang α W/(m²·K).
- **Bodenklasse** (fluss/hang/wald/waldrand/wiese) aus Flussabstand m, Hang tan, Bestandsdichte (tetrapoda-core.js:2087).

Fehlen:
- **Biomasse** oder Primärproduktion in kg/ha bzw. kg/(ha·Jahr). „lebendig“ ist ein Rauschwert ohne Einheit. Ein Stofffluss von Pflanze über Herbivor zu Prädator mit Energie-Einheit (J, kg C) existiert nicht. Die Trophieebenen hängen über die Kopfzahl (`beuteVoll` 30 Köpfe) aneinander, nicht über Masse oder Energie.
- **Stoffwechselrate** (W, Kleiber), Generationszeit, Lebensdauer als Massenfunktion. Das Alter `alterS` liegt je Tier vor (2185), sein Gesetz habe ich nicht gelesen.
- **Niederschlag** mm und Jahresmitteltemperatur als Feldgröße je Ort für die Ökologie. Das Ortsgesetz trägt `klimaHeute.sommer/winter` (feld-leben.js:1315–1316) nur für die Reise.
- **Genom, Elternschaft, Mutation, Selektion**: keine Spur im Feld. Jedes Tier im Bestand trägt `v` (Verband = id des ersten im Wurf, 1995), aber keine Eltern-Kennung, kein Erbgut und keine Art unterhalb der Gattung.
- **Pflanzen-Individuen im Feld**: das Feld kennt nur 16-m-Zellen und Narben. Pflanzenarten wählt die Vegetation über Tag-Affinität (nicht gelesen).

## (4) NAHT

**Die eine Stelle: `_kreaturBestand` in stamm/kreatur-leben.js:2114–2150, dort die Kapazitätszeile 2131–2142.**
Auf dem Weg von „Ort“ zu „wer lebt hier, wie viele, wie groß“ kommen hier zusammen: das Feld (über `_bestandFeld` und
`_kreaturNahrung` 2337 → 2101), die Arten (die Schleife `for g in n` über `L.gattung`), die Masse (`_bestandJagd` →
`_bestandKg`) und die Bilanz (Geburt/Tod).

Was dort heute steht:
- Die Arten sind die Schlüssel von `LEBENSRAUM_GESETZ.gattung`: 4 Zeilen von Hand (tetrapoda-core.js:2077).
- K[g] = Σ lebensraum(g, klasse) · ha · nahrung(diet[g], aesung, beute), dann × kopfJeHa 25 (2135, 2142). Eine Art bedeutet hier Eignungstabelle × Häufigkeitstabelle × Rauschen.
- Die Körpergröße kommt nicht vom Gesetz. Sie wird bei der Geburt gewürfelt (kreatur-leben.js:1993 → koerper-leib.js:2545). K weiß nichts von Masse, also kann aus K keine Größe und aus der Größe keine Dichte folgen.

Ein Art-/Genom-Gesetz müsste hier eintreten, und zwar als Funktion (Same, Ort-Klima, Nahrung) → Arten-Zeilen
{Masse, diet, Eignung je Klasse}. Daraus folgten K über Damuth (kopfJeHa(M) ∝ M^−0,75 statt 25 konstant) und `bs` des
Individuums als Abweichung um die Artmasse, statt des Wurfs in Bändern. Wer das konsumieren würde, alles gelesen:
- Geburt am Ort: `_pickFaunaSoulAtPlayer` → `LG.wahl` (kreatur-leben.js:1687–1692) und die Wurfschleife 1976–1998.
- Bilanz, Riss und Fraß: `_kreaturBestand`, `_bestandJagd`, `_kreaturFrass` (2114–2197). Der Fraß schreibt `_depositLife`, also das Feld (feld-leben.js:2047).
- Masse, Temperament, Beute: `_bestandKg`, `_bestandWild` (2344–2353).
- Stand und Mitspieler: `_lebenImStand` (feld-leben.js:2185) und `_feldAktFremd` (2156–2161). Beide prüfen `t.g in L.gattung`. Eine Art außerhalb der Tabelle wird heute beim Empfang **verworfen** (2157) und beim Laden gefiltert (2252).
- Gehege: `_creatureBodySize("g"+p.id)` (kreatur-gehege.js:64), Peer-Größe (netz-p2p.js:1527), Leib (kreatur-leben.js:149).

Gleichzeitig zu schneiden wäre die Äsung (kreatur-leben.js:2101): Äsung = `_wuchsAt` (Feuchte × Licht × Nährstoff) ×
Overlay statt Rauschen. Sonst liest das neue Art-Gesetz eine Tragfähigkeit ohne Physik.

## (5) PREIS

Was die Quelle nennt:
- `_depositLife` schreibt 9 Zellen je Akt, die Räumung kostet log(Eimer) (feld-leben.js:2056–2081, 1983–1986). Vor feld.K3#2: bis 1 110 Zellen besucht bei 573 lebenden (1982–1983). Ruhe vorher: 46 Eimer-Schritte je Tod (1985–1986).
- Leben-Stufe am Grenzwert: nahStreu 1 014 Einheiten in 7 von 30 Frames, 192 Kacheln neu in 60 s (2357–2359), seitdem durch zwei Takte Haltezeit gedämpft. Halde ohne Schranke ließ die Seite abstürzen (2400–2401).
- Struktur-Bau ≈ 140 ms je Footprint-Remesh (452–453), nicht artbezogen.
- `_attachFieldAttribute`: 16 B je Vertex (Float32 × 4) und 6 noise2D je Vertex (Warp 2 + Achsen 4) beim Chunk-Bau (2768–2781, 1823–1831).
- mp-sync-Befunde: 15 von 1 172 Zellen gleich (2095), 176 von 356 (2127). Das sind Korrektheitszahlen, keine Kosten.

Je Art (abgeleitet aus gelesenem Code, nicht gemessen):
- Gestalt einmal je Gattung „aus dem Ofen gegossen und gemessen“ (`_gattungLeib`, kreatur-leben.js:2355–2358). Kosten in ms nicht genannt.
- `_kreaturBestand` kostet O(Zellen × Arten) je Region und Takt (16 Zellen bei revierM 113 / rasterM 50). `lebensraumWahl` kostet O(5 Klassen × Arten) je Geburtsprobe (tetrapoda-core.js:2162–2168). Beides wächst **linear mit der Artenzahl**. Bei Millionen Arten je Planet ist das nur tragbar, wenn je Region nur die lokal möglichen Arten iteriert werden.
- `_bestandDiet` baut je Aufruf ein Objekt über alle Gattungen (2152–2160) und wächst linear.

Je Individuum:
- Bestandseintrag ~10 Felder, reist im Stand und per p2p (feld-leben.js:2185–2196).
- `_bestandJagd` ist **O(Tiere²) je Region und Takt** (kreatur-leben.js:2171–2182).
- Tris, Draw-Calls und MB je Leib und Art stehen nicht in diesen Dateien.

## (6) OFFEN

- Woher `VERHALTEN.groessen` (Bänder) und `herde.wurf` ihre Zahlen haben: tetrapoda-core.js:253 nicht gelesen.
- Ob `alterS` ein Alterungs-/Sterbegesetz nach Masse trägt: nicht gelesen.
- `_bestandFeld`/`_bodenKlasseAt` nur bis Zeile 2337 angelesen. Ob die Bodenklasse je Zelle gecacht wird, ist unklar (`merken`).
- Wie Pflanzenarten gewählt werden (phyto-core, vegetation-*): außerhalb meines Felds. Das Feld trägt keine Pflanzenart.
- Die 17 Lese-Stellen des Docs gegen die 28 Grep-Treffer: nicht einzeln abgeglichen.
- Kosten in ms, Tris und MB je Art oder Tier: in den gelesenen Dateien keine Zahl. Sie müssten am Ofen (`_gattungLeib`, koerper-leib.js) und am Profi-Band gemessen werden.
- `_genVersion() >= 3` ist für neue Welten vermutlich aktiv. Den Wert am Spawn heute habe ich nicht geprüft.
