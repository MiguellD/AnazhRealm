// Haupt-Faden-Belegung je Bild aus einem CDP-Trace (devtools.timeline) der laufenden Werkbank-Seite.
// node belegung.cjs <profilDir> <steuerPort> <sek> <ausJson> [lauf-args-json]
// Startet den Trace, ruft /lauf der Werkbank (der echte rAF-Loop), stoppt den Trace und rechnet je Bild-Intervall
// (FireAnimationFrame-Start zum nächsten) die Summe der Top-Level-Aufgaben (RunTask/ThreadControllerImpl::RunTask)
// auf dem Haupt-Faden der Seite.
const fs = require("fs");
const path = require("path");
const http = require("http");
const puppeteer = require(path.join("C:/Users/micha/AnazhRealm-profiband/node_modules/puppeteer"));
const [profilDir, steuerPort, sek, aus, laufJson] = process.argv.slice(2);
const zeilen = fs.readFileSync(path.join(profilDir, "DevToolsActivePort"), "utf8").split(/\r?\n/);
const ws = `ws://127.0.0.1:${zeilen[0]}${zeilen[1]}`;
const rufe = (url, body) =>
    new Promise((res, rej) => {
        const d = JSON.stringify(body);
        const q = http.request(
            { host: "127.0.0.1", port: Number(steuerPort), path: url, method: "POST", headers: { "content-type": "application/json", "content-length": Buffer.byteLength(d) } },
            (r) => {
                let s = "";
                r.on("data", (c) => (s += c));
                r.on("end", () => res(s));
            }
        );
        q.on("error", rej);
        q.end(d);
    });
(async () => {
    const browser = await puppeteer.connect({ browserWSEndpoint: ws, defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find((p) => /index\.html/.test(p.url())) || pages[0];
    const cdp = await page.target().createCDPSession();
    const ev = [];
    cdp.on("Tracing.dataCollected", (e) => ev.push(...e.value));
    const fertig = new Promise((r) => cdp.once("Tracing.tracingComplete", r));
    await cdp.send("Tracing.start", {
        traceConfig: {
            recordMode: "recordContinuously",
            includedCategories: ["toplevel", "devtools.timeline"],
        },
        transferMode: "ReportEvents",
    });
    await page.evaluate(() => {
        if (window.__bildMarke) return;
        window.__bildMarke = 1;
        const f = GPUCanvasContext.prototype.getCurrentTexture;
        GPUCanvasContext.prototype.getCurrentTexture = function () {
            console.timeStamp("anazh-bild");
            return f.apply(this, arguments);
        };
    });
    const laufArgs = Object.assign({ sek: Number(sek), ein: 2, regler: "voll", tiere: "frei", ruhe: 0 }, laufJson ? JSON.parse(laufJson) : {});
    const laufAus = await rufe("/lauf", laufArgs);
    await cdp.send("Tracing.end");
    await fertig;
    await cdp.detach();
    browser.disconnect();
    // der Haupt-Faden der Seite: der Faden mit den FireAnimationFrame-Ereignissen
    const fa = ev.filter((e) => e.name === "FireAnimationFrame");
    const zaehl = new Map();
    for (const e of fa) zaehl.set(`${e.pid}:${e.tid}`, (zaehl.get(`${e.pid}:${e.tid}`) || 0) + 1);
    const [haupt] = [...zaehl.entries()].sort((a, b) => b[1] - a[1])[0];
    const [pid, tid] = haupt.split(":").map(Number);
    const auf = ev.filter((e) => e.pid === pid && e.tid === tid);
    const tasks = auf
        .filter((e) => e.ph === "X" && (e.name === "RunTask" || e.name === "ThreadControllerImpl::RunTask") && e.dur > 0)
        .sort((a, b) => a.ts - b.ts);
    // verschachtelte Top-Level-Aufgaben nur einmal (die äußere)
    const top = [];
    let ende = -Infinity;
    for (const t of tasks) {
        if (t.ts >= ende) {
            top.push(t);
            ende = t.ts + t.dur;
        }
    }
    const marken = auf.filter((e) => e.name === "TimeStamp" && e.args && e.args.data && e.args.data.message === "anazh-bild").map((e) => e.ts).sort((a, b) => a - b);
    // je Top-Level-Aufgabe höchstens EIN Bild (mehrere Rufe von getCurrentTexture im selben Takt)
    const starts = [];
    for (const m of marken) {
        const t = top.find((x) => x.ts <= m && m <= x.ts + x.dur);
        const key = t ? t.ts : m;
        if (!starts.length || starts[starts.length - 1] !== key) starts.push(key);
    }
    const fa2 = auf.filter((e) => e.name === "FireAnimationFrame").length;
    // das Fenster des Laufs: die letzten `sek` Sekunden der Bilder (ohne `ein`)
    const t1 = starts[starts.length - 1];
    const t0 = t1 - Number(sek) * 1e6;
    const s = starts.filter((t) => t >= t0);
    const jeBild = [];
    let k = 0;
    for (let i = 0; i + 1 < s.length; i++) {
        const [a, b] = [s[i], s[i + 1]];
        let busy = 0;
        while (k < top.length && top[k].ts + top[k].dur <= a) k++;
        for (let j = k; j < top.length && top[j].ts < b; j++) {
            const x0 = Math.max(a, top[j].ts);
            const x1 = Math.min(b, top[j].ts + top[j].dur);
            if (x1 > x0) busy += x1 - x0;
        }
        jeBild.push({ busy: busy / 1000, intervall: (b - a) / 1000 });
    }
    const q = (arr, p) => {
        const v = [...arr].sort((x, y) => x - y);
        return +v[Math.min(v.length - 1, Math.floor(p * v.length))].toFixed(2);
    };
    const B = jeBild.map((x) => x.busy);
    const I = jeBild.map((x) => x.intervall);
    const o = {
        bilder: jeBild.length,
        belegungMs: { p50: q(B, 0.5), p95: q(B, 0.95), p99: q(B, 0.99), max: q(B, 1), mittel: +(B.reduce((a, b) => a + b, 0) / B.length).toFixed(2) },
        intervallMs: { p50: q(I, 0.5), p95: q(I, 0.95) },
        anteil: +(B.reduce((a, b) => a + b, 0) / I.reduce((a, b) => a + b, 0)).toFixed(3),
        faden: haupt, marken: marken.length, rafTakte: fa2,
        ereignisse: ev.length,
        lauf: (() => {
            try {
                const l = JSON.parse(laufAus);
                return { fps: l.fps, frameMs: l.frameMs, cpuTaktMs: l.cpuTaktMs, regler: l.regler, vramMB: l.vramMB && l.vramMB.jetzt };
            } catch (_e) {
                return laufAus.slice(0, 300);
            }
        })(),
    };
    fs.writeFileSync(aus, JSON.stringify(o, null, 1));
    console.log(JSON.stringify(o, null, 1));
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
