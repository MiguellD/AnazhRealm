# Architektur-Antwort: Gesetzgeber oder Kulissenbauer?

Stand 12.10.2026. Code: Root-Checkout `a0a05614` (V18.542, = origin/main), nur gelesen. Das Blatt antwortet auf die Frage des
Schöpfers vom 12.10. und setzt keinen Pflicht-OFFEN-Eintrag (Rest bleibt A, B, C, E).

- **Quellen:** die Befunde der Leser Varianten, Physik, Datenfluss und Skalierung. Der Skalierungs-Befund kam ab Punkt 27
  abgeschnitten an, ein fünfter Befund gar nicht; §4 ist darum eigene Lesung mit den Textquellen aus `nordstern.md`.
- **Stichprobe:** 84 Anker an `a0a05614` nachgelesen, alle stimmen. Korrigiert ist eine Zählung: die sieben lebenden Baumarten
  tragen 12 Gestalten, nicht 15 (foundry-core.js:446–466). `HOLZ` steht heute bei fachwerk-core.js:931 (nordstern.md:37 nennt
  den Stand V18.538, :918).
- **Zähl-Regel:** GESETZ = eine Größe mit physikalischer oder biologischer Bedeutung, Einheit und Quelle, aus der Gestalt oder
  Bewegung folgt. KULISSE = Literal, Hand-Kurve, Sonderfall, Skript. „[gerechnet]" = aus dem Code gerechnet, nicht im Bild
  gemessen. Ein Anker `:NNNN` ohne Datei meint `anazhRealm.js`.

---

## 1 · Die Antwort in fünf Sätzen

1. Wir schreiben Gesetze, aber nur in der Mitte der Kette: 17 von 30 Wirk-Pfaden tragen die Form eines physikalischen Gesetzes
   (57 %), doch nur 25 von 203 Zahlen darin haben Einheit und Quelle (12 %), und keiner der 124 Regler hat eine Einheit — der
   Mechanismus ist Physik, die Eingänge sind Kulisse.
2. Die Erstellung läuft vom Gesetz bis zum Pixel (102 von 102 Studio-Presets entstehen in `buildInstance` ihres Kerns,
   adressiert durch Art, Saat und ov), aber das Exemplar ist gequantelt: alle lebenden Bäume der Welt sind 12 Gestalten, jede
   Birke eine von 2 plus Skala, Drehung und Tönung — „eine Basis, jedes weitere eine kleine Abweichung" gilt im Studio, in der
   Welt noch nicht.
3. Gespeichert wird ein Sack statt der Funktion: das ganze Gelände reist in 2 917 B ohne ein Chunk-Byte, doch jeder besuchte
   Weltgen-Baum liegt als eigener Eintrag im Snapshot, der 257. Graben-Edit verdrängt still den ersten, und der save-server
   schreibt ohne tmp und ohne .bak.
4. Für hunderte Spieler fehlt die Architektur, nicht das Prinzip: der Draht trägt schon Gesetz-Adressen (ein Bau ≈ 361 B statt
   Chunk-Daten), aber das Netz ist ein Voll-Mesh ohne Herrn, gemessen bei N = 2, ohne Interest-Management (bei N = 100
   ≈ 17 Mbit/s Upload je Client [gerechnet]), und ein totes Paar schaltet den Lockstep für alle ab.
5. Der Plan schneidet zuerst, was B, C und E im gespielten Pfad bricht (Wasser-Fahrt, Geräte-Regler, EIN Gang-Gesetz, der
   Dorf-Plan), dann die Zwillinge und den Sack (EINE Schwerkraft, Edits je Chunk, EINE Baum-Ableitung, Welt = Funktion +
   Abweichungen), und erst nach v1 die Klassen mit heute 0 Zeilen: Region-Autorität im Netz und ein Gelenk-Löser, aus dem
   Ragdoll, Maschinen und Tragwerk folgen.

---

## 2 · Die Fragen

### 2.1 Erstellen wir Gesetze, oder bauen wir Kulissen?

- **Heute:**
  - Die Gesetze stehen im Kern und tragen Namen. `growSkeleton` rechnet McMahon, da Vinci r^Δ, Apikaldominanz, Gravitropismus
    und Quirle (phyto-core.js:68–150, McMahon :73–77).
  - Die Zweispur rechnet Newton-Euler mit Schlupfwinkel und Reibkreis (vehicle-core.js:2842–2980).
  - Der Bogen speichert ½·F·Auszug·η, geeicht gegen Stretton 114 J (schmiede-core.js:2749–2775).
  - Die Luft rechnet Rayleigh nach Bucholtz 1995 (:105880–105883) und Koschmieder (:93334–93350).
  - Die Eingänge darüber sind Hand-Arbeit: 5 normierte Dials je Baumart (foundry-core.js:4087–4205) werden per Hand-Lerp,
    Schwelle und Hex-Tafel zu 16 Phänotyp-Merkmalen (phyto-core.js:1740–1806).
- **Gesetz-Anteil:**
  - Wirk-Pfade 17/30 = 57 %.
  - Zahlen mit Einheit und Quelle 25/203 = 12 % (10 Physik-Datenblöcke).
  - Regler: mit Einheit 0/124, mit Formel und Quelle 11/124 = 9 %, tot 18 (113 Zeilen `PARAMS_BY_KIND` + 11 HTML-Slider
    worlds/terrain/index.html:57).
  - Die Eingänge der gesehenen Welt-Eiche sind zu 3/29 ≈ 10 % Gesetz.
- **Lücke:** Die Regler sind Knöpfe, keine Größen. `gate:regler-wirkt` prüft nur, ob ein Regler den Bau-Hash bewegt
  (scripts/diag-regler-wirkt.cjs:1–20), nie Einheit oder Gesetzestreue.
- **Ziel:** Jeder Regler ist eine Größe mit Einheit und Quelle (Nordstern M2, nordstern.md:121): Zensus 0/124 → 124/124,
  tote Regler 18 → 0 (Karte 13).

### 2.2 Planet und Gravitation

