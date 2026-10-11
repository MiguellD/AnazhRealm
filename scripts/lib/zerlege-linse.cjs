// zerlege-linse.cjs — DIE GPU-ZERLEGUNG (Gebot 10: die Linse nennt den Täter beim Namen). Befund 06.10. (zwei Geräte,
// V18.531, Mess-Wiese): die gpu-bank misst 22–26 ms je Frame (Radeon 890M) bzw. 20–26 ms (GTX 1060), die r184-Pass-
// Stempel summieren 5–10 ms — der Rest trug keinen Namen (auf der GTX pixel-proportional: ~9 ms je Megapixel). Diese
// Linse schaltet benannte Verbraucher am ECHTEN Weg ab und misst je Schalter die Differenz mit der gpu-bank (n Frames
// ohne rAF, dann onSubmittedWorkDone) im Wechsel AUS/AN (ABBA, ≥ 4 Runden, Median der Differenzen); dazu je Zustand die
// CPU des Haupt-Threads und die Pass-Stempel — ob eine Differenz GPU ist, Haupt-Thread oder Treiber, zeigen die drei
// Spalten nebeneinander.
//
// DIE SCHALTER kommen aus dem ECHTEN Weg (die Inventur liest einen Frame: Pässe am Chokepoint `_renderScene` als Baum,
// Klassen aus dem Draw-Zähler, die Stufen der Post-Kette aus ihrem Knoten-Graphen), nie aus einer Liste geraten:
//   Pässe — die Pass-Uhr überspringt den Render am Chokepoint `_renderScene` (Karte/Ziel behält den alten Inhalt):
//     haupt (der Szenen-Pass samt Schatten-Auslösung) · schatten (alle Kaskaden) · k0 · k1 · jeder unbekannte Blatt-Pass
//     `pass:<name>` (eine Hülle — ein Pass, in dem andere rendern — fiele mit ihren Kindern und bekommt keinen Schalter)
//   Weiche — post: `state.postProcessingFailed`, die EINE Weiche in `_loopRender` (Direktpfad ohne Post-Kette)
//   Knoten — Haken am Knoten-`updateBefore` (die Arbeit des Knotens je Frame):
//     traa: Resolve-Quad + Geschichts- und Tiefen-Kopie fallen, die Szene rendert weiter (in r184 rendert sie
//       VERSCHACHTELT im Resolve — der Haken ruft nur `frame.updateBeforeNode(scenePass)`); davon traaKopien: nur die
//       zwei `copyTextureToTexture` im TRAA-Knoten
//     tiefenkopie: die EINE Szenen-Tiefe (`_szeneTiefe`): Kopie + Pass-Bruch des Hauptbilds fallen, die Leser (Wasser,
//       Feld-Pass) lesen die alte Tiefe
//   Post-Kette — am EINEN Ort, dem Ausgabe-Knoten der RenderPipeline, umgebaut und exakt zurückgebaut (Kontext und
//     Fragment-Knoten der Pipeline zurück: r184 holt einen gebauten Zustand aus dem Cache, ohne `setup` erneut zu rufen —
//     die TRAA-Haken des alten Kontexts blieben sonst verloren):
//     nachbild: Ausgabe = das aufgelöste Bild (Bloom · Godrays · Kontrast · Grading fallen, die Ausgabe-Wandlung bleibt)
//     bloom · godrays · kontrast: die Stufe ist der Summand, der ihre Stärke-Uniform (`postProcessingUniforms`) trägt —
//       die nächste Summe über der Uniform verliert diesen Summanden (alle Abtastungen der Stufe fallen aus dem Shader)
//   Klassen — `visible` am gezeichneten Objekt, der EINE Weg, den Projektion und Pass-Wahl (`_passSicht`) lesen; danach
//     nimmt jedes Region-Bundle neu auf: himmel · wasser · feldPass (Welt-March) · die Haushalt-Klassen der Band-Linse
//     (spec/profiband/haushalt.json über `band-urteil.zuordnen`) · jeder Täter ohne Haushalt-Klasse `klasse:<name>`.
//     Ein Klassen-Posten trägt seinen Schatten-Wurf mit.
//   Boden — leer: Direktpfad, nichts sichtbar, kein Schatten, kein unbekannter Pass: was der leere Frame kostet.
// Σ zählt die disjunkten Posten (Klassen · traa · tiefenkopie · bloom · godrays · kontrast · unbekannte Pässe);
// Rest = Gesamt − Σ = leerer Frame + Wechselwirkung (geteilte Kosten fallen erst, wenn ALLE Teilhaber fallen).
//
// DIE FRAME-ANATOMIE (Inventur): jeder GPU-Befehl je Frame beim Namen — Render-Pässe je Pass mit ihren Zielen (Format ·
// Größe · Proben · Lade-Art, Ziel-Bytes), NEUSTARTS (ein Pass, der mitten im Render endet und neu beginnt — r184
// `copyFramebufferToTexture`; trägt der Neustart den Anfangs-Stempel, überschreibt er ihn: der Pass-Stempel misst dann
// nur den Teil nach dem Bruch — „Stempel-Bruch"), Pässe ohne Zeitstempel, Compute-Pässe und Dispatches, jede Kopie
// (Quelle → Ziel, Bytes), jedes Hochladen (writeBuffer/writeTexture je Ziel, Bytes), Submits, Bundle-Ausführungen,
// direkte Draws, Anlagen je Frame — Zähl-Haken an den WebGPU-Prototypen, nur für die Anatomie-Frames, danach exakt zurück.
// Namen: der Schlüssel des VRAM-Abgriffs (`__vramK`), die Ansicht → Textur über `__viewTex` (scripts/lib/vram-abgriff.cjs).
//
// DER ZUSTAND: jede Stellgröße, die die Linse anfasst (Sichtbarkeit je Objekt, Weiche, Knoten-Haken, Ausgabe-Knoten,
// Pipeline-Kontext und Fragment-Knoten, Ketten-Graph, Pass-Uhr, Prototyp-Haken, Schatten-Flaggen), steht nach dem Lauf
// wie davor — `zurueck` vergleicht und nennt jede Abweichung. Die Frame-Uhren (Schatten-Takt, Halton-Index, Dither) und
// Versions-Zähler laufen wie in jeder gpu-bank weiter; die Bundles nehmen neu auf.
//
// DER SELBSTTEST (`--selbsttest`): ein eingeschmuggelter Vollbild-Pass mit fester Fragment-Last (eigenes Ziel in
// Leinwand-Größe, nach `_loopRender`) muss als eigener Posten `pass:zerlege-selbsttest` erscheinen, seine Differenz muss
// seine Kosten allein treffen (±max(1 ms, 35 %)), und ohne ihn verschwindet der Posten.
//
//   Seite:     window.__passUhr() · __bankRunde(n) · __stempelWache() · __frameAnatomie(uhr, n) · __zerlegeInventur(k) · __zerlegeMessen(k)
//              · __zerlegeLast(k) · __zerlegeZustand() · __zerlegeVergleich(a, b) · __ketteKante(uniform)
//   Werkbank:  node scripts/werkbank.cjs zerlegen [--runden r] [--n frames] [--nur a,b] [--json datei] [--bilder ordner]
//                                                 [--selbsttest [--last iter]]
"use strict";

// ── Seite ────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Ein Haken an einer Eigenschaft, der exakt zurückstellt (eine eigene Eigenschaft wird zurückgeschrieben, eine geerbte
// gelöscht — kein Rest auf dem Objekt).
function haken(o, key, fn) {
    const eigen = Object.prototype.hasOwnProperty.call(o, key);
    const alt = o[key];
    o[key] = fn;
    return () => {
        if (eigen) o[key] = alt;
        else delete o[key];
    };
}

// DIE PASS-UHR am Chokepoint `_renderScene`: der Stapel der rendernden Pässe (jeder Render, auch verschachtelt — der
// Schatten startet mitten im Hauptbild, die Szene mitten im TRAA-Resolve), je Render eine laufende Nummer (die Anatomie
// erkennt so Neustarts), je Pass der Zeitstempel-Schlüssel (r184 `r:<Aufruf>:<Kontext>:f<Frame>`), die Zahl der Renders
// je Pass und — für die Zerlegung — die ausgeschalteten Pässe. `lesen()` löst den Pool auf (setzt ihn zurück: 2048
// Abfragen reichen sonst nur wenige Bank-Runden) und gibt je Pass je Frame die ms.
// DIE ZAHL JE PASS (`lauf`): steht `frameZ` (ein Objekt je gerendertem Frame), bucht jeder Render seine Befehle und
// Dreiecke aus renderer.info (die Quelle von HUD und Flugschreiber) unter seinem Pass — exklusiv: ein Schatten-Pass
// mitten im Hauptbild zählt nur sich, das Hauptbild ohne ihn. renderer.info trägt die Summe aller Pässe eines Frames,
// und die Pässe wechseln (die nahe Kaskade rendert jeden zweiten Frame, die ferne seltener) — ein Perzentil über die
// Takte sprang zwischen den Moden (06.10., echte GPU, Mess-Wiese: 540p 273 und im nächsten Lauf 176 Befehle).
function passUhr() {
    const r = window.anazhRealm;
    const rend = r.state.renderer;
    const be = rend.backend;
    const uhr = {
        messen: false,
        aus: new Set(),
        stapel: [],
        idStapel: [],
        lauf: 0,
        baum: null,
        zaehl: {},
        uidPass: new Map(),
        frameZ: null,
        zStapel: [],
    };
    const rohSzene = rend._renderScene;
    const rohUid = be.updateTimeStampUID;
    const ab = [];
    ab.push(
        haken(rend, "_renderScene", function (scene, camera, ...rest) {
            const name = window.__passName(scene, camera);
            const z = uhr.zaehl[name] || (uhr.zaehl[name] = { an: 0, aus: 0 });
            if (uhr.baum)
                uhr.baum.push({ name, tiefe: uhr.stapel.length, eltern: uhr.stapel[uhr.stapel.length - 1] || null });
            if (uhr.aus.has(name)) {
                z.aus++;
                return undefined;
            }
            z.an++;
            uhr.stapel.push(name);
            uhr.idStapel.push(++uhr.lauf);
            const fz = uhr.frameZ;
            const ri = this.info.render;
            const zz = fz ? { dc: ri.drawCalls, tri: ri.triangles, kDc: 0, kTri: 0 } : null;
            if (zz) uhr.zStapel.push(zz);
            try {
                return rohSzene.call(this, scene, camera, ...rest);
            } finally {
                uhr.stapel.pop();
                uhr.idStapel.pop();
                if (zz) {
                    uhr.zStapel.pop();
                    const dc = ri.drawCalls - zz.dc,
                        tri = ri.triangles - zz.tri;
                    const eltern = uhr.zStapel[uhr.zStapel.length - 1];
                    if (eltern) {
                        eltern.kDc += dc;
                        eltern.kTri += tri;
                    }
                    const e = fz[name] || (fz[name] = { dc: 0, tri: 0 });
                    e.dc += dc - zz.kDc;
                    e.tri += tri - zz.kTri;
                }
            }
        })
    );
    ab.push(
        haken(be, "updateTimeStampUID", function (ctx) {
            rohUid.call(this, ctx);
            const uid = this.get(ctx).timestampUID;
            if (uhr.messen && uid && uid[0] === "r") uhr.uidPass.set(uid, uhr.stapel[uhr.stapel.length - 1] || "?");
        })
    );
    uhr.lesen = async () => {
        const pool = be.timestampQueryPool && be.timestampQueryPool.render;
        if (!pool) return null;
        await rend.resolveTimestampsAsync("render");
        const je = {};
        for (const [uid, pass] of uhr.uidPass) {
            const ms = pool.timestamps.get(uid);
            if (!Number.isFinite(ms)) continue;
            const f = uid.slice(uid.lastIndexOf(":f") + 2);
            const e = je[pass] || (je[pass] = {});
            e[f] = (e[f] || 0) + ms;
        }
        uhr.uidPass.clear();
        return je;
    };
    uhr.nullen = () => {
        for (const z of Object.values(uhr.zaehl)) z.an = z.aus = 0;
    };
    uhr.ab = () => {
        while (ab.length) ab.pop()();
    };
    return uhr;
}

