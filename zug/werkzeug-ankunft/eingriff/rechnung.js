// Aufruf: FREI_EINGRIFF=<ort>/eingriff/rechnung.js FREI_ZERLEGE=1 FREI_JSON=<lauf>.json node <ort>/frei-sonde.cjs   (der Treiber ankunft-rechnung.sh setzt ihn)
// Drei Messungen ohne Eingriff in einem: der Bau im Gang (extra.gang), die Züge je Pipeline bis zum Bild (extra.zug), der Knoten-Bau
// nach Stufen und die Leinwand am ersten Bild (extra.stufen, <lauf>-erstbild.jpg).
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
// Messung ohne Eingriff — WER ZEICHNET BIS ZUM ERSTEN BILD? Jeder Zug des Backends (`backend.draw`, auch in der Aufnahme eines
// Bündels) je Pipeline-Label: erster Zug (ms), Züge vor dem Bild und im Fenster Bild … Bild + 600 ms, getrennt nach
// Hauptbild der Welt-Szene (h), Wurf der Welt (w: jede andere Kamera auf die Welt-Szene bzw. „Shadow Map“) und anderer Szene (a:
// Einmal-Render, Karten-Bühne, Bühnen), dazu Ecken × Instanzen des größten Zugs und der Name des ersten Objekts.
// `extra.zug = { je: { label: [erst, h vor, w vor, a vor, h im, w im, a im, größter Zug, Objekt] }, bildMs, fehler }`.
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const Z = (X.zug = { je: {}, bildMs: null, fehler: "", zuege: 0 });
    const wer = (o) => {
        if (!o) return "?";
        if (o.isGeometrieArena && Array.isArray(o.glieder))
            return "Arena[" + o.glieder.slice(0, 3).map((g) => (g.userData && g.userData.archInstanceKey) || g.name || g.type).join(", ") + (o.glieder.length > 3 ? ", … " + o.glieder.length : "") + "]";
        return (o.name || (o.userData && (o.userData.inventar || o.userData.archInstanceKey)) || o.type) + (o.parent && o.parent.name ? " < " + o.parent.name : "");
    };
    let gehakt = false;
    const haken = (r) => {
        const rend = r.state && r.state.renderer;
        if (!rend || rend._isHeadlessNull || !rend.backend || typeof rend.backend.draw !== "function") return false;
        const be = rend.backend;
        const D0 = be.draw;
        be.draw = function (ro, info) {
            try {
                const jetzt = performance.now();
                const bild = r.state._weltbildDa;
                if (bild && Z.bildMs === null) Z.bildMs = Math.round(jetzt);
                if (!bild || jetzt - Z.bildMs <= 600) {
                    const E = r._erstZeichnung;
                    let label = E && ro.pipeline ? E.namen.get(ro.pipeline) : null;
                    if (!label) {
                        const g = ro.pipeline ? this.get(ro.pipeline) : null;
                        label = (g && g.pipeline && g.pipeline.label) || "?" + ((ro.material && (ro.material.name || ro.material.type)) || "");
                    }
                    label = String(label).replace("renderPipeline_", "");
                    const s = ro.scene;
                    const art = s === r.state.scene ? (ro.camera === r.state.camera ? 0 : 1) : /^Shadow Map/.test((s && s.name) || "") ? 1 : 2;
                    const dp = ro.getDrawParameters();
                    const n = dp ? (dp.vertexCount | 0) * Math.max(1, dp.instanceCount | 0) : 0;
                    let e = Z.je[label];
                    if (!e) e = Z.je[label] = [Math.round(jetzt), 0, 0, 0, 0, 0, 0, 0, wer(ro.object)];
                    if (n > 0) e[(bild ? 4 : 1) + art]++;
                    if (n > e[7]) e[7] = n;
                    Z.zuege++;
                }
            } catch (err) {
                Z.fehler = "Zug: " + String(err.message);
            }
            return D0.call(this, ro, info);
        };
        return true;
    };
    const L0 = P._ladeFrist;
    P._ladeFrist = function (...a) {
        if (!gehakt) {
            try {
                gehakt = haken(this);
            } catch (err) {
                Z.fehler = "Haken: " + String(err.message);
            }
        }
        return L0.apply(this, a);
    };
    const C0 = P._configureRenderer;
    P._configureRenderer = function (...a) {
        const aus = C0.apply(this, a);
        if (!gehakt) {
            try {
                gehakt = haken(this);
            } catch (err) {
                Z.fehler = "Haken: " + String(err.message);
            }
        }
        return aus;
    };
}
// Messung ohne Eingriff — (1) DER KNOTEN-BAU NACH STUFEN: die Zeit im Ruf von `_knotenRate`, geteilt an jedem Stufen-Wechsel des
// Bauers (`setBuildStage`): vor (prebuild und Buchführung) · setup · analyze · generate · code (buildCode, Zustand) —
// `extra.stufen = { ms: {...}, bauer }` bis zum ersten Weltbild. (2) DAS ERSTE BILD: die Leinwand im Task des ersten Renders nach
// dem Weltbild (`erstbild`) und drei Sekunden danach (`nach3`), hinter `_kontaktPassZeichne` (derselbe Task wie der Render).
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const S = (X.stufen = { ms: { vor: 0, setup: 0, analyze: 0, generate: 0, code: 0 }, bauer: 0, fehler: "" });
    let inRuf = false, tLast = 0, stufe = "vor";
    const gehakt = new WeakSet();
    const K1 = P._knotenRate;
    P._knotenRate = function (N, ro, E) {
        if (this.state._weltbildDa) return K1.call(this, N, ro, E);
        try {
            if (!gehakt.has(N)) {
                gehakt.add(N);
                const C0 = N._createNodeBuilder;
                N._createNodeBuilder = function (...a) {
                    const b = C0.apply(this, a);
                    try {
                        S.bauer++;
                        const s0 = b.setBuildStage;
                        b.setBuildStage = function (s) {
                            if (inRuf) {
                                const t = performance.now();
                                S.ms[stufe] += t - tLast;
                                tLast = t;
                                stufe = s === null ? "code" : s in S.ms ? s : "vor";
                            }
                            return s0.call(this, s);
                        };
                    } catch (err) {
                        S.fehler = "Bauer: " + String(err.message);
                    }
                    return b;
                };
            }
        } catch (err) {
            S.fehler = "Haken: " + String(err.message);
        }
        inRuf = true;
        tLast = performance.now();
        stufe = "vor";
        try {
            return K1.call(this, N, ro, E);
        } finally {
            S.ms[stufe] += performance.now() - tLast;
            inRuf = false;
        }
    };
    const B = (X.erstbild = { bilder: [], fehler: "" });
    const bild = (r, name) => {
        try {
            const c = r.state.renderer.domElement;
            const daten = c.toDataURL("image/jpeg", 0.85);
            B.bilder.push([name, Math.round(performance.now()), c.width + "x" + c.height, daten.length]);
            fetch("/__bild", { method: "POST", body: JSON.stringify({ name, daten }) }).catch(() => {});
        } catch (err) {
            B.fehler = "Bild " + name + ": " + String(err.message);
        }
    };
    let erst = null, nach = false;
    const Z0 = P._kontaktPassZeichne;
    P._kontaktPassZeichne = function (...a) {
        const aus = Z0.apply(this, a);
        try {
            const da = this.state._weltbildDa;
            if (da && erst === null) {
                erst = performance.now();
                bild(this, "erstbild");
            } else if (erst !== null && !nach && performance.now() - erst >= 3000) {
                nach = true;
                bild(this, "nach3");
            }
        } catch (err) {
            B.fehler = String(err.message);
        }
        return aus;
    };
}
