// k0-welt.cjs — der k0-Zustand in EINER Welt (OMEN 17.10., Auftrag des Koordinators): an der Wiese Ego
//   1) lauf voll → k0 p50 (Zustand), dann die Zug-Folge in k0 bei neu aufgenommenen Bündeln (`_renderObjectDirect`-Haken wie
//      draw-zaehler.cjs: Klasse `_taeterKlasse`, Stoff, Geometrie, Bündel; dazu die setPipeline-Folge in k0), danach lauf → k0;
//   2) Umschalt-Versuch: umstellen Genesis → Wiese, lauf → k0, Zug-Folge;
//   3) `AnazhRealm.LAUB_VERSATZ = 0` → lauf → k0 (nur wo es ihn gibt), zurück auf den alten Wert;
//   4) der Ego-Sprung an Genesis: nach lauf 15 s die Einträge im Umkreis 30 m (id · Typ · Rezept · Stufe · gezeichnet · sichtbar),
//      nach 3 s und 6 s Lauf wieder — welche verschwinden.
//   node k0-welt.cjs --datei <pfad>
"use strict";
const http = require("http");
const fs = require("fs");
const opt = (n, d) => {
    const i = process.argv.indexOf(n);
    return i >= 0 ? process.argv[i + 1] : d;
};
const DATEI = opt("--datei", "k0-welt.json"),
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
const FOLGE = (neu) => `
const st = r.state, rend = st.renderer, q = rend.backend && rend.backend.device ? rend.backend.device.queue : null;
const liste = [], pipes = [], pid = new WeakMap(); let pn = 0, akt = null;
const roh = rend._renderObjectDirect;
const bg = (o) => { for (let p = o; p; p = p.parent) if (p.isBundleGroup) return p.name || "bg" + p.id; return null; };
rend._renderObjectDirect = function (object, material, scene, camera, ...rest) {
    const pass = window.__passName(scene, camera); akt = pass;
    if (pass === "k0") {
        const g = object.geometry;
        const n = g ? (g.index ? g.index.count : g.attributes.position ? g.attributes.position.count : 0) : 0;
        liste.push({ kl: r._taeterKlasse(object), name: object.name || object.type, oid: object.id, stoff: (material && (material.name || material.type)) || "?", mid: material ? material.id : null, gid: g ? g.id : null, inst: object.isInstancedMesh ? object.count : null, bg: bg(object), tris: Math.round(n / 3), seite: material ? material.side : null, alphaTest: material ? material.alphaTest : null });
    }
    return roh.call(this, object, material, scene, camera, ...rest);
};
const hk = [];
for (const P of [GPURenderPassEncoder.prototype, GPURenderBundleEncoder.prototype]) {
    const f = P.setPipeline;
    P.setPipeline = function (p) { if (akt === "k0") { if (!pid.has(p)) pid.set(p, ++pn); pipes.push(pid.get(p)); } return f.call(this, p); };
    hk.push([P, f]);
}
let frames = 0;
try {
    ${neu ? "st.scene.traverse((n) => { if (n.isBundleGroup) n.needsUpdate = true; });" : ""}
    r._schattenAlleNeu();
    for (let i = 0; i < 6 && !liste.length; i++) { window.__wetterHalten && window.__wetterHalten(); r._loopRender(); frames++; if (q) await q.onSubmittedWorkDone(); }
} finally {
    rend._renderObjectDirect = roh;
    for (const [P, f] of hk) P.setPipeline = f;
}
const stoffWechsel = liste.reduce((n, e, i) => n + (i && e.mid !== liste[i - 1].mid ? 1 : 0), 0);
const pipeWechsel = pipes.reduce((n, p, i) => n + (i && p !== pipes[i - 1] ? 1 : 0), 0);
return { frames, zuege: liste.length, stoffWechsel, stoffe: new Set(liste.map((e) => e.mid)).size, pipes: pipes.length, pipeVerschieden: new Set(pipes).size, pipeWechsel, liste, pipeFolge: pipes };`;
const NAH = `
const st = r.state, c = st.camera.position; const out = [];
for (const e of st.architectures || []) {
    if (!e || !e.position) continue;
    const d = Math.hypot(e.position.x - c.x, e.position.z - c.z); if (d > 30) continue;
    out.push({ id: e.id, type: e.type, preset: r._foundryPresetForEntry ? r._foundryPresetForEntry(e) : null, d: Math.round(d * 10) / 10, lod: e._lodLevel, gez: r._archIsRendered(e), mesh: !!e.mesh, inst: !!e.instanced, sichtbar: e.mesh ? e.mesh.visible : null, weicht: e._weicht || e.weicht || null });
}
return { arch: (st.architectures || []).length, liste: out.sort((a, b) => a.d - b.d), kamera: [Math.round(c.x * 10) / 10, Math.round(c.y * 10) / 10, Math.round(c.z * 10) / 10] };`;
(async () => {
    const aus = { start: new Date().toISOString(), schritte: [] };
    const log = (x) => console.log(`${new Date().toISOString().slice(11, 19)} ${x}`);
    const lauf = async (was) => {
        const L = erg(await R("/lauf", { sek: 15, ein: 20, ruhe: 300, regler: "voll", tiere: "frei" })) || {};
        const P = L.gpuJePassMs || {};
        const e = { was, k0: P.k0 ? P.k0.p50 : null, k0p95: P.k0 ? P.k0.p95 : null, fps: L.fps, durchsatz: L.gpuDurchsatzMs && L.gpuDurchsatzMs.p50, traa: P.TRAA ? P.TRAA.p50 : null };
        aus.schritte.push(e);
        log(`lauf ${was}: k0 ${e.k0} (p95 ${e.k0p95}) · fps ${e.fps} · Durchsatz ${e.durchsatz}`);
        return e;
    };
    const folge = async (was, neu) => {
        const f = erg(await R("/eval", { code: FOLGE(neu) })) || {};
        aus[was] = f;
        log(`folge ${was}: Züge ${f.zuege} · Stoffe ${f.stoffe} · Stoff-Wechsel ${f.stoffWechsel} · Pipelines ${f.pipeVerschieden} · Pipeline-Wechsel ${f.pipeWechsel} · ${JSON.stringify((f.liste || []).map((e) => e.kl)).slice(0, 400)}`);
        return f;
    };
    await R("/eval", { code: "window.__anazhAutoSettlement = false; return true;" });
    await R("/fenster", { w: 1920, h: 1080 });
    aus.version = erg(await R("/eval", { code: "return AnazhRealm.VERSION;" }));
    await R("/umstellen", { ort: "wiese", sicht: "ego" });
    await R("/eval", { code: "return window.__buehne();" });
    await lauf("anfang");
    await folge("folge1", false);
    await folge("folge1neu", true);
    await lauf("nach Neu-Aufnahme");
    await R("/umstellen", { ort: "genesis", sicht: "ego" });
    await R("/umstellen", { ort: "wiese", sicht: "ego" });
    await R("/eval", { code: "return window.__buehne();" });
    await lauf("nach Genesis und zurück");
    await folge("folge2neu", true);
    await lauf("nach zweiter Neu-Aufnahme");
    const lv = erg(await R("/eval", { code: "return typeof AnazhRealm.LAUB_VERSATZ === 'number' ? AnazhRealm.LAUB_VERSATZ : null;" }));
    aus.laubVersatzAlt = lv;
    if (lv != null) {
        await R("/eval", { code: "AnazhRealm.LAUB_VERSATZ = 0; return 0;" });
        await lauf("LAUB_VERSATZ 0");
        await folge("folgeLaub0", true);
        await R("/eval", { code: `AnazhRealm.LAUB_VERSATZ = ${lv}; return ${lv};` });
        await lauf(`LAUB_VERSATZ ${lv} zurück`);
    }
    // der Ego-Sprung an Genesis
    await R("/umstellen", { ort: "genesis", sicht: "ego" });
    await R("/eval", { code: "return window.__buehne();" });
    await R("/lauf", { sek: 15, ein: 20, ruhe: 300, regler: "voll", tiere: "frei" });
    aus.nah = [];
    for (let k = 0; k < 3; k++) {
        const n = erg(await R("/eval", { code: NAH })) || {};
        aus.nah.push(n);
        log(`nah ${k}: ${(n.liste || []).length} Einträge ≤ 30 m · ${JSON.stringify((n.liste || []).map((e) => `${e.id}:${e.type}:${e.d}:${e.gez ? "g" : "-"}${e.sichtbar === false ? "u" : ""}`)).slice(0, 500)}`);
        if (k < 2) await R("/lauf", { sek: 3, ein: 1, ruhe: 30, regler: "voll", tiere: "frei" });
    }
    fs.writeFileSync(DATEI, JSON.stringify(aus, null, 1));
})().catch((e) => {
    console.error("k0-welt FEHLER:", (e && e.stack) || e);
    process.exit(2);
});
