// a1-welt.cjs — A1 (der Wasser-Spiegel) in EINER Welt (OMEN 17.10., Auftrag des Koordinators): am Kopf B (6df9c3d4, laufende Werkbank)
// die fünf A1-Methoden aus 985a923b (A) gegen die von 6df9c3d4 (G), Folge A G G A A G G A; je Stellung lauf + gpu-bank + Pass-Zeiten.
//   node a1-welt.cjs --ort genesis --sicht third --alt <985a923b/11b.js> --neu <6df9c3d4/11b.js> --datei <pfad>
"use strict";
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const opt = (n, d) => {
    const i = process.argv.indexOf(n);
    return i >= 0 ? process.argv[i + 1] : d;
};
const ORT = opt("--ort", "wiese"),
    SICHT = opt("--sicht", "ego"),
    DATEI = opt("--datei", `eine-welt-${ORT}-${SICHT}.json`),
    PORT = Number(opt("--port", 4490)),
    FOLGE = (opt("--folge", "AGGAAGGA") || "").split("");

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
async function mitTakt(fn) {
    const zeilen = [];
    const p = spawn("nvidia-smi", ["--query-gpu=clocks.gr,temperature.gpu,power.draw,clocks_throttle_reasons.active", "--format=csv,noheader,nounits", "-lms", "250"], { windowsHide: true });
    p.stdout.on("data", (d) => zeilen.push(...String(d).split(/\r?\n/).filter(Boolean)));
    try {
        const b = await fn();
        const w = zeilen.map((l) => l.split(",").map((x) => x.trim())).filter((r) => r.length >= 4 && Number(r[0]) > 0);
        const m = (i) => (w.length ? +(w.reduce((a, r) => a + Number(r[i]), 0) / w.length).toFixed(1) : null);
        const drossel = {};
        for (const r of w) drossel[r[3]] = (drossel[r[3]] || 0) + 1;
        return { b, takt: { mhz: m(0), temp: m(1), watt: m(2), drossel, n: w.length } };
    } finally {
        p.kill();
    }
}
// A1 als Schalter: die fünf Methoden, die A1 in stamm/11b.js ändert, aus 985a923b (A) bzw. 6df9c3d4 (G) live getauscht
// (werkbank `/methode` mit `quelle`), danach der Spiegel-Pass frisch (st.spiegelPass fällt, die Signatur fällt) und das
// Wasser-Material frisch (`_tiefenKnotenTausch`: Uniform-Werte reisen mit, Szene + Chunk-Wasser umgehängt; der Feld-Pass baut sich
// im nächsten Fern-Ring-Takt neu — beide Seiten zahlen denselben Umbau), die Satz-Ablage `spec.mat` nachgezogen, jede BundleGroup neu.
const A1_METHODEN = ["_wasserBlick", "_spiegelPass", "_spiegelPassWach", "_spiegelPassRechne", "_ensureHydroSurfaceMaterial"];
const ALT = opt("--alt", null),
    NEU = opt("--neu", null);
