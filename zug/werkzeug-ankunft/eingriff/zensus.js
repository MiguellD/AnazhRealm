// Aufruf: FREI_EINGRIFF=<ort>/eingriff/zensus.js FREI_ZERLEGE=1 FREI_NACH=3000 FREI_JSON=<lauf>.json node <ort>/frei-sonde.cjs   (der Treiber setzt ihn)
// Entstanden gegen im Schirm am ersten Bild: Zensus des Stands, Szene-Gruppen und die Pixel je Programm über die Okklusions-Abfrage
// des Vendors (extra.zensus), dazu die Züge je Pipeline (extra.zug) und das erste Bild.
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
// Messung ohne Eingriff — ENTSTANDEN GEGEN IM SCHIRM, am ersten Weltbild:
// (1) der ZENSUS DES STANDS: jede Sammlung von `state` (Array, Map, Set) mit ihrer Größe; tragen ihre Glieder eine Lage (position
//     oder cx/cz), dazu wie viele im ersten Blick liegen (`_imErstenBlick`, der Kegel der Ankunft) — `extra.zensus.stand`.
// (2) die SZENE: je Name-Gruppe der zeichnenden Dinge der Welt-Szene Zahl, Instanzen, Dreiecke — `extra.zensus.szene`.
// (3) die PIXEL: nach dem Bild trägt jedes zeichnende Ding der Welt-Szene außerhalb eines Bündels die Okklusions-Abfrage des
//     Vendors (`occlusionTest`); eine Sekunde später liest die Sonde je Pipeline-Label, ob EINES ihrer Dinge Proben durchließ
//     (`extra.zensus.pixel = { label: [Dinge, sichtbar, verdeckt, ohne Antwort, im Bündel] }`).
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const Z = (X.zensus = { stand: {}, szene: {}, pixel: {}, fehler: "", wann: null, gelesen: null, buendel: 0, gefragt: 0 });
    const gruppe = (o) => {
        if (o.isGeometrieArena && Array.isArray(o.glieder)) {
            const g = o.glieder[0];
            return "Arena[" + String((g && ((g.userData && g.userData.archInstanceKey) || g.name || g.type)) || "").replace(/[|:#].*$/, "") + "]";
        }
        return String(o.name || (o.userData && (o.userData.inventar || o.userData.archInstanceKey)) || o.type).replace(/[|:#].*$/, "").replace(/[-_ ]?\d+(,-?\d+)*$/, "");
    };
    const lage = (e) => {
        if (!e || typeof e !== "object") return null;
        const p = e.position || (e.mesh && e.mesh.position) || (e.pos && typeof e.pos.x === "number" ? e.pos : null);
        if (p && typeof p.x === "number" && typeof p.z === "number") return [p.x, p.z];
        return null;
    };
    let hauptCtx = null, be = null, phase = 0, t1 = 0;
    const jeLabel = new Map(); // Label → Set der Dinge, die es im Hauptbild zogen
    const gefragt = new Set();
    const gezogen2 = new Set();
    const imBuendel = (o) => {
        for (let x = o; x; x = x.parent) if (x.isBundleGroup) return true;
        return false;
    };
    const haken = (r) => {
        be = r.state.renderer.backend;
        const D0 = be.draw;
        be.draw = function (ro, info) {
            try {
                if (phase >= 1 && ro.scene === r.state.scene && ro.camera === r.state.camera) {
                    hauptCtx = ro.context;
                    const E = r._erstZeichnung;
                    const label = String((E && ro.pipeline && E.namen.get(ro.pipeline)) || "?").replace("renderPipeline_", "");
                    let s = jeLabel.get(label);
                    if (!s) jeLabel.set(label, (s = new Set()));
                    s.add(ro.object);
                    if (phase === 2) gezogen2.add(ro.object);
                }
            } catch (err) {
                Z.fehler = "Zug: " + String(err.message);
            }
            return D0.call(this, ro, info);
        };
    };
    const zensus = (r) => {
        const st = r.state;
        const ding = r.constructor.ERSTER_BLICK.dingM;
        const { span } = r._voxelChunkConfig();
        for (const k of Object.keys(st)) {
            const v = st[k];
            let glieder = null;
            if (Array.isArray(v)) glieder = v;
            else if (v instanceof Map) glieder = [...v.entries()].map(([key, e]) => (e && typeof e === "object" ? Object.assign(Object.create(e), { __key: key }) : { __key: key }));
            else if (v instanceof Set) glieder = [...v];
            if (!glieder || glieder.length < 2) continue;
            let mit = 0, imBlick = 0;
            for (const e of glieder.slice(0, 20000)) {
                let p = lage(e);
                if (!p && e && typeof e.__key === "string" && /^-?\d+,-?\d+$/.test(e.__key)) {
                    const [cx, cz] = e.__key.split(",").map(Number);
                    p = [(cx + 0.5) * span, (cz + 0.5) * span, span * Math.SQRT1_2];
                }
                if (!p) continue;
                mit++;
                if (r._imErstenBlick(p[0], p[1], p[2] || ding)) imBlick++;
            }
            Z.stand[k] = mit ? [glieder.length, mit, imBlick] : [glieder.length];
        }
        st.scene.traverse((o) => {
            if (!(o.isMesh || o.isPoints || o.isLine || o.isGeometrieArena) || !o.geometry) return;
            let sichtbar = true;
            for (let x = o; x; x = x.parent) if (x.visible === false) sichtbar = false;
            if (!sichtbar) return;
            const n = gruppe(o);
            const e = Z.szene[n] || (Z.szene[n] = [0, 0, 0]);
            const inst = o.isInstancedMesh ? o.count : o.isGeometrieArena && Array.isArray(o.glieder) ? o.glieder.length : Math.max(1, (o.geometry.instanceCount > 0 && isFinite(o.geometry.instanceCount) ? o.geometry.instanceCount : 1) | 0);
            const g = o.geometry;
            const ecken = g.index ? g.index.count : g.attributes.position ? g.attributes.position.count : 0;
            e[0]++;
            e[1] += inst;
            e[2] += Math.round((ecken / 3) * (o.isGeometrieArena ? 1 : inst));
        });
    };
    const K0 = P._kontaktPassZeichne;
    P._kontaktPassZeichne = function (...a) {
        const aus = K0.apply(this, a);
        try {
            const jetzt = performance.now();
            if (phase === 0 && this.state._weltbildDa) {
                phase = 1;
                Z.wann = Math.round(jetzt);
                haken(this);
                zensus(this);
                t1 = jetzt;
            } else if (phase === 1 && jetzt - t1 > 250) {
                // jedes Ding, das im Hauptbild zog, bekommt die Abfrage — außer im Bündel (dort gibt es keine)
                phase = 2;
                t1 = jetzt;
                for (const s of jeLabel.values())
                    for (const o of s) {
                        if (imBuendel(o)) continue;
                        o.occlusionTest = true;
                        gefragt.add(o);
                    }
                Z.gefragt = gefragt.size;
            } else if (phase === 2 && jetzt - t1 > 1200) {
                phase = 3;
                const d = hauptCtx ? be.get(hauptCtx) : null;
                const occ = d && d.occluded;
                Z.gelesen = occ ? "ja" : "keine Antwort des Backends";
                for (const [label, s] of jeLabel) {
                    const e = [s.size, 0, 0, 0, 0];
                    for (const o of s) {
                        if (!gefragt.has(o)) e[4]++;
                        else if (!occ || !gezogen2.has(o)) e[3]++;
                        else if (occ.has(o)) e[2]++;
                        else e[1]++;
                    }
                    Z.pixel[label] = e;
                }
                for (const o of gefragt) o.occlusionTest = false;
            }
        } catch (err) {
            Z.fehler = String(err && err.stack ? err.stack : err).slice(0, 300);
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
