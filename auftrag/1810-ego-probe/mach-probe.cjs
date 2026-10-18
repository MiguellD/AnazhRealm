// mach-probe.cjs <repo> : schreibt <repo>/scripts/_probe-ego-schatten.cjs (unversioniert) = die Linse + Bündel-Mitschrift je Schuss
const fs = require("fs"), path = require("path");
const repo = process.argv[2];
let s = fs.readFileSync(path.join(repo, "scripts/diag-ego-schatten.cjs"), "utf8");
const a = "            const schuss = async (name) => {\n";
if (!s.includes(a)) throw new Error("schuss fehlt");
s = s.replace(a, a + "                window.__probeTag = name;\n");
const f = "                frame();\n                const px = await rend.readRenderTargetPixelsAsync";
if (!s.includes(f)) throw new Error("frame fehlt");
s = s.replace(f, "                window.__probeTag = name + '#letzt';\n" + f);
const b = "        out = await page.evaluate(buehne,";
if (!s.includes(b)) throw new Error("buehne fehlt");
const hook = `        await page.evaluate(() => {
            const r = window.anazhRealm, rend = r.state.renderer;
            window.__probe = [];
            const roh = rend._renderBundles;
            rend._renderBundles = function (bundles, sceneRef, lightsNode) {
                const vor = [];
                if (sceneRef && sceneRef.name === "ego-schatten:buehne")
                    for (const bb of bundles) {
                        const d = this.backend.get(this._bundles.get(bb.bundleGroup, bb.camera, this._currentRenderContext));
                        vor.push({ skin: bb.bundleGroup.userData._creatureSkin === true, name: bb.bundleGroup.name, op: bb.renderList.opaque.length,
                            opNamen: bb.renderList.opaque.map((it) => (it.object.name || it.object.type) + "@" + it.object.layers.mask).join(","),
                            gpu0: d.bundleGPU !== undefined, ro0: d.renderObjects ? d.renderObjects.length : -1,
                            ver: bb.bundleGroup.version + "/" + d.version, d });
                    }
                const n0 = r._leibBuendelNeu || 0;
                const aus = roh.call(this, bundles, sceneRef, lightsNode);
                for (const x of vor) { x.ro1 = x.d.renderObjects ? x.d.renderObjects.length : -1; x.gpu1 = x.d.bundleGPU !== undefined; delete x.d; }
                if (vor.length) window.__probe.push({ tag: window.__probeTag, ctx: this._currentRenderContext && this._currentRenderContext.id, neu: (r._leibBuendelNeu || 0) - n0, x: vor });
                return aus;
            };
        });
`;
s = s.replace(b, hook + b);
const c = "        log(`Ego (Kopf): ${JSON.stringify(out.kopf)}`);\n";
if (!s.includes(c)) throw new Error("log fehlt");
s = s.replace(c, c + "        { const pr = await page.evaluate(() => window.__probe); const fs2 = require('fs'); fs2.writeFileSync(process.env.PROBE_AUS || 'probe.json', JSON.stringify(pr, null, 1)); log('PROBE ' + pr.length + ' Bündel-Gänge'); }\n");
fs.writeFileSync(path.join(repo, "scripts/_probe-ego-schatten.cjs"), s);
console.log("ok");
