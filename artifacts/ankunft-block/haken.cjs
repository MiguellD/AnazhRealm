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
