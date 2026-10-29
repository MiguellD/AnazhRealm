# DER STUDIO-VERTRAG (Manifest v1.2) — NORMATIV

**EINE Pipeline für alle Schöpfer-Labore.** Dieses Dokument ist der eingefrorene
Vertrag zwischen einem Studio (einer Vorlagedatei des Schöpfers) und AnazhRealm
(dem Nervensystem). Es beschreibt die Pipeline, die zuerst für die Pflanzen gebaut
und bewiesen wurde, als Norm für jede Domäne: Pflanzen · Fahrzeuge · Tore · Klingen ·
Bauwerke/Dörfer · Kreaturen/Avatare · Klang · Gelände. Die Chronik der Vertrags-Akte trägt
`git log -- docs/studio-vertrag.md`.

**Der Leitsatz (das Ribosom):** das Nervensystem kennt keine Fahrzeuge, keine
Tore, keine Bäume — es kennt den CODE: `kind + rezepte + build + placement +
params + lehren + verhalten`. Eine Maschine, viele Bücher. Wer eine neue Domäne
integriert, schreibt KEINEN neuen Import-Pfad — er erfüllt diesen Vertrag und
dockt an den EINEN an.

Wächter: `npm run gate:studio-vertrag` (`scripts/diag-studio-vertrag.cjs`, im
`check`-Gate) — validiert jeden registrierten Kern GEGEN diesen Vertrag und
beweist sich selbst (injizierte Verletzung → rot).

---

## §1 Die Anatomie eines Studios (deskriptiv)

Jede Vorlagedatei des Schöpfers trägt dieselben fünf Organe — das ist die
gemessene Handschrift aller drei existierenden Vorlagen (phytogenesis v38 ·
garage.txt · Portal.txt):

1. **P-Vektor** — die Regler (Parameter mit Grenzen und Bedeutung).
2. **PRESETS** — benannte Gattungen (eingefrorene P-Punkte + Ausstattung).
3. **LEHREN** — Gesetze mit Toleranzbändern, die das Gebaute BEURTEILEN
   (der sichtbare Richter: da Vinci Δ · Radstand/Länge · Stich→Schub→Dicke).
4. **build(P)** — der deterministische Bau: derselbe Seed ⇒ dasselbe Werk.
5. **VERHALTEN** — die Verben der Domäne (wachsen/Wind · fahren · Türen öffnen).

Der Vertrag macht aus diesen Organen MASCHINENLESBARE Blöcke (§3).

## §2 Das Kern-Gesetz — EINE Quelle, zwei Leser

