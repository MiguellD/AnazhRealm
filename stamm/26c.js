// ===== ATLAS §26c · AUSSEN-KONSTANTEN — ab AnazhRealm.FOREST =====
// Wald-Generator (unten, Vorlage `plantForest`): variabel-radius Poisson-Disc mit
// Kronen-Schüchternheit + Arten-Nische. `crown` = Beästungsradius (m) bei Größe 1; `pack` = Zentren
// ≥ pack·(Ti+Tj); `dartsPerCell` = Kandidaten je Zelle; `slope*` = Boden-Grundierung für Klippen.
// Gelesen NUR von `_forestCellDarts`/`_forestPlantChunk`.
AnazhRealm.FOREST = Object.freeze({
    cell: 12, // Poisson-Zell-Raster (m) — Kronen-Schüchternheit liest ±2 Zellen
    pack: 1.16, // Zentren ≥ pack·(Ti+Tj): echte Lichtkonkurrenz (Vorlage PACK, kein Ineinanderwachsen)
    // 36 Darts/Zelle (0.25/m²) sättigen den dichten Kern (~15 Born-Kandidaten/Zelle = die
    // Sättigungs-Schwelle); der Überschuss stirbt an der Kronen-Schüchternheit. 48 kostete +30 %
    // Plant-Zeit für +1 % Bäume. Die Dart-Generierung (Terrain-Gates) dominiert — getragen vom
    // Zell-Memo in `_forestCellDarts`.
    dartsPerCell: 36, // Kandidaten-Darts/Zelle (Poisson-Sättigung im dichten Kern, Vorlage ~55)
    slopeLo: 0.35, // ≤ so flach (|∇h|) = voller Grund; die AnazhRealm-Boden-Tauglichkeit
    slopeHi: 1.25, // ab so steil = kahle Felswand (kein Baum)
    dryScale: 40, // Höhen-Trockenheit relH/dryScale (Vorlage e/18 → AnazhRealm-Höhen-Skala)
    crown: Object.freeze({
        baum_kiefer: 2.75, // Fichte-Nische — schmale Lichtkrone (trockene Höhen)
        baum_tanne: 2.95, // Tanne (höher/feuchter)
        baum_eiche: 5.2, // Eiche — breiter Beästungsradius (tiefe, feuchte Lagen)
        baum_birke: 3.2, // Birke — Pionier
        baum_erle: 4.5, // Weide-Nische — nasser Saum
        baum_mammut: 9.2, // Mammut-Nische — selten, riesig (dichte trockene Kerne)
    }),
});

AnazhRealm.SPATIAL_HOLLOW_BONUS = 0.3; // +30 % auf resoniert für beide Parts
AnazhRealm.SPATIAL_AXIS_BONUS = 0.3; // +30 % auf magieleitung + stromleitung
AnazhRealm.SPATIAL_ARRAY_BONUS = 0.4; // +40 % auf resoniert + magieleitung
// Verbindungstypen: je Typ `typeStrength` (Basis-Belastbarkeit 0..1) + `strongTags` (welche
// Material-Eigenschaften tragen — Hafting will härte+dichte, Lashing zähigkeit).
//   strength = typeStrength × avg(strongTags von Material A + B) × min(1, kontaktfläche)
// 0..3-Skala wie die Tag-Strahler; unter ~0.7 ist die Verbindung sichtbar fragil.
AnazhRealm.CONNECTION_TYPES = Object.freeze({
    // V18.110 — C7: intuitive deutsche Labels (S-Befund „die aktuellen
    // Benennungen sind unintuitiv, das Fundament passt") — die KEYS bleiben
    // (Persistenz/DSL), nur die Spieler-Sprache wird klar.
    hafting: Object.freeze({
        glyph: "⊕",
        label: "Stecken (Stiel in Loch)",
        description: "Stiel in Loch — Reibschluss",
        strongTags: Object.freeze(["härte", "dichte"]),
        typeStrength: 0.8,
    }),
    lashing: Object.freeze({
        glyph: "∾",
        label: "Binden (Umwicklung)",
        description: "Umwicklung — Zugfest",
        strongTags: Object.freeze(["zähigkeit"]),
        typeStrength: 0.6,
    }),
    pinning: Object.freeze({
        glyph: "⌖",
        label: "Stiften (Bolzen)",
        description: "Stift durch Loch — Scherung",
        strongTags: Object.freeze(["härte"]),
        typeStrength: 0.75,
    }),
    welding: Object.freeze({
        glyph: "✶",
        label: "Schweißen",
        description: "Atomar verschmolzen",
        strongTags: Object.freeze(["härte", "wärmeleitung"]),
        typeStrength: 0.95,
    }),
    gluing: Object.freeze({
        glyph: "≣",
        label: "Kleben",
        description: "Adhäsion — Schubfest",
        strongTags: Object.freeze(["zähigkeit"]),
        typeStrength: 0.55,
    }),
    masonry: Object.freeze({
        glyph: "⊞",
        label: "Mauern",
        description: "Druckschluss + Mörtel",
        strongTags: Object.freeze(["dichte"]),
        typeStrength: 0.7,
    }),
    sewing: Object.freeze({
        glyph: "✕",
        label: "Nähen",
        description: "Garn durch Material",
        strongTags: Object.freeze(["zähigkeit"]),
        typeStrength: 0.5,
    }),
    magic_bind: Object.freeze({
        glyph: "✦",
        label: "Magisch",
        description: "Tag-Resonanz",
        strongTags: Object.freeze(["magieleitung", "resoniert"]),
        typeStrength: 0.85,
    }),
    // ATTACHMENT-PUNKTE (GRIFF/SITZ/TRAGE): ein Punkt am Bauplan für die Außenwelt (Hand des Trägers,
    // Körper des Reiters, Torso unterm Panzer). partB optional (-1 = nur partA); `attachment: true` hält
    // sie aus der Statik (computeConnectionStrength) und den Gelenken (computeMotionRoles). Ohne
    // expliziten Punkt emergiert er per Form-Resonanz (_attachPointFor); der explizite ist der Override.
    griff: Object.freeze({
        glyph: "⊢",
        label: "Griff (hier greift die Hand)",
        description: "Attachment-Punkt: die Hand des Trägers",
        strongTags: Object.freeze([]),
        typeStrength: 0,
        attachment: true,
    }),
    sitz: Object.freeze({
        glyph: "⊓",
        label: "Sitz (hier sitzt der Reiter)",
        description: "Attachment-Punkt: der Körper des Reiters",
        strongTags: Object.freeze([]),
        typeStrength: 0,
        attachment: true,
    }),
    trage: Object.freeze({
        glyph: "◈",
        label: "Trage (liegt am Körper an)",
        description: "Attachment-Punkt: der Torso unterm Getragenen",
        strongTags: Object.freeze([]),
        typeStrength: 0,
        attachment: true,
    }),
});
AnazhRealm.CONNECTION_MAX_PER_BLUEPRINT = 64;
AnazhRealm.CONNECTION_SOLID_THRESHOLD = 0.7;
// Welle 5 C — Maschinen-Rekursivität. Vier Op-Klassen aus Konzept §3.1,
// als Whitelist für eigene Tool-Baupläne. Spieler kann nur diese vier
// vergeben — sonst kollidieren neue Op-Klassen mit MATERIAL_OP_COMPATIBILITY.
AnazhRealm.TOOL_OP_CLASSES = Object.freeze(new Set(["subtractive", "plastic", "additive", "phaseChange"]));
// Op-Name-Whitelist (a-z, -_, max 24 Zeichen) — verhindert injection in
// state.tools-Keys. Pure Sanitisierung, keine semantische Wertung.
AnazhRealm.TOOL_OP_NAME_PATTERN = /^[a-z0-9_-]{1,24}$/;
// Material × Op-Klassen-Kompatibilität. Eigene Materialien (define_material) gelten in
// applyOpToPart als „alle vier erlaubt".
AnazhRealm.MATERIAL_OP_COMPATIBILITY = Object.freeze({
    stein: Object.freeze(["subtractive"]),
    holz: Object.freeze(["subtractive", "additive"]),
    eisen: Object.freeze(["subtractive", "plastic", "additive", "phaseChange"]),
    bronze: Object.freeze(["subtractive", "plastic", "additive", "phaseChange"]),
    quarz: Object.freeze(["subtractive", "phaseChange"]),
    leder: Object.freeze(["subtractive", "plastic", "additive"]),
});

// V17.89 — die deutschen Verben der Op-Namen (für das Prozess-Menü + die Werkzeuge-Box). Eine Quelle.
AnazhRealm.OP_VERB_LABELS = Object.freeze({
    hand_knap: "behauen",
    forge_shape: "schmieden",
    brew: "brauen",
    weave: "weben",
    imbue: "beseelen",
    turn: "drehen",
});

// === Werkzeug-Domains + emergente Bauplan-Rolle ===
// Die Rolle eines Bauplans EMERGIERT aus den verwendeten Werkzeugen (wie Compound-Tags aus Material
// × Form). Built-in-Werkzeuge sind generisch (domain=null) und beeinflussen die Rolle nicht.
AnazhRealm.TOOL_DOMAINS = Object.freeze([
    "construction", // Architekturen, Welt-Bauten
    "forging", // Werkzeuge + Rüstungen aus Metall/Stein (Tag-split)
    "alchemy", // Konsumables, Tränke, Tinkturen
    "textile", // Rüstungen aus Stoff/Leder/Pflanzlich
    "soulwork", // Seelen-Avatare, rituelle Wesen
    "mechanism", // Maschinen, komplexe Werkzeug-Bauten
]);

// Dominante Domain → Bauplan-Rolle. Forging ist ein Sonderfall: die
// Rolle (tool vs armor) entscheidet sich erst aus den Compound-Tags
// — eine harte Klinge wird Werkzeug, eine dichte Platte wird Rüstung.
AnazhRealm.DOMAIN_TO_ROLE = Object.freeze({
    construction: "architecture",
    forging: "forging-split", // Sentinel, computeBlueprintRole handled das
    alchemy: "consumable",
    textile: "armor",
    soulwork: "soul",
    mechanism: "machine",
});

// Forging-Split: welche Compound-Tags ziehen den Bauplan zur tool-Seite (scharf, leitend) bzw. zur
// armor-Seite (dicht, zäh) — die Tag-Sprache entscheidet, kein Schalter. magieleitung zählt zu tool
// (Stäbe, Phylakte).
AnazhRealm.FORGING_TOOL_TAGS = Object.freeze(["härte", "magieleitung", "stromleitung"]);
AnazhRealm.FORGING_ARMOR_TAGS = Object.freeze(["dichte", "zähigkeit", "wärmeleitung"]);

// Default-Rolle, wenn keine Domain dominiert (alle generic + leere Chain): Welt-Architektur.
AnazhRealm.DEFAULT_BLUEPRINT_ROLE = "architecture";

// Welt-Portal: die same-origin Skelett-Welt-Seite im sandboxed iframe. portalMeta.world zeigt
// hierauf; _sanitizePortalMeta erlaubt nur worlds/-Pfade — kein fremdes Origin, CSP frame-src 'self'.
AnazhRealm.PORTAL_SKELETON_WORLD = "worlds/skeleton/index.html";
// KI-Übersetzer Phase 2 — der generische Renderer, der eine deklarative
// Szene aufbaut. Jede aufgebaute übersetzte Welt zeigt hierauf; ihre
// individuelle Szene reist im enter-Handshake (po.translatedWorldId).
AnazhRealm.PORTAL_TRANSLATED_WORLD = "worlds/translated/index.html";

// Die Welt-Registry: die EINE Quelle, welche Sub-Welten es gibt, je mit Pfad + DSL-Manifest (welche
// Wörter die Welt versteht) + Kurzbeschreibung (Bibliothek-Tab). Built-in-Portale beziehen ihr
// portalMeta hieraus; aimBlueprintAtWorld richtet eigene Magie-Ringe auf einen Eintrag.
AnazhRealm.WORLD_REGISTRY = Object.freeze({
    skeleton: Object.freeze({
        id: "skeleton",
        label: "Skelett-Welt",
        world: AnazhRealm.PORTAL_SKELETON_WORLD,
        dsl: Object.freeze(["skybox_color"]),
        desc: "Die ätherische Leere, an der das Portal-Protokoll geboren wurde — ein pulsierender Tor-Ring im Void.",
    }),
    fluid: Object.freeze({
        id: "fluid",
        label: "Strom-Welt",
        world: "worlds/fluid/index.html",
        dsl: Object.freeze(["weather", "skybox_color", "sturm", "ruhe", "set_turbulence"]),
        desc: "Ein Stable-Fluids-Solver: Tinte strömt, Stürme wirbeln. Eine fremde Engine mit eigener Three.js.",
    }),
    terrain: Object.freeze({
        id: "terrain",
        label: "Phytogenesis & Lithos",
        world: "worlds/terrain/index.html",
        // Das Morphologie-Labor (phytogenesis). Die id "terrain" bleibt — load-bearing für
        // Saves/Bauplan/Tests (stabile Identität, variable Gestalt). DSL: Presets + wald/neu +
        // Wetter/Jahreszeit/Tageszeit (den Himmel führt dort das Tag/Nacht-System).
        dsl: Object.freeze([
            "eiche",
            "fichte",
            "birke",
            "weide",
            "mammut",
            "tanne",
            "strauch",
            "blume",
            "gras",
            "findling",
            "basalt",
            "sediment",
            "zacken",
            "geroell",
            "kristalle",
            "wald",
            "neu",
            "klar",
            "bewoelkt",
            "nebel",
            "sturm",
            "fruehling",
            "sommer",
            "herbst",
            "winter",
            "tag",
            "nacht",
        ]),
        desc: "Das Morphologie-Labor: Bäume, Blumen und Felsen wachsen aus Gesetzen — mit begehbarem Wald, Tag/Nacht, Wetter und Jahreszeiten.",
    }),
    // Das FAHRZEUG-Labor (Rahmen · Gelenke · Lehren · Baukörper · Haut + Probefahrt), dasselbe
    // Vorlagen-Organ wie phytogenesis. DSL = die echten UI-Pfade: Gattungs-Presets + Kultur-Vektoren +
    // probefahrt/werkstatt (Fahr-Modus rein/raus).
    garage: Object.freeze({
        id: "garage",
        label: "Anatomie · Fahrzeug",
        world: "worlds/garage/index.html",
        dsl: Object.freeze([
            "gt",
            "supersport",
            "limousine",
            "kompakt-fwd",
            "suv",
            "cavallo",
            "toro",
            "stern",
            "vorsprung",
            "monolith",
            "probefahrt",
            "werkstatt",
        ]),
        desc: "Das Fahrzeug-Labor: Skelett, Soll-Maße und Lehren urteilen die Karosserie — fünf Gattungen, fünf Kulturen, fahrbare Probefahrt mit Reifenspuren.",
    }),
    // Das TOR-Labor: sieben Ordnungen (Drachentor bis Maurentor), Stich→Schub→Dicke-Lehre, fraktale
    // Tiefe, begehbare Türen (E/R).
    portale: Object.freeze({
        id: "portale",
        label: "Porta — Ordnungen & fraktale Tiefe",
        world: "worlds/portale/index.html",
        dsl: Object.freeze([
            "drachentor",
            "kathedrale",
            "maschine",
            "geisttor",
            "verkalkt",
            "ruine",
            "maurentor",
            "zufall",
        ]),
        desc: "Das Tor-Labor: sieben Portal-Ordnungen aus der Stich-Schub-Dicke-Lehre, fraktal vertieft, mit öffnenden Türen.",
    }),
    // Das KLINGEN-Labor: 21 Gattungen (Waffen + Werkzeuge), 4 Traditionen, Anschlag-Probe + Prüfstand.
    // schmiede-core.js (__schmiedeCore) ist die EINE generative Quelle für Shell UND Foundry. DSL = echte
    // UI-Pfade: Gattungen + Traditionen (Umlaute ASCII-gefaltet: saebel/grossschwert/faellaxt) +
    // anschlagen + stahl.
    schmiede: Object.freeze({
        id: "schmiede",
        label: "Anatomie · Klinge",
        world: "worlds/schmiede/index.html",
        dsl: Object.freeze([
            "langschwert",
            "saebel",
            "degen",
            "grossschwert",
            "dolch",
            "messer",
            "langbogen",
            "kriegsbogen",
            "reiterbogen",
            "recurvebogen",
            "streitkolben",
            "kriegsaxt",
            "kriegshammer",
            "keule",
            "faellaxt",
            "spaltmaul",
            "vorschlaghammer",
            "beil",
            "spitzhacke",
            "spaten",
            "schaufel",
            "frank",
            "nihon",
            "pars",
            "urvolk",
            "anschlagen",
            "stahl",
        ]),
        desc: "Das Klingen-Labor: Rückgrat, Schnittprofil und Lehren urteilen die Waffe — 21 Gattungen, 4 Traditionen, Anschlag-Probe und Prüfstand.",
    }),
    // Das HAUS-Labor: Fachwerkhaus, parametrisch + begehbar — 32 Kultur-Archetypen, Dorf-Modus
    // (Straßengraph, Mauer, Jahresringe). fachwerk-core.js (__fachwerkCore) ist die EINE generative
    // Quelle für Shell UND Foundry, inkl. Dorf-Quelle + exportSettlement. DSL = echte UI-Pfade: die 32
    // Kulturen über #pK (change) + "dorf"/"haus" über #pDorf.
    fachwerk: Object.freeze({
        id: "fachwerk",
        label: "Fachwerkhaus — parametrisch, begehbar",
        world: "worlds/fachwerk/index.html",
        dsl: Object.freeze([
            "alemannisch",
            "fraenkisch",
            "niedersaechsisch",
            "mittelalterlich",
            "holzhuette",
            "franzoesisch",
            "italienisch",
            "modern",
            "volle_moderne",
            "hochhaus",
            "roemisch",
            "tudor",
            "alpenchalet",
            "hollaendisch",
            "hanseatisch",
            "georgian",
            "viktorianisch",
            "griechisch",
            "spanisch",
            "andalusisch",
            "provenzalisch",
            "pueblo",
            "marokkanisch",
            "skandinavisch",
            "norwegisch",
            "russisch",
            "schwarzwald",
            "japanisch",
            "gotisch",
            "barock",
            "renaissance",
            "chinesisch",
            "dorf",
            "haus",
        ]),
        desc: "Das Haus-Labor: parametrisches Fachwerk, tragwerk-ehrlich und begehbar — 32 Kulturen, Dorf-Modus mit gewachsenen Siedlungen.",
    }),
    // Das MUSIK-Labor: 22 Genre-Presets aus Kompositions-Gesetzen + sechs DNA-Dials. klang-core.js
    // (__klangCore, meshfrei) ist die EINE Musik-Daten-Quelle (das Host-Lofi liest Tempo + Skala,
    // KLANG_HOST_RECIPE). DSL = die Genre-Buttons (#presets .presetBtn → applyPreset; Wörter =
    // lowercase-Lab-Namen; die Buch-id-Ausnahmen modern-klang/barock-klang gelten nur dem Buch).
    klang: Object.freeze({
        id: "klang",
        label: "Genesis — Generatives Musiksystem",
        world: "worlds/klang/index.html",
        dsl: Object.freeze([
            "blues",
            "bebop",
            "cooljazz",
            "freejazz",
            "boombap",
            "trap",
            "techno",
            "dnb",
            "reggae",
            "ambient",
            "barock",
            "minimal",
            "lofi",
            "modern",
            "bossa",
            "vibes",
            "funk",
            "latin",
            "dub",
            "synthwave",
            "cinematic",
            "rock",
        ]),
        desc: "Das Klang-Labor: 22 Genres aus Kompositions-Gesetzen und DNA-Dials — dieselbe Quelle, aus der das Host-Lofi Tempo und Skala liest.",
    }),
    // Das MENSCHEN-Labor: Morph-Dials · Haar/Kleidung · acht Bewegungs-/Emotionsprofile · Ninja-Park.
    // koerper-core.js (__koerperCore, meshfrei) ist die EINE Gestalt-/Motion-Daten-Quelle.
    // DSL = #emotions-Buttons (data-e → emo.set) + zufall/zuruecksetzen (btnRandom/btnReset).
    koerperstudio: Object.freeze({
        id: "koerperstudio",
        label: "Da Vinci Studio — Lebendiger Mensch",
        world: "worlds/koerperstudio/index.html",
        dsl: Object.freeze([
            "entspannt",
            "freude",
            "trauer",
            "wut",
            "angst",
            "rennen",
            "kampf",
            "showcase",
            "zufall",
            "zuruecksetzen",
        ]),
        desc: "Das Menschen-Labor: der lebendige Körper aus Morph-Dials, Bewegungsprofilen und Ninja-Park — die Quelle der Avatar-Gestalt-Daten.",
    }),
    // Das KREATUREN-Labor: Wolf/Fuchs/Bär/Hirsch aus fünf allometrischen Dials, CPG-Gangnetz + sechs
    // Bewegungsprofile. tetrapoda-core.js (__tetrapodaCore, meshfrei) ist die EINE Gestalt-/Motion-
    // Quelle (Erstkonsument `_motionStudioProfile`). DSL = Gattungs-Buttons (#presets, data-p) +
    // Profil-Buttons (#emotions, data-e); Wörter deutsch, ASCII-gefaltet (baer).
    tetrapoda: Object.freeze({
        id: "tetrapoda",
        label: "Tetrapoda — Evolution Lab",
        world: "worlds/tetrapoda/index.html",
        dsl: Object.freeze([
            "wolf",
            "fuchs",
            "baer",
            "hirsch",
            "entspannt",
            "freude",
            "jagd",
            "flucht",
            "wachsam",
            "showcase",
        ]),
        desc: "Das Kreaturen-Labor: Vierbeiner aus allometrischen Gesetzen — Gattungs-Dials, CPG-Gang und Bewegungsprofile als Daten-Quelle.",
    }),
    // Die erste UNTRUSTED Welt: fremde 2D-Boids-Engine im null-origin-iframe. trust:"sandboxed" → das
    // Portal entzieht allow-same-origin: voller Lauf drinnen, null Reichweite raus.
    schwarm: Object.freeze({
        id: "schwarm",
        label: "Schwarm-Welt",
        world: "worlds/schwarm/index.html",
        dsl: Object.freeze(["sturm", "ruhe", "schwaermen", "skybox_color"]),
        desc: "Ein 2D-Schwarm aus hunderten Wesen — eine fremde Engine, die null-origin sandgesichert läuft, ohne AnazhRealm je zu berühren.",
        trust: "sandboxed",
    }),
    // Ko-Präsenz-Welt: eine fremde single-player-Engine, die das Ko-Präsenz-Protokoll deklariert
    // (peer-join/peer-state/peer-leave); das Mesh liefert die Posen der Gefährten, die Welt rendert sie
    // selbst. Null-origin sandgesichert (das Protokoll quert die volle Wand).
    begegnung: Object.freeze({
        id: "begegnung",
        label: "Begegnungs-Feld",
        world: "worlds/begegnung/index.html",
        dsl: Object.freeze([]),
        desc: "Ein stilles Lichter-Feld — eine fremde single-player Engine, in der ihr euch trotzdem seht: AnazhRealm injiziert die Ko-Präsenz übers Mesh.",
        trust: "sandboxed",
        coPresence: true,
    }),
});

// Vendor-Limits: MÜSSEN mit save-server.js (VENDOR_MAX_*) übereinstimmen — der Server ist die
// maßgebliche Wand, _vendorSanitizeBundle nur die freundliche Vorab-Prüfung.
AnazhRealm.VENDOR_LIMITS = Object.freeze({
    maxFiles: 64,
    maxFileBytes: 4 * 1024 * 1024,
    maxTotalBytes: 12 * 1024 * 1024,
    allowedExt: Object.freeze(["html", "htm", "js", "mjs", "css", "json", "txt", "md", "glsl"]),
});

// Deutsche Labels für die Welt-Anzeige. Werkstatt-Status zeigt diese
// statt der englischen Rolle-IDs.
AnazhRealm.BLUEPRINT_ROLE_LABELS = Object.freeze({
    architecture: "Bauwerk",
    tool: "Werkzeug",
    armor: "Rüstung",
    weapon: "Waffe",
    consumable: "Konsumable",
    soul: "Seele",
    machine: "Maschine",
    portal: "Portal",
    vehicle: "Fahrzeug", // M2
    "workshop-station": "Werkstatt",
});

