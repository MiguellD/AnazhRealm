# Spike 2 — EIN Land-Bauplan (gegen main 18058dba, nur gelesen)

Skript: `scratchpad/leben/spike2/landbauplan.cjs` (Kern-KOPIE im Scratch-vm, 19 benannte Ersetzungen R1–R8i; Laufzeit 59,3 s unter
Last paralleler Arbeiter, die Stufe 4 allein 22,6 s). Ausgaben: `spike2/landbauplan-ausgabe.txt` (Standard), `landbauplan-dichte.txt`
(`--nur-treue --dichte`, mit R9a–c), `landbauplan-n6.txt` (`--hals-n 6 --rute-n 4`). Maßstab 1 E = 1/3 m; mm = E · 333.

## BEFUND

Die Frage: trägt EIN Primitiv-Baum mit fester Gliederzahl (Hals 12, Rute 10), stetiger Pfote (huf, spreiz) und stetigem Ohr (ohrSpitz
und die Lage-Zahlen) die vier Wurzeln Wolf · Fuchs · Bär · Hirsch, ihre Mischungen und die Halb-Form? **Ja für Rumpf, Bein, Pfote,
Kopf, Ohr und die Mischung; nein für Hals und Rute, solange die Haut von foundry nicht dichte-invariant ist.**

### (1) Treue gegen die Güsse von main — sichtbare L0-Fläche (Haut-Feld ∪ starre Primitive), beidseitig, p95/max in mm

| Gattung | Meshes main → EIN | Hals | Rute | Rumpf | Bein | Pfote | Kopf | Ohr |
|---|---|---|---|---|---|---|---|---|
| Wolf   | 229 → 255 | **11,7/12,1** | 2,8/3,3 | 0,1/6,5 | 0,1/1,6 | 0,1/0,2 | 0,7/4,9 | 2,8/4,7 |
| Fuchs  | 233 → 255 | 3,9/4,2 | 0,0/0,1 | 0,1/3,0 | 0,1/1,1 | 0,1/0,1 | 0,1/3,8 | 3,3/3,7 |
| Bär    | 221 → 255 | **15,1/15,3** | **22,3/23,0** | 0,1/9,6 | 0,1/10,0 | 0,2/0,4 | 0,2/14,0 | 0,1/6,9 |
| Hirsch | 183 → 255 | 1,3/1,8 | **14,0/14,1** | 0,1/7,5 | 0,1/0,4 | 0,1/0,7 | 0,2/6,4 | 3,2/3,2 |

- Boden der Methode (main-Wolf gegen main-Wolf): p95 0,1 · max 0,6 mm.
- Über dem Soll (p95 ≤ 5 / max ≤ 20) stehen NUR Hals und Rute: Wolf-Hals, Bär-Hals, Bär-Rute (max 23,0 — einziges max > 20),
  Hirsch-Rute. Rumpf/Bein max ≤ 10,0 mm überall.
- Vorzeichen: an Hals und Rute ist der EIN-Leib überall DICKER (Wolf-Hals 349 Punkte innen / 0 außen, Bär-Hals 379/0, Wolf-Rute
  342/0). Die Wurzel ist das polynomiale smin der Haut (foundry-core.js:8700): es ist nicht idempotent, eine dichtere Kette gleicher
  Radien bläht auf. Die Hals-Gliederzahl springt in main 4/6/4/11, die Rute 8/10/2/3 — wer am meisten verdichtet, weicht am meisten ab.
- Gegenprobe N6 (Hals 6 / Rute 4): Fuchs-Rute 23,9/49,0 (außen, zu dünn), Wolf-Rute 19,8/27,8, Hirsch-Hals 8,8/11,0 (außen).
  KEINE feste Zahl trifft alle vier, solange die Haut von der Dichte abhängt.
- Gegenprobe R9 (`--dichte`, ein 1-D-Ketten-Modell der Aufblähung korrigiert den Glied-Radius): alle max ≤ 20 (Wolf-Hals 6,5/8,3,
  Bär-Rute 5,1/8,6, Hirsch-Rute 15,6/17,0); das Vorzeichen kippt nach außen (Überschuss ~1,5×), und am L0-Guss bricht es den Fell-Satz
  („die Zeile tailSeg9 liegt auf keiner Haut“, Hirsch-Rutenspitze unter minVox). R9 ist als Lösung gefallen; die Richtung stimmt.

