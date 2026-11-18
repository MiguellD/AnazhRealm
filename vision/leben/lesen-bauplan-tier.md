# Lesen: Bauplan Tier (tetrapoda-core.js ganz, worlds/tetrapoda/tetrapoda.js ganz) — main 18058dba

Gelesen: tetrapoda-core.js 1–5349 vollständig, worlds/tetrapoda/tetrapoda.js 1–261 vollständig. Für die Leser-Kette
zusätzlich gezielt: foundry-core.js 8160–8300 (bakeTierInstance), stamm/koerper-leib.js 1010–1050, 2418–2480, 2543–2556,
3480–3500, stamm/kreatur-leben.js 600–620, 2790–2795, stamm/kreatur-verhalten.js 584–610, stamm/bau-teile.js 1479–1500.

Kurzbild: Es gibt heute **4 Arten** (wolf, fox, bear, deer), und **jede Art hat genau 1 Gestalt**. Ein Individuum
unterscheidet sich vom Template nur durch **einen gleichmäßigen Maßstab** (bodySize). Der kommt aus einem Hash der netId
und fällt in eines von vier Bändern. Eine neue Art entsteht nur durch eine neue Zeile in mindestens 7 Tabellen.

## (1) WAS TRÄGT — Gesetze, die heute im Spiel konsumiert werden

| Gesetz | Ort | Leser |
|---|---|---|
| Allometrie der Dials → ~25 Größen: Beinmuskel ∝ (size/2,4)^0,67, Schädel ∝ (size/2,4)^0,25, Hals-Winkel 35+(neck−0,263)·300 | tetrapoda-core.js:839–909 `deriveTierParams` (851, 855, 865) | `bauTier` :4265 · foundry-core.js:8178 `bakeTierInstance` · Labor tetrapoda.js:146 |
| Art-Gestalt als Gauß-Mischung über die 5 Dials (σ²=0,01) | :4061–4112 `artGewichte`/`artGestalt` | `bauTier` :4266, `deriveTierParams` :868 (Farben), `fellStreu` :938, `fellFarbe` :4136, `tierAuge` :4118, foundry :8181 |
| Körper-Bau (Rumpf-Profil 21 Stationen, Beine, Hals, Kopf, Ohr, Rute, Pfote) | :4201–5185 `bauTier` | foundry :8276 (der EINE Ofen für Welt UND Labor, tetrapoda.js:119) |
| Fell-Streu-Zeilen auf dem Fell-Ort | :929–1319 `fellStreu` | foundry :8288 (`__tierFellSchalen` :8783) |
| Fell-Farbe je Ort (Sattel/Bauch/Läufe/Maske/Spiegel/Rutenspitze) | :4135–4186 `fellFarbe` | Ofen (Vertex-Farbe) |
| Fell-Schale (Locke, Strich, Auflösung) | :3765–3833 `FELL_SCHALE`/`fellLocke` | Welt-Stoff (stamm studio-stoff `fellSchale`), Labor-GLSL tetrapoda.js:84–97 |
| Gang aus der Froude-Zahl: Schritt λ/L = 1,4 + v̂, Tastgrad, Gangart Schritt/Trab/Galopp (Fr 0,5 / 2,5) | :1331–1444 `GANG_GESETZ`/`GANG_FOLGE`/`gangSchritt`/`gangArt` | `gangWahl` :3043 → `tierPose` :3217 (Welt `_animateTierBaum` und Labor tetrapoda.js:38) |
| CPG nach Kuramoto mit der Folge der Gangart | :2994–3003 `cpgStep` | `tierPose` :3234 |
| Pfoten-IK, Senke, Tritt, Landung | :3163–3683 `tierPose` | Welt + Labor (dieselbe Funktion) |
| Steuern in Froude-Einheiten: Tempo 0,34·√(gL), Sprint 3,0·√(gL), Wende 1,1·√(g/L), Anfahren 0,5 g, Bremsen 0,8 g | :1618–1659 | Welt-Wirt je Tier (laut Kommentar :1616) |
| Masse = Volumen der Haut × 1000 kg/m³; Längen-Maßstab 1/3 m je Einheit | :3943 `MASSSTAB` | stamm `_leibMasse` (kreatur-leben.js:636, 749, 845; koerper-bewegung.js:57) |
| Kampf-Größe: Biss ∝ m^⅔, Haut ∝ m^⅓, Leben ∝ m^⅔ (refKg 64) | :3959 `KAMPF` | kreatur-leben.js:749 |
| Temperament aus diet + Masse (jagdKg 21,5, wehrKg 200, kolossKg 600) | :1959–1963, Zahlen :208–214 | kreatur-leben.js (Kommentar :617ff., `_leibMasse`) |
| Beute bis 2 × eigene Masse | :166 `jagd.beuteMasse` | Jagd-Kaskade des Stamms (nicht weiter gelesen) |
| Bestand logistisch, Riss nach Holling III, Fraß nach diet | :2197–2229 | Stamm (nicht gelesen) |
| Ethogramm, Durst, Lebensraum, Furcht, Jagd-Ende | :2059–2170, :1990–2047 | Stamm (nicht gelesen) |