// Farb-Sprache: jede Rolle eine feste Farbe (Rollen-Chip + Werkstatt-Zeile) — Bauwerk Stein-Erdgrau,
// Werkzeug Schmiede-Rot, Rüstung Stahl-Blau, Konsumable Violett, Seele Cyan, Maschine Bronze,
// Portal Tor-Grün.
AnazhRealm.BLUEPRINT_ROLE_COLORS = Object.freeze({
    architecture: "#9a9088",
    tool: "#c44830",
    armor: "#7d96b8",
    consumable: "#a878b8",
    soul: "#88e1e1",
    machine: "#b08648",
    portal: "#43c98a",
    vehicle: "#c98a43", // M2 — Wagen-Ocker (Reise/Leder)
    "workshop-station": "#cc6b35", // M2 — Essen-Glut (die Designation sichtbar)
});

// Werkzeug-Domain-Labels (deutsch) für UI-Anzeige. null = generic
// (zeigt keinen Domain-Indikator).
AnazhRealm.TOOL_DOMAIN_LABELS = Object.freeze({
    construction: "Konstruktion",
    forging: "Schmiede",
    alchemy: "Alchemie",
    textile: "Weberei",
    soulwork: "Seelenkunst",
    mechanism: "Mechanik",
});

// Domain-Farben für visuelle Wiedererkennung der Werkstatt-Zugehörigkeit.
AnazhRealm.TOOL_DOMAIN_COLORS = Object.freeze({
    construction: "#9aaeb8", // Stein-Grau-Blau
    forging: "#c44830", // Glut-Rot
    alchemy: "#a878b8", // Magie-Violett
    textile: "#d4b076", // Sand-Beige
    soulwork: "#88e1e1", // Geist-Cyan
    mechanism: "#b08648", // Bronze
});

// Welt-Werkstatt-Radius (m): der Spieler muss so nah an einer Architektur mit passender EMERGENTER
// Domäne stehen (vom Spawn-Punkt des neuen Bauplans), sonst lehnt confirmBuild im pfad-Modus ab.
// 32 m (2 Chunk-Breiten) deckt eine Basis — „in der Nähe" meint das Werkstatt-Areal. Gilt für die
// Prozess-Erkennung UND das Schmiede-Tor.
AnazhRealm.WORKSHOP_PROXIMITY_M = 32;
// Größen/Masse-Stat-Faktor (_compoundSizeFactor): Σ-SUBSTANZ-Volumen der Parts gegen diese Referenz
// (~0.06 m³ = typisches Hand-Werk → ~1.0), sanfte Potenz, gebounded — nie das Hüll-Volumen
// (Auseinanderzieh-Exploit). Massiger → mächtiger + träger.
AnazhRealm.SIZE_STAT_REF_SUBSTANCE = 0.06;
AnazhRealm.SIZE_STAT_EXPONENT = 0.15;
AnazhRealm.SIZE_STAT_MIN = 0.75;
AnazhRealm.SIZE_STAT_MAX = 1.6;
// V17.90 — die INVERS-dichte Stats (0.8 + (1−dichte)·…): ihr Tag-Input MUSS auf [0,1] gekappt bleiben, sonst
// macht dichte>1 sie negativ. Der Werte-Readout liest sie aus dem tagsLo-Set (die schweren Stats aus tagsHi).
AnazhRealm.INVERSE_DICHTE_STATS = Object.freeze({ attackSpeed: true, speed: true, jumpPower: true, staminaMax: true });
// V17.76 Welle 2 — die Präzisions-Kapazität einer Werkstatt-Station aus ihrer SUBSTANZ (Material × Form):
// base (eine schlichte Werkstatt) + dichte/härte (eine dichte, harte Esse hält feinere Toleranzen), gedeckelt.
// So emergiert „bessere Esse → höherer Cap" aus den Materialien (kein Crafting-Zirkel). Browser-justierbar.
AnazhRealm.WORKSHOP_PRECISION = Object.freeze({
    base: 0.5,
    fromDichte: 0.28,
    fromHärte: 0.2,
    dichteRef: 2.7,
    max: 0.98,
});

// Maschinen-Bonus: ein als Werkzeug registrierter Bauplan mit role="machine" hebt die min-Präzision
// der Parts (Maschine präziser als Handarbeit), gedeckelt auf 1.0.
AnazhRealm.MACHINE_PRECISION_BONUS = 0.05;

// S1 (kampf-plan §11.7) — bis zu dieser Bauplan-Spannweite (m) liest die Werkstatt die
// in-der-Hand-Lesart (Klinge/Brecher); größere Baupläne sind Bauwerke/Strukturen (kein
// „Brecher" auf einem Dorf). Browser-justierbar (Hand bis Großschwert ja, Dorf/Tempel nein).
AnazhRealm.IMPLEMENT_GRASP_SPAN_M = 6;

// === Compound-Tag-Affordances ===
// Die Welt leitet Verhaltens-Flags emergent aus Material × räumlicher Verteilung ab — KEINE
// Form-Whitelists, keine Bauplan-Namen-Tabelle:
//   moveable   — Stütz-Konfiguration (≥2 Parts in der unteren bbox-Hälfte) + dichte (Trägheit)
//                + Antriebs-Tag (magieleitung oder stromleitung)
//   magnifying — transparent ≥ Schwelle + Parts entlang einer Achse (axialer Aufbau)
//   focusing   — transparent + wärmeleitung (reine Tag-Sprache)
AnazhRealm.AFFORDANCE_THRESHOLDS = Object.freeze({
    moveable: Object.freeze({
        minSupportParts: 2, // ≥2 Parts in unterer bbox-Hälfte
        midlineFactor: 0.5, // unten = unter bbox-Mitte (relativ!)
        supportSpreadMin: 0.35, // V17.11 — Stütz-Parts spreizen ≥35 % der Breite
        //   (Trag-Basis: Räder/Beine quer) — eine schmale Säule (Baum-Stamm-
        //   Stapel, Spreizung ~0) ist KEIN Fahrzeug. Emergent, kein Form-Flag.
        dichteMin: 0.3, // Compound muss Trägheit haben
        antriebTagMin: 0.3, // magieleitung ODER stromleitung
    }),
    magnifying: Object.freeze({
        transparentMin: 0.5, // Compound transparent-Tag
        axialAlignmentMin: 0.6, // ≥60 % der Parts auf einer Linie
        minAxialParts: 2, // mind. 2 Parts für eine Achse
    }),
    focusing: Object.freeze({
        transparentMin: 0.5,
        wärmeMin: 0.3,
    }),
    // radiating: resoniert über Schwelle + radiale Spreizung (Parts nicht auf einer Achse). resoniertMin
    // = WORLD_EFFECT_THRESHOLDS.resonance_strong (1.5), dieselbe Schwelle, ab der die Symphonie
    // verdichtet — ein Stein-Dorf (~0.6) strahlt nicht, eine Quarz-Form (~1.8) schon.
    radiating: Object.freeze({
        minParts: 3, // ein Einzelteil hat keine Spreizung
        resoniertMin: 1.5, // das Compound schwingt STARK — es strahlt
        radialMax: 0.6, // axiale alignmentRatio UNTER 0.6 → radial, kein Mast
    }),
    // broadcasting: leitfähiger, aufrechter Mast (Relais) — axial entlang y + Leitfähigkeit.
    // Komplementär zu radiating: radialMax 0.6 ↔ alignMin 0.6 trennt radial von axial sauber.
    broadcasting: Object.freeze({
        minParts: 3, // ein Mast braucht mehrere Parts
        alignMin: 0.6, // ≥60 % der Parts auf der (vertikalen) Achse
        leitfaehigMin: 0.4, // stromleitung ODER magieleitung — es trägt ein Signal
    }),
    // W10 ext. — balancing: ein breites, bodenlastiges, schweres Compound
    // (Fundament). Breite Basis + tiefer Schwerpunkt + genuin schwer.
    balancing: Object.freeze({
        minParts: 3,
        wideMin: 1.0, // horizontale Spannweite ≥ vertikale (breiter als hoch)
        bottomHeavyMin: 0.6, // ≥60 % der Parts in der unteren bbox-Hälfte
        dichteMin: 1.5, // genuin schwer (= resonance_strong-Niveau, kein Gate-Tief)
    }),
    // W10 ext. — lifting: ein magie-geladenes, leichtes Compound (Auftriebs-
    // Feld). Stark magie-geladen + genuin leicht — das Komplement zu
    // balancing (dichteMax 1.0 ↔ balancing.dichteMin 1.5).
    lifting: Object.freeze({
        minParts: 3,
        magieMin: 1.5, // stark magie-geladen — es trägt die Hebe-Energie
        dichteMax: 1.0, // genuin leicht — Magie hebt kein Gewicht
    }),
});

// Substanz-Rolle: Schwellen für body (Seele aus Körper-Symmetrie) + food (Nahrung aus lebendig +
// weich). Bewusst KEIN 11. Material-Tag — Nahrung emergiert aus den bestehenden Tags.
AnazhRealm.SUBSTANCE_ROLE_THRESHOLDS = Object.freeze({
    body: Object.freeze({
        minParts: 3, // ein Körper hat mehrere Teile
        symmetryMin: 0.78, // Anteil Parts mit Spiegel-Partner (bilateral)
        minLimbPairs: 1, // ≥1 echtes Off-Achsen-Spiegel-Paar (Glieder)
        offAxisMin: 0.18, // |x − Zentrum| / spanX ab dem ein Part "Glied" ist
        mirrorTol: 0.35, // Spiegel-Such-Toleranz, relativ zur Compound-Größe
        verticalMin: 0.45, // Y-Spanne ≥ 45 % der horizontalen — ein Körper
        // "steht"; ein flaches Dorf (Hütten in der xz-Ebene) fällt raus.
        // Lebendige Masse in der Mitte: livingMassMin = Σ(vol·lebendig) > 0.02; livingCenterMinY/MaxY
        // klemmt den Y-Schwerpunkt der lebendigen Masse relativ zur Positions-BBox auf [0.25, 0.80]
        // (ein Körper liegt bei ~0.75; Pilz-Krone > 0.80 und Bodenflora < 0.25 fallen raus).
        livingMassMin: 0.02,
        livingCenterMinY: 0.25,
        livingCenterMaxY: 0.8,
    }),
    food: Object.freeze({
        lebendigMin: 0.6, // klar lebendig (Fleisch, Laub, Frucht)
        härteMax: 0.5, // weich genug zum Essen
    }),
    // Tor-Signatur: die begehbare Größe misst _avatarPassageSize an der Ausdehnung des Reisenden
    // (Drachen-Tor > Menschen-Tor). magieleitungMin: ein Tor leitet Magie — Stein-/Eisen-Ring bleibt
    // darunter, Quarz-Ring darüber.
    portal: Object.freeze({
        magieleitungMin: 1.3,
    }),
});

// Werkstatt-Domäne als Resonanz-Signaturen: je Domäne ein Vektor über die Material-Tags (negative
// Gewichte = Invers-Achsen); _computeWorkshopDomain nimmt das ARGMAX (`_blueprintResonance`), null
// unter dem Floor (trennt Werkstatt von bloßer Struktur). alchemy = durchsichtiges Gefäß · mechanism
// = strom-/wärme-leitender Apparat · soulwork = magie-leitender Kanal · forging = dichte, hitze-
// tragende Masse · textile = weicher, zäh-lebendiger Rahmen. Baseline eingefroren (checkBandV1767).
AnazhRealm.WORKSHOP_DOMAIN_SIGNATURES = Object.freeze({
    alchemy: Object.freeze({ transparent: 1.0 }),
    mechanism: Object.freeze({ stromleitung: 1.0, wärmeleitung: 0.2 }),
    soulwork: Object.freeze({ magieleitung: 1.0, resoniert: 0.2 }),
    forging: Object.freeze({ dichte: 1.0, wärmeleitung: 0.3 }),
    textile: Object.freeze({ zähigkeit: 1.0, lebendig: 1.0, härte: -1.0 }),
});
AnazhRealm.WORKSHOP_DOMAIN_RESONANCE_FLOOR = 2.0;

// SOULLESS_SUBSTANCES — lebendig, aber unbeseelt: Pflanze + Erde leben, tragen aber keine Seele.
// `_blueprintProductVector.livingBody` liest `lebendig` nur über Materialien AUSSERHALB dieser Menge
// → ein reiner holz+laub-Baum fällt emergent auf architecture, ein Wesen behält die Seele.
// FORM_ROLE_SIGNATURES (unten) — Rolle als Resonanz des vollen Produkt-Vektors (Tags ⊕
// bodyShape/portalShape): computeBlueprintRole = opChain-Domäne (Vorrang), sonst ARGMAX dieser
// Signaturen (`_computeFormRole`); setBlueprintAs* bleibt Override (roleManual). Konjunktive
// Geometrie lebt im Feature (0/1), die Disjunktion im argmax. architecture ist POSITIV (dicht,
// hart) — ein Stein-Tempel mit Körper-Geometrie wird Bauwerk; soul liest `livingBody`, portal
// `portalShape`, vehicle rideable (sitz ∧ moveable); `bulk` hält große Bäume aus consumable.
// Floor → architecture; Baseline eingefroren (checkBandV1768).
AnazhRealm.SOULLESS_SUBSTANCES = Object.freeze(new Set(["holz", "laub", "kraut", "erde"]));
AnazhRealm.FORM_ROLE_SIGNATURES = Object.freeze({
    soul: Object.freeze({ livingBody: 1.4, lebendig: 0.4 }),
    portal: Object.freeze({ portalShape: 1.6 }),
    vehicle: Object.freeze({ rideable: 1.8, spread: 0.3 }),
    // Gegen-Achse spread: ein Trank hat keine Trag-Basis (Wagen 1.0, Holzross 0.77, Trank 0) — ein
    // toter Holz-Kasten ohne Sitz wird Bauwerk statt Trank.
    consumable: Object.freeze({ lebendig: 1.5, härte: -0.5, bulk: -0.8, spread: -0.6 }),
    architecture: Object.freeze({ dichte: 1.0, härte: 0.6, bulk: 0.3 }),
});
// Der Floor auf die NORMALISIERTE Skala gesenkt (A1: Material-Tags jetzt [0..1] statt [0..3] → die rohen
// Resonanzen fielen ~3× → der alte 0.5-Floor schluckte z.B. den Trank in den architecture-Default).
AnazhRealm.FORM_ROLE_RESONANCE_FLOOR = 0.35;

// DAS EINE ROLLEN-SIGNATUR-REGISTER: jede Rolle als VOLLE Signatur über alle Achsen (10
// Material-Tags ⊕ Form-Achsen) — die EINE Wahrheit „was ist eine gute X" für alle Leser
// (Rolle-Passung, Klassifikation, Katalysator-Readout). _blueprintResonance liest den vollen
// Produkt-Vektor; negative Gewichte = Gegen-Achsen (Klinge NICHT zäh, Trank NICHT hart, Gerät
// NICHT hohl).
AnazhRealm.ROLE_SIGNATURES = Object.freeze({
    // GERÄTE (gehaltenes Implement): held = der generische Slot (scharf ODER schwer, hart, gestreckt, nicht hohl).
    held: Object.freeze({
        pointedFraction: 1.2,
        härte: 0.8,
        dichte: 0.5,
        elongation: 0.6,
        zähigkeit: 0.2,
        hollowness: -0.3,
    }),
    // V17.90 — der lebendig-Distinguisher trennt Waffe/Werkzeug bei sonst gleicher Spitz-Form: ein WERKZEUG hat
    // einen organischen GRIFF (Holzstiel → lebendig+), eine WAFFE ist totes Metall (lebendig−). So liest ein
    // Pickel mit Holzstiel „Werkzeug", ein reines Metall-Schwert „Waffe".
    weapon: Object.freeze({
        pointedFraction: 1.5,
        härte: 1.0,
        elongation: 0.8,
        dichte: 0.7,
        zähigkeit: -0.5,
        lebendig: -0.5,
    }),
    tool: Object.freeze({
        pointedFraction: 1.1,
        härte: 0.9,
        elongation: 0.5,
        dichte: 0.2,
        zähigkeit: 0.4,
        lebendig: 0.5,
    }),
    brecher: Object.freeze({ dichte: 1.3, härte: 0.6, zähigkeit: 0.4, pointedFraction: -0.8 }),
    // RÜSTUNG: dicht, hart, zäh, leicht hohl (Polster), nicht spitz, mit Standfläche.
    armor: Object.freeze({
        dichte: 1.0,
        härte: 0.9,
        zähigkeit: 0.4,
        hollowness: 0.2,
        spread: 0.2,
        pointedFraction: -0.4,
    }),
    // TRANK: lebendig, transparent, resonant, hohl (Behälter), weich. Die Gegen-Achsen (keine Masse,
    // keine Trag-Basis) spiegeln FORM_ROLE_SIGNATURES — eine Wahrheit, alle Leser.
    consumable: Object.freeze({
        lebendig: 1.5,
        transparent: 0.4,
        resoniert: 0.3,
        hollowness: 0.3,
        härte: -0.6,
        bulk: -0.8,
        spread: -0.6,
    }),
    // SEELE: ein LEBENDIGER Körper (livingBody = Körper-Form UND lebendig, V17.90 — ein toter Körper-Panzer
    // ist KEINE Seele) + lebendig-Gradient + Symmetrie/Resonanz für die Feinheit.
    soul: Object.freeze({ livingBody: 1.8, lebendig: 0.6, axialSymmetry: 0.4, bodyShape: 0.3, resoniert: 0.2 }),
    // PORTAL: Ring-Form, magie-leitend, transparent, resonant.
    portal: Object.freeze({ portalShape: 2.0, magieleitung: 1.0, transparent: 0.5, resoniert: 0.4 }),
    // FAHRZEUG: Trag-Basis, zäh, gestreckt, angetrieben (magie/strom), tot, mittel-dicht; + rideable
    // (sitz ∧ moveable) = die Fahrzeug-Essenz. Die gerechnete Fahr-Physik führt: `stability` (CoM über
    // dem Rad-Stützpolygon) + `rollable`; `spread` gesenkt → ein kopflastiges Schein-Fahrzeug liest
    // schwächer.
    vehicle: Object.freeze({
        rideable: 1.0,
        stability: 0.7,
        rollable: 0.7,
        spread: 0.8,
        zähigkeit: 1.0,
        elongation: 0.4,
        magieleitung: 0.4,
        stromleitung: 0.4,
        dichte: 0.2,
        lebendig: -0.4,
    }),
    // MASCHINE: leitend, warm, dicht, standfest.
    machine: Object.freeze({ stromleitung: 1.4, wärmeleitung: 0.5, dichte: 0.6, spread: 0.5 }),
    // WERKSTATT: solide Substanz (Präzision) + Standfläche; die Domäne emergiert separat (R1).
    "workshop-station": Object.freeze({ dichte: 1.0, härte: 0.7, spread: 0.3 }),
    // BAUWERK: massiv, hart, standfest, nicht spitz. Standfest wird gerechnet: `stability` (CoM über
    // Stützpolygon) + `loadSound` (Lastpfad zum Boden intakt), nicht aus `spread` geraten.
    architecture: Object.freeze({
        dichte: 1.2,
        härte: 0.7,
        stability: 0.5,
        loadSound: 0.5,
        spread: 0.25,
        pointedFraction: -0.6,
    }),
});
// Passung ∈ [min, max] (1.0 = neutral): gut geformt → max (Buff), form-fremd → min (Nerf). Der ref
// je Rolle normalisiert ≈ die Resonanz des perfekten Katalysators (Material-Tags auf [0..1]) →
// Archetyp ~1.0, typisches Werk ~0.5–0.7 (das Spektrum spreizt).
AnazhRealm.QUALITY_ROLE_FIT = Object.freeze({
    min: 0.8,
    max: 1.2,
    refs: Object.freeze({
        held: 2.6,
        weapon: 2.8,
        tool: 2.6,
        brecher: 2.3,
        armor: 2.4,
        consumable: 1.1,
        soul: 2.3,
        portal: 2.3,
        vehicle: 3.4,
        machine: 3.2,
        "workshop-station": 2.7,
        architecture: 2.5,
    }),
});
// U3 (resonanz-system.md §5) — die Labels für den Katalysator-Readout (das Rollen-Spektrum + die Achse zum
// perfekten Katalysator). Deutsch, browser-justierbar.
AnazhRealm.ROLE_LABELS = Object.freeze({
    held: "Gerät",
    weapon: "Waffe",
    tool: "Werkzeug",
    brecher: "Brecher",
    armor: "Rüstung",
    consumable: "Trank",
    soul: "Seele",
    portal: "Tor",
    vehicle: "Fahrzeug",
    machine: "Maschine",
    "workshop-station": "Werkstatt",
    architecture: "Bauwerk",
});
AnazhRealm.AXIS_LABELS = Object.freeze({
    pointedFraction: "Schärfe",
    elongation: "Streckung",
    härte: "Härte",
    dichte: "Dichte",
    zähigkeit: "Zähigkeit",
    hollowness: "Hohlraum",
    axialSymmetry: "Symmetrie",
    spread: "Standfläche",
    lebendig: "Lebendigkeit",
    transparent: "Transparenz",
    resoniert: "Resonanz",
    magieleitung: "Magie-Leitung",
    stromleitung: "Strom-Leitung",
    wärmeleitung: "Wärme-Leitung",
    brennbar: "Brennbarkeit",
    bodyShape: "Körper-Form",
    portalShape: "Tor-Form",
    // Ω-L1 (wahrerbauplan §5) — die GERECHNETEN Physik-Achsen (Säule I).
    stability: "Standfestigkeit",
    stiffness: "Steifigkeit",
    balance: "Balance",
    leverage: "Hebelwucht",
    loadSound: "Lastpfad",
    rollable: "Rollfähigkeit",
});
// Geltungsbereich jeder Achse (Warum-Chip + Werkstatt): „physik" = gerechnete Wahrheit mit externem
// Richter (darf Wahrheit behaupten); „konvention" = AnazhRealms erfundene, konsistente Welt-Physik
// (behauptet nur Konsistenz); „form" = geometrischer Stellvertreter.
AnazhRealm.AXIS_CLASS = Object.freeze({
    // PHYSIKALISCH — Material-Eigenschaften mit echtem Richter
    härte: "physik",
    dichte: "physik",
    zähigkeit: "physik",
    wärmeleitung: "physik",
    stromleitung: "physik",
    transparent: "physik",
    brennbar: "physik",
    // PHYSIKALISCH — gerechnete Größen (Säule I, Ω-Φ1..Φ5)
    stability: "physik",
    stiffness: "physik",
    balance: "physik",
    leverage: "physik",
    loadSound: "physik",
    rollable: "physik",
    // KONVENTION — AnazhRealms erfundene Welt-Physik (kein physikalischer Richter)
    magieleitung: "konvention",
    resoniert: "konvention",
    lebendig: "konvention",
    // FORM — geometrische Stellvertreter (Übergangs-Fallback, §5 Ω-L1)
    pointedFraction: "form",
    elongation: "form",
    hollowness: "form",
    axialSymmetry: "form",
    spread: "form",
    bodyShape: "form",
    portalShape: "form",
    livingBody: "form",
    rideable: "form",
    bulk: "form",
});
AnazhRealm.AXIS_CLASS_LABEL = Object.freeze({ physik: "gerechnet", konvention: "Welt-Konvention", form: "Form" });
// §7.3(b) (V18.164) — KONJUNKTIONS-Achsen (0/1) sind TATEN, keine Zahlen: die
// WARUM-Führung (_blueprintRoleGapHint) spricht sie als deutsche Handlung aus.
AnazhRealm.AXIS_ACTION_HINTS = Object.freeze({
    rideable: "setze einen Sitz-Anker (Fahrzeug = Sitz + Antrieb)",
    livingBody: "nutze lebendiges Material am Körper",
    bodyShape: "forme einen Körper (symmetrisch · vertikal · Glieder)",
    portalShape: "forme einen Ring in Reisenden-Größe",
    // Die gerechneten Physik-Achsen bekommen ihr physik-wahres Verb: der Hinweis zitiert das Gesetz
    // (die Tat verschiebt die gerechnete Größe messbar in die versprochene Richtung).
    stability: "verbreitere die Basis (Schwerpunkt sicher über der Standfläche)",
    loadSound: "schließe den Lastpfad zum Boden (kein schwebendes Teil)",
    rollable: "setze runde Räder an den Boden (rollt um eine freie Achse)",
    stiffness: "lege Material weg von der Biegeachse (Hohlrohr/I-Profil statt Vollstab)",
    balance: "verlagere die Masse zum Griff (näher balanciert → schnellere Führung)",
    leverage: "rücke die Kopfmasse nach vorn (längerer Hebel → mehr Wucht)",
});

