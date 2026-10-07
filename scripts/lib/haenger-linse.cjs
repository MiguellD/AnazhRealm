// haenger-linse.cjs — DIE HÄNGER-LINSE (Welle K): jeder Frame über der Schwelle (100 ms) mit seiner URSACHE beim Namen.
// Befund OMEN V18.534 (GTX 1060, Regler voll, Mess-Wiese): Einzel-Frames von 0,4–1,7 s, öfter als in V18.533 — der
// Flugschreiber sah sie nur als „Frame max", die Hitch-Telemetrie (gate:hitch-telemetrie) zählt LongTasks, Pipelines
// und Upload-Bytes je SEKUNDE, nie je Hänger, und keine Linse sagte, WER den Frame trug.
//
// Ein Hänger ist ein Abstand zweier GERENDERTER Frames über der Schwelle (dieselbe Größe wie `werkbank lauf` frameMs,
// die der OMEN misst). Sein Fenster läuft vom Takt-Beginn des vorigen gerenderten Frames bis zum Takt-Beginn des
// Hänger-Frames — der vorige Takt selbst gehört dazu (trägt er 900 ms, kommt der nächste rAF 900 ms später). Die Linse
// zerlegt das Fenster in drei Zeiten des Haupt-Threads:
//   TAKT   — im Spiel-Takt (`_gameLoopTick`, synchron): die Engstelle ist der tiefste Rahmen des Takt-Profils, der
//            noch die Hälfte der Takt-Proben trägt (Chrome-Profiler, 1 ms), daneben die teuersten Selbst-Funktionen;
//   NEBEN  — außerhalb des Takts, aber auf dem Haupt-Thread (Worker-Antworten, Promise-Fortsetzungen, Zeitgeber): die
//            Engstelle wie oben aus den Neben-Proben, dazu die Long-Animation-Frame-Skripte (Aufrufer beim Namen);
//   GC     — der Garbage-Collector (Proben „(garbage collector)");
//   GPU    — der Haupt-Thread wartet (Proben „(idle)", oder Takte ohne Render unter der GPU-Leine): die Ursache steht
//            auf der GPU-Seite, die Linse nennt, was der Haupt-Thread ihr im Fenster aufgetragen hat — synchrone
//            Pipelines (`createRenderPipeline`, der GPU-Prozess kompiliert, bevor er das nächste Bild zeigt) mit ihrem
//            Stoff-Namen, Shader-Module, Upload-Bytes.
// Die größte der vier Zeiten ist die Klasse; die Tabelle zählt Hänger je Ursache (Klasse · Engstelle).
//
//   Seite:     HAENGER_INSTALL (idempotent; die Geräte-Haken und das LoAF-Ohr laufen nur, solange ein Lauf misst)
//              window.__haengerLauf({ sek, ein, regler, tiere, wandern, probe }) → Rohdaten (Takte, Pipelines, LoAF)
//   Werkbank:  node scripts/werkbank.cjs haenger [sek] [--ein s] [--regler voll|frei] [--tiere frei|halten]
//                                               [--wandern kreis] [--schwelle ms] [--probe] [--json datei]
//              node scripts/werkbank.cjs haenger --selbsttest     (ohne Welt: die Auswertung gegen erfundene Hänger)
//              node scripts/werkbank.cjs haenger --erst [ABBAABBA]   (die Erst-Probe, ABBA in einer Welt — unten)
//   `--probe` schmuggelt zwei Hänger bekannter Ursache in den echten Lauf (250 ms im Takt in `__haengerProbeTakt`,
//   250 ms neben dem Takt in `__haengerProbeNeben`) — die Linse muss beide beim Namen nennen, sonst Exit 1.

// ── Seite ───────────────────────────────────────────────────────────────────────────────────────────────────────────
function haengerAn() {
    if (window.__haengerH) return window.__haengerH;
    const leer = () => ({
        pipeSync: 0,
        pipeSyncMs: 0,
        pipeAsync: 0,
        compute: 0,
        shader: 0,
        shaderKB: 0,
        upKB: 0,
        texKB: 0,
    });
    const H = (window.__haengerH = { acc: leer(), namen: [], loaf: [], an: false, loafDa: false });
    // Je Pipeline der Auftraggeber: das Objekt, das der Renderer gerade zeichnet (`_renderObjectDirect`), mit Pass und
    // Täter-Klasse — eine synchrone Pipeline im Schatten-Pass heißt „k0 tier:wolf", nicht nur „ShadowMaterial".
    const name = (art, d) => {
        if (!H.an || H.namen.length >= 20000) return;
        const e = { t: +performance.now().toFixed(2), art, n: String((d && d.label) || "?") };
        const c = H.cur;
        if (c) {
            try {
                e.pass = window.__passName ? window.__passName(c.scene, c.camera) : "?";
                e.klasse = window.anazhRealm._taeterKlasse(c.object);
            } catch (_e) {
                e.pass = e.pass || "?";
            }
        } else e.pass = art === "sync" || art === "bau" ? "ausserhalb" : "kompilat";
        H.namen.push(e);
        return e;
    };
    const rend = window.anazhRealm && window.anazhRealm.state.renderer;
    // DER KNOTEN-BAU (r184 `Nodes.getForRender`): die CPU-Hälfte einer Erst-Zeichnung — der TSL-Graph des Stoffs wird zu
    // WGSL gebaut, synchron, wenn ein RenderObject zum ersten Mal zeichnet und sein Schlüssel nicht im Bau-Cache liegt.
    // Je synchronem Bau die Dauer, der Stoff und der Auftraggeber; ein asynchroner Bau (`buildAsync`, in Schritten mit
    // yieldToMain) zählt nur.
    const N = rend && rend._nodes;
    if (N && typeof N.getForRender === "function" && typeof N.getForRenderCacheKey === "function") {
        const gfr = N.getForRender;
        N.getForRender = function (ro, asyncBau) {
            const d = this.get(ro);
            if (d.nodeBuilderState !== undefined || this.nodeBuilderCache.get(this.getForRenderCacheKey(ro)) !== undefined)
                return gfr.apply(this, arguments);
            if (asyncBau) {
                H.acc.bauAsync = (H.acc.bauAsync || 0) + 1;
                return gfr.apply(this, arguments);
            }
            const t0 = performance.now();
            const s = gfr.apply(this, arguments);
            const ms = performance.now() - t0;
            H.acc.bauN = (H.acc.bauN || 0) + 1;
            H.acc.bauMs = (H.acc.bauMs || 0) + ms;
            const e = name("bau", { label: (ro.material && (ro.material.name || ro.material.type)) || "?" });
            if (e) e.ms = +ms.toFixed(1);
            return s;
        };
    }
    if (rend && typeof rend._renderObjectDirect === "function") {
        const rod = rend._renderObjectDirect;
        rend._renderObjectDirect = function (object, material, scene, camera) {
            const vor = H.cur;
            H.cur = { object, scene, camera };
            try {
                return rod.apply(this, arguments);
            } finally {
                H.cur = vor;
            }
        };
    }
    if (typeof GPUDevice !== "undefined") {
        const P = GPUDevice.prototype;
        const crp = P.createRenderPipeline;
        P.createRenderPipeline = function (d) {
            const t0 = performance.now();
            const p = crp.call(this, d);
            H.acc.pipeSync++;
            H.acc.pipeSyncMs += performance.now() - t0;
            name("sync", d);
            return p;
        };
        const crpa = P.createRenderPipelineAsync;
        P.createRenderPipelineAsync = function (d) {
            H.acc.pipeAsync++;
            name("async", d);
            return crpa.call(this, d);
        };
        for (const m of ["createComputePipeline", "createComputePipelineAsync"]) {
            const o = P[m];
            P[m] = function (d) {
                H.acc.compute++;
                name(m === "createComputePipeline" ? "compute" : "compute-async", d);
                return o.call(this, d);
            };
        }
        const csm = P.createShaderModule;
        P.createShaderModule = function (d) {
            H.acc.shader++;
            H.acc.shaderKB += ((d && d.code && d.code.length) || 0) / 1024;
            return csm.call(this, d);
        };
        const Q = GPUQueue.prototype;
        const wb = Q.writeBuffer;
        Q.writeBuffer = function (b, o, data, dOff, size) {
            const bpe = (data && data.BYTES_PER_ELEMENT) || 1;
            H.acc.upKB += (size != null ? size * bpe : (data && data.byteLength) || 0) / 1024;
            return wb.apply(this, arguments);
        };
        const wt = Q.writeTexture;
        Q.writeTexture = function (dst, data) {
            H.acc.texKB += ((data && data.byteLength) || 0) / 1024;
            return wt.apply(this, arguments);
        };
        const cei = Q.copyExternalImageToTexture;
        Q.copyExternalImageToTexture = function (src, dst, size) {
            const w = Array.isArray(size) ? size[0] : (size && size.width) || 0;
            const h = Array.isArray(size) ? size[1] || 1 : (size && size.height) || 1;
            H.acc.texKB += (w * h * 4) / 1024;
            return cei.apply(this, arguments);
        };
    }
    // DAS LoAF-OHR (Long Animation Frames, Chrome ≥ 123): je langem Frame die Skripte mit Aufrufer und Funktion — die
    // Neben-Zeit beim Namen auch dort, wo der Profiler nur „(anonym)" sähe.
    try {
        if (PerformanceObserver.supportedEntryTypes.includes("long-animation-frame")) {
            H.loafDa = true;
            new PerformanceObserver((l) => {
                if (!H.an) return;
                for (const e of l.getEntries())
                    if (H.loaf.length < 5000)
                        H.loaf.push({
                            start: +e.startTime.toFixed(1),
                            dauer: +e.duration.toFixed(1),
                            block: +(e.blockingDuration || 0).toFixed(1),
                            skripte: (e.scripts || []).map((s) => ({
                                aufrufer: s.invoker,
                                art: s.invokerType,
                                fn: s.sourceFunctionName || "",
                                datei: String(s.sourceURL || "")
                                    .split("/")
                                    .pop()
                                    .split("?")[0],
                                start: +s.startTime.toFixed(1),
                                dauer: +s.duration.toFixed(1),
                            })),
                        });
            }).observe({ type: "long-animation-frame", buffered: false });
        }
    } catch (_e) {
        H.loafDa = false;
    }
    return H;
}

