// 1110-9 Fernform-Paar: EIN voller Schuss bei 80 m vor der maschine (10 m hoch), Bühne fest — jenseits der Nah-Grenze (64 m)
// zeichnet der Welt-March die Fernform der Tore (A: main, B: torwurf). node fern-paar.cjs <port> <datei.png>
"use strict";
const http = require("http");
const [port, datei] = process.argv.slice(2);
const rufe = (url, body) =>
    new Promise((res, rej) => {
        const q = http.request({ host: "127.0.0.1", port: Number(port), path: url, method: "POST", headers: { "Content-Type": "application/json" } }, (r) => {
            let d = "";
            r.on("data", (c) => (d += c));
            r.on("end", () => { try { res(JSON.parse(d)); } catch (e) { rej(new Error(d.slice(0, 300))); } });
        });
        q.on("error", rej);
        q.end(JSON.stringify(body));
    });
const kam = { px: 32.6, py: Number(process.env.KAM_Y || 68), pz: Number(process.env.KAM_Z || -68), lx: 32.6, ly: 58, lz: 10.46, w: 1920, h: 1080 };
(async () => {
    // erst das fertige Weltbild und die sieben Tore des Genesis-Rings (der Ort-Takt baut sie; kein Dorf-Haken: er hält auch ihn an)
    let w = null;
    for (let i = 0; i < 90; i++) {
        w = (await rufe("/eval", { code: "for (let k = 0; k < 10; k++) { r._gameLoopTick(performance.now()); await new Promise((s) => setTimeout(s, 16)); } const G = [drachentor,kathedrale,maschine,geisttor,verkalkt,ruine,maurentor]; return { da: !!r.state._weltbildDa, tore: (r.state.architectures || []).filter((e) => e && G.includes(r._foundryPresetForEntry(e))).length };" })).ergebnis;
        if (w && w.da && w.tore >= 7) break;
        await new Promise((s) => setTimeout(s, 1000));
    }
    const b = await rufe("/eval", { code: "if (window.__buehne) window.__buehne(); return { v: r.constructor.VERSION, fern: r._foundryFernForm ? r._foundryFernForm('maschine') : null }" });
    b.ergebnis = Object.assign({}, b.ergebnis, { warten: w });
    await rufe("/bild", Object.assign({}, kam, { datei: datei.replace(/\.png$/, "-aufwaermen.png") }));
    const a = await rufe("/bild", Object.assign({}, kam, { datei }));
    console.log(JSON.stringify({ stand: b.ergebnis || b, dc: a.dc, dreiecke: a.dreiecke }));
})().catch((e) => { console.error(String(e)); process.exit(1); });
