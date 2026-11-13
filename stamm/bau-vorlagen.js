class AnazhRealm_bau_vorlagen {
    // ===== ATLAS · Bau/vorlagen — Default-Bücher: Baupläne · Materialien · Werkzeuge =====
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
            // Quarz-Kolben (durchsichtig) — sitzt auf dem Untersatz (bei y 1,2 schwebte er 0,1 m darüber: der Lastpfad brach)
            {
                shape: "sphere",
                material: "quarz",
                position: { x: 0, y: 1.1, z: 0 },
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

        // Klang-Portal (Lyra): Stein-Sockel, zwei Holz-Arme, Joch, drei Quarz-Saiten — die unsichtbare SUBSTANZ (Tags · Blocker ·
        // E-Trigger) unter der porta-Gestalt `lyra` (studioGestalt unten, w4-tore-teile: die Leier als Wort des Vokabulars).
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

        // Körperstudio-Portal (Nachlese-Welle) — DER VITRUV-RAHMEN: Stein-Sockel, zwei Holz-Pfosten, Quarz-Kreis — die unsichtbare
        // SUBSTANZ unter der porta-Gestalt `vitruv` (Kreis und Quadrat in Bronze, der Mensch als Relief im Scheitel).
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

        // Tetrapoda-Portal (Nachlese-Welle) — DAS TIER-TOR: vier Holz-Beine unter einem Rückgrat-Balken + Kopf-Kugel — die
        // unsichtbare SUBSTANZ unter der porta-Gestalt `tiertor` (der Bogen aus Knochen, im Scheitel der Schädel mit dem Geweih).
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
                    etikett: ["wesen.koerper", { name: def.etikett || def.label || key }],
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
                    etikett: ["wesen.koerper", { name: [cs.label] }],
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
                etikett: ["bau.felsformation"],
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
                etikett: ["bau.kristall-formation"],
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
            ["baum_eiche", "bau.eiche"],
            ["baum_kiefer", "bau.kiefer"],
            ["baum_birke", "bau.birke"],
            ["baum_erle", "bau.erle"],
            ["baum_buche", "bau.buche"],
            ["baum_tanne", "bau.tanne"],
            ["baum_mammut", "bau.mammutbaum"], // die Mammut-Nische des Wald-Generators (04.10., vorher als baum_buche)
        ];
        // DER WUCHS AM ERSTEN LESER (w16-lade-atem, ankunft.K5): die Gestalt einer Art wächst, wenn einer ihre Teile oder ihr
        // Skelett liest — nie im Konstruktor. Bis hier wuchsen alle sieben im Init-Task vor der ersten Zeichnung (headless kalt
        // `_defaultBlueprints` 118–260 ms Haupt-Faden, in der längsten Aufgabe des Boots), auch die, die keine Sitzung liest.
        // Der Wuchs ist derselbe Bit für Bit: fester kanonischer Seed und das Rausch-Feld des Konstruktors (`_growTreeNoise`,
        // gestellt wie bisher hier, vor jeder Welt — der Wuchs liest es, auch wenn die Welt ihr eigenes Feld schon trägt);
        // Instanz-Varianz im Worldgen über scale/yaw/tint. Der erste Leser schreibt `parts` und `_skeleton` als Werte zurück
        // (Material, Kette und Etikett wie jedes Built-in); ein Wuchs, der wirft oder keine Gestalt trägt, bricht laut.
        if (!this._growTreeNoise) {
            const worldSeed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
            this._growTreeNoise = new SimplexNoise(worldSeed + "-veg-grammatik");
        }
        const rausch = this._growTreeNoise;
        // die Arten, deren Wuchs noch auf seinen Leser wartet (Art → Same): die Saat bestellt ihr Skelett beim Wald-Faden, bevor
        // ihre Affinität sie liest (`_wuchsFehlt`) — der Haupt-Faden setzt dann nur noch zusammen
        const offen = (this._builtinWuchsOffen = new Map());
        const alsWert = (bp, k, value) =>
            Object.defineProperty(bp, k, { value, writable: true, enumerable: true, configurable: true });
        const wuchsAmLeser = (bp, species) => {
            let w = null;
            offen.set(species, `builtin-${species}-v1`);
            const wachse = () => {
                if (w) return w;
                offen.delete(species);
                const welt = this._growTreeNoise;
                this._growTreeNoise = rausch;
                let parts = null;
                try {
                    parts = this._growTreeBlueprintRich(species, `builtin-${species}-v1`); // das Skelett aus dem Vorrat, wenn bestellt
                } catch (e) {
                    this._bruchMelden(`BAUM-BUILTIN ${species}: der Wuchs warf (${(e && e.message) || e})`);
                } finally {
                    this._growTreeNoise = welt;
                }
                const sk = this._lastTreeSkeleton;
                this._lastTreeSkeleton = null; // der Seiten-Kanal des Wuchses
                if (!Array.isArray(parts) || parts.length < 2)
                    this._bruchMelden(`BAUM-BUILTIN ${species}: keine Gestalt (${parts ? parts.length : 0} Teile)`);
                if (!Array.isArray(parts)) parts = [];
                this._teileGrund(parts); // Material und Kette jedes Teils wie jedes Built-in (der Konstruktor)
                for (const p of parts) AnazhRealm._etikett(p); // der Name jedes Teils (`_etikett` geht den Wuchs nie)
                w = { parts, _skeleton: sk && Array.isArray(sk.branches) ? sk : null };
                for (const k in w) alsWert(bp, k, w[k]);
                return w;
            };
            for (const k of ["parts", "_skeleton"])
                Object.defineProperty(bp, k, {
                    get: () => wachse()[k],
                    set: (v) => {
                        wachse();
                        alsWert(bp, k, v);
                    },
                    enumerable: true,
                    configurable: true,
                });
            return bp;
        };
        for (const [species, label] of TREE_SPECIES) {
            if (!this._phytoArt(species)) continue;
            treeSpeciesBlueprints[species] = wuchsAmLeser(
                {
                    name: species,
                    etikett: [label],
                    builtIn: true,
                    instanced: true,
                    // KEIN roleManual-Pflaster: das geschärfte Seelen-Gesetz (livingBody liest
                    // lebendig NUR über beseelte Substanz, nicht holz+laub) lässt den Baum
                    // emergent auf architecture fallen — die Rolle wächst aus der Wahrheit.
                    _grownSpecies: species,
                    _isMerged: true,
                },
                species
            );
        }

        const defaults = {
            ...landmarkVariants,
            ...treeSpeciesBlueprints,
            waterfall: { name: "waterfall", etikett: ["bau.wasserfall"], builtIn: true, parts: waterfallParts },
            // `instanced: true` = Render-Absicht für Massen-Spawns (Wald/Kristallfeld) → HISM statt einer Group
            // je Spawn; einzeln platzierte Strukturen tragen es NICHT (Group-Pfad, Interaktion via entry.mesh).
            // stamm_gefallen: Sub-Spawn nach dem Baum (_vegetationSampleSpawn), nicht im Affinitäts-Wettstreit
            // (verdrängte sonst Bäume); tag-neutral (holz+cylinder).
            stamm_gefallen: {
                name: "stamm_gefallen",
                etikett: ["bau.gefallener-stamm"],
                builtIn: true,
                instanced: true,
                parts: stammGefallenParts,
            },
            stein_block: {
                name: "stein_block",
                etikett: ["bau.felsblock"],
                builtIn: true,
                parts: steinBlockParts,
            },
            kiesel: {
                name: "kiesel",
                etikett: ["bau.kiesel"],
                builtIn: true,
                instanced: true,
                parts: kieselParts,
            },
            // DIE FREIEN KÖRPER (physik.K3): EIN Teil, `frei` — der Löser (`_freiSchritt`) trägt sie, die Statik des Werks nicht.
            // Holz mit 3 cm Wand (`wand`): die Kiste 0,6 m wiegt 42 kg, das Fass ⌀ 0,6 × 0,9 m 45 kg (ρ 720 der Stoff-Zeile).
            kiste: {
                name: "kiste",
                etikett: ["bau.kiste"],
                builtIn: true,
                frei: true,
                parts: [
                    {
                        shape: "box",
                        material: "holz",
                        wand: 0.03,
                        size: { x: 0.6, y: 0.6, z: 0.6 },
                        position: { x: 0, y: 0.3, z: 0 },
                    },
                ],
            },
            fass: {
                name: "fass",
                etikett: ["bau.fass"],
                builtIn: true,
                frei: true,
                parts: [
                    {
                        shape: "cylinder",
                        material: "holz",
                        wand: 0.03,
                        segments: 16,
                        size: { x: 0.6, y: 0.9, z: 0.6 },
                        position: { x: 0, y: 0.45, z: 0 },
                    },
                ],
            },
            felsbrocken: {
                name: "felsbrocken",
                etikett: ["bau.felsbrocken"],
                builtIn: true,
                instanced: true,
                parts: felsbrockenParts,
            },
            // V9.64 (Welle A.1) — Damm-Bauplan, Vision-Pfeiler Wasser↔Wille
            damm: { name: "damm", etikett: ["bau.damm"], builtIn: true, parts: dammParts },
            kristall_geode: {
                name: "kristall_geode",
                etikett: ["bau.kristall-geode"],
                builtIn: true,
                instanced: true,
                parts: kristallGeodeParts,
            },
            glutbrunnen: {
                name: "glutbrunnen",
                etikett: ["bau.feuerstelle"],
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
                etikett: ["bau.ziehbrunnen"],
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
                etikett: ["bau.marktstand"],
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
                etikett: ["bau.laterne"],
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
                etikett: ["bau.wandlaterne"],
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
            // DER GRABSTEIN (die Breite der Stadt) — der Welt-Körper der Gräber des Friedhofs (fachwerk STADT_GRAMMATIK, das
            // Viertel kirchhof: `gegenstaende` des Exports), gehoben über denselben Chokepoint `_dorfErlebnis`. Die GESTALT baut
            // das Gesetzbuch (fachwerk AUSSTATTUNG `grabstein`: Sockel und Tafel, Kreuz oder Kopf); die Parts sind ihre Substanz
            // in ihren Maßen (die Tafel 0,56 × 0,92 × 0,14 m auf dem Sockel 0,72 × 0,1 × 0,32 m): stein dicht → solide.
            grabstein_dorf: {
                name: "grabstein_dorf",
                etikett: ["bau.grabstein"],
                builtIn: true,
                instanced: true,
                studioGestalt: "grabstein",
                parts: [
                    {
                        shape: "box",
                        material: "stein",
                        position: { x: 0, y: 0.05, z: 0 },
                        size: { x: 0.72, y: 0.1, z: 0.32 },
                    },
                    {
                        shape: "box",
                        material: "stein",
                        position: { x: 0, y: 0.56, z: 0 },
                        size: { x: 0.56, y: 0.92, z: 0.14 },
                    },
                ],
            },
            // W6.G P3 Phase 1 — Felsformationen (emergente Welt-Bürger)
            felsbogen: {
                name: "felsbogen",
                etikett: ["bau.felsbogen"],
                builtIn: true,
                instanced: true,
                parts: felsbogenParts,
            },
            felsturm: {
                name: "felsturm",
                etikett: ["bau.felsturm"],
                builtIn: true,
                instanced: true,
                parts: felsturmParts,
            },
            // Welt-Werkstätten: die bediente Domäne (forging/alchemy/textile/soulwork/mechanism) EMERGIERT aus der
            // Substanz (_computeWorkshopDomain), nicht aus einem Feld; `role` bleibt als Built-in-Saat deklariert.
            esse: {
                name: "esse",
                etikett: ["bau.esse"],
                builtIn: true,
                role: "workshop-station",
                roleManual: true,
                parts: this._stationVariant(esseParts, felsWorldSeed + "-esse"),
            },
            // V17.77 — die craftbare MEISTER-Esse (Eisen): eine bessere Werkstatt → höherer Präzisions-Cap.
            // Die „bessere Esse", die der Schöpfer suchte; sie lehrt das Prinzip (besseres Material → feiner).
            esse_meister: {
                name: "esse_meister",
                etikett: ["bau.meister-esse"],
                builtIn: true,
                role: "workshop-station",
                roleManual: true,
                parts: this._stationVariant(esseMeisterParts, felsWorldSeed + "-essemeister"),
            },
            brennkolben: {
                name: "brennkolben",
                etikett: ["bau.brennkolben"],
                builtIn: true,
                role: "workshop-station",
                roleManual: true,
                parts: this._stationVariant(brennkolbenParts, felsWorldSeed + "-brennkolben"),
            },
            webstuhl: {
                name: "webstuhl",
                etikett: ["bau.webstuhl"],
                builtIn: true,
                role: "workshop-station",
                roleManual: true,
                parts: this._stationVariant(webstuhlParts, felsWorldSeed + "-webstuhl"),
            },
            seelenstein_altar: {
                name: "seelenstein_altar",
                etikett: ["bau.seelenstein-altar"],
                builtIn: true,
                role: "workshop-station",
                roleManual: true,
                parts: this._stationVariant(seelenstein_altarParts, felsWorldSeed + "-altar"),
            },
            drehbank: {
                name: "drehbank",
                etikett: ["bau.drehbank"],
                builtIn: true,
                role: "workshop-station",
                roleManual: true,
                parts: this._stationVariant(drehbankParts, felsWorldSeed + "-drehbank"),
            },
            // Welt-Portal: Rolle "portal" (emergiert sonst aus einem magie-leitenden Ring, _isPortalShaped), hier
            // als Built-in deklariert; portalMeta nennt das Ziel (Skelett-Welt).
            welt_portal: {
                name: "welt_portal",
                etikett: ["bau.welt-portal"],
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
                etikett: [AnazhRealm.WORLD_REGISTRY.fluid.name], // ein Tor trägt den Namen seiner Welt
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
                etikett: [AnazhRealm.WORLD_REGISTRY.terrain.name],
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
                etikett: [AnazhRealm.WORLD_REGISTRY.garage.name],
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
                etikett: [AnazhRealm.WORLD_REGISTRY.portale.name],
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
                etikett: [AnazhRealm.WORLD_REGISTRY.schmiede.name],
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
                etikett: [AnazhRealm.WORLD_REGISTRY.fachwerk.name],
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
            // Host-Lofi liest Tempo + Skala). Die Render-Gestalt ist die porta-Leier (w4-tore-teile), die Parts bleiben Substanz.
            welt_klang: {
                name: "welt_klang",
                etikett: [AnazhRealm.WORLD_REGISTRY.klang.name],
                builtIn: true,
                role: "portal",
                roleManual: true,
                portalMeta: portalTo("klang"),
                studioGestalt: "lyra",
                parts: this._stationVariant(weltKlangParts, felsWorldSeed + "-portal8"),
            },
            // Körperstudio-Portal → Menschen-Labor (worlds/koerperstudio/); koerper-core.js ist die EINE
            // Gestalt-/Motion-Quelle, der Host bleibt der OFEN. Die Render-Gestalt ist das porta-Vitruv-Tor (w4-tore-teile).
            welt_koerperstudio: {
                name: "welt_koerperstudio",
                etikett: [AnazhRealm.WORLD_REGISTRY.koerperstudio.name],
                builtIn: true,
                role: "portal",
                roleManual: true,
                portalMeta: portalTo("koerperstudio"),
                studioGestalt: "vitruv",
                parts: this._stationVariant(weltKoerperParts, felsWorldSeed + "-portal9"),
            },
            // Tetrapoda-Portal → Kreaturen-Labor (worlds/tetrapoda/); tetrapoda-core.js ist die EINE
            // Gestalt-/Motion-Quelle. Die Render-Gestalt ist das porta-Tier-Tor (w4-tore-teile).
            welt_tetrapoda: {
                name: "welt_tetrapoda",
                etikett: [AnazhRealm.WORLD_REGISTRY.tetrapoda.name],
                builtIn: true,
                role: "portal",
                roleManual: true,
                portalMeta: portalTo("tetrapoda"),
                studioGestalt: "tiertor",
                parts: this._stationVariant(weltTetrapodaParts, felsWorldSeed + "-portal10"),
            },
            // BIBLIOTHEK: craftbare Beispiel-Baupläne der Mach-Akte. Rüstung + Trank sind die ehrliche Wand:
            // kein Lab exportiert Rüstungs-/Trank-Presets — nichts erfinden. Werkzeuge/Klingen = die
            // klinge_-Gattungen (Substanz in KIND_SUBSTANCE).
            ruestung_brustpanzer: {
                name: "ruestung_brustpanzer",
                etikett: ["bau.brustpanzer"],
                builtIn: true,
                role: "armor",
                roleManual: true,
                // T4 — das dedizierte RÜSTUNGS-Genom (Platten-Größe/Artikulation/Material),
                // nicht mehr scale+tint einer fixen Liste (§9 T4).
                parts: this._armorVariant(felsWorldSeed + "-armor"),
            },
            trank_lebenssaft: {
                name: "trank_lebenssaft",
                etikett: ["bau.lebenssaft"],
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
                etikett: ["bau.pferd"],
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
        for (const n in defaults) AnazhRealm._etikett(defaults[n]); // der Name liest seinen Schlüssel (spielgang.K5)
        return defaults;
    }

    // ### Materialien als Tag-Profile ###
    // 6 Built-ins von weich-organisch (leder, holz) über mineralisch (stein, eisen, bronze) bis kristallin
    // (quarz); mehr via DSL-Op `define_material`. Tag-Werte 0..1 = Potenzial; die Aktivierung je Form
    // macht FORM_TAG_ACTIVATION.
    //
    // DIE STOFF-ZEILE TRÄGT kg (physik K1): je Stoff die Dichte ρ in kg/m³ (SI) — die EINE Zahl, aus der jedes Ding wiegt und
    // im Wasser liegt (`_stoffRho`: Teile, Eigenwerke, Leiber, Wagen, Gefährte). Wo ein Gesetzbuch den Stoff wiegt, IST die
    // Zeile sein Eintrag: Holz und die Metalle der Schmiede (RHO.holz · MAT.stahl/eisen/bronze, ein Zugriff — wer die Zeile
    // ändert, ändert die Klinge, Labor = Welt), das Fleisch der Tiere aus ihrem Gewebe (tetrapoda MASSSTAB.dichteKgM3), der
    // Leib des Menschen samt der Luft seiner Lunge aus dem Körper-Kern (koerper LEIB.dichteKgM3), das Blech des Wagens aus der Hülle des Fahr-Kerns (FAHR.huelleDichte × FAHR.wasser.rho: der
    // Stoff-Mix, wenn die Kabine voll läuft). Die übrigen sind Tafel-Werte: Granit und Quarz 2 650, Leder 860, kompakter
    // Knochen 1 900, Keratin-Schuppen 1 300, Federkleid 50, Holzkohlen-Glut 400, Laub 300, Boden 1 500, Kraut 400, die Essenz
    // eine Flüssigkeit wie Wasser 1 000. Jede Änderung einer Zeile zählt den Stoff-Stand (`AnazhRealm._stoffStand`), an dem
    // die Gedächtnisse der Masse hängen. Die Tag-Achse `dichte` [0,1] bleibt Potenzial der Tag-Sprache (Rolle, Kampf-Stats)
    // und wiegt nichts.
    //
    // DIE STOFF-TAFEL IN SI (stoffe.K1): dieselbe Zeile trägt jede Zahl, die eine Wirkung des Stoffs liest — gelesen über den
    // EINEN Leser `_stoff` (ein eigener Stoff liest die Zeile seines nächsten Verwandten):
    //   rho      kg/m³ — Masse und Auftrieb (oben); das Wasser IST der Eintrag des Fahr-Kerns (FAHR.wasser.rho), an ihm liegt
    //            jeder Körper im Wasser (`_eintauchAnteil`)
    //   mu       Haftreibung eines Leibs (Sohle, Huf, Pfote) auf dem Stoff — der gestoßene Leib bremst auf den Beinen mit μ·g
    //            auf dem Stoff unter ihm (`_kreaturStossSchritt` über `_kontaktStoffAt`); null: eine Flüssigkeit trägt keinen
    //            Gleitenden
    //   c        J/(kg·K) — der Brennpunkt erwärmt den Stoff mit P / (ρ·V·c) (`_brennWaerme`), das Wasser sieht die Luft durch
    //            die Trägheit seiner Säule ρ·c·h / α (gelaende-core `wasserKoerper` über `_wasserStoff`): an ihr setzt das Eis ein
    //   tZuend   K — an ihr fängt der Stoff im Brennpunkt Feuer; null brennt nie
    //   tSchmelz K — der Gefrierpunkt des Süßwassers ist die Phasen-Grenze des Eises: an ihm setzt das Eis des Kerns ein
    //            (`eisDicke`, die Linien `_eisLinien`, die Fläche `_eisAt`); null zersetzt sich vor dem Schmelzen
    //   L, k     J/kg und W/(m·K), nur die Zeile eis — Schmelzwärme und Wärmeleitung: mit ρ wächst das Eis nach STEFAN
    //            (h²/2k + h/H = ∫Frost dt / ρL, gelaende-core `eisDicke`)
    //   brenn    das Brennstoff-Bett des Brands (stoffe.K2, `_brandTempo`), nur wo die Welt als Fläche brennt (gras, laub):
    //            sigma 1/m (Oberfläche je Volumen der Partikel), last kg/m² (die Trocken-Masse des vollen Betts, × lebendig des
    //            Orts), tiefe m, heiz J/kg (Heizwert), mx (die Erlöschungs-Feuchte) — die Brennstoff-Modelle von Anderson 1982:
    //            kurzes Gras (1) σ 3 500/ft, 0,034 lb/ft², Mx 12 % — die Tiefe ist die Halm-Höhe der Wiese (GRASS_BLADE_H, die
    //            der Wind beugt); Laub-Streu (9) σ 2 500/ft, 0,134 lb/ft², 0,2 ft, Mx 25 %; Heizwert 8 000 Btu/lb. Die Zünd-Wärme liest c und tZuend derselben Zeile, die Verdampfung L_v die Zeile wasser
    //   E        Pa — die Steifigkeit, aus der ein Treffer klingt (klang trefferPaar: das Band des Kontakts und, mit ρ, der Ton √(E/ρ)), die ein Glied vor dem Knicken trägt (`_failsUnderLoad`), und die
    //            HÄRTE, aus der die Ferse auf dem Stoff schlägt (klang SCHRITT: Band und Pegel des Hertz-Kontakts)
    //   eta      der Verlustfaktor η — die DÄMPFUNG, mit der der Stoff nachklingt (klang SCHRITT: τ = 1/(π·η·f), ein Korn mit Q = 1/η)
    //   koernung m — die KÖRNUNG eines losen Bodens (null: fest): die Dicke dessen, was unter dem Fuß zerdrückt wird (klang SCHRITT:
    //            das Band des Knisterns ∝ (E/ρ)^(2/5)/d, Hertz zweier Körner); der Schritt liest E, ρ, η und d derselben Zeile
    //            (`_schrittKlangParams`), keine Klang-Tafel daneben
    // Tafel-Werte (Engineering ToolBox, CRC Handbook): Granit c 790, T_schmelz 1 500 K; Holz c 1 700, Zündung 573 K; Eisen c 449,
    // 1 811 K; Bronze 380, 1 223 K; Stahl 490, 1 723 K; Quarz 740, 1 986 K; trockenes Laub, Gras und Kraut c 1 800, Zündung
    // 523–533 K; trockener Boden c 800; Wasser c 4 186, 273,15 K; Eis ρ 917, c 2 050, L 334 000, k 2,2, μ 0,05; Huf und Sohle auf trockenem Fels
    // und Gras μ 0,6 (Pferdehuf auf Beton 0,55–0,63), auf losem Laub 0,4.
    _defaultMaterials() {
        const sc = typeof globalThis !== "undefined" ? globalThis.__schmiedeCore : null;
        if (!sc || !sc.RHO || !sc.MAT || !sc.MAT.stahl) AnazhRealm._kernPflichtBruch("schmiede:RHO/MAT");
        const T = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
        const fleisch = T && T.MASSSTAB ? T.MASSSTAB.dichteKgM3 : NaN;
        if (!(fleisch > 0)) AnazhRealm._kernPflichtBruch("tetrapoda:MASSSTAB.dichteKgM3");
        const K = typeof globalThis !== "undefined" ? globalThis.__koerperCore : null;
        const leib = K && K.LEIB ? K.LEIB.dichteKgM3 : NaN;
        if (!(leib > 0)) AnazhRealm._kernPflichtBruch("koerper:LEIB.dichteKgM3");
        const FG = AnazhRealm._fahrGesetz();
        const im = (o, k) => ({ get: () => o[k], set: (v) => (o[k] = v) });
        // DIE PHYSIK DER ZEILE IST DAS STOFF-GESETZ (w28-stoff-gesetz, schmiede-core `STOFF_GESETZ`): Dichte, E-Modul, Streck- und
        // Bruchfestigkeit, Brechzahl und Abbe-Zahl, Wärme, Schmelze und Dämpfung jedes Stoffs sind EIN Zugriff auf seine Zeile
        // dort — Stahl, Eisen und Bronze folgen aus ihren Teilen (Eisen + Zementit, Kupfer + Zinn). Bis w28 standen ρ hier
        // (RHO, 17 Zahlen) und c, T_schmelz, E und η in der Tafel SI darunter (84 Zahlen), die Metalle lasen MAT der Schmiede.
        // Vier Dichten sind der Eintrag eines anderen Gesetzbuchs (`rhoVon` der Zeile), der Wirt verbindet sie (`verbinde`):
        const SG = sc.STOFF_GESETZ;
        if (!SG || !SG.zeile || !SG.SPALTEN || !SG.verbinde) AnazhRealm._kernPflichtBruch("schmiede:STOFF_GESETZ");
        const wert = (v) => ({ get: () => v, set: (n) => (v = n) });
        SG.verbinde("fleisch", wert(fleisch));
        SG.verbinde("leib", wert(leib));
        SG.verbinde("blech", wert(FG.huelleDichte * FG.wasserRho));
        SG.verbinde("wasser", im(globalThis.__vehicleCore.FAHR.wasser, "rho"));
        // DIE HAFTUNG DES RADS (fahrzeug.K1): je Stoff, auf dem ein Rad stehen kann, μ des Reifens trocken und voll nass (`muRad`,
        // `muRadNass`; Bezug der Asphalt des Labors, μ 1) — Tafel-Werte der Reibung Reifen auf Fahrbahn: verdichtete Erde
        // 0,7/0,45, Gras 0,4/0,2, rauer Fels 0,8/0,55, Bohle 0,65/0,4, Metall 0,6/0,35, Laubstreu 0,45/0,2. Leser: der Reibkreis am
        // Wagen (`_fahrHaft`). Die Stoffe der Leiber tragen keine — unter dem Rad liegt nie Fleisch —, und kraut, die Mahd im
        // Beutel, auch nicht: die Wiese unter Rad, Huf und Schritt ist EINE Zeile, gras. μ des Leibs (`mu`) und μ des Rads sind
        // zwei Paare (Huf auf Fels 0,6, Reifen auf Fels 0,8), je eine Spalte derselben Zeile.
        // DIE STEIFIGKEIT (halten.K2): E in Pa, der Elastizitäts-Modul — der Treffer klingt aus ihm (klang trefferPaar, Hertz: der
        // Kontakt zweier Stoffe ist so kurz, wie E* = 1/(1/E₁ + 1/E₂) es erlaubt). Die Zahl steht seit w28 in der
        // Zeile des Stoff-Gesetzes (schmiede-core; die Metalle folgen dort aus ihren Teilen), eine Flüssigkeit trägt ihren
        // Kompressions-Modul. Tafel-Werte (Engineering ToolBox): Granit 50 GPa, Eiche längs
        // 11 GPa, Quarzglas 72 GPa, Leder 0,2 GPa, kortikaler Knochen 18 GPa, Haut und Gewebe 1 MPa, Keratin (Federn, Schuppen)
        // 2,5 GPa, Holzkohle 3 GPa, Blatt und Halm 50 MPa, verdichteter Boden 50 MPa, Aluminium (die Hülle) 70 GPa, Wasser
        // (K) 2,2 GPa, Eis 9 GPa.
        // DIE DÄMPFUNG UND DIE KÖRNUNG (klang.K4, w26-klang-schritt): η der Verlustfaktor (Cremer, Heckl, Petersson,
        // Structure-Borne Sound, Tafel der Verlustfaktoren): Stahl 0,0001–0,0006, Messing und Bronze 0,001, Gusseisen 0,001–0,01,
        // Glas 0,0006–0,002, Beton und Mauerwerk 0,005–0,02, Eiche 0,008–0,01, Leder und Kork 0,1–0,17, trockener Sand 0,12–0,6,
        // Gewebe und Gummi 0,1–1; das Wasser schwingt in seinen Blasen (klang SUBSTANZ.wasser: β = 0,043·f0 + 0,0014·f0^1,5 bei
        // 1 kHz → η = β/(π·f0) ≈ 0,03). Die Körnung d: der Halm ein Zylinder der Dicke 4/σ, das Blatt eine Platte der Dicke 2/σ
        // (σ die Oberfläche je Volumen der Brennstoff-Modelle unten: Gras 0,35 mm, Laub 0,24 mm), die Krume des Bodens 2 mm, der
        // Stängel des Krauts 1 mm, die Brocken der Glut 3 mm, der Tropfen des Spritzers 3 mm; ein fester Stoff trägt keine.
        // prettier-ignore
        const SI = {
            //         μ     T_zünd  μ Rad  nass  d
            stein:    [0.6,  null,   0.8,   0.55, null],
            holz:     [0.6,  573,    0.65,  0.4,  null],
            eisen:    [0.5,  null,   0.6,   0.35, null],
            bronze:   [0.5,  null,   0.6,   0.35, null],
            stahl:    [0.5,  null,   0.6,   0.35, null],
            quarz:    [0.6,  null,   0.6,   0.35, null],
            leder:    [0.6,  573,    null,  null, null],
            knochen:  [0.5,  null,   null,  null, null],
            fleisch:  [0.5,  null,   null,  null, null],
            leib:     [0.5,  null,   null,  null, null],
            federn:   [0.4,  573,    null,  null, null],
            schuppen: [0.4,  null,   null,  null, null],
            glut:     [0.6,  623,    0.6,   0.45, 0.003],
            laub:     [0.4,  523,    0.45,  0.2,  0.000244],
            erde:     [0.6,  null,   0.7,   0.45, 0.002],
            kraut:    [0.4,  533,    null,  null, 0.001],
            essenz:   [null, null,   null,  null, 0.003],
            blech:    [0.5,  null,   0.6,   0.35, null],
            gras:     [0.6,  533,    0.4,   0.2,  0.000348],
            wasser:   [null, null,   null,  null, 0.003],
            eis:      [0.05, null,   null,  null, null],
        };
        // die Spalten L und k (oben): nur das Eis wächst im Kern; L_v des Wassers (2,257 MJ/kg) trocknet das Bett vor der Zündung
        const PHASE = { eis: { L: 334000, k: 2.2 }, wasser: { Lv: 2257000 } };
        // prettier-ignore
        const BRENN = {
            gras: { sigma: 11483, last: 0.166, tiefe: AnazhRealm.GRASS_BLADE_H, heiz: 18608000, mx: 0.12 },
            laub: { sigma: 8202, last: 0.654, tiefe: 0.061, heiz: 18608000, mx: 0.25 },
        };
        // DIE OPTIK DER ZEILE (material.K5): Rauheit (r184 `roughness`, α = r²) und Metall (0 | 1) stehen seit w28 in der Zeile des
        // Stoff-Gesetzes (die Spalte `rauheit`; `metall` folgt dort aus der Bindung) — die EINE Quelle jedes Stoffs,
        // der aus einer Zeile baut (`_stoffOptik` → `_buildPbrNodeMaterial`); eine Änderung wirkt sofort in jedem gebauten Stoff
        // (`_stoffOptikWirkt`). Wo eine gemessene BRDF die Klasse trägt, ist r die Form ihrer Spitze unter r184s GGX:
        // MERL (Matusik et al. 2003, 100 gemessene Stoffe), gelesen über die NBRDF-Netze von Sztrajman et al. 2021 (github
        // asztr/Neural-BRDF, data/merl_nbrdf.zip), bei θd 25° die Breite θ50 (Median der Spitzen-Energie über θh 0–20°) und
        // die Spitze ρ (mittlere BRDF in θh ≤ 1° je Spitzen-Energie, 1/sr) — beide frei von der Absolut-Skala der MERL-Daten
        // (ihr weißer Diffus-Ball trägt nur 0,30 Albedo). Eisen: black-oxidized-steel 11,09° / 8,2 → r 0,54 (10,73° / 6,8);
        // Bronze: alum-bronze 7,79° / 51 und brass 1,31° / 471 → r 0,25 (3,51° / 77); Stahl: steel, ss440, chrome-steel
        // 0,45–0,47° / 717–775 → r 0,09 (0,47° / 860); Quarz: black-obsidian 0,63° / 699 und aventurnine 1,45° / 437 →
        // r 0,135 (1,05° / 500); Blech (Lack ohne Klarlack): blue-, gold-, green-, silver-metallic-paint(2) 7,87–9,49° /
        // 10–13,3 → r 0,44 (8,77° / 11). Ohne Exemplar (MERL kennt kein rohes Holz, keinen rauen Fels, kein Leder) gilt die
        // Zahl, die die Tags bis material.K5 herleiteten. Das Soll der Kugel-Bühne (die Bänder je Klasse) trägt ihre Station.
        // DIE ANTWORT AUF DAS ALTER (stoffe.K4, `_werkAlter` → `_alterKern`): je Stoff, der verwittert, seine SCHICHTEN — je
        // Schicht das Ziel der Fläche (lineare Albedo), die Tage, in denen Zeit und Nässe-Dosis sie 63 % dorthin tragen (null: die
        // Achse wirkt nicht), und die Lage, an der sie wächst (die Exposition, `_alterLage`: frei · nord · oben · lauf). Holz
        // vergraut zum Silber (Licht und Regen bauen das Lignin der Oberfläche ab — USDA Wood Handbook 2021 Kap. 16: bewittertes
        // Holz in einem Jahr silbergrau, sRGB 0x6b665e) an jeder freien Fläche; Eisen rostet NUR nass (die Oxidation braucht den
        // Wasserfilm; Rost FeO(OH) ockerbraun sRGB 0x8c5426, Farbton 25°) an jeder freien Fläche; Stein trägt das Leben des
        // Fels-Gesetzes (gelaende-core `FELS`, die EINE Farbe jedes Bewuchses): das Moos nur nass und nur an der Nordseite
        // (schattig, lange nass), die Krustenflechte OBEN (sie lebt vom Tau, wächst auch trocken — langsam, im Regen schneller; die
        // Dachflechte alter Ziegel und Mauerkronen), die Algen im REGEN-LAUF (der Grünbelag, den das ablaufende Wasser auf der
        // senkrechten Fläche nährt: je länger der Lauf über der Ecke, desto mehr, auf der Wetterseite voll — nur nass). Leser: das
        // Bau-Teil der Welt (`_werkAlterFaerbe`) und jeder gesetzte Bau im Satz seines Stoffs (`_satzAlter`: die Seh-Klasse des
        // Studio-Stoffs nennt die Zeile, `WERK_ALTER.seh`); ein eigener Stoff altert wie sein Verwandter (`_stoff`).
        const FELS = globalThis.__gelaendeCore && globalThis.__gelaendeCore.FELS;
        if (!FELS || !FELS.moos || !FELS.flechte) AnazhRealm._kernPflichtBruch("gelaende:FELS.moos/flechte");
        const MOOS = FELS.moos;
        const lin = (h) =>
            [16, 8, 0].map((k) => {
                const c = ((h >> k) & 0xff) / 255;
                return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            });
        // prettier-ignore
        const ALTER = {
            holz: [{ ziel: lin(0x6b665e), zeitTage: 200, nassTage: 40, lage: "frei" }],
            eisen: [{ ziel: lin(0x8c5426), zeitTage: null, nassTage: 10, lage: "frei" }],
            stein: [
                { ziel: MOOS.slice(0, 3), zeitTage: null, nassTage: 40, lage: "nord" },
                { ziel: FELS.flechte.slice(0, 3), zeitTage: 300, nassTage: 60, lage: "oben" },
                { ziel: MOOS.slice(0, 3), zeitTage: null, nassTage: 60, lage: "lauf" },
            ],
        };
        const welt = this;
        // Stahl, Blech und Leib sind Stoffe der Körper (die Klinge der Schmiede, die Hülle des Wagens, der Mensch), Gras, Wasser
        // und Eis Stoffe der Welt, keine Bau-Stoffe: die Welt hat keine Quelle, aus der man sie sammelt, die Werkstatt bietet sie
        // nicht an (`bauStoff`).
        const keinBauStoff = ["stahl", "blech", "leib", "gras", "wasser", "eis"];
        const make = (name, label, color, tags) => {
            const si = SI[name];
            const g = SG.zeile(name);
            if (!si || !(g.eta > 0))
                AnazhRealm._kernPflichtBruch("STOFF-TAFEL " + name + ": Wirkungs-Spalten und Dämpfung η");
            const z = {
                name,
                etikett: [label],
                builtIn: true,
                color,
                tags: { ...AnazhRealm.MATERIAL_TAG_DEFAULTS, ...tags },
                mu: si[0],
                tZuend: si[1],
                muRad: si[2],
                muRadNass: si[3],
                koernung: si[4],
                bindung: g.bindung,
                ...PHASE[name],
                brenn: BRENN[name] ? Object.freeze(BRENN[name]) : null,
            };
            // die Spalten des Gesetzes: je ein Zugriff auf die Zeile im Kern (wer sie ändert, ändert Klinge, Treffer, Schritt,
            // Knick-Last, Brennpunkt und Spiegel); die Dichte zählt den Stoff-Stand, an dem die Gedächtnisse der Masse hängen
            for (const k of SG.SPALTEN) {
                const q = im(g, k);
                Object.defineProperty(z, k, {
                    enumerable: true,
                    get: q.get,
                    set: (v) => {
                        q.set(v === null ? null : +v);
                        if (k === "rho") AnazhRealm._stoffStand = (AnazhRealm._stoffStand || 0) + 1;
                        if ((k === "n" || k === "abbe" || k === "rho") && (name === "wasser" || name === "eis"))
                            welt._wasserOptikWirkt();
                        if (k === "rauheit") welt._stoffOptikWirkt(name);
                    },
                });
            }
            if (!(z.rho > 0)) throw new Error("STOFF-ZEILE ohne Dichte: " + name);
            // DIE SCHALLGESCHWINDIGKEIT folgt aus der Zeile (√(E/ρ), m/s): der Ton eines Treffers liest sie (klang trefferPaar)
            Object.defineProperty(z, "schall", { enumerable: true, get: () => g.schall });
            if (keinBauStoff.includes(name)) z.bauStoff = false;
            if (ALTER[name])
                z.alter = Object.freeze(
                    ALTER[name].map((s) => Object.freeze(Object.assign({}, s, { ziel: Object.freeze(s.ziel) })))
                );
            if (!Number.isFinite(g.rauheit))
                AnazhRealm._kernPflichtBruch("STOFF-TAFEL " + name + ": die Optik (Rauheit)");
            Object.defineProperty(z, "metall", {
                enumerable: true,
                get: () => g.metall,
                set: (v) => {
                    g.metall = v;
                    welt._stoffOptikWirkt(name);
                },
            });
            return z;
        };
        const list = [
            make("stein", "stoff.stein", 0x7a7a7a, {
                härte: 0.65,
                dichte: 0.85,
                zähigkeit: 0.3,
                wärmeleitung: 0.25,
                resoniert: 0.3,
            }),
            make("holz", "stoff.holz", 0x5e3a1c, {
                härte: 0.2,
                dichte: 0.4,
                zähigkeit: 0.6,
                wärmeleitung: 0.15,
                magieleitung: 0.3,
                brennbar: 0.8,
                resoniert: 0.5,
                lebendig: 0.7,
            }),
            make("eisen", "stoff.eisen", 0x484850, {
                härte: 0.75,
                dichte: 0.9,
                zähigkeit: 0.65,
                wärmeleitung: 0.7,
                stromleitung: 0.85,
                resoniert: 0.6,
            }),
            make("bronze", "stoff.bronze", 0xa97b3c, {
                härte: 0.55,
                dichte: 0.88,
                zähigkeit: 0.7,
                wärmeleitung: 0.75,
                stromleitung: 0.7,
                magieleitung: 0.25,
                resoniert: 0.75,
            }),
            // stahl: die Klingen der Schmiede (MAT.stahl) — härter und spröder als Eisen.
            make("stahl", "stoff.stahl", 0x6d7179, {
                härte: 0.85,
                dichte: 0.9,
                zähigkeit: 0.55,
                wärmeleitung: 0.6,
                stromleitung: 0.8,
                resoniert: 0.7,
            }),
            make("quarz", "stoff.quarz", 0xcce6f5, {
                härte: 0.7,
                dichte: 0.65,
                zähigkeit: 0.15,
                magieleitung: 0.85,
                transparent: 0.95,
                resoniert: 0.9,
            }),
            make("leder", "stoff.leder", 0xa07050, {
                härte: 0.15,
                dichte: 0.35,
                zähigkeit: 0.75,
                magieleitung: 0.2,
                brennbar: 0.7,
                lebendig: 0.3,
            }),
            // Körper-Materialien: lebendig=1 markiert sie körper-fähig; sonst dieselbe MATERIAL_TAG_KEYS-Sprache
            // (auch für Bauwerke nutzbar).
            make("knochen", "stoff.knochen", 0xe8dfc4, {
                härte: 0.8,
                dichte: 0.6,
                zähigkeit: 0.5,
                resoniert: 0.4,
                lebendig: 1.0,
            }),
            make("fleisch", "stoff.fleisch", 0xb55050, {
                härte: 0.15,
                dichte: 0.4,
                zähigkeit: 0.75,
                wärmeleitung: 0.45,
                brennbar: 0.35,
                lebendig: 1.0,
            }),
            // leib: der Leib des Menschen (Gewebe samt der Luft der Lunge) — wie das Fleisch, knapp leichter als Wasser.
            make("leib", "stoff.leib", 0xc98f73, {
                härte: 0.15,
                dichte: 0.4,
                zähigkeit: 0.75,
                wärmeleitung: 0.45,
                brennbar: 0.35,
                lebendig: 1.0,
            }),
            make("federn", "stoff.federn", 0xf2c870, {
                härte: 0.1,
                dichte: 0.1,
                zähigkeit: 0.3,
                wärmeleitung: 0.7,
                magieleitung: 0.55,
                brennbar: 0.7,
                resoniert: 0.5,
                lebendig: 1.0,
            }),
            make("schuppen", "stoff.schuppen", 0x355c3a, {
                härte: 0.9,
                dichte: 0.85,
                zähigkeit: 0.8,
                wärmeleitung: 0.55,
                stromleitung: 0.3,
                magieleitung: 0.45,
                resoniert: 0.45,
                lebendig: 1.0,
            }),
            make("glut", "stoff.glut", 0xff5a14, {
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
            make("laub", "stoff.laub", 0x2b5e2c, {
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
            make("erde", "stoff.erde", 0x6e5038, {
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
            make("kraut", "stoff.kraut", 0x4e9a3c, {
                härte: 0.05,
                dichte: 0.08,
                zähigkeit: 0.3,
                wärmeleitung: 0.1,
                magieleitung: 0.3,
                brennbar: 0.7,
                resoniert: 0.35,
                lebendig: 1.0,
            }),
            make("essenz", "stoff.essenz", 0x9fd8ff, {
                härte: 0.02,
                dichte: 0.05,
                zähigkeit: 0.1,
                magieleitung: 0.95,
                transparent: 0.8,
                resoniert: 0.8,
                lebendig: 0.6,
            }),
            // blech: die Hülle des Wagens (Stahl, Aluminium, Kunststoff, Gummi, Glas, Fluide — der Mix des Fahr-Kerns).
            make("blech", "stoff.blech", 0x8c9196, {
                härte: 0.5,
                dichte: 0.75,
                zähigkeit: 0.7,
                wärmeleitung: 0.6,
                stromleitung: 0.8,
                resoniert: 0.65,
            }),
            // DIE STOFFE DER WELT (stoffe.K1): das Gras der Wiese (der Boden, wo die Boden-Karte Wiese zeichnet), das Wasser
            // der EINEN Wasser-Wahrheit und seine feste Phase, das Eis.
            make("gras", "stoff.gras", 0x4f8f2f, {
                härte: 0.05,
                dichte: 0.08,
                zähigkeit: 0.3,
                wärmeleitung: 0.1,
                brennbar: 0.75,
                resoniert: 0.3,
                lebendig: 1.0,
            }),
            make("wasser", "stoff.wasser", 0x2a5d7a, {
                dichte: 0.25,
                wärmeleitung: 0.6,
                magieleitung: 0.3,
                transparent: 0.9,
                lebendig: 0.2,
            }),
            make("eis", "stoff.eis", 0xcfe6f0, {
                härte: 0.4,
                dichte: 0.55,
                zähigkeit: 0.2,
                wärmeleitung: 0.5,
                transparent: 0.7,
                resoniert: 0.5,
            }),
        ];
        const out = {};
        for (const m of list) out[m.name] = AnazhRealm._etikett(m);
        return out;
    }

    // ### Werkzeuge + opChain + Präzision ###
    // Werkzeuge sind Datensätze: das Werkzeug bringt den Cap mit, keine hardcoded Op-Tabelle.
    _defaultTools() {
        // Generisch (domain=null) ist nur `hände` → Default-Rolle "architecture", wenn keine domain-Werkzeuge
        // in der opChain stecken. Domain-Werkzeuge bestimmen via _refreshBlueprintRoleEmergent die Rolle.
        const list = [
            {
                name: "hände",
                etikett: ["werk.werkzeug.haende"],
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
                etikett: ["werk.werkzeug.schmiede-hammer"],
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
                etikett: ["werk.werkzeug.moerser"],
                opClass: "additive",
                opName: "brew",
                precisionCap: 0.7,
                domain: "alchemy",
                isStarter: false,
                builtIn: true,
            },
            {
                name: "webstuhl-schiffchen",
                etikett: ["werk.werkzeug.webstuhl-schiffchen"],
                opClass: "additive",
                opName: "weave",
                precisionCap: 0.7,
                domain: "textile",
                isStarter: false,
                builtIn: true,
            },
            {
                name: "ritueller-stab",
                etikett: ["werk.werkzeug.ritueller-stab"],
                opClass: "phaseChange",
                opName: "imbue",
                precisionCap: 0.85,
                domain: "soulwork",
                isStarter: false,
                builtIn: true,
            },
            {
                name: "drehbank-meißel",
                etikett: ["werk.werkzeug.drehbank-meissel"],
                opClass: "subtractive",
                opName: "turn",
                precisionCap: 0.9,
                domain: "mechanism",
                isStarter: false,
                builtIn: true,
            },
        ];
        const out = {};
        for (const t of list) out[t.name] = AnazhRealm._etikett(t);
        return out;
    }

    // DAS GESETZ DER NAMEN (spielgang.K5): ein eingebautes Buch (Baupläne, Stoffe, Werkzeuge, Seelen) trägt den Schlüssel seiner
    // Zeile der Sprach-Tafel (`bau.…`, `stoff.…`, `werk.…`, `wesen.…`) und sein `label` den Namen in der Sprache des Spielers —
    // die Built-ins entstehen je Boot und werden nie gespeichert, so liest jeder Leser des Felds (Anzeige, Suche, KI, Tagebuch)
    // die EINE Zeile. Ein Name, den der SPIELER selbst vergab (eigener Bauplan, eigener Stoff, Import), bleibt, wie er
    // geschrieben wurde: der Leser zeigt die eingebaute Zeile, wenn es eine gibt, sonst den Namen des Spielers.
    _stoffName(id) {
        const m = this.state.materials && this.state.materials[id];
        return (m && m.label) || String(id);
    }

    // die Menge je Stoff („3× Holz“) in EINER Zeile, getrennt durch `trenner` — Leser: jede Kosten-, Fehlt- und Beute-Zeile
    _kostenText(menge, trenner = " · ") {
        return Object.entries(menge || {})
            .map(([m, n]) => this._t("stoff.menge", { n, stoff: this._stoffName(m) }))
            .join(trenner);
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_bau_vorlagen]);

// ===== ATLAS · Bau/vorlagen — Außen-Konstanten =====
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
// Der EINE Kampf-Koeffizienten-Leser: hpMax/damage/knockback/defense aus PRESETS.mensch.fx.kampf,
// Formel base + dichte-Tag·dichte + härte-Tag·haerte. Fail-closed.
AnazhRealm._kampfKoeff = function (stat) {
    const row = AnazhRealm.Gesetz("koerper:kampf." + stat, null);
    if (row && Number.isFinite(row.base) && Number.isFinite(row.dichte) && Number.isFinite(row.haerte)) return row;
    return AnazhRealm._kernPflichtBruch("koerper:kampf." + stat);
};
// wahrerwuchs §4.2-4.4 S3+S4 — die Zahl der Genom-gewürfelten Landmark-Formationen
// (Fels: Brocken/Stapel/Nadel/Geröll · Kristall: Einzel/Cluster/Geode/Druse), die der Scatter NACH dem
// Affinitäts-Sieg wählt. Die Glut streut ohne Pool: ihre Gestalten trägt das Gesetzbuch (fachwerk `feuerstelle`).
AnazhRealm.ROCK_VARIANTS = 12;
AnazhRealm.CRYSTAL_VARIANTS = 8;

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
// HSL-Spannweite je Architektur-Instanz (seed-deterministisch aus entry.tintH/S/V;
// HISM-instanceColor): ±8 % Hue (kühles bis warmes Grün, nie grell), ±10 % Sättigung, ±6 % Helligkeit.
AnazhRealm.INSTANCE_TINT = Object.freeze({ rangeH: 0.08, rangeS: 0.1, rangeV: 0.06 });
AnazhRealm.MATERIAL_TAG_DEFAULTS = Object.freeze(
    AnazhRealm.MATERIAL_TAG_KEYS.reduce((acc, key) => {
        acc[key] = 0;
        return acc;
    }, {})
);
AnazhRealm.CONNECTION_SOLID_THRESHOLD = 0.7;
AnazhRealm.AXIS_CLASS_LABEL = Object.freeze({ physik: "gerechnet", konvention: "Welt-Konvention", form: "Form" });
// Der Name aus einer Namens-Tafel (Rollen, Achsen, Domänen, Affordanzen, Verben — ihre Werte sind Schlüssel der Sprach-Tafel,
// spielgang.K5): die eingebaute Zeile, sonst die rohe id (eine fremde Rolle, eine Achse aus einer anderen Welt).
AnazhRealm._tafelName = function (tafel, id) {
    return tafel && tafel[id] ? AnazhRealm._t(tafel[id]) : String(id);
};
// der Name einer Rolle: die Lesart des Katalysators (`ROLE_LABELS`), sonst die des Bauplans (`BLUEPRINT_ROLE_LABELS`)
AnazhRealm._rolleName = function (rolle) {
    return AnazhRealm._tafelName(
        AnazhRealm.ROLE_LABELS[rolle] ? AnazhRealm.ROLE_LABELS : AnazhRealm.BLUEPRINT_ROLE_LABELS,
        rolle
    );
};
// Der Kopf eines Namens („Meister-Esse (Eisen)“ → „Meister-Esse“, „Porta — Ordnungen …“ → „Porta“): in der Linsen-Sprache
// (pseudo) schließt er die Klammer der Tafel wieder, die der Schnitt abtrennte.
AnazhRealm._namensKopf = function (name, schnitt = /\s[·—(]/) {
    const kopf = String(name).split(schnitt)[0];
    return kopf.includes("⟦") && !kopf.endsWith("⟧") ? kopf + "⟧" : kopf;
};
