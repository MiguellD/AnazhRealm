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

// DIE BEWOHNER-STELLEN (w28-heap-stichprobe): ein Besteller in diesen Dateien bucht auf „davon an Bewohnern“ — der Tag und
// Gang (siedlung-bewohner), Leib und Rig (koerper-*), die Kreaturen-Takte (kreatur-*), der Satz-Gang (stoff-gang), die Wege
const BEWOHNER = /\/(siedlung-bewohner|siedlung-wege|kreatur-[\w-]+|koerper-[\w-]+|stoff-gang)\.js/;

// `sek` (der Müll, w28-heap-stichprobe): das Profil trägt dann auch die gesammelten Objekte (`includeObjectsCollectedBy…GC`) —
// jede Zeile zusätzlich in MB/s über die Spanne
function verdichten(profile, usage, { top = 30, sek = 0, bilder = 0 } = {}) {
    const stelle = new Map(),
        spiel = new Map(),
        rufer = new Map();
    let summe = 0,
        anBewohnern = 0;
    const schluessel = (cf) => `${name(cf)} · ${ort(cf)}`;
    const buche = (m, k, n) => m.set(k, (m.get(k) || 0) + n);
    // iterativ (die Stapel des Spiels sind tief): je Knoten der nächste Spiel-Rahmen von oben her und der Spiel-Rahmen davor
    // (der Rufer des Bestellers — wer die Bestell-Funktion rief)
    const stapel = [[profile.head, null, null]];
    while (stapel.length) {
        const [k, sp, vor] = stapel.pop();
        const istSpiel = !fremd(k.callFrame.url);
        const eigen = istSpiel ? k.callFrame : sp;
        // der Rufer: über einem Spiel-Rahmen der vorige Spiel-Rahmen (eine Rekursion derselben Funktion zählt nicht), sonst geerbt
        const davor = istSpiel ? (sp && schluessel(sp) !== schluessel(k.callFrame) ? sp : vor) : vor;
        if (k.selfSize > 0) {
            summe += k.selfSize;
            buche(stelle, schluessel(k.callFrame), k.selfSize);
            buche(spiel, schluessel(eigen || k.callFrame), k.selfSize);
            buche(rufer, `${schluessel(eigen || k.callFrame)}  ←  ${davor ? schluessel(davor) : "-"}`, k.selfSize);
            if (eigen && BEWOHNER.test(eigen.url || "")) anBewohnern += k.selfSize;
        }
        for (const c of k.children || []) stapel.push([c, eigen, davor]);
    }
    const reihe = (m) => {
        const s = [...m].sort((a, b) => b[1] - a[1]);
        const kopf = s.slice(0, top).map(([k, n]) => [k, MB(n), +((100 * n) / (summe || 1)).toFixed(1)]);
        const rest = s.slice(top).reduce((a, [, n]) => a + n, 0);
        return { kopf, rest: [`Rest (${Math.max(0, s.length - top)} Stellen)`, MB(rest), +((100 * rest) / (summe || 1)).toFixed(1)] };
    };
    const o = {
        summeMB: MB(summe),
        anBewohnernMB: MB(anBewohnern),
        heap: {
            jsMB: MB(usage.usedSize),
            typedMB: MB(usage.backingStorageSize || 0),
            heapMB: MB(usage.usedSize + (usage.backingStorageSize || 0)),
        },
        stelle: reihe(stelle),
        spiel: reihe(spiel),
        rufer: reihe(rufer),
    };
    if (sek) Object.assign(o, { sek: +sek.toFixed(1), bilder, mbJeS: +(summe / 1048576 / sek).toFixed(2) });
    const jeS = (mb) => (sek ? `  ${String((mb / sek).toFixed(2)).padStart(6)} MB/s` : "");
    const zeilen = (r) => [...r.kopf, r.rest].map(([k, mb, pc], i) => `${String(i + 1).padStart(3)}  ${String(mb).padStart(7)} MB${jeS(mb)}  ${String(pc).padStart(5)} %  ${k}`);
    o.tafel = [
        sek
            ? `MÜLL-ZENSUS NACH ERZEUGER — ALLE Allokationen in ${o.sek} s Loop (${bilder} Bilder), gesammelte eingeschlossen: ${o.summeMB} MB = ${o.mbJeS} MB/s · davon Besteller an Bewohnern ${o.anBewohnernMB} MB`
            : `HEAP-ZENSUS NACH ERZEUGER — lebend nach 2× GC (Sampling-Heap-Profiler von V8) · davon Besteller an Bewohnern ${o.anBewohnernMB} MB`,
        `Heap ${o.heap.heapMB} MB = JS-Heap ${o.heap.jsMB} MB + Typed-Array-Speicher ${o.heap.typedMB} MB · Summe des Samplings ${o.summeMB} MB (${((100 * summe) / (usage.usedSize || 1)).toFixed(0)} % des JS-Heaps)`,
        ``,
        `NACH ALLOKATIONS-STELLE (Funktion · Datei:Zeile des Funktionsanfangs):`,
        ...zeilen(o.stelle),
        ``,
        `NACH BESTELLER IM SPIEL (der nächste Rahmen außerhalb vendor/ und nativ):`,
        ...zeilen(o.spiel),
        ``,
        `NACH BESTELLER ← RUFER (der Spiel-Rahmen, der den Besteller rief):`,
        ...zeilen(o.rufer),
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

// WAS EIN BEWOHNER HÄLT (w28-heap-stichprobe, `heap-zensus --modus bewohner`): je Feld der Bewohner (`_bewohnerSiedlungen[].liste[i]`)
// und je Feld der Siedlung die erreichbaren Objekte — EINMAL gezählt beim ersten Halter (ein geteiltes Material, eine geteilte
// Tafel fällt auf den ersten Bewohner), nie über `parent`, nie in Welt, Szene, Renderer, Kamera, DOM. Die Bytes sind eine
// SCHÄTZUNG nach der Form von V8 mit Zeiger-Kompression (Objekt 12 + 4 je Feld, eine Bruchzahl im Feld + 12, Array 16 + 4 bzw.
// 8 je Platz, Map/Set 16 bzw. 12 je Eintrag, Text 12 + Länge, EINMAL je Wert); die Typed Arrays EINMAL je ArrayBuffer. Dazu je
// Feld, wie viele VERSCHIEDENE Inhalte die N Bewohner tragen (Abdruck: der JSON-Text ohne Object3D, gekappt) — 1 heißt
// inhaltsgleich bei allen. Läuft in der SEITE (selbst-enthalten).
function bewohnerGewicht(o) {
    o = o || {};
    const r = window.anazhRealm,
        st = r.state;
    const B = r._bewohnerSiedlungen;
    if (!B || !B.size) return { fehler: "keine _bewohnerSiedlungen" };
    const stop = new Set([r, st, st.scene, st.renderer, st.camera, window, document, st.playerMesh].filter(Boolean));
    const seen = new Set();
    let knoten = 0;
    const DECKEL = o.deckel || 2e7;
    const zahlFeld = (v) => typeof v === "number" && !Number.isInteger(v);
    const lauf = (wurzel, z) => {
        const stapel = [wurzel];
        while (stapel.length) {
            const x = stapel.pop();
            if (x == null) continue;
            const t = typeof x;
            if (t === "string") {
                if (!seen.has(x)) (seen.add(x), (z.js += 12 + x.length));
                continue;
            }
            if (t !== "object") continue;
            if (stop.has(x) || seen.has(x)) continue;
            if (typeof Node !== "undefined" && x instanceof Node) continue;
            seen.add(x);
            z.n++;
            if (++knoten > DECKEL) throw new Error("bewohnerGewicht: Deckel " + DECKEL + " Knoten");
            if (ArrayBuffer.isView(x)) {
                z.js += 40;
                if (!seen.has(x.buffer)) (seen.add(x.buffer), (z.typed += x.buffer.byteLength));
                continue;
            }
            if (x instanceof ArrayBuffer) {
                z.typed += x.byteLength;
                continue;
            }
            if (Array.isArray(x)) {
                let dbl = false;
                for (let i = 0; i < x.length; i++) {
                    const v = x[i];
                    if (zahlFeld(v)) dbl = true;
                    else if (v && (typeof v === "object" || typeof v === "string")) stapel.push(v);
                }
                z.js += 32 + (dbl ? 8 : 4) * x.length;
                continue;
            }
            if (x instanceof Map) {
                z.js += 40 + 16 * x.size;
                for (const [k, v] of x) (stapel.push(k), stapel.push(v));
                continue;
            }
            if (x instanceof Set) {
                z.js += 40 + 12 * x.size;
                for (const v of x) stapel.push(v);
                continue;
            }
            if (x instanceof WeakMap || x instanceof WeakSet || x instanceof Promise) {
                z.js += 24;
                continue;
            }
            if (typeof GPUBuffer !== "undefined" && (x instanceof GPUBuffer || x instanceof GPUTexture)) continue;
            const keys = Object.keys(x);
            z.js += 12 + 4 * keys.length;
            for (const k of keys) {
                if (k === "parent" && x.isObject3D) continue;
                let v;
                try {
                    v = x[k];
                } catch {
                    continue;
                }
                if (zahlFeld(v)) z.js += 12;
                else if (v && (typeof v === "object" || typeof v === "string")) stapel.push(v);
            }
        }
    };
    const abdruck = (v) => {
        if (v == null || typeof v !== "object") return String(v);
        if (v.isObject3D) return "O3D";
        const ws = new WeakSet();
        try {
            const s = JSON.stringify(v, (k, x) => {
                if (x && typeof x === "object") {
                    if (x.isObject3D || x.isMaterial || x.isBufferGeometry || x === r) return "#";
                    if (ArrayBuffer.isView(x)) return "TA" + x.length;
                    if (ws.has(x)) return "@";
                    ws.add(x);
                    if (x instanceof Map) return [...x].slice(0, 2000);
                    if (x instanceof Set) return [...x].slice(0, 2000);
                }
                return x;
            });
            return s && s.length > 40000 ? s.slice(0, 40000) + "…" + s.length : s;
        } catch (e) {
            return "?" + e.message;
        }
    };
    const leer = () => ({ js: 0, typed: 0, n: 0 });
    const feld = new Map(),
        siedlung = new Map(),
        abd = new Map();
    let bewohner = 0,
        mitLeib = 0;
    const skelette = new Set();
    let knochen = 0,
        skinned = 0;
    const kopf = leer();
    for (const S of B.values()) {
        for (const b of S.liste || []) {
            bewohner++;
            if (b.leib) mitLeib++;
            if (!seen.has(b)) (seen.add(b), (kopf.js += 12 + 4 * Object.keys(b).length), kopf.n++);
            for (const k of Object.keys(b)) {
                const v = b[k];
                if (v == null || (typeof v !== "object" && typeof v !== "string")) continue;
                const z = feld.get(k) || feld.set(k, leer()).get(k);
                lauf(v, z);
                if (o.abdruck !== false && k !== "leib") {
                    const a = abd.get(k) || abd.set(k, new Set()).get(k);
                    if (a.size < 400) a.add(abdruck(v));
                }
            }
            if (b.leib && b.leib.traverse)
                b.leib.traverse((x) => {
                    if (x.isSkinnedMesh && x.skeleton) {
                        skinned++;
                        if (!skelette.has(x.skeleton)) (skelette.add(x.skeleton), (knochen += x.skeleton.bones.length));
                    }
                });
        }
        for (const k of Object.keys(S)) {
            if (k === "liste") continue;
            const z = siedlung.get(k) || siedlung.set(k, leer()).get(k);
            lauf(S[k], z);
        }
    }
    const mb = (x) => +(x / 1048576).toFixed(2);
    const reihe = (m) =>
        [...m]
            .map(([k, z]) => ({ feld: k, jsMB: mb(z.js), typedMB: mb(z.typed), objekte: z.n, verschieden: abd.has(k) ? abd.get(k).size : null }))
            .sort((p, q) => q.jsMB + q.typedMB - (p.jsMB + p.typedMB));
    const felder = reihe(feld),
        sied = reihe(siedlung);
    const sum = (a, k) => +a.reduce((s, z) => s + z[k], 0).toFixed(2);
    return {
        siedlungen: B.size,
        bewohner,
        mitLeib,
        skinned,
        skelette: skelette.size,
        knochen,
        kopfMB: mb(kopf.js),
        bewohnerJsMB: +(sum(felder, "jsMB") + mb(kopf.js)).toFixed(2),
        bewohnerTypedMB: sum(felder, "typedMB"),
        siedlungJsMB: sum(sied, "jsMB"),
        siedlungTypedMB: sum(sied, "typedMB"),
        knoten,
        felder: felder.slice(0, o.top || 30),
        siedlung: sied.slice(0, o.top || 30),
    };
}

function bewohnerTafel(o) {
    const z = (a) => a.map((x) => `${String(x.jsMB).padStart(8)} ${String(x.typedMB).padStart(8)} ${String(x.objekte).padStart(9)}  ${x.verschieden == null ? "     " : String(x.verschieden).padStart(5)}  ${x.feld}`);
    return [
        `WAS DIE BEWOHNER HALTEN (Schätzung der Form, EINMAL beim ersten Halter) — Heap nach GC ${o.heapMB} MB (JS ${o.jsMB} + Typed ${o.typedMB})`,
        `${o.bewohner} Bewohner in ${o.siedlungen} Siedlungen, ${o.mitLeib} mit Leib, ${o.skinned} SkinnedMesh, ${o.skelette} Skelette, ${o.knochen} Knochen`,
        `an den Bewohnern JS ${o.bewohnerJsMB} MB + Typed ${o.bewohnerTypedMB} MB · an den Siedlungen (ohne liste) JS ${o.siedlungJsMB} MB + Typed ${o.siedlungTypedMB} MB · ${o.knoten} Knoten`,
        `    JS MB  Typed MB   Objekte  versch.  Feld des Bewohners (versch. = verschiedene Inhalte unter allen, gekappt 400)`,
        ...z(o.felder),
        `    JS MB  Typed MB   Objekte           Feld der Siedlung`,
        ...z(o.siedlung),
    ].join("\n");
}

// DIE TEXTUR-KOPIEN UNTER DEM RENDERER (w28-heap-stichprobe, `heap-zensus --modus texturen|texturen-wache`): jedes Typed Array,
// das `image.data` (oder `source.data.data`) einer schon hochgeladenen Textur ist (`renderer.info.memoryMap`), EINMAL je ArrayBuffer,
// beim Namen (`name`, sonst der Pfad ab der Welt bzw. das Material der Szene). „dynamisch“: die Version wuchs seit der Wache;
// „Leser“: seit der Wache las ein Rahmen des SPIELS `image.data` unmittelbar (der Upload des Vendors zählt nicht). Läuft in der SEITE.
function texturen(o) {
    o = o || {};
    const r = window.anazhRealm,
        st = r.state,
        rend = st.renderer,
        reg = rend && rend.info && rend.info.memoryMap;
    if (!reg) return { fehler: "kein renderer.info.memoryMap" };
    const W = window.__texWache || (window.__texWache = { lese: new Map(), version: new Map(), still: false });
    W.still = true;
    const daten = (t) => {
        const im = t.image;
        if (im && ArrayBuffer.isView(im.data)) return [im, im.data];
        const sd = t.source && t.source.data;
        if (sd && ArrayBuffer.isView(sd.data)) return [sd, sd.data];
        return [null, null];
    };
    // die Namen: die Materialien der Szene, dann ein Gang ab der Welt (Tiefe 5, ohne Szene und Renderer)
    const pfad = new Map();
    let klasseVon;
    try {
        klasseVon = (x) => r._taeterKlasse(x);
        klasseVon(st.scene);
    } catch {
        klasseVon = (x) => x.name || x.type;
    }
    st.scene.traverse((x) => {
        for (const m of [].concat(x.material || [])) {
            if (!m) continue;
            for (const k in m) {
                const v = m[k];
                if (v && v.isTexture && !pfad.has(v)) pfad.set(v, "szene:" + klasseVon(x) + "." + k);
                if (v && v.isNode && v.value && v.value.isTexture && !pfad.has(v.value)) pfad.set(v.value, "szene:" + klasseVon(x) + "." + k);
            }
            if (m.uniforms) for (const k in m.uniforms) {
                const v = m.uniforms[k] && m.uniforms[k].value;
                if (v && v.isTexture && !pfad.has(v)) pfad.set(v, "szene:" + klasseVon(x) + ".u." + k);
            }
        }
    });
    const gesehen = new Set([window, st.scene, rend, document]);
    const q = [[r, "r", 0]];
    for (let i = 0; i < q.length && i < 600000; i++) {
        const [x, p, d] = q[i];
        let keys;
        try {
            keys = x instanceof Map ? [...x.keys()].slice(0, 5000) : Object.keys(x).slice(0, 5000);
        } catch {
            continue;
        }
        for (const k of keys) {
            let v;
            try {
                v = x instanceof Map ? x.get(k) : x[k];
            } catch {
                continue;
            }
            if (!v || typeof v !== "object" || gesehen.has(v)) continue;
            gesehen.add(v);
            const kn = typeof k === "string" ? k : "#";
            if (v.isTexture) {
                if (!pfad.has(v)) pfad.set(v, p + "." + kn);
                continue;
            }
            if (ArrayBuffer.isView(v) || (v.isObject3D && d > 1)) continue;
            if (d < 5) q.push([v, p + "." + kn, d + 1]);
        }
    }
    const liste = [];
    const ab = new Set();
    for (const [t] of reg) {
        if (!t || !t.isTexture) continue;
        const [halt, arr] = daten(t);
        if (!arr || !arr.byteLength) continue;
        const neu = !ab.has(arr.buffer);
        ab.add(arr.buffer);
        const im = t.image || {};
        liste.push({ t, halt, arr, bytes: neu ? arr.buffer.byteLength : 0, name: t.name || pfad.get(t) || "?" + (t.constructor && t.constructor.name), gr: [im.width, im.height, im.depth].filter((v) => v > 1).join("×") });
    }
    if ((o.modus || "zaehlen") === "wache") {
        let n = 0;
        for (const e of liste) {
            W.version.set(e.t, e.t.version);
            if (W.lese.has(e.t)) continue;
            const eigen = Object.getOwnPropertyDescriptor(e.halt, "data");
            if (!eigen || !("value" in eigen)) continue;
            let wert = eigen.value;
            const buch = { n: 0, stellen: new Map() };
            W.lese.set(e.t, buch);
            Object.defineProperty(e.halt, "data", {
                configurable: true,
                enumerable: true,
                get() {
                    if (!W.still) {
                        buch.n++;
                        if (buch.n <= 30) {
                            const alt = Error.stackTraceLimit;
                            Error.stackTraceLimit = 4;
                            const s = (new Error().stack || "").split("\n").slice(2);
                            Error.stackTraceLimit = alt;
                            const z0 = (s[0] || "?").trim().replace(/^at /, "").replace(/\?v=[^:]*/, "").replace(/https?:\/\/[^/]+\//, "");
                            const k = (/\/vendor\//.test(s[0] || "") ? "vendor:" : "") + z0;
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
        W.still = false;
        return { wache: n, texturen: liste.length };
    }
    const mb = (x) => +(x / 1048576).toFixed(2);
    const zeilen = liste
        .map((e) => {
            const buch = W.lese.get(e.t);
            const stellen = buch ? [...buch.stellen].sort((p, q) => q[1] - p[1]) : [];
            const leser = stellen.filter(([s]) => !s.startsWith("vendor:"));
            const dyn = W.version.has(e.t) && e.t.version > W.version.get(e.t);
            return {
                name: e.name.slice(0, 110),
                gr: e.gr,
                typ: e.arr.constructor.name,
                mb: mb(e.bytes),
                dyn: dyn ? e.t.version - W.version.get(e.t) : 0,
                leser: leser.slice(0, 3).map(([s, c]) => c + "× " + s.slice(0, 120)),
                lesend: leser.length > 0,
                bewacht: !!buch,
            };
        })
        .sort((p, q) => q.mb - p.mb);
    W.still = false;
    const sum = (f) => +zeilen.filter(f).reduce((s, z) => s + z.mb, 0).toFixed(2);
    return {
        texturen: zeilen.length,
        summeMB: sum(() => true),
        dynMB: sum((z) => z.dyn),
        leserMB: sum((z) => !z.dyn && z.lesend),
        leserfreiMB: sum((z) => !z.dyn && !z.lesend),
        wacheSeit: W.lese.size,
        zeilen: zeilen.slice(0, o.top || 30),
    };
}

function texturTafel(o) {
    if (o.wache != null) return `TEXTUR-WACHE an ${o.wache} von ${o.texturen} Texturen mit CPU-Daten`;
    const z = (o.zeilen || []).map(
        (x) => `${String(x.mb).padStart(8)}  ${String(x.dyn || "").padStart(5)}  ${x.lesend ? "LESER" : x.dyn ? "     " : "frei "}  ${x.typ.padEnd(17)} ${String(x.gr).padEnd(14)} ${x.name}${x.leser.length ? "\n            ↳ " + x.leser.join("\n            ↳ ") : ""}`
    );
    return [
        `TEXTUR-KOPIEN AUF DER CPU — Heap nach GC ${o.heapMB} MB (JS ${o.jsMB} + Typed ${o.typedMB}) · ${o.texturen} Texturen mit CPU-Daten ${o.summeMB} MB · dynamisch ${o.dynMB} · mit Leser ${o.leserMB} · OHNE LESER ${o.leserfreiMB} MB (Wache an ${o.wacheSeit})`,
        `      MB   +Ver.  Urteil Typ               Größe          Name`,
        ...z,
    ].join("\n");
}

module.exports = { verdichten, selbsttest, spiegel, spiegelTafel, bewohnerGewicht, bewohnerTafel, texturen, texturTafel };
