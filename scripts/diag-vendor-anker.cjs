#!/usr/bin/env node
// ============================================================================
// DIE VENDOR-ANKER-WAND — gate:vendor-anker (GOLD 3, 19.07.)
//
// Der Stamm patcht/liest den minifizierten three-r184-Vendor zur Laufzeit an
// seinen Organen (Observer-Diät + Kamera-Treue · Schatten-Diät · Uniform-Heimat ·
// Schatten-Takt · Instanz-Puffer-Name · Satz-Teil-Upload). Jeder dieser Eingriffe
// hängt an EXAKTEN Vendor-Wahrheiten (Methoden-/Feld-Namen, Verhaltens-
// Signaturen). Ein three-Versions-Sprung würde sie STILL brechen — die Welt liefe,
// aber die Diät griffe nie. (Die Region-RenderBundles fielen 04.10. — mit ihnen die
// Reife-Wache, die Bundle-Reihenfolge, die Replay-Buchung und ihre Anker.)
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
    // DIE KAMERA-TREUE des direkten Pfads: Beobachter UND geteilte Bindegruppe (render · frame: Kamera-Matrizen,
    // uLodAuge) hängen am PROGRAMM (NodeBuilderState), nie an der Welt; die renderId-Wand je Beobachter schreibt sie
    // je Programm und Render. Jede Abkürzung der Diät muss diese Gruppe je Programm und Render selbst schreiben.
    { file: "vendor/three.webgpu.min.js", sub: "getMonitor(){return this._monitor||(this._monitor=this.getNodeBuilderState().observer)}", organ: "AnazhRealm._diaetRefresh (Beobachter je Programm)" },
    { file: "vendor/three.webgpu.min.js", sub: "createBindings(){const e=[];for(const t of this.bindings){if(!0!==t.bindings[0].groupNode.shared){", organ: "AnazhRealm._diaetRefresh (geteilte Gruppe je Programm)" },
    { file: "vendor/three.webgpu.min.js", sub: "if(this.renderId!==r)return this.renderId=r,!0;", organ: "AnazhRealm._diaetRefresh (renderId-Wand je Beobachter)" },
    // Die Schatten-Diät: EIN Schatten-Material je Licht, die Original-Knoten hängen je Objekt darin
    { file: "vendor/three.webgpu.min.js", sub: 't.isShadowPassMaterial=!0,t.name="ShadowMaterial"', organ: "Schatten-Diät (_configureRenderer, isShadowPassMaterial)" },
    { file: "vendor/three.webgpu.min.js", sub: "e.isShadowPassMaterial){const{colorNode:t,depthNode:r,positionNode:s}=this._getShadowNodes(i)", organ: "Schatten-Diät (Original-Knoten im Override)" },
    // DER SCHATTEN-STOFF JE OBJEKT: renderObject setzt je Objekt alphaTest des Originals auf den EINEN geteilten
    // Schatten-Stoff, der Setter zählt bei jedem Wechsel über 0 die Version; jede Version prüft je Bürger den Schlüssel
    // und die Pipeline — _configureRenderer trägt je Objekt die Version des Original-Materials in den Stoff.
    { file: "vendor/three.core.min.js", sub: "set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}", organ: "Schatten-Stoff je Objekt (der Setter, den der Stoff überschreibt)" },
    { file: "vendor/three.webgpu.min.js", sub: "e.alphaTest=i.alphaTest,e.alphaMap=i.alphaMap,e.transparent=", organ: "Schatten-Stoff je Objekt (renderObject setzt die Werte je Objekt)" },
    { file: "vendor/three.webgpu.min.js", sub: "(l.version!==t.version||l.needsUpdate)&&(l.initialCacheKey!==l.getCacheKey()", organ: "Schatten-Stoff je Objekt (Version → Schlüssel-Prüfung je Bürger)" },
    { file: "vendor/three.webgpu.min.js", sub: "t.material===s&&t.materialVersion===s.version", organ: "Schatten-Stoff je Objekt (Version → Pipeline-Prüfung je Bürger)" },
    { file: "vendor/three.webgpu.min.js", sub: "this._currentRenderObjectFunction=this._renderObjectFunction||this.renderObject", organ: "Schatten-Stoff je Objekt (renderObject am Renderer gelesen)" },
    // Der Fenster-Wechsel: die Viewport-Tiefe ist ein Klon je Render-Ziel (der EINE Leser bindet nach setSize neu)
    { file: "vendor/three.webgpu.min.js", sub: "getTextureForReference(e=null){", organ: "_tiefenLeserNeuBinden (Viewport-Tiefen-Klon je Ziel)" },
    // Der Schatten-Takt (_loopShadowUpdate): der EINE Leser je Licht, die Matrix nur im Schatten-Render, die
    // Matrix-Uniform rechnet nur bei abgeschalteter Map selbst nach — sonst bliebe eine übersprungene Kaskade
    // nicht konsistent zu ihrer Map.
    { file: "vendor/three.webgpu.min.js", sub: "updateBefore(e){const{shadow:t}=this;let r=t.needsUpdate||t.autoUpdate;", organ: "_loopShadowUpdate (Leser je Licht)" },
    { file: "vendor/three.webgpu.min.js", sub: "renderShadow(e){const{shadow:t,shadowMap:r,light:s}=this,{renderer:i,scene:n}=e;t.updateMatrices(s)", organ: "_loopShadowUpdate (Matrix nur im Render)" },
    { file: "vendor/three.webgpu.min.js", sub: "renderer.shadowMap.enabled||(e.shadow.camera.coordinateSystem!==", organ: "_loopShadowUpdate (Uniform nur ohne Map)" },
    // Uniform-Heimat (shared-Gruppen-Klon-Weiche + renderGroup-Export)
    { file: "vendor/three.webgpu.min.js", sub: "groupNode.shared", organ: "_uniformHeimatTeilen (Klon-Weiche)" },
    { file: "vendor/three.webgpu.min.js", sub: "setGroup(e){return this.groupNode=e,this}", organ: "_uniformHeimatTeilen (setGroup)" },
    // Der stabile Puffer-Name: InstanceNode baut die Matrix-Puffer, der WGSL-Builder nennt sie ohne Namen nach der id
    { file: "vendor/three.webgpu.min.js", sub: "_createInstanceMatrixNode(e,t){let r;const{instanceMatrix:s}=this", organ: "Instanz-Puffer-Name (InstanceNode._createInstanceMatrixNode → setName)" },
    { file: "vendor/three.webgpu.min.js", sub: '"NodeBuffer_"+', organ: "Instanz-Puffer-Name (der id-Name, den setName ersetzt)" },
    // instanceMatrix-Versions-Wächter (Kern-Setter)
    { file: "vendor/three.core.min.js", sub: "set needsUpdate(", organ: "Diät-Versions-Wächter (Attribut-Versionen)" },
    // Der Satz (Welle B): ein Chunk ist ein Bereich im Pool-Puffer — sein Upload ist ein Teil-Schreiben ab dem
    // Bereichs-Anfang (updateRanges → queue.writeBuffer(offset)); ohne diese Bahn lüde jeder Chunk den ganzen Satz.
    {
        file: "vendor/three.webgpu.min.js",
        sub: "const o=t.updateRanges;if(0===o.length)s.queue.writeBuffer(n,0,a,0);else{",
        organ: "_chunkSatzEin/_chunkSatzMarke (Teil-Upload je Chunk-Bereich)",
    },
];

