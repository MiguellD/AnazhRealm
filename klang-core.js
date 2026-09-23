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

    // COLOR_EXT — Lab+Host chord stack width from dna.color (·136).
    // Lab buildTones: ext = 1 + (c>ninth) + (c>thirteenth). Host n = 3+ext (4/5/6).
    // Missing/non-finite color → ext 1 (Host 4-note byte-alt). LoFi color 0.60 → 9th.
    // V18.491.137 Lab V7 finale; Host has no cadence — not Fake-merge.
    var COLOR_EXT = { ninth: 0.35, thirteenth: 0.7, finaleAdd: 0.4, finaleSemi: 14 };
    function colorExt(color) {
        var C = COLOR_EXT;
        var c = isFinite(color) ? color : 0;
        var ext = 1;
        if (c > C.ninth) ext++;
        if (c > C.thirteenth) ext++;
        return ext;
    }
    function colorFinaleAdd(color) {
        var C = COLOR_EXT;
        var c = isFinite(color) ? color : 0;
        return c > C.finaleAdd;
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
        // V18.491.133 — Lab hall create + applyPreset read RAUM.hall fail-soft (numbers byte-alt).
        hall: { impulseSec: 3.4, decay: 2.4, predelaySec: 0.02, returnProSpace: 0.5 },
        // V18.491.134 — Lab echo create + setDelayFromBpm + dlyRet + echoPlan read RAUM.echo fail-soft (numbers byte-alt).
        echo: { beatFrac: 0.75, minSec: 0.06, maxSec: 1.8, feedback: 0.42, hpHz: 260, lpHz: 2800, returnProEcho: 0.85 },
        // V18.491.135 — Lab local twin killed; cold-core stub {def:{lead:.12}}; numbers untouched. Lab applyPreset reads RAUM.DELAY_SENDS fail-soft.
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

    // V18.491.196 — Lab master glue compressor; Host none (GLUE_VIS).
    var GLUE_GESETZ = {
      thresholdDb: -14,
      knee: 10,
      ratio: 2.5,
      attackSec: 0.012,
      releaseSec: 0.24,
    };
    var GLUE_VIS = { lab: "master-glue", host: "none" };

    // V18.491.197 — Lab master limiter; Host none (LIMITER_VIS).
    var LIMITER_GESETZ = {
      thresholdDb: -2.5,
      knee: 0,
      ratio: 20,
      attackSec: 0.001,
      releaseSec: 0.06,
    };
    var LIMITER_VIS = { lab: "master-limiter", host: "none" };

    // V18.491.198 — Lab master EQ 3-band; Host none (EQ_VIS).
    var EQ_GESETZ = {
      low:  { type: "lowshelf",  freqHz: 90,   gainDb: 1.2 },
      mud:  { type: "peaking",   freqHz: 350,  q: 1, gainDb: -1.5 },
      air:  { type: "highshelf", freqHz: 8500, gainDb: 1.5 },
    };
    var EQ_VIS = { lab: "master-eq-3band", host: "none" };

    // V18.491.199 — Lab master softClip WaveShaper; Host none (SOFTCLIP_VIS).
    var SOFTCLIP_GESETZ = { amount: 1.15, oversample: "4x" };
    var SOFTCLIP_VIS = { lab: "waveshaper-1.15", host: "none" };

    // V18.491.201 — Lab sympathetik resonance bus cold-init; Host none (RESONANZ_VIS).
    var RESONANZ_GESETZ = {
      outGain: 0.16,
      delaySec: 1/131,
      lpHz: 3600,
      feedback: 0.72,
      voices: 3,
    };
    var RESONANZ_VIS = { lab: "sympathetik-3", host: "none" };

    // V18.491.202 — Lab LoFi cold-init; Host none (LOFI_VIS).
    var LOFI_GESETZ = {
      wowDelaySec: 0.012,
      wowMaxSec: 0.05,
      wowSlowHz: 0.45,
      wowFastHz: 5.6,
      lpHz: 19500,
      lpQ: 0.4,
      crackleGain: 0.0001,
      crackleBufSec: 3,
      dcHpHz: 24,
    };
    var LOFI_VIS = { lab: "bandlauf-vinyl", host: "none" };

    // V18.491.204 — Lab analyser cold-init; Host none (ANALYSER_VIS).
    var ANALYSER_GESETZ = { fftSize: 1024, smoothing: 0.82 };
    var ANALYSER_VIS = { lab: "fft-1024-smooth-0.82", host: "none" };

    // V18.491.204 — Lab strip defaults cold-init; Host none (STRIP_VIS).
    var STRIP_GESETZ = {
      drums:   { pan: 0.00, levelDb: -1.5, revSend: 0.10, ducked: false, delaySend: 0 },
      bass:    { pan: 0.00, levelDb: -1.0, revSend: 0.03, ducked: true,  delaySend: 0 },
      harmony: { pan:-0.12, levelDb: -4.5, revSend: 0.30, ducked: true,  delaySend: 0 },
      lead:    { pan: 0.10, levelDb: -3.0, revSend: 0.24, ducked: false, delaySend: 0.12 },
      sim:     { pan: 0.00, levelDb: -2.0, revSend: 0.22, ducked: false, delaySend: 0.15 },
    };
    var STRIP_VIS = { lab: "strip-defaults-5", host: "none" };

    // V18.491.205 — Lab sidechain duck defaults; Host none (DUCK_VIS).
    var DUCK_GESETZ = { depth: 0.45, attackSec: 0.012, releaseSec: 0.20 };
    var DUCK_VIS = { lab: "sidechain-duck", host: "none" };

    // V18.491.206 — Lab WAV-recorder cold tap; Host none (REC_VIS).
    var REC_GESETZ = { bufferSize: 4096, inputChannels: 2, outputChannels: 2, sinkGain: 0 };
    var REC_VIS = { lab: "scriptprocessor-4096", host: "none" };

    // V18.491.207 — Lab kick-kit tone table; Host none (KICK_VIS).
    var KICK_GESETZ = {
      Acoustic:   { f0:150, f1:46,  pd:0.05,  dec:0.42, click:0.15, sat:1.25 },
      Electronic: { f0:190, f1:48,  pd:0.03,  dec:0.60, click:0.30, sat:1.6 },
      LoFi:       { f0:105, f1:42,  pd:0.06,  dec:0.28, click:0.05, sat:1.0 },
      Brush:      { f0:120, f1:44,  pd:0.05,  dec:0.30, click:0.03, sat:1.0 },
      Perc:       { f0:235, f1:172, pd:0.018, dec:0.22, click:0.02, sat:1.05 },
    };
    var KICK_VIS = { lab: "kick-kit-5", host: "none" };

    // V18.491.208 — Lab snare-kit tone table; Host none (SNARE_VIS).
    var SNARE_GESETZ = {
      Acoustic:   { tone:195, dec:0.16, hp:1500, body:0.45, atk:0.001 },
      Electronic: { tone:195, dec:0.20, hp:1500, body:0.45, atk:0.001 },
      LoFi:       { tone:160, dec:0.16, hp:900,  body:0.45, atk:0.001 },
      Brush:      { tone:170, dec:0.26, hp:1100, body:0.10, atk:0.02  },
      Perc:       { tone:340, dec:0.09, hp:2600, body:0.70, atk:0.001 }
    };
    var SNARE_VIS = { lab: "snare-kit-5", host: "none" };

    // V18.491.209 — Lab hi-hat kit cold constants; Host none (HIHAT_VIS).
    var HIHAT_GESETZ = {
      baseHz: 104,
      baseHzLoFi: 86,
      bpHz: 10400,
      bpHzElectronic: 9800,
      bpQ: 0.9,
      hpHz: 7000,
      hpHzLoFi: 5200,
      softMulBrush: 0.68,
      closedDec: 0.05,
      openDec: 0.42,
      closedVel: 0.42,
      openVel: 0.5,
      pan: 0.16,
      ratios: [2, 3.03, 4.16, 5.43, 6.79, 8.21],
      chokeTau: 0.008,
      perc: { openNoise: 0.24, closedNoise: 0.09, bpHz: 5600, bpQ: 1.1, openVel: 0.4, closedVel: 0.34, atk: 0.012, openDec: 0.2, closedDec: 0.07, pan: 0.14 }
    };
    var HIHAT_VIS = { lab: "hihat-kit", host: "none" };

    // V18.491.210 — Lab ride() 3-partial + noise cold constants; Host none (RIDE_VIS).
    var RIDE_GESETZ = {
      velMul: 0.32,
      atk: 0.002,
      dec: 1.25,
      pan: -0.18,
      freqs: [521, 787, 1123],
      gains: [0.5, 0.22, 0.13],
      oscStop: 1.4,
      noiseSec: 0.8,
      noiseHpHz: 6000,
      noiseVel: 0.10,
      noiseAtk: 0.002,
      noiseDec: 0.7,
      noiseStop: 0.85,
    };
    var RIDE_VIS = { lab: "ride-3partial", host: "none" };

    // V18.491.211 — Lab crash() cold constants; Host none (CRASH_VIS).
    var CRASH_GESETZ = {
      velMul: 0.4,
      atk: 0.003,
      dec: 1.7,
      pan: -0.1,
      noiseSec: 1.7,
      noiseHpHz: 4200,
      noiseStop: 1.8,
      freqs: [637, 941, 1370],
      oscGain: 0.08,
      oscStop: 1.2,
    };
    var CRASH_VIS = { lab: "crash-3partial", host: "none" };

    // V18.491.212 — Lab clap() cold constants; Host none (CLAP_VIS).
    var CLAP_GESETZ = {
      pan: 0.1,
      delays: [0, 0.011, 0.023],
      noiseSec: 0.28,
      bpHz: 1400,
      bpQ: 1.3,
      velEarly: 0.4,
      velLast: 0.7,
      atk: 0.001,
      decEarly: 0.02,
      decLast: 0.22,
    };
    var CLAP_VIS = { lab: "clap-3burst", host: "none" };

    // V18.491.213 — MIDI bus/channel and GM program maps; Host none (MIDI_VIS).
    var MIDI_GESETZ = {
        busCh: { harmony: 0, lead: 1, bass: 2, sim: 3 },
        gmProgram: {
            GrandPiano: 0, Rhodes: 4, Guitar: 24, DoubleBass: 32,
            Strings: 48, Flute: 73, LeadSynth: 81, SynthPad: 89,
            Sub808: 38, SynthBass: 38, Vibraphone: 11, Marimba: 12,
            Kalimba: 108, Organ: 16, Clavinet: 7, SynthBrass: 62,
            ReeseBass: 39, DistGuitar: 30, PickBass: 34,
        },
    };
    var MIDI_VIS = { lab: "gm-bus-map", host: "none" };

    // V18.491.214 — Lab simulator note-duration map; Host none (SIMDUR_VIS).
    var SIMDUR_GESETZ = {
        GrandPiano: 2.6, Guitar: 2.2, Rhodes: 1.8, Strings: 1.6,
        SynthPad: 2.0, LeadSynth: 0.7, Flute: 1.2, Sub808: 1.0,
        Vibraphone: 3.2, Marimba: 1.3, Kalimba: 1.5, Organ: 1.6,
        Clavinet: 1.0, SynthBrass: 1.2, DistGuitar: 1.6, PickBass: 1.4,
    };
    var SIMDUR_VIS = { lab: "sim-dur-16", host: "none" };

    // V18.491.215 — Lab instrument-role cold defaults; Host none (ROLES_VIS).
    var ROLES_GESETZ = {
        drums: "Acoustic",
        bass: "DoubleBass",
        harmony: "GrandPiano",
        lead: "Guitar",
        sim: "GrandPiano",
    };
    var ROLES_VIS = { lab: "role-defaults-5", host: "none" };

    // V18.491.216 — Lab laws cold defaults; Host none (LAWS_VIS).
    var LAWS_GESETZ = {
        form: "AAB",
        harmony: "Blues",
        rhythm: "Shuffle",
        bass: "Walking",
        melody: "BlueNotes",
    };
    var LAWS_VIS = { lab: "laws-defaults-5", host: "none" };

    // V18.491.217 — Lab modulation cold defaults; Host none (MODS_VIS).
    var MODS_GESETZ = {
        swing: 0.72,
        darkness: 0.5,
        color: 0.3,
        flow: 0.5,
        tension: 0.4,
        space: 0.22,
        volume: 0.85,
    };
    var MODS_VIS = { lab: "mods-defaults-7", host: "none" };

    // V18.491.218 — Lab tuning cold defaults; Host none (TUNING_VIS).
    var TUNING_GESETZ = {
        root: 0,
        baseFreq: 440,
    };
    var TUNING_VIS = { lab: "a440-root0", host: "none" };

    // V18.491.219 — Lab state cold seeds; Host none (STATE_VIS).
    var STATE_GESETZ = {
        bpm: 96,
        root: 48,
        rootBase: 48,
        scaleName: "blues",
        motifIntervals: [0, 1],
        motifRhythm: [0.5, 1],
        motifOp: "Original",
        melDeg: 9,
    };
    var STATE_VIS = { lab: "state-seed-8", host: "none" };

    // V18.491.220 — Lab preset cold default; Host none (PRESET_VIS).
    var PRESET_GESETZ = { defaultName: "Blues" };
    var PRESET_VIS = { lab: "preset-blues", host: "none" };

    // V18.491.221 — Lab GenesisLimiter cold constants; Host none (LOOKAHEAD_VIS).
    var LOOKAHEAD_GESETZ = {
        bufLen: 256,
        ceil: 0.891,
        release: 0.0008,
        processorName: "genesis-limiter",
        outChannels: 2,
    };
    var LOOKAHEAD_VIS = { lab: "lookahead-256", host: "none" };

    // V18.491.222 — Lab genre pump density table; Host none (PUMP_VIS).
    var PUMP_GESETZ = {
        byPreset: { Trap: 0.55, DnB: 0.5, Synthwave: 0.52, Techno: 0.42, LoFi: 0.3, BoomBap: 0.3 },
        straightFallback: 0.42,
        defaultFallback: 0.3,
    };
    var PUMP_VIS = { lab: "genre-pump-6", host: "none" };

    // V18.491.223 — Lab genre-weather table; Host none (SCENES_VIS).
    var SCENES_GESETZ = {
        byPreset: {
            Rock: { skyTop: [14, 70, 30], choppy: 1.7, ember: true },
            Funk: { skyTop: [28, 60, 26], choppy: 1.4 },
            Ambient: { skyTop: [210, 45, 16], choppy: 0.45, aurora: true },
            Cinematic: { skyTop: [225, 35, 14], choppy: 0.6, letterbox: true, godray: true },
            LoFi: { skyTop: [35, 35, 20], choppy: 0.8 },
            BoomBap: { skyTop: [30, 30, 18], choppy: 0.9 },
            Trap: { skyTop: [275, 45, 14], choppy: 1.1 },
            DnB: { skyTop: [195, 55, 18], choppy: 1.6 },
            Techno: { skyTop: [190, 60, 16], choppy: 1.2, pulse: 1.8 },
            Synthwave: { skyTop: [300, 55, 20], choppy: 0.9, aurora: true },
            Dub: { skyTop: [150, 40, 16], choppy: 0.8 },
            Bossa: { skyTop: [25, 55, 22], choppy: 0.7 },
            Latin: { skyTop: [20, 65, 24], choppy: 1.1 },
            Vibes: { skyTop: [250, 25, 12], choppy: 0.7 },
            Reggae: { skyTop: [45, 55, 20], choppy: 0.8 },
        },
        fallbackSkyTop: [215, 40, 15],
        choppyBase: 0.6,
        choppyTensionMul: 0.9,
        choppyMin: 0.5,
        choppyMax: 1.6,
        defaultPulse: 1,
    };
    var SCENES_VIS = { lab: "genre-weather-15", host: "none" };

    // V18.491.224 — Lab Wasser-Physik cold constants; Host none (RIPPLE_VIS).
    var RIPPLE_GESETZ = {
        lamOffset: 26,
        lamScale: 5200,
        lamFMin: 20,
        lamMin: 28,
        lamMax: 150,
        twoPi: 6.2832,
        envTauMul: 1.6,
        radialDecay: 260,
        speed: 150,
        defaultLife: 1.6,
        hopSpring: 5.2,
    };
    var RIPPLE_VIS = { lab: "wasser-physik", host: "none" };

    // V18.491.225 — Lab Klang instrument-shape table; Host none (INSTVIS_VIS).
    var INSTVIS_GESETZ = {
        GrandPiano: { k: "diamond", sus: 0 },
        Rhodes: { k: "square", sus: 0, trem: 4.3 },
        Guitar: { k: "string", sus: 0 },
        DoubleBass: { k: "string", sus: 0, thick: 1.7 },
        Clavinet: { k: "zig", sus: 0 },
        Vibraphone: { k: "fan", sus: 0, trem: 5.0 },
        Marimba: { k: "bar", sus: 0 },
        Kalimba: { k: "drop", sus: 0 },
        Strings: { k: "lens", sus: 1, vib: 5.2 },
        Flute: { k: "breath", sus: 1, vib: 4.6 },
        SynthPad: { k: "cloud", sus: 1 },
        Organ: { k: "bars3", sus: 1, trem: 5.7 },
        LeadSynth: { k: "arrow", sus: 1 },
        SynthBrass: { k: "chev", sus: 1 },
        Sub808: { k: "blob", sus: 1 },
        SynthBass: { k: "blob", sus: 1 },
        ReeseBass: { k: "blob", sus: 1, wob: 0.35 },
        DistGuitar: { k: "bolt", sus: 0 },
        PickBass: { k: "string", sus: 0, thick: 1.5 },
    };
    var INSTVIS_VIS = { lab: "inst-forms-19", host: "none" };

    // V18.491.226 — Lab Klang hook rhythm/contour tables; Host none (HOOK_VIS).
    var HOOK_GESETZ = {
        rhythms: {
            Rock: [[0, 1], [3, .55], [6, .9], [10, .7], [12, .55]],
            Funk: [[0, 1], [3, .6], [7, .9], [10, .55], [14, .7]],
            Swing: [[0, 1], [4, .65], [6, .5], [10, .85], [13, .55]],
            Shuffle: [[0, 1], [4, .65], [6, .5], [10, .85]],
            Bossa: [[0, 1], [3, .7], [8, .8], [11, .55], [14, .65]],
            Breakbeat: [[0, 1], [6, .6], [8, .85], [11, .55]],
            HalfTime: [[0, 1], [8, .8], [11, .5]],
            Straight: [[0, 1], [6, .65], [8, .85], [14, .55]],
            None: [[0, 1], [8, .7]],
        },
        contours: [[0, 2, 4, 2, 0], [0, 0, 3, 2, 0], [4, 2, 0, 2, 4],
            [0, -1, 0, 2, 4], [7, 5, 4, 2, 0], [0, 2, 0, -1, 2]],
    };
    var HOOK_VIS = { lab: "hook-rhythms-9", host: "none" };

    // V18.491.227 — Lab Klang articulation lengths/profiles; Host none (ART_VIS).
    var ART_GESETZ = {
        len: { stc: 0.38, det: 0.62, ten: 0.95, ring: 1.55 },
        profiles: {
            Funk: ["stc", "stc", "det", "stc"],
            Swing: ["ten", "stc", "ten", "ring"],
            Shuffle: ["ten", "stc", "ten", "ring"],
            Rock: ["det", "det", "ring", "det"],
            OneDrop: ["det", "stc", "ten", "stc"],
            Bossa: ["ten", "ten", "det", "ring"],
            Breakbeat: ["det", "stc", "det", "stc"],
            HalfTime: ["ten", "ring", "ten", "ring"],
            Straight: ["det", "det", "ten", "det"],
            None: ["ring", "ten", "ring", "ten"],
        },
    };
    var ART_VIS = { lab: "artic-10", host: "none" };

    // V18.491.231 Lab Klang pocket ms offsets; Host none (POCKET_VIS).
    // Do NOT bake LoFi +8/+8 into GESETZ — that stays Lab pocket() local mutation.
    var POCKET_GESETZ = {
        Swing:     { s: 14, h: -2, m: 12, b: 4 },
        Shuffle:   { s: 12, h:  0, m: 10, b: 4 },
        Straight:  { s:  2, h: -4, m:  0, b: 0 },
        Breakbeat: { s:  4, h: -6, m:  2, b: 0 },
        HalfTime:  { s: 16, h:  2, m: 12, b: 6 },
        Bossa:     { s:  6, h: -3, m:  6, b: 2 },
        Funk:      { s: -2, h: -8, m: -2, b: -2 },
        Rock:      { s:  2, h: -5, m:  0, b: 0 },
        None:      { s:  0, h:  0, m:  0, b: 0 }
    };
    var POCKET_VIS = { lab: "pocket-9", host: "none" };

    // V18.491.232 Lab Klang 3D projection defaults; Host none (CAM_VIS).
    // camFor curve deltas (55/155/…) stay Lab-local — not baked into GESETZ.
    var CAM_GESETZ = { F: 470, camH: 250, zMin: -300 };
    var CAM_VIS = { lab: "proj-3", host: "none" };

    // V18.491.233 Lab Klang riddim cell templates; Host none (RIDDIM_VIS).
    // makeRiddim varDrop rng()<0.5 stays Lab-local — not baked into GESETZ.
    var RIDDIM_GESETZ = [
        [
            { s: 2, t: "r", l: 3 }, { s: 6, t: "5", l: 2 }, { s: 8, t: "r", l: 5 }, { s: 14, t: "3", l: 2 }
        ],
        [
            { s: 2, t: "r", l: 2 }, { s: 5, t: "3", l: 3 }, { s: 8, t: "r", l: 4 }, { s: 12, t: "5", l: 2 }, { s: 14, t: "o", l: 2 }
        ],
        [
            { s: 3, t: "r", l: 3 }, { s: 8, t: "r", l: 4 }, { s: 11, t: "b7", l: 2 }, { s: 14, t: "5", l: 2 }
        ],
        [
            { s: 2, t: "r", l: 4 }, { s: 8, t: "5", l: 3 }, { s: 12, t: "r", l: 4 }
        ]
    ];
    var RIDDIM_VIS = { lab: "templates-4", host: "none" };

    // V18.491.234 Lab Klang form block maps; Host none (FORM_VIS).
    // SECTION_LABELS / VOICE_COL / FIFTHS stay Lab UI/viz-local this pulse.
    var FORM_GESETZ = {
        AABA: [["A", 8], ["A", 8], ["B", 8], ["A", 8]],
        AAB: [["A", 4], ["A", 4], ["B", 4]],
        Sonata: [["Expo", 16], ["Dev", 16], ["Repr", 16]]
    };
    var FORM_VIS = { lab: "forms-3", host: "none" };

    // V18.491.240 Lab Klang chromatic note names; Host none (NOTE_VIS).
    var NOTE_GESETZ = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "H"];
    var NOTE_VIS = { lab: "chromatic-12", host: "none" };

    // V18.491.241 Lab Klang piano keymap; Host none (KEYMAP_VIS).
    var KEYMAP_GESETZ = { a: 60, w: 61, s: 62, e: 63, d: 64, f: 65, t: 66, g: 67, z: 68, h: 69, u: 70, j: 71, k: 72 };
    var KEYMAP_VIS = { lab: "keys-13", host: "none" };

    // V18.491.242 Lab Klang circle-of-fifths PC order; Host none (FIFTHS_VIS).
    var FIFTHS_GESETZ = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
    var FIFTHS_VIS = { lab: "circle-12", host: "none" };

    // V18.491.246 Lab Klang voice viz colors; Host none (VOICE_VIS).
    // SECTION_LABELS stay Lab UI-local this pulse.
    var VOICE_GESETZ = { bass: "#6ea0ff", harmony: "#b48cff", lead: "#ffb45a", sim: "#7ee0a3" };
    var VOICE_VIS = { lab: "bus-4", host: "none" };

    // V18.491.248 Lab Klang sample-buffer cache cap; Host none (BUF_VIS).
    var BUF_GESETZ = { max: 90 };
    var BUF_VIS = { lab: "cache-90", host: "none" };

    // V18.491.249 Lab Klang form-section labels; Host none (SECTION_VIS).
    var SECTION_GESETZ = {
        V: "Vamp",
        Free: "∞",
        Return: "Klimax",
        Expo: "Exposition",
        Dev: "Durchführung",
        Repr: "Reprise",
        Drop: "Drop"
    };
    var SECTION_VIS = { lab: "labels-7", host: "none" };

    // V18.491.270 Lab Klang mixer strip labels; Host none (STRIPLBL_VIS).
    // ≠ STRIP_GESETZ (strip-defaults-5 numbers) — do not Fake-merge.
    var STRIPLBL_GESETZ = { drums: "Drums", bass: "Bass", harmony: "Akkorde", lead: "Melodie", sim: "Simulator" };
    var STRIPLBL_VIS = { lab: "strip-labels-5", host: "none" };





    // TILT_VIS — intentional dual mix (Feel-Entscheid .129). Do NOT merge.
    // lab:"mixer-ui" = mixTilt + applyMixState strip faders (klang.js).
    // host:"role-db" = tilt.<rolle> dB → linear gain on lofi osc (_lofiDrumTimbre / _lofiInstStimme).
    // Like NEBEL_VIS .128 / RAUCH_VIS .125 / STEER_VIS .124: naming the Feel, not Fake-zu.
    // Full Lab mixer / convolution into Host = Redesign later. tilt numbers stay on GENRES.
    var TILT_VIS = {
        lab: "mixer-ui",
        host: "role-db",
    };

    root.__klangCore = {
        VERSION: VERSION,
        progressionDeg: progressionDeg,
        stack: stack,
        COLOR_EXT: COLOR_EXT,
        colorExt: colorExt,
        colorFinaleAdd: colorFinaleAdd,
        SCHRITT_TIMBRE: SCHRITT_TIMBRE,
        RHYTHMUS_MUSTER: RHYTHMUS_MUSTER,
        RAUM: RAUM,
        GLUE_GESETZ: GLUE_GESETZ,
        GLUE_VIS: GLUE_VIS,
        LIMITER_GESETZ: LIMITER_GESETZ,
        LIMITER_VIS: LIMITER_VIS,
        EQ_GESETZ: EQ_GESETZ,
        EQ_VIS: EQ_VIS,
        SOFTCLIP_GESETZ: SOFTCLIP_GESETZ,
        SOFTCLIP_VIS: SOFTCLIP_VIS,
        RESONANZ_GESETZ: RESONANZ_GESETZ,
        RESONANZ_VIS: RESONANZ_VIS,
        LOFI_GESETZ: LOFI_GESETZ,
        LOFI_VIS: LOFI_VIS,
        ANALYSER_GESETZ: ANALYSER_GESETZ,
        ANALYSER_VIS: ANALYSER_VIS,
        STRIP_GESETZ: STRIP_GESETZ,
        STRIP_VIS: STRIP_VIS,
        DUCK_GESETZ: DUCK_GESETZ,
        DUCK_VIS: DUCK_VIS,
        REC_GESETZ: REC_GESETZ,
        REC_VIS: REC_VIS,
        KICK_GESETZ: KICK_GESETZ,
        KICK_VIS: KICK_VIS,
        SNARE_GESETZ: SNARE_GESETZ,
        SNARE_VIS: SNARE_VIS,
        HIHAT_GESETZ: HIHAT_GESETZ,
        HIHAT_VIS: HIHAT_VIS,
        RIDE_GESETZ: RIDE_GESETZ,
        RIDE_VIS: RIDE_VIS,
        CRASH_GESETZ: CRASH_GESETZ,
        CRASH_VIS: CRASH_VIS,
        CLAP_GESETZ: CLAP_GESETZ,
        CLAP_VIS: CLAP_VIS,
        MIDI_GESETZ: MIDI_GESETZ,
        MIDI_VIS: MIDI_VIS,
        SIMDUR_GESETZ: SIMDUR_GESETZ,
        SIMDUR_VIS: SIMDUR_VIS,
        ROLES_GESETZ: ROLES_GESETZ,
        ROLES_VIS: ROLES_VIS,
        LAWS_GESETZ: LAWS_GESETZ,
        LAWS_VIS: LAWS_VIS,
        MODS_GESETZ: MODS_GESETZ,
        MODS_VIS: MODS_VIS,
        TUNING_GESETZ: TUNING_GESETZ,
        TUNING_VIS: TUNING_VIS,
        STATE_GESETZ: STATE_GESETZ,
        STATE_VIS: STATE_VIS,
        PRESET_GESETZ: PRESET_GESETZ,
        PRESET_VIS: PRESET_VIS,
        LOOKAHEAD_GESETZ: LOOKAHEAD_GESETZ,
        LOOKAHEAD_VIS: LOOKAHEAD_VIS,
        PUMP_GESETZ: PUMP_GESETZ,
        PUMP_VIS: PUMP_VIS,
        SCENES_GESETZ: SCENES_GESETZ,
        SCENES_VIS: SCENES_VIS,
        RIPPLE_GESETZ: RIPPLE_GESETZ,
        RIPPLE_VIS: RIPPLE_VIS,
        INSTVIS_GESETZ: INSTVIS_GESETZ,
        INSTVIS_VIS: INSTVIS_VIS,
        HOOK_GESETZ: HOOK_GESETZ,
        HOOK_VIS: HOOK_VIS,
        ART_GESETZ: ART_GESETZ,
        ART_VIS: ART_VIS,
        POCKET_GESETZ: POCKET_GESETZ,
        POCKET_VIS: POCKET_VIS,
        CAM_GESETZ: CAM_GESETZ,
        CAM_VIS: CAM_VIS,
        RIDDIM_GESETZ: RIDDIM_GESETZ,
        RIDDIM_VIS: RIDDIM_VIS,
        FORM_GESETZ: FORM_GESETZ,
        FORM_VIS: FORM_VIS,
        NOTE_GESETZ: NOTE_GESETZ,
        NOTE_VIS: NOTE_VIS,
        KEYMAP_GESETZ: KEYMAP_GESETZ,
        KEYMAP_VIS: KEYMAP_VIS,
        FIFTHS_GESETZ: FIFTHS_GESETZ,
        FIFTHS_VIS: FIFTHS_VIS,
        VOICE_GESETZ: VOICE_GESETZ,
        VOICE_VIS: VOICE_VIS,
        BUF_GESETZ: BUF_GESETZ,
        BUF_VIS: BUF_VIS,
        SECTION_GESETZ: SECTION_GESETZ,
        SECTION_VIS: SECTION_VIS,
        STRIPLBL_GESETZ: STRIPLBL_GESETZ,
        STRIPLBL_VIS: STRIPLBL_VIS,
        TILT_VIS: TILT_VIS,
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
