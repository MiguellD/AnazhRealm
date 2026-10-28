class AnazhRealm_feld_sprache {
    // ===== ATLAS · Feld/sprache — Chat → DSL · Emotionen · Wertung =====
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
                re: /^setze\s+wetter\s+(sunny|cloudy|foggy|rainy|stormy|sturm|stürmisch|sonnig|sonne|bewölkt|bewoelkt|wolkig|nebel|neblig|regen|regnerisch|frei|wechselhaft)\s*$/i,
                build: (m) => {
                    const raw = m[1].toLowerCase();
                    const map = {
                        sturm: "stormy",
                        stürmisch: "stormy",
                        sonnig: "sunny",
                        sonne: "sunny",
                        bewölkt: "cloudy",
                        bewoelkt: "cloudy",
                        wolkig: "cloudy",
                        nebel: "foggy",
                        neblig: "foggy",
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
        if (/\bnebel|neblig|foggy/.test(t)) return ["weather_is", "foggy"];
        if (/bewölkt|bewoelkt|wolkig|cloudy/.test(t)) return ["weather_is", "cloudy"];
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
            // das Umstellen dieses Takts (sein Teil der Situation) und seine Erwartung, die mit der Baseline läuft
            const dr = AnazhRealm.WERTUNG.umstellt * this._spielerUmstellt();
            if (typeof p.wohlBaseline !== "number") {
                p.wohlBaseline = sit; // Cold-Start: die erste Situation IST die Erwartung (kein δ)
                p.umstelltErwartet = dr;
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
                // DIE FURCHT UND IHR ENDE (oekologie.K4#2): den Teil des δ, den das Umstellen gegen seine Erwartung trägt (f), erlebt
                // er als Furcht (chaos, verfliegt schnell) statt als Trauer (sorrow, bleibt); fällt das Umstellen, löst derselbe
                // Teil die Furcht. Bis oekologie.K4#2 war jeder Abfall zu zwei Dritteln Trauer: nach 30 s im Ring stand sorrow
                // auf 1, und die Kohärenz schluckte den Triumph nach dem Fall der Jäger (joy 0 bei δ +0,16).
                const f = Math.max(0, Math.min(1, ((p.umstelltErwartet || 0) - dr) / dsig));
                if (dsig > dead) {
                    const g = AnazhRealm.WERTUNG.appraisalGain * (dsig - dead) * delta;
                    p.emotions.joy = Math.min(1, (p.emotions.joy || 0) + g);
                    p.emotions.hope = Math.min(1, (p.emotions.hope || 0) + g * 0.6);
                    p.emotions.chaos = Math.max(0, (p.emotions.chaos || 0) - g * f);
                } else if (dsig < -dead) {
                    const g = AnazhRealm.WERTUNG.appraisalGain * (-dsig - dead) * delta;
                    p.emotions.sorrow = Math.min(1, (p.emotions.sorrow || 0) + g * (1 - f));
                    p.emotions.chaos = Math.min(1, (p.emotions.chaos || 0) + g * (0.5 + 0.5 * f));
                }
                // Baseline NACH dem δ aktualisieren (sie lagt → δ hält an → Gewöhnung über τ).
                const aPl = 1 - Math.exp(-delta / AnazhRealm.WERTUNG.playerTau);
                p.wohlBaseline += aPl * (sit - p.wohlBaseline);
                p.umstelltErwartet = (p.umstelltErwartet || 0) + aPl * (dr - (p.umstelltErwartet || 0));
            }
            // Die Feld-Baseline-Map an der Spieler-Zelle füttern (für die Regel-Fitness, Phase 2): beim Betreten der Zelle und
            // beim Verlassen — dazwischen trägt die lazy EMA die Zeit (ein Blick nach Δt gleicht jedem Blick dazwischen bei
            // gleicher Lage). Bis feld.K3#2 sah der Spieler in JEDEM Bild hin (gate:stand-takt, 60 s Ruhe: 46 802 Einheiten).
            const wz = this._wohlCellKey(pm.x, pm.z);
            const vor = p.wohlZelle;
            const wb = this.state.wohlBaseline;
            if (!vor || vor.key !== wz || !(wb && wb.has(wz))) {
                if (vor && vor.key !== wz) this._observeFieldWohl(vor.x, vor.z, currentTime);
                this._observeFieldWohl(pm.x, pm.z, currentTime);
                p.wohlZelle = { key: wz, x: pm.x, z: pm.z };
            }
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
    }

    // DIE GESETZE DES GEMÜTS (affekt.K2): die Emotion formt die Welt über Welt-Regeln mit Quelle — je Achse EIN Gesetz
    // `emotion:<Achse>` (Bedingung `emotion_above <Achse>` an der Schwelle des Spielers, Takt = sein Cooldown) durch die EINE Tür
    // `_registerWorldRule`, angepinnt (die Verdrängung schont sie): gewertet, gespeichert, geteilt und im Gesetze-Pult pausierbar
    // wie jedes Gesetz; der Wunsch, den es
    // wirkt, trägt seine Quelle („rule:emotion:sorrow", `_setWeather`). Bis affekt.K2 feuerte `updatePlayerEmotions` sechs feste
    // Trigger an der Regel-Welt vorbei (`dslRun`): nicht teilbar, nicht gewertet, nicht abschaltbar. Idempotent (die Signatur
    // dedupt, ein zweiter Ruf setzt den Takt) — beim Erwachen der Welt, nach dem Laden und vom Cooldown-Schieber.
    _gemuetGesetze() {
        const takt = { everySec: this.state.player.emotionApplyCooldown };
        const wirkung = {
            joy: ["skybox_color", "#f7d358"], // warmes Gelb
            awe: ["skybox_color", AnazhRealm.ACHSEN_FARBE.magieleitung], // magisches Lila (die EINE Tabelle)
            sorrow: ["weather", "rainy"],
            hope: ["chain", ["weather", "sunny"], ["creatures_emotion", "happy"]],
            peace: ["creatures_speed_mul", 0.7],
            chaos: ["creatures_speed_mul", 1.5],
        };
        for (const axis of AnazhRealm.EMOTION_AXES) {
            const g = this._registerWorldRule(["emotion_above", axis], wirkung[axis], takt, {
                source: `emotion:${axis}`,
                log: [],
                programId: "gemuet",
            });
            if (g) g.pinned = true;
        }
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

    // ═══ DIE TAT — die Wertung antwortet am Ort (affekt K1), die Welt sagt, was sie tat (affekt K4) ═══
    // Jeder Welt-Akt (AnazhRealm.DSL_WELTAKTE) läuft durch die EINE Engstelle `dslEval`, gleich wer ihn schickt: Mensch, Nexus,
    // KI, Gesetz, Emotion, Wesen. Dort wird er EINE Tat: ihr Ort ist der erste, den sie auflöst (`dslEvalPos` → `_tatOrt`, VOR
    // ihrem Effekt), ihr ERTRAG die Änderung der SITUATION dort (`_playerSituationWohl`: lebendig + HP, nie die Emotion), ihr δ
    // der Vorhersagefehler gegen die ERWARTUNG des Orts an genau diese Tat — die Gleichung der WERTUNG (δ = x − baseline): die
    // Erwartung lernt je Tat mit `ruleValueBeta` (wie eine Regel ihren Wert) und vergisst in Spielzeit mit `tatTau`. Die zehnte
    // gleiche Tat ist erwartet, ihr δ fällt (die Gewöhnung fällt umsonst heraus); bringt eine Tat weniger, als der Ort erwartet,
    // ist ihr δ negativ. Das Buch `state.taten` (die letzten `tatBuch`, reaktiv wie die Overlays, nie gespeichert) lesen zwei:
    //   der KLANG am Ohr (`_tatAntwortAm` → `_umweltLage().antwort` → klang:UMWELT.stimmen.vogel.antwort): der Chor des Orts singt
    //   auf (δ > 0) oder verstummt (δ < 0), im nächsten Misch-Takt, und klingt mit `appraisalEmaTau` ab;
    //   die STIMME des Felds (`_feldStimme`): eine Tat der Welt im Blick schreibt eine Zeile mit Ort, Ursache und Gesetz in die
    //   Dialog-Box (`grokRender`), höchstens eine je `stimmeSek`.
    // Bis 23.10. wertete die Welt keine Tat: die Vögel folgten nur dem Zustand am Ohr, und kein Akt der Welt sagte, was er tat.
    _tatBeginnt(op, args, ctx) {
        const tat = { op, args, aussen: ctx.tat || null, ort: null, knoten: null, sitVor: 0 };
        ctx.tat = tat;
        return tat;
    }

    // DIE HAND TUT (affekt K1#2): eine Tat der eigenen Hand des Spielers — fällen (`harvestArchitecture`), töten
    // (`_creatureCombatDeath`) — ist dieselbe Tat wie ein Welt-Akt: ihr Ort, die Situation davor, ihr Effekt (`wirken`), ihre
    // Wertung (`_tatWerten`, Quelle „human" wie der Satz des Spielers). Die Narbe senkt das Leben des Orts: die schädliche Tat
    // wertet negativ, der Chor des Orts verstummt. Bis affekt.K1#2 wertete nur `dslEval` — ein gefällter Baum und ein getötetes
    // Tier blieben ohne δ.
    _handTat(op, pos, wirken) {
        const ctx = { source: "human", tat: null };
        const tat = this._tatBeginnt(op, [], ctx);
        this._tatOrt(tat, pos, "hand");
        wirken();
        this._tatWerten(tat, ctx, true);
    }

    // Der Ort der Tat (aus `dslEvalPos`: der erste Ort, den ihr Effekt auflöst, bevor er schreibt) und die Situation, die sie dort
    // vorfindet. `knoten` ist der Auflöser (at_field_need, at_player …) — die Stimme nennt ihn als Ursache.
    _tatOrt(tat, pos, knoten) {
        tat.ort = { x: pos.x, z: pos.z };
        tat.knoten = knoten;
        tat.sitVor = this._playerSituationWohl(this.auraAt(pos.x, pos.z));
    }

    // Die Tat ist geschehen (aus `dslEval`, nach dem Effekt): werten, ins Buch, an die Stimme. `bericht` = was der Effekt ins
    // Log legte: setzte er etwas (`ergebnis`), zählt, was steht (nichts → keine Tat, weniger als gewollt → der Satz des
    // Ergebnisses, `_ergebnisSatz`); ohne Ergebnis ist ein Effekt, der warf, den sein Schreiber hielt (das Wetter gegen das
    // Wort des Spielers, die Uhr) oder den ein Budget kappte, keine Tat — die Stimme sagte sonst, was nie geschah.
    _tatWerten(tat, ctx, gelungen, bericht = []) {
        ctx.tat = tat.aussen;
        const setz = bericht.filter((b) => b.event === "ergebnis");
        const steht = setz.length
            ? setz.some((b) => b.gesetzt > 0 || b.folgt)
            : !bericht.some((b) => /gehalten|budget|unknown|invalid|failed|not_found|forbidden|skipped/.test(b.event));
        if (!gelungen || !steht) return null;
        const W = AnazhRealm.WERTUNG;
        const st = this.state;
        const jetzt = st.spielZeit;
        const e = {
            op: tat.op,
            args: tat.args,
            wer: ctx.source,
            programm: ctx.programId,
            regel: ctx.regel ? ctx.regel.id : null,
            bedingung: ctx.regel ? ctx.regel.cond : null,
            weil: ctx.weil || null,
            wunsch: !!tat.wunsch,
            ergebnis: (this._ergebnisSatz(setz) || {}).satz || null,
            grund: ctx.grund || null,
            knoten: tat.knoten,
            x: null,
            z: null,
            ertrag: 0,
            delta: 0,
            t: jetzt,
        };
        if (tat.ort) {
            e.x = tat.ort.x;
            e.z = tat.ort.z;
            e.ertrag = this._playerSituationWohl(this.auraAt(e.x, e.z)) - tat.sitVor;
            const erw = st.tatErwartung || (st.tatErwartung = new Map());
            const key = this._wohlCellKey(e.x, e.z) + ":" + tat.op;
            const alt = erw.get(key);
            const erwartet = alt ? alt.e * Math.exp(-Math.max(0, jetzt - alt.t) / W.tatTau) : 0;
            e.delta = e.ertrag - erwartet;
            const neu = Object.assign(alt || {}, { e: erwartet + W.ruleValueBeta * e.delta, t: jetzt });
            if (!alt) erw.set(key, neu);
            // vergessen, wo |e| · e^(−Δt/τ) unter 1e-3 fällt — die Tat räumt (`_feldTod`)
            this._feldTod(erw, key, neu, jetzt + W.tatTau * Math.max(0, Math.log(Math.abs(neu.e) / 1e-3)), jetzt);
        }
        const buch = st.taten || (st.taten = []);
        buch.push(e);
        if (buch.length > W.tatBuch) buch.splice(0, buch.length - W.tatBuch);
        this._feldStimme(e);
        return e;
    }

    // DIE ANTWORT AM OHR (x, z), der Leser des Klangs (`_umweltLage`): die Tat, deren abklingendes δ hier am stärksten wirkt —
    // Reichweite und Lautstärke sind das Gesetz des Klangs (klang:UMWELT.stimmen.vogel.antwort), das Abklingen das der Wertung
    // (`appraisalEmaTau`, die jüngste Erlebnis-Tendenz). { d, delta } oder null.
    _tatAntwortAm(x, z) {
        const buch = this.state.taten;
        if (!buch || buch.length === 0) return null;
        const reich = AnazhRealm._umweltGesetz().UMWELT.stimmen.vogel.antwort.dAus;
        const tau = AnazhRealm.WERTUNG.appraisalEmaTau;
        const jetzt = this.state.spielZeit;
        let wahl = null;
        let staerke = 0;
        for (const e of buch) {
            if (e.x == null || !e.delta) continue;
            const d = Math.hypot(e.x - x, e.z - z);
            if (!(d < reich)) continue;
            const delta = e.delta * Math.exp(-Math.max(0, jetzt - e.t) / tau);
            const w = Math.abs(delta) * (1 - d / reich);
            if (w > staerke && Math.abs(delta) >= 1e-3) {
                staerke = w;
                wahl = { d, delta };
            }
        }
        return wahl;
    }

    // DIE STIMME DES FELDS (affekt K4): eine Tat der WELT (`_himmelSchreiber` „welt": der Nexus und seine Gesetze, die Emotion,
    // die Wesen) oder der KI („llm:…" und ihre Gesetze — das Schreiber-Gesetz zählt sie zur Hand des Spielers, weil sie seinen
    // Satz ausführt; gesagt wird trotzdem, was sie tat), nie die eigene Hand des Spielers — im Blick des Spielers (ihr Ort im
    // Frustum des Vor-Takts, `_kreaturImBlick`; eine Tat ohne Ort wirkt überall) wartet auf ihre Zeile. Die Stimme spricht
    // höchstens eine je `stimmeSek` Spielzeit (`_feldStimmeTakt`, auch aus dem Takt der Stimme `grokTick`): die jüngste wartende
    // Tat mit Ort, Ursache und Gesetz, dazu die Zahl der übrigen seit der letzten Zeile. Die Zeile steht in ihrem Eintrag
    // (`zeile`, `spieler` = der Ort des Spielers, an dem sie gemessen ist) — jede Angabe prüfbar gegen state.
    _feldStimme(e) {
        if (this._himmelSchreiber(e.wer, "wetter") !== "welt" && !/^(rule:)*llm:/.test(String(e.wer))) return;
        if (e.x != null && !this._kreaturImBlick(e.x, e.z)) return;
        const S = this._stimme || (this._stimme = { t: -Infinity, wartet: null, weitere: 0 });
        if (S.wartet) S.weitere++;
        S.wartet = e;
        this._feldStimmeTakt();
    }

    _feldStimmeTakt() {
        const S = this._stimme;
        if (!S || !S.wartet) return;
        const jetzt = this.state.spielZeit;
        if (jetzt - S.t < AnazhRealm.WERTUNG.stimmeSek) return;
        const e = S.wartet;
        e.weitere = S.weitere;
        e.zeile = this._feldStimmeZeile(e);
        e.gesprochen = jetzt;
        S.t = jetzt;
        S.wartet = null;
        S.weitere = 0;
        this.grokRender(e.zeile);
    }

    // Die Zeile einer Tat (Vorlage ohne Modell): WER · WAS (`describeProgram`, der Wunsch der Welt nach Wetter, und was davon
    // wirklich steht, `_ergebnisSatz`) · WO (Abstand und Himmelsrichtung vom Spieler, Norden = −z) · URSACHE (die Bedingung
    // ihres Gesetzes und die Bedingung, die ihren Zweig wählte, das Wort an die KI, der Auflöser ihres Orts) · GESETZ (Nummer
    // der Regel oder Name des Programms) — alles so, wie es zur Zeit der Tat stand.
    _feldStimmeZeile(e) {
        const wer = this._tatSchreiber(e.wer);
        let wo = "überall";
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (e.x != null && pm) {
            e.spieler = { x: pm.x, z: pm.z };
            const dx = e.x - pm.x;
            const dz = e.z - pm.z;
            const d = Math.round(Math.hypot(dx, dz));
            const richtung = [
                "nördlich",
                "nordöstlich",
                "östlich",
                "südöstlich",
                "südlich",
                "südwestlich",
                "westlich",
                "nordwestlich",
            ];
            const sektor = Math.round((Math.atan2(dx, -dz) / (2 * Math.PI)) * 8 + 8) % 8;
            wo = d < 2 ? "bei dir" : `${d} m ${richtung[sektor]} von dir`;
        }
        const weil = [
            e.bedingung && this._describeDslCondition(e.bedingung),
            e.weil && (e.weil.ja ? "" : "nicht gilt, dass ") + this._describeDslCondition(e.weil.cond),
        ].filter(Boolean);
        let ursache;
        if (weil.length) ursache = `weil ${weil.join(" und ")}`;
        else if (e.grund) ursache = `auf dein Wort „${String(e.grund).slice(0, 60)}“`;
        else if (e.knoten === "at_field_need") ursache = "weil das Feld dort am ärmsten war";
        else ursache = "aus eigenem Antrieb";
        const gesetz = e.regel != null ? `Gesetz Nr. ${e.regel}` : `Programm ${e.programm}`;
        const weitere = e.weitere
            ? `; dazu ${e.weitere} weitere Tat${e.weitere > 1 ? "en" : ""} seit der letzten Zeile`
            : "";
        const was = e.wunsch
            ? `wünscht sich das Wetter „${e.args[0]}“`
            : this.describeProgram([e.op, ...(e.args || [])]);
        const steht = e.ergebnis ? ` (${e.ergebnis.replace(/\.$/, "")})` : "";
        return `${wer.nom} ${was}${steht} — ${wo}, ${ursache}. (${gesetz}${e.regel != null ? " " + wer.gen : ""}${weitere})`;
    }

    // Der Name eines Schreibers (die DSL-Quelle): ein Gesetz trägt die Quelle seines Gebers („rule:nexus").
    _tatSchreiber(quelle) {
        let q = String(quelle || "?");
        let gesetz = false;
        while (q.startsWith("rule:")) {
            q = q.slice(5);
            gesetz = true;
        }
        let nom;
        let gen;
        if (q === "nexus") [nom, gen] = ["der Nexus", "des Nexus"];
        else if (q.startsWith("llm")) [nom, gen] = ["die KI", "der KI"];
        else if (q.startsWith("emotion:"))
            [nom, gen] = [`die Stimmung „${q.slice(8)}“`, `der Stimmung „${q.slice(8)}“`];
        else if (q.startsWith("creature:")) [nom, gen] = [`das Wesen „${q.slice(9)}“`, `des Wesens „${q.slice(9)}“`];
        else [nom, gen] = [`„${q}“`, `von „${q}“`];
        if (gesetz) nom = `ein Gesetz ${gen}`;
        return { nom: nom[0].toUpperCase() + nom.slice(1), gen };
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_feld_sprache]);

// ===== ATLAS · Feld/sprache — Außen-Konstanten =====
// LEBENDIGE WERTUNG (lesen → schreiben → WERTEN): gleitende Baseline (EMA-Tiefpass) + Differenz
// δ = x − baseline — braucht nur Zeitkonstanten. Reaktiv (nicht persistiert, kein Worker-Mirror).
//   cell        — Zell-Größe der Baseline-Map (= LIFE_FIELD.cell, 16 m)
//   fieldTau    — ORTS-Baseline (s); ~120 s → ein Ort re-normalisiert langsam
//   playerTau   — SPIELER-Baseline (s); ~30 s → Gewöhnung in einer Sitzung
//   pruneAgeSec — die Baseline-Map bounded halten: eine Zelle ohne Blick veraltet und fällt (`_feldTod`)
AnazhRealm.WERTUNG = Object.freeze({
    cell: 16,
    fieldTau: 120,
    playerTau: 30,
    pruneAgeSec: 180,
    // DAS UMSTELLEN (oekologie.K4#2): so weit senkt ein geschlossenes Rudel die Situation des Spielers (`_spielerUmstellt`
    // ∈ [0, 1) × umstellt) — ein Rudel im Ring 0,4–0,6 unter die Baseline, die Furcht; sein Fall hebt sie zurück über die
    // Baseline, die ihr nachlief (playerTau), der Triumph (Mess-Wiese: Ego joy + hope +0,31, bei 0,5 +0,02 bis +0,13).
    umstellt: 1,
    // V17.43 Phase 2 — die EMA-Rate, mit der rule.value den per-Feuern gemessenen
    // Reward (lokaler struktureller δ) integriert. Eine Regel braucht mehrere Feuern,
    // um sich als Heiler/Schädling zu beweisen (kein Snap-Urteil). value ∈ [−1, +1]. Dieselbe Rate lernt die Erwartung eines
    // Orts an eine Tat (`_tatWerten`): eine Gleichung, ein Lernen.
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
    // DIE TAT (`_tatWerten`, affekt K1/K4): die Erwartung eines Orts an eine Tat lernt je Tat mit ruleValueBeta und vergisst in
    // Spielzeit mit tatTau (s) — nach 30 min Ruhe (3 τ) ist sie zu 95 % vergessen, die nächste Tat wieder neu. tatBuch = die
    // letzten Taten, die Klang und Stimme lesen; stimmeSek = höchstens eine Zeile der Stimme je so viele Sekunden Spielzeit.
    tatTau: 600,
    tatBuch: 32,
    stimmeSek: 30,
});
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