// DIE EINE BANK-RUNDE (gpu-bank · zerlegen): n Frames direkt hintereinander (ohne rAF, ohne VSync) — je Frame der
// Schatten-Takt wie im Loop und `_loopRender` —, dann auf die GPU warten. Liegt die GPU je Frame über der CPU, ist
// Gesamtzeit / n die reine GPU-Zeit je Frame. (Alle n Frames laufen in EINER Aufgabe: die Leinwand präsentiert erst
// danach — das Präsentieren steht nicht in der Bank.) DIE STEMPEL DER BANK: der Spiel-Loop löst den Zeitstempel-Pool je
// gerendertem Frame auf (`_perfGpuResolveKick`), die Bank rendert ohne ihn — sie leert den Pool vor ihren Frames und nach
// ihnen (außerhalb der gemessenen Spanne; r184 setzt ihn nur beim Auflösen zurück, `__stempelWache`). Ein Auflösen, das
// schon läuft, deckt die Abfragen danach nicht: höchstens drei Züge, bis der Pool leer ist.
function bankRunde(n) {
    return (async () => {
        const r = window.anazhRealm;
        const rend = r.state.renderer;
        const q = rend.backend.device.queue;
        const stempelAuf = async () => {
            const pool = rend.backend.trackTimestamp === true && rend.backend.timestampQueryPool.render;
            for (let i = 0; pool && i < 3 && pool.currentQueryIndex > 0; i++) await rend.resolveTimestampsAsync("render");
        };
        await q.onSubmittedWorkDone();
        await stempelAuf();
        const t0 = performance.now();
        let cpu = 0;
        for (let i = 0; i < n; i++) {
            const c0 = performance.now();
            if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
            r._loopShadowUpdate(); // der Schatten-Takt wie im Loop (je Kaskade am echten Leser)
            r._loopRender(performance.now() / 1000);
            cpu += performance.now() - c0;
        }
        const tAb = performance.now();
        await q.onSubmittedWorkDone();
        const t1 = performance.now();
        await stempelAuf();
        return { jeFrame: (t1 - t0) / n, cpuJeFrame: cpu / n, nachlauf: t1 - tAb };
    })();
}

// DIE STEMPEL-WACHE: r184 legt je Render-Pass zwei Abfragen in einen festen Pool (WebGPUTimestampQueryPool, 2048) und
// setzt ihn nur beim Auflösen zurück (`resolveTimestampsAsync`); ist er voll, bekommt ein Pass keine Abfrage
// (`allocateQueriesForContext` → null, die Warnung kommt nur EINMAL je Seite: warnOnce) und schreibt seine Stempel
// trotzdem — `timestampWrites` mit Index null → 0 und null + 1 → 1, in die Plätze eines fremden Passes. Die Wache zählt
// jede verweigerte Abfrage (Haken am Prototyp des Pools, einmal je Seite) und die Spitze des Pools; ohne Pool (kein
// timestamp-query) steht `pool: null`.
// Je verweigerter Abfrage der Täter: der Render, der sie wollte (r184 setzt Kamera und Ziel des Render-Kontexts vor
// `beginRender`) — der Pass (`__passName`) und das Ziel beim Namen.
function stempelWache() {
    const rend = window.anazhRealm && window.anazhRealm.state.renderer;
    const be = rend && rend.backend;
    const w =
        window.__stempelWacheStand || (window.__stempelWacheStand = { ueberlauf: 0, spitze: 0, an: false, taeter: {} });
    const pool = be && be.timestampQueryPool ? be.timestampQueryPool.render : null;
    const stand = () => ({
        ueberlauf: w.ueberlauf,
        spitze: w.spitze,
        taeter: Object.assign({}, w.taeter),
        pool: pool ? { stand: pool.currentQueryIndex, max: pool.maxQueries } : null,
        an: w.an,
    });
    if (!pool) return stand();
    if (!w.an) {
        const P = Object.getPrototypeOf(pool);
        const roh = P.allocateQueriesForContext;
        P.allocateQueriesForContext = function (uid) {
            const i = roh.call(this, uid);
            if (i === null && this.trackTimestamp && !this.isDisposed) {
                w.ueberlauf++;
                const ctx = rend._currentRenderContext;
                const rt = ctx && ctx.renderTarget;
                const ziel = rt && rt.texture && rt.texture.name ? rt.texture.name : rt ? "ziel" : "leinwand";
                const k = (ctx && ctx.camera ? window.__passName(null, ctx.camera) : "?") + " → " + ziel;
                w.taeter[k] = (w.taeter[k] || 0) + 1;
            }
            if (this.currentQueryIndex > w.spitze) w.spitze = this.currentQueryIndex;
            return i;
        };
        w.an = true;
    }
    return stand();
}

