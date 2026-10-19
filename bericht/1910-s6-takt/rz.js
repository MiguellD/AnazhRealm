// 1910 S6-Takt: DER REFRESH-ZENSUS (Seiten-Code für `werkbank eval`, r = Welt), nach dem sauberen lauf derselben Sitzung.
// Das Profil sah das Plus von B im Render-Weg (_loopRender +0,11 ms je Frame: _diaetRefresh, _renderBundles). Hier zählt der echte
// Loop (wie `lauf`: rAF, __wetterHalten, __ortSchritt, _gameLoopTick, Regler voll) je Render-Objekt-KLASSE (Objekt-Name oder -Typ ·
// Stoff-Name) und je Frame:
//   ref     — Aufrufe von AnazhRealm._diaetRefresh, refT = davon „true" (voller Refresh), gang = _diaetObjektGang (Lage, Verweis …)
//   geteilt — _diaetGeteiltSchreiben (einmal je Render)
//   buendel — rend._renderBundle je BundleGroup-Name: Abspielen, neu = Neuaufnahme (bundleGPU fehlte vor dem Ruf)
// Funktions-Hüllen an der Klasse (statische Funktionen) und an der Renderer-Instanz, kein Proxy; am Ende zurück.
// window.__rzSek (Standard 20). Rückgabe: Frames, je Klasse die Zahlen je Frame (die 40 größten nach refT, gang, ref), Bündel.
const SEK = window.__rzSek || 20;
const st = r.state;
const rend = st.renderer;
const A = window.AnazhRealm || r.constructor;
const sleep = (ms) => new Promise((s) => setTimeout(s, ms));
const klasse = (ro) => {
    const o = ro && ro.object;
    const m = ro && ro.material;
    let n = o ? o.name || o.type : "?";
    let p = o && o.parent;
    if (!o || !o.name) for (let i = 0; p && i < 4 && !p.name; i++) p = p.parent;
    if (o && !o.name && p && p.name) n = p.name + "/" + n;
    return n + " · " + (m ? m.name || m.type : "?");
};
const zahl = new Map();
const z = (k) => {
    let e = zahl.get(k);
    if (!e) zahl.set(k, (e = { ref: 0, refT: 0, gang: 0 }));
    return e;
};
const ab = [];
let messen = false;
{
    const f = A._diaetRefresh;
    A._diaetRefresh = function (obs, ro) {
        const e = f.apply(this, arguments);
        if (messen) {
            const s = z(klasse(ro));
            s.ref++;
            if (e === true) s.refT++;
        }
        return e;
    };
    ab.push(() => (A._diaetRefresh = f));
}
{
    const f = A._diaetObjektGang;
    A._diaetObjektGang = function (rnd, ro) {
        if (messen) z(klasse(ro)).gang++;
        return f.apply(this, arguments);
    };
    ab.push(() => (A._diaetObjektGang = f));
}
let geteilt = 0;
{
    const f = A._diaetGeteiltSchreiben;
    A._diaetGeteiltSchreiben = function () {
        if (messen) geteilt++;
        return f.apply(this, arguments);
    };
    ab.push(() => (A._diaetGeteiltSchreiben = f));
}
const bz = new Map();
{
    const f = rend._renderBundle;
    const eigen = Object.prototype.hasOwnProperty.call(rend, "_renderBundle");
    rend._renderBundle = function (b) {
        let vor = true;
        if (messen)
            try {
                const d = this.backend.get(this._bundles.get(b.bundleGroup, b.camera, this._currentRenderContext));
                vor = d.bundleGPU !== undefined;
            } catch (_e) {}
        const e = f.apply(this, arguments);
        if (messen) {
            const k = (b.bundleGroup && (b.bundleGroup.name || b.bundleGroup.type)) || "?";
            let s = bz.get(k);
            if (!s) bz.set(k, (s = { spiel: 0, neu: 0 }));
            s.spiel++;
            if (!vor) s.neu++;
        }
        return e;
    };
    ab.push(() => {
        if (eigen) rend._renderBundle = f;
        else delete rend._renderBundle;
    });
}
let frames = 0,
    takte = 0;
const decke = st.perfTargetMs;
st.perfTargetMs = 1000;
window.__buehne();
rend.setAnimationLoop((t) => {
    window.__wetterHalten();
    const g0 = r._gpuLeine ? r._gpuLeine.gerendert : 0;
    if (window.__ortSchritt) window.__ortSchritt();
    r._gameLoopTick(t);
    if (!messen) return;
    takte++;
    if (!r._gpuLeine || r._gpuLeine.gerendert > g0) frames++;
});
try {
    await sleep(3000);
    messen = true;
    await sleep(SEK * 1000);
    messen = false;
} finally {
    rend.setAnimationLoop(null);
    for (const f of ab) f();
    st.perfTargetMs = decke;
}
const je = (x) => +(x / Math.max(1, frames)).toFixed(3);
const liste = [...zahl.entries()].map(([k, e]) => ({ k, ref: je(e.ref), refT: je(e.refT), gang: je(e.gang) }));
const top = (fld) => liste.slice().sort((a, b) => b[fld] - a[fld]).slice(0, 40);
const sum = (fld) => +liste.reduce((a, e) => a + e[fld], 0).toFixed(2);
return {
    frames,
    takte,
    summe: { ref: sum("ref"), refT: sum("refT"), gang: sum("gang"), geteilt: je(geteilt), klassen: liste.length },
    nachRefT: top("refT"),
    nachGang: top("gang"),
    nachRef: top("ref"),
    buendel: [...bz.entries()].map(([k, s]) => ({ k, spiel: je(s.spiel), neu: je(s.neu) })).sort((a, b) => b.spiel - a.spiel),
    alle: liste,
};
