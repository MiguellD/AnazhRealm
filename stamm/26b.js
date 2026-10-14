// ===== ATLAS §26b · AUSSEN-KONSTANTEN — ab AnazhRealm.FOUNDRY_CACHE_CAP =====
// Foundry-Cache-LRU-Deckel: max distinkte Körper (`_foundryKoerperKey`: Art|Gestalt|LOD[|ov]) im Speicher. Ein BOOT
// räumt nie (V18.527): bei 256 räumte die LRU im Boot 162 Einträge (headless, 16 Gestalten je Art) — die Räumung löschte
// `requested`, die Neu-Anfrage traf die eben geschriebene Platte. Mit den Budget-Gestalten hält ein Boot ~230 Körper;
// 512 lässt das Doppelte Luft. Den Speicher deckelt FOUNDRY_CACHE_BYTES (das Gewicht), dieser Deckel die Zahl.
AnazhRealm.FOUNDRY_CACHE_CAP = 512;
// Eintrags-Deckel des Chunk-Mesh-Stores "anazhChunkMesh" (grobes Überlauf-Ventil in `_chunkIdbPut`,
// kein LRU): LOD-0-Chunk ≈ 0.2–0.6 MB → ~600 Einträge halten den Store unter wenigen hundert MB.
AnazhRealm.CHUNK_IDB_MAX = 600;
// Die leere Edit-Liste eines Chunks ohne Edits (`_voxelEditsNah`, `_voxelEditsImKasten`): eingefroren, nie beschrieben.
AnazhRealm.KEINE_EDITS = Object.freeze([]);
// Die FORM des rohen Worker-Replys im Store (ein Teil des Stempels, `_chunkIdbInit`): ändert sich, was der Worker liefert,
// liest kein Boot die alte Form — seit Welle 7 trägt er den Höhlen-Graph (`hTri` · `hKnoten` · `hSeiten` · `hKanten`); seit
// Welle L liegt das Fluss-Bett auf dem Spiegel (`_hydrosphereCarveAt`): ein alter Chunk trüge den alten Kanal; und die
// Ufer-Farbe läuft mit der Kronen-Blende aus (`_waterLevelAt` → `ufer`): ein alter Chunk trüge das Rauten-Schachbrett; seit
// der Gegenprüfung läuft die Bank mit ihrer Neigung ins Gelände (Kanal und Damm): ein alter Chunk trüge die Gleit-Wand; seit
// Runde 3 trägt die Deck-Zelle das flache Wasser und das Ufer liest den Boden der Spalte: alte Zellen zeichneten den Bach nicht;
// und jede Quelle beginnt als Rinnsal: ein alter Chunk trüge den Kanal, der aus dem Nichts bricht; seit Runde 4 trägt der
// Damm eine Krone (`dammBreite`): ein alter Chunk trüge die Schneide, über die das Wasser ins tiefere Gelände lief; seit K17-2
// trägt die Antwort den Stoff (Himmels-Sicht, Schutt, die Feuchte des Mooses, der Fels in `colors`): ein alter Chunk trüge die
// Säulen-Farbe ohne Stoff; seit K17-2 NB1 wellt EIN Gradienten-Rauschen die Bänke und das Geröll streut wie die Referenz:
// ein alter Chunk trüge die Welle aus dem Wert-Rauschen.
AnazhRealm.CHUNK_IDB_FORM = "fels-rausch-atlas";
// Der Saum des gezeichneten Wassers (`_wasserBildAt`): die Vertices eines Wasser-Sheets sind bis 0,3 · 1,8 m = 0,54 m versetzt
// (der Gitter-Jitter in `_computeWaterSheetData`) — ein Punkt bis so nah an der Chunk-Kante kann im Sheet des Nachbarn liegen.
AnazhRealm.WASSER_BILD_RAND = 0.6;
// DIE HÖHLEN-SICHT (Welle 7, `_hoehlenSicht`): der Saum jeder Mündungs-, Portal-, Rand- und Luft-Box — `schritte` Gitter-
// Schritte (die Fläche zwischen zwei Luft-Punkten liegt bis 1,5 Schritte neben ihnen: Surface-Nets-Vertex in der Zelle,
// Glättung λ 0,5) plus `m` Meter (der Geomorph zieht Rand-Vertices auf den gröberen Nachbarn, wie der Hüllen-Saum `randM`).
AnazhRealm.HOEHLEN_SAUM = Object.freeze({ schritte: 1.5, m: 2 });
// DAS LICHT DES AUGES (`_dayNightApplyAugenLicht`): jede dem Auge zugewandte Fläche zeigt in seinem Schein dieselbe
// Helligkeit wie am Tag — die 18-%-Karte in `karteM` das Mittelgrau + 1 EV (die Stärke folgt der Belichtung: das Auge
// adaptiert an sein Licht). Es ist ein Platz des Licht-Pools mit Himmels-Ersatz (K11) und fällt nach dem EINEN Punktlicht-
// Gesetz (fachwerk `lichtAbfall`, K11b): mit `abfall` 1 und dem weiten Kern `kernM` 8 (ein Schein, keine Flamme) zeigt die
// Wand in 0,3 m 1,03× die Karte in 2 m (ihre Maserung), in 10 m 57 %, in 15 m 23 % (bis K11b, Legacy-Abfall (1 − d/R):
// 1,09× · 56 % · 28 %), und an `reichweiteM` fällt es stetig auf 0. Werkbank 11.10., echte GPU, Auge 11: mit 1/d ohne
// Kern lag die Wand in 0,2–0,6 m weiß ohne Maserung (Helligkeit 210), mit 1/d² alles hinter 3 m schwarz. `kelvin` 4 750 —
// warmweiß, derselbe Farbort wie bis K11b das Hex 0xffe2c6 (eine Flamme, 0xffc489, tönte den Fels orange); der Himmel am Auge
// (`_himmelAmAuge`) liest die Himmels-Sicht im Umkreis `umkreisM`, neu nach `neuM` Metern Weg.
AnazhRealm.AUGEN_LICHT = Object.freeze({
    karteM: 2,
    abfall: 1,
    kernM: 8,
    reichweiteM: 20,
    kelvin: 4750,
    umkreisM: 4,
    neuM: 0.25,
});
// DER LICHT-POOL (K11, `_leuchtTakt`, `_leuchtStoff`): `plaetze` Punktlicht-Plätze ab dem Boot (eine feste Zahl geteilter
// Uniforms — ein Wechsel der Quellen baut kein Programm) an den Leuchtquellen im `umkreisM` um das Auge, deren Reichweite ihm
// am nächsten kommt (das Licht des Auges, ein Feuer 9 m, eine Laterne 12 m, ein Tor 14 m), neu gewählt je `wahlS` Sekunden
// oder nach `wahlM` Metern Weg; ein Platz blendet in `blendeS` Sekunden aus und ein (kein Licht springt). Die Laternen der
// Pläne liegen in Zellen von `zelleM` Metern (die Wahl liest nur die Zellen um das Auge).
AnazhRealm.LICHT_POOL = Object.freeze({ plaetze: 4, umkreisM: 48, wahlS: 0.25, wahlM: 1, blendeS: 0.5, zelleM: 32 });
// DER HORIZONT der Höhlen-Sicht (`_hoehlenHorizont`): die Raster-Zelle der unteren Boden-Schranke je Chunk (m) — der Schritt
// des LOD-0-Gitters; die Horizont-Probe einer Mündung tastet ihre Bögen in halben Zellen ab.
AnazhRealm.HOEHLEN_HORIZONT_M = 1.8;
// Frische Horizont-Proben je Hauptbild (`_hoehlenSicht`, die nächsten Mündungen zuerst): die Kosten folgen dem bewegten Auge,
// nie der Zahl der Mündungen — eine Mündung ohne frische Probe zeichnet.
AnazhRealm.HOEHLEN_HORIZONT_PROBEN = 8;
// Der Würfel um das geprüfte Auge, in dem eine Horizont-Probe gilt (m, `_hoehlenSperre`): weit unter der Raster-Zelle
// (die 3 × 3 Zellen der Probe tragen die waagerechte Verschiebung), weit über dem Atmen der stehenden Kamera.
AnazhRealm.HOEHLEN_AUGE_M = 0.25;
// DIE KASKADE der Höhlen-Sicht (`_hoehlenSichtLicht`): die Kante einer ortsfesten Licht-Kachel quer zum Licht (m), die je
// Kachel die tiefste Empfänger-Tiefe trägt.
AnazhRealm.HOEHLEN_LICHT_KACHEL_M = 4;
// DER SATZ (Welle B, `_chunkSatz`) — die Start-Kapazität je Satz-Art (Vertices · Indizes): die Vertices gemessen am
// vollen Ring 4 am Spawn (81 Chunks + 16 Stitch-Bänder = 179 046 Vertices) plus Luft für Fragmentierung und Gebirge,
// damit eine typische Sitzung nie wächst; die Indizes tragen die Abschnitte der Pässe (Hauptbild · k0 · k1, gemessen
// 05.10. an der Mess-Wiese mittags 333 774 + 439 746 + 272 535 = 1 046 055 bei 737 088 im ganzen Ring, mit Luft 1 259 520)
// — 1,25 · 2^20 statt 2^20 (+1 MB). Wo die Pässe mehr tragen (die Gate-Welt mittags ~1,57 M, nach dem Wandern ~1,6 M, am
// Abend mit der Sonne im Rücken bis ~2,2 M), wächst der Index auf ihre Summe — kein Abschnitt verdrängt einen anderen.
// Ein Wachsen (Vertices ×1,5, Indizes ×1,25 oder auf die Summe) kostet eine frische Geometrie mit vollem Upload.
AnazhRealm.CHUNK_SATZ = Object.freeze({
    boden: Object.freeze({ v: 229376, i: 1310720 }),
    // Der Wasser-Satz (0910-1 B) beginnt bei seinem Inhalt an der Mess-Wiese: 9 849 Vertices und ein Index-Hochwasser von
    // 30 720 (werkbank, OMEN, Satz-Takt 579) — bis dahin begann er bei 2^16 / 2^18 und hielt so 3,0 MiB für ~0,4 MiB Inhalt, bis
    // ihn die Ruhe-Frist verdichtete (`_chunkSatzVerdichten`, 600 Takte; das Band nach der Ankunft misst davor). Ein Seen-Land
    // wächst ihn wie jeden Satz (×1,5): 8 Floats je Vertex, ein Wachsen lädt höchstens wenige MB neu.
    wasser: Object.freeze({ v: 1 << 14, i: 1 << 16 }),
    // Der Bau-Satz (Welle 6) beginnt klein: je Stoff ein Satz, das Dorf der Mess-Wiese trägt in seinem größten Stoff
    // ~40k Vertices — er wächst in wenigen Schritten, eine Formation bleibt darunter.
    bau: Object.freeze({ v: 1 << 13, i: 1 << 14 }),
    // Der Streu-Satz (W7) je Stoff der Nah-Streu: der größte Stoff (das wiegende Laub) trägt an der Mess-Wiese ~38k
    // Vertices im Ring, ein seltener (Totholz) eine Pflanze mit 101 — er beginnt klein und wächst.
    streu: Object.freeze({ v: 1 << 10, i: 1 << 11 }),
});
// DIE ABSCHNITTE des Satzes (`_chunkSatzAbschnitt`): je Pass ein Lauf im Index mit `luft` über seiner Länge (er wächst,
// ohne umzuziehen); einer, den `ruheTakte` Render-Takte kein Pass fragte, fällt beim Umlegen; das Hauptbild legt dicht
// neu, sobald der Verschnitt (verlassene Läufe hinter umgezogenen Abschnitten) `verschnitt` × Index-Kapazität übersteigt;
// ein Abschnitt verdichtet seine Lücken (`verschnitt` seines Laufs) und, nach `dichtNach` Pässen mit ruhender Wahl, seine
// Folge (dicht in Satz-Ordnung, exakt).
AnazhRealm.CHUNK_SATZ_ABSCHNITT = Object.freeze({ luft: 1.2, ruheTakte: 600, verschnitt: 0.25, dichtNach: 30 });
// DAS VERDICHTEN des Satzes (`_chunkSatzVerdichten`): nach der Ruhe-Frist schrumpft ein Satz, dessen Kapazität mehr als
// `schwelle` × Ziel trägt, auf das Ziel = Inhalt × `luft` (Vertices: die Bereiche; Indizes: das Hochwasser der lebenden
// Abschnitte), mindestens vMin/iMin. Die Schwelle 1,5 liegt auf dem Wachs-Schritt der Vertices: nach einem Schrumpfen wächst
// der Satz erst, wenn sein Inhalt um ein Viertel zunimmt, und schrumpft erst wieder, wenn er ein Drittel verliert. Wächst der
// Inhalt während der Frist um mehr als `stetig` (10 %), beginnt sie neu — ein Satz, der füllt, schrumpft nie.
AnazhRealm.CHUNK_SATZ_VERDICHTEN = Object.freeze({ luft: 1.25, schwelle: 1.5, stetig: 1.1, vMin: 1024, iMin: 3072 });
// DER BAU-SATZ (Welle 6, `_bauSatzArt`): die Studio-Arten (Rezept-`kind`), deren gesetzte Gestalt im Satz ihres Stoffs
// zeichnet — je Art der Name des Satzes (die Täter-Klasse der Band-Linse, spec/profiband/haushalt.json: `bauSatz` →
// bau, `formationenSatz` → formationen). Ein gesetzter Bau wandert nie (die Tür-Flügel reisen einzeln), und seine
// Gestalt kehrt selten wieder (das Haus trägt seine Parzelle als Prägung, der Fels 16 Gestalten): die Instanz-Gruppe
// zog je Gestalt einen Befehl je Pass. Baum und Strauch (die Dither-Blende je Instanz, viele Wiederkehrer), Tor und
// Fahrzeug (Flügel, Fahrt) zeichnen als Instanz-Gruppe. Die AUSSTATTUNG (Feuerstelle · Marktstand · Brunnen, seit der
// Welle 5 Studio-Gestalt aus fachwerk) ist gesetzter Bau, der zeichnet UND wirft: eine Instanz-Gruppe dieser Art kann
// ihre Instanzen nicht je Pass wählen (die Wahl teilt den Instanz-Puffer, `_instanzWahlArt`) — 170 Feuerstellen warfen
// je Kaskade alle (37 400 Dreiecke an der Mess-Wiese); im Satz wählt jeder Pass seine Zellen nach dem EINEN Gesetz.
AnazhRealm.BAU_SATZ = Object.freeze({
    haus: "bauSatz",
    ausstattung: "bauSatz",
    // K43: das Tor zeichnet im Bau-Satz seines Stoffs (die Flügel der Stufe 0 wandern und bleiben draußen, `leaf.tuer`); sein
    // Wurf-Zwilling (die NUR-WURF-Stufe 3) liegt im Wurf-Satz — EIN Befehl je Kaskade für alle Werfer.
    gate: "bauSatz",
    rock: "formationenSatz",
    boulder: "formationenSatz",
    scree: "formationenSatz",
    crystal: "formationenSatz",
    columns: "formationenSatz",
});
// Die Attribute eines Bau-Satz-Bereichs: was der Studio-Stoff liest (Vertex-Farbe, die Stufen-Stempel der Dither-
// Blende) — `_bauSatzBlock` rechnet Position und Normale in Welt-Lage, die Instanz-Stempel je Vertex.
AnazhRealm.BAU_SATZ_ATTR = Object.freeze([
    Object.freeze(["position", 3]),
    Object.freeze(["normal", 3]),
    Object.freeze(["color", 3]),
    Object.freeze(["aLodLevel", 1]),
    Object.freeze(["aH0", 1]),
    Object.freeze(["aH0L", 1]),
]);
// Die Attribute eines Wurf-Satz-Bereichs (`bauWurf`, S3): was der EINE Schatten-Stoff liest — Welt-Lage, die Atlas-Lage
// (uv; die Stufe 3 trägt 0), die Deckung (aDeckt 1) und die Stufen-Stempel der Dither-Blende (Haus 0 = ungemaskt).
AnazhRealm.BAU_WURF_ATTR = Object.freeze([
    Object.freeze(["position", 3]),
    Object.freeze(["uv", 2]),
    Object.freeze(["aDeckt", 1]),
    Object.freeze(["aLodLevel", 1]),
    Object.freeze(["aH0", 1]),
    Object.freeze(["aH0L", 1]),
]);
// Die Attribute eines wiegenden Streu-Satz-Bereichs (`_streuSatzArt`, W7): was der wiegende Stoff liest — Welt-Lage,
// Normale, Farbe × Tint und die Höhe über der Wurzel (`aWiege`, m); er blendet nie, Dither-Stempel trägt er keine.
AnazhRealm.STREU_SATZ_ATTR = Object.freeze([
    Object.freeze(["position", 3]),
    Object.freeze(["normal", 3]),
    Object.freeze(["color", 3]),
    Object.freeze(["aWiege", 1]),
]);
// Foundry-Cache-GEWICHTS-DECKEL: `_foundryCacheSet` bilanziert die typed-array-Bytes je Eintrag
// (`_cacheBytes`) und räumt LRU, bis Byte-Budget UND Entries-Cap stehen (ein Eintrags-Zähler ist
// byte-blind: Haus-L0 ≈ 7–8 MB, Blume wenige KB). Die Kappe MUSS über dem Ring-Working-Set liegen
// (~351 MB @ Ring 4) — darunter fallen gewärmte Assets vor dem Konsum (gate:foundry-crossfade).
// Räumung graziös (re-anfragbar; _liveRefs: nie ein sichtbarer Baum).
AnazhRealm.FOUNDRY_CACHE_BYTES = 512 * 1024 * 1024;
// KIND_POLICY (unten) — DIE EINE DOMÄNEN-POLICY des Rezept-Buchs; eine neue Domäne ist EINE Zeile
// (+ Donor), kein Logik-Zweig. Felder: prefix (Blueprint = prefix+id; auch _foundryPresetFor) ·
// donor (Judge-Parts-Spender, fail-closed) · grown (Pflanzen-Identität via _grownSpecies, der NAME
// ist load-bearing) · builtIn · placeExtra ("forest" = _forestExtraSpecies, null = nur Katalog) ·
// impostor (Fernstufe = 8-Winkel-Billboard; `_foundryPresetIsTree` liest NUR diese Zeile).
// ACHSEN_FARBE — die EINE eingefrorene Farb-Quelle der Feld-Achsen (dslComposeFieldColor, awe).
AnazhRealm.ACHSEN_FARBE = Object.freeze({
    magieleitung: "#d4a3ff", // magisches Lila
    glut: "#ff7a59", // warmes Feuer
    lebendig: "#7bd389", // frisches Gruen
});

// Charakter-Achsen: welche Design-Sprache eine Rezept-Domäne trägt, wo ihre Tabelle im Gesetzbuch
// wohnt und wie die Wahl als ov-Passagier reist (Schmiede: __tradition = STEUER-Schlüssel für
// buildInstance; Garage: die Kultur-fx-Dials reisen roh). Neue Achse = EINE Zeile.
AnazhRealm.KIND_CHARAKTER = Object.freeze({
    weapon: Object.freeze({
        ns: "__schmiedeCore",
        tabelle: "TRADITIONEN",
        wort: "Tradition",
        ov: (name) => ({ __tradition: name }),
    }),
    vehicle: Object.freeze({
        ns: "__vehicleCore",
        tabelle: "CULTURES",
        wort: "Kultur",
        ov: (name, tab) => Object.assign({}, tab[name] && tab[name].fx),
    }),
});

