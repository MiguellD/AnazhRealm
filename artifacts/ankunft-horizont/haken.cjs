// MESS-VEHIKEL w26-ankunft-horizont (nur WIP, fällt vor der Abgabe; aus w25-ankunft-block): `node -r ./artifacts/ankunft-horizont/haken.cjs scripts/diag-boot-stage.cjs …`
// Dazu der Weg des Horizonts (hz-teile.cjs): im Faden Ankunft · Start · Ende jedes Fern-Auftrags und der Halt auf die Regionen
// (Text-Tausch im voxel-worker.js über den Statik-Server), in der Seite die Geburt der Fäden, je Auftrag Senden/Antwort, der
// Stand des Horizonts je 100 ms und die Zeugen der Bauten.
// hängt an jede Seite der Kalt-Zeile den Bau-Haken: jeder Knoten-Bau (r184 `Nodes.getForRender` ohne Stand, der Bau in Raten
// `_knotenRate`, der Abschluss `_createNodeBuilderState` mit der Länge seines Codes) als Ereignis [t, ms, Stoff, Art, Länge, Szene]
// in `window.__kalt.bau` — die Kalt-Zeile legt `__kalt` ins JSON.
"use strict";
const path = require("path");
const wb = require(path.resolve("scripts/lib/welt-boot.cjs"));
const { faedenWandle, SEITE_HAKEN } = require("./hz-teile.cjs");