// DIE FRAME-ANATOMIE: n Bank-Frames mit Zähl-Haken an den WebGPU-Prototypen — jeder Befehl je Frame beim Namen.
function frameAnatomie(uhr, n) {
    return (async () => {
        const ab = [];
        const A = {
            renderPaesse: {},
            ungestempelt: {},
            stempelBruch: {},
            computePaesse: {},
            dispatches: 0,
            kopien: {},
            hochladen: {},
            submits: 0,
            befehlsPuffer: 0,
            executeBundles: 0,
            bundles: 0,
            draws: {},
            setPipeline: 0,
            setBindGroup: 0,
            anlegen: {},
            leinwand: 0,
        };
        const begonnen = new Set();
        const falte = (s) => (window.__vramFalte ? window.__vramFalte(String(s)) : String(s));
        // der Name: das Label des Abgriff-Schlüssels (ohne Art, Format und Größe — die Bytes stehen daneben), sonst das Label
        const nameOf = (o) =>
            falte(
                String((o && (o.__vramK || o.label)) || "?")
                    .split(" ")[0]
                    .replace(/^(tex|buf):/, "") || "?"
            );
        const pass = () => uhr.stapel[uhr.stapel.length - 1] || "ausserhalb";
        const bpt = (fmt) => (window.__vramBpt ? window.__vramBpt(String(fmt || "")) : 4);
        const buche = (m, key, bytes) => {
            const e = m[key] || (m[key] = { n: 0, bytes: 0 });
            e.n++;
            e.bytes += bytes || 0;
            return e;
        };
        const groesse = (s) =>
            Array.isArray(s)
                ? [s[0] || 1, s[1] || 1, s[2] || 1]
                : [(s && s.width) || 1, (s && s.height) || 1, (s && s.depthOrArrayLayers) || 1];
        const texBytes = (tex, size) => {
            const [w, h, d] = groesse(size);
            return w * h * d * bpt(tex && tex.format);
        };
        // Ein Ziel einer Render-Pass-Ansicht: Format · Größe · Proben · Lade-Art, Bytes = Pixel × Bytes je Texel × Proben.
        const ziel = (view, lade) => {
            const t = window.__viewTex ? window.__viewTex.get(view) : null;
            if (!t) return { text: "? " + (lade || ""), bytes: 0 };
            const s = t.sampleCount || 1;
            return {
                text: `${t.format} ${t.width}×${t.height}${s > 1 ? "×" + s : ""} ${lade || "-"}`,
                bytes: t.width * t.height * s * bpt(t.format),
            };
        };
        // Gezählt wird am Prototyp UND an jedem lebenden Exemplar, das die Methode selbst trägt (der Stamm hüllt
        // `device.queue.writeBuffer` für seine Upload-Telemetrie mit dem GEBUNDENEN Original — am Prototyp zählte
        // sonst kein Upload). Ein Aufruf zählt einmal, auch wenn eine Hülle die nächste ruft.
        const tief = {};
        const be = window.anazhRealm.state.renderer.backend;
        const exemplare = [be.device, be.device && be.device.queue, be.context].filter(Boolean);
        const zaehle = (proto, key, fn) => {
            if (!proto || typeof proto[key] !== "function") return;
            const ziele = [proto];
            for (const x of exemplare)
                if (Object.prototype.hasOwnProperty.call(x, key) && proto.isPrototypeOf(x)) ziele.push(x);
            for (const o of ziele) {
                const roh = o[key];
                ab.push(
                    haken(o, key, function (...a) {
                        if (!tief[key])
                            try {
                                fn.apply(this, a);
                            } catch (_e) {}
                        tief[key] = (tief[key] || 0) + 1;
                        try {
                            return roh.apply(this, a);
                        } finally {
                            tief[key]--;
                        }
                    })
                );
            }
        };
        const G = window;
        const CE = G.GPUCommandEncoder && GPUCommandEncoder.prototype;
        zaehle(CE, "beginRenderPass", (d) => {
            const p = pass();
            const id = uhr.idStapel[uhr.idStapel.length - 1] || 0;
            const neustart = id > 0 && begonnen.has(id);
            begonnen.add(id);
            const z = [];
            let bytes = 0;
            for (const c of (d && d.colorAttachments) || []) {
                if (!c) continue;
                const e = ziel(c.view, c.loadOp);
                z.push(e.text);
                bytes += e.bytes;
            }
            const ds = d && d.depthStencilAttachment;
            if (ds) {
                const e = ziel(ds.view, ds.depthLoadOp);
                z.push(e.text);
                bytes += e.bytes;
            }
            const e = buche(A.renderPaesse, p + (neustart ? " (Neustart)" : ""), bytes);
            e.ziele = z.join(" + ");
            const tw = d && d.timestampWrites;
            if (!tw) buche(A.ungestempelt, p + (d && d.label ? " [" + falte(d.label) + "]" : ""), 0);
            else if (neustart && tw.beginningOfPassWriteIndex !== undefined) buche(A.stempelBruch, p, 0);
        });
        zaehle(CE, "beginComputePass", (d) =>
            buche(A.computePaesse, pass() + (d && d.label ? " [" + falte(d.label) + "]" : ""), 0)
        );
        const CP = G.GPUComputePassEncoder && GPUComputePassEncoder.prototype;
        zaehle(CP, "dispatchWorkgroups", () => A.dispatches++);
        zaehle(CP, "dispatchWorkgroupsIndirect", () => A.dispatches++);
        zaehle(CE, "copyTextureToTexture", (src, dst, size) =>
            buche(
                A.kopien,
                `${pass()}: Textur ${nameOf(src && src.texture)} → ${nameOf(dst && dst.texture)}`,
                texBytes(src && src.texture, size)
            )
        );
        zaehle(CE, "copyBufferToBuffer", (src, so, dst, dOff, size) =>
            buche(A.kopien, `${pass()}: Puffer ${nameOf(src)} → ${nameOf(dst)}`, typeof size === "number" ? size : 0)
        );
        zaehle(CE, "copyBufferToTexture", (src, dst, size) =>
            buche(
                A.kopien,
                `${pass()}: Puffer ${nameOf(src && src.buffer)} → Textur ${nameOf(dst && dst.texture)}`,
                texBytes(dst && dst.texture, size)
            )
        );
        zaehle(CE, "copyTextureToBuffer", (src, dst, size) =>
            buche(
                A.kopien,
                `${pass()}: Textur ${nameOf(src && src.texture)} → Puffer ${nameOf(dst && dst.buffer)}`,
                texBytes(src && src.texture, size)
            )
        );
        zaehle(CE, "resolveQuerySet", (qs, first, count, dst) =>
            buche(A.kopien, `${pass()}: Abfragen ${falte((qs && qs.label) || "?")} → ${nameOf(dst)}`, (count || 0) * 8)
        );
        zaehle(CE, "clearBuffer", (buf, off, size) =>
            buche(A.kopien, `${pass()}: Leeren ${nameOf(buf)}`, typeof size === "number" ? size : 0)
        );
        const Q = G.GPUQueue && GPUQueue.prototype;
        zaehle(Q, "writeBuffer", (buf, off, data, dOff, size) => {
            const bpe = (data && data.BYTES_PER_ELEMENT) || 1;
            const b = size != null ? size * bpe : ((data && data.byteLength) || 0) - (dOff || 0) * bpe;
            buche(A.hochladen, `${pass()}: Puffer ${nameOf(buf)}`, b);
        });
        zaehle(Q, "writeTexture", (dst, data, layout, size) =>
            buche(A.hochladen, `${pass()}: Textur ${nameOf(dst && dst.texture)}`, texBytes(dst && dst.texture, size))
        );
        zaehle(Q, "copyExternalImageToTexture", (src, dst, size) =>
            buche(A.hochladen, `${pass()}: Bild → Textur ${nameOf(dst && dst.texture)}`, texBytes(dst && dst.texture, size))
        );
        zaehle(Q, "submit", (cbs) => {
            A.submits++;
            A.befehlsPuffer += (cbs && cbs.length) || 0;
        });
        const RP = G.GPURenderPassEncoder && GPURenderPassEncoder.prototype;
        zaehle(RP, "executeBundles", (b) => {
            A.executeBundles++;
            A.bundles += (b && b.length) || 0;
        });
        for (const k of ["draw", "drawIndexed", "drawIndirect", "drawIndexedIndirect"])
            zaehle(RP, k, () => buche(A.draws, pass(), 0));
        zaehle(RP, "setPipeline", () => A.setPipeline++);
        zaehle(RP, "setBindGroup", () => A.setBindGroup++);
        const D = G.GPUDevice && GPUDevice.prototype;
        for (const k of [
            "createBuffer",
            "createTexture",
            "createBindGroup",
            "createCommandEncoder",
            "createQuerySet",
            "createRenderBundleEncoder",
            "createRenderPipeline",
            "createShaderModule",
        ])
            zaehle(D, k, () => (A.anlegen[k] = (A.anlegen[k] || 0) + 1));
        zaehle(G.GPUCanvasContext && GPUCanvasContext.prototype, "getCurrentTexture", () => A.leinwand++);
        try {
            await window.__bankRunde(n);
        } finally {
            while (ab.length) ab.pop()();
        }
        await uhr.lesen();
        const jeFrame = (m) =>
            Object.entries(m)
                .map(([was, e]) =>
                    Object.assign(
                        { was, n: +(e.n / n).toFixed(2), mb: +(e.bytes / n / 1048576).toFixed(3) },
                        e.ziele ? { ziele: e.ziele } : {}
                    )
                )
                .sort((a, b) => b.mb - a.mb || b.n - a.n);
        const summe = (m) => {
            let c = 0,
                b = 0;
            for (const e of Object.values(m)) {
                c += e.n;
                b += e.bytes;
            }
            return { n: +(c / n).toFixed(2), mb: +(b / n / 1048576).toFixed(3) };
        };
        const proFrame = (x) => +(x / n).toFixed(2);
        return {
            frames: n,
            renderPaesse: jeFrame(A.renderPaesse),
            renderSumme: summe(A.renderPaesse),
            ungestempelt: jeFrame(A.ungestempelt),
            stempelBruch: jeFrame(A.stempelBruch),
            computePaesse: jeFrame(A.computePaesse),
            dispatches: proFrame(A.dispatches),
            kopien: jeFrame(A.kopien),
            kopienSumme: summe(A.kopien),
            hochladen: jeFrame(A.hochladen),
            hochladenSumme: summe(A.hochladen),
            submits: proFrame(A.submits),
            befehlsPuffer: proFrame(A.befehlsPuffer),
            executeBundles: proFrame(A.executeBundles),
            bundles: proFrame(A.bundles),
            draws: jeFrame(A.draws),
            setPipeline: proFrame(A.setPipeline),
            setBindGroup: proFrame(A.setBindGroup),
            anlegen: Object.fromEntries(Object.entries(A.anlegen).map(([k, v]) => [k, proFrame(v)])),
            leinwand: proFrame(A.leinwand),
        };
    })();
}

// Die Knoten-Kinder eines TSL-Knotens (wie r184 `getNodeChildren`: eigene Eigenschaften ohne `_`, Knoten oder Listen
// von Knoten) — für den Graphen der Post-Kette.
function knotenKinder(n) {
    const aus = [];
    for (const key of Object.getOwnPropertyNames(n)) {
        if (key[0] === "_") continue;
        const v = n[key];
        if (v && v.isNode === true) aus.push({ key, i: null, c: v });
        else if (Array.isArray(v)) v.forEach((x, i) => x && x.isNode === true && aus.push({ key, i, c: x }));
    }
    return aus;
}

// DIE KANTE EINER STUFE der Post-Kette: die Stufe ist der Summand, der ihre Stärke-Uniform trägt — vom Ausgabe-Knoten
// abwärts die Eltern jeder Kante, von der Uniform aufwärts die NÄCHSTE Summe (`+`): deren Operand auf dem Weg zur
// Uniform ist die Stufe. null, wenn die Kette die Uniform nicht (mehr) über eine Summe trägt (der Schalter fehlt dann,
// laut in der Inventur).
function ketteKante(uName) {
    const st = window.anazhRealm.state;
    const pp = st.postProcessing;
    const U = st.postProcessingUniforms && st.postProcessingUniforms[uName];
    if (!pp || !U || !pp.outputNode) return null;
    const eltern = new Map();
    const gesehen = new Set();
    const stapel = [pp.outputNode];
    while (stapel.length) {
        const n = stapel.pop();
        if (!n || gesehen.has(n.id)) continue;
        gesehen.add(n.id);
        for (const k of knotenKinder(n)) {
            const l = eltern.get(k.c.id) || [];
            l.push({ p: n, key: k.key, i: k.i });
            eltern.set(k.c.id, l);
            stapel.push(k.c);
        }
    }
    let rand = [U.id];
    const besucht = new Set(rand);
    for (let tiefe = 1; tiefe < 64 && rand.length; tiefe++) {
        const naechst = [];
        for (const id of rand)
            for (const e of eltern.get(id) || []) {
                if (e.i === null && e.p.isOperatorNode === true && e.p.op === "+")
                    return { p: e.p, key: e.key, kind: e.p[e.key], tiefe, knoten: gesehen.size };
                if (!besucht.has(e.p.id)) {
                    besucht.add(e.p.id);
                    naechst.push(e.p.id);
                }
            }
        rand = naechst;
    }
    return null;
}