Physikalisch gekoppelt sind heute nur: **Hüft-Höhe L → Gang, Tempo und Wende** (Froude). **Volumen → Masse → Kampf,
Temperament und Beute.** Dazu kommen die zwei Potenzen auf dem size-Dial (Beinmuskel und Schädel).

## (2) WÜRFE UND TABELLEN

### Würfe ohne Gesetz
- **Körpergröße je Individuum**: `_creatureBodySize` stamm/koerper-leib.js:2545–2556. Es ist ein FNV-Hash der netId
  (`_rollGenome` bau-teile.js:1479). Er wählt eines von 4 Bändern aus tetrapoda-core.js:253–260: klein 0,6–0,82 (18 %),
  normal 0,85–1,18 (64 %), groß 1,25–1,75 (14,5 %), gigant 1,9–2,7 (3,5 %).
  Wirkung: `cr.scale.setScalar(bs)` (kreatur-verhalten.js:597) **skaliert isometrisch** — alle Proportionen bleiben gleich.
  Die Allometrie (:851, :865) liest nur den size-Dial der Art, nie bodySize.
  Länge ×4,5. Masse ×(2,7/0,6)³ = ×91, weil die Masse über das Volumen geht (:3943).
  Die Masse kippt das Temperament: der Hirsch wird ab Größe 1,86 „wehrhaft“ (:213), der Bär ab 0,84 (:212).
  Ein Gigant-Wolf wiegt 64·2,7³ ≈ 1 260 kg und schlägt damit jede Beute bis ~2 500 kg (:166). Diesen Wurf zieht **kein
  Elter und keine Umwelt** nach sich.
- **Geburt am Ort**: `lebensraumWahl(klasse, u, L)` :2157. Ein Wurf u wählt die Gattung nach der Eignung. Das ist
  gesetzlich gewichtet, aber **ohne Eltern**. Neue Tiere bekommen ihre Größe aus dem Region-Strom (kreatur-leben.js:1993:
  `_creatureBodySize("b"+key+"."+Math.floor(rng()*1e9))`).
- **Gruppengröße**: `herde.wurf` :289 — wolf [3,6], deer [3,7], fox [1,1], bear [1,1]. Das ist eine Tabelle je Gattung.
- **Aktion und Takt**: `verhaltenWahl` :3134–3157, FNV über (Index, Zeit-Bucket) :3122. Deterministisch, aber ohne Gesetz.
- **Wander-Schritt**: „deterministisch aus netId × Slot“ :228.
- **Vogel, Schwarm, Fisch, Bestäuber**: Jede Lage, Höhe, Phase und Gliederzahl ist ein Zellen-Wurf (`vogelWurf` :2464).
  Je Klasse gibt es **genau einen Leib**: Amsel :2385–2394, Forelle :2837, Hummel :2922. Das sind Konstanten in m.
- **Fell-Locke**: sin-Hash je Zelle :3813–3815. Das ist ein Mikro-Muster und für eine Art unkritisch.
- **Ofen-Saat**: `bakeTierInstance(kern, presetId, seed, lod, ov)` foundry-core.js:8175 — **seed wird nicht gelesen**
  (8175–8700 ohne weiteren Gebrauch). Der Kommentar :36–39 sagt es selbst: „16 Gestalten waren 16 byte-gleiche
  Zwillinge“, darum gilt `GESTALTEN_JE_REZEPT = 1` :39.

### Art-, Preset- und Gattungs-Tabellen (Schlüssel: der String „wolf/fox/bear/deer“)
1. `GATTUNGEN` :62 — die 5 Dials je Art (size, neck, leg, diet, build).
2. `ART_GESTALT` :3973–4036 — je Art: 3×11 Profil-Stützstellen, 5 Bein-, 2 Hals-, 12 Kopf-, 7 Schwanz- und 1
   Fell-Wert, dazu 8 RGB-Farben. Das sind rund **95 Zahlen und 3 Wörter je Art** (pfote, ohrForm, auge).
   Die Wörter nimmt `artGestalt` :4095 von der stärksten Art — **diskret, kein Übergang**.
