class AnazhRealm_Z03b {
    // ===== ATLAS §03b · MULTI-USER-MESH — Block Feld =====
    // ### Chat → DSL ###
    // Regelbasierter Parser: welt-betreffende Befehle laufen durch dieselbe DSL wie der Nexus (Budget,
    // Outcome-Log, persistenz-fähig). System-Befehle (speichere/lade, Toggles, Debug) leben in
    // chatSystemPatterns.
    get chatDslPatterns() {
        if (this._chatDslPatternsCache) return this._chatDslPatternsCache;
        const num = (s, fallback) => {
            const n = parseFloat(s);
            return Number.isFinite(n) ? n : fallback;
        };
        this._chatDslPatternsCache = [
            {
                example: "setze wetter rainy",
                // D5a (V18.128) — das Vokabular wächst mit der WEATHER_INTENSITY-
                // Tabelle; deutsche Worte normalisieren auf die kanonischen. Das Wort des Spielers steht, bis er es
                // freigibt: „setze wetter frei" (oder „wechselhaft") lässt den Wetter-Zug wieder ziehen.
                re: /^setze\s+wetter\s+(sunny|rainy|stormy|sturm|stürmisch|sonnig|sonne|regen|regnerisch|frei|wechselhaft)\s*$/i,
                build: (m) => {
                    const raw = m[1].toLowerCase();
                    const map = {
                        sturm: "stormy",
                        stürmisch: "stormy",
                        sonnig: "sunny",
                        sonne: "sunny",
                        regen: "rainy",
                        regnerisch: "rainy",
                        wechselhaft: "frei",
                    };
                    const word = map[raw] || raw;
                    return {
                        program: ["weather", word],
                        describe:
                            word === "frei"
                                ? "Wetter frei: es zieht wieder mit der Welt"
                                : `Wetter gesetzt auf ${word} — es bleibt, bis du „setze wetter frei" sagst`,
                    };
                },
            },
            {
                // Sonde/Abnahme: Nacht macht Feld-Beweis schwarz — Mittag erzwingen.
                example: "setze uhrzeit mittag",
                re: /^setze\s+(?:uhrzeit|zeit)\s+(mittag|mitternacht|morgen|abend|sonnenaufgang|sonnenuntergang|0(?:\.\d+)?|1(?:\.0+)?)\s*$/i,
                build: (m) => {
                    const raw = m[1].toLowerCase();
                    const map = {
                        mitternacht: 0,
                        sonnenaufgang: 0.25,
                        morgen: 0.3,
                        mittag: 0.5,
                        abend: 0.7,
                        sonnenuntergang: 0.75,
                    };
                    const t = map[raw] !== undefined ? map[raw] : Math.max(0, Math.min(1, parseFloat(raw)));
                    return {
                        program: ["set_time_of_day", t],
                        describe: `Uhrzeit gesetzt: ${raw} (${t})`,
                    };
                },
            },
            {
                // Position zur Build-Zeit einbetten — sonst spawnt der Empfänger die Kreaturen an SEINER Position.
                // Kein Seed: Kreaturen bewegen sich ohnehin selbst, Seed-Variation ist akzeptabel.
                example: "spawne kreaturen 10",
                re: /^spawne\s+kreaturen\s+(\d+)\s*$/i,
                build: (m) => {
                    const count = Math.max(1, Math.min(20, parseInt(m[1], 10) || 1));
                    const p = this.state.playerMesh ? this.state.playerMesh.position : this._defaultSpawnPos();
                    return {
                        program: ["repeat", count, ["spawn_creature", ["at", p.x, p.y, p.z], 1, "happy"]],
                        describe: `${count} Kreaturen gespawnt (am Spieler)`,
                    };
                },
            },
            {
                example: "ändere sternenhimmel red",
                re: /^(?:ändere|aendere)\s+sternenhimmel\s+(\S+)\s*$/i,
                build: (m) => ({
                    program: ["skybox_color", m[1]],
                    describe: `Sternenhimmel-Farbe gesetzt: ${m[1]}`,
                }),
            },
            {
                example: "setze terrain steilheit 0.8",
                re: /^setze\s+terrain\s+steilheit\s+(-?\d+(?:\.\d+)?)\s*$/i,
                build: (m) => ({
                    program: ["terrain_steepness", num(m[1], 1.0)],
                    describe: `Terrain-Steilheit gesetzt auf ${num(m[1], 1.0)} (wirkt mit nächstem Welt-Regen)`,
                }),
            },
            {
                example: "setze terrain basishöhe 5",
                re: /^setze\s+terrain\s+(?:basishöhe|basishoehe)\s+(-?\d+(?:\.\d+)?)\s*$/i,
                build: (m) => ({
                    program: ["terrain_base_height", num(m[1], 0)],
                    describe: `Terrain-Basishöhe gesetzt auf ${num(m[1], 0)} (wirkt mit nächstem Welt-Regen)`,
                }),
            },
            {
                example: "erhöhe sprungkraft um 2",
                re: /^(?:erhöhe|erhoehe)\s+sprungkraft\s+um\s+(-?\d+(?:\.\d+)?)\s*$/i,
                build: (m) => {
                    const target = (this.state.jumpPower || 12) + num(m[1], 2);
                    return {
                        program: ["player_jump_power", target],
                        describe: `Sprungkraft → ${target.toFixed(2)}`,
                    };
                },
            },
            {
                example: "heile welt",
                re: /^heile\s+welt\s*$/i,
                build: () => ({
                    program: ["chain", ["weather", "sunny"], ["creatures_emotion", "happy"], ["gravity", -9.81]],
                    describe: "Welt geheilt: sonnig, Kreaturen glücklich, Gravitation auf 1.5G zurück",
                }),
            },
            {
                example: "vereine chaos ordnung",
                re: /^vereine\s+chaos\s+ordnung\s*$/i,
                build: () => ({
                    program: ["chain", ["terrain_steepness", 1.0], ["creatures_color", "white"]],
                    describe: "Chaos und Ordnung vereint: Steilheit 1.0, Kreaturen weiß",
                }),
            },
            {
                example: "boden aktivieren",
                re: /^boden\s+aktivieren\s*$/i,
                build: () => ({
                    program: ["set_visible", "terrain", true],
                    describe: "Boden aktiviert",
                }),
            },
            {
                example: "boden deaktivieren",
                re: /^boden\s+deaktivieren\s*$/i,
                build: () => ({
                    program: ["set_visible", "terrain", false],
                    describe: "Boden deaktiviert",
                }),
            },
            {
                example: "kreaturen aktivieren",
                re: /^kreaturen\s+aktivieren\s*$/i,
                build: () => ({
                    program: ["set_visible", "creatures", true],
                    describe: "Kreaturen aktiviert",
                }),
            },
            {
                example: "kreaturen deaktivieren",
                re: /^kreaturen\s+deaktivieren\s*$/i,
                build: () => ({
                    program: ["set_visible", "creatures", false],
                    describe: "Kreaturen deaktiviert",
                }),
            },
            {
                // Ring 5 / ALTLASTEN-NULL: "werde mensch|hirsch|wolf|fuchs|bär"
                // wechselt den Körper. applyPlayerSoul kanonisiert (Tiere lösen
                // auf die koerper_-Baupläne — der generische embody-Pfad).
                example: "werde wolf",
                re: /^werde\s+(mensch|human|hirsch|wolf|fuchs|bär|baer)\s*$/i,
                build: (m) => {
                    const raw = m[1].toLowerCase();
                    return {
                        program: ["player_soul", raw],
                        describe: `Seele gewechselt: ${raw}`,
                    };
                },
            },
            {
                // "baue dorf/tempel/wasserfall/damm hier" platziert die Struktur am Spieler. Position + Seed zur
                // Build-Zeit einbetten — sonst sähen Mitspieler ein anderes Dorf an anderer Stelle. Damm routet über
                // den generischen `spawn_blueprint`-Pfad; Dorf/Tempel/Wasserfall über eigene DSL-Ops.
                example: "baue dorf hier",
                hilfe: ["baue dorf hier"],
                re: /^baue\s+(dorf|tempel|wasserfall|damm)\s+hier\s*$/i,
                build: (m) => {
                    const kind = m[1].toLowerCase();
                    const map = { dorf: "spawn_village", tempel: "spawn_temple", wasserfall: "spawn_waterfall" };
                    // Forward-Offset 8 m statt Spieler-Position: die Bauwerke sind ~6–10 m groß, sonst steht der
                    // Spieler MITTEN darin. Position + Seed zur Build-Zeit eingebettet (Multi-User-Determinismus).
                    const p = this.state.playerMesh ? this.state.playerMesh.position : this._defaultSpawnPos();
                    const vorn = this._blickVorn(this.state.yaw, 0); // die EINE Vorwärts-Richtung
                    const dist = 8;
                    const fx = p.x + vorn.x * dist;
                    const fz = p.z + vorn.z * dist;
                    // der Same aus dem Welt-Strom (`_bauSame`; das Dorf derselbe Strom wie `dorf`) — nie Math.random
                    // (Lehre 7: Peers und Reloads würfelten verschiedene Dörfer)
                    const seed = this._bauSame(kind === "dorf" ? "stadt" : kind);
                    const op = map[kind];
                    // Das Dorf misst seinen Plan vor dem SPRECHER (`_siedlungsAnker`): es reist mit seinem Ort, seiner Gier
                    // und seinem Bildwinkel — jeder Peer baut dasselbe Dorf an derselben Stelle.
                    const cam = this.state.camera;
                    const fov = cam && Number.isFinite(cam.fov) ? cam.fov : 75;
                    const tanH = Math.tan((fov * Math.PI) / 360) * (cam && cam.aspect > 0 ? cam.aspect : 16 / 9);
                    const program =
                        op === "spawn_village"
                            ? [op, ["at", p.x, p.y, p.z], seed, this.state.yaw, tanH]
                            : op
                              ? [op, ["at", fx, p.y, fz], seed]
                              : ["spawn_blueprint", kind, ["at", fx, p.y, fz], seed];
                    return {
                        program,
                        describe: `${kind} vor dir gebaut`,
                    };
                },
            },
            {
                // Ring 6 V2 — Fraktal. Position + RootSeed embed wie oben.
                example: "baue fraktal tempel",
                re: /^baue\s+fraktal(?:\s+(dorf|tempel|wasserfall))?\s*$/i,
                build: (m) => {
                    const map = { dorf: "village", tempel: "temple", wasserfall: "waterfall" };
                    const t = (m[1] || "tempel").toLowerCase();
                    const p = this.state.playerMesh ? this.state.playerMesh.position : this._defaultSpawnPos();
                    const seed = this._bauSame("fraktal"); // der Same aus dem Welt-Strom, nie Math.random (Befund D10)
                    return {
                        program: ["spawn_fractal", ["at", p.x, p.y, p.z], map[t], 2, 0.5, seed],
                        describe: `Fraktal-${t} gebaut (depth 2, ratio 0.5)`,
                    };
                },
            },
            // "pflanze baum hier" / "setze insel hier" / "rufe ufo hier" platzieren sofort am Spieler. Position
            // zur Build-Zeit eingebettet (Mitspieler sehen identische Positionen); die Insel trägt zusätzlich
            // einen Seed für identische Noise-Form.
            {
                example: "pflanze baum hier",
                re: /^(?:pflanze|baue|setze|erschaffe)\s+baum\s+hier\s*$/i,
                build: () => {
                    const p = this.state.playerMesh ? this.state.playerMesh.position : this._defaultSpawnPos();
                    return {
                        program: ["spawn_tree", ["at", p.x, p.y, p.z], 1],
                        describe: "Baum gepflanzt",
                    };
                },
            },
            {
                example: "pflanze hain",
                re: /^pflanze\s+(?:einen\s+)?hain\s*$/i,
                build: () => {
                    const p = this.state.playerMesh ? this.state.playerMesh.position : this._defaultSpawnPos();
                    return {
                        program: ["spawn_tree", ["at", p.x, p.y, p.z], 5],
                        describe: "Hain (5 Bäume) gepflanzt",
                    };
                },
            },
            {
                example: "setze insel hier",
                re: /^(?:setze|erschaffe|baue)\s+insel\s+hier\s*$/i,
                build: () => {
                    const p = this.state.playerMesh ? this.state.playerMesh.position : this._defaultSpawnPos();
                    const seed = this._bauSame("insel"); // der Same aus dem Welt-Strom, nie Math.random (Befund D10)
                    return {
                        program: ["spawn_island", ["at", p.x, p.y, p.z], 6, seed],
                        describe: "Schwebende Insel gesetzt",
                    };
                },
            },
            {
                // Pflege-Geste: schreibt ins lebendig-Overlay über deposit_life (DERSELBE Op wie der Nexus) —
                // der Mensch nährt das Feld, das alle lesen · schreiben · werten.
                example: "pflege das land",
                re: /^(?:pflege|hege)(?:\s+(?:das\s+land|die\s+erde|den\s+ort))?\s*$/i,
                build: () => {
                    const p = this.state.playerMesh ? this.state.playerMesh.position : this._defaultSpawnPos();
                    return {
                        program: ["deposit_life", ["at", p.x, p.y, p.z]],
                        describe: "Du pflegst das Land — das Feld wird lebendiger",
                    };
                },
            },
            {
                example: "rufe ufo hier",
                re: /^(?:rufe|setze|spawne)\s+ufo\s+hier\s*$/i,
                build: () => {
                    const p = this.state.playerMesh ? this.state.playerMesh.position : this._defaultSpawnPos();
                    return {
                        program: ["spawn_ufo", ["at", p.x, p.y, p.z]],
                        describe: "UFO gerufen",
                    };
                },
            },
            {
                // Welt-Modifikation über die Voxel-Edit-Schicht: `grabe loch` schnitzt eine Luft-Kugel unter dem
                // Spieler, `hebe hügel` schüttet eine Fest-Kugel auf — über die broadcastbaren DSL-Ops
                // voxel_carve / voxel_fill.
                example: "grabe loch",
                re: /^grabe\s+(?:ein\s+)?loch\s*$/i,
                build: () => {
                    const p = this.state.playerMesh ? this.state.playerMesh.position : { x: 0, y: 0, z: 0 };
                    return {
                        program: ["voxel_carve", p.x, p.y - 1.5, p.z, 5],
                        describe: "Loch gegraben",
                    };
                },
            },
            {
                example: "hebe hügel",
                re: /^hebe\s+(?:einen\s+)?hügel\s*$/i,
                build: () => {
                    const p = this.state.playerMesh ? this.state.playerMesh.position : { x: 0, y: 0, z: 0 };
                    return {
                        program: ["voxel_fill", p.x, p.y - 1.5, p.z, 5],
                        describe: "Hügel gehoben",
                    };
                },
            },
            {
                example: "erzähle Drachen leben hier",
                // Erzähle <Text> → Narrativ in die Knowledge-Base. Die Capture-Gruppe greift auf das Rohkommando
                // (nicht das lowercase-`parts`), damit das Casing 1:1 persistiert.
                re: /^erzähle[:\s]+(.+)$/i,
                build: (m) => ({
                    program: ["record_narrative", m[1].trim()],
                    describe: `Narrativ gespeichert: ${m[1].trim()}`,
                }),
            },
            // Welle 6.D Etappe 3a — Schaden-Chat-Pattern. „schade mir 50" /
            // „verletze mich 30" / „damage 999 test" — Schöpfer-Werkzeug
            // (Test-Tod-Wandlung) ohne JSON-DSL-Geste.
            {
                example: "schade mir 50",
                re: /^(?:schade\s+mir|verletze\s+mich|damage)\s+(\d+(?:\.\d+)?)(?:\s+(.+))?$/i,
                build: (m) => ({
                    program: ["damage", Number(m[1]), (m[2] || "chat").trim()],
                    describe: `Schaden ${m[1]} (${(m[2] || "chat").trim()})`,
                }),
            },
            // Welle 6.D Etappe 3a — Konsumabel aktivieren via Chat.
            // „trink trank_des_lichts" / „aktiviere trank_X".
            {
                example: "trink trank_des_lichts",
                re: /^(?:trink|trinke|aktiviere\s+trank)\s+([a-z0-9_-]+)$/i,
                build: (m) => ({
                    program: ["apply_boost", m[1]],
                    describe: `Konsum: ${m[1]}`,
                }),
            },
            // Welle 6.D Etappe 3b — Ausrüstung wechseln via Chat.
            {
                example: "rüste werkzeug hammer",
                re: /^rüste\s+werkzeug\s+([a-z0-9_-]+)$/i,
                build: (m) => ({
                    program: ["equip_tool", m[1]],
                    describe: `Werkzeug: ${m[1]}`,
                }),
            },
            {
                example: "rüste rüstung eisen_plate",
                re: /^rüste\s+rüstung\s+([a-z0-9_-]+)$/i,
                build: (m) => ({
                    program: ["equip_armor", m[1]],
                    describe: `Rüstung: ${m[1]}`,
                }),
            },
            // V17.52 Kampf Phase B — Waffe ausrüsten via Chat (Spiegel der Rüstung).
            {
                example: "rüste waffe schwert",
                re: /^rüste\s+waffe\s+([a-z0-9_-]+)$/i,
                build: (m) => ({
                    program: ["equip_weapon", m[1]],
                    describe: `Waffe: ${m[1]}`,
                }),
            },
            {
                example: "rüste ab werkzeug",
                re: /^rüste\s+ab\s+(werkzeug|rüstung|waffe|tool|armor|weapon)$/i,
                build: (m) => {
                    const slot = /werkzeug|tool/i.test(m[1]) ? "tool" : /waffe|weapon/i.test(m[1]) ? "weapon" : "armor";
                    return {
                        program: ["unequip", slot],
                        describe: `Ausrüstung ab: ${slot}`,
                    };
                },
            },
            // Welle 6.C2 — Spielmodus wechseln per Chat. Akzeptiert die drei
            // kanonischen Namen + zwei deutsche Aliase (peace/creative).
            {
                example: "setze modus frieden",
                re: /^(?:setze\s+)?modus\s+(frieden|peace|pfad|survival|schöpfer|schoepfer|creative)$/i,
                build: (m) => {
                    const raw = m[1].toLowerCase();
                    const map = {
                        frieden: "frieden",
                        peace: "frieden",
                        pfad: "pfad",
                        survival: "pfad",
                        schöpfer: "schöpfer",
                        schoepfer: "schöpfer",
                        creative: "schöpfer",
                    };
                    const mode = map[raw] || "frieden";
                    return {
                        program: ["set_mode", mode],
                        describe: `Welt-Beziehung: ${mode}`,
                    };
                },
            },
            // Welle 6.H Phase 1 — Kreaturen-Aufträge. Die nahste Kreatur
            // bekommt die Geste. „komm her" ist ein Sonder-Modus von
            // follow_player mit kleinerem Halte-Abstand (1.5 m statt 3.5 m).
            {
                example: "folge mir",
                re: /^(?:folge mir|folg mir|komm mit|begleite mich)$/i,
                build: () => ({
                    program: ["creature_task_nearest", "follow_player"],
                    describe: "die nächste Kreatur folgt mir",
                }),
            },
            {
                example: "komm her",
                re: /^(?:komm her|komm zu mir|her zu mir|näher)$/i,
                build: () => ({
                    program: ["creature_task_nearest", "follow_player", 1.5],
                    describe: "die nächste Kreatur kommt näher zu mir",
                }),
            },
            {
                example: "warte",
                re: /^(?:warte|halt|bleib(?:\s+stehen)?|stillstehen)$/i,
                build: () => ({
                    program: ["creature_task_nearest", "wait"],
                    describe: "die nächste Kreatur hält inne",
                }),
            },
            {
                example: "erkunde",
                re: /^(?:erkunde|streife|wandere(?:\s+frei)?|frei sein)$/i,
                build: () => ({
                    program: ["creature_task_nearest", "wander"],
                    describe: "die nächste Kreatur streift wieder frei",
                }),
            },
            {
                example: "alle folgt mir",
                re: /^(?:alle\s+(?:folgt|kommt|begleitet)(?:\s+mir)?|alle\s+her)$/i,
                build: () => ({
                    program: ["creature_task_all", "follow_player"],
                    describe: "alle Kreaturen folgen mir",
                }),
            },
            {
                example: "trinke",
                re: /^(?:trink|trinke|trink(?:\s+wasser)?|geh\s+(?:zum|zu)\s+wasser)$/i,
                build: () => ({
                    program: ["creature_task_nearest", "drink"],
                    describe: "die nächste Kreatur sucht Wasser und trinkt",
                }),
            },
            {
                example: "alle trinken",
                re: /^(?:alle\s+trinken|alle\s+zum\s+wasser)$/i,
                build: () => ({
                    program: ["creature_task_all", "drink"],
                    describe: "alle Kreaturen trinken am nächsten Ufer",
                }),
            },
            {
                example: "alle warten",
                re: /^(?:alle\s+(?:warten|halten|stehen))$/i,
                build: () => ({
                    program: ["creature_task_all", "wait"],
                    describe: "alle Kreaturen halten inne",
                }),
            },
            // "sammle <material>" routet gather auf die nächste Kreatur, "alle sammeln <material>" an alle.
            // Der Regex matcht alles — validiert wird im Tick (unbekanntes Material → wander-Rückfall).
            {
                example: "sammle holz",
                re: /^(?:sammle|bring|hol|gather)\s+([a-zäöüß_]+)$/i,
                build: (m) => ({
                    program: ["creature_task_nearest", "gather", m[1].toLowerCase()],
                    describe: `die nächste Kreatur sammelt „${m[1].toLowerCase()}"`,
                }),
            },
            {
                example: "alle sammeln holz",
                re: /^(?:alle\s+(?:sammeln|sammelt|holen|bringen))\s+([a-zäöüß_]+)$/i,
                build: (m) => ({
                    program: ["creature_task_all", "gather", m[1].toLowerCase()],
                    describe: `alle Kreaturen sammeln „${m[1].toLowerCase()}"`,
                }),
            },
            // "baue <bauplan>": der Spieler ist Material-Quelle, die Kreatur baut daraus. pfad konsumiert aus
            // dem Spieler-Inventar, frieden ebenso (S2), frei baut nur schöpfer (_buildMaterialGate).
            {
                example: "baue stein_block",
                re: /^(?:baue|errichte|erschaffe|construct)\s+([a-zäöüß0-9_-]+)$/i,
                build: (m) => ({
                    program: ["creature_task_nearest", "build", m[1].toLowerCase()],
                    describe: `die nächste Kreatur baut „${m[1].toLowerCase()}"`,
                }),
            },
            {
                example: "alle bauen stein_block",
                re: /^(?:alle\s+(?:bauen|baut|errichten|erschaffen))\s+([a-zäöüß0-9_-]+)$/i,
                build: (m) => ({
                    program: ["creature_task_all", "build", m[1].toLowerCase()],
                    describe: `alle Kreaturen bauen „${m[1].toLowerCase()}"`,
                }),
            },
            // W12 Phase 2 — einen eigenen Bauplan auf eine registrierte Welt
            // richten. Welt per id (fluid) oder Label (strom-welt).
            {
                example: "richte portal mein_ring auf strom-welt",
                re: /^richte\s+portal\s+([a-zäöüß0-9_-]+)\s+auf\s+([a-zäöüß0-9_-]+)$/i,
                build: (m) => ({
                    program: ["set_portal", m[1].toLowerCase(), m[2].toLowerCase()],
                    describe: `richtet „${m[1].toLowerCase()}" als Portal auf „${m[2].toLowerCase()}"`,
                }),
            },
            // Satz → Studio (auch ohne KI-Schlüssel): "pflanz mir einen eichenhain am wasser", "bau ein haus".
            // Das Wort löst über den EINEN Wort-Katalog auf (`_studioBlueprintForWord`); unbekannt → null, der Satz fällt an
            // den LLM-Begleiter, ohne ihn sagt `_studioSatzAbsage`, was die Studios kennen. Ein Hain/Wald ohne Art ist einer
            // der Baum-Art (der Präfix-Stamm des Art-Gesetzes). Bewusst die LETZTE Regel: Spezifischeres gewinnt.
            {
                example: "pflanz mir einen eichenhain am wasser",
                // die v1-Sätze der Hilfe (`_hilfeZeilen`): dieselbe Regel, je ein Wort des Studios
                hilfe: [
                    "pflanz mir einen eichenhain am wasser",
                    "bau mir ein haus",
                    "pflanz mir drei birken",
                    "bau mir einen gt",
                ],
                re: AnazhRealm.STUDIO_SATZ,
                build: (m) => {
                    const wort = (
                        m[2] || (m[3] ? AnazhRealm.KIND_POLICY.tree.prefix.replace(/_+$/, "") : "")
                    ).toLowerCase();
                    const name = this._studioBlueprintForWord(wort);
                    if (!name) return null;
                    const ZAHL = { ein: 1, eine: 1, einen: 1, einige: 5, zwei: 2, drei: 3, vier: 4, fünf: 5, fuenf: 5 };
                    Object.assign(ZAHL, { sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, "ein paar": 3 });
                    const z = m[1] ? m[1].toLowerCase().replace(/\s+/g, " ") : null;
                    let n = z ? (ZAHL[z] != null ? ZAHL[z] : parseInt(z, 10)) : m[3] ? 6 : 1;
                    if (!Number.isFinite(n) || n < 1) n = 1;
                    // „einen eichenHAIN" / „einen wald" = ein Hain, nicht ein Baum
                    if (m[3] && (!z || ZAHL[z] === 1)) n = 6;
                    const pos = m[4] ? ["near_water", 80] : ["at_player_forward", m[5] ? 6 : 10];
                    // der Same aus dem Welt-Strom je Art (Befund D10: Math.random — kein Reload zog denselben Hain)
                    const seed = this._bauSame("studio:" + name);
                    const wo = m[4] ? "am Wasser" : "vor dir";
                    // Der Spieler liest das Label der Art („Eiche", „Alemannisch"), nie die interne id („baum_eiche", Befund
                    // V-D8) — und ein Haus wächst nicht, es wird gebaut (die Art aus dem Wort-Katalog).
                    const label = this._werkLabel(name);
                    const natur = this._istNatur({ type: name });
                    return {
                        program: ["spawn_studio", wort, pos, n, seed],
                        describe: `${n}× ${label} aus dem Studio ${wo} ${natur ? "gewachsen" : "gebaut"}`,
                    };
                },
            },
        ];
        return this._chatDslPatternsCache;
    }

