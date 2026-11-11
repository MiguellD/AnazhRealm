// Messung ohne Eingriff — DIE LÜCKE AM BILD, je Bild gezählt und unabhängig vom Spiel: welcher Bürger der Welt-Szene wollte in
// DIESEM Bild zeichnen (ein Ruf der Erst-Zeichnung `_renderObjectDirect` mit Zug-Parametern) und zeichnete nicht (kein Zug des
// Backends, `backend.draw`)? Getrennt nach Hauptbild und Wurf (jede andere Kamera). Ein Bündel, das ohne einen Bürger versiegelte,
// spielt ohne Ruf ab: seine Fehlenden gelten in jedem Bild, in dem es läuft, bis es neu aufnimmt (`_renderBundle`).
// Gemerkt: jede Änderung der Fehlenden [ms, Hauptbild, Wurf], der Stand im Task des ersten Weltbilds (`amBild`), je Name sein
// erster Zug im Hauptbild danach (`nach`) und das erste Bild ab dem Weltbild, in dem im Hauptbild keiner fehlte (`ganz`) bzw.
// auch im Wurf keiner (`ganzWurf`). Mit karte-bild.js dahinter kommen die Bilder der Leinwand dazu.
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const B = (X.luecke = { verlauf: [], amBild: null, nach: {}, ganz: null, ganzWurf: null, zuege: 0, bilder: 0, fehler: "" });
    const wer = (o, m) => {
        let n;
        if (o.isGeometrieArena && Array.isArray(o.glieder))
            n = "Arena[" + o.glieder.slice(0, 3).map((g) => (g.userData && g.userData.archInstanceKey) || g.name || g.type).join(", ") + (o.glieder.length > 3 ? ", … " + o.glieder.length : "") + "]";
        else {
            const k = [];
            for (let x = o; x && k.length < 2; x = x.parent) k.push(x.name || x.type);
            const ud = Object.keys(o.userData || {}).slice(0, 4).join(",");
            n = k.join(" < ") + (o.userData && o.userData.archInstanceKey ? " {" + o.userData.archInstanceKey + "}" : ud ? " {" + ud + "}" : "") + (o.geometry && o.geometry.name ? " geo:" + o.geometry.name : "");
        }
        return n + " ¦ " + ((m && (m.name || m.type)) || "?") + "_" + (m ? m.id : "?");
    };
    let versucht = new Map(); // Schlüssel (Objekt-id|Art) → [Name, Art, Bündel der Aufnahme oder null]
    let gezogen = new Set();
    let gelaufen = new Set(); // die Bündel (je Kamera), die in diesem Bild liefen
    const jeBuendel = new WeakMap(); // Bündel → Map(Schlüssel → [Name, Art]): seine Fehlenden seit der letzten Aufnahme
    let gehakt = false;
    let fehltAmBild = null;
    let zuletzt = "";
    const haken = (r) => {
        const rend = r.state.renderer;
        if (!rend || rend._isHeadlessNull || typeof rend._renderObjectDirect !== "function" || !rend.backend) return false;
        const art = (kam) => (kam === r.state.camera ? "haupt" : "wurf");
        const R0 = rend._renderObjectDirect;
        rend._renderObjectDirect = function (object, material, scene, camera, lightsNode, group, clip, passId) {
            const aus = R0.call(this, object, material, scene, camera, lightsNode, group, clip, passId);
            try {
                if (scene === r.state.scene) {
                    const ro = this._objects.get(object, material, scene, camera, lightsNode, this._currentRenderContext, clip, passId);
                    if (ro.getDrawParameters() !== null) {
                        const a = art(camera);
                        versucht.set(object.id + "|" + a, [wer(object, object.material), a, this._currentRenderBundle || null]);
                    }
                }
            } catch (err) {
                B.fehler = "Ruf: " + String(err.message);
            }
            return aus;
        };
        const be = rend.backend;
        const D0 = be.draw;
        be.draw = function (ro, info) {
            try {
                gezogen.add(ro.object.id + "|" + art(ro.camera));
                B.zuege++;
            } catch (err) {
                B.fehler = "Zug: " + String(err.message);
            }
            return D0.call(this, ro, info);
        };
        const N0 = rend._renderBundle;
        rend._renderBundle = function (bundle, sceneRef, lightsNode) {
            try {
                const rb = this._bundles.get(bundle.bundleGroup, bundle.camera, this._currentRenderContext);
                const daten = this.backend.get(rb);
                const abspiel = daten.bundleGPU !== undefined && bundle.bundleGroup.version === daten.version;
                if (!abspiel) jeBuendel.set(rb, new Map()); // es nimmt neu auf: seine Fehlenden zählt diese Aufnahme
                gelaufen.add(rb);
            } catch (err) {
                B.fehler = "Bündel: " + String(err.message);
            }
            return N0.call(this, bundle, sceneRef, lightsNode);
        };
        return true;
    };
    const K0 = P._kontaktPassZeichne;
    P._kontaktPassZeichne = function (direkt) {
        const aus = K0.call(this, direkt);
        try {
            if (!gehakt) gehakt = haken(this);
            else {
                B.bilder++;
                const fehlt = { haupt: [], wurf: [] };
                const da = { haupt: new Set(), wurf: new Set() };
                for (const [k, [name, a, rb]] of versucht) {
                    const zog = gezogen.has(k);
                    if (zog) da[a].add(name);
                    if (rb) {
                        const m = jeBuendel.get(rb);
                        if (m) zog ? m.delete(k) : m.set(k, [name, a]);
                    } else if (!zog) fehlt[a].push(name);
                }
                for (const rb of gelaufen) for (const [name, a] of (jeBuendel.get(rb) || new Map()).values()) fehlt[a].push(name);
                fehlt.haupt.sort();
                fehlt.wurf.sort();
                if (fehltAmBild) {
                    for (const name of da.haupt)
                        if (fehltAmBild[name] === true) {
                            fehltAmBild[name] = false;
                            B.nach[name] = Math.round(performance.now());
                        }
                    if (B.ganz == null && !fehlt.haupt.length) B.ganz = Math.round(performance.now());
                    if (B.ganzWurf == null && !fehlt.haupt.length && !fehlt.wurf.length) B.ganzWurf = Math.round(performance.now());
                }
                B.jetzt = fehlt;
                const sig = fehlt.haupt.join(" ║ ") + " ┃ " + fehlt.wurf.join(" ║ ");
                if (sig !== zuletzt && B.verlauf.length < 400) {
                    zuletzt = sig;
                    B.verlauf.push([Math.round(performance.now()), fehlt.haupt, fehlt.wurf]);
                }
            }
            versucht = new Map();
            gezogen = new Set();
            gelaufen = new Set();
        } catch (err) {
            B.fehler = String(err.message);
        }
        return aus;
    };
    const W0 = P._weltbildSteht;
    P._weltbildSteht = function () {
        const aus = W0.call(this);
        try {
            const f = B.jetzt || { haupt: [], wurf: [] };
            const t = Math.round(performance.now());
            B.amBild = [t, f.haupt.slice(), f.wurf.slice()];
            fehltAmBild = {};
            for (const n of f.haupt) fehltAmBild[n] = true;
            if (!f.haupt.length) B.ganz = t;
            if (!f.haupt.length && !f.wurf.length) B.ganzWurf = t;
        } catch (err) {
            B.fehler = String(err.message);
        }
        return aus;
    };
}