const stellung = async (s) => {
    const getauscht = [];
    for (const name of A1_METHODEN) {
        const o = await R("/methode", { name, quelle: s === "A" ? ALT : NEU });
        if (!o || o.getauscht !== name) throw new Error(`methode ${name} (${s}): ${JSON.stringify(o).slice(0, 300)}`);
        getauscht.push(name);
    }
    return R("/eval", {
        code:
            `const st = r.state; const P = st.spiegelPass; if (P) { try { P.mat.dispose(); } catch (_e) {} st.spiegelPass = null; }` +
            `const L = st.spiegelLeser; if (L) { L.sig = null; L.an.value = 0; } st.spiegelBruch = false;` +
            `const altMat = st.hydroSurfaceMaterial; const umgehaengt = r._tiefenKnotenTausch(); let spec = 0;` +
            `if (st.chunkSaetze) for (const x of st.chunkSaetze.values()) if (x.spec && x.spec.mat === altMat) { x.spec.mat = st.hydroSurfaceMaterial; spec++; }` +
            `let buendel = 0; st.scene.traverse((o) => { if (o.isBundleGroup) { o.needsUpdate = true; buendel++; } });` +
            `for (let i = 0; i < 30; i++) { window.__wetterHalten && window.__wetterHalten(); r._gameLoopTick(performance.now()); await new Promise((q) => setTimeout(q, 16)); }` +
            `const zaehl = window.__zaehl || (window.__zaehl = (() => { const z = {}; for (const [pre, P] of [["pass.", GPURenderPassEncoder.prototype], ["bündel.", GPURenderBundleEncoder.prototype]]) for (const n of ["draw", "drawIndexed", "drawIndirect", "drawIndexedIndirect", "setBindGroup", "setVertexBuffer", "setIndexBuffer", "setPipeline", "executeBundles"]) { const f = P[n]; if (typeof f !== "function") continue; P[n] = function (...a) { z[pre + n] = (z[pre + n] || 0) + 1; return f.apply(this, a); }; } return z; })());` +
            `for (const k in zaehl) delete zaehl[k]; for (let i = 0; i < 10; i++) { window.__wetterHalten && window.__wetterHalten(); r._gameLoopTick(performance.now()); await new Promise((q) => setTimeout(q, 16)); }` +
            `const jeFrame = {}; for (const [k, v] of Object.entries(zaehl)) jeFrame[k] = +(v / 10).toFixed(1);` +
            `const S = st.spiegelFeld; const Pn = st.spiegelPass;` +
            `return { stellung: "${s}", getauscht: ${JSON.stringify(getauscht)}.length, umgehaengt, spec, buendel,` +
            ` passDa: !!Pn, passIstNeu: !!(Pn && Pn.U && Pn.U.vp), wasserBlickIstNeu: /himmelFarbe/.test(String(r._wasserBlick)),` +
            ` an: L ? L.an.value : null, bruch: !!st.spiegelBruch, wasserImBild: r._spiegelWasserImBild(), feldWasser: S ? S.wasser : null,` +
            ` arenaOhne: null, lager: 0, glieder: 0, fern: 0, jeFrame };`,
    });
};

