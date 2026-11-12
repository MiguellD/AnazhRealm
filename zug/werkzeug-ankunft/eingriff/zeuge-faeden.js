// Aufruf: FREI_EINGRIFF=<ort>/eingriff/zeuge-faeden.js … node <ort>/frei-sonde.cjs   — dann: node <ort>/zaehl-lesen.cjs <ordner mit a1.json …>
// Messung ohne Eingriff und OHNE eigenen Wecker — DER PASSIVE ZEUGE DES HÄNGERS: je Sekunde der Seiten-Uhr die Zahl der Rückrufe
// von requestAnimationFrame, der Rufe der Takt-Glieder und der Nachrichten der Fäden (message-Ereignisse je Worker-Name); dazu die
// Lücken > 1 s zwischen zwei Lade-Takten (`_weltbildLuecken`) mit dem Stand der Pflanzung am Takt vor und nach der Lücke, die
// Sichtbarkeit der Seite und jeder Fehler. `extra.passiv`.
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const Z = (X.passiv = { faeden: {}, wald: [], sek: {}, luecken: [], fehler: [], sicht: [[0, document.visibilityState, document.hasFocus()]] });
    const zahl = (name) => {
        const s = Math.floor(performance.now() / 1000);
        const e = Z.sek[s] || (Z.sek[s] = {});
        e[name] = (e[name] || 0) + 1;
    };
    const merke = (art, text) => Z.fehler.length < 30 && Z.fehler.push([Math.round(performance.now()), art, String(text).slice(0, 300)]);
    window.addEventListener("error", (e) => merke("error", (e.error && e.error.stack) || e.message));
    window.addEventListener("unhandledrejection", (e) => merke("rejection", (e.reason && e.reason.stack) || e.reason));
    document.addEventListener("visibilitychange", () => Z.sicht.push([Math.round(performance.now()), document.visibilityState, document.hasFocus()]));
    const raf0 = window.requestAnimationFrame;
    window.requestAnimationFrame = function (cb) {
        return raf0.call(window, function (t) {
            zahl("raf");
            return cb(t);
        });
    };
    const W0 = window.Worker;
    window.Worker = function (url, opts) {
        const w = new W0(url, opts);
        const name = (opts && opts.name) || String(url).replace(/^.*\//, "").replace(/[?].*$/, "");
        const F = (Z.faeden[name] = Z.faeden[name] || { geboren: [], antwort: [] });
        const nr = F.geboren.push(Math.round(performance.now())) - 1;
        F.antwort[nr] = null;
        w.addEventListener("message", () => F.antwort[nr] === null && (F.antwort[nr] = Math.round(performance.now())));
        w.addEventListener("message", (e) => (zahl("←" + name), name === "wald" && Z.wald.length < 40 && Z.wald.push([Math.round(performance.now()), "←", e.data && e.data.type, e.data && String(e.data.message || "").slice(0, 200)])));
        w.addEventListener("error", (e) => merke("faden-error " + name, (e && e.message) + " @" + (e && e.filename) + ":" + (e && e.lineno)));
        w.addEventListener("messageerror", () => merke("messageerror " + name, ""));
        const p0 = w.postMessage;
        w.postMessage = function (...a) {
            zahl("→" + name);
            if (name === "wald" && Z.wald.length < 40) Z.wald.push([Math.round(performance.now()), "→", a[0] && a[0].type, a[0] && a[0].zellen ? a[0].zellen.length / 2 + " Zellen · stand " + String(a[0].stand).slice(0, 80) : Object.keys(a[0] || {}).join(",").slice(0, 120)]);
            return p0.apply(this, a);
        };
        return w;
    };
    window.Worker.prototype = W0.prototype;
    for (const n of ["_tickSaat", "_tickPendingVegSpawns", "_tickNahWiese", "_forestPlantChunk", "_tickWaldPlan", "_enqueueVegetationSpawn", "_loopRender", "_runFrameScheduler"]) {
        const f0 = P[n];
        if (typeof f0 !== "function") continue;
        P[n] = function (...a) {
            zahl(n);
            return f0.apply(this, a);
        };
    }
    const b0 = P._bruchMelden;
    P._bruchMelden = function (...a) {
        merke("bruch", a[0]);
        return b0.apply(this, a);
    };
    const n = (v) => (v ? (v.size != null ? v.size : v.length) | 0 : 0);
    const stand = (r) => {
        const st = r.state;
        return { saat: n(r._saatOffen), pflanzWarten: n(r._waldPflanzWarten), waldSchlange: n(r._waldPlanSchlange), schlange: n(st.pendingVegSpawns), ladeTakt: !!r._ladeTakt(), ruht: !!r._loopRuht(), sicht: document.visibilityState }; // prettier-ignore
    };
    let [letzter, vorher] = [0, null];
    const L0 = P._weltbildLuecken;
    P._weltbildLuecken = function (...a) {
        const t = performance.now();
        zahl("_weltbildLuecken");
        if (!this.state._weltbildDa)
            try {
                const jetzt = stand(this);
                if (letzter && t - letzter > 1000 && Z.luecken.length < 12) Z.luecken.push([Math.round(letzter), Math.round(t), vorher, jetzt, String(new Error().stack).split("\n").slice(2, 7).map((s) => s.trim().slice(0, 70)).join(" < ")]); // prettier-ignore
                [letzter, vorher] = [t, jetzt];
            } catch (err) {
                merke("zeuge", err.message);
            }
        return L0.apply(this, a);
    };
}
// Messung ohne Eingriff — DAS ERSTE BILD als JPEG (`<lauf>-erstbild.jpg`), hinter `_kontaktPassZeichne` im Task des ersten Weltbilds
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const B = (X.erstbild = { bilder: [], fehler: "" });
    let erst = false;
    const Z0 = P._kontaktPassZeichne;
    P._kontaktPassZeichne = function (...a) {
        const aus = Z0.apply(this, a);
        if (!erst && this.state._weltbildDa)
            try {
                erst = true;
                const c = this.state.renderer.domElement;
                const daten = c.toDataURL("image/jpeg", 0.85);
                B.bilder.push(["erstbild", Math.round(performance.now()), c.width + "x" + c.height, daten.length]);
                fetch("/__bild", { method: "POST", body: JSON.stringify({ name: "erstbild", daten }) }).catch(() => {});
            } catch (err) {
                B.fehler = String(err.message);
            }
        return aus;
    };
}
