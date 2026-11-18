# Haus-Breite-Karte — was die Siedlung je Los weiß, was im Haus ankommt, wo die Breite wächst

gelesen am d3ddb51c (V18.546.328). Nur gelesen, kein Schnitt. **Gemessen:** headless `DORF()` aus fachwerk-core auf der CPU (6 Pläne,
14 ms; Werkzeug `hb-mess.cjs`/`hb-mess2.cjs` neben diesem Blatt, nicht im Repo). **Nicht gemessen:** Bake, Dreiecke, Speicher, GPU, Bild;
das Layout (`exportSettlement`: Brandwand, Lose) lief nicht. Vorlage: koordination `bericht/1711-haus-stoff/README.md` Teil 2; Teil 1 ist nicht berührt.
Der Messort-Plan ist nachgerechnet: `DORF({seed 4291161376, nH 13})` (Same und Zahl aus `spec/profiband/haushalt.json`, Messort `dorf`;
`siedlungsEpoche` gibt ihm keine Epoche, fachwerk-core.js:3466–3471) ergibt 16 Bauten, 14 griechisch, 2 römisch, Region antik, Jahr −136.
Das ist der Zensus der Vorlage.

## 1. Was der Plan je Los weiß (alle Zeilen fachwerk-core.js, wo nicht anders genannt)

| Wissen | Quelle | Stand |
|---|---|---|
| Region · Jahr · Spanne · Größe | `DORF` :3888–3907; `REGION_HIST` :3357–3364; `EPOCHEN` :3370–3380 | je Ort |
| Kultur · Baujahr · frühere Bauten | `poolAt` :3909, :3920; Jahresringe :3915–3919, :3934 | je Los |
| Wohlstand `wohl` | :3923 (Rang in der Gründungs-Folge × Würfel; Dorf 0,65–1,43) | je Los |
| Nutzung `rolle` (23 Namen) | Wohnhaus :3921 · Turm :3941 · Halle :3943 · Kirche :3946 · Gasthaus, Schmiede :3952 · Burg :3957 · Scheune :3964 · Viertel `stadtViertel` :3861–3886 über `STADT_GRAMMATIK` :3785–3830 | je Los |
| Personen | NICHT im Plan: `leuteVon` :9047–9057 liest sie nachher aus W·D·Geschossen | abgeleitet |
| Beruf | stamm/siedlung-bewohner.js:869–871 = die Rolle des Hauses (sonst markt/Acker/hof); Händler je Stand :906–929 | abgeleitet |
| Klima · Gelände-Stoff | NICHT im Plan: `exportSettlement` reicht nur seed·nH·epoche·budget·jahr·erbe an DORF (:9243–9250), die Höhe nur an die Trasse (:9280) | fehlt |

Die Richtung ist verkehrt herum. Das Haus entsteht aus Kultur-Rezept × Würfel × Wohlstand (`kulturParams` :2025–2038, :3922–3924);
Haushalt und Beruf werden danach aus dem Haus abgelesen. Die Gegenrichtung gibt es nur im Labor: `metaParams` :8986–9038 (Jahr · Klima ·
Personen · Wohlstand → Form, Leser nur worlds/fachwerk/fachwerk.js:626–637; grep in stamm/ und foundry-bruecke.js: 0 Treffer).
Damit gibt es **zwei Größen-Gesetze**: Personen → Haus im Labor, Haus → Personen in der Welt.

## 2. Was im Haus ankommt

Ohne Zwilling: DORF → `exportSettlement` :9241 → `hausSlot`/`hausZeile` :5385–5400 mit `ov` = der ganze Satz des Loses → Wirt
`spawnArchitecture(… studioOv: slot.ov)` stamm/siedlung-ort.js:534–536 (`_stempelVon` stamm/siedlung-bauten.js:3426). Was DORF setzt, baut
das Haus. Engpass ist, WAS DORF setzt, und `HAUS` (:158–~1970) liest nie `P.rolle`. Ein Bau-Typ ist nach eigenem Gesetz „ein Parameter-Satz
… über dem Haus seiner Kultur, nie ein eigenes Teil“ (:3771, Tafel `bau` :3811–3829).

**K = 31 Regler des Labors:** 21 `PARAMS` (:5207–5228), 4 Meta (worlds/fachwerk/fachwerk.js:811–812), Kultur, 5 Auswahlen
(Stil · Verstrebung · Dachtyp · Bogen · Grundriss, worlds/fachwerk/index.html:65).

| Plan (headless) | Bauten | k von 31 | Silhouetten-Klassen* | Grundriss I | Geschosse | Personen |
|---|---|---|---|---|---|---|
| Dorf Messort (antik −136) | 16 | **12** | 10 | 15 | 1–2 (alle 10 Wohnhäuser 2) | 0–3 |
| Stadt s7 n300 (mediterran 1238, Grammatik) | 310 | 17 | 72 | 293 | 1–6 | 0–7 |
| s11 n120 „mittelalter“ (Gegenwart 1914) | 123 | – | 38 | 118 | 1–3 | 0–5 |
| s5 n220 „moderne“ 1949 · hanse n90 · barock n60 | 223 · 91 · 62 | – | 142 · 39 · 42 | 214 · 90 · 59 | 1–23 · 1–4 · 1–3 | 0–12 |

