# Lesen: was MENGE kostet (Arten × Individuen) — main 18058dba, nur gelesen

Gelesen: stamm/koerper-leib.js 1–120, 1000–1440, 2140–2620 · stamm/kreatur-leben.js 84–226, 1867–2016, 2100–3120, 3690–3836 ·
stamm/stoff-gang.js 1–310, 600–640 · stamm/stoff-karte.js 200–600 · stamm/siedlung-bauten.js 1–130 · stamm/siedlung-bewohner.js
1200–1260 · stamm/stoff-instanz.js 1–120, 2478–2492 · tetrapoda-core.js 30–430, 1331–1345, 2060–2240, 3930–4000 ·
phyto-core.js 2240–2370, 3640–3750 · foundry-core.js 495–655, 3062–3082 · koerper-core.js 1640–1700 · REGELN.md (Preis-Treppe).

## (1) WAS TRÄGT — Gesetze, die heute im Spiel konsumiert werden

- **Masse aus Gestalt** — kg = Volumen der Haut (m³) × ρ 1000 kg/m³ × Größe³: `_bestandKg` kreatur-leben.js:2344, Volumen je
  Gattung `_gattungLeib` :2358, Leib `leibV` koerper-leib.js:2524; ρ tetrapoda-core.js:3943. Leser: Temperament
  (`_bestandWild` :2347), Jagd-Beute (`_bestandJagd` :2165, beuteMasse 2,0 tetrapoda-core.js:166), Kampf (KAMPF ∝ m^⅔, :3956).
- **Bestand logistisch** (Verhulst) + Riss Holling III + Fraß — `_kreaturBestand` kreatur-leben.js:2114, Takt `_bestandTakt` :2401,
  Gesetz tetrapoda-core.js:2197–2236. Kosten an Bewegung: Aufholen ~0,25 ms je Takt (kreatur-leben.js:3728).
- **Lebensraum Art × Boden-Klasse** — `lebensraum`/`bodenKlasse` tetrapoda-core.js:2085–2095, Leser `_bestandFeld` kreatur-leben.js:2318.
- **Gang aus Froude** — GANG_GESETZ g 9,81 tetrapoda-core.js:1331; Tier-Satz backt Bänder an Froude 0,25/1,5/4
  (kreatur-leben.js:3747), Tempo √(Fr·g·beinL) :3019.
