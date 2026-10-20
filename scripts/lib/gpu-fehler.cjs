// gpu-fehler.cjs — DIE GPU-FEHLER-LINSE: die WebGPU-Validierung beim NAMEN (ein verworfener Render-Kontext nennt sonst keinen
// Täter). Zwei Augen und die Abgabe (`GPU_ABGABE`):
//   (1) die Device-Wahrheit: `uncapturederror` je GPUDevice — jede Meldung mit dem Pass, der zuletzt begann (Label);
//   (2) die Vorab-Probe je Draw, SYNCHRON (die Device-Meldung kommt asynchron, ohne Objekt): `createRenderPipeline` merkt
//       die Zahl der Vertex-Puffer je Pipeline, `setPipeline`/`setVertexBuffer` die gesetzten Slots je Pass-Encoder, und
//       `draw`/`drawIndexed` vergleicht — fehlt ein Slot, steht der Draw mit Pipeline-Label, Pass-Label, Index-Zahl und dem
//       three-Objekt, das der Renderer gerade zeichnet (`backend.draw` → `renderObject.object`), im Protokoll.
//
// Gebrauch: `page.evaluateOnNewDocument(GPU_FEHLER_INSTALL)` vor jedem Seiten-Skript; nach dem Renderer-Init
// `page.evaluate(GPU_FEHLER_OBJEKT)`; lesen: `window.__gpuFehler` ({device: […], draws: […], geraete: [GPUDevice]}) oder
// `GPU_ABGABE(seite)`.
"use strict";

function gpuFehlerAbgriff() {
    if (typeof GPUDevice === "undefined" || window.__gpuFehler) return;
    const F = (window.__gpuFehler = { device: [], draws: [], pass: null, objekt: null, geraete: [], ein: 0, ab: 0 });
    // jeder Submit zählt, bis sein Gerät ihn abgegeben hat — das Ereignis, an dem `GPU_ABGABE` urteilt
    const sub = GPUQueue.prototype.submit;
    GPUQueue.prototype.submit = function (b) {
        F.ein++;
        const r = sub.call(this, b);
        this.onSubmittedWorkDone().then(() => F.ab++);
        return r;
    };
    const merke = (liste, e) => {
        if (liste.length < 200) liste.push(e);
    };
    const A = GPUAdapter.prototype;
    const rd = A.requestDevice;
    A.requestDevice = async function (d) {
        const dev = await rd.call(this, d);
        F.geraete.push(dev); // wer urteilt, wartet auf die Arbeit jedes Geräts (`queue.onSubmittedWorkDone`) — und mit ihr auf ihre Prüfung
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

// DIE ABGABE (K6): nach einem Bild wartet `seite` (Page oder Frame), bis jedes Gerät seine Arbeit abgegeben hat — und mit ihr
// jede Prüfung, die einen Befehl verwarf. Die Uhr ist die Abgabe, nie die Sekunde des Läufers (swiftshader gab dort 30 s
// nichts ab): gewartet wird, solange frühere Submits abgegeben werden; erst `stillMs` ohne eine Abgabe nennt den Stillstand
// beim Namen. → die Meldungen der Geräte
async function gpuAbgabe(seite, stillMs = 600000) {
    const lies = (neu) =>
        seite.evaluate(async (neu) => {
            const F = window.__gpuFehler;
            if (!F) return { fertig: true, msg: [] };
            const bild = () => new Promise((r) => requestAnimationFrame(r));
            if (neu) F.abgabe = bild().then(() => Promise.all(F.geraete.map((g) => g.queue.onSubmittedWorkDone()))).then(bild);
            const fertig = await Promise.race([F.abgabe.then(() => true), new Promise((r) => setTimeout(r, 1000, false))]);
            return { fertig, ab: F.ab, ein: F.ein, msg: F.device.map((e) => e.msg.split("\n")[0]) };
        }, neu);
    let s = await lies(true);
    for (let ab = -1, seit = 0; !s.fertig; s = await lies(false))
        if (s.ab !== ab) [ab, seit] = [s.ab, Date.now()];
        else if (Date.now() - seit > stillMs)
            return s.msg.concat(`ein Gerät gibt ${stillMs / 1000} s keine Arbeit ab (onSubmittedWorkDone, abgegeben ${s.ab} von ${s.ein} Submits)`);
    return s.msg;
}

module.exports = {
    GPU_ABGABE: gpuAbgabe,
    GPU_FEHLER_INSTALL: gpuFehlerAbgriff,
    GPU_FEHLER_OBJEKT: gpuFehlerObjekt,
};
