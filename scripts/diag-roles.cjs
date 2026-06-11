// diag-roles.cjs — M2-Mess-Auftrag (meister-plan §6.1): die KOMPLETTE Fehl-Rollen-Karte.
// Dumpt für ALLE Built-in-Blueprints: gespeicherte Rolle, _displayRole, emergente Rolle
// (computeBlueprintRole), die Resonanz gegen jede FORM_ROLE_SIGNATURE, _blueprintUseKind,
// rad-Gelenk-Zählung (computeMotionRoles) + sitz-Anker (die M2-Diskriminator-Achsen) und
// _compoundSizeFactor-Proben (Hüll- vs Substanz-Volumen — das Auseinanderzieh-Exploit).
//   node scripts/diag-roles.cjs

const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve(process.argv[2] || "save-server.js");
const SERVER_URL = "http://127.0.0.1:4312/index.html";

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
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message));
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const deadline = performance.now() + 10000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.blueprints) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        const dump = await page.evaluate(() => {
            const r = window.anazhRealm;
            const C = r.constructor;
            const round3 = (x) => Math.round(x * 1e3) / 1e3;
            const sigs = C.FORM_ROLE_SIGNATURES;
            const rows = [];
            for (const name in r.state.blueprints) {
                const bp = r.state.blueprints[name];
                if (!bp || !bp.builtIn) continue;
                const v = r._blueprintProductVector(bp);
                const scores = {};
                for (const role in sigs) scores[role] = round3(r._blueprintResonance(v, sigs[role]));
                // rad-Gelenke + sitz-Anker — die M2-Diskriminator-Daten
                const motion =
                    Array.isArray(bp.parts) && bp.parts.length >= 2
                        ? r.computeMotionRoles(bp.parts, bp.connections)
                        : null;
                const radCount = motion ? motion.filter((m) => m && m.role === "rad").length : 0;
                const sitzConn = Array.isArray(bp.connections)
                    ? bp.connections.some((c) => c && c.type === "sitz")
                    : false;
                rows.push({
                    name,
                    storedRole: bp.role || "(none)",
                    display: r._displayRole(bp),
                    emergent: r.computeBlueprintRole(bp),
                    useKind: r._blueprintUseKind(bp),
                    resonance: scores,
                    radCount,
                    sitzConn,
                    sizeFactor: round3(r._compoundSizeFactor(bp)),
                });
            }
            // Achsen-Rohdaten für die M2-Arithmetik: spread, span (bulk-Basis), Substanz- vs
            // Hüll-Volumen, bein/rad-Zählung — für Wagen/Holzross/Bäume/Trank/Archetypen.
            const axes = {};
            for (const name of [
                "fahrzeug_wagen",
                "reittier_holzross",
                "baum_eiche",
                "trank_lebenssaft",
                "avatar_waechter",
                "geraet_spitzhacke",
                "geraet_schwert",
                "ruestung_brustpanzer",
                "koerper_human",
                "village",
                "glutbrunnen",
            ]) {
                const bp = r.state.blueprints[name];
                if (!bp) continue;
                const ext = r._compoundVisualExtent(bp);
                const span = Math.max(ext.dx || 0, ext.dy || 0, ext.dz || 0);
                let substVol = 0;
                for (const p of bp.parts || []) {
                    const s = p.size || {};
                    substVol += Math.abs((s.x || 0.3) * (s.y || 0.3) * (s.z || 0.3));
                }
                const motion =
                    Array.isArray(bp.parts) && bp.parts.length >= 2
                        ? r.computeMotionRoles(bp.parts, bp.connections)
                        : null;
                const counts = {};
                if (motion) for (const m of motion) if (m) counts[m.role] = (counts[m.role] || 0) + 1;
                axes[name] = {
                    span: round3(span),
                    huellVol: round3((ext.dx || 0) * (ext.dy || 0) * (ext.dz || 0)),
                    substVol: round3(substVol),
                    spread: round3(r._compoundSpread(bp)),
                    sizeFactorHeute: round3(r._compoundSizeFactor(bp)),
                    motionCounts: counts,
                };
            }
            // Exploit-Probe: dasselbe 2-Part-Werk kompakt vs auseinandergezogen
            const mkBp = (spreadM) => ({
                name: "probe",
                parts: [
                    {
                        shape: "box",
                        material: "eisen",
                        position: { x: 0, y: 0, z: 0 },
                        size: { x: 0.4, y: 0.4, z: 0.4 },
                    },
                    {
                        shape: "box",
                        material: "eisen",
                        position: { x: spreadM, y: 0, z: 0 },
                        size: { x: 0.4, y: 0.4, z: 0.4 },
                    },
                ],
            });
            const exploit = {
                kompakt_0_5m: round3(r._compoundSizeFactor(mkBp(0.5))),
                gezogen_3m: round3(r._compoundSizeFactor(mkBp(3))),
                gezogen_10m: round3(r._compoundSizeFactor(mkBp(10))),
            };
            return { floor: C.FORM_ROLE_RESONANCE_FLOOR, rows, exploit, axes };
        });
        console.log(`FORM_ROLE_RESONANCE_FLOOR = ${dump.floor}\n`);
        const pad = (s, n) => String(s).padEnd(n);
        console.log(
            pad("Bauplan", 24) +
                pad("stored", 10) +
                pad("display", 14) +
                pad("emergent", 14) +
                pad("useKind", 9) +
                pad("rad", 4) +
                pad("sitz", 5) +
                pad("size", 6) +
                "Resonanz (soul/portal/consumable/architecture)"
        );
        for (const row of dump.rows) {
            const res = Object.entries(row.resonance)
                .map(([k, v]) => `${k}:${v}`)
                .join(" ");
            console.log(
                pad(row.name, 24) +
                    pad(row.storedRole, 10) +
                    pad(row.display, 14) +
                    pad(row.emergent, 14) +
                    pad(row.useKind, 9) +
                    pad(row.radCount, 4) +
                    pad(row.sitzConn ? "ja" : "-", 5) +
                    pad(row.sizeFactor, 6) +
                    res
            );
        }
        console.log("\nEXPLOIT-PROBE (2× eisen-box 0.4³, nur AUSEINANDERGEZOGEN):");
        console.log(JSON.stringify(dump.exploit, null, 2));
        console.log("\nACHSEN-ROHDATEN (span/Volumina/spread/motion):");
        console.log(JSON.stringify(dump.axes, null, 2));
    } catch (e) {
        console.error("DIAG-FEHLER:", e.message);
        process.exitCode = 1;
    } finally {
        await browser.close();
        server.kill();
    }
})();
