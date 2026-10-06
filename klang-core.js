// AnazhRealm — klang-core.js: DER KLANG-STUDIO-KERN (Katalysator-Bogen W-A7, ε-Checkliste).
// Die MUSIK-DATEN des Genesis-Labs (worlds/klang/index.html — Genesis Engine Pro,
// generatives Musiksystem): SCALES (die Skalen-Tabelle) · scaleFor (das Dunkelheits-
// Gesetz Skala←DNA) · LAWS (Form/Harmonie/Rhythmus/Bass/Melodie-Optionen) ·
// INSTRUMENTS · DNA (die sechs Mod-Dials) · die 23 Genre-PRESETS (bpm + Gesetze +
// DNA + Instrumentierung). Byte-treu aus dem Schöpfer-Werk extrahiert (Zeilen-Slice,
// sha256-Paritäts-Beleg im Wellen-Bericht) — die Shell UND AnazhRealm lesen DIESE
// eine Quelle (G2.1), ein Nachbau ist verboten.
//
// FORM (Vertrag v1.1 §7 N7.2): namespaced IIFE __klangCore. DIE ERSTE NICHT-
// GEOMETRISCHE DOMÄNE (Vertrag §8, v1.1): der Kern ist MESHFREI (MESHFREI = 1,
// kein buildInstance — B2 ist N/A; der build-asset-Dispatch der Brücke überspringt
// ihn strukturell [typeof buildInstance-Guard], der Validator liest die MESHFREI-
// Deklaration). Seine Rezepte reisen als reine DATEN durchs EINE Buch
// (__replyRecipes): kind "klang", fx.klang = das benannte v1.1-Komponenten-Feld
// (bpm · scaleName/scale [ABGELEITET aus der EINEN Lab-Formel scaleFor(darkness) —
// das exportDrive-Muster N6.2, M3: Export der SELBEN Formel, keine zweite Wahrheit]
// · dna · form/harmony/rhythm/bass/melody · inst · tilt). Host-Konsument: das
// bestehende Lofi-System (_klangStudioPreset → _lofiChordDurationMs liest das
// Studio-Tempo — EIN Audio-System, kein Parallel-Audio).
//
// DETERMINISMUS (G2.3): reine Daten + reine Ableitung — kein Math.random, keine
// Zeit im Manifest-Pfad (der seedbare mulberry32 des Labs bleibt Shell-Runtime).
// THREE-frei, DOM-frei: lädt in Worker, Validator-vm und Node-Gate identisch.
(function (root) {
    "use strict";

    var VERSION = "1.0.0";
    var STUDIO_VERTRAG = 1; // G4.3 — EINE Versions-Semantik
    var MESHFREI = 1; // v1.1 §8 — components-only-Kern: keine Gestalt, nur Daten (B2 N/A)

    // ═══════════════════════════════════════════════════════════════════════
    //  DIE MUSIK-QUELLE — byte-treu worlds/klang/index.html (Zeilen-Slice,
    //  sha256-bewiesen im Wellen-Bericht): SCALES · SCALE_LABELS · scaleFor ·
    //  LAWS · INSTRUMENTS · SIM_INSTRUMENTS · DNA · PRESETS (die Genre-Tafel;
    //  hier das LAB-Objekt — der Vertrags-B1-Block wird unten ABGELEITET).
    // ═══════════════════════════════════════════════════════════════════════
    // prettier-ignore
    const SCALES = {
  ionian:         [0,2,4,5,7,9,11],
  mixolydian:     [0,2,4,5,7,9,10],
  dorian:         [0,2,3,5,7,9,10],
  blues:          [0,3,5,6,7,10],
  aeolian:        [0,2,3,5,7,8,10],
  harmonic_minor: [0,2,3,5,7,8,11],
  chromatic:      [0,1,2,3,4,5,6,7,8,9,10,11]
};
    // prettier-ignore
    const SCALE_LABELS = {
  ionian:'Ionisch', mixolydian:'Mixolydisch', dorian:'Dorisch', blues:'Blues',
  aeolian:'Äolisch', harmonic_minor:'Harm. Moll', chromatic:'Chromatisch'
};
    // prettier-ignore
    function scaleFor(d){
  if (d < 0.15) return 'ionian';
  if (d < 0.30) return 'mixolydian';
  if (d < 0.45) return 'dorian';
  if (d < 0.55) return 'blues';
  if (d < 0.70) return 'aeolian';
  if (d < 0.85) return 'harmonic_minor';
  return 'chromatic';
}

    // prettier-ignore
    const LAWS = {
  form:    { name:'Form',     cols:3, options:{ AAB:{desc:'AAB'}, AABA:{desc:'AABA'}, Vamp:{desc:'Vamp'}, Build:{desc:'Build'}, Sonata:{desc:'Sonate'}, Free:{desc:'Frei'} } },
  harmony: { name:'Harmonie', cols:3, options:{ Blues:{desc:'Blues'}, iiVI:{desc:'ii-V-I'}, Modal:{desc:'Modal'}, Functional:{desc:'Funktional'}, Polychord:{desc:'Polychord'}, Free:{desc:'Frei'} } },
  rhythm:  { name:'Rhythmus', cols:3, options:{ Straight:{desc:'Straight'}, Swing:{desc:'Swing'}, Shuffle:{desc:'Shuffle'}, OneDrop:{desc:'One Drop'}, Breakbeat:{desc:'Breakbeat'}, Bossa:{desc:'Bossa/Clave'}, Funk:{desc:'Funk'}, Rock:{desc:'Rock'}, None:{desc:'Pulslos'} } },
  bass:    { name:'Bass',     cols:3, options:{ Walking:{desc:'Walking'}, Root:{desc:'Grundton'}, RootFive:{desc:'Grundton–Quinte'}, FunkRiff:{desc:'Funk-Riff'}, Achtel:{desc:'Treibende Achtel'}, Sub808:{desc:'808 Sub'}, Riddim:{desc:'Riddim'}, Drone:{desc:'Drone'}, None:{desc:'Kein'} } },
  melody:  { name:'Melodie',  cols:3, options:{ PlayChanges:{desc:'Changes'}, BlueNotes:{desc:'Blue Notes'}, Motivic:{desc:'Motivisch'}, CallResponse:{desc:'Ruf/Antwort'}, MicroPoly:{desc:'Mikropoly'}, Lazy:{desc:'Karge Tupfer'}, None:{desc:'Keine'} } }
};

    // prettier-ignore
    const INSTRUMENTS = {
  drums:   { name:'Schlagzeug', cols:3, options:{ Acoustic:{desc:'Akustik'}, Electronic:{desc:'Elektronisch'}, LoFi:{desc:'Lo-Fi'}, Brush:{desc:'Besen'}, Perc:{desc:'Percussion'} } },
  bass:    { name:'Bass',       cols:4, options:{ DoubleBass:{desc:'Kontrabass'}, PickBass:{desc:'E-Bass'}, Sub808:{desc:'808 Sub'}, SynthBass:{desc:'Synth'}, ReeseBass:{desc:'Reese'} } },
  harmony: { name:'Akkorde',    cols:5, options:{ GrandPiano:{desc:'Klavier'}, Rhodes:{desc:'Rhodes'}, Strings:{desc:'Streicher'}, Guitar:{desc:'Gitarre'}, SynthPad:{desc:'Pad'}, Organ:{desc:'Orgel'}, Clavinet:{desc:'Clavinet'}, Vibraphone:{desc:'Vibraphon'}, SynthBrass:{desc:'Brass'}, DistGuitar:{desc:'E-Git. Zerre'} } },
  lead:    { name:'Melodie',    cols:5, options:{ GrandPiano:{desc:'Klavier'}, Rhodes:{desc:'Rhodes'}, LeadSynth:{desc:'Lead'}, Guitar:{desc:'Gitarre'}, Flute:{desc:'Flöte'}, Vibraphone:{desc:'Vibraphon'}, Marimba:{desc:'Marimba'}, Kalimba:{desc:'Kalimba'}, Organ:{desc:'Orgel'}, SynthBrass:{desc:'Brass'}, DistGuitar:{desc:'E-Git. Zerre'} } }
};
    // prettier-ignore
    const SIM_INSTRUMENTS = ['GrandPiano','Rhodes','Guitar','Strings','SynthPad','LeadSynth','Flute','Vibraphone','Marimba','Kalimba','Organ','Clavinet','SynthBrass','Sub808','Drums'];

    // prettier-ignore
    const DNA = [
  { k:'swing',    label:'Swing' },
  { k:'darkness', label:'Dunkelheit' },
  { k:'color',    label:'Farbe' },
  { k:'flow',     label:'Fluss' },
  { k:'tension',  label:'Spannung' },
  { k:'space',    label:'Raum' }
];

    /* Presets: Gesetze + DNA + Tempo + Instrumentierung pro Genre */
    // prettier-ignore
    const PRESETS = {
  Blues:    { bpm:96,  form:'AAB',   harmony:'Blues',      rhythm:'Shuffle',   bass:'Walking', melody:'BlueNotes',    swing:.72, darkness:.50, color:.30, flow:.50, tension:.40, space:.22, inst:{drums:'Acoustic',   bass:'DoubleBass', harmony:'GrandPiano', lead:'Guitar'} },
  Bebop:    { bpm:168, form:'AABA',  harmony:'iiVI',       rhythm:'Swing',     bass:'Walking', melody:'PlayChanges',  swing:.66, darkness:.28, color:.70, flow:.85, tension:.70, space:.15, inst:{drums:'Acoustic',   bass:'DoubleBass', harmony:'GrandPiano', lead:'GrandPiano'} },
  CoolJazz: { bpm:118, form:'AABA',  harmony:'Modal',      rhythm:'Swing',     bass:'Walking', melody:'Motivic',      swing:.60, darkness:.40, color:.55, flow:.50, tension:.35, space:.30, inst:{drums:'Acoustic',   bass:'DoubleBass', harmony:'GrandPiano', lead:'Flute'} },
  FreeJazz: { bpm:150, form:'Free',  harmony:'Free',       rhythm:'Swing',     bass:'Walking', melody:'MicroPoly',    swing:.30, darkness:.85, color:.95, flow:.90, tension:.90, space:.20, inst:{drums:'Acoustic',   bass:'DoubleBass', harmony:'GrandPiano', lead:'GrandPiano'} },
  BoomBap:  { bpm:90,  form:'Vamp',  harmony:'Modal',      rhythm:'Swing',     bass:'Sub808',  melody:'Lazy',         swing:.58, tilt:{harmony:2,lead:-5}, darkness:.60, color:.45, flow:.40, tension:.50, space:.30, inst:{drums:'LoFi',       bass:'Sub808',     harmony:'Rhodes',     lead:'Rhodes'} },
  Trap:     { bpm:140, form:'Vamp',  harmony:'Modal',      rhythm:'Straight',  bass:'Sub808',  melody:'Motivic',      swing:.12, darkness:.75, color:.35, flow:.50, tension:.70, space:.30, inst:{drums:'Electronic', bass:'Sub808',     harmony:'SynthPad',   lead:'LeadSynth'} },
  Techno:   { bpm:128, form:'Build', harmony:'Modal',      rhythm:'Straight',  bass:'Sub808',  melody:'None',         swing:0,   darkness:.60, color:.20, flow:.30, tension:.65, space:.35, inst:{drums:'Electronic', bass:'Sub808',     harmony:'SynthPad',   lead:'LeadSynth'} },
  DnB:      { bpm:172, form:'Build', harmony:'Modal',      rhythm:'Breakbeat', bass:'Sub808',  melody:'Motivic',      swing:.08, darkness:.60, color:.30, flow:.65, tension:.80, space:.35, inst:{drums:'Electronic', bass:'Sub808',     harmony:'SynthPad',   lead:'LeadSynth'} },
  Reggae:   { bpm:76,  form:'Vamp',  harmony:'Modal',      rhythm:'OneDrop',   bass:'Riddim',  melody:'Lazy',         swing:.15, tilt:{bass:3.5,harmony:1.5,lead:-5}, darkness:.50, color:.30, flow:.35, tension:.30, space:.35, inst:{drums:'Acoustic',   bass:'SynthBass',  harmony:'Guitar',     lead:'Rhodes'} },
  Ambient:  { bpm:60,  form:'Free',  harmony:'Modal',      rhythm:'None',      bass:'Drone',   melody:'MicroPoly',    swing:0,   darkness:.30, color:.40, flow:.15, tension:.15, space:.85, inst:{drums:'Acoustic',   bass:'Sub808',     harmony:'SynthPad',   lead:'Flute'} },
  Barock:   { bpm:96,  form:'Sonata',harmony:'Functional', rhythm:'None',      bass:'Root',    melody:'Motivic',      swing:0,   darkness:.12, color:.25, flow:.60, tension:.40, space:.30, inst:{drums:'Acoustic',   bass:'DoubleBass', harmony:'GrandPiano', lead:'GrandPiano'} },
  Minimal:  { bpm:124, form:'Build', harmony:'Modal',      rhythm:'Straight',  bass:'Root',    melody:'Motivic',      swing:0,   darkness:.35, color:.15, flow:.40, tension:.35, space:.30, inst:{drums:'Electronic', bass:'SynthBass',  harmony:'SynthPad',   lead:'LeadSynth'} },
  LoFi:     { bpm:78,  form:'Vamp',  harmony:'iiVI',       rhythm:'Swing',     bass:'Root',    melody:'Lazy',         swing:.50, tilt:{harmony:2.5,lead:-6,drums:-1}, darkness:.45, color:.60, flow:.35, tension:.25, space:.50, inst:{drums:'LoFi',       bass:'DoubleBass', harmony:'Rhodes',     lead:'Rhodes'} },
  Modern:   { bpm:152, form:'Build', harmony:'Polychord',  rhythm:'Breakbeat', bass:'Sub808',  melody:'MicroPoly',    swing:.15, darkness:.55, color:.85, flow:.55, tension:.70, space:.45, inst:{drums:'Electronic', bass:'Sub808',     harmony:'GrandPiano', lead:'LeadSynth'} },
  Bossa:    { bpm:128, form:'AABA',  harmony:'iiVI',       rhythm:'Bossa',     bass:'RootFive',melody:'CallResponse', swing:.18, darkness:.35, color:.60, flow:.50, tension:.30, space:.45, inst:{drums:'Brush',      bass:'DoubleBass', harmony:'Guitar',     lead:'Flute'} },
  Vibes:    { bpm:126, form:'AABA',  harmony:'Modal',      rhythm:'Swing',     bass:'Walking', melody:'PlayChanges',  swing:.60, darkness:.38, color:.60, flow:.55, tension:.40, space:.40, inst:{drums:'Brush',      bass:'DoubleBass', harmony:'Rhodes',     lead:'Vibraphone'} },
  Funk:     { bpm:104, form:'Vamp',  harmony:'Modal',      rhythm:'Funk',      bass:'FunkRiff',melody:'BlueNotes',    swing:.22, darkness:.45, color:.50, flow:.70, tension:.60, space:.20, inst:{drums:'Acoustic',   bass:'SynthBass',  harmony:'Clavinet',   lead:'SynthBrass'} },
  Latin:    { bpm:184, form:'Vamp',  harmony:'Functional', rhythm:'Bossa',     bass:'RootFive',melody:'Motivic',      swing:.10, darkness:.30, color:.55, flow:.65, tension:.55, space:.25, inst:{drums:'Perc',       bass:'DoubleBass', harmony:'GrandPiano', lead:'SynthBrass'} },
  Dub:      { bpm:74,  form:'Vamp',  harmony:'Modal',      rhythm:'OneDrop',   bass:'Riddim',  melody:'Lazy',         swing:.15, tilt:{bass:4,harmony:1,lead:-4}, darkness:.55, color:.35, flow:.30, tension:.35, space:.70, inst:{drums:'Acoustic',   bass:'Sub808',     harmony:'Organ',      lead:'Rhodes'} },
  Synthwave:{ bpm:92,  form:'Build', harmony:'Modal',      rhythm:'Straight',  bass:'Root',    melody:'Motivic',      swing:0,   darkness:.55, color:.35, flow:.45, tension:.55, space:.50, inst:{drums:'Electronic', bass:'ReeseBass',  harmony:'SynthBrass', lead:'LeadSynth'} },
  Cinematic:{ bpm:72,  form:'Sonata',harmony:'Polychord',  rhythm:'None',      bass:'Drone',   melody:'Motivic',      swing:0,   darkness:.40, color:.70, flow:.30, tension:.45, space:.80, inst:{drums:'Acoustic',   bass:'Sub808',     harmony:'Strings',    lead:'Marimba'} },
  Rock:     { bpm:132, form:'AAB',   harmony:'Functional', rhythm:'Rock',      bass:'Achtel',  melody:'BlueNotes',    swing:.05, darkness:.45, color:.30, flow:.60, tension:.65, space:.22, inst:{drums:'Acoustic',   bass:'PickBass',   harmony:'DistGuitar', lead:'DistGuitar'} }
};

    // ═══════════════════════════════════════════════════════════════════════
    //  B1 REZEPTE (Vertrags-Form) — ABGELEITET aus der Genre-Tafel: ids =
    //  lowercase-Genre-Namen (Vertrags-Namensraum [a-z0-9_-]+; "LoFi" → "lofi").
    //  DIE LABEL-KOLLISIONS-LEHRE (W-A4c): das EINE Buch ist first-wins über
    //  alle Kerne — "modern"/"barock" sind schon fachwerk-Kulturen, die zwei
    //  Genres reisen darum als "modern-klang"/"barock-klang" (ID_AUSNAHMEN;
    //  die Lab-Namen GENRES bleiben unberührt).
    //  kind "klang", s = die numerischen Dials (bpm + die sechs DNA-Achsen —
    //  die Werkstatt-Slider lesen sie über PARAMS/ov), fx.klang = das v1.1-
    //  Komponenten-Feld (die Skala ist per scaleFor(darkness) VOR-ABGELEITET,
    //  damit der Host die EINE Lab-Formel liest statt sie zu duplizieren).
    //  fx.place {mode:"none"}: Klang streut nie (N5.5).
    // ═══════════════════════════════════════════════════════════════════════
    var ID_AUSNAHMEN = { Modern: "modern-klang", Barock: "barock-klang" };
    var VERTRAG_PRESETS = (function () {
        var out = {};
        for (var name in PRESETS) {
            if (!Object.prototype.hasOwnProperty.call(PRESETS, name)) continue;
            var g = PRESETS[name];
            var id = ID_AUSNAHMEN[name] || name.toLowerCase();
            var scaleName = scaleFor(g.darkness);
            out[id] = {
                kind: "klang",
                lab: name,
                s: {
                    bpm: g.bpm,
                    swing: g.swing,
                    darkness: g.darkness,
                    color: g.color,
                    flow: g.flow,
                    tension: g.tension,
                    space: g.space,
                },
                fx: {
                    place: { mode: "none" },
                    klang: {
                        bpm: g.bpm,
                        scaleName: scaleName,
                        scale: SCALES[scaleName].slice(),
                        dna: {
                            swing: g.swing,
                            darkness: g.darkness,
                            color: g.color,
                            flow: g.flow,
                            tension: g.tension,
                            space: g.space,
                        },
                        form: g.form,
                        harmony: g.harmony,
                        rhythm: g.rhythm,
                        bass: g.bass,
                        melody: g.melody,
                        inst: Object.assign({}, g.inst),
                        tilt: g.tilt ? Object.assign({}, g.tilt) : undefined,
                    },
                },
            };
        }
        return out;
    })();

    // ═══════════════════════════════════════════════════════════════════════
    //  B4 PARAMS — die Regler-Tabelle als DATEN (Vertrags-Form): bpm + die
    //  sechs DNA-Achsen (die Lab-UI-Slider; law = die DNA-Labels). def = das
    //  Blues-Boot-Genre des Labs (der Startzustand).
    // ═══════════════════════════════════════════════════════════════════════
    var PARAMS = [
        { id: "bpm", lab: "Tempo", min: 40, max: 200, step: 1, def: 96, law: "Schläge pro Minute", grp: "PULS" },
        {
            id: "swing",
            lab: "Swing",
            min: 0,
            max: 1,
            step: 0.01,
            def: 0.72,
            law: "Shuffle-Anteil der Achtel",
            grp: "DNA",
        },
        {
            id: "darkness",
            lab: "Dunkelheit",
            min: 0,
            max: 1,
            step: 0.01,
            def: 0.5,
            law: "wählt die Skala (scaleFor: ionisch → chromatisch)",
            grp: "DNA",
        },
        {
            id: "color",
            lab: "Farbe",
            min: 0,
            max: 1,
            step: 0.01,
            def: 0.3,
            law: "harmonische Farbtöne/Extensions",
            grp: "DNA",
        },
        {
            id: "flow",
            lab: "Fluss",
            min: 0,
            max: 1,
            step: 0.01,
            def: 0.5,
            law: "melodische Dichte/Bewegung",
            grp: "DNA",
        },
        {
            id: "tension",
            lab: "Spannung",
            min: 0,
            max: 1,
            step: 0.01,
            def: 0.4,
            law: "dissonante Reibung/Steigerung",
            grp: "DNA",
        },
        {
            id: "space",
            lab: "Raum",
            min: 0,
            max: 1,
            step: 0.01,
            def: 0.22,
            law: "Hall/Delay-Anteil (Raumtiefe)",
            grp: "DNA",
        },
    ];

    // ── Der Namensraum (Vertrag v1.1 §7 + §8 MESHFREI): Manifest-Blöcke + Lab-Quelle ──

    // ULTRAGUSS U5 — DAS PROGRESSIONS- UND SCHICHTUNGS-GESETZ (verbatim aus dem
    // Lab): progressionDeg(harmony, bar, srandFn, inDev) → Skalenstufe des Takts
    // (Blues 12-taktig mit Quick-Change · iiVI · Modal · Functional · Polychord ·
    // Free); stack(rootMidi, deg, scale, ext) → Terzschichtung 1-3-5-7(-9,-13).
    // RNG reist als PARAMETER (srandFn) — der Seed-Strom des Rufers bleibt heilig.
    function progressionDeg(harmony, bar, srandFn, inDev) {
        var deg = 0;
        if (harmony === 'Blues') {
            var b = bar % 12;
            var quick = srandFn(Math.floor(bar / 12) * 2.3) > 0.5;
            deg = [0, quick ? 3 : 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4][b];
        } else if (harmony === 'iiVI') {
            deg = [1, 4, 0, 5, 1, 4, 0, 4][bar % 8];
        } else if (harmony === 'Modal') {
            deg = [0, 0, 3, 0, 0, 0, 6, 3][bar % 8];
        } else if (harmony === 'Functional') {
            deg = [0, 3, 4, 0, 0, 5, 1, 4][bar % 8];
        } else if (harmony === 'Polychord') {
            deg = [0, 2, 5, 4][bar % 4];
        } else if (harmony === 'Free') {
            deg = Math.floor(srandFn(bar * 1.71) * 7);
        }
        if (inDev) deg = (deg + 4) % 7;
        return { deg: deg };
    }

    function stack(rootMidi, deg, scale, ext) {
        var L = scale.length;
        var idx = function (k) {
            var q = deg + k, o = Math.floor(q / L);
            return rootMidi + scale[((q % L) + L) % L] + o * 12;
        };
        var t = [idx(0), idx(2), idx(4), idx(6)];
        if (ext >= 2) t.push(idx(8));
        if (ext >= 3) t.push(idx(12));
        return t;
    }

    // DIE AKKORD-BREITE (verbatim aus dem Lab buildTones): die Farbe der
    // Genre-DNA (mods/dna.color) waehlt die Terzschichtung — ueber 0.35 kommt
    // die None dazu, ueber 0.7 die Tredezime. EINE Quelle fuer Lab (stack-ext)
    // und Welt (_lofiChordFromDegree: 3 + ext Toene); kein Zwilling.
    function colorExt(color) {
        var c = isFinite(color) ? color : 0;
        return 1 + (c > 0.35 ? 1 : 0) + (c > 0.7 ? 1 : 0);
    }

    // ── SCHRITT-TIMBRE (Zensus-Rest V18.488, rein additive DATEN-Zeile —
    //    Praezedenz: hostEmergent/DORF_NORM): das MATERIAL→FILTER-Gesetz des
    //    Schritt-Klangs (Farnell-Synthese: die Quelle ist immer ein Rausch-
    //    Burst, das Material ist der Filter). Wanderte aus dem Stamm
    //    (SCHRITT_KLANG.material, byte-gleiche Werte); die Bewegungs-SCHWELLE
    //    (klangTempoMin) wohnt getrennt im koerper-Gesetzbuch — Timbre ist
    //    Klang-Wissen, Schwelle ist Koerper-Wissen. fallback = das Timbre
    //    unbekannter Materialien. Der Wirt liest fail-soft byte-gleich. ──
    // prettier-ignore
    var SCHRITT_TIMBRE = {
        fallback: 'stein',
        material: {
            erde:   { filter: 'lowpass',  freq: 420,  q: 0.8, dauer: 0.09, gain: 0.045 },
            stein:  { filter: 'bandpass', freq: 1500, q: 1.6, dauer: 0.06, gain: 0.055 },
            glut:   { filter: 'bandpass', freq: 800,  q: 1.0, dauer: 0.11, gain: 0.05 },
            quarz:  { filter: 'bandpass', freq: 2600, q: 3.0, dauer: 0.08, gain: 0.045 },
            eisen:  { filter: 'bandpass', freq: 2100, q: 2.4, dauer: 0.07, gain: 0.055 },
            wasser: { filter: 'lowpass',  freq: 900,  q: 0.7, dauer: 0.16, gain: 0.06 }
        }
    };

    // ── RHYTHMUS-MUSTER (Zensus-Rest V18.488, rein additive DATEN-Zeile):
    //    das Trommel-Muster je LAWS.rhythm-Option auf dem 8-Schritt-Raster des
    //    Wirts (Schritt-Indizes je Trommel; die volle Lab-Sim bleibt die
    //    16-Step-Wahrheit — dies ist ihre 8-Step-Verdichtung fuers Welt-Pad).
    //    Der Swing-Eintrag IST das historische Wirts-Pattern (byte-gleich
    //    kick 0/3/4 · snare 2/6 · hihat alle) — jedes Genre ohne eigene Zeile
    //    faellt auf ihn zurueck. None = pulslos (kein Groove, der Bass folgt
    //    dem Puls-Anker Schritt 0). ──
    // prettier-ignore
    var RHYTHMUS_MUSTER = {
        Swing:     { kick: [0, 3, 4],    snare: [2, 6],    hihat: [0, 1, 2, 3, 4, 5, 6, 7] },
        Shuffle:   { kick: [0, 4],       snare: [2, 6],    hihat: [0, 1, 2, 3, 4, 5, 6, 7] },
        Straight:  { kick: [0, 2, 4, 6], snare: [2, 6],    hihat: [1, 3, 5, 7] },
        OneDrop:   { kick: [4],          snare: [4],       hihat: [0, 2, 4, 6] },
        Breakbeat: { kick: [0, 3, 5],    snare: [2, 6, 7], hihat: [0, 2, 4, 6] },
        Bossa:     { kick: [0, 3, 4, 7], snare: [2, 5],    hihat: [0, 1, 2, 3, 4, 5, 6, 7] },
        Funk:      { kick: [0, 2, 5],    snare: [2, 6],    hihat: [0, 1, 2, 3, 4, 5, 6, 7] },
        Rock:      { kick: [0, 4],       snare: [2, 6],    hihat: [0, 1, 2, 3, 4, 5, 6, 7] },
        None:      { kick: [],           snare: [],        hihat: [] }
    };

    // ── RAUM-AKUSTIK (Schluss-Welle 17.07., rein additive DATEN-Zeile):
    //    die Raum-Gesetze des Lab-Mixers reisen als Daten (worlds/klang/
    //    klang.js Z.143-160 + DELAY_SENDS Z.4133, byte-treu) —
    //    hall = der Faltungshall (Impulsantwort 3.4 s / decay 2.4, Predelay
    //    0.02 s, Return = space × returnProSpace) · echo = das tempo-
    //    synchrone Echo (punktierte Achtel = beatFrac 0.75, Klemme
    //    0.06-1.8 s, Feedback 0.42, Band 260-2800 Hz, Return = echo ×
    //    returnProEcho) · DELAY_SENDS = die genre-typischen Echo-Anteile je
    //    Kanal (Dub lebt vom Delay, Ambient badet darin, Jazz braucht fast
    //    keins; def deckt jedes Genre ohne eigene Zeile). Der Welt-Spieler
    //    konsumiert hall.returnProSpace + echo (Tempo-Sync/Feedback/Band)
    //    + DELAY_SENDS auf seinem EINEN Delay-Raum-Bus; die volle Faltung
    //    bleibt die Lab-Sim (das Welt-Pad bleibt asset-frei). ──
    // prettier-ignore
    var RAUM = {
        hall: { impulseSec: 3.4, decay: 2.4, predelaySec: 0.02, returnProSpace: 0.5 },
        echo: { beatFrac: 0.75, minSec: 0.06, maxSec: 1.8, feedback: 0.42, hpHz: 260, lpHz: 2800, returnProEcho: 0.85 },
        DELAY_SENDS: {
            Reggae:{ harmony:.4, lead:.34, drums:.1 }, Ambient:{ lead:.45, harmony:.3 },
            LoFi:{ lead:.2, harmony:.12 }, BoomBap:{ lead:.16 }, Trap:{ lead:.2 },
            DnB:{ lead:.22 }, Techno:{ lead:.26, harmony:.1 }, Modern:{ lead:.2 },
            Dub:{ harmony:.5, lead:.42, drums:.2 }, Synthwave:{ lead:.3, harmony:.2 },
            Bossa:{ lead:.18 }, Latin:{ lead:.14 }, Funk:{ lead:.14 },
            Cinematic:{ lead:.3, harmony:.22 }, Vibes:{ lead:.16 }, Rock:{ lead:.18 },
            def:{ lead:.12 }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    //  DIE UMWELT (Welle 5 Klang, 05.10.) — die Klang-Gesetze der WELT: was man
    //  an einem Ort hoert, folgt aus dem, was dort IST (Wind · Kronen-Deckung ·
    //  Wasser · Glut · Regen · Sonne · Leben · Jahreszeit). Drei Schichten, alle
    //  hier, alle rein (rein additiv; PRESETS/PARAMS unberuehrt):
    //   (1) TEXTUR — jede Stimme ist ein Gesetz ueber die Zeit, als nahtlose
    //       Schleife gerendert (umweltTextur → {sr, daten}; deterministisch je
    //       Saat): Rauschen-Farben (Wind), Laub-Koerner (Blatt-Kollisionen),
    //       MINNAERT-Blasen (f = 3,26/r — Bach, Fall, Ufer, Tropfen),
    //       Poisson-Knistern mit Pareto-Amplituden (Glut), Vogel-Phrasen,
    //       DOLBEAR-Grillen (Zirp-Takt aus der Temperatur).
    //   (2) MISCHUNG — die Lage am Ohr → Pegel (dB am Welt-Bus) · Filter ·
    //       Panorama · Takt je Stimme (umweltMischung, reine Mathematik):
    //       Wind ∝ v^1,25 (dieselbe Boee, die das Gras biegt) · Laub ∝ Deckung ·
    //       Ufer/Fluss als LINIEN-Quelle (−3 dB je Abstands-Verdopplung) ·
    //       Fall/Glut als PUNKT-Quelle (−6 dB) · Voegel aus Morgenchor × Leben ×
    //       Lebensraum · Grillen nachts, warm.
    //   (3) SCHALTUNG — der EINE Graph-Bauer (umweltGraph(ctx, ausgang)): Lab,
    //       Welt und Linse bauen DENSELBEN Graphen (Lab = Welt). Eine Quelle
    //       laeuft nur, solange ihre Stimme hoerbar ist (Hoerschwelle mit
    //       Hysterese, Stimmen-Deckel) — Kosten an Hoerbares gebunden, nie an
    //       die Weltgroesse; je anwenden() hoechstens EINE neue Textur.
    //  Und der TIER-RUF: die Stimme folgt dem Koerper (Grundton und Formanten
    //  ∝ Koerperlaenge^−0,9, die Allometrie der Lautgebung), die Kontur der
    //  Stimmung (tierRufPuffer/tierRuf).
    // ═══════════════════════════════════════════════════════════════════════
    // prettier-ignore
    var UMWELT = {
        texturRmsDb: -20,      // jede Textur ist auf diesen RMS geeicht (dBFS)
        hoerschwelleDb: -64,   // darunter schweigt eine Stimme (Pegel am Welt-Bus)
        hystereseDb: 4,        // eine laufende Stimme schweigt erst unter Schwelle − Hysterese
        stimmenMax: 7,         // Stimmen-Deckel je Moment (die lautesten gewinnen)
        rampeSek: 0.35,        // Zeitkonstante der Pegel-/Filter-Rampen je Takt
        abklangSek: 0.12,      // Zeitkonstante des Verstummens
        masterBasis: 0.35,     // der Welt-Master (Wirt UND Lab: EIN Mischpult)
        // DIE SPITZEN-WAND hinter dem Master (umweltSpitze): das Knistern der Glut auf Armlaenge (Scheitelfaktor
        // 29 dB) und der Sturm im Wald trugen Spitzen ueber 0 dBFS. Eine Kennlinie ohne Gedaechtnis: bis linearBisDb
        // exakt linear (kein Pegel aendert sich), darueber saettigt sie weich (tanh) gegen deckeDb; kopfraumDb
        // Eingangs-Spielraum, ueberabtastung gegen Aliasing der Saettigung.
        spitze: { linearBisDb: -6, deckeDb: -1, kopfraumDb: 12, punkte: 8193, ueberabtastung: "4x" },
        // DAS OHR des Wirts — Kosten je Frame, nie die Weltgroesse: der Hoer-Ring (Mitte + radien × richtungen,
        // Meter) wird mit probenJeFrame Punkten je Frame abgetastet, die Glut-Bauten mit bautenJeFrame Eintraegen
        // je Frame (Hoerweite + glutRandM); die Mischung laeuft im Takt mischSek (Sekunden).
        ohr: { radien: [4, 10, 22, 40], richtungen: 8, probenJeFrame: 2, bautenJeFrame: 48, glutRandM: 20, mischSek: 0.1 },
        stimmen: {
            // Wind ueber offenem Land: v = vMin + (vMax − vMin)·windFeld, vEff = v·Boee am Ohr.
            wind:   { textur: ["wind"], sr: 22050, sek: 9.7, saat: 11, quellen: 2, spreizung: 0.6, filter: "bandpass",
                      vMin: 1, vMax: 15, vRef: 2, refDb: -32, exponent: 1.25, hzBasis: 180, hzProMs: 55, q: 0.8, schutz: 0.6, kalibHz: 290 },
            // Wind im Laub: dieselbe Boee × Kronen-Deckung (Blatt-Koerner 2–7 kHz).
            laub:   { textur: ["laub"], sr: 32000, sek: 6.1, saat: 23, quellen: 2, spreizung: 0.7, filter: "bandpass",
                      refDb: -27, exponent: 1.2, hzBasis: 2600, hzProMs: 120, q: 0.5, kalibHz: 2840 },
            // stilles Wasser am Ufer (See/Meer): Linien-Quelle, Wellen-Schlag aus dem Wind.
            ufer:   { textur: ["ufer"], sr: 16000, sek: 13.3, saat: 31, quellen: 1, filter: "lowpass", gerichtet: true,
                      refDb: -24, dRef: 2, dMin: 0.7, anteilRef: 0.3, wellenDb: 6, hoerweiteM: 45, hzFern: 700, hzNah: 3000, hzHalbM: 8, kalibHz: 3000 },
            // fliessendes Wasser: Linien-Quelle, Pegel ∝ Stroemung (Minnaert-Blasen des Bachs).
            fluss:  { textur: ["fluss"], sr: 22050, sek: 7.3, saat: 47, quellen: 1, filter: "lowpass", gerichtet: true,
                      refDb: -22, dRef: 2, dMin: 0.7, tempoRef: 1.2, hoerweiteM: 55, hzFern: 1500, hzNah: 8000, hzHalbM: 10, kalibHz: 8000 },
            // Wasserfall: Punkt-Quelle, Pegel ∝ Fallhoehe.
            fall:   { textur: ["fall"], sr: 16000, sek: 6.7, saat: 53, quellen: 1, filter: "lowpass", gerichtet: true,
                      refDb: -14, dRef: 5, dMin: 2, hRef: 6, hoerweiteM: 90, hzFern: 600, hzNah: 3600, hzHalbM: 20, kalibHz: 3600 },
            // Regen: der rain-Kanal des Wetter-Felds; unter Kronen heller (Tropfen auf Laub).
            regen:  { textur: ["regen"], sr: 32000, sek: 5.9, saat: 61, quellen: 2, spreizung: 0.8, filter: "lowpass",
                      refDb: -26, deckungDb: 3, hzBasis: 5000, hzDeckung: 4000, kalibHz: 7000 },
            // Glut: Punkt-Quelle (Poisson-Knistern + Glut-Rauschen); Staerke = √(Brenn-Flaeche / Flaeche des Bezugs-
            // Glutbetts), ≤ 1. Ein Bett-Feuer setzt Waerme — und mit ihr das Knistern der platzenden Harz- und Wasser-
            // Taschen — proportional zu seiner BRENNENDEN Flaeche frei (Q = q''·A): Schall-Leistung ∝ A. Bezug ist das
            // Glutbett der Studio-Feuerstelle (fachwerk DIE MASSE: Glutbett Ø 0,76 m) — refDb gilt fuer genau dieses
            // Feuer. Die Kugel-Huelle eines Bauplans traegt Flammen-Luft ueber dem Bett, keinen Brennstoff: der Wirt
            // misst die Grundflaeche seiner Glut-Teile, nie ihr Volumen.
            glut:   { textur: ["glut"], sr: 32000, sek: 7.9, saat: 71, quellen: 1, filter: "lowpass", gerichtet: true,
                      refDb: -18, dRef: 1.5, dMin: 0.6, bettRefM: 0.76, hoerweiteM: 26, hzFern: 4500, hzNah: 12000, hzHalbM: 8, kalibHz: 12000 },
            // Voegel: Morgenchor(Sonne) × √lebendig × Lebensraum(Deckung) × (1 − Regen)² × Windruhe.
            vogel:  { textur: ["vogelA", "vogelB"], sr: 24000, sek: [23.3, 17.9], saat: [83, 89], quellen: 2, spreizung: 0.55,
                      filter: "lowpass", refDb: -30, habitatBasis: 0.35, windStill: 0.8, hz: 9000, kalibHz: 9000,
                      chor: [[-0.15, 0], [0, 0.7], [0.12, 1], [0.4, 0.6], [1, 0.55]] },
            // Grillen: nachts × Waerme × offenes Gras; Zirp-Takt nach DOLBEAR (N/min = 7·(T − 10) + 40).
            grille: { textur: ["grille"], sr: 22050, sek: 4.3, saat: 97, quellen: 2, spreizung: 0.5, filter: "highpass",
                      refDb: -34, tMin: 2, tMax: 24, tStumm: 12, tVoll: 16, nRef: 110, nachtAb: 0.05, nachtVoll: -0.15, hz: 2500, kalibHz: 2500 }
        },
        // Der Tier-Ruf: f0 = fRef·(L/lRef)^−exponent, Formanten ∝ 1/L; Kontur je Stimmung.
        tier: {
            fRef: 420, lRef: 1, exponent: 0.9, f1Ref: 700, f2Ref: 1800, refDb: -12, dRef: 2, dMin: 0.7,
            hoerweiteM: 60, sr: 22050,
            rufProMin: { freude: 0.9, ruhe: 0.4, trauer: 0.6, furcht: 1.5 },
            konturen: {
                freude: { teile: 2, sek: 0.17, pause: 0.11, start: 1.0, gipfel: 1.22, ende: 0.92, vibrato: 0 },
                ruhe:   { teile: 1, sek: 0.32, pause: 0, start: 0.96, gipfel: 1.08, ende: 0.9, vibrato: 0.01 },
                trauer: { teile: 1, sek: 0.95, pause: 0, start: 1.15, gipfel: 1.18, ende: 0.78, vibrato: 0.03 },
                furcht: { teile: 3, sek: 0.09, pause: 0.06, start: 1.35, gipfel: 1.5, ende: 1.2, vibrato: 0 }
            }
        },
        // DIE ORTE DES LABS (Lab = Welt): typische Lagen der vier Mess-Orte — das Lab
        // spielt sie ueber denselben Graphen, die Linse misst die echten Lagen der Welt.
        orte: {
            wiese:   { windFeld: 0.06, boe: 0.7, deckung: 0.12, regen: 0, sonne: 1, saisonPhase: 0.375, lebendig: 0.5 },
            seeufer: { windFeld: 0.06, boe: 0.7, deckung: 0.2, regen: 0, sonne: 1, saisonPhase: 0.375, lebendig: 0.55,
                       ufer: { d: 3, anteil: 0.4, pan: 0.3 } },
            wald:    { windFeld: 0.06, boe: 0.7, deckung: 0.85, regen: 0, sonne: 1, saisonPhase: 0.375, lebendig: 0.7 },
            dorf:    { windFeld: 0.06, boe: 0.7, deckung: 0.15, regen: 0, sonne: 1, saisonPhase: 0.375, lebendig: 0.45,
                       glut: { d: 4, flaeche: 0.4536, pan: -0.4 } },
            glutArm: { windFeld: 0.06, boe: 0.7, deckung: 0.15, regen: 0, sonne: 1, saisonPhase: 0.375, lebendig: 0.45,
                       glut: { d: 1, flaeche: 0.4536, pan: -0.2 } },
            fallArm: { windFeld: 0.06, boe: 0.7, deckung: 0.3, regen: 0, sonne: 1, saisonPhase: 0.375, lebendig: 0.6,
                       fall: { d: 3, hoehe: 12, pan: 0.3 } },
            sturm:   { windFeld: 1, boe: 1, deckung: 0.5, regen: 1, sonne: 0.4, saisonPhase: 0.6, lebendig: 0.5 },
            nacht:   { windFeld: 0.06, boe: 0.7, deckung: 0.12, regen: 0, sonne: -0.6, saisonPhase: 0.375, lebendig: 0.5 }
        }
    };

    // ── Werkzeuge der Texturen (rein, deterministisch) ──
    function umweltRng(saat) {
        var a = saat >>> 0;
        return function () {
            a = (a + 0x6d2b79f5) >>> 0;
            var t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    // RBJ-Biquad, Direct Form I, in place (lowpass · highpass · bandpass mit 0 dB Spitze).
    function bq(x, sr, typ, f, q, von, bis) {
        var w0 = (2 * Math.PI * Math.min(f, sr * 0.45)) / sr;
        var cs = Math.cos(w0), al = Math.sin(w0) / (2 * q);
        var b0, b1, b2, a0 = 1 + al, a1 = -2 * cs, a2 = 1 - al;
        if (typ === "lowpass") { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = (1 - cs) / 2; }
        else if (typ === "highpass") { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = (1 + cs) / 2; }
        else { b0 = al; b1 = 0; b2 = -al; }
        b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;
        var x1 = 0, x2 = 0, y1 = 0, y2 = 0, i0 = von || 0, i1 = bis == null ? x.length : bis;
        for (var i = i0; i < i1; i++) {
            var xi = x[i], yi = b0 * xi + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
            x2 = x1; x1 = xi; y2 = y1; y1 = yi; x[i] = yi;
        }
        return x;
    }
    // Rauschen-Farben: weiss · rosa (Kellet) · braun (leckender Integrator).
    function farbe(n, art, rnd) {
        var x = new Float32Array(n), i, w;
        if (art === "rosa") {
            var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (i = 0; i < n; i++) {
                w = rnd() * 2 - 1;
                b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
                b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856;
                b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
                x[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
            }
        } else if (art === "braun") {
            var b = 0;
            for (i = 0; i < n; i++) { w = rnd() * 2 - 1; b = (b + 0.02 * w) / 1.02; x[i] = b * 3.5; }
        } else {
            for (i = 0; i < n; i++) x[i] = rnd() * 2 - 1;
        }
        return x;
    }
    function rms(x) {
        var s = 0;
        for (var i = 0; i < x.length; i++) s += x[i] * x[i];
        return Math.sqrt(s / Math.max(1, x.length));
    }
    function mischeIn(ziel, quelle, k) {
        for (var i = 0; i < ziel.length; i++) ziel[i] += quelle[i] * k;
        return ziel;
    }
    // Langsame Zufalls-Huelle in [0,1]: tiefpass-gefiltertes Rauschen um 0,5.
    function huelle(n, sr, hz, tiefe, rnd) {
        var e = bq(farbe(n, "weiss", rnd), sr, "lowpass", hz, 0.707);
        var r = rms(e) || 1;
        for (var i = 0; i < n; i++) {
            var v = 1 - tiefe + tiefe * (0.5 + 0.5 * Math.max(-1, Math.min(1, e[i] / (2 * r))));
            e[i] = v;
        }
        return e;
    }
    // Ein Rausch-Korn: band-gefiltertes Rauschen (RBJ-Bandpass, Zustand je Korn frisch) mit
    // schnellem Anstieg und exponentiellem Abklang — allokationsfrei.
    function korn(x, sr, t0, dauer, f, q, amp, rnd) {
        var i0 = Math.floor(t0 * sr), n = Math.max(4, Math.floor(dauer * sr));
        if (i0 >= x.length) return;
        var w0 = (2 * Math.PI * Math.min(f, sr * 0.45)) / sr, cs = Math.cos(w0), al = Math.sin(w0) / (2 * q), a0 = 1 + al;
        var b0 = al / a0, b2 = -al / a0, a1 = (-2 * cs) / a0, a2 = (1 - al) / a0;
        var x1 = 0, x2 = 0, y1 = 0, y2 = 0, an = Math.max(1, Math.floor(n * 0.08)), abkl = Math.exp(-4 / n), env = 1;
        for (var k = 0; k < n && i0 + k < x.length; k++) {
            var xi = rnd() * 2 - 1, yi = b0 * xi + b2 * x2 - a1 * y1 - a2 * y2;
            x2 = x1; x1 = xi; y2 = y1; y1 = yi;
            if (k >= an) env *= abkl;
            x[i0 + k] += yi * (k < an ? k / an : env) * amp;
        }
    }
    // MINNAERT-Blase: f0 = 3,26/r (r in m), Daempfung β = 0,043·f + 0,0014·f^1,5, aufsteigender
    // Zirp f(t) = f0·(1 + σ·β·t) (van den Doel) — der Klang des Wassers ist der Klang seiner Blasen.
    // Rekursiv: ein Zeiger dreht um einen Winkel, der selbst linear waechst (zwei komplexe Produkte
    // je Sample, kein sin/exp in der Schleife).
    function blase(x, sr, t0, rMm, amp, sigma) {
        var f0 = 3.26 / (rMm / 1000), beta = 0.043 * f0 + 0.0014 * Math.pow(f0, 1.5);
        var n = Math.min(Math.floor((4.6 / beta) * sr), Math.floor(sr * 0.4)), i0 = Math.floor(t0 * sr);
        var dph0 = (2 * Math.PI * f0) / sr, d = (dph0 * sigma * beta) / sr;
        var pc = 1, ps = 0, rc = Math.cos(dph0), rs = Math.sin(dph0), dc = Math.cos(d), ds = Math.sin(d);
        var a = amp, abkl = Math.exp(-beta / sr);
        for (var k = 0; k < n && i0 + k < x.length; k++) {
            var nc = pc * rc - ps * rs;
            ps = pc * rs + ps * rc; pc = nc;
            var nr = rc * dc - rs * ds;
            rs = rc * ds + rs * dc; rc = nr;
            x[i0 + k] += a * ps * (k < 8 ? k / 8 : 1);
            a *= abkl;
        }
    }
    // Ein Vogel-Ton: Sinus mit exponentiellem Gleiten f0→f1, sin²-Huelle, 2. Harmonische −18 dB.
    function ton(x, sr, t0, dauer, f0, f1, amp, vib, vibHz) {
        var i0 = Math.floor(t0 * sr), n = Math.floor(dauer * sr), ph = 0, ph2 = 0;
        var lr = Math.log(f1 / f0);
        for (var k = 0; k < n && i0 + k < x.length; k++) {
            var u = k / n, f = f0 * Math.exp(lr * u) * (1 + vib * Math.sin(2 * Math.PI * vibHz * (k / sr)));
            if (f > sr * 0.45) f = sr * 0.45;
            ph += (2 * Math.PI * f) / sr; ph2 += (4 * Math.PI * f) / sr;
            var env = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.25)), 2) * (u > 0.8 ? 1 - (u - 0.8) / 0.2 : 1);
            x[i0 + k] += amp * env * (Math.sin(ph) + (f * 2 < sr * 0.45 ? 0.125 * Math.sin(ph2) : 0));
        }
    }
    // Nahtlose Schleife: die ersten L Samples kreuzen gleich-leistig mit dem Ueberhang n…n+L.
    function nahtlos(x, n) {
        var L = x.length - n, y = new Float32Array(n);
        for (var i = 0; i < n; i++) y[i] = x[i];
        for (var k = 0; k < L; k++) {
            var a = (Math.PI / 2) * (k / L);
            y[k] = x[k] * Math.sin(a) + x[n + k] * Math.cos(a);
        }
        return y;
    }
    function eiche(x, rmsDb) {
        var r = rms(x) || 1, k = Math.pow(10, rmsDb / 20) / r;
        for (var i = 0; i < x.length; i++) x[i] *= k;
        return x;
    }
    function poisson(rnd, rate) {
        return -Math.log(1 - rnd() * 0.999999) / rate;
    }

    // ── Die Textur-Gesetze (je Name: sr, Laenge, Saat aus UMWELT.stimmen) ──
    var TEXTUR_GESETZ = {
        wind: function (n, sr, rnd) {
            var x = mischeIn(farbe(n, "rosa", rnd), farbe(n, "braun", rnd), 0.45);
            var e = huelle(n, sr, 1.1, 0.4, rnd);
            for (var i = 0; i < n; i++) x[i] *= e[i];
            return x;
        },
        laub: function (n, sr, rnd) {
            var x = bq(farbe(n, "weiss", rnd), sr, "highpass", 2500, 0.7);
            for (var i = 0; i < n; i++) x[i] *= 0.12;
            var t = 0, dauer = n / sr;
            while ((t += poisson(rnd, 420)) < dauer) {
                korn(x, sr, t, 0.004 + rnd() * 0.016, 2000 + rnd() * 5000, 1.2, -Math.log(1 - rnd() * 0.98) * 0.5, rnd);
            }
            var e = huelle(n, sr, 6, 0.55, rnd);
            for (i = 0; i < n; i++) x[i] *= e[i];
            return bq(x, sr, "lowpass", 9500, 0.707);
        },
        ufer: function (n, sr, rnd) {
            var bett = bq(farbe(n, "braun", rnd), sr, "lowpass", 250, 0.707);
            var see = bq(farbe(n, "braun", rnd), sr, "lowpass", 500, 0.707);
            var plat = bq(farbe(n, "weiss", rnd), sr, "bandpass", 600, 0.8);
            var x = new Float32Array(n), dauer = n / sr, t = rnd() * 1.2;
            var env = new Float32Array(n);
            while (t < dauer) {
                var amp = 0.6 + 0.4 * rnd(), an = 0.35, i0 = Math.floor(t * sr);
                for (var k = 0; i0 + k < n && k < sr * 3; k++) {
                    var u = k / sr, w = u < an ? Math.sin((Math.PI / 2) * (u / an)) : Math.exp(-(u - an) / 0.6);
                    env[i0 + k] = Math.max(env[i0 + k], amp * w);
                }
                var nb = 6 + Math.floor(rnd() * 10);
                for (var b = 0; b < nb; b++) blase(x, sr, t + an + rnd() * 1.2, 4 + rnd() * 8, 0.05 * amp * rnd(), 0.1);
                t += 2.4 * (0.7 + 0.6 * rnd());
            }
            for (var i = 0; i < n; i++) x[i] += bett[i] * 0.15 + see[i] * env[i] + plat[i] * env[i] * env[i] * 0.6;
            return x;
        },
        fluss: function (n, sr, rnd) {
            var x = bq(farbe(n, "weiss", rnd), sr, "bandpass", 1600, 0.6);
            for (var i = 0; i < n; i++) x[i] *= 0.35;
            mischeIn(x, bq(farbe(n, "braun", rnd), sr, "lowpass", 300, 0.707), 0.5);
            var t = 0, dauer = n / sr;
            while ((t += poisson(rnd, 60)) < dauer) blase(x, sr, t, 2.5 + rnd() * 8, 0.12 + 0.2 * rnd(), 0.1);
            return x;
        },
        fall: function (n, sr, rnd) {
            var x = bq(mischeIn(farbe(n, "braun", rnd), farbe(n, "rosa", rnd), 0.8), sr, "lowpass", 1200, 0.707);
            var t = 0, dauer = n / sr;
            while ((t += poisson(rnd, 140)) < dauer) blase(x, sr, t, 3 + rnd() * 11, 0.08 + 0.1 * rnd(), 0.1);
            var e = huelle(n, sr, 2.5, 0.25, rnd);
            for (var i = 0; i < n; i++) x[i] *= e[i];
            return x;
        },
        regen: function (n, sr, rnd) {
            var x = bq(farbe(n, "rosa", rnd), sr, "highpass", 800, 0.707);
            for (var i = 0; i < n; i++) x[i] *= 0.3;
            var t = 0, dauer = n / sr;
            while ((t += poisson(rnd, 900)) < dauer) {
                korn(x, sr, t, 0.0015 + rnd() * 0.002, 1500 + rnd() * 5500, 1.4, 0.4 + rnd() * 0.8, rnd);
                if (rnd() < 0.15) blase(x, sr, t, 1 + rnd() * 2, 0.08 * rnd(), 0.1);
            }
            return x;
        },
        glut: function (n, sr, rnd) {
            var x = bq(farbe(n, "weiss", rnd), sr, "bandpass", 3000, 0.7);
            for (var i = 0; i < n; i++) x[i] *= 0.08;
            var roar = bq(farbe(n, "braun", rnd), sr, "lowpass", 160, 0.707), e = huelle(n, sr, 0.5, 0.5, rnd);
            for (i = 0; i < n; i++) x[i] += roar[i] * e[i] * 0.35;
            var t = 0, dauer = n / sr;
            while ((t += poisson(rnd, 8)) < dauer) {
                var amp = Math.min(1, 0.2 * Math.pow(1 - rnd() * 0.999, -1 / 1.8)), m = rnd() < 0.18 ? 2 + Math.floor(rnd() * 3) : 1;
                for (var k = 0; k < m; k++) {
                    korn(x, sr, t + k * (0.006 + rnd() * 0.012), 0.0005 + rnd() * 0.0025, 1500 + rnd() * 3500, 0.8, amp * (k ? 0.6 : 1) * 3, rnd);
                }
            }
            return x;
        },
        vogelA: function (n, sr, rnd) { return vogelSchleife(n, sr, rnd); },
        vogelB: function (n, sr, rnd) { return vogelSchleife(n, sr, rnd); },
        grille: function (n, sr, rnd) {
            var x = new Float32Array(n), dauer = n / sr, G = UMWELT.stimmen.grille;
            var periode = 60 / G.nRef;
            for (var c = 0; c < 10; c++) {
                var fc = 4200 + rnd() * 800, p = periode * (0.95 + 0.1 * rnd()), amp = 0.25 + 0.75 * rnd();
                var pulse = 3 + (rnd() < 0.5 ? 1 : 0), t = rnd() * p;
                while (t < dauer) {
                    for (var k = 0; k < pulse; k++) ton(x, sr, t + k * 0.036, 0.014, fc, fc * 0.985, amp, 0, 0);
                    t += p;
                }
            }
            return x;
        }
    };
    // Vogel-Phrasen (vier Gesangs-Muster): Pfeifer (Amsel), Triller (Zaunkoenig), Zweiton (Meise),
    // Fall-Reihe (Fink); je Phrase eine Entfernung (Pegel + Luft-Tiefpass).
    function vogelSchleife(n, sr, rnd) {
        var x = new Float32Array(n), dauer = n / sr, t = rnd() * 2;
        while (t < dauer) {
            var p = new Float32Array(Math.floor(sr * 3)), muster = Math.floor(rnd() * 4), u = 0, k, f;
            if (muster === 0) {
                var nt = 3 + Math.floor(rnd() * 4);
                for (k = 0; k < nt; k++) {
                    f = 1800 + rnd() * 1400;
                    var d = 0.12 + rnd() * 0.14;
                    ton(p, sr, u, d, f, f * (0.8 + rnd() * 0.45), 0.8, 0.02, 7);
                    u += d + 0.04 + rnd() * 0.05;
                }
            } else if (muster === 1) {
                var nz = 10 + Math.floor(rnd() * 9), fz = 4000 + rnd() * 2000;
                for (k = 0; k < nz; k++) {
                    var dz = 0.025 + rnd() * 0.02;
                    ton(p, sr, u, dz, fz * (k % 2 ? 0.9 : 1.08), fz * (k % 2 ? 1.05 : 0.88), 0.6, 0, 0);
                    u += dz + 0.01 + rnd() * 0.01;
                }
            } else if (muster === 2) {
                var paare = 2 + Math.floor(rnd() * 2), fh = 4700 + rnd() * 600, fl = 3400 + rnd() * 400;
                for (k = 0; k < paare; k++) {
                    ton(p, sr, u, 0.09, fh, fh * 0.97, 0.7, 0, 0);
                    ton(p, sr, u + 0.13, 0.13, fl, fl * 0.98, 0.7, 0, 0);
                    u += 0.32;
                }
            } else {
                var nf = 8 + Math.floor(rnd() * 5);
                for (k = 0; k < nf; k++) {
                    f = 6000 - (k / nf) * 3000;
                    var df = 0.07 - (k / nf) * 0.035;
                    ton(p, sr, u, df, f, f * 0.92, 0.65, 0, 0);
                    u += df + 0.02;
                }
                ton(p, sr, u + 0.03, 0.22, 3200, 4600, 0.7, 0, 0);
            }
            bq(p, sr, "lowpass", 3500 + rnd() * 6000, 0.707);
            var amp = 0.25 + 0.75 * rnd(), i0 = Math.floor(t * sr);
            for (k = 0; k < p.length && i0 + k < n; k++) x[i0 + k] += p[k] * amp;
            t += u + poisson(rnd, 1 / 2.6);
        }
        return x;
    }

    // DER SYNTHESE-ZAEHLER dieses Threads (Samples aus Textur- und Ruf-Gesetzen): die Linse gate:klang-zensus
    // liest ihn im Haupt-Thread des Spiels — dort rechnet die Klang-Werkstatt (ein Worker), nie der Spiel-Takt.
    var SYNTHESE = { samples: 0, texturen: 0, rufe: 0 };
    function umweltSynthese() {
        return { samples: SYNTHESE.samples, texturen: SYNTHESE.texturen, rufe: SYNTHESE.rufe };
    }

    // Die Textur je Name, frisch gerechnet: {sr, daten} — nahtlos, auf texturRmsDb geeicht (rein, ohne Gedaechtnis:
    // die Puffer gehoeren dem Empfaenger, ein Worker uebertraegt sie zero-copy).
    function umweltTextur(name) {
        var gesetz = TEXTUR_GESETZ[name];
        if (!gesetz) return null;
        var st = null, idx = 0;
        for (var s in UMWELT.stimmen) {
            var j = UMWELT.stimmen[s].textur.indexOf(name);
            if (j >= 0) { st = UMWELT.stimmen[s]; idx = j; break; }
        }
        var sek = Array.isArray(st.sek) ? st.sek[idx] : st.sek;
        var saat = Array.isArray(st.saat) ? st.saat[idx] : st.saat;
        var n = Math.floor(sek * st.sr), L = Math.floor(0.25 * st.sr);
        var roh = gesetz(n + L, st.sr, umweltRng(saat));
        SYNTHESE.samples += n + L;
        SYNTHESE.texturen++;
        return { sr: st.sr, daten: eiche(nahtlos(roh, n), UMWELT.texturRmsDb) };
    }

    // DIE EICHUNG je Stimme (dB, ≤ 0): was ihr Filter bei kalibHz von ihren Texturen uebrig laesst (Leistungs-
    // Mittel ueber die Texturen). Der Graph gleicht sie aus — der Pegel der Mischung IST der Pegel am Ausgang
    // (die Linse misst ihn offline nach). Rein.
    function kalibAus(S, texturen) {
        var vor = 0, nach = 0;
        for (var i = 0; i < texturen.length; i++) {
            var tex = texturen[i];
            var x = bq(Float32Array.from(tex.daten), tex.sr, S.filter, S.kalibHz, S.q || 0.707);
            var a = rms(tex.daten), b = rms(x);
            vor += a * a;
            nach += b * b;
        }
        return vor > 0 && nach > 0 ? 10 * Math.log10(nach / vor) : 0;
    }

    // DAS STIMMEN-PAKET: die Texturen einer Stimme + ihre Eichung — die Einheit, die die Klang-Werkstatt rechnet und
    // der Graph aufnimmt (umweltGraph … aufnehmen). Rein; die Puffer sind frisch je Paket.
    function umweltPaket(name) {
        var S = UMWELT.stimmen[name];
        if (!S) return null;
        var tex = [];
        for (var i = 0; i < S.textur.length; i++) {
            var t = umweltTextur(S.textur[i]);
            tex.push({ name: S.textur[i], sr: t.sr, daten: t.daten });
        }
        return { name: name, texturen: tex, kalibDb: kalibAus(S, tex) };
    }

    // ── DIE MISCHUNG: Lage am Ohr → je Stimme {db, gain, hz, q, pan, rate} ──
    // lage = { windFeld, boe, deckung, regen, sonne, saisonPhase, lebendig,
    //          ufer:{d, anteil, pan}, fluss:{d, tempo, pan}, fall:{d, hoehe, pan}, glut:{d, flaeche (m², Brenn-Flaeche), pan} }
    function umweltMischung(lage) {
        var U = UMWELT, W = U.stimmen, L = lage || {};
        var zahl = function (v, d) { return typeof v === "number" && isFinite(v) ? v : d; };
        var c01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
        var db = function (v) { return 20 * Math.log10(Math.max(v, 1e-9)); };
        var glatt = function (a, b, v) { var t = c01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
        var windFeld = Math.max(0, zahl(L.windFeld, 0)), boe = Math.max(0, zahl(L.boe, 0.7));
        var deck = c01(zahl(L.deckung, 0)), regen = c01(zahl(L.regen, 0)), sonne = Math.max(-1, Math.min(1, zahl(L.sonne, 1)));
        var leb = c01(zahl(L.lebendig, 0.5)), phase = zahl(L.saisonPhase, 0.375);
        var v = W.wind.vMin + (W.wind.vMax - W.wind.vMin) * windFeld, vEff = Math.max(0.05, v * boe);
        var out = {};
        var setze = function (name, pegel, hz, q, pan, rate) {
            var p = isFinite(pegel) ? pegel : -Infinity;
            out[name] = { db: p, gain: p === -Infinity ? 0 : Math.pow(10, (p - U.texturRmsDb) / 20), hz: hz, q: q, pan: pan || 0, rate: rate || 1 };
        };
        // Abstands-Gesetz mit Hoerweite (weicher Rand ab 70 %): linie −10·lg, punkt −20·lg.
        var abstand = function (S, d, linie) {
            if (!(d < S.hoerweiteM)) return -Infinity;
            var dd = Math.max(d, S.dMin);
            return (linie ? -10 : -20) * Math.log10(dd / S.dRef) - 12 * glatt(0.7 * S.hoerweiteM, S.hoerweiteM, d);
        };
        var hell = function (S, d) { return S.hzFern + (S.hzNah - S.hzFern) * Math.exp(-Math.max(0, d) / S.hzHalbM); };
        // Wind ueber offenem Land
        var Sw = W.wind, offen = 1 - Sw.schutz * deck;
        setze("wind", Sw.refDb + 20 * Sw.exponent * Math.log10(vEff / Sw.vRef) + db(offen), Sw.hzBasis + Sw.hzProMs * vEff, Sw.q);
        // Wind im Laub
        var Sl = W.laub;
        setze("laub", deck > 0 ? Sl.refDb + 20 * Sl.exponent * Math.log10(vEff / Sw.vRef) + db(deck) : -Infinity, Sl.hzBasis + Sl.hzProMs * vEff, Sl.q);
        // Ufer (Linie): Anteil des Hoer-Rings, Wellen aus dem Wind
        var Su = W.ufer, u = L.ufer || {};
        var du = zahl(u.d, Infinity), anteil = c01(zahl(u.anteil, 0));
        setze("ufer", anteil > 0 ? Su.refDb + abstand(Su, du, true) + 10 * Math.log10(anteil / Su.anteilRef) + Su.wellenDb * Math.min(1, windFeld) : -Infinity,
              hell(Su, du), 0.707, zahl(u.pan, 0));
        // Fluss (Linie): Pegel ∝ Stroemung
        var Sf = W.fluss, fl = L.fluss || {}, df = zahl(fl.d, Infinity), tempo = Math.max(0, zahl(fl.tempo, 0));
        setze("fluss", tempo > 0 ? Sf.refDb + abstand(Sf, df, true) + db(tempo / Sf.tempoRef) : -Infinity, hell(Sf, df), 0.707, zahl(fl.pan, 0));
        // Wasserfall (Punkt): Pegel ∝ Fallhoehe
        var Sa = W.fall, fa = L.fall || {}, da = zahl(fa.d, Infinity), hoehe = Math.max(0, zahl(fa.hoehe, 0));
        setze("fall", hoehe > 0 ? Sa.refDb + abstand(Sa, da, false) + 10 * Math.log10(hoehe / Sa.hRef) : -Infinity, hell(Sa, da), 0.707, zahl(fa.pan, 0));
        // Regen
        var Sr = W.regen;
        setze("regen", regen > 0 ? Sr.refDb + db(regen) + Sr.deckungDb * deck : -Infinity, Sr.hzBasis + Sr.hzDeckung * deck, 0.707);
        // Glut (Punkt)
        var Sg = W.glut, gl = L.glut || {}, dg = zahl(gl.d, Infinity);
        var staerke = c01(Math.sqrt(Math.max(0, zahl(gl.flaeche, 0)) / ((Math.PI / 4) * Sg.bettRefM * Sg.bettRefM)));
        setze("glut", staerke > 0 ? Sg.refDb + abstand(Sg, dg, false) + db(staerke) : -Infinity, hell(Sg, dg), 0.707, zahl(gl.pan, 0));
        // Voegel: Morgenchor × √Leben × Lebensraum × Regen-Ruhe × Wind-Ruhe
        var Sv = W.vogel, chor = 0, C = Sv.chor;
        if (sonne <= C[0][0]) chor = C[0][1];
        else if (sonne >= C[C.length - 1][0]) chor = C[C.length - 1][1];
        else for (var i = 1; i < C.length; i++) if (sonne <= C[i][0]) { chor = C[i - 1][1] + ((C[i][1] - C[i - 1][1]) * (sonne - C[i - 1][0])) / (C[i][0] - C[i - 1][0]); break; }
        var aktiv = chor * Math.sqrt(leb) * (Sv.habitatBasis + (1 - Sv.habitatBasis) * deck) * (1 - regen) * (1 - regen) * (1 - Sv.windStill * Math.min(1, windFeld));
        setze("vogel", aktiv > 0 ? Sv.refDb + db(aktiv) : -Infinity, Sv.hz, 0.707);
        // Grillen: nachts × Waerme × offenes Gras; DOLBEAR-Takt
        var Sc = W.grille, waerme = 0.5 + 0.5 * Math.cos(2 * Math.PI * (phase - 0.375));
        var T = Sc.tMin + (Sc.tMax - Sc.tMin) * waerme;
        var nacht = glatt(Sc.nachtAb, Sc.nachtVoll, sonne);
        var aktivG = nacht * glatt(Sc.tStumm, Sc.tVoll, T) * (1 - regen) * (0.3 + 0.7 * (1 - deck));
        var zirp = Math.max(20, 7 * (T - 10) + 40);
        setze("grille", aktivG > 0 ? Sc.refDb + db(aktivG) : -Infinity, Sc.hz, 0.707, 0, zirp / Sc.nRef);
        return out;
    }

    // ── DIE SCHALTUNG: der EINE Graph-Bauer (Lab · Welt · Linse) ──
    // umweltGraph(ctx, ausgang, liefern?) → { anwenden(mix, t), aufnehmen(paket), zensus(), stopAlle(), knoten }.
    // Je hoerbarer Stimme: Quelle(n) (Schleife, versetzt) → Panner → Filter → Gain → ausgang; schweigende Stimmen
    // tragen KEINE Knoten. `knoten` (WeakSet) traegt jeden Quell-Knoten, den das Gesetz baute.
    // DIE LIEFERUNG: eine hoerbare Stimme ohne Puffer wird bestellt — `liefern(name)` rechnet ihr Paket (umweltPaket)
    // und reicht es an aufnehmen(); erst dann klingt sie. Ohne `liefern` rechnet der Graph selbst, sofort (Lab,
    // Offline-Render); der Wirt reicht seine Klang-Werkstatt (ein Worker), das Paket kommt einen Takt spaeter.
    function umweltGraph(ctx, ausgang, liefern) {
        var U = UMWELT, W = U.stimmen;
        var puffer = {}, kalib = {}, bestellt = {}, stimmen = {}, knoten = new WeakSet();
        var versatz = umweltRng(0x51ed);
        var letzterMix = {};
        var bestelle =
            typeof liefern === "function"
                ? liefern
                : function (name) {
                      aufnehmen(umweltPaket(name));
                  };
        // Ein Paket aufnehmen: je Textur EIN Puffer dieses Kontexts, dazu die Eichung der Stimme.
        function aufnehmen(p) {
            if (!p || !W[p.name] || !Array.isArray(p.texturen)) return false;
            for (var i = 0; i < p.texturen.length; i++) {
                var t = p.texturen[i];
                var b = ctx.createBuffer(1, t.daten.length, t.sr);
                b.getChannelData(0).set(t.daten);
                puffer[t.name] = b;
            }
            kalib[p.name] = p.kalibDb;
            return true;
        }
        // Bereit = jede Textur der Stimme liegt als Puffer dieses Kontexts vor, die Eichung ist bekannt.
        function bereit(name) {
            if (!(name in kalib)) return false;
            var T = W[name].textur;
            for (var i = 0; i < T.length; i++) if (!puffer[T[i]]) return false;
            return true;
        }
        function starte(name, m, t) {
            var S = W[name], st = { name: name, an: true, quellen: [], panner: [] };
            // Ausgleich: die Filter-Eichung zurueck und die Leistung auf die Quellen verteilt (n unkorrelierte
            // Schleifen tragen zusammen den Pegel der Mischung).
            st.ausgleich = Math.pow(10, -kalib[name] / 20) / Math.sqrt(S.quellen);
            st.filter = ctx.createBiquadFilter();
            st.filter.type = S.filter;
            st.filter.frequency.value = m.hz;
            st.filter.Q.value = m.q || 0.707;
            st.gain = ctx.createGain();
            st.gain.gain.value = 0;
            st.filter.connect(st.gain);
            st.gain.connect(ausgang);
            for (var k = 0; k < S.quellen; k++) {
                var b = puffer[S.textur[k % S.textur.length]];
                var src = ctx.createBufferSource();
                src.buffer = b;
                src.loop = true;
                src.playbackRate.value = m.rate || 1;
                var pan = ctx.createStereoPanner();
                pan.pan.value = S.gerichtet ? m.pan : (k % 2 ? 1 : -1) * (S.spreizung || 0);
                src.connect(pan);
                pan.connect(st.filter);
                src.start(t, versatz() * b.duration);
                knoten.add(src);
                st.quellen.push(src);
                st.panner.push(pan);
            }
            st.gain.gain.setTargetAtTime(m.gain * st.ausgleich, t, U.rampeSek);
            return (stimmen[name] = st);
        }
        function stoppe(st, t) {
            st.an = false;
            st.gain.gain.cancelScheduledValues(t);
            st.gain.gain.setTargetAtTime(0, t, U.abklangSek);
            var alle = [st.filter, st.gain].concat(st.panner);
            st.quellen.forEach(function (src, i) {
                src.stop(t + 8 * U.abklangSek);
                if (i === 0) src.onended = function () { alle.forEach(function (nd) { try { nd.disconnect(); } catch (_e) {} }); };
            });
            st.quellen = [];
            delete stimmen[st.name];
        }
        return {
            knoten: knoten,
            aufnehmen: aufnehmen,
            anwenden: function (mix, t) {
                var zeit = typeof t === "number" ? t : ctx.currentTime, wahl = [], name;
                letzterMix = mix || {};
                for (name in W) {
                    var m = letzterMix[name];
                    if (!m) continue;
                    var schwelle = stimmen[name] ? U.hoerschwelleDb - U.hystereseDb : U.hoerschwelleDb;
                    if (m.db >= schwelle) wahl.push(name);
                }
                wahl.sort(function (a, b) { return letzterMix[b].db - letzterMix[a].db; });
                wahl = wahl.slice(0, U.stimmenMax);
                for (name in stimmen) if (wahl.indexOf(name) < 0) stoppe(stimmen[name], zeit);
                var neu = 0;
                for (var i = 0; i < wahl.length; i++) {
                    name = wahl[i];
                    var mm = letzterMix[name], st = stimmen[name];
                    if (!st) {
                        if (!bereit(name) && !bestellt[name] && neu === 0) {
                            neu++; // hoechstens EINE Bestellung je Takt
                            bestellt[name] = true;
                            bestelle(name);
                        }
                        if (bereit(name)) starte(name, mm, zeit);
                        continue;
                    }
                    st.gain.gain.setTargetAtTime(mm.gain * st.ausgleich, zeit, U.rampeSek);
                    st.filter.frequency.setTargetAtTime(mm.hz, zeit, U.rampeSek);
                    if (W[name].gerichtet) st.panner[0].pan.setTargetAtTime(mm.pan, zeit, U.rampeSek);
                    for (var q = 0; q < st.quellen.length; q++) st.quellen[q].playbackRate.setTargetAtTime(mm.rate || 1, zeit, U.rampeSek);
                }
            },
            zensus: function () {
                var z = [];
                for (var name in W) {
                    var m = letzterMix[name], st = stimmen[name];
                    z.push({
                        name: name,
                        gesetz: "klang:UMWELT.stimmen." + name,
                        an: !!st,
                        bereit: bereit(name),
                        quellen: st ? st.quellen.length : 0,
                        db: m ? m.db : -Infinity,
                        hz: m ? m.hz : null,
                        pan: m ? m.pan : 0,
                        rate: m ? m.rate : 1,
                    });
                }
                return z;
            },
            stopAlle: function () {
                var zeit = ctx.currentTime;
                for (var name in stimmen) stoppe(stimmen[name], zeit);
            },
        };
    }

    // ── DIE SPITZEN-WAND hinter dem Welt-Master (Wirt UND Lab), Zahlen aus UMWELT.spitze ──
    // Die Kennlinie (rein): f(x) = x bis T, darueber T + (C − T)·tanh((|x| − T)/(C − T)) — stetig mit stetiger
    // Steigung bei T, |f| < C fuer jedes x. Abgetastet ueber x ∈ [−H, H] (H = Kopfraum).
    function umweltSpitzeKurve() {
        var S = UMWELT.spitze, H = Math.pow(10, S.kopfraumDb / 20);
        var T = Math.pow(10, S.linearBisDb / 20), C = Math.pow(10, S.deckeDb / 20), n = S.punkte, k = new Float32Array(n);
        for (var i = 0; i < n; i++) {
            var x = ((2 * i) / (n - 1) - 1) * H, a = Math.abs(x);
            var y = a <= T ? a : T + (C - T) * Math.tanh((a - T) / (C - T));
            k[i] = x < 0 ? -y : y;
        }
        return k;
    }
    // umweltSpitze(ctx) → { eingang, ausgang }: Vor-Gain 1/H (der WaveShaper liest [−1, 1]) → WaveShaper(Kennlinie).
    function umweltSpitze(ctx) {
        var S = UMWELT.spitze, vor = ctx.createGain(), w = ctx.createWaveShaper();
        vor.gain.value = Math.pow(10, -S.kopfraumDb / 20);
        w.curve = umweltSpitzeKurve();
        w.oversample = S.ueberabtastung;
        vor.connect(w);
        return { eingang: vor, ausgang: w };
    }

    // ── DER TIER-RUF: die Stimme folgt dem Koerper ──
    // ruf = { laengeM, stimmung: freude|ruhe|trauer|furcht, saat } → Float32Array (sr = UMWELT.tier.sr),
    // geeicht auf texturRmsDb. Quelle: Saegezahn-Glottis (Harmonische 1/k bis Nyquist) + Atem-Rauschen,
    // zwei Formanten (Bandpaesse ∝ 1/L) — der Vokaltrakt waechst mit dem Tier.
    function tierRufPuffer(ruf) {
        var T = UMWELT.tier, sr = T.sr, r = ruf || {};
        var L = Math.max(0.15, typeof r.laengeM === "number" && isFinite(r.laengeM) ? r.laengeM : T.lRef);
        var K = T.konturen[r.stimmung] || T.konturen.ruhe, rnd = umweltRng((r.saat >>> 0) || 7);
        var f0 = T.fRef * Math.pow(L / T.lRef, -T.exponent), f1 = T.f1Ref * (T.lRef / L), f2 = T.f2Ref * (T.lRef / L);
        var gesamt = K.teile * K.sek + (K.teile - 1) * K.pause + 0.05, n = Math.floor(gesamt * sr);
        var x = new Float32Array(n), ph = 0;
        for (var teil = 0; teil < K.teile; teil++) {
            var i0 = Math.floor(teil * (K.sek + K.pause) * sr), m = Math.floor(K.sek * sr);
            var jit = 1 + (rnd() - 0.5) * 0.06;
            for (var k = 0; k < m && i0 + k < n; k++) {
                var u = k / m;
                var bogen = u < 0.35 ? K.start + (K.gipfel - K.start) * (u / 0.35) : K.gipfel + (K.ende - K.gipfel) * ((u - 0.35) / 0.65);
                var f = f0 * jit * bogen * (1 + K.vibrato * Math.sin(2 * Math.PI * 5.5 * (k / sr)));
                ph += (2 * Math.PI * f) / sr;
                var s = 0, hmax = Math.min(24, Math.floor((sr * 0.45) / f));
                for (var h = 1; h <= hmax; h++) s += Math.sin(ph * h) / h;
                var env = Math.min(1, u / 0.06) * Math.min(1, (1 - u) / 0.25);
                x[i0 + k] = (s * 0.6 + (rnd() * 2 - 1) * 0.15) * env;
            }
        }
        var a = bq(Float32Array.from(x), sr, "bandpass", f1, 2.2), b = bq(Float32Array.from(x), sr, "bandpass", f2, 3);
        for (var i = 0; i < n; i++) x[i] = a[i] + 0.6 * b[i] + 0.15 * x[i];
        SYNTHESE.samples += n;
        SYNTHESE.rufe++;
        return { sr: sr, daten: eiche(x, UMWELT.texturRmsDb), f0: f0, f1: f1, f2: f2 };
    }
    // Pegel des Rufs am Ohr (Punkt-Quelle, Hoerweite): dB am Welt-Bus.
    function tierRufPegel(d) {
        var T = UMWELT.tier;
        if (!(d < T.hoerweiteM)) return -Infinity;
        return T.refDb - 20 * Math.log10(Math.max(d, T.dMin) / T.dRef);
    }
    // Der Ruf als Einmal-Quelle: rechnen (tierRufPuffer) und spielen (tierRufSpielen); null unter der Hoerschwelle.
    // Der Wirt rechnet in der Klang-Werkstatt und spielt, was sie zurueckreicht — dieselben zwei Schritte.
    function tierRuf(ctx, ausgang, ruf) {
        var r = ruf || {};
        if (!(tierRufPegel(typeof r.d === "number" ? r.d : UMWELT.tier.dRef) >= UMWELT.hoerschwelleDb)) return null;
        return tierRufSpielen(ctx, ausgang, r, tierRufPuffer(r));
    }
    // Den gerechneten Ruf spielen: Puffer → Panner → Gain (Pegel am Ohr) → ausgang; null unter der Hoerschwelle.
    function tierRufSpielen(ctx, ausgang, ruf, tex) {
        var r = ruf || {}, pegel = tierRufPegel(typeof r.d === "number" ? r.d : UMWELT.tier.dRef);
        if (!(pegel >= UMWELT.hoerschwelleDb) || !tex || !tex.daten) return null;
        var t = ctx.currentTime;
        var b = ctx.createBuffer(1, tex.daten.length, tex.sr);
        b.getChannelData(0).set(tex.daten);
        var src = ctx.createBufferSource(), pan = ctx.createStereoPanner(), g = ctx.createGain();
        src.buffer = b;
        pan.pan.value = typeof r.pan === "number" && isFinite(r.pan) ? Math.max(-1, Math.min(1, r.pan)) : 0;
        g.gain.value = Math.pow(10, (pegel - UMWELT.texturRmsDb) / 20);
        src.connect(pan);
        pan.connect(g);
        g.connect(ausgang);
        src.onended = function () { try { pan.disconnect(); g.disconnect(); } catch (_e) {} };
        src.start(t);
        return { quelle: src, pegelDb: pegel, f0: tex.f0, sek: b.duration };
    }

    // ── DER SUBSTANZ-KLANG: Ereignisse der Welt klingen aus den Tags ihrer Substanz — der Treffer (haerte klirrt
    //    hell · dichte wummert · lebendig weich), eine Form singt (Resonanz → Tonhoehe), eine resonierende Form
    //    verklingt beim Abbau (diese drei: die Zahlen wanderten byte-gleich aus dem Stamm). Wasser stroemt zurueck:
    //    ein Chor aus MINNAERT-Blasen (f0 = 3,26/r, Daempfung β = 0,043·f0 + 0,0014·f0^1,5, Zirp f0·(1 + σ·β·t)),
    //    die Blasen wachsen ueber das Ereignis (das Gurgeln faellt wie der alte 700 → 200-Hz-Bandpass) — Oszillatoren
    //    im Audio-Thread, kein Sample im Aufrufer. Der Wirt reicht nur Tags und Ausgang. ──
    // prettier-ignore
    var SUBSTANZ = {
        treffer:  { hzBasis: 160, hzHaerte: 480, hzDichte: -70, hzMin: 60, gain: 0.14, anSek: 0.004, abSek: 0.16, stopSek: 0.18 },
        singen:   { hzBasis: 300, hzSpanne: 400, resonanzSkala: 3, gain: 0.08, anSek: 0.05, abSek: 1.2, stopSek: 1.3 },
        abschied: { hzBasis: 220, hzResonanz: 80, resonanzMax: 3, glissEnde: 0.5, hzGlissMin: 110, gain: 0.08, anSek: 0.04, abSek: 0.8, stopSek: 0.85 },
        wasser:   { blasen: 9, sek: 0.6, rVonMm: 3, rBisMm: 11, streuung: 0.15, sigma: 0.1, gain: 0.06, anSek: 0.003, maxSek: 0.4 }
    };
    // substanzKlang(ctx, ausgang, art, tags) → { quelle, hz } — die Einmal-Quelle des Ereignisses.
    function substanzKlang(ctx, ausgang, art, tags) {
        var S = SUBSTANZ[art], T = tags || {}, t = ctx.currentTime;
        if (!S) return null;
        if (art === "wasser") {
            var rnd = umweltRng(Math.floor(t * 1000) + 1), erste = null, hz0 = 0;
            for (var i = 0; i < S.blasen; i++) {
                var u = i / Math.max(1, S.blasen - 1);
                var rMm = (S.rVonMm + (S.rBisMm - S.rVonMm) * u) * (1 + S.streuung * (2 * rnd() - 1));
                var f0 = 3.26 / (rMm / 1000), beta = 0.043 * f0 + 0.0014 * Math.pow(f0, 1.5);
                var dauer = Math.min(4.6 / beta, S.maxSek), ti = t + S.sek * u * (0.85 + 0.3 * rnd());
                var amp = S.gain * (1 - 0.5 * u) * (0.6 + 0.4 * rnd());
                var o = ctx.createOscillator(), gb = ctx.createGain();
                o.type = "sine";
                o.frequency.setValueAtTime(f0, ti);
                o.frequency.linearRampToValueAtTime(f0 * (1 + S.sigma * beta * dauer), ti + dauer);
                gb.gain.setValueAtTime(0, ti);
                gb.gain.linearRampToValueAtTime(amp, ti + S.anSek);
                gb.gain.exponentialRampToValueAtTime(amp * 0.01, ti + dauer);
                o.connect(gb);
                gb.connect(ausgang);
                o.start(ti);
                o.stop(ti + dauer + 0.02);
                if (!erste) {
                    erste = o;
                    hz0 = f0;
                }
            }
            return { quelle: erste, hz: hz0 };
        }
        var g = ctx.createGain(), src, hz;
        src = ctx.createOscillator();
        if (art === "treffer") {
            var haerte = T["härte"] || 0, dichte = T.dichte || 0, lebendig = T.lebendig || 0;
            src.type = haerte >= Math.max(dichte, lebendig) ? "sawtooth" : lebendig >= dichte ? "sine" : "triangle";
            hz = Math.max(S.hzMin, S.hzBasis + haerte * S.hzHaerte + dichte * S.hzDichte);
            src.frequency.value = hz;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(S.gain, t + S.anSek);
            g.gain.exponentialRampToValueAtTime(0.0001, t + S.abSek);
        } else if (art === "singen") {
            src.type = "sine";
            hz = S.hzBasis + ((T.resoniert || 0) / S.resonanzSkala) * S.hzSpanne;
            src.frequency.value = hz;
            g.gain.value = 0;
            g.gain.linearRampToValueAtTime(S.gain, t + S.anSek);
            g.gain.linearRampToValueAtTime(0, t + S.abSek);
        } else {
            src.type = "sine";
            hz = S.hzBasis + Math.min(S.resonanzMax, T.resoniert || 0) * S.hzResonanz;
            src.frequency.setValueAtTime(hz, t);
            src.frequency.exponentialRampToValueAtTime(Math.max(S.hzGlissMin, hz * S.glissEnde), t + S.abSek);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.linearRampToValueAtTime(S.gain, t + S.anSek);
            g.gain.exponentialRampToValueAtTime(0.0005, t + S.abSek);
        }
        src.connect(g);
        g.connect(ausgang);
        src.start(t);
        src.stop(t + S.stopSek);
        return { quelle: src, hz: hz };
    }

    root.__klangCore = {
        VERSION: VERSION,
        progressionDeg: progressionDeg,
        stack: stack,
        colorExt: colorExt,
        SCHRITT_TIMBRE: SCHRITT_TIMBRE,
        RHYTHMUS_MUSTER: RHYTHMUS_MUSTER,
        RAUM: RAUM,
        UMWELT: UMWELT,
        umweltTextur: umweltTextur,
        umweltPaket: umweltPaket,
        umweltSynthese: umweltSynthese,
        umweltMischung: umweltMischung,
        umweltGraph: umweltGraph,
        umweltSpitze: umweltSpitze,
        tierRufPuffer: tierRufPuffer,
        tierRufPegel: tierRufPegel,
        tierRuf: tierRuf,
        tierRufSpielen: tierRufSpielen,
        SUBSTANZ: SUBSTANZ,
        substanzKlang: substanzKlang,
        STUDIO_VERTRAG: STUDIO_VERTRAG,
        MESHFREI: MESHFREI,
        PRESETS: VERTRAG_PRESETS,
        PARAMS_BY_KIND: { klang: PARAMS },
        // Die Lab-Quellen (die Shell liest DIESE eine Quelle — Aliasse):
        GENRES: PRESETS,
        SCALES: SCALES,
        SCALE_LABELS: SCALE_LABELS,
        scaleFor: scaleFor,
        LAWS: LAWS,
        INSTRUMENTS: INSTRUMENTS,
        SIM_INSTRUMENTS: SIM_INSTRUMENTS,
        DNA: DNA,
    };
})(typeof self !== "undefined" ? self : globalThis);
