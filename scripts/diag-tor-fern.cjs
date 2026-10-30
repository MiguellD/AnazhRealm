#!/usr/bin/env node
// diag-tor-fern.cjs — DIE LINSE DES TOR-WURFS UND DER TOR-FERNFORM (1110-9, gate:tor-fern). Der Akt: die NUR-WURF-Stufe
// 3 ist die Hüllen-Liste des Tors (porta-core `huelle`, N5), gesammelt im SELBEN Lauf von buildGate, der die Meshes
// baut; die feinen Teile tragen die Rolle "wurf" (nur die Stufe 3 wirft sie), die Fernform des Welt-March liest
// höchstens 24 Teile der Rolle "sicht" (der Rahmen-Strang der innersten Ordnung und der Sockel — der March läuft je
// Pixel über alle Teile seines Eintrags). Die Linse misst je Rezept (7) und — für die Kosten — über die Regler-Hülle (7
// Rezepte × 27 Regler × Rand), direkt am Gesetzbuch (Node, worlds/terrain/lib/three-r128.min.js + porta-core.js) und
// mit dem EINEN Leser des Stamms (`_huelleVon` aus dem Stamm):
//
//   K  FERNBILD: die Fernform (`_huelleVon(…, "sicht")`) trägt ≤ 24 Teile und KEIN "wurf"-Teil (je Bau der Regler-Hülle);
//      die Kosten der Stufe 3 (Zeile und Draw je Rezept und Rand) richtet gate:regler-wirkt STUFEN über die echte Brücke
//   W  WURF-DECKUNG: die Stufe 3 gegen die L0 — IoU der Schatten-Fußabdrücke (Projektion entlang der Sonne auf y = 0, Raster
//      5 cm) unter zwölf Sonnen (25° · 40° · 60° · 74° Höhe × drei Azimute) — die L0 mit den Teilen, die sie wirft (castShadow:
//      die leuchtenden Türen, der Bogen-Saum, der Leucht-Ring und die Scheibe warfen nie)
//   I  INNEN: die Stufe 3 steht nicht aus dem Gezeichneten — je Ecke ihres Gitters der Abstand zur L0-Oberfläche (Proben: jede
//      L0-Fläche bis 8 cm unterteilt), p95 ≤ Soll (der Tiefen-Bias der nahen Kaskade, 0,75 Texel ≈ 5–13 cm, trägt den Rest)
//
// SELBSTTEST (--selftest, im Lauf, an den Rezepten): ein Leser, der "wurf" ins Fernbild lässt, MUSS in K rot werden; 25 Teile
// "sicht" in K; eine Liste ohne ihre wurf-Teile in W (drachentor, maurentor); aufgeblähte Kapseln (+0,15 m) in I (geisttor).
//   node scripts/diag-tor-fern.cjs [--selftest] [--nur <regex>]
"use strict";

const { studioKern, pruefer, ROOT: root, stammLib } = require("./lib/welt-boot.cjs");
const { rasterDreieck } = require("./lib/kronen-linse.cjs");
const PC = studioKern("porta-core.js", "__portaCore");
const ARG = process.argv;
const SELBST = ARG.includes("--selftest");
const NUR = ARG.indexOf("--nur") >= 0 ? new RegExp(ARG[ARG.indexOf("--nur") + 1]) : null;

// DAS SOLL: Wurf-IoU min 0,864 (geisttor: der dünne Monolith-Rahmen und die Hölzer der
// Tür unter tiefer Sonne) · Median der Rezepte 0,958 → je Rezept ≥ 0,85, Median ≥ 0,92 (das Maß der Haus-Linse). Innen p95
// 5,8–9,1 cm (die Hülle des Geflechts über den Lücken der Stränge, die Kästen gedrehter Steine — kathedrale 8,9 —, der
// Fern-Strang der Ruine über ihren fehlenden Steinen — 9,1) → ≤ 10 cm; der Tiefen-Bias der nahen Kaskade trägt 5–13 cm.
const SOLL = { fernTeile: 24, wurfIou: 0.85, wurfMedian: 0.92, innenP95: 0.1 };

