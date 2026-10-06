#!/usr/bin/env node
// diag-tier-anatomie.cjs — DIE ANATOMIE-LINSE DER TIERE (Welle 5, Tour 09: „der Rumpf ist ein Sack auf dünnen Beinen")
// (npm run gate:tier-anatomie). Sie misst die GEBACKENE Gestalt — denselben Bäcker, den Worker und Wirt rufen
// (foundry-core BAKERS_BY_KIND.kreatur, three r128 im node-vm wie im Foundry-Worker) — an der Haut der Ruhe-Pose,
// normiert auf den Widerrist W, gegen das SOLL des Gesetzbuchs (tetrapoda-core ANATOMIE_SOLL, die Natur-Bänder je Art):
//   widerristM · brustTiefe · aufzug · rumpf · unterarm · kopfHoehe · ohr · rute   (die Gestalt)
//   kontrast (Bauch/Rücken) · lauf (Läufe/Flanke) · spitze (Rutenspitze/Flanke)    (das Fell-Muster am Vertex)
// Rot nennt den Täter: `fox rute 0.62 < 0.7`. Dazu je Art die Dreiecke beider Stufen gegen die Budget-Zeile
// (PORTAL_RENDER_CONFIG.lod.budget.kreatur) — die Gestalt hält ihr Budget.
//   --selftest: (S1) der Rumpf 1,4× gestreckt → brustTiefe rot · (S2) das Muster einfarbig → kontrast rot ·
//   (S3) der Maßstab 1 → widerristM rot · (S4) der Hals 1,8× breit → halsBreite rot · (S5) der Kopf in den Hals
//   geschoben → kopfFrei rot. Die Linse feuert, sonst ist sie vakuös.
// Dazu kopfFrei (Anteil der Kopf-Länge vor der Leib-Haut) und halsBreite (die Leib-Haut auf 60 % Schulter → Kopf).
//   node scripts/diag-tier-anatomie.cjs [--selftest] [--json]
"use strict";
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ARTEN = ["wolf", "fox", "bear", "deer"];

function ladeWelt() {
    const sb = { console, Math, performance: { now: () => Date.now() }, setTimeout, clearTimeout };
    sb.self = sb;
    sb.globalThis = sb;
    sb.window = sb;
    vm.createContext(sb);
    for (const f of ["worlds/terrain/lib/three-r128.min.js", "phyto-core.js", "koerper-core.js", "tetrapoda-core.js", "foundry-core.js"])
        vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sb, { filename: f });
    return sb;
}

// Die gebackene Gruppe → Teile in der Ruhe-Pose (Gelenk-Welt aus dem __skelett-Beipack).
function teileDerRuhe(sb, g) {
    const T = sb.THREE;
    const sk = g.userData.__skelett;
    const by = {};
    for (const j of sk.joints) by[j.name] = j;
    const memo = {};
    const welt = (n) => {
        if (memo[n]) return memo[n];
        const j = by[n];
        const m = new T.Matrix4().compose(new T.Vector3(...j.pos), new T.Quaternion(...j.quat), new T.Vector3(...j.scale));
        memo[n] = j.parent && by[j.parent] ? new T.Matrix4().multiplyMatrices(welt(j.parent), m) : m;
        return memo[n];
    };
    const teile = [];
    const v = new T.Vector3();
    g.traverse((m) => {
        if (!m.isMesh) return;
        const geo = m.geometry;
        const pa = geo.attributes.position;
        const jn = m.userData.__assetJoint || sk.root;
        const MW = welt(jn);
        const P = new Float32Array(pa.count * 3);
        for (let i = 0; i < pa.count; i++) {
            v.fromBufferAttribute(pa, i).applyMatrix4(MW);
            P[i * 3] = v.x;
            P[i * 3 + 1] = v.y;
            P[i * 3 + 2] = v.z;
        }
        teile.push({
            kl: m.material.userData.__klasse,
            joint: jn,
            P,
            n: geo.index ? geo.index.count / 3 : pa.count / 3,
            C: geo.attributes.color ? geo.attributes.color.array : null,
            SI: geo.attributes.skinIndex ? geo.attributes.skinIndex.array : null,
            SW: geo.attributes.skinWeight ? geo.attributes.skinWeight.array : null,
        });
    });
    const lage = (n) => new T.Vector3().setFromMatrixPosition(welt(n));
    return { teile, sk, lage };
}

