#!/usr/bin/env node
// ============================================================================
// DIE VENDOR-ANKER-WAND — gate:vendor-anker (GOLD 3, 19.07.)
//
// Der Stamm patcht/liest den minifizierten three-r184-Vendor zur Laufzeit an
// fünf Organen (Observer-Diät · Uniform-Heimat · Reife-Wache · Batch-Textur-
// Wächter · Bundle-Pass-Physik). Jeder dieser Eingriffe hängt an EXAKTEN
// Vendor-Wahrheiten (Methoden-/Feld-Namen, Verhaltens-Signaturen). Ein
// three-Versions-Sprung würde sie STILL brechen — die Welt liefe, aber die
// Diät griffe nie, die Reife-Wache wache über nichts.
//
// Diese Wand pinnt: (1) den Fingerabdruck (Größe + FNV-Hash) jeder Vendor-
// Datei — ein Bump ist ein BEWUSSTER Akt (Hash hier nachziehen = der Vertrag,
// alle Anker neu zu beweisen); (2) die ANKER-Substrings, von denen unsere
// Laufzeit-Eingriffe abhängen. Fällt ein Anker, nennt die Wand den Täter und
// das abhängige Organ BEIM NAMEN.
//
// Selbst-Test: --selftest beweist, dass ein manipulierter Anker feuert.
// ============================================================================
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

// FNV-1a (dieselbe Hash-Familie wie der Warm-Start-Byte-Beweis).
function fnv(buf) {
    let h = 0x811c9dc5;
    for (let i = 0; i < buf.length; i++) {
        h ^= buf[i];
        h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16);
}

// Die gepinnten Vendor-Fingerabdrücke (Bump = Hash bewusst nachziehen).
const PINS = [
    { file: "vendor/three.webgpu.min.js", hash: null },
    { file: "vendor/three.core.min.js", hash: null },
    { file: "vendor/three.tsl.min.js", hash: null },
];

