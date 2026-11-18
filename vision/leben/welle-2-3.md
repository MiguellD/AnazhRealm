# WELLE 2 und WELLE 3 — Urteil über drei Spikes (Richter, main 18058dba, nur gelesen)

Gefahren habe ich alle drei Skripte selbst, parallel (unter gegenseitiger Last): leibraum 16,8 s, stammbaum 29,0 s, pflanzen 10,4 s.
Jede Zahl ohne Zeitangabe ist BYTE-GLEICH zur Referenz-Ausgabe der Spikes (diff leer; stammbaum Prüfsumme 3e3ea153).
Dazu kommen drei eigene Proben im Scratch (`spike/richter/`), die die Kerne genauso lesen:
- `groesse.cjs`: die Größen-Achse über die Massen-Dekaden des Stammbaums (Kern-Refit, 7,1 s).
- `rf.cjs` und `rf-sprung.cjs`: stammbaum#1, Robinson-Foulds von 10 Arten aus Brown- bzw. Sprung-Merkmalen.
- `rf-ziel.cjs`: dieselbe Messung mit 10 Arten aus Kladen von 10³ bzw. 10⁶.
Was nicht lief, steht als „nicht gelaufen“.

## 1. WAS TRÄGT / WAS FÄLLT — je Spike, mit der Zahl

### leibraum — TRÄGT im Bauplan. Die Größen-Achse des Entwurfs fällt, eine Art-Klasse fällt nicht
TRÄGT (nachgefahren):
- Der Täter heißt `__leibRaumRefit` (foundry-core.js:7421): sein Rahmen trägt keinen Radius. In der Gegenprobe ohne Radius liegen am
  Kalb 21,6 % (170/788) der Ecken neben der Fläche, bei Wolf → Fuchs 4,9 %; mit Mi/r sind es 0,4 % (nur Ohren) bzw. 0,0 %.
  Am Kern nachgerechnet: `__tierAbstand` :8520 = (|Mi·x| − r)/|Miᵀ·û| ist homogen in (Mi, r). Mi/r mit r = 1 lässt das Feld also
  unverändert, und der Schnitt gehört in den Refit-Rahmen, nicht in `__tierPrims`. Dann bleiben die Guss-Bytes gleich.
- Das Individuum Wolf mit 4 Achsen an ±2σ: sichtbar p95 0,2 / max 1,8 mm. Das Kalb mit 3 Knoten: p95 0,1–0,5 mm. Die
  Wechselwirkung Größe × Bein: p95 0,5 mm. Die Gelenke mischen linear auf 0,0–0,1 mm.
- 2b mit fester Gliederzahl (Hals 12, Rute 10) und w als Achse: Wolf und Fuchs teilen einen Baum (239 Meshes), der Refit liegt 0,0 %
  daneben. t = 1: p95 0,9 / max 1,9 mm. t = ½: p95 2,4 / max 13,7 mm, an 8 Ecken der Rute.
FÄLLT bzw. ist widerlegt:
- **Die Größen-Achse „Knoten [−2σ, 0, +2σ]“ (T1 des Spikes) trägt keine Arten** (eigene Probe `groesse.cjs`).
  - Die ±2σ-Achse, linear extrapoliert: 1 kg → p95 18,3 / max 64 mm (der Leib ist dort 0,2 m hoch), 15 kg → 45,6 / 157,8 mm,
    1,9 t → 223 / 904 mm.
  - Allein die Größe ändert schon den Baum: Rute 10 Glieder bei 0,027–15 kg, 8 bei 64–335 kg, 2 bei 1,9 t.
  - Innerhalb EINES Baums trägt eine ln-M-Achse mit einem Knoten je ≤ 1,2 Dekaden. Knoten 0,027 · 1 · 15 · 335 · 1900 kg geben
    bei 0,2 kg p95 0,0 / max 0,1 mm und bei 5 kg p95 0,3 / max 3,3 mm (≤ 1 % der Höhe).
  - Das zählt, weil der Stammbaum 90 % seiner Arten unter 1 kg zieht (Median 27 g), während die vier Wurzeln bei 15–335 kg liegen.