*Klasse = W/2 m · D/2 m · Geschosse · Neigung/10° · Grundriss · Dachtyp · Anbau · Marken. Über alle 825 Bauten haben **789 (95,6 %)** den Grundriss I; U, T, Kreuz und Zylinder kommen nie vor.

**Im Dorf variieren (12):** Breite 4,5–15 · Tiefe 4–11 · Geschosse 1–2 · Neigung 10–28° · Anbau · Balkon · Arkade (nur die Kirche) · Grundriss
I/L (ein L) · Kultur (2) · Verstrebung (k nur an Scheunen) · Jahr · Wohlstand. **Fest (19):** Bogen des Grundrisses · Versatz · Doppelhaus · Walm · Schwung · Treppengiebel · Kuppel · Portikus · Turm · Zinnen · Veranda ·
Vorkragung · Pilotis · Terrasse · Stil (`stein`) · Dachtyp · Bogen · **Klima** · **Personen** (kein Eingang). Die Reihe der Stadt läuft über
`brandwand` aus dem Layout (:8980), nicht über `doppel`.

**U = 23 Nutzungen nennt der Plan, u = 0 haben einen eigenen Bau.** 22 tragen nur ein Maß mit Schaltern über dem Kulturhaus: Schmiede
W 5,5 · D 5 · 1 Geschoss (:3813); die Kirche des Dorfs ein römisches Haus 15 × 11 m, eingeschossig, mit Arkade (:3945–3946, gemessen); die
Scheune ein 4,5 × 4-Häuschen neben dem Hof (:3962–3968). Die Grammatik gilt nur 500–1800 (:3786, :3953): „mittelalter“ steht 1914 mit 4 Rollen.

## 3. Was der Kern schon kann — was wirklich fehlt

**Schon da:** Grundriss-Grammatik `GRUND` {I · L · U · T · Kreuz · Hof · Zylinder} (:498–501), Flügel „als EIN Gesetz auf beliebigen
Seiten“ in Raum-Modulen von 3,3 m (:497, :502–505); `annexN` 0–2 auf jedem Rezept (:175, :528); Bogen (:1761); Doppelhaus (:174, :1758);
Brandwand (:492). Punkt 7 der Vorlage ist damit **Konsum**. Hochformen Turm · Kuppel · Portikus · Arkade · Zinnen · Treppengiebel · Veranda ·
Vorkragung · Pilotis · SETBACK (:5214–5228, :1587); Turm-Stapel ab 12 Geschossen (`stapelBau` :2490, :5357). Stil `stroh` (Reet) steht in
`STILMODE` :186, kein Rezept nutzt ihn (grep 0); `STILMODE` (:180–187) tauscht nur Stoffe über einem Gerüst.

**Fehlt:** das Gesetz Nutzung → Räume → Flügel/Anbau/Geschosse · der Langbau (Schiff, Chor, Turm): die Tiefe endet bei 11 m (`kulturParams`
:2031, Labor 10 m :5209; ob `HAUS` mehr trägt, ungelesen, die Moderne setzt 14 m :3940) · die Tektonik · Klima und Orts-Stoff im Plan · das
Alter am Haus (`verwitterung` nur bei der Ausstattung :5977).

## 4. Der Preis in der Welt

**Jedes Haus ist schon Unikat:** eigene Geometrie `f:<preset>|<gestalt>|<lod>|ov`, count 1 (stamm/siedlung-satz.js:5–8); der Bau-Satz legt
sie je **Stoff** in Pool-Bereiche (:9–14, :31–37), Draws hängen an Stoff-Klassen (7 Stoffe für 16 Häuser). `GESTALTEN_JE_REZEPT` 16 (:84)
gilt nur für gesetzte Rezepte ohne ov. **Neue Gestalt** aus vorhandenen Reglern: 0 Draws, 0 Stoffe; sie kostet den Bake je Haus und Stufe
(Mass-Bau 0,30–0,39 s/Haus GTX, Notiz :5350, nicht gemessen) und Ecken im Satz. **Decke:** die Dreiecks-Zeile je Stufe L0 132 000 · L1 44 000 ·
L2 7 000 · L3 96, sie darf nur fallen (:74–76, :99–102); Flügel und U verlängern die Wand, das **Risiko ist L2** (belegt 3 594, :96–97).
**Neuer Stoff:** +1 Draw je Seh-Klasse weltweit, nicht je Haus — Vielfalt bleibt Funktion, solange sie in Reglern lebt. Das Los ist das
umschließende Rechteck der Hülle (`losGrundriss` :8495–8499); ein U-Hof belegt sein ganzes Rechteck.

## 5. Rangfolge der 16 Punkte (Silhouette vor Detail, Stadt mit Tausenden Häusern)

