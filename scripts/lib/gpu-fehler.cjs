// gpu-fehler.cjs — DIE GPU-FEHLER-LINSE: die WebGPU-Validierung beim NAMEN (ein verworfener Render-Kontext nennt sonst keinen
// Täter). Zwei Augen und die Abgabe (`GPU_ABGABE`):
//   (1) die Device-Wahrheit: `uncapturederror` je GPUDevice — jede Meldung mit dem Pass, der zuletzt begann (Label);
//   (2) die Vorab-Probe je Draw, SYNCHRON (die Device-Meldung kommt asynchron, ohne Objekt): `createRenderPipeline` merkt
//       die Zahl der Vertex-Puffer je Pipeline, `setPipeline`/`setVertexBuffer` die gesetzten Slots je Pass-Encoder, und
//       `draw`/`drawIndexed` vergleicht — fehlt ein Slot, steht der Draw mit Pipeline-Label, Pass-Label, Index-Zahl und dem
//       three-Objekt, das der Renderer gerade zeichnet (`backend.draw` → `renderObject.object`), im Protokoll;
//   (3) DIE ZERSTÖRTE BINDUNG (w25-gpu-wahl): „used in submit while destroyed“ nennt keinen Puffer — der Abgriff stempelt jedes
//       `GPUBuffer.destroy` mit seinem Stapel, merkt je Encoder jeden Puffer, den er bindet (Bindegruppe, Vertex, Index,
//       indirekt, Kopie) samt dem Objekt im Zug, und nennt beim Submit jeden zerstörten (`zerstoert`: Pass, Weg, Objekt,
//       Zerstörer). Befund GTX 8008fbf1: die Liste einer Arena der GPU-Wahl, ersetzt beim Wachsen, band ihr Render-Objekt weiter.
//
// Gebrauch: `page.evaluateOnNewDocument(GPU_FEHLER_INSTALL)` vor jedem Seiten-Skript; nach dem Renderer-Init
// `page.evaluate(GPU_FEHLER_OBJEKT)`; lesen: `window.__gpuFehler` ({device: […], draws: […], geraete: [GPUDevice]}) oder
// `GPU_ABGABE(seite)`.
"use strict";

