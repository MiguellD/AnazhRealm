// haenger-linse.cjs — DIE HÄNGER-LINSE: jeder Frame über der Schwelle (100 ms) mit seiner URSACHE beim Namen.
// Die Hitch-Telemetrie (gate:hitch-telemetrie) zählt je SEKUNDE, nie je Hänger — diese Linse sagt, WER den Frame trug.
//
// Ein Hänger ist ein Abstand zweier GERENDERTER Frames über der Schwelle (dieselbe Größe wie `werkbank lauf` frameMs,
// die der OMEN misst). Sein Fenster läuft vom Takt-Beginn des vorigen gerenderten Frames bis zum Takt-Beginn des
// Hänger-Frames — der vorige Takt selbst gehört dazu (trägt er 900 ms, kommt der nächste rAF 900 ms später). Die Linse
// zerlegt das Fenster in drei Zeiten des Haupt-Threads:
//   TAKT   — im Spiel-Takt (`_gameLoopTick`, synchron): die Engstelle ist der tiefste Rahmen des Takt-Profils, der
//            noch die Hälfte der Takt-Proben trägt (Stichproben der Spur, 1 ms), daneben die teuersten Selbst-Funktionen;
//   NEBEN  — außerhalb des Takts, aber auf dem Haupt-Thread (Worker-Antworten, Promise-Fortsetzungen, Zeitgeber): die
//            Engstelle wie oben aus den Neben-Proben;
//   GC     — der Garbage-Collector (Proben „(garbage collector)");
//   GPU    — der Haupt-Thread wartet (Proben „(idle)", oder Takte ohne Render unter der GPU-Leine): die Ursache steht
//            auf der GPU-Seite, die Linse nennt, was der Haupt-Thread ihr im Fenster aufgetragen hat — synchrone
//            Pipelines (`createRenderPipeline`, der GPU-Prozess kompiliert, bevor er das nächste Bild zeigt) mit ihrem
//            Stoff-Namen, Shader-Module, Upload-Bytes.
// Die größte der vier Zeiten ist die Klasse; die Tabelle zählt Hänger je Ursache (Klasse · Engstelle).
//
//   Seite:     HAENGER_INSTALL (idempotent; die Geräte-Haken laufen nur, solange ein Lauf misst)
//              der Lauf ist `werkbank lauf` (`k.haenger`): je Takt Beginn, Ende, Geräte-Aufträge → Rohdaten (Takte);
//              die Stichproben trägt die EINE Spur des Laufs (`spurProfil`), ihre Takt-Marken legen sie auf die Takte
//   Werkbank:  `haenger` und `takt` (die Takt-Spitze, unten) — Aufruf in der Hilfe von scripts/werkbank.cjs;
//              `--selbsttest` (ohne Welt: die Auswertung gegen erfundene Hänger und Spitzen)
//   `--probe` schmuggelt zwei Hänger bekannter Ursache in den echten Lauf (`__haengerProbe` 250 ms im Takt und 250 ms
//   neben dem Takt) — die Linse muss beide mit ihrer Klasse beim Namen nennen, sonst Exit 1.
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
    const H = (window.__haengerH = { acc: leer(), namen: [], an: false });
    // Je Pipeline der Auftraggeber: das Objekt, das der Renderer gerade zeichnet (`_renderObjectDirect`), mit Pass und
    // Täter-Klasse — eine synchrone Pipeline im Schatten-Pass heißt „k0 tier:wolf", nicht nur „ShadowMaterial".
    const name = (art, d) => {
        if (!H.an || H.namen.length >= 20000) return;
        const e = { t: +performance.now().toFixed(2), art, n: String((d && d.label) || "?") };
        const c = H.cur;
        if (c) {
            try {
                e.pass = window.__passName ? window.__passName(c.scene, c.camera) : "?";
                // die Arena (G1) zeichnet für ihre Glieder: sie heißt nach dem ersten („haupt arena f:tanne:L1")
                const g = c.object.isGeometrieArena && c.object.glieder[0];
                e.klasse = (g ? "arena " : "") + r._taeterKlasse(g || c.object);
            } catch {
                e.pass = e.pass || "?";
            }
        } else e.pass = art === "sync" || art === "bau" ? "ausserhalb" : "kompilat";
        H.namen.push(e);
        return e;
    };
    const rend = r.state.renderer;
    // DER KNOTEN-BAU (r184 `Nodes.getForRender`): die CPU-Hälfte einer Erst-Zeichnung — der TSL-Graph des Stoffs wird zu
    // WGSL gebaut, synchron, wenn ein RenderObject zum ersten Mal zeichnet und sein Schlüssel nicht im Bau-Cache liegt.
    // Je synchronem Bau die Dauer, der Stoff und der Auftraggeber; ein asynchroner Bau (`buildAsync`, in Schritten mit
    // yieldToMain) zählt nur.
    const N = rend._nodes;
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
    return H;
}

