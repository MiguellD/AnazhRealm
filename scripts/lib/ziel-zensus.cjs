// ziel-zensus.cjs — DER ZIEL-ZENSUS (Gebot 10: die Linse nennt den Täter beim Namen; Auftrag 0710-1 P2, Familie HOST-VRAM).
// Befund 07.10. (OMEN, GTX 1060, V18.534, Mess-Wiese, 8 Boots): VRAM 149,4 MB gegen das Band 118 MB — davon tragen die
// Bildschirm-Ziele 71,1 MB und die Kaskaden 24,0 MB, und die Behauptung „die Post-Kette ist das Minimum für TRAA unter r184"
// stand ohne Beweis. `werkbank band` nennt den VRAM je Erzeuger, `werkbank zerlegen` die Zeit je Verbraucher — wer eine
// Textur LIEST, nannte keine Linse. Dieser Zensus fährt n echte Frames (die gpu-bank-Runde der Zerleg-Linse) und hält jede
// GPU-Textur des Hosts mit Name · Format · Größe · Bytes · Erzeuger (Stamm-Methode oder Vendor-Klasse) und jedem Zugriff
// je Pass fest: Schreiben (Farb-Ziel, Kopie, Hochladen), Lesen (ein Draw oder ein Bündel bindet sie, eine Kopie liest sie,
// ein Pass lädt ihren Inhalt), die Tiefe eines Passes (getestet · geschrieben · ungenutzt). Daraus urteilt er — Node, rein,
// mit Selbsttest — über die Täter-Klassen:
//   OHNE LESER        ein Ziel wird geschrieben, kein Pass liest es (im Fenster von n Frames)
//   TEILBAR           zwei Ziele derselben Form leben in keinem Frame zugleich und tragen keinen Inhalt über den Frame —
//                     ein Ziel trüge beide (Ping-Pong-Klasse)
//   VOLLE AUFLÖSUNG   ein Ziel in Leinwand-Größe für einen niederfrequenten Effekt (Bloom, Godrays, Nachbild, Weichzeichner)
//   TIEFE             eine Tiefe, die kein Pass testet, schreibt oder liest — oder eine Tiefen-Kopie, die gelesen wird,
//                     während ihre Quelle unverändert und frei lesbar ist (doppelte Tiefe)
//   FORMAT            ein 32-bit-Float-Ziel, dessen Inhalt jeden Wert exakt in 16 bit trägt (die Hälfte reicht)
//   ERZEUGER/ZENSUS   die Linse selbst: eine Textur ohne Erzeuger, ein Bündel ohne bekannten Inhalt, zu wenig Frames
// Hinweise (nie rot): eine Textur ruht im Fenster; ein Kanal ist an diesem Ort konstant; ein 32-bit-Float verlöre in 16 bit
// so viel.
// DER GRUND: was eine Bind-Gruppe, ein Bündel, eine Pipeline lesen, merkt sich der VRAM-Abgriff beim Anlegen
// (scripts/lib/vram-abgriff.cjs) — im Frame zählt der Zensus nur über Haken an den WebGPU-Prototypen, und nur im Fenster
// (exakt zurück, wie die Frame-Anatomie der Zerleg-Linse). Die Pass-Namen liest die Pass-Uhr am Chokepoint `_renderScene`.
// DER SELBSTTEST: Node (`selbsttest()`: je Klasse ein gebauter Täter, ein sauberer Lauf) und im echten Frame
// (`__zielSchmuggel`: je Klasse ein eingeschmuggelter Täter nach jedem `_loopRender` — er muss beim Namen rot fallen und nach
// dem Abbau verschwinden).
//   Seite:     window.__zielZensus({ n }) · __zielLesen({ ids }) · __zielSchmuggel(an)
//   Werkbank:  node scripts/werkbank.cjs ziele [--n frames] [--json datei] [--selbsttest]
//   Wand:      npm run gate:ziel-zensus (scripts/diag-ziel-zensus.cjs)
"use strict";

const { haken } = require("./zerlege-linse.cjs");

// Die Effekte, deren Bild niederfrequent ist: ein Ziel in Leinwand-Größe für sie trägt Pixel, die keiner sieht.
const NIEDERFREQUENT = /bloom|godray|nachbild|blur|glow|halo|unsch(ä|ae)rfe|weichzeichn/i;
// Die Vendor-Erzeuger (ihr Name steht in r184 oder vendor/, nicht im Stamm): Quelle und der Stamm-Ausdruck, der sie anlegt.
const VENDOR = [
    { muster: /^TRAANode\./, quelle: "vendor/TRAANode.js", such: "THREE.TRAANode(" },
    { muster: /^(output|depth)$/, quelle: "r184 PassNode", such: "pass(this.state.scene" },
    { muster: /^PMREM\./, quelle: "r184 PMREMGenerator", such: "PMREMGenerator" },
    { muster: /^DFG_LUT$/, quelle: "r184 (Umgebungs-Tafel)", such: null },
    { muster: /^r184-ausgabe/, quelle: "r184 Renderer (Rahmen-Ziel)", such: null },
    { muster: /^zensus-selbsttest/, quelle: "ziel-zensus Selbsttest", such: null },
    { muster: /^zerlege-selbsttest/, quelle: "zerlege-linse Selbsttest", such: null },
];

// ── Seite ────────────────────────────────────────────────────────────────────────────────────────────────────────────

