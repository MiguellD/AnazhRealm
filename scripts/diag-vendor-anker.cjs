#!/usr/bin/env node
// ============================================================================
// DIE VENDOR-ANKER-WAND — gate:vendor-anker
//
// Der Stamm patcht/liest den minifizierten three-r184-Vendor zur Laufzeit an
// seinen Organen (Observer-Diät + Kamera-Treue · Schatten-Diät · Schatten-Stoff ·
// Bundle-Wahrheit · Bundle-Reihenfolge · Replay-Buchung · Erst-Zeichnung · Uniform-
// Heimat · Schatten-Takt · Instanz-Puffer-Name · Satz-Teil-Upload). Jeder dieser
// Eingriffe hängt an EXAKTEN Vendor-Wahrheiten (Methoden-/Feld-Namen, Verhaltens-
// Signaturen) — auch an PRIVATEN (_renderScene, _currentRenderBundle, _bindings.
// _update, getNodeFrameForRender …). Ein three-Versions-Sprung würde sie STILL
// brechen — die Welt liefe, aber die Diät griffe nie, ein Bundle klebte an der
// Kamera seiner Aufnahme. Jede benutzte Stelle steht hier mit ihrem Organ.
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
const { wandEnde, jsonLesen, jsonSchreiben } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
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
    { file: "vendor/TRAANode.js", hash: null },
    { file: "vendor/CSMShadowNode.js", hash: null },
];

// Die Anker: Vendor-Substring → abhängiges Stamm-Organ, je Gruppe ihr Grund (`warum`). Die Tafel ist Daten der Wand
// (spec/vendor-anker.json, 223 Anker in 54 Gruppen; bis w3w-verkehr ein Literal dieses Skripts). DIE DATEI DER ANKER: ohne
// `file` der WebGPU-Vendor (in ihm leben fast alle Organe), jede andere steht beim Anker.
const ANKER_DATEI = PINS[0].file;
const ANKER = jsonLesen(path.join(root, "spec", "vendor-anker.json")).flatMap((g) => g.anker);

// DIE DIÄT-PRÜFUNG (wer voll frischt): die Diät-Funktionen aus dem Stamm laden (vom ersten
// `AnazhRealm._diaet… = function` bis zum Ende von `_diaetRefresh`) und gegen Schein-Programme fahren — r184-
// Semantik: EIN Beobachter und EINE geteilte Gruppe je Programm, mehrere Objekte je Programm, die Vendor-Bahn
// (Kopf → renderId-Wand → equals()). Manipulationen für den Selbsttest tauschen den VERSORGER am geladenen Objekt,
// nie den Text: "ohneMeldung" mutet den Melder (die vergessene Lage nennt gate:kamera-treue ÄNDERUNG),
// "ohneGetragen" macht jede neue Version zum Grund
// für jedes Render-Objekt (der Stand vor K71), "getragenImmer" hält jede Version für getragen (ein Attribut, das nur
// ein Pass liest, lüde nie hoch). Ruft die Diät einen Versorger nicht, bleibt die Manipulation wirkungslos und der
// Selbsttest wird ROT (Konsum statt Zitat).
function diaetLaden(manipuliert) {
    const stamm = stammLib.text(root);
    const b = (stammLib.treffer(stamm, null, "AnazhRealm._diaetRefresh = function") || { index: -1 }).index;
    if (b < 0) return null;
    let a = b;
    for (const kopf of ["AnazhRealm._diaetGang = function", "AnazhRealm._diaetGeteiltSchreiben = function"]) {
        const s0 = (stammLib.treffer(stamm, null, kopf) || { index: -1 }).index;
        if (s0 >= 0 && s0 < a) a = s0;
    }
    const e = stamm.indexOf("\n};\n", b);
    if (e < 0) return null;
    const AnazhRealm = {};
    new Function("AnazhRealm", stamm.slice(a, e + 3))(AnazhRealm);
    if (manipuliert === "ohneGetragen") AnazhRealm._diaetGetragen = () => false;
    if (manipuliert === "getragenImmer") AnazhRealm._diaetGetragen = () => true;
    const verpasst = AnazhRealm._diaetStoffVerpasst;
    if (manipuliert === "ohneStoffStand") AnazhRealm._diaetStoffVerpasst = (od, s, md, vorR, rid, liest, v) => v;
    if (manipuliert === "stoffBlind")
        AnazhRealm._diaetStoffVerpasst = (od, s, md, vorR, rid, l, v) => verpasst(od, s, md, vorR, rid, true, v);
    if (manipuliert === "ohneMeldung") AnazhRealm._regt = () => 0;
    const fn = AnazhRealm._diaetRefresh;
    fn.A = AnazhRealm;
    return fn;
}
// ein Puffer wie three.core, dessen Setter meldet wie der Melder (`_regungMelder`)
const puffer = (fn, p) =>
    Object.defineProperty(p, "needsUpdate", {
        set(v) {
            if (v !== true) return;
            this.version++;
            fn.A._regt(this);
        },
    });