// Die Eichmarke: eine benannte Schleife fester Dauer — ihre ersten Proben im Profil legen den Profiler-Takt auf die
// Uhr der Seite (performance.now()).
function haengerEichmarke(ms) {
    const t0 = performance.now();
    let x = 0;
    while (performance.now() - t0 < ms) x += Math.sqrt(x + 1);
    window.__haengerSenke = x;
    return t0;
}
// Die Probe-Lasten (`--probe`): bekannte Ursachen mit Namen.
function __haengerProbeTakt(ms) {
    const t0 = performance.now();
    let x = 0;
    while (performance.now() - t0 < ms) x += Math.sqrt(x + 2);
    window.__haengerSenke = x;
}
function __haengerProbeNeben(ms) {
    const t0 = performance.now();
    let x = 0;
    while (performance.now() - t0 < ms) x += Math.sqrt(x + 3);
    window.__haengerSenke = x;
}

// DER LAUF (Seiten-Kontext): der Spiel-Loop über rAF wie `werkbank lauf` (Bühne, Wetter-Wache, Ort-Takt, Regler-Decke,
// Tiere frei oder gehalten); je Takt Beginn, Ende, gerendert, die GPU-Leine und die Geräte-Aufträge im Takt und davor.
// `wandern: "kreis"` hält W gedrückt und dreht den Blick 0,08 rad/s (ein Kreis von ~60 m Radius um den Messort, der
// Spieler kehrt danach zurück).
function haengerLauf(k) {
    return (async () => {
        const r = window.anazhRealm;
        const st = r.state;
        const rend = st.renderer;
        const H = window.__haengerAn();
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        window.__buehne();
        if (k.tiere !== "frei" && window.__tiereHalten) window.__tiereHalten();
        const decke = st.perfTargetMs;
        if (k.regler === "voll") st.perfTargetMs = 1000;
        const ort = st.playerMesh.position.clone();
        const yaw0 = st.yaw;
        const T = { t: [], c0: [], c1: [], g: [], flug: [], innen: [], aussen: [] };
        const diff = (a, b) => {
            const o = {};
            for (const x in a) {
                const d = a[x] - (b[x] || 0);
                if (d) o[x] = +d.toFixed(2);
            }
            return Object.keys(o).length ? o : 0;
        };
        let messen = false,
            snap = Object.assign({}, H.acc),
            tWand = null,
            probeTakt = 0;
        rend.setAnimationLoop((t) => {
            window.__wetterHalten();
            const c0 = performance.now();
            const aussen = diff(H.acc, snap);
            snap = Object.assign({}, H.acc);
            const g0 = r._gpuLeine ? r._gpuLeine.gerendert : 0;
            if (messen && k.wandern === "kreis") {
                if (tWand == null) tWand = t;
                st.keys.w = true;
                st.yaw = yaw0 + ((t - tWand) / 1000) * 0.08;
            }
            try {
                if (window.__ortSchritt) window.__ortSchritt();
                if (probeTakt > 0) {
                    window.__haengerProbeTakt(probeTakt);
                    probeTakt = 0;
                }
                r._gameLoopTick(t);
            } catch (_e) {
                /* die Fehler-Grenze des Spiels zählt selbst; die Linse misst */
            }
            const c1 = performance.now();
            const innen = diff(H.acc, snap);
            snap = Object.assign({}, H.acc);
            if (!messen) return;
            T.t.push(+t.toFixed(2));
            T.c0.push(+c0.toFixed(2));
            T.c1.push(+c1.toFixed(2));
            T.g.push(!r._gpuLeine || r._gpuLeine.gerendert > g0 ? 1 : 0);
            T.flug.push(r._gpuLeine ? r._gpuLeine.imFlug : -1);
            T.innen.push(innen);
            T.aussen.push(aussen);
        });
        try {
            await sleep((k.ein || 0) * 1000);
            const eich0 = window.__haengerEichmarke(8);
            H.loaf.length = 0;
            H.namen.length = 0;
            H.an = true;
            messen = true;
            const tMess0 = performance.now();
            // die Erst-Zeichnung (der EINE Ort in _configureRenderer): ihre Zähler über den Lauf
            const erstStand = () => {
                const E = r._erstZeichnung;
                return E
                    ? { bauN: E.bauN, bauMs: E.bauMs, verschoben: E.verschoben, pipeAsync: E.pipeAsync, neubauN: E.neubauN || 0 }
                    : null;
            };
            const erst0 = erstStand();
            const probe = [];
            if (k.probe) {
                const dauer = k.sek * 1000;
                setTimeout(() => {
                    probe.push({ art: "takt", t: performance.now() });
                    probeTakt = 250;
                }, dauer / 3);
                setTimeout(
                    () => {
                        probe.push({ art: "neben", t: performance.now() });
                        window.__haengerProbeNeben(250);
                    },
                    (2 * dauer) / 3
                );
            }
            await sleep(k.sek * 1000);
            messen = false;
            H.an = false;
            const tMess1 = performance.now();
            const erst1 = erstStand();
            const eich1 = window.__haengerEichmarke(8);
            const pm = st.playerMesh.position;
            return {
                takte: T,
                namen: H.namen.slice(),
                loaf: H.loaf.slice(),
                loafDa: H.loafDa,
                eich: [eich0, eich1],
                tMess: [tMess0, tMess1],
                probe,
                k,
                spielerEnde: [pm.x, pm.z].map((x) => +x.toFixed(1)),
                kreaturen: st.creatures ? st.creatures.length : 0,
                chunks: st.voxelChunks ? st.voxelChunks.size : 0,
                loadScale: st.perfSense ? +st.perfSense.loadScale.toFixed(2) : null,
                wetter: st.weather,
                erst:
                    erst0 && erst1
                        ? {
                              bauN: erst1.bauN - erst0.bauN,
                              bauMs: +(erst1.bauMs - erst0.bauMs).toFixed(1),
                              verschoben: erst1.verschoben - erst0.verschoben,
                              pipeAsync: erst1.pipeAsync - erst0.pipeAsync,
                              neubauN: erst1.neubauN - erst0.neubauN,
                              offen: r._erstZeichnung.offen.size,
                          }
                        : null,
            };
        } finally {
            messen = false;
            H.an = false;
            rend.setAnimationLoop(null);
            st.keys.w = false;
            st.perfTargetMs = decke;
            if (k.wandern === "kreis") {
                st.playerMesh.position.copy(ort);
                st.yaw = yaw0;
            }
        }
    })();
}