// Die Abtastungen der Ausgabe: die Textur-Knoten im Graphen des Fragment-Knotens, den die RenderPipeline gerade zeichnet
// (je `.sample(uv)` ein eigener Knoten) — der Beleg einer Ketten-Stufe: ohne Bloom fallen 9, ohne Godrays 20.
function ketteAbtastungen() {
    const pp = window.anazhRealm.state.postProcessing;
    const f = pp && pp._quadMesh ? pp._quadMesh.material.fragmentNode : null;
    if (!f) return null;
    const gesehen = new Set();
    const stapel = [f];
    let n = 0;
    while (stapel.length) {
        const k = stapel.pop();
        if (!k || gesehen.has(k.id)) continue;
        gesehen.add(k.id);
        if (k.isTextureNode === true) n++;
        for (const c of knotenKinder(k)) stapel.push(c.c);
    }
    return n;
}

// Der Fingerabdruck des Ketten-Graphen (jede Kante: Eltern-id · Schlüssel · Kind-id, in Eigenschafts-Reihenfolge).
function ketteHash() {
    const pp = window.anazhRealm.state.postProcessing;
    if (!pp || !pp.outputNode) return null;
    let h = 2166136261;
    const mische = (s) => {
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    };
    const gesehen = new Set();
    const stapel = [pp.outputNode];
    while (stapel.length) {
        const n = stapel.pop();
        if (!n || gesehen.has(n.id)) continue;
        gesehen.add(n.id);
        for (const k of knotenKinder(n)) {
            mische(n.id + "." + k.key + (k.i === null ? "" : "#" + k.i) + "=" + k.c.id + ";");
            stapel.push(k.c);
        }
    }
    return h;
}

// DER ZUSTAND, den die Linse anfasst — vorher/nachher verglichen (`__zerlegeVergleich`).
function zerlegeZustand() {
    const r = window.anazhRealm;
    const st = r.state;
    const rend = st.renderer;
    const be = rend.backend;
    let n = 0,
        an = 0,
        h = 2166136261;
    st.scene.traverse((o) => {
        n++;
        const b = o.visible ? 1 : 0;
        an += b;
        h = Math.imul(h ^ (b + 1), 16777619) >>> 0;
    });
    const eigen = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);
    const csm = st.csmNode;
    const lichter = csm && csm.lights && csm.lights.length ? csm.lights : st.directionalLight ? [st.directionalLight] : [];
    const protos = [];
    for (const [K, keys] of [
        [
            "GPUCommandEncoder",
            [
                "beginRenderPass",
                "beginComputePass",
                "copyTextureToTexture",
                "copyBufferToBuffer",
                "copyBufferToTexture",
                "copyTextureToBuffer",
                "resolveQuerySet",
                "clearBuffer",
            ],
        ],
        ["GPUComputePassEncoder", ["dispatchWorkgroups", "dispatchWorkgroupsIndirect"]],
        ["GPUQueue", ["writeBuffer", "writeTexture", "copyExternalImageToTexture", "submit"]],
        [
            "GPURenderPassEncoder",
            ["executeBundles", "draw", "drawIndexed", "drawIndirect", "drawIndexedIndirect", "setPipeline", "setBindGroup"],
        ],
        [
            "GPUDevice",
            [
                "createBuffer",
                "createTexture",
                "createBindGroup",
                "createCommandEncoder",
                "createQuerySet",
                "createRenderBundleEncoder",
                "createRenderPipeline",
                "createShaderModule",
            ],
        ],
        ["GPUCanvasContext", ["getCurrentTexture"]],
    ])
        if (window[K]) for (const k of keys) protos.push(window[K].prototype[k]);
    // die eigenen Methoden der lebenden Exemplare (die Upload-Hülle des Stamms an der Queue)
    const exemplare = [];
    for (const x of [be.device, be.device && be.device.queue, be.context].filter(Boolean))
        for (const k of Object.getOwnPropertyNames(x)) if (typeof x[k] === "function") exemplare.push(x[k]);
    const pp = st.postProcessing;
    return {
        werte: {
            objekte: n,
            sichtbar: an,
            sichtHash: h,
            direkt: !!st.postProcessingFailed,
            ppNeu: pp ? !!pp.needsUpdate : null,
            ketteHash: window.__ketteHash(),
            traaHaken: eigen(st.traaNode, "updateBefore"),
            tiefenHaken: eigen(r._szeneTiefeKnoten, "updateBefore"),
            kopieHaken: eigen(rend, "copyTextureToTexture"),
            uidEigen: eigen(be, "updateTimeStampUID"),
            loopEigen: eigen(r, "_loopRender"),
            schatten: lichter.map((l) => (l.shadow ? [!!l.shadow.needsUpdate, !!l.shadow.autoUpdate] : null)),
        },
        refs: {
            ziel: rend.getRenderTarget(),
            ausgabeZiel: typeof rend.getOutputRenderTarget === "function" ? rend.getOutputRenderTarget() : null,
            renderScene: rend._renderScene,
            renderObjectDirect: rend._renderObjectDirect,
            uid: be.updateTimeStampUID,
            ausgabe: pp ? pp.outputNode : null,
            ppKontext: pp ? pp._context : null,
            ppFragment: pp && pp._quadMesh ? pp._quadMesh.material.fragmentNode : null,
            protos,
            exemplare,
        },
    };
}

function zerlegeVergleich(a, b) {
    const ab = [];
    for (const k of Object.keys(a.werte))
        if (JSON.stringify(a.werte[k]) !== JSON.stringify(b.werte[k]))
            ab.push(`${k}: ${JSON.stringify(a.werte[k])} → ${JSON.stringify(b.werte[k])}`);
    for (const k of Object.keys(a.refs)) {
        const x = a.refs[k],
            y = b.refs[k];
        const gleich = Array.isArray(x) ? x.length === y.length && x.every((v, i) => v === y[i]) : x === y;
        if (!gleich) ab.push(`${k}: Referenz getauscht`);
    }
    return ab;
}

// DIE INVENTUR: ein Zähl-Frame (Draw-Zähler, alle Klassen, alle Kaskaden) mit der Pass-Uhr als Baum (welcher Pass in
// welchem rendert), die Knoten und Stufen der Post-Kette, der Schatten-Takt, die Frame-Anatomie.
function zerlegeInventur(k) {
    return (async () => {
        const r = window.anazhRealm;
        const st = r.state;
        const rend = st.renderer;
        if (!rend.backend || !rend.backend.device) return { fehler: "kein GPU-Device" };
        rend.setAnimationLoop(null);
        window.__buehne();
        const uhr = window.__passUhr();
        try {
            uhr.baum = [];
            const z = await window.__drawZensus({ alle: true });
            const baum = uhr.baum;
            uhr.baum = null;
            await uhr.lesen();
            const passe = {};
            for (const e of baum) {
                const p =
                    passe[e.name] || (passe[e.name] = { name: e.name, n: 0, tiefe: e.tiefe, eltern: e.eltern, kinder: [] });
                p.n++;
            }
            for (const e of baum)
                if (e.eltern && passe[e.eltern] && !passe[e.eltern].kinder.includes(e.name))
                    passe[e.eltern].kinder.push(e.name);
            const T = r.constructor.SCHATTEN_TAKT || { nahMax: 1, fernFaktor: 1 };
            const mi = Math.max(1, Math.round(st._shadowMinInterval || 1));
            const kette = {};
            for (const u of k.kette || []) {
                const e = window.__ketteKante(u);
                kette[u] = e ? { tiefe: e.tiefe, knoten: e.knoten, kante: `${e.p.type || "?"}(${e.p.op}).${e.key}` } : null;
            }
            const anatomie = await window.__frameAnatomie(uhr, Math.max(1, k.n || 12));
            const cam = st.camera;
            const dir = new window.THREE.Vector3();
            cam.getWorldDirection(dir);
            const db = rend.getDrawingBufferSize(new window.THREE.Vector2());
            return {
                zensus: { klassen: z.klassen, passe: z.passe, gesamt: z.gesamt, unbenannt: z.unbenannt.length },
                passe: Object.values(passe),
                knoten: {
                    post: !!st.postProcessing && !st.postProcessingFailed,
                    traa: !!st.traaNode,
                    tiefenkopie: !!r._szeneTiefeKnoten,
                },
                kette,
                schattenTakt: { k0: Math.min(T.nahMax, mi), k1: mi * T.fernFaktor },
                anatomie,
                leinwand: [db.x, db.y],
                kamera: {
                    pos: [cam.position.x, cam.position.y, cam.position.z].map((x) => +x.toFixed(1)),
                    blick: [dir.x, dir.y, dir.z].map((x) => +x.toFixed(2)),
                },
                adapter: (() => {
                    const d = rend.backend.device;
                    const i = (d && d.adapterInfo) || (rend.backend.adapter && rend.backend.adapter.info) || null;
                    return i ? [i.vendor, i.architecture, i.device, i.description].filter(Boolean).join(" ") : null;
                })(),
            };
        } finally {
            uhr.ab();
        }
    })();
}