- **Heute:**
  - Die Welt ist flach, g ist ein Skalar längs −y (`state.gravity` :231, Integration :97309). Für Krümmung, Bahn und
    Deklination gibt es 0 Zeilen (grep `6371|Kepler|Erdkr` über Stamm und Kerne = 0).
  - Die Sonne läuft auf einem Kreis mit Hand-Neigung `sin(angle·0,5)·0,4` (:92686–92692). Der Mond leuchtet konstant 0,22,
    ohne Phase (:105879).
  - g lebt fünffach:
    - `state.gravity` −9,81 (:231)
    - `GANG_GESETZ.g` 9,81 (tetrapoda-core.js:1313)
    - `FAHR.G` 9,8 (vehicle-core.js:2160)
    - `BEGEH_GESETZ.g` 20 (fachwerk-core.js:5022)
    - Labor `ARENA.g` (worlds/schmiede/schmiede.js:435)
- **Gesetz-Anteil:** Die Integration ist Gesetz (fester Schritt 1/60, `_stepFixedSim` :96683). Die Quelle von g ist es nicht:
  nur 1 der 5 Stellen ist die Welt-Größe.
- **Lücke:**
  - Die DSL-Schwerkraft (−30…0, :2029) erreicht 6 Leser: Spieler, Pfeil, Stoß-Reibung. Tier-Gang, Tier-Hüpfer (:102899) und
    Wagen (vehicle-core.js:2646) erreicht sie nie.
  - `s.gravity || -9.81` macht das erlaubte g = 0 zu 9,81 (:96015, :97309, :97530); der Pfeil prüft dagegen `isFinite` (:84121).
    Bei g = 0 fällt der Spieler also, und der Pfeil fliegt gerade.
- **Ziel:** EINE Schwerkraft, die jeder Leib, jedes Tier und jeder Wagen liest (Karte 5). Ein Kugel-Planet mit Bahn,
  Jahreszeit aus der Achsneigung und Mondphase ist nach v1 und braucht einen Schöpfer-Eintrag. Er ändert das Speichermodell
  nicht: ein Planet ist eine Koordinaten-Abbildung über dieselbe Höhen-Funktion.

### 2.3 Körperformen

- **Heute:**
  - Masse ist Gesetz: das Volumen der geschlossenen Haut × Kern-Dichte (:21628–21653; tetrapoda-core.js:1531 1000 kg/m³,
    koerper-core.js:1160 985 kg/m³). Daraus folgen Fuchs 15 · Wolf 64 · Hirsch 94 · Bär 335 kg (tetrapoda-core.js:159–161).
  - Der Mensch ist ein echtes Saat-Individuum: 7 Genom-Achsen (:17281–17296) werden Dials, und jeder Dial-Satz bekommt seinen
    eigenen Ofen-Guss (:17349, :18447).
  - Die vier Tiere sind 5-Dial-Punkte (tetrapoda-core.js:65), die Gauß-gewichtet mischen (tetrapoda-core.js:1650–1690).
  - Das Haus folgt seiner Kultur-Zeile pitch · W · D · st · brace · stil · col (fachwerk-core.js:1737–1768).
- **Gesetz-Anteil:**
  - Masse und Allometrie stehen als Gesetz: tetrapoda size ^0,67 (tetrapoda-core.js:291) und das Froude-Bein. Die Gestalt-Eingänge
    sind Punkte in Dial-Räumen ohne Einheit.
  - Saat-Individuen in der Welt: 2 von 7 Klassen sind je Exemplar gerechnet (Mensch, Dorf-Haus). Gequantelt sind Baum
    (12 Gestalten) und Wagen (8 Lacke derselben Geometrie, vehicle-core.js:3378). Ohne Saat-Achse sind Tier 4, Tor 7 und
    Waffe 21 Rezepte, dazu der Studio-Körper 1 (tetrapoda-core.js:36–39, porta-core.js:59, schmiede-core.js:58,
    koerper-core.js:37).
- **Lücke:**
  - Die Größe des Exemplars läuft am eigenen Gesetz vorbei. Beim Tier wirkt `bodySize` 0,6–2,7 als `setScalar` (:16880) statt
    über den size-Dial: Würfel-Spanne 4,5× gegen ein Soll-Band Widerrist 0,7–0,9 m = 1,29× (tetrapoda-core.js:1634).
  - Die Welt-Eiche hat H/D 12,5 [gerechnet]; im Bestand gilt 40–100 (nordstern.md:392). Die Uniform-Skala s = 0,5–1,95 macht
    den Stamm gegen McMahon am oberen Rand 28 % zu dünn und am unteren 41 % zu dick [gerechnet].
  - Ebene 1 Stoff hat drei Wahrheiten: das FARB-GESETZ in foundry-core, `HOLZ` handgesetzt (fachwerk-core.js:931) und
    `MATERIAL_TAG_KEYS` (:104540).
- **Ziel:**
  - Die Größe ist eine Achse des Gesetzes, nicht des Bildes. Der Baum wächst auf seiner Welthöhe in m (K20 trägt die Höhen),
    das Tier speist `bodySize` in den size-Dial, die Rest-Skala bleibt ≤ ±10 % (Karte 12).
  - EINE Stoff-Zeile {ρ, E, f_m, Albedo, Rauheit, μ, c_rr} je Stoff (nordstern.md:37).

### 2.4 Bewegung: Physik und Logik, oder ein flaches Skript?

- **Heute, Gesetz:**
  - Impuls J = (1+e)·v_rel/(1/mA+1/mB) mit vier Rufern (:103272–103275).
  - EIN Leib-Löser mit Trennung nach Massen, 8 Gänge (:21770–21880).
  - Die Zweispur (vehicle-core.js:2842–2980).
  - Wasser am Wagen: ½ρ·c_w·A·v² (vehicle-core.js:2948–2966) und die Archimedes-Wasserlinie (:55677–55697).
  - Tier-Gang nach Froude: λ = L·(1,2 + 2·v/√(gL)) (tetrapoda-core.js:1312–1335).
  - Pfeil v0 = √(2E/m) (:84051), Treffer KE = ½·m_eff·v² (schmiede-core.js:3206–3256).
