# Bau-Breite — Synthese der Bau-Zeilen (Schwarm, 18.11.)

**Ehrliche Kopfzeile: die 115 Zeilen sind zu 0 % konsumiert.** Kein Kern-Leser liest sie, bis das Gesetz `bauRezept` steht (Kopf 1).
Heute ändert keine von ihnen ein Pixel. Gelesen am origin/main d3ddb51c (Lese-Baum), nur lesen. Eingang: bau-gesetz.md,
bau-zeile.schema.json, 11 Zeilen-Dateien, 10 Familien-Blätter (Überschriften und Lücken-Abschnitte), 3 Prüf-Blätter.
Ergebnis: `bau-zeilen.json` (daneben, ein Array, jede Zeile mit `familie`, JSON.parse grün, gerechnet mit node).

## 1. Die Schnittstelle (der EINE Chokepoint)
- **`kulturParams(name, seed)` fachwerk-core.js:2025–2038** (gelesen): Kultur × Würfel in der Folge pitch → W → D → storeys (:2029–2032).
  9 Rufer (gelesen per grep): fachwerk-core.js:3866, :3883, :3921, :3934, :3946, :3957, :5252 · worlds/fachwerk/fachwerk.js:35, :844.
- Das Gesetz `bauRezept({nutzung, bauweise, rahmen}, haushalt, seed) → hp` ersetzt es an allen 9 Rufern. Nicht `houses.push`
  (:3980–3982, gelesen): dort haben Bau-Tafel und DORF-Literale schon geschrieben, und das Labor kommt dort nie vorbei.
- Rückrichtung am selben Gesetz: `LEUTE_GESETZ` :9046 und `leuteVon` :9047, Rückrechnung aus der Fläche :9054–9056 (gelesen).
- Byte-Wache: `gate:fachwerk-contract` → scripts/diag-fachwerk-contract.cjs, `shellPfad` ruft `FC.kulturParams` (:97–98, gelesen).
- Der Weg in die Welt bleibt der EINE Export `exportSettlement` :9241 (gelesen). Draws: 0 je Zeile (bau-gesetz.md §5, nicht gemessen).

## 2. Die Zeilen: was steht, was fiel, was berichtigt wurde (alles gerechnet, Merge-Lauf mit node)

Eingang 117 Zeilen (60 nutzung · 32 bauweise · 25 rahmen, mit den 2 ref-Zeilen der Beweis-Datei). **Bestand 115**:

| familie | nutzung | bauweise | rahmen | | familie | nutzung | bauweise | rahmen |
|---|---|---|---|---|---|---|---|---|
| beweis | 2 | 3 | 2 | | antike | 6 | 3 | 2 |
| bauphysik (neu) | 0 | 0 | 1 | | ostasien | 7 | 4 | 2 |
| fachwerk | 4 | 4 | 2 | | moderne | 6 | 4 | 2 |
| holz | 5 | 4 | 2 | | herrschaft | 5 | 1 | 0 |
| stein | 5 | 5 | 4 | | werk | 12 | 0 | 0 |
| mittelmeer | 7 | 4 | 2 | | rahmen | 0 | 0 | 5 |
| **Summe** | **59** | **32** | **24** | | | | | |

**Gefallen (Zeilen, 3):** 2 ref-Zeilen der Beweis-Datei (beweis.json:113, :177 laut Prüfer Gesetz; das Schema kennt keinen Verweis,
die Zeile steht schon) · fachwerk:scheune (Doppel-id; werk:scheune bleibt, sie trägt die Bansen je Person = Haushalt).
**Umbenannt (2):** moderne:reihenhaus → `arbeiter_reihenhaus` (5 m²/P), moderne:speicher → `lagerhaus`; stein:reihenhaus und werk:speicher behalten den Namen. Doppelte ids jetzt 0.
**Gefallen (Regeln, 58 von 80; es bleiben 22 + 3 in bauphysik_ort = 25):**
- 19 Regen → Überstand und 6 Sockel-Regeln: Zwilling derselben Physik in 19 rahmen → EINE Zeile `bauphysik_ort` (Prüfer Gesetz §6.3).
  Überstand als Untergrenze (`op max` mit Kurve), damit die Kultur-Traufe der bauweise steht (ostasien 0,9–1,56 m); ostasiens eigene Kurve fällt darauf.
