// g8-trennung.cjs (aus g8-takt.cjs) — Karte G8 (Finder): der echte Loop (rAF, Leine, Präsentieren) in EINER Welt, jeder Takt um d ms nach seinem rAF
// versetzt (d = 0 · 2 · 4 · 6, ABAB) — wandert „k0 oben" mit der Lage des Frames zur Bildwiederholung? Je Frame k0 und die Phase
// des k0-Renders (ms seit dem rAF-Zeitstempel). Dazu die Arena: zuerst oben (Anfang), dann nach Genesis und zurück.
//   node g8-takt.cjs --datei <json>
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const opt = (n, d) => {
    const i = process.argv.indexOf(n);
    return i >= 0 ? process.argv[i + 1] : d;
};
const DATEI = opt("--datei", "g8-takt.json"),
    PORT = Number(opt("--port", 4490)),
    SEK = Number(opt("--sek", 8));
function R(weg, nutzlast) {
    return new Promise((res, rej) => {
        const body = JSON.stringify(nutzlast || {});
        const req = http.request(
            { host: "127.0.0.1", port: PORT, path: weg, method: "POST", headers: { "Content-Type": "application/json" } },
            (r) => {
                let d = "";
                r.on("data", (c) => (d += c));
                r.on("end", () => {
                    try {
                        res(JSON.parse(d));
                    } catch (_e) {
                        res({ roh: d.slice(0, 400) });
                    }
                });
            }
        );
        req.on("error", rej);
        req.setTimeout(1800000, () => req.destroy(new Error(`${weg}: Frist`)));
        req.end(body);
    });
}
const erg = (x) => (x && x.ergebnis !== undefined ? x.ergebnis : x);
const E = async (code) => erg(await R("/eval", { code }));
const HELFER = fs.readFileSync(path.join(__dirname, "g8-helfer.js"), "utf8");
const aus = { start: new Date().toISOString(), schritte: [] };
const sichern = () => fs.writeFileSync(DATEI, JSON.stringify(aus));
const log = (x) => console.log(`${new Date().toISOString().slice(11, 19)} ${x}`);
async function lauf(was, sek, ein, ruhe) {
    const L = erg(await R("/lauf", { sek: sek || 15, ein: ein == null ? 20 : ein, ruhe: ruhe == null ? 300 : ruhe, regler: "voll", tiere: "frei" })) || {};
    const P = L.gpuJePassMs || {};
    const e = { art: "lauf", was, k0: P.k0 ? P.k0.p50 : null, k0p95: P.k0 ? P.k0.p95 : null, k0n: P.k0 ? P.k0.frames : null, fps: L.fps, durchsatz: L.gpuDurchsatzMs && L.gpuDurchsatzMs.p50, verzug: L.gpuVerzugMs && L.gpuVerzugMs.p50, cpu: L.cpuTaktMs && L.cpuTaktMs.p50 };
    aus.schritte.push(e);
    sichern();
    log(`lauf ${was}: k0 ${e.k0} (p95 ${e.k0p95}, n ${e.k0n}) · fps ${e.fps} · Durchsatz ${e.durchsatz} · Verzug ${e.verzug} · CPU ${e.cpu}`);
    return e;
}
const q = (a, p) => {
    const s = a.filter(Number.isFinite).sort((x, y) => x - y);
    return s.length ? +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(3) : null;
};
async function takt(was, d) {
    const t = await E(`return window.__g8.takt(${d}, ${SEK});`);
    t.art = "takt";
    t.was = was;
    aus.schritte.push(t);
    sichern();
    // je Phase des k0-Renders (ms seit rAF, 1-ms-Fächer): Anteil oben
    const f = {};
    for (const [ph, , k0] of t.roh) {
        if (ph == null) continue;
        const b = Math.floor(ph);
        (f[b] || (f[b] = [])).push(k0);
    }
    const fa = Object.entries(f)
        .sort((a, b) => a[0] - b[0])
        .map(([b, a]) => `${b}:${a.length}/${(a.filter((x) => x > 0.45).length / a.length).toFixed(2)}`)
        .join(" ");
    log(`takt ${was} d=${d}: k0 p50 ${t.k0} · oben ${t.oben} · k0-Frames ${t.k0n}/${t.frames} · Phase→oben ${fa}`);
    return t;
}
async function trenn(was, art) {
    const t = await E(`return window.__g8.trennung('${art}', 8, 96);`);
    t.was = was;
    aus.schritte.push(Object.assign({ art: "trennung" }, t, { modus: art }));
    sichern();
    log(`trennung ${was} ${art}: k0 p50 ${t.k0} · oben ${t.oben} (n ${t.k0n}) · unten-Gipfel ${t.unten50} · oben-Gipfel ${t.oben50}`);
}
(async () => {
    await E("window.__anazhAutoSettlement = false; return true;");
    await R("/fenster", { w: 1920, h: 1080 });
    aus.version = await E("return AnazhRealm.VERSION;");
    await R("/umstellen", { ort: "wiese", sicht: "ego" });
    await E("return window.__buehne();");
    await lauf("anfang", 15, 20, 300);
    log("helfer: " + JSON.stringify(await E(HELFER)));
    for (let i = 0; i < 2; i++) {
        await takt("anfang", 0);
        await trenn("anfang", "rafBank");
        for (let k = 0; k < 3; k++) await trenn("anfang", "tickDicht");
    }
    await lauf("anfang nach Trennung", 15, 3, 30);
    aus.ende = new Date().toISOString();
    sichern();
    log("ENDE");
})().catch((e) => {
    console.error("g8-takt FEHLER:", (e && e.stack) || e);
    aus.fehler = String((e && e.stack) || e);
    sichern();
    process.exit(2);
});