- **Heute, Kulisse:**
  - Spieler-Lauf als exp-Annäherung mit kAcc 14 / kBrake 9 (koerper-core.js:541). Der Fall ist bei −25 m/s gedeckelt, statt
    Luftwiderstand zu rechnen (:97310).
  - Mensch-Gang: `schritt.kalib` 4,0 × Bein ≈ 3,4 m (koerper-core.js:560; Rückfall 3.4 :17543), also 0,34 Schritte/s.
  - Antrieb `carPhys`: „Masse" in m³, F0 80,5 und dragC 0,1618 „auf GT geeicht" (vehicle-core.js:2418–2428). Der GT endet
    bei ≈ 16 m/s.
  - Federn als Bild-Moment (vehicle-core.js:2165–2170).
  - Tod: 1 s Kippen und 4 s Versinken (:20051–20110).
  - Wind als Shader-Sinus ohne m/s (:16458–16538).
  - Jeder Fluss fließt mit 1,2 m/s × centerness (:35071–35082).
- **Gesetz-Anteil:** 57 % der Pfade tragen die Gesetz-Form, 12 % der Zahlen eine Herkunft. Ohne Quelle sind STOSS 0/7,
  Steuer 0/5 und carPhys 0/2 (e 0,2/0,3/0,1 und μ 0,6 :103097–103100).
- **Lücke, Klasse für Klasse:**
  - Gelenk-Dynamik und Ragdoll: 0 Zeilen (grep `ragdoll|verlet|XPBD|constraint` = 0).
  - Der Leib-Löser ist 2D in XZ: keine Vertikale, kein Drehimpuls, kein Stapeln.
  - Tragwerk: 0 Zeilen. Fachwerk kennt die Spannweite nur als Daumenregel (fachwerk-core.js:931–932).
  - Bruch: 0 Zeilen. `harvestArchitecture` entfernt den Eintrag ganz (:82874–82879).
  - Stoff-Simulation: 0 Zeilen, das Segel ist eine Shader-Welle (:19743).
  - Der Klang kennt keine Laufzeit und keinen Doppler.
- **Ziel:** Gang, Schwerkraft und Auftrieb sind je EIN Gesetz für jeden Leib (Karten 3, 5). Nach v1 kommt EIN Gelenk-Löser,
  aus dem Ragdoll, Maschinen-Gelenke und Tragwerk folgen (Karte 15).

### 2.5 Hierarchie und Datenfluss (die Erstellung)

- **Heute:** Die Hierarchie steht als die Ebenen 0–8. Ihre Regel: nach oben reist nur das Ergebnis, nach unten nur
  Randbedingungen (nordstern.md:20–24). Ein Baum fließt so:
  1. Kern-Rezept, z. B. die Birke (foundry-core.js:4124–4141).
  2. Das Buch reist einmal je Boot über `get-book` (:73985) in EINEN Ingest `_foundryIngestBook` (:74065).
  3. Bestellt wird über EINE Schlange: nah zuerst, 12 im Flug (:75971–76050, :106111).
  4. Der Worker baut mit `buildInstance` (worlds/terrain/phytogenesis.js:5386–5390); am Ausgang greift das Budget-Gesetz
     (:5456 dort).
  5. Die Platte liegt in IDB unter einem SHA-256 über Manifest, Kerne und Shells (:74362). Bei Drift wird sie geleert
     (:74381), die Antwort reist per Transfer.
  6. Der Wirt nimmt 180 Körper/s auf (:75836–75866), hält eine LRU mit 512 Einträgen (:78560–78578) und zeichnet je
     Blatt×Region EINE InstancedMesh (:70785–70800). Fern ist der Baum eine Schicht des EINEN Atlas (:67518–67545).
- **Gesetz-Anteil:**
  - Erstellung: 102/102 Presets aus dem Kern = 100 % gesetz-adressiert.
  - Substanz (Tags, Masse, Kollision): 74/102 = 73 % sind ein Donor-Klon (:74212, KIND_POLICY :101825–101887).
  - Eine eigene Gesetz-Hülle für die Kollision haben 44/102 = 43 % (Haus, Tor, Wagen).
- **Lücke:**
  - Die Schichten halten im Stamm nicht: 201 Methoden schreiben an 572 Stellen Zustand eines anderen Moduls, und 503 von 2 097
    modulübergreifenden Rufen gehen aufwärts (modul-karte.md:24, gemessen an V18.538).
  - Der Baum hat zwei Grammatiken. Das Bild kommt aus phyto-core mit 2 Gestalten (Knuth-Wahl :78515–78520). Kollision und
    Substanz kommen aus `SPECIES_GRAMMAR` mit 13 Arten (:103506–103958), `VARIANTS_PER_SPECIES` 3 und FNV-Wahl (:103303,
    :59456). Der gesehene Stamm ist nicht der stoßende.
  - Es gibt zwei Ableitungen Dials → P: `treeParams` für den Richter (phyto-core.js:1812) und `deriveParamsPlant` für das Bild
    (foundry-core.js:4528, Baum-Zweig :4571–4622). Sie weichen viermal voneinander ab, z. B. Quirl-Abstand 0,12·H statt
    0,106–0,115·H und Nadel-Stride 0,0265 gegen 0,36.
- **Ziel:** EIN Kern liefert Gestalt UND Substanz (Beipack `__substanz` wie heute `__huelle`), und es gibt EINE Ableitung
  Dials → P (Karten 8, 9). Den Stamm hält die Modul-Karte mit `gate:grenzen` (modul-karte.md §4).

### 2.6 Speicherung

- **Heute:**
  - Das Gelände ist Funktion. Das Welt-Save trägt das ganze Gelände in 2 917 B `worldMeta`: Saat 18 B, Makro 722 B,
    variantSeed 1 589 B. Gemessen an `anazhRealmState.json` (171 902 B kompakt, 3 Bauten = 1 083 B).
  - Die Foundry-Platte cacht Geometrie unter dem Gesetz-Schlüssel. Das ist richtig geformt.
  - Der Snapshot hat 44 Schlüssel (:42557–42860).