// DIE DIÄT-PRÜFUNG (Kamera-Treue des direkten Pfads): die Diät-Funktionen aus dem Stamm schneiden (vom ersten
// `AnazhRealm._diaet… = function` bis zum Ende von `_diaetRefresh`) und gegen Schein-Programme fahren — r184-
// Semantik: EIN Beobachter und EINE geteilte Gruppe je Programm, mehrere Objekte je Programm, die Vendor-Bahn
// (Kopf → renderId-Wand → equals()). Manipulationen für den Selbsttest: "abkuerzung" kürzt jedes bekannte Objekt
// ohne Schreiben ab (die Klasse der Bundle-Abkürzung V18.518), "schreiben" nimmt der Diät ihr Schreiben der
// geteilten Gruppe (falls sie eins hat).
function diaetLaden(manipuliert) {
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const b = stamm.indexOf("AnazhRealm._diaetRefresh = function");
    if (b < 0) return null;
    const s0 = stamm.indexOf("AnazhRealm._diaetGeteiltSchreiben = function");
    const a = s0 >= 0 && s0 < b ? s0 : b;
    const e = stamm.indexOf("\n};\n", b);
    if (e < 0) return null;
    let src = stamm.slice(a, e + 3);
    if (manipuliert === "schreiben") {
        const vor = src;
        src = src.split("AnazhRealm._diaetGeteiltSchreiben(rend, ro);").join("");
        if (src === vor) return null;
    }
    const AnazhRealm = {};
    new Function("AnazhRealm", src)(AnazhRealm);
    const echt = AnazhRealm._diaetRefresh;
    if (manipuliert === "abkuerzung")
        return (obs, ro, frame, altNR) => (obs.renderObjects.has(ro) ? false : echt(obs, ro, frame, altNR));
    return echt;
}
function diaetLauf(fn) {
    const N_PROG = 20,
        N_OBJ = 50;
    let geschrieben = null,
        objektDurchDiaet = 0;
    const beobachter = () => ({
        renderObjects: new Map(),
        renderId: -1,
        hasNode: false,
        hasAnimation: false,
        getRenderObjectData(ro) {
            let d = this.renderObjects.get(ro);
            if (!d) {
                d = { welt: ro.object.welt };
                this.renderObjects.set(ro, d);
            }
            return d;
        },
        needsVelocity() {
            return false;
        },
        getLights() {
            return [];
        },
        equals(ro) {
            const d = this.getRenderObjectData(ro);
            if (d.welt !== ro.object.welt) {
                d.welt = ro.object.welt;
                return false;
            }
            return true;
        },
    });
    // Die r184-Vendor-Bahn eines Beobachters: Kopf (hasNode/Animation/Erst-Init) → renderId-Wand → equals().
    const altNR = function (ro, frame) {
        if (this.hasNode || this.hasAnimation || !this.renderObjects.has(ro)) {
            this.getRenderObjectData(ro);
            return true;
        }
        if (this.renderId !== frame.renderId) {
            this.renderId = frame.renderId;
            return true;
        }
        return this.equals(ro, [], frame.renderId) !== true;
    };
    // Der Schein-Renderer: was die Diät selbst schreibt (Knoten der Gruppe + Upload), zählt je Programm.
    const rend = {
        _nodes: {
            updateBefore() {},
            getNodeFrameForRender: () => ({ updateNode() {} }),
        },
        _bindings: {
            _update(g) {
                if (g.bindings[0].groupNode.shared === true) geschrieben.set(g.prog, (geschrieben.get(g.prog) || 0) + 1);
                else objektDurchDiaet++;
            },
        },
    };
    const programme = [];
    for (let p = 0; p < N_PROG; p++)
        programme.push({
            id: p,
            obs: beobachter(),
            geteilt: { prog: p, bindings: [{ groupNode: { shared: true } }] },
            nbs: {
                updateNodes: [{ getUpdateType: () => "render" }, { getUpdateType: () => "object" }],
                updateBeforeNodes: [],
                updateAfterNodes: [],
            },
        });
    const objekte = [];
    for (let i = 0; i < N_OBJ; i++) {
        const prog = programme[i % N_PROG];
        const obj = {
            isInstancedMesh: true,
            instanceMatrix: { version: 0 },
            instanceColor: null,
            material: { _anazhDiaet: true },
            welt: 0,
        };
        const objektGruppe = { bindings: [{ groupNode: { shared: false } }] };
        objekte.push({
            prog,
            ro: {
                object: obj,
                material: obj.material,
                lightsNode: {},
                getBindings: () => [prog.geteilt, objektGruppe],
                getNodeBuilderState: () => prog.nbs,
            },
        });
    }
    let rid = 0;
    const render = (vorher) => {
        rid++;
        const frame = { renderer: rend, renderId: rid };
        if (vorher) vorher();
        geschrieben = new Map();
        objektDurchDiaet = 0;
        const voll = new Set();
        for (let i = 0; i < objekte.length; i++) {
            const x = objekte[i];
            // Ein Voll-Refresh schreibt alle Gruppen des Objekts (die Vendor-Bahn), die geteilte eingeschlossen.
            if (fn(x.prog.obs, x.ro, frame, altNR)) {
                voll.add(i);
                geschrieben.set(x.prog.id, (geschrieben.get(x.prog.id) || 0) + 1);
            }
        }
        let fehlt = 0;
        for (const p of programme) if (!geschrieben.get(p.id)) fehlt++;
        return { voll, fehlt, objektDurchDiaet };
    };
    const r1 = render();
    const r2 = render();
    const r3 = render();
    const r4 = render(() => objekte[7].ro.object.welt++);
    const r5 = render(() => objekte[11].ro.object.instanceMatrix.version++);
    const r6 = render();
    return { r1, r2, r3, r4, r5, r6 };
}
function diaetProbe(selftest) {
    const fehler = [];
    const fn = diaetLaden(null);
    if (!fn) return { fehler: ["AnazhRealm._diaetRefresh nicht im Stamm gefunden"], selbstFeuert: false };
    const pruefe = (z) => {
        const f = [];
        if (z.r1.voll.size !== 50) f.push(`Erst-Render: alle 50 Objekte initialisieren (ist ${z.r1.voll.size})`);
        for (const [k, r] of Object.entries(z)) {
            if (r.fehlt)
                f.push(
                    `Kamera-Treue ${k}: ${r.fehlt} von 20 Programmen ohne geschriebene geteilte Gruppe — sie zeigen die Kamera ihres letzten Refreshs`
                );
            if (r.objektDurchDiaet) f.push(`${k}: die Diät schrieb ${r.objektDurchDiaet} Objekt-Gruppen (nur die geteilte ist ihre)`);
        }
        if (!z.r4.voll.has(7)) f.push("Objekt-Wahrheit: ein bewegtes Objekt refresht voll (equals)");
        if (!z.r5.voll.has(11)) f.push("Instanz-Wächter: eine Instanz-Mutation refresht voll");
        return f;
    };
    const z = diaetLauf(fn);
    fehler.push(...pruefe(z));
    const stand = [z.r2.voll.size, z.r3.voll.size, z.r6.voll.size];
    // Die Kamera-Treue kostet im Stand keinen Voll-Refresh: je Programm schreibt die Diät nur die geteilte Gruppe.
    if (stand.some((n) => n !== 0))
        fehler.push(`Stand: ${stand.join("/")} Voll-Refreshs je Render (Soll 0 — die renderId-Wand refresht jedes Programm voll)`);
    let selbstFeuert = false;
    if (selftest) {
        const abk = pruefe(diaetLauf(diaetLaden("abkuerzung")));
        const schreibFn = diaetLaden("schreiben");
        const ohneSchreiben = schreibFn ? pruefe(diaetLauf(schreibFn)) : null;
        selbstFeuert =
            abk.some((e) => e.startsWith("Kamera-Treue")) &&
            (ohneSchreiben === null || ohneSchreiben.some((e) => e.startsWith("Kamera-Treue")));
    }
    return { fehler, selbstFeuert, stand };
}

