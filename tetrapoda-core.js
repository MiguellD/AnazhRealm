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
    // (bauTier: Stufe 0 = voller Gelenk-Baum · Stufe 1 = gelenkige Grobstufe).
    // B2 bleibt N/A (kein buildInstance) — die Zeile ist die VERTRAGS-Wahrheit der
    // Pipe-Bäckerei (BAKERS_BY_KIND), gemessen von gate:konsum-matrix/gate:tier-fern.
    // B2c-Daten (W8, rein additiv): DAS BUDGET je Ofen-Stufe (docs/studio-vertrag.md B2c) — tris = die gebaute
    // Hülle über alle Gattungen × 16 Gestalten (gate:asset-contract, die Ratsche fällt nur), band = das Profi-Band-
    // Ziel (Haushalt, offen solange tris darüber liegt), draws = Draws je Tier und Pass nach der Wirts-Regel: das
    // Budget-Gesetz am Ausgang (Brücke UND Sync-Guss des Wirts-Ofens, phyto-core budgetErzwingen) faltet die
    // starren Stoffe je Bindungs-Klasse (Haut und Fell-Schale bleiben) und Seh-Klasse (TIER_MATERIAL_KLASSEN.seh:
    // das glimmende Auge · Hornhaut/Pupille · Nase/Ballen · Fell · Klaue/Zahn bleiben getrennt — L1 5 ist das
    // gemessene Minimum); schatten = die werfende Stufe.
    // gestalten = Individuen je Gattung (gefüllt je Rezept unten bei PRESETS): EINE — der Guss ist seed-invariant
    // (Same 1 ≡ 2 byte-gleich, 4/4, L0 und L1), 16 Gestalten waren 16 byte-gleiche Zwillinge. Eine Seed-Achse ist ein
    // Re-Mint-Akt, nie eine Zahl hier (S3 08.10., gate:asset-contract Gestalten-Wand).
    var GESTALTEN_JE_REZEPT = 1;
    var PORTAL_RENDER_CONFIG = {
        lod: {
            kindStages: { kreatur: [0, 1] },
            budget: {
                kreatur: {
                    0: { tris: 62000, band: 20000, draws: 8, schatten: 1 },
                    1: { tris: 7000, band: 3000, draws: 5, schatten: 1, ab: 35, wurf: { seh: ["haar"] } },
                    // S3 (rein additiv, Lehre 19): die Grobstufe trägt ab `ab` m × Körpergröße das Bild und wirft für beide
                    // Stufen (die feine wirft über `schatten: 1` ihren Zwilling); `wurf.seh` wählt den werfenden Teil
                    // (das Fell: Leib, Ohren, Lider, Pfoten). `hyst` = die Hysterese der Stufen-Grenze (±10 %). 35 m: der
                    // Beinschwung ist dort ~2,7 px (die Grenze war bis S3 die Wirts-Konstante TIER_FERN_DIST_SQ).
                    hyst: 0.1,
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
    // ── Die Stand-Pose (byte-treu Lab Z.96; das CPG-Kopplungsnetz Z.80 fiel mit dem Pass-Netz, Tiere H3) ──
    // prettier-ignore
    var STAND_POSE = [[0.02,-0.03,0.05,0.02],[0.02,-0.03,0.05,0.02],[-0.02,0.02,0.05,-0.02],[-0.02,0.02,0.05,-0.02]];
    // ── Die Emotions-Bewegungsprofile (byte-treu Lab Z.130–135) — das motion-Feld: die HALTUNG der Stimmung. Die Fußfolge
    //    (phases) fiel mit der Gangart aus dem Tempo (GANG_FOLGE, Meisterkarte Tiere H3): das Muster folgt der Physik ──
    // prettier-ignore
    var MOTION = {
    idle:{freq:0.25,bodyX:0,bodyZ:0,headX:-0.01,headY:0,ear:0.15,tailAmp:0.10,tailRate:0.5,tension:0.9,bob:0.002,sway:0.006,kpMul:1.0},
    joy:{freq:3.2,bodyX:-0.04,bodyZ:0.02,headX:0.04,headY:0,ear:0.05,tailAmp:0.38,tailRate:5.5,tension:1.0,bob:0.020,sway:0.025,kpMul:0.55},
    hunt:{freq:0.9,bodyX:0.10,bodyZ:0,headX:-0.12,headY:0,ear:0.0,tailAmp:0.02,tailRate:0.15,tension:1.6,bob:0.002,sway:0.002,kpMul:1.8},
    flee:{freq:9.0,bodyX:0.05,bodyZ:0,headX:0.01,headY:0,ear:-0.22,tailAmp:0.006,tailRate:11.0,tension:1.5,bob:0.030,sway:0.010,kpMul:1.5},
    alert:{freq:0.08,bodyX:-0.03,bodyZ:0,headX:-0.06,headY:0,ear:0.08,tailAmp:0.04,tailRate:0.6,tension:1.2,bob:0.001,sway:0.001,kpMul:1.3},
    showcase:{freq:0.1,bodyX:0,bodyZ:0,headX:-0.02,headY:0,ear:0.12,tailAmp:0.16,tailRate:0.4,tension:0.9,bob:0.002,sway:0.012,kpMul:1.0},
    // SCHWIMM-HEIMAT (rein additive DATEN-Zeile): der PADDEL-GANG — die Paddel-Folge
    // traegt GANG_FOLGE.paddeln, Nase ueber Wasser (headX +), Schwanz als Ruder (tailAmp/Rate),
    // gedaempftes Bob (das Wasser traegt). Der Wirt schaltet ihn ueber den
    // Koerper-ZUSTAND "schwimmen" (_motionProfileName, nie ueber Emotionen).
    schwimmen:{freq:2.2,bodyX:0.06,bodyZ:0,headX:0.08,headY:0,ear:-0.05,tailAmp:0.28,tailRate:2.4,tension:1.1,bob:0.004,sway:0.02,kpMul:0.9}
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
            playbow: { dauer: 1.2, profil: { freq: 0.3, bodyX: 0.35, headX: 0.3, tailAmp: 0.5, tailRate: 6 }, tempo: 0 }, // SCHAU-BEFUND 17.07.: Verbeugung senkt die FRONT (bodyX war -0.35 = Heck im Boden)
            bound: { dauer: 0.9, profil: { freq: 5.5, bob: 0.05 }, hop: true, tempo: 1.3 },
            spin: { dauer: 1.1, profil: { freq: 4.0 }, dreh: 6.283, tempo: 0.2 },
            stalk: { dauer: 2.6, profil: { freq: 0.7, bodyX: 0.12, headX: -0.14 }, tempo: 0.45 },
            freeze: { dauer: 1.4, profil: { freq: 0.02, tension: 1.8 }, tempo: 0 },
            pounce: { dauer: 0.7, profil: { freq: 6.0, bodyX: 0.2, bob: 0.06 }, hop: true, tempo: 1.6 },
            scan: { dauer: 1.8, profil: { freq: 0.06, headX: -0.08 }, kopfSweep: 0.5, tempo: 0 },
            snap: { dauer: 0.5, profil: { headX: 0.22, freq: 1.5 } },
            shake: { dauer: 0.8, profil: { freq: 0.2 }, rollAmp: 0.35, rollRate: 14, tempo: 0 },
            yawn: { dauer: 1.3, profil: { headX: -0.3, freq: 0.05 }, tempo: 0 },
            grasen: { dauer: 6.0, profil: { headX: 0.95, freq: 0.12, tailAmp: 0.18, tailRate: 1.2 }, tempo: 0.15 }, // SCHAU-BEFUND 17.07.: 0.4 = Maul 23 Grad ueber dem Boden; 0.95 senkt die Nase ins Gras
            // DER KADAVER WIRD GEFRESSEN (Meisterkarte Tiere H3): der Kopf senkt sich in den Riss, der Leib steht
            fressen: { dauer: 4, profil: { headX: 0.95, freq: 0.1, bodyX: 0.08, tailAmp: 0.12, tailRate: 1.6 }, tempo: 0 },
            ruhen: { dauer: 16, profil: { freq: 0.04, bodyX: 0.05, headX: 0.2, tailAmp: 0.03, tailRate: 0.3 }, tempo: 0 }, // SCHAU-BEFUND 17.07.: -0.08 hob die Brust; Ruhe senkt Rumpf+Kopf leicht
        },
        stimmung: {
            joy: { aktionen: ["playbow", "bound", "spin"], alle: [4, 9] },
            jagd: { aktionen: ["stalk", "freeze", "pounce"], alle: [3, 7] },
            alert: { aktionen: ["scan", "snap"], alle: [2, 5] },
            idle: { aktionen: ["scan", "shake", "yawn"], alle: [7, 16] },
            tag: { aktionen: ["grasen", "scan"], alle: [10, 22] },
            nacht: { aktionen: ["ruhen", "yawn"], alle: [8, 18] },
            fressen: { aktionen: ["fressen"], alle: [0, 0.4] },
            // SCHLUSS-WELLE (Spiegel-Zensus 17.07., rein additive DATEN-Zeile):
            // die SCHWELLEN des Verhaltens-Ticks — ab wann das Gemuet die
            // Stimmung waehlt (chaos→alert, joy→joy), wann Nacht ist (Sonnen-
            // Sinus unter nachtSin: die Lichtphase des ETHOGRAMM_GESETZ, Tiere K4)
            // und wer weidet (diet ≤ weideDiet).
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
            speedBoost: 1.45, // Jagd ist schneller als Schlendern, langsamer als Flucht (1.6)
            strikeCooldownSec: 1.6, // s — zwischen zwei Bissen
            damageMul: 0.8, // × dem damage-Stat des Wesens
            fearHpFrac: 0.5, // unter dieser HP-Fraktion wird Schaden zur FURCHT (threatened)
            triumphWindowSec: 20, // s — ein Jaeger, so frisch er biss, gebiert beim Fall TRIUMPH
            // DER SPIELER IST BEUTE WIE JEDES TIER (oekologie.K4, VERTRAGS-AKT 26.10.): seine Witterung reicht scentRangeM wie die
            // jedes Leibs, der Wind traegt sie; radius (12 m, eine Spieler-Reichweite ohne Wind und Hunger) fiel.
            scentRangeM: 50, // m — Beute-Wittern ueber das Geruch-Feld (weiter als Sehen), Tier und Spieler
            // DER BISS IST DER ANSPRUNG (Welle LF kampf 09.10., VERTRAGS-AKT): gebissen wird im Ansprung (aktionen.pounce),
            // wenn der Kopf der Gestalt den Leib des Ziels beruehrt — die Reichweite ist der Weg des Ansprungs (pounce.tempo ×
            // tempoEinheit × seine Dauer), die Hetze haelt, wo das Maul den Leib erreicht. strikeRange (2,4 m um die Mitten,
            // jede Gestalt) und pirschStoppM (1,6 m) fielen: Bisse ohne Geste aus 1,36–2,39 m (Leben-Schau 07.10., K-D13).
            // DIE JAGD SCHLIESST SICH (Welle LF 08.10., VERTRAGS-AKT): der Jaeger pirscht (unbemerkt bis pirschSichtM),
            // bezieht im Rudel seinen Platz auf dem Ring hetzM um das Ziel (die Flanke) und hetzt von dort im Sprint der
            // Gestalt (STEUER_GESETZ.sprint); Beute ist, wer nicht wild ist und hoechstens beuteMasse × die eigene Masse
            // traegt (der Baer ist keine Beute des Wolfs). Vorher folgte er einem Gradienten, der vom Ziel fortzeigte,
            // im Schritt-Tempo: 0 Bisse in 3600 Takten, der Sprinter entkam immer (Leben-Schau 07.10.).
            hetzM: 6, // m — von hier hetzt der Jaeger (der Ring, auf dem das Rudel seine Plaetze bezieht)
            pirschSichtM: 5, // m — einen pirschenden Jaeger bemerkt die Beute erst hier (einen hetzenden ab noticeRadius)
            // DIE EINE MASSE (V18.536): das Volumen der Gestalt × MASSSTAB.dichteKgM3 (Fuchs 15 · Wolf 64 · Hirsch 94 · Baer
            // 335 kg bei Groesse 1) — ein grosser Fleischfresser schlaegt Beute um seine eigene Masse und darueber (Carbone
            // et al. 2007): der Wolf (64 kg) den Hirsch (94 kg), nie den Baeren (335 kg).
            beuteMasse: 2.0, // × die eigene Masse (kg) — schwerer ist keine Beute
        },
        // DER KREISLAUF SCHLIESST SICH (Meisterkarte Tiere H3, VERTRAGS-AKT 20.10.): ein gefallener Leib ist ein KADAVER mit
        // Zustand — sein Fleisch (kg: fleischAnteil × die EINE Masse des Leibs; Huftiere ~60 % essbar) und sein Alter (die
        // Uhr seines Falls). Jeder Nicht-Pflanzenfresser (diet ueber temperament.gattung.pflanzDiet) wittert ihn ueber das
        // Geruch-Feld (_scentAt, Quelle = das Fleisch, Reichweite jagd.scentRangeM), geht hin und frisst: in fressSec fuellt ein
        // leerer Magen (magenAnteil × die eigene Masse; Mech 2003: ein Wolf frisst bis ~20 % seiner Masse) — ein Kadaver ohne
        // Fleisch sinkt in die Erde. Der Magen leert sich in verdauSec; erst unter hungerAnteil jagt und frisst das Tier
        // wieder (satt jagt keine Beute). Vorher lag der Riss 90 s ohne Zustand und sank, kein Tier sah ihn an.
        aas: {
            fleischAnteil: 0.6, // × die Masse des Leibs (kg) — das Fleisch des Kadavers
            magenAnteil: 0.2, // × die eigene Masse (kg) — so viel frisst ein Tier auf einmal
            fressSec: 60, // s — so lange fuellt ein leerer Magen
            verdauSec: 600, // s — so lange leert sich ein voller
            hungerAnteil: 0.5, // unter diesem Anteil des Magens jagt und frisst das Tier
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
            combatFearWariness: 1.5, // ein getroffenes Wesen ist garantiert ueber der Flucht-Schwelle
            fearSec: 5, // s — wie lange die Kampf-Furcht (fearUntil) anhaelt
        },
        temperament: {
            // DAS TEMPERAMENT DER GATTUNG (Welle LF 08.10., VERTRAGS-AKT): aus der Ernaehrung (Dial diet) und der EINEN
            // Masse des Leibs (kg: das Volumen der Gestalt × MASSSTAB.dichteKgM3, beim Wirt _leibMasse) —
            // temperamentDerGattung. Ein Fleischfresser mit Masse jagt (wild), ohne sie ist er scheu; ein Pflanzenfresser
            // ist ein Fluchttier (scheu), erst als Koloss wehrhaft; dazwischen wehrt sich, wer Masse hat (wehrhaft), sonst
            // sanft. Die Substanz-Signaturen und ihr Floor fielen: die Tiere sind tag-gleich, Hirsch und Fuchs blieben
            // „wehrhaft" (Leben-Schau 07.10., D16/K-D12).
            gattung: {
                fleischDiet: 0.75, // diet ab hier: Fleischfresser
                pflanzDiet: 0.25, // diet bis hier: Pflanzenfresser (Fluchttier)
                jagdKg: 21.5, // kg — ab hier schlaegt ein Fleischfresser grosse Beute (Carbone et al. 2007; Wolf ab Groesse 0,7)
                wehrKg: 200, // kg — ab hier wehrt sich ein Allesfresser (der Baer ab Groesse 0,84, das Jungtier nicht)
                kolossKg: 600, // kg — ab hier wehrt sich auch ein Fluchttier (der Hirsch erst als Gigant, ab Groesse 1,86)
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
        // Kohaesion) · wasser (Ufer-Scheu) — plus
        // stimmung.schwellen oben (furcht.neugierStoppM fiel mit dem persoenlichen Raum, Welle LF). Der Wirt liest
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
            // DER PERSOENLICHE RAUM (Welle LF 08.10., VERTRAGS-AKT): je Leib die Koerper-Kugel (die waagrechte Spanne der
            // Gestalt um ihre Mitte, beim Wirt halb + Radius des Leibs, in Hueft-Hoehen der Art und Groesse) × raumKugel; der
            // Paar-Raum zweier Tiere ist die Summe, auch zum Spieler (seine Wand-Kapsel × raumKugel). Darin stoesst die
            // Separation, die Herde zieht nicht, die Neugier haelt an. Vorher galt fuer jede Art 1,6 m × bodySize, die
            // neugierige Schar kroch auf 0,7 m zusammen und durchdrang sich und den Spieler (Leben-Schau 07.10.).
            raumKugel: 1.3, // × Koerper-Kugel — der Raum, den ein Leib um sich haelt
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
            // (Welle LF 08.10., VERTRAGS-AKT): im Paar-Raum zieht kein Nachbar, das Fenster und der Zug messen in ihm und im
            // Tempo des Tiers — vorher zog jeder Nachbar ab 1 m mit 0,5 m/s, mehr als die Separation stiess.
            fensterRaum: 2.5, // × Paar-Raum — bis dahin zieht die Schar zusammen
            gewicht: 0.5, // × Tempo des Tiers — der Zug je Nachbar
            maxNachbarn: 6, // Kohaesions-Budget je Wesen (dann bricht der Scan ab)
            wurf: { wolf: [3, 6], deer: [3, 7], fox: [1, 1], bear: [1, 1], abstandRaum: 1.3 }, // DIE GEBURT WIRFT GRUPPEN (G4a 16.10., additiv): Kopfzahl [min, max] je Gattung — das Rudel 3–6 (Mech & Boitani 2003; zu viert jagt es am besten, MacNulty et al. 2014), das Kahlwild-Rudel 3–7 (Clutton-Brock et al. 1982), Fuchs und Baer einzeln; der Abstand der Geworfenen in Paar-Raeumen (ausserhalb des Raums, im Fenster fensterRaum)
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
    // dem Lab): phases[4] werden über die Kopplungs-Matrix + Gain 0.8 fortgeschrieben — mit der Folge der Gangart
    // (GANG_FOLGE) zieht das Netz sie in deren Muster (cpgStep, unten).
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
    // durch den größten Bein-Winkel; der Fuß fegt im Stand (Tastgrad tast) den Fußweg S = tast · Λ, die Frequenz folgt
    // dem Weg (ω = 2π·v/Λ) — vorher lief der Takt aus dem Gefühls-Profil (Freude 3,2 rad/s, Schritt 0,06 rad) bei jeder
    // Geschwindigkeit: die Pfoten glitten mit dem Leib (Schlupf 1,0, gate:tier-gang). gangFuss liest je Bein das ZIEL
    // des Fußes zur Phase: im STAND (π…2π) wandert er am Boden gleichförmig von vorn (+S/2) nach hinten (−S/2), im
    // SCHWUNG (0…π) kehrt er auf einer Hermite-Kurve nach vorn, die an beiden Enden mit der Stand-Rate rückwärts läuft
    // (kein Vorwärts-Rutschen beim Aufsetzen), gehoben um hub·h·sin(Phase)^hubForm. Hüfte und Unterglied stellt der Wirt per
    // ebener Zwei-Knochen-IK auf dieses Ziel (die Pfote bleibt waagrecht) — der Fuß steht, wo das Gesetz ihn hinstellt.
    var GANG_GESETZ = Object.freeze({
        g: 9.81,
        // DIE SCHRITT-LÄNGE DER VIERBEINER (Meisterkarte Tiere H3): λ/L = schrittBasis + schrittFroude · v̂, an Alexander & Jayes
        // 1983 gelegt (λ/L ≈ 2,3 · v̂^0,6 — v̂ 1,2: 2,6 · v̂ 3,5: 4,9): der Wolf galoppiert bei 8,7 m/s mit 2,8 Schritten je
        // Sekunde (Natur ~3). Vorher 1,2 + 2,0 · v̂ (8,2 L im Galopp, 1,7 Schritte je Sekunde, langsamer als sein Trab).
        schrittBasis: 1.4,
        schrittFroude: 1.0,
        // DER TASTGRAD DER GANGART (K3, Alexander 1984, Hildebrand 1965): im Schritt steht jeder Fuß zwei Drittel des Takts
        // (drei Füße tragen, Schritt 0,6–0,7), über die Schwelle des Trabs (GANG_FOLGE.froudeTrab × (1 + hysterese) bis
        // zum Doppelten) fällt er auf tastgradTrab (die Diagonalen im halben Takt). Vorher stand der Fuß in Schritt und
        // Trab den halben Takt (gate:tier-gang: Schritt 0,52–0,54).
        tastgrad: 0.65,
        tastgradTrab: 0.5,
        maxWinkel: 0.42, // rad — die größte Bein-Auslenkung (deckelt die Schritt-Länge)
        hub: 0.12, // × h — die Schwung-Höhe des Fußes
        // die Form des Hubs (Welle LF, Stand-Schlupf): sin(Phase)^hubForm — der Fuß hebt steil ab und setzt steil auf. Mit
        // sin(Phase) hing er ein Drittel des Schwungs in den untersten 3 cm und strich dort mit 0,8–1,1 × Leib-Tempo über
        // den Boden (die Hälfte des Stand-Schlupfs am Querhang, gate:tier-gang mit erreichtem Boden 0,16–0,49)
        hubForm: 0.5,
        falte: 0.6, // rad — die Pfote faltet im Schwung
        stand: 0.05, // m/s — darunter steht das Tier
        vMax: 15, // m/s — Sprünge der Lage (Spawn, Peer-Schnapp) sind kein Lauf
        // DER TASTGRAD DES GALOPPS (Meisterkarte Tiere H3): im Galopp steht jeder Fuß kürzer — der Tastgrad fällt mit der
        // Froude-Zahl über die Schwelle des Galopps (GANG_FOLGE.froudeGalopp) bis tastgradLauf, höchstens bis die Kontaktzeit
        // den Fußweg des Bein-Winkels trägt (Weyand 2000); der Schritt wächst mit der Schwebe. Vorher stand der Fuß in jeder
        // Gangart den halben Takt: der Wolf galoppierte bei v̂ 3,5 mit 7,7 Schritten je Sekunde (Natur ~3), acht Bilder je
        // Schritt, und die Grenze des Beins hob jeden Fuß vor der Zeit. Im Galopp fegt das Bein weiter (Schulterblatt und
        // Rücken strecken den Stand, K3): der größte Winkel wächst mit dem Wechsel bis winkelLauf — vorher deckelte
        // maxWinkel auch den Galopp, der Fuß stand 0,18 des Takts (Natur ~0,3, Walter & Carrier 2007).
        tastgradLauf: 0.3,
        winkelLauf: 0.48,
    });
    // DIE GANGART AUS DEM TEMPO (Meisterkarte Tiere H3, VERTRAGS-AKT 20.10.): die Fußfolge folgt der Froude-Zahl Fr = v̂² =
    // v²/(g·L), nie der Stimmung — unter froudeTrab der Schritt in lateraler Folge (nach jedem Hinterfuß der Vorderfuß
    // derselben Seite, je ein Viertel-Takt: Hildebrand 1965), bis froudeGalopp der Trab (die Diagonalen gemeinsam), darüber
    // der Dreh-Galopp der Hunde (die Hinterfüße, dann die Vorderfüße, im Paar je 0,15 Takt versetzt — nie genau gegenphasig
    // zum Trab: ein Wechsel aus der Gegenphase bliebe im instabilen Gleichgewicht des Netzes stehen). Säuger jeder
    // Größe wechseln bei Fr ≈ 0,5 in den Trab und bei Fr ≈ 2–3 in den Galopp (Alexander & Jayes 1983, dynamische
    // Ähnlichkeit). folge = die Phasen-Versätze der Beine [VL, VR, HL, HR] (rad; der Stand beginnt bei Phase π, ein größerer
    // Versatz setzt früher auf); paddeln = die Folge im Wasser (das Medium, kein Gemüt: der Paddel-Gang diagonal);
    // kopplung (je rad des Takts) zieht die Beine in das Muster (cpgStep mit folge): der Zug wächst mit dem Takt, ein Wechsel
    // schließt in etwa einem Schritt — stärker (fest 4/s) zog er im Schritt die stehenden Füße mit (Stand-Schlupf am Querhang
    // 0,03 → 0,06), schwächer (fest 1/s) hielt der Fuchs-Galopp sein Muster nicht gegen die Grenze des Beins. Vorher
    // wählte die Stimmung das Muster (MOTION.phases, gesetzt beim Profil-Wechsel), und das Netz zog jedes in den Pass.
    var GANG_FOLGE = Object.freeze({
        froudeTrab: 0.5,
        froudeGalopp: 2.5,
        schritt: Object.freeze([0, Math.PI, 0.5 * Math.PI, 1.5 * Math.PI]),
        trab: Object.freeze([0, Math.PI, Math.PI, 0]),
        galopp: Object.freeze([0, 0.3 * Math.PI, 1.2 * Math.PI, 0.9 * Math.PI]),
        paddeln: Object.freeze([0, Math.PI, Math.PI, 0]),
        kopplung: 0.3,
        // DIE HYSTERESE DES WECHSELS: wer geht, wechselt erst über froudeTrab × (1 + hysterese) in den Trab, wer trabt, erst
        // unter froudeTrab × (1 − hysterese) zurück (ebenso am Galopp) — ein Folger, der um die Schwelle pendelt, wechselt
        // nicht je Takt (Säuger wechseln hinauf später als hinab; Hoyt & Taylor 1981)
        hysterese: 0.2,
    });
    // die Gangart zur Froude-Wurzel v̂; mit der Gangart des Vor-Takts (vorher) über die Hysterese
    function gangArt(vh, vorher) {
        var fr = vh * vh,
            h = GANG_FOLGE.hysterese,
            rang = vorher === "galopp" ? 2 : vorher === "trab" ? 1 : vorher ? 0 : -1;
        var fT = GANG_FOLGE.froudeTrab * (rang < 0 ? 1 : rang >= 1 ? 1 - h : 1 + h),
            fG = GANG_FOLGE.froudeGalopp * (rang < 0 ? 1 : rang >= 2 ? 1 - h : 1 + h);
        return fr < fT ? "schritt" : fr < fG ? "trab" : "galopp";
    }
    // DIE ZEILE DES GESETZES (K07, additiv): gangSchritt und gangFuss sind das EINE Gang-Gesetz für Vier- und Zweibeiner —
    // die Zeile Z trägt die Zahlen der Gestalt (der Mensch: koerper-core fx.bewegung.gang), ohne Zeile gilt GANG_GESETZ
    // (die Tiere, byte-gleich). Fehlt der Zeile ein Feld (g, stand, vMax), trägt GANG_GESETZ. Der Tastgrad wandert mit der
    // Froude-Zahl Fr = v̂² vom Gehen (tastgrad) zum Laufen (tastgradLauf), wo die Zeile ihn nennt (laufFroude = die Fr der
    // Mitte des Wechsels; Alexander 2004: Gehen 0,55–0,7, Laufen ≈ 0,39, der Wechsel bei Fr ≈ 0,5). Zurück kommt auch der
    // Tastgrad (tast), den gangFuss als Anteil des Stands am Zyklus liest, und der Hub des Schwungs (× L) — er wandert mit
    // demselben Wechsel zu hubLauf, wo die Zeile ihn nennt (der laufende Fuß schwingt hoch, der gehende knapp). Die Schwere g
    // der Zeile ist die EINE Schwere des Gangs (Schritt und Becken lesen sie; der Wirt setzt die seiner Welt) — ohne Schwere
    // (g ≤ 0) trägt kein Bein: kein Gang, der Leib schwebt. Zurück kommt auch die GANGART (art, folge — GANG_FOLGE): ein
    // stehender Leib trägt die Folge des Schritts, aus der er anläuft; vorher (die Gangart des Vor-Takts) legt die Hysterese an.
    function gangZahl(Z, k) {
        return Z && typeof Z[k] === "number" ? Z[k] : GANG_GESETZ[k];
    }
    function gangSchritt(v, L, Z, vorher) {
        var G = Z || GANG_GESETZ;
        var tast = gangZahl(G, "tastgrad"),
            hub = gangZahl(G, "hub");
        var g = gangZahl(G, "g");
        if (!(v > gangZahl(G, "stand")) || !(L > 0) || !(g > 0))
            return { omega: 0, S: 0, schritt: 0, tast: tast, hub: hub, art: "stand", folge: GANG_FOLGE.schritt };
        var vv = Math.min(v, gangZahl(G, "vMax"));
        var vh = vv / Math.sqrt(g * L);
        var mW = gangZahl(G, "maxWinkel");
        var sMax = 2 * L * Math.tan(mW);
        var lamF = L * (gangZahl(G, "schrittBasis") + gangZahl(G, "schrittFroude") * vh);
        // die Zeile ohne eigenen Wechsel (die Tiere) läuft ab der Schwelle des Galopps und trabt mit tastgradTrab
        var tier = !(G.laufFroude > 0);
        var tL = gangZahl(G, "tastgradLauf"),
            fL = tier ? GANG_FOLGE.froudeGalopp : G.laufFroude;
        if (tier) {
            var fT = GANG_FOLGE.froudeTrab * (1 + GANG_FOLGE.hysterese);
            var wT = Math.max(0, Math.min(1, (vh * vh - fT) / fT));
            tast += (gangZahl(G, "tastgradTrab") - tast) * wT * wT * (3 - 2 * wT);
        }
        if (tL > 0 && fL > 0) {
            var w = Math.max(0, Math.min(1, (vh * vh - 0.7 * fL) / (0.6 * fL)));
            w = w * w * (3 - 2 * w);
            if (tier) sMax = 2 * L * Math.tan(mW + (gangZahl(G, "winkelLauf") - mW) * w);
            // im Lauf fegt das Bein höchstens seinen Winkel: der Fußweg bleibt bei sMax, der Tastgrad fällt mit dem Tempo
            // (die Kontaktzeit = sMax / v — Weyand 2000), der Schritt wächst weiter mit der Froude-Zahl
            tast += ((tier ? tL : Math.min(tL, sMax / lamF)) - tast) * w;
            if (G.hubLauf > 0) hub += (G.hubLauf - hub) * w;
        }
        var lamMax = sMax / tast;
        var lam = Math.min(lamF, lamMax);
        var art = gangArt(vh, vorher);
        return { omega: (2 * Math.PI * vv) / lam, S: tast * lam, schritt: lam, tast: tast, hub: hub, art: art, folge: GANG_FOLGE[art] };
    }
    // Das Fuß-Ziel EINES Beins zur Phase ph (rad) bei Fußweg S (m): {dz (m, + = vor der Ruhe-Lage), hub (0…1)}. Der
    // Schwung füllt 0 … 2π·(1 − tast), der Stand den Rest; ohne tast (oder 0,5) teilt π.
    // hubForm aus der Zeile Z (sonst GANG_GESETZ).
    // DAS ABROLLEN DES FUSSES (K07, additiv — die Tiere lesen es nicht: ohne rollWinkel der Zeile oder ohne Reichweite R
    // bleibt der Fuß flach, byte-gleich): ab fersenAb des Stands hebt sich die Ferse, der Fuß rollt über den Ballen
    // (ballen × R vor dem Knöchel, der Knöchel knoechel × R über der Sohle) bis rollWinkel beim Abheben, der Winkel wächst
    // quadratisch; im Schwung klingt er bis zur Mitte ab. Der Ballen steht, der Knöchel steigt um dy und rückt um dx vor
    // (gangRolle) — das hintere Bein reicht weiter. Darum setzt der Fuß um den Versatz d hinter der Mitte des Fußwegs auf,
    // so weit, dass die Senke beim Aufsetzen vorn der beim Abheben hinten gleicht (gangVersatz; Saunders 1953, Kerrigan
    // 2001: die Ferse hebt die Senke des Doppel-Stands; Gard 2004: 4–5 cm). Vorher stand der Fuß flach bis zum Abheben,
    // das Becken des Gehens sank um 0,137 L (11 cm), das Knie knickte tief ein.
    function gangRolle(phi, R, Z) {
        var lb = Z.ballen * R,
            ha = Z.knoechel * R;
        return { dx: lb * (1 - Math.cos(phi)) + ha * Math.sin(phi), dy: lb * Math.sin(phi) - ha * (1 - Math.cos(phi)) };
    }
    function gangRollt(Z, R) {
        return !!(Z && Z.rollWinkel > 0 && Z.ballen > 0 && Z.knoechel >= 0 && Z.fersenAb >= 0 && Z.fersenAb < 1 && R > 0);
    }
    // Rf = die Reichweite, an der der Fuß gemessen ist (ohne: R) — die gebeugte Kette (geduckt) hat denselben Fuß
    function gangVersatz(S, R, Z, Rf) {
        if (!gangRollt(Z, R) || !(S > 0)) return 0;
        var e = gangRolle(Z.rollWinkel, Rf > 0 ? Rf : R, Z);
        var lo = 0,
            hi = Math.min(S / 2, R);
        for (var i = 0; i < 24; i++) {
            var d = (lo + hi) / 2;
            var a = Math.min(R, S / 2 - d),
                b = Math.min(R, Math.abs(S / 2 + d - e.dx));
            if (R - Math.sqrt(R * R - a * a) > R - e.dy - Math.sqrt(R * R - b * b)) lo = d;
            else hi = d;
        }
        return (lo + hi) / 2;
    }
    // der Roll-Winkel zur Phase u (rad, 0 … 2π, der Schwung füllt 0 … sw)
    function gangRollWinkel(u, sw, Z) {
        var TAU = 2 * Math.PI;
        if (u < sw) {
            var t = Math.max(0, 1 - (2 * u) / sw);
            return Z.rollWinkel * t * t;
        }
        var s = (u - sw) / (TAU - sw);
        var q = s > Z.fersenAb ? (s - Z.fersenAb) / (1 - Z.fersenAb) : 0;
        return Z.rollWinkel * q * q;
    }
    function gangFuss(ph, S, tast, Z, R, Rf) {
        var F = gangFussFlach(ph, S, tast, Z);
        if (!gangRollt(Z, R)) return F;
        var TAU = 2 * Math.PI;
        var u = ((ph % TAU) + TAU) % TAU;
        var sw = tast > 0 && tast < 1 && tast !== 0.5 ? TAU * (1 - tast) : Math.PI;
        var phi = gangRollWinkel(u, sw, Z),
            e = gangRolle(phi, Rf > 0 ? Rf : R, Z);
        F.dz += e.dx - gangVersatz(S, R, Z, Rf);
        F.heb = e.dy;
        F.rollDx = e.dx;
        F.roll = phi;
        return F;
    }
    function gangFussFlach(ph, S, tast, Z) {
        var TAU = 2 * Math.PI;
        var u = ((ph % TAU) + TAU) % TAU;
        var sw = tast > 0 && tast < 1 && tast !== 0.5 ? TAU * (1 - tast) : Math.PI;
        var halb = sw === Math.PI;
        if (u >= sw) return { dz: S / 2 - (S * (u - sw)) / (halb ? Math.PI : TAU - sw), hub: 0 };
        // Hermite von −S/2 (Abheben hinten) nach +S/2 (Aufsetzen vorn), beide Enden mit der Stand-Rate (rückwärts)
        var t = u / sw,
            m = halb ? -S : (-S * sw) / (TAU - sw);
        var h00 = 2 * t * t * t - 3 * t * t + 1,
            h10 = t * t * t - 2 * t * t + t,
            h01 = -2 * t * t * t + 3 * t * t,
            h11 = t * t * t - t * t;
        return {
            dz: (h00 * -S) / 2 + h10 * m + (h01 * S) / 2 + h11 * m,
            hub: Math.pow(Math.sin(halb ? u : (u * Math.PI) / sw), gangZahl(Z, "hubForm")),
        };
    }
    // DIE REICHWEITE DER BEIN-KETTE (K07, additiv — EINE Schwelle für Welt und Studio): knapp unter der gestreckten Kette
    // (das Knie schnappt nie durch); an ihr führt gangBecken das Becken, an ihr hält die Fuß-IK des Wirts den stehenden Fuß.
    function gangReich(kette) {
        return 0.995 * kette;
    }
    // DAS BECKEN DES GESETZES (K07, additiv — die Tiere lesen es nicht): die Senke des Beckens (≥ 0, im Maß von S und R)
    // zur Phase ph des ersten Beins, das zweite um π versetzt. R = die Reichweite der Bein-Kette (dieselbe Schwelle, an der
    // die Fuß-IK des Wirts den stehenden Fuß hält), omega der Takt (rad/s); die Schwere ist die der Zeile Z (dieselbe, die
    // gangSchritt liest), einheit = Meter je Maß-Einheit des Wirts (ohne: Meter) — nie eine zweite Zahl. Nur STEHENDE
    // Füße tragen das Becken — der Schwung-Fuß faltet sich, er zieht es nie hinab. GEHEN (das umgekehrte Pendel): so tief,
    // dass jeder stehende Fuß reicht (tief im Doppel-Stand, R − √(R² − (S/2)²)), über der Mitte des Stands höchstens um
    // beckenHub·R gehoben (das Knie bleibt im Stand leicht gebeugt — Gard 2004: 4–5 cm). LAUFEN (das Feder-Bein, McMahon &
    // Cheng 1990): beim Aufsetzen dieselbe Tiefe, zur Mitte des Stands federt das Bein um Δy = g·tc·(T/2π − tc/8)
    // (Kontaktzeit tc, Schritt-Dauer T, die sinusförmige Stand-Kraft trägt im Mittel das Gewicht), in der Flugphase steigt
    // es ballistisch um g·tf²/8. Der Wechsel folgt dem Tastgrad (tastgrad → tastgradLauf der Zeile Z).
    function gangBecken(ph, S, tast, R, omega, Z, einheit, Rf) {
        var TAU = 2 * Math.PI;
        if (!(S > 0) || !(R > 0)) return 0;
        var g = gangZahl(Z, "g") / (einheit > 0 ? einheit : 1);
        var sw = tast > 0 && tast < 1 ? TAU * (1 - tast) : Math.PI;
        var rollt = gangRollt(Z, R),
            versatz = rollt ? gangVersatz(S, R, Z, Rf) : 0;
        var halbS = Math.min(S / 2 - versatz, R);
        var oben = R - Math.sqrt(R * R - halbS * halbS);
        var A = Z && Z.beckenHub > 0 ? Z.beckenHub * R : 0;
        var tg = gangZahl(Z, "tastgrad"),
            tl = Z && Z.tastgradLauf > 0 ? Z.tastgradLauf : tg;
        var lauf = tg > tl ? Math.max(0, Math.min(1, (tg - tast) / (tg - tl))) : 0;
        var geh = oben - A,
            lau = -Infinity,
            steht = false;
        var tc = omega > 0 ? (TAU * tast) / omega : 0,
            T = omega > 0 ? Math.PI / omega : 0;
        var dy = g > 0 && tc > 0 ? Math.max(0, g * tc * (T / TAU - tc / 8)) : 0;
        for (var b = 0; b < 2; b++) {
            var u = (((ph + b * Math.PI) % TAU) + TAU) % TAU;
            if (u < sw) continue;
            steht = true;
            var s = (u - sw) / (TAU - sw);
            var dz = Math.min(R, Math.abs(S / 2 - S * s));
            if (rollt) {
                // der rollende Fuß: sein Knöchel steht um dy höher und um dx weiter vorn (gangRolle), der Fußweg um d zurück
                var e = gangRolle(gangRollWinkel(u, sw, Z), Rf > 0 ? Rf : R, Z);
                dz = Math.min(R, Math.abs(S / 2 - S * s - versatz + e.dx));
                geh = Math.max(geh, R - e.dy - Math.sqrt(R * R - dz * dz));
            } else geh = Math.max(geh, R - Math.sqrt(R * R - dz * dz));
            lau = Math.max(lau, oben + dy * Math.sin(Math.PI * s));
        }
        if (!steht) {
            // die Flugphase: zwischen dem Abheben des einen (u = 0) und dem Aufsetzen des anderen (u = sw − π)
            var fl = sw - Math.PI,
                u0 = ((ph % TAU) + TAU) % TAU,
                u1 = (u0 + Math.PI) % TAU;
            var q = fl > 0 ? Math.min(u0, u1) / fl : 0;
            var tf = omega > 0 ? fl / omega : 0;
            lau = oben - (g > 0 ? (g * tf * tf) / 8 : 0) * Math.sin(Math.PI * Math.max(0, Math.min(1, q)));
        }
        return Math.max(0, geh + (lau - geh) * lauf);
    }
    // DER STEHENDE FUSS HÄLT (K07, additiv — die Tiere lesen es nicht): ändert sich die Zeile des Gangs (Tempo, Gangart,
    // Kadenz — Fußweg S0 → S1, Tastgrad t0 → t1), setzt sich die Phase so, dass das stehende Bein (das vordere, wenn zwei
    // stehen) sein Fuß-Ziel dz behält — der Fuß steht in der Welt, das Gesetz folgt ihm, nicht umgekehrt. Vorher lief die
    // Phase weiter: beim Tempo-Sprung 1,15 → 5,16 m/s lag der gelockte Fuß 15 cm hinter dem Ziel des Laufs, das Becken
    // reichte ihn nicht mehr, der Lock löste (gate:tier-gang, Lock-Löser). Der Anlauf aus dem Stand ist derselbe Fall: im
    // Stand (S0 = 0) stehen beide Füße bei dz = 0, das nähere Bein setzt in der Mitte seines Stands ein. Zurück kommt die
    // Phase des ersten Beins, um weniger als π verschoben (die Zählung der Zyklen bleibt).
    function gangPhaseHaelt(ph, S0, t0, S1, t1) {
        var TAU = 2 * Math.PI;
        if (!(S1 > 0) || !isFinite(ph)) return ph;
        var sw0 = t0 > 0 && t0 < 1 ? TAU * (1 - t0) : Math.PI,
            sw1 = t1 > 0 && t1 < 1 ? TAU * (1 - t1) : Math.PI;
        var u = ((ph % TAU) + TAU) % TAU,
            beste = null;
        for (var b = 0; b < 2; b++) {
            var ub = (u + b * Math.PI) % TAU;
            if (S0 > 0 && ub < sw0) continue;
            var dz = S0 > 0 ? S0 / 2 - (S0 * (ub - sw0)) / (TAU - sw0) : 0;
            var s = Math.max(0, Math.min(1, (S1 / 2 - dz) / S1));
            var d = sw1 + s * (TAU - sw1) - b * Math.PI - u;
            d = ((((d + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
            if (!beste || (S0 > 0 ? dz > beste.dz : Math.abs(d) < Math.abs(beste.d))) beste = { dz: dz, d: d };
        }
        return beste ? ph + beste.d : ph;
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
        // DER SPRINT DER GESTALT (Welle LF 08.10., additiv): der Galopp als Froude-Tempo — Hetze und Flucht laufen
        // sprint·√(g·L) (Wolf L 0,63 m ≈ 7,5 m/s, Hirsch L 0,92 m ≈ 9,0 m/s): der Wolf holt den sprintenden Menschen
        // (5,2–6,0 m/s) ein, der gesunde Hirsch entkommt ihm auf freier Strecke — die Jagd gelingt im Rudel und am Kitz.
        sprint: 3.0,
        wende: 1.1, // × √(g/L) rad/s — die Wendegrenze (Hirsch: ~3,6 rad/s)
        beschl: 0.5, // × g — Anfahren (m/s²)
        brems: 0.8, // × g — Bremsen (m/s²); der Ankunfts-Weg liest dieselbe Zahl
    });
    // Die Tempo-Einheit in m/s für die Hüft-Höhe L (m).
    function tempoEinheit(L) {
        return STEUER_GESETZ.tempo * Math.sqrt(GANG_GESETZ.g * Math.max(0.05, L));
    }
    // Der Sprint (Galopp) in m/s für die Hüft-Höhe L (m) — Hetze und Flucht (Welle LF).
    function sprintTempo(L) {
        return STEUER_GESETZ.sprint * Math.sqrt(GANG_GESETZ.g * Math.max(0.05, L));
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
    // DER UMWEG (Oekologie K5, 24.10., additiv): wer ein Ziel hat, eine Wand hielt ihn vor hoechstens haltS (n die Normale aus
    // ihr), und sein Wunsch (ux, uz) steht fast frontal in ihr (|Wunsch · Tangente| <= quer — schraeg laesst ihn die Wand
    // gleiten), geht laengs der Wand zur Seite, auf der er von ihrer Mitte (ox, oz) schon steht (der kuerzere Weg); die Seite
    // alt haelt, solange der Umweg nicht laenger als haltS ruht. Liefert die Seite s (±1, 0 = kein Umweg), die Richtung ist
    // s × (−nz, nx). Vorher stand ein Folger hinter einer Wand, bis der Spieler ihre Linie verliess (folgen: 30 s an 8 m).
    var UMWEG_GESETZ = Object.freeze({ haltS: 0.5, quer: 0.25 });
    function umwegSeite(ux, uz, nx, nz, ox, oz, alt) {
        if (alt) return alt;
        var q = uz * nx - ux * nz;
        if (Math.abs(q) > UMWEG_GESETZ.quer) return 0;
        return oz * nx - ox * nz < 0 ? -1 : 1;
    }
    // DER VERBAND (S6 18.10.): das Rudel, die Herde — der Wurf, den die Geburt bindet — ist ein DATUM, kein Zufall der
    // Nachbarschaft. Die Form davor (herdeZug) zog nur Nachbarn derselben Gattung im Fenster fensterRaum × Paar-Raum: ein
    // Nachzuegler jenseits des Fensters blieb fuer immer zurueck, zwei fremde Herden derselben Art verschmolzen, und die
    // Flucht lief je Tier strahlenfoermig fort (Linse herde 18.10.: auf der Flucht im Mittel 0,186 der Glieder beisammen).
    // VERBAND_GESETZ: die Zahlen des Verbands, die nicht in VERHALTEN wohnen (VERHALTEN reist in PRESETS, der v7-Fingerabdruck
    // bleibt) — ausrichtung = der Anteil, um den sich der Wunsch eines Glieds zum Mittel der Glieder-Wuensche neigt (die
    // Herde laeuft, wohin sie laeuft; Reynolds 1987 alignment), leitGewicht = das Gewicht des Leittiers im Mittel (die
    // Leitkuh fuehrt das Kahlwild, Clutton-Brock et al. 1982).
    var VERBAND_GESETZ = Object.freeze({ ausrichtung: 0.5, leitGewicht: 3 });
    // verbandZug: der Zug des Verbands auf ein Glied an (x, z) mit dem Wunsch (vx, vz) (Welt-XZ, m/s) im Tempo `tempo` (m/s).
    // glieder: [{x, z, vx, vz, raum, leit}] die ANDEREN Glieder DESSELBEN Verbands (der Wirt waehlt sie nach dem Verband, nie
    // nach Gattung oder Tag — Lehre 8; Fremd-Verbaende verschmelzen nicht), raum = der persoenliche Raum dieses Glieds (m),
    // H = VERHALTEN.herde. AUSRICHTUNG: der Wunsch neigt sich um ausrichtung zum Mittel der Glieder-Wuensche. KOHAESION:
    // jenseits des Paar-Raums (raum + der mittlere Raum der Glieder) zieht das Mittel der Glieder, bis fensterRaum ×
    // Paar-Raum anwachsend auf H.gewicht × tempo, dahinter voll — ein Glied gehoert zum Verband, wie weit es auch steht.
    // Das Leittier (leit) wiegt leitGewicht-fach; gezaehlt werden hoechstens H.maxNachbarn Glieder (das Budget je Wesen).
    // Liefert {x, z, n}: den neuen Wunsch (m/s) und die Zahl der gezaehlten Glieder (n = 0: der Wunsch bleibt).
    function verbandZug(x, z, vx, vz, tempo, raum, glieder, H, out) {
        var o = out || { x: 0, z: 0, n: 0 };
        var V = VERBAND_GESETZ;
        var w = 0,
            mx = 0,
            mz = 0,
            ax = 0,
            az = 0,
            mr = 0,
            n = 0;
        for (var i = 0; i < glieder.length && n < H.maxNachbarn; i++) {
            var g = glieder[i];
            if (!g) continue;
            var gw = g.leit ? V.leitGewicht : 1;
            mx += g.x * gw;
            mz += g.z * gw;
            ax += g.vx * gw;
            az += g.vz * gw;
            mr += (g.raum > 0 ? g.raum : 0) * gw;
            w += gw;
            n++;
        }
        o.x = vx;
        o.z = vz;
        o.n = n;
        if (!n) return o;
        o.x += (ax / w - vx) * V.ausrichtung;
        o.z += (az / w - vz) * V.ausrichtung;
        var dx = mx / w - x,
            dz = mz / w - z;
        var d = Math.sqrt(dx * dx + dz * dz);
        var paar = (raum > 0 ? raum : 0) + mr / w;
        if (d > paar && d > 1e-9) {
            var weit = paar * (H.fensterRaum - 1);
            var zug = H.gewicht * (tempo > 0 ? tempo : 0) * (weit > 0 ? Math.min(1, (d - paar) / weit) : 1);
            o.x += (dx / d) * zug;
            o.z += (dz / d) * zug;
        }
        return o;
    }
    // DER PLATZ IM RUDEL (S6, aus dem Wirt `_kreaturJagdZug` heimgekehrt, Welle LF): eigen = der Winkel des Jaegers um das
    // Ziel (rad, atan2 vom Ziel aus), winkel = die Winkel der uebrigen Jaeger seines Rudels auf dasselbe Ziel (der Wirt
    // reicht sie, die Liste wird um eigen ergaenzt und an Ort sortiert). Das Rudel verteilt sich gleich um das Mittel seiner
    // Winkel, jeder auf dem Platz seines Rangs; umstellt = die groesste Winkel-Luecke ist hoechstens anderthalb Plaetze
    // breit (allein ist man immer umstellt). Liefert {platz, n, umstellt}.
    function rudelPlatz(eigen, winkel, out) {
        var o = out || { platz: 0, n: 1, umstellt: true };
        var TAU = Math.PI * 2;
        var sx = Math.sin(eigen),
            sz = Math.cos(eigen),
            n = 1,
            i;
        for (i = 0; i < winkel.length; i++) {
            sx += Math.sin(winkel[i]);
            sz += Math.cos(winkel[i]);
            n++;
        }
        o.platz = eigen;
        o.n = n;
        o.umstellt = true;
        if (n < 2) return o;
        var mittel = Math.atan2(sx, sz);
        var re = eigen - mittel;
        re -= TAU * Math.round(re / TAU);
        var rang = 0;
        for (i = 0; i < winkel.length; i++) {
            var r = winkel[i] - mittel;
            r -= TAU * Math.round(r / TAU);
            if (r < re) rang++;
        }
        o.platz = mittel + (rang - (n - 1) / 2) * (TAU / n);
        winkel.push(eigen);
        winkel.sort(function (a, b) {
            return a - b;
        });
        var luecke = 0;
        for (i = 0; i < winkel.length; i++) {
            var nx = i + 1 < winkel.length ? winkel[i + 1] : winkel[0] + TAU;
            if (nx - winkel[i] > luecke) luecke = nx - winkel[i];
        }
        o.umstellt = luecke <= 1.5 * (TAU / n);
        return o;
    }

    // DAS TEMPERAMENT DER GATTUNG (Welle LF 08.10., additiv): g = die Dials der Gattung (GATTUNGEN, diet), kg = die Masse
    // des Leibs (das Volumen seiner Gestalt × MASSSTAB.dichteKgM3 — die EINE Masse, die auch das Impuls-Gesetz des Wirts
    // liest), T = VERHALTEN.temperament.gattung. Liefert "wild" · "wehrhaft" · "sanft" · "scheu" — die Art und die Groesse
    // unterscheiden das Gemuet, nie ein Tag (Lehre 8).
    function temperamentDerGattung(g, kg, T) {
        if (g.diet >= T.fleischDiet) return kg >= T.jagdKg ? "wild" : "scheu";
        if (g.diet <= T.pflanzDiet) return kg >= T.kolossKg ? "wehrhaft" : "scheu";
        return kg >= T.wehrKg ? "wehrhaft" : "sanft";
    }

    // DAS FURCHT-GESETZ (Oekologie K3, 23.10., additiv — FURCHT_GESETZ wohnt nicht in VERHALTEN, VERHALTEN reist in PRESETS und
    // der v7-Fingerabdruck bleibt): EINE Furcht eines Wesens aus zwei Gedaechtnissen, gewogen nach EINER Bedrohung.
    // DIE BEDROHUNG eines Gefuehls (bedrohung): chaos und sorrow schrecken, peace und joy beruhigen — mit den Gewichten von
    // VERHALTEN.furcht; sie wiegt die Aura des Spielers UND den Abdruck einer Tat am Ort (vorher rechnete der Wirt sie nur fuer
    // den Spieler, der Ort trug Gefuehle, die kein Tier las). DAS WESEN ERINNERT (furchtErinnert): jede Erinnerung an den
    // Spieler traegt ihr Gewicht (geschlagen +, gefuettert −; der Schlag wiegt schwerer als die Gabe: Baumeister et al. 2001,
    // „Bad is stronger than good"; gewalt + = der Schlag des Spielers in der Naehe, gesehen, nicht erlitten — mensch.K5, 27.10.,
    // additiv: der Zeuge erinnert ihn halb so schwer wie das Opfer), die Summe geklemmt auf ±deckel hebt oder senkt die Wariness vor ihm; erinnerte Furcht
    // weitet Witterung und Flucht-Distanz um fluchtJeFurcht je Einheit (bejagte Bestaende fliehen frueher und weiter, beim
    // Wapiti um ein Mehrfaches: Stankowich 2008, Biol. Conserv. 141:2159). Gezaehlt wird, was das Gedaechtnis traegt (die Kappe
    // seiner Eintraege), nie eine Uhr: die Erinnerung reist im Speicherstand. DER ORT ERINNERT (furchtOrt): die Bedrohung des
    // Abdrucks in einer Zelle × ortGewicht; ein Riss praegt riss ein (die Emotion des Schadens, sorrow + chaos, bis zur
    // Saettigung der Zelle). Die Landschaft der Furcht meidet, wer Beute ist (Laundre et al. 2001), im Umkreis
    // ortRadiusZellen Zellen um die Mitte der Zelle, linear zum Rand. DER FLUCHTWEG (Tiere K1, 24.10., additiv): wer flieht,
    // laeuft vom Ort der Bedrohung bis fluchtWegJeRadius Flucht-Radien jenseits des Radius — die Beute flieht eine Strecke, nicht
    // bis zur Kante der Furcht, und wer frueher flieht, flieht weiter (Stankowich 2008, „distance fled"); vorher endete die
    // Flucht am Radius selbst.
    var FURCHT_GESETZ = Object.freeze({
        erinnerung: Object.freeze({ geschlagen: 2, gefuettert: -1.5, gewalt: 1 }),
        deckel: 3,
        fluchtJeFurcht: 1.25,
        fluchtWegJeRadius: 2.2,
        riss: Object.freeze({ chaos: 1.6, sorrow: 1.6 }),
        ortGewicht: 1,
        ortRadiusZellen: 1.5,
    });
    // e = die Emotions-Achsen {chaos, sorrow, peace, joy, …}, NAT = VERHALTEN.furcht. Liefert die Bedrohung (negativ = beruhigt).
    function bedrohung(e, NAT) {
        return (
            (e.chaos || 0) * NAT.menaceFromChaos +
            (e.sorrow || 0) * NAT.menaceFromSorrow -
            (e.peace || 0) * NAT.calmFromPeace -
            (e.joy || 0) * NAT.calmFromJoy
        );
    }
    // memory = die Erinnerungen des Wesens [{type, …}] (die Typen geschlagen · gefuettert; jeder andere wiegt 0).
    function furchtErinnert(memory, F) {
        if (!memory || !memory.length) return 0;
        var s = 0;
        for (var i = 0; i < memory.length; i++) {
            var g = memory[i] && F.erinnerung[memory[i].type];
            if (g) s += g;
        }
        return s > F.deckel ? F.deckel : s < -F.deckel ? -F.deckel : s;
    }
    // gefuehl = der Abdruck einer Zelle (Achsen wie e) oder null. Liefert die Furcht des Orts (≥ 0: ein ruhiger Ort lockt nicht).
    function furchtOrt(gefuehl, NAT, F) {
        if (!gefuehl) return 0;
        var m = bedrohung(gefuehl, NAT) * F.ortGewicht;
        return m > 0 ? m : 0;
    }
    // B = die Bedrohung {x, z, r} (Ort und Flucht-Radius), glieder = die Leiber des Verbands ({position}) oder null, eigen = das
    // Wesen wittert selbst. Liefert den Radius der Flucht um B: wer selbst wittert, flieht, bis er und das fernste Glied seines
    // Verbands fluchtWegJeRadius × B.r jenseits des Radius stehen; aus zweiter Hand traegt B die Flucht, die das Glied uebernimmt.
    function fluchtRadius(B, glieder, eigen) {
        if (!eigen) return B.r;
        var r = B.r;
        for (var i = 0; glieder && i < glieder.length; i++) {
            var p = glieder[i].position;
            r = Math.max(r, Math.sqrt((p.x - B.x) * (p.x - B.x) + (p.z - B.z) * (p.z - B.z)));
        }
        return r + FURCHT_GESETZ.fluchtWegJeRadius * B.r;
    }

    // DIE JAGD HAT EIN ENDE (Tiere K2, 23.10., additiv — JAGD_GESETZ wohnt nicht in VERHALTEN, der v7-Fingerabdruck bleibt): eine
    // Jagd beginnt mit der ersten Hetze auf ein Ziel und endet mit dem Riss oder nach dauerS; dann ist der Jaeger erschoepft und
    // jagt ruheS nicht (Woelfe brechen die meisten Jagden ab: MacNulty et al. 2007, J. Mammal. 88:595). DIE WUNDE BREMST
    // (wundTempo): der Sprint eines verwundeten Leibs faellt mit dem Anteil seines Lebens hoch wundExp — der Riss folgt, wenn
    // die Bisse eines Rudels die Beute langsamer machen als den Jaeger; darum steigt der Erfolg mit der Zahl der Jaeger
    // (MacNulty et al. 2012, Behav. Ecol. 23:75).
    var JAGD_GESETZ = Object.freeze({ dauerS: 45, ruheS: 120, wundExp: 1.3 });
    function wundTempo(hpAnteil, J) {
        var a = hpAnteil > 0 ? (hpAnteil < 1 ? hpAnteil : 1) : 0;
        return Math.pow(a, J.wundExp);
    }

    // DER LEBENSRAUM (Tiere K4, 23.10., additiv — LEBENSRAUM_GESETZ wohnt nicht in VERHALTEN, der v7-Fingerabdruck bleibt): die
    // Boden-Klasse eines Orts kommt aus dem Gelaende (bodenKlasse): am Fluss, wo sein Rand naeher als flussM liegt, am Hang, wo
    // der Hang des Gelaende-Gesetzes ueber hangTan steigt (20°), sonst nach der Bestandsdichte des Walds (phyto
    // forestStandDensity): Wald ab waldSd, Waldrand ab randSd, darunter Wiese. Je Gattung ihr Lebensraum (gattung: Klasse →
    // Eignung) und ihre Haeufigkeit (Beute ist haeufig, der Jaeger selten); lebensraum = Eignung × Haeufigkeit, 0 = die Gattung
    // lebt dort nicht. Das Rotwild aest auf Wiese und Saum (Clutton-Brock et al. 1982), der Wolf jagt aus dem Wald, der Baer
    // sucht Fluss und Hang, der Fuchs den Saum. Die Art waehlt der Ort, nie ein Tag (Lehre 8).
    var LEBENSRAUM_GESETZ = Object.freeze({
        flussM: 40,
        hangTan: 0.36,
        waldSd: 0.7,
        randSd: 0.5,
        gattung: Object.freeze({
            deer: Object.freeze({ wiese: 1, waldrand: 1 }),
            fox: Object.freeze({ waldrand: 1, wiese: 0.5 }),
            wolf: Object.freeze({ wald: 1 }),
            bear: Object.freeze({ fluss: 1, hang: 1 }),
        }),
        haeufigkeit: Object.freeze({ deer: 1, fox: 0.4, wolf: 0.35, bear: 0.25 }),
    });
    // flussRandM = der Abstand zum Rand des naechsten Flusses (m, Infinity ohne), hangTan = der Hang (tan), sd = die
    // Bestandsdichte (0..1). Liefert "fluss" · "hang" · "wald" · "waldrand" · "wiese".
    function bodenKlasse(flussRandM, hangTan, sd, L) {
        if (flussRandM <= L.flussM) return "fluss";
        if (hangTan >= L.hangTan) return "hang";
        return sd >= L.waldSd ? "wald" : sd >= L.randSd ? "waldrand" : "wiese";
    }
    function lebensraum(gattung, klasse, L) {
        var g = L.gattung[gattung];
        return g && g[klasse] ? g[klasse] * (L.haeufigkeit[gattung] || 0) : 0;
    }
    // DER DURST (Tiere K4, additiv): die Zeit seit dem letzten Trinken auf der Kreatur-Uhr durch durstS; ab 1 sucht das Tier
    // Wasser im Umkreis VERHALTEN.aufgaben.trinkSuchM und trinkt, dann ist er 0; fand es keines, sucht es nach suchPauseS
    // wieder (das Rotwild zieht mehrmals am Tag zur Traenke).
    var DURST_GESETZ = Object.freeze({ durstS: 1200, suchPauseS: 300 });
    function durst(seitS, D) {
        return seitS > 0 ? seitS / D.durstS : 0;
    }
    // DAS ETHOGRAMM (Tiere K4, 24.10., additiv — ETHOGRAMM_GESETZ wohnt nicht in VERHALTEN, der v7-Fingerabdruck bleibt): der
    // Tag eines Tiers ist ein BUDGET aus drei Taetigkeiten — ruhen, nahrung (aesen, nur wer weidet: diet bis
    // VERHALTEN.stimmung.schwellen.weideDiet) und ziehen (der Rest) —, getragen von Beduerfnis-Pegeln, nie von einem Zeitplan.
    // DER HUNGER ist der Magen (VERHALTEN.aas): er leert sich in verdauSec; wer weidet, beginnt unter hungerAnteil zu aesen und
    // aest, bis er voll ist — die Aesung fuellt ihn mit voll / (verdauSec × nahrung) je Sekunde (aesung), darum aest er im Mittel
    // den Anteil nahrung (Gras ist karg: das Rotwild aest ~ 50 % des Tages, Clutton-Brock et al. 1982). DIE RUHE ist ein Pegel
    // (ruhePegel, der Schlafdruck des Zwei-Prozess-Modells, Borbely 1982): wach steigt er in ruheTaktS × (1 − ruhen) auf 1,
    // ruhend faellt er in ruheTaktS × ruhen auf 0 — im Mittel ruht die Gattung den Anteil ruhen. DER RHYTHMUS (lichtPhase: der
    // Zeitgeber ist das Licht, die Hoehe der Sonne): in ihrer aktiven Lichtphase legt sich die Gattung erst bei schwelle.aktiv
    // nieder, sonst schon bei schwelle.ruhig — die Schwelle verschiebt, WANN sie ruht, nie wie lange: das Budget haelt jede
    // Uhr. Wer ruht, ruht, bis der Pegel leer ist; wer aest, aest, bis der Magen voll ist (taetigkeit). Das Rotwild aest in der
    // Daemmerung (Georgii 1981), der Wolf zieht nachts und in der Daemmerung (Theuerkauf et al. 2003: aktiv ~ 40 %), der Fuchs
    // nachts (Doncaster & Macdonald 1997), der Baer am Tag (Munro et al. 2006: aktiv ~ 55 %, das meiste Nahrungssuche). Jede
    // Taetigkeit zeigt sich in einer Stimmung des Buchs und traegt das Tempo ihrer Aktion (zeigt; ziehen wandert).
    var ETHOGRAMM_GESETZ = Object.freeze({
        daemmerSin: 0.25,
        schwelle: Object.freeze({ aktiv: 1.5, ruhig: 0.6 }),
        zeigt: Object.freeze({
            ruhen: Object.freeze({ stimmung: "nacht", aktion: "ruhen" }),
            nahrung: Object.freeze({ stimmung: "tag", aktion: "grasen" }),
            ziehen: Object.freeze({ stimmung: "idle", aktion: null }),
        }),
        gattung: Object.freeze({
            deer: Object.freeze({ ruhen: 0.4, nahrung: 0.5, ruheTaktS: 360, aktiv: Object.freeze(["daemmerung"]) }),
            bear: Object.freeze({ ruhen: 0.45, nahrung: 0.4, ruheTaktS: 360, aktiv: Object.freeze(["tag", "daemmerung"]) }),
            wolf: Object.freeze({ ruhen: 0.6, nahrung: 0, ruheTaktS: 360, aktiv: Object.freeze(["nacht", "daemmerung"]) }),
            fox: Object.freeze({ ruhen: 0.6, nahrung: 0, ruheTaktS: 360, aktiv: Object.freeze(["nacht"]) }),
        }),
    });
    // sonneSin = die Hoehe der Sonne (sin), nachtSin = VERHALTEN.stimmung.schwellen.nachtSin. Liefert die Lichtphase.
    function lichtPhase(sonneSin, nachtSin, E) {
        return sonneSin < nachtSin ? "nacht" : sonneSin < E.daemmerSin ? "daemmerung" : "tag";
    }
    // p = der Ruhe-Pegel, ruht = ruhte das Tier in den letzten dtS Sekunden, G = die Zeile der Gattung. Liefert den neuen Pegel.
    function ruhePegel(p, ruht, dtS, G) {
        var q = ruht ? p - dtS / (G.ruheTaktS * G.ruhen) : p + dtS / (G.ruheTaktS * (1 - G.ruhen));
        return q > 0 ? q : 0;
    }
    // voll = der volle Magen (kg), verdauSec = VERHALTEN.aas.verdauSec. Liefert die Aesung (kg je Sekunde).
    function aesung(voll, verdauSec, G) {
        return G.nahrung > 0 ? voll / (verdauSec * G.nahrung) : 0;
    }
    // vorher = die Taetigkeit des Vor-Takts, magenAnteil = der Magen durch den vollen, weidet = diet bis weideDiet,
    // hungerAnteil = VERHALTEN.aas.hungerAnteil. Liefert "ruhen" · "nahrung" · "ziehen".
    function taetigkeit(vorher, ruhe, magenAnteil, phase, weidet, G, E, hungerAnteil) {
        var aest = weidet && G.nahrung > 0;
        if (vorher === "ruhen" && ruhe > 0) return "ruhen";
        if (vorher === "nahrung" && aest && magenAnteil < 1) return "nahrung";
        if (ruhe >= (G.aktiv.indexOf(phase) >= 0 ? E.schwelle.aktiv : E.schwelle.ruhig)) return "ruhen";
        return aest && magenAnteil < hungerAnteil ? "nahrung" : "ziehen";
    }
    // DIE GEBURT AM ORT: aus dem Wurf u ∈ [0, 1) die Gattung nach ihrem lebensraum in der Klasse; die Luecke bis zur Summe des
    // reichsten Lebensraums traegt keine Geburt (null) — wo nur der Jaeger lebt, wird selten geboren, die Beute ist haeufig.
    var LEBENSRAUM_KLASSEN = ["fluss", "hang", "wald", "waldrand", "wiese"];
    function lebensraumWahl(klasse, u, L) {
        var max = 0,
            g,
            i,
            s;
        for (i = 0; i < LEBENSRAUM_KLASSEN.length; i++) {
            s = 0;
            for (g in L.gattung) s += lebensraum(g, LEBENSRAUM_KLASSEN[i], L);
            if (s > max) max = s;
        }
        var w = u * max;
        for (g in L.gattung) if ((w -= lebensraum(g, klasse, L)) < 0) return g;
        return null;
    }

    // DER BESTAND (Oekologie K2, 23.10., additiv — BESTAND_GESETZ wohnt nicht in VERHALTEN, der v7-Fingerabdruck bleibt): Geburt
    // und Tod einer Gattung folgen ihrer Nahrung im Revier, nie einem Deckel. DIE NAHRUNG eines Orts (bestandNahrung) ist die
    // Kost nach der Ernaehrung der Gattung (GATTUNGEN diet: 0 frisst Aesung, 1 Beute, dazwischen beides): Aesung = das Leben
    // des Felds am Ort (0..1), Beute = der Bestand der Pflanzenfresser im Revier gegen beuteVoll Koepfe (auf 1 geklemmt) — die
    // Zahl der Jaeger folgt der Zahl der Beute (die numerische Antwort: Messier 1994, Ecology 75:478). DIE KAPAZITAET des
    // Reviers (revierM um den Spieler, je Zelle des Rasters rasterM) = kopfJeHa × Σ lebensraum (Eignung × Haeufigkeit) ×
    // Flaeche (ha) × Nahrung — Nahrung × Lebensraum. DIE BILANZ (bestandBilanz) ist logistisch (Verhulst 1838) je taktS der
    // Spiel-Zeit: unter der Kapazitaet K wirft die Gattung mit geburt × (1 − n/K), darueber stirbt mit tod × (n/K − 1)
    // (geklemmt auf tod) einer am Hunger; ohne Nahrung (K = 0) stirbt jeder Bestand. DER FRASS (bestandFrass, Oekologie K1): je
    // Takt nimmt jedes Tier nach seinem Anteil Aesung (1 − diet) fress vom Jungwuchs des Reviers, in den Zellen, die die
    // Kapazitaet liest — negativ ins Feld; das Overlay zerfaellt zum Substrat zurueck, das ist das Nachwachsen (der Verbiss
    // senkt die Aesung, die Aesung den Bestand: die Rueckkopplung ist negativ, wie das Feld sie erlaubt). DER RISS
    // (bestandRiss, Oekologie K1): die Jaeger, deren Beute eine Gattung ist, nehmen je Takt mit riss × jaeger × D² / (rissHalb² + D²)
    // eines ihrer Tiere — jaeger = die Kost (diet) der Jaeger-Koepfe, D = die Dichte ihrer Beute (n / beuteVoll): die Antwort
    // saettigt und laesst seltene Beute liegen (Holling 1959, Typ III; der Jaeger wechselt zur haeufigen, Murdoch 1969). Die
    // Kaskade folgt aus den Lesern: ohne Woelfe waechst das Rotwild bis an seine Aesung und verbeisst den Jungwuchs (Ripple &
    // Beschta 2012).
    var BESTAND_GESETZ = Object.freeze({
        taktS: 10,
        revierM: 200,
        rasterM: 50,
        kopfJeHa: 8,
        beuteVoll: 30,
        geburt: 0.1,
        tod: 0.2,
        fress: 0.05,
        riss: 0.6,
        rissHalb: 0.1,
    });
    function bestandFrass(diet, B) {
        var d = diet > 0 ? (diet < 1 ? diet : 1) : 0;
        return B.fress * (1 - d);
    }
    // jaeger = die Kost der Jaeger, deren Beute die Gattung ist (Σ diet), dichte = n / beuteVoll. Liefert die Chance je Takt.
    function bestandRiss(jaeger, dichte, B) {
        var d2 = dichte > 0 ? dichte * dichte : 0;
        var p = jaeger > 0 ? (B.riss * jaeger * d2) / (B.rissHalb * B.rissHalb + d2) : 0;
        return p < 1 ? p : 1;
    }
    function bestandNahrung(diet, aesung, beute) {
        var d = diet > 0 ? (diet < 1 ? diet : 1) : 0;
        return (1 - d) * aesung + d * beute;
    }
    // n = der Bestand der Gattung, K = ihre Kapazitaet im Revier. Liefert die Chancen je Takt {geburt, tod}.
    function bestandBilanz(n, K, B) {
        if (!(K > 0)) return { geburt: 0, tod: n > 0 ? B.tod : 0 };
        if (n < K) return { geburt: B.geburt * (1 - n / K), tod: 0 };
        var u = n / K - 1;
        return { geburt: 0, tod: B.tod * (u < 1 ? u : 1) };
    }

    // DER VOGEL (Klang K1, 25.10., additiv — VOGEL_GESETZ wohnt nicht in VERHALTEN, der v7-Fingerabdruck bleibt): jeder Vogel-Ruf
    // der Welt hat einen Leib (die Vögel sind Tetrapoda). Die Welt ist eine Funktion, kein Sack: kein Vogel wird geboren oder
    // gespeichert, jeder ist der Wurf seines Reviers und eine Bahn über der Zeit — für jeden Peer gleich (Saat × Zelle × Uhr).
    // DAS REVIER (vogelRevier): das Raster zelleM; je Zelle höchstens ein Revier (ein singendes Männchen), mit der Dichte
    // proHa × √lebendig × (habitatBasis + (1 − habitatBasis) × Deckung) Reviere je ha — der Wald trägt die meisten (die Singvogel-
    // Gilde der Laubwälder 10–25 Paare/ha, gedeckelt durch das Raster auf 16/ha), das Offenland habitatBasis davon (Feldlerche,
    // Wiesenpieper, Goldammer am Saum). Mitte, Phase, Höhe, Kreis und Drehsinn sind Würfe der Zelle (vogelWurf: ein ganzzahliger
    // Hash aus Saat, Zelle und Wurf-Nummer). DAS LIED (vogelLied): der Anteil der Zeit, in dem ein Männchen singt — der
    // Morgenchor aus der Sonnenhöhe (chor: Stützstellen sin → Anteil, das Maximum kurz nach Sonnenaufgang, mittags gut die Hälfte,
    // nachts still) × Regen-Ruhe (1 − Regen)² × Wind-Ruhe (1 − windStill × Wind). Gesungen wird im SINGFLUG (Feldlerche,
    // Baumpieper; Delius 1963): der Vogel steigt vom Boden in steigS auf seine Höhe, kreist mit tempoMs und sinkt zurück; am
    // Boden schweigt er. Über Bäumen kreist er über dem Dach: die Höhe hebt sich um kroneM × Deckung der Zelle. DIE BAHN (vogelBahn): je Periode periodeS (die Phase je Revier) singt er den Anteil dutyMax × Lied; Höhe
    // und Kreis sind stetig in der Zeit UND im Anteil (Auf- und Abstieg glätten an beiden Rändern des Fensters) — ein
    // Wetterwechsel holt ihn herunter, er springt nie. DER LEIB (leib): ein Singvogel von 0,22 m Länge und 0,32 m Spannweite
    // (Amsel-Maß) als Teile — je Teil ein Doppel-Keil (Oktaeder) mit diesen Ausdehnungen in Metern um seine Lage (x rechts,
    // y oben, z vorn; Farbe sRGB): der Rumpf spitz nach vorn und hinten, Kopf, Schwanz; der Flügel am Schultergelenk (rechts;
    // links gespiegelt) mit der Länge nach außen, sein Schlag schlagHz mit dem Ausschlag ±schlagRad. Einen Schnabel trägt der
    // Leib nicht: 8 mm sind ab 2 m unter einem Bildpunkt (die Kosten gehören ins Asset).
    var VOGEL_GESETZ = Object.freeze({
        zelleM: 25,
        proHa: 50,
        habitatBasis: 0.35,
        lied: Object.freeze({
            chor: Object.freeze([[-0.15, 0], [0, 0.7], [0.12, 1], [0.4, 0.6], [1, 0.55]]),
            windStill: 0.8,
        }),
        flug: Object.freeze({ periodeS: 60, dutyMax: 0.8, steigS: 4, hoeheM: [5, 14], kroneM: 22, radiusM: [3, 9], tempoMs: 5 }),
        leib: Object.freeze({
            teile: Object.freeze([
                Object.freeze({ groesse: [0.06, 0.06, 0.16], lage: [0, 0, 0], farbe: 0x8b6b4a }),
                Object.freeze({ groesse: [0.042, 0.042, 0.05], lage: [0, 0.026, 0.06], farbe: 0x6e5238 }),
                Object.freeze({ groesse: [0.05, 0.012, 0.09], lage: [0, 0.008, -0.09], farbe: 0x5c442e }),
            ]),
            fluegel: Object.freeze({ groesse: [0.14, 0.012, 0.07], schulter: [0.02, 0.015, 0.01], farbe: 0x56402c }),
            schlagHz: 12,
            schlagRad: 0.9,
        }),
        // DER SCHWARM (luftwasser.K5, 27.10., additiv): der Starenschwarm über dem Offenland — fern EIN Agent. Kein Glied wird
        // geboren, gespeichert oder je Kopf getaktet: der Schwarm ist der Wurf seines Reviers (Raster zelleM, je Zelle mit dem
        // Anteil anteil ein Schwarm, wo die Kronen-Deckung der Mitte höchstens deckungMax ist — Stare schwärmen über Weide, Feld
        // und Ried), sein ZENTRUM kreist auf der Uhr der Welt (radiusM, tempoMs, hoeheM über der 2D-Höhe; Sturnus vulgaris reist
        // mit 12–20 m/s), und jedes Glied ist eine FUNKTION von (Index, Zeit) um das Zentrum (schwarmGlied): ein quasi-gleich-
        // verteilter Ball (R2-Folge, Radius ∛) mit raumJeGlied Abstand³ je Glied, gestaucht zur flachen Scheibe form = [längs,
        // hoch, quer] (gemessene Starenschwärme sind dünn längs der Schwerkraft, Ballerini et al. 2008; Nächster-Nachbar
        // 0,7–1,5 m), atmend (atmen), eine Dichte-Welle läuft längs durch den Verband (welle; Procaccini et al. 2011), jedes Glied
        // zittert um seinen Platz (zitterM) und wechselt Schlag und Gleiten (gleitHz, der Starenflug). DER VERBAND (luftwasser.K2,
        // 28.10., additiv): NAH (nahM vom Auge) fliegt jedes Glied aus dem Verbands-Gesetz der Herde — das Zentrum ist sein
        // LEITTIER (verbandZug, leitGewicht), jedes Glied liest dazu je fünf Glieder im Schritt n/5 (das Budget maxNachbarn der
        // Herde; Stare richten sich nach 6–7 Nachbarn, Ballerini et al. 2008), sein eigener Wunsch ist der Kurs des Zentrums,
        // gedreht um seine Vorliebe und sein Rauschen (schwarmWunsch: verband.rauschRad, eigen, hz; Couzin et al. 2005); der
        // Ball der Funktion ist sein Wurf, die Höhe bleibt die Scheibe der Funktion. Die Separation hält die Glieder auf ihrem
        // Paar-Raum raumM auseinander (schwarmSeparation, über ein Hash-Gitter der Zelle raumM: Kosten an den Gliedern, nie n²);
        // fern trägt das Zentrum die Formation in seinem Kurs-Rahmen; jenseits von sichtM rechnet nur das Zentrum; das Revier einer Zelle folgt der
        // Deckung je frischeS Sekunden der Welt-Uhr (gepflanzter Wald vertreibt den Schwarm). Bei Tag (sonneMin) und unter
        // regenMax fliegt er, sonst ruht er (kein Glied im Bild). Der Leib ist der des Singvogels (leib).
        schwarm: Object.freeze({
            zelleM: 480,
            anteil: 0.5,
            deckungMax: 0.35,
            glieder: [60, 140],
            hoeheM: [24, 46],
            radiusM: [60, 140],
            tempoMs: 13,
            abstandM: 1.1,
            raumJeGlied: 1.6,
            form: [1.6, 0.42, 1],
            atmen: Object.freeze({ hz: 0.05, amp: 0.14 }),
            welle: Object.freeze({ hz: 0.11, amp: 0.35, k: 1.4 }),
            zitterM: 0.22,
            zitterHz: 0.6,
            gleitHz: 0.45,
            raumM: 1.0,
            verband: Object.freeze({ rauschRad: 1.2, eigen: 0.5, hz: [0.13, 0.31], dtMax: 0.25 }),
            nahM: 60,
            sichtM: 320,
            sonneMin: 0.05,
            regenMax: 0.5,
            frischeS: 30,
        }),
    });
    // saat (uint32), die Zelle (ix, iz) und die Wurf-Nummer k → [0, 1).
    function vogelWurf(saat, ix, iz, k) {
        var h = (saat ^ Math.imul(ix, 0x27d4eb2d) ^ Math.imul(iz, 0x165667b1) ^ Math.imul(k + 1, 0x9e3779b1)) >>> 0;
        h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
        h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }
    // u = vogelWurf(…, 0) der Zelle, lebendig und deckung an ihrer Mitte (0..1). Liefert: wohnt dort ein Revier?
    function vogelRevier(u, lebendig, deckung, V) {
        var l = lebendig > 0 ? (lebendig < 1 ? lebendig : 1) : 0;
        var d = deckung > 0 ? (deckung < 1 ? deckung : 1) : 0;
        return u < ((V.proHa * V.zelleM * V.zelleM) / 10000) * Math.sqrt(l) * (V.habitatBasis + (1 - V.habitatBasis) * d);
    }
    // sonne = sin der Sonnenhöhe, regen und wind 0..1. Liefert den Anteil des Lieds (0..1).
    function vogelLied(sonne, regen, wind, V) {
        var C = V.lied.chor,
            chor = C[C.length - 1][1];
        if (sonne <= C[0][0]) chor = C[0][1];
        else
            for (var i = 1; i < C.length; i++)
                if (sonne <= C[i][0]) {
                    chor = C[i - 1][1] + ((C[i][1] - C[i - 1][1]) * (sonne - C[i - 1][0])) / (C[i][0] - C[i - 1][0]);
                    break;
                }
        var r = regen > 0 ? (regen < 1 ? regen : 1) : 0;
        var w = wind > 0 ? (wind < 1 ? wind : 1) : 0;
        return chor * (1 - r) * (1 - r) * (1 - V.lied.windStill * w);
    }
    // w = die Würfe des Reviers [Phase, Höhe, Kreis, Drehsinn] (0..1), anteil = vogelLied, t = die Uhr der Welt (s), deckung die
    // Kronen-Deckung der Zelle (0..1). Schreibt out {dx, dz (von der Mitte), h (über dem Boden), gier (rad, Blick +z), schlag
    // (rad)}; liefert, ob er singt (und fliegt).
    function vogelBahn(w, anteil, t, deckung, V, out) {
        var F = V.flug,
            P = F.periodeS;
        var S = P * F.dutyMax * (anteil > 0 ? (anteil < 1 ? anteil : 1) : 0);
        var tp = (((t - w[0] * P) % P) + P) % P;
        // ein Fenster, das seinen Auf- und Abstieg (2 steigS) nicht trägt, fliegt er nicht — am Boden schweigt er (der Regen hält
        // ihn unten, statt ihn in Hüpfern singen zu lassen); bis 3 steigS wächst der Flug stetig im Anteil in Höhe und Kreis
        var k = (S - 2 * F.steigS) / F.steigS;
        if (!(tp < S) || !(k > 0)) return false;
        var a = Math.min(tp, S - tp) / F.steigS;
        var s = (a >= 1 ? 1 : a * a * (3 - 2 * a)) * (k >= 1 ? 1 : k * k * (3 - 2 * k));
        var R = F.radiusM[0] + (F.radiusM[1] - F.radiusM[0]) * w[2];
        var sinn = w[3] < 0.5 ? -1 : 1;
        var phi = w[3] * 12.566370614359172 + (sinn * F.tempoMs * tp) / R;
        out.dx = R * s * Math.cos(phi);
        out.dz = R * s * Math.sin(phi);
        var d = deckung > 0 ? (deckung < 1 ? deckung : 1) : 0;
        out.h = (F.hoeheM[0] + (F.hoeheM[1] - F.hoeheM[0]) * w[1] + F.kroneM * d) * s;
        out.gier = Math.atan2(-sinn * Math.sin(phi), sinn * Math.cos(phi));
        out.schlag = V.leib.schlagRad * Math.sin(6.283185307179586 * V.leib.schlagHz * t + w[0] * 97);
        return true;
    }
    // DER SCHWARM (VOGEL_GESETZ.schwarm). u = vogelWurf(…, 0) der Schwarm-Zelle, deckung die Kronen-Deckung ihrer Mitte (0..1).
    // Liefert: zieht dort ein Schwarm?
    function schwarmRevier(u, deckung, V) {
        var S = V.schwarm;
        return u < S.anteil && !(deckung > S.deckungMax);
    }
    // w = die Würfe des Schwarms [Phase, Kreis, Drehsinn, Höhe, Glieder] (0..1), t = die Uhr der Welt (s), sonne = sin der
    // Sonnenhöhe, regen 0..1. Schreibt out {dx, dz (von der Mitte), h (über dem Boden), gier (rad, Blick +z), n (Glieder)};
    // liefert, ob er fliegt. Das Zentrum ist der EINE Agent: fern rechnet der Schwarm nur dies.
    function schwarmZentrum(w, t, sonne, regen, V, out) {
        var S = V.schwarm;
        out.n = Math.round(S.glieder[0] + (S.glieder[1] - S.glieder[0]) * w[4]);
        if (!(sonne >= S.sonneMin) || regen > S.regenMax) return false;
        var R = S.radiusM[0] + (S.radiusM[1] - S.radiusM[0]) * w[1];
        var sinn = w[2] < 0.5 ? -1 : 1;
        var phi = w[0] * 6.283185307179586 + (sinn * S.tempoMs * t) / R;
        out.dx = R * Math.cos(phi);
        out.dz = R * Math.sin(phi);
        out.h = S.hoeheM[0] + (S.hoeheM[1] - S.hoeheM[0]) * w[3];
        out.gier = Math.atan2(-sinn * Math.sin(phi), sinn * Math.cos(phi));
        return true;
    }
    // Das Glied i von n um das Zentrum zur Zeit t (phase = w[0] des Schwarms, gier = die des Zentrums): die Formation als
    // Funktion — kein Zustand je Kopf; der Verband (schwarmWunsch, verbandZug) wirft seine Glieder in x, z aus ihr und fliegt
    // in y ihre Scheibe. Schreibt out {x, y, z (Welt-Versatz vom Zentrum, m), gier, schlag (rad)}.
    function schwarmGlied(i, n, t, phase, gier, V, out) {
        var S = V.schwarm,
            f = S.form,
            TAU = 6.283185307179586;
        // der Ball der Glieder je n (die Einheits-Lagen, R2-Folge, Radius ∛) und die Größen des Schwarms in diesem Takt (gleich
        // für jedes Glied) — gemerkt im Kratz-Objekt out
        if (out.n !== n) {
            var B = (out.ball = new Float32Array(3 * n));
            for (var b = 0; b < n; b++) {
                var u = (0.5 + b * 0.7548776662466927) % 1,
                    v = (0.5 + b * 0.5698402909980532) % 1;
                var rr = Math.cbrt((b + 0.5) / n),
                    ct = 1 - 2 * u,
                    st = Math.sqrt(1 - ct * ct);
                B[3 * b] = rr * st * Math.sin(TAU * v) * f[0];
                B[3 * b + 1] = rr * ct * f[1];
                B[3 * b + 2] = rr * st * Math.cos(TAU * v) * f[2];
            }
            out.t = null;
        }
        if (out.n !== n || out.t !== t || out.phase !== phase || out.gier0 !== gier) {
            out.n = n;
            out.t = t;
            out.phase = phase;
            out.gier0 = gier;
            out.R0 = S.abstandM * Math.cbrt((n * S.raumJeGlied) / (4.1887902047863905 * f[0] * f[1] * f[2]));
            out.R0 *= 1 + S.atmen.amp * Math.sin(TAU * (S.atmen.hz * t + phase));
            out.c = Math.cos(gier);
            out.s = Math.sin(gier);
        }
        var R0 = out.R0,
            ball = out.ball;
        var L = ball[3 * i] * R0,
            H = ball[3 * i + 1] * R0,
            Q = ball[3 * i + 2] * R0;
        var wp = (S.welle.k * L) / R0 - TAU * S.welle.hz * t;
        H += S.welle.amp * f[1] * R0 * Math.sin(wp);
        L += 0.5 * S.welle.amp * R0 * Math.cos(wp);
        var psi = TAU * ((i * 0.6180339887498949) % 1),
            zt = TAU * S.zitterHz * t;
        Q += S.zitterM * Math.cos(zt + psi);
        H += S.zitterM * Math.sin(1.3 * zt + 2 * psi);
        L += S.zitterM * Math.sin(0.8 * zt + 3 * psi);
        var c = out.c,
            s = out.s;
        out.x = c * Q + s * L;
        out.y = H;
        out.z = -s * Q + c * L;
        out.gier = gier + 0.12 * Math.sin(zt + psi);
        // Schlag und Gleiten: der Ausschlag blendet stetig zwischen dem Schlag des Leibs und der leicht gehobenen Gleit-Lage
        var g = Math.sin(TAU * S.gleitHz * t + psi);
        var a = g > 0.6 ? 0 : g < 0.2 ? 1 : (0.6 - g) / 0.4;
        var L0 = V.leib;
        out.schlag = 0.15 + a * (L0.schlagRad * Math.sin(TAU * L0.schlagHz * t + 97 * psi) - 0.15);
        return out;
    }
    // DER WUNSCH DES GLIEDS i im Verband (VOGEL_GESETZ.schwarm.verband) zur Zeit t: der Kurs gier des Zentrums im Tempo tempoMs,
    // gedreht um rauschRad × (eigen × seine Vorliebe + (1 − eigen) × sein Rauschen) — die Vorliebe ein fester Wurf des Index in
    // [−1, 1], das Rauschen zwei Sinus der Frequenzen hz mit der Phase des Index. Ohne den Verband zerstreut die Vorliebe den
    // Schwarm; Ausrichtung und Zusammenhalt hält allein verbandZug. Schreibt out {x, z} (Welt-XZ, m/s).
    function schwarmWunsch(i, t, gier, V, out) {
        var S = V.schwarm,
            W = S.verband,
            TAU = 6.283185307179586;
        var psi = TAU * ((i * 0.6180339887498949) % 1),
            b = 2 * ((0.5 + i * 0.5698402909980532) % 1) - 1;
        var r = 0.6 * Math.sin(TAU * W.hz[0] * t + psi) + 0.4 * Math.sin(TAU * W.hz[1] * t + 3 * psi);
        var th = gier + W.rauschRad * (W.eigen * b + (1 - W.eigen) * r);
        out.x = S.tempoMs * Math.sin(th);
        out.z = S.tempoMs * Math.cos(th);
        return out;
    }
    // DIE SEPARATION DES NAHEN SCHWARMS: p = die Lagen der n Glieder (x, y, z je Glied, Welt), raum = der Paar-Raum (m),
    // G = das Gitter (Kratz-Speicher des Wirts, wächst mit n). Ein Hash-Gitter der Zelle raum (27 Nachbar-Zellen tragen jedes
    // Paar in Reichweite): zwei Glieder näher als raum weichen einander je um die Hälfte der Überdeckung (ein Jacobi-Schritt:
    // die Stöße summieren, dann gelten sie); bei exakter Deckung weicht das spätere in die Goldwinkel-Richtung seines Index
    // (deterministisch). Ein Schritt je Takt, auf die Lagen der Funktion — kein Zustand bleibt. Liefert die Zahl der Paare.
    var SCHWARM_NACHBARN = (function () {
        var o = [0, 0, 0];
        for (var x = -1; x <= 1; x++)
            for (var y = -1; y <= 1; y++)
                for (var z = -1; z <= 1; z++) if (x > 0 || (x === 0 && (y > 0 || (y === 0 && z > 0)))) o.push(x, y, z);
        return o;
    })();
    function schwarmSeparation(p, n, raum, G) {
        var m = 16;
        while (m < 2 * n) m <<= 1;
        if (!G.kopf || G.kopf.length < m) G.kopf = new Int32Array(m);
        if (!G.nach || G.nach.length < n) {
            G.nach = new Int32Array(n);
            G.zelle = new Int32Array(3 * n);
            G.d = new Float32Array(3 * n);
        }
        var kopf = G.kopf,
            nach = G.nach,
            zelle = G.zelle,
            d = G.d,
            k = m - 1,
            i,
            j;
        var h = function (x, y, z) {
            return (Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(z, 83492791)) & k;
        };
        kopf.fill(-1, 0, m);
        for (i = 0; i < n; i++) {
            var cx = Math.floor(p[3 * i] / raum),
                cy = Math.floor(p[3 * i + 1] / raum),
                cz = Math.floor(p[3 * i + 2] / raum);
            zelle[3 * i] = cx;
            zelle[3 * i + 1] = cy;
            zelle[3 * i + 2] = cz;
            var b = h(cx, cy, cz);
            nach[i] = kopf[b];
            kopf[b] = i;
            d[3 * i] = d[3 * i + 1] = d[3 * i + 2] = 0;
        }
        var paare = 0,
            N = SCHWARM_NACHBARN;
        // je Glied die eigene Zelle (nur spätere Glieder) und die 13 Zellen VOR ihr: jedes Paar genau einmal
        for (i = 0; i < n; i++)
            for (var o = 0; o < N.length; o += 3) {
                var qx = zelle[3 * i] + N[o],
                    qy = zelle[3 * i + 1] + N[o + 1],
                    qz = zelle[3 * i + 2] + N[o + 2];
                for (j = kopf[h(qx, qy, qz)]; j >= 0; j = nach[j]) {
                    if ((o === 0 && j <= i) || zelle[3 * j] !== qx || zelle[3 * j + 1] !== qy || zelle[3 * j + 2] !== qz) continue;
                    var dx = p[3 * j] - p[3 * i],
                        dy = p[3 * j + 1] - p[3 * i + 1],
                        dz = p[3 * j + 2] - p[3 * i + 2];
                    var q = dx * dx + dy * dy + dz * dz;
                    if (q >= raum * raum) continue;
                    var e = Math.sqrt(q),
                        u = e;
                    if (e < 1e-6) {
                        var ang = j * 2.39996;
                        dx = Math.cos(ang);
                        dy = 0;
                        dz = Math.sin(ang);
                        u = 1;
                    }
                    var s = (0.5 * (raum - e)) / u;
                    d[3 * i] -= dx * s;
                    d[3 * i + 1] -= dy * s;
                    d[3 * i + 2] -= dz * s;
                    d[3 * j] += dx * s;
                    d[3 * j + 1] += dy * s;
                    d[3 * j + 2] += dz * s;
                    paare++;
                }
            }
        for (i = 0; i < 3 * n; i++) p[i] += d[i];
        return paare;
    }

    // Mit folge (GANG_FOLGE, die Gangart aus dem Tempo) zieht das Netz jedes Bein in DIESES Muster: jedes Bein an jedes, die
    // Phasen-Differenz um den Versatz der Folge verschoben, die Stärke GANG_FOLGE.kopplung × Takt — im voll verbundenen Netz ist das
    // verschobene Gleichgewicht der einzige stabile Zustand (Kuramoto 1984; im Ring der vier Kanten blieb der Wechsel Trab →
    // Galopp in einem verdrehten Zustand stecken). Das alte Netz (CPG_COUPLING, sein Gleichgewicht der Pass) fiel ganz.
    function cpgStep(phases, freq, dt, folge) {
        var d = [0, 0, 0, 0];
        for (var i = 0; i < 4; i++) {
            var c = 0;
            for (var j = 0; j < 4; j++) if (j !== i) c += Math.sin(phases[j] - phases[i] - (folge[j] - folge[i]));
            d[i] = freq * (1 + c * GANG_FOLGE.kopplung);
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
    // DIE FELL-SCHALE (K45, rein additiv): das Haar-Raster der Fell-Schalen des Ofens (foundry-core __tierFellSchalen:
    // aSchale = t · lokale Dichte · Haar-Zellen je Einheit, aWurzel = der Bind-Punkt der Haar-Wurzel) als DATEN — EINE
    // Quelle, zwei Leser: der Welt-Stoff (stamm `fellSchale`, TSL) und das Labor (worlds/tetrapoda, GLSL). Je Zelle eine
    // Locke mit gewürfeltem Zentrum (hash = zwei sin-Hashes, mitte × die Zelle), Radius √Dichte × radius, zur Spitze
    // um zulauf schmaler; sie endet bei ende + endeSpanne × Hash der Länge; die Schalen unter wolle decken, wo die Dichte
    // über wolleAb liegt. Ton Wurzel → Spitze = Ton × (wurzel → spitze) — gemessen V18.497 (Fell-Linse 4 m, 0,55 → 1,1
    // las 28,1 = Parität zur Haut). Bis K45 standen die Zahlen als Literale im Stamm (AnazhRealm.FELL_SCHALE + TSL).
    // DER STRICH (haar.K1): das Haar liegt — die Locke ist flächentreu längs der Legerichtung gestreckt (√strich längs, 1/√strich
    // quer); die Legerichtung liest der Stoff aus der Schale selbst (der Teil von Lage − Wurzel quer zur Normale: der Kamm des
    // Ofens, Lean ∝ t²). Bis haar-fell-soll war die Locke rund: das Fell las als Filz, Strich-Kohärenz 0,28 gegen die REF 0,54.
    var FELL_SCHALE = Object.freeze({
        wurzel: 0.55,
        spitze: 1.1,
        hashA: Object.freeze([12.9898, 78.233, 37.719, 43758.5453]),
        hashB: Object.freeze([39.3468, 11.1351, 83.1559, 24634.6345]),
        hashC: 7.123,
        mitte: 0.4,
        radius: 0.62,
        zulauf: 0.75,
        ende: 0.55,
        endeSpanne: 0.45,
        wolle: 0.34,
        wolleAb: 0.05,
        strich: 4,
    });

    // ════════════════════════════════════════════════════════════════════
    // DER MASSSTAB (Welle 5, die EINE Welt-Größe): eine Lab-Einheit ist ein Drittel Meter — der Wolf (Größe 2,4)
    // trägt seinen Widerrist bei ~1,0 H = 0,8 m, der Fuchs (1,5) bei ~0,47 m, der Bär (3,2) bei ~1,1 m, der Hirsch
    // (2,8) bei ~1,07 m. Der Wirt skaliert die Gestalt mit DIESER Zahl (vorher: die Seelen-Teile-Höhe, deren Skala
    // die Allometrie-Schleife überschrieb — die Welt zeigte Lab-Einheiten als Meter, den Wolf 2,7 m hoch).
    // ── 0710-4 (rein additiv): die DICHTE DES GEWEBES (kg/m³) — die Masse eines Tiers ist das Volumen seiner Gestalt
    //    (die geschlossene Haut, die dieser Kern formt) mal dieser Zahl: Fuchs 15 · Wolf 64 · Hirsch 94 · Bär 335 kg bei
    //    Größe 1. Der Wirt las bis 0710-4 eine Kapsel aus der Hüft-Höhe mal 1000 (der Hirsch wog 436 kg, der Bär 255). ──
    var MASSSTAB = Object.freeze({ meterJeEinheit: 1 / 3, dichteKgM3: 1000 });
    // ── 0710-4 (rein additiv) — DER BISS ALS STOSS: der Jäger trifft mit seiner Vorhand (Kopf, Hals, Brust) — dieser
    //    Anteil seiner Masse — im Tempo des Ansprungs (VERHALTEN.aktionen.pounce.tempo × tempoEinheit(L)). Sein Impuls
    //    geht durch das EINE Impuls-Gesetz des Wirts wie Klinge, Pfeil und Wagen (vorher: Schaden ohne Rückstoß). ──
    // ── Welle LF 09.10. (rein additiv) — DER KOPF ZIELT: im Ansprung neigt der Jaeger den Kopf auf den Leib des Ziels, in
    //    diesem Bereich (rad, Nase abwaerts positiv wie headX): hoch bis -0,6 (die Kehle eines Stehenden), tief bis 1,0 (die
    //    Flanke eines Kitzes; grasen senkt die Nase mit 0,95 ins Gras); liegt der Leib tiefer als der Kopf, senkt er die Front
    //    bis rumpfNeigung (rad, wie bodyX: die Verbeugung playbow senkt sie um 0,35) — so reicht das Maul an den Ruecken eines
    //    Fuchses. ──
    var BISS = Object.freeze({ masseAnteil: 0.3, kopfNeigung: Object.freeze([-0.6, 1.0]), rumpfNeigung: 0.5 });
    // ── Welle LF 09.10. (rein additiv) — DIE KAMPF-GRÖSSE DES LEIBS: Biss, Haut und Leben eines Tiers folgen der EINEN Masse
    //    seines Leibs (das Volumen der Gestalt × dichteKgM3 — Gattung UND Größe) gegen die Bezugs-Masse refKg, den Wolf der
    //    Größe 1 (64 kg; an ihm ist der Biss geeicht, 8,73 HP am Spieler). Die Kraft des Bisses wächst mit dem Querschnitt der
    //    Kau-Muskeln (∝ m^⅔; Christiansen & Wroe 2007: Beißkraft ∝ Körpermasse^0,6–0,7), die Dicke der Haut mit der Länge
    //    (∝ m^⅓), das Leben mit dem Querschnitt des Leibs (∝ m^⅔). Wirt: _kreaturKampfGroesse in computeCreatureStats (vorher
    //    damage 19,75 und defense 11,9 für jede Gattung und Größe — die Tiere sind tag-gleich). ──
    var KAMPF = Object.freeze({ refKg: 64, biss: 2 / 3, haut: 1 / 3, leben: 2 / 3 });

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
        BISS: BISS,
        KAMPF: KAMPF,
        ART_GESTALT: ART_GESTALT,
        artGestalt: artGestalt,
        tierAuge: tierAuge,
        fellFarbe: fellFarbe,
        ANATOMIE_SOLL: ANATOMIE_SOLL,
        GANG_GESETZ: GANG_GESETZ,
        GANG_FOLGE: GANG_FOLGE,
        gangSchritt: gangSchritt,
        gangFuss: gangFuss,
        gangBecken: gangBecken,
        gangReich: gangReich,
        gangPhaseHaelt: gangPhaseHaelt,
        STEUER_GESETZ: STEUER_GESETZ,
        tempoEinheit: tempoEinheit,
        sprintTempo: sprintTempo,
        steuerSchritt: steuerSchritt,
        ankunftTempo: ankunftTempo,
        UMWEG_GESETZ: UMWEG_GESETZ,
        umwegSeite: umwegSeite,
        VERBAND_GESETZ: VERBAND_GESETZ,
        verbandZug: verbandZug,
        rudelPlatz: rudelPlatz,
        temperamentDerGattung: temperamentDerGattung,
        FURCHT_GESETZ: FURCHT_GESETZ,
        bedrohung: bedrohung,
        furchtErinnert: furchtErinnert,
        furchtOrt: furchtOrt,
        fluchtRadius: fluchtRadius,
        JAGD_GESETZ: JAGD_GESETZ,
        wundTempo: wundTempo,
        LEBENSRAUM_GESETZ: LEBENSRAUM_GESETZ,
        bodenKlasse: bodenKlasse,
        lebensraum: lebensraum,
        lebensraumWahl: lebensraumWahl,
        DURST_GESETZ: DURST_GESETZ,
        durst: durst,
        ETHOGRAMM_GESETZ: ETHOGRAMM_GESETZ,
        lichtPhase: lichtPhase,
        ruhePegel: ruhePegel,
        aesung: aesung,
        taetigkeit: taetigkeit,
        BESTAND_GESETZ: BESTAND_GESETZ,
        bestandNahrung: bestandNahrung,
        bestandBilanz: bestandBilanz,
        bestandFrass: bestandFrass,
        bestandRiss: bestandRiss,
        VOGEL_GESETZ: VOGEL_GESETZ,
        vogelWurf: vogelWurf,
        vogelRevier: vogelRevier,
        vogelLied: vogelLied,
        vogelBahn: vogelBahn,
        schwarmRevier: schwarmRevier,
        schwarmZentrum: schwarmZentrum,
        schwarmGlied: schwarmGlied,
        schwarmWunsch: schwarmWunsch,
        schwarmSeparation: schwarmSeparation,
        TIER_MATERIAL_KLASSEN: TIER_MATERIAL_KLASSEN,
        FELL_LOOK: FELL_LOOK,
        FELL_SCHALE: FELL_SCHALE,
        DIAL_MAP: DIAL_MAP,
        STUDIO_VERTRAG: STUDIO_VERTRAG,
        MESHFREI: MESHFREI,
        PORTAL_RENDER_CONFIG: PORTAL_RENDER_CONFIG,
        PRESETS: PRESETS,
        PARAMS_BY_KIND: { kreatur: PARAMS },
        // Die Lab-Quellen (die Shell liest DIESE eine Quelle — Aliasse):
        GATTUNGEN: GATTUNGEN,
        MOTION: MOTION,
        STAND_POSE: STAND_POSE,
        VERHALTEN: VERHALTEN,
        fellStreu: fellStreu,
        TREFFER_ZONE: TREFFER_ZONE,
        trefferZone: trefferZone,
    };
})(typeof self !== "undefined" ? self : globalThis);
