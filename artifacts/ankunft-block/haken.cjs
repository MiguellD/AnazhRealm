// MESS-VEHIKEL w25-ankunft-block (nur WIP, fällt vor der Abgabe; Kopie aus w23-ankunft-faden): `node -r ./artifacts/ankunft-block/haken.cjs scripts/diag-boot-stage.cjs …`
// hängt an jede Seite der Kalt-Zeile den Bau-Haken: jeder Knoten-Bau (r184 `Nodes.getForRender` ohne Stand, der Bau in Raten
// `_knotenRate`, der Abschluss `_createNodeBuilderState` mit der Länge seines Codes) als Ereignis [t, ms, Stoff, Art, Länge, Szene]
// in `window.__kalt.bau` — die Kalt-Zeile legt `__kalt` ins JSON.
"use strict";
const path = require("path");
const wb = require(path.resolve("scripts/lib/welt-boot.cjs"));

function BAU_HAKEN() {
    const ev = [];
    const buch = () => window.__kalt && (window.__kalt.bau = ev);
    const szene = (s) => {
        const r = window.anazhRealm;
        if (!r || !s) return "?";
        if (s === r.state.scene) return "W";
        if (s === r._buehneJetzt) return "B";
        if (r._karteBuehneSatz && s === r._karteBuehneSatz.szene) return "K";
        return "E";
    };
    const name = (m, o) => {
        if (!m) return "?";
        const sch = m.isShadowPassMaterial === true;
        const u = sch && o && o.material && !Array.isArray(o.material) ? o.material : m;
        const g = o && o.geometry;
        const wer = (o && (o.name || (o.isInstancedMesh ? "Inst" : o.type))) || "?";
        return String(u.name || u.type || "?").replace(/NodeMaterial$/, "").slice(0, 32) + "@" + String(wer).slice(0, 28) + (g && g.name ? ":" + String(g.name).slice(0, 20) : "") + (sch ? "⟂" : "");
    };
    const zeit = (t0) => Math.round((performance.now() - t0) * 10) / 10;
    // DER NACH-BILD-REKORDER: vom Weltbild bis +4 s je rAF [t, x, z, imFlug, gerendert, ausgesetzt, gehalten, Takt-ms] und je
    // W-Taste [t, repeat, Ladeschirm steht] — in `window.__kalt.nach`
    const N = { keys: [], frames: [] };
    const schirm = () => {
        const el = document.getElementById("ladeschirm");
        return el && !el.hidden && !el.classList.contains("weg") ? 1 : 0;
    };
    window.addEventListener("keydown", (e) => e.code === "KeyW" && N.keys.push([Math.round(performance.now()), e.repeat ? 1 : 0, schirm()]), true);
    // DIE GPU-BAUTEN: je Pipeline und Shader-Modul [t, Art, Label, Länge] (s = synchron, a = asynchron, c = compute, m = Modul,
    // w = writeTexture-Bytes) in `__kalt.nach.gpu`
    N.gpu = [];
    if (typeof GPUDevice !== "undefined") {
        const P = GPUDevice.prototype;
        const hake = (m, art, len) => {
            const f = P[m];
            if (typeof f !== "function") return;
            P[m] = function (d) {
                const t0 = performance.now();
                try {
                    return f.apply(this, arguments);
                } finally {
                    const r = window.anazhRealm;
                    const nach = !!(r && r.state && r.state._weltbildDa);
                    // nach dem Bild: wer im Stamm bestellte (die ersten zwei Glieder des Stapels aus stamm/)
                    const lim = Error.stackTraceLimit;
                    Error.stackTraceLimit = 60;
                    const stapel = nach ? new Error().stack || "" : "";
                    Error.stackTraceLimit = lim;
                    const wer = nach
                        ? stapel
                              .split("\n")
                              .filter((z) => /stamm\//.test(z) && !/bild-kosten\.js/.test(z))
                              .slice(0, 3)
                              .map((z) => (/at (?:[\w.]+\.)?([\w$]+) /.exec(z) || [0, "?"])[1])
                              .join("<")
                        : "";
                    N.gpu.push([Math.round(t0), art, String((d && d.label) || "").slice(0, 40), len(d), Math.round((performance.now() - t0) * 10) / 10, wer]);
                }
            };
        };
        hake("createRenderPipeline", "s", () => 0);
        hake("createRenderPipelineAsync", "a", () => 0);
        hake("createComputePipeline", "c", () => 0);
        hake("createComputePipelineAsync", "C", () => 0);
        hake("createShaderModule", "m", (d) => (d && d.code ? d.code.length : 0));
    }
    const raf = (t) => {
        const r = window.anazhRealm;
        const st = r && r.state;
        const da = st && st._weltbildDa;
        if (da && t - da < 4000) {
            const p = st.playerMesh && st.playerMesh.position;
            const L = r._gpuLeine || {};
            const g = st.verbTafel ? Object.keys(st.verbTafel.gehalten).filter((k) => st.verbTafel.gehalten[k]).join("+") : "?";
            N.frames.push([Math.round(t), p ? Math.round(p.x * 100) / 100 : null, p ? Math.round(p.z * 100) / 100 : null, L.imFlug, L.gerendert, L.ausgesetzt, g]);
        }
        if (window.__kalt) window.__kalt.nach = N;
        if (!da || t - da < 4000) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    const anNodes = (N) => {
        if (!N || N.__bauHaken) return;
        N.__bauHaken = true;
        const gfr = N.getForRender;
        N.getForRender = function (ro) {
            if (this.get(ro).nodeBuilderState !== undefined) return gfr.apply(this, arguments);
            const t0 = performance.now();
            try {
                return gfr.apply(this, arguments);
            } finally {
                ev.push([Math.round(t0), zeit(t0), name(ro.material, ro.object), "v", 0, szene(ro.scene)]);
                buch();
            }
        };
        const cs = N._createNodeBuilderState;
        N._createNodeBuilderState = function (b) {
            const s = cs.apply(this, arguments);
            const len = ["vertexShader", "fragmentShader", "computeShader"].reduce((n, k) => n + (typeof b[k] === "string" ? b[k].length : 0), 0);
            ev.push([Math.round(performance.now()), 0, name(b.material, b.object), "f", len, szene(b.scene)]);
            buch();
            return s;
        };
    };
    const warte = setInterval(() => {
        const T = window.THREE;
        if (T && T.WebGPURenderer && !T.WebGPURenderer.prototype.__bauHaken) {
            const P = T.WebGPURenderer.prototype;
            P.__bauHaken = true;
            const init = P.init;
            P.init = async function () {
                const x = await init.apply(this, arguments);
                anNodes(this._nodes);
                return x;
            };
        }
        const r = window.anazhRealm;
        if (r && r.state && r.state.renderer && r.state.renderer._nodes) anNodes(r.state.renderer._nodes);
        // eslint-disable-next-line no-undef
        const A = typeof AnazhRealm !== "undefined" ? AnazhRealm : null;
        if (A && A.prototype._knotenRate && !A.prototype._knotenRate.__haken) {
            const kr = A.prototype._knotenRate;
            A.prototype._knotenRate = function (N, ro, E) {
                const t0 = performance.now();
                try {
                    return kr.call(this, N, ro, E);
                } finally {
                    ev.push([Math.round(t0), zeit(t0), name(ro.material, ro.object), "r", 0, szene(ro.scene)]);
                    buch();
                }
            };
            A.prototype._knotenRate.__haken = true;
        }
        if (A && A.prototype._knotenRate.__haken && r && r.state && r.state.renderer && r.state.renderer._nodes && r.state.renderer._nodes.__bauHaken)
            clearInterval(warte);
    }, 5);
}

const start = wb.starteBrowser;
wb.starteBrowser = async function (opts) {
    const b = await start(opts);
    const neu = b.newPage.bind(b);
    b.newPage = async function () {
        const p = await neu();
        await p.evaluateOnNewDocument(BAU_HAKEN);
        return p;
    };
    return b;
};
