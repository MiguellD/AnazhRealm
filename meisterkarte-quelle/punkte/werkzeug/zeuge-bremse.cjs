// BLEIBT DIE BREMSE DER PRECISE COVERAGE NACH DEM STOPP? (12.11., die Frage hinter „die Seite der Sitzung trägt den Zeugen, vor
// Zeit-Proben abgeschaltet“): je Lauf EIN frischer Browser mit EINER Seite, ruf-lastiger Code (kleine Funktionen, eine Klasse), je
// Runde das Minimum aus 60 Läufen. Läufe im Wechsel ohne (K) und mit (Z) Coverage: Z schaltet sie nach Runde 3 an (binär, je Funktion —
// genau der Ruf von konsum-zeuge.cjs) und nach Runde 6 ab (take, stop, Profiler.disable); danach sechs Runden, eine NEUE Funktion,
// die Seite neu geladen. Aufruf: node zeuge-bremse.cjs <node_modules des Spiel-Klons> [Paare]
const path = require("path");
const puppeteer = require(path.join(process.argv[2], "puppeteer"));
const code = (n) => `(() => {
function a(x) { return x + 1; } function b(x) { return a(x) * 2; } function c(x) { return b(x) - a(x); }
class V { constructor(x, y) { this.x = x; this.y = y; } add(o) { return new V(this.x + o.x, this.y + o.y); } len() { return Math.hypot(this.x, this.y); } }
function frame(n) { let t = 0, v = new V(0, 0); for (let i = 0; i < n; i++) { t += c(i); v = v.add(new V(i & 3, 1)); t += v.len() * 1e-9; } return t; }
const mess = () => { const t = performance.now(); frame(200000); return performance.now() - t; };
window.${n} = () => { let m = 1e9; for (let i = 0; i < 60; i++) m = Math.min(m, mess()); return +m.toFixed(2); };
})()`;
const lauf = async (mit) => {
    const browser = await puppeteer.launch({ headless: true, args: ["--disable-gpu"] });
    const p = (await browser.pages())[0] || (await browser.newPage());
    await p.goto("about:blank");
    await p.addScriptTag({ content: code("runde") });
    const cdp = await p.createCDPSession();
    const z = [];
    for (let r = 0; r < 12; r++) {
        if (mit && r === 3) { await cdp.send("Profiler.enable"); await cdp.send("Profiler.startPreciseCoverage", { callCount: false, detailed: false }); }
        if (mit && r === 6) { await cdp.send("Profiler.takePreciseCoverage"); await cdp.send("Profiler.stopPreciseCoverage"); await cdp.send("Profiler.disable"); }
        z.push(await p.evaluate("runde()"));
    }
    await p.addScriptTag({ content: code("neu") });
    const neu = await p.evaluate("neu()");
    await p.reload();
    await p.addScriptTag({ content: code("runde") });
    const geladen = await p.evaluate("runde()");
    const v = await browser.version();
    await browser.close();
    const med = (x) => x.slice().sort((a, b) => a - b)[x.length >> 1];
    return { v, vor: med(z.slice(0, 3)), an: med(z.slice(3, 6)), nach: med(z.slice(6)), nachMin: Math.min(...z.slice(6)), neu, geladen };
};
(async () => {
    const paare = Number(process.argv[3]) || 3;
    for (let i = 0; i < paare * 2; i++) {
        const mit = i % 2 === 1, r = await lauf(mit);
        if (!i) console.log(r.v);
        console.log((mit ? "Z mit " : "K ohne") + " · vor " + r.vor + " · Runde 4–6" + (mit ? " (AN) " : " ") + r.an + " · Runde 7–12" + (mit ? " (AUS) " : " ") + r.nach + " (min " + r.nachMin + ") · neue Funktion " + r.neu + " · neu geladen " + r.geladen + " ms" +
            (mit ? " · AN ×" + (r.an / r.vor).toFixed(1) + " · nach dem Stopp ×" + (r.nach / r.vor).toFixed(1) : ""));
    }
})().catch((e) => { console.error(e); process.exit(1); });
