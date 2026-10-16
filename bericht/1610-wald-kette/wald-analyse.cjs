// wald-analyse.cjs — die Wald-Kette eines Kalt-Boots (W<n>.json + W<n>.cpuprofile der Stationslinse): Zeitachse der Lücken,
// Aufträge (Schlange · Werk · Antwort), Karten, Regionen, die letzten Glieder vor dem Weltbild und der Haupt-Faden im Fenster.
//   node wald-analyse.cjs W1 [--von 11000]
"use strict";
const fs = require("fs");
const path = require("path");
const N = process.argv[2] || "W1";
const VON = Number((process.argv.find((x, i) => process.argv[i - 1] === "--von") || "11000"));
const D = __dirname;
const j = JSON.parse(fs.readFileSync(path.join(D, N + ".json"), "utf8"));
const w = j.wald;
const T = j.weltbildDa;
const s = (ms) => (ms == null ? "  –  " : (ms / 1000).toFixed(2).padStart(6));
console.log(`== ${N}: t(Weltbild) ${s(T)} s · Fenster ab ${s(VON)} s`);

// 1) Zeitachse je halbe Sekunde (letzte Probe im Halbsekunden-Fach)
console.log("\n-- Zeitachse (s · Streu wartend [Grund] · Bauten offen · Karten Schlange/Flug · Foundry warte/Werk/Bäcker · Ingest)");
const fach = new Map();
for (const p of w.proben) fach.set(Math.floor(p.t / 500), p);
for (const [k, p] of [...fach].sort((a, b) => a[0] - b[0])) {
    if (p.t < VON - 2000) continue;
    const gr = {};
    for (const z of p.streu || []) {
        const g = z.replace(/^\S+ /, "");
        gr[g] = (gr[g] || 0) + 1;
    }
    const b = Object.values(p.bauten || {}).reduce((a, x) => a + x, 0);
    console.log(
        `  ${s(p.t)}  Streu ${String((p.streu || []).length).padStart(2)} ${JSON.stringify(gr).replace(/"/g, "")} · Bauten ${b} ${b ? JSON.stringify(p.bauten).replace(/"/g, "").slice(0, 60) : ""} · Karten ${p.karten} · F ${p.warte}/${p.werk}/${p.baecker} · I ${p.frei}`
    );
}

// 2) Aufträge
const auf = w.auftrag.map((a) => Object.assign({}, a, { schlange: a.tS != null ? a.tS - a.tQ : null, werk: a.tA != null && a.tS != null ? a.tA - a.tS : null }));
const art = (a) => (a.id.startsWith("bake-impostor") ? "karte" : a.id.includes("|vorrat") ? "vorrat" : "körper");
const sum = {};
for (const a of auf) {
    const k = art(a);
    const z = (sum[k] = sum[k] || { n: 0, beantwortet: 0, schlangeMs: [], werkMs: [] });
    z.n++;
    if (a.tA != null && a.tA <= T) z.beantwortet++;
    if (a.schlange != null) z.schlangeMs.push(a.schlange);
    if (a.werk != null) z.werkMs.push(a.werk);
}
const med = (x) => (x.length ? x.slice().sort((a, b) => a - b)[Math.floor(x.length / 2)] : NaN);
console.log("\n-- Aufträge je Art (bis Weltbild beantwortet · Median Schlange / Werk ms · max Werk ms)");
for (const [k, z] of Object.entries(sum))
    console.log(`  ${k.padEnd(7)} ${z.n} gestellt · ${z.beantwortet} beantwortet · Schlange ${med(z.schlangeMs)} · Werk ${med(z.werkMs)} · max Werk ${Math.max(0, ...z.werkMs)}`);