// DER ZENSUS: n Frames der gpu-bank-Runde mit Haken an jedem Pass, Draw, Bündel und jeder Kopie; danach jede lebende
// Textur des Renderers (`info.memoryMap`) und jede, die im Fenster einen Zugriff trug, mit ihren Ereignissen.
function zielZensus(k) {
    return (async () => {
        const r = window.anazhRealm;
        const st = r.state;
        const rend = st.renderer;
        const be = rend && rend.backend;
        if (!be || be.isWebGPUBackend !== true) return { fehler: "kein WebGPU-Backend — der Zensus liest GPU-Befehle" };
        if (!window.__gruppeTex || !window.__viewTex || !window.__pipeTiefe || !window.__buendelInhalt)
            return { fehler: "der VRAM-Abgriff mit Zensus-Grund fehlt (scripts/lib/vram-abgriff.cjs vor dem Seiten-Skript)" };
        // DIE RUHE DER ERST-ZEICHNUNG zuerst (Integration K haenger × host-vram, 07.10.): eine erste Zeichnung lässt ihre
        // Pipeline asynchron entstehen — ein Leser, dessen Pipeline noch offen ist, zeichnet in den n Frames nicht, und sein
        // Ziel stand „OHNE LESER" (portal-membran, geschrieben beim Hochladen, gelesen erst nach der Pipeline). Gezählt wird
        // das angekommene Bild: dieselbe Regel wie die Ausgabe-Aufnahme (`__erstRuhe`, scripts/lib/ausgabe-aufnahme.cjs).
        if (typeof window.__erstRuhe !== "function")
            return { fehler: "die Ruhe der Erst-Zeichnung fehlt (AUSGABE_INSTALL aus scripts/lib/ausgabe-aufnahme.cjs)" };
        let erst;
        try {
            erst = await window.__erstRuhe(
                () => {
                    if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
                    r._loopRender(performance.now());
                },
                k,
                "der Zensus"
            );
        } catch (e) {
            return { fehler: String((e && e.message) || e) };
        }
        const n = Math.max(3, Number(k && k.n) || 12);
        const uhr = window.__passUhr();
        const ab = [];
        let seq = 0,
            frame = 0,
            passId = 0,
            blind = 0,
            pipeBlind = 0;
        const ev = new Map();
        const buche = (t, e) => {
            if (!t) return null;
            let l = ev.get(t);
            if (!l) ev.set(t, (l = []));
            e.s = ++seq;
            e.f = frame;
            l.push(e);
            return e;
        };
        const passName = () => uhr.stapel[uhr.stapel.length - 1] || "ausserhalb";
        const vt = window.__viewTex,
            gt = window.__gruppeTex,
            pt = window.__pipeTiefe,
            bi = window.__buendelInhalt;
        // Gehakt wird am Prototyp UND an jedem Exemplar, das die Methode selbst trägt (wie die Frame-Anatomie); ein Aufruf
        // zählt einmal, auch wenn eine Hülle die nächste ruft.
        const exemplare = [be.device, be.device && be.device.queue].filter(Boolean);
        const tief = {};
        const hake = (proto, key, nach) => {
            if (!proto || typeof proto[key] !== "function") return;
            const ziele = [proto];
            for (const x of exemplare)
                if (Object.prototype.hasOwnProperty.call(x, key) && proto.isPrototypeOf(x)) ziele.push(x);
            for (const o of ziele) {
                const roh = o[key];
                ab.push(
                    haken(o, key, function (...a) {
                        const oben = !tief[key];
                        tief[key] = (tief[key] || 0) + 1;
                        try {
                            const aus = roh.apply(this, a);
                            if (oben)
                                try {
                                    nach.call(this, a, aus);
                                } catch (_e) {}
                            return aus;
                        } finally {
                            tief[key]--;
                        }
                    })
                );
            }
        };
        const CE = window.GPUCommandEncoder && GPUCommandEncoder.prototype;
        const RP = window.GPURenderPassEncoder && GPURenderPassEncoder.prototype;
        const Q = window.GPUQueue && GPUQueue.prototype;
        // Ein Render-Pass: seine Farb-Ziele schreiben ab Beginn (eine Lade-Art „load" liest zuvor den alten Inhalt), seine
        // Tiefe bucht ihr Ereignis am Beginn und urteilt am Ende (geschrieben · getestet · ungenutzt), was seine Pipelines taten.
        hake(CE, "beginRenderPass", function (a, p) {
            const d = a[0] || {};
            const z = { id: ++passId, name: passName(), gruppen: [], gelesen: new Set(), pipe: null, tE: null };
            for (const c of d.colorAttachments || []) {
                const t = c && vt.get(c.view);
                if (!t) continue;
                if (c.loadOp === "load") buche(t, { art: "L", pass: z.name, pid: z.id, via: "farbe" });
                buche(t, { art: "W", pass: z.name, pid: z.id, via: "farbe" });
            }
            const ds = d.depthStencilAttachment;
            const t = ds && vt.get(ds.view);
            if (t) {
                if (ds.depthLoadOp === "load") buche(t, { art: "L", pass: z.name, pid: z.id, via: "tiefe" });
                z.tE = buche(t, { art: "A", pass: z.name, pid: z.id, via: "tiefe" });
            }
            if (p) p.__zz = z;
        });
        const lies = (z, g) => {
            const tex = gt.get(g);
            if (!tex) return;
            for (const t of tex)
                if (!z.gelesen.has(t)) {
                    z.gelesen.add(t);
                    buche(t, { art: "R", pass: z.name, pid: z.id, via: "zeichnen" });
                }
        };
        const pipe = (z, p) => {
            const i = pt.get(p);
            if (!i) return pipeBlind++;
            if (i.testet) z.nutzt = true;
            if (i.schreibt) z.schreibt = true;
        };
        const zeichnet = function () {
            const z = this.__zz;
            if (!z) return;
            for (const g of z.gruppen) if (g) lies(z, g);
            if (z.pipe) pipe(z, z.pipe);
        };
        hake(RP, "setBindGroup", function (a) {
            const z = this.__zz;
            if (z && a[1]) z.gruppen[a[0]] = a[1];
        });
        hake(RP, "setPipeline", function (a) {
            const z = this.__zz;
            if (z) z.pipe = a[0];
        });
        for (const key of ["draw", "drawIndexed", "drawIndirect", "drawIndexedIndirect"]) hake(RP, key, zeichnet);
        hake(RP, "executeBundles", function (a) {
            const z = this.__zz;
            if (!z) return;
            for (const b of a[0] || []) {
                const inh = bi.get(b);
                if (!inh) {
                    blind++;
                    continue;
                }
                for (const g of inh.gruppen) lies(z, g);
                for (const p of inh.pipes) pipe(z, p);
            }
        });
        hake(RP, "end", function () {
            const z = this.__zz;
            if (!z) return;
            if (z.tE) z.tE.art = z.schreibt ? "W" : z.nutzt ? "T" : "O";
            this.__zz = null;
        });
        hake(CE, "copyTextureToTexture", function (a) {
            const s = a[0] && a[0].texture,
                d = a[1] && a[1].texture;
            const p = passName();
            buche(s, { art: "R", pass: p, via: "kopie" });
            const e = buche(d, { art: "W", pass: p, via: "kopie" });
            if (e && s) e.von = s;
        });
        hake(CE, "copyTextureToBuffer", function (a) {
            buche(a[0] && a[0].texture, { art: "R", pass: passName(), via: "auslesen" });
        });
        hake(CE, "copyBufferToTexture", function (a) {
            buche(a[1] && a[1].texture, { art: "W", pass: passName(), via: "hochladen" });
        });
        hake(Q, "writeTexture", function (a) {
            buche(a[0] && a[0].texture, { art: "W", pass: passName(), via: "hochladen" });
        });
        hake(Q, "copyExternalImageToTexture", function (a) {
            buche(a[1] && a[1].texture, { art: "W", pass: passName(), via: "hochladen" });
        });
        const loopRoh = r._loopRender;
        ab.push(
            haken(r, "_loopRender", function (...a) {
                frame++;
                return loopRoh.apply(this, a);
            })
        );
        try {
            await window.__bankRunde(n);
        } finally {
            while (ab.length) ab.pop()();
            uhr.ab();
        }
        await uhr.lesen();
        // DIE TEXTUREN: jede lebende des Renderers (three-Objekt → GPU-Textur) und jede GPU-Textur mit einem Zugriff.
        const eintraege = new Map();
        for (const [t, v] of rend.info.memoryMap) {
            if (!t || !t.isTexture || !be.has(t)) continue;
            const d = be.get(t);
            for (const g of [d.texture, d.msaaTexture]) if (g && !eintraege.has(g)) eintraege.set(g, t);
        }
        for (const g of ev.keys()) if (!eintraege.has(g)) eintraege.set(g, null);
        // DER ERZEUGER: die Stamm-Methode, die den Namen als Literal trägt (Name, Stamm vor „:", ohne Ziffern am Ende), sonst
        // die Vendor-Klasse samt der Stamm-Methode, die sie anlegt.
        const P = Object.getPrototypeOf(r);
        const quellen = [];
        for (const key of Object.getOwnPropertyNames(P)) {
            // der Konstruktor einer Klasse nennt als Quelltext die GANZE Klasse — er wäre der Erzeuger von allem
            if (key === "constructor") continue;
            const dsk = Object.getOwnPropertyDescriptor(P, key);
            if (dsk && typeof dsk.value === "function") quellen.push([key, Function.prototype.toString.call(dsk.value)]);
        }
        for (const key of Object.getOwnPropertyNames(r.constructor)) {
            const f = r.constructor[key];
            if (key !== "prototype" && typeof f === "function")
                quellen.push(["AnazhRealm." + key, Function.prototype.toString.call(f)]);
        }
        const suche = (lit) => {
            if (!lit) return null;
            for (const [key, src] of quellen) if (src.includes(lit)) return key;
            return null;
        };
        const vendor = k.vendor || [];
        const erzeuger = (name) => {
            if (!name) return null;
            for (const v of vendor)
                if (new RegExp(v.muster).test(name)) return { quelle: v.quelle, methode: suche(v.such) };
            const stamm = name.split(":")[0];
            for (const c of [name, stamm, stamm.replace(/\d+$/, "")]) {
                if (!c) continue;
                const m = suche('"' + c) || suche("'" + c) || suche("`" + c);
                if (m) return { quelle: "anazhRealm.js", methode: m };
            }
            return null;
        };
        const liste = [];
        const idVon = new Map();
        for (const g of eintraege.keys()) {
            idVon.set(g, liste.length);
            liste.push(g);
        }
        window.__zielListe = liste;
        const db = rend.getDrawingBufferSize(new window.THREE.Vector2());
        const ziele = liste.map((g, id) => {
            const t = eintraege.get(g);
            const name =
                (t && window.__texturErzeuger ? window.__texturErzeuger(t) : null) ||
                String(g.__vramK || g.label || "")
                    .split(" ")[0]
                    .replace(/^tex:/, "") ||
                null;
            return {
                id,
                name,
                erzeuger: erzeuger(name),
                format: g.format,
                w: g.width,
                h: g.height,
                schichten: g.depthOrArrayLayers,
                mips: g.mipLevelCount,
                proben: g.sampleCount,
                dim: g.dimension,
                ziel: (g.usage & GPUTextureUsage.RENDER_ATTACHMENT) !== 0,
                kopierbar: (g.usage & GPUTextureUsage.COPY_SRC) !== 0,
                tiefe: /^depth|stencil/.test(g.format),
                bytes: (g.__vramH && g.__vramH.b) || 0,
                // eine Leinwand-Textur legt der Kontext an, nicht das Gerät — der Abgriff kennt sie nicht
                leinwand: !g.__vramH,
                ereignisse: (ev.get(g) || []).map((e) =>
                    Object.assign(
                        { s: e.s, f: e.f, art: e.art, pass: e.pass, via: e.via },
                        e.pid !== undefined ? { pid: e.pid } : {},
                        e.von ? { von: idVon.has(e.von) ? idVon.get(e.von) : -1 } : {}
                    )
                ),
            };
        });
        return { frames: frame, n, leinwand: [Math.round(db.x), Math.round(db.y)], blind, pipeBlind, ziele, erst };
    })();
}

