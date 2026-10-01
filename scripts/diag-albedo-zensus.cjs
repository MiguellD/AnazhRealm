// diag-albedo-zensus.cjs — DER ALBEDO-ZENSUS (V18.506, Gebot 10: die Linse nennt die Klasse beim
// NAMEN). Jedes Rezept des Buchs wird über die ECHTE Foundry-Naht gebaut (asset-worker-harness:
// dieselben Kerne wie Labor und Welt), je Teil-Mesh die flächen-gewichtete LINEARE Albedo aus den
// Vertex-Farben (die Welt liest nur Vertex-Farben — Lehre 19). Gegenprobe in der laufenden Welt:
// `werkbank albedo` (Shader-Albedo unter weißem Umgebungslicht π, 18-%-Karte liest 0,180).
//
//   node scripts/diag-albedo-zensus.cjs [--nur <regex>] [--json datei]
//
// Referenz (lineare Luminanz Y = 0,2126 R + 0,7152 G + 0,0722 B, Tageslicht-Albedo im
// Sichtbaren): Holzkohle 0,02–0,04 · Nadeln 0,04–0,09 · Laub/Gras 0,06–0,16 · Rinde 0,06–0,25 ·
// Erde 0,08–0,20 · Fels 0,10–0,45 · Sand 0,25–0,45 · Kalkputz 0,55–0,80 · Neuschnee 0,80–0,90.
// Das Labor-Validierungsband der Profi-Engines (Nicht-Metall) ist sRGB 30–240 = linear 0,012–0,87.
"use strict";
const { runWithWorker } = require("./lib/asset-worker-harness.cjs");
const fs = require("fs");

const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : d;
};
const NUR = opt("--nur", null) ? new RegExp(opt("--nur")) : null;
const JSON_AUS = opt("--json", null);
const PORT = Number(process.env.ZENSUS_PORT || 4547);

const f32 = (b64) => {
    const buf = Buffer.from(b64, "base64");
    return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
};
// Index-Puffer: Uint32 oder Uint16 (der Typ reist nicht mit) — Uint32 gilt, wenn jeder Wert < n
const idx = (b64, n) => {
    const buf = Buffer.from(b64, "base64");
    if (buf.byteLength % 4 === 0) {
        const u32 = new Uint32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
        if (u32.every((v) => v < n)) return u32;
    }
    return new Uint16Array(buf.buffer, buf.byteOffset, buf.byteLength / 2);
};

// flächen-gewichtete Mittel-Albedo eines Teil-Meshes (Dreiecks-Fläche × Mittel der drei Ecken)
function albedoMesh(m) {
    const P = m.attrs.position && f32(m.attrs.position.b64);
    if (!P) return null;
    // Albedo = Material-Farbe × Vertex-Farbe (beide linear; fehlt eine, zählt sie als 1)
    const mc = (m.mat && Array.isArray(m.mat.color) && m.mat.color) || [1, 1, 1];
    const C = m.attrs.color;
    const cs = C ? C.itemSize : 3;
    const col = C ? f32(C.b64) : null;
    const n = P.length / 3;
    const I = m.index ? idx(m.index, n) : null;
    const tri = I ? I.length / 3 : n / 3;
    let A = 0,
        r = 0,
        g = 0,
        b = 0;
    for (let t = 0; t < tri; t++) {
        const a = I ? I[t * 3] : t * 3,
            c1 = I ? I[t * 3 + 1] : t * 3 + 1,
            c2 = I ? I[t * 3 + 2] : t * 3 + 2;
        const ux = P[c1 * 3] - P[a * 3],
            uy = P[c1 * 3 + 1] - P[a * 3 + 1],
            uz = P[c1 * 3 + 2] - P[a * 3 + 2];
        const vx = P[c2 * 3] - P[a * 3],
            vy = P[c2 * 3 + 1] - P[a * 3 + 1],
            vz = P[c2 * 3 + 2] - P[a * 3 + 2];
        const fl = 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
        if (!(fl > 0)) continue;
        A += fl;
        for (const k of [a, c1, c2]) {
            r += ((col ? col[k * cs] : 1) * mc[0] * fl) / 3;
            g += ((col ? col[k * cs + 1] : 1) * mc[1] * fl) / 3;
            b += ((col ? col[k * cs + 2] : 1) * mc[2] * fl) / 3;
        }
    }
    if (!(A > 0)) return null;
    r /= A;
    g /= A;
    b /= A;
    return { r, g, b, Y: 0.2126 * r + 0.7152 * g + 0.0722 * b, flaeche: A, verts: n };
}

(async () => {
    const zeilen = [];
    await runWithWorker(PORT, async ({ build, getData }) => {
        const env = await getData("get-book");
        const book = env.book || env.recipes || {};
        const ids = Object.keys(book)
            .filter((id) => !NUR || NUR.test(id) || NUR.test(String((book[id] || {}).kind)))
            .sort();
        for (const id of ids) {
            const kind = (book[id] && book[id].kind) || "?";
            let a;
            try {
                a = await build({ presetId: id, seed: 7, lod: 0, season: "summer" });
            } catch (e) {
                zeilen.push({ id, kind, fehler: String((e && e.message) || e) });
                continue;
            }
            for (const [i, m] of (a.meshes || []).entries()) {
                const s = albedoMesh(m);
                if (!s) continue;
                zeilen.push({
                    id,
                    kind,
                    teil: i,
                    mat: m.kind,
                    quelle: m.attrs.color ? (m.mat && m.mat.color ? "mat×vc" : "vc") : "mat",
                    meshKind: m.kind,
                    rgb: [s.r, s.g, s.b].map((v) => +v.toFixed(3)).join("/"),
                    Y: +s.Y.toFixed(3),
                    flaeche: +s.flaeche.toFixed(2),
                    verts: s.verts,
                });
            }
        }
    });
    for (const z of zeilen)
        console.log(
            z.fehler
                ? `${z.id.padEnd(34)} ${String(z.kind).padEnd(10)} FEHLER ${z.fehler}`
                : `${z.id.padEnd(34)} ${String(z.kind).padEnd(10)} #${z.teil} ${String(z.mat || "").padEnd(12)} ${z.quelle.padEnd(6)} Y ${z.Y.toFixed(3)}  rgb ${z.rgb}  (A ${z.flaeche} m², ${z.verts} V)`
        );
    if (JSON_AUS) fs.writeFileSync(JSON_AUS, JSON.stringify(zeilen, null, 1));
    console.log(`\n${zeilen.length} Teil-Meshes aus ${new Set(zeilen.map((z) => z.id)).size} Rezepten.`);
    process.exit(0);
})().catch((e) => {
    console.error("Zensus-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
