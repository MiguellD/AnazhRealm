// Aufruf (aus der Wurzel des Klons): node <ort>/echt-blick.cjs <profil-ordner> <name> [port=4455]
// DER BLICK AM ECHTEN SERVER: startet `node save-server.js` (PORT), dann Chrome am echten Renderer OHNE DevTools-Sitzung gegen
// http://127.0.0.1:<port>/index.html (das Profil bleibt, wie es ist — frisch oder vom Lauf davor). Erst nach WARTE_1 s (Standard 35)
// verbindet sich Puppeteer über den Debug-Port, schießt ein Bild und liest: wann das erste Weltbild stand, jede Zeile des Logs
// „WELTBILD NICHT GANZ" / „Weltbild steht ohne", je Neben-Faden Geburt · Nachrichten · offene Aufträge, die Zahl der Bäume, die
// Pflanz-Schlange. Nach WARTE_2 s (Standard 30) dasselbe noch einmal — kommt der Wald nach, oder nie? → <name>-1.png, <name>-2.png,
// <name>.json neben dem Profil.
const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");
const [profil, name, portRoh] = process.argv.slice(2);
const PORT = Number(portRoh || 4455);
const DEBUG = PORT + 1;
const OUT = path.dirname(path.resolve(profil));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lies = () =>
    (() => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { fehler: "keine Welt" };
        const st = r.state;
        const n = (v) => (v ? (v.size != null ? v.size : v.length) | 0 : 0);
        return {
            jetzt: Math.round(performance.now()),
            version: r.constructor.VERSION,
            isoliert: self.crossOriginIsolated === true,
            weltbildDa: st._weltbildDa || null,
            faeden: [...(r._nebenFaeden || [])].map(([k, f]) => [k, Math.round(f.geboren || 0), f.gehoert, f.pending.size]),
            voxelFaden: !!st.voxelWorker,
            baeume: (st.architectures || []).filter((e) => e && r._kronenRadiusFuer(e.type, e.scale)).length,
            eintraege: n(st.architectures),
            schlange: n(st.pendingVegSpawns),
            pflanzWarten: n(r._waldPflanzWarten),
            saat: n(r._saatOffen),
            chunks: n(st.voxelChunks),
            luecken: (() => {
                try {
                    return r._weltbildLuecken(true).map((l) => l.satz);
                } catch (e) {
                    return ["WURF " + e.message];
                }
            })(),
            log: (st.logBuffer || []).filter((z) => /WELTBILD NICHT GANZ|Weltbild steht ohne|antwortete nie|Faden (warf|brach)/.test(z)).slice(-8),
        };
    })();
(async () => {
    const server = cp.spawn(process.execPath, ["save-server.js"], { env: { ...process.env, PORT: String(PORT) }, stdio: ["ignore", "pipe", "pipe"] });
    let bereit = false;
    server.stdout.on("data", (d) => /läuft/.test(String(d)) && (bereit = true));
    for (let i = 0; i < 100 && !bereit; i++) await sleep(100);
    if (!bereit) throw new Error("der save-server startete nicht");
    const puppeteer = require(path.resolve("node_modules/puppeteer"));
    const exe = puppeteer.executablePath();
    const args = ["--headless=new", "--no-sandbox", ...require(path.resolve("scripts/lib/software-gpu.cjs")).echteWebGpuArgs(), "--window-size=1280,720", `--user-data-dir=${path.resolve(profil)}`, `--remote-debugging-port=${DEBUG}`, `http://127.0.0.1:${PORT}/index.html`];
    const t0 = Date.now();
    const chrome = cp.spawn(exe, args, { stdio: "ignore" });
    const aus = { name, port: PORT, start: new Date().toISOString(), blicke: [] };
    try {
        await sleep(Number(process.env.WARTE_1 || 35) * 1000);
        const ws = await new Promise((ok, nein) =>
            http
                .get({ host: "127.0.0.1", port: DEBUG, path: "/json/version" }, (r) => {
                    let s = "";
                    r.on("data", (d) => (s += d));
                    r.on("end", () => ok(JSON.parse(s).webSocketDebuggerUrl));
                })
                .on("error", nein)
        );
        const browser = await puppeteer.connect({ browserWSEndpoint: ws, defaultViewport: null });
        const seite = (await browser.pages()).find((p) => /index[.]html/.test(p.url())) || (await browser.pages())[0];
        for (const nr of [1, 2]) {
            if (nr === 2) await sleep(Number(process.env.WARTE_2 || 30) * 1000);
            const stand = await seite.evaluate(`(${lies.toString()})()`);
            await seite.screenshot({ path: path.join(OUT, `${name}-${nr}.png`) });
            aus.blicke.push({ nachS: Math.round((Date.now() - t0) / 1000), ...stand });
            console.log(`BLICK ${nr} nach ${Math.round((Date.now() - t0) / 1000)} s:`, JSON.stringify(stand));
        }
        await browser.disconnect();
    } finally {
        fs.writeFileSync(path.join(OUT, name + ".json"), JSON.stringify(aus, null, 1));
        chrome.kill();
        server.kill();
    }
})().then(
    () => process.exit(0),
    (e) => {
        console.error("FEHLER", e.stack || e);
        process.exit(2);
    }
);
