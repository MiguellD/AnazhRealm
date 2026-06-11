// diag-taille.cjs — Ω0: die INVENTUR der gefrorenen Taille (docs/taille-plan.md §3).
//
// Zwei Rollen in EINEM Werkzeug:
//   (1) MINT (einmalig): existiert `spec/golden/v1/` NICHT, werden die vier
//       Draht-Artefakte aus den ECHTEN Code-Pfaden erzeugt + eingefroren:
//         blueprint-signed.json  — kanonischer signierter Bauplan (parts/
//                                  connections/opChain/provenance/signature)
//         world-manifest.json    — signiertes Welt-Manifest (exportWorldManifest)
//         snapshot-head.json     — der Snapshot-KOPF als SCHEMA (Keys + Typen,
//                                  nicht der Welt-Inhalt)
//         p2p-envelopes.json     — ein Umschlag pro Kern-Nachrichtentyp (pv-Vertrag)
//       Die Signaturen sind DETERMINISTISCH: ein eingefrorenes Ed25519-Test-JWK
//       (RFC 8032 — deterministische Signatur) → die goldene Datei ist für immer
//       verifizierbar. DIE DATEIEN WERDEN NIE REGENERIERT (git, taille-plan Ω0).
//   (2) MESSEN (immer): die Round-Trip-Matrix — überlebt ein injiziertes
//       `xZukunft:{…}`-Feld jeden Pfad (Rezepte-Import · Snapshot serialize/
//       deserialize · Manifest-Sanitize · p2p-Stempel)? Plus: welcher Import-Pfad
//       verifiziert/siebt (Riss 3), und die Gott-Mauer-Baseline (Riss 2:
//       härte=10⁶ → _architectureResistance ungeklemmt).
//
//   node scripts/diag-taille.cjs

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve("save-server.js");
const SERVER_URL = "http://127.0.0.1:4312/index.html";
const GOLDEN_DIR = path.resolve("spec/golden/v1");

