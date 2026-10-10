// diag-verdeckungs-abfrage.cjs — DIE LINSE DER VERDECKUNGS-ABFRAGE (npm run gate:verdeckungs-abfrage; 0910-3 A).
//
// Befund (Leben-Schau 2, Radeon, Spur B, beim Aussteigen am Bachufer): „No occlusion queries are active" in
// EndOcclusionQuery (renderContext_4/_6), danach 4× „Invalid CommandBuffer … invalid due to a previous error", 1× THREE
// „No occlusion queries are active" (r184s Fehler-Bereich um einen asynchronen Pipeline-Bau hatte den Fehler geschluckt und
// DIESE Pipeline für immer als gescheitert markiert) und 3× PAGEERROR „Invalid value used in weak set".
// Wurzel: r184 hält die offene Occlusion-Query nur indirekt (`lastOcclusionObject`, träges Ende beim nächsten Draw) und
// nimmt an, JEDES gezählte Objekt (`occlusionQueryCount`, die Render-Liste) beginne in einem durchgehenden Pass:
//   - ein Stellvertreter des Berg-Culls (`_bundleQueryTick`), dessen Pipeline noch nicht steht, wird gezählt, aber nicht
//     gezeichnet (die Erst-Zeichnung wartet oder verschiebt ihn) → `finishRender` schließt eine Query, die nie begann,
//     und `resolveOccludedAsync` legt die Lücke (`undefined`) ins WeakSet;
//   - bricht der Pass zwischen Beginn und trägem Ende (`copyFramebufferToTexture`: das Tiefen-Abbild für den ersten Leser
//     der Szenen-Tiefe), endet der alte Pass mit offener Query;
//   - ist ein Stellvertreter der LETZTE Draw eines Probe-Frames, erbt der nächste Frame (Zähler 0 — r184s `beginRender` setzt
//     `lastOcclusionObject` nur bei Zähler > 0 zurück) die offene Query und schließt sie in einem Pass ohne Abfrage-Satz
//     (Gegenprüfung 10.10., Radeon, Bündel seitlich: 176 Meldungen in 45 s am Kopf 1457bfa9, 382 an main).
// Der Schnitt: der EINE Block „Verdeckungs-Abfrage" in `_configureRenderer` (be.__anazhVerdeckung).
//
// Die Linse (echter Frame, WebGPU auf swiftshader, holz=kienspan), am Bach der Mess-Wiese:
//   A  DER ABLAUF: ein Region-Bündel jenseits des Bachs (`_archRegionBundleFor`: der Berg-Cull baut seinen Stellvertreter
//      und fragt in jedem `queryTakt`-ten Frame — das Gesetz ist eingefroren, die Linse stellt es nicht um), der GT am
//      Ufer, Aufsitzen aus der Ego-Sicht, Fahrt zum Wasser, Bremsen, AUSSTEIGEN (die Seele wechselt zurück in den Körper,
//      die Sicht zurück auf `first`), zwei Probe-Fenster lang Blick übers Wasser — alles durch den echten
//      Spiel-Takt (`_gameLoopTick`). Nicht vakuös: aufgesessen und ausgestiegen, die Sicht wechselte, der Stellvertreter
//      wurde gezählt, das Wasser gezeichnet.
//   B  DER BRUCH: ein vorgebauter Stellvertreter, direkt danach ein Leser der Szenen-Tiefe (`_szeneTiefe`) — der Pass bricht
//      bei offener Abfrage (gezählt: Brüche mit offener Abfrage > 0).
//   G  DAS GIFT: ein Stellvertreter, dessen Pipeline r184 als gescheitert führt (wie nach einem geschluckten fremden Fehler)
//      — gezählt, nie begonnen.
//   L  DER LETZTE: ein Stellvertreter als letzter Draw (durchsichtig, renderOrder 1e6), im Wechsel sichtbar und unsichtbar —
//      jeder unsichtbare Frame hat Zähler 0 und folgt einem Frame, der mit dem Stellvertreter endete (nicht vakuös: Frames,
//      die mit ihm endeten, und Null-Frames danach > 0).
//   In jeder Phase ROT bei jedem WebGPU-Validierungsfehler beim Namen: `uncapturederror`, die GPU-Wache des Stamms (auch die
//   von r184s Fehler-Bereichen geschluckten, als THREE-Zeile gemeldeten) und jeder Seitenfehler.
//   S  SELBSTTEST AM ECHTEN FRAME (zuletzt): B, G und L mit den Vendor-Methoden (die drei Hüllen abgenommen) müssen ROT
//      werden — B mit „ended with incomplete occlusion query", G mit „No occlusion queries are active" und „weak set", L mit
//      einer Meldung beim Namen.
//   Eine Welt, ein Boot: die Stoffe der Stationen bauen, während der Ablauf fährt; gezählt wird in gerenderten Frames (die
//   GPU-Leine), nie in Wanduhr-Wartezeiten (CI-Soll ≤ 3 min).
//   --selftest (Node): das Urteil nennt jeden Täter und jede vakuöse Phase beim Namen.
//
//   node scripts/diag-verdeckungs-abfrage.cjs [--selftest]
"use strict";