// DIE MESSUNG: je Schalter ABBA (Runde gerade: AN dann AUS, ungerade: AUS dann AN), je Zustand Einschwingen (Bank-Runden
// zu 3 Frames, bis zwei sich um < 15 % gleichen — die erste nach einem Wechsel nimmt Bundles neu auf, kompiliert ggf.)
// und eine gemessene Bank-Runde zu n Frames (n ein Vielfaches beider Schatten-Takte — jede Kaskade rendert in jeder
// Runde gleich oft). Danach je Schalter der BELEG im AUS-Zustand: ein Zähl-Frame (Befehle der Klasse → 0, keine anderen),
// optional ein Bild aus dem Ausgabe-Pfad.
function zerlegeMessen(k) {
    return (async () => {
        const r = window.anazhRealm;
        const st = r.state;
        const rend = st.renderer;
        if (!rend.backend || !rend.backend.device) return { fehler: "kein GPU-Device" };
        rend.setAnimationLoop(null);
        window.__buehne();
        const vorher = window.__zerlegeZustand();
        const uhr = window.__passUhr();
        const T = r.constructor.SCHATTEN_TAKT || { nahMax: 1, fernFaktor: 1 };
        const mi = Math.max(1, Math.round(st._shadowMinInterval || 1));
        const ggt = (a, b) => (b ? ggt(b, a % b) : a);
        const p0 = Math.min(T.nahMax, mi),
            p1 = mi * T.fernFaktor;
        const kgv = (p0 * p1) / ggt(p0, p1);
        const n = Math.ceil(Math.max(1, k.n || 12) / kgv) * kgv;
        const bundlesNeu = () =>
            st.scene.traverse((o) => {
                if (o.isBundleGroup) o.needsUpdate = true;
            });
        const zeichnet = (o) => o.visible === true && !!o.geometry && (o.isMesh || o.isLine || o.isPoints || o.isSprite);
        // DIE KETTE UMBAUEN: der Ausgabe-Knoten (bzw. eine Kante seines Graphen) ändert sich, die Pipeline baut ihr
        // Fragment neu (`_update`); die TRAA-Haken des alten Kontexts reisen mit (ein Bau aus dem Cache ruft `setup` nie).
        // Zurück: Graph, Kontext und Fragment-Knoten der Pipeline wie vorher, das Material baut aus dem Original.
        const ketteUm = (um, zurueck) => {
            const pp = st.postProcessing;
            const mat = pp._quadMesh.material;
            const ctxAlt = pp._context;
            const fragAlt = mat.fragmentNode;
            um();
            pp.needsUpdate = true;
            pp._update();
            if (ctxAlt && pp._context !== ctxAlt) {
                pp._context.onBeforeRenderPipeline = ctxAlt.onBeforeRenderPipeline;
                pp._context.onAfterRenderPipeline = ctxAlt.onAfterRenderPipeline;
            }
            return () => {
                zurueck();
                pp._context = ctxAlt;
                mat.fragmentNode = fragAlt;
                mat.needsUpdate = true;
            };
        };
        const undo = [];
        let aktiv = null;
        const anwenden = (s) => {
            while (undo.length) undo.pop()();
            aktiv = s;
            if (!s) return;
            s.treffer = s.treffer || 0;
            for (const p of s.passe || []) {
                uhr.aus.add(p);
                undo.push(() => uhr.aus.delete(p));
            }
            if (s.direkt) {
                const alt = st.postProcessingFailed;
                st.postProcessingFailed = true;
                undo.push(() => {
                    st.postProcessingFailed = alt;
                });
            }
            if (s.traa && st.traaNode)
                undo.push(
                    haken(st.traaNode, "updateBefore", (frame) => {
                        s.treffer++;
                        // die Szene rendert in r184 verschachtelt im Resolve — ohne Resolve rendert sie hier, einmal je Frame
                        if (st.scenePass) frame.updateBeforeNode(st.scenePass);
                    })
                );
            if (s.traaKopien && st.traaNode) {
                const traa = st.traaNode;
                const P = Object.getPrototypeOf(traa);
                undo.push(
                    haken(traa, "updateBefore", function (frame) {
                        const ab = haken(rend, "copyTextureToTexture", () => {
                            s.treffer++;
                        });
                        try {
                            return P.updateBefore.call(this, frame);
                        } finally {
                            ab();
                        }
                    })
                );
            }
            if (s.tiefenkopie && r._szeneTiefeKnoten)
                undo.push(
                    haken(r._szeneTiefeKnoten, "updateBefore", () => {
                        s.treffer++;
                    })
                );
            if (s.nachbild && st.postProcessing) {
                const pp = st.postProcessing;
                const alt = pp.outputNode;
                undo.push(
                    ketteUm(
                        () => {
                            pp.outputNode = st.traaNode ? st.traaNode.getTextureNode() : st.scenePass.getTextureNode();
                        },
                        () => {
                            pp.outputNode = alt;
                        }
                    )
                );
                s.treffer++;
            }
            if (s.stufe && st.postProcessing) {
                const pp = st.postProcessing;
                const e = window.__ketteKante(s.stufe);
                if (e) {
                    const null0 = window.THREE.TSL.float(0);
                    const auf = () => {
                        pp.outputNode.needsUpdate = true; // die Graph-Schlüssel rechnen neu (die Wurzel trägt die Version)
                    };
                    undo.push(
                        ketteUm(
                            () => {
                                e.p[e.key] = null0;
                                auf();
                            },
                            () => {
                                e.p[e.key] = e.kind;
                                auf();
                            }
                        )
                    );
                    s.treffer++;
                }
            }
            if (s.klassen || s.alleKlassen) {
                const set = new Set(s.klassen || []);
                const aus = [];
                st.scene.traverse((o) => {
                    if (zeichnet(o) && (s.alleKlassen || set.has(r._taeterKlasse(o)))) aus.push(o);
                });
                for (const o of aus) o.visible = false;
                s.objekte = aus.length;
                bundlesNeu();
                undo.push(() => {
                    for (const o of aus) o.visible = true;
                    bundlesNeu();
                });
            }
        };
        const lese = async () => (await uhr.lesen()) || {};
        const einschwingen = async () => {
            let vor = null;
            for (let i = 0; i < 6; i++) {
                const b = await window.__bankRunde(3);
                await lese();
                if (vor != null && Math.abs(b.jeFrame - vor) / vor < 0.15) break;
                vor = b.jeFrame;
            }
        };
        const messe = async () => {
            uhr.nullen();
            const treffer0 = aktiv ? aktiv.treffer : 0;
            uhr.messen = true;
            const b = await window.__bankRunde(n);
            uhr.messen = false;
            const treffer = aktiv ? aktiv.treffer - treffer0 : 0;
            const je = await lese();
            const jePass = {};
            let stempel = 0;
            for (const [p, e] of Object.entries(je)) {
                const s = Object.values(e).reduce((a, x) => a + x, 0) / n;
                jePass[p] = +s.toFixed(3);
                stempel += s;
            }
            const zaehl = {};
            for (const [p, z] of Object.entries(uhr.zaehl)) if (z.an || z.aus) zaehl[p] = { an: z.an, aus: z.aus };
            return {
                ms: +b.jeFrame.toFixed(3),
                cpu: +b.cpuJeFrame.toFixed(3),
                stempel: +stempel.toFixed(3),
                jePass,
                zaehl,
                treffer,
            };
        };
        // Das Beleg-Bild: die Aufnahme schwingt die Nah-Wiese für ihre Kamera ein (`_tickNahWiese`), und jeder Takt setzt
        // je Kachel `visible = count > 0` (`_instanzZahl`) — ein AUS-Schalter der Wiese stand im Bild wieder (gemessen
        // 06.10.: `leer` zeigte die Halme, der Zähl-Frame 148 → 0). Die Kamera steht in der Zerlegung, der Ring ist
        // eingeschwungen: für die Dauer der Aufnahme ruht der Takt, danach steht die Methode wie vorher.
        const bild = async () => {
            const W = 480,
                H = 270;
            const wieseRuht = typeof r._tickNahWiese === "function" ? haken(r, "_tickNahWiese", () => 0) : null;
            let auf;
            try {
                auf = await window.__ausgabeAufnahme(W, H, 1);
            } finally {
                if (wieseRuht) wieseRuht();
            }
            await lese();
            const cv = document.createElement("canvas");
            cv.width = W;
            cv.height = H;
            const ctx = cv.getContext("2d");
            const img = ctx.createImageData(W, H);
            img.data.set(auf.u8.subarray(0, W * H * 4));
            ctx.putImageData(img, 0, 0);
            return { u8: auf.u8, png: cv.toDataURL("image/png") };
        };
        const aenderung = (a, b) => {
            let n0 = 0,
                n1 = 0;
            for (let i = 0; i < a.length; i += 4) {
                n0++;
                if (Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) > 12)
                    n1++;
            }
            return +((100 * n1) / Math.max(1, n0)).toFixed(1);
        };
        const t0 = performance.now();
        const ergebnis = { n, runden: k.runden, schalter: [], fenster: [] };
        // Ein Fenster-Ereignis ist FREMD (Fenster-Verwaltung, nie die Linse) und ändert die Welt: `resize` stellt die
        // Leinwand, die Szenen-Tiefe und das Tiefen-Abbild neu (der Frame trägt andere Pixel). Gemessen 06.10.
        // (Radeon 890M, Werkbank-Fenster 1940×1200 auf 1920×1200 geklemmt): zwei von vier Läufen trafen ein `resize`
        // OHNE Größenänderung der Seite (der Viewport ist emuliert, 1920×1080). Ein solches Ereignis schluckt die Linse
        // für die Dauer des Laufs (es ändert für die Seite nichts, die Welt bliebe sonst nicht dieselbe) und zählt es;
        // ändert sich die Größe wirklich, geht es durch, und der Lauf ist kein Vergleich gleicher Welten (benannt).
        let aktivId = "Start";
        const groesse = [window.innerWidth, window.innerHeight];
        const fenster = (ev) => {
            const gleich = window.innerWidth === groesse[0] && window.innerHeight === groesse[1];
            ergebnis.fenster.push({ s: +((performance.now() - t0) / 1000).toFixed(1), schalter: aktivId, geschluckt: gleich });
            if (gleich) ev.stopImmediatePropagation();
        };
        window.addEventListener("resize", fenster, true);
        try {
            anwenden(null);
            await einschwingen();
            for (const s of k.schalter) {
                const runden = [];
                s.treffer = 0;
                aktivId = s.id;
                for (let i = 0; i < k.runden; i++) {
                    const m = {};
                    for (const z of i % 2 === 0 ? ["an", "aus"] : ["aus", "an"]) {
                        anwenden(z === "an" ? null : s);
                        await einschwingen();
                        m[z] = await messe();
                    }
                    runden.push(m);
                }
                anwenden(null);
                ergebnis.schalter.push({ id: s.id, runden, treffer: s.treffer, objekte: s.objekte || 0 });
            }
            // DER BELEG je Schalter: Zähl-Frame AN (einmal) gegen AUS, dazu optional das Bild aus dem Ausgabe-Pfad.
            anwenden(null);
            await einschwingen();
            const zAn = await window.__drawZensus({ alle: true });
            await lese();
            const abtastungenAn = window.__ketteAbtastungen();
            ergebnis.abtastungenAn = abtastungenAn;
            const bildAn = k.bilder ? await bild() : null;
            const bildAn2 = k.bilder ? await bild() : null;
            ergebnis.bildRauschenPct = bildAn ? aenderung(bildAn.u8, bildAn2.u8) : null;
            if (bildAn) ergebnis.bildAn = bildAn.png;
            const cmdJe = (z) => {
                const m = new Map();
                for (const e of z.klassen) m.set(e.klasse, e.cmd);
                return m;
            };
            const an = cmdJe(zAn);
            for (const s of k.schalter) {
                aktivId = "Beleg " + s.id;
                anwenden(s);
                await einschwingen();
                const zAus = await window.__drawZensus({ alle: true });
                await lese();
                const aus = cmdJe(zAus);
                const eigen = new Set(s.klassen || []);
                let befehleAn = 0,
                    befehleAus = 0,
                    kollateral = 0;
                const kollateralKlassen = [];
                for (const kl of new Set([...an.keys(), ...aus.keys()])) {
                    const a = an.get(kl) || 0,
                        b = aus.get(kl) || 0;
                    if (eigen.has(kl)) {
                        befehleAn += a;
                        befehleAus += b;
                    } else if (a !== b) {
                        kollateral += Math.abs(a - b);
                        if (kollateralKlassen.length < 8) kollateralKlassen.push(`${kl} ${a}→${b}`);
                    }
                }
                const e = ergebnis.schalter.find((x) => x.id === s.id);
                e.beleg = {
                    befehleAn,
                    befehleAus,
                    kollateral,
                    kollateralKlassen,
                    abtastungenAus: window.__ketteAbtastungen(),
                    passeAn: zAn.passe,
                    passeAus: zAus.passe,
                };
                if (k.bilder) {
                    const b = await bild();
                    e.beleg.bildAenderungPct = aenderung(bildAn.u8, b.u8);
                    e.beleg.bild = b.png;
                }
                anwenden(null);
            }
        } finally {
            window.removeEventListener("resize", fenster, true);
            anwenden(null);
            // Die Karten tragen nach den Pass-Schaltern alten Inhalt: ein Frame mit allen Kaskaden malt sie im AN-Zustand
            // neu (der Schatten-Leser setzt needsUpdate danach selbst zurück; derselbe Frame baut die Ausgabe aus ihrem
            // Original-Fragment), dann die Schatten-Flaggen wie vorher.
            try {
                r._schattenAlleNeu();
                await window.__bankRunde(1);
                await lese();
            } catch (_e) {}
            uhr.ab();
            const csm = st.csmNode;
            const lichter =
                csm && csm.lights && csm.lights.length ? csm.lights : st.directionalLight ? [st.directionalLight] : [];
            vorher.werte.schatten.forEach((f, i) => {
                if (f && lichter[i] && lichter[i].shadow) {
                    lichter[i].shadow.needsUpdate = f[0];
                    lichter[i].shadow.autoUpdate = f[1];
                }
            });
        }
        ergebnis.zurueck = window.__zerlegeVergleich(vorher, window.__zerlegeZustand());
        ergebnis.sekunden = +((performance.now() - t0) / 1000).toFixed(1);
        return ergebnis;
    })();
}