- **Gesetz-Anteil:**
  - Snapshot: 7/44 = 16 % gesetz-adressierte Welt-Parameter oder Deltas, 28/44 = 64 % legitimer Spieler-Zustand.
  - 9/44 = 20 % sind Geräte- und Diagnose-Regler am falschen Ort (perfTargetMs, lodRef, chunkRingRadius … :42649–42656).
  - Im Architektur-Eintrag sind 6 von 15 Feldern gespeicherte Ableitungen: tint aus dem Seed (:72688), chimney (:72775),
    fundament, tuer.
- **Lücke:**
  - **Weltgen-Natur wird Speicher.** Jeder besuchte Chunk pflanzt Einträge (:81836–81870), und kein Chunk-Abbau räumt sie.
    „Bevölkert" folgt allein aus der Anwesenheit eines Eintrags (:27429–27441). Ein geändertes Wald-Gesetz erreicht erkundeten
    Wald darum nie, und ein kahl geschlagener Chunk wächst nach dem Reload neu.
  - **Die Mess-Wiese ist über Mitträger nicht mehr teilbar [gerechnet].** Sie hat 1 563 Einträge (:78457) × ≈ 275 B
    ≈ 0,43 MB je Save; die Pin-Wand verwirft alles über 256 KiB (:43948).
  - **Edits:** Der FIFO-Deckel liegt bei 256, der älteste fällt still (:42030–42032). Der Worker deckelt nie
    (voxel-worker.js:255–258), deshalb sehen Kollision und Mesh ab Edit 257 zwei Böden. Jede Dichte-Probe summiert alle Edits
    (:28421), und jeder Edit leert den ganzen Mesh-Cache (:24903–24910).
  - **Takt:** `saveState` serialisiert synchron im Haupt-Thread, mit drei localStorage-Operationen und einem IDB-Put
    (:42962–43000); der Autosave läuft alle 10 s.
  - **Server:** `fs.writeFile` direkt, ohne tmp/rename und ohne .bak (save-server.js:909).
- **Ziel:**
  - Welt = Funktion + Abweichungs-Liste. Gespeichert wird nur, was der Spieler setzt, fällt oder prägt. Weltgen-Natur trägt
    eine deterministische Id aus Chunk und Probe; die Saat dafür steht schon (`seedForSpawn` :81864) (Karte 10).
  - Edits je Chunk ohne Deckel (Karte 6).
  - Speichern im Worker (Karte 7).

### 2.7 Birke und Tanne: eine Basis, und jedes weitere ist eine kleine Abweichung?

- **Heute, im Bau: ja.** In jedem Kern steht Kern-Gesetz ⊕ Art-Preset ⊕ Saat ⊕ ov:
  - `buildInstance` zieht mulberry32(seed) und legt ov nach der Ableitung über P (foundry-core.js:4864–4890).
  - Haus = Defaults ⊕ s ⊕ fx ⊕ ov (fachwerk-core.js:3249–3262).
  - Wagen = DEFAULT_P ⊕ BASE_P ⊕ s ⊕ fx ⊕ ov (vehicle-core.js:3376).
  - Birke, Tanne und Eiche sind je ein Punkt aus 5 Dials api · delta · slim · trop · leaf (foundry-core.js:4087–4205).
- **Heute, in der Welt: nein.**
  - Die Saat wird per Knuth-Mix zum Gestalt-Index 1..V (:78515–78520).
  - V ist 2 für Eiche, Fichte, Birke, Tanne und Buche und 1 für Weide und Mammut (foundry-core.js:446–466). Das sind
    12 Gestalten für alle lebenden Bäume der Welt.
  - Jedes Exemplar trägt darüber nur Skala 0,5–1,95, Drehung und Tönung ±8 % Luminanz (:79674, :58630–58631).
- **Gesetz-Anteil:**
  - Die Saat-Abweichung der Pflanze ist pauschal und ortsblind: Höhe ±16 %, Dials ±0,1, ein HSL-Wurf
    (foundry-core.js:4536–4614). Dichte, Feuchte und Klima wählen nur Art und Größe (phyto-core.js:1963–1988), nie die Form.
  - 65 von 71 tree-fx-Feldern der 6 Kern-Bäume haben im gezeichneten Bau keinen Leser; gelesen wird nur `conifer`
    (foundry-core.js:4578, 4583).
  - Das Haus-ov trägt den vollen P-Vektor: Ø 34 Schlüssel / 492 B, davon nur 14 ≠ Kultur-Preset (fachwerk-core.js:4921; Node,
    DORF Saat 1, 21 Häuser).
- **Lücke:**
  - Die Saat-Ströme ziehen positional in fester Reihenfolge, „inkl. der 3 verworfenen Farb-Jitter-Ziehungen"
    (phyto-core.js:1738, 1829–1831). Darum ist jede neue Achse ein Re-Mint (docs/studio-vertrag.md:155–156), und eine
    Eichen-Kette läuft durch mindestens 8 Saat-Mischer.
  - Eine Prägung ist ein ganzer neuer Körper unter eigenem Hash (:75794–75817), kein Delta.
  - 4 Aliase haben keinen eigenen Körper: Kiefer→Fichte, Erle→Weide, Zypresse→Tanne, Palme→Weide (:76112–76123).
- **Ziel:**
  - Benannte Achsen `achse(seed, ns, name)` im Kern: eine neue Achse lässt jeden bestehenden Bau byte-gleich (Karte 11).
    Danach ist jede Birke eine Parameter-Zeile je Exemplar, und die Welt zeichnet so viele Gestalten, wie das E-Band trägt
    (Gestalt × Größenklasse, Karte 12).
  - ov speichert nur die Abweichung vom Preset (Karte 4).

### 2.8 Hunderte Spieler, Assets, Bauten, riesige Maschinen — robuster als Minecraft?

