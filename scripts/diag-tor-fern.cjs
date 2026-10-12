#!/usr/bin/env node
// diag-tor-fern.cjs — DIE LINSE DES TOR-WURFS UND DER TOR-FERNFORM (1110-9, gate:tor-fern). Befund (OMEN 11.10., Genesis-Ring,
// GTX 1060): die Stufe 0 jedes Tors warf sich selbst (Budget-Zeile `schatten: 0`) — 181 000 der 977 000 Dreiecke der Genesis
// lagen im Wurf der Tore in die nahe Kaskade, je Tor und Kaskade bis 13 Stoff-Befehle. Der Akt: die NUR-WURF-Stufe 3 ist die
// Hüllen-Liste des Tors (porta-core `huelle`, N5), gesammelt im SELBEN Lauf von buildGate, der die Meshes baut; die feinen Teile
// tragen die Rolle "wurf" (nur die Stufe 3 wirft sie), die Fernform des Welt-March liest höchstens 24 Teile der Rolle "sicht"
// (der Rahmen-Strang der innersten Ordnung und der Sockel — der March läuft je Pixel über alle Teile seines Eintrags). Die Linse
// misst je Rezept (7) und — für die Kosten — über die Regler-Hülle (7 Rezepte × 27 Regler × Rand), direkt am Gesetzbuch (Node,
// worlds/terrain/lib/three-r128.min.js + porta-core.js) und mit dem EINEN Leser des Stamms (`_huelleVon` aus anazhRealm.js):
//
//   K  KOSTEN: die Fernform (`_huelleVon(…, "sicht")`) trägt ≤ 24 Teile und KEIN "wurf"-Teil, die Stufe 3 ≤ ihrer Budget-Zeile
//      (tris, 1 Draw) — je Bau der Regler-Hülle
//   W  WURF-DECKUNG: die Stufe 3 gegen die L0 — IoU der Schatten-Fußabdrücke (Projektion entlang der Sonne auf y = 0, Raster
//      5 cm) unter zwölf Sonnen (25° · 40° · 60° · 74° Höhe × drei Azimute); die Licht-Scheibe der L0 (1,2 cm über dem Boden)
//      zählt nicht: unter dem Tiefen-Bias der Kaskade (5–13 cm) wirft sie nichts
//   I  INNEN: die Stufe 3 steht nicht aus dem Gezeichneten — je Ecke ihres Gitters der Abstand zur L0-Oberfläche (Proben: jede
//      L0-Fläche bis 8 cm unterteilt), p95 ≤ Soll (der Tiefen-Bias der nahen Kaskade, 0,75 Texel ≈ 5–13 cm, trägt den Rest)
//
// SELBSTTEST (--selftest, im Lauf, an den Rezepten): ein Leser, der "wurf" ins Fernbild lässt, MUSS in K rot werden; 25 Teile
// "sicht" in K; eine Liste ohne ihre wurf-Teile in W (drachentor, maurentor); aufgeblähte Kapseln (+0,15 m) in I (geisttor).
//   node scripts/diag-tor-fern.cjs [--selftest] [--nur <regex>]
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "porta-core.js"));
const PC = globalThis.__portaCore;
const ARG = process.argv;
const SELBST = ARG.includes("--selftest");
const NUR = ARG.indexOf("--nur") >= 0 ? new RegExp(ARG[ARG.indexOf("--nur") + 1]) : null;
const ZEILE = PC.PORTAL_RENDER_CONFIG.lod.budget.gate[3];

// DAS SOLL (gemessen am Kopf des Akts, 7 Rezepte): Wurf-IoU min 0,864 (geisttor: der dünne Monolith-Rahmen und die Hölzer der
// Tür unter tiefer Sonne) · Median der Rezepte 0,958 → je Rezept ≥ 0,85, Median ≥ 0,92 (das Maß der Haus-Linse). Innen p95
// 5,8–9,1 cm (die Hülle des Geflechts über den Lücken der Stränge, die Kästen gedrehter Steine — kathedrale 8,9 —, der
// Fern-Strang der Ruine über ihren fehlenden Steinen — 9,1) → ≤ 10 cm; der Tiefen-Bias der nahen Kaskade trägt 5–13 cm.
const SOLL = { fernTeile: 24, wurfIou: 0.85, wurfMedian: 0.92, innenP95: 0.1 };