const sRGB = (l) => (l <= 0.0031308 ? 12.92 * l : 1.055 * Math.pow(l, 1 / 2.4) - 0.055) * 255;
const lum = (c) => 0.2126 * sRGB(c[0]) + 0.7152 * sRGB(c[1]) + 0.0722 * sRGB(c[2]);

function messe(sb, g) {
    const { teile, sk, lage } = teileDerRuhe(sb, g);
    const zS = lage("legFL").z,
        zH = lage("legHL").z,
        xS = Math.abs(lage("legFL").x),
        span = zS - zH;
    let haut = null;
    for (const t of teile) if (t.kl === "fell" && t.SI && (!haut || t.n > haut.n)) haut = t;
    if (!haut) throw new Error("keine geskinnte Haut");
    let minY = Infinity;
    for (const t of teile) if (t.kl !== "fellSchale") for (let i = 1; i < t.P.length; i += 3) minY = Math.min(minY, t.P[i]);
    const P = haut.P,
        nV = P.length / 3;
    const dominant = (i) => {
        let best = -1,
            bw = -1;
        for (let k = 0; k < 4; k++)
            if (haut.SW[i * 4 + k] > bw) {
                bw = haut.SW[i * 4 + k];
                best = haut.SI[i * 4 + k];
            }
        return sk.skinJoints[best];
    };
    // Ober-/Unterlinie im Mittelstreifen
    const NB = 40,
        z0 = zH - 0.4 * span,
        z1 = zS + 0.3 * span;
    const top = new Array(NB).fill(-Infinity),
        bot = new Array(NB).fill(Infinity);
    for (let i = 0; i < nV; i++) {
        const x = P[i * 3],
            y = P[i * 3 + 1] - minY,
            z = P[i * 3 + 2];
        if (z < z0 || z > z1 || Math.abs(x) >= 0.25 * xS) continue;
        const b = Math.min(NB - 1, Math.floor(((z - z0) / (z1 - z0)) * NB));
        top[b] = Math.max(top[b], y);
        bot[b] = Math.min(bot[b], y);
    }
    const zb = (b) => z0 + ((b + 0.5) / NB) * (z1 - z0);
    let W = 0,
        brust = Infinity,
        aufzug = -Infinity;
    for (let b = 0; b < NB; b++) {
        if (zb(b) > zS - 0.35 * span && zb(b) < zS - 0.02 * span) W = Math.max(W, top[b]);
        if (zb(b) > zS - 0.35 * span && zb(b) < zS + 0.05 * span) brust = Math.min(brust, bot[b]);
        if (zb(b) > zH + 0.1 * span && zb(b) < (zS + zH) / 2) aufzug = Math.max(aufzug, bot[b]);
    }
    // Rumpf-Länge: Haut-Punkte der Wurzel im Band 0,55–0,78 W
    let za = Infinity,
        ze = -Infinity;
    for (let i = 0; i < nV; i++) {
        const y = P[i * 3 + 1] - minY;
        if (y > 0.55 * W && y < 0.78 * W && dominant(i) === sk.root) {
            za = Math.min(za, P[i * 3 + 2]);
            ze = Math.max(ze, P[i * 3 + 2]);
        }
    }
    // Unterarm: Tiefe des rechten Vorderlaufs bei 0,3 W
    let ua = Infinity,
        ue = -Infinity;
    for (let i = 0; i < nV; i++) {
        const x = P[i * 3],
            y = P[i * 3 + 1] - minY,
            z = P[i * 3 + 2];
        if (x > 0 && Math.abs(y - 0.3 * W) < 0.015 * W && Math.abs(z - zS) < 0.4 * span) {
            ua = Math.min(ua, z);
            ue = Math.max(ue, z);
        }
    }
    let kopf = -Infinity,
        o0 = Infinity,
        o1 = -Infinity;
    for (const t of teile) {
        if (t.joint === "headGroup" && t.kl === "fell") for (let i = 1; i < t.P.length; i += 3) kopf = Math.max(kopf, t.P[i] - minY);
        if (t.joint === "earL")
            for (let i = 1; i < t.P.length; i += 3) {
                o0 = Math.min(o0, t.P[i]);
                o1 = Math.max(o1, t.P[i]);
            }
    }
    const tn = sk.tailSegs || [];
    const rute = tn.length ? lage("tailRoot").distanceTo(lage(tn[tn.length - 1])) : 0;
    // DER KOPF VOR DEM HALS: wie viel der Kopf-Länge (die starren Kopf-Häute) ragt vor die Leib-Haut in seiner
    // Höhe? (der Bär mit dem Brustkorb-dicken Hals trug den Kopf IN sich: nur die Nase sah heraus)
    let hz0 = Infinity,
        hz1 = -Infinity,
        hy0 = Infinity,
        hy1 = -Infinity;
    for (const t of teile)
        if ((t.joint === "headGroup" || t.joint === "jawGroup") && t.kl === "fell")
            for (let i = 0; i < t.P.length; i += 3) {
                hz0 = Math.min(hz0, t.P[i + 2]);
                hz1 = Math.max(hz1, t.P[i + 2]);
                hy0 = Math.min(hy0, t.P[i + 1]);
                hy1 = Math.max(hy1, t.P[i + 1]);
            }
    let leibVorn = -Infinity;
    for (let i = 0; i < nV; i++) {
        const y = P[i * 3 + 1];
        if (y >= hy0 && y <= hy1) leibVorn = Math.max(leibVorn, P[i * 3 + 2]);
    }
    const kopfFrei = (hz1 - Math.max(hz0, leibVorn)) / Math.max(1e-6, hz1 - hz0);
    // DER HALS: die Breite der Leib-Haut auf 60 % des Wegs vom Schulter-Gelenk zum Kopf (eine Scheibe ±0,04 W)
    const pS = lage("legFL"),
        pK = lage("headGroup");
    pS.x = 0;
    const pN = pS.clone().lerp(pK, 0.6);
    let hx0 = Infinity,
        hx1 = -Infinity;
    for (let i = 0; i < nV; i++) {
        if (Math.abs(P[i * 3 + 2] - pN.z) > 0.04 * W || Math.abs(P[i * 3 + 1] - pN.y) > 0.15 * W) continue;
        hx0 = Math.min(hx0, P[i * 3]);
        hx1 = Math.max(hx1, P[i * 3]);
    }
    // DAS MUSTER: mittlere Farbe je Region der Haut (der Vertex trägt sie — die Welt liest nur ihn)
    const region = { ruecken: [0, 0, 0, 0], bauch: [0, 0, 0, 0], flanke: [0, 0, 0, 0], lauf: [0, 0, 0, 0], spitze: [0, 0, 0, 0] };
    const add = (r, i) => {
        region[r][0] += haut.C[i * 3];
        region[r][1] += haut.C[i * 3 + 1];
        region[r][2] += haut.C[i * 3 + 2];
        region[r][3]++;
    };
    const unten = new Set(["flL", "flP", "frL", "frP", "hlC", "hlP", "hrC", "hrP"]);
    const letzte = tn[tn.length - 1];
    if (haut.C)
        for (let i = 0; i < nV; i++) {
            const y = P[i * 3 + 1] - minY,
                z = P[i * 3 + 2];
            const d = dominant(i);
            if (unten.has(d)) {
                if (y < 0.3 * W) add("lauf", i);
                continue;
            }
            if (d === letzte) {
                add("spitze", i);
                continue;
            }
            if (d !== sk.root || z < zH || z > zS) continue;
            const b = Math.min(NB - 1, Math.max(0, Math.floor(((z - z0) / (z1 - z0)) * NB)));
            const v = (y - bot[b]) / Math.max(1e-6, top[b] - bot[b]);
            if (v > 0.85) add("ruecken", i);
            else if (v < 0.15) add("bauch", i);
            else if (v > 0.35 && v < 0.6) add("flanke", i);
        }
    const L = {};
    for (const [k, s] of Object.entries(region)) L[k] = s[3] ? lum([s[0] / s[3], s[1] / s[3], s[2] / s[3]]) : NaN;
    let tris = 0;
    for (const t of teile) tris += t.n;
    return {
        W,
        brustTiefe: (W - brust) / W,
        aufzug: aufzug / W,
        rumpf: (ze - za) / W,
        unterarm: (ue - ua) / W,
        kopfHoehe: kopf / W,
        ohr: (o1 - o0) / W,
        rute: rute / W,
        kopfFrei,
        halsBreite: (hx1 - hx0) / W,
        kontrast: L.bauch / L.ruecken,
        lauf: L.lauf / L.flanke,
        spitze: L.spitze / L.flanke,
        tris,
    };
}