| # | Punkt | warum | Kosten |
|---|---|---|---|
| 1 | 6 Nutzung → Bau-Typ | Kirchturm, Halle, Hof prägen die Silhouette; u = 0 | Erweiterung (Tafel `bau` → Programm) |
| 2 | 15 Haushalt → Größe | Größen-Gefälle; 10 Wohnhäuser alle 2-geschossig | Konsum (`metaParams` :9011–9013) |
| 3 | 7 Grundriss-Grammatik | Dachlandschaft L/U/T/Hof; 95,6 % I | Konsum (`GRUND` :499) |
| 4 | 1 Tektonik | zehn Kulturen ein weißer Kasten | neues Gesetz |
| 5 | 14 Orts-Stoff | Ton der Stadt fern | Erweiterung |
| 6 | 12 Wasser/Klima | Neigung, Überstand; `metaParams` kennt Klima (:8991) | Konsum + Erweiterung |
| 7 | 8 Zeit: Technik + Alter | Patina, Umbau; Jahresringe stehen (:3902) | Erweiterung |
| 8–9 | 4 Skelettbau · 5 Blockbau | ganze Regionen | neues Gesetz |
| 10 | 16 Grundstück | Zaun, Mauer, Hof | neues Gesetz (Ort) |
| 11–12 | 3 Fassade · 2 Ordnung | mittlere Nähe | neu · Erweiterung (`portikus`) |
| 13 | 9 Deckung | `stroh` ungenutzt | Konsum + Erweiterung |
| 14–16 | 11 Öffnung · 10 Verbände · 13 Ornament | nah | neu · Erweiterung (Teil 1) · neu |

## 6. Vorschlag erste Breite-Welle: „der Bau folgt aus Haushalt und Nutzung“ — trägt, mit zwei Korrekturen

**Trägt:** Der Weg Plan → ov → Haus hat keinen Zwilling (§2), Körper und Grammatik stehen (§3). Die Welle ist zu drei Vierteln Konsum.

**Korrektur 1:** Keine neue Grundriss-Grammatik. Neu ist nur das **Raumprogramm**; es legt sich auf `GRUND`, `annexN` und die Geschosse.
**Korrektur 2:** „Öffnung“ gehört nicht in die Welle. Punkt 11 ist ein eigenes Gesetz; Fenster und Tür folgen schon den Flügel-Wänden (:502–505).

**Das Gesetz:** `BAU_PROGRAMM`, eine Tafel neben `STADT_GRAMMATIK`: je Nutzung die Räume mit m², Geschoss und Lage (Straße/Hof) — Wohnteil
mit Kammern je Person · Stall/Tenne · Werkraum mit Esse · Laden im Erdgeschoss · Saal · Schiff/Chor/Turm · Lager. Der Haushalt wird Datum des
Loses (`leute` aus Wohlstand und Rang); `bauProgramm(p, o)` legt die Summe auf `W/D/storeys/grundriss/annexN/turm …`. Der Bauernhof wird
L/U/Hof mit der Scheune als Flügel.

**Der EINE Chokepoint:** der Schnitt der Bauten in `DORF`, fachwerk-core.js:3980–3982 (`houses.push(v)`) — jeder Bau des Plans läuft dort
durch, auch Kirche, Burg, Viertel und frühere Bauten.

**Leser, die umziehen:** Tafel `bau` :3811–3829 und die Maß-Sätze in DORF (:3922–3924, :3929, :3940, :3943, :3946, :3957, :3964) → Programm.
`leuteVon` :9047 liest `hp.leute`; seine Leser bleiben (stamm/siedlung-bewohner.js:456, :775, :835; gate:kreatur-takt). `metaParams` :8986
liest dieselbe Tafel, das Labor (worlds/fachwerk/fachwerk.js:628–637) zeigt dasselbe Gesetz wie die Welt.

**Fällt:** der Zwilling Personen → Größe (:9011–9013) · die Maß-Literale der 22 Rollen · die Scheune als eigenes Häuschen.
**Zielbild:** Labor-Blatt Nutzung × Rang (6 × 3, Mittag). Dorf am Messort und Stadt s7 vorher ↔ nachher an denselben headless Zahlen
(vorher Dorf 10 Klassen, 15/16 I, Geschosse 1–2; s7 72/310, 293 I), dazu das Bild an den zwei Kameras der Vorlage. Grenze: L2 ≤ 7 000 und
L0 ≤ 132 000 über 32 Stile am Regler-Rand (gate:asset-contract), Stoffe je Haus gleich (7).

**Löst NICHT:** Tektonik und Kultur-Formen (Punkte 1–5; ein griechischer Hof bleibt weißer Kasten, nur in U-Form) · Deckung, Verband, Öffnung,
Ornament · Orts-Stoff und Klima · das Grundstück · den Langbau über 11 m (ungelesen) · die Dichte der Hof-Lose · neue Rollen in Städten
außerhalb 500–1800. Konflikt mit w28-haus-stoff: keiner im Bereich (Plan statt Bake/Stoff), aber dieselbe Datei.