// ── DER EINE LESER DES STAMMS: `AnazhRealm._huelleVon` aus der Quelle (die Fernform liest, was er liest) ──
const STAMM = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
function methodeAus(src, kopf) {
    const i = src.indexOf(kopf);
    if (i < 0) throw new Error("im Stamm nicht gefunden: " + kopf);
    let j = src.indexOf("{", i), tiefe = 0, k = j;
    for (; k < src.length; k++) {
        if (src[k] === "{") tiefe++;
        else if (src[k] === "}" && --tiefe === 0) break;
    }
    return src.slice(j + 1, k);
}
const KEIL_TYP = (() => {
    const m = STAMM.match(/AnazhRealm\.HUELLE_KEIL_TYP = Object\.freeze\((\{[^}]*\})\)/);
    return m ? Function("return " + m[1])() : {};
})();
function leser(rumpf) {
    const stub = {
        HUELLE_KEIL_TYP: KEIL_TYP,
        _kernPflichtBruch: (q) => {
            throw new Error("KERN-PFLICHT " + q);
        },
    };
    return Function("AnazhRealm", "return function _huelleVon(h, rolle, quelle) {" + rumpf + "};")(stub);
}
const RUMPF = methodeAus(STAMM, "    static _huelleVon(h, rolle, quelle) {");
const huelleVon = leser(RUMPF);

// ── Fußabdruck entlang der Sonne (Raster 5 cm) ──
const RASTER = 0.05;
function dreiecke(g, ohneScheibe) {
    const out = [], v = new THREE.Vector3();
    g.updateMatrixWorld(true);
    g.traverse((o) => {
        if (!o.isMesh || (ohneScheibe && o.geometry.type === "CircleGeometry")) return;
        const P = o.geometry.attributes.position, I = o.geometry.index, n = I ? I.count : P.count;
        for (let i = 0; i < n; i++) {
            v.fromBufferAttribute(P, I ? I.getX(i) : i).applyMatrix4(o.matrixWorld);
            out.push(v.x, v.y, v.z);
        }
    });
    return out;
}
function abdruck(D, d, box) {
    const nu = Math.ceil((box.u1 - box.u0) / RASTER), nv = Math.ceil((box.v1 - box.v0) / RASTER), m = new Uint8Array(nu * nv);
    const pr = (x, y, z) => {
        const t = Math.max(0, y) / d[1];
        return [x - d[0] * t, z - d[2] * t];
    };
    for (let i = 0; i < D.length; i += 9) {
        const a = pr(D[i], D[i + 1], D[i + 2]), b = pr(D[i + 3], D[i + 4], D[i + 5]), c = pr(D[i + 6], D[i + 7], D[i + 8]);
        const ar = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
        if (Math.abs(ar) < 1e-12) continue;
        const i0 = Math.max(0, Math.floor((Math.min(a[0], b[0], c[0]) - box.u0) / RASTER)), i1 = Math.min(nu - 1, Math.ceil((Math.max(a[0], b[0], c[0]) - box.u0) / RASTER));
        const k0 = Math.max(0, Math.floor((Math.min(a[1], b[1], c[1]) - box.v0) / RASTER)), k1 = Math.min(nv - 1, Math.ceil((Math.max(a[1], b[1], c[1]) - box.v0) / RASTER));
        for (let k = k0; k <= k1; k++)
            for (let ii = i0; ii <= i1; ii++) {
                const px = box.u0 + (ii + 0.5) * RASTER, py = box.v0 + (k + 0.5) * RASTER;
                const w0 = ((b[0] - px) * (c[1] - py) - (b[1] - py) * (c[0] - px)) / ar, w1 = ((c[0] - px) * (a[1] - py) - (c[1] - py) * (a[0] - px)) / ar;
                if (w0 >= -1e-9 && w1 >= -1e-9 && 1 - w0 - w1 >= -1e-9) m[k * nu + ii] = 1;
            }
    }
    return m;
}
const SONNEN = [];
for (const h of [25, 40, 60, 74])
    for (const az of [0, 120, 240]) {
        const e = (h * Math.PI) / 180, a = (az * Math.PI) / 180;
        SONNEN.push([Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)]);
    }
