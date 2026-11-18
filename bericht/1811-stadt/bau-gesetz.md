# BAU_GESETZ — die Schnittstelle „der Bau folgt aus Haushalt und Nutzung“ (Fachwerk-Kern)

Gelesen am origin/main d3ddb51c, nur lesen. Gerechnet: headless `DORF({seed 4291161376, nH 13})` und `kulturParams` auf der CPU
(antik −136, 16 Bauten, wie im Leser-Blatt). Nicht gemessen: Bake, Dreiecke, Bild. Alle Zeilen `fachwerk-core.js`, wo nicht anders genannt.
Dateien daneben: `bau-zeile.schema.json` (das Zeilen-Schema), `bau-zeilen-beweis.json` (drei Dinge als Zeilen). Beide JSON.parse grün,
dazu ajv 6 aus node_modules: 7 von 7 Beweis-Zeilen gültig, zwei Fehl-Zeilen (Quelle „gelesen“, Stoff „marmor“) abgewiesen (gerechnet).

## 1. Der EINE Chokepoint — wo das Rezept entsteht

**Er heißt `kulturParams` (:2025–2038), nicht `houses.push` (:3980–3982).** Dem Leser-Blatt §6 widerspreche ich hier, aus drei gelesenen Gründen:

1. **Das Labor kommt dort nie vorbei.** `PRESETS` rufen `kulturParams(name, LAB_SEED)` (:5252), das Labor `applyKultur` → `kulturParams`
   (worlds/fachwerk/fachwerk.js:35) und `applyMeta` → `metaParams` (worlds/fachwerk/fachwerk.js:630). Keiner davon läuft durch `DORF`.
   Setzt das Gesetz bei :3982 an, kann das Labor nicht sein erster Leser sein.
2. **Die Chronik liest daran vorbei.** `C.leute` (:3988–3990) liest `alle[a]` und `za[a].fr` direkt, nicht `houses`. Ein Gesetz bei :3982
   gäbe der Gegenwart andere Häuser als der Wachstums-Chronik. Das wäre ein Zwilling in derselben Funktion.
3. **Bei :3982 haben schon alle geschrieben.** Es gibt mindestens 17 Bau-Funktionen der Tafel `bau` (:3812–3828, gezählt) und die
   Maß-Literale in DORF (:3922, :3924, :3926–3933, :3940, :3943, :3945–3946, :3957–3958, :3964–3968). Ein Gesetz dahinter wäre der dritte
   Schreiber, kein Gesetz.

Der Weg ist heute: Rezept aus Kultur × Würfel (`kulturParams`, 9 Rufer: :3866, :3883, :3921, :3934, :3946, :3957, :5252,
worlds/fachwerk/fachwerk.js:35, :844), dann überschreibt die Nutzung es (`SG.bau` :3867, :3952, Literale), und erst danach liest
`leuteVon` den Haushalt aus dem Haus (:9047). **Das Gesetz dreht das um, an EINER Stelle:**
`bauRezept({nutzung, bauweise, rahmen}, haushalt, seed) → hp` ersetzt `kulturParams` an allen 9 Rufern. Eine Kultur ist ein Paar
(bauweise-Zeile, rahmen-Zeile); `KULTUR` (:1979–2011) wird die Tafel der 32 bauweise-Zeilen. `bauRezept` zieht den Würfel in derselben
Folge pitch → W → D → st (:2029–2032). Byte-Beweis: für `nutzung = wohnhaus` ohne `haushalt` gilt `bauRezept ≡ kulturParams` über
32 Kulturen × 16 Samen (gate:fachwerk-contract, scripts/diag-fachwerk-contract.cjs:98) — PRESETS und Golden bleiben byte-gleich.
Mit `haushalt` ändert sich die Welt.