- 18 Index- und Wildcard-Zeiger (`raeume/0` 13, `grundriss/0` 2, `nachbarschaft/4` 1, `*` 2): trafen jede Nutzung am selben Platz (Isba-Regel als Weltgesetz).
- 9 Schnee → Neigung „plus 8“: ohne Bedingung auf Deckung und Neigung > 30° falsch (Prüfer Physik F13, Gesetz §3; alpenchalet 32 → 56°).
- 5 Spannweite im rahmen: überschrieben den Träger jeder bauweise (4,9 m Holz auch am 11,66-m-Saal), zwei Lasten für eine Decke (F14).
- 1 antike_polis EG aus rang: gab jedem Wohnhaus am Kern 7,4 m Erdgeschoss (Prüfer Spieler §3).
**Gefallen (Zeichen 9, Bedingungen 4, Bezüge 4):** 9 Zeichen mit `band=`/`region=` (rathaus_laube, zunfthaus, rathaus ×3, stadtpalais arkade,
turmhaus zinnen, karawanserei zinnen, gasthaus arkade): die Kultur gehört in rahmen/bauweise. 4 Bedingungen ohne Grammatik gestrichen, das Zeichen bleibt
(stabkirche glocke, speicher_stelzen veranda, machiya schild, windmuehle turm). 4 Nachbarschaften auf `wohnhaus` (ein anderer Bau, kein Raum; werk).
**Tote Verweise:** 14 KULTUR-Namen auf bauweise-ids umgeschrieben (z. B. italienisch/spanisch/provenzalisch → mittelmeer_bruchstein_kalkputz,
viktorianisch → ziegel_massiv_eisen, holzhuette → blockbau_rundholz); 16 entfernt (tudor ×3, hanseatisch, hollaendisch, volle_moderne, alpenchalet,
skandinavisch; werkstatt ×3, kapelle ×5). Danach 0 tote Verweise.

**Berichtigt, Zahl bleibt in der Zeile:** Physik F1 minka 8,6 → 7,3 m · F2 machiya 6,8 → 6,2 · F3 Speicher-Beleg 5,3/8,8 → 4,9/6,9 · F4 Wand 0,28 → 0,31 ·
F5 Raster [5,0 · 4,0] → [4,8 · 4,2] · F6 stabbau geschätzt · F7 Blech-Grenze 1,15/2 → 3° (3 Zeilen, Neigung mitgehoben) · F8 Palast-Hof 150 → 121–529 m² ·
F9 Turmhaus max 7 → 5 · F10 Industrie-Geschosse 57 → 16 · F11 Setzung in m je Geschoss (4 Zeilen) · F12 Rauch geschätzt · F15 Ziegelbeton EG ≤ 4,8, Spanne ≤ 20 m.
11 Quellen-Etiketten (7 → geschätzt, 4 → überliefert), Belege gasthaus-Keller und Sockel, tote Neigungen barock 28 → 30 und ägäis 12 → 18,
stein:kirche Schiff je Person → je Bau 75 m² (Gemeinde 150 × 0,5, bis der Ort Eingang ist), 21 × `lang` → `I`, 4 × `segment` → `stich`, mansard-Form,
18 Bedingungen als Daten `{aus, op, wert}`, 29 Zeichen ohne Schalter auf `neu: true`.

**Gegen das heutige Schema (ohne `familie`): 95 von 115 gültig** (gerechnet mit dem Prüfer pruef-schema.cjs). Die 20 übrigen tragen genau die
Schema-Deltas von Kopf 1: `wenn` als Objekt (18), `stich` (4), `mansard` (1), ortloser rahmen (1).
**Ohne Leser im Plan:** 11 nutzungen stehen in keinem rahmen (herrschaft 5, werk 6: wassermuehle, windmuehle, stall, markthalle, faerberei, werft);
bauweisen pfosten_plane und quader_wehrbau stehen in keinem rahmen (gerechnet).

