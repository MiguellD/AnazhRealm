# SPIKE Tier-Leib-Raum — Befund (main 18058dba, nur gelesen)

Skript: `spike/leibraum.cjs`. Es lädt die Ofen-Kerne wie gate:tier-anatomie (`welt-boot fadenScope(OFEN_KERNE)`, three r184 im node-vm)
und rechnet mit `bauTier`, `deriveTierParams`, `BAKERS_BY_KIND.kreatur`, `__tierPrims`, `__leibRaumRefit`, `__leibRaumFeld`,
`__primGewichte`/`__hautGewichte` und `surfaceNets` aus dem Repo. Laufzeit 21–41 s je nach Last, ein Faden, kein GPU. Ausgabe:
`spike/ausgabe.txt`. Teil 2b misst an einer KOPIE von tetrapoda-core.js im Scratch-vm mit vier ersetzten Ankern; das Repo bleibt byte-gleich.
Alle mm-Zahlen gelten beim Maßstab des Ziels (MASSSTAB 1/3 m je Einheit; der Wolf mit H 2,4 E hat ≈ 0,8 m Widerrist).
„Sichtbar“ heißt Abstand der gemischten Ecke von der WAHREN Fläche des Ziels (Feld der Ellipsoide, ohne Raster). „Ecke“ heißt Abstand
zum Refit des Ziels; darin steckt auch das Gleiten entlang der Fläche, das man nicht sieht.

## BEFUND

**(1) TOPOLOGIE — bricht, an drei benannten Stellen.**
- Die gegossene Hülle (Surface-Nets) wechselt bei jedem Formschritt ihre Index-Liste. Wolf L1 bei build 0,42 → 0,43: Haut-Ecken
  3 442 → 3 450, Index 16 836 → 16 884. Gleich bleibt sie nur bei reiner Skala (size × 1,001: Index-Liste GLEICH). Eine Formziel-Tafel
  auf dem Index des Gusses je Dial gibt es deshalb nie. Es trägt nur der Weg des Menschen: EINE feste Vorlage, und die Ziele über den
  Refit (`__leibRaumTafel` foundry-core.js:7489).
- Zwischen den Gattungen bricht schon der Primitiv-Baum von bauTier. Meshes wolf 229 · fox 233 · bear 221 · deer 183. Hals-Glieder
  4/6/4/11, `nN = ceil(nLen/(0,75·nR0))` tetrapoda-core.js:4755. Rute 8/10/2/3, `round(A.schwanz.segs)` :4833. Dazu die Wörter: Pfote
  zehe/zehe/sohle/huf (`baueFuss` :4415) und Ohr spitz/spitz/rund/blatt (:5035, :5046).
- Innerhalb einer Gattung bricht er auch. Bei ±20 % springen die Hals-Glieder an neck und build für wolf, fox und deer (deer 9…14
  Glieder), nur der Bär bleibt fest. Dritter Täter ist die Raster-Schwelle `TIER_HAUT.minVox` (foundry-core.js:8561): Bei +2σ treten
  die Pfoten flP/frP/hlP/hrP in die Haut, am Kalb fallen earL/earR heraus, in 2b fällt headGroup heraus.

**(2) LINEARITÄT — Täter im Refit selbst, danach trägt sie.**
- Täter: `__leibRaumRefit` :7421 trägt eine Ecke mit Mi_q⁻¹·Mi_p. Der Radius r steht aber nicht in Mi (bauTier `s(r, …)`), also
  bleibt die Ecke beim kleineren Leib r_p statt r_q vom Zentrum weg und landet außerhalb jedes Felds.
- GEGENPROBE mit dem heutigen Rahmen: Am Kalb liegen 21,6 % der Ecken > 10 mm neben der Fläche (Rumpf 132), bei Wolf → Fuchs 4,9 %.
  Mit dem Radius im Rahmen (Mi/r, r = 1; das Feld bleibt gleich, weil der Abstand in Mi und r homogen ist) sind es: Größe allein 0,0 %,
  Kalb 0,4 % (nur die Ohren, deren Primitive fehlen) und Wolf → Fuchs 0,0 %.