const PHASEN = ["boot", "ablauf", "bruch", "gift", "letzter"];

// Das Urteil: aus dem Befund je Phase die Verletzungen (leer = GRÜN).
function urteil(out) {
    const v = [];
    if (out.abbruch) v.push(`ABBRUCH: ${out.abbruch}`);
    const P = out.phasen || {};
    for (const ph of PHASEN) {
        const p = P[ph];
        if (!p) {
            if (!out.abbruch) v.push(`${ph.toUpperCase()}: Phase fehlt`);
            continue;
        }
        for (const [msg, n] of Object.entries(p.gpu || {})) v.push(`${ph.toUpperCase()} GPU-VALIDIERUNG ${n}×: ${msg}`);
        for (const [msg, n] of Object.entries(p.wache || {})) v.push(`${ph.toUpperCase()} GPU-WACHE ${n}×: ${msg}`);
        for (const [msg, n] of Object.entries(p.seite || {})) v.push(`${ph.toUpperCase()} SEITENFEHLER ${n}×: ${msg}`);
    }
    const A = P.ablauf;
    if (A && A.z) {
        if (!A.aufgesessen) v.push("ABLAUF VAKUÖS: nicht aufgesessen");
        if (!A.ausgestiegen) v.push("ABLAUF VAKUÖS: nicht ausgestiegen");
        if (!(A.sicht && A.sicht.vorher !== A.sicht.nachher)) v.push(`ABLAUF VAKUÖS: die Sicht wechselte nicht (${JSON.stringify(A.sicht)})`);
        if (!(A.z.gezaehlt > 0)) v.push("ABLAUF VAKUÖS: kein Stellvertreter gezählt (der Berg-Cull fragte nie)");
        if (!(A.z.wasser > 0)) v.push("ABLAUF VAKUÖS: kein Wasser gezeichnet");
    }
    const B = P.bruch;
    if (B && B.z) {
        if (!(B.z.bruchOffen > 0)) v.push("BRUCH VAKUÖS: kein Pass-Bruch bei offener Abfrage");
        if (!(B.z.begonnen > 0)) v.push("BRUCH VAKUÖS: keine Abfrage begann");
    }
    const G = P.gift;
    if (G && G.z) {
        if (!(G.z.gift > 0)) v.push("GIFT VAKUÖS: der Stellvertreter zeichnete nie mit gescheiterter Pipeline");
        if (!(G.z.gezaehlt > G.z.begonnen)) v.push(`GIFT VAKUÖS: gezählt ${G.z.gezaehlt}, begonnen ${G.z.begonnen}`);
    }
    const L = P.letzter;
    if (L && L.z) {
        if (!(L.z.letzter > 0)) v.push("LETZTER VAKUÖS: kein Frame endete mit dem Stellvertreter");
        if (!(L.z.nullFrames > 0)) v.push("LETZTER VAKUÖS: kein Frame mit Zähler 0 folgte");
    }
    // der Selbsttest am echten Frame: ohne die Hüllen fallen die Täter beim Namen
    const S = out.selbst;
    if (S) {
        const hat = (p, re) => !!p && [p.gpu, p.wache, p.seite].some((m) => Object.keys(m || {}).some((k) => re.test(k)));
        if (!hat(S.bruch, /ended with incomplete occlusion query/))
            v.push("SELBSTTEST VAKUÖS: der Bruch ohne Hülle nennt „ended with incomplete occlusion query“ nicht");
        if (!hat(S.gift, /No occlusion queries are active/))
            v.push("SELBSTTEST VAKUÖS: das Gift ohne Hülle nennt „No occlusion queries are active“ nicht");
        if (!hat(S.gift, /weak set/)) v.push("SELBSTTEST VAKUÖS: das Gift ohne Hülle nennt „Invalid value used in weak set“ nicht");
        if (!S.letzter || ![S.letzter.gpu, S.letzter.wache].some((m) => Object.keys(m || {}).length > 0))
            v.push("SELBSTTEST VAKUÖS: der Letzte ohne Hülle nennt keine Meldung");
    } else if (!out.abbruch) v.push("SELBSTTEST fehlt");
    return v;
}

