// Messung ohne Eingriff — DER BAU IM GANG: jeder Knoten-Bau der Erst-Zeichnung in Raten (`_knotenRate`) je Render-Objekt — erster
// Ruf, fertig, Zahl der Rufe, die Zeit IM Ruf (Haupt-Faden), dazu Objekt (eine Arena nennt ihre Glieder), Stoff, Hauptbild oder
// Wurf, die Kennung des Render-Kontexts, der Bau-Schlüssel des Objekts (`getForRenderCacheKey`) und das Licht des Wurf-Passes
// (r184 nennt die Szene im Schatten-Pass „Shadow Map [ … ]“). Dazu jeder Ruf der Warteschlange (`_erstWartet`) mit Pipeline:
// [ms, Etikett, Objekt, Art]. Der Leser gang-lesen.cjs zeigt, was NACH dem ersten Weltbild neu entsteht, wie oft, und was es kostet.
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const G = (X.gang = { bau: [], warte: [], fehler: "" });
    const wer = (o) => {
        if (o.isGeometrieArena && Array.isArray(o.glieder))
            return "Arena[" + o.glieder.slice(0, 3).map((g) => (g.userData && g.userData.archInstanceKey) || g.name || g.type).join(", ") + (o.glieder.length > 3 ? ", … " + o.glieder.length : "") + "]";
        const eltern = o.parent && o.parent.name && !/^Shadow Map/.test(o.parent.name) ? " < " + o.parent.name : "";
        return (o.name || (o.userData && (o.userData.inventar || o.userData.archInstanceKey)) || o.type) + eltern;
    };
    // die Szene des Render-Objekts beim Namen: der Wurf-Pass der Welt („Shadow Map [ … ]“), die Bühne der Karte mit ihrem Versuch,
    // eine andere Bühne, sonst nichts (die Welt-Szene)
    const szene = (ro) => {
        const r = window.anazhRealm;
        const s = ro.scene;
        if (!s || !r) return "";
        if (/^Shadow Map/.test(s.name || "")) return s.name;
        if (s === r.state.scene) return "";
        const B = r._karteBuehneSatz;
        if (B && s === B.szene) return "Karten-Bühne " + (B.versuch || "") + " " + String((B.zelle && B.zelle.key) || B.schluessel || "");
        return "Szene " + (s.name || s.uuid.slice(0, 6)) + (s === r._buehneJetzt ? " (Bühne)" : "");
    };
    const je = new WeakMap();
    const K0 = P._knotenRate;
    P._knotenRate = function (N, ro, E) {
        const t = performance.now();
        const r = K0.call(this, N, ro, E);
        const dt = performance.now() - t;
        try {
            let e = je.get(ro);
            if (!e) {
                const [m, o] = [ro.material || {}, ro.object || {}];
                let schl = "";
                try {
                    schl = String(N.getForRenderCacheKey(ro)).slice(0, 24);
                } catch (err) {
                    schl = "?";
                }
                e = [Math.round(t), null, 0, 0, wer(o), (m.name || m.type || "?") + "_" + m.id, ro.camera === this.state.camera ? "haupt" : "wurf", (ro.context && ro.context.id) ?? "?", schl, szene(ro)];
                je.set(ro, e);
                if (G.bau.length < 1500) G.bau.push(e);
            }
            e[2]++;
            e[3] = Math.round((e[3] + dt) * 100) / 100;
            if (r && e[1] == null) e[1] = Math.round(performance.now());
        } catch (err) {
            G.fehler = "Bau: " + String(err.message);
        }
        return r;
    };
    const W0 = P._erstWartet;
    P._erstWartet = function (be, pipe, bg, buerger) {
        try {
            if (pipe && this.state._weltbildDa && G.warte.length < 800) {
                const E = this._erstZeichnung;
                const ro = buerger || null;
                G.warte.push([Math.round(performance.now()), String((E && E.namen.get(pipe)) || "?").replace("renderPipeline_", ""), ro ? wer(ro.object) : "(Vorbau ohne Zug)", ro ? (ro.camera === this.state.camera ? "haupt" : "wurf") : "", ro ? szene(ro) : ""]);
            }
        } catch (err) {
            G.fehler = "Warte: " + String(err.message);
        }
        return W0.call(this, be, pipe, bg, buerger);
    };
}