- Fall 1, Individuum Wolf, alle vier Achsen (Hals, Bein, Statur, Größe-Allometrie) zugleich an ±2σ. Gemischt wird aus EINEM
  Formziel je Achse und Vorzeichen. Die Ecken wandern 81,8–102,6 mm (p95). Sichtbar bleiben **p95 0,2 mm, max 1,8 mm**, als Ecke
  p95 0,4–0,6 mm, max 3,0 mm.
- Fall 2, Wolf → Fuchs am Baum von main (Paarung nach Lage: 123 gepaart, 4 Fuchs-Primitive ohne Partner). Der Refit am Ziel liegt auf
  der Fläche, aber die Rutenspitze des Fuchses bleibt ungedeckt (Deckung max ∞). Der Dial-Pfad, linear in t, zeigt sichtbar p95
  20,5 / 6,8 / 14,6 mm (t = ¼, ½, ¾), max 58 mm. Die Art-Gewichte springen: wolf 0,999 bei t = ¼, 0,001 bei t = ¾ (σ² = 0,01, :4062).
- Fall 3, Wolf → Bär (118 gepaart, 8 ohne Partner): sichtbar p95 19,0 / 9,7 / 24,1 mm, max bis 362 mm, der Refit 1,2 % daneben
  (Rute 6, Rumpf 3).
- Fall 4, Hirsch → Kalb auf EINER Alters-Achse: Größe 2,8 → 1,09 (bs 0,39, Entscheid §1.1), Bein relativ × 1,4, Schädel/H × 2,02 aus
  `skullR ∝ size^0,25` :865. Mit zwei Knoten (Kalb, erwachsen) sichtbar p95 0,6 / 1,2 / 0,7 mm, mit drei Knoten p95 0,1 / 0,5 mm.
  Die Wechselwirkung Größe × Bein hat p95 0,5 mm. Jedes max > 10 mm (bis 211 mm) sitzt an 3 Ohr-Ecken: earL/earR fallen am Kalb unter
  die Raster-Schwelle.
- 2b, fester Bauplan (Hals 12, Rute 10, Länge des Glieds = segL·segs/10) mit den Art-Gewichten w als eigener Achse. Wolf und Fuchs
  tragen DENSELBEN Baum (239 Meshes, Paarung Baum), der Refit liegt 0,0 % daneben. Additiv aus w plus 5 Dials, je Achse EIN Formziel:
  t = 1 sichtbar **p95 0,9, max 1,9 mm**; t = ½ p95 2,4, max 13,7 mm (8 Ecken der Rute); t = ¼ p95 2,2, max 10,9 mm.
  Bär (237) und Hirsch (191) tragen auch mit fester Glieder-Zahl je einen eigenen Baum: Ihre Wörter (Pfote, Ohr) bleiben diskret.

**(3) SKELETT — die Gelenke sind exakt linear, die Knochen der Vorlage aber nicht genug.**
- Die Gelenk-Lagen, linear gemischt, weichen vom echten Bau 0,0–0,1 mm ab. Sie verschieben sich relativ zur Wurzel bis 103,6 mm (+2σ)
  und 137,9 mm (Kalb). Dreht der Satz das Individuum mit den Knochen der Vorlage (θ = 0,42 rad, GANG maxWinkel :1344), ist der
  Drehpunkt bis **43,2 mm** (+2σ) bzw. **57,5 mm** (Kalb) falsch, und das ist sichtbar. Darum braucht es Gelenk-Formziele.
- Haut-Gewichte Vorlage ↔ Ziel als Total-Variation: ±2σ p95 0,06 (max 0,19), Kalb p95 0,33, Fuchs 0,40, Bär 0,49. Für Individuen
  reichen die Gewichte der Vorlage. Ob sie am Kalb in Bewegung reichen, ist ungemessen.

