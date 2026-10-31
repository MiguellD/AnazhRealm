// Gruppe I — Physik, Chemie, Simulation der Teilsysteme (Meisterkarte 2.0, Stand main dc6702ab)
module.exports = {
  gruppe: {
    key: "physis",
    titel: "I · PHYSIK, CHEMIE UND DIE SIMULATION DER TEILSYSTEME",
    intro: "Die Welt ist EINE Funktion aus Gesetz und Saat, und jede Teil-Simulation (Wasser, Wetter, Körper, Stoffe, Feld) ist ein Gesetz im Kern, das Stamm, Worker und Studio rufen. AAAA heißt hier: eine Ursache läuft sichtbar durch vier Systeme, und in Ruhe rechnet nichts."
  },
  bereiche: [
    {
      key: "gelaende",
      titel: "Gelände, Boden und Wasser — Hydrosphäre, Graben, Damm",
      dom: "`gelaende-core.js` · `stamm/gelaende-*.js` · `stamm/wasser-*.js` · `voxel-worker.js`",
      v1: "v1 (laufen, bauen) · A (wasser)",
      aaaa: "Jeder Hügel, jede Klamm, jeder Fluss, jeder See und jeder Spatenstich ist EINE Funktion des Kerns (`gelaende-core`: hoehe + dichte + editForm + Wasser-Spiegel); Stamm, Worker und Studio rechnen sie bit-gleich. Der Spieler gräbt am Bach, und binnen ≤ 2 s steht EINE Wasserfläche im Graben. Er schüttet einen 3-m-Damm, und der Stausee steigt bis zur Überlaufhöhe ±0,1 m, während der Bach stromab weiterläuft; Fern-Ring und Hydro-Raster zeigen den Edit binnen 1 s. Das Wasser spiegelt Ufer und Wolke (spiegelTreue ≥ 0,6) aus Ego und Third, mittags, nachts und im Regen, und es fließt sichtbar längs seines Gefälles. Jeder Leser (Pflanze, Tier, Klang, Körper) liest EINEN Spiegel. Huf, Rad und Streu-Fuß stehen auf dem gezeichneten Boden (≤ 3 cm). Alles im Haushalt boden (≤ 12 Befehle, ≤ 120k Dreiecke) auf Radeon 890M und GTX 1060. **Wo wir die Besten schlagen:** From Dust koppelt nur auf kleinen geschlossenen Inseln, Timberborn staut auf 1-m-Blöcken, Horizon backt seine Wellen, Enshrouded gräbt einen Kontinent ohne Hydrologie. Bei uns entsteht das Flussnetz zuerst aus dem Gesetz (Stream-Power, garantierte Entwässerung, unendlich); weil Edit und Wasser dasselbe Gesetz lesen, wird jeder Graben ein Fluss-Ereignis und jeder Damm ein See — deterministisch für jeden Mitspieler.",
      beste: [
        "**From Dust** (Ubisoft Montpellier, Eric Chahi, 2011): Wasser, Sand, Lava und Fels sind vier gekoppelte Stoffe auf EINEM Höhenfeld, in Echtzeit auf der Xbox 360; Wasser trägt Sand ab, Lava erstarrt zu Fels, ein Damm staut einen See. Grenze: kleine geschlossene Inseln.",
        "**Timberborn** (Mechanistry, seit 2021): Wasser fließt auf einem Raster, Dämme und Schleusen stauen, Dürren legen Flüsse trocken — das Wetter treibt die Hydrologie, die Hydrologie das Spiel. Grenze: 1-m-Blöcke, keine Ferne.",
        "**Horizon Forbidden West** (Guerrilla; Hugh Malan, SIGGRAPH 2022 Advances, Real-Time Live! Best in Show): Fluss, Wasserfall, brechendes Meer; die Wellen sind von Hand geformt, je Kachel gebacken und gestreamt — Gestalt vor Simulation.",
        "**Virtuelle Rohre** (O'Brien & Hodgins 1995; Mei, Decaudin & Hu, Pacific Graphics 2007): Flachwasser + Erosion mit 4 Ausfluss-Rohren je Zelle, O(1) je Zelle auf der GPU — der Standard für Echtzeit-Wasser über Gelände."
      ],
      kriterien: [
        {
          name: "EIN 3D-Gesetz: Dichte, Edit und Wasser-Spiegel im Kern — am Verhalten bit-gleich",
          punkte: 1,
          staffel: "1 = die 2D-Form (hoehe, flussLaeufe) ist EINE Quelle, Studio-Plan = Welt byte-gleich · 2 = auch dichte, editForm und Wasser-Spiegel im Kern, jede Mutation der festen Liste zieht Stamm-Leser UND Worker-Feld",
          messung: "Konsum-Probe (gate:worker-dichte umgebaut, Node + Null-Renderer, ≤ 1 min): 10⁵ Zufalls-Punkte mit Höhle, Kanal, See-Becken und 20 Edits; dichte, editForm und Spiegel aus Stamm-Leser, Worker-Feld und Kern: maxDiff 0. Die Mutations-Liste ist fest benannt: Edit-Stärke, Edit-Radius, Dichte-Versatz, See-Spiegel — jede ändert den Ausgang von Stamm-Leser UND Worker-Feld (Punkt-Diff ≠ 0). `__consumes` allein zählt nicht, es beweist nur den Aufruf.",
          beleg: "Die 2D-Form ist EINE Quelle (`gelaende-core.js:1577` hoehe, `:1177` flussLaeufe), Studio-Plan = Welt byte-gleich; der Worker lädt den Kern schon (`voxel-worker.js:2628` ruft G.schnee). 3D ist Abschrift: der 48er-Edit-Kegel steht viermal (`stamm/gelaende-boden.js:1139/1178`, `voxel-worker.js:612/734`), dazu 166 Spiegel-Marken in `voxel-worker.js`, Seen ×2 und Hydro-Zahlen ×2 (SYSTEMKARTE W1); gate:worker-dichte vergleicht Abschrift mit Abschrift.",
          schlupfloch: "Karte 1.0 maß Zwillings-Marken im Text (166 → 0): Umbenennen hätte 2 Punkte gezahlt, ohne dass ein Byte Verhalten fällt. Jetzt urteilt nur Verhalten: der Punkt-Diff gegen den Kern plus die FESTE Mutations-Liste — eine 2D-Mutation (hoehe) allein besteht nicht, und ein Leser, der die Kern-Funktion ruft und das Ergebnis verwirft, fällt an der Mutation (Befund B07)."
        },
        {
          name: "Das Wasser folgt jedem Edit: Graben, Damm, Ferne",
          punkte: 1,
          staffel: "1 = (a) im Ausgabe-Bild an einem Gerät · 2 = (a), (b) und (d) an beiden Geräten, Ego und Third",
          messung: "Spielgang-Station graben (werkbank, Bach nahe Genesis, Kamera des Spiels): (a) Graben 1 m und 3 m jenseits der Krone: EINE Fläche, nie über dem Spiegel, ≤ 2 s gefüllt; (b) 3-m-Damm quer: Stausee bis zur Überlaufhöhe ±0,1 m, Abfluss stromab hält; (d) Fern-Ring und Hydro-Raster zeigen den Edit ≤ 1 s (byte-Diff am Ring); Speicher-Rundlauf byte-gleich. Die Ruhe des Automaten zählt Feld K3, das Bauen in der Höhe Bauen K4.",
          beleg: "GEMESSEN 22.10. am Kopf 6cfce28a (Laufzeit-Baum von main 73f28224; Radeon 890M --echt, 1920×1080, Messschuld M31, koordination `bericht/2210-messschuld-6cfce.md` § M31, Roh `m31-graben.json`): Spiel-Loop, Third, Fluss nächst Genesis, 5 Saaten, je Saat ein Graben 1 m und 3 m jenseits der Krone (3,34–3,68 m) über die echte Eingabe (CDP-Klick, Verb `graben`), je präsentiertem Bild die wasserGraben-Zählung über ±4,5 m: 9 von 10 Gräben (den ersten nahm `abbau`), in allen 2 204 Bildern doppelt 0 und über dem Spiegel 0, gefüllt nach 98–216 ms (1 m, 4 Saaten) und 176 ms (3 m, Saat 11); 2 s nach dem Hieb EINE glatte, dunkle Wasserfläche, die oben an den Fluss anschließt (`m31-s11-a3-vor.png` gegen `-2s.png`, angesehen); Last 5 % CPU → Staffel 1. Frisch: 6cfce28a..73f28224 ändert nur Werkzeug (scripts/, spec/, .github/, eine gate-Zeile). Für die 2 fehlen der Damm (b), die Ferne (d), Ego und die GTX; bei 4 Saaten überlappt der 3-m-Graben den 1-m-Graben. Davor: FIEL 22.10. AUF 0 nach R6: feld-ruhe 8de57097 (Merge 6a49541e) ändert mit Welt-Byte den Settle-Zweig des Wasser-Automaten in `stamm/wasser-zellen.js` — unter der Remesh-Drossel bleibt eine Region nur wach, wenn ihr Dach abweicht (`_caRoofChanged(…, nurPruefen)`), sonst ruht sie sofort (Automat am Fixpunkt 4 → 1 Takt), vorher simulierte sie bis zu REMESH_INT Takte weiter; der End-Stand eines Grabens (Schelf-Rieseln) kann sich ändern, ein Byte-Beweis für das gezeichnete Wasser fehlt. `git log 816f26b4..6cfce28a -- stamm/wasser-zellen.js` = 8de57097. Am Kopf läuft nur gate:wasser-leben G1–G5 (Null-Renderer, Mechanik, R3), kein Ausgabe-Bild. Davor: GEMESSEN 21.10. am Kopf main 816f26b4 (Radeon 890M, 1920×1080, Messschuld M2, koordination `bericht/2110-messschuld-radeon-2.md` § M2): Spiel-Loop, Third, am Fluss nächst Genesis 5 Saaten mit je einem Ufer-Punkt, Graben 1 m und 3 m jenseits der Krone (3,34–3,68 m) über die echte Eingabe (Fadenkreuz, CDP-Klick, Verb `graben`); je präsentiertem Bild die gezeichneten Wasser-Flächen über ±4,5 m (Messung wie wasser-linse `wasserGraben`): 9 von 10 Gräben (der erste traf ein Bauwerk), in allen Bildern doppelt 0 und über dem Spiegel 0, gefüllt (90 % des Endstands) nach 143–211 ms (1 m) und 336 ms (3 m); 2 s nach dem Hieb eine glatte Fläche am Fluss (`m2-s11-a3-vor.png` gegen `-2s.png`, angesehen) → Staffel 1. Frisch: `git log 816f26b4..b9537781` über Verb, Wasser, Boden, Worker und Kern ist leer. Für die 2 fehlen der Damm (b), die Ferne (d), Ego und die GTX; bei 4 Saaten überlappt der 3-m-Graben den 1-m-Graben. Vorher: F3 (9aac0517) Graben über dem Spiegel 1027 → 0 auf dem Null-Renderer (Mechanik); beim Abbau läuft der See ab (`stamm/werkstatt-bauen.js:823`), das Hydro-Raster sieht keine Edits (`voxel-worker.js:3616`).",
          schlupfloch: "Ein Sonderfall am Graben-Ort bestünde (a) an einer Stelle: die Station gräbt an Ufer-Punkten aus ≥ 5 Saaten. Ein Punkt aus Null-Renderer-Mechanik zählt nie als Bild (Lehre 16).",
          aenderung: "Synthese gab 1 ohne 1-Stufe und ohne Bild → 0 (B08); die Ruhe ging nach Feld K3 (B23), das Hoch-Bauen nach Bauen K4 (V18); gemessen 21.10. im Ausgabe-Bild 0 → 1 (M2); nach R6 (feld-ruhe 8de57097) 22.10. 1 → 0; am Kopf 6cfce28a gemessen (M31) 22.10. 0 → 1."
        },
        {
          name: "Wasser-Bild aus dem Gesetz an jeder Pose des Spielers",
          punkte: 1,
          staffel: "1 = spiegelTreue ≥ 0,6 an einer Pose in Ausgabe-Größe mit der Kamera des Spiels an einem Gerät · 2 = alle 12 Posen (Ego/Third × Mittag/Nacht/Regen × beide Geräte) und Fließ-Anisotropie ≥ 1,5",
          messung: "werkbank bild --klasse wasser --ist am See 1816/−6168 und an einem Fluss mit Gefälle, 1920×1080, Ausgabe-Pfad, Kamera aus `_loopCamera` (keine Koordinaten im Werkzeug-Text). Soll-Tafel wasser: spiegelTreue ≥ 0,6; Fließ-Bild: Normalen-Anisotropie längs/quer zum Lauf ≥ 1,5 aus Gefälle × Einzugsgebiet. Uhr und Regen als Spieler-Wort (R9).",
          beleg: "Gemessen am Kopf f2904a72 (21.10., Radeon 890M --echt, Messschuld M1): spiegelTreue 0,830 (wasserSatz, 35 190 px, spiegelEbene 0,89) in 1920×1080 aus dem Ausgabe-Pfad an einer Ego-Pose des Spiels am See — der Spieler steht am Ufer 1866,6/−6193,9, Gier −1,309, Neigung 0, die Kamera kommt aus `_loopCamera` (1866,6/3,928/−6193,9, Blick −0,966/0/0,259) und wird mit `werkbank bild --wahl 0` genau so geschossen (Pose im Begleit-JSON gleich); Bühne Mittag, Sommer, klar. Ohne `--wahl 0` verschob die Blick-Wahl der Werkbank die Pose um 26 m (0,760), am ersten Spieler-Ort 1870/−6168 verdeckt eine Eiche < 2 m (ABNAHME ROT, kein Bild). Roh: koordination `bericht/2110-messschuld-radeon/m1-*`. Third, Nacht, Regen, die GTX und der Fluss mit Gefälle ungemessen; Fließ-Detail ohne Soll.",
          schlupfloch: "Der Punkt stieg schon einmal am Lineal statt am Wasser (A13, 79e000ba: 0,473 → 0,706 ohne Welt-Byte). Die Neumessung in Ausgabe-Größe steht als Messschuld M1 und schreibt den Ist fest; ein Gewinn verlangt ein Welt-Byte (R6). Die Bühne hält Mittag (Lehre 17) — Pflicht ist die Posen-Liste, nicht die Bühne.",
          aenderung: "640×360 und eine Kamera, die das Spiel nicht hat, trugen 1 → 0 (B09); gemessen 21.10. in Ausgabe-Größe an der Kamera des Spiels 0 → 1 (M1)."
        },
        {
          name: "EIN Wasser-Spiegel für alle Leser — Körper, Tier, Pflanze, Klang",
          punkte: 1,
          staffel: "1 = alle Leser folgen der 50-Punkte-Kern-Mutation an einem Ort · 2 = überall, dazu endet jeder Lauf in See oder Meer und die Strömung treibt",
          messung: "gate:wasser-leben F + gate:kopplung F1 + Kern-Mutation: Wasser an 50 Zufalls-Punkten; Tier-Trinkziel, Tier-Scheu, Pflanzen-Wasserurteil, Klang-Nässe, Auftrieb und Leib folgen binnen eines Takts; 0 Pflanzen im gezeichneten Wasser, 0 Tiere trocken durch eine zweite Fläche. Jeder Lauf endet in See oder Meer (100 %), der Spiegel steigt stromab nie; die Strömung treibt Schwimmer, Boot und Tier > 0,5 m in 90 Takten. Die Leser-Liste steht nur hier (Wetter K3 verweist).",
          beleg: "SCHNITT wasser-leser 66e114de (Merge 3298ee07, integ 6cfce28a), mit Welt-Byte in `stamm/wasser-hydro.js`, `klang.js`, `koerper-fahrt.js`, `netz-p2p.js`, `bild-himmel.js`, `vegetation-wiese.js`: `_nassAt` fragt seine Obergrenze die EINE Wahrheit `_koerperWasser(x, z, −Infinity)` statt `_wasserBildAt`/`_atlasWaterLevelAt`; Klang, Schritt, Kamera, Mitspieler, Ufer-Suche, Wagen-Abgrund und Nah-Wiese fragen dasselbe Urteil. Gemessen mit gate:wasser-leben K12 M (`scripts/lib/wasser-linse.cjs` wasserMutation; Mechanik am Leser, R3): 50 Zufalls-Punkte trockenen Lands am See der Mess-Wiese, `_koerperWasserSpiegel` trägt je Punkt eine Scheibe 3 m tief — Basis e3dd2b67 4 von 10 Lesern 0/50, Kopf 10 von 10 je 50/50 (leib, kamera, tier, wagen, scheu, trinken, klang, schritt, wand, land); Nah-Wiese 603 → 0, Nah-Streu 137 → 0 Pflanzen im Wasser; die Kontrolle `_atlasWaterLevelAt` folgt nie (die Probe ist nicht blind); dieselbe Linse an Basis und Kopf → Staffel 1. Frisch: Wasser-Wand (`npm run gate:wasser-leben` mit Mutation) in integ-CI Run 39820208133 an 6cfce28a grün (voll 5/18). In der unmutierten Welt rechnen die neuen Formeln dasselbe wie die alten — der Gewinn ist die EINE Quelle unter Mutation, kein anderes Bild. Für die 2 fehlen: überall, jeder Lauf endet in See oder Meer, die Strömung treibt > 0,5 m in 90 Takten. Davor: Das Netz entsteht zuerst aus dem Gesetz (Stream-Power S = ks·A^−θ, streng fallende Sohle, `gelaende-core.js:202-209`); die Strömung advektiert am EINEN Bewegungs-Chokepoint (gate:kopplung F1). Aber die Natur urteilt dreimal über Wasser (`vegetation-baum.js:1633` Gesetz · `vegetation-wiese.js:75` gezeichnet · die Nah-Streu selbst), und Tiere gehen trocken durch die zweite Fläche (`kreatur-verhalten.js:3033-3041`, SYSTEMKARTE W1). Die Mutations-Probe gibt es nicht.",
          schlupfloch: "Ein Ausnahme-Filter je Leser (das Tier meidet Wasser-Chunks) bestünde eine Zählung; die Kern-Mutation an Zufalls-Punkten verlangt, dass jeder Leser binnen eines Takts folgt.",
          aenderung: "Synthese gab 1 ohne Staffel, während die eigenen Belege widersprachen (Natur ×3, Tier trocken) → 0 (B11); Schnitt wasser-leser 22.10. 0 → 1."
        },
        {
          name: "EINE Boden-Höhe je Rolle: Huf, Rad, Streu-Fuß, Feinform",
          punkte: 1,
          staffel: "1 = Kontakt p95 ≤ 3 cm für eine Rolle an einem Ort, beide Sichten · 2 = alle Rollen an Mess-Wiese und 25°-Hang, in Fahrt, beide Geräte, jede Rolle ruft benannt EINE Funktion (Ratsche)",
          messung: "werkbank eval + bild an der Mess-Wiese (spec/profiband/haushalt.json) und am 25°-Hang: Huf, Rad und Streu-Fuß gegen das gezeichnete Mesh an 200 Zufalls-Kontakten, Schweben/Einsinken p95 ≤ 3 cm; Feinform-Fehler gegen das Gesetz ≤ 5 cm. Der Fuß des Spielers zählt Leib K2, das boden-nah-Bild Vegetation K1.",
          beleg: "FÄLLT 22.10. AUF 1 an der strengeren Linse: seit k8-huf (Merge 071ba02f, auf main seit f3865c80) misst K8 den Huf je Größen-Band am schlechtesten Reh (klein/normal/gross/gigant an der Band-Obergrenze, netId und Kreatur-Uhr fest), die alte 2 stand auf EINEM Reh mit lastabhängiger Größe. Radeon 890M an f3865c80/e86600bd (`diag-koerper-stand --k8` mit gesetzter Sicht, je EXIT=0, koordination `bericht/2210-radeon-beweise.md` § gelaende.K5, `k8-ego.log`, `k8-third.log`), Ego und Third gleich: Wiese fein 1,1 · Streu 0,5 · Huf 2,1 · Rad 0,2; Hang 24,4° fein 4,3 · Streu 2,7 · Huf 3,2 (GIGANT) · Rad 2,4 cm — der Huf am Hang reißt 3 cm in beiden Sichten (CI an c9021a73 3,2, lokal 3,1; gate:koerper-stand bleibt grün an der Ratsche-Grenze 3,49); die Streu am Hang stieg 0,8 → 2,7 cm. Staffel 1 hält (Rad und Streu an der Wiese in beiden Sichten). Für die 2 fehlt der GIGANT am Querhang: im Stand nach dem Spawn dringt die Sohle 3–6 cm ein, die Leib-Senke von 18 cm klingt ab (befund k8-huf; die Sohle im Boden-Rahmen gab 3,1, kein Gewinn). R6: f3865c80..e3dd2b67 über `stamm/koerper-leib.js`, den Boden und die Linse leer; `stamm/kreatur-verhalten.js` trägt nur die Bewohner (`_kzLeib` vorab, `_drinnen`). Davor: Seit boden-rolle (Merge c393726c, main 57a9f2ab) ruft jede Rolle EINEN Leser: der Streu-Fuß `_streuFuss`/`_streuFussAuge` (`_bodenSichtAt` je Stufe, folgt dem Auge), das Rad `_archRadMatrix` auf `_standSicht` (Vertrags-Akt vehicle v3: der Reifen trägt den Radius am Scheitel), der Huf über `_standSicht`; Ratsche spec/profiband/ratsche-boden-rolle.json. Gemessen am Kopf 57a9f2ab an der Radeon (gate:koerper-stand K8, Welt mit Foundry, je Rolle ≥ 200 Kontakte gegen die gezeichneten, gemorphten Dreiecke `__gezeichnet`; der Kontakt ist Mechanik, R3), je Sicht Ego/Third: Mess-Wiese −280/−1046 Streu 0,5/0,5 cm (n 332/338), Huf 1,2/1,2, Rad in Fahrt 0,2/0,2, Feinform 1,1; 25°-Hang −526/−853 (24,4°) Streu nach Gang und Fahrt 0,8/0,8 (n 804/807), Huf 2,3/2,5, Rad 2,3/2,3, Feinform 4,3 (Soll 5) — alle Rollen an beiden Orten in beiden Sichten im Soll. GTX 1060 (OMEN, Messschuld M26, an main 2160be58, `diag-koerper-stand --k8` mit gesetzter Sicht, je EXIT=0, koordination `bericht/2110-gtx-messschuld-3.md`): Ego Wiese fein 1,1 · Streu 0,5 · Huf 1,1 · Rad 0,2, Ego Hang (24,4°) fein 4,3 · Streu 0,8 · Huf 1,7 · Rad 2,3; Third Wiese 1,1 · 0,5 · 1,0 · 0,2, Third Hang 4,3 · 0,8 · 2,4 · 2,3 cm → alle Rollen an beiden Orten, beide Sichten, beide Geräte: die 2. In Fahrt: das Rad misst K8 am GT in Fahrt längs der Höhenlinie, die Streu nach Gang und Fahrt; benannt EINE Funktion je Rolle: `K8_ROLLEN` (`_streuFuss`, `_kreaturFussBoden`, `_archRadMatrix` auf `_standSicht`) urteilt gegen die Ratsche spec/profiband/ratsche-boden-rolle.json, gate:koerper-stand in der CI. Frisch: `git log 2160be58..b9537781` über die Leser, den Boden, den Worker, den Kern und die Linse ist leer; seit dem Radeon-Lauf an 57a9f2ab trägt der Pfad nur den Naht-Morph von gehen-takt (byte-gleich, 136 Morphs mit 0 Abweichungen, Merge 270e59d7) und den Konstanten-Halter (b264f1e9) — die deterministischen Rollen stimmen zwischen beiden SHAs auf 0,1 cm (fein 1,1/4,3 · Streu 0,5/0,8 · Rad 0,2/2,3). Roh: koordination `bericht/2110-mk-kopf/k8-*.log`, `bericht/2110-gtx-messschuld-3/k8-*.log`.",
          schlupfloch: "Ein Offset je Art schiebt den Mittelwert auf 0; gezählt wird p95 am Hang und in Fahrt, und jede Rolle ruft benannt EINE Funktion.",
          aenderung: "Die 1 der Synthese stand auf dem boden-nah-Bild (laiWirk 1,855, veraltet) — das zählt Vegetation K1 (B10); der Kontakt war ungemessen → 0. Am Kopf 57a9f2ab gemessen (Radeon, Ego und Third) → 1; mit der GTX an 2160be58 (M26, 21.10.) → 2; an der strengeren K8 (k8-huf, je Größen-Band das schlechteste Reh) 22.10. → 1."
        }
      ],
      hebel: [
        { name: "Das Wasser folgt dem Edit: Damm-Aufstau, Hydro-Raster und Fern-Ring lesen die EINE editForm", k: ["gelaende.K2+1"], t: [1, 2], wurzel: "`voxel-worker.js:3616` (Hydro-Raster) und `stamm/gelaende-fern.js:880` (Fern-Ring) lesen editForm aus dem Kern (Bauen H1); Aufstau am Fixpunkt `_ensureWaterCALevel` (`stamm/wasser-zellen.js`), Ablauf beim Abbau `stamm/werkstatt-bauen.js:823`. Der Graben (a) steht an der Radeon (M31 an 6cfce28a: 9/10, 0 doppelt, 0 über dem Spiegel, gefüllt ≤ 216 ms); der Rest ist (b) Damm, (d) Ferne, Ego und die GTX.", pflicht: "—", v1: true },
        { name: "Wasser-Bild an allen 12 Posen: Strömungs-Normalen aus den Bahnen, Schaum aus Gefälle × A", k: ["gelaende.K3+1"], t: [1, 1.5], wurzel: "Erst Messschuld M1 (Ist in Ausgabe-Größe), dann der Schnitt im EINEN Baustein `_wasserBlick` (`stamm/wasser-hydro.js:1538`): zwei phasenversetzte Normalen-Lagen aus `flussLaeufe` (`gelaende-core.js:1177`).", pflicht: "A (wasser)", v1: true },
      ],
      feststeck: {
        versucht: "W1 und S5 stehen seit 18.10. als Plan in der SYSTEMKARTE, F2a seit dem Schöpfer-Fund vom 17.10.; am main f2904a72 trägt der 48er-Kegel weiter an vier Stellen (`stamm/gelaende-boden.js:1201/1240`, `voxel-worker.js:612/734`). Die 37 Commits seit 01.10. mit S5 im Namen gehören zur Frost-Wand einer Linse (Namens-Kollision), keiner zum 3D-Gesetz. Der Wasser-Punkt stieg einmal am Lineal statt am Wasser (A13).",
        anders: "Vom Verbraucher her statt Großumzug zuerst: editForm wird eine Hülle im Kern, den der Worker schon lädt (Bauen H1, hoch-bauen 9d987a93 als Byte-Referenz) — F2a fällt ganz, und dieselbe Bahn trägt danach dichte und Spiegel (K1). Punkte nur mit Welt-Byte."
      }
    },
    {
      key: "wetter",
      titel: "Wetter und Klima — Front, Nässe, Kreislauf, Schnee, Wind",
      dom: "`phyto-core.js` WX_GESETZ · `foundry-core.js` REGEN_GESETZ · `stamm/bild-himmel.js` · `stamm/dirigent-takt.js` · `stamm/feld-leben.js`",
      v1: "Feature-Stopp bis v1.0 — der Hebel der Messbarkeit (Wetter und Saison als Spieler-Wort) ist gemergt (428fb6fe)",
      aaaa: "Wetter ist ein Feld des Kerns über Ort × Zeit × Saat, plus die Schreib-Akte (Spieler-Wort, DSL-Regeln, der Wunsch der Emotion über die Weltregeln). Eine Regenfront zieht mit dem Wind; vom Hügel sieht der Spieler den Vorhang 2 km entfernt, und jeder Mitspieler sieht denselben Himmel. Regen benetzt, was er trifft: poröser Boden fällt auf 0,5–0,8 × Albedo, die Rauheit sinkt, Pfützen in Mulden spiegeln den Himmel, unter dem Dach bleibt es trocken, und nach dem Schauer trocknet es in 5–15 min. Regen speist die Bäche (Pegel +0,2–1 m, verzögert um die Laufzeit des Einzugsgebiets), Dürre leert sie. Die Jahreszeit ist Temperatur: Schnee-Decke mit Tiefe, in der der Fuß einsinkt. Wind ist EIN Feld, vom Gelände geformt (Lee, Tal-Düse), gelesen von allem, was sich bewegt. Wetter ≤ 1 ms GPU, ≤ 0,3 ms CPU auf beiden Geräten. **Wo wir die Besten schlagen:** RDR2 und Forza Horizon 4 bauen Wetter-Regionen und Jahreszeiten je Karte von Hand; bei uns kommt das Wetter aus demselben Gesetz wie das Gelände — die Front füllt das Flussnetz, das sie quert, und die Klimazonen folgen der Höhe des Gesetzes in einer unendlichen Welt.",
      beste: [
        "**Red Dead Redemption 2** (Rockstar 2018; Fabian Bauer, SIGGRAPH 2019 Advances „Creating the Atmospheric World of RDR2“): Wolken, Nebel und Licht in EINEM Froxel-Volumen, Wetter je Region über die Staaten der Karte, Nässe, Schlamm und Schnee an Kleidung und Pferd, verformbarer Schnee.",
        "**Forza Horizon 4** (Playground 2018): vier Jahreszeiten, Wechsel alle 7 Tage; im Winter frieren Seen zu befahrbarem Eis, der Grip ändert sich. Weg: vier gebaute Zustände der ganzen Karte, die getauscht werden.",
        "**Horizon Zero Dawn** (Andrew Schneider, SIGGRAPH 2015 Advances): volumetrische Wolken aus Rauschen und einer Wetter-Karte (Bedeckung, Typ, Niederschlag je Ort), ≈ 2 ms auf der PS4, weil je Bild nur 1/16 der Pixel neu gerechnet wird.",
        "**Physik der Nässe:** Lekner & Dorf 1988 (Applied Optics 27): nasse Flächen sind dunkler, weil der Wasserfilm Licht per Totalreflexion fängt; im Spiel umgesetzt von Sébastien Lagarde (Remember Me, 2013): Albedo nach Porosität dunkler, Rauheit sinkt, Pfützen als eigene Schicht. Regentropfen fallen höchstens 9,2 m/s (Gunn & Kinzer 1949)."
      ],
      kriterien: [
        {
          name: "Wetter = f(Saat, Ort, Zeit) ⊕ Schreib-Akte — für alle gleich, nie aus der Wanduhr",
          punkte: 1,
          staffel: "1 = das Wetter-Wort entsteht aus Saat + Spielzeit + Schreib-Akten statt aus der Wanduhr (global, gemessen) · 2 = die Front am Ort: Regen an A bei trockenem B ≥ 20 % der Zeit, Lag = Abstand ÷ Wind ±20 %, alle 5 Labor-Zeilen erreichbar, die Mutation der Kern-Funktion zieht Labor und Welt",
          messung: "werkbank eval über einen Spielzeit-Sprung (Ereignis-Takte, nie Wanduhr), zwei Orte 3 km auseinander, 20 min Spielzeit; gleiche Saat → gleiche Folge, andere Saat → andere. Die Emotion schreibt nur über eine DSL-Regel mit Quelle (Affekt K2), nie als fester Trigger. Die Gleichheit über Peers zählt Feld K2.",
          beleg: "1 seit main f2904a72 (wetter-saat, Merge 428fb6fe): der Auto-Zug zieht je Takt den nächsten Samen der Welt (`stamm/dirigent-takt.js:975-978` `_bauSame(\"wetter\")`, der Zähler reist im Snapshot) statt drei Sinus über performance.now; `wetterWunsch` bleibt Schreib-Akt. gate:wetter-wache (Z) über 20 min Spiel-Zeit, Saat × Ort (3 km) × Wanduhr (steht oder geht 120 s je Takt): an 7eadd2b2 ROT 3 (die Folge hing an der Wanduhr, saat-b = saat-a), am Kopf GRÜN (saat-a an beiden Orten und Uhren gleich, saat-b anders; 61d735a4 → 04266b35; CI 39498582018 voll 18/18 an f2904a72). Offen für die 2: das Wetter bleibt EIN globales Wort (`_setWeather`), keine Front am Ort; die Welt kennt 3 der 5 Zeilen von WX_GESETZ (`phyto-core.js:3289` ⇄ `stamm/daten.js:56-80`).",
          schlupfloch: "Eine zweite regionale Wort-Tafel oder das Senden des Worts an die Peers erfüllte Teile ohne Gesetz; die Front muss aus EINER Kern-Funktion kommen (die Mutation zieht beide Orte). Den Wunsch der Emotion zu STREICHEN, um Saat-Reinheit zu gewinnen, ist verboten: er bleibt Schreib-Akt (V03).",
          aenderung: "Der Synthese-Satz „gleiche Zustände allein aus der Saat“ hätte belohnt, die Kopplung an die Emotion zu streichen (V03); die Peer-Gleichheit zählt Feld K2 (B12); die Staffel ist neu (B02)."
        },
        {
          name: "Nässe: Regen benetzt — EIN Zustand, EIN Soll",
          punkte: 1,
          staffel: "1 = Boden-Luma nass/trocken 0,5–0,8 nur auf porösem Stoff, im SELBEN Schuss mit trockenem Innenraum unter dem Dach, an einer Pose · 2 = Mess-Wiese und Dorfgasse, Ego/Third, beide Geräte, mit Pfützen und Trocken-Kurve",
          messung: "werkbank bild an Mess-Wiese und Dorfgasse, klar gegen 10 min Regen (Spieler-Wort; die Bühne hält das Wetter, nicht Mittag): poröse Stoffe (Boden, Putz, Rinde) Luma 0,5–0,8 × trocken, dichte (Metall, Glas) unverändert, Glanz-Anteil ≥ 2×; Pfützen nur in den Senken des Kerns (Korrelation mit der Krümmung r ≥ 0,5) mit spiegelTreue ≥ 0,5; im Haus 0 Regen-Pixel und gleiche Luma; Trocknen 5–15 min Spielzeit ohne Sprung — zählt erst nach gemessener Benetzung; Fall ≤ 9,2 m/s.",
          beleg: "SCHNITT naesse, auf main 7670a4a1 (V18.546.56, Merge efdc388c), mit Welt-Byte: b357dbac EIN Zustand aus dem Wetter-Feld (`_naesseTakt`, `stamm/bild-himmel.js`: Regen benetzt mit tau 150 s, die Sonne trocknet in 1 500 s) und EIN Gesetz im Welt-Stoff (`_naesseImStoff` an der Engstelle `_leuchtStoff`, `stamm/stoff-material.js`: Albedo → Albedo², Rauheit × 0,5 nach Lagarde und Lekner-Dorf, Gewicht Nässe × Himmels-Sicht × Poren × (1 − Metall)); 74b460a4 der Faktor auf die ganze Albedo; 4bcbe9ea EIN Dach-Pool auch für Bauten ohne Haus-Hülle; cde74c22 die trockene Welt zahlt den Dach-Pool nie. Die Linse d255e650 (`werkbank licht --naesse`, Regen als Spieler-Wort über `__buehne`, klar gegen 10 min Regen aus dem Ausgabe-Pfad) stand an der Basis 5951786f ROT (Wiese und Dorf draußen 1,000). Radeon gate:naesse:echt am Kopf cde74c22: Wiese 0,773 · Dorf draußen 0,753 · Dorf innen unter dem Dach 1,000 im selben Schuss · Metall 1,000 · Regen innen 0, draußen 97–98 % · Dach-Bauten trocken 2/2 → Staffel 1; Frost, Ego-Schatten und licht-weg:echt grün; Zweig-CI 39689716546 21/21. OMEN-ABAB (koordination `bericht/2110-abab-naesse.md`, b9537781 gegen 7670a4a1, GTX): bei Sonne nicht langsamer (Genesis Third; Wiese Ego Frame p95 16,8 ↔ 16,8, CPU-Takt p95 4,2 ↔ 4,2, gpu-bank im Rauschen, −1,5 fps an der k0-Lage), im Regen nach 10 min +1,2 ms GPU-Durchsatz (12,40 → 13,60, der Nässe-Term je Pixel; benannt, Werkpaket naesse-kosten). Frisch: `git log cde74c22..7670a4a1` über den Pfad trägt nur die Katalog-Reihe von bauen-k1 (`_katalogRang`, `stamm/siedlung-satz.js`), nicht die Nässe. Offen für die 2: Glanz 16 steht am Gesetz, nicht im Bild; keine Pfützen in den Mulden; die Trocken-Kurve ungemessen (1 500 s gegen das Soll 5–15 min); Third, die GTX im Bild; der Regen fällt 42 m/s (`foundry-core.js:171`).",
          schlupfloch: "Ein globales Abdunkeln bestünde den Luma-Teil: darum porös gegen dicht im SELBEN Schuss, der Dach-Test und die Mulden-Korrelation. „Trocken unter dem Dach“ und „trocknet“ sind ohne Nässe wahr: die Trocken-Kurve zählt erst nach der Benetzung (B13).",
          aenderung: "Nässe stand zweimal (Wetter K2, Material K5) mit zwei Soll und zwei geplanten Quellen — ein Zwilling vor dem Bau (B15, V23); jetzt EIN Kriterium, EIN Zustand; Schnitt naesse 0 → 1 (7670a4a1)."
        },
        {
          name: "Der Wasser-Kreislauf: Regen speist die Flüsse, Dürre leert sie",
          punkte: 0,
          staffel: "1 = Pegel am Bach +≥ 0,2 m nach 20 min Sturm an einem Ort · 2 = der Lag wächst mit dem Einzugsgebiet A, Volumen-Bilanz Regen × Fläche ≈ ΔVolumen ±30 %, 14 Spieltage Dürre senken, Bild am Bach auf beiden Geräten",
          messung: "werkbank eval am Kern-Spiegel (`_waterLevelAt`) an Bach, Fluss und See per Spielzeit-Sprung; pegel(x,z,t) ist eine Kern-Funktion, die Mutation des Regen-Felds zieht ihn. Die Leser folgen nach Gelände K4 (nicht hier gezählt).",
          beleg: "Die Hydrosphäre ist ein statisches Priority-Flood (`stamm/wasser-hydro.js:54` `_computeHydrosphere`) ohne Niederschlags-Eingang; F3 strich die Verdunstung des Automaten (9aac0517). Das Einzugsgebiet A liegt im Kern schon vor (`gelaende-core.js:1177` flussLaeufe).",
          schlupfloch: "Ein Sinus auf dem Pegel bei Regen sähe richtig aus: Lag aus A und Volumen-Bilanz schließen das."
        },
        {
          name: "Temperatur und Schnee-Decke mit Tiefe",
          punkte: 0,
          staffel: "1 = Schnee-Deckung ≥ 60 % über der Schneegrenze der Saison UND der Fuß sinkt ≥ 5 cm ein, an einer Pose · 2 = die Spur bleibt, die Schneegrenze folgt temperaturAt(Höhe, Saison, Uhr), Ego/Third, beide Geräte",
          messung: "Spielgang-Station winter (Saison als Spieler-Wort, Spielzeit-Sprung 10 Tage). Eis und Schmelze zählen Stoffe K3, der Laubfall Vegetation K5.",
          beleg: "Die Saison ist eine Farbe: `uSeasonMul` multipliziert die Albedo (`stamm/bild-himmel.js:757` `_saisonMul`), gate:season-meadow schreibt Sommer ×1 fest. Die Schneegrenze hängt nur an der Höhe (`gelaende-core.js:1081-1103` schnee(L,y,x,z), ohne Saison). Keine Temperatur im Stamm (0 Treffer).",
          schlupfloch: "Ein weißer Winter-Multiplikator ergäbe „Deckung“ aus der Farbe: die Tiefe (der Fuß sinkt, die Spur bleibt) ist Pflicht schon für 1 (B14).",
          aenderung: "Eis → Stoffe K3, Laub → Vegetation K5 (B15, V24): je EIN Heim."
        },
        {
          name: "Wind: EIN Feld, vom Gelände geformt",
          punkte: 1,
          staffel: "1 = EIN Term, global, die Richtung aus der Saat am Verhalten gemessen · 2 = Lee −40 %, Tal-Düse +20 %, und jeder Leser außer Pflanze und Ohr (Wasser-Kräusel, Regen-Drift, Tuch, Feuer, Wagen-Seitenkraft) liest dieselbe Funktion (Mutation)",
          messung: "Konsum-Probe `_windAt(x,z,t)` mit Mutation je Leser; hinter einem Kamm fällt die Böen-Amplitude um 40 %, in der Tal-Düse steigt sie um 20 %. Die sichtbare Böe zählt Vegetation K2, gesehen = gehört Klang K2.",
          beleg: "EIN Term `_windSwayOffset` (`stamm/stoff-material.js:87`, f0 = kF·δ/H); die Richtung deterministisch aus der Saat (`:158-166` `_windDirAt`); gate:kopplung F3 hält die Phase am Verhalten (Quer-Paare gleich, Längs-Paare verschieden, die gedrehte Richtung folgt; `scripts/diag-kopplung.cjs:289-356`). Leser: Gras, Krone, Wasser (`stamm/bild-sicht.js:1106` uWind), Regen-Drift (`stamm/bild-himmel.js:926`), Klang. Kein Gelände formt den Wind.",
          schlupfloch: "Ein zweiter Wind-Term für das Gelände wäre ein Zwilling: die Probe zählt Leser derselben Funktion und mutiert sie.",
          aenderung: "Der Wind stand dreimal (Wetter K5, Vegetation K2 mit Klang-Teil, Klang K2) — je EIN Heim (B16, V25)."
        }
      ],
      hebel: [
        { name: "Die Nässe ganz: Pfützen in den Mulden, Glanz im Bild, Trocken-Kurve, beide Geräte (Zustand, Dach und Stoff stehen seit naesse)", k: ["wetter.K2+1"], t: [1.5, 2], wurzel: "Der Zustand `_naesseTakt` (`stamm/bild-himmel.js:2775`) und das Gesetz `_naesseImStoff` (`stamm/stoff-material.js:1462`) stehen; der Rest: Pfützen in den Senken des Kerns im `_wasserBlick` (`stamm/wasser-hydro.js:1538`), der Glanz nass/trocken im Ausgabe-Bild statt am Gesetz, die Trocknung 1 500 s auf 5–15 min Spielzeit, Regen-Fall 42 → ≤ 9 m/s (`foundry-core.js:171`), Third und die GTX; die +1,2 ms GPU im Regen an der GTX (Werkpaket naesse-kosten) zahlt der Term je Pixel.", pflicht: "—", v1: false },
        { name: "Der Pegel ist eine Funktion des Regens", k: ["wetter.K3+1"], t: [3, 3], wurzel: "`gelaende-core.js:1177` flussLaeufe (A, Lauflänge) + `stamm/wasser-hydro.js:54`: pegel(x,z,t) = Basis + Abfluss(∫ Regen-Feld über A, Lag ∝ Lauflänge) in geschlossener Form — die Welt bleibt eine Funktion.", pflicht: "—", v1: false },
        { name: "temperaturAt im Kern, Schnee-Decke mit Tiefe", k: ["wetter.K4+2"], t: [3, 3], wurzel: "`gelaende-core.js:1098` schnee(L,y,x,z) → temperaturAt(L,y,saison,uhr) × Niederschlag; die Tiefe als Boden-Schicht unter `_bodenSichtAt`.", pflicht: "—", v1: false },
      ],
      feststeck: {
        versucht: "Keine wiederholten Wellen, sondern Blindheit: jede Bild-Sonde hält Mittag, Sonne und Sommer (Lehre 17, `__wetterHalten`), und gate:season-meadow schreibt fest, dass die Saison eine Farbe ist. So konnte kein Wetter-Punkt entstehen oder fallen.",
        anders: "Regen, Nacht und Winter werden Spalten der Posen-Liste jedes Kriteriums (Schöpfer 17.10.: Extreme × Wechselwirkung); die Bühne hält das Wetter nur noch für vorher↔nachher, nie für die Suche. Der erste Schritt steht seit main f2904a72 (wetter-saat, 428fb6fe): das Wetter zieht aus der Saat, `werkbank bild --wetter/--saison` setzt Wetter und Saison als Spieler-Wort; der zweite seit main 7670a4a1 (naesse: der Regen benetzt den Welt-Stoff, Wetter K2 0 → 1)."
      }
    },
    {
      key: "physik",
      titel: "Physik der Körper — Kontakt, Impuls, Trümmer, Seile, der aktive Leib",
      dom: "`stamm/kreatur-verhalten.js` (Stoß) · `stamm/koerper-bewegung.js` · `stamm/bau-buch.js` (Ω-PHYSIS) · `koerper-core.js`",
      v1: "Feature-Stopp bis v1.0 — außer H3 (Kontakt in Fahrt)",
      aaaa: "Alles, was einen Körper hat, folgt EINEM Körper-Gesetz: Masse = Volumen der Gestalt × Dichte der Stoff-Zeile (SI), Impuls-Tausch mit Stoßzahl je Stoff-Paar, Reibung μ je Stoff-Paar × Nässe, Auftrieb aus der Dichte gegen Wasser — für Spieler, Tier, Wagen, jedes gebaute Teil und jedes lose Ding. Der Spieler stößt ein Fass um, und eine Wand, deren Lastpfad er durchtrennt, stürzt in Trümmer, die liegen bleiben. Die Hängebrücke schwingt, die Fahne flattert im selben Wind wie das Gras. Ein gestoßener Leib fängt sich mit einem Ausfallschritt, ein fallender wird zur Ragdoll und steht wieder auf. 0 Durchdringen bei der Höchstgeschwindigkeit des Spiels; bei 30, 60 oder 144 fps ≤ 1 cm Abweichung nach 200 Schritten; 200 aktive Körper ≤ 1,5 ms CPU an der GTX-CPU. **Wo wir die Besten schlagen:** TotK und Teardown pflegen Masse und Material je Asset; bei uns kommt die Masse aus dem Studio-Gesetz (Volumen des erzeugten Meshes × Stoff-Zeile) — jedes prozedurale Ding ist ab dem ersten Bild physisch, die geschmiedete Klinge, das gebaute Haus, der gewachsene Baum, Labor = Welt.",
      beste: [
        "**The Legend of Zelda: Tears of the Kingdom** (Nintendo 2023, Havok): Ultrahand fügt bis zu 21 Objekte zu einem Fahrzeug; jedes hat Masse, Reibung und Auftrieb, Feuer und Wind wirken darauf — EIN Starrkörper-System für jedes Ding.",
        "**Teardown** (Tuxedo Labs 2022): Voxel von 10 cm, jeder zerstörbar; abgetrennte Mengen werden Starrkörper, Feuer frisst sich durch Holz.",
        "**BeamNG.drive**: Soft-Body mit ≈ 400 Knoten und 4 000 Balken je Wagen bei 2 000 Hz, vom Bild-Takt entkoppelt — jeder Crash aus EINEM Integrator.",
        "**Macklin et al., „Small Steps in Physics Simulation“** (SCA 2019, NVIDIA): XPBD mit vielen Unter-Schritten zu je einer Iteration; steife Seile, Tücher und Ragdolls stabil in Echtzeit — EIN Löser für alles Weiche.",
        "**Euphoria** (NaturalMotion, in RAGE seit GTA IV): aktive Ragdolls mit Gleichgewichts-Regler — Figuren fangen sich, greifen, stolpern; das Vorbild des Schöpfers („NPCs mit eigenem Nervensystem“)."
      ],
      kriterien: [
        {
          name: "EIN Körper-Gesetz: Masse aus Volumen × Stoff, Impuls, Reibung, Auftrieb",
          punkte: 1,
          staffel: "1 = die Leiber (Spieler, Tier, Wagen) gemessen · 2 = jedes Ding (gebaut, geschmiedet, lose); die Mutation von ρ in der EINEN Stoff-Zeile zieht Masse und Eintauchtiefe in der Welt",
          messung: "werkbank eval, Stoß-Matrix aus Spieler, Wolf, Bär, Wagen, gebautem Holz-Teil, Stein-Teil und geschmiedeter Klinge (Node + Null-Renderer, ≤ 1 min): Δv-Verhältnis = Massen-Verhältnis ±5 %; Masse in kg aus Volumen × ρ (Wagen 1,1–1,6 t, Mensch 60–90 kg); Holz schwimmt mit Eintauchtiefe ρ/ρw ±10 %, Stein sinkt; Labor = Welt ≤ 1 %.",
          beleg: "Tier, Spieler und Wagen teilen EIN Impuls-Gesetz (`stamm/kreatur-verhalten.js:785-835` `_stossKoerper`/`_stossPaar`), Masse = Leib-Volumen × Dichte (`:717-728` `_leibMasse`), gelesen in den Kreatur- und Fahr-Proben (`scripts/lib/kreatur-proben.cjs`, `fahr-proben.cjs`); Auftrieb an der Brustkorb-Linie (gate:wasser-leben K), die Strömung treibt (gate:kopplung F1). Gebautes wiegt in der Welt nichts: bau-buch rechnet dichte [0,1]-normiert, „nie absolute Newton“ (`stamm/bau-buch.js:1517-1521`); die Schmiede trägt ρ in kg/m³ für nur 4 Stoffe (`schmiede-core.js:2519-2522`) — zwei Skalen.",
          schlupfloch: "Eine handgesetzte Masse je Klasse bestünde die Δv-Probe: die Mutation von ρ(holz) in der EINEN Stoff-Zeile muss Masse und Eintauchtiefe in der Welt ziehen."
        },
        {
          name: "Kontakt ohne Durchdringen, im festen Takt, beim Tempo des Spiels",
          punkte: 1,
          staffel: "1 = die Leiber (Mechanik, als solche benannt) · 2 = auch der Wagen bei der vmax des Spiels × 1,2 und die Bild-Probe (Spalt Leib–Wand ≤ 5 cm) auf beiden Geräten",
          messung: "Spielgang + gate:kollision-bild: Bär und Wagen gegen eine 0,35-m-Mauer bei der vmax des schnellsten Spiel-Rezepts × 1,2 (heute ≈ 19 m/s; die Zahl steigt im selben Commit mit der vmax), Durchdringen 0; bei 30, 60 und 144 fps weicht die Lage nach 200 Sim-Schritten ≤ 1 cm ab; Bild-Probe Spalt ≤ 5 cm. Kamera und Spieler-Leib im Fels zählen Leib K4.",
          beleg: "Teil-Schritte ≤ halber Leib-Radius (`stamm/kreatur-verhalten.js:982` `_kreaturStossSchritt`): vorher liefen 9 von 10 Bären durch die Mauer, und nach 200 Schritten driftete die Lage um 1,39 m je nach Bildrate. EIN Kontakt-Löser mit PM_ClipVelocity (`stamm/koerper-bewegung.js:238-325`), FIXED_DT 1/60 (`:2108`). gate:kollision-bild läuft trotz des Namens auf dem Null-Renderer (`scripts/diag-kollision-bild.cjs:601/606`): der Punkt ist Mechanik.",
          schlupfloch: "Eine dickere Kollisions-Hülle verhindert Durchdringen und lässt Lücken im Bild: die Bild-Probe misst den Spalt. „30 m/s“ war eine Pose, die das Spiel nicht hat (vmax ≈ 16 m/s, `vehicle-core.js:2481`): das Soll folgt der vmax des Gesetzes (B18, B67).",
          aenderung: "Die Ego-Pixel-Probe der Kamera wanderte nach Leib K4 (V02)."
        },
        {
          name: "Freie Körper und Trümmer: kippen, stapeln, brechen, einstürzen",
          punkte: 0,
          staffel: "1 = Körper fallen und ruhen (5 Kisten ≤ 2 s, Zittern ≤ 1 cm), ein Wagen wirft ein Fass um · 2 = auch Einsturz nach Lastpfad, Trümmer ≥ 10 min und über den Reload, 100 freie Körper ≤ 1 ms CPU an der GTX-CPU",
          messung: "Spielgang-Station bauen: Wird ein Pfosten unter dem Dach entfernt, fällt genau der Teil ohne Lastpfad; die Probe trennt an zufälligen Pfosten (Mutation des Bauplans). Bild Ego und Third, beide Geräte.",
          beleg: "In der Welt gibt es keinen freien Starrkörper. Der Lastpfad ist ein Urteil (`stamm/bau-buch.js:1791` `_loadPath`: BFS über AABB-Berührung, schwebende Teile werden getönt, nichts fällt); der Tod eines Tiers ist ein gescriptetes Kippen (`stamm/kreatur-leben.js:830` `_kreaturFaellt`).",
          schlupfloch: "Eine abgespielte Einsturz-Animation sähe richtig aus: die Probe verlangt, dass genau die Teile ohne Lastpfad fallen und die übrigen stehen."
        },
        {
          name: "Seile, Tuch, Weiches — EIN Löser, Labor = Welt",
          punkte: 0,
          staffel: "1 = ein Leser (das Schmiede-Seil schwingt in der Welt am Leib) · 2 = Seil, Tuch und Hängebrücke",
          messung: "werkbank eval + bild: der Flegel schwingt am Leib des Spielers (Seil-Länge ±2 %, die Energie fällt ab); Fahne, Plane und Umhang bewegen sich im EINEN Wind (Phasen-Korrelation mit dem Gras r ≥ 0,6); eine Hängebrücke trägt den Spieler; Labor und Welt mit demselben Löser (byte-Diff der Seil-Bahn bei gleicher Saat ≤ 1 mm).",
          beleg: "Das echte Seil lebt nur auf der Schmiede-Seite (`worlds/schmiede/schmiede.js:1152-1161`, 8 Verlet-Segmente, `stepRope`), mit 0 Lesern in Stamm und Kernen; in der Welt gibt es kein Tuch und keine weiche Gestalt.",
          schlupfloch: "Ein Wind-Shader auf einer Fahne (Vertex-Sinus) bestünde die Korrelation: Länge, Energie und Last (die Brücke trägt) verlangen einen Löser."
        },
        {
          name: "Der aktive Leib: Gleichgewicht, Stolpern, Sturz, Aufstehen",
          punkte: 0,
          staffel: "1 = ein Stoß von 200 N für 0,2 s beim Gehen führt zu Ausfallschritt und Erholung ≤ 1,5 s ohne Sturz, an einem Gerät · 2 = über einer Schwelle Sturz → Ragdoll → Aufstehen in eine Pose, die Treffer-Reaktion folgt der Impuls-Richtung (r ≥ 0,8), für Spieler, Tier und Mensch, beide Geräte",
          messung: "werkbank eval + bild, Ego und Third; die Mutation der Leib-Masse ändert die Reaktion; Labor = Welt über koerper-core.",
          beleg: "Es gibt den Tod als gescriptetes Kippen (`stamm/kreatur-leben.js:830` `_kreaturFaellt`, Richtung aus `_fieldGradient`, gate:kampf-gefuehl D) und den Landungs-Dip; einen Leib, der sein Gleichgewicht hält oder sich abfängt, gibt es nicht. Vorbild des Schöpfers: RAGE/Euphoria (Gedächtnis vision-schoepfer).",
          schlupfloch: "Eine abgespielte Stolper-Animation sähe richtig aus: die Reaktion muss der Impuls-Richtung und der Leib-Masse folgen (Mutation).",
          aenderung: "Neu (V07). Die Fahrdynamik der Synthese-K5 wohnt in Fahrzeug K1 (V28)."
        }
      ],
      hebel: [
        { name: "EIN XPBD-Löser im Körper-Kern: Seil, Tuch, Brücke", k: ["physik.K4+2"], t: [5, 7], wurzel: "`koerper-core.js` (Small-Steps-XPBD, Unter-Schritte im FIXED_DT); erster Leser das Schmiede-Seil (`worlds/schmiede/schmiede.js:1161` stepRope fällt — Labor = Welt), dann Fahne und Plane des Fachwerks.", pflicht: "—", v1: false },
        { name: "Der Lastpfad wird Bewegung (nach H1)", k: ["physik.K3+1"], t: [2, 3], wurzel: "`stamm/bau-buch.js:1791` `_loadPath` übergibt die Teile ohne Pfad an den Löser; Trümmer werden Welt-Zustand im Speicher wie die `_voxelEditKarte`.", pflicht: "—", v1: false },
        { name: "Kontakt beim Tempo des Spiels", k: ["physik.K2+1"], t: [1, 1], wurzel: "`stamm/koerper-bewegung.js:238-325` (Hülle gegen Box) rechnet in Teil-Schritten wie `_kreaturStossSchritt`; Station: Wagen bei vmax × 1,2 gegen die Mauer bei 30/60/144 fps, Bild-Probe Spalt.", pflicht: "—", v1: true },
        { name: "Der aktive Leib (nach H1)", k: ["physik.K5+2"], t: [3, 4], wurzel: "Gleichgewichts-Regler im Leib-Löser (`koerper-core.js`: Stützpolygon, Ausfallschritt); `_kreaturFaellt` (`stamm/kreatur-leben.js:830`) wird der Ragdoll-Übergang.", pflicht: "—", v1: false }
      ],
      feststeck: {
        versucht: "Hier rechnet die Physik, ohne zu bewegen. Ω-PHYSIS hat Schwerpunkt, Hebel, Standfestigkeit und Lastpfad als Achsen eines Bauplans (`stamm/bau-buch.js:1517-1830`, AXIS_CLASS „physik“); jede neue Achse machte die Werkstatt klüger, nie die Welt physischer. Nichts kippt, nichts fällt.",
        anders: "Zuerst Bewegung, mit EINEM Löser, an dem ein freier Körper sichtbar fällt. Die Achsen werden danach Leser des Lösers: Standfestigkeit heißt, ob das Ding nach 2 s Simulation noch steht — keine eigenen Schätzer mehr."
      }
    },
    {
      key: "stoffe",
      titel: "Stoffe und Chemie — Feuer, Phasen, Verwitterung, Kreislauf",
      dom: "`foundry-core.js` (FARB-GESETZ) · `spec/farbe/albedo-tafel.json` · `schmiede-core.js` · `stamm/bau-buch.js` · `stamm/feld-leben.js`",
      v1: "Feature-Stopp bis v1.0",
      aaaa: "Jeder Stoff ist EINE Zeile des Kerns in SI: Dichte, Reibung, Wärmekapazität, Zündpunkt, Schmelz- und Gefrierpunkt, Wasser-Aufnahme, Albedo trocken und nass, Klang. Jede Wirkung liest diese Zeile: Masse, Auftrieb, Grip, Brand, Phase, Farbe, Klang. Im Kern gelten drei Regeln: Elemente (Hitze, Nässe, Kälte) ändern den Zustand eines Stoffs; Elemente ändern einander (Regen löscht Feuer, Feuer trocknet, Kälte friert); Stoffe ändern einander nur über Elemente. Der Spieler zündet eine trockene Wiese: die Front läuft mit dem Wind 0,5–2 m/s, hält an Fluss, Fels und nassem Gras und hinterlässt Asche (Albedo ≤ 0,08), die in Tagen wieder grünt. Eisen rostet im Regen, Holz vergraut, Moos wächst auf der nassen Nordseite, wo oft gegangen wird, entsteht ein Pfad. Lava erstarrt am Wasser unter Dampf zu Basalt; der See trägt im Winter. Deterministisch aus Saat und Schreib-Akten, gespeichert; die Reaktions-Zellen um den Spieler ≤ 0,5 ms CPU, sparse und lazy. **Wo wir die Besten schlagen:** BotW und TotK reagieren an handgetaggten Objekten einer festen Karte, Noita simuliert jedes Pixel in 2D, Dwarf Fortress hat die Stoff-Tafel in ASCII; bei uns speist die Tafel des Kerns prozedurale 3D-Dinge, und das Reaktions-Substrat ist das Feld, das schon steht.",
      beste: [
        "**The Legend of Zelda: Breath of the Wild** (Nintendo; Fujibayashi, Takizawa, Dohta, GDC 2017 „Breaking Conventions“): die Chemie-Engine aus 3 Regeln; Feuer breitet sich im Gras aus und erzeugt Aufwind, Regen löscht und macht Fels rutschig, Metall leitet Blitz.",
        "**Noita** (Nolla Games; Petri Purho, GDC 2019): jedes Pixel simuliert — Sand, Flüssigkeit, Gas, Feuer; 64×64-Stücke im Schachbrett auf mehreren Fäden, nur schmutzige Rechtecke werden gerechnet.",
        "**Dwarf Fortress** (Bay 12): jeder Stoff trägt Schmelz-, Siede-, Zünd- und Hitzeschadens-Punkt und eine spezifische Wärme — EINE Tafel, die jede Reaktion liest.",
        "**Rothermel 1972** (USDA Forest Service INT-115): Ausbreitungs-Tempo eines Flächenfeuers aus Brennstoff-Kennwerten, Feuchte, Wind und Hang — die Grundlage von BehavePlus und FARSITE."
      ],
      kriterien: [
        {
          name: "EINE Stoff-Tafel in SI, und jede Wirkung liest sie",
          punkte: 0,
          staffel: "1 = ≥ 3 von 7 Wirkungen je Stoff bestehen ihre Mutation · 2 = 7/7",
          messung: "Konsum-Probe je Stoff (holz, stein, eisen, gras, erde, laub, wasser), Node ≤ 1 min, EINE Mutation je Wirkung mit beobachtbarer Folge: ρ halbiert → Masse und Eintauchtiefe; μ halbiert → Bremsweg; Albedo → Luma im Ausgabe-Bild; Klang-Spalte → Spektral-Schwerpunkt; T_zünd → Brand-Tempo; T_schmelz → Phase; c → Erwärmung.",
          beleg: "Stoff ist heute Optik: die Albedo-Tafel trägt 10 Zeilen (rinde … klinge, `spec/farbe/albedo-tafel.json`), Gegenstände tragen `userData.__stoff`. ρ in SI nur für 4 Schmiede-Stoffe (`schmiede-core.js:2519-2522`); daneben die bau-buch-Achsen in [0,1] (dichte, härte, brennbar, wärmeleitung, stromleitung; `stamm/bau-buch.js:2507-2596`), die nur Bauplan-Werte und die Klang-Tonhöhe lesen (`:2355`, `klang-core.js:1110`). Je Stoff liest heute 1 von 7 Wirkungen die Zeile.",
          schlupfloch: "`__consumes` zählt nur den Aufruf: ein Leser, der ruft und verwirft, fällt an seiner Mutation (B19). Eine große Tafel, die keiner liest, ist Existenz."
        },
        {
          name: "Feuer: zünden, ausbreiten, verzehren, löschen",
          punkte: 0,
          staffel: "1 = die Front läuft im Rothermel-Band (mit dem Wind 0,5–2 m/s, gegen ≤ 0,2 m/s) an einer Pose · 2 = Halt an Fluss, Fels und nassem Gras, Regen löscht ≤ 60 s, Asche ≤ 0,08 grünt nach, Licht/Rauch/Knistern aus demselben Zustand, 2 000 brennende Zellen ≤ 0,5 ms CPU an der GTX-CPU, beide Geräte",
          messung: "Spielgang-Station Feuer (werkbank, Mess-Wiese, klar, Wind 0,3; Spielzeit-Takte), Ego und Third.",
          beleg: "Der Brand des Felds ist EINE Funktion (w3s-feuer): die Front läuft als kürzeste Lauf-Zeit vom Eintrittspunkt jeder 16-m-Zelle (`stamm/feld-leben.js` `_brandZuenden`), ihr Tempo nach Rothermel 1972 aus der Spalte `brenn` der Stoff-Tafel (gras, laub; `stamm/bau-vorlagen.js` `_defaultMaterials`), dem EINEN Wind (`_windAt` in seiner Beaufort-Stärke) und dem Hang (`_brandTempo`); an der Mess-Wiese (bewölkt, Wind 0,3) mit dem Wind 0,88–0,92 m/s, gegen 0,028 m/s, ohne Wind höchstens 0,041 m/s (gate:stand-takt). Fels und Wasser tragen kein Bett, die Nässe erstickt es (das Laub erst nach 196 s Regen); die Asche ist eine Narbe im lebendig ohne Albedo; das Licht ist die Glut der Zelle, Rauch und Knistern lesen den Brand nicht. Die Tür der Bau-Stoffe bleibt zu (`stamm/bau-buch.js`: „brennbar nicht“).",
          schlupfloch: "Ein Partikel-Feuer, das sich nach Zeitplan ausbreitet, sähe richtig aus: das Tempo aus Wind und Feuchte, der Stopp an nassem Gras und die Asche im Boden-Stoff verlangen Leser derselben Stoff-Zeile und derselben Nässe.",
          aenderung: "Staffel neu (B02)."
        },
        {
          name: "Phasen: Gefrieren, Schmelzen, Erstarren, Glühen",
          punkte: 0,
          staffel: "1 = eine Phase mit Körper-Folge (das Eis trägt den Spieler, y am Spiegel ±5 cm) · 2 = alle vier: Schnee schmilzt über 0 °C und speist den Pegel, Lava (glut-Achse) erstarrt am Wasser unter Dampf zu Basalt, Stahl glüht in der Esse ab seiner Temperatur (Schmiede = Welt)",
          messung: "werkbank eval + bild mit dem Temperatur-Feld aus Höhe × Saison × Uhr (Wetter H3).",
          beleg: "Lava, Basalt und Schnee sind statische Boden-Farben (`stamm/gelaende-boden.js:2392-2437`, `voxel-worker.js:2613-2628`); glut ist eine eingefrorene Feld-Achse (`docs/das-lebendige-feld.md` §4.1); im Stamm gibt es keine Temperatur (nur die Lichtfarbe `kelvin`).",
          schlupfloch: "Eine Eis-Textur ohne Tragkraft bestünde das Bild: der Körper auf dem Eis und die Schmelze im Pegel sind Pflicht.",
          aenderung: "EIN Heim für Eis und Schmelze (vorher auch Wetter K4; B15, V24)."
        },
        {
          name: "Verwitterung mit der Zeit: Rost, Vergrauen, Moos, Trampelpfad",
          punkte: 0,
          staffel: "1 = nach einem Spielzeit-Sprung von 30 Tagen ändert sich ≥ 1 Stoff messbar im Bild, abhängig von Nässe oder Lage · 2 = Holz-Sättigung −30 %, Eisen im Regen Farbton 20–30° (Rost), Moos auf nassen Nordflächen, ein 100× gegangener Weg wird Pfad (Gras-Dichte −60 %), über den Reload",
          messung: "werkbank bild im Dorf nach 30 Spieltagen (Ego, beide Geräte); gate:reload-treue hält das Alter.",
          beleg: "Verwitterung ist Gesetz, aber statisch: der Regler `verwitterung` (`fachwerk-core.js:3864`, Moos am Dachfuß `:4807`), Fels-Moos aus Krümmung und Feuchte (`gelaende-core.js:2102-2142`) — sichtbar, ändert sich nie mit der Zeit.",
          schlupfloch: "Den Regler nach Spielzeit hochzudrehen ließe alles gleich altern: die Abhängigkeit von Nässe und Lage (Nordseite, Regen-Treffer, Dach-Schutz) ist Pflicht.",
          aenderung: "Synthese gab 1 für den statischen Regler (Existenz) → 0 (B20)."
        },
        {
          name: "Nährstoff, Nachwuchs, Sukzession",
          punkte: 0,
          staffel: "1 = der Nachwuchs korreliert nach 1 Spieljahr mit Feuchte × Licht (r ≥ 0,5) · 2 = Stubben → Sämling, Brand → Gras → Busch → Wald, Ernte entnimmt Nährstoff, Asche und Leichnam geben ihn zurück",
          messung: "werkbank eval + bild nach einem Spielzeit-Sprung von 1 Jahr; Gegenprobe mit zwei Zellen verschiedener Feuchte.",
          beleg: "Die Platzierung liest das Feuchte-Feld (`stamm/gelaende-boden.js:1333` `_feuchteAt`) — statisch zur Genese; Streu wächst per Zeitgeber nach (`stamm/vegetation-wiese.js:1830` FORAGE.regrowMs 300 000, `_tickScatterRegrow` `:1083`); Nährstoff gibt es nicht (0 Treffer).",
          schlupfloch: "Ein Zeitgeber, der nach N Minuten einen Baum setzt, bestünde das Nachwachsen: Korrelation mit Feuchte und Licht und die Sukzessions-Reihe sind Pflicht.",
          aenderung: "Wachstum zählte dreimal (Stoffe K5, Vegetation K5, Leben-Feld K1); EIN Heim hier, die Saison als Gestalt bleibt Vegetation K5 (B21, V-Wachstum). Die Synthese gab 1 für die statische Platzierung → 0."
        }
      ],
      hebel: [
        { name: "EINE Stoff-Tafel in SI im Kern", k: ["stoffe.K1+1"], t: [2, 2], wurzel: "`foundry-core.js` neben dem FARB-GESETZ: die Zeilen der Albedo-Tafel bekommen ρ, μ, c, T_zünd, T_schmelz, Wasser-Aufnahme; `schmiede-core.js:2519` und die [0,1]-Achsen aus `stamm/bau-buch.js:2507-2596` werden Leser, ihre eigenen Zahlen fallen im selben Commit.", pflicht: "—", v1: false },
        { name: "Die drei Regeln auf dem Feld: Hitze und Brand als Overlay-Achsen", k: ["stoffe.K2+1"], t: [4, 4], wurzel: "`stamm/feld-leben.js` (auraAt + Deposit-Familie: sparse 2-m-Zellen, lazy-decay; die Brand-Front tickt nur in brennenden Zellen); Leser Licht (kelvin-Pool `stamm/dirigent-kern.js:1637`), Klang, Nah-Wiese, Asche im Boden-Stoff; Regen löscht über die EINE Nässe (Wetter H1).", pflicht: "—", v1: false },
        { name: "Alter = Zeit × Nässe (nach Wetter H1)", k: ["stoffe.K4+2"], t: [2, 2], wurzel: "`fachwerk-core.js:3864` verwitterung und `gelaende-core.js:2132-2142` (Moos) lesen das Alter seit dem Bau × Nässe-Achse statt eines Reglers; der Trampelpfad aus einer Lauf-Achse, die die Nah-Wiese liest.", pflicht: "—", v1: false },
        { name: "Nährstoff, Nachwuchs, Sukzession", k: ["stoffe.K5+1"], t: [3, 3], wurzel: "Nährstoff-Achse neben `_feuchteAt` (`stamm/gelaende-boden.js:1333`); `_tickScatterRegrow` (`stamm/vegetation-wiese.js:1083`) und die Pflanz-Schlange lesen sie, `treeParams(alter)` (phyto-core) liefert den Jungwuchs.", pflicht: "—", v1: false }
      ],
      feststeck: {
        versucht: "Das Vokabular wuchs, die Reaktion nie: 14 Achsen (AXIS_LABELS, `stamm/bau-buch.js:2626-2655`, darunter brennbar, wärmeleitung, stromleitung) und eine Stoff-Kennung je Gegenstand stehen bereit, aber `stamm/bau-buch.js:2423` schließt die Tür: „Feuer-Ausbreitung wäre ein eigener Pfad“.",
        anders: "Kein eigener Pfad: die Chemie wird eine Lese-Schreib-Regel auf dem Feld, das schon steht (frozen Kern + sparse lazy Overlays). Hitze, Nässe und Brand sind Overlay-Achsen, die Reaktionen die drei Regeln, die Stoff-Zeile ihr einziger Parameter."
      }
    },
    {
      key: "feld",
      titel: "Das lebendige Feld — Kette, Gleichheit, Ruhe, Gedächtnis (liest · schreibt)",
      dom: "`stamm/feld-leben.js` (auraAt, Overlays) · `stamm/feld-dsl.js` · `stamm/wasser-zellen.js` · `stamm/vegetation-*.js` · `docs/das-lebendige-feld.md`",
      v1: "Feature-Stopp bis v1.0 — Ruhe = 0 steht (K3, trägt E)",
      aaaa: "Eine Ursache läuft durch ≥ 4 Teilsysteme, und jedes liest den Zustand seines Vorgängers, nie die Ursache: Sturm → Regen-Feld → nasser Boden und steigender Bach → der Grip fällt, Tiere suchen Unterstand und Tränke → weniger Wild im Offenen, der Klang wechselt. Jede Tat schreibt ins EINE Feld und bleibt am Ort: zehn gefällte Bäume sind über Speichern und Laden eine Lichtung, die über Spieltage zuwächst, schneller, wo der Spieler pflegt; eine Pflege-Geste macht genau diese 16-m-Zelle dichter und bunter (ΔLAI ≥ +0,3), die Nachbarzelle bleibt gleich. Alles ist Funktion von Saat und Schreib-Akten: jeder Peer und jeder Reload sieht dieselbe Welt, ohne Zustands-Nachricht. In Ruhe rechnet keine Simulation; die Kosten hängen an berührten Zellen, nie an der Welt (Gebot 7). **Wo wir die Besten schlagen:** From Dust koppelt Stoffe auf einer Insel, Dwarf Fortress simuliert Geschichte, aber nicht in Echtzeit-3D, BotW koppelt Elemente, aber die Welt erinnert nicht; bei uns lesen Pflanze, Tier, Licht, Klang und Nexus dieselbe Quelle `auraAt` in einer unendlichen Welt.",
      beste: [
        "**From Dust** (Ubisoft 2011, Eric Chahi): Wasser, Sand, Lava, Vegetation und Feuer auf EINEM Feld; jede Ursache läuft durch alle (Lava erstarrt und staut Wasser, das Dorf ertrinkt oder blüht).",
        "**Dwarf Fortress** (Bay 12): Temperatur, Flüssigkeiten, Stoffe und Wesen lesen dieselben Zellen — Kopplung durch geteilten Zustand; die Welt-Genese simuliert Jahrhunderte Geschichte.",
        "**Minecraft** (Mojang): das Zufalls-Takt-Gesetz — je 16³-Abschnitt 3 zufällige Block-Takte je Spiel-Takt (20 Hz) treiben Wachsen, Feuer, Schmelzen, Ausbreiten; die Kosten wachsen mit der geladenen Fläche, nie mit dem Zustand.",
        "**Eco** (Strange Loop Games): jeder Bestand läuft in einer Simulation, gefällte Wälder zerstören Lebensraum, Aussterben ist endgültig — die Ökologie ist das Spiel, das Bild bleibt schlicht."
      ],
      kriterien: [
        {
          name: "Kopplungs-Tiefe: eine Ursache, eine Kette über ≥ 4 Teilsysteme",
          punkte: 0,
          staffel: "1 = Tiefe 2–3 mit Festhalte-Probe · 2 = Tiefe ≥ 4",
          messung: "Spielgang-Station Sturm (werkbank, 20 min Spielzeit per Sprung, Ego): gezählt werden die Teilsysteme, deren beobachtbarer Zustand sich zur LAUFZEIT ändert UND die den Zustand ihres Vorgängers lesen; Festhalte-Probe: wird der Vorgänger festgehalten, bleibt der Nachfolger stehen. Ein Glied, das nur zur Genese liest, zählt nicht.",
          beleg: "Graben → Wasser → Wiese (9aac0517) ist im Code eine Kette, aber die Festhalte-Probe gibt es nicht; Hydrosphäre → Feuchte → Platzierung ist zur Laufzeit statisch. Das Wetter ist ein Stern: Klang, Licht, Luft, Regen und Tier-Laune lesen das Wort direkt (`stamm/klang.js:279`, `stamm/bild-himmel.js:1130/2227`, `stamm/kreatur-verhalten.js:2199`).",
          schlupfloch: "Mehr Leser an die Ursache zu hängen (Stern) hebt die Zahl, nicht die Tiefe: nur ein Glied, das beim Festhalten seines Vorgängers stehen bleibt, zählt.",
          aenderung: "Die „Tiefe 2“ der Synthese war aus Commit-Messages gelesen → 0 (B22)."
        },
        {
          name: "Gleich für alle: Saat + Schreib-Akte = Welt, über Peers und Reload",
          punkte: 1,
          staffel: "1 = Edits und Bauten aus Schreib-Akten byte-gleich über Peers und Reload, gemessen · 2 = alle Teil-Simulationen (Wetter am Ort, Pegel, Overlays, Brand) ohne Zustands-Nachricht; ein Reload mitten im Sturm setzt denselben Zustand fort",
          messung: "gate:mp-sync + gate:reload-treue, erweitert: zwei Clients 20 min Spielzeit mit Auto-Wetter, Wasser und Feuer; Zustands-Nachrichten außer Schreib-Akten sind verboten (Netz-Log). Gleichheit ist eine Eigenschaft der Funktion — zwei Seiten einer Maschine genügen hier; Latenz und Bild des Peers zählen Tore K4.",
          beleg: "gate:mp-sync in der CI (`.github/workflows/check.yml:1299`): Graben reist, Ursprung 0, Rejoin ≤ 31 s (`scripts/diag-mp-sync.cjs:1-20`); Edits atomar je Chunk (`_voxelEditKarte`); Regel-RNG aus FNV über worldId + Regel + Feuer-Index (`stamm/feld-dsl.js:717-722`). Das Wetter zieht seit main f2904a72 aus der Saat (Wetter K1, gate:wetter-wache (Z)); ob zwei Peers ohne Zustands-Nachricht denselben Zug sehen, ist ungemessen (der Samen-Zähler reist zum Gast, `stamm/dirigent-takt.js:975`), Pegel, Overlays und Brand ebenso.",
          schlupfloch: "Den Zustand je Takt zu senden machte die Peers gleich, ohne dass die Welt eine Funktion ist: darum keine Zustands-Nachricht außer Schreib-Akten.",
          aenderung: "EIN Heim der Gleichheit für alle Teil-Simulationen, auch das Wetter (B12)."
        },
        {
          name: "Ruhe ist Null: in Ruhe arbeitet keine Simulation",
          punkte: 1,
          staffel: "1 = der Wasser-Automat hat 0 Takte in 60 s Ruhe · 2 = jede langsame Simulation (Wasser, Overlays, Wetter, Brand, Wachstum) hat 0 Einheiten in Ruhe und arbeitet nur in berührten Zellen",
          messung: "werkbank stand + takt im echten Loop, 60 s Ruhe (Spieler steht, Wetter ruht), Sim-Einheiten je Teil-Simulation. Die Kosten der Sturm-Pose sind eine Zelle von Profiband K2.",
          beleg: "SCHNITT feld-ruhe 8de57097 (Merge 6a49541e, integ 6cfce28a), mit Welt-Byte in `stamm/wasser-zellen.js`, `bild-himmel.js`, `feld-leben.js`, `gelaende-chunks.js`, `vegetation-wiese.js`, `dienst.js`: der Automat ruht ohne neues Dach sofort; Regen und Nässe am Ziel, die Saison am Stempel ihrer Phase, der Wuchs, der Nachwuchs (bis zur fälligen Ernte statt im 10-s-Blick auf die Wanduhr) und das Feld (räumt unter der Tat statt alle 5 s) schlafen an ihrem Fixpunkt. Gemessen mit gate:stand-takt, Sim-Linse (`scripts/lib/stand-linse.cjs` SIMS, `wasser` = `_tickWorldWaterCA` + waterCAActive): Spieler an der Mess-Wiese, Wetter und Saison ruhen, 3 600 echte `_gameLoopTick` = 60 s Spielzeit nach einer Tat (Ernte `_harvestScatterPick`, `_depositLife`); Basis ROT (regen 21 600, saison 10 800, wuchs 32 400, feld 1 164, nachwuchs 1 Einheiten), Kopf 65 965 → 0 Einheiten über alle sechs Sims, der Automat nach dem Wecken am Fixpunkt 4 → 1 Takt (Null-Renderer, Mechanik-Zählung nach R3 wie Wetter K1) → Staffel 1. Frisch: CI-Gruppe 5 (`check.yml:734`) misst am Kopf 6cfce28a neu (integ-CI 22/22); spätere Hunks (wasser-leser, fahrt-takt) liegen außerhalb der Sim-Takte. Für die 2 fehlen `werkbank stand --sim` im echten Fenster an Radeon und GTX, „nur in berührten Zellen“ (unter Taten 32 805 Einheiten, das Feld bis 1 170 Zellen bei 630 lebenden) und ein Brand mit Takt (heute ohne Takt im Stamm, die 0 ist dort leer). Davor: der Automat arbeitete in Ruhe 48 Takte (9aac0517, vorher 594).",
          schlupfloch: "Teil-Simulationen unter Last abzuschalten hält den Takt und bricht die Welt (fail-soft): die Probe misst die Kette aus K1 im selben Lauf; über dem Budget drosselt nur das Tempo, nie die Existenz (Lehre 13).",
          aenderung: "EIN Heim der Ruhe (B23); Gelände K2 zählt sie nicht mehr, der Sturm-Takt ist eine Zelle des Profi-Bands (V26); Schnitt feld-ruhe 22.10. 0 → 1."
        },
        {
          name: "Die Tat bleibt am Ort: Spur und Gedächtnis",
          punkte: 0,
          staffel: "1 = die Spur hält bis zum Reload · 2 = sie hält nach Reload UND nach 1 Spielstunde und wächst über das Feld nach",
          messung: "Spielgang-Station Lichtung an der Mess-Wiese: 10 Bäume fällen und 30 Pflanzen ernten mit dem echten Verb tryMouseBreak, Ego und Third; Speichern → Laden, +1 Spielstunde; Klassen-Maske (werkbank bild --klasse baum|nahWiese) am Ort: Baum- und Halm-Pixel in der Lichtung ≤ 30 % des Vorher-Bilds, Stümpfe sichtbar, das Overlay der Zelle weicht vom frozen Wert ab; beide Geräte.",
          beleg: "LIFE_FIELD.decayPerSec 0,008, Halbwertszeit ≈ 87 s (`stamm/feld-leben.js:2256-2258`); die Ernte lebt in state.scatterHarvested, wächst nach festem Timer FORAGE.regrowMs 300 000 nach (`stamm/vegetation-wiese.js:1830`) und wird nicht gespeichert (`stamm/speicher-*.js`: 0 Treffer). Ungemessen.",
          schlupfloch: "Ein Abzieh-Bild am Boden änderte die Klassen-Maske Baum nicht: das echte Verb und die Maske sind Pflicht; das Nachwachsen über das Feld verlangt K5."
        },
        {
          name: "Das Feld wird gesehen: Konsum am Ort der Tat",
          punkte: 0,
          staffel: "1 = ein Leser sichtbar am Ort an einem Gerät · 2 = zwei Orte auf beiden Geräten, Wiese UND Tier",
          messung: "werkbank eval: Pflege-Akt (DSL-Op deposit_life) auf einen 3×3-Zellen-Block der Mess-Wiese, Bild-Diff am Ort vorher ↔ nachher (60 s): laiWirk +≥ 0,3, Buntheit und Blüten-Anteil steigen, Tier-Sichtungen nehmen zu; die Nachbarzelle bleibt unverändert (|Δ| ≤ Rauschen). Ego und Third, Mittag und Abend.",
          beleg: "Die Vegetation liest nur das frozen worldFieldAt (`stamm/vegetation-wiese.js:510/1111/1139`, `vegetation-streu.js:102/705`, `vegetation-baum.js:1310`); `_lifeOverlayAt` hat EINEN Leser (auraAt, `stamm/feld-leben.js:1655`); sichtbar lesen auraAt nur der globale Tint an der Spieler-Position (`stamm/bild-himmel.js:1060-1075`), der Klang, die Spawn-Affinität und das Mana. Ungemessen.",
          schlupfloch: "Ein globaler Tint lässt die Welt reaktiv wirken: die Nachbarzelle bleibt gleich, die Wirkung steht am Ort in der Klasse Wiese oder Tier, nicht im Himmel."
        }
      ],
      hebel: [
        { name: "Das Feld wird gesehen: die Vegetation liest auraAt", k: ["feld.K5+1"], t: [1, 1.5], wurzel: "`stamm/feld-leben.js:auraAt` wird die EINE Lese-API der 7 frozen Leser (`vegetation-wiese.js:510/1111/1139`, `vegetation-streu.js:102/705`, `vegetation-baum.js:1310`); eine Overlay-Änderung weckt nur die berührte 16-m-Zelle (`_weltRegt`, Kachel.zustand = null).", pflicht: "—", v1: false },
        { name: "Alle Teil-Simulationen aus Saat + Akten (Wetter K1 steht)", k: ["feld.K2+1"], t: [1, 1], wurzel: "gate:mp-sync-Erweiterung mit Auto-Wetter, Pegel und Overlays; Verbot von Zustands-Nachrichten im Netz-Log.", pflicht: "—", v1: false }
      ],
      feststeck: {
        versucht: "Das Feld ist seit Monaten der wahre Norden („wer eine neue lebendige Wirkung baut, liest HIER — kein neues _tickX“, `docs/das-lebendige-feld.md` §4.1); trotzdem entstand jede langsame Simulation daneben, mit eigenem Zustand und eigener Uhr (`_tickWorldWaterCA`, `_tickRain`, `_tickSeason`, `_tickScatterRegrow`, `_tickHarvest`). Gemessen wurde das Feld als Existenz (21 headless Checks in `scripts/playtest/feld-leben.cjs`, „LIFE_FIELD-Konstante existiert“).",
        anders: "Die Overlays des Felds werden das Substrat jeder langsamen Simulation — Nässe, Hitze, Brand, Nährstoff, Schnee —, jede eine Achse mit lazy Zerfall; die Leser lesen `auraAt`, eine Sim-Uhr gibt es nur, wo sich etwas ändert. Der erste Schnitt stellt Leser um (H1), er baut kein neues System."
      }
    }
  ]
};