// Katalysator-Op aus der Form: opClass = argmax-Resonanz des Produkt-Vektors (Tags ⊕
// pointedFraction). subtractive = scharfe/spitze Klinge (pointedFraction dominiert); plastic =
// stumpfe, dichte Masse (Hammer); phaseChange = magie-leitender Stab (magie schlägt sogar die Spitze
// einer Helix). additive ist form-mehrdeutig (Mörser ≈ Hammer) → schwache Residual-Signatur
// (weich/zäh/lebendig), reine Misch-Absicht bleibt Hand-Override. Material-Gewichte sind auf die
// [0..1]-Tag-Skala angehoben (sonst schlüge pointedFraction sie). Wächter: checkBandV1771.
AnazhRealm.OP_CLASS_SIGNATURES = Object.freeze({
    subtractive: Object.freeze({ pointedFraction: 2.3, härte: 0.2 }),
    plastic: Object.freeze({ dichte: 1.8, härte: 0.5 }),
    phaseChange: Object.freeze({ magieleitung: 3.0 }),
    additive: Object.freeze({ zähigkeit: 1.5, lebendig: 1.5, härte: -1.0 }),
});
// Der Standard-opName je opClass (die opChain-„Geschichte"; die opClass treibt die Material-Kompatibilität).
AnazhRealm.OP_NAME_BY_CLASS = Object.freeze({
    subtractive: "carve",
    plastic: "forge",
    phaseChange: "imbue",
    additive: "mix",
});

// Deutsche Affordance-Labels für UI-Anzeige.
AnazhRealm.AFFORDANCE_LABELS = Object.freeze({
    moveable: "fahrbar",
    magnifying: "vergrößernd",
    focusing: "bündelnd",
    radiating: "strahlend",
    broadcasting: "sendend",
    balancing: "gründend",
    lifting: "hebend",
});
// W10 ext. — radiating-Welt-Reaktion: Reichweite + sanfte Emotion-Rampe.
AnazhRealm.RADIATING_RANGE_M = 14;
AnazhRealm.RADIATING_EMOTION_RATE_PER_SEC = 0.04;
// W10 ext. — broadcasting-Relais: ein Mast in BROADCAST_RELAY_RANGE_M eines
// Strahlers vervielfacht dessen Reichweite um BROADCAST_RANGE_MULT.
AnazhRealm.BROADCAST_RELAY_RANGE_M = 18;
AnazhRealm.BROADCAST_RANGE_MULT = 2;
// W10 ext. — balancing-Welt-Reaktion: nahe einer gründenden Form wird chaos
// abgebaut (Komplement zu radiating, das awe+peace hebt).
AnazhRealm.BALANCING_RANGE_M = 14;
AnazhRealm.BALANCING_CHAOS_DRAIN_PER_SEC = 0.05;
// W10 ext. — lifting-Welt-Reaktion: in Reichweite eines lifting-Compounds
// trägt ein Auftriebs-Feld den Spieler (Fall gedämpft + Aufwärts-Drift).
AnazhRealm.LIFTING_RANGE_M = 10;
AnazhRealm.LIFTING_DRIFT_PER_SEC = 2.0;

// Welt-Reaktion: die Aufsitz-Regeln wohnen in ihren Gesetzbüchern — E-Mount-Reichweite =
// vehicle:FAHR.mountRangeM, Sitz-Hüfte = koerper:anatomie.sitzHipOffset (Körperzentrum der
// sitzenden Pose über dem Sattelpunkt; gilt jedem Sitz). Die Statics sind Leser (Getter, fail-closed).
Object.defineProperties(AnazhRealm, {
    MOUNT_RANGE_M: {
        get() {
            const v = AnazhRealm.Gesetz("vehicle:FAHR.mountRangeM", null);
            if (Number.isFinite(v) && v > 0) return v;
            return AnazhRealm._kernPflichtBruch("vehicle:FAHR.mountRangeM");
        },
    },
    SITZ_HIP_OFFSET: {
        get() {
            const v = AnazhRealm.Gesetz("koerper:anatomie.sitzHipOffset", null);
            if (Number.isFinite(v)) return v;
            return AnazhRealm._kernPflichtBruch("koerper:anatomie.sitzHipOffset");
        },
    },
});
AnazhRealm.MOUNT_FOLLOW_HEIGHT = 1.5; // Spieler sitzt oben drauf
// FAHR-ABSCHLUSS (19.07.) — die Pfeil-Tasten schreiben die kanonischen
// Bewegungs-Tasten (die Studio-Eingabe-Wahrheit: KeyW||ArrowUp usw.); der
// EINE Input-Chokepoint (keydown/keyup) konsumiert die Map, kein Zweit-Leser.
AnazhRealm.PFEIL_ALIAS = Object.freeze({ ArrowUp: "w", ArrowDown: "s", ArrowLeft: "a", ArrowRight: "d" });
// W-D/M-F1 (V18.170, R-017) — der Min-Abstand frischer Kreatur-Spawns zum
// Spieler (die M6-Struktur-Klemme aufs Wesen; Restore/Peer-Sicht = precise).
AnazhRealm.CREATURE_SPAWN_CLEAR_M = 3;
// Adaptiver Qualitäts-Governor: Render-Radius + Build-Budget pendeln zwischen MIN/MAX je FPS-Druck
// (nie Gravitation). RMAX = Default-Render-Radius; RMIN bleibt > max. Test-Spawn-Distanz (~65 m),
// sonst brechen headless die Spawn-Render-Tests.
AnazhRealm.ARCH_QUALITY_RADIUS_MAX = 150;
AnazhRealm.ARCH_QUALITY_RADIUS_MIN = 100;
AnazhRealm.ARCH_QUALITY_BUDGET_MAX = 6;
AnazhRealm.ARCH_QUALITY_BUDGET_MIN = 1;
// Kapazitäts-gewachsene Welt: die Vegetation eines Chunks füllt nur innerhalb `foliageRadius` — der
// startet klein (kein Spawn-Freeze) und rampt zum perf-geregelten Ziel (`effArch` aus dem EINEN
// loadScale-PID); steigt die Render-Last, sinkt das Ziel. RMIN > max. Test-Spawn (~65 m).
AnazhRealm.PERF_FOLIAGE_RADIUS_MIN = 70; // Spawn: nur die nächste Vegetation
AnazhRealm.PERF_FOLIAGE_RADIUS_MAX = 240; // die volle Vegetations-Reichweite
AnazhRealm.PERF_FOLIAGE_GROW_STEP = 2.5; // m pro Aktuator-Tick — sanftes Nach-außen-Wachsen
// V18.308 — DAS BOOT-PHASEN-GERÜST: der Atem zwischen zwei deferierten P3-Kreatur-Spawns.
// 280 ms → ~10 Wesen erscheinen sanft über ~2,8 s NACH der Kontrolle (statt aller
// Spawns synchron im Boot). Headless ist davon unberührt (dort spawnt P3 sofort, gate-treu).
AnazhRealm.BOOT_PHASE3_SPAWN_MS = 280;
// Sicherheits-Deckel der Bühne (`_buehneSteht`): erreicht eine Maschine das Ring-Ziel nie (der Ring
// wächst nur mit Frame-Kopfraum), öffnet die Bühne nach dieser Wall-Clock trotzdem — gegen den
// ewigen Verschluss; auf gesunder Hardware schließt das Prädikat in Sekunden. Bis dahin gehört der
// Boot exklusiv Boden-Streaming + Bewegung.
AnazhRealm.BUEHNE_SETTLE_CAP_MS = 90000;
// V18.301 — DER LADE-RHYTHMUS-RING: der beim Boot aktive Terrain-Chunk-Ring startet KLEIN
// (eine settled Basis statt 81 Chunks auf einmal) und wächst monoton zum chunkRingRadius-Ziel.
AnazhRealm.CREATURE_SPAWN_FAR_MIN = 130; // V18.315 — Boot-Kreaturen spawnen ≥130 m fern: sie tauchen aus der Distanz auf, ihr Satz blendet ein (_weltFeldEintrag, einblenden)
AnazhRealm.RING_RAMP_START = 0; // V18.397 — Start-Ring beim Boot = EIN EINZIGER Chunk (Schöpfer „1 Chunk statt 9!").
// JEDES-HOLZ-WELLE — DER EXISTENZ-BODEN: bis zu diesem Ring wächst die Ramp ohne
// Kopfraum-Gate und der Schrumpf-Pfad endet hier (2 = 5×5 Chunks um den Spieler,
// auf kienspan zugleich der Deckel → dort ist die Welt FIX). Existenz vor Framerate.
AnazhRealm.RING_EXIST_FLOOR = 2;
// DAS ERSTE WELTBILD (`_ankunftsBild`): steht dieselbe Lücke so lange (ms), ohne dass etwas wächst, weicht der Ladeschirm
// laut — das Log nennt, was fehlt (ein Bau, den das Studio nie liefert, hält den Spieler nie vor der Welt fest).
AnazhRealm.WELTBILD_STILL_MS = 15000;
// Der Deckel des ersten Weltbilds (ms ab der ersten Frage): danach weicht der Ladeschirm laut, auch wenn die Lücke nie ruht
// (ihre Zahl flackert). Auf der Radeon stand das ganze Weltbild nach 31,8 s.
AnazhRealm.WELTBILD_DECKEL_MS = 60000;
// Start-Ring 0 = EIN Chunk (der Spieler-Chunk): der Fern-Ring (Loch-Deckel) trägt den Rest, der Void-Boden
// `_softFloorWhileChunkLoading` trägt den Rand, dann wächst der Ramp bei gesundem Frame Ring für
// Ring — ein großer Start-Ring (25 Chunks) fror den Boot ein.
AnazhRealm.RING_RAMP_SETTLE_MS = 350; // der „Atem" zwischen zwei Ring-Wachstums-Schritten
// DIE LUFT (V18.530, `_luftEnsure`): Koschmieder-Extinktion mit Höhen-Abnahme. Die Anker sind BEOBACHTBARE
// Sichtweiten (Kontrast eines Gelände-Pixels fällt unter `kontrast`): ein klarer Sommertag trägt Gelände-
// Silhouetten 20 km weit (Mitteleuropa, Sommer-Dunst 15–30 km), Starkregen im Sturm 1,5 km. Die reine Luft ist
// Rayleigh bei 550 nm auf Meereshöhe (1,16·10⁻⁵/m, V ≈ 340 km). Der Dunst sitzt in der Grenzschicht: Skalenhöhe
// 1 km über dem Meeresspiegel. Die Keule: Anteil und Schärfe der Sonnen-Vorwärtsstreuung im Dunst (Henyey-
// Greenstein g ≈ 0,7 ≈ cos^8 in der Keule), Glanz = ihre Helligkeit relativ zum Horizont-Himmel.
AnazhRealm.LUFT = Object.freeze({
    sichtKlarM: 20000,
    sichtSturmM: 1500,
    betaRayleigh: 1.16e-5,
    kontrast: 0.02,
    skalenHoeheM: 1000,
    unterwasserM: 30,
    mieKeule: 8,
    mieAnteil: 0.45,
    mieGlanz: 1.6,
});
// DER HIMMEL (V18.530): die Sichtbarkeit seiner Punkte ist Physik. `grenzgroesse` = Dämmerungs-Anker [Sonnenhöhe
// in Grad, Grenzgröße des bloßen Auges]: im hellen Tag (≥ 10°) ist nichts zu sehen, nahe dem Horizont gerade die
// Venus, bei Sonnenuntergang der Abendstern (−3), am Ende der bürgerlichen Dämmerung (−6°) die hellsten Sterne
// (+1,5), der nautischen (−12°) +4, in astronomischer Nacht (−18°) +6. `sternMagSchwach` = die schwächsten
// Sterne des Feldes (+6). `wandelsterne` = die hellen Planeten als PUNKTE des Feldes (Venus −4,2 weißgelb,
// Jupiter −2,3 cremeweiß, Mars −1,0 rötlich; Pixel knapp über dem hellsten Stern). `mondGegenHimmel` =
// Leuchtdichte des Vollmonds gegen den blauen Tageshimmel (≈ 2500 : 5000 cd/m²) — am Tag ein blasser Schleier.
AnazhRealm.HIMMEL = Object.freeze({
    grenzgroesse: Object.freeze(
        [
            [10, -5],
            [2, -4.5],
            [0, -3],
            [-6, 1.5],
            [-12, 4],
            [-18, 6],
        ].map((a) => Object.freeze(a))
    ),
    sternMagSchwach: 6,
    wandelsterne: Object.freeze([
        Object.freeze({ mag: -4.2, farbe: Object.freeze([1.0, 0.97, 0.88]), groesse: 7.5 }),
        Object.freeze({ mag: -2.3, farbe: Object.freeze([1.0, 0.94, 0.82]), groesse: 7.0 }),
        Object.freeze({ mag: -1.0, farbe: Object.freeze([1.0, 0.66, 0.46]), groesse: 6.8 }),
    ]),
    mondGegenHimmel: 0.5,
    // DIE SONNE (Integration 05.10.): der Körper steht `koerperAbstandM` vor der Kamera (Sonne und Mond, vor der Skybox
    // bei 500 m); die Scheibe trägt den echten Winkel `sonneWinkelGrad` (0,53°) und die Leuchtdichte `sonneLeucht` ×
    // ihre Farbe — über dem HDR-Hof der Skybox (Scheibe + Halo ≈ 2,6 linear), sonst deckte das Mesh die Mitte grau.
    koerperAbstandM: 380,
    sonneWinkelGrad: 0.53,
    sonneLeucht: 4,
});
// MONDLICHT: nachts wird das Haupt-Richtlicht zur Mondquelle (gegenüber der Sonne, kühl + gedämpft →
// gerichtete Nacht-Schattierung mit tiefen Schwärzen) statt die Nacht per Post-FX aufzuhellen.
// `r/g/b` = HUE (Purkinje-Mond 0x9fb8dc, die EINE Mond-Farb-Quelle — `_atmosphere(e)` lerpt unter dem
// Horizont exakt hierher; b>r = kühl), `intensity` = Helligkeit; Wetter dimmt den Mond.
AnazhRealm.MOONLIGHT = Object.freeze({ r: 0x9f / 255, g: 0xb8 / 255, b: 0xdc / 255, intensity: 0.22 });
// V18.390 — Eins W1: DAS ATMOSPHÄRE-GESETZ (Port Vorlage phytogenesis.js Z.2111). Rayleigh
// optische Tiefe auf Meereshöhe/Zenit (Bucholtz 1995): blau streut ~5× rot → Beer-Lambert
// über die Luftmasse gibt Sonnenfarbe+Lichtmenge für JEDEN Winkel spektral-korrekt.
AnazhRealm.RAYLEIGH_BETA = Object.freeze({ r: 0.044, g: 0.1, b: 0.23 });
// Licht-Rig: KEY_BASE skaliert die Rayleigh-Lichtmenge aufs Schlüssellicht (Mittag ≈ 2.6·0.913 unter
// ACES). Ziel key-dominant (Vorlage dir/(amb+hemi) ≈ 15:1); die Schattenseite trägt der Himmel.
AnazhRealm.KEY_BASE = 2.6;
// r128→r184-Licht-Übersetzung (three.js r155, useLegacyLights → physisch): Legacy-Licht hatte keine
// 1/π-BRDF-Normierung — physikalische Lichter sind bei gleicher Zahl ~π-fach dunkler. Die aus dem
// r128-Studio kopierten Rig-Werte (Key · Hemi-Tag) laufen durch diesen EINEN Faktor;
// die Nacht bleibt unberührt (Mond-Pfad eigen, Hemi-Nacht-Floor außerhalb). Kein Tuning-Knopf.
AnazhRealm.LEGACY_LICHT = Math.PI;
// DIE BELICHTUNG (V18.507, `_dayNightApplyBelichtung`): `zielKarte` ist die Leuchtdichte der 18-%-Karte nach
// der Belichtung, die ACES (three: x·k/0,6, RRT+ODT-Fit) auf Mittelgrau + 1 EV legt — Mittelgrau (sRGB 118 =
// linear 0,18) braucht den Fit-Eingang 0,26227, also k·L = 2 · 0,26227 · 0,6 = 0,3147. `max` 1,0 hält die geeichte
// Nacht, `min` ist nur die Wand gegen ein entartetes Licht.
AnazhRealm.BELICHTUNG = Object.freeze({ zielKarte: 0.3147, min: 0.25, max: 1.0 });
// Slope-Schwellen des Gras-Gates: voll bis `lo` (≈35°), weg bis `hi` (≈52°), sanfter Übergang.
// `hi` < rock-`SCATTER.slopeMax` (1.45) → Wiese → Mischhang → Geröll → Fels auf DERSELBEN
// `_slopeAt`-Achse.
AnazhRealm.GRASS_SLOPE = Object.freeze({ lo: 0.7, hi: 1.3 });
// GRASS_BLADE_H = die lokale Referenz-Halm-Höhe (Material-Gradient-Normalizer des Wind-
// Materials, uBladeH-Fallback). V18.492: GRASS_MAX_BLADES/GRASS_POOL_CAP sind mit dem
// Halm-Mesh-Pool gefallen (die Wiese ist Boden-Funktion, 21.07.).
AnazhRealm.GRASS_BLADE_H = 0.42;
// Claude-5er-Generation (Sonnet 5.5 · Opus 5/5.5 · Fable 5/5.1): thinking immer an,
// `output_config.effort`, serverseitige `fallbacks` — der EINE Prüfer für Header + Body.
AnazhRealm._llmFuenferModell = function (model) {
    return typeof model === "string" && /^claude-(sonnet-5-5|opus-5|fable-5)/.test(model);
};
// Der Grund der Natur-Wand im Satz des Spielers (Leser: `SETZ_GRUND` des Ergebnis-Satzes, `confirmBuild` und das Bau-HUD).
AnazhRealm.NATUR_WAND_GRUND = Object.freeze({
    lichtung: "die Lichtung des Genesis-Platzes bleibt frei, keine Krone steht über der Scheibe und dem Ring der Tore",
    haus: "im Grundriss eines Hauses wächst nichts",
    bau: "im Grundriss eines Baus wächst nichts",
    weg: "auf Weg, Platz und Acker eines Dorfs wächst nichts",
    wagen: "in einem Wagen wächst nichts",
    wasser: "im Wasser steht nichts, am Ufer schon",
});
// DIE GRÜNDE DES ERGEBNIS-SATZES (`_ergebnisSatz`, Schau-2 Runde 3): jeder Wurf, der nicht steht, trägt einen — die Wand
// (`NATUR_WAND_GRUND`), das Budget des Programms, die Obergrenze der Kreaturen (die Zahl liest der Satz aus dem Zustand), das
// Buch des Studios, ein unbekannter Bauplan, eine unbekannte Seele, eine Gestalt, die nicht gegossen wurde, die fehlende
// Bühne — jeder benannt von der Stelle, die absagt (die Wurzel über `opts.absage`). „unbenannt" sagt ehrlich, dass eine
// Absage ihren Grund nicht nannte (die Linse verbietet ihn).
AnazhRealm.SETZ_GRUND = Object.freeze({
    ...AnazhRealm.NATUR_WAND_GRUND,
    budget: "das Werk-Budget dieses Satzes ist aufgebraucht",
    obergrenze: "die Welt trägt nicht mehr Kreaturen",
    buch: "das Studio-Buch ist noch nicht geladen",
    unbekannt: "die Welt kennt diesen Bauplan nicht",
    seele: "die Welt kennt diese Seele nicht",
    gestalt: "die Gestalt ließ sich nicht gießen",
    buehne: "die Welt hat noch keine Bühne",
    platz: "kein fahrbarer Grund in Reichweite, die Welt stellt den Wagen nicht hin",
    unbenannt: "ohne benannten Grund (das Log der Welt nennt ihn)",
});
// DER FUSS EINES STAMMS (Schau-2 wasser-wahrheit, Gegenprüfung 10.10.): der Kreis um die Achse, auf dem eine Pflanze steht
// (m) — die Natur-Wand fragt das Land an der Achse UND auf ihm (`_stammFussLand`). Befund (gate:werk-im-wasser Z am See
// −906/−634): eine Kiefer stand 0,5 m neben 2,4 m tiefem Wasser, zwei Hasel 0,23 und 0,52 m im Uferwasser — die Wand fragte
// nur die Achse.
AnazhRealm.STAMM_FUSS_M = 0.5;
// DER SOCKEL EINES FUNDAMENTS (m): so weit steht das Podest über den Grundriss hinaus (`_archFundamentBox`, der Sockel-Look
// deckt die Fachwerk-Traufkante) — und so weit fragt die Wasser-Wand des Fundaments das Land (`_fundamentLand`). EINE Zahl
// für Podest und Land (Integration V18.540, K02b × S3-Haus): die Wand fragte den Grundriss ohne Sockel, der Stempel und
// gate:werk-im-wasser Z messen das Podest — am vereinigten Baum standen drei Dorf-Häuser mit 1 Punkt der Hülle 0,25–0,81 m
// im Fluss, jeder am Rand des Sockels.
AnazhRealm.FUNDAMENT_SOCKEL_M = 0.35;
// DER STUDIO-SATZ (Leser: die letzte Chat-Regel und `_studioSatzAbsage`): Verb · Zahl · Art (auch leer vor einem Hain) ·
// Hain/Wald/Gruppe · am Wasser | hier/vor mir.
AnazhRealm.STUDIO_SATZ =
    /^(?:pflanz|setz|bau|stell|erschaff|mach|wachs)\w*\s+(?:mir\s+|uns\s+)?(?:(ein\s+paar|ein(?:en|e|ige)?|zwei|drei|vier|fünf|fuenf|sechs|sieben|acht|neun|zehn|\d+)\s+)?([a-zäöüß_]*?)(hain|wald|gruppe)?(?:\s+(?:am|an|beim|zum|ans)\s+(wasser|fluss|see|ufer|bach|meer)|\s+(hier|vor mir))?\s*[.!]?$/i;
