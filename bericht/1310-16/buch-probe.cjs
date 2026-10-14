// 1310-16 Hebel 3: DIE KETTE DES BUCHS — echte GPU, Boot über den save-server; der Foundry-Worker wird umhüllt (sein Boot-Blob
// neu verpackt): jede Nachricht des Workers trägt ihre Sende-Zeit (__tw), der Worker merkt die Empfangs-Zeit jeder Anfrage
// (__twEmpf). Auf dem Haupt-Faden: Worker-Start, jede gesendete Anfrage, jede behandelte Antwort, das erste Weltbild.
//   node buch-probe.cjs <instrument-baum> <datei.json> [http://localhost:4312] [profil-ordner]
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const [instr, datei, seite = "http://localhost:4312", profilArg] = process.argv.slice(2);
const puppeteer = require(require.resolve("puppeteer", { paths: [instr] }));
const { echteWebGpuArgs } = require(path.join(instr, "scripts/lib/software-gpu.cjs"));
const HOOK = () => {
    const L = (window.__buch = { ev: [], t0: performance.timeOrigin });
    const jetzt = () => Date.now();
    const VORSPANN =
        "(function(){var E={};self.__twStart=Date.now();self.addEventListener('message',function(e){var d=e.data;if(d&&d.type)E[d.type]=Date.now();});" +
        "var pm=self.postMessage.bind(self);self.postMessage=function(m,t){try{if(m&&typeof m==='object'&&m.type){m.__tw=Date.now();m.__twStart=self.__twStart;" +
        "if(m.type==='book')m.__twEmpf=E['get-book'];if(m.type==='ready')m.__twEmpf=null;}}catch(_e){}return t?pm(m,t):pm(m);};})();\n";
    const oc = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (b) => {
        if (b instanceof Blob && /javascript/.test(b.type || "")) return oc(new Blob([VORSPANN, b], { type: b.type }));
        return oc(b);
    };
    const W = window.Worker;
    let nr = 0;
    window.Worker = new Proxy(W, {
        construct(T, args) {
            const url = args[0];
            const w = new T(...args);
            if (typeof url === "string" && url.startsWith("blob:")) {
                const id = "blob#" + ++nr;
                L.ev.push({ was: "worker-neu", typ: id, t: jetzt() });
                w.addEventListener("message", (e) => {
                    const d = e.data || {};
                    L.ev.push({ was: "haupt-behandelt", typ: id + " " + d.type, t: jetzt(), tw: d.__tw || null, twStart: d.__twStart || null, twEmpf: d.__twEmpf || null });
                });
                const pm = w.postMessage.bind(w);
                w.postMessage = (m, ...r) => {
                    L.ev.push({ was: "haupt-sendet", typ: id + " " + (m && m.type), t: jetzt() });
                    return pm(m, ...r);
                };
            }
            return w;
        },
    });
};
(async () => {
    const profil = profilArg ? path.resolve(profilArg) : fs.mkdtempSync(path.join(os.tmpdir(), "k16-buch-"));
    fs.mkdirSync(profil, { recursive: true });
    const browser = await puppeteer.launch({ headless: false, userDataDir: profil, protocolTimeout: 600000,
        defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 }, args: [...echteWebGpuArgs(), "--window-size=1940,1200"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(HOOK);
    const navStart = Date.now();
    await page.goto(seite + "/index.html", { waitUntil: "domcontentloaded", timeout: 120000 });
    let da = 0;
    while (Date.now() - navStart < 120000) {
        da = await page.evaluate(() => (window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state._weltbildDa) || 0).catch(() => 0);
        if (da) break;
        await new Promise((r) => setTimeout(r, 250));
    }
    const out = await page.evaluate(() => window.__buch);
    await browser.close();
    if (!profilArg) fs.rmSync(profil, { recursive: true, force: true });
    const t0 = out.t0;
    const rel = (t) => (t ? +((t - t0) / 1000).toFixed(2) : null);
    const zeilen = out.ev.map((e) => Object.assign({}, e, { t: rel(e.t), tw: rel(e.tw), twStart: rel(e.twStart), twEmpf: rel(e.twEmpf) }));
    const res = { weltbild: +(da / 1000).toFixed(2), zeilen: zeilen.filter((z) => z.was !== "haupt-behandelt" || / (ready|book)$/.test(z.typ)).slice(0, 40), alle: out.ev.length };
    fs.writeFileSync(datei, JSON.stringify(res, null, 1));
    for (const z of res.zeilen) console.log(`${String(z.t).padStart(6)} s  ${z.was.padEnd(16)} ${z.typ || ""}${z.tw != null ? `  (Worker sandte ${z.tw} s${z.twEmpf != null ? `, empfing die Anfrage ${z.twEmpf} s` : ""}, Worker-Start ${z.twStart} s)` : ""}`);
    console.log(`Weltbild ${res.weltbild} s`);
})().catch((e) => { console.error("ABBRUCH " + e.message); process.exit(2); });
