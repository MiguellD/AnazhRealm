// pixel-zensus.cjs — DER PIXEL-ZENSUS (Spike SICHT der EINHEIT, E7): welcher Anteil der gezeichneten Dreiecke des Hauptbilds trägt
// KEINEN Pixel — gezählt am echten Bild, je Dreieck, nie gerechnet.
//
// Die Methode: der Abgriff (`PIXEL_INSTALL`, ab Dokument-Start) merkt je Render-Pipeline ihren Deskriptor und je Shader-Modul seinen
// Text. Der Zensus (`PIXEL_ZENSUS`) nimmt EINEN echten Frame (`_loopRender`) auf WebGPU-Ebene auf — jeder Befehl des Hauptbilds
// (`haupt`, die Benennung des Draw-Zählers), auch der in Bündeln und jeder indirekte Zug (seine Argumente aus dem Auftrags-Puffer
// gelesen) — und spielt danach JEDES Dreieck jeder Instanz als eigenen Draw mit eigener Occlusion-Query ab, mit den Vertex-Shadern
// des Frames (Wind, Instanz, Karte: dieselbe Lage). Die Query zählt die Samples, die bestehen — das ist das ID-Bild je Dreieck.
//   treue      die Befehle des Frames noch einmal in seine Ziele: Farbe gegen das Bild des Frames (Anteil der Pixel > 1/255)
//   ras1       Tiefe aus, Fragment aus, Seite des Stoffs      → R1 (das Dreieck rastert)
//   rasA       Tiefe aus, das Fragment des Stoffs (Alpha)     → R  (überlebt seinen eigenen Ausschnitt)
//   vis        Tiefen-Test gegen die Tiefe des Frames (≤)    → V  (trägt einen Pixel)
//   ras2       Tiefe aus, beide Seiten                        → R2 (rastert nur rückseitig)
//   dicht      wie ras2 in K-facher Dichte                    → D  (UNTER DEM BILDPUNKT: < 1 px, rastert erst feiner)
//   weit       wie ras2, der Schirm K-fach weiter             → W  (AUSSERHALB des Bilds)
// Klassen (disjunkt, Summe = gezeichnet): sichtbar V · verdeckt R−V · alpha-leer R1−R · rückseitig R2−R1 · unter-px D · außerhalb W
// · rest (kein Test traf: winzig unter 1/K² px oder hinter dem Auge). Dazu je Haufen (128 Dreiecke in Index-Folge je Instanz): ein
// Haufen ohne jedes sichtbare Dreieck ist der Hebel eines Haufen-Schnitts.
//
//   Werkbank: node scripts/werkbank.cjs start --echt --pixel …   (der Abgriff ab Dokument-Start)
//   Treiber:  node scripts/diag-pixel-zensus.cjs --orte wiese,genesis --sichten ego,third
"use strict";

// DER ABGRIFF (ab Dokument-Start): Deskriptor je Pipeline, Text je Modul, Textur je Ansicht — die Seite rechnet nichts damit.
function pixelInstall() {
    const D = globalThis.GPUDevice && GPUDevice.prototype;
    if (!D || window.__pixelGpu) return;
    const pipeDesc = new WeakMap(),
        modCode = new WeakMap(),
        viewTex = new WeakMap();
    const urM = D.createShaderModule;
    D.createShaderModule = function (d) {
        const m = urM.call(this, d);
        if (d && typeof d.code === "string") modCode.set(m, d.code);
        return m;
    };
    const urP = D.createRenderPipeline;
    D.createRenderPipeline = function (d) {
        const p = urP.call(this, d);
        pipeDesc.set(p, d);
        return p;
    };
    const urA = D.createRenderPipelineAsync;
    D.createRenderPipelineAsync = function (d) {
        return urA.call(this, d).then((p) => (pipeDesc.set(p, d), p));
    };
    const TP = GPUTexture.prototype,
        urV = TP.createView;
    TP.createView = function (d) {
        const v = urV.call(this, d);
        viewTex.set(v, this);
        return v;
    };
    window.__pixelGpu = { pipeDesc, modCode, viewTex };
}

