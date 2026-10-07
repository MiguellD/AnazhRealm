// vram-abgriff.cjs — DER VRAM-ABGRIFF der Werkbank und jeder Linse, die die GPU beim Namen zählt (bis 07.10. ein Teil
// von scripts/werkbank.cjs; gate:ziel-zensus fährt ihn headless, darum lebt er hier als EINE Quelle). Er läuft vor jedem
// Seiten-Skript: page.evaluateOnNewDocument(vramAbgriff).
"use strict";

// DER VRAM-ABGRIFF: jede Allokation des GPUDevice (Puffer: size; Textur: alle Mip-Stufen × Schichten ×
// Samples × Bytes je Texel) live mitgezählt, destroy zieht ab. Läuft vor jedem Seiten-Skript.
// DIE GC-WAHRHEIT: ein GPU-Objekt, das niemand zerstört, dessen Hülle aber der Garbage-Collector nimmt, gibt Chrome frei —
// der Abgriff bucht es dann aus (`V.gc` zählt diese Bytes). Ohne sie zählte er Tote als Speicher: die Uniform-Puffer je
// Render-Objekt (r184 `bindingBuffer…`) zerstört niemand, sie fallen mit ihrem Objekt. Die Band-Linse liest den Speicher
// nach einem erzwungenen GC (`/band`), nie den Stand, den die Laune des Collectors gerade lässt.
function vramAbgriff() {
    if (typeof GPUDevice === "undefined" || window.__vram) return;
    const V = (window.__vram = { puffer: 0, texturen: 0, nPuffer: 0, nTexturen: 0, spitze: 0, gc: 0 });
    const bpt = (f) => {
        if (/^(bc1|bc4|etc2-rgb8unorm|etc2-rgb8a1|eac-r11)/.test(f)) return 0.5;
        if (/^(bc|astc-4x4|etc2-rgba8|eac-rg11)/.test(f)) return 1;
        if (/^astc/.test(f)) return 0.5;
        if (/32float-stencil8/.test(f)) return 8;
        if (/^(depth24plus|depth32float|depth24plus-stencil8)$/.test(f)) return 4;
        if (/^(depth16unorm)$/.test(f)) return 2;
        if (/^stencil8$/.test(f)) return 1;
        const k = /^(r|rg|rgba|bgra)(8|16|32)/.exec(f);
        if (k) return { r: 1, rg: 2, rgba: 4, bgra: 4 }[k[1]] * (Number(k[2]) / 8);
        if (/^(rgb10a2|rg11b10|rgb9e5)/.test(f)) return 4;
        return 4;
    };
    // Dieselbe Bytes-je-Texel-Tabelle liest die Frame-Anatomie der GPU-Zerlegung (scripts/lib/zerlege-linse.cjs), und
    // jede Ansicht kennt ihre Textur (ein Render-Pass nennt nur Ansichten — Format, Größe und Proben trägt die Textur).
    window.__vramBpt = bpt;
    const ansichtTextur = (window.__viewTex = new WeakMap());
    const cv = GPUTexture.prototype.createView;
    GPUTexture.prototype.createView = function (d) {
        const v = cv.call(this, d);
        ansichtTextur.set(v, this);
        return v;
    };
    const spitze = () => (V.spitze = Math.max(V.spitze, V.puffer + V.texturen));
    // Je Label die lebenden Bytes — `__vramBericht()` nennt die Großen beim Namen; das Label faltet die EINE Regel
    // `__vramFalte` (scripts/lib/draw-zaehler.cjs, ab Dokument-Start installiert).
    const jeLabel = new Map();
    // Der Halter je GPU-Objekt ({b, k, feld, n}) — er überlebt das Objekt, damit der Collector es ausbuchen kann.
    const aus = (h) => {
        if (!h.b) return;
        V[h.feld] -= h.b;
        V[h.n]--;
        const e = jeLabel.get(h.k);
        if (e) {
            e.bytes -= h.b;
            e.n--;
        }
        h.b = 0;
    };
    const gc =
        typeof FinalizationRegistry === "function"
            ? new FinalizationRegistry((h) => {
                  V.gc += h.b;
                  aus(h);
              })
            : null;
    // Texturen tragen Format und Größe im Schlüssel (wenige, große), Puffer nur das Label.
    const buche = (o, art, d, b) => {
        const s = (d && d.size) || {};
        const form =
            art === "tex"
                ? ` ${d.format} ${Array.isArray(s) ? s.join("x") : [s.width, s.height, s.depthOrArrayLayers || 1].join("x")}`
                : "";
        o.__vramK = art + ":" + window.__vramFalte((d && d.label) || "?") + form;
        const h = (o.__vramH = {
            b,
            k: o.__vramK,
            feld: art === "tex" ? "texturen" : "puffer",
            n: art === "tex" ? "nTexturen" : "nPuffer",
        });
        if (gc) gc.register(o, h, h);
        const e = jeLabel.get(o.__vramK) || { bytes: 0, n: 0 };
        e.bytes += b;
        e.n++;
        jeLabel.set(o.__vramK, e);
    };
    // Ein GPU-Objekt unter einen anderen Schlüssel umbuchen: die Band-Linse (`__texturZensus`, `__pufferZensus`) nennt
    // namenlose Texturen und Puffer über ihr three-Objekt, der Abgriff sah nur das Label beim Anlegen.
    window.__vramUmbuchen = (o, k) => {
        const h = o.__vramH;
        if (!h || !h.b || h.k === k) return;
        const alt = jeLabel.get(h.k);
        if (alt) {
            alt.bytes -= h.b;
            alt.n--;
        }
        o.__vramK = h.k = k;
        const e = jeLabel.get(k) || { bytes: 0, n: 0 };
        e.bytes += h.b;
        e.n++;
        jeLabel.set(k, e);
    };
    window.__vramBericht = (top) =>
        [...jeLabel.entries()]
            .filter(([, e]) => e.n > 0)
            .sort((a, b) => b[1].bytes - a[1].bytes)
            .slice(0, top || 20)
            // drei Stellen: die vielen kleinen Halter-Schlüssel (`buf:szene:<Klasse>`) summieren sich im Urteil
            .map(([k, e]) => ({ k, mb: +(e.bytes / 1048576).toFixed(3), n: e.n }));
    const P = GPUDevice.prototype;
    const cb = P.createBuffer;
    P.createBuffer = function (d) {
        const b = cb.call(this, d);
        const n = (d && d.size) || 0;
        V.puffer += n;
        V.nPuffer++;
        buche(b, "buf", d, n);
        spitze();
        return b;
    };
    const ct = P.createTexture;
    P.createTexture = function (d) {
        const t = ct.call(this, d);
        const s = d.size || {};
        const w = Array.isArray(s) ? s[0] : s.width || 1;
        const h = Array.isArray(s) ? s[1] || 1 : s.height || 1;
        const l = Array.isArray(s) ? s[2] || 1 : s.depthOrArrayLayers || 1;
        let b = 0;
        for (let m = 0; m < (d.mipLevelCount || 1); m++)
            b +=
                Math.max(1, w >> m) *
                Math.max(1, h >> m) *
                (d.dimension === "3d" ? Math.max(1, l >> m) : l) *
                bpt(String(d.format || ""));
        b *= d.sampleCount || 1;
        V.texturen += b;
        V.nTexturen++;
        buche(t, "tex", d, b);
        spitze();
        return t;
    };
    // DER GRUND DES ZIEL-ZENSUS (scripts/lib/ziel-zensus.cjs, 07.10.): was eine Bind-Gruppe, ein Render-Bündel und eine
    // Pipeline lesen, steht nur beim ANLEGEN im Klartext — danach ist das GPU-Objekt undurchsichtig. Der Abgriff merkt es sich
    // je Objekt, nur beim Anlegen (nie im Frame): je Bind-Gruppe die Texturen ihrer Ansichten, je Bündel seine Gruppen und
    // Pipelines (aufgenommen am Bündel-Kodierer), je Pipeline, ob sie die Tiefe testet oder schreibt. Der Zensus liest es im
    // Fenster — welche Textur ein Draw liest, ob ein Pass seine Tiefe nutzt.
    const gruppeTex = (window.__gruppeTex = new WeakMap());
    const pipeTiefe = (window.__pipeTiefe = new WeakMap());
    const buendel = (window.__buendelInhalt = new WeakMap());
    const cbg = P.createBindGroup;
    P.createBindGroup = function (d) {
        const g = cbg.call(this, d);
        const tex = [];
        for (const e of (d && d.entries) || []) {
            const t = e && e.resource ? ansichtTextur.get(e.resource) : undefined;
            if (t) tex.push(t);
        }
        if (tex.length) gruppeTex.set(g, tex);
        return g;
    };
    const tiefeVon = (d) => {
        const ds = d && d.depthStencil;
        return {
            testet: !!ds && ds.depthCompare !== undefined && ds.depthCompare !== "always",
            schreibt: !!ds && ds.depthWriteEnabled === true,
            farben: ((d && d.fragment && d.fragment.targets) || []).filter(Boolean).length,
        };
    };
    const crp = P.createRenderPipeline;
    P.createRenderPipeline = function (d) {
        const p = crp.call(this, d);
        pipeTiefe.set(p, tiefeVon(d));
        return p;
    };
    const crpa = P.createRenderPipelineAsync;
    if (typeof crpa === "function")
        P.createRenderPipelineAsync = function (d) {
            return crpa.call(this, d).then((p) => {
                pipeTiefe.set(p, tiefeVon(d));
                return p;
            });
        };
    const BE = typeof GPURenderBundleEncoder !== "undefined" ? GPURenderBundleEncoder.prototype : null;
    if (BE) {
        const sbg = BE.setBindGroup,
            sp = BE.setPipeline,
            fin = BE.finish;
        BE.setBindGroup = function (i, g, ...rest) {
            if (g) (this.__zG || (this.__zG = [])).push(g);
            return sbg.call(this, i, g, ...rest);
        };
        BE.setPipeline = function (p) {
            (this.__zP || (this.__zP = [])).push(p);
            return sp.call(this, p);
        };
        BE.finish = function (d) {
            const b = fin.call(this, d);
            buendel.set(b, { gruppen: this.__zG || [], pipes: this.__zP || [] });
            this.__zG = this.__zP = null;
            return b;
        };
    }
    for (const K of [GPUBuffer, GPUTexture]) {
        const d = K.prototype.destroy;
        K.prototype.destroy = function () {
            const h = this.__vramH;
            if (h) {
                if (gc) gc.unregister(h);
                aus(h);
            }
            return d.call(this);
        };
    }
}

module.exports = { vramAbgriff };
