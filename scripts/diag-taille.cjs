// diag-taille.cjs — Ω0: die INVENTUR der gefrorenen Taille (docs/taille-spec.md).
//
// Zwei Rollen in EINEM Werkzeug:
//   (1) KONFORMANZ: die vier Draht-Artefakte in `spec/golden/v1/` (blueprint-signed · world-manifest · snapshot-head ·
//       p2p-envelopes), einmal aus den ECHTEN Code-Pfaden gemintet und eingefroren — der heutige Code liest sie und
//       verifiziert ihre Signaturen (ein eingefrorenes Ed25519-Test-JWK, RFC 8032 deterministisch). Sie werden NIE
//       regeneriert (taille-plan Ω0); der Mint lebt in `git log` — fehlt ein Golden, ist die Linse ROT, nie ein neuer Mint.
//   (2) MESSEN (immer): die Round-Trip-Matrix — überlebt ein injiziertes
//       `xZukunft:{…}`-Feld jeden Pfad (Rezepte-Import · Snapshot serialize/
//       deserialize · Manifest-Sanitize · p2p-Stempel)? Plus: welcher Import-Pfad
//       verifiziert/siebt (Riss 3), und die Gott-Mauer-Baseline (Riss 2:
//       härte=10⁶ → _architectureResistance ungeklemmt).
//
//   node scripts/diag-taille.cjs

const { starteBrowser, startProc, eigenePorte } = require("./lib/welt-boot.cjs");
const path = require("path");
const fs = require("fs");

// Der Port des eigenen save-servers: TAILLE_PORT, sonst ein freier des Systems (welt-boot `eigenePorte`) — auf 4312 fände die
// Seite den Spiel-Server des Schöpfers und prüfte dessen Dateien.
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

(async () => {
    const [port] = await eigenePorte("TAILLE_PORT");
    const SERVER_URL = `http://127.0.0.1:${port}/index.html`;
    const server = await startProc("save-server.js", /läuft/, { PORT: String(port) });
    const browser = await starteBrowser({ art: "webgl", zusatz: ["--enable-webgl", "--ignore-gpu-blocklist"] });
    const page = await browser.newPage();
    let fail = false;
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            await window.__weltDa(() => !(!r || !r.state || !r.state.blueprints));
        });

        const result = await page.evaluate(
            async (GOLDEN_JWK, GOLDEN_TIME) => {
                const out = { matrix: {}, findings: [] };

                // ── die goldene Identität adoptieren (deterministische Signaturen) ──
                await r._adoptVibePassJwk(GOLDEN_JWK, GOLDEN_TIME, false);

                // ──────────────────────── MESSEN: die Matrix ────────────────────────
                const M = out.matrix;
                // das Bau-Teil der Proben: ein Kasten mit der Kantung der Hände (RT1, RT2, Riss 2)
                const teil = (material, s) => ({
                    shape: "box",
                    material,
                    position: { x: 0, y: 0, z: 0 },
                    size: { x: s, y: s, z: s },
                    rotation: { x: 0, y: 0, z: 0 },
                    opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
                });

                // RT1 — Rezepte-Import: überlebt xZukunft auf Bauplan/Material/Tags?
                {
                    const srcSave = {
                        worldMeta: { worldId: "taille-rt1-src", slug: "rt1-quelle" },
                        blueprints: [
                            {
                                name: "rt1_bp",
                                label: "RT1",
                                parts: [teil("stein", 1)],
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
                        parts: [teil("stein", 1)],
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
                    // Der Kanal-Empfang am Verhalten: das Original reist mit jedem Feld weiter, gestempelt mit der peerId.
                    const fang = [];
                    r.p2pHandleMessage = (s) => fang.push(JSON.parse(s));
                    try {
                        r._p2pHandleChannelMessage("peer-t", JSON.stringify({ type: "pos", x: 1, y: 2, z: 3, ry: 0, xZukunft: { e: 5 } }));
                    } finally {
                        delete r.p2pHandleMessage;
                    }
                    M.rt4_p2p = {
                        stampKeepsUnknown:
                            obj.xZukunft && obj.xZukunft.e === 5 && obj.pv === r.constructor.PROTO_VERSION,
                        channelPassesOriginal: !!fang[0] && !!fang[0].xZukunft && fang[0].xZukunft.e === 5 && fang[0].peerId === "peer-t",
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
                        parts: [teil("rt_gott", 2)],
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
            GOLDEN_TIME
        );

        // ── KONFORMANZ (immer, wenn golden existiert): der heutige Code muss die
        // eingefrorenen Artefakte LESEN + die Signaturen als "valid" verifizieren.
        if (!result.error) {
            const golden = {
                blueprint: JSON.parse(fs.readFileSync(path.join(GOLDEN_DIR, "blueprint-signed.json"), "utf8")),
                manifest: JSON.parse(fs.readFileSync(path.join(GOLDEN_DIR, "world-manifest.json"), "utf8")),
            };
            const conf = await page.evaluate(async (g) => {
                const out = {};
                const deser = r._deserializeBlueprint(g.blueprint);
                out.blueprintReadable = !!deser;
                out.blueprintSig = deser ? await r.verifyBlueprintSignature(deser) : "unreadable";
                // KONSUM am EINEN Eingang: _admitForeignArtifact prüft die Signatur und hängt das eigene Glied an die Kette.
                const ruft = (k, bp) => {
                    let n = 0;
                    const f = r[k];
                    r[k] = (...a) => (n++, f.apply(r, a));
                    try {
                        r._admitForeignArtifact(bp);
                    } finally {
                        delete r[k];
                    }
                    return n > 0;
                };
                out.admitPrueftSignatur = ruft("verifyBlueprintSignature", g.blueprint);
                out.admitHaengtGlied = ruft("_appendProvenance", Object.assign({}, g.blueprint, { provenance: [{ by: "ab".repeat(32), at: 1 }] }));
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
                conf.manifestSig !== "valid" ||
                !conf.admitPrueftSignatur ||
                !conf.admitHaengtGlied
            ) {
                console.error("KONFORMANZ-BRUCH: die Taille wurde verletzt (golden nicht mehr lesbar/valid).");
                fail = true;
            }
        }

        if (result.error) {
            console.error("FEHLER:", result.error);
            fail = true;
        } else {
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
            if (!m.rt4_p2p.channelPassesOriginal) findings.push("LÜCKE: der Kanal-Empfang reicht das Original nicht weiter");
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
