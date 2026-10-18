// g8-probe.cjs — Karte G8 (Finder, OMEN 18.10.): der k0-Zustand der Wiese in EINER Welt — oben messen, die Arena zerlegen,
// die Kosten je Arena-Zug zuschreiben (GPU-Aufträge auf 0, taktimmun), dann gezielt kippen und dasselbe unten.
//   node g8-probe.cjs --datei <json> [--plan erkunden]
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const opt = (n, d) => {
    const i = process.argv.indexOf(n);
    return i >= 0 ? process.argv[i + 1] : d;
};
const DATEI = opt("--datei", "g8.json"),
    PLAN = opt("--plan", "erkunden"),
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
const aus = { start: new Date().toISOString(), plan: PLAN, schritte: [], laeufe: [] };
const sichern = () => fs.writeFileSync(DATEI, JSON.stringify(aus, null, 1));
const log = (x) => console.log(`${new Date().toISOString().slice(11, 19)} ${x}`);
async function lauf(was, sek, ein, ruhe) {
    const L = erg(await R("/lauf", { sek: sek || 15, ein: ein == null ? 20 : ein, ruhe: ruhe == null ? 300 : ruhe, regler: "voll", tiere: "frei" })) || {};
    const P = L.gpuJePassMs || {};
    const e = {
        was,
        k0: P.k0 ? P.k0.p50 : null,
        k0p95: P.k0 ? P.k0.p95 : null,
        k0n: P.k0 ? P.k0.frames : null,
        k1: P.k1 ? P.k1.p50 : null,
        haupt: P.haupt ? P.haupt.p50 : null,
        fps: L.fps,
        durchsatz: L.gpuDurchsatzMs && L.gpuDurchsatzMs.p50,
        gpu: L.gpuMs && L.gpuMs.p50,
        stempelGueltig: L.stempel ? L.stempel.gueltig : null,
        k0Befehle: L.befehle && L.befehle.jePass && L.befehle.jePass.k0 ? L.befehle.jePass.k0.p50 : null,
        k0Dreiecke: L.dreiecke && L.dreiecke.jePass && L.dreiecke.jePass.k0 ? L.dreiecke.jePass.k0.p50 : null,
        zeit: new Date().toISOString().slice(11, 19),
    };
    aus.laeufe.push(e);
    sichern();
    log(`lauf ${was}: k0 ${e.k0} (p95 ${e.k0p95}, n ${e.k0n}) · k1 ${e.k1} · haupt ${e.haupt} · fps ${e.fps} · Durchsatz ${e.durchsatz} · k0 dc ${e.k0Befehle} tri ${e.k0Dreiecke} · Stempel ${e.stempelGueltig}`);
    return e;
}
async function schritt(name, code) {
    const t0 = Date.now();
    const x = await E(code);
    aus.schritte.push({ name, ms: Date.now() - t0, x });
    sichern();
    return x;
}
const kurz = (d) =>
    (d && d.arenen ? d.arenen : [])
        .map((a) => `#${a.id} L${a.lager} s${a.side} m${a.mask} ${a.fest ? "fest" : "lose"} gl${a.glieder.length} k0:${a.zuege.k0 ? a.zuege.k0.offs.length : "-"} idx${a.kindIdx}/${a.kinder}`)
        .join(" | ");