function BAU_HAKEN() {
    const ev = [];
    const buch = () => window.__kalt && (window.__kalt.bau = ev);
    const szene = (s) => {
        const r = window.anazhRealm;
        if (!r || !s) return "?";
        if (s === r.state.scene) return "W";
        if (s === r._buehneJetzt) return "B";
        if (r._karteBuehneSatz && s === r._karteBuehneSatz.szene) return "K";
        return "E";
    };
    const name = (m, o) => {
        if (!m) return "?";
        const sch = m.isShadowPassMaterial === true;
        const u = sch && o && o.material && !Array.isArray(o.material) ? o.material : m;
        const g = o && o.geometry;
        const wer = (o && ((o.userData && o.userData.inventar) || o.name || (o.isInstancedMesh ? "Inst" : o.type))) || "?";
        return String(u.name || u.type || "?").replace(/NodeMaterial$/, "").slice(0, 32) + "@" + String(wer).slice(0, 28) + (g && g.name ? ":" + String(g.name).slice(0, 20) : "") + (sch ? "⟂" : "");
    };
    const zeit = (t0) => Math.round((performance.now() - t0) * 10) / 10;
    // DER NACH-BILD-REKORDER: vom Weltbild bis +4 s je rAF [t, x, z, imFlug, gerendert, ausgesetzt, gehalten, Takt-ms] und je
    // W-Taste [t, repeat, Ladeschirm steht] — in `window.__kalt.nach`
    const N = { keys: [], frames: [] };
    const schirm = () => {
        const el = document.getElementById("ladeschirm");
        return el && !el.hidden && !el.classList.contains("weg") ? 1 : 0;
    };
    window.addEventListener("keydown", (e) => e.code === "KeyW" && N.keys.push([Math.round(performance.now()), e.repeat ? 1 : 0, schirm()]), true);
    // DIE GPU-BAUTEN: je Pipeline und Shader-Modul [t, Art, Label, Länge] (s = synchron, a = asynchron, c = compute, m = Modul,
    // w = writeTexture-Bytes) in `__kalt.nach.gpu`
    N.gpu = [];
    if (typeof GPUDevice !== "undefined") {
        const P = GPUDevice.prototype;
        const hake = (m, art, len) => {
            const f = P[m];
            if (typeof f !== "function") return;
            P[m] = function (d) {
                const t0 = performance.now();
                try {
                    return f.apply(this, arguments);
                } finally {
                    const r = window.anazhRealm;
                    const nach = !!(r && r.state && r.state._weltbildDa);
                    // nach dem Bild: wer im Stamm bestellte (die ersten zwei Glieder des Stapels aus stamm/)
                    const lim = Error.stackTraceLimit;
                    Error.stackTraceLimit = 60;
                    const stapel = nach ? new Error().stack || "" : "";
                    Error.stackTraceLimit = lim;
                    const wer = nach
                        ? stapel
                              .split("\n")
                              .filter((z) => /stamm\//.test(z) && !/bild-kosten\.js/.test(z))
                              .slice(0, 3)
                              .map((z) => (/at (?:[\w.]+\.)?([\w$]+) /.exec(z) || [0, "?"])[1])
                              .join("<")
                        : "";
                    N.gpu.push([Math.round(t0), art, String((d && d.label) || "").slice(0, 40), len(d), Math.round((performance.now() - t0) * 10) / 10, wer]);
                }
            };
        };
        hake("createRenderPipeline", "s", () => 0);
        hake("createRenderPipelineAsync", "a", () => 0);
        hake("createComputePipeline", "c", () => 0);
        hake("createComputePipelineAsync", "C", () => 0);
        hake("createShaderModule", "m", (d) => (d && d.code ? d.code.length : 0));
    }
    // DIE FOUNDRY BIS ZUM BILD: je Auftrag beim Senden [t, Art, Preset, Stufe] (je reqId), bei der Antwort [t, gebaut] und beim
    // Einreihen [t, Art, Preset, Stufe, im Blick] — `__kalt.nach.werk`
    N.werk = { post: {}, ant: {}, enq: [] };
    if (typeof Worker !== "undefined") {
        const wpm = Worker.prototype.postMessage;
        Worker.prototype.postMessage = function (m) {
            if (m && m.reqId && m.type) N.werk.post[m.reqId] = [Math.round(performance.now()), m.type, String(m.presetId || m.id || m.kind || "").slice(0, 22), m.lod];
            return wpm.apply(this, arguments);
        };
    }
    const raf = (t) => {
        const r = window.anazhRealm;
        const st = r && r.state;
        const da = st && st._weltbildDa;
        if (da && !N.faeden && r._foundry) [N.faeden, N.kerne] = [((r._foundry.helfer || []).length | 0) + 1, navigator.hardwareConcurrency];
        if (da && t - da < 4000) {
            const p = st.playerMesh && st.playerMesh.position;
            const L = r._gpuLeine || {};
            const g = st.verbTafel ? Object.keys(st.verbTafel.gehalten).filter((k) => st.verbTafel.gehalten[k]).join("+") : "?";
            N.frames.push([Math.round(t), p ? Math.round(p.x * 100) / 100 : null, p ? Math.round(p.z * 100) / 100 : null, L.imFlug, L.gerendert, L.ausgesetzt, g]);
        }
        if (window.__kalt) window.__kalt.nach = N;
        if (!da || t - da < 4000) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    const anNodes = (N) => {
        if (!N || N.__bauHaken) return;
        N.__bauHaken = true;
        const gfr = N.getForRender;
        N.getForRender = function (ro) {
            if (this.get(ro).nodeBuilderState !== undefined) return gfr.apply(this, arguments);
            const t0 = performance.now();
            try {
                return gfr.apply(this, arguments);
            } finally {
                ev.push([Math.round(t0), zeit(t0), name(ro.material, ro.object), "v", 0, szene(ro.scene)]);
                buch();
            }
        };
        const cs = N._createNodeBuilderState;
        N._createNodeBuilderState = function (b) {
            const s = cs.apply(this, arguments);
            const len = ["vertexShader", "fragmentShader", "computeShader"].reduce((n, k) => n + (typeof b[k] === "string" ? b[k].length : 0), 0);
            ev.push([Math.round(performance.now()), 0, name(b.material, b.object), "f", len, szene(b.scene)]);
            buch();
            return s;
        };
    };
    const warte = setInterval(() => {
        const T = window.THREE;
        if (T && T.WebGPURenderer && !T.WebGPURenderer.prototype.__bauHaken) {
            const P = T.WebGPURenderer.prototype;
            P.__bauHaken = true;
            const init = P.init;
            P.init = async function () {
                const x = await init.apply(this, arguments);
                anNodes(this._nodes);
                return x;
            };
        }
        const r = window.anazhRealm;
        if (r && r.state && r.state.renderer && r.state.renderer._nodes) anNodes(r.state.renderer._nodes);
        // eslint-disable-next-line no-undef
        const A = typeof AnazhRealm !== "undefined" ? AnazhRealm : null;
        // die Bilder und die Jobs des Takts bis zum Weltbild: [t, ms] je `_loopRender` und je `_runFrameScheduler`
        if (A && A.prototype._loopRender && !A.prototype._loopRender.__haken) {
            N.lade = [];
            N.jobs = [];
            for (const [m, L] of [["_loopRender", N.lade], ["_runFrameScheduler", N.jobs]]) {
                const f = A.prototype[m];
                A.prototype[m] = function () {
                    const t0 = performance.now();
                    try {
                        return f.apply(this, arguments);
                    } finally {
                        if (!(this.state && this.state._weltbildDa) || L.length === 0 || L[L.length - 1][2] !== 1)
                            L.push([Math.round(t0), Math.round((performance.now() - t0) * 10) / 10, this.state && this.state._weltbildDa ? 1 : 0]);
                    }
                };
                A.prototype[m].__haken = true;
            }
        }
        // DIE GLIEDER VOR DEM BILD: Σ ms und Zahl je Name bis zum Weltbild (`__kalt.nach.glied`); die Jobs des Planers je Name
        // (`job:<name>`), die Karte nach im/außer Blick (`karte:blick`/`karte:ausser`), dazu die Zeit des Bilds aus der Ferne
        if (A && A.prototype._dispatchFrameJobs && !A.prototype._dispatchFrameJobs.__haken) {
            const G = (N.glied = {});
            const vorBild = () => !(window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state._weltbildDa);
            const buche = (name, t0) => {
                const r = window.anazhRealm;
                if (r && r.state && r.state._weltbildDa) return;
                const g = G[name] || (G[name] = [0, 0]);
                const ms = performance.now() - t0;
                g[0] += ms;
                g[1]++;
                const sk = Math.floor(t0 / 1000);
                const S = N.sek || (N.sek = {});
                const j = S[sk] || (S[sk] = {});
                j[name] = (j[name] || 0) + ms;
            };
            const djob = A.prototype._dispatchFrameJobs;
            A.prototype._dispatchFrameJobs = function (jobs, B) {
                for (const j of jobs || []) {
                    const run = j.run;
                    j.run = function () {
                        const t0 = performance.now();
                        try {
                            return run.apply(this, arguments);
                        } finally {
                            buche("job:" + j.name, t0);
                        }
                    };
                }
                return djob.call(this, jobs, B);
            };
            A.prototype._dispatchFrameJobs.__haken = true;
            // die Ferne der Wiese: gebaute und gefallene Kacheln je Takt (`fern:gebaut`, `fern:gefallen` — die Zahl in g[1])
            const ft = A.prototype._nahWieseFernTakt;
            A.prototype._nahWieseFernTakt = function () {
                const o = ft.apply(this, arguments);
                const r = window.anazhRealm;
                if (o && !(r && r.state && r.state._weltbildDa))
                    for (const k of ["gebaut", "gefallen"]) {
                        const g = G["fern:" + k] || (G["fern:" + k] = [0, 0]);
                        g[1] += o[k] || 0;
                    }
                return o;
            };
            // der Grund jedes Lade-Bilds: die Uhr, die Schuld der Erst-Zeichnung oder ein Bild ohne Lücke (`lade:<grund>`, Zahl in g[1])
            const lbf = A.prototype._ladeBildFaellig;
            A.prototype._ladeBildFaellig = function (L) {
                const E = this._erstZeichnung;
                const schuld = !!E && E.ladeSchuld === true && L.ladeVorher !== true;
                const uhr = performance.now() - (L.ladeBild || -Infinity) >= AnazhRealm.LADE_BILD_MS;
                const da = lbf.apply(this, arguments);
                if (da && this._ladeTakt()) {
                    const g = G["lade:" + (uhr ? "uhr" : schuld ? "schuld" : "ganz")] || (G["lade:" + (uhr ? "uhr" : schuld ? "schuld" : "ganz")] = [0, 0]);
                    g[1]++;
                }
                return da;
            };
            const namen = ["_nahWieseFernKachel", "_nahWieseKachelBueschel", "_tickNahWiese", "_tickNahStreu", "_tickScatterStreaming", "_tickPendingGrass", "_wieseFernLage", "_nahWieseFernTakt", "_tickPendingVegSpawns", "_tickHuellenNach", "_tickArchitectureLOD", "_tickImpostorBake", "_tickScatterLod", "_tickFernRing", "_tickWegeKarte", "_wegeRaeumen", "_tickCanopyStreaming", "_tickWorldWaterCA", "_tickDirtyVoxelChunks", "_tickFoundryIngest", "_loopPhysicsSync", "_loopFixedStep", "tickDayNight", "_loopRender", "_ankunftsBild", "_weltbildLuecken", "_vorbauBedienung", "_atmoTakt", "_ensureSkyEnvironment"];
            for (const m of namen) {
                const f = A.prototype[m];
                if (typeof f !== "function") continue;
                A.prototype[m] = function () {
                    const t0 = performance.now();
                    try {
                        return f.apply(this, arguments);
                    } finally {
                        buche(m, t0);
                    }
                };
                A.prototype[m].__haken = f.__haken;
            }
            const kb = A.prototype._karteWeltBacken;
            N.kb = [];
            N.kt = [];
            if (typeof kb === "function")
                A.prototype._karteWeltBacken = function (at, z) {
                    const t0 = performance.now();
                    const im = !(z && Number.isFinite(z._bedarfD2) && z._bedarfD2 >= 1e12);
                    let grund = "";
                    try {
                        const R = this._karteRechnerSatz;
                        if (z._platte === false) grund = "P";
                        else if (at.fmt === "bc" && !(R && R.bereit)) grund = "R";
                        else if (at.offen && at.offen.z !== z) grund = "O";
                        else {
                            const lod = this._karteStufe(z.preset);
                            if (this._foundryCacheGet(this._foundryKoerperKey(z.preset, z.variant, lod, z.ov)) === undefined) grund = "L";
                        }
                    } catch (e) {
                        grund = "?";
                    }
                    let e;
                    try {
                        e = kb.apply(this, arguments);
                        return e;
                    } finally {
                        buche(im ? "karte:blick" : "karte:ausser", t0);
                        if (vorBild()) N.kb.push([Math.round(t0), Math.round((performance.now() - t0) * 10) / 10, String(z.key).replace(/^fimp:/, "").slice(0, 12), e === null ? "n" : e === 0 ? "0" : e === true ? "T" : String(e), grund, at.offen ? at.offen.r + "/" + at.offen.v : "-", im ? 1 : 0]);
                    }
                };
            const tkw = A.prototype._tickKarteWelt;
            if (typeof tkw === "function")
                A.prototype._tickKarteWelt = function (at) {
                    const t0 = performance.now();
                    const rest = this._ladeTakt() ? Math.round(this._ladeFrist() - t0) : -1;
                    const straff = this._gpuLeineStraff() ? 1 : 0;
                    const q = (this._impostorBakeQueue || []).length;
                    const n = tkw.apply(this, arguments);
                    const h = this._bauHunger && this._bauHunger.get("karte");
                    if (vorBild()) N.kt.push([Math.round(t0), Math.round((performance.now() - t0) * 10) / 10, n, rest, straff, this._ladeBildTakt ? 1 : 0, q, h ? h.hunger : -1]);
                    return n;
                };
        }
        if (r && r.state && r.state._fernbildDa && !N.fernbild) N.fernbild = Math.round(r.state._fernbildDa);
        if (A && A.prototype._foundryAntwort && !A.prototype._foundryAntwort.__haken && A.prototype._streuWeckerSpannen && A.prototype._streuRegionWeiter && A.prototype._karteGebacken && A.prototype._foundryEnsureImpostorRecord && A.prototype._foundryZug && A.prototype._feldPanoramaRechnen && A.prototype._feldPassMal) {
            const fa = A.prototype._foundryAntwort;
            A.prototype._foundryAntwort = function (f, m) {
                if (m && m.reqId) N.werk.ant[m.reqId] = [Math.round(performance.now()), m.bau ? 1 : 0];
                return fa.apply(this, arguments);
            };
            A.prototype._foundryAntwort.__haken = true;
            const au = A.prototype._foundryAuftrag;
            A.prototype._foundryAuftrag = function (f, praefix, msg, wo) {
                let blick = -1;
                try {
                    blick = this._foundryAuftragD2(wo) < AnazhRealm.ERSTER_BLICK.ausserD2 ? 1 : 0;
                } catch {}
                N.werk.enq.push([Math.round(performance.now()), msg && msg.type, String((msg && (msg.presetId || msg.id || msg.kind)) || "").slice(0, 22), msg && msg.lod, blick]);
                return au.apply(this, arguments);
            };
            // DIE KETTE DER KARTE und DER WECKER DER STREU bis zum Bild: je Karten-Zelle [angelegt, gebacken, im Blick]
            // (`__kalt.nach.werk.krt`), je Region ihr Wecker [t, Region, hält das Bild, worauf sie wartet] und ihr Weiterbau
            // (`werk.streu`); jede Zusage trägt ihren Namen (`__wer`: der Körper-Schlüssel des Zugs, „K:“ die Karte)
            const vor = () => !(window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state._weltbildDa);
            const vorBild2 = vor;
            N.werk.krt = {};
            N.werk.streu = [];
            const er = A.prototype._foundryEnsureImpostorRecord;
            A.prototype._foundryEnsureImpostorRecord = function () {
                const z = er.apply(this, arguments);
                if (z && z.key) {
                    if (z.ende && !z.ende.__wer) z.ende.__wer = "K:" + z.key;
                    if (!N.werk.krt[z.key] && vor()) N.werk.krt[z.key] = [Math.round(performance.now()), 0, 0];
                }
                return z;
            };
            const kg = A.prototype._karteGebacken;
            A.prototype._karteGebacken = function (z) {
                const k = z && z.key && N.werk.krt[z.key];
                if (k && !k[1]) [k[1], k[2]] = [Math.round(performance.now()), z._imBlick === true ? 1 : 0];
                return kg.apply(this, arguments);
            };
            const fz = A.prototype._foundryZug;
            A.prototype._foundryZug = function (key) {
                const z = fz.apply(this, arguments);
                if (z && typeof z === "object" && !z.__wer) z.__wer = String(key);
                return z;
            };
            const ws = A.prototype._streuWeckerSpannen;
            A.prototype._streuWeckerSpannen = function (region) {
                const auf = region && region._zusagen ? [...region._zusagen.keys()].map((p) => (p && p.__wer) || "?") : [];
                const o = ws.apply(this, arguments);
                if (vor()) N.werk.streu.push([Math.round(performance.now()), region.regX + "," + region.regZ, region._bildWartet ? 1 : 0, auf.length + ":" + auf.slice(0, 4).join("+")]);
                return o;
            };
            // DER HORIZONT WIRD GEMALT: der Feld-Auftrag (gesendet), seine Antwort (das Panorama beginnt), das Panorama zurück
            // (`__kalt.nach.hz`: [t, was])
            N.hz = [];
            const fm = A.prototype._feldPassMal;
            if (typeof fm === "function")
                A.prototype._feldPassMal = function (fp) {
                    const vor = fp && fp.flug;
                    const o = fm.apply(this, arguments);
                    if (fp && !vor && fp.flug && vorBild2()) N.hz.push([Math.round(performance.now()), "feld"]);
                    return o;
                };
            const pm = A.prototype._feldPanoramaMal;
            if (typeof pm === "function")
                A.prototype._feldPanoramaMal = function (fp) {
                    const vor = fp && fp.panoFlug;
                    const o = pm.apply(this, arguments);
                    if (fp && !vor && fp.panoFlug && vorBild2()) N.hz.push([Math.round(performance.now()), "pano"]);
                    return o;
                };
            const pr = A.prototype._feldPanoramaRechnen;
            if (typeof pr === "function")
                A.prototype._feldPanoramaRechnen = function () {
                    const p = pr.apply(this, arguments);
                    if (p && p.then) p.then(() => vorBild2() && N.hz.push([Math.round(performance.now()), "zurück"]));
                    return p;
                };
            const rw = A.prototype._streuRegionWeiter;
            A.prototype._streuRegionWeiter = function (region) {
                if (vor()) N.werk.streu.push([Math.round(performance.now()), region.regX + "," + region.regZ, -1, "weiter"]);
                return rw.apply(this, arguments);
            };
        }
        if (A && A.prototype._knotenRate && !A.prototype._knotenRate.__haken) {
            const kr = A.prototype._knotenRate;
            A.prototype._knotenRate = function (N, ro, E) {
                const t0 = performance.now();
                try {
                    return kr.call(this, N, ro, E);
                } finally {
                    ev.push([Math.round(t0), zeit(t0), name(ro.material, ro.object), "r", 0, szene(ro.scene)]);
                    buch();
                }
            };
            A.prototype._knotenRate.__haken = true;
        }
        if (A && A.prototype._knotenRate.__haken && A.prototype._foundryAntwort.__haken && A.prototype._loopRender.__haken && r && r.state && r.state._weltbildDa && r.state.renderer && r.state.renderer._nodes && r.state.renderer._nodes.__bauHaken)
            clearInterval(warte);
    }, 5);
}

// der Statik-Server der Kalt-Zeile trägt den Faden-Haken (vor ihrem eigenen Tausch, der nur Kerne berührt)
const ss = wb.statikServer;
wb.statikServer = function (o = {}) {
    const eigen = o.wandle;
    return ss(Object.assign({}, o, { wandle: (p, roh) => {
        const x = eigen ? eigen(p, roh) : roh;
        return x == null ? x : faedenWandle(p, Buffer.isBuffer(x) ? x : Buffer.from(String(x)));
    } }));
};
const start = wb.starteBrowser;
wb.starteBrowser = async function (opts) {
    const b = await start(opts);
    const neu = b.newPage.bind(b);
    b.newPage = async function () {
        const p = await neu();
        await p.evaluateOnNewDocument(BAU_HAKEN);
        await p.evaluateOnNewDocument(SEITE_HAKEN);
        return p;
    };
    return b;
};