function urteile(sb, art, m, M) {
    const S = sb.__tetrapodaCore.ANATOMIE_SOLL[art];
    const roh = Object.assign({}, m, { widerristM: m.W * M });
    const v = [];
    for (const [k, band] of Object.entries(S)) {
        const x = roh[k];
        if (!Number.isFinite(x)) v.push(`${art} ${k} nicht messbar`);
        else if (x < band[0]) v.push(`${art} ${k} ${x.toFixed(3)} < ${band[0]}`);
        else if (x > band[1]) v.push(`${art} ${k} ${x.toFixed(3)} > ${band[1]}`);
    }
    return { roh, v };
}

function lauf(sb, opts) {
    const TC = sb.__tetrapodaCore;
    const M = opts && opts.massstab != null ? opts.massstab : TC.MASSSTAB.meterJeEinheit;
    const budget = TC.PORTAL_RENDER_CONFIG.lod.budget.kreatur;
    const ergebnis = {};
    const fehler = [];
    for (const art of ARTEN) {
        const g = sb.BAKERS_BY_KIND.kreatur(TC, art, 0, 0, null);
        if (opts && opts.verzerre) opts.verzerre(sb, g);
        const m = messe(sb, g);
        const u = urteile(sb, art, m, M);
        // die zweite Stufe (das Fern-Standbild) gegen ihre Budget-Zeile
        const g1 = sb.BAKERS_BY_KIND.kreatur(TC, art, 0, 1, null);
        let t1 = 0;
        g1.traverse((o) => {
            if (o.isMesh) t1 += o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3;
        });
        if (m.tris > budget[0].tris) u.v.push(`${art} L0 ${m.tris} Dreiecke > ${budget[0].tris}`);
        if (t1 > budget[1].tris) u.v.push(`${art} L1 ${t1} Dreiecke > ${budget[1].tris}`);
        u.roh.trisL1 = t1;
        ergebnis[art] = u.roh;
        fehler.push(...u.v);
    }
    return { ergebnis, fehler };
}

