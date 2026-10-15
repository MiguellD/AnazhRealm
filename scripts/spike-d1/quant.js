// D1b-Probe in EINER Welt: die Gestalten des Baum-Wind-Stoffs (Rinde, Laub, Wurf — jede Geometrie, die ein Stoff mit dem
// Knoten `_baumWindKnoten.laub|ast` zeichnet) tragen die Position als snorm16x4 im festen Rahmen ±S m um den Vorlagen-
// Ursprung und die Normale als snorm8x4; EIN Dequant-Knoten (positionGeometry × S) ersetzt jeden Positions-Leser des
// Wind-Graphen (positionLocal und die Welt-Lage der Naht). MODUS (Vorsatz EV_VOR): "an" | "aus".
// Die alten Puffer verlassen die GPU (`_attributes.delete`), die alten Attribute bleiben im JS (für "aus").
const S = 64;
const TSL = T.TSL;
const st = r.state;
const rend = st.renderer;
const be = rend.backend;
const K = r._baumWindKnoten || {};
const D = window.__d1 || (window.__d1 = { an: false });
const gpuB = (a) => {
    const d = be.get(a);
    return d && d.buffer ? d.buffer.size : 0;
};
const matsOf = (o) => (Array.isArray(o.material) ? o.material : [o.material]).filter(Boolean);
const quelleGeo = (o) => (o.__instanzQuelle ? o.__instanzQuelle.geometry : o.geometry);
// alle Geometrien, die die Welt hält: Szene (Zeichner -> Quelle) und der Foundry-Cache (ruhend)
const alleGeos = () => {
    const out = [];
    st.scene.traverse((o) => {
        if (!o.geometry && !o.__instanzQuelle) return;
        out.push({ g: quelleGeo(o), mats: matsOf(o), o });
        if (o.__instanzQuelle && o.geometry) out.push({ g: o.geometry, mats: matsOf(o), o, fassade: true });
    });
    const cache = r._foundry && r._foundry.cache;
    if (cache)
        for (const [, grp] of cache) {
            if (!grp || typeof grp !== "object") continue;
            for (const ch of grp.children || []) out.push({ g: ch.geometry, mats: matsOf(ch), ruhend: true });
            const fl = grp._foundryFlat;
            if (fl && Array.isArray(fl.leaves))
                for (const lf of fl.leaves) {
                    out.push({ g: lf.geom, mats: lf.material ? [lf.material] : [], ruhend: true });
                    out.push({ g: lf._schattenGeom, mats: [], ruhend: true });
                }
        }
    return out.filter((e) => e.g && e.g.attributes);
};
const bundlesNeu = () => {
    let n = 0;
    st.scene.traverse((o) => {
        if (o.isBundleGroup) {
            o.needsUpdate = true;
            n++;
        }
    });
    return n;
};
if (MODUS === "an") {
    if (D.an) return { fehler: "schon an" };
    const alt = new Set([K.laub, K.ast].filter(Boolean));
    if (!alt.size) return { fehler: "kein Baum-Wind-Knoten" };
    // 1) die Attribute der Wind-Gestalten (gezeichnet) und die fremd gezeichneten (Konflikt)
    const geos = alleGeos();
    const wind = new Set(),
        fremd = new Set();
    // DER RAHMEN: eine Geometrie über ±S m (ein Satz in Welt-Lage, kein Vorlagen-Ursprung) bleibt Float32 — und mit ihr
    // jeder Stoff, den sie zeichnet (der Dequant-Knoten hängt am Stoff)
    const passt = (g) => {
        const p = g.attributes.position;
        if (!p || p.array.constructor !== Float32Array) return true;
        for (let i = 0; i < p.array.length; i++) if (Math.abs(p.array[i]) > S) return false;
        return true;
    };
    const sperr = new Set();
    let gesperrtVerts = 0;
    for (const e of geos) {
        if (e.ruhend || e.fassade) continue;
        if (e.mats.some((m) => alt.has(m.positionNode)) && !passt(e.g)) {
            for (const m of e.mats) sperr.add(m);
            gesperrtVerts += e.g.attributes.position ? e.g.attributes.position.count : 0;
        }
    }
    D.sperr = sperr;
    D.gesperrtVerts = gesperrtVerts;
    for (const e of geos) {
        if (e.ruhend || e.fassade) continue;
        const istWind = e.mats.some((m) => alt.has(m.positionNode)) && !e.mats.some((m) => sperr.has(m));
        for (const k of ["position", "normal"]) {
            const a = e.g.attributes[k];
            if (!a || a.isInterleavedBufferAttribute || a.array.constructor !== Float32Array || a.itemSize !== 3) continue;
            (istWind ? wind : fremd).add(a);
        }
    }
    let konflikt = 0;
    for (const a of fremd)
        if (wind.has(a)) {
            wind.delete(a);
            konflikt++;
        }
    // 2) die Grenzen in Metern zuerst (CPU-Leser: Kugel und Box bleiben die des Gesetzes)
    for (const e of geos) {
        const p = e.g.attributes.position;
        if (p && wind.has(p) && !e.fassade) {
            if (!e.g.boundingSphere) e.g.computeBoundingSphere();
            if (!e.g.boundingBox) e.g.computeBoundingBox();
        }
    }
    // 3) packen
    const neu = new Map();
    let maxAbs = 0,
        geklemmt = 0,
        maxFehlerM = 0,
        maxNormGrad = 0,
        nPos = 0,
        nNor = 0,
        altB = 0,
        verts = 0;
    for (const a of wind) altB += gpuB(a);
    const rolle = new Map();
    for (const e of geos)
        for (const k of ["position", "normal"]) {
            const a = e.g.attributes[k];
            if (a && wind.has(a)) rolle.set(a, k);
        }
    for (const a of wind) {
        const n = a.count,
            src = a.array,
            k = rolle.get(a);
        let b;
        if (k === "position") {
            const q = new Int16Array(n * 4);
            for (let v = 0; v < n; v++)
                for (let c = 0; c < 3; c++) {
                    const x = src[v * 3 + c];
                    const ax = Math.abs(x);
                    if (ax > maxAbs) maxAbs = ax;
                    let s = x / S;
                    if (s > 1 || s < -1) {
                        geklemmt++;
                        s = s > 1 ? 1 : -1;
                    }
                    const qi = Math.round(s * 32767);
                    q[v * 4 + c] = qi;
                    const f = Math.abs((qi / 32767) * S - x);
                    if (f > maxFehlerM) maxFehlerM = f;
                }
            b = new T.BufferAttribute(q, 4, true);
            nPos++;
            verts += n;
        } else {
            const q = new Int8Array(n * 4);
            for (let v = 0; v < n; v++) {
                let dot = 0,
                    l2 = 0,
                    m2 = 0;
                for (let c = 0; c < 3; c++) {
                    const x = src[v * 3 + c];
                    const qi = Math.round((x > 1 ? 1 : x < -1 ? -1 : x) * 127);
                    q[v * 4 + c] = qi;
                    dot += x * (qi / 127);
                    l2 += x * x;
                    m2 += (qi / 127) * (qi / 127);
                }
                if (l2 > 1e-12 && m2 > 1e-12) {
                    const w = (Math.acos(Math.min(1, dot / Math.sqrt(l2 * m2))) * 180) / Math.PI;
                    if (w > maxNormGrad) maxNormGrad = w;
                }
            }
            b = new T.BufferAttribute(q, 4, true);
            nNor++;
        }
        b.name = "d1:" + k;
        neu.set(a, b);
    }
    // 4) tauschen in JEDER Geometrie, die eines der Attribute hält (Quelle, Wurf-Zwilling, ruhend)
    const getauscht = [];
    for (const e of geos) {
        if (e.fassade) continue;
        for (const k of ["position", "normal"]) {
            const a = e.g.attributes[k];
            const b = a && neu.get(a);
            if (b) {
                e.g.attributes[k] = b;
                getauscht.push([e.g, k, a]);
            }
        }
    }
    // 5) der EINE Dequant-Knoten im Wind-Graphen (nachgebaut aus `_baumWindStoff`, jede Lage aus pG × S)
    const baue = (laub) => {
        const wu = r._ensureWindCoupling(TSL);
        const WG = globalThis.__phytoCore.WIND_GESETZ;
        const B = r.constructor.WIND_BOE;
        const uB = r._stoffWert(TSL, "userData.windArt", "vec3");
        const A = r.constructor._windTsl(TSL);
        const pG = TSL.positionGeometry.mul(S);
        const Mw = TSL.modelWorldMatrix.mul(r._instanzMatrixNode(TSL));
        const c0 = Mw.element(0).xyz,
            c1 = Mw.element(1).xyz,
            c2 = Mw.element(2).xyz;
        const pW = Mw.mul(TSL.vec4(pG, 1.0)).xyz;
        const ht = uB.x.max(1e-3);
        const H = TSL.attribute("aH0", "float").max(0.5);
        const ort = pW.x.mul(wu.uWindDir.x).add(pW.z.mul(wu.uWindDir.y));
        const g = TSL.sin(wu.uWindTime.mul(B.omega).sub(ort.mul(B.k)))
            .mul(B.amp)
            .add(B.mitte);
        const e = {
            t: wu.uWindTime,
            U: wu.uWindStrength.div(r.constructor.WEATHER_WIND_AMP),
            g,
            f0: uB.y.mul(WG.kF).div(H),
            H,
            zeta: pG.y.div(ht),
            rho: TSL.length(pG.xz).div(ht),
            phi: ort.mul(-B.k),
            psi: pG.x.mul(1.7).add(pG.y.mul(0.9)).add(pG.z.mul(1.3)).div(ht).mul(6.2832),
        };
        const w = globalThis.__phytoCore.windAusschlag(A, e, laub);
        const quer = w.quer.mul(uB.z);
        let off = TSL.vec3(wu.uWindDir.x.mul(quer), w.hoch.mul(uB.z), wu.uWindDir.y.mul(quer));
        if (laub)
            off = off.add(TSL.normalize(Mw.mul(TSL.vec4(TSL.normalLocal, 0.0)).xyz).mul(w.flattern.mul(uB.z)));
        const vor = TSL.vec3(
            c0.dot(off).div(c0.dot(c0).max(1e-12)),
            c1.dot(off).div(c1.dot(c1).max(1e-12)),
            c2.dot(off).div(c2.dot(c2).max(1e-12))
        );
        return pG.add(vor);
    };
    const nk = { laub: K.laub ? baue(true) : null, ast: K.ast ? baue(false) : null };
    const stoffe = new Set();
    for (const e of geos) for (const m of e.mats) if (alt.has(m.positionNode) && !sperr.has(m)) stoffe.add(m);
    if (r._foundryMats)
        for (const m of Object.values(r._foundryMats)) if (m && alt.has(m.positionNode) && !sperr.has(m)) stoffe.add(m);
    const stoffAlt = [];
    for (const m of stoffe) {
        stoffAlt.push([m, m.positionNode]);
        m.positionNode = m.positionNode === K.laub ? nk.laub : nk.ast;
        m.needsUpdate = true;
    }
    // 6) die alten Puffer verlassen die GPU
    let frei = 0;
    for (const a of wind)
        if (rend._attributes && rend._attributes.has(a)) {
            frei += gpuB(a);
            rend._attributes.delete(a);
        }
    D.an = true;
    D.getauscht = getauscht;
    D.stoffAlt = stoffAlt;
    D.neu = neu;
    return {
        S,
        konflikt,
        gesperrtStoffe: sperr.size,
        gesperrtVerts,
        attribute: wind.size,
        nPos,
        nNor,
        verts,
        stoffe: stoffe.size,
        geometrienGetauscht: getauscht.length,
        altMB: +(altB / 1048576).toFixed(2),
        freiMB: +(frei / 1048576).toFixed(2),
        neuMBsoll: +([...neu.values()].reduce((s, b) => s + b.array.byteLength, 0) / 1048576).toFixed(2),
        maxAbsM: +maxAbs.toFixed(2),
        geklemmt,
        maxFehlerMM: +(maxFehlerM * 1000).toFixed(3),
        maxNormGrad: +maxNormGrad.toFixed(3),
        bundles: bundlesNeu(),
    };
}
if (MODUS === "aus") {
    if (!D.an) return { fehler: "nicht an" };
    for (const [g, k, a] of D.getauscht) g.attributes[k] = a;
    for (const [m, pn] of D.stoffAlt) {
        m.positionNode = pn;
        m.needsUpdate = true;
    }
    let frei = 0;
    for (const b of D.neu.values())
        if (rend._attributes && rend._attributes.has(b)) {
            frei += gpuB(b);
            rend._attributes.delete(b);
        }
    D.an = false;
    return { zurueck: D.getauscht.length, stoffe: D.stoffAlt.length, freiMB: +(frei / 1048576).toFixed(2), bundles: bundlesNeu() };
}
if (MODUS === "neuB") {
    // die GPU-Bytes der neuen Attribute (nach einem Frame hochgeladen)
    let b = 0,
        n = 0;
    for (const x of D.neu ? D.neu.values() : []) {
        const s = gpuB(x);
        if (s) {
            b += s;
            n++;
        }
    }
    return { an: D.an, neuGpuMB: +(b / 1048576).toFixed(2), n };
}
return { fehler: "MODUS?" };
