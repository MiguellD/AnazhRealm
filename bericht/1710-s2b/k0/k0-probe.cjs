// k0-probe.cjs — der k0-Zustand an der Wiese (OMEN 17.10., Wunsch des Koordinators): je Welt wie die Mess-Folge bis lauf voll, dazu vor
// und nach dem Lauf der Zuschnitt jeder Kaskade (`csmNode._anazhFit[i]`: Box W × H, Tiefe zb..zt, Texel, Fallweg, Neu-Zuschnitte) und die
// Schatten-Kamera je Kaskade. Die k0-Zeit (lauf voll, gpuJePassMs) liegt zweigipflig bei 0,25 oder 0,63 ms bei gleichen Werfern.
//   node k0-probe.cjs --datei <pfad>
"use strict";
const http = require("http");
const fs = require("fs");
const opt = (n, d) => {
    const i = process.argv.indexOf(n);
    return i >= 0 ? process.argv[i + 1] : d;
};
const DATEI = opt("--datei", "k0-probe.json"),
    PORT = Number(opt("--port", 4490));
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
const UHREN = `
const csm = r.state.csmNode; if (!csm) return { fehler: "kein csmNode" };
const z = (v, d) => (Number.isFinite(v) ? +v.toFixed(d) : null);
return { version: AnazhRealm.VERSION, breaks: (csm.breaks || []).map((b) => z(b, 4)), fade: csm.fade === true,
    fit: (csm._anazhFit || []).map((f) => f && { W: z(f.W, 1), H: z(f.H, 1), zb: z(f.zb, 1), zt: z(f.zt, 1), tiefe: z(f.zt - f.zb, 1), texel: z(f.texel, 4), texelMin: z(f.texelMin, 4), weg: z(f.weg, 1), bild: f.bild }),
    kam: (csm.lights || []).map((l) => { const c = l.shadow.camera; return { breite: z(c.right - c.left, 1), hoehe: z(c.top - c.bottom, 1), near: z(c.near, 1), far: z(c.far, 1), karte: l.shadow.mapSize.x, auto: l.shadow.autoUpdate }; }),
    takt: r.constructor.SCHATTEN_TAKT || null, minIntervall: r.state._shadowMinInterval };`;
(async () => {
    const aus = { start: new Date().toISOString() };
    const log = (x) => console.log(`${new Date().toISOString().slice(11, 19)} ${x}`);
    await R("/eval", { code: "window.__anazhAutoSettlement = false; return true;" });
    await R("/fenster", { w: 1920, h: 1080 });
    aus.umstellen = await R("/umstellen", { ort: "wiese", sicht: "ego" });
    aus.buehne = await R("/eval", { code: "return window.__buehne();" });
    aus.uhrenVor = await R("/eval", { code: UHREN });
    const lauf = await R("/lauf", { sek: 15, ein: 20, ruhe: 300, regler: "voll", tiere: "frei" });
    const L = (lauf && lauf.ergebnis) || lauf || {};
    aus.lauf = { fps: L.fps, frameP95: L.frameMs && L.frameMs.p95, cpuP95: L.cpuTaktMs && L.cpuTaktMs.p95, durchsatz: L.gpuDurchsatzMs && L.gpuDurchsatzMs.p50, passe: L.gpuJePassMs };
    aus.uhrenNach = await R("/eval", { code: UHREN });
    aus.uhrenBank = null;
    log(`umstellen ${JSON.stringify(aus.umstellen).slice(0, 140)}`);
    log(`lauf ${JSON.stringify(aus.lauf).slice(0, 400)}`);
    
    log(`k0 ${aus.lauf.passe && aus.lauf.passe.k0 ? aus.lauf.passe.k0.p50 : '?'} · vor ${JSON.stringify(aus.uhrenVor)} · nach ${JSON.stringify(aus.uhrenNach)}`);
    fs.writeFileSync(DATEI, JSON.stringify(aus, null, 1));
})().catch((e) => {
    console.error("instrument-probe FEHLER:", (e && e.stack) || e);
    process.exit(2);
});