// ── Auswertung (Node, rein) ─────────────────────────────────────────────────────────────────────────────────────────
const KLASSEN = ["TAKT", "NEBEN", "GC", "GPU"];

// Das Profil als Proben-Zeitreihe: je Probe die Zeit (Seiten-Uhr, ms) und ihr Knoten; je Knoten Eltern und Name.
function profilLesen(p) {
    const knoten = new Map();
    for (const n of p.nodes) knoten.set(n.id, { n, eltern: null });
    for (const n of p.nodes) for (const c of n.children || []) if (knoten.has(c)) knoten.get(c).eltern = n.id;
    const zeiten = new Float64Array(p.samples.length);
    let t = p.startTime;
    for (let i = 0; i < p.samples.length; i++) {
        t += p.timeDeltas[i] || 0;
        zeiten[i] = t;
    }
    const nameCache = new Map();
    const name = (id) => {
        if (nameCache.has(id)) return nameCache.get(id);
        const c = knoten.get(id).n.callFrame;
        // ein Seiten-Skript der Werkbank (puppeteer `evaluate`) heißt „werkbank" — sein Ursprung ist eine lange Kennung
        const datei = /^pptr:/.test(c.url || "")
            ? "werkbank"
            : String(c.url || "")
                  .split("/")
                  .pop()
                  .split("?")[0];
        const fn = c.functionName || "(anonym)";
        const s =
            fn +
            (datei && datei !== "anazhRealm.js"
                ? " [" + datei + (c.functionName ? "" : ":" + (c.lineNumber + 1)) + "]"
                : "") +
            (!c.functionName && datei === "anazhRealm.js" ? " [anazhRealm.js:" + (c.lineNumber + 1) + "]" : "");
        nameCache.set(id, s);
        return s;
    };
    const stapelCache = new Map();
    const stapel = (id) => {
        let s = stapelCache.get(id);
        if (s) return s;
        const e = knoten.get(id).eltern;
        s = e == null ? [id] : stapel(e).concat(id);
        stapelCache.set(id, s);
        return s;
    };
    const fnName = (id) => knoten.get(id).n.callFrame.functionName || "";
    return {
        knoten,
        zeiten,
        samples: p.samples,
        name,
        stapel,
        fnName,
        intervallUs: p.samples.length > 1 ? (p.endTime - p.startTime) / p.samples.length : 1000,
    };
}

// Die Eichung: die Proben der Eichmarke legen den Profiler-Takt (µs) auf die Seiten-Uhr (ms).
function eichen(P, eich) {
    const treffer = [];
    for (let i = 0; i < P.samples.length; i++) {
        const st = P.stapel(P.samples[i]);
        if (st.some((id) => P.fnName(id) === "haengerEichmarke")) treffer.push(P.zeiten[i]);
    }
    if (!treffer.length) return null;
    // zwei Haufen (Anfang, Ende): der erste Treffer je Haufen
    const erst = treffer[0];
    const spaet = treffer.find((t) => t - erst > 1e6) || null;
    const versatz = erst - eich[0] * 1000;
    const drift = spaet != null && eich[1] != null ? +((spaet - eich[1] * 1000 - versatz) / 1000).toFixed(2) : null;
    return { versatzUs: versatz, driftMs: drift, treffer: treffer.length };
}

