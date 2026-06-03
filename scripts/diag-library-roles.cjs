// diag-library-roles.cjs — misst, WARUM die V17.72-Substanz-Ehrlichkeit scheitert.
// Dumpt für trank_lebenssaft + avatar_waechter: computeBlueprintRole, den Produkt-
// Vektor, die Resonanz gegen jede FORM_ROLE_SIGNATURE, _isBodyShaped + Symmetrie.
//   node scripts/diag-library-roles.cjs

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
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const deadline = performance.now() + 8000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.blueprints) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        const dump = await page.evaluate(() => {
            const r = window.anazhRealm;
            const round = (o) => {
                const out = {};
                for (const k in o) if (Math.abs(o[k]) > 1e-6) out[k] = Math.round(o[k] * 1e3) / 1e3;
                return out;
            };
            const sigs = r.constructor.FORM_ROLE_SIGNATURES;
            const probe = (name) => {
                const bp = r.state.blueprints[name];
                if (!bp) return { MISSING: true };
                const v = r._blueprintProductVector(bp);
                const scores = {};
                for (const role in sigs) scores[role] = Math.round(r._blueprintResonance(v, sigs[role]) * 1e3) / 1e3;
                return {
                    role: r.computeBlueprintRole(bp),
                    floor: r.constructor.FORM_ROLE_RESONANCE_FLOOR,
                    vector: round(v),
                    resonance: scores,
                    isBodyShaped: r._isBodyShaped(bp),
                    isFoodLike: typeof r._isFoodLike === "function" ? r._isFoodLike(bp) : null,
                };
            };
            const bodyDetail = (name) => {
                const bp = r.state.blueprints[name];
                const bbox = r._compoundBBox(bp);
                const sym = r._compoundSymmetry(bp);
                const T = r.constructor.SUBSTANCE_ROLE_THRESHOLDS.body;
                return {
                    spanY: Math.round((bbox.max.y - bbox.min.y) * 1e3) / 1e3,
                    horiz: Math.round(Math.max(bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z) * 1e3) / 1e3,
                    verticalRatio:
                        Math.round(((bbox.max.y - bbox.min.y) / Math.max(bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z)) * 1e3) / 1e3,
                    verticalMin: T.verticalMin,
                    symRatio: Math.round(sym.ratio * 1e3) / 1e3,
                    symMin: T.symmetryMin,
                    limbPairs: sym.limbPairs,
                    minLimbPairs: T.minLimbPairs,
                };
            };
            return {
                trank: probe("trank_lebenssaft"),
                avatar: probe("avatar_waechter"),
                avatarBody: bodyDetail("avatar_waechter"),
            };
        });
        console.log(JSON.stringify(dump, null, 2));
    } catch (e) {
        console.error("DIAG-FEHLER:", e.message);
    } finally {
        await browser.close();
        server.kill();
    }
})();