function gpuFehlerAbgriff() {
    if (typeof GPUDevice === "undefined" || window.__gpuFehler) return;
    const F = (window.__gpuFehler = { device: [], draws: [], pass: null, objekt: null, geraete: [], zerstoert: [] });
    // (3) die zerstörte Bindung: Stempel des Zerstörers, die Puffer je Encoder, das Urteil am Submit
    const stapel = () => new Error().stack.split("\n").slice(2, 8).map((s) => s.trim().replace(/https?:\/\/[^/]+\//, "")).join(" < "); // prettier-ignore
    const zer = GPUBuffer.prototype.destroy;
    GPUBuffer.prototype.destroy = function () {
        this.__zerstoert = stapel();
        return zer.call(this);
    };
    const gruppen = new WeakMap(), genutzt = new WeakMap();
    const cbg = GPUDevice.prototype.createBindGroup;
    GPUDevice.prototype.createBindGroup = function (d) {
        const g = cbg.call(this, d);
        gruppen.set(g, (d.entries || []).map((e) => e.resource && e.resource.buffer).filter(Boolean));
        return g;
    };
    const nutze = (enc, x, weg) => {
        const l = genutzt.get(enc) || (genutzt.set(enc, []), genutzt.get(enc));
        for (const b of x instanceof GPUBuffer ? [x] : gruppen.get(x) || []) if (l.length < 100000) l.push([b, weg, F.objekt]);
    };
    const haken = (K, name, idx, weg) => {
        const f = K.prototype[name];
        K.prototype[name] = function (...a) {
            for (const i of idx) if (a[i]) nutze(this.__encoder || this, a[i], weg);
            return f.apply(this, a);
        };
    };
    for (const [n, K] of [["Render", GPURenderPassEncoder], ["Compute", GPUComputePassEncoder]]) {
        const b = GPUCommandEncoder.prototype["begin" + n + "Pass"];
        GPUCommandEncoder.prototype["begin" + n + "Pass"] = function (...a) {
            return Object.assign(b.apply(this, a), { __encoder: this });
        };
        haken(K, "setBindGroup", [1], n + ":Bindegruppe");
    }
    haken(GPURenderPassEncoder, "setVertexBuffer", [1], "Vertex");
    haken(GPURenderPassEncoder, "setIndexBuffer", [0], "Index");
    haken(GPURenderPassEncoder, "drawIndexedIndirect", [0], "indirekt");
    haken(GPUCommandEncoder, "copyBufferToBuffer", [0, 2], "Kopie");
    const fertigen = GPUCommandEncoder.prototype.finish;
    GPUCommandEncoder.prototype.finish = function (...a) {
        return Object.assign(fertigen.apply(this, a), { __encoder: this, __pass: this.label });
    };
    // jeder Submit zählt an SEINER Queue, bis ihr Gerät ihn abgegeben hat — das Ereignis, an dem `GPU_ABGABE` urteilt
    const sub = GPUQueue.prototype.submit;
    GPUQueue.prototype.submit = function (b) {
        for (const cb of b || [])
            for (const [p, weg, objekt] of genutzt.get(cb.__encoder) || [])
                if (p.__zerstoert)
                    merke(F.zerstoert, { pass: cb.__pass, weg, objekt, groesse: p.size, label: p.label, zerstoerer: p.__zerstoert }); // prettier-ignore
        const r = sub.call(this, b);
        this.__ein = (this.__ein || 0) + 1;
        this.onSubmittedWorkDone().then(() => (this.__ab = (this.__ab || 0) + 1));
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
                    msg: String(ev.error?.message || ev.error).slice(0, 600),
                    pass: F.pass,
                    objekt: F.objekt,
                    t: Math.round(performance.now()),
                })
            );
        } catch {}
        return dev;
    };
    const P = GPUDevice.prototype;
    const crp = P.createRenderPipeline;
    P.createRenderPipeline = function (d) {
        const p = crp.call(this, d);
        try {
            p.__vbN = d?.vertex && Array.isArray(d.vertex.buffers) ? d.vertex.buffers.length : 0;
        } catch {}
        return p;
    };
    const crpa = P.createRenderPipelineAsync;
    if (crpa)
        P.createRenderPipelineAsync = async function (d) {
            const p = await crpa.call(this, d);
            try {
                p.__vbN = d?.vertex && Array.isArray(d.vertex.buffers) ? d.vertex.buffers.length : 0;
            } catch {}
            return p;
        };
    const E = GPUCommandEncoder.prototype;
    const brp = E.beginRenderPass;
    E.beginRenderPass = function (d) {
        F.pass = d?.label || "?";
        const enc = brp.call(this, d);
        enc.__passLabel = F.pass;
        enc.__slots = new Set();
        return enc;
    };
    const crbe = P.createRenderBundleEncoder;
    P.createRenderBundleEncoder = function (d) {
        const enc = crbe.call(this, d);
        enc.__passLabel = "bundle:" + (d?.label || "?") + " in " + F.pass;
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
            if (this.__slots) if (buf) this.__slots.add(slot);
                else this.__slots.delete(slot);
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
    const be = r && st && st.renderer && st.renderer.backend;
    const F = window.__gpuFehler;
    if (!be || !F || be.__gpuFehlerDraw) return !!be?.__gpuFehlerDraw;
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

// DIE ABGABE: `seite` (Page oder Frame) wartet auf ein Bild, die Arbeit jedes Geräts (mit ihr jede Prüfung) und das Bild
// danach, solange ein Gerät Submits von vor der Stufe abgibt; erst `stillMs` ohne Abgabe nennt den Stillstand — jedes Gerät,
// das seine Arbeit hält (ein zweites verdeckt es nie), sonst die Stufe.
async function gpuAbgabe(seite, stillMs = 600000) {
    const lies = (neu) =>
        seite.evaluate(
            async (neu, t) => {
                const F = window.__gpuFehler;
                if (!F) return { fertig: true, msg: [] };
                const G = F.geraete;
                const A = neu ? (F.abgabe = {}) : F.abgabe;
                const stufe = (s) => ((A.s = s), (A.soll = G.map((g) => g.queue.__ein || 0)));
                const bild = (s) => new Promise((r) => (stufe(s), requestAnimationFrame(r)));
                if (neu)
                    A.p = bild("vor")
                        .then(() => (stufe("ab"), Promise.all(G.map((g) => g.queue.onSubmittedWorkDone()))))
                        .then(() => bild("nach"));
                const fertig = await Promise.race([
                    A.p.then(() => true),
                    new Promise((r) => setTimeout(r, 1000, false)),
                ]);
                const offen = A.soll.flatMap((soll, i) => {
                    const ab = G[i].queue.__ab || 0;
                    return ab < soll
                        ? `Gerät ${i + 1} ${G[i].label} gibt ${t} keine Arbeit ab (onSubmittedWorkDone ${ab}/${soll}, ${A.s})`
                        : [];
                });
                const still = offen.length
                    ? offen
                    : `${t} ${{ vor: "kein Bild vor der Abgabe", ab: "keine Abgabe", nach: "kein Bild danach" }[A.s]}`;
                return { fertig, k: A.s + offen, still, msg: F.device.map((e) => e.msg.split("\n")[0]) };
            },
            neu,
            `${stillMs / 1000} s`
        );
    let s = await lies(true);
    for (let k = "", seit = 0; !s.fertig; s = await lies(false))
        if (s.k !== k) [k, seit] = [s.k, Date.now()];
        else if (Date.now() - seit > stillMs) return s.msg.concat(s.still);
    return s.msg;
}

module.exports = {
    GPU_ABGABE: gpuAbgabe,
    GPU_FEHLER_INSTALL: gpuFehlerAbgriff,
    GPU_FEHLER_OBJEKT: gpuFehlerObjekt,
};