**Das Labor ist der erste Leser:** `applyKultur` und `applyMeta` werden ein Ruf `FC.bauRezept`; die Meta-Regler (Personen · Wohlstand ·
Jahr · Klima, fachwerk.js:629) sind dann die Eingänge haushalt und rahmen, `metaParams` (:8986–9037) stirbt. **Die Welt** bekommt
dasselbe über den EINEN Export: DORF → `exportSettlement` (:9241) → `hausZeile.ov` (:5400) → Wirt; dort ändert sich nichts.
**Der Haushalt wird Datum des Loses:** DORF würfelt `personen` neben `wohl` (:3923); `leuteVon` liest `hp.leute`, wo es steht, die
Rückrechnung aus der Fläche (:9054–9056) bleibt nur für Häuser ohne Haushalt. Beide Richtungen tragen dieselben Zahlen:
`LEUTE_GESETZ` 20 m² + 20 m² · wohl je Person (:9046).

## 2. Das Zeilen-Schema (bau-zeile.schema.json)

Jede Zahl ist `{wert, einheit, quelle ∈ physik · ueberliefert · geschaetzt, beleg}`. Stoffe sind nur die Rollen, die der Kern kennt
(DEFCOL :1977, blockholz :182, tuch der Ausstattung), damit eine Zeile keinen Draw erfindet. Regeln sind Daten, kein Code.

- **nutzung** (Bau-Typ): `raeume[]` mit Fläche je Bau · Person · Stück (Person mit `wohlZuschlag` = LEUTE_GESETZ), lichter Höhe,
  Geschoss, `lage` (kern · strasse · hof_umlauf · fluegel · anbau · laube · erker · turm · getrennt …) und Öffnungs-Bedarf
  (licht · tor · rauch); `nachbarschaft[]` (neben · über · um · vor · getrennt · unter_einem_dach); `geschosse`; `grundriss[]` in
  Rangfolge; `zeichen[]` nach außen, jedes auf einem Schalter von PARAMS oder `neu: true`; `fabrik` haus | ausstattung (HAUS :158, AUS_BAU :7332).
- **bauweise** (Tragwerk): `tragwerk` ∈ stehendes_geruest · blockbau · saeule_gebaelk · bogen_gewoelbe · skelett_tragendes_dach ·
  massivbau · pfosten_plane; Stoff je Glied (traeger · wand · fuellung · dach · sockel); `spannweiteMax`; `raster` (bayMax :171);
  `wand.art` + `verstrebung`; `geschossHoehe` (egH/ogH :168); `dach` mit Form, Deckung, `grenzNeigung` (heute STILMODE.pMin :181–186,
  geklemmt :198), Regelneigung, Überstand Traufe/Ortgang (:171); `sockel` (foundH :168, keller); `oeffnung` (Sturz bis `sturzMax`,
  darüber Bogen; `bogen` = bogenTyp :960, :1071); `schmuck[]` (wo · womit); `farbe` (KULTUR.col); `streuung` (Würfel-Spannen :2029–2031).
- **rahmen** (Zeit · Ort · Klima): `zeit` von/bis; `ort.region`, `ort.klima` (Regen mm/Jahr, Schnee kN/m², Temperatur, Sonne),
  `ort.stoff[]`; welche `bauweisen` und `nutzungen` gelten (heute Pools REGION_HIST :3357, Bänder STADT_GRAMMATIK.zeit :3786);
  `regeln[]` {ziel = JSON-Pointer in nutzung/bauweise, op setze · plus · mal · min · max · linear, aus jahr · alter · klima.* ·
  ort.stoff · wohl · personen · rang}; `alter` (Patina = verwitterung :5977, Setzung, Umbau = heute der annexN-Würfel 25 % :3930).

## 3. Trägt das Schema? (bau-zeilen-beweis.json)

