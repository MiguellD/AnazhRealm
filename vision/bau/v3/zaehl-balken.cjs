// zaehl-balken.cjs — BAU-ZENSUS Runde 3, ZAHL 1: die Balkenlinien des HEUTIGEN HAUS (Kern, kein Prototyp), gezählt am gebauten Mesh.
//
// Aufruf:  node zaehl-balken.cjs                 (Kern aus dem Lese-Baum, LESEBAUM=…/n1011-hg)
//          KERN_DIR=…/bau-spike3/kern node zaehl-balken.cjs   (byte-gleiche Kopie; die SHA-256 beider wird gedruckt und verglichen)
//          ZAEHL_JSON=pfad.json → schreibt die Zeilen je Haus/Linie dorthin (sonst nichts geschrieben)
//
// DIE DEFINITION (zensus-haus-tragwerk.md §b):
//   Balkenlinie = ein liegendes Holz-Glied, das eine Last quer zu seiner Länge trägt: jedes Deckenbalken-STÜCK (Mesh in
//     subsystems.geruest mit Querschnitt P.balkenB × P.balkenH, lang in z; FC:466–470), jeder Sparren und die Firstpfette
//     (subsystems.dachwerk, FC:773–794), jeder Kehlbalken, auf dem ein Firststuhl-Stiel steht (FC:786–794).
//   Auflager = ein Glied, das im GEBAUTEN Haus unter der Linie liegt und selbst trägt: Rähm/Schwelle der Außenwand (FC:455–457; bei
//     der glatten Wand GLATT die Wand selbst, FC:207/471–472) an z = ±(D/2 − 0,02), Fuß- und Firstpfette (FC:776–777), Firststuhl-Stiel
//     (FC:794), Giebelwand am Ende der Firstpfette. KEIN Auflager: die Lehm-Gefach-Innenwand (FC:897–917, Rolle 'gefach', ohne Rähm,
//     ohne Ständer) und der Rand des Treppenlochs (FC:469 schneidet den Balken, ein Wechsel wird nicht gebaut).
//   Spannweite = LICHTER Abstand zweier benachbarter Auflager unter derselben Linie (Kante zu Kante). Ein Stück mit nur einem
//     Auflager ist ein KRAGARM (freies Ende); es wird mit seiner Länge gezählt, nicht als Spannweite.
//   Lesart B (nur als Gegenprobe gedruckt): dazu trägt jede Innenwand-Box, die unter dem Balken liegt (Mesh in subsystems.innenwaende).
//
// Statik (entwurf-stoff-statik.md §1.1, Formel wie gesetz-proto.cjs:76–82 `balkenSpann`, hier ausgeschrieben):
//   Decke g 1,5 + q 2,0 kN/m², Einzugsbreite e = halber Abstand zu den Nachbar-Balken der Lage (aus den Mesh-Lagen x);
//   Dach: Deckung 0,75 kN/m² Dachfläche (Ziegel), s_k 1,51 kN/m² (Heimat), μ₁(α) EN 1991-1-3 — je Grundriss-Projektion.
//   η = max( w_inst/(l/300), w_fin/(l/250), σ_d/f_m,d ). Holz: Eiche D30 (f_m,k 30) und Nadel C24 (24), E 11 000 MPa.
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { pathToFileURL } = require("url");

const LESEBAUM = process.env.LESEBAUM || "C:/Users/micha/Desktop/AnazhRealm-OMEN/n1011-hg";
const KERN_DIR = process.env.KERN_DIR || null;
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

async function laden() {
    const fcOrig = path.join(LESEBAUM, "fachwerk-core.js");
    const fc = KERN_DIR ? path.join(KERN_DIR, "fachwerk-core.js") : fcOrig;
    const three = KERN_DIR ? path.join(KERN_DIR, "three.module.min.js") : path.join(LESEBAUM, "vendor", "three.module.min.js");
    const sO = sha(fcOrig), sK = sha(fc);
    console.log(`Kern: ${fc}\n  SHA-256 ${sK}\n  Original ${fcOrig}\n  SHA-256 ${sO} → ${sO === sK ? "BYTE-GLEICH" : "VERSCHIEDEN"}`);
    if (sO !== sK) throw new Error("zaehl-balken: der Kern ist nicht byte-gleich dem Original");
    const w = process.emitWarning; process.emitWarning = () => {};
    const T = await import(pathToFileURL(three).href); process.emitWarning = w;
    T.ColorManagement.enabled = false; global.THREE = { ...T };
    require(fc);
    return { FC: globalThis.__fachwerkCore, THREE: global.THREE };
}

