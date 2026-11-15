// kern.cjs [bild.png] — im Baum: das Kachel-Gesetz des KERNS (w28-stadt-netz: `kachelTore`, `kachelNetz`, `viertelWort`,
// `exportSettlement` mit dp.kachel) gegen die Zahlen des Spikes:
//   NAHT    10⁴ zufällige Nachbar-Paare: Tore der gemeinsamen Kante byte-gleich, die Straße an der Kante senkrecht
//   SUMME   Städte von 501 bis 10⁶ Häusern: Σ Kacheln = Zahl des Worts, keine über `jeKachel`, µs je Frage
//   STUFE 1 ms je Kachel, byte-stabil
//   DICHTE  die Kacheln (0,0) und (1,0) der Stadt „7 1710“ (3 × 3 voll): Naht ± 30 m gegen Mitte, flach und am echten Grund;
//           Stufe 2 in ms, Lose, Mauer (nur an Rand-Kanten), ortPlan (Tore statt Wenden)
//   BILD    die 3 × 3 Kacheln von oben mit der Mauer am Rand der Stadt
"use strict";
const path = require("path"), crypto = require("crypto"), fs = require("fs"), zlib = require("zlib");
const BAUM = process.cwd();
const { ctx: W } = require(path.join(BAUM, "scripts/lib/stamm.cjs")).ladeKlasse(BAUM);
const FC = require(path.join(BAUM, "scripts/lib/welt-boot.cjs")).studioKern("fachwerk-core.js", "__fachwerkCore"), GK = W.__gelaendeCore;
const M = FC.SIEDLUNG.cellM, NT = FC.STADT_NETZ.tore, V = FC.STADT_NETZ.jeKachel;
const ms = (f) => { const t = process.hrtime.bigint(); const r = f(); return [Number(process.hrtime.bigint() - t) / 1e6, r]; };
const sha = (o) => crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex").slice(0, 16);
const h32 = (a, b) => { let x = (Math.imul(a + 1, 0x9e3779b1) ^ Math.imul(b + 7, 0x85ebca6b)) >>> 0; x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d) >>> 0; return (x ^ (x >>> 13)) >>> 0; };
let rot = 0;
const zeile = (ok, s) => { if (!ok) rot++; console.log((ok ? "GRÜN " : "ROT  ") + s); };
// NAHT
{
    let ungleich = 0, maxD = 0, maxW = 0;
    for (let q = 0; q < 10000; q++) {
        const samen = h32(q, 1) % 100000, ix = (h32(q, 2) % 2001) - 1000, iz = (h32(q, 3) % 2001) - 1000, ost = q % 2 === 0;
        const A = FC.kachelNetz(samen, ix, iz), B = ost ? FC.kachelNetz(samen, ix + 1, iz) : FC.kachelNetz(samen, ix, iz + 1);
        const a = ost ? A.tore.o : A.tore.s, b = ost ? B.tore.w : B.tore.n;
        if (JSON.stringify(a) !== JSON.stringify(b)) ungleich++;
        for (let j = 0; j < NT; j++) maxD = Math.max(maxD, Math.abs(a[j] - b[j]));
        const eA = A.edges.filter((e) => { const p = e.pts[e.pts.length - 1]; return ost ? Math.abs(p.x - M / 2) < 1e-6 : Math.abs(p.z - M / 2) < 1e-6; });
        const eB = B.edges.filter((e) => { const p = e.pts[0]; return ost ? Math.abs(p.x + M / 2) < 1e-6 : Math.abs(p.z + M / 2) < 1e-6; });
        if (eA.length !== NT || eB.length !== NT) ungleich++;
        for (let j = 0; j < Math.min(eA.length, eB.length); j++) {
            const pa = eA[j].pts, pb = eB[j].pts, soll = ost ? 0 : Math.PI / 2;
            maxW = Math.max(maxW, Math.abs(Math.atan2(pa[pa.length - 1].z - pa[pa.length - 2].z, pa[pa.length - 1].x - pa[pa.length - 2].x) - soll), Math.abs(Math.atan2(pb[1].z - pb[0].z, pb[1].x - pb[0].x) - soll));
            if (eA[j].gen !== eB[j].gen) ungleich++;
        }
    }
    zeile(!ungleich && maxD === 0 && maxW < 0.01, "NAHT: 10000 Nachbar-Paare, " + ungleich + " ungleich (Tore, Zahl und Klasse der Straßen) · Abstand der Tore " + maxD + " m · Straße an der Kante " + ((maxW * 180) / Math.PI).toFixed(2) + "° von der Senkrechten");
}
// SUMME
for (const nH of [500, 501, 508, 1000, 1710, 2000, 10000, 1000000]) {
    const R = FC.stadtRinge(nH);
    let n = 0, sum = 0, hi = 0, fragen = 0;
    const samen = new Set();
    const [t] = ms(() => { for (let i = -R - 1; i <= R + 1; i++) for (let k = -R - 1; k <= R + 1; k++) { const v = FC.viertelWort(7, nH, i, k); fragen++; if (!v) continue; n++; sum += v.nH; hi = Math.max(hi, v.nH); samen.add(v.seed); } });
    zeile((sum === nH || (nH - sum >= 0 && nH - sum < FC.STADT_FUNKTION.rest)) && (nH <= FC.STADT_FUNKTION.voll || hi <= V) && (samen.size === n || n > 1000), "SUMME Stadt " + nH + ": Ringe " + R + " · Kacheln " + n + " · Σ " + sum + " · größte " + hi + " · Samen verschieden " + (samen.size === n) + " · " + ((1000 * t) / fragen).toFixed(1) + " µs je Frage");
}
// STUFE 1
{
    for (let k = 0; k < 200; k++) FC.kachelNetz(7, k, 3);
    const [t, N] = ms(() => { let x; for (let k = 0; k < 2000; k++) x = FC.kachelNetz(7, k, -k); return x; });
    const a = sha(FC.kachelNetz(7, 3, -2)), b = (FC.kachelNetz(7, 99, 4), sha(FC.kachelNetz(7, 3, -2)));
    zeile(t / 2000 < 1 && a === b, "STUFE 1: " + (t / 2000).toFixed(3) + " ms je Kachel (" + N.nodes.length + " Knoten, " + N.edges.length + " Strecken, " + N.bloecke.length + " Blöcke) · byte-stabil " + (a === b));
}
// STUFE 2 und DICHTE
const STADT = 9 * V, ctxFlach = { hoeheAt: () => 10, flaeche: () => () => 10, wasserAt: () => false };
const drin = (q) => { const o = q.obb, r = Math.abs(Math.cos(o.phi)) * o.ex + Math.abs(Math.sin(o.phi)) * o.ez, s = Math.abs(Math.sin(o.phi)) * o.ex + Math.abs(Math.cos(o.phi)) * o.ez; return Math.abs(o.cx) + r <= M / 2 + 0.01 && Math.abs(o.cz) + s <= M / 2 + 0.01; };
const dichte = (L, x0, x1, z0, z1) => (L.filter((q) => q.x >= x0 && q.x < x1 && q.z >= z0 && q.z < z1).length * 10000) / ((x1 - x0) * (z1 - z0));
function paar(name, grund) {
    const alle = [], je = [], kante = [[], []];
    for (const i of [0, 1]) {
        const dp = { kachel: { samen: 7, nH: STADT, i, k: 0 }, hoehe: grund ? grund.raster(i) : undefined };
        const [t, p] = ms(() => FC.exportSettlement(dp));
        const [tO, v2] = ms(() => FC.ortPlan(p, grund ? { x: grund.ort.x + i * M, z: grund.ort.z } : { x: 0, z: 0 }, grund ? grund.ctx : ctxFlach));
        const vk = v2.verkehr || (v2.plan && v2.plan.verkehr), K = vk && vk.kreuzungen ? vk.kreuzungen : [];
        const aussen = v2.slots.filter((q) => !drin(q)).length;
        // die Höhe der Fahrbahn an der gemeinsamen Kante: die Enden der Wege bei x = ± M/2 (ihr z, ihre Höhe)
        for (const w of v2.roads || []) for (const e of [0, w.pts.length - 1]) if (w.ys && Math.abs(w.pts[e].x - (i ? -M / 2 : M / 2)) < 0.01) kante[i].push([w.pts[e].z, w.ys[e]]);
        for (const q of v2.slots) alle.push({ x: q.obb.cx + i * M, z: q.obb.cz, o: Object.assign({}, q.obb, { cx: q.obb.cx + i * M }) });
        je.push("Kachel (" + i + ",0): Wort " + p.seed + " " + V + " · Lose " + p.slots.length + " · am Ort " + v2.slots.length + " · außerhalb der Kachel " + aussen + " · " + p.region + " " + p.jahr + " · Rand " + Object.keys(p.kachel.rand).filter((k) => p.kachel.rand[k]).join("") + " · Mauer " + (p.mauer ? p.mauer.segs.length + " Stücke, " + p.mauer.towers.length + " Türme" : "keine") +
            " · Stufe 2 " + t.toFixed(0) + " ms · ortPlan " + tO.toFixed(0) + " ms · Enden " + K.filter((k) => k.ende).length + " · Tore " + K.filter((k) => k.tor).length + " · Wenden " + K.reduce((a, k) => a + ((k.wenden || []).length), 0) + " · Plan " + (JSON.stringify(p).length / 1024).toFixed(0) + " / v2 " + (JSON.stringify(v2).length / 1024).toFixed(0) + " KB");
        if (aussen) rot++;
    }
    const h = M / 2, mitte = (dichte(alle, -60, 60, -60, 60) + dichte(alle, M - 60, M + 60, -60, 60)) / 2, naht = dichte(alle, h - 30, h + 30, -h, h);
    let ueber = 0;
    const A = alle.filter((q) => q.x < h && q.x > h - 40), B = alle.filter((q) => q.x >= h && q.x < h + 40);
    for (const a of A) for (const b of B) if (FC.obbSep(a.o, b.o) < 0) ueber++;
    {
        let sprung = 0, paare = 0;
        for (const [z, y] of kante[0]) { const b = kante[1].find((q) => Math.abs(q[0] - z) < 0.01); if (b) { paare++; sprung = Math.max(sprung, Math.abs(b[1] - y)); } }
        zeile(paare === NT && sprung <= 1e-6, "SPRUNG DER FAHRBAHN AN DER KANTE " + name + ": " + paare + " Tore (Soll " + NT + ") · größter Sprung " + sprung.toFixed(6) + " m" + (kante[0].length ? " · Höhen " + kante[0].map((q) => q[1].toFixed(2)).join(" / ") : ""));
    }
    zeile(naht >= 0.8 * mitte && !ueber, "DICHTE " + name + ": Naht ± 30 m " + naht.toFixed(1) + " Häuser/ha · Mitte " + mitte.toFixed(1) + " · Verhältnis " + (naht / mitte).toFixed(2) + " (Soll ≥ 0,8) · Überdeckung über die Naht " + ueber);
    for (const z of je) console.log("       " + z);
}
paar("flach", null);
{
    const L = GK.lageGrund(GK.LAGE_GRUND.seed, W.SimplexNoise), ort = { x: 856.4202446177895, z: 439.4899739519243 };
    paar("am echten Grund", { ort, ctx: GK.ortCtx(L), raster: (i) => GK.hoehenRaster(L, ort.x + i * M, ort.z, FC.trasseRahmen(V)) });
}
// das Wort über der Wand ohne Kachel ist die Mitte seiner Stadt; bis zur Wand ist kein Wort eine Kachel
{
    const a = FC.exportSettlement({ seed: 7, nH: 1000 }), b = FC.exportSettlement({ kachel: { samen: 7, nH: 1000, i: 0, k: 0 } }), c = FC.exportSettlement({ seed: 7, nH: 300 });
    zeile(sha(a) === sha(b) && !!a.kachel && a.stadt.nH === 1000 && !c.kachel && !c.stadt && !c.netz, "MITTE: „dorf 7 1000“ = die Kachel (0,0) seiner Stadt (" + a.slots.length + " Lose, " + a.kernel + ", Mauer " + (a.mauer ? a.mauer.segs.length : 0) + " Stücke) · „dorf 7 300“ trägt kein Feld der Stadt · sha " + sha(a));
}
// BILD
if (process.argv[2]) {
    const S = 2, K = 3, PX = K * M * S, buf = Buffer.alloc(PX * PX * 4);
    const setze = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= PX || y >= PX) return; const i = (y * PX + x) * 4; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255; };
    for (let i = 0; i < PX * PX; i++) buf.set([122, 148, 92, 255], i * 4);
    const scheibe = (wx, wz, r, c) => { const cx = wx * S, cy = wz * S, R = r * S; for (let y = Math.floor(cy - R); y <= cy + R; y++) for (let x = Math.floor(cx - R); x <= cx + R; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= R * R) setze(x, y, c); };
    const kasten = (o, ox, oz, c) => { const co = Math.cos(o.phi), si = Math.sin(o.phi), R = Math.hypot(o.ex, o.ez);
        for (let y = Math.floor((oz + o.cz - R) * S); y <= (oz + o.cz + R) * S; y++) for (let x = Math.floor((ox + o.cx - R) * S); x <= (ox + o.cx + R) * S; x++) {
            const dx = x / S - ox - o.cx, dz = y / S - oz - o.cz; if (Math.abs(dx * co - dz * si) <= o.ex && Math.abs(dx * si + dz * co) <= o.ez) setze(x, y, c); } };
    let haeuser = 0, stuecke = 0;
    for (let k = -1; k <= 1; k++) for (let i = -1; i <= 1; i++) {
        const p = FC.exportSettlement({ kachel: { samen: 7, nH: STADT, i, k } }), ox = (i + 1) * M + M / 2, oz = (k + 1) * M + M / 2;
        for (const rd of p.roads || []) for (const q of rd.pts) scheibe(ox + q.x, oz + q.z, (rd.w || 3) / 2, rd.w >= 4.9 ? [226, 214, 188] : [196, 180, 150]);
        if (p.platz) kasten(p.platz, ox, oz, [214, 200, 170]);
        for (const q of p.slots) { haeuser++; kasten(q.obb, ox, oz, q.rolle === "kirche" ? [70, 70, 90] : [178, 96, 58]); }
        for (const s of (p.mauer || { segs: [] }).segs) { stuecke++; const n = Math.ceil(Math.hypot(s.x1 - s.x0, s.z1 - s.z0) * S); for (let u = 0; u <= n; u++) scheibe(ox + s.x0 + ((s.x1 - s.x0) * u) / n, oz + s.z0 + ((s.z1 - s.z0) * u) / n, 1.2, [60, 56, 52]); }
        for (const t of (p.mauer || { towers: [] }).towers) scheibe(ox + t.x, oz + t.z, 2.4, [40, 38, 36]);
    }
    const crcT = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
    const crc = (b) => { let c = 0xffffffff; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
    const st = (typ, d) => { const l = Buffer.alloc(4), k = Buffer.concat([Buffer.from(typ), d]), e = Buffer.alloc(4); l.writeUInt32BE(d.length); e.writeUInt32BE(crc(k)); return Buffer.concat([l, k, e]); };
    const kopf = Buffer.alloc(13); kopf.writeUInt32BE(PX, 0); kopf.writeUInt32BE(PX, 4); kopf.set([8, 6, 0, 0, 0], 8);
    const roh = Buffer.alloc(PX * (PX * 4 + 1)); for (let y = 0; y < PX; y++) buf.copy(roh, y * (PX * 4 + 1) + 1, y * PX * 4, (y + 1) * PX * 4);
    fs.writeFileSync(process.argv[2], Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), st("IHDR", kopf), st("IDAT", zlib.deflateSync(roh)), st("IEND", Buffer.alloc(0))]));
    console.log("     BILD " + process.argv[2] + ": 3 × 3 Kacheln der Stadt 7 " + STADT + ", " + haeuser + " Häuser, " + stuecke + " Mauer-Stücke");
}
process.exitCode = rot ? 1 : 0;
// DIE HÖHE DES TORS IST EINE FUNKTION DES TOR-PUNKTS: an 10⁴ Toren liest jede der beiden Kacheln (ihr Ursprung, ihr lokaler Punkt)
// am echten Grund dieselbe Höhe (auf 10⁻⁶ m gerundet, wie `ortPlan` sie pinnt)
{
    const L = GK.lageGrund(GK.LAGE_GRUND.seed, W.SimplexNoise), ctx = GK.ortCtx(L), r6 = (v) => Math.round(v * 1e6) / 1e6;
    let max = 0, n = 0, ungleich = 0;
    for (let q = 0; n < 10000; q++) {
        const ox = 856.4202446177895 + ((h32(q, 5) % 41) - 20) * M, oz = 439.4899739519243 + ((h32(q, 6) % 41) - 20) * M, ost = q % 2 === 0;
        const T = FC.kachelTore(7, ost ? 1 : 2, 0, 0);
        for (const t of T) {
            const a = ost ? ctx.hoeheAt(ox + M / 2, oz + t - M / 2) : ctx.hoeheAt(ox + t - M / 2, oz + M / 2);
            const b = ost ? ctx.hoeheAt(ox + M + -M / 2, oz + t - M / 2) : ctx.hoeheAt(ox + t - M / 2, oz + M + -M / 2);
            const d = Math.abs(r6(a) - r6(b));
            max = Math.max(max, d); if (d > 0) ungleich++; n++;
        }
    }
    zeile(max <= 1e-6, "HÖHE AM TOR: " + n + " Tore am echten Grund, aus beiden Kacheln gelesen: größter Unterschied " + max.toExponential(1) + " m (" + ungleich + " ungleich nach der Rundung)");
    process.exitCode = rot ? 1 : 0;
}