// DAS LESEN: der Inhalt der Farb-Texturen (mip 0, jede Schicht) zurück — je Kanal Minimum und Maximum, und je 32-bit-Float,
// ob jeder Wert exakt in 16 bit liegt (sonst der größte Fehler, absolut und relativ).
function zielLesen(k) {
    return (async () => {
        const liste = window.__zielListe || [];
        const dev = window.anazhRealm.state.renderer.backend.device;
        const FORM = {
            r8unorm: [1, 1, "u8"],
            rg8unorm: [2, 1, "u8"],
            rgba8unorm: [4, 1, "u8"],
            "rgba8unorm-srgb": [4, 1, "u8"],
            bgra8unorm: [4, 1, "u8"],
            "bgra8unorm-srgb": [4, 1, "u8"],
            r16float: [1, 2, "f16"],
            rg16float: [2, 2, "f16"],
            rgba16float: [4, 2, "f16"],
            r32float: [1, 4, "f32"],
            rg32float: [2, 4, "f32"],
            rgba32float: [4, 4, "f32"],
        };
        const h16 = typeof Float16Array === "function" ? new Float16Array(1) : null;
        const aus = [];
        for (const id of (k && k.ids) || []) {
            const t = liste[id];
            const f = t && FORM[t.format];
            if (!t || !f || t.sampleCount > 1 || t.dimension !== "2d" || !(t.usage & GPUTextureUsage.COPY_SRC)) {
                aus.push({ id, gelesen: false });
                continue;
            }
            const [ch, bpc, typ] = f;
            const w = t.width,
                h = t.height,
                L = t.depthOrArrayLayers || 1;
            const bpr = Math.ceil((w * ch * bpc) / 256) * 256;
            if (bpr * h * L > 96 * 1048576) {
                aus.push({ id, gelesen: false, grund: "zu groß" });
                continue;
            }
            const buf = dev.createBuffer({
                size: bpr * h * L,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
                label: "ziel-zensus:lesen",
            });
            const enc = dev.createCommandEncoder({ label: "ziel-zensus:lesen" });
            enc.copyTextureToBuffer(
                { texture: t },
                { buffer: buf, bytesPerRow: bpr, rowsPerImage: h },
                { width: w, height: h, depthOrArrayLayers: L }
            );
            dev.queue.submit([enc.finish()]);
            await buf.mapAsync(GPUMapMode.READ);
            const roh = buf.getMappedRange();
            const min = new Array(ch).fill(Infinity),
                max = new Array(ch).fill(-Infinity);
            let exakt = typ === "f32" && !!h16,
                maxAbs = 0,
                maxRel = 0,
                ueber = 0;
            const lese =
                typ === "u8"
                    ? new Uint8Array(roh)
                    : typ === "f16"
                      ? typeof Float16Array === "function"
                          ? new Float16Array(roh)
                          : null
                      : new Float32Array(roh);
            if (lese) {
                const proZeile = bpr / bpc;
                for (let l = 0; l < L; l++)
                    for (let y = 0; y < h; y++) {
                        const o = (l * h + y) * proZeile;
                        for (let x = 0; x < w * ch; x++) {
                            const v = lese[o + x];
                            const c = x % ch;
                            if (v < min[c]) min[c] = v;
                            if (v > max[c]) max[c] = v;
                            if (typ === "f32" && h16 && Number.isFinite(v)) {
                                // über dem größten 16-bit-Wert (65 504) läuft die Hälfte über — ein Wert, den sie nie trägt
                                if (Math.abs(v) > 65504) {
                                    exakt = false;
                                    ueber++;
                                    continue;
                                }
                                h16[0] = v;
                                const dv = Math.abs(h16[0] - v);
                                if (dv > 0) {
                                    exakt = false;
                                    if (dv > maxAbs) maxAbs = dv;
                                    const rel = dv / Math.max(Math.abs(v), 1e-30);
                                    if (rel > maxRel) maxRel = rel;
                                }
                            }
                        }
                    }
            }
            buf.unmap();
            buf.destroy();
            aus.push({
                id,
                gelesen: !!lese,
                min,
                max,
                f16exakt: typ === "f32" && h16 ? exakt : null,
                f16maxAbs: typ === "f32" ? maxAbs : null,
                f16maxRel: typ === "f32" ? maxRel : null,
                f16ueberlauf: typ === "f32" ? ueber : null,
            });
        }
        return aus;
    })();
}

