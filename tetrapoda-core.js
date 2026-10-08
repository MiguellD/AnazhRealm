// AnazhRealm — tetrapoda-core.js: DER KREATUR-STUDIO-KERN (Katalysator-Bogen W-A6, ε-Checkliste).
// Die GESTALT- + BEWEGUNGS-DATEN des Tetrapoda-Labs (worlds/tetrapoda/index.html —
// Evolution Lab "Aureus": Wolf/Fuchs/Baer/Hirsch aus fuenf allometrischen Dials;
// CPG-Gangnetz + Emotions-Bewegungsprofile). Byte-treu aus dem Schoepfer-Werk
// extrahiert (Literal-Slices, sha256-Beleg im Wellen-Bericht) — die Shell UND
// AnazhRealm lesen DIESE eine Quelle (G2.1), ein Nachbau ist verboten.
//
// FORM (Vertrag v1.1 §7 N7.2 + §8): namespaced IIFE __tetrapodaCore, MESHFREI = 1 —
// DER HOST BLEIBT DER OFEN (W-A6-Gesetz): bake-core-Isosurface + _creatureSkeleton +
// _buildCreatureSkinGeometry bauen die Koerper; dieser Kern liefert GESTALT-PARAMETER
// (die fuenf Dials je Gattung) + das benannte v1.1-Feld fx.motion (die Emotions-
// Gang-Profile + CPG-Kopplung + Stand-Pose als DATEN — der Host-Konsument ist der
// _animateCompoundMotion-/Rig-Bogen, benannter Andock-Punkt im Wellen-Bericht).
// KEIN buildInstance (B2 N/A), kein Mesh-Kanal, kein Parallel-Sim.
//
// DETERMINISMUS (G2.3): reine Daten — kein Math.random/keine Zeit im Manifest-Pfad
// (die Verhaltens-Wuerfe des Labs bleiben Shell-Runtime). THREE-frei, DOM-frei.
(function (root) {
    "use strict";

    var VERSION = "1.0.0";
    var STUDIO_VERTRAG = 1; // G4.3
    var MESHFREI = 1; // v1.1 §8 — components-only-Kern (keine Gestalt, nur Daten)
    // v1.2 §8.5 (V18.478, rein additiv) — DIE OFEN-STUFEN-ZEILE: ein MESHFREI-Kern
    // deklariert hiermit die LOD-Stufen, die der WIRTS-OFEN seiner Gestalt bäckt
    // (bauTier: Stufe 0 = voller Gelenk-Baum · Stufe 1 = gemergtes Fern-Standbild).
    // B2 bleibt N/A (kein buildInstance) — die Zeile ist die VERTRAGS-Wahrheit der
    // Pipe-Bäckerei (BAKERS_BY_KIND), gemessen von gate:konsum-matrix/gate:tier-fern.
    // B2c-Daten (W8, rein additiv): DAS BUDGET je Ofen-Stufe (docs/studio-vertrag.md B2c) — tris = die gebaute
    // Hülle über alle Gattungen × 16 Gestalten (gate:asset-contract, die Ratsche fällt nur), band = das Profi-Band-
    // Ziel (Haushalt, offen solange tris darüber liegt), draws = Draws je Tier und Pass nach der Wirts-Regel: das
    // Budget-Gesetz am Ausgang (Brücke UND Sync-Guss des Wirts-Ofens, phyto-core budgetErzwingen) faltet die
    // starren Stoffe je Bindungs-Klasse (Haut und Fell-Schale bleiben) und Seh-Klasse (TIER_MATERIAL_KLASSEN.seh:
    // das glimmende Auge · Hornhaut/Pupille · Nase/Ballen · Fell · Klaue/Zahn bleiben getrennt — L1 5 ist das
    // gemessene Minimum); schatten = die werfende Stufe.
    // gestalten = Individuen je Gattung (das bisherige Wirts-16, gefüllt je Rezept unten bei PRESETS).
    var GESTALTEN_JE_REZEPT = 16;
    var PORTAL_RENDER_CONFIG = {
        lod: {
            kindStages: { kreatur: [0, 1] },
            budget: {
                kreatur: {
                    0: { tris: 62000, band: 20000, draws: 8, schatten: 0 },
                    1: { tris: 7000, band: 3000, draws: 5, schatten: 1 },
                    // fernform (B2c, Pflicht je Budget-Art): jenseits der Nah-Grenze tragen die Glieder-Kapseln im Welt-March
                    fernform: "gesetz",
                },
                gestalten: {},
            },
        },
    };

    // ── Die vier Gattungen (byte-treu Lab Z.62): fuenf allometrische Dials je Art ──
    // prettier-ignore
    var GATTUNGEN = {wolf:{size:2.4,neck:0.263,leg:0.22,diet:1.0,build:0.42},fox:{size:1.5,neck:0.290,leg:0.22,diet:1.0,build:0.22},bear:{size:3.2,neck:0.180,leg:0.20,diet:0.5,build:0.70},deer:{size:2.8,neck:0.330,leg:0.28,diet:0.0,build:0.28}};
    // ── Das CPG-Kopplungsnetz (byte-treu Lab Z.80) + die Stand-Pose (Z.96) ──
    // prettier-ignore
    var CPG_COUPLING = [[0,-0.5,0.5,0],[-0.5,0,0,0.5],[0.5,0,0,-0.5],[0,0.5,-0.5,0]];
    // prettier-ignore
    var STAND_POSE = [[0.02,-0.03,0.05,0.02],[0.02,-0.03,0.05,0.02],[-0.02,0.02,0.05,-0.02],[-0.02,0.02,0.05,-0.02]];
    // ── Die Emotions-Bewegungsprofile (byte-treu Lab Z.130–135) — das motion-Feld ──
    // prettier-ignore
    var MOTION = {
    idle:{freq:0.25,stride:0,bodyX:0,bodyZ:0,headX:-0.01,headY:0,ear:0.15,tailAmp:0.10,tailRate:0.5,tension:0.9,bob:0.002,sway:0.006,kpMul:1.0,phases:[0,0,0,0]},
    joy:{freq:3.2,stride:0.06,bodyX:-0.04,bodyZ:0.02,headX:0.04,headY:0,ear:0.05,tailAmp:0.38,tailRate:5.5,tension:1.0,bob:0.020,sway:0.025,kpMul:0.55,phases:[0,Math.PI*0.75,Math.PI*1.5,Math.PI*0.25]},
    hunt:{freq:0.9,stride:0.018,bodyX:0.10,bodyZ:0,headX:-0.12,headY:0,ear:0.0,tailAmp:0.02,tailRate:0.15,tension:1.6,bob:0.002,sway:0.002,kpMul:1.8,phases:[0,Math.PI*0.75,Math.PI*1.5,Math.PI*0.25]},
    flee:{freq:9.0,stride:0.18,bodyX:0.05,bodyZ:0,headX:0.01,headY:0,ear:-0.22,tailAmp:0.006,tailRate:11.0,tension:1.5,bob:0.030,sway:0.010,kpMul:1.5,phases:[0,Math.PI,Math.PI,0]},
    alert:{freq:0.08,stride:0,bodyX:-0.03,bodyZ:0,headX:-0.06,headY:0,ear:0.08,tailAmp:0.04,tailRate:0.6,tension:1.2,bob:0.001,sway:0.001,kpMul:1.3,phases:[0,0,0,0]},
    showcase:{freq:0.1,stride:0,bodyX:0,bodyZ:0,headX:-0.02,headY:0,ear:0.12,tailAmp:0.16,tailRate:0.4,tension:0.9,bob:0.002,sway:0.012,kpMul:1.0,phases:[0,0,0,0]},
    // SCHWIMM-HEIMAT (rein additive DATEN-Zeile): der PADDEL-GANG — Trab-Phasen
    // [0,pi,pi,0], Nase ueber Wasser (headX +), Schwanz als Ruder (tailAmp/Rate),
    // gedaempftes Bob (das Wasser traegt). Der Wirt schaltet ihn ueber den
    // Koerper-ZUSTAND "schwimmen" (_motionProfileName, nie ueber Emotionen).
    schwimmen:{freq:2.2,stride:0.05,bodyX:0.06,bodyZ:0,headX:0.08,headY:0,ear:-0.05,tailAmp:0.28,tailRate:2.4,tension:1.1,bob:0.004,sway:0.02,kpMul:0.9,phases:[0,Math.PI,Math.PI,0]}
    };

    // ── KREATUR-LEBEN (rein additive DATEN-Zeilen): die VERHALTENS-SEELE des
    // Showcase (joy: Spielverbeugung/Bocksprung/Drehen · hunt: Pirschen/
    // Erstarren/Pounce · alert: Scannen/Schnappen · idle: Schuetteln/Gaehnen)
    // als REISENDE Daten — plus die Beduerfnis-Stimmungen tag (Weiden der
    // Pflanzenfresser) und nacht (Ruhen). Jede Aktion ist ein kurzer Profil-
    // Overlay des Baum-Gangs (profil-Felder ueberlagern das MOTION-Preset)
    // plus Sonder-Kanaele: dreh rad (Ganzkoerper-Drehung ueber die Dauer),
    // kopfSweep rad (Kopf-Pendel), rollAmp/rollRate (Schuettel-Rolle), hop true
    // (die Aktion springt: die Hoehe ist das Freude-Gesetz freude.hopHochM/
    // hopBasisM, der Abflug v0 = sqrt(2*g*h) mit GANG_GESETZ.g — VERTRAGS-AKT
    // Welle L 07.10.: der Abflug in m/s fiel, er war der Zwilling der Hoehe), tempo (Bewegungs-Faktor
    // waehrend der Aktion; 0 = innehalten). stimmung waehlt je Gemuetslage
    // die Aktions-Liste + den Takt alle=[min,max] Sekunden (der Wirt jittert
    // deterministisch aus der Kreatur-Identitaet — kein Zufall). Der Wirt
    // waehlt/stempelt (updateCreatures), der Baum-Gang traegt den Overlay
    // (_animateTierBaum). must-ignore: fremde Leser ueberlesen das Feld.
    var VERHALTEN = {
        aktionen: {
            playbow: { dauer: 1.2, profil: { freq: 0.3, stride: 0, bodyX: 0.35, headX: 0.3, tailAmp: 0.5, tailRate: 6 }, tempo: 0 }, // SCHAU-BEFUND 17.07.: Verbeugung senkt die FRONT (bodyX war -0.35 = Heck im Boden)
            bound: { dauer: 0.9, profil: { freq: 5.5, stride: 0.14, bob: 0.05 }, hop: true, tempo: 1.3 },
            spin: { dauer: 1.1, profil: { freq: 4.0, stride: 0.06 }, dreh: 6.283, tempo: 0.2 },
            stalk: { dauer: 2.6, profil: { freq: 0.7, stride: 0.014, bodyX: 0.12, headX: -0.14 }, tempo: 0.45 },
            freeze: { dauer: 1.4, profil: { freq: 0.02, stride: 0, tension: 1.8 }, tempo: 0 },
            pounce: { dauer: 0.7, profil: { freq: 6.0, stride: 0.16, bodyX: 0.2, bob: 0.06 }, hop: true, tempo: 1.6 },
            scan: { dauer: 1.8, profil: { freq: 0.06, stride: 0, headX: -0.08 }, kopfSweep: 0.5, tempo: 0 },
            snap: { dauer: 0.5, profil: { headX: 0.22, freq: 1.5 } },
            shake: { dauer: 0.8, profil: { freq: 0.2, stride: 0 }, rollAmp: 0.35, rollRate: 14, tempo: 0 },
            yawn: { dauer: 1.3, profil: { headX: -0.3, freq: 0.05, stride: 0 }, tempo: 0 },
            grasen: { dauer: 6.0, profil: { headX: 0.95, freq: 0.12, stride: 0.008, tailAmp: 0.18, tailRate: 1.2 }, tempo: 0.15 }, // SCHAU-BEFUND 17.07.: 0.4 = Maul 23 Grad ueber dem Boden; 0.95 senkt die Nase ins Gras
            ruhen: { dauer: 16, profil: { freq: 0.04, stride: 0, bodyX: 0.05, headX: 0.2, tailAmp: 0.03, tailRate: 0.3 }, tempo: 0 }, // SCHAU-BEFUND 17.07.: -0.08 hob die Brust; Ruhe senkt Rumpf+Kopf leicht
        },
        stimmung: {
            joy: { aktionen: ["playbow", "bound", "spin"], alle: [4, 9] },
            jagd: { aktionen: ["stalk", "freeze", "pounce"], alle: [3, 7] },
            alert: { aktionen: ["scan", "snap"], alle: [2, 5] },
            idle: { aktionen: ["scan", "shake", "yawn"], alle: [7, 16] },
            tag: { aktionen: ["grasen", "scan"], alle: [10, 22] },
            nacht: { aktionen: ["ruhen", "yawn"], alle: [8, 18] },
            // SCHLUSS-WELLE (Spiegel-Zensus 17.07., rein additive DATEN-Zeile):
            // die SCHWELLEN des Verhaltens-Ticks — ab wann das Gemuet die
            // Stimmung waehlt (chaos→alert, joy→joy), wann die Nacht ruht
            // (Sonnen-Sinus unter nachtSin) und wer weidet (diet ≤ weideDiet).
            // KEINE Stimmungs-Zeile (kein aktionen/alle) — die Leser der
            // Stimmungs-Tabelle ueberspringen den Schluessel (must-ignore).
            schwellen: { chaos: 0.5, joy: 0.5, nachtSin: -0.15, weideDiet: 0.5 },
        },
        // KREATUR-SEELE (Spiegel-Zensus 17.07., rein additive DATEN-Zeilen):
        // die VERHALTENS-ZAHLEN der Welt-Wesen wohnen im Evolutions-Gesetzbuch —
        // jagd (Witterung + Biss des Raubtiers) · furcht (Wariness-Gewichte +
        // Flucht) · temperament (Resonanz-Signaturen + Gegenwehr-Profile +
        // Floor) · wandern (Leine/Schlendern + Emotions-Modulation). Der Wirt
        // liest memoisiert + fail-soft (AnazhRealm._verhaltenGesetz); seine
        // Literal-Bloecke (CREATURE_HUNT/CREATURE_NATURE/TEMPERAMENT_*/
        // CREATURE_CHARAKTER) sind der zahlen-gleiche Fallback — die
        // KREATUR-SEELEN-PARITAETS-WAND im Vertrag-Validator erzwingt die
        // Gleichheit. must-ignore: fremde Leser ueberlesen die Bloecke.
        jagd: {
            radius: 12, // m — Spieler-Witterungs-Reichweite (darueber wandert das Raubtier)
            speedBoost: 1.45, // Jagd ist schneller als Schlendern, langsamer als Flucht (1.6)
            strikeRange: 2.4, // m — Biss-Reichweite (die EINE Reichweiten-Wahrheit, auch Gegenwehr)
            strikeCooldownSec: 1.6, // s — zwischen zwei Bissen
            damageMul: 0.8, // × dem damage-Stat des Wesens
            fearHpFrac: 0.5, // unter dieser HP-Fraktion wird Schaden zur FURCHT (threatened)
            triumphWindowSec: 20, // s — ein Jaeger, so frisch er biss, gebiert beim Fall TRIUMPH
            scentRangeM: 50, // m — Beute-Wittern ueber das Geruch-Feld (weiter als Sehen)
            scentProbeM: 4, // m — Probe-Schritt der 4-Richtungs-Gradient-Suche
            pirschStoppM: 1.6, // m — SCHLUSS-WELLE: naeher pirscht der Jaeger nicht heran (Stopp vor dem Biss)
        },
        furcht: {
            noticeRadius: 22, // m — fern davon ignoriert das Wesen den Spieler
            menaceFromChaos: 1.3, // Aggression/Zorn verschreckt am staerksten
            menaceFromSorrow: 0.5, // Trauer verunsichert etwas
            calmFromPeace: 0.9, // Ruhe laedt ein
            calmFromJoy: 0.5, // Freude lockt
            // DIE NATUR ist das Temperament der Gattung (Welle LF 08.10., VERTRAGS-AKT): der Mut der Art (0 scheu … 1
            // wehrhaft, aus profile.fleeMul) wiegt die Wariness — die Substanz-Gewichte (dichte/haerte/lebendig) fielen,
            // die Tiere sind tag-gleich (Lehre 8: jeder Hirsch stand neugierig bei Wariness −1,0).
            mutGewicht: 0.9, // Natur-Term (2·mut − 1)·mutGewicht: scheu −0,9 … wehrhaft +0,9
            boldFromBond: 0.9, // Bindung macht mutig in Spieler-Naehe
            friedenMenace: 0.3, // frieden daempft die Bedrohung stark
            schoepferMenace: 0.1, // schoepfer: die Welt ist ruhig
            curiousThreshold: -0.2, // Wariness darunter → neugierig (naeher)
            fleeThreshold: 0.3, // Wariness darueber → scheu (fort)
            fleeRadius: 14, // m — innerhalb davon flieht ein verschrecktes Wesen aktiv
            fleeSpeedBoost: 1.6, // Flucht ist schneller als das Schlendern
            combatFearWariness: 1.5, // ein getroffenes Wesen ist garantiert ueber der Flucht-Schwelle
            fearSec: 5, // s — wie lange die Kampf-Furcht (fearUntil) anhaelt
            neugierStoppM: 2, // m — SCHLUSS-WELLE: naeher tritt ein neugieriges Wesen nicht heran
        },
        temperament: {
            // DAS TEMPERAMENT DER GATTUNG (Welle LF 08.10., VERTRAGS-AKT): aus der Ernaehrung (Dial diet) und der Masse
            // (Dial size × Koerpergroesse) — temperamentDerGattung. Ein Fleischfresser mit Masse jagt (wild), ohne sie
            // ist er scheu; ein Pflanzenfresser ist ein Fluchttier (scheu), erst als Koloss wehrhaft; dazwischen wehrt
            // sich, wer Masse hat (wehrhaft), sonst sanft. Die Substanz-Signaturen und ihr Floor fielen: die Tiere
            // sind tag-gleich, Hirsch und Fuchs blieben „wehrhaft" (Leben-Schau 07.10., D16/K-D12).
            gattung: {
                fleischDiet: 0.75, // diet ab hier: Fleischfresser
                pflanzDiet: 0.25, // diet bis hier: Pflanzenfresser (Fluchttier)
                jagdMasse: 2.0, // size × bodySize ab hier jagt ein Fleischfresser
                wehrMasse: 3.0, // ab hier wehrt sich ein Allesfresser
                kolossMasse: 5.0, // ab hier wehrt sich auch ein Fluchttier
            },
            profile: {
                wehrhaft: { strike: 0.45, strikeChaos: 0.3, strikeCap: 0.8, counterMul: 0.7, fleeMul: 0.5 },
                wild: { strike: 0.3, strikeChaos: 0.5, strikeCap: 0.85, counterMul: 0.85, fleeMul: 0.7 },
                sanft: { strike: 0, strikeChaos: 0, strikeCap: 0, counterMul: 0, fleeMul: 1.0 },
                scheu: { strike: 0, strikeChaos: 0, strikeCap: 0, counterMul: 0, fleeMul: 1.7 },
            },
        },
        wandern: {
            speedMulMin: 0.6, // Klemm-Boden der Charakter-Geschwindigkeit (stats.speed / STAT-Base 7)
            speedMulMax: 1.6, // Klemm-Deckel
            leashBaseM: 18, // m — die Grund-Leine um den Anker (Geburtsort), × bodySize
            leashSpanM: 10, // m — ± Spanne ueber die Mut-Achse
            anchorPull: 1.2, // Heim-Zug jenseits der Leine (× speed, geklemmt auf 1×)
            strideSec: 2.5, // s — die Wander-Schritt-Periode (deterministisch aus netId × Slot)
            wanderSpeedMul: 0.45, // Wander-Tempo relativ zur vollen Bewegungs-Geschwindigkeit
            chaosGain: 0.5, // Moment-chaos → fahriger (mehr Amplitude + kuerzere Schritte)
            sorrowDamp: 0.4, // Moment-sorrow → gedaempfter
            ampFloor: 0.3, // Boden der Emotions-Modulation (schlurfen, nie einfrieren)
        },
        // ── DIE SCHLUSS-WELLE (Spiegel-Zensus 17.07., rein additive DATEN-
        // Zeilen): die letzten neun Stamm-Literale mit tetrapoda-Heimat kehren
        // ins Evolutions-Gesetzbuch heim — freude (Joy-Tempo + Huepf-Hoehen) ·
        // groessen (die Koerpergroessen-Baender,
        // Lehre 8: DIE Differenzierungs-Achse) · separation (Herden-Abstand) ·
        // aufgaben (Gefaehrten-Tempi + Halt-Distanzen) · herde (Schwarm-
        // Kohaesion) · wasser (Ufer-Scheu) — plus jagd.pirschStoppM,
        // furcht.neugierStoppM und stimmung.schwellen oben. Der Wirt liest
        // fail-closed via AnazhRealm._verhaltenGesetz (Kern-Pflicht); die
        // Werte sind byte-gleich den historischen Stamm-Literalen.
        // must-ignore: fremde Leser ueberlesen die Bloecke. ──
        // DAS SPRUNG-GESETZ (Welle L 07.10.): die Huepf-Hoehe ist die EINE Quelle eines Sprungs — der Wirt
        // (creatureJump) springt froh hopHochM, sonst hopBasisM, mit dem Abflug v0 = sqrt(2*g*h). Der lineare
        // Faktor sprung.impulsProM (Hoehe -> m/s) fiel mit dem Abflug in m/s der Aktionen (VERTRAGS-AKT).
        freude: {
            tempoMul: 2, // ein frohes Wesen bewegt sich doppelt so lebhaft
            hopHochM: 1.2, // m — der frohe Huepfer
            hopBasisM: 0.8, // m — der Grund-Huepfer (ein Wesen, das nicht froh ist)
        },
        groessen: [
            // Wurf-Baender der Koerpergroesse (roll ∈ [0,1) aus der Identitaet):
            // roll < bis → range(name, min, max); die letzte Zeile faengt den Rest.
            { name: "klein", bis: 0.18, min: 0.6, max: 0.82 }, // Jungtier/Zwerg (flink, zart)
            { name: "normal", bis: 0.82, min: 0.85, max: 1.18 }, // typisch
            { name: "gross", bis: 0.965, min: 1.25, max: 1.75 }, // ein grosses Tier
            { name: "gigant", bis: 1, min: 1.9, max: 2.7 }, // GIGANT — ein Koloss (robust, traege), selten
        ],
        separation: {
            radiusBaseM: 1.6, // m — Paar-Radius zweier Normal-Wesen (bodySize 1); skaliert × (bsI+bsJ)/2
            strength: 1.5, // Abstoss-Gewicht (× speed) bei voller Deckung; linear → 0 am Radius-Rand
        },
        aufgaben: {
            followHaltM: 3.5, // m — Standard-Halte-Abstand des Folgens
            followTempo: 4.0, // m/s — Folgen ist sichtbar schneller als Wandern
            gatherHaltM: 1.5, // m — bei dieser Distanz zur Ziel-Architektur erntet die Kreatur
            gatherTempo: 3.0, // m/s — etwas langsamer als Folgen, damit Sammeln sichtbar bleibt
            uebergabeM: 2.0, // m — bei dieser Distanz zum Schoepfer uebergibt die Kreatur die Ernte
            bauAbstandM: 4.0, // m — so weit vom Schoepfer entfernt baut die Kreatur
            bauTempo: 3.0, // m/s — analog Sammeln (sichtbar-aktiv, ohne Hetze)
            trinkHaltM: 1.5, // m — am Wasser-Punkt angekommen beginnt die Pause
            trinkDauerS: 2.5, // s — die sichtbare Trink-Geste am Ufer
            trinkSuchM: 40, // m — max Suchradius zum naechsten Wasser-Punkt
            trinkTempo: 3.0, // m/s — sichtbares Gehen zum Ufer
        },
        herde: {
            minAbstSq: 1, // m² — darunter zaehlt der Nachbar nicht zur Kohaesion (Deckung → Separation)
            fensterSq: 25, // m² — das Kohaesions-Fenster (5 m) der neugierigen Schar
            gewicht: 0.5, // Zug-Gewicht je Nachbar auf die Richtung
            maxNachbarn: 6, // Kohaesions-Budget je Wesen (dann bricht der Scan ab)
        },
        wasser: {
            tiefenScheuM: 1.5, // m — tiefer scheut das Wesen die Tiefe und strebt zum Ufer
            schwimmTiefeM: 0.5, // m — ab dieser Tiefe schwimmt der Koerper am Spiegel (statt Grund)
            uferBias: 1.5, // × speed — der Ufer-Zug der Tiefen-Scheu auf die freie Richtung
        },
    };

    // ═══════════════════════════════════════════════════════════════════════
    //  B4 PARAMS — die fuenf Lab-Slider als DATEN (worlds/tetrapoda/index.html
    //  Z.42–51: min/max/step/value + die law-Zeilen woertlich).
    // ═══════════════════════════════════════════════════════════════════════
    var PARAMS = [
        {
            id: "size",
            lab: "Groesse",
            min: 1.0,
            max: 4.0,
            step: 0.1,
            def: 2.4,
            law: "Beinmuskel = 0.42 x (Groesse/2.4)^0.67 -- Allometrie",
            grp: "KOERPER",
        },
        {
            id: "neck",
            lab: "Nacklaenge",
            min: 0.15,
            max: 0.4,
            step: 0.01,
            def: 0.263,
            law: "Nackwinkel = 35 + (Laenge-0.26)x300, 5..72 -- laenger = aufrichtiger",
            grp: "KOERPER",
        },
        {
            id: "leg",
            lab: "Beinlaenge",
            min: 0.15,
            max: 0.35,
            step: 0.01,
            def: 0.22,
            law: "Gangtempo = sqrt(Beinlaenge/0.22) x 1.2 -- Froude",
            grp: "KOERPER",
        },
        {
            id: "diet",
            lab: "Ernaehrung",
            min: 0,
            max: 1,
            step: 0.05,
            def: 1.0,
            law: "Fanglaenge, Augenpos. -- Carnivor kurz+vorne, Herbivor lang+seitlich",
            grp: "KOERPER",
        },
        {
            id: "build",
            lab: "Statur",
            min: 0,
            max: 1,
            step: 0.05,
            def: 0.42,
            law: "Muskel, Bauchtiefe, Beindicke -- schlank bis massiv",
            grp: "KOERPER",
        },
    ];

    // ═══════════════════════════════════════════════════════════════════════
    //  B1 REZEPTE (Vertrags-Form) — die vier klickbaren Gattungen: kind
    //  "kreatur", s = die fuenf Dials, fx.motion = das v1.1-Komponenten-Feld
    //  (Profile + CPG + Stand-Pose, JSON-klonbar), fx.place {mode:"none"}
    //  (Spawn ueber den Hof, nie Worldgen — der Fahrplan-Entscheid).
    // ═══════════════════════════════════════════════════════════════════════
    var PRESETS = (function () {
        var out = {};
        var labels = { wolf: "Wolf", fox: "Fuchs", bear: "Baer", deer: "Hirsch" };
        for (var id in GATTUNGEN) {
            if (!Object.prototype.hasOwnProperty.call(GATTUNGEN, id)) continue;
            out[id] = {
                kind: "kreatur",
                lab: labels[id] || id,
                s: Object.assign({}, GATTUNGEN[id]),
                fx: {
                    place: { mode: "none" },
                    motion: {
                        presets: JSON.parse(JSON.stringify(MOTION)),
                        cpgCoupling: JSON.parse(JSON.stringify(CPG_COUPLING)),
                        standPose: JSON.parse(JSON.stringify(STAND_POSE)),
                    },
                    // KREATUR-LEBEN — die Verhaltens-Seele reist im Rezept (additiv, must-ignore).
                    verhalten: JSON.parse(JSON.stringify(VERHALTEN)),
                },
            };
        }
        return out;
    })();

    // ════════════════════════════════════════════════════════════════════
    // ALTLASTEN-NULL HERZ (V18.449) — DIE EINE ANATOMIE-QUELLE.
    // Das Vierbeiner-Skelett-GESETZ wohnt im Evolutions-Gesetzbuch (diesem
    // Kern), nicht im Stamm: die Archetyp-Proportionen (Referenz-vermessen)
    // + der Skelett-Bauer (reine Daten+Mathe -> Part-Liste; MESHFREI §8 —
    // kein Mesh, der Host/Ofen backt). Der Stamm DELEGIERT hierher; der
    // Worker trägt denselben Kern — EIN Gesetz, alle Leser.
    // (Verbatim aus dem Stamm gewandert — byte-gleicher Guss, Batterie-belegt.)
    // ════════════════════════════════════════════════════════════════════
    var ARCHETYPES = Object.freeze({
        balanced: {
            legFrac: 0.5,
            segRatio: 1.0,
            torsoL: 0.58,
            torsoW: 0.32,
            torsoH: 0.42,
            neckFrac: 0.24,
            neckTilt: 0.55,
            headFrac: 0.24,
            tailFrac: 0.34,
            eyeFront: 0.4,
            kneeFwd: 0.05,
        },
        deer: {
            legFrac: 0.6,
            segRatio: 0.82,
            torsoL: 0.54,
            torsoW: 0.28,
            torsoH: 0.44,
            neckFrac: 0.34,
            neckTilt: 0.5,
            headFrac: 0.21,
            tailFrac: 0.16,
            eyeFront: 0.12,
            kneeFwd: 0.055,
        },
        wolf: {
            legFrac: 0.54,
            segRatio: 1.0,
            torsoL: 0.6,
            torsoW: 0.3,
            torsoH: 0.44,
            neckFrac: 0.22,
            neckTilt: 0.46,
            headFrac: 0.26,
            tailFrac: 0.42,
            eyeFront: 0.5,
            kneeFwd: 0.06,
        },
        bear: {
            legFrac: 0.42,
            segRatio: 1.2,
            torsoL: 0.62,
            torsoW: 0.46,
            torsoH: 0.52,
            neckFrac: 0.16,
            neckTilt: 0.42,
            headFrac: 0.26,
            tailFrac: 0.12,
            eyeFront: 0.35,
            kneeFwd: 0.05,
        },
        bigcat: {
            legFrac: 0.48,
            segRatio: 1.0,
            torsoL: 0.62,
            torsoW: 0.36,
            torsoH: 0.48,
            neckFrac: 0.16,
            neckTilt: 0.38,
            headFrac: 0.27,
            tailFrac: 0.5,
            eyeFront: 0.75,
            kneeFwd: 0.065,
        },
        weasel: {
            legFrac: 0.2,
            segRatio: 1.0,
            torsoL: 0.86,
            torsoW: 0.22,
            torsoH: 0.24,
            neckFrac: 0.16,
            neckTilt: 0.5,
            headFrac: 0.2,
            tailFrac: 0.5,
            eyeFront: 0.35,
            kneeFwd: 0.03,
        },
        horse: {
            legFrac: 0.62,
            segRatio: 0.78,
            torsoL: 0.58,
            torsoW: 0.3,
            torsoH: 0.46,
            neckFrac: 0.32,
            neckTilt: 0.46,
            headFrac: 0.22,
            tailFrac: 0.3,
            eyeFront: 0.12,
            kneeFwd: 0.05,
        },
    });

    function buildSkeleton(g) {
        g = g || {};
        const bodyMat = g.bodyMat || "stein";
        const limbMat = g.limbMat || bodyMat;
        const headMat = g.headMat || limbMat;
        const SH = g.shapes || {};
        const torsoShape = SH.torso || "box";
        const limbShape = SH.limb || "limb";
        const headShape = SH.head || "sphere";
        const snoutShape = SH.snout || "limb";
        const s = g.size || 1;
        const bodyCol = g.bodyColor;
        const limbCol = g.limbColor;
        const parts = [];
        const add = (shape, material, x, y, z, sx, sy, sz, rot, col, extra) => {
            const p = { shape, material, position: { x, y, z }, size: { x: sx, y: sy, z: sz } };
            if (rot && (rot.x || rot.y || rot.z)) p.rotation = rot;
            if (typeof col === "number") p.color = col;
            if (extra) Object.assign(p, extra);
            parts.push(p);
            return p;
        };
        // wahrerguss System B — die BIOMECHANISCHE ARCHETYP-Grammatik (Form folgt Funktion,
        // recherchiert): Wolf/Reh/Bär/Wiesel/Pferd/Großkatze unterscheiden sich in Bein-Anteil,
        // Glied-Gliederung (distal schlanker), Hals/Kopf, Rumpf-Breite/Höhe, Augen-FRONTALITÄT
        // (Jäger vorwärts ~0.7 / Pflanzenfresser seitlich ~0.12), Neigung. EIN Schema, viele
        // Tiere. TAG-NEUTRAL: nur Längen/Positionen/Anzahl variieren (gleiche Shapes+Materialien
        // → der compound-MAX bleibt unverändert; GEMESSEN diag-genom Affinität-Band).
        const A = g.archetype || ARCHETYPES.balanced || {};
        const af = (k, d) => (A && A[k] != null ? A[k] : d);
        const BL = (g.bodyLen != null ? g.bodyLen : 1.0) * s; // Körper-Länge = Referenz
        const torsoLen = BL * af("torsoL", 0.55);
        const torsoW = BL * af("torsoW", 0.3);
        const torsoH = BL * af("torsoH", 0.36);
        const legLen = BL * af("legFrac", 0.5);
        const legR = BL * af("legR", 0.05);
        const neckLen = BL * af("neckFrac", 0.24);
        const neckTilt = af("neckTilt", 0.55); // +y-Ende nach vorn-oben (rotV: (0,cos,sin))
        const headFull = BL * af("headFrac", 0.22);
        const headR = headFull * 0.5;
        const tailLen = BL * af("tailFrac", 0.34);
        const eyeFront = af("eyeFront", 0.4);
        const stanceX = torsoW * 0.42; // Beine leicht INNERHALB der Körper-Kante (Bein überlappt den Leib)

        // (1) RUMPF — die ZWEI LASTTRAGENDEN BLÖCKE (Reh-Referenz, Schöpfer-Tafel; „ein
        //     Tierkörper ist gebaute Topologieoptimierung"): ein tiefer BRUSTKORB (Thorax,
        //     vorn-tief, die dominante Masse) + ein hohes BECKEN (Kruppe, hinten), verbunden
        //     durch eine leichtere Lende mit Bauch-Einzug. Die Topline ist GEKRÜMMT (Widerrist
        //     → Senke → Kruppe), nie gerade (Spore-Lektion: die gerade Oberlinie liest tot).
        //     ALLE Massen sind KONVEX + überlappend → der smin verschmilzt sie zu EINEM Leib
        //     OHNE Front-Mulde (der alte 5-Kugel-Spine erzeugte den konkaven Brust-Krater).
        //     TAG-NEUTRAL: nur torsoShape + bodyMat, allein Längen/Positionen variieren.
        const barrel = g.bodyBarrel !== false;
        const bodyLen = torsoLen * 1.7; // sichtbare Körper-Länge entlang z
        // ── DER KÖRPER ALS REGEL (Schöpfer „schärfe die Regel statt zu brute-forcen — kein fetter
        //    Ball"): ZWEI KURVEN + ein PROFIL, an N Stationen abgetastet — KEINE hand-platzierten
        //    Blobs. · TOPLINE yTop(zf): die Rücken-Kurve (Widerrist hoch · Rücken · Kruppe hoch).
        //    · TIEFE depth(zf): die Brust-Tiefe nach UNTEN (Ribcage tief · Flanke getuckt · Becken).
        //    · BREITE width(zf): die SCHMALE Körper-Breite. Jede Station ist ein ANISOTROPES
        //    Ellipsoid (x schmal, y tief, z = Scheibe) → Rücken = yTop, Bauch = yTop − depth: die
        //    tiefe SCHMALE Brust + der Flanken-Tuck EMERGIEREN aus den Profilen. Reh-Referenz-
        //    Parameter (Archetyp/Genom variieren sie). TAG-NEUTRAL (torsoShape+bodyMat; Maße zählen
        //    nicht in die Compound-Tags).
        const lerpCurve = (cps, zf) => {
            if (zf >= cps[0][0]) return cps[0][1];
            for (let i = 1; i < cps.length; i++)
                if (zf >= cps[i][0]) {
                    const t = (zf - cps[i][0]) / (cps[i - 1][0] - cps[i][0]);
                    return cps[i][1] + (cps[i - 1][1] - cps[i][1]) * t;
                }
            return cps[cps.length - 1][1];
        };
        // ANIMAL-ANATOMIE (Hunde-/ARAP-Referenz): ein Tier ist eine HÄNGEBRÜCKE — ein tiefer SCHMALER
        // Brustkorb + ein hohes Becken, verbunden durch eine LEICHTE Lende mit scharfem Flanken-TUCK
        // (der Bauch zieht sich HOCH). KEIN Barrel. Tiefe ≫ Breite. Widerrist + Kruppe als Anker.
        const toplineCP = af("topline", 0) || [
            [0.5, 0.46], // Brust-Ansatz
            [0.34, 0.52], // WIDERRIST hoch (Schulterblatt)
            [0.08, 0.4], // Rücken
            [-0.16, 0.38], // Lende
            [-0.32, 0.5], // KRUPPE hoch (Becken)
            [-0.5, 0.4], // Schwanz-Ansatz (rund, nicht spitz)
        ];
        const depthCP = af("depthProfile", 0) || [
            [0.5, 0.5], // Brisket rund-blunt vorn (kein Raketen-Prow)
            [0.34, 1.02], // tiefer BRUSTKORB — die dominante Masse, hängt tief
            [0.12, 0.92], // Rippen
            [-0.06, 0.4], // FLANKEN-TUCK — der Bauch zieht sich HOCH (die Taille des Tiers)
            [-0.3, 0.74], // Becken/Schenkel-Masse
            [-0.5, 0.44], // Heck rund (nicht spitz)
        ];
        const widthCP = af("widthProfile", 0) || [
            [0.5, 0.4], // schmale runde Brust vorn
            [0.3, 0.6], // Brustkorb (breiteste Stelle — aber SCHMAL: ein Tier ist tief, nicht breit)
            [0.0, 0.42], // schmale Lende
            [-0.3, 0.6], // Kruppe/Hinterhand (etwas breiter)
            [-0.5, 0.42], // Heck rund
        ];
        // der dichte Kern (verborgen) — trägt die dichte-Tags.
        // kleiner dichte-Kern im BRUSTKORB (trägt die dichte-Tags — Größe geht NICHT in die Tags ein);
        // klein + vorn-oben → er füllt NICHT den Flanken-Tuck (der alte große Mittel-Kern war ein
        // Haupt-Treiber des Barrel-Blobs, GEMESSEN am Render).
        add(
            torsoShape,
            bodyMat,
            0,
            torsoH * 0.12,
            torsoLen * 0.24,
            torsoW * 0.34,
            torsoH * 0.32,
            torsoLen * 0.34,
            null,
            bodyCol
        );
        let bellyShoulder = -torsoH * 0.3,
            bellyHip = -torsoH * 0.3;
        if (barrel) {
            const NS = 13;
            for (let i = 0; i < NS; i++) {
                const zf = 0.5 - (i / (NS - 1)) * 1.0; // +0.5 … −0.5 (Front → Heck)
                const yTop = lerpCurve(toplineCP, zf) * torsoH;
                const depth = Math.max(0.06, lerpCurve(depthCP, zf) * torsoH);
                const width = Math.max(0.06, lerpCurve(widthCP, zf) * torsoW);
                const cy = yTop - depth * 0.5; // Top ≈ Topline (Rücken), Bauch hängt um depth
                const sliceZ = (bodyLen / (NS - 1)) * 1.5; // leichter überlappend (feiner gesampelt) → der Flanken-TUCK überlebt statt verschmiert zu werden
                add(torsoShape, bodyMat, 0, cy, zf * bodyLen, width, depth, sliceZ, null, bodyCol);
                if (Math.abs(zf - 0.34) < 0.07) bellyShoulder = yTop - depth; // Bauch an der Schulter
                if (Math.abs(zf + 0.28) < 0.07) bellyHip = yTop - depth; // Bauch an der Hüfte
            }
        }

        // (2) BEINE — schlanke gegliederte Streben aus dem BAUCH jeder Station (Kragträger): das
        //     obere Glied tief im Bauch verankert (glatte Emergenz, kein Pin-Kneif), das untere
        //     sehnig-dünn, ein flacher HUF-Donor am Boden. Vorderbein fast gerade, Hinterbein
        //     Z-gebogen (Stifle/Sprunggelenk — die Reh-Signatur). Vier Paare → Stützpolygon (Ω-Φ2).
        const shoulderZ = torsoLen * 0.5;
        const hipZ = torsoLen * 0.48;
        const segBetween = (ax, ay, az, bx, by, bz, r) => {
            const dy = by - ay,
                dz = bz - az;
            const len = Math.hypot(bx - ax, dy, dz) || 0.01;
            add(
                limbShape,
                limbMat,
                (ax + bx) / 2,
                (ay + by) / 2,
                (az + bz) / 2,
                r * 2,
                len,
                r * 2,
                { x: Math.atan2(dz, dy), y: 0, z: 0 },
                limbCol
            );
        };
        const hoofCol = typeof limbCol === "number" ? (limbCol >> 1) & 0x7f7f7f : limbCol; // dunkler Huf (tag-neutral)
        const embedY = torsoH * 0.08;
        const groundY = Math.min(bellyShoulder, bellyHip) - legLen; // gemeinsamer Boden → Füße auf einer Ebene
        // WURZEL 2 (lebendiger-koerper §2½ — MUSKEL ALS DYNAMIK): die Hinterhand ist der Gang-MOTOR
        // (Gluteus/Biceps femoris erzeugen das Spitzen-Hüft-Drehmoment beim Abstoß), das Vorderbein
        // die passive STREBE/der Stoßdämpfer. Muskel-Querschnitt ∝ Spitzen-Gang-Drehmoment — das liegt
        // in Ω-CHRONOS (DYNAMIK), nicht Ω-PHYSIS (STATIK: ein Tisch steht ohne einen einzigen Muskel).
        // Darum trägt die Hinterhand eine große PROXIMALE Masse (verdicktes Oberglied + ein Schenkel-
        // Bauch an der Kruppe), das Vorderbein eine kleinere Schulter; DISTAL bleibt sehnig-dünn (die
        // distale Leichtigkeit echter Läufer = niedrige Glied-Trägheit). Die Muskel-Kapsel überlappt
        // Leib + Oberglied → der smin verschmilzt sie zu EINEM muskulösen Massiv (kein aufgeklebter
        // Blob — die Mr.-Potato-Lehre). TAG-NEUTRAL: limb + limbMat (im Compound-MAX schon da, Maße
        // zählen nicht), die Masse bleibt INNERHALB der Körper-AABB (sizeFactor-stabil, V18.208).
        const hindMotor = af("hindMotor", 0.95); // Propulsions-Anteil der Hinterhand (Läufer hoch)
        const foreMotor = af("foreMotor", 0.5); // Vorderbein = Strebe (leichter)
        const muscleScale = af("limbMuscle", 1.0);
        // DIGITIGRADE Z-FALTUNG (Hunde-/ARAP-Referenz, die Schöpfer-Tafel): ein Tier steht auf den
        // ZEHEN — das Bein faltet Hüfte→Stifle(hoch,vorn)→SPRUNGGELENK(mittig, HOCH über dem Boden)→
        // Zehen. Das HOHE Hock/Handwurzel-Gelenk + der lange ~vertikale Mittelfuß ist die Signatur,
        // die das Tier vom plumpen Stelzen-Tisch trennt. fold = {stifleH, stifleZ, hockH, hockZ, toeZ}
        // (H = Höhe als Anteil der Beinhöhe über Boden, Z = Versatz in legLen — aus der Referenz).
        const buildLeg = (sgnX, belly, zPos, fold, motor) => {
            const x = sgnX * stanceX;
            const topY = belly + embedY; // Hüft-/Schulter-Gelenk, tief im Bauch verankert
            const drop = topY - groundY; // ganze Beinhöhe
            const m = Math.max(0, motor || 0) * muscleScale;
            const stifleY = groundY + drop * fold.stifleH,
                stifleZ = zPos + legLen * fold.stifleZ;
            const hockY = groundY + drop * fold.hockH, // das HOHE Sprung-/Handwurzelgelenk
                hockZ = zPos + legLen * fold.hockZ;
            const toeZ = zPos + legLen * fold.toeZ;
            const upperR = legR * (1.15 + m * 0.6); // Femur/Humerus proximal bemuskelt ∝ Motor
            segBetween(x, topY, zPos, x, stifleY, stifleZ, upperR); // Femur/Humerus
            segBetween(x, stifleY, stifleZ, x, hockY, hockZ, legR * 0.74); // Tibia/Radius (sehnig)
            segBetween(x, hockY, hockZ, x, groundY + legR * 0.5, toeZ, legR * 0.56); // Mittelfuß (dünn, ~vertikal)
            // MUSKEL-BAUCH — Kruppe/Schenkel (Heck) bzw. Schulter (vorn) am proximalen Glied.
            if (m > 0.12) {
                const bz = zPos + (zPos < 0 ? -legLen * 0.04 : legLen * 0.03);
                const by2 = topY - drop * 0.16;
                segBetween(
                    x * 0.86,
                    belly + embedY * 1.4,
                    bz,
                    x * 0.95,
                    by2,
                    stifleZ - legLen * 0.02,
                    legR * (0.95 + m * 1.4)
                );
            }
            // PFOTE — flach am Boden, die Zehen vorn (überlappt den Mittelfuß → smin verbindet).
            add(
                "box",
                limbMat,
                x,
                groundY + legR * 0.5,
                toeZ + legR * 0.55,
                legR * 1.2,
                legR * 0.85,
                legR * 2.1,
                null,
                hoofCol
            );
        };
        // Fore = straffer (Stütze), Hind = stärker gefaltet (Motor) — beide digitigrad, Hock HOCH.
        const foreFold = { stifleH: 0.62, stifleZ: -0.03, hockH: 0.3, hockZ: 0.04, toeZ: 0.06 };
        const hindFold = { stifleH: 0.64, stifleZ: 0.13, hockH: 0.33, hockZ: -0.05, toeZ: 0.03 };
        buildLeg(-1, bellyShoulder, shoulderZ, foreFold, foreMotor); // Vorderbein
        buildLeg(1, bellyShoulder, shoulderZ, foreFold, foreMotor);
        buildLeg(-1, bellyHip, -hipZ, hindFold, hindMotor); // Hinterbein
        buildLeg(1, bellyHip, -hipZ, hindFold, hindMotor);

        // (3) HALS + (4) KOPF — Neigung aus der Rolle. Der Hals verbindet die Rumpf-Front mit dem
        //     Kopf; rotV: ein y-Glied mit rotation.x=θ zeigt sein +y-Ende nach (0,cosθ,sinθ) =
        //     vorn-oben. Der Kopf sitzt am Hals-Ende; er trägt den ANKER + die Augen-FRONTALITÄT.
        const neckCY = torsoH * 0.34,
            neckCZ = torsoLen * 0.64; // Hals an der Brust-FRONT des langen Leibs
        const dirY = Math.cos(neckTilt),
            dirZ = Math.sin(neckTilt);
        // THROAT-BRIDGE — eine ~kubische torsoShape-Masse (→ Kugel im Feld) füllt den Hals-Brust-
        // Reentrant; ohne sie liest der dünne Hals auf der großen Brust von VORN als konkaver
        // Kehl-Krater. torsoShape+bodyMat → tag-neutral (Box in beiden Seelen-Sets; Größe geht
        // nicht in die Compound-Tags ein).
        add(
            torsoShape,
            bodyMat,
            0,
            neckCY * 0.5,
            neckCZ * 0.92,
            torsoW * 0.78,
            torsoH * 0.5,
            torsoLen * 0.41,
            null,
            bodyCol
        );
        add(
            limbShape,
            limbMat,
            0,
            neckCY,
            neckCZ,
            legR * 2.3,
            neckLen,
            legR * 1.9,
            { x: neckTilt, y: 0, z: 0 },
            limbCol
        );
        const headCY = neckCY + dirY * (neckLen * 0.5 + headR * 0.55);
        const headCZ = neckCZ + dirZ * (neckLen * 0.5 + headR * 0.55);
        add(headShape, headMat, 0, headCY, headCZ, headFull * 0.92, headFull * 0.86, headFull * 1.12, null, limbCol, {
            bodyRole: "head",
            eyeFront,
        });
        // MAUL/SCHNAUZE — nach vorn (rotation x≈1.5 → fast +z). Länge aus der Rolle: ein
        // Pflanzenfresser (eyeFront niedrig) trägt ein längeres Grasmaul, ein Jäger ein
        // kürzeres, tieferes (höhere Bisskraft). reference-first an den Tier-Fotos.
        const muzzleLen = headR * (1.05 + (1 - eyeFront) * 0.85);
        const muzzleW = headR * (0.95 - eyeFront * 0.1);
        add(
            snoutShape,
            headMat,
            0,
            headCY - headR * 0.16,
            headCZ + headR * 0.82,
            muzzleW,
            muzzleLen,
            muzzleW,
            { x: 1.5, y: 0, z: 0 },
            limbCol
        );

        // (5) SCHWANZ — im HECK VERANKERT (die Wurzel überlappt den Rumpf → kein schwebender
        //     Stummel, der reference-Fix), nach hinten-unten via segBetween (die Metaball-Haut
        //     verschmilzt ihn mit dem Körper).
        const tRootZ = -torsoLen * 0.62,
            tRootY = torsoH * 0.18; // Schwanz-Wurzel am HECK des langen Leibs
        // dicker Schwanz-ANSATZ (torsoH·0.2, tapert zur Spitze) → liest als Schwanz, der aus dem
        // Körper wächst, statt als dünner Stummel, den die Körper-Masse verschluckt. Der Ansatz
        // SITZT im Heck (überlappt die Hüft-Wirbel) → verbindet ohne Kneif.
        segBetween(0, tRootY, tRootZ, 0, tRootY - tailLen * 0.5, tRootZ - tailLen * 0.82, torsoH * 0.2);

        // (6) ACCESSOIRES — Hörner + Rücken-Kamm (symmetrisch/zentral → Template unverbogen).
        if (g.horns) {
            const hornShape = SH.horn || "cone";
            const hl = BL * af("hornFrac", 0.18);
            for (const sgnX of [-1, 1])
                add(
                    hornShape,
                    headMat,
                    sgnX * headR * 0.7,
                    headCY + headR * 1.0,
                    headCZ - headR * 0.2,
                    headR * 0.55,
                    hl,
                    headR * 0.55,
                    { x: -0.3, y: 0, z: sgnX * 0.3 },
                    limbCol
                );
        }
        if (g.crest) {
            const crestShape = SH.crest || "cone";
            for (let i = 0; i < 3; i++)
                add(
                    crestShape,
                    limbMat,
                    0,
                    torsoH * 0.45,
                    torsoLen * (0.2 - i * 0.2),
                    legR * 0.9,
                    legR * 2.4,
                    legR * 0.7,
                    null,
                    limbCol
                );
        }
        return parts;
    }

    // Dial→Archetyp-Achsen (axis = base + mul·dial, aufs deer-Paar geeicht;
    // die Lab-Slider-Semantik als DATEN — verbatim aus dem Stamm gewandert):
    //   neck→neckFrac · leg→legFrac (Einheiten-Brücke) · build→torsoW ·
    //   diet→eyeFront (Carnivor frontal, Herbivor lateral). BEWUSST unmapped:
    //   size (stats-tragende V18.208-Tarierung, kein Render-Dial).
    var DIAL_MAP = Object.freeze([
        Object.freeze({ dial: "neck", axis: "neckFrac", base: 0, mul: 1 }),
        Object.freeze({ dial: "leg", axis: "legFrac", base: 0, mul: 0.6 / 0.28 }),
        Object.freeze({ dial: "build", axis: "torsoW", base: 0, mul: 1 }),
        Object.freeze({ dial: "diet", axis: "eyeFront", base: 0.12, mul: 0.63 }),
    ]);

    // ULTRAGUSS U4 — DIE DIAL→TIER-ALLOMETRIE (verbatim aus dem Lab gewandert;
    // die EINE Quelle für Lab-Anatomie UND jeden künftigen Leser). Reine Mathe:
    // dials {size, neckLen, legLen, diet, build} → ~25 abgeleitete Größen
    // (Muskel-Skalierung ^0.67 · Schädel ^0.25 · Schnauze/Auge aus diet ·
    // Fell-Dichten · Farb-Triade). MESHFREI §8 — Zahlen, keine Meshes.
    // KONVERGENZ III — der CHOKEPOINT versteht BEIDE Wortschätze: das Studio-Buch
    // spricht kurz (neck/leg — GATTUNGEN/DIAL_MAP), die Lab-Slider lang (neckLen/
    // legLen); fehlende Dials fallen auf die Wolf-Referenz (NaN-Wand — nie mit
    // undefined rechnen, sonst kollabiert der Baum zu NaN-Matrizen).
    function deriveTierParams(d) {
        d = d || {};
        var fin = function (v, alt) {
            return typeof v === "number" && isFinite(v) ? v : alt;
        };
        var size = fin(d.size, 2.4),
            neckLen = fin(d.neckLen, fin(d.neck, 0.263)),
            legLen = fin(d.legLen, fin(d.leg, 0.22)),
            diet = fin(d.diet, 1),
            build = fin(d.build, 0.42);
        // die Potenz auf 1e-9 gerastert (S1 Wände, das Muster cc26c7d8 — wie skullR unten): die Bein-Muskel-Zahl trägt
        // das letzte Bit von pow sonst bis in die Gelenke des Ofens (Plattform-Probe: 2 Klassen kippten).
        var legMuscle = 0.42 * (Math.round(Math.pow(size / 2.4, 0.67) * 1e9) / 1e9) + (build - 0.5) * 0.3;
        legMuscle = Math.max(0.1, Math.min(0.9, legMuscle));
        // Der Hals-Winkel (Welle 5, Natur-Haltung im Stand): Wolf 35° (Kopf am Widerrist), Fuchs 43°, Hirsch 55°
        // (aufrecht), Bär 10° (tief) — vorher 8° + 55·Δ: der Hals lag waagrecht, der Kopf saß vorn AN der Brust.
        var neckAng = Math.max(5, Math.min(72, 35 + (neckLen - 0.263) * 300)),
            snoutZ = 1.5 + (1 - diet) * 0.35,
            snoutX = 0.92 - (1 - diet) * 0.25,
            eyeFwd = 0.05 + diet * 0.18,
            noseW = 2.0 - diet * 0.4;
        var bWF = 0.35 + build * 0.2,
            bellyD = 0.04 + build * 0.18,
            // die Potenz auf 1e-9 gerastert (S1 Wände, das Muster cc26c7d8): pow mit gebrochenem Exponenten rundet je V8
            // im letzten Bit anders (Node 22 der CI ≠ Node 24), und der Schädel-Radius trägt es bis in die Ohren des
            // Ofens (Plattform-Probe: fell/zahnfleisch an earL/earR von Fuchs und Hirsch kippten).
            skullR = 0.064 * (Math.round(Math.pow(size / 2.4, 0.25) * 1e9) / 1e9);
        // DIE FELL-TÖNE DER ART (Welle 5): Grund = basis, dunkel = Rücken-Sattel, hell = Bauch des Art-Musters
        // (vorher je Ernährung: Wolf und Fuchs trugen dasselbe Braun, der Hirsch das Braun eines Bären).
        var mu = artGestalt({ size: size, neckLen: neckLen, legLen: legLen, diet: diet, build: build }).muster;
        var hx = function (c) {
            return (Math.round(c[0]) << 16) | (Math.round(c[1]) << 8) | Math.round(c[2]);
        };
        var cB = hx(mu.basis),
            cD = hx(mu.ruecken),
            cL = hx(mu.bauch),
            base = "#" + ("000000" + hx(mu.ruecken).toString(16)).slice(-6);
        var guardL = 0.025 + build * 0.02,
            underL = 0.01 + build * 0.01,
            gDens = Math.round(30000 + build * 30000),
            uDens = Math.round(15000 + build * 14000),
            maneCount = Math.round(2000 * diet),
            maneLen = 0.16;
        return {
            size: size,
            neckLen: neckLen,
            neckAng: neckAng,
            legLen: legLen,
            legMuscle: legMuscle,
            diet: diet,
            build: build,
            snoutZ: snoutZ,
            snoutX: snoutX,
            eyeFwd: eyeFwd,
            noseW: noseW,
            bWF: bWF,
            bellyD: bellyD,
            skullR: skullR,
            cB: cB,
            cD: cD,
            cL: cL,
            base: base,
            guardL: guardL,
            underL: underL,
            gDens: gDens,
            uDens: uDens,
            maneCount: maneCount,
            maneLen: maneLen,
            throat: 0.15 + diet * 0.1,
        };
    }

    // ULTRAGUSS U4 — DER CPG-PHASEN-SCHRITT (das Gang-Netz-Gesetz, verbatim aus
    // dem Lab): phases[4] werden über die Kopplungs-Matrix + Gain 0.8 fortgeschrieben.
    // ═══════════════════════════════════════════════════════════════════════
    // DIE FELL-STREU (V18.460) — DAS LOOK-GESETZ ALS DATEN: die komplette
    // Körper-Streu des Labs (Bein-Lokale/Tuben · Bauch/Brust/Hüft-Fuzz ·
    // Kehle/Mähne/Nacken-Akzente · Torso-Deckhaar) als ZEILEN-Tabelle.
    // fellStreu(P, M, O) → rows [{teil, c:[x,y,z], r, sc:[3], d:[3], n, l, t, ton}]
    //   O = bauTier(…).fellOrt (Lage und Größe der Körper-Teile: Rumpf-Stationen, Hals, Glied-Dicke der Art,
    //   Kehle/Mähne/Schädel) — die Zeilen sitzen auf der Anatomie der Art, nie auf festen Radien des alten
    //   Lab-Rumpfs (Integration W5-Körper: der Bär-Rumpf und der Hirsch-Hals lagen sonst neben ihren Zeilen).
    //   teil = Gelenk-/Teil-Name (Streu-Wirt) · c = Zentrum (teil-lokal) ·
    //   r = Basis-Radius · sc = Ellipsoid-Skala · d = Legerichtung ·
    //   n = Strähnen-Zahl · l/t = Länge/Dicke · ton = "B"|"D"|"L" (cB/cD/cL).
    // KONSUMENTEN: das Lab (addFurLocal je Zeile — sein Look, seine Materialien)
    // UND der Pipe-Bäcker (deterministische Streu mit Wurzel→Spitze-Farbverlauf
    // als Vertex-Daten). MESHFREI §8: reine Zahlen, kein Mesh. Die Tuben des
    // Labs sind vor-entrollt (Scheiben-Zeilen — dieselbe Mathe wie addFurTube).
    function fellStreu(P, M, O) {
        if (!O || !O.rumpf || !O.hals || !O.glied) throw new Error("fellStreu: der Fell-Ort des Baus fehlt (bauTier.fellOrt)");
        var H = M.H,
            lv = M.lv,
            bt = M.bt;
        // DIE FELL-LÄNGE DER ART (Welle 5): die Haar-Längen waren absolute Lab-Zahlen (Wolf-Maß) — der Fuchs trug
        // relativ zu lange, der Bär zu kurze Haare; jetzt × H/2,4 und × die Fell-Länge der Art (der Bär trägt
        // zottiges Fell, der Hirsch glattes Sommerhaar).
        var k = H / 2.4,
            kl = k * artGestalt(P).fell.lang;
        var rows = [];
        var R = function (teil, cx, cy, cz, r, sx, sy2, sz, dx, dy, dz, n, l, t, ton) {
            rows.push({
                teil: teil,
                c: [cx, cy, cz],
                r: r,
                sc: [sx, sy2, sz],
                d: [dx, dy, dz],
                n: n,
                l: l * kl,
                t: t * k,
                ton: ton || "B",
            });
        };
        var tube = function (teil, vx, vy, vz, rTop, rBot, sx, sy2, sz, dx, dy, dz, total, l, t, ox, oy, oz) {
            var n = Math.max(6, Math.ceil(total / 60));
            var per = Math.ceil(total / n);
            for (var i = 0; i < n; i++) {
                var fr = (i + 0.5) / n;
                var r = rTop * (1 - fr) + rBot * fr;
                R(
                    teil,
                    vx * fr + (ox || 0),
                    vy * fr + (oy || 0),
                    vz * fr + (oz || 0),
                    r,
                    sx,
                    sy2,
                    sz,
                    dx,
                    dy,
                    dz,
                    per,
                    l,
                    t,
                    "B"
                );
            }
        };
        // Die Glied-Dicke der Art (bauTier: proximal × √Dicke, distal × Dicke × distal) — jede Bein-Zeile sitzt auf
        // dem Fleisch, das sie bedeckt (vorher die Wolf-Radien: die Bär-Läufe trugen ihre Zeilen im Inneren).
        var gp = O.glied.p,
            gd = O.glied.d;
        // ── Vorderbein-Achsen (verbatim Lab-Formeln) ──
        var humLen = P.legLen * H,
            humAng = (25 * Math.PI) / 180;
        var humF = [0, -humLen * Math.cos(humAng), -humLen * Math.sin(humAng)];
        var radLen = P.legLen * 1.45 * H,
            radAng = (10 * Math.PI) / 180;
        var radF = [0, -radLen * Math.cos(radAng), radLen * Math.sin(radAng)];
        var metaLen = P.legLen * 0.91 * H,
            metaAng = (15 * Math.PI) / 180;
        var metaF = [0, -metaLen * Math.cos(metaAng), metaLen * Math.sin(metaAng)];
        ["legFL", "legFR"].forEach(function (g) {
            R(g, 0, 0.04 * H, 0, 0.085 * H * gp, 1.1, 1.32, 1.05 * lv, 0, 0.02, -0.8, 1000, 0.032, 0.006);
            R(g, 0, 0.075 * H, 0, 0.035 * H * gp, 1.05, 1.0, 1.0 * lv, 0, 0.02, -0.8, 250, 0.032, 0.006);
        });
        ["flU", "frU"].forEach(function (g) {
            tube(
                g,
                humF[0],
                humF[1],
                humF[2],
                0.1 * H * gp,
                0.055 * H * Math.pow(bt, 0.4) * gp,
                0.9,
                1.0,
                0.65,
                0,
                0.02,
                -0.8,
                1500,
                0.032,
                0.006
            );
            R(
                g,
                humF[0],
                humF[1],
                humF[2],
                0.045 * H * Math.pow(bt, 0.4) * gd,
                1.3,
                0.6,
                1.0,
                0,
                -0.02,
                -0.78,
                250,
                0.028,
                0.006
            );
        });
        ["flL", "frL"].forEach(function (g) {
            tube(
                g,
                radF[0],
                radF[1],
                radF[2],
                0.055 * H * Math.pow(bt, 0.4) * gd,
                0.035 * H * Math.pow(bt, 0.8) * gd,
                0.9,
                1.0,
                0.55,
                0,
                -0.02,
                -0.8,
                1000,
                0.028,
                0.006
            );
        });
        ["flP", "frP"].forEach(function (g) {
            R(
                g,
                metaF[0] * 0.5,
                metaF[1] * 0.5,
                metaF[2] * 0.5,
                0.045 * H * Math.pow(bt, 0.8) * gd,
                1.0,
                1.6,
                0.8,
                0,
                -0.05,
                -0.7,
                400,
                0.024,
                0.005
            );
        });
        // ── Hinterbein-Achsen ──
        var femLen = P.legLen * 1.27 * H,
            femAng = (35 * Math.PI) / 180;
        var femF = [0, -femLen * Math.cos(femAng), femLen * Math.sin(femAng)];
        var tibLen = P.legLen * 1.73 * H,
            tibAng = (45 * Math.PI) / 180;
        var tibF = [0, -tibLen * Math.cos(tibAng), -tibLen * Math.sin(tibAng)];
        var metaTLen = P.legLen * 1.18 * H,
            metaTAng = (5 * Math.PI) / 180;
        var metaTF = [0, -metaTLen * Math.cos(metaTAng), metaTLen * Math.sin(metaTAng)];
        ["legHL", "legHR"].forEach(function (g) {
            R(g, 0, 0.03 * H, -0.02 * H, 0.08 * H * 1.35 * gp, 1.1, 1.1 * lv, 1.22 * lv, 0, 0.05, -0.78, 1200, 0.032, 0.006);
            R(g, 0, 0.06 * H, -0.02 * H, 0.05 * H * 1.35 * gp, 1.15, 1.1 * lv, 1.15 * lv, 0, 0.1, -0.75, 700, 0.03, 0.006);
            R(g, 0, 0.06 * H, -0.02 * H, 0.03 * H * 1.35 * gp, 1.05, 1.1 * lv, 1.0 * lv, 0, 0.05, -0.78, 300, 0.032, 0.006);
        });
        ["hlT", "hrT"].forEach(function (g) {
            tube(
                g,
                femF[0],
                femF[1],
                femF[2],
                0.1 * H * gp,
                0.055 * H * Math.pow(bt, 0.4) * gp,
                0.9,
                1.0,
                0.7,
                0,
                -0.05,
                -0.75,
                1800,
                0.032,
                0.006
            );
            R(
                g,
                femF[0],
                femF[1],
                femF[2],
                0.045 * H * Math.pow(bt, 0.4) * gp,
                1.3,
                0.6,
                1.0,
                0,
                -0.05,
                -0.73,
                300,
                0.028,
                0.006
            );
            R(g, 0, 0, 0.045 * H, 0.055 * H * gp, 0.55, 1.1, 0.45, 0, 0.05, -0.75, 500, 0.032, 0.006);
            tube(
                g,
                femF[0],
                femF[1],
                femF[2],
                0.08 * H * gp,
                0.04 * H * gp,
                0.8,
                1.0,
                0.8,
                0,
                -0.05,
                -0.75,
                800,
                0.032,
                0.006,
                0,
                0,
                -0.026 * H
            );
        });
        ["hlC", "hrC"].forEach(function (g) {
            tube(
                g,
                tibF[0],
                tibF[1],
                tibF[2],
                0.055 * H * Math.pow(bt, 0.4) * gd,
                0.035 * H * Math.pow(bt, 0.8) * gd,
                0.9,
                1.0,
                0.5,
                0,
                -0.05,
                -0.75,
                1000,
                0.028,
                0.006
            );
            R(
                g,
                tibF[0],
                tibF[1],
                tibF[2],
                0.04 * H * Math.pow(bt, 0.4) * gd,
                1.3,
                0.6,
                1.0,
                0,
                -0.05,
                -0.72,
                250,
                0.028,
                0.006
            );
        });
        ["hlP", "hrP"].forEach(function (g) {
            R(
                g,
                metaTF[0] * 0.5,
                metaTF[1] * 0.5,
                metaTF[2] * 0.5,
                0.045 * H * Math.pow(bt, 0.8) * gd,
                1.0,
                1.6,
                0.8,
                0,
                -0.05,
                -0.7,
                400,
                0.024,
                0.005
            );
        });
        // ── Rumpf-Fuzz (Wurzel-Koordinaten — teil "wolf") auf den Rumpf-Stationen des Baus: jede Zeile sitzt auf der
        //    Station, die ihren Körper-Ort trägt (Bauch · Unterbauch · Flanke · Becken · Kruppe), mit deren Ellipsoid —
        //    vorher Radien des alten Lab-Rumpf-Sacks (0,28–0,3 H; der Wolf-Rumpf ist heute 0,11–0,15 H breit) und
        //    Seiten-Büschel an Lab-Kugeln, die es nicht mehr gibt (Becken/Kruppe ±0,06 H: hier je ein Paar, gleiche
        //    Strähnen-Zahl auf der Station).
        var fD = [0, -0.5, -0.2],
            fO = [0, 0.04, -0.78];
        var auf = function (ort, d, n, l, t) {
            R("wolf", ort.c[0], ort.c[1], ort.c[2], 1, ort.r[0], ort.r[1], ort.r[2], d[0], d[1], d[2], n, l, t);
        };
        var Ru = O.rumpf;
        auf(Ru.bauch, fD, 800, 0.024, 0.006);
        auf(Ru.unterbauch, fD, 600, 0.022, 0.006);
        auf(Ru.flanke, fD, 300, 0.022, 0.005);
        auf(Ru.becken, fO, 800, 0.028, 0.006);
        auf(Ru.kruppe, fO, 700, 0.028, 0.006);
        auf(Ru.kruppe, fO, 500, 0.03, 0.006);
        auf(Ru.becken, fO, 500, 0.03, 0.006);
        // ── Torso-DECKHAAR als DATEN-Zeile (art "deck"): das GESETZ sind die
        //    Dichten/Längen/Töne (P.uDens/underL · P.gDens/guardL + Akzent-Quoten);
        //    die COVERAGE-Technik ist Leser-Sache — das Lab deckt über seinen
        //    Guide-Mesh-Bäcker (Benchmark unbewegt), der Ofen legt den Mantel
        //    gleichmäßig auf die Haut der Wurzel (Strähnen je Fläche).
        rows.push({
            art: "deck",
            uDens: P.uDens || 3000,
            underL: (P.underL || 0.05) * kl,
            gDens: P.gDens || 2200,
            guardL: (P.guardL || 0.09) * kl,
            dunkelQuote: 0.2,
            hellQuote: 0.1,
            d: fO,
        });
        // ── Kehle/Mähne/Nacken/Schädel-Akzente ──
        R(
            "wolf",
            O.throat[0],
            O.throat[1] - 0.02 * H,
            O.throat[2],
            0.05 * H,
            1.0,
            0.8,
            1.2,
            0,
            -0.3,
            -0.6,
            600,
            0.05,
            0.007,
            "D"
        );
        R(
            "wolf",
            O.throatLower[0],
            O.throatLower[1] - 0.015 * H,
            O.throatLower[2],
            0.045 * H,
            1.0,
            0.8,
            1.2,
            0,
            -0.3,
            -0.6,
            500,
            0.045,
            0.007,
            "D"
        );
        if (P.maneCount > 0)
            R(
                "wolf",
                O.mane[0],
                O.mane[1],
                O.mane[2],
                0.062 * H,
                0.85,
                0.7,
                1.38,
                0,
                0.15,
                -0.65,
                P.maneCount,
                P.maneLen,
                0.011,
                "D"
            );
        // Der Hals-Mantel liegt als Röhre ENTLANG des Halses (Ansatz → Kopf, Radius des Halses an Wurzel und Spitze):
        // vorher EINE Zeile an der Hals-Mitte mit 0,1 H — der Hirsch-Hals (1,7× lang, schmaler) trug sie nur in der Mitte.
        var Hs = O.hals;
        tube(
            "wolf",
            Hs.ende[0] - Hs.start[0],
            Hs.ende[1] - Hs.start[1],
            Hs.ende[2] - Hs.start[2],
            Hs.r[0],
            Hs.r[Hs.r.length - 1],
            0.9,
            0.94,
            0.94,
            fO[0],
            fO[1],
            fO[2],
            800,
            0.1,
            0.009,
            Hs.start[0],
            Hs.start[1],
            Hs.start[2]
        );
        R(
            "headGroup",
            O.cranium[0],
            O.cranium[1],
            O.cranium[2],
            P.skullR * H,
            0.95,
            0.96,
            1.26,
            0,
            0.04,
            -0.78,
            30,
            0.03,
            0.005,
            "D"
        );
        return rows;
    }

    // ════════════════════════════════════════════════════════════════════
    // DAS GANG-GESETZ (Welle 5, „Gang ohne Gleiten"): der Fuß im Stand steht still auf dem Boden. Die Schritt-Länge je
    // Zyklus wächst mit der relativen Geschwindigkeit (Froude v̂ = v/√(g·L), L = Hüft-Höhe): Λ = L·(1,2 + 2·v̂), gedeckelt
    // durch den größten Bein-Winkel; der Fuß fegt im Stand (Tastgrad 0,5) die halbe Schritt-Länge S, die Frequenz folgt
    // dem Weg (ω = 2π·v/Λ) — vorher lief der Takt aus dem Gefühls-Profil (Freude 3,2 rad/s, Schritt 0,06 rad) bei jeder
    // Geschwindigkeit: die Pfoten glitten mit dem Leib (Schlupf 1,0, gate:tier-gang). gangFuss liest je Bein das ZIEL
    // des Fußes zur Phase: im STAND (π…2π) wandert er am Boden gleichförmig von vorn (+S/2) nach hinten (−S/2), im
    // SCHWUNG (0…π) kehrt er auf einer Hermite-Kurve nach vorn, die an beiden Enden mit der Stand-Rate rückwärts läuft
    // (kein Vorwärts-Rutschen beim Aufsetzen), gehoben um hub·h·sin(Phase). Hüfte und Unterglied stellt der Wirt per
    // ebener Zwei-Knochen-IK auf dieses Ziel (die Pfote bleibt waagrecht) — der Fuß steht, wo das Gesetz ihn hinstellt.
    var GANG_GESETZ = Object.freeze({
        g: 9.81,
        schrittBasis: 1.2,
        schrittFroude: 2.0,
        tastgrad: 0.5,
        maxWinkel: 0.42, // rad — die größte Bein-Auslenkung (deckelt die Schritt-Länge)
        hub: 0.12, // × h — die Schwung-Höhe des Fußes
        falte: 0.6, // rad — die Pfote faltet im Schwung
        stand: 0.05, // m/s — darunter steht das Tier
        vMax: 15, // m/s — Sprünge der Lage (Spawn, Peer-Schnapp) sind kein Lauf
    });
    function gangSchritt(v, L) {
        var G = GANG_GESETZ;
        if (!(v > G.stand) || !(L > 0)) return { omega: 0, S: 0, schritt: 0 };
        var vv = Math.min(v, G.vMax);
        var vh = vv / Math.sqrt(G.g * L);
        var lamMax = (2 * L * Math.tan(G.maxWinkel)) / G.tastgrad;
        var lam = Math.min(L * (G.schrittBasis + G.schrittFroude * vh), lamMax);
        return { omega: (2 * Math.PI * vv) / lam, S: G.tastgrad * lam, schritt: lam };
    }
    // Das Fuß-Ziel EINES Beins zur Phase ph (rad) bei Fußweg S (m): {dz (m, + = vor der Ruhe-Lage), hub (0…1)}.
    function gangFuss(ph, S) {
        var TAU = 2 * Math.PI;
        var u = ((ph % TAU) + TAU) % TAU;
        if (u >= Math.PI) return { dz: S / 2 - (S * (u - Math.PI)) / Math.PI, hub: 0 };
        // Hermite von −S/2 (Abheben hinten) nach +S/2 (Aufsetzen vorn), beide Enden mit der Stand-Rate (rückwärts)
        var t = u / Math.PI,
            m = -S;
        var h00 = 2 * t * t * t - 3 * t * t + 1,
            h10 = t * t * t - 2 * t * t + t,
            h01 = -2 * t * t * t + 3 * t * t,
            h11 = t * t * t - t * t;
        return { dz: (h00 * -S) / 2 + h10 * m + (h01 * S) / 2 + h11 * m, hub: Math.sin(u) };
    }

    // ════════════════════════════════════════════════════════════════════
    // DAS STEUER-GESETZ (Welle L, additiv): EIN Steuer-Schritt je Tier und Takt. Befund der Leben-Prüfung 06.10.: die
    // Tiere liefen im Krebsgang (Lauf ↔ Blick p50 63–108°, rückwärts 30–59 % der Frames, Stand-Schlupf 1,3–2,6), weil
    // niemand die Gier schrieb, und Folgen war Gas oder Bremse (4 m/s oder 0, Tempo-Sprünge ~290 m/s²). Der Wunsch
    // (Welt-XZ, m/s) dreht die Gier mit der Wendegrenze auf sich zu; der Leib läuft nur VORWÄRTS längs seiner Gier, mit
    // dem Anteil des Wunschs, der vor ihm liegt (dreht er um, bremst er erst); das Tempo folgt mit Anfahr- und Brems-
    // Grenze. Jede Größe ist Froude-dimensionslos über die Hüft-Höhe L (dieselbe L, an der das Gang-Gesetz die Schritt-
    // Länge misst): Wende ω = wende·√(g/L), Anfahren beschl·g, Bremsen brems·g, die Tempo-Einheit des Verhaltens
    // tempo·√(g·L) m/s (VERHALTEN zählt in ihr: Schlendern 0,45, Jagd 1,45, Flucht 1,6) — ein großes Tier läuft schneller
    // und wendet träger, die Art unterscheidet die Gestalt, nie ein Tag (Lehre 8). Rein, THREE-frei; der Welt-Wirt ruft
    // ihn je Tier, die Gier reist im Positions-Strom zum Mitspieler.
    var STEUER_GESETZ = Object.freeze({
        tempo: 0.34, // v̂ — die Tempo-Einheit des Verhaltens als Froude-Zahl (ein Schritt; Hirsch L 0,9 m ≈ 1 m/s)
        wende: 1.1, // × √(g/L) rad/s — die Wendegrenze (Hirsch: ~3,6 rad/s)
        beschl: 0.5, // × g — Anfahren (m/s²)
        brems: 0.8, // × g — Bremsen (m/s²); der Ankunfts-Weg liest dieselbe Zahl
    });
    // Die Tempo-Einheit in m/s für die Hüft-Höhe L (m).
    function tempoEinheit(L) {
        return STEUER_GESETZ.tempo * Math.sqrt(GANG_GESETZ.g * Math.max(0.05, L));
    }
    // z = {gier (rad, three: Blick längs (sin, cos)), v (m/s, vorwärts)} wird fortgeschrieben; (wx, wz) der Wunsch in m/s.
    function steuerSchritt(z, wx, wz, dt, L) {
        var S = STEUER_GESETZ,
            g = GANG_GESETZ.g,
            TAU = 2 * Math.PI;
        var w = Math.sqrt(wx * wx + wz * wz);
        var rest = 0;
        if (w > 1e-4) {
            var d = Math.atan2(wx, wz) - z.gier;
            d -= TAU * Math.round(d / TAU);
            var maxD = S.wende * Math.sqrt(g / Math.max(0.05, L)) * dt;
            var dd = d > maxD ? maxD : d < -maxD ? -maxD : d;
            z.gier += dd;
            z.gier -= TAU * Math.round(z.gier / TAU);
            rest = d - dd;
        }
        var ziel = w * Math.max(0, Math.cos(rest));
        var dv = ziel - z.v,
            auf = S.beschl * g * dt,
            ab = S.brems * g * dt;
        z.v += dv > auf ? auf : dv < -ab ? -ab : dv;
        if (!(z.v > 0)) z.v = 0;
        return z;
    }
    // DAS ANKUNFTS-GESETZ: wer `rest` Meter vor seinem Halt steht, wünscht nur das Tempo, aus dem er mit der Brems-Grenze
    // dort steht (√(2·brems·g·rest)), höchstens vMax — kein 4-oder-0.
    function ankunftTempo(rest, vMax) {
        return Math.min(vMax, Math.sqrt(2 * STEUER_GESETZ.brems * GANG_GESETZ.g * Math.max(0, rest)));
    }
    // DIE HERDEN-FORM (Welle L, additiv): der Zug der Kohaesion auf ein Tier an (x, z) — er zaehlt nur Nachbarn DERSELBEN
    // Gattung (die Art unterscheidet die Gestalt, nie ein Tag; Lehre 8) und haengt nie am Blick des Spielers (der Wirt
    // ruft ihn fuer jedes Tier). Die Leben-Pruefung 06.10. sah artfremde Nachbarn (Fuchs zieht Hirsch) und eine Kohaesion
    // nur im Frustum. Das Herden-VERHALTEN (Verband, Anker, Ausrichtung) ist nach v1.0 — dies ist die Form, die es traegt.
    // nachbarn: [{x, z, gattung}] (Kandidaten im Gitter des Wirts), H = VERHALTEN.herde. Liefert {x, z, n} (n Mitglieder).
    function herdeZug(x, z, gattung, nachbarn, H, out) {
        var o = out || { x: 0, z: 0, n: 0 };
        o.x = 0;
        o.z = 0;
        o.n = 0;
        for (var i = 0; i < nachbarn.length && o.n < H.maxNachbarn; i++) {
            var nb = nachbarn[i];
            if (!nb || nb.gattung !== gattung) continue;
            var dx = nb.x - x,
                dz = nb.z - z;
            var dsq = dx * dx + dz * dz;
            if (!(dsq > H.minAbstSq && dsq < H.fensterSq)) continue;
            var d = Math.sqrt(dsq);
            o.x += (dx / d) * H.gewicht;
            o.z += (dz / d) * H.gewicht;
            o.n++;
        }
        return o;
    }

    // DAS TEMPERAMENT DER GATTUNG (Welle LF 08.10., additiv): g = die Dials der Gattung (GATTUNGEN, diet · size), bs = die
    // Koerpergroesse des Tiers, T = VERHALTEN.temperament.gattung. Liefert "wild" · "wehrhaft" · "sanft" · "scheu" — die
    // Art und die Groesse unterscheiden das Gemuet, nie ein Tag (Lehre 8).
    function temperamentDerGattung(g, bs, T) {
        var masse = g.size * (bs > 0 ? bs : 1);
        if (g.diet >= T.fleischDiet) return masse >= T.jagdMasse ? "wild" : "scheu";
        if (g.diet <= T.pflanzDiet) return masse >= T.kolossMasse ? "wehrhaft" : "scheu";
        return masse >= T.wehrMasse ? "wehrhaft" : "sanft";
    }

    function cpgStep(phases, freq, coupling, dt) {
        var d = [0, 0, 0, 0];
        for (var i = 0; i < 4; i++) {
            var c = 0;
            for (var j = 0; j < 4; j++) c += coupling[i][j] * Math.sin(phases[j] - phases[i]);
            d[i] = freq + c * 0.8;
        }
        for (var k = 0; k < 4; k++) phases[k] += d[k] * dt;
        return phases;
    }

    // KONVERGENZ III — die Tier-Materialfarben (verbatim aus buildAnimal Z.137):
    // `seh` (Integration W8, additiv): die Seh-Klasse des Stoffs (phyto-core BUDGET_GESETZ.seh) — das Budget-Gesetz
    // faltet nur innerhalb EINER (das Auge nie in die Nase, die Nase nie ins Fell); Fell · Strähne · Schale sind haar.
    var TIER_MATERIAL_KLASSEN = Object.freeze({
        nase: Object.freeze({ c: 0x060606, r: 0.1, seh: "haut" }),
        // Die Iris-Farbe trägt die Art (ART_GESTALT.kopf.auge, gelesen über tierAuge); glut = der Anteil dieser Farbe,
        // der glüht (das Lab-Verhältnis 0x44 : 0xee im Rot), ei = die Glut-Stärke.
        tierauge: Object.freeze({ r: 0.06, glut: 0.29, ei: 0.3, seh: "auge" }),
        pupille: Object.freeze({ c: 0x000000, r: 0.2, seh: "auge" }),
        hornhaut: Object.freeze({ c: 0xffffff, r: 0, seh: "auge" }),
        klaue: Object.freeze({ c: 0x181818, r: 0.2, seh: "stoff" }),
        ballen: Object.freeze({ c: 0x161616, r: 0.45, seh: "haut" }),
        zahn: Object.freeze({ c: 0xeeeeee, r: 0.18, seh: "stoff" }),
        zahnfleisch: Object.freeze({ c: 0x060606, r: 0.5, seh: "haut" }),
        dunkel: Object.freeze({ c: 0x040000, r: 0.9, seh: "stoff" }),
    });

    // ════════════════════════════════════════════════════════════════════
    // DER FELL-LOOK (Konsum-Tiefe, 19.07., rein additiv) — das SHADER-Gesetz
    // der Lab-Materialien als DATEN (verbatim-Zahlen aus tetrapoda.js:
    // matFur `wolf_aureus_v22` [Körper-Fell: SSS-Rim pow4 ×0.5 + Gold-Sheen
    // pow5 ×0.15] und createDeepFurMat `deep_gold_fur_v3` [Strähnen: Spitzen-
    // Rim pow3 + Gold-Spec pow8 ×0.4 über der Wurzel→Spitze-Achse]).
    // KONSUMENTEN: der Welt-Material-Resolver webt sie als Post-Licht-Additive
    // (dieselbe GLSL-Addition der Labs); die Strähnen-Achse reist als
    // Farbverlauf (__streuGeo: Wurzel = Ton×0.12). MESHFREI §8: reine Zahlen.
    var FELL_LOOK = Object.freeze({
        koerper: Object.freeze({
            rimPow: 4,
            rimFarbe: Object.freeze([0.55, 0.25, 0.07]),
            rimAmt: 0.5,
            sheenPow: 5,
            sheenAmt: 0.15,
            sheenFarbe: Object.freeze([0.45, 0.25, 0.08]),
            // Vollendung (19.07.): Wrap-Licht ·(0.5+0.5·NdotV), Atem-Noise-
            // Displacement (snoise(pos·1.4 + t·0.14)·0.007) und der microFur-
            // Sparkle (hash-Raster ×500, Schwelle 0.55, Rim³ ×0.3) — verbatim
            // aus matFur `wolf_aureus_v22`.
            wrap: 0.5,
            atem: Object.freeze({ freq: 1.4, amp: 0.007, t: 0.14 }),
            microFur: Object.freeze({
                dichte: 500,
                schwelle: 0.55,
                farbe: Object.freeze([0.7, 0.35, 0.1]),
                amt: 0.3,
            }),
        }),
        straehne: Object.freeze({
            tipRimPow: 3,
            tipRimFarbe: Object.freeze([0.55, 0.28, 0.07]),
            specPow: 8,
            specAmt: 0.4,
            specFarbe: Object.freeze([0.5, 0.25, 0.06]),
            wurzelAnker: 0.12,
        }),
    });

    // ════════════════════════════════════════════════════════════════════
    // DER MASSSTAB (Welle 5, die EINE Welt-Größe): eine Lab-Einheit ist ein Drittel Meter — der Wolf (Größe 2,4)
    // trägt seinen Widerrist bei ~1,0 H = 0,8 m, der Fuchs (1,5) bei ~0,47 m, der Bär (3,2) bei ~1,1 m, der Hirsch
    // (2,8) bei ~1,07 m. Der Wirt skaliert die Gestalt mit DIESER Zahl (vorher: die Seelen-Teile-Höhe, deren Skala
    // die Allometrie-Schleife überschrieb — die Welt zeigte Lab-Einheiten als Meter, den Wolf 2,7 m hoch).
    var MASSSTAB = Object.freeze({ meterJeEinheit: 1 / 3 });

    // ════════════════════════════════════════════════════════════════════
    // DIE ART-GESTALT (Welle 5, Tour 09: „der Rumpf ist ein Sack auf dünnen Beinen"): die Anatomie je Art als
    // DATEN, gemessen an der Natur (Widerrist W; Wolf: Brusttiefe 0,48 W, Rumpf 1,15 W, Bauch-Aufzug bei 0,68 W,
    // Unterarm 0,08 W, Kopf am Widerrist; Fuchs: Rumpf 1,4 W, Rute 0,9 W buschig, Ohren 0,2 W; Bär: Buckel über
    // dem Widerrist, Rumpf breit und tief, Glieder 1,7×, Sohlen-Pranke; Hirsch: Hals 55° aufrecht, flacher Aufzug,
    // Hufe, Wedel). Der Rumpf ist kein Ellipsoid-Haufen an festen Lab-Koordinaten mehr (sie skalierten nicht mit H:
    // jede Art außer dem Wolf war verzerrt), sondern ein PROFIL über der Bein-Linie: u = 0 Sitzbein … 1 Bug, je
    // Station Oberlinie `oben`, Unterlinie `unten` (×H über/unter der Linie der Bein-Gelenke) und halbe `breit`e.
    // Die Arten mischen sich über die fünf Dials (artGestalt): ein Preset trägt seine Art zu > 99,9999 % (der Rest der
    // Nachbar-Arten liegt unter 1e-6, etwa 7e-7 Fuchs im Wolf — die Gauß-Gewichte schneiden nie hart), die Lab-Regler
    // gleiten stetig zwischen ihnen. Diskrete Merkmale (Pfote, Ohr-Form) nimmt die stärkste Art.
    // prettier-ignore
    var ART_GESTALT = Object.freeze({
        wolf: Object.freeze({
            rumpf: { lang: 0.93, vor: 0.13, hinter: 0.17,
                oben:  [0.09, 0.15, 0.19, 0.205, 0.205, 0.215, 0.235, 0.27, 0.285, 0.24, 0.12],
                unten: [-0.08, -0.12, -0.1, -0.06, -0.07, -0.11, -0.16, -0.19, -0.185, -0.14, -0.04],
                breit: [0.08, 0.12, 0.135, 0.12, 0.11, 0.125, 0.14, 0.145, 0.135, 0.11, 0.075] },
            bein: { dicke: 1.0, distal: 1.1, pfote: "zehe", pfoteGross: 1.55, kralle: 1.0 },
            hals: { dicke: 1.2, lang: 1.0 },
            kopf: { gross: 1.0, nase: 1.0, ohrForm: "spitz", ohrH: 0.1, ohrB: 0.03, schnauzeL: 1.0, schnauzeB: 1.0, schnauzeH: 1.0,
                schaedelB: 1.0, schaedelH: 1.0, auge: [214, 160, 40] },
            schwanz: { segs: 8, segL: 0.042, wurzel: 0.034, mitte: 0.045, spitze: 0.024, hang: 0.55, fell: 1.6 },
            fell: { lang: 1.5 },
            // Grauwolf: Agouti-Sattel dunkel, Flanken grau-lohfarben, Kehle/Bauch/Wangen cremeweiß, Läufe lohfarben,
            // die Rutenspitze schwarz.
            muster: { basis: [146, 132, 112], ruecken: [86, 80, 72], bauch: [214, 204, 184], beine: [172, 146, 108],
                maske: [212, 202, 184], spitze: [38, 34, 30], ohr: [104, 92, 78], spiegel: [146, 132, 112] },
        }),
        fox: Object.freeze({
            rumpf: { lang: 1.18, vor: 0.12, hinter: 0.15,
                oben:  [0.08, 0.14, 0.18, 0.195, 0.195, 0.2, 0.215, 0.245, 0.255, 0.215, 0.11],
                unten: [-0.07, -0.11, -0.09, -0.055, -0.065, -0.1, -0.15, -0.175, -0.17, -0.13, -0.04],
                breit: [0.068, 0.1, 0.115, 0.1, 0.093, 0.105, 0.118, 0.123, 0.115, 0.093, 0.064] },
            bein: { dicke: 0.85, distal: 1.4, pfote: "zehe", pfoteGross: 1.4, kralle: 0.9 },
            hals: { dicke: 1.1, lang: 1.0 },
            kopf: { gross: 1.0, nase: 1.0, ohrForm: "spitz", ohrH: 0.15, ohrB: 0.042, schnauzeL: 1.12, schnauzeB: 0.82, schnauzeH: 0.9,
                schaedelB: 0.92, schaedelH: 0.95, auge: [206, 128, 30] },
            schwanz: { segs: 10, segL: 0.058, wurzel: 0.04, mitte: 0.075, spitze: 0.045, hang: 0.3, fell: 2.4 },
            fell: { lang: 1.6 },
            // Rotfuchs: rostrot, Kehle/Brust/Bauch/Wangen weiß, schwarze „Strümpfe", schwarze Ohr-Rücken, weiße
            // Rutenspitze.
            muster: { basis: [186, 88, 34], ruecken: [168, 76, 30], bauch: [236, 228, 212], beine: [46, 34, 28],
                maske: [236, 230, 216], spitze: [238, 234, 224], ohr: [38, 30, 26], spiegel: [186, 88, 34] },
        }),
        bear: Object.freeze({
            rumpf: { lang: 1.05, vor: 0.16, hinter: 0.2,
                oben:  [0.1, 0.17, 0.21, 0.22, 0.23, 0.25, 0.29, 0.345, 0.355, 0.29, 0.14],
                unten: [-0.07, -0.12, -0.16, -0.18, -0.2, -0.22, -0.235, -0.245, -0.235, -0.18, -0.06],
                breit: [0.12, 0.18, 0.2, 0.2, 0.2, 0.21, 0.22, 0.22, 0.21, 0.17, 0.11] },
            bein: { dicke: 1.7, distal: 1.0, pfote: "sohle", pfoteGross: 1.9, kralle: 3.2 },
            hals: { dicke: 1.3, lang: 0.9 },
            kopf: { gross: 1.45, nase: 0.72, ohrForm: "rund", ohrH: 0.045, ohrB: 0.03, schnauzeL: 0.78, schnauzeB: 1.35, schnauzeH: 1.3,
                schaedelB: 1.25, schaedelH: 1.0, auge: [62, 38, 20] },
            schwanz: { segs: 2, segL: 0.03, wurzel: 0.035, mitte: 0.035, spitze: 0.025, hang: 0.25, fell: 1.2 },
            fell: { lang: 2.0 },
            // Braunbär: dunkelbraun, die Läufe dunkler, der Fang heller, kein heller Bauch.
            muster: { basis: [96, 64, 40], ruecken: [86, 58, 38], bauch: [74, 50, 34], beine: [56, 38, 26],
                maske: [132, 98, 64], spitze: [96, 64, 40], ohr: [82, 56, 36], spiegel: [96, 64, 40] },
        }),
        deer: Object.freeze({
            rumpf: { lang: 0.97, vor: 0.11, hinter: 0.15,
                oben:  [0.07, 0.13, 0.165, 0.175, 0.17, 0.175, 0.19, 0.22, 0.23, 0.2, 0.1],
                unten: [-0.08, -0.13, -0.16, -0.19, -0.21, -0.22, -0.23, -0.24, -0.22, -0.16, -0.05],
                breit: [0.065, 0.1, 0.11, 0.11, 0.115, 0.12, 0.12, 0.115, 0.105, 0.085, 0.06] },
            bein: { dicke: 0.85, distal: 1.5, pfote: "huf", pfoteGross: 1.0, kralle: 1.0 },
            hals: { dicke: 1.0, lang: 1.7 },
            kopf: { gross: 1.1, nase: 0.9, ohrForm: "blatt", ohrH: 0.16, ohrB: 0.042, schnauzeL: 1.3, schnauzeB: 0.8, schnauzeH: 1.45,
                schaedelB: 0.85, schaedelH: 0.85, auge: [40, 24, 14] },
            schwanz: { segs: 3, segL: 0.034, wurzel: 0.032, mitte: 0.034, spitze: 0.022, hang: 1.15, fell: 0.8 },
            fell: { lang: 0.9 },
            // Hirsch im Sommerkleid: rotbraun, Bauch und Spiegel (Keulen-Fleck) hell, Läufe etwas dunkler.
            muster: { basis: [156, 92, 50], ruecken: [134, 80, 46], bauch: [216, 198, 168], beine: [136, 92, 58],
                maske: [176, 150, 120], spitze: [232, 222, 202], ohr: [136, 86, 52], spiegel: [228, 216, 192] },
        }),
    });
    // DAS SOLL der Art in Zahlen (Welle 5, die Natur-Bänder; gemessen von gate:tier-anatomie an der gebackenen Haut
    // der Ruhe-Pose, normiert auf den Widerrist W): widerristM = W in Metern (× MASSSTAB), brustTiefe = Widerrist bis
    // Brustbein, aufzug = Höhe der Bauch-Linie an der Flanke, rumpf = Rumpf-Länge auf halber Höhe, unterarm = Tiefe des
    // Vorderlaufs bei 0,3 W, kopfHoehe = Scheitel über dem Boden, ohr = Ohr-Höhe, rute = Ruten-Länge, kopfFrei = Anteil
    // der Kopf-Länge vor der Leib-Haut in Kopf-Höhe (der Kopf sitzt VOR dem Hals, nie in ihm), halsBreite = Breite der
    // Leib-Haut auf 60 % des Wegs Schulter → Kopf (ohne Fell-Schalen). Das Muster:
    // kontrast = Helligkeit Bauch / Rücken-Sattel, lauf = Läufe / Flanke, spitze = Rutenspitze / Flanke.
    // prettier-ignore
    var ANATOMIE_SOLL = Object.freeze({
        wolf: { widerristM: [0.7, 0.9], brustTiefe: [0.42, 0.52], aufzug: [0.6, 0.75], rumpf: [1.1, 1.32],
            unterarm: [0.06, 0.1], kopfHoehe: [0.95, 1.2], ohr: [0.09, 0.16], rute: [0.4, 0.65],
            kontrast: [1.6, 3.2], lauf: [0.9, 1.4], spitze: [0, 0.5], kopfFrei: [0.5, 1], halsBreite: [0.13, 0.22] },
        fox: { widerristM: [0.35, 0.52], brustTiefe: [0.4, 0.52], aufzug: [0.6, 0.75], rumpf: [1.35, 1.65],
            unterarm: [0.05, 0.09], kopfHoehe: [1.0, 1.25], ohr: [0.13, 0.22], rute: [0.7, 1.0],
            kontrast: [1.6, 3.2], lauf: [0, 0.5], spitze: [1.5, 3.0], kopfFrei: [0.5, 1], halsBreite: [0.11, 0.2] },
        bear: { widerristM: [0.9, 1.3], brustTiefe: [0.5, 0.65], aufzug: [0.4, 0.58], rumpf: [1.35, 1.7],
            unterarm: [0.12, 0.2], kopfHoehe: [0.8, 1.0], ohr: [0.06, 0.13], rute: [0, 0.1],
            kontrast: [0.6, 1.1], lauf: [0, 0.8], spitze: [0.8, 1.2], kopfFrei: [0.5, 1], halsBreite: [0.18, 0.3] },
        deer: { widerristM: [0.9, 1.25], brustTiefe: [0.36, 0.5], aufzug: [0.55, 0.72], rumpf: [0.95, 1.2],
            unterarm: [0.05, 0.08], kopfHoehe: [1.25, 1.6], ohr: [0.09, 0.2], rute: [0.05, 0.2],
            kontrast: [1.5, 3.0], lauf: [0.8, 1.2], spitze: [1.4, 3.0], kopfFrei: [0.5, 1], halsBreite: [0.08, 0.15] },
    });
    // Die Mischung: Gewicht je Art aus dem Abstand der Dials (je Dial über seine Lab-Spanne normiert), scharf
    // (σ² = 0,01 — die vier Presets liegen ≥ 0,37 auseinander, ein Preset ist seine Art zu > 99,99 %).
    var ART_SPANNE = Object.freeze({ size: 3, neck: 0.25, leg: 0.2, diet: 1, build: 1 });
    function artGewichte(P) {
        var d = { size: P.size, neck: P.neckLen, leg: P.legLen, diet: P.diet, build: P.build };
        var w = {},
            sum = 0,
            best = null;
        for (var id in ART_GESTALT) {
            var g = GATTUNGEN[id];
            var q = 0;
            for (var k in ART_SPANNE) {
                var x = (d[k] - g[k]) / ART_SPANNE[k];
                q += x * x;
            }
            w[id] = Math.exp(-q / 0.01);
            sum += w[id];
            if (!best || w[id] > w[best]) best = id;
        }
        // Weit weg von jeder Art (sum ≈ 0): die nächste trägt allein.
        if (!(sum > 1e-12)) {
            for (var id2 in w) w[id2] = id2 === best ? 1 : 0;
            sum = 1;
        }
        for (var id3 in w) w[id3] /= sum;
        return { w: w, art: best };
    }
    // Die gemischte Gestalt: Zahlen und Profile gewichtet, Wörter von der stärksten Art; ref = die Art-Dials (für
    // die Statur-Modulation: der Regler bleibt innerhalb einer Art lebendig).
    function artGestalt(P) {
        var g = artGewichte(P);
        var mische = function (pfad) {
            var erst = null;
            for (var id in g.w) {
                var v = ART_GESTALT[id];
                for (var i = 0; i < pfad.length; i++) v = v[pfad[i]];
                if (typeof v === "string") return ART_GESTALT[g.art][pfad[0]][pfad[1]];
                if (Array.isArray(v)) {
                    if (!erst) erst = v.map(function () { return 0; });
                    for (var j = 0; j < v.length; j++) erst[j] += g.w[id] * v[j];
                } else erst = (erst || 0) + g.w[id] * v;
            }
            return erst;
        };
        var out = { art: g.art, gewichte: g.w };
        for (var teil in ART_GESTALT.wolf) {
            out[teil] = {};
            for (var feld in ART_GESTALT.wolf[teil]) out[teil][feld] = mische([teil, feld]);
        }
        var ref = { build: 0 };
        for (var id4 in g.w) ref.build += g.w[id4] * GATTUNGEN[id4].build;
        out.ref = ref;
        return out;
    }

    // DIE AUGEN-FARBE DER ART (Integration W5-Körper, EINE Quelle für Lab und Ofen): die Iris aus ART_GESTALT.kopf.auge
    // (sRGB-Absicht: Wolf · Fuchs Bernstein, Bär · Hirsch dunkelbraun), die Glut ein fester Anteil davon — vorher las das
    // Lab das feste Bernstein der Material-Tabelle (0xeec040, Glut 0x442200) für jede Art, der Ofen die Art.
    function tierAuge(P) {
        var a = artGestalt(P).kopf.auge,
            g = TIER_MATERIAL_KLASSEN.tierauge.glut;
        var hex = function (r, gr, b) {
            return (Math.round(r) << 16) | (Math.round(gr) << 8) | Math.round(b);
        };
        return { farbe: hex(a[0], a[1], a[2]), glut: hex(a[0] * g, a[1] * g, a[2] * g) };
    }

    // ════════════════════════════════════════════════════════════════════
    // DAS FELL-MUSTER (Welle 5, die Farbe je Ort): wo ein Haut-Punkt am Tier liegt, entscheidet seine Farbe — der
    // Rücken-Sattel (oberes Drittel des Rumpf-Querschnitts), der helle Bauch und die Kehle (unteres Drittel), die
    // Läufe (unter Ellbogen und Knie), der Fang und die Wangen, die Ohr-Rücken, die Rutenspitze, der Spiegel (Keulen-
    // Fleck). Eingang: P (Allometrie), M (bauTier.masse: Rumpf-Stützstellen + Kopf-Lage), der Punkt im Wurzel-Raum der
    // Ruhe-Pose und sein Gelenk (Bone-Name; der Ofen mischt über die Haut-Gewichte). Ausgang: sRGB 0..255 (das FARB-
    // GESETZ rechnet der Ofen). Reine Mathe (MESHFREI §8): Lab und Welt lesen dieselbe Farbe.
    var BEIN_UNTEN = Object.freeze({ flL: 1, flP: 1, frL: 1, frP: 1, hlC: 1, hlP: 1, hrC: 1, hrP: 1 });
    var BEIN_OBEN = Object.freeze({ flU: 1, frU: 1, hlT: 1, hrT: 1, legFL: 1, legFR: 1, legHL: 1, legHR: 1 });
    function fellFarbe(P, M, x, y, z, gelenk) {
        var mu = artGestalt(P).muster,
            H = M.H,
            W = M.sY;
        var ss = function (a, b, t) {
            var q = Math.max(0, Math.min(1, (t - a) / (b - a)));
            return q * q * (3 - 2 * q);
        };
        var mix = function (a, b, t) {
            return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
        };
        if (gelenk === "earL" || gelenk === "earR") return mu.ohr.slice();
        var tm = /^tailSeg(\d+)$/.exec(gelenk || "");
        if (tm || gelenk === "tailRoot") {
            var t = tm ? (Number(tm[1]) + 0.5) / Math.max(1, M.rute || 1) : 0;
            return mix(mix(mu.ruecken, mu.basis, 0.5), mu.spitze, ss(0.62, 0.95, t));
        }
        // die Läufe: Unterarm/Unterschenkel ganz in der Lauf-Farbe; Oberarm/Keule tragen außen die Grund-Farbe und
        // gleiten unter ~0,5 W in den Lauf (der Bauch-Ton gehört dem Rumpf, nie der Keule)
        if (BEIN_UNTEN[gelenk]) return mu.beine.slice();
        if (BEIN_OBEN[gelenk]) return mix(mu.basis, mu.beine, 1 - ss(0.32 * W, 0.6 * W, y));
        var R = M.rumpf;
        var c;
        if (gelenk === "headGroup" || gelenk === "jawGroup") {
            var K = M.kopf,
                kH = K.g * H;
            // Wangen, Lefzen und Kinn (untere Kopf-Hälfte): die Maske; der Nasenrücken trägt die Grund-Farbe mit einem
            // Hauch Maske; Stirn und Scheitel dunkeln halb zum Rücken-Ton (Welle 5: vorher ganz — eine dunkle Kappe über
            // einem weißen Fang). Die Schwellen messen in der Kopf-Größe der Art (K.g, der Bär trägt einen großen Kopf).
            var fang = ss(K.z + 0.02 * kH, K.z + 0.07 * kH, z);
            var unterK = gelenk === "jawGroup" ? 1 : 1 - ss(K.y - 0.03 * kH, K.y + 0.01 * kH, y);
            c = mix(mu.basis, mu.ruecken, 0.5 * ss(K.y + 0.02 * kH, K.y + 0.07 * kH, y));
            c = mix(c, mu.maske, Math.max(unterK, fang * 0.3));
            return c;
        }
        var n = R.oben.length - 1,
            u = Math.max(0, Math.min(1, (z - R.zRear) / (R.zFront - R.zRear))),
            i = Math.min(n - 1, Math.floor(u * n)),
            f = u * n - i;
        var ob = R.oben[i] + (R.oben[i + 1] - R.oben[i]) * f,
            un = R.unten[i] + (R.unten[i + 1] - R.unten[i]) * f;
        var v = (y - un) / Math.max(1e-6, ob - un);
        // Rumpf: Sattel oben, Bauch unten; vorn über den Bug hinaus der Hals: die Kehle hell bis unter den Kiefer
        c = mix(mu.basis, mu.ruecken, ss(0.55, 0.95, v));
        var hals = ss(R.zFront - 0.12 * H, R.zFront + 0.05 * H, z);
        var bauch = 1 - ss(0.1, 0.42, v);
        var kehle = hals * (1 - ss(0.35, 0.75, (y - un) / Math.max(1e-6, ob - un + hals * 0.15 * H)));
        c = mix(c, mu.bauch, Math.max(bauch, kehle));
        // der Spiegel: der helle Keulen-Fleck hinten über dem Sitzbein (Hirsch; die Raubtiere tragen dort ihre Basis)
        c = mix(c, mu.spiegel, (1 - ss(0.04, 0.16, u)) * ss(0.25, 0.5, v) * (1 - ss(0.72, 0.92, v)));
        return c;
    }

    // ════════════════════════════════════════════════════════════════════
    // KONVERGENZ III — DER EINE TIER-BAU: bauTier(F, dials) baut den kompletten
    // Studio-Vierbeiner (verbatim aus worlds/tetrapoda/tetrapoda.js buildAnimal
    // gewandert; der Schöpfer formte ihn) über FABRIK-HAKEN — MESHFREI §8:
    // der Kern NENNT keine Meshes, F baut. Haken:
    //   F.gruppe() · F.kugel(r, klasse, sc?) · F.zylinder(rt,rb,h, klasse) ·
    //   F.kugelFein(r, klasse, segs) · F.v3(x,y,z) (Vektor MIT clone/add/
    //   multiplyScalar/normalize/sub — beide Leser reichen ihre echte Klasse) ·
    //   F.richte(node, dirV3) (Knoten-Ausrichtung) · F.fellSchweif(segG, segR, i)
    //   (Schweif-Strähnen — die Shell streut, der Stamm lässt es).
    // Klassen: fell · straehne · nase · tierauge · pupille · hornhaut · klaue ·
    // ballen · zahn · zahnfleisch · dunkel (Farben: TIER_MATERIAL_KLASSEN).
    // Rückgabe: {teile, tailSegs, spineSegs, neckSegs, pawOffsets, masse, P}.
    function bauTier(F, dials) {
        var wolf,
            headGroup,
            jawGroup,
            earL,
            earR,
            lidTL,
            lidTR,
            tailRoot,
            legFL,
            legFR,
            legHL,
            legHR,
            shoulderL,
            shoulderR,
            ribcage,
            waist,
            flank,
            belly,
            lowerAbd,
            mane,
            throat,
            larynx,
            larynxUp,
            deltL,
            deltR,
            tricepL,
            tricepR,
            quadL,
            quadR,
            hamL,
            hamR,
            gastroL,
            gastroR,
            gluteL,
            gluteR,
            flU,
            flL,
            flP,
            frU,
            frL,
            frP,
            hlT,
            hlC,
            hlP,
            hrT,
            hrC,
            hrP;
        var tricep, quad, ham, gastro;
        var H, sY, hY, sZ, hZ, lv, by, tv, bt;
        var tailSegs = [],
            spineSegs = [],
            neckSegs = [];

        var s = function (r, k, sc) {
            return F.kugel(r, k, sc);
        };
        var cH = function (rt, rb, h, k) {
            return F.zylinder(rt, rb, h, k);
        };
        var boneSph = function (r, len, k) {
            return s(r, k, [0.92, len / (2 * r), 0.92]);
        };
        var pawOffsets = [0, 0, 0, 0];
        var P = dials && dials.legMuscle != null && dials.size != null ? dials : deriveTierParams(dials || {});
        var A = artGestalt(P);
        H = P.size;
        lv = 1.0 + P.legMuscle;
        by = P.bellyD;
        tv = P.throat;
        var bX = P.bWF;
        bt = 1.0 + (P.build - 0.42) * 1.2;
        // Die Statur bleibt innerhalb der Art lebendig: Breite ∝ bWF, der Bauch hängt mit der Statur.
        var breitMul = (0.35 + P.build * 0.2) / (0.35 + A.ref.build * 0.2),
            bauchTief = (P.build - A.ref.build) * 0.1;
        // DIE BEIN-GELENKE: Schulter vorn, Hüfte hinten — ihr Abstand trägt die Rumpf-Länge der Art.
        var zS = 0.438 * H * A.rumpf.lang,
            zH = -0.483 * H * A.rumpf.lang;
        sZ = zS + 0.02 * H;
        hZ = zH - 0.017 * H;
        var spF = STAND_POSE[0],
            spH = STAND_POSE[2];
        var fRH = spF[0] + spF[1],
            fRR = fRH + spF[2],
            fRM = fRR + spF[3];
        var hRH = spH[0] + spH[1],
            hTR = hRH + spH[2],
            hTM = hTR + spH[3];
        var frontYReach =
            P.legLen *
                H *
                (Math.cos((25 * Math.PI) / 180 + fRH) +
                    1.45 * Math.cos((10 * Math.PI) / 180 + fRR) +
                    0.91 * Math.cos((15 * Math.PI) / 180 + fRM)) +
            0.014 * H;
        var hindYReach =
            P.legLen *
                H *
                (1.27 * Math.cos((35 * Math.PI) / 180 + hRH) +
                    1.73 * Math.cos((45 * Math.PI) / 180 + hTR) +
                    1.18 * Math.cos((5 * Math.PI) / 180 + hTM)) +
            0.011 * H;
        // Beide Sohlen auf DEMSELBEN Boden: die Bein-Gelenke stehen um ihre Reichweite über y = 0.
        var hindLegY = hindYReach,
            frontLegY = frontYReach;
        pawOffsets[0] = pawOffsets[1] = P.legLen * 0.91 * H * Math.cos((15 * Math.PI) / 180) + 0.012 * H;
        pawOffsets[2] = pawOffsets[3] = P.legLen * 1.18 * H * Math.cos((5 * Math.PI) / 180) + 0.01 * H;
        // ── DER RUMPF ALS PROFIL (ART_GESTALT.rumpf): u = 0 Sitzbein … 1 Bug, über der Linie der Bein-Gelenke ──
        var zFront = zS + A.rumpf.vor * H,
            zRear = zH - A.rumpf.hinter * H;
        var basisY = function (u) {
            return hindLegY + (frontLegY - hindLegY) * u;
        };
        var profil = function (arr, u) {
            // Catmull-Rom über die 11 Stützstellen (stetig in Lage und Steigung — die Linie knickt nicht)
            var x = Math.max(0, Math.min(1, u)) * 10,
                i = Math.min(9, Math.floor(x)),
                t = x - i;
            var p0 = arr[Math.max(0, i - 1)],
                p1 = arr[i],
                p2 = arr[i + 1],
                p3 = arr[Math.min(10, i + 2)];
            return (
                0.5 *
                (2 * p1 +
                    (p2 - p0) * t +
                    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
                    (3 * p1 - p0 - 3 * p2 + p3) * t * t * t)
            );
        };
        var oben = function (u) {
            return basisY(u) + profil(A.rumpf.oben, u) * H;
        };
        var unten = function (u) {
            var b = profil(A.rumpf.unten, u);
            if (u > 0.15 && u < 0.6) b -= bauchTief * Math.sin(((u - 0.15) / 0.45) * Math.PI);
            return basisY(u) + b * H;
        };
        var breite = function (u) {
            return profil(A.rumpf.breit, u) * H * breitMul;
        };
        var zU = function (u) {
            return zRear + (zFront - zRear) * u;
        };
        var uZ = function (z) {
            return (z - zRear) / (zFront - zRear);
        };
        sY = oben(0.8);
        hY = oben(0.18);
        wolf = F.gruppe();
        // Die Stationen: je eine Ellipsoid-Scheibe (halbe Breite × halbe Tiefe × doppelter Abstand), überlappend —
        // die glatte Vereinigung der Haut macht daraus EINE Fläche. Benannte Stationen tragen die Rollen der Fell-
        // Zeilen und der Lab-Animation (der Brustkorb atmet mit scale.y um 0.76).
        var NS = 21,
            schritt = (zFront - zRear) / (NS - 1);
        var stationen = [],
            stationOrt = [];
        for (var si = 0; si < NS; si++) {
            var su = si / (NS - 1);
            var sz0 = zU(su),
                so = oben(su),
                sun = unten(su),
                sb = breite(su);
            var shz = Math.min(2 * schritt, schritt + Math.min(sz0 - zRear, zFront - sz0));
            var shy = Math.max(0.02 * H, (so - sun) / 2);
            var sr = si === 15 ? shy / 0.76 : Math.max(sb, shy, shz);
            var st = s(sr, "fell", [sb / sr, si === 15 ? 0.76 : shy / sr, shz / sr]);
            st.position.set(0, (so + sun) / 2, sz0);
            wolf.add(st);
            stationen.push(st);
            stationOrt.push({ c: [0, (so + sun) / 2, sz0], r: [sb, shy, shz] });
        }
        ribcage = stationen[15];
        waist = stationen[9];
        belly = stationen[8];
        flank = stationen[7];
        lowerAbd = stationen[6];
        var pelvis = stationen[4];
        var croup = stationen[2];
        // Die Wirbel (Lab-Animation: der Rücken federt) liegen IM Rumpf — sie tragen die Bewegung, nie eine Beule.
        var longU = [0.85, 0.7, 0.5, 0.32, 0.18];
        for (var i = 0; i < 5; i++) {
            for (var sd = -1; sd <= 1; sd += 2) {
                var seg = s(0.045 * H, "fell", [bX * 0.96, 0.5, 0.78]);
                seg.position.set(sd * 0.035 * H, oben(longU[i]) - 0.07 * H, zU(longU[i]));
                wolf.add(seg);
                spineSegs.push(seg);
            }
        }
        // DIE GLIEDER (ART_GESTALT.bein): die Gelenke stehen, wo die Rumpf-Breite es verlangt (vorn knapp unter
        // der Brust, hinten unter dem Becken), jedes Fleisch-Teil trägt die Glied-Dicke der Art (D), der Unterarm,
        // das Schienbein und die Mittelhand sind kräftiger als im alten Stelzen-Bein (Unterarm ~0,08 W). Absolute
        // Lab-Zahlen tragen den Faktor k = H/2,4 (der Wolf behält seine Maße, jede andere Größe skaliert mit).
        var Dp = Math.sqrt(A.bein.dicke),
            Dd = A.bein.dicke * A.bein.distal,
            k = H / 2.4;
        // proximal (Schulter, Oberarm, Keule): √Dicke — die Masse liegt im Rumpf; distal (Unterarm, Schienbein,
        // Mittelhand): Dicke × distal der Art (der Hirsch trägt dünne, aber tragende Läufe, nie Stelzen).
        var sD = function (r, kl, sc) {
            return s(r * Dp, kl, sc);
        };
        var sU = function (r, kl, sc) {
            return s(r * Dd, kl, sc);
        };
        var boneD = function (r, len, kl) {
            return s(r * Dp, kl, [0.92, len / (2 * r * Dp), 0.92]);
        };
        var boneU = function (r, len, kl) {
            return s(r * Dd, kl, [0.92, len / (2 * r * Dd), 0.92]);
        };
        // DIE PFOTE der Art: "zehe" (Wolf · Fuchs: vier Zehen, Ballen, Krallen) · "sohle" (Bär: große Pranke, lange
        // Krallen) · "huf" (Hirsch: zwei Schalen, Fesselkopf, keine Zehe und keine Kralle).
        var baueFuss = function (paw, side, vorn) {
            paw.scale.setScalar(A.bein.pfoteGross);
            if (A.bein.pfote === "huf") {
                var fessel = s(0.02 * H, "fell", [1.0, 1.1, 1.0]);
                fessel.position.set(0, 0.018 * H, 0.002 * H);
                paw.add(fessel);
                for (var hs = -1; hs <= 1; hs += 2) {
                    var schale = s(0.018 * H, "klaue", [0.55, 0.85, 1.35]);
                    schale.position.set(hs * 0.0085 * H, -0.004 * H, 0.008 * H);
                    schale.rotation.x = -0.12;
                    paw.add(schale);
                    var after = s(0.0045 * H, "klaue", [0.8, 1.2, 0.8]);
                    after.position.set(hs * 0.011 * H, 0.02 * H, -0.012 * H);
                    paw.add(after);
                }
                return;
            }
            var kr = A.bein.kralle;
            var padMain = s((vorn ? 0.015 : 0.013) * H, "ballen", [1.6, vorn ? 0.28 : 0.26, 1.2]);
            padMain.position.set(0, (vorn ? -0.01 : -0.008) * H, (vorn ? 0.01 : 0.008) * H);
            paw.add(padMain);
            var rMx = (vorn ? 0.028 : 0.028) * H * Math.pow(bt, 1.3);
            var pm = s(rMx * (vorn ? 1.05 : 1.02), "fell", [1.0, vorn ? 0.3 : 0.28, 1.0]);
            pm.position.set(0, 0.002 * H, 0.012 * H);
            paw.add(pm);
            for (var i = 0; i < 4; i++) {
                var tx = (i - 1.5) * (vorn ? 0.022 : 0.018) * H;
                var toe = s((vorn ? 0.01 : 0.009) * H, "fell", [1.0, vorn ? 0.58 : 0.52, vorn ? 1.5 : 1.4]);
                toe.position.set(tx, -0.002 * H, (vorn ? 0.024 : 0.022) * H);
                paw.add(toe);
                var claw = s((vorn ? 0.003 : 0.0028) * H, "klaue", [1.0, 1.3 * kr, 1.0]);
                claw.position.set(tx, -0.012 * H + 0.003 * H * (kr - 1), (vorn ? 0.048 : 0.042) * H + 0.004 * H * (kr - 1));
                claw.rotation.x = 0.42 + 0.25 * (kr - 1);
                paw.add(claw);
                var toePad = s((vorn ? 0.006 : 0.005) * H, "ballen", [vorn ? 1.5 : 1.4, 0.28, 1.2]);
                toePad.position.set(tx, (vorn ? -0.01 : -0.008) * H, (vorn ? 0.022 : 0.02) * H);
                paw.add(toePad);
            }
            if (vorn) {
                var dew = s(0.005 * H, "fell", [1.0, 1.0, 1.0]);
                dew.position.set(side * 0.024 * H, 0, -0.01 * H);
                paw.add(dew);
            }
        };
        var xVorn = 0.78 * breite(uZ(zS)) + 0.03 * H,
            xHinten = 0.6 * breite(uZ(zH)) + 0.01 * H;
        function buildFrontLeg(side) {
            var g = F.gruppe();
            g.position.set(side * xVorn, frontLegY, zS);
            var rS = 0.068 * H,
                rE = 0.05 * H * Math.pow(bt, 0.6),
                rC = 0.042 * H * Math.pow(bt, 1.0);
            var scap = sD(0.09 * H, "fell", [0.28, 1.12, 0.34]);
            scap.position.set(side * -0.025 * k, 0.08 * H, -0.03 * H);
            scap.rotation.z = side * 0.22;
            g.add(scap);
            var delt = sD(rS * 1.15, "fell", [0.9, 1.32, 0.8 * lv]);
            delt.position.set(side * 0.015 * k, 0.0, 0.004 * H);
            g.add(delt);
            if (side < 0) deltL = delt;
            else deltR = delt;
            var humLen = P.legLen * H,
                humAng = (25 * Math.PI) / 180;
            var humVec = F.v3(0, -humLen * Math.cos(humAng), -humLen * Math.sin(humAng));
            var upper = F.gruppe();
            g.add(upper);
            var hum = boneD(rS * 0.5, humLen, "fell");
            hum.position.copy(humVec.clone().multiplyScalar(0.5));
            hum.rotation.x = humAng;
            upper.add(hum);
            tricep = sD(0.092 * H, "fell", [0.56, 1.44, 0.62 * lv]);
            tricep.position.copy(
                humVec
                    .clone()
                    .multiplyScalar(0.5)
                    .add(F.v3(0, 0.005 * H, -0.012 * H))
            );
            tricep.rotation.x = humAng;
            upper.add(tricep);
            if (side < 0) tricepL = tricep;
            else tricepR = tricep;
            var bic = sD(0.065 * H, "fell", [0.52, 1.5, 0.48]);
            bic.position.copy(
                humVec
                    .clone()
                    .multiplyScalar(0.5)
                    .add(F.v3(0, 0, 0.014 * H))
            );
            bic.rotation.x = humAng;
            upper.add(bic);
            var hf = sD(0.048 * H * Math.pow(bt, 0.3), "fell", [0.95, 0.9, 0.95]);
            hf.position.copy(humVec.clone().multiplyScalar(0.2));
            hf.rotation.x = humAng;
            upper.add(hf);
            var elbow = sU(rE * 1.08, "fell", [0.85, 0.75, 1.0]);
            elbow.position.copy(humVec);
            upper.add(elbow);
            var radLen = P.legLen * 1.45 * H,
                radAng = (10 * Math.PI) / 180;
            var radVec = F.v3(0, -radLen * Math.cos(radAng), radLen * Math.sin(radAng));
            var lower = F.gruppe();
            lower.position.copy(humVec);
            upper.add(lower);
            var fa = boneU(rE * 0.9, radLen, "fell");
            fa.position.copy(radVec.clone().multiplyScalar(0.5));
            fa.rotation.x = -radAng;
            lower.add(fa);
            // der Unterarm-Bauch (Beuger/Strecker) — das Glied verjüngt sich zur Handwurzel
            var rf = sU(0.042 * H * Math.pow(bt, 0.8), "fell", [0.95, 1.6, 1.0]);
            rf.position.copy(radVec.clone().multiplyScalar(0.3));
            rf.rotation.x = -radAng;
            lower.add(rf);
            var ext = sU(0.022 * H * Math.pow(bt, 1.0), "fell", [0.36, 1.2, 0.32]);
            ext.position.copy(
                radVec
                    .clone()
                    .multiplyScalar(0.2)
                    .add(F.v3(0, 0, 0.012 * H))
            );
            ext.rotation.x = -radAng;
            lower.add(ext);
            var carpus = sU(rC * 1.08, "fell", [0.85, 0.65, 1.0]);
            carpus.position.copy(radVec);
            lower.add(carpus);
            var metaLen = P.legLen * 0.91 * H,
                metaAng = (15 * Math.PI) / 180;
            var metaVec = F.v3(0, -metaLen * Math.cos(metaAng), metaLen * Math.sin(metaAng));
            var pawG = F.gruppe();
            pawG.position.copy(radVec);
            lower.add(pawG);
            var meta = boneU(rC * 0.85, metaLen, "fell");
            meta.position.copy(metaVec.clone().multiplyScalar(0.5));
            meta.rotation.x = -metaAng;
            pawG.add(meta);
            var metaFlesh = sU(0.03 * H * Math.pow(bt, 1.2), "fell", [0.95, 1.0, 0.85]);
            metaFlesh.position.copy(
                metaVec
                    .clone()
                    .multiplyScalar(0.5)
                    .add(F.v3(0, 0.002 * H, 0.006 * H))
            );
            metaFlesh.rotation.x = -metaAng;
            pawG.add(metaFlesh);
            var paw = F.gruppe();
            paw.position.copy(metaVec);
            pawG.add(paw);
            baueFuss(paw, side, true);
            if (side < 0) {
                flU = upper;
                flL = lower;
                flP = pawG;
            } else {
                frU = upper;
                frL = lower;
                frP = pawG;
            }
            return g;
        }
        function buildHindLeg(side) {
            var g = F.gruppe();
            g.position.set(side * xHinten, hindLegY, zH);
            var rH = 0.08 * H,
                rSt = 0.062 * H * Math.pow(bt, 0.6),
                rHk = 0.048 * H * Math.pow(bt, 1.0);
            var gR = rH * 1.35 * Dp,
                gSy = Math.min(1.1 * lv, (oben(uZ(zH)) - 0.02 * H - (hindLegY + 0.03 * H)) / gR);
            var glute = s(gR, "fell", [0.85, gSy, 1.22 * lv]);
            glute.position.set(side * -0.04 * H, 0.03 * H, -0.02 * H);
            g.add(glute);
            if (side < 0) gluteL = glute;
            else gluteR = glute;
            var tfl = sD(0.044 * H, "fell", [0.48, 1.12, 0.42]);
            tfl.position.set(side * 0.012 * k, -0.04 * H, 0.045 * H);
            g.add(tfl);
            var femLen = P.legLen * 1.27 * H,
                femAng = (35 * Math.PI) / 180;
            var femVec = F.v3(0, -femLen * Math.cos(femAng), femLen * Math.sin(femAng));
            var thigh = F.gruppe();
            g.add(thigh);
            var fem = boneD(rH * 0.5, femLen, "fell");
            fem.position.copy(femVec.clone().multiplyScalar(0.5));
            fem.rotation.x = -femAng;
            thigh.add(fem);
            quad = sD(0.078 * H, "fell", [0.52, 1.86, 0.56 * lv]);
            quad.position.copy(
                femVec
                    .clone()
                    .multiplyScalar(0.5)
                    .add(F.v3(0, 0, 0.04 * H))
            );
            quad.rotation.x = -femAng;
            thigh.add(quad);
            if (side < 0) quadL = quad;
            else quadR = quad;
            ham = sD(0.094 * H, "fell", [0.74, 1.7, 0.84 * lv]);
            ham.position.copy(
                femVec
                    .clone()
                    .multiplyScalar(0.5)
                    .add(F.v3(0, 0, -0.026 * H))
            );
            ham.rotation.x = -femAng;
            thigh.add(ham);
            if (side < 0) hamL = ham;
            else hamR = ham;
            var semi = sD(0.058 * H, "fell", [0.5, 1.22, 0.6]);
            semi.position.copy(
                femVec
                    .clone()
                    .multiplyScalar(0.45)
                    .add(F.v3(0, -0.04 * H, -0.014 * H))
            );
            semi.rotation.x = -femAng;
            thigh.add(semi);
            var falte = sD(0.06 * H, "fell", [0.55, 1.5, 0.9]);
            falte.position.copy(
                femVec
                    .clone()
                    .multiplyScalar(0.62)
                    .add(F.v3(0, 0.06 * H, 0.03 * H))
            );
            falte.rotation.x = 0.35;
            thigh.add(falte);
            var ff = sD(0.05 * H * Math.pow(bt, 0.3), "fell", [0.95, 0.9, 0.95]);
            ff.position.copy(femVec.clone().multiplyScalar(0.18));
            ff.rotation.x = -femAng;
            thigh.add(ff);
            var stifle = sD(rSt * 1.1, "fell", [0.85, 0.7, 1.0]);
            stifle.position.copy(femVec);
            thigh.add(stifle);
            var tibLen = P.legLen * 1.73 * H,
                tibAng = (45 * Math.PI) / 180;
            var tibVec = F.v3(0, -tibLen * Math.cos(tibAng), -tibLen * Math.sin(tibAng));
            var calf = F.gruppe();
            calf.position.copy(femVec);
            thigh.add(calf);
            var tib = boneU(rSt * 0.72, tibLen, "fell");
            tib.position.copy(tibVec.clone().multiplyScalar(0.5));
            tib.rotation.x = tibAng;
            calf.add(tib);
            gastro = sU(0.058 * H, "fell", [0.52, 1.52, 0.55 * lv]);
            gastro.position.copy(
                tibVec
                    .clone()
                    .multiplyScalar(0.3)
                    .add(F.v3(0, 0, -0.014 * H))
            );
            gastro.rotation.x = tibAng;
            calf.add(gastro);
            if (side < 0) gastroL = gastro;
            else gastroR = gastro;
            var tf = sU(0.038 * H * Math.pow(bt, 0.8), "fell", [0.95, 0.9, 0.95]);
            tf.position.copy(tibVec.clone().multiplyScalar(0.6));
            tf.rotation.x = tibAng;
            calf.add(tf);
            var hock = sU(rHk * 1.14, "fell", [0.85, 0.68, 1.0]);
            hock.position.copy(tibVec);
            calf.add(hock);
            var metaTLen = P.legLen * 1.18 * H,
                metaTAng = (5 * Math.PI) / 180;
            var metaTVec = F.v3(0, -metaTLen * Math.cos(metaTAng), metaTLen * Math.sin(metaTAng));
            var pawG = F.gruppe();
            pawG.position.copy(tibVec);
            calf.add(pawG);
            var metaT2 = boneU(rHk * 0.85, metaTLen, "fell");
            metaT2.position.copy(metaTVec.clone().multiplyScalar(0.5));
            metaT2.rotation.x = -metaTAng;
            pawG.add(metaT2);
            var metaTFlesh = sU(0.028 * H * Math.pow(bt, 1.2), "fell", [0.95, 1.0, 0.85]);
            metaTFlesh.position.copy(
                metaTVec
                    .clone()
                    .multiplyScalar(0.5)
                    .add(F.v3(0, 0.002 * H, 0.005 * H))
            );
            metaTFlesh.rotation.x = -metaTAng;
            pawG.add(metaTFlesh);
            var paw = F.gruppe();
            paw.position.copy(metaTVec);
            pawG.add(paw);
            baueFuss(paw, side, false);
            if (side < 0) {
                hlT = thigh;
                hlC = calf;
                hlP = pawG;
            } else {
                hrT = thigh;
                hrC = calf;
                hrP = pawG;
            }
            return g;
        }
        legFL = buildFrontLeg(-1);
        legFR = buildFrontLeg(1);
        legHL = buildHindLeg(-1);
        legHR = buildHindLeg(1);
        function buildShoulderBridge(side) {
            var wrap = F.gruppe();
            wrap.position.set(-side * 0.02 * H, 0.024 * H, 0);
            wrap.scale.set(0.6, 1.2, 1.0);
            var b = s(0.125 * H, "fell", [bX * 1.38, 0.89, 0.74]);
            b.rotation.z = side * 0.1;
            wrap.add(b);
            if (side < 0) shoulderL = b;
            else shoulderR = b;
            return wrap;
        }
        legFL.add(buildShoulderBridge(-1));
        legFR.add(buildShoulderBridge(1));
        function buildShoulderConnect(side) {
            var wrap = F.gruppe();
            wrap.position.set(-side * 0.015 * H, -0.01 * H, -0.04 * H);
            wrap.scale.set(0.8, 1.2, 1.0);
            var c1 = s(0.085 * H, "fell", [1.18, 0.7, 0.64]);
            c1.rotation.z = side * 0.12;
            wrap.add(c1);
            return wrap;
        }
        legFL.add(buildShoulderConnect(-1));
        legFR.add(buildShoulderConnect(1));
        wolf.add(legFL);
        wolf.add(legFR);
        wolf.add(legHL);
        wolf.add(legHR);
        // DER HALS setzt am Bug über der Brust an (vorn-oben am Rumpf-Profil) und steigt im Winkel des Gesetzes
        // (deriveTierParams.neckAng) — der Kopf trägt sich am Widerrist (Wolf), über ihm (Hirsch) oder tief (Bär).
        // Die Dicke folgt der Statur stetig (vorher drei Stufen) und der Art.
        var nLen = P.neckLen * H * A.hals.lang,
            nAng = (P.neckAng * Math.PI) / 180;
        var neckStart = F.v3(0, oben(0.93) - 0.075 * H, zU(0.93));
        var neckEnd = F.v3(0, neckStart.y + nLen * Math.sin(nAng), neckStart.z + nLen * Math.cos(nAng));
        var neckDir = neckEnd.clone().sub(neckStart);
        var neckN = neckDir.clone().normalize();
        // Der Hals-Radius an der Wurzel (× H): Wolf 0,10 H (~8 cm), Fuchs 0,076 H, Bär 0,14 H (~15 cm), Hirsch 0,074 H —
        // vorher 0,075 + 0,13·Statur: der Hals war so dick wie der Brustkorb und verschluckte den Kopf (Bär) bzw. legte
        // ihm eine Kapuze um (Wolf).
        var nBasis = (0.05 + 0.085 * P.build) * A.hals.dicke;
        var nR = [1, 0.92, 0.84, 0.7].map(function (t) {
            return t * nBasis * H;
        });
        // Die Hals-Stationen liegen ENTLANG des Halses (je ein Glied, in Hals-Richtung gestreckt) und so dicht, dass
        // ein langer Hals (Hirsch) nicht zur Perlen-Kette zerfällt: Abstand ≤ 0,75 × Wurzel-Radius.
        var nN = Math.max(4, Math.ceil(nLen / (0.75 * nR[0])));
        for (var i = 0; i < nN; i++) {
            var nt = i / (nN - 1);
            var nP = neckStart.clone().add(neckDir.clone().multiplyScalar(nt));
            nP.y += Math.sin(nt * Math.PI) * 0.02 * H;
            var nq = Math.min(2, nt * 3),
                nqi = Math.min(2, Math.floor(nq));
            var nRi = nR[nqi] + (nR[nqi + 1] - nR[nqi]) * (nq - nqi);
            var nSG = F.gruppe();
            nSG.position.copy(nP);
            var nS = s(nRi, "fell", [0.9, 1.18, 0.94]);
            F.richte(nS, neckN);
            nSG.add(nS);
            wolf.add(nSG);
            neckSegs.push(nSG);
        }
        function buildNeckRidge(side) {
            var r = s(0.024 * H, "fell", [0.32, 2.8, 0.32]);
            var mid = neckStart.clone().add(neckDir.clone().multiplyScalar(0.5));
            r.position.copy(mid.clone().add(F.v3(side * 0.022 * H, 0.022 * H, 0)));
            F.richte(r, neckN);
            return r;
        }
        wolf.add(buildNeckRidge(-1));
        wolf.add(buildNeckRidge(1));
        mane = s(0.062 * H, "fell", [0.85, 0.7, 1.38]);
        mane.position.copy(
            neckStart
                .clone()
                .add(neckDir.clone().multiplyScalar(0.25))
                .add(F.v3(0, -0.02 * H, 0))
        );
        wolf.add(mane);
        throat = s(0.066 * H, "fell", [0.52 + tv * 0.2, 1 + tv * 2, 1 + tv * 1.5]);
        throat.position.copy(
            neckStart
                .clone()
                .add(neckDir.clone().multiplyScalar(0.28))
                .add(F.v3(0, -0.038 * H, 0.01 * H))
        );
        wolf.add(throat);
        var throatLower = s(0.056 * H, "fell", [0.5 + tv * 0.1, 1 + tv * 1.5, 1 + tv]);
        throatLower.position.copy(
            neckStart
                .clone()
                .add(neckDir.clone().multiplyScalar(0.48))
                .add(F.v3(0, -0.028 * H, 0.01 * H))
        );
        wolf.add(throatLower);
        larynx = s(0.064 * H, "fell", [0.52 + tv * 0.2, 1 + tv * 3, 1 + tv * 2]);
        larynx.position.copy(
            neckStart
                .clone()
                .add(neckDir.clone().multiplyScalar(0.63))
                .add(F.v3(0, -0.018 * H, 0.008 * H))
        );
        wolf.add(larynx);
        larynxUp = s(0.054 * H, "fell", [0.52 + tv * 0.2, 1 + tv * 3, 1 + tv * 2]);
        larynxUp.position.copy(
            neckStart
                .clone()
                .add(neckDir.clone().multiplyScalar(0.78))
                .add(F.v3(0, -0.008 * H, 0.005 * H))
        );
        wolf.add(larynxUp);
        var neckHeadBlend = s(0.082 * H, "fell", [0.68, 1.01, 1.45]);
        neckHeadBlend.position.copy(neckEnd);
        neckHeadBlend.position.y -= 0.008 * H;
        wolf.add(neckHeadBlend);
        // DIE RUTE (ART_GESTALT.schwanz): am Sitzbein-Ansatz über dem Becken, hängend im Winkel der Art (Wolf ~30°,
        // Hirsch fast senkrecht), ihr Leib buschig zur Mitte (Fuchs ~0,15 W dick) — Segment-Zahl und -Länge je Art
        // (vorher: 4 + 7·(1−Statur) Segmente, der Hirsch trug eine Wolfsrute aus elf Gliedern).
        tailRoot = F.gruppe();
        tailRoot.position.set(0, oben(0.04) - 0.03 * H, zU(0.03));
        tailRoot.rotation.x = -A.schwanz.hang;
        tailRoot.scale.z = 1.6;
        wolf.add(tailRoot);
        var tailParent = tailRoot;
        var nSeg = Math.max(1, Math.round(A.schwanz.segs));
        for (var i = 0; i < nSeg; i++) {
            var segG = F.gruppe();
            var tt = nSeg > 1 ? i / (nSeg - 1) : 0;
            var segR =
                H *
                (A.schwanz.wurzel * (1 - tt) +
                    A.schwanz.spitze * tt +
                    (A.schwanz.mitte - (A.schwanz.wurzel + A.schwanz.spitze) / 2) * Math.sin(Math.PI * tt));
            var seg = s(segR, "fell", [0.95, 1.18, 1.18]);
            seg.position.z = -A.schwanz.segL * 1.15 * H;
            segG.add(seg);
            F.fellSchweif(segG, segR, i);
            segG.position.z = i === 0 ? 0 : -A.schwanz.segL * H;
            if (i > 0) segG.position.y = -0.003 * H * (i + 1);
            tailParent.add(segG);
            tailParent = segG;
            tailSegs.push(segG);
        }
        // Die Kopf-Größe der Art (ART_GESTALT.kopf.gross: der Bär trägt einen großen Kopf, die Allometrie skullR ∝ Größe^0,25
        // verkleinert ihn sonst) — der ganze Kopf-Baum skaliert, sein Zentrum rückt um dieselbe Zahl vor den Hals.
        var kG = A.kopf.gross;
        var headY = neckEnd.y - 0.02 * H - 0.008 * H,
            headZ = neckEnd.z + 0.12 * H * kG;
        headGroup = F.gruppe();
        headGroup.position.set(0, headY, headZ);
        headGroup.scale.set(kG, kG, kG);
        // DER KOPF der Art (ART_GESTALT.kopf): Schädel-Breite, Schnauzen-Länge und -Breite (Bär kurz und breit, Fuchs
        // lang und schmal); die Fänge folgen der Ernährung (ein Pflanzenfresser trägt keine).
        var kB = A.kopf.schaedelB;
        var cranium = s(P.skullR * H, "fell", [0.95 * kB, 0.96 * A.kopf.schaedelH, 1.06]);
        cranium.position.set(0, 0.03 * H, -0.062 * H);
        headGroup.add(cranium);
        var sagCrest = cH(0.004 * H, 0.012 * H, 0.06 * H, "fell");
        sagCrest.position.set(0, 0.07 * H, -0.06 * H);
        headGroup.add(sagCrest);
        function buildTemp(side) {
            var t = s(0.032 * H, "fell", [0.5, 0.82, 0.58]);
            t.position.set(side * 0.05 * H * kB, 0.024 * H, -0.038 * H);
            return t;
        }
        headGroup.add(buildTemp(-1));
        headGroup.add(buildTemp(1));
        var forehead = s(0.046 * H, "fell", [1.18, 0.68, 0.72]);
        forehead.position.set(0, 0.036 * H, 0.0);
        forehead.rotation.x = 0.28;
        headGroup.add(forehead);
        var stopBump = s(0.02 * H, "fell", [1.35, 0.55, 0.85]);
        stopBump.position.set(0, 0.024 * H, 0.03 * H);
        headGroup.add(stopBump);
        var faceBase = s(0.044 * H, "fell", [1.0, 0.82, 0.86]);
        faceBase.position.set(0, 0.004 * H, 0.04 * H);
        headGroup.add(faceBase);
        function buildZyg(side) {
            var z = s(0.032 * H, "fell", [1.2, 0.55, 0.8]);
            z.position.set(side * 0.05 * H * kB, -0.008 * H, 0.03 * H);
            return z;
        }
        headGroup.add(buildZyg(-1));
        headGroup.add(buildZyg(1));
        function buildMass(side) {
            var m = s(0.032 * H, "fell", [0.72, 0.98, 0.72]);
            m.position.set(side * 0.048 * H * kB, -0.032 * H, 0.036 * H);
            return m;
        }
        headGroup.add(buildMass(-1));
        headGroup.add(buildMass(1));
        function buildJowl(side) {
            var j = s(0.022 * H, "fell", [0.82, 0.62, 0.9]);
            j.position.set(side * 0.042 * H, -0.026 * H, 0.06 * H);
            return j;
        }
        headGroup.add(buildJowl(-1));
        headGroup.add(buildJowl(1));
        var maxG = F.gruppe();
        maxG.position.set(0, -0.012 * H, 0.028 * H);
        maxG.scale.set(A.kopf.schnauzeB, A.kopf.schnauzeH, A.kopf.schnauzeL);
        var fangF = Math.max(0, Math.min(1, (P.diet - 0.25) / 0.4));
        var muzzle = s(0.044 * H, "fell", [P.snoutX, 0.78, P.snoutZ]);
        muzzle.position.set(0, -0.006 * H, 0.06 * H);
        maxG.add(muzzle);
        var muzzleBridge = s(0.036 * H, "fell", [P.snoutX * 0.87, 0.62, P.snoutZ * 0.61]);
        muzzleBridge.position.set(0, 0.006 * H, 0.048 * H);
        maxG.add(muzzleBridge);
        var palate = s(0.026 * H, "fell", [1.0, 0.55, 0.72]);
        palate.position.set(0, -0.02 * H, 0.066 * H);
        maxG.add(palate);
        var palateMesh = s(0.016 * H, "zahnfleisch", [2.0, 0.2, 1.6]);
        palateMesh.position.set(0, -0.018 * H, 0.066 * H);
        maxG.add(palateMesh);
        var noseTip = s(0.026 * H, "fell", [0.95, 0.72, 0.68]);
        noseTip.position.set(0, -0.014 * H, 0.11 * H);
        maxG.add(noseTip);
        var noseB = cH(0.015 * H, 0.008 * H, 0.072 * H, "straehneD");
        noseB.rotation.x = Math.PI / 2;
        noseB.position.set(0, 0.004 * H, 0.068 * H);
        maxG.add(noseB);
        // die Nase der Art (kopf.nase): sie sitzt in der Schnauzen-Gruppe und wüchse sonst mit deren Breite/Höhe und der
        // Kopf-Größe (der Bär trug eine 8 cm breite schwarze Kugel)
        var nose = s(0.02 * H * A.kopf.nase, "nase", [P.noseW, 0.86, 0.7]);
        nose.position.set(0, -0.014 * H, 0.132 * H);
        maxG.add(nose);
        for (var sd = -1; sd <= 1; sd += 2) {
            var n2 = s(0.006 * H, "dunkel", [1.2, 0.5, 1.0]);
            n2.position.set(sd * 0.012 * H, -0.008 * H, 0.138 * H);
            maxG.add(n2);
        }
        var ulip = s(0.016 * H, "fell", [1.42, 0.44, 0.88]);
        ulip.position.set(0, -0.024 * H, 0.112 * H);
        maxG.add(ulip);
        for (var sd = -1; sd <= 1 && fangF > 0.1; sd += 2) {
            var fang = cH(0.004 * H, 0.0015 * H, 0.03 * H * fangF, "zahn");
            fang.position.set(sd * 0.018 * H, -0.022 * H, 0.085 * H);
            fang.rotation.x = Math.PI * 0.92;
            maxG.add(fang);
            var carn = cH(0.0045 * H, 0.002 * H, 0.024 * H, "zahn");
            carn.position.set(sd * 0.024 * H, -0.024 * H, 0.05 * H);
            carn.rotation.x = Math.PI;
            maxG.add(carn);
        }
        for (var i = 0; i < 3; i++) {
            var inc = cH(0.0025 * H, 0.001 * H, 0.014 * H, "zahn");
            inc.position.set((i - 1) * 0.009 * H, -0.026 * H, 0.1 * H);
            inc.rotation.x = Math.PI;
            maxG.add(inc);
        }
        headGroup.add(maxG);
        jawGroup = F.gruppe();
        jawGroup.position.set(0, -0.04 * H, -0.018 * H);
        jawGroup.scale.set(A.kopf.schnauzeB, A.kopf.schnauzeH, A.kopf.schnauzeL);
        var jawLen = P.diet > 0.7 ? 1.6 : P.diet > 0.3 ? 1.5 : 1.65;
        var jawBody = s(0.027 * H, "fell", [0.74, 0.62, jawLen]);
        jawBody.position.set(0, -0.006 * H, 0.062 * H);
        jawGroup.add(jawBody);
        var chin = s(0.019 * H, "fell", [0.92, 0.7, 0.58]);
        chin.position.set(0, -0.016 * H, 0.122 * H);
        jawGroup.add(chin);
        var llip = s(0.014 * H, "fell", [1.3, 0.42, 0.76]);
        llip.position.set(0, -0.018 * H, 0.1 * H);
        jawGroup.add(llip);
        var tongue = s(0.013 * H, "zahnfleisch", [1.5, 0.42, 1.36]);
        tongue.position.set(0, -0.028 * H, 0.076 * H);
        jawGroup.add(tongue);
        for (var sd = -1; sd <= 1 && fangF > 0.1; sd += 2) {
            var fangL = cH(0.0035 * H, 0.0012 * H, 0.026 * H * fangF, "zahn");
            fangL.position.set(sd * 0.016 * H, 0.016 * H, 0.104 * H);
            jawGroup.add(fangL);
            var carnL = cH(0.004 * H, 0.0018 * H, 0.022 * H, "zahn");
            carnL.position.set(sd * 0.022 * H, 0.01 * H, 0.056 * H);
            jawGroup.add(carnL);
        }
        for (var i = 0; i < 3; i++) {
            var incL = cH(0.0022 * H, 0.0008 * H, 0.012 * H, "zahn");
            incL.position.set((i - 1) * 0.008 * H, 0.012 * H, 0.116 * H);
            jawGroup.add(incL);
        }
        headGroup.add(jawGroup);
        var jawThroatFill = s(0.044 * H, "fell", [1.3, 1.6, 1.7]);
        jawThroatFill.position.set(0, -0.006 * H, 0.01 * H);
        headGroup.add(jawThroatFill);
        var cheekFill = s(0.03 * H, "fell", [1.5, 0.85, 1.15]);
        cheekFill.position.set(0, 0.002 * H, 0.038 * H);
        headGroup.add(cheekFill);
        var jawHingeFill = s(0.024 * H, "fell", [1.2, 0.65, 1.05]);
        jawHingeFill.position.set(0, -0.034 * H, -0.022 * H);
        headGroup.add(jawHingeFill);
        var eyeY = 0.016 - (1 - P.diet) * 0.006;
        function buildEye(side) {
            var e = F.gruppe();
            var socket = s(0.021 * H, "dunkel", [1.1, 1.12, 0.32]);
            socket.position.z = -0.004 * H;
            e.add(socket);
            var ball = s(0.017 * H, "tierauge", [1.0, 1.0, 0.9]);
            e.add(ball);
            var pup = s(0.009 * H, "pupille", [0.8, 0.8, 0.5]);
            pup.position.z = 0.012 * H;
            e.add(pup);
            var cor = F.kugelFein(0.019 * H, "hornhaut", 32);
            e.add(cor);
            var lidT = s(0.019 * H, "fell", [0.98, 0.32, 0.88]);
            lidT.position.y = 0.012 * H;
            e.add(lidT);
            if (side < 0) lidTL = lidT;
            else lidTR = lidT;
            var lidB = s(0.017 * H, "fell", [0.94, 0.36, 0.88]);
            lidB.position.y = -0.012 * H;
            e.add(lidB);
            e.position.set(side * 0.054 * H * kB, eyeY * H, 0.014 * H);
            e.rotation.y = side * P.eyeFwd;
            return e;
        }
        headGroup.add(buildEye(-1));
        headGroup.add(buildEye(1));
        // DAS OHR der Art: "spitz" (Wolf · Fuchs: aufrechtes Dreieck mit dunklem Rand) · "rund" (Bär: kleine runde
        // Muschel) · "blatt" (Hirsch: großes ovales Löffel-Ohr, seitlich gestellt). Höhe und Basis je Art (Wolf 0,1 H,
        // Fuchs 0,15 H — vorher 0,062 H: halb so groß wie in der Natur).
        var oH = A.kopf.ohrH * H,
            oB = A.kopf.ohrB * H,
            oY = 0.03 * H + P.skullR * H * 0.78,
            oX = P.skullR * H * 0.95 * kB * 0.72;
        function buildEar(side) {
            var e = F.gruppe();
            if (A.kopf.ohrForm === "rund") {
                var muschel = s(oB, "fell", [1.0, oH / oB, 0.5]);
                muschel.position.y = oH * 0.55;
                e.add(muschel);
                var innenR = s(oB * 0.72, "zahnfleisch", [1.0, oH / oB, 0.25]);
                innenR.position.set(0, oH * 0.55, oB * 0.12);
                e.add(innenR);
                e.position.set(side * oX, oY - oB * 0.4, -0.07 * H);
                e.rotation.z = -side * 0.35;
                return e;
            }
            if (A.kopf.ohrForm === "blatt") {
                var blatt = s(oH * 0.5, "fell", [oB / (oH * 0.5), 1.0, 0.16]);
                blatt.position.y = oH * 0.5;
                e.add(blatt);
                var innenB = s(oH * 0.42, "zahnfleisch", [(oB * 0.8) / (oH * 0.42), 1.0, 0.08]);
                innenB.position.set(0, oH * 0.52, oB * 0.08);
                e.add(innenB);
                e.position.set(side * oX, oY - 0.01 * H, -0.065 * H);
                e.rotation.z = -side * 0.7;
                e.rotation.x = -0.25;
                return e;
            }
            var outer = cH(0.003 * H, oB, oH, "fell");
            outer.position.y = oH * 0.52;
            outer.scale.z = 0.32;
            e.add(outer);
            var inner = cH(0.002 * H, oB * 0.73, oH * 0.84, "zahnfleisch");
            inner.position.set(0, oH * 0.45, -0.004 * H);
            inner.scale.z = 0.28;
            e.add(inner);
            var rim = cH(0.0022 * H, 0.0018 * H, oH, "straehneD");
            rim.position.set(side * 0.002 * (H / 2.4), oH * 0.52, 0.002 * (H / 2.4));
            rim.scale.z = 0.3;
            e.add(rim);
            e.position.set(side * oX, oY - 0.012 * H, -0.052 * H);
            e.rotation.z = side * 0.15;
            e.rotation.x = -0.08;
            return e;
        }
        earL = buildEar(-1);
        earR = buildEar(1);
        headGroup.add(earL);
        headGroup.add(earR);
        wolf.add(headGroup);
        return {
            teile: {
                wolf: wolf,
                headGroup: headGroup,
                jawGroup: jawGroup,
                earL: earL,
                earR: earR,
                lidTL: lidTL,
                lidTR: lidTR,
                tailRoot: tailRoot,
                legFL: legFL,
                legFR: legFR,
                legHL: legHL,
                legHR: legHR,
                shoulderL: shoulderL,
                shoulderR: shoulderR,
                ribcage: ribcage,
                waist: waist,
                flank: flank,
                belly: belly,
                lowerAbd: lowerAbd,
                mane: mane,
                throat: throat,
                larynx: larynx,
                larynxUp: larynxUp,
                deltL: deltL,
                deltR: deltR,
                tricepL: tricepL,
                tricepR: tricepR,
                quadL: quadL,
                quadR: quadR,
                hamL: hamL,
                hamR: hamR,
                gastroL: gastroL,
                gastroR: gastroR,
                gluteL: gluteL,
                gluteR: gluteR,
                flU: flU,
                flL: flL,
                flP: flP,
                frU: frU,
                frL: frL,
                frP: frP,
                hlT: hlT,
                hlC: hlC,
                hlP: hlP,
                hrT: hrT,
                hrC: hrC,
                hrP: hrP,
                croup: croup,
                pelvis: pelvis,
                throatLower: throatLower,
                cranium: cranium,
            },
            neckStart: neckStart,
            neckDir: neckDir,
            neckEnd: neckEnd,
            // DER FELL-ORT (Integration W5-Körper): Lage und Größe der Körper-Teile, auf denen die Fell-Zeilen sitzen —
            // fellStreu liest NUR ihn (Lab und Ofen reichen ihn durch); die Zeilen folgen so der Anatomie der Art.
            fellOrt: {
                rumpf: {
                    bauch: stationOrt[8],
                    unterbauch: stationOrt[6],
                    flanke: stationOrt[7],
                    becken: stationOrt[4],
                    kruppe: stationOrt[2],
                },
                hals: { start: [neckStart.x, neckStart.y, neckStart.z], ende: [neckEnd.x, neckEnd.y, neckEnd.z], r: nR.slice() },
                glied: { p: Dp, d: Dd },
                throat: [throat.position.x, throat.position.y, throat.position.z],
                throatLower: [throatLower.position.x, throatLower.position.y, throatLower.position.z],
                mane: [mane.position.x, mane.position.y, mane.position.z],
                cranium: [cranium.position.x, cranium.position.y, cranium.position.z],
            },
            tailSegs: tailSegs,
            spineSegs: spineSegs,
            neckSegs: neckSegs,
            pawOffsets: pawOffsets,
            masse: {
                H: H,
                sY: sY,
                hY: hY,
                sZ: sZ,
                hZ: hZ,
                bX: bX,
                bt: bt,
                lv: lv,
                by: by,
                tv: tv,
                // Welle 5: die Lage des Rumpf-Profils (21 Stützstellen über u) und des Kopfes — das Fell-Muster liest sie
                rumpf: {
                    zRear: zRear,
                    zFront: zFront,
                    oben: stationen.map(function (_s, i) {
                        return oben(i / (NS - 1));
                    }),
                    unten: stationen.map(function (_s, i) {
                        return unten(i / (NS - 1));
                    }),
                },
                kopf: { y: headY, z: headZ, g: kG },
                rute: nSeg,
            },
            P: P,
        };
    }

    // W8 — die Gestalten je Rezept (B2c): JEDE Gattung trägt GESTALTEN_JE_REZEPT Individuen (eine neue zählt mit).
    for (var _gid in PRESETS) PORTAL_RENDER_CONFIG.lod.budget.gestalten[_gid] = GESTALTEN_JE_REZEPT;

    // ── DIE TREFFER-ZONE JE GLIED (Welle L 06.10., additiv) ──
    // Das Treffer-Volumen eines Tiers sind seine Glieder (die Teile aus bauTier, dieselben Anker wie die
    // Fern-Kapseln); jedes Glied trägt die Zone der Prüfstand-Tafel (schmiede ARENA.zonen). Der Rumpf ("wolf",
    // die Wurzel des Leibs) teilt sich am Hals: die Hälfte zum Kopf ist Brust, die andere Bauch. Die Rute ist
    // eine Extremität wie die Pfote. Unbenannte Glieder gehören zum Rumpf.
    var TREFFER_ZONE = Object.freeze({
        headGroup: "kopf",
        jawGroup: "kopf",
        cranium: "kopf",
        earL: "kopf",
        earR: "kopf",
        lidTL: "kopf",
        lidTR: "kopf",
        legFL: "bein",
        legFR: "bein",
        legHL: "bein",
        legHR: "bein",
        flU: "bein",
        frU: "bein",
        flL: "bein",
        frL: "bein",
        hlT: "bein",
        hrT: "bein",
        hlC: "bein",
        hrC: "bein",
        flP: "fuss",
        frP: "fuss",
        hlP: "fuss",
        hrP: "fuss",
        tailRoot: "fuss",
        wolf: "rumpf",
    });
    function trefferZone(gliedName) {
        var n = typeof gliedName === "string" ? gliedName : "";
        if (TREFFER_ZONE[n]) return TREFFER_ZONE[n];
        if (n.indexOf("tailSeg") === 0) return "fuss";
        return "rumpf";
    }

    // ── Der Namensraum (Vertrag v1.1 §7 + §8 MESHFREI) ──
    root.__tetrapodaCore = {
        VERSION: VERSION,
        ARCHETYPES: ARCHETYPES,
        buildSkeleton: buildSkeleton,
        deriveTierParams: deriveTierParams,
        cpgStep: cpgStep,
        bauTier: bauTier,
        MASSSTAB: MASSSTAB,
        ART_GESTALT: ART_GESTALT,
        artGestalt: artGestalt,
        tierAuge: tierAuge,
        fellFarbe: fellFarbe,
        ANATOMIE_SOLL: ANATOMIE_SOLL,
        GANG_GESETZ: GANG_GESETZ,
        gangSchritt: gangSchritt,
        gangFuss: gangFuss,
        STEUER_GESETZ: STEUER_GESETZ,
        tempoEinheit: tempoEinheit,
        steuerSchritt: steuerSchritt,
        ankunftTempo: ankunftTempo,
        herdeZug: herdeZug,
        temperamentDerGattung: temperamentDerGattung,
        TIER_MATERIAL_KLASSEN: TIER_MATERIAL_KLASSEN,
        FELL_LOOK: FELL_LOOK,
        DIAL_MAP: DIAL_MAP,
        STUDIO_VERTRAG: STUDIO_VERTRAG,
        MESHFREI: MESHFREI,
        PORTAL_RENDER_CONFIG: PORTAL_RENDER_CONFIG,
        PRESETS: PRESETS,
        PARAMS_BY_KIND: { kreatur: PARAMS },
        // Die Lab-Quellen (die Shell liest DIESE eine Quelle — Aliasse):
        GATTUNGEN: GATTUNGEN,
        MOTION: MOTION,
        CPG_COUPLING: CPG_COUPLING,
        STAND_POSE: STAND_POSE,
        VERHALTEN: VERHALTEN,
        fellStreu: fellStreu,
        TREFFER_ZONE: TREFFER_ZONE,
        trefferZone: trefferZone,
    };
})(typeof self !== "undefined" ? self : globalThis);
