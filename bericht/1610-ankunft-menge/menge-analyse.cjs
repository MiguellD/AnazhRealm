// menge-analyse.cjs — die Ankunfts-Menge eines Kalt-Boots (M<n>.json + M<n>.cpuprofile der Stationslinse v2, abab-am):
//   (1) die Phasen 0 → Weltbild (erste Zeit je Marke) und der Haupt-Faden je Phase (Selbstzeit, Top 8);
//   (2) jeder Auftrag bis zum Weltbild: Klasse · Art · Stufe · Distanz · im ersten Blick · Bahn · echte Bau-Sekunden (FIFO je Bahn);
//       Summen je Klasse × erster Blick;
//   (3) die Karten: Bäcker-Zeit je Karte aufgeteilt (Baum-Bau · 8 Ansichten × 2 Pässe · Atlas gesamt · Rücklesen · neue Programme).
//   node menge-analyse.cjs M1 [M2 …]
"use strict";
const fs = require("fs");
const path = require("path");
const D = __dirname;
const med = (x) => (x.length ? x.slice().sort((a, b) => a - b)[Math.floor(x.length / 2)] : NaN);
const s = (ms) => (ms == null || !Number.isFinite(ms) ? "  –  " : (ms / 1000).toFixed(2).padStart(6));
const KLASSE = [
    ["leib", /^(mensch|wolf|deer|fox|bear|wesen|baer|human)\b/],
    ["haus", /^(schwarzwald|alpenchalet|gotisch|skandinavisch|alemannisch|fraenkisch|kathedrale|ruine|maurentor|geisttor|drachentor|maschine)\b/],
    ["ausstattung", /^(feuerstelle|marktstand|brunnen|laterne|wandlaterne|bank|tisch)\b/],
    ["baum", /^(eiche|birke|buche|tanne|fichte|kiefer|mammut|weide|ahorn|linde|laerche|zeder)\b/],
    ["fels", /^(kristalle|zacken|basalt|sediment|findling|verkalkt|karst|felsturm|geroell)\b/],
    ["boden-klein", /^(gras|blume|farn|schilf|gestruepp|totstamm|strauch|pilz)\b/],
];
const klasse = (preset) => {
    for (const [k, re] of KLASSE) if (re.test(preset)) return k;
    return "sonst";
};
const alle = [];
const alleK = [];
const torAlle = [];
for (const N of process.argv.slice(2)) {
    const j = JSON.parse(fs.readFileSync(path.join(D, N + ".json"), "utf8"));
    const w = j.wald;
    const T = j.weltbildDa;
    console.log(`\n================ ${N}: t(Weltbild) ${s(T)} s · erster Blick: ${JSON.stringify(w.blick || {}).slice(0, 120)}`);
    // (1) Phasen
    const ph = Object.entries(w.phase || {}).sort((a, b) => a[1] - b[1]);
    console.log(`-- das Buch: get-book gesendet ${s(w.buchAnfrage)} · angenommen ${s(w.buchAn)} · Worker: ${JSON.stringify(w.buchWorker || {}, (k, v) => (typeof v === "number" ? Math.round(v) : v))}`);
    console.log("-- Phasen (erste Zeit je Marke): " + ph.map(([k, t]) => `${k} ${s(t).trim()}`).join(" · "));
    const pf = path.join(D, N + ".cpuprofile");
    if (fs.existsSync(pf)) {
        const p = JSON.parse(fs.readFileSync(pf, "utf8"));
        const knoten = new Map(p.nodes.map((n) => [n.id, n]));
        const zeit = [];
        let t = p.startTime;
        for (let i = 0; i < p.samples.length; i++) zeit.push((t += p.timeDeltas[i]));
        const marken = [];
        let inLauf = false;
        for (let i = 0; i < p.samples.length; i++) {
            const ist = knoten.get(p.samples[i]).callFrame.functionName === "OMEN_TAKTMARKE";
            if (ist && !inLauf) marken.push(zeit[i]);
            inLauf = ist;
        }
        const kand = [];
        for (const m of marken) for (const sy of w.sync) kand.push(m / 1000 - sy);
        let v = NaN, best = -1;
        for (const c of kand) {
            const n = kand.filter((x) => Math.abs(x - c) <= 3).length;
            if (n > best) [best, v] = [n, c];
        }
        v = med(kand.filter((x) => Math.abs(x - v) <= 3));
        // die Phasen-Fenster: [0, erste Marke) … [letzte Marke, Weltbild]; vor der ersten Sync-Marke ist der Versatz der erste Treffer
        const grenzen = [["navigation", 0], ...ph.filter(([k]) => k !== "weltbild")].map(([k, t0], i, a) => [k, t0, i + 1 < a.length ? a[i + 1][1] : T]);
        const fenster = new Map(grenzen.map(([k]) => [k, { ms: 0, idle: 0, f: new Map() }]));
        for (let i = 0; i < p.samples.length; i++) {
            const tm = zeit[i] / 1000 - v;
            if (tm < 0 || tm > T) continue;
            const g = grenzen.find(([, a, b]) => tm >= a && tm < b);
            if (!g) continue;
            const dt = (p.timeDeltas[i + 1] || p.timeDeltas[i]) / 1000;
            const z = fenster.get(g[0]);
            z.ms += dt;
            const c = knoten.get(p.samples[i]).callFrame;
            const k = `${c.functionName || "(anonym)"} ${(c.url || "").split("/").pop().split("?")[0]}:${c.lineNumber + 1}`;
            if (/^\(idle\)/.test(k)) z.idle += dt;
            z.f.set(k, (z.f.get(k) || 0) + dt);
        }
        console.log("-- Haupt-Faden je Phase (Fenster ab der Marke bis zur nächsten; idle-Anteil; Top 6 Selbstzeit)");
        for (const [k, a, b] of grenzen) {
            const z = fenster.get(k);
            const top = [...z.f].filter(([x]) => !/^\((idle|program|root)\)/.test(x)).sort((x, y) => y[1] - x[1]).slice(0, 6);
            console.log(`   ${k.padEnd(16)} ${s(a)} → ${s(b)}  ${z.ms.toFixed(0).padStart(5)} ms · idle ${((100 * z.idle) / Math.max(1, z.ms)).toFixed(0)} % · ${top.map(([x, ms]) => x.replace(/ [^ ]*$/, (m) => m) + " " + ms.toFixed(0)).join(" · ").slice(0, 330)}`);
            const prog = [...z.f].filter(([x]) => /^\((program|garbage collector)\)/.test(x)).map(([x, ms]) => x.slice(1, 4) + " " + ms.toFixed(0)).join(" · ");
            const datei = new Map();
            for (const [x, ms] of z.f) { if (/^\((idle|program|root|garbage)/.test(x)) continue; const d = (x.split(" ").pop() || "").replace(/:\d+$/, "") || "?"; datei.set(d, (datei.get(d) || 0) + ms); }
            if (z.ms > 200) console.log(`        native: ${prog} · je Datei: ${[...datei].sort((p, q) => q[1] - p[1]).slice(0, 8).map(([d, ms]) => d + " " + ms.toFixed(0)).join(" · ")}`);
        }
    }
    // (2) die Menge
    const auf = w.auftrag.filter((a) => a.tQ <= T);
    const bahnVon = (r) => (/^imp/.test(r) ? "bäcker" + ((/b(\d+)_\d+$/.exec(r) || [])[1] || "") : "werk" + ((/w(\d+)_\d+$/.exec(r) || [])[1] || ""));
    const nr = (r) => Number(/(\d+)$/.exec(r)[1]);
    const bahnen = {};
    for (const a of w.auftrag) if (a.req && a.tS != null && a.tA != null) (bahnen[bahnVon(a.req)] = bahnen[bahnVon(a.req)] || []).push(a);
    // je Bahn in ANTWORT-Reihenfolge: der Faden ist einer, die Zeit seit der vorigen Antwort (oder seit dem Senden) trägt die
    // Antwort, die sie beendet (die Bahn ist nicht streng FIFO: Platten-Leser antworten asynchron, nr-Reihenfolge gab negative Zeiten)
    void nr;
    for (const liste of Object.values(bahnen)) {
        liste.sort((x, y) => x.tA - y.tA);
        let vor = -Infinity;
        for (const a of liste) {
            a.bau = a.tA - Math.max(a.tS, vor);
            vor = a.tA;
        }
    }
    // die Karte im ersten Blick: eine Karte (preset|seed) zählt „im Blick“, wenn ein Körper derselben Art und Saat im Blick steht
    const blickArt = new Set();
    for (const a of w.auftrag) {
        const m = /^build-asset:([^|]*)\|([^|]*)\|/.exec(a.id);
        if (m && a.blick === 1) blickArt.add(m[1] + "|" + m[2]);
    }
    for (const a of w.auftrag) {
        const m = /^bake-impostor:([^|]*)\|([^|]*)\|/.exec(a.id);
        if (m && a.blick == null) a.blick = blickArt.has(m[1] + "|" + m[2]) ? 1 : 0;
    }
    const zeilen = {};
    for (const a of auf) {
        const m = /^([a-z-]+):([^|]*)\|([^|]*)\|([^|]*)(\|vorrat)?/.exec(a.id) || [];
        const typ = m[5] ? "vorrat" : m[1] === "bake-impostor" ? "karte" : "körper";
        const preset = m[2] || "?";
        const kl = typ === "vorrat" ? "vorrat" : klasse(preset);
        const blick = a.blick === 1 ? "im Blick" : a.blick === 0 ? "außer Blick" : "ohne Ort";
        const key = `${typ.padEnd(6)} ${kl.padEnd(12)} ${blick}`;
        const z = (zeilen[key] = zeilen[key] || { n: 0, bauT: 0, bauAlle: 0, stufen: {}, arten: new Set(), dmin: Infinity, dmax: 0 });
        z.n++;
        if (a.bau != null && a.tA <= T) z.bauT += a.bau;
        if (a.bau != null) z.bauAlle += a.bau;
        z.stufen[m[4]] = (z.stufen[m[4]] || 0) + 1;
        z.arten.add(preset);
        if (Number.isFinite(a.d)) {
            z.dmin = Math.min(z.dmin, a.d);
            z.dmax = Math.max(z.dmax, a.d);
        }
        alle.push({ N, typ, kl, blick, bau: a.tA <= T ? a.bau : null });
    }
    console.log("-- die Ankunfts-Menge (gestellt bis Weltbild): Art × Klasse × erster Blick · Aufträge · Bau-s bis Weltbild · Stufen · Distanz · Arten");
    for (const [k, z] of Object.entries(zeilen).sort((a, b) => b[1].bauT - a[1].bauT))
        console.log(`   ${k.padEnd(36)} ${String(z.n).padStart(3)} · ${(z.bauT / 1000).toFixed(2).padStart(6)} s · L${JSON.stringify(z.stufen).replace(/"/g, "")} · ${Number.isFinite(z.dmin) ? z.dmin + "–" + z.dmax + " m" : "–"} · ${[...z.arten].slice(0, 8).join(",")}`);
    // (3) Karten
    const b = (w.backe || []).map((x) => x[4]);
    if (b.length) {
        const f = (k) => med(b.map((o) => o[k]).filter(Number.isFinite));
        console.log(`-- Karten im Bäcker (${b.length}): Median Atlas ${f("atlas").toFixed(0)} ms = Baum-Bau ${f("bau").toFixed(0)} + 8 Ansichten × 2 Pässe ${f("ansichten").toFixed(0)} + Rest; Rücklesen ${f("lesen").toFixed(0)} ms · neue Programme ${f("prog")} · Dreiecke ${f("dreiecke")} · Schale: Kodieren ${f("kodier").toFixed(0)} ms + Platte ${f("schreib").toFixed(0)} ms · von der Platte ${b.filter((o) => o.platte).length}`);
        // der Weg jeder Karte: gesendet (tS) → Start im Bäcker (t0 + Versatz der Bahn) → Atlas → Kodieren → Platte → Antwort (tA).
        // Der Versatz der Bahn (Zeit-Ursprung des Workers) = das kleinste tA − (t0 + atlas + kodier + schreib) der Bahn (die
        // schnellste Zustellung ≈ 0).
        const auftragVon = new Map(w.auftrag.map((a) => [a.req, a]));
        const proBahn = {};
        for (const x of w.backe || []) {
            const a = auftragVon.get(x[1]);
            if (!a) continue;
            const o = x[4];
            const arbeit = o.atlas + (o.kodier || 0) + (o.schreib || 0);
            (proBahn[bahnVon(x[1])] = proBahn[bahnVon(x[1])] || []).push({ x, a, o, arbeit, roh: a.tA - (o.t0 + arbeit) });
        }
        const zeilenK = [];
        for (const [bahn, liste] of Object.entries(proBahn)) {
            const versatz = Math.min(...liste.map((k) => k.roh));
            liste.sort((p, q) => p.a.tA - q.a.tA);
            const span = liste[liste.length - 1].a.tA - liste[0].a.tS;
            console.log(`   Bahn ${bahn}: ${liste.length} Karten · gesendet ${s(liste[0].a.tS)} → letzte Antwort ${s(liste[liste.length - 1].a.tA)} = ${(span / liste.length / 1000).toFixed(2)} s je Karte · Arbeit im Bäcker ${(liste.reduce((m, k) => m + k.arbeit, 0) / liste.length / 1000).toFixed(2)} s je Karte`);
            let vorEnde = -Infinity;
            for (const k of liste) {
                const start = k.o.t0 + versatz;
                const ende = start + k.arbeit;
                zeilenK.push({ bahn, art: k.x[2], tS: k.a.tS, start, warten: start - k.a.tS, leer: start - Math.max(vorEnde, k.a.tS), bau: k.o.bau, ansichten: k.o.ansichten, rest: k.o.atlas - k.o.bau - k.o.ansichten, kodier: k.o.kodier, zustellung: k.a.tA - ende, tA: k.a.tA, prog: k.o.prog });
                vorEnde = ende;
            }
        }
        console.log("   Bahn       Art        gesendet  Start  Antwort · wartet · leer davor · Baum-Bau · Ansichten · Rest · Kodieren · Zustellung (ms)");
        for (const z of zeilenK.sort((p, q) => p.tA - q.tA))
            console.log(`   ${z.bahn.padEnd(10)} ${String(z.art).padEnd(10)} ${s(z.tS)} ${s(z.start)} ${s(z.tA)} · ${Math.round(z.warten)} · ${Math.round(z.leer)} · ${Math.round(z.bau)} · ${Math.round(z.ansichten)}${z.prog ? " (" + z.prog + " Progr.)" : ""} · ${Math.round(z.rest)} · ${Math.round(z.kodier)} · ${Math.round(z.zustellung)}`);
        alleK.push(...zeilenK);
    }
    // (4) das Tor des ersten Weltbilds: je Term das letzte Mal, dass er fehlte (die Lens-Proben `fehlt`, ~0,5 s Raster)
    const TERM = [["welt", /Welt entsteht/], ["boden", /Boden/], ["horizont", /Horizont/], ["leib", /Leib/], ["buch", /Buch/], ["bauten", /Bauten wachsen/], ["dorf", /Dorf/], ["pflanzung", /gepflanzt|bepflanzt/], ["streu", /Wald-Stücke/], ["karten", /ferne Bäume/]];
    const zuletzt = {};
    for (const p of j.proben || []) for (const satz of p.fehlt || []) for (const [k, re] of TERM) if (re.test(satz)) zuletzt[k] = Math.max(zuletzt[k] || 0, p.t);
    console.log("-- das Tor: je Term zuletzt offen (s) · " + Object.entries(zuletzt).sort((a, b) => a[1] - b[1]).map(([k, t]) => `${k} ${s(t).trim()}`).join(" · "));
    torAlle.push({ N, T, zuletzt });
}
// (5) über alle Läufe: die Menge je Art × Klasse × erster Blick (Median der Bau-s je Lauf), die Karten-Mediane, das Tor
{
    const laeufe = [...new Set(alle.map((a) => a.N))];
    const schluessel = [...new Set(alle.map((a) => `${a.typ.padEnd(6)} ${a.kl.padEnd(12)} ${a.blick}`))];
    const tafel = schluessel.map((k) => {
        const je = laeufe.map((N) => alle.filter((a) => a.N === N && `${a.typ.padEnd(6)} ${a.kl.padEnd(12)} ${a.blick}` === k));
        return { k, n: med(je.map((x) => x.length)), bau: med(je.map((x) => x.reduce((m, a) => m + (a.bau > 0 ? a.bau : 0), 0))) };
    });
    console.log(`\n================ ÜBER ${laeufe.length} LÄUFE (Median je Lauf): Art × Klasse × erster Blick · Aufträge · Bau-s bis Weltbild (Antwort-Reihenfolge je Bahn)`);
    for (const z of tafel.sort((a, b) => b.bau - a.bau)) console.log(`   ${z.k.padEnd(36)} ${String(z.n).padStart(3)} · ${(z.bau / 1000).toFixed(2).padStart(6)} s`);
    const summe = (f) => med(laeufe.map((N) => alle.filter((a) => a.N === N && f(a)).reduce((m, a) => m + (a.bau > 0 ? a.bau : 0), 0)));
    console.log(`   Summe im Blick ${(summe((a) => a.blick === "im Blick") / 1000).toFixed(2)} s · außer Blick ${(summe((a) => a.blick === "außer Blick") / 1000).toFixed(2)} s · ohne Ort ${(summe((a) => a.blick === "ohne Ort") / 1000).toFixed(2)} s`);
    if (alleK.length) {
        const f = (k, nur) => med(alleK.filter(nur || (() => true)).map((z) => z[k]).filter(Number.isFinite));
        const erst = (z) => z.prog > 0, sonst = (z) => !(z.prog > 0);
        console.log(`   Karten (${alleK.length}): wartet ${f("warten").toFixed(0)} · Baum-Bau ${f("bau").toFixed(0)} · Ansichten ${f("ansichten", sonst).toFixed(0)} (mit neuen Programmen ${f("ansichten", erst).toFixed(0)}, ${alleK.filter(erst).length}×) · Rest ${f("rest").toFixed(0)} · Kodieren ${f("kodier").toFixed(0)} · Zustellung ${f("zustellung").toFixed(0)} · gesendet→Antwort ${med(alleK.map((z) => z.tA - z.tS)).toFixed(0)} ms`);
    }
    const terme = [...new Set(torAlle.flatMap((t) => Object.keys(t.zuletzt)))];
    console.log("   Tor, zuletzt offen (Median s): " + terme.map((k) => [k, med(torAlle.map((t) => t.zuletzt[k]).filter(Number.isFinite))]).sort((a, b) => a[1] - b[1]).map(([k, t]) => `${k} ${(t / 1000).toFixed(1)}`).join(" · ") + ` · Weltbild ${(med(torAlle.map((t) => t.T)) / 1000).toFixed(1)}`);
}
