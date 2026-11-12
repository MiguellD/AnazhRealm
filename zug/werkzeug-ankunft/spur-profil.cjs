// Aufruf: node <ort>/spur-profil.cjs <lauf.json> [mehr …]   (TOP=25 GLIEDER=45 UNTER=<glied>) — DAS PROFIL DES BODENS: aus der Start-Spur neben dem Lauf (<lauf>.trace.json, V8-CPU-Profil)
// die Eigen-Zeit des Haupt-Fadens im Fenster Renderer → Bild: die TOP größten Funktionen (Name, Datei:Zeile, ms) und dieselbe Zeit
// nach DOMÄNE — je Probe über ihren Stapel: trägt er `_knotenRate`, ist es Knoten-Bau; sonst entscheidet das innerste Glied aus
// Stamm oder Kern (Datei → Domäne); ein Stapel ganz im Vendor unter einem Zeichen-Glied ist „Zeichnen". Mehrere Läufe: Mittel.
const fs = require("fs");
const TOP = Number(process.env.TOP || 25);
const DOM = [
    [/gelaende-|wasser-|voxel|gelaende-core/, "Gelände/Voxel/Wasser"],
    [/vegetation-|phyto-core|stoff-karte/, "Vegetation"],
    [/siedlung-|bau-|fachwerk-core|porta-core|werkstatt-/, "Siedlung/Bau"],
    [/kreatur-|koerper-|feld-leben|tetrapoda-core|koerper-core|kampf/, "Leben/Bürger/Leib"],
    [/bild-himmel|bild-schatten|welt-licht|bild-sicht/, "Licht/Himmel"],
    [/studio-|foundry-core|foundry-bruecke|stoff-instanz|stoff-gang/, "Foundry/Studio-Lesen"],
    [/speicher-|daten|dienst/, "Speicher/Stand"],
    [/stoff-material/, "Stoff (Material-Graph)"],
    [/bild-kosten|bild-diaet/, "Bild-Kosten (Erst-Zeichnung, Diät)"],
    [/dirigent-/, "Dirigent (Takt, Ankunft)"],
];
const domVon = (url) => {
    for (const [re, d] of DOM) if (re.test(url)) return d;
    return null;
};
const ZEICHNER = /^(_loopRender|_einmalRender|_buehneRender|_kontaktPassZeichne|_spiegelPass|_atmoZeichne|_karteWeltBacken)$/;
const alle = [];
for (const lauf of process.argv.slice(2)) {
    const b = JSON.parse(fs.readFileSync(lauf, "utf8"));
    const j = JSON.parse(fs.readFileSync(lauf.replace(/[.]json$/, ".trace.json"), "utf8"));
    const ev = j.traceEvents || j;
    const [R, W] = [b.marken.rendererReady, b.marken.weltbild];
    // der Ursprung der Seiten-Uhr: navigationStart des Dokuments index.html
    let nav = null;
    for (const e of ev) if (e.name === "navigationStart" && e.args && e.args.data && /index[.]html/.test(String(e.args.data.documentLoaderURL || ""))) nav = nav === null ? e : nav;
    if (!nav) throw new Error("kein navigationStart in " + lauf);
    const [t0, pid, tid] = [nav.ts, nav.pid, nav.tid];
    // das Profil des Haupt-Fadens der Seite
    const profile = new Map();
    for (const e of ev) if (e.pid === pid && e.tid === tid && e.name === "Profile") profile.set(e.id, { start: e.args.data.startTime, knoten: new Map(), proben: [], zeit: e.args.data.startTime });
    for (const e of ev) {
        if (e.pid !== pid) continue;
        if (e.name === "ProfileChunk") {
            const p = profile.get(e.id);
            if (!p) continue;
            const c = e.args.data.cpuProfile || {};
            for (const n of c.nodes || []) p.knoten.set(n.id, { f: n.callFrame, eltern: n.parent });
            const s = c.samples || [];
            const d = e.args.data.timeDeltas || [];
            for (let i = 0; i < s.length; i++) {
                p.zeit += d[i] || 0;
                p.proben.push([p.zeit, s[i]]);
            }
        }
    }
    const P = [...profile.values()].sort((a, b) => b.proben.length - a.proben.length)[0];
    if (!P) throw new Error("kein Profil des Haupt-Fadens in " + lauf);
    const [von, bis] = [t0 + R * 1000, t0 + W * 1000];
    let eich = null;
    for (const [zt, id] of P.proben) {
        for (let k = P.knoten.get(id); k && eich === null; k = P.knoten.get(k.eltern)) if (k.f.functionName === "_weltbildSteht") eich = Math.round((zt - t0) / 1000);
        if (eich !== null) break;
    }
    console.log("   Eichung: erste Probe unter _weltbildSteht bei " + eich + " ms (Bild der Sonde " + W + ")");
    const selbst = new Map();
    const dom = new Map();
    const glied = new Map();
    const unter = new Map();
    const unterInnen = new Map();
    let sum = 0, ruhe = 0;
    const add = (m, k, v) => m.set(k, (m.get(k) || 0) + v);
    for (let i = 0; i + 1 < P.proben.length; i++) {
        const [t, id] = P.proben[i];
        if (t < von || t >= bis) continue;
        const dt = (Math.min(P.proben[i + 1][0], bis) - t) / 1000;
        const n = P.knoten.get(id);
        if (!n) continue;
        const f = n.f;
        if (f.functionName === "(idle)") {
            ruhe += dt;
            continue;
        }
        sum += dt;
        const datei = String(f.url || "").replace(/^.*\//, "").replace(/[?].*$/, "");
        add(selbst, `${f.functionName || "(anonym)"} · ${datei || "(nativ)"}:${f.lineNumber >= 0 ? f.lineNumber + 1 : "?"}`, dt);
        // die Domäne über den Stapel
        let d = null, knotenBau = false, zeichner = false, erstesGlied = null;
        // (UNTER=<glied>) dazu: die Zeit unter diesem Glied nach dem ersten Stamm-/Kern-Glied UNTER ihm auf dem Stapel (inklusiv)
        if (process.env.UNTER) {
            const kette = [];
            for (let k = n; k; k = P.knoten.get(k.eltern)) kette.push(k.f);
            const i = kette.findIndex((g) => g.functionName === process.env.UNTER);
            if (i >= 0) {
                let kind = "(selbst)";
                for (let q = i - 1; q >= 0; q--)
                    if (/\/stamm\/|-core[.]js/.test(String(kette[q].url || ""))) {
                        kind = kette[q].functionName || "(anonym)";
                        break;
                    }
                add(unter, kind, dt);
                add(unter, "Σ " + process.env.UNTER, dt);
                // und das innerste Stamm-Glied (wo die Zeit wirklich liegt)
                const innen = kette.find((g) => /\/stamm\/|-core[.]js/.test(String(g.url || "")));
                add(unterInnen, (innen && innen.functionName) || "(anonym)", dt);
            }
        }
        for (let k = n; k; k = P.knoten.get(k.eltern)) {
            const g = k.f;
            const u = String(g.url || "");
            if (g.functionName === "_knotenRate") knotenBau = true;
            if (ZEICHNER.test(g.functionName)) zeichner = true;
            if (d === null && /\/stamm\/|-core[.]js|welt-licht[.]js|foundry-bruecke/.test(u)) {
                d = domVon(u.replace(/^.*\//, ""));
                erstesGlied = (g.functionName || "(anonym)") + " · " + u.replace(/^.*\//, "").replace(/[?].*$/, "") + ":" + (g.lineNumber >= 0 ? g.lineNumber + 1 : "?");
            }
        }
        const blatt = String(f.url || "");
        let wo;
        if (knotenBau) wo = "Knoten-Bau";
        else if (f.functionName === "(garbage collector)") wo = "Speicher-Bereinigung (GC)";
        else if (f.functionName === "(program)") wo = "Browser (program: Stil, Layout, IPC, GPU-Befehle)";
        else if (zeichner && /three[.]/.test(blatt)) wo = "Zeichnen (Renderer des Vendors unter einem Zeichen-Glied)";
        else if (d) wo = d;
        else if (/three[.]/.test(blatt)) wo = "Vendor ohne Stamm-Rufer";
        else if (/__vor|sonde/.test(blatt)) wo = "Sonde";
        else wo = "Sonstiges (" + (blatt.replace(/^.*\//, "").replace(/[?].*$/, "") || "nativ") + ")";
        add(dom, wo, dt);
        add(glied, (knotenBau ? "[Knoten-Bau] " : zeichner && /three[.]/.test(blatt) ? "[Zeichnen] " : "") + (erstesGlied || "(ohne Stamm-Glied) " + f.functionName), dt);
    }
    alle.push({ lauf: lauf.replace(/^.*[\\/]/, ""), R, W, sum, ruhe, selbst, dom, glied, unter, unterInnen, proben: P.proben.length });
    console.log(`${lauf.replace(/^.*[\\/]/, "")}: Renderer ${R} · Bild ${W} · Fenster ${W - R} ms · belegt ${Math.round(sum)} ms (${Math.round((100 * sum) / (W - R))} %) · Ruhe ${Math.round(ruhe)} ms · Proben ${P.proben.length}`);
}
const n = alle.length;
const mittel = (feld) => {
    const m = new Map();
    for (const a of alle) for (const [k, v] of a[feld]) m.set(k, (m.get(k) || 0) + v / n);
    return [...m].sort((a, b) => b[1] - a[1]);
};
const S = alle.reduce((a, x) => a + x.sum, 0) / n;
console.log(`\nMITTEL aus ${n}: Fenster ${Math.round(alle.reduce((a, x) => a + x.W - x.R, 0) / n)} ms · belegt ${Math.round(S)} ms`);
console.log("\nNACH DOMÄNE (ms · Anteil):");
for (const [k, v] of mittel("dom")) if (v >= 15) console.log(`  ${String(Math.round(v)).padStart(5)} · ${String(Math.round((100 * v) / S)).padStart(2)} % · ${k}`);
console.log(`\nDIE ${TOP} GRÖSSTEN NACH EIGEN-ZEIT (ms):`);
let top = 0;
for (const [k, v] of mittel("selbst").slice(0, TOP)) {
    top += v;
    console.log(`  ${String(Math.round(v)).padStart(5)} · ${k}`);
}
console.log(`  Σ dieser ${TOP}: ${Math.round(top)} ms (${Math.round((100 * top) / S)} %)`);
const NG = Number(process.env.GLIEDER || 45);
console.log(`\nDIE ${NG} GRÖSSTEN GLIEDER (Zeit im innersten Stamm-/Kern-Glied samt allem, was es im Vendor ruft; ms):`);
for (const [k, v] of mittel("glied").slice(0, NG)) console.log(`  ${String(Math.round(v)).padStart(5)} · ${k}`);
if (process.env.UNTER) {
    console.log(`\nUNTER ${process.env.UNTER} — nach dem ersten Glied darunter (inklusiv, ms):`);
    for (const [k, v] of mittel("unter").slice(0, 16)) console.log(`  ${String(Math.round(v)).padStart(5)} · ${k}`);
    console.log(`UNTER ${process.env.UNTER} — nach dem innersten Glied (wo die Zeit liegt, ms):`);
    for (const [k, v] of mittel("unterInnen").slice(0, 22)) console.log(`  ${String(Math.round(v)).padStart(5)} · ${k}`);
}