    parseChatToDsl(text) {
        if (typeof text !== "string") return null;
        const t = text.trim();
        if (!t) return null;
        for (const p of this.chatDslPatterns) {
            const m = t.match(p.re);
            if (m) {
                try {
                    const built = p.build(m);
                    if (built && Array.isArray(built.program)) return built;
                } catch (err) {
                    this.log(`Chat→DSL build-Fehler für '${p.example}': ${err.message}`, "ERROR");
                    return null;
                }
            }
        }
        return null;
    }

    // Bedingungs-Parser Mensch→Regeln: X in "wann immer X, dann Y" → eine DSL-Bedingung (fokussierte
    // Surface-Grammatik). Unbekannt → null (der Regel-Pfad gibt sanftes Feedback). Liest das lebendige
    // Feld (field_*) UND die Stimmung (emotion_above).
    _parseChatCondition(text) {
        const t = String(text || "")
            .toLowerCase()
            .trim();
        if (!t) return null;
        // Wetter
        // D5a (V18.128): der Sturm VOR dem Regen — das spezifischere Wort gewinnt.
        if (/\bsturm|stürmisch|stuermisch|stormy|gewitter/.test(t)) return ["weather_is", "stormy"];
        if (/\bregn|\bregen\b|regnet|rainy|nass/.test(t)) return ["weather_is", "rainy"];
        if (/\bsonn|sunny|klar\b|heiter/.test(t)) return ["weather_is", "sunny"];
        // Stimmung (globale Spieler-Emotion)
        if (/traurig|trauer|sorrow|kummer|weinst/.test(t)) return ["emotion_above", "sorrow", 0.5];
        if (/fröhlich|froehlich|glücklich|gluecklich|freude|\bjoy\b|froh\b/.test(t))
            return ["emotion_above", "joy", 0.5];
        if (/staun|ehrfurcht|\bawe\b|ehrfürchtig/.test(t)) return ["emotion_above", "awe", 0.5];
        if (/hoffnung|hoffst|\bhope\b/.test(t)) return ["emotion_above", "hope", 0.5];
        if (/frieden|friedlich|\bruhe\b|\bpeace\b|gelassen/.test(t)) return ["emotion_above", "peace", 0.5];
        if (/\bchaos\b|\bwut\b|zorn|aufgewühlt|aufgewuehlt/.test(t)) return ["emotion_above", "chaos", 0.5];
        // lebendiges Feld am Ort
        if (/(wenig|kaum|kein).{0,12}(leben|lebendig)|\bkarg|\böde|\boede|\btot\b|verdorrt|wüst|wuest/.test(t))
            return ["field_below", "lebendig", 0.3];
        if (/(viel|voll).{0,12}(leben|lebendig)|üppig|ueppig|blüh|blueh|grünt|gruent|fruchtbar/.test(t))
            return ["field_above", "lebendig", 0.6];
        if (/\bglut\b|feuer|glüh|glueh|lava|vulkan/.test(t)) return ["field_above", "glut", 0.5];
        if (/magie|magisch|zauber/.test(t)) return ["field_above", "magieleitung", 0.5];
        // Welt-Zustand
        if (/viele?\s+(kreatur|wesen|tier)/.test(t)) return ["creatures_count_above", 5];
        if (/manchmal|zufäll|zufaell|ab und zu|gelegentlich/.test(t)) return ["random_chance", 0.3];
        return null;
    }