**Urteil.** Der Gedanke trägt für Individuum, Alter und Art INNERHALB eines Baums (p95 ≤ 2,4 mm). Am Baum von main fällt er zwischen
den Gattungen. Er trägt, sobald drei Schnitte stehen: der Radius im Rahmen des Refits, Glieder-Zahl und Primitiv-Satz fest je
Bauplan, die Art-Gewichte als Achse statt als Gauß-Wurf der Dials.

## DAS GESETZ — Signaturen (kein zweiter Kern, kein Zwilling zu §1 des Entscheids)

**leben-core.js** (§1 bleibt die EINE Quelle von Erbe, Masse, Alter, σ; der Leib-Raum liest nur):
- `LEBEN_GESETZ.achsen` wächst um `bein`, `hals`, `statur` (Welle 2 laut Entscheid §5). Jede Achse tritt nur mit Leser UND Auslese ein.
  Ihre σ steht dort (`sdP`) und NIE im Gattungs-Kern.
- `wuchs(M∞, alterS) → masseZurZeit(M∞, alterS)/M∞` ∈ [q, 1]: der Anteil des Wachstums. Er ist die Alters-Koordinate des Leib-Raums.
  Daneben gibt es keine zweite Wachstumskurve; bs = (m/M_guss)^⅓ bleibt die Skala in der Instanz-Matrix.

**tetrapoda-core.js** (der Gattungs-Kern = das Gesetzbuch des Bauplans):
- `TIER_BAUPLAN = { vierbeiner: { glieder: { hals: 12, rute: 10 }, wurzeln: ["wolf","fox","bear","deer"] } }`. Die Glieder-Zahl ist
  Gesetz des Bauplans, nie Funktion eines Dials. `nN` :4755 und `nSeg` :4833 lesen sie. Die Art trägt die Länge (segL·segs/N) und ihre
  Radien (Rute des Bären: kurze Glieder).
- `artGewichte(P)` :4062: Trägt P ein `w` (Punkt im Simplex der Wurzeln), gilt es. Der Gauß aus den Dials bleibt nur für die vier
  Presets ohne `w` (das Labor), damit der Bestand nie über einen Dial in eine andere Art springt.
- `TIER_RAUM.vierbeiner.achsen`: `w.fox`, `w.bear`, `w.deer` mit Knoten [0, ½, 1]; `hals`, `bein`, `statur`, `groesse` mit Knoten
  [−2σ, 0, +2σ], σ gelesen aus `__lebenCore.gesetz()`; `wuchs` mit Knoten [q, (q+1)/2, 1]. Zusammen 8 Achsen und 24 Knoten.
- `tierRaumDials(w, a, wuchs) → dials` für bauTier: Vorlage und Knoten. Der Weg ist die Allometrie von `deriveTierParams` (:851,
  :865, mit size = Art-Mittel · wuchs^⅓), keine eigene Formel.
- `tierRaumPunkt(w, a, wuchs) → Float[8]` (Knoten-Index samt Bruch je Achse, wie koerper `leibRaumPunkt` :1724).

**foundry-core.js** (der Ofen, EINE Tafel-Maschine für Mensch und Tier):
- `__leibRaumRefit(V, P0, P1, vox)`: Der Rahmen jedes Primitivs trägt den Radius (Mi/r, r = 1). Das ändert eine Funktion, und der
  Mensch liest dieselbe; Byte-Beweis und Messung des Menschen gehören in dieselbe Bahn (siehe OFFEN).
- `__tierRaumTafel(kern, vorlage, achsen)`: wie `__leibRaumTafel`, nur ohne Fett-Depot. Den Primitiv-Satz bestimmt die Vorlage: `ti` ist
  der Baum-Platz, und kein Ziel nimmt nach minVox heraus oder hinzu. Rückgabe `{ achsen, n, ziele, gelenke }`. `gelenke` sind die
  Formziele der Knochen-Lagen je Knoten; sie sind linear, gemessen 0,0–0,1 mm.

