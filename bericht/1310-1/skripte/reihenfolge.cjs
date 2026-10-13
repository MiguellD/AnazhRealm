// 1310-1: die Zeichen-Reihenfolge des Hauptbilds (r184 RenderList: erst die Bündel, dann die losen undurchsichtigen Objekte
// nach groupOrder · renderOrder · z · id). node reihenfolge.cjs <port> [datei.json] — rendert einen Frame (Spiel-Loop ruht),
// liest die Liste der Szene × Haupt-Kamera und schreibt je Eintrag Name/Schlüssel, id, z, renderOrder, Klasse, Dreiecke.
"use strict";
const http = require("http");
const fs = require("fs");
const [port, datei] = process.argv.slice(2);
const code = `
const st = r.state, rend = st.renderer, scene = st.scene, cam = st.camera;
try { rend._nodes && rend._nodes.nodeFrame && rend._nodes.nodeFrame.update(); r._gameLoopTick(performance.now()); } catch (e) {}
await rend.backend.device.queue.onSubmittedWorkDone();
const listen = [];
const RL = rend._renderLists;
// alle Listen der Szene (der Szenen-Pass rendert mit der Haupt-Kamera; Schatten-Kameras getrennt)
const kette = RL && RL.lists ? RL.lists : null;
const name = (o) => (o.userData && (o.userData.archInstanceKey || o.userData.bauSatz || o.userData.satz)) || o.name || o.type;
const dreiecke = (g) => { if (!g) return 0; const n = g.index ? g.index.count : g.attributes && g.attributes.position ? g.attributes.position.count : 0; return Math.round(n / 3); };
const rl = RL.get(scene, cam);
const zeile = (it) => ({ n: String(name(it.object)).slice(0, 60), id: it.object.id, z: +(+it.z).toFixed(2), ro: it.renderOrder, go: it.groupOrder, inst: it.object.count, tri: dreiecke(it.geometry), mat: it.material && (it.material.name || it.material.type), matId: it.material && it.material.id });
const bundles = (rl.bundles || []).map((b) => ({ n: String(name(b.bundleGroup || b.group || b)).slice(0, 60), kinder: ((b.bundleGroup || b.group || {}).children || []).length }));
const opaque = (rl.opaque || []).slice(0, 200).map(zeile);
const transparent = (rl.transparent || []).slice(0, 60).map(zeile);
return { kamera: [cam.position.x, cam.position.y, cam.position.z].map((x) => +x.toFixed(1)), nOpaque: (rl.opaque || []).length, nBundles: (rl.bundles || []).length, bundles, opaque, transparent };`;
const q = http.request({ host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => {
        if (datei) fs.writeFileSync(datei, d);
        try {
            const e = JSON.parse(d).ergebnis;
            console.log(`Kamera ${e.kamera} · ${e.nBundles} Bündel · ${e.nOpaque} lose undurchsichtige`);
            for (const b of e.bundles) console.log(`  BÜNDEL ${b.n} (${b.kinder} Kinder)`);
            e.opaque.forEach((o, i) => console.log(`  ${String(i).padStart(3)} ${o.n.padEnd(42)} id ${o.id} z ${o.z} ro ${o.ro} inst ${o.inst ?? "-"} tri ${o.tri} mat ${o.matId}`));
        } catch (_e) {
            console.log(d.slice(0, 2000));
        }
    });
});
q.end(JSON.stringify({ code }));