function selbsttest() {
    const sauber = () => ({
        phasen: {
            boot: { gpu: {}, wache: {}, seite: {} },
            ablauf: {
                gpu: {},
                wache: {},
                seite: {},
                aufgesessen: true,
                ausgestiegen: true,
                sicht: { vorher: "third", nachher: "first" },
                z: { gezaehlt: 9, wasser: 40 },
            },
            bruch: { gpu: {}, wache: {}, seite: {}, z: { bruchOffen: 20, begonnen: 20 } },
            gift: { gpu: {}, wache: {}, seite: {}, z: { gift: 18, gezaehlt: 20, begonnen: 0 } },
            letzter: { gpu: {}, wache: {}, seite: {}, z: { letzter: 4, nullFrames: 4, begonnen: 4 } },
        },
        selbst: {
            bruch: { gpu: { "Render pass [RenderPassEncoder (unlabeled)] ended with incomplete occlusion query index 0": 20 } },
            gift: { gpu: { "No occlusion queries are active.": 20 }, seite: { "Invalid value used in weak set": 20 } },
            letzter: { gpu: { "No occlusion queries are active.": 4 } },
        },
    });
    const faelle = [
        ["sauber", (o) => o, null],
        [
            "Ablauf: No occlusion queries",
            (o) => (o.phasen.ablauf.gpu["No occlusion queries are active."] = 5),
            /ABLAUF GPU-VALIDIERUNG 5×: No occlusion queries are active/,
        ],
        [
            "Ablauf: ungültiger Befehlspuffer",
            (o) => (o.phasen.ablauf.gpu['[Invalid CommandBuffer from CommandEncoder "renderContext_6"] is invalid'] = 4),
            /ABLAUF GPU-VALIDIERUNG 4×: \[Invalid CommandBuffer .*renderContext_6/,
        ],
        [
            "Ablauf: geschluckt (GPU-Wache three)",
            (o) => (o.phasen.ablauf.wache["three: No occlusion queries are active."] = 1),
            /ABLAUF GPU-WACHE 1×: three: No occlusion/,
        ],
        [
            "Ablauf: weak set",
            (o) => (o.phasen.ablauf.seite["Invalid value used in weak set"] = 3),
            /ABLAUF SEITENFEHLER 3×: Invalid value used in weak set/,
        ],
        ["Boot: ein Fehler", (o) => (o.phasen.boot.gpu["Destroyed texture"] = 1), /BOOT GPU-VALIDIERUNG 1×: Destroyed texture/],
        [
            "Bruch: incomplete",
            (o) => (o.phasen.bruch.gpu["Render pass ended with incomplete occlusion query index 0"] = 20),
            /BRUCH GPU-VALIDIERUNG 20×: Render pass ended with incomplete occlusion query/,
        ],
        ["Ablauf: nicht ausgestiegen", (o) => (o.phasen.ablauf.ausgestiegen = false), /ABLAUF VAKUÖS: nicht ausgestiegen/],
        ["Ablauf: Sicht blieb", (o) => (o.phasen.ablauf.sicht.nachher = "third"), /ABLAUF VAKUÖS: die Sicht wechselte nicht/],
        ["Ablauf: nie gezählt", (o) => (o.phasen.ablauf.z.gezaehlt = 0), /ABLAUF VAKUÖS: kein Stellvertreter gezählt/],
        ["Ablauf: kein Wasser", (o) => (o.phasen.ablauf.z.wasser = 0), /ABLAUF VAKUÖS: kein Wasser/],
        ["Bruch: nie offen", (o) => (o.phasen.bruch.z.bruchOffen = 0), /BRUCH VAKUÖS: kein Pass-Bruch bei offener Abfrage/],
        ["Gift: nie gezeichnet", (o) => (o.phasen.gift.z.gift = 0), /GIFT VAKUÖS: der Stellvertreter zeichnete nie/],
        ["Gift: alle begonnen", (o) => (o.phasen.gift.z.begonnen = 20), /GIFT VAKUÖS: gezählt 20, begonnen 20/],
        ["Phase fehlt", (o) => delete o.phasen.gift, /GIFT: Phase fehlt/],
        [
            "Letzter: der vierte Weg",
            (o) => (o.phasen.letzter.gpu["No occlusion queries are active."] = 4),
            /LETZTER GPU-VALIDIERUNG 4×: No occlusion queries are active/,
        ],
        ["Letzter: nie letzter", (o) => (o.phasen.letzter.z.letzter = 0), /LETZTER VAKUÖS: kein Frame endete/],
        ["Letzter: kein Null-Frame", (o) => (o.phasen.letzter.z.nullFrames = 0), /LETZTER VAKUÖS: kein Frame mit Zähler 0/],
        ["Selbsttest Letzter blind", (o) => (o.selbst.letzter.gpu = {}), /SELBSTTEST VAKUÖS: der Letzte ohne Hülle/],
        ["Selbsttest Bruch blind", (o) => (o.selbst.bruch.gpu = {}), /SELBSTTEST VAKUÖS: der Bruch ohne Hülle/],
        ["Selbsttest Gift ohne weak set", (o) => (o.selbst.gift.seite = {}), /SELBSTTEST VAKUÖS: .*weak set/],
        ["Selbsttest fehlt", (o) => delete o.selbst, /SELBSTTEST fehlt/],
        ["Abbruch", (o) => (o.abbruch = "Renderer stand nicht"), /ABBRUCH: Renderer stand nicht/],
    ];
    let rot = 0;
    for (const [name, mut, soll] of faelle) {
        const o = sauber();
        mut(o);
        const v = urteil(o);
        const ok = soll === null ? v.length === 0 : v.some((x) => soll.test(x));
        if (!ok) rot++;
        console.log(`${ok ? "✅" : "❌"} ${name}${ok ? "" : " — Urteil: " + JSON.stringify(v)}`);
    }
    if (rot) {
        console.log(`\n❌ SELBSTTEST ROT — ${rot} Fall/Fälle vakuös`);
        process.exit(1);
    }
    console.log(`\n✅ SELBSTTEST GRÜN — ${faelle.length} Fälle: jeder Täter und jede vakuöse Phase beim Namen`);
    process.exit(0);
}

if (process.argv.includes("--selftest")) selbsttest();

const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
const { ladeSpec } = require("./lib/band-urteil.cjs");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.VERDECKUNG_PORT) || 4613;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
    ".wasm": "application/wasm",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