function wurfDeckung(L0, W) {
    const ious = [];
    for (const d of SONNEN) {
        let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
        for (const D of [L0, W])
            for (let i = 0; i < D.length; i += 3) {
                const t = Math.max(0, D[i + 1]) / d[1], u = D[i] - d[0] * t, v = D[i + 2] - d[2] * t;
                u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v);
            }
        const box = { u0: u0 - 0.2, u1: u1 + 0.2, v0: v0 - 0.2, v1: v1 + 0.2 };
        const a = abdruck(L0, d, box), b = abdruck(W, d, box);
        let s = 0, v = 0;
        for (let k = 0; k < a.length; k++) {
            if (a[k] && b[k]) s++;
            if (a[k] || b[k]) v++;
        }
        ious.push(v ? s / v : 0);
    }
    ious.sort((x, y) => x - y);
    return { min: ious[0], median: ious[ious.length >> 1] };
}

// ── Innen: Abstand der Stufe-3-Ecken zur L0-Oberfläche (Hash 8 cm) ──
const ZELLE = 0.08;
function oberflaeche(g) {
    const H = new Map(), v = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    const rein = (x, y, z) => {
        const k = Math.floor(x / ZELLE) + "," + Math.floor(y / ZELLE) + "," + Math.floor(z / ZELLE);
        let a = H.get(k);
        if (!a) H.set(k, (a = []));
        if (a.length < 60) a.push(x, y, z);
    };
    const tei = (a, b, c, d) => {
        if (Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)) < 0.08 || d > 6) {
            rein(a.x, a.y, a.z); rein(b.x, b.y, b.z); rein(c.x, c.y, c.z); rein((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3);
            return;
        }
        const ab = a.clone().add(b).multiplyScalar(0.5), bc = b.clone().add(c).multiplyScalar(0.5), ca = c.clone().add(a).multiplyScalar(0.5);
        tei(a, ab, ca, d + 1); tei(ab, b, bc, d + 1); tei(ca, bc, c, d + 1); tei(ab, bc, ca, d + 1);
    };
    g.updateMatrixWorld(true);
    g.traverse((o) => {
        if (!o.isMesh || o.geometry.type === "CircleGeometry") return;
        const P = o.geometry.attributes.position, I = o.geometry.index, n = I ? I.count : P.count;
        for (let i = 0; i < n; i += 3) {
            for (let k = 0; k < 3; k++) v[k].fromBufferAttribute(P, I ? I.getX(i + k) : i + k).applyMatrix4(o.matrixWorld);
            tei(v[0].clone(), v[1].clone(), v[2].clone(), 0);
        }
    });
    return H;
}
function abstand(H, x, y, z) {
    const cx = Math.floor(x / ZELLE), cy = Math.floor(y / ZELLE), cz = Math.floor(z / ZELLE);
    let best = Infinity;
    for (let r = 0; r <= 3 && best > r * ZELLE; r++)
        for (let dx = -r; dx <= r; dx++)
            for (let dy = -r; dy <= r; dy++)
                for (let dz = -r; dz <= r; dz++) {
                    if (Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) !== r) continue;
                    const a = H.get(cx + dx + "," + (cy + dy) + "," + (cz + dz));
                    if (!a) continue;
                    for (let i = 0; i < a.length; i += 3) best = Math.min(best, Math.hypot(a[i] - x, a[i + 1] - y, a[i + 2] - z));
                }
    return best;
}
function innenP95(L0g, W) {
    const H = oberflaeche(L0g), D = [];
    for (let i = 0; i < W.length; i += 3) D.push(abstand(H, W[i], W[i + 1], W[i + 2]));
    D.sort((a, b) => a - b);
    return D[Math.min(D.length - 1, Math.floor(0.95 * D.length))];
}
const gitterDreiecke = (g3) => dreiecke(g3, false);
const tris = (g3) => {
    let n = 0;
    g3.traverse((o) => {
        if (o.isMesh) n += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
    });
    return n;
};
const draws = (g3) => {
    let n = 0;
    g3.traverse((o) => {
        if (o.isMesh) n++;
    });
    return n;
};