// ── Statik ─────────────────────────────────────────────────────────────────────────────────────
const ST = { kmod: 0.8, gammaM: 1.3, kdef: 0.6, psi2: 0.3, gammaG: 1.35, gammaQ: 1.5, wInst: 300, wFin: 250, E: 11000e6 };
const FMK = { eiche: 30e6, nadel: 24e6 };
const GDECKE = 1.5, QDECKE = 2.0, GDACH = 0.75, SK = 1.51;
const mu1 = (a) => (a <= 30 ? 0.8 : a >= 60 ? 0 : (0.8 * (60 - a)) / 30);
// Gleichlast g, q [kN/m²] auf Einzugsbreite e [m], Rechteck b × h, Feld l [m] → η (Feld, beidseitig gelenkig)
function etaFeld(l, b, h, e, g, q, holz) {
    const I = (b * h ** 3) / 12, W = (b * h * h) / 6, EI = ST.E * I;
    const wi = (g + q) * 1e3 * e, wf = (g * (1 + ST.kdef) + q * (1 + ST.psi2 * ST.kdef)) * 1e3 * e, wd = (ST.gammaG * g + ST.gammaQ * q) * 1e3 * e;
    const dI = (5 * wi * l ** 4) / (384 * EI), dF = (5 * wf * l ** 4) / (384 * EI), sig = (wd * l * l) / 8 / W, fmd = (ST.kmod * FMK[holz]) / ST.gammaM;
    return Math.max(dI / (l / ST.wInst), dF / (l / ST.wFin), sig / fmd);
}
// Einzellast in Feldmitte P [kN] (Kehlbalken unter dem Stiel)
function etaPunkt(l, b, h, Pk, Pq, holz) {
    const I = (b * h ** 3) / 12, W = (b * h * h) / 6, EI = ST.E * I;
    const pi = (Pk + Pq) * 1e3, pf = (Pk * (1 + ST.kdef) + Pq * (1 + ST.psi2 * ST.kdef)) * 1e3, pd = (ST.gammaG * Pk + ST.gammaQ * Pq) * 1e3;
    const dI = (pi * l ** 3) / (48 * EI), dF = (pf * l ** 3) / (48 * EI), sig = (pd * l) / 4 / W, fmd = (ST.kmod * FMK[holz]) / ST.gammaM;
    return Math.max(dI / (l / ST.wInst), dF / (l / ST.wFin), sig / fmd);
}
// L_max: das l mit η = 1 (Bisektion; η wächst streng in l)
function lmax(b, h, e, g, q, holz) { let lo = 0.1, hi = 30; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (etaFeld(m, b, h, e, g, q, holz) > 1) hi = m; else lo = m; } return lo; }
const kreuzholz = (d) => ({ b: d / Math.sqrt(3), h: d * Math.sqrt(2 / 3) });

// ── Mesh-Leser ─────────────────────────────────────────────────────────────────────────────────
function boxen(group, THREE) {
    group.updateMatrixWorld(true);
    const out = [];
    group.traverse((m) => {
        if (!m.isMesh || !m.geometry) return;
        const B = new THREE.Box3().setFromObject(m), s = new THREE.Vector3(), c = new THREE.Vector3();
        B.getSize(s); B.getCenter(c);
        out.push({ x0: B.min.x, x1: B.max.x, y0: B.min.y, y1: B.max.y, z0: B.min.z, z1: B.max.z, sx: s.x, sy: s.y, sz: s.z, cx: c.x, cy: c.y, cz: c.z, box: m.geometry.type === "BoxGeometry", rot: !!(m.rotation && (m.rotation.x || m.rotation.y || m.rotation.z)) || (m.quaternion && Math.abs(m.quaternion.w) < 0.999999) });
    });
    return out;
}
const nah = (a, b, t) => Math.abs(a - b) <= t;

// Auflager-Intervalle [a,b] entlang z → Felder (lichte Spannweiten) und Kragarme eines Stücks [z0,z1]
function felder(z0, z1, auflager) {
    const I = auflager.map(([a, b]) => [Math.max(z0, a), Math.min(z1, b)]).filter(([a, b]) => b >= a - 1e-9).sort((p, q) => p[0] - q[0]);
    const M = []; for (const iv of I) { if (M.length && iv[0] <= M[M.length - 1][1] + 1e-6) M[M.length - 1][1] = Math.max(M[M.length - 1][1], iv[1]); else M.push(iv.slice()); }
    const f = [], k = [];
    if (!M.length) { k.push(z1 - z0); return { f, k, n: 0 }; }
    if (M[0][0] > z0 + 0.03) k.push(M[0][0] - z0);
    for (let i = 1; i < M.length; i++) f.push(M[i][0] - M[i - 1][1]);
    if (M[M.length - 1][1] < z1 - 0.03) k.push(z1 - M[M.length - 1][1]);
    return { f, k, n: M.length };
}