console.log("\n-- die im Fenster beantworteten Aufträge (Antwort ≥ Fenster, ≤ Weltbild + 0,2 s), nach Antwort");
for (const a of auf.filter((a) => a.tA != null && a.tA >= VON && a.tA <= T + 200).sort((x, y) => x.tA - y.tA))
    console.log(`  Antwort ${s(a.tA)} · gestellt ${s(a.tQ)} · gesendet ${s(a.tS)} · Schlange ${String(a.schlange).padStart(5)} · Werk ${String(a.werk).padStart(5)} · ${String(a.d).padStart(4)} m · ${a.id}`);
console.log("\n-- bis Weltbild NICHT beantwortet (gestellt ≤ Weltbild)");
for (const a of auf.filter((a) => a.tQ <= T && (a.tA == null || a.tA > T)).slice(0, 25))
    console.log(`  gestellt ${s(a.tQ)} · gesendet ${s(a.tS)} · ${String(a.d).padStart(4)} m · ${a.id}`);

// 2b) Aufträge OHNE Rang (d = null → d² = ∞, „Vorrat"-Rang) — wer hinter allem wartet
console.log("\n-- Aufträge ohne Ort (d = null), Körper und Karten, nicht Vorrat: gestellt · Schlange · Werk · Antwort");
for (const a of auf.filter((a) => a.d == null && !a.id.includes("|vorrat")).sort((x, y) => x.tQ - y.tQ))
    console.log(`  ${s(a.tQ)} · Schlange ${String(a.schlange).padStart(5)} · Werk ${String(a.werk).padStart(5)} · Antwort ${s(a.tA)} · ${a.id}`);
// 2c) die Werk-Last je Gruppe (Anzahl Aufträge und Summe Werk-ms, beantwortet bis Weltbild)
const gruppe = (id) => id.replace(/^build-asset:/, "").replace(/\|\d+\|/, "|*|").replace(/^bake-impostor:.*/, "karte");
const last = {};
for (const a of auf.filter((a) => a.tA != null && a.tA <= T && !a.id.includes("|vorrat"))) {
    const g = gruppe(a.id);
    const z = (last[g] = last[g] || [0, 0]);
    z[0]++;
    z[1] += a.werk || 0;
}
console.log("\n-- Werk-Last je Gruppe bis Weltbild (Aufträge · Summe Werk-s — Summe über parallele Aufträge)");
for (const [g, [n, ms]] of Object.entries(last).sort((a, b) => b[1][1] - a[1][1]).slice(0, 14)) console.log(`  ${g.padEnd(22)} ${String(n).padStart(3)} · ${(ms / 1000).toFixed(1)} s`);

// 2d) die ECHTE Bauzeit je Auftrag: je Bahn (aus der reqId: r<n> = Werk, rw<k>_<n> = Helfer k, imp… = Bäcker) arbeitet
// der Worker FIFO — Bauzeit = Antwort − max(gesendet, Antwort des Vorgängers seiner Bahn)
const mitReq = auf.filter((a) => a.req && a.tS != null && a.tA != null);
if (mitReq.length) {
    const bahnVon = (r) => (/^imp/.test(r) ? (/b(\d+)_\d+$/.exec(r) ? "bäcker" + /b(\d+)_\d+$/.exec(r)[1] : "bäcker") : /w(\d+)_\d+$/.exec(r) ? "werk" + /w(\d+)_\d+$/.exec(r)[1] : "werk");
    const nr = (r) => Number(/(\d+)$/.exec(r)[1]);
    const bahnen = {};
    for (const a of mitReq) (bahnen[bahnVon(a.req)] = bahnen[bahnVon(a.req)] || []).push(a);
    const bau = {};
    const belegt = {};
    for (const [b, liste] of Object.entries(bahnen)) {
        liste.sort((x, y) => nr(x.req) - nr(y.req));
        let vor = -Infinity;
        for (const a of liste) {
            a.bau = a.tA - Math.max(a.tS, vor);
            vor = a.tA;
            const g = gruppe(a.id);
            const z = (bau[g] = bau[g] || [0, 0, 0]);
            z[0]++;
            z[1] += a.bau;
            if (a.tA <= T) z[2] += a.bau;
            belegt[b] = (belegt[b] || 0) + (a.tA <= T ? a.bau : 0);
        }
    }
    console.log(`\n-- echte Bauzeit (FIFO je Bahn) · Bahnen: ${Object.entries(belegt).map(([b, ms]) => b + " " + (ms / 1000).toFixed(1) + " s").join(" · ")} (bis Weltbild)`);
    for (const [g, [n, ms, msT]] of Object.entries(bau).sort((a, b) => b[1][2] - a[1][2]).slice(0, 16))
        console.log(`  ${g.padEnd(22)} ${String(n).padStart(3)} Aufträge · Bauzeit bis Weltbild ${(msT / 1000).toFixed(2)} s · je Auftrag ${(ms / n / 1000).toFixed(2)} s`);
}