// ── DER EINE LESER DES STAMMS: `AnazhRealm._huelleVon` aus der Quelle (die Fernform liest, was er liest) ──
const STAMM = stammLib.text(root);
// die Methode am NAMEN (gate:apparat Klinge 3): Rumpf und Parameter liest die Probe aus dem Kopf, nie eine eigene Liste
function methodeAus(src, name) {
    const i = stammLib.kopf(src, name);
    if (i < 0) throw new Error("im Stamm nicht gefunden: " + name);
    const p = src.indexOf("(", i);
    const args = src.slice(p + 1, src.indexOf(")", p));
    return { args, rumpf: stammLib.rumpf(src, name).slice(1, -1) }; // der EINE Rumpf-Schneider (scripts/lib/stamm.cjs)
}
const KEIL_TYP = (() => {
    const m = stammLib.treffer(STAMM, null, /AnazhRealm\.HUELLE_KEIL_TYP = Object\.freeze\((\{[^}]*\})\)/);
    return m ? Function("return " + m[1])() : {};
})();
function leser(rumpf) {
    const stub = {
        HUELLE_KEIL_TYP: KEIL_TYP,
        _kernPflichtBruch: (q) => {
            throw new Error("KERN-PFLICHT " + q);
        },
    };
    return Function("AnazhRealm", "return function _huelleVon(" + HUELLE.args + ") {" + rumpf + "};")(stub);
}
const HUELLE = methodeAus(STAMM, "_huelleVon");
const RUMPF = HUELLE.rumpf;
const huelleVon = leser(RUMPF);

// ── Fußabdruck entlang der Sonne (Raster 5 cm) ──
const RASTER = 0.05;
function dreiecke(g, nurWerfer) {
    const out = [],
        v = new THREE.Vector3();
    g.updateMatrixWorld(true);
    g.traverse((o) => {
        // die L0 wirft, was castShadow trägt (der Wirt: leaf.castShadow = castsShadow && child.castShadow !== false)
        if (!o.isMesh || (nurWerfer && !o.castShadow)) return;
        const P = o.geometry.attributes.position,
            I = o.geometry.index,
            n = I ? I.count : P.count;
        for (let i = 0; i < n; i++) {
            v.fromBufferAttribute(P, I ? I.getX(i) : i).applyMatrix4(o.matrixWorld);
            out.push(v.x, v.y, v.z);
        }
    });
    return out;
}
function abdruck(D, d, box) {
    const nu = Math.ceil((box.u1 - box.u0) / RASTER),
        nv = Math.ceil((box.v1 - box.v0) / RASTER),
        m = new Uint8Array(nu * nv);
    const pr = (x, y, z) => {
        const t = Math.max(0, y) / d[1];
        return [x - d[0] * t, z - d[2] * t];
    };
    const R = { u0: box.u0, v0: box.v0, r: RASTER, nu, nv };
    for (let i = 0; i < D.length; i += 9) {
        const [a, b, c] = [0, 3, 6].map((j) => pr(D[i + j], D[i + j + 1], D[i + j + 2]));
        rasterDreieck(...a, ...b, ...c, R, (o) => (m[o] = 1), 1e-9);
    }
    return m;
}
const SONNEN = [];
for (const h of [25, 40, 60, 74])
    for (const az of [0, 120, 240]) {
        const e = (h * Math.PI) / 180,
            a = (az * Math.PI) / 180;
        SONNEN.push([Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)]);
    }