function nurNur(keys, an) { const o = {}; for (const k of keys) o[k] = an.includes(k); return o; }
const SUBS = ["fundament", "gelaende", "geruest", "riegel", "streben", "zimmermann", "gefache", "giebel", "dachwerk", "dachdeckung", "boeden", "innenwaende", "herd", "treppe", "tueren", "fenster", "moebel", "anbau", "fluegel", "balkon", "kuppel", "portikus", "hof", "dachAlt", "arkade", "turm", "zinnen", "veranda", "vorkragung", "pilotis", "terrasse", "rundbau"]; // FC:1765–1768

// EIN Haus → seine Linien
function liniendesHauses(FC, THREE, hp, LM, nachBau) {
    const P = Object.assign({}, hp, { nur: nurNur(SUBS, ["geruest", "innenwaende", "dachwerk"]) });
    const H = FC.HAUS(THREE, FC.mat, P), d = H.dims, PP = H.P;
    if (nachBau) nachBau(H, THREE);
    const bB = PP.balkenB, bH = PP.balkenH, st = d.storeys, D = d.D, W = d.W;
    const tops = d.levelsY.map((y, k) => (k + 1 < d.levelsY.length ? d.levelsY[k + 1] : d.eaveY));
    const G = boxen(H.subsystems.geruest, THREE), IW = boxen(H.subsystems.innenwaende, THREE), DW = boxen(H.subsystems.dachwerk, THREE);
    const glatt = !G.some((b) => nah(b.sy, PP.raehm, 0.005) && nah(b.sz, PP.raehm, 0.005) && b.sx > 1); // kein Rähm gebaut = GLATT (FC:471)
    const zf = D / 2 - 0.02, ra = PP.raehm / 2;
    const linien = [];
    // (1) Decken
    const joists = G.filter((b) => nah(b.sx, bB, 0.006) && nah(b.sy, bH, 0.006) && b.sz > 0.06);
    const rahmFehlt = [];
    for (let k = 0; k < st; k++) {
        const L = joists.filter((j) => nah(j.y1, tops[k], 0.02));
        const xs = [...new Set(L.map((j) => +j.cx.toFixed(3)))].sort((a, b) => a - b);
        // Rähm der Außenwand an dieser Lage (FC:471 plateRing(L.top − raehm/2)) — bei GLATT trägt die Wand
        if (!glatt) for (const s of [1, -1]) if (!G.some((b) => b.sx > 1 && nah(b.cz, s * zf, 0.02) && nah(b.y1, tops[k], 0.02))) rahmFehlt.push(k + (s > 0 ? "+" : "-"));
        // Auflager aus dem MESH: jedes liegende Holz in subsystems.geruest quer zum Balken (lang in x), das unter ihm oder bündig mit ihm liegt —
        // heute nur das Rähm der Außenwand (FC:456); ein künftiger Unterzug oder Wechsel in derselben Gruppe wird ohne Umbau mitgezählt.
        // GLATT baut kein Rähm (FC:471–472): dort ist die Außenwand selbst das Auflager, an derselben Linie z = ±(D/2 − 0,02).
        const liegend = G.filter((b) => b.sx > 0.5 && b.sx > 3 * b.sz && b.sy <= 0.4);
        const wandG = glatt ? [[-zf - ra, -zf + ra], [zf - ra, zf + ra]] : [];
        const wandK = IW.filter((w) => w.sy > 1.0 && w.y0 < tops[k] - 0.5 && w.y1 > tops[k] - bH - 0.02 && w.y1 <= tops[k] + 0.01);
        const art = k === st - 1 ? "oberste" : k === 0 ? "eg" : "og";
        for (const j of L) {
            const i = xs.indexOf(+j.cx.toFixed(3)), xl = i > 0 ? xs[i - 1] : -W / 2, xr = i < xs.length - 1 ? xs[i + 1] : W / 2;
            const e = Math.max(0.05, (xr - xl) / 2);
            const aussen = wandG.concat(liegend.filter((b) => j.cx >= b.x0 - 1e-3 && j.cx <= b.x1 + 1e-3 && b.y1 > j.y0 - 0.25 && b.y0 < j.y1 - 0.01).map((b) => [b.z0, b.z1]));
            const A = felder(j.z0, j.z1, aussen);
            // Lesart B: Innenwand-Boxen unter dem Balken (quer: Box überdeckt x; längs: Box liegt unter der Balkenachse)
            const innen = wandK.filter((w) => j.cx >= w.x0 - 1e-3 && j.cx <= w.x1 + 1e-3).map((w) => [w.z0, w.z1]);
            const B = felder(j.z0, j.z1, aussen.concat(innen));
            linien.push({ art, k, x: +j.cx.toFixed(3), z0: +j.z0.toFixed(3), z1: +j.z1.toFixed(3), b: bB, h: bH, e: +e.toFixed(3), lastG: GDECKE, lastQ: QDECKE, spann: A.f.length ? Math.max(...A.f) : 0, krag: A.k.length ? Math.max(...A.k) : 0, nAuf: A.n, spannB: B.f.length ? Math.max(...B.f) : 0, kragB: B.k.length ? Math.max(...B.k) : 0 });
        }
    }
    // (2) Dach (nur Sattel: dachwerk baut nur dort, FC:773)
    const alpha = Math.atan((d.ridgeY - d.eaveY) / (D / 2)) * 180 / Math.PI;
    const gD = GDACH / Math.cos((alpha * Math.PI) / 180), sD = mu1(alpha) * SK;
    const pf = DW.filter((b) => b.sx > 1 && nah(b.sy, PP.pfetteH, 0.01) && nah(b.sz, PP.pfetteB, 0.01) && nah(b.cz, 0, 0.02));
    const sparren = DW.filter((b) => nah(b.sx, PP.spar, 0.01) && b.sy >= 0.9 && b.sz > 0.5);
    const stiele = DW.filter((b) => nah(b.sx, 0.14, 0.005) && nah(b.sz, 0.16, 0.005) && b.sy > 0.25);
    const kehl = DW.filter((b) => nah(b.sx, PP.spar, 0.005) && b.sz > 0.5 && b.sy < 0.9);
    if (sparren.length) {
        // Sparren: Auflager Fußpfette (z = ±D/2, FC:777) und Firstpfette (z = 0, FC:776); lichte Weite horizontal D/2 − pfetteB, geneigt /cos α
        const nS = new Set(sparren.map((s) => +s.cx.toFixed(2))).size, e = W / Math.max(1, nS - 1);
        const lh = D / 2 - PP.pfetteB;
        for (const s of sparren) linien.push({ art: "dach-sparren", x: +s.cx.toFixed(3), b: PP.spar, h: PP.spar, e: +e.toFixed(3), lastG: gD, lastQ: sD, spann: lh / Math.cos((alpha * Math.PI) / 180), spannH: lh, krag: 0, nAuf: 2, spannB: lh / Math.cos((alpha * Math.PI) / 180), kragB: 0 });
    }
    for (const p of pf) {
        // Firstpfette: Auflager = Stiele unter ihr + die Enden (Giebelwand bzw. Grat, FC:791 „Giebelenden: dort trägt die Giebelwand“)
        const ends = [p.x0 + 0.1, p.x1 - 0.1], su = stiele.map((s) => [s.x0, s.x1]);
        const auf = [[ends[0] - 0.08, ends[0] + 0.08], [ends[1] - 0.08, ends[1] + 0.08]].concat(su);
        const F = felder(p.x0, p.x1, auf), eP = D / 2;
        linien.push({ art: "dach-firstpfette", b: PP.pfetteB, h: PP.pfetteH, e: eP, lastG: gD, lastQ: sD, spann: F.f.length ? Math.max(...F.f) : 0, krag: 0, nAuf: F.n, nStiele: stiele.length, spannB: F.f.length ? Math.max(...F.f) : 0, kragB: 0 });
        // Kehlbalken unter einem Stiel: Punktlast = Pfetten-Last über die halben Nachbarfelder (FC:788–794 Stiel steht AUF dem Kehlbalken)
        const sx = stiele.map((s) => s.cx).sort((a, b) => a - b), allS = [ends[0], ...sx, ends[1]];
        for (const s of stiele) {
            const kb = kehl.find((k2) => Math.abs(k2.cx - s.cx) < 0.06); if (!kb) continue;
            const i = allS.indexOf(s.cx), trib = (allS[i + 1] - allS[i - 1]) / 2;
            const lk = kb.sz - 2 * PP.spar; // lichte Weite zwischen den zwei Sparren, an denen er hängt
            linien.push({ art: "dach-kehlbalken", x: +s.cx.toFixed(3), b: PP.spar, h: 0.12, punkt: true, Pk: gD * eP * trib, Pq: sD * eP * trib, spann: lk, krag: 0, nAuf: 2, spannB: lk, kragB: 0 });
        }
    }
    for (const L of linien) {
        L.etaEiche = L.spann > 0 ? (L.punkt ? etaPunkt(L.spann, L.b, L.h, L.Pk, L.Pq, "eiche") : etaFeld(L.art === "dach-sparren" ? L.spannH : L.spann, L.b, L.h, L.e, L.lastG, L.lastQ, "eiche")) : 0;
        L.etaNadel = L.spann > 0 ? (L.punkt ? etaPunkt(L.spann, L.b, L.h, L.Pk, L.Pq, "nadel") : etaFeld(L.art === "dach-sparren" ? L.spannH : L.spann, L.b, L.h, L.e, L.lastG, L.lastQ, "nadel")) : 0;
        L.ueberEiche = L.spann > LM.eiche + 1e-9; L.ueberNadel = L.spann > LM.nadel + 1e-9;
        L.ueberEicheB = L.spannB > LM.eiche + 1e-9;
    }
    return { H, linien, glatt, rahmFehlt, roofCurve: hp.roofCurve || 0, D, W, st, nJoist: joists.length, alpha };
}