// Die Faltung eines Worts für den Wort-Katalog (`_studioWortKatalog`): klein, Umlaute ausgeschrieben, ß → ss, Leer- und
// Bindestriche → „_" (die Form der Bauplan-Namen und Rezept-ids).
AnazhRealm._wortFalten = function (wort) {
    return String(wort == null ? "" : wort)
        .trim()
        .toLowerCase()
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .replace(/[\s-]+/g, "_");
};
// Die Streu-Region-Kantenlänge (= _bakeRegionConfig().sizeM, 256 m): Region-Bundles und Fern-Superregion der
// Streu. Der platzierte Bau keyt seit Welle B nicht mehr regional (global in der Mesh-Zone).
AnazhRealm.ARCH_REGION_M = 256;
// Fern-Superregion (4×4 Regionen à 256 m = 1024 m): Fern-Leaves (camera-facing Impostor-Quads) haben
// wenig per-Region-Cull-Nutzen, kosten aber je winziger Gruppe einen Draw-Call — eine Gruppe je Art
// deckt die Fern-Sicht und bleibt endlich (Rücken-Cull lebt; instanz-bewusste Bounding-Sphere, jeder
// Add invalidiert). Konsument an GENAU EINER Stelle: _archFernRegionKey (gate:scatter-lod, Block F).
AnazhRealm.SCATTER_FERN_SUPERREGION = 4;
// Render-Diät: EIN geteiltes Leaf-Material je TAG-SIGNATUR statt je Part-Farbe — die Farbe reist als
// Instanz-Farbe (leaf.tint → _archSlotColor → setColorAt), die Pipelines kollabieren je Signatur.
// Einziger Konsument: _archLeafMaterial; false = das alte Je-Farbe-Muster, nur als A/B-Hebel der Linse
// (gate:render-diaet).
AnazhRealm.ARCH_LEAF_MAT_SHARED = true;
// V18.354 — PHASE B (Frame-Budget-Scheduler): der Boden des Deferrable-Budgets (ms). Selbst wenn
// die Pflicht-Kosten (Physik/Render) das Frame-Ziel fast füllen, bleibt diese Kür-Zeit — das
// Streaming ist eh heilig (prio 0, ungedrosselt), dieser Floor hält die niedrigeren Jobs am Leben.
AnazhRealm.FRAME_SCHED_MIN_MS = 2;
// Existenz-Boden des Dispatchers: Substanz (prio 1: Wasser-Iso · Scatter · Gras) läuft JEDEN Frame
// mit diesem Boden, Deko (prio ≥ 2) jeden 4. Frame mit dem kleinen — sonst wachsen die Queues auf
// render-gebundener Maschine monoton. Existenz vor Framerate.
AnazhRealm.FRAME_SCHED_SUBSTANZ_FLOOR_MS = 4;
AnazhRealm.FRAME_SCHED_DEKO_FLOOR_MS = 2.5;
// V18.355 — PHASE C (Fixed-Timestep, Fiedler): die FIXE Sim-Schrittweite (60 Hz). TAKT_DECKEL_S (K21) ist
// die EINE Obergrenze des Spiel-Takts, an der Wurzel in startEternalLoop: ein 2-s-Hitch akkumuliert nicht
// 120 Steps, eine 10-s-Pause trägt kein Tier 40 m weit (jede Bewegung liest den gedeckelten Takt, nie die
// Wanduhr; die Anzeige-Uhren von Schwung und Pfeil deckeln ihren Stempel-Abstand mit derselben Zahl);
// FIXED_MAX_STEPS ist die harte Obergrenze pro Frame (überschüssige Zeit fällt weg → kein Einhol-Sturm).
AnazhRealm.FIXED_DT = 1 / 60;
AnazhRealm.TAKT_DECKEL_S = 0.1;
AnazhRealm.FIXED_MAX_STEPS = 8;
// Mindestabstand zwischen zwei Sky-Env-PMREM-Regenerierungen (Wall-Clock): Tag-Nacht-Uhr und
// Emotions-Cross-Fade driften die Himmelsfarbe, jede Regeneration rendert einen PMREM-Pass (teuer
// auf schwacher GPU). 6 s deckelt einen 45-s-Cross-Fade auf ~7; der IBL-Nachlauf ist unmerklich.
AnazhRealm.SKY_ENV_REGEN_MIN_MS = 6000;
// V18.306 — der Frame muss SO LANGE anhaltend über Budget sein, bevor der Ring eine Schale
// zurückgibt: lang genug, dass ein transienter Bau-/Carve-Spike (< 200 ms) NICHT schrumpft,
// kurz genug, dass echte Dauerlast (Freeze) den Ring zügig auf die haltbare Größe senkt.
AnazhRealm.RING_SHRINK_SUSTAIN_MS = 1200;
// Wachs-Hysterese: der Ring wächst erst nach ANHALTENDEM Kopfraum — länger als die
// Schrumpf-Hysterese (zaghaft wachsen, beherzt schrumpfen), damit ein transienter leichter Frame
// ihn nicht hochratscht.
AnazhRealm.RING_GROW_SUSTAIN_MS = 1500;
// W4.4 — der Zeit-Deckel des Ring-Boot-Fensters: solange der Ziel-Ring noch nie stand und
// dieser Deckel offen ist, wächst der Ring mit dem KURZEN Sustain (RING_RAMP_SETTLE_MS) —
// schwache HW fällt danach gebunden in die volle V18.318-Hysterese zurück.
AnazhRealm.RING_BOOT_WINDOW_MS = 10000;
// Kapazitäts-gewachsene DICHTE, Schwester von `foliageRadius`: fährt die Instanz-Zahl pro Zelle
// (die Last-Dichte der Nah-Streu, `_nahStreuKachel`) — weniger Instanzen senken die Dreiecke
// direkt (anders als LOD-Schwellen auf gebackener Geometrie). Build-zeit (greift beim
// Streamen/Spawn); headless → 1.
AnazhRealm.PERF_FOLIAGE_DENSITY_MIN = 0.22; // V18.303 0.4→0.22: das Laub ist 90 % der GPU-Last (gemessen 2.21M Tris) → eine kämpfende GPU darf es weiter ausdünnen (perf-gated: starke Hardware bleibt voll)
AnazhRealm.PERF_FOLIAGE_DENSITY_GROW_STEP = 0.012; // pro Aktuator-Tick — sanftes Nach-Verdichten
// Die Laub-Layer: FOLIAGE_LAYER ist die non-breaking Vorbedingung eines eigenen Laub-Passes: das Laub
// trägt die Layer ZUSÄTZLICH (Layer 0 bleibt → Render/Schatten unverändert), ist so aber für einen
// Laub-Pass (`pass.setLayers(FOLIAGE_LAYER)`) isoliert wählbar. Headless → 1.
AnazhRealm.FOLIAGE_LAYER = 1; // eigene Render-Layer für den reduziert aufgelösten Laub-Pass (Layer 0 bleibt aktiv)
// Schatten-Zwilling-Layer (0 = Welt, 1 = Laub-Pass, 2 = Zwilling): `mesh.layers.set(2)` nimmt den
// opaken Kronen-Caster AUS Layer 0 → die Haupt-Kamera sieht ihn nie;
// `directionalLight.shadow.camera.layers.enable(2)` (vor der CSM-Konstruktion, die Kaskaden erben
// es) lässt nur den Schatten-Render ihn als Caster zählen.
AnazhRealm.SHADOW_TWIN_LAYER = 2;
// DIE EINE SZENEN-SKALA (K50, `_szeneSkalaWirk`): die Szene rendert in SZENE_SKALA × Ausgabe, die zeitliche Auflösung
// (`_zeitAufloesung`, TAAU) löst auf die Ausgabe auf. 0,75 = 56 % der Pixel-Arbeit; der Spieler stellt sie im Menü (0,5..1).
AnazhRealm.SZENE_SKALA = 0.75;
AnazhRealm.SZENE_SKALA_MIN = 0.5;
// Der Resolve der Hochskalierung (`_zeitAufloesung`): das Gewicht je Eingangs-Texel exp(−ZEIT_KERN · d²), d in Ausgabe-Pixeln;
// die Breite der Varianz-Klemme im Stand (r184: 1); die Nach-Schärfe je fehlendem Skalen-Anteil (`nachSchaerfe`).
AnazhRealm.ZEIT_KERN = 7;
AnazhRealm.ZEIT_GAMMA_RUHE = 1.25;
AnazhRealm.ZEIT_SCHAERFE = 1;
// Sekunden-normalisierter Ingest-Takt: Ziel ist eine RATE je echter Sekunde — jeder Frame gibt
// `rate·dt` Konversionen frei, gedeckelt durch INGEST_BURST_CAP (Schutz gegen LongTasks). So lädt
// die Welt mit der Wanduhr statt mit der Framerate (fix pro Frame hieß bei 8 fps nur 8–24/s).
// Über Budget = halbe Rate; der Stau schrumpft immer.
// DIE KONSUM-WAND des Foundry-Kanals (V18.511): GENAU die Vertex-Attribute, die `_foundryBuildMesh` liest — die
// Transport-Schale (`_foundrySchale`) streicht im Worker jedes andere VOR Kopie, Platte und Transfer (aWind · aCenter ·
// aType reisten 32 % der Bytes ohne Leser). Ein neuer Leser in `_foundryBuildMesh` = ein Name hier (gate:fluss prüft
// beide Seiten gegeneinander).
AnazhRealm.FOUNDRY_LESEN = [
    "position",
    "normal",
    "color",
    "uv",
    "aWurzel",
    "aSchale",
    "aDeckt",
    "skinIndex",
    "skinWeight",
];
// Das Transport-Format der Platte (reist als `|f<n>` im Stempel): 2 = Konsum-Wand + Uint16-Index (V18.511); 3 =
// saisonfreie Körper-Schlüssel `<preset>|<gestalt>|<lod>[|ov:…]`, Karten `karte|…` mit `{ payload }` (V18.527). Ein
// geändertes Format leert den Asset-Cache von selbst (wie ein Studio-Edit) — die alte Saison-Platte fällt einmal.
AnazhRealm.FOUNDRY_PLATTE_FORMAT = 3;
// DIE EINE BEIPACK-KARTE der Foundry-Antwort (`_foundryBuildGroup`): Beipack-Name → das Feld der Gruppe (der Flat reicht es
// als `huelle` · `fern` weiter). `__huelle` (Welle L) die Kollision der gezeigten Stufe, `__fern` (S3) die Fernform der Stufe 3
// — beide in der EINEN Hüllen-Form (docs/studio-vertrag.md N5, der Leser `_huelleVon`).
AnazhRealm.FOUNDRY_BEIPACK = Object.freeze({ __huelle: "_huelle", __fern: "_fern", __mass: "_mass" });
// Der Keil der Hüllen-Form im Welt-March: die First-Kante → der Typ der Kapsel-Liste (pB.w; 0 Kasten · 1 Ellipsoid). Der
// Walm (0..1) reist im Bruchteil (Typ + 0,49 · walm), das WGSL (`sdKeil`) schneidet die zwei Stirnen mit der Dach-Neigung.
AnazhRealm.HUELLE_KEIL_TYP = Object.freeze({ "+z": 2, "-z": 3, "+x": 4, "-x": 5 });
AnazhRealm.INGEST_RATE_PER_S = 180; // Ziel-Freigaben je echter Sekunde (= 60 fps × 3 → healthy-fps byte-alt)
AnazhRealm.INGEST_BURST_CAP = 8; // max Freigaben je EINZELFRAME (Anti-LongTask-Deckel; bei 8 fps = 64/s statt 8/s)
// Berg-Schatten (feld-natives Hi-Z, s. _archRegionBundleCull): konservativer Sichtlinien-Test
// Kamera→Kugel-Oberkante gegen das EINE Höhen-Gesetz — je bergiger die Welt, desto billiger.
// DIE EINE NAH-GRENZE DES ANALOG-FELDS (Schöpfer-Wort 30.09.: „am Ende AAA-Niveau, nicht Kapseln"): bis hierher ist
// das Studio-Mesh die Gestalt jeder Klasse (Baum · Bau · Tier · Streu), jenseits darf der Analog-Satz tragen. Ein
// Analog-Satz diesseits ist ein Befund mit Namen (`_analogZensus`, gate:analog-nah).
AnazhRealm.ANALOG_NAH_M = 64;
// Bis zur Nah-Grenze ist das Studio-Tier die Gestalt (m, Hysterese ein/aus gegen Flackern); dahinter die Glieder-
// Kapseln im Welt-March (dort sind sie klein im Bild und sparen die Mesh-Kosten). Bis 04.10. stand `ein` bei 55 m:
// ein nahendes Tier lief zwischen 55 und 64 m als Kapsel-Satz.
AnazhRealm.KREATUR_NAH_MESH = Object.freeze({ ein: AnazhRealm.ANALOG_NAH_M, aus: AnazhRealm.ANALOG_NAH_M + 10 });
// Das Fell-Bildschirm-Gesetz: mittlere Strähnen-Breite in Vorlagen-Einheiten (der Bäcker legt 2·t·1.8 an der
// Wurzel, 2·t·0.65 an der Spitze, t ≈ 0.006–0.008; die Welt skaliert mit dem Guss-Faktor f ≈ 0,1) · Mindest-Breite
// in Pixeln · Hysterese-Band. pxMin GEMESSEN (Fell-Linse `diag-fell-blick`, 720p, fov 75°): die Strähnen ändern
// 23 592 px bei 1,5 m · 8 421 bei 3 m · 1 808 bei 6 m · 0 ab 10 m — viele Strähnen unter einem Pixel wirken als
// Dichte, bis ~0,1 px je Strähne (≈ 8 m bei 720p, ≈ 12 m bei 1080p).
AnazhRealm.FELL_BILDSCHIRM = Object.freeze({ breiteM: 0.018, pxMin: 0.1, hyst: 0.1 });
// Mesh-Zone: höchstens so viele Bau-VERSUCHE je Culling-Takt (ein Versuch ohne bereites Studio-Asset ist ein
// billiger Cache-Blick; das Bau-Budget zählt nur gelungene Bauten).
AnazhRealm.ARCH_NAH_VERSUCHE = 24;
// Die Platzier-Uhr der Mesh-Zone (ms je Takt): so lange setzt der Culling-Tick kalte Einträge, deren Studio-Stufe
// gedockt bereitliegt — ohne Bau-Budget, nah zuerst. 197 Plätze kosteten 2,5 ms (04.10., echte GPU, Mess-Wiese).
AnazhRealm.ARCH_PLATZ_MS = 4;
// Das Totband am Karten-Horizont (m, `tickArchitectureCulling`): ein Karten-Ding platziert seine Karte bis zu seinem
// Rand (`_archKartenHorizont`) und räumt sie erst so weit dahinter — ein Spieler, der am Horizont-Rand pendelt, lässt
// keine Karte flattern.
AnazhRealm.KARTEN_HORIZONT_TOTBAND_M = 16;
// Der Rand der Stand-Wache (m, `_standRuht`): erst wenn Spieler oder Auge so weit vom Anker eines Fege-Takts weg sind,
// gilt sein Ort als neu und er geht wieder. Das Zittern der Physik im Stand (gemessen 07.10., Mess-Wiese: bis 5 mm je
// Takt, nur in der Höhe) weckt nichts; die Stufen-Wahlen tragen eine Hysterese von Metern, die Nah-Streu ihre Armlänge
// mit 0,75 m Austritts-Rand. Der Cull urteilt erst ab der Mesh-Zone (Cull-Radius 100–150 m) und am Karten-Horizont
// (Totband 16 m): ihm genügt ein Meter (`STAND_RAND_FERN_M`) — beim Gehen geht er viermal seltener.
AnazhRealm.STAND_RAND_M = 0.25;
AnazhRealm.STAND_RAND_FERN_M = 1;
// Der Horizont-Saum (m): über so viele Meter vor `SCATTER.outerM` liegen die Ränder der Karten-Dinge, je Eintrag aus
// seinem Samen (Salz: der Hash-Kanal des Saums, `_pcg2d`) — der Wald dünnt aus, jeder Baum steht ganz oder gar nicht.
AnazhRealm.KARTEN_HORIZONT_SAUM_M = 32;
AnazhRealm.KARTEN_HORIZONT_SALZ = 0x4b48;
// DIE EINE WORKER-SCHLANGE (`_foundryAuftrag`): Aufträge gleichzeitig im Worker und das Alter, ab dem der Älteste jede
// zweite Wahl bekommt. Jeder Nachschub braucht einen Haupt-Thread-Rundlauf; kleine Aufträge (Platte, Fels, Klinge) sind
// schneller als er — gemessen 03.10. (Boot-Vorrat leer · nahe Eiche/Tanne-L0): FIFO 12,4 s · 9,0/9,4 s; im Flug 2:
// 20,4 s · 0,4/0,9 s; 4: 15,2 s; 8: 13,2 s; 12: 12,3 s · 0,9/1,4 s — zwölf halten den Worker ohne Lücke beschäftigt.
AnazhRealm.FOUNDRY_IM_FLUG = 12;
AnazhRealm.FOUNDRY_ALTER_MS = 6000;
// Wie lange ein abgelaufener Auftrag als Geist seinen Faden hält (× seine Frist, `_foundryFrist`): auf CPU-Raster unter
// Fremdlast lief ein Karten-Bake über zwei Fristen (gate:arch-feld 05.10.: die Weide dreimal gesendet in ~1000 Takten) —
// vier tragen ihn, ein toter Auftrag fällt.
AnazhRealm.FOUNDRY_GEIST_FACH = 4;
// DER EINE WELT-MARCH: alles Ferne ohne Karte (Box-Sätze der Bauten und Steine · Glieder-Kapseln · Streu-Gesetz;
// Bäume und Sträucher sind fern ihre Karte) lebt als ANALOG-Satz in EINER Feld-Listen-Textur + EINER Kapsel-Liste;
// der Feld-Pass marcht sie in EINEM Draw mit echter Tiefe (je Satz bzw. Gesetz-Platz ein Stellvertreter, `_feldPassEnsure`).
// Fern ist das Feld die Gestalt (nah trägt das Studio-
// Mesh); eine Erschöpfung schreit EINMAL laut. Kapseln/Boxen haben keine Import-Auflösung — der Strahl digitalisiert
// am Schirm. Der
// Voxel-Brick-Atlas (512×512×128, 128 MB VRAM + 128 MB Heap-Spiegel) ist verabschiedet (V18.528): er wurde im
// Spiel nie mehr belegt (gemessen 0 Zuteilungen), sein einziger Nutzer, der Region-Ziegel, hing an der toten
// Fern-Schicht.
AnazhRealm.WELT_MARCH = Object.freeze({
    // Die Kosten binden an die Hüllen im Bild, nie an die Welt-Größe: der Rasterizer wählt je Satz die Pixel (seine
    // Stellvertreter-Box), kein Pixel testet fremde Einträge. (Die SEITEN-EBENE — 32er-Seiten mit Hüll-AABB, Hilbert-
    // Ordnung und Folge nah→fern — fiel mit den Stellvertretern, Welle G 06.10.: jedes Pixel des Vollbilds lief ihre
    // Schleife, an der Mess-Wiese spannte EINE Seite über die Kamera und schickte alle 2,07 Mio. Pixel in 32 Einträge.)
    felder: 4096, // Feld-Listen-Plätze (8 RGBA-Float-Texel je Feld; Textur 4096×8)
    spalten: 512, // Felder je Listen-Textur-Zeile (Breite = 512×8 = 4096 Texel, WebGPU-sicher)
    kapseln: 8192, // ANALOG-Primitive (2 Texel je Kapsel/Box — das Gesetz statt des Rasters; Textur kapselZeile × 4)
    kapselZeile: 4096, // Texel je Zeile der Kapsel-Liste (der Shader liest die Breite aus der Textur: kapselTexel)
    // Verteilungs-Gesetz: Klein-Streu wohnt als GESETZ-BLOCK je Kachel — EIN Feld-Eintrag trägt bis zu
    // gesetzBlock Plätze als Kapsel-Slots (32 B je Platz statt 128-B-Feld-Slot je Instanz); die Felder
    // bleiben Kreaturen/Bauten/Bäumen.
    gesetzKachelM: 64, // Kachel-Kante der Gesetz-Blöcke (Schirm-Bindung: kleine Hüll-AABBs)
    gesetzBlock: 16, // Plätze je Block (1 Kapsel-Slot = 2 Texel je Platz)
});
// DER SCHWUND (ms): so lange dithert ein Analog-Satz aus, wenn sein Mesh übernimmt (`_weltFeldAktiv`) — der
// Übergang Satz → Studio-Stufe trägt die Blende der Stufen statt eines Pops.
AnazhRealm.WELT_SCHWUND_MS = 500;
AnazhRealm.BERG_CULL = Object.freeze({
    minDist: 140, // m — nahe Regionen nie verdeckt (Sicherheits-Zone, Pop-frei)
    proben: 5, // Höhen-Proben je Sichtlinie
    tMin: 0.2, // Proben-Fenster entlang der Linie (Kamera 0 → Kugel 1):
    tMax: 0.85, //   nie direkt an Kamera/Kugel (dort deckt minDist bzw. die Kugel selbst)
    marge: 2, // m — das Terrain muss die Linie KLAR überragen (konservativ, nie knapp)
    testMsSichtbar: 400, // Re-Test-Kadenz sichtbarer Regionen (amortisiert)
    testMsVerdeckt: 150, // verdeckte testen HÄUFIGER → schneller Un-Cull hinterm Grat
    budgetJeFrame: 6, // max Berg-Tests je Frame (≤ 6×15 Gesetz-Proben ≈ sub-ms)
    queryTakt: 10, // Occlusion-Query-Probe-Fenster: nur jeder N-te Frame fragt (Dawn-QuerySet-Cliff)
    stummFenster: 6, // so viele Probe-Fenster ohne begonnene Abfrage, dann meldet der Berg-Cull den Stellvertreter laut
});
// Die zwei Radius-Wände gegen den Grenzzyklus: Wachsen erst nach so vielen SIM-Sekunden ohne
// Über-Budget-Frame (kein Jagen kurzlebigen Kopfraums); Schrumpfen erst ab diesem Ziel-Abstand in
// Metern (Kanten-Zellen flattern nicht; ein echter Überlast-Sturz schrumpft voll).
AnazhRealm.PERF_FOLIAGE_GROW_RUHE_S = 4;
AnazhRealm.PERF_FOLIAGE_SHRINK_TOTBAND = 8;
// Gnadenfrist einer LEEREN Instanz-Hülle (liveCount 0), bevor der Reaper sie räumt: Familien
// oszillieren beim Wandern/LOD-Wechsel um liveCount 0 — ein Sofort-Reap machte jede Oszillation zu
// Voll-Dispose + Re-Mint (Pipeline-Cache, Matrix-Upload, Heap-Müll). 10 s deckt jede Oszillation.
AnazhRealm.ARCH_LEER_GNADE_MS = 10000;
// Der Takt des GPU-Kehraus (`_gpuKehraus`): je Gang Graph + r184-Register (nach dem Kehraus beide nur das Bild); was zwischen
// zwei Gängen den Graphen verlässt, hält die GPU höchstens so lange.
AnazhRealm.GPU_KEHRAUS_MS = 2000;
// Der EINE forceWebGL-Hook: die Boot-Probe (gate:webgl-probe) erzwingt den r184-WebGL2-Rückfall;
// alle fünf Renderer-Münzstellen (Welt · Feed-/Hof-/Ich-Bühne · Workshop-Preview) lesen diesen
// Chokepoint → die erzwungene Welt fährt EIN Backend.
AnazhRealm._forceWebGL = function () {
    return typeof window !== "undefined" && window.__anazhForceWebGL === true;
};
// Performance-Regelkreis: die Loop-Phasen, deren Kosten der Nexus pro Frame misst (perfSense.phase).
AnazhRealm.PERF_PHASES = Object.freeze(["streaming", "waterIso", "archCulling", "creatures", "physics", "render"]);
// Die DECKE: über dieser Frame-Zeit drosselt der Regler die Qualität (≈59 fps); der Wachstums-Boden
// liegt PERF_HEADROOM_MS darunter. Schatten-Reichweite: der Regler skaliert das Frustum des zweiten
// Voll-Renders zwischen Last-Floor und User-Ceiling (atmosphere.shadowRange); MIN < fog-far.
AnazhRealm.PERF_SHADOW_RANGE_MIN = 100;
AnazhRealm.PERF_SHADOW_RANGE_MAX = 170; // = der Default-Ceiling (Fallback, wenn atmosphere.shadowRange fehlt)
// Die CSM-Tiefe (maxFar) je Meter Schatten-Reichweite: EINE Zahl für Boot und Regler (100–170 → 180–306 m).
AnazhRealm.SCHATTEN_FERN_FAKTOR = 1.8;
// V8 (Kür) — der GODRAY-Pegel-Ceiling: der Perf-Regler skaliert `_godrayScale` zwischen 0
// (anhaltende Last → Schäfte aus) und diesem Max (Kopfraum → volle Optik). Reine Optik, also
// gibt sie unter Render-Last früh nach; 0.8 ist ein sichtbarer, aber nicht überstrahlender Pegel.
AnazhRealm.PERF_GODRAY_MAX = 0.8;
AnazhRealm.PERF_TARGET_MS = 17;
// DIE GPU-LEINE (_gpuLeineFrei): höchstens so viele Frames dürfen zugleich auf der GPU unterwegs sein — mehr ist nur
// Eingabe-Verzug (gemessen 04.10.: 600 ms bei ≈ 10 Frames in der Schlange), nie mehr Durchsatz.
AnazhRealm.GPU_FRAMES_IM_FLUG = 2;
// DER EINE MELDER (`_bruchMelden`, K22): dieselbe Bruch-Meldung wieder meldet sich höchstens alle BRUCH_WIEDER_MS mit ihrem
// Zähler; das Buch hält die jüngsten BRUCH_BUCH_MAX Meldungen
AnazhRealm.BRUCH_WIEDER_MS = 2000;
AnazhRealm.BRUCH_BUCH_MAX = 64;
// DAS WACHSTUM ÜBER BUDGET (`_tickFoliageGrowth`, Lehre 13): je WUCHS_DROSSEL_MS wächst EIN Chunk (der nächste) —
// das Budget drosselt das Tempo, nie die Existenz (dieselbe Garantie wie der Bau über Budget, `_handBauErlaubt`).
AnazhRealm.WUCHS_DROSSEL_MS = 250;
// DIE ERST-ZEICHNUNG (`_configureRenderer`): je Render-Aufruf der Welt-Szene baut der erste Erst-Bau immer, jeder weitere nur,
// solange der Aufruf unter dieser Zeit (ms) baute — ein Frame trägt so höchstens einen schweren Knoten-Bau je Pass.
AnazhRealm.ERST_BAU_MS = 4;
// DIE PHASEN DES VORRATS (`_foundryPrefetchLibrary`, Merker `f._vorrat`): er wartet auf das erste Weltbild, dann bestellt er;
// durch ist er false. Jeder Leser (Kalt-Zeile, Warm-Anker, gate:ankunft) nennt die Phase, nie nur „an".
AnazhRealm.VORRAT_PHASE = Object.freeze({ wartet: "wartet auf das erste Bild", bestellt: "bestellt" });
// DER SCHATTEN-TAKT je Kaskade (_loopShadowUpdate): die nahe Kaskade rendert im Regler-Intervall, höchstens
// jeden `nahMax`-ten Frame (laufende Tiere werfen nah); die ferne im `fernFaktor`-fachen Takt.
AnazhRealm.SCHATTEN_TAKT = Object.freeze({ nahMax: 2, fernFaktor: 3 });
// Die Obergrenze der Sonnen-Stufe (`_sonnenStufe`): N·L ändert sich bei einer Drehung um α höchstens um α — unter einer
// 8-bit-Stufe ist sie unsichtbar.
AnazhRealm.SONNEN_STUFE_SCHATTIERUNG = 1 / 255;
// DIE KASKADEN-BOX (_kaskadenPassen): jede Kaskade misst die Frustum-Scheibe im Licht-Raum statt ihrer Diagonale.
// `texelM` = die Texel-Kante je Kaskade, die die längste Box-Kante bei jeder Blickrichtung hält — die des
// Addon-Quadrats (k0 339 m / 2048, k1 961 m / 2048): kein Schatten wird gröber als bis V18.529. Die Karten-Größe folgt
// daraus am Standard-Bereich und Bezugs-Seitenverhältnis `bezugAspekt` (kleinste Zweierpotenz, einmal bei der
// Kaskaden-Geburt; k0 = k1 = 2048, gate:schatten-werfer K5/K6). `rasterTeiler`: die Box wächst in Schritten von
// Scheiben-Tiefe / rasterTeiler (eine Größe hält, solange die Scheibe hineinpasst — sonst schimmert jede Drehung);
// `randM` = Saum der Werfer-Hülle (Wind, Morph), `luftM` = Saum über dem höchsten Werfer und unter der tiefsten
// Scheibe. DER BIAS (0710-12, `_schattenBias`) in Texeln der Karte, nie in Metern: `normalTexel` = der normalBias je Texel
// (mal dem Hebel `atmosphere.shadowBias`), `tiefeTexel` = der Tiefen-Nudge entlang des Lichts. Den Versatz trägt die
// End-Normale des Empfänger-Stoffs (r184 `normalWorld`), am geflachten Boden also die Senkrechte (TERRAIN_NORMAL_FLATTEN);
// darum trägt der Boden die Zuwendung seiner wahren Normale selbst (`receivedShadowNode`, 1110-5): abgewandt im Schatten,
// über N·L 0 … `zuwendungSaum` weich (der Saum am Terminator, sonst die Hang-Akne).
AnazhRealm.SCHATTEN_KASKADE = Object.freeze({
    texelM: Object.freeze([0.17, 0.47]),
    bezugAspekt: 16 / 9,
    karteMax: 2048,
    rasterTeiler: 8,
    randM: 2,
    luftM: 4,
    normalTexel: 0.5,
    tiefeTexel: 0.75,
    zuwendungSaum: 0.08,
});
// DAS GESETZ DER PASS-WAHL (`_passTrifft`, W7-Vereinigung) — EIN Urteil je Körper und Pass für jeden Leser (Zellen der
// Sätze · Werfer der Bündel · Instanzen der Wahl-Gruppen · Büschel der Nah-Wiese). `sichtRand` je Meter Abstand zum Auge:
// die zeitliche Auflösung versetzt die Projektion um höchstens einen halben Pixel (1080p, 75°: 0,0007 je m), der Rand trägt
// ~2 Pixel — ein Satz, der seine Wahl über Frames hält, verliert am Bildrand nichts. `saumM` je Kaskade: so weit liegt die
// Wahl-Scheibe außerhalb der Scheibe beim Rendern; läuft die Scheibe zwischen zwei Karten darüber hinaus, rendert die
// Kaskade neu (`_kaskadeDeckt`). `pflanzeRandM`: der Wind-Saum um die Kugel einer Pflanzen-Instanz (Krone und Halm wiegen).
// `haltM` (Welle C): DIE LAGE STEHT, solange jede Ebene des Passes ihre Richtung hält und um höchstens so viel wandert
// (`_passLageGen`) — das Auge der Spiel-Kamera atmet im Stand um Millimeter (gemessen 06.10., echte GPU, Mess-Wiese:
// ±4 mm in y je Frame, keine Drehung), und jede neue Wahl darum rechnete jeden Frame dasselbe neu. Das Gesetz trägt den
// Halt in jedem Urteil als Rand (`L.halt`), die gehaltene Wahl verliert darum nichts.
// `drehRand` (Welle C, OMEN-Urteil 06.10.: beim Drehen 360 × 1° war die Kette teurer als vorher): der Rand einer Perspektive
// (Bogenmaß) — das Gesetz trägt den Sinus je Meter Abstand als Rand, die Höhlen-Sicht ihr Sichtfeld je Halbwinkel um das
// 1,5-Fache geweitet; die Wahl hält über eine Drehung bis zur Hälfte (`_wahlHaelt`), dann wählt sie neu.
// `lichtRandTexel` (Welle C, OMEN-Urteil 07.10.: der Tag steht im Spiel nie): der Licht-Rand eines Kaskaden-Passes in Texeln
// seiner Karte — die Wahl der Kaskade hält über die Stufen der Sonne (`_sonnenWinkel`), bis die Drehung des Lichts seit der
// Wahl, mal dem längsten Licht-Weg der Box (`fit.weg`), die Hälfte dieses Rands erreicht (`_wahlHaelt`).
AnazhRealm.PASS_WAHL = Object.freeze({
    sichtRand: 0.003,
    saumM: Object.freeze([8, 24]),
    pflanzeRandM: 2,
    haltM: 0.02,
    drehRand: (2 * Math.PI) / 180,
    lichtRandTexel: 32,
});
// DIE WASSER-WELLE (der Hub des Hydro-Stoffs, `_ensureHydroSurfaceMaterial` liest sie): die Dünung der offenen See
// (drei Rausch-Oktaven je ±0,5, Gewichte `duenung`, × aWave ≤ 1) und das Kräuseln von See und Fluss ((Rausch + `oktave` ·
// Rausch − `mitte`) · `kraeusel` · Kräusel-Stärke ≤ `kraeuselDecke` — die Decke des Reglers `setLakeRipple`), beides × die
// Wind-Zeile des Gesetzes (w0 + w1 · Wind). Der Hub hebt und senkt die Fläche im Shader um höchstens `_wasserHubM()`
// (4,42 m im Sturm; ohne den Wind rechnete er 2,76 m) — die Zellen-Hülle des Wasser-Satzes trägt ihn (vorher nur der
// Saum 2 m: am Bildrand fehlte ein gehobenes Viertel), das Wasser des Fern-Rings liegt darunter (`_fernRingWasserTiefe`).
AnazhRealm.WASSER_WELLE = Object.freeze({
    duenung: Object.freeze([1.4, 0.7, 0.34]),
    oktave: 0.4,
    mitte: 0.7,
    kraeusel: 2.2,
    kraeuselDecke: 1,
    // Die Fluss-Phase (s): eine advektierte Lage des Wasser-Bilds wandert höchstens phase × Strömung weit (4 s × 1,2 m/s
    // = 4,8 m, eine halbe Kräusel-Welle), dann kehrt sie hinter der Blende der zweiten Lage zurück.
    phase: 4,
});
AnazhRealm._wasserHubM = function () {
    const W = AnazhRealm.WASSER_WELLE;
    const duenung = 0.5 * (W.duenung[0] + W.duenung[1] + W.duenung[2]);
    const kraeusel = W.kraeusel * Math.max(1 + W.oktave - W.mitte, W.mitte) * W.kraeuselDecke;
    // der Wind des Gesetzes skaliert beides (Amplitude × (w0 + w1 · Wind), Wind 0 ruhig … 1 Sturm)
    const WG =
        AnazhRealm.Gesetz("terrain:WASSER_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:WASSER_GESETZ");
    return (duenung + kraeusel) * (WG.wind[0] + WG.wind[1]);
};
// Die zwölf Kanten einer Frustum-Scheibe (Ecken 0–3 nah, 4–7 fern, CSMFrustum-Reihenfolge) als Index-Paare.
AnazhRealm.KASKADEN_KANTEN = Object.freeze([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);
// V18.281 — DER ATEM-KOPFRAUM: die Schönheit wächst nur, wenn die Frame-Zeit ≥ diesen
// Abstand UNTER der Decke liegt (17 − 4 = 13 ms ≈ 77 fps). Das Totband [13..17 ms] ist die
// Lunge des Systems: dazwischen hält der Regler → fps ruht über 60 statt am 59er-Anschlag.
AnazhRealm.PERF_HEADROOM_MS = 4;
AnazhRealm.PERF_SENSE_ALPHA = 0.12; // EWMA-Gewicht: ruhige, peer-konsistente Wahrnehmung
// GPU-ZEIT-WELLE — wie lange ein per timestamp-query aufgelöster GPU-Messwert als „echt"
// gilt: bleibt die nächste Auflösung länger aus (Headless-Wechsel, Device-Verlust,
// stockende mapAsync-Kette), fällt `_perfGpuSample` ehrlich auf den Proxy zurück.
AnazhRealm.PERF_GPU_TS_STALE_MS = 2000;
// GPU-Last-Proxy: ms-Äquivalent je Draw-Call (~0.011 → 1092 Draw-Calls ≈ 12 ms). Hebt die
// GPU-Render-Last in die Architektur-Domäne des Aktuators, damit der Regler unter Render-Last die
// render-senkenden Hebel (Schatten-Intervall + Cull-Radius) ZUERST drosselt.
AnazhRealm.PERF_RENDER_CALL_MS = 0.011;
// V18.293 — DER FLUGSCHREIBER (Blackbox): wie viele schlimmste Frames pro Sitzung behalten
// (WORST_CAP), wie oft die Spur nach anazhRealmPerf.json gesichert wird (SAVE_INTERVAL_MS),
// und ab welcher Frame-Zeit ein Frame als „Stocker" gilt (FREEZE_MS ≈ unter 20 fps = spürbar).
AnazhRealm.FLIGHT_RECORDER_WORST_CAP = 12;
AnazhRealm.FLIGHT_RECORDER_SAVE_INTERVAL_MS = 4000;
AnazhRealm.FLIGHT_RECORDER_FREEZE_MS = 50;
// V18.297 — wie viele autonom (vom Nexus) gespawnte Bauten gleichzeitig leben dürfen.
// Großzügig (eine reiche ferne Welt), aber gedeckelt → der Heap kann nicht über Stunden
// volllaufen (das war das Leck). Über dem Cap verblasst das Fernste (_capNexusStructures).
AnazhRealm.MAX_NEXUS_STRUCTURES = 48;
// PID-Gewichte (velocity-Form auf loadScale). Konservativ: stabil > schnell.
AnazhRealm.PERF_PID = Object.freeze({ p: 0.25, i: 0.5, d: 0 });
// Die Stellgrößen-Bänder [min(=max gedrosselt), max(=volle Qualität)]. Der
// Regler interpoliert je nach loadScale × gemessenem Subsystem-Kosten-Anteil.
AnazhRealm.PERF_LEVERS = Object.freeze({
    streamBudgetMs: [2.5, 5], // _loopVoxelStreaming Frame-Budget
    streamMaxPerFrame: [3, 6], // _loopVoxelStreaming max Chunks/Frame
    waterIsoBudgetMs: [3.5, 8], // _tickPendingWaterIso Zeit-Deadline (V18.261-Lever)
    shadowMinInterval: [1, 5], // _loopShadowUpdate min Frames zwischen Schatten-Renders (V18.264)
});
// W12 — E-Reichweite, um ein Portal zu betreten. Etwas großzügiger als
// MOUNT_RANGE_M: ein Tor-Ring ist groß, der Spieler steht davor.
AnazhRealm.PORTAL_REACH_M = 4.5;
// DER PLATZ DES VORSCHAU-WAGENS im Takt (`_ensurePortalPreview`): so viele Orte der Platz-Suche (`_fahrPlatzWege`) je Takt —
// je Ort eine Ebene der Räder (4 Proben des Bodens, ~0,13 ms), an einem tragenden Ort die Bahn und die Welt.
AnazhRealm.FAHR_PLATZ_JE_TAKT = 6;
// Offener Flügel-Winkel der Welt-Tore (Nähe öffnet): wohnt NUR im porta-Gesetzbuch
// (__portaCore.TUER_GESETZ.offen — Shell UND Welt lesen die EINE Quelle); Leser fail-closed nach dem
// _sprintMulGesetz-Muster (Gesetz() memoisiert je Pfad).
AnazhRealm._tuerOffenRad = function () {
    const o = AnazhRealm.Gesetz("porta:TUER_GESETZ.offen", null);
    if (Number.isFinite(o) && o > 0) return o;
    return AnazhRealm._kernPflichtBruch("porta:TUER_GESETZ.offen");
};
// DIE EINE DIÄT-PRÜFUNG (needsRefresh) für jeden Beobachter eines Diät-Objekts — Hauptpass (der Material-
// Beobachter aus _materialObserverDiaet) UND Schattenpass (der Beobachter des r184-Schatten-Materials, s.
// _configureRenderer; dort zählt die Diät des ORIGINAL-Materials am Objekt). `obs` = der Beobachter, `altNR`
// seine Vendor-Bahn. Sie läuft im direkten Draw UND im Bundle-Replay (r184 ruft needsRefresh je verfolgtem Bürger).
//  (1) Instanz-Wächter: equals() walkt nur geometry.attributes — instanceMatrix/instanceColor leben am MESH →
//      Mutation → genau EIN Refresh.
//  (2) gefallen in (6): die Erklärung der Atlanten an die Diät (Integration V18.542) — wer eine Textur liest, muss sich
//      nicht mehr erklären, der Textur-Wächter sieht jede.
//  (3) DIE KAMERA-TREUE: Beobachter UND geteilte Bindegruppe (render · frame: cameraViewMatrix ·
//      cameraProjectionMatrix · uLodAuge) hängen in r184 am PROGRAMM (NodeBuilderState), und jedes Objekt mit eigener
//      Geometrie hat sein eigenes (gemessen 04.10. an der Mess-Wiese: 218 von 234 Programmen sind Diät-Programme).
//      Die renderId-Wand des Vendors refreshte darum JEDES Objekt in JEDEM Pass voll; die Bundle-Abkürzung (V18.518)
//      ließ je Render nur das Stempel-Objekt refreshen, 98 von 99 Programmen zeigten die Kamera ihrer letzten
//      Aufnahme. Die Diät schreibt je Programm und Render die geteilten Gruppen (_diaetGeteiltSchreiben: updateBefore,
//      die render-/frame-Knoten, der Upload genau dieser Gruppen) und fragt dann equals() (Welt-Matrix · Material ·
//      Geometrie · Lichter): voll nur, was sich änderte. Diät-Stoffe tragen nur geteilte renderGroup-Uniforms
//      (Pflicht-Paar _uniformHeimatTeilen), ihre Objekt-Gruppe ändert sich nur mit dem Objekt. Kopf wie der Vendor:
//      Erst-Init, Animation, Velocity und Programme mit updateAfter fahren die Vendor-Bahn. gate:vendor-anker pinnt
//      jede benutzte r184-Stelle und fährt die Treue am Schein-Programm, gate:kamera-treue am echten Bild.
//  (4) EIN GANG JE KNOTEN UND GRUPPE UND RENDER (Welle K, 07.10.): seit der EINE Knoten je Quelle die Render-Gruppen
//      über Programme teilt (_configureRenderer), tragen die Programme DIESELBEN Vorher-Knoten, render-/frame-Knoten und
//      geteilten Gruppen. Der Gang je Programm wiederholte sie: gemessen an der Mess-Wiese (echte GPU, Stand, ein Frame)
//      69–89 Gänge über 9–12 geteilte Gruppen, 930–1 150 Knoten-Besuche, 190–225 Vorher-Besuche — jeder Knoten im Schnitt
//      in 60 Programmen. Jetzt stellt die Diät jeden Knoten und lädt jede geteilte Gruppe EINMAL je RENDER-ABSCHNITT
//      (Stempel am Knoten und an der Gruppe; die Uniform-Knoten einer geteilten Gruppe sind Knoten jedes Programms, das sie
//      trägt — der erste Gang hat sie gestellt). Nur Knoten mit eigener Arbeit je Programm bleiben je Programm: die Instanz-
//      Knoten (je InstancedMesh, 61 von 101 Programmen) haben ohnehin ihren eigenen Stempel. Ein Knoten, der je Zeichen-
//      Objekt arbeitet (Takt object, oder ein Verweis ohne festes Objekt — er liest frame.object), geht je Programm wie bisher.
//  (5) DER RENDER-ABSCHNITT (Gegenprüfung K, 07.10.): der Stempel ist das Paar (Render-Id, `info.calls`) und wechselt beim
//      Betreten UND Verlassen jedes Renders. r184 stapelt die Render-Id (`_renderScene` setzt sie auf `info.calls` und gibt
//      dem äußeren Render danach seine zurück), `info.calls` zählt jeden betretenen Render und fällt nie (`info.reset` lässt
//      ihn stehen). Ein verschachtelter Render, der die geteilten Kamera-Knoten über die VENDOR-Bahn auf seine Kamera stellt
//      (ein Werfer ohne Diät, oder jeder Diät-Werfer der Kaskade an einem Wächter), lässt die Render-Id unverändert zurück:
//      ein Stempel nur aus ihr überlebte ihn, die nächste erstmals geladene Gruppe trug die Schatten-Kamera (gemessen am
//      echten Renderer: das Bild 0,11 gleich mit dem vollen Refresh statt 1,0 — gate:kamera-treue VERSCHACHTELT).
//  (6) DER VORHER-TEXTUR-WÄCHTER (0910-3 A1, Leben-Schau 2: 264× „Destroyed texture [Texture "szene:tiefenabbild"] used
//      in a submit" beim Fenster-Wechsel mit laufendem Loop): ein Vorher-Knoten, der eine Textur zieht (das Tiefen-Abbild,
//      `_tiefenAbbild`), legt sie bei jedem Größenwechsel der Szenen-Tiefe neu an — r184 zerstört dabei die alte GPU-Textur.
//      equals() sieht Textur-Knoten nie: jedes Render-Objekt des Stoffs (das Wasser) zeichnete weiter mit der Bindegruppe
//      der zerstörten Textur, bis sein Stoff neu gebaut wurde. Den Fenster-Wechsel deckte bis dahin ein Wasser-Neubau im
//      resize-Handler (ein Zwilling, gefallen), jeden anderen Wechsel nicht: `setPixelRatio` (die DPR-Kappe
//      `_applyRenderScale` nach einem DPR-Wechsel, Frames NACH dem resize-Ereignis) — nachgestellt am OMEN (GTX 1060,
//      Mess-Wiese, laufender Loop): vier Wechsel, 118 Fehler. Je Render-Objekt merkt die Diät Id und Version dieser
//      Texturen; nach dem Gang (der den Zug und damit den Neubau ausgelöst hat) zieht ein Wechsel EINEN Refresh nach sich,
//      die Bindung folgt der Textur — für JEDEN Größenwechsel, den des Fensters eingeschlossen.
//      JEDE TEXTUR DES PROGRAMMS (Integration V18.542, die weiße Masse): r184 lädt eine Textur nur im Binde-Gang eines
//      Render-Objekts hoch (`Bindings._update`: SampledTexture.update → updateTexture), und den fährt nur ein Refresh. Der
//      Wächter sah nur die Vorher-Knoten, die Atlanten erklärten sich selbst (der Atlas-Wächter (2)); die Daten-Bilder des
//      Boden-Stoffs erklärte niemand: in der stehenden Welt (Mess-Wiese, Software-Holz) hob ein Schreiber die Version der
//      Fern-Krone, der Wege-Karte (nah und fern) und der Kronen-Streu, und die GPU hielt 20 Takte lang die alte (die
//      Version der GPU 3 gegen 4, 20 gegen 21, 17 gegen 18) — hochgeladen nur, wenn zufällig ein Chunk den Satz änderte.
//      Jetzt merkt die Diät Id und Version JEDES Textur-Knotens der Bindegruppen (und der Vorher-Knoten) je Render-Objekt.
AnazhRealm._diaetGang = function (ro, nbs) {
    const jeZeichen = (n, typ) => typ === "object" || (typeof n.property === "string" && n.object === null);
    const vor = [],
        knoten = [],
        eigenVor = [],
        eigenKnoten = [];
    for (const n of nbs.updateBeforeNodes) (jeZeichen(n, n.getUpdateBeforeType()) ? eigenVor : vor).push(n);
    for (const n of nbs.updateNodes) {
        const typ = n.getUpdateType();
        if (typ !== "object") (jeZeichen(n, typ) ? eigenKnoten : knoten).push(n);
    }
    const gruppen = [];
    for (const g of ro.getBindings()) {
        const b0 = g.bindings && g.bindings[0];
        if (b0 && b0.groupNode && b0.groupNode.shared === true) gruppen.push(g);
    }
    // (6) JEDE Textur des Programms: die Vorher-Knoten, die eine Textur ziehen (ihr `value` kann neu angelegt werden), und
    // jeder Textur-Knoten seiner Bindegruppen (ein Daten-Bild oder Atlas, dessen Version ein Schreiber hebt oder dessen Wert
    // ein Wachsen tauscht) — die Knoten sind die des Programms, jedes seiner Render-Objekte bindet dieselben.
    const texturen = nbs.updateBeforeNodes.filter((n) => n.isTextureNode === true);
    for (const g of ro.getBindings())
        for (const b of g.bindings)
            if (b.isSampledTexture === true && b.textureNode && texturen.indexOf(b.textureNode) < 0)
                texturen.push(b.textureNode);
    return { vor, knoten, eigenVor, eigenKnoten, gruppen, texturen };
};
// (6) Wechselte eine Textur des Programms (Id oder Version) seit dem letzten Blick dieses Render-Objekts?
AnazhRealm._diaetVorTextur = function (obs, ro) {
    const nbs = ro.getNodeBuilderState();
    const k = nbs._anazhGang || (nbs._anazhGang = AnazhRealm._diaetGang(ro, nbs));
    if (k.texturen.length === 0) return false;
    const d = obs.getRenderObjectData(ro);
    const v = d._anazhVorTexV || (d._anazhVorTexV = []);
    let anders = false;
    for (let i = 0; i < k.texturen.length; i++) {
        const t = k.texturen[i].value;
        const id = t ? t.id : -1,
            ver = t ? t.version : -1;
        if (v[2 * i] !== id || v[2 * i + 1] !== ver) {
            v[2 * i] = id;
            v[2 * i + 1] = ver;
            anders = true;
        }
    }
    return anders;
};
AnazhRealm._diaetGeteiltSchreiben = function (rend, ro, rid) {
    const nbs = ro.getNodeBuilderState();
    const k = nbs._anazhGang || (nbs._anazhGang = AnazhRealm._diaetGang(ro, nbs));
    // Die Reihenfolge des Vendors (updateBefore → updateForRender): erst alle Vorher-Knoten, dann die Knoten. Ein
    // Vorher-Knoten kann einen Render verschachteln (der Schatten am ersten Licht-Empfänger), und der stellt den EINEN
    // Node-Frame auf SEINE Kamera und SEIN Objekt — der Frame wird darum wie im Vendor je Vorher-Knoten und nach allen
    // Vorher-Knoten neu gestellt (ein vorher gemerkter Frame zeichnete das Hauptbild mit der Schatten-Kamera:
    // gate:kamera-treue ÄNDERUNG 0,10 statt 1). Der Stempel ist der RENDER-ABSCHNITT (rid, `rend.info.calls`, s. (5)):
    // ein Vorher-Knoten trägt den Abschnitt NACH seinem Ruf (der Render, den er verschachtelt, ist dann vorbei), Knoten
    // und Gruppen den Abschnitt nach allen Vorher-Knoten.
    let nf = null;
    for (const n of k.vor) {
        if (n._anazhVorRid === rid && n._anazhVorRuf === rend.info.calls) continue;
        rend._nodes.getNodeFrameForRender(ro).updateBeforeNode(n);
        n._anazhVorRid = rid;
        n._anazhVorRuf = rend.info.calls;
    }
    for (const n of k.eigenVor) rend._nodes.getNodeFrameForRender(ro).updateBeforeNode(n);
    const ruf = rend.info.calls;
    for (const n of k.knoten) {
        if (n._anazhRid === rid && n._anazhRuf === ruf) continue;
        n._anazhRid = rid;
        n._anazhRuf = ruf;
        (nf || (nf = rend._nodes.getNodeFrameForRender(ro))).updateNode(n);
    }
    if (k.eigenKnoten.length) {
        nf = nf || rend._nodes.getNodeFrameForRender(ro);
        for (const n of k.eigenKnoten) nf.updateNode(n);
    }
    let alle = null;
    for (const g of k.gruppen) {
        if (g._anazhRid === rid && g._anazhRuf === ruf) continue;
        g._anazhRid = rid;
        g._anazhRuf = ruf;
        rend._bindings._update(g, alle || (alle = ro.getBindings()));
    }
};
AnazhRealm._diaetRefresh = function (obs, ro, frame, altNR) {
    const obj = ro && ro.object;
    // Die Wächter vergleichen Zahlen am EINEN Daten-Satz des Render-Objekts — eine Prüfung ohne Änderung legt nichts an
    // (vorher je Prüfung zwei Versions-Zeichenketten: Instanz und Atlas). Eine Senke zeichnet über ihren Zeichner (1410-1):
    // ihre Instanz-Puffer sind die der Senke.
    const senke = obj && obj.isInstanzZeichner === true ? obj.__instanzQuelle : obj;
    let d = null;
    if (senke && senke.isInstancedMesh === true) {
        const im = senke.instanceMatrix,
            ic = senke.instanceColor;
        const iId = im ? im.id : -1,
            iV = im ? im.version : -1,
            cId = ic ? ic.id : -1,
            cV = ic ? ic.version : -1;
        d = obs.getRenderObjectData(ro);
        if (d._anazhIId !== iId || d._anazhIV !== iV || d._anazhICId !== cId || d._anazhICV !== cV) {
            d._anazhIId = iId;
            d._anazhIV = iV;
            d._anazhICId = cId;
            d._anazhICV = cV;
            return true;
        }
    }
    // DER GEOMETRIE-WÄCHTER JE RENDER-OBJEKT (Welle 6): der Vendor merkt Attribut-Versionen je GEOMETRIE, nicht je
    // Render-Objekt — der erste Pass, der eine Änderung sieht (die Kaskade), verbraucht sie, und ein Pass, der ein Attribut
    // allein liest (die Normale im Hauptbild), lädt es nie hoch. Gemessen am werfenden Bau-Satz (echte GPU, Dorf der
    // Mess-Wiese): nach dem Wachsen trug die Normale keinen GPU-Puffer, das Hauptbild-Kommando-Paket war ungültig
    // („Vertex buffer slot 5 … was not set"). Geometrie-Id, Index und jedes Attribut (Id · Version) je Render-Objekt.
    const geo = ro && ro.geometry;
    if (geo && geo.attributes) {
        if (d === null) d = obs.getRenderObjectData(ro);
        const g = d._anazhGeoV || (d._anazhGeoV = []);
        const ix = geo.index;
        let anders = g[0] !== geo.id || g[1] !== (ix ? ix.id : -1) || g[2] !== (ix ? ix.version : -1);
        g[0] = geo.id;
        g[1] = ix ? ix.id : -1;
        g[2] = ix ? ix.version : -1;
        let i = 3;
        for (const k in geo.attributes) {
            const a = geo.attributes[k];
            if (g[i] !== a.id || g[i + 1] !== a.version) {
                g[i] = a.id;
                g[i + 1] = a.version;
                anders = true;
            }
            i += 2;
        }
        if (g.length !== i) {
            g.length = i;
            anders = true;
        }
        if (anders) return true;
    }
    const rend = frame && frame.renderer;
    if (
        !rend ||
        obs.hasAnimation === true ||
        !obs.renderObjects.has(ro) ||
        obs.needsVelocity(rend) ||
        ro.getNodeBuilderState().updateAfterNodes.length > 0
    )
        return altNR.call(obs, ro, frame);
    const rid = frame.renderId;
    if (obs.renderId !== rid) {
        obs.renderId = rid;
        AnazhRealm._diaetGeteiltSchreiben(rend, ro, rid);
    }
    // (6) NACH dem Gang: der Zug des ersten Render-Objekts kann die Textur eben neu angelegt haben
    if (AnazhRealm._diaetVorTextur(obs, ro)) return true;
    return obs.equals(ro, obs.getLights(ro.lightsNode, rid), rid) !== true;
};
// W17 Phase B-Relay — der subworld-net-Kanal trägt den `WebSocket`-Verkehr
// einer Multiplayer-Sub-Welt übers Mesh. Ein Größen-Deckel je Nachricht +
// ein Rate-Limit je Sekunde schützen den Kanal vor einer flutenden Sub-Welt.
AnazhRealm.SUBWORLD_NET_MAX_BYTES = 16384; // 16 KiB je ws-send (Relay-.io-Nachrichten sind winzig)
AnazhRealm.SUBWORLD_NET_RATE_WINDOW_MS = 1000;
AnazhRealm.SUBWORLD_NET_RATE_MAX = 120; // ~2 Nachrichten je 60-fps-Frame mit Reserve
// F2 (gigant-plan §5 — G3): die Mesh-Protokoll-Version. Empfänger tolerieren
// fremde Versionen (Felder, die sie nicht kennen, ignorieren sie) — Koexistenz
// alter + neuer Clients im selben Raum. Bump nur bei INKOMPATIBLEN Änderungen.
AnazhRealm.PROTO_VERSION = 1;
// G8 R0 (Robustheits-Bogen, docs/archiv/robustheit-plan.md §2) — der INNERSTE
// RING benannt: die „Feinstrukturkonstante" des Ultiversums. Diese state-Slots
// (Identität + Signatur-/Autorisierungs-Autorität) sind ABWESEND aus der Welt
// der Welten — NIE in einem Welt-Snapshot, NIE in einem Portal-Payload, NIE
// über P2P. Der private ed25519-Schlüssel selbst lebt nur im globalen
// localStorage ("anazh.vibePass") + dem Datei-Backup; sein Fußabdruck sind
// 6 Methoden (_ensureVibePass/_adoptVibePassJwk/_vibeSign/_vibePassExportObject/
// _persistVibePass/importVibePass). _sovereignStateAudit() beweist die Trennung
// headless. Die Liste ist EINGEFROREN + winzig — sie wächst nicht (die
// eBPF-Lehre: ein wachsender Kern ist die Angriffsfläche). revokedKeys (R4) ist
// ebenso global + nie im Snapshot — der Rückruf-Schlüssel des Immunsystems.
AnazhRealm.SOVEREIGN_STATE = Object.freeze({
    // runtime-state-Slots, die NIE in buildStateSnapshot dürfen (GEMESSEN
    // schon ausgeschlossen — der fixe Key-Satz trägt keinen davon):
    excludedStateKeys: Object.freeze(["vibePass", "p2p", "signedWorlds", "customWorlds", "revokedKeys"]),
    // die globalen localStorage-Schlüssel des innersten Rings (privat, nie geteilt):
    privateStorageKeys: Object.freeze(["anazh.vibePass"]),
    // Schlüssel-Material-Feldnamen, die in KEINEM geteilten Kanal lecken dürfen:
    privateFields: Object.freeze(["privateKey", "_privateKeyJwk", "privateKeyJwk"]),
});
// SOVEREIGN_ACTIONS — die eingefrorene Irreversibilitäts-Wand: Akte, die den innersten Ring
// berühren, verlangen eine FRISCHE Mensch-Geste (Host-gerendert, außerhalb jedes iframes) und sind
// NIE automatisch auslösbar (Welt, LLM, Regel, Fluss). DISJUNKT von dslEffects ∪
// NON_BROADCASTABLE_OPS ∪ dslComposeAtomic ∪ Regel-Effekten (headless bewiesen).
// `reveal_private_key` existiert bewusst NICHT. Die Liste bleibt winzig (ein wachsender Prüfer ist
// Angriffsfläche); wallet_transfer/grant_capability sind vorab eingefroren, damit kein künftiger Op
// sie in den DSL-/Broadcast-/Regel-Pool schmuggelt.
AnazhRealm.SOVEREIGN_ACTIONS = Object.freeze([
    "wallet_transfer",
    "sign_manifest",
    "change_identity",
    "grant_capability",
]);
// DIE WELT-AKTE DER DSL (0710-7): jeder Op, der die Welt, ihre Wesen oder den Spieler verändert — Bauten und Spawns, der
// Boden und seine Sichtbarkeit, Zeit und Himmel, die Würfel auf Größe/Tempo/Farbe/Stimmung der Tiere, die Werte und die
// Ausrüstung des Spielers, das Feld. Unter dem Halt einer Messung (`_messHalt`) verweigert `dslEval` jeden von ihnen; das Wetter hält sein eigener
// Schreiber (`_setWeather`). Nicht hier: Definitionen (define_* · set_*_role · register_tool …), Erzählung (say ·
// record_narrative) und Kontrollfluss — sie verändern keine gemessene Welt. gate:weltakt-wache hält den Pool des Nexus
// (`dslComposeAtomic`) in dieser Liste.
// DIE QUELLEN DES SPIELERS (`_spielerVerlangt`, neben „human"): der Begleiter, der seinen Satz ausführt, und seine Werkzeuge —
// die Fähigkeit per Taste, das Wirken, der Verzehr (gate:settlement C7).
AnazhRealm.SPIELER_QUELLEN = Object.freeze(["llm:", "ability:", "capability:", "consume:"]);
AnazhRealm.DSL_WELTAKTE = Object.freeze([
    "spawn_creature",
    "spawn_tree",
    "spawn_studio",
    "spawn_island",
    "spawn_ufo",
    "spawn_village",
    "spawn_temple",
    "spawn_waterfall",
    "spawn_blueprint",
    "spawn_fractal",
    "remove_architecture",
    "apply_op",
    "apply_connection",
    "set_portal",
    "set_visible",
    "voxel_carve",
    "voxel_fill",
    "terrain_steepness",
    "terrain_base_height",
    "gravity",
    "set_time_of_day",
    "set_season",
    "skybox_color",
    "creatures_color",
    "creatures_emotion",
    "creatures_speed_mul",
    "creatures_size_mul",
    "creature_task",
    "creature_task_nearest",
    "creature_task_all",
    "damage_creature",
    "creature_equip_tool",
    "creature_equip_armor",
    "creature_unequip",
    "creature_apply_boost",
    "player_jump_power",
    "player_speed",
    "player_soul",
    "damage",
    "apply_boost",
    "equip_tool",
    "equip_armor",
    "equip_weapon",
    "unequip",
    "add_to_inventory",
    "set_mode",
    "deposit_life",
    "deposit_emotion",
]);
// Sichtbarkeits-Stufen der Welten (eingefroren, jeder Wert exakt eines der Wörter).
// _normalizeWorldVisibility heilt die Legacy-Form "private" → "privat" beim Lesen; geschrieben wird
// nur die kanonische Form.
AnazhRealm.WORLD_VISIBILITY_STAGES = Object.freeze(["privat", "einladung", "verlinkt", "gelistet"]);
AnazhRealm.WORLD_GUEST_RIGHTS_STAGES = Object.freeze(["frieden", "pfad", "mitschöpfer"]);
// Φ1 — die kanonischen Felder einer Welt-Adresse (deterministische Serialisierung
// für Sig/Hash). Reihenfolge ist FROZEN; weitere Felder wandern in die unsignierte
// Hülle (must-preserve), nicht in den signierten Kern.
AnazhRealm.WORLD_ADDRESS_SIGNED_FIELDS = Object.freeze(["worldId", "roomId", "broker", "label"]);
// Regions-Archipel: REGION_CHUNKS=8 (≈ 346 m Kante; ein Snapshot passt in ~200 ms @ 1 MB/s).
// Welten mit Sichtkante > Region bräuchten ≥ 13; die Hysterese (10 m) verhindert Flackern am
// Grenz-Übertritt.
AnazhRealm.REGION_CHUNKS = 8;
// Voxel-Chunk-Span ist FROZEN (43.2 m, _voxelChunkConfig); Region = 8×43.2 = 345.6 m.
AnazhRealm.REGION_SPAN_M = 345.6;
AnazhRealm.REGION_HYSTERESIS_M = 10;
// Werkzeug-Abnutzung (kein Perpetuum mobile): ein gehaltenes Gerät trägt wear (0..1), der je Hieb
// sinkt; unter WEAR_KAPUTT_SCHWELLE ist es verbraucht. Reparieren zahlt MATERIAL
// (REPAIR_COST_FRACTION × Voll-Bau-Kosten × Schaden-Anteil) → wear=1: Bauen → Abbauen → Reparieren
// ist netto nicht-positiv. Ohne wear-Feld liest ein Bauplan 1 (alte Welten verlieren nichts).
AnazhRealm.WEAR_PER_STRIKE_BASE = 0.018; // ein voll-neues Werkzeug hält ~55 Hiebe Basis
AnazhRealm.WEAR_HARDNESS_FLOOR = 0.4; // härte<0.4 → trägt den Voll-Basis-Verschleiß
AnazhRealm.WEAR_HARDNESS_CEIL = 3.0; // härte≥3 (eisen+) → ~1/3 Verschleiß (hartes Werkzeug widersteht)
AnazhRealm.WEAR_KAPUTT_SCHWELLE = 0.05; // unter 5 % wear → Hieb scheitert, Reparatur-Aufruf
AnazhRealm.WEAR_STAT_FLOOR = 0.3; // wear-Faktor auf den Treffer-Schaden: min 30 % auch bei 0 % wear
AnazhRealm.REPAIR_COST_FRACTION = 0.5; // eine Reparatur kostet 50 % der Voll-Bau-Kosten × Schaden
AnazhRealm.REPAIR_TARGET_WEAR = 1.0; // eine erfolgreiche Reparatur stellt voll her
// Portal-Rückkanal (_portalReceiveEvent: Sub-Welt → Heimat-Journal) deckelt Ereignisse je Sekunde —
// sonst verdrängt eine vendorte Welt das 200-Eintrag-Journal in Sekunden. 8/s trägt legitime Bursts.
AnazhRealm.PORTAL_EVENT_RATE_WINDOW_MS = 1000;
AnazhRealm.PORTAL_EVENT_RATE_MAX = 8;
// Der EINE Token-Bucket je Welt am Kanal-EINGANG: deckelt die GESAMT-Rate aller Sub→Heim-Nachrichten
// (auch ready/exit/manifest — gespamtes `ready` löste je Frame _portalReceiveManifest +
// _portalSendEnter aus). 200/s liegt über der legitimen Summe (ws-send 120 + event 8 + Handshakes).
// Transport-seitig → eine verworfene Nachricht ändert keinen State (Determinismus unberührt).
AnazhRealm.PORTAL_CHANNEL_RATE_WINDOW_MS = 1000;
AnazhRealm.PORTAL_CHANNEL_RATE_MAX = 200;
// subworld-net-Eingang vom Mesh-Peer (_cpRate-Muster): max je Sekunde je Peer. Der Sender deckelt
// sich selbst (SUBWORLD_NET_RATE_MAX), ein böswilliger Peer ignoriert das — der Empfänger-Deckel ist
// die echte Wand.
AnazhRealm.SUBWORLD_NET_PEER_RATE_MAX = 120;
// Ko-Präsenz-Injektion: AnazhRealm ist die Multiplayer-Schicht für Welten ohne eigene — das Mesh
// trägt Posen (~10 Hz), die Welt rendert Avatare. Sende-Wand (local-pose aus dem iframe) +
// Empfänger-Wand (subworld-pose je Peer, _cpRate) + Abwesenheits-Timeout (Stille = peer-leave).
AnazhRealm.SUBWORLD_POSE_RATE_WINDOW_MS = 1000;
AnazhRealm.SUBWORLD_POSE_RATE_MAX = 15;
AnazhRealm.SUBWORLD_POSE_PEER_RATE_MAX = 15;
AnazhRealm.SUBWORLD_POSE_TIMEOUT_MS = 6000;
// Input-Brücke: eine Welt, die im ready-Handshake `inputActions` deklariert, bekommt die Tasten als
// SEMANTISCHE Aktionen ({type:"input", action, down} — Daten, nie Key-Codes/Events). Vokabular
// eingefroren + winzig; die Welt wählt daraus, erfindet nie eigene. Die Karte spiegelt die
// Heimat-Controls (WASD/Pfeile · Leertaste · E).
AnazhRealm.PORTAL_INPUT_ACTIONS = Object.freeze(["forward", "back", "left", "right", "jump", "use"]);
AnazhRealm.PORTAL_INPUT_KEYMAP = Object.freeze({
    KeyW: "forward",
    ArrowUp: "forward",
    KeyS: "back",
    ArrowDown: "back",
    KeyA: "left",
    ArrowLeft: "left",
    KeyD: "right",
    ArrowRight: "right",
    Space: "jump",
    KeyE: "use",
});
// Persistenz-Slot einer Fremd-Welt: Zustand als {type:"state", data} (String); die Heimat hält ihn im
// GLOBALEN localStorage (anazh.portalState — nie im Welt-Snapshot, er gehört der Fremd-Welt) und
// reicht ihn beim nächsten Betreten als `restoreState` zurück. Größen- + Welt-Anzahl-Deckel
// (älteste fällt).
AnazhRealm.PORTAL_STATE_MAX_BYTES = 8192;
AnazhRealm.PORTAL_STATE_MAX_WORLDS = 16;
// R6 (V18.152) — die Quarantäne-Queue der gereichten Fähigkeiten (bounded;
// dedupe per Name — ein erneuter Vorschlag refresht, flutet nie).
AnazhRealm.CAPABILITY_PROPOSAL_MAX = 16;
// Mesh-Router-Dispatch-Table: p2pHandleMessage mappt den WS-Nachrichtentyp auf eine
// `_p2pMsg<Type>`-Methode — ein neuer Typ ist ein Eintrag + eine Methode. Kanal-exklusive Typen
// (world-pull, llm-request, subworld-srv, …) laufen bewusst über _p2pHandleChannelMessage.
AnazhRealm.P2P_MESSAGE_HANDLERS = Object.freeze({
    welcome: "_p2pMsgWelcome",
    stats: "_p2pMsgStats", // M8 — das Makro-Fenster
    "peer-join": "_p2pMsgPeerJoin",
    "peer-leave": "_p2pMsgPeerLeave",
    "lobby-rooms": "_p2pMsgLobbyRooms",
    "world-presence": "_p2pMsgWorldPresence", // Φ4 — regionale Köpfe einer Welt
    "creature-pos": "_p2pMsgCreaturePos",
    "companion-say": "_p2pMsgCompanionSay",
    "subworld-net": "_p2pMsgSubworldNet",
    "subworld-pose": "_p2pMsgSubworldPose",
    "portal-invite": "_p2pMsgPortalInvite",
    pos: "_p2pMsgPos",
    input: "_p2pMsgInput", // V18.382 — Lockstep-MP Stufe 2: der Input-Strom (seq · yaw · Bitmask)
    dsl: "_p2pMsgDsl",
    soul: "_p2pMsgSoul",
    vibe: "_p2pMsgVibe",
    "rtc-offer": "_p2pMsgRtcOffer",
    "rtc-answer": "_p2pMsgRtcAnswer",
    "rtc-ice": "_p2pMsgRtcIce",
    "world-request": "_p2pMsgWorldRequest",
    "world-snapshot": "_p2pMsgWorldSnapshot",
});
// Lofi-Pad-Schicht: Wurzel 110 Hz = A2; die Akkordfolge wächst aus
// Tonleiter + funktionaler Markov-Kette, ein Akkord je 4 Schläge. Web-Audio nativ, kein Asset.
AnazhRealm.LOFI_BASE_FREQ = 110; // A2
// Die Skala wohnt im klang-Gesetzbuch (SCALES + scaleFor; _lofiActiveScale liest fail-closed via
// _klangGenreAusKern).
// Funktionale Harmonie-Markov-Kette: je Stufe (0=i … 6=VII) eine Liste [nächste Stufe, Gewicht] —
// Tonika → Subdominante → Dominante → Tonika; seed-getrieben, nie exakt wiederholt, zielgerichtet.
AnazhRealm.LOFI_HARMONY = Object.freeze([
    Object.freeze([
        [3, 3],
        [5, 3],
        [1, 2],
        [4, 1],
        [2, 1],
    ]), // 0 i   → iv/VI/ii°
    Object.freeze([
        [4, 4],
        [6, 3],
        [0, 1],
    ]), // 1 ii° → v/VII
    Object.freeze([
        [5, 3],
        [3, 3],
        [1, 2],
        [0, 1],
    ]), // 2 III → VI/iv
    Object.freeze([
        [4, 3],
        [6, 3],
        [0, 2],
        [1, 1],
    ]), // 3 iv  → v/VII/i
    Object.freeze([
        [0, 5],
        [5, 2],
        [2, 1],
    ]), // 4 v   → i (Auflösung)
    Object.freeze([
        [3, 3],
        [1, 3],
        [4, 2],
        [2, 1],
    ]), // 5 VI  → iv/ii°
    Object.freeze([
        [0, 4],
        [2, 3],
        [5, 1],
    ]), // 6 VII → i/III
]);
// W4 V3 — helle (Dur-Qualität) + dunkle Stufen für die Emotion-Bias der
// Harmonie-Wahl: joy/hope ziehen zu hell, sorrow zu dunkel.
AnazhRealm.LOFI_BRIGHT_DEGREES = Object.freeze([2, 5]); // III, VI
AnazhRealm.LOFI_DARK_DEGREES = Object.freeze([0, 1, 3]); // i, ii°, iv
// Das Tempo wohnt im klang-Gesetzbuch (GENRES; Leser fail-closed via
// _klangGenreAusKern(KLANG_HOST_RECIPE)). KLANG_HOST_RECIPE = das Genre-Rezept des Host-Lofi-Pads
// (`_klangStudioPreset` liest f.recipes[..].fx.klang live).
AnazhRealm.KLANG_HOST_RECIPE = "lofi";
// Welches tetrapoda-Rezept den Host-Bewegungs-Charakter führt (`_motionStudioProfile` liest
// f.recipes[..].fx.motion live) + die Zustands→Profil-Zuordnung (Host moving/idle ↔ Lab joy/idle —
// eine Tabelle, kein if).
AnazhRealm.MOTION_HOST_RECIPE = "wolf";
// ABSCHIEDS-WELLE (Motion-Vollendung) — welches koerper-Rezept den Avatar-Gestalt-
// und Bewegungs-Charakter führt (`_koerperStudioDials`/`_koerperMotionProfile`
// lesen f.recipes[..].s bzw. fx.motion LIVE — das KLANG_HOST_RECIPE-Muster).
AnazhRealm.KOERPER_HOST_RECIPE = "mensch";
// Zustands→Profil-Tabelle je Lab-Spalte: kreatur (tetrapoda) moving→joy · idle→idle; koerper
// (Da Vinci) moving→run · idle→idle.
AnazhRealm.MOTION_PROFILE_MAP = Object.freeze({
    kreatur: Object.freeze({ moving: "joy", idle: "idle" }),
    koerper: Object.freeze({ moving: "run", idle: "idle" }),
});
// Zustand→Profil-Vorrang: der echte Körper-Zustand (updateCreatures stempelt ud._motionZustand:
// schwimmen · jagd · flucht) schlägt in `_motionProfileName` die Emotions-Achse — ein jagendes Wesen
// pirscht ("hunt"), ein schwimmendes paddelt. Kein Zustand → Emotions-Wahl.
AnazhRealm.MOTION_ZUSTAND_PROFILES = Object.freeze({
    schwimmen: Object.freeze({ kreatur: "schwimmen" }),
    jagd: Object.freeze({ kreatur: "hunt" }),
    // die HETZE galoppiert wie die Flucht (Welle LF: der Sprint der Gestalt)
    hetzen: Object.freeze({ kreatur: "flee" }),
    flucht: Object.freeze({ kreatur: "flee" }),
    // koerper-Zustand kampf: frischer Schwung/Schuss (_koerperKampfZustand) wählt das Lab-Profil "fight"
    // (Garde-Haltung); "angry" lebt über MOTION_EMOTION_PROFILES. Lab-only bleiben "showcase" (kein
    // Welt-Verb) und "slide" (die Welt-Rutsch-Pose ist parkour.slidePose, Schicht nach dem Rig).
    kampf: Object.freeze({ koerper: "fight" }),
});
// Wie lange die Kampf-HALTUNG nach dem letzten Angriff steht (s) — der Körper
// bleibt in Garde, dann löst sich die Spannung (Wirts-Gefühls-Regler).
AnazhRealm.KAMPF_HALTUNG_SEC = 3;
// DIE EINE EMOTIONS→PROFIL-BRÜCKE (Daten, kein if-Baum): Zeilen in VORRANG-Reihenfolge; die erste
// Achse (EMOTION_AXES; Kreaturen tragen dieselben, Furcht = sorrow+chaos) über ihrer Schwelle wählt
// das Profil je Spalte, sonst die MOTION_PROFILE_MAP-Default-Zeile. Beide Leser (Rig
// `_animateHumanoidRig` via `_koerperMotionProfile`, Compound `_animateCompoundMotion` via
// `_motionStudioProfile`) lesen sie über den EINEN Resolver `_motionProfileName`.
AnazhRealm.MOTION_EMOTION_PROFILES = Object.freeze([
    // Zorn-Achse: Bedrohung speist sorrow+chaos, der eigene Angriff nur chaos — eine aufgewühlte Seele
    // ohne sorrow steht zornig (angry), nicht ängstlich. `unter` = optionale Gegen-Achsen-Wand der Zeile
    // (greift nur, wenn die benannte Achse UNTER max bleibt); ohne kreatur-Spalte bleibt die
    // Kreatur-Wahl bei der chaos-Zeile darunter (alert/flee).
    Object.freeze({
        axis: "chaos",
        min: 0.5,
        unter: Object.freeze({ axis: "sorrow", max: 0.3 }),
        koerper: Object.freeze({ idle: "angry", moving: "run" }),
    }),
    Object.freeze({
        axis: "chaos", // Furcht/Erregung (Phase E: threatened → sorrow+chaos)
        min: 0.5,
        koerper: Object.freeze({ idle: "fear", moving: "run" }),
        kreatur: Object.freeze({ idle: "alert", moving: "flee" }),
    }),
    Object.freeze({
        axis: "sorrow",
        min: 0.5,
        koerper: Object.freeze({ idle: "sad", moving: "pwalk" }),
        kreatur: Object.freeze({ idle: "idle", moving: "idle" }),
    }),
    Object.freeze({
        axis: "joy",
        min: 0.5,
        koerper: Object.freeze({ idle: "joy", moving: "run" }),
        kreatur: Object.freeze({ idle: "joy", moving: "joy" }),
    }),
]);
// Profil→Rig-Zuordnung als Daten: welches koerper-fx.motion-Feld welches Rig-Bone um welche Achse
// verschiebt (mul = Vorzeichen-Brücke Lab↔Host: Lab armL + hebt, Host-L-Schulter-z ist die
// Adduktions-Achse, R gespiegelt). Angewandt als DELTA zum Lab-idle (`p[key] − ref[key]`) → Idle ist
// per Konstruktion neutral; breath/freq normalisieren auf das Lab-idle (0.042/1.25), der Host-Atem
// (0.02 · 1.6 rad/s) bleibt am Neutralpunkt.
AnazhRealm.MOTION_RIG_MAP = Object.freeze([
    Object.freeze({ key: "headX", bone: "head", axis: "x", mul: 1 }),
    Object.freeze({ key: "headY", bone: "head", axis: "y", mul: 1 }),
    Object.freeze({ key: "headZ", bone: "head", axis: "z", mul: 1 }),
    Object.freeze({ key: "spineX", bone: "spine", axis: "x", mul: 1 }),
    Object.freeze({ key: "spineY", bone: "spine", axis: "y", mul: 1 }),
    Object.freeze({ key: "spineZ", bone: "spine", axis: "z", mul: 1 }),
    Object.freeze({ key: "armL", bone: "armL.shoulder", axis: "z", mul: 1 }),
    Object.freeze({ key: "armR", bone: "armR.shoulder", axis: "z", mul: -1 }),
    Object.freeze({ key: "armLX", bone: "armL.shoulder", axis: "x", mul: 1 }),
    Object.freeze({ key: "armRX", bone: "armR.shoulder", axis: "x", mul: 1 }),
    Object.freeze({ key: "elbowL", bone: "armL.elbow", axis: "x", mul: -1 }),
    Object.freeze({ key: "elbowR", bone: "armR.elbow", axis: "x", mul: -1 }),
    Object.freeze({ key: "hipLX", bone: "legL.hip", axis: "x", mul: 1 }),
    Object.freeze({ key: "hipRX", bone: "legR.hip", axis: "x", mul: 1 }),
    Object.freeze({ key: "hipLZ", bone: "legL.hip", axis: "z", mul: 1 }),
    Object.freeze({ key: "hipRZ", bone: "legR.hip", axis: "z", mul: 1 }),
    Object.freeze({ key: "kneeL", bone: "legL.knee", axis: "x", mul: 1 }),
    Object.freeze({ key: "kneeR", bone: "legR.knee", axis: "x", mul: 1 }),
]);
// Dial↔Genom-Zuordnung (axis = base + mul·dial): height→kh · mass→build · tone→muscle · gender→sex.
// Der Körper baut direkt aus koerper-core.bauMensch(dials); die Tabelle dient nur der
// Genom→Dial-Brücke (`_dialsAusGenom`, Peers/NPCs, invertiert je Zeile) und den Stat-Konsumenten
// (`_koerperDials`). Die EINE Quelle ist koerper-core.DIAL_MAP.
Object.defineProperty(AnazhRealm, "KOERPER_DIAL_MAP", {
    get() {
        const core = (typeof globalThis !== "undefined" && globalThis.__koerperCore) || null;
        return (core && core.DIAL_MAP) || [];
    },
});
// Welche CREATURE_SOULS-Gestalt welches tetrapoda-Rezept liest: wesen = Hirsch (deer), die
// Gattungs-Tiere ihre eigene (wolf/fox/bear). Die Dials überschreiben NUR die vier Zahl-Achsen
// (TETRAPODA_DIAL_MAP); Shapes+Materialien bleiben → Tags byte-gleich. sprite/geist bleiben bewusst
// draußen: skelettlose 2-Part-Minimalformen, kein Vierbeiner.
AnazhRealm.TETRAPODA_SOUL_MAP = Object.freeze({
    wesen: "deer",
    wolf: "wolf",
    fuchs: "fox",
    baer: "bear",
});
// TETRAPODA_DIAL_MAP — Dial→Archetyp-Zuordnung (axis = base + mul·dial, auf das deer-Paar geeicht:
// bei Lab-Startwerten fallen die Archetyp-Werte fast byte-gleich): neck→neckFrac · leg→legFrac
// (Einheiten-Brücke) · build→torsoW · diet→eyeFront (Carnivor frontal, Herbivor lateral).
// Bewusst unmapped: size (die Welt-Größe trägt `_creatureBodySize`, g.size ist stats-tragend).
// Die EINE Quelle ist tetrapoda-core.DIAL_MAP.
Object.defineProperty(AnazhRealm, "TETRAPODA_DIAL_MAP", {
    get() {
        const core = (typeof globalThis !== "undefined" && globalThis.__tetrapodaCore) || null;
        return (core && core.DIAL_MAP) || [];
    },
});
// DIE EINE SCHWIMM-LEHNE: jede Compound-Seele (Built-ins, Custom, Peers) legt sich unter Wasser über
// dieselbe Daten-Zeile (der Rig-Avatar in _animateHuman ebenso). Sie wohnt im Schwimm-Gesetz
// (schwimmen.leanSoul), gelesen fail-closed über _schwimmGesetz.
Object.defineProperty(AnazhRealm, "SOUL_SWIM_LEAN", {
    get() {
        return AnazhRealm._schwimmGesetz().leanSoul;
    },
});
// ALTLASTEN-NULL — die Gnaden-Frist nach dem feld-nativen Tod (Sekunden):
// innerhalb dieser Frist zieht kein Schaden und feuert kein zweiter Respawn.
AnazhRealm.RESPAWN_GRACE_SEC = 8;
// HOLZ-LEITER: EIN Daten-Profil je Hardware-Klasse setzt die FERNE-Deckel (Ring · Schatten-Frustum ·
// Fern-Wasser · Pixel-Cap · Antialias); die NÄHE (Voxel-Detail · LOD0 · Substanz) bleibt immer voll.
// Der EINE PID atmet darunter (Profil = Start + Deckel, kein Parallel-Regler). Wahl: ?holz=<name> >
// localStorage anazhHolz > AUTO (Software-Adapter swiftshader/llvmpipe/lavapipe → kienspan).
AnazhRealm.HOLZ_PROFILE = Object.freeze({
    voll: Object.freeze({ ring: 4, shadowRange: 170, farWater: null, pixelCap: 2, antialias: true }),
    nah: Object.freeze({ ring: 3, shadowRange: 110, farWater: false, pixelCap: 1.25, antialias: true }),
    kienspan: Object.freeze({ ring: 2, shadowRange: 0, farWater: false, pixelCap: 1, antialias: false }),
});
AnazhRealm.LOFI_CHORD_BEATS = 4; // ein Akkord je 4 Schläge
// Das Trommel-Muster wohnt im klang-Gesetzbuch (RHYTHMUS_MUSTER, Leser _lofiGroovePattern), der
// Swing in fx.klang.dna.swing je Genre (Leser _grooveSwing) — beide fail-closed.
AnazhRealm.MOUNT_SPEED_FACTOR = 0.7; // Compounds fahren etwas langsamer als zu Fuß
AnazhRealm.ZOOM_FOV_DEG = 25; // Magnifying-Compound zoomt auf 25°
AnazhRealm.MAGNIFYING_RAY_RANGE_M = 8; // Spieler muss innerhalb dieser Reichweite drauf schauen
AnazhRealm.FOCUSING_HEAT_RANGE_M = 4; // Brennbare Architekturen in diesem Radius werden erhitzt
AnazhRealm.FOCUSING_HEAT_RATE_PER_SEC = 0.05; // Erwärmung pro Sekunde bei sunny
AnazhRealm.FOCUSING_IGNITE_THRESHOLD = 1.0; // Schwelle bei der ignite ausgelöst wird
AnazhRealm.BRENNBAR_TAG_MIN = 0.5; // Architektur gilt als brennbar ab diesem Tag-Wert
// Welt-Effekt-Schwellen (≥0.7 mild, ≥1.5 stark, ≥2.5 signatur), zentral für Tuning.
// === Das lebendige Feld — die Welt→Spieler-Rückkopplung ===
// FIELD_TO_EMOTION: welche Feld-Achse welche Emotion nährt (Ziel-Niveau bei voller Achse); die
// Tabelle IST die Regel. Die Ziele bleiben UNTER der Trigger-Schwelle (0.7) → die Aura stimmt den
// Spieler, löst aber nie selbst einen Welt-Effekt aus (docs/das-lebendige-feld.md §3.2).
AnazhRealm.FIELD_TO_EMOTION = Object.freeze({
    lebendig: { peace: 0.45, hope: 0.3 }, // lebendige Wildnis: Ruhe + Hoffnung
    glut: { chaos: 0.45, awe: 0.25 }, // Glut/Feuer: Unruhe + Ehrfurcht
    magieleitung: { awe: 0.45, hope: 0.2 }, // Magie: Staunen
    // dichte: neutral — Fels/Dichte trägt keine Stimmung
});

// ACTION_TO_EMOTION — die Emotion leitet sich aus dem echten Sein-in-der-Welt ab, über alle sechs
// Achsen aus drei Kanälen: (1) TATEN (diese Tabelle, an jeder realen Handlungs-Stelle verdrahtet),
// (2) UMGEBUNG (FIELD_TO_EMOTION), (3) ZUSTAND (niedrige HP → sorrow/chaos, updatePlayerEmotions).
// Deltas addieren geklemmt; der Decay (0.005/s) sorgt, dass erst anhaltendes Tun in eine Richtung
// die 0.7-Trigger-Schwelle erreicht.
AnazhRealm.ACTION_TO_EMOTION = Object.freeze({
    build: { joy: 0.1, hope: 0.1 }, // erschaffen — der Kern-Positiv-Akt
    create_life: { joy: 0.14, peace: 0.1 }, // Leben spawnen (Spieler) — nähren
    harvest: { joy: 0.06, hope: 0.03 }, // sammeln/ernten — Fülle
    explore: { awe: 0.12, hope: 0.05 }, // neue Region betreten — Entdeckung
    bond: { peace: 0.12, joy: 0.06 }, // eine Kreatur folgt — Beziehung
    resonance: { awe: 0.1 }, // resonante Architektur erlebt
    damage: { sorrow: 0.12, chaos: 0.1 }, // Schaden/Gefahr — Angst
    attack: { chaos: 0.08 }, // V17.54 Kampf D — angreifen (Zorn/Kampf-Intensität); + Waffen-härte via die W2-Brücke
    threatened: { sorrow: 0.14, chaos: 0.12 }, // PHASE E — gejagt + niedrige HP: die FURCHT (der damage-Affekt, durch HP differenziert)
    triumph: { joy: 0.16, hope: 0.1 }, // PHASE E — die Bedrohung bezwungen: Triumph/Erleichterung (der positive δ)
    create: { joy: 0.1, hope: 0.1 }, // V17.46 — einen Bauplan ERSCHAFFEN (Werkstatt/Chat): der Stolz (× Komplexität)
    loss: { sorrow: 0.15 }, // V17.48 — den Verlust einer Kreatur (× Magnitude ∝ Bindung × Vitalität)
});

// Appraisal-Brücke: die Gefühls-Antwort auf eine Tat EMERGIERT aus den TAGS der beteiligten
// Substanz (computeCompoundTags), nicht aus dem Tat-Namen — EINE Resonanz-Tabelle Tag-Achse →
// Emotions-Beitrag (wie FIELD_TO_EMOTION), × Magnitude ∝ Komplexität. sorrow hat bewusst KEIN Tag
// (kein Material ist traurig; Trauer kommt aus Schaden/Verlust/δ).
AnazhRealm.TAG_TO_EMOTION = Object.freeze({
    lebendig: { peace: 0.12, joy: 0.07 }, // Leben/Nähren — warm, ruhig, lebendig
    dichte: { hope: 0.08, peace: 0.03 }, // Solidität, Dauer, Vollendung
    härte: { chaos: 0.05, hope: 0.03 }, // Härte/Kraft — Potenz (auf chaos projiziert)
    zähigkeit: { hope: 0.05 }, // Widerstandskraft, Ausdauer
    wärmeleitung: { peace: 0.05 }, // Wärme, Behaglichkeit
    stromleitung: { awe: 0.05, chaos: 0.03 }, // Energie, Strom
    magieleitung: { awe: 0.1, hope: 0.05 }, // Magie, Wunder, Potenzial
    transparent: { awe: 0.05, peace: 0.03 }, // ätherische Klarheit
    brennbar: { chaos: 0.07, awe: 0.05 }, // Feuer, Gefahr-Thrill, Flüchtigkeit
    resoniert: { awe: 0.1, hope: 0.04 }, // das Singen, Wunder
});

// V17.23 Sky-Harmonie — die maximale Blend-Stärke der DSL/Mood-Himmels-Tönung
// gegen die Tag-Nacht-Farbe (0.6 = die Tönung bis 60 %, der Tag-Nacht-Himmel
// bleibt zu 40 % sichtbar → die Tageszeit überlebt). Browser-justierbar.
AnazhRealm.SKY_TINT_MAX = 0.6;

// LIFE_FIELD — die SCHREIB-Seite des Feldes: über dem frozen worldFieldAt.lebendig-Kern liegt ein
// sparse, langsam zerfallendes Overlay (16-m-Zellen); eine Geburt deponiert Leben, es zerfällt zum
// Substrat zurück (Homöostase). auraAt blendet min(frozen+overlay, 1) — nie überschreiben; leerer
// Overlay → lebendig == frozen. Schließt den at_field_need-Loop: Leben in den Mangel → der Mangel
// sinkt → der Nexus zieht weiter (kein rich-get-richer).
AnazhRealm.LIFE_FIELD = Object.freeze({
    cell: 16, // m — das Hydrosphäre/Voxel-Raster (Region-Skala)
    decayPerSec: 0.008, // Halbwertszeit ~87 s (getendete Region lingert, verwaiste verblasst)
    pulseCenter: 0.25, // eine Geburt hebt die Zelle (sparse ~0.1 → ~0.35, nicht mehr Minimum)
    pulseNeighbor: 0.1, // 3×3-Kernel-Rand (weiche räumliche Ausbreitung, kein Block)
    max: 0.7, // Sättigung pro Zelle (frozen+overlay → ~1; Wiederhol-Pulse sättigen → Nexus zieht weiter)
    epsilon: 0.004, // darunter wird eine Zelle gepruned (die Map bleibt bounded)
    pruneEverySec: 5, // Prune-Rate (piggyback auf updatePlayerEmotions)
    // Kreatur-Trickle: nur Nexus/Spieler-getragene Kreaturen (tendsLife) träufeln Leben, wo sie wohnen —
    // die ambiente Fauna ist die FOLGE des Feldes (kein Runaway). Sanft + rate-limitiert; wandernde
    // Kreaturen ziehen einen zarten Lebens-Pfad.
    trickle: 0.05, // pro Trickle-Deposit (klein — ein Garten wird gepflegt, nicht geflutet)
    trickleEverySec: 3, // jede tendende Kreatur träufelt höchstens alle 3 s
});

// Emotionales Gedächtnis der Welt: pro 16-m-Zelle ein 6-Achsen-Emotions-Abdruck; `_feelAction`
// markiert den Ort, `auraAt` blendet den lokalen Abdruck über die globale Stimmung (der Welt-Tint
// liest `auraAt.emotion` → räumlich). Reaktive Schicht → nicht persistiert, kein Worker-Mirror.
// EMOTION_AXES — die EINE Liste der sechs Achsen (auraAt-Blend + Reset-Pfade).
AnazhRealm.EMOTION_AXES = Object.freeze(["joy", "awe", "sorrow", "hope", "peace", "chaos"]);

// === Der emotionale Kern — das dimensionale Substrat ===
// Jeder Affekt ist ein PUNKT in Valenz × Erregung (Russell-Circumplex, PAD). Der READOUT
// (`_emotionState`) liest Schwerpunkt + INTENSITÄT (Abstand vom Neutralen, 6-dim) → bittersüß
// (joy+sorrow) = Valenz ~0 bei hoher Intensität. Die KOHÄRENZ (updatePlayerEmotions) dämpft
// gegensätzliche Achsen (negativer Dot in dieser Geometrie) mild — emergent, kein Paar-Hardcode.
AnazhRealm.EMOTION_GEOMETRY = Object.freeze({
    joy: { valenz: 0.9, erregung: 0.5 }, // hohe Valenz, gehobene Erregung
    awe: { valenz: 0.1, erregung: 0.9 }, // ambivalent (Furcht + Wunder), höchste Erregung/Weite
    sorrow: { valenz: -0.9, erregung: -0.4 }, // tiefe Valenz, niedrige Erregung
    hope: { valenz: 0.7, erregung: 0.2 }, // positiv, sanfte zukunfts-Erregung
    peace: { valenz: 0.6, erregung: -0.7 }, // positiv, ruhig (niedrigste Erregung)
    chaos: { valenz: -0.7, erregung: 0.7 }, // negativ, hohe Erregung (das Gegenteil von Frieden)
});

// Menschen-lesbare Namen der Achsen — der fusionierte Readout (`_emotionState`)
// gibt sie an die KI/das Journal/die UI als REICHEN Zustand statt sechs Zahlen.
AnazhRealm.EMOTION_LABEL = Object.freeze({
    joy: "Freude",
    awe: "Ehrfurcht",
    sorrow: "Trauer",
    hope: "Hoffnung",
    peace: "Frieden",
    chaos: "Aufruhr",
});

// Was jede Emotion in der WELT bewirkt — die Legende, die das Aura-Rätsel löst (der
// Schöpfer: "verstehe nicht, welche Farbe welche Emotion"). Aus den echten Welt-Effekten
// (_applyEmotionWorldEffects): der Spieler liest, was sein Gefühl tut, statt Farben zu raten.
AnazhRealm.EMOTION_WIRKT = Object.freeze({
    joy: "wärmt den Himmel golden",
    awe: "zieht magisches Licht heran",
    sorrow: "lässt Regen fallen",
    hope: "klärt den Himmel, erhellt die Wesen",
    peace: "besänftigt + verlangsamt die Wesen",
    chaos: "entfesselt die Wesen, treibt alles an",
});

// Sanfte Rate der Kohärenz-Dämpfung (pro s × Gegen-Achsen-Aktivierung × |Dot|): eine einzelne klare
// Emotion wird NICHT gedämpft (0.7-Trigger bleiben erreichbar); nur inkohärente Doppel-Maxima
// (joy UND sorrow hoch) lösen sich auf.
AnazhRealm.EMOTION_COHERENCE_RATE = 0.04;

// === Der emotionale Kern — EMOTION vs. STIMMUNG ===
// EMOTION_DECAY = per-Achse-Multiplikator auf den globalen emotionDecayPerSec: Furcht/chaos verfliegt
// schnell (×2.2), Trauer/peace bleibt (×0.55/0.6), awe mittel-schnell (×1.4), joy/hope mittel.
// Multiplikator 1 = uniformer Decay; der UI-Schieber bleibt der globale Tempo-Knopf.
AnazhRealm.EMOTION_DECAY = Object.freeze({
    joy: 1.0, // mittel — Freude verklingt normal
    awe: 1.4, // Wunder/Überraschung verfliegt etwas schneller
    sorrow: 0.55, // Trauer BLEIBT (zerfällt langsam → ~1.8× länger)
    hope: 0.9, // Hoffnung lingert leicht
    peace: 0.6, // Zufriedenheit/Frieden hält an
    chaos: 2.2, // Furcht/Unruhe verfliegt SCHNELL (akut, kurz)
});
// Die Zeitkonstante der STIMMUNG (s): die mood-EMA über ~2 Minuten = das Temperament.
AnazhRealm.EMOTION_MOOD_TAU = 120;
// Die Stärke der stimmungs-kongruenten Bewertung (× moodValence ∈ [−1,1], NUR auf einen
// REALEN δ — Math.abs(dsig) > deadzone — addiert → bei konstanter Situation KEINE Kongruenz
// → kein spontaner Stimmungs-Runaway, die V17.44-Feedback-Lehre). Mild, browser-justierbar.
AnazhRealm.EMOTION_MOOD_CONGRUENCE = 0.08;

// === Der emotionale Kern — das SOZIALE: Contagion + Bindung ===
// Die Emotion naher Kreaturen fließt zum Spieler (∝ Nähe × Bindung) als RELAXATION zum Ziel (hebend,
// Ziel ≤ 0.5 → kein Runaway); lebt im Kreatur-Tick, nicht im Emotion-Tick. Die Bindung
// (`creature.userData.bond` ∈ [0,1]) wächst, während eine folgende Kreatur nah ist und bei
// „folge mir"; sie gewichtet Contagion + Verlust-Schmerz.
AnazhRealm.EMOTION_CONTAGION = Object.freeze({
    radius: 14, // m — die Reichweite des emotionalen Felds einer Kreatur
    rate: 0.05, // pro Sekunde — die Stärke des Flusses (relaxation, gebounded)
    bondFloor: 0.3, // auch eine ungebundene Kreatur färbt ein wenig (0.3 .. 1.0 mit bond)
    bondGrowPerSec: 0.03, // bond wächst, während eine folgende Kreatur nah ist
    bondFollowBump: 0.12, // bond-Sprung bei der „folge mir"-Geste (assignCreatureTask)
});
// Die binäre Kreatur-Emotion → ein Spieler-Emotions-ZIEL (hebend, gebounded; ≤ 0.5 →
// die Contagion sättigt, sie kann den Spieler nicht über das Gefühl der Kreatur treiben).
AnazhRealm.CONTAGION_TARGET = Object.freeze({
    happy: { joy: 0.5, peace: 0.4 }, // ein freudiges Wesen hebt + beruhigt
    sad: { sorrow: 0.5 }, // ein leidendes Wesen betrübt
});
// Kreatur-Verhalten (Temperament, Jagd, Furcht, Wandern) wohnt NUR im tetrapoda-Gesetzbuch
// (VERHALTEN.*); der EINE Leser ist _verhaltenGesetz() (fail-closed). Die Separations-Kraft sitzt am
// EINEN Bewegungs-Chokepoint (`_applyCreatureSeparation`, jeden Frame auf die Live-Richtung), Zahlen
// in VERHALTEN.separation (gate:tier-separation).
// EMOTION_TEND — die KI als Ko-Regulator: bei anhaltend trüber Stimmung eine tröstende Geste
// (Hoffnung). Self-limiting: der Schub hebt die Stimmungs-Valenz über die Schwelle → Trösten stoppt.
AnazhRealm.EMOTION_TEND = Object.freeze({
    threshold: -0.35, // moodValence darunter (anhaltend trüb) → die KI tröstet
    amount: 0.12, // der Hoffnungs-Schub der tröstenden Geste
});

// === Der emotionale Kern — das ABENTEUER GRADUIERT ===
// Die explore-Magnitude emergiert aus NEUHEIT (erste Begegnung mit einer Region,
// `state.visitedRegions`), DISTANZ vom Ursprung und KÜHNHEIT (in eine karge/glut-Aura wagen, via
// auraAt). Die Appraisal wertet das Ziel, dies den Akt des Wagens.
AnazhRealm.EXPLORE = Object.freeze({
    base: 0.3, // der Grund-Beitrag jedes Chunk-Wechsels
    noveltyNew: 0.7, // erste Begegnung mit einer Region → starkes Staunen
    noveltyRevisit: 0.05, // Wiederkehr → kaum (du kennst den Ort)
    distScale: 600, // m — die Distanz vom Ursprung, ab der das Reisen episch wird
    distWeight: 0.4, // der Distanz-Beitrag (geklemmt auf 1× distWeight)
    boldWeight: 0.5, // die Kühnheit (karge/glut-Aura) als Mut-Beitrag
    min: 0.3,
    max: 1.8, // ein neuer, ferner, karger Wagnis bewegt ~6× ein vertrautes Pendeln
    maxRegions: 4000, // die visitedRegions-Map bounded halten
    pruneRegions: 1000, // beim Überlauf die ältesten Regionen vergessen
});

AnazhRealm.EMOTION_FIELD = Object.freeze({
    decayPerSec: 0.012, // Halbwertszeit ~58 s — Gefühle verblassen schneller als Leben
    imprintScale: 0.5, // wie viel der Tat-Emotion sich am Ort einprägt
    max: 0.8, // Sättigung pro Achse/Zelle (ein Ort wird nicht unendlich traurig)
    epsilon: 0.004, // darunter wird eine Zelle gepruned
    pruneEverySec: 5, // Prune-Rate (piggyback auf updatePlayerEmotions)
    // cell = LIFE_FIELD.cell (16 m) — dieselbe Zell-Quelle (`_lifeCellKey`)
});

// Große Strukturen werden footprint-bewusst aus dem Spieler-Bereich geschoben (sonst Remesh seines
// Chunks + Überlappung → Fall durch den Boden); kleine, intentional platzierte bleiben unangetastet.
AnazhRealm.STRUCTURE_PLAYER_CLEAR_MARGIN = 3.5; // m über den Footprint hinaus
// Der Satz der Welt, wenn ein Dorf nicht entstehen kann, weil das Studio-Buch noch nicht da ist (V-D8: das Log nennt den
// Grund mit Worker-Zustand, der Spieler hört Worte).
AnazhRealm.SIEDLUNG_KALT_SATZ = "Die Werkstatt der Welt erwacht noch — versuch es gleich noch einmal.";
AnazhRealm.STRUCTURE_CLEAR_MIN_FOOTPRINT = 3.0; // darunter = klein/intentional → nicht schieben
// DIE DURCHSICHT DER KAMERA (`_durchsichtGewicht`): zwischen Auge und Ziel (`_kamZielSetzen`) wird eine Pflanze um den
// Sicht-Strahl bis zum Radius durchsichtig und über den Saum ausgedithert, quer zum Strahl wie vor der Ebene des Ziels (m)
// — zu Fuß der Leib (Schultern ± 0,25 m, der Kopf 0,7 m über der Brust), im Ritt der Wagen (4,5 × 1,9 m um die Kabine).
// Dazu die NAH-KUGEL um das Auge (Leben-Schau 2, 09.10.: in allen drei Spuren füllte Laub, Strauch oder Ast die Linse): in
// 3rd fallen Laub und Rinde bis an die Ebene des Ziels (der Freiraum der Kamera), die Boden-Streu bis bodenM (im Ritt
// bodenRittM); im Ich-Auge Laub und Boden-Streu bis ichM — die Rinde, an der der Leib steht, bleibt.
AnazhRealm.KAMERA_DURCHSICHT = Object.freeze({
    fussM: 0.9,
    rittM: 2.0,
    saumM: 0.6,
    bodenM: 2.0,
    bodenRittM: 3.0,
    ichM: 0.8,
});
// Die Zahlen-Algebra der EINEN Durchsichts-Formel (`_durchsichtGewicht`): Skalare oder {x, y, z} — die Linse rechnet damit,
// was der Stoff rechnet.
AnazhRealm.DURCHSICHT_ZAHLEN = Object.freeze({
    k: (n) => n,
    sub: (a, b) => (typeof a === "number" ? a - b : { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
    mul: (a, b) => (typeof a === "number" ? a * b : { x: a.x * b, y: a.y * b, z: a.z * b }),
    div: (a, b) => a / b,
    dot: (a, b) => a.x * b.x + a.y * b.y + a.z * b.z,
    len: (a) => Math.hypot(a.x, a.y, a.z),
    max: (a, b) => Math.max(a, b),
    min: (a, b) => Math.min(a, b),
    clamp01: (a) => Math.min(1, Math.max(0, a)),
});
// Die Schulter der 3rd-Kamera zu Fuß (m): Auge und Blickziel stehen so weit rechts, die Figur links der Bildmitte.
AnazhRealm.KAMERA_SCHULTER_M = 0.6;
// Das Ego-Auge über dem Leib-Zentrum (m): das Rig setzt die Ego-Kamera hier, das Auge der Stufen steht hier, bevor eine
// Kamera gesetzt ist (`_lodAuge`).
AnazhRealm.EGO_AUGE_M = 1.6;
// Fällt der Spieler trotzdem durch (jede Ursache: Remesh-Timing, Teleport, …),
// fängt ihn dieser Boden: unter dem Voxel-Boden (base−floorDrop ≈ −90 m) → zurück
// an die Oberfläche. Bis V17.28 hatten NUR Kreaturen so eine Rettung (y < −50).
AnazhRealm.PLAYER_VOID_Y = -120;
// (P3: SOFT_FLOOR_REST_OFFSET + PLAYER_CHUNK_STALL_MS entfallen — der „weiche Boden"
// + der Sync-BVH-Watchdog sind weg; der Feld-Controller erdet den Spieler direkt aus
// dem Dichtefeld, das überall definiert ist, auch unter ungebauten Chunks.)

// Schrittweite der Zentral-Differenzen im Feld-Gradient (`_fieldGradient`/`_fieldResolveSphere`):
// ≈ halbe Voxel-Schrittweite (eps ≈ λ/2 der Roughness) — fein genug für die echte Normale, grob
// genug gegen Hochfrequenz-Zittern.
AnazhRealm.FIELD_GRAD_EPS = 0.6;

// Max Auswurf-Iterationen pro Kugel (collide-and-slide): typisch 0–2 (flache Penetration), 4 tragen
// auch eine tiefere robust an die Oberfläche; der gesweepte Schritt hält sie radius-beschränkt.
AnazhRealm.FIELD_RESOLVE_ITERS = 4;

// Kapsel-Maße des Spielers, am 1-m-Box-Collider geeicht: footDrop = halbe Box-Höhe (Füße =
// position.y − 0.5 = die Grounded-Annahme); STEP_UP = wie hoch der Spieler ohne Sprung aufsteigt.
AnazhRealm.PLAYER_FOOT_OFFSET = 0.5;
AnazhRealm.PLAYER_STEP_UP = 0.6;
// Die Spanne, um die der gezeichnete Boden über dem Gesetz liegen kann (Lehre 22: Surface-Nets auf 1,8 m trägt die Feinform
// ±0,2 m): der Schritt eines Leibs (`_koerperSchritt`) verlangt über dem Grund des Gesetzes Luft bis Leib-Höhe + Spanne.
AnazhRealm.KOERPER_SICHT_SPANNE = 0.2;
// DER DECKEL DES GANGS (rad, ~34°): so weit nickt und wankt ein gehender Leib höchstens — steiler ist Kletterwand, kein Gang.
// Leser: `_slopePitch` (Mensch und Tier), der Wank der Tier-Proben, die Kletterwand des Tier-Schritts (`_kreaturKletterwand`).
AnazhRealm.GANG_DECKEL_RAD = 0.6;
// DER STAND-LESER DER SICHT (`_standSicht`): die Boden-Karte (das gezeichnete Mesh) zählt nur, solange sie in diesem Band um
// den Träger des Körpers liegt — Mesh gegen Gesetz misst ±0,3 m (Hang-Fuß bis 0,63 m, an Kanten bis 1 m); über einer
// Höhle liegt die Karte um Höhlen-Höhe (≥ 2,4 m) plus Decke darüber, sie trägt dort die Oberkante der Säule, nie den Boden
// unter dem Körper.
AnazhRealm.STAND_SICHT_BAND = 2.0;
// DIE TOD-LAGE (`_todHebeTafel`): der Kipp-Winkel des sterbenden Körpers (~83° — gekippt, nicht vergraben), die Zahl der
// Winkel-Abschnitte der Hebe-Tafel (der Kipp-Takt liest sie linear) und die höchste Zahl der Haut-Punkte je Tod.
AnazhRealm.TOD_KIPP_RAD = 1.45;
AnazhRealm.TOD_KIPP_STUETZ = 16;
AnazhRealm.TOD_KIPP_PUNKTE = 1500;
// Die Zelle des Boden-Rasters der Tod-Lage (m): je Zelle EIN Schritt-Boden des Leibs (`_koerperSchritt`), bilinear dazwischen.
// Gemessen 10.10. (Null-Renderer, je 5 Tode): in der Höhle O3 liegt der Wolf 0,02–0,06 m über seinem Stand-Kontakt (die alte
// Tafel: 0,46–0,52 m darunter); je Tod kostet das Raster 180 (Höhle) bzw. 206 (Freiland) Feld-Proben neben den 25 568
// Karten-Lesungen, die auch die alte Tafel trug.
AnazhRealm.TOD_BODEN_ZELLE = 0.5;
// Die Kopf-Einheit des Avatars (m): 8 Einheiten = die Welt-Körperhöhe ~1,7 m (bauMensch, Wasserlinie, Studio-Maßstab).
AnazhRealm.PLAYER_KH = 0.2125;
// Boden-Haftung: bis zu dieser Distanz UNTER den Füßen klebt der Läufer am Boden — nur wenn er
// vorher geerdet war, NIE im Fall (sonst Magnet-Sog). Kleiner als STEP_UP: am Kamm löst die
// Haftung → natürlicher Sprung-Bogen.
AnazhRealm.PLAYER_GROUND_SNAP = 0.25;
// Wand-Kollisions-Radius — schlanker als die Boden-Kapsel, und die Wand-Kugeln beginnen ERST
// über der Stufe-hoch-Linie (feetY + STEP_UP): so trifft keine Kugel einen Stufen-Riser ≤
// STEP_UP (sonst blockt die Wand-Kollision den Aufstieg, bevor der Boden-Snap heben kann —
// der gemessene Stufe-hoch-Konflikt). Nur echte Wände (höher als STEP_UP) blocken.
AnazhRealm.PLAYER_WALL_RADIUS = 0.35;
// DIE NACHBARSCHAFT DER BLOCKER (`_blockerNetz`): die Kante einer Zelle (Meter, eine Zweier-Potenz — die Zelle eines Punkts ist
// exakt `Math.floor(x / 8)`), die Zahl der Zellen, über der ein Eintrag in der Riesen-Zelle steht, und deren Schlüssel (keine
// ganze Zahl, nie der Schlüssel einer Zelle).
AnazhRealm.BLOCKER_ZELLE = 8;
AnazhRealm.BLOCKER_ZELLEN_MAX = 1024;
AnazhRealm.BLOCKER_RIESE = -0.5;
AnazhRealm._nachBestand = (a, b) => a._blockerSeq - b._blockerSeq;
// ═══ KOPPLUNG — Strömung · Gleiten · Wind · Gras (gate:kopplung) ═══
// Die Strömung ist das Gesetz (`_waterFlowAt` liest WASSER_GESETZ.wellen.adv), die Kopplung additiv (`_stepCharacter` 4b).
// SLIDE_CLIP_PLANES: max. Kontaktebenen im PM_ClipVelocity-Wand-Klip (Quake
// PM_SlideMove: Wand = 1, Ecke = 2, Kerbe = 3 — mehr Ebenen sind degeneriert,
// dann greift der fail-closed Voll-Stopp).
AnazhRealm.SLIDE_CLIP_PLANES = 3;
// GRAS_BEND_SLOTS: Interaktions-Sphären im Wind-Uniform (1 Spieler + 1 Ritt +
// ≤4 nahe Kreaturen — GoT-Interaktions-Budget, vertex-shader-billig).
AnazhRealm.GRAS_BEND_SLOTS = 6;
// GRAS_BEND_CREATURE_DIST_SQ: nur Kreaturen im 18-m-Umkreis des Spielers biegen
// Gras (18² = 324) — weiter draußen ist der Effekt sub-pixel (Distanz-LOD-Lehre).
AnazhRealm.GRAS_BEND_CREATURE_DIST_SQ = 324;
// VIEW-HEIGHT-SMOOTHING: die Füße rasten hart, das AUGE folgt per exp-Tiefpass (das Voxel-Terrain
// ist auf Frame-Skala rau, ~0.23 m/Frame). K = Dämpfungs-Rate (höher = responsiver); ein leichter
// Lag auf rauem Grund IST die Dämpfung. MAX_LAG = darüber snappt das Auge (Teleport/Respawn). In der
// Luft 1:1; bei harter Landung führt der View-Punch-Dip. Das Landungs-/Kamera-Gefühl wohnt im
// Gesetzbuch (fx.bewegung.landung: dipProV/dipMax/minTempo/erholK/kameraK; minTempo gatet auch den
// Landungs-Klang) — die Statics sind Leser (Getter, fail-closed).
Object.defineProperties(AnazhRealm, {
    CAMERA_SMOOTH_K: {
        get() {
            return AnazhRealm._landungGesetz().kameraK;
        },
    },
    LAND_DIP_SCALE: {
        get() {
            return AnazhRealm._landungGesetz().dipProV;
        },
    },
    LAND_DIP_MAX: {
        get() {
            return AnazhRealm._landungGesetz().dipMax;
        },
    },
    LAND_DIP_MIN_SPEED: {
        get() {
            return AnazhRealm._landungGesetz().minTempo;
        },
    },
    LAND_DIP_RECOVER_K: {
        get() {
            return AnazhRealm._landungGesetz().erholK;
        },
    },
});
AnazhRealm.CAMERA_STEP_MAX_LAG = 0.5;
// ═══ SCHRITT-KLANG — Material → Timbre (gate:schritt-klang) ═══
// Asset-freie Farnell-Synthese: Quelle ist immer ein Rausch-Burst, das MATERIAL ist der Filter (erde
// dumpf · stein hell · glut warm · quarz/eisen klirrend · wasser platschig); gain bewusst dezent unter
// dem Kampf-One-Shot. Die Bewegungs-Schwelle wohnt in bewegung.schritt.klangTempoMin, das
// Material→Timbre-Gesetz im klang-Gesetzbuch (SCHRITT_TIMBRE via _schrittTimbre) — Getter sind Leser;
// Tick-Deckel und Landungs-Wichtung sind Wirts-Mischpult.
AnazhRealm.SCHRITT_KLANG = Object.freeze({
    get tempoMin() {
        // m/s — darunter (Mikro-Rutsch im Stand) feuert kein Schritt
        return AnazhRealm._bewegungsBlock("schritt", ["taktCompound", "klangTempoMin"]).klangTempoMin;
    },
    maxProTick: 2, // Frame-Hänger feuern keinen Burst-Schwall (max 2 Füße/Frame)
    gainDeckel: 0.12, // absolute Decke jedes Bursts (unter dem Kampf-Treffer)
    landGainProMs: 0.12, // Zusatz-Verstärkung je m/s Aufprall (∝ Fallhöhe via √(2gh))
    landGainSpanne: 1.4, // maximaler Zusatz — ein harter Sturz bleibt gedeckelt
    landDauerFaktor: 2.0, // die Landung klingt länger nach
    landFreqFaktor: 0.7, // und tiefer — Masse im Aufprall
    get fallback() {
        return AnazhRealm._schrittTimbre().fallback;
    },
    get material() {
        return AnazhRealm._schrittTimbre().material;
    },
});

// Determinismus-Bogen P4 (Stufe 1) — Sicherheits-Cap für die Replay-Aufnahme (Frames).
// 18000 ≈ 5 min bei 60 fps — genug für eine echte Spiel-Sequenz, gedeckelt gegen Runaway.
AnazhRealm.REPLAY_MAX_FRAMES = 18000;

AnazhRealm.WORLD_EFFECT_THRESHOLDS = Object.freeze({
    resonance_mild: 0.7,
    resonance_strong: 1.5,
    resonance_signature: 2.5,
    magic_strong: 1.5,
    precision_high: 0.8,
});
// Form-Tag-Aktivierungs-Matrix: 0 = Form schließt das Tag aus, 1 = schwach, 2 = stark,
// 3 = Signatur. Aktivierte Tag-Stärke = MATRIX × Material-Tag (0..1) → pro Part 0..3.
AnazhRealm.FORM_TAG_ACTIVATION = Object.freeze({
    box: Object.freeze({
        härte: 1,
        dichte: 3,
        zähigkeit: 1,
        wärmeleitung: 1,
        stromleitung: 1,
        magieleitung: 0,
        transparent: 1,
        brennbar: 1,
        resoniert: 0,
        lebendig: 0,
    }),
    // F2 (wahrerwuchs §11) — eine gewölbte Platte IST ein solides Panel → Aktivierung == box.
    plateShell: Object.freeze({
        härte: 1,
        dichte: 3,
        zähigkeit: 1,
        wärmeleitung: 1,
        stromleitung: 1,
        magieleitung: 0,
        transparent: 1,
        brennbar: 1,
        resoniert: 0,
        lebendig: 0,
    }),
    // F2 (wahrerwuchs §11) — ein revolviertes Gefäß IST eine gerundete Hohl-Form → == sphere.
    latheProfile: Object.freeze({
        härte: 0,
        dichte: 3,
        zähigkeit: 0,
        wärmeleitung: 1,
        stromleitung: 1,
        magieleitung: 2,
        transparent: 3,
        brennbar: 0,
        resoniert: 3,
        lebendig: 1,
    }),
    // F5 (wahrerwuchs §11) — ein Speichen-Rad IST eine Zylinder-Scheibe → Aktivierung == cylinder.
    spokeWheel: Object.freeze({
        härte: 1,
        dichte: 2,
        zähigkeit: 2,
        wärmeleitung: 3,
        stromleitung: 3,
        magieleitung: 2,
        transparent: 2,
        brennbar: 1,
        resoniert: 2,
        lebendig: 2,
    }),
    // F2 (wahrerwuchs §11) — ein Spitzhacken-Kopf IST eine spitze Schneide → Aktivierung == cone.
    pickHead: Object.freeze({
        härte: 3,
        dichte: 1,
        zähigkeit: 0,
        wärmeleitung: 2,
        stromleitung: 2,
        magieleitung: 2,
        transparent: 2,
        brennbar: 1,
        resoniert: 1,
        lebendig: 0,
    }),
    // V18.227 (Ω-OPSIS Säule VI) — der prozedurale Fels ist eine dichte Masse wie
    // ein Block: dieselbe Aktivierung wie `box` → stein_block (box → noiserock)
    // bleibt TAG-NEUTRAL (die V17.16-Affinitäts-Wand hält, die Baseline unberührt).
    noiserock: Object.freeze({
        härte: 1,
        dichte: 3,
        zähigkeit: 1,
        wärmeleitung: 1,
        stromleitung: 1,
        magieleitung: 0,
        transparent: 1,
        brennbar: 1,
        resoniert: 0,
        lebendig: 0,
    }),
    sphere: Object.freeze({
        härte: 0,
        dichte: 3,
        zähigkeit: 0,
        wärmeleitung: 1,
        stromleitung: 1,
        magieleitung: 2,
        transparent: 3,
        brennbar: 0,
        resoniert: 3,
        lebendig: 1,
    }),
    cylinder: Object.freeze({
        härte: 1,
        dichte: 2,
        zähigkeit: 2,
        wärmeleitung: 3,
        stromleitung: 3,
        magieleitung: 2,
        transparent: 2,
        brennbar: 1,
        resoniert: 2,
        lebendig: 2,
    }),
    // `limb` = verjüngter Kapsel-Knochen (Glied/Hals/Schwanz); morphologisch ein Zylinder → Aktivierung
    // BIT-IDENTISCH zu `cylinder`. So bleibt jedes aus Gliedern gebaute Wesen tag-neutral gegen die alte
    // Zylinder-Form (Affinitäts-Tag-Wand).
    limb: Object.freeze({
        härte: 1,
        dichte: 2,
        zähigkeit: 2,
        wärmeleitung: 3,
        stromleitung: 3,
        magieleitung: 2,
        transparent: 2,
        brennbar: 1,
        resoniert: 2,
        lebendig: 2,
    }),
    cone: Object.freeze({
        härte: 3,
        dichte: 1,
        zähigkeit: 0,
        wärmeleitung: 2,
        stromleitung: 2,
        magieleitung: 2,
        transparent: 2,
        brennbar: 1,
        resoniert: 1,
        lebendig: 0,
    }),
    pyramid: Object.freeze({
        härte: 2,
        dichte: 2,
        zähigkeit: 0,
        wärmeleitung: 1,
        stromleitung: 1,
        magieleitung: 3,
        transparent: 1,
        brennbar: 1,
        resoniert: 2,
        lebendig: 0,
    }),
    octahedron: Object.freeze({
        härte: 3,
        dichte: 2,
        zähigkeit: 0,
        wärmeleitung: 2,
        stromleitung: 1,
        magieleitung: 3,
        transparent: 3,
        brennbar: 0,
        resoniert: 2,
        lebendig: 0,
    }),
    // `crystalPoint` = facettiertes Prisma mit pyramidaler Termination — Aktivierung BIT-IDENTISCH zu
    // `octahedron`, damit ein daraus gebauter Kristall tag-neutral gegen die alte
    // sphere+octahedron-Druse bleibt (kristall_geode frozen).
    crystalPoint: Object.freeze({
        härte: 3,
        dichte: 2,
        zähigkeit: 0,
        wärmeleitung: 2,
        stromleitung: 1,
        magieleitung: 3,
        transparent: 3,
        brennbar: 0,
        resoniert: 2,
        lebendig: 0,
    }),
    plane: Object.freeze({
        härte: 1,
        dichte: 1,
        zähigkeit: 3,
        wärmeleitung: 2,
        stromleitung: 2,
        magieleitung: 1,
        transparent: 3,
        brennbar: 3,
        resoniert: 2,
        lebendig: 2,
    }),
    torus: Object.freeze({
        härte: 1,
        dichte: 1,
        zähigkeit: 2,
        wärmeleitung: 2,
        stromleitung: 3,
        magieleitung: 3,
        transparent: 1,
        brennbar: 1,
        resoniert: 3,
        lebendig: 1,
    }),
    helix: Object.freeze({
        härte: 0,
        dichte: 0,
        zähigkeit: 3,
        wärmeleitung: 2,
        stromleitung: 3,
        magieleitung: 3,
        transparent: 0,
        brennbar: 2,
        resoniert: 2,
        lebendig: 2,
    }),
});
// Three.js lädt als ESM über das Bootstrap-Module; dieses defer-Script kann trotz document order vor
// ihm laufen (großer Addon-Graph). Der AnazhRealm-Constructor nutzt `new THREE.Vector3()` → auf
// `window.THREE` warten, BEVOR er gerufen wird (Polling alle 10 ms).
function _bootAnazhRealm() {
    if (typeof window !== "undefined" && typeof window.THREE === "undefined") {
        setTimeout(_bootAnazhRealm, 10);
        return;
    }
    const anazhRealm = new AnazhRealm();
    // Globale Referenz für DevTools-Debug und automatisierten Playtest.
    if (typeof window !== "undefined") {
        window.anazhRealm = anazhRealm;
    }
    // Ein Boot, der scheitert, sagt es auf dem Ladeschirm (nie ein stummes Warten).
    Promise.resolve(anazhRealm.init()).catch((e) => {
        anazhRealm._ladeschirmStand(`die Welt konnte nicht erwachen: ${(e && e.message) || e}`);
        throw e;
    });
}
_bootAnazhRealm();
