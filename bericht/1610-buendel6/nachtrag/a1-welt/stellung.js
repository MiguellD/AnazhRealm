// A1 als Schalter: die fünf Methoden, die A1 in stamm/11b.js ändert, aus 985a923b (A) bzw. 6df9c3d4 (G) live getauscht
// (werkbank `/methode` mit `quelle`), danach der Spiegel-Pass frisch (st.spiegelPass fällt, die Signatur fällt) und das
// Wasser-Material frisch (`_tiefenKnotenTausch`: Uniform-Werte reisen mit, Szene + Chunk-Wasser umgehängt; der Feld-Pass baut sich
// im nächsten Fern-Ring-Takt neu — beide Seiten zahlen denselben Umbau), die Satz-Ablage `spec.mat` nachgezogen, jede BundleGroup neu.
const A1_METHODEN = ["_wasserBlick", "_spiegelPass", "_spiegelPassWach", "_spiegelPassRechne", "_ensureHydroSurfaceMaterial"];
const ALT = opt("--alt", null),
    NEU = opt("--neu", null);
const stellung = async (s) => {
    const getauscht = [];
    for (const name of A1_METHODEN) {
        const o = await R("/methode", { name, quelle: s === "A" ? ALT : NEU });
        if (!o || o.getauscht !== name) throw new Error(`methode ${name} (${s}): ${JSON.stringify(o).slice(0, 300)}`);
        getauscht.push(name);
    }
    return R("/eval", {
        code:
            `const st = r.state; const P = st.spiegelPass; if (P) { try { P.mat.dispose(); } catch (_e) {} st.spiegelPass = null; }` +
            `const L = st.spiegelLeser; if (L) { L.sig = null; L.an.value = 0; } st.spiegelBruch = false;` +
            `const altMat = st.hydroSurfaceMaterial; const umgehaengt = r._tiefenKnotenTausch(); let spec = 0;` +
            `if (st.chunkSaetze) for (const x of st.chunkSaetze.values()) if (x.spec && x.spec.mat === altMat) { x.spec.mat = st.hydroSurfaceMaterial; spec++; }` +
            `let buendel = 0; st.scene.traverse((o) => { if (o.isBundleGroup) { o.needsUpdate = true; buendel++; } });` +
            `for (let i = 0; i < 30; i++) { window.__wetterHalten && window.__wetterHalten(); r._gameLoopTick(performance.now()); await new Promise((q) => setTimeout(q, 16)); }` +
            `const zaehl = window.__zaehl || (window.__zaehl = (() => { const z = {}; for (const [pre, P] of [["pass.", GPURenderPassEncoder.prototype], ["bündel.", GPURenderBundleEncoder.prototype]]) for (const n of ["draw", "drawIndexed", "drawIndirect", "drawIndexedIndirect", "setBindGroup", "setVertexBuffer", "setIndexBuffer", "setPipeline", "executeBundles"]) { const f = P[n]; if (typeof f !== "function") continue; P[n] = function (...a) { z[pre + n] = (z[pre + n] || 0) + 1; return f.apply(this, a); }; } return z; })());` +
            `for (const k in zaehl) delete zaehl[k]; for (let i = 0; i < 10; i++) { window.__wetterHalten && window.__wetterHalten(); r._gameLoopTick(performance.now()); await new Promise((q) => setTimeout(q, 16)); }` +
            `const jeFrame = {}; for (const [k, v] of Object.entries(zaehl)) jeFrame[k] = +(v / 10).toFixed(1);` +
            `const S = st.spiegelFeld; const Pn = st.spiegelPass;` +
            `return { stellung: "${s}", getauscht: ${JSON.stringify(getauscht)}.length, umgehaengt, spec, buendel,` +
            ` passDa: !!Pn, passIstNeu: !!(Pn && Pn.U && Pn.U.vp), wasserBlickIstNeu: /himmelFarbe/.test(String(r._wasserBlick)),` +
            ` an: L ? L.an.value : null, bruch: !!st.spiegelBruch, wasserImBild: r._spiegelWasserImBild(), feldWasser: S ? S.wasser : null,` +
            ` arenaOhne: null, lager: 0, glieder: 0, fern: 0, jeFrame };`,
    });
};
