// diag-warmup-speed.cjs — misst den Warmup (Zeit bis 18 Voxel-Chunks) unter
// drei Regimen: (A) wie heute (render an, real-clock), (B) render gestubbt,
// (C) render gestubbt + synthetische Uhr. Beweist, ob der Render der Warmup-
// Flaschenhals ist.  node scripts/diag-warmup-speed.cjs
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");
const URL = "http://127.0.0.1:4312/index.html";

function startServer() {
    return new Promise((res, rej) => {
        const p = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ok = false;
        const to = setTimeout(() => !ok && rej(new Error("server timeout")), 5000);
        p.stdout.on("data", (c) => /läuft/.test(c.toString()) && ((ok = true), clearTimeout(to), res(p)));
        p.on("error", rej);
    });
}

async function measure(label, opts) {
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
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    const r = await page.evaluate(async (o) => {
        const deadline = performance.now() + 6000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") &&
            performance.now() < deadline
        )
            await new Promise((x) => setTimeout(x, 50));
        const r = window.anazhRealm;
        if (!r || typeof r._gameLoopTick !== "function") return { err: "no loop" };
        if (o.stubRender) r._loopRender = () => {};
        const start = performance.now();
        let synth = performance.now();
        let ticks = 0;
        const CAP = 90000;
        for (;;) {
            ticks++;
            try {
                r._gameLoopTick(o.synthClock ? synth : performance.now());
            } catch (_e) {}
            synth += 16;
            const built = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
            const elapsed = performance.now() - start;
            if (built >= 18 || elapsed >= CAP) {
                return { wall: Math.round(elapsed), ticks, chunks: built };
            }
            await new Promise((x) => setTimeout(x, 0));
        }
    }, opts);
    await browser.close();
    console.log(
        `${label}: ${r.wall ? (r.wall / 1000).toFixed(1) + "s" : "?"} — ${r.ticks} ticks → ${r.chunks} chunks ${r.err || ""}`
    );
}

(async () => {
    const server = await startServer();
    try {
        await measure("A render-an  real-clock  ", { stubRender: false, synthClock: false });
        await measure("B render-stub real-clock  ", { stubRender: true, synthClock: false });
        await measure("C render-stub synth-clock ", { stubRender: true, synthClock: true });
    } finally {
        server.kill();
    }
})();