// 3) Züge (Körper bis Cache) im Fenster
console.log("\n-- Körper-Züge, die im Fenster in den Cache kamen (tZ → tF)");
for (const z of w.zug.filter((z) => z.tF != null && z.tF >= VON && z.tF <= T + 200).sort((a, b) => a.tF - b.tF))
    console.log(`  ${s(z.tZ)} → ${s(z.tF)}  (${((z.tF - z.tZ) / 1000).toFixed(2)} s)  ${z.key}`);

// 4) Karten
console.log("\n-- Karten (send → ende)");
const ks = new Map();
for (const [was, t, key, ok] of w.karte) {
    if (was === "send") ks.set(key, { t0: t });
    else if (ks.has(key)) Object.assign(ks.get(key), { t1: t, ok });
    else ks.set(key, { t0: null, t1: t, ok });
}
for (const [k, v] of [...ks].sort((a, b) => (a[1].t1 || 1e9) - (b[1].t1 || 1e9)))
    if ((v.t1 || 0) >= VON - 3000) console.log(`  ${s(v.t0)} → ${s(v.t1)}  ${v.t0 != null && v.t1 != null ? ((v.t1 - v.t0) / 1000).toFixed(2) + " s" : ""}  ${k}`);

// 5) Regionen
console.log("\n-- Streu-Regionen (_scatterRegion: t · ms · Zustand danach)");
const reg = {};
for (const [t, ms, key, z] of w.region) (reg[key] = reg[key] || []).push(`${s(t)}/${ms}ms/${z || "steht"}`);
for (const [k, v] of Object.entries(reg)) console.log(`  ${k.padEnd(6)} ${v.join(" · ")}`);

// 6) Ingest + Gruppen-Bau im Fenster
const frei = w.frei.filter((f) => f[1] != null && f[1] >= VON && f[1] <= T);
const wartF = frei.map((f) => f[1] - f[0]);
const bg = w.bg.filter((b) => b[0] >= VON && b[0] <= T);
console.log(`\n-- Ingest im Fenster: ${frei.length} freigegeben, Wartezeit Median ${med(wartF)} ms, max ${Math.max(0, ...wartF)} ms`);
console.log(`-- Gruppen-Bau im Fenster: ${bg.length} Bauten, Summe ${bg.reduce((a, b) => a + b[1], 0).toFixed(0)} ms, größte: ${bg.sort((a, b) => b[1] - a[1]).slice(0, 5).map((b) => b[2] + "/" + b[3] + " " + b[1] + "ms").join(" · ")}`);