// Das EINGEFRORENE Test-Schlüsselpaar der goldenen Dateien (nur für golden —
// nie eine Spieler-Identität). Ed25519 signiert deterministisch → Mint ist
// reproduzierbar, Verifikation ewig.
const GOLDEN_JWK = {
    key_ops: ["sign"],
    ext: true,
    alg: "Ed25519",
    crv: "Ed25519",
    d: "chfphuM4UT1QEwi0896YBuk-YPJOgX4Z-loOO3wUjdI",
    x: "4RKySaUFQjfj7zj7NO5Qmf_1ByhKDcAYcwaFHgPNkd4",
    kty: "OKP",
};
const GOLDEN_TIME = 1700000000000; // feste Zeit für alle nicht-signierten Zeitfelder

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 5000);
        proc.stdout.on("data", (c) => {
            if (!ready && /läuft/.test(c.toString())) {
                ready = true;
                clearTimeout(to);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    const minting = !fs.existsSync(GOLDEN_DIR);
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    const page = await browser.newPage();
    let fail = false;
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const deadline = performance.now() + 12000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.blueprints) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 50));
        });

        const result = await page.evaluate(
            async (GOLDEN_JWK, GOLDEN_TIME, minting) => {
                const r = window.anazhRealm;
                const out = { mint: null, matrix: {}, findings: [] };

                // ── die goldene Identität adoptieren (deterministische Signaturen) ──
                await r._adoptVibePassJwk(GOLDEN_JWK, GOLDEN_TIME, false);

                // ───────────────────────── MINT (nur einmal) ─────────────────────────
                if (minting) {
                    const mint = {};
                    // (a) der kanonische signierte Bauplan — voll: drei Materialien,
                    // drei Formen, opChain, connections, Rolle (weapon+roleManual =
                    // der Riss-1-Fall: die Behauptung reist in der Signatur),
                    // forgedPrecision, provenance.
                    const op = () => [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }];
                    r.state.blueprints["taille_golden"] = {
                        name: "taille_golden",
                        label: "Taille-Golden",
                        builtIn: false,
                        role: "weapon",
                        roleManual: true,
                        forgedPrecision: 0.8,
                        parts: [
                            {
                                shape: "cylinder",
                                material: "holz",
                                position: { x: 0, y: 0.8, z: 0 },
                                size: { x: 0.18, y: 1.6, z: 0.18 },
                                rotation: { x: 0, y: 0, z: 0 },
                                opChain: op(),
                            },
                            {
                                shape: "box",
                                material: "stein",
                                position: { x: 0, y: 1.7, z: 0 },
                                size: { x: 0.5, y: 0.3, z: 0.3 },
                                rotation: { x: 0, y: 0, z: 0 },
                                opChain: op(),
                            },
                            {
                                shape: "cone",
                                material: "eisen",
                                position: { x: 0, y: 2.0, z: 0 },
                                size: { x: 0.3, y: 0.5, z: 0.3 },
                                rotation: { x: 0, y: 0, z: 0 },
                                opChain: op(),
                            },
                        ],
                        connections: [
                            { type: "hafting", partA: 0, partB: 1 },
                            { type: "welding", partA: 1, partB: 2 },
                        ],
                    };
                    const sig = await r.signBlueprint("taille_golden", { skipConfirm: true });
                    if (!sig.ok) return { error: "signBlueprint scheiterte: " + sig.reason };
                    const live = r.state.blueprints["taille_golden"];
                    // Draht-Form: _serializeBlueprint + der Ω-VERTRAG (provenance reist —
                    // heute strippt der Snapshot sie, Ω2 heilt das; golden friert das SOLL).
                    const wire = r._serializeBlueprint(live);
                    wire.provenance = (live.provenance || []).map((l) => ({ by: l.by, at: GOLDEN_TIME }));
                    wire.signedAt = GOLDEN_TIME;
                    mint.blueprint = wire;

                    // (b) das signierte Welt-Manifest (Built-in-Welt „fluid").
                    const sw = await r.signWorld("fluid", { skipConfirm: true });
                    if (!sw.ok) return { error: "signWorld scheiterte: " + sw.reason };
                    const exp = r.exportWorldManifest("fluid");
                    if (!exp.ok) return { error: "exportWorldManifest scheiterte: " + exp.reason };
                    const man = JSON.parse(JSON.stringify(exp.manifest));
                    man.signedAt = GOLDEN_TIME;
                    man.provenance = (man.provenance || []).map((l) => ({ by: l.by, at: GOLDEN_TIME }));
                    mint.manifest = man;

                    // (c) der Snapshot-KOPF als SCHEMA (Keys + Typen — der Inhalt ist
                    // welt-abhängig und gehört NICHT in die Taille).
                    const snap = r.buildStateSnapshot();
                    const schema = {};
                    for (const k of Object.keys(snap).sort()) {
                        const v = snap[k];
                        schema[k] = Array.isArray(v) ? "array" : v === null ? "null" : typeof v;
                    }
                    mint.snapshotHead = {
                        v: 1,
                        schema,
                        worldMetaKeys: Object.keys(snap.worldMeta || {}).sort(),
                    };

                    // (d) ein p2p-Umschlag pro Kern-Typ (pv-Vertrag). Die Feld-Listen
                    // sind source-verifiziert (der Mess-Teil unten prüft Handler+Sender).
                    mint.envelopes = {
                        v: 1,
                        pv: r.constructor.PROTO_VERSION,
                        types: [
                            { type: "pos", fields: ["x", "y", "z", "ry"] },
                            { type: "dsl", fields: ["program"] },
                            { type: "soul", fields: ["soul"] },
                            { type: "aura", fields: ["hue", "intensity"] },
                            { type: "vibe", fields: ["vibePassId", "proof"] },
                            { type: "creature-pos", fields: ["list"] },
                            { type: "social-rating", fields: ["r"] },
                            { type: "subworld-net", fields: ["worldId", "data"] },
                        ],
                    };
                    out.mint = mint;
                }

                // ──────────────────────── MESSEN: die Matrix ────────────────────────
                const M = out.matrix;

                // RT1 — Rezepte-Import: überlebt xZukunft auf Bauplan/Material/Tags?
                {
                    const srcSave = {
                        worldMeta: { worldId: "taille-rt1-src", slug: "rt1-quelle" },
                        blueprints: [
                            {
                                name: "rt1_bp",
                                label: "RT1",
                                parts: [
                                    {
                                        shape: "box",
                                        material: "stein",
                                        position: { x: 0, y: 0, z: 0 },
                                        size: { x: 1, y: 1, z: 1 },
                                        rotation: { x: 0, y: 0, z: 0 },
                                        opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
                                    },
                                ],
                                connections: [],
                                xZukunft: { a: 1 },
                            },
                        ],
                        materials: [
                            {
                                name: "rt1_mat",
                                label: "RT1-Stoff",
                                tags: { härte: 0.5, "x:fremd": 0.7 },
                                xZukunft: { b: 2 },
                            },
                        ],
                        tools: [],
                    };
                    localStorage.setItem(r.worldStorageKey("taille-rt1-src"), JSON.stringify(srcSave));
                    const res = r.importRecipesFromWorld("taille-rt1-src");
                    const bp = r.state.blueprints["rt1_bp"];
                    const mat = r.state.materials["rt1_mat"];
                    M.rt1_import = {
                        ok: !!(res && res.ok),
                        bpUnknownSurvives: !!(bp && bp.xZukunft && bp.xZukunft.a === 1),
                        matUnknownSurvives: !!(mat && mat.xZukunft && mat.xZukunft.b === 2),
                        matForeignTagSurvives: !!(mat && mat.tags && mat.tags["x:fremd"] === 0.7),
                    };
                    // Riss 3: prüft der Import irgendwas? (Ω3: die Wände leben im
                    // EINEN Eingang _admitForeignArtifact — der Import ruft ihn.)
                    const importSrc = r.importRecipesFromWorld.toString();
                    const admitSrc =
                        typeof r._admitForeignArtifact === "function" ? r._admitForeignArtifact.toString() : "";
                    const src = importSrc + admitSrc;
                    M.rt1_importChecks = {
                        importUsesAdmit: /_admitForeignArtifact/.test(importSrc),
                        verifiesSignature: /verifyBlueprintSignature/.test(src),
                        sievesTainted: /_artifactProvenanceTainted/.test(src),
                        appendsProvenance: /_appendProvenance/.test(src),
                        rederivesRole: /_refreshBlueprintRoleEmergent|computeBlueprintRole/.test(src),
                    };
                    localStorage.removeItem(r.worldStorageKey("taille-rt1-src"));
                    delete r.state.blueprints["rt1_bp"];
                    delete r.state.materials["rt1_mat"];
                }

                // RT2 — Snapshot-Zwilling: serialize/deserialize.
                {
                    const live = {
                        name: "rt2_bp",
                        label: "RT2",
                        builtIn: false,
                        parts: [
                            {
                                shape: "box",
                                material: "stein",
                                position: { x: 0, y: 0, z: 0 },
                                size: { x: 1, y: 1, z: 1 },
                                rotation: { x: 0, y: 0, z: 0 },
                                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
                            },
                        ],
                        connections: [],
                        xZukunft: { c: 3 },
                        provenance: [{ by: "ab".repeat(32), at: 1 }],
                    };
                    const ser = r._serializeBlueprint(live);
                    const deser = r._deserializeBlueprint({ ...ser, xZukunft: { c: 3 } });
                    M.rt2_snapshot = {
                        serializeKeepsUnknown: !!(ser.xZukunft && ser.xZukunft.c === 3),
                        serializeKeepsProvenance: Array.isArray(ser.provenance) && ser.provenance.length === 1,
                        deserializeKeepsUnknown: !!(deser && deser.xZukunft && deser.xZukunft.c === 3),
                        deserializeKeepsProvenance: !!(deser && Array.isArray(deser.provenance)),
                    };
                }

                // RT3 — Manifest-Sanitize.
                {
                    const clean = r._sanitizeImportedManifest({
                        id: "rt3-welt",
                        label: "RT3",
                        world: "worlds/fluid/",
                        dsl: ["set_weather"],
                        xZukunft: { d: 4 },
                    });
                    M.rt3_manifest = {
                        accepted: !!clean,
                        unknownSurvives: !!(clean && clean.xZukunft && clean.xZukunft.d === 4),
                    };
                }

                // RT4 — p2p: der pv-Stempel ist non-destruktiv; der Kanal-Empfang
                // (_p2pMsgFromChannel) reicht das ORIGINAL-Objekt durch (re-stringify
                // mit allen Feldern = must-preserve am Kanal). Ein Peer-zu-Peer-RELAY
                // existiert im Voll-Mesh nicht (kommt erst mit Stern-ab-6/F2 — dann
                // MUSS es das Original weiterreichen, Spec-Anmerkung).
                {
                    const obj = { type: "probe", xZukunft: { e: 5 } };
                    r.p2pSend(obj);
                    const fromChannel = r._p2pHandleChannelMessage.toString();
                    M.rt4_p2p = {
                        stampKeepsUnknown:
                            obj.xZukunft && obj.xZukunft.e === 5 && obj.pv === r.constructor.PROTO_VERSION,
                        channelPassesOriginal: /msg\.peerId = peerId;[\s\S]*JSON\.stringify\(msg\)/.test(fromChannel),
                    };
                }

                // Riss 2 — die GOTT-MAUER-Baseline: härte=10⁶ ungeklemmt am Abbau-Leser?
                {
                    r.state.materials["rt_gott"] = {
                        name: "rt_gott",
                        label: "Gott-Stoff",
                        builtIn: false,
                        tags: { ...r.constructor.MATERIAL_TAG_DEFAULTS, härte: 1e6, dichte: 1e6 },
                    };
                    r.state.blueprints["rt_gott_mauer"] = {
                        name: "rt_gott_mauer",
                        label: "Gott-Mauer",
                        builtIn: false,
                        parts: [
                            {
                                shape: "box",
                                material: "rt_gott",
                                position: { x: 0, y: 0, z: 0 },
                                size: { x: 2, y: 2, z: 2 },
                                rotation: { x: 0, y: 0, z: 0 },
                                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
                            },
                        ],
                        connections: [],
                    };
                    const res = r._architectureResistance({ type: "rt_gott_mauer" });
                    const fit = r._harvestFitnessFromResist(res);
                    M.riss2_gottmauer = {
                        mineResist: Math.round(res.mineResist),
                        fit: fit.fit,
                        yieldMult: fit.yieldMult,
                        unbreakable: fit.fit < 0.001,
                    };
                    delete r.state.blueprints["rt_gott_mauer"];
                    delete r.state.materials["rt_gott"];
                }

                return out;
            },
            GOLDEN_JWK,
            GOLDEN_TIME,
            minting
        );

        // ── KONFORMANZ (immer, wenn golden existiert): der heutige Code muss die
        // eingefrorenen Artefakte LESEN + die Signaturen als "valid" verifizieren.
        if (!result.error && fs.existsSync(GOLDEN_DIR)) {
            const golden = {
                blueprint: JSON.parse(fs.readFileSync(path.join(GOLDEN_DIR, "blueprint-signed.json"), "utf8")),
                manifest: JSON.parse(fs.readFileSync(path.join(GOLDEN_DIR, "world-manifest.json"), "utf8")),
            };
            const conf = await page.evaluate(async (g) => {
                const r = window.anazhRealm;
                const out = {};
                const deser = r._deserializeBlueprint(g.blueprint);
                out.blueprintReadable = !!deser;
                out.blueprintSig = deser ? await r.verifyBlueprintSignature(deser) : "unreadable";
                const man = r._sanitizeImportedManifest({ ...g.manifest, id: "taille-golden-konformanz" });
                out.manifestReadable = !!man;
                out.manifestSig =
                    man && man.signature
                        ? (await r._vibeVerify(
                              r._canonicalManifest({ ...g.manifest }),
                              man.signature,
                              man.authorPubKey
                          ))
                            ? "valid"
                            : "invalid"
                        : "missing";
                return out;
            }, golden);
            console.log("\n── KONFORMANZ (golden → heutiger Code) ──");
            console.log(JSON.stringify(conf, null, 2));
            if (
                !conf.blueprintReadable ||
                conf.blueprintSig !== "valid" ||
                !conf.manifestReadable ||
                conf.manifestSig !== "valid"
            ) {
                console.error("KONFORMANZ-BRUCH: die Taille wurde verletzt (golden nicht mehr lesbar/valid).");
                fail = true;
            }
        }

        if (result.error) {
            console.error("FEHLER:", result.error);
            fail = true;
        } else {
            if (minting && result.mint) {
                fs.mkdirSync(GOLDEN_DIR, { recursive: true });
                const write = (name, obj) =>
                    fs.writeFileSync(path.join(GOLDEN_DIR, name), JSON.stringify(obj, null, 2) + "\n");
                write("blueprint-signed.json", result.mint.blueprint);
                write("world-manifest.json", result.mint.manifest);
                write("snapshot-head.json", result.mint.snapshotHead);
                write("p2p-envelopes.json", result.mint.envelopes);
                console.log(`GEMINTET → ${GOLDEN_DIR} (4 Dateien — ab jetzt EINGEFROREN, nie regenerieren)`);
            } else {
                console.log("Golden-Dateien existieren — kein Mint (eingefroren).");
            }
            console.log("\n── Ω0 ROUND-TRIP-MATRIX (must-preserve: überlebt xZukunft?) ──");
            console.log(JSON.stringify(result.matrix, null, 2));
            const m = result.matrix;
            const findings = [];
            if (!m.rt2_snapshot.serializeKeepsUnknown) findings.push("LÜCKE: _serializeBlueprint strippt Unbekanntes");
            if (!m.rt2_snapshot.serializeKeepsProvenance)
                findings.push("LÜCKE: _serializeBlueprint strippt provenance (R4-Kette stirbt im Save)");
            if (!m.rt2_snapshot.deserializeKeepsUnknown)
                findings.push("LÜCKE: _deserializeBlueprint strippt Unbekanntes");
            if (!m.rt3_manifest.unknownSurvives) findings.push("LÜCKE: _sanitizeImportedManifest strippt Unbekanntes");
            if (!m.rt1_importChecks.importUsesAdmit || !m.rt1_importChecks.sievesTainted)
                findings.push("RISS 3: importRecipesFromWorld prüft nichts (kein Admit-Eingang, kein Tainted-Sieb)");
            if (m.riss2_gottmauer.unbreakable)
                findings.push(`RISS 2: Gott-Mauer ungeklemmt (mineResist=${m.riss2_gottmauer.mineResist}, fit→0)`);
            console.log("\n── BEFUNDE ──");
            for (const f of findings) console.log("  • " + f);
            if (!findings.length) console.log("  (keine — die Taille ist dicht)");
        }
    } catch (e) {
        console.error("DIAG-FEHLER:", e.message);
        fail = true;
    } finally {
        await browser.close();
        server.kill();
    }
    process.exit(fail ? 1 : 0);
})();
