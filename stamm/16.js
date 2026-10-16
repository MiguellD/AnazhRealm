class AnazhRealm_Z16 {
    // ===== ATLAS §16 · SUBSTANZ/BAU — Materialien · Baupläne · der EINE Builder · Verbindungen =====
    // Default-Baupläne als Daten. Drei built-ins, die das ersetzen, was
    // vorher als JS-Funktionen lebte. Wer Variation will, klont diese und
    // ändert Parts.
    _defaultBlueprints() {
        // Hilfsfunktionen der Built-in-Generierung: bauen Baupläne imperativ, liefern flache Part-Listen
        // (läuft einmal beim Init). Dorf/Tempel sind keine Baupläne hier: spawn_village → Studio-Dorf
        // (exportSettlement → spawnSettlement), spawn_temple → fachwerk haus_griechisch.
        const waterfallParts = [
            // Klippe hinten
            {
                shape: "box",
                color: 0x4a4a55,
                position: { x: 0, y: 4.0, z: -0.6 },
                size: { x: 4.0, y: 8.0, z: 1.0 },
            },
            // Wasser-Plane (segmentiert + animiert)
            {
                shape: "plane",
                color: 0x4ea0d4,
                position: { x: 0, y: 4.0, z: 0.05 },
                size: { x: 2.6, y: 7.5, z: 1 },
                opacity: 0.75,
                animate: "water_wave",
            },
            // Becken am Fuß
            {
                shape: "cylinder",
                color: 0x2a6a8a,
                position: { x: 0, y: 0.2, z: 0 },
                size: { x: 5.0, y: 0.4, z: 5.0 },
                segments: 16,
                opacity: 0.7,
            },
        ];

        // Baum-Baupläne: siehe treeSpeciesBlueprints (Form aus `_growTreeBlueprintRich`). Nur holz + laub —
        // HISM-Draw-Calls skalieren mit der MATERIAL-Zahl, und die Affinitäts-Tags bleiben neutral.

        // TOTHOLZ: liegender Holz-Stamm ohne Krone. Material holz → tag-neutral zu den Bäumen
        // (computeCompoundTags = MAX je material + shape). Spawnt NICHT im Affinitäts-Wettstreit (verdrängte
        // sonst Bäume), sondern als Sub-Spawn nach dem Baum (_vegetationSampleSpawn: ~10 %, ~4 m, seed-det.).
        const stammGefallenParts = [
            // Hauptstamm — liegender Zylinder. Die Eigenachse des Zylinders
            // ist y → eine z-Rotation um PI/2 legt ihn horizontal hin.
            {
                shape: "cylinder",
                material: "holz",
                position: { x: 0, y: 0.42, z: 0 },
                size: { x: 0.42, y: 2.4, z: 0.42 },
                rotation: { z: Math.PI / 2 },
                segments: 7,
            },
            // Wurzel-Ende: leicht dickerer Kegel-Stumpf am einen Ende, gibt
            // Charakter (ein Baumstamm war nicht uniform — der Wurzel-Sockel
            // ist breiter als die Krone war).
            {
                shape: "cylinder",
                material: "holz",
                position: { x: -1.2, y: 0.46, z: 0 },
                size: { x: 0.56, y: 0.5, z: 0.56 },
                rotation: { z: Math.PI / 2 },
                segments: 7,
            },
        ];
        // Affinitäts-Baupläne, damit Regionen sich strukturell unterscheiden: stein_block (dichte+härte →
        // Felsen-Felder) · kristall_geode (magieleitung+resoniert → Magie) · glutbrunnen (brennbar → Vulkan).
        // Felsblock = noiserock aus der härte; Material + Größe (stein, 2.4) fix → Affinitäts-Baseline bleibt.
        const steinBlockParts = [
            {
                shape: "noiserock",
                material: "stein",
                position: { x: 0, y: 1.2, z: 0 },
                size: { x: 2.4, y: 2.4, z: 2.4 },
            },
        ];
        // KIESEL-Streu der Scatter-Schicht „rock" (steile, trockene Hänge): 2–3 noiserock-Steine (stein).
        // Instanced für HISM, NICHT promotable (reine Deko).
        const kieselParts = [
            {
                shape: "noiserock",
                material: "stein",
                position: { x: 0, y: 0.22, z: 0 },
                size: { x: 0.55, y: 0.4, z: 0.5 },
            },
            {
                shape: "noiserock",
                material: "stein",
                position: { x: 0.34, y: 0.13, z: 0.18 },
                size: { x: 0.32, y: 0.26, z: 0.3 },
                rotation: { x: 0.3, y: 0.7, z: 0.1 },
            },
            {
                shape: "noiserock",
                material: "stein",
                position: { x: -0.28, y: 0.11, z: -0.22 },
                size: { x: 0.26, y: 0.22, z: 0.28 },
                rotation: { x: -0.2, y: 1.1, z: 0.2 },
            },
        ];
        // ein mittlerer Felsbrocken (zwischen Kiesel + stein_block) — der Übergang
        // an exponierten Graten; ein dominanter noiserock + ein Begleiter.
        const felsbrockenParts = [
            {
                shape: "noiserock",
                material: "stein",
                position: { x: 0, y: 0.6, z: 0 },
                size: { x: 1.35, y: 1.15, z: 1.25 },
            },
            {
                shape: "noiserock",
                material: "stein",
                position: { x: 0.7, y: 0.3, z: 0.35 },
                size: { x: 0.6, y: 0.5, z: 0.55 },
                rotation: { x: 0.2, y: 0.5, z: 0.15 },
            },
        ];
        // Damm: Stein-Wall quer zum Fluss (~8 × 1.2 × 3 m), staut den See-Spiegel auf.
        // `_terrainMacroSurfaceY` liest ihn als zusätzliche Surface-Höhe → die Hydrosphäre sieht Land.
        const dammParts = [
            {
                shape: "box",
                material: "stein",
                position: { x: 0, y: 1.5, z: 0 },
                size: { x: 8.0, y: 3.0, z: 1.2 },
            },
        ];
        // Genesis-Plattform: beim Erschaffen einer Welt am Zentrum gespawnt, der Spieler startet darauf
        // (erhöhte Warte statt Fall ins Tal). Stein-Scheibe + quarz-Kern.
        const startPlattformParts = [
            {
                shape: "cylinder",
                material: "stein",
                position: { x: 0, y: 0.5, z: 0 },
                size: { x: 13, y: 1, z: 13 },
            },
            {
                shape: "cylinder",
                material: "quarz",
                position: { x: 0, y: 1.15, z: 0 },
                size: { x: 2.2, y: 0.35, z: 2.2 },
                opacity: 0.9,
            },
        ];
        // kristall_geode: kleiner quarz-Matrix-Nub (Tags + Fuß) + facettierte Prisma-Spitzen (`crystalPoint` →
        // `phyto-core.buildCrystalPointGeometry`) — dieselbe Quelle wie der Worldgen-Pool `_crystalVariant`.
        // TAG-NEUTRAL: `crystalPoint` aktiviert BIT-IDENTISCH zu `octahedron` (FORM_TAG_ACTIVATION) → Tags
        // bleiben { dichte 1.95, magieleitung 2.55, resoniert 2.7 } (checkBandArchAffinityStability).
        const kristallGeodeParts = [
            // das quarz-BETT: ein kleiner, flacher Matrix-Nub (sphere nutzt nur size.x → immer
            // rund, darum KLEIN halten, sonst dominiert der Ball [§11]); trägt Fuß + Tags.
            {
                shape: "sphere",
                material: "quarz",
                color: 0x86bccf,
                position: { x: 0, y: 0.22, z: 0 },
                size: { x: 1.5, y: 0.9, z: 1.5 },
                opacity: 0.78,
            },
            // die dominante Zepter-Spitze (mittig, aufragend).
            {
                shape: "crystalPoint",
                material: "quarz",
                color: 0x9fd6e8,
                position: { x: 0, y: 1.55, z: 0 },
                size: { x: 0.5, y: 2.7, z: 0.5 },
                facets: 6,
                termFrac: 0.34,
                opacity: 0.86,
            },
            // wurzelnde Begleiter-Prismen (leicht geneigt, verschiedene Höhen → Druse).
            {
                shape: "crystalPoint",
                material: "quarz",
                color: 0x9fd6e8,
                position: { x: 0.62, y: 0.95, z: 0.28 },
                size: { x: 0.34, y: 1.5, z: 0.34 },
                rotation: { x: 0.26, y: 0.5, z: 0.16 },
                facets: 6,
                termFrac: 0.36,
                opacity: 0.86,
            },
            {
                shape: "crystalPoint",
                material: "quarz",
                color: 0x9fd6e8,
                position: { x: -0.5, y: 0.85, z: -0.55 },
                size: { x: 0.3, y: 1.25, z: 0.3 },
                rotation: { x: -0.22, y: -0.35, z: -0.14 },
                facets: 6,
                termFrac: 0.38,
                opacity: 0.86,
            },
        ];
        // DIE FEUERSTELLE (Architektur-Welle 05.10.): die Gestalt baut das Gesetzbuch (fachwerk `feuerstelle`, über die
        // studioGestalt-Zeile unten) — diese Parts sind ihre unsichtbare SUBSTANZ: der Steinring als niedriger Blocker
        // (30 cm, man steigt hinüber) und der Glut-Kern. Form und Stoff wie zuvor (Zylinder Stein · Kugel Glut): die
        // Tags sind größen-unabhängig (computeCompoundTags), die Affinität und damit jeder Ort im Glut-Feld bleibt.
        const glutbrunnenParts = [
            {
                shape: "cylinder",
                material: "stein",
                position: { x: 0, y: 0.15, z: 0 },
                size: { x: 1.4, y: 0.3, z: 1.4 },
                segments: 12,
            },
            {
                shape: "sphere",
                material: "glut",
                position: { x: 0, y: 0.18, z: 0 },
                size: { x: 0.7, y: 0.36, z: 0.7 },
                opacity: 0.75,
            },
        ];

        // ### Felsformationen ###
        // felsbogen: Trilithon (2 Pfeiler + Sturz) = Überhang ohne Voxel — die Per-Part-Kollision
        // (entry.blockerAABBs) lässt zwischen den Pfeilern eine begehbare Lücke. Die Kollisions-Teile
        // bleiben achsen-parallel und an Position/Größe fix; Deko nur tag-neutral (stein unter dem box-
        // dichte-MAX → {dichte 2.55}, checkBandArchAffinityStability), sonst verschiebt sich der Spawn-Ort.
        const felsbogenParts = [
            // Pfeiler-Sockel links (verwittert breiterer Fuß — Deko, octahedron-
            // frei, box-dichte 3 = bestehender MAX → tag-neutral).
            {
                shape: "box",
                material: "stein",
                position: { x: -2.6, y: 0.5, z: 0 },
                size: { x: 2.4, y: 1.0, z: 2.5 },
                rotation: { x: 0, y: 0.05, z: 0 },
            },
            // Pfeiler links (KOLLISION — unverändert)
            {
                shape: "box",
                material: "stein",
                position: { x: -2.6, y: 2.5, z: 0 },
                size: { x: 1.8, y: 5, z: 2.0 },
            },
            // Pfeiler-Sockel rechts
            {
                shape: "box",
                material: "stein",
                position: { x: 2.6, y: 0.5, z: 0 },
                size: { x: 2.4, y: 1.0, z: 2.5 },
                rotation: { x: 0, y: -0.04, z: 0 },
            },
            // Pfeiler rechts (KOLLISION — unverändert)
            {
                shape: "box",
                material: "stein",
                position: { x: 2.6, y: 2.5, z: 0 },
                size: { x: 1.8, y: 5, z: 2.0 },
            },
            // Der Sturz (KOLLISION — unverändert, Unterkante y=4.9, Durchgang frei)
            {
                shape: "box",
                material: "stein",
                position: { x: 0, y: 5.7, z: 0 },
                size: { x: 8.4, y: 1.6, z: 2.2 },
            },
            // Schlussstein (Keystone) — sitzt OBEN auf dem Sturz-Scheitel, mittig.
            {
                shape: "box",
                material: "stein",
                position: { x: 0, y: 6.7, z: 0 },
                size: { x: 1.6, y: 1.2, z: 2.4 },
                rotation: { x: 0, y: 0, z: 0.04 },
            },
            // Verwitterte Fels-Aufsätze (asymmetrisch, brechen die Tür-Rahmen-
            // Silhouette auf; sitzen oben, berühren die Durchgang-Lücke nicht).
            {
                shape: "octahedron",
                material: "stein",
                position: { x: 2.2, y: 7.0, z: 0.2 },
                size: { x: 1.6, y: 1.4, z: 1.6 },
                rotation: { x: 0.2, y: 0.5, z: 0.15 },
            },
            {
                shape: "octahedron",
                material: "stein",
                position: { x: -2.4, y: 6.9, z: -0.3 },
                size: { x: 1.3, y: 1.1, z: 1.3 },
                rotation: { x: -0.15, y: -0.4, z: 0.2 },
            },
        ];
        // felsturm: EISEN-Mast (stromleitung 0.85 → `broadcasting`-Affordanz): als Relais in 18 m eines
        // `radiating`-Strahlers verlängert er dessen Resonanz-Reichweite bis 2× (_tickRadiatingAffordances).
        // Tragende Segmente achs-zentriert (x=z=0) → Spreizung 0 → `_isMoveable` strukturell unmöglich,
        // obwohl eisen den Antrieb füllt; y-axial für die broadcasting-Ausrichtung. dichte 1.8 = Baseline.
        const felsturmParts = [
            // Geschmiedeter Eisen-Mast: ein klarer, sich verjüngender vertikaler
            // Stapel (Basis → Spitze), achs-zentriert (x=z=0 → schmale Säule, kein
            // Fahrzeug; y-axial → sendet). Die Absatz-Ringe (Kragen) geben Rhythmus.
            {
                shape: "cylinder",
                material: "eisen",
                position: { x: 0, y: 3, z: 0 },
                size: { x: 4.4, y: 6, z: 4.4 },
                segments: 10,
            },
            // Kragen-Ring 1 (Übergang Basis → Mitte)
            {
                shape: "cylinder",
                material: "eisen",
                position: { x: 0, y: 6.2, z: 0 },
                size: { x: 3.8, y: 0.5, z: 3.8 },
                segments: 10,
            },
            // Mittel-Segment
            {
                shape: "cylinder",
                material: "eisen",
                position: { x: 0, y: 8.4, z: 0 },
                size: { x: 3.0, y: 5, z: 3.0 },
                segments: 9,
            },
            // Kragen-Ring 2 (Übergang Mitte → oben)
            {
                shape: "cylinder",
                material: "eisen",
                position: { x: 0, y: 10.7, z: 0 },
                size: { x: 2.5, y: 0.4, z: 2.5 },
                segments: 9,
            },
            // Oberes Segment
            {
                shape: "cylinder",
                material: "eisen",
                position: { x: 0, y: 12.3, z: 0 },
                size: { x: 1.9, y: 3, z: 1.9 },
                segments: 8,
            },
            // Spitze (die sendende Nadel)
            {
                shape: "cone",
                material: "eisen",
                position: { x: 0, y: 15.3, z: 0 },
                size: { x: 1.7, y: 3, z: 1.7 },
                segments: 8,
            },
        ];

        // ### Welt-Werkstatt-Architekturen ###
        // Eine Welt-Werkstatt je Nicht-Default-Domain (role="workshop-station"); die Domäne EMERGIERT aus der
        // Substanz (_computeWorkshopDomain). confirmBuild/FERTIGEN eines domain-Bauplans verlangt im
        // pfad-Modus eine passende Werkstatt in WORKSHOP_PROXIMITY_M; architecture-Baupläne brauchen keine.
        const esseParts = this._buildForgeParts({});
        // V17.77 — die MEISTER-Esse: dieselbe Schmiede-Grammatik mit EISEN-Körper (dichter + härter
        // → feinere Toleranzen, höherer Präzisions-Cap). Die Glut lodert heißer (emissiv↑).
        const esseMeisterParts = this._buildForgeParts({ master: true });
        const brennkolbenParts = [
            // Holz-Untersatz
            {
                shape: "cylinder",
                material: "holz",
                position: { x: 0, y: 0.3, z: 0 },
                size: { x: 1.4, y: 0.6, z: 1.4 },
            },
            // Quarz-Kolben (durchsichtig)
            {
                shape: "sphere",
                material: "quarz",
                position: { x: 0, y: 1.2, z: 0 },
                size: { x: 1.0, y: 1.0, z: 1.0 },
                opacity: 0.55,
            },
            // Steinhals (Trichter)
            {
                shape: "cone",
                material: "stein",
                position: { x: 0, y: 2.0, z: 0 },
                size: { x: 0.6, y: 0.8, z: 0.6 },
            },
        ];
        const webstuhlParts = [
            // Holz-Pfosten links + rechts
            {
                shape: "cylinder",
                material: "holz",
                position: { x: -1.1, y: 1.2, z: 0 },
                size: { x: 0.2, y: 2.4, z: 0.2 },
            },
            {
                shape: "cylinder",
                material: "holz",
                position: { x: 1.1, y: 1.2, z: 0 },
                size: { x: 0.2, y: 2.4, z: 0.2 },
            },
            // Quer-Balken oben + unten (Leder-bespannt, deshalb leder als Material)
            {
                shape: "box",
                material: "leder",
                position: { x: 0, y: 2.2, z: 0 },
                size: { x: 2.4, y: 0.18, z: 0.3 },
            },
            {
                shape: "box",
                material: "leder",
                position: { x: 0, y: 0.4, z: 0 },
                size: { x: 2.4, y: 0.18, z: 0.3 },
            },
        ];
        const seelenstein_altarParts = [
            // Stein-Sockel (rund)
            {
                shape: "cylinder",
                material: "stein",
                position: { x: 0, y: 0.4, z: 0 },
                size: { x: 1.6, y: 0.8, z: 1.6 },
                segments: 8,
            },
            // Quarz-Helix als Seelen-Kanal
            {
                shape: "helix",
                material: "quarz",
                position: { x: 0, y: 1.4, z: 0 },
                size: { x: 0.5, y: 1.2, z: 4 }, // size.x=Radius, size.y=Höhe, size.z=Windungen
                opacity: 0.7,
            },
            // Knochen-Kranz auf dem Sockel
            {
                shape: "torus",
                material: "knochen",
                position: { x: 0, y: 0.95, z: 0 },
                size: { x: 1.2, y: 0.18, z: 1.2 },
            },
        ];
        const drehbankParts = [
            // Holz-Tisch
            {
                shape: "box",
                material: "holz",
                position: { x: 0, y: 0.7, z: 0 },
                size: { x: 2.6, y: 0.2, z: 1.0 },
            },
            // Tischbeine (4 Stück)
            ...[
                { x: -1.1, z: -0.4 },
                { x: 1.1, z: -0.4 },
                { x: -1.1, z: 0.4 },
                { x: 1.1, z: 0.4 },
            ].map((p) => ({
                shape: "cylinder",
                material: "holz",
                position: { x: p.x, y: 0.3, z: p.z },
                size: { x: 0.14, y: 0.6, z: 0.14 },
            })),
            // Eisen-Spindel quer auf dem Tisch
            {
                shape: "cylinder",
                material: "eisen",
                position: { x: 0, y: 0.95, z: 0 },
                size: { x: 0.16, y: 2.0, z: 0.16 },
                rotation: { x: 0, y: 0, z: Math.PI / 2 },
            },
            // Eisen-Spannfutter (links)
            {
                shape: "cylinder",
                material: "eisen",
                position: { x: -1.0, y: 0.95, z: 0 },
                size: { x: 0.3, y: 0.18, z: 0.3 },
                rotation: { x: 0, y: 0, z: Math.PI / 2 },
            },
        ];

        // Welt-Portal: geerdetes Runen-Tor — Stein-Ring + Quarz-Membran (transparent + magieleitend →
        // durchscheinend-arkan) + Sockel + zwei Pfeiler + Runen-Glyphen.
        const weltPortalParts = [
            // der STEIN-RING (Tor-Rahmen) + die arkane QUARZ-MEMBRAN.
            { shape: "torus", material: "stein", position: { x: 0, y: 2.5, z: 0 }, size: { x: 3.4, y: 3.4, z: 3.4 } },
            {
                shape: "cylinder",
                material: "quarz",
                color: 0x9fd6e8,
                opacity: 0.5,
                position: { x: 0, y: 2.5, z: 0 },
                size: { x: 2.6, y: 0.16, z: 2.6 },
                rotation: { x: Math.PI / 2, y: 0, z: 0 },
            },
            // BASIS-Sockel + zwei Pfeiler → das Tor steht auf dem Boden (Lastpfad geschlossen).
            { shape: "box", material: "stein", position: { x: 0, y: 0.2, z: 0 }, size: { x: 4.2, y: 0.4, z: 1.5 } },
            { shape: "box", material: "stein", position: { x: -1.55, y: 1.3, z: 0 }, size: { x: 0.5, y: 2.4, z: 0.6 } },
            { shape: "box", material: "stein", position: { x: 1.55, y: 1.3, z: 0 }, size: { x: 0.5, y: 2.4, z: 0.6 } },
            // RUNEN-Glyphen (quarz octahedron) gleichmäßig um den Ring.
            ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const a = (i / 8) * Math.PI * 2 + 0.2;
                const rr = 2.05; // auf dem AUSSEN-Rand des Torus-Wulstes (sichtbar, nicht eingebettet)
                return {
                    shape: "octahedron",
                    material: "quarz",
                    color: 0x9fd6e8,
                    position: { x: Math.cos(a) * rr, y: 2.5 + Math.sin(a) * rr, z: 0 },
                    size: { x: 0.34, y: 0.34, z: 0.34 },
                };
            }),
        ];

        // W12 Phase 2 — Strom-Welt-Portal: ein Quarz-Ring (Crystalline Tor,
        // sichtbar abgesetzt vom Stein-Ring des welt_portal). Führt in die
        // three-fluid-fx-Sub-Welt (worlds/fluid/).
        const weltStromParts = [
            {
                shape: "torus",
                material: "quarz",
                position: { x: 0, y: 2.2, z: 0 },
                size: { x: 3.4, y: 3.4, z: 3.4 },
            },
            {
                shape: "cylinder",
                material: "quarz",
                position: { x: 0, y: 2.2, z: 0 },
                size: { x: 2.6, y: 0.16, z: 2.6 },
                rotation: { x: Math.PI / 2, y: 0, z: 0 },
            },
        ];

        // Terrain-Portal (heute: Phytogenesis & Lithos) — ein Quarz-Ring
        // zur fremden Morphologie-Labor-Welt (worlds/terrain/).
        const weltTerrainParts = [
            {
                shape: "torus",
                material: "quarz",
                position: { x: 0, y: 2.2, z: 0 },
                size: { x: 3.6, y: 3.6, z: 3.6 },
            },
            {
                shape: "cylinder",
                material: "quarz",
                position: { x: 0, y: 2.2, z: 0 },
                size: { x: 2.8, y: 0.16, z: 2.8 },
                rotation: { x: Math.PI / 2, y: 0, z: 0 },
            },
        ];

        // Garage-Portal (08.07.2026) — ANATOMIE · FAHRZEUG: ein eiserner
        // Rad-Reif (Reif + Nabe) mit Quarz-Scheibe als Tor-Fläche — das
        // Fahrzeug-Motiv, unverwechselbar neben den Quarz-Ringen.
        const weltGarageParts = [
            {
                shape: "torus",
                material: "eisen",
                position: { x: 0, y: 2.0, z: 0 },
                size: { x: 3.2, y: 3.2, z: 3.2 },
            },
            {
                shape: "cylinder",
                material: "eisen",
                position: { x: 0, y: 2.0, z: 0 },
                size: { x: 0.55, y: 0.5, z: 0.55 },
                rotation: { x: Math.PI / 2, y: 0, z: 0 },
            },
            {
                shape: "cylinder",
                material: "quarz",
                position: { x: 0, y: 2.0, z: 0 },
                size: { x: 2.5, y: 0.14, z: 2.5 },
                rotation: { x: Math.PI / 2, y: 0, z: 0 },
            },
        ];

        // Portale-Portal (08.07.2026) — PORTA: ein steinerner Torbogen
        // (zwei Pfeiler + Sturz) mit Quarz-Scheibe — das Tor-Labor trägt
        // selbst die älteste Tor-Form, den Architrav.
        const weltPortaleParts = [
            {
                shape: "box",
                material: "stein",
                position: { x: -1.7, y: 1.6, z: 0 },
                size: { x: 0.6, y: 3.2, z: 0.6 },
            },
            {
                shape: "box",
                material: "stein",
                position: { x: 1.7, y: 1.6, z: 0 },
                size: { x: 0.6, y: 3.2, z: 0.6 },
            },
            {
                shape: "box",
                material: "stein",
                position: { x: 0, y: 3.45, z: 0 },
                size: { x: 4.0, y: 0.5, z: 0.6 },
            },
            {
                shape: "cylinder",
                material: "quarz",
                position: { x: 0, y: 1.7, z: 0 },
                size: { x: 2.6, y: 0.14, z: 2.6 },
                rotation: { x: Math.PI / 2, y: 0, z: 0 },
            },
        ];

        // Schmiede-Portal: zwei Stein-Esse-Pfeiler unter eisernem Traversen-Balken + Amboss.
        // Reines stein+eisen (affinitäts-sicher, Rolle manuell portal); Render-Gestalt via studioGestalt.
        const weltSchmiedeParts = [
            {
                shape: "box",
                material: "stein",
                position: { x: -1.6, y: 1.5, z: 0 },
                size: { x: 0.7, y: 3.0, z: 0.7 },
            },
            {
                shape: "box",
                material: "stein",
                position: { x: 1.6, y: 1.5, z: 0 },
                size: { x: 0.7, y: 3.0, z: 0.7 },
            },
            {
                shape: "box",
                material: "eisen",
                position: { x: 0, y: 3.25, z: 0 },
                size: { x: 4.0, y: 0.5, z: 0.6 },
            },
            {
                shape: "box",
                material: "stein",
                position: { x: 0.9, y: 0.2, z: 1.1 },
                size: { x: 0.8, y: 0.4, z: 0.55 },
            },
            {
                shape: "box",
                material: "eisen",
                position: { x: 0.9, y: 0.62, z: 1.1 },
                size: { x: 0.7, y: 0.45, z: 0.4 },
            },
        ];

        // Fachwerk-Portal: zwei Holz-Ständer unter vorkragendem Rähm, steinerne Schwelle. Reines holz+stein
        // (affinitäts-sicher, Rolle manuell portal); Render-Gestalt via studioGestalt (porta "ruine").
        const weltFachwerkParts = [
            {
                shape: "box",
                material: "stein",
                position: { x: 0, y: 0.2, z: 0 },
                size: { x: 4.2, y: 0.4, z: 0.9 },
            },
            {
                shape: "box",
                material: "holz",
                position: { x: -1.55, y: 1.75, z: 0 },
                size: { x: 0.45, y: 2.7, z: 0.45 },
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 1.55, y: 1.75, z: 0 },
                size: { x: 0.45, y: 2.7, z: 0.45 },
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 0, y: 3.35, z: 0 },
                size: { x: 4.4, y: 0.5, z: 0.7 },
            },
            {
                shape: "box",
                material: "holz",
                position: { x: -0.9, y: 2.5, z: 0.05 },
                size: { x: 0.3, y: 1.4, z: 0.3 },
                rotation: { x: 0, y: 0, z: Math.PI / 5 },
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 0.9, y: 2.5, z: 0.05 },
                size: { x: 0.3, y: 1.4, z: 0.3 },
                rotation: { x: 0, y: 0, z: -Math.PI / 5 },
            },
        ];

        // Klang-Portal (Lyra): Stein-Sockel, zwei Holz-Arme, Joch, drei Quarz-Saiten. Substanz-Wahrheit wie
        // alle welt_*-Parts (Tags · Blocker · E-Trigger); KEIN studioGestalt — die sieben porta-Tor-Ordnungen
        // sind vergeben (jede Gestalt bleibt unverwechselbar), die Part-Gestalt trägt.
        const weltKlangParts = [
            {
                shape: "box",
                material: "stein",
                position: { x: 0, y: 0.2, z: 0 },
                size: { x: 3.6, y: 0.4, z: 0.9 },
            },
            {
                shape: "box",
                material: "holz",
                position: { x: -1.3, y: 1.9, z: 0 },
                size: { x: 0.35, y: 3.0, z: 0.35 },
                rotation: { x: 0, y: 0, z: 0.14 },
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 1.3, y: 1.9, z: 0 },
                size: { x: 0.35, y: 3.0, z: 0.35 },
                rotation: { x: 0, y: 0, z: -0.14 },
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 0, y: 3.5, z: 0 },
                size: { x: 3.4, y: 0.4, z: 0.5 },
            },
            {
                shape: "cylinder",
                material: "quarz",
                position: { x: -0.7, y: 1.9, z: 0 },
                size: { x: 0.07, y: 2.9, z: 0.07 },
            },
            {
                shape: "cylinder",
                material: "quarz",
                position: { x: 0, y: 1.9, z: 0 },
                size: { x: 0.07, y: 2.9, z: 0.07 },
            },
            {
                shape: "cylinder",
                material: "quarz",
                position: { x: 0.7, y: 1.9, z: 0 },
                size: { x: 0.07, y: 2.9, z: 0.07 },
            },
        ];

        // Körperstudio-Portal (Nachlese-Welle) — DER VITRUV-RAHMEN: Stein-Sockel,
        // zwei Holz-Pfosten, Quarz-Kreis (der vitruvianische Mensch als Tor-Motiv).
        const weltKoerperParts = [
            {
                shape: "box",
                material: "stein",
                position: { x: 0, y: 0.2, z: 0 },
                size: { x: 3.8, y: 0.4, z: 0.9 },
            },
            {
                shape: "box",
                material: "holz",
                position: { x: -1.5, y: 1.7, z: 0 },
                size: { x: 0.4, y: 2.6, z: 0.4 },
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 1.5, y: 1.7, z: 0 },
                size: { x: 0.4, y: 2.6, z: 0.4 },
            },
            {
                shape: "torus",
                material: "quarz",
                position: { x: 0, y: 2.1, z: 0 },
                size: { x: 2.6, y: 2.6, z: 2.6 },
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 0, y: 3.2, z: 0 },
                size: { x: 3.6, y: 0.4, z: 0.5 },
            },
        ];

        // Tetrapoda-Portal (Nachlese-Welle) — DAS TIER-TOR: vier Holz-Beine unter
        // einem Rückgrat-Balken + Kopf-Kugel (die Vierbeiner-Silhouette als Tor).
        const weltTetrapodaParts = [
            {
                shape: "box",
                material: "stein",
                position: { x: 0, y: 0.2, z: 0 },
                size: { x: 4.0, y: 0.4, z: 1.6 },
            },
            {
                shape: "cylinder",
                material: "holz",
                position: { x: -1.5, y: 1.5, z: -0.5 },
                size: { x: 0.3, y: 2.2, z: 0.3 },
            },
            {
                shape: "cylinder",
                material: "holz",
                position: { x: 1.5, y: 1.5, z: -0.5 },
                size: { x: 0.3, y: 2.2, z: 0.3 },
            },
            {
                shape: "cylinder",
                material: "holz",
                position: { x: -1.5, y: 1.5, z: 0.5 },
                size: { x: 0.3, y: 2.2, z: 0.3 },
            },
            {
                shape: "cylinder",
                material: "holz",
                position: { x: 1.5, y: 1.5, z: 0.5 },
                size: { x: 0.3, y: 2.2, z: 0.3 },
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 0, y: 2.8, z: 0 },
                size: { x: 4.2, y: 0.5, z: 1.2 },
            },
            {
                shape: "sphere",
                material: "holz",
                position: { x: 2.3, y: 3.1, z: 0 },
                size: { x: 0.7, y: 0.7, z: 0.7 },
            },
        ];

        // BIBLIOTHEK: ein craftbarer Beispiel-Bauplan je Mach-Akt (forgeBlueprint/forgeArmor/brewConsumable/
        // forgeAvatar). Built-ins überspringen `_refreshBlueprintRoleEmergent` → `role` MUSS hier deklariert
        // sein (Override nur bei Intent-Zwillingen wie Rüstung vs. Bauwerk); Geräte bleiben rollenlos, ihre
        // Fähigkeit emergiert aus der Form. KEIN `instanced` — keine `_vegetationSampleSpawn`-Kandidaten.

        // Keine geraet_spitzhacke/geraet_schwert-Baupläne: die klinge_-Gattungen des Schmiede-Labs sind die
        // Werkzeuge/Klingen; ihre Judge-Substanz lebt in AnazhRealm.KIND_SUBSTANCE.

        // RÜSTUNG + TRANK sind dedizierte Genome (`_armorVariant` / `_potionVariant`); role:"armor"
        // deklariert, weil Rüstung vs. Bauwerk Substanz-Zwillinge sind (Unterscheidung = Intent). Wagen =
        // Substanz-Daten (KIND_SUBSTANCE.fahrzeug_wagen); das Holzross gießt _holzrossParts aus
        // _creatureSkeleton (REITTIER_SKELETON_G).

        // BUILT-IN-KÖRPER als role:soul-Blueprints in der Bibliothek (gelistet über den role-Filter).
        // EINE Quelle: playerSoulDefs — hier nur tief geklont, weil Bauplan-Klone editierbar sein müssen.
        const builtinBodyBlueprints = {};
        try {
            const souls = this.playerSoulDefs || {};
            for (const key of Object.keys(souls)) {
                const def = souls[key];
                if (!def || !Array.isArray(def.bodyParts) || !def.bodyParts.length) continue;
                const name = `koerper_${key}`;
                builtinBodyBlueprints[name] = {
                    name,
                    label: `${def.label || key} (Körper)`,
                    builtIn: true,
                    role: "soul",
                    roleManual: true,
                    parts: JSON.parse(JSON.stringify(def.bodyParts)),
                };
            }
        } catch (_e) {
            /* defensiv — ohne Körper-Saat bleibt der Katalog heil */
        }
        // Die Studio-Gattungen (TETRAPODA_SOUL_MAP — Hirsch · Wolf · Fuchs · Bär) als tragbare Körper-Baupläne
        // über den GENERISCHEN embody-Pfad (liest nur role + parts, kein koerper_-Sonderleser). Die frozen
        // bodyParts sind die Substanz-Wahrheit; die Gattungs-Dials formen die Welt-Instanz.
        try {
            const CS = AnazhRealm.CREATURE_SOULS;
            for (const key of Object.keys(CS)) {
                const cs = CS[key];
                if (!cs || !AnazhRealm.TETRAPODA_SOUL_MAP[key] || !Array.isArray(cs.bodyParts) || !cs.bodyParts.length)
                    continue;
                const name = `koerper_${key}`;
                if (builtinBodyBlueprints[name]) continue;
                builtinBodyBlueprints[name] = {
                    name,
                    label: `${cs.label || key} (Körper)`,
                    builtIn: true,
                    role: "soul",
                    roleManual: true,
                    parts: JSON.parse(JSON.stringify(cs.bodyParts)),
                };
            }
        } catch (_e) {
            /* defensiv — ohne Tier-Körper-Saat bleibt der Katalog heil */
        }

        // W12 Phase 2 — portalMeta aus der Welt-Registry (eine Quelle der
        // Wahrheit; je Bauplan eine eigene dsl-Kopie).
        const portalTo = (id) => {
            const w = AnazhRealm.WORLD_REGISTRY[id];
            const meta = { world: w.world, label: w.label, dsl: w.dsl.slice() };
            if (w.trust) meta.trust = w.trust;
            return meta;
        };

        // FELS-GENOM: Pool gewürfelter Fels-Formationen (Brocken/Stapel/Nadel/Geröll), die der Scatter NACH
        // dem stein_block-Affinitäts-Sieg seed-deterministisch wählt (`_rockVariant`). Tag-frozen
        // (noiserock+stein = stein_block-Tags, kein Affinitäts-Shift); persistiert trivial als Built-in.
        const felsWorldSeed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        const landmarkVariants = {};
        for (let i = 0; i < AnazhRealm.ROCK_VARIANTS; i++) {
            const key = `fels_var${i}`;
            const parts = this._rockVariant(`${felsWorldSeed}-fels-${i}`);
            landmarkVariants[key] = {
                name: key,
                label: "Felsformation",
                builtIn: true,
                instanced: true,
                // ABSCHIED DER ALT-DOPPEL — Studio-Pendant sediment/findling/zacken/geroell
                // (via _formClass, diag-v1-resolve): Scatter nutzt sie weiter, kein Katalog-Auftritt.
                donorOnly: true,
                _altDoppel: "rock (_formClass)",
                parts,
                _formClass: this._lastLandmarkForm, // T-FULLSTACK: der Scatter wählt die Form nach dem Feld
            };
        }
        // wahrerwuchs §4.3 S4 — DAS KRISTALL-GENOM (Habitus/Größe/Facetten, quarz, tag-frozen
        // zu kristall_geode). Dieselbe Pool-Mechanik wie der Fels. (Das Glut-Genom fiel 05.10.: die Feuerstelle trägt
        // ihre Gestalten im Gesetzbuch, `glutbrunnen` streut ohne Pool.)
        for (let i = 0; i < AnazhRealm.CRYSTAL_VARIANTS; i++) {
            const key = `kristall_var${i}`;
            const parts = this._crystalVariant(`${felsWorldSeed}-kristall-${i}`);
            landmarkVariants[key] = {
                name: key,
                label: "Kristall-Formation",
                builtIn: true,
                instanced: true,
                // ABSCHIED DER ALT-DOPPEL — Studio-Pendant: das EINE kristalle-Rezept.
                donorOnly: true,
                _altDoppel: "kristalle",
                parts,
                _formClass: this._lastLandmarkForm,
            };
        }

        // DIE SECHS BAUM-ARTEN als Built-in-Identität (EINE Baum-Quelle): ~6 Subsysteme keyen auf den NAMEN
        // (Crafting-Kosten · Archetyp-Bank · Instancing · HISM-Tint · Tag-Wand · Worldgen · spawn_tree).
        // Form aus dem GESETZ (`_growTreeBlueprintRich` → treeParams der Art); nur holz+laub → tag-neutral über alle Arten.
        // Skeleton + _isMerged tragen den Skeleton-Mesh-Renderpfad (2 Leaves: Rinde + Foliage).
        const treeSpeciesBlueprints = {};
        const TREE_SPECIES = [
            ["baum_eiche", "Eiche"],
            ["baum_kiefer", "Kiefer"],
            ["baum_birke", "Birke"],
            ["baum_erle", "Erle"],
            ["baum_buche", "Buche"],
            ["baum_tanne", "Tanne"],
            ["baum_mammut", "Mammutbaum"], // die Mammut-Nische des Wald-Generators (04.10., vorher als baum_buche)
        ];
        for (const [species, label] of TREE_SPECIES) {
            if (!this._phytoArt(species)) continue;
            let parts = null;
            let skeleton = null;
            try {
                // Fester kanonischer Seed → die Art ist EINE deterministische Gestalt (Instanz-Varianz im Worldgen
                // über scale/yaw/tint). _growTreeBlueprintRich liest nur das Gesetzbuch (_phytoArt → treeParams) + den
                // lazy _growTreeNoise → konstruktor-sicher.
                parts = this._growTreeBlueprintRich(species, `builtin-${species}-v1`);
                skeleton =
                    this._lastTreeSkeleton && Array.isArray(this._lastTreeSkeleton.branches)
                        ? this._lastTreeSkeleton
                        : null;
                this._lastTreeSkeleton = null; // Side-Channel räumen (defensive)
            } catch {
                parts = null;
            }
            if (!Array.isArray(parts) || parts.length < 2) continue;
            treeSpeciesBlueprints[species] = {
                name: species,
                label,
                builtIn: true,
                instanced: true,
                // KEIN roleManual-Pflaster: das geschärfte Seelen-Gesetz (livingBody liest
                // lebendig NUR über beseelte Substanz, nicht holz+laub) lässt den Baum
                // emergent auf architecture fallen — die Rolle wächst aus der Wahrheit.
                _grownSpecies: species,
                _isMerged: true,
                _skeleton: skeleton,
                parts,
            };
        }

        const defaults = {
            ...landmarkVariants,
            ...treeSpeciesBlueprints,
            waterfall: { name: "waterfall", label: "Wasserfall", builtIn: true, parts: waterfallParts },
            // `instanced: true` = Render-Absicht für Massen-Spawns (Wald/Kristallfeld) → HISM statt einer Group
            // je Spawn; einzeln platzierte Strukturen tragen es NICHT (Group-Pfad, Interaktion via entry.mesh).
            // stamm_gefallen: Sub-Spawn nach dem Baum (_vegetationSampleSpawn), nicht im Affinitäts-Wettstreit
            // (verdrängte sonst Bäume); tag-neutral (holz+cylinder).
            stamm_gefallen: {
                name: "stamm_gefallen",
                label: "Gefallener Stamm",
                builtIn: true,
                instanced: true,
                parts: stammGefallenParts,
            },
            stein_block: {
                name: "stein_block",
                label: "Felsblock",
                builtIn: true,
                parts: steinBlockParts,
            },
            kiesel: { name: "kiesel", label: "Kiesel", builtIn: true, instanced: true, parts: kieselParts },
            felsbrocken: {
                name: "felsbrocken",
                label: "Felsbrocken",
                builtIn: true,
                instanced: true,
                parts: felsbrockenParts,
            },
            // V9.64 (Welle A.1) — Damm-Bauplan, Vision-Pfeiler Wasser↔Wille
            damm: { name: "damm", label: "Damm", builtIn: true, parts: dammParts },
            // Der Genesis-Ort ist eine LICHTUNG (Befund V-D1): seine Stein-Scheibe und der Ring der Tore um sie (der Genesis-
            // Platz, `GENESIS_PLATZ`, K52) sind ein Grundriss der EINEN Natur-Wand (`_grundrissVon` → `_naturSetzen`), über dem
            // keine Krone steht — der erste Blick jedes neuen Spielers.
            start_plattform: {
                name: "start_plattform",
                label: "Genesis-Plattform",
                builtIn: true,
                lichtung: true,
                parts: startPlattformParts,
            },
            kristall_geode: {
                name: "kristall_geode",
                label: "Kristall-Geode",
                builtIn: true,
                instanced: true,
                parts: kristallGeodeParts,
            },
            glutbrunnen: {
                name: "glutbrunnen",
                label: "Feuerstelle",
                builtIn: true,
                instanced: true,
                studioGestalt: "feuerstelle",
                parts: glutbrunnenParts,
            },
            // DORF-BRUNNEN: Welt-Körper der brunnen-Schicht aus fachwerk exportSettlement, gehoben über den EINEN
            // Chokepoint `_spawnSettlementErlebnis` → `spawnArchitecture`. Die GESTALT baut das Gesetzbuch (fachwerk
            // `brunnen`, Architektur-Welle 05.10.); die Parts sind ihre unsichtbare Substanz in ihren Maßen (Kranz außen
            // Ø 1,84 m × 0,73 m, Pfosten bei ±1,05 m, Haspel 1,5 m, Dach 2,4 m) — die Blocker-Wahrheit emergiert aus
            // ihr (stein/holz dicht → solide).
            brunnen_dorf: {
                name: "brunnen_dorf",
                label: "Ziehbrunnen",
                builtIn: true,
                instanced: true,
                studioGestalt: "brunnen",
                parts: [
                    {
                        shape: "cylinder",
                        material: "stein",
                        position: { x: 0, y: 0.33, z: 0 },
                        size: { x: 1.84, y: 0.66, z: 1.84 },
                        segments: 10,
                    },
                    {
                        shape: "cylinder",
                        material: "stein",
                        position: { x: 0, y: 0.695, z: 0 },
                        size: { x: 1.9, y: 0.07, z: 1.9 },
                        segments: 10,
                    },
                    // Wasser-Spiegel (quarz — der Brunnen lebt)
                    {
                        shape: "cylinder",
                        material: "quarz",
                        position: { x: 0, y: 0.5, z: 0 },
                        size: { x: 1.24, y: 0.04, z: 1.24 },
                        segments: 10,
                        opacity: 0.8,
                    },
                    // Zwei Pfosten + Haspel + Satteldach
                    {
                        shape: "box",
                        material: "holz",
                        position: { x: -1.05, y: 1.27, z: 0 },
                        size: { x: 0.14, y: 2.55, z: 0.14 },
                    },
                    {
                        shape: "box",
                        material: "holz",
                        position: { x: 1.05, y: 1.27, z: 0 },
                        size: { x: 0.14, y: 2.55, z: 0.14 },
                    },
                    {
                        shape: "cylinder",
                        material: "holz",
                        position: { x: 0, y: 1.5, z: 0 },
                        rotation: { x: 0, y: 0, z: 1.5708 },
                        size: { x: 0.12, y: 2.3, z: 0.12 },
                        segments: 8,
                    },
                    {
                        shape: "box",
                        material: "holz",
                        position: { x: 0, y: 2.42, z: 0 },
                        size: { x: 2.6, y: 0.1, z: 1.7 },
                    },
                ],
            },
            // SCHICHT-VOLLENDUNG (18.07.) — der Marktstand der staende-Schicht (exportSettlement), gehoben am Platz-Rand
            // über den EINEN spawnArchitecture-Chokepoint, die Front zur Platz-Mitte. Die GESTALT baut das Gesetzbuch
            // (fachwerk `marktstand`, Architektur-Welle 05.10.); die Parts sind die Substanz in ihren Maßen (Tisch 2,0 ×
            // 0,9 m auf 0,86 m, Pfosten vorn 2,25 m · hinten 1,95 m, Plane mit Gefälle nach hinten).
            marktstand_dorf: {
                name: "marktstand_dorf",
                label: "Marktstand",
                builtIn: true,
                instanced: true,
                studioGestalt: "marktstand",
                parts: [
                    {
                        shape: "box",
                        material: "holz",
                        position: { x: 0, y: 0.84, z: 0 },
                        size: { x: 2.1, y: 0.04, z: 0.96 },
                    },
                    {
                        shape: "box",
                        material: "holz",
                        position: { x: -0.95, y: 1.125, z: -0.42 },
                        size: { x: 0.09, y: 2.25, z: 0.09 },
                    },
                    {
                        shape: "box",
                        material: "holz",
                        position: { x: 0.95, y: 1.125, z: -0.42 },
                        size: { x: 0.09, y: 2.25, z: 0.09 },
                    },
                    {
                        shape: "box",
                        material: "holz",
                        position: { x: -0.95, y: 0.975, z: 0.42 },
                        size: { x: 0.09, y: 1.95, z: 0.09 },
                    },
                    {
                        shape: "box",
                        material: "holz",
                        position: { x: 0.95, y: 0.975, z: 0.42 },
                        size: { x: 0.09, y: 1.95, z: 0.09 },
                    },
                    {
                        shape: "box",
                        material: "holz",
                        position: { x: 0, y: 2.16, z: -0.03 },
                        rotation: { x: 0.27, y: 0, z: 0 },
                        size: { x: 2.4, y: 0.04, z: 1.2 },
                    },
                ],
            },
            // DIE LATERNE (K10 × K11) — der Welt-Körper der laternen-Schicht aus fachwerk exportSettlement, gehoben über den
            // EINEN Chokepoint `_spawnSettlementErlebnis` → `spawnArchitecture`. Die GESTALT baut das Gesetzbuch (fachwerk
            // AUSSTATTUNG `laterne`: Eisenmast, Glas-Kopf, Haube), ihr Licht ist das Datum ihres Rezepts (fx.licht =
            // LICHT_GESETZ.laterne, `_lichtDatumDerGestalt`) — der Leib und das Licht EINER Quelle. Die Parts sind ihre
            // unsichtbare Substanz in ihren Maßen (Fuß Ø 0,24 m bis 0,55 m, Mast bis 3,4 m): eisen dicht → solide.
            laterne_dorf: {
                name: "laterne_dorf",
                label: "Laterne",
                builtIn: true,
                instanced: true,
                studioGestalt: "laterne",
                parts: [
                    {
                        shape: "cylinder",
                        material: "eisen",
                        position: { x: 0, y: 0.275, z: 0 },
                        size: { x: 0.24, y: 0.55, z: 0.24 },
                        segments: 8,
                    },
                    {
                        shape: "cylinder",
                        material: "eisen",
                        position: { x: 0, y: 1.975, z: 0 },
                        size: { x: 0.09, y: 2.85, z: 0.09 },
                        segments: 8,
                    },
                ],
            },
            // DIE WANDLATERNE (K66-2) — derselbe Kopf am Arm vor der Hauswand (fachwerk AUSSTATTUNG `wandlaterne`, ihr Licht
            // LICHT_GESETZ.wandlaterne): die Leuchte der dichten Gasse und der Tür von Gasthaus und Schmiede, gehoben über
            // denselben Chokepoint `_spawnSettlementErlebnis`. Der Ursprung liegt im Boden unter dem Licht, +x zeigt zur Wand
            // (armM 0,4 m); die Parts sind ihre Substanz über dem Kopf des Spielers: Kopf, Arm, Wandplatte.
            wandlaterne_dorf: {
                name: "wandlaterne_dorf",
                label: "Wandlaterne",
                builtIn: true,
                instanced: true,
                studioGestalt: "wandlaterne",
                parts: [
                    {
                        shape: "box",
                        material: "eisen",
                        position: { x: 0, y: 2.8, z: 0 },
                        size: { x: 0.22, y: 0.34, z: 0.22 },
                    },
                    {
                        shape: "box",
                        material: "eisen",
                        position: { x: 0.2, y: 3.2, z: 0 },
                        size: { x: 0.4, y: 0.035, z: 0.035 },
                    },
                    {
                        shape: "box",
                        material: "eisen",
                        position: { x: 0.385, y: 3.09, z: 0 },
                        size: { x: 0.03, y: 0.34, z: 0.14 },
                    },
                ],
            },
            // W6.G P3 Phase 1 — Felsformationen (emergente Welt-Bürger)
            felsbogen: { name: "felsbogen", label: "Felsbogen", builtIn: true, instanced: true, parts: felsbogenParts },
            felsturm: { name: "felsturm", label: "Felsturm", builtIn: true, instanced: true, parts: felsturmParts },
            // Welt-Werkstätten: die bediente Domäne (forging/alchemy/textile/soulwork/mechanism) EMERGIERT aus der
            // Substanz (_computeWorkshopDomain), nicht aus einem Feld; `role` bleibt als Built-in-Saat deklariert.
            esse: {
                name: "esse",
                label: "Esse",
                builtIn: true,
                role: "workshop-station",
                roleManual: true,
                parts: this._stationVariant(esseParts, felsWorldSeed + "-esse"),
            },
            // V17.77 — die craftbare MEISTER-Esse (Eisen): eine bessere Werkstatt → höherer Präzisions-Cap.
            // Die „bessere Esse", die der Schöpfer suchte; sie lehrt das Prinzip (besseres Material → feiner).
            esse_meister: {
                name: "esse_meister",
                label: "Meister-Esse (Eisen)",
                builtIn: true,
                role: "workshop-station",
                roleManual: true,
                parts: this._stationVariant(esseMeisterParts, felsWorldSeed + "-essemeister"),
            },
            brennkolben: {
                name: "brennkolben",
                label: "Brennkolben",
                builtIn: true,
                role: "workshop-station",
                roleManual: true,
                parts: this._stationVariant(brennkolbenParts, felsWorldSeed + "-brennkolben"),
            },
            webstuhl: {
                name: "webstuhl",
                label: "Webstuhl",
                builtIn: true,
                role: "workshop-station",
                roleManual: true,
                parts: this._stationVariant(webstuhlParts, felsWorldSeed + "-webstuhl"),
            },
            seelenstein_altar: {
                name: "seelenstein_altar",
                label: "Seelenstein-Altar",
                builtIn: true,
                role: "workshop-station",
                roleManual: true,
                parts: this._stationVariant(seelenstein_altarParts, felsWorldSeed + "-altar"),
            },
            drehbank: {
                name: "drehbank",
                label: "Drehbank",
                builtIn: true,
                role: "workshop-station",
                roleManual: true,
                parts: this._stationVariant(drehbankParts, felsWorldSeed + "-drehbank"),
            },
            // Welt-Portal: Rolle "portal" (emergiert sonst aus einem magie-leitenden Ring, _isPortalShaped), hier
            // als Built-in deklariert; portalMeta nennt das Ziel (Skelett-Welt).
            welt_portal: {
                name: "welt_portal",
                label: "Welt-Portal",
                builtIn: true,
                role: "portal",
                roleManual: true,
                portalMeta: portalTo("skeleton"),
                // Die RENDER-Gestalt kommt vom porta-Kern (gelesen im EINEN Resolver `_foundryPresetForEntry`); die
                // Parts bleiben unsichtbare SUBSTANZ-Wahrheit (computeCompoundTags · blockerAABBs · Portal-Trigger) —
                // wie beim Baum. Skelett-Welt + arkane Membran → geisttor.
                studioGestalt: "geisttor",
                parts: this._stationVariant(weltPortalParts, felsWorldSeed + "-portal1"),
            },
            // Strom-Welt-Portal: Sub-Welt three-fluid-fx (fremde Engine, gebündelt in worlds/fluid/).
            // dsl = Manifest: Kern-Ops (weather/skybox_color) + welt-eigene Wörter (sturm/ruhe/set_turbulence).
            welt_strom: {
                name: "welt_strom",
                label: "Strom-Welt",
                builtIn: true,
                role: "portal",
                roleManual: true,
                portalMeta: portalTo("fluid"),
                // porta-Gestalt (s. welt_portal): Fluss/Turbulenz → drachentor (wBraid = Strömungslinien). Jede
                // Gestalt bleibt UNVERWECHSELBAR (porta-buildInstance ist seed-invariant: gleiches Preset = Tor).
                studioGestalt: "drachentor",
                parts: this._stationVariant(weltStromParts, felsWorldSeed + "-portal2"),
            },
            // Terrain-Portal → PHYTOGENESIS & LITHOS (Morphologie-Labor: Bäume/Blumen/Felsen aus Gesetzen).
            // Bauplan-NAME welt_terrain + Registry-id "terrain" bleiben load-bearing (Saves, Katalog, Tests:
            // stabile Identität, variable Gestalt). dsl-Manifest: Presets + wald/neu +
            // Wetter/Jahreszeit/Tageszeit.
            welt_terrain: {
                name: "welt_terrain",
                label: "Phytogenesis & Lithos",
                builtIn: true,
                role: "portal",
                roleManual: true,
                portalMeta: portalTo("terrain"),
                // W-A3 — porta-Gestalt (Baum-Muster, s. welt_portal): das Morphologie-Labor
                // (Phytogenesis & Lithos — gewachsene/mineralische Formen) -> verkalkt
                // (Mauerwerk × Geflecht, weather 0.4 = das organisch-mineralische Tor).
                studioGestalt: "verkalkt",
                parts: this._stationVariant(weltTerrainParts, felsWorldSeed + "-portal3"),
            },
            // Garage-Portal (08.07.2026) — führt ins Fahrzeug-Labor des
            // Schöpfers (garage.txt: Rahmen · Gelenke · Lehren · Probefahrt).
            // Dasselbe W12-Muster: Registry trägt Pfad + DSL-Manifest.
            welt_garage: {
                name: "welt_garage",
                label: "Anatomie · Fahrzeug",
                builtIn: true,
                role: "portal",
                roleManual: true,
                portalMeta: portalTo("garage"),
                // W-A3 — porta-Gestalt (Baum-Muster, s. welt_portal): das Fahrzeug-Labor
                // trug schon den eisernen Rad-Reif -> maschine (metal 0.95 · reflect 0.8 ·
                // energy 0.78 = das technische Tor, die eindeutigste Zuordnung der fuenf).
                studioGestalt: "maschine",
                parts: this._stationVariant(weltGarageParts, felsWorldSeed + "-portal4"),
            },
            // Portale-Portal (08.07.2026) — führt ins Tor-Labor des Schöpfers
            // (Portal.txt: sieben Ordnungen · Stich→Schub→Dicke · Türen E/R).
            welt_portale: {
                name: "welt_portale",
                label: "Porta — Ordnungen & fraktale Tiefe",
                builtIn: true,
                role: "portal",
                roleManual: true,
                portalMeta: portalTo("portale"),
                // W-A3 — porta-Gestalt (Baum-Muster, s. welt_portal): das Tor-Labor selbst
                // traegt die hoechste Ordnung der Tor-Baukunst -> kathedrale (orders 4 ·
                // wLace 0.8 · realm 0.7 — die Alt-Form war der schlichte Architrav).
                studioGestalt: "kathedrale",
                parts: this._stationVariant(weltPortaleParts, felsWorldSeed + "-portal5"),
            },
            // Schmiede-Portal → Klingen-Labor (worlds/schmiede/); schmiede-core.js ist die EINE Quelle.
            // Wie alle welt_*: die Registry trägt Pfad + DSL-Manifest.
            welt_schmiede: {
                name: "welt_schmiede",
                label: "Anatomie · Klinge",
                builtIn: true,
                role: "portal",
                roleManual: true,
                portalMeta: portalTo("schmiede"),
                // W-A3 — porta-Gestalt (Baum-Muster, s. welt_portal): die Schmiede ist
                // Stein-Handwerk × Glut -> maurentor (das steinerne Handwerks-Tor, war
                // frei; ruine bleibt frei — jede Gestalt bleibt UNVERWECHSELBAR).
                studioGestalt: "maurentor",
                parts: this._stationVariant(weltSchmiedeParts, felsWorldSeed + "-portal6"),
            },
            // Fachwerk-Portal → Haus-Labor (worlds/fachwerk/); fachwerk-core.js ist die EINE Quelle, auch für das
            // Dorf (exportSettlement). Die Registry trägt Pfad + DSL-Manifest.
            welt_fachwerk: {
                name: "welt_fachwerk",
                label: "Fachwerkhaus — parametrisch, begehbar",
                builtIn: true,
                role: "portal",
                roleManual: true,
                portalMeta: portalTo("fachwerk"),
                // porta-Gestalt: das Haus-Labor trägt die RUINE (letzte freie der sieben Tor-Ordnungen; geisttor/
                // drachentor/verkalkt/maschine/kathedrale/maurentor sind vergeben — jede bleibt unverwechselbar).
                studioGestalt: "ruine",
                parts: this._stationVariant(weltFachwerkParts, felsWorldSeed + "-portal7"),
            },
            // Klang-Portal → Musik-Labor (worlds/klang/); klang-core.js ist die EINE Musik-Daten-Quelle (der
            // Host-Lofi liest Tempo + Skala). KEIN studioGestalt (Tor-Ordnungen vergeben; die Lyra-Parts tragen).
            welt_klang: {
                name: "welt_klang",
                label: "Genesis — Generatives Musiksystem",
                builtIn: true,
                role: "portal",
                roleManual: true,
                portalMeta: portalTo("klang"),
                parts: this._stationVariant(weltKlangParts, felsWorldSeed + "-portal8"),
            },
            // Körperstudio-Portal → Menschen-Labor (worlds/koerperstudio/); koerper-core.js ist die EINE
            // Gestalt-/Motion-Quelle, der Host bleibt der OFEN. KEIN studioGestalt (s. welt_klang).
            welt_koerperstudio: {
                name: "welt_koerperstudio",
                label: "Da Vinci Studio — Lebendiger Mensch",
                builtIn: true,
                role: "portal",
                roleManual: true,
                portalMeta: portalTo("koerperstudio"),
                parts: this._stationVariant(weltKoerperParts, felsWorldSeed + "-portal9"),
            },
            // Tetrapoda-Portal → Kreaturen-Labor (worlds/tetrapoda/); tetrapoda-core.js ist die EINE
            // Gestalt-/Motion-Quelle. KEIN studioGestalt (s. welt_klang).
            welt_tetrapoda: {
                name: "welt_tetrapoda",
                label: "Tetrapoda — Evolution Lab",
                builtIn: true,
                role: "portal",
                roleManual: true,
                portalMeta: portalTo("tetrapoda"),
                parts: this._stationVariant(weltTetrapodaParts, felsWorldSeed + "-portal10"),
            },
            // BIBLIOTHEK: craftbare Beispiel-Baupläne der Mach-Akte. Rüstung + Trank sind die ehrliche Wand:
            // kein Lab exportiert Rüstungs-/Trank-Presets — nichts erfinden. Werkzeuge/Klingen = die
            // klinge_-Gattungen (Substanz in KIND_SUBSTANCE).
            ruestung_brustpanzer: {
                name: "ruestung_brustpanzer",
                label: "Brustpanzer",
                builtIn: true,
                role: "armor",
                roleManual: true,
                // T4 — das dedizierte RÜSTUNGS-Genom (Platten-Größe/Artikulation/Material),
                // nicht mehr scale+tint einer fixen Liste (§9 T4).
                parts: this._armorVariant(felsWorldSeed + "-armor"),
            },
            trank_lebenssaft: {
                name: "trank_lebenssaft",
                label: "Lebenssaft",
                builtIn: true,
                role: "consumable",
                roleManual: true,
                // T4 — das dedizierte TRANK-Genom (Phiole-Form + Glasur aus der Wirkung).
                parts: this._potionVariant(felsWorldSeed + "-trank"),
            },
            // REITTIER aus dem Skelett-GUSS: _creatureSkeleton (horse-Archetyp, REITTIER_SKELETON_G) + Quarz-Kern
            // (Antrieb); Rolle vehicle + rideable (sitz-connection auf dem Torso-Kern, Part 0). Heißt PFERD; der
            // Schlüssel `reittier_holzross` bleibt load-bearing (Saves · Hotbar · platzierte Einträge).
            reittier_holzross: {
                name: "reittier_holzross",
                label: "Pferd",
                builtIn: true,
                parts: this._holzrossParts(),
                connections: [{ type: "sitz", partA: 0, partB: -1 }],
            },
            // tor_/haus_-Substanz (Tags · Ω-PHYSIS · Tür-Lücke als per-Part-Kollision) lebt in
            // AnazhRealm.KIND_SUBSTANCE; der Auto-Register-Chokepoint klont von dort (tor_/haus_<preset>).
            // builtinBodyBlueprints: koerper_human/koerper_phoenix/koerper_dragon.
            ...builtinBodyBlueprints,
        };
        // ALT-DOPPEL (Tabelle AnazhRealm.ALT_DOPPEL): Alt-Blueprints mit Studio-Pendant bleiben funktional
        // (Worldgen · Saves · embody · spawnArchitecture · Hotbar), verschwinden aber über donorOnly aus jeder
        // Katalog-/Werkstatt-Sicht. Built-ins entstehen je Init hier → jeder Load ist gestempelt.
        for (const n in AnazhRealm.ALT_DOPPEL) {
            if (defaults[n]) {
                defaults[n].donorOnly = true;
                defaults[n]._altDoppel = AnazhRealm.ALT_DOPPEL[n]; // Provenienz: das Studio-Pendant
            }
        }
        return defaults;
    }

    // ### Materialien als Tag-Profile ###
    // 6 Built-ins von weich-organisch (leder, holz) über mineralisch (stein, eisen, bronze) bis kristallin
    // (quarz); mehr via DSL-Op `define_material`. Tag-Werte 0..1 = Potenzial; die Aktivierung je Form
    // macht FORM_TAG_ACTIVATION.
    _defaultMaterials() {
        const make = (name, label, color, tags) => ({
            name,
            label,
            builtIn: true,
            color,
            tags: { ...AnazhRealm.MATERIAL_TAG_DEFAULTS, ...tags },
        });
        const list = [
            make("stein", "Stein", 0x7a7a7a, {
                härte: 0.65,
                dichte: 0.85,
                zähigkeit: 0.3,
                wärmeleitung: 0.25,
                resoniert: 0.3,
            }),
            make("holz", "Holz", 0x5e3a1c, {
                härte: 0.2,
                dichte: 0.4,
                zähigkeit: 0.6,
                wärmeleitung: 0.15,
                magieleitung: 0.3,
                brennbar: 0.8,
                resoniert: 0.5,
                lebendig: 0.7,
            }),
            make("eisen", "Eisen", 0x484850, {
                härte: 0.75,
                dichte: 0.9,
                zähigkeit: 0.65,
                wärmeleitung: 0.7,
                stromleitung: 0.85,
                resoniert: 0.6,
            }),
            make("bronze", "Bronze", 0xa97b3c, {
                härte: 0.55,
                dichte: 0.88,
                zähigkeit: 0.7,
                wärmeleitung: 0.75,
                stromleitung: 0.7,
                magieleitung: 0.25,
                resoniert: 0.75,
            }),
            make("quarz", "Quarz", 0xcce6f5, {
                härte: 0.7,
                dichte: 0.65,
                zähigkeit: 0.15,
                magieleitung: 0.85,
                transparent: 0.95,
                resoniert: 0.9,
            }),
            make("leder", "Leder", 0xa07050, {
                härte: 0.15,
                dichte: 0.35,
                zähigkeit: 0.75,
                magieleitung: 0.2,
                brennbar: 0.7,
                lebendig: 0.3,
            }),
            // Körper-Materialien: lebendig=1 markiert sie körper-fähig; sonst dieselbe MATERIAL_TAG_KEYS-Sprache
            // (auch für Bauwerke nutzbar).
            make("knochen", "Knochen", 0xe8dfc4, {
                härte: 0.8,
                dichte: 0.6,
                zähigkeit: 0.5,
                resoniert: 0.4,
                lebendig: 1.0,
            }),
            make("fleisch", "Fleisch", 0xb55050, {
                härte: 0.15,
                dichte: 0.4,
                zähigkeit: 0.75,
                wärmeleitung: 0.45,
                brennbar: 0.35,
                lebendig: 1.0,
            }),
            make("federn", "Federn", 0xf2c870, {
                härte: 0.1,
                dichte: 0.1,
                zähigkeit: 0.3,
                wärmeleitung: 0.7,
                magieleitung: 0.55,
                brennbar: 0.7,
                resoniert: 0.5,
                lebendig: 1.0,
            }),
            make("schuppen", "Schuppen", 0x355c3a, {
                härte: 0.9,
                dichte: 0.85,
                zähigkeit: 0.8,
                wärmeleitung: 0.55,
                stromleitung: 0.3,
                magieleitung: 0.45,
                resoniert: 0.45,
                lebendig: 1.0,
            }),
            make("glut", "Glut", 0xff5a14, {
                härte: 0.1,
                dichte: 0.25,
                zähigkeit: 0.2,
                wärmeleitung: 0.95,
                magieleitung: 0.75,
                brennbar: 1.0,
                resoniert: 0.65,
                lebendig: 1.0,
            }),
            // laub: Kronen-Material — leicht (dichte 0.1), magieleitend, brennbar, lebendig; über die
            // baum_*-Baupläne der einzige Vegetations-Pfad.
            make("laub", "Laub", 0x2b5e2c, {
                härte: 0.05,
                dichte: 0.1,
                zähigkeit: 0.4,
                wärmeleitung: 0.2,
                magieleitung: 0.35,
                brennbar: 0.85,
                resoniert: 0.45,
                lebendig: 1.0,
            }),
            // erde: Material lebendig-getriebener Regionen (der Terrain-Shader blendet `earthCol` über
            // `lebendig` ein). Weich, lebendig, mäßig dicht.
            make("erde", "Erde", 0x6e5038, {
                härte: 0.2,
                dichte: 0.55,
                zähigkeit: 0.4,
                wärmeleitung: 0.1,
                lebendig: 0.55,
            }),
            // ALCHEMIE-MATERIALIEN: `kraut` (pflanzlich, die Ernte der Nah-Streu — Farn · Schilf · Gestrüpp · Blume;
            // tag-nah an laub → die Trank-Rolle bleibt consumable), `essenz` (stark magieleitend; ihre Ernte — Sporen und
            // Pollen der Klein-Streu — fiel mit dem Waldboden 04.10., die Welt trägt keine Quelle mehr). Trank-Baupläne
            // tragen sie als Part-Material → `brewConsumable` zieht gesammelte Zutaten: pflücken → brauen → trinken.
            make("kraut", "Kraut", 0x4e9a3c, {
                härte: 0.05,
                dichte: 0.08,
                zähigkeit: 0.3,
                wärmeleitung: 0.1,
                magieleitung: 0.3,
                brennbar: 0.7,
                resoniert: 0.35,
                lebendig: 1.0,
            }),
            make("essenz", "Essenz", 0x9fd8ff, {
                härte: 0.02,
                dichte: 0.05,
                zähigkeit: 0.1,
                magieleitung: 0.95,
                transparent: 0.8,
                resoniert: 0.8,
                lebendig: 0.6,
            }),
        ];
        const out = {};
        for (const m of list) out[m.name] = m;
        return out;
    }

    // Mutations-Pfad für eigene Materialien. Whitelist auf MATERIAL_TAG_KEYS,
    // Werte ge-clamp 0..1, Built-in-Überschreiben verboten, Cap 32 eigene.
    // Aufrufer: DSL-Op `define_material` und ggf. spätere UI.
    defineMaterial(name, color, tags) {
        if (typeof name !== "string" || name.length === 0 || name.length > 40) {
            return { ok: false, reason: "invalid_name" };
        }
        const safe = name.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
        if (!safe) return { ok: false, reason: "invalid_name_after_sanitize" };
        const existing = this.state.materials && this.state.materials[safe];
        if (existing && existing.builtIn) return { ok: false, reason: "cannot_overwrite_builtin" };
        const customCount = Object.values(this.state.materials || {}).filter((m) => !m.builtIn).length;
        if (!existing && customCount >= 32) return { ok: false, reason: "too_many_custom_materials" };
        if (!tags || typeof tags !== "object") return { ok: false, reason: "tags_not_object" };
        const cleanTags = { ...AnazhRealm.MATERIAL_TAG_DEFAULTS };
        for (const key of AnazhRealm.MATERIAL_TAG_KEYS) {
            const v = Number(tags[key]);
            if (Number.isFinite(v)) cleanTags[key] = Math.max(0, Math.min(1, v));
        }
        const cleanColor = Number.isFinite(color) ? (color | 0) & 0xffffff : 0x888888;
        this.state.materials[safe] = {
            name: safe,
            label: safe,
            builtIn: false,
            color: cleanColor,
            tags: cleanTags,
        };
        if (typeof this._renderWorkshopDOM === "function") this._renderWorkshopDOM();
        return { ok: true, name: safe };
    }

    // ### Werkzeuge + opChain + Präzision ###
    // Werkzeuge sind Datensätze: das Werkzeug bringt den Cap mit, keine hardcoded Op-Tabelle.
    _defaultTools() {
        // Generisch (domain=null) ist nur `hände` → Default-Rolle "architecture", wenn keine domain-Werkzeuge
        // in der opChain stecken. Domain-Werkzeuge bestimmen via _refreshBlueprintRoleEmergent die Rolle.
        const list = [
            {
                name: "hände",
                label: "Hände",
                opClass: "subtractive",
                opName: "hand_knap",
                precisionCap: 0.4,
                domain: null,
                isStarter: true,
                builtIn: true,
            },
            // `hände` = domain-NEUTRALE Faust-Baseline (Cap 0.4); Präzision steigt nur über die WERKSTATT (bessere
            // Esse → höherer Cap) und domain-Werkzeuge an domain-Werkstätten.
            // ### Domain-Werkzeuge ###
            // Eines je Nicht-Default-Domain; opClass (physikalische Bearbeitung) und domain (Werkstatt) sind
            // orthogonal — dieselbe opClass in mehreren Domains, eine domain mit mehreren opClasses.
            {
                name: "schmiede-hammer",
                label: "Schmiede-Hammer",
                opClass: "plastic",
                opName: "forge_shape",
                precisionCap: 0.75,
                domain: "forging",
                // Kein Starter: die Domain-Werkzeuge sind die OP-BIBLIOTHEK (opClass/opName), aus der die platzierte
                // Werkstatt ihren Prozess zieht (`applyWorkshopProcessToPart`).
                isStarter: false,
                builtIn: true,
            },
            {
                name: "mörser",
                label: "Mörser & Stößel",
                opClass: "additive",
                opName: "brew",
                precisionCap: 0.7,
                domain: "alchemy",
                isStarter: false,
                builtIn: true,
            },
            {
                name: "webstuhl-schiffchen",
                label: "Webstuhl-Schiffchen",
                opClass: "additive",
                opName: "weave",
                precisionCap: 0.7,
                domain: "textile",
                isStarter: false,
                builtIn: true,
            },
            {
                name: "ritueller-stab",
                label: "Ritueller Stab",
                opClass: "phaseChange",
                opName: "imbue",
                precisionCap: 0.85,
                domain: "soulwork",
                isStarter: false,
                builtIn: true,
            },
            {
                name: "drehbank-meißel",
                label: "Drehbank-Meißel",
                opClass: "subtractive",
                opName: "turn",
                precisionCap: 0.9,
                domain: "mechanism",
                isStarter: false,
                builtIn: true,
            },
        ];
        const out = {};
        for (const t of list) out[t.name] = t;
        return out;
    }

    // Default-opChain für neue Parts. Hand_knap mit cap 0.4 — alles ist am
    // Anfang grob. Spieler hebt das Dach durch weitere Ops (feile, polier).
    _defaultPartOpChain() {
        return [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }];
    }

    // Finale Part-Präzision, Min-Regel-Hybrid: precision = min + (max − min) × decay^N,
    // N = chain.length − 1, decay = PRECISION_DECAY (0.7). Der erste Schlag prägt die Form, Sorgfalt holt
    // nur begrenzt auf; N=0 → precision = min. Verbindungs-Last + Compound-Tags bleiben strikt min/max.
    computePartPrecision(part) {
        if (!part || typeof part !== "object") return 0.4;
        if (!Array.isArray(part.opChain) || part.opChain.length === 0) return 0.4;
        let min = 1;
        let max = 0;
        let count = 0;
        for (const op of part.opChain) {
            const cap = Number(op && op.cap);
            if (!Number.isFinite(cap)) continue;
            if (cap < min) min = cap;
            if (cap > max) max = cap;
            count++;
        }
        if (count === 0) return 0.4;
        if (count === 1 || max <= min) return min;
        const decay = AnazhRealm.PRECISION_DECAY;
        const n = count - 1;
        return min + (max - min) * Math.pow(decay, n);
    }

    // Mittlere Präzision eines Compounds (für Welt-Effekt-Schwellen).
    _compoundAvgPrecision(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts) || blueprint.parts.length === 0) return 0;
        let sum = 0;
        for (const p of blueprint.parts) sum += this.computePartPrecision(p);
        return sum / blueprint.parts.length;
    }

    // Mittlere Präzision direkt aus einem Parts-Array (wie _compoundAvgPrecision, ohne Bauplan-Wrapper) —
    // für Soul-bodyParts in computePlayerStats. Trägt kein Part eine opChain, gilt das Compound als
    // „geboren" (1.0); über den Bauplan-Pfad geschmiedete Souls tragen echte min-Werte.
    _compoundAvgPrecisionFromParts(parts) {
        if (!Array.isArray(parts) || parts.length === 0) return 1.0;
        const anyHasChain = parts.some((p) => p && Array.isArray(p.opChain) && p.opChain.length > 0);
        if (!anyHasChain) return 1.0;
        let sum = 0;
        for (const p of parts) sum += this.computePartPrecision(p);
        return sum / parts.length;
    }

    // ROLLE-PASSUNG der FORM für eine GEDIENTE Rolle ∈ [min, max] (1.0 = neutral): Resonanz des
    // Produkt-Vektors (inkl. pointedFraction/dichte/härte) gegen die Rollen-Signatur, normiert über den
    // per-Rolle ref; unbekannte Rolle → 1.0. Der Aufrufer übergibt die GEDIENTE Rolle (Hand→held,
    // Slot→armor, Trinken→consumable), nicht die emergente (eine Klinge klassifiziert als architecture).
    // Wirkung = 0.5 + 0.5·Qualität·RoleFit (Qualität = mittlere Part-Präzision, geboren = 1.0).
    _blueprintRoleFit(bp, role) {
        const sig = AnazhRealm.ROLE_SIGNATURES[role];
        if (!sig || !bp) return 1.0;
        const cfg = AnazhRealm.QUALITY_ROLE_FIT;
        const ref = (cfg.refs && cfg.refs[role]) || 3.0;
        const raw = this._blueprintResonance(this._blueprintProductVector(bp), sig);
        const norm = Math.max(0, Math.min(1, raw / ref));
        return cfg.min + (cfg.max - cfg.min) * norm;
    }

    // U3 (resonanz-system.md §5) — das ROLLEN-SPEKTRUM: die normierte Resonanz (0–1) des Bauplans gegen ALLE
    // Rollen des Registers, sortiert. Der Spieler SIEHT, was sein Werk IST (Waffe 0.9 · Bauwerk 0.4 · …) über
    // die GANZE Resonanz — kein Rezept, ein Kompass. Die Freiheit: er baut einen Punkt, das Spektrum liest ihn.
    _blueprintRoleSpectrum(bp) {
        const v = this._blueprintProductVector(bp);
        const cfg = AnazhRealm.QUALITY_ROLE_FIT;
        const out = [];
        for (const role in AnazhRealm.ROLE_SIGNATURES) {
            const raw = this._blueprintResonance(v, AnazhRealm.ROLE_SIGNATURES[role]);
            const ref = (cfg.refs && cfg.refs[role]) || 3.0;
            out.push({ role, score: Math.max(0, Math.min(1, raw / ref)) });
        }
        out.sort((a, b) => b.score - a.score);
        return out;
    }

    // U3 — der KATALYSATOR-Hinweis: welche Achse drehen, um die Passung für eine Rolle am meisten zu heben —
    // die positive Signatur-Achse mit dem größten UNGENUTZTEN Potenzial (hohe Gewichtung, aktuell schwach).
    // „mehr Schärfe → bessere Klinge". So lernt + dreht der Spieler die Achsen Richtung perfekten Katalysator.
    _blueprintCatalystHint(bp, role) {
        const sig = AnazhRealm.ROLE_SIGNATURES[role];
        if (!sig) return null;
        const v = this._blueprintProductVector(bp);
        let bestAxis = null;
        let bestGap = 0;
        for (const axis in sig) {
            const w = sig[axis];
            if (w <= 0) continue; // nur positive Achsen (Gegen-Achsen sind kein Katalysator-Ziel)
            const axisMax = AnazhRealm.MATERIAL_TAG_KEYS.includes(axis) ? 3 : 1; // Material-Tags bis ~3, Form-Achsen [0,1]
            const gap = w * (1 - Math.min(1, (v[axis] || 0) / axisMax));
            if (gap > bestGap) {
                bestGap = gap;
                bestAxis = axis;
            }
        }
        return bestAxis ? { axis: bestAxis, label: AnazhRealm.AXIS_LABELS[bestAxis] || bestAxis } : null;
    }

    // WARUM-FÜHRUNG: die kleinste Achsen-Drehung zur WUNSCH-Rolle („+0.3 Standfläche → Fahrzeug").
    // deficit = Sieger-Score − Ziel-Score (_blueprintRoleSpectrum-Skala raw/ref); je positiver Ziel-Achse
    // eff = wT/refT − wS/refS, need = deficit/eff; gewählt wird die machbare Achse mit kleinster Drehung
    // (Produkt-Vektor [0..1], headroom-geprüft). KONJUNKTIONS-Achsen (0/1: rideable/livingBody/
    // portalShape/bodyShape) sind eine TAT → der Hinweis kommt aus AXIS_ACTION_HINTS.
    _blueprintRoleGapHint(bp, targetRole) {
        const sigs = AnazhRealm.ROLE_SIGNATURES;
        const sigT = sigs[targetRole];
        if (!sigT) return null;
        const cfg = AnazhRealm.QUALITY_ROLE_FIT;
        const refFor = (role) => (cfg.refs && cfg.refs[role]) || 3.0;
        const v = this._blueprintProductVector(bp);
        // Ψ1 — der Sieger über das EINE argmax-Organ (raw/ref-Skala via refs+refDefault).
        const win = this._resonateArgmax(v, sigs, { refs: cfg.refs, refDefault: 3.0 });
        const winner = win.key;
        const winScore = win.score;
        if (winner === targetRole) return { already: true, targetRole };
        const sigW = sigs[winner];
        const refT = refFor(targetRole);
        const refW = refFor(winner);
        const deficit = winScore - this._blueprintResonance(v, sigT) / refT;
        const actions = AnazhRealm.AXIS_ACTION_HINTS;
        let best = null;
        for (const axis in sigT) {
            const wT = sigT[axis];
            if (wT <= 0) continue;
            const cur = Math.max(0, Math.min(1, v[axis] || 0));
            const headroom = 1 - cur;
            if (headroom <= 0.02) continue;
            const eff = wT / refT - ((sigW && sigW[axis]) || 0) / refW;
            if (eff <= 0.01) continue;
            const need = deficit / eff;
            if (need > headroom + 1e-9) continue;
            if (!best || need < best.need) best = { axis, need };
        }
        if (!best) return { targetRole, winner, infeasible: true };
        const label = AnazhRealm.AXIS_LABELS[best.axis] || best.axis;
        const roleLabel = AnazhRealm.ROLE_LABELS[targetRole] || targetRole;
        const action = actions[best.axis];
        const text = action
            ? `${action} → ${roleLabel}`
            : `+${Math.max(0.05, best.need).toFixed(2)} ${label} → ${roleLabel}`;
        return { targetRole, winner, axis: best.axis, need: best.need, text };
    }

    // WARUM-CHIP: die top-3 Beiträge (v[achse] × gewicht) der gewonnenen Rolle, lesbar formatiert
    // („lebendig 1.0 · greifbar 0.6 · härte −0.5"). Kein zweites Register: liest Produkt-Vektor +
    // ROLE_/FORM_ROLE_SIGNATURES. GapHint zeigt WIE DAHIN, dieser Chip WARUM HIER.
    _blueprintRoleWhy(bp) {
        if (!bp) return null;
        const role = (typeof this._displayRole === "function" && this._displayRole(bp)) || bp.role;
        const sig =
            AnazhRealm.ROLE_SIGNATURES[role] ||
            (AnazhRealm.FORM_ROLE_SIGNATURES && AnazhRealm.FORM_ROLE_SIGNATURES[role]) ||
            null;
        if (!sig) return null;
        const v = this._blueprintProductVector(bp);
        const beitraege = [];
        for (const axis in sig) {
            const contrib = (v[axis] || 0) * sig[axis];
            // Beiträge unter 0.05 erklären nichts (Rauschen als Begründung). Jeder Beitrag trägt seinen
            // GELTUNGSBEREICH (physik = gerechnet · konvention = Welt-Physik · form = Stellvertreter).
            if (Math.abs(contrib) > 0.05)
                beitraege.push({
                    axis,
                    contrib,
                    cls: (AnazhRealm.AXIS_CLASS && AnazhRealm.AXIS_CLASS[axis]) || "form",
                });
        }
        if (!beitraege.length) return null;
        beitraege.sort((a, b) => Math.abs(b.contrib) - Math.abs(a.contrib));
        const top = beitraege.slice(0, 3);
        const clsTag = { physik: "gerechnet", konvention: "Welt-Konvention" };
        const text = top
            .map((p) => {
                const label = (AnazhRealm.AXIS_LABELS && AnazhRealm.AXIS_LABELS[p.axis]) || p.axis;
                const tag = clsTag[p.cls] ? ` (${clsTag[p.cls]})` : ""; // Form bleibt unmarkiert (Übergang)
                // 2 Dezimalen — die Skala ist der ÷3-normierte Vektor (klein, ehrlich).
                return `${label}${tag} ${p.contrib < 0 ? "−" : ""}${Math.abs(p.contrib).toFixed(2)}`;
            })
            .join(" · ");
        return { role, text, beitraege: top };
    }

    // KONJUNKTIONS-RUF: resoniert die Spektrum-Spitze stärker als die zugewiesene Rolle und hält sie nur
    // eine unerfüllte 0/1-TAT-Achse zurück (rideable/livingBody/portalShape…), spricht die Zeile die TAT
    // aus („Fahrzeug ruft: setze einen Sitz-Anker").
    _blueprintConjunctionCall(bp) {
        const spectrum = this._blueprintRoleSpectrum(bp);
        if (!spectrum || !spectrum.length) return null;
        const top = spectrum[0];
        const assigned = typeof this._displayRole === "function" ? this._displayRole(bp) : bp.role;
        if (!top || top.role === assigned || top.score <= 0.05) return null;
        const sigTop = AnazhRealm.ROLE_SIGNATURES[top.role];
        const actions = AnazhRealm.AXIS_ACTION_HINTS;
        if (!sigTop) return null;
        const v = this._blueprintProductVector(bp);
        for (const axis in sigTop) {
            if (sigTop[axis] > 0 && actions[axis] && (v[axis] || 0) === 0) {
                const roleLabel = AnazhRealm.ROLE_LABELS[top.role] || top.role;
                return { role: top.role, axis, text: `${roleLabel} ruft: ${actions[axis]}` };
            }
        }
        return null;
    }

    // DIE EINE GÜTE EINES WERKS ∈ [0, 1] (Welle L, Befund K-D7 — vorher drei Wahrheiten: der Lehren-Faktor des Kerns im
    // Schaden, forgedPrecision in der Werkstoff-Kraft, die Teile-Präzision im Equip-Fold): ein Schmiede-Gerät trägt das
    // Lehren-Urteil des Kerns über Gestalt und Prägung (_schmiedeGueteAnteil), ein geschmiedetes Eigenwerk den
    // eingefrorenen Werk-Stand (forgedPrecision), ein Plan die Präzision seiner Teile. Leser: der Schadens-Faktor
    // (_heldGueteFaktor), die Werkstoff-Kraft (_implementProfileForBlueprint), der Equip-Fold, Rüstung und Konsum.
    computeBlueprintQuality(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts)) return 1.0;
        const lehre = this._schmiedeGueteAnteil(blueprint);
        if (lehre !== null) return lehre;
        if (Number.isFinite(blueprint.forgedPrecision)) return blueprint.forgedPrecision;
        return this._compoundAvgPrecisionFromParts(blueprint.parts);
    }

    // KANONISCHER EQUIP-FOLD: wie ein ausgerüstetes Gerät/eine Rüstung seine Substanz in den Stat-Compound
    // des Trägers faltet — computePlayerStats UND computeCreatureStats LESEN diese eine Quelle. Slot-
    // Charakter als Parameter (`slotWeight` HELD/TOOL/ARMOR · `roleKey` held/armor); size-neutral. Mutiert
    // `finalTags`: w = slotWeight·(0.5 + 0.5·Qualität·RoleFit), Qualität = `computeBlueprintQuality`.
    _foldEquippedStatTags(finalTags, bp, slotWeight, roleKey) {
        if (!finalTags || !bp || !Array.isArray(bp.parts)) return;
        const tags = this.computeCompoundTags(bp) || {};
        const w = slotWeight * (0.5 + 0.5 * this.computeBlueprintQuality(bp) * this._blueprintRoleFit(bp, roleKey));
        for (const tag of AnazhRealm.MATERIAL_TAG_KEYS) {
            finalTags[tag] = (finalTags[tag] || 0) + (tags[tag] || 0) * w;
        }
    }

    // KANONISCHE STAT-PIPELINE (Boosts falten · Tags→Stats · Größen-Skalierung): computePlayerStats UND
    // computeCreatureStats lesen diese Quellen; Unterschiede (Boost-Quelle, Größe) sind Parameter.

    // (1) Boosts (Emotion · Welt-Resonanz · Konsum) addieren ihre Tag-Deltas. Die Quelle
    //     (player.boosts ODER creature.userData.boosts) reist als Parameter.
    _applyBoostsToStatTags(finalTags, boosts) {
        if (!finalTags || !Array.isArray(boosts) || boosts.length === 0) return;
        for (const b of boosts) {
            if (!b || !b.tagDelta) continue;
            for (const tag of Object.keys(b.tagDelta)) {
                if (!AnazhRealm.MATERIAL_TAG_KEYS.includes(tag)) continue;
                finalTags[tag] = (finalTags[tag] || 0) + b.tagDelta[tag];
            }
        }
    }

    // (2) Die STAT_FROM_TAGS-Formeln + der Invers-dichte-Floor (V17.90: attackSpeed/speed
    //     nie negativ/null — ein schweres Gerät ist TRÄGE, nicht kaputt). Die EINE Sprache,
    //     EINE Berechnung für Spieler ≡ Kreatur (§1.3).
    _statsFromTags(finalTags) {
        const stats = {};
        for (const stat of Object.keys(AnazhRealm.STAT_FROM_TAGS)) {
            stats[stat] = AnazhRealm.STAT_FROM_TAGS[stat](finalTags);
        }
        if (Number.isFinite(stats.attackSpeed)) stats.attackSpeed = Math.max(0.25, stats.attackSpeed);
        // Der Speed-Floor skaliert mit der LEBENDEN Gesetz-Base (Verhältnis 2/7; ~0.33 m/s
        // Schwerlast-Kriechen, nie 0) — ein fester Floor fröre jede Dial-Differenz ein.
        if (Number.isFinite(stats.speed)) {
            const floorBase = AnazhRealm._bewegungsKoeff("speed").base;
            stats.speed = Math.max((2 / 7) * floorBase, stats.speed);
        }
        return stats;
    }

    // (3) GRÖSSEN-SYMMETRIE: größer = robuster (HP/Stamina/Mana ∝ sizeHpMul), aber langsamer
    //     (speed/attackSpeed/jumpPower ∝ 1/sizeHpMul), gleiche Floors. sizeHpMul (= √Größen-Faktor)
    //     rechnet der Aufrufer (Spieler: soulSize · Kreatur: bodyParts × bodySize^0.5).
    _applySizeMultipliersToStats(stats, sizeHpMul) {
        if (!stats || !Number.isFinite(sizeHpMul) || sizeHpMul <= 0) return;
        const sizeSpeedMul = 1 / sizeHpMul;
        if (Number.isFinite(stats.hpMax)) stats.hpMax = stats.hpMax * sizeHpMul;
        if (Number.isFinite(stats.staminaMax)) stats.staminaMax = stats.staminaMax * sizeHpMul;
        if (Number.isFinite(stats.manaMax)) stats.manaMax = stats.manaMax * sizeHpMul;
        // REALITÄTS-EICHUNG 17.07. — derselbe gesetz-relative Floor wie in
        // _statsFromTags (2/7 der lebenden Base; der feste 2er klemmte unter
        // der Menschen-Base jede Größen-Differenz auf denselben Wert).
        if (Number.isFinite(stats.speed)) {
            const floorBase = AnazhRealm._bewegungsKoeff("speed").base;
            stats.speed = Math.max((2 / 7) * floorBase, stats.speed * sizeSpeedMul);
        }
        if (Number.isFinite(stats.attackSpeed)) stats.attackSpeed = Math.max(0.25, stats.attackSpeed * sizeSpeedMul);
        if (Number.isFinite(stats.jumpPower)) stats.jumpPower = stats.jumpPower * sizeSpeedMul;
    }

    // Werkzeug auf Part anwenden: validiert Tool-Besitz + Material × Op-Klassen-Kompatibilität. Ops werden
    // ANGEHÄNGT (opChain = Geschichte, nicht Auswahl); Built-in-Baupläne bleiben unberührbar.
    applyOpToPart(blueprintName, partIndex, toolName) {
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        if (!Array.isArray(bp.parts) || partIndex < 0 || partIndex >= bp.parts.length) {
            return { ok: false, reason: "invalid_part_index" };
        }
        const tool = this.state.tools && this.state.tools[toolName];
        if (!tool) return { ok: false, reason: "tool_unknown" };
        const owned = Array.isArray(this.state.player.tools) && this.state.player.tools.includes(toolName);
        if (!owned) return { ok: false, reason: "tool_not_owned" };
        const part = bp.parts[partIndex];
        const matName = part.material || "stein";
        const compat = AnazhRealm.MATERIAL_OP_COMPATIBILITY[matName];
        // Eigene Materialien sind dem Konzept-Mapping nicht bekannt — wir
        // erlauben dort alle vier Op-Klassen, statt sie zu blockieren. Wer
        // genauer kalibrieren will, definiert das Compat-Profil später.
        if (compat && !compat.includes(tool.opClass)) {
            return { ok: false, reason: "material_op_incompatible" };
        }
        // Stamina-Kosten nur im pfad-Modus: reicht Stamina nicht, wird abgelehnt (warten auf den
        // tickPlayerVitals-Regen) → „beliebig stapeln" ist ausgeschlossen. frieden + schöpfer: reibungsfrei.
        const mode = this.getGameMode ? this.getGameMode() : "frieden";
        // V18.210 (§1-A4) — die Kosten-WÄHLER: phaseChange = MAGIE → Mana,
        // alle anderen Op-Klassen = MÜHE → Stamina. EINE Quelle (`tool.opClass`),
        // keine Hardcode-Whitelist (Tool-Erweiterungen erben das Verhalten).
        const _isMagicOp = tool.opClass === "phaseChange";
        if (mode === "pfad") {
            // Aufwand skaliert mit der Werkzeug-Präzision (cap 0.4 → ×1.1, cap 0.97 → ×0.53); Floor 2, damit eine
            // Op nie gratis wird. Magie zahlt aus Mana (Floor 5), Mühe aus Stamina — gleiche Skalierung.
            const baseCost = _isMagicOp ? AnazhRealm.TOOL_OP_MANA_COST : AnazhRealm.TOOL_OP_STAMINA_COST;
            const floor = _isMagicOp ? 5 : 2;
            const cost = Math.max(floor, Math.round(baseCost * (1.5 - (tool.precisionCap || 0.5))));
            if (_isMagicOp) {
                const mana = (this.state.player && this.state.player.mana) || 0;
                if (!this._canPayMana(cost)) {
                    return { ok: false, reason: "not_enough_mana", manaNeeded: cost, manaHave: mana };
                }
                this._drainMana(cost);
            } else {
                const stamina = (this.state.player && this.state.player.stamina) || 0;
                if (stamina < cost) {
                    return { ok: false, reason: "not_enough_stamina", staminaNeeded: cost, staminaHave: stamina };
                }
                this.state.player.stamina = Math.max(0, stamina - cost);
            }
        }
        // V17.87 — der Edit-Verlauf: VOR der opChain-Mutation den Vor-Zustand schnappen (nach allen
        // Validierungen, damit ein abgelehnter Op-Versuch keinen leeren Undo-Schritt erzeugt).
        this._recordBlueprintEdit(blueprintName);
        if (!Array.isArray(part.opChain)) part.opChain = this._defaultPartOpChain();
        // WERKSTATT ALS PRÄZISIONS-QUELLE: Werkzeug mit Domäne + passende Welt-Werkstatt nah → Cap =
        // max(Werkzeug, Werkstatt-Präzision). Sonst (domain=null/keine Station) der Werkzeug-Cap.
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        const stationPrec =
            tool.domain && pm ? this._nearbyWorkshopStationPrecision(tool.domain, { x: pm.x, y: pm.y, z: pm.z }) : 0;
        const effectiveCap = Math.max(tool.precisionCap || 0, stationPrec);
        part.opChain.push({
            tool: toolName,
            op: tool.opName,
            cap: effectiveCap,
            at: performance.now() / 1000,
        });
        // Welle 9a — emergente Bauplan-Rolle aktualisieren. Wenn das Werkzeug
        // eine Domain trägt (Phase 9b), kann der Bauplan dadurch seine Rolle
        // wechseln (z. B. construction → forging → tool).
        this._refreshBlueprintRoleEmergent(blueprintName);
        // Return-Shape symmetrisch: phaseChange-Ops ziehen MANA → der HUD liest `manaRemaining` neben
        // `staminaRemaining`. _isMagicOp lebt im pfad-Zweig; in frieden/schöpfer bleiben beide Felder gleich.
        return {
            ok: true,
            precision: this.computePartPrecision(part),
            staminaRemaining: this.state.player.stamina,
            manaRemaining: this.state.player.mana,
        };
    }

    // Prozess einer Domäne = opClass + opName des kanonischen Domain-Werkzeugs (die Domain-Tools sind die
    // OP-BIBLIOTHEK der platzierten Werkstätten). EINE Quelle: state.tools.
    _domainProcess(domain) {
        if (!domain) return null;
        for (const t of Object.values(this.state.tools || {})) {
            if (t && t.domain === domain) return { opClass: t.opClass, opName: t.opName, toolName: t.name };
        }
        return null;
    }

    // Die platzierte Werkstatt-Station IST der Prozess: ihre Domäne (emergent aus der Substanz) liefert
    // die Op, ihre Substanz-Präzision den Cap. Modus-Gate: pfad/frieden verlangen die Station platziert +
    // nah (`_isWorkshopStationPlacedNear`), schöpfer nur den Bauplan. Spiegelt applyOpToPart (Validierung
    // → Stamina → Edit-Verlauf → opChain), aber Op + Cap kommen aus der STATION.
    applyWorkshopProcessToPart(blueprintName, partIndex, stationName) {
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        if (!Array.isArray(bp.parts) || partIndex < 0 || partIndex >= bp.parts.length) {
            return { ok: false, reason: "invalid_part_index" };
        }
        const station = this.state.blueprints[stationName];
        if (!station || station.role !== "workshop-station") return { ok: false, reason: "not_a_workshop" };
        const domain = this._computeWorkshopDomain(station);
        const proc = this._domainProcess(domain);
        if (!proc) return { ok: false, reason: "no_process_for_domain" };
        const mode = this.getGameMode ? this.getGameMode() : "frieden";
        // Modus-Gate: außerhalb schöpfer muss die Station in der Welt platziert + nah sein (der „wahre Weg").
        if (mode !== "schöpfer" && !this._isWorkshopStationPlacedNear(stationName)) {
            return { ok: false, reason: "workshop_not_placed_near" };
        }
        const part = bp.parts[partIndex];
        const matName = part.material || "stein";
        const compat = AnazhRealm.MATERIAL_OP_COMPATIBILITY[matName];
        if (compat && !compat.includes(proc.opClass)) return { ok: false, reason: "material_op_incompatible" };
        // Stamina/Mana nur im pfad-Modus, skaliert wie bei applyOpToPart mit der Präzision; Magie/Mühe folgt
        // der opClass des Prozesses (phaseChange → Mana, plastic → Stamina) — dasselbe Gate wie applyOpToPart.
        const cap = this._workshopStationPrecision(station);
        const _isMagicOp = proc.opClass === "phaseChange";
        if (mode === "pfad") {
            const baseCost = _isMagicOp ? AnazhRealm.TOOL_OP_MANA_COST : AnazhRealm.TOOL_OP_STAMINA_COST;
            const floor = _isMagicOp ? 5 : 2;
            const cost = Math.max(floor, Math.round(baseCost * (1.5 - cap)));
            if (_isMagicOp) {
                const mana = (this.state.player && this.state.player.mana) || 0;
                if (!this._canPayMana(cost)) {
                    return { ok: false, reason: "not_enough_mana", manaNeeded: cost, manaHave: mana };
                }
                this._drainMana(cost);
            } else {
                const stamina = (this.state.player && this.state.player.stamina) || 0;
                if (stamina < cost) {
                    return { ok: false, reason: "not_enough_stamina", staminaNeeded: cost, staminaHave: stamina };
                }
                this.state.player.stamina = Math.max(0, stamina - cost);
            }
        }
        this._recordBlueprintEdit(blueprintName);
        if (!Array.isArray(part.opChain)) part.opChain = this._defaultPartOpChain();
        // opChain trägt den KANONISCHEN Domain-Werkzeug-Namen (proc.toolName), NICHT den Stations-Namen:
        // `computeBlueprintDomainCounts` löst die Domäne über `state.tools[op.tool].domain` auf. Der Cap kommt
        // aus der Station; `station` notiert nur die Quelle für die Anzeige.
        part.opChain.push({
            tool: proc.toolName,
            op: proc.opName,
            cap,
            station: stationName,
            at: performance.now() / 1000,
        });
        this._refreshBlueprintRoleEmergent(blueprintName);
        // V18.210 (Audit-Heilung #4) — return-Shape Symmetrie zur applyOpToPart:
        // beide Ressourcen-Wahrheiten reisen mit; der UI-Konsument sieht echt,
        // welche der zwei knappen Achsen verbraucht wurde.
        return {
            ok: true,
            precision: this.computePartPrecision(part),
            cap,
            domain,
            staminaRemaining: this.state.player ? this.state.player.stamina : 0,
            manaRemaining: this.state.player ? this.state.player.mana : 0,
        };
    }

    // V17.88 — ist eine Werkstatt-Station dieses Bauplan-NAMENS in der Welt platziert + nah am Spieler?
    // (Spiegel von `_nearbyWorkshopStationPrecision`, aber per Bauplan-Name statt Domäne.)
    _isWorkshopStationPlacedNear(stationName) {
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return false;
        const radius = AnazhRealm.WORKSHOP_PROXIMITY_M;
        const r2 = radius * radius;
        for (const entry of this.state.architectures || []) {
            if (!entry || entry.type !== stationName || !entry.position) continue;
            const dx = entry.position.x - pm.x;
            const dy = entry.position.y - pm.y;
            const dz = entry.position.z - pm.z;
            if (dx * dx + dy * dy + dz * dz <= r2) return true;
        }
        return false;
    }

    // Werkstatt-Prozesse fürs Menü: in schöpfer ALLE besessenen Werkstatt-Baupläne, sonst nur platzierte +
    // nahe. Jeder Eintrag trägt Station + Domäne-Op + Substanz-Präzisions-Cap („Esse · schmieden 0.93").
    // Die HAND bleibt separat verfügbar (applyOpToPart).
    _workshopProcessesForMenu() {
        const mode = this.getGameMode ? this.getGameMode() : "frieden";
        const out = [];
        const seen = new Set();
        const consider = (stationName) => {
            if (seen.has(stationName)) return;
            const station = this.state.blueprints[stationName];
            if (!station || station.role !== "workshop-station") return;
            const domain = this._computeWorkshopDomain(station);
            const proc = this._domainProcess(domain);
            if (!proc) return;
            seen.add(stationName);
            out.push({
                stationName,
                label: station.label || stationName,
                domain,
                opClass: proc.opClass,
                opName: proc.opName,
                cap: this._workshopStationPrecision(station),
            });
        };
        if (mode === "schöpfer") {
            for (const name of Object.keys(this.state.blueprints || {})) consider(name);
        } else {
            for (const entry of this.state.architectures || []) {
                if (entry && entry.type && this._isWorkshopStationPlacedNear(entry.type)) consider(entry.type);
            }
        }
        return out;
    }

    removePartOp(blueprintName, partIndex) {
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        if (!Array.isArray(bp.parts) || partIndex < 0 || partIndex >= bp.parts.length) {
            return { ok: false, reason: "invalid_part_index" };
        }
        const part = bp.parts[partIndex];
        const defLen = this._defaultPartOpChain().length;
        if (!Array.isArray(part.opChain) || part.opChain.length <= defLen) {
            return { ok: false, reason: "nothing_to_remove" }; // schon auf der Default-Op-Kette
        }
        this._recordBlueprintEdit(blueprintName);
        part.opChain.pop();
        this._refreshBlueprintRoleEmergent(blueprintName);
        return { ok: true, precision: this.computePartPrecision(part), opCount: part.opChain.length };
    }

    // UNDO/REDO im Bauplan-Editor: Sitzungs-Geschichte (NICHT persistiert) über ALLE Editor-Akte (Parts,
    // Ops, Verbindungen). Jede Mutation ruft `_recordBlueprintEdit` (schnappt den Vor-Zustand), undo/redo
    // tauschen zwischen den Stapeln. Nur eigene Baupläne (Built-ins sind unveränderlich).
    _blueprintEditHistory(name) {
        if (!this.state.blueprintEditHistory) this.state.blueprintEditHistory = {};
        if (!this.state.blueprintEditHistory[name]) this.state.blueprintEditHistory[name] = { undo: [], redo: [] };
        return this.state.blueprintEditHistory[name];
    }

    // Der editierbare Zustand eines Bauplans (Parts + Verbindungen + Rolle), tief geklont.
    _snapshotBlueprintEdit(name) {
        const bp = (this.state.blueprints && this.state.blueprints[name]) || {};
        return {
            parts: JSON.parse(JSON.stringify(bp.parts || [])),
            connections: bp.connections ? JSON.parse(JSON.stringify(bp.connections)) : undefined,
            role: bp.role,
            roleManual: bp.roleManual,
        };
    }

    // VOR jeder Mutation aufgerufen: schnappt den aktuellen (Vor-Mutations-)Zustand auf den Undo-Stapel,
    // verwirft den Redo-Zweig (ein neuer Edit gabelt die Geschichte). Bounded (max 50 Schritte).
    _recordBlueprintEdit(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp || bp.builtIn) return; // Built-ins werden nicht editiert → keine Geschichte
        const hist = this._blueprintEditHistory(name);
        hist.undo.push(this._snapshotBlueprintEdit(name));
        if (hist.undo.length > 50) hist.undo.shift();
        hist.redo.length = 0;
    }

    // Stellt einen Schnappschuss wieder her (Parts + Verbindungen + Rolle direkt — der Schnappschuss ist
    // ein konsistenter Vor-Zustand, kein Re-Emergieren nötig).
    _restoreBlueprintEdit(name, snap) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp || !snap) return;
        bp.parts = JSON.parse(JSON.stringify(snap.parts || []));
        this.state._bpEditTick = (this.state._bpEditTick || 0) + 1; // V18.358 — Recipe-Book-Signatur
        if (snap.connections) bp.connections = JSON.parse(JSON.stringify(snap.connections));
        else delete bp.connections;
        if (snap.role === undefined) delete bp.role;
        else bp.role = snap.role;
        if (snap.roleManual === undefined) delete bp.roleManual;
        else bp.roleManual = snap.roleManual;
    }

    canUndoBlueprintEdit(name) {
        const h = this.state.blueprintEditHistory && this.state.blueprintEditHistory[name];
        return !!(h && h.undo.length);
    }

    canRedoBlueprintEdit(name) {
        const h = this.state.blueprintEditHistory && this.state.blueprintEditHistory[name];
        return !!(h && h.redo.length);
    }

    undoBlueprintEdit(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp || bp.builtIn) return { ok: false, reason: "not_editable" };
        const hist = this._blueprintEditHistory(name);
        if (!hist.undo.length) return { ok: false, reason: "nothing_to_undo" };
        hist.redo.push(this._snapshotBlueprintEdit(name)); // der aktuelle Zustand → Redo
        this._restoreBlueprintEdit(name, hist.undo.pop());
        return { ok: true, undoLeft: hist.undo.length, redoLeft: hist.redo.length };
    }

    redoBlueprintEdit(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp || bp.builtIn) return { ok: false, reason: "not_editable" };
        const hist = this._blueprintEditHistory(name);
        if (!hist.redo.length) return { ok: false, reason: "nothing_to_redo" };
        hist.undo.push(this._snapshotBlueprintEdit(name)); // der aktuelle Zustand → Undo
        this._restoreBlueprintEdit(name, hist.redo.pop());
        return { ok: true, undoLeft: hist.undo.length, redoLeft: hist.redo.length };
    }

    // ANGEZEIGTE Rolle: ein deklarierter Override (roleManual = Spieler-Intent, oder built-in-Saat-Rolle)
    // gilt; sonst die EMERGENTE (computeBlueprintRole) — sonst zeigte ein rollenloser Bauplan (bp.role
    // undefined) den „Bauwerk"-Default statt seiner wahren Rolle.
    _displayRole(bp) {
        if (!bp) return AnazhRealm.DEFAULT_BLUEPRINT_ROLE;
        if ((bp.roleManual || bp.builtIn) && bp.role) return bp.role;
        return this.computeBlueprintRole(bp);
    }
    // Aktivierte Tags je Part (Form × Material): Werte 0..3 = FORM_TAG_ACTIVATION × MATERIAL_TAG (0..1).
    // Unbekannte Shape (z. B. "blueprint") oder fehlendes Material → leeres Objekt.
    computePartTags(part) {
        if (!part || typeof part !== "object") return {};
        const activation = AnazhRealm.FORM_TAG_ACTIVATION[part.shape];
        if (!activation) return {};
        const matName = part.material || "stein";
        const material = this.state.materials && this.state.materials[matName];
        if (!material || !material.tags) return {};
        const out = {};
        const ceil = AnazhRealm.MATERIAL_TAG_CEIL;
        for (const tag of AnazhRealm.MATERIAL_TAG_KEYS) {
            // Die Klemme am LESER: fremde Substanz behält ihre Magnitude (must-preserve), diese Welt liest nur bis
            // ceil (härte=10⁶ baute sonst eine unzerstörbare Mauer). Für lokale Materialien ([0,1] per
            // defineMaterial) no-op; deckt JEDEN Eintrittsweg, weil ALLE Compound-Konsumenten hier durchlaufen.
            const raw = Math.min(ceil[tag] !== undefined ? ceil[tag] : 2, material.tags[tag] || 0);
            const val = (activation[tag] || 0) * raw;
            if (val > 0) out[tag] = val;
        }
        return out;
    }

    // Aggregation über alle Parts mit MAX statt SUM: SUM ergibt Stat-Matsch (17 Quader = 17× Trägheit).
    // Je Tag-Achse erbt der Compound vom kompetentesten Part.
    computeCompoundTags(blueprint) {
        const out = {};
        if (!blueprint || !Array.isArray(blueprint.parts)) return out;
        for (const part of blueprint.parts) {
            const partTags = this.computePartTags(part);
            for (const tag of Object.keys(partTags)) {
                const v = partTags[tag];
                if (!(tag in out) || v > out[tag]) out[tag] = v;
            }
        }
        // Spezies-Variation additiv DRAUF (SPECIES_TAG_VARIATION, z. B. Tanne brennbar↑) — sonst lesen alle
        // Arten identische holz+laub-Tags. Bedingung ist `_grownSpecies` (Identität), nicht `_isGrown`: so
        // trägt auch der Built-in-Bauplan (baum_eiche/…) seine Variation. Die VARIATIONS-Wand erlaubt nur
        // diese Δ; Built-ins ohne _grownSpecies bleiben bit-identisch.
        if (typeof blueprint._grownSpecies === "string") {
            const variation =
                AnazhRealm.SPECIES_TAG_VARIATION && AnazhRealm.SPECIES_TAG_VARIATION[blueprint._grownSpecies];
            if (variation) {
                for (const axis of Object.keys(variation)) {
                    out[axis] = Math.max(0, (out[axis] || 0) + variation[axis]);
                }
            }
        }
        return out;
    }

    // ### Räumliche Emergenz ###
    // Fünf Prinzipien: (1) Spitze richtet nach außen · (2) Hohlraum enthält · (3) Symmetrieachse trägt
    // Alignment · (4) Kontakt überträgt Tags · (5) Abstände erzeugen Resonanz. (1)+(4) wirken je Part;
    // (2)(3)(5) sind COMPOUND-Bonusse, multiplikativ auf der MAX-Aggregation (verstärken, addieren nicht).

    // Part-AABB in lokalen Compound-Koordinaten: position ± size/2 (Näherung); blueprint-Refs: scale * 1.
    _partBoundingBox(part) {
        if (!part || typeof part !== "object") return null;
        const pos = part.position || { x: 0, y: 0, z: 0 };
        const size = part.size || { x: 1, y: 1, z: 1 };
        const sx = Math.max(0.1, Math.abs(size.x || 1));
        const sy = Math.max(0.1, Math.abs(size.y || sx));
        const sz = Math.max(0.1, Math.abs(size.z || sx));
        return {
            min: { x: pos.x - sx / 2, y: pos.y - sy / 2, z: pos.z - sz / 2 },
            max: { x: pos.x + sx / 2, y: pos.y + sy / 2, z: pos.z + sz / 2 },
            center: { x: pos.x, y: pos.y, z: pos.z },
        };
    }

    // Compound-AABB = Union aller Parts (min/max + Extent je Achse). Ein Part gilt als Spitze, wenn es
    // innerhalb 20 % der Extent am Rand liegt.
    _compoundBoundingBox(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts) || blueprint.parts.length === 0) return null;
        let minX = Infinity,
            minY = Infinity,
            minZ = Infinity;
        let maxX = -Infinity,
            maxY = -Infinity,
            maxZ = -Infinity;
        for (const p of blueprint.parts) {
            const bb = this._partBoundingBox(p);
            if (!bb) continue;
            if (bb.min.x < minX) minX = bb.min.x;
            if (bb.min.y < minY) minY = bb.min.y;
            if (bb.min.z < minZ) minZ = bb.min.z;
            if (bb.max.x > maxX) maxX = bb.max.x;
            if (bb.max.y > maxY) maxY = bb.max.y;
            if (bb.max.z > maxZ) maxZ = bb.max.z;
        }
        if (minX === Infinity) return null;
        return {
            min: { x: minX, y: minY, z: minZ },
            max: { x: maxX, y: maxY, z: maxZ },
            extent: { x: maxX - minX, y: maxY - minY, z: maxZ - minZ },
        };
    }

    // Positions-Labels eines Parts: "at_top"/"at_bottom"/"at_outside"/"central" (mehrere möglich).
    // Schwelle 20 % der Compound-Extent — nur echte Rand-Parts, robust gegen Float-Drift.
    _classifyPartPosition(part, compoundBB) {
        const labels = new Set();
        if (!part || !compoundBB) return labels;
        const pos = part.position || { x: 0, y: 0, z: 0 };
        const e = compoundBB.extent;
        // "at_top": nahe maxY innerhalb 20 % der y-Extent
        if (e.y > 0.1 && pos.y >= compoundBB.max.y - e.y * 0.2) labels.add("at_top");
        if (e.y > 0.1 && pos.y <= compoundBB.min.y + e.y * 0.2) labels.add("at_bottom");
        // "at_outside": radial weit vom Zentrum (xz-Distanz > 60 % des
        // Compound-Radius). Mehrere Achsen kombinieren via Pythagoras.
        const centerX = (compoundBB.min.x + compoundBB.max.x) / 2;
        const centerZ = (compoundBB.min.z + compoundBB.max.z) / 2;
        const radialDist = Math.hypot(pos.x - centerX, pos.z - centerZ);
        const compoundRadius = Math.hypot(e.x, e.z) / 2;
        if (compoundRadius > 0.1 && radialDist > compoundRadius * 0.6) labels.add("at_outside");
        if (labels.size === 0) labels.add("central");
        return labels;
    }

    // Prinzip 2: Sphere/Torus, deren AABB das Zentrum eines anderen Parts enthält, formen einen Hohlraum →
    // Container UND Inhalt bekommen Resonanz-Bonus (Glocke + Klöppel). AABB statt echter Hülle — grob,
    // aber die richtige Granularität für die Compound-Frage.
    _findHollowPairs(blueprint) {
        const pairs = [];
        const parts = blueprint.parts || [];
        const partBBs = parts.map((p) => this._partBoundingBox(p));
        const partVolumes = partBBs.map((bb) => {
            if (!bb) return 0;
            return Math.max(0, (bb.max.x - bb.min.x) * (bb.max.y - bb.min.y) * (bb.max.z - bb.min.z));
        });
        for (let i = 0; i < parts.length; i++) {
            const outer = parts[i];
            if (!AnazhRealm.SPATIAL_HOLLOW_SHAPES.has(outer.shape)) continue;
            const outerBB = partBBs[i];
            if (!outerBB) continue;
            for (let j = 0; j < parts.length; j++) {
                if (i === j) continue;
                // Konzeptionelle Asymmetrie: nur das größere Volumen ist
                // Container. Sonst gilt bei zwei konzentrischen Sphären jeder
                // als Container für den anderen (Center-in-BB ist symmetrisch).
                if (partVolumes[i] <= partVolumes[j]) continue;
                const inner = parts[j];
                const innerPos = inner.position || { x: 0, y: 0, z: 0 };
                if (
                    innerPos.x > outerBB.min.x &&
                    innerPos.x < outerBB.max.x &&
                    innerPos.y > outerBB.min.y &&
                    innerPos.y < outerBB.max.y &&
                    innerPos.z > outerBB.min.z &&
                    innerPos.z < outerBB.max.z
                ) {
                    pairs.push({ outer: i, inner: j });
                }
            }
        }
        return pairs;
    }

    // Prinzip 3: Y-Drehsymmetrie — Std-Abweichung der xz-Distanz vom Zentrum ≤ 30 % der xz-Extent →
    // Alignment-Bonus auf magieleitung + stromleitung.
    _hasYAxisSymmetry(blueprint) {
        const parts = blueprint.parts || [];
        if (parts.length < 2) return false;
        const bb = this._compoundBoundingBox(blueprint);
        if (!bb) return false;
        const xzExtent = Math.max(bb.extent.x, bb.extent.z);
        if (xzExtent < 0.5) return true; // sehr dünn → zählt als achssymmetrisch
        const centerX = (bb.min.x + bb.max.x) / 2;
        const centerZ = (bb.min.z + bb.max.z) / 2;
        let maxDist = 0;
        for (const p of parts) {
            const pos = p.position || { x: 0, y: 0, z: 0 };
            const d = Math.hypot(pos.x - centerX, pos.z - centerZ);
            if (d > maxDist) maxDist = d;
        }
        // Wenn die maximale xz-Distanz vom Zentrum klein ist gegenüber der
        // xz-Extent, sind alle Parts auf der Achse — Compound ist „Stab".
        return maxDist <= xzExtent * 0.25;
    }

    // Prinzip 5: ≥ 3 Parts gleicher Shape auf etwa demselben Radius um das Zentrum = Array (Glockenspiel,
    // Kristall-Kreis) → Bonus auf resoniert + magieleitung.
    _hasResonantArray(blueprint) {
        const parts = blueprint.parts || [];
        if (parts.length < 3) return false;
        // Schwerpunkt der Part-Positionen statt BB-Center — BB ist geometrisch
        // verzerrt, wenn die Parts unregelmäßig verteilt sind (eine extreme
        // Position zieht das BB-Center, aber nicht den Schwerpunkt).
        let sumX = 0;
        let sumZ = 0;
        for (const p of parts) {
            const pos = p.position || { x: 0, y: 0, z: 0 };
            sumX += pos.x;
            sumZ += pos.z;
        }
        const centerX = sumX / parts.length;
        const centerZ = sumZ / parts.length;
        const byShape = {};
        for (const p of parts) {
            const pos = p.position || { x: 0, y: 0, z: 0 };
            const dist = Math.hypot(pos.x - centerX, pos.z - centerZ);
            if (dist < 0.1) continue; // zentrale Parts zählen nicht zum Array
            (byShape[p.shape] = byShape[p.shape] || []).push(dist);
        }
        for (const shape of Object.keys(byShape)) {
            const distances = byShape[shape];
            if (distances.length < 3) continue;
            const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
            if (avg < 0.5) continue;
            // Alle Distanzen müssen innerhalb 12 % vom Mittelwert liegen.
            // 15 % war grenzwertig: drei Parts auf grob-ähnlichen Radien aber
            // ohne echte Kreis-Anordnung fielen durch. 12 % filtert das raus.
            const maxDev = distances.reduce((m, d) => Math.max(m, Math.abs(d - avg)), 0);
            if (maxDev <= avg * 0.12) return true;
        }
        return false;
    }

    // Prinzip 4: Parts berühren sich, wenn ihre AABBs überlappen oder < CONTACT_GAP auseinander liegen.
    // AABB statt Mesh-Kollision — die Sekunden-Ticks lesen viele Compound-Parts.
    _partsAreInContact(partA, partB) {
        const a = this._partBoundingBox(partA);
        const b = this._partBoundingBox(partB);
        if (!a || !b) return false;
        const gap = 0.15;
        const dx = Math.max(0, Math.max(a.min.x - b.max.x, b.min.x - a.max.x));
        const dy = Math.max(0, Math.max(a.min.y - b.max.y, b.min.y - a.max.y));
        const dz = Math.max(0, Math.max(a.min.z - b.max.z, b.min.z - a.max.z));
        return dx < gap && dy < gap && dz < gap;
    }

    // DAS GEDÄCHTNIS DER RAUM-TAGS (0710-11): die Rechnung (`_raumTagsRechnen`) prüft je Teil-Paar Kontakt und Hohlraum —
    // O(Teile²), an der Mess-Wiese 0,6–1,1 ms je Bauplan (Haselbusch 112 Teile); die Resonanz der Boosts fragte je Sekunde
    // dieselben Baupläne für jeden nahen Eintrag neu (10 Rufe, 8,3 ms, Spitze 10,3 ms). Je Bauplan-Objekt merkt sich das
    // Gedächtnis die Tags und den SCHLÜSSEL: einen Schnappschuss JEDES Eingangs der Rechnung (`_raumTagSchluessel`: je Teil
    // Form, Stoff, Position, Größe; je benutzter Stoff seine Tags) — gebaut bei jedem Ruf, Wert für Wert verglichen. So sieht
    // das Gedächtnis jeden Schreiber (die Werkstatt-API, Undo/Redo, das Laden, `defineMaterial`, eine direkte Änderung am
    // Teil ohne API), ohne ihn zu kennen; die Tags rechnen nur bei geändertem Schlüssel neu. Der Leser bekommt je Ruf ein
    // eigenes Objekt (wie die Rechnung). Die Wand (gate:raum-tags): der Schlüssel liest jeden Eingang der Rechnung (Proxy-
    // Linse), die Rechnung liest keinen Zustand außer `state.materials`, ihre Tabellen schreibt niemand (AST), und über eine
    // Werkstatt-Sitzung mit Edits urteilt das Gedächtnis byte-gleich wie die Rechnung.
    computeSpatialTags(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts) || blueprint.parts.length === 0) {
            return this._raumTagsRechnen(blueprint);
        }
        const gedaechtnis = this._raumTagGedaechtnis || (this._raumTagGedaechtnis = new WeakMap());
        const neu = this._raumTagSchluessel(blueprint, this._raumTagKratz || (this._raumTagKratz = []));
        let m = gedaechtnis.get(blueprint);
        if (m && this._raumTagGleich(m.schluessel, neu)) return Object.assign({}, m.tags);
        const tags = this._raumTagsRechnen(blueprint);
        if (!m) gedaechtnis.set(blueprint, (m = { schluessel: [], tags: null }));
        // der neue Schlüssel wird das Gedächtnis, das alte Array der nächste Kratzplatz
        this._raumTagKratz = m.schluessel;
        m.schluessel = neu;
        m.tags = tags;
        return Object.assign({}, tags);
    }

    // Der Schlüssel der Raum-Tags: jeder Eingang der Rechnung in fester Folge (Flaggen vor den Teil-Stücken, so ist die Folge
    // eindeutig) — die Teile (Form, Stoff, Position, Größe) und je benutztem Stoff (`material || "stein"`) seine Tags.
    _raumTagSchluessel(blueprint, out) {
        out.length = 0;
        const parts = blueprint.parts;
        const n = parts.length;
        out.push(n);
        const stoffe = this._raumTagStoffe || (this._raumTagStoffe = []);
        stoffe.length = 0;
        for (let i = 0; i < n; i++) {
            const p = parts[i];
            if (!p || typeof p !== "object") {
                out.push(0, p);
                continue;
            }
            const pos = p.position;
            const size = p.size;
            out.push(1, p.shape, p.material);
            if (pos) out.push(1, pos.x, pos.y, pos.z);
            else out.push(0);
            if (size) out.push(1, size.x, size.y, size.z);
            else out.push(0);
            const stoff = p.material || "stein";
            if (stoffe.indexOf(stoff) < 0) stoffe.push(stoff);
        }
        const mats = this.state.materials;
        out.push(mats ? 1 : 0);
        if (mats)
            for (const name of stoffe) {
                const mat = mats[name];
                const t = mat ? mat.tags : undefined;
                out.push(name, mat ? 1 : 0, t ? 1 : 0);
                if (t) for (const k of AnazhRealm.MATERIAL_TAG_KEYS) out.push(t[k]);
            }
        return out;
    }

    _raumTagGleich(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return false;
        return true;
    }

    // Räumliche Tags = computeCompoundTags-Basis + Bonus-Regeln, VOR der MAX-Aggregation je Part (die gedächtnislose
    // Rechnung; Leser fragen `computeSpatialTags`):
    // Prinzip 1: pointed-shape (cone/pyramid/octahedron/helix) at_top/at_outside → Bonus auf härte +
    // magieleitung, skaliert mit der intrinsischen Aktivierung (computePartTags).
    // Prinzip 4: je Tag max(Original, Kontakt × CONTACT_TRANSFER) zwischen berührenden Parts.
    _raumTagsRechnen(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts) || blueprint.parts.length === 0) {
            return this.computeCompoundTags(blueprint);
        }
        const bb = this._compoundBoundingBox(blueprint);
        const parts = blueprint.parts;
        const pointed = AnazhRealm.SPATIAL_POINTED_SHAPES;
        const TIP_BONUS = 0.5; // ★+50 % am Rand für pointed-Shapes
        const CONTACT_TRANSFER = 0.6; // 60 % der höheren Tag-Stärke fließt über
        // Schritt 1: pro Part die räumlich-bonusten Tags berechnen
        const augmentedPartTags = parts.map((part) => {
            const baseTags = this.computePartTags(part);
            const labels = this._classifyPartPosition(part, bb);
            const isTip = pointed.has(part.shape) && (labels.has("at_top") || labels.has("at_outside"));
            if (isTip) {
                // Spitze: härte + magieleitung bekommen Bonus aus dem
                // INTRINSISCHEN Wert (kein freier Bonus, sondern Verstärkung).
                if (baseTags["härte"]) baseTags["härte"] = baseTags["härte"] * (1 + TIP_BONUS);
                if (baseTags["magieleitung"]) {
                    baseTags["magieleitung"] = baseTags["magieleitung"] * (1 + TIP_BONUS);
                }
            }
            return baseTags;
        });
        // Prinzip 2: je Hohlraum-Paar bekommen Container UND Inhalt den Resonanz-Bonus EINMAL (auch bei
        // mehreren Inhalten eines Containers).
        const hollowPairs = this._findHollowPairs(blueprint);
        const hollowBoosted = new Set();
        for (const pair of hollowPairs) {
            for (const idx of [pair.outer, pair.inner]) {
                if (hollowBoosted.has(idx)) continue;
                hollowBoosted.add(idx);
                const tags = augmentedPartTags[idx];
                if (tags["resoniert"]) {
                    tags["resoniert"] = tags["resoniert"] * (1 + AnazhRealm.SPATIAL_HOLLOW_BONUS);
                }
            }
        }
        // Schritt 3: Kontakt-Übertragung. Für jedes Paar (i, j) mit Kontakt,
        // gleiche schwächeren Tag-Wert mit CONTACT_TRANSFER × stärkerem Wert an.
        for (let i = 0; i < parts.length; i++) {
            for (let j = i + 1; j < parts.length; j++) {
                if (!this._partsAreInContact(parts[i], parts[j])) continue;
                const a = augmentedPartTags[i];
                const b = augmentedPartTags[j];
                // Welche Tags werden übertragen (Konzept §5.2 Prinzip 4 nennt
                // Wärme, Strom, Magie, Schwingung): nicht alle 10 Tags fließen.
                const transferable = AnazhRealm.SPATIAL_TRANSFERABLE_TAGS;
                for (const tag of transferable) {
                    const valA = a[tag] || 0;
                    const valB = b[tag] || 0;
                    if (valA > valB) {
                        const transferred = valA * CONTACT_TRANSFER;
                        if (transferred > valB) b[tag] = transferred;
                    } else if (valB > valA) {
                        const transferred = valB * CONTACT_TRANSFER;
                        if (transferred > valA) a[tag] = transferred;
                    }
                }
            }
        }
        // Schritt 4: Standard-MAX-Aggregation über die augmentierten Parts.
        const out = {};
        for (const partTags of augmentedPartTags) {
            for (const tag of Object.keys(partTags)) {
                const v = partTags[tag];
                if (!(tag in out) || v > out[tag]) out[tag] = v;
            }
        }
        // Schritt 5: Compound-Bonusse aus Prinzip 3 + 5. Werden NACH der
        // Aggregation angewandt, weil sie Eigenschaften des Compounds als
        // Ganzes sind, nicht einzelner Parts.
        if (this._hasYAxisSymmetry(blueprint)) {
            if (out["magieleitung"]) {
                out["magieleitung"] = out["magieleitung"] * (1 + AnazhRealm.SPATIAL_AXIS_BONUS);
            }
            if (out["stromleitung"]) {
                out["stromleitung"] = out["stromleitung"] * (1 + AnazhRealm.SPATIAL_AXIS_BONUS);
            }
        }
        if (this._hasResonantArray(blueprint)) {
            if (out["resoniert"]) {
                out["resoniert"] = out["resoniert"] * (1 + AnazhRealm.SPATIAL_ARRAY_BONUS);
            }
            if (out["magieleitung"]) {
                out["magieleitung"] = out["magieleitung"] * (1 + AnazhRealm.SPATIAL_ARRAY_BONUS);
            }
        }
        return out;
    }

    // ### Verbindungstypen mit Lastformel ###
    // `blueprint.connections` referenziert zwei Part-Indizes + einen Typ aus CONNECTION_TYPES; die
    // Lastformel verbindet Geometrie + Material + Typ aus den bekannten Tags.

    // Kontaktfläche: AABB-Überschneidung in den ZWEI größeren Dimensionen, multipliziert.
    _partsContactArea(partA, partB) {
        // Die Kontakt-Hülle ist ROTATIONS-BEWUSST (|R|·s): die rotations-blinde _partBoundingBox sah ein
        // liegendes Rad 0.14 statt 0.62 m hoch → es „berührte" nie. _partBoundingBox bleibt für die
        // Spatial-Tag-Leser unverändert (eingefrorene Affinitäts-Baselines).
        const a = this._partWorldAABB(partA);
        const b = this._partWorldAABB(partB);
        if (!a || !b) return 0;
        // Pro Achse signed gap: negativ bei Overlap, positiv bei Trennung.
        const gapX = Math.max(a.min.x - b.max.x, b.min.x - a.max.x);
        const gapY = Math.max(a.min.y - b.max.y, b.min.y - a.max.y);
        const gapZ = Math.max(a.min.z - b.max.z, b.min.z - a.max.z);
        // Ist EINE Achse weiter als TOUCH getrennt, kein Kontakt (additive TOUCH-Faktoren gaben sonst weit
        // entfernten Parts positive Fläche). TOUCH = 0.05 erlaubt bündiges Sitzen.
        const TOUCH = 0.05;
        if (Math.max(gapX, gapY, gapZ) > TOUCH) return 0;
        // Sort aufsteigend: [tiefster Overlap, mittel, dünnster Overlap].
        // Die zwei tieferen Overlaps spannen die Kontaktfläche auf; der
        // dünnste ist die Kontakt-Normale.
        const sorted = [gapX, gapY, gapZ].sort((p, q) => p - q);
        const overlapA = Math.max(0, -sorted[0]);
        const overlapB = Math.max(0, -sorted[1]);
        return overlapA * overlapB;
    }

    // Liefert die Lastfähigkeit einer Verbindung, 0..3 in derselben Skala wie
    // die Tag-Strahler — vergleichbar mit `compound_has_tag`-Werten.
    computeConnectionStrength(connection, blueprint) {
        if (!connection || !blueprint) return 0;
        const type = AnazhRealm.CONNECTION_TYPES[connection.type];
        if (!type) return 0;
        const parts = blueprint.parts || [];
        const a = parts[connection.partA];
        const b = parts[connection.partB];
        if (!a || !b) return 0;
        const materials = this.state.materials || {};
        const matA = materials[a.material || "stein"];
        const matB = materials[b.material || "stein"];
        if (!matA || !matB) return 0;
        let tagSum = 0;
        for (const tag of type.strongTags) {
            tagSum += ((matA.tags[tag] || 0) + (matB.tags[tag] || 0)) / 2;
        }
        const avgTag = tagSum / type.strongTags.length;
        // Kontakt-Fläche normalisiert auf 1.0 (eine 1×1-Box-Begegnung = 1).
        // Größer ≥ 1 gibt vollen Faktor, kleiner skaliert linear.
        const contact = Math.min(1, this._partsContactArea(a, b));
        return type.typeStrength * avgTag * 3 * Math.max(0.1, contact);
    }

    // Validiert eine Connection-Liste (Save/DSL-Eingang): Whitelist CONNECTION_TYPES, Indizes in
    // parts-Range, max 64 je Bauplan. Liefert ein neues Array, mutiert die Eingabe nicht.
    validateBlueprintConnections(connections, partsLength) {
        if (!Array.isArray(connections)) return [];
        const clean = [];
        for (const c of connections.slice(0, AnazhRealm.CONNECTION_MAX_PER_BLUEPRINT)) {
            if (!c || typeof c !== "object") continue;
            const typeDef = AnazhRealm.CONNECTION_TYPES[c.type];
            // Strukturell valide Verbindung mit UNBEKANNTEM Typ wird BEWAHRT (must-preserve: connections sind
            // signierte Substanz, Droppen kippte die Signatur auf „modified"). Die Leser ignorieren sie
            // (computeConnectionStrength → 0, computeMotionRoles nur bekannte Typen, _attachPointFor exakte
            // kinds); Struktur-Müll fällt.
            if (!typeDef) {
                const type = typeof c.type === "string" ? c.type.slice(0, 40) : "";
                if (!type) continue;
                const pA = Number(c.partA);
                const pB = Number(c.partB);
                if (!Number.isInteger(pA) || pA < 0 || pA >= partsLength) continue;
                if (!Number.isInteger(pB) || pA === pB || pB >= partsLength || pB < -1) continue;
                clean.push({ type, partA: pA, partB: pB });
                continue;
            }
            const partA = Number(c.partA);
            if (!Number.isInteger(partA) || partA < 0 || partA >= partsLength) continue;
            // V18.110 — C7: ein ATTACHMENT-Punkt (griff/sitz/trage) sitzt an
            // partA allein — partB ist optional (-1 = die Außenwelt).
            if (typeDef.attachment) {
                const partB = Number.isInteger(Number(c.partB)) ? Number(c.partB) : -1;
                const entry = { type: c.type, partA, partB: partB >= 0 && partB < partsLength ? partB : -1 };
                // M1(b) (V18.156) — der Face-Snap-Anker ist SUBSTANZ und reist
                // (3 finite Zahlen, geklemmt ±64 — Struktur-Müll fällt weiter).
                if (
                    c.anchor &&
                    Number.isFinite(Number(c.anchor.x)) &&
                    Number.isFinite(Number(c.anchor.y)) &&
                    Number.isFinite(Number(c.anchor.z))
                ) {
                    const cl = (v) => Math.max(-64, Math.min(64, Number(v)));
                    entry.anchor = { x: cl(c.anchor.x), y: cl(c.anchor.y), z: cl(c.anchor.z) };
                }
                clean.push(entry);
                continue;
            }
            const partB = Number(c.partB);
            if (!Number.isInteger(partB)) continue;
            if (partA === partB) continue;
            if (partB < 0 || partB >= partsLength) continue;
            const entry = { type: c.type, partA, partB };
            // Die AUTO-Marke (Kontakt-Emergenz) ist Metadatum wie anchor, NICHT im Signatur-Kanon
            // (_canonicalBlueprint liest nur type/partA/partB). Auto-Verbindungen lösen sich beim Trennen (Typ
            // folgt der Substanz); bewusst gewählte bleiben.
            if (c.auto) entry.auto = 1;
            clean.push(entry);
        }
        return clean;
    }

    addConnectionToBlueprint(name, connection) {
        const bp = this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        if (!Array.isArray(bp.connections)) bp.connections = [];
        if (bp.connections.length >= AnazhRealm.CONNECTION_MAX_PER_BLUEPRINT) {
            return { ok: false, reason: "too_many_connections" };
        }
        const valid = this.validateBlueprintConnections([connection], bp.parts.length);
        if (valid.length === 0) return { ok: false, reason: "invalid_connection" };
        this._recordBlueprintEdit(name); // V17.87 — Edit-Verlauf
        bp.connections.push(valid[0]);
        return { ok: true, index: bp.connections.length - 1 };
    }

    removeConnectionFromBlueprint(name, index) {
        const bp = this.state.blueprints[name];
        if (!bp || bp.builtIn) return false;
        if (!Array.isArray(bp.connections) || index < 0 || index >= bp.connections.length) return false;
        this._recordBlueprintEdit(name); // V17.87 — Edit-Verlauf
        bp.connections.splice(index, 1);
        return true;
    }

    // ATTACHMENT-PUNKT — die EINE Quelle für griff (Hand) · sitz (Reiter) · trage (Torso). Explizit =
    // connections-Zeile {type: griff|sitz|trage, partA}; sonst emergiert aus Form × Lage: griff =
    // stiel-artigster Part, sitz = oberste flache Fläche nahe der Mitte, trage = volumen-gewichtetes
    // Masse-Zentrum. Rückgabe BAUPLAN-LOKAL {part, point}; Skala/Orientierung macht der Konsument
    // (_refreshHeldMesh · _tickWornArmorVisual · mountArchitecture).
    _attachPointFor(bp, kind) {
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return { part: null, point: { x: 0, y: 0, z: 0 } };
        const parts = bp.parts;
        // (1) der EXPLIZITE Punkt (Intent schlägt Emergenz).
        if (Array.isArray(bp.connections)) {
            const c = bp.connections.find((cn) => cn && cn.type === kind);
            if (c && parts[c.partA]) {
                const p = parts[c.partA];
                const pos = p.position || { x: 0, y: 0, z: 0 };
                // FACE-SNAP-Anker: ein gesetzter Punkt (Part-Zentrum + anchor, Bauplan-Achsen) gilt wörtlich.
                if (
                    c.anchor &&
                    Number.isFinite(c.anchor.x) &&
                    Number.isFinite(c.anchor.y) &&
                    Number.isFinite(c.anchor.z)
                ) {
                    return {
                        part: c.partA,
                        point: {
                            x: (pos.x || 0) + c.anchor.x,
                            y: (pos.y || 0) + c.anchor.y,
                            z: (pos.z || 0) + c.anchor.z,
                        },
                    };
                }
                const sy = Math.abs((p.size && p.size.y) || 0.3);
                // sitz zeigt auf die OBERSEITE des Parts, griff/trage aufs Zentrum.
                const y = kind === "sitz" ? (pos.y || 0) + sy / 2 : pos.y || 0;
                return { part: c.partA, point: { x: pos.x || 0, y, z: pos.z || 0 } };
            }
        }
        // (2) EMERGENZ aus Form × Lage.
        const dims = (p) => ({
            sx: Math.abs((p.size && p.size.x) || 0.3),
            sy: Math.abs((p.size && p.size.y) || 0.3),
            sz: Math.abs((p.size && p.size.z) || 0.3),
        });
        if (kind === "griff") {
            // der stiel-artigste Part: längste/mittlere Achse maximal, dünn bevorzugt.
            let best = null;
            let bestScore = 0;
            for (let i = 0; i < parts.length; i++) {
                const d = dims(parts[i]);
                const axes = [d.sx, d.sy, d.sz].sort((a, b) => b - a);
                const elong = axes[0] / Math.max(0.01, axes[1]);
                const thin = 1 / Math.max(0.05, axes[2]);
                const score = elong * Math.min(4, thin);
                if (score > bestScore) {
                    bestScore = score;
                    best = i;
                }
            }
            if (best !== null) {
                const pos = parts[best].position || { x: 0, y: 0, z: 0 };
                return { part: best, point: { x: pos.x || 0, y: pos.y || 0, z: pos.z || 0 } };
            }
        }
        if (kind === "sitz") {
            // die oberste FLACHE Fläche nahe der XZ-Mitte (breite Oberseite).
            let best = null;
            let bestScore = -Infinity;
            for (let i = 0; i < parts.length; i++) {
                const d = dims(parts[i]);
                const pos = parts[i].position || { x: 0, y: 0, z: 0 };
                const flat = Math.min(d.sx, d.sz) / Math.max(0.05, d.sy); // breit + niedrig = Sitzfläche
                if (flat < 0.8) continue;
                const top = (pos.y || 0) + d.sy / 2;
                const centerBias = -(Math.abs(pos.x || 0) + Math.abs(pos.z || 0)) * 0.5;
                const score = top + Math.min(2, flat) * 0.3 + centerBias;
                if (score > bestScore) {
                    bestScore = score;
                    best = i;
                }
            }
            if (best !== null) {
                const p = parts[best];
                const pos = p.position || { x: 0, y: 0, z: 0 };
                return {
                    part: best,
                    point: { x: pos.x || 0, y: (pos.y || 0) + dims(p).sy / 2, z: pos.z || 0 },
                };
            }
        }
        // trage (+ Fallback aller Arten): das volumen-gewichtete MASSE-ZENTRUM.
        let vx = 0;
        let vy = 0;
        let vz = 0;
        let vSum = 0;
        for (const p of parts) {
            const d = dims(p);
            const v = Math.max(1e-4, d.sx * d.sy * d.sz);
            const pos = p.position || { x: 0, y: 0, z: 0 };
            vx += (pos.x || 0) * v;
            vy += (pos.y || 0) * v;
            vz += (pos.z || 0) * v;
            vSum += v;
        }
        return { part: null, point: { x: vx / vSum, y: vy / vSum, z: vz / vSum } };
    }

    // ### Maschinen-Rekursivität ###
    // Maschinen sind Compounds: ihre Präzision kommt aus der Präzision ihrer Bauteile (präzises Werkstück
    // ← präzise Drehbank ← mittlere Werkzeuge ← … Faustkeil).

    // Präzisions-Cap eines Bauplans als Werkzeug = Minimum aller Part-Präzisionen (eine schiefe Spindel
    // zieht die ganze Drehbank runter).
    computeBlueprintPrecisionCap(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts) || blueprint.parts.length === 0) return 0;
        let min = 1;
        for (const part of blueprint.parts) {
            const p = this.computePartPrecision(part);
            if (p < min) min = p;
        }
        return min;
    }

    // ### Werkzeug-Domains + emergente Bauplan-Rolle ###
    // Die Rolle EMERGIERT aus Material × Form × Werkzeug (Compound-Tags + Werkzeug-Domains).

    // Häufigste Domain über alle opChain-Einträge aller Parts (null ohne domain-Ops); generische Werkzeuge
    // (domain=null) zählen nicht. Gleichstand → Reihenfolge in TOOL_DOMAINS (deterministisch).
    computeBlueprintDomain(blueprint) {
        const counts = this.computeBlueprintDomainCounts(blueprint);
        let best = null;
        let bestCount = 0;
        for (const dom of AnazhRealm.TOOL_DOMAINS) {
            const c = counts[dom] || 0;
            if (c > bestCount) {
                bestCount = c;
                best = dom;
            }
        }
        return best;
    }

    // Domain-Verteilung als Map<domain, count> — für die Werkstatt-UI (welche Domain dominiert, wo
    // emergiert die nächste Rolle).
    computeBlueprintDomainCounts(blueprint) {
        const counts = {};
        if (!blueprint || !Array.isArray(blueprint.parts)) return counts;
        for (const part of blueprint.parts) {
            if (!part || !Array.isArray(part.opChain)) continue;
            for (const op of part.opChain) {
                if (!op || typeof op.tool !== "string") continue;
                const tool = this.state.tools && this.state.tools[op.tool];
                if (!tool) continue;
                const dom = tool.domain;
                if (!dom || typeof dom !== "string") continue;
                if (!AnazhRealm.TOOL_DOMAINS.includes(dom)) continue;
                counts[dom] = (counts[dom] || 0) + 1;
            }
        }
        return counts;
    }

    // Forging-Split: dominante Domain "forging" → "tool", wenn die Compound-Tags die
    // FORGING_TOOL_TAGS-Seite (härte/magieleitung/stromleitung) stärker tragen, sonst "armor"
    // (dichte/zähigkeit/wärmeleitung).
    _computeForgingRole(blueprint) {
        const tags = this.computeCompoundTags(blueprint) || {};
        let toolScore = 0;
        let armorScore = 0;
        for (const t of AnazhRealm.FORGING_TOOL_TAGS) toolScore += tags[t] || 0;
        for (const t of AnazhRealm.FORGING_ARMOR_TAGS) armorScore += tags[t] || 0;
        return toolScore >= armorScore ? "tool" : "armor";
    }

    // Substanz-Rolle: zuerst die Krafting-Geschichte — die dominante opChain-Domain über DOMAIN_TO_ROLE
    // (forging → _computeForgingRole); die bewusste Werkzeug-Wahl ist Intent und hat Vorrang. Sonst die
    // Form/Substanz-RESONANZ (_computeFormRole). Das Portal-ZIEL (portalMeta.world) emergiert nie — es ist
    // autoriert (setBlueprintAsPortal), wie toolMeta/consumableMeta.
    computeBlueprintRole(blueprint) {
        const dom = this.computeBlueprintDomain(blueprint);
        if (dom) {
            const role = AnazhRealm.DOMAIN_TO_ROLE[dom];
            if (role === "forging-split") return this._computeForgingRole(blueprint);
            if (role) return role;
        }
        // R3 (§11.10) — sonst: die intrinsische Form/Substanz als RESONANZ (statt der priority-Prädikat-Kette).
        return this._computeFormRole(blueprint);
    }

    // PRODUKT-VEKTOR: Material-Tags (10) ⊕ räumliche Signatur als numerische Achsen. KONJUNKTIVE Geometrie
    // (Körper = Symmetrie UND Vertikalität UND Glieder) kommt als 0/1-Achse aus den Prädikaten — eine
    // lineare Summe bräche die Konjunktion (ein flaches symmetrisches Dorf läse als Körper).
    _blueprintProductVector(bp) {
        const v = Object.assign({}, this.computeCompoundTags(bp) || {});
        // Material-Tags auf [0..1] normieren (÷ PRODUCT_VECTOR_TAG_NORM): roh liegen sie in [0..3], die
        // Form-Achsen in [0..1] → dichte überstimmte die Form, das Spektrum sättigte. So bestimmen die
        // Signatur-GEWICHTE die Rolle, nicht die Magnitude. Nur hier (Resonanz-Leser) — computeCompoundTags
        // bleibt roh (Spawn-Affinität/Emotion/STAT_FROM_TAGS lesen die Magnitude).
        const norm = AnazhRealm.PRODUCT_VECTOR_TAG_NORM;
        for (const k of AnazhRealm.MATERIAL_TAG_KEYS) {
            v[k] = Math.max(0, Math.min(1, (v[k] || 0) / norm));
        }
        v.bodyShape = this._isBodyShaped(bp) ? 1 : 0;
        v.portalShape = this._isPortalShaped(bp) ? 1 : 0;
        // `livingBody` = Körper-Form UND beseeltes MATERIAL (Konjunktion als 0/1-Achse). Das
        // compound-`lebendig` taugt NICHT: eine box maskiert es (FORM_TAG_ACTIVATION[box][lebendig]=0) → wir
        // lesen das UNMASKIERTE Material-lebendig (MAX über die Parts), und NUR über nicht-vegetative
        // Materialien: holz/laub/kraut/erde leben, sind aber unbeseelt → ein Baum fällt auf architecture.
        let maxMatLebendig = 0;
        const _mats = this.state.materials || {};
        const soulless = AnazhRealm.SOULLESS_SUBSTANCES;
        for (const p of bp.parts || []) {
            if (soulless && soulless.has(p.material)) continue; // Pflanze/Erde: lebt, beseelt nicht
            const ml = (_mats[p.material] && _mats[p.material].tags && _mats[p.material].tags.lebendig) || 0;
            if (ml > maxMatLebendig) maxMatLebendig = ml;
        }
        v.livingBody = v.bodyShape === 1 && maxMatLebendig > 0.3 ? 1 : 0;
        // S10 (kampf-plan §11.10) — die Katalysator-Geometrie: der Anteil spitzer/klingen-Parts (W2). Eine
        // weitere Achse des EINEN Produkt-Vektors (die Rollen-Resonanz ignoriert sie, die Op-Resonanz liest sie).
        v.pointedFraction = this._blueprintPointedFraction(bp);
        // Die räumlichen Form-Achsen (die 5 Prinzipien) als numerische Achsen DESSELBEN Vektors, damit jede
        // Lesart (Rolle/Stat/Affordanz) die volle Form liest. Additiv: nur Signaturen, die sie lesen, zählen.
        const ext = this._compoundVisualExtent(bp);
        const dims = [ext.dx || 0, ext.dy || 0, ext.dz || 0].sort((a, b) => b - a);
        const longest = dims[0] || 0;
        const middle = Math.max(dims[1] || 0, 0.001);
        v.elongation = Math.max(0, Math.min(1, (longest / middle - 1) / 3)); // Nadel/Klinge/Stab vs Klotz
        // hohlraum: wie viel des Hüll-Volumens NICHT mit Part-Masse gefüllt ist (Behälter/Ring vs Vollkörper)
        let partVol = 0;
        for (const p of bp.parts || []) {
            const s = p.size || { x: 1, y: 1, z: 1 };
            partVol += Math.abs((s.x || 1) * (s.y || 1) * (s.z || 1));
        }
        const extVol = (ext.dx || 0) * (ext.dy || 0) * (ext.dz || 0);
        v.hollowness = extVol > 0.001 ? Math.max(0, Math.min(1, 1 - partVol / extVol)) : 0;
        v.axialSymmetry = (this._compoundSymmetry(bp) || {}).ratio || 0; // Symmetrieachse trägt Alignment
        v.spread = this._compoundSpread(bp); // Trag-Basis (Fahrzeug/Bauwerk) vs Säule (Mast/Stab)
        // `rideable` = Konjunktion „deklarierter SITZ (connections) UND _isMoveable (Trag-Basis + Antrieb)":
        // Wagen/Holzross → Fahrzeug, Stein-Stuhl (kein Antrieb) → Bauwerk, Avatar (kein sitz) → Seele.
        // _isMoveable ist die robuste EINE Quelle (Glieder-Zählung wäre fragil: Holzross-Beine = scharnier).
        const hasSitz = Array.isArray(bp.connections) && bp.connections.some((c) => c && c.type === "sitz");
        v.rideable = hasSitz && this._isMoveable(bp) ? 1 : 0;
        // `bulk`: Größe jenseits der Greifbarkeit, (span − 2 m)/6 gekappt — was größer ist als du, trinkst du
        // nicht (Baum 0.83, Trank 0). consumable liest es NEGATIV, architecture POSITIV.
        v.bulk = Math.max(0, Math.min(1, (longest - 2) / 6));
        // ── Physik speist den Leser ──
        // Die gerechnete Physik (_stability …) als Achsen DESSELBEN Vektors, additiv +
        // [0,1]-skalen-konsistent; nur selektiv eingewebte Signaturen lesen sie, der Warum-Chip zitiert sie
        // getrennt von den Konventions-Achsen. Bau-/Edit-Zeit, nicht pro Frame.
        const physStab = this._stability(bp);
        v.stability = physStab.margin; // Ω-Φ2: CoM über Stützpolygon (SSF) — „steht WIRKLICH"
        const physBend = this._bendingStiffness(bp);
        v.stiffness = Math.max(0, Math.min(1, Math.sqrt(physBend.Imin) / Math.max(1e-4, physBend.area))); // Ω-Φ3: Biege-Effizienz
        const physSwing = this._swingDynamics(bp);
        v.balance = Math.max(0, Math.min(1, physSwing.balance / Math.max(0.001, longest))); // Ω-Φ4: Kopflastigkeit rel. Länge
        v.leverage = Math.max(0, Math.min(1, v.balance * v.bulk)); // Ω-Φ4: τ-Potenzial (Kopf weit + massiv)
        const physLoad = this._loadPath(bp);
        v.loadSound = physLoad.intact ? 1 : Math.max(0, 1 - physLoad.floatingFrac); // Ω-Φ5: Lastpfad zum Boden intakt
        v.rollable = this._rollableFraction(bp); // Ω-Φ2/L2: rollt am Boden (nicht „rund")
        return v;
    }

    // ROTATIONS-BEWUSSTE Welt-Hülle eines Parts: konservative AABB |R|·s auf Three.js' EXAKTER Euler-XYZ-
    // Matrix (makeRotationFromEuler-Zeilen), damit sie dem Renderer entspricht. Liefert {ex, ey, ez} =
    // volle Welt-Ausdehnung je Achse.
    _partWorldExtents(p) {
        const s = (p && p.size) || {};
        const sx = Math.abs(Number(s.x) || 0.3);
        const sy = Math.abs(Number(s.y) || 0.3);
        const sz = Math.abs(Number(s.z) || 0.3);
        const rot = p && p.rotation;
        if (!rot || (!rot.x && !rot.y && !rot.z)) return { ex: sx, ey: sy, ez: sz };
        const a = Math.cos(rot.x || 0);
        const b = Math.sin(rot.x || 0);
        const c = Math.cos(rot.y || 0);
        const d = Math.sin(rot.y || 0);
        const e = Math.cos(rot.z || 0);
        const f = Math.sin(rot.z || 0);
        const ae = a * e;
        const af = a * f;
        const be = b * e;
        const bf = b * f;
        // Zeilen von R (Three.js 'XYZ'): Welt-Extent_i = Σ_j |R[i][j]| · s_j.
        const ex = Math.abs(c * e) * sx + Math.abs(c * f) * sy + Math.abs(d) * sz;
        const ey = Math.abs(af + be * d) * sx + Math.abs(ae - bf * d) * sy + Math.abs(b * c) * sz;
        const ez = Math.abs(bf - ae * d) * sx + Math.abs(be + af * d) * sy + Math.abs(a * c) * sz;
        return { ex, ey, ez };
    }

    // §7.1 — die rotations-bewusste Welt-AABB (Kontakt-Wahrheit; min-Floor 0.1
    // je Achse wie _partBoundingBox, damit Mini-Parts greifbar bleiben).
    _partWorldAABB(part) {
        if (!part || typeof part !== "object") return null;
        const pos = part.position || { x: 0, y: 0, z: 0 };
        const ext = this._partWorldExtents(part);
        const hx = Math.max(0.1, ext.ex) / 2;
        const hy = Math.max(0.1, ext.ey) / 2;
        const hz = Math.max(0.1, ext.ez) / 2;
        return {
            min: { x: (pos.x || 0) - hx, y: (pos.y || 0) - hy, z: (pos.z || 0) - hz },
            max: { x: (pos.x || 0) + hx, y: (pos.y || 0) + hy, z: (pos.z || 0) + hz },
        };
    }

    // M3(a)/V18.155 — die vertikale Halb-Ausdehnung eines Parts, ROTATIONS-bewusst:
    // ein liegendes Wagen-Rad (rotation.z=π/2, size 0.62/0.14/0.62) ist vertikal 0.31 hoch.
    // §7.1 (V18.164) — verdichtet auf die EINE Hüllen-Quelle (_partWorldExtents).
    _partVerticalHalfExtent(p) {
        return this._partWorldExtents(p).ey / 2;
    }

    // M3(a)/V18.155 — die UNTERKANTE eines Bauplans (Bauplan-lokal): min über die
    // Parts von (pos.y − vertikale Halb-Ausdehnung). Die Boden-Klärung des Gefährts:
    // entry.y = Terrain − bottomY ⇒ die Rad-Unterkante berührt den Boden.
    _compoundBottomY(bp) {
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return 0;
        let min = Infinity;
        for (const p of bp.parts) {
            const y = ((p && p.position && p.position.y) || 0) - this._partVerticalHalfExtent(p);
            if (y < min) min = y;
        }
        return Number.isFinite(min) ? min : 0;
    }

    // U1 (resonanz-system.md §2.2) — die Standflächen-Spreizung als 0–1-Achse (Trag-Basis vs Säule): die
    // _isMoveable-Logik extrahiert — wie weit die unteren (Stütz-)Parts in der x-z-Ebene spreizen, relativ
    // zur Compound-Breite. Eine Säule (Stamm-Stapel) ~0; eine Trag-Basis (Räder/Beine/Fundament) spreizt.
    _compoundSpread(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < 2) return 0;
        const support = this._partsBelowMidline(bp, 0.5);
        if (support.length < 2) return 0;
        const bbox = this._compoundBBox(bp);
        if (!bbox) return 0;
        let sMinX = Infinity,
            sMaxX = -Infinity,
            sMinZ = Infinity,
            sMaxZ = -Infinity;
        for (const p of support) {
            const pos = p.position || { x: 0, y: 0, z: 0 };
            const px = pos.x || 0,
                pz = pos.z || 0;
            if (px < sMinX) sMinX = px;
            if (px > sMaxX) sMaxX = px;
            if (pz < sMinZ) sMinZ = pz;
            if (pz > sMaxZ) sMaxZ = pz;
        }
        const compW = Math.max(bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z, 0.001);
        return Math.max(0, Math.min(1, Math.max(sMaxX - sMinX, sMaxZ - sMinZ) / compW));
    }

    // ═══ Ω-PHYSIS · Ω-Φ1 — SCHWERPUNKT + MASSE ═══
    // Der EINE Richter für Stabilität · Balance · Hebel: jedes Teil = Punktmasse am Zentrum, gewichtet mit
    // Volumen·dichte. dichte ist [0,1]-normiert, kein kg/m³ → die Wahrheit ist RELATIV (vergleichend),
    // nie absolute Newton. Bau-/Edit-Zeit, vom Aufrufer gecacht — nicht pro Frame.
    _compoundCenterOfMass(bp) {
        const out = { com: { x: 0, y: 0, z: 0 }, mass: 0 };
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return out;
        const mats = this.state.materials || {};
        let mx = 0,
            my = 0,
            mz = 0,
            mass = 0;
        for (const p of bp.parts) {
            const s = p.size || { x: 1, y: 1, z: 1 };
            const vol = Math.abs((s.x || 1) * (s.y || 1) * (s.z || 1));
            const mat = mats[p.material];
            const dichte = mat && mat.tags && typeof mat.tags.dichte === "number" ? mat.tags.dichte : 0.5;
            // dichte-Floor 0.05: ein dichte-0-Material (Geist/Luft) hat trotzdem Form-
            // Masse > 0 (sonst kollabiert der CoM einer rein-leichten Struktur auf 0).
            const m = vol * Math.max(0.05, dichte);
            const pos = p.position || { x: 0, y: 0, z: 0 };
            mx += (pos.x || 0) * m;
            my += (pos.y || 0) * m;
            mz += (pos.z || 0) * m;
            mass += m;
        }
        if (mass <= 0) return out;
        out.com.x = mx / mass;
        out.com.y = my / mass;
        out.com.z = mz / mass;
        out.mass = mass;
        return out;
    }

    // ── Ω-PHYSIS · Geometrie-Helfer ──
    // Andrew's monotone chain: konvexe Hülle einer (x,z)-Punktwolke gegen den Uhrzeigersinn, O(n log n);
    // kollineare/Doppelpunkte werden geschluckt.
    _convexHull2D(points) {
        const pts = (points || []).slice().sort((a, b) => a.x - b.x || a.z - b.z);
        const n = pts.length;
        if (n < 3) return pts;
        const cross = (o, a, b) => (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x);
        const lower = [];
        for (let i = 0; i < n; i++) {
            while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pts[i]) <= 0)
                lower.pop();
            lower.push(pts[i]);
        }
        const upper = [];
        for (let i = n - 1; i >= 0; i--) {
            while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pts[i]) <= 0)
                upper.pop();
            upper.push(pts[i]);
        }
        lower.pop();
        upper.pop();
        return lower.concat(upper);
    }

    // Polygon-Fläche (Schnürsenkel-Formel, Betrag) + Schwerpunkt-im-Polygon-Test
    // + kürzester Abstand zu einer Kante. Die drei Bausteine des Stabilitäts-Richters.
    _polygonArea2D(poly) {
        let a = 0;
        for (let i = 0, n = poly.length; i < n; i++) {
            const p = poly[i],
                q = poly[(i + 1) % n];
            a += p.x * q.z - q.x * p.z;
        }
        return Math.abs(a) / 2;
    }
    _pointInPolygon2D(p, poly) {
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const a = poly[i],
                b = poly[j];
            if (a.z > p.z !== b.z > p.z && p.x < ((b.x - a.x) * (p.z - a.z)) / (b.z - a.z || 1e-9) + a.x)
                inside = !inside;
        }
        return inside;
    }
    _distToPolygonEdge2D(p, poly) {
        let best = Infinity;
        for (let i = 0, n = poly.length; i < n; i++) {
            const a = poly[i],
                b = poly[(i + 1) % n];
            const dx = b.x - a.x,
                dz = b.z - a.z;
            const len2 = dx * dx + dz * dz || 1e-9;
            let t = ((p.x - a.x) * dx + (p.z - a.z) * dz) / len2;
            t = Math.max(0, Math.min(1, t));
            const cx = a.x + t * dx,
                cz = a.z + t * dz;
            const d = Math.hypot(p.x - cx, p.z - cz);
            if (d < best) best = d;
        }
        return best;
    }

    // ═══ Ω-PHYSIS · Ω-Φ2 — STÜTZPOLYGON + STABILITÄT ═══
    // „Steht WIRKLICH" statt „Basis breit" (`_compoundSpread`): sitzt der Schwerpunkt über der konvexen
    // Hülle der Bodenkontakte? (ein breiter kopflastiger Turm kippt). Dasselbe Polygon beurteilt
    // Fahrzeug-Stabilität UND Kreatur-Stand (CoM über dem Fuß-Stützpolygon).
    _supportPolygon(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return null;
        let minBottom = Infinity,
            maxTop = -Infinity;
        const aabbs = [];
        for (const p of bp.parts) {
            const a = this._partWorldAABB(p);
            if (!a) continue;
            aabbs.push(a);
            if (a.min.y < minBottom) minBottom = a.min.y;
            if (a.max.y > maxTop) maxTop = a.max.y;
        }
        if (!aabbs.length) return null;
        const totalH = Math.max(0.001, maxTop - minBottom);
        const band = Math.max(0.1, totalH * AnazhRealm.PHYSIS.groundBandFrac);
        const pts = [];
        for (const a of aabbs) {
            if (a.min.y > minBottom + band) continue;
            pts.push({ x: a.min.x, z: a.min.z });
            pts.push({ x: a.max.x, z: a.min.z });
            pts.push({ x: a.max.x, z: a.max.z });
            pts.push({ x: a.min.x, z: a.max.z });
        }
        const hull = this._convexHull2D(pts);
        const area = hull.length >= 3 ? this._polygonArea2D(hull) : 0;
        return { hull, area, contactCount: pts.length / 4, minBottom, totalH };
    }
    _stability(bp) {
        const com = this._compoundCenterOfMass(bp);
        const poly = this._supportPolygon(bp);
        if (!poly || poly.hull.length < 3 || poly.area < 1e-4) {
            // entartete Basis (ein Punkt/eine Linie — ein einbeiniger Mast) → kippt
            return { inside: false, margin: 0, area: poly ? poly.area : 0, com: com.com, mass: com.mass };
        }
        const p = { x: com.com.x, z: com.com.z };
        const inside = this._pointInPolygon2D(p, poly.hull);
        const dEdge = this._distToPolygonEdge2D(p, poly.hull);
        // Static-Stability-Factor: tan(Kipp-Winkel) = horizontaler Abstand zur Kante / SCHWERPUNKT-HÖHE —
        // breiter flacher Tisch margin≈1, einbeiniger Mast margin≈0.
        const comHeight = Math.max(0.05, com.com.y - poly.minBottom);
        const margin = inside ? Math.max(0, Math.min(1, dEdge / comHeight)) : 0;
        return { inside, margin, comHeight, area: poly.area, com: com.com, mass: com.mass };
    }

    // ═══ Ω-PHYSIS · Ω-Φ3 — STEIFIGKEIT + VERSAGEN ═══
    // ZWEI Fragen: (a) Biegung — Flächenträgheitsmoment I = Σ A·y² (Material weg von der Achse zählt im
    // QUADRAT; trennt I-Profil von Stab); (b) Versagen — Knicken unter Last (die schlanke Säule unterm
    // Dach kippt nicht, knickt aber).
    _bendingStiffness(bp) {
        const empty = { Ix: 0, Iz: 0, Imin: 0, Imax: 0, anisotropy: 1, area: 0 };
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return empty;
        const items = [];
        let A = 0,
            cx = 0,
            cz = 0;
        for (const p of bp.parts) {
            const ext = this._partWorldExtents(p);
            const a = Math.max(1e-4, (ext.ex || 0) * (ext.ez || 0));
            const pos = p.position || { x: 0, z: 0 };
            items.push({ a, x: pos.x || 0, z: pos.z || 0, ex: ext.ex || 0, ez: ext.ez || 0 });
            A += a;
            cx += a * (pos.x || 0);
            cz += a * (pos.z || 0);
        }
        if (A <= 0) return empty;
        cx /= A;
        cz /= A;
        // I_z = Σ A·(x−cx)² + Eigenanteil A·ex²/12 (Biegung mit Durchbiegung in x);
        // I_x analog in z. Der Parallel-Achsen-Satz: Material weit von der Achse ²-gewichtet.
        let Ix = 0,
            Iz = 0;
        for (const it of items) {
            Iz += it.a * (it.x - cx) * (it.x - cx) + (it.a * it.ex * it.ex) / 12;
            Ix += it.a * (it.z - cz) * (it.z - cz) + (it.a * it.ez * it.ez) / 12;
        }
        const Imin = Math.min(Ix, Iz),
            Imax = Math.max(Ix, Iz);
        return { Ix, Iz, Imin, Imax, anisotropy: Imax / Math.max(1e-6, Imin), area: A };
    }
    // (b) VERSAGEN: das schlankste last-tragende vertikale Glied + Euler-Knicken; kritische Schlankheit
    // ∝ √(härte) (1:7-Säule hält, 1:25 knickt). Grob-Sanitäts-Richter, keine FEA.
    _failsUnderLoad(bp) {
        const out = { buckles: false, maxSlenderness: 0, criticalSlenderness: 0, slenderPart: -1 };
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return out;
        const mats = this.state.materials || {};
        let worst = 0,
            worstIdx = -1,
            worstCrit = Infinity;
        for (let i = 0; i < bp.parts.length; i++) {
            const p = bp.parts[i];
            const ext = this._partWorldExtents(p);
            const h = ext.ey || 0;
            const w = Math.max(0.02, Math.min(ext.ex || 0, ext.ez || 0));
            const wmax = Math.max(0.02, Math.max(ext.ex || 0, ext.ez || 0));
            if (h < w * 1.2) continue; // kein vertikales Glied (Platte/Klotz) → kein Knicken
            // Ein WAND-/Platten-Glied (eine horizontale Dimension ≫ die andere, > wallBraceRatio) ist KEINE freie
            // Euler-Säule — verstrebt durch Breite + Eck-Verbindungen, knickt nicht.
            if (wmax > w * AnazhRealm.PHYSIS.wallBraceRatio) continue;
            const slender = h / w;
            const härte = (mats[p.material] && mats[p.material].tags && mats[p.material].tags.härte) || 0.5;
            const crit = Math.max(
                AnazhRealm.PHYSIS.bucklingSlendernessMin,
                Math.min(
                    AnazhRealm.PHYSIS.bucklingSlendernessMax,
                    AnazhRealm.PHYSIS.bucklingSlendernessBase * Math.sqrt(Math.max(0.05, härte) / 0.5)
                )
            );
            if (slender > worst) {
                worst = slender;
                worstIdx = i;
                worstCrit = crit;
            }
        }
        out.maxSlenderness = worst;
        out.criticalSlenderness = Number.isFinite(worstCrit) ? worstCrit : 0;
        out.slenderPart = worstIdx;
        out.buckles = worst > 0 && worst > worstCrit;
        return out;
    }

    // ═══ Ω-PHYSIS · Ω-Φ4 — HEBEL + SCHWUNG-TRÄGHEIT ═══
    // „Balanciert" = gerechneter Balancepunkt relativ zum Griff: kopflastig schlägt hart, aber träge;
    // griffnah schnell, aber leichter.
    _inferGripPoint(bp, com) {
        const bbox = this._compoundBBox(bp);
        const c = (com && com.com) || { x: 0, y: 0, z: 0 };
        if (!bbox) return { x: c.x, y: c.y, z: c.z };
        const span = { x: bbox.max.x - bbox.min.x, y: bbox.max.y - bbox.min.y, z: bbox.max.z - bbox.min.z };
        const axis = span.y >= span.x && span.y >= span.z ? "y" : span.x >= span.z ? "x" : "z";
        const lo = bbox.min[axis],
            hi = bbox.max[axis];
        // der Griff ist das vom CoM ENTFERNTE Ende (das leichte Griff-Ende; der CoM
        // sitzt nah am schweren Kopf).
        const gripCoord = Math.abs(hi - c[axis]) > Math.abs(lo - c[axis]) ? hi : lo;
        const grip = { x: c.x, y: c.y, z: c.z };
        grip[axis] = gripCoord;
        return grip;
    }
    _swingDynamics(bp, gripPoint) {
        const com = this._compoundCenterOfMass(bp);
        const out = {
            balance: 0,
            swingInertia: 0,
            swingSpeed: 0,
            leverage: 0,
            mass: com.mass,
            com: com.com,
            grip: null,
        };
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length || com.mass <= 0) return out;
        const grip = gripPoint || this._inferGripPoint(bp, com);
        out.grip = grip;
        out.balance = Math.hypot(com.com.x - grip.x, com.com.y - grip.y, com.com.z - grip.z);
        const mats = this.state.materials || {};
        let I = 0;
        for (const p of bp.parts) {
            const s = p.size || { x: 1, y: 1, z: 1 };
            const vol = Math.abs((s.x || 1) * (s.y || 1) * (s.z || 1));
            const d = (mats[p.material] && mats[p.material].tags && mats[p.material].tags.dichte) || 0.5;
            const m = vol * Math.max(0.05, d);
            const pos = p.position || { x: 0, y: 0, z: 0 };
            I += m * ((pos.x - grip.x) ** 2 + (pos.y - grip.y) ** 2 + (pos.z - grip.z) ** 2);
        }
        out.swingInertia = I;
        out.swingSpeed = I > 1e-6 ? 1 / Math.sqrt(I) : 0; // ∝ 1/√I
        out.leverage = out.mass * out.balance; // τ-Potenzial: Kopf-Masse × Hebelarm
        return out;
    }

    // ═══ Ω-PHYSIS · Ω-Φ5 — LASTPFAD + KONNEKTIVITÄT ═══
    // Die Last muss den Boden erreichen: BFS über räumliche Adjazenz (AABB-Berührung) von den
    // Boden-Kontakten; schwebende Teile tragen 0. Eine Klinge mit Lücke schneidet nicht.
    _loadPath(bp) {
        // `floatingParts` = Indizes der schwebenden Teile (dieselbe `seen[]`-BFS) → die Werkstatt tintet sie
        // als Warnung. Additiv; intact/floatingFrac bleiben unberührt.
        const out = { intact: true, floatingFrac: 0, floatingCount: 0, groundCount: 0, floatingParts: [] };
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < 2) return out;
        const n = bp.parts.length;
        // Kosten-Wand: die Adjazenz ist O(n²). Ein sehr großer Bauplan (Baum 75+ Parts)
        // braucht den exakten Lastpfad nicht für die Rollen-Resonanz (er ist eindeutig
        // verbunden) — optimistisch intakt zurück (der Richter bleibt billig, §1).
        if (n > 120) return out;
        const aabb = bp.parts.map((p) => this._partWorldAABB(p));
        let minBottom = Infinity,
            maxTop = -Infinity;
        for (const a of aabb) {
            if (!a) continue;
            if (a.min.y < minBottom) minBottom = a.min.y;
            if (a.max.y > maxTop) maxTop = a.max.y;
        }
        const band = Math.max(0.12, (maxTop - minBottom) * 0.12);
        const adj = Array.from({ length: n }, () => []);
        const e = 0.06;
        const touch = (a, b) =>
            a.min.x <= b.max.x + e &&
            a.max.x >= b.min.x - e &&
            a.min.y <= b.max.y + e &&
            a.max.y >= b.min.y - e &&
            a.min.z <= b.max.z + e &&
            a.max.z >= b.min.z - e;
        for (let i = 0; i < n; i++)
            for (let j = i + 1; j < n; j++) {
                if (aabb[i] && aabb[j] && touch(aabb[i], aabb[j])) {
                    adj[i].push(j);
                    adj[j].push(i);
                }
            }
        const seen = new Array(n).fill(false);
        const q = [];
        for (let i = 0; i < n; i++) {
            if (aabb[i] && aabb[i].min.y <= minBottom + band) {
                seen[i] = true;
                q.push(i);
                out.groundCount++;
            }
        }
        while (q.length) {
            const i = q.pop();
            for (const j of adj[i]) if (!seen[j]) ((seen[j] = true), q.push(j));
        }
        const mats = this.state.materials || {};
        let total = 0,
            floating = 0;
        for (let i = 0; i < n; i++) {
            const p = bp.parts[i];
            const s = p.size || { x: 1, y: 1, z: 1 };
            const m =
                Math.abs((s.x || 1) * (s.y || 1) * (s.z || 1)) *
                Math.max(0.05, (mats[p.material] && mats[p.material].tags && mats[p.material].tags.dichte) || 0.5);
            total += m;
            if (!seen[i]) {
                floating += m;
                out.floatingCount++;
                out.floatingParts.push(i);
            }
        }
        out.floatingFrac = total > 0 ? floating / total : 0;
        out.intact = out.floatingFrac < 0.02;
        return out;
    }
    // Schneide-Kontinuität: die Parts entlang der Längsachse sortiert — sind die
    // aufeinanderfolgenden räumlich verbunden? Eine Lücke (Loch in der Schneide) senkt
    // die Kontinuität → die Klinge schneidet nicht (topologisch geprüft, kraft-begründet).
    _edgeContinuity(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < 2) return 1;
        const bbox = this._compoundBBox(bp);
        if (!bbox) return 1;
        const span = { x: bbox.max.x - bbox.min.x, y: bbox.max.y - bbox.min.y, z: bbox.max.z - bbox.min.z };
        const axis = span.x >= span.y && span.x >= span.z ? "x" : span.y >= span.z ? "y" : "z";
        const aabb = bp.parts.map((p) => this._partWorldAABB(p)).filter(Boolean);
        aabb.sort((a, b) => (a.min[axis] + a.max[axis]) / 2 - (b.min[axis] + b.max[axis]) / 2);
        let bridged = 0;
        const gaps = aabb.length - 1;
        const e = Math.max(0.05, span[axis] * 0.04);
        for (let i = 0; i < gaps; i++) {
            const a = aabb[i],
                b = aabb[i + 1];
            // berühren/überlappen sie entlang der Achse (mit kleiner Toleranz)?
            if (b.min[axis] <= a.max[axis] + e) bridged++;
        }
        return gaps > 0 ? bridged / gaps : 1;
    }
    // ROLL-PHYSIK: Anteil rollender Parts im Boden-Band — „Rad" emergiert aus der Roll-Geometrie am
    // Bodenkontakt, nicht aus Rundheit (ein Kuppel-Dach liegt nicht am Boden). Wagen → hoch, Tempel → 0.
    _rollableFraction(bp) {
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return 0;
        const aabb = bp.parts.map((p) => this._partWorldAABB(p));
        let minB = Infinity,
            maxT = -Infinity;
        for (const a of aabb) {
            if (!a) continue;
            if (a.min.y < minB) minB = a.min.y;
            if (a.max.y > maxT) maxT = a.max.y;
        }
        const band = Math.max(0.15, (maxT - minB) * 0.25);
        let roll = 0,
            ground = 0;
        for (let i = 0; i < bp.parts.length; i++) {
            const p = bp.parts[i],
                a = aabb[i];
            if (!a || a.min.y > minB + band) continue;
            ground++;
            // Kugel rollt immer; Zylinder NUR mit HORIZONTALER Achse — ein vertikaler ist Stamm/Säule (sonst läse
            // ein Baumstamm als Fahrzeug).
            if (p.shape === "sphere") roll++;
            else if ((p.shape === "cylinder" || p.shape === "spokeWheel") && this._cylinderWorldAxis(p) !== "y") roll++;
        }
        return ground > 0 ? Math.min(1, roll / ground) : 0;
    }

    // Größen-Faktor: die MASSE verstärkt die Wucht (MAX-aggregierte Tags sind größen-blind) — mehr
    // Schaden/Rückschlag/Verteidigung, aber TRÄGER. Liest Σ SUBSTANZ-Volumen gegen eine REF (sanfte
    // Potenz, gebounded, ~1.0 typisch), nicht das Hüll-Volumen — sonst bläst Teile-Spreizen die Stärke
    // auf; ein expliziter Hüll-Malus bestrafte mehrteilige Werke (Wagen) doppelt.
    _compoundSizeFactor(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return 1;
        let vol = 0;
        for (const p of bp.parts) {
            const s = p.size || {};
            vol += Math.abs((s.x || 0.3) * (s.y || 0.3) * (s.z || 0.3));
        }
        vol = Math.max(0.0001, vol);
        const ref = AnazhRealm.SIZE_STAT_REF_SUBSTANCE;
        const exp = AnazhRealm.SIZE_STAT_EXPONENT;
        const f = Math.pow(vol / ref, exp);
        const lo = AnazhRealm.SIZE_STAT_MIN;
        const hi = AnazhRealm.SIZE_STAT_MAX;
        return Math.max(lo, Math.min(hi, f));
    }

    // Intrinsische Rolle = ARGMAX der Resonanz des Produkt-Vektors gegen FORM_ROLE_SIGNATURES
    // (soul/portal/consumable/architecture) — kein first-match-bias. architecture ist eine positive
    // Signatur (dichte+harte Struktur); alles unter dem Floor → architecture.
    _computeFormRole(bp) {
        // Greifbare GERÄTE-Form → Waffe/Werkzeug, nicht Bauwerk: Klinge und Bauwerk sind Substanz-Zwillinge
        // (dicht+hart), nur die FORM trennt sie. Eng: nur spitz UND gestreckt; spitz+kompakt (Kristall-
        // Cluster) bleibt Bauwerk, stumpf+elongiert (Stab/Säule) den Form-Rollen.
        if (this._isGraspableBladeForm(bp)) return this._argmaxImplementRole(bp);
        // Sonst die Form-Rollen — bewusst konservativ (Welt-Strukturen → architecture). Sie lesen denselben
        // NORMALISIERTEN Produkt-Vektor wie Fit/Spektrum; nur die Signatur-GEWICHTE unterscheiden sich je
        // Leser. soul liest `livingBody` (toter Panzer ≠ Seele); portal braucht die Ring-FORM.
        const v = this._blueprintProductVector(bp);
        // Ψ1 — das EINE argmax-Organ liest; unter dem Floor bleibt der Default (architecture).
        return (
            this._resonateArgmax(v, AnazhRealm.FORM_ROLE_SIGNATURES, {
                floor: AnazhRealm.FORM_ROLE_RESONANCE_FLOOR,
            }).key || AnazhRealm.DEFAULT_BLUEPRINT_ROLE
        );
    }

    // U4 — die GERÄTE-Rolle aus der Form: argmax der NORMIERTEN Resonanz (raw/ref, damit die Signatur-Skalen
    // vergleichbar sind) unter weapon/tool — eine scharfe/spitze Klinge → Waffe, ein stumpfes/breites → Werkzeug.
    _argmaxImplementRole(bp) {
        const v = this._blueprintProductVector(bp);
        const cfg = AnazhRealm.QUALITY_ROLE_FIT;
        // Ψ1 — das EINE argmax-Organ auf dem weapon/tool-Subset (keys), raw/ref-normiert.
        return (
            this._resonateArgmax(v, AnazhRealm.ROLE_SIGNATURES, {
                keys: ["weapon", "tool"],
                refs: cfg.refs,
                refDefault: 3.0,
            }).key || "tool"
        );
    }

    // Setzt bp.role emergent; gerufen aus den Mutationen (addPart, updatePart, removePart, applyOpToPart).
    // setBlueprintAsArmor/setBlueprintAsConsumable etc. setzen bp.roleManual = true und sperren den Pfad.
    _refreshBlueprintRoleEmergent(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return;
        if (bp.builtIn) return; // Built-ins haben feste Rollen
        if (bp.roleManual) return; // manueller Override respektieren
        bp.role = this.computeBlueprintRole(bp);
    }

    // KATALYSATOR-OP aus der FORM: argmax-Resonanz des Produkt-Vektors gegen OP_CLASS_SIGNATURES
    // (scharf → schneiden, stumpf-dicht → schmieden, magie → wandeln). Formlos → subtractive.
    _computeToolOpFromForm(bp) {
        const fallback = { opClass: "subtractive", opName: AnazhRealm.OP_NAME_BY_CLASS.subtractive };
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return fallback;
        const v = this._blueprintProductVector(bp);
        // Ψ1 — das EINE argmax-Organ; floor 0 = die historische `bestScore <= 0 → fallback`-Wand.
        const r = this._resonateArgmax(v, AnazhRealm.OP_CLASS_SIGNATURES, { floor: 0 });
        if (!r.key) return fallback;
        return { opClass: r.key, opName: AnazhRealm.OP_NAME_BY_CLASS[r.key] || "carve" };
    }

    // Werkzeug-Meta: nur eigene Baupläne, whitelisted opClass, sanitized opName; in-place, idempotent.
    // Ohne opClass EMERGIERT die Op aus der Form (`_computeToolOpFromForm`); eine explizite opClass ist
    // der Override (einziger Weg zu additive/Misch-Werkzeugen).
    setBlueprintToolMeta(name, opName, opClass) {
        const bp = this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        let emergent = false;
        if (!opClass) {
            const derived = this._computeToolOpFromForm(bp);
            opClass = derived.opClass;
            if (!opName) opName = derived.opName;
            emergent = true;
        }
        if (!AnazhRealm.TOOL_OP_CLASSES.has(opClass)) {
            return { ok: false, reason: "invalid_op_class" };
        }
        const cleanOpName = String(opName || "").toLowerCase();
        if (!AnazhRealm.TOOL_OP_NAME_PATTERN.test(cleanOpName)) {
            return { ok: false, reason: "invalid_op_name" };
        }
        bp.role = "tool";
        // Welle 9a — manueller Role-Override (siehe setBlueprintAsArmor)
        bp.roleManual = true;
        bp.toolMeta = { opName: cleanOpName, opClass };
        return { ok: true, opName: cleanOpName, opClass, emergent };
    }

    // Registriert einen markierten Bauplan als Werkzeug in state.tools (Name = Bauplan-Name; Starter-Namen
    // sind geschützt). Der Cap ist ein SNAPSHOT der Bauplan-Präzision — nach Edits neu registrieren, damit
    // ein versehentlicher Edit ein besessenes Werkzeug nicht still ändert.
    registerBlueprintAsTool(name) {
        const bp = this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        // Maschinen = Werkzeuge mit role="machine" (+ precisionCap-Bonus); beide brauchen toolMeta (opClass +
        // opName).
        if ((bp.role !== "tool" && bp.role !== "machine") || !bp.toolMeta) {
            return { ok: false, reason: "not_marked_as_tool" };
        }
        const existing = this.state.tools[name];
        if (existing && existing.builtIn) {
            return { ok: false, reason: "starter_name_protected" };
        }
        let precisionCap = this.computeBlueprintPrecisionCap(bp);
        // Maschinen-Bonus: role "machine" hebt den precisionCap leicht über die Min-Regel (eine schiefe
        // Maschine schlägt die Hand gleicher Min-Präzision); gedeckelt auf 1.0.
        if (bp.role === "machine") {
            precisionCap = Math.min(1.0, precisionCap + AnazhRealm.MACHINE_PRECISION_BONUS);
        }
        this.state.tools[name] = {
            name,
            label: bp.label || name,
            opClass: bp.toolMeta.opClass,
            opName: bp.toolMeta.opName,
            precisionCap,
            isStarter: false,
            builtIn: false,
            sourceBlueprint: name,
            isMachine: bp.role === "machine",
        };
        if (!Array.isArray(this.state.player.tools)) this.state.player.tools = [];
        if (!this.state.player.tools.includes(name)) this.state.player.tools.push(name);
        if (typeof this._renderWorkshopDOM === "function") this._renderWorkshopDOM();
        return { ok: true, precisionCap };
    }

    _architectureBuilders() {
        // Builders kommen aus state.blueprints (EINE Quelle für Built-in + User). Seed ist ungenutzt
        // (Built-ins deterministisch), bleibt als Parameter für stabile Aufrufer.
        const map = {};
        const blueprints = this.state.blueprints || {};
        for (const name of Object.keys(blueprints)) {
            const bp = blueprints[name];
            // V18.260 — platzierte Strukturen durch den Render-Merge (wenige Meshes
            // statt ein Mesh pro Part); _buildArchMeshMerged fällt für nested/animate/
            // connections/kleine Baupläne automatisch auf _buildFromBlueprint zurück.
            map[name] = () => this._buildArchMeshMerged(bp);
        }
        return map;
    }

    // === Architektur-Instancing ===
    // Der Builder ignoriert den Seed (`() => _buildFromBlueprint(bp)`) → jeder Spawn eines Bauplans ist
    // geometrisch IDENTISCH, nur Position + Scale variieren. Darum Instancing statt Mesh je Part: geteilte
    // Geometrie+Material je (Bauplan, Leaf) + Per-Instance-Matrix (bit-gleich zu matrixWorld).
}
