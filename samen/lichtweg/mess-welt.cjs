// mess-welt.cjs — WEGWERF-SPIKE (w28-samen-lichtweg): die ECHTE Welt bootet headless bis zum ersten Weltbild, je Fall mit einem
// Patch am Lichtweg, und zählt Programme, Programm-Text und Knoten-Bau. Kein Kern-Schnitt: der Patch hängt nur in der
// ausgelieferten Kopie von stamm/dirigent-takt.js (dieser Server), keine Datei des Baums ändert sich.
//
//   node samen/lichtweg/mess-welt.cjs <fall> [--holz voll] [--aus datei.json] [--wgsl ordner] [--echt-shader]
//
// DER STUB: swiftshader übersetzt eine Pipeline der Welt in 42–292 s (Lehre 26) — 40 Programme sind Stunden. Der Haken an
// `GPUDevice.createShaderModule` ZÄHLT den echten WGSL-Text (Zahl, Bytes, Zeit) und reicht dem Treiber eine Attrappe mit
// denselben Ausgängen: Programme, Text und Knoten-Bau (reine JS-Arbeit von r184) sind echt, die Übersetzung der Karte fehlt,
// das Bild ist leer. JEDE ms-Zahl hier ist Haupt-Faden-JS auf der CPU dieses Containers, nie Bild-Zeit einer Karte.
"use strict";
const fs = require("fs");
const http = require("http");
const path = require("path");
const ROOT = path.resolve(__dirname, "..", "..");
const { softwareWebGpuArgs } = require(path.join(ROOT, "scripts", "lib", "software-gpu.cjs"));

// DIE FÄLLE: je Fall der Text, der hinter stamm/dirigent-takt.js läuft (nach jeder Naht, vor `new AnazhRealm()`)
const OHNE_POOL = `AnazhRealm.prototype._lichtPoolTerm = function (Te) { return Te.vec3(0); };`;
const POOL = (n) => `AnazhRealm.LICHT_POOL = Object.freeze({ ...AnazhRealm.LICHT_POOL, plaetze: ${n} });`;
// der G-Puffer des Kandidaten: zwei Ziele mehr am Szenen-Pass (Normale + Metall, Albedo + Rauheit), JEDES Programm schreibt sie
const G_PUFFER = `{
    const roh = AnazhRealm.prototype._ensurePostProcessing;
    AnazhRealm.prototype._ensurePostProcessing = function () {
        const pp = roh.call(this);
        const sp = this.state.scenePass;
        if (pp && sp && !sp.__lw) {
            sp.__lw = true;
            const T = THREE.TSL;
            // r184 hängt ein MRT-Ziel nur an, wenn der Pass seine Textur trägt (getTexture(name) legt sie an; MRTNode.setup
            // sucht jedes Ziel beim Namen in renderTarget.textures) — ohne sie fiele der Eintrag still aus jedem Programm
            for (const n of ["gNormal", "gAlbedo"]) sp.getTexture(n).type = THREE.UnsignedByteType;
            sp.setMRT(T.mrt({ ...sp.getMRT().outputNodes,
                gNormal: T.vec4(T.directionToColor(T.normalView), T.metalness),
                gAlbedo: T.vec4(T.diffuseColor.rgb, T.roughness) }));
        }
        return pp;
    };
}`;
const OHNE_NAESSE = `AnazhRealm.prototype._naesseImStoff = function () {};`;
const OHNE_LUFT = `{
    const roh = AnazhRealm.prototype._luftEnsure;
    AnazhRealm.prototype._luftEnsure = function () { const l = roh.call(this); if (this.state.scene) this.state.scene.fogNode = null; return l; };
}`;
const OHNE_UMGEBUNG = `{
    const roh = AnazhRealm.prototype._luftEnsure;
    AnazhRealm.prototype._luftEnsure = function () {
        const s = this.state.scene;
        if (s && !s.__lwUmg) { s.__lwUmg = true; for (const k of ["environment", "environmentNode"]) Object.defineProperty(s, k, { get: () => null, set() {}, configurable: true }); }
        return roh.call(this);
    };
}`;
const OHNE_KASKADEN = `{
    const roh = AnazhRealm.prototype._configureRenderer;
    AnazhRealm.prototype._configureRenderer = function (renderer) { const x = roh.call(this, renderer); renderer.shadowMap.enabled = false; return x; };
}`;
const FAELLE = {
    heute: "",
    pool8: POOL(8),
    pool16: POOL(16),
    "ohne-pool": OHNE_POOL,
    kandidat: OHNE_POOL + G_PUFFER,
    "ohne-naesse": OHNE_NAESSE,
    "ohne-luft": OHNE_LUFT,
    "ohne-umgebung": OHNE_UMGEBUNG,
    "ohne-kaskaden": OHNE_KASKADEN,
    decke: OHNE_POOL + OHNE_NAESSE + OHNE_LUFT + OHNE_UMGEBUNG + OHNE_KASKADEN,
};

