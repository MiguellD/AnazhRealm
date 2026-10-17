// instrument-probe.cjs — misst die Seite mit dem Instrument, das die Werkbank gestartet hat (Bündel 7, 17.10.): an der Wiese Ego wie die
// Mess-Folge (dorf-aus · fenster · umstellen · bühne · lauf voll), dann gpu-bank (eine Aufwärm-Bank, 2 Bänke 12 × 3) und die Uhren der
// Bühne (welche der alten Bild-Uhren an der Seite gehalten sind, `_bildZeit`). Frage: misst das A9-Instrument eine Seite vor A9 billiger?
//   node instrument-probe.cjs --datei <pfad>
"use strict";
const http = require("http");
const fs = require("fs");
const opt = (n, d) => {
    const i = process.argv.indexOf(n);
    return i >= 0 ? process.argv[i + 1] : d;
};
const DATEI = opt("--datei", "instrument-probe.json"),
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
const st = r.state, wu = st.lodUniforms || {}, d = (o, k) => { const x = o && Object.getOwnPropertyDescriptor(o, k); return x ? (x.get && x.get.__buehne ? "gehalten" : "frei") : "fehlt"; };
return { version: AnazhRealm.VERSION, weiche: window.__omenWeiche || null,
    himmelZeit: st.skyboxUniforms && st.skyboxUniforms.time ? +st.skyboxUniforms.time.value.toFixed(2) : null, himmelHalt: d(st.skyboxUniforms && st.skyboxUniforms.time, "value"),
    wasserZeit: st.hydroSurfaceUniforms && st.hydroSurfaceUniforms.time ? +st.hydroSurfaceUniforms.time.value.toFixed(2) : null, wasserHalt: d(st.hydroSurfaceUniforms && st.hydroSurfaceUniforms.time, "value"),
    windHalt: d(wu.uWindTime, "value"), bildZeit: r._bildZeit, bildZeitHalt: d(r, "_bildZeit"), tageszeit: st.timeOfDay, wetter: st.weather };`;
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
    await R("/gpu-bank", { n: 120, runden: 2 });
    aus.bank = [];
    for (let k = 0; k < 2; k++) {
        const b = await R("/gpu-bank", { n: 12, runden: 3 });
        const x = (b && b.ergebnis) || b || {};
        aus.bank.push({ gpu: x.gpuJeFrameMs, cpu: x.cpuJeFrameMs });
    }
    aus.uhrenBank = await R("/eval", { code: UHREN });
    log(`umstellen ${JSON.stringify(aus.umstellen).slice(0, 140)}`);
    log(`lauf ${JSON.stringify(aus.lauf).slice(0, 400)}`);
    log(`bank ${JSON.stringify(aus.bank)}`);
    log(`uhren vor ${JSON.stringify(aus.uhrenVor)} | nach Bank ${JSON.stringify(aus.uhrenBank)}`);
    fs.writeFileSync(DATEI, JSON.stringify(aus, null, 1));
})().catch((e) => {
    console.error("instrument-probe FEHLER:", (e && e.stack) || e);
    process.exit(2);
});
