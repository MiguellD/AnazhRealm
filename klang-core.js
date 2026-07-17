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

    root.__klangCore = {
        VERSION: VERSION,
        progressionDeg: progressionDeg,
        stack: stack,
        SCHRITT_TIMBRE: SCHRITT_TIMBRE,
        RHYTHMUS_MUSTER: RHYTHMUS_MUSTER,
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
