// 1310-14: DER BOOT ÜBER DEN ECHTEN SAVE-SERVER (ohne Cache-Control) — echte GPU (die Schalter der Werkbank), Fenster 1920 × 1080,
// je Aufruf ZWEI Ladungen in EINEM Profil: kalt (leeres Profil) und zweit (dasselbe Profil, die Platte und der HTTP-Cache bleiben).
// Je Ladung: DOMContentLoaded, load, Kontrolle (`state._weltbildDa`, ab Navigation — der Ladeschirm hält bis dahin jede Taste),
// die Skript-Anfragen (Zahl, übertragene Bytes, Ende der letzten), Seiten-Fehler.
// node boot.cjs <instrument-baum> <datei.json> [http://localhost:4312] [--sek 120]
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const [instr, datei, seite = "http://localhost:4312"] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const SEK = Number((process.argv.find((a, i, A) => A[i - 1] === "--sek") || 120));
const puppeteer = require(require.resolve("puppeteer", { paths: [instr] }));
const { echteWebGpuArgs } = require(path.join(instr, "scripts/lib/software-gpu.cjs"));
(async () => {
    const profil = fs.mkdtempSync(path.join(os.tmpdir(), "k14-boot-"));
    const out = { seite, profil, ladungen: [] };
    for (const art of ["kalt", "zweit"]) {
        const browser = await puppeteer.launch({
            headless: false,
            userDataDir: profil,
            protocolTimeout: 600000,
            defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
            args: [...echteWebGpuArgs(), "--window-size=1940,1200"],
        });
        const page = await browser.newPage();
        const fehler = [];
        page.on("pageerror", (e) => fehler.push((e.message || String(e)).split("\n")[0]));
        const t0 = Date.now();
        await page.goto(seite + "/index.html", { waitUntil: "domcontentloaded", timeout: 120000 });
        let kontrolle = null;
        while (Date.now() - t0 < SEK * 1000) {
            kontrolle = await page
                .evaluate(() => (window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state._weltbildDa) || null)
                .catch(() => null);
            if (kontrolle) break;
            await new Promise((r) => setTimeout(r, 100));
        }
        const m = await page.evaluate(() => {
            const n = performance.getEntriesByType("navigation")[0] || {};
            const skripte = performance.getEntriesByType("resource").filter((r) => r.initiatorType === "script");
            const stamm = skripte.filter((r) => /\/stamm\/|anazhRealm\.js/.test(r.name));
            const sum = (a, k) => a.reduce((s, r) => s + (r[k] || 0), 0);
            return {
                dcl: Math.round(n.domContentLoadedEventEnd || 0),
                load: Math.round(n.loadEventEnd || 0),
                skripte: skripte.length,
                skriptBytes: sum(skripte, "transferSize"),
                skriptEnde: Math.round(Math.max(0, ...skripte.map((r) => r.responseEnd))),
                stamm: stamm.length,
                stammBytes: sum(stamm, "transferSize"),
                stammKoerper: sum(stamm, "decodedBodySize"),
                stammEnde: Math.round(Math.max(0, ...stamm.map((r) => r.responseEnd))),
                version: window.anazhRealm && window.anazhRealm.constructor && window.anazhRealm.constructor.VERSION,
                ort: location.href,
                namen: skripte.map((r) => r.name.replace(location.origin, "") + " " + r.transferSize),
            };
        });
        out.ladungen.push(Object.assign({ art, kontrolle: kontrolle ? Math.round(kontrolle) : null, fehler }, m));
        console.log(
            `${art}: DOMContentLoaded ${m.dcl} ms · Kontrolle ${kontrolle ? Math.round(kontrolle) : "—"} ms · load ${m.load} ms · ` +
                `Skripte ${m.skripte} (${(m.skriptBytes / 1048576).toFixed(2)} MB übertragen, Ende ${m.skriptEnde} ms) · Stamm ${m.stamm} ` +
                `(${(m.stammBytes / 1048576).toFixed(2)} MB, Ende ${m.stammEnde} ms) · Fehler ${fehler.length}`
        );
        await browser.close();
    }
    fs.rmSync(profil, { recursive: true, force: true });
    fs.writeFileSync(datei, JSON.stringify(out, null, 1));
})().catch((e) => {
    console.error("BOOT ABBRUCH: " + e.message);
    process.exit(2);
});