    // Der Effekt-Parser: reuse die BESTEHENDEN Chat-Patterns (Synergie — jeder
    // Chat-Effekt „setze wetter sunny" / „spawne kreaturen 3" wird Regel-fähig,
    // ohne neue Effekt-Grammatik). Liefert das DSL-Programm oder null.
    _parseChatEffect(text) {
        const t = String(text || "").trim();
        if (!t) return null;
        for (const p of this.chatDslPatterns) {
            const m = t.match(p.re);
            if (!m) continue;
            try {
                const built = p.build(m);
                if (built && Array.isArray(built.program)) return built.program;
            } catch {
                return null;
            }
        }
        return null;
    }

    // Levenshtein-Vorschläge, wenn weder DSL- noch System-Pfad griff: das erste Token-Bigram
    // (z. B. "setze wetter") gegen die Beispiele BEIDER Tabellen; Distanz <= 4 gilt als nahe genug.
    chatSuggest(text) {
        if (typeof text !== "string") return null;
        const t = text.trim().toLowerCase();
        if (!t) return null;
        const parts = t.split(/\s+/);
        const head = parts.slice(0, 2).join(" ");
        if (!head) return null;
        const candidates = this.chatDslPatterns
            .map((p) => p.example)
            .concat(this.chatSystemPatterns.map((p) => p.example));
        let best = null;
        let bestDist = Infinity;
        for (const cand of candidates) {
            const candHead = cand.split(/\s+/).slice(0, 2).join(" ");
            const d = this.levenshtein(head, candHead);
            if (d < bestDist) {
                bestDist = d;
                best = cand;
            }
        }
        return best && bestDist <= 4 ? best : null;
    }

    levenshtein(a, b) {
        if (a === b) return 0;
        const m = a.length;
        const n = b.length;
        if (m === 0) return n;
        if (n === 0) return m;
        // Eine Zeile rollen, um Speicher zu sparen.
        let prev = new Array(n + 1);
        let curr = new Array(n + 1);
        for (let j = 0; j <= n; j++) prev[j] = j;
        for (let i = 1; i <= m; i++) {
            curr[0] = i;
            for (let j = 1; j <= n; j++) {
                const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
                curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
            }
            [prev, curr] = [curr, prev];
        }
        return prev[n];
    }

    // ### Player-Emotionen ###
    // Regelbasierte Sentiment-Erkennung (Deutsch): jeder Treffer +0.1 auf eine Achse, geclampt bei 1;
    // der Game-Loop lässt sie verfliegen. Schwellen-Trigger feuern DSL-Programme (Emotion wird Welt).
    get emotionPatterns() {
        if (this._emotionPatternsCache) return this._emotionPatternsCache;
        this._emotionPatternsCache = {
            joy: ["schön", "fröhlich", "liebe", "glücklich", "freude", "lachen", "warm"],
            awe: ["wunder", "magisch", "groß", "ehrfurcht", "staunen", "unfassbar", "weit"],
            sorrow: ["traurig", "weinen", "dunkel", "verloren", "trauer", "schmerz"],
            hope: ["hoffe", "zukunft", "licht", "vertrau", "neu", "beginn"],
            peace: ["ruhig", "still", "frieden", "leise", "sanft"],
            chaos: ["chaos", "wild", "zerstör", "wut", "sturm", "kämpf"],
        };
        return this._emotionPatternsCache;
    }

    collectPlayerEmotions(text) {
        if (typeof text !== "string" || !text.trim()) return;
        const lower = text.toLowerCase();
        const e = this.state.player.emotions;
        const patterns = this.emotionPatterns;
        for (const axis of Object.keys(patterns)) {
            if (patterns[axis].some((word) => lower.includes(word))) {
                e[axis] = Math.min(1, e[axis] + 0.1);
            }
        }
    }

    // Taten-Kanal + Appraisal-Brücke: eine reale Spieler-Handlung leitet Emotion über ALLE Achsen ab.
    // (1) TAT-Richtung — AnazhRealm.ACTION_TO_EMOTION, Fallback für tag-lose Akte (explore/damage);
    // (2) SUBSTANZ — ist ein Compound beteiligt, emergiert die Färbung aus seinen Tags
    // (computeCompoundTags → TAG_TO_EMOTION), skaliert mit der Magnitude (∝ Komplexität).
    // `opts` optional: blueprint (Name ODER Objekt), creature, tags, magnitude (Override).
    _feelAction(type, opts) {
        const e = this.state.player && this.state.player.emotions;
        if (!e) return;
        const base = AnazhRealm.ACTION_TO_EMOTION[type];
        // Substanz auflösen: Tags + Magnitude (∝ Komplexität).
        let tags = null;
        let magnitude = 1;
        if (opts && typeof opts === "object") {
            if (opts.tags) {
                tags = opts.tags;
            } else if (opts.blueprint) {
                const bp =
                    typeof opts.blueprint === "string"
                        ? this.state.blueprints && this.state.blueprints[opts.blueprint]
                        : opts.blueprint;
                if (bp && Array.isArray(bp.parts)) {
                    tags = this.computeCompoundTags(bp);
                    magnitude = this._substanceMagnitude(bp);
                }
            } else if (opts.creature) {
                tags = this.computeCreatureCompoundTags(opts.creature);
            }
            if (typeof opts.magnitude === "number" && opts.magnitude > 0) magnitude = opts.magnitude;
        }
        // Beitrag = Tat-Basis (× Magnitude) + Substanz-Appraisal.
        const contrib = {};
        if (base) for (const axis of Object.keys(base)) contrib[axis] = (contrib[axis] || 0) + base[axis] * magnitude;
        if (tags) {
            const sub = this._appraiseSubstance(tags, magnitude);
            for (const axis of Object.keys(sub)) contrib[axis] = (contrib[axis] || 0) + sub[axis];
        }
        if (Object.keys(contrib).length === 0) return;
        for (const axis of Object.keys(contrib)) {
            e[axis] = Math.min(1, (e[axis] || 0) + contrib[axis]);
        }
        // V17.32 — der Moment des Fühlens MARKIERT den Ort: die (jetzt substanz-gefärbte)
        // Emotion der Tat wird an der Spieler-Zelle deponiert (das räumliche Gedächtnis
        // der Welt — ein Ort, an dem ich eine Kathedrale baute, trägt diese Stimmung).
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (pm) this._depositEmotion(pm.x, pm.z, contrib);
    }

    // Emotion aus Substanz: Tags (× Magnitude) über die frozen Tabelle TAG_TO_EMOTION. Tags > 1
    // (Welt-Effekte) werden auf [0,1] geklemmt (Richtung je Tag), die Komplexität trägt die Magnitude.
    // Gibt einen {achse: delta}-Beitrag.
    _appraiseSubstance(tags, magnitude = 1) {
        const T2E = AnazhRealm.TAG_TO_EMOTION;
        const contrib = {};
        if (!tags) return contrib;
        for (const tagKey of Object.keys(T2E)) {
            const strength = Math.min(1, Math.max(0, tags[tagKey] || 0));
            if (strength <= 0.02) continue;
            const map = T2E[tagKey];
            for (const emo of Object.keys(map)) {
                contrib[emo] = (contrib[emo] || 0) + map[emo] * strength * magnitude;
            }
        }
        return contrib;
    }

    // V17.46 — die Magnitude eines Compounds ∝ Komplexität (Part-Zahl): eine Box (~2-4
    // Parts) bewegt weniger als eine Kathedrale (~30). Saturierend + gebounded (~0.78..1.6).
    _substanceMagnitude(bp) {
        const n = bp && Array.isArray(bp.parts) ? bp.parts.length : 1;
        return 0.7 + Math.min(0.9, n * 0.04);
    }

    updatePlayerEmotions(currentTime) {
        const p = this.state.player;
        const prev = p.emotionLastTick;
        const delta = prev > -Infinity ? Math.max(0, currentTime - prev) : 0;
        p.emotionLastTick = currentTime;
        // W3 (V17.47) — die langsame STIMMUNG (mood) lazy initialisieren (reaktiv, nicht
        // persistiert — wie die Overlays; robust über jeden Load-Pfad).
        if (!p.mood) p.mood = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };

        if (delta > 0) {
            // Pro-Achse-Decay: Gefühle verfliegen verschieden schnell (Furcht/chaos kurz, Trauer/peace lang).
            // EMOTION_DECAY ist ein MULTIPLIKATOR auf emotionDecayPerSec — der UI-Schieber bleibt der Tempo-Knopf.
            const dmul = AnazhRealm.EMOTION_DECAY;
            for (const k of Object.keys(p.emotions)) {
                const dec = p.emotionDecayPerSec * (dmul[k] || 1) * delta;
                p.emotions[k] = Math.max(0, p.emotions[k] - dec);
            }
        }

        // V17.27/V17.32 — die Schreib-Overlays (Leben + Emotion) bounded halten:
        // rate-limiteter Prune zerfallener Zellen (alle ~5 s). Lazy-Decay läuft
        // beim Lesen; dies räumt nur die toten Zellen aus den Maps.
        this._pruneLifeField();
        this._pruneEmotionField();

        // === Das lebendige Feld — Welt→Spieler ===
        // Die lokale Aura unter dem Spieler nährt seine Emotion: EIN Feld-Read (auraAt), generisch über
        // AnazhRealm.FIELD_TO_EMOTION. Drift NUR Richtung ZIEL und nur HEBEND (der Decay senkt) — schwaches
        // Feld bleibt "idle → 0", starkes spürt man, ohne dass es selbst die 0.7-Trigger-Schwelle erreicht.
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (pm && delta > 0) {
            const aura = this.auraAt(pm.x, pm.z, currentTime);
            const driftRate = 0.03; // pro Sekunde (sanft, Halbwertszeit ~23 s)
            const map = AnazhRealm.FIELD_TO_EMOTION;
            for (const fieldAxis of Object.keys(map)) {
                const strength = aura[fieldAxis] || 0;
                if (strength <= 0.05) continue;
                const targets = map[fieldAxis];
                for (const emo of Object.keys(targets)) {
                    const target = targets[emo] * strength; // 0 .. < 0.7
                    const cur = p.emotions[emo] || 0;
                    if (target > cur) {
                        p.emotions[emo] = Math.min(1, cur + (target - cur) * driftRate * delta);
                    }
                }
            }
            // Emotion als APPRAISAL: δ = SITUATION − Spieler-Baseline. Situation = Welt um den Spieler
            // (lebendig) + HP — NIE seine Stimmung (Rückkopplung → Runaway). Additiv zu Taten- und Feld-Kanal:
            // δ ist die Änderungs-Responsivität (aufblühende Region → joy-Puls, verdorrende/Wunde → sorrow-Puls).
            // Die Baseline lagt (playerTau) → Gewöhnung fällt heraus (anhaltend Gutes: δ → 0).
            const sit = this._playerSituationWohl(aura);
            if (typeof p.wohlBaseline !== "number") {
                p.wohlBaseline = sit; // Cold-Start: die erste Situation IST die Erwartung (kein δ)
            } else {
                let dsig = sit - p.wohlBaseline; // [−1, 1] — besser/schlechter als erwartet
                // Den ROHEN Situations-δ (VOR der Stimmungs-Tönung) als kurze EMA halten — die Erlebnis-Tendenz
                // für die Wertungs-Klammer. Anti-Gaming: Situation (lebendig+HP), NIE die getönte Emotion —
                // eine Regel kann den Bonus nicht faken.
                const aD = 1 - Math.exp(-delta / AnazhRealm.WERTUNG.appraisalEmaTau);
                p.appraisalDelta = (p.appraisalDelta || 0) + aD * (dsig - (p.appraisalDelta || 0));
                const dead = AnazhRealm.WERTUNG.appraisalDeadzone;
                // Stimmungs-Kongruenz: NUR bei einem REALEN Ereignis (|dsig| > deadzone) tönt die Stimmung die
                // Bewertung (in trüber Stimmung fühlt sich Gutes kleiner an). Bei konstanter Situation keine
                // Kongruenz — sonst spontaner Stimmungs-Runaway.
                if (Math.abs(dsig) > dead) dsig += AnazhRealm.EMOTION_MOOD_CONGRUENCE * this._moodValence();
                if (dsig > dead) {
                    const g = AnazhRealm.WERTUNG.appraisalGain * (dsig - dead) * delta;
                    p.emotions.joy = Math.min(1, (p.emotions.joy || 0) + g);
                    p.emotions.hope = Math.min(1, (p.emotions.hope || 0) + g * 0.6);
                } else if (dsig < -dead) {
                    const g = AnazhRealm.WERTUNG.appraisalGain * (-dsig - dead) * delta;
                    p.emotions.sorrow = Math.min(1, (p.emotions.sorrow || 0) + g);
                    p.emotions.chaos = Math.min(1, (p.emotions.chaos || 0) + g * 0.5);
                }
                // Baseline NACH dem δ aktualisieren (sie lagt → δ hält an → Gewöhnung über τ).
                const aPl = 1 - Math.exp(-delta / AnazhRealm.WERTUNG.playerTau);
                p.wohlBaseline += aPl * (sit - p.wohlBaseline);
            }
            // Die Feld-Baseline-Map an der Spieler-Zelle füttern (für die Regel-Fitness, Phase 2).
            this._observeFieldWohl(pm.x, pm.z, currentTime);
            this._pruneWohlBaseline(currentTime);
        }