function zeige(ergebnis) {
    const r3 = (x) => (Number.isFinite(x) ? x.toFixed(3) : String(x));
    for (const [art, m] of Object.entries(ergebnis))
        console.log(
            `  ${art.padEnd(5)} W ${m.widerristM.toFixed(2)} m · Brust ${r3(m.brustTiefe)} · Aufzug ${r3(m.aufzug)} · Rumpf ${r3(m.rumpf)} · Unterarm ${r3(m.unterarm)} · Kopf ${r3(m.kopfHoehe)} · Ohr ${r3(m.ohr)} · Rute ${r3(m.rute)} · Kopf frei ${r3(m.kopfFrei)} · Hals ${r3(m.halsBreite)} · Kontrast ${r3(m.kontrast)} · Lauf ${r3(m.lauf)} · Spitze ${r3(m.spitze)} · L0 ${m.tris} / L1 ${m.trisL1} Dreiecke`
        );
}

if (process.argv.includes("--selftest")) {
    console.log("=== SELBST-TEST: die Anatomie-Linse feuert ===");
    let rot = 0;
    const pruefe = (name, fehler, muster) => {
        const ok = fehler.some((f) => muster.test(f));
        console.log(`  ${ok ? "✅" : "❌"} ${name}${ok ? " — " + fehler.find((f) => muster.test(f)) : ""}`);
        if (!ok) rot++;
    };
    // S1: der Rumpf (Wurzel-Haut) 1,4× in die Tiefe gestreckt — der Sack kehrt zurück
    {
        const sb = ladeWelt();
        const r = lauf(sb, {
            verzerre: (sb2, g) =>
                g.traverse((o) => {
                    if (!o.isMesh || !o.geometry.attributes.skinIndex || o.userData.__assetJoint !== "wolf") return;
                    const pa = o.geometry.attributes.position;
                    for (let i = 0; i < pa.count; i++) {
                        const y = pa.getY(i);
                        if (y > 0.45 * 2.4) pa.setY(i, 0.45 * 2.4 + (y - 0.45 * 2.4) * 1.0);
                        else pa.setY(i, 0.45 * 2.4 - (0.45 * 2.4 - y) * 1.4);
                    }
                }),
        });
        pruefe("S1 der gestreckte Rumpf wird erkannt", r.fehler, /brustTiefe/);
    }
    // S2: das Muster einfarbig (fellFarbe = Grund) — der Fuchs ohne Strümpfe, der Wolf ohne Sattel
    {
        const sb = ladeWelt();
        const TC = sb.__tetrapodaCore;
        const alt = TC.fellFarbe;
        TC.fellFarbe = (P) => TC.artGestalt(P).muster.basis.slice();
        const r = lauf(sb);
        TC.fellFarbe = alt;
        pruefe("S2 das einfarbige Fell wird erkannt", r.fehler, /kontrast/);
    }
    // S3: der Maßstab 1 (Lab-Einheit = Meter — der Wolf stand 2,5 m hoch)
    {
        const sb = ladeWelt();
        const r = lauf(sb, { massstab: 1 });
        pruefe("S3 der Riesen-Wolf (Maßstab 1) wird erkannt", r.fehler, /wolf widerristM/);
    }
    // S4: der Hals 1,8× breit (die Kapuze kehrt zurück) — die Leib-Haut vor den Schultern seitlich gedehnt
    // S5: der Kopf um die halbe Länge in den Hals geschoben (der Bär vor dieser Welle)
    {
        const sb = ladeWelt();
        const r = lauf(sb, {
            verzerre: (sb2, g) =>
                g.traverse((o) => {
                    if (!o.isMesh) return;
                    const pa = o.geometry.attributes.position;
                    if (o.geometry.attributes.skinIndex && o.userData.__assetJoint === "wolf") {
                        let zMax = -Infinity;
                        for (let i = 0; i < pa.count; i++) zMax = Math.max(zMax, pa.getZ(i));
                        for (let i = 0; i < pa.count; i++) if (pa.getZ(i) > zMax - 0.25 * 2.4) pa.setX(i, pa.getX(i) * 1.8);
                    }
                    if (o.userData.__assetJoint === "headGroup" || o.userData.__assetJoint === "jawGroup") {
                        let z0 = Infinity,
                            z1 = -Infinity;
                        for (let i = 0; i < pa.count; i++) {
                            z0 = Math.min(z0, pa.getZ(i));
                            z1 = Math.max(z1, pa.getZ(i));
                        }
                        for (let i = 0; i < pa.count; i++) pa.setZ(i, pa.getZ(i) - 0.6 * (z1 - z0));
                    }
                }),
        });
        pruefe("S4 der Kapuzen-Hals wird erkannt", r.fehler, /wolf halsBreite/);
        pruefe("S5 der Kopf im Hals wird erkannt", r.fehler, /wolf kopfFrei/);
    }
    if (rot) {
        console.error(`\n❌ SELBST-TEST ROT — ${rot} Linse(n) vakuös.`);
        process.exit(1);
    }
    console.log("\n✅ SELBST-TEST GRÜN.");
    process.exit(0);
}

console.log("=== DIE ANATOMIE-LINSE: die gebackene Gestalt gegen das Soll der Art (tetrapoda ANATOMIE_SOLL) ===");
const sb = ladeWelt();
const { ergebnis, fehler } = lauf(sb);
zeige(ergebnis);
if (process.argv.includes("--json")) console.log(JSON.stringify(ergebnis, null, 1));
if (fehler.length) {
    console.error(`\n❌ ROT — ${fehler.length} Abweichung(en):\n  ` + fehler.join("\n  "));
    process.exit(1);
}
console.log("\n✅ GRÜN — jede Art steht in ihren Natur-Bändern (Gestalt + Fell-Muster) und hält ihr Budget.");
process.exit(0);