## 3. Was in den Prüf-Blättern fehlt

- **bau-zeilen-beweis.md gibt es nicht** (Prüfer Gesetz nennt es); der Text steht in bau-gesetz.md §3.
- **Der Spieler-Prüfer zählte ohne die Beweis-Datei** (108 Zeilen): sein „wohnhaus hat keine Zeile“ ist falsch, beweis:wohnhaus steht
  (EINE Zeile für jede Kultur). Wahr bleibt: sie wirkt erst über den Packer, und die Fläche je Person hat vier Werte (20 · 8 · 6/10 · 5; L8).
- **Der Physik-Prüfer las die 10 Blätter nicht** (eigene Angabe); F12 nennt „EIN Polster“ ohne die Zahl — die Zahl bleibt offen (Lücke L13).
- **Keiner hat ein Bild, ein Dreieck oder eine Bake-Zeit gemessen**: das L2-Budget je Grundform, der Fall „Geschosse über 12“ (stapelBau :2490,
  ungelesen bei allen) und die ≈ 15 000 Gestalt-Klassen (geschätzt) sind ungemessen. Die Rangfolge der Sichtbarkeit ist geschätzt, nicht gesehen.
- **Kein Prüfer las die Auswahl, welcher rahmen gilt:** im Jahr 1500 decken 5 rahmen `mitteleuropa` ab (Prüfer Gesetz §3) — die Regel dafür fehlt im Gesetz.

## 4. Die gesammelten Lücken im Gesetz

**Schema-Deltas, die Kopf 1 trägt (sonst bricht das Schema später):** `regel.ziel` nach id statt Index, `*` verboten (L2) · `wenn` als Daten
`{aus, op, wert}` an Zeichen UND Raum, `aus` um `geschosse` erweitert (L3, L11) · `ort.region` optional = ortloser rahmen, Reihenfolge
bauphysik → Ort → Zeit · `op min/max` mit `punkte` (Kurve als Grenze) · Form-Enum + `mansard`, `pyramide` (Kern baut beide, fachwerk-core.js:1702–1704
gelesen) · Bogen `stich` statt `segment` (:1026, :1039 laut Prüfer) · `lang` fällt aus dem Grundriss-Enum (GRUND :499 kennt es nicht, :500 fällt still
auf L/I — gelesen) · `alter.setzung` Einheit m je Geschoss · Kultur-Tafel `kultur: {bauweise, rahmen, farbe}` für 32 KULTUR-Namen (:1979–2011).
**Offen im Gesetz, mit Messnamen der Familien (Zahl = Familien, Prüfer Gesetz §5):**
L1 Ort/Gemeinde als Eingang (8) · L2 rahmen tauscht Räume nicht → 8 Wohnbauten mit Kultur im Namen (8) · L3 Bedingung auf Deckung/Tragwerk/Jahr (8) ·
L4 Region zu grob, 6 Werte (7) · L5 Ausrichtung (5) · L6 fehlende Tragwerke, 4 von 7 ungebaut (5) · L7 Spannweite aus Nutzlast (5) ·
L8 Fläche je Person je Nutzung/Epoche (4) · L9 offene Räume, Brutto/Netto 0,7 (4) · L10 Dachformen shed, tonne, irimoya, zwiebel, gestaffelt (4) ·
L11 `aus` zu schmal (4) · L12 Tor/Durchfahrt (3) · L13 Rauch ohne Kamin, EIN Polster (3) · L14 Stoffe Beton, Stahl, Papier, Grassode, Bretter (3) ·
L15 Einheiten (3) · L16 Wand je Seite/Geschoss (3) · L17 Zeichen ohne Maß (3) · L18 relative Maße (3).
**Aus Physik und Auge dazu:** Stoff `abdichtung` (F7) · Wanddicke aus Spannweite × Geschosse (F9, F10, F15) · Maximum je bauweise (F10) ·
Klima je Los: 42 von 77 Regeln lesen klima.*, ein Ort trägt EINEN Wert, streut also nicht von Haus zu Haus (Prüfer Spieler §3) ·
Auswahl-Regel bei überlappenden rahmen · Bezug auf einen anderen Bau (4 gefallene Nachbarschaften) · Wand-Art ist nur Farbe: bruchstein,
quader, lehm, putz fallen auf STILMODE stein (:183, GLATT :197 laut Prüfer) · 6 KULTUR-Namen ohne bauweise-Zeile im rahmen (tudor, hanseatisch,
hollaendisch, volle_moderne, alpenchalet, skandinavisch) · der Flügel fängt seinen Fehler still (:1755, gelesen) — fail-soft, ROT in Kopf 2.

