// k0-arena.cjs — was zeichnet k0 im oberen und im unteren Zustand (OMEN 17.10.)? In EINER Welt an der Wiese Ego: je Zustand lauf voll
// (k0 p50/p95), dann je Arena-Lager (`AnazhRealm.__arenen`) die Züge der k0-Kamera (`_zuegeB`/`_zuege` → arr: je Draw Indizes ·
// Instanzen …) gegen die der Haupt-Kamera, und ein Ausgabe-Bild (der Schatten am Boden). Umschalten: umstellen Genesis → Wiese
// + Neu-Aufnahme der Bündel, bis zu 4 Versuche, bis beide Zustände gesehen sind.   node k0-arena.cjs --datei <pfad> --bilder <präfix>
"use strict";
const http = require("http");
const fs = require("fs");
const opt = (n, d) => {
    const i = process.argv.indexOf(n);
    return i >= 0 ? process.argv[i + 1] : d;
};
const DATEI = opt("--datei", "k0-arena.json"),
    BILDER = opt("--bilder", "k0-arena"),
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
const erg = (x) => (x && x.ergebnis !== undefined ? x.ergebnis : x);
const ARENA = `
const st = r.state, csm = st.csmNode, K = r.constructor;
const kam = { haupt: st.camera, k0: csm && csm.lights && csm.lights[0] ? csm.lights[0].shadow.camera : null, k1: csm && csm.lights && csm.lights[1] ? csm.lights[1].shadow.camera : null };
const lies = (z) => { if (!z || !z.arr) return null; let inst = 0, tris = 0, aktiv = 0; const n = Math.max(z.plaetze || 0, (z.zuege || []).length); for (let j = 0; j < n; j++) { const ic = z.arr[j * 5], c = z.arr[j * 5 + 1]; inst += c; tris += (ic / 3) * c; if (c > 0) aktiv++; } return { plaetze: z.plaetze, zuege: (z.zuege || []).length, aktiv, inst, tris: Math.round(tris), triFeld: z.tri }; };
const out = [];
for (const a of (K.__arenen || new Map()).values()) {
    const e = { glieder: (a.glieder || []).length, fest: !!a._fest, name: a.name || null };
    for (const [n, c] of Object.entries(kam)) { if (!c) continue; e[n] = { lose: lies(a._zuege && a._zuege.get(c)), buendel: lies(a._zuegeB && a._zuegeB.get(c)) }; }
    out.push(e);
}
const summe = {};
for (const n of Object.keys(kam)) { let inst = 0, tris = 0; for (const e of out) for (const w of ["lose", "buendel"]) if (e[n] && e[n][w]) { inst += e[n][w].inst; tris += e[n][w].tris; } summe[n] = { inst, tris }; }
return { lager: out.length, summe, lagerListe: out };`;
const BILD = `
const rend = r.state.renderer; rend.setAnimationLoop(null); window.__buehne(); let a = null;
for (let i = 0; i < 2; i++) { r._schattenAlleNeu(); a = await window.__ausgabeAufnahme(1920, 1080, 1); }
const cv = document.createElement("canvas"); cv.width = 1920; cv.height = 1080; const ctx = cv.getContext("2d"); const img = ctx.createImageData(1920, 1080); img.data.set(a.u8.subarray(0, 1920 * 1080 * 4)); ctx.putImageData(img, 0, 0);
return cv.toDataURL("image/png");`;
(async () => {
    const aus = { start: new Date().toISOString(), zustaende: [] };
    const log = (x) => console.log(`${new Date().toISOString().slice(11, 19)} ${x}`);
    await R("/eval", { code: "window.__anazhAutoSettlement = false; return true;" });
    await R("/fenster", { w: 1920, h: 1080 });
    aus.version = erg(await R("/eval", { code: "return AnazhRealm.VERSION;" }));
    await R("/umstellen", { ort: "wiese", sicht: "ego" });
    await R("/eval", { code: "return window.__buehne();" });
    const gesehen = new Set();
    for (let v = 0; v < 5 && gesehen.size < 2; v++) {
        if (v > 0) {
            await R("/umstellen", { ort: "genesis", sicht: "ego" });
            await R("/umstellen", { ort: "wiese", sicht: "ego" });
            await R("/eval", { code: "return window.__buehne();" });
            await R("/eval", { code: "r.state.scene.traverse((n) => { if (n.isBundleGroup) n.needsUpdate = true; }); r._schattenAlleNeu(); return 1;" });
        }
        const L = erg(await R("/lauf", { sek: 15, ein: 20, ruhe: 300, regler: "voll", tiere: "frei" })) || {};
        const P = L.gpuJePassMs || {};
        const zustand = P.k0 && P.k0.p50 > 0.45 ? "oben" : "unten";
        const ar = erg(await R("/eval", { code: ARENA })) || {};
        const e = { versuch: v, k0: P.k0 && P.k0.p50, k0p95: P.k0 && P.k0.p95, k0Bilder: P.k0 && P.k0.frames, frames: P.haupt && P.haupt.frames, fps: L.fps, durchsatz: L.gpuDurchsatzMs && L.gpuDurchsatzMs.p50, zustand, arena: ar };
        if (!gesehen.has(zustand)) {
            const png = erg(await R("/eval", { code: BILD }));
            if (typeof png === "string" && png.startsWith("data:")) {
                e.bild = `${BILDER}-${zustand}.png`;
                fs.writeFileSync(e.bild, Buffer.from(png.split(",")[1], "base64"));
            }
        }
        gesehen.add(zustand);
        aus.zustaende.push(e);
        log(`versuch ${v}: k0 ${e.k0} (p95 ${e.k0p95}, ${e.k0Bilder} k0-Bilder von ${e.frames}) → ${zustand} · Arena ${ar.lager} Lager · Summe ${JSON.stringify(ar.summe)}`);
    }
    fs.writeFileSync(DATEI, JSON.stringify(aus, null, 1));
})().catch((e) => {
    console.error("k0-arena FEHLER:", (e && e.stack) || e);
    process.exit(2);
});
