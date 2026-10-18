// g8-verlauf.cjs — Karte G8 (Finder): k0 je Frame neben der Signatur der k0-Arena-Züge (Render-Objekt, Programme, GPU-Pipeline,
// Puffer) in EINER Welt — oben, dann nach den Auffrisch-Momenten (Genesis und zurück, LAUB_VERSATZ). Welche Signatur trägt welchen k0?
//   node g8-verlauf.cjs --datei <json>
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const opt = (n, d) => {
    const i = process.argv.indexOf(n);
    return i >= 0 ? process.argv[i + 1] : d;
};
const DATEI = opt("--datei", "g8-verlauf.json"),
    PORT = Number(opt("--port", 4490)),
    SEK = Number(opt("--sek", 30));
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
const aus = { start: new Date().toISOString(), laeufe: [], verlaeufe: [] };
const sichern = () => fs.writeFileSync(DATEI, JSON.stringify(aus));
const log = (x) => console.log(`${new Date().toISOString().slice(11, 19)} ${x}`);
async function lauf(was, sek, ein, ruhe) {
    const L = erg(await R("/lauf", { sek: sek || 15, ein: ein == null ? 20 : ein, ruhe: ruhe == null ? 300 : ruhe, regler: "voll", tiere: "frei" })) || {};
    const P = L.gpuJePassMs || {};
    const e = { was, k0: P.k0 ? P.k0.p50 : null, k0p95: P.k0 ? P.k0.p95 : null, k0n: P.k0 ? P.k0.frames : null, haupt: P.haupt ? P.haupt.p50 : null, fps: L.fps, durchsatz: L.gpuDurchsatzMs && L.gpuDurchsatzMs.p50, gpu: L.gpuMs && L.gpuMs.p50, stempel: L.stempel ? L.stempel.gueltig : null };
    aus.laeufe.push(e);
    sichern();
    log(`lauf ${was}: k0 ${e.k0} (p95 ${e.k0p95}, n ${e.k0n}) · haupt ${e.haupt} · fps ${e.fps} · Durchsatz ${e.durchsatz} · gpu ${e.gpu} · Stempel ${e.stempel}`);
    return e;
}
const q = (a, p) => {
    const s = a.filter(Number.isFinite).sort((x, y) => x - y);
    return s.length ? +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(3) : null;
};
async function verlauf(was) {
    const v = await E(`return window.__g8.verlauf(${SEK}, 10);`);
    v.was = was;
    aus.verlaeufe.push(v);
    sichern();
    const k0f = v.frames.filter((f) => f.k0 != null);
    const jeSig = {};
    for (const f of k0f) (jeSig[f.i] || (jeSig[f.i] = [])).push(f.k0);
    const teil = Object.entries(jeSig)
        .map(([i, a]) => `sig${i}: n ${a.length} p50 ${q(a, 0.5)} oben ${(a.filter((x) => x > 0.45).length / a.length).toFixed(2)}`)
        .join(" | ");
    log(`verlauf ${was}: Frames ${v.frames.length}, k0-Frames ${k0f.length}, k0 p50 ${q(k0f.map((f) => f.k0), 0.5)}, Anteil oben ${(k0f.filter((f) => f.k0 > 0.45).length / Math.max(1, k0f.length)).toFixed(2)} · Signaturen ${v.sigs.length} · ${teil}`);
    // die Folge oben/unten in Läufen (Wechsel-Zeitpunkte)
    let lauf0 = null,
        n = 0;
    const segs = [];
    for (const f of k0f) {
        const z = f.k0 > 0.45 ? "O" : "u";
        if (z !== lauf0) {
            if (lauf0) segs.push(lauf0 + n);
            lauf0 = z;
            n = 0;
        }
        n++;
    }
    if (lauf0) segs.push(lauf0 + n);
    log(`  Folge: ${segs.slice(0, 80).join(" ")}${segs.length > 80 ? " …" : ""}`);
    return v;
}
(async () => {
    await E("window.__anazhAutoSettlement = false; return true;");
    await R("/fenster", { w: 1920, h: 1080 });
    aus.version = await E("return AnazhRealm.VERSION;");
    await R("/umstellen", { ort: "wiese", sicht: "ego" });
    await E("return window.__buehne();");
    await lauf("anfang", 15, 20, 300);
    log("helfer: " + JSON.stringify(await E(HELFER)));
    aus.dump0 = await E("return window.__g8.dump();");
    await verlauf("anfang");
    await R("/umstellen", { ort: "genesis", sicht: "ego" });
    await R("/umstellen", { ort: "wiese", sicht: "ego" });
    await E("return window.__buehne();");
    await lauf("nach Genesis und zurück", 15, 5, 120);
    aus.dump1 = await E("return window.__g8.dump();");
    await verlauf("nach Genesis und zurück");
    const lv = await E("return typeof AnazhRealm.LAUB_VERSATZ === 'number' ? AnazhRealm.LAUB_VERSATZ : null;");
    if (lv != null) {
        await E("AnazhRealm.LAUB_VERSATZ = 0; return 0;");
        await lauf("LAUB_VERSATZ 0", 15, 5, 60);
        await verlauf("LAUB_VERSATZ 0");
        await E(`AnazhRealm.LAUB_VERSATZ = ${lv}; return ${lv};`);
        await lauf(`LAUB_VERSATZ ${lv}`, 15, 5, 60);
        aus.dump2 = await E("return window.__g8.dump();");
        await verlauf(`LAUB_VERSATZ ${lv}`);
    }
    aus.programme = await E("return window.__g8.programmCode(null);");
    aus.ende = new Date().toISOString();
    sichern();
    log("ENDE");
})().catch((e) => {
    console.error("g8-verlauf FEHLER:", (e && e.stack) || e);
    aus.fehler = String((e && e.stack) || e);
    sichern();
    process.exit(2);
});
