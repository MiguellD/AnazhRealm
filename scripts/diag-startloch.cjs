// diag-startloch.cjs — §6.5 (meister-plan, Befund 23): das LOD-START-LOCH messen.
// Frischer Boot (Start-Default-Ring), frühe Zeitpunkte: wie weit reicht der
// GEBAUTE Chunk-Ring vs. das MANTEL-LOCH (B2/V18.118-Stanze) vs. fog.far (A5)?
// Die Hypothesen-Trennung: (a) Mantel fehlt früh (lazy) → Himmel statt Kulisse;
// (b) das Mantel-Loch ist für den VOLLEN Ring dimensioniert → früh klafft
// zwischen gebauten Chunks und Loch-Rand das Void; (c) fog.far verspricht
// Ferne über die gebaute Kante hinaus (liest die ZIEL-Kante, nicht die echte).
//   node scripts/diag-startloch.cjs
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve("save-server.js");
const ART = path.resolve("artifacts");

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
    if (!fs.existsSync(ART)) fs.mkdirSync(ART, { recursive: true });
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
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message.split("\n")[0]));
    try {
        // FRISCHER Boot: localStorage leeren, damit der Start-Default-Ring gilt.
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(() => localStorage.clear());
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        const t0 = Date.now();
        const sample = async (label) => {
            const s = await page.evaluate(() => {
                const r = window.anazhRealm;
                if (!r || !r.state) return null;
                const st = r.state;
                const cfg = typeof r._voxelChunkConfig === "function" ? r._voxelChunkConfig() : null;
                const pm = st.playerMesh ? st.playerMesh.position : { x: 0, z: 0 };
                let maxBuilt = 0;
                let built = 0;
                if (st.voxelChunks) {
                    for (const e of st.voxelChunks.values()) {
                        if (!e || !e.mesh) continue;
                        built++;
                        const cx = (e.cx + 0.5) * cfg.span - 150;
                        const cz = (e.cz + 0.5) * cfg.span - 150;
                        const d = Math.hypot(cx - pm.x, cz - pm.z);
                        if (d > maxBuilt) maxBuilt = d;
                    }
                }
                const M = r.constructor.HORIZON_MANTLE || {};
                const mantle = st.horizonMantle;
                let holeR = null;
                if (st.mantleHoleUniforms && st.mantleHoleUniforms.radius) {
                    holeR = st.mantleHoleUniforms.radius.value;
                }
                return {
                    built,
                    maxBuiltDist: Math.round(maxBuilt),
                    ringRadius: cfg ? cfg.ringRadius : null,
                    ringEdge: cfg ? Math.round((cfg.ringRadius + 0.5) * cfg.span) : null,
                    fogFar: st.scene && st.scene.fog ? Math.round(st.scene.fog.far) : null,
                    mantleDa: !!mantle,
                    mantleHoleR: holeR !== null ? Math.round(holeR) : null,
                    mantleOuter: M.outerRadius || null,
                    terrainReady: !!st.terrainEverGenerated,
                };
            });
            console.log(`t=${((Date.now() - t0) / 1000).toFixed(1)}s [${label}]`, JSON.stringify(s));
            return s;
        };
        // Frühe Zeitpunkte: 1.5s / 4s / 10s / settled (20s)
        await new Promise((r) => setTimeout(r, 1500));
        const a = await sample("früh");
        await page.screenshot({ path: path.join(ART, "startloch-1-frueh.png") });
        await new Promise((r) => setTimeout(r, 2500));
        const b = await sample("4s");
        await new Promise((r) => setTimeout(r, 6000));
        const c = await sample("10s");
        await page.screenshot({ path: path.join(ART, "startloch-2-10s.png") });
        await new Promise((r) => setTimeout(r, 10000));
        const d = await sample("settled");
        await page.screenshot({ path: path.join(ART, "startloch-3-settled.png") });
        // BEFUND-Synthese: das Void-Fenster = mantleHoleR − maxBuiltDist (>0 =
        // sichtbares Loch zwischen Welt-Kante und Mantel-Rand), und fog.far
        // gegen die GEBAUTE Kante (fog deckt nur das Versprochene, A5 liest die
        // Ziel-Kante — früh ist die echte Kante näher).
        for (const [label, s] of [
            ["früh", a],
            ["4s", b],
            ["10s", c],
            ["settled", d],
        ]) {
            if (!s) continue;
            const voidGap = s.mantleHoleR !== null ? s.mantleHoleR - s.maxBuiltDist : null;
            const fogUeberKante = s.fogFar !== null ? s.fogFar - s.maxBuiltDist : null;
            console.log(
                `${label}: gebaut bis ~${s.maxBuiltDist} m (${s.built} Chunks) · Mantel ${s.mantleDa ? "DA" : "FEHLT"}` +
                    (voidGap !== null ? ` · Loch-Rand−Kante = ${voidGap} m` : "") +
                    (fogUeberKante !== null ? ` · fog.far−Kante = ${fogUeberKante} m` : "")
            );
        }
    } catch (e) {
        console.error("Harness:", e.message);
    } finally {
        await browser.close();
        server.kill();
    }
})();