- **Bär und Hirsch bleiben eigene Bäume** (237 / 191 Meshes, die Wörter Pfote und Ohr), also 3 Vorlagen für die 4 Wurzeln. Ob
  Pfote und Ohr stetig werden können, ist nicht gebaut und nicht gemessen.
- Der Drehpunkt mit den Knochen der Vorlage liegt bis 43 mm (±2σ) bzw. 58 mm (Kalb) falsch, es braucht Gelenk-Formziele. Das ist nur
  als Schranke gerechnet.
- Prüfung auf Zirkel: 2b misst an einer Kern-KOPIE mit 4 ersetzten Ankern, nicht an einem Zweit-Modell. Ich habe die Anker gelesen,
  zulässig. σ = 5 % ist gewählt. „Sichtbar“ heißt |Feld| an der Ecke (Fläche ohne Raster). Es misst LAGE, nicht Deckung; die Deckung
  steht nur an den Zielen (Fuchs-Rute max ∞).

### stammbaum — die ADRESSE TRÄGT. Die sichtbare Verwandtschaft FÄLLT
TRÄGT (nachgefahren):
- Blatt 10⁶: 14,8 / 34,1 / 57,2 µs (Topologie, +Merkmale, +Areal), Heap-Δ nur Rauschen, zwei Fabriken byte-gleich.
- Die MRCA kostet 6,6 µs, ohne dass etwas aufgezählt wird.
- Region 200 m: Knoten p50 2 019, p95 4 412. Frisch gemessen p50 0,81 ms, p95 1,77 ms. Nachbarschaft: Jaccard 0,47 bei 100 km,
  0,09 bei 300 km.
Kein Beweis des Gedankens:
- Colless 0,132 und β̂ −1,00 zeigen nur, dass die Umsetzung stimmt: β = −1 ist im Gesetz gesetzt, β̂ findet den Eingang wieder.
  stammbaum#2 fällt damit per Bau; das ist erlaubt, beweist aber nichts über die Welt.
FÄLLT (eigene Probe `rf*.cjs`, am Gesetz des Spikes):
- **stammbaum#1 „10 Arten, Verwandtschaft sichtbar, RF ≤ 0,3“** verfehlt die Schwelle:

  | Achsen | RF p50 | Anteil der Kladen mit RF ≤ 0,3 |
  |---|---|---|
  | 5 | 0,71 | 6 % |
  | 8 | 0,57 | 16 % |
  | 12 | 0,43 | 33 % |
  | 20 | 0,43 | 45 % |

  - Sprung-Merkmale (seltene große Schritte) machen es schlechter: p50 0,57–0,86.
  - Zehn Arten aus größeren Kladen (10³ / 10⁶) ebenso: p50 0,86–1,00. Fast ein Stern, CV der patristischen Distanz 0,19–0,21.
  - Mantel r ≥ 0,5 (stammbaum#4) braucht 20 Achsen (0,55 / 0,58). Welle 2 liefert 7 sichtbare Erb-Achsen (3 w, Hals, Bein, Statur,
    ln M). Am Bild-Deskriptor liegt r unter dem Wert am Merkmal.
- **„S1 jetzt“ ist widerlegt**: leben-core.js gehört B1 der Welle 1 bis zu deren Landung.

### pflanzen — Kern-Bau TRÄGT. Die Zahl 92/100 ist zum größten Teil Konstruktion
TRÄGT (nachgefahren):
- 100 Díaz-Punkte bauen im echten Kern mit 0 Fehlern (Skelett 61/61, L0 56/56).
- Die Corner-Probe zeigt den Täter: r(log LA, Glieder) = +0,05, weil rMin = 0,045·trunkR und lMin = 0,012·H relativ sind
  (phyto-core.js:136–137, gelesen).