AnazhRealm.KIND_POLICY = Object.freeze({
    tree: Object.freeze({ prefix: "baum_", donor: "baum_eiche", grown: true, placeExtra: "forest", impostor: true }),
    // Render-only-Zeile: shrub trägt bewusst kein prefix/donor (Auto-Register überspringt sie
    // fail-closed, keine Wald-Nische) — sie steuert NUR die Impostor-Politik.
    shrub: Object.freeze({ impostor: true }),
    // Fahrzeug-Fernstufe: ein GEPARKTES Fahrzeug wird fern zum 8-Winkel-Billboard (dieselbe Bäckerei wie
    // Baum/Tor; vehicle-core B2 weist L1/L2 dem Wirt zu). Ein GERITTENES erreicht den Impostor nie:
    // `_tickMountedMovement` pinnt entry.position auf den Spieler → die Distanz-Autorität
    // (`_foundryLodForEntry`/`_tickArchitectureLOD`) urteilt ≈ 0 → L0. Crossfade: `_updateFoundryLodBand`.
    vehicle: Object.freeze({
        prefix: "fahrzeug_",
        donor: "fahrzeug_wagen",
        grown: false,
        builtIn: false,
        placeExtra: null,
        impostor: true,
    }),
    // Tor-Domäne (porta-core, kind:"gate"): Platzierung als Rezept-Daten (fx.place mode "site" +
    // siteTag "tor") → placeExtra null. role: "portal" — ein platziertes tor_<rezept> IST ab Geburt ein
    // Welt-Tor (isPortal-Affordance, E-Betreten, Default-Ziel Skelett-Welt; `richte portal …` zielt um).
    // KEINE Karte (K43): das Tor trägt seine Stufen-Kette im Gesetzbuch (porta-core L0 → L1, die Grenzen `ab` im Kern) und
    // jenseits der Nah-Grenze seine Fernform "huelle" — vorher galt es über `impostor: true` als baumartig (Wahrnehmungs-
    // Distanz, Dither-Masken des Baums, die Karte ab 26 m) und zeigte die L0 bis 26 m.
    gate: Object.freeze({
        prefix: "tor_",
        donor: "tor_basis",
        grown: false,
        builtIn: false,
        placeExtra: null,
        role: "portal",
    }),
    // Waffen-/Werkzeug-Domäne (schmiede-core, kind:"weapon", 21 Gattungen): fx.place mode "hand" →
    // placeExtra null; Donor = Substanz-Datenblock (Tags · Ω-PHYSIS · wield), die Gestalt aus dem
    // Appear-Pfad. handAxis: das Lab baut entlang +X — der Hand-Konsument (_heldFoundryGroup/buildHand)
    // mappt Template-X auf lange Achse +Y, Griff unten; ohne handAxis unrotiert. donorTool: Rezepte mit
    // fx.tool klonen KIND_SUBSTANCE.geraet_spitzhacke → Rolle/Wield/Abbau urteilen als Werkzeug.
    weapon: Object.freeze({
        prefix: "klinge_",
        donor: "geraet_schwert",
        donorTool: "geraet_spitzhacke",
        grown: false,
        builtIn: false,
        placeExtra: null,
        handAxis: "x",
    }),
    // Haus-Domäne (fachwerk-core, kind:"haus", 32 Kultur-Archetypen): fx.place mode "settlement" +
    // siteTag "haus" über den Settlement-Kanal (exportSettlement → spawnSettlement) → placeExtra null.
    // Donor = begehbarer Substanz-Datenblock (blockerAABBs mit TÜR-LÜCKE); kindStages.haus = [0,1,2] —
    // alle drei serviert: L1 ist seit V18.500 die FLÄCHEN-STUFE des Studios (17–33 % von L0, höchstens 31k).
    haus: Object.freeze({
        prefix: "haus_",
        donor: "haus_basis",
        grown: false,
        builtIn: false,
        placeExtra: null,
    }),
});
// KIND_SUBSTANCE (unten) — die Judge-SUBSTANZ der Donor-Domänen + Werkzeug-Klasse als EINGEFRORENE
// Daten (einmal byte-genau gemünzt, Seed "anazh-realm-seed"; ein Re-Mint ist ein Vertrags-Akt).
// _foundryAutoRegisterSpecies liest bps[donor] ODER diese Tabelle (beides fehlt → kind registriert
// nicht). Parts = unsichtbare Substanz (Tags · Ω-PHYSIS · blockerAABBs · wield · sitz/fahrprofil);
// die Gestalt kommt immer aus dem Studio. Bewusst welt-invariant.
// ALT_DOPPEL — Schlüssel = Alt-Blueprint, Wert = sein Studio-Pendant (Provenienz). Sie bleiben
// ladefähig und funktional (Saves · Scatter · Hotbar · embody-Aliase); _defaultBlueprints stempelt
// sie donorOnly (das EINE W-A1-Versteck-Flag) + _altDoppel. fels_var* und kristall_var* stempeln an
// ihrer Bau-Schleife. Nicht hier: baum_eiche/birke/tanne — sie SIND die Katalog-Träger.
AnazhRealm.ALT_DOPPEL = Object.freeze({
    stein_block: "basalt",
    kiesel: "geroell",
    felsbrocken: "geroell",
    felsbogen: "zacken",
    felsturm: "zacken",
    kristall_geode: "kristalle",
    baum_kiefer: "fichte",
    baum_erle: "weide",
    reittier_holzross: "garage (fahrzeug_*, drive)",
    koerper_human: "mensch (koerperstudio)",
    koerper_wesen: "deer (tetrapoda)",
    koerper_wolf: "wolf (tetrapoda)",
    koerper_fuchs: "fox (tetrapoda)",
    koerper_baer: "bear (tetrapoda)",
});
AnazhRealm.KIND_SUBSTANCE = Object.freeze({
    geraet_schwert: {
        label: "Schwert",
        parts: [
            {
                shape: "octahedron",
                material: "eisen",
                color: 10133670,
                position: { x: 0, y: 0.13, z: 0 },
                size: { x: 0.26, y: 0.26, z: 0.26 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "cylinder",
                material: "leder",
                color: 4863270,
                position: { x: 0, y: 0.43000000000000005, z: 0 },
                size: { x: 0.07, y: 0.34, z: 0.07 },
                segments: 8,
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "octahedron",
                material: "eisen",
                color: 10133670,
                position: { x: 0, y: 0.6400000000000001, z: 0 },
                size: { x: 0.46, y: 0.1, z: 0.16 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "bladeProfile",
                material: "eisen",
                color: 13094098,
                position: { x: 0, y: 1.405, z: 0 },
                size: { x: 0.2, y: 1.45, z: 0.06 },
                tipWidth: 0.34,
                fuller: 0.5,
                heightSegments: 16,
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
        ],
    },
    geraet_spitzhacke: {
        label: "Spitzhacke",
        parts: [
            {
                shape: "cylinder",
                material: "holz",
                color: 7227944,
                position: { x: 0, y: 0.6867654114030302, z: 0 },
                size: { x: 0.1, y: 1.3735308228060603, z: 0.1 },
                segments: 6,
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "pickHead",
                material: "eisen",
                color: 12173254,
                position: { x: 0, y: 1.4314084202637896, z: 0 },
                size: { x: 0.47407894089054187, y: 0.1929253248590976, z: 0.14 },
                curve: 0.21169302093330772,
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
        ],
    },
    fahrzeug_wagen: {
        label: "Wagen",
        parts: [
            {
                shape: "box",
                material: "holz",
                position: { x: 0, y: 0.85, z: 0 },
                size: { x: 1.2852911676524672, y: 0.35, z: 2.076239578515524 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "spokeWheel",
                material: "eisen",
                spokes: 8,
                position: { x: -0.8540178782735021, y: 0.36, z: 0.8 },
                size: { x: 0.8451017794599757, y: 0.14, z: 0.8451017794599757 },
                rotation: { x: 0, y: 0, z: 1.5707963 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "spokeWheel",
                material: "eisen",
                spokes: 8,
                position: { x: 0.8540178782735021, y: 0.36, z: 0.8 },
                size: { x: 0.8451017794599757, y: 0.14, z: 0.8451017794599757 },
                rotation: { x: 0, y: 0, z: 1.5707963 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "spokeWheel",
                material: "eisen",
                spokes: 8,
                position: { x: -0.8540178782735021, y: 0.36, z: -0.8 },
                size: { x: 0.8451017794599757, y: 0.14, z: 0.8451017794599757 },
                rotation: { x: 0, y: 0, z: 1.5707963 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "spokeWheel",
                material: "eisen",
                spokes: 8,
                position: { x: 0.8540178782735021, y: 0.36, z: -0.8 },
                size: { x: 0.8451017794599757, y: 0.14, z: 0.8451017794599757 },
                rotation: { x: 0, y: 0, z: 1.5707963 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: -0.7235429246483838, y: 1.22, z: 0 },
                size: { x: 0.0988685513578821, y: 0.4, z: 1.927936751478701 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 0.7235429246483838, y: 1.22, z: 0 },
                size: { x: 0.0988685513578821, y: 0.4, z: 1.927936751478701 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 0, y: 1.22, z: 0.97 },
                size: { x: 1.2852911676524672, y: 0.4, z: 0.0988685513578821 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 0, y: 1.22, z: -0.97 },
                size: { x: 1.2852911676524672, y: 0.4, z: 0.0988685513578821 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: -0.7116815652279184, y: 1.32, z: 0.92 },
                size: { x: 0.12852911676524673, y: 0.62, z: 0.12852911676524673 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: 0.7116815652279184, y: 1.32, z: 0.92 },
                size: { x: 0.12852911676524673, y: 0.62, z: 0.12852911676524673 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: -0.7116815652279184, y: 1.32, z: -0.92 },
                size: { x: 0.12852911676524673, y: 0.62, z: 0.12852911676524673 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: 0.7116815652279184, y: 1.32, z: -0.92 },
                size: { x: 0.12852911676524673, y: 0.62, z: 0.12852911676524673 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: 0, y: 0.36, z: 0.8 },
                size: { x: 1.5818968217261136, y: 0.13, z: 0.14830282703682313 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: 0, y: 0.36, z: -0.8 },
                size: { x: 1.5818968217261136, y: 0.13, z: 0.14830282703682313 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: 0, y: 0.62, z: 1.95 },
                size: { x: 0.12852911676524673, y: 0.13, z: 1.7796339244418777 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: 0, y: 0.62, z: 2.78 },
                size: { x: 0.9392512378998799, y: 0.11, z: 0.10875540649367031 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
        ],
        connections: [
            { type: "sitz", partA: 0, partB: -1 },
            { type: "hafting", partA: 1, partB: 0 },
            { type: "hafting", partA: 2, partB: 0 },
            { type: "hafting", partA: 3, partB: 0 },
            { type: "hafting", partA: 4, partB: 0 },
        ],
    },
    tor_basis: {
        label: "Torbogen",
        parts: [
            {
                shape: "box",
                material: "stein",
                position: { x: -1.7, y: 1.7, z: 0 },
                size: { x: 0.6, y: 3.4, z: 0.7 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "stein",
                position: { x: 1.7, y: 1.7, z: 0 },
                size: { x: 0.6, y: 3.4, z: 0.7 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "stein",
                position: { x: 0, y: 3.65, z: 0 },
                size: { x: 4.2, y: 0.5, z: 0.7 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "stein",
                position: { x: 0, y: 0.1, z: 0 },
                size: { x: 4.4, y: 0.2, z: 1.2 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
        ],
    },
    haus_basis: {
        label: "Haus",
        parts: [
            {
                shape: "box",
                material: "holz",
                position: { x: -1.925, y: 1.55, z: -2.55 },
                size: { x: 2.55, y: 3.1, z: 0.3 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 1.925, y: 1.55, z: -2.55 },
                size: { x: 2.55, y: 3.1, z: 0.3 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "stein",
                position: { x: 0, y: 1.55, z: 2.55 },
                size: { x: 6.4, y: 3.1, z: 0.3 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: -3.05, y: 1.55, z: 0 },
                size: { x: 0.3, y: 3.1, z: 4.8 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 3.05, y: 1.55, z: 0 },
                size: { x: 0.3, y: 3.1, z: 4.8 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 0, y: 3.25, z: 0 },
                size: { x: 6.6, y: 0.3, z: 5.6 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
        ],
    },
});
// Bekannte place.mode-Werte (Wörterbuch v1): `_placePolicyFor` liest fail-closed — ein unbekannter
// mode platziert nicht ("none"), crasht nicht (must-ignore). site hat noch keinen Worldgen-Kanal
// (`_placeDispatch` → null); settlement = spawnSettlement + Worldgen-Konsument `_tickAutoSettlement`.
AnazhRealm.PLACE_MODES = Object.freeze({ none: 1, hand: 1, scatter: 1, forest: 1, site: 1, settlement: 1 });
// Worldgen-Auto-Dorf-Daten (Konsument `_tickAutoSettlement`, Wände + Γ5-Disziplin dort):
// nearM Materialisierungs-Distanz · spawnClearM dorffreier Radius um den Genesis-Ort (nearM < spawnClearM →
// am Spawn wirkt nur das START-DORF) · siteProbeR zwei Probe-Ringe (×cellM), falls der Anker scheitert ·
// startRadiusM Start-Dorf-Radien (einmalig je Welt, Seed ":startdorf") · perTick Häuser je Idle-Tick ·
// drosselTakte das Tempo über dem Frame-Budget.
// DAS WIRT-STREAMING der Auto-Dörfer (nur Host-Größen: wann und wie schnell die Welt baut). Das SIEDLUNGS-GESETZ
// (Raster cellM · Seltenheit rarity · Größe nHMin/nHSpan · Steil-Wand slopeMax · Klippen-Wand fundamentMaxDh) lebt EINMAL in
// fachwerk-core (SIEDLUNG) — der Zwilling hier fiel (Welle L, Karte Dorf/Stadt DEFEKT 4: stiller Fallback mit Kopien).
AnazhRealm.AUTO_SETTLEMENT = Object.freeze({
    nearM: 260,
    spawnClearM: 320,
    siteProbeR: Object.freeze([0.15, 0.3]),
    startRadiusM: Object.freeze([110, 130, 150, 170]),
    perTick: 2,
    // Über dem Frame-Budget trägt jeder drosselTakte-te Takt einen Slot (das Tempo fällt, die Siedlung entsteht).
    drosselTakte: 8,
});
// DER EINE SIEDLUNGS-GESETZ-LESER (Zensus 17.07.): das Memo setzt der Buch-Ingest (`_foundryIngestSiedlung`, validiert
// ganz-oder-gar-nicht); kaltes Buch → null: ohne Gesetz entsteht kein Dorf (fail-closed, die Leser prüfen), nie ein
// Ersatz-Gesetz.
AnazhRealm._siedlungGesetz = function () {
    return AnazhRealm._siedlungGesetzMemo || null;
};
// Max Foundry-Baum-Bauten je Frame (kein 300-Burst-Main-Thread-Spike). Klein halten — jeder
// Bau lädt bis ~170k Verts als WebGPU-Buffer hoch; der per-Frame-Drain (_tickFoliageGrowth,
// budget-gegated) tropft sie rein, wenn der Frame Luft hat. Tunable (Schöpfer-GPU balanciert).
AnazhRealm.FOUNDRY_BUILD_PER_TICK = 4;
// Proaktiver Dock, zwei Kosten: ein GEDOCKTES Asset (schon im Cache) ist ein billiger
// WebGPU-Instance → viele je Idle-Tick; ein nicht gedocktes löst einen Studio-Bake aus (das iframe
// ist EIN Thread) → streng limitiert, damit die Bake-Schlange nicht flutet.
AnazhRealm.FOUNDRY_PLACE_PER_TICK = 48; // gedockte Assets (billiger Instance) je Frame im Leerlauf
AnazhRealm.FOUNDRY_BAKE_REQ_PER_TICK = 3; // NEUE Studio-Bake-Anfragen je Frame (Ein-Thread-Schlange schonen)

// Distanz-Decay des Wasser-Automaten: jeder LATERALE Transfer liefert nur diesen Anteil ab → Wasser
// dünnt geometrisch mit der Hop-Entfernung (KEEP^n), kein Pooling am LOD-Ring-Damm; der Quellen-Pin
// speist nach, Gravitation bleibt verlustfrei. Näher 1 = weitere Ausbreitung, 0.9 = kurze Zungen.
AnazhRealm.CA_FLOW_KEEP = 0.95;

// Fluss-Re-Mesh-Throttle: ein dauerhaft fließender Chunk re-mesht sein Wasser-Sheet nur jeden N-ten
// Tick (4 = 15 Hz; jeder Frame kostete ~4 ms im Stand) — die sichtbare Strömung trägt der
// Schaum-Shader (aFlow). Gilt NUR dem Dauerfluss: der Settle-Final-Mesh bleibt unbedingt.
AnazhRealm.CA_REMESH_TICK_INTERVAL = 4;

// Verdunstung abgeklungener Zungen (fünfter Gleichgewichts-Term neben Decay · Kappe · Fixpunkt ·
// Stau): settled Live-Wasser in flood-trockenen Zellen verdunstet langsam auf 0, statt am
// KEEP-Fixpunkt (über der Render-Schwelle) ewig als Blob zu stehen. Chokepoint `_caEvaporateSettled`;
// RATE = Tempo, MAX_TICKS deckt 1.0 → 0 pro Episode.
AnazhRealm.CA_EVAP = Object.freeze({
    QUIET_TICKS: 12, // Ruhe-Ticks (Roh-Bewegung < SETTLE), bevor die Verdunstung beginnt
    RATE: 0.01, // Level-Schwund pro Tick — 0.9 → 0 in ~90 Ticks: sichtbar sanft, kein Pop
    SNAP: 0.05, // Rest unter der Sichtbarkeit fällt ganz (kein ewiger Sub-Film)
    MAX_TICKS: 130, // Verdunstungs-Fenster pro Ruhe-Episode — quell-genährte Säume frieren danach ein (kein Dauer-Pump)
});

// SOCIAL — signierte Bewertungs-Zeugnisse übers Mesh: {id, s, t, pub, sig}, sig = ed25519(canonical)
// mit der Vibe-Pass-Identität (unfälschbar); LWW (neuestes t je (id, pub)) macht sie CRDT-tauglich.
// Kanal-exklusiv (DataChannel, nicht WS-injizierbar), R1-rate-gegated, revozierte Schlüssel fallen
// aus der Aggregation. Global in localStorage (anazh.socialRatings), NIE im Welt-Snapshot.
// FORAGE (unten) — Klein-Vegetation ist pflückbar: reach = Arm-Länge (kürzer als der Abbau-Ray),
// regrowMs = Nachwachsen (Session-Gedächtnis, nicht persistiert); der Index ist stabil
// (deterministisches per-Chunk-RNG, Geerntetes → Skala 0, nie umnummeriert).
// CA_STAU (unten) — Stau-Regel des Wasser-Automaten: ein Spieler-Werk über dem Ruhe-Spiegel öffnet
// die Kappe LOKAL; ein bounded Spill-Scan (Priority-Flood) liefert je Spalte den Halte-Pegel
// (billigster Ausweg über Krone/Ufer/Fensterrand). Ein Pfeiler staut so nicht, ein Damm bis zur
// Krone; ohne Spieler-Werk ist die Kappe bit-identisch. REACH weiter = größere Stauseen.
AnazhRealm.SOCIAL = Object.freeze({
    maxStore: 600, // Zeugnisse gesamt (LWW-dedupe; aelteste t fallen)
    maxBatch: 32, // Zeugnisse pro Mesh-Batch (Anschluss-Annonce)
    ratePerSec: 12, // R1-Empfangs-Deckel pro Peer
    // F4 Stufe 4 (V18.143) — KOMMENTARE (signierte Text-Zeugnisse, append-only).
    maxComments: 400, // Kommentare gesamt (aelteste t fallen — bounded, §5-Wand)
    maxCommentLen: 240, // Zeichen pro Kommentar (die Journal-Laenge)
    maxCommentBatch: 16, // Kommentare pro Anschluss-Annonce
    maxCommentsShown: 8, // juengste je Karte sichtbar (das Panel bleibt leicht)
});

AnazhRealm.FORAGE = Object.freeze({
    reach: 6, // m — Pflueck-Reichweite
    regrowMs: 300000, // 5 min — die Flora kehrt zurueck
});

AnazhRealm.CA_STAU = Object.freeze({
    REACH: 16, // Spalten (×1.8 m ≈ 29 m) Fenster-Pad um das Werk — die Spieler-Aufmerksamkeits-Grenze
    MAX_CELLS: 7, // harter Stau-Deckel über der rim-Kappe (~12.6 m) gegen den degenerierten Mega-Damm
    FEED: 0.2, // Zufluss-Tropf/Tick in die unterste unvolle Stau-Zelle einer Quell-Spalte (der Fluss speist)
    WIN_MAX: 72, // max Fenster-Kante in Spalten — der Spill-Scan ist bounded by construction
    CLUSTER_GAP: 4, // m — Werke näher als das verschmelzen zu EINEM Stau-Werk (ein Damm = viele Blöcke)
    MIN_EXTENT: 1.6, // m — schmalere Werke (Baum-Stämme, Deko-Säulen) stauen nichts (Perf-Vorfilter)
});

// DETAIL_CASCADE (unten) — die EINE frozen Distanz→Detail-Tabelle für `_detailBand(r)` (r =
// Chebyshev-Chunk-Distanz); die ganze Welt leitet ihr Detail hier ab, kein per-Schicht-Schwellenwert.
// `maxRing` = obere Ring-Grenze (× 43.2 m), `lod` = Geometrie-Stufe, `aiDiv` = KI-Richtung nur jeden
// N-ten Frame (dazwischen glatt weiter). Ein Feld wächst erst mit seinem Leser (kein Passagier).
// FAR_WATER — grobes Atlas-Wasser-Sheet jenseits des Voxel-Rings bis `maxRadius` (dahinter trägt der
// Fern-Ring den Spiegel flach, die Luft dunstet beide): `step` = span/4 (Grid auf Chunk-Grenzen), `drop` = Spiegel knapp unter der
// Nah-Kräusel-Zone, `dip` taucht Ufer-Anker unters Terrain (edgeFade), `depth` = konstante
// Tiefen-Farbe (O(1)-Bau), `reanchorDist`/`rebuildDelta` = Rebuild-Hysterese.
AnazhRealm.FAR_WATER = Object.freeze({
    step: 10.8,
    maxRadius: 720,
    drop: 0.35,
    dip: 3.5,
    depth: 3.5,
    reanchorDist: 86.4,
    rebuildDelta: 80,
});

// FERN_RING (unten) — Fern-Kulisse aus dem EINEN Höhen-Gesetz (`_terrainMacroSurfaceY(x,z,false)`),
// 3 Ring-Schalen (3 Draw-Calls fix). `winkel`/`reihen` = Segment-Gitter je Schale (192×16: seit die Luft die
// Ferne nicht mehr verdeckt (V18.530), trägt der Ring den Blick — 96×10 zeigte aus 45 m Fächer-Facetten über
// 150–500 m tiefe Dreiecke); `schalen[i].aussen`
// = Außenradius (Schale 1 ab Voxel-Ring-Kante + `randPad`); `snap` = grobes Welt-Gitter je Schale
// (Vertex-XZ gerundet → Höhen schwimmen beim Re-Zentrieren nie); `saumDrop` = Tauchkante der
// innersten Reihe (im Gebauten zeichnet der Ring nicht: die Masken-Karte, `_fernRingMaske`); `wasserDrop` = Wasser-Klemme;
// `reanchorDist`/`anchorQuant` = Anker-Hysterese/
// -Quantisierung; `refreshVertsProTick` = Höhen-Refresh-Budget je Frame.
// FELD_PASS — polares Höhen+Farb-Feld jenseits der letzten Schale: az×rad Texel bis rMaxM, gemalt
// vom GPU-Feld-Zeichner, gemarcht vom Fullscreen-Fragment (nur Himmel-Pixel); die Fern-Farbe malt im
// Fern-Farb-Budget (`FERN_FARBE.msJeTakt`, nach den offenen Ring-Farben).
AnazhRealm.FELD_PASS = Object.freeze({ az: 192, rad: 48, rMaxM: 40000 });
// FELD_PANO — Schattierungs-Persistenz: statt 96 Raymarch-Schritten je Himmel-Pixel je Frame marcht
// EIN Compute ins Polar-Panorama (Farbe + Treffer-DISTANZ; der Nebel bleibt live im Fragment →
// Tag/Nacht braucht keinen Re-Bake), das Fragment schlägt nur nach. Re-Bake nur bei Kamera-Drift;
// Elevation-Zeilen ballen quadratisch am Horizont, über hMax marcht niemand.
AnazhRealm.FELD_PANO = Object.freeze({
    az: 768, // Azimut-Spalten (4× feiner als das 192er-Feld — die Winkel-Auflösung des Blicks)
    elev: 160, // Elevation-Zeilen (quadratisch am Horizont geballt)
    elevMax: 0.35, // rad (~20°) — deckt den Blick vom Gipfel (camY 2800: Horizont-Terrain ≈ −19.3°)
    rebakeDist: 60, // m XZ-Drift bis zum Re-Bake (Parallaxe auf 8 km ≈ 0.4° — unter der Wahrnehmung)
    rebakeHoehe: 12, // m Y-Drift bis zum Re-Bake (Horizont-Verschiebung)
});
// DIE MASCHE DES FERN-RINGS (K16): je Schale so viele geometrische Reihen, dass eine Masche radial höchstens `seite`-mal so
// tief ist wie breit (`_fernRingReihen`) — 16 Reihen je Schale gaben Schale 0 Maschen 10 : 1 (Reihen-Faktor 1,32 gegen
// 2π/192): jeder Makro-Blick zeigte radiale Streifen um den Spieler. Der Snap bleibt unter der Maschen-Breite am
// sichtbaren Innenrand (Schale 0 ab der Chunk-Kante ~200 m), sonst fallen Punkte zusammen; Schale 0 trägt die
// Deck-Zone ganz (Ring 12: 729 m).
AnazhRealm.FERN_RING = Object.freeze({
    winkel: 192,
    seite: 3,
    schalen: Object.freeze([
        Object.freeze({ aussen: 800, snap: 6 }),
        Object.freeze({ aussen: 3000, snap: 24 }),
        Object.freeze({ aussen: 8000, snap: 64 }),
    ]),
    randPad: 40,
    saumDrop: 6,
    // DIE WEICHE IM SAUM DES GEBAUTEN (`_fernRingRegel` 1): so tief (m, senkrecht) weicht der Ring dem Chunk in der ersten
    // Voxel-Spalte am Rand des Gebauten — über der Sehne des Rings (Ring 3 mit Stufe 1 an der Bau-Kante: Naht p95 1,3 m, max 4,3 m) und der Abweichung des Chunks
    // (±0,4 m); längs des Strahls gekappt (`nahtWeicheMax`), damit der streifende Blick nicht ferne Hänge durch den Saum zieht.
    nahtWeiche: 6,
    nahtWeicheMax: 24,
    // die Feld-Flächen des Naht-Rands, die die Deck-Wache je Takt misst (`_fernRingFeldY`)
    feldJeTakt: 12,
    wasserDrop: 0.4,
    reanchorDist: 180,
    anchorQuant: 24,
    refreshVertsProTick: 600,
});
// WEGE_KARTE (`_wegeKarteEnsure`): die welt-verankerte Clipmap der Siedlungs-Wege um den Spieler, je Stufe ein
// Fenster (Kante `fensterM`, Texel `texelM`), Umzug ab `umzugM` Abstand zur Mitte — gesichert ist fensterM/2 −
// umzugM: NAH 512 m zu 0,5 m (ein 2,5-m-Weg = 5 Texel, die Kante bilinear weich), gesichert 208 m ≥ die Ring-Kante
// 194 m des Standard-Rings; FERN 2048 m zu 2 m, gesichert 768 m ≥ der größte Chunk-Ring (12,5 × 43,2 = 540 m).
// Der Rand fällt über ±max(randM, randMinM) weich (getretene Erde läuft in die Wiese aus; fern ≥ 1 Texel).
AnazhRealm.WEGE_KARTE = Object.freeze({
    stufen: Object.freeze([
        Object.freeze({ name: "nah", fensterM: 512, texelM: 0.5, umzugM: 48, randMinM: 0 }),
        Object.freeze({ name: "fern", fensterM: 2048, texelM: 2, umzugM: 256, randMinM: 2 }),
    ]),
    randM: 0.6,
});
// DIE LAUB-STREU UNTER DEN KRONEN (`_kronenStreuNeu`, Welle 5 Boden): je Wege-Stufe eine R8-Karte im selben Fenster — `texelM` je Stufe
// (nah 1 m, fern 4 m: 512² = 256 KB je Stufe); eine Krone legt `dichte` Laubstreu bis `kern` × Kronen-Radius, weich
// fallend bis `rand` × Radius (die Krone des Studio-Baums reicht über den Schüchternheits-Radius hinaus, das Laub weht
// vor die Traufe), Kronen summieren sich (zwei überlappende decken den Grund); `kroneJeHoehe` = Kronen-Radius je Meter
// Sichthöhe für Streu-Arten ohne Kronen-Eintrag im Wald-Generator; `uploadMs` = höchstens ein Upload je Stufe in diesem
// Takt; `zelleM` = die Kante der Index-Zellen des Kronen-Registers (ein Nah-Umzug fragt ≤ 30 Zellen, ein ferner ≤ 204 —
// um den größten Laub-Rand 21 m erweitert —, nie den Bestand).
AnazhRealm.LAUB_STREU = Object.freeze({
    texelM: Object.freeze([1, 4]),
    dichte: 0.6,
    kern: 1.0,
    rand: 1.7,
    kroneJeHoehe: 0.35,
    uploadMs: 250,
    zelleM: 64,
});
// FERN_FARBE (`_fernFarbeTeile`, linear): das Kronendach des Waldes aus der Ferne = die Studio-Laubfarbe der Arten
// am Ort × `kronenSchatten` (die Krone beschattet sich selbst: die Eiche, Blatt-Grün 0,195, trägt so 0,062 — die
// Satelliten-Bänder geschlossener Laubwald-Kronen im Sommer, grün ~0,05–0,07); die Saison multipliziert der Leser
// (`uSeasonMul`); der Feld-Pass malt neu, wenn die Saison je Kanal um mehr als `saisonDrift` gewandert ist. Das Wasser
// trägt keine Fern-Farbe: es ist der Wasser-Körper des Gesetzes (`_wasserKoerper`, im Ring der Blick des Wassers).
// DAS FERN-FARB-BUDGET (`_fernFarbTakt`): `msJeTakt` je Takt für die Fern-Krone des nahen Bodens, offene Ring-Farben und
// den Feld-Farb-Job, über dem Frame-Budget `msKnapp`, nie weniger als `mindestJeTakt` Punkte (Krone und Ring je); `memo` = eine Generation des Fern-Farb-Gedächtnisses
// (zwei Generationen tragen > 2 volle Ringe).
AnazhRealm.FERN_FARBE = Object.freeze({
    kronenSchatten: 0.32,
    saisonDrift: 0.05,
    msJeTakt: 2,
    msKnapp: 0.5,
    mindestJeTakt: 64,
    memo: 12288,
});

// Lockstep-MP (nur Inputs übers Netz): `jitterReserve` = Frame-Reserve gegen Netz-Jitter (2 Frames
// ≈ 33 ms Anzeige-Latenz des Fremd-Charakters), `maxStepsPerTick` = Aufhol-Burst-Kappe je Frame,
// `driftMax` (m) = Ghost-vs-pos-Schwelle fürs Ent-Seeden (der 1-Hz-Anker heilt danach).
AnazhRealm.LOCKSTEP = Object.freeze({ jitterReserve: 2, maxStepsPerTick: 10, driftMax: 2.5 });

AnazhRealm.DETAIL_CASCADE = Object.freeze([
    // Band 0 ist 5×5 (maxRing 2): die LOD0↔LOD1-Naht liegt ~100 m weg (die Luft dunstet sie, der Nebel deckte sie bis
    // V18.530) statt bei ~50 m. (Die Deko-Bänder fielen 04.10. mit dem Klein-Vegetations-Zwilling: die Nah-Streu hängt am Schirm.)
    Object.freeze({ maxRing: 2, lod: 0, aiDiv: 1 }), // Band 0 — ≤ 130 m (5×5): volles Detail
    Object.freeze({ maxRing: 8, lod: 1, aiDiv: 1 }), // Band 1 — ≤ 346 m: die geliebte Mittelsicht
    Object.freeze({ maxRing: 10, lod: 2, aiDiv: 3 }), // Band 2 — ≤ 432 m: ferner Ring (16× billiger)
    Object.freeze({ maxRing: Infinity, lod: 3, aiDiv: 6 }), // Band 3 — ≤ 518 m: die gröbste Stufe (~300×), so grob wie der Fern-Ring dort
]);

// LOD-Hysterese: ein bestehender Chunk wechselt die LOD erst, wenn r die Band-Grenze um diese
// Ring-Zahl KLAR überschreitet (Deadband gegen Flip-Flop-Pop). Asymmetrisch (`_voxelChunkLodFor`):
// verfeinern sofort, vergröbern nur im klaren Überschritt.
AnazhRealm.LOD_HYSTERESIS_RINGS = 1;

// GESTURE_CRYSTAL — GESTE → GESETZ: eine wiederholt bewährte Geste (finalized, fitness ≥ minFitness,
// ≥ minRuns Läufe desselben Op-Kopfes) kristallisiert zu einer stehenden Regel; die
// Emotions-Signatur ihres Kontexts gebiert die Bedingung.
// WORLD_RULES (unten) — frozen, _tickWorldRules liest jeden Frame: cap (max Regeln, Verdrängung in
// _evictWorldRule) · budgetPerFrame (max Effekte je Frame) · defaultEverySec · minEverySec (Floor
// gegen Per-Frame-Feuern). Nexus-Komposition (composeRuleProb, ruleEverySec…, ruleTtl…) + Fitness über
// ein Lebens-Fenster (costBudgetMs/renewFitness/mutateSurvivorProb): eine Nexus-Regel ist EPHEMER
// (ttlSec) — gut → erneuern, schlecht/inert → verfallen.
AnazhRealm.GESTURE_CRYSTAL = Object.freeze({
    cooldownSec: 45, // höchstens alle 45 s ein Kristallisations-Versuch
    minFitness: 0.65, // nur wirklich bewährte Läufe zählen
    minRuns: 3, // Wiederholung macht das Gesetz (eine Einzeltat bleibt Geste)
    minEmotionIntensity: 0.25, // darunter trägt der Kontext keine Signatur → random_chance
});
AnazhRealm.WORLD_RULES = Object.freeze({
    cap: 64,
    budgetPerFrame: 4,
    defaultEverySec: 2,
    minEverySec: 0.5,
    // Phase C — Komposition
    composeRuleProb: 0.35, // Anteil der Nexus-Evolutionen, die eine REGEL sind (statt einer Geste)
    ruleEverySecMin: 1, // komponierte Regeln feuern alle 1–5 s
    ruleEverySecMax: 5,
    ruleTtlMin: 30, // Lebens-Fenster einer Nexus-Regel (30–90 s; Fitness erneuert sie)
    ruleTtlMax: 90,
    mutateSurvivorProb: 0.4, // P(eine neue Nexus-Regel ist ein mutierter Nachkomme eines Überlebenden)
    // Phase C — Fitness (per-Regel, attributierbar: Kosten + Erfolg + Engagement)
    costBudgetMs: 4, // ein Regel-Effekt sollte < ~4 ms kosten (sonst Cost-Penalty)
    renewFitness: 0.5, // ab dieser Fitness wird eine Nexus-Regel am ttl-Ende erneuert
    // Gesetzes-Faden: ein Gesetz, das binnen dieser Frist gefeuert hat, gilt als „feuert gerade"
    // (Live-Puls der Gesetze-Console); > ruleEverySecMax (5) → ein aktives Gesetz pulst durchgehend.
    threadRecentSec: 6,
});

// LEBENDIGE WERTUNG (lesen → schreiben → WERTEN): gleitende Baseline (EMA-Tiefpass) + Differenz
// δ = x − baseline — braucht nur Zeitkonstanten. Reaktiv (nicht persistiert, kein Worker-Mirror).
//   cell        — Zell-Größe der Baseline-Map (= LIFE_FIELD.cell, 16 m)
//   fieldTau    — ORTS-Baseline (s); ~120 s → ein Ort re-normalisiert langsam
//   playerTau   — SPIELER-Baseline (s); ~30 s → Gewöhnung in einer Sitzung
//   pruneEverySec / pruneAgeSec — die Baseline-Map bounded halten
AnazhRealm.WERTUNG = Object.freeze({
    cell: 16,
    fieldTau: 120,
    playerTau: 30,
    pruneEverySec: 5,
    pruneAgeSec: 180,
    // V17.43 Phase 2 — die EMA-Rate, mit der rule.value den per-Feuern gemessenen
    // Reward (lokaler struktureller δ) integriert. Eine Regel braucht mehrere Feuern,
    // um sich als Heiler/Schädling zu beweisen (kein Snap-Urteil). value ∈ [−1, +1].
    ruleValueBeta: 0.3,
    // V17.44 Phase 3 — der Appraisal-Kanal (Emotion = Vorhersagefehler des ERLEBENS,
    // δ = Situation − Spieler-Baseline). gain = wie stark ein δ die Emotion bewegt (pro
    // Sekunde, sanft, ADDITIV zu V17.30/V17.21); deadzone = Totzone gegen Zappeln.
    appraisalGain: 0.4,
    appraisalDeadzone: 0.05,
    // Die Klammer: rule.value (lokaler struktureller δ) und δ_spieler (roher Situations-δ) sind dasselbe
    // Vorhersagefehler-Signal — eine Regel, die NAH am Spieler bei positivem δ_spieler feuert, bekommt
    // Bonus-Credit (die Welt blüht, wo der Spieler ist).
    appraisalEmaTau: 8, // s — die kurze EMA des Spieler-δ (die jüngste Erlebnis-Tendenz)
    phase4Radius: 40, // m — nur Regeln innerhalb dieses Radius vom Spieler bekommen den Bonus
    phase4Weight: 0.5, // wie stark ein positiver δ_spieler den Regel-Reward hebt (× Nähe)
});

// ═══ DER EINE GESETZ-STROM ═══
// `AnazhRealm.Gesetz(pfad, fallback)`: EIN Chokepoint, durch den jeder Export jedes Kerns
// (GESETZ_KERNE) erreichbar ist — ein neues Studio-Gesetz braucht nur einen Konsumenten mit Pfad.
// Pfad "<kern>:<Weg>": Großbuchstaben-Wurzel = Namensraum-Block ("schmiede:ARENA.bogen"), sonst die
// fx-Heimat des Primär-Presets ("koerper:bewegung.schwimmen" ≙ PRESETS.mensch.fx.bewegung.schwimmen).
// Kalter Kern / fehlender Ast / nicht-finite Zahl → fallback; Memo NUR im Erfolgs-Fall (ein spät
// ladender Kern friert nie den Fallback ein). Die Domänen-Leser unten greifen alle durch diesen Strom
// und halten ihre Gültigkeits-Wände; gate:konsum-bilanz misst, was noch niemand trinkt.
AnazhRealm.GESETZ_KERNE = Object.freeze({
    koerper: "__koerperCore",
    tetrapoda: "__tetrapodaCore",
    schmiede: "__schmiedeCore",
    vehicle: "__vehicleCore",
    porta: "__portaCore",
    fachwerk: "__fachwerkCore",
    klang: "__klangCore",
    // ZWILLINGS-ABSCHIED (18.07.): das Terrain-Studio steht im Strom — die
    // Welt-Look-Gesetze (HIMMEL/WASSER, foundry-core __terrainCore) sind
    // Kern-Pflicht wie jedes andere Gesetzbuch (die Wand meldet den Ausfall).
    terrain: "__terrainCore",
    // K09a — das Gelände-Gesetzbuch (gelaende-core.js): die EINE 2D-Höhe für Stamm, voxel-worker und Studio.
    gelaende: "__gelaendeCore",
});
AnazhRealm.Gesetz = function (pfad, fallback) {
    const memo = AnazhRealm._gesetzStromMemo || (AnazhRealm._gesetzStromMemo = new Map());
    if (memo.has(pfad)) return memo.get(pfad);
    try {
        const d = pfad.indexOf(":");
        const nsName = d > 0 ? AnazhRealm.GESETZ_KERNE[pfad.slice(0, d)] : null;
        const ns = nsName && typeof globalThis !== "undefined" ? globalThis[nsName] : null;
        if (ns) {
            const teile = pfad.slice(d + 1).split(".");
            let v;
            if (teile[0] in ns) {
                v = ns; // Namensraum-Block (ARENA/VERHALTEN/FAHR/SIEDLUNG/…)
            } else if (ns.PRESETS) {
                const erst = Object.keys(ns.PRESETS)[0]; // fx-Heimat des Primär-Presets
                v = ns.PRESETS[erst] && ns.PRESETS[erst].fx;
            }
            for (const t of teile) {
                if (v == null) break;
                v = v[t];
            }
            if (v !== undefined && v !== null && (typeof v !== "number" || Number.isFinite(v))) {
                memo.set(pfad, v);
                return v;
            }
        }
    } catch (_e) {}
    return fallback;
};

// Die Kerne sind PFLICHT (index.html lädt alle Gesetzbücher, _kernPflichtWand meldet den Ausfall):
// ein unlesbares Gesetz ist ein lauter BRUCH, nie eine stille Ersatz-Welt. Keine Zahlen-Zwillinge im
// Stamm — die Zwillings-Absenz-Wand (gate:studio-vertrag) hält sie draußen.
// DIE BETT-TIEFE eines Fluss-Punkts (der EINE Leser): carveBedMin + carveBedK · volle Breite, an der Quelle mit ihrem
// Anteil (W-F5: eine Quelle ist ein Rinnsal, nie ein 1,4-m-Graben aus dem Nichts). Leser: `_hydroRiverSpiegel`,
// `_hydroBuildCarveIndex` (seg.dA/dB → der Kanal, `_hydroRiverAt`, der Worker).
AnazhRealm._flussTiefe = function (p) {
    const HC = AnazhRealm.HYDROSPHERE;
    const q = p.quelle;
    if (!(q > 0 && q <= 1)) throw new Error(`_flussTiefe: Fluss-Punkt ohne Quell-Anteil (quelle = ${q})`);
    return Math.min(HC.kanalTiefe, (HC.carveBedMin + (HC.carveBedK * p.width) / q) * q);
};
// DER KASTEN QUER ZUM FLUSS (K16, `_flussAbdruck`): das Mittel eines Ufer-Bands b(|u|) über [d − F/2, d + F/2] (u der
// Abstand quer zum Segment, d der des Punkts) aus der Stammfunktion des Bands C(s) = ∫₀ˢ b — exakt für ein gerades
// Segment, stetig in d, für F → 0 der Punkt-Wert b(d). Die Stammfunktionen stehen neben ihren Bändern.
AnazhRealm._kastenMittel = function (C, d, F, p, q, r, s) {
    const a = d - F / 2;
    const b = d + F / 2;
    return (a >= 0 ? C(b, p, q, r, s) - C(a, p, q, r, s) : C(b, p, q, r, s) + C(-a, p, q, r, s)) / F;
};
// die Kronen-Blende (`_hydroRiverAt`): 1 bis zur Kanal-Kante `hw`, smoothstep auf 0 über `kappa` bis zur Krone
AnazhRealm._stammUfer = function (s, hw, kappa) {
    let w = (s - hw) / kappa;
    w = w < 0 ? 0 : w > 1 ? 1 : w;
    return Math.min(s, hw) + kappa * (w - w * w * w + (w * w * w * w) / 2);
};
// das Fluss-Band der Feuchte (`_feuchteAt`): 1 bis `inner`, smoothstep auf 0 über `reich`
AnazhRealm._stammFeuchte = function (s, inner, reich) {
    const q = s < inner ? inner : s > inner + reich ? inner + reich : s;
    const v = (inner + reich - q) / reich;
    return Math.min(s, inner) + reich * (0.5 - v * v * v + (v * v * v * v) / 2);
};
// die Bank (`_pathFieldAt`): (1 − (u − inner) / bank)² auf [inner, inner + bank]
AnazhRealm._stammPfad = function (s, inner, bank) {
    let q = (s - inner) / bank;
    q = q < 0 ? 0 : q > 1 ? 1 : q;
    return (bank * (1 - (1 - q) * (1 - q) * (1 - q))) / 3;
};
// die Bank × die Kronen-Blende (`_pathFieldAt` über dem Fluss-Spiegel): auf [inner, Ende] ein Polynom 5. Grades —
// Gauß-Legendre mit drei Knoten ist exakt
AnazhRealm._stammPfadUfer = function (s, inner, bank, hw, kappa) {
    const e = Math.min(s, inner + bank, hw + kappa);
    if (!(e > inner)) return 0;
    const m = (inner + e) / 2;
    const h = (e - inner) / 2;
    const f = (u) => {
        const b = 1 - (u - inner) / bank;
        let w = (u - hw) / kappa;
        w = w < 0 ? 0 : w > 1 ? 1 : w;
        return b * b * (1 - w * w * (3 - 2 * w));
    };
    const k = h * Math.sqrt(0.6);
    return h * ((5 / 9) * f(m - k) + (8 / 9) * f(m) + (5 / 9) * f(m + k));
};

// Die Dichte des Wassers auf der Tag-Skala der Materialien (holz 0,4 schwimmt, stein/eisen sinken): die Schwelle des
// Schwimmens und der Bezug der Wasserlinie (`_vehicleProfile`, `_fahrzeugGestalt`).
AnazhRealm.WASSER_DICHTE_TAG = 0.55;

// DER ANKER DER REIHE IM BÜNDEL (1310-9): ab diesem Weg des Auges stellen die Bündel ihre Kinder neu nach Abstand (je
// Anker-Wechsel EINE Neuaufnahme jedes Bündels, nie je Frame).
AnazhRealm.BUENDEL_ANKER_M = 16;

AnazhRealm._kernPflichtBruch = function (pfad) {
    throw new Error(
        "KERN-PFLICHT verletzt: " +
            pfad +
            " ist unlesbar — das Gesetzbuch fehlt oder ist alt (index.html lädt alle Kerne; _kernPflichtWand meldet den Ausfall)."
    );
};
// DAS SAISON-GESETZ (foundry-core SAISON_GESETZ, V18.527): die Jahres-Stützstellen des Studios — der EINE Leser
// (`_saisonMul`, Karten-Stoff), fail-closed in EINER Gültigkeits-Wand.
AnazhRealm._saisonGesetz = function () {
    const SG = AnazhRealm.Gesetz("terrain:SAISON_GESETZ", null);
    if (
        SG &&
        Array.isArray(SG.stuetzen) &&
        SG.stuetzen.length === 4 &&
        SG.stuetzen.every((s) => s && Number.isFinite(s.ti)) &&
        Number.isFinite(SG.bau) &&
        Number.isFinite(SG.mulMin) &&
        Number.isFinite(SG.mulMax) &&
        Number.isFinite(SG.kartenGewicht)
    )
        return SG;
    return AnazhRealm._kernPflichtBruch("terrain:SAISON_GESETZ");
};
AnazhRealm._bewegungsKoeff = function (stat) {
    const row = AnazhRealm.Gesetz("koerper:bewegung." + stat, null);
    if (row && Number.isFinite(row.base) && Number.isFinite(row.leicht) && Number.isFinite(row.mag)) return row;
    return AnazhRealm._kernPflichtBruch("koerper:bewegung." + stat);
};
// ZWILLINGS-ABSCHIED (18.07.) — der EINE Sprint-Faktor-Leser, fail-closed
// (dieselbe Domänen-Disziplin wie _bewegungsKoeff — kein stiller ×2-Zwilling).
AnazhRealm._sprintMulGesetz = function () {
    const m = AnazhRealm.Gesetz("koerper:bewegung.sprintMul", null);
    if (Number.isFinite(m) && m > 0) return m;
    return AnazhRealm._kernPflichtBruch("koerper:bewegung.sprintMul");
};
// Der EINE Fahr-Gesetz-Leser, fail-closed: hostEmergent (Emergenz-Koeffizienten, Klemm-Grenzen,
// Gier-Folge) + Nick-/Wank-Konstanten (FAHR.pitchGain/rollGain, A_PITCH_MAX/A_LAT_MAX) in EINER
// Gültigkeits-Wand — ganz oder gar nicht, nie ein Misch-Gesetz. Memo nur im Erfolgs-Fall.
AnazhRealm._fahrGesetz = function () {
    if (AnazhRealm._fahrGesetzMemo) return AnazhRealm._fahrGesetzMemo;
    const vc = typeof globalThis !== "undefined" ? globalThis.__vehicleCore : null;
    const F = vc && vc.FAHR;
    const he = F && F.hostEmergent;
    const HE_FELDER = [
        "radMul",
        "radCap",
        "beinBonus",
        "kAcc",
        "kBrakeRad",
        "kBrakeBein",
        "kAccMin",
        "kAccMax",
        "kBrakeRadMin",
        "kBrakeRadMax",
        "kBrakeBeinMin",
        "kBrakeBeinMax",
        "yawFolgeK",
        "fahrtGate",
    ];
    if (
        he &&
        HE_FELDER.every((k) => Number.isFinite(he[k])) &&
        Number.isFinite(F.pitchGain) &&
        Number.isFinite(F.rollGain) &&
        Number.isFinite(vc.A_PITCH_MAX) &&
        Number.isFinite(vc.A_LAT_MAX) &&
        F.masseDichte > 0 &&
        F.sitzLehneRad >= 0 &&
        F.kopfFreiraumM >= 0 &&
        F.sitzLehneMaxRad >= F.sitzLehneRad
    ) {
        AnazhRealm._fahrGesetzMemo = {
            he,
            pitchGain: F.pitchGain,
            rollGain: F.rollGain,
            aPitchMax: vc.A_PITCH_MAX,
            aLatMax: vc.A_LAT_MAX,
            // die Masse des Wagens: das Volumen des Kerns (carPhys, im Fahr-Satz G.m) mal dieser Dichte (0710-4)
            masseDichte: F.masseDichte,
            // der Reiter im Wagen (0710-4 Klasse 4): die Lehne des Sitzes, der Kopf-Freiraum unter der Dachlinie, die
            // steilste Lehne
            sitzLehneRad: F.sitzLehneRad,
            kopfFreiraumM: F.kopfFreiraumM,
            sitzLehneMaxRad: F.sitzLehneMaxRad,
        };
        return AnazhRealm._fahrGesetzMemo;
    }
    return AnazhRealm._kernPflichtBruch("vehicle:FAHR.hostEmergent / FAHR.masseDichte / FAHR.sitzLehneRad");
};
// DER EINE FAHR-SCHRITT-LESER (Welle L, Nachbesserung 07.10.), fail-closed: die Funktionen des Fahr-Schritts
// (vehicle-core fahrGesetz · fahrZustand · fahrEbene · fahrStand · fahrKraefte · fahrAufstand) und die Wände des
// Welt-Ritts (FAHR.schritt: Stufe, Rad-Hub, Ebenen-Klammer, Luft-Abstand) in EINER Gültigkeits-Wand. Ein alter Kern
// bricht LAUT — vorher prüften `_fahrSatz` und `_rittEbene` typeof und gaben still null (der Gesetz-Wagen ritt
// richtungs-folgend), und Hülle, Kontakt und Rad trugen Literal-Zwillinge der Kern-Zeilen (0,34/0,5 · 0,7 · 0,34/0,6).
// Memo je Kern-Objekt.
AnazhRealm._fahrSchrittGesetz = function () {
    const vc = typeof globalThis !== "undefined" ? globalThis.__vehicleCore : null;
    const memo = AnazhRealm._fahrSchrittMemo;
    if (memo && memo.vc === vc) return memo;
    const S = vc && vc.FAHR && vc.FAHR.schritt;
    if (
        S &&
        ["fahrGesetz", "fahrZustand", "fahrEbene", "fahrStand", "fahrKraefte", "fahrAufstand"].every(
            (f) => typeof vc[f] === "function"
        ) &&
        ["stufeRad", "radHub", "ebeneMax", "ebeneTol", "luftEps", "bremsV", "rueckVmax"].every((k) =>
            Number.isFinite(S[k])
        )
    ) {
        AnazhRealm._fahrSchrittMemo = { vc, S };
        return AnazhRealm._fahrSchrittMemo;
    }
    return AnazhRealm._kernPflichtBruch("vehicle:FAHR.schritt/fahrSchritt");
};
// Der EINE Platz-Leser (Leben-Schau 2, fahr-bahn): das Platz-Gesetz eines Wagens, den die Welt hinstellt (vehicle-core
// fahrPlatz + FAHR.platz: Anfahrt-Anteil, Such-Schritt, Such-Radius). Fail-closed: ein Kern ohne Platz-Gesetz bricht laut,
// nie stellt die Welt einen Wagen still ungeprüft hin. Memo je Kern-Objekt.
AnazhRealm._fahrPlatzGesetz = function () {
    const vc = typeof globalThis !== "undefined" ? globalThis.__vehicleCore : null;
    const memo = AnazhRealm._fahrPlatzMemo;
    if (memo && memo.vc === vc) return memo;
    const P = vc && vc.FAHR && vc.FAHR.platz;
    if (
        P &&
        typeof vc.fahrPlatz === "function" &&
        typeof vc.fahrPlatzGrenze === "function" &&
        ["anfahrAnteil", "bahnLaengen", "suchRadiusM", "suchSchrittM", "richtungen"].every((k) =>
            Number.isFinite(P[k])
        ) &&
        P.suchSchrittM > 0 &&
        P.richtungen >= 1
    ) {
        AnazhRealm._fahrPlatzMemo = { vc, P };
        return AnazhRealm._fahrPlatzMemo;
    }
    return AnazhRealm._kernPflichtBruch("vehicle:FAHR.platz/fahrPlatz");
};
// Der EINE Kampf-Koeffizienten-Leser: hpMax/damage/knockback/defense aus PRESETS.mensch.fx.kampf,
// Formel base + dichte-Tag·dichte + härte-Tag·haerte. Fail-closed.
AnazhRealm._kampfKoeff = function (stat) {
    const row = AnazhRealm.Gesetz("koerper:kampf." + stat, null);
    if (row && Number.isFinite(row.base) && Number.isFinite(row.dichte) && Number.isFinite(row.haerte)) return row;
    return AnazhRealm._kernPflichtBruch("koerper:kampf." + stat);
};
// Equip-Fold-Gewichte (wie stark Gehaltenes/Waffe/Rüstung/Werkzeug den Körper-Compound prägen) sind
// Körper-Gesetz (koerper:kampf.fold); die vier Statics unten sind nur Leser (Getter). Fail-closed.
AnazhRealm._kampfFold = function () {
    const f = AnazhRealm.Gesetz("koerper:kampf.fold", null);
    if (
        f &&
        Number.isFinite(f.held) &&
        Number.isFinite(f.weapon) &&
        Number.isFinite(f.armor) &&
        Number.isFinite(f.tool)
    )
        return f;
    return AnazhRealm._kernPflichtBruch("koerper:kampf.fold");
};
// Der EINE Schwimm-Gesetz-Leser: die Wasser-Bewegung des Avatars (Physik, Takt, Lehne, Kraul-Pose,
// Ausdauer) aus PRESETS.mensch.fx.bewegung.schwimmen. Fail-closed (Kern-Pflicht); Memo nur im
// Erfolgs-Fall.
AnazhRealm._schwimmGesetz = function () {
    if (AnazhRealm._schwimmGesetzMemo) return AnazhRealm._schwimmGesetzMemo;
    const s = AnazhRealm.Gesetz("koerper:bewegung.schwimmen", null);
    if (s && Number.isFinite(s.tauchV) && s.lean && s.pose && s.leanSoul && Number.isFinite(s.leanSoul.moving)) {
        AnazhRealm._schwimmGesetzMemo = s;
        return s;
    }
    return AnazhRealm._kernPflichtBruch("koerper:bewegung.schwimmen");
};
// Die WASSERLINIE des Menschen-Körpers: die Brustkorb-Linie über der Sohle (Meter) aus seiner Gestalt — die
// Brustwarzen-Höhe der Proportionen (koerper-core labProportionen, nippleY/H) × die Welt-Körperhöhe des Avatars
// (8 Kopf-Einheiten PLAYER_KH). Der Schwimmer liegt mit dieser Linie am Spiegel; flacheres Wasser watet er.
// Fail-closed (Kern-Pflicht); Memo nur im Erfolgs-Fall.
AnazhRealm._schwimmBrustM = function () {
    if (AnazhRealm._schwimmBrustMemo) return AnazhRealm._schwimmBrustMemo;
    const lp = AnazhRealm.Gesetz("koerper:labProportionen", null);
    const P = typeof lp === "function" ? lp() : null;
    if (P && Number.isFinite(P.nippleY) && P.H > 0) {
        AnazhRealm._schwimmBrustMemo = (P.nippleY / P.H) * 8 * AnazhRealm.PLAYER_KH;
        return AnazhRealm._schwimmBrustMemo;
    }
    return AnazhRealm._kernPflichtBruch("koerper:labProportionen");
};
// Der EINE Parkour-Leser (Doppel-/Wandsprung · Klettern · Rutsch aus fx.bewegung.parkour). Bewusst
// ohne Zahlen-Fallback: Kern kalt → null → KEIN Parkour — die Verben existieren nur als
// Studio-Gesetz. Memo nur im Erfolgs-Fall.
AnazhRealm._parkourGesetz = function () {
    if (AnazhRealm._parkourGesetzMemo) return AnazhRealm._parkourGesetzMemo;
    try {
        const p = AnazhRealm.Gesetz("koerper:bewegung.parkour", null);
        // Gültigkeits-Wand: auch die Rutsch-Zeile (slideMinTempo/slideDauerSec/slideTempoMul) und
        // kontaktFrischeSec/wandsprungMul/doppelsprungMul/kletterAusdauerProS sind Pflicht-Felder — ganz
        // oder gar nicht, nie ein Misch-Gesetz aus Kern + Literal.
        if (
            p &&
            Number.isFinite(p.kletterV) &&
            Number.isFinite(p.wandAbstoss) &&
            Number.isFinite(p.kontaktFrischeSec) &&
            Number.isFinite(p.wandsprungMul) &&
            Number.isFinite(p.doppelsprungMul) &&
            Number.isFinite(p.kletterAusdauerProS) &&
            Number.isFinite(p.slideMinTempo) &&
            Number.isFinite(p.slideDauerSec) &&
            Number.isFinite(p.slideTempoMul)
        ) {
            AnazhRealm._parkourGesetzMemo = p;
            return p;
        }
    } catch (_e) {}
    return null;
};
// Die Zweibeiner-Zeile des EINEN Gang-Gesetzes (fx.bewegung.gang): jedes Feld ist Pflicht — fehlt eines (der Lauf-Wechsel,
// der Hub des Laufs, das Becken), bricht der Leser, statt still die Tier-Form zu fahren (K07).
AnazhRealm.GANG_FELDER = Object.freeze([
    "schrittBasis",
    "schrittFroude",
    "tastgrad",
    "tastgradLauf",
    "laufFroude",
    "maxWinkel",
    "hub",
    "hubLauf",
    "hubForm",
    "beckenHub",
    "rollWinkel",
    "fersenAb",
    "ballen",
    "knoechel",
]);
// DER SPRUNG DER LAGE IST KEIN LAUF (tetrapoda GANG_GESETZ.vMax, EINE Regel): das Tempo eines Leibs aus der Änderung
// seiner Lage in dt — über vMax (Spawn, Teleport, Peer-Schnapp, ein Ruf an einen fernen Ort) null. Leser: der Lauf des
// Leibs (`_kreaturLaufTakt`) und der Gang der Pfoten (`_animateTierBaum`).
AnazhRealm._lageTempo = function (dx, dz, dt) {
    const v = Math.hypot(dx, dz) / dt;
    return v <= globalThis.__tetrapodaCore.GANG_GESETZ.vMax ? v : null;
};
// Die Reichweite R der Bein-Kette (K07, EINE Schwelle — tetrapoda gangReich, dieselbe im Körper-Studio): an ihr führt
// tetrapoda gangBecken das Becken, an ihr hält die Fuß-IK den stehenden Fuß (`_gaitLegIK`, `_gaitLockBedarf`).
AnazhRealm._gaitReich = function (kette) {
    return globalThis.__tetrapodaCore.gangReich(kette);
};
// Der EINE Bewegungs-Block-Leser: luft (Beschleunigungs-/Brems-Kurven), sprung (Coyote-/Buffer-
// Fenster), schritt (Compound-Takt, Klang-Schwelle), gang (die Zweibeiner-Zeile des Gang-Gesetzes) aus fx.bewegung.<block>. Fail-closed: Block fehlt oder
// ein Pflicht-Feld (felder) nicht-finit → Bruch, nie Misch-Gesetz. Memo nur im Erfolgs-Fall.
AnazhRealm._bewegungsBlock = function (block, felder) {
    const memo = AnazhRealm._bewegungsBlockMemo || (AnazhRealm._bewegungsBlockMemo = Object.create(null));
    if (memo[block]) return memo[block];
    const g = AnazhRealm.Gesetz("koerper:bewegung." + block, null);
    if (g) {
        let ok = true;
        for (const k of felder) {
            if (!Number.isFinite(g[k])) {
                ok = false;
                break;
            }
        }
        if (ok) {
            memo[block] = g;
            return g;
        }
    }
    return AnazhRealm._kernPflichtBruch("koerper:bewegung." + block);
};
// Aktions-Ausdauer: die Kosten der Maus-Arm-Aktion (Hieb/Abbau/Platzieren) aus
// fx.bewegung.aktionAusdauer. Fail-closed (Kern-Pflicht).
AnazhRealm._aktionAusdauer = function () {
    const a = AnazhRealm.Gesetz("koerper:bewegung.aktionAusdauer", null);
    if (Number.isFinite(a)) return a;
    return AnazhRealm._kernPflichtBruch("koerper:bewegung.aktionAusdauer");
};
// LANDUNGS-GEFÜHL (Zensus-Rest V18.488) — DER EINE LANDUNGS-LESER: Aufprall-
// Dip + Kamera-Glättung wohnen im koerperstudio-Gesetzbuch
// (fx.bewegung.landung). Fail-closed (Kern-Pflicht) über _bewegungsBlock.
AnazhRealm._landungGesetz = function () {
    return AnazhRealm._bewegungsBlock("landung", ["dipProV", "dipMax", "minTempo", "erholK", "kameraK"]);
};
// Der EINE Timbre-Leser: das Material→Filter-Gesetz des Schritt-Klangs aus dem klang-Gesetzbuch
// (SCHRITT_TIMBRE); die Bewegungs-Schwelle wohnt getrennt im koerper-Gesetzbuch. Fail-closed; Memo
// nur im Erfolgs-Fall.
AnazhRealm._schrittTimbre = function () {
    if (AnazhRealm._schrittTimbreMemo) return AnazhRealm._schrittTimbreMemo;
    const t = AnazhRealm.Gesetz("klang:SCHRITT_TIMBRE", null);
    if (t && t.material && t.material.stein && typeof t.fallback === "string") {
        AnazhRealm._schrittTimbreMemo = t;
        return t;
    }
    return AnazhRealm._kernPflichtBruch("klang:SCHRITT_TIMBRE");
};
// Der EINE Umwelt-Klang-Leser (Welle 5 Klang): das Klang-Gesetz der Welt (UMWELT: Stimmen · Ohr · Tier · Orte) und
// die reinen Funktionen des Gesetzbuchs (Mischung · Graph · Tier-Ruf). Fail-closed: ein alter Kern ist ein Bruch,
// nie eine stille Ersatz-Welt. Memo nur im Erfolgs-Fall.
AnazhRealm._umweltGesetz = function () {
    if (AnazhRealm._umweltGesetzMemo) return AnazhRealm._umweltGesetzMemo;
    const U = AnazhRealm.Gesetz("klang:UMWELT", null);
    const kern = AnazhRealm.Gesetz("klang:umweltGraph", null) ? globalThis.__klangCore : null;
    if (
        U &&
        U.stimmen &&
        U.ohr &&
        U.tier &&
        Number.isFinite(U.masterBasis) &&
        Number.isFinite(U.hoerschwelleDb) &&
        Array.isArray(U.ohr.radien) &&
        U.spitze &&
        Number.isFinite(U.spitze.linearBisDb) &&
        Number.isFinite(U.spitze.deckeDb) &&
        kern &&
        kern.umweltMischung &&
        kern.umweltGraph &&
        kern.umweltSpitze &&
        kern.umweltPaket &&
        kern.tierRufPuffer &&
        kern.tierRufSpielen &&
        kern.tierRufPegel &&
        kern.substanzKlang &&
        kern.SUBSTANZ &&
        kern.fahrtStimme &&
        kern.fahrtMischung &&
        kern.FAHRT
    ) {
        AnazhRealm._umweltGesetzMemo = { UMWELT: U, kern };
        return AnazhRealm._umweltGesetzMemo;
    }
    return AnazhRealm._kernPflichtBruch("klang:UMWELT");
};
// Der EINE Verhaltens-Gesetz-Leser: die Verhaltens-Zahlen der Welt-Wesen (jagd = Witterung/Biss ·
// furcht = Wariness/Flucht · temperament = Signaturen/Floor/Gegenwehr · wandern = Leine/Schlendern)
// aus dem tetrapoda-Gesetzbuch (VERHALTEN). Fail-closed: die Gültigkeits-Wand deckt je Block ein
// Feld — alter Kern → Bruch, nie Misch-Gesetz. Memo nur im Erfolgs-Fall.
AnazhRealm._verhaltenGesetz = function () {
    if (AnazhRealm._verhaltenGesetzMemo) return AnazhRealm._verhaltenGesetzMemo;
    try {
        const v = AnazhRealm.Gesetz("tetrapoda:VERHALTEN", null);
        if (
            v &&
            v.jagd &&
            Number.isFinite(v.jagd.strikeCooldownSec) &&
            v.furcht &&
            Number.isFinite(v.furcht.fleeThreshold) &&
            v.temperament &&
            v.temperament.profile &&
            // DAS TEMPERAMENT DER GATTUNG (Welle LF, Vertrags-Akt 08.10.): die Gattungs-Zeile und der Mut der Natur
            // (die Substanz-Signaturen und ihr Floor fielen).
            v.temperament.gattung &&
            Number.isFinite(v.temperament.gattung.jagdKg) &&
            Number.isFinite(v.furcht.mutGewicht) &&
            v.wandern &&
            Number.isFinite(v.wandern.leashBaseM) &&
            // SCHLUSS-WELLE (17.07.) — die neun heimgekehrten Blöcke sind
            // Kern-Pflicht: je Block deckt EIN Feld (alter Kern → Bruch,
            // nie ein Misch-Gesetz aus neuem Leser + fehlender Zeile).
            Number.isFinite(v.jagd.hetzM) &&
            Number.isFinite(v.jagd.pirschSichtM) &&
            Number.isFinite(v.jagd.beuteMasse) &&
            v.stimmung &&
            v.stimmung.schwellen &&
            Number.isFinite(v.stimmung.schwellen.weideDiet) &&
            v.freude &&
            Number.isFinite(v.freude.tempoMul) &&
            Number.isFinite(v.freude.hopHochM) &&
            Number.isFinite(v.freude.hopBasisM) &&
            Array.isArray(v.groessen) &&
            v.groessen.length >= 2 &&
            v.separation &&
            Number.isFinite(v.separation.raumKugel) &&
            v.aufgaben &&
            Number.isFinite(v.aufgaben.followTempo) &&
            v.herde &&
            Number.isFinite(v.herde.fensterRaum) &&
            Number.isFinite(v.herde.gewicht) &&
            v.wasser &&
            Number.isFinite(v.wasser.uferBias)
        ) {
            AnazhRealm._verhaltenGesetzMemo = v;
            return v;
        }
    } catch (_e) {}
    return AnazhRealm._kernPflichtBruch("tetrapoda:VERHALTEN");
};
// Die Schwere des Hüpfers: das g des Gang-Gesetzes (tetrapoda GANG_GESETZ.g) — der Abflug ist v0 = √(2·g·h), der Flug
// die Parabel (updateCreatures integriert sie auf dem Takt). Fail-closed wie jedes Kern-Gesetz.
AnazhRealm._hopSchwere = function () {
    const g = AnazhRealm.Gesetz("tetrapoda:GANG_GESETZ.g", null);
    return Number.isFinite(g) && g > 0 ? g : AnazhRealm._kernPflichtBruch("tetrapoda:GANG_GESETZ.g");
};
// DAS STEUER-GESETZ (tetrapoda STEUER_GESETZ + steuerSchritt · tempoEinheit · ankunftTempo · herdeZug, Welle L): der EINE
// Steuer-Schritt je Tier und Takt, das Ankunfts-Gesetz, die Tempo-Einheit √(g·L) und die Herden-Form; dazu das Temperament
// der Gattung (temperamentDerGattung, Welle LF). Fail-closed.
AnazhRealm._steuerGesetz = function () {
    if (AnazhRealm._steuerGesetzMemo) return AnazhRealm._steuerGesetzMemo;
    const S = AnazhRealm.Gesetz("tetrapoda:STEUER_GESETZ", null);
    const k = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    if (
        S &&
        Number.isFinite(S.tempo) &&
        Number.isFinite(S.wende) &&
        k &&
        typeof k.steuerSchritt === "function" &&
        typeof k.tempoEinheit === "function" &&
        typeof k.ankunftTempo === "function" &&
        typeof k.herdeZug === "function" &&
        typeof k.temperamentDerGattung === "function" &&
        Number.isFinite(S.sprint) &&
        typeof k.sprintTempo === "function"
    ) {
        AnazhRealm._steuerGesetzMemo = k;
        return k;
    }
    return AnazhRealm._kernPflichtBruch("tetrapoda:STEUER_GESETZ");
};
AnazhRealm.STAT_FROM_TAGS = Object.freeze({
    // hpMax/damage/knockback/defense lesen ihre Koeffizienten via _kampfKoeff aus dem Gesetzbuch
    // (fx.kampf): der Lab-Wert IST der Welt-Wert.
    hpMax: (t) => {
        const K = AnazhRealm._kampfKoeff("hpMax");
        return K.base + (t.dichte || 0) * K.dichte + (t.härte || 0) * K.haerte;
    },
    damage: (t) => {
        const K = AnazhRealm._kampfKoeff("damage");
        return K.base + (t.dichte || 0) * K.dichte + (t.härte || 0) * K.haerte;
    },
    // Kampf-Stats emergieren aus der Substanz (Base + Tag·Gewicht): knockback ∝ dichte + härte (Masse
    // stößt zurück); attackSpeed ∝ (1−dichte) + magieleitung → schwere Keule langsam-wuchtig, leichte
    // Klinge schnell.
    knockback: (t) => {
        const K = AnazhRealm._kampfKoeff("knockback");
        return K.base + (t.dichte || 0) * K.dichte + (t.härte || 0) * K.haerte;
    },
    attackSpeed: (t) => 0.8 + (1 - (t.dichte || 0)) * 0.7 + (t.magieleitung || 0) * 0.3,
    // speed/jumpPower/staminaMax lesen ihre Koeffizienten via _bewegungsKoeff aus dem Gesetzbuch
    // (fx.bewegung): der Lab-Wert IST der Welt-Wert.
    speed: (t) => {
        const K = AnazhRealm._bewegungsKoeff("speed");
        return K.base + (1 - (t.dichte || 0)) * K.leicht + (t.magieleitung || 0) * K.mag;
    },
    jumpPower: (t) => {
        const K = AnazhRealm._bewegungsKoeff("jumpPower");
        return K.base + (1 - (t.dichte || 0)) * K.leicht + (t.magieleitung || 0) * K.mag;
    },
    staminaMax: (t) => {
        const K = AnazhRealm._bewegungsKoeff("staminaMax");
        return K.base + (1 - (t.dichte || 0)) * K.leicht + (t.wärmeleitung || 0) * K.mag;
    },
    // Mana = zweite Ausdauer-Achse, aus magieleitung statt (1−dichte): 50 + magieleitung·100 +
    // resoniert·30 (Mensch 50, Drache ~80, Phönix ~119).
    manaMax: (t) => 50 + (t.magieleitung || 0) * 100 + (t.resoniert || 0) * 30,
    precision: (t) => 0.5 + (t.magieleitung || 0) * 0.3 + (t.zähigkeit || 0) * 0.2,
    magicResist: (t) => (t.magieleitung || 0) * 0.4 + (t.resoniert || 0) * 0.3,
    heatResist: (t) => (t.wärmeleitung || 0) * 0.5 - (t.brennbar || 0) * 0.3,
    // defense (physisch) ∝ dichte + härte; ergänzt magicResist/heatResist zum Defense-Trio, base-los
    // (ein weiches Wesen blockt ~0). Konsum: die Rüstung dämpft, dealt = roh² / (roh + defense) (_ruestungDaempft).
    defense: (t) => {
        const K = AnazhRealm._kampfKoeff("defense");
        return K.base + (t.dichte || 0) * K.dichte + (t.härte || 0) * K.haerte;
    },
});

// SYNERGIE-WELLE — die AURA_TAG_HUE-Map ist mit der Avatar-Aura GEFALLEN
// (Schoepfer: keine Avatar-Aura im Nervensystem; die Tag-Achsen sprechen
// weiter durch Substanz/Resonanz/Werkstatt-Chips — nicht durch einen Glow).

// Stat-Stacking: Compound-Tags ausgerüsteter Werkzeuge/Rüstung/Waffen werden zur Soul-Tag-Basis
// addiert, dann läuft STAT_FROM_TAGS (Rüstung spürbar, Werkzeug leicht, Waffe/gehaltenes Gerät
// stark). Die Gewichte wohnen im Gesetzbuch (koerper:kampf.fold via _kampfFold, fail-closed); die
// Statics sind nur Leser.
Object.defineProperties(AnazhRealm, {
    ARMOR_STAT_WEIGHT: {
        get() {
            return AnazhRealm._kampfFold().armor;
        },
    },
    TOOL_STAT_WEIGHT: {
        get() {
            return AnazhRealm._kampfFold().tool;
        },
    },
    WEAPON_STAT_WEIGHT: {
        get() {
            return AnazhRealm._kampfFold().weapon;
        },
    },
    HELD_STAT_WEIGHT: {
        get() {
            return AnazhRealm._kampfFold().held;
        },
    },
});
// Das gehaltene Gerät sichtbar in der Hand: _buildFromBlueprint (kein Parallel-Pfad) → Mesh am
// rechten Arm/Flügel (schwingt über die THREE-Transform-Kette mit), sonst an der Körper-Wurzel.
// Pose/Skala/Sitz sind browser-justierbar; headless beweist nur Existenz + Lifecycle + Anker.
AnazhRealm.HELD_MESH = Object.freeze({
    targetSpanM: 0.62, // die längste Dimension des Geräts in der Hand (auf Werkzeug-Größe skaliert)
    minScale: 0.04,
    maxScale: 3,
    handOffset: Object.freeze({ x: 0, y: -0.5, z: 0.12 }), // im Arm-Anker-Lokalraum (Handfläche/-spitze)
    rootOffset: Object.freeze({ x: 0.42, y: 0.9, z: 0.32 }), // Fallback: vorn-rechts an der Körper-Wurzel
    tilt: Object.freeze({ x: 0.5, y: 0, z: 0 }), // ein leichter Vorwärts-Neigung (ein langes Werkzeug zeigt nach vorn/unten)
    // DIE FAUST (W5) — das Studio-Gerät im Handgelenk des Studio-Menschen (−y zu den Fingern, +z Daumenseite): die
    // Griff-Mitte sitzt in der Hand-Mitte, die die Hand selbst trägt (rig.handMitte je Handgelenk, Ofen-Beipack); die
    // Griff-Achse zeigt nach vorn und `neigung` unter die Waagrechte (der entspannte Arm: das Langschwert-Ende über dem
    // Boden statt im Boden).
    neigung: 0.44,
});
// ═══ KAMPF-GEFÜHL — DIE GESETZE DES SCHWUNGS ═══
// Die EINE Schwung-Dauer-Quelle ist die gerechnete Trägheit (_swingDynamics: I = Σ m·r² um den
// Griff), Dauer = dauerProSqrtI·√I, geklemmt; Cooldown/HUD/Werkstatt lesen sie (Kreaturen behalten
// ihr tag-emergentes attackSpeed). Dauer, Hieb-Geometrie, Reichweite, Stoß/Hit-Stop/Dip und
// Pfeil-Flug-Physik wohnen im schmiede-Gesetzbuch (ARENA.schwung/.gefuehl/.bogen/.guete) — alle
// Konsumenten lesen _arenaGesetz(), fail-closed. Die Mechanik hält gate:kampf-gefuehl.
// maxPfeile ist Wirts-Infrastruktur (Perf-Deckel lebender Pfeile), kein Gefühls-Gesetz:
AnazhRealm.MAX_PFEILE = 16;
// Der Treffer-Weg (_kampfTrefferWeg) tastet jede Glied-Kapsel in so vielen Schritten ab — Wirts-Auflösung, kein Gefühls-
// Gesetz; je Treffer, nie je Frame.
AnazhRealm.TREFFER_WEG_PROBEN = 6;
// Die Optik des EINEN Schwungs (_kampfSchwungLage, _applyKampfSchwungPose) — Wirts-Pose, keine Treffer-Größe: im Windup hebt
// der Arm die Klinge um KAMPF_AUSHOLEN_RAD über die Neigung des Strikes (an dessen Anfang wieder 0), der Rumpf folgt der Gier
// des Bogens mit diesem Anteil.
AnazhRealm.KAMPF_AUSHOLEN_RAD = 0.5;
AnazhRealm.KAMPF_RUMPF_DREH = 0.4;
// Die Beuge des Rumpfs beim Schlag nach unten (_kampfBeuge): je rad Neigung unter der Schulter KAMPF_BEUGE_K rad, höchstens
// KAMPF_BEUGE_MAX (34°) — der Schwertkämpfer beugt sich zum tiefen Ziel; Pose und Treffer-Volumen beugen gleich.
AnazhRealm.KAMPF_BEUGE_K = 0.6;
AnazhRealm.KAMPF_BEUGE_MAX = 0.6;
// Der Ausfall des Hiebs (_kampfSchulter, die Hülle des Leibs in der Pose): der Leib tritt im Strike so weit nach vorn — ein
// halber Schritt. Die Reichweite einer Klinge ist Ausfall + Arm + Klinge vor der Hand (Langschwert 2,1 m ab der Schulter).
AnazhRealm.KAMPF_AUSFALL_M = 0.45;
// Der Abstand zweier Lagen, aus denen das Tempo eines Klingen-Punkts fällt (_kampfSchlagTempo) — Wirts-Auflösung.
AnazhRealm.KAMPF_TEMPO_DT = 0.002;
// Die Züge, in denen die Pose Schulter und Handgelenk auf die Achse der Klinge legt (_applyKampfSchwungPose) — Wirts-Auflösung.
AnazhRealm.KAMPF_POSE_ZUEGE = 3;
// Wie nah die Klinge am Punkt unter dem Fadenkreuz vorbeigehen muss, damit er getroffen ist (_kampfKlingenKontakt) — über den
// Klingen-Radius hinaus die halbe Strecke eines Teil-Schritts.
AnazhRealm.KAMPF_ZIEL_SPIEL_M = 0.04;
// Die Stetigkeit des Sweeps (_kampfSweepTick): je Teil-Schritt läuft die Spitze der Klinge höchstens so weit — unter dem
// Durchmesser des dünnsten Glieds samt Klingen-Radius, kein Glied fällt zwischen zwei Schritte. Wirts-Auflösung.
AnazhRealm.KAMPF_SWEEP_SCHRITT_M = 0.08;
// Die Weite des Fadenkreuz-Punkts (_blickZiel): der Pfeil zielt auf den Welt-Treffer des Blicks bis hierhin, dahinter
// auf den Punkt in dieser Weite (die Parallaxe Mündung ↔ Auge fällt dort unter 0,3°).
AnazhRealm.BLICK_ZIEL_M = 80;
// Die Angriffs-Größen, in die das gehaltene Gerät faltet (computePlayerStats, K-D15): Schaden, Rückschlag, Tempo,
// Präzision — nie Schutz, Leben, Ausdauer oder Gang.
AnazhRealm.HELD_ANGRIFF_STATS = Object.freeze(["damage", "knockback", "attackSpeed", "precision"]);
// ═══ ARENA-GEFÜHL — DER EINE GEFÜHLS-LESER ═══
// Schwung-Konstanten · energie-skalierter Hit-Stop/Dip · die EINE Bogen-Physik + Auszug ·
// Waffen-Güte aus __schmiedeCore.ARENA. Fail-closed; Memo nur im Erfolgs-Fall.
AnazhRealm._arenaGesetz = function () {
    if (AnazhRealm._arenaGesetzMemo) return AnazhRealm._arenaGesetzMemo;
    const a = AnazhRealm.Gesetz("schmiede:ARENA", null);
    // Die Gültigkeits-Wand deckt je Block EIN Zensus-Feld mit: ein ALTER
    // Kern ohne die gereisten Zeilen ist ein BRUCH, nie ein Misch-Gesetz
    // aus halb Kern / halb undefined.
    if (
        a &&
        a.schwung &&
        a.gefuehl &&
        a.bogen &&
        Number.isFinite(a.schwung.dauerProSqrtI) &&
        Number.isFinite(a.schwung.windupFrac) &&
        Number.isFinite(a.schwung.zielKegelUntenRad) &&
        Number.isFinite(a.gefuehl.wucht) &&
        Number.isFinite(a.gefuehl.pProKb) &&
        Number.isFinite(a.bogen.muendungM)
    ) {
        AnazhRealm._arenaGesetzMemo = a;
        return a;
    }
    return AnazhRealm._kernPflichtBruch("schmiede:ARENA");
};

// DAS EINE IMPULS-GESETZ (0710-2: der Stoß der Fahrt und der Rückstoß des Kampfs, K-D9): jeder Stoß zweier Körper —
// Wagen an Fels, Wagen an Wagen, Wagen an Tier, Klinge und Pfeil am Tier — tauscht Impuls längs der Stoß-Normalen,
// J = (1 + e) · v_rel / (1/mA + 1/mB) (ein starrer Gegner: 1/mB = 0), mit der Stoß-Zahl e des Paars. Die Masse kommt
// aus dem Leib (Tier und Mensch: das Volumen der geschlossenen Haut mal der Dichte des Kerns, `_leibMasse`) und aus dem
// Kern (der Wagen: carPhys-Volumen mal FAHR.masseDichte, `_fahrMasse`; der Schlag: die wirksame Masse des
// Schmiede-Urteils). Was ein Leib an Geschwindigkeit bekommt, trägt ihn im festen Sim-Schritt, bis die Reibung am Boden
// sie aufzehrt (`_kreaturStossSchritt`, der Weg gegen die EINE Hülle) — der Bär rutscht wenig, der Fuchs fliegt; ein
// gestoßener Wagen rutscht mit der Handbremse (`_fahrNachlauf`). Vorher stand der Wagen in EINEM Frame
// (Leben-Schau 07.10.: Baum 10,41 → 0,16, GT 11,28 → 0,00, Bär 9,27 → 0,17 m/s), und jeder Treffer versetzte jedes
// Ziel 2,16 m (eine Kappe, kein Gesetz).
AnazhRealm.STOSS = Object.freeze({
    stossZahl: Object.freeze({ starr: 0.2, wagen: 0.3, leib: 0.1 }), // Fels/Bauwerk/Baum · Wagen an Wagen · Leib
    reibungLeib: 0.6, // μ des gleitenden Leibs am Boden: er verzögert mit μ·g
    ruheMs: 0.05, // m/s: darunter ruht der Stoß
    ereignisMs: 1, // m/s Aufprall-Geschwindigkeit, ab der ein Stoß Kamera und Klang erreicht
    ruckRefMs: 8, // m/s Sprung der eigenen Fahrt, bei dem der Kamera-Ruck (der Landungs-Dip) voll ist
});
// DIE MASSE KOMMT AUS DEM KERN (0710-4): der Wirt hält keine Dichte. Tier · Mensch · Wagen tragen ihre Dichte in ihrem
// Gesetzbuch (tetrapoda MASSSTAB.dichteKgM3 · koerper LEIB.dichteKgM3 · vehicle FAHR.masseDichte), das Volumen ist ihre
// Gestalt (`_leibVolumen` der geschlossenen Haut, carPhys des Wagens). Bis 0710-4 hielt STOSS zwei Studio-Größen
// (dichteLeib 1000 über eine Kapsel aus der Hüft-Höhe — der Hirsch wog 436 kg, der Bär 255 —, dichteWagen 150).
AnazhRealm.LEIB_KLASSEN = Object.freeze(["fell", "haut"]); // die Material-Klassen der geschlossenen Haut eines Leibs
// die Gänge des EINEN Leib-Lösers je Sim-Schritt (`_leibKontakte`): eine Klemme in der dichten Schar löst sich in wenigen
AnazhRealm.LEIB_GAENGE = 8;
AnazhRealm._leibGesetz = function () {
    if (AnazhRealm._leibGesetzMemo) return AnazhRealm._leibGesetzMemo;
    const T = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const K = typeof globalThis !== "undefined" ? globalThis.__koerperCore : null;
    const tier = T && T.MASSSTAB ? T.MASSSTAB.dichteKgM3 : NaN;
    const mensch = K && K.LEIB ? K.LEIB.dichteKgM3 : NaN;
    if (!(tier > 0)) return AnazhRealm._kernPflichtBruch("tetrapoda:MASSSTAB.dichteKgM3");
    if (!(mensch > 0)) return AnazhRealm._kernPflichtBruch("koerper:LEIB.dichteKgM3");
    AnazhRealm._leibGesetzMemo = Object.freeze({ tier, mensch });
    return AnazhRealm._leibGesetzMemo;
};
// DER BISS ALS STOSS (0710-4): der Anteil der Jäger-Masse hinter dem Biss (tetrapoda BISS.masseAnteil) und das Tempo
// des Ansprungs (VERHALTEN.aktionen.pounce.tempo, in der Tempo-Einheit des Steuer-Gesetzes). DER BISS IST DER ANSPRUNG
// (Welle LF kampf, Posten 5): seine Geste ist die Aktion pounce — ihre Dauer und ihr Tempo sind die Reichweite des Mauls
// (_kreaturBissReich). Fail-closed.
AnazhRealm._bissGesetz = function () {
    if (AnazhRealm._bissGesetzMemo) return AnazhRealm._bissGesetzMemo;
    const T = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const anteil = T && T.BISS ? T.BISS.masseAnteil : NaN;
    const VG = AnazhRealm._verhaltenGesetz();
    const pounce = VG && VG.aktionen && VG.aktionen.pounce;
    if (!(anteil > 0 && anteil <= 1)) return AnazhRealm._kernPflichtBruch("tetrapoda:BISS.masseAnteil");
    if (!pounce || !(pounce.tempo > 0))
        return AnazhRealm._kernPflichtBruch("tetrapoda:VERHALTEN.aktionen.pounce.tempo");
    if (!(pounce.dauer > 0)) return AnazhRealm._kernPflichtBruch("tetrapoda:VERHALTEN.aktionen.pounce.dauer");
    const kopf = T && T.BISS ? T.BISS.kopfNeigung : null;
    if (!(Array.isArray(kopf) && kopf.length === 2 && kopf[0] < 0 && kopf[1] > 0))
        return AnazhRealm._kernPflichtBruch("tetrapoda:BISS.kopfNeigung");
    const rumpf = T && T.BISS ? T.BISS.rumpfNeigung : NaN;
    if (!(rumpf > 0)) return AnazhRealm._kernPflichtBruch("tetrapoda:BISS.rumpfNeigung");
    AnazhRealm._bissGesetzMemo = Object.freeze({
        masseAnteil: anteil,
        tempo: pounce.tempo,
        dauer: pounce.dauer,
        geste: pounce,
        kopfNeigung: kopf,
        rumpfNeigung: rumpf,
    });
    return AnazhRealm._bissGesetzMemo;
};
// DIE KAMPF-GRÖSSE DES LEIBS (Welle LF, Posten 6): die Bezugs-Masse und die Exponenten von Biss, Haut und Leben aus dem
// tetrapoda-Gesetzbuch (KAMPF) — der EINE Leser (computeCreatureStats). Fail-closed.
AnazhRealm._kampfGroesseGesetz = function () {
    if (AnazhRealm._kampfGroesseMemo) return AnazhRealm._kampfGroesseMemo;
    const T = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const K = T && T.KAMPF;
    if (!K || !(K.refKg > 0) || ![K.biss, K.haut, K.leben].every((x) => Number.isFinite(x) && x >= 0))
        return AnazhRealm._kernPflichtBruch("tetrapoda:KAMPF");
    AnazhRealm._kampfGroesseMemo = Object.freeze({ refKg: K.refKg, biss: K.biss, haut: K.haut, leben: K.leben });
    return AnazhRealm._kampfGroesseMemo;
};
// Das Volumen einer GESCHLOSSENEN Fläche (m³ im Rahmen ihrer Geometrie) über den Divergenz-Satz, Σ a · (b × c) / 6 je
// Dreieck — und ob sie geschlossen ist (jede Kante gerade oft: die glatte Vereinigung der Haut teilt manche Kante mit vier
// Dreiecken, dicht ist sie trotzdem). Eine offene Fläche (Mähne, Strähnen) hat kein Volumen.
AnazhRealm._geschlossenesVolumen = function (geo) {
    const pos = geo && geo.attributes && geo.attributes.position;
    if (!pos) return { v: 0, geschlossen: false };
    const p = pos.array;
    const ix = geo.index ? geo.index.array : null;
    const n = ix ? ix.length : pos.count;
    const N = pos.count;
    const kanten = new Map();
    let v = 0;
    for (let t = 0; t + 2 < n; t += 3) {
        const a = ix ? ix[t] : t;
        const b = ix ? ix[t + 1] : t + 1;
        const c = ix ? ix[t + 2] : t + 2;
        const ax = p[3 * a];
        const ay = p[3 * a + 1];
        const az = p[3 * a + 2];
        const bx = p[3 * b];
        const by = p[3 * b + 1];
        const bz = p[3 * b + 2];
        const cx = p[3 * c];
        const cy = p[3 * c + 1];
        const cz = p[3 * c + 2];
        v += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
        for (let k = 0; k < 3; k++) {
            const u = k === 0 ? a : k === 1 ? b : c;
            const w = k === 0 ? b : k === 1 ? c : a;
            const key = u < w ? u * N + w : w * N + u;
            kanten.set(key, (kanten.get(key) || 0) + 1);
        }
    }
    let geschlossen = kanten.size > 0;
    for (const z of kanten.values())
        if (z % 2) {
            geschlossen = false;
            break;
        }
    return { v: Math.abs(v), geschlossen };
};
// DAS VOLUMEN EINER GESTALT (m³ im Rahmen `rahmen`): die geschlossene Haut (LEIB_KLASSEN) unter `teil` — die Nah-Gestalt,
// nie die Fern-Gestalt daneben. Offene Teile und der Schalen-Stapel des Fells (`fellSchale`: N Kopien der Haut) tragen
// keine Masse. Je Geometrie gemerkt (jede Kreatur teilt die Geometrien ihrer Vorlage). Gemessen bei Größe 1: Fuchs 0,015 ·
// Wolf 0,064 · Hirsch 0,094 · Bär 0,335 · Mensch 0,100 m³.
AnazhRealm._leibVolumen = function (teil, rahmen) {
    if (!teil || typeof THREE === "undefined") return 0;
    const memo = AnazhRealm._leibVolumenMemo || (AnazhRealm._leibVolumenMemo = new WeakMap());
    const r = rahmen || teil;
    r.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(r.matrixWorld).invert();
    const m = new THREE.Matrix4();
    let v = 0;
    teil.traverse((o) => {
        if (!o.isMesh || !o.geometry) return;
        const kl = o.material && o.material.userData ? o.material.userData.foundryKind : null;
        if (!AnazhRealm.LEIB_KLASSEN.includes(kl)) return;
        let g = memo.get(o.geometry);
        if (!g) {
            g = AnazhRealm._geschlossenesVolumen(o.geometry);
            memo.set(o.geometry, g);
        }
        if (!g.geschlossen) return;
        m.multiplyMatrices(inv, o.matrixWorld);
        v += g.v * Math.abs(m.determinant());
    });
    return v;
};
// Die nächsten Punkte zweier Strecken AB und CD in der Ebene (x, z): P auf AB, Q auf CD und ihr Abstand d (`out`).
AnazhRealm._streckenNah2D = function (ax, az, bx, bz, cx, cz, dx, dz, out) {
    const ux = bx - ax;
    const uz = bz - az;
    const vx = dx - cx;
    const vz = dz - cz;
    const wx = ax - cx;
    const wz = az - cz;
    const a = ux * ux + uz * uz;
    const b = ux * vx + uz * vz;
    const c = vx * vx + vz * vz;
    const d = ux * wx + uz * wz;
    const e = vx * wx + vz * wz;
    const nenner = a * c - b * b;
    let s = 0;
    let t = 0;
    if (a <= 1e-12 && c <= 1e-12) {
        s = 0;
        t = 0;
    } else if (a <= 1e-12) {
        t = Math.max(0, Math.min(1, e / c));
    } else if (c <= 1e-12) {
        s = Math.max(0, Math.min(1, -d / a));
    } else {
        s = nenner > 1e-12 ? Math.max(0, Math.min(1, (b * e - c * d) / nenner)) : 0;
        t = (b * s + e) / c;
        if (t < 0) {
            t = 0;
            s = Math.max(0, Math.min(1, -d / a));
        } else if (t > 1) {
            t = 1;
            s = Math.max(0, Math.min(1, (b - d) / a));
        }
    }
    out.px = ax + ux * s;
    out.pz = az + uz * s;
    out.qx = cx + vx * t;
    out.qz = cz + vz * t;
    out.d = Math.hypot(out.qx - out.px, out.qz - out.pz);
    return out;
};
// J längs der Normalen (A → B) bei schließender Geschwindigkeit vRel > 0; mB = Infinity für einen starren Gegner.
AnazhRealm._stossImpuls = function (mA, mB, vRel, e) {
    if (!(vRel > 0) || !(mA > 0) || !(mB > 0)) return 0;
    return ((1 + e) * vRel) / (1 / mA + (Number.isFinite(mB) ? 1 / mB : 0));
};

// Werkzeug-Anwendung kostet Stamina: ohne Kosten ließe sich Präzision durch unbegrenzte
// Polier-Schritte hochziehen (0.7^N → max) — Geduld als echte Kosten.
AnazhRealm.TOOL_OP_STAMINA_COST = 10;
AnazhRealm.STAMINA_REGEN_PER_SEC = 5;
// V18.196 — MANA-Symmetrie (zweite Ausdauer-Achse). Langsamer als Stamina
// weil Mana mächtiger ist; magieleitung im Spieler-Compound boostet die
// Rate emergent (effektiv = base × (1 + magieleitung)). Erst-Wurf-Tuning.
AnazhRealm.MANA_REGEN_PER_SEC = 3;
// phaseChange-Ops (imbue/soulwork) sind MAGIE → kosten Mana statt Stamina (subtractive/plastic/
// additive = Mühe). Floor 5, Präzisions-Skalierung wie TOOL_OP_STAMINA_COST; schöpfer-Modus frei via
// _drainMana-Mode-Gate.
AnazhRealm.TOOL_OP_MANA_COST = 15;

// Material-Strata: ab dieser Tiefe (m) unter der Oberfläche dominiert stein, auch wenn eine andere
// Achse gewänne. Wirkt NUR bei Aufrufern mit y-Argument (Aufrufe ohne y unverändert).
AnazhRealm.STRATA_STEIN_DEPTH = 12;

// Totholz: Wahrscheinlichkeit eines `stamm_gefallen`-Sub-Spawns nach einem Baum-Spawn
// (~10 % = bewohnter Wald ohne Dichte-Verdünnung).
AnazhRealm.TOTHOLZ_RATE = 0.1;

// Varianten PRO SPEZIES im gefrorenen Welt-Pool: jede Variante ist eine eigene Geometrie → eigene
// InstancedMesh-Gruppe → eigene Draw-Calls (× Leaf-Gruppen × LODs). Die Vielfalt trägt die
// Pro-Instanz-Variation (scale/rotationY/HSV-Tint, `_scatterInstanceAdd`/`_archInstanceAdd`) — 3
// Basis-Formen genügen. Der (hash>>>24)%N-Pick bleibt bei N=3 gleichverteilt (hohe fnv-1a-Bits).
// Pool-Aufstellung lazy, kein Welt-Reset nötig.
AnazhRealm.VARIANTS_PER_SPECIES = 3;
// wahrerwuchs §4.2-4.4 S3+S4 — die Zahl der Genom-gewürfelten Landmark-Formationen
// (Fels: Brocken/Stapel/Nadel/Geröll · Kristall: Einzel/Cluster/Geode/Druse), die der Scatter NACH dem
// Affinitäts-Sieg wählt. Die Glut streut ohne Pool: ihre Gestalten trägt das Gesetzbuch (fachwerk `feuerstelle`).
AnazhRealm.ROCK_VARIANTS = 12;
AnazhRealm.CRYSTAL_VARIANTS = 8;
// Die Landmark-Pool-Karte: Sieger-Name → { Pool-Präfix, Zahl }. Der Scatter würfelt
// REGION-deterministisch einen `<prefix>_var<idx>` aus dem passenden Pool (tag-frozen
// zum Wahrzeichen → kein Affinitäts-Shift, V17.17).
AnazhRealm.SCATTER_VARIANT_POOL = Object.freeze({
    stein_block: Object.freeze({ prefix: "fels", n: 12 }),
    kristall_geode: Object.freeze({ prefix: "kristall", n: 8 }),
});
// DER BAUPLAN-UMZUG — gefallene Baupläne, deren Einträge in gespeicherten Welten stehen, und ihr Erbe: der Restore
// (`_loadStateRestoreArchitectures`) liest ihn, bevor er spawnt. Die sechs Glut-Formationen (`glut_var0..5`, das
// Glut-Genom bis 05.10.) leben als die EINE Feuerstelle weiter (`glutbrunnen`, Gestalt aus dem Gesetzbuch).
AnazhRealm.BAUPLAN_UMZUG = Object.freeze({
    glut_var0: "glutbrunnen",
    glut_var1: "glutbrunnen",
    glut_var2: "glutbrunnen",
    glut_var3: "glutbrunnen",
    glut_var4: "glutbrunnen",
    glut_var5: "glutbrunnen",
});
// Welche Formations-FORM ist aufragend? `_landmarkVariantIdx` wählt sie an steilem Terrain, die
// gedrungenen am flachen Land. `_formClass` jeder Pool-Variante kommt aus ihrem Genom-Roll
// (Fels: Brocken/Stapel/Nadel/Geröll · Kristall: Einzel/Cluster/Geode/Druse).
AnazhRealm.LANDMARK_TALL_FORMS = Object.freeze({
    fels: Object.freeze(["nadel", "stapel"]),
    kristall: Object.freeze(["druse", "einzel"]),
});
AnazhRealm.LANDMARK_SLOPE_TALL = 0.32; // ab dieser Hangneigung (m/m) bevorzugt der Scatter aufragende Formen

// LOD_DISTANCES (unten) — gelesen von `_chooseLODForDistance`/`_tickArchitectureLOD`: <thresh01 = L0
// volle Geometrie · bis thresh12 = L1 · darüber L2 Studio-Billboard; `hysteresis` gegen Flackern.
// Die Defaults matchen PORTAL_RENDER_CONFIG.lod (headless == live); bewusst NICHT frozen —
// `_foundryIngestRenderConfig` schreibt die live gelesenen Studio-Werte hinein (reines Render,
// determinismus-sicher). Screen-Space-Error: `lodRef` (die EINE uLodRef-Quelle) skaliert die Distanz
// mit min(lodRef/visHeight, 1) — ein großer Baum schaltet später, ein kleiner nie früher;
// `perfDistMulMax` = max. Distanz-Multiplikator unter Last (der EINE Regler `_foliageDensityScale`);
// beides via `_lodPerceptionDistance`.
// Die Ziegel-Schlange ordnet nach Bedarf: ein Bau, dessen Mesh in der Mesh-Zone schon steht, reiht sich um diese
// Distanz² HINTER jeden Bedürftigen (nahe Bauten ohne Mesh · ferne Bauten) — sein Feld-Satz wird nur vorgebacken.
AnazhRealm.ZIEGEL_VORBACK_D2 = 1e12;
// DIE OKTAVE DER LAUB-FARBE (K20): der EINE Leser des Blatt-Atlas (`_blattAtlasProbe`) liest die Farbe so viele Mip-Stufen
// über der Stufe der Deckung — 2 = kein Farb-Detail unter vier Pixeln (Eiche 25 m, nur L1: Δ-Luma 3,41 → 2,62).
AnazhRealm.BLATT_FARBE_OKTAVE = 2;

AnazhRealm.LOD_DISTANCES = {
    thresh01: 12, // Studio LOD_D0 — dist > 12 m → LOD1 (Default == Post-Ingest, headless == live)
    thresh12: 26, // Studio LOD_D1 — dist > 26 m → LOD2/Impostor (Studio-Billboard-Grenze)
    hysteresis: 3.4, // Studio-Membership-Hysterese M (± Pufferzone gegen Flackern)
    lodRef: 12, // Studio uLodRef — Referenz-Sichthöhe (Screen-Space-Error-Bezug); die EINE uLodRef-Quelle (CPU+Shader)
    perfDistMulMax: 1.3, // max. Distanz-Multiplikator unter voller Last (AnazhRealm-Perf-Hebel, kein Vorlagen-Wert)
    visStretchMax: Infinity, // AUSLÖSCHUNGS-WELLE (Feld B) — VORLAGE-TREU UNGEDECKELT: das Studio deckelt die SSE-Sichthöhe NICHT (foundry-core.js Z.196 `min(uLodRef/(aH0*_isy),1)` — der grosse Baum behält Detail proportional länger). Der V18.413-S2-Deckel (1.25) demotete Riesen ~2× zu früh = der „L1/L2 nicht wie in der Vorlage"-Befund; die LAST atmet weiter über den EINEN Regler (perfMul/foliageRadius/Dichte), nicht über eine Metrik-Lüge. Nur der CPU-LOD-Chooser, NICHT die Shader-aH0-Stempel.
    // Die Crossfade-Band-Breiten (phytogenesis LOD_FADE/FADE0), über die das Dither-Crossfade die Laub-Karten
    // weich ausblendet, BEVOR die nächste LOD-Stufe greift.
    fade: 8, // Studio LOD_FADE — L1→L2-Band: Crossfade in [thresh12 − fade, thresh12] = [18,26]
    fade0: 4, // Studio LOD_FADE0 — L0→L1-Band: Crossfade in [thresh01 − fade0, thresh01] = [8,12]
    leafVisCap: 24, // AUSLÖSCHUNGS-WELLE (Feld B) — die ECHTE Studio-Blatt-Kappe: phytogenesis.js Z.2392/2407 `Math.min(H0arr[vi], 24/(SCALE[sp]*TREE_SCALE_MUL))` = 24 m Welt-Sichthöhe (NICHT uLodRef=12 — die alte Kopplung halbierte die Laub-Sichthöhe, das Laub demotete bei halber Studio-Distanz)
};

// Kronen-Dichte-Gitter (Occlusion-Demotion): die Sichtlinie Kamera→ferner Baum marschiert durchs
// Gitter; übersteigt die kumulierte Dichte die Schwelle, fällt der Baum auf LOD2 (`grown_*_lod2`) —
// die Silhouette bleibt, Pop-in ist konstruktiv unmöglich. Bäume streamen → periodischer Neubau
// (`_rebuildOcclusionGrid`). Kein zweiter LOD-Regler: die Demotion hebt nur die gewählte Stufe an,
// die Schwelle skaliert mit `_foliageDensityScale` (unter Last aggressiver).
AnazhRealm.OCCLUSION = Object.freeze({
    cellM: 3, // Kronen-Dichte-Gitter (3m-Zelle, wie phytogenesis _occG)
    occDist: 30, // erst JENSEITS dieser Distanz occlusion-marschieren (nahe Bäume bleiben voll-3D)
    startM: 7, // Marsch-Start (überspringt die eigene + direkte Nachbar-Krone)
    endMargin: 8, // Marsch-Ende = dr − 8 m (die Zielbaum-eigene Krone zählt NICHT mit)
    stepM: 3, // Schrittweite = Zellgröße
    thrHi: 3.6, // Demotions-Schwelle (Hysterese OBEN: klarer Baum → LOD2 erst hier)
    thrLo: 2.8, // Re-Promotions-Schwelle (Hysterese UNTEN: demotierter Baum bleibt es länger → kein Flattern)
    perfThrMin: 0.6, // unter voller Last (fdScale=MIN) sinkt die Schwelle auf 60 % → mehr Bäume werden LOD2
    weightMin: 0.35, // Kronen-Gewicht-Klammer (phytogenesis clamp)
    weightMax: 1.6,
    nominalH: 14, // nominale Baum-Sichthöhe (m) für das skalen-basierte Kronen-Gewicht
    weightPerM: 0.045, // Kronen-Gewicht ∝ (scale·nominalH) (scale 1 → 0.63, scale 2 → 1.26)
    rebuildInterval: 20, // Gitter-Neubau alle N Frames (Bäume streamen → periodisch, nicht statisch wie die Vorlage)
});

// SCATTER (unten) — FERN dichter Wald als InstancedMesh-Streu, gegated gegen die gebackenen Felder,
// deterministisch aus pcg2d-Integer-Hash (bit-identisch CPU↔GPU), ohne Architektur-Einträge; NAH
// kristallisiert ein Baum im promoteRadius zu einem echten Bauplan (harvestbar) mit IDENTISCHER
// Geometrie (derselbe `grown_<species>_v<idx>`-Pool) → kein Sprung. Dieselben archInstanceGroups.
// SCATTER_SLICE_MS — Scheiben-Länge des Region-Baus (ms/Frame im scatterDeco-Job): klein genug, dass
// kein Streaming-Frame am Deko-Bau kippt, groß genug für eine warme Region in 1–2 Scheiben.
AnazhRealm.SCATTER_SLICE_MS = 6;
// W4.3 — die EINE Bake-Uhr: die Anfrage-Frist des Studio-Bakes (Worker-Reply); danach null → Retry, dann gescheitert
// (der Flatten serviert Geometrie). Der Tick-Watchdog greift 2 s später (ein Versprechen, das nie abschließt). Befund
// 30.09.: eine zweite, engere Uhr (15 s) gab Bakes auf, während der SERIELLE Worker noch rechnete, und schob den
// nächsten nach — auf langsamem Holz eine Kaskade (7 hängend, 3 gescheitert, 0 gebacken; die schweren nahen Arten zuerst).
AnazhRealm.IMPOSTOR_BAKE_TIMEOUT_MS = 45000;
// W6 — DIE EINE Karten-Gruppe: jede Impostor-Instanz jeder Art (Streu, gesetzt, Band-Partner) zeichnet in DIESER
// globalen Gruppe (`_archInstanceGroupFor`), die Schicht wählt aKarte.x (`_impostorAtlas`).
AnazhRealm.IMPOSTOR_ATLAS_GRUPPE = "impostor#fimp:atlas";
// Die Instanz-Attribute der LOD-Fassade (`_lodInstanceFacade`) mit ihrer Breite: Sichthöhen (aH0/aH0L), Billboard-
// die Karte (aKarte = Atlas-Schicht, Halbbreite, Höhe — template-lokal — und die Sichthöhe, negativ = verdeckt).
AnazhRealm.LOD_INSTANZ_ATTRIBUTE = { aH0: 1, aH0L: 1, aKarte: 4 };
{
    const _streuEco =
        (typeof globalThis !== "undefined" && globalThis.__phytoCore && globalThis.__phytoCore.SCATTER_STRATUM) || {};
    const _eco = (n, fb) => {
        const s = _streuEco[n];
        return {
            floor: s && Number.isFinite(s.floor) ? s.floor : fb.floor,
            scaleBase: s && Number.isFinite(s.scaleBase) ? s.scaleBase : fb.scaleBase,
            scaleVar: s && Number.isFinite(s.scaleVar) ? s.scaleVar : fb.scaleVar,
            slopeMax: s && Number.isFinite(s.slopeMax) ? s.slopeMax : fb.slopeMax,
        };
    };
    const _ecoTree = _eco("tree", { floor: 0.1, scaleBase: 0.6, scaleVar: 1.5, slopeMax: 1.45 });
    const _ecoUnder = _eco("under", { floor: 0.06, scaleBase: 0.8, scaleVar: 0.5, slopeMax: 1.0 });
    const _ecoRock = _eco("rock", { floor: 0.02, scaleBase: 0.6, scaleVar: 1.0, slopeMax: 1.6 });
    // V18.491.118 — ecology from `__phytoCore.SCATTER_STRATUM`; caps stay Host.
    AnazhRealm.SCATTER = Object.freeze({
        cellM: 3.4, // Plan §3.5 — Baum-Zell-Raster (die Canopy-Schicht)
        regionM: 256, // eine Scatter-Region = 16 Voxel-Chunks (= Bake-Region V18.219)
        promoteM: 64, // < diesem Radius → der Scatter-Baum wird ein ECHTER Bauplan (Touch→Real)
        innerM: 64, // innerhalb: keine Deko-Streu (der promovierte/reale Ring trägt)
        outerM: 384, // äusserer Rand der Deko-Streu (jenseits trägt die Canopy-Shell)
        ringRegions: 1, // ±1 Region = 3×3 (768m²) aktiver Scatter-Ring
        perRegionCap: 1400, // (Legacy — die Baum-Schicht; die layers-Liste trägt jetzt die Caps)
        densityFloor: _ecoTree.floor, // lebendig-Boden für jeden Baum-Scatter
        densityScale: 1.5, // Multiplikator auf die lebendig-getriebene Wahrscheinlichkeit
        slopeMax: _ecoTree.slopeMax, // Steilhänge tragen weniger Scatter (Fels-Zone)
        maxRegionsPerFrame: 1, // bounded: max 1 Region/Frame generieren (Plan §5)
        // Mehrschichtige Dichte: Canopy (Bäume) + Strauch + Kraut + Bodenflora + Fels; Strauch/Kraut/Blume
        // teilen den feineren under-Pass, jeder Pass mit eigenem Zell-Raster + Cap. Region = 256 m ≈ 35 Chunks.
        // Die Streu-Schicht (litter → baum_totholz, eine belaubte Eiche als „Totholz") fiel W1 final.
        layers: Object.freeze([
            // Baum-Schicht: wenige, große, varianz-reiche Bäume (hohes scaleVar → ragende Alte + junge) statt
            // vieler dünner Stacheln; der niedrige cap hält offenes Waldland (Terrain/Fels/Blumen sichtbar).
            Object.freeze({
                name: "tree",
                cellM: 3.4,
                // V18.296 (Schöpfer-Anordnung, 20+ Versionen überfällig: „sehe immernoch
                // hunderte Bäume … wir gehen runter"): cap 300→90 (~2.6 Bäume/Chunk =
                // offenes Waldland, freie Sicht auf Terrain/Fels/Substanz). REVERSIBEL.
                cap: 55, // V18.303 90→55: das Laub war 90 % der GPU-Last (gemessen) + Schöpfer „zu viele Bäume, sonst kaum was"
                floor: _ecoTree.floor,
                scaleBase: _ecoTree.scaleBase,
                scaleVar: _ecoTree.scaleVar,
                slopeMax: _ecoTree.slopeMax,
                kind: "tree",
                promotable: true,
            }),
            // Understory (Strauch+Kraut+Bodenflora): Cap bleibt < treeCap, damit die Bäume die prominente
            // Substanz bleiben — viel Gestrüpp verdeckte sie und kostete FPS.
            Object.freeze({
                name: "under",
                cellM: 2.4,
                cap: 40, // V18.303 70→40 (das Laub = 90 % der GPU-Last); V18.296 250→70
                floor: _ecoUnder.floor,
                scaleBase: _ecoUnder.scaleBase,
                scaleVar: _ecoUnder.scaleVar,
                slopeMax: _ecoUnder.slopeMax,
                kind: "under",
                promotable: false,
            }),
            // FELS: Kiesel + Brocken, wo der Fels durchbricht (rockExposure aus slope+trocken+kahl). Eigener
            // densityScale, hoher slopeMax (Fels mag steil), große Skalen-Varianz. Deko, nicht promotable.
            Object.freeze({
                name: "rock",
                cellM: 2.6,
                cap: 110, // V18.303 350→110: 350 Kiesel/Region = absurd viele Instanzen für winzigen Look-Wert (der größte Instanz-Posten nach den Bäumen)
                floor: _ecoRock.floor,
                scaleBase: _ecoRock.scaleBase,
                scaleVar: _ecoRock.scaleVar,
                slopeMax: _ecoRock.slopeMax,
                densityScale: 1.3,
                kind: "rock",
                promotable: false,
            }),
        ]),
    });
}

// Krone als VOLUMEN: ein Cluster aus K Karten pro Foliage-Anchor, im Kronen-Volumen gejittert (ein
// Teil zur Mitte gezogen) → geschlossene Krone. Eine card{cross} ist billig (8 Verts); LOD1/2 dünnen
// per cardsPerAnchor aus. Override via state.atmosphere (_foliageDensity()).
AnazhRealm.FOLIAGE_DENSITY = Object.freeze({
    // Seit der Atlas eine Karte zu einem gebackenen ~16-Blatt-Büschel macht, reichen wenige, ruhige
    // Büschel-Karten je Anker (viele Karten in einer Jitter-Wolke = Brei); mittelgroße Karten halten die
    // Krone voll bei proportionierten Blättern. LOD1/2 bleiben dünn.
    cardsPerAnchor: [5, 2, 1], // pro LOD0/1/2 — moderate Zahl mittelgroßer Büschel
    jitterFrac: 0.5, // Cluster-Spreizung (Büschel überlappen sanft → volle Krone)
    sizeVar: 0.3, // ±30% (organisch)
    innerFill: 0.2, // etwas Füllung, das Ast-Gerüst bleibt aber sichtbar
});

// STAMM_RIPPEN — die Rippen-Zahl des Wurzelanlaufs der Werkstatt-Röhre (sin(Winkel·Rippen)·P.flare, phyto-core
// buildBarkTubeArrays). Die Amplitude ist das Gesetz der Art (P.flare); die Rippen sind ein Maß der Röhre, kein Gesetz (der
// Stamm des Studios ist glatt). Die Hand-Tafeln SPECIES_PALETTE_DEFAULT (Rinde/Laub) und DEFAULT_TREE_FLARE fielen K24-N1.
AnazhRealm.STAMM_RIPPEN = 5;

// DAS SKELETT DES GESETZES (K24-N1): der EINE Erzeuger `_growTreeBlueprintRich` schreibt jede Größe, die die Bauer der
// Werkstatt-Gestalt lesen (Röhre, Klingen, Karten, Kern, Schatten-Zwilling, Impostor-Rahmen) — Höhe, Rinde, Wurzelanlauf,
// Laub-Farbe, Laub-Art und -Maß, Blatt-Form, alle aus treeParams der Art. Fehlt eine, bricht der Bau laut beim Namen. Vorher
// setzten die Leser still einen Ersatz ein: Rinde SPECIES_PALETTE_DEFAULT, Höhe 10, Anlauf 0,45 × 5 (der Farn mit Anlauf 0
// bekam ihn: `|| 0.45`), Laub 0x4a8a3a und Maß 0,5, Blatt-Form nach dem Namen der Art, ein nie geschriebenes foliageScale.
AnazhRealm._skelettPflicht = function (sk) {
    const fehlt = [];
    if (!sk) fehlt.push("Skelett");
    else {
        if (!(sk.totalH > 0)) fehlt.push("totalH");
        for (const k of ["barkA", "barkB", "foliageColor", "flareAmp", "flareLobes"])
            if (!Number.isFinite(sk[k])) fehlt.push(k);
        if (!sk.laub || typeof sk.laub.kind !== "string" || !(sk.laub.kind === "none" || sk.laub.size > 0))
            fehlt.push("laub");
        if (!sk.leafShape || typeof sk.leafShape !== "object") fehlt.push("leafShape");
    }
    if (fehlt.length)
        throw new Error(
            "SKELETT-PFLICHT verletzt: " + fehlt.join(", ") + " fehlt (der Erzeuger _growTreeBlueprintRich)"
        );
    return sk;
};

// SPECIES_TREE_PARAMS — Welt-Bezug je Spezies: slopeMax (ab diesem Slope kein Spawn),
// heightRange [min,max] (Spawn-Höhenfenster über `state.terrainBaseHeight`).
AnazhRealm.SPECIES_TREE_PARAMS = Object.freeze({
    baum_tanne: Object.freeze({
        slopeMax: 1.2,
        heightRange: Object.freeze([-30, 200]),
    }),
    baum_kiefer: Object.freeze({
        slopeMax: 1.3,
        heightRange: Object.freeze([-20, 180]),
    }),
    baum_buche: Object.freeze({
        slopeMax: 0.8,
        heightRange: Object.freeze([-40, 120]),
    }),
    baum_birke: Object.freeze({
        slopeMax: 0.6,
        heightRange: Object.freeze([-30, 90]),
    }),
    baum_eiche: Object.freeze({
        slopeMax: 0.7,
        heightRange: Object.freeze([-40, 110]),
    }),
    baum_erle: Object.freeze({
        slopeMax: 0.9,
        heightRange: Object.freeze([-40, 100]),
    }),
    // KARST: slopeMax 1.6 (höchster aller Arten), heightRange [-30, 80] bewusst eng (Klippen-Zone).
    baum_karst: Object.freeze({
        slopeMax: 1.6,
        heightRange: Object.freeze([-30, 80]),
    }),
    // V18.216 (Plan §3.5) — Büsche: mittlere bis kleine slopeMax (Hazel klettert leichter, Blume meidet Steile),
    // weite heightRange (Understory wächst überall, wo der Baum-Schatten fällt).
    busch_hazel: Object.freeze({
        slopeMax: 0.9,
        heightRange: Object.freeze([-30, 90]),
    }),
    farn_busch: Object.freeze({
        slopeMax: 0.5,
        heightRange: Object.freeze([-40, 60]),
    }),
    blume_gross: Object.freeze({
        slopeMax: 0.4,
        heightRange: Object.freeze([-30, 50]),
    }),
    // T1 (wahrerwuchs §4.1) — PALME: warmes Tiefland, meidet Steile + Höhe (Küsten/Oasen).
    baum_palme: Object.freeze({
        slopeMax: 0.6,
        heightRange: Object.freeze([-30, 35]),
    }),
    // T1 — ZYPRESSE: säulen-förmig, tolerant (Hügel + mittlere Höhe).
    baum_zypresse: Object.freeze({
        slopeMax: 1.0,
        heightRange: Object.freeze([-30, 120]),
    }),
});

// Form-begründete Tag-Modulation je Spezies (kleine deklarierte Δ): die Affinitäts-Tag-Wand lässt
// sie NUR in den genannten Achsen-Richtungen passieren, andere Achsen bleiben strict (Δ < 0.05).
// computeCompoundTags mischt sie für gewachsene Baupläne (`_isGrown && _grownSpecies`) additiv drauf
// → Spawn-Affinität, Werkstatt und Audio-Resonanz erkennen die Spezies subtil.
AnazhRealm.SPECIES_TAG_VARIATION = Object.freeze({
    baum_tanne: Object.freeze({ brennbar: 0.1, resoniert: 0.05 }), // harzig, klingt
    baum_kiefer: Object.freeze({ brennbar: 0.1, resoniert: 0.05 }), // harzig, klingt
    baum_buche: Object.freeze({ lebendig: 0.08 }), // saftig
    baum_birke: Object.freeze({ lebendig: 0.1 }), // saftig + zart
    baum_eiche: Object.freeze({ lebendig: 0.05 }), // robust-saftig (subtil)
    baum_erle: Object.freeze({ lebendig: 0.08 }), // wasser-saftig
    // V18.216 (Plan §1 M3 + §3.5) — die neuen Substanz-Vektoren:
    baum_karst: Object.freeze({ dichte: 0.1, lebendig: -0.05 }), // hart, weniger saftig (Klippen-Geste)
    busch_hazel: Object.freeze({ lebendig: 0.08, brennbar: 0.05 }), // saftig + brennbar
    farn_busch: Object.freeze({ lebendig: 0.12, magieleitung: 0.05 }), // sehr saftig, leicht magisch
    blume_gross: Object.freeze({ lebendig: 0.15, magieleitung: 0.1 }), // hoch lebendig + magisch
});

// Kanonische Spezies-Tag-Signatur, einmal aus den alten Kugel-Baum-Bauplänen gemessen
// (computeCompoundTags, diag-tree-tags) und eingefroren. Die Grammatik-Drift-Wand
// (_growTreeBlueprintRich) liest hier die Referenz → die Affinitäts-Tag-Wand bleibt bit-identisch.
AnazhRealm.SPECIES_TAG_REFERENCE = Object.freeze({
    baum_eiche: Object.freeze({ lebendig: 1.4, dichte: 0.8, brennbar: 0.8, magieleitung: 0.7 }),
    baum_birke: Object.freeze({ lebendig: 1.4, dichte: 0.8, brennbar: 0.8, magieleitung: 0.7 }),
    baum_erle: Object.freeze({ lebendig: 1.4, dichte: 0.8, brennbar: 0.8, magieleitung: 0.7 }),
    baum_buche: Object.freeze({ lebendig: 1.4, dichte: 0.8, brennbar: 0.8, magieleitung: 0.7 }),
    // Die REFERENZ ist die geteilte Basis (holz+laub, gleich für alle Arten); die Nadelbaum-Flammbarkeit
    // (+0.1) lebt in SPECIES_TAG_VARIATION, nicht hier — sonst löst die Affinitäts-Tag-Wand fehl aus.
    baum_kiefer: Object.freeze({ lebendig: 1.4, dichte: 0.8, brennbar: 0.8, magieleitung: 0.7 }),
    baum_tanne: Object.freeze({ lebendig: 1.4, dichte: 0.8, brennbar: 0.8, magieleitung: 0.7 }),
});

// LICHEN: grüne Patina auf alten/feuchten Steinen — reine Render-Schicht im
// `_bodenFarbeAt`-Mix-Stack (kein Tag). Der Worker hardkodiert diese Schwellen
// spiegelbildlich (bit-Vertrag: jede Änderung in BEIDE); die Farbe ist die Flechte der Boden-Palette.
AnazhRealm.LICHEN = Object.freeze({
    // Feuchte muss ≥ feuchteLo sein für Lichen-Wachstum (trockene Steine bleiben blank).
    feuchteLo: 0.5,
    feuchteHi: 0.9,
    // Dichte (Stein-Achse) muss ≥ dichteLo sein (kein Lichen auf Erde/Glut/Quarz).
    dichteLo: 0.5,
    dichteHi: 0.85,
    // Maximaler Mix-Anteil (sehr subtil — Lichen ist eine Tönung, kein
    // Decken-Anstrich).
    strength: 0.22,
});

// FELD-CHARAKTER: jede Welt-Stimme hat ihre eigene Frequenz (lebendig λ200, dichte λ340, glut λ520,
// magie λ160 m) — der Welt-Charakter emergiert aus dem Überlagerungs-Muster (Ecotone an
// argmax-Grenzen + AFFINITY_FLOOR-Linie). Nur bei gen >= 3 aktiv (alte Welten bit-identisch).
AnazhRealm.FIELD_CHARACTER = Object.freeze({
    // Wellenlängen (m). Erst-Wurf aus genese-plan §Γ3.
    lambdaLebendig: 200,
    lambdaDichte: 340,
    lambdaGlut: 520,
    lambdaMagieleitung: 160,
    // Domain-Warp-Amplitude (m): verschiebt die Sample-Koordinaten VOR den Stimmen-Reads → die Stimmen
    // mäandern statt parallel zu liegen. Eigener Stream `seed + "-veg-warp"` (re-rollt keinen anderen);
    // λ~600 m, langsamer als die Stimmen, sonst überdeckt der Warp ihre Struktur.
    warpAmp: 40,
    warpScale: 1 / 600,
});

// R5-Struktur-Textur: Boost auf das micro-Gewicht der WERK-Profile (Bauwerke, Deko, Kreaturen,
// Avatare) — Strukturen tragen mehr Mikro-Tiefe als das Terrain. LIVE-Quelle ist
// `state.atmoUniforms.r5StructureBoost` (setStructureBoost); `microBoost` ist Default + Fallback.
AnazhRealm.R5_STRUCTURE_TEXTURE = Object.freeze({
    // Multiplier auf das micro-Gewicht im werk-Profil. 1.0 = neutraler
    // Default; >1 verstärkt Mikro-Tiefe in Bauten; <1 dämpft sie. Range
    // [0.5, 2.0] sinnvoll; der Slider erlaubt [0.5, 2.5].
    microBoost: 1.3,
});

// GERUCH-Feld: reist mit dem Wind, fällt mit Distanz ab; Quellen sind diskret (Kreaturen, Pflanzen,
// Strukturen — die Konsumenten geben sie ein). Fundament-Funktion, noch ohne Kreatur-KI-Verdrahtung.
AnazhRealm.SCENT = Object.freeze({
    // Reichweite (m): Geruch fällt auf ~37% bei rangeM, ~5% bei 3×rangeM.
    rangeM: 80,
    // Wind-Modulation: 1.0 = volle Richtungs-Wirkung (upwind = 0); 0.0 = isotrop.
    // Erst-Wurf 0.6 — Wind hilft deutlich, isoliert aber nicht (upwind-Geruch
    // dimmt, verschwindet nicht ganz).
    windFactor: 0.6,
    // Minimaler Richtungs-Faktor (gegen Wind): nie ganz 0, sonst wäre der
    // Geruch upwind invisible — eine Schwelle, die "Restduft" trägt.
    minDirectional: 0.2,
    // Wind-Skala — Position-Modulation (langsame regionale Variation,
    // λ~1000 m). Der Wind dreht über große Distanzen, nicht von Schritt
    // zu Schritt.
    windScale: 1 / 1000,
    // Wind-Drehrate: 0 = statisch pro Welt (deterministisch testbar); positive Werte drehen über Zeit.
    windTimeRate: 0,
});

// IRON-BANDS: vertikale Eisenadern in tiefen Berg-Regionen (Ridge-Noise `1−|noise|`², unrotiert →
// vertikale Linien-Cluster). EISEN ersetzt STEIN in der Tiefe, wo der Aderwert hoch ist UND genug
// dichte besteht (nie in Erde/Lava). Sichtbar als dunklere Tönung; härtere Eisen-Werkzeuge.
AnazhRealm.IRON_BANDS = Object.freeze({
    // Tiefe, ab der Eisen-Adern auftreten können (über STRATA_STEIN_DEPTH
    // hinaus — Iron-Bands sind eine MIN-STEIN-DEPTH-TIEFE Subschicht).
    minDepth: 24,
    // Ridge-Schwelle: nur an Punkten mit Aderwert > threshold wird stein
    // → eisen umgewandelt. Erst-Wurf 0.7 → ~5-10 % der tiefen Stein-Region.
    threshold: 0.7,
    // Dichte-Floor: kein Eisen in nicht-stein-dominierten Regionen.
    dichteFloor: 0.4,
    // Skala der Ridge-Adern (Noise-Frequenz). 1/180 = ~180 m Adern-Wellenlänge,
    // genug für sichtbare aber nicht überall-präsente Linien.
    scale: 1 / 180,
});

// Welle 6.A6 — Maus-Aktionen (abbauen/platzieren): der Kosten-Satz wohnt im
// koerperstudio-Gesetzbuch (fx.bewegung.aktionAusdauer), Leser _aktionAusdauer;
// der Konstanten-Zwilling MOUSE_ACTION_STAMINA_COST ist gefallen (Kern-Pflicht).

// Abbauen kostet substanz-gebundene MÜHE (mehrere Hiebe). EINE Tauglichkeit (Grab-Kraft des
// gehaltenen Dings vs Material-Widerstand) dirigiert vier Kanäle: TEMPO (Fortschritt/Hieb), STAMINA
// (invers zur Effizienz), ERTRAG (∝ Tauglichkeit, mit Floor → falsches Werkzeug gibt nichts), GEFÜHL
// (_feelAction skaliert mit dem Ertrag). Kein Slider — die Substanz entscheidet.
AnazhRealm.HARVEST = Object.freeze({
    // V17.56 W2 — das FORM-getriebene Doppel-Profil. WUCHT (mine) ∝ STUMPFHEIT × (härte+dichte);
    // SCHÄRFE (cut) ∝ spitze Form × härte. So wird DIESELBE harte Materie zur Keule ODER zur Klinge.
    handMinePower: 0.5, // die bloße Faust — schwach beim Wuchten
    handCutPower: 0.4, // die bloße Faust — schwach beim Schneiden (pflückt nur ganz Weiches)
    toolMineBase: 0.5,
    toolCutBase: 0.4,
    mineFromHärte: 1.6, // ein hartes stumpfes Gerät bricht Hartes
    mineFromDichte: 2.2, // die MASSE wuchtet (eine schwere Keule) — der dominante Mine-Term
    cutFromSharp: 3.4, // die SCHÄRFE (spitze Form × härte) schneidet
    resistBase: 0.7, // Wucht-Widerstand: jedes Material leistet etwas
    resistFromHärte: 2.2, // hartes Material widersteht der Wucht
    resistFromDichte: 1.3, // dichtes Material widersteht der Wucht
    cutResistBase: 0.5, // Schneid-Widerstand
    cutResistFromHärte: 6.0, // HARTES ist UNschneidbar (Fels) — der dominante Cut-Resist-Term: eine Klinge gräbt Fels miserabel
    cutResistFromDichte: 0.7, // dichtes etwas
    strikeScale: 0.55, // Fortschritt/Hieb = clamp(Tauglichkeit · strikeScale, min, max)
    minStrikeProgress: 0.06, // selbst die Faust an Granit macht WINZIGEN Fortschritt (nie 0 = Hänger)
    maxStrikeProgress: 1.0, // ein überlegenes Werkzeug ein-hiebt Weiches
    strikeStaminaBase: 4, // Stamina/Hieb-Basis (pfad) ÷ Tauglichkeit (INVERS zur Effizienz)
    minStrikeStamina: 2,
    maxStrikeStamina: 30, // ein falsches Werkzeug verbrennt Ausdauer für fast nichts
    yieldFloorRatio: 0.35, // unter dieser Tauglichkeit greift nur noch der Sockel (oberhalb rampt der Ertrag auf 1)
    yieldMin: 0.34, // M6 (Befund 18) — der ERTRAGS-SOCKEL: wer den Bruch erarbeitet, bekommt mindestens 1/3 (die Faust holt das Grobe; Feines braucht Werkzeug)
    strikeIntervalSec: 0.2, // Halten → Auto-Hieb-Kadenz (5 Hiebe/s) → kontinuierliches Mahlen
    terrainResist: 2.4, // der Boden-Wucht-Widerstand (W1: konstant; später aus der lokalen Dichte)
    terrainCutResist: 9, // der Boden wird GEWUCHTET, nicht geschnitten (Schärfe greift nicht)
});

// Welt-Snapshot übers Mesh: ein Guest holt die Host-Welt in Stücken über den RTCDataChannel (WS hatte
// ein 1-MiB-Limit). 16 KiB ist die interop-sichere DataChannel-Nachrichtengröße; Backpressure über
// channel.bufferedAmount.
AnazhRealm.P2P_WORLD_CHUNK_SIZE = 16384;
// Backpressure-Schwelle: steigt `channel.bufferedAmount` darüber, pausiert der Sender —
// „16 Stücke dürfen im Puffer warten" (= 262144).
AnazhRealm.P2P_BACKPRESSURE_BYTES = 16 * AnazhRealm.P2P_WORLD_CHUNK_SIZE;
// Infrastruktur-Defaults an EINER Stelle (Drift-Schutz): lokaler Ollama-Server und
// Default-Signaling-Adresse.
AnazhRealm.OLLAMA_DEFAULT_ENDPOINT = "http://localhost:11434";
AnazhRealm.P2P_DEFAULT_WS_URL = "ws://127.0.0.1:4313";
// Rejoin-Backoff: BASE·2^n, Deckel MAX, plus deterministischer Jitter in [0, JITTER) ms (FNV-1a über
// Versuchszähler+peerId — seeded statt Math.random). EINE Formel (_p2pReconnectDelayMs) für
// WS-Rejoin UND RTC-Heilung.
AnazhRealm.P2P_RECONNECT_BASE_MS = 1000;
AnazhRealm.P2P_RECONNECT_MAX_MS = 30000;
AnazhRealm.P2P_RECONNECT_JITTER_MS = 1000;
// Snapshot-Puffer des Nicht-Lockstep-pos-Pfads: der Render blickt fest INTERP_DELAY ms zurück
// (Valve-Source-Muster, 100–150 ms) und interpoliert zwischen den zwei passenden Snaps; BUF_MAX
// deckelt den Puffer (~0.7 s bei 30 Hz).
AnazhRealm.P2P_SNAP_INTERP_DELAY_MS = 120;
AnazhRealm.P2P_SNAP_BUF_MAX = 20;
// W7 Phase 2 — Mindestabstand zwischen zwei world-pull-Antworten an
// denselben Peer. Schützt vor pull-Spam (jeder Pull serialisiert + sendet
// die ganze Welt — ohne Limit ein DoS-Vektor).
AnazhRealm.P2P_PULL_COOLDOWN_MS = 5000;
// DIE ERBGUT-STUFE DES PROTOKOLLS: wer eine Welt erbittet (world-request, world-pull), erklärt, dass er
// `worldMeta.erbgut` liest und eine unbekannte Term-Art ablehnt (`_erbgutEinlass`). Ein Sender reicht eine Welt, deren
// Erbgut nicht die Wildnis allein ist, nur einem Empfänger mit dieser Stufe (`_erbgutTeilbar`) — ein Build davor
// zeichnete sie still als Wildnis. Stufe 2 (K16b): der Empfänger liest auch die Regler im Wildnis-Term (eine Welt aus
// einem Plan des Gelände-Studios).
AnazhRealm.ERBGUT_PROTOKOLL = 2;
// DIE WELTGRENZE: was beim Wechsel der Welt aus der alten reist — beim Namen, sonst nichts (gate:weltgrenze).
//   geburt       die Wahl des Schöpfers, die eine neue Welt erbt (`_buildEmptyWorldSnapshot`)
//   platz        der Speicher-Platz der Seite, nur in die Lücken einer geladenen Welt (`_weltMetaWechsel`)
//   gedaechtnis  die Gedächtnisse der Seite, die welt-eigene Felder spiegeln (Erbgut, Anker, Ring, Vorschau, Dorf-Zug,
//                die Lichter: Laternen der Pläne, das wache Tor, der Licht-Pool, der ihre Plätze hält) —
//                sie fallen mit dem worldMeta (`_loadStateRestoreWorldMeta`)
AnazhRealm.WELT_GRENZE = Object.freeze({
    geburt: Object.freeze(["visibility", "creator"]),
    platz: Object.freeze(["worldId", "slug", "bornAt"]),
    gedaechtnis: Object.freeze([
        "_erbgutCache",
        "_genesisRingFertig",
        "_portalPreviewFertig",
        "_portalPreviewAwaiting",
        "_autoSettlementQueue",
        "_autoSettlementRejected",
        "_autoSettlementStartHopeless",
        "_stlWegeKeys",
        "_laternen",
        "_portalLeuchte",
        "_leuchtPool",
    ]),
});

// Mesh-Welt-Verteilung: ein vendortes Welt-Bündel reist in P2P_WORLD_CHUNK_SIZE-Stücken über den
// DataChannel. Mindestabstand zwischen zwei bundle-pull-Antworten an denselben Peer — Read + Versand
// sind teuer, ohne Limit ein DoS-Vektor.
AnazhRealm.P2P_BUNDLE_PULL_COOLDOWN_MS = 5000;
// Weicher Pull-Timeout: hängt ein Bündel-Pull länger, gibt _p2pCheckBundlePullTimeout ihn frei
// (der Sender verschwand vermutlich mitten im Chunk-Strom).
AnazhRealm.P2P_BUNDLE_PULL_TIMEOUT_MS = 30000;

// LLM-Pool: ein Peer mit aktivem LLM teilt seine „Stimme", schlüssellose Peers routen Chat darüber.
// Fremder Prompt über meinen Key → Opt-in + Rate-Limit: Cooldown je anfragendem Peer, Timeout für
// den Anfrager, Prompt-Längen-Deckel.
AnazhRealm.P2P_VOICE_COOLDOWN_MS = 6000;
AnazhRealm.P2P_VOICE_TIMEOUT_MS = 30000;
AnazhRealm.P2P_VOICE_PROMPT_MAX = 2000;

// Default-Keybindings (Aktion → Code): KeyboardEvent.code (layout-unabhängig, "KeyF"),
// "Mouse0/1/2" für Maus-Buttons; Rebinds persistiert in localStorage "anazh.keybindings".
// WASD und 1-9 bleiben hardcoded.
AnazhRealm.DEFAULT_KEYBINDINGS = Object.freeze({
    break: "Mouse0",
    place: "Mouse2",
    confirmBuild: "KeyF",
    inventory: "Tab",
    cancelBuild: "Escape",
    jump: "Space",
    // Drawer + Camera-Toggle sind rebindbare Aktionen (via _actionForBindingCode). Die Welt ist der
    // Default-Blick — kein drawerWelt.
    drawerKreaturen: "KeyK",
    drawerSpieler: "KeyP",
    drawerWerkstatt: "KeyB",
    drawerEinstellungen: "KeyI",
    cameraToggle: "KeyV",
    // V18.109 — E8: der Hand-Tausch (Minecraft-Geste; F ist confirmBuild → G).
    swapHands: "KeyG",
    // Das Gespräch (Leben-Schau 07.10., L3): Enter öffnet den Chat, Enter im Feld sendet und gibt die Welt zurück.
    chat: "Enter",
});
// DIE FAHR-TASTEN (Leben-Schau 2, fahr-bahn — Befund: in der Tastenliste fehlten E und die Handbremse): die EINE Tafel, die
// die Eingabe liest (E im keydown-Hörer, Gas · Bremse · Lenkung · Handbremse im Fahr-Schritt) und die Hilfe (`_hilfeZeilen`)
// und der Tacho (`_fahrAnzeige`) nennen. `tasten` = Namen in state.keys (event.key klein; die Pfeile schreiben w/a/s/d über
// PFEIL_ALIAS), `code` = KeyboardEvent.code, `zeigen` = die Taste für den Spieler.
AnazhRealm.FAHR_TASTEN = Object.freeze({
    einsteigen: Object.freeze({ code: "KeyE", zeigen: "E", label: "einsteigen/aussteigen" }),
    gas: Object.freeze({ tasten: Object.freeze(["w"]), zeigen: "W", label: "Gas" }),
    bremse: Object.freeze({ tasten: Object.freeze(["s"]), zeigen: "S", label: "Bremse/rückwärts" }),
    lenken: Object.freeze({ tasten: Object.freeze(["a", "d"]), zeigen: "A/D", label: "lenken" }),
    handbremse: Object.freeze({ tasten: Object.freeze(["shift"]), zeigen: "Shift", label: "Handbremse" }),
});
AnazhRealm.KEYBINDING_ACTIONS = Object.freeze(Object.keys(AnazhRealm.DEFAULT_KEYBINDINGS));
AnazhRealm.KEYBINDING_LABELS = Object.freeze({
    break: "Abbauen (Architektur / Terrain)",
    place: "Platzieren (Bau-Modus)",
    confirmBuild: "Bauen bestätigen",
    inventory: "Inventar öffnen",
    cancelBuild: "Bau-Modus verlassen",
    jump: "Springen",
    drawerKreaturen: "Hof öffnen (Kreaturen · Nexus · Befehle)",
    drawerSpieler: "Spieler-Drawer öffnen",
    drawerWerkstatt: "Werkstatt-Drawer öffnen",
    drawerEinstellungen: "Einstellungen-Drawer öffnen",
    cameraToggle: "Kamera: 1st/3rd-Person",
    swapHands: "Hand tauschen (Off-Hand)",
    chat: "Gespräch öffnen (sprich mit der Welt)",
});

// MOTION_ROLE_SIGNATURES — die BEWEGUNGS-Rolle eines PARTS emergiert als argmax-Resonanz seines
// Feature-Vektors gegen diese frozen Signaturen (wie die WERK-Rolle, `computeBlueprintRole`) — kein
// Typ-Whitelist, kein Per-Wesen-Hardcode; Konjunktionen als 0/1-Achse, die Disjunktion im argmax.
// Achsen: elongV/elongH · flat · lowAnchor · topMount · sideMount · rearMount · roundish · central ·
// paired. Konsument: `computeMotionRoles` → `_animateCompoundMotion` (Kreaturen, Custom-Avatare und
// Peer-Seelen teilen EINE Bewegungs-Sprache).
// Kreatur-Seelen (CREATURE_SOULS, unten) sind Hylomorphismus-Compounds wie Spieler-Seelen und
// Baupläne: bodyParts → _buildFromBlueprint, Tags → computeCompoundTags.
AnazhRealm.MOTION_ROLE_SIGNATURES = Object.freeze({
    bein: Object.freeze({ lowAnchor: 1.0, paired: 0.6, elongV: 0.7, flat: -0.4, topMount: -0.8, central: -0.6 }),
    arm: Object.freeze({ sideMount: 0.8, elongV: 0.8, paired: 0.5, flat: -0.6, lowAnchor: -0.6 }),
    fluegel: Object.freeze({ sideMount: 0.7, flat: 1.0, paired: 0.4, lowAnchor: -0.7, central: -0.3 }),
    schwanz: Object.freeze({ rearMount: 1.0, elongH: 0.7, paired: -0.6, central: -0.4 }),
    kopf: Object.freeze({ topMount: 0.9, roundish: 0.6, paired: -0.7, elongH: -0.4, lowAnchor: -0.5 }),
    // C2 (gigant-plan §5 — G1-B): SEGEL/TUCH — flach · hoch montiert · un-gepaart
    // → flattert im Wind (Mühlen-Flügel, Banner). Konsument: das Architektur-Idle
    // (nur segel/rad/tuer/wirbel — Hütten wackeln NIE).
    segel: Object.freeze({ flat: 1.0, topMount: 0.7, paired: -0.3, lowAnchor: -0.8, roundish: -0.4 }),
});
// Unter diesem argmax-Score bewegt sich ein Part NICHT (Torso/Deko bleiben ruhig).
AnazhRealm.MOTION_ROLE_FLOOR = 0.55;

// CREATURE_ARCHETYPES — Tier-Baupläne als Bruchteile der Körper-Länge L: legFrac = Hüfte→Boden,
// segRatio = Ober:Unterschenkel, torsoW/H = Rumpf-Querschnitt, neckFrac/neckTilt = Hals, headFrac,
// tailFrac, eyeFront (1 = Jäger vorwärts, 0 = Pflanzer seitlich), kneeFwd = Knie-Knick. Die EINE
// Quelle ist tetrapoda-core.ARCHETYPES (der Stamm liest nur); der Physik-Richter sichert das Stehen.
Object.defineProperty(AnazhRealm, "CREATURE_ARCHETYPES", {
    get() {
        const core = (typeof globalThis !== "undefined" && globalThis.__tetrapodaCore) || null;
        return (core && core.ARCHETYPES) || null;
    },
});
AnazhRealm.CREATURE_ARCHETYPE_NAMES = Object.freeze(Object.keys(AnazhRealm.CREATURE_ARCHETYPES));
// Die EINE Skelett-g-Quelle der studio-gedockten Seelen: dieselben Werte, die CREATURE_SOULS beim
// Init in `_creatureSkeleton` gießt — damit `_tetrapodaSoulParts` zur BAU-Zeit dasselbe g mit
// dial-überschriebenem Archetyp erneut gießen kann (ohne Rezept bleiben die Modul-bodyParts die
// Wahrheit). archetypeName wird beim Guss über CREATURE_ARCHETYPES aufgelöst.
AnazhRealm.CREATURE_SKELETON_G = Object.freeze({
    wesen: Object.freeze({
        size: 0.6,
        archetypeName: "deer",
        bodyMat: "stein",
        limbMat: "holz",
        headMat: "holz",
        shapes: Object.freeze({ torso: "box", limb: "limb", head: "sphere", snout: "limb", tail: "limb" }),
        bodyBarrel: true,
        bodyColor: 0x6e4d30,
        limbColor: 0x6e4d30,
    }),
    // Die tetrapoda-Gattungen (wolf · fox · bear) als Seelen aus DEMSELBEN Skelett-Gesetz.
    // Shapes+Materialien bewusst = die wesen-Menge ({box,limb,sphere} × stein/holz) → Compound-Tags
    // IDENTISCH zu wesen = keine Spawn-Affinitäts-Verdrängung (winner-take-all); nur Farben +
    // Gattungs-Dials unterscheiden. size = stats-tragende Tarierung (Tie-Band um wesen 0.6).
    wolf: Object.freeze({
        size: 0.58,
        archetypeName: "wolf",
        bodyMat: "stein",
        limbMat: "holz",
        headMat: "holz",
        shapes: Object.freeze({ torso: "box", limb: "limb", head: "sphere", snout: "limb", tail: "limb" }),
        bodyColor: 0x6b6f75,
        limbColor: 0x5c6066,
    }),
    fuchs: Object.freeze({
        size: 0.45,
        archetypeName: "weasel",
        bodyMat: "stein",
        limbMat: "holz",
        headMat: "holz",
        shapes: Object.freeze({ torso: "box", limb: "limb", head: "sphere", snout: "limb", tail: "limb" }),
        bodyColor: 0xa5502a,
        limbColor: 0x7c3a1e,
    }),
    baer: Object.freeze({
        size: 0.72,
        archetypeName: "bear",
        bodyMat: "stein",
        limbMat: "holz",
        headMat: "holz",
        shapes: Object.freeze({ torso: "box", limb: "limb", head: "sphere", snout: "limb", tail: "limb" }),
        bodyBarrel: true,
        bodyColor: 0x4a3524,
        limbColor: 0x3e2c1e,
    }),
});
// Das Reittier ist ein PFERD: Host-Archetyp `horse` (CREATURE_ARCHETYPES), dasselbe Skelett-Gesetz.
// Shapes×Materialien unverändert → Tags wert-gleich (die labs-Gate-X-Münze wacht). kern =
// Kantenlänge des belebenden Quarz-Oktaeders (magieleitung = Antrieb, `_isMoveable`).
AnazhRealm.REITTIER_SKELETON_G = Object.freeze({
    holzross: Object.freeze({
        size: 1.6,
        archetypeName: "horse",
        bodyMat: "holz",
        limbMat: "holz",
        headMat: "holz",
        shapes: Object.freeze({ torso: "box", limb: "limb", head: "box", snout: "limb", tail: "limb" }),
        bodyBarrel: true,
        kern: 0.22,
    }),
});
AnazhRealm.CREATURE_SOULS = Object.freeze({
    // `wesen` ist ein Vierbeiner aus dem Skelett-Gesetz: Rumpf (box stein) + Kopf (sphere holz) +
    // Hals/Beine/Schwanz (holz `limb`-Kapseln). limb aktiviert wie cylinder → Compound-Tags
    // bit-identisch zum alten wesen.
    wesen: Object.freeze({
        // ERFINDER-WELLE — der ehrliche NAME der Gestalt: das wesen IST der Hirsch
        // (deer-Gattung/Archetyp seit F1). Der Schlüssel `wesen` bleibt load-bearing
        // (Saves · Tests · TETRAPODA_SOUL_MAP), nur das Schild modernisiert.
        label: "Hirsch",
        // Das g lebt als Daten in CREATURE_SKELETON_G (byte-identischer Guss): `size` 0.6 = sizeFactor-
        // Tarierung ins Tie-Band (stats-tragend, darum kein Studio-Dial), deer-Archetyp = sanfter
        // Pflanzenfresser. Zur BAU-Zeit dockt `_tetrapodaSoulParts` die tetrapoda-Dials auf denselben Guss;
        // diese Modul-bodyParts bleiben die frozen Wahrheit für Tags/Stats (Dials sind tag-neutral).
        bodyParts: Object.freeze(
            AnazhRealm._creatureSkeleton(
                Object.assign({ archetype: AnazhRealm.CREATURE_ARCHETYPES.deer }, AnazhRealm.CREATURE_SKELETON_G.wesen)
            ).map((p) => Object.freeze(p))
        ),
        auraY: 0.8,
    }),
    // Die restlichen tetrapoda-Gattungen als Seelen (Dials formen sie zur BAU-Zeit über
    // `_tetrapodaSoulParts`, TETRAPODA_SOUL_MAP). Tag-identisch zu wesen → sie teilen seine Spawn-Nische
    // statt sie zu verdrängen. wolf trägt `predator` (diet=1, bleibt aus den AMBIENT-Pickern);
    // fuchs/baer sind ambient.
    wolf: Object.freeze({
        label: "Wolf",
        predator: true,
        bodyParts: Object.freeze(
            AnazhRealm._creatureSkeleton(
                Object.assign({ archetype: AnazhRealm.CREATURE_ARCHETYPES.wolf }, AnazhRealm.CREATURE_SKELETON_G.wolf)
            ).map((p) => Object.freeze(p))
        ),
        auraY: 0.75,
    }),
    fuchs: Object.freeze({
        label: "Fuchs",
        bodyParts: Object.freeze(
            AnazhRealm._creatureSkeleton(
                Object.assign(
                    { archetype: AnazhRealm.CREATURE_ARCHETYPES.weasel },
                    AnazhRealm.CREATURE_SKELETON_G.fuchs
                )
            ).map((p) => Object.freeze(p))
        ),
        auraY: 0.6,
    }),
    baer: Object.freeze({
        label: "Bär",
        bodyParts: Object.freeze(
            AnazhRealm._creatureSkeleton(
                Object.assign({ archetype: AnazhRealm.CREATURE_ARCHETYPES.bear }, AnazhRealm.CREATURE_SKELETON_G.baer)
            ).map((p) => Object.freeze(p))
        ),
        auraY: 0.85,
    }),
});
AnazhRealm.CREATURE_SOUL_NAMES = Object.freeze(Object.keys(AnazhRealm.CREATURE_SOULS));

// HARVEST_VOLUME_TO_UNITS — Volumen→Material-Einheiten für harvestArchitecture: k=4 →
// 1×1×1-Box = 4 Einheiten, 0.5³ → 1 (min 1).
// CREATURE_NAME_POOL (unten) — jede Kreatur bekommt beim Spawn einen Namen: Identität hängt am
// Namen, nicht am Index.
AnazhRealm.HARVEST_VOLUME_TO_UNITS = 4;

AnazhRealm.CREATURE_NAME_POOL = Object.freeze([
    "Nira",
    "Vex",
    "Lumin",
    "Skara",
    "Thal",
    "Yune",
    "Orin",
    "Kai",
    "Aro",
    "Sai",
    "Mira",
    "Zen",
    "Pyx",
    "Quin",
    "Rae",
    "Yto",
    "Una",
    "Wel",
    "Bran",
    "Cova",
    "Nox",
    "Fae",
    "Glim",
    "Hira",
    "Ilen",
    "Joro",
    "Lera",
    "Maev",
    "Toren",
    "Tara",
]);

// Tod-Wunde: nach einem Tod fallen die Körper-Tags graduell (sichtbar verwundet bis zur vollen
// Regeneration); skaliert mit `deathWoundIntensity` (0..1).
AnazhRealm.WOUND_TAG_PENALTY = Object.freeze({
    dichte: -0.3, // Körper schwer + träge
    lebendig: -0.2, // Aura blass
    zähigkeit: -0.2, // anfälliger
});

// Min-Regel-Hybrid-Decay (Formel s. computePartPrecision): ein 4-Schritt-Chain liefert ~59 % der
// Höchst-Präzision, reine Hand-Arbeit (1 Schritt) bleibt bei min — Sorgfalt belohnt, nicht beliebig.
AnazhRealm.PRECISION_DECAY = 0.7;

// Emotion→Tag-Mapping für Boosts: jede der 6 Emotionen koppelt an einen MATERIAL_TAG_KEY; über 0.7
// wirkt ein Tag-Delta auf den Spieler-Compound (Stat-Steigerung ~10–15 %, spürbar, nicht dominant).
AnazhRealm.BOOST_EMOTION_TAG = Object.freeze({
    joy: { tag: "wärmeleitung", delta: 0.15, label: "Freude wärmt" },
    awe: { tag: "magieleitung", delta: 0.15, label: "Ehrfurcht öffnet" },
    sorrow: { tag: "resoniert", delta: 0.15, label: "Trauer schwingt tief" },
    hope: { tag: "lebendig", delta: 0.1, label: "Hoffnung belebt" },
    peace: { tag: "zähigkeit", delta: 0.1, label: "Friede härtet leise" },
    chaos: { tag: "stromleitung", delta: 0.15, label: "Chaos sprüht Funken" },
});
AnazhRealm.BOOST_EMOTION_DURATION = 30; // s, läuft mit Emotion mit
AnazhRealm.BOOST_EMOTION_REFRACT = 60; // s Pause nach Ablauf, sonst Endlos-Pulsen
AnazhRealm.BOOST_RESONANCE_RADIUS = 18; // m, in deren Nähe das Welt-Effekt-Boost greift
AnazhRealm.BOOST_RESONANCE_DELTA = 0.15; // +0.15 resoniert auf Spieler-Compound
AnazhRealm.BOOST_RESONANCE_LABEL = "Welt-Resonanz";

// NAMENSRAUM-DOKTRIN (taille-spec §6): die NACKTEN Tags sind der anazh-KERN — ihre Bedeutung ist
// eingefroren (eine Achse kann nur sterben [Gewicht 0] oder additiv geboren werden [Default 0]).
// Präfixierte Tags (`x:…`/`<welt>:…`) REISEN (must-preserve) und resonieren nur, wenn eine lokale
// Signatur die Achse führt — must-ignore ist strukturell (computePartTags/_blueprintResonance
// iterieren nur KERN-/SIGNATUR-Achsen). Die Signatur-Tabellen (FORM_ROLE_/WORKSHOP_DOMAIN_/
// MOTION_ROLE_SIGNATURES, Gewichte, k) sind WELT-LOKAL — forkbar, nie Teil der Taille.
AnazhRealm.MATERIAL_TAG_KEYS = Object.freeze([
    "härte",
    "dichte",
    "zähigkeit",
    "wärmeleitung",
    "stromleitung",
    "magieleitung",
    "transparent",
    "brennbar",
    "resoniert",
    "lebendig",
]);
// V17.90 (resonanz-system.md §2) — die Aktivierungs-Decke: computeCompoundTags gibt MAX(aktivierung[0..3] ·
// materialTag[0..1]); ÷3 normalisiert die Material-Tags des Produkt-Vektors auf [0..1] (= dieselbe Skala wie
// die Form-Achsen) → die FORM konkurriert mit dem MATERIAL in der Resonanz (heilt die Spektrum-Sättigung).
AnazhRealm.PRODUCT_VECTOR_TAG_NORM = 3;
// Ω-PHYSIS (wahrerbauplan §4) — die Tunables des Physik-Schiedsrichters. Der
// Richter ist ein GROB-Sanitäts-Richter (§1-Geltungsbereich), kein FEA-Simulator:
// diese Schwellen kalibrieren die groben Verstöße (Kippen, Knicken). browser-justierbar.
AnazhRealm.PHYSIS = {
    groundBandFrac: 0.15, // Ω-Φ2: das untere Höhen-Band, das als Bodenkontakt zählt
    bucklingSlendernessBase: 16, // Ω-Φ3-b: krit. Schlankheit (height/width) bei härte 0.5
    bucklingSlendernessMin: 8, //          Boden (ein weiches Material knickt früher)
    bucklingSlendernessMax: 28, //          Decke (ein hartes Material trägt schlanker)
    wallBraceRatio: 4, // Ω-Φ3-b: ab dieser Breite:Dicke ist ein Glied eine WAND (verstrebt), keine Säule
};
// Max. Wank-Amplitude (rad, ~9°) eines voll instabilen Werks in der Werkstatt-Vorschau; der
// Mechanismus (Physik → sichtbares Teetern) ist headless beweisbar, der Wert augen-justiert.
AnazhRealm.WORKSHOP_LEAN_AMP = 0.16;
// ═══ DIE KLASSISCHEN ORDNUNGEN ═══
// Kodifizierte Tempel-Proportionen: WÄHLT man die Ordnung, folgt alles daraus (Schlankheit ·
// Kanneluren · Kapitell · Gebälk); `_buildClassicalTemple` leitet den Tempel ab.
// ionisch = Parameter-Tausch (schlanker, Basis, 24 Rillen).
AnazhRealm.CLASSICAL_ORDERS = Object.freeze({
    dorisch: Object.freeze({
        slenderness: 7, // Schaft-Höhe : unterer Durchmesser (dorisch 1:7-8 — die stärkste Ordnung)
        topRatio: 0.82, // oberer ⌀ / unterer ⌀ (die Verjüngung nach oben)
        entasis: 0.05, // konvexe Schaft-Wölbung (gegen die optische Täuschung — DAS dorische Detail)
        flutes: 20, // Kanneluren (dorisch 20, an scharfen Graten getroffen)
        fluteDepth: 0.05,
        hasBase: false, // dorisch: KEINE Basis — der Schaft steht direkt auf dem Stylobat
        intercolumniation: 2.25, // Achs-Abstand in Durchmessern
        columnsFront: 6, // hexastyle (die ikonische Front)
        marble: 0xddd6c4,
        capitalColor: 0xe4ddca,
    }),
    ionisch: Object.freeze({
        slenderness: 9, // schlanker (1:9)
        topRatio: 0.84,
        entasis: 0.035,
        flutes: 24, // ionisch 24, durch flache Stege getrennt
        fluteDepth: 0.06,
        hasBase: true, // ionisch: Profil-Basis
        intercolumniation: 2.4,
        columnsFront: 6,
        marble: 0xe6e0d2,
        capitalColor: 0xeae3d4,
    }),
});
// ═══ DIE OAKESHOTT-TYPOLOGIE ═══
// Gemessene Klingen-Referenz (Querschnitt · Länge · Hohlkehle · distale Verjüngung, Längen in m);
// `_buildBladedWeapon` leitet die Klinge ab, die Balance folgt aus den Massen. Die EINE Quelle ist
// schmiede-core.OAKESHOTT_TYPES (Getter-Delegat, fail-closed: kalter Kern → null, nie ein Nachbau).
Object.defineProperty(AnazhRealm, "OAKESHOTT_TYPES", {
    get() {
        const core = (typeof globalThis !== "undefined" && globalThis.__schmiedeCore) || null;
        return (core && core.OAKESHOTT_TYPES) || null;
    },
});
// HSL-Spannweite je Architektur-Instanz (seed-deterministisch aus entry.tintH/S/V;
// HISM-instanceColor): ±8 % Hue (kühles bis warmes Grün, nie grell), ±10 % Sättigung, ±6 % Helligkeit.
AnazhRealm.INSTANCE_TINT = Object.freeze({ rangeH: 0.08, rangeS: 0.1, rangeV: 0.06 });
// Substanz-Antwort: microStrength = Oberflächen-Mikrostruktur, ao* = Kavitäts-AO. Default-Quelle in
// `_ensureAtmoUniforms` (SUBSTANCE_RESPONSE-Antennen lesen daraus); die Luftperspektive ist `LUFT`.
AnazhRealm.AERIAL = Object.freeze({
    microStrength: 0.14,
    aoStrength: 0.38,
    aoCap: 0.18,
});
// must-preserve (taille-spec §2): Größen-Wand für unbekannte Felder (ein Riesen-Feld ist ein
// Quota-DoS) + die known-Sätze der Serialize/Restore-Zwillinge; was hier NICHT steht, reist als
// opakes Unbekanntes (_carryUnknown).
AnazhRealm.TAILLE_UNKNOWN_FIELD_MAX = 8192;
// Stat-Klemme am LESER (taille-spec §3): je Achse die lokale Trag-Decke = max(Built-in-Materialien
// 1.0, Geburts-Clamp [0,1]) × Headroom 2. Fremde Substanz darüber ist nicht kaputt — sie ist hier
// nur so stark, wie diese Welt trägt.
AnazhRealm.MATERIAL_TAG_CEIL = Object.freeze(
    AnazhRealm.MATERIAL_TAG_KEYS.reduce((acc, key) => {
        acc[key] = 2;
        return acc;
    }, {})
);
AnazhRealm.BLUEPRINT_KNOWN_KEYS = Object.freeze([
    "name",
    "label",
    "builtIn",
    "parts",
    "connections",
    "role",
    "roleClaimed",
    "roleManual",
    "toolMeta",
    "portalMeta",
    "forgedPrecision",
    "signature",
    "authorPubKey",
    "signedHash",
    "signedAt",
    "signatureStatus",
    "provenance",
    // wear ist BEKANNT: _serializeBlueprint entscheidet selbst (wear < 1 reist, === 1 entfällt) — sonst
    // reichte _carryUnknown wear=1 blind durch.
    "wear",
    // PRÄGUNG-WELT — der Guss-Stempel (studioOv) ist BEKANNTES System-Feld:
    // der Serialize/Restore-Zwilling behandelt ihn explizit (Taille-Wand),
    // _carryUnknown darf ihn nie blind doppelt tragen.
    "studioOv",
]);
AnazhRealm.MATERIAL_KNOWN_KEYS = Object.freeze(["name", "label", "builtIn", "color", "tags"]);
AnazhRealm.TOOL_KNOWN_KEYS = Object.freeze([
    "name",
    "label",
    "builtIn",
    "isStarter",
    "opClass",
    "opName",
    "precisionCap",
    "sourceBlueprint",
    "domain",
]);
AnazhRealm.MANIFEST_KNOWN_KEYS = Object.freeze([
    "schemaVersion",
    "id",
    "label",
    "world",
    "dsl",
    "desc",
    "reachable",
    "importedAt",
    "trust",
    "authorPubKey",
    "signature",
    "signedHash",
    "signedAt",
    "provenance",
    "translated",
    "translatedAt",
    "scene",
    "vendored",
    "vendoredAt",
    "bundleHash",
    "serverMode",
    "multiplayer",
    // W18-B — die Ko-Präsenz-Deklaration (additives Minor-Wachstum, Ω6:
    // alte Builds bewahren sie als Unbekanntes, neue erkennen sie).
    "coPresence",
]);
AnazhRealm.MATERIAL_TAG_DEFAULTS = Object.freeze(
    AnazhRealm.MATERIAL_TAG_KEYS.reduce((acc, key) => {
        acc[key] = 0;
        return acc;
    }, {})
);
// Welle 5 B — räumliche Emergenz. Welche Formen wirken als „Spitzen" (Prinzip
// 1: Spitze richtet). Helix ist drin, weil ihr Ende eine Schraubspitze ist —
// nicht so scharf wie ein Kegel, aber funktional gerichtet.
AnazhRealm.SPATIAL_POINTED_SHAPES = Object.freeze(
    new Set(["cone", "pyramid", "octahedron", "helix", "bladeProfile", "pickHead"])
);
// Kontakt überträgt Wärme, Strom, Magie, Schwingung. lebendig nicht (Leben ist nicht kontagiös),
// brennbar nicht (Feuer-Ausbreitung wäre ein eigener Pfad).
AnazhRealm.SPATIAL_TRANSFERABLE_TAGS = Object.freeze(["wärmeleitung", "stromleitung", "magieleitung", "resoniert"]);
// Welche Formen bilden einen Hohlraum (Prinzip 2: Hohlraum enthält). Sphere
// (Glocke, Kristallkugel) und Torus (Ring, Singing Bowl) sind die zwei
// natürlichen Container — beide haben ein klares Innen-vs-Außen.
AnazhRealm.SPATIAL_HOLLOW_SHAPES = Object.freeze(new Set(["sphere", "torus"]));
// Compound-Bonus-Faktoren (SPATIAL_*_BONUS, weiter unten): multiplikativ auf die aggregierten
// Compound-Tags nach Standard-MAX, konservativ — der große Effekt entsteht aus der Kombination.
// MACRO_ANKER wohnt im Gelände-Gesetzbuch (gelaende-core.js, K09a).
// FEUCHTE (unten) — die fünfte Welt-Stimme (aus der Hydrosphäre abgeleitet, nicht Noise).
AnazhRealm.FEUCHTE = Object.freeze({
    flussReichweite: 26, // m jenseits der Fluss-Halbbreite, smoothstep-Fade
    hoeheNah: 1.5, // ≤ so hoch überm Wasserspiegel = voll feucht (Niederung)
    hoeheFern: 7, // ab so hoch überm Spiegel = trocken (der Höhen-Fade)
    hoeheGewicht: 0.85, // V6 (Look-Finale, 3): 0.6→0.85 — das FEUCHTE-DACH gehoben (breitere, sattere Niederungen → dichtere Wald-/Wiesen-Nähe); bit-identisch im Worker FEUCHTE_HOEHE_GEWICHT
    affinitaetGewicht: 0.8, // feuchte × lebendig in der Spawn-Affinität
    erdeGewicht: 0.35, // Γ1-Lesart Boden: feuchte hebt die erde-Achse beim Graben
    // Feuchte sichtbar: Vertex-Color-Mix einer dunkleren, satteren Erd-Schicht über der lebendig-Erde —
    // ein Ufer liest sich als Ufer, auch ohne Wasser im Frame. sichtbarLo/sichtbarHi = schmale, deutliche
    // Kurve (Niederungen kippen, trockener Boden bleibt earth). Bit-identisch im Worker
    // `attachFieldColors` (dort hardkodiert — jede Änderung in BEIDE).
    sichtbarLo: 0.3,
    sichtbarHi: 0.85,
});
// Platzierungs-Dichte: der Wald ist dicht, wo feucht+flach+niedrig, licht auf Hang+Höhe; alle Achsen
// mittelwert-nah (Gesamt-Baumzahl bleibt, die Verteilung wird Ökologie). Gelesen von
// `_placementStandAt` + `_placementDensityFactor` (EINE Quelle für Bäume + Unterwuchs).
AnazhRealm.PLACEMENT_DENSITY = Object.freeze({
    forestFreq: 0.006, // λ~170 m Wald-Stand (wie der Baum-Klump-Leser _clumpAt 0.006)
    meadowFreq: 0.025, // λ~40 m Unterwuchs: Dickicht ↔ magere Stelle
    clumpAmp: 1.6, // Stand-Amplitude (mittelwert-neutral um 1)
    clumpLo: 0.25, // offenes Land (Lichtung)
    clumpHi: 2.6, // geschlossener Wald-Kern
    slopeLo: 0.35, // ≤ so flach = voll (Wiese/Niederung); die Vorlagen-Flach-Präferenz
    slopeHi: 1.1, // ab so steil (|∇h|, AnazhRealm-Skala) = kahle Felswand
    wetBase: 0.7, // trockener Grund → licht
    wetGain: 0.9, // nass (moW→1) → ×1.6 (die Vorlagen-moW>0.8-Verdichtung)
    highAmp: 0.75, // Höhen-Lichtung-Stärke
    highLo: 12, // ab so hoch über Terrain-Basis beginnt das Lichten
    highHi: 45, // ab so hoch = kahler Grat (nur Rest-Dichte ×0.25)
});

// STEIN-GEOLOGIE (Vorlage `placeRocks`): Steine folgen dem HANG, nicht dem Zufall — drei Nischen,
// Schwellen auf AnazhRealms |∇h|-Skala (wie PLACEMENT_DENSITY):
//   FINDLING   — flacher Grund (sl ≤ findlingSlopeMax), gedrungener `brocken`, groß + isoliert
//   AUFSCHLUSS — steil UND hoch (aufschlussSlopeMin/aufschlussHeightMin), aufragend `nadel`/`stapel`
//   TALUS      — steil, aber nicht hoch (talusSlopeMin): kleiner, kantiger `geroell`-Schutt
// Der Mittelhang trägt keinen Fels. Gelesen von `_rockGeologyClass`/`_rockGeologyScale`.
AnazhRealm.ROCK_GEOLOGY = Object.freeze({
    findlingSlopeMax: 0.45, // ≤ so flach = Findling (die Vorlagen-sl<0.10, AnazhRealm-Skala)
    aufschlussSlopeMin: 0.7, // > so steil + hoch = Aufschluss/Grat (Vorlage sl>0.155)
    aufschlussHeightMin: 18, // relH über Terrain-Basis: erst hoch genug = Grat (Vorlage forestGroundH>2)
    talusSlopeMin: 0.85, // > so steil (nicht Grat) = Blockschutt/Talus (Vorlage sl>0.185)
    findlingScaleLo: 1.3, // Findling groß (Eiszeit-Erratiker)
    findlingScaleHi: 2.0,
    aufschlussScaleLo: 1.0, // Aufschluss aufragend (mittel-groß)
    aufschlussScaleHi: 1.7,
    talusScaleLo: 0.5, // Talus/Geröll klein (kantiger Schutt)
    talusScaleHi: 0.95,
});
// Die geologische FORM-Nische: welche `_rockVariant`-Form-Klassen passen zu jeder Nische
// (die Platzierung reicht BIS ZUR FORM — Findling gedrungen, Talus Streu, Aufschluss aufragend).
AnazhRealm.ROCK_GEOLOGY_FORMS = Object.freeze({
    findling: Object.freeze(["brocken"]), // gedrungener Fels-Brocken
    talus: Object.freeze(["geroell"]), // kantiger Schutt-Fächer
    aufschluss: Object.freeze(["nadel", "stapel"]), // aufragender Grat-Aufschluss
});

// UNTERWUCHS: das Kronendach-Licht ist die EINE Quelle für „wie viel Licht den Boden erreicht" (dichter Wald =
// dunkel, Lichtung = Wiese) — die Nah-Wiese und das Boden-Gesetz der Nah-Streu lesen es. Die Kronen-Deckung nutzt
// dieselben Treiber wie die Baum-Platzierung (`_placementStandAt("forest")` × wet × Höhe, ohne Slope/Perf) →
// konsistent mit dem echten Wald. `canopyK` = exp-Dämpfung des Bodenlichts.
AnazhRealm.UNDERGROWTH = Object.freeze({
    canopyK: 0.85, // exp(-cover·canopyK): Dach-Dämpfung des Bodenlichts (1=Lichtung, →0 dichtes Dach)
});

// DIE PLATZIERUNG DES KERNS (Leben-Schau 2, 09.10.): die Welt-Skala je Preset (`placement.scale`, `treeScaleMul`) lebt
// EINMAL in foundry-core.js (`PORTAL_RENDER_CONFIG.placement`) und reist synchron im Terrain-Namensraum — der Leser vor
// dem Buch (`_foundryWorldScaleMatrix`). Der Hand-Spiegel STUDIO_WORLD_SCALE (acht Baum-/Busch-Zeilen) fiel: ohne Fels-
// und Kristall-Zeilen kollidierte jeder Fels bis zum Buch in Vorlagen-Größe. Fehlt der Kern, bricht es laut.
AnazhRealm._studioPlatzKern = function () {
    const tc = typeof globalThis !== "undefined" ? globalThis.__terrainCore : null;
    const pl = tc && tc.PORTAL_RENDER_CONFIG ? tc.PORTAL_RENDER_CONFIG.placement : null;
    if (!pl || !pl.scale || typeof pl.treeScaleMul !== "number")
        throw new Error("Die Platzierung: foundry-core.js fehlt (__terrainCore.PORTAL_RENDER_CONFIG.placement)");
    return pl;
};
// Die Gestalten-Zahl einer Art aus dem Kern (`PORTAL_RENDER_CONFIG.lod.budget.gestalten`, synchron): die Budget-Zeile der
// Art, sonst '*' — dieselbe Regel wie `_foundryGestalten` am Buch (das Buch mischt die Zeilen der Zweit-Kerne hinzu, die
// Fels-Arten tragen nur die Zeilen dieses Kerns). Leser: der Fels-Blocker (`_felsBlockerParts`).
AnazhRealm._studioGestaltenKern = function (preset) {
    const tc = typeof globalThis !== "undefined" ? globalThis.__terrainCore : null;
    const rc = tc ? tc.PORTAL_RENDER_CONFIG : null;
    const G = rc && rc.lod && rc.lod.budget ? rc.lod.budget.gestalten : null;
    if (!G) return AnazhRealm._kernPflichtBruch("terrain:PORTAL_RENDER_CONFIG.lod.budget.gestalten");
    const V = Number.isInteger(G[preset]) && G[preset] >= 1 ? G[preset] : G["*"];
    if (!(Number.isInteger(V) && V >= 1)) return AnazhRealm._kernPflichtBruch("terrain:lod.budget.gestalten['*']");
    return AnazhRealm._solitaerVon(preset, V) || V;
};
// Die Gestalt des Solitärs einer Art mit V Bestand-Gestalten (K20, phyto-core `solitaerGestalt`: V+1 für eine Baum-Art mit
// V ≥ FREISTAND.ab), 0 = die Art trägt keinen. Leser: `_foundryGestalten`, `_studioGestaltenKern`, `_foundryGestaltOv`,
// `_foundryGestaltSame`.
AnazhRealm._solitaerVon = function (preset, V) {
    const tc = typeof globalThis !== "undefined" ? globalThis.__terrainCore : null;
    const rec = tc && tc.PHYTO_PRESETS ? tc.PHYTO_PRESETS[preset] : null;
    if (!rec || rec.kind !== "tree") return 0;
    const PC = globalThis.__phytoCore;
    if (!PC || typeof PC.solitaerGestalt !== "function") return AnazhRealm._kernPflichtBruch("phyto:solitaerGestalt");
    return PC.solitaerGestalt(rec.kind, V);
};
// Der Karten-Atlas wächst je 2 Schichten (`_impostorAtlasTexturen`, Start 8): je Schicht ~0,25 MB, das Wachsen kopiert nur beim
// Einzug einer Art (BC1-Albedo 170 KB + RGTC2-Normale 85 KB je Schicht, 512 px samt Mips; Mess-Wiese 18 Karten in 18 Schichten).
AnazhRealm.KARTEN_ATLAS_SCHRITT = 2;
// Das Gitter der Grundrisse (`_grundrissStand`): 32-m-Zellen, Zahlen-Schlüssel (die Streu fragt je Zelle).
AnazhRealm.GRUNDRISS_ZELLE = 32;
AnazhRealm._grundrissSchluessel = (gx, gz) => (gx + 0x8000) * 0x10000 + (gz + 0x8000);
// DER SOLITÄR (K20): die Prägung der Gestalt V einer Baum-Art (`_foundryGestaltOv`) — phyto-core growSkeleton liest
// `P.freistand`. Und das Inverse des Knuth-Faktors 2654435761 mod 2^32 (`_foundryGestaltSame`: der Same zum Eimer).
AnazhRealm.FREISTAND_OV = Object.freeze({ freistand: 1 });
AnazhRealm.KNUTH_INVERS = 244002641;