// ── K über die Regler-Hülle ──
function kosten(leserFn, umbau, nurRezepte) {
    const bruch = [];
    let maxSicht = 0, maxTris = 0;
    for (const id of Object.keys(PC.PRESETS)) {
        if (NUR && !NUR.test(id)) continue;
        const raender = [null];
        if (!nurRezepte) for (const z of PC.PARAMS_BY_KIND.gate) raender.push([z.id, z.min], [z.id, z.max]);
        for (const r of raender) {
            const ov = r ? { [r[0]]: r[1] } : undefined, wo = id + (r ? " " + r[0] + "=" + r[1] : "");
            let h = PC.huelle(id, 7, ov);
            if (umbau) h = umbau(h);
            let sicht;
            try {
                sicht = leserFn(h, "sicht", "porta:" + id);
            } catch (e) {
                bruch.push(`${wo}: ${e.message}`);
                continue;
            }
            const wurfImBild = sicht.filter((t) => t.rolle === "wurf").length;
            if (sicht.length > SOLL.fernTeile) bruch.push(`${wo}: Fernbild ${sicht.length} Teile > ${SOLL.fernTeile}`);
            if (wurfImBild) bruch.push(`${wo}: ${wurfImBild} wurf-Teile im Fernbild (die Rolle leckt in den March)`);
            maxSicht = Math.max(maxSicht, sicht.length);
            if (!umbau) {
                // das Gitter der Stufe 3 aus derselben Liste mit dem EINEN Gitter-Bauer des Kerns (buildInstance(…, 3) = huelle → huelleGruppe)
                const g3 = PC.huelleGruppe(h.teile), n = tris(g3), dr = draws(g3);
                maxTris = Math.max(maxTris, n);
                if (n > ZEILE.tris) bruch.push(`${wo}: Stufe 3 ${n} Dreiecke > ${ZEILE.tris}`);
                if (dr > ZEILE.draws) bruch.push(`${wo}: Stufe 3 ${dr} Draws > ${ZEILE.draws}`);
            }
        }
    }
    return { bruch, maxSicht, maxTris };
}

// ── W und I je Rezept ──
function deckung(umbauListe, aufblaehen, nurIds) {
    const zeilen = [];
    for (const id of Object.keys(PC.PRESETS)) {
        if ((NUR && !NUR.test(id)) || (nurIds && !nurIds.includes(id))) continue;
        const L0g = PC.buildInstance(id, 7, 0), L0 = dreiecke(L0g, true);
        let g3 = PC.buildInstance(id, 7, 3);
        if (umbauListe || aufblaehen) {
            let h = PC.huelle(id, 7);
            if (umbauListe) h = umbauListe(h);
            if (aufblaehen) h = { stufe: 3, teile: h.teile.map((t) => (t.art === "kapsel" ? Object.assign({}, t, { r: t.r + aufblaehen }) : t)) };
            g3 = PC.huelleGruppe(h.teile);
        }
        const W = gitterDreiecke(g3);
        const w = wurfDeckung(L0, W), i95 = innenP95(L0g, W);
        zeilen.push({ id, iouMin: w.min, iouMedian: w.median, innenP95: i95 });
    }
    return zeilen;
}

