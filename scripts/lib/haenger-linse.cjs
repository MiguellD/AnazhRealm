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
//              der Lauf ist `werkbank lauf` (`k.haenger`): je Takt Beginn, Ende, Leine, Geräte-Aufträge → Rohdaten (Takte, LoAF)
//   Werkbank:  `haenger` und `takt` (die Takt-Spitze, unten) — Aufruf in der Hilfe von scripts/werkbank.cjs;
//   `--probe` schmuggelt zwei Hänger bekannter Ursache in den echten Lauf (250 ms im Takt in `__haengerProbeTakt`,
//   250 ms neben dem Takt in `__haengerProbeNeben`) — die Linse muss beide beim Namen nennen, sonst Exit 1.
const stammLib = require("./stamm.cjs");

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
// Die Probe-Lasten (`--probe`): bekannte Ursachen mit Namen — die Uhr nur je 10 000 Schritte (sonst trug `now` die Hälfte der
// Proben, die Engstelle hieß „now" statt der Probe: Radeon 21.10., Probe neben NICHT GENANNT).
function __haengerProbeTakt(ms) {
    const t0 = performance.now();
    let x = 0;
    while (performance.now() - t0 < ms) for (let i = 0; i < 1e4; i++) x += Math.sqrt(x + 2);
    window.__haengerSenke = x;
}
function __haengerProbeNeben(ms) {
    const t0 = performance.now();
    let x = 0;
    while (performance.now() - t0 < ms) for (let i = 0; i < 1e4; i++) x += Math.sqrt(x + 3);
    window.__haengerSenke = x;
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
        // eine Stamm-Datei (die eine Datei oder eine unter stamm/) heißt mit ihrem Pfad unter der Seite (scripts/lib/stamm.cjs)
        const pfad = String(c.url || "")
            .replace(/^[a-z]+:\/\/[^/]*\//, "")
            .split("?")[0];
        const stammDatei = stammLib.istStammDatei(pfad) ? pfad : null;
        const fn = c.functionName || "(anonym)";
        const s =
            fn +
            (datei && !stammDatei ? " [" + datei + (c.functionName ? "" : ":" + (c.lineNumber + 1)) + "]" : "") +
            (!c.functionName && stammDatei ? " [" + stammDatei + ":" + (c.lineNumber + 1) + "]" : "");
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
    return { zeiten, samples: p.samples, name, stapel, fnName };
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
// Die Quantile einer Reihe wie `lauf` (der Wert am Rang floor(q·n)): q(p) und die Zahl p50 · p95 · p99 · max.
function quantil(werte) {
    const s = werte.slice().sort((x, y) => x - y);
    const q = (p) => (s.length ? +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(2) : null);
    return Object.assign(q, { zahl: { p50: q(0.5), p95: q(0.95), p99: q(0.99), max: q(1) } });
}
// Die Proben-Knoten im Seiten-Zeit-Bereich [von, bis) (ms, geeicht).
function probenIn(P, eich, von, bis) {
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
}

// Die Engstelle einer Proben-Menge über die NAMEN der Rahmen (V8 legt dieselbe Funktion je Code-Stufe — Bytecode,
// optimiert — als Geschwister-Knoten an; über Knoten-Nummern zerfiel ein Pfad in Hälften unter der Schwelle): der Pfad
// der schwersten Rahmen, solange einer `anteil` der Proben trägt, ohne die Hüllen über dem Takt (Wurzel, rAF-Hülle des
// Renderers und der Werkbank, die Spiel-Schleife); endet er in einer Hülle, ist die Last VERTEILT und die drei
// schwersten Zweige stehen beim Namen. Dazu die teuersten Selbst-Funktionen.
const HUELLE = /^(loop|_gameLoopTick)$|^\(anonym\) \[werkbank[:\]]/;
// Der Baum der Rahmen-Namen unter der Hülle (alles bis zum letzten Hüllen-Rahmen fällt: über dem Takt liegt nur
// Verteilung), je Probe das Gewicht g, dazu die Selbst-Rahmen — die Engstelle und die Takt-Spitze lesen ihn.
function rahmenBaum(P, ids, g = 1, wurzel = { n: 0, k: new Map() }, selbst = new Map()) {
    for (const leaf of ids) {
        const namen = P.stapel(leaf).map((id) => P.name(id));
        let knot = wurzel;
        wurzel.n += g;
        for (let x = namen.findLastIndex((nm) => HUELLE.test(nm)) + 1; x < namen.length; x++) {
            if (namen[x] === "(root)") continue;
            if (!knot.k.has(namen[x])) knot.k.set(namen[x], { n: 0, k: new Map() });
            (knot = knot.k.get(namen[x])).n += g;
        }
        selbst.set(namen[namen.length - 1], (selbst.get(namen[namen.length - 1]) || 0) + g);
    }
    return { wurzel, selbst };
}
function engstelle(P, ids, anteil) {
    const n = ids.length;
    if (!n) return { pfad: [], zweige: [], selbst: [] };
    const { wurzel, selbst } = rahmenBaum(P, ids);
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
    const proben = (von, bis) => probenIn(P, eich, von, bis);
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
        frameMs: quantil(dts).zahl,
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
            wandern: roh.bahn ? "bahn" : "aus",
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
        `Lauf: Regler ${a.lauf.regler} · Tiere ${a.lauf.tiere} (${a.lauf.kreaturen}) · Wandern ${a.lauf.wandern} · ` +
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
    knoten(3, "_gameLoopTick", "http://x/stamm/dirigent-takt.js", [4, 11, 13, 15, 16, 17, 18]);
    knoten(4, "_loopRender", "http://x/stamm/dirigent-takt.js", [5]);
    knoten(5, "_lastImTakt", "http://x/stamm/dirigent-takt.js");
    knoten(6, "(idle)", "");
    knoten(7, "onmessage", "http://x/stamm/dirigent-takt.js", [8]);
    knoten(8, "_nebenLast", "http://x/stamm/dirigent-takt.js");
    knoten(9, "(garbage collector)", "");
    knoten(10, "haengerEichmarke", "");
    knoten(11, "_kleinImTakt", "http://x/stamm/dirigent-takt.js");
    knoten(12, "(program)", "");
    knoten(13, "_loopRender", "http://x/stamm/dirigent-takt.js", [14]);
    knoten(14, "_lastImTakt", "http://x/stamm/dirigent-takt.js");
    knoten(15, "_teilA", "http://x/stamm/dirigent-takt.js");
    knoten(16, "_teilB", "http://x/stamm/dirigent-takt.js");
    knoten(17, "_teilC", "http://x/stamm/dirigent-takt.js");
    knoten(18, "_spitzenLast", "http://x/stamm/dirigent-takt.js");
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
    // DIE TAKT-SPITZE: 200 Takte zu 5 ms (A 2 · B 1 · C 2), dann 200 mit 3 ms Last in jedem 10. — die Last steht als Täter mit
    // 3 ms, A mit 2 ms, ROT über Band 6; ohne Last GRÜN ohne Befund
    const spitzen = [0, 3].map((last) => {
        const von = T.t.length;
        for (let i = 0; i < 200; i++) {
            takt(i % 10 === 9 ? 5 + last : 5, [15, 15, 16, 17, 17, 18, 18, 18]);
            luecke(t + 16.7);
        }
        return Object.fromEntries(Object.entries(T).map(([k, v]) => [k, v.slice(von)]));
    });
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
    spitzen.forEach((takte, last) => {
        const sp = spitzenAuswerten({ takte, eich: roh.eich }, profil, 6);
        const nennt = (re, ms) => sp.taeter.some((x) => re.test(x.name) && Math.abs(x.spitzeMs - ms) < 0.3);
        if (last && (sp.urteil !== "ROT" || !nennt(/^_spitzenLast$/, 3) || !nennt(/^_teilA$/, 2)))
            f.push(`Spitze: 3 ms je 10. Takt nicht ROT beim Namen:\n${spitzenTabelle(sp)}`);
        if (!last && spitzenBefunde(sp).length) f.push(`Spitze: ohne Last nicht GRÜN:\n${spitzenTabelle(sp)}`);
    });
    return f;
}

// ── DIE TAKT-SPITZE (Profi-Band K1/K2 + PFLICHT E in Bewegung) ─────────────────────────────────────────────────────────
// Befund OMEN Serie 1 (GTX, 21.10.): CPU-Takt p95 Genesis Third steht 5,78 ms, geht 19,7 ms — keine Linse nannte, WER die
// Spitzen-Takte des Gehens trägt. Der echte Lauf geht die Bahn der OMEN-Zellen (`__taktBahn`: 4 m/s geradeaus −z 0 → −60 m
// und zurück, im Takt über `tickAffordances`) unter dem Profiler; die gerenderten Takte ab p95 (wie `lauf` cpuTaktMs) und die
// der Mitte (p40–p60) zerfallen je Rahmen-Pfad unter der Spiel-Schleife (die Proben im Takt-Fenster teilen seine CPU-Zeit).
// Täter: jeder Rahmen, der in den Spitzen ≥ 1 ms trägt, ohne dass ein Kind ≥ 1 ms es erklärt. ROT über dem Band (K2: 8 ms).
function taktBahn(an) {
    const r = window.anazhRealm,
        g0 = window.__taktGeher,
        pm = r.state.playerMesh.position;
    // das Ende stellt an den Anfang zurück: jeder Gang einer Sitzung geht dieselbe Bahn
    if (g0) {
        delete r.tickAffordances;
        window.__taktGeher = null;
        pm.set(g0.x, pm.y, g0.z);
    }
    if (!an) return g0 && { wegM: Math.round(g0.weg), wege: g0.wege };
    const P = Object.getPrototypeOf(r);
    const g = (window.__taktGeher = { x: pm.x, z: pm.z, s: 0, dir: -1, wege: 0, weg: 0 });
    r.tickAffordances = function (dt) {
        if (Number.isFinite(dt) && dt > 0) {
            const s0 = g.s;
            g.s = Math.max(-60, Math.min(0, g.s + g.dir * 4 * Math.min(dt, 0.1)));
            if (g.s === -60 || g.s === 0) {
                g.dir = g.s === 0 ? -1 : 1;
                g.wege++;
            }
            g.weg += Math.abs(g.s - s0);
            pm.set(g.x, pm.y, g.z + g.s);
        }
        return P.tickAffordances.call(this, dt);
    };
}

function spitzenAuswerten(roh, profil, band) {
    const T = roh.takte,
        P = profil ? profilLesen(profil) : null,
        eich = P ? eichen(P, roh.eich) : null;
    const cpu = (i) => T.c1[i] - T.c0[i];
    const ids = [...T.t.keys()].filter((i) => T.g[i]);
    const q = quantil(ids.map(cpu));
    const r2 = (x) => +x.toFixed(2);
    const gruppe = (lo, hi) => ids.filter((i) => cpu(i) >= lo && cpu(i) <= hi);
    const spitze = gruppe(q(0.95), Infinity);
    let gedeckt = 0;
    // der Rahmen-Baum je Gruppe: jede Probe trägt cpu / Proben ihres Takts, je Takt gemittelt (ms)
    const baum = (gr) => {
        const w = { n: 0, k: new Map() };
        for (const i of gr) {
            const s = probenIn(P, eich, T.c0[i], T.c1[i]);
            gedeckt += gr === spitze && s.length ? 1 : 0;
            rahmenBaum(P, s, cpu(i) / s.length / gr.length, w);
        }
        return w;
    };
    const zeilen = [],
        taeter = [];
    const geh = (k, km, pfad) => {
        let rest = k.n,
            restM = km ? km.n : 0;
        for (const [nm, c] of [...k.k].filter(([, c]) => c.n >= 1).sort((a, b) => b[1].n - a[1].n)) {
            const cm = km && km.k.get(nm);
            zeilen.push({ tiefe: pfad.length, name: nm, spitzeMs: r2(c.n), mitteMs: cm ? r2(cm.n) : 0 });
            rest -= c.n;
            restM -= cm ? cm.n : 0;
            geh(c, cm, pfad.concat(nm));
        }
        // was kein Kind ≥ 1 ms erklärt, trägt der Rahmen selbst (verteilt oder Selbst-Zeit)
        const name = engstellenName({ pfad: pfad.map((n) => ({ name: n })) }) + (rest < k.n ? " (Rest)" : "");
        if (pfad.length && rest >= 1) taeter.push({ name, spitzeMs: r2(rest), mitteMs: r2(restM) });
    };
    geh(baum(spitze), baum(gruppe(q(0.4), q(0.6))), []);
    taeter.sort((a, b) => b.spitzeMs - a.spitzeMs);
    const urteil = q(0.95) > band ? "ROT" : "GRÜN";
    const lauf = { bahn: roh.bahn || null, loadScale: roh.loadScale, chunks: roh.chunks };
    return {
        band,
        cpuMs: q.zahl,
        spitzeN: spitze.length,
        takte: ids.length,
        gedeckt,
        profil: !!P,
        eichung: eich,
        zeilen,
        taeter,
        urteil,
        lauf,
    };
}
// Blind ohne Profil, ohne Eichung oder mit ungedeckten Spitzen-Takten — ROT über dem Band, mit den Tätern.
function spitzenBefunde(a) {
    const b = haengerLinsenBefunde(a);
    if (a.gedeckt < 0.9 * a.spitzeN) b.push(`nur ${a.gedeckt}/${a.spitzeN} Spitzen-Takte mit Proben`);
    const t = a.taeter.map((x) => `${x.name} ${x.spitzeMs} ms (Mitte ${x.mitteMs})`).join(" · ") || "keiner ≥ 1 ms";
    if (a.urteil === "ROT") b.push(`CPU-Takt p95 ${a.cpuMs.p95} ms > Band ${a.band} ms — Täter: ${t}`);
    return b;
}
function spitzenTabelle(a) {
    const z = [
        `TAKT-SPITZE: ${a.takte} gerenderte Takte, CPU-Takt ${JSON.stringify(a.cpuMs)} ms, ${a.spitzeN} ab p95 · ` +
            `${JSON.stringify(a.lauf)} · Urteil ${a.urteil} (Band ${a.band} ms)`,
        `  Spitze  Mitte  ms je Takt, Rahmen ≥ 1 ms`,
        ...a.zeilen.map(
            (e) =>
                `${String(e.spitzeMs).padStart(8)} ${String(e.mitteMs).padStart(6)}  ${"  ".repeat(e.tiefe)}${e.name}`
        ),
        "TÄTER (Spitze · Mitte ms je Takt):",
    ];
    return z.concat(a.taeter.map((t) => `  ${t.name}  ${t.spitzeMs} · ${t.mitteMs}`)).join("\n");
}
// Das EINE Urteil über einem Lauf (Werkbank und `--auswerten`): `spitze` die Takt-Spitze, sonst die Hänger.
function linseWerten(roh, profil, b) {
    const a = b.spitze
        ? spitzenAuswerten(roh, profil, Number(b.band) || 8)
        : haengerAuswerten(roh, profil, { schwelle: Number(b.schwelle) || 100 });
    const befunde = b.spitze ? spitzenBefunde(a) : haengerLinsenBefunde(a);
    return Object.assign(a, { befunde, tabelle: b.spitze ? spitzenTabelle(a) : haengerTabelle(a) });
}

module.exports = {
    linseWerten,
    selbsttest,
    HAENGER_INSTALL:
        `window.__haengerAn = ${haengerAn.toString()};` +
        `window.__haengerEichmarke = ${haengerEichmarke.toString()};` +
        `window.__haengerProbeTakt = ${__haengerProbeTakt.toString()};` +
        `window.__haengerProbeNeben = ${__haengerProbeNeben.toString()};` +
        `window.__taktBahn = ${taktBahn.toString()};`,
};