async function zuschreiben(tag, ids) {
    // die Kosten je Arena in k0: der Umschalter je Pass (aus/an, taktimmun) — alle zusammen, dann je Arena
    const f0 = await E("return window.__g8.folge('k0');");
    aus.schritte.push({ name: `${tag} folge k0`, x: f0 });
    log(`${tag} folge k0: ` + JSON.stringify(f0));
    await E("return window.__g8.aus('k0', null);");
    await lauf(`${tag}: alle k0-Arenen aus`, 10, 3, 30);
    await E("return window.__g8.an();");
    await lauf(`${tag}: an`, 10, 3, 30);
    if (PLAN !== "kurz")
        for (const id of ids) {
            await E(`return window.__g8.aus('k0', [${id}]);`);
            await lauf(`${tag}: Arena #${id} aus`, 10, 3, 30);
            await E("return window.__g8.an();");
        }
    // die Reihe: die Arena mit den meisten Gliedern zuerst, dann die übrigen nach id (wie nach dem Neubau) — und umgekehrt
    const D = await E("return window.__g8.dump();");
    const k0a = D.arenen.filter((a) => ids.includes(a.id));
    const gross = k0a.slice().sort((x, y) => y.glieder.length - x.glieder.length)[0];
    const r1 = [gross.id, ...k0a.filter((a) => a !== gross).map((a) => a.id).sort((x, y) => x - y)];
    const r2 = [...k0a.filter((a) => a !== gross).map((a) => a.id).sort((x, y) => x - y), gross.id];
    for (const [nm, rr] of [["gross zuerst", r1], ["gross zuletzt", r2], ["gross zuerst", r1], ["gross zuletzt", r2]]) {
        await E(`return window.__g8.reihe(${JSON.stringify(rr)});`);
        const f = await E("return window.__g8.folge('k0');");
        log(`${tag} reihe ${nm} ${JSON.stringify(rr)}: folge ` + JSON.stringify(f.filter((x) => x[2] === "arena").map((x) => x[0])));
        await lauf(`${tag}: Reihe ${nm} ${rr.join(",")}`, 10, 3, 30);
    }
    await E("return window.__g8.reihe(null);");
    await lauf(`${tag}: Reihe des Stamms`, 10, 3, 30);
}
(async () => {
    await E("window.__anazhAutoSettlement = false; return true;");
    await R("/fenster", { w: 1920, h: 1080 });
    aus.version = await E("return AnazhRealm.VERSION;");
    await R("/umstellen", { ort: "wiese", sicht: "ego" });
    await E("return window.__buehne();");
    const L0 = await lauf("anfang", 15, 20, 300);
    log("helfer: " + JSON.stringify(await E(HELFER)));
    const D0 = await schritt("dump oben", "return window.__g8.dump();");
    log("arenen oben: " + kurz(D0));
    const G0 = await schritt("gpu oben", "return window.__g8.gpuVergleich('k0');");
    log("gpu oben: " + JSON.stringify(G0.arenen.map((a) => [a.id, a.fehlt, a.idxDiff, a.posDiff, a.matDiff, a.draws.map((d) => [d.gleich ? "=" : "≠", d.gpu[1], d.quelleDiff, d.flaechePx])])));
    const S0 = await schritt("spur oben", "return window.__g8.spur(3000);");
    log("spur oben: " + JSON.stringify(S0.jeFrame) + " rec " + JSON.stringify(S0.rec) + " ev " + JSON.stringify(S0.ev));
    const ids = await E("return window.__g8.arenenVon('k0');");
    const oben = L0.k0 > 0.45;
    aus.obenAmAnfang = oben;
    if (oben) await zuschreiben("oben", ids);
    // kippen: zuerst nur die Lager, dann die Arenen folgen, dann Genesis und zurück
    const versuche = ["lager", "folgen", "genesis"];
    let unten = !oben,
        D = null;
    for (const v of versuche) {
        if (unten) break;
        let k;
        if (v === "genesis") {
            await R("/umstellen", { ort: "genesis", sicht: "ego" });
            await R("/umstellen", { ort: "wiese", sicht: "ego" });
            await E("return window.__buehne();");
            k = "genesis";
        } else k = await E(`return window.__g8.kipp('${v}', 'k0');`);
        const S = await schritt(`spur nach kipp ${v}`, "return window.__g8.spur(1500);");
        log(`kipp ${v}: ${JSON.stringify(k)} · spur ${JSON.stringify(S.jeFrame)} rec ${JSON.stringify(S.rec)} ev ${JSON.stringify(S.ev)}`);
        const L = await lauf(`nach kipp ${v}`, 15, 5, 120);
        D = await schritt(`dump nach ${v}`, "return window.__g8.dump();");
        log(`arenen nach ${v}: ` + kurz(D));
        const G = await schritt(`gpu nach ${v}`, "return window.__g8.gpuVergleich('k0');");
        log(`gpu nach ${v}: ` + JSON.stringify(G.arenen.map((a) => [a.id, a.fehlt, a.idxDiff, a.posDiff, a.matDiff, a.draws.map((d) => [d.gleich ? "=" : "≠", d.gpu[1], d.quelleDiff, d.flaechePx])])));
        const S2 = await schritt(`spur nach ${v}`, "return window.__g8.spur(3000);");
        log(`spur nach ${v}: ` + JSON.stringify(S2.jeFrame) + " rec " + JSON.stringify(S2.rec) + " ev " + JSON.stringify(S2.ev));
        if (L.k0 < 0.45) {
            unten = true;
            aus.gekipptDurch = v;
        }
    }
    if (unten) {
        const ids2 = await E("return window.__g8.arenenVon('k0');");
        await zuschreiben("unten", ids2);
    }
    aus.ende = new Date().toISOString();
    sichern();
    log("ENDE");
})().catch((e) => {
    console.error("g8-probe FEHLER:", (e && e.stack) || e);
    aus.fehler = String((e && e.stack) || e);
    sichern();
    process.exit(2);
});
