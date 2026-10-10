// 0910-7: der Atem-Zähler (werkbank eval, Seiten-Kontext): je Frame, was der Regler schreibt und wer davon aufwacht.
// Installieren: einmal; Lesen: window.__atem.lies(). Zählt die Wechsel von _foliageDensityScale / architectureCullingRadius /
// foliageRadius / uLodPerf, die Erhöhungen des Stand-Stempels (mit dem Index der geänderten Eingabe), die neuen Generationen
// der Pass-Lage je Schlüssel und die Einheiten der Stand-Takte (arbeit) — alles je gezähltem Frame.
const P = Object.getPrototypeOf(r);
if (!window.__atem) {
    const A = (window.__atem = {
        frames: 0,
        fd: 0,
        arch: 0,
        fol: 0,
        perf: 0,
        stempel: 0,
        stempelIdx: {},
        gen: {},
        letzt: null,
        arbeit0: null,
    });
    const roh = { stempel: P._standStempel, gen: P._passLageGen, render: P._loopRender };
    A.roh = roh;
    P._standStempel = function () {
        const W = this._standWache;
        const vor = W ? W.v.slice() : [];
        const s0 = W ? W.stempel : 0;
        const out = roh.stempel.call(this);
        if (this._standWache.stempel !== s0) {
            A.stempel++;
            const v = this._standWache.v;
            for (let i = 0; i < v.length; i++) if (!Object.is(v[i], vor[i])) A.stempelIdx[i] = (A.stempelIdx[i] || 0) + 1;
        }
        return out;
    };
    P._passLageGen = function (L, kamera, k) {
        const key = k >= 0 ? "k" + k : kamera === this.state.camera ? "haupt" : "anders";
        const M = this._passLagen;
        const g0 = M && M.get(key) ? M.get(key).gen : -1;
        const out = roh.gen.call(this, L, kamera, k);
        const g1 = this._passLagen.get(key).gen;
        if (g1 !== g0) A.gen[key] = (A.gen[key] || 0) + 1;
        return out;
    };
    P._loopRender = function (...a) {
        const st = this.state;
        const lu = st.lodUniforms;
        const jetzt = [st._foliageDensityScale, st.architectureCullingRadius, st.foliageRadius, lu && lu.uLodPerf ? lu.uLodPerf.value : null];
        if (A.letzt) {
            if (!Object.is(jetzt[0], A.letzt[0])) A.fd++;
            if (!Object.is(jetzt[1], A.letzt[1])) A.arch++;
            if (!Object.is(jetzt[2], A.letzt[2])) A.fol++;
            if (!Object.is(jetzt[3], A.letzt[3])) A.perf++;
        }
        A.letzt = jetzt;
        A.frames++;
        return roh.render.apply(this, a);
    };
    A.null = () => {
        Object.assign(A, { frames: 0, fd: 0, arch: 0, fol: 0, perf: 0, stempel: 0, stempelIdx: {}, gen: {} });
        const W = r._standWache;
        A.arbeit0 = W ? Object.fromEntries([...W.takte].map(([k, t]) => [k, t.arbeit])) : {};
    };
    A.lies = () => {
        const W = r._standWache;
        const arbeit = {};
        if (W) for (const [k, t] of W.takte) arbeit[k] = +((t.arbeit - (A.arbeit0[k] || 0)) / Math.max(1, A.frames)).toFixed(1);
        const je = (n) => +(n / Math.max(1, A.frames)).toFixed(3);
        return {
            frames: A.frames,
            jeFrame: { fd: je(A.fd), arch: je(A.arch), fol: je(A.fol), perf: je(A.perf), stempel: je(A.stempel) },
            stempelIdx: A.stempelIdx,
            genJeFrame: Object.fromEntries(Object.entries(A.gen).map(([k, n]) => [k, je(n)])),
            einheitenJeFrame: arbeit,
            stell: { fd: r.state._foliageDensityScale, arch: r.state.architectureCullingRadius, fol: r.state.foliageRadius },
        };
    };
}
window.__atem.null();
return "installiert";