// DIE SCHATTEN-STOFF-PROBE: den Block aus _configureRenderer schneiden und an einem Schein-Renderer fahren, dessen
// renderObject wie r184 je Objekt alphaTest des Originals auf den geteilten Stoff setzt und je Bürger den Schlüssel
// prüft, sobald die Stoff-Version wechselt. Der Setter ist der Vendor-Text (Anker oben). 40 Objekte, Blätter und
// Stämme im Wechsel: im Stand prüft kein Bürger, ein eigener alphaTest-Wechsel prüft genau EINEN.
function schattenStoffProbe(ohne) {
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const kopf = 'if (typeof renderer.renderObject === "function" && !renderer.__anazhSchattenStoff) {';
    const a = stamm.indexOf(kopf);
    const e = a < 0 ? -1 : stamm.indexOf("renderer.__anazhSchattenStoff = true;", a);
    const zu = e < 0 ? -1 : stamm.indexOf("}", e);
    if (zu < 0) return { fehler: ["der Schatten-Stoff-Block fehlt in _configureRenderer"] };
    const einbau = new Function("renderer", stamm.slice(a, zu + 1));
    const core = fs.readFileSync(path.join(root, "vendor/three.core.min.js"), "latin1");
    const setter = "set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}";
    if (!core.includes(setter)) return { fehler: ["der Vendor-Setter alphaTest fehlt (Anker)"] };
    const Stoff = new Function(
        `return class { constructor() { this.version = 0; this._alphaTest = 0; this.allowOverride = true; } get alphaTest() { return this._alphaTest; } ${setter} }`
    )();
    const sm = new Stoff();
    sm.isShadowPassMaterial = true;
    const szene = { overrideMaterial: sm };
    const gesehen = new Map();
    let pruefungen = 0;
    const renderer = {
        renderObject(object, scene, camera, geometry, material) {
            const s = scene.overrideMaterial;
            s.alphaTest = material.alphaTest;
            const v = gesehen.get(object);
            if (v !== s.version) {
                if (v !== undefined) pruefungen++;
                gesehen.set(object, s.version);
            }
        },
    };
    if (!ohne) einbau(renderer);
    const objekte = [];
    for (let i = 0; i < 40; i++) {
        const m = new Stoff();
        m.alphaTest = i % 2 ? 0.5 : 0;
        objekte.push({ o: { i }, m });
    }
    const frame = () => {
        pruefungen = 0;
        for (const x of objekte) renderer.renderObject(x.o, szene, null, null, x.m);
        return pruefungen;
    };
    frame();
    frame();
    const stand = frame();
    objekte[4].m.alphaTest = 0.5;
    const eigener = frame();
    const fehler = [];
    if (stand !== 0)
        fehler.push(`Schatten-Stoff: ${stand} von 40 Bürgern prüfen im Stand je Frame ihren Schlüssel (die geteilte Version springt je Objekt)`);
    if (eigener !== 1) fehler.push(`Schatten-Stoff: ein eigener alphaTest-Wechsel prüft ${eigener} Bürger (Soll genau 1)`);
    return { fehler, stand, eigener };
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
    // (3) DIE DIÄT-PRÜFUNG am Schein-Programm (r184-Semantik: Beobachter + geteilte Gruppe je Programm, renderId-
    // Wand, equals()): AnazhRealm._diaetRefresh aus dem Stamm-Quelltext, deterministisch, GPU-frei.
    const diaet = diaetProbe(selftest);
    for (const e of diaet.fehler) errs.push("DIÄT: " + e);
    // (4) DIE SCHATTEN-STOFF-PROBE (der Block aus _configureRenderer am Schein-Renderer, Setter aus dem Vendor).
    const stoff = schattenStoffProbe(false);
    for (const e of stoff.fehler) errs.push("SCHATTEN: " + e);
    if (selftest) {
        const feuert = errs.some((e) => e.includes("hasNode"));
        const diaetFeuert = diaet.selbstFeuert;
        console.log(feuert ? "✅ SELBST-TEST: die Anker-Wand feuert (manipulierter Anker erkannt)" : "❌ SELBST-TEST: die Wand ist vakuös");
        console.log(
            diaetFeuert
                ? "✅ SELBST-TEST: die Diät-Probe feuert (eine Abkürzung ohne Schreiben lässt Programme an der alten Kamera kleben)"
                : "❌ SELBST-TEST: die Diät-Probe ist vakuös"
        );
        const stoffFeuert = schattenStoffProbe(true).fehler.length > 0;
        console.log(
            stoffFeuert
                ? "✅ SELBST-TEST: die Schatten-Stoff-Probe feuert (ohne den Block prüft jeder Bürger je Frame seinen Schlüssel)"
                : "❌ SELBST-TEST: die Schatten-Stoff-Probe ist vakuös"
        );
        process.exit(feuert && diaetFeuert && stoffFeuert ? 0 : 1);
    }
    if (errs.length) {
        console.error("⛔ DIE VENDOR-ANKER-WAND:");
        for (const e of errs) console.error("   ❌ " + e);
        process.exit(1);
    }
    console.log(
        `✅ DIE VENDOR-ANKER-WAND steht — ${PINS.length} Fingerabdrücke gepinnt, ${geprueft} Anker der Laufzeit-Organe leben im Vendor, die Diät-Prüfung hält am Schein-Programm (Kamera-Treue: jede geteilte Gruppe je Programm und Render geschrieben; Voll-Refreshs im Stand ${diaet.stand.join("/")} von 50), der Schatten-Stoff prüft im Stand ${stoff.stand} von 40 Bürgern, ein eigener Wechsel ${stoff.eigener}.`
    );
}
main();