### (1b) Refit der EIN-Vorlage Wolf (L1, 746 Ecken, 134 Primitive) auf jede Gattung, gemessen am Feld des main-Gusses
- Paarung über den Baum-Platz: 0 Primitive ohne Partner (Fuchs 1). Eigene Fläche p95 0,0 / max ≤ 4,1 mm.
- Gegen main: Wolf 6,5/11,9 · Fuchs 0,9/4,1 · Bär 12,5/19,7 · Hirsch 2,4/12,4 — die Rest-Abweichung ist die aus (1), nicht der Refit.

### (2) Mischung Wolf → Bär, Wolf → Hirsch bei t = ¼ ½ ¾ (Runde 1: bis 362 mm)
| | Haut 2 Knoten | Haut 3 Knoten (0, ½, 1) | Ohr+Pfote 2 Knoten | Ohr+Pfote 3 Knoten |
|---|---|---|---|---|
| W→B ¼ | 5,3/28,9 | 2,2/10,9 | 6,3/11,6 | 2,4/4,7 |
| W→B ½ | 7,0/43,6 | Knoten | 10,1/12,8 | Knoten |
| W→B ¾ | 5,1/37,1 | 2,1/16,3 | 7,7/10,3 | 2,4/3,7 |
| W→H ¼ | 9,0/25,0 | 3,3/9,9 | 8,8/12,7 | 2,9/10,2 |
| W→H ½ | 12,4/33,0 | Knoten | 11,8/15,7 | Knoten |
| W→H ¾ | 10,0/24,1 | 3,5/10,2 | 11,7/29,2 | 4,3/7,6 |

Mit drei Knoten je Strecke (Knoten-Abstand ½ in w) hält die lineare Mischung p95 ≤ 4,3 / max ≤ 16,3 mm. Der Sprung 362 → 43,6 → 16,3
kommt aus der festen Topologie; zwei Knoten reichen nicht.

### (3) Halb-Form (Ruhe-Pose)
| | Komponenten | Durchdringen distal | Pfote tiefster Punkt vorn/hinten | Hals-Winkel |
|---|---|---|---|---|
| main Wolf | 17 (lose Krallen) | 0,0 | −12,3 / −22,1 | 35,0° |
| main Hirsch | 1 | 0,0 | −11,0 / −25,1 | 55,1° |
| **HALB Wolf\|Hirsch** | **1** | **0,0** | −12,6 / −24,6 | 45,0° |
| HALB Wolf\|Bär | 17 (wie main-Wolf) | 0,0 | −15,9 / −26,5 | 22,5° |

- huf 0,50 und ohrSpitz 0,50 in der Halb-Form: ein Halb-Huf und ein Halb-Ohr, keine Wahl der stärkeren Art.
- Eigene Gestalt: Weg der Ecken zum Wolf p50 66,6 mm, zum Hirsch p50 66,3 mm — mittig, kein Klon eines Elternteils.
- Durchdringen gemessen an den distalen Gruppen (Läufe, Kopf, Rute); der Selbsttest Kopf|Leib schlägt an (63,4 mm), die Messung lebt.
- Gelenk-Winkel der Ruhe = STAND_POSE (tetrapoda-core.js:65, art-unabhängig): im Band trivial. In Bewegung: **nicht gelaufen**.
- Pfoten 11–27 mm unter dem Boden-Nullpunkt wie bei main (Fell/Ballen-Tiefe); die Halb-Form liegt zwischen den Eltern.

### (4) Preis — echter Ofen `BAKERS_BY_KIND.kreatur` beider Kerne
| | Ecken L1 | Dreiecke L1 | Guss L1 ms (unter Last) |
|---|---|---|---|
| Wolf | 3832 → 4086 | 5954 → 6274 | 793 → 1332 |
| Fuchs | 4010 → 4228 | 6280 → 6528 | 1118 → 1310 |
| Bär | 3868 → 3890 | 6418 → 6406 | 1459 → 1700 |
| Hirsch | 3087 → 3745 | 5440 → 6160 | 990 → 1284 |