// DIE EINGESCHMUGGELTE LAST des Selbsttests: ein Vollbild-Pass mit fester Fragment-Last (`iter` Runden sin/cos je
// Pixel) in ein eigenes Ziel in Leinwand-Größe, nach jedem `_loopRender` (Haken am Exemplar, kein Stamm-Code). `an`
// legt sie an und misst sie ALLEIN (Bank-Runden nur aus ihr), `ab` nimmt sie restlos weg.
function zerlegeLast(k) {
    return (async () => {
        const r = window.anazhRealm;
        const rend = r.state.renderer;
        const T = window.THREE;
        const TSL = T.TSL;
        if (!k.an) {
            const L = window.__zerlegeLastZustand;
            if (!L) return { ab: false };
            L.ab();
            L.rt.dispose();
            L.mat.dispose();
            L.geo.dispose();
            window.__zerlegeLastZustand = null;
            return { ab: true };
        }
        if (window.__zerlegeLastZustand) return { fehler: "Last steht schon" };
        const db = rend.getDrawingBufferSize(new T.Vector2());
        const rt = new T.RenderTarget(Math.round(db.x), Math.round(db.y), { depthBuffer: false });
        rt.texture.name = "zerlege-selbsttest";
        const { Fn, Loop, float, vec2, vec4, uv, sin, cos } = TSL;
        const iter = Math.max(1, k.iter || 96);
        const mat = new T.MeshBasicNodeMaterial();
        mat.name = "zerlege-selbsttest";
        mat.colorNode = Fn(() => {
            const p = uv().toVar();
            const a = float(0).toVar();
            Loop(iter, () => {
                a.assign(sin(p.x.mul(12.9898).add(a)).mul(cos(p.y.mul(78.233).sub(a))).add(a.mul(0.5)));
                p.addAssign(vec2(0.0013, 0.0007));
            });
            return vec4(a, a.mul(0.5), a.mul(0.25), 1);
        })();
        // Der Vollbild-Pass: eine eigene Szene (ihr Name nennt den Pass an der Pass-Uhr) mit einer 2×2-Fläche vor einer
        // Orthogonal-Kamera — jedes Pixel des Ziels läuft einmal durch die Last.
        const szene = new T.Scene();
        szene.name = "zerlege-selbsttest";
        const kamera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const flaeche = new T.Mesh(new T.PlaneGeometry(2, 2), mat);
        flaeche.name = "zerlege-selbsttest";
        flaeche.frustumCulled = false;
        flaeche.position.z = -0.5;
        szene.add(flaeche);
        const zeichne = () => {
            const vor = rend.getRenderTarget();
            rend.setRenderTarget(rt);
            rend.render(szene, kamera);
            rend.setRenderTarget(vor);
        };
        const P = Object.getPrototypeOf(r);
        const ab = haken(r, "_loopRender", function (t) {
            const o = P._loopRender.call(this, t);
            zeichne();
            return o;
        });
        window.__zerlegeLastZustand = { rt, mat, geo: flaeche.geometry, ab };
        const q = rend.backend.device.queue;
        const allein = async (n) => {
            await q.onSubmittedWorkDone();
            const t0 = performance.now();
            for (let i = 0; i < n; i++) zeichne();
            await q.onSubmittedWorkDone();
            return (performance.now() - t0) / n;
        };
        await allein(3);
        const w = [];
        for (let i = 0; i < 5; i++) w.push(await allein(12));
        if (rend.backend.timestampQueryPool && rend.backend.timestampQueryPool.render)
            await rend.resolveTimestampsAsync("render");
        w.sort((a, b) => a - b);
        return {
            an: true,
            iter,
            ziel: [rt.width, rt.height],
            alleinMs: +w[2].toFixed(3),
            alleinWerte: w.map((x) => +x.toFixed(2)),
        };
    })();
}

// ── Node ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Die Klassen, die feiner schneiden als der Haushalt (dort Teil von boden/einzelstuecke): das Wasser und die Vollbild-
// Dinge, deren Kosten an Pixeln hängen, nicht an Dreiecken.
const SPEZIAL = [
    { id: "himmel", titel: "Himmel (Kuppel · Sterne · Sonne · Mond)", muster: /^himmel(-|$)/ },
    {
        id: "wasser",
        titel: "Wasser (Wasser-Satz · Fern-Wasser · Chunk-Wasser)",
        muster: /^(wasserSatz|farWater|chunk-water-[a-z]+)$/,
    },
    { id: "feldPass", titel: "Feld-Pass / Welt-March (Stellvertreter-March + Panorama-Dreieck, die letzten Draws)", muster: /^feld-pass$/ },
];

// Die Stufen der Post-Kette, je ihre Stärke-Uniform (`state.postProcessingUniforms`, _ensurePostProcessing).
const KETTE = [
    { id: "bloom", uniform: "bloomStrength", titel: "Bloom (9 Abtastungen des aufgelösten Bilds)" },
    { id: "godrays", uniform: "godrayStrength", titel: "Godrays (20 Abtastungen, radialer March)" },
    { id: "kontrast", uniform: "localContrast", titel: "Lokaler Kontrast (4 Abtastungen)" },
];