**stamm** (Leser, keine eigene Rechnung):
- koerper-leib.js `_ofenKreaturKey` :1033 wird `bauplan|lod` statt `recId|lod|dials`: Eine Vorlage trägt alle Arten ihres Bauplans.
- stoff-gang.js `_gangZielTafel(name)` :471 liest heute `kc.LEIB_RAUM` fest. Künftig nimmt sie `(name, achsen)` aus dem Kern der
  Quelle (Mensch: koerper LEIB_RAUM, Tier: tetrapoda TIER_RAUM). Es gibt keinen zweiten Tafel-Bauer.
- kreatur-leben.js Tier-Satz `_tierSatzFuer` :2944 ruft `_gangSatz(…, raum)`. Der Punkt jedes Individuums kommt aus dem Bestand
  (`a`, `wuchs` aus leben-core), die Zeile aus `_tonZeile`.
- stoff-gang.js `_gangSatzKnoten` :621 bekommt die Drehpunkt-Korrektur je Pose-Zeile: c_b = Σ R_Ahn·Δo − R_b·Δj, linear in den Achsen.

## DREI FÄLLE und die Falsifikation (gerechnet, Ausgang)

| Fall | Maß | Ausgang |
|---|---|---|
| F1 Individuum ±2σ (Wolf, 4 Achsen an der Ecke) | sichtbar p95 0,2 · max 1,8 mm | trägt (< 1 cm) |
| F2 Art im Bauplan (Wolf → Fuchs, 2b: fester Baum, w als Achse) | t = 1: 0,9 / 1,9 mm · t = ½: 2,4 / 13,7 mm (Rute) | trägt p95, max an der Rute 3,7 mm über der Schwelle; Knoten ½ auf w ist Pflicht |
| F3 Jungtier (Hirsch → Kalb, Alters-Achse, 3 Knoten) | p95 0,1–0,5 mm · Ohr-Ausreißer bis 211 mm | trägt, sobald die Vorlage den Primitiv-Satz hält |

Falsifikation (a), „die Topologie bricht zwischen den Gattungen“: **eingetreten.** Gemessen sind Hals 4/6/4/11, Rute 8/10/2/3, die
Wörter Pfote und Ohr, die Hülle bei jedem Schritt und Sprünge schon innerhalb ±20 %. Stattdessen trägt eine Vorlage je Bauplan mit
fester Glieder-Zahl. Gemessen: Wolf und Fuchs teilen dann den Baum, Refit 0,0 % daneben. Die Wörter von Bär und Hirsch spalten weiter
(3 Bäume in 4 Wurzeln) und müssen stetig werden, oder der Bauplan trägt bis dahin 3 Vorlagen (Zehe, Sohle, Huf).
Falsifikation (b), „der lineare Fehler ist am Leib eines Wolfs > 1 cm“: **für Individuen nicht eingetreten** (max 1,8 mm). **Am Baum
von main zwischen Gattungen eingetreten** (p95 6,8–24 mm, max bis 362 mm). Täter sind der Refit-Rahmen ohne Radius und der Gauß-Sprung
der Art-Gewichte. Formziele zweiter Ordnung braucht es nicht: Die Wechselwirkung liegt bei p95 0,5 mm (Kalb) und ≤ 0,6 mm (±2σ).
Das stückweise Lineare der Knoten reicht.

## PREIS (gerechnet aus gemessenen Ecken-Zahlen; GPU nicht gelaufen)

- Je Individuum: 8 Floats = 2 RGBA-Texel = 32 B auf der Ton-Tafel-Zeile, für 10⁴ Individuen 0,32 MB. Die Ton-Tafel trägt höchstens
  4 096 Zeilen (`TON_TAFEL` koerper-leib.js:3279), also reißen 10⁴ im Schirm diese Decke. Zeilen gehören nur Sichtbaren; die Seiten
  der Tafel sind offen.
- Je Bauplan bei 24 Knoten (Halb-Float RGBA wie `_gangZielTafel`): L1 (3 832 Ecken) 0,74 MB · L0-Haut (8 936) + L1 2,45 MB · L0 ganz
  (29 616, davon 13 174 Schalen) + L1 6,42 MB. Heute kosten 10² Arten 200 Güsse ≈ 180 s Faden (0,9 s je Guss, koerper-leib.js:2152)
  und ≈ 960 MB JS (9,6 MB je zwei Vorlagen, :1326). Mit dem Leib-Raum: 2 Güsse + eine Tafel je Bauplan.
