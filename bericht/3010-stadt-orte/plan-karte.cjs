// w4-stadt-orte — die Karte des Stadt-Gesetzes (vorher ↔ nachher): der Export der Mess-Stadt am Grund der Welt (Raster des Gesetzes),
// von oben, je Schicht in ihrer Farbe — vorher der Kern von HEAD (alle Wege eine Farbe, kein Quartier, kein Ort), nachher der neue
// (die Wege nach Rang, die Häuser nach Quartier, Rundkurs und Gehege mit Zaun, Aussicht und Sicht). node plan-karte.cjs <repo> <alt-kern> <aus-ordner>
"use strict";
const path = require("path");
const fs = require("fs");
const vm = require("vm");
const [root, altKern, ausDir] = process.argv.slice(2);
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
const lade = (f) => {
    const sb = { console, Math, THREE: global.THREE };
    sb.self = sb.globalThis = sb.window = sb;
    vm.createContext(sb);
    vm.runInContext(fs.readFileSync(f, "utf8"), sb, { filename: f });
    return sb.__fachwerkCore;
};
const ALT = lade(altKern);
const NEU = lade(path.join(root, "fachwerk-core.js"));
require(path.join(root, "gelaende-core.js"));
const GN = globalThis.__gelaendeCore;
const L = GN.lageGrund("anazh-realm-seed", require(path.join(root, "vendor/simplex-noise.js")));
const STAEDTE = [
    { id: "stadt", titel: "stadt · „dorf 7 120“ (Großstadt)", dp: { seed: 7, nH: 120 }, ort: { x: 663, z: 423 } },
    { id: "stadt-voll", titel: "stadt-voll · „dorf 7 300“ (Metropole)", dp: { seed: 7, nH: 300 }, ort: { x: 836.2, z: 438.5 } },
    { id: "moderne", titel: "dieselbe Metropole in der Moderne (39 Hallen)", dp: { seed: 7, nH: 300, epoche: "moderne" }, ort: { x: 836.2, z: 438.5 } },
];
const QFARBE = { kern: "#c99a3b", wohnen: "#8a8f99", gewerbe: "#6b4f8f", vorstadt: "#7a9a6a" };
function svg(P, FC, titel, neu) {
    const pts = [];
    const nimm = (x, z) => pts.push([x, z]);
    for (const s of P.slots) if (s.obb) nimm(s.obb.cx, s.obb.cz);
    for (const rd of P.roads.concat(P.feldwege || [])) for (const q of rd.pts) nimm(q.x, q.z);
    for (const o of P.orte || []) for (const f of FC.ortFlaechen(o, 0)) for (const [a, b] of [[-1, -1], [1, 1], [-1, 1], [1, -1]]) {
        const c = Math.cos(f.phi), s = Math.sin(f.phi);
        nimm(f.cx + a * f.ex * c + b * f.ez * s, f.cz - a * f.ex * s + b * f.ez * c);
    }
    const x0 = Math.min(...pts.map((p) => p[0])) - 20, x1 = Math.max(...pts.map((p) => p[0])) + 20;
    const z0 = Math.min(...pts.map((p) => p[1])) - 20, z1 = Math.max(...pts.map((p) => p[1])) + 20;
    const B = 1400, S = B / Math.max(x1 - x0, z1 - z0);
    const X = (x) => ((x - x0) * S).toFixed(1), Z = (z) => ((z - z0) * S + 60).toFixed(1);
    const H = Math.ceil((z1 - z0) * S) + 120;
    const o = [`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil((x1 - x0) * S)}" height="${H}" font-family="sans-serif">`, `<rect width="100%" height="100%" fill="#e9ecd9"/>`];
    const poly = (P2, fill, stroke, sw) => `<polygon points="${P2.map(([x, z]) => X(x) + "," + Z(z)).join(" ")}" fill="${fill}" stroke="${stroke || "none"}" stroke-width="${sw || 0}"/>`;
    const box = (b, fill, stroke, sw) => {
        const c = Math.cos(b.phi || 0), s = Math.sin(b.phi || 0);
        return poly([[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, d]) => [b.cx + a * b.ex * c + d * b.ez * s, b.cz - a * b.ex * s + d * b.ez * c]), fill, stroke, sw);
    };
    const linie = (P2, farbe, w, dash) => `<polyline points="${P2.map((q) => X(q.x) + "," + Z(q.z)).join(" ")}" fill="none" stroke="${farbe}" stroke-width="${Math.max(1, w * S).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
    // die Orte: Fläche, Bahn, Zaun, Aussicht
    for (const q of P.orte || []) {
        for (const f of FC.ortFlaechen(q, 0)) o.push(box(f, q.rolle === "rundkurs" ? "#d6e6c3" : "#cfe8b8", "#5d7a3a", 1));
        if (q.rolle === "rundkurs") o.push(linie(q.bahn, "#6f6a62", q.breite));
        if (q.rolle === "gehege") {
            for (const z of q.zaun) o.push(linie([{ x: z.x0, z: z.z0 }, { x: z.x1, z: z.z1 }], "#5a4028", 0.6));
            o.push(`<circle cx="${X(q.auge.x)}" cy="${Z(q.auge.z)}" r="7" fill="#1f6fb2"/>`);
            o.push(linie([{ x: q.auge.x, z: q.auge.z }, { x: q.cx, z: q.cz }], "#1f6fb2", 0.4, "6,5"));
        }
    }
    for (const f of P.felder || []) o.push(box(f, "#d8c98f", "none"));
    if (P.platz) o.push(box(P.platz, P.platz.typ === "gras" ? "#b6d38e" : "#d9c7a0", "#8b7a55", 1));
    for (const fw of P.feldwege || []) o.push(linie(fw.pts, neu ? "#b9a77f" : "#a89a7a", fw.w || 3));
    for (const rd of P.roads) o.push(linie(rd.pts, neu ? (rd.rang === "haupt" ? "#8e2b1f" : "#b5784a") : "#9c8e74", rd.w));
    if (P.mauer) for (const sg of P.mauer.segs) o.push(linie([{ x: sg.x0, z: sg.z0 }, { x: sg.x1, z: sg.z1 }], "#6d6d6d", 1.6));
    const Q = P.quartiere || [];
    for (const s of P.slots) if (s.obb) o.push(box(s.obb, neu && Q[s.quartier] ? QFARBE[Q[s.quartier].rolle] || "#888" : "#9a9a9a", "#3a3a3a", 0.6));
    o.push(`<text x="16" y="34" font-size="26" fill="#222">${titel}</text>`);
    const legende = neu
        ? [["#8e2b1f", "Hauptstraße"], ["#b5784a", "Gasse"], ["#b9a77f", "Feldweg / Zufahrt"], ["#c99a3b", "Kern"], ["#8a8f99", "Wohnen"], ["#6b4f8f", "Gewerbe"], ["#7a9a6a", "Vorstadt"], ["#6f6a62", "Rundkurs"], ["#5a4028", "Gehege-Zaun"], ["#1f6fb2", "Aussicht"]]
        : [["#9c8e74", "Weg (ohne Rang)"], ["#9a9a9a", "Haus (ohne Quartier)"]];
    let lx = 16;
    for (const [f, t] of legende) {
        o.push(`<rect x="${lx}" y="${H - 44}" width="18" height="18" fill="${f}"/><text x="${lx + 24}" y="${H - 29}" font-size="16" fill="#222">${t}</text>`);
        lx += 40 + t.length * 8.6;
    }
    o.push("</svg>");
    return o.join("\n");
}
(async () => {
    const { chromium } = require("playwright");
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1400, height: 1500 } });
    fs.mkdirSync(ausDir, { recursive: true });
    const zahlen = {};
    for (const S of STAEDTE) {
        const dp = Object.assign({}, S.dp, { hoehe: GN.hoehenRaster(L, S.ort.x, S.ort.z, NEU.trasseRahmen(S.dp.nH)) });
        const A = ALT.exportSettlement(Object.assign({}, dp));
        const N = NEU.exportSettlement(Object.assign({}, dp));
        for (const [name, P, FC, neu] of [["vorher", A, ALT, false], ["nachher", N, NEU, true]]) {
            const s = svg(P, FC, S.titel + " — " + name, neu);
            fs.writeFileSync(path.join(ausDir, `${S.id}-${name}.svg`), s);
            await page.setContent(`<html><body style="margin:0">${s}</body></html>`);
            const el = await page.$("svg");
            await el.screenshot({ path: path.join(ausDir, `${S.id}-${name}.png`) });
        }
        zahlen[S.id] = {
            raenge: [...new Set(N.roads.map((r) => r.rang))],
            quartiere: (N.quartiere || []).map((q) => q.rolle),
            orte: (N.orte || []).map((q) => q.rolle),
            zufahrten: (N.feldwege || []).filter((f) => f.ort).map((f) => f.ort),
            hallen: N.slots.filter((x) => x.rolle === "halle").length,
            gewerbe: (N.quartiere || []).filter((q) => q.rolle === "gewerbe").map((q) => q.slots),
        };
    }
    await browser.close();
    fs.writeFileSync(path.join(ausDir, "karte-zahlen.json"), JSON.stringify(zahlen, null, 1));
    console.log(JSON.stringify(zahlen));
})().catch((e) => {
    console.error(e && e.stack);
    process.exit(1);
});