| Ding | heute | aus den Zeilen | Abweichung |
|---|---|---|---|
| griechisches Wohnhaus, Messort, seed 958942 | W 9 · D 7,5 · 2 Geschosse · Neigung 11 im Rezept, **18 gebaut** · 2 Personen | (2·44,8 + 4 Laube)/0,7 = 133,7 m², 2 Geschosse → W 8,5 · D 7,5 · 18° | Grundfläche −0,9 % (gerechnet) |
| alemannisch (PRESET, Same 3) | W 7 · D 8,5 · 2 Geschosse · 55° · andreas · stil alt | 2·40/0,7 = 114,3 m² → W 7,0 · D 8,0 · 55° | −4 % (gerechnet) |
| Marktstand (:5962, :6627) | groesse 1 · fuelle 0,6 · verwitterung 0,5; 2,0 × 0,9 m, Pfosten 2,25/1,95, Plane 12,1° | Auslage 1,8 m² → groesse 1,0; Pultdach 12,1°; Patina × Alter | groesse gleich; fuelle ohne Feld |

**Je Regler (31 des Labors, Leser-Blatt §2):** **26** folgen aus einem Feld — auch die heutigen Würfel der Lose (keller, annexN,
balcony, grundriss :3930–3933) werden Raum- und Alters-Regeln. **2** nur angenähert: W (8,5 statt 9) und pilotis (Sockelhöhe ≥ 2,6 m
:201). **3** ohne Feld: bend, terrAsym (Labor-Formen ohne Schreiber im Plan) und doppel (Parzelle, :8980) — bewusst draußen.

**Was das Schema vom heutigen Rezept NICHT ausdrückt:** die Holzquerschnitte (:169–170); die Folge des Würfels (die trägt die Funktion,
nicht die Zeile); die Muster der Verstrebung als Geometrie; Stufen-Gesetze (DESTNUR :2058); beim Stand Ware (`fuelle`), Tisch, Ablage,
Bahnen der Plane und die Liste der Planen-Farben (:8351).

**Befund nebenbei (gerechnet):**
- Die Neigung des griechischen Rezepts (10–14° bei allen 10 Wohnhäusern) ist tot: STILMODE.stein klemmt sie auf 18° (:183, :198).
  Die Spanne, die das Leser-Blatt „variiert“ nennt, steht nur im Rezept; gebaut ist sie 0. Im Gesetz heißt das grenzNeigung, die tote Zahl fällt.
- 7 HAUS-Maße haben keinen Schreiber außer ihrem Default: foundH, egH, ogH, ovEave, ovRake, doorW, doorH (:168, :171; git grep).
  Überstand, Sockel und Geschosshöhe hängen heute an keiner Kultur, keinem Klima und keiner Nutzung.

## 4. Was das Gesetz trägt — vorhanden und neu

**Vorhanden, wird Konsum:**
- **Grundriss:** die Grundriss-Tafel {I, L, U, T, Kreuz, Hof, rund} (:499), Flügel in Raum-Modulen zu 3,3 m (:504–505), `hof()` (:1491),
  Anbau-Zellen annexN (:175, :528), Laube = balcony (:166). Korrektur 1 des Leser-Blatts trägt: keine neue Grammatik, nur der Packer.
- **Höhe:** Turm-Stapel ab 12 Geschossen (`stapelBau` :2490, `planBau` :5357), SETBACK = terrasse (:5228), Verformungs-Feld bend (:1761).
- **Wand und Dach:** Brandwand (:492) und Doppelhaus (:174) bleiben Ort-Domäne. Die EINE Dach-Quelle ROOFMODE (:207). STILMODE
  (:180–187) mit pMin wird grenzNeigung und glatte Wand des Massivbaus (GLATT :197). Feature → Material (:179) wird „Monument → Massivbau“.
- **Öffnung:** Arkade (:1639) und bogenRahmen über dem Sturz-Balken (:960, :1071) werden die Öffnungs-Regel.
- **Zeit und Bau-Typen:** EPOCHEN (:3370) und REGION_HIST (:3357) werden rahmen-Zeilen; STADT_GRAMMATIK.bau (:3811–3829) wird
  nutzung-Zeilen; LEUTE_GESETZ.rolle (:9046) wird `haushalt.fest`.
- **Nach dem Zug fallen:** die 17 bau-Funktionen, die Maß-Literale in DORF, `metaParams` und die Scheune als eigener Satz (:3964–3968);
  sie bleibt ausdrückbar als Raum `lage: getrennt`, das Layout liest `parent` weiter.