function wurfDeckung(L0, W) {
    const ious = [];
    for (const d of SONNEN) {
        let u0 = 1e9,
            u1 = -1e9,
            v0 = 1e9,
            v1 = -1e9;
        for (const D of [L0, W])
            for (let i = 0; i < D.length; i += 3) {
                const t = Math.max(0, D[i + 1]) / d[1],
                    u = D[i] - d[0] * t,
                    v = D[i + 2] - d[2] * t;
                u0 = Math.min(u0, u);
                u1 = Math.max(u1, u);
                v0 = Math.min(v0, v);
                v1 = Math.max(v1, v);
            }
        const box = { u0: u0 - 0.2, u1: u1 + 0.2, v0: v0 - 0.2, v1: v1 + 0.2 };
        const a = abdruck(L0, d, box),
            b = abdruck(W, d, box);
        let s = 0,
            v = 0;
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
    const H = new Map(),
        v = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    const rein = (x, y, z) => {
        const k = Math.floor(x / ZELLE) + "," + Math.floor(y / ZELLE) + "," + Math.floor(z / ZELLE);
        let a = H.get(k);
        if (!a) H.set(k, (a = []));
        if (a.length < 60) a.push(x, y, z);
    };
    const tei = (a, b, c, d) => {
        if (Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)) < 0.08 || d > 6) {
            rein(a.x, a.y, a.z);
            rein(b.x, b.y, b.z);
            rein(c.x, c.y, c.z);
            rein((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3);
            return;
        }
        const ab = a.clone().add(b).multiplyScalar(0.5),
            bc = b.clone().add(c).multiplyScalar(0.5),
            ca = c.clone().add(a).multiplyScalar(0.5);
        tei(a, ab, ca, d + 1);
        tei(ab, b, bc, d + 1);
        tei(ca, bc, c, d + 1);
        tei(ab, bc, ca, d + 1);
    };
    g.updateMatrixWorld(true);
    g.traverse((o) => {
        if (!o.isMesh || o.geometry.type === "CircleGeometry") return;
        const P = o.geometry.attributes.position,
            I = o.geometry.index,
            n = I ? I.count : P.count;
        for (let i = 0; i < n; i += 3) {
            for (let k = 0; k < 3; k++)
                v[k].fromBufferAttribute(P, I ? I.getX(i + k) : i + k).applyMatrix4(o.matrixWorld);
            tei(v[0].clone(), v[1].clone(), v[2].clone(), 0);
        }
    });
    return H;
}
function abstand(H, x, y, z) {
    const cx = Math.floor(x / ZELLE),
        cy = Math.floor(y / ZELLE),
        cz = Math.floor(z / ZELLE);
    let best = Infinity;
    for (let r = 0; r <= 3 && best > r * ZELLE; r++)
        for (let dx = -r; dx <= r; dx++)
            for (let dy = -r; dy <= r; dy++)
                for (let dz = -r; dz <= r; dz++) {
                    if (Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) !== r) continue;
                    const a = H.get(cx + dx + "," + (cy + dy) + "," + (cz + dz));
                    if (!a) continue;
                    for (let i = 0; i < a.length; i += 3)
                        best = Math.min(best, Math.hypot(a[i] - x, a[i + 1] - y, a[i + 2] - z));
                }
    return best;
}
function innenP95(L0g, W) {
    const H = oberflaeche(L0g),
        D = [];
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

// ── K über die Regler-Hülle ──
function kosten(leserFn, umbau, nurRezepte) {
    const bruch = [];
    let maxSicht = 0;
    for (const id of Object.keys(PC.PRESETS)) {
        if (NUR && !NUR.test(id)) continue;
        const raender = [null];
        if (!nurRezepte) for (const z of PC.PARAMS_BY_KIND.gate) raender.push([z.id, z.min], [z.id, z.max]);
        for (const r of raender) {
            const ov = r ? { [r[0]]: r[1] } : undefined,
                wo = id + (r ? " " + r[0] + "=" + r[1] : "");
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
        }
    }
    return { bruch, maxSicht };
}

// ── W und I je Rezept ──
function deckung(umbauListe, aufblaehen, nurIds) {
    const zeilen = [];
    for (const id of Object.keys(PC.PRESETS)) {
        if ((NUR && !NUR.test(id)) || (nurIds && !nurIds.includes(id))) continue;
        const L0g = PC.buildInstance(id, 7, 0),
            L0 = dreiecke(L0g, true);
        let g3 = PC.buildInstance(id, 7, 3);
        if (umbauListe || aufblaehen) {
            let h = PC.huelle(id, 7);
            if (umbauListe) h = umbauListe(h);
            if (aufblaehen)
                h = {
                    stufe: 3,
                    teile: h.teile.map((t) => (t.art === "kapsel" ? Object.assign({}, t, { r: t.r + aufblaehen }) : t)),
                };
            g3 = PC.huelleGruppe(h.teile);
        }
        const W = gitterDreiecke(g3);
        const w = wurfDeckung(L0, W),
            i95 = innenP95(L0g, W);
        zeilen.push({ id, iouMin: w.min, iouMedian: w.median, innenP95: i95 });
    }
    return zeilen;
}

// ── F: DIE FERNE STUFE — was der Wirt jenseits der Ring-Mitte zeigt, trägt das Soll der Klasse, und nur L0-Stoff ──
// Die Stufe bei d liest der EINE Wähler des Wirts (`_stufeNachGrenzen` aus dem Stamm, ohne Zustand wie am Spawn) über den
// Grenzen des Gesetzes des Schirms (`_wechselGesetz` am Schirm des Solls, das Buch nach dem Umschlag; `hyst` der Budget-Zeile;
// die gezeigten Stufen, nie die NUR-WURF-Stufe — `_archStufenGrenzen`, lod.K5).
// DAS SOLL DER KLASSE: ≤ 120 000 Dreiecke an Genesis Third. Gemessen an Genesis Third (werkbank
// zaehlen, Rohdatei artifacts/profiband/tore-fern/k64/zaehlen-genesis-third-nachher.json im Arbeits-Klon) stehen dort fest: das
// Nahe in der Stufe 0 (drachentor 23 192 + Flügel 8 984, geisttor 2 726 + Flügel 4 360 + Wurf 2 132 = 41 394), verkalkt im
// Hysterese-Band in der Stufe 1 (23 082), der Wurf der Stufe 3 (19 248) und der Wurf der fernen Stufe (kathedrale + ruine
// 4 814) — 88 538. Fern jenseits 12 m stehen fünf Tore (maurentor, die Portale-Vorschau als drachentor, maschine, kathedrale,
// ruine): ihre Summe trägt den Rest 31 462. Die Linse rechnet die SUMME der fünf (nie ein Mittel über eine angenommene Zahl).
// Stoff-Treue: jede Fläche einer gezeigten fernen Stufe trägt einen Stoff ihrer L0 (Typ, Farbe, Glut, Metall, Rauheit,
// Deckkraft gleich) — keine Fläche heller als ihr L0-Stoff, die Albedo der Fernstufe IST die der L0.
const FERN = {
    dM: [13, 15, 17],
    klasse: 120000,
    fest: 41394 + 23082 + 19248 + 4814,
    genesisThird: ["maurentor", "drachentor", "maschine", "kathedrale", "ruine"],
};
FERN.rest = FERN.klasse - FERN.fest;
const STUFE_NACH_GRENZEN = Function(
    "return function _stufeNachGrenzen(d, cur, G, s) {" +
        methodeAus(STAMM, "_stufeNachGrenzen").rumpf +
        "};"
)();
const WIRT = (() => {
    const { AnazhRealm: A, ctx } = stammLib.ladeKlasse(root);
    const rc = require("./lib/asset-worker-harness.cjs").kanalImVm()({ type: "get-book" }).renderConfig;
    ctx.__phytoCore.kerneVereinen(rc);
    A._studioRenderConfig = rc;
    return A;
})();
function stufeBei(K, d) {
    const art = K.PORTAL_RENDER_CONFIG.lod.budget.gate,
        S = K.PORTAL_RENDER_CONFIG.lod.kindStages.gate;
    const grenzen = S.slice(1)
        .filter((st) => art[st] && art[st].nurWurf !== true)
        .map((st) => ({ stufe: st, ab: WIRT._wechselGesetz("gate", st, 1, 0) }));
    return STUFE_NACH_GRENZEN(d, undefined, { erste: S[0], grenzen, h: art.hyst }, 1);
}
const stoffKey = (m) =>
    [
        m.type,
        m.color ? m.color.getHexString() : "-",
        m.emissive ? m.emissive.getHexString() : "-",
        m.emissiveIntensity,
        m.metalness,
        m.roughness,
        m.transparent ? m.opacity : 1,
    ].join("|");
function stoffe(g) {
    const s = new Set();
    g.traverse((o) => {
        if (o.isMesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) s.add(stoffKey(m));
    });
    return s;
}
function fernStufe(K, verfaelsche) {
    const bruch = [],
        ist = [];
    let maxT = 0,
        summe = 0;
    const st13 = stufeBei(K, FERN.dM[0]),
        zeile = K.PORTAL_RENDER_CONFIG.lod.budget.gate[st13];
    for (const id of Object.keys(K.PRESETS)) {
        if (NUR && !NUR.test(id)) continue;
        const L0 = stoffe(K.buildInstance(id, 7, 0));
        for (const d of FERN.dM) {
            const st = stufeBei(K, d),
                g = K.buildInstance(id, 7, st);
            if (verfaelsche) verfaelsche(g);
            const n = tris(g);
            maxT = Math.max(maxT, n);
            if (d === FERN.dM[0]) {
                ist.push(`${id} L${st} ${n}`);
                if (FERN.genesisThird.includes(id)) summe += n;
            }
            if (zeile && n > zeile.tris)
                bruch.push(`${id} bei ${d} m Stufe ${st}: ${n} Dreiecke > Zeile ${zeile.tris}`);
            for (const k of stoffe(g)) if (!L0.has(k)) bruch.push(`${id} Stufe ${st}: Stoff ${k} nicht in der L0`);
        }
    }
    if (!NUR && summe > FERN.rest)
        bruch.push(
            `Genesis Third fern (${FERN.genesisThird.join(" · ")}) Stufe ${st13}: ${summe} Dreiecke > Rest ${FERN.rest} (Klasse ${FERN.fest + summe} > ${FERN.klasse})`
        );
    return { bruch: [...new Set(bruch)], ist, maxT, summe };
}
const { errs: fails, check, wandEnde } = pruefer();
console.log(`=== TOR-FERN (1110-9) — NUR-WURF-Stufe 3 und Fernform der Tore (porta-core huelle) ===`);
const k = kosten(huelleVon);
check(
    `K FERNBILD: ≤ ${SOLL.fernTeile} Teile ohne wurf-Teil (Regler-Hülle; die Kosten der Stufe 3 richtet gate:regler-wirkt STUFEN)`,
    k.bruch.length === 0,
    k.bruch.length ? k.bruch.slice(0, 4).join(" · ") : `Fernbild max ${k.maxSicht} Teile`
);
const z = deckung(null, 0);
const med = [...z.map((r) => r.iouMedian)].sort((a, b) => a - b)[z.length >> 1];
for (const r of z)
    console.log(
        `     ${r.id.padEnd(11)} Wurf-IoU min ${r.iouMin.toFixed(3)} · Median ${r.iouMedian.toFixed(3)} · innen p95 ${(r.innenP95 * 100).toFixed(1)} cm`
    );
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
const f = fernStufe(PC);
check(
    `F FERNE STUFE: Genesis Third — die fünf fernen Tore ≤ ${FERN.rest} Dreiecke (Klasse ≤ ${FERN.klasse}), jede Fläche ein Stoff der L0`,
    f.bruch.length === 0,
    f.bruch.length
        ? f.bruch.slice(0, 6).join(" · ")
        : `Summe ${f.summe} (Klasse ${FERN.fest + f.summe}) · bei ${FERN.dM[0]} m: ${f.ist.join(" · ")}`
);
if (SELBST) {
    // S5: die Stufe 2 mit dem Gesetz der Stufe 1 — die Linse nennt die Tore beim Namen
    const K5 = Object.assign({}, PC, { buildInstance: (id, sd, lod, ov) => PC.buildInstance(id, sd, lod === 2 ? 1 : lod, ov) });
    const f5 = fernStufe(K5);
    check(
        "SELBSTTEST F: die Stufe 2 mit dem Gesetz der Stufe 1 wird rot beim Namen",
        f5.bruch.some((b) => /drachentor bei 13 m Stufe 2: \d+ Dreiecke/.test(b)) &&
            f5.bruch.some((b) => /^Genesis Third fern .* Stufe 2: \d+ Dreiecke > Rest/.test(b)),
        f5.bruch[0] || ""
    );
    // S6: ein Stoff der fernen Stufe heller als sein L0-Stoff
    const f6 = fernStufe(PC, (g) =>
        g.traverse((o) => {
            if (o.isMesh && o.material.color && !o.userData.__k64) {
                o.material = o.material.clone();
                o.material.color.multiplyScalar(1.2);
                o.userData.__k64 = 1;
            }
        })
    );
    check(
        "SELBSTTEST F: ein aufgehellter Stoff der fernen Stufe wird rot",
        f6.bruch.some((b) => /nicht in der L0/.test(b)),
        f6.bruch.find((b) => /nicht in der L0/.test(b)) || ""
    );
    // S1: ein Leser, dessen Rollen-Filter "wurf" durchlässt (die Fernform läse jedes Teil)
    const leck = (h, rolle, q) => huelleVon(h, rolle, q).concat(h.teile.filter((t) => t.rolle === "wurf"));
    const s1 = kosten(leck, null, true).bruch.some((b) => /wurf-Teile im Fernbild|Teile > 24/.test(b));
    check(
        "SELBSTTEST K: ein Leser, der wurf ins Fernbild lässt, wird rot",
        s1,
        ""
    );
    // S2: 25 Teile "sicht"
    const s2 = kosten(
        huelleVon,
        (h) => ({ stufe: 3, teile: h.teile.map((t, i) => (i < 25 ? Object.assign({}, t, { rolle: "sicht" }) : t)) }),
        true
    ).bruch.some((b) => /Teile > 24/.test(b));
    check("SELBSTTEST K: 25 sicht-Teile werden rot", s2);
    // S3: die Liste ohne ihre wurf-Teile (nur die Fernform wirft)
    const z3 = deckung((h) => ({ stufe: 3, teile: h.teile.filter((t) => t.rolle !== "wurf") }), 0, [
        "drachentor",
        "maurentor",
    ]);
    check(
        "SELBSTTEST W: ohne die wurf-Teile fällt die Deckung",
        z3.some((r) => r.iouMin < SOLL.wurfIou),
        `min ${Math.min(...z3.map((r) => r.iouMin)).toFixed(3)}`
    );
    // S4: aufgeblähte Kapseln (+0,15 m)
    const z4 = deckung(null, 0.15, ["geisttor"]);
    check(
        "SELBSTTEST I: aufgeblähte Kapseln stehen aus der L0",
        z4.some((r) => r.innenP95 > SOLL.innenP95),
        `max p95 ${(Math.max(...z4.map((r) => r.innenP95)) * 100).toFixed(1)} cm`
    );
}
wandEnde(fails, "die Tore werfen aus ihrer NUR-WURF-Stufe (die Hüllen-Liste, N5), die Fernform liest ≤ 24 sicht-Teile ohne ein wurf-Teil, Wurf-Deckung und Innen halten ihr Soll.");
