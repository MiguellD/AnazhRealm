// 0910-3 A1: das Tiefen-Abbild bei laufendem Loop. __SCHRITT__ = start | pr:<wert> | stopp | lesen
const SCHRITT = "__SCHRITT__";
const st = r.state, rend = st.renderer, be = rend.backend;
const A1 = window.__a1 || (window.__a1 = { gpu: {}, frames: 0, an: false });
if (!A1.hoerer) {
    A1.hoerer = (e) => { const k = String(e.error && e.error.message).split("\n")[0].slice(0, 140); A1.gpu[k] = (A1.gpu[k] || 0) + 1; };
    be.device.addEventListener("uncapturederror", A1.hoerer);
}
const W = r._gpuWache || { n: 0, meldungen: [] };
const warteFrames = async (n) => {
    const f0 = A1.frames, t0 = performance.now();
    while (A1.frames - f0 < n && performance.now() - t0 < 30000) await new Promise((s) => setTimeout(s, 16));
    return A1.frames - f0;
};
if (SCHRITT === "start") {
    if (!A1.an) {
        const loop = r._gameLoopTick;
        rend.setAnimationLoop((t) => { A1.frames++; return loop(t); });
        A1.an = true;
    }
    const n = await warteFrames(30);
    return { an: true, frames: n, pr: rend.getPixelRatio(), dpr: window.devicePixelRatio, gpu: A1.gpu, wache: W.n };
}
if (SCHRITT.startsWith("pr:")) {
    const v = Number(SCHRITT.slice(3));
    const vor = rend.getPixelRatio();
    rend.setPixelRatio(v);
    const n = await warteFrames(40);
    return { vor, nach: rend.getPixelRatio(), frames: n, gpu: A1.gpu, wache: W.n, abbild: (() => { const k = r._szeneTiefeKnoten; const t = k && k.value; return t && t.image ? [t.image.width, t.image.height] : null; })() };
}
if (SCHRITT === "warte") {
    const n = await warteFrames(40);
    return { frames: n, pr: rend.getPixelRatio(), innen: [window.innerWidth, window.innerHeight], dpr: window.devicePixelRatio, gpu: A1.gpu, wache: W.n };
}
if (SCHRITT === "stopp") {
    rend.setAnimationLoop(null);
    A1.an = false;
    return { gpu: A1.gpu, wache: W.n, meldungen: W.meldungen.map((m) => m.quelle + ": " + m.kopf).slice(0, 8) };
}
return { gpu: A1.gpu, wache: W.n };
