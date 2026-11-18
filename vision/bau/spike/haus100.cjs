// haus100.cjs — die 100 Häuser aus pool.json durch den ECHTEN HAUS (Kopie, MASSNUR): heute mit ihrem Export-Vektor, nach dem
// Gesetz mit W, D, st, Geschosshöhe, Sockel, Balken aus gesetz-proto.cjs (Räume, Treppe, Türen, Kamin baut der heutige HAUS —
// das Gesetz definiert keine neue Raumteilung, B4 „Raumteilung aus den Räumen des Programms“ ist ungeschrieben).
// Gerechnet: Behauptung 1 (Ständerreihe gegen Treppe, Tür, schmalen Raum), Unsinn-Liste, Streuung, Paletten, ms je Haus.
"use strict";
const fs = require("fs");
const path = require("path");
const { laden } = require("./lade.cjs");
const GZ = require("./gesetz-proto.cjs");

const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(mean(a.map((x) => (x - m) ** 2))); };
const r2 = (v) => Math.round(v * 100) / 100;
const achse = (half, sp, bay) => { let pts = [-half, ...sp, half].filter((v) => Math.abs(v) <= half + 1e-6); pts = [...new Set(pts.map((v) => +v.toFixed(3)))].sort((a, b) => a - b); const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], n = Math.max(1, Math.ceil((b - a) / bay - 1e-6)); for (let k = 1; k <= n; k++) out.push(+(a + ((b - a) * k) / n).toFixed(3)); } return out; };

// was ein gebautes Haus über sich sagt (dims, Fenster, Kamin) — die Prüfungen gegen eine Ständerreihe bei z
function lesen(H, modern) {
    const d = H.dims, W = d.W, D = d.D, fw = d.fw;
    const ch = H.chimney ? { x: (H.chimney.min[0] + H.chimney.max[0]) / 2, z: (H.chimney.min[2] + H.chimney.max[2]) / 2 } : null;
    const rooms = d.rooms.map((r) => Object.assign({}, r));
    // Tür je Raum an der Flurwand x = ±fw (FC:913–915), entfällt im Kaminfeld (FC:906–907)
    for (const r of rooms) {
        const xf = r.side === "L" ? -fw : fw;
        r.tuer = !(ch && !modern && Math.abs(xf - ch.x) < 0.85 && r.cz >= ch.z - 0.65 - 0.5 && r.cz <= ch.z + 0.65 + 0.5);
        r.breite = r.x1 - r.x0; r.tiefe = r.z1 - r.z0;
    }
    const stair = { x0: d.stairX0 - 0.05, x1: d.stairX1 + 0.05, z0: d.stairZ0 - 0.22, z1: d.stairZ1 + 0.3 };
    const fensterM2 = H.windows.reduce((s, o) => s + o.w * o.h, 0), fassade = 2 * (W + D) * (d.eaveY - d.baseY);
    return { W, D, fw, rooms, stair, chimney: ch, fensterAnteil: fensterM2 / fassade, eaveY: d.eaveY, baseY: d.baseY, bx: achse(W / 2, [-fw, fw], H.P.bayMax || 1.7) };
}
function konflikte(R, zs) {
    const k = { treppeLoch: 0, staenderTreppe: 0, staenderTuer: 0, schmalerRaum: 0 };
    for (const z of zs) {
        if (z > R.stair.z0 && z < R.stair.z1) { k.treppeLoch++; if (R.bx.some((x) => x > R.stair.x0 && x < R.stair.x1)) k.staenderTreppe++; }
        for (const r of R.rooms) {
            if (Math.abs(z - r.cz) < 0.5 + 0.08 && r.tuer) k.staenderTuer++;
            if (z > r.z0 && z < r.z1 && Math.min(r.breite, r.tiefe) < 1.8 && R.bx.some((x) => x > r.x0 && x < r.x1)) k.schmalerRaum++;
        }
    }
    k.irgend = k.staenderTreppe + k.staenderTuer + k.schmalerRaum > 0 ? 1 : 0;
    k.mitLoch = k.irgend || k.treppeLoch ? 1 : 0;
    return k;
}
// die beste Lage der Unterzüge im Spiel der Spannweite (jedes Feld ≤ L_max), Raster 0,05 m: so wenig Konflikte wie möglich
function besteLage(R, D, n, Lmax) {
    if (n < 2) return { zs: [], k: konflikte(R, []) };
    let best = null;
    const rek = (zs, prev) => {
        const j = zs.length;
        if (j === n - 1) { if (D / 2 - prev > Lmax + 1e-9) return; const k = konflikte(R, zs), c = 10 * (k.staenderTreppe + k.staenderTuer + k.schmalerRaum) + k.treppeLoch; if (!best || c < best.c) best = { zs: zs.slice(), k, c }; return; }
        for (let z = prev + 0.3; z <= prev + Lmax + 1e-9 && z < D / 2 - 0.3; z += 0.05) rek(zs.concat([+z.toFixed(3)]), z);
    };
    rek([], -D / 2);
    return best || { zs: [], k: { irgend: 1, mitLoch: 1, unmoeglich: 1 } };
}