- **Heute:**
  - Das Netz ist ein Voll-Mesh: je Mitspieler eine RTCPeerConnection (:5979–5998) und EIN Kanal, reliable und ordered, für
    alles (:5989). Der Broker ist ein RAM-Relay ohne Persistenz (signaling-server.js:12–13).
  - Gemessen ist N = 2: alle vier Mehrspieler-Proben öffnen zwei Seiten.
  - Spielverkehr läuft nur, wenn das Mesh komplett ist (`_p2pMeshReady` :5963–5971); Inputs gehen nur dann (:8345–8349), und
    der Relay kennt `input` nicht. Ein totes Paar schaltet deshalb den Lockstep für alle ab.
  - Welt-Taten reisen als DSL ohne Uhr und ohne Folge-Nummer und laufen in Ankunfts-Ordnung (:7422–7433).
  - Die Tiere simuliert jede Seite selbst (:16868, :7070–7082), und Schaden ist privat (:1302).
- **Gesetz-Anteil (was trägt):**
  - Der Leib des Mitspielers fährt durch DENSELBEN Schritt `_stepCharacter`, per Ghost-Swap (:8392–8511): Lockstep aus
    Eingaben, nicht aus Zuständen.
  - Ein Asset reist als (Art, Saat, ov): ein Bau ≈ 361 B, ein Baum als (Art, Saat) (:42728–42749, :42764–42806). Das Gelände
    reist mit 0 Chunk-Bytes.
  - Voxel-Edits sind additive Kugeln und damit kommutativ (:28421–28446).
- **Draht [gerechnet]:**
  - Je Sender und Empfänger 21,4 kB/s: pos 3 455 + input 2 261 + creature-pos 15 678 B/s.
  - Upload je Client = 21,4 kB/s × (N−1): bei N = 10 sind das 192 kB/s, bei N = 100 2,1 MB/s ≈ 17 Mbit/s über 4 950
    Mesh-Kanten.
- **Lücke:**
  - Kein Interest-Management: pos geht an alle, creature-pos trägt die ersten 40 Leiber, egal wo der Empfänger steht
    (:5946–5955, :7031–7052).
  - Die Welt hat keinen Herrn.
  - Die Gast-Rechte sind deklariert, aber nie gelesen (:13177–13179).
  - Die peerId wählt der Client selbst, und Duplikate werden angenommen (signaling-server.js:202, 216–222).
  - Die Edit-Liste divergiert ab Edit 257 nach der Ankunfts-Ordnung (:42031).
  - Der Join schickt den vollen Snapshot (:7586–7587). Das Inventar reist mit (:42855–42859 → :47022–47031), gegen das
    Ledger-Gesetz (docs/taille-spec.md:143–146).
  - Eine Maschine ist EIN starrer Eintrag ohne Gelenke, und der Geist eines Mitspielers reitet nie (:8455, :8462).