// DER EINGESCHMUGGELTE TÄTER (Selbsttest im echten Frame): nach jedem `_loopRender` zeichnet je Klasse ein Täter — ein Ziel
// ohne Leser, ein Bloom-Ziel in Leinwand-Größe, zwei Ziele gleicher Form nacheinander, eine Tiefen-Kopie der Szenen-Tiefe,
// die ein späterer Pass liest, während die Szenen-Tiefe ruht, und ein 32-bit-Float mit 16-bit-Inhalt. `an` = false baut alles
// restlos ab.
function zielSchmuggel(an) {
    const r = window.anazhRealm;
    const rend = r.state.renderer;
    const T = window.THREE;
    const TSL = T.TSL;
    const S = window.__zielSchmuggelStand;
    if (!an) {
        if (!S) return { ab: false };
        S.ab();
        for (const x of S.weg) x.dispose();
        window.__zielSchmuggelStand = null;
        return { ab: true };
    }
    if (S) return { fehler: "der Schmuggel steht schon" };
    const tiefe =
        r.state.scenePass && r.state.scenePass.getTextureNode ? r.state.scenePass.getTextureNode("depth").value : null;
    if (!tiefe) return { fehler: "keine Szenen-Tiefe (Post-Kette fehlt)" };
    const db = rend.getDrawingBufferSize(new T.Vector2());
    const W = Math.max(1, Math.round(db.x)),
        H = Math.max(1, Math.round(db.y));
    const weg = [];
    const ziel = (name, w, h, o) => {
        const z = new T.RenderTarget(w, h, Object.assign({ depthBuffer: false }, o || {}));
        z.texture.name = name;
        weg.push(z);
        return z;
    };
    const ohneLeser = ziel("zensus-selbsttest:ohne-leser", 64, 64);
    const bloom = ziel("zensus-selbsttest:bloom", W, H, { type: T.HalfFloatType });
    const leser = ziel("zensus-selbsttest:leser", 8, 8);
    const paarA = ziel("zensus-selbsttest:paar-a", 128, 128);
    const paarB = ziel("zensus-selbsttest:paar-b", 128, 128);
    const kopie = ziel("zensus-selbsttest:kopie-ziel", 4, 4, { depthBuffer: true });
    kopie.setSize(W, H);
    kopie.depthTexture = new T.DepthTexture(W, H);
    kopie.depthTexture.name = "zensus-selbsttest:tiefe-kopie";
    const daten = new Float32Array(64 * 64 * 4);
    for (let i = 0; i < daten.length; i++) daten[i] = (i % 9) / 8;
    const f32 = new T.DataTexture(daten, 64, 64, T.RGBAFormat, T.FloatType);
    f32.name = "zensus-selbsttest:f32";
    f32.needsUpdate = true;
    weg.push(f32);
    const stoff = (knoten) => {
        const m = new T.MeshBasicNodeMaterial();
        m.name = "zensus-selbsttest";
        if (knoten) m.colorNode = knoten;
        else m.color = new T.Color(0x33aa55);
        weg.push(m);
        return m;
    };
    const farbe = stoff(null);
    const liesBloom = stoff(TSL.texture(bloom.texture));
    const liesA = stoff(TSL.texture(paarA.texture));
    const liesB = stoff(TSL.texture(paarB.texture));
    const liesF32 = stoff(TSL.texture(f32));
    const liesTiefe = stoff(TSL.vec4(TSL.texture(kopie.depthTexture).r, 0, 0, 1));
    const szene = new T.Scene();
    szene.name = "zensus-selbsttest";
    const kamera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const flaeche = new T.Mesh(new T.PlaneGeometry(2, 2), farbe);
    flaeche.frustumCulled = false;
    flaeche.position.z = -0.5;
    szene.add(flaeche);
    weg.push(flaeche.geometry);
    rend.initRenderTarget(kopie);
    const zeichne = (z, m) => {
        flaeche.material = m;
        rend.setRenderTarget(z);
        rend.render(szene, kamera);
    };
    const P = Object.getPrototypeOf(r);
    const ab = haken(r, "_loopRender", function (t) {
        const o = P._loopRender.call(this, t);
        const vor = rend.getRenderTarget();
        try {
            zeichne(ohneLeser, farbe);
            zeichne(bloom, farbe);
            zeichne(leser, liesBloom);
            zeichne(paarA, farbe);
            zeichne(leser, liesA);
            zeichne(paarB, farbe);
            zeichne(leser, liesB);
            zeichne(leser, liesF32);
            rend.copyTextureToTexture(tiefe, kopie.depthTexture);
            zeichne(leser, liesTiefe);
        } finally {
            rend.setRenderTarget(vor);
        }
        return o;
    });
    window.__zielSchmuggelStand = { ab, weg };
    return { an: true, leinwand: [W, H] };
}