// DIE SCHALTER aus der Inventur: Pässe aus dem Pass-Baum, Knoten und Stufen aus der Post-Kette, Klassen aus dem Zensus
// (geordnet über die EINE Regel des Haushalts), `leer` als Boden. `nur` filtert nach id (`unbekannteImmer`: die
// unbekannten Pässe/Klassen bleiben — der Selbsttest sucht sie).
function zerlegeSchalter(inv, haushalt, opt) {
    const BAND = require("./band-urteil.cjs");
    const o = opt || {};
    const S = [];
    const passe = new Map(inv.passe.map((p) => [p.name, p]));
    const kn = [...passe.keys()].filter((p) => /^k\d+$/.test(p)).sort();
    if (passe.has("haupt"))
        S.push({
            id: "haupt",
            titel: "Hauptbild ganz (Szenen-Pass samt Schatten-Auslösung und Tiefen-Kopie)",
            art: "pass",
            passe: ["haupt"],
            sigma: false,
        });
    if (kn.length) {
        S.push({ id: "schatten", titel: `Schatten gesamt (${kn.join(" + ")})`, art: "pass", passe: kn, sigma: false });
        for (const p of kn)
            S.push({
                id: p,
                titel: `Kaskade ${p} (im Schatten-Takt alle ${inv.schattenTakt[p] || "?"} Frames)`,
                art: "pass",
                passe: [p],
                sigma: false,
            });
    }
    if (inv.knoten.post)
        S.push({
            id: "post",
            titel: "Post-Kette aus: Direktpfad (TRAA + Nachbild + Szenen-Ziel → r184-Ausgabe)",
            art: "weiche",
            direkt: true,
            sigma: false,
        });
    if (inv.knoten.traa) {
        S.push({ id: "traa", titel: "TRAA (Resolve-Quad + Geschichts- und Tiefen-Kopie)", art: "knoten", traa: true, sigma: true });
        S.push({ id: "traaKopien", titel: "  davon die zwei Kopien im TRAA-Knoten", art: "knoten", traaKopien: true, sigma: false });
    }
    if (inv.knoten.tiefenkopie)
        S.push({
            id: "tiefenkopie",
            titel: "Szenen-Tiefen-Kopie (Kopie + Pass-Bruch im Hauptbild; Wasser/Feld-Pass lesen die alte)",
            art: "knoten",
            tiefenkopie: true,
            sigma: true,
        });
    const fehlend = [];
    if (inv.knoten.post) {
        S.push({
            id: "nachbild",
            titel: "Nachbild (Bloom · Godrays · Kontrast · Grading; die Ausgabe-Wandlung bleibt)",
            art: "kette",
            nachbild: true,
            sigma: false,
        });
        for (const st of KETTE) {
            if (!inv.kette || !inv.kette[st.uniform]) {
                fehlend.push(`${st.id}: keine Summe über ${st.uniform} in der Kette`);
                continue;
            }
            S.push({ id: st.id, titel: "  " + st.titel, art: "kette", stufe: st.uniform, sigma: true });
        }
    }
    const bekannt = new Set(["haupt", "post", "TRAA", ...kn]);
    const huellen = [];
    const unbekannt = [];
    for (const p of inv.passe) {
        if (bekannt.has(p.name)) continue;
        if (p.kinder.length) {
            huellen.push(`${p.name} (in ihr: ${p.kinder.join(", ")})`);
            continue;
        }
        unbekannt.push("pass:" + p.name);
        S.push({
            id: "pass:" + p.name,
            titel: `Pass ${p.name} (unbekannt, ${p.n}× im Zähl-Frame)`,
            art: "pass",
            passe: [p.name],
            sigma: true,
        });
    }
    const jeSchalter = new Map();
    // Klassen-Schalter nur für Täter der Spiel-Szene (Hauptbild und Kaskaden): ein Quad der Post-Kette oder ein fremder
    // Pass zeichnet ausserhalb der Szene — sein Posten ist der Pass- bzw. Knoten-Schalter.
    const szenenPass = (je) => Object.keys(je || {}).some((p) => p === "haupt" || /^k\d+$/.test(p));
    for (const e of inv.zensus.klassen) {
        if (!szenenPass(e.je)) continue;
        let id = null,
            titel = null;
        for (const sp of SPEZIAL)
            if (sp.muster.test(e.klasse)) {
                id = sp.id;
                titel = sp.titel;
                break;
            }
        if (!id) {
            const h = BAND.zuordnen(haushalt, BAND.einOf(e));
            if (h) {
                id = h;
                titel = (haushalt.klassen.find((x) => x.id === h) || {}).titel || h;
            }
        }
        if (!id) {
            id = "klasse:" + e.klasse;
            titel = "Täter ohne Haushalt-Klasse";
            unbekannt.push(id);
        }
        const s = jeSchalter.get(id) || { id, titel, art: "klasse", klassen: [], befehle: 0, sigma: true };
        s.klassen.push(e.klasse);
        s.befehle += e.cmd;
        jeSchalter.set(id, s);
    }
    S.push(...[...jeSchalter.values()].sort((a, b) => b.befehle - a.befehle));
    S.push({
        id: "leer",
        titel: "Untergrenze: Leinwand-Clear + Ausgabe (Direktpfad, nichts sichtbar, kein Schatten, kein unbekannter Pass)",
        art: "boden",
        direkt: true,
        alleKlassen: true,
        passe: [...kn, ...unbekannt.filter((x) => x.startsWith("pass:")).map((x) => x.slice(5))],
        sigma: false,
    });
    const nur = o.nur ? new Set(o.nur) : null;
    return {
        schalter: nur ? S.filter((s) => nur.has(s.id) || (o.unbekannteImmer && unbekannt.includes(s.id))) : S,
        huellen,
        unbekannt,
        fehlend,
    };
}

// DIE AUSWERTUNG je Schalter: Median der Differenzen (Wand · CPU · Stempel), Streuung als halbe Spannweite der
// Differenzen, der Beleg (Renders im AUS-Zustand, Haken-Treffer, Befehle der Klasse, Kollateral), Gesamt und Rest.
function zerlegeAuswerten(roh, schalter) {
    const med = (a) => {
        const s = a.filter(Number.isFinite).sort((x, y) => x - y);
        if (!s.length) return null;
        const m = s.length >> 1;
        return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
    };
    const r2 = (x) => (x == null ? null : +x.toFixed(2));
    const def = new Map(schalter.map((s) => [s.id, s]));
    const alleAn = [],
        alleAnCpu = [],
        alleAnSt = [];
    const zeilen = roh.schalter.map((e) => {
        const s = def.get(e.id) || {};
        const d = e.runden.map((x) => x.an.ms - x.aus.ms);
        for (const x of e.runden) {
            alleAn.push(x.an.ms);
            alleAnCpu.push(x.an.cpu);
            alleAnSt.push(x.an.stempel);
        }
        // Renders eines Passes in den Runden eines Zustands (die Pass-Uhr zählt je Runde); Haken-Treffer je Mess-Frame.
        const renders = (z, p) => e.runden.reduce((a, x) => a + ((x[z].zaehl[p] || {}).an || 0), 0);
        const jeFrame = +(e.runden.reduce((a, x) => a + (x.aus.treffer || 0), 0) / Math.max(1, e.runden.length * roh.n)).toFixed(2);
        const b = e.beleg || null;
        let geschaltet = null,
            beleg = "";
        if (s.alleKlassen) {
            const an = (b && b.passeAn.haupt && b.passeAn.haupt.cmd) || 0;
            const aus = (b && b.passeAus.haupt && b.passeAus.haupt.cmd) || 0;
            const post = renders("aus", "post");
            geschaltet = b ? an > 0 && aus === 0 && post === 0 : null;
            beleg = `Hauptbild-Befehle ${an}→${aus}, post ${renders("an", "post")}→${post}`;
        } else if (s.klassen) {
            // Eine fremde Klasse darf sich ein wenig mitbewegen (die Werfer-Wahl einer Region misst ihre Hülle aus den
            // sichtbaren Werfern — Wechselwirkung, benannt); mehr als 5 % der eigenen Befehle wäre ein Linsen-Fehler (ein
            // verborgenes Eltern-Objekt nähme eine fremde Klasse mit).
            geschaltet = b
                ? b.befehleAn > 0 && b.befehleAus === 0 && b.kollateral <= Math.max(2, 0.05 * b.befehleAn)
                : null;
            beleg = b
                ? `Befehle ${b.befehleAn}→${b.befehleAus}` +
                  (b.kollateral ? ` · Wechselwirkung ${b.kollateral} (${b.kollateralKlassen.join(", ")})` : "")
                : "";
            beleg += ` · ${e.objekte} Objekte`;
        } else if (s.passe) {
            const an = s.passe.reduce((a, p) => a + renders("an", p), 0);
            const aus = s.passe.reduce((a, p) => a + renders("aus", p), 0);
            geschaltet = an > 0 && aus === 0;
            beleg = `Renders ${an}→${aus}`;
        } else if (s.direkt) {
            const an = renders("an", "post"),
                aus = renders("aus", "post");
            geschaltet = an > 0 && aus === 0;
            beleg = `post ${an}→${aus}`;
        } else if (s.traa) {
            const an = renders("an", "TRAA"),
                aus = renders("aus", "TRAA");
            const hAus = renders("aus", "haupt");
            geschaltet = jeFrame > 0 && an > 0 && aus === 0 && hAus > 0;
            beleg = `TRAA ${an}→${aus}, Szene im AUS ${hAus}× gerendert, Haken ${jeFrame}/Frame`;
        } else if (s.traaKopien || s.tiefenkopie) {
            geschaltet = jeFrame > 0;
            beleg = `${jeFrame} Kopien/Frame unterdrückt`;
        } else if (s.nachbild || s.stufe) {
            const aAn = roh.abtastungenAn,
                aAus = b ? b.abtastungenAus : null;
            geschaltet = e.treffer > 0 && aAn != null && aAus != null ? aAus < aAn : e.treffer > 0 ? null : false;
            beleg = e.treffer > 0 ? `Abtastungen der Ausgabe ${aAn}→${aAus}` : "Kante nicht gefunden";
        }
        if (b && b.bildAenderungPct != null) beleg += ` · Bild ${b.bildAenderungPct} %`;
        const dMed = med(d);
        return {
            id: e.id,
            titel: s.titel,
            art: s.art,
            sigma: !!s.sigma,
            deltaMs: r2(dMed),
            // die Streuung robust: 1,4826 × Median der Abweichungen vom Median (ein Ausreißer-Paar unter Fremdlast kippt
            // sie nicht); die Spanne aller Differenzen steht daneben im JSON
            streuungMs: d.length ? r2(1.4826 * med(d.map((x) => Math.abs(x - dMed)))) : null,
            spanneMs: d.length ? [r2(Math.min(...d)), r2(Math.max(...d))] : null,
            deltas: d.map((x) => +x.toFixed(2)),
            anMs: r2(med(e.runden.map((x) => x.an.ms))),
            ausMs: r2(med(e.runden.map((x) => x.aus.ms))),
            deltaCpuMs: r2(med(e.runden.map((x) => x.an.cpu - x.aus.cpu))),
            deltaStempelMs: r2(med(e.runden.map((x) => x.an.stempel - x.aus.stempel))),
            stempelAn: e.runden.length ? e.runden[0].an.jePass : null,
            stempelAus: e.runden.length ? e.runden[0].aus.jePass : null,
            geschaltet,
            beleg,
            klassen: s.klassen || null,
        };
    });
    const gesamt = med(alleAn);
    const gesamtCpu = med(alleAnCpu);
    const gesamtSt = med(alleAnSt);
    for (const z of zeilen) z.anteilPct = gesamt && z.deltaMs != null ? +((100 * z.deltaMs) / gesamt).toFixed(1) : null;
    const sigma = zeilen.filter((z) => z.sigma && z.deltaMs != null).reduce((a, z) => a + z.deltaMs, 0);
    const leer = zeilen.find((z) => z.id === "leer");
    const leererFrame = leer && gesamt != null ? gesamt - leer.deltaMs : null;
    const rest = gesamt != null ? gesamt - sigma : null;
    // Die Stempel je Pass (alles an): Median über ALLE AN-Messungen des Laufs.
    const jePassAlle = {};
    for (const e of roh.schalter)
        for (const x of e.runden) for (const [p, ms] of Object.entries(x.an.jePass || {})) (jePassAlle[p] = jePassAlle[p] || []).push(ms);
    const stempelJePass = Object.fromEntries(Object.entries(jePassAlle).map(([p, v]) => [p, r2(med(v))]));
    return {
        n: roh.n,
        runden: roh.runden,
        gesamtMs: r2(gesamt),
        gesamtCpuMs: r2(gesamtCpu),
        gesamtStempelMs: r2(gesamtSt),
        stempelJePass,
        gpuGebunden: gesamt != null && gesamtCpu != null ? gesamt > gesamtCpu * 1.15 : null,
        sigmaMs: r2(sigma),
        restMs: r2(rest),
        leererFrameMs: r2(leererFrame),
        wechselwirkungMs: rest != null && leererFrame != null ? r2(rest - leererFrame) : null,
        zeilen,
        bildRauschenPct: roh.bildRauschenPct,
        zurueck: roh.zurueck,
        sekunden: roh.sekunden,
        fenster: roh.fenster || [],
    };
}

