// spike.cjs [variante] — SPIKE „Stadt als Netz“ (Koordinator 15.11. 03:05), im Baum mit dem Kratz-Haken `dp.netz` in fachwerk-core:
// das Viertel ist eine KACHEL (M × M), ihre Straßen verlassen sie durch TORE an den Kanten, die Tore kommen aus dem Samen der Kante.
//   (i)   NAHT   10⁴ zufällige Nachbar-Paare: die Tore der gemeinsamen Kante aus beiden Richtungen byte-gleich, Abstand 0,
//                die Straße quert die Kante senkrecht (Richtung beider Seiten gleich)
//   (ii)  DICHTE Häuser je Hektar im Streifen ± 30 m um die Kante gegen die Mitte der Kachel — flach und am echten Grund
//                (gelaende-core `lageGrund` der Welt-Saat am Anker von stadt-voll), dazu der Verlust der Lose am Grund
//   (iii) PREIS  Stufe 1 (Tore, Straßen, Blöcke) je Kachel in ms; Stufe 2 (Lose und Häuser: der Export) je Kachel und je Block
// Variante: `dicht` (Vorgabe: die Kachel zählt als Stadt der Grammatik ohne Mauer) · `mauer` (mit dem Ring der Mauer um die Kachel)
"use strict";
const path = require("path"), crypto = require("crypto");
const BAUM = process.cwd();
const { ctx: W } = require(path.join(BAUM, "scripts/lib/stamm.cjs")).ladeKlasse(BAUM);
// der Kern des Exports im Prozess selbst (wie die Kurve der Abgabe b0f25c2d maß: der vm-Scope der Klasse rechnet 3–4× langsamer),
// das Gelände aus dem Scope der Klasse (dort wohnt der Rausch-Bau)
const FC = require(path.join(BAUM, "scripts/lib/welt-boot.cjs")).studioKern("fachwerk-core.js", "__fachwerkCore"), GK = W.__gelaendeCore;
const VAR = process.argv[2] || "dicht";
const M = Number(process.env.NETZ_M) || 256, DS = 3, NT = Number(process.env.NETZ_TORE) || 5, NH = Number(process.env.NETZ_NH) || 260;
const ms = (f) => { const t = process.hrtime.bigint(); const r = f(); return [Number(process.hrtime.bigint() - t) / 1e6, r]; };
const sha = (o) => crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex").slice(0, 16);
// ── das Gesetz der Kachel (Kandidat für den Kern) ────────────────────────────────────────────────
const mix = (x) => { x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0; x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0; return (x ^ (x >>> 16)) >>> 0; };
const h32 = (...a) => { let h = 0x9e3779b9; for (const v of a) h = mix((h ^ (v | 0)) >>> 0); return h; };
const u01 = (...a) => h32(...a) / 4294967296;
// die Tore einer Kante: der Schlüssel ist die KANTE (achse 1 = senkrecht bei x = kx·M, 2 = waagrecht bei z = kz·M) — je Tor sein
// Ort längs der Kante (m ab ihrem Anfang), geschichtet mit Spiel; die Klasse der Straße (haupt) trägt ihre REIHE (unten)
const tore = (samen, achse, kx, kz) => { const t = []; for (let j = 0; j < NT; j++) t.push(((j + 0.3 + 0.4 * u01(samen, achse, kx, kz, j)) * M) / NT); return t; };
// die Straße j einer Reihe ist Hauptstraße über ALLE Kacheln der Reihe (Ost–West: Reihe iz, Nord–Süd: Spalte ix)
const haupt = (samen, achse, reihe, j) => h32(samen, 7 + achse, reihe) % NT === j;
const glatt = (t) => t * t * (3 - 2 * t);
// STUFE 1: Tore, Straßen, Kreuzungen, Blöcke der Kachel (ix, iz) — lokal um ihre Mitte; der Graph in der Form des `strassengraph`
function kachelNetz(samen, ix, iz) {
    const h = M / 2, zW = tore(samen, 1, ix, iz), zE = tore(samen, 1, ix + 1, iz), xN = tore(samen, 2, ix, iz), xS = tore(samen, 2, ix, iz + 1);
    const Z = (j, x) => zW[j] - h + (zE[j] - zW[j]) * glatt((x + h) / M), X = (i, z) => xN[i] - h + (xS[i] - xN[i]) * glatt((z + h) / M);
    // die Kreuzung der Straße Ost–West j mit der Straße Nord–Süd i
    const kr = [];
    for (let j = 0; j < NT; j++) { kr.push([]); for (let i = 0; i < NT; i++) { let x = xN[i] - h, z = Z(j, x); for (let q = 0; q < 4; q++) { x = X(i, z); z = Z(j, x); } kr[j].push({ x, z }); } }
    // Knoten 0: die Kreuzung der Hauptstraßen (sonst die mittlere)
    const j0 = [...Array(NT).keys()].find((j) => haupt(samen, 1, iz, j)) ?? (NT >> 1), i0 = [...Array(NT).keys()].find((i) => haupt(samen, 2, ix, i)) ?? (NT >> 1);
    const nodes = [kr[j0][i0]], id = new Map([[j0 + "," + i0, 0]]);
    const knoten = (j, i) => { const k = j + "," + i; if (!id.has(k)) { id.set(k, nodes.length); nodes.push(kr[j][i]); } return id.get(k); };
    const rand = (p) => { nodes.push(p); return nodes.length - 1; };
    const edges = [], gates = [];
    const stueck = (a, b, A, B, f, gen) => {   // die Punkte von A nach B längs der Kurve f(u) (u der Parameter der Achse), je ~DS
        const n = Math.max(2, Math.round(Math.hypot(B.x - A.x, B.z - A.z) / DS)), pts = [];
        for (let k = 0; k <= n; k++) pts.push(f(k / n));
        for (let k = 0; k <= n; k++) { const p = pts[Math.min(n - 1, k)], q = pts[Math.min(n, Math.min(n - 1, k) + 1)]; pts[k].th = Math.atan2(q.z - p.z, q.x - p.x); }
        edges.push({ a, b, pts, w: gen === 0 ? 5.0 : gen === 1 ? 3.9 : 3.2, gen, len: (n) * DS });
    };
    for (let j = 0; j < NT; j++) {
        const gen = haupt(samen, 1, iz, j) ? 0 : 1, P = [{ x: -h, z: zW[j] - h }, ...kr[j], { x: h, z: zE[j] - h }], K = [rand(P[0]), ...kr[j].map((_, i) => knoten(j, i)), rand(P[P.length - 1])];
        for (let s = 0; s + 1 < P.length; s++) stueck(K[s], K[s + 1], P[s], P[s + 1], (t) => { const x = P[s].x + (P[s + 1].x - P[s].x) * t; return { x, z: Z(j, x) }; }, gen);
        gates.push({ th: Math.PI }, { th: 0 });
    }
    for (let i = 0; i < NT; i++) {
        const gen = haupt(samen, 2, ix, i) ? 0 : 1, P = [{ x: xN[i] - h, z: -h }, ...kr.map((r) => r[i]), { x: xS[i] - h, z: h }], K = [rand(P[0]), ...kr.map((_, j) => knoten(j, i)), rand(P[P.length - 1])];
        for (let s = 0; s + 1 < P.length; s++) stueck(K[s], K[s + 1], P[s], P[s + 1], (t) => { const z = P[s].z + (P[s + 1].z - P[s].z) * t; return { x: X(i, z), z }; }, gen);
    }
    // die Blöcke: je Masche des Gitters ihre vier Ecken (am Rand die Kante der Kachel)
    const bloecke = [];
    for (let j = -1; j < NT; j++) for (let i = -1; i < NT; i++) {
        const e = (jj, ii) => (jj < 0 || jj >= NT || ii < 0 || ii >= NT ? { x: ii < 0 ? -h : ii >= NT ? h : kr[Math.max(0, Math.min(NT - 1, jj))][ii].x, z: jj < 0 ? -h : jj >= NT ? h : kr[jj][Math.max(0, Math.min(NT - 1, ii))].z } : kr[jj][ii]);
        bloecke.push([e(j, i), e(j, i + 1), e(j + 1, i + 1), e(j + 1, i)].map((p) => [+p.x.toFixed(2), +p.z.toFixed(2)]));
    }
    return { nodes, edges, gates, bloecke, tore: { w: zW, o: zE, n: xN, s: xS } };
}
// das Wort der Kachel: ihr Same aus (samen, ix, iz), das Erbe des Kerns
const kachelWort = (samen, ix, iz) => ({ seed: 1 + (h32(samen, 31, ix, iz) % 1000000), nH: NH });
// ── (i) NAHT ─────────────────────────────────────────────────────────────────────────────────────
{
    let rot = 0, maxD = 0, maxW = 0, n = 0;
    const [t] = ms(() => {
        for (let q = 0; q < 10000; q++) {
            const samen = h32(q, 1) % 100000, ix = (h32(q, 2) % 2001) - 1000, iz = (h32(q, 3) % 2001) - 1000, ost = q % 2 === 0;
            const A = kachelNetz(samen, ix, iz), B = ost ? kachelNetz(samen, ix + 1, iz) : kachelNetz(samen, ix, iz + 1);
            const a = ost ? A.tore.o : A.tore.s, b = ost ? B.tore.w : B.tore.n;
            if (JSON.stringify(a) !== JSON.stringify(b)) rot++;
            for (let j = 0; j < NT; j++) maxD = Math.max(maxD, Math.abs(a[j] - b[j]));
            // die Richtung der Straße an der Kante: das letzte Stück in A und das erste in B
            const eA = A.edges.filter((e) => { const p = e.pts[e.pts.length - 1]; return ost ? Math.abs(p.x - M / 2) < 1e-6 : Math.abs(p.z - M / 2) < 1e-6; });
            const eB = B.edges.filter((e) => { const p = e.pts[0]; return ost ? Math.abs(p.x + M / 2) < 1e-6 : Math.abs(p.z + M / 2) < 1e-6; });
            if (eA.length !== NT || eB.length !== NT) rot++;
            for (let j = 0; j < Math.min(eA.length, eB.length); j++) {
                const pa = eA[j].pts, pb = eB[j].pts, soll = ost ? 0 : Math.PI / 2;
                const wA = Math.atan2(pa[pa.length - 1].z - pa[pa.length - 2].z, pa[pa.length - 1].x - pa[pa.length - 2].x), wB = Math.atan2(pb[1].z - pb[0].z, pb[1].x - pb[0].x);
                maxW = Math.max(maxW, Math.abs(wA - soll), Math.abs(wB - soll));
            }
            n++;
        }
    });
    console.log((rot ? "ROT  " : "GRÜN ") + "(i) NAHT: " + n + " Nachbar-Paare, " + rot + " ungleich · größter Abstand der Tore " + maxD + " m · größte Abweichung der Straße von der Senkrechten an der Kante " + ((maxW * 180) / Math.PI).toFixed(2) + "° · " + ((1000 * t) / (2 * n)).toFixed(0) + " µs je Kachel (Stufe 1 in der Schleife)");
}
// ── (iii) PREIS Stufe 1 ──────────────────────────────────────────────────────────────────────────
{
    for (let k = 0; k < 200; k++) kachelNetz(7, k, 3);
    const [t, N] = ms(() => { let x; for (let k = 0; k < 2000; k++) x = kachelNetz(7, k, -k); return x; });
    const a = sha(kachelNetz(7, 3, -2)), b = (kachelNetz(7, 99, 4), sha(kachelNetz(7, 3, -2)));
    console.log("     (iii) STUFE 1: " + (t / 2000).toFixed(3) + " ms je Kachel (" + M + " m, " + NT + " Tore je Kante: " + N.nodes.length + " Knoten, " + N.edges.length + " Strecken, " + N.bloecke.length + " Blöcke, " + (JSON.stringify(N).length / 1024).toFixed(0) + " KB mit allen Punkten) · byte-stabil " + (a === b));
}
// ── STUFE 2: der Export der Kachel auf ihrem Netz ────────────────────────────────────────────────
const aussen = (() => { const d = 400, h = M / 2; return [[-h - d, 0, d, h + 2 * d], [h + d, 0, d, h + 2 * d], [0, -h - d, h, d], [0, h + d, h, d]].map(([cx, cz, ex, ez]) => ({ cx, cz, phi: 0, ex, ez })); })();
function stufe2(samen, ix, iz, hoehe) {
    const N = kachelNetz(samen, ix, iz), w = kachelWort(samen, ix, iz);
    const netz = { nodes: N.nodes, edges: N.edges, gates: N.gates, belegt: aussen, mauerR: VAR === "mauer" ? M * 0.7 : 0, kernel: VAR === "markt" ? undefined : "kreuzung" };
    const p = FC.exportSettlement({ seed: w.seed, nH: w.nH, netz, erbe: { region: "mitteleuropa", jahr: 1560, spanne: 140 }, hoehe });
    return { p, N };
}
const drin = (q, rand = 0) => { const o = q.obb, r = Math.abs(Math.cos(o.phi)) * o.ex + Math.abs(Math.sin(o.phi)) * o.ez, s = Math.abs(Math.sin(o.phi)) * o.ex + Math.abs(Math.cos(o.phi)) * o.ez; return Math.abs(o.cx) + r <= M / 2 + rand && Math.abs(o.cz) + s <= M / 2 + rand; };
const dichte = (liste, x0, x1, z0, z1) => (liste.filter((q) => q.x >= x0 && q.x < x1 && q.z >= z0 && q.z < z1).length * 10000) / ((x1 - x0) * (z1 - z0));
function paar(name, grund) {
    // zwei Nachbar-Kacheln (0,0) und (1,0): die Häuser in Welt-Koordinaten (die Mitte von (0,0) im Ursprung)
    const je = [], alle = [];
    for (const ix of [0, 1]) {
        const [t, e] = ms(() => stufe2(7, ix, 0, grund ? grund(ix) : undefined));
        const v2 = grund ? FC.ortPlan(e.p, { x: grund.ort.x + ix * M, z: grund.ort.z }, grund.ctx) : null;
        const slots = (v2 ? v2.slots : e.p.slots), innen = slots.filter((q) => drin(q, 0.01));
        for (const q of innen) alle.push({ x: q.obb.cx + ix * M, z: q.obb.cz, o: Object.assign({}, q.obb, { cx: q.obb.cx + ix * M }) });
        je.push({ ms: t, lose: e.p.slots.length, amGrund: slots.length, innen: innen.length, bloecke: e.N.bloecke.length, kb: JSON.stringify(e.p).length / 1024, groesse: e.p.groesse, mauer: !!e.p.mauer });
    }
    const h = M / 2, mitte = (dichte(alle, -60, 60, -60, 60) + dichte(alle, M - 60, M + 60, -60, 60)) / 2, naht = dichte(alle, h - 30, h + 30, -h, h), ganz = dichte(alle, -h, h + M, -h, h);
    // Überdeckung über die Naht: Paare von Grundrissen beider Kacheln, die sich berühren
    let ueber = 0;
    const A = alle.filter((q) => q.x < h && q.x > h - 40), B = alle.filter((q) => q.x >= h && q.x < h + 40);
    for (const a of A) for (const b of B) if (FC.obbSep(a.o, b.o) < 0) ueber++;
    console.log((naht >= 0.8 * mitte ? "GRÜN " : "ROT  ") + "(ii) DICHTE " + name + ": Naht ± 30 m " + naht.toFixed(1) + " Häuser/ha · Mitte " + mitte.toFixed(1) + " · Verhältnis " + (naht / mitte).toFixed(2) + " (Soll ≥ 0,8) · ganze Kachel " + ganz.toFixed(1) + "/ha · Überdeckung über die Naht " + ueber);
    for (const [i, k] of je.entries()) console.log("       Kachel (" + i + ",0): verlangt " + NH + " · Lose " + k.lose + (grund ? " · am Grund " + k.amGrund : "") + " · in der Kachel " + k.innen + " · " + k.groesse + (k.mauer ? " mit Mauer" : "") + " · Stufe 2 " + k.ms.toFixed(0) + " ms = " + (k.ms / k.bloecke).toFixed(0) + " ms je Block (" + k.bloecke + " Blöcke) · Plan " + k.kb.toFixed(0) + " KB");
    return je;
}
paar("flach (" + VAR + ")", null);
// ── der echte Grund: die Lage der Welt-Saat am Anker von stadt-voll ──────────────────────────────
{
    const L = GK.lageGrund(GK.LAGE_GRUND.seed, W.SimplexNoise), ort = { x: 856.4202446177895, z: 439.4899739519243 };
    const grund = (ix) => GK.hoehenRaster(L, ort.x + ix * M, ort.z, FC.trasseRahmen(NH));
    grund.ort = ort; grund.ctx = GK.ortCtx(L);
    // heute: das Wort der Wand am selben Ort (im Spiel 357 Lose von 490)
    const [t, heute] = ms(() => FC.exportSettlement({ seed: 7, nH: 500, hoehe: GK.hoehenRaster(L, ort.x, ort.z, FC.trasseRahmen(500)) }));
    const v2 = FC.ortPlan(heute, ort, GK.ortCtx(L));
    console.log("     HEUTE am echten Grund (dorf 7 500 am Anker von stadt-voll, ohne das Wasser-Raster): Lose " + heute.slots.length + " · am Grund " + v2.slots.length + " · Export " + t.toFixed(0) + " ms");
    paar("am echten Grund (" + VAR + ")", grund);
}
// ── das BILD (NETZ_BILD=<datei.png>): 2 × 2 Kacheln von oben, 2 px je m — Straßen, Grundrisse, die Kanten der Kacheln ───────────
if (process.env.NETZ_BILD) {
    const zlib = require("zlib"), fs = require("fs"), S = 2, K = 2, PX = K * M * S, buf = Buffer.alloc(PX * PX * 4);
    const setze = (x, y, c) => { if (x < 0 || y < 0 || x >= PX || y >= PX) return; const i = (y * PX + x) * 4; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255; };
    for (let i = 0; i < PX * PX; i++) buf.set([122, 148, 92, 255], i * 4);
    const scheibe = (wx, wz, r, c) => { const cx = wx * S, cy = wz * S, R = r * S; for (let y = Math.floor(cy - R); y <= cy + R; y++) for (let x = Math.floor(cx - R); x <= cx + R; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= R * R) setze(x, y, c); };
    const kasten = (o, ox, oz, c) => { const co = Math.cos(o.phi), si = Math.sin(o.phi), R = Math.hypot(o.ex, o.ez);
        for (let y = Math.floor((oz + o.cz - R) * S); y <= (oz + o.cz + R) * S; y++) for (let x = Math.floor((ox + o.cx - R) * S); x <= (ox + o.cx + R) * S; x++) {
            const dx = x / S - ox - o.cx, dz = y / S - oz - o.cz; if (Math.abs(dx * co - dz * si) <= o.ex && Math.abs(dx * si + dz * co) <= o.ez) setze(x, y, c); } };
    let haeuser = 0;
    for (let iz = 0; iz < K; iz++) for (let ix = 0; ix < K; ix++) {
        const { p } = stufe2(7, ix, iz), ox = ix * M + M / 2, oz = iz * M + M / 2;
        for (const rd of p.roads || []) for (const q of rd.pts) scheibe(ox + q.x, oz + q.z, (rd.w || 3) / 2, rd.w >= 4.9 ? [226, 214, 188] : [196, 180, 150]);
        if (p.platz) kasten(p.platz, ox, oz, [214, 200, 170]);
        for (const q of p.slots) if (drin(q, 0.01)) { haeuser++; kasten(q.obb, ox, oz, q.rolle === "kirche" ? [70, 70, 90] : q.baujahr > 1700 ? [150, 84, 60] : [178, 96, 58]); }
        for (let t = 0; t < M * S; t += 6) { setze(ix * M * S, iz * M * S + t, [30, 30, 30]); setze(ix * M * S + t, iz * M * S, [30, 30, 30]); }
    }
    const crcT = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
    const crc = (b) => { let c = 0xffffffff; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
    const stueck = (typ, d) => { const l = Buffer.alloc(4), k = Buffer.concat([Buffer.from(typ), d]), e = Buffer.alloc(4); l.writeUInt32BE(d.length); e.writeUInt32BE(crc(k)); return Buffer.concat([l, k, e]); };
    const kopf = Buffer.alloc(13); kopf.writeUInt32BE(PX, 0); kopf.writeUInt32BE(PX, 4); kopf.set([8, 6, 0, 0, 0], 8);
    const roh = Buffer.alloc(PX * (PX * 4 + 1)); for (let y = 0; y < PX; y++) buf.copy(roh, y * (PX * 4 + 1) + 1, y * PX * 4, (y + 1) * PX * 4);
    fs.writeFileSync(process.env.NETZ_BILD, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), stueck("IHDR", kopf), stueck("IDAT", zlib.deflateSync(roh)), stueck("IEND", Buffer.alloc(0))]));
    console.log("     BILD " + process.env.NETZ_BILD + ": " + K + " × " + K + " Kacheln, " + haeuser + " Häuser, " + PX + " px");
}
// ── der Plan am Ort (ortPlan, flacher Grund) auf dem Netz der Kachel: Zeit, Kreuzungen, Enden, Wenden ────────────────────────────
{
    const ctx = { hoeheAt: () => 10, flaeche: () => () => 10, wasserAt: () => false };
    const { p } = stufe2(7, 0, 0);
    const [t, v2] = ms(() => FC.ortPlan(p, { x: 0, z: 0 }, ctx));
    const vk = v2 && (v2.verkehr || (v2.plan && v2.plan.verkehr)), K = vk && vk.kreuzungen ? vk.kreuzungen : [];
    const rand = K.filter((k) => k.ende && Math.max(Math.abs(k.x), Math.abs(k.z)) > M / 2 - 2).length;
    console.log("     ORTPLAN der Kachel (flach): " + t.toFixed(0) + " ms · Slots " + (v2 ? v2.slots.length : "?") + " · Kreuzungen " + K.length + " · Enden " + K.filter((k) => k.ende).length + " (davon an der Kante der Kachel " + rand + ") · Wenden " + K.reduce((a, k) => a + ((k.wenden || []).length), 0) + " · Strecken " + (vk && vk.strecken ? vk.strecken.length : "?") + " · Plan v2 " + (JSON.stringify(v2).length / 1024).toFixed(0) + " KB");
}
