// abriss-hand.cjs — Bau UND Abriss per Satz, n Mal, in der warmen Welt der Sitzung: je Haus `spawn_studio haus` (stamm/feld-dsl.js:2134
// → `_werkAkt(werk, ctx, true)`), warten (Uhr steht, `tickFaunaLifecycle`) bis die Hülle steht und die Zeile `bauen` (Frist 3 s), dann
// `remove_architecture <id>` (stamm/feld-dsl.js:1307: erst `removeArchitecture`, DANACH `_werkAkt(arch, ctx, false)`), warten auf
// die Zeile `abriss` (Frist 3 s). Gezählt: Zeilen `bauen` / `abriss` je Haus, Würfe beim Namen; danach alles zurück (Zeilen, Akte, Häuser).
//   node bericht/2611-stationen/aufwaerts1/abriss-hand.cjs [n 10] [W-Port 24600]
"use strict";
const { spawnSync } = require("child_process");
const N = +(process.argv[2] || 10);
const W = process.argv[3] || "24600";
const SEITE = `
const N = ${N};
const st = r.state, pm = st.playerMesh.position;
const frei = (x, z, R) => r._landAt(x, z, 0.2) && !r._nassAt(x, z) && !r._blockerUmPlatz(x, z, R, []).length;
const plaetze = [];
for (let d = 30; d <= 240 && plaetze.length < N; d += 15) for (let k = 0; k < 12 && plaetze.length < N; k++) { const x = pm.x + d * Math.cos((k * Math.PI) / 6), z = pm.z + d * Math.sin((k * Math.PI) / 6); if (frei(x, z, 8) && plaetze.every((p) => Math.hypot(p.x - x, p.z - z) > 20)) plaetze.push({ x, z, y: r._voxelSurfaceY(x, z) }); }
const L = (st.worldMeta.taten ||= []), n0 = L.length, akte0 = (st.feldAkte || []).length, a0 = st.architectures.length, halt = st.weatherEffectTime;
const zeilen = (tat, id) => L.slice(n0).filter((q) => q && q.tat === tat && q.id === String(id)).length;
const warte = async (ok, ms) => { const t = performance.now(); while (!ok() && performance.now() - t < ms) (r.tickFaunaLifecycle(), await new Promise((q) => setTimeout(q, 25))); return Math.round(performance.now() - t); };
const aus = { plaetze: plaetze.length, bauten: 0, bauen: 0, abriss: 0, wuerfe: [], bauMs: [], abrissMs: [], huelleFehlt: 0 };
const ids = [];
try {
    for (const P of plaetze) {
        const vorher = st.architectures.length;
        st.weatherEffectTime = 0;
        try { r.dslRun(["spawn_studio", "haus", ["at", P.x, P.y, P.z], 1, 7], { source: "human" }); }
        catch (e) { aus.wuerfe.push("bau: " + String((e && e.message) || e).slice(0, 160)); continue; }
        finally { st.weatherEffectTime = halt; }
        const h = st.architectures.slice(vorher).find((e) => /haus/.test(e.type));
        if (!h) { aus.wuerfe.push("bau: kein Haus"); continue; }
        aus.bauten++; ids.push(String(h.id));
        aus.bauMs.push(await warte(() => !!h._hausHuelle && zeilen("bauen", h.id) > 0, 3000));
        if (!h._hausHuelle) aus.huelleFehlt++;
        aus.bauen += Math.min(1, zeilen("bauen", h.id));
        st.weatherEffectTime = 0; // der Mess-Halt (_messHalt: weatherEffectTime < 0) hielte den Welt-Akt, wie beim Bau
        let log = null;
        try { log = r.dslRun(["remove_architecture", h.id], { source: "human" }); }
        catch (e) { aus.wuerfe.push("abriss: " + String((e && e.message) || e).slice(0, 160)); continue; }
        finally { st.weatherEffectTime = halt; }
        const ev = ((log && log.log) || []).filter((q) => q && /gehalten|exception|not_found/.test(q.event));
        if (ev.length) aus.wuerfe.push("abriss-log: " + JSON.stringify(ev).slice(0, 160));
        if (st.architectures.includes(h)) aus.stehtNochNachAbriss = (aus.stehtNochNachAbriss || 0) + 1;
        aus.abrissMs.push(await warte(() => zeilen("abriss", h.id) > 0, 3000));
        aus.abriss += Math.min(1, zeilen("abriss", h.id));
    }
} finally {
    st.weatherEffectTime = halt;
    for (const e of st.architectures.slice(a0)) r.removeArchitecture(e);
    L.length = n0;
    if (st.feldAkte) st.feldAkte = st.feldAkte.filter((x) => !((x.art === "werk" || x.art === "werkAus") && ids.includes(String(x.id))));
    r._tatGen = (r._tatGen | 0) + 1;
}
aus.restAkte = (st.feldAkte || []).length - akte0;
aus.bauMs = aus.bauMs.join(" "); aus.abrissMs = aus.abrissMs.join(" ");
return aus;`;
const p = spawnSync(process.execPath, ["scripts/werkbank.cjs", "eval", SEITE], { encoding: "utf8", env: { ...process.env, WERKBANK_PORT: W }, timeout: 300000 });
let out;
try {
    const j = JSON.parse(p.stdout);
    out = j.fehler ? { fehler: j.fehler } : j.ergebnis;
} catch (e) {
    out = { fehler: String(p.stdout || p.stderr).slice(0, 300) };
}
console.log("abriss " + JSON.stringify(out));
