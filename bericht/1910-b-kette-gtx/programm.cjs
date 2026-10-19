// 1910 B-Kette (OMEN, Messer): `(program)` beim Namen — aus EINEM Chrome-Trace (kette-patch, KETTE_TRACE): die Abtastung
// (disabled-by-default-v8.cpu_profiler) und die Ereignisse (toplevel · devtools.timeline · v8 · v8.compile · v8.gc) in einer
// Uhr. Je `(program)`-Probe des Haupt-Fadens das innerste Ereignis, das sie umschließt (Name + url/Funktion/Quelle), summiert.
// Dazu je Faden (Worker) die Summe der Aufgaben.     node --max-old-space-size=8000 programm.cjs <trace.json> [weltbild-ms]
"use strict";
const fs = require("fs");
const T = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const ev = Array.isArray(T) ? T : T.traceEvents;
const WBms = Number(process.argv[3] || NaN);
// Fäden
const tname = new Map();
for (const e of ev) if (e.ph === "M" && e.name === "thread_name") tname.set(e.pid + ":" + e.tid, e.args.name);
// die Profile: Profile (Kopf) + ProfileChunk (Knoten, Proben, timeDeltas) je (pid, id)
const prof = new Map();
for (const e of ev) {
    if (e.name === "Profile") {
        const k = e.pid + ":" + e.id;
        const z = prof.get(k) || { nodes: new Map(), samples: [], deltas: [] };
        z.tid = e.tid;
        z.pid = e.pid;
        z.start = e.args.data.startTime;
        prof.set(k, z);
    } else if (e.name === "ProfileChunk") {
        const k = e.pid + ":" + e.id;
        const z = prof.get(k) || { nodes: new Map(), samples: [], deltas: [] };
        if (z.tid == null) z.tid = e.tid;
        z.pid = e.pid;
        prof.set(k, z);
        const d = e.args.data || {};
        const cp = d.cpuProfile || {};
        for (const n of cp.nodes || []) z.nodes.set(n.id, n);
        for (const s of cp.samples || []) z.samples.push(s);
        for (const t of d.timeDeltas || []) z.deltas.push(t);
    }
}
// der Haupt-Faden: das Profil mit den meisten Proben auf einem CrRendererMain
let main = null;
for (const z of prof.values()) {
    const n = tname.get(z.pid + ":" + z.tid) || "?";
    z.name = n;
    if (n === "CrRendererMain" && (!main || z.samples.length > main.samples.length)) main = z;
}
const out = [];
const p = (...a) => out.push(a.join(" "));
p(`# (program) beim Namen — ${process.argv[2].replace(/.*[\\/]/, "")}`);
p("Profile im Trace:", [...prof.values()].map((z) => `${z.name}(${z.pid}:${z.tid}) ${z.samples.length} Proben`).join(" · "));
if (!main) {
    p("kein Haupt-Faden-Profil im Trace");
    console.log(out.join("\n"));
    process.exit(0);
}
// Probenzeiten
const times = [];
let t = main.start;
for (let i = 0; i < main.samples.length; i++) {
    t += main.deltas[i] || 0;
    times.push(t);
}
const fname = (id) => {
    const n = main.nodes.get(id);
    return n ? n.callFrame.functionName || "(anonym)" : "?";
};
// die Ereignisse des Haupt-Fadens als Intervalle (X mit dur; B/E gepaart)
const iv = [];
const offen = new Map();
for (const e of ev) {
    if (e.pid !== main.pid || e.tid !== main.tid) continue;
    if (e.ph === "X" && e.dur > 0) iv.push({ s: e.ts, e: e.ts + e.dur, ev: e });
    else if (e.ph === "B") (offen.get(e.name) || offen.set(e.name, []).get(e.name)).push(e);
    else if (e.ph === "E") {
        const st = offen.get(e.name);
        const b = st && st.pop();
        if (b) iv.push({ s: b.ts, e: e.ts, ev: Object.assign({}, b, { args: Object.assign({}, b.args, e.args) }) });
    }
}
iv.sort((a, b) => a.s - b.s || b.e - a.e);
const kurz = (u) => String(u || "").replace(/^.*\/(?=[^/]+$)/, "").replace(/\?v=[^:]*/, "");
const nameVon = (e) => {
    const a = e.args || {};
    const d = a.data || a.beginData || {};
    let n = e.name;
    if (d.url || d.functionName) n += ` ${kurz(d.url)}${d.functionName ? ":" + d.functionName : ""}`;
    else if (a.fileName) n += " " + kurz(a.fileName);
    else if (a.src_func) n += ` ${kurz(a.src_file)}:${a.src_func}`;
    else if (d.type) n += " " + d.type;
    return n;
};
// je Probe: Klasse (program/idle/gc/JS) und — für (program) — das innerste umschließende Ereignis
const prog = new Map();
const progAufgabe = new Map();
const klasse = new Map();
let aktiv = [];
let j = 0;
let t0 = times.length ? times[0] : 0;
let progN = 0;
let progMs = 0;
const jeSek = {};
for (let i = 0; i < main.samples.length; i++) {
    const ts = times[i];
    const dt = (i + 1 < times.length ? times[i + 1] - ts : 0) / 1000; // ms bis zur nächsten Probe
    while (j < iv.length && iv[j].s <= ts) aktiv.push(iv[j++]);
    aktiv = aktiv.filter((x) => x.e >= ts);
    const fn = fname(main.samples[i]);
    const kl = fn === "(program)" || fn === "(idle)" || fn === "(garbage collector)" || fn === "(root)" ? fn : "JS";
    klasse.set(kl, (klasse.get(kl) || 0) + dt);
    if (fn !== "(program)") continue;
    progN++;
    progMs += dt;
    let innen = null;
    let aussen = null;
    for (const x of aktiv) {
        if (x.s <= ts && x.e >= ts) {
            if (!innen || x.s >= innen.s) innen = x;
            if (!aussen || x.s <= aussen.s) aussen = x;
        }
    }
    const n = innen ? nameVon(innen.ev) : "(kein Ereignis)";
    prog.set(n, (prog.get(n) || 0) + dt);
    const na = aussen ? nameVon(aussen.ev) : "(kein Ereignis)";
    progAufgabe.set(na, (progAufgabe.get(na) || 0) + dt);
    const sk = Math.floor((ts - t0) / 1e6);
    jeSek[sk] = (jeSek[sk] || 0) + dt;
}
p(`Haupt-Faden ${main.name} ${main.pid}:${main.tid}: ${main.samples.length} Proben über ${((times[times.length - 1] - t0) / 1e6).toFixed(2)} s (Mittel ${((times[times.length - 1] - t0) / main.samples.length).toFixed(0)} µs)`);
p("Klassen (ms):", [...klasse].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v.toFixed(0)}`).join(" · "));
p(`(program): ${progN} Proben = ${progMs.toFixed(0)} ms; je Sekunde ab der ersten Probe:`, Object.entries(jeSek).map(([s, v]) => `${s}:${v.toFixed(0)}`).join(" "));
p("\n## (program) nach dem INNERSTEN umschließenden Ereignis (ms, Top 30)");
for (const [n, v] of [...prog].sort((a, b) => b[1] - a[1]).slice(0, 30)) p(`- ${v.toFixed(1)}  ${n}`);
p("\n## (program) nach der ÄUSSERSTEN Aufgabe (ms, Top 15)");
for (const [n, v] of [...progAufgabe].sort((a, b) => b[1] - a[1]).slice(0, 15)) p(`- ${v.toFixed(1)}  ${n}`);
// die Übersetzung im Haupt-Faden (v8.compile/V8.*Compile*/Parse*), Selbstzeit-frei summiert nach Name
const comp = new Map();
for (const x of iv) {
    const n = x.ev.name;
    if (!/compile|parse|Compile|Parse/i.test(n)) continue;
    const z = comp.get(n) || [0, 0];
    z[0] += (x.e - x.s) / 1000;
    z[1]++;
    comp.set(n, z);
}
p("\n## Übersetzung im Haupt-Faden (Σ Dauer inkl. Verschachtelung, ms · n)");
for (const [n, z] of [...comp].sort((a, b) => b[1][0] - a[1][0]).slice(0, 15)) p(`- ${z[0].toFixed(1)} · ${z[1]}  ${n}`);
// je Faden die Aufgaben-Summe (RunTask, toplevel)
const fad = new Map();
for (const e of ev) {
    if (e.ph !== "X" || !(e.dur > 0) || (e.name !== "RunTask" && e.name !== "ThreadControllerImpl::RunTask")) continue;
    const k = e.pid + ":" + e.tid;
    fad.set(k, (fad.get(k) || 0) + e.dur / 1000);
}
p("\n## Aufgaben je Faden (Σ RunTask ms, Top 14)");
for (const [k, v] of [...fad].sort((a, b) => b[1] - a[1]).slice(0, 14)) p(`- ${v.toFixed(0)}  ${tname.get(k) || "?"} (${k})`);
console.log(out.join("\n"));