const arg = (n, d) => {
    const i = process.argv.indexOf(n);
    return i < 0 ? d : process.argv[i + 1];
};
const fall = process.argv[2];
if (!Object.hasOwn(FAELLE, fall)) {
    console.error(`Fall fehlt — erlaubt: ${Object.keys(FAELLE).join(" · ")}`);
    process.exit(2);
}
const HOLZ = arg("--holz", "voll");
const STUB = !process.argv.includes("--echt-shader");
const FRIST_S = Number(arg("--frist", 900));

const MIME = { ".js": "text/javascript", ".mjs": "text/javascript", ".html": "text/html", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".wasm": "application/wasm", ".svg": "image/svg+xml" };
function server() {
    return http.createServer((req, res) => {
        let p = decodeURIComponent(req.url.split("?")[0]);
        if (p === "/") p = "/index.html";
        const f = path.join(ROOT, p);
        if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
            res.statusCode = 404;
            return res.end();
        }
        let body = fs.readFileSync(f);
        if (p === "/stamm/dirigent-takt.js") body = Buffer.concat([body, Buffer.from("\n;/* w28-samen-lichtweg: Fall " + fall + " */\n" + FAELLE[fall] + "\n")]);
        res.setHeader("Content-Type", MIME[path.extname(f)] || "application/octet-stream");
        res.setHeader("Cache-Control", "no-store");
        res.end(body);
    });
}