// Vor jedem Seiten-Skript: die Fehler je Phase (Device-Meldung und Seitenfehler; die Phase setzt die Linse).
function sammlerInstall() {
    const S = (window.__verdeckung = { phase: "boot", gpu: {}, seite: {} });
    const buche = (art, msg) => {
        const p = S[art][S.phase] || (S[art][S.phase] = {});
        const k = String(msg).split("\n")[0].slice(0, 160);
        p[k] = (p[k] || 0) + 1;
    };
    S.buche = buche;
    if (typeof GPUAdapter !== "undefined") {
        const rd = GPUAdapter.prototype.requestDevice;
        GPUAdapter.prototype.requestDevice = async function (d) {
            const dev = await rd.call(this, d);
            try {
                dev.addEventListener("uncapturederror", (ev) => buche("gpu", (ev.error && ev.error.message) || ev.error));
            } catch (_e) {}
            return dev;
        };
    }
    window.addEventListener("error", (e) => buche("seite", (e.error && e.error.message) || e.message));
    window.addEventListener("unhandledrejection", (e) => buche("seite", (e.reason && e.reason.message) || e.reason));
}

// Seite: die Stoffe der drei Stationen — je einer mit eigenem Programm (eine Konstante im Shader: das Gift markiert SEINE
// Pipeline), unsichtbar (ohne Farbe, ohne Tiefe) und ohne Abfrage in die Szene gehängt, damit ihre Pipelines bauen, während
// der Ablauf fährt. B und G opak am Anfang der Liste, L durchsichtig am Ende.
function stationenVorbau() {
    const r = window.anazhRealm;
    const T = window.THREE;
    const st = r.state;
    const stoff = (k, durchsichtig) => {
        const m = new T.MeshBasicNodeMaterial({ transparent: durchsichtig });
        m.colorNode = T.TSL.vec4(T.TSL.float(k), 0, 0, 1);
        m.colorWrite = false;
        m.depthWrite = false;
        return m;
    };
    const kasten = (name, m, ordnung) => {
        const q = new T.Mesh(new T.BoxGeometry(0.5, 0.5, 0.5), m);
        q.name = name;
        q.frustumCulled = false;
        q.renderOrder = ordnung;
        st.scene.add(q);
        return q;
    };
    const lm = new T.MeshBasicNodeMaterial();
    lm.colorNode = T.TSL.vec4(T.TSL.vec3(r._szeneTiefe()), 1);
    const leser = new T.Mesh(new T.PlaneGeometry(0.4, 0.4), lm);
    leser.name = "verdeckung:tiefen-leser";
    leser.frustumCulled = false;
    leser.renderOrder = -1e6 + 1;
    leser.visible = false; // erst die Station B stellt ihn (sein Abbild bräche jeden Frame des Ablaufs)
    st.scene.add(leser);
    window.__stationen = {
        bruch: kasten("verdeckung:stellvertreter-b", stoff(0.0021, false), -1e6),
        gift: kasten("verdeckung:stellvertreter-g", stoff(0.0043, false), -1e6),
        letzter: kasten("verdeckung:stellvertreter-l", stoff(0.0067, true), 1e6),
        leser,
    };
    return Object.keys(window.__stationen).length;
}