// Die Anker: Vendor-Substring → abhängiges Stamm-Organ.
const ANKER = [
    // Observer-Diät + Batch-Textur-Wächter (setupObserver-Naht + Monitor-Kurzschluss)
    { file: "vendor/three.webgpu.min.js", sub: "setupObserver(e){return new", organ: "_materialObserverDiaet (Diät-Naht)" },
    { file: "vendor/three.webgpu.min.js", sub: "this.hasNode=this.containsNode(", organ: "_materialObserverDiaet (hasNode-Kurzschluss)" },
    { file: "vendor/three.webgpu.min.js", sub: "needsRefresh(e,t){if(this.hasNode||this.hasAnimation", organ: "_materialObserverDiaet (Monitor-Bahn)" },
    // Die EINE Diät-Prüfung: r184 refresht je Render vor seiner eigenen Bundle-Abkürzung; die Bundle-Version im
    // Objekt-Datensatz pflegt nur equals()
    { file: "vendor/three.webgpu.min.js", sub: "if(this.renderId!==r)return this.renderId=r,!0;const s=!0===e.object.static,i=null!==e.bundle&&!0===e.bundle.static&&this.getRenderObjectData(e).version===e.bundle.version", organ: "AnazhRealm._diaetRefresh (Bundle-Replay-Abkürzung vor der renderId-Wand)" },
    { file: "vendor/three.webgpu.min.js", sub: "null!==e.bundle&&(a.version=e.bundle.version)", organ: "AnazhRealm._diaetRefresh (Bundle-Version im Objekt-Datensatz)" },
    // Die Schatten-Diät: EIN Schatten-Material je Licht, die Original-Knoten hängen je Objekt darin
    { file: "vendor/three.webgpu.min.js", sub: 't.isShadowPassMaterial=!0,t.name="ShadowMaterial"', organ: "Schatten-Diät (_configureRenderer, isShadowPassMaterial)" },
    { file: "vendor/three.webgpu.min.js", sub: "e.isShadowPassMaterial){const{colorNode:t,depthNode:r,positionNode:s}=this._getShadowNodes(i)", organ: "Schatten-Diät (Original-Knoten im Override)" },
    // Der Fenster-Wechsel: die Viewport-Tiefe ist ein Klon je Render-Ziel (der EINE Leser bindet nach setSize neu)
    { file: "vendor/three.webgpu.min.js", sub: "getTextureForReference(e=null){", organ: "_wasserTiefeNeuBinden (Viewport-Tiefen-Klon je Ziel)" },
    // Uniform-Heimat (shared-Gruppen-Klon-Weiche + renderGroup-Export)
    { file: "vendor/three.webgpu.min.js", sub: "groupNode.shared", organ: "_uniformHeimatTeilen (Klon-Weiche)" },
    { file: "vendor/three.webgpu.min.js", sub: "setGroup(e){return this.groupNode=e,this}", organ: "_uniformHeimatTeilen (setGroup)" },
    // Reife-Wache (Record droppt unfertige Pipelines + versiegelt danach)
    { file: "vendor/three.webgpu.min.js", sub: "isReady(u)&&", organ: null, weich: true },
    { file: "vendor/three.webgpu.min.js", sub: "u.version=s.version", organ: "_bundleReifeWache (Record-Versiegelung)" },
    // Bundle-Pass-Physik (Wasser bleibt draußen, solange der Copy den Pass bricht)
    { file: "vendor/three.webgpu.min.js", sub: "currentPass.end()", organ: "Wasser-Bundle-Wand (copyFramebufferToTexture-Pass-Bruch)" },
    // Bundle-Replay-Buchung: die Draw-Wahrheit im Info (der Replay zieht aufgenommene RenderObjects)
    { file: "vendor/three.webgpu.min.js", sub: "_renderBundle(e,t,r){const{bundleGroup:s,camera:i,renderList:n}=e,a=this._currentRenderContext,o=this._bundles.get(s,i,a)", organ: "Bundle-Replay-Buchung (renderer._renderBundle → info.update)" },
    { file: "vendor/three.webgpu.min.js", sub: "getDrawParameters(){", organ: "Bundle-Replay-Buchung (Draw-Parameter)" },
    // Der stabile Puffer-Name: InstanceNode baut die Matrix-Puffer, der WGSL-Builder nennt sie ohne Namen nach der id
    { file: "vendor/three.webgpu.min.js", sub: "_createInstanceMatrixNode(e,t){let r;const{instanceMatrix:s}=this", organ: "Instanz-Puffer-Name (InstanceNode._createInstanceMatrixNode → setName)" },
    { file: "vendor/three.webgpu.min.js", sub: '"NodeBuffer_"+', organ: "Instanz-Puffer-Name (der id-Name, den setName ersetzt)" },
    // instanceMatrix-Versions-Wächter (Kern-Setter)
    { file: "vendor/three.core.min.js", sub: "set needsUpdate(", organ: "Diät-Versions-Wächter (Attribut-Versionen)" },
    // Chunk-Boden-Entlassung (Upload-Probe: backend.get(attr).buffer existiert erst nach createAttribute)
    {
        file: "vendor/three.webgpu.min.js",
        sub: "createAttribute(e,t){const r=this._getBufferAttribute(e)",
        organ: "_chunkBodenGpuHat (Entlassungs-Upload-Probe)",
    },
];