- Hirsch L0: Gelenk-Teile 23 → 33 · Ecken 27961 → 34387 (Haut 8700 → 8722, starr 6527 → 12901) · Dreiecke 53304 → 62464 (+17 %).
- Meshes je Tier 183–233 → 255 (fest).
- Tafel je Bauplan (24 Knoten × 8 B je Ecke, L0-Haut + L0-starr + L1, Hirsch): main 3,52 → EIN 4,87 MB. Drei Vorlagen (hund/bär/
  hirsch, der T1-Plan) zusammen ≈ 10,55 MB → EIN 4,87 MB.
- Die starren Ecken (Schalen, Afterklauen, Ohr-Scheiben) treiben die Tafel. Ohne L0-starr in der Tafel (die starren Teile sitzen am
  Gelenk): (8722 + 3745) · 192 B ≈ 2,39 MB ≤ 2,5 — von Hand aus den gedruckten Ecken gerechnet, nicht im Skript.

### (5) Reichweite — Werte gewählt, unsicher
- Hase: baut, 23 Komponenten (Fell-Zehen lose über die Statur-Regel), Rute dicht (Lücke 0,04). Es fehlt eine Achse
  Hinterlauf/Vorderlauf.
- Pferd: baut, 1 Komponente; spreiz 0 verschmilzt die Schalen zum Einhuf. Die stetige Pfote trägt.
- Maus: baut, aber die Rute ZERFÄLLT (Glied-Abstand ÷ Radien-Summe 10,74): zehn Glieder reichen nicht für eine lange dünne Rute.
- Elefant: baut, die Rute zerfällt (3,51), Pfoten −60/−101 mm unter dem Boden. Rüssel und Stoßzähne gibt es nicht als Primitiv.

## DAS GESETZ — Signaturen (EINE Quelle je Domäne, kein Zwilling)

- `leben-core.js` bleibt die EINE Quelle für Erbe und Achsen (`achsen`, `wuchs()`); die Gattungs-Kerne LESEN nur.
- `tetrapoda-core.js`:
  - `TIER_BAUPLAN = { hals: 12, rute: 10, … }` — die Gliederzahl ist eine Konstante des Bauplans (gewählt). Sie ersetzt
    `Math.ceil(nLen / (0.75 * nR[0]))` :4755 und `Math.round(A.schwanz.segs)` :4833.
  - `ART_GESTALT[art].bein.huf ∈ [0,1]`, `.bein.spreiz ∈ [0,1]` statt `pfote: 'zehe'|'sohle'|'huf'` (:4415). Die Zehen III/IV werden
    zu Schalen, II/V zu Afterklauen, die Ballen verdeckt — EIN Fuß-Bau.
  - `ART_GESTALT[art].kopf.ohr = { spitz, cy, ay, ax, az, icy, iay, iax, iaz, iz, dy, z, roll, pitch }` statt `ohrForm` (:5035, :5046);
    `buildEar` baut K Scheiben (gewählt 5) auf einer Kegel↔Ellipsoid-Mischung.
  - Fänge immer gebaut, Radius × min(1, fangF/0,1) statt `fangF > 0.1` (:4943, :4976); `jawLen` stückweise linear statt in Stufen
    (:4963).
  - `artGestalt(w)` mischt nun ALLE Zahlen linear; kein Wort mehr, das die stärkste Art nimmt.
  - Absenz-Grep: `'huf'`, `'sohle'`, `'zehe'`, `ohrForm`, `fangF > 0.1`, `Math.round(A.schwanz.segs)`, `Math.ceil(nLen` = 0.