- **Gestalt-Mischraum der Arten** — ART_GESTALT (Profil je Art, Gauß-Gewichte über 5 Dials, „Regler gleiten stetig zwischen
  ihnen") tetrapoda-core.js:3960–3973; konsumiert über den Guss `BAKER.kreatur(core, recId, 0, lod, d.dials)` koerper-leib.js:1304.
- **Leib-Raum des Menschen (SMPL)** — EINE Vorlage je Mengen-Stufe + Formziel-Tafel, je Instanz ein Punkt auf ~10+BAU Achsen
  (koerper-core.js:1652–1690), GPU-Knoten `raum.weg(a)` stoff-gang.js:608, Leser `_gangSatz(... raum: true)` siedlung-bewohner.js:1233.
  Genom → Achsen: `_rollHumanoidGenome` koerper-leib.js:10, Skelett `bauWurf` koerper-core.js:1643. **Für Tiere fehlt das** (s. 4).
- **Gras-Arten nach Ellenberg** (L, F) als Tint je Büschel — WIESEN_ARTEN foundry-core.js:3069–3079: Art = Instanz-Attribut,
  kostet je Art 0 Befehle. Das einzige Art-Gesetz, das heute nicht mit der Artenzahl Geometrie kauft.
- **Tier-Satz** (Lehre 23) — Befehle hängen nicht an der Kopfzahl: `_tickTierSatz` kreatur-leben.js:2800, `_gangSatz` stoff-gang.js:16.
- **Budget-Gesetz am Ofen-Ausgang** — `budgetErzwingen` je Art × Stufe, `_ofenBudget` koerper-leib.js:1418.

## (2) WÜRFE UND TABELLEN

Würfe ohne Gesetz:
- **Körpergröße** `_creatureBodySize` koerper-leib.js:2545 — Hash der netId → vier Bänder (tetrapoda-core.js:253–260: 0,6–2,7,
  Masse ×91). Im Bestand doppelt gewürfelt: Saat = `"b"+key+"."+floor(rng()*1e9)` kreatur-leben.js:1999. Beim Spawn ohne
  opts.bodySize hängt sie am Sitzungs-Zähler `"c"+_creatureNetSeq` (:143–149) — Reihenfolge der Spawns, nicht das Tier. Ein
  Neugeborenes (alterS 0, :2003) kann „gigant" sein: Alter und Größe sind entkoppelt, „klein" heißt „Jungtier/Zwerg" (:256).
- **Wurf-Kopfzahl** rng zwischen herde.wurf[min,max] je Gattung kreatur-leben.js:1996, 1873 (Tabelle tetrapoda-core.js:289).
- **Auto-Baumarten**: Patch-Nische „deterministisch aus dem Namens-Hash" phyto-core.js:3678–3684 — Art-Ort ohne Gesetz.
- **Baum-Größe** `forestTreeSize(rng, sd)` und **Mammut-Wurf** phyto-core.js:3712–3721.
- **Größe je Individuum der Pflanze**: nur Skala/rotY/Tint; die Gestalt würfelt aus 1–3 Varianten-Saaten
  `${worldSeed}-${species}-var${i}` vegetation-baum.js:53–55.

Tabellen (je Zeile eine Art, Wachstum linear in der Artenzahl, von Hand):
- GATTUNGEN 4 Zeilen × 5 Dials tetrapoda-core.js:62 · ART_GESTALT je Art :3973ff · LEBENSRAUM gattung + haeufigkeit :2076–2083 ·
  ETHOGRAMM gattung :2129–2134 · herde.wurf :289 · labels :363.
- TETRAPODA_SOUL_MAP koerper-leib.js:3484 · CREATURE_SKELETON_G (Farben, Mats, size „Tarierung") kreatur-leben.js:3518 ·
  CREATURE_SOULS kreatur-leben.js:3567.
- Bäume: 5 Arten fest im Code `baum_kiefer … baum_erle` phyto-core.js:3692–3696; `treePhenotype` schneidet den stetigen Raum
  (api, slim, trop) an Schwellen in 6 barkTypes und holt Farben aus BC/LC-Tafeln phyto-core.js:2309–2343.
- gestalten je Art (eiche 2, weide 1 …) foundry-core.js:639–654; VARIANTS_PER_SPECIES = 3 siedlung-bauten.js:3395 — zwei
  Zahlen für „Individuen-Gestalten je Art" (Foundry vs. Grammatik-Pfad).

Stellwerte ohne Anker:
- `maxCreatures: 20` dirigent-kern.js:280 (neben `currentVersion "7.71"`) — die Kappe der gezeichneten Leiber.
- KREATUR_SATZ nahLeiber 4, cap 256 kreatur-leben.js:3743–3753; OFEN_MEMO_RUHEND 2 koerper-leib.js:1371.
- FAUNA_MAX_AGE_MS „~35 min Echtzeit" für jede Art daten.js:174–176.
- GESTALTEN_JE_REZEPT = 1 tetrapoda-core.js:39: „der Guss ist seed-invariant … eine Seed-Achse ist ein Re-Mint-Akt" — jedes
  Tier einer Art ist dieselbe Gestalt, Individualität = nur Skala.

## (3) GRÖSSEN MIT EINHEIT (lesbar für ein Erbe-Gesetz)

Da: Länge m/Lab-Einheit 1/3 (tetrapoda-core.js:3943) · ρ kg/m³ · Volumen m³ (`leibV`) · Hüft-Höhe m (`beinL` koerper-leib.js:2513) ·
Quer-Maß je Hüft-Höhe (:2353) · Masse kg · jagdKg 21,5 / wehrKg 200 / kolossKg 600 (tetrapoda-core.js:211–213) · g 9,81 m/s² ·
Froude-Bänder · scentRangeM 50 · noticeRadius 22 m · durstS 1200 · ruheTaktS 360 s · verdauSec 600 · magenAnteil 0,2 × kg ·
fleischAnteil 0,6 · Revier 113 m, kopfJeHa 25, taktS 10 s (:2197) · Widerrist je Art (MASSSTAB-Kommentar :3936–3938).
Pflanze: Kronen-Radius m (`F.crown[sp]`), Höhe (treePhenotype in Lab-Werten 2,2–6,0, ohne Einheit), Ellenberg L/F (Indizes).

Fehlt: Stoffwechsel (Kleiber ∝ M^¾) · Lebensspanne/Generationszeit je Art (eine Konstante für alle) · Reife-Alter und
Wachstumskurve (Größe gegen Alter) · Wurfgröße aus Masse/Energie (Tabelle statt Gesetz) · Genom-Vektor und Mutationsrate ·
Verwandtschaft/Stammbaum · Pflanze: Wuchsrate, Samenzahl, Holzdichte als Erbgröße.

## (4) NAHT — die EINE Stelle

**`_ofenKreaturDials(recId, ovOpt)` koerper-leib.js:1022–1032.** Heute: `Object.assign({}, core.GATTUNGEN[recId], buch, ov)` —
die Gestalt einer Art ist eine Zeile der 4-Zeilen-Tafel (+ Werkstatt-Prägung). Leser: der Guss `_ofenKreaturTemplate` :1295 und
sein Memo-Schlüssel `_ofenKreaturKey` :1033 (recId|lod|JSON(dials)), der Boot-Vorrat :2173, der Stand-Vorrat :2247–2248,
die Kost des Bestands `_bestandDiet` kreatur-leben.js:2155, das Temperament `_bestandWild` :2350; über `gussDials` der Tier-Satz
(`_tierSatzFuer` :2955) und der Stand (:163–168).
Was dort NICHT steht und darum mitziehen muss: die Größe (`_creatureBodySize` koerper-leib.js:2545, „Bewusst unmapped: size"
:3493) und die Seelen-Tafel (`TETRAPODA_SOUL_MAP` → recId).
**Preis-Bedingung an der Naht:** der Schlüssel des Gusses ist der ganze Dial-Vektor. Ein Genom, das an dieser Stelle je
Individuum eigene Dials liefert, kauft je Individuum zwei Vorlagen (Guss, Programme, Satz) — die Naht muss die Dials teilen in
(a) einen gequantelten Bauplan-Schlüssel (Gestalt-Klasse, gegossen) und (b) Instanz-Achsen, die der Knoten auf der GPU legt —
das Muster steht für den Menschen (`raum: true`, stoff-gang.js:47–48, 608; koerper-core.js:1652) und fehlt dem Tier-Satz
(`_gangSatz` ohne raum, kreatur-leben.js:2989–3000).

## (5) PREIS

Eine KREATUR-ART heute:
- Guss: 2 Vorlagen (L0, L1) je Art × Prägung. Kalt: 8 Güsse (Mensch, Reh, Wolf, Fuchs × 2) hielten den Faden 7 s
  (koerper-leib.js:2152–2153) → ~0,9 s je Guss; Mensch fein 4,4 s (:1971). Budget L0 62 000 Tris (Band 20 000) / 8 Draws, L1 7 000
  (Band 3 000) / 5 Draws (tetrapoda-core.js:45–46).
- Speicher: zwei Vorlagen ~9,6 MB JS (Mensch, koerper-leib.js:1326–1327); Werkstatt 20 Prägungen: GPU 2,4 → 50,1 MB, 11 → 171
  Geometrien (:1322–1324) ≈ 2,4 MB VRAM je Prägung. Für Tiere ohne eigene Messung.
- Programme: je Gattung ein Vorbau nach dem Bild, GTX 1050 1,4–5,7 s bis der Leib zeichnet (:2270–2272), EINE Gattung zur
  Zeit (:2275); vor dem Knochen-Raster 40 baute jede Knochenzahl ihr Programm: 17 Knoten-Bauten in 36 s (:1051–1056).
- `_gattungLeib` gießt je Gattung einen ganzen Leib, nur um Volumen und Hüfte zu messen (kreatur-leben.js:2358–2365).
- Tier-Satz je Gestalt: bis 4 Senken (fell · glimm · rest · wurf, kreatur-leben.js:2997) = 4 Befehle + Wurf je Kaskade;
  Knochen-Puffer 3·J·(B·N+H)·16 B (stoff-gang.js:217), B 3 · N 32 · J ≤ 40 → ≤ 186 KB; eine Kopie der L1-Ecken (14 Floats je
  Ecke, :105); Backen 150 Einschwing-Schritte + ein Zyklus je Band, 40 Schritte je Takt (kreatur-leben.js:3748–3749), an einem
  eigenen Back-Leib (:2955).

Ein KREATUR-INDIVIDUUM heute:
- Klon ~1 ms (koerper-leib.js:2149), ein Leib ~0,6 ms (kreatur-leben.js:3730); höchstens 3 Leiber je Takt (:3736).
- Als Leib: L0 8 / L1 5 Draws je Pass + Kaskade; 50 Leiber an der GTX: +42/+25 Befehle, Render 6,0 → 11,4–13,0 ms
  (kreatur-leben.js:2791–2792). Im Satz: 0 zusätzliche Befehle, eine Matrix + vec4 (`_gangSatzInstanz` stoff-gang.js:282).
- ABER: auch ein Satz-Tier ist ein ganzer Leib (Group, Skelett-Klon, userData, Verhalten im Takt), nur `visible=false`
  (`_tierSatzEin` kreatur-leben.js:3101); der Satz liest nur `st.creatures` (:2812–2815) — und die sind auf `maxCreatures` 20
  gekappt (:2581, :2663–2666). 10⁴ Individuen im Schirm sind heute strukturell unmöglich; 256 je Senke wären das Dach des Satzes.
- Fern (> 64 m): Glieder-Kapseln im Welt-March, 0 Draws (kreatur-leben.js:3717–3722, tetrapoda-core.js:52–53). Fern ohne Leib:
  der Bestand als Zahl (`{id, g, bs, alterS, x, z}`, :2492–2502) — billig; `_bestandJagd` ist O(n²) je Region (:2171–2175).

Eine PFLANZEN-ART heute:
- je Art × Gestalt (1–2) Körper L0/L1 + EINE Karte (foundry-core.js:630–639); Baum L0 12 000 / L1 2 900 / L2 2 Tris, 2/2/1
  Draws (:504–531); Strauch L1 1 100.
- Karte je Art × Gestalt [× ov]: 0,55 MiB BC / 2,8 MiB rgba8 je Schicht (stoff-karte.js:240–242); der Atlas wächst um 2
  Schichten (:2041); Mess-Wiese 32 Schichten für 18 Karten +4 MB (:281–282).
- Befehle: „Je Art × Gestalt × Stufe × Teil EINE Senke" (vegetation-wiese.js:1219); Jungwuchs als Prägung: 5 → 14 Sätze,
  71 → 129 Befehle binnen 60 m (vegetation-baum.js:1071–1072) ≈ 6,4 Befehle je Satz. Je Alter EIN Körper und EINE Karte je
  Art und Gestalt (vegetation-wiese.js:3179).
- Programme: vor dem geteilten Knoten baute jede Art × Stufe ihr Programm im Bild, Σ 577 ms Radeon / 776 ms GTX
  (stoff-instanz.js:14–18) — jetzt EIN Knoten je Welt.
- Gras: Art = Tint je Büschel (foundry-core.js:3062–3080) — 0 Befehle je Art.

Was mit der ZAHL DER ARTEN wächst (nicht mit dem Schirm):
1. Der Boot-Vorrat gießt JEDE Gattung der Seelen-Tafel in beiden Stufen und zerlegt ihre Glieder (koerper-leib.js:2169–2185) —
   Werk-Zeit ∝ Arten, unabhängig davon, ob eine im Bild steht.
2. Vorlagen, Programme, Satz und Karte je Art × Gestalt × Stufe (s. o.); Memo hält „fest" alle Gattungs-Vorlagen (:2192–2196).
3. Je-Art-Schleifen im Takt: `_kreaturBestand` Zellen × Gattungen (kreatur-leben.js:2131–2139), `_bestandDiet` (:2152).
Hochrechnung (gerechnet, nicht gemessen) 10² Arten im Bild: Tiere 100 × 4 Satz-Befehle = 400 + Wurf; 200 Vorlagen ×
~0,9 s = ~180 s Werk; bei ~4,8 MB je Vorlage ~960 MB Heap gegen „Ort: Heap ≤ 400 MB, VRAM ≤ 256 MB" (REGELN.md:36).
Bäume 100 × 2 Gestalten × 2 Stufen × ~2 Teile ≈ 800 Befehle; 200 Karten × 0,55 = 110 MiB (rgba8: 560 MiB).

Was gelten müsste, damit 10² Arten / 10⁴ Individuen P halten (aus der Lage im Code abgeleitet):
- Die Gestalt eines Tiers als Punkt in EINEM Raum je Bauplan (wie LEIB_RAUM des Menschen): eine Vorlage + Formziel-Tafel je
  Bauplan-Klasse, Art und Individuum als Instanz-Achsen im Knoten — Befehle je Bauplan, nicht je Art.
- Der Tier-Satz liest Individuen aus dem BESTAND (Zahl), nicht aus `st.creatures`; ein Leib (Object3D + Verhalten) nur für die
  `nahLeiber`; die Kappe 20 fällt als Zahl, sie wird die Bedeutungs-Wahl am Schirm.
- Guss nach Bedarf am Schirm (Rang `_foundryRang` existiert, :2190) statt Vorrat über alle Arten; Memo-Grenze in Bytes.
- Farbe/Muster der Art als Instanz-Attribut (das Gras-Muster, der Mensch-Ton `aTon` stoff-gang.js:42) statt Stoff je Art.
- Pflanze: Karte je Bauplan-Klasse mit Instanz-Tint/-Proportion, nicht je Art × Gestalt × Alter.

## (6) OFFEN

- Gemessener Heap/VRAM einer TIER-Vorlage (die 9,6 MB stehen für den Menschen); Tris einer gegossenen Tier-L0 gegen das Budget.
- Ob die je Art geklonten Satz-Stoffe (`sk.stoff.clone()` stoff-gang.js:111, Knoten der Seite geteilt) ein Programm teilen
  oder je Art eines bauen — r184-Cache-Schlüssel nicht gelesen.
- Die Kosten des Verhaltens-Takts je Leib (`updateCreatures`, kreatur-verhalten.js) nicht ganz gelesen; nur die Raten-Leiter :2571.
- Glieder-Vorrat `_gliederBestellen` / studio-glieder.js nicht gelesen (Kosten je Gattung).
- Ob Buch-Ingest je Rezept (Art) Arbeit kostet (studio-bruecke.js nicht gelesen); der Pflanzen-Guss-ms je Art steht nirgends.
- VARIANTS_PER_SPECIES 3 gegen gestalten 1–2: welcher Pfad im Spiel zählt (Grammatik nur im Boot-Spalt, siedlung-bauten.js:18–25).
- Karte 2 / PFLICHT-OFFEN: keine Sprosse und kein Eintrag nennen die Arten-Menge als Preis; die Ort-Zeile der Treppe kennt
  „10³ Leiber", keine Artenzahl (REGELN.md:36).