3. `ANATOMIE_SOLL` :4045–4058 — Soll-Bänder je Art. Das ist ein Mess-Soll und kein Bauplan.
4. `FURCHT_GESETZ.fluchtDistanzM` :1998 — deer 120, wolf 106, bear 55, fox 40 m.
5. `LEBENSRAUM_GESETZ.gattung` und `.haeufigkeit` :2077–2083.
6. `ETHOGRAMM_GESETZ.gattung` :2125–2130 — ruhen, nahrung, aktiv je Art.
7. `herde.wurf` :289 und `labels` :363.
8. `ARCHETYPES` :393–485 — 7 Archetypen (balanced, deer, wolf, bear, bigcat, weasel, horse). Sie werden **nur** vom
   Mechanik-Skelett `buildSkeleton` :487 gelesen (stamm `_tetrapodaSoulParts` koerper-leib.js:2422–2443 → Tags, Stats,
   Physik). Die **sichtbare** Gestalt baut dagegen `bauTier` aus `ART_GESTALT`.
   **Zwei Bauplan-Quellen für dasselbe Tier** (G4-Bruch). `DIAL_MAP` :823 führt die Dials auf beide Wege, die Achsen
   unterscheiden sich aber (neckFrac, legFrac, torsoW, eyeFront gegenüber neckLen, legLen, build, diet).
9. `MOTION` :69–81 und `VERHALTEN.aktionen` :100–115 — Haltung und Aktion **für alle Arten gleich**.

### Stellwerte ohne Anker (Auswahl, alle wirken im Bild)
- Glied-Verhältnisse **für jede Art gleich**: Humerus 1,0 · Radius 1,45 · Metacarpus 0,91 · Femur 1,27 · Tibia 1,73 ·
  Metatarsus 1,18 (je × legLen·H). Gelenkwinkel 25°/10°/15°/35°/45°/5°. Belege: `bauTier` :4474–4672 (hum :4474, rad
  :4510, meta :4537, fem :4587, tib :4643, metaT :4671), wiederholt in `fellStreu` :983–1077.
  Wolf, Hirsch und Bär haben also dieselbe Bein-Gliederung; es ändern sich nur die Gesamtlänge (leg) und die Dicke.
  `ARCHETYPES.segRatio` (:409, :436, :474) existiert, `bauTier` liest es aber nie.
  Das Schreiten auf Zehen, Sohle oder Huf ist **nur** die Fußform (`baueFuss` :4413), keine Skelett-Achse.
- Fell-Dichten linear in build: gDens 30 000 + 30 000·build, uDens 15 000 + 14 000·build, Haarlängen :876–881.
  Mähne = 2000·diet :880. Kiefer-Länge als Stufe aus diet :4963. Fänge ab diet > 0,25 :4910.
- Rumpf: Schulter 0,438·H·lang, Hüfte −0,483·H·lang :4277–4278. Hals-Radius (0,05 + 0,085·build)·dicke :4749.
- Hunderte Kopf- und Pfoten-Literale × H (`bauTier` :4863–5078). Sie sind alle relativ zu H, also isometrisch.
- Gang: tastgrad 0,65, maxWinkel 0,42 rad, hub 0,12 :1342–1349 (mit Zitat, aber gleich für jede Art).
  STEUER tempo 0,34, sprint 3,0 :1619–1623 — ein Wert für alle Arten.

## (3) GRÖSSEN MIT EINHEIT — lesbar für ein Erbe- oder Evolutions-Gesetz

**Vorhanden** (Zahl mit Einheit, oder dimensionslos und klar definiert):
- Länge: `MASSSTAB.meterJeEinheit` 1/3 m :3943. Widerrist-Soll in m `ANATOMIE_SOLL.widerristM` :4046–4055. Die
  Hüft-Höhe L in m misst der Wirt (`tierBaum.beinL` tetrapoda.js:160).