// Die Probe-Last (`--probe`): eine bekannte Ursache mit Namen, im Takt und neben ihm — die Uhr nur je 10 000 Schritte
// (sonst trüge `now` die Proben und hieße die Engstelle).
function __haengerProbe(ms) {
    const t0 = performance.now();
    let x = 0;
    while (performance.now() - t0 < ms) for (let i = 0; i < 1e4; i++) x += Math.sqrt(x + 2);
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
    // der Ort eines Rahmens: die Datei unter der Seite (eine Stamm-Datei mit ihrem Pfad) und die Zeile seiner Definition
    const ort = (id) => {
        const c = knoten.get(id).n.callFrame;
        const pfad = String(c.url || "")
            .replace(/^[a-z]+:\/\/[^/]*\//, "")
            .split("?")[0];
        return pfad ? `${/^pptr:/.test(pfad) ? "werkbank" : pfad}:${c.lineNumber + 1}` : "";
    };
    return { zeiten, samples: p.samples, name, stapel, fnName, ort };
}

// DIE STICHPROBEN AUS DER EINEN SPUR (`lauf`, Kategorie `disabled-by-default-v8.cpu_profiler`, 1 ms; Leser: Hänger-Linse,
// `profil`, die Kalt-Zeile): das Profile auf dem Faden der Marken und seine ProfileChunks (Knoten mit Eltern) als EIN CDP-Profil
// auf der Spur-Uhr, dazu die Marken (Spur-Uhr) — die Takt-Marke `anazh-takt` je Takt legt die Takte auf die Proben, die
// Kalt-Probe setzt `anazh-kalt` (diag-boot-stage).
function spurProfil(ev, marke = "anazh-takt") {
    const marken = ev.filter((e) => /user_timing/.test(e.cat) && e.name === marke).sort((x, y) => x.ts - y.ts);
    const kopf = marken[0] && ev.find((e) => e.name === "Profile" && e.pid === marken[0].pid && e.tid === marken[0].tid);
    if (!kopf) return null;
    const knoten = new Map(), samples = [], timeDeltas = [];
    for (const e of ev.filter((x) => x.name === "ProfileChunk" && x.pid === kopf.pid && x.id === kopf.id).sort((x, y) => x.ts - y.ts)) {
        const d = e.args.data, p = d.cpuProfile || {};
        for (const n of p.nodes || []) knoten.set(n.id, Object.assign({ children: [] }, n));
        for (const x of p.samples || []) samples.push(x);
        for (const x of d.timeDeltas || []) timeDeltas.push(x);
    }
    for (const n of knoten.values()) if (knoten.has(n.parent)) knoten.get(n.parent).children.push(n.id);
    const startTime = kopf.args.data.startTime, endTime = timeDeltas.reduce((t, x) => t + x, startTime);
    const nodes = [...knoten.values()].sort((x, y) => x.id - y.id);
    // DIE ANDEREN PROZESSE (Kategorie `gpu` der Spur): ihre Aufträge ab 20 ms auf der Spur-Uhr — eine GPU-Leine ohne Auftrag der
    // Seite heißt nach dem Auftrag, der den GPU-Prozess hielt (Radeon 26.10.: `gpu_info_collector::CollectDawnInfo` 217 ms).
    const gpu = ev.filter((e) => e.pid !== kopf.pid && e.dur >= 2e4);
    return { profil: { nodes, startTime, endTime, samples, timeDeltas }, marken: marken.map((m) => m.ts), gpu };
}

// Der Versatz Seite → Spur: der Median über die Takte (Marke gegen Takt-Beginn); ungleiche Zahl legt keine Probe.
function versatzVon(spur, T, P) {
    const nT = T.t.length;
    if (!P || spur.marken.length !== nT) return null;
    return spur.marken.map((m, q) => m - T.c0[q] * 1000).sort((x, y) => x - y)[nT >> 1];
}
// Die Proben-Knoten im Seiten-Zeit-Bereich [von, bis) (ms; ohne Versatz keine).
function probenIn(P, versatz, von, bis) {
    if (versatz == null) return [];
    const lo = von * 1000 + versatz,
        hi = bis * 1000 + versatz;
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
// Die Quantile einer Reihe wie `lauf` (der Wert am Rang floor(q·n)): q(p) und die Zahl p50 · p95 · p99 · max.
function quantil(werte) {
    const s = werte.slice().sort((x, y) => x - y);
    const q = (p) => (s.length ? +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(2) : null);
    return Object.assign(q, { zahl: { p50: q(0.5), p95: q(0.95), p99: q(0.99), max: q(1) } });
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
function haengerAuswerten(roh, spur, opts) {
    const o = opts || {};
    const schwelle = o.schwelle || 100;
    const T = roh.takte;
    const P = spur && spur.profil.samples.length ? profilLesen(spur.profil) : null;
    const nT = T.t.length;
    const versatz = versatzVon(spur, T, P);
    const abst = [];
    for (let q = 1; q < nT; q++) abst.push(T.c0[q] - T.c0[q - 1]);
    abst.sort((x, y) => x - y);
    const periode = abst.length ? abst[abst.length >> 1] : 16.7;
    const proben = (von, bis) => probenIn(P, versatz, von, bis);
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
            if (versatz != null) {
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
            else {
                // ein Auftrag des GPU-Prozesses im Fenster (Spur-Uhr): er hielt die Leine, nicht die Seite
                const g = versatz != null && (spur.gpu || []).find((x) => x.ts < versatz + w1 * 1e3 && x.ts + x.dur > versatz + w0 * 1e3);
                name = g ? `GPU-Prozess: ${g.name}` : ohneRender ? "GPU-Leine ohne Auftrag" : "Bild-Takt ruht ohne Auftrag";
            }
        }
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
        const soll = (p.art === "takt" ? "TAKT" : "NEBEN") + ": __haengerProbe";
        const tRel = p.t - roh.tMess[0];
        const h = haenger.find((x) => Math.abs(x.t - tRel) < 2000 && soll.startsWith(x.klasse) && x.name.indexOf("__haengerProbe") >= 0);
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
        taktMs: quantil(T.c1.map((x, q) => x - T.c0[q])).zahl,
        haengerN: haenger.length,
        jeKlasse: Object.fromEntries(KLASSEN.map((kl) => [kl, haenger.filter((h) => h.klasse === kl).length])),
        jeUrsache: [...jeUrsache.values()]
            .map((e) => Object.assign(e, { summeMs: Math.round(e.summeMs), maxMs: Math.round(e.maxMs) }))
            .sort((x, y) => y.n - x.n || y.summeMs - x.summeMs),
        haenger,
        marken: spur ? spur.marken.length : 0,
        profil: !!P,
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
        // DER SPRUNG (`--wandern sprung`, streaming.K3): wann die Welt am Ziel stand, die Bauten im Haupt-Faden (das Urteil: die Station)
        sprung: roh.sprung || null,
    };
}

// Die Linse prüft sich: fehlen die Proben, liegen sie nicht auf den Takten, oder nennt sie eine geschmuggelte Probe nicht, ist sie blind.
function haengerLinsenBefunde(a) {
    const b = [];
    if (!a.profil) b.push("keine Stichproben in der Spur — TAKT und NEBEN ohne Engstelle");
    if (a.profil && a.marken !== a.takte) b.push(`${a.marken} Takt-Marken für ${a.takte} Takte — die Proben liegen nicht auf den Takten`);
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
            `loadScale ${a.lauf.loadScale} · Chunks ${a.lauf.chunks} · Wetter ${a.lauf.wetter} · Proben ${a.profil ? "ja" : "NEIN"} (${a.marken} Takt-Marken)`
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
            `Erst-Zeichnung: ${a.erst.verschoben} auf den nächsten ` +
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
            for (const [wort, l, fuge] of [["Pfad", h.pfad, " › "], ["Zweige", h.zweige, " · "], ["Selbst", h.selbst, " · "]])
                if (l.length) z.push(`      ${wort}: ${l.map((x) => `${x.name} ${x.pct}%`).join(fuge)}`);
            const g = Object.entries(h.geraetVorher || h.geraet || {})
                .map(([k, v]) => `${k} ${v}`)
                .join(" · ");
            if (g)
                z.push(
                    `      Gerät${h.geraetVorher ? " (mit 3 Frames davor)" : ""}: ${g}` +
                        (h.pipelines.length ? " — " + h.pipelines.slice(0, 6).join(", ") : "")
                );
        }
    }
    for (const p of a.probe || [])
        z.push(`PROBE ${p.art}: ${p.gefunden ? "genannt als „" + p.als + "“" : "NICHT GENANNT"}`);
    return z.join("\n");
}