- Schwestern im Abstand 0,3 SD: die Topologie ist bitgleich (Glieder 737,8/737,8, ΔRGB ≤ 2,4).
- Die Schwelle springt: Nadel → Laub, Glieder 2 627 → 745, ⌀/H d′ 16,6.
- forestNicheWeights ist an allen 4 Orten byte-gleich; es hat keinen Eingang für T und P (:2823).
- laub-kante (afb90b8e, NICHT in main) wirft bei einer Konifere ohne Kronen-Zeile.
FÄLLT bzw. ist widerlegt:
- **„92/100 plausibel“ ist keine Messung der Wuchsform**. Der Soll-Bauplan kommt aus Schwellen über dieselben Merkmale
  (`bauplan(m)`, pflanzen.cjs:72). Damit ist „Ist = Soll 100“ fast tautologisch. Bei Kraut und Strauch setzt die Skala die Höhe
  (selbst benannt: „kein Test“). Echte Tests sind nur Tris ≤ Zeile (93) und ⌀/H im Band (99). Die Schwelle < 70 konnte nur über
  Abstürze reißen.
  - Der Spike widerspricht damit seiner eigenen Entscheidung („Bauplan nie aus Schwellen“). Mit dem Bauplan als Wurzel braucht jede
    Wurzel eine BEDINGTE Merkmals-Verteilung. Nicht gelaufen.
- **arten#2 fällt erst mit 7/7 Wuchsformen**. Die Sprosse nennt sie wörtlich. Der Kern baut 4. Kletterer, Sukkulente und Moos sind
  Gesetze, die fehlen.
- Nische 3/5 bei gesetzten Konstanten. Preis (82,5 → 6,6 MiB, 300 → 36 Draws) ist Rechnung, auf der GPU nicht gelaufen.
- P1/P2 sind parallel zu T2 des Leib-Raums geplant, alle drei in foundry-core.js oder phyto-core.js. Das kollidiert, also nacheinander
  (§3).

## 2. DAS GESETZ — wie es in den Entscheid §1 eintritt (EINE Quelle, benannte Leser, was beim Namen fällt)

**Die Adresse wird zweistufig, und das gilt für Tier und Pflanze gleich.**
- `artId(wurzel, pfad)`: die WURZEL ist der BAUPLAN, also die diskreten Wörter. Tier: hund (wolf+fox) · bär · hirsch. Pflanze: laub ·
  nadel · strauch · gras · kraut · farn · röhricht.
- Der PFAD trägt nur stetige Achsen. Ein Bauplan wird nie aus Merkmals-Schwellen geurteilt; gemessen sind beide Sprünge (Nadel → Laub
  und Rute 8/10/2).
- Die Wurzel kommt aus der tiefen Spaltung des Stammbaums des Samens. Eine Spaltung erbt den Bauplan; ein Bauplan-Wechsel ist ein
  benanntes Ereignis an einem Knoten, keine Schwelle.

**leben-core.js (`__lebenCore`) bleibt die EINE Quelle** für Erbe, Achsen, σ, Wuchs, Stammbaum und Zufall. Welle 2 ergänzt:
- `achsen` += `hals`, `bein`, `statur` (nur mit Leser T1/L2 und Auslese L3).
- `wuchs(M∞, alterS)` = masseZurZeit/M∞, die Alters-Koordinate des Leib-Raums. Es gibt keine zweite Wachstumskurve.

Welle 3 ergänzt:
- `LEBEN_GESETZ.stamm` und `zufall` (Umzug aus planet-core.js:145–160).
- `stammSpalt`, `stammAlterMa`, `stammKinder`, `artMerkmale`, `artAreal`, `mrca`.
- `artenAm(…, budget)`, als Scheibe, nie als Spitze.
- `PFLANZEN_RAUM` mit raumPunkt/pfadPunkt/merkmal, je Wurzel BEDINGT (μ_Wurzel, nicht ein globales Díaz-Mittel).
- `masseAdult(Mbar = e^{artMerkmale[0]}, a, e)` verbindet Art und Individuum in EINEM Gesetz.

**Die Gattungs-Kerne lesen nur:**
- tetrapoda-core.js: `TIER_BAUPLAN` mit fester Gliederzahl Hals 12 / Rute 10, `TIER_RAUM`, `tierRaumDials`, `tierRaumPunkt`.
  `TIER_RAUM` hat diese Achsen:
  - w im Bauplan, Knoten 0, ½, 1;
  - hals, bein, statur, diet mit Knoten ±2σ, σ aus leben-core;
  - ln M mit einem Knoten je ≤ 1,2 Dekaden über [wandKg, maxKg(g)];
  - wuchs mit Knoten q, (q+1)/2, 1.