// Seite: die Phasen der Linse. `opts.phase` = ablauf | bruch | gift | letzter, `opts.roh` = die drei Hüllen abnehmen.
async function verdeckungPhase(opts) {
    const r = window.anazhRealm;
    const T = window.THREE;
    const st = r.state;
    const rend = st.renderer;
    const be = rend.backend;
    const S = window.__verdeckung;
    const W = r._gpuWache || (r._gpuWache = { n: 0, meldungen: [] });
    const wacheVor = W.n;
    const kopfVor = new Set(W.meldungen.map((m) => m.kopf));
    const marke = (opts.roh ? "roh:" : "") + opts.phase;
    S.phase = marke;
    const eigen = {};
    if (opts.roh)
        for (const k of ["copyFramebufferToTexture", "finishRender", "resolveOccludedAsync"])
            if (Object.prototype.hasOwnProperty.call(be, k)) {
                eigen[k] = be[k];
                delete be[k];
            }
    // die Zähler: begonnene Abfragen, Pass-Brüche (bei offener Abfrage), gezählte Objekte, Wasser-, Gift-Draws, Frames, die
    // mit dem Stellvertreter L endeten, und Null-Frames danach
    const z = { begonnen: 0, bruch: 0, bruchOffen: 0, gezaehlt: 0, wasser: 0, gift: 0, letzter: 0, nullFrames: 0, renders: 0 };
    const RP = GPURenderPassEncoder.prototype;
    const bQ = RP.beginOcclusionQuery;
    RP.beginOcclusionQuery = function (i) {
        z.begonnen++;
        return bQ.call(this, i);
    };
    const bruchVor = be.copyFramebufferToTexture;
    be.copyFramebufferToTexture = function (t, k, rr) {
        z.bruch++;
        const d = this.get(k);
        const o = d && d.lastOcclusionObject;
        if (o && o.occlusionTest === true) z.bruchOffen++;
        return bruchVor.call(this, t, k, rr);
    };
    const stn = window.__stationen;
    let warLetzter = false;
    const anfangVor = be.beginRender;
    be.beginRender = function (k) {
        z.renders++;
        if (k.occlusionQueryCount > 0) z.gezaehlt += k.occlusionQueryCount;
        else if (warLetzter && k.camera === st.camera) z.nullFrames++;
        return anfangVor.call(this, k);
    };
    const schlussVor = be.finishRender;
    be.finishRender = function (k) {
        if (k.camera === st.camera) {
            const d = this.get(k);
            warLetzter = !!(stn && d && d.lastOcclusionObject === stn.letzter && stn.letzter.occlusionTest === true);
            if (warLetzter) z.letzter++;
        }
        return schlussVor.call(this, k);
    };
    let giftObjekt = null;
    const giftMarken = new Set(); // die markierten Pipelines — nach der Phase nimmt die Linse die Marke zurück
    const drawVor = be.draw;
    be.draw = function (ro, info) {
        if (ro.material === st.hydroSurfaceMaterial) z.wasser++;
        if (giftObjekt !== null && ro.object === giftObjekt) {
            const pd = this.get(ro.pipeline);
            if (pd.error !== true) giftMarken.add(pd);
            pd.error = true; // r184s Marke einer gescheiterten Pipeline (6:590415)
            z.gift++;
        }
        return drawVor.call(this, ro, info);
    };
    const warte = (ms) => new Promise((q) => setTimeout(q, ms));
    // der Szenen-Pass rendert einmal je NODE-FRAME, den sonst die Animations-Schleife weiterschaltet (wie die Ausgabe-Aufnahme)
    const nf = rend._nodes && rend._nodes.nodeFrame;
    // DIE GPU-LEINE (`_gpuLeineFrei`) setzt den Render aus, solange GPU_FRAMES_IM_FLUG Frames unterwegs sind — auf
    // swiftshader fast jeden Takt: gemessene Takte warten, bis die GPU die Arbeit abgab
    const frei = async () => {
        try {
            await be.device.queue.onSubmittedWorkDone();
        } catch (_e) {}
        await warte(0);
    };
    const render = async (n, vor) => {
        for (let i = 0; i < n; i++) {
            if (vor) vor(i);
            if (nf) nf.update();
            r._loopRender(performance.now());
            await frei();
        }
    };
    const aus = { phase: marke };
    const aufraeumen = [];
    try {
        if (opts.phase === "ablauf") {
            const hh = (x, zz) => r.getTerrainHeightAt(x, zz);
            const nass = (x, zz) => {
                const ws = r._atlasWaterLevelAt(x, zz, hh(x, zz));
                return Number.isFinite(ws) && ws > hh(x, zz) - 0.3;
            };
            // der Bach der Mess-Wiese: der nächste Fluss-Punkt zum Messort
            const [mx, mz] = opts.messort;
            r._ensureHydroTilesAround(mx, mz, 200);
            const h = r._hydroFor(mx, mz);
            let P = null,
                fl = null,
                pi = -1;
            for (const f of (h && h.rivers) || [])
                f.points.forEach((q, i) => {
                    const d = Math.hypot(q.x - mx, q.z - mz);
                    if (!P || d < P.d) {
                        P = { x: q.x, z: q.z, d };
                        fl = f;
                        pi = i;
                    }
                });
            if (!P || P.d > 300) throw new Error(`kein Bach an der Mess-Wiese (${P ? Math.round(P.d) + " m" : "keine Hydrosphäre"})`);
            const a = fl.points[Math.max(0, pi - 1)],
                b = fl.points[Math.min(fl.points.length - 1, pi + 1)];
            const L = Math.hypot(b.x - a.x, b.z - a.z) || 1;
            let nx = -(b.z - a.z) / L,
                nz = (b.x - a.x) / L;
            if (nx * (mx - P.x) + nz * (mz - P.z) < 0) {
                nx = -nx;
                nz = -nz;
            }
            let s = 4;
            while (s < 30 && nass(P.x + nx * s, P.z + nz * s)) s++;
            const ux = P.x + nx * (s + 10),
                uz = P.z + nz * (s + 10);
            aus.bach = { x: Math.round(P.x), z: Math.round(P.z), ufer: s, start: [Math.round(ux), Math.round(uz)] };
            // ein Region-Bündel jenseits des Bachs: der Berg-Cull baut seinen Stellvertreter (Probe jeden queryTakt-ten Frame)
            const KL = r.constructor;
            const R = KL.ARCH_REGION_M;
            const fx = P.x - nx * 700,
                fz = P.z - nz * 700;
            const key = Math.floor(fx / R) + "," + Math.floor(fz / R);
            const neu = !(st._regionBundles && st._regionBundles.has(key));
            const bg = r._archRegionBundleFor(key);
            if (!bg) throw new Error("kein Region-Bündel (`_archRegionBundleFor` lieferte null)");
            aufraeumen.push(() => {
                if (bg.userData._occlProxy) r._bundleQueryProxyTod(bg);
                if (neu) {
                    st.scene.remove(bg);
                    st._regionBundles.delete(key);
                }
            });
            aus.takt = KL.BERG_CULL.queryTakt;
            // der Ort steht: der Spieler am Ufer, die Welt zieht nach (Chunks, Wasser) — Takte ohne Warten (die Leine setzt
            // den Render aus, das Streamen läuft)
            st.playerMesh.position.set(ux, hh(ux, uz) + 1.2, uz);
            if (st.playerVel) st.playerVel.setValue(0, 0, 0);
            r.setCameraMode("first");
            let tMs = performance.now();
            const takt = () => {
                tMs += 16.7;
                if (nf) nf.update();
                r._gameLoopTick(tMs);
            };
            const tick = async (n) => {
                for (let i = 0; i < n; i++) {
                    takt();
                    await frei();
                }
            };
            const sichtbaresWasser = () => {
                let n = 0;
                st.scene.traverse((o) => {
                    if (o.isMesh && o.visible && o.material === st.hydroSurfaceMaterial) n++;
                });
                return n;
            };
            const f = r._ensureAssetFoundry();
            const bereit = () => f && f.ready && f.recipes && f.recipes.gt && st.blueprints && st.blueprints.fahrzeug_gt;
            const tOrt = performance.now();
            const dlW = performance.now() + (opts.ortMs || 180000);
            while (performance.now() < dlW && !(sichtbaresWasser() > 0 && bereit())) {
                for (let i = 0; i < 5; i++) takt();
                await warte(20);
            }
            aus.wasserMeshes = sichtbaresWasser();
            aus.ms = { ort: Math.round(performance.now() - tOrt) };
            const tWagen = performance.now();
            if (!bereit()) throw new Error("das Rezept des GT stand nicht");
            // der GT am Ufer, Blick zum Wasser
            const fahrt = Math.atan2(-nx, -nz);
            const e = r.spawnArchitecture(
                "fahrzeug_gt",
                { x: ux, y: hh(ux, uz) + 0.5, z: uz },
                { silent: true, precise: true, rotationY: fahrt - Math.PI / 2 }
            );
            if (!e) throw new Error("der GT ließ sich nicht setzen");
            aufraeumen.push(() => {
                if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
                r.removeArchitecture(e);
            });
            const dlB = performance.now() + (opts.wagenMs || 90000);
            while (!e.instanced && !e.mesh && performance.now() < dlB) {
                r._rebuildArchitectureMesh(e);
                if (e.instanced || e.mesh) break;
                takt();
                await warte(50);
            }
            const tasten = (w, sb) => {
                for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false;
                st.keys.w = !!w;
                st.keys.s = !!sb;
            };
            aus.ms.wagen = Math.round(performance.now() - tWagen);
            const tTakte = performance.now();
            const auf = r.mountArchitecture(e);
            aus.aufgesessen = !!(auf && auf.ok);
            await tick(2);
            const sichtVorher = st.cameraMode;
            tasten(true);
            await tick(4);
            tasten(false, true);
            await tick(3);
            tasten(false);
            aus.halt = Math.round(Math.hypot(e.position.x - P.x, e.position.z - P.z) * 10) / 10;
            // DAS AUSSTEIGEN: die Seele zurück in den Körper, die Sicht zurück
            const ab = r.dismountArchitecture();
            aus.ausgestiegen = !!(ab && ab.ok);
            st.yaw = fahrt;
            await tick(2 * aus.takt); // zwei Probe-Fenster nach dem Aussteigen
            aus.sicht = { vorher: sichtVorher, nachher: st.cameraMode };
            aus.ms.takte = Math.round(performance.now() - tTakte);
            aus.stellvertreter = !!bg.userData._occlProxy;
        } else {
            // B / G / L: der vorgebaute Stellvertreter der Station vor der Kamera (B mit dem Leser der Szenen-Tiefe danach)
            const cam = st.camera;
            const q = stn[opts.phase];
            const l = opts.phase === "bruch" ? stn.leser : null;
            // je Station zeichnet nur IHR Kasten (die anderen trügen dieselbe Ordnung und schlössen die Abfrage dazwischen)
            for (const k of ["bruch", "gift", "letzter"]) stn[k].visible = false;
            const stelle = () => {
                q.position.copy(new T.Vector3(0, 0, -3).applyQuaternion(cam.quaternion).add(cam.position));
                if (l) {
                    l.position.copy(new T.Vector3(0.6, -0.4, -3.5).applyQuaternion(cam.quaternion).add(cam.position));
                    l.quaternion.copy(cam.quaternion);
                }
            };
            // der Stoff steht, wenn sein Stellvertreter mit gültiger Pipeline zeichnet (sonst baut er hier fertig)
            let gebaut = 0;
            const dv = be.draw;
            be.draw = function (ro, info) {
                if (ro.object === q && this.get(ro.pipeline).error !== true) gebaut++;
                return dv.call(this, ro, info);
            };
            q.visible = true;
            q.occlusionTest = false;
            for (let i = 0; i < 400 && gebaut < 1; i++) {
                await render(1, stelle);
                if (gebaut < 1) await warte(30);
            }
            be.draw = dv;
            aus.vorgebaut = gebaut;
            if (gebaut < 1) throw new Error("der Stoff des Stellvertreters stand nicht");
            for (const k of Object.keys(z)) z[k] = 0;
            if (l) l.visible = true;
            q.occlusionTest = true;
            if (opts.phase === "gift") giftObjekt = q;
            aufraeumen.push(() => {
                q.occlusionTest = false;
                q.visible = false;
                if (l) l.visible = false;
                for (const pd of giftMarken) pd.error = false;
            });
            // L: im Wechsel sichtbar (Zähler 1, der Stellvertreter ist der letzte Draw) und unsichtbar (Zähler 0)
            await render(6, (i) => {
                stelle();
                if (opts.phase === "letzter") q.visible = i % 2 === 0;
            });
        }
    } catch (e) {
        aus.fehler = (e && e.message) || String(e);
    } finally {
        for (const f of aufraeumen.reverse())
            try {
                f();
            } catch (_e) {}
        RP.beginOcclusionQuery = bQ;
        be.copyFramebufferToTexture = bruchVor;
        be.beginRender = anfangVor;
        be.finishRender = schlussVor;
        be.draw = drawVor;
        for (const k in eigen) be[k] = eigen[k];
    }
    // die Nachläufer der Phase (das Auflösen ist asynchron) noch in ihr buchen
    await render(1);
    await warte(200);
    S.phase = "zwischen";
    aus.z = z;
    aus.gpu = S.gpu[marke] || {};
    aus.seite = S.seite[marke] || {};
    aus.wache = {};
    if (W.n > wacheVor)
        for (const m of W.meldungen)
            if (!kopfVor.has(m.kopf)) aus.wache[`${m.quelle}: ${m.kopf}`] = (aus.wache[`${m.quelle}: ${m.kopf}`] || 0) + 1;
    aus.wacheN = W.n - wacheVor;
    return aus;
}