// DER SCHEIN-BEOBACHTER (r184 NodeMaterialObserver) der drei Diät-Proben: Daten je Render-Objekt (die Lage `welt`), die
// Vendor-Bahn (Kopf → renderId-Wand → equals()), und equals() vergleicht die Stoff-Daten `md` EINMAL je Render-Id
// (`getMaterialData`: `_renderId`/`_equal`) und geht wie r184 JEDEN Schlüssel der Daten gegen den Stoff durch (ein fremder
// Schlüssel bricht wie im Vendor an `.isTexture`) — ohne Stoff ruht er.
function scheinBeobachter(md = { _renderId: -1, _equal: true }, stoff = null) {
    return {
        renderObjects: new Map(),
        renderId: -1,
        hasNode: false,
        hasAnimation: false,
        getRenderObjectData(ro) {
            if (!this.renderObjects.has(ro)) {
                const w = { w: ro.object.welt, equals: (m) => m.w === w.w, copy: (m) => (w.w = m.w) };
                this.renderObjects.set(ro, { worldMatrix: w });
            }
            return this.renderObjects.get(ro);
        },
        getMaterialData: () => md,
        getGeometryData: () => ({}),
        needsVelocity: () => false,
        getLights: () => [],
        equals(ro, l, rid) {
            const w = this.getRenderObjectData(ro).worldMatrix;
            if (w.w !== ro.object.welt) return (w.w = ro.object.welt) === null;
            if (stoff && md._renderId !== rid) {
                md._renderId = rid;
                md._equal = true;
                for (const k in md) {
                    if (k === "_renderId" || k === "_equal" || stoff[k].isTexture === true || md[k] === stoff[k]) continue;
                    md[k] = stoff[k];
                    md._equal = false;
                    break;
                }
            }
            return md._equal;
        },
    };
}
function scheinVendor(ro, frame) {
    if (this.hasNode || this.hasAnimation || !this.renderObjects.has(ro)) {
        this.getRenderObjectData(ro);
        return true;
    }
    if (this.renderId !== frame.renderId) {
        this.renderId = frame.renderId;
        return true;
    }
    return this.equals(ro, [], frame.renderId) !== true;
}
function scheinObjekt(extra) {
    return Object.assign(
        {
            welt: 0,
            get matrixWorld() {
                return { w: this.welt, elements: Array(16).fill(this.welt) };
            },
        },
        extra
    );
}
// DIE SCHEIN-DIÄT zählt, WER voll frischt und welche Objekt-Gruppe lädt: 20 Programme mit je EINER geteilten Gruppe (18–19
// tragen einen Verweis ohne festes Objekt — er liest frame.object, je Programm ein Gang), 50 Senken, der Stein mit freier
// Uniform. Die Kamera-Treue (jede geteilte Gruppe je Render-Abschnitt geschrieben, kein Gang zweimal, verschachtelte Renders)
// urteilt der ECHTE Renderer (gate:kamera-treue BILD · STAND · VERSCHACHTELT) — ihr Schein-Zwilling fiel mit (13), samt Stand.
function diaetLauf(fn) {
    let objektDurchDiaet = 0,
        zeichenGaenge = null;
    const nf = {
        ro: null,
        updateBeforeNode() {},
        updateNode(n) {
            if (n.object === null) zeichenGaenge.add(this.ro.progId);
        },
    };
    const rend = {
        info: { calls: 0 },
        backend: { updateBinding: () => objektDurchDiaet++ },
        _nodes: { updateBefore() {}, getNodeFrameForRender: (ro) => ((nf.ro = ro), nf) },
        _bindings: { _update: (g) => g.bindings[0].groupNode.shared === true || objektDurchDiaet++ },
    };
    const zeichenKnoten = { id: 700, property: "x", object: null, getUpdateType: () => "render" };
    const objektKnoten = { id: 800, getUpdateType: () => "object" };
    // Ein Render-Objekt EINES Programms: die geteilte Gruppe und der Beobachter des Programms, dazu seine eigene Gruppe.
    const prog = (id, objekt) => {
        const geteilt = { id: 100 + id, bindings: [{ groupNode: { shared: true } }] };
        const updateNodes = [{ id: 200 + id, getUpdateType: () => "render" }, ...objekt];
        const nbs = { updateNodes, updateBeforeNodes: [], updateAfterNodes: [] };
        const obs = scheinBeobachter();
        return (object, eigen) => ({
            obs,
            ro: {
                progId: id,
                object,
                material: object.material,
                getBindings: () => [geteilt, eigen],
                getNodeBuilderState: () => nbs,
            },
        });
    };
    // DER STEIN: seine freie Uniform (ein Schreiber setzt `.value`, E1-n1) lädt im Wechsel die eigene Gruppe im Objekt-Gang,
    // nie voll; die eigene Gruppe ist EIN Uniform-Puffer wie r184 (updateByType vergleicht, updateBinding lädt).
    const freiWert = { isUniformNode: true, value: 0, getUpdateType: () => "none" };
    const steinPuffer = scheinPuffer([{ nodeUniform: { node: freiWert }, getValue: () => freiWert.value }]);
    const stein = prog(20, [])(scheinObjekt({ material: { _anazhDiaet: true } }), { bindings: [steinPuffer] });
    const programme = [];
    for (let p = 0; p < 20; p++) programme.push(prog(p, [objektKnoten, ...(p >= 18 ? [zeichenKnoten] : [])]));
    const objekte = [];
    for (let i = 0; i < 50; i++) {
        const senke = scheinObjekt({
            isInstancedMesh: true,
            instanceMatrix: puffer(fn, { version: 0 }),
            material: { _anazhDiaet: true },
        });
        objekte.push(programme[i % 20](senke, { bindings: [{ groupNode: { shared: false } }] }));
    }
    const render = (vorher) => {
        // r184: der Render zählt `info.calls` hoch, seine Render-Id ist der Zählerstand.
        const frame = { renderer: rend, renderId: ++rend.info.calls };
        if (vorher) vorher();
        zeichenGaenge = new Set();
        objektDurchDiaet = 0;
        const voll = new Set();
        const steinVoll = fn(stein.obs, stein.ro, frame, scheinVendor);
        for (let i = 0; i < objekte.length; i++)
            if (fn(objekte[i].obs, objekte[i].ro, frame, scheinVendor)) {
                voll.add(i);
                zeichenGaenge.add(objekte[i].ro.progId); // der Voll-Refresh fährt jeden Knoten für SEIN Objekt
            }
        const zeichenFehlt = [18, 19].filter((p) => !zeichenGaenge.has(p)).length;
        return { voll, steinVoll, objektDurchDiaet, zeichenFehlt };
    };
    const r1 = render();
    const r2 = render();
    const r3 = render();
    const r4 = render(() => objekte[7].ro.object.welt++);
    const r5 = render(() => (objekte[11].ro.object.instanceMatrix.needsUpdate = true));
    const r6 = render();
    const r7 = render(() => freiWert.value++);
    return { r1, r2, r3, r4, r5, r6, r7 };
}
// (8) GETRAGEN: EIN Objekt in zwei Pässen — der Schatten (zuerst) liest Instanz-Matrix und Lage, das Hauptbild dazu
// die Normale; jeder Pass hat seinen Beobachter. Der Schein-Renderer lädt wie r184 je Attribut-Objekt EINMAL je Version
// (`_attributes`: `version` die hochgeladene), und nur die Attribute, die der Pass liest. Gemessen je Render: wie viele
// Pässe voll auffrischen. Soll: eine neue Version der Matrix oder der Lage frischt EINEN Pass auf (der zweite liest, was der
// erste hochlud), eine neue Normale frischt das Hauptbild auf (nur es lädt sie).
function getragenLauf(fn) {
    let n = 0;
    const attr = (k) => puffer(fn, { id: 900 + n++, version: 0, k });
    const im = attr("im"),
        lage = attr("lage"),
        normale = attr("normale");
    const daten = new Map();
    const A = { has: (a) => daten.has(a), get: (a) => daten.get(a) || (daten.set(a, {}), daten.get(a)) };
    const rend = {
        info: { calls: 0 },
        _attributes: A,
        _nodes: { getNodeFrameForRender: () => ({}) },
        _bindings: { _update() {} },
    };
    const obj = scheinObjekt({ isInstancedMesh: true, instanceMatrix: im, instanceColor: null });
    const geo = { id: 77, index: null, attributes: { position: lage, normal: normale } };
    const pass = (liest) => {
        const nbs = { updateNodes: [], updateBeforeNodes: [], updateAfterNodes: [] };
        const ro = { object: obj, geometry: geo, attributes: liest, getBindings: () => [], getNodeBuilderState: () => nbs };
        return { obs: scheinBeobachter(), ro, liest };
    };
    const paesse = [pass([im, lage]), pass([im, lage, normale])];
    const render = (vorher) => {
        if (vorher) vorher();
        const frame = { renderer: rend, renderId: ++rend.info.calls };
        const voll = [];
        for (const p of paesse)
            if (fn(p.obs, p.ro, frame, scheinVendor)) {
                voll.push(p === paesse[0] ? "schatten" : "haupt");
                // der Voll-Refresh lädt, was dieser Pass liest (r184 `Attributes.update`)
                for (const a of p.liest) {
                    const d = A.get(a);
                    if (d.version === undefined || d.version < a.version) d.version = a.version;
                }
            }
        return voll;
    };
    return {
        erst: render(),
        stand: render(),
        matrix: render(() => (im.needsUpdate = true)),
        lage: render(() => (lage.needsUpdate = true)),
        normale: render(() => (normale.needsUpdate = true)),
        danach: render(),
    };
}
// r184 `UniformBuffer`: vergleicht je Uniform (`updateByType`), merkt den geladenen Wert, `updateBinding` lädt.
function scheinPuffer(uniforms) {
    return {
        groupNode: { shared: false },
        isUniformBuffer: true,
        updateRanges: [],
        geladen: 0,
        updateByType(u) {
            const neu = this.geladen !== u.getValue();
            this.geladen = u.getValue();
            return neu;
        },
        uniforms,
    };
}
// (13) DER STOFF JE RENDER-OBJEKT: r184 merkt die Stoff-Daten in equals() je STOFF und Render-Id, der Puffer
// des Stoff-Verweises liegt je Render-Objekt. Fünf Objekte EINES Stoffs: D (eine Senke) frischt im Render des Farbwechsels
// aus eigenem Grund VOR A, A verbraucht ihn, B und C fehlen (verdeckt), E (ein Programm ohne Stoff-Verweis, der Schatten-
// Pass) fehlt auch; danach bewegt sich B, C steht. Gemessen: welche Puffer den alten Wert tragen (`alt`) und
// wer ohne Änderung voll frischt (`ueber`) — Soll je keiner.
function stoffLauf(fn) {
    const stoff = { farbe: 1 };
    const obs = scheinBeobachter({ _renderId: -1, _equal: false, farbe: 1 }, stoff);
    const wert = { isUniformNode: true, value: 0, getUpdateType: () => "none" };
    const verweis = { isMaterialReferenceNode: true, property: "farbe", node: wert, getUpdateType: () => "object" };
    const prog = (updateNodes) => ({
        updateNodes,
        updateBeforeNodes: [],
        updateAfterNodes: [],
        observer: { refreshUniforms: ["farbe"] },
    });
    const nbs = prog([verweis]),
        nbsOhne = prog([]);
    let akt = null;
    const nf = { updateNode: (n) => n === verweis && (wert.value = akt.material.farbe), updateBeforeNode() {} };
    const rend = {
        info: { calls: 0 },
        backend: { updateBinding() {} },
        _nodes: { getNodeFrameForRender: (ro) => ((akt = ro), nf) },
        _bindings: { _update: (g) => g.bindings.forEach((b) => b.uniforms && b.updateByType(b.uniforms[0])) },
    };
    const geteilt = { bindings: [{ groupNode: { shared: true } }] };
    const ros = ["D", "A", "B", "C", "E"].map((name) => {
        const eigen = { bindings: [scheinPuffer([{ nodeUniform: { node: wert }, getValue: () => wert.value }])] };
        const object = scheinObjekt(
            name === "D" ? { isInstancedMesh: true, instanceMatrix: puffer(fn, { id: 7, version: 0 }) } : {}
        );
        const n = name === "E" ? nbsOhne : nbs;
        return {
            name,
            eigen,
            object,
            material: stoff,
            getBindings: () => [geteilt, eigen],
            getNodeBuilderState: () => n,
        };
    });
    // Ein Voll-Refresh (die Vendor-Bahn) stellt jeden Knoten für SEIN Objekt und lädt jede Gruppe.
    const render = (wer) => {
        const frame = { renderer: rend, renderId: ++rend.info.calls };
        const voll = [];
        for (const ro of ros)
            if (wer.includes(ro.name) && fn(obs, ro, frame, scheinVendor)) {
                voll.push(ro.name);
                if (ro.name !== "E") rend._nodes.getNodeFrameForRender(ro).updateNode(verweis);
                rend._bindings._update(ro.eigen);
            }
        return voll;
    };
    render("DABCE");
    render("DABCE");
    stoff.farbe = 2;
    ros[0].object.instanceMatrix.needsUpdate = true;
    render("DA");
    ros[2].object.welt = 1;
    const ueber = render("DABCE").filter((n) => n !== "B" && n !== "C");
    ueber.push(...render("DABCE"));
    const alt = ros.filter((ro) => ro.name !== "E" && ro.eigen.bindings[0].geladen !== stoff.farbe);
    return { alt: alt.map((ro) => ro.name), ueber };
}
function getragenPruefe(g) {
    const f = [];
    if (g.erst.length !== 2) f.push(`GETRAGEN: der Erst-Render initialisiert ${g.erst.length} von 2 Pässen`);
    for (const k of ["matrix", "lage"])
        if (g[k].length !== 1)
            f.push(
                `GETRAGEN: eine neue Version der ${k === "matrix" ? "Instanz-Matrix" : "Lage"} frischt ${g[k].length} Pässe voll auf (${g[k].join(" + ")}; Soll 1 — der zweite lädt nichts, die GPU trägt sie schon)`
            );
    if (!g.normale.includes("haupt"))
        f.push("GETRAGEN UPLOAD: eine neue Normale (nur das Hauptbild liest sie) frischt das Hauptbild nicht auf — sie lädt nie hoch");
    if (g.stand.length || g.danach.length) f.push(`GETRAGEN: im Stand ${g.stand.length}/${g.danach.length} Voll-Refreshs (Soll 0)`);
    return f;
}
function diaetProbe(selftest) {
    const fehler = [];
    const fn = diaetLaden(null);
    if (!fn) return { fehler: ["AnazhRealm._diaetRefresh nicht im Stamm gefunden"], selbstFeuert: false };
    const getragen = getragenLauf(fn);
    fehler.push(...getragenPruefe(getragen));
    const pruefe = (z) => {
        const f = [];
        if (z.r1.voll.size !== 50) f.push(`Erst-Render: alle 50 Objekte initialisieren (ist ${z.r1.voll.size})`);
        for (const [k, r] of Object.entries(z)) {
            if (r.objektDurchDiaet !== (k === "r4" || k === "r7" ? 1 : 0)) f.push(`${k}: die Diät schrieb ${r.objektDurchDiaet} Objekt-Gruppen (Soll: nur die des bewegten Objekts, sein Objekt-Gang)`);
            if (r.zeichenFehlt)
                f.push(
                    `Zeichen-Objekt ${k}: ${r.zeichenFehlt} von 2 Programmen mit einem Verweis ohne festes Objekt gingen keinen eigenen Gang — er arbeitete nie für ihr Objekt`
                );
        }
        if (z.r4.voll.has(7)) f.push("Objekt-Gang: ein bewegtes Objekt frischt voll auf, statt nur seine eigenen Werte zu stellen");
        if (z.r7.steinVoll) f.push("Uniform-Wächter: eine freie Objekt-Uniform frischt voll auf, statt ihre eigene Gruppe zu laden");
        if (!z.r5.voll.has(11)) f.push("Instanz-Wächter: eine Instanz-Mutation refresht voll");
        return f;
    };
    const z = diaetLauf(fn);
    fehler.push(...pruefe(z));
    // ein fremder Schlüssel in den Stoff-Daten bricht equals() (r184 liest `material[k].isTexture`) — der Render wirft
    const stoffProbe = (f) => {
        const v = [];
        try {
            const { alt, ueber } = stoffLauf(f);
            if (alt.length)
                v.push(
                    `STOFF: ${alt.join(" + ")} tragen nach einem verpassten Render den alten Stoff-Wert (equals() merkt je Stoff, nie je Render-Objekt)`
                );
            if (ueber.length)
                v.push(
                    `STOFF ÜBERFRISCHT: ${ueber.join(" + ")} frischen ohne Änderung voll auf (ein Voll-Refresh im Render des Verbrauchs, ein Programm ohne Stoff-Verweis)`
                );
        } catch (e) {
            v.push(`STOFF BRUCH: equals() bricht nach dem ersten Stoff-Wechsel (${e.message}) — ein Diät-Stempel in den Stoff-Daten`);
        }
        return v;
    };
    fehler.push(...stoffProbe(fn));
    let selbstFeuert = false;
    if (selftest) {
        // Die Diät MUSS den Getragen-Wächter fragen: ein blinder frischt jede Version auf bzw. lädt die Normale nie.
        const ohneG = getragenPruefe(getragenLauf(diaetLaden("ohneGetragen")));
        const immer = getragenPruefe(getragenLauf(diaetLaden("getragenImmer")));
        const ohneStand = stoffProbe(diaetLaden("ohneStoffStand"));
        const stumm = pruefe(diaetLauf(diaetLaden("ohneMeldung")));
        const blind = stoffProbe(diaetLaden("stoffBlind"));
        selbstFeuert =
            ohneStand.length === 1 &&
            blind.length === 1 &&
            blind[0].startsWith("STOFF ÜBERFRISCHT: E") &&
            ohneG.some((e) => e.startsWith("GETRAGEN: eine neue Version")) &&
            immer.some((e) => e.startsWith("GETRAGEN UPLOAD")) &&
            stumm.some((e) => e.startsWith("Instanz-Wächter"));
    }
    return { fehler, selbstFeuert, getragen };
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
    let lock = fs.existsSync(lockPfad) ? jsonLesen(lockPfad) : null;
    const ist = {};
    for (const p of PINS) {
        const buf = les(p.file);
        ist[p.file] = { bytes: buf.length, fnv: fnv(buf) };
    }
    if (!lock) {
        jsonSchreiben(lockPfad, ist, 4, "\n");
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
        geprueft++;
        const src = les(a.file || ANKER_DATEI).toString("latin1");
        const sub = selftest && a.organ && a.organ.startsWith("_materialObserverDiaet (hasNode") ? a.sub + "_MANIPULIERT" : a.sub;
        if (!src.includes(sub)) errs.push(`ANKER GEFALLEN: "${a.sub}" fehlt in ${a.file || ANKER_DATEI} → Organ: ${a.organ}`);
    }
    // (3) DIE DIÄT-PRÜFUNG am Schein-Programm (r184-Semantik: Beobachter + geteilte Gruppe je Programm, renderId-
    // Wand, equals()): AnazhRealm._diaetRefresh aus dem Stamm geladen, deterministisch, GPU-frei. Bundle-Wahrheit und
    // Schatten-Stoff beweist gate:kamera-treue am echten Renderer (Aufnahme verfolgt, kein Bundle unter dem Override).
    const diaet = diaetProbe(selftest);
    for (const e of diaet.fehler) errs.push("DIÄT: " + e);
    if (selftest) {
        const feuert = errs.some((e) => e.includes("hasNode"));
        const diaetFeuert = diaet.selbstFeuert;
        console.log(feuert ? "✅ SELBST-TEST: die Anker-Wand feuert (manipulierter Anker erkannt)" : "❌ SELBST-TEST: die Wand ist vakuös");
        console.log(
            diaetFeuert
                ? "✅ SELBST-TEST: die Diät-Probe feuert (ein gemuteter Melder lässt die Instanz-Mutation ruhen; ohne Getragen-Wächter frischt jede Version jeden Pass auf, ein blinder lädt die Normale nie; ohne Stoff-Stand trägt ein verpasstes Objekt den alten Stoff, ein blinder frischt ein Programm ohne Stoff-Verweis auf)"
                : "❌ SELBST-TEST: die Diät-Probe ist vakuös"
        );
        if (errs.length > 1 || !errs.some((e) => e.includes("hasNode"))) for (const e of errs) console.error("   ❌ " + e);
        process.exit(feuert && diaetFeuert && errs.length === 1 ? 0 : 1);
    }
    wandEnde(
        errs,
        `DIE VENDOR-ANKER-WAND steht — ${PINS.length} Fingerabdrücke gepinnt, ${geprueft} Anker der Laufzeit-Organe leben im Vendor, die Diät-Prüfung hält am Schein-Programm (ein bewegtes Objekt geht nur seinen Objekt-Gang; eine neue Version, die die GPU trägt, frischt ${diaet.getragen.matrix.length} von 2 Pässen auf; ein verpasster Stoff-Wechsel lässt 0 von 4 Puffern alt und frischt 0 Objekte ohne Änderung auf).`
    );
}
main();