- phyto-core.js: `BAUPLAN`, `hdGreenhill`, `zweigMass` (Corner, in Metern), `kroneAnteil` (gemessen am gewachsenen Schirm), `nische`
  (das Klima des Orts).
- foundry-core.js: der EINE Tafel-Ofen `__leibRaumRefit` (der Radius im Rahmen) und `__tierRaumTafel` (der Primitiv-Satz der
  Vorlage, Gelenk-Formziele).

**Benannte Leser:**
- stoff-gang.js `_gangZielTafel(name, achsen)` :471 (Mensch und Tier, EIN Tafel-Bauer).
- koerper-leib.js `_ofenKreaturKey` :1033 → `bauplan|lod`.
- kreatur-leben.js: Tier-Satz `_tierSatzFuer` :2944 (der Punkt kommt aus dem Bestand); die Region ruft `artenAm`; die Geburt wählt
  aus R.arten.
- vegetation-wiese.js und studio-gestalt.js: die Art als Instanz-Parameter ihrer Wurzel-Gestalt.
- voxel-worker.js :1194–1207: das Klima reist in den Wald-ctx.

**Was beim Namen fällt (ganz, je in der Welle, die den Leser stellt):**
- W2:
  - `Math.ceil(nLen / (0.75 * nR[0]))` tetrapoda-core.js:4755 und `Math.round(A.schwanz.segs)` :4833 (Absenz-Grep 0).
  - Der Gauß-Wurf `artGewichte` :4062 für den Bestand.
  - `maxCreatures: 20` dirigent-kern.js:280 als Zahl.
  - Der Ofen-Schlüssel `recId|lod|dials`.
  - Die relativen Zweig-Enden rMin/lMin phyto-core.js:136–137.
- W3:
  - `GATTUNGEN` :62 und `ART_GESTALT` :3973 werden Wurzel-Stützstellen (keine Art-Tafel mehr).
  - Die Verhaltens-Tafeln :289, :1998, :2077, :2125 werden Funktionen von (M, Kost, Statur); eine „nächste Stützstelle“ ist ein
    Zwilling und fällt.
  - Der IR-Wurf phyto-core.js:2481–2491 und `treePhenotype`-Schwellen als Art-Urteil.
  - `forestNicheWeights` :2823 samt AUTO-Arten-Hash vegetation-wiese.js:2583–2589 und dem Zwilling `_scatterSpeciesForCell`
    vegetation-streu.js:202–230.
  - `FOREST_PACK.crown` als Namens-Tafel und die Kronen-Zeile `ph.krone` von laub-kante.
  - V = 2 je Art (studio-gestalt.js:935) und `gestalten['*'] = 16`.
  - Der Alias `baum_palme → weide` (studio-bruecke.js:3844), ohne stillen Ersatz.
  - `PLANET_ERDE` für jede Saat (voxel-worker.js:1159): erst in der Fremd-Physik-Bahn, hier nicht.

## 3. DIE BAHNEN — ausschließlicher Datei-Besitz

Welle 1 hält bis zu ihrer Landung: leben-core.js, cores.manifest.json, index.html, package.json, tetrapoda-core.js,
stamm/koerper-leib.js, stamm/kreatur-*.js, stamm/feld-leben.js, stamm/netz-p2p.js, stamm/daten.js und die B4-Skripte
(diag-kreatur-leben, diag-koerper-stand, diag-kollision-bild, diag-studio-uebergabe, diag-studio-vertrag, playtest/gelaende-boden,
lib/kampf-proben, lib/kreatur-proben, lib/abdruck, spec/stamm/modul-karte.json).
laub-kante (afb90b8e, WIP) hält phyto-core.js, foundry-core.js (nur PRESETS :4729–4760), diag-phyto-tree.cjs, diag-pflanzen-nah.cjs
und die Goldens.
Abgabe je Bahn mit `node scripts/werkbank.cjs abdruck --gegen <Basis>`, `[ci voll]`.