// ── DIE TAKT-SPITZE (Profi-Band K1/K2 + PFLICHT E in Bewegung) ─────────────────────────────────────────────────────────
// Die Takte des Gangs (`lauf`, Bahn) ab p95 und der Mitte (p40–p60)
// zerfallen je Rahmen-Pfad (die Proben im Takt teilen seine CPU-Zeit). TÄTER: ein Rahmen, der ab p95 ≥ 1 ms mehr trägt als in
// der Mitte, ohne dass ein Kind ≥ 1 ms es erklärt; ROT mit Täter oder blind. Die Zeilen ab 0,25 ms.
// `posten` (`takt --posten a,b`; IN FAHRT `wandern: "fahrt"`, profiband.K1, die FAHRT-POSTEN der OMEN-Zerlegung 22.10., GTX GT-Fahrt
// F95 33,5 ms): je Name seine Zeit ab p95 über jeden Pfad (je Ast einmal gezählt), ROT über der Schwelle je Takt — ein Posten, der
// in JEDEM Takt kostet, trägt keine Spitze über der Mitte und bliebe sonst ungenannt (Lehre 25: der Takt kostet, was ihn betrifft).
// Der Cull (pbk4-fahrt) ging je Takt den Bestand, der mit dem Weg wächst — er steht für `_loopAutoSave`, das seit fahrt-takt im
// Leerlauf speichert (0 ms je Takt ab p95).
// In Fahrt ist die Schwelle 0,5 ms: jeder Rahmen darüber steht BENANNT, ROT ist ein Posten oder ein Wagen unter 150 m (blind).
const FAHRT_POSTEN = ["computeVertexNormals", "_applyCrossLodGeomorph", "_rebuildLodStitchBand", "tickArchitectureCulling"];
function postenSumme(k, namen, summe = namen.map(() => 0), oben = -1) {
    k.k.forEach((c, nm) => {
        const i = namen.indexOf(nm.split(" ")[0]);
        if (i >= 0 && i !== oben) summe[i] += c.n;
        postenSumme(c, namen, summe, i >= 0 ? i : oben);
    });
    return namen.map((name, i) => ({ name, spitzeMs: +summe[i].toFixed(2) }));
}
function spitzenAuswerten(roh, spur, posten = roh.wandern === "fahrt" ? FAHRT_POSTEN : []) {
    const S = roh.wandern === "fahrt" ? 0.5 : 1;
    const T = roh.takte,
        P = spur && spur.profil.samples.length ? profilLesen(spur.profil) : null,
        versatz = versatzVon(spur, T, P);
    const cpu = (i) => T.c1[i] - T.c0[i];
    const ids = [...T.t.keys()].filter((i) => T.g[i]);
    const q = quantil(ids.map(cpu));
    const r2 = (x) => +x.toFixed(2);
    const sp = ids.filter((i) => cpu(i) >= q(0.95));
    const a = { cpuMs: q.zahl, takte: T.t.length, spitzeN: sp.length, gedeckt: 0, bahnM: roh.bahnM, zeilen: [], taeter: [] };
    [a.marken, a.profil] = [spur ? spur.marken.length : 0, !!P];
    const baum = (gr) =>
        gr.reduce((w, i) => {
            const s = probenIn(P, versatz, T.c0[i], T.c1[i]);
            a.gedeckt += gr === sp && s.length > 0;
            return rahmenBaum(P, s, cpu(i) / s.length / gr.length, w).wurzel;
        }, { n: 0, k: new Map() });
    const geh = (k, km, pfad) => {
        let rest = k.n,
            restM = km ? km.n : 0;
        for (const [nm, c] of [...k.k].filter(([, c]) => c.n >= 0.25).sort((x, y) => y[1].n - x[1].n)) {
            const cm = km && km.k.get(nm);
            a.zeilen.push({ tiefe: pfad.length, name: nm, spitzeMs: r2(c.n), mitteMs: cm ? r2(cm.n) : 0 });
            if (c.n >= S) [(rest -= c.n), (restM -= cm ? cm.n : 0)];
            geh(c, cm, pfad.concat(nm));
        }
        const name = engstellenName({ pfad: pfad.map((n) => ({ name: n })) }) + (rest < k.n ? " (Rest)" : "");
        if (pfad.length && rest - restM >= S) a.taeter.push({ name, spitzeMs: r2(rest), mitteMs: r2(restM) });
    };
    const wSp = baum(sp);
    geh(wSp, baum(ids.filter((i) => cpu(i) >= q(0.4) && cpu(i) <= q(0.6))), []);
    a.posten = postenSumme(wSp, posten);
    a.taeter.sort((x, y) => y.spitzeMs - y.mitteMs - (x.spitzeMs - x.mitteMs));
    a.befunde = haengerLinsenBefunde(a).concat(
        a.gedeckt < 0.9 * a.spitzeN ? [`nur ${a.gedeckt}/${a.spitzeN} Spitzen-Takte mit Proben`] : [],
        S < 1 && !(a.bahnM >= 150) ? [`die Fahrt stand: ${a.bahnM} m < 150 m Weg des Wagens`] : [],
        S < 1 ? [] : a.taeter.map((t) => `Spitzen-Täter ${t.name}: ${t.spitzeMs} ms je Takt ab p95, Mitte ${t.mitteMs} ms`),
        a.posten
            .filter((p) => p.spitzeMs > S)
            .map((p) => `${S < 1 ? "Fahrt-" : ""}Posten ${p.name}: ${p.spitzeMs} ms je Takt ab p95 (> ${S} ms)`)
    );
    a.tabelle = [
        `TAKT-SPITZE: CPU-Takt ${JSON.stringify(a.cpuMs)} ms (K2 8 ms), ${a.spitzeN} Takte ab p95 (${a.gedeckt} mit Proben), ` +
            `Weg ${a.bahnM} m`,
        "  Spitze  Mitte  ms je Takt, Rahmen ≥ 0,25 ms",
        ...a.zeilen.map((e) => `${String(e.spitzeMs).padStart(8)} ${String(e.mitteMs).padStart(6)}  ${"  ".repeat(e.tiefe)}${e.name}`),
        `${S < 1 ? "BENANNT" : "TÄTER"} (Spitze − Mitte ≥ ${S} ms): ${a.taeter.map((t) => `${t.name} ${t.spitzeMs} · ${t.mitteMs}`).join(" | ") || "keiner"}`,
        ...(posten.length ? [`POSTEN (≤ ${S} ms je Takt ab p95): ${a.posten.map((p) => `${p.name} ${p.spitzeMs}`).join(" | ")}`] : []),
    ].join("\n");
    return a;
}
// Das EINE Urteil über einem Lauf (Werkbank und `--auswerten`): `spitze` die Takt-Spitze, sonst die Hänger.
function linseWerten(roh, spur, b) {
    // ohne `--posten` urteilt der Weg seine Posten (der Vorgabe-Wert, `POSTEN_JE_WEG`): ein leeres [] schwieg sie still grün
    if (b.spitze) return spitzenAuswerten(roh, spur, b.posten ? String(b.posten).split(",") : undefined);
    const a = haengerAuswerten(roh, spur, { schwelle: Number(b.schwelle) || 100 });
    return Object.assign(a, { befunde: haengerLinsenBefunde(a), tabelle: haengerTabelle(a) });
}