(async () => {
    const aus = { ort: ORT, sicht: SICHT, start: new Date().toISOString(), folge: FOLGE.join(""), schritte: [], je: [] };
    const log = (x) => console.log(`${new Date().toISOString().slice(11, 19)} ${x}`);
    aus.schritte.push({ dorfAus: await R("/eval", { code: "window.__anazhAutoSettlement = false; return 1;" }) });
    aus.schritte.push({ fenster: await R("/fenster", { w: 1920, h: 1080 }) });
    const um = await R("/umstellen", { ort: ORT, sicht: SICHT });
    aus.schritte.push({ umstellen: um });
    log(`umstellen ${ORT}/${SICHT}: ${JSON.stringify(um).slice(0, 200)}`);
    aus.schritte.push({ buehne: await R("/eval", { code: "return window.__buehne();" }) });
    const pose = await R("/eval", { code: "return { yaw: r.state.yaw, pitch: r.state.pitch, cam: r.state.cameraMode };" });
    aus.pose = pose;
    const blick = () =>
        R("/eval", {
            code:
                `r.state.yaw = ${pose.yaw}; r.state.pitch = ${pose.pitch};` +
                "for (let i = 0; i < 20; i++) { window.__wetterHalten && window.__wetterHalten(); r._gameLoopTick(performance.now()); await new Promise((s) => setTimeout(s, 16)); } " +
                "r.state.renderer.setAnimationLoop(null); return r.state.yaw;",
        });
    for (let i = 0; i < FOLGE.length; i++) {
        const s = FOLGE[i];
        const st = ((x) => (x && x.ergebnis) || x)(await stellung(s));
        if (!st || st.getauscht !== 5) throw new Error(`Stellung ${s}: ${JSON.stringify(st).slice(0, 400)}`);
        const lauf = await mitTakt(() => R("/lauf", { sek: 15, ein: 5, ruhe: 300, regler: "voll", tiere: "frei" }));
        await blick();
        await R("/gpu-bank", { n: 120, runden: 2 });
        const baenke = [];
        for (let k = 0; k < 2; k++) baenke.push(await mitTakt(() => R("/gpu-bank", { n: 12, runden: 3 })));
        const L = lauf.b || {};
        const e = {
            i: i + 1,
            s,
            stellung: st,
            fps: L.fps,
            frameP50: L.frameMs && L.frameMs.p50,
            frameP95: L.frameMs && L.frameMs.p95,
            cpuP95: L.cpuTaktMs && L.cpuTaktMs.p95,
            befehle: L.befehle && L.befehle.mittel,
            dreiecke: L.dreiecke && L.dreiecke.mittel,
            durchsatz: L.gpuDurchsatzMs && (L.gpuDurchsatzMs.p50 != null ? L.gpuDurchsatzMs.p50 : L.gpuDurchsatzMs),
            laufTakt: lauf.takt,
            gpu: baenke.map((x) => x.b && x.b.gpuJeFrameMs),
            cpuBank: baenke.map((x) => x.b && x.b.cpuJeFrameMs),
            bankTakt: baenke.map((x) => x.takt),
            laufRoh: Object.fromEntries(Object.entries(L).filter(([k]) => /fps|frameMs|cpuTaktMs|gpuDurchsatzMs|gpuJePassMs|stempel|wetter|regler|befehle|dreiecke/.test(k))),
        };
        aus.je.push(e);
        log(`${i + 1} ${s} passNeu=${st.passIstNeu} blickNeu=${st.wasserBlickIstNeu} an=${st.an} imBild=${st.wasserImBild} bruch=${st.bruch} umgehängt=${st.umgehaengt} bündel=${st.buendel} fps ${e.fps} Frame p95 ${e.frameP95} CPU p95 ${e.cpuP95} GPU ${e.gpu.map((x) => x && x.toFixed(2)).join("/")} MHz ${e.bankTakt.map((t) => t && t.mhz).join("/")}`);
    }
    const mittel = (a) => {
        const b = a.filter(Number.isFinite);
        return b.length ? b.reduce((x, y) => x + y, 0) / b.length : NaN;
    };
    const seite = (s, f) => aus.je.filter((e) => e.s === s).map(f);
    const groessen = [
        ["GPU ms (gpu-bank)", (e) => mittel(e.gpu)],
        ["Frame p95 ms (lauf voll)", (e) => e.frameP95],
        ["Frame p50 ms", (e) => e.frameP50],
        ["CPU-Takt p95 ms", (e) => e.cpuP95],
        ["fps", (e) => e.fps],
        ["Befehle (lauf)", (e) => e.befehle],
        ["Dreiecke (lauf)", (e) => e.dreiecke],
        ["Takt MHz (Bank)", (e) => mittel(e.bankTakt.map((t) => t && t.mhz))],
    ];
    aus.tafel = groessen.map(([n, f]) => {
        const a = seite("A", f), g = seite("G", f);
        const ma = mittel(a), mg = mittel(g);
        const abw = [...a.map((x) => x - ma), ...g.map((x) => x - mg)].filter(Number.isFinite);
        const sigma = abw.length > 2 ? Math.sqrt(abw.reduce((s, x) => s + x * x, 0) / (abw.length - 2)) : NaN;
        return { groesse: n, A: a, G: g, mA: ma, mG: mg, delta: mg - ma, zweiSigma: 2 * sigma };
    });
    fs.writeFileSync(DATEI, JSON.stringify(aus, null, 1));
    console.log(`\n${ORT} ${SICHT} — A (A1 aus, 985a923b) gegen G (A1 an, 6df9c3d4), Folge ${aus.folge}`);
    for (const t of aus.tafel)
        console.log(`  ${t.groesse.padEnd(26)} A ${t.mA.toFixed(2)} · G ${t.mG.toFixed(2)} · Δ ${t.delta >= 0 ? "+" : ""}${t.delta.toFixed(2)} · 2σ ${t.zweiSigma.toFixed(2)}   [A ${t.A.map((x) => x && x.toFixed(2)).join(" ")} | G ${t.G.map((x) => x && x.toFixed(2)).join(" ")}]`);
})().catch((e) => {
    console.error("a1-welt FEHLER:", (e && e.stack) || e);
    process.exit(2);
});