**Neu:**
- **Der Packer `bauProgramm`:** Räume → Geschosse → Grundform → Flügel und Anbau, gegen das Los.
- **Spannweite:** `spannweiteMax` begrenzt die Tiefe. Die Grenze 11 m sitzt nur in `kulturParams` (:2031); `HAUS` setzt `Dp=P.D`
  ohne Deckel (:210 gelesen) — ein Langbau ist Konsum, solange First und Dach halten (ridgeY = eaveY + D/2 · tan, :206). Das
  korrigiert das „ungelesen“ des Leser-Blatts.
- **Überstand und Sockel aus dem Klima:** Regel auf ovEave/foundH — die zwei Zahlen, die heute niemand schreibt.
- **Öffnung aus der Spannweite:** Korrektur 2 des Leser-Blatts trägt für die GEOMETRIE; das FELD gehört ins Schema ab Zeile 1
  (sonst Schema-Bruch später; `bogenTyp` existiert schon).
- **Benannt, nicht gebaut:** 4 von 7 Tragwerken (blockbau, saeule_gebaelk, bogen_gewoelbe, skelett_tragendes_dach). Heute baut der
  Kern 2 (Gerüst, glatte Wand) plus pfosten_plane in AUS_BAU; die 32 Kulturen liegen auf 6 Stilen: alt 5 · huette 7 · stein 13 ·
  klinker 4 · modern 1 · glas 2 (gezählt :1980–2011). Das ist Teil 2 Punkt 1–5 der Vorlage, jetzt als fehlende Fabriken hinter
  `tragwerk` statt als fehlende Sonderfälle.
- **Gefahr im selben Zug:** der Flügel fängt seinen Fehler still (`try … catch → console.warn('Flügel übersprungen')`, :1755).
  Treibt das Programm mehr Flügel, ist das der fail-soft-Bruch — er muss in derselben Welle ROT werden.

## 5. Der Preis in der Welt

- **Zeilen kosten 0 Draws.** Draws hängen am Stoff, nicht an der Gestalt: der Bau-Satz legt je Stoff einen Bereich an
  (stamm/siedlung-satz.js:3–14), jedes Haus ist schon heute Unikat mit eigener ov-Geometrie (count 1). Ein neues Tripel
  nutzung × bauweise × rahmen bringt nur neue Regler-Werte, 0 neue Stoffe (das Stoff-Enum im Schema sichert es). Ein neuer Stoff
  (Deckung, Verband) kostet +1 Draw je Seh-Klasse weltweit, nicht je Haus (Faltung :78–80).
- **Vielfalt bleibt eine Funktion.** hp = f(Zeilen, haushalt, seed), REIN wie `leuteVon` (:9044). Gestalten ≤ Paare × Nutzungen ×
  Personen (1–12) × 16 Samen (`GESTALTEN_JE_REZEPT` :84); sie kosten Bake je Haus im Schirm, nie je Zeile (Bake 0,30–0,39 s/Haus GTX
  laut Notiz :5350, nicht von mir gemessen).
- **Die Decke der Archetypen ist die Dreiecks-Ratsche je Stufe:** L0 132 000 · L1 44 000 · L2 7 000 · L3 96 (:100–103), sie darf
  nur fallen. Risiko L2: Flügel, U und Hof verlängern die Wand (höchster Fall heute fraenkisch/7 mit 3 594, :97) — der Packer bekommt
  ein Budget je Grundform, gemessen über die Zeilen am Regler-Rand. Zweites Risiko: das Los ist das umschließende Rechteck
  (`losGrundriss` :8495, Leser-Blatt); ein Hof belegt sein ganzes Rechteck.

**Erste Messung des Schnitts:** dieselben headless Zahlen wie im Leser-Blatt (Dorf: 10 Klassen, 15/16 I; s7: 72/310, 293 I), dazu
die byte-gleichen PRESETS (32 × 16) und L2 ≤ 7 000; das Bildpaar an den zwei Kameras der Vorlage schießt der Schneider.