// DIE HALTER DER ANKUNFT (Pflicht-OFFEN B, die Kalt-Zeile `diag-boot-stage --kalt`): jede Aufgabe des Haupt-Fadens vor dem
// ersten Weltbild über ANKUNFT_HALT_MS (die lange Aufgabe des Browsers, `longtask`) mit den Funktionen, die sie hielten, beim
// Namen: je Aufgabe der Rahmen-Baum ihrer Stichproben (ohne die Hüllen, `rahmenBaum`), Halter ist der tiefste Rahmen, der in
// ihr ≥ ANKUNFT_HALT_MS trägt, während keines seiner Kinder es tut — trägt ein Rahmen über seinen haltenden Kindern noch
// ≥ ANKUNFT_HALT_MS, hält er selbst „verteilt"; hält kein Rahmen, ist die Aufgabe verteilt (ihre drei schwersten Zweige).
// Dazu je Funktion die Summe vor dem Bild (inklusiv, ohne Rekursion doppelt; selbst) und die belegte Zeit. `seite`: die
// Aufgaben (`lang` [Start, Dauer] auf der Seiten-Uhr), die Marken der Kalt-Probe (Seiten-Uhr, ms) und `bis` (das Bild).
// Die Stichproben trägt die EINE Spur (`spurProfil`, Marke `anazh-kalt`); Uhr-Versatz = Median der Marken-Paare.
const ANKUNFT_HALT_MS = 50;
function ankunftsHalter(spur, seite, opts) {
    const o = Object.assign({ schwelle: ANKUNFT_HALT_MS, top: 25 }, opts);
    const P = spur && spur.profil && spur.profil.samples.length ? profilLesen(spur.profil) : null;
    const s = seite || {};
    const n = Math.min(spur ? spur.marken.length : 0, (s.marken || []).length);
    const paare = [];
    for (let i = 0; i < n; i++) paare.push(spur.marken[i] - s.marken[i] * 1000);
    paare.sort((x, y) => x - y);
    const versatz = P && n ? paare[n >> 1] : null;
    const out = {
        profil: !!P,
        marken: n,
        versatz,
        bisMs: s.bis,
        aufgaben: [],
        summen: [],
        befunde: [],
        belegtMs: 0,
        kosten: {},
        vorBild: {},
        halter: [],
    };
    if (versatz == null)
        return Object.assign(out, {
            befunde: ["keine Stichproben auf den Marken der Kalt-Probe — die Halter ohne Namen"],
        });
    const bisUs = s.bis * 1000 + versatz;
    // das Gewicht jeder Probe: ihr Abstand zur nächsten (µs → ms), höchstens 10 ms (eine Lücke der Spur zählt nie als Arbeit)
    const gew = (i) =>
        Math.min(10, ((i + 1 < P.zeiten.length ? P.zeiten[i + 1] : P.zeiten[i] + 1000) - P.zeiten[i]) / 1000);
    const ortVon = new Map();
    const merke = (id) => {
        for (const x of P.stapel(id)) if (!ortVon.has(P.name(x))) ortVon.set(P.name(x), P.ort(x));
    };
    // die Summen vor dem Bild: belegt (ohne Leerlauf), je Funktion inklusiv und selbst; die Meilensteine der Seite
    // (`seite.meilensteine` {Name: Seiten-ms}) tragen die belegte Zeit bis zu ihnen
    const inkl = new Map(),
        selbst = new Map(),
        klasse = { "(idle)": 0, "(program)": 0, "(garbage collector)": 0 };
    const M = Object.entries(s.meilensteine || {})
        .filter(([, t]) => Number.isFinite(t))
        .map(([name, t]) => ({ name, t: Math.round(t), us: t * 1000 + versatz, belegtMs: null }))
        .sort((a, b) => a.t - b.t);
    // DIE KLASSEN je Sekunde (`seite.klassen` {Funktion: Klasse}; in der `familie` zählt nur die äußere, sonst zählt verschachtelt
    // jede): die Kosten-Spalte der Kalt-Zeile und die Summe der Familie bis zum Bild (`vorBild`)
    const KL = s.klassen || null,
        FAM = new Set(s.familie || []);
    [out.kosten, out.vorBild] = [{}, {}];
    let summe = 0;
    for (let i = 0, m = 0; i < P.zeiten.length; i++) {
        for (; m < M.length && M[m].us <= P.zeiten[i]; m++) M[m].belegtMs = Math.round(summe);
        const id = P.samples[i],
            g = gew(i),
            fn = P.fnName(id);
        if (fn !== "(idle)") summe += g;
        if (KL && fn !== "(idle)") {
            const sek = Math.floor((P.zeiten[i] - versatz) / 1e6);
            const da = new Set();
            let famDa = false;
            for (const x of P.stapel(id)) {
                const k = KL[P.fnName(x)];
                if (!k || da.has(k) || (FAM.has(k) && famDa)) continue;
                da.add(k);
                famDa = famDa || FAM.has(k);
                const z = out.kosten[k] || (out.kosten[k] = {});
                z[sek] = (z[sek] || 0) + g;
                if (FAM.has(k) && P.zeiten[i] < bisUs) out.vorBild[k] = (out.vorBild[k] || 0) + g;
            }
        }
        if (P.zeiten[i] >= bisUs) continue;
        if (fn in klasse) klasse[fn] += g;
        if (fn === "(idle)") continue;
        out.belegtMs += g;
        merke(id);
        const namen = new Set(P.stapel(id).map((x) => P.name(x)));
        for (const nm of namen) if (nm !== "(root)") inkl.set(nm, (inkl.get(nm) || 0) + g);
        selbst.set(P.name(id), (selbst.get(P.name(id)) || 0) + g);
    }
    const S = o.schwelle;
    const halterIn = (knot, name, liste) => {
        const kinder = [...knot.k.entries()].filter(([, c]) => c.n >= S);
        if (!kinder.length) return name && liste.push({ name, ms: knot.n });
        let rest = knot.n;
        for (const [k, c] of kinder) ((rest -= c.n), halterIn(c, k, liste));
        if (rest >= S && name) liste.push({ name: name + " (verteilt)", ms: rest });
    };
    for (const [start, dauer] of s.lang || []) {
        if (start >= s.bis || dauer < S) continue;
        const lo = start * 1000 + versatz,
            hi = (start + dauer) * 1000 + versatz;
        const ids = [],
            gs = [];
        for (let i = 0; i < P.zeiten.length && P.zeiten[i] < hi; i++)
            if (P.zeiten[i] >= lo && P.fnName(P.samples[i]) !== "(idle)") (ids.push(P.samples[i]), gs.push(gew(i)));
        // die Proben mit ihrem Abstand; was die Dauer der Aufgabe (der Browser misst sie) über die Proben hinaus trägt, hielt der
        // Faden ohne JS-Probe (nativ, eine synchrone Antwort) — es steht beim Namen „(ohne Probe)", nie verteilt auf die Proben
        const wurzel = { n: 0, k: new Map() };
        ids.forEach((id, k) => (merke(id), rahmenBaum(P, [id], gs[k], wurzel)));
        const ohne = dauer - wurzel.n;
        if (ohne >= S) [wurzel.n, wurzel.k] = [dauer, wurzel.k.set("(ohne Probe)", { n: ohne, k: new Map() })];
        const halter = [];
        halterIn(wurzel, null, halter);
        const zweige = [...wurzel.k.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 3);
        if (!halter.length)
            halter.push({
                name: `verteilt (${zweige.map(([k, c]) => `${k} ${Math.round(c.n)}`).join(" · ")})`,
                ms: dauer,
            });
        out.aufgaben.push({
            t: Math.round(start),
            ms: Math.round(dauer),
            halter: halter
                .sort((a, b) => b.ms - a.ms)
                .map((h) => ({
                    name: h.name,
                    ort: ortVon.get(h.name.replace(/ \(verteilt\)$/, "")) || "",
                    ms: Math.round(h.ms),
                })),
        });
    }
    out.aufgaben.sort((a, b) => b.ms - a.ms);
    out.summen = [...inkl.entries()]
        .filter(([nm]) => !(nm in klasse))
        .sort((a, b) => b[1] - a[1])
        .slice(0, o.top)
        .map(([nm, ms]) => ({
            name: nm,
            ort: ortVon.get(nm) || "",
            ms: Math.round(ms),
            selbstMs: Math.round(selbst.get(nm) || 0),
        }));
    out.belegtMs = Math.round(out.belegtMs);
    out.klasse = Object.fromEntries(Object.entries(klasse).map(([k, v]) => [k, Math.round(v)]));
    out.meilensteine = M.map(({ name, t, belegtMs }) => ({
        name,
        t,
        belegtMs: belegtMs == null ? Math.round(summe) : belegtMs,
    }));
    // DAS URTEIL: je Halter-Name die längste Aufgabe, die er hielt, und wie oft — ROT beim Namen
    const je = new Map();
    for (const a of out.aufgaben)
        for (const h of a.halter) {
            const e = je.get(h.name) || { name: h.name, ort: h.ort, n: 0, maxMs: 0, summeMs: 0, t: a.t };
            e.n++;
            e.summeMs += h.ms;
            if (h.ms > e.maxMs) ((e.maxMs = h.ms), (e.t = a.t));
            je.set(h.name, e);
        }
    out.halter = [...je.values()].sort((a, b) => b.summeMs - a.summeMs);
    out.befunde = out.halter.map(
        (h) =>
            `${h.name}${h.ort ? ` (${h.ort})` : ""} hält den Haupt-Faden vor dem ersten Bild ${h.maxMs} ms (bei ${(h.t / 1000).toFixed(1)} s; ${h.n}× ≥ ${S} ms, Σ ${h.summeMs} ms)`
    );
    // DER GPU-PROZESS (die Spur trägt gpu.dawn): ein SYNCHRONER Pipeline-Bau hält seinen Haupt-Faden — so lange kommt kein Bild
    // und kein Takt der Seite (Radeon kalt 31.10.: die Atmosphäre 2,6 s, der Haupt-Faden der Seite stand vor dem Bild 2,2–2,7 s
    // leer, und keine Halter-Zeile sah es) — vorn, ROT beim Namen
    let g = 0;
    for (const e of spur.gpu || [])
        if (/^DeviceBase::APICreate\w+Pipeline$/.test(e.name) && e.ts < bisUs && e.dur >= S * 1e3)
            out.befunde.splice(g++, 0, `GPU-Prozess: ${e.args.label} synchron ${Math.round(e.dur / 1e3)} ms`);
    return out;
}
// Die Tafel der Halter: die längsten Aufgaben mit ihren Haltern, die Funktions-Summen vor dem Bild.
function ankunftsHalterTafel(a, nAufgaben = 10, nSummen = 15) {
    const z = [];
    const kl = a.klasse || {};
    z.push(
        `  DER HAUPT-FADEN bis zum Bild (${((a.bisMs || 0) / 1000).toFixed(2)} s): belegt ${a.belegtMs} ms · Collector ${kl["(garbage collector)"] || 0} · ` +
            `Programm ${kl["(program)"] || 0} · leer ${kl["(idle)"] || 0} ms`
    );
    if ((a.meilensteine || []).length)
        z.push(
            `  die Phasen (t · Haupt-Faden belegt bis dahin): ${a.meilensteine.map((m) => `${m.name} ${(m.t / 1000).toFixed(2)} s · ${m.belegtMs} ms`).join(" | ")}`
        );
    z.push(
        `  die ${Math.min(nAufgaben, a.aufgaben.length)} längsten Aufgaben vor dem Bild (von ${a.aufgaben.length} ≥ ${ANKUNFT_HALT_MS} ms):`
    );
    for (const x of a.aufgaben.slice(0, nAufgaben))
        z.push(
            `    ${(x.t / 1000).toFixed(2).padStart(6)} s ${String(x.ms).padStart(5)} ms  ` +
                x.halter
                    .slice(0, 3)
                    .map((h) => `${h.name}${h.ort ? ` ${h.ort}` : ""} ${h.ms}`)
                    .join(" · ")
        );
    z.push(`  die Funktionen vor dem Bild (inklusiv · selbst ms):`);
    for (const x of a.summen.slice(0, nSummen))
        z.push(
            `    ${String(x.ms).padStart(6)} · ${String(x.selbstMs).padStart(5)}  ${x.name}${x.ort ? ` ${x.ort}` : ""}`
        );
    return z.join("\n");
}