- **Minecraft zum Vergleich** (nur das Prinzip; Textquellen <https://minecraft.wiki/w/Tick>,
  <https://minecraft.wiki/w/Region_file_format>, <https://papermc.io/software/folia>):
  - Ein autoritativer Server mit EINEM Haupt-Takt von 20 Hz; dieser Takt ist sein Engpass.
  - Jedes erzeugte Chunk wird ganz in Region-Dateien gespeichert.
  - Große Netze verteilen ihre Spieler über einen Proxy auf viele Server-Instanzen; Folia taktet Regionen derselben Welt
    unabhängig.
  - Bei Sichtweite 10 sendet der Server je Spieler bis zu (2·10+1)² = 441 Chunk-Säulen.
- **Ziel (nach v1, braucht einen Schöpfer-Eintrag):** Minecrafts Autorität und Region-Takt, aber mit AnazhRealms Draht — die
  Welt ist Funktion, über den Draht reisen nur Eingaben und Abweichungen.
  - Ein Region-Herr (ein Peer oder ein Leuchtturm-Knoten) hält das Op-Log seiner Chunks mit Folge-Nummer.
  - Interest folgt dem Sicht-Radius.
  - Die Kanäle sind nach Zuverlässigkeit getrennt: pos unzuverlässig, Taten zuverlässig.
  - Edits und Weltgen-Abweichungen sind kommutative Mengen je Chunk (Karte 14; setzt Karte 6 und 10 voraus).
  - „Robuster als Minecraft" heißt gemessen: N = 100 simulierte Seiten, Upload je Client, Divergenz nach 10 000 Taten = 0,
    Region-Wechsel ohne Neuaufbau.

### 2.9 Siehst du all das?

- **Steht im Code, mit Linse:**
  - das Gelände als Funktion
  - die Erstellung gesetz-adressiert, mit SHA-Platte
  - EIN Impuls-Gesetz, EIN Leib-Löser, EIN Tod-Übergang
  - die Simulation im festen Schritt und der Input-Lockstep des Leibs
  - die Taille: signierte Substanz, souveräner Empfänger, Perpetuum-Verbot
- **Geplant:** Karten 1–15 in §3.
- **0 Zeilen bis heute:** Kugel-Planet, Gelenk-Dynamik, Tragwerk, Bruch, Stoff-Simulation, Klang-Laufzeit, Region-Autorität.
  Keine davon steht in einem Pflicht-Eintrag; ohne Eintrag des Schöpfers wird keine gebaut.

---

## 3 · Der Plan — 15 Karten-Kandidaten, geordnet nach Wirkung je Token

Lesart der Spalte **v1**:
- „v1 · B/C/E": dient einem Pflicht-Eintrag und darf laufen.
- „Eintrag": braucht zuerst einen Pflicht-Eintrag des Schöpfers (BETRIEBSGESETZ 2), auch wenn die Karte den v1-Pfad
  (roadmap §0.v1) berührt.
- „nach v1": Feature-Stopp bis v1.

Jede Linse zeigt vorher ROT am Täter. Bestehende Karten werden genannt, nicht verdoppelt.

| # | Karte | v1 | Chokepoint | Linse · Messname (vorher → Ziel) | Kosten | hängt an |
|---|---|---|---|---|---|---|
| 1 | Wasser-Fahrt: erst messen | v1 · B | Wasser-Term in `fahrKraefte` (vehicle-core.js:2855, :2948–2966) | gate:werk-im-wasser F am `a0a05614`: 11,9 → ≤ 0,5 m/s | 1 Lauf ≈ 10 min; Schnitt nur bei ROT | — (K02 in V18.540) |
| 2 | Geräte-Regler verlassen die Welt | v1 · E | Snapshot :42649–42656, Lade-Block :46683–46704; die Regler ziehen in ein Geräte-Profil | gate:weltgrenze „weltpull": Ring des Gasts nach dem Join = sein eigener (heute der des Hosts) | ≈ 2 h | — |
| 3 | EIN Gang-Gesetz für Mensch und Tier | v1 · B | `_gaitSchrittLen` (:17542) ruft `gangSchritt` (tetrapoda-core.js:1327); `schritt.kalib` (koerper-core.js:560) und der Rückfall 3.4 fallen | gate:tier-gang auf den Spieler-Leib: Kadenz 0,34 → ≥ 1,5 Schritte/s, Gleiten < 5 % | ≈ 1 Tag + voller Playtest; Byte-Beweis koerper-core | K07 (Basis V18.542) |
| 4 | Der Dorf-Plan trägt Baum und Abweichung | v1 · C | Hof-Baum-Block `_spawnSettlementErlebnis` (:74930–74960, Literal `baumArten` :74935, `/ 6.2` :74953) und `exportSettlement` (fachwerk-core.js:4921) | gate:settlement: Plan-Hash Studio = Welt einschließlich plan.trees; Absenz `/ 6.2`; ov 34 → 14 Schlüssel (Ø 492 → ≈ 200 B), Bau-Hash je Slot gleich | ≈ 1 Tag | K10 (Plan v2) |
| 5 | EINE Schwerkraft | Eintrag (v1-Pfad Schritt 4: die DSL-Schwerkraft) | EIN Leser `_schwere()` über `state.gravity` mit `Number.isFinite`; Tier-Gang, Tier-Hüpfer und Fahr-Satz bekommen g als Argument (tetrapoda-core.js:1313, :102899, vehicle-core.js:2646) | Absenz `gravity \|\|` 3 → 0; DSL-Probe „gravity −1,62" in gate:fahr-leben: Hüpfer-Flugzeit × 2,46, Hangabtrieb des Wagens × 0,165, Spieler-Fall bei g = 0 → 0 m | ≈ 0,5 Tag; Kerne additiv | — |
| 6 | Edit- und Speicher-Wahrheit | Eintrag (v1-Pfad Schritte 3 und 5) | `_addVoxelEdit` (:42011), `_voxelEditDeltaAt` (:28421), `applyStateDelta` (voxel-worker.js:250): Edits als Map je Chunk ohne Deckel, Generation je Chunk; dazu save-server tmp + rename + .bak (save-server.js:909) und Chat-Graben über dslRun (:26424–26432) | gate:worker-dichte „300 Edits, SHA Main = Worker" (heute ROT ab 257); gate:persistence „Löcher nach Reload" 256/300 [gerechnet] → 300/300; gate:mp-sync: der Peer sieht das Chat-Graben | ≈ 1 Tag | — |
| 7 | Speichern verlässt den Haupt-Thread | v1 · E, wenn `werkbank takt` den Speicher im p95 nennt | `saveState` (:42962) und `_chunkIdbPut` (:24663) wandern in einen Worker nach dem Schalen-Muster (:74314); Chunk-Stempel SHA statt VERSION (:24587–24603) | werkbank takt, Subsystem Speicher: p95 ms bei Autosave und Graben-Burst, vorher ↔ nachher; E-Kriterium CPU-Takt p95 ≤ 5,8 ms | ≈ 1 Tag | 6 |
| 8 | EINE Ableitung Dials → P | Eintrag (Gebot 4) | `treeParams` (phyto-core.js:1812) wird die Quelle; der Baum-Zweig von `deriveParamsPlant` (foundry-core.js:4571–4622) delegiert dorthin, wie `phenotype` es schon tut (foundry-core.js:4519–4526) | diag:foundry-parity „P-Zwilling": 9 Arten × Gestalt × Stufe, Schlüssel für Schlüssel; vorher ROT an whorlSpacing und am Nadel-Stride | ≈ 1 Tag + Re-Mint der Pflanzen-Goldens + OMEN-ABAB | — |
| 9 | Substanz aus dem Gesetzbuch | Eintrag; v1 über B, falls gate:kollision-bild an Bäumen ROT zeigt | Beipack `__substanz` je Kern (Masse = Volumen × Dichte, Tags aus den Stoffen, Hülle aus Stufe 0) an `_foundryAutoRegisterSpecies` (:74170) und `_populateBlockerAABBs` (:35493). Es fallen KIND_SUBSTANCE (:101906), der Donor-Klon (:74212), SPECIES_GRAMMAR (:103506–103958), VARIANTS_PER_SPECIES (:103303) und die Fels-Hüllen-Literale (foundry-core.js:4226–4424) | gate:kollision-bild auf Bäume: Stamm-Hülle ↔ gezeichneter Stamm je Gestalt in cm; Absenz der 5 Namen; Donor-Substanz 74/102 → 0 | ≈ 1 Woche + Re-Mint | 8 |
| 10 | Welt = Funktion + Abweichungs-Liste | Eintrag (v1-Pfad Schritt 5: Pin-Wand) | Snapshot (:42764), `_loadStateRestoreArchitectures` (:46930), `_worldgenBuildVoxelChunkCache` (:27429). Die Weltgen-Id ist hash(Chunk, Probe) aus der vorhandenen Saat (:81864). Gespeichert werden Setz-Einträge plus je Chunk die Menge entfernter Weltgen-Ids; tint und chimney fallen aus dem Eintrag | gate:persistence: Snapshot-Bytes nach dem Mess-Wiese-Lauf (heute ≈ 0,43 MB [gerechnet], Pin-Wand 256 KiB gerissen); „Kahlschlag-Reload: 0 Bäume im gerodeten Chunk"; Gesetz-Wechsel-Probe: ein geänderter `planForestCell` erreicht einen erkundeten Chunk (heute ROT) | 2–3 Tage inkl. P2P-Abbau-Sync | 6 |
| 11 | Benannte Saat-Achsen | Eintrag | `achse(seed, ns, name)` in phyto-core, gelesen von jedem Kern-Faden; `_rollGenome` (:61258) zieht dorthin. Die ≥ 8 Mischer der Baum-Kette und die ≥ 9 HAUS-Inline-Hashes (fachwerk-core.js:165–1390) lesen nur noch sie | gate:asset-contract, Achsen-Selbsttest: eine neue Achse lässt jeden bestehenden Bau byte-gleich; ein positionaler Strom wird ROT | ≈ 2 Tage + Re-Mint je Kern (Pflanze, Haus) | 8 |
| 12 | Die Größe ist eine Achse des Gesetzes | Eintrag (dehnt K20 aufs Exemplar und aufs Tier) | `_foundryVariantFor` (:78515) wählt (Gestalt, Größenklasse); `growSkeleton` wächst auf Welthöhe in m; `placement.scale` und `treeScaleMul` (foundry-core.js:493–509) werden Art-Höhen in m; beim Tier speist `bodySize` den size-Dial (tetrapoda-core.js:291) statt `setScalar` (:16880) | H/D je Welt-Baum (Eiche 12,5 → 40–100); Widerrist je Tier im Soll-Band (tetrapoda-core.js:1634); werkbank zaehlen/puffer gegen E (≤ 118 MB, ≤ 680k Dreiecke) | ≈ 3 Tage + Re-Mint; VRAM je Klasse vorher messen | 11, K20 |
| 13 | Regler = Größe mit Einheit | Eintrag (Nordstern M2) | `PARAMS_BY_KIND` je Kern (foundry-core.js:4849 u. a.) und der Werkstatt-Generator; die 11 Baum- und Fels-Slider (worlds/terrain/index.html:57) ziehen in den Kern | Einheits-Zensus 0/124 → 124/124; Ratsche reglerTot 18 → 0 (verdrahtet oder final gestrichen) | 1–2 Tage; Kerne additiv | — |
| 14 | Netz für Hunderte | nach v1 · Eintrag | `_p2pMeshReady` (:5963) und der Sende-Pfad (:5946–5955, :8345): Region-Herr mit Op-Log je Chunk und Folge-Nummer, Interest nach Sicht, Kanäle nach Zuverlässigkeit getrennt, Tiere je Region einem Herrn; der Broker stempelt die peerId nach Schlüssel (signaling-server.js:202) | Last-Probe mit N = 10/100 simulierten Seiten: Upload je Client (heute 2,1 MB/s bei N = 100 [gerechnet]); Divergenz nach 10 000 Taten = 0; ein totes Paar bricht den Lockstep nicht | 2–3 Wochen | 6, 10 |
| 15 | EIN Gelenk-Löser | nach v1 · Eintrag | XPBD über die Knochen des EINEN Leibs als Verb im koerper- und tetrapoda-Kern. Der erste Leser ist `_kreaturFaellt` (:20051): der Tod wird Ragdoll statt Kippskript. Danach laufen Maschinen-Gelenke (Studio-Teile mit Verbindung) sowie Tragwerk und Bruch auf demselben Löser | Tod-Probe: der Leib liegt hangab in Impuls-Richtung (heute 1-s-Skript); Kosten je Leib in werkbank takt | 1–2 Wochen; Maschinen und Tragwerk je eigene Karte | — |

**Nicht unter den 15, benannt:** Jeder dieser Punkte braucht einen Schöpfer-Eintrag; sie stehen hinter 1–15, weil ihre Wirkung
je Token kleiner ist oder E sie deckelt.
- Antrieb aus Leistung: S1, „ja, nach E" (nordstern.md:491).
- EIN Auftrieb nach Archimedes für jeden Leib: Spieler und Tier, heute Feder und Beinhöhe (:96099–96115, :22009).
- Fluss nach Manning und Wind in m/s als Kraft (nordstern.md:214).
- Pfeil Labor = Welt: Luftwiderstand, heute nur im Labor (worlds/schmiede/schmiede.js:1457 gegen :84136–84139).
- Punktlicht in physikalischen Einheiten (:101676–101683).
- Kugel-Planet.

---

## 4 · Was selbst die Besten übersehen — und wo AnazhRealm es trägt

Von Spielen und Film steht hier nur das Prinzip, mit Textquelle, wo `nordstern.md` eine trägt (die Bild-Regel aus
`nordstern.md:8`); die Dune-Zeile hat keine. Die Spalte „wo es Kulisse bleibt" ist Urteil, nicht Messung. Aussagen über
AnazhRealm tragen Anker.

| Vorbild (Prinzip, Quelle) | wo es Kulisse bleibt | AnazhRealm (Anker) | Stand |
|---|---|---|---|
| **RDR2:** ≈ 200 Arten in einem Ökosystem, das ohne Spieler läuft (nordstern.md:340) | Arten und Bäume sind gebaute Assets aus einem Varianten-Pool. Das Gesetz bleibt im Werkzeug; ändert man es, wird neu gebacken | Ein Asset ist (Art, Saat, ov), die Platte liegt unter dem SHA aller Kerne (:74362) und leert sich bei Drift (:74381): ein geänderter Kern zeichnet jeden Baum neu | **trägt** für die Gestalt; **bricht** am gespeicherten Wald (:27428–27446) → Karte 10 |
| **GTA V:** Licht und Nacht als eigene Render-Arbeit (Courrèges, GTA V Graphics Study; nordstern.md:261) | die Stadt ist von Hand gesetzt und von Hand ausgeleuchtet | Licht aus Gesetz mit Quelle: Rayleigh (:105880–105883), Koschmieder (:93334–93350), Belichtung aus dem Licht, Leuchtquellen-Gesetz im Kern (fachwerk-core.js:3560–3577) | **trägt** die Luft; Punktlicht ohne 1/d² (:101676–101683) |
| **Dune (Villeneuve):** Größe aus Luft und einem Licht | ein Film hat eine Kamerafahrt; was außerhalb des Bildes liegt, muss nicht stimmen — dort ist Kulisse richtig | ein Spiel hat eine freie Kamera, und nur ein Gesetz stimmt aus jedem Blick. Luftperspektive als EINE Koschmieder-Luft (:105832–105841) | **trägt** die Luft; Belichtung < 1 EV Anpassung, Mond 2,7° ohne Phase (nordstern.md:31, 217) |
| **Minecraft:** Gelände als Dichte-Funktion (nordstern.md:198), autoritativer Server, Region-Takt (Folia) | speichert jedes erzeugte Chunk ganz; der Speicher wächst mit der erkundeten Fläche, der Takt mit den geladenen Entitäten | Gelände 2 917 B, 0 Chunk-Bytes; der Draht trägt Gesetz-Adressen (≈ 361 B je Bau) | **trägt** das Gelände; die Natur ist ein Sack (Karte 10); Autorität fehlt (Karte 14) |
| **SpeedTree / Horizon Zero Dawn:** Wind-Hierarchie, Platzierung als deterministische Dichte-Regel (nordstern.md:384–385) | Varianz = wenige gebackene Varianten je Art | heute dasselbe Muster: 12 Gestalten für alle lebenden Bäume (foundry-core.js:446–466), Platzierung deterministisch (phyto-core.js:2155–2240) | **gleichauf**; der Schritt darüber sind Karte 11 und 12 |
| **Euphoria (NaturalMotion):** Treffer und Sturz aus Körper-Simulation (nordstern.md:431) | — sie haben es | Tod als 1-s-Kippskript (:20051–20110), 0 Zeilen Gelenk-Dynamik | **fehlt** → Karte 15 |
| **Motion Matching (Ubisoft):** die Pose aus einer Kostenfunktion über die nächste Sekunde (nordstern.md:292) | die Bewegung ist eine Aufnahme, kein Gesetz | Gang nach Froude im Kern (tetrapoda-core.js:1312–1335), aber der Mensch geht mit 0,34 Schritten/s | Gesetz steht, Güte **fehlt** → Karte 3 |

**Was sie alle übersehen — sechs Punkte, keiner davon ist ein Pixel:**

1. **Die Zahl hat keine Herkunft.** Engines stimmen nach Gefühl. Ein Regler ohne Einheit kann weder eine zweite Welt noch ein
   Spieler noch die KI verstehen. AnazhRealm trägt den Rahmen: law-Text an 87/113 Regler-Zeilen, `gate:regler-wirkt`. Die
   Einheit fehlt aber überall (0/124); Karte 13 macht daraus die Sprache, die der Satz → Rezept-Pfad (v1-Schritt 4) spricht.
2. **Das Werkzeug ist nicht das Spiel.** Bei den Besten ist der Editor eine zweite Welt. Hier rechnen Studio und Welt EINEN
   Kern: der Fahr-Schritt ist Studio = Welt auf 1e-15 m (nordstern.md:126). Das gilt noch nicht für alles: der Pfeil fliegt im
   Labor gebremst, in der Welt ungebremst (worlds/schmiede/schmiede.js:1457 gegen :84136–84139).
3. **Der Spieler kann das Gesetz nicht ändern.** In den Vorbildern ist g eine Engine-Konstante. Hier ist es ein DSL-Wort
   (:2029), und die Welt muss folgen. Heute folgen 6 Leser, Tier und Wagen nicht → Karte 5.
4. **Dinge reisen nicht zwischen Welten.** Die Taille trägt signierte Substanz; der Empfänger rechnet jede Bedeutung selbst,
   und kein Kreis ist netto-positiv (docs/taille-spec.md:12–18; `_admitForeignArtifact` :47805, `computeBuildCost` :82398).
   Das hat kein Vorbild. **Trägt.**
5. **Die Welt wertet nicht.** Eine Ehre- oder Fahndungs-Stufe ist ein Zähler. Hier liest, schreibt und wertet das lebendige
   Feld (`auraAt` :72961, `_depositLife` :73096) als dritter Mitspieler. Welche Wertung die Welt beobachtbar ändert, misst
   dieses Blatt nicht; das bleibt eine offene Konsum-Frage.
6. **Gespeichert wird der Bestand, nicht die Abweichung.** Minecraft speichert jedes erzeugte Chunk. Die Bausteine für „nur
   die Abweichung" liegen hier schon: die Saat je Probe (:81864), die kommutativen Edits (:28421) und das Gelände als Funktion.
   Es fehlt der Schnitt → Karte 10, danach Karte 14.

**Was wir von ihnen noch nicht haben:**
- eine Treffer-Reaktion aus Körper-Simulation (0 Zeilen)
- Menschen als Bewohner: 0 Menschen-NPC (nordstern.md:309)
- einen Gang auf Weltniveau: 0,34 Schritte/s gegen 1,8 (nordstern.md:299)
- einen autoritativen Server mit Region-Takt
- erzählende Kamera und Licht-Regie

Die ersten drei Punkte decken Karten 3 und 15; der Server ist Karte 14. Die erzählende Kamera hat keine Karte und braucht einen
Schöpfer-Eintrag.

---

Geschnitten: nichts (nur gelesen) · Gemessen: Gesetz-Form 17/30 Pfade, Herkunft 25/203 Zahlen, Einheit 0/124 Regler,
Erstellung 102/102, Substanz-Klon 74/102, 12 Baum-Gestalten, Gelände 2 917 B, Upload 2,1 MB/s je Client bei N = 100
[gerechnet] · Pflicht-OFFEN Rest: A, B, C, E (docs/PFLICHT-OFFEN.md) · Status: ZWISCHENSTAND
