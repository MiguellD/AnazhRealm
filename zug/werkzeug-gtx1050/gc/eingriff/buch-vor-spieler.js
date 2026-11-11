// EINGRIFF ZUM BEWEIS — DAS BUCH KOMMT VOR DEM SPIELER (die lange Aufgabe am Zweit-Boot, Fund 9610f42d): die Ankunft der Welt
// (`_weltAnkunft`) wartet, bis das Buch der Seite beim Wirt liegt (`_foundry.buch`), höchstens 20 s — die Reihenfolge, die an der
// GTX 1050 in 6 von 105 Zweit-Boots von selbst eintrat. Mit BUCH_VOR=0 im Namen der Datei (buch-nach-spieler.js ist dieselbe Datei
// ohne das Warten) misst er nur. Dazu das Protokoll des Leibs in `extra.leib`: jeder gemünzte Schlüssel des Mensch-Ofens (Stufe,
// Länge, Kurz-Hash, im Memo?), jede Bestellung „mensch" (wann, Stufe, was kam), jeder Ruf der Vorlage mit Dauer, jeder Bruch.
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const L = (X.leib = { warten: null, buchBeimWirt: null, log: [], bruch: [], fehler: "" });
    const WARTEN = !window.__buchNachSpieler;
    const t = () => Math.round(performance.now());
    const hash = (s) => {
        let h = 0x811c9dc5;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
        return (h >>> 0).toString(16);
    };
    const sag = (...a) => L.log.length < 400 && L.log.push([t(), ...a]);
    const memoHat = (k) => !!(P.constructor._tierOfenMemo && P.constructor._tierOfenMemo.has(k));
    const hak = (name, bau) => {
        const f0 = P[name];
        if (typeof f0 !== "function") return void (L.fehler += "kein Glied " + name + " · ");
        P[name] = bau(f0);
    };
    hak("_weltAnkunft", (f0) => async function (...a) {
        const t0 = performance.now();
        const f = this._foundry;
        if (WARTEN) while (f && !f.buch && !f.recipes && performance.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 10));
        L.warten = Math.round(performance.now() - t0);
        L.buchBeimWirt = !!(f && f.buch);
        sag("_weltAnkunft beginnt", "Buch beim Wirt: " + L.buchBeimWirt);
        try {
            return await f0.apply(this, a);
        } finally {
            sag("_weltAnkunft endet");
        }
    });
    for (const name of ["loadState", "_foundryWirtSteht", "generateNewWorld", "_foundryIngestBook", "_buchKoepfe", "_ofenSpielerVorlagen", "applyPlayerSoul", "_weltAbschied"])
        hak(name, (f0) => function (...a) {
            const t0 = performance.now();
            sag(name + " →", name === "_buchKoepfe" || name === "_ofenSpielerVorlagen" ? "deferiert: " + this.state._deferredAvatarSoul + " · steht: " + (this._spielerVorlagen ? this._spielerVorlagen.steht : "—") : "");
            const r = f0.apply(this, a);
            const dt = Math.round(performance.now() - t0);
            if (dt >= 5 || name === "_ofenSpielerVorlagen") sag(name + " ←", dt + " ms");
            return r;
        });
    hak("_ofenMenschKey", (f0) => function (...a) {
        const k = f0.apply(this, a);
        sag("Schlüssel", "L" + (a[3] | 0), k.length + " Z", hash(k), memoHat(k) ? "im Memo" : "NICHT im Memo", "Haut " + (a[1] >>> 0).toString(16) + " Haar " + (a[2] >>> 0).toString(16));
        return k;
    });
    hak("_ofenMenschTemplate", (f0) => function (...a) {
        const t0 = performance.now();
        const r = f0.apply(this, a);
        sag("_ofenMenschTemplate L" + (a[3] | 0), Math.round(performance.now() - t0) + " ms", r ? "Vorlage" : "null");
        return r;
    });
    hak("_foundryRequest", (f0) => function (...a) {
        const p = f0.apply(this, a);
        if (a[0] !== "mensch") return p;
        sag("Bestellung mensch L" + a[2], "Rang " + JSON.stringify(a[4]));
        return p.then(
            (m) => (sag("Antwort mensch L" + a[2], m && m.length ? m.length + " Meshes" : "LEER (" + m + ")"), m),
            (e) => {
                sag("Antwort mensch L" + a[2], "WURF " + (e && e.message));
                throw e;
            }
        );
    });
    for (const name of ["_ofenAssembleAsset", "_ofenVorlage", "_ofenRohGiessen", "_leibDerSeele", "_buildHumanoidRig", "_gelenkGestalt"])
        hak(name, (f0) => function (...a) {
            const t0 = performance.now();
            let r;
            try {
                r = f0.apply(this, a);
            } catch (e) {
                sag(name, "WURF " + (e && e.message));
                throw e;
            }
            const st = this.state || {};
            sag(name, Math.round(performance.now() - t0) + " ms", r ? "→ da" : "→ " + r, name === "_ofenVorlage" ? "Schlüssel " + hash(String(a[0])) + " fest " + a[3] : "", "Renderer " + !!st.renderer + " Szene " + !!st.scene);
            return r;
        });
    hak("_bruchMelden", (f0) => function (...a) {
        if (L.bruch.length < 40) L.bruch.push([t(), String(a[0]).slice(0, 300)]);
        return f0.apply(this, a);
    });
    hak("log", (f0) => function (...a) {
        if (/OFEN|Mensch-Ofen|PREFETCH|fail-closed/.test(String(a[0]))) sag("LOG", String(a[0]).slice(0, 200), a[1] || "");
        return f0.apply(this, a);
    });
}