// ── Node ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

const mb = (b) => +((b || 0) / 1048576).toFixed(2);
const form = (x) => `${x.format} ${x.w}×${x.h}${x.schichten > 1 ? "×" + x.schichten : ""}`;
const erzText = (x) =>
    x.erzeuger ? x.erzeuger.quelle + (x.erzeuger.methode ? " · " + x.erzeuger.methode : "") : "Erzeuger ?";
const paesse = (l) => [...new Set(l.map((e) => e.pass + (e.via === "kopie" ? " (Kopie)" : "")))].join(", ") || "—";

// Trägt ein Ziel Inhalt über den Frame? Ja, wenn in einem Frame sein erster Zugriff ein Lesen ist (Draw, Kopie, Laden,
// Tiefentest ohne vorheriges Schreiben im selben Frame) — dann lebt es von Frame zu Frame.
function traegt(x) {
    const erst = new Map();
    for (const e of x.ereignisse || []) if (!erst.has(e.f)) erst.set(e.f, e);
    for (const e of erst.values()) if (e.art === "R" || e.art === "L" || e.art === "T") return true;
    return false;
}

// Die Lebenszeit je Frame: [erster, letzter Zugriff] in der Folge aller Zugriffe.
function lebenszeit(x) {
    const m = new Map();
    for (const e of x.ereignisse || []) {
        const i = m.get(e.f);
        if (!i) m.set(e.f, [e.s, e.s]);
        else {
            if (e.s < i[0]) i[0] = e.s;
            if (e.s > i[1]) i[1] = e.s;
        }
    }
    return m;
}