const fails = [];
const check = (name, ok, info) => {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${info ? " — " + info : ""}`);
    if (!ok) fails.push(name);
};
console.log(`=== TOR-FERN (1110-9) — NUR-WURF-Stufe 3 und Fernform der Tore (porta-core huelle, Zeile ${JSON.stringify(ZEILE)}) ===`);
const k = kosten(huelleVon);
check(
    `K KOSTEN: Fernbild ≤ ${SOLL.fernTeile} Teile ohne wurf-Teil, Stufe 3 ≤ ${ZEILE.tris} Dreiecke / ${ZEILE.draws} Draw (Regler-Hülle)`,
    k.bruch.length === 0,
    k.bruch.length ? k.bruch.slice(0, 4).join(" · ") : `Fernbild max ${k.maxSicht} Teile · Stufe 3 max ${k.maxTris} Dreiecke`
);
const z = deckung(null, 0);
const med = [...z.map((r) => r.iouMedian)].sort((a, b) => a - b)[z.length >> 1];
for (const r of z)
    console.log(`     ${r.id.padEnd(11)} Wurf-IoU min ${r.iouMin.toFixed(3)} · Median ${r.iouMedian.toFixed(3)} · innen p95 ${(r.innenP95 * 100).toFixed(1)} cm`);
check(
    `W WURF-DECKUNG: je Rezept ≥ ${SOLL.wurfIou}, Median ≥ ${SOLL.wurfMedian} (12 Sonnen, Raster 5 cm)`,
    z.every((r) => r.iouMin >= SOLL.wurfIou) && med >= SOLL.wurfMedian,
    `min ${Math.min(...z.map((r) => r.iouMin)).toFixed(3)} (${z.reduce((a, r) => (r.iouMin < a.iouMin ? r : a)).id}) · Median ${med.toFixed(3)}`
);
check(
    `I INNEN: je Rezept p95 der Stufe-3-Ecken ≤ ${SOLL.innenP95 * 100} cm von der L0`,
    z.every((r) => r.innenP95 <= SOLL.innenP95),
    `max p95 ${(Math.max(...z.map((r) => r.innenP95)) * 100).toFixed(1)} cm`
);
if (SELBST) {
    // S1: ein Leser, dessen Rollen-Filter "wurf" durchlässt (die Fernform läse jedes Teil)
    const leck = RUMPF.replace('if (t.rolle !== rolle && t.rolle !== "beide") continue;', 'if (t.rolle !== rolle && t.rolle !== "beide" && t.rolle !== "wurf") continue;');
    const s1 = leck !== RUMPF && kosten(leser(leck), null, true).bruch.some((b) => /wurf-Teile im Fernbild|Teile > 24/.test(b));
    check("SELBSTTEST K: ein Leser, der wurf ins Fernbild lässt, wird rot", s1, leck === RUMPF ? "der Rollen-Filter des Lesers fehlt in der Quelle" : "");
    // S2: 25 Teile "sicht"
    const s2 = kosten(huelleVon, (h) => ({ stufe: 3, teile: h.teile.map((t, i) => (i < 25 ? Object.assign({}, t, { rolle: "sicht" }) : t)) }), true).bruch.some((b) => /Teile > 24/.test(b));
    check("SELBSTTEST K: 25 sicht-Teile werden rot", s2);
    // S3: die Liste ohne ihre wurf-Teile (nur die Fernform wirft)
    const z3 = deckung((h) => ({ stufe: 3, teile: h.teile.filter((t) => t.rolle !== "wurf") }), 0, ["drachentor", "maurentor"]);
    check("SELBSTTEST W: ohne die wurf-Teile fällt die Deckung", z3.some((r) => r.iouMin < SOLL.wurfIou), `min ${Math.min(...z3.map((r) => r.iouMin)).toFixed(3)}`);
    // S4: aufgeblähte Kapseln (+0,15 m)
    const z4 = deckung(null, 0.15, ["geisttor"]);
    check("SELBSTTEST I: aufgeblähte Kapseln stehen aus der L0", z4.some((r) => r.innenP95 > SOLL.innenP95), `max p95 ${(Math.max(...z4.map((r) => r.innenP95)) * 100).toFixed(1)} cm`);
}
console.log(
    fails.length
        ? `\n❌ ROT — ${fails.length} Befund(e): ${fails.join(" · ")}`
        : "\n✅ GRÜN — die Tore werfen aus ihrer NUR-WURF-Stufe (die Hüllen-Liste, N5), die Fernform liest ≤ 24 sicht-Teile ohne ein wurf-Teil, Wurf-Deckung und Innen halten ihr Soll."
);
process.exit(fails.length ? 1 : 0);
