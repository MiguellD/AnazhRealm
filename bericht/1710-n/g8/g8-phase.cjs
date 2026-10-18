// g8-phase.cjs — Karte G8 (Finder): ist „k0 oben" eine Eigenschaft der Arena oder der Phase (k0 beginnt, während der Vorgänger
// noch auf der GPU läuft)? In EINER Welt je Zustand (am Anfang = oben, nach Genesis und zurück = unten): k0 je Frame bei leerer
// GPU vor jedem Frame („leer") und Frames hintereinander („dicht", GPU-gebunden: Wanduhr je Frame = GPU-Zeit), ABAB; dazu die
// Arena #k0-gross aus/an und gpu-bank.   node g8-phase.cjs --datei <json>
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const opt = (n, d) => {
    const i = process.argv.indexOf(n);
    return i >= 0 ? process.argv[i + 1] : d;
};
const DATEI = opt("--datei", "g8-phase.json"),
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
const E = async (code) => erg(await R("/eval", { code }));
const HELFER = fs.readFileSync(path.join(__dirname, "g8-helfer.js"), "utf8");
const aus = { start: new Date().toISOString(), schritte: [] };
const sichern = () => fs.writeFileSync(DATEI, JSON.stringify(aus, null, 1));
const log = (x) => console.log(`${new Date().toISOString().slice(11, 19)} ${x}`);
async function lauf(was, sek, ein, ruhe) {
    const L = erg(await R("/lauf", { sek: sek || 15, ein: ein == null ? 20 : ein, ruhe: ruhe == null ? 300 : ruhe, regler: "voll", tiere: "frei" })) || {};
    const P = L.gpuJePassMs || {};
    const e = { art: "lauf", was, k0: P.k0 ? P.k0.p50 : null, k0p95: P.k0 ? P.k0.p95 : null, k0n: P.k0 ? P.k0.frames : null, haupt: P.haupt ? P.haupt.p50 : null, fps: L.fps, durchsatz: L.gpuDurchsatzMs && L.gpuDurchsatzMs.p50, verzug: L.gpuVerzugMs && L.gpuVerzugMs.p50, cpu: L.cpuTaktMs && L.cpuTaktMs.p50, stempel: L.stempel ? L.stempel.gueltig : null };
    aus.schritte.push(e);
    sichern();
    log(`lauf ${was}: k0 ${e.k0} (p95 ${e.k0p95}, n ${e.k0n}) · haupt ${e.haupt} · fps ${e.fps} · Durchsatz ${e.durchsatz} · Verzug ${e.verzug} · CPU ${e.cpu} · Stempel ${e.stempel}`);
    return e;
}
async function phase(was, modus) {
    const p = await E(`return window.__g8.phase('${modus}', 24, 6);`);
    p.art = "phase";
    p.was = was;
    aus.schritte.push(p);
    sichern();
    log(`phase ${was} ${modus}: k0 ${p.k0} (n ${p.k0n}, oben ${p.k0oben}) · k1 ${p.k1} (n ${p.k1n}) · haupt ${p.haupt} · Summe ${p.summe} · Wand je Frame ${p.wandJeFrame}`);
    return p;
}
async function bank(was) {
    const b = erg(await R("/gpu-bank", { n: 12, runden: 5 })) || {};
    aus.schritte.push(Object.assign({ art: "bank", was }, b));
    sichern();
    log(`gpu-bank ${was}: GPU ${b.gpuJeFrameMs} ms/Frame · CPU ${b.cpuJeFrameMs} · gebunden ${b.gpuGebunden}`);
}
async function zustand(tag) {
    for (let i = 0; i < 2; i++) {
        await phase(tag, "leer");
        await phase(tag, "dicht");
    }
    await bank(tag);
    const ids = await E("return window.__g8.arenenVon('k0');");
    const D = await E("return window.__g8.dump();");
    const gross = D.arenen.filter((a) => ids.includes(a.id)).sort((x, y) => y.glieder.length - x.glieder.length)[0];
    aus.schritte.push({ art: "arenen", was: tag, ids, gross: gross && gross.id });
    if (gross) {
        await E(`return window.__g8.aus('k0', [${gross.id}]);`);
        await phase(`${tag} #${gross.id} aus`, "leer");
        await phase(`${tag} #${gross.id} aus`, "dicht");
        await bank(`${tag} #${gross.id} aus`);
        await E("return window.__g8.an();");
        await phase(`${tag} #${gross.id} an`, "leer");
        await phase(`${tag} #${gross.id} an`, "dicht");
        await bank(`${tag} #${gross.id} an`);
    }
}
(async () => {
    await E("window.__anazhAutoSettlement = false; return true;");
    await R("/fenster", { w: 1920, h: 1080 });
    aus.version = await E("return AnazhRealm.VERSION;");
    await R("/umstellen", { ort: "wiese", sicht: "ego" });
    await E("return window.__buehne();");
    await lauf("anfang", 15, 20, 300);
    log("helfer: " + JSON.stringify(await E(HELFER)));
    await zustand("anfang");
    await lauf("anfang nach Phase", 15, 3, 30);
    await R("/umstellen", { ort: "genesis", sicht: "ego" });
    await R("/umstellen", { ort: "wiese", sicht: "ego" });
    await E("return window.__buehne();");
    await lauf("nach Genesis und zurück", 15, 5, 120);
    await zustand("nach Genesis");
    await lauf("nach Genesis nach Phase", 15, 3, 30);
    aus.ende = new Date().toISOString();
    sichern();
    log("ENDE");
})().catch((e) => {
    console.error("g8-phase FEHLER:", (e && e.stack) || e);
    aus.fehler = String((e && e.stack) || e);
    sichern();
    process.exit(2);
});