        // === Der ZUSTAND-Kanal ===
        // Niedrige HP (nur im pfad-Modus) lässt sorrow + chaos sanft steigen — die anhaltende Dread der
        // offenen Wunde (die akute Verletzung gibt `damagePlayer`). Nur HEBEND, Ziel < 0.7 (Decay senkt).
        const hpMax = (p.stats && p.stats.hpMax) || 0;
        if (delta > 0 && hpMax > 0 && this.getGameMode && this.getGameMode() === "pfad") {
            const ratio = Math.max(0, Math.min(1, (p.hp || 0) / hpMax));
            if (ratio < 0.5) {
                const hurt = (0.5 - ratio) / 0.5; // 0 (halb) .. 1 (tot)
                const targets = { sorrow: 0.6 * hurt, chaos: 0.45 * hurt };
                for (const emo of Object.keys(targets)) {
                    const cur = p.emotions[emo] || 0;
                    if (targets[emo] > cur) {
                        p.emotions[emo] = Math.min(1, cur + (targets[emo] - cur) * 0.05 * delta);
                    }
                }
            }
        }

        // === Fusion/Kohärenz ===
        // Gegensätzliche Achsen (negativer Dot in EMOTION_GEOMETRY) dämpfen sich MILD → EIN kohärenter Punkt
        // statt joy=1 UND sorrow=1. Rein dissipativ (kein Runaway), proportional zur Gegen-Achse → eine
        // einzelne klare Emotion wird NICHT gedämpft (die 0.7-Trigger bleiben erreichbar). Damps ZUERST aus
        // dem Snapshot berechnen, DANN anwenden → reihenfolge-unabhängig (deterministisch).
        if (delta > 0) {
            const geo = AnazhRealm.EMOTION_GEOMETRY;
            const axes = AnazhRealm.EMOTION_AXES;
            const cohRate = AnazhRealm.EMOTION_COHERENCE_RATE;
            const damp = {};
            for (const a of axes) {
                const ga = geo[a];
                let d = 0;
                for (const b of axes) {
                    if (b === a) continue;
                    const gb = geo[b];
                    const dot = ga.valenz * gb.valenz + ga.erregung * gb.erregung;
                    if (dot < 0) d += -dot * (p.emotions[b] || 0); // nur gegensätzliche ziehen
                }
                damp[a] = d;
            }
            for (const a of axes) {
                if (damp[a] > 0) {
                    p.emotions[a] = Math.max(0, (p.emotions[a] || 0) - cohRate * damp[a] * delta);
                }
            }
        }

        // Die langsame STIMMUNG: EMA-Vektor über Minuten (moodTau), in den die schnelle Emotion zerfällt;
        // sie färbt die nächste Bewertung kongruent und wird von KI/Journal gelesen. Liest die FINALE
        // Emotion dieses Ticks (nach Decay + allen Kanälen + Kohärenz).
        if (delta > 0) {
            const aMood = 1 - Math.exp(-delta / AnazhRealm.EMOTION_MOOD_TAU);
            for (const k of AnazhRealm.EMOTION_AXES) {
                p.mood[k] = (p.mood[k] || 0) + aMood * ((p.emotions[k] || 0) - (p.mood[k] || 0));
            }
        }