- Dichte 1000 kg/m³ :3943, daraus die Masse in kg (Wolf 64 · Fuchs 15 · Hirsch 94 · Bär 335 bei Größe 1, laut :163–165).
- g = 9,81 m/s² :1332. Froude-Schwellen 0,5 / 2,5 :1376–1377. Tempo, Sprint, Wende und Beschleunigung in Froude-Einheiten :1618–1626.
- Masse-Exponenten Biss ⅔, Haut ⅓, Leben ⅔ :3959. Allometrie-Exponenten 0,67 und 0,25 :851, :865.
- Magen 0,2 × Masse in kg, fressSec 60 s, verdauSec 600 s :175–181. Durst 1200 s :2099. Ruhe-Takt 360 s :2126–2129.
- Bestand: kopfJeHa 25, geburt 0,1 und tod 0,2 je taktS 10 s :2197–2208. Diese Raten gelten pro Gattung, nicht pro Individuum.
- Fluchtdistanz in m :1998. Witterung 50 m :151.

**Fehlen** (kein Feld, keine Formel gelesen):
- Genom oder Merkmals-Vektor je Individuum. Es gibt nur netId → bodySize.
- Alter. Die Klasse „klein“ heißt laut :256 „Jungtier/Zwerg“, ist aber ein Wurf und kein Lebensalter. Wachstumskurve.
- Geschlecht. Dimorphismus (Geweih fehlt ganz; `horns` und `crest` gibt es nur in `buildSkeleton` :782–814).
- Stoffwechsel (Kleiber m^¾), Lebensdauer, Generationszeit, Wurfgröße und Fruchtbarkeit je Masse. Die Geburt hängt an der Art und an K.
- Knochen- und Muskelquerschnitt in Abhängigkeit von der Last (Schwerkraft: g steht nur im Gang). Eine Statik nach
  McMahon (Durchmesser ∝ Länge^1,5) fehlt. Ein Riese hat dieselbe Beindicke relativ zu H wie ein Zwerg.
- Körpertemperatur und Klima: Fell-Länge über Bergmann und Allen fehlt; `fell.lang` ist ein Art-Literal :3984.
- Planeten-Schwere als Eingang des Bauplans: `gangZahl(Z,"g")` liest die Schwere nur für den Gang :1414.
- Verwandtschaft, Stammbaum. `STAMMBAUM` :5339 ist nur das Studio-Etikett.

**Kandidat für den Merkmals-Vektor**, aus dem der ganze Bauplan folgen könnte (abgeleitet aus dem, was schon gelesen wird):
- Masse m (kg) oder die Länge des Bezugs-Leibs. Dazu die Schwere g des Planeten.
- diet (0..1).
- Lokomotions-Achse: Glied-Gliederung (proximal zu distal) und Fußstellung — Sohle, Zehe oder Huf als stetiges Maß statt als Wort.
- Rumpf-Form (Statur/build plus eine Wirbelsäulen-Achse vom Wiesel zum Bär).
- Hals- und Kopf-Anteil (neck, Schädel).
- Fell (Länge aus dem Klima, Muster-Gene: Sattel, Bauch und Läufe als Kontraste).
- Sozialität (Gruppe), Aktivitäts-Phase, Furcht.

Heute verteilen sich diese Achsen auf 5 Dials (:62), auf ART_GESTALT (Wörter und Profile) und auf 6 Verhaltens-Tabellen
mit dem Gattungs-String als Schlüssel.

## (4) NAHT — die EINE Eintritts-Stelle

**tetrapoda-core.js:839 `deriveTierParams(d)`**

- **Was heute dort steht**: Fünf Dials kommen herein. Ihre Quelle ist `GATTUNGEN[recId]`
  (foundry-core.js:8176; stamm `_ofenKreaturDials` koerper-leib.js:1023–1032, darüber eine Werkstatt-Prägung je Gattung
  :1010–1016). Fehlt ein Dial, gilt der Wolf (:844–848). Daraus entstehen ~25 Größen. Über `artGestalt` (:868) wird
  wieder auf eine der 4 Tabellen-Arten zurückgemischt (:4062–4085). Liegt der Vektor weit weg von allen, trägt die
  nächste Art allein (:4079).
- **Wer liest es**:
  - `bauTier` :4265 (also jedes Teil des Leibs);
  - `bakeTierInstance` foundry-core.js:8178 (Materialfarben cB, cD, cL, Auge, Fell-Zeilen :8288);
  - `fellStreu` :929 (über P);
  - `fellFarbe` :4135, `tierAuge` :4117;
  - das Labor tetrapoda.js:146.
  
  Danach lesen Gang, Masse, Kampf und Temperament die **gegossene** Gestalt: L aus `tierBeinMass` :3054, die Masse aus
  dem Volumen.