- Bau der Tafel: Der Refit misst 223–297 ms je 1 000 Ecken (node, Laptop unter Last). Je Bauplan kostet das L1 20–27 s, L0-Haut
  48–64 s, L0 ganz 159–211 s, einmal. Es läuft im Faden und auf der Platte, nie in der Ankunft (Pflicht B).
- GPU je Ecke: 8 Achsen × 2 textureLoad = 16 Lesungen (der Mensch: 14 Achsen, 28). Die Drehpunkt-Korrektur kostet ≈ 97 Pose-Zeilen
  (3 Bänder × 32 Phasen + Stand, KREATUR_SATZ :3743) × ≤ 34 Knochen × 24 Knoten × vec3 Halb ≈ 0,6 MB je Bauplan.
- Fell: `fellStreu` :929 liest P, B.masse und B.fellOrt an der Vorlage. Die Schalen (13 174 Ecken) haben eine eigene Basis-Hülle
  (`__tierFellSchalen` :8783, gröberes Raster). Sie brauchen eigene Zeilen (in 6,42 MB enthalten) oder einen Index auf die Haut-Zeile
  (dann 2,45 MB). Fell-Länge je Art (0,9–2,0) und das Muster sind Stoff und Palette, keine Geometrie.
- LOD: L0 und L1 brauchen je eine Tafel. 10⁴ im Schirm brauchen Mengen-Stufen wie beim Menschen (L2 1 700 / L3 360 Dreiecke), aber
  das Tier hat keine (offen). Befehle zählen nach Baupläne × Senken × ⌈n / 256⌉ (`cap`), nicht nach Arten.

## (5) BAUPLÄNE für leben.tiere.arten#2

„10² Arten aus dem Samen, ein Bauplan je Medium“ heißt 3 Baupläne: Land-Vierbeiner, Luft, Wasser. Heute ist jede Klasse genau EIN Leib
(Amsel :2385, Forelle :2837). Am Gattungs-Kern von main braucht jede Art ihren eigenen Baum, also 10² Vorlagen (× 2 Stufen). Mit fester
Glieder-Zahl sind es gemessen 3 Bäume in den 4 Wurzeln (wolf+fox · bear · deer). Erst mit stetigen Wörtern (Pfote, Ohr) wird es 1
Vierbeiner-Vorlage. Vogel und Fisch sind nicht gemessen.

## BAHNEN der Bau-Welle (Welle 2; nach der Landung von Welle 1, ausschließlicher Datei-Besitz)

Reihenfolge: **T1 → T2 → (T3 ∥ T4)**, gelandet EINMAL im selben Zug. Abgabe je Bahn mit `node scripts/werkbank.cjs abdruck --gegen <Kopf>`.
- **T1 tier-bauplan** — `tetrapoda-core.js`. Inhalt: TIER_BAUPLAN (Hals 12, Rute 10), w in `artGewichte`, TIER_RAUM, `tierRaumDials`,
  `tierRaumPunkt`; Pfote und Ohr stetig (sonst 3 Vorlagen, benannt). Byte-Beweis: Die Güsse der 4 Wurzeln ÄNDERN sich (Hals 4 → 12),
  die Platte wird einmal kalt. Die Ankunft kalt/warm wird vorher↔nachher gemessen, Ziel: warm unverändert. Stopp: Absenz-Grep
  `Math.ceil(nLen / (0.75` und `Math.round(A.schwanz.segs)` = 0; gate:tier-anatomie grün an allen 4 Wurzeln.
- **T2 raum-ofen** — `foundry-core.js`. Inhalt: Radius im Rahmen von `__leibRaumRefit`, `__tierRaumTafel` mit dem Primitiv-Satz der
  Vorlage, Gelenk-Formziele. Messung im selben Commit: die Raum-Zahl des MENSCHEN vorher↔nachher (w26: Mittel 5,7, p95 21 mm). Stopp:
  dieses Skript gegen den Kopf, F1 ≤ 2 mm, F3 max ≤ 10 mm (die Ohren), F2 t = ½ max ≤ 10 mm mit Knoten ½.