// DER ZENSUS (Seiten-Kontext, `r` die Welt): k = { K, haufen, bild } → { gesamt, klassen, haufen, treue, … }
function pixelZensus(k) {
    return (async () => {
        const PG = window.__pixelGpu;
        if (!PG) throw new Error("PIXEL-ZENSUS: die Seite trägt den Abgriff nicht (werkbank start --pixel)");
        const rend = st.renderer,
            be = rend.backend,
            dev = be.device,
            q = dev.queue;
        const K = k.K || 4,
            HAUFEN = k.haufen || 128;
        const t0 = performance.now();
        // ── 1) die Aufnahme EINES Frames ──────────────────────────────────────────────────────────────────────────────
        const RP = GPURenderPassEncoder.prototype,
            RB = GPURenderBundleEncoder.prototype,
            CE = GPUCommandEncoder.prototype,
            DV = GPUDevice.prototype;
        const passes = [],
            recOf = new WeakMap(),
            bundleRec = new WeakMap();
        const stapel = [];
        let tag = null;
        const zurueck = [];
        const haken = (obj, name, neu) => {
            const ur = obj[name];
            zurueck.push(() => (obj[name] = ur));
            obj[name] = neu(ur);
        };
        const jetztTag = () => (tag ? { obj: tag.obj, j: tag.n++, zuege: tag.zuege } : null);
        const aufnahme = {
            setPipeline: (R, a) => R.cmds.push({ op: "p", p: a[0] }),
            setBindGroup: (R, a) =>
                R.cmds.push({
                    op: "bg",
                    i: a[0],
                    g: a[1],
                    o: a.length >= 5 ? Array.from(a[2].subarray(a[3], a[3] + a[4])) : a[2] ? Array.from(a[2]) : [],
                }),
            setVertexBuffer: (R, a) => R.cmds.push({ op: "vb", s: a[0], b: a[1], o: a[2] || 0, z: a[3] }),
            setIndexBuffer: (R, a) => R.cmds.push({ op: "ib", b: a[0], f: a[1], o: a[2] || 0, z: a[3] }),
            draw: (R, a) =>
                R.cmds.push({ op: "d", idx: false, n: a[0], inst: a[1] ?? 1, first: a[2] || 0, bv: 0, fi: a[3] || 0, tag: jetztTag() }),
            drawIndexed: (R, a) =>
                R.cmds.push({ op: "d", idx: true, n: a[0], inst: a[1] ?? 1, first: a[2] || 0, bv: a[3] || 0, fi: a[4] || 0, tag: jetztTag() }),
            drawIndirect: (R, a) => R.cmds.push({ op: "i", idx: false, buf: a[0], off: a[1], tag: jetztTag() }),
            drawIndexedIndirect: (R, a) => R.cmds.push({ op: "i", idx: true, buf: a[0], off: a[1], tag: jetztTag() }),
        };
        const nurPass = {
            executeBundles: (R, a) => R.cmds.push({ op: "B", b: Array.from(a[0]) }),
            setViewport: (R, a) => R.cmds.push({ op: "vp", v: Array.from(a).slice(0, 6) }),
            setScissorRect: (R, a) => R.cmds.push({ op: "sc", v: Array.from(a).slice(0, 4) }),
            setStencilReference: (R, a) => R.cmds.push({ op: "sr", v: a[0] }),
            setBlendConstant: (R, a) => R.cmds.push({ op: "bc", v: a[0] }),
        };
        const mitschnitt = (f) => (ur) =>
            function (...a) {
                const R = recOf.get(this);
                if (R) f(R, a);
                return ur.apply(this, a);
            };
        for (const [n, f] of Object.entries(aufnahme)) {
            haken(RP, n, mitschnitt(f));
            haken(RB, n, mitschnitt(f));
        }
        for (const [n, f] of Object.entries(nurPass)) haken(RP, n, mitschnitt(f));
        haken(CE, "beginRenderPass", (ur) =>
            function (d) {
                const name = stapel.length ? stapel[stapel.length - 1] : "?";
                let dd = d;
                const da = d.depthStencilAttachment;
                if (name === "haupt" && da && da.depthStoreOp === "discard")
                    dd = Object.assign({}, d, { depthStencilAttachment: Object.assign({}, da, { depthStoreOp: "store" }) });
                const p = ur.call(this, dd);
                const R = { name, desc: dd, cmds: [] };
                passes.push(R);
                recOf.set(p, R);
                return p;
            }
        );
        haken(DV, "createRenderBundleEncoder", (ur) =>
            function (d) {
                const e = ur.call(this, d);
                recOf.set(e, { name: stapel.length ? stapel[stapel.length - 1] : "?", desc: d, cmds: [], bundle: true });
                return e;
            }
        );
        haken(RB, "finish", (ur) =>
            function (d) {
                const b = ur.call(this, d);
                const R = recOf.get(this);
                if (R) bundleRec.set(b, R);
                return b;
            }
        );
        haken(rend, "_renderScene", (ur) =>
            function (scene, camera, ...a) {
                stapel.push(window.__passName(scene, camera));
                try {
                    return ur.call(this, scene, camera, ...a);
                } finally {
                    stapel.pop();
                }
            }
        );
        haken(be, "draw", (ur) =>
            function (ro, info) {
                const o = ro.object;
                const zug = o && o.isGeometrieArena === true ? o._stapel[o._stapel.length - 1] : null;
                const vor = tag;
                tag = { obj: o, n: 0, zuege: zug && zug.zuege ? zug.zuege.slice() : null };
                try {
                    return ur.call(this, ro, info);
                } finally {
                    tag = vor;
                }
            }
        );
        const infoVor = { calls: rend.info.render.calls, triangles: rend.info.render.triangles };
        try {
            __bundlesNeu();
            r._schattenAlleNeu();
            await q.onSubmittedWorkDone();
            r._loopRender();
            await q.onSubmittedWorkDone();
        } finally {
            for (const z of zurueck.reverse()) z();
        }
        const info = { calls: rend.info.render.calls, triangles: rend.info.render.triangles, vor: infoVor };
        // die Pässe des Hauptbilds in Folge (auch der leere, der nur leert — die Treue spielt sie alle), gezählt nur die mit Befehlen
        const hauptAlle = passes.filter((p) => p.name === "haupt");
        const haupt = hauptAlle.filter((p) => p.cmds.length);
        if (!haupt.length) throw new Error("PIXEL-ZENSUS: kein Pass des Hauptbilds aufgenommen (" + passes.map((p) => p.name).join(",") + ")");

        // ── 2) die Züge des Hauptbilds mit ihrem Zustand (Bündel aufgefaltet) ─────────────────────────────────────────
        const draws = [];
        const fehltBuendel = { n: 0 };
        const ohneTiefe = { paesse: 0, befehle: 0 }; // Bild-Pässe ohne Tiefe (das Tiefen-Abbild): keine Welt-Geometrie, gezählt
        for (let pi = 0; pi < haupt.length; pi++) {
            const P = haupt[pi];
            if (!P.desc.depthStencilAttachment) {
                ohneTiefe.paesse++;
                ohneTiefe.befehle += P.cmds.filter((c) => c.op === "d" || c.op === "i").length;
                continue;
            }
            const pz = { vp: null, sc: null, sr: 0, bc: null };
            let z = { p: null, bg: [], vb: [], ib: null };
            const lauf = (cmds, inBuendel) => {
                for (const c of cmds) {
                    if (c.op === "p") z.p = c.p;
                    else if (c.op === "bg") z.bg[c.i] = { g: c.g, o: c.o };
                    else if (c.op === "vb") z.vb[c.s] = { b: c.b, o: c.o, z: c.z };
                    else if (c.op === "ib") z.ib = { b: c.b, f: c.f, o: c.o, z: c.z };
                    else if (c.op === "vp") pz.vp = c.v;
                    else if (c.op === "sc") pz.sc = c.v;
                    else if (c.op === "sr") pz.sr = c.v;
                    else if (c.op === "bc") pz.bc = c.v;
                    else if (c.op === "B") {
                        for (const b of c.b) {
                            const R = bundleRec.get(b);
                            if (!R) {
                                fehltBuendel.n++;
                                continue;
                            }
                            const vor = z;
                            z = { p: null, bg: [], vb: [], ib: null };
                            lauf(R.cmds, true);
                            z = vor;
                        }
                        z = { p: null, bg: [], vb: [], ib: null }; // nach executeBundles ist der Zustand des Passes leer
                    } else if (c.op === "d" || c.op === "i")
                        draws.push({
                            pass: pi,
                            buendel: inBuendel,
                            p: z.p,
                            bg: z.bg.slice(),
                            vb: z.vb.slice(),
                            ib: z.ib,
                            vp: pz.vp,
                            sc: pz.sc,
                            sr: pz.sr,
                            bc: pz.bc,
                            idx: c.idx,
                            ind: c.op === "i" ? { buf: c.buf, off: c.off } : null,
                            n: c.n,
                            inst: c.inst,
                            first: c.first,
                            bv: c.bv,
                            fi: c.fi,
                            tag: c.tag,
                        });
                }
            };
            lauf(P.cmds, false);
        }
        if (fehltBuendel.n) throw new Error("PIXEL-ZENSUS: " + fehltBuendel.n + " Bündel des Hauptbilds ohne Aufnahme");

        // ── 3) die Argumente der indirekten Züge aus ihren Auftrags-Puffern ─────────────────────────────────────────
        const lese = async (buf) => {
            if (!(buf.usage & GPUBufferUsage.COPY_SRC)) throw new Error("PIXEL-ZENSUS: Auftrags-Puffer ohne COPY_SRC (" + buf.label + ")");
            const s = dev.createBuffer({ size: buf.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
            const e = dev.createCommandEncoder();
            e.copyBufferToBuffer(buf, 0, s, 0, buf.size);
            q.submit([e.finish()]);
            await s.mapAsync(GPUMapMode.READ);
            const kopie = s.getMappedRange().slice(0);
            s.unmap();
            s.destroy();
            return kopie;
        };
        const indPuffer = new Map();
        for (const d of draws) if (d.ind && !indPuffer.has(d.ind.buf)) indPuffer.set(d.ind.buf, null);
        for (const b of indPuffer.keys()) indPuffer.set(b, await lese(b));
        for (const d of draws) {
            if (!d.ind) continue;
            const ab = indPuffer.get(d.ind.buf);
            const u = new Uint32Array(ab, d.ind.off, d.idx ? 5 : 4),
                s = new Int32Array(ab, d.ind.off, d.idx ? 5 : 4);
            d.n = u[0];
            d.inst = u[1];
            d.first = u[2];
            d.bv = d.idx ? s[3] : 0;
            d.fi = d.idx ? u[4] : u[3];
        }

        // ── 4) die Dreiecke: je Zug Basis, Zahl je Instanz; nur Dreiecks-Listen ──────────────────────────────────────
        const nichtListe = { n: 0, tris: 0 };
        let N = 0;
        for (const d of draws) {
            const desc = PG.pipeDesc.get(d.p);
            if (!desc) throw new Error("PIXEL-ZENSUS: Pipeline ohne Deskriptor (" + (d.p && d.p.label) + ") — der Abgriff kam zu spät");
            // ein Zwilling teilt die Bindegruppen des Originals nur über dasselbe explizite Layout
            if (!desc.layout || desc.layout === "auto")
                throw new Error("PIXEL-ZENSUS: Pipeline mit automatischem Layout im Hauptbild (" + (d.p && d.p.label) + ") — kein Zwilling möglich");
            d.desc = desc;
            const topo = (desc.primitive && desc.primitive.topology) || "triangle-list";
            d.tris = topo === "triangle-list" ? Math.floor(d.n / 3) : 0;
            if (topo !== "triangle-list") {
                nichtListe.n++;
                nichtListe.tris += topo === "triangle-strip" ? Math.max(0, d.n - 2) * d.inst : 0;
            }
            d.base = N;
            N += d.tris * d.inst;
        }
        const basen = new Float64Array(draws.map((d) => d.base));
        const zugVon = (g) => {
            let lo = 0,
                hi = draws.length - 1;
            while (lo < hi) {
                const m = (lo + hi + 1) >> 1;
                if (basen[m] <= g) lo = m;
                else hi = m - 1;
            }
            while (lo < draws.length - 1 && draws[lo].tris * draws[lo].inst === 0 && basen[lo + 1] <= g) lo++;
            return lo;
        };

        // ── 5) die Zwillings-Pipelines ────────────────────────────────────────────────────────────────────────────────
        // je Pass des Hauptbilds seine Ziele: Größe, Samples, Tiefe, Farbe (die Welt zeichnet ihr Hauptbild in mehreren Pässen)
        const ansicht = (v) => PG.viewTex.get(v);
        const passInfo = haupt.map((P) => {
            const da = P.desc.depthStencilAttachment;
            const tiefeTex = da ? ansicht(da.view) : null;
            const f0 = P.desc.colorAttachments && P.desc.colorAttachments[0];
            const farbeTex = f0 ? ansicht(f0.resolveTarget || f0.view) : null;
            const g = tiefeTex || farbeTex;
            if (!g) throw new Error("PIXEL-ZENSUS: die Größe eines Passes des Hauptbilds ist unbekannt");
            return {
                W: g.width,
                H: g.height,
                S: (tiefeTex || (f0 && ansicht(f0.view)) || g).sampleCount || 1,
                tiefeTex,
                tiefeLaden: da ? da.depthLoadOp || null : null,
                farbeTex,
                farben: (P.desc.colorAttachments || []).map((c) => (c ? ansicht(c.resolveTarget || c.view) : null)),
            };
        });
        const hatStencil = (f) => /stencil/.test(f || "");
        const LE = { less: "less-equal", greater: "greater-equal", "less-equal": "less-equal", "greater-equal": "greater-equal", equal: "equal", always: "always", never: "never", "not-equal": "not-equal" };
        const halt = (s) => (s ? { compare: s.compare || "always", failOp: "keep", depthFailOp: "keep", passOp: "keep" } : undefined);
        const weitModul = new Map();
        const weitFehlt = { n: 0 };
        const modulWeit = (m) => {
            if (weitModul.has(m)) return weitModul.get(m);
            const code = PG.modCode.get(m);
            let neu = null;
            const anker = "\n\treturn varyings;\n";
            if (code && code.includes(anker) && code.includes("builtinClipSpace"))
                neu = dev.createShaderModule({
                    label: "pixel-zensus-weit",
                    code: code.replace(
                        anker,
                        `\n\tvaryings.builtinClipSpace = vec4<f32>( varyings.builtinClipSpace.xy * ${(1 / K).toFixed(8)}, varyings.builtinClipSpace.zw );${anker}`
                    ),
                });
            weitModul.set(m, neu);
            return neu;
        };
        const zwilling = new Map();
        const zwillingVon = (d, art) => {
            const S0 = passInfo[d.pass].S;
            const key = art === "vis" || art === "rasA" ? art : art + "|" + S0;
            let m = zwilling.get(d.p);
            if (!m) zwilling.set(d.p, (m = new Map()));
            if (m.has(key)) return m.get(key);
            const o = d.desc;
            const prim = Object.assign({}, o.primitive || {});
            let desc;
            if (art === "vis" || art === "rasA") {
                // vis: gegen die Tiefe des Frames (nur gelesen); rasA: das Fragment allein (Alpha, discard) auf der eigenen geleerten Tiefe
                const ds0 = o.depthStencil;
                const ds =
                    art === "rasA"
                        ? { format: "depth32float", depthWriteEnabled: false, depthCompare: "less-equal" }
                        : ds0
                          ? Object.assign({}, ds0, {
                                depthWriteEnabled: false,
                                depthCompare: LE[ds0.depthCompare || "always"] || "always",
                                stencilFront: halt(ds0.stencilFront),
                                stencilBack: halt(ds0.stencilBack),
                                stencilWriteMask: 0,
                            })
                          : undefined;
                desc = {
                    label: "pixel-zensus-" + art,
                    layout: o.layout,
                    vertex: o.vertex,
                    primitive: prim,
                    depthStencil: ds,
                    multisample: o.multisample,
                    fragment: o.fragment
                        ? Object.assign({}, o.fragment, { targets: o.fragment.targets.map((t) => (t ? { format: t.format, writeMask: 0 } : t)) })
                        : undefined,
                };
            } else {
                // Tiefe allein (kein Fragment): rastert das Dreieck überhaupt — je Seite, in Dichte, im weiten Schirm
                if (art !== "ras1") prim.cullMode = "none";
                let vertex = o.vertex;
                if (art === "weit") {
                    const mw = modulWeit(o.vertex.module);
                    if (!mw) {
                        weitFehlt.n++;
                        m.set(key, null);
                        return null;
                    }
                    vertex = Object.assign({}, o.vertex, { module: mw });
                }
                desc = {
                    label: "pixel-zensus-" + art,
                    layout: o.layout,
                    vertex,
                    primitive: prim,
                    // `less-equal` gegen die geleerte 1 statt `always`: ohne Fragment-Stufe und mit abgeschaltetem Tiefentest rastert
                    // D3D12 gar nicht (Dawn schaltet DepthEnable bei always ohne Schreiben ab) — der erste Lauf zählte 0 von 402 800
                    depthStencil: { format: "depth32float", depthWriteEnabled: false, depthCompare: "less-equal" },
                    multisample: { count: art === "ras1" || art === "ras2" ? S0 : 1 },
                };
            }
            const p = dev.createRenderPipelineAsync(desc);
            m.set(key, p);
            return p;
        };
        const zwillingeBauen = async (art) => {
            const offen = [];
            for (const d of draws) if (d.tris * d.inst) offen.push(zwillingVon(d, art));
            const fehler = [];
            for (const p of offen) if (p && p.then) await p.catch((e) => fehler.push(String(e.message || e).slice(0, 300)));
            for (const m of zwilling.values())
                for (const [k2, p] of m) if (p && p.then) m.set(k2, await p.catch(() => null));
            if (fehler.length) throw new Error("PIXEL-ZENSUS: Zwilling " + art + " bricht: " + fehler[0]);
        };
        const zwillingHol = (d, art) => zwilling.get(d.p).get(art === "vis" || art === "rasA" ? art : art + "|" + passInfo[d.pass].S);

        // ── 6) die Ziele der Proben ──────────────────────────────────────────────────────────────────────────────────
        const eigeneTiefe = new Map();
        const tiefeFuer = (w, h, s) => {
            const key = w + "x" + h + "x" + s;
            if (!eigeneTiefe.has(key))
                eigeneTiefe.set(key, dev.createTexture({ size: [w, h], format: "depth32float", sampleCount: s, usage: GPUTextureUsage.RENDER_ATTACHMENT }));
            return eigeneTiefe.get(key);
        };
        const passBeschreibung = (art, pi, qs) => {
            const I = passInfo[pi];
            if (art === "vis" || art === "rasA") {
                const d = haupt[pi].desc;
                const da = d.depthStencilAttachment;
                const farben = (d.colorAttachments || []).map((c) => (c ? { view: c.view, loadOp: "load", storeOp: "store" } : c));
                if (art === "rasA")
                    return {
                        colorAttachments: farben,
                        depthStencilAttachment: { view: tiefeFuer(I.W, I.H, I.S).createView(), depthLoadOp: "clear", depthClearValue: 1, depthStoreOp: "discard" },
                        occlusionQuerySet: qs,
                    };
                return {
                    colorAttachments: farben,
                    depthStencilAttachment: da
                        ? Object.assign({ view: da.view, depthReadOnly: true }, hatStencil(I.tiefeTex && I.tiefeTex.format) ? { stencilReadOnly: true } : {})
                        : undefined,
                    occlusionQuerySet: qs,
                };
            }
            const fein = art === "dicht" || art === "weit";
            const t = fein ? tiefeFuer(I.W * K, I.H * K, 1) : tiefeFuer(I.W, I.H, I.S);
            return {
                colorAttachments: [],
                depthStencilAttachment: { view: t.createView(), depthLoadOp: "clear", depthClearValue: 1, depthStoreOp: "discard" },
                occlusionQuerySet: qs,
            };
        };
        const zustand = (pass, d, art, pipe) => {
            pass.setPipeline(pipe);
            for (let i = 0; i < d.bg.length; i++) if (d.bg[i]) pass.setBindGroup(i, d.bg[i].g, d.bg[i].o);
            for (let s = 0; s < d.vb.length; s++) if (d.vb[s]) pass.setVertexBuffer(s, d.vb[s].b, d.vb[s].o, d.vb[s].z);
            if (d.idx && d.ib) pass.setIndexBuffer(d.ib.b, d.ib.f, d.ib.o, d.ib.z);
            const f = art === "dicht" || art === "weit" ? K : 1;
            if (d.vp) pass.setViewport(d.vp[0] * f, d.vp[1] * f, d.vp[2] * f, d.vp[3] * f, d.vp[4], d.vp[5]);
            if (d.sc) pass.setScissorRect(d.sc[0] * f, d.sc[1] * f, d.sc[2] * f, d.sc[3] * f);
            if (art === "vis" || art === "rasA") {
                if (d.sr) pass.setStencilReference(d.sr);
            }
        };

        // ── 7) die Probe: je Dreieck ein Draw in seiner Query; Ergebnis je Dreieck wahr/falsch ──────────────────────
        const QN = 4096;
        const ohneZwilling = {}; // je Probe die Züge ohne Zwilling (weit: ein Vertex-Text ohne die Schirm-Lage) — gezählt, im Ergebnis
        // die Züge liegen in Pass-Folge (Abflachung in Reihe der Pässe): das Ende jedes Passes im globalen Dreiecks-Index
        const passEnde = haupt.map(() => 0);
        for (const d of draws) passEnde[d.pass] = Math.max(passEnde[d.pass], d.base + d.tris * d.inst);
        for (let pi = 1; pi < passEnde.length; pi++) passEnde[pi] = Math.max(passEnde[pi], passEnde[pi - 1]);
        const passVon = (g) => {
            let pi = 0;
            while (pi < passEnde.length - 1 && g >= passEnde[pi]) pi++;
            return pi;
        };
        const qsPool = [];
        const queryMenge = (i) => qsPool[i] || (qsPool[i] = dev.createQuerySet({ type: "occlusion", count: QN }));
        const probe = async (art, liste) => {
            await zwillingeBauen(art);
            const n = liste.length;
            const treffer = new Uint8Array(n);
            if (!n) return treffer;
            // die Stücke: je höchstens QN Dreiecke EINES Passes (seine Ziele), aufgelöst an 256-Byte-Grenzen
            const stuecke = [];
            let off = 0;
            for (let c = 0; c < n; ) {
                const pi = passVon(liste[c]);
                let m = 0;
                while (m < QN && c + m < n && liste[c + m] < passEnde[pi]) m++;
                stuecke.push({ c, m, pi, off });
                off += Math.ceil((m * 8) / 256) * 256;
                c += m;
            }
            const BLOCK = 32; // Pässe je Abgabe
            const res = dev.createBuffer({ size: off, usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC });
            const lesen = dev.createBuffer({ size: off, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
            let block = 0;
            for (let s0 = 0; s0 < stuecke.length; s0 += BLOCK) {
                dev.pushErrorScope("validation"); // ein ungültiger Befehl leert die ganze Abgabe still (jede Query 0) — laut beim Namen
                const e = dev.createCommandEncoder({ label: "pixel-zensus-" + art });
                for (let b = 0; b < BLOCK && s0 + b < stuecke.length; b++) {
                    const S = stuecke[s0 + b];
                    const qs = queryMenge(b);
                    const pass = e.beginRenderPass(passBeschreibung(art, S.pi, qs));
                    let letzt = -1,
                        pipe = null;
                    for (let j = 0; j < S.m; j++) {
                        const g = liste[S.c + j];
                        const di = letzt >= 0 && g >= draws[letzt].base && g < draws[letzt].base + draws[letzt].tris * draws[letzt].inst ? letzt : zugVon(g);
                        const d = draws[di];
                        if (di !== letzt) {
                            pipe = zwillingHol(d, art);
                            if (pipe) zustand(pass, d, art, pipe);
                            else ohneZwilling[art] = (ohneZwilling[art] || 0) + 1;
                            letzt = di;
                        }
                        pass.beginOcclusionQuery(j);
                        if (pipe) {
                            const loc = g - d.base,
                                i = Math.floor(loc / d.tris),
                                t = loc - i * d.tris;
                            if (d.idx) pass.drawIndexed(3, 1, d.first + 3 * t, d.bv, d.fi + i);
                            else pass.draw(3, 1, d.first + 3 * t, d.fi + i);
                        }
                        pass.endOcclusionQuery();
                    }
                    pass.end();
                    e.resolveQuerySet(qs, 0, S.m, res, S.off);
                }
                q.submit([e.finish()]);
                const fehler = await dev.popErrorScope();
                if (fehler) throw new Error("PIXEL-ZENSUS: die Probe " + art + " ist ungültig: " + String(fehler.message).slice(0, 400));
                block++;
                if (block % 8 === 0) await q.onSubmittedWorkDone();
            }
            const e = dev.createCommandEncoder();
            e.copyBufferToBuffer(res, 0, lesen, 0, off);
            q.submit([e.finish()]);
            await lesen.mapAsync(GPUMapMode.READ);
            const w = new BigUint64Array(lesen.getMappedRange());
            for (const S of stuecke) for (let j = 0; j < S.m; j++) treffer[S.c + j] = w[S.off / 8 + j] > 0n ? 1 : 0;
            lesen.unmap();
            lesen.destroy();
            res.destroy();
            return treffer;
        };

        // ── 8) DIE TREUE: die Befehle des Frames noch einmal in seine Ziele — gleicht das Bild dem Frame? ──────────────
        const farbeLesen = async (tex) => {
            if (!tex || !(tex.usage & GPUTextureUsage.COPY_SRC)) return null;
            const bpp = { rgba16float: 8, rgba8unorm: 4, bgra8unorm: 4, rgba32float: 16, rg11b10ufloat: 4 }[tex.format];
            if (!bpp || tex.sampleCount > 1) return null;
            const reihe = Math.ceil((tex.width * bpp) / 256) * 256;
            const s = dev.createBuffer({ size: reihe * tex.height, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
            const e = dev.createCommandEncoder();
            e.copyTextureToBuffer({ texture: tex }, { buffer: s, bytesPerRow: reihe }, [tex.width, tex.height]);
            q.submit([e.finish()]);
            await s.mapAsync(GPUMapMode.READ);
            const k2 = s.getMappedRange().slice(0);
            s.unmap();
            s.destroy();
            return { ab: k2, reihe, bpp, w: tex.width, h: tex.height, format: tex.format };
        };
        const halb = (h) => {
            const s = (h & 0x8000) >> 15,
                e = (h & 0x7c00) >> 10,
                f = h & 0x03ff;
            return (s ? -1 : 1) * (e === 0 ? Math.pow(2, -14) * (f / 1024) : e === 31 ? (f ? NaN : Infinity) : Math.pow(2, e - 15) * (1 + f / 1024));
        };
        const kanal = (B, x, y, c) => {
            if (!B.u16) (B.u16 = new Uint16Array(B.ab)), (B.f32 = new Float32Array(B.ab)), (B.u8 = new Uint8Array(B.ab));
            if (B.format === "rgba16float") return halb(B.u16[(y * B.reihe + x * 8 + c * 2) >> 1]);
            if (B.format === "rgba32float") return B.f32[(y * B.reihe + x * 16 + c * 4) >> 2];
            return B.u8[y * B.reihe + x * 4 + c] / 255;
        };
        const farbZiele = [...new Set(passInfo.map((I) => I.farbeTex).filter(Boolean))];
        const bilderA = [];
        for (const t of farbZiele) bilderA.push(await farbeLesen(t));
        // die Wiedergabe: jeder haupt-Pass mit seinem Deskriptor, Befehl für Befehl (Bündel als Bündel)
        {
            const e = dev.createCommandEncoder({ label: "pixel-zensus-treue" });
            for (const P of hauptAlle) {
                const d = Object.assign({}, P.desc);
                delete d.occlusionQuerySet;
                delete d.timestampWrites;
                const pass = e.beginRenderPass(d);
                for (const c of P.cmds) {
                    if (c.op === "p") pass.setPipeline(c.p);
                    else if (c.op === "bg") pass.setBindGroup(c.i, c.g, c.o);
                    else if (c.op === "vb") pass.setVertexBuffer(c.s, c.b, c.o, c.z);
                    else if (c.op === "ib") pass.setIndexBuffer(c.b, c.f, c.o, c.z);
                    else if (c.op === "vp") pass.setViewport(...c.v);
                    else if (c.op === "sc") pass.setScissorRect(...c.v);
                    else if (c.op === "sr") pass.setStencilReference(c.v);
                    else if (c.op === "bc") pass.setBlendConstant(c.v);
                    else if (c.op === "B") pass.executeBundles(c.b);
                    else if (c.op === "d") c.idx ? pass.drawIndexed(c.n, c.inst, c.first, c.bv, c.fi) : pass.draw(c.n, c.inst, c.first, c.fi);
                    else if (c.op === "i") c.idx ? pass.drawIndexedIndirect(c.buf, c.off) : pass.drawIndirect(c.buf, c.off);
                }
                pass.end();
            }
            q.submit([e.finish()]);
            await q.onSubmittedWorkDone();
        }
        const treue = [];
        for (let k2 = 0; k2 < farbZiele.length; k2++) {
            const tex = farbZiele[k2];
            const bildA = bilderA[k2],
                bildB = await farbeLesen(tex);
            if (!bildA || !bildB) {
                treue.push({ ziel: tex.label || "", fehlt: "Farbe nicht lesbar (" + tex.format + ", usage " + tex.usage + ", samples " + tex.sampleCount + ")" });
                continue;
            }
            let anders = 0;
            for (let y = 0; y < bildA.h; y++)
                for (let x = 0; x < bildA.w; x++) {
                    let dm = 0;
                    for (let c = 0; c < 3; c++) {
                        const a = kanal(bildA, x, y, c),
                            b = kanal(bildB, x, y, c);
                        const dd = Math.abs(a - b) / Math.max(1e-3, Math.abs(a) + Math.abs(b));
                        if (dd > dm) dm = dd;
                    }
                    if (dm > 0.01) anders++;
                }
            treue.push({ ziel: tex.label || "", pixel: bildA.w * bildA.h, anders, anteil: +(anders / (bildA.w * bildA.h)).toFixed(5), format: bildA.format });
        }

        // ── 9) die Proben in Folge ──────────────────────────────────────────────────────────────────────────────────
        const KL = new Uint8Array(N); // 0 offen · 1 sichtbar · 2 verdeckt · 3 alpha-leer · 4 rückseitig · 5 unter-px · 6 außerhalb · 7 rest
        const alle = new Uint32Array(N);
        for (let i = 0; i < N; i++) alle[i] = i;
        const zeiten = {};
        const schritt = async (art, liste, ja, nein) => {
            const tz = performance.now();
            const t = await probe(art, liste);
            const jaL = [],
                neinL = [];
            for (let i = 0; i < liste.length; i++) (t[i] ? jaL : neinL).push(liste[i]);
            zeiten[art] = Math.round(performance.now() - tz);
            if (ja != null) for (const g of jaL) KL[g] = ja;
            if (nein != null) for (const g of neinL) KL[g] = nein;
            return { ja: Uint32Array.from(jaL), nein: Uint32Array.from(neinL) };
        };
        const r1 = await schritt("ras1", alle, null, null); // R1 | nicht
        // DIE EICHUNG: rastert kein einziges Dreieck des Hauptbilds, zählt die Probe nicht (kein Befund „alles Rest")
        if (N > 0 && r1.ja.length === 0) throw new Error("PIXEL-ZENSUS: kein Dreieck von " + N + " rastert in der Probe — sie zählt nicht");
        const rA = await schritt("rasA", r1.ja, null, 3); // R | alpha-leer
        await schritt("vis", rA.ja, 1, 2); // sichtbar | verdeckt
        const r2 = await schritt("ras2", r1.nein, 4, null); // rückseitig | kein Raster
        const dD = await schritt("dicht", r2.nein, 5, null); // unter dem Bildpunkt
        await schritt("weit", dD.nein, 6, 7); // außerhalb | rest

        // ── 10) die Zählung: je Klasse des Täters, je Haufen ─────────────────────────────────────────────────────────
        const klasseVon = new Map();
        const klasse = (d) => {
            const t = d.tag;
            if (!t || !t.obj) return "ohne-objekt";
            let o = t.obj;
            if (t.zuege && t.zuege[t.j]) o = t.zuege[t.j];
            if (o.isGeometrieArena === true) o = o.glieder && o.glieder[0] ? o.glieder[0] : o;
            if (o.__instanzQuelle) o = o.__instanzQuelle;
            if (klasseVon.has(o)) return klasseVon.get(o);
            let kl;
            try {
                kl = r._taeterKlasse(o);
            } catch (e) {
                kl = "?";
            }
            klasseVon.set(o, kl);
            return kl;
        };
        const NAMEN = ["offen", "sichtbar", "verdeckt", "alphaLeer", "rueckseitig", "unterPx", "ausserhalb", "rest"];
        const leer = () => ({ zuege: 0, tris: 0, je: [0, 0, 0, 0, 0, 0, 0, 0], haufen: 0, haufenOhne: 0, trisInHaufenOhne: 0, haufenVerdeckt: 0, trisInHaufenVerdeckt: 0, instanzen: 0, instanzenOhne: 0, trisInInstanzOhne: 0, zuegeOhne: 0, trisInZugOhne: 0 }); // prettier-ignore
        const je = new Map();
        const ges = leer();
        for (const d of draws) {
            const T = d.tris * d.inst;
            if (!T) continue;
            const kl = klasse(d);
            const e = je.get(kl) || je.set(kl, leer()).get(kl);
            e.zuege++;
            ges.zuege++;
            e.tris += T;
            ges.tris += T;
            let zugSicht = 0;
            for (let i = 0; i < d.inst; i++) {
                let instSicht = 0;
                for (let h0 = 0; h0 < d.tris; h0 += HAUFEN) {
                    const h1 = Math.min(d.tris, h0 + HAUFEN);
                    let sicht = 0,
                        verdeckt = 0;
                    for (let t = h0; t < h1; t++) {
                        const c = KL[d.base + i * d.tris + t];
                        e.je[c]++;
                        ges.je[c]++;
                        if (c === 1) sicht++;
                        else if (c === 2) verdeckt++;
                    }
                    e.haufen++;
                    ges.haufen++;
                    instSicht += sicht;
                    if (!sicht) {
                        e.haufenOhne++;
                        ges.haufenOhne++;
                        e.trisInHaufenOhne += h1 - h0;
                        ges.trisInHaufenOhne += h1 - h0;
                        if (verdeckt) {
                            e.haufenVerdeckt++;
                            ges.haufenVerdeckt++;
                            e.trisInHaufenVerdeckt += h1 - h0;
                            ges.trisInHaufenVerdeckt += h1 - h0;
                        }
                    }
                }
                // die Instanz: ein Haus, ein Baum, ein Büschel — ohne jedes sichtbare Dreieck fällt sie ganz
                e.instanzen++;
                ges.instanzen++;
                zugSicht += instSicht;
                if (!instSicht) {
                    e.instanzenOhne++;
                    ges.instanzenOhne++;
                    e.trisInInstanzOhne += d.tris;
                    ges.trisInInstanzOhne += d.tris;
                }
            }
            if (!zugSicht) {
                e.zuegeOhne++;
                ges.zuegeOhne++;
                e.trisInZugOhne += T;
                ges.trisInZugOhne += T;
            }
        }
        const form = (e) => Object.assign({ zuege: e.zuege, tris: e.tris }, Object.fromEntries(NAMEN.map((n, i) => [n, e.je[i]])), {
            haufen: e.haufen,
            haufenOhne: e.haufenOhne,
            trisInHaufenOhne: e.trisInHaufenOhne,
            haufenVerdeckt: e.haufenVerdeckt,
            trisInHaufenVerdeckt: e.trisInHaufenVerdeckt,
            instanzen: e.instanzen,
            instanzenOhne: e.instanzenOhne,
            trisInInstanzOhne: e.trisInInstanzOhne,
            zuegeOhne: e.zuegeOhne,
            trisInZugOhne: e.trisInZugOhne,
        });
        const rezepte = r._foundry && r._foundry.recipes ? r._foundry.recipes : {};
        const artVon = (kl) => {
            const m = /^(?:leer:)?(f|fimp|fscatter):([^:]+):/.exec(kl);
            const rz = m ? rezepte[m[2]] : null;
            return rz && rz.kind ? rz.kind : null;
        };
        for (const t of eigeneTiefe.values()) t.destroy();
        for (const qs of qsPool) qs.destroy();
        const cam = st.camera;
        return {
            K,
            haufenGroesse: HAUFEN,
            // je Pass des Hauptbilds: Ziele, Größe, Züge, Dreiecke — welche Pässe das Hauptbild trägt
            hauptStruktur: passInfo.map((I, pi) => {
                const ds = draws.filter((d) => d.pass === pi);
                return {
                    w: I.W,
                    h: I.H,
                    samples: I.S,
                    tiefe: I.tiefeTex ? I.tiefeTex.format + (I.tiefeTex.label ? " " + I.tiefeTex.label : "") : null,
                    tiefeNr: I.tiefeTex ? passInfo.findIndex((J) => J.tiefeTex === I.tiefeTex) : -1,
                    tiefeLaden: I.tiefeLaden,
                    farben: I.farben.map((t) => (t ? t.format + (t.label ? " " + t.label : "") : null)),
                    zuege: ds.length,
                    tris: ds.reduce((a, d) => a + d.tris * d.inst, 0),
                    klassen: [...new Set(ds.slice(0, 400).map((d) => klasse(d)))].slice(0, 6),
                };
            }),
            kamera: { modus: st.cameraMode, pos: [cam.position.x, cam.position.y, cam.position.z].map((x) => +x.toFixed(2)), fov: cam.fov },
            paesse: passes.map((p) => p.name).reduce((a, n) => ((a[n] = (a[n] || 0) + 1), a), {}),
            hauptPaesse: haupt.length,
            zuege: draws.length,
            indirekt: draws.filter((d) => d.ind).length,
            imBuendel: draws.filter((d) => d.buendel).length,
            pipelines: zwilling.size,
            nichtListe,
            ohneTiefe,
            weitOhneModul: weitFehlt.n,
            ohneZwilling,
            info,
            treue,
            zeitenMs: zeiten,
            gesamtMs: Math.round(performance.now() - t0),
            gesamt: form(ges),
            klassen: [...je.entries()].map(([kl, e]) => Object.assign({ klasse: kl, art: artVon(kl) }, form(e))).sort((a, b) => b.tris - a.tris),
        };
    })();
}

module.exports = {
    pixelInstall,
    pixelZensus,
    PIXEL_INSTALL: `(${pixelInstall.toString()})();`,
    PIXEL_ZENSUS: `window.__pixelZensus = ${pixelZensus.toString()};`,
};