- **Was die Naht heute NICHT erreicht** (sie müsste mitziehen, sonst entsteht ein Zwilling):
  1. Das Individuum. `_ofenKreaturKey` (koerper-leib.js:1035) merkt sich das Template je recId|lod|dials. Jede Kreatur
     ist ein Klon (:2474) mit `scale = bodySize` (kreatur-verhalten.js:597). Ein Genom je Individuum muss also entweder
     als Dials in den Schlüssel (dann ein Bake je Individuum) oder als Skalen-Achse gleich nach dem Klon eintreten.
  2. Das Mechanik-Skelett `_tetrapodaSoulParts` → `buildSkeleton` + `ARCHETYPES` (koerper-leib.js:2422ff.). Es liest
     `DIAL_MAP` und nicht `deriveTierParams` — ein zweiter Leser derselben Dials.
  3. Die Verhaltens-Tabellen mit dem Gattungs-String als Schlüssel :289, :1998, :2077, :2125 und
     `temperamentDerGattung` :1959 (das liest `g.diet` und kg und wäre damit schon vektor-fähig).

## (5) PREIS

- Budget je Ofen-Stufe :45–46. **L0: 62 000 Tris, Band-Ziel 20 000, 8 Draws je Tier und Pass. L1: 7 000 Tris, Band 3 000,
  5 Draws**, ab 35 m × Körpergröße. Die Tris gelten laut :29–30 „über alle Gattungen × 16 Gestalten“ (die Ratsche aus
  gate:asset-contract). Die Zahl je einzelner Art habe ich nicht gemessen.
- Fell: die alte Strähnen-Streu kostete 205 000 Dreiecke je Wolf (foundry-core.js:8279, gefallen). Die alte
  Labor-Streu hatte 1,3 Mio. Instanzen (tetrapoda.js:55, gefallen). Eine Fell-Schale am Wolf kostete 4 477 Dreiecke
  (foundry-core.js:9049).
- Individuum: ein Klon mit geteilter Geometrie und geteiltem Material, **~1 ms** (koerper-leib.js:2474).
  Takt und Bild: an der GTX bei 50 Tieren +42 / +25 Befehle, Render **6,0 → 11,4–13,0 ms** (kreatur-leben.js:2792). Darum
  gibt es den Tier-Satz (`nahLeiber` als Leib, der Rest als Satz).
- **Was mit der Zahl der Arten wächst**:
  - je Art 2 Templates (L0 + L1) im Speicher;
  - je Art ein Bake (Ofen `bakeTierInstance` + `__tierFellSchalen`);
  - die IDB-Platte nur für die unveränderte Gattung (`istDefault` koerper-leib.js:1030);
  - die Draws je Art multiplizieren sich, weil Klone verschiedener Arten keine Geometrie teilen.
  
  Mit der Zahl der Individuen wächst heute nur der Klon. Bekäme jedes Individuum eine eigene Gestalt, liefe je
  Individuum ein Bake — ein Preis, den keine Quelle nennt.
- Bake-ms je Art, MB je Template, Takt-ms je Tier ohne die 50-Tiere-Zahl: **nicht gefunden** (siehe OFFEN).

## (6) OFFEN

- Bake-Dauer (ms) und Speicher (MB) eines Tier-Templates, L0 und L1: Ich habe keine Quelle oder Messung gelesen.
  Nicht gelesen sind auch foundry-core.js 8300–9265 (Rest des Gusses, `__tierFellSchalen`) und `_ofenKreaturTemplate`.
- Tris je einzelner Art an main: Ich kenne nur das Budget :45. Ob die 62 000 noch überschritten sind („offen, solange
  tris darüber liegt“ :31), habe ich nicht gemessen.
- Wie die Stamm-Leser von Bestand, Ethogramm, Lebensraum und Jagd den Gattungs-Schlüssel verwenden, also wie viele
  Stellen `"wolf"`/`"deer"` als String führen: nicht gelesen (stamm/kreatur-leben.js, kreatur-verhalten.js ganz).
- Ob `_leibMasse` das Volumen der L0-Haut oder eine Näherung misst, und ob es bodySize³ exakt trägt: nur die Aufrufe
  gelesen, nicht die Funktion.
- `CREATURE_SKELETON_G` (welche Archetypen je Seele) und `CREATURE_SOULS` (Tags und Stats aus bodyParts): nicht gelesen.
  Ob der Mechanik-Körper sichtbar vom Bild-Körper abweicht (Treffer, Stand), ist offen.
- Karte 2 (`origin/koordination:vision/meisterkarte-2.json`) habe ich nicht gelesen. Die Zuordnung der Befunde zu den
  Sprossen von leben.tiere.* fehlt deshalb.