const q = (a, p) => { if (!a.length) return NaN; const s = a.slice().sort((x, y) => x - y); const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
const r2 = (v) => Math.round(v * 100) / 100;
const ARTEN = ["eg", "og", "oberste", "dach-sparren", "dach-firstpfette", "dach-kehlbalken"];

function zaehle(name, haeuser, LM) {
    const L = haeuser.flatMap((h) => h.linien.map((l) => Object.assign({ adr: h.adr }, l)));
    const istD = (l) => !l.art.startsWith("dach"), LD = L.filter(istD), LR = L.filter((l) => !istD(l));
    const hat = (f) => haeuser.filter((h) => h.linien.some(f)).length;
    const hU = haeuser.filter((h) => h.linien.some((l) => istD(l) && l.ueberEiche));
    console.log(`\n══ ${name}: ${haeuser.length} Häuser, ${L.length} Linien (Decken ${LD.length}, Dach ${LR.length})`);
    console.log(`  ZAHL (Decken, lichte Spannweite > L_max Eiche ${r2(LM.eiche)} m): ${hU.length} von ${haeuser.length} Häusern · ${LD.filter((l) => l.ueberEiche).length} von ${LD.length} Deckenbalken-Linien`);
    console.log(`        dasselbe mit L_max Nadel ${r2(LM.nadel)} m: Häuser ${hat((l) => istD(l) && l.ueberNadel)} · Linien ${LD.filter((l) => l.ueberNadel).length}`);
    console.log(`        Lesart B (Gefach-Innenwand trägt): Häuser ${hat((l) => istD(l) && l.ueberEicheB)} · Linien ${LD.filter((l) => l.ueberEicheB).length}`);
    console.log(`        η > 1 am GEBAUTEN Querschnitt 15×21 und gebauten Abstand: Decken Eiche D30 Häuser ${hat((l) => istD(l) && l.etaEiche > 1)} · Linien ${LD.filter((l) => l.etaEiche > 1).length}; Nadel C24 Häuser ${hat((l) => istD(l) && l.etaNadel > 1)} · Linien ${LD.filter((l) => l.etaNadel > 1).length}`);
    console.log(`  DACH (η > 1 am gebauten Glied, Eiche D30): Häuser ${hat((l) => !istD(l) && l.etaEiche > 1)} von ${hat((l) => !istD(l))} mit Dachwerk · Linien ${LR.filter((l) => l.etaEiche > 1).length} von ${LR.length}`);
    console.log(`  je Linien-Art: Linien gesamt · lichte Spann > L_max Eiche · Häuser damit · η>1 Eiche · Spann Q50/Q90/max · η Q50/Q90/max`);
    for (const a of ARTEN) {
        const A = L.filter((l) => l.art === a); if (!A.length) { console.log(`    ${a.padEnd(17)} 0`); continue; }
        const sp = A.map((l) => l.spann).filter((v) => v > 0), et = A.map((l) => l.etaEiche).filter((v) => v > 0);
        console.log(`    ${a.padEnd(17)} ${String(A.length).padStart(6)} · ${String(A.filter((l) => l.ueberEiche).length).padStart(6)} · ${String(new Set(A.filter((l) => l.ueberEiche).map((l) => l.adr)).size).padStart(4)} · ${String(A.filter((l) => l.etaEiche > 1).length).padStart(6)} · ${r2(q(sp, 0.5))}/${r2(q(sp, 0.9))}/${r2(Math.max(...sp, 0))} m · ${r2(q(et, 0.5))}/${r2(q(et, 0.9))}/${r2(Math.max(...et, 0))}`);
    }
    const U = LD.filter((l) => l.ueberEiche).map((l) => l.spann / LM.eiche);
    const bins = [[1, 1.25], [1.25, 1.5], [1.5, 2], [2, 99]].map(([a, b]) => `${a}–${b === 99 ? "∞" : b}: ${U.filter((u) => u > a && u <= b).length}`);
    console.log(`  Überschreitung (Decken) Spannweite/L_max Eiche: Q50 ${r2(q(U, 0.5))} · Q90 ${r2(q(U, 0.9))} · max ${r2(Math.max(...U, 0))} · ${bins.join(" · ")}`);
    const hEG = haeuser.filter((h) => h.st >= 2);
    console.log(`  Häuser je Decke über (Decken-Häuser): EG ${hat((l) => l.art === "eg" && l.ueberEiche)}/${hEG.length} · OG ${hat((l) => l.art === "og" && l.ueberEiche)}/${haeuser.filter((h) => h.st >= 3).length} · oberste ${hat((l) => l.art === "oberste" && l.ueberEiche)}/${haeuser.length}`);
    const KR = L.filter((l) => l.krag > 0.06);
    console.log(`  freie Enden (Stück am Treppenloch ohne Wechsel, FC:469): ${KR.length} Linien in ${new Set(KR.map((l) => l.adr)).size} Häusern, Kragarm Q50 ${r2(q(KR.map((l) => l.krag), 0.5))} / max ${r2(Math.max(...KR.map((l) => l.krag), 0))} m; ohne jedes Auflager ${L.filter((l) => l.nAuf === 0).length}`);
    const ohne = haeuser.filter((h) => !h.linien.some((l) => !l.art.startsWith("dach")));
    console.log(`  Häuser ohne Deckenbalken im Mesh: ${ohne.length}${ohne.length ? " (" + ohne.slice(0, 8).map((h) => h.adr + " " + h.hp.rolle + "/" + (h.hp.grundriss || "I")).join(", ") + ")" : ""} · GLATT (Wand statt Rähm) ${haeuser.filter((h) => h.glatt).length} · Rähm fehlt an einer Lage (nicht GLATT) ${haeuser.filter((h) => h.rahmFehlt.length).length} · roofCurve > 0 ${haeuser.filter((h) => h.roofCurve > 0).length}`);
    const Dg = haeuser.map((h) => h.D);
    console.log(`  Kontrolle D > L_max + 0,20 (lichte Weite = D − 2·0,02 − raehm): ${haeuser.filter((h) => h.D - 0.2 > LM.eiche).length} Häuser; D Q10/50/90 ${r2(q(Dg, 0.1))}/${r2(q(Dg, 0.5))}/${r2(q(Dg, 0.9))}`);
    return { haeuser: haeuser.length, ueber: hU.length, linien: LD.length, linienUeber: LD.filter((l) => l.ueberEiche).length };
}

(async () => {
    const t0 = Date.now();
    const { FC, THREE } = await laden();
    // L_max nachgerechnet (entwurf-stoff-statik.md:108 Eiche 4,59 · entwurf-grundriss-tragwerk.md:111 Nadel 0,30 5,62): Kreuzholz aus d, e 0,85
    const kE = kreuzholz(0.258), kN = kreuzholz(0.30);
    const LM = { eiche: lmax(kE.b, kE.h, 0.85, GDECKE, QDECKE, "eiche"), nadel: lmax(kN.b, kN.h, 0.85, GDECKE, QDECKE, "nadel") };
    console.log(`L_max nachgerechnet: Eiche d 0,258 (Kreuzholz ${r2(kE.b * 100)}×${r2(kE.h * 100)} cm, e 0,85) = ${LM.eiche.toFixed(3)} m · Nadel d 0,30 (${r2(kN.b * 100)}×${r2(kN.h * 100)} cm, e 0,85) = ${LM.nadel.toFixed(3)} m`);
    console.log(`  Spiel-Balken 15×21 bei e 1,70: L_max Eiche ${lmax(0.15, 0.21, 1.7, GDECKE, QDECKE, "eiche").toFixed(3)} · Nadel ${lmax(0.15, 0.21, 1.7, GDECKE, QDECKE, "nadel").toFixed(3)} m; bei e 0,85: ${lmax(0.15, 0.21, 0.85, GDECKE, QDECKE, "eiche").toFixed(3)} m`);
    // Selbsttest der Zählung: ein Feld 6 m ohne Mittel-Auflager ist ein Feld 6 m; mit Auflager in der Mitte zwei Felder; ein Stück ohne zweites Auflager ein Kragarm
    const s1 = felder(0, 6, [[-0.1, 0.1], [5.9, 6.1]]), s2 = felder(0, 6, [[-0.1, 0.1], [2.95, 3.05], [5.9, 6.1]]), s3 = felder(0, 3, [[-0.1, 0.1]]);
    const st = Math.abs(s1.f[0] - 5.8) < 1e-9 && s2.f.length === 2 && s3.f.length === 0 && Math.abs(s3.k[0] - 2.9) < 1e-9 && Math.abs(etaFeld(LM.eiche, kE.b, kE.h, 0.85, GDECKE, QDECKE, "eiche") - 1) < 1e-6;
    console.log(`Selbsttest felder/η: ${st ? "GRÜN" : "ROT"}`); if (!st) process.exit(2);

    // Gegenprobe „ohne Umbau“: ein Unterzug (liegendes Holz 0,16 × 0,20, lang in x, unter der EG-Decke bei z = 0) wird in
    // subsystems.geruest gelegt — der Leser muss ihn als Auflager finden und die größte EG-Spannweite halbieren (minus Unterzug).
    {
        const hp0 = FC.DORF({ seed: 1, nH: 90 }).houses.find((h) => h.storeys >= 2 && h.D > 6 && !(h.roofCurve > 0));
        const a = liniendesHauses(FC, THREE, hp0, LM);
        const b = liniendesHauses(FC, THREE, hp0, LM, (H, T) => { const y = H.dims.levelsY[1] - H.P.balkenH - 0.1; const m = new T.Mesh(new T.BoxGeometry(H.dims.W, 0.2, 0.16)); m.position.set(0, y, 0); H.subsystems.geruest.add(m); });
        const mx = (r) => Math.max(...r.linien.filter((l) => l.art === "eg").map((l) => l.spann));
        const ok = mx(b) < mx(a) / 2 && mx(b) > mx(a) / 2 - 0.2;
        console.log("Gegenprobe Unterzug (D " + hp0.D + "): größte EG-Spannweite " + r2(mx(a)) + " → " + r2(mx(b)) + " m · " + (ok ? "GRÜN" : "ROT"));
        if (!ok) process.exit(3);
    }
    const SB = require("../spike/gesetz-proto.cjs").SONDERBAU; // nur gelesen (die Menge der Rollen ohne Haushalt, pool.cjs:100)
    const plaene = {};
    const planVon = (key) => {
        if (plaene[key]) return plaene[key];
        let DP; const m = /^G(\d+)$/.exec(key), e = /^E-(.+)-(\d+)$/.exec(key), k = /^K(\d+)$/.exec(key);
        if (m) DP = { seed: +m[1], nH: 90 }; else if (e) DP = { seed: +e[2], epoche: e[1] }; else if (k) DP = { seed: +k[1], nH: 12 }; else throw new Error("Plan " + key);
        return (plaene[key] = FC.DORF(DP));
    };
    const rows = {};
    // (A) die 100 der Runde 1 (vision/bau/spike/pool.json `hundert`, gezogen von pool.cjs) — hp heute neu aus DORF, gegen den gespeicherten hp verglichen
    const POOL = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "spike", "pool.json"), "utf8")).hundert;
    let gleichHp = 0; const H100 = [];
    for (const z of POOL) {
        const hp = planVon(z.plan).houses[z.a];
        if (JSON.stringify(hp) === JSON.stringify(z.hp)) gleichHp++;
        const r = liniendesHauses(FC, THREE, hp, LM); H100.push(Object.assign(r, { adr: z.plan + "#" + z.a, hp }));
    }
    console.log(`\ndie 100 (pool.json): hp heute byte-gleich dem gespeicherten: ${gleichHp}/100`);
    rows.hundert = zaehle("DIE 100 DER RUNDE 1", H100, LM);
    // (B) die 2 595 Haushalts-Lose der 30 Pläne G (pool.cjs:94–100: Lose ohne Scheune, ohne SONDERBAU)
    const STADT = [];
    for (let s = 1; s <= 30; s++) {
        const pl = planVon("G" + s); let i = 0;
        pl.houses.forEach((hp, a) => { const losI = hp.rolle === "scheune" ? null : i++; if (losI == null || SB.has(hp.rolle)) return; const r = liniendesHauses(FC, THREE, hp, LM); STADT.push(Object.assign(r, { adr: "G" + s + "#" + a, hp })); });
    }
    if (STADT.length !== 2595) throw new Error("Lose " + STADT.length + " ≠ 2 595");
    rows.stadt = zaehle("DIE 2 595 LOSE (30 Pläne G, nH 90)", STADT, LM);
    // je Rolle / Geschosse in der Stadt
    const proRolle = {}; for (const h of STADT) { const k = h.hp.rolle; (proRolle[k] ||= [0, 0]); proRolle[k][0]++; if (h.linien.some((l) => l.ueberEiche && !l.art.startsWith("dach"))) proRolle[k][1]++; }
    console.log("  je Rolle (Decke über / alle): " + Object.entries(proRolle).sort((a, b) => b[1][0] - a[1][0]).map(([k, v]) => `${k} ${v[1]}/${v[0]}`).join(" · "));
    const proSt = {}; for (const h of STADT) { (proSt[h.st] ||= [0, 0]); proSt[h.st][0]++; if (h.linien.some((l) => l.ueberEiche && !l.art.startsWith("dach"))) proSt[h.st][1]++; }
    console.log("  Decke über L_max je Geschosszahl: " + Object.entries(proSt).map(([k, v]) => `st ${k}: ${v[1]}/${v[0]}`).join(" · "));
    const unter = STADT.filter((h) => !h.linien.some((l) => l.ueberEiche && !l.art.startsWith("dach")));
    console.log(`  Häuser mit allen Decken ≤ L_max: ${unter.length}; ihr D: ${[...new Set(unter.map((h) => h.D))].sort((a, b) => a - b).join(", ")} m`);

    // (C) die drei GRÜNEN der Runde 2 (pruefung-spike-v2.md:28–29): G5#62, G26#63, G5#29 — ihr hp und was die HAUS-Linse v2 an ihnen las
    const LI = require("../v2/spike/linse-v2.cjs");
    console.log("\n══ DIE DREI GRÜNEN der Runde 2 (D > L_max, HAUS-Linse grün)");
    for (const adr of ["G5#62", "G26#63", "G5#29"]) {
        const [p, a] = adr.split("#"), hp = planVon(p).houses[+a];
        const P = Object.assign({}, hp, { nur: Object.assign({}, FC.MASSNUR, { geruest: true }) });
        const HA = FC.HAUS(THREE, FC.mat, P);
        const lagenV2 = LI.ausHaus(HA.subsystems.geruest, HA.P);
        let nBox = 0, nBuf = 0; HA.subsystems.geruest.traverse((m) => { if (m.isMesh) { if (m.geometry.type === "BoxGeometry") nBox++; else nBuf++; } });
        const r = STADT.find((h) => h.adr === adr) || liniendesHauses(FC, THREE, hp, LM);
        console.log(`  ${adr} ${hp.rolle} ${hp.kultur}/${hp.stil} roofCurve ${hp.roofCurve || 0} · Gerüst-Meshes Box ${nBox} / BufferGeometry ${nBuf} · linse-v2.ausHaus Lagen ${lagenV2.length} · dieser Leser: Deckenbalken ${r.nJoist}, Decken über L_max ${r.linien.filter((l) => l.ueberEiche && !l.art.startsWith("dach")).length} (heute W ${hp.W} × D ${hp.D})`);
    }
    const cv = STADT.filter((h) => h.roofCurve > 0);
    console.log(`  Klasse: alle roofCurve > 0 der Stadt: ${cv.length}; davon Deckenbalken im Mesh als BufferGeometry gebaut (FC:289–295): sieht linse-v2 nicht (linse-v2.cjs:71). Mit D − 0,2 > L_max: ${cv.filter((h) => h.D - 0.2 > LM.eiche).length}`);

    if (process.env.ZAEHL_JSON) {
        const aus = { LM, hundert: H100.map((h) => ({ adr: h.adr, rolle: h.hp.rolle, W: h.W, D: h.D, st: h.st, glatt: h.glatt, linien: h.linien })), stadt: STADT.map((h) => ({ adr: h.adr, rolle: h.hp.rolle, W: h.W, D: h.D, st: h.st, glatt: h.glatt, roofCurve: h.roofCurve, linien: h.linien })) };
        fs.writeFileSync(process.env.ZAEHL_JSON, JSON.stringify(aus));
        console.log("geschrieben " + process.env.ZAEHL_JSON);
    }
    console.log(`\nLaufzeit ${((Date.now() - t0) / 1000).toFixed(1)} s`);
})().catch((e) => { console.error(e); process.exit(1); });