// 7) CPU-Profil im Fenster (Uhr-Abgleich über OMEN_TAKTMARKE)
const pf = path.join(D, N + ".cpuprofile");
if (fs.existsSync(pf)) {
    const p = JSON.parse(fs.readFileSync(pf, "utf8"));
    const knoten = new Map(p.nodes.map((n) => [n.id, n]));
    const zeit = [];
    let t = p.startTime;
    for (let i = 0; i < p.samples.length; i++) {
        t += p.timeDeltas[i];
        zeit.push(t);
    }
    // die Marken: Läufe von Proben in OMEN_TAKTMARKE → je Lauf die erste Probe ↔ die nächste Sync-Zeit
    const marken = [];
    let inLauf = false;
    for (let i = 0; i < p.samples.length; i++) {
        const n = knoten.get(p.samples[i]);
        const ist = n && n.callFrame.functionName === "OMEN_TAKTMARKE";
        if (ist && !inLauf) marken.push(zeit[i]);
        inLauf = ist;
    }
    // Abgleich: Profil-µs → performance.now-ms; die k-te Marke ↔ die k-te Sync-Zeit (beide in Reihenfolge), Mittel des Versatzes
    // robust: je Paar (Marke, Sync) der Versatz; der Versatz mit den meisten Treffern (±3 ms) gewinnt
    const kand = [];
    for (const m of marken) for (const sy of w.sync) kand.push(m / 1000 - sy);
    let v = NaN, best = -1;
    for (const c of kand) {
        const n = kand.filter((x) => Math.abs(x - c) <= 3).length;
        if (n > best) { best = n; v = c; }
    }
    const treffer = kand.filter((x) => Math.abs(x - v) <= 3);
    v = med(treffer);
    const streu = best;
    console.log(`\n-- CPU-Profil: ${p.samples.length} Proben, Marken ${marken.length} / Sync ${w.sync.length}, Treffer des Versatzes ${streu}`);
    const selbst = new Map();
    let gesamt = 0;
    for (let i = 0; i < p.samples.length; i++) {
        const tm = zeit[i] / 1000 - v;
        if (tm < VON || tm > T) continue;
        const dt = (p.timeDeltas[i + 1] || p.timeDeltas[i]) / 1000;
        const n = knoten.get(p.samples[i]);
        const c = n.callFrame;
        const k = `${c.functionName || "(anonym)"} ${(c.url || "").split("/").pop().split("?")[0]}:${c.lineNumber + 1}`;
        selbst.set(k, (selbst.get(k) || 0) + dt);
        gesamt += dt;
    }
    console.log(`   Fenster ${s(VON)}–${s(T)} s: ${gesamt.toFixed(0)} ms gesampelt`);
    for (const [k, ms] of [...selbst].sort((a, b) => b[1] - a[1]).slice(0, 30))
        console.log(`   ${((100 * ms) / gesamt).toFixed(1).padStart(5)} %  ${ms.toFixed(0).padStart(6)} ms  ${k}`);
    // die Gesamtzeit je Funktion (inklusive) im Fenster: über die Eltern-Kette
    const eltern = new Map();
    for (const n of p.nodes) for (const c of n.children || []) eltern.set(c, n.id);
    const inkl = new Map();
    for (let i = 0; i < p.samples.length; i++) {
        const tm = zeit[i] / 1000 - v;
        if (tm < VON || tm > T) continue;
        const dt = (p.timeDeltas[i + 1] || p.timeDeltas[i]) / 1000;
        const gesehen = new Set();
        for (let id = p.samples[i]; id != null; id = eltern.get(id)) {
            const c = knoten.get(id).callFrame;
            const k = `${c.functionName || "(anonym)"} ${(c.url || "").split("/").pop().split("?")[0]}:${c.lineNumber + 1}`;
            if (gesehen.has(k)) continue;
            gesehen.add(k);
            inkl.set(k, (inkl.get(k) || 0) + dt);
        }
    }
    console.log(`   inklusive (Top 30):`);
    for (const [k, ms] of [...inkl].sort((a, b) => b[1] - a[1]).filter(([k]) => !/^\((root|program|idle)\)/.test(k)).slice(0, 30))
        console.log(`   ${((100 * ms) / gesamt).toFixed(1).padStart(5)} %  ${ms.toFixed(0).padStart(6)} ms  ${k}`);
}