// dritte Lage: die Ständerreihe NUR auf einer Querwand des heutigen Raum-Schnitts (Raumgrenzen z0/z1 im Innern, FC:606–621) —
// jedes Feld ≤ L_max; gibt es keine solche Folge, ist die Lage unmöglich
function querwandLage(R, D, n, Lmax) {
    if (n < 2) return { zs: [], k: konflikte(R, []) };
    const C = [...new Set(R.rooms.flatMap((r) => [r.z0, r.z1]).filter((z) => Math.abs(z) < D / 2 - 0.3).map((z) => +z.toFixed(3)))].sort((a, b) => a - b);
    let best = null;
    const rek = (zs, prev) => {
        if (D / 2 - prev <= Lmax + 1e-9) { const k = konflikte(R, zs), c = 10 * (k.staenderTreppe + k.staenderTuer + k.schmalerRaum) + k.treppeLoch; if (!best || c < best.c) best = { zs: zs.slice(), k, c }; }
        for (const z of C) if (z > prev + 0.3 && z - prev <= Lmax + 1e-9) rek(zs.concat([z]), z);
    };
    rek([], -D / 2);
    return best || { zs: [], k: { irgend: 1, mitLoch: 1, unmoeglich: 1 } };
}

(async () => {
    const { FC, THREE } = await laden();
    const POOL = JSON.parse(fs.readFileSync(path.join(__dirname, "pool.json"), "utf8"));
    const H100 = POOL.hundert;
    const modernVon = (p) => p.stil === "modern" || p.stil === "glas";
    const paramsHeute = (h) => Object.assign({}, h.hp, { nur: FC.MASSNUR });
    const paramsGesetz = (h) => { const L = h.L; if (!L) return null; const kel = L.R.some((r) => r[2] === "keller") ? 1 : 0;
        return Object.assign({}, h.hp, { W: L.F.W, D: L.F.D, storeys: L.F.st, egH: L.gH, ogH: L.gH, foundH: GZ.BAU_GESETZ.sockel, balkenB: L.T.b, balkenH: L.T.h, pitchDeg: L.neigung, keller: kel, annexN: 0, balcony: 0, grundriss: "I", leute: L.H.koepfe, nur: FC.MASSNUR }); };
    // Aufwärmen (JIT), dann die Zeit über die 100: heute gegen Gesetz
    for (const h of H100.slice(0, 10)) { FC.HAUS(THREE, FC.mat, paramsHeute(h)); if (h.L) FC.HAUS(THREE, FC.mat, paramsGesetz(h)); }
    const zeiten = { heute: 0, gesetz: 0, nH: 0, nG: 0 };
    const zeilen = [];
    for (const h of H100) {
        let t0 = process.hrtime.bigint();
        const H0 = FC.HAUS(THREE, FC.mat, paramsHeute(h));
        zeiten.heute += Number(process.hrtime.bigint() - t0) / 1e6; zeiten.nH++;
        const R0 = lesen(H0, modernVon(h.hp));
        const z = { plan: h.plan, a: h.a, gegen: h.gegen, region: h.region, jahr: h.hp.baujahr, rolle: h.hp.rolle, kultur: h.hp.kultur, stil: h.hp.stil, wohl: h.hp.wohl,
            heute: { W: h.hp.W, D: h.hp.D, st: h.hp.storeys, traufe: R0.eaveY, neigung: Math.min(62, h.hp.pitchDeg), fenster: R0.fensterAnteil, leute: h.leuteHeute, palette: JSON.stringify(h.hp.col || null), e: h.eHeute, Lmax: h.statikHeute.Lmax, lBieg: h.statikHeute.lBieg, traegt: h.statikHeute.traegt, bruch: h.statikHeute.bruch,
                ohneTuer: R0.rooms.filter((r) => !r.tuer).length, schmal09: R0.rooms.filter((r) => r.breite < 0.9).length, herd: !!R0.chimney, raeume: R0.rooms.length } };
        // was eine Ständerreihe heute (ein Unterzug in der Mitte, wenn man den heutigen Bau einfach teilte) träfe — Gegenprobe
        z.heute.k1 = konflikte(R0, [0]);
        if (h.L) {
            const L = h.L;
            t0 = process.hrtime.bigint();
            const H1 = FC.HAUS(THREE, FC.mat, paramsGesetz(h));
            zeiten.gesetz += Number(process.hrtime.bigint() - t0) / 1e6; zeiten.nG++;
            const R1 = lesen(H1, modernVon(h.hp));
            const n = L.S.n, zs = []; for (let k = 1; k < n; k++) zs.push(-L.F.D / 2 + (k * L.F.D) / n);
            const k = konflikte(R1, zs), kb = besteLage(R1, L.F.D, n, L.T.Lmax), kq = querwandLage(R1, L.F.D, n, L.T.Lmax);
            const palG = Object.assign({}, h.hp.col || {}); for (const key of ["holz", "stamm", "gefach", "stein", "lehm"]) if (key in palG) palG[key] = "ORT";
            z.gesetz = { gewerbe: h.gewerbe, klasse: h.klasse, koepfe: L.H.koepfe, b: L.los.b, W: L.F.W, D: L.F.D, st: L.F.st, gH: L.gH, traufe: L.traufe, neigung: L.neigung, deckung: L.deckung, fenster: L.fensterAnteil,
                fensterGebaut: R1.fensterAnteil, palette: JSON.stringify(palG), schiffe: n, spann: L.S.spann, Lmax: L.T.Lmax, ueberZiel: L.F.ueberZiel, groesserAlsLos: L.F.groesserAlsLos,
                k, kBest: kb.k, zsBest: kb.zs, kQuer: kq.k, zsQuer: kq.zs, ohneTuer: R1.rooms.filter((r) => !r.tuer).length, schmal09: R1.rooms.filter((r) => r.breite < 0.9).length, herd: !!R1.chimney, raeume: R1.rooms.length,
                raeumeProgramm: L.R.map((r) => r[0] + ":" + Math.round(r[1])).join(",") };
        }
        zeilen.push(z);
    }
    fs.writeFileSync(path.join(__dirname, "haus100.json"), JSON.stringify({ zeiten, zeilen }));
    // ── Zahlen ──
    const G = zeilen.filter((z) => z.gesetz), n = G.length;
    console.log(`100 Häuser, davon Haushalts-Lose mit Gesetz ${n}, Sonderbauten ${zeilen.length - n}`);
    console.log(`ms je Haus (HAUS, MASSNUR): heute ${(zeiten.heute / zeiten.nH).toFixed(2)} · Gesetz ${(zeiten.gesetz / zeiten.nG).toFixed(2)}`);
    // Statik heute über die 100
    console.log(`Statik heute (100): trägt ${zeilen.filter((z) => z.heute.traegt).length} · Bruch (Biegung) ${zeilen.filter((z) => z.heute.bruch).length} · D>L_max ${zeilen.filter((z) => !z.heute.traegt).length}; Spannweite D Q10/50/90 ${q(zeilen.map((z) => z.heute.D), 0.1)}/${q(zeilen.map((z) => z.heute.D), 0.5)}/${q(zeilen.map((z) => z.heute.D), 0.9)}; L_max Q50 ${r2(q(zeilen.map((z) => z.heute.Lmax), 0.5))}`);
    console.log(`Statik Gesetz (${n}): spann > L_max ${G.filter((z) => z.gesetz.spann > z.gesetz.Lmax + 1e-9).length} · Schiffe 1/2/3/4: ${[1, 2, 3, 4].map((s) => G.filter((z) => z.gesetz.schiffe === s).length).join("/")}`);
    // Behauptung 1
    const B1 = { gleich: G.filter((z) => z.gesetz.k.irgend).length, gleichLoch: G.filter((z) => z.gesetz.k.mitLoch).length, best: G.filter((z) => z.gesetz.kBest.irgend).length, bestLoch: G.filter((z) => z.gesetz.kBest.mitLoch).length,
        treppe: G.filter((z) => z.gesetz.k.staenderTreppe).length, loch: G.filter((z) => z.gesetz.k.treppeLoch).length, tuer: G.filter((z) => z.gesetz.k.staenderTuer).length, schmal: G.filter((z) => z.gesetz.k.schmalerRaum).length, mehrschiffig: G.filter((z) => z.gesetz.schiffe > 1).length };
    B1.quer = G.filter((z) => z.gesetz.kQuer.irgend).length; B1.querUnmoeglich = G.filter((z) => z.gesetz.kQuer.unmoeglich).length; B1.querTreppe = G.filter((z) => z.gesetz.kQuer.staenderTreppe).length; B1.querLoch = G.filter((z) => z.gesetz.kQuer.treppeLoch).length;
    console.log(`B1 auf der Querwand: Konflikt ${B1.quer}/${n} (davon keine Folge ≤ L_max ${B1.querUnmoeglich}, Ständer in Treppe ${B1.querTreppe}, Unterzug über Treppenloch ${B1.querLoch})`);
    console.log(`B1 Ständerreihe (gleich geteilt): ${B1.gleich}/${n} Häuser mit Ständer in Treppe/Tür/Raum<1,8 (Treppe ${B1.treppe} · Tür ${B1.tuer} · schmaler Raum ${B1.schmal}); Unterzug über dem Treppenloch ${B1.loch}; beste Lage im Spiel der Spannweite: ${B1.best} (mit Loch ${B1.bestLoch}); mehrschiffig ${B1.mehrschiffig}`);
    const ghb = G.map((z) => z.gesetz.gH - 0.2107);
    console.log(`Geschosshöhe − Balkenhöhe Gesetz: außerhalb 1,9–2,6 m ${ghb.filter((v) => v < 1.9 || v > 2.6).length}/${n} (Werte ${[...new Set(ghb.map(r2))].join(", ")})`);
    // Unsinn
    const uns = { ohneTuerH: zeilen.filter((z) => z.heute.ohneTuer).length, ohneTuerG: G.filter((z) => z.gesetz.ohneTuer).length, schmalH: zeilen.filter((z) => z.heute.schmal09).length, schmalG: G.filter((z) => z.gesetz.schmal09).length,
        ohneHerdG: G.filter((z) => !z.gesetz.herd).length, ueberZiel: G.filter((z) => z.gesetz.ueberZiel).length, groesser: G.filter((z) => z.gesetz.groesserAlsLos).length };
    console.log("Unsinn", JSON.stringify(uns));
    // Streuung heute ↔ Gesetz an denselben Häusern
    const M = (f) => { const a = G.map(f).filter((v) => isFinite(v)); return { q10: r2(q(a, 0.1)), q50: r2(q(a, 0.5)), q90: r2(q(a, 0.9)), cv: r2(sd(a) / mean(a)), r: r2(q(a, 0.9) / Math.max(1e-9, q(a, 0.1))) }; };
    const S = {};
    for (const [k, fH, fG] of [["Breite", (z) => z.heute.W, (z) => z.gesetz.W], ["Tiefe", (z) => z.heute.D, (z) => z.gesetz.D], ["Traufe", (z) => z.heute.traufe, (z) => z.gesetz.traufe], ["Geschosse", (z) => z.heute.st, (z) => z.gesetz.st], ["Neigung", (z) => z.heute.neigung, (z) => z.gesetz.neigung], ["Fenster-Anteil", (z) => z.heute.fenster, (z) => z.gesetz.fenster], ["Leute", (z) => z.heute.leute, (z) => z.gesetz.koepfe]])
        S[k] = { heute: M(fH), gesetz: M(fG) };
    S.Paletten = { heute: new Set(G.map((z) => z.heute.palette)).size, gesetz: new Set(G.map((z) => z.gesetz.palette)).size };
    for (const [k, v] of Object.entries(S)) console.log(`  ${k}: heute ${JSON.stringify(v.heute)} · Gesetz ${JSON.stringify(v.gesetz)}`);
    fs.writeFileSync(path.join(__dirname, "haus100-zahlen.json"), JSON.stringify({ zeiten, B1, uns, S }, null, 1));
    // die Unsinn-Häuser beim Namen
    for (const z of G) {
        const why = [];
        if (z.gesetz.k.staenderTreppe) why.push("Ständer in Treppe"); if (z.gesetz.k.staenderTuer) why.push("Ständer in Tür"); if (z.gesetz.k.schmalerRaum) why.push("Ständer in Raum<1,8");
        if (z.gesetz.ohneTuer) why.push(z.gesetz.ohneTuer + " Raum ohne Tür"); if (z.gesetz.schmal09) why.push(z.gesetz.schmal09 + " Raum <0,9 m breit"); if (!z.gesetz.herd) why.push("Haushalt ohne Herd"); if (z.gesetz.ueberZiel) why.push("EG tiefer als dZiel");
        if (why.length && (z.gegen || !z.gesetz.herd || z.gesetz.ohneTuer)) console.log(`  ${z.plan}#${z.a} ${z.gegen || ""} ${z.region} ${z.jahr} ${z.kultur}/${z.stil} ${z.gesetz.gewerbe}/${z.gesetz.klasse} ${z.gesetz.koepfe} K · ${z.gesetz.W}×${z.gesetz.D}×${z.gesetz.st} · ${why.join(", ")}`);
    }
    for (const z of zeilen.filter((z) => z.gegen)) console.log(`  GEGEN ${z.gegen}: ${z.plan}#${z.a} ${z.region} ${z.jahr} ${z.rolle} ${z.kultur} heute ${z.heute.W}×${z.heute.D}×${z.heute.st} → Gesetz ${z.gesetz ? `${z.gesetz.gewerbe}/${z.gesetz.klasse} ${z.gesetz.koepfe} K Los ${z.gesetz.b} · ${z.gesetz.W}×${z.gesetz.D}×${z.gesetz.st} Traufe ${r2(z.gesetz.traufe)} · ${z.gesetz.schiffe} Schiffe à ${r2(z.gesetz.spann)} · Konflikt ${z.gesetz.k.irgend}/${z.gesetz.kBest.irgend} · ${z.gesetz.raeumeProgramm}` : "Sonderbau"}`);
})().catch((e) => { console.error(e); process.exit(1); });