- `foundry-core.js` (die Haut): `__tierFeld`/smin :8700 braucht ein dichte-invariantes Ketten-Gesetz — eine Kette gleicher Radien
  muss dieselbe Röhre ergeben, gleich ob 4 oder 12 Glieder. Signatur: `__kettenRoehre(punkte[], radien[], blend)` als EIN Primitiv
  (Abstand zur Polylinie mit interpolierten Radien), das Hals und Rute als Ganzes ins smin gibt statt Glied für Glied. Das Skript hat
  dies NICHT gebaut (R9 war das 1-D-Modell, gefallen); die Signatur ist gewählt, ihr Maß steht aus.

## DREI FÄLLE + Falsifikation

1. **Wurzel-Treue** (Wolf, Fuchs, Bär, Hirsch gegen main): Rumpf/Bein/Pfote/Kopf/Ohr im Soll (max ≤ 14,0); Hals/Rute darüber (max bis
   23,0), Ursache die Dichte der smin-Haut, bewiesen durch N6 (Vorzeichen kippt) und R9 (alle max ≤ 20).
2. **Mischung** Wolf→Bär, Wolf→Hirsch: drei Knoten p95 ≤ 4,3 / max ≤ 16,3 mm (Runde 1: 362).
3. **Halb-Form** Wolf|Hirsch: 1 Komponente, Durchdringen 0,0, Pfote zwischen den Eltern, Gestalt mittig (66,6/66,3 mm).

**Falsifikation** (max > 20 mm an Rumpf/Bein ODER Durchdringen der Halb-Formen): **nicht eingetreten** — Rumpf max 9,6, Bein max 10,0,
Durchdringen Wolf|Hirsch 0,0 und Wolf|Bär 0,0. Der einzige max > 20 ist die Bär-Rute (23,0), außerhalb des Falsifikations-Teils.

**Mindestzahl der Land-Baupläne:** 1 für die vier Wurzeln, Pferd und Hase — sobald die Haut dichte-invariant ist. Ohne das: die
Hals-/Ruten-Gliederzahl müsste je Gattung bleiben (dann sind es 2: kurz-dicht Bär/Wolf, lang Hirsch/Fuchs, und die Halb-Form springt
wieder). Maus und Elefant brauchen keinen zweiten Bauplan, aber mehr Ruten-Glieder (Kettenröhre löst auch das) und für den Elefanten
ein neues Primitiv (Rüssel als Kette am Kopf).

## PREIS
- Meshes je Tier 255 fest (+10 % bis +39 %). L1-Dreiecke −0,2 % bis +13 %. L0 Hirsch +17 % Dreiecke.
- Tafel je Bauplan 4,87 MB mit L0-starr, ≈ 2,39 MB ohne (Hand-Rechnung) — die Hälfte der drei Vorlagen zusammen (10,55 MB).
- Guss-Zeit L1 +17 % bis +68 % unter Last (gleiche Last je Paar, aber nicht ruhig; vorher↔nachher am Gerät: nicht gelaufen).

## BAHN — ausschließlicher Datei-Besitz (gegen welle-2-3.md §3)

Der Schnitt ersetzt die drei Vorlagen von T1 durch EINE. Er liegt in denselben Dateien, darum keine neue Bahn neben T1, sondern
T1 wird breiter und P2/R1 tragen den Haut-Hunk:
- **R1 raum-ofen** (`foundry-core.js` :7385–7560, `scripts/diag-tier-anatomie.cjs`) — unverändert, landet zuerst.
- **R2 ketten-haut** — `foundry-core.js` (NUR der Hunk `__tierFeld`/smin um :8632–8710 plus `__kettenRoehre`). Nach R1 im selben
  Datei-Strang, vor P2 (P2 berührt PRESETS :4729–4760, kein Überlapp im Text, aber dieselbe Datei → nacheinander).
  - Stopp: Kette gleicher Radien mit 4 vs 12 Gliedern gleiche Fläche max ≤ 2 mm; Guss-Bytes der 4 Gattungen ändern sich EINMAL.
  - Linse in gate:tier-anatomie: Mutante „smin Glied für Glied“ → ROT am Namen `__kettenRoehre`.