// Die Diät-Prüfung aus dem Stamm schneiden und gegen Schein-Beobachter fahren. `manipuliert` entfernt den
// Render-Stempel (die Abkürzung griffe dann auch, bevor ein Refresh die geteilte renderGroup schrieb).
function diaetLaden(manipuliert) {
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const a = stamm.indexOf("AnazhRealm._diaetRefresh = function");
    const e = a < 0 ? -1 : stamm.indexOf("\n};\n", a);
    if (a < 0 || e < 0) return null;
    let src = stamm.slice(a, e + 3);
    if (manipuliert) src = src.replace("rend._anazhDiaetRid === rid &&", "true &&");
    const AnazhRealm = {};
    new Function("AnazhRealm", src)(AnazhRealm);
    return AnazhRealm._diaetRefresh;
}
function diaetLauf(fn) {
    // Schein-Beobachter je Objekt (jede Pflanzen-Gruppe hat ihre eigene Geometrie → ihren eigenen Beobachter).
    const beob = () => ({
        renderObjects: new Map(),
        renderId: -1,
        getRenderObjectData(ro) {
            let d = this.renderObjects.get(ro);
            if (!d) {
                d = { version: ro.bundle ? ro.bundle.version : undefined };
                this.renderObjects.set(ro, d);
            }
            return d;
        },
    });
    // Die r184-Vendor-Bahn eines TSL-Materials: renderId-Wand vor allem (hasNode/Erst-Init ⇒ true).
    const altNR = function (ro, frame) {
        if (!this.renderObjects.has(ro)) return this.getRenderObjectData(ro), true;
        if (this.renderId !== frame.renderId) return (this.renderId = frame.renderId), true;
        return false;
    };
    const rend = {};
    const bundle = { static: true, version: 1 };
    const objekte = [];
    for (let i = 0; i < 50; i++) {
        const obj = { isInstancedMesh: true, instanceMatrix: { version: 0 }, instanceColor: null, material: {} };
        objekte.push({ ro: { object: obj, material: obj.material, bundle }, o: beob() });
    }
    const frei = { ro: { object: { material: {} }, material: {}, bundle: null }, o: beob() };
    let rid = 0;
    const render = (vorher) => {
        rid++;
        const frame = { renderer: rend, renderId: rid };
        if (vorher) vorher();
        let n = 0;
        for (const x of objekte) if (fn(x.o, x.ro, frame, altNR)) n++;
        const nFrei = fn(frei.o, frei.ro, frame, altNR) ? 1 : 0;
        return { n, nFrei };
    };
    const r1 = render();
    const r2 = render();
    const r3 = render();
    const r4 = render(() => objekte[7].ro.object.instanceMatrix.version++);
    const r5 = render(() => bundle.version++);
    const r6 = render();
    return { r1, r2, r3, r4, r5, r6 };
}
function diaetProbe(selftest) {
    const fehler = [];
    const fn = diaetLaden(false);
    if (!fn) return { fehler: ["AnazhRealm._diaetRefresh nicht im Stamm gefunden"], selbstFeuert: false };
    const pruefe = (z) => {
        const f = [];
        if (z.r1.n !== 50) f.push(`Erst-Render: alle 50 Objekte initialisieren (ist ${z.r1.n})`);
        if (z.r2.n !== 1 || z.r3.n !== 1)
            f.push(`Bundle-Replay: je Render GENAU EIN Refresh (der Stempel schreibt die renderGroup) — ist ${z.r2.n}/${z.r3.n}`);
        if (z.r4.n !== 2) f.push(`Instanz-Mutation: der Stempel-Refresh + das mutierte Objekt (ist ${z.r4.n})`);
        if (z.r5.n !== 50) f.push(`Bundle-Neuaufnahme: alle 50 refreshen einmal (ist ${z.r5.n})`);
        if (z.r6.n !== 1) f.push(`nach der Neuaufnahme wieder GENAU EIN Refresh (ist ${z.r6.n})`);
        if ([z.r1, z.r2, z.r3, z.r4, z.r5, z.r6].some((r) => r.nFrei !== 1))
            f.push("ein Objekt OHNE Bundle kürzt nie ab (Vendor-Bahn je Render)");
        return f;
    };
    fehler.push(...pruefe(diaetLauf(fn)));
    let selbstFeuert = false;
    if (selftest) selbstFeuert = pruefe(diaetLauf(diaetLaden(true))).length > 0;
    return { fehler, selbstFeuert };
}