// DAS URTEIL (rein): z = Antwort von `__zielZensus`, lesen = Antwort von `__zielLesen`.
function zielUrteil(z, lesen) {
    const rot = [],
        hinweis = [];
    if (!z || z.fehler) return { rot: ["ZENSUS: " + ((z && z.fehler) || "keine Antwort der Seite")], hinweis, zeilen: [] };
    const ziele = z.ziele || [];
    const byId = new Map(ziele.map((x) => [x.id, x]));
    const klasse = new Map(ziele.map((x) => [x.id, []]));
    const nenne = (x, k, text) => {
        klasse.get(x.id).push(k);
        rot.push(text);
    };
    if (!(z.frames >= 3)) rot.push(`ZENSUS: nur ${z.frames} Frames im Fenster — die Linse sieht keine Lebenszeit`);
    if (z.blind > 0)
        rot.push(
            `ZENSUS: ${z.blind} Bündel ohne bekannten Inhalt — der Abgriff lief nicht ab Dokument-Start, die Linse ist blind`
        );
    if (!ziele.some((x) => (x.ereignisse || []).length))
        rot.push("ZENSUS: keine Textur trug einen Zugriff — die Haken sind blind");
    for (const x of ziele) {
        if (x.leinwand) continue;
        const e = x.ereignisse || [];
        const lesend = e.filter((v) => v.art === "R" || v.art === "L" || v.art === "T");
        const schreibend = e.filter((v) => v.art === "W");
        const name = x.name || `#${x.id}`;
        if (!x.name || !x.erzeuger)
            nenne(x, "erzeuger", `ERZEUGER: ${name} (${form(x)}, ${mb(x.bytes)} MB) trägt keinen Erzeuger — die Linse ist blind`);
        if (x.ziel && !x.tiefe && schreibend.length && !lesend.length)
            nenne(
                x,
                "ohne-leser",
                `OHNE LESER: ${name} (${form(x)}, ${mb(x.bytes)} MB, ${erzText(x)}) — geschrieben in ${paesse(schreibend)}, ` +
                    `gelesen von keinem Pass in ${z.frames} Frames`
            );
        if (!e.length && x.bytes >= 65536)
            hinweis.push(`RUHT: ${name} (${form(x)}, ${mb(x.bytes)} MB) — im Fenster weder gelesen noch geschrieben`);
        const lw = z.leinwand || [0, 0];
        if (
            x.ziel &&
            x.w * x.h >= 0.9 * lw[0] * lw[1] &&
            (NIEDERFREQUENT.test(name) || schreibend.some((v) => NIEDERFREQUENT.test(v.pass || "")))
        )
            nenne(
                x,
                "volle-aufloesung",
                `VOLLE AUFLÖSUNG: ${name} (${form(x)}, ${mb(x.bytes)} MB) — ein niederfrequenter Effekt in Leinwand-Größe ` +
                    `(${lw.join("×")}); ein Viertel der Pixel trüge dasselbe Bild`
            );
        if (x.tiefe) {
            const angehaengt = e.filter((v) => v.via === "tiefe" && v.art !== "L");
            const genutzt = angehaengt.some((v) => v.art === "W" || v.art === "T");
            const gelesen = e.some((v) => v.art === "R");
            if (angehaengt.length && !genutzt && !gelesen)
                nenne(
                    x,
                    "tiefe",
                    `TIEFE OHNE LESER: ${name} (${form(x)}, ${mb(x.bytes)} MB) — angehängt in ${paesse(angehaengt)}, ` +
                        `keine Pipeline testet oder schreibt sie, kein Pass liest sie`
                );
            if (!angehaengt.length && schreibend.length && !gelesen)
                nenne(x, "tiefe", `TIEFE OHNE LESER: ${name} (${form(x)}, ${mb(x.bytes)} MB) — geschrieben, nie gelesen`);
        }
        // DOPPELTE TIEFE / KOPIE: ein Lesen der Kopie, während die Quelle seit der Kopie unverändert ist und im lesenden Pass
        // nicht angehängt (also frei lesbar) — der Leser läse die Quelle selbst.
        let doppelt = 0,
            quelle = null;
        for (const v of e) {
            if (v.art !== "R") continue;
            let w = null;
            for (const u of e) if (u.art === "W" && u.s < v.s && (!w || u.s > w.s)) w = u;
            if (!w || w.via !== "kopie" || w.von === undefined) continue;
            const D = byId.get(w.von);
            if (!D) continue;
            const de = D.ereignisse || [];
            const veraendert = de.some((u) => u.art === "W" && u.s > w.s && u.s < v.s);
            const angehaengt = v.pid !== undefined && de.some((u) => u.pid === v.pid && (u.via === "tiefe" || u.via === "farbe"));
            if (!veraendert && !angehaengt) {
                doppelt++;
                quelle = D;
            }
        }
        if (doppelt)
            nenne(
                x,
                x.tiefe ? "tiefe" : "kopie",
                `${x.tiefe ? "DOPPELTE TIEFE" : "DOPPELTE KOPIE"}: ${name} (${form(x)}, ${mb(x.bytes)} MB) ist eine Kopie von ` +
                    `${quelle.name || "#" + quelle.id}, die ${doppelt}× gelesen wird, während die Quelle unverändert und frei lesbar ist`
            );
    }
    // TEILBAR: Paare derselben Form, die keinen Inhalt über den Frame tragen und in keinem gemeinsamen Frame zugleich leben.
    const gruppen = new Map();
    for (const x of ziele) {
        if (!x.ziel || x.leinwand || !(x.ereignisse || []).length || traegt(x)) continue;
        const key = [x.format, x.w, x.h, x.schichten, x.mips, x.proben].join("|");
        if (!gruppen.has(key)) gruppen.set(key, []);
        gruppen.get(key).push(x);
    }
    for (const g of gruppen.values())
        for (let i = 0; i < g.length; i++)
            for (let j = i + 1; j < g.length; j++) {
                const a = g[i],
                    b = g[j];
                const la = lebenszeit(a),
                    lb = lebenszeit(b);
                let gemeinsam = 0,
                    ueber = false;
                for (const [f, ia] of la) {
                    const ib = lb.get(f);
                    if (!ib) continue;
                    gemeinsam++;
                    if (!(ia[1] < ib[0] || ib[1] < ia[0])) {
                        ueber = true;
                        break;
                    }
                }
                if (!ueber && gemeinsam >= 2) {
                    klasse.get(a.id).push("teilbar");
                    klasse.get(b.id).push("teilbar");
                    rot.push(
                        `TEILBAR: ${a.name || "#" + a.id} und ${b.name || "#" + b.id} (${form(a)}, je ${mb(a.bytes)} MB) leben in ` +
                            `keinem von ${gemeinsam} Frames zugleich und tragen nichts über den Frame — ein Ziel trüge beide, −${mb(Math.min(a.bytes, b.bytes))} MB`
                    );
                }
            }
    // FORMAT: was das Lesen über den Inhalt weiß.
    for (const l of lesen || []) {
        const x = byId.get(l.id);
        if (!x || !l.gelesen) continue;
        const name = x.name || `#${x.id}`;
        if (/32float/.test(x.format)) {
            if (l.f16exakt === true) {
                klasse.get(x.id).push("format");
                rot.push(
                    `FORMAT: ${name} (${form(x)}, ${mb(x.bytes)} MB) trägt nur 16-bit-Inhalt — jeder Wert liegt exakt in ` +
                        `${x.format.replace("32", "16")}, die Hälfte reicht (−${mb(x.bytes / 2)} MB)`
                );
            } else if (l.f16exakt === false)
                hinweis.push(
                    `FORMAT: ${name} — in 16 bit verlöre der Inhalt bis ${+(Number(l.f16maxAbs) || 0).toPrecision(3)} absolut ` +
                        `(${+((Number(l.f16maxRel) || 0) * 100).toPrecision(2)} % relativ)` +
                        (l.f16ueberlauf ? `, ${l.f16ueberlauf} Werte über 65 504 (Überlauf)` : "")
                );
        }
        const konst = (l.min || []).map((m, c) => (m === l.max[c] ? c : -1)).filter((c) => c >= 0);
        if (konst.length && konst.length < (l.min || []).length)
            hinweis.push(
                `KANAL: ${name} (${x.format}) — Kanal ${konst.map((c) => "rgba"[c] + "=" + l.min[c]).join(", ")} an diesem Ort konstant`
            );
    }
    const zeilen = ziele
        .filter((x) => !x.leinwand)
        .map((x) => {
            const e = x.ereignisse || [];
            const les = e.filter((v) => v.art === "R" || v.art === "L" || v.art === "T");
            const letzt = les.length ? les[les.length - 1] : null;
            return {
                id: x.id,
                name: x.name || `#${x.id}`,
                form: form(x),
                mb: mb(x.bytes),
                erzeuger: erzText(x),
                schreiber: paesse(e.filter((v) => v.art === "W")),
                leser: paesse(les),
                letzterLeser: letzt ? `${letzt.pass} (Frame ${letzt.f})` : "—",
                traegt: traegt(x),
                klassen: [...new Set(klasse.get(x.id))],
            };
        })
        .sort((a, b) => b.mb - a.mb);
    return { rot, hinweis, zeilen };
}

