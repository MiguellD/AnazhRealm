// Spike-Schatten-Sonde: je Kaskaden-Render CPU µs, Befehle, Dreiecke, Auslöser, und was sich seit dem letzten Render
// derselben Kaskade geändert hat. Funktionsrumpf für `werkbank eval` (r = Welt).
const st = r.state;
const csm = st.csmNode;
const rend = st.renderer;
if (!csm || !csm._shadowNodes) return { fehler: "keine CSM-Knoten" };
if (!window.__sp) {
    const P = (window.__sp = { an: false });
    const sig = (o) => {
        let s = 0;
        if (o)
            o.traverse((x) => {
                const e = x.matrixWorld.elements;
                s += e[12] * 1.3 + e[13] * 1.7 + e[14] * 1.1 + e[0] + e[5] + e[10];
            });
        return s;
    };
    const V = new T.Vector3();
    const imBox = (f, p, rad) => {
        V.copy(p).applyMatrix4(f.basisInv);
        return !(V.x + rad < f.x0 || V.x - rad > f.x1 || V.y + rad < f.y0 || V.y - rad > f.y1);
    };
    P.reset = () => {
        P.f0 = r._shadowFrame || 0;
        P.t0 = performance.now();
        P.renders = [];
        P.frameUs = new Map();
        P.letzt = [];
    };
    P.reset();
    csm._shadowNodes.forEach((sn, i) => {
        if (!sn || sn.__spHuelle) return;
        const roh = sn.updateShadow;
        sn.__spHuelle = true;
        sn.updateShadow = function (e) {
            if (!P.an) return roh.call(this, e);
            const ri = rend.info.render;
            const dc0 = ri.drawCalls,
                tr0 = ri.triangles,
                t0 = performance.now();
            const o = roh.call(this, e);
            const us = (performance.now() - t0) * 1000;
            const fr = r._shadowFrame || 0;
            const dc = ri.drawCalls - dc0,
                tri = ri.triangles - tr0;
            const L = r._shadowLast || {};
            const takt = L.k && L.k[i] === fr;
            const dl = st.directionalLight;
            const d = new T.Vector3().subVectors(dl.target.position, dl.position).normalize();
            const f = csm._anazhFit && csm._anazhFit[i];
            const cam = st.camera.matrixWorld.elements.slice();
            const sp = sig(st.playerMesh);
            let wach = 0,
                wachBox = 0,
                bewegtBox = 0;
            const lagen = new Map();
            for (const liste of [st.creatures || [], st.leichname || []])
                for (const c of liste) {
                    if (!c || c.visible === false) continue;
                    const ruht = c.userData && c.userData._ruht === true;
                    if (!ruht) wach++;
                    const inBox = f ? imBox(f, c.position, 6) : false;
                    if (inBox && !ruht) wachBox++;
                    lagen.set(c, c.position.x * 3.1 + c.position.y * 1.7 + c.position.z);
                }
            const m = P.letzt[i];
            const rec = { i, fr, us, dc, tri, ausloeser: takt ? "takt" : "box", grundB: (r._spikeGrund || [])[i] || null };
            if (m) {
                rec.abstand = fr - m.fr;
                rec.sonneTexel = f && f.texelMin > 0 ? (Math.acos(Math.min(1, d.dot(m.d))) * f.weg) / f.texelMin : null;
                rec.stufen = (st._sonne ? st._sonne.stufen : 0) - m.stufen;
                rec.fitNeu = f ? f.bild !== m.bild : null;
                rec.kamera = cam.some((v, j) => Math.abs(v - m.cam[j]) > 1e-6);
                rec.spieler = sp !== m.sp;
                rec.wachBox = wachBox;
                for (const [c, l] of lagen) if (m.lagen.has(c) && m.lagen.get(c) !== l && f && imBox(f, c.position, 6)) bewegtBox++;
                rec.bewegtBox = bewegtBox;
                rec.inhalt = dc !== m.dc || tri !== m.tri;
                rec.ohneGrund =
                    !(rec.sonneTexel >= 1) && !rec.fitNeu && !rec.kamera && !rec.spieler && wachBox === 0 && !rec.inhalt;
            }
            rec.wach = wach;
            rec.wind = st.windUniforms && st.windUniforms.uWindStrength ? st.windUniforms.uWindStrength.value : null;
            P.letzt[i] = {
                fr,
                d,
                stufen: st._sonne ? st._sonne.stufen : 0,
                bild: f ? f.bild : null,
                cam,
                sp,
                lagen,
                dc,
                tri,
            };
            P.renders.push(rec);
            P.frameUs.set(fr, (P.frameUs.get(fr) || 0) + us);
            return o;
        };
    });
    P.bericht = () => {
        const frames = (r._shadowFrame || 0) - P.f0;
        const sek = (performance.now() - P.t0) / 1000;
        const aus = { frames, sek: +sek.toFixed(1), fps: +(frames / sek).toFixed(1), kaskaden: {} };
        const q = (a, p) => {
            if (!a.length) return null;
            const s = a.slice().sort((x, y) => x - y);
            return s[Math.min(s.length - 1, Math.floor(p * s.length))];
        };
        const usJeFrame = [];
        for (let f = P.f0 + 1; f <= P.f0 + frames; f++) usJeFrame.push(P.frameUs.get(f) || 0);
        const mittel = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
        aus.schattenUsJeFrame = {
            mittel: +mittel(usJeFrame).toFixed(0),
            p50: +q(usJeFrame, 0.5).toFixed(0),
            p95: +q(usJeFrame, 0.95).toFixed(0),
            framesMitRender: usJeFrame.filter((x) => x > 0).length,
        };
        for (let i = 0; i < csm._shadowNodes.length; i++) {
            const R = P.renders.filter((x) => x.i === i);
            const zaehl = (fn) => R.filter(fn).length;
            const mitM = R.filter((x) => x.abstand != null);
            const ausl = {};
            for (const x of R) ausl[x.ausloeser] = (ausl[x.ausloeser] || 0) + 1;
            const gb = {};
            for (const x of R) gb[x.grundB || "-"] = (gb[x.grundB || "-"] || 0) + 1;
            aus.kaskaden["k" + i] = {
                renders: R.length,
                jeFrame: +(R.length / Math.max(1, frames)).toFixed(3),
                usMittel: +mittel(R.map((x) => x.us)).toFixed(0),
                usP95: R.length ? +q(R.map((x) => x.us), 0.95).toFixed(0) : null,
                dcMittel: +mittel(R.map((x) => x.dc)).toFixed(1),
                triMittel: Math.round(mittel(R.map((x) => x.tri))),
                usJeBefehl: +(mittel(R.map((x) => x.us)) / Math.max(1, mittel(R.map((x) => x.dc)))).toFixed(1),
                ausloeser: ausl,
                grundB: gb,
                aenderung: {
                    n: mitM.length,
                    sonneTexelGe1: zaehl((x) => x.sonneTexel >= 1),
                    sonneTexelMittel: +mittel(mitM.map((x) => x.sonneTexel || 0)).toFixed(3),
                    stufen: zaehl((x) => x.stufen > 0),
                    fitNeu: zaehl((x) => x.fitNeu),
                    kamera: zaehl((x) => x.kamera),
                    spieler: zaehl((x) => x.spieler),
                    wachInBox: zaehl((x) => x.wachBox > 0),
                    bewegtInBox: zaehl((x) => x.bewegtBox > 0),
                    inhalt: zaehl((x) => x.inhalt),
                    ohneGrund: zaehl((x) => x.ohneGrund),
                },
                wachMittel: +mittel(R.map((x) => x.wach)).toFixed(1),
                wind: R.length ? R[R.length - 1].wind : null,
            };
        }
        return aus;
    };
}
const P = window.__sp;
const arg = typeof SPIKE_ARG !== "undefined" ? SPIKE_ARG : "start";
if (arg === "start") {
    P.reset();
    P.an = true;
    return { gestartet: true, f0: P.f0 };
}
if (arg === "stop") {
    P.an = false;
    return P.bericht();
}
return P.bericht();
