// gpu-fehler.cjs — DIE GPU-FEHLER-LINSE (Welle L, Befund V-D7): die WebGPU-Validierung beim NAMEN. Befund 06.10. (sichtbar
// gespielt, Radeon 890M): EIN Ereignis, zwei Warnungen — „Vertex buffer slot 4 required by renderPipeline_MeshStandard-
// NodeMaterial_77 was not set … DrawIndexed(1087932, …)" und „Invalid CommandBuffer from CommandEncoder renderContext_4": ein
// ganzer Render-Kontext eines Frames verworfen; der Täter war nicht isoliert (Verdacht: der Boden-Satz, 5 Attribute).
//
// Zwei Augen:
//   (1) die Device-Wahrheit: `uncapturederror` je GPUDevice — jede Meldung mit dem Pass, der zuletzt begann (Label);
//   (2) die Vorab-Probe je Draw, SYNCHRON (die Device-Meldung kommt asynchron, ohne Objekt): `createRenderPipeline` merkt
//       die Zahl der Vertex-Puffer je Pipeline, `setPipeline`/`setVertexBuffer` die gesetzten Slots je Pass-Encoder, und
//       `draw`/`drawIndexed` vergleicht — fehlt ein Slot, steht der Draw mit Pipeline-Label, Pass-Label, Index-Zahl und dem
//       three-Objekt, das der Renderer gerade zeichnet (`backend.draw` → `renderObject.object`), im Protokoll.
//
// Gebrauch: `page.evaluateOnNewDocument(GPU_FEHLER_INSTALL)` vor jedem Seiten-Skript; nach dem Renderer-Init
// `page.evaluate(GPU_FEHLER_OBJEKT)`; lesen: `window.__gpuFehler` ({device: […], draws: […]}).
"use strict";

function gpuFehlerAbgriff() {
    if (typeof GPUDevice === "undefined" || window.__gpuFehler) return;
    const F = (window.__gpuFehler = { device: [], draws: [], pass: null, objekt: null });
    const merke = (liste, e) => {
        if (liste.length < 200) liste.push(e);
    };
    const A = GPUAdapter.prototype;
    const rd = A.requestDevice;
    A.requestDevice = async function (d) {
        const dev = await rd.call(this, d);
        try {
            dev.addEventListener("uncapturederror", (ev) =>
                merke(F.device, {
                    msg: String((ev.error && ev.error.message) || ev.error).slice(0, 600),
                    pass: F.pass,
                    objekt: F.objekt,
                    t: Math.round(performance.now()),
                })
            );
        } catch (_e) {}
        return dev;
    };
    const P = GPUDevice.prototype;
    const crp = P.createRenderPipeline;
    P.createRenderPipeline = function (d) {
        const p = crp.call(this, d);
        try {
            p.__vbN = d && d.vertex && Array.isArray(d.vertex.buffers) ? d.vertex.buffers.length : 0;
        } catch (_e) {}
        return p;
    };
    const crpa = P.createRenderPipelineAsync;
    if (crpa)
        P.createRenderPipelineAsync = async function (d) {
            const p = await crpa.call(this, d);
            try {
                p.__vbN = d && d.vertex && Array.isArray(d.vertex.buffers) ? d.vertex.buffers.length : 0;
            } catch (_e) {}
            return p;
        };
    const E = GPUCommandEncoder.prototype;
    const brp = E.beginRenderPass;
    E.beginRenderPass = function (d) {
        F.pass = (d && d.label) || "?";
        const enc = brp.call(this, d);
        enc.__passLabel = F.pass;
        enc.__slots = new Set();
        return enc;
    };
    const crbe = P.createRenderBundleEncoder;
    P.createRenderBundleEncoder = function (d) {
        const enc = crbe.call(this, d);
        enc.__passLabel = "bundle:" + ((d && d.label) || "?") + " in " + F.pass;
        enc.__slots = new Set();
        return enc;
    };
    const pruefe = (enc, art, n) => {
        const p = enc.__pipe;
        if (!p || !Number.isInteger(p.__vbN) || !enc.__slots) return;
        const fehlt = [];
        for (let s = 0; s < p.__vbN; s++) if (!enc.__slots.has(s)) fehlt.push(s);
        if (fehlt.length)
            merke(F.draws, {
                art,
                n,
                fehlt,
                pipeline: p.label || "?",
                pass: enc.__passLabel,
                objekt: F.objekt,
                t: Math.round(performance.now()),
            });
    };
    // Pass-Encoder UND Bundle-Encoder tragen dieselbe Probe.
    for (const R of [GPURenderPassEncoder.prototype, GPURenderBundleEncoder.prototype]) {
        const sp = R.setPipeline;
        R.setPipeline = function (p) {
            this.__pipe = p;
            return sp.call(this, p);
        };
        const svb = R.setVertexBuffer;
        R.setVertexBuffer = function (slot, buf, off, size) {
            if (this.__slots) {
                if (buf) this.__slots.add(slot);
                else this.__slots.delete(slot);
            }
            return svb.call(this, slot, buf, off, size);
        };
        const di = R.drawIndexed;
        R.drawIndexed = function (n, ...rest) {
            pruefe(this, "drawIndexed", n);
            return di.call(this, n, ...rest);
        };
        const dr = R.draw;
        R.draw = function (n, ...rest) {
            pruefe(this, "draw", n);
            return dr.call(this, n, ...rest);
        };
    }
}

// Nach dem Renderer-Init: der Name des three-Objekts, das der Backend-Draw gerade zeichnet (Bundles zeichnen beim
// Aufnehmen über dieselbe Stelle).
function gpuFehlerObjekt() {
    const r = window.anazhRealm;
    const be = r && r.state && r.state.renderer && r.state.renderer.backend;
    const F = window.__gpuFehler;
    if (!be || !F || be.__gpuFehlerDraw) return !!(be && be.__gpuFehlerDraw);
    const d = be.draw;
    be.draw = function (ro, info) {
        const o = ro && ro.object;
        F.objekt = o
            ? [o.name || o.type, o.userData && (o.userData.inventar || o.userData.chunkSatz || o.userData.__klasse)]
                  .filter(Boolean)
                  .join("|")
            : null;
        return d.call(this, ro, info);
    };
    be.__gpuFehlerDraw = true;
    return true;
}

module.exports = {
    GPU_FEHLER_INSTALL: gpuFehlerAbgriff,
    GPU_FEHLER_OBJEKT: gpuFehlerObjekt,
};