**G2.1** Die generative Substanz eines Studios lebt in EINER reinen Kern-Datei
(`foundry-core.js`-Klasse: klassisches Skript, Top-Level-Globals, kein
Framework-Zwang im Manifest-Teil). Die Labor-Shell (das begehbare Portal) und
AnazhRealm (der Foundry-Worker) lesen DIESELBE Datei — ein Edit fließt in
beide, ein Nachbau ist verboten (Verfassungs-Gesetz #0, `gate:constitution`).

**G2.2** Die Naht ist das Float32-Attribut: `build` liefert Geometrie als
typisierte Arrays (Positionen/Normalen/Farben/Indizes) — kein Szenegraph, kein
Renderer-Objekt quert die Naht.

**G2.3** Der Kern ist DETERMINISTISCH: alle Zufälligkeit fließt aus dem
`seed`-Argument (mulberry32-Klasse); `Math.random`/`Date.now` sind im Bau-Pfad
verboten (Γ5-Stream-Gesetz der Hauptwelt, hier gespiegelt).

## §3 Die sechs Manifest-Blöcke

Ein Kern erfüllt den Vertrag, wenn er die MUSS-Blöcke trägt; SOLL-Blöcke sind
pro Domäne deklariert (§6-Matrix). Alle Blöcke sind DATEN (JSON-fähig), außer
B2 (die Bau-Funktion).

### B1 — REZEPTE (MUSS)

Ein Top-Level-Objekt `PRESETS`: `{ <rezeptId>: Rezept }`.

- `rezeptId` ∈ `[a-z0-9_-]+` (der Namensraum; die Welt leitet Blueprint-Namen
  daraus ab: `baum_<id>`, `fahrzeug_<id>`, `tor_<id>` …).
- Jedes Rezept trägt **`kind`** (MUSS, string) — der EINE Dispatch-Schlüssel.
  Registrierte kinds v1: `tree · shrub · flower · grass · rock` (gebaut);
  reserviert: `vehicle · gate · building · creature`.
- `s` (SOLL): der Dial-Vektor (P-Punkt des Presets) — Zahlen.
- `fx` (DARF): domänen-eigene Ausstattung (frei, must-ignore §4).

### B2 — BUILD (MUSS)

`buildInstance(rezeptId, seed, lod, ov?)` — die EINE Bau-Funktion.

- Deterministisch (G2.3), LOD-gestuft: **die LOD-Grade sind Studio-eigen**
  (0 fein · 1 mittel · 2 grob/Impostor · 3 NUR-WURF) — AnazhRealm erfindet keine LODs, es
  RUFT sie.
- **Die Stufe 3 ist NUR-WURF (S3 haus):** `kindStages` tragen Stufen 0..3; eine Stufe 3 trägt in ihrer
  Budget-Zeile `nurWurf: true` und wird NIE gezeigt — der Wirt serviert sie keinem Distanz-Wunsch
  (`_foundryDeclaredStage` überspringt sie, der Wurf- und Fern-Ruf nennt sie beim Namen). Sie wirft für die Art (B2c
  `schatten`) und trägt die Fernform (`fernform: "huelle"`: ihre Liste reist als Beipack `__fern` in der Hüllen-Form N5) —
  außer die Art trägt ihre Ferne im Gesetz (`fernform: "gesetz"`, die Gelenk-Gestalt `koerper`): dann wirft sie nur (mensch.K1
  Staffel 2: der Wurf des Bewohner-Satzes, `_bewohnerSatz`), ohne `__fern`.
  Ihr Stoff ist der EINE Schatten-Stoff (`material.userData.__stoff = "schatten"` — die Brücke reicht ihn als kind
  `schatten`, dieselbe Material-Identität wie der Schatten-Teil der Baum-L1; jede Ecke `aDeckt` 1). Eine Stufe 3 ohne
  `nurWurf` ist rot (`gate:studio-vertrag`). Träger: koerper `koerper` [0,1,2,3] (fernform gesetz), fachwerk `haus` [0,1,2,3] und `ausstattung` [0,1,3], porta `gate`
  [0,3] (1110-9: die gezeigte Stufe 0 wirft nicht mehr selbst — die Karten-Linse zählt NUR-WURF-Stufen nicht als gezeigt).
- Byte-Beweis: die eingefrorenen Vertrags-Fixtures (`spec/asset-contract/`,
  sha256-Goldens, NIE regenerieren) — jede Domäne bekommt ihren Ordner
  (v1 Pflanzen · v2 Kreatur-Haut · v3 Fahrzeuge · v4 Tore …).

#### B2c — DAS BUDGET je Art × Stufe (SOLL; trägt ein Kern es, dann VOLLSTÄNDIG)

`PORTAL_RENDER_CONFIG.lod.budget = { <kind>: { <stufe>: { tris, draws, schatten, karte?, ab?, wurf?, …Regler }, fernform, hyst? } }` —
was eine GELIEFERTE Stufe kosten darf, als Daten neben `kindStages`.

- **Vollständig:** jede Art aus den eigenen `kindStages` × jede deklarierte Stufe trägt eine Zeile;
  keine Zeile für eine nicht deklarierte Stufe oder Art.
- `tris` (ganze Zahl > 0) = Obergrenze der Dreiecke je Instanz · `draws` (ganze Zahl ≥ 1) = Obergrenze
  der Sippen je Instanz (die EINE Verschmelz-Regel phyto-core `budgetSippe`: Stoff × Attribut-Form × Index —
  der Flatten und die Starr-Bindung des Ofens gruppieren nach ihr, das Gesetz zählt mit ihr = Draws je
  Instanz-Gruppe und Pass) · `schatten` = die Stufe, deren Gestalt wirft (der L0-Baum wirft seine L1, jede gezeigte
  Haus-Stufe die NUR-WURF-Stufe 3), oder `false`.
- **Die Reduktion je Stufe** (pipeline.K3): eine gezeigte Stufe trägt höchstens ihren Anteil der L0-Dreiecke desselben
  Baus — L1 ≤ 0,5, L2 ≤ 0,15 —, je Rezept und an jedem Regler-Rand (`gate:regler-wirkt` STUFEN, `reglerBudget.quote` Soll
  leer); das Tor richtet sie selbst (porta-core.js `baueStufe`: das Kosten-Buch zählt die L0 an denselben Stellen, das
  Gesetz der Stufe vergröbert sich bis zum Anteil), das Haus heilt am Rezept.
  Bei einer GELENK-GESTALT (Tier, Mensch — §8.4) darf `schatten` auf die gelenkige Grobstufe zeigen: sie bindet an das
  Skelett der feinen (EIN Skelett je Gestalt) und wirft für beide Stufen mit ihren eigenen Stoffen (S3, Lehre 19). Ihr
  Umriss trägt den der feinen: die Grobstufe liegt auf dem Gesetz (`__aufsNiveau` — die Glättung zieht sie nicht nach
  innen), der Band `checkBandKreaturKosten` (W) DECKUNG misst den Wurf-Umriss je Pose × Sonne gegen die feine Stufe (IoU ≥ 0,94).
- **`nurWurf: true`** (nur so, nur an einer Stufe 3, B2): die Stufe wird nie gezeigt und wirft selbst (`schatten` = sie
  selbst), nie `karte`. Der Satz-Bau des Wirts legt ihren Zwilling in den Wurf-Satz `bauWurf` seines Schatten-Stoffs
  (`_bauSatzArt`: EIN Befehl je Kaskade für jeden Werfer, im Hauptbild keiner — `gate:chunk-satz` (l)). Haus: Stufe 3 ≤ 96
  Dreiecke in 1 Draw; Ausstattung ≤ 48 (die Feuerstelle ≤ 32) — `gate:haus-fern` misst Kosten und Form.
  **Die Kosten-Regel des Wurfs (1110-9, generisch je Art mit NUR-WURF-Stufe):** geworfen wird von der billigeren Stufe —
  der Wirt nimmt den Zwilling der NUR-WURF-Stufe nur, wo er weniger Dreiecke wirft als die werfenden Teile der gezeigten
  Stufe, sonst wirft sie selbst (`_wurfVonBilligerer` in `_foundryFlattenFor`; die Zeile der Stufe 3 ist das Rezept-Maß,
  am Regler-Rand richtet die Regel — `gate:regler-wirkt` WURF nennt dort Stufe und Kosten).
- **Wurf am Konsum:** der EINE Host-Leser `_foundryBudgetZeile(preset, stufe)` liest `schatten` für jeden
  Foundry-Flat (die eigene Stufe wirft selbst, eine andere reist als Schatten-Zwilling im selben Zug,
  `false` wirft nicht) und für die Nah-Wiese, die Gelenk-Gestalt liest sie über `_ofenZeile` (den Leser von
  `_ofenBudget`; `_gelenkGestalt` → der EINE Stufen-Schalter `_gelenkStufe`) — kein Stufen-Literal im Host; fail-closed (KERN-PFLICHT) bei
  fehlender Zeile — auch bei einer Art ohne Budget: seit W8 trägt jede Art mit Gestalt ihre Zeilen (die
  Wirt-Stufen-Tafel `_WIRT_WURF` ist gefallen, `gate:altlasten`). Ein Zwilling wirft selbst (der Validator hält
  es: kein Zwillings-Kreis).
- **Monoton:** `tris` fällt je Stufe streng, `draws` steigt nie.
- `karte: true` (nur die letzte Stufe, wirft nicht): die Stufe IST die Studio-Karte (bakeImpostorAtlas),
  ihre Gitter-Geometrie wird nicht geliefert; sie gilt genau dort, wo der Wirt die Art als Impostor führt
  (`KIND_POLICY[kind].impostor` — die Karten-Linse in `gate:studio-vertrag`).
- DARF-Regler einer Stufe (Form geprüft): `blattKarte` (Kartenkante in Blatt-Größen, endlich > 0) · `dichte` (je
  Kronen-Art der Anteil der gewachsenen Blattstellen, der eine Karte trägt, in (0, 1] — seit S3 nur noch der Strauch,
  `shrub[0].dichte.laub`; die Baum-Krone wählt über `lagen`) · `lagen` · `quote` · `geruest` · `wedel` · `wurf`
  (die Kronen-Kosten, unten) · `straehne` ({teile ganz ≥ 1, breite > 0}: Stücke je Peitsche, Kartenbreite in Blattlängen —
  die Trauer-Krone in L0 und L1) ·
  `rinde` ({ast, reisig} in trunkR, 0 < reisig < ast < 1) · `schnitt` / `rute` (das Reisig des Strauchs, in
  trunkR, 0 < schnitt < rute < 1: dünnere Stränge als `schnitt` fallen, unter `rute` trägt der Strang die
  Vierkant-Röhre auf jedem 3. Ring) · `boden` (tiefstes Laub in Baumhöhen, [0, 1)) ·
  `deckung` (Band [lo ≤ 1 ≤ hi], in dem die gebaute Krone die der feineren Stufe bedeckt) · `rispe` ({grannen
  ganz ≥ 1, segmente ganz 1..3, breite > 0}: die Rispe des Grases je gelieferter Stufe — Grannen × Segmente und die
  Breite der Granne in Einheiten der vollen; emitGrass liest sie, jede Granne des Individuums zieht ihre Würfe weiter,
  und jede Stufe tastet DIESELBE Kurve der Granne ab — 3 Segmente, nie neu integriert, nie verfeinert).
- DARF-Felder der Gelenk-Gestalt (S3, Form geprüft): `ab` (an einer Stufe außer der ersten, endlich > 0, streng
  steigend über die Stufen) = ab `ab` m × Körpergröße trägt die Stufe das Bild — die Gestalt liest es beim Bau, jeder
  Leser fragt die Gestalt (die Wirts-Distanzen TIER_FERN_DIST_SQ · MENSCH_FERN_DIST_SQ fielen) · `hyst` (Art-Ebene,
  0 < hyst < 0,5) = die Hysterese dieser Grenze (fern erst jenseits (1+h)·ab, zurück erst innerhalb (1−h)·ab) ·
  `wurf.seh` (nur an einer selbst werfenden Stufe; eine nicht-leere Teilmenge von phyto-core `BUDGET_GESETZ.seh`) =
  der werfende Teil der Stufe nach Seh-Klasse (Tier `["haar"]`, Mensch `["haut", "stoff", "haar"]`); der Rest
  der Stufe wirft nie. `wurf` ist EINE Zeile in zwei Formen: die Gelenk-Gestalt nennt ihren Wurf-Teil nach Seh-Klasse
  (`wurf.seh` — ihre Teile sind geskinnt und werfen mit dem eigenen Stoff), der Baum als eigenes Gitter (`wurf.teil`
  "schatten" mit `tris` und `lagen`, E1 — unten bei den Kronen-Kosten); der Validator prüft beide in EINER Regel
  (nur eine selbst werfende Stufe nennt einen Wurf-Teil).
- **Die Gras-Zeile (S3) ist aus dem Haushalt abgeleitet:** die Nah-Wiese der Welt zeichnet an der Mess-Wiese
  höchstens 57 066 Dreiecke (Ratsche des Profi-Bands, je Blick ≤ 80 000) — `grass[1]` 1 220 (L1 0–5 m, Rispe 6 × 2:
  der Federbusch — der Halm-Kontrast der Wiesen-Linse trägt die Zahl der Grannen) und `grass[2]` 130 (L2 5–14 m, EINE Granne, die Sehne
  der Kurve) statt der gemessenen Hülle 1 700/320; die Halme bleiben byte-gleich, die Breite der Granne ist an der
  Bild-Deckung geeicht (Ährchen-Anteil der Pixel, 8 Blicke).
- `band` (DARF, ganze Zahl > 0 und < `tris`): das Profi-Band-Ziel der Stufe (Haushalt), solange die
  gebaute Hülle `tris` darüber liegt — offen und benannt, die Wand druckt den Faktor; erreicht die Stufe
  das Band, fällt das Feld und `tris` IST das Band. `tris` bleibt die Ratsche (darf nur fallen).
- `gestalten` (je Rezept, ganze Zahl ≥ 1): wie viele Individuen (Samen 1..V) die Welt von einem Rezept
  trägt (`_foundryVariantFor`). Der Haupt-Kern trägt dazu die `'*'`-Zeile (jede Pflanzen-/Fels-Art ohne
  eigene Zeile); ein Zweit-Kern zählt JEDES eigene Rezept selbst, kein fremdes, keine `'*'`-Zeile (W8:
  das Wirts-16 gehört dem Gesetzbuch). **V Gestalten sind V verschiedene Individuen (S3):** ein Rezept, dessen
  Bau den Samen nicht liest (seed-invariant), zählt EINE Gestalt — mehr nur mit bewiesener Seed-Achse; eine Achse zu
  schaffen ist ein Re-Mint-Akt des Kerns, nie eine Zahl in der Zeile. Die Wand: `gate:asset-contract` baut je Art und
  Rezept mit V ≥ 2 JEDE Gestalt 1..V über die echte Brücke (die Zweit-Kerne aus dem Bau des Kosten-Zugs) und verlangt V
  verschiedene Bau-Abdrücke — jeder Zwilling steht beim Namen („Gestalten-Lüge: vehicle-Rezept gt (8 von 16 verschieden:
  1=9, …)“; Selbsttests: drachentor mit V 2 und gt mit V + 1 MÜSSEN rot werden). Seed-invariant und darum je
  Rezept 1: porta · schmiede · tetrapoda · koerper; das Fahrzeug trägt EINE Achse, den Lack je Same (`lackIndex`, reihum
  über acht Lacke) — es zählt 8 (`GESTALTEN_JE_REZEPT` = die Lacke ohne Clay); fachwerk (Haus 16, Ausstattung 2/3/2)
  zeigt V von V.
- **Das Budget-Gesetz (W8, phyto-core `budgetErzwingen`):** der EINE Ausgang jeder Zweit-Kern-Gestalt —
  die Brücke (`__replyBuildAsset`) UND der Sync-Guss des Wirts-Ofens (`_ofenBudget`, Tier + Mensch)
  falten eine Stufe über `draws` auf ihre Zeile: Stoffe (der Wirts-Material-Schlüssel `budgetStoff`; die
  Farbe reist als Vertex-Farbe) fallen innerhalb ihrer Bindungs-Klasse (starr · Haut · je Tür-Flügel ·
  Schalen-Fell) UND ihrer Seh-Klasse zusammen, der kleinere in den nächsten (Rauheit · Metall · Art · Seite …);
  Glut faltet nie, ein glimmender Stoff nie in einen ohne Glimmen; Flügel-Teile werden je Flügel × Stoff EIN
  Teil (das Scharnier reist mit). Innerhalb der Zeile ist es ein No-op (byte-gleich). Dreiecke faltet es nicht:
  über `tris` oder bleibend über `draws` reist ein `budgetBruch` mit, der Wirt loggt ERROR, die Wand wird rot —
  nie still.
- **Der Flügel am Scharnier (K08):** ein Tür- oder Tor-Flügel reist als Gruppe, deren Position das Scharnier ist
  (`userData.side`, bei gebackener Offen-Pose `offen`); sein Gitter liegt relativ zu ihr. Der Extraktor liest das
  Scharnier aus der Gruppen-Position (`out.tuer` hx/zf) und bakt die Lage über matrixWorld, der Wirt dreht um
  dieselbe Achse (`_tickTorFluegel`: T(h)·R·T(−h)). Ein haus-lokal gebakter Flügel rückt vor dem Ausgang um sein
  Scharnier zurück (fachwerk `buildStufe`) — sonst steht er um seine Scharnier-Lage vor der Fassade
  (`gate:haus-fern` T: jedes Blatt ≤ 0,05 m an seinem Scharnier, L0 offen und zugedreht, L1 im Bake).
- **Die Seh-Klasse (Integration W8):** was ein Stoff dem AUGE ist — `stoff` (Holz · Putz · Stein ·
  Textil · Gummi) · `haut` (Haut, Lippe, Nase, Ballen) · `haar` (Haar · Fell · Strähne) · `auge` (Augapfel ·
  Iris · Pupille · Hornhaut) · `glas` (Glas, Durchscheinendes) · `metall` (Metallizität ≥ 0,5: Chrom, Stahl,
  Metall-Lack) · `glut` (Lichtquelle, faltet nie); die Liste ist `BUDGET_GESETZ.seh` (phyto-core). Das
  GESETZBUCH stempelt sie an seinen Stoff (`material.userData.__seh`: vehicle/schmiede je Material-Zeile,
  fachwerk je Rolle `SEH_DER_ROLLE`, porta im Tor-Bau, tetrapoda/koerper je Material-Klasse `seh`, der
  Ofen-Bäcker in foundry-core für Fell/Haut/Haar/Kleid), beide Extraktoren reichen sie als `mat.seh`; sie gehört
  zur Stoff-Identität (`budgetStoff` …`|v:<seh>`). Ein Stoff ohne Seh-Klasse ist ein `budgetBruch`. Die
  Zeilen sind das gemessene Minimum über alle Gestalten: haus 11/4/3 · koerper 8/6 · kreatur 8/5 · gate 13 ·
  vehicle 12 · weapon 4 (`gate:asset-contract`, Seh-Wand an Mensch · Wolf · SUV · Haus · Tor).
- **Transport:** jeder Zweit-Kern reist sein `lod.budget` unter `cfg.lod.zusatzBudget[<id>]` (neben
  `zusatzKindStages`, N7.5); der EINE Merge `kerneVereinen` (phyto-core, gerufen NUR in
  `_foundryIngestRenderConfig`) legt die Zeilen je Art und die Gestalten je Rezept disjunkt first-wins in
  `lod.budget`.
- **Konsum:** `gate:asset-contract` baut jede gelieferte Gitter-Stufe über die echte Brücke (Goldens +
  jedes Rezept der Art bei Samen 7 + jede Gestalt der Welt, die Samen 1..V aus `gestalten`; jedes Zweit-Kern-Rezept
  über JEDEN Samen 1..V seiner Gestalten) und hält Dreiecke ≤ `tris`, Draws ≤ `draws` (phyto-core `budgetSippen`,
  die Regel des Wirts) — Rot nennt den Täter; Selbsttests: jede Zeile halbiert (und `draws` um eins gesenkt) MUSS
  rot werden, ohne `zusatzBudget` fehlt das Budget für alle sechs Zweit-Kerne, je Zweit-Art liegt ≥ 1 Fall
  ungefaltet über `draws` (die Faltung ist der Konsument). Im Wirt: `gate:sippen-wirt` (im Spiel: Gesetz-Draws und
  -Dreiecke == die Leaves des Wirts für jede Art mit Budget auf jeder Geometrie-Stufe, Flatten und Ofen),
  `gate:portal-gestalt` (das Tor kommt auf `gate[0].draws` an, ≤ 8 Flügel-Slots) und der Band `checkBandKreaturKosten` (Ofen-Guss). Die Deckung misst er an
  gebauten L0/L1-Paaren als Verhältnis der BILD-Deckung (`scripts/lib/kronen-linse.cjs`, S7: die Silhouette gerastert in 24 Ansichten — acht Azimute ×
  Blick-Hebung 0°/30°/60° von unten —, Karten mit der Alpha des EINEN Atlas, ein Pixel zählt einmal; die
  Flächen-Summe von gestern sah keine Überlappung und meldete 0,99, wo das Bild 0,76 zeigte); eine 1,5-fache
  L0-Karte MUSS das Band sprengen. Je Baum-L0 (Goldens und Gestalten) hängt jede Karte an ihrer Rinde oder an
  einer hängenden Karte (SCHWEBE) und kein Laub liegt unter dem Boden der Vorlage (BODEN); eine L0 ohne Rinde MUSS
  schweben, eine abgesenkte Krone MUSS unter dem Boden liegen.
- **`fernform`** je Art (Pflicht, kein Stufen-Schlüssel; nie `fern` — der Name der Farn-Art): was die Art
  jenseits der Nah-Grenze des Wirts IST (`AnazhRealm.ANALOG_NAH_M`, 64 m — diesseits trägt ihr Mesh) — `"karte"` (ihre
  Karten-Stufe; genau dann, wenn die letzte Stufe `karte: true` trägt), `"gesetz"` (ihr Satz im
  Welt-March: die Passung der Studio-Gestalt als Primitive, 0 Draws, kein Schatten-Wurf), `"boden"`
  (keine Geometrie, die Boden-Funktion trägt die Farbe) oder `"huelle"` (S3: die Liste der NUR-WURF-Stufe in der
  Hüllen-Form N5 — PFLICHT dann eine Stufe mit `nurWurf`, und ihr Bau trägt den Beipack `__fern`; der EINE Host-Leser
  `_huelleVon` legt die Teile in den Welt-March (`_archFoundryZiegel`), fail-closed: fehlt `__fern`, bricht die Art
  (KERN-PFLICHT), nie ein Box-Fit-Rückfall; die Streu trägt `huelle` nicht und bricht laut). foundry-core: tree/shrub
  `karte` · flower/rock `gesetz` · grass `boden`; fachwerk: haus/ausstattung `huelle`; porta: gate `huelle` (1110-9, vorher
  `gesetz` — der Box-Fit der Stufe 0).
  **Die Haus-Karte ist FINAL GESTRICHEN** (S3, E7): das Befehle-Ziel (karten 37 → ≤ 2) trägt seit W6 der Bau-Satz, eine
  Karte zeigte bei 26–64 m Parallaxe; die Fernstufe des Hauses ist die grundriss-treue L2, jenseits 64 m die Hülle. Kein Builder liest sie. Pflicht am Konsum: der Host-Leser
  (`_foundryFernForm`) liest sie im Zellen-Chokepoint VOR jedem Mesh-Zug und bricht fail-closed
  (KERN-PFLICHT), wo eine gestreute Art sie nicht trägt — der Validator verlangt sie je Budget-Art; eine `gesetz`-Zelle, deren Satz nicht steht
  (Fit-Takt, erschöpfte Kapsel-Liste), WARTET ohne Geometrie — nie das Mesh-L0 (`gate:streu-fern`).
- **Die Baum-L0 (W5 — das Soll-Bild zuerst, Lehre 18).** Befund (Lab, echte GPU, Samen 1/2/7/12345):
  die L0 trug 77–207k Dreiecke je Baum, 70–80 % davon Einzel-Klingen (28 Dreiecke je Blatt, eine Klinge von
  ~1,4 m Welt-Länge las auf Armlänge als Riesenblatt), die Weide 68–117k Rinde in Peitschen und Reisig.
  Haushalt: Baum L0/L1+Werfer 150k über Hauptbild + k0 + k1 der Mess-Wiese; bei den Studio-Distanzen
  (W5 rechnete mit d0 = 20 m; S7 misst 20/40 in derselben Welt teurer und rot — das Studio trägt 12/26, der Host-Umweg
  `LOD_TRI_BUDGET_MUL` ist gefallen) stehen dort 14 L0-Bäume
  (4 Eichen, 2 Birken, 5 Tannen, 2 Fichten, 1 Weide) → **10 714 Dreiecke je L0-Baum, trüge die L0 den Haushalt
  allein**. Das Soll-Bild je Art (SpeedTree/UE-Praxis: Laub-Cluster-Karten mit Alpha, Rinde mit wenigen Ringen
  und Vertex-Farbe/AO, Silhouette vor Einzelblatt):
    - **Laub (Eiche, Birke):** Cluster-Karten aus den Breitblatt-Zellen des EINEN Atlas auf 45 % der
      gewachsenen Blattstellen, Kante 2,52 Blattgrößen (L1: 21 % mit 3,69) — Deckung 0,99 der Klingen;
    - **Nadel (Fichte, Tanne, Mammut):** Nadel-Karten aus der Nadel-Zelle auf 12 % der Nadeln, Kante 1,65
      Nadellängen (L1: 2,65 % mit 3,5) — Deckung 1,01 der Nadel-Röhren;
    - **Trauer (Weide):** Strähnen — so W5; der Prüfer sah sie ohne Peitsche in der Luft hängen und unter den
      Boden-Rand reichen (R1), S7 baut sie neu (unten);
    - **Rinde:** so W5 — die Stränge unter 0,03–0,05·trunkR fielen samt den Zweigen, die Karten trugen (R2: Fichte
      656 von 1406, Mammut 541 von 905 Karten ohne Zweig); S7 (unten);
    - **Strauch:** seit Welle 6 eine Kette wie der Baum (`kindStages.shrub` [0, 1, 2]): die Nahstufe
      `shrub[0]` (bis d0 12 m) ist die alte Stufe Byte für Byte (Samen 1 8 612, Samen 7 7 096 Dreiecke — der Golden
      `strauch-s7-L0` trägt die Fingerabdrücke des alten `strauch-s7-L1`) und trägt die Kronen-Zeile beider Stufen;
      die Mittelstufe `shrub[1]` (12–26 m) dieselben Karten, das Holz ab 0,35·trunkR als Vierkant auf jedem 3. Ring
      (1 020 / 1 040 ≤ 1 100); beide werfen die Mittelstufe. Mess-Wiese (Band-Klasse busch): 121k → 34k Dreiecke.
      Die Stufe hat EINE Bedeutung: `stufenRezept` (foundry-core, gelesen von deriveParamsPlant und emitTree) bildet
      Stufe 0 und 1 auf das Rezept 1 ab, die Holz-Zeile ist die Stufe — der Labor-Knopf L0 baut byte-gleich die
      Welt-L0 (vorher die Klingen-Krone, 175 016 Dreiecke); die Stufen-Wand in `gate:altlasten` hält es.
      Gebogene Normalen (Kronen-Normale, Vorderseite nach außen) wurden im Lab gemessen und verworfen: der
      Doppelseiten-Stoff ohne Durchlicht färbte die Unteransicht dunkel (8-m-Blick unter der Eiche L* 23,2 → 14,0)
      und setzte Glanzspitzen. Das Soll-Bild braucht höchstens 17,3k (Tanne s2, Eiche s2 17,2k): **`tree[0]` =
      18 000 Dreiecke, 3 Sippen, wirft seine L1** — die Zeile liegt offen 1,68× über dem Haushalts-Anteil, das
      L0-Band der Mess-Wiese verschiebt sich auf ~209k (vorher bei 20 m 2,16 M, bei den alten 12 m 647k); der
      L1-Überhang (46 Bäume × ≤ 10k + Werfer) ist nicht diese Zeile.
- **Die Nahkrone hängt an ihrem Träger (S7).** Jedes gewachsene Blatt kennt seinen Lauf (`run`,
  growSkeleton); jede gehaltene Karte und Strähne macht ihren Lauf und jeden Vorfahr zum TRÄGER — er wird gebaut,
  ein Strang unter `rinde.ast`·trunkR ohne Träger fällt ganz (kein kahler Stock, keine schwebende Karte). Die Rinde
  unter `rinde.ast` (0,4) trägt jeden 2. Ring, unter `rinde.reisig` (0,1) jeden 3. (mindestens Erst und Letzt),
  beide in der Radial-Teilung der L1 (die L2-Vierkant las auf Armlänge als Brett). Die Wurzel-Primärstränge laufen
  weiter und tauchen ab (zwei Ringe, der letzte unter dem Boden) statt stumpf zu enden. Die Weide: je Peitsche EINE
  Strähne (`pushStraehne`) — zwei Stücke entlang der gewachsenen Bahn (die Biegung je Segment zur Lotrechten ist das
  Gravitations-Gesetz des Wuchses), je Stück zwei gekreuzte Karten aus der unteren Hälfte der Nadel-Zelle, längs
  gestreckt (der Fächer feiner Striche hängt vom Ansatz des Stücks herab und liest als schmale hängende Weidenblätter;
  die ganze Zelle las als Stern, die Breitblatt-Rosette als Rosette), 0,72 Blattlängen breit,
  nie unter `boden`·Baumhöhe; jede L0-Karte, die unter y = 0 reicht, fällt. Geeicht an der BILD-Deckung: die L0
  deckt 0,96–1,01 (Laub, `blattKarte` 3,1 auf `dichte.laub` 0,42), 1,22–1,31 (Nadel, `nadelKarte` 1,85 — die
  Nadel-Röhren von gestern deckten unter ihrer eigenen L1, die L1 deckt die L0 jetzt im Band) und 1,04–1,17 (Weide)
  der L0 von gestern; L1/L0 1,00–1,12. Dreiecke höchstens 17 720 (Tanne s2). Gemessen mit SCHWEBE: 0 von 41 404 Karten
  in 34 Baum-L0 (Goldens + Gestalten).
- **Die Kronen-Kosten (S3 — Vertrags-Akt, Pflicht in `gate:studio-vertrag`, Wände in `gate:asset-contract`).**
  Befund (Kern V18.536, kronen-linse 24 Ansichten): die Zeile war nur gegen die sättigende BINÄRE Deckung geeicht —
  die Laub-L0 trug 35–72 Quad-Lagen je Kronen-Pixel (jede Lage alpha-getestet und schattiert, 65 % ihrer Fragmente
  verworfen), die L1 24–47 und war die ausgedünnte L0 (Quote 0,46–0,71), der Nadel-Ast eine Röhre unter radialen
  Nadel-Sprays (Koniferen-L0 78–80 % Rinde), der Wurf ein Index-Vorsatz zweier Teile. Die Baum-Zeilen tragen:
    - `lagen` (tree[0] 16 · tree[1] 13): Quad-Lagen je Kronen-Pixel (kronen-linse `bildLagen`) — der BAU-REGLER der
      Karten-Wahl (`__lagenWahl`: phyto-core `kronenLagen` schätzt die volle Krone, die Stufe trägt 0,82·lagen davon
      im Index-Stride; die Trauer-Krone wählt ihre Peitschen über `quadLagen`) UND die Wand (L). Das Soll der L1 (12)
      steigt offen auf 13: mit 12 deckte die Laub-L1 von unten (60°) im Mittel 0,90–0,94 ihres Bilds von V18.536, die
      Weiden-L1 0,86 (Gegenprüfung R1, Bild-Tafel);
    - `quote` (tree[1] 0,35, K20): Dreiecke L1 / L0 derselben KRONE (Q) — Laub ≤ 0,26, Koniferen ≤ 0,35; im Kronenraum (ab
      dem tiefsten Ast-Ansatz) trägt der L1-Stamm nur seine Bahn (Mammut 0,371 → 0,346). Ein Baum ohne Krone (Totholz) ist in der
      L1 nie Gerüst + Karte — die Quote gilt ihm nicht (unten: sein Gerüst);
    - `geruest` (tree[0] 0,1 · tree[1] 0,25 trunkR): die Stufe trägt als Röhre nur Stränge ab geruest·trunkR — jeder
      feinere Strang ist seine Karte (das Atlas-Bild ist ein belaubter Zweig) bzw. Strähne. Ein Baum OHNE Krone (Totholz)
      hat keine Karte, die ihn trüge: seine L1 trägt jeden Strang ab einem Bild-Pixel an der Nahkante (STUFEN_BILD_PX) —
      mit dem Gerüst ab 0,25·trunkR verlor das Totholz-L1 bis 16 % seiner Ansicht;
    - `wedel` ({ab, teile, breite, nadel, rand, winkel, spalte, holz}; tree[0] {0,35, 1, 1,65, 0,016 m, 0,5, 40°, 1,25, 0,15}
      · tree[1] {0, 2, 2,03, 0,045 m, 0,3, 40°, 1,5, 0,15}): der Nadel-Ast (jeder Seitenast des Leittriebs) ist bis `ab` seiner Bahn Röhre
      und läuft dort spitz aus; sein Wedel — Strähnen aus der Wedel-Zelle (`BLATT_ATLAS_WEDEL`, Zelle 3, Füllung 0,2742: ein Fichten-Zweig aus Büscheln mit Gräten, L2-n1),
      mindestens `teile` und so viele Stücke, dass die Nadel in der Welt `nadel` misst — trägt die ganze Bahn: je Stück so
      breit wie die Hülle seiner Nadel-Wolke (Abstand zur Bahn + `rand` × Nadel-Größe, unter 45° um ihre Stelle) ×
      `breite`, vom Röhren-Ende bis zur Spitze in Kette (mindestens der Saum `rand` × Nadel-Größe: kein Stück schwebt).
      Die Nadel-Wolke ist rund um den Ast (Flaschenbürste) — die zwei Karten kreuzen ±`winkel` aus der Lotrechten (L2: bei
      ±10°/±5° stand jede Karte von unten auf der Kante und las als Strich); ein Stück, dessen Hülle breiter reicht als
      `spalte` × seine Länge, trägt die Zelle in Spalten nebeneinander — nie quer gestreckt (die L0 trug Karten 2,3–6,5 × so
      breit wie lang: die Zweiglein lasen als gerade Striche, Soll-Tafel laub-kante 0,33 → 0,21); der
      Leittrieb trägt seinen Wedel, wo er benadelt ist (die Spitze stand sonst kahl). `holz` ist der Anteil des Holzes
      (das Mittel der Rinden-Farben des Baums) an der Farbe des Wedels — die Nadel deckt in der Zelle ihr Holz zu 99,9 %,
      die Karte war ohne Holz um ΔE 2,4–5,2 heller und grüner; geeicht an der Kronenfarbe der Karten von V18.536. Was am
      Ast wächst, fällt mit ihm; die Nadel-Karte (`nadelKarte`) und der Blatt-Stride der Laub-L0 (`dichte.laub`) sind
      gefallen;
    - `straehne.holz` (tree[0] 0 · tree[1] 0,06): der Holz-Anteil an der Farbe der Trauer-Strähne — die L1 trägt die
      Peitsche samt ihrem Ast unter 0,25·trunkR (die Weiden-Karte war ohne ihn um ΔE 2,2–2,5 grüner);
    - `blattKarte` (tree[0] 4,0 · tree[1] 2,2) und `straehne.breite` der L1 (0,95) sind an der Bild-Tafel geeicht (die
      Laub-L1 deckte mit 1,8 im Mittel 0,84–0,92 ihres Bilds von V18.536, die Weiden-L1 mit 0,52 0,81–0,87);
    - `wurf` (tree[1] {durchmesserM 0,17, teil "schatten", lagen 12, tris 1 200}) — DAS EINE WURF-GESETZ (E1): die Stufe,
      auf die `schatten` zeigt, liefert ihren Wurf als EIGENES Teil `teil: "schatten"` mit dem Attribut `aDeckt` (Rinde 1,
      Karte 0): das Gerüst ab `durchmesserM` Welt-Durchmesser (der Kaskaden-Texel k0) als Dreikant mit der mittleren
      Breite des Rundstrangs (Umkreis 2π/(3√3)·r) und die Karten bzw. Strähnen der Krone auf höchstens `lagen` Lagen.
      Der Wirt zeichnet das Teil mit EINEM Schatten-Stoff (Alpha = max(aDeckt, Atlas-Alpha) in colorNode, beidseitig)
      nur auf SHADOW_TWIN_LAYER, jedes andere Teil der Stufe wirft nicht; fehlt das Teil, KERN-PFLICHT. Der drawRange-
      Vorsatz (`__wurf`, `lf.wurf`) ist gefallen. Mit 6 Lagen deckte der Wurf von oben 61 % des L1-Bilds (Eiche), mit 12
      81–94 % — die Zeile trägt 12. Haus (Stufe 3, aDeckt 1) liest dasselbe Gesetz; die Gelenk-Gestalt liest dieselbe
      Zeile in ihrer Seh-Form (`wurf.seh`, oben bei den DARF-Feldern: ihre Grobstufe wirft auf SHADOW_TWIN_LAYER).
    - Die Zeilen: `tree[0].tris` 18 000 → 12 000 (Soll 9 000 — die Birke trägt 10 954–11 924: das Lentizellen-Gitter mit
      seinen Naht-Ringen, die die Armlänge braucht — ohne sie fiel die Stamm-Albedo auf 0,291 < 0,30; Laub 4 886–7 526,
      Koniferen 5 188–6 412, Weide 6 474–8 842), `tree[1].tris` 10 000 → 2 900 (Soll 2 400 — die Birke 2 690–2 782, der
      Mammut 2 308–2 448; jede andere Art ≤ 2 034), `draws` 3 → 2 (die Birken-Wurzel trägt den Birken-Stoff).
    - DIE BILD-TAFEL (Wand D, Gegenprüfung R1; gemünzt V18.536, neu im Vertrags-Akt K20 — die Bäume tragen ihr Welt-Maß):
      `spec/asset-contract/v1/bild-tafel.json` trägt je Baum-Art × Same
      L0 und L1 je Blick-Hebung (0°/30°/60° von unten, je acht Azimute; das Bild über dem Boden der Vorlage — die Wurzeln
      im Boden sieht kein Spieler) und die Studio-Karte (Deckung, Kronenfarbe). Je Art hält das Mittel der Gestalten je
      Stufe und Hebung und die Deckung der Karten 0,92–1,08, jede Gestalt 0,85–1,15; die Kronenfarbe der Karten je Art im
      Mittel ΔE76 ≤ 2, je Gestalt ≤ 4 (V18.536 zeigte zwischen dünnen Sprays je Gestalt verschieden viel Holz). Das
      Mittel der 24 Ansichten (D0) sah die Seitenansicht mit einem Drittel: die Koniferen-L1 verlor 30–32 % ihrer
      Seitenansicht, die Karte 22–25 %, ohne dass eine Wand anschlug.
    - Die Pixel-Gesetze der L1 (ihre Nahkante: 704 px je Baumhöhe; die L0 beginnt auf Armlänge, dort trägt jedes Merkmal):
      die Radial-Teilung folgt dem Umriss (Sehnen-Abstand ≤ ½ px) und trägt mindestens zwei Seiten je Furche; die
      Birken-Zeile ist ein Band nur ab 2 px, ihre Naht ab 1 px; die L1-Wurzel liegt in der Radial-Teilung der L2.
    - **FINAL GESTRICHEN (S3):** die Fels-L1 — `formationen` an der Mess-Wiese 3/20 Befehle, 10 240/30 000 Dreiecke,
      Genesis 3 / 14 720, Fels-L0 320–1 280 je Stein: eine L1 spart < 3k, `kindStages.rock` bleibt [0] (der Validator
      hält es) · `budgetErzwingen` für Pflanzen — die Zeile IST der Bau-Regler, `gate:asset-contract` die Wand, ein
      Ausgangs-Falten wäre ein Zwilling (`gate:studio-vertrag`: der Ruf lebt nur im Zweit-Kern-Zweig der Brücke) · die
      Seh-Klasse `laub` — ihr einziger Leser wäre dieses Falten (Konsum 0); `BUDGET_GESETZ.seh` trägt sie nicht.
- **Der EINE Blatt-Atlas als Textur** (`bakeLeafAtlasBild`, phyto-core): die gemalte Leinwand blutet (nicht
  deckende Texel tragen das Zell-Mittel statt Schwarz), alle Zellen tragen dasselbe lineare Mittel `wert`,
  die Mip-Kette ist die des Karten-Gesetzes (`impostorMips`, die vier Zellen als Ansichten nebeneinander: je Stufe
  hält derselbe Texel-Anteil die Alpha-Schwelle 0,5 — S7, ein Mip-Gesetz für jede Karte); jeder Leser teilt die
  Atlas-Farbe durch `wert` — die Karten-Albedo ist im Mittel die Vertex-Farbe (FARB-GESETZ), wie die Klinge. Das
  Bild malt der Foundry-Worker und reicht es mit dem Buch (Transfer); der Haupt-Thread malt nur, wer vor dem Buch
  fragt. Gemessen (Lab, Albedo-Sicht): die Nadel-Karte las vorher mit 47 % ihrer Albedo, die Nadel-Deckung fiel
  auf Mip-Stufe 4 von 0,24 auf 0,14.
- Es tragen: foundry-core (tree · shrub · grass · flower · rock · gestalten) und alle sechs Zweit-Kerne
  (vehicle · gate · weapon · haus · koerper · kreatur); klang trägt keine Gestalt und kein Budget.

#### N5 — DIE EINE HÜLLEN-FORM (NORMATIV, S3 haus)

`{ stufe, teile: [ { art: "box" | "keil" | "kapsel", c, h | a, b, r, first?, walm?, farbe?, rolle } ] }` — die Gestalt
eines Gesetzbuchs als Primitive, asset-lokal (Vorlagen-Raum, Meter), JEDE Zahl auf dem Raster 2^-12 (Plattform-gleich).

- `box`: der Kasten `c ± h` (Mitte, Halbmaße — je drei Zahlen).
- `keil`: der Halbkeil `c ± h`, oben geschnitten von der Ebene vom First (die Kante `first` ∈ `"+x"` · `"-x"` · `"+z"` ·
  `"-z"`, volle Höhe) zur Gegenkante (Höhe 0); ein Satteldach sind zwei Keile, deren Firste sich treffen. `walm`
  (0..1, fehlt = 0) schneidet die zwei Stirnen quer zum First mit derselben Neigung: von (1 − walm) der Höhe an der Stirn
  bis zum First, der um walm × Tiefe kürzer wird (walm 1 über einem Quadrat: die Pyramide).
- `kapsel`: die Strecke `a → b` mit Radius `r` (Kuppel, Rundbau, Zwiebel).
- `farbe` (linear, drei Zahlen): Pflicht für jedes sichtbare Teil; `rolle` trennt die Leser der EINEN Liste: `"fest"`
  (die Kollision), `"sicht"` (das Fernbild des Welt-March — höchstens 24 Teile je Liste, die Kosten-Grenze: je Pixel
  läuft der March über alle Teile seines Eintrags), `"wurf"` (nur die NUR-WURF-Stufe: ihr Gitter ist die GANZE Liste, der
  March liest das Teil nie — das Tor, 1110-9: das Geflecht als Band, Steine, Hölzer) oder `"beide"` (fest und sicht).
- **EINE Quelle je Gesetzbuch:** die reine Kern-Funktion `huelle(rezeptId, seed, ov)` (fachwerk: der grundriss-treue
  Fernkörper `koerperListe`, die Ausstattung aus ihrer Grundform, das Tor aus `buildGate`, das sie im selben Lauf wie
  seine Meshes sammelt); dieselbe Liste trägt die NUR-WURF-Stufe als Beipack
  `__fern`, und ihr Gitter IST diese Liste. Die Kollision (`__huelle`, Welle L) trägt dieselbe Form (rolle `fest`).
- **EIN Transport:** die Beipack-Karte der Foundry-Antwort (`FOUNDRY_BEIPACK`: `__huelle` → `huelle`, `__fern` → `fern`
  am Flat). **EIN Leser:** `_huelleVon(h, rolle, quelle)` (prüft die Form, fail-closed), die Kollision
  (`_hausHuelleSetzen`/`_hausBlockerBoxen`, rolle `fest`) und der Welt-March (`_archFoundryZiegel` →
  `_huelleMarchDefs`, rolle `sicht`: Kasten, Keil Typ 2..5 + 0,49 · walm, Kapsel — das WGSL `sdKeil`/`gradKeil`).
- **Das Maß des Baums (K20):** jeder gewachsene Bau (Rezept-Art Baum oder Strauch) trägt den Beipack `__mass`
  (`{ schaftHub }`, Vorlagen-Einheiten: der Hub, um den der Schaft die Krone über ihre Form-Höhe trägt; 0 ohne Welt-Maß) —
  `FOUNDRY_BEIPACK` `__mass` → `_mass`; der EINE Leser `_foundryGruppenHoehe` misst die Sichthöhe der SSE-Stufenwahl ohne
  ihn, fail-closed (KERN-PFLICHT).
- **Der Kamin des Hauses (B3c):** die Hülle `__huelle` eines Hauses trägt additiv `kamin` (`[x, y, z]` haus-lokal auf dem
  Raster, die Spitze des Stapels aus `kaminSpitze` — derselben Formel wie der Slot des Exports; `null` = kein Kamin); der EINE
  Leser `_hausHuelleSetzen` gibt sie dem Eintrag ohne Spitze aus einem Export (Vorschau, KI) — der Wirt baut kein Haus, um sie
  zu finden (`gate:stand-takt` ORT).
- **Die Tür des Hauses (bauen.K5):** ebenso trägt die Hülle additiv `tuer` (die Tür-Zeile aus `tuerZeile` — derselben Formel wie
  der Slot des Exports: Haustür, Hintertür, Kern W/D; `null` = keine Haustür); `_hausHuelleSetzen` gibt sie dem gesetzten Haus,
  der Tür-Takt öffnet seine Tür wie die des Dorfs (`gate:werkstatt-weg` L-VERBEN).
- Wände: `gate:haus-fern` (Form, Kosten, innen am Kern), `gate:tor-fern` (das Tor: Fernbild ≤ 24 sicht-Teile ohne
  wurf-Teil durch den EINEN Leser, Wurf-Deckung, innen — über die Regler-Hülle), `gate:studio-vertrag` (B2/B2c/fernform), `gate:asset-contract`
  (die NUR-WURF-Stufe gebaut über die Brücke: `__fern` in der Form, Dreiecke ≤ Zeile).

### B3 — PLACEMENT (SOLL)

Ein Block `PORTAL_RENDER_CONFIG.placement`: wie oft, wo, wie groß.

- v1-Felder (Pflanzen, gebaut): `scale` (Welt-Skala je Rezept, Zahl > 0),
  `rarity` (Spawn-Dämpfung je Rezept, 0 < r ≤ 1), `treeScaleMul`.
- Domänen erweitern ihn (must-ignore): Fahrzeuge/Bauwerke z. B.
  `sites: "settlement"`, Tore `sites: "shrine"`. Fehlt der Block, ist die
  Domäne „deliberate" (nur Katalog/Werkstatt, kein Worldgen-Streuen).
- **Schichten-Gesetz (USD-Lehre):** Welt-seitige Anpassungen leben ÜBER dem
  Template-Block (eigene Override-Schicht), sie mutieren ihn NIE — die Vorlage
  bleibt byte-heilig; der Live-Read gewinnt gegen jeden Spiegel (der
  Mutation-wins-Beweis, `gate:nervensystem` C).

### B4 — PARAMS_BY_KIND (SOLL; ab Domäne `vehicle` MUSS) · **v1.2: DIE EINE FORM**

Die Regler-Definitionen als DATEN (die HDA-Lehre) — **als MAP je kind**:
`PARAMS_BY_KIND = { <kind>: [{ id, lab, min, max, step, def?, grp?, law?, dyn?, uniform? }] }`.

- **v1.2 (SYNERGIE-WELLE):** das flache `PARAMS`-Array (kind implizit
  aus dem ersten Rezept des Kerns geraten) ist GEFALLEN — JEDER Kern (auch ein
  Ein-Kind-Kern) exportiert die Map. EIN Export-Dialekt, EINE Brücken-Assembly
  (`__mergeParamsMap`, first-wins je kind), Multi-Kind-Kerne (der Primär-Kern:
  tree/flower/grass/rock) tragen mehrere Einträge. Kein zweiter Dialekt.
- Der Host (Werkstatt) baut die Regler-UI GENERISCH daraus — kein
  hartkodiertes Slider-Panel pro Domäne.
- `law` ist der Ein-Satz-Lehrsatz am Regler (Anzeige, nicht Logik).
- `uniform: true` (studios.K2) erklärt die Zeile zum GESETZ-WERT: sie bewegt kein Bau-Byte (Byte-Beweis: ihr Schlüssel
  `kern:art:id` steht in `reglerGesetz` mit ihrem Leser, `gate:studio-vertrag` prüft es), der Leser nimmt sie live (Membran-Uniform, Sequenzer,
  Fahr-Gesetz). Die Hülle wendet sie im nächsten Bild an (`nachRuhe(ids, false)` ohne Ruhe, die Ruhe schreibt nur den
  Rückgängig-Schritt); der Griff zeigt sie ≤ 200 ms, jede andere Zeile baut neu und zeigt sich ≤ 1 s
  (`diag-studio-huelle --engine`, die Gang-Probe). `dyn` bleibt die Fahr-Dynamik (kein Neubau in der Garage).
- **Jede Zeile wirkt** (Studio-Welle S1, `gate:regler-wirkt`): der Werkstatt-Wert liegt in `ws.studioOv[preset]`
  als `{id: wert}` und reist über die EINE Vorschau-Quelle (`_workshopStudioPreviewFrom`). Die Mesh-Arten baut
  die Foundry (`ov {id: wert}` über build-asset); die MESHFREI-Arten (§8: koerper · kreatur · klang) gießt der
  Host-Ofen der Werkstatt (`_workshopOvenPreview`) — koerper reicht den Wert als `dials` in den Mensch-Bäcker,
  kreatur in die Gattungs-Dials, klang hat keinen Gestalt-Bäcker (kein Guss, der Leser wäre die Musik). Die Linse
  misst je Art an dem Kanal, den die Vorschau nimmt, und urteilt am BILD (studios.K1): das Bild des Baus (`bauBild`,
  scripts/lib/asset-worker-harness.cjs — die Vorschau-Pose, das Belichtungs-Gesetz der Welt) muss sich an mindestens 1 %
  der Gestalt-Pixel um mehr als 18 Luma bewegen, ein Hash allein zählt nie; eine Art mit Leser der Welt (Tor · Wagen ·
  Klang) wirkt auch dort (Membran · Ritt · Ohr). Eine Zeile, die an keinem Rezept ihrer Art (min und max) Bild oder Leser
  bewegt, ist tot und steht beim Namen in `spec/vertraege/ratsche.json` (`reglerTot`, die Liste schrumpft nur, Soll 0). Ein Bau, der mit dem Wert bricht (wirft, leer, NaN, Not-Körper), ist rot; ein
  Rand-Wert über der Budget-Zeile (B2c) steht in `reglerBudget` (Soll 0).
- **Die EINE Klemme** (KI K2): ein Programm prägt sein Werk mit `ov` als fünftem Argument von `spawn_studio`; der EINE
  Stempel `_studioStampFor` klemmt jede Zahl am Vertrag ihrer Art (`_reglerKlemme`: [min, max], ganze Schritte gerundet,
  jede Klemme beim Namen im Log), ein Regler ohne Zeile oder ein Wert ohne Zahl schließt die Tat (fail-closed). Dieselbe
  Klemme trägt die Studio-Übergabe (dort fällt Fremdes, must-ignore); der Prompt der KI nennt die Zeilen aus derselben
  Quelle (`_studioWordsForPrompt`). Jede Art des Vertrags ist sagbar: eine Art mit Bauplan baut oder wächst (Blume und Gras
  als Natur-Bauplan aus der Kraut-Substanz, KIND_POLICY), eine Art mit Werk-Verb (KIND_POLICY `werk`) erscheint als Wesen
  (die Gattung, der Stempel ist ihr Guss) oder prägt ihren lebenden Leser (der Leib des Spielers, der Klang der Welt — der
  EINE Prägungs-Schreiber `_praegungSetzen`, auch für die Übergabe); die Gesetze eines Eintrags (Membran und Hülle des Tors,
  das Fahr-Gesetz) lesen seinen Stempel. Wand: `gate:praegung-welt` (K) — jede Zeile ≠ ohne ov und = das Studio-Werk.

### B5 — LEHREN (SOLL)

Der mitreisende Richter: ein Array
`LEHREN = [{ id, lab, pass: [lo, hi], warn: [lo, hi], hint? }]` + eine
Mess-Funktion `messen(P) → { <lehrenId>: wert }`.

- Damit kann AnazhRealm Varianten BEURTEILEN (Score/Validierung in Werkstatt
  und Auto-Registrierung) — dieselbe Richter-Fläche wie Ω-PHYSIS, aber die
  Bänder kommen aus der Vorlage (der Richter ist sichtbar, Anti-Attrappe).

### B6 — VERHALTEN (SOLL)

Die Verben + Daten-Komponenten der Domäne (die ECS-Lehre: `kind` wählt
Komponenten-SÄTZE, keine Klassen):

- `dsl`: die Wörter, die die begehbare Welt versteht (W12-ready-Handshake —
  gebaut für alle fünf Portale). Das Protokoll richtet die Heimat (`gate:portal-konformanz`, alle 13
  Welten über den echten Weg): die Welt meldet `ready` (ihr Wörterbuch gewinnt, Stufe „nativ"); die
  Heimat schickt `enter` beim load und auf die ERSTE ready (ein Echo je enter bleibt endlich); die Welt
  nimmt nur Nachrichten ihres Eltern-Fensters an (`event.source`); ein Wort kommt flach
  `["w", …args]` oder als `["chain", …]` und wirkt sichtbar (Ereignis ins Journal der Heimat oder
  Zustand der Welt-UI); Esc meldet `exit`. Stumme Einzelwörter und Echo-Welten stehen als Ratsche in
  `spec/vertraege/ratsche.json`.
- Daten-Komponenten je kind, von EXISTIERENDEN Systemen gelesen (kein
  Parallel-System): `vehicle.fahrprofil` — GEBAUT N6: NICHT die rohen
  Regler, sondern die ABGELEITETEN drive-Skalare des Wörterbuchs v1
  (`topSpeedMul/kAcc/kBrake/mass/vmax/spring`, Spiegel-Zensus + `cgH`
  [Schwerpunkt-Höhe aus `cgHeightOf`]), von der Brücke beim Buch-Bau
  aus der EINEN Kern-Formel `exportDrive(P)` (carPhys + FAHR + Federrate)
  gerechnet → `_vehicleProfile` liest DATEN statt zu raten (Abgeleitetes reist
  hier bewusst als Export der SELBEN Formel, nicht als zweite Wahrheit — M3).
  Konsum-Stand (Zensus): `vmax` = der Ritt-Tempo-Anker (Passthrough
  vollendet — vorher Existenz ohne Konsum), `cgH`+`lenkung.radstand` = der
  Beschleunigungs-Nick (die Host-Näherung Sitz/Halbspanne ist Fallback);
  `mass` bleibt BEWUSSTER must-ignore-Reisender (die Welt fährt ihre eigene
  Größen-Achse `_compoundSizeFactor`)
  · `gate.tueren` · `creature.gang` (Phase 5).
- **`FAHR.lenkung` (V18.483, vehicle-core → exportDrive → fahrprofil.lenkung):**
  die Lenk-Gesetze des fahrzeug-eigenen Ritts als Daten
  (`sfK · maxSteer · gripK · driftGripMul · handDecel · kehrV · radstand`) —
  der Wirt fährt damit FAHRZEUG-EIGEN (W/S entlang der Gier, Grip frisst
  Quer-Slip, Shift = Handbremse); ohne `lenkung` byte-alt richtungs-folgend.
- **`ARENA` (V18.483, schmiede-core, Namensraum-Export):** das Arena-Gefühl
  als Daten (`schwung { dauerProSqrtIKg min max hand } · gefuehl { freezeMin/Max
dipMin/Max keRefJ } · bogen { mArrow auszugSec fovZug fovRuhe
minAuszugFrac }`) — Leser `AnazhRealm._arenaGesetz()`, fail-closed
  (Kern-Pflicht: `ARENA_FALLBACK` + `SWING_/BOGEN_LAWS` sind
  GEFALLEN; `MAX_PFEILE` blieb ehrlich Wirts-Deckel). Spiegel-Zensus (V18.486+,
  rein additiv): `schwung` trägt auch die Hieb-GEOMETRIE (`windupFrac
strikeFrac arcHalfRad bladeRadiusM reachBaseM reachMaxM shoulderH`),
  `gefuehl` den Stoß + das Tod-Kippen (`wucht pProKb` — der Stoß ist seit 0710-2 das EINE
  Impuls-Gesetz des Wirts, AnazhRealm.STOSS; `kippDauerSec leichnamSec leichnamSinkSec` — VERTRAGS-AKT Welle LF kampf
ein Tier fällt auf die Flanke, LIEGT `leichnamSec` (90 s, Kreatur-Uhr) und sinkt in der letzten Spanne
  `leichnamSinkSec` (4 s) in die Erde; `kippNachklangSec` (0,35 s, danach war der Leib fort) fiel), `bogen` den Pfeil-Flug (`maxFlugSec
radiusM muendungM`), dazu `guete { faktorVoll faktorLeer }` +
  `gueteFaktor(rezeptId, ov?)` — das Lehren-Urteil der Schmiede als
  Schadens-Faktor; `gueteAnteil(rezeptId, ov?)` (Welle L, additiv) — derselbe
  Lehren-Anteil ∈ [0, 1] als die EINE Güte eines Schmiede-Geräts (Leser
  `computeBlueprintQuality` → Schaden `_heldGueteFaktor`, Werkstoff-Kraft, Equip-Fold). Alle
  Blöcke leben NUR im Gesetzbuch — der Stamm trägt keinen Zahlen-Zwilling
  mehr (ZWILLINGS-ABSENZ-WAND).
  Welle L: `trefferUrteil(m, treffer)` — die Treffer-Physik des Prüfstands
  (Stich · Schnitt · Schlag, KE, Impuls p = mEff·v, Durchdringung, Zone) aus der
  Shell (`landMelee`) in den Kern; Shell UND Welt richten damit (Beweis: 8500/8500
  Prüfstand-Urteile byte-gleich). `kampfMasze` trägt die Messung (`mess`), `zonen`
  die Trefferzonen-Tafel (Kopf 2,4 · Brust 1,5 · Bauch 1,2 · Bein 0,8 · Fuß 0,6),
  tetrapoda `TREFFER_ZONE`/`trefferZone` die Zone je Glied. Gefallen: die Säule
  `schwung.kapselRK/RMin/Y0/Y1` (Treffer gegen die Glieder-Kapseln), die Klemme
  `guete.mEffDmgMin/Max` samt `guete.mEffRefKg` (die Wirkung eines Treffers ist seine
  Energie gegen `gefuehl.keRefJ`, für Schaden UND Hit-Stop), die Wirts-Eichung
  `bogen.zugJouleRef` (E = `ableitenBogen(task).energie`).
  Welle LF kampf (rein additiv — nur wer `treffer.weg` reicht, die Shell reicht ihn nie; Prüfstand byte-gleich):
  `treffer.weg = [xLo, xHi]` ist der Treffer-Weg (m ab dem Knauf, wo die Waffe den Leib auf ihrem Bogen durchquert);
  getroffen wird am Punkt des Wegs, der dem Schlagpunkt `S.impactX` am nächsten liegt. Das Urteil trägt dann `eff`
  (die Wirkung, 1 − 1,4·|x − x_S|/L, Boden 0,25 — das Gesetz der Bambus-Probe; KE × eff, p × √eff) und `ort`
  (`schlagpunkt` nur bei voller Wirkung, sonst die Seite: `griffnah` · `hand` · `spitze`). `buildPfeil()` (rein
  additiv) ist die EINE Gestalt des Pfeils (Schaft, Bodkin-Spitze, Nocke, drei Federn; die Albedo im Vertex nach dem
  FARB-GESETZ, `PFEIL` trägt Masse und Paletten-Hexe) — die Shell und der Wirt (`_pfeilVorlage`) bauen keinen eigenen.
  halten.K3 Staffel 2 (rein additiv): `werkStoff(rezeptId, ov?)` ist der Stoff des Teils, das am Ziel arbeitet (der Werkstoff
  der Gestalt, Holz für Keule und Bogen) — der Wirt zehrt nach der Härte seiner Stoff-Zeile (`_wearPerStrike`);
  `bogenEnergie(rezeptId, ov?)` ist die Pfeil-Energie der präparierten Gestalt samt Prägung — der Schuss des Wirts liest sie
  statt der Aufgabe des Rezepts, `ableitenBogen` rechnet über dieselbe `bogenArbeit` (byte-gleich).
- **`VERHALTEN` (V18.483, tetrapoda-core, Namensraum-Export):** die
  Verhaltens-Seele (`aktionen { <name>: { dauer profil dreh? kopfSweep?
rollAmp/Rate? hop? tempo? } } · stimmung { <lage>: { aktionen[] alle[min,max] } }`)
  — der Wirt wählt/stempelt FNV-deterministisch, der Baum-Gang trägt den
  Overlay. Jede Stimmungs-Aktion MUSS in `aktionen` existieren (Validator).
  Spiegel-Zensus (V18.486+, rein additiv): die KREATUR-SEELE reist —
  `jagd { radius speedBoost strikeCooldownSec damageMul
fearHpFrac triumphWindowSec scentRangeM hetzM pirschSichtM beuteMasse }`
  (VERTRAGS-AKT Welle LF: DIE JAGD SCHLIESST SICH — die Witterung wählt
  die Beute an der Nase, der Gradienten-Schritt `scentProbeM` fiel; das Rudel
  bezieht den Ring `hetzM`, eine Pirsch bleibt bis `pirschSichtM` unbemerkt,
  Beute trägt höchstens `beuteMasse` × die Masse des Jägers — die EINE Masse
  des Leibs in kg, Volumen der Gestalt × `MASSSTAB.dichteKgM3`; Hetze und Flucht
  laufen den Sprint der Gestalt `STEUER_GESETZ.sprint`, `furcht.fleeSpeedBoost`
  fiel) · `furcht`
  (Wariness-Gewichte + Flucht-Radien/-Dauern) · `temperament { gattung
profile }` (VERTRAGS-AKT Welle LF: DAS TEMPERAMENT DER GATTUNG —
  `gattung { fleischDiet pflanzDiet jagdKg wehrKg kolossKg }`, die
  Funktion `temperamentDerGattung(dials, kg, gattung)` liest Ernährung
  und die EINE Masse des Leibs (kg, beim Wirt `_leibMasse`; die Dial-Masse
  size × Größe fiel mit der Vereinigung V18.536); die Substanz-`signaturen` und ihr `floor` fielen, ebenso die
  Substanz-Gewichte der Furcht `boldFromDichte/boldFromHärte/shyFromLebendig` —
  die Natur der Wariness ist `furcht.mutGewicht` × Mut des Temperaments; die
  Tiere sind tag-gleich, Lehre 8) · Gegenwehr-Profile · `wandern`
  (Leine/Schlendern/Emotions-Modulation). Leser
  `AnazhRealm._verhaltenGesetz()` (memoisiert, fail-closed — Kern-Pflicht
die Stamm-Zwillinge `CREATURE_HUNT/CREATURE_NATURE/
TEMPERAMENT_*/CREATURE_CHARAKTER` sind GEFALLEN; die
  ZWILLINGS-ABSENZ-WAND im Validator hält sie draußen).
  Schluss-Welle (V18.489, rein additiv): die letzten neun
  tetrapoda-Heimat-Literale des Stamms sind heimgekehrt — `freude { tempoMul
hopHochM hopBasisM }` · `sprung { impulsProM }` (VERTRAGS-AKT Welle L
gefallen — DAS SPRUNG-GESETZ: die Huepf-Hoehe der Freude ist die
  EINE Quelle eines Sprungs, froh `hopHochM`, sonst `hopBasisM`, der Abflug
  v0 = √(2·g·h) mit `GANG_GESETZ.g` im Wirt `creatureJump`; eine Aktion
  trägt nur `hop: true`, der Abflug in m/s fiel mit) · `groessen[]`
  (Körpergrößen-Bänder) · `separation { raumKugel strength }` (der
  Stamm-Zwilling `CREATURE_SEPARATION` fiel, Absenz-Wand; VERTRAGS-AKT Welle LF
DER PERSÖNLICHE RAUM — je Leib die Körper-Kugel × `raumKugel`, der
  Paar-Raum ist die Summe, der feste Paar-Radius `radiusBaseM` fiel) · `aufgaben`
  (Gefährten-Tempi/Halt-Distanzen — die Stamm-Getter wurden Leser) ·
  `herde { fensterRaum gewicht maxNachbarn }` (Schwarm-Kohäsion; Welle LF: im
  Paar-Raum zieht niemand, der Zug ist das Mittel × Tempo — `minAbstSq`/`fensterSq`
  fielen) · `wasser` (Ufer-Scheu) · (`furcht.neugierStoppM`
  fiel: die Neugier hält am Paar-Raum mit dem Spieler) · `stimmung.schwellen`
  (die Schwellen-DATEN-Zeile der Stimmungs-Tabelle — KEINE Stimmung,
  Validator/Leser überspringen den Schlüssel). Alle Kern-Pflicht
  (Wand je Block ein Feld; alter Kern → Bruch, nie Misch-Gesetz).
  VERTRAGS-AKT V18.489 (schmiede-core, dokumentiert im Export-Block):
  die zehn toten Mess-Exporte (`LEHREN_LAB · MATof · hrc · matHaerte ·
matResilienz · greifkraft · pobZiel · ableitenPick/Graben/Klinge`)
  sind aus dem Namensraum gekürzt — 0 Konsumenten repo-weit, die
  Maschinen leben intern weiter, `buildInstance` byte-unberührt
  (52/52 Goldens; nur die recipes/render-config-Datenkanäle wurden
  per Mint-Mechanik neu gemünzt).
  DER BISS IST DER ANSPRUNG (VERTRAGS-AKT Welle LF kampf): alle drei
  Biss-Wege (Jagd auf den Spieler, Beute, Gegenwehr) springen an
  (`aktionen.pounce`) und beißen, wenn der Kopf der Gestalt den Leib des
  Ziels berührt; die Reichweite ist der Weg des Ansprungs (`pounce.tempo` ×
  `tempoEinheit` × seine Dauer, die Flugzeit des Sprung-Gesetzes), die Hetze
  hält, wo das Maul den Leib erreicht. `jagd.strikeRange` und
  `jagd.pirschStoppM` fielen; `BISS.kopfNeigung` (rein additiv) ist der
  Bereich, in dem der Kopf im Ansprung auf das Ziel zielt, `BISS.rumpfNeigung`
  (rad, wie bodyX) die tiefste Senkung der Front, mit der das Maul einen
  tieferen Leib erreicht; `BISS.masseAnteil` der Anteil der Masse, mit dem der
  Biss stößt. Ein Ansprung erreicht einen Leib nur, wenn dessen Unterkante
  höchstens Kopf + Sprung-Höhe hoch liegt (Wirt `_kreaturBissSpalt`, Nachbesserung 2).
  `KAMPF { refKg biss haut leben }` (rein additiv, Welle LF kampf): Biss, Haut
  und Leben eines Tiers folgen der EINEN Masse seines Leibs gegen die
  Bezugs-Masse `refKg` (der Wolf der Größe 1, 64 kg) mit den Exponenten
  ⅔ · ⅓ · ⅔ (Wirt `computeCreatureStats`; ein Leib ohne Gestalt behält die
  Werte seiner Substanz). Der Snapshot eines Tiers trägt seine Wunde als
  `hpAnteil` (hp/hpMax); ein Stand mit absolutem `hp` (vor der Nachbesserung 2 der Welle LF kampf) gilt gegen
  das Leben vor dem Massen-Gesetz.
- **`STEUER_GESETZ` + `tempoEinheit` · `steuerSchritt` · `ankunftTempo` (Welle L) ·
  `VERBAND_GESETZ` + `verbandZug` · `rudelPlatz` (S6; tetrapoda-core, Namensraum-Export, rein
  additiv — PRESETS/PARAMS unberührt, der v7-Fingerabdruck wandert nicht
  mit):** der EINE Steuer-Schritt je Tier und Takt. `STEUER_GESETZ { tempo
wende beschl brems }` (Froude-dimensionslos über die Hüft-Höhe L, mit
  `GANG_GESETZ.g`) · `tempoEinheit(L)` = tempo·√(g·L) m/s (die Einheit, in
  der VERHALTEN zählt) · `steuerSchritt(z, wx, wz, dt, L)` schreibt
  `z = { gier, v }` fort: die Gier dreht mit der Wendegrenze
  wende·√(g/L) auf den Wunsch (Welt-XZ, m/s) zu, der Leib läuft nur
  vorwärts längs der Gier mit dem Anteil des Wunschs vor ihm, das Tempo
  folgt mit Anfahr- (beschl·g) und Brems-Grenze (brems·g) ·
  `ankunftTempo(rest, vMax)` = min(vMax, √(2·brems·g·rest)) — das
  Ankunfts-Gesetz (wer `rest` m vor seinem Halt steht, wünscht nur das
  Tempo, aus dem er dort steht) · `verbandZug(x, z, vx, vz, tempo, raum,
  glieder, H, out?)` → `{ x, z, n }` — DER VERBAND (S6: der Wurf bindet Rudel
  und Herde, `userData.verband`; die Glieder wählt der Wirt nach dem Verband,
  nie nach Gattung oder Tag): der Wunsch neigt sich um
  `VERBAND_GESETZ.ausrichtung` zum Mittel der Glieder-Wünsche, jenseits des
  Paar-Raums zieht das Glieder-Mittel bis `H.gewicht` × tempo (H =
  VERHALTEN.herde), das Leittier wiegt `leitGewicht`-fach; `VERBAND_GESETZ`
  lebt außerhalb von VERHALTEN (PRESETS und der v7-Fingerabdruck bleiben) ·
  `rudelPlatz(eigen, winkel, out?)` → `{ platz, n, umstellt }` — der Platz
  des Jägers im Rudel auf dem Ring um das Ziel. Rein, THREE-frei. Leser:
  `AnazhRealm._steuerGesetz()` (memoisiert, fail-closed) in
  `updateCreatures` (EIN Schreiber der Gier `rotation.y`), `_kreaturZiel`
  (Ankunft), `_kreaturVerbandZug` (jeder wilde Zweig außer der Jagd) und
  `_kreaturJagdZug` (das Rudel); Linse `gate:kreatur-takt` (gier · herde ·
  abstand · rudel).
- **`GANG_GESETZ.hubForm` (Welle LF, tetrapoda-core, VERTRAGS-AKT an
  `gangFuss` — die Ausgabe `hub` ändert sich für jede Phase im Schwung außer
  dem Scheitel; PRESETS/PARAMS byte-gleich, der v7-Fingerabdruck wandert
  nicht mit, `gangFuss` trägt kein Golden, der EINE Leser ist der Wirt):**
  `gangFuss(ph, S).hub` = sin(Phase)^hubForm (0,5) statt sin(Phase): der Fuß
  hebt steil ab und setzt steil auf. Mit sin hing er ein Drittel des
  Schwungs in den untersten 3 cm und strich dort mit 0,8–1,1 × Leib-Tempo
  über den Boden. Leser: die Pfoten-IK `_animateTierBaum` (Fuß-Ziel in der
  Welt, Halt des stehenden Fußes, Senke auf die Reichweite, Abspreizen +
  ebene Zwei-Knochen-IK); Linsen `gate:tier-gang` · `gate:kreatur-takt`
  (gier · querhang).
- **Die ferne Stufe geht (Welle LF, mit S3 in V18.538 auf EIN Skelett
  gelegt):** die L1-Haut trägt Gelenk-Gewichte wie L0, die starren Teile hängen
  starr an ihren Gelenken, `skinJoints` reist im Beipack — das ist die gelenkige
  Grobstufe der Gelenk-Gestalt (B2c, EIN Ofen-Golden-Akt `*-L1|*` aus S3; der
  Spiegel `_tierFernFolgt` auf ein zweites Skelett fiel, die Grobstufe bindet
  an die Knochen der feinen). Der Wirt wertet jenseits der Stufen-Grenze jedes
  Tier aus, das LÄUFT (`_kreaturLaufTakt` · `_kreaturLaeuft`, die Raten-Leiter
  auf ihrer untersten Stufe); wer steht, ruht (`_gelenkStufe` → `_gelenkRuhe`
  nur für den Stehenden). Linse `gate:kreatur-takt` (ferngang, Täter
  `ferngang` · `ferngang-bindung`).

### B7 — KIND_POLICY: DIE WIRTS-ZEILE EINER ART (SOLL, studios.K5)

Ein Zweit-Kern, dessen Art der Wirt nicht kennt, bringt ihre Wirts-Zeile selbst mit: `KIND_POLICY = { <kind>: { prefix,
substanz: { label, parts } } }` unter seinem Namensraum. `prefix` (`[a-z][a-z0-9]*_`, frei) ist der Bauplan-Namensraum
(`<prefix><rezeptId>`), `substanz` die unsichtbare Judge-Substanz des Bauplans in der Teile-Form des Wirts (je Teil
`shape` · `material` · `position` · `size`; die Gestalt kommt aus `buildInstance`). Die Brücke reicht die Zeilen im Buch-Umschlag
(`kindPolicy`, je Art die Kern-id als `kern`, disjunkt first-wins), der EINE Ingest vereint sie (`_kindPolicyVereinen`) mit den
Wirts-Zeilen zu `AnazhRealm.KIND_POLICY` — jeder Leser (Register, Werkstatt, Wort-Katalog, Präfix-Auflösung) liest dieselbe
Tafel, keine Zeile im Wirt. Disjunkt: eine Art mit Wirts-Zeile (die Verben des Wirts — grown, role, handAxis, donorTool, synchron vor
dem Buch für den Lockstep: tree · shrub · vehicle · gate · weapon · haus) behält sie, die Buch-Zeile fällt laut. Fail-closed je
Zeile (G4.2): Art-Name, Präfix, Substanz — eine kaputte Zeile registriert nichts. Nur `prefix` und `substanz` reisen; eine
Buch-Zeile trägt keine Wirts-Verben (grown · builtIn falsch, placeExtra null — die Platzierung sagt `fx.place`, B3). Der Prompt
der KI nennt die Wörter einer Buch-Art unter ihrem `substanz.label` (`_studioWordsForPrompt`).
Beweis: `gate:nervensystem` E — das neue Gesetzbuch `worlds/neuntes-buch/stele-core.js` (die Stele, kein Spiel-Manifest) steht über
die Werkstatt in der Welt, mit Kosten-Leiste, Stufen-Kette und Speicher-Rundlauf, und der Wirt nennt die Art nie beim Namen; E2 —
dasselbe Werk auf jedem Weg mit dem Bau-Hash der gezeigten Stufe: KI-Satz (`spawn_studio` mit Reglern über `_studioStampFor`),
Foundry (`build-asset` L0–L2), P2P (der Mitspieler baut es byte-gleich), und der Atlas (`npm run atlas -- --find neuntes`)
nennt das Buch als die EINE Quelle der Art.

## §4 Die Empfänger-Gesetze (Taille-Erbe)

Diese vier gelten für JEDEN Leser des Manifests (AnazhRealm heute, P2P-geteilte
Studios morgen) — sie sind die `docs/taille-spec.md`-Gesetze, auf Assets
angewandt:

- **G4.1 must-ignore:** unbekannte Felder und unbekannte `kind`-Werte werden
  IGNORIERT, nie zerstört und nie als Fehler behandelt (ein altes AnazhRealm
  überlebt ein neues Studio; `_foundryAutoRegisterSpecies` registriert nur
  kinds mit einer Zeile in `KIND_POLICY` — der des Wirts oder der ihres Buchs, B7).
- **G4.2 fail-closed:** ein Rezept, das einen MUSS-Block verletzt (kein `kind`,
  ungültige id), wird NICHT registriert und LAUT geloggt — nie halb-registriert.
- **G4.3 EINE Versions-Semantik:** der Kern deklariert `STUDIO_VERTRAG = 1`
  (Top-Level-Konstante). Erhöht wird nur bei einem Bruch der MUSS-Blöcke;
  SOLL/DARF wachsen unter v1 (must-ignore trägt sie).
- **G4.4 kein Spiegel:** Leser lesen die angekommenen Daten LIVE (Referenz),
  kein Hardcode-Duplikat in der Welt — bewiesen durch den Mutation-wins-Test.

## §4b Die Laufzeit-Übersetzung (r128-Studio → r184-Welt) — NORMATIV

Die Studios sind in Three.js r128 (Legacy) verfasst; die Hauptwelt rendert
r184 (physisch, farb-verwaltet). Wo AnazhRealm Studio-INHALT selbst rendert
(nicht das Portal — dort läuft das Original), gelten DREI dokumentierte
Übersetzungs-Regeln (three.js-Migrationspfad, KEINE Tuning-Knöpfe):

- **Ü1 — LICHT-INTENSITÄTEN × π** (r155, useLegacyLights→physisch: Legacy
  hatte keine 1/π-BRDF-Normierung). Jeder aus einem Studio übernommene
  Licht-Intensitätswert wird mit `AnazhRealm.LEGACY_LICHT` (= Math.PI)
  multipliziert. Gilt für JEDE Domäne (Wald-Rig heute; Fahrzeug-Scheinwerfer/
  Emissive morgen).
- **Ü2 — AUTOREN-FARBEN RAW-ALS-LINEAR.** r128 las Hex ohne Eingangs-
  Konvertierung; die treue Übersetzung setzt Studio-Farbwerte per
  `setRGB(raw)` (linear), NIE per `setHex` (das sRGB→linear wandeln und
  dunkler zeigen würde als die Vorlage). Vertex-Farb-ATTRIBUTE reisen roh
  und sind automatisch korrekt (beide Renderer lesen Attribute linear).
- **Ü3 — GESETZE STATT WERTE, wo das Studio ein Gesetz hat.** Trägt die
  Vorlage eine Formel (atmosphere(e) · Nebel-skyB · Rahmen), liest die Welt
  die FORMEL aus der geteilten Quelle (phyto-core/foundry-core), nicht
  einen Wert-Snapshot.

**Chokepoint-Pflicht:** eine neue Domäne wendet Ü1/Ü2 am IMPORT an (der
kind-Handler bzw. die Ingest-Funktion), nicht verstreut an Anwendungs-
Stellen — ein Wert quert die Naht GENAU EINMAL und ist danach r184-nativ.

## §5 Die Andock-Sequenz (wie eine neue Domäne andockt)

Fünf Schritte, immer dieselben — das ist „die gleiche Pipeline für alles":

1. **Kern-Split:** die generative Substanz der Vorlage wandert in
   `<domäne>-core.js` (G2.1); die Labor-Shell liest den Kern (Beweis:
   byte-identisch vor/nach Split wie P0, der Harness im Archiv: `git show 1011d41d:scripts/diag-foundry-parity.cjs`).
2. **Manifest:** der Kern trägt B1+B2 (+ deklarierte SOLL-Blöcke) +
   `STUDIO_VERTRAG = 1`.
3. **Andocken:** der EINE Foundry-Worker lädt den Kern zusätzlich
   (`importScripts`), die Rezepte fließen in das EINE Buch (`f.recipes`,
   kind-getaggt); die Brücken (`get-recipes`/`get-render-config`/`get-params`)
   exportieren die Blöcke.
4. **Die Wirts-Zeile:** der Kern trägt sie selbst (B7 — Bauplan-Namensraum und
   Substanz); der EINE Auto-Register-Chokepoint liest sie aus dem Buch — keine
   Zeile im Wirt, kein zweiter Register-Pfad. Nur eine Art, die ein Wirts-Verb
   braucht (wachsen, Portal, Hand), trägt ihre Zeile im Wirt.
5. **Wächter:** `gate:nervensystem` E beweist den Weg für JEDES neue Buch
   (Werkstatt → Welt, Stufen, Kosten, Speicher, ohne eine Zeile AnazhRealm-Edit),
   ein `gate:nervensystem-<domäne>` die Komponenten der Domäne + eingefrorene
   Vertrags-Fixtures (`spec/asset-contract/v<n>/`) + dieser Validator
   (`gate:studio-vertrag` prüft den neuen Kern automatisch mit).

## §6 Konformanz

Welcher Kern welchen Block trägt, prüft `gate:studio-vertrag` live an jedem Kern aus `cores.manifest.json`
(MUSS-Blöcke fehlen nie, ein getragener SOLL-Block ist vollständig) — eine Tafel im Dokument wäre ein Spiegel, der veraltet.

---

## §7 v1.1 — Die Namensraum-Regel für Zweit-Kerne (NORMATIV, Entscheid E-A)

Die wörtliche v1-Form (§2 G2.1: „Top-Level-Globals") ist an foundry-core.js
EINGEFROREN und trägt genau EINEN Kern pro Laufzeit — jeder weitere Kern im
selben Worker/Portal kollidierte an den const-Symbolen (`STUDIO_VERTRAG` ·
`PORTAL_RENDER_CONFIG` · `PRESETS`, foundry-core.js:94/96/2248). v1.1 normt
die Adressierung für alle kommenden Domänen, OHNE einen Block zu ändern:

- **N7.1 — Der ERSTE Kern einer Laufzeit bleibt Top-Level** (foundry-core,
  byte-heilig; ein Merge/Refactor dort nur unter Byte-Beweis — nie für einen
  Zweit-Kern).
- **N7.2 — Jeder WEITERE Kern ist eine namespaced IIFE:**
  `(function(root){ root.__<domäne>Core = { … } })(typeof self!=="undefined"?self:globalThis)`
  — erster Bau: `vehicle-core.js` → `__vehicleCore`. Die Manifest-Blöcke leben
  UNTER dem Namensraum, **namens- und formgleich** zu §3 (`__vehicleCore.PRESETS`,
  `.buildInstance`, `.PORTAL_RENDER_CONFIG`, `.PARAMS_BY_KIND` (v1.2), `.LEHREN`,
  `.STUDIO_VERTRAG`). Kein Block ändert seine Gestalt — nur seine Adresse.
- **N7.3 — Der Validator mappt pro Kern:** der CORES-Eintrag trägt `ns`
  (`diag-studio-vertrag.cjs`), die Prüfungen selbst sind identisch. Ein
  Namensraum-Kern ohne seinen Namensraum wird rot (B1/B2/G4.3 lesen null).
- **N7.4 — Die Versions-Konstante bleibt `STUDIO_VERTRAG = 1`:** v1.1 ist eine
  Adressierungs-Norm, kein Bruch eines MUSS-Block-INHALTS (G4.3). Ein
  Empfänger, der nur v1 kennt, liest Zweit-Kerne schlicht nicht (must-ignore
  G4.1) — nichts bricht.

**N7.5 — Der Empfänger-Merge disjunkter kind-Blöcke (NORM für W7b und alle
Folge-Domänen):** liest ein Wirt mehrere Kerne, mergt er ihre
`PORTAL_RENDER_CONFIG.lod.kindStages`-Blöcke am EINEN Ingest-Chokepoint
(AnazhRealm: `_foundryIngestRenderConfig`) — kind-weise disjunkt (jede Domäne
deklariert nur ihre eigenen kinds; ein Kern ÜBERSCHREIBT nie den Block eines
anderen), must-ignore-fest für unbekannte Felder, und **fail-closed: ein kind
ohne kindStages-Eintrag gilt als `[0]`** (nur die feine Stufe — der Wirt gradet
konstruktiv L1=L0/L2=Auto-Impostor, statt Stufen zu erfinden, die der Kern
nicht trägt). Kein zweiter Ingest-Pfad; die Mutation-wins-Probe (G4.4) gilt
je Kern.

**Stand der Zweit-Kerne:** `vehicle-core.js` (Phase 1, W7a — B1 5 Gattungen
`kind:"vehicle"` · B2 `buildInstance` + `kindStages:{vehicle:[0]}` + Goldens
`spec/asset-contract/v3/` (`gate:vehicle-contract`) · B4 PARAMS · B5
LEHREN+`messen` · CULTURES als Daten; Shell-Verhaltens-Parität beim Split
hash-bewiesen). `porta-core.js` (Phase 2, ε — GEBAUT: B1 7 Ordnungen
`kind:"gate"` · B2 `buildInstance` + `kindStages:{gate:[0]}` + Goldens
`spec/asset-contract/v4/` (`gate:porta-contract`, seed-invariant cv:4) ·
B4 PARAMS (aus SLIDERS abgeleitet) · B5 als `messen`-Formel (Stich→Schub→Dicke;
pass/warn-Bänder trägt das Lab nicht — benannte Schuld) · B6 dsl (W12) +
`fx.place {mode:"site", siteTag:"tor"}` als Platzierungs-Daten (N5.6);
Split-Parität 14/14 hash-bewiesen, Andocken = reine Daten-Zeilen —
der ε-Beweis, `gate:nervensystem-porta`). Spiegel-Zensus (V18.486+,
rein additiv): **`TUER_GESETZ { offen }`** = der Flügel-Öffnungswinkel (rad)
— Shell (`DOOR_OPEN`) UND Wirt (`AnazhRealm._tuerOffenRad()`, Fallback
`TOR_FLUEGEL_OFFEN`) lesen die EINE Quelle (der 1.95-Zahlen-Zwilling ist
geschlossen). `schmiede-core.js` (W-A4a, ε —
GEBAUT: B1 22 Gattungen `kind:"weapon"` [Waffen UND Werkzeuge, die
tool:true-Marke reist in fx] · B2 `buildInstance` + `kindStages:{weapon:[0]}` +
Goldens `spec/asset-contract/v5/` (`gate:schmiede-contract`, seed-invariant
cv:5) · B4 PARAMS (PARAMS_BLADE+PARAMS_IMPACT, def aus dem Lab-Startzustand) ·
B5 LEHREN (pass = hieb-Band) + BANDS/`messen`/`evalLehren` · `fx.place
{mode:"hand"}` als Platzierungs-Daten (N5.5, streut nicht) · KEIN fx.wield
(Ω-PHYSIS bleibt der Wield-Richter, N6.6); Split-Parität 21/21 hash-bewiesen,
Andocken = reine Daten-Zeilen — der ε-Beweis, `gate:nervensystem-schmiede`).
`fachwerk-core.js` (W-A5a, ε — GEBAUT: B1 32 Kultur-Archetypen
`kind:"haus"` [die klickbaren Haus-Typen des Fachwerk-Labs; `s` eingefroren am
Lab-Startzustand kulturParams(name, 3), Strings/Farben reisen in fx] · B2
`buildInstance` + **`kindStages:{haus:[0,1,2]}` — die erste Mehr-Stufen-Domäne
außerhalb der Bäume** (0 ≙ Ring-A-Vollbau-Bake · 1 ≙ Chunk-Stufe-1-Hülle ·
2 ≙ Chunk-Stufe-2-Destillat; Editor-live + Vogel bleiben Lab/Dorf → W-A5b) +
Goldens `spec/asset-contract/v6/` (`gate:fachwerk-contract`, **seed-GETRIEBEN**
cv:6 — der Haus-Bau würfelt Fenstertakt/OG-Material/Giebel-Verband/Gauben/
Fenster-Schlaf aus P.seed) · B4 PARAMS (21 Regler aus den Lab-HTML-Slidern,
def = Lab-Startzustand) · `fx.place {mode:"settlement", siteTag:"haus"}` als
Platzierungs-Daten (N5.7, W-A5b: exportSettlement [die DORF-QUELLE lebt im
Kern] → `spawnSettlement` — der deliberate Kanal; Worldgen streut nicht);
Split-Parität je Rezept × Stufe hash-bewiesen (buildInstance == die Shell-
Komposition der Kern-Primitive), Andocken = reine Daten-Zeilen — der
ε-Beweis, `gate:nervensystem-fachwerk`). Spiegel-Zensus (V18.486+,
rein additiv): **`SIEDLUNG`** = das Siedlungs-Existenz-Gesetz (`cellM rarity
nHMin nHSpan` — WO/WIEVIEL Dörfer die Welt trägt; die Steil-Wand ist seit
siedlung.K3 die Böschung des Erdbaus, gelaende-core `ERDBAU.boeschung`;
Präzedenzfall Wald-Dichte in phyto-core). Es reist im Buch-Umschlag
(`get-book`-Reply, Feld `siedlung`, M8-generisch: der erste Kern mit
SIEDLUNG); der Wirt liest `AnazhRealm._siedlungGesetz()` (Ingest validiert
ganz-oder-gar-nicht, Fallback = byte-gleiches `AUTO_SETTLEMENT`). Die
Streaming-Regler (nearM/perTick/spawnClearM/siteProbeR/startRadiusM) bleiben
ehrlich Wirts-Infrastruktur.

---

## §8 v1.1 — Nicht-geometrische Domänen: MESHFREI + die Komponenten-Felder `motion` und `klang` (NORMATIV, W-A6/W-A7)

Die zwei im Labs-Fahrplan benannten v1.1-Erweiterungen sind KOMPONENTEN-Felder,
keine Verben (Nervensystem-Entscheidungsbaum: „Komponente erweitern, nicht Verb
erfinden"). Sie reisen je Rezept in `fx` durch das EINE Buch (`__replyRecipes`)
— must-ignore-billig per Design (ein v1-Leser ignoriert sie schlicht).

- **§8.1 MESHFREI (components-only-Kerne):** eine NICHT-GEOMETRISCHE Domäne
  (Klang; Körper-/Kreatur-GESTALT-Daten — der Host bleibt der OFEN) deklariert
  auf ihrem Namensraum `MESHFREI = 1`. Dann ist **B2 N/A** (kein
  `buildInstance` — der Kern liefert DATEN, keine Gestalt); ein MESHFREI-Kern,
  der trotzdem `buildInstance` trägt, ist eine Vertrags-Verletzung
  (Widerspruch, der Validator wird rot). Strukturell gedeckt: der
  build-asset-Dispatch der Brücke wählt Zweit-Kerne NUR mit
  `typeof buildInstance === "function"` — ODER, seit §8.4, über den
  Gattungs-Bäcker-Tisch der Pipe. Alle übrigen Blöcke (B1 REZEPTE
  MUSS · B4 PARAMS SOLL · G4.3 STUDIO_VERTRAG) gelten unverändert.
- **§8.4 v1.2 — DER GATTUNGS-BÄCKER (DIE EINE PIPE, V18.458, NORMATIV):** ein
  MESHFREI-Kern bleibt THREE-frei — seine GESTALT bäckt die PIPE: foundry-core
  trägt den Tisch `BAKERS_BY_KIND` (`{ kreatur: bakeTierInstance }`, M8:
  Tabelle vor if). Der build-asset-Dispatch der Brücke wählt einen Zweit-Kern
  auch DANN, wenn er kein `buildInstance` trägt, aber
  `BAKERS_BY_KIND[preset.kind]` eine Formel hat — der Bäcker erhält den KERN
  als Argument (`bakeTierInstance(kern, presetId, seed, lod, ov)`) und
  konsumiert dessen GESETZE (bauTier · deriveTierParams ·
  TIER_MATERIAL_KLASSEN). Der Reply ist der NORMALE Asset-Umschlag; additiv
  (must-ignore) reisen: `mesh.joint` (das animierte Gelenk des Meshes),
  `mat.emissive`/`mat.emissiveIntensity` (nur wenn nicht-schwarz) und EIN
  Pseudo-Eintrag `{ kind: "__skelett", skelett: { joints, tailSegs, masse } }`
  (Leser ohne position-Guard überspringen ihn; IDB trägt ihn gratis). Der
  Asset-Vertrag v1 zählt Beipack nie als Mesh (`istBeipack`,
  spec/asset-contract/v1/CONTRACT.md). (Der Baum-Beipack `__baumGrammatik` für den
  Analog-Fit fiel: fern ist der Baum seine Karte — B2c `fernform`.)
  DERSELBE Bäcker läuft im Worker UND auf dem Host-Main-Thread (foundry-core
  ist auf beiden geladen) — ein Gesetz, zwei Scheduler; der Host assembliert
  NUR (Gelenk-Gruppen aus dem Skelett + die EINE Reply-Konversion) und
  klont je Instanz aus dem Art-Memo. LOOK-GESETZE (V18.460/.461): trägt der
  Kern Zeilen-Tabellen (`fellStreu(P,M,O)`, O = der Fell-Ort des Baus · `kleidZonen(d)` · `haarStreu(d)`),
  KONSUMIERT der Bäcker sie (Streu/Hüllen deterministisch, Verlauf als
  Vertex-Farben) — das Gesetz sagt WAS (Teile · Farben · Verteilung), die
  Deck-TECHNIK ist Leser-Sache (das Lab behält seine Builder, Benchmark
  unbewegt). Fehlt die Tabelle, schreit der Bäcker (fail-closed, LAUT — `FELL: kern.fellStreu fehlt`);
  kahl ist nur die Grobstufe (lod ≥ 1: ohne Fell-Schalen und Strähnen). Die Grobstufe ist GELENKIG
  (S3): die Haut bindet an die Gelenke wie die feine, jedes starre Teil hängt mit Gewicht 1 an
  seinem Gelenk; der Wirt bindet sie an das Skelett der feinen (EIN Skelett je Gestalt).
  WELT-LOOK-GESETZE (V18.462, dasselbe Muster eine Ebene höher): der Himmel
  (`HIMMEL_GESETZ`) und die Wasser-Oberfläche (`WASSER_GESETZ`) wohnen als
  Zahlen-Tabellen in foundry-core — das Studio-GLSL INJIZIERT sie in seinen
  Shader-Text (semantischer Beweis: alt==neu), der Welt-Renderer (TSL) LIEST
  dieselben Tabellen. Editiert der Schöpfer die Tabelle, folgen BEIDE Leser.
- **§8.2 `fx.motion` (Bewegungs-Daten, W-A6):** Gang-/Emotions-Profile als
  reine Daten. Schema (alle Felder DARF, must-ignore):
  `motion { presets: { <name>: { <achse>: zahl … } }, standPose?: zahl[][] }` —
  die Achsen sind Lab-eigene Regler (freq · tension · kpMul · Gelenk-Ziele …;
  die Fußfolge wählt das Tempo, gangSchritt); der Host interpretiert sie NIE als
  zweites Animations-System (M4): der EINE Konsument ist der bestehende
  `_animateCompoundMotion`-/Rig-Bogen (wahrerguss Säule II — der Andock-Punkt
  ist benannt, der Konsum der bewusste Folge-Schritt). Spender heute:
  `koerper-core.js` (`mensch`, 10 Profile) · `tetrapoda-core.js`
  (wolf/fox/bear/deer, 6 Profile + CPG + Stand-Pose).
- **§8.2+ `fx.bewegung` (Bewegungs-GESETZE des Körpers, V18.483/485):** die
  Verben des Ninja-Parks + das Wasser als reine Daten, Leser sind die EINEN
  Gesetz-Funktionen des Wirts (memoisiert, fail-closed — Kern-Pflicht):
  `bewegung { speed { base leicht mag } · jumpPower { base leicht mag } ·
stamina { base traeger mag } · schwimmen { tauchV aufV lerp hubK tiefeK
hubCap tiefeCap drag taktZug taktTreten lean { zug treten } pose { kopf
armZug armTreten armAb armSpreiz beinZug beinTreten beinTakt }
ausdauerProS } · parkour { doppelspruenge doppelsprungMul wandsprungMul
wandAbstoss kletterV kletterAusdauerProS slideTempoMul slideDauerSec
slideMinTempo kontaktFrischeSec slidePose { lehne beinVor knieKnick
armStuetz armFrei kopf } } · luft { kAcc kAccLuft kBrake kBrakeLuft } ·
sprung { coyoteSec bufferSec } · schritt { taktCompound klangTempoMin } · gang { schrittBasis schrittFroude tastgrad tastgradLauf laufFroude maxWinkel hub hubLauf hubForm beckenHub } · aktionAusdauer }`.
  Spiegel-Zensus (V18.486+, rein additiv): `luft` = die vier
  C5-Boden-/Luft-Hebel der Beschleunigungs-/Brems-Kurven, `sprung` =
  Coyote-/Jump-Buffer-Fenster, `gang` = die Zweibeiner-Zeile des EINEN
  Gang-Gesetzes (tetrapoda `gangSchritt`/`gangFuss`, K07 — der Eich-Faktor
  des Schritt-Blocks fiel; das Körper-Studio liest dieselbe Zeile unter der
  Schwere seiner Bühne, `gate:tier-gang` Teil STUDIO),
  `aktionAusdauer` = die Kosten der Maus-Arm-Aktion (Hieb/Abbau),
  `parkour.kontaktFrischeSec` = das EINE Wandkontakt-Fenster (war der
  divergente Stamm-Zwilling 0.18/0.15). Leser `AnazhRealm._bewegungsBlock`
  (block-weise, ganz-oder-gar-nicht) + `_aktionAusdauer` — fail-closed
  (Kern-Pflicht): die Stamm-Zahlen-Zwillinge (`SCHWIMM/LUFT/SPRUNG/
SCHRITT_FALLBACK`, `MOUSE_ACTION_STAMINA_COST`) sind GEFALLEN, ein
  unlesbares Gesetz ist ein `_kernPflichtBruch` (die Wand schreit); die
  ZWILLINGS-ABSENZ-WAND im Validator hält die Zwillinge draußen.
  `parkour` bleibt Gesetz-Freiheit (kein parkour-Block → keine Verben).
- **§8.3 `fx.klang` (Musik-Daten, W-A7):** ein Genre als reine Daten. Schema
  (bpm MUSS im Feld, Rest DARF): `klang { bpm, scaleName?, scale?: halbton[],
dna?: { swing darkness color flow tension space }, form? harmony? rhythm?
bass? melody?, inst?, tilt? }`. Die Skala ist VOR-ABGELEITET aus der EINEN
  Lab-Formel (`scaleFor(darkness)`, das exportDrive-Muster N6.2/M3 — Export
  der SELBEN Formel, keine zweite Wahrheit). Der EINE Host-Konsument ist das
  BESTEHENDE Lofi-System (kein Parallel-Audio, M4): `_klangStudioPreset()`
  liest das Rezept der DATEN-Zeile `AnazhRealm.KLANG_HOST_RECIPE` („lofi"),
  `_lofiChordDurationMs` fährt das Studio-Tempo, `_grooveSwing()` den
  Genre-Shuffle (Spiegel-Zensus: `dna.swing` — die Doppel-Quelle
  GROOVE_SWING 0.58 vs Rezept 0.50 ist geschlossen, das Genre führt);
  kaltes Buch → die LOFI_*-/GROOVE_SWING-Konstanten byte-alt (fail-soft,
  G4.1). Spender heute: `klang-core.js` (22 Genesis-Genres, `kind:"klang"`).
- **§8.5 v1.2 — DIE OFEN-STUFEN-ZEILE (V18.478, NORMATIV, rein additiv):** ein
  MESHFREI-Kern mit Pipe-Bäcker (§8.4) DARF `PORTAL_RENDER_CONFIG.lod.
kindStages` auf seinem Namensraum tragen. Die Zeile deklariert die
  LOD-STUFEN, die der GATTUNGS-BÄCKER seiner Gestalt bäckt (dieselbe Form wie
  B2-kindStages: nicht-leer, strikt aufsteigend, 0..2 — derselbe Validator);
  B2 bleibt N/A (kein buildInstance). Die Brücke sammelt sie GENERISCH wie
  jede Zweit-Kern-Zeile (`cfg.lod.zusatzKindStages`, W7b/N2), der Host mergt
  am EINEN Ingest-Chokepoint. Sie ist die VERTRAGS-Wahrheit der bereits
  gebauten Ofen-Leiter — die Wächter sind die Fern-Linsen (die Bänder `checkBandTierFern`
  · `checkBandKreaturKosten` des vollen Playtests: die Grobstufe backt nah und fern verschieden und
  schaltet an der Kern-Grenze). Ohne die Zeile gilt fail-closed `[0]` (N7.5,
  unverändert). Spender heute: `tetrapoda-core.js` (`kreatur:[0,1]` — bauTier
  Gelenk-Baum/gelenkige Grobstufe) · `koerper-core.js` (`koerper:[0,1]` —
  bakeMenschInstance fein/gelenkige Grobstufe).

**Stand der MESHFREI-Kerne:** `klang-core.js` (`__klangCore` — B1 22 Genres ·
B4 bpm+6 DNA-Dials · fx.klang) · `koerper-core.js` (`__koerperCore` — B1
`mensch` · B4 8 Morph-Dials · fx.gestalt + fx.motion + **fx.bewegung**
[schwimmen · parkour · slidePose · speed/jump/stamina, §8.2+] · `LEIB { dichteKgM3 armAnteil }` — die Dichte
des Leibs (die Zeile leib der Stoff-Zeile des Wirts, physik K1: Masse = das Volumen des Leibs aus dem Ofen × ρ); `armAnteil` (Welle LF kampf, rein additiv: 5,0 % nach Dempster) ist der Arm samt
Hand, mit dem die Ausdauer einer Maus-Arm-Aktion wächst, (m_Arm + m_Gerät) / m_Arm, Wirt `_mausAusdauer`) ·
`tetrapoda-core.js` (`__tetrapodaCore` — B1 4 Gattungen · B4 5 allometrische
Dials · fx.motion + **VERHALTEN** [12 Aktionen · 6 Stimmungen, B6]).
Alle drei: keine KIND_POLICY-Zeile (keine Katalog-Blueprints — die Rezepte
erscheinen als Studio-Rezepte in der Werkstatt, W-A1-Straße), `fx.place
{mode:"none"}`, Daten-Goldens `spec/asset-contract/v7/` (`gate:daten-contract`).
Der GUSS ihres Ofens (§8.4, `BAKERS_BY_KIND.kreatur/.koerper`) trägt seit S1 Wände das Bake-Golden
`spec/asset-contract/ofen/` (`gate:ofen-contract`): sha256 je Stoff-Klasse × Gelenk, je Gelenk und je
Beipack, jede Art × jede Stufe der Ofen-Stufen-Zeile (§8.5).

## §9 v1.2 — Der Gesetz-Kern: reine Funktionen ohne Rezept (NORMATIV, K09a)

Ein Kern, der ein GESETZ als reine Funktion trägt und weder Rezepte noch Gestalt liefert (die Gelände-Höhe:
`gelaende-core.js`, `__gelaendeCore`), ist ein **Gesetz-Kern**. Seine Manifest-Zeile trägt `"funktion": true` und
einen Namensraum; der Namensraum erklärt `STUDIO_VERTRAG = 1` und `FUNKTION = 1`. Für ihn gelten B1–B6 nicht: er
trägt KEINE `PRESETS` (kein Buch-Eintrag, keine Werkstatt-Rezepte), KEIN `buildInstance` (kein build-asset-Dispatch),
KEIN `MESHFREI` (das gilt Rezept-Kernen ohne Gestalt) und KEINE `PARAMS_BY_KIND`; er trägt mindestens eine Funktion.
Die Brücke liest ihn generisch (die Zweit-Kern-Schleife findet keinen Block und überspringt ihn), der Foundry-Worker
lädt ihn mit (das Studio liest dasselbe Gesetz). Seine Funktionen sind rein: `f(Lage, x, z, …)` — die Lage reicht der
Wirt, der Kern hält keinen Welt-Zustand außer Strömen, die er aus der Saat ableitet. Validator: `gate:studio-vertrag`
(beide Seiten der Erklärung, die Absenz der Blöcke, die Funktions-Fläche; Selbsttest), die Zwillings-Wand in
`gate:altlasten` hält die Formeln im Gesetzbuch.

Was ein Gesetz-Kern über das Gesetz hinaus trägt, ist das, was Studio UND Welt lesen müssen, damit kein Zwilling entsteht:
die LINSE, die sein Gesetz misst (dieselbe Rechnung für die Wand und die Zahl-Leiste des Studios), und die PLAN-TÜR, durch
die ein Plan des Studios zur Welt wird (Studio = Welt byte-gleich, M5). Die BEDIENUNG eines Studios — die Namen seiner
Regler, ihre Gruppen, seine benannten Landschaften — ist weder Gesetz noch Linse: sie gehört dem Studio (beim Gelände
`worlds/gelaende/bedienung.json`), eine benannte Landschaft ist ein Rezept und steht nie im Kern. Jeder Schlüssel des
Namensraums steht in der Erklärung unten; `gate:studio-vertrag` liest sie und nennt jeden Schlüssel, der fehlt, und jedes
Rezept unter jedem Namen (ein Schlüssel aus `PRESET`/`REZEPT`/`RECIPE`, eine Liste von Einträgen mit `regler`, `kind` oder
Dials `s`) beim Namen.

**Stand der Gesetz-Kerne:** `gelaende-core.js` (`__gelaendeCore`) — DAS GESETZ: die EINE 2D-Höhe `hoehe(L, x, z, mitDetail)`
(der Term-Auswerter des Erbguts `termY` samt seiner Normalform `erbgutNormal`, der Wildnis-Term `wildnisY` = die LANDFORM,
K16: Großform-Splines `grossform` an den Knoten `OFFSET_KNOTEN`/`RELIEF_KNOTEN` mit den Reglern `LANDFORM_REGLER` — gelesen
je Lage über `landformRegler` —, das Flussnetz mit den Kanten `NETZ_KANTE`, seinen Läufen `flussLaeufe` und seinen Senken als
den benannten Seen `benannteSeen`, die Breite des Flusses `FLUSS_BREITE`/`flussBreite`, der Mäander `MAEANDER`, das
Schicht-Gesetz `schichtOrt`, der Höhlen-Mund `HOEHLEN_MUND`/`hoehlenMund`), die Schneegrenze `SCHNEE`/`schnee`, die
Temperatur `TEMPERATUR`/`temperatur` (stoffe.K3: Höhe × Saison × Uhr; das Feld in Wellen `temperaturFeld`, mit der Trägheit
eines Körpers, ausgewertet von `temperaturAus` — die Grillen lesen sie), das Eis `EIS`/`eisDicke` (stoffe.K3-2: die Dicke nach
Stefan aus dem Wasserkörper `wasserKoerper` — Salz, Säule, Trägheit — und der Jahres-Welle des Felds; die Zahlen der Stoffe,
ρ·c und T_schmelz des Wassers, ρ, Schmelzwärme L und Wärmeleitung k des Eises, reicht der Wirt aus seiner Stoff-Tafel als `stoff`, stoffe.K1 — ohne ihn bricht der Kern laut), der
Schnee-Pegel `SCHMELZE`/`schneePegel` (stoffe.K3-2: Grad-Tag auf der Jahres-Welle des Felds) mit seiner Linie `schneeLinie` und
dem Versatz der Schneegrenze `schneeVersatz` (den `schnee` liest), die Lava `LAVA`/`lava` (stoffe.K3-2: Newton-Abkühlung der
Zeile `stein` des Wirts, an der Luft und unter Dampf am Wasser, die Glut über dem Draper-Punkt) — ihr Gang und ihre Glut als EIN
Gesetz jedes heißen Körpers `waermeGang`/`glutAus` (die Lava, der Stahl der Esse) —, der Pegel `PEGEL`/`abfluss`/`pegelTafel`/
`pegelHub` (stoffe.K3-2: der Abfluss der Schmelze hebt den Spiegel jedes Sees und Flusses nach Manning bis zur Krone des Betts;
die Lage trägt die Tafel des Tags, `L.pegel`, der Spiegel des Kerns liest sie, nie das Bett) mit dem Regen `pegelRegen`
(wetter.K3: der Regen des Wetter-Felds als zweiter Term des Abflusses, eine Funktion des Felds auf der Stufe des Hubs, an der
Krone gedeckelt), die
Generation des Bodens `BODEN_GENERATION` und der Kachel-Schlüssel `kachelSchluessel`. DIE HYDROSPHÄRE (Karte hydro-faden): das
Drainage-Netz einer Region `hydrosphaere(L, H, boden, origin)` (Flüsse, Seen, Fälle, der gepackte Kanal `kanal` mit
`KANAL_FELDER` Zahlen je Segment, Wasser-Feld; `H` das Gesetz des Wirts, `boden` seine gebaute Fläche — der voxel-worker rechnet
sie), die Bett-Tiefe `flussTiefe` und das Wasser-Band `hydroBand`. DER FELS-STOFF (K17): das Aussehen
des Felsens `FELS` mit seiner Saat `FELS_SAAT` — `felsStoff` (der Welt-Boden je Chunk im Worker), `felsNetz` (die Gestalten),
`felsBasis`, `felsFarbe`, `felsKruemmung`, `felsLage`, `felsMittel`/`felsMittelWerte` (die Ferne), `felsFein` (der
Detail-Term des Shaders) mit seiner Welle `felsWelle` (K17-3: der Shader liest sie EINMAL im Rausch-Atlas und reicht sie
in die Fels-Funktion), `felsZahl` (das Rechenwerk des Gesetzes, mit `falte` und `fest`), `felsBankung` (die Messung der Bänke), der Schutt
`schuttKorn`/`schuttMittel`, die Himmels-Sicht der Höhle `HIMMELS_SICHT`/`himmelsSicht`, das Ziel der gröberen Stufe
`STUFE_ZIEL`/`stufeZiel` (K51-2, der Geomorph der Boden-Stufen: je Vertex Lage, Normale und Stoff-Farbe auf dem Netz der nächst
gröberen Stufe — Worker und Sync-Bau rufen dieselbe Funktion) und DAS RAUSCH-GESETZ `RAUSCH` mit
`rauschGitter`/`rauschRaum` (das EINE Gradienten-Rauschen des Boden-Shaders).
DIE LINSE (K16, K16b): `statistik` mit ihren Schwellen `LINSE`, `hangBaender` mit den Bändern `HANG_BAENDER`, die Bahnen
der Flachland-Glieder `maeanderZahl`, die Messung `MESSUNG` (das Mess-Raster, der Makro-Abdruck, der Schicht-Ort) mit
`abdruckFeld`, `messStatistik`, `schichtSchritte`/`schichtMessung`, und der Natur-Korridor `KORRIDOR` mit seinem `urteil`.
DIE PLAN-TÜR (K16b): `PLAN_ART`, `PLAN_VERSION`, `planNormal`, `planErbgut`, `planAbbild`, `planLage` auf dem Grund `GRUND`,
die Lage `lageAus`/`lageAbbild` mit ihrem Rausch-Strom `lageRausch`. DER ORT (K10): DER ERDBAU `ERDBAU` der Siedlungs-Pläne
(Platte, Trasse, Brücken-Etikett als letzter Term der Höhe) mit seiner Normalform `erdbauNormal`, der Höhe `erdbauY`, der
Fläche `erdbauFlaeche` und seiner Wand `erdbauWand` (K66: Böschung und Kante zwischen zwei Flächen tragen im Fels-Stoff den
Schutt), DER GRUND DER HÄUSER (S4: die Art `grund` — der Körper-Satz und der Keller eines Hauses aus fachwerk `grundVon`; das gesetzte Haus ist ein
Ein-Slot-Ort (bauen.K2): seinen Slot rechnet der Foundry-Faden, Kanal `slot-plan` → `slotPlan`, dieselbe Slot-Zeile wie der Export des Dorfs, seinen Plan v2
mit Platte, Grund und Vorplatz der Ort-Faden über `ortPlan`) mit
seinem Grundriss-Leser `erdbauGrund`, dem hohlen Keller `erdbauHohl` (das Feld des Wirts, je Spalte gefragt über `erdbauKeller`) und dem Schnitt des gezeichneten
Bodens `erdbauSchnitt` (Voxel-Faden und Sync-Bau), der Lese-Kontext eines Orts `ortCtx` (Höhe samt Erdbau, Fläche, Welt-Wasser — EIN ctx für Wirt,
Fachwerk-Studio und Linse), die Lage einer Welt ohne Wirt `LAGE_GRUND`/`lageGrund`, die Hang-Suche eines Orts `hangOrt` und das
Höhen-Raster der Trasse `hoehenRaster` (siedlung.K3: der Grund im Rahmen fachwerk `trasseRahmen` um den Ort, dem die Gassen folgen). DER WIND AM GELÄNDE
(wetter.K5): der Faktor `windForm` mit seinem Gesetz `WIND_FORM` — Lee hinter dem Kamm, Tal-Düse zwischen zwei Flanken an der Höhe
des Wirts; ihn liest der EINE Wind der Welt (`_windAt`).
DIE FORM DES EDITS (F2a „hoch bauen", editform-kern): jeder Spieler-Edit ist die Säule `editForm` seines Maßes `EDIT_FORM` —
der Punkt `mitEdits`, das Gitter `editsImGitter`, die Reichweite `editReich` (Edit-Karte, Weckung, Fern-Ring), die Krone
`editKrone` (die Garantie-Luft der Flächen-Probe), die Höhe mit Edits `editHoehe` (die Nässe der Ferne: der Fern-Ring trägt
jeden Edit) und das Band des
Gitters `bandOben`/`bandUnten`, das die Edits deckt (`bandUmEdits`); Stamm und voxel-worker rufen dieselben Funktionen.
DIE 3D-DICHTE UND DER WASSER-SPIEGEL (gelaende-k1k4): die Region einer Stelle `hydroRegion`, der Kanal `flussKanal`, das
See-Becken `seeBecken` und ihre Form im Gelände `gewaesserForm`; die Dichte `dichte` aus dem Spalten-Kontext `dichteSpalte` und
der Basis `dichteBasis`, ihr Gitter `dichteGitter` und `gitterMitEdits`; die Edit-Karte je Chunk `editKarte` mit `editsNah`,
`editsAm`, `editsImKasten` und ihr Stand `editKarteSteht` (die Probe fragt die stehende Karte für zwei Vergleiche); der Spiegel des Körpers `wasserSpiegel`, des Atlas `atlasSpiegel`, des Flusses `flussAm`, quer über
die Krone `spiegelQuer`, am Rand `flussRand` und im Schnitt `schnittSpiegel`, der Stau der Werke im Spiegel des Atlas (die Felder
`L.stau`, gelaende.K2) — Stamm-Leser und Worker-Feld rufen sie, die
Kern-Probe (`gate:worker-dichte --kern`) mutiert sie. Die Felder selbst: der Überlauf `stauUeberlauf`, der Spiegel am Werk
`stauWerkY` (die Wahl der Werke im Stamm) und die Felder der Werke `stauFelder` — jeder Faden rechnet sie, nie der Haupt-Faden
(`gate:worker-dichte --faden` zählt sie).
DIE ERKLÄRUNG: `VERSION`, `STUDIO_VERTRAG`, `FUNKTION`.
Geladen vom Stamm (vor `stamm/`), vom Terrain-Labor (vor `foundry-core.js`), vom voxel-worker (`importScripts` mit `?v=`),
vom Foundry-Worker und vom Makro-Worker des Studios. Es gibt keinen Spiegel: kein Leser rechnet eine dieser Formeln nach (die Boden-Farbe liest `schnee`, das Bild und der Körper `eisDicke`, der Feld-Zeichner und der Fern-Ring `hoehe`, die
Zahl-Leiste und die Gelände-Wände `MESSUNG`); die Zwillings-Wand in `gate:altlasten` sucht sie als Muster in jeder
Wurzel-Datei und jedem Skript.