- **T3 tier-satz** — `stamm/stoff-gang.js`, `stamm/kreatur-leben.js`, `stamm/koerper-leib.js`. Inhalt: `_gangZielTafel(name, achsen)`,
  der Tier-Satz trägt raum und Punkt-Zeilen aus dem Bestand, Drehpunkt-Korrektur, Ofen-Schlüssel je Bauplan. Stopp: Befehle bei
  50 Tieren nicht über main (GTX +42/+25, kreatur-leben.js:2792), gate:tier-gang Satz-Gleiten ≤ 0,033 wie main.
- **T4 raum-richter** — `scripts/diag-tier-anatomie.cjs` (bestehende Familie gate:tier-anatomie). Inhalt: die Messung dieses Spikes als
  Linse, F1 und F3 am echten Ofen. Mutante: Rahmen ohne Radius → ROT am Namen `__leibRaumRefit` (Kalb 21,6 %). ≤ 3 min CI.
- **Bildpaar A (main ↔ Kopf)**: Hirsch-Herde der Wiese am Spawn (Messort tiere.mensch#1), Werkbank am Messort, Third 20 m seitlich,
  Mittag, gleiche Saat, 20 min nach der Ankunft. main: Kalb isometrisch (Kopf/Widerrist wie die Mutter). Kopf: großer Kopf, lange
  Läufe. Zahl aus dem Bild: Kopf-Höhe/Widerrist Kalb ÷ Mutter, main 1,00 → Kopf ≥ 1,4.
- **Bildpaar B**: Wolfsrudel am Waldrand des Spawns, Third 15 m. main: alle Wölfe dieselbe Proportion (CV Bein/Widerrist 0). Kopf: CV ≥ 3 %.
- Sprossen: **leben.tiere.lebenszyklus#2** (Jungtier allometrisch, Panel Kitz/Hirsch) fällt mit T1–T4. **leben.tiere.arten#2** fällt
  NICHT: Die Arten aus dem Samen sind Welle 3 (`artId(g, pfad)` → w). T1–T4 machen sie baubar, zum Preis einer Tafel je Bauplan.
- Stopp der Welle: alle vier Stopps grün, die Zahlen im Commit, Bildpaar A mit der Zahl, Tafel ≤ 2,5 MB je Bauplan (L0-Haut + L1).

## OFFEN

- Pfote und Ohr stetig: nicht gebaut, nicht gemessen. Bär und Hirsch tragen mit fester Glieder-Zahl je einen eigenen Baum (237 / 191 Meshes).
- Knoten ½ auf der w-Achse: nicht gelaufen. Gemessen ist nur ein Knoten (t = ½ max 13,7 mm an der Rute).
- Primitiv-Satz aus der Vorlage (gegen die Raster-Schwelle): nicht gebaut. Die Ohr-Ausreißer bis 211 mm stehen.
- Drehpunkt-Korrektur: nur als Schranke gerechnet (43 / 58 mm), nicht gebaut. Haut-Gewichte am Kalb (TV p95 0,33) in Bewegung ungemessen.
- Der Mensch liest denselben Refit: Wirkung des Radius-Rahmens auf seine Tafel ungemessen.
- GPU nicht gelaufen: ms, Befehle, Dreiecke bei 10⁴; Mengen-Stufen fürs Tier; die Decke der Ton-Tafel von 4 096 Zeilen.
- σ = 5 % (Hals, Bein, Größe) und 0,05 (Statur) gewählt, ohne Quelle. Kalb-Bein × 1,4 gewählt.
- Gemessen an der Stufe-1-Haut (vox 0,04 H, jede 3. Ecke, 735–788 Ecken); L0 (vox 0,02 H, Kopf-Häute starr) nicht.
- Vogel und Fisch (Luft, Wasser): nicht gemessen.