function zerlegeTabelle(a, inv, sch) {
    const f = (x, d = 2) => (x == null ? "–" : x.toFixed(d).replace(".", ","));
    const pad = (s, n) => String(s).padEnd(n);
    const lpad = (s, n) => String(s).padStart(n);
    const z = [];
    z.push(
        `DIE GPU-ZERLEGUNG — gpu-bank je Schalter, ABBA ${a.runden} Runden × ${a.n} Frames` +
            (inv
                ? ` · ${inv.adapter || "?"} · Leinwand ${inv.leinwand.join("×")} · Kamera ${inv.kamera.pos.join(" ")}`
                : "")
    );
    z.push(
        `Gesamt (alles an): ${f(a.gesamtMs)} ms/Frame · CPU-Haupt-Thread ${f(a.gesamtCpuMs)} ms · Pass-Stempel ` +
            `${f(a.gesamtStempelMs)} ms (${a.gesamtMs ? Math.round((100 * a.gesamtStempelMs) / a.gesamtMs) : "–"} %) · ` +
            `GPU-gebunden: ${a.gpuGebunden == null ? "?" : a.gpuGebunden ? "ja" : "NEIN (die Wand trägt der Haupt-Thread)"}`
    );
    if (a.stempelJePass)
        z.push(
            "Stempel je Pass (an): " +
                Object.entries(a.stempelJePass)
                    .map(([p, ms]) => `${p} ${f(ms)}`)
                    .join(" · ")
        );
    z.push("");
    z.push(
        pad("Schalter", 18) +
            " Σ " +
            lpad("Δ ms", 7) +
            lpad("±σ", 6) +
            lpad("Anteil", 8) +
            lpad("Δ CPU", 7) +
            lpad("Δ Stempel", 10) +
            "  geschaltet · Beleg"
    );
    for (const r of a.zeilen)
        z.push(
            pad(r.id, 18) +
                (r.sigma ? " • " : "   ") +
                lpad(f(r.deltaMs), 7) +
                lpad(f(r.streuungMs), 6) +
                lpad(r.anteilPct == null ? "–" : f(r.anteilPct, 1) + " %", 8) +
                lpad(f(r.deltaCpuMs), 7) +
                lpad(f(r.deltaStempelMs), 10) +
                "  " +
                (r.geschaltet == null ? "?" : r.geschaltet ? "ja" : "NEIN") +
                " · " +
                r.beleg
        );
    z.push("");
    z.push(`Σ der •-Posten:      ${f(a.sigmaMs)} ms (${a.gesamtMs ? f((100 * a.sigmaMs) / a.gesamtMs, 1) : "–"} %)`);
    z.push(
        `Rest = Gesamt − Σ:   ${f(a.restMs)} ms` +
            (a.leererFrameMs != null
                ? ` = leerer Frame ${f(a.leererFrameMs)} ms (Schalter leer) + Wechselwirkung/geteilt ${f(a.wechselwirkungMs)} ms`
                : "")
    );
    z.push(
        "  (Geteiltes fällt erst, wenn ALLE Teilhaber fallen: Pass-Anfänge und Clears, Uniform-Uploads, Bundle-Ausführung;" +
            " jeder Klassen-Posten trägt seinen Schatten-Wurf mit — darum stehen haupt · schatten · k* · post · traaKopien ·" +
            " nachbild · leer außerhalb Σ.)"
    );
    if (sch && (sch.huellen.length || sch.fehlend.length))
        z.push(
            "Ohne Schalter: " +
                [...sch.huellen.map((h) => "Hülle " + h), ...sch.fehlend].join(" · ")
        );
    if (inv && inv.anatomie) {
        const A = inv.anatomie;
        const liste = (arr, k, mitZiel) =>
            arr
                .slice(0, k)
                .map(
                    (e) =>
                        `${e.was} ${f(e.n, 1)}×${e.mb ? " " + f(e.mb, 2) + " MB" : ""}${mitZiel && e.ziele ? " [" + e.ziele + "]" : ""}`
                )
                .join(" · ") || "keine";
        z.push("");
        z.push(`FRAME-ANATOMIE je Frame (${A.frames} Bank-Frames, alles an):`);
        z.push(`  Render-Pässe (${f(A.renderSumme.n, 1)}×, Ziele ${f(A.renderSumme.mb, 1)} MB):`);
        for (const e of A.renderPaesse.slice(0, 16))
            z.push(`    ${e.was} ${f(e.n, 1)}× · ${f(e.mb, 1)} MB · ${e.ziele || "?"}`);
        z.push(`  Stempel-Bruch (Neustart überschreibt den Anfangs-Stempel): ${liste(A.stempelBruch, 8)}`);
        z.push(`  ohne Zeitstempel: ${liste(A.ungestempelt, 8)}`);
        z.push(`  Compute-Pässe: ${liste(A.computePaesse, 6)} · Dispatches ${f(A.dispatches, 1)}`);
        z.push(`  Kopien (${f(A.kopienSumme.n, 1)}×, ${f(A.kopienSumme.mb, 2)} MB): ${liste(A.kopien, 10)}`);
        z.push(`  Hochladen (${f(A.hochladenSumme.n, 1)}×, ${f(A.hochladenSumme.mb, 2)} MB): ${liste(A.hochladen, 10)}`);
        z.push(
            `  Submits ${f(A.submits, 1)} (Befehls-Puffer ${f(A.befehlsPuffer, 1)}) · executeBundles ${f(A.executeBundles, 1)}` +
                ` (${f(A.bundles, 1)} Bundles) · setPipeline ${f(A.setPipeline, 1)} · setBindGroup ${f(A.setBindGroup, 1)}` +
                ` · Leinwand ${f(A.leinwand, 1)}`
        );
        z.push(`  direkte Draws: ${liste(A.draws, 10)}`);
        z.push(
            "  Anlagen je Frame: " +
                (Object.entries(A.anlegen)
                    .map(([k, v]) => `${k} ${f(v, 1)}`)
                    .join(" · ") || "keine")
        );
    }
    z.push("");
    const geschluckt = (a.fenster || []).filter((e) => e.geschluckt);
    const echt = (a.fenster || []).filter((e) => !e.geschluckt);
    if (geschluckt.length)
        z.push(
            `Fenster-Ereignis ohne Größenänderung geschluckt: ${geschluckt.map((e) => `${e.s} s (${e.schalter})`).join(" · ")}` +
                " (fremd; die Welt blieb dieselbe)"
        );
    if (echt.length)
        z.push(
            `FREMDES FENSTER-EREIGNIS MIT GRÖSSENÄNDERUNG: ${echt.map((e) => `${e.s} s (${e.schalter})`).join(" · ")} — die` +
                " Welt änderte sich (neue Leinwand, Szenen-Tiefe und Tiefen-Abbild); dieser Lauf" +
                " vergleicht keine gleichen Welten, neu messen"
        );
    z.push(
        a.zurueck && a.zurueck.length
            ? `ZUSTAND NICHT ZURÜCK: ${a.zurueck.join(" · ")}`
            : `Zustand zurück (Sichtbarkeit, Weiche, Knoten-Haken, Ausgabe-Knoten, Pipeline-Kontext, Ketten-Graph, Pass-Uhr,` +
                  ` Prototypen, Schatten-Flaggen) · ${a.sekunden} s`
    );
    return z.join("\n");
}

module.exports = {
    // der exakt zurückstellende Haken — der Ziel-Zensus (scripts/lib/ziel-zensus.cjs) hakt mit demselben
    haken,
    SPEZIAL,
    KETTE,
    zerlegeSchalter,
    zerlegeAuswerten,
    zerlegeTabelle,
    ZERLEGE_INSTALL:
        `window.__passUhr = (function(){ const haken = ${haken.toString()}; return ${passUhr.toString()}; })();` +
        `window.__bankRunde = ${bankRunde.toString()};` +
        `window.__stempelWache = ${stempelWache.toString()};` +
        `window.__frameAnatomie = (function(){ const haken = ${haken.toString()}; return ${frameAnatomie.toString()}; })();` +
        `window.__knotenKinder = ${knotenKinder.toString()};` +
        `window.__ketteKante = (function(){ const knotenKinder = window.__knotenKinder; return ${ketteKante.toString()}; })();` +
        `window.__ketteHash = (function(){ const knotenKinder = window.__knotenKinder; return ${ketteHash.toString()}; })();` +
        `window.__ketteAbtastungen = (function(){ const knotenKinder = window.__knotenKinder; return ${ketteAbtastungen.toString()}; })();` +
        `window.__zerlegeZustand = ${zerlegeZustand.toString()};` +
        `window.__zerlegeVergleich = ${zerlegeVergleich.toString()};` +
        `window.__zerlegeInventur = ${zerlegeInventur.toString()};` +
        `window.__zerlegeMessen = (function(){ const haken = ${haken.toString()}; return ${zerlegeMessen.toString()}; })();` +
        `window.__zerlegeLast = (function(){ const haken = ${haken.toString()}; return ${zerlegeLast.toString()}; })();`,
};