        const trigger = (axis, program) => {
            if (p.emotions[axis] < p.emotionThreshold) return;
            const last = p.emotionLastApply[axis] ?? -Infinity;
            if (currentTime - last < p.emotionApplyCooldown) return;
            this.dslRun(program, { source: `emotion:${axis}` });
            p.emotionLastApply[axis] = currentTime;
            this.log(`Emotion '${axis}' triggert Welt-Effekt (Wert ${p.emotions[axis].toFixed(2)})`, "INFO");
        };
        // Ring 3 V2: alle sechs Achsen koppeln. Jede löst eine andere Art
        // von Welt-Wirkung aus, damit sich die emotionalen Zustände nicht
        // überlagern und sichtbar bleiben.
        trigger("joy", ["skybox_color", "#f7d358"]); // warmes Gelb
        trigger("awe", ["skybox_color", AnazhRealm.ACHSEN_FARBE.magieleitung]); // magisches Lila (die EINE Tabelle)
        trigger("sorrow", ["weather", "rainy"]);
        trigger("hope", ["chain", ["weather", "sunny"], ["creatures_emotion", "happy"]]);
        trigger("peace", ["creatures_speed_mul", 0.7]);
        trigger("chaos", ["creatures_speed_mul", 1.5]);
    }

    // === Der fusionierte READOUT ===
    // Projiziert die sechs Achsen über EMOTION_GEOMETRY auf den Affekt-Raum: dominantes Gefühl,
    // Valenz/Erregung-Schwerpunkt, INTENSITÄT (Abstand vom Neutralen, 6-dim). Bittersüß (joy + sorrow
    // hoch) hebt die Valenz ~auf, die Intensität bleibt HOCH — ambivalent, nicht neutral.
    // Leser: llmBuildSystemPrompt, Journal, UI.
    _emotionState(vec) {
        // vec optional → standardmäßig die akute Emotion; mit p.mood übergeben gibt es
        // den Readout der langsamen STIMMUNG (W3). EINE Maschinerie, zwei Zeitskalen.
        const e = vec || (this.state.player && this.state.player.emotions);
        const geo = AnazhRealm.EMOTION_GEOMETRY;
        const axes = AnazhRealm.EMOTION_AXES;
        const LABEL = AnazhRealm.EMOTION_LABEL;
        if (!e) return { dominant: null, valence: 0, arousal: 0, intensity: 0, label: "leer", mix: null };
        let valence = 0;
        let arousal = 0;
        let sumSq = 0;
        let top1 = null;
        let top1v = 0;
        let top2 = null;
        let top2v = 0;
        for (const axis of axes) {
            const v = Math.max(0, e[axis] || 0);
            const g = geo[axis] || { valenz: 0, erregung: 0 };
            valence += v * g.valenz;
            arousal += v * g.erregung;
            sumSq += v * v;
            if (v > top1v) {
                top2 = top1;
                top2v = top1v;
                top1 = axis;
                top1v = v;
            } else if (v > top2v) {
                top2 = axis;
                top2v = v;
            }
        }
        const intensity = Math.sqrt(sumSq); // Abstand vom Neutralen — bittersüß = HOCH trotz Valenz~0
        let label;
        let mix = null;
        if (intensity < 0.2 || !top1) {
            label = "ruhig"; // wenig Aktivierung → ein ruhiger Grund-Affekt
        } else if (top2 && top2v > 0.25 && top2v > 0.5 * top1v && geo[top1].valenz * geo[top2].valenz < 0) {
            // zwei vergleichbar starke Gefühle GEGENSÄTZLICHER Valenz koexistieren
            // → ein voller, ambivalenter Zustand (bittersüß), kein neutraler.
            mix = [top1, top2];
            label = `Zwiespalt (${LABEL[top1]} und ${LABEL[top2]})`;
        } else {
            label = LABEL[top1]; // ein klares dominantes Gefühl
        }
        return { dominant: top1, valence, arousal, intensity, label, mix };
    }

    // === Kreatur-Innenleben: 6 Achsen statt binär ===
    // Kreatur und Spieler fühlen über DASSELBE Substrat: der Vektor (`creature.userData.emotions`) ist
    // die Wahrheit, das binäre Etikett (`state.creatureEmotions[i]`) seine VALENZ-PROJEKTION via
    // `_emotionState` — die Etikett-Leser (Flocking · Speed/Jump · HUD · Hof-Profil · Persistenz) bleiben.
    // Der Vektor ist reaktiv, NICHT persistiert (nur die Projektion); ein Reload startet gefühls-ruhig.
    _feelCreatureAction(creature, type, intensity = 1) {
        if (!creature || !creature.userData) return;
        const table = AnazhRealm.ACTION_TO_EMOTION[type];
        if (!table) return;
        const ud = creature.userData;
        if (!ud.emotions) ud.emotions = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
        for (const axis in table) {
            const cur = ud.emotions[axis] || 0;
            ud.emotions[axis] = Math.max(0, Math.min(1, cur + table[axis] * intensity));
        }
        this._projectCreatureEmotion(creature);
    }

    // Die Valenz-Projektion Vektor → binäres Etikett (EINE Quelle: _emotionState).
    _projectCreatureEmotion(creature) {
        const ud = creature && creature.userData;
        if (!ud || !ud.emotions) return;
        const idx = this.state.creatures.indexOf(creature);
        if (idx < 0 || !Array.isArray(this.state.creatureEmotions)) return;
        this.state.creatureEmotions[idx] = this._emotionState(ud.emotions).valence >= 0 ? "happy" : "sad";
    }

    // Valenz der langsamen STIMMUNG (∈ [−1, 1], via EMOTION_GEOMETRY) für die stimmungs-kongruente
    // Bewertung; skaliert mit der Stimmungs-STÄRKE (faint färbt wenig), geklemmt.
    _moodValence() {
        const mood = this.state.player && this.state.player.mood;
        if (!mood) return 0;
        const geo = AnazhRealm.EMOTION_GEOMETRY;
        let v = 0;
        for (const axis of AnazhRealm.EMOTION_AXES) v += (mood[axis] || 0) * geo[axis].valenz;
        return Math.max(-1, Math.min(1, v));
    }

    // Emotionale Contagion: die Emotion naher Kreaturen fließt zum Spieler (∝ Nähe × Bindung).
    // RELAXATION zum Ziel, HEBEND und gebounded (Ziel ≤ 0.5) → kein Runaway. Lebt im Kreatur-Tick
    // (updateCreatures), NICHT im Emotion-Tick (dessen Tests bleiben isoliert). Die Bindung wächst,
    // während eine FOLGENDE Kreatur nah ist.
    _tickEmotionContagion(delta) {
        if (!(delta > 0)) return;
        const p = this.state.player;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm || !p || !p.emotions) return;
        const cfg = AnazhRealm.EMOTION_CONTAGION;
        const targets = AnazhRealm.CONTAGION_TARGET;
        const creatures = this.state.creatures || [];
        const r2 = cfg.radius * cfg.radius;
        for (let i = 0; i < creatures.length; i++) {
            const c = creatures[i];
            if (!c || !c.position) continue;
            const dx = c.position.x - pm.x;
            const dz = c.position.z - pm.z;
            const d2 = dx * dx + dz * dz;
            if (d2 > r2) continue;
            const proximity = 1 - Math.sqrt(d2) / cfg.radius; // 0 .. 1
            // Bindung wächst, während eine FOLGENDE Kreatur nah ist (gemeinsame Zeit).
            if (c.userData && c.userData.task && c.userData.task.name === "follow_player") {
                c.userData.bond = Math.min(1, (c.userData.bond || 0) + cfg.bondGrowPerSec * proximity * delta);
            }
            const bond = (c.userData && c.userData.bond) || 0;
            // Die Contagion liest das echte 6-Achsen-Innenleben der Kreatur (awe/hope/peace reisen mit,
            // nicht nur happy/sad); ohne Vektor (frisch geladen/ruhig) der binäre Pfad.
            const vec = c.userData && c.userData.emotions;
            const target = vec || targets[(this.state.creatureEmotions && this.state.creatureEmotions[i]) || "happy"];
            if (!target) continue;
            const weight = cfg.rate * proximity * (cfg.bondFloor + (1 - cfg.bondFloor) * bond) * delta;
            for (const axis of Object.keys(target)) {
                const t = target[axis];
                const cur = p.emotions[axis] || 0;
                if (t > cur) p.emotions[axis] = Math.min(1, cur + weight * (t - cur)); // hebend, gebounded
            }
        }
        // Kreatur↔Kreatur-Contagion (Herden-Stimmung): nahe Wesen heben sich gegenseitig zur stärkeren
        // Achse — HEBEND, gebounded ≤ 1, der Decay zieht zurück → Gleichgewicht, kein Runaway.
        // O(n²) mit early-out auf 12 m Nähe, nur alle ~0.5 s (Akkumulator) statt pro Frame.
        this.state._herdContagionAcc = (this.state._herdContagionAcc || 0) + delta;
        if (this.state._herdContagionAcc >= 0.5) {
            const herdDt = this.state._herdContagionAcc;
            this.state._herdContagionAcc = 0;
            const R2 = 12 * 12;
            const herdRate = cfg.rate * 0.6;
            for (let i = 0; i < creatures.length; i++) {
                const a = creatures[i];
                const ea = a && a.userData && a.userData.emotions;
                if (!ea || !a.position) continue;
                for (let j = i + 1; j < creatures.length; j++) {
                    const b = creatures[j];
                    const eb = b && b.userData && b.userData.emotions;
                    if (!eb || !b.position) continue;
                    const dx = a.position.x - b.position.x;
                    const dz = a.position.z - b.position.z;
                    const d2 = dx * dx + dz * dz;
                    if (d2 > R2) continue;
                    const w = herdRate * (1 - Math.sqrt(d2) / 12) * herdDt;
                    for (const axis of AnazhRealm.EMOTION_AXES) {
                        const va = ea[axis] || 0;
                        const vb = eb[axis] || 0;
                        if (va > vb) eb[axis] = Math.min(1, vb + w * (va - vb));
                        else if (vb > va) ea[axis] = Math.min(1, va + w * (vb - va));
                    }
                }
            }
        }
    }

    // KI als Ko-Regulator: bei anhaltend trüber STIMMUNG eine tröstende Geste (Hoffnung + warmes Wort).
    // Selbst-begrenzend: der Hoffnungs-Schub hebt die Valenz über die Schwelle → Trösten endet
    // (negative Rückkopplung). Der grokSpeak-Cooldown gated die ganze Geste.
    _aiTendPlayer() {
        const p = this.state.player;
        if (!p || !p.emotions) return;
        if (this._moodValence() >= AnazhRealm.EMOTION_TEND.threshold) return; // nur bei anhaltend trüber Stimmung
        if (!this.grokSpeak || !this.grokSpeak("comfort")) return; // cooldown-gegated; nur wenn die KI wirklich tröstet
        const amt = AnazhRealm.EMOTION_TEND.amount;
        p.emotions.hope = Math.min(1, (p.emotions.hope || 0) + amt); // der Trost hebt die Hoffnung
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (pm) this._depositEmotion(pm.x, pm.z, { hope: amt }); // der Ort erinnert die Geste
    }

    // Der EINE Balance-Leser des Regelkreises: liest das 6-Achsen-Substrat über `_emotionState` und
    // gibt [0..1] — 1 = ruhiges Gleichgewicht, 0 = stark gekippt (chaos/sorrow kippen voll, hebende
    // Achsen halb). NEGATIVE Rückkopplung — die Konsumenten dämpfen, wo der Spieler kippt: (1) die
    // Nexus-Wirk-Ökonomie (_loopSelfAnalysis/Outcome-Finalizer/_loopNexusUpdate), (2) die proaktiven
    // Kreatur-Stimmen (_creatureSpeakProactive; der Einstellungs-Toggle bleibt der Aus-Schalter).
    _emotionBalanceFactor() {
        const p = this.state.player;
        const e = p && p.emotions;
        if (!e || typeof this._emotionState !== "function") return 1;
        const es = this._emotionState(e);
        if (!es || !es.dominant) return 1;
        const w = es.dominant === "chaos" || es.dominant === "sorrow" ? 1 : 0.5;
        return Math.max(0, 1 - Math.min(1, (es.intensity || 0) * w));
    }

    // ### anazhSymphony ###
    // Web Audio: EIN Kontext, EIN Master (UMWELT.masterBasis × Master-Regler). Darauf: die Lofi-Musik (klang:GENRES)
    // und die KLANG-WELT (klang:UMWELT) — Wind · Laub · Ufer · Fluss · Fall · Regen · Glut · Vögel · Grillen aus der
    // Lage am Ohr, der Tier-Ruf aus dem Körper. Der AudioContext braucht eine User-Geste (Autoplay-Policy); headless
    // umgeht `--autoplay-policy=no-user-gesture-required` das.
    initSymphony() {
        const s = this.state.symphony;
        if (s.enabled) return true;
        const AudioCtor = typeof AudioContext !== "undefined" ? AudioContext : window.webkitAudioContext;
        if (!AudioCtor) {
            this.log("Web Audio API nicht verfügbar — Symphonie bleibt stumm", "WARNING");
            return false;
        }
        const UM = AnazhRealm._umweltGesetz(); // Kern-Pflicht VOR dem Kontext: kein halber Graph
        const ctx = new AudioCtor();
        if (ctx.state === "suspended" && typeof ctx.resume === "function") {
            ctx.resume();
        }
        // Master-Bus: UMWELT.masterBasis × masterVolume (0..1); der UI-Schieber zieht live nach (slidersInitDOM).
        const masterGain = ctx.createGain();
        const masterVol = typeof s.masterVolume === "number" ? s.masterVolume : 1.0;
        masterGain.gain.value = UM.UMWELT.masterBasis * masterVol;
        // Die Spitzen-Wand hinter dem Master (klang:UMWELT.spitze, Wirt UND Lab): bis −6 dBFS exakt linear, darüber
        // weich gegen −1 dBFS — das Knistern der Glut auf Armlänge und der Sturm im Wald clippen nicht mehr.
        const spitze = UM.kern.umweltSpitze(ctx);
        masterGain.connect(spitze.eingang);
        spitze.ausgang.connect(ctx.destination);
        s.spitze = spitze;

        // W4 V2 — die Lofi-Pad-Schicht (klang:GENRES).
        s.lofi = this._buildLofiLayer(ctx, masterGain);
        // Welle 5 Klang — die Klang-Welt (klang:UMWELT) auf ihrem Bus.
        s.umwelt = this._umweltKlangBauen(ctx, masterGain, UM);

        s.ctx = ctx;
        s.masterGain = masterGain;
        s.enabled = true;
        this.log("anazhSymphony aktiviert: Lofi + Klang-Welt live", "INFO");
        return true;
    }

    disposeSymphony() {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx) return;
        try {
            if (s.umwelt && s.umwelt.graph) s.umwelt.graph.stopAlle();
            if (s.umwelt && s.umwelt.werkstatt) s.umwelt.werkstatt.terminate();
            s.ctx.close();
        } catch (err) {
            this.log(`Symphonie-Dispose-Fehler: ${err.message}`, "WARNING");
        }
        s.ctx = null;
        s.enabled = false;
        // Die Lofi-Oszillatoren und die Umwelt-Quellen sind transient (auto-stop); Gain + Filter räumt der GC
        // mit dem geschlossenen ctx.
        s.lofi = null;
        s.umwelt = null;
        s.fahrt = null; // die Stimme der Fahrt starb mit dem Kontext
        s.masterGain = null;
        s.spitze = null;
    }

    // ═══ DIE KLANG-WELT (Welle 5 Klang) ═══
    // Der Wirt ist das Sinnesorgan, das klang-Gesetzbuch das Gesetz: `_umweltLage` misst am Ohr, was dort IST
    // (Wetter-Feld + dieselbe wandernde Böe, die das Gras biegt · Kronen-Deckung aus dem Pflanz-Gesetz · Wasser im
    // Hör-Ring · Wasserfälle der Region · Glut-Bauten · Sonne · Leben · Jahreszeit), `umweltMischung` macht daraus
    // Pegel/Filter/Panorama, `umweltGraph` spielt es — Lab und Linse bauen denselben Graphen. Kosten je Frame:
    // UMWELT.ohr.probenJeFrame Ring-Proben, die Glut aus dem Verzeichnis (`_blockerMit("glut")`), die Mischung im Takt ohr.mischSek;
    // Quellen laufen nur, solange ihre Stimme hörbar ist. Nie die Weltgröße. Gerechnet wird in der KLANG-WERKSTATT
    // (`_klangWerkstattBooten`, ein Worker): der Spiel-Takt rechnet keinen Sample. Linse: gate:klang-zensus.
    _umweltKlangBauen(ctx, masterGain, UM) {
        const K = UM.kern;
        const O = UM.UMWELT.ohr;
        const bus = ctx.createGain();
        const s = this.state.symphony;
        bus.gain.value = typeof s.creaturePingVolume === "number" ? s.creaturePingVolume : 1.0;
        bus.connect(masterGain);
        const um = { kern: K, bus, werkstatt: null, bestellt: 0, geliefert: 0, rufeBestellt: 0, rufeGespielt: 0 };
        um.werkstatt = this._klangWerkstattBooten(um);
        // Der Hör-Ring: Mitte + ohr.radien × ohr.richtungen, Einheits-Richtungen fest (Welt-Achsen).
        const punkte = [{ r: 0, ux: 0, uz: 0 }];
        for (const r of O.radien) {
            for (let k = 0; k < O.richtungen; k++) {
                const a = (k / O.richtungen) * Math.PI * 2;
                punkte.push({ r, ux: Math.sin(a), uz: Math.cos(a) });
            }
        }
        const seedStr = ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + ":umwelt";
        let saat = 0;
        for (let i = 0; i < seedStr.length; i++) saat = (saat * 31 + seedStr.charCodeAt(i)) >>> 0;
        // Eine hörbare Stimme ohne Puffer bestellt ihr Paket bei der Werkstatt; die Antwort nimmt der Graph auf.
        const liefern = (name) => {
            um.bestellt++;
            if (um.werkstatt) um.werkstatt.postMessage({ typ: "stimme", name });
        };
        return Object.assign(um, {
            graph: K.umweltGraph(ctx, bus, liefern),
            ring: { punkte, nass: new Uint8Array(punkte.length), tempo: new Float32Array(punkte.length), idx: 0 },
            letzteMischung: -Infinity,
            rufSaat: saat || 1,
            lage: null,
            mix: null,
        });
    }

    // DIE KLANG-WERKSTATT: ein eigener Worker mit dem klang-Gesetzbuch (importScripts, ?v=) rechnet die Stimmen-Pakete
    // (Texturen + Eichung, `umweltPaket`) und die Tier-Rufe (`tierRufPuffer`); die Puffer reisen zero-copy zurück
    // (Lehre 24). Der Haupt-Thread nimmt auf und spielt. Fällt die Werkstatt aus, schweigt die Klang-Welt LAUT
    // (WARNING) — nie eine Ersatz-Rechnung im Spiel-Takt.
    _klangWerkstattBooten(um) {
        const base = typeof window !== "undefined" && window.location ? window.location.href : "";
        const kernUrl = new URL("klang-core.js?v=" + (AnazhRealm.VERSION || ""), base).href;
        const boot =
            "importScripts(" +
            JSON.stringify(kernUrl) +
            ");(function " +
            AnazhRealm._klangWerkstattSchale.toString() +
            ")();";
        let w = null;
        try {
            w = new Worker(URL.createObjectURL(new Blob([boot], { type: "text/javascript" })));
        } catch (e) {
            this.log(`Klang-Werkstatt startet nicht (${e && e.message}) — die Klang-Welt schweigt`, "WARNING");
            return null;
        }
        w.onerror = (e) => {
            this.log(
                `Klang-Werkstatt fiel aus (${(e && e.message) || "Worker-Fehler"}) — die Klang-Welt schweigt`,
                "WARNING"
            );
        };
        w.onmessage = (ev) => {
            const s = this.state.symphony;
            const m = ev.data;
            if (!m || s.umwelt !== um || !s.ctx) return; // abgebaut, während die Werkstatt rechnete
            if (m.typ === "stimme" && m.paket) {
                if (um.graph.aufnehmen(m.paket)) um.geliefert++;
            } else if (m.typ === "ruf" && m.tex) {
                if (um.kern.tierRufSpielen(s.ctx, um.bus, m.ruf, m.tex)) um.rufeGespielt++;
            }
        };
        return w;
    }

    // Der Rumpf der Werkstatt — läuft als Quelltext im Worker (nach importScripts des klang-Kerns), greift auf nichts
    // außerhalb ihres eigenen Rumpfs zu.
    static _klangWerkstattSchale() {
        const W = globalThis;
        const K = W.__klangCore;
        W.onmessage = (ev) => {
            const m = ev.data;
            if (!m || !K) return;
            if (m.typ === "stimme") {
                const p = K.umweltPaket(m.name);
                W.postMessage({ typ: "stimme", paket: p }, p ? p.texturen.map((t) => t.daten.buffer) : []);
            } else if (m.typ === "ruf") {
                const tex = K.tierRufPuffer(m.ruf);
                W.postMessage({ typ: "ruf", ruf: m.ruf, tex }, [tex.daten.buffer]);
            }
        };
    }

    // DER EINE UMWELT-TAKT (aus symphonyTick, jeden Frame): Proben fortsetzen (konstant je Frame), im Misch-Takt
    // Lage → Mischung → Graph, die Tier-Rufe würfeln.
    _umweltKlangTick() {
        const s = this.state.symphony;
        const um = s.umwelt;
        if (!um || !s.ctx || !this.state.playerMesh) return;
        const p = this.state.playerMesh.position;
        const O = AnazhRealm._umweltGesetz().UMWELT.ohr;
        this._umweltRingProbe(um, p.x, p.z, O.probenJeFrame);
        const jetzt = s.ctx.currentTime;
        if (jetzt - um.letzteMischung < O.mischSek) return;
        const dt = Number.isFinite(um.letzteMischung) ? jetzt - um.letzteMischung : 0;
        um.letzteMischung = jetzt;
        um.lage = this._umweltLage();
        um.mix = um.kern.umweltMischung(um.lage);
        um.graph.anwenden(um.mix, jetzt);
        this._tierRufTakt(Math.min(1, dt));
    }

    // Der Hör-Ring: je Frame `n` Punkte (rund um die Uhr), je Punkt nass (`_nassAt`) und Strömung (die EINE
    // Strömungs-Quelle `_waterFlowAt`). Die Punkte wandern mit dem Ohr.
    _umweltRingProbe(um, px, pz, n) {
        const R = um.ring;
        for (let k = 0; k < n; k++) {
            const i = R.idx;
            R.idx = (R.idx + 1) % R.punkte.length;
            const pt = R.punkte[i];
            const x = px + pt.ux * pt.r;
            const z = pz + pt.uz * pt.r;
            const nass = this._nassAt(x, z);
            R.nass[i] = nass ? 1 : 0;
            const fl = nass ? this._waterFlowAt(x, z) : null;
            R.tempo[i] = fl ? Math.hypot(fl.x, fl.z) : 0;
        }
    }

    // Steht an (x, z) Wasser? Der Boden (Voxel-Surface) liegt mehr als 5 cm unter der EINEN Wasser-Wahrheit am Körper
    // (`_koerperWasser` über diesem Boden: See, Fluss bis zur Krone, Rand, Aquifer, Decke); eine Höhle, ein Loch (Surface
    // null) trägt kein Wasser. DIE EINE SPALTEN-PROBE „ist hier Wasser": die Nässe des Klangs (der Hör-Ring und der
    // Wasser-Hauch) und — mit `marge` (m über dem Spiegel, der Rand zählt mit) — das Trink-Ziel der Tiere
    // (`_findNearestWaterPoint`) und die erste Hälfte des LANDS jedes Werks (`_landAt`). Bis zur Gegenprüfung las der Klang
    // das 3×3-gedehnte `_waterLevelAt`; bis Schau-2 (09.10.) las das Land eine Zwillings-Probe über `_waterLevelAt`.
    // DER BILLIGE BEWEIS ZUERST (Lehre 25; Integration Welle L: wasser × auge-v1 R2): die Wahrheit am Körper trägt an (x, z)
    // höchstens das gezeichnete Wasser (geladener Chunk, `_wasserBildAt`) bzw. ohne Chunk den Spiegel des Gesetzes samt Rand
    // und voller Fluss-Breite (`_atlasWaterLevelAt` mit einem Boden unter allem) — gleich über welchem Boden, die Decke nimmt
    // nur. Ist dort kein Wasser, ist die Spalte trocken ohne Scan; ist ein Gitterpunkt über dieser Obergrenze + Marge Fels
    // (`_felsUeber`), liegt der Boden darüber — trocken ohne Scan. Nur Spalten, an denen Wasser sein kann, zahlen den
    // Spalten-Scan `_voxelSurfaceY`; das Urteil bleibt dasselbe. Die dichte Wasser-Suche scannte nach dem Merge je Probe
    // (gate:v1-pfad R2 trocken 40 m: 351 Scans, Soll ≤ 80).
    _nassAt(x, z, marge = -0.05) {
        const bild = this._wasserBildAt(x, z);
        const oben = bild === undefined ? this._atlasWaterLevelAt(x, z, -1e9) : bild;
        if (oben === null || !(oben > -Infinity)) return false;
        if (this._felsUeber(x, z, oben + marge)) return false;
        const boden = this._voxelSurfaceY(x, z);
        return boden !== null && Number.isFinite(boden) && boden < this._koerperWasser(x, z, boden) + marge;
    }

    // DAS LAND EINES WERKS (Schau-2 wasser-wahrheit): der Boden an (x, z) liegt mehr als `marge` über dem Wasser — dem
    // gezeichneten (`_nassAt`: was das Auge sieht, samt Live-Dach und Ufer) UND dem des Gesetzes, aus dem das Bild wird
    // (`_atlasWaterLevelAt` über dem Boden der Spalte: ein Chunk, dessen Sheet ein Wasser noch nicht zeichnet, trägt es
    // schon — am See −1080/−1135 zeichnete der Fern-Chunk den 8 m tiefen See noch nicht, der Wald pflanzte Erlen auf
    // seinen Grund). Eine Höhle, ein Loch (kein Boden) ist kein Land. Leser: jedes Werk, das gesetzt wird — der Hain und
    // der Satz („am Wasser"), die Natur-Wand (Wald, Unterholz, Streu, Hof-Baum, Bau-Phantom), die Siedlung samt Fundament,
    // Wege, Zäune, Brunnen, Stände, der Ort des Dorfs und der Spawn. Billige Beweise zuerst (Lehre 25): kein Wasser des
    // Gesetzes in der Spalte, oder Fels über seinem Spiegel + Marge — Land ohne Spalten-Scan.
    _landAt(x, z, marge = 0) {
        if (this._nassAt(x, z, marge)) return false;
        const oben = this._atlasWaterLevelAt(x, z, -1e9);
        if (!(oben > -Infinity)) return true;
        if (this._felsUeber(x, z, oben + marge)) return true;
        const boden = this._voxelSurfaceY(x, z);
        if (boden === null || !Number.isFinite(boden)) return false;
        return !(boden < this._atlasWaterLevelAt(x, z, boden) + marge);
    }

    // DAS LAND EINES FUNDAMENTS (Schau-2 wasser-wahrheit, Gegenprüfung): steht der Grundriss `fp` {ex, ez, ox, oz} (bau-lokal)
    // eines Werks am Ort (x, z) mit der Drehung `ry` samt dem Vorplatz seiner Haustür (`tuer`) ganz auf dem Land? Jeder
    // Punkt des EINEN Fundament-Rasters (`_fundamentRaster`) fragt das Land eines Werks (`_landAt`, 20 cm über dem Spiegel);
    // ohne Grundriss urteilt der Ort selbst. Der Ursprung zuerst (der billige Beweis: die meisten Würfe im Wasser fallen dort).
    // Leser: die Siedlung (`_spawnSettlementSlot`, Grundriss aus dem Export) und die Wand jedes Werks (`_werkImWasser`).
    // Befund: nur die Siedlung fragte das ganze Fundament — „bau mir ein haus am wasser" stellte an 11 von 11 Uferorten ein
    // Haus, dessen Fundament 6–67 von 81 Raster-Punkten bis 0,92–3,68 m tief im Wasser stand (der Satz fragte die Mitte).
    _fundamentLand(x, z, ry, fp, tuer, sockel = 0) {
        if (!this._landAt(x, z, 0.2)) return false;
        if (!fp) return true;
        const c = Math.cos(ry || 0);
        const s = Math.sin(ry || 0);
        // DAS FUNDAMENT SAMT SOCKEL (Integration V18.540): trägt das Werk ein Fundament, steht sein Podest `sockel`
        // (FUNDAMENT_SOCKEL_M) über den Grundriss hinaus (`_archFundamentBox`) — das Land fragt dieselbe Fläche, die der
        // Zell-Stempel und gate:werk-im-wasser Z messen; ein Werk ohne Fundament (der Satz, der Tempel) trägt keinen Sockel
        const raster = sockel > 0 ? { ex: fp.ex + sockel, ez: fp.ez + sockel, ox: fp.ox, oz: fp.oz } : fp;
        for (const [lx, lz] of AnazhRealm._fundamentRaster(raster, tuer))
            if (!this._landAt(x + lx * c + lz * s, z - lx * s + lz * c, 0.2)) return false;
        return true;
    }

    // Die Brenn-Fläche eines Baus (m²): Σ der Grundflächen seiner Teile mit Material „glut" (Kugel und Zylinder als
    // Ellipse · Quader als Rechteck · sonst die halbe Box) × Bau-Skala² — je Bauplan gemerkt. Ein Bett-Feuer knistert
    // mit seiner BRENNENDEN Fläche (klang:UMWELT.stimmen.glut, Bezug das Glutbett der Studio-Feuerstelle); die Höhe
    // einer Glut-Hülle ist Flammen-Luft, kein Brennstoff — bis 06.10. las das Ohr ihr Volumen (die Feuerstelle der
    // Architektur-Welle, 0,7 × 0,36 × 0,7 m, fiel damit −9,9 dB unter das Lagerfeuer, Dorf −36,4 dB).
    _glutFlaeche(entry) {
        const memo = this._glutFlaecheMemo || (this._glutFlaecheMemo = new Map());
        let a = memo.get(entry.type);
        if (a === undefined) {
            a = 0;
            const bp = this.state.blueprints && this.state.blueprints[entry.type];
            const parts = bp && Array.isArray(bp.parts) ? bp.parts : [];
            for (const pt of parts) {
                if (!pt || pt.material !== "glut" || !pt.size) continue;
                const sx = +pt.size.x || 0;
                const sz = +pt.size.z || 0;
                if (pt.shape === "sphere" || pt.shape === "cylinder") a += (Math.PI / 4) * sx * sz;
                else if (pt.shape === "box") a += sx * sz;
                else a += 0.5 * sx * sz;
            }
            memo.set(entry.type, a);
        }
        const sk = Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1;
        return a * sk * sk;
    }

    // DIE WANDERNDE BÖE am Ort (x,z) zur Wind-Zeit t — dieselben Zahlen (WIND_BOE) und dieselbe Richtung
    // (`_windDirAt`) wie `_windSwayOffset` im Shader: was das Gras biegt, rauscht im Ohr.
    _windBoeAt(x, z, t) {
        const B = AnazhRealm.WIND_BOE;
        const d = this._windDirAt(t);
        return Math.sin(t * B.omega - (x * d.x + z * d.z) * B.k) * B.amp + B.mitte;
    }

    // Die Wind-Uhr (s): uWindTime, die der Loop je Frame setzt — sonst die Wand-Uhr.
    _windZeit() {
        const wu = this.state.windUniforms;
        const t = wu && wu.uWindTime ? wu.uWindTime.value : NaN;
        return Number.isFinite(t) ? t : performance.now() / 1000;
    }

    // Der RECHTS-Vektor des Ohrs (waagerecht, aus der Kamera-Blickrichtung): Panorama einer Richtung (ux, uz) =
    // ux·x + uz·z (−1 links … +1 rechts). Ohne Kamera {0, 0} — alles mittig.
    _umweltRechts() {
        const cam = this.state.camera;
        if (!cam) return { x: 0, z: 0 };
        const v = this._umweltBlick || (this._umweltBlick = new THREE.Vector3());
        cam.getWorldDirection(v);
        const l = Math.hypot(v.x, v.z);
        return l > 1e-6 ? { x: -v.z / l, z: v.x / l } : { x: 0, z: 0 };
    }

    // DIE LAGE AM OHR — die Eingabe des Klang-Gesetzes (umweltMischung). Alles gelesen, nichts erfunden: das
    // Wetter-Feld (transition-aware) × Böen-Drift, die Böe am Ort, die Kronen-Deckung der STEHENDEN Bäume (die
    // Kronen-Karte `_kronenStreuAt` — dieselben Bytes, aus denen Boden und Nah-Wiese den Wald lesen; das Kronenlicht-
    // Feld der Platzierung sagt nur, wo Bäume wachsen DÜRFEN), Sonne (Tageszeit), Jahres-Phase, Leben (auraAt), der
    // Hör-Ring (Ufer/Fluss), der nächste Wasserfall der Region, die nächste Glut (Brenn-Fläche).
    _umweltLage() {
        const um = this.state.symphony.umwelt;
        const pm = this.state.playerMesh;
        if (!um || !pm) return null;
        const px = pm.position.x;
        const pz = pm.position.z;
        const wf = this._weatherFieldFor(this.state.weather);
        const tod = typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5;
        const aura = this.auraAt(px, pz);
        const re = this._umweltRechts();
        const pan = (ux, uz) => Math.max(-1, Math.min(1, ux * re.x + uz * re.z));
        // Der Ring: stilles Wasser (Ufer) und fließendes (Fluss) — Abstand, Anteil, Richtung.
        const R = um.ring;
        const ufer = { d: Infinity, anteil: 0, pan: 0 };
        const fluss = { d: Infinity, tempo: 0, pan: 0 };
        let nStill = 0;
        let wU = 0;
        let wF = 0;
        let panU = 0;
        let panF = 0;
        for (let i = 0; i < R.punkte.length; i++) {
            if (!R.nass[i]) continue;
            const pt = R.punkte[i];
            const w = 1 / Math.max(1, pt.r);
            const p = pan(pt.ux, pt.uz);
            if (R.tempo[i] > 0) {
                if (pt.r < fluss.d) fluss.d = pt.r;
                if (R.tempo[i] > fluss.tempo) fluss.tempo = R.tempo[i];
                wF += w;
                panF += p * w;
            } else {
                nStill++;
                if (pt.r < ufer.d) ufer.d = pt.r;
                wU += w;
                panU += p * w;
            }
        }
        ufer.anteil = nStill / R.punkte.length;
        if (wU > 0) ufer.pan = panU / wU;
        if (wF > 0) fluss.pan = panF / wF;
        // Der nächste Wasserfall der Region (wenige je Kachel).
        const fall = { d: Infinity, hoehe: 0, pan: 0 };
        const h = this._hydroFor(px, pz);
        const falls = h && Array.isArray(h.waterfalls) ? h.waterfalls : [];
        for (const wfall of falls) {
            const d = Math.hypot(wfall.x - px, wfall.z - pz);
            if (d < fall.d) {
                fall.d = d;
                fall.hoehe = Math.max(0, wfall.topY - wfall.bottomY);
                fall.pan = d > 1e-3 ? pan((wfall.x - px) / d, (wfall.z - pz) / d) : 0;
            }
        }
        // Die nächste Glut — das Verzeichnis „glut" (`_blockerMit`: jeder Eintrag mit Brenn-Fläche, gestempelt beim Eintritt;
        // jenseits der Hörweite schweigt das Gesetz). Bis K11 lief ein Umlauf über alle Bauten (48 je Frame, nur mit Klang).
        const glut = { d: Infinity, flaeche: 0, pan: 0 };
        for (const e of this._blockerMit("glut")) {
            if (!e.position) continue;
            const d = Math.hypot(e.position.x - px, e.position.z - pz);
            if (d < glut.d) {
                glut.d = d;
                glut.flaeche = this._glutFlaeche(e);
                glut.pan = d > 1e-3 ? pan((e.position.x - px) / d, (e.position.z - pz) / d) : 0;
            }
        }
        return {
            windFeld: wf.wind * (this._weatherWob || 1),
            boe: this._windBoeAt(px, pz, this._windZeit()),
            deckung: this._kronenStreuAt(px, pz),
            regen: wf.rain,
            sonne: Math.sin(this._sonnenWinkel(tod)),
            saisonPhase: typeof this.state.seasonPhase === "number" ? this.state.seasonPhase : 0.375,
            lebendig: Math.max(0, Math.min(1, aura.lebendig)),
            ufer,
            fluss,
            fall,
            glut,
        };
    }

    // DER TIER-RUF — die Stimme folgt dem Körper (klang:UMWELT.tier): Länge = `_creatureKoerperLaenge`, Abstand und
    // Richtung zum Ohr, die Stimmung aus dem Innenleben (oder vom Rufer gesetzt). Zählt jeden Ruf (headless messbar);
    // nur ein hörbarer Ruf (über der Hörschwelle, hinter der Symphonie-Wand) geht an die Klang-Werkstatt, die ihn
    // rechnet — gespielt wird ihre Antwort (`_klangWerkstattBooten`).
    _tierRuf(creature, stimmung) {
        const s = this.state.symphony;
        s.tierRufe = (s.tierRufe || 0) + 1;
        const um = s.umwelt;
        if (!s.enabled || !s.ctx || !um || !um.werkstatt || !creature || !creature.position) return null;
        const pm = this.state.playerMesh;
        const dx = pm ? creature.position.x - pm.position.x : 0;
        const dz = pm ? creature.position.z - pm.position.z : 0;
        const d = Math.hypot(dx, dz);
        if (!(um.kern.tierRufPegel(d) >= AnazhRealm._umweltGesetz().UMWELT.hoerschwelleDb)) return null;
        const re = this._umweltRechts();
        const ruf = {
            laengeM: this._creatureKoerperLaenge(creature),
            stimmung: stimmung || this._tierStimmung(creature),
            d,
            pan: d > 1e-3 ? Math.max(-1, Math.min(1, (dx * re.x + dz * re.z) / d)) : 0,
            saat: (um.rufSaat = (Math.imul(um.rufSaat, 1664525) + 1013904223) >>> 0),
        };
        um.rufeBestellt++;
        um.werkstatt.postMessage({ typ: "ruf", ruf });
        return ruf;
    }

    // Die Stimmung des Rufs aus dem Innenleben: Freude/Hoffnung/Staunen → freude, Trauer → trauer, Chaos → furcht,
    // sonst (Frieden, schwach) → ruhe.
    _tierStimmung(creature) {
        const e = creature && creature.userData && creature.userData.emotions;
        if (!e) return "ruhe";
        let best = "peace";
        let v = 0.15;
        for (const k of ["joy", "hope", "awe", "sorrow", "chaos", "peace"]) {
            if ((e[k] || 0) > v) {
                v = e[k];
                best = k;
            }
        }
        return best === "sorrow" ? "trauer" : best === "chaos" ? "furcht" : best === "peace" ? "ruhe" : "freude";
    }

    // Die Tiere rufen von selbst: je Kreatur im Hör-Radius ein Poisson-Ruf mit der Rate ihrer Stimmung
    // (UMWELT.tier.rufProMin). Kosten = die Kreaturen-Zahl (Populations-Deckel), nie die Weltgröße.
    _tierRufTakt(dt) {
        if (!(dt > 0)) return;
        const s = this.state.symphony;
        const um = s.umwelt;
        const T = AnazhRealm._umweltGesetz().UMWELT.tier;
        const pm = this.state.playerMesh;
        const cs = this.state.creatures;
        if (!um || !pm || !Array.isArray(cs)) return;
        for (const c of cs) {
            if (!c || !c.position) continue;
            if (Math.hypot(c.position.x - pm.position.x, c.position.z - pm.position.z) > T.hoerweiteM) continue;
            const stimmung = this._tierStimmung(c);
            um.rufSaat = (Math.imul(um.rufSaat, 1664525) + 1013904223) >>> 0;
            if (um.rufSaat / 4294967296 < ((T.rufProMin[stimmung] || 0) / 60) * dt) this._tierRuf(c, stimmung);
        }
    }

    // DER KLANG-ZENSUS (Linse gate:klang-zensus): je Umwelt-Stimme Gesetz · Pegel · läuft; dazu die Lage am Ohr.
    _klangZensus() {
        const um = this.state.symphony && this.state.symphony.umwelt;
        if (!um) return null;
        return {
            lage: um.lage,
            stimmen: um.graph.zensus(),
            tierRufe: this.state.symphony.tierRufe || 0,
            werkstatt: {
                laeuft: !!um.werkstatt,
                bestellt: um.bestellt,
                geliefert: um.geliefert,
                rufeBestellt: um.rufeBestellt,
                rufeGespielt: um.rufeGespielt,
            },
        };
    }

    // === Hylomorphismus-Inventar ===
    // Tag-Resonanz statt Rezept-Tabelle: jeder Slot trägt Bauplan-Name + Count, die Wirkung emergiert aus
    // computeCompoundTags(bp): resoniert ≥ 0.5 → Hover-Ping · brennend ≥ 0.5 → orange Glühen ·
    // magieleitung ≥ 0.5 → violett · lebendig ≥ 0.5 → grüner Schimmer · dichte ≥ 0.7 → tiefer Schatten.
    // Hover-Audio hängt an state.symphony.masterGain — Symphonie aus ⇒ Inventar stumm (kein Mute-Bug).
    addToInventory(blueprintName, count = 1) {
        if (!this.state.player || !Array.isArray(this.state.player.inventory)) return false;
        const inv = this.state.player.inventory;
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return false;
        // Erster Stack mit demselben Bauplan-Namen: count erhöhen.
        // Welle 6.H P2B.5 — Schema-Erweiterung: Material-Slots haben kind:"material",
        // Bauplan-Slots haben kind:"blueprint" (oder kein kind = legacy blueprint).
        const existingIdx = inv.findIndex(
            (s) => s && s.blueprintName === blueprintName && (s.kind === "blueprint" || !s.kind)
        );
        if (existingIdx >= 0) {
            inv[existingIdx].count = (inv[existingIdx].count || 0) + count;
            this._refreshIchIfOpen(); // M5 — Pickup-Feedback ist instant
            return true;
        }
        // Erster leerer Slot.
        const emptyIdx = inv.findIndex((s) => !s);
        if (emptyIdx < 0) return false; // Inventar voll
        inv[emptyIdx] = { kind: "blueprint", blueprintName, count };
        this._refreshIchIfOpen(); // M5 — Pickup-Feedback ist instant
        return true;
    }

    // Material-Slot: beim Abbauen löst sich ein Compound in Rohmaterial auf. Stackt bei gleichem
    // material-Namen; material muss in state.materials existieren (Built-in oder define_material).
    addMaterialToInventory(material, count = 1) {
        if (!this.state.player || !Array.isArray(this.state.player.inventory)) return false;
        if (typeof material !== "string" || material.length === 0) return false;
        if (!this.state.materials || !this.state.materials[material]) return false;
        const inv = this.state.player.inventory;
        const n = Math.max(1, Math.floor(Number(count) || 1));
        const existingIdx = inv.findIndex((s) => s && s.kind === "material" && s.material === material);
        if (existingIdx >= 0) {
            inv[existingIdx].count = (inv[existingIdx].count || 0) + n;
            this._refreshIchIfOpen(); // M5 — Pickup-Feedback ist instant
            return true;
        }
        const emptyIdx = inv.findIndex((s) => !s);
        if (emptyIdx < 0) return false;
        inv[emptyIdx] = { kind: "material", material, count: n };
        this._refreshIchIfOpen(); // M5 — Pickup-Feedback ist instant
        return true;
    }

    removeFromInventory(slotIndex, count = 1) {
        if (!this.state.player || !Array.isArray(this.state.player.inventory)) return false;
        const inv = this.state.player.inventory;
        const slot = inv[slotIndex];
        if (!slot) return false;
        slot.count = Math.max(0, (slot.count || 0) - count);
        if (slot.count === 0) inv[slotIndex] = null;
        return true;
    }

    // Das Ding im Slot klingt nach seiner stärksten Substanz-Achse — das Gesetz klang:SUBSTANZ.inventar (Schwelle,
    // Tonhöhe je Achse, Drossel gegen das Wischen) über den EINEN Ereignis-Chokepoint `_substanzKlang`.
    playInventoryHoverPing(tags) {
        if (!tags) return;
        const s = this.state.symphony;
        if (!s || !s.enabled || !s.ctx) return;
        const now = performance.now() / 1000;
        const abstand = AnazhRealm._umweltGesetz().kern.SUBSTANZ.inventar.abstandSek;
        if (now - (this.state.inventoryHoverLast || 0) < abstand) return;
        this.state.inventoryHoverLast = now;
        this._substanzKlang("inventar", tags);
    }

    // Treffer-One-Shot: die SUBSTANZ des Getroffenen färbt das Timbre (härte klirrt hell · dichte wummert · lebendig
    // weich) — das Gesetz klang:SUBSTANZ.treffer, über state.symphony.masterGain (KEIN zweiter AudioContext).
    // Symphonie aus (s.enabled false) → stumm.
    _playKampfOneShot(tags) {
        return this._substanzKlang("treffer", tags);
    }

    // DER EINE EREIGNIS-KLANG-CHOKEPOINT: art (treffer · singen · abschied · wasser · inventar) × Tags → die Einmal-
    // Quelle des klang-Gesetzbuchs (substanzKlang) am Master. Stumm ohne Symphonie. Was ein TIER tut (Auftrag, Stufe,
    // Spawn, Tod), klingt nicht hier, sondern mit seiner Stimme (`_tierRuf`).
    _substanzKlang(art, tags) {
        const s = this.state.symphony;
        if (!s || !s.enabled || !s.ctx || !s.masterGain) return false;
        return !!AnazhRealm._umweltGesetz().kern.substanzKlang(s.ctx, s.masterGain, art, tags || {});
    }

    // ═══ SCHRITT-KLANG ═══
    // Material-getriebene Schritt-/Lande-Klänge, asset-frei: Quelle ist IMMER ein Rausch-Burst, das
    // MATERIAL ist der Filter (Tabelle AnazhRealm.SCHRITT_KLANG). Rein RENDER-seitig (liest Gang-Phase,
    // isInAir, _fieldVy) — die fixe Sim liest und schreibt hier NIE. Linse: gate:schritt-klang.

    // DIE EINE COMPOUND-TAKT-BASIS: der zeit-getriebene Gang der Compound-/Nicht-Rig-Seelen (lokal +
    // Peer) liest EINE Kern-Zahl (fx.bewegung.schritt.taktCompound), skaliert über die Emotions-Brücke
    // (freq-Ratio des koerper-Bewegungsprofils; ohne Emotionen Faktor 1). Fail-closed (Kern-Pflicht).
    _compoundTaktHz(emotions) {
        let hz = AnazhRealm._bewegungsBlock("schritt", ["taktCompound", "klangTempoMin"]).taktCompound;
        if (emotions) {
            const mpv = this._koerperMotionProfile(true, emotions);
            const mpr = mpv ? this._koerperMotionProfile(true, null) : null;
            if (mpv && mpr && Number.isFinite(mpv.freq) && mpr.freq > 0) hz *= mpv.freq / mpr.freq;
        }
        return hz;
    }

    // DER EINE SCHRITT-TICK (aus animatePlayerSoul direkt nach dem Gang-Tick — keine eigene Uhr): je
    // Halbzyklus (π) der Gang-Phase EIN Schritt, nur geerdet + über der Tempo-Schwelle; Luft/Schwimmen/
    // Stand re-ankern den Zähler stumm (der Hit-Stop friert mit). Die LANDUNG hört s.isInAir und wiegt
    // über s._fieldVy — NIE über _landImpactPending (die Ego-Kamera nullt ihn vorher, der Kampf-Hit
    // füttert ihn mit). Schwelle = die EINE Konstante LAND_DIP_MIN_SPEED.
    _schrittKlangTick(halter, speed, underwater, mesh) {
        const s = this.state;
        if (!halter || !mesh) return;
        const k =
            s._schrittKlang ||
            (s._schrittKlang = {
                halb: null, // verankerter Halbzyklus-Index (floor(phase/π))
                luft: false, // war der letzte Tick in der Luft?
                fallVy: 0, // negativstes vy der Luft-Strecke (Aufprall-Maß)
                schritte: 0, // Ereignis-Zähler (Linsen-Messpunkte, render-only)
                landungen: 0,
                letzter: null, // Parameter des letzten Ereignisses
            });
        const grounded = s.isInAir !== true;
        const vy = Number.isFinite(s._fieldVy) ? s._fieldVy : 0;
        if (!grounded) {
            if (vy < k.fallVy) k.fallVy = vy;
            k.luft = true;
        } else {
            if (k.luft && -k.fallVy >= AnazhRealm.LAND_DIP_MIN_SPEED) {
                this._schrittKlangEreignis(mesh, true, -k.fallVy);
            }
            k.luft = false;
            k.fallVy = 0;
        }
        const T = AnazhRealm.SCHRITT_KLANG;
        const phase = Number.isFinite(halter.walkPhase) ? halter.walkPhase : 0;
        // der Ton fällt, wenn ein Fuß aufsetzt: bei der Phase des Aufsetzens des Gang-Gesetzes (je Bein um π versetzt)
        const auf = halter._gait && Number.isFinite(halter._gait.auf) ? halter._gait.auf : 0;
        const halb = Math.floor((phase - auf) / Math.PI);
        if (!grounded || underwater || !(speed > T.tempoMin) || k.halb === null || halb < k.halb) {
            k.halb = halb; // ankern OHNE Ereignis (Stand/Luft/Schwimmen/Phasen-Reset)
            return;
        }
        let n = halb - k.halb;
        if (n <= 0) return;
        k.halb = halb;
        if (n > T.maxProTick) n = T.maxProTick; // Frame-Hänger → kein Burst-Schwall
        for (let i = 0; i < n; i++) this._schrittKlangEreignis(mesh, false, 0);
    }

    // SCHRITT-EREIGNIS (Chokepoint für Schritt UND Landung): zählt IMMER (headless messbar), holt das
    // Material am FUSS (position.y − FOOT_OFFSET), die Stimme nur hinter der s.enabled-Wand.
    _schrittKlangEreignis(mesh, landung, impact) {
        const k = this.state._schrittKlang;
        if (!k) return;
        const fussY = mesh.position.y - AnazhRealm.PLAYER_FOOT_OFFSET;
        const material = this._schrittMaterialAt(mesh.position.x, mesh.position.z, fussY);
        const param = this._schrittKlangParams(material, landung, impact);
        if (landung) k.landungen++;
        else k.schritte++;
        k.letzter = param;
        const sym = this.state.symphony;
        if (sym && sym.enabled && sym.ctx && sym.masterGain) this._playSchrittOneShot(param);
    }

    // Material am Fuß — NASS SCHLÄGT FEST: unter dem Wasserspiegel (watender Ufer-Schritt) platscht er.
    // `_koerperWasser` = die EINE Wasser-Wahrheit am Körper (der Fuß ist sein Grund), `_terrainMaterialAt` die
    // EINE Boden-Wahrheit.
    _schrittMaterialAt(x, z, y) {
        const w = this._koerperWasser(x, z, y);
        if (Number.isFinite(w) && y < w + 0.02) return "wasser";
        return this._terrainMaterialAt(x, z, y);
    }

    // Material → Timbre, PUR aus der Tabelle (unbekannt → Tabellen-Fallback). Die LANDUNG ist derselbe
    // Burst, STÄRKER ∝ Aufprall-Tempo (√(2gh), wie der Kamera-Dip), länger + tiefer, gainDeckel-begrenzt.
    _schrittKlangParams(material, landung, impact) {
        const T = AnazhRealm.SCHRITT_KLANG;
        const name = Object.prototype.hasOwnProperty.call(T.material, material) ? material : T.fallback;
        const m = T.material[name];
        const p = {
            material: name,
            filter: m.filter,
            freq: m.freq,
            q: m.q,
            dauer: m.dauer,
            gain: m.gain,
            landung: !!landung,
        };
        if (landung) {
            const im = Number.isFinite(impact) && impact > 0 ? impact : 0;
            p.gain = Math.min(T.gainDeckel, m.gain * (1 + Math.min(T.landGainSpanne, im * T.landGainProMs)));
            p.dauer = m.dauer * T.landDauerFaktor;
            p.freq = m.freq * T.landFreqFaktor;
        }
        return p;
    }

    // Die Stimme: gefilterter Rausch-Burst über state.symphony.masterGain (KEIN zweiter AudioContext;
    // Symphonie aus → stumm). EIN geteilter Rausch-Buffer je Kontext, zufälliger Start-Offset.
    // Math.random ist hier legal: reiner Klang-Körper, keine Welt-Substanz.
    _playSchrittOneShot(param) {
        const s = this.state.symphony;
        if (!s || !s.enabled || !s.ctx || !s.masterGain || !param) return false;
        const ctx = s.ctx;
        let buf = s._schrittNoiseCtx === ctx ? s._schrittNoise : null;
        if (!buf) {
            const n = Math.max(1, Math.floor(ctx.sampleRate * 0.25));
            buf = ctx.createBuffer(1, n, ctx.sampleRate);
            const ch = buf.getChannelData(0);
            for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
            s._schrittNoise = buf;
            s._schrittNoiseCtx = ctx;
        }
        const t = ctx.currentTime;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filt = ctx.createBiquadFilter();
        filt.type = param.filter;
        filt.frequency.value = param.freq;
        filt.Q.value = param.q;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(param.gain, t + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + param.dauer);
        src.connect(filt);
        filt.connect(gain);
        gain.connect(s.masterGain);
        const spielraum = buf.duration - param.dauer - 0.02;
        src.start(t, spielraum > 0 ? Math.random() * spielraum : 0);
        src.stop(t + param.dauer + 0.02);
        return true;
    }

    // Symphonie-Tick (jeden Frame): die Lofi-Musik (eigener Akkord-Takt) und die Klang-Welt (eigener Misch-Takt).
    symphonyTick() {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx) return;
        this._lofiTick();
        this._umweltKlangTick();
        this._fahrtKlangTick();
    }

    // DIE STIMME DER FAHRT (Leben-Schau 2, fahr-bahn — Befund: Fahren war stumm): im Sattel eines Gesetz-Wagens klingt seine
    // Fahrt aus dem Gesetzbuch (klang:FAHRT — der Motor aus der Zünd-Folge seiner Drehzahl im Gang, das Abrollen aus dem
    // Tempo; die Quellen baut klang-core `fahrtStimme`) auf dem Welt-Master. Der Wirt reicht nur die Lage: das Tempo des
    // Fahr-Zustands, die Deckel des Fahr-Satzes (vmax, rückwärts vehicle:FAHR.schritt.rueckVmax), das Gas aus den Fahr-
    // Tasten (W, rückwärts S), den Flug. Absteigen oder ein Wagen-Wechsel stoppt sie. Kosten: eine Stimme, nur im Sattel.
    _fahrtKlangTick() {
        const s = this.state.symphony;
        const pl = this.state.player;
        const e = pl && pl.mountedArch != null ? this._mountedEntry : null;
        const fz =
            e && e.id === pl.mountedArch && e._fahrSatz && e._fahr && Number.isFinite(e._fahr.vlong) ? e._fahr : null;
        if (s.fahrt && (!fz || s.fahrt.entry !== e)) {
            s.fahrt.stimme.stop(s.ctx.currentTime);
            s.fahrt = null;
        }
        if (!fz) return;
        if (!s.fahrt) s.fahrt = { entry: e, stimme: AnazhRealm._umweltGesetz().kern.fahrtStimme(s.ctx, s.masterGain) };
        const S = AnazhRealm._fahrSchrittGesetz().S;
        const FT = AnazhRealm.FAHR_TASTEN;
        const keys = this.state.keys;
        const gas = keys[FT.gas.tasten[0]] || (keys[FT.bremse.tasten[0]] && fz.vlong <= S.bremsV) ? 1 : 0;
        const vmax = e._fahrSatz.vmax;
        s.fahrt.stimme.anwenden(
            { v: fz.vlong, vmax, rueckVmax: vmax * S.rueckVmax, gas, luft: !!fz.luft },
            s.ctx.currentTime
        );
    }

    // ### Lofi-Pad-Schicht ###
    // Ruhige Minor-7th-Akkordfolge, leise neben der Klang-Welt, Web-Audio nativ. Emotion: hope hebt
    // die Terz (Moll → Dur), sorrow verlangsamt das Tempo.

    // Die Lofi-Schicht im Audio-Graph aufbauen: ein warmer Tiefpass + ein
    // leiser Gain an den Master-Bus. Die Akkord-Oszillatoren selbst sind
    // transient (je Akkord neu, mit Hüllkurve, auto-stop).
    _buildLofiLayer(ctx, masterGain) {
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 900; // warm, gedämpft — der Lofi-Charakter
        filter.Q.value = 0.6;
        const gain = ctx.createGain();
        gain.gain.value = 0.12; // leise — der Pad sitzt unter der Melodie
        filter.connect(gain);
        gain.connect(masterGain);
        // W4 V3 Phase 2 — die Lead-Stimme (Melodie) hat ihren eigenen Gain,
        // etwas präsenter als der Pad, damit die Melodie über ihm singt.
        const melodyGain = ctx.createGain();
        melodyGain.gain.value = 0.24; // V8.91 — Lead-Stimme −20% (Schöpfer-Wunsch)
        melodyGain.connect(masterGain);
        // W4 V3 Phase 3 — die Groove-Schicht (synthetische Trommeln) + ein
        // kurzer White-Noise-Puffer für Snare/Hihat (je Schlag eine frische,
        // billige BufferSource aus diesem geteilten Puffer).
        const grooveGain = ctx.createGain();
        grooveGain.gain.value = 0.5; // V8.92 — lauter (der Groove war zu leise; war 0.35)
        grooveGain.connect(masterGain);
        // W4 V3 Phase 4 — der Bass-Layer (folgt den Akkord-Wurzeln, eine
        // Oktave unter dem Pad; verzahnt sich mit der Kick).
        const bassGain = ctx.createGain();
        bassGain.gain.value = 0.46;
        bassGain.connect(masterGain);
        // DER RAUM (Genre-DNA `space`): gedämpfter Feedback-Delay-Bus als Hall-Ersatz (asset-frei). Der
        // Wet-Pegel folgt Return = space·returnProSpace; `_lofiTick` setzt ihn je Akkord aus dem Rezept
        // (ohne Rezept stumm). Bus-Zahlen = klang-Gesetz RAUM.echo (tempo-synchron via _lofiTick), je Kanal
        // ein Genre-Send (RAUM.DELAY_SENDS); der Bass bleibt trocken (Tiefbass im Hall = Matsch).
        // Kern ohne gültiges RAUM.echo ist ein BRUCH (_kernPflichtBruch), nie ein stiller Literal-Fallback.
        const RE0 = AnazhRealm.Gesetz("klang:RAUM.echo", null);
        if (!RE0 || !["hpHz", "lpHz", "feedback"].every((k) => Number.isFinite(RE0[k])))
            AnazhRealm._kernPflichtBruch("klang:RAUM.echo");
        const raumDelay = ctx.createDelay(2.0);
        raumDelay.delayTime.value = 0.31;
        const raumHochpass = ctx.createBiquadFilter();
        raumHochpass.type = "highpass";
        raumHochpass.frequency.value = RE0.hpHz;
        const raumDaempfer = ctx.createBiquadFilter();
        raumDaempfer.type = "lowpass";
        raumDaempfer.frequency.value = RE0.lpHz;
        const raumFeedback = ctx.createGain();
        raumFeedback.gain.value = RE0.feedback;
        const raumWet = ctx.createGain();
        raumWet.gain.value = 0;
        raumDelay.connect(raumHochpass);
        raumHochpass.connect(raumDaempfer);
        raumDaempfer.connect(raumFeedback);
        raumFeedback.connect(raumDelay);
        raumDaempfer.connect(raumWet);
        raumWet.connect(masterGain);
        // SCHLUSS-WELLE — die Genre-Sends je Kanal (Pad=harmony · Melodie=lead ·
        // Groove=drums); Start 1 = voller Send (byte-alt), der Tick setzt die
        // DELAY_SENDS-Zeile des gewählten Genres.
        const raumSendPad = ctx.createGain();
        const raumSendMelody = ctx.createGain();
        const raumSendGroove = ctx.createGain();
        gain.connect(raumSendPad);
        raumSendPad.connect(raumDelay);
        melodyGain.connect(raumSendMelody);
        raumSendMelody.connect(raumDelay);
        grooveGain.connect(raumSendGroove);
        raumSendGroove.connect(raumDelay);
        const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.4), ctx.sampleRate);
        const nd = noiseBuffer.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
        // W4 V3 — der Harmonie-RNG, deterministisch aus worldMeta.seed: jede
        // Welt bekommt ihr eigenes Lied (Mulberry32, wie das Sternenfeld; ein
        // ":lofi"-Suffix entkoppelt die Akkordfolge vom Stern-Muster).
        const seedStr = ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + ":lofi";
        let seedNum = 0;
        for (let i = 0; i < seedStr.length; i++) seedNum = (seedNum * 31 + seedStr.charCodeAt(i)) >>> 0;
        return {
            filter,
            gain,
            melodyGain,
            grooveGain,
            bassGain,
            raumWet, // ZENSUS-REST V18.488 — der space-Wet-Pegel (Genre-DNA)
            raumDelay, // SCHLUSS-WELLE — der Tick synct das Echo aufs Genre-Tempo (RAUM.echo)
            raumSendPad, // SCHLUSS-WELLE — die Genre-Sends je Kanal (RAUM.DELAY_SENDS)
            raumSendMelody,
            raumSendGroove,
            noiseBuffer,
            degree: 0,
            bar: 0, // ZENSUS-REST V18.488 — der Takt-Zähler der progressionDeg-Wanderung
            lastChordAt: -Infinity,
            rngState: seedNum,
        };
    }

    // W4 V3 — ein Mulberry32-Schritt auf dem Lofi-Harmonie-RNG. Deterministisch
    // (seed-getrieben), aber über die Akkordfolge hinweg fortschreitend — die
    // Progression ist je Welt reproduzierbar, wiederholt sich aber nie exakt.
    _lofiRandom() {
        const lofi = this.state.symphony && this.state.symphony.lofi;
        if (!lofi) return Math.random();
        lofi.rngState = (lofi.rngState + 0x6d2b79f5) >>> 0;
        let t = lofi.rngState;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    // DIE EINE SKALEN-QUELLE: das Studio-Klang-Rezept führt die SKALA (fx.klang.scale, im Kern aus
    // scaleFor(darkness) vor-abgeleitet). Fehlt das Feld oder ist es unsauber (must-ignore), gilt die
    // Kern-Wahrheit des Host-Genres (fail-closed) — nie eine Stamm-Konstante. Nur ein nicht-leeres
    // Array endlicher Halbtöne führt.
    _lofiActiveScale() {
        const studio = this._klangStudioPreset();
        const sc = studio && studio.scale;
        if (Array.isArray(sc) && sc.length > 0 && sc.every((v) => Number.isFinite(v))) return sc;
        return this._klangGenreAusKern(AnazhRealm.KLANG_HOST_RECIPE).scale;
    }

    // Tonleiter-Index → Halbton zur Wurzel: `scale[idx mod n] + 12·floor(idx/n)` (Oktav-Faltung,
    // negative Indizes gewickelt). DER EINE Ton-Mapper: Akkord-Stapel (`_lofiChordFromDegree`), Melodie
    // (`_lofiMelodyNotes`) und Bass-Wurzel fließen hierdurch. Die LOFI_HARMONY-Wanderung bleibt 7-stufig
    // (0..6); bei einer 6-Ton-Skala (Blues) wird die "Septime" d+6 zur Oktav-Wurzel — gewollt.
    _lofiScaleSemitone(idx) {
        const scale = this._lofiActiveScale();
        const n = scale.length;
        const wrapped = ((idx % n) + n) % n;
        return scale[wrapped] + 12 * Math.floor(idx / n);
    }

    // W4 V3 — den diatonischen Septakkord einer Tonleiter-Stufe als Halbton-
    // Abstände: gestapelte Terzen (Stufe d, d+2, d+4, d+6), mit Oktav-Umbruch.
    // V18.491.136 COLOR_EXT — dna.color → chord stack width (4/5/6); fail-soft n=4.
    _lofiChordFromDegree(degree) {
        const studio = this._klangStudioPreset();
        const dna = studio && studio.dna ? studio.dna : null;
        const color = dna && Number.isFinite(dna.color) ? dna.color : 0;
        const kc = typeof globalThis !== "undefined" ? globalThis.__klangCore : null;
        const ext =
            kc && typeof kc.colorExt === "function"
                ? kc.colorExt(color)
                : 1 + (color > 0.35 ? 1 : 0) + (color > 0.7 ? 1 : 0);
        const n = 3 + (Number.isFinite(ext) ? ext : 1); // 4 / 5 / 6
        const offsets = [];
        for (let k = 0; k < n; k++) offsets.push(this._lofiScaleSemitone(degree + k * 2));
        return offsets;
    }
}