### SOFORT — ohne eine Datei der Welle 1
**R1 raum-ofen** (startet jetzt; landet nach laub-kante, rebased auf sie)
- Dateien: `foundry-core.js` (die Hunks :7385–7560: Refit und neue Tafel), `scripts/diag-tier-anatomie.cjs`.
- Schnitt:
  - Der Rahmen von `__leibRaumRefit` trägt den Radius: A = (Mi_q/r_q)⁻¹·(Mi_p/r_p), im Refit. `__tierPrims` und `__tierFeld` bleiben
    byte-gleich, die Guss-Bytes aller 4 Gattungen auch.
  - `__tierRaumTafel(kern, vorlage, achsen)`: der Primitiv-Satz ist der der Vorlage (ti = Baum-Platz; minVox nimmt nichts heraus oder
    hinzu). Dazu Gelenk-Formziele je Knoten.
  - Die Linse steht in der Familie gate:tier-anatomie. Mutante: Rahmen ohne Radius → ROT am Namen `__leibRaumRefit` (Kalb 21,6 %).
- Bildpaar (main ↔ Kopf): der Mensch, denn er liest denselben Refit heute im Spiel. Werkbank am Spawn-Platz, Third 6 m, Mittag,
  8 Samen über das ganze Genom (w26-Satz), die äußersten Gestalten nebeneinander. Sichtbar sein muss: der Leib liegt an seinem Guss an,
  ohne Beulen an Schulter und Hüfte. Zahl: Raum-Abweichung Mittel / p95 (main 5,7 / 21 mm), am Kopf nicht schlechter.
- Sprossen: keine allein. Sie macht leben.tiere.lebenszyklus#2 baubar.
- Stopp:
  - Abdruck: Guss-Bytes gleich.
  - Mensch Raum p95 ≤ 21 mm.
  - Am echten Ofen gegen main-tetrapoda: F1 max ≤ 2 mm, Kalb max ≤ 10 mm (Ohren mit dem Primitiv-Satz der Vorlage).
  - Linse ≤ 3 min, Selbsttest ROT am Namen.

**P1 zweig-mass** (startet, sobald laub-kante gelandet ist; berührt keine Datei der Welle 1)
- Datei: `phyto-core.js` (allein).
- Schnitt: Corner im Kern. `zweigMass(LA, SSD)` gibt rMinM und lMinM in METERN und ersetzt rMin/lMin :136–137 für JEDE Art. LA kommt
  aus dem Regler über dieselbe Abbildung, die Welle 3 vorwärts liest: LA = 10^(3·leaf + 1,5) mm², eine Funktion in beiden Richtungen,
  kein Zwilling.
- Bildpaar: Waldrand an der Mess-Wiese (Profi-Band-Ort Wiese), Werkbank, Third 25 m vor dem Saum, 1,7 m Augenhöhe, Mittag, gleiche
  Saat, dazu Armlänge an Birke und Eiche. Sichtbar sein muss: kleinblättrige Arten tragen feine, dichte Zweig-Fächer, großblättrige
  wenige grobe. Heute sind beide gleich relativ.
- Zahl: r(log LA, Glieder) main +0,05 → Kopf ≤ −0,3. Dazu Tris, dc und VRAM am selben Ort unter E.
- Sprossen: keine allein. Sie macht die Tiefe von leben.pflanzen.arten#5 baubar.
- Stopp:
  - r ≤ −0,3 an den PRESETS-Arten.
  - Dreiecke ≤ Zeile 100 %.
  - K5 laub-kante nicht schlechter als nach ihrer Landung.
  - gate:phyto-core grün.

### WELLE 2 — die Gestalt aus dem Erbe (nach der Landung von Welle 1 und R1)
Reihenfolge: **L1** (≤ 1 h, Signaturen eingefroren) → **T1 ∥ T3 ∥ L2** → **L3** (nach L2 in derselben Datei). Gelandet wird EINMAL,
alle im selben Zug.
- **L1 leben-achsen** — `leben-core.js`.
  - Schnitt: achsen hals, bein, statur (sdP mit Anker oder „unsicher“) und `wuchs()`.
  - Stopp: Selbsttest grün, Steigung je Achse 0,46 ± 0,02.