// Die Engstelle einer Proben-Menge über die NAMEN der Rahmen (V8 legt dieselbe Funktion je Code-Stufe — Bytecode,
// optimiert — als Geschwister-Knoten an; über Knoten-Nummern zerfiel ein Pfad in Hälften unter der Schwelle): der Pfad
// der schwersten Rahmen, solange einer `anteil` der Proben trägt, ohne die Hüllen über dem Takt (Wurzel, rAF-Hülle des
// Renderers und der Werkbank, die Spiel-Schleife); endet er in einer Hülle, ist die Last VERTEILT und die drei
// schwersten Zweige stehen beim Namen. Dazu die teuersten Selbst-Funktionen.
const HUELLE = /^(loop|_gameLoopTick)$|^\(anonym\) \[werkbank[:\]]/;
function engstelle(P, ids, anteil) {
    const n = ids.length;
    if (!n) return { pfad: [], zweige: [], selbst: [] };
    const wurzel = { n: 0, k: new Map() };
    const selbst = new Map();
    for (const leaf of ids) {
        const namen = P.stapel(leaf).map((id) => P.name(id));
        // die Hüllen-Spitze: alles bis zum letzten Hüllen-Rahmen fällt (über dem Takt liegt nur Verteilung)
        let ab = 0;
        for (let x = 0; x < namen.length; x++) if (HUELLE.test(namen[x])) ab = x + 1;
        let knot = wurzel;
        wurzel.n++;
        for (let x = ab; x < namen.length; x++) {
            if (namen[x] === "(root)") continue;
            let c = knot.k.get(namen[x]);
            if (!c) knot.k.set(namen[x], (c = { n: 0, k: new Map() }));
            c.n++;
            knot = c;
        }
        const s = namen[namen.length - 1];
        selbst.set(s, (selbst.get(s) || 0) + 1);
    }
    const pct = (c) => Math.round((100 * c) / n);
    const pfad = [];
    let knot = wurzel;
    for (;;) {
        let best = null,
            nm = null;
        for (const [k, c] of knot.k) if (!best || c.n > best.n) ((best = c), (nm = k));
        if (!best || best.n < anteil * n) break;
        pfad.push({ name: nm, pct: pct(best.n) });
        knot = best;
    }
    const zweige = [...knot.k.entries()]
        .sort((a, b) => b[1].n - a[1].n)
        .slice(0, 3)
        .map(([k, c]) => ({ name: k, pct: pct(c.n) }));
    const sel = [...selbst.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k, c]) => ({ name: k, pct: pct(c) }));
    return { pfad, zweige, selbst: sel };
}
// Der Name einer Engstelle: der tiefste Rahmen des Pfads, davor der letzte Rahmen des Stamms (die Stelle im eigenen Code,
// die schneidet); ohne Pfad die Verteilung.
function engstellenName(e) {
    if (!e.pfad.length) return "verteilt";
    const tief = e.pfad[e.pfad.length - 1].name;
    let stamm = null;
    for (const x of e.pfad) if (!/\[/.test(x.name) && x.name !== tief) stamm = x.name;
    return stamm ? `${stamm} › ${tief}` : tief;
}

// Der Name einer Pipeline: Pass und Täter-Klasse des Auftraggebers, sonst der Stoff aus dem r184-Label
// (`renderPipeline_<Stoff>_<id>`).
function pipeName(x) {
    const stoff = String(x.n || "?")
        .replace(/^renderPipeline_/, "")
        .replace(/_\d+$/, "");
    return x.klasse ? `${x.pass} ${x.klasse}` : stoff;
}

// Die Geräte-Aufträge und Pipeline-Namen eines Takt-Bereichs [von, bis] (Takt-Indizes) und Zeit-Bereichs.
function geraeteIn(roh, T, von, bis, t0, t1) {
    const dev = {};
    const add = (x) => {
        if (x) for (const key in x) dev[key] = +((dev[key] || 0) + x[key]).toFixed(2);
    };
    for (let q = von; q <= bis && q < T.t.length; q++) {
        if (q < bis) add(T.innen[q]);
        if (q > von) add(T.aussen[q]);
    }
    const pipes = (roh.namen || []).filter((x) => x.t >= t0 && x.t < t1);
    return { dev, pipes };
}

// DIE AUSWERTUNG: Hänger finden, je Fenster die vier Zeiten, die Klasse, die Engstelle.
// Das Fenster besteht aus den rAF-Abständen seiner Takte: der erste (gerendert) zerfällt in die Takt-Zeit und die Zeit
// außerhalb (nach Proben: NEBEN · GC · leer = GPU); jeder weitere Takt hat nicht gerendert — die GPU-Leine hielt ihn —,
// dort zählt Haupt-Thread-Arbeit nur, soweit sie den Bild-Takt (Median der rAF-Abstände) übersteigt, der Rest ist GPU.
function haengerAuswerten(roh, profil, opts) {
    const o = opts || {};
    const schwelle = o.schwelle || 100;
    const T = roh.takte;
    const P = profil ? profilLesen(profil) : null;
    const eich = P ? eichen(P, roh.eich) : null;
    const nT = T.t.length;
    const abst = [];
    for (let q = 1; q < nT; q++) abst.push(T.c0[q] - T.c0[q - 1]);
    abst.sort((x, y) => x - y);
    const periode = abst.length ? abst[abst.length >> 1] : 16.7;
    // die Proben-Indizes im Seiten-Zeit-Bereich [von, bis)
    const proben = (von, bis) => {
        if (!P || !eich) return [];
        const lo = von * 1000 + eich.versatzUs,
            hi = bis * 1000 + eich.versatzUs;
        let a0 = 0,
            b0 = P.zeiten.length;
        while (a0 < b0) {
            const m = (a0 + b0) >> 1;
            if (P.zeiten[m] < lo) a0 = m + 1;
            else b0 = m;
        }
        const out = [];
        for (let s = a0; s < P.zeiten.length && P.zeiten[s] < hi; s++) out.push(P.samples[s]);
        return out;
    };
    const gerendert = [];
    for (let i = 0; i < nT; i++) if (T.g[i]) gerendert.push(i);
    const dts = [];
    const haenger = [];
    for (let a = 1; a < gerendert.length; a++) {
        const i = gerendert[a - 1],
            j = gerendert[a];
        const dt = T.t[j] - T.t[i];
        dts.push(dt);
        if (dt <= schwelle) continue;
        const w0 = T.c0[i],
            w1 = T.c0[j];
        const z = { TAKT: 0, NEBEN: 0, GC: 0, GPU: 0 };
        const idsTakt = [],
            idsNeben = [];
        let ohneRender = 0;
        for (let q = i; q < j; q++) {
            const d = T.c0[q + 1] - T.c0[q];
            const cpu = T.c1[q] - T.c0[q];
            const teil = { TAKT: cpu, NEBEN: 0, GC: 0, GPU: Math.max(0, d - cpu) };
            if (P && eich) {
                const innen = proben(T.c0[q], T.c1[q]);
                let gcInnen = 0;
                for (const id of innen) {
                    if (P.fnName(id) === "(garbage collector)") gcInnen++;
                    else idsTakt.push(id);
                }
                if (innen.length) {
                    teil.GC = (cpu * gcInnen) / innen.length;
                    teil.TAKT = cpu - teil.GC;
                }
                let ns = 0,
                    gs = 0,
                    ls = 0;
                const aussenIds = proben(T.c1[q], T.c0[q + 1]);
                for (const id of aussenIds) {
                    const fn = P.fnName(id);
                    if (fn === "(idle)") ls++;
                    else if (fn === "(garbage collector)") gs++;
                    else ns++;
                }
                const aussen = Math.max(0, d - cpu);
                if (ns + gs + ls) {
                    teil.NEBEN = (aussen * ns) / (ns + gs + ls);
                    teil.GC += (aussen * gs) / (ns + gs + ls);
                    teil.GPU = (aussen * ls) / (ns + gs + ls);
                    for (const id of aussenIds) {
                        const fn = P.fnName(id);
                        if (fn !== "(idle)" && fn !== "(garbage collector)") idsNeben.push(id);
                    }
                }
            }
            if (T.g[q]) for (const kl of KLASSEN) z[kl] += teil[kl];
            else {
                ohneRender++;
                // unter der Leine: der Haupt-Thread-Teil zählt über dem Bild-Takt, der Rest hielt die GPU
                let ueber = 0;
                for (const kl of ["TAKT", "NEBEN", "GC"]) {
                    const x = Math.max(0, teil[kl] - periode);
                    z[kl] += x;
                    ueber += x;
                }
                z.GPU += Math.max(0, d - ueber);
            }
        }
        let klasse = "TAKT";
        for (const kl of KLASSEN) if (z[kl] > z[klasse]) klasse = kl;
        // Geräte-Aufträge: im Fenster; für die GPU-Klasse auch die drei gerenderten Frames davor (ihre Arbeit ist noch in
        // der Schlange, wenn das Fenster beginnt — die GPU kompiliert, was der Takt davor synchron bestellt hat)
        const vorK = gerendert[Math.max(0, a - 4)];
        const im = geraeteIn(roh, T, i, j, w0, w1);
        const vor = geraeteIn(roh, T, vorK, j, T.c0[vorK], w1);
        let name;
        let e = null;
        if ((klasse === "TAKT" || klasse === "NEBEN") && !P) name = "ohne Profil";
        else if (klasse === "TAKT") {
            e = engstelle(P, idsTakt, 0.5);
            name = engstellenName(e);
        } else if (klasse === "NEBEN") {
            e = engstelle(P, idsNeben, 0.5);
            name = engstellenName(e);
        } else if (klasse === "GC") name = "Garbage-Collector";
        else {
            const sync = vor.pipes.filter((x) => x.art === "sync");
            const up = (vor.dev.upKB || 0) + (vor.dev.texKB || 0);
            if (sync.length) {
                const stoffe = [...new Set(sync.map(pipeName))];
                name = `Pipeline synchron (${stoffe.slice(0, 4).join(", ")}${stoffe.length > 4 ? ", …" : ""})`;
            } else if (vor.dev.shader) name = `Shader-Modul ×${vor.dev.shader}`;
            else if (up > 4096) name = `Upload ${(up / 1024).toFixed(1)} MB`;
            else name = ohneRender ? "GPU-Leine ohne Auftrag" : "Bild-Takt ruht ohne Auftrag";
        }
        const loaf = (roh.loaf || [])
            .filter((x) => x.start < w1 && x.start + x.dauer > w0)
            .flatMap((x) => x.skripte)
            .filter((s) => s.dauer >= 20)
            .sort((x, y) => y.dauer - x.dauer)
            .slice(0, 3)
            .map((s) => `${s.aufrufer}${s.fn ? " → " + s.fn : ""} ${Math.round(s.dauer)} ms`);
        haenger.push({
            t: +(w0 - roh.tMess[0]).toFixed(0),
            dt: +dt.toFixed(1),
            klasse,
            name,
            ursache: klasse + ": " + name,
            zeiten: Object.fromEntries(Object.entries(z).map(([x, v]) => [x, Math.round(v)])),
            takte: j - i,
            ohneRender,
            pfad: e ? e.pfad.slice(-6) : [],
            zweige: e && !e.pfad.length ? e.zweige : [],
            selbst: e ? e.selbst : [],
            geraet: im.dev,
            geraetVorher: klasse === "GPU" ? vor.dev : null,
            pipelines: (klasse === "GPU" ? vor.pipes : im.pipes).slice(0, 12).map((x) => x.art + ":" + x.n),
            loaf,
        });
    }
    // je Ursache: Zahl, Summe, Maximum
    const jeUrsache = new Map();
    for (const h of haenger) {
        const e = jeUrsache.get(h.ursache) || { ursache: h.ursache, klasse: h.klasse, n: 0, summeMs: 0, maxMs: 0 };
        e.n++;
        e.summeMs += h.dt;
        e.maxMs = Math.max(e.maxMs, h.dt);
        jeUrsache.set(h.ursache, e);
    }
    const sortiert = dts.slice().sort((x, y) => x - y);
    const q = (p) =>
        sortiert.length ? +sortiert[Math.min(sortiert.length - 1, Math.floor(p * sortiert.length))].toFixed(1) : null;
    // die Probe: jede geschmuggelte Last muss als Hänger mit ihrem Namen erscheinen
    const probe = (roh.probe || []).map((p) => {
        const soll = p.art === "takt" ? "__haengerProbeTakt" : "__haengerProbeNeben";
        const tRel = p.t - roh.tMess[0];
        const h = haenger.find((x) => Math.abs(x.t - tRel) < 2000 && x.name.indexOf(soll) >= 0);
        return { art: p.art, soll, gefunden: !!h, als: h ? h.ursache : null };
    });
    // DER ZÄHLER DER KLASSE über den ganzen Lauf (unabhängig von der Schwelle und vom Gerät): jede Pipeline, die ein Frame
    // synchron bestellt, ist ein Kompilat im Bild-Pfad; dazu je Auftraggeber die Zahl und die Frames mit Bestellung.
    const sync = (roh.namen || []).filter((x) => x.art === "sync");
    const jeAuftrag = {};
    for (const x of sync) jeAuftrag[pipeName(x)] = (jeAuftrag[pipeName(x)] || 0) + 1;
    let framesMitSync = 0,
        shader = 0,
        asyncN = 0;
    for (let i2 = 0; i2 < nT; i2++) {
        const x = T.innen[i2];
        if (x && x.pipeSync) framesMitSync++;
        for (const y of [T.innen[i2], T.aussen[i2]]) if (y) ((shader += y.shader || 0), (asyncN += y.pipeAsync || 0));
    }
    // DER KNOTEN-BAU im Lauf: jeder synchrone Bau mit seiner Dauer, je Auftrag die Summe
    const bau = (roh.namen || []).filter((x) => x.art === "bau");
    const bauJe = {};
    for (const x of bau) {
        const k = x.klasse ? `${x.pass} ${x.klasse}` : `${x.pass} ${x.n}`;
        bauJe[k] = +((bauJe[k] || 0) + (x.ms || 0)).toFixed(1);
    }
    const knotenBau = {
        sync: bau.length,
        ms: +bau.reduce((s, x) => s + (x.ms || 0), 0).toFixed(1),
        maxMs: bau.length ? Math.max(...bau.map((x) => x.ms || 0)) : 0,
        ueber16: bau.filter((x) => (x.ms || 0) > 16.7).length,
        jeAuftragMs: Object.fromEntries(Object.entries(bauJe).sort((x, y) => y[1] - x[1])),
    };
    const pipelines = {
        sync: sync.length,
        framesMitSync,
        async: asyncN,
        shader,
        jeAuftrag: Object.fromEntries(Object.entries(jeAuftrag).sort((x, y) => y[1] - x[1])),
        zeiten: sync
            .map((x) => +((x.t - roh.tMess[0]) / 1000).toFixed(1))
            .filter((x, k, arr) => k === 0 || x - arr[k - 1] > 0.5),
    };
    return {
        schwelle,
        sekunden: +((roh.tMess[1] - roh.tMess[0]) / 1000).toFixed(1),
        takte: nT,
        pipelines,
        knotenBau,
        bildTaktMs: +periode.toFixed(1),
        frames: gerendert.length,
        frameMs: { p50: q(0.5), p95: q(0.95), p99: q(0.99), max: q(1) },
        haengerN: haenger.length,
        jeKlasse: Object.fromEntries(KLASSEN.map((kl) => [kl, haenger.filter((h) => h.klasse === kl).length])),
        jeUrsache: [...jeUrsache.values()]
            .map((e) => Object.assign(e, { summeMs: Math.round(e.summeMs), maxMs: Math.round(e.maxMs) }))
            .sort((x, y) => y.n - x.n || y.summeMs - x.summeMs),
        haenger,
        eichung: eich ? { driftMs: eich.driftMs, treffer: eich.treffer } : null,
        profil: !!P,
        loafDa: !!roh.loafDa,
        probe,
        lauf: {
            regler: roh.k && roh.k.regler,
            tiere: roh.k && roh.k.tiere,
            wandern: roh.k && roh.k.wandern,
            kreaturen: roh.kreaturen,
            chunks: roh.chunks,
            loadScale: roh.loadScale,
            wetter: roh.wetter,
        },
        erst: roh.erst || null,
    };
}

// Die Linse prüft sich: fehlt das Profil, die Eichung, oder nennt sie eine geschmuggelte Probe nicht, ist sie blind.
function haengerLinsenBefunde(a) {
    const b = [];
    if (!a.profil) b.push("kein CPU-Profil — TAKT und NEBEN ohne Engstelle");
    if (a.profil && !a.eichung) b.push("Eichmarke nicht im Profil — die Proben liegen nicht auf der Seiten-Uhr");
    if (a.eichung && a.eichung.driftMs != null && Math.abs(a.eichung.driftMs) > 5)
        b.push(`Eich-Drift ${a.eichung.driftMs} ms > 5 ms — die Zuordnung der Proben ist unscharf`);
    for (const p of a.probe || []) if (!p.gefunden) b.push(`Probe ${p.art} (${p.soll}) nicht beim Namen genannt`);
    return b;
}

function haengerTabelle(a) {
    const z = [];
    z.push(
        `HÄNGER-LINSE: ${a.haengerN} Frames > ${a.schwelle} ms in ${a.sekunden} s (${a.frames} Frames, ${a.takte} Takte; ` +
            `Frame p50/p95/p99/max ${a.frameMs.p50}/${a.frameMs.p95}/${a.frameMs.p99}/${a.frameMs.max} ms) — ` +
            KLASSEN.map((k) => `${k} ${a.jeKlasse[k]}`).join(" · ")
    );
    z.push(
        `Lauf: Regler ${a.lauf.regler} · Tiere ${a.lauf.tiere} (${a.lauf.kreaturen}) · Wandern ${a.lauf.wandern || "aus"} · ` +
            `loadScale ${a.lauf.loadScale} · Chunks ${a.lauf.chunks} · Wetter ${a.lauf.wetter} · Profil ${a.profil ? "ja" : "NEIN"}` +
            (a.eichung ? ` (Eich-Drift ${a.eichung.driftMs} ms)` : "") +
            ` · LoAF ${a.loafDa ? "ja" : "nein"}`
    );
    const pp = a.pipelines || {};
    z.push(
        `Pipelines im Lauf: ${pp.sync} synchron in ${pp.framesMitSync} Takten · ${pp.async} async · ${pp.shader} Shader-Module` +
            (pp.sync
                ? ` — je Auftrag: ${Object.entries(pp.jeAuftrag)
                      .slice(0, 8)
                      .map(([k, v]) => `${k} ×${v}`)
                      .join(" · ")} — bei s ${pp.zeiten.slice(0, 12).join(", ")}`
                : "")
    );
    if (a.erst)
        z.push(
            `Erst-Zeichnung: ${a.erst.bauN} Knoten-Bauten im Pass (Σ ${a.erst.bauMs} ms) · ${a.erst.verschoben} auf den nächsten ` +
                `Aufruf verschoben · ${a.erst.pipeAsync} Pipelines asynchron · ${a.erst.offen} offen · ${a.erst.neubauN || 0} Neubauten ` +
                `gezeichneter Objekte (im Frame)`
        );
    const kb = a.knotenBau || {};
    z.push(
        `Knoten-Bau synchron: ${kb.sync} Bauten · Σ ${kb.ms} ms · max ${kb.maxMs} ms · ${kb.ueber16} über 16,7 ms` +
            (kb.sync
                ? ` — je Auftrag: ${Object.entries(kb.jeAuftragMs)
                      .slice(0, 6)
                      .map(([k, v]) => `${k} ${v} ms`)
                      .join(" · ")}`
                : "")
    );
    if (a.jeUrsache.length) {
        z.push("");
        z.push("   n    Σ ms   max ms  Ursache");
        for (const e of a.jeUrsache)
            z.push(
                `${String(e.n).padStart(4)} ${String(e.summeMs).padStart(7)} ${String(e.maxMs).padStart(8)}  ${e.ursache}`
            );
        z.push("");
        z.push("Je Hänger (t = ms seit Mess-Beginn):");
        for (const h of a.haenger.slice(0, 40)) {
            const zt = Object.entries(h.zeiten)
                .filter(([, v]) => v > 0)
                .map(([k, v]) => `${k} ${v}`)
                .join(" · ");
            z.push(`  t=${h.t} dt=${h.dt} ms (${h.takte} Takte, ${h.ohneRender} ohne Bild) [${zt}] ${h.ursache}`);
            if (h.pfad.length) z.push(`      Pfad: ${h.pfad.map((x) => `${x.name} ${x.pct}%`).join(" › ")}`);
            if (h.zweige.length) z.push(`      Zweige: ${h.zweige.map((x) => `${x.name} ${x.pct}%`).join(" · ")}`);
            if (h.selbst.length) z.push(`      Selbst: ${h.selbst.map((x) => `${x.name} ${x.pct}%`).join(" · ")}`);
            const g = Object.entries(h.geraetVorher || h.geraet || {})
                .map(([k, v]) => `${k} ${v}`)
                .join(" · ");
            if (g)
                z.push(
                    `      Gerät${h.geraetVorher ? " (mit 3 Frames davor)" : ""}: ${g}` +
                        (h.pipelines.length ? " — " + h.pipelines.slice(0, 6).join(", ") : "")
                );
            if (h.loaf.length) z.push(`      LoAF: ${h.loaf.join(" · ")}`);
        }
    }
    for (const p of a.probe || [])
        z.push(`PROBE ${p.art}: ${p.gefunden ? "genannt als „" + p.als + "“" : "NICHT GENANNT"}`);
    return z.join("\n");
}

// DER SELBSTTEST (ohne Welt): ein erfundener Lauf mit vier Hängern bekannter Ursache (Takt-Last, Neben-Last, Collector,
// GPU-Warten nach synchronen Pipelines) und einer Uhr, die gegen den Profiler versetzt ist — die Auswertung muss jeden
// beim Namen nennen und keinen ruhigen Frame zählen.
function selbsttest() {
    const f = [];
    // Profil-Knoten
    const nodes = [];
    const knoten = (id, fn, url, kinder) =>
        nodes.push({ id, callFrame: { functionName: fn, url: url || "", lineNumber: 0 }, children: kinder || [] });
    knoten(1, "(root)", "", [2, 6, 7, 9, 10, 12]);
    knoten(2, "", "werkbank", [3]);
    // V8 legt dieselbe Funktion je Code-Stufe als Geschwister an (13/14 neben 4/5) — die Engstelle muss sie vereinen
    knoten(3, "_gameLoopTick", "http://x/anazhRealm.js", [4, 11, 13, 15, 16, 17]);
    knoten(4, "_loopRender", "http://x/anazhRealm.js", [5]);
    knoten(5, "_lastImTakt", "http://x/anazhRealm.js");
    knoten(6, "(idle)", "");
    knoten(7, "onmessage", "http://x/anazhRealm.js", [8]);
    knoten(8, "_nebenLast", "http://x/anazhRealm.js");
    knoten(9, "(garbage collector)", "");
    knoten(10, "haengerEichmarke", "");
    knoten(11, "_kleinImTakt", "http://x/anazhRealm.js");
    knoten(12, "(program)", "");
    knoten(13, "_loopRender", "http://x/anazhRealm.js", [14]);
    knoten(14, "_lastImTakt", "http://x/anazhRealm.js");
    knoten(15, "_teilA", "http://x/anazhRealm.js");
    knoten(16, "_teilB", "http://x/anazhRealm.js");
    knoten(17, "_teilC", "http://x/anazhRealm.js");
    // Seiten-Uhr: Takt alle 16,7 ms ab t=1000; Profiler-Uhr = Seite + 5 000 000 µs
    const V = 5e9 / 1000; // 5 000 000 µs
    const samples = [],
        deltas = [];
    let letzte = 0;
    const probe = (tSeiteMs, id) => {
        const us = tSeiteMs * 1000 + V;
        samples.push(id);
        deltas.push(samples.length === 1 ? 0 : us - letzte);
        letzte = us;
    };
    const T = { t: [], c0: [], c1: [], g: [], flug: [], innen: [], aussen: [] };
    const namen = [];
    // Eichmarke bei 990 ms (8 ms) und am Ende
    for (let x = 990; x < 998; x++) probe(x, 10);
    let t = 1000;
    const takt = (dauer, idImTakt, renderiert, innen) => {
        T.t.push(t);
        T.c0.push(t);
        T.c1.push(t + dauer);
        T.g.push(renderiert === false ? 0 : 1);
        T.flug.push(1);
        T.innen.push(innen || 0);
        T.aussen.push(0);
        const ids = Array.isArray(idImTakt) ? idImTakt : [idImTakt || 11];
        for (let x = t, k = 0; x < t + dauer; x += 1, k++) probe(x + 0.5, ids[k % ids.length]);
        return t + dauer;
    };
    const luecke = (bis, id) => {
        const von = T.c1[T.c1.length - 1];
        for (let x = von; x < bis - 0.5; x += 1) probe(x + 0.5, id || 6);
        t = bis;
    };
    // 30 ruhige Takte
    for (let i = 0; i < 30; i++) {
        takt(4);
        luecke(t + 16.7);
    }
    // Hänger 1: 250 ms im Takt (_lastImTakt unter _loopRender, je zur Hälfte in zwei Geschwister-Knoten)
    takt(250, [5, 14]);
    luecke(T.c1[T.c1.length - 1] + 5);
    for (let i = 0; i < 10; i++) {
        takt(4);
        luecke(t + 16.7);
    }
    // Hänger 2: 250 ms neben dem Takt (onmessage → _nebenLast)
    takt(4);
    luecke(t + 260, 8);
    for (let i = 0; i < 10; i++) {
        takt(4);
        luecke(t + 16.7);
    }
    // Hänger 3: 200 ms Collector neben dem Takt
    takt(4);
    luecke(t + 210, 9);
    for (let i = 0; i < 10; i++) {
        takt(4);
        luecke(t + 16.7);
    }
    // Hänger 4: drei synchrone Pipelines im Takt, danach 300 ms Warten (Takte ohne Render unter der Leine)
    namen.push(
        { t: t + 1, art: "sync", n: "renderPipeline_baumRinde_17" },
        { t: t + 2, art: "sync", n: "renderPipeline_NodeMaterial_18" }
    );
    takt(4, 11, true, { pipeSync: 2 });
    for (let i = 0; i < 18; i++) {
        luecke(t + 16.7);
        takt(1, 11, false);
    }
    luecke(t + 16.7);
    for (let i = 0; i < 10; i++) {
        takt(4);
        luecke(t + 16.7);
    }
    // Hänger 5: 210 ms im Takt, gleich verteilt auf drei Zweige — keiner trägt die Hälfte: VERTEILT
    takt(210, [15, 16, 17]);
    luecke(T.c1[T.c1.length - 1] + 5);
    for (let i = 0; i < 10; i++) {
        takt(4);
        luecke(t + 16.7);
    }
    const ende = t;
    for (let x = ende + 5; x < ende + 13; x++) probe(x, 10);
    const profil = { nodes, startTime: V + 989 * 1000, endTime: letzte, samples, timeDeltas: deltas };
    // timeDeltas[0] relativ zu startTime
    profil.timeDeltas[0] = 990 * 1000 + V - profil.startTime;
    const roh = {
        takte: T,
        namen,
        loaf: [],
        loafDa: false,
        eich: [990, ende + 5],
        tMess: [1000, ende],
        probe: [],
        k: {},
    };
    const a = haengerAuswerten(roh, profil, { schwelle: 100 });
    const erwartet = [
        ["TAKT", "_loopRender › _lastImTakt"],
        ["NEBEN", "onmessage › _nebenLast"],
        ["GC", "Garbage-Collector"],
        ["GPU", "Pipeline synchron (baumRinde, NodeMaterial)"],
        ["TAKT", "verteilt"],
    ];
    if (a.haengerN !== erwartet.length)
        f.push(`Hänger ${a.haengerN}, erwartet ${erwartet.length}: ${a.haenger.map((h) => h.ursache).join(" | ")}`);
    erwartet.forEach(([kl, nm], i) => {
        const h = a.haenger[i];
        if (!h) return;
        if (h.klasse !== kl || h.name !== nm) f.push(`Hänger ${i + 1}: „${h.ursache}" statt „${kl}: ${nm}"`);
    });
    const h5 = a.haenger[4];
    if (
        h5 &&
        h5.zweige
            .map((x) => x.name)
            .sort()
            .join(",") !== "_teilA,_teilB,_teilC"
    )
        f.push("verteilter Takt nennt seine drei Zweige nicht: " + JSON.stringify(h5.zweige));
    if (!a.eichung) f.push("Eichung nicht gefunden");
    else if (Math.abs(a.eichung.driftMs) > 1) f.push(`Eich-Drift ${a.eichung.driftMs} ms im erfundenen Lauf`);
    if (haengerLinsenBefunde(a).length) f.push("Befunde im erfundenen Lauf: " + haengerLinsenBefunde(a).join(" · "));
    // ohne Profil: die Zeiten-Zerlegung allein (Takt gegen Rest) bleibt und nennt TAKT ohne Engstelle
    const ohne = haengerAuswerten(roh, null, { schwelle: 100 });
    if (ohne.haengerN !== erwartet.length || ohne.haenger[0].klasse !== "TAKT")
        f.push("ohne Profil: Takt-Hänger nicht als TAKT gezählt");
    if (!haengerLinsenBefunde(ohne).length)
        f.push("ohne Profil meldet die Linse keinen Befund (sie wäre blind und grün)");
    // die Erst-Probe: ein sauberes ABBA ohne Befund; ein A ohne synchrone Pipeline (blind), ein B mit einer (der Bruch) und ein B
    // mit weniger gezeichneten Teilen (verschluckt) nennt das Urteil je beim Namen
    const d = (art, max, sync, gezeichnet) => ({ art, max, ruheMax: 20, p50: 9, sync, async: 18 - sync, gezeichnet, teile: 16, gussMs: 40 });
    const sauber = erstUrteil([d("A", 2900, 17, 11), d("B", 130, 0, 11), d("B", 110, 0, 11), d("A", 2000, 19, 11)]);
    if (sauber.befunde.length || sauber.medianA !== 2450 || sauber.medianB !== 120)
        f.push("Erst-Probe: sauberes ABBA geurteilt als " + JSON.stringify([sauber.befunde, sauber.medianA, sauber.medianB]));
    const kaputt = erstUrteil([d("A", 20, 0, 11), d("B", 900, 3, 9)]).befunde;
    for (const w of ["blind", "kompiliert im Frame", "verschluckt"])
        if (!kaputt.some((b) => b.includes(w))) f.push(`Erst-Probe: „${w}" nicht genannt`);
    return f;
}

// ── DIE ERST-PROBE (Welle K): ABBA in EINER Welt ─────────────────────────────────────────────────────────────────────
// Die Hänger-Klasse „eine erste Zeichnung trägt synchron ihren Bau" am echten Gerät, A gegen B in derselben Welt: je
// Durchgang ein Tier aus dem echten Guss (`spawnCreatureAt`) mit frischen Stoffen (eine eigene Farb-Konstante je Durchgang:
// neue Programme, neue Pipelines) und drei frische Würfel vor der Kamera, alle werfen Schatten. A = der Vendor-Weg (die
// Nachbildung am Renderer-Exemplar ist entfernt: Knoten-Bau und Pipeline synchron im Frame), B = die Erst-Zeichnung
// (`_configureRenderer`: je Render-Aufruf ein Bau, die Pipeline asynchron). Gemessen je Durchgang: der längste Abstand
// zweier Bilder (rAF) in 5 s ab dem Auftrag gegen 2 s Ruhe davor, synchrone und asynchrone Pipelines, gezeichnete Teile.
//   node scripts/werkbank.cjs haenger --erst [ABBAABBA]
function erstProbe(k) {
    return (async () => {
        const r = window.anazhRealm;
        const st = r.state;
        const rend = st.renderer;
        const T = window.THREE;
        const TSL = T.TSL;
        const welt = st.scene;
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        if (window.__buehne) window.__buehne();
        if (window.__tiereHalten) window.__tiereHalten();
        rend.setAnimationLoop((t) => {
            if (window.__wetterHalten) window.__wetterHalten();
            if (window.__ortSchritt) window.__ortSchritt();
            r._gameLoopTick(t);
        });
        const Z = (window.__erstZ = window.__erstZ || { sync: 0, async: 0 });
        if (!window.__erstHaken) {
            const GP = GPUDevice.prototype;
            const crp = GP.createRenderPipeline,
                crpa = GP.createRenderPipelineAsync;
            GP.createRenderPipeline = function (d) {
                window.__erstZ.sync++;
                return crp.call(this, d);
            };
            GP.createRenderPipelineAsync = function (d) {
                window.__erstZ.async++;
                return crpa.call(this, d);
            };
            window.__erstHaken = true;
        }
        const fenster = async (ms) => {
            const t = [];
            const t0 = performance.now();
            while (performance.now() - t0 < ms) {
                await new Promise((res) => requestAnimationFrame(res));
                t.push(performance.now());
            }
            let max = 0;
            const d = [];
            for (let i = 1; i < t.length; i++) {
                d.push(t[i] - t[i - 1]);
                max = Math.max(max, t[i] - t[i - 1]);
            }
            d.sort((a, b) => a - b);
            return { n: t.length, max: +max.toFixed(1), p50: +(d[Math.floor(d.length / 2)] || 0).toFixed(1) };
        };
        const aus = [];
        try {
            await sleep((k.ein != null ? k.ein : 15) * 1000);
            let serie = window.__erstSerie || 0;
            for (const art of String(k.folge || "ABBAABBA")) {
                const vendor = art === "A";
                const eigen = Object.prototype.hasOwnProperty.call(rend, "_renderObjectDirect");
                const stamm = rend._renderObjectDirect;
                if (vendor && eigen) delete rend._renderObjectDirect;
                const gezeichnet = new Set();
                const drawRoh = rend.backend.draw;
                rend.backend.draw = function (ro) {
                    if (ro && ro.object && ro.object.userData.__erstProbe) gezeichnet.add(ro.object);
                    return drawRoh.apply(this, arguments);
                };
                const teile = [];
                let tier = null;
                let gussMs = 0;
                try {
                    const ruhe = await fenster(2000);
                    Z.sync = Z.async = 0;
                    serie++;
                    window.__erstSerie = serie;
                    const cam = st.camera;
                    const dir = new T.Vector3();
                    cam.getWorldDirection(dir);
                    const px = cam.position.x + dir.x * 7,
                        pz = cam.position.z + dir.z * 7;
                    const gy = typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(px, pz) : cam.position.y;
                    const g0 = performance.now();
                    tier = r.spawnCreatureAt(px, gy + 0.3, pz, "happy", k.art || "wolf", { bodySize: 1, precise: true });
                    gussMs = performance.now() - g0;
                    if (tier)
                        tier.traverse((o) => {
                            if (o.isMesh && o.material && !Array.isArray(o.material)) {
                                const m = o.material.clone();
                                m.colorNode = TSL.vec3(0.3 + 0.00137 * serie, 0.35, 0.2);
                                o.material = m;
                                o.userData.__erstProbe = true;
                                teile.push(o);
                            }
                        });
                    for (let i = 0; i < 3; i++) {
                        const m = new T.MeshStandardNodeMaterial({ roughness: 0.8 });
                        m.colorNode = TSL.vec3(0.2 + 0.00113 * serie, 0.45, 0.25 + 0.07 * i);
                        const w = new T.Mesh(new T.BoxGeometry(0.6, 0.6, 0.6), m);
                        w.position.set(
                            cam.position.x + dir.x * 4 + (i - 1) * 0.8,
                            cam.position.y + dir.y * 4,
                            cam.position.z + dir.z * 4
                        );
                        w.castShadow = true;
                        w.userData.__erstProbe = true;
                        welt.add(w);
                        teile.push(w);
                    }
                    const f = await fenster(5000);
                    aus.push({
                        art,
                        ruheMax: ruhe.max,
                        max: f.max,
                        p50: f.p50,
                        bilder: f.n,
                        sync: Z.sync,
                        async: Z.async,
                        gezeichnet: gezeichnet.size,
                        teile: teile.length,
                        gussMs: +gussMs.toFixed(1),
                    });
                } finally {
                    rend.backend.draw = drawRoh;
                    if (vendor && eigen) rend._renderObjectDirect = stamm;
                    for (const w of teile)
                        if (w.parent === welt) {
                            welt.remove(w);
                            w.geometry.dispose();
                        }
                    if (tier) r.removeCreature(tier);
                }
            }
        } finally {
            rend.setAnimationLoop(null);
        }
        return aus;
    })();
}

// Das Urteil der Erst-Probe (Node, rein): die Mediane je Seite, und die Linse prüft sich — ohne synchrone Pipeline in A
// trug die Probe keine neuen Stoffe (blind), eine synchrone Pipeline in B ist der Bruch des Gesetzes, und B zeichnet in
// jedem Durchgang mindestens die Teile, die A im Median zeichnet (nichts verschluckt).
function erstUrteil(aus) {
    // der Median: bei gerader Zahl das Mittel der beiden mittleren (bis zur Gegenprüfung 07.10. der untere — die ABBA-Zahl
    // 1 676,6 / 77,9 ms war in Wahrheit 1 709,0 / 79,3 ms)
    const med = (xs) => {
        const s = xs.slice().sort((a, b) => a - b);
        if (!s.length) return null;
        const m = s.length >> 1;
        return s.length % 2 ? s[m] : +((s[m - 1] + s[m]) / 2).toFixed(1);
    };
    const A = aus.filter((x) => x.art === "A"),
        B = aus.filter((x) => x.art === "B");
    const befunde = [];
    if (!A.length || !B.length) befunde.push("die Folge braucht A und B");
    for (const x of A) if (x.sync === 0) befunde.push("A ohne synchrone Pipeline (die Probe trug keine neuen Stoffe — blind)");
    for (const x of B) if (x.sync > 0) befunde.push(`B mit ${x.sync} synchronen Pipelines (die Erst-Zeichnung kompiliert im Frame)`);
    const gA = med(A.map((x) => x.gezeichnet));
    for (const x of B) if (gA != null && x.gezeichnet < gA) befunde.push(`B zeichnete ${x.gezeichnet} Teile, A ${gA} (verschluckt)`);
    const zeile = (x) =>
        `  ${x.art}  max ${String(x.max).padStart(7)} ms (Ruhe ${x.ruheMax})  p50 ${x.p50}  synchron ${x.sync}  ` +
        `asynchron ${x.async}  gezeichnet ${x.gezeichnet}/${x.teile}  Guss ${x.gussMs} ms`;
    const tabelle =
        `ERST-PROBE (ABBA in einer Welt): längster Frame-Abstand in 5 s ab dem Auftrag — Median A ${med(A.map((x) => x.max))} ms · ` +
        `B ${med(B.map((x) => x.max))} ms; synchrone Pipelines je Durchgang A ${med(A.map((x) => x.sync))} · ` +
        `B ${med(B.map((x) => x.sync))}\n` +
        aus.map(zeile).join("\n");
    return { tabelle, befunde, medianA: med(A.map((x) => x.max)), medianB: med(B.map((x) => x.max)) };
}

module.exports = {
    KLASSEN,
    haengerAuswerten,
    haengerTabelle,
    haengerLinsenBefunde,
    selbsttest,
    erstUrteil,
    HAENGER_INSTALL:
        `window.__haengerAn = ${haengerAn.toString()};` +
        `window.__haengerEichmarke = ${haengerEichmarke.toString()};` +
        `window.__haengerProbeTakt = ${__haengerProbeTakt.toString()};` +
        `window.__haengerProbeNeben = ${__haengerProbeNeben.toString()};` +
        `window.__haengerLauf = ${haengerLauf.toString()};` +
        `window.__erstProbe = ${erstProbe.toString()};`,
};