function zielTabelle(u, z) {
    const s = [];
    const summe = u.zeilen.reduce((a, x) => a + x.mb, 0);
    s.push(
        `ZIEL-ZENSUS — ${u.zeilen.length} Texturen, ${summe.toFixed(1)} MB` +
            (z ? ` · ${z.frames} Frames · Leinwand ${z.leinwand.join("×")}` : "")
    );
    s.push("");
    s.push("   MB  Name                              Form                        Erzeuger · Schreiber → Leser (zuletzt)");
    for (const x of u.zeilen) {
        if (x.mb < 0.05 && !x.klassen.length) continue;
        s.push(
            `${x.mb.toFixed(2).padStart(6)}  ${x.name.slice(0, 32).padEnd(32)}  ${x.form.slice(0, 26).padEnd(26)}  ${x.erzeuger}` +
                ` · ${x.schreiber} → ${x.leser} (${x.letzterLeser})${x.traegt ? " · trägt über den Frame" : ""}` +
                (x.klassen.length ? `  ◀ ${x.klassen.join(", ")}` : "")
        );
    }
    s.push("");
    for (const h of u.hinweis) s.push("  Hinweis: " + h);
    s.push(u.rot.length ? `\nROT (${u.rot.length}):\n  ` + u.rot.join("\n  ") : "\nGRÜN — jedes Ziel hat einen Leser, keine Klasse fällt.");
    return s.join("\n");
}