## 5. Die Reihenfolge der Schnitte (Köpfe)

Alle Köpfe besitzen fachwerk-core.js und laufen darum **nacheinander**; je Kopf EIN Besitzer. Jeder Kopf hebt die Konsum-Zahl der Kopfzeile
(Zeilen mit echtem Leser / 115) und nennt sie im Commit. Das Bild je Kopf: das Labor-Blatt Nutzung × Rang der Welle, dazu Dorf und Stadt
vorher ↔ nachher an denselben zwei Kameras der Vorlage (200 m Silhouette, 5 m Detail).

**Kopf 1 — das Gesetz selbst, byte-gleich.** Besitzer fachwerk-core.js; beginnt erst nach der Abgabe des Zweigs w28-haus-stoff (origin 3bbde98f, ls-remote).
`bauRezept` ersetzt `kulturParams` an allen 9 Rufern; die Tafel `BAU_ZEILEN` steht neben KULTUR; KULTUR wird die Kultur-Tafel (Paar bauweise × rahmen);
das Schema trägt die Deltas aus §4. Eingefädelt mit den drei Beweis-Zeilen (beweis: wohnhaus × aegaeis_putzbau × antike_aegaeis ·
wohnhaus × alemannisch_stockwerkbau × mitteleuropa_1500 · marktstand × pfosten_plane × mitteleuropa_1500). Labor zuerst: `applyKultur` und
`applyMeta` werden EIN Ruf (worlds/fachwerk/fachwerk.js:35, :630), `metaParams` :8986 stirbt.
Spieler sieht: nichts Neues — das ist der Beweis. Bild: Dorf und Labor vorher ≡ nachher, byte-gleich (PRESETS 32 Kulturen × 16 Samen über
gate:fachwerk-contract, Golden; gebaute Neigung 18° = Zeile 18°). Konsum danach 7 / 115. Dateien: fachwerk-core.js, worlds/fachwerk/fachwerk.js,
scripts/diag-fachwerk-contract.cjs.
**Kopf 2 — die Masse der Stadt (Silhouette, Rang 1–3).** Der Packer `bauProgramm` (Räume → Geschosse → Grundform → Flügel/Anbau, gegen das Los
`losGrundriss` :8495) mit Budget je Grundform gegen L2 7 000; DORF würfelt `personen` neben `wohl` (:3921–3923); die Flügel-Falle :1755 wird ROT.
Zeilen: beweis:wohnhaus mit Haushalt, stein:reihenhaus, mittelmeer:hofhaus, moderne:mietshaus.
Spieler sieht: die Häuser einer Straße sind verschieden groß und tief, nach Haushalt; Höfe und U-Formen brechen die 95,6 % I (Karte, laut Prüfer Spieler).
Bild: Labor-Blatt wohnhaus/reihenhaus/hofhaus/mietshaus × Rang; Stadt 200 m vorher ↔ nachher, Maß: Gestalt-Klassen (heute s7 72/310) und L2-Höchstwert.
Dateien: fachwerk-core.js (DORF, HAUS-Grundriss :499–528, :1755, leuteVon :9047), worlds/fachwerk/fachwerk.js.
**Kopf 3 — Gefälle und Schichten (Rang 4–5) + bauphysik_ort.** Zeilen: mittelmeer_neuzeit_nord (Geschosse vom Kern 7 zum Rand 3 über rang),
mitteleuropa_industrie_1800 (Baujahr → EG/OG-Höhe, Geschosse 3 → 5), bauphysik_ort (Überstand und Sockel aus dem Klima — die ersten
Schreiber von ovEave und foundH, :168, :171). Klima je Los geht in den Plan, sonst streuen die Klima-Regeln nicht.
Spieler sieht: die Stadt steigt zum Kern an, Jahresringe der Bauzeit stehen als Traufhöhen-Sprünge; im Regen-Ort tiefere Traufen.
Bild: Stadt 200 m Kern ↔ Rand vorher ↔ nachher; Labor-Blatt reihenhaus × Rang × Baujahr. Dateien: fachwerk-core.js (DORF :3915–3934, HAUS :168–171).
**Kopf 4 — die Skyline (Rang 6–8, 12).** Zeilen: mittelmeer:turmhaus, stein:stadtpalais, stein:kirche, fachwerk:rathaus_laube; dazu
herrschaft (burg_palas, bergfried, stadttor) in einen rahmen; Form mansard für franzoesisch_mansardbau und pyramide (Kern baut beide).
Spieler sieht: Türme, Kuppel, Mansarde und Kirchturm als Anker über der Masse. Bild: Stadt 200 m Skyline vorher ↔ nachher; Labor-Blatt
turmhaus/stadtpalais/kirche/rathaus_laube × Rang. Dateien: fachwerk-core.js (ROOFMODE :207, dachAlt :1701–1706, Zeichen-Schalter PARAMS :5207–5228).
**Kopf 5 — der Kontrast im selben Rahmen (Rang 9–11).** Zeilen: werk:gasthaus, fachwerk:fraenkisch_zierfachwerk neben stein:barock_putzbau
(mitteleuropa_gotik und mitteleuropa_barock nennen beide); werk in die rahmen (schmiede, backhaus, scheune, stall, markthalle).
Spieler sieht: in einer Gasse steil-dunkles Fachwerk neben hellem Walm; Werkbauten mit Tenne und Esse statt Wohnhaus-Körper.
Bild: Dorf 5 m und 200 m vorher ↔ nachher; Labor-Blatt werk × Rang. Dateien: fachwerk-core.js (SG.bau :3812–3828 fällt in die Zeilen, Scheune :3964–3968).
**Kopf 6 — Detail auf 5 m.** Leser für die toten Felder: Fensterbreite (fest :485, gelesen), sturzMax und Bogen `stich`, Wand-Art je Stil
(bruchstein ≠ quader ≠ lehm ≠ putz statt nur Farbe), Deckungs-Art, die `neu`-Zeichen esse/glocke/schild/kreuz/tor (29), patina auf das Haus.
Spieler sieht: Fenster wachsen mit der Bauzeit, Bruchstein sieht nicht wie Putz aus, ein Schild am Laden, eine Glocke am Rathaus.
Bild: Dorf und Stadt 5 m vorher ↔ nachher; Labor-Blatt Detail × Rang. Dateien: fachwerk-core.js (HAUS :158–212, STILMODE :180–187, :485).
Jeder neue Stoff kostet +1 Draw je Seh-Klasse weltweit (bau-gesetz.md §5) — die Zahl steht im Commit.
**Kopf 7 — die fehlenden Tragwerke (L6, L10).** saeule_gebaelk zuerst (trennt Antike von Mittelmeer, auf 200 m heute verwechselt), dann
blockbau (holz:blockbau_rundholz ≡ isba heute), skelett und shed (eisen_glas_halle baut heute einen 15-m-Keil statt Sägezahn; sie bleibt bis hier in
keinem Bild). Spieler sieht: Säulenhallen, Blockwände mit Eckverband, Shed-Dächer. Bild: Labor-Blatt Tragwerk × Nutzung; Stadt der Familie 200 m.
Dateien: fachwerk-core.js (neue Fabriken hinter `tragwerk`, AUS_BAU :7332 als Muster).