// DER HAKEN (vor jedem Skript der Seite): zählt jedes Shader-Modul, reicht (Stub) eine Attrappe weiter, zählt je Knoten-Bau
// die Knoten und den Text (`_createNodeBuilderState` von r184s Nodes: der Bau am Stück und der Bau in Raten enden dort)
function haken(stub) {
    const L = (window.__lw = { mod: [], code: [], bau: [], stub, fehler: [] });
    const P = GPUDevice.prototype;
    const roh = P.createShaderModule;
    const attrappe = (code, art) => {
        if (art === "vertex") return "@vertex fn main() -> @builtin(position) vec4<f32> { return vec4<f32>(2.0, 2.0, 2.0, 1.0); }";
        const m = /@fragment\s*fn\s+main\s*\(([\s\S]*?)\)\s*(->\s*([^{]+?))?\s*\{/.exec(code);
        if (!m) return null;
        if (!m[3]) return "@fragment fn main() {}";
        const typ = m[3].trim();
        const s = new RegExp("struct\\s+" + typ.replace(/[^\w]/g, "") + "\\s*\\{[\\s\\S]*?\\}").exec(code);
        if (s) return s[0] + `;\n@fragment fn main() -> ${typ} { var o: ${typ}; return o; }`;
        return `@fragment fn main() -> ${typ} { return ${typ.replace(/@location\(\d+\)\s*/, "")}(); }`;
    };
    P.createShaderModule = function (d) {
        const code = d.code || "";
        const art = /@compute/.test(code) ? "compute" : /@fragment/.test(code) ? "fragment" : "vertex";
        L.mod.push({ t: performance.now(), art, n: code.length, label: d.label || "" });
        L.code.push(code);
        if (stub && art !== "compute") {
            const a = attrappe(code, art);
            if (a) return roh.call(this, { ...d, code: a });
            L.fehler.push("keine Attrappe: " + code.slice(0, 80));
        }
        return roh.call(this, d);
    };
    const iv = setInterval(() => {
        const N = window.anazhRealm?.state?.renderer?._nodes;
        if (!N || typeof N._createNodeBuilderState !== "function") return;
        clearInterval(iv);
        const cs = N._createNodeBuilderState;
        N._createNodeBuilderState = function (b) {
            try {
                const m = b.material || {};
                L.bau.push({
                    t: performance.now(),
                    stoff: m.name || m.type || "?",
                    objekt: (b.object && (b.object.name || b.object.type)) || "?",
                    knoten: b.nodes ? b.nodes.length : -1,
                    vs: (b.vertexShader || "").length,
                    fs: (b.fragmentShader || "").length,
                    pool: m.userData ? m.userData.lichtPool || null : null,
                });
            } catch (e) {
                L.fehler.push(String(e));
            }
            return cs.call(this, b);
        };
    }, 1);
}

(async () => {
    const srv = server();
    await new Promise((r) => srv.listen(0, "127.0.0.1", r));
    const port = srv.address().port;
    const browser = await require("puppeteer").launch({ headless: true, args: softwareWebGpuArgs(), protocolTimeout: (FRIST_S + 120) * 1000, defaultViewport: { width: 1280, height: 720 } });
    const page = await browser.newPage();
    const konsole = [];
    page.on("console", (m) => /ERROR|BRUCH|Fehler/.test(m.text()) && konsole.push(m.text().slice(0, 300)));
    page.on("pageerror", (e) => konsole.push("pageerror: " + String(e).slice(0, 300)));
    await page.evaluateOnNewDocument(haken, STUB);
    const T0 = Date.now();
    await page.goto(`http://127.0.0.1:${port}/index.html?holz=${HOLZ}`, { waitUntil: "domcontentloaded", timeout: 120000 });
    // bis zum ersten Weltbild (`_weltbildDa`, der EINE Schreiber `_weltbildSteht`) — die Seite treibt ihren Loop selbst (rAF)
    let stand = null;
    for (;;) {
        await new Promise((r) => setTimeout(r, 5000));
        stand = await page
            .evaluate(() => {
                const r = window.anazhRealm;
                const st = r && r.state;
                const E = r && r._erstZeichnung;
                return {
                    jetzt: performance.now(),
                    weltbild: st ? st._weltbildDa || null : null,
                    holz: st ? st._holzProfil : null,
                    module: window.__lw.mod.length,
                    bau: window.__lw.bau.length,
                    bauN: E ? E.bauN : null,
                    bauMs: E ? E.bauMs : null,
                };
            })
            .catch((e) => ({ fehler: String(e) }));
        const s = Math.round((Date.now() - T0) / 1000);
        console.log(`  [${s} s] ${JSON.stringify(stand)}`);
        if (stand.weltbild || s > FRIST_S) break;
    }
    const out = await page.evaluate((mitCode) => {
        const r = window.anazhRealm;
        const st = r.state;
        const L = window.__lw;
        const bis = st._weltbildDa || Infinity;
        const zaehl = (ms) => {
            const je = {};
            for (const m of ms) {
                je[m.art] = je[m.art] || { n: 0, bytes: 0 };
                je[m.art].n++;
                je[m.art].bytes += m.n;
            }
            return je;
        };
        const vor = L.mod.filter((m) => m.t <= bis);
        const bauVor = L.bau.filter((b) => b.t <= bis);
        const E = r._erstZeichnung || {};
        const R = st.renderer;
        return {
            holz: st._holzProfil,
            weltbildMs: st._weltbildDa || null,
            poolPlaetze: st.atmoUniforms ? st.atmoUniforms.lichtLage.length : null,
            moduleVorBild: zaehl(vor),
            moduleGesamt: zaehl(L.mod),
            programme: R._pipelines ? { vertex: R._pipelines.programs.vertex.size, fragment: R._pipelines.programs.fragment.size, pipelines: R._pipelines.caches ? R._pipelines.caches.size : null } : null,
            knotenBauVorBild: { n: bauVor.length, knoten: bauVor.reduce((a, b) => a + b.knoten, 0), fsBytes: bauVor.reduce((a, b) => a + b.fs, 0), vsBytes: bauVor.reduce((a, b) => a + b.vs, 0) },
            erstZeichnung: { bauN: E.bauN, bauMs: E.bauMs, neubauN: E.neubauN, verschoben: E.verschoben },
            bau: L.bau,
            mod: L.mod,
            code: mitCode ? L.code : null,
            fehler: L.fehler,
        };
    }, !!arg("--wgsl", null));
    out.fall = fall;
    out.stub = STUB;
    out.wandS = Math.round((Date.now() - T0) / 1000);
    out.konsole = konsole.slice(0, 40);
    const wgsl = arg("--wgsl", null);
    if (wgsl && out.code) {
        fs.mkdirSync(wgsl, { recursive: true });
        out.code.forEach((c, i) => fs.writeFileSync(path.join(wgsl, `${String(i).padStart(3, "0")}-${out.mod[i].art}.wgsl`), c));
    }
    delete out.code;
    const aus = arg("--aus", path.join(__dirname, "mess", `welt-${fall}.json`));
    fs.mkdirSync(path.dirname(aus), { recursive: true });
    fs.writeFileSync(aus, JSON.stringify(out, null, 1));
    const mb = (b) => (b / 1048576).toFixed(2);
    const v = out.moduleVorBild;
    console.log(
        `FALL ${fall} (holz ${out.holz}, Pool ${out.poolPlaetze} Plätze, Stub ${STUB}) — Weltbild nach ${out.weltbildMs ? Math.round(out.weltbildMs) + " ms" : "NIE (Frist)"} · ` +
            `Module vor dem Bild: fragment ${v.fragment?.n || 0} (${mb(v.fragment?.bytes || 0)} MB) · vertex ${v.vertex?.n || 0} (${mb(v.vertex?.bytes || 0)} MB) · ` +
            `Knoten-Bau: ${out.erstZeichnung.bauN} Bauten ${Math.round(out.erstZeichnung.bauMs)} ms (swiftshader-Container, JS) · Knoten Σ ${out.knotenBauVorBild.knoten}`
    );
    if (konsole.length) console.log("  Konsole: " + konsole.slice(0, 6).join("\n           "));
    await browser.close();
    srv.close();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
