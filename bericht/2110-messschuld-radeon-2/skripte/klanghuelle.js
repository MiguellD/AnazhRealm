// je präsentiertem Bild (rAF) die Haupt-Faden-ms der Klang-Arbeit (symphonyTick + _schrittKlangTick + _tierRuf), Hülle um den Ruf
(() => {
    window.__klangBild = [];
    let offen = 0;
    const f = () => { window.__klangBild.push([offen, window.__spur ? window.__spur.phase : ""]); offen = 0; requestAnimationFrame(f); };
    requestAnimationFrame(f);
    const w = setInterval(() => {
        const r = window.anazhRealm;
        if (!r || typeof r.symphonyTick !== "function" || r.__klangGehuellt) return;
        const P = Object.getPrototypeOf(r);
        for (const m of ["symphonyTick", "_schrittKlangTick", "_tierRuf"]) {
            const org = P[m];
            if (typeof org !== "function") continue;
            P[m] = function () { const t = performance.now(); try { return org.apply(this, arguments); } finally { offen += performance.now() - t; } };
        }
        r.__klangGehuellt = true;
        clearInterval(w);
    }, 20);
})();