(async () => {
    console.log("=== VERDECKUNGS-ABFRAGE — der Aussteige-Ablauf am Bach (WebGPU auf swiftshader) ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 1200000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 180 });
    await page.evaluateOnNewDocument(sammlerInstall);
    const seitenFehler = [];
    page.on("pageerror", (e) => seitenFehler.push((e.stack || e.message || String(e)).split("\n")[0]));
    const T0 = Date.now();
    const log = (z) => console.log(`  [${Math.round((Date.now() - T0) / 1000)} s] ${z}`);
    const out = { phasen: {} };
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=kienspan`, { waitUntil: "domcontentloaded", timeout: 60000 });
        const bereit = await page.evaluate(async () => {
            const t0 = performance.now();
            while (performance.now() - t0 < 300000) {
                const r = window.anazhRealm;
                const st = r && r.state;
                if (st && st.rendererReady && st.renderer && st.renderer.backend && st.camera && st.playerMesh)
                    return { ok: true, ms: Math.round(performance.now() - t0), webgpu: st.renderer.backend.isWebGPUBackend === true };
                await new Promise((res) => setTimeout(res, 100));
            }
            return { ok: false };
        });
        if (!bereit.ok) throw new Error("der Renderer stand nach 300 s nicht");
        if (!bereit.webgpu) throw new Error("kein WebGPU-Backend — die Linse liest WebGPU-Validierung, sie wäre blind");
        log(`Renderer bereit nach ${Math.round(bereit.ms / 1000)} s`);
        // der Loop gehört der Linse (der echte Spiel-Takt läuft durch `_gameLoopTick`); die Stoffe der Stationen bauen mit
        out.phasen.boot = await page.evaluate(stationenVorbau).then(() =>
            page.evaluate(() => {
                const r = window.anazhRealm;
                r.state.renderer.setAnimationLoop(null);
                const S = window.__verdeckung;
                S.phase = "zwischen";
                const W = r._gpuWache || { n: 0, meldungen: [] };
                const wache = {};
                for (const m of W.meldungen) wache[`${m.quelle}: ${m.kopf}`] = 1;
                return { gpu: S.gpu.boot || {}, seite: S.seite.boot || {}, wache };
            })
        );
        const messort = ladeSpec("wiese").ort.spieler;
        for (const phase of ["ablauf", "bruch", "gift", "letzter"]) {
            const p = await page.evaluate(verdeckungPhase, { phase, messort });
            if (p.fehler) throw new Error(`${phase}: ${p.fehler}`);
            out.phasen[phase] = p;
            const fehler = Object.keys(p.gpu).length + Object.keys(p.wache).length + Object.keys(p.seite).length;
            log(
                `${phase.toUpperCase()}: ${JSON.stringify(p.z)}` +
                    (phase === "ablauf"
                        ? ` · Bach ${JSON.stringify(p.bach)}, Probe jeden ${p.takt}. Frame, Wasser-Meshes ${p.wasserMeshes}, ` +
                          `aufgesessen ${p.aufgesessen}, Halt ${p.halt} m vor dem Bach, ausgestiegen ${p.ausgestiegen}, ` +
                          `Sicht ${JSON.stringify(p.sicht)}, ms ${JSON.stringify(p.ms)}`
                        : ` · vorgebaut ${p.vorgebaut}`) +
                    ` · ${fehler ? fehler + " Täter" : "0 Fehler"}`
            );
        }
        // S: der Selbsttest am echten Frame — die Vendor-Methoden (Hüllen ab), zuletzt (ihre Fehler vergiften Pipelines)
        out.selbst = {};
        for (const phase of ["bruch", "gift", "letzter"]) {
            const p = await page.evaluate(verdeckungPhase, { phase, messort, roh: true });
            out.selbst[phase] = p;
            log(`SELBSTTEST ${phase} ohne Hülle: ${JSON.stringify(p.gpu)} · Seite ${JSON.stringify(p.seite)} · Wache ${p.wacheN}`);
        }
    } catch (e) {
        out.abbruch = (e && e.message) || String(e);
    }
    await browser.close();
    server.close();
    out.seitenFehlerGesamt = seitenFehler.slice(0, 8);
    const v = urteil(out);
    log(v.length ? "ROT" : "GRÜN");
    if (v.length) {
        console.log(`\n❌ ROT — ${v.length} Verletzung(en):`);
        for (const s of v) console.log("   • " + s);
        process.exit(1);
    }
    const A = out.phasen.ablauf;
    const Lz = out.phasen.letzter.z;
    console.log(
        `\n✅ GRÜN — 0 WebGPU-Validierungsfehler und 0 Seitenfehler in Boot, Ablauf, Bruch, Gift und Letzter. Am Bach ` +
            `(${A.bach.x}/${A.bach.z}) aufgesessen, ${A.halt} m vor dem Wasser ausgestiegen (Sicht ${A.sicht.vorher} → ` +
            `${A.sicht.nachher}), der Stellvertreter ${A.z.gezaehlt}× gezählt, ${A.z.begonnen} Abfragen begonnen; Bruch bei ` +
            `offener Abfrage ${out.phasen.bruch.z.bruchOffen}×, Gift ${out.phasen.gift.z.gift}×, ${Lz.letzter} Frames endeten mit ` +
            `dem Stellvertreter, ${Lz.nullFrames} Null-Frames danach; ohne die Hüllen fallen „ended with incomplete occlusion ` +
            `query“, „No occlusion queries are active“, „weak set“ und der Letzte beim Namen.`
    );
})();