- **T1 tier-bauplan** — `tetrapoda-core.js`.
  - Schnitt: TIER_BAUPLAN mit Hals 12 / Rute 10 fest. Damit fallen auch die gemessenen Größen-Sprünge der Rute (10/8/2).
  - Drei Vorlagen hund/bär/hirsch, benannt, solange Pfote und Ohr Wörter sind.
  - w in artGewichte; TIER_RAUM mit ln-M-Knoten je ≤ 1,2 Dekaden; tierRaumDials/-Punkt über die Allometrie von deriveTierParams
    :851/:865.
  - Byte: die Güsse der 4 Wurzeln ändern sich, die Platte wird einmal kalt. Ankunft kalt und warm vorher↔nachher an der Radeon;
    Pflicht B darf nicht langsamer werden. Der Tafelbau (L0-Haut+L1 48–64 s je Bauplan) läuft im Faden nach dem Bild, nie in der
    Ankunft.
- **T3 tier-satz** — `stamm/stoff-gang.js`, `stamm/koerper-leib.js`.
  - Schnitt: `_gangZielTafel(name, achsen)` (EIN Tafel-Bauer für Mensch und Tier); Ofen-Schlüssel `bauplan|lod`; Drehpunkt-Korrektur
    in `_gangSatzKnoten` :621.
- **L2 leben-bestand-2** — `stamm/kreatur-leben.js`, `stamm/dirigent-kern.js`.
  - Schnitt: der Tier-Satz liest je Individuum den Punkt (a, wuchs) aus dem Bestand; `maxCreatures 20` fällt als Zahl.
- **L3 leben-kräfte** — `stamm/kreatur-leben.js`, `stamm/kreatur-furcht.js`.
  - Schnitt: Entscheid §5. Der Riss wird Verfolgung (Sprint aus STEUER :1618), dazu Erbachse scheu, Wurf und Bilanz aus der Masse,
    Inzucht (1 − F̄).
  - Nicht gespiked; der Stopp misst muster#1 neu.