- **T1 tier-bauplan** (`tetrapoda-core.js`, nach Welle 1 und nach R2) — TIER_BAUPLAN 12/10, stetige Pfote, stetiges Ohr, Fänge,
  Kiefer (R1–R8 dieses Skripts als echte Hunks), EINE Vorlage statt hund/bär/hirsch.
  - Stopp: Treue je Gattung und Teil p95 ≤ 5 / max ≤ 20 mm; Mischung mit drei Knoten max ≤ 20; Halb-Form 1 Komponente, Durchdringen 0;
    Tafel ≤ 2,5 MB je Bauplan; Absenz-Grep der 7 Schalter = 0.
- T3, L2, L3 unverändert (sie lesen den Bauplan-Schlüssel `bauplan|lod`; mit EINEM Bauplan wird der Schlüssel kürzer, nicht anders).
- T5 tier-art (Welle 3) liest dann nur noch w und Achsen — ohne die Wort-Felder.

Reihenfolge: R1 → R2 → (Welle 1 gelandet) → T1 → T3 ∥ L2 → L3.

**Bildpaar** (main ↔ Kopf, Werkbank am Messort tiere.mensch#1, Mittag, gleiche Saat):
- A: die Hirsch-Herde der Wiese am Spawn, Third 20 m seitlich, 20 min nach der Ankunft. SIEHT: eine Halb-Form zwischen Wolf und
  Hirsch (Halb-Huf, Halb-Ohr) als ein geschlossener Leib, Hals und Rute als glatte Röhre ohne Perlen; die Hirsche sonst gleich.
- B: das Wolfsrudel am Waldrand, Third 15 m. SIEHT: Wolf-Hals nicht dicker als in main (heute im Spike +12 mm), Rute gleich buschig.
- Zahl je Bild: Treue p95/max je Teil (Skript Stufe 1), Dreiecke und dc am selben Ort.

**Sprossen** (Karte 2):
- leben.tiere.bewegung#1 („1 Bauplan, 4 Gattungen, 10–300 kg, laufen“) — die Topologie trägt; Fußgleiten ≤ 5 % am Lauf: nicht
  gelaufen.
- leben.tiere.arten#2 („ein Bauplan je Medium“) — für Land trägt es; Richter Blind-Panel ≥ 0,7: nicht gelaufen.
- leben.evolution.stammbaum#3 („Blatt → Körper ≤ 2 s“) — L1-Guss 1,3–1,7 s unter Last; Blatt → w → Guss am Stück: nicht gelaufen.
- leben.evolution.muster#4 — die Halb-Form ist Voraussetzung; das Muster selbst nicht gemessen.

**Stopp-Kriterium der Bahn:** alle Teile aller vier Gattungen p95 ≤ 5 / max ≤ 20 mm im echten Kern (ohne Kopie), Halb-Form
Durchdringen 0, Tafel ≤ 2,5 MB, Bildpaar A+B mit Zahl, Pflicht B (Ankunft) nicht langsamer an der Radeon.

## OFFEN
- Die dichte-invariante Haut (`__kettenRoehre`) ist NICHT gebaut; ihr Maß steht aus. Ohne sie: Wolf-Hals 12,1, Bär-Hals 15,3,
  Bär-Rute 23,0, Hirsch-Rute 14,1 mm max.
- R9 (1-D-Dichte-Modell) schießt ~1,5× über und bricht den L0-Fell-Satz (tailSeg9 ohne Haut) — gefallen.
- Gelenk-Winkel in Bewegung und Fußgleiten: nicht gelaufen.
- Tafel ≤ 2,5 MB nur als Hand-Rechnung ohne L0-starr; mit starr 4,87 MB.
- Maus- und Elefanten-Rute zerfallen bei 10 Gliedern; Elefanten-Rüssel/Stoßzähne fehlen als Primitiv; Hase ohne Lauf-Verhältnis-Achse.
- Die Ohr-Platzhalter-Ellipse für Wolf/Fuchs (Cy .52, Ay .5, Ax .6) und K = 5 Scheiben sind gewählt, unsicher.
- Laufzeit 59,3 s unter Last (Soll ≤ 60 s) — knapp; mit `--nur-treue` kürzer.
- Kein Bild geschossen (kein GPU, kein Fenster laut Auftrag): das Bildpaar ist Teil der Bahn.