// DER SELBSTTEST (Node, ohne Browser): ein sauberer Lauf bleibt grün, je Klasse fällt ein gebauter Täter beim Namen rot.
function selbsttest() {
    const fehler = [];
    let s = 0;
    const tex = (id, name, o) =>
        Object.assign(
            {
                id,
                name,
                erzeuger: { quelle: "anazhRealm.js", methode: "_probe" },
                format: "rgba16float",
                w: 1920,
                h: 1080,
                schichten: 1,
                mips: 1,
                proben: 1,
                dim: "2d",
                ziel: true,
                kopierbar: true,
                tiefe: false,
                bytes: 16588800,
                leinwand: false,
                ereignisse: [],
            },
            o || {}
        );
    const auf = (x, f, art, pass, via, extra) => x.ereignisse.push(Object.assign({ s: ++s, f, art, pass, via }, extra || {}));
    const bau = (mit) => {
        s = 0;
        const szene = tex(0, "output");
        const tiefe = tex(1, "depth", { format: "depth24plus", tiefe: true, bytes: 8294400 });
        const aufl = tex(2, "TRAANode.resolve");
        const gesch = tex(3, "TRAANode.history");
        const x = [szene, tiefe, aufl, gesch];
        const T = {};
        if (mit.ohneLeser) x.push((T.ohne = tex(4, "x:ohne-leser", { format: "rgba8unorm", w: 64, h: 64, bytes: 16384 })));
        if (mit.bloom) x.push((T.bloom = tex(5, "x:bloom")));
        if (mit.tiefeOhne)
            x.push((T.tiefeOhne = tex(6, "x:tiefe-ohne", { format: "depth24plus", tiefe: true, bytes: 8294400 })));
        if (mit.kopie) x.push((T.kopie = tex(7, "x:tiefe-kopie", { format: "depth24plus", tiefe: true, bytes: 8294400 })));
        if (mit.paar) {
            x.push((T.a = tex(8, "x:paar-a", { format: "rgba8unorm", w: 128, h: 128, bytes: 65536 })));
            x.push((T.b = tex(9, "x:paar-b", { format: "rgba8unorm", w: 128, h: 128, bytes: 65536 })));
        }
        if (mit.f32) x.push((T.f32 = tex(10, "x:f32", { format: "rgba32float", w: 64, h: 64, ziel: false, bytes: 65536 })));
        if (mit.ohneErzeuger) x.push((T.anon = tex(11, null, { erzeuger: null, format: "r8unorm", w: 16, h: 16, bytes: 256 })));
        for (let f = 1; f <= 4; f++) {
            if (f === 1) auf(gesch, f, "W", "TRAA", "kopie", { von: 2 });
            auf(szene, f, "W", "haupt", "farbe", { pid: 10 * f });
            auf(tiefe, f, "W", "haupt", "tiefe", { pid: 10 * f });
            // der Resolve-Pass: sein Ziel schreibt ab Pass-Beginn, danach liest sein Draw Geschichte, Szene und Tiefe
            auf(aufl, f, "W", "TRAA", "farbe", { pid: 10 * f + 1 });
            auf(gesch, f, "R", "TRAA", "zeichnen", { pid: 10 * f + 1 });
            auf(szene, f, "R", "TRAA", "zeichnen", { pid: 10 * f + 1 });
            auf(tiefe, f, "R", "TRAA", "zeichnen", { pid: 10 * f + 1 });
            auf(aufl, f, "R", "TRAA", "kopie");
            auf(gesch, f, "W", "TRAA", "kopie", { von: 2 });
            auf(aufl, f, "R", "post", "zeichnen", { pid: 10 * f + 2 });
            if (T.ohne) auf(T.ohne, f, "W", "probe", "farbe", { pid: 10 * f + 3 });
            if (T.bloom) {
                auf(T.bloom, f, "W", "bloom", "farbe", { pid: 10 * f + 4 });
                auf(T.bloom, f, "R", "post", "zeichnen", { pid: 10 * f + 2 });
            }
            if (T.tiefeOhne) auf(T.tiefeOhne, f, "O", "probe", "tiefe", { pid: 10 * f + 3 });
            if (T.kopie) {
                auf(T.kopie, f, "W", "probe", "kopie", { von: 1 });
                auf(T.kopie, f, "R", "probe", "zeichnen", { pid: 10 * f + 5 });
            }
            if (T.a) {
                auf(T.a, f, "W", "probe", "farbe", { pid: 10 * f + 6 });
                auf(T.a, f, "R", "probe", "zeichnen", { pid: 10 * f + 7 });
                auf(T.b, f, "W", "probe", "farbe", { pid: 10 * f + 8 });
                auf(T.b, f, "R", "probe", "zeichnen", { pid: 10 * f + 9 });
            }
            if (T.f32) auf(T.f32, f, "R", "post", "zeichnen", { pid: 10 * f + 2 });
            if (T.anon) auf(T.anon, f, "R", "post", "zeichnen", { pid: 10 * f + 2 });
        }
        const z = { frames: mit.frames || 4, n: 4, leinwand: [1920, 1080], blind: mit.blind || 0, pipeBlind: 0, ziele: x };
        const lesen = T.f32 ? [{ id: 10, gelesen: true, min: [0, 0, 0, 0], max: [1, 1, 1, 1], f16exakt: true }] : [];
        return { z, lesen };
    };
    const sauber = bau({});
    const u0 = zielUrteil(sauber.z, sauber.lesen);
    if (u0.rot.length) fehler.push("der saubere Lauf fällt rot: " + u0.rot.join(" · "));
    console.log(`  ${u0.rot.length ? "❌" : "✅"} sauberer Lauf → ${u0.rot.join(" · ") || "grün"}`);
    const faelle = [
        { name: "Ziel ohne Leser", mit: { ohneLeser: true }, muss: /OHNE LESER: x:ohne-leser/ },
        { name: "Bloom in Leinwand-Größe", mit: { bloom: true }, muss: /VOLLE AUFLÖSUNG: x:bloom/ },
        { name: "Tiefe ohne Nutzung", mit: { tiefeOhne: true }, muss: /TIEFE OHNE LESER: x:tiefe-ohne/ },
        { name: "doppelte Tiefe", mit: { kopie: true }, muss: /DOPPELTE TIEFE: x:tiefe-kopie .* ist eine Kopie von depth,/ },
        { name: "teilbares Paar", mit: { paar: true }, muss: /TEILBAR: x:paar-a und x:paar-b/ },
        { name: "32 bit mit 16-bit-Inhalt", mit: { f32: true }, muss: /FORMAT: x:f32 .* trägt nur 16-bit-Inhalt/ },
        { name: "Textur ohne Erzeuger", mit: { ohneErzeuger: true }, muss: /ERZEUGER: #11/ },
        { name: "blindes Bündel", mit: { blind: 3 }, muss: /3 Bündel ohne bekannten Inhalt/ },
        { name: "zu kurzes Fenster", mit: { frames: 2 }, muss: /nur 2 Frames/ },
    ];
    for (const f of faelle) {
        const b = bau(f.mit);
        const u = zielUrteil(b.z, b.lesen);
        const ok = u.rot.some((x) => f.muss.test(x));
        if (!ok) fehler.push(`${f.name}: der Zensus nennt den Täter nicht (${f.muss})`);
        console.log(`  ${ok ? "✅" : "❌"} ${f.name} → ${u.rot.join(" · ") || "grün"}`);
    }
    // Die Klassen schweigen, wo sie nicht gelten: die Geschichte der zeitlichen Auflösung (trägt über den Frame) ist nie
    // teilbar, die Szene und die Auflösung leben im Resolve zugleich.
    const u1 = zielUrteil(sauber.z, sauber.lesen);
    if (u1.zeilen.find((x) => x.name === "TRAANode.history" && !x.traegt))
        fehler.push("die Geschichte trägt über den Frame, der Zensus sieht es nicht");
    return fehler;
}

module.exports = {
    NIEDERFREQUENT,
    VENDOR,
    zielUrteil,
    zielTabelle,
    selbsttest,
    traegt,
    lebenszeit,
    // Die Seite: die Pass-Uhr und die Bank-Runde der Zerleg-Linse (ZERLEGE_INSTALL) und der Textur-Erzeuger des Draw-Zählers
    // (ZAEHLER_INSTALL) müssen davor stehen; der VRAM-Abgriff ab Dokument-Start.
    ZIEL_INSTALL:
        `window.__zielZensus = (function(){ const haken = ${haken.toString()}; const VENDOR_ = ${JSON.stringify(
            VENDOR.map((v) => ({ muster: v.muster.source, quelle: v.quelle, such: v.such }))
        )}; const f = ${zielZensus.toString()}; return (k) => f(Object.assign({ vendor: VENDOR_ }, k || {})); })();` +
        `window.__zielLesen = ${zielLesen.toString()};` +
        `window.__zielSchmuggel = (function(){ const haken = ${haken.toString()}; return ${zielSchmuggel.toString()}; })();`,
};