function main() {
    const selftest = process.argv.includes("--selftest");
    const errs = [];
    const srcCache = new Map();
    const les = (f) => {
        if (!srcCache.has(f)) srcCache.set(f, fs.readFileSync(path.join(root, f)));
        return srcCache.get(f);
    };
    // (1) Fingerabdrücke: beim ersten Lauf gepinnt (Datei anker.lock.json),
    // danach Pflicht-Gleichheit — ein Vendor-Bump ändert die Lock-Datei
    // BEWUSST (im Diff sichtbar = der Vertrags-Akt).
    const lockPfad = path.join(root, "vendor", "anker.lock.json");
    let lock = fs.existsSync(lockPfad) ? JSON.parse(fs.readFileSync(lockPfad, "utf8")) : null;
    const ist = {};
    for (const p of PINS) {
        const buf = les(p.file);
        ist[p.file] = { bytes: buf.length, fnv: fnv(buf) };
    }
    if (!lock) {
        fs.writeFileSync(lockPfad, JSON.stringify(ist, null, 4) + "\n");
        console.log("  ℹ anker.lock.json GEMINTET (erster Lauf) — ab jetzt ist jeder Vendor-Bump ein bewusster Akt.");
        lock = ist;
    }
    for (const f in ist) {
        if (!lock[f]) errs.push(`${f}: kein Lock-Eintrag (Lock nachziehen = bewusster Akt)`);
        else if (lock[f].fnv !== ist[f].fnv || lock[f].bytes !== ist[f].bytes)
            errs.push(`${f}: Fingerabdruck weicht vom Lock ab (${ist[f].bytes} B, fnv ${ist[f].fnv}) — Vendor-Bump? ALLE Anker neu beweisen + Lock nachziehen`);
    }
    // (2) Anker:
    let geprueft = 0;
    for (const a of ANKER) {
        if (a.weich) continue; // dokumentarisch, kein harter Substring (minifier-variabel)
        geprueft++;
        const src = les(a.file).toString("latin1");
        const sub = selftest && a.organ && a.organ.startsWith("_materialObserverDiaet (hasNode") ? a.sub + "_MANIPULIERT" : a.sub;
        if (!src.includes(sub)) errs.push(`ANKER GEFALLEN: "${a.sub}" fehlt in ${a.file} → Organ: ${a.organ}`);
    }
    // (3) DIE DIÄT-PRÜFUNG am Schein-Beobachter (r184-Semantik: renderId-Wand, renderObjects, Datensatz mit
    // Bundle-Version): AnazhRealm._diaetRefresh aus dem Stamm-Quelltext, deterministisch, GPU-frei.
    const diaet = diaetProbe(selftest);
    for (const e of diaet.fehler) errs.push("DIÄT: " + e);
    if (selftest) {
        const feuert = errs.some((e) => e.includes("hasNode"));
        const diaetFeuert = diaet.selbstFeuert;
        console.log(feuert ? "✅ SELBST-TEST: die Anker-Wand feuert (manipulierter Anker erkannt)" : "❌ SELBST-TEST: die Wand ist vakuös");
        console.log(
            diaetFeuert
                ? "✅ SELBST-TEST: die Diät-Probe feuert (ohne Render-Stempel bliebe die renderGroup ungeschrieben)"
                : "❌ SELBST-TEST: die Diät-Probe ist vakuös"
        );
        process.exit(feuert && diaetFeuert ? 0 : 1);
    }
    if (errs.length) {
        console.error("⛔ DIE VENDOR-ANKER-WAND:");
        for (const e of errs) console.error("   ❌ " + e);
        process.exit(1);
    }
    console.log(
        `✅ DIE VENDOR-ANKER-WAND steht — ${PINS.length} Fingerabdrücke gepinnt, ${geprueft} Anker der Laufzeit-Organe leben im Vendor, die Diät-Prüfung hält am Schein-Beobachter (je Render GENAU EIN Refresh).`
    );
}
main();
