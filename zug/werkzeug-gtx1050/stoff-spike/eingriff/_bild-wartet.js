// Messung ohne Eingriff bis zum Bild — WORAUF WARTET DAS ERSTE BILD? Je Pipeline, die bis zum ersten Weltbild entsteht:
// wann r184 sie anlegt (ms ab Navigation), ihr Etikett, das Ding und der Stoff ihres ersten Render-Objekts, Wurf (Schatten-Pass)
// oder Hauptbild, Bürger der Welt-Szene oder Einmal-Render, der Knoten-Bau ihres Bau-Schlüssels (ms ARBEIT im Haupt-Faden über
// alle Raten, Rufe, am Stück?) und die Draws (Ding|Render-Kontext), die mit ihr zeichnen.
// NACH dem Bild (eine eigene Aufgabe, die Welt steht still, nichts davon geht in die Zeiten ein): die DECKUNG je Pipeline — das
// Bild 10-mal gezeichnet ohne ihre Draws (die Erst-Zeichnung überspringt sie, jedes Bündel nimmt neu auf), gegen das Bezugsbild
// gezählt: Pixel, deren größter Kanal-Abstand > 20 von 255 ist. `boden`: derselbe Zähler Bezug gegen Bezug (Zitter, Wind, Körnung).
// → extra.wartet = { pipes: [[ms, Etikett, Ding, Wurf, Welt-Szene, Bau ms, Bau-Rufe, am Stück, Draws, Pixel|null, Kontext]], px: { w, h, boden, dauerMs }, fehler }
if (P && !P.__bildWartetMess) {
    P.__bildWartetMess = true;
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const M = (X.wartet = { pipes: [], px: null, fehler: "", verpasst: 0 });
    const jeP = new Map(); // r184-Pipeline → Eintrag
    const bau = new Map(); // Bau-Schlüssel → { ms, rufe, stueck }
    let verborgen = null;
    let welt = null;
    const wer = (o) => {
        if (o.isGeometrieArena && Array.isArray(o.glieder))
            return "Arena[" + o.glieder.slice(0, 4).map((g) => (g.userData && g.userData.archInstanceKey) || g.name || g.type).join(", ") + (o.glieder.length > 4 ? ", … " + o.glieder.length : "") + "]";
        const kette = [];
        for (let x = o; x && kette.length < 3; x = x.parent) kette.push(x.name || x.type);
        return kette.join(" < ") + (o.userData && o.userData.archInstanceKey ? " {" + o.userData.archInstanceKey + "}" : "");
    };
    const bauVon = (k) => {
        let b = bau.get(k);
        if (!b) bau.set(k, (b = { ms: 0, rufe: 0, stueck: 0 }));
        return b;
    };
    const A0 = P._erstAbsageWache;
    P._erstAbsageWache = function (renderer) {
        try {
            welt = this;
            const [PI, N] = [renderer._pipelines, renderer._nodes];
            if (PI && N && !PI.__wartetMess) {
                PI.__wartetMess = true;
                const merke = (ro) => {
                    const d = PI.get(ro);
                    const pl = d && d.pipeline;
                    if (!pl) return;
                    let e = jeP.get(pl);
                    if (!e) {
                        const m = ro.material || {};
                        e = { t: Math.round(performance.now()), label: "renderPipeline_" + (m.name || m.type) + "_" + m.id, ding: wer(ro.object), wurf: m.isShadowPassMaterial === true ? 1 : 0, szene: ro.scene === welt.state.scene ? 1 : 0, ctx: ro.context ? ro.context.id : -1, schluessel: N.getForRenderCacheKey(ro), keys: new Set(), px: null, rest: null };
                        jeP.set(pl, e);
                    }
                    e.keys.add(ro.object.id + "|" + (ro.context ? ro.context.id : -1));
                };
                for (const name of ["getForRender", "updateForRender"]) {
                    const f0 = PI[name];
                    PI[name] = function (ro, ...rest) {
                        const r = f0.call(this, ro, ...rest);
                        try {
                            merke(ro);
                        } catch (err) {
                            M.fehler = "merke: " + String(err.message);
                        }
                        return r;
                    };
                }
                // der Knoten-Bau am Stück (wer nicht in Raten baut: Einmal-Render, Bühne, der ruhende Loop)
                const g0 = N.getForRender;
                N.getForRender = function (ro, ...rest) {
                    const hatte = N.get(ro).nodeBuilderState !== undefined;
                    if (hatte) return g0.call(this, ro, ...rest);
                    const t0 = performance.now();
                    const r = g0.call(this, ro, ...rest);
                    const b = bauVon(N.getForRenderCacheKey(ro));
                    const dt = performance.now() - t0;
                    if (dt > 0.5) [b.ms, b.rufe, b.stueck] = [b.ms + dt, b.rufe + 1, b.stueck + 1];
                    return r;
                };
                // die Deckung: die Erst-Zeichnung überspringt die Draws der verborgenen Pipeline
                const z0 = renderer._renderObjectDirect;
                renderer._renderObjectDirect = function (object, ...rest) {
                    if (verborgen !== null && verborgen.has(object.id + "|" + this._currentRenderContext.id)) return;
                    return z0.call(this, object, ...rest);
                };
            } else if (!PI || !N) M.verpasst++;
        } catch (err) {
            M.fehler = "haken: " + String(err.message);
        }
        return A0.apply(this, arguments);
    };
    const K0 = P._knotenRate;
    P._knotenRate = function (N, ro, E) {
        const t0 = performance.now();
        const r = K0.call(this, N, ro, E);
        try {
            const b = bauVon(N.getForRenderCacheKey(ro));
            b.ms += performance.now() - t0;
            b.rufe++;
        } catch (err) {
            M.fehler = "rate: " + String(err.message);
        }
        return r;
    };
    const liste = () => {
        M.pipes = [...jeP.values()].map((e) => {
            const b = bau.get(e.schluessel) || { ms: 0, rufe: 0, stueck: 0 };
            return [e.t, e.label, e.ding, e.wurf, e.szene, Math.round(b.ms), b.rufe, b.stueck, e.keys.size, e.px, e.ctx, e.rest == null ? null : e.rest];
        });
    };
    const decke = (w) => {
        const t0 = performance.now();
        const ren = w.state.renderer;
        const c = ren.domElement;
        const k = document.createElement("canvas");
        [k.width, k.height] = [c.width, c.height];
        const g = k.getContext("2d", { willReadFrequently: true });
        const neu = () => w.state.scene.traverse((o) => void (o.isBundleGroup === true && (o.needsUpdate = true)));
        // EIN BILD DER ZÄHLUNG: NS Bilder Einschwingen (die zeitliche Auflösung vergisst das Bild davor), dann das Mittel über NM
        // Bilder (Zitter und Körnung mitteln sich) — als Summe je Kanal
        const [NS, NM] = [30, 8];
        // die Uhr der Seite steht während der Zählung (Wolken, Wind und jede Bewegung der Knoten-Zeit fielen sonst als Drift in
        // den Zähler), und jede Schatten-Karte zeichnet in jedem Bild neu (`_schattenAlleNeu`: sonst sähe die Zählung den Wurf nie)
        const uhr = performance.now.bind(performance);
        const steht = uhr();
        const einBild = () => {
            performance.now = () => steht;
            try {
                w._schattenAlleNeu();
                ren._nodes.nodeFrame.update();
                w._loopRender();
            } finally {
                performance.now = uhr;
            }
        };
        const bild = () => {
            neu();
            for (let i = 0; i < NS; i++) einBild();
            const s = new Uint16Array(k.width * k.height * 3);
            for (let j = 0; j < NM; j++) {
                einBild();
                g.drawImage(c, 0, 0);
                const d = g.getImageData(0, 0, k.width, k.height).data;
                for (let i = 0, q = 0; i < d.length; i += 4, q += 3) [s[q], s[q + 1], s[q + 2]] = [s[q] + d[i], s[q + 1] + d[i + 1], s[q + 2] + d[i + 2]];
            }
            return s;
        };
        const S = 20 * NM;
        const zaehle = (a, b) => {
            let n = 0;
            for (let q = 0; q < a.length; q += 3)
                if (Math.abs(a[q] - b[q]) > S || Math.abs(a[q + 1] - b[q + 1]) > S || Math.abs(a[q + 2] - b[q + 2]) > S) n++;
            return n;
        };
        let ganz = bild();
        const zweites = bild();
        const boden = zaehle(ganz, zweites);
        ganz = zweites;
        const vor = [...jeP.values()].filter((e) => e.t <= w.state._weltbildDa + 50);
        for (const e of vor) {
            if (!e.szene) continue;
            verborgen = e.keys;
            let ohne;
            try {
                ohne = bild();
            } finally {
                verborgen = null;
            }
            const wieder = bild(); // die Erholung: wieder das ganze Bild — der Bezug dieses Schritts (die Drift der Welt fällt heraus)
            [e.px, e.rest, ganz] = [zaehle(ohne, wieder), zaehle(ganz, wieder), wieder];
        }
        M.px = { w: k.width, h: k.height, boden, dauerMs: Math.round(performance.now() - t0), pipelines: vor.length, NS, NM };
    };
    let getan = false;
    const Z0 = P._kontaktPassZeichne;
    P._kontaktPassZeichne = function (...a) {
        const aus = Z0.apply(this, a);
        if (!getan && this.state._weltbildDa) {
            getan = true;
            M.bildMs = Math.round(this.state._weltbildDa);
            liste();
            setTimeout(() => {
                try {
                    decke(this);
                } catch (err) {
                    M.fehler = "decke: " + String(err.message) + " " + String(err.stack || "").split("\n")[1];
                }
                liste();
            }, 0);
        }
        return aus;
    };
}
