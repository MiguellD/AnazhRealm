"use strict";
// DER HEAP-ZENSUS NACH ERZEUGER (w28-heap-zensus): `/puffer` kennt die Typed Arrays beim Halter (`__heapHalter`), nie die
// gewöhnlichen Objekte. Der Sampling-Heap-Profiler von V8 (CDP `HeapProfiler.startSampling` vor dem Boot, `getSamplingProfile`
// nach zwei erzwungenen GC) trägt die NOCH LEBENDEN Bytes je Allokations-Stelle; verdichtet wird zweimal:
//   stelle — die Funktion, in der die Allokation geschah (oft three.js: `Vector3`, `Matrix4`, `clone`),
//   spiel  — der nächste Rahmen des Spiels darüber (nicht vendor/, nicht nativ): wer die Allokation BESTELLT hat.
// Die Datei:Zeile ist der Anfang der Funktion (der Profiler nennt nur sie). Die Backing-Stores der ArrayBuffer leben außerhalb
// des V8-Heaps — sie stehen im Zensus nie, nur in `backingStorageSize` (die Zeile „Typed-Array-Speicher“).

const MB = (x) => +(x / 1048576).toFixed(1);
const fremd = (url) => !url || /\/vendor\/|\/node_modules\/|^(chrome|devtools|extensions)::?/.test(url);
const ort = (cf) => {
    let p = cf.url || "";
    try {
        p = new URL(p).pathname.replace(/^\//, "");
    } catch {}
    return p ? `${p}:${cf.lineNumber + 1}` : "(nativ)";
};
const name = (cf) => cf.functionName || "(anonym)";

function verdichten(profile, usage, { top = 30 } = {}) {
    const stelle = new Map(),
        spiel = new Map();
    let summe = 0;
    const buche = (m, cf, n) => {
        const k = `${name(cf)} · ${ort(cf)}`;
        m.set(k, (m.get(k) || 0) + n);
    };
    // iterativ (die Stapel des Spiels sind tief): je Knoten der nächste Spiel-Rahmen von oben her
    const stapel = [[profile.head, null]];
    while (stapel.length) {
        const [k, sp] = stapel.pop();
        const eigen = fremd(k.callFrame.url) ? sp : k.callFrame;
        if (k.selfSize > 0) {
            summe += k.selfSize;
            buche(stelle, k.callFrame, k.selfSize);
            buche(spiel, eigen || k.callFrame, k.selfSize);
        }
        for (const c of k.children || []) stapel.push([c, eigen]);
    }
    const reihe = (m) => {
        const s = [...m].sort((a, b) => b[1] - a[1]);
        const kopf = s.slice(0, top).map(([k, n]) => [k, MB(n), +((100 * n) / (summe || 1)).toFixed(1)]);
        const rest = s.slice(top).reduce((a, [, n]) => a + n, 0);
        return { kopf, rest: [`Rest (${Math.max(0, s.length - top)} Stellen)`, MB(rest), +((100 * rest) / (summe || 1)).toFixed(1)] };
    };
    const o = {
        summeMB: MB(summe),
        heap: {
            jsMB: MB(usage.usedSize),
            typedMB: MB(usage.backingStorageSize || 0),
            heapMB: MB(usage.usedSize + (usage.backingStorageSize || 0)),
        },
        stelle: reihe(stelle),
        spiel: reihe(spiel),
    };
    const zeilen = (r) => [...r.kopf, r.rest].map(([k, mb, pc], i) => `${String(i + 1).padStart(3)}  ${String(mb).padStart(7)} MB  ${String(pc).padStart(5)} %  ${k}`);
    o.tafel = [
        `HEAP-ZENSUS NACH ERZEUGER — lebend nach 2× GC (Sampling-Heap-Profiler von V8)`,
        `Heap nach GC ${o.heap.heapMB} MB = JS-Heap ${o.heap.jsMB} MB + Typed-Array-Speicher ${o.heap.typedMB} MB · Summe des Samplings ${o.summeMB} MB (${((100 * summe) / (usage.usedSize || 1)).toFixed(0)} % des JS-Heaps)`,
        ``,
        `NACH ALLOKATIONS-STELLE (Funktion · Datei:Zeile des Funktionsanfangs):`,
        ...zeilen(o.stelle),
        ``,
        `NACH BESTELLER IM SPIEL (der nächste Rahmen außerhalb vendor/ und nativ):`,
        ...zeilen(o.spiel),
    ].join("\n");
    return o;
}

// der Selbsttest (ohne Welt): eine three-Allokation unter einem Spiel-Rahmen bucht die Stelle auf three, den Besteller aufs Spiel
function selbsttest() {
    const cf = (functionName, url, lineNumber) => ({ functionName, url, lineNumber });
    const profile = {
        head: {
            callFrame: cf("(root)", "", 0),
            selfSize: 0,
            children: [
                {
                    callFrame: cf("_bewohnerLeib", "http://h/stamm/koerper-leib.js?v=1", 147),
                    selfSize: 1048576,
                    children: [{ callFrame: cf("clone", "http://h/vendor/three.module.js", 9), selfSize: 3 * 1048576, children: [] }],
                },
            ],
        },
    };
    const o = verdichten(profile, { usedSize: 8 * 1048576, backingStorageSize: 0 }, { top: 5 });
    const f = [];
    if (o.summeMB !== 4) f.push(`Summe ${o.summeMB} ≠ 4`);
    if (o.stelle.kopf[0][0] !== "clone · vendor/three.module.js:10") f.push(`Stelle ${o.stelle.kopf[0][0]}`);
    if (o.spiel.kopf[0][0] !== "_bewohnerLeib · stamm/koerper-leib.js:148" || o.spiel.kopf[0][1] !== 4) f.push(`Besteller ${o.spiel.kopf[0]}`);
    return f;
}

// DIE CPU-SPIEGEL DER GPU-PUFFER (w28-heap-spiegel, `werkbank heap-spiegel`): jedes Typed Array, das `array` eines schon
// hochgeladenen Attributs ist (`renderer.info.memoryMap` + `backend.get(a).buffer`), EINMAL je ArrayBuffer, beim Erzeuger
// (`_taeterKlasse` der Szene, `ruhend:` der Foundry-Cache, sonst `verwaist:`). Läuft in der SEITE (selbst-enthalten).
//   modus "zaehlen" — die Tafel: Erzeuger · MB · dynamisch (usage Dynamic oder Version gewachsen seit der Wache) · mit Leser
//                     (seit der Wache las ein Rahmen außerhalb der harmlosen Vendor-Stellen `.array`) · LESERFREI
//   modus "wache"   — `.array` jedes gespiegelten Puffers wird ein Accessor, der jeden Leser beim Rahmen bucht (Stapel)
//   modus "frei"    — der Spike: die Spiegel des Erzeugers `klasse` (ohne dynamische) fallen auf ein leeres Array
//                     desselben Typs (der Vendor liest danach nur `constructor`/`BYTES_PER_ELEMENT`); die Hüllen vorher berechnet
function spiegel(o) {
    o = o || {};
    const r = window.anazhRealm,
        st = r.state,
        rend = st.renderer,
        be = rend && rend.backend,
        reg = rend && rend.info && rend.info.memoryMap;
    if (!be || !reg) return { fehler: "kein renderer.info.memoryMap" };
    const W = window.__spiegel || (window.__spiegel = { lese: new Map(), version: new Map(), frei: new Set(), still: false });
    W.still = true;
    // die Stellen, die nach dem Upload nur Typ und Breite lesen — kein Leser des Inhalts: der Pipeline-Bau, das Speicher-Buch,
    // der Draw (das Index-Format aus dem Array-Typ) und die Index-Wache des Stamms (`byteLength` gegen den GPU-Puffer,
    // stoff-instanz.js `_indexWacheDraw`; den Bereich liest sie nur im Verdacht)
    const HARMLOS = /\b(createShaderVertexBuffers|_getVertexFormat|getVertexFormat|_getAttributeMemorySize|getAttributeMemorySize|destroyAttribute|draw|drawIndexed|setIndexBuffer|_indexWacheDraw|P\.draw)\b/;
    const halter = new Map(),
        geos = new Map();
    const merke = (a, n, g) => {
        if (!a) return;
        const b = a.isInterleavedBufferAttribute ? a.data : a;
        if (!halter.has(b)) halter.set(b, n);
        if (g) (geos.get(b) || geos.set(b, new Set()).get(b)).add(g);
    };
    const geo = (g, n) => {
        if (!g || !g.attributes) return;
        for (const k in g.attributes) merke(g.attributes[k], n, g);
        if (g.index) merke(g.index, n, g);
    };
    let klasseVon;
    try {
        klasseVon = (x) => r._taeterKlasse(x);
        klasseVon(st.scene);
    } catch {
        klasseVon = (x) => x.name || x.type;
    }
    st.scene.traverse((x) => {
        if (!x.geometry && !x.isInstancedMesh) return;
        const n = "szene:" + klasseVon(x);
        geo(x.geometry, n);
        const q = x.__instanzQuelle || x;
        if (q.isInstancedMesh) for (const a of [q.instanceMatrix, q.instanceColor]) merke(a, n + "|instanz");
        for (const ro of x.__renderObjekte || []) if (ro.attributes) for (const a of ro.attributes) merke(a, n);
    });
    const cache = r._foundry && r._foundry.cache;
    if (cache)
        for (const [key, g] of cache) {
            if (!g || typeof g !== "object") continue;
            const n = "ruhend:" + String(key).split(/[|:#@]/)[0];
            for (const ch of g.children || []) geo(ch.geometry, n);
            const fl = g._foundryFlat;
            if (fl && Array.isArray(fl.leaves))
                for (const lf of fl.leaves) {
                    geo(lf.geom, n);
                    geo(lf._schattenGeom, n);
                }
        }
    // die gespiegelten Puffer: hochgeladen (GPU-Puffer da) UND ein Typed Array am Attribut
    const liste = [];
    const gesehenAB = new Set();
    for (const [a, v] of reg) {
        if (!a || a.isTexture || !v || !/ttributes$/.test(v.type || "")) continue;
        const b = a.isInterleavedBufferAttribute ? a.data : a;
        const d = be.get(b);
        if (!d || !d.buffer) continue;
        const arr = b.array;
        if (!ArrayBuffer.isView(arr) || !arr.byteLength) continue;
        const ab = arr.buffer;
        const neu = !gesehenAB.has(ab);
        gesehenAB.add(ab);
        const name = halter.get(b) || "verwaist:" + (v.type === "indexAttributes" ? "index" : v.type === "storageAttributes" ? "speicher" : "vertex");
        liste.push({ b, a, ab, typ: v.type, name, bytes: neu ? ab.byteLength : 0 });
    }
    const DYN = 35048; // DynamicDrawUsage
    const dynB = (b) => b.usage === DYN || (W.version.has(b) && b.version > W.version.get(b));
    const leserB = (b) => {
        const buch = W.lese.get(b);
        return !!buch && [...buch.stellen.keys()].some((s) => !s.startsWith("harmlos:"));
    };
    // DAS URTEIL JE ARRAYBUFFER: liegen mehrere Attribute als Sicht auf EINEM Puffer (die Sätze der Siedlung), hält jede Sicht
    // den ganzen Puffer — er ist dynamisch / gelesen, sobald EINE seiner Sichten es ist, und fällt nur, wenn ALLE fallen
    const abDyn = new Set(),
        abLeser = new Set();
    for (const e of liste) {
        if (dynB(e.b)) abDyn.add(e.ab);
        if (leserB(e.b)) abLeser.add(e.ab);
    }
    const dyn = (b) => dynB(b);
    const modus = o.modus || "zaehlen";
    let antwort = {};
    if (modus === "wache") {
        let n = 0;
        for (const { b } of liste) {
            W.version.set(b, b.version);
            if (W.lese.has(b)) continue;
            const eigen = Object.getOwnPropertyDescriptor(b, "array");
            if (!eigen || !("value" in eigen)) continue;
            let wert = eigen.value;
            const buch = { n: 0, stellen: new Map() };
            W.lese.set(b, buch);
            Object.defineProperty(b, "array", {
                configurable: true,
                enumerable: true,
                get() {
                    if (!W.still) {
                        buch.n++;
                        if (buch.n <= 40) {
                            const alt = Error.stackTraceLimit;
                            Error.stackTraceLimit = 40;
                            const s = (new Error().stack || "").split("\n").slice(2);
                            Error.stackTraceLimit = alt;
                            const spiel = s.find((z) => !/\/vendor\//.test(z) && /\.js/.test(z));
                            const v0 = s.find((z) => /\/vendor\//.test(z)) || s[0] || "?";
                            // harmlos ist, wessen UNMITTELBARER Leser nur Typ und Breite nimmt (s[0], der Rahmen am Getter)
                            const k = (HARMLOS.test(s[0] || "") ? "harmlos:" : "") + (spiel || "vendor " + v0).trim().replace(/^at /, "").replace(/\?v=[^:]*/, "").replace(/https?:\/\/[^/]+\//, "");
                            buch.stellen.set(k, (buch.stellen.get(k) || 0) + 1);
                        }
                    }
                    return wert;
                },
                set(x) {
                    wert = x;
                },
            });
            n++;
        }
        antwort = { wache: n };
    }
    if (modus === "frei") {
        const pre = String(o.klasse || "");
        let n = 0,
            bytes = 0,
            huellen = 0;
        // ein Puffer des Erzeugers fällt nur ganz: alle seine Sichten (auch die eines anderen Erzeugers) ohne Dynamik und Leser
        const abFrei = new Set(liste.filter((e) => pre && e.name.split("|")[0] === pre && !abDyn.has(e.ab) && !abLeser.has(e.ab)).map((e) => e.ab));
        for (const e of liste) {
            const { b } = e;
            if (!abFrei.has(e.ab) || W.frei.has(b)) continue;
            for (const g of geos.get(b) || []) {
                if (!g.boundingBox) (g.computeBoundingBox(), huellen++);
                if (!g.boundingSphere) (g.computeBoundingSphere(), huellen++);
            }
            bytes += e.bytes;
            b.array = new b.array.constructor(0);
            W.frei.add(b);
            n++;
        }
        antwort = { frei: { klasse: pre, puffer: n, mb: +(bytes / 1048576).toFixed(2), huellen } };
    }
    // die Tafel je Erzeuger (die Klasse bis zum ersten `|`)
    const je = new Map();
    let summe = 0;
    for (const e of liste) {
        const k = e.name.split("|")[0];
        const z = je.get(k) || { k, mb: 0, dyn: 0, leser: 0, frei: 0, n: 0, stellen: new Map() };
        const buch = W.lese.get(e.b);
        z.n++;
        z.mb += e.bytes;
        summe += e.bytes;
        if (abDyn.has(e.ab)) z.dyn += e.bytes;
        else if (abLeser.has(e.ab)) z.leser += e.bytes;
        else z.frei += e.bytes;
        if (buch) for (const [s, c] of buch.stellen) z.stellen.set(s, (z.stellen.get(s) || 0) + c);
        je.set(k, z);
    }
    const mb = (x) => +(x / 1048576).toFixed(2);
    const zeilen = [...je.values()]
        .sort((p, q) => q.mb - p.mb)
        .map((z) => ({
            erzeuger: z.k,
            n: z.n,
            mb: mb(z.mb),
            dyn: mb(z.dyn),
            leser: mb(z.leser),
            leserfrei: mb(z.frei),
            stellen: [...z.stellen].sort((p, q) => q[1] - p[1]).slice(0, 4).map(([s, c]) => c + "× " + s.slice(0, 150)),
        }));
    W.still = false;
    return Object.assign(antwort, {
        gespiegeltMB: mb(summe),
        leserfreiMB: +zeilen.reduce((s, z) => s + z.leserfrei, 0).toFixed(2),
        dynMB: +zeilen.reduce((s, z) => s + z.dyn, 0).toFixed(2),
        leserMB: +zeilen.reduce((s, z) => s + z.leser, 0).toFixed(2),
        wacheSeit: W.lese.size,
        zeilen: zeilen.slice(0, o.top || 30),
    });
}

function spiegelTafel(o) {
    const z = (o.zeilen || []).map(
        (x) => `${String(x.mb).padStart(8)} ${String(x.dyn).padStart(8)} ${String(x.leser).padStart(8)} ${String(x.leserfrei).padStart(9)}  ${String(x.n).padStart(5)}  ${x.erzeuger}${x.stellen.length ? "\n" + x.stellen.map((s) => "            ↳ " + s).join("\n") : ""}`
    );
    return [
        `CPU-SPIEGEL DER GPU-PUFFER — Heap nach GC ${o.heapMB} MB (JS ${o.jsMB} + Typed ${o.typedMB}) · gespiegelt ${o.gespiegeltMB} MB · dynamisch ${o.dynMB} · mit Leser ${o.leserMB} · LESERFREI ${o.leserfreiMB} MB (Wache an ${o.wacheSeit} Puffern)`,
        `      MB     dyn.   Leser  LESERFREI      n  Erzeuger`,
        ...z,
    ].join("\n");
}

module.exports = { verdichten, selbsttest, spiegel, spiegelTafel };