- **Bildpaar A** (Welle 2): die Hirsch-Herde der Wiese am Spawn (Messort tiere.mensch#1), Third 20 m seitlich, Mittag, gleiche Saat,
  20 min nach der Ankunft. Sichtbar sein muss: das Kalb mit großem Kopf und langen Läufen an der Mutter, die Erwachsenen verschieden
  in Hals und Bein.
  - Zahl: Kopf-Höhe/Widerrist Kalb ÷ Mutter main 1,00 → Kopf ≥ 1,4; Jungtiere ≥ 10 %.
- **Bildpaar B**: das Wolfsrudel am Waldrand, Third 15 m. Zahl: CV Bein/Widerrist main 0 → Kopf ≥ 3 %.
- Sprossen: **leben.tiere.lebenszyklus#2** fällt mit T1 + T3 + L2 + Bildpaar A. leben.evolution.muster#1 wird mit L3 neu gemessen.
- Stopp: Bildpaar A mit Zahl · Tafel ≤ 2,5 MB je Bauplan · Befehle bei 50 Tieren nicht über main · gate:tier-gang Satz-Gleiten
  ≤ 0,033 · gate:kreatur-takt p95 ≤ 7,36 ms · Absenz-Grep der W2-Namen = 0.

### WELLE 3 — die Art aus dem Samen (nach der Landung von Welle 2)
Reihenfolge: **S1** (Signaturen, ≤ 2 h) → **T5 ∥ P1b ∥ P2** → **S3 ∥ P3** → **R3**. Gelandet wird EINMAL.
- **S1 leben-art** — `leben-core.js`, `planet-core.js` (planetZufall liest `__lebenCore.zufall`), `voxel-worker.js` (eine
  importScripts-Zeile).
  - Schnitt: §2 W3; das Erbe aus dem Spike-Entwurf P0 (PFLANZEN_RAUM) liegt in DIESER Bahn, weil es dieselbe Datei ist.
  - Byte: planetPlan an 12 Saaten Plan-Hash gleich.
  - Stopp: Knoten p95 ≤ 5 000 bei N = 10⁶; Determinismus-Prüfsumme; Boot-Δ gemessen.
- **T5 tier-art** — `tetrapoda-core.js`.
  - Schnitt: Blatt → (Bauplan, w, Achsen); GATTUNGEN und ART_GESTALT als Wurzel-Stützstellen; die Verhaltens-Tafeln als Funktionen.
- **P1b pflanzen-art** — `phyto-core.js`.
  - Schnitt: BAUPLAN als Wurzel, artAusMerkmal in artPhaenotyp, der Wuchs-Strom aus artId (dann ist die Topologie der Schwestern
    eine Funktion der Art), kroneAnteil, nische(m, wurzel, klima).
  - DIE DREI FEHLENDEN GESETZE: Stütz-Gesetz (D < D_krit nach Greenhill → Kletterer am Wirt), Wasser-Speicher (Sukkulente) und die
    Wurzel Moos.
- **P2 pflanzen-bau** — `foundry-core.js` (nach R1).
  - Schnitt: PRESETS als Wurzel-Stützstellen mit m; Zeilen-Halt für Farn, Röhricht und Gras (die 7 Tris-Ausfälle); gestalten je
    Wurzel.
- **S3 stamm-bestand** — `stamm/kreatur-leben.js`.
  - Schnitt: die Region ruft artenAm (budget 1 000 Knoten je Takt) und merkt die Liste; Geburt aus R.arten; Mbar aus artMerkmale.
- **P3 pflanzen-welt** — `stamm/vegetation-wiese.js`, `stamm/vegetation-streu.js`, `stamm/studio-gestalt.js`,
  `stamm/studio-bruecke.js`, `voxel-worker.js` (nach S1).
  - Schnitt: das Klima reist in den Wald-ctx; die Art-Liste der Zelle kommt aus dem Stammbaum (artenAm) und der Nische; die Art als
    Instanz-Parameter der Wurzel-Gestalt (Kosten ∝ Wurzeln × V).
- **R3 leben-richter-3** — `scripts/diag-kreatur-leben.cjs`, `scripts/diag-phyto-tree.cjs`, `spec/stamm/modul-karte.json`.
  - Inhalt: Colless und Determinismus am ECHTEN Kern, Mutante `stammSpalt` → Yule ROT; die Pflanzen-Probe mit den Mutanten Corner
    und Schwelle.
  - DIE WUCHSFORM wird am gebauten Mesh geurteilt, NIE aus dem Soll-Bauplan, der aus denselben Merkmalen kommt.
- **Bildpaar Tier**: der Zoo des Prüfplatzes (F) mit zehn Arten EINER Klade aus artenAm nebeneinander, Third 12 m. Dazu die
  Spawn-Wiese und eine Region 300 km weiter, Third 20 m.
  - main: überall dieselben vier Gattungen.
  - Kopf: an jedem Ort eigene Arten, Jaccard ~0,09; die Gestalten in Hals, Bein, Statur und Größe abgestuft.
  - Zahl: Silhouetten-Paare gleich über beide Orte main 4/4 → Kopf ≤ 1/4.
- **Bildpaar Pflanze**: ein Hang mit 50 Arten am Waldrand der Mess-Wiese, Third 25 m.
  - Zahl: unterscheidbare Silhouetten main ≤ 5 → Kopf ≥ 20; Tris, dc und VRAM unter E (≤ 208 Draws, ≤ 118 MB).
  - Zweites Paar: dieselbe Kamera an einem borealen und einem tropischen Ort.
- Sprossen:
  - **leben.evolution.stammbaum#2** (Colless; „Baum-Blick ≤ 1 s“ ist ungemessen).
  - **leben.pflanzen.arten#2** nur mit 7/7 Wuchsformen.
  - **leben.pflanzen.arten#3** (≥ 50 im Bild, Histogramm ≤ 0,2).
  - leben.pflanzen.biome#3 mit Risiko, die Nische trifft heute 3/5.
  - leben.tiere.arten#2 fällt NICHT: Luft und Wasser fehlen als Bauplan.
  - stammbaum#1 und #4 fallen NICHT (§1).
- Stopp: Bestand-Takt p95 ≤ 7,36 ms · Region-Entstehen ohne Frame > 33 ms an der Radeon · 50 Arten ≤ 12 Karten, ≤ 60 Draws ·
  Wuchsform am Mesh ≥ 90/100 über 7 Formen · r(log LA, Glieder) ≤ −0,3 · Schwestern d′ ≥ 1 in einer Form-Größe ≥ 3/4 ·
  forestNicheWeights-Absenz 0.

## 4. DER WEG ZU 10⁶ — was nur Menge ist und wo neue Technik fehlt

| Stufe | nur Menge | neue Technik (benannt) |
|---|---|---|
| 10² Tiere (arten#2) | Land: 3 Vorlagen + Tafel tragen 10² Arten (2,45 MB je Bauplan statt 200 Güsse ≈ 960 MB) | Baupläne Luft und Wasser (Vogel, Fisch) als Vorlage + Tafel — nicht gemessen |
| 10² Pflanzen (#2) | 4 Formen bauen fehlerfrei | Kletterer (Stütz-Gesetz + Wirt), Sukkulente, Moos |
| 10³ (#3, stammbaum#3) | Adresse O(Tiefe), 0 Byte; Region p50 0,8 ms | Pflanze: Art als Instanz-Parameter (GPU, nicht gelaufen); Tier: Klassen-Häute (Feder, Schuppe); Blatt → Körper ≤ 2 s = ein Punkt auf der Tafel, kein Guss |
| 10⁴ (#4, stammbaum#4) | Tiefe 78, artenAm als Scheibe | Mengen-Stufen fürs Tier (L2/L3 wie beim Menschen); Ton-Tafel über 4 096 Zeilen; Gliederfüßer/Weichtiere als neue Baupläne; sichtbare Verwandtschaft braucht mehr Signal als Brown auf ≤ 20 Achsen (RF p50 0,43) |
| 10⁵ (#5) | Chao1 zählt Angetroffene, die Adresse hält | Schwestern trennbar: Topologie aus artId (Corner + Strom), je Art ein gemaltes Blatt statt 1 Atlas-Zelle; Nah-Gestalt je Art im Nahring (N_nah ungemessen) |
| 10⁶ (#6, stammbaum#5) | Blatt 12–33 µs bei 10⁶, Region kostet ∝ Arten × Tiefe | Fremde Physik im Spielpfad (voxel-worker.js:1159 nimmt PLANET_ERDE); Arten-Areal z bei 10⁴–10⁶ km² 0,65 (zu steil) |
| 10⁹ (stammbaum#6) | — | tote Seitenäste als Funktion (heute bei 66 Ma so viele Linien wie heute); 3·10⁸ bei 0,1 Ma |

## 5. OFFEN — ehrlich
- GPU nicht gelaufen: Tier-Satz mit 16 textureLoad je Ecke, Karten-Bake, Instanz-Parameter der Pflanze, 10⁴ im Schirm.
- Ob der Radius-Rahmen die Tafel des Menschen (w26 5,7 / 21 mm) verbessert oder verschlechtert, ist nicht gemessen.
- Pfote und Ohr stetig: nicht gebaut. Bis dahin 3 Vorlagen.
- Knoten ½ auf w nicht gelaufen (t = ½ max 13,7 mm).
- σ 5 % ist ohne Quelle gewählt.
- Ein 27-g-Tier aus der Wolf-Vorlage: liegt geometrisch innerhalb ≤ 1 % H, ob es glaubhaft ist (Panel), nicht gelaufen.
- stammbaum#1 und #4: Brown bis 20 Achsen trägt RF ≤ 0,3 nur in 45 % der Kladen. Sprung-Merkmale verfehlen, ebenso breitere
  Ausschnitte. Weder Ursache noch Hebel stehen fest (Raten-Heterogenität je Achse, diskrete Synapomorphien am Bauplan-Knoten:
  ungeprüft).
- Pflanzen: Wurzel-bedingte Merkmals-Verteilung nicht gelaufen. Díaz-Konstanten aus dem Gedächtnis. Nische 3/5.
  `planetOrt` ruft die Heimat nie auf.
- Ankunft (Pflicht B) nach T1: die Platte wird einmal kalt; vorher↔nachher ungemessen.
- L3 (Verfolgung, Wurf aus Masse, Inzucht) ist nicht gespiked.
- Pflicht-OFFEN unverändert: A · B · C · E · F (docs/PFLICHT-OFFEN.md). Status ZWISCHENSTAND.