// DER SELBSTTEST (ohne Welt): ein erfundener Lauf mit Hängern bekannter Ursache (Takt-Last, Neben-Last, Collector,
// GPU-Warten nach synchronen Pipelines, ein Auftrag des GPU-Prozesses) als Spur (Profile, zwei ProfileChunks, Takt-Marken
// auf einer gegen die Seite versetzten Uhr) — die Auswertung muss jeden beim Namen nennen und keinen ruhigen Frame zählen; fehlt eine Takt-Marke, ist sie ROT.
// Die Takt-Spitze: 200 Takte zu 5 ms (A 2 · B 1 · C 2), dann 200 mit 3 ms Last in jedem 10. — die Last ist allein Täter
// (3 ms), A (in jedem Takt) keiner; ohne Last GRÜN.
function selbsttest() {
    const f = [];
    // Profil-Knoten der Spur (je Knoten sein Eltern-Knoten)
    const nodes = [];
    const knoten = (id, fn, url, parent) => nodes.push({ id, callFrame: { functionName: fn, url: url || "", lineNumber: 0 }, parent });
    const D = "http://x/stamm/dirigent-takt.js";
    knoten(1, "(root)", "");
    knoten(2, "", "werkbank", 1);
    // V8 legt dieselbe Funktion je Code-Stufe als Geschwister an (13/14 neben 4/5) — die Engstelle muss sie vereinen
    knoten(3, "_gameLoopTick", D, 2);
    knoten(4, "_loopRender", D, 3);
    knoten(5, "_lastImTakt", D, 4);
    knoten(6, "(idle)", "", 1);
    knoten(7, "onmessage", D, 1);
    knoten(8, "_nebenLast", D, 7);
    knoten(9, "(garbage collector)", "", 1);
    knoten(11, "_kleinImTakt", D, 3);
    knoten(12, "(program)", "", 1);
    knoten(13, "_loopRender", D, 3);
    knoten(14, "_lastImTakt", D, 13);
    for (const [id, fn] of [[15, "_teilA"], [16, "_teilB"], [17, "_teilC"], [18, "_spitzenLast"]]) knoten(id, fn, D, 3);
    // Seiten-Uhr: Takt alle 16,7 ms ab t=1000; Spur-Uhr = Seite + 5 000 000 µs
    const V = 5e6;
    const samples = [],
        deltas = [];
    let letzte = V + 989e3;
    const probe = (tSeiteMs, id) => {
        const us = tSeiteMs * 1000 + V;
        samples.push(id);
        deltas.push(us - letzte);
        letzte = us;
    };
    const T = { t: [], c0: [], c1: [], g: [], innen: [], aussen: [] };
    const namen = [];
    let t = 1000;
    const takt = (dauer, idImTakt, renderiert, innen) => {
        T.t.push(t);
        T.c0.push(t);
        T.c1.push(t + dauer);
        T.g.push(renderiert === false ? 0 : 1);
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
    // n ruhige Takte; die Leine: 18 Takte ohne Render (300 ms Warten), dann das nächste Bild
    const ruhig = (n) => {
        for (let i = 0; i < n; i++) {
            takt(4);
            luecke(t + 16.7);
        }
    };
    const leine = () => {
        for (let i = 0; i < 18; i++) {
            luecke(t + 16.7);
            takt(1, 11, false);
        }
        luecke(t + 16.7);
    };
    ruhig(30);
    // Hänger 1: 250 ms im Takt (_lastImTakt unter _loopRender, je zur Hälfte in zwei Geschwister-Knoten)
    takt(250, [5, 14]);
    luecke(T.c1[T.c1.length - 1] + 5);
    ruhig(10);
    // Hänger 2: 250 ms neben dem Takt (onmessage → _nebenLast)
    takt(4);
    luecke(t + 260, 8);
    ruhig(10);
    // Hänger 3: 200 ms Collector neben dem Takt
    takt(4);
    luecke(t + 210, 9);
    ruhig(10);
    // Hänger 4: drei synchrone Pipelines im Takt, danach 300 ms Warten (Takte ohne Render unter der Leine)
    namen.push(
        { t: t + 1, art: "sync", n: "renderPipeline_baumRinde_17" },
        { t: t + 2, art: "sync", n: "renderPipeline_NodeMaterial_18" }
    );
    takt(4, 11, true, { pipeSync: 2 });
    leine();
    ruhig(10);
    // Hänger 5: 210 ms im Takt, gleich verteilt auf drei Zweige — keiner trägt die Hälfte: VERTEILT
    takt(210, [15, 16, 17]);
    luecke(T.c1[T.c1.length - 1] + 5);
    ruhig(10);
    // Hänger 6: 300 ms unter der Leine ohne Auftrag der Seite — der GPU-Prozess sammelt seine Dawn-Info (Spur, Kategorie gpu)
    takt(4);
    const gpuVon = t;
    leine();
    ruhig(10);
    const spitzen = [0, 3].map((last) => {
        const von = T.t.length;
        for (let i = 0; i < 200; i++) {
            takt(i % 10 === 9 ? 5 + last : 5, [15, 15, 16, 17, 17, 18, 18, 18]);
            luecke(t + 16.7);
        }
        return [von, T.t.length];
    });
    const ende = t;
    const roh = { takte: T, namen, tMess: [1000, ende], probe: [], k: {} };
    const chunk = (von, bis, ts) => ({ name: "ProfileChunk", pid: 1, tid: 7, id: "0x1", ts, args: { data: {
        cpuProfile: { nodes: nodes.slice(von, bis), samples: samples.slice(von * 300, bis * 300) },
        timeDeltas: deltas.slice(von * 300, bis * 300) } } });
    const ev = [chunk(8, 99, V + 2e6), { name: "Profile", pid: 1, tid: 1, id: "0x1", ts: V + 989e3, args: { data: { startTime: V + 989e3 } } },
        { name: "gpu_info_collector::CollectDawnInfo", pid: 2, ts: gpuVon * 1000 + V, dur: 3e5 },
        chunk(0, 8, V + 1e6), ...T.c0.map((c) => ({ name: "anazh-takt", cat: "blink.user_timing", pid: 1, tid: 1, ts: c * 1000 + V + 40 }))];
    const a = haengerAuswerten(roh, spurProfil(ev), { schwelle: 100 });
    const erwartet = [
        ["TAKT", "_loopRender › _lastImTakt"],
        ["NEBEN", "onmessage › _nebenLast"],
        ["GC", "Garbage-Collector"],
        ["GPU", "Pipeline synchron (baumRinde, NodeMaterial)"],
        ["TAKT", "verteilt"],
        ["GPU", "GPU-Prozess: gpu_info_collector::CollectDawnInfo"],
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
    if (!haengerLinsenBefunde(haengerAuswerten(roh, spurProfil(ev.slice(0, -1)), { schwelle: 100 })).length)
        f.push("eine fehlende Takt-Marke bleibt ohne Befund (die Proben lägen auf fremden Takten)");
    if (haengerLinsenBefunde(a).length) f.push("Befunde im erfundenen Lauf: " + haengerLinsenBefunde(a).join(" · "));
    // ohne Profil: die Zeiten-Zerlegung allein (Takt gegen Rest) bleibt und nennt TAKT ohne Engstelle
    const ohne = haengerAuswerten(roh, null, { schwelle: 100 });
    if (ohne.haengerN !== erwartet.length || ohne.haenger[0].klasse !== "TAKT")
        f.push("ohne Profil: Takt-Hänger nicht als TAKT gezählt");
    if (!haengerLinsenBefunde(ohne).length)
        f.push("ohne Profil meldet die Linse keinen Befund (sie wäre blind und grün)");
    const sp = spurProfil(ev);
    const teilVon = (von, bis) => [Object.fromEntries(Object.entries(T).map(([k, v]) => [k, v.slice(von, bis)])), { ...sp, marken: sp.marken.slice(von, bis) }];
    spitzen.forEach(([von, bis], last) => {
        const [teil, spur] = teilVon(von, bis);
        const s = spitzenAuswerten({ takte: teil }, spur);
        const t = s.taeter[0];
        if (last ? s.befunde.length !== 1 || t.name !== "_spitzenLast" || Math.abs(t.spitzeMs - t.mitteMs - 3) > 0.3 : s.befunde.length)
            f.push(`Spitze ${last ? "mit" : "ohne"} 3 ms je 10. Takt falsch geurteilt:\n${s.tabelle}`);
        // die Posten: _teilA trägt 2/8 jedes Takts (≥ 1,25 ms ohne Spitze über der Mitte: ROT), _teilB 1/8 (GRÜN)
        const p = spitzenAuswerten({ takte: teil }, spur, ["_teilA", "_teilB"]);
        if (p.befunde.length !== s.befunde.length + 1 || !/^Posten _teilA: /.test(p.befunde.at(-1)))
            f.push(`Posten ${p.posten.map((x) => `${x.name} ${x.spitzeMs}`).join(" · ")} ms falsch geurteilt`);
    });
    // DIE FAHRT: der ruhige Lauf GRÜN; heißt _teilC (2 ms je Takt) computeVertexNormals, ROT beim Namen; ein stehender Wagen ROT
    const [v0, b0] = spitzen[0];
    const fahrt = (nm, bahnM) => {
        const nodes = sp.profil.nodes.map((n) => (n.id === 17 ? { ...n, callFrame: { ...n.callFrame, functionName: nm } } : n));
        const [takte, spur] = teilVon(v0, b0);
        return linseWerten({ takte, wandern: "fahrt", bahnM }, { ...spur, profil: { ...sp.profil, nodes } }, { spitze: true }).befunde.join();
    };
    const urteil = [fahrt("_teilC", 500), fahrt("computeVertexNormals", 500), fahrt("_teilC", 20)];
    if (urteil[0] || !/^Fahrt-Posten computeVertexNormals: 2[^,]*$/.test(urteil[1]) || !/^die Fahrt stand[^,]*$/.test(urteil[2]))
        f.push("die Fahrt falsch geurteilt: " + urteil.join(" | "));
    return f.concat(ankunftsSelbsttest());
}

// DER SELBSTTEST DER HALTER (ohne Welt): eine erfundene Kalt-Spur auf einer gegen die Seite versetzten Uhr — vor dem Bild
// (3 000 ms) hält `_lastVorBild` 120 ms (der Täter beim Namen, Datei und Zeile), drei Teile zu je 30 ms tragen eine Aufgabe von
// 90 ms nur gemeinsam (verteilt), eine Aufgabe von 100 ms trägt 40 Proben (die letzte vor der Lücke wiegt höchstens 10 ms, der
// Rest steht „(ohne Probe)"), 30 ms bleiben unter der Schwelle; nach dem Bild hält `_lastNachBild` 200 ms (nie ein Befund). Ohne Marken ist die Linse ROT (blind), ihre Klassen
// zählen die Last je Sekunde, der Meilenstein Bild trägt die belegte Zeit bis zu ihm.
function ankunftsSelbsttest() {
    const f = [];
    const D = "http://x:1/stamm/dienst.js?v=1";
    const nodes = [];
    const knoten = (id, fn, url, parent, zeile = 0) =>
        nodes.push({ id, callFrame: { functionName: fn, url: url || "", lineNumber: zeile }, parent });
    knoten(1, "(root)", "");
    knoten(2, "_gameLoopTick", D, 1, 40);
    knoten(3, "_lastVorBild", D, 2, 122);
    knoten(4, "_klein", D, 2, 7);
    knoten(5, "(idle)", "", 1);
    knoten(6, "_lastNachBild", D, 2, 300);
    for (const [id, fn] of [
        [8, "_teilA"],
        [9, "_teilB"],
        [10, "_teilC"],
    ])
        knoten(id, fn, D, 2, id);
    const V = 7e6; // Spur-Uhr = Seite · 1000 + V
    const [samples, deltas] = [[], []];
    let letzte = V;
    const probe = (ms, id) => {
        samples.push(id);
        deltas.push(ms * 1000 + V - letzte);
        letzte = ms * 1000 + V;
    };
    const last = (von, bis, id) => {
        for (let t = von; t < bis; t++) probe(t + 0.5, typeof id === "function" ? id(t) : id);
    };
    last(0, 1000, 5);
    last(1000, 1120, 3);
    last(1120, 1500, 5);
    last(1500, 1590, (t) => [8, 9, 10][Math.floor((t - 1500) / 30)]);
    last(1590, 2000, 5);
    last(2000, 2040, 4); // 40 ms Proben, die Aufgabe dauert 100 ms
    probe(2100.5, 5);
    last(2101, 2500, 5);
    last(2500, 2530, 4);
    last(2530, 3500, 5);
    last(3500, 3700, 6);
    last(3700, 4000, 5);
    const profil = { nodes, startTime: V, endTime: letzte, samples, timeDeltas: deltas };
    const seiteMarken = [100, 600, 1100, 2200, 3300, 3900];
    // der GPU-Prozess: ein synchroner Bau vor dem Bild ist ROT beim Namen, ein asynchroner und einer nach dem Bild nie
    const gpu = [1200, 1300, 3100].map((t, i) => ({
        name: "DeviceBase::APICreateRenderPipeline" + ["", "Async", ""][i],
        args: { label: "p" + i },
        ts: t * 1e3 + V + 30,
        dur: 1e6,
    }));
    const spur = { profil, marken: seiteMarken.map((m) => m * 1000 + V + 30), gpu };
    const seite = {
        lang: [
            [1000, 120],
            [1500, 90],
            [2000, 100],
            [2500, 30],
            [3500, 200],
        ],
        marken: seiteMarken,
        bis: 3000,
        meilensteine: { Bild: 3000 },
        klassen: { _lastVorBild: "Last", _lastNachBild: "Last" },
    };
    const a = ankunftsHalter(spur, seite);
    const [n1, n2, n3] = [
        a.aufgaben.find((x) => x.t === 1000),
        a.aufgaben.find((x) => x.t === 1500),
        a.aufgaben.find((x) => x.t === 2000),
    ];
    if (a.aufgaben.length !== 3)
        f.push(
            `Halter: ${a.aufgaben.length} Aufgaben vor dem Bild, erwartet 3 (≥ ${ANKUNFT_HALT_MS} ms, die nach dem Bild nie)`
        );
    const h1 = n1 && n1.halter[0];
    if (!h1 || h1.name !== "_lastVorBild" || h1.ort !== "stamm/dienst.js:123" || Math.abs(h1.ms - 120) > 3)
        f.push(`Halter: der gepflanzte Täter nicht beim Namen — ${JSON.stringify(n1)}`);
    if (!n2 || n2.halter.length !== 1 || !/^verteilt \(_teilA 30 · _teilB 30 · _teilC 30\)$/.test(n2.halter[0].name))
        f.push(`Halter: die verteilte Aufgabe nennt ihre drei Zweige nicht — ${JSON.stringify(n2)}`);
    if (!n3 || n3.halter[0].name !== "(ohne Probe)" || Math.abs(n3.halter[0].ms - 51) > 3)
        f.push(`Halter: der Halt ohne Probe steht nicht beim Namen — ${JSON.stringify(n3)}`);
    if (
        a.befunde.some((b) => /_lastNachBild/.test(b)) ||
        !a.befunde.some((b) =>
            /^_lastVorBild \(stamm\/dienst\.js:123\) hält den Haupt-Faden vor dem ersten Bild 120 ms/.test(b)
        )
    )
        f.push(`Halter: das Urteil nennt den Täter vor dem Bild nicht (oder einen nach ihm): ${a.befunde.join(" | ")}`);
    if (a.befunde[0] !== "GPU-Prozess: p0 synchron 1000 ms" || /^GPU/.test(a.befunde[1]))
        f.push("Halter: der GPU-Bau ohne Namen");
    if (Math.abs((a.kosten.Last || {})[1] - 120) > 3 || Math.abs((a.kosten.Last || {})[3] - 200) > 3)
        f.push(`Halter: die Klasse zählt die Last je Sekunde nicht (${JSON.stringify(a.kosten)})`);
    const bild = (a.meilensteine || [])[0];
    if (!bild || Math.abs(bild.belegtMs - 289) > 4)
        f.push(`Halter: der Meilenstein Bild trägt ${bild && bild.belegtMs} ms belegt, erwartet 289`);
    const blind = ankunftsHalter({ profil, marken: [] }, seite);
    if (!blind.befunde.length || blind.aufgaben.length) f.push("Halter: ohne Marken bleibt die Linse grün (blind)");
    return f;
}

// DIE LATENZ (leib.K1, die Seite von `werkbank latenz`): Taste → bewegter Leib im Ausgabe-Bild. Start ist der Zeitstempel des Tasten-Ereignisses (CDP
// Input.dispatchKeyEvent, `event.timeStamp`), Ende die Marke des präsentierten Bilds (`getCurrentTexture` am Canvas der Welt,
// wie die Belegungs-Spur), in dem Kamera oder Leib ≥ 1 cm von der Lage des letzten Bilds vor der Taste stehen. Je Probe die
// Zerlegung: eingabe (Ereignis → Hörer) · warten (Hörer → Beginn des Takts, der das Bild zeichnet) · takte · bild (Takt →
// Marke) · regung (das erste Bild ≥ 1 mm: bis dahin die Kette, danach die Gang-Kurve).
// `verzug` (Selbsttest) hält die Taste n präsentierte Bilder im Eingabe-Pfad zurück (die Leine zeichnet nicht jeden Takt); die Bewegung liest nie das Render-Signal.
// DER HIEB (halten.K2): der Klick (CDP, Zeiger gefangen) auf ein gehaltenes Tier unter dem Fadenkreuz; Ende das Bild, in dem
// die rechte Hand ≥ 1 cm steht, `hoerer` die Zeit im Hörer des Spiels, `halt` der Hit-Stop: die längste Folge
// präsentierter Bilder nach dem Treffer mit stehender Schwung-Uhr und Hand.
function latenzAn(k) {
    const rend = st.renderer, raf = () => new Promise((f) => requestAnimationFrame(f));
    window.__buehne();
    if (window.__tiereHalten) window.__tiereHalten();
    const pm = st.playerMesh, hand = () => pm.userData.rig.armR.wrist.getWorldPosition(pm.position.clone()).sub(pm.position);
    const lage = () =>
        L.verb === "hieb" ? [hand().toArray()] : [st.camera.matrixWorld.elements.slice(12, 15), pm.position.toArray()];
    const weg = (a, b) => (b && a.length === b.length ? Math.max(...a.map((v, i) => Math.hypot(...v.map((x, j) => x - b[i][j])))) : Infinity);
    const L = (window.__latenz = { takt: 0, still: 0, bilder: [], offen: [], sicht: st.cameraMode });
    L.start = st.playerMesh.position.clone();
    const gct = GPUCanvasContext.prototype.getCurrentTexture, synth = new WeakSet();
    GPUCanvasContext.prototype.getCurrentTexture = function () {
        // ein Mess-Fehler hält nie das Bild an (bis latenz-verben warf `weg` nach hieb in jedem Bild: der Sammel-Lauf hing)
        if (this.canvas === rend.domElement) {
            const t = performance.now();
            try {
                const l = lage(), p = L.probe;
                L.still = L.vor && weg(l, L.vor) < 0.001 ? L.still + 1 : 0;
                if (p && p.t0 != null && p.regung == null && weg(l, p.ref) >= 0.001) p.regung = t - p.t0;
                if (p && p.t0 != null && !p.ms && weg(l, p.ref) >= 0.01)
                    Object.assign(p, { ms: t - p.t0, warten: L.taktAm - p.hoerer, takte: L.takt - p.takt, bild: t - L.taktAm });
                const sw = p && p.t0 != null && st.player._swing;
                if (sw && sw.hits.size) p.halt = Math.max(p.halt || 0, (p.lauf = sw.t === L.swVor && weg(l, L.vor) < 0.001 ? (p.lauf || 0) + 1 : 0));
                L.swVor = sw && sw.t;
                L.vor = l;
            } catch (e) {
                L.fehler = L.fehler || String(e);
            }
            L.rafAmBild = L.raf;
            L.bilder.push(t);
        }
        return gct.call(this);
    };
    const hoer = (ev) => {
        if (synth.has(ev)) return;
        const p = L.probe, jetzt = performance.now();
        if (ev.type.endsWith("down") && p && p.t0 == null)
            Object.assign(p, { t0: ev.timeStamp, eingabe: jetzt - ev.timeStamp, hoerer: jetzt, takt: L.takt, ref: L.vor });
        if (!k.verzug || ev.type === "mousedown") return;
        ev.stopImmediatePropagation();
        const kopie = new KeyboardEvent(ev.type, { key: ev.key, code: ev.code, bubbles: true, cancelable: true });
        const eintrag = [ev.target, kopie];
        synth.add(kopie), L.offen.push(eintrag);
        (async () => {
            for (const n = L.bilder.length + k.verzug; L.bilder.length < n && L.offen.includes(eintrag); ) await raf();
            if (L.offen.includes(eintrag)) L.offen.splice(L.offen.indexOf(eintrag), 1), ev.target.dispatchEvent(kopie);
        })();
    };
    const nach = () => L.probe && L.probe.imHoerer == null && (L.probe.imHoerer = performance.now() - L.probe.hoerer); // Taste wie Klick
    for (const typ of ["keydown", "keyup", "mousedown"]) window.addEventListener(typ, hoer, true);
    for (const typ of ["keydown", "mousedown"]) window.addEventListener(typ, nach);
    rend.setAnimationLoop((t) => {
        L.takt++;
        L.taktAm = performance.now();
        window.__wetterHalten();
        r._gameLoopTick(t);
    });
    // die Wache der Fristen: 120 rAF ohne Bild oder ein Mess-Fehler brechen laut (eine Frist nur in Bildern wartete ewig)
    L.raf = L.rafAmBild = 0;
    const wache = async () => {
        await raf();
        if (L.fehler || ++L.raf - L.rafAmBild > 120) throw new Error(`latenz ${L.verb}: ${L.fehler || "120 rAF ohne Bild"}`);
    };
    // je Probe (Fristen in präsentierten Bildern, nie in Wanduhr): zurück an den Start, die Sicht, 8 ruhige Bilder, dann eine
    // zufällige Phase gegen den Bild-Takt
    L.bereit = async (sicht, zurueck, verb) => {
        L.probe = null;
        if (L.verb !== verb) (L.vor = null), (L.verb = verb); // die Lage wechselt mit dem Verb (bis latenz-verben maß gehen nach hieb die Hand)
        if (st.player.mountedArch != null) r.dismountArchitecture(); // die Probe davor stieg ein
        if (L.wagen && verb !== "einsteigen") r.removeArchitecture(L.wagen), (L.wagen = null); // die Bühne eines Verbs steht nie im nächsten
        if (L.tier && verb !== "hieb") r.removeCreature(L.tier), r.equipHeld(null), (L.tier = null);
        if (zurueck || verb === "hieb") st.playerMesh.position.copy(L.start);
        if (st.cameraMode !== sicht) r.setCameraMode(sicht);
        if (verb === "hieb" && !(await L.tierStellen())) return false;
        if (verb === "einsteigen") await L.wagenStellen();
        for (const bis = L.bilder.length + 240; L.still < 8 || st.player._swing; await wache()) if (L.bilder.length > bis) return false;
        await sleep(Math.random() * 17);
        return !!(L.probe = {});
    };
    L.treffer = async () => {
        for (const bis = L.bilder.length + 60; !L.probe.ms && L.bilder.length < bis; ) await wache();
        for (const bis = L.bilder.length + 120; st.player._swing && L.bilder.length < bis; ) await wache();
        return Object.assign(L.probe, { ref: undefined, verb: st.player._mausVerb });
    };
    // das Tier des Hiebs: heil, gehalten, halbe Klingen-Reichweite + 0,5 m vor dem Leib, das Fadenkreuz auf seiner Leibes-Mitte.
    // Es ist der Hirsch („wesen“), die Art, die die Mess-Wiese trägt (K 5,8–6,0 im Revier, `_kreaturBestand`): der Lebenszyklus
    // nimmt am Hunger das Älteste jeder Gattung über ihrer Kapazität, die Puppe ist die Jüngste. Bis leib-k1-hieb würfelte der
    // Fauna-Strom die Seele — dort trägt der Bär K 0,14–0,39, Fuchs und Wolf ohne Beute K 0 —, die Puppe fiel mitten in der
    // Reihe, und jeder Klick danach griff durch ihren Leichnam (Radeon 206b395a und 4a5f5e2c: ego/hieb ab Probe 5–24 Halt 0,
    // „abbau“ statt „hieb“, zwei ohne Bewegung).
    L.tierStellen = async () => {
        const f = r._blickVorn(st.yaw, 0), d = 0.5 * r._kampfBladeReach() + 0.5, x = L.start.x + f.x * d, z = L.start.z + f.z * d;
        if (!L.tier) r.equipHeld("klinge_langschwert"); // die Faust reicht in 3rd nicht bis zur Haut unter dem Fadenkreuz
        const c = (L.tier = L.tier || r.spawnCreatureAt(x, L.start.y, z, "happy", "wesen"));
        for (let i = 0; i < 240 && !r._leibMitte(c); i++) await wache();
        c.position.set(x, r._voxelSurfaceY(x, z) + c.position.y - r._voxelSurfaceY(c.position.x, c.position.z), z);
        c.userData.hp = 1e9; // die Puppe fällt nie: jeder Hieb trifft ein lebendes Tier
        st.player.stamina = st.player.staminaMax || 100;
        for (let i = 0, um = (a) => Math.atan2(Math.sin(a), Math.cos(a)); i < 30; i++, await wache()) {
            const F = r._fadenkreuzStrahl(), v = r._leibMitte(c).sub(F.o).normalize();
            if (v.distanceTo(F.d) < 0.03) return true;
            st.yaw += 0.6 * um(Math.atan2(v.x, v.z) - Math.atan2(F.d.x, F.d.z));
            st.pitch += 0.6 * (Math.asin(v.y) - Math.asin(F.d.y));
        }
    };
    // der GT des Einsteigens quer neben dem Start in der Reichweite des Gesetzes, gezeichnet — sonst mäße die Probe nur den Leib
    L.wagenStellen = async () => {
        const f = r._blickVorn(st.yaw, 0), d = 0.85 * r.constructor.MOUNT_RANGE_M, x = L.start.x + f.z * d, z = L.start.z - f.x * d;
        L.wagen = L.wagen || r.spawnArchitecture("fahrzeug_gt", { x, y: r.getTerrainHeightAt(x, z) + 0.5, z }, { silent: true, precise: true, rotationY: st.yaw });
        for (let i = 0; i < 1800 && !r._archIsRendered(L.wagen); i++, await wache()) if (i % 12 === 0) r._rebuildArchitectureMesh(L.wagen);
        if (!r._archIsRendered(L.wagen)) throw new Error("latenz einsteigen: der GT ist nicht gezeichnet");
    };
    L.ende = () => {
        for (const [ziel, e] of L.offen.splice(0)) ziel.dispatchEvent(e); // keine Taste bleibt im Verzug hängen
        GPUCanvasContext.prototype.getCurrentTexture = gct;
        for (const typ of ["keydown", "keyup", "mousedown"]) window.removeEventListener(typ, hoer, true);
        for (const typ of ["keydown", "mousedown"]) window.removeEventListener(typ, nach);
        if (L.tier) r.removeCreature(L.tier);
        if (st.player.mountedArch != null) r.dismountArchitecture();
        if (L.wagen) r.removeArchitecture(L.wagen);
        rend.setAnimationLoop(null);
        st.playerMesh.position.copy(L.start);
        r.setCameraMode(L.sicht);
        const d = L.bilder.slice(1).map((t, i) => t - L.bilder[i]).sort((a, b) => a - b);
        return d[d.length >> 1];
    };
}

// DAS URTEIL DER LATENZ (`werkbank latenz`; die Seite ist latenzAn oben)
// Das Urteil der Latenz je Sicht × Verb: p50/p95 (Rang), die Zerlegung im Median, ROT über `soll` ms oder bei einer Probe
// ohne Bewegung — beim Namen der größten Stufe (eingabe · hoerer · kette bis 1 mm · kurve 1 mm → 1 cm) und der Takte bis zur Bewegung;
// der Hieb auch bei einem anderen Verb oder einem Hit-Stop unter 2 Bildern (im Median, ein Hieb ohne Treffer hält 0).
// Jede gemessene Probe trägt die Pflicht-Größen, sonst ROT beim Namen (bis latenz-verben brach jede Tasten-Reihe an imHoerer).
const PFLICHT = ["eingabe", "imHoerer", "regung", "takte"];
function latenzUrteil(proben, bildMs, soll = 50) {
    const rang = (v, q) => ((v = v.filter(Number.isFinite).sort((a, b) => a - b)).length ? +v[Math.min(v.length - 1, Math.ceil(q * v.length) - 1)].toFixed(1) : null);
    const reihen = {}, rot = [];
    for (const [name, ps] of Object.entries(proben)) {
        const ok = ps.filter((p) => p.ms != null), med = (f) => rang(ok.map((p) => p[f]), 0.5);
        const ohne = PFLICHT.filter((g) => ok.some((p) => !Number.isFinite(p[g])));
        if (ohne.length) rot.push(`${name} ohne ${ohne.join(", ")}`);
        for (const p of ok) (p.kette = p.regung - p.eingabe), (p.kurve = p.ms - p.regung);
        const z = { eingabe: med("eingabe"), hoerer: med("imHoerer"), kette: med("kette"), kurve: med("kurve") };
        const ms = ok.map((p) => p.ms), e = (reihen[name] = { n: ok.length, fehlt: ps.length - ok.length, p50: rang(ms, 0.5), p95: rang(ms, 0.95), max: rang(ms, 1) });
        Object.assign(e, z, { takte: med("takte") });
        if (name.endsWith("hieb")) {
            const verben = ps.map((p) => p.verb || "kein").join(), halt = (e.halt = rang(ps.map((p) => p.halt || 0), 0.5));
            if (/[^,]/.test(verben.replace(/hieb/g, "")) || !(halt >= 2)) rot.push(`${name} Verben ${verben}, Hit-Stop ${halt} Bilder`);
        }
        if (e.fehlt || !(e.p95 <= soll)) {
            const taeter = Object.keys(z).sort((a, b) => z[b] - z[a])[0];
            rot.push(`${name} p95 ${e.p95} ms > ${soll} (fehlt ${e.fehlt}) — Täter ${taeter} ${z[taeter]} ms, ${e.takte} Takte`);
        }
    }
    return { urteil: rot.length ? "ROT" : "GRÜN", soll, bildMs: bildMs && +bildMs.toFixed(2), reihen, rot, proben };
}
// der Selbsttest (ohne Welt, check:statik): gesund GRÜN, sonst ROT beim Namen, ohne zu brechen
function latenzSelbsttest() {
    const reihe = (o) => Array.from({ length: 20 }, (_, i) => Object.assign({ eingabe: 0.3, imHoerer: 1, regung: 9, ms: 20 + i, takte: 2, verb: "hieb", halt: 9 }, o));
    return [
        [{ "ego/gehen": reihe(), "ego/hieb": reihe() }, /^$/],
        [{ "ego/wechsel": reihe({ imHoerer: undefined }) }, /ego\/wechsel ohne imHoerer/],
        [{ "ego/springen": reihe({ ms: 80 }) }, /p95 80 ms > 50 .*Täter kurve/],
        [{ "ego/hieb": reihe({ halt: 0 }) }, /Hit-Stop 0/],
        [{ "ego/gehen": [{}, {}] }, /fehlt 2/],
    ].flatMap(([p, m]) => {
        try {
            const r = latenzUrteil(p, 8).rot.join(" · ");
            return m.test(r) ? [] : [`${Object.keys(p)}: ${r || "GRÜN"}`];
        } catch (e) {
            return [`${Object.keys(p)} bricht: ${e.message}`];
        }
    });
}

module.exports = {
    ANKUNFT_HALT_MS,
    ankunftsHalter,
    ankunftsHalterTafel,
    latenzAn,
    latenzUrteil,
    latenzSelbsttest,
    linseWerten,
    spurProfil,
    selbsttest,
    HAENGER_INSTALL:
        `window.__haengerAn = ${haengerAn.toString()};` +
        `window.__haengerProbe = ${__haengerProbe.toString()};`,
};
