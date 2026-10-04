// draw-zaehler.cjs — DER DRAW-ZÄHLER (V18.510): GPU-Draw-Befehle und Dreiecke je PASS (Hauptbild · jede
// Schatten-Kaskade) und je KLASSE, an EINEM echten Frame. Befund 02.10.: das HUD (renderer.info) sah die
// Region-Bundles im Replay nicht (148 dc), die GPU führte 29 943 Befehle aus — 97,5 % davon aus
// BatchedMeshes, die unter WebGPU je INSTANZ einen drawIndexed ausgeben. Die Zahl hier kommt vom
// Renderer-Draw selbst (`_renderObjectDirect`), die Region-Bundles werden für den Zähl-Frame neu
// aufgenommen (sonst zöge der Replay sie ungesehen).
//
//   Seite:     window.__drawZensus({ top: 16 }) → { passe: {haupt, k0, k1, …}, klassen, programme, frameMs }
//   Werkbank:  node scripts/werkbank.cjs zaehlen [px py pz lx ly lz]   (Höhen mit `+` relativ zum Boden)

function drawZensus(opts) {
    return (async () => {
        const o = opts || {};
        const r = window.anazhRealm;
        const st = r.state;
        const rend = st.renderer;
        const csm = st.csmNode;
        const passOf = (camera) => {
            if (camera === st.camera) return "haupt";
            if (csm && csm.lights)
                for (let i = 0; i < csm.lights.length; i++)
                    if (csm.lights[i].shadow && csm.lights[i].shadow.camera === camera) return "k" + i;
            return camera && camera.isOrthographicCamera ? "ortho" : "anders";
        };
        // DER TÄTER HAT EINEN NAMEN (Welle B): ein Unbenannter heißt nach seinem Inventar-Stempel (streu-klein ·
        // terrain-stitch · deko-fernfeld) bzw. seiner Wasser-Art (hydroKind), erst dann nach dem Typ — „Mesh" als
        // Klasse verschluckte 229 Befehle aus sechs Familien.
        const name = (x) => {
            if (x.name) return x.name.replace(/[-_:#]?[-\d].*$/, "") || "?";
            const u = x.userData || {};
            return u.inventar || u.hydroKind || x.type || "?";
        };
        // Ein Instanz-Schlüssel ist `typ#leaf@region` (oder `leaf@region`, wenn das Leaf eine Studio-Identität
        // trägt): Studio-Leaves (`f:<preset>|…`, `fimp:<preset>…`) zählen je Preset getrennt — gleiche Studio-
        // Geometrie unter zwei Bau-Typen ist sichtbar als zwei Klassen desselben Presets.
        const instKlasse = (k) => {
            const s = String(k);
            const at = s.indexOf("@");
            const body = at >= 0 ? s.slice(0, at) : s;
            const h = body.indexOf("#");
            const typ = h >= 0 ? body.slice(0, h) : "";
            const leaf = h >= 0 ? body.slice(h + 1) : body;
            const m = /^(f|fimp):([^|:]+)/.exec(leaf);
            if (m) return "inst:" + (typ ? typ + "/" : "") + m[1] + ":" + m[2];
            return "inst:" + (typ || leaf);
        };
        const klasse = (obj) => {
            let n = obj;
            while (n && n.parent && n.parent !== st.scene) n = n.parent;
            const top = n || obj;
            const u = top.userData || {};
            if (u._tierBaum) return "tier";
            if (top === st.playerMesh) return "spieler";
            if (top.isBundleGroup) {
                let m = obj;
                while (m.parent && m.parent !== top) m = m.parent;
                const k = (m.userData && m.userData.archInstanceKey) || null;
                if (k) return instKlasse(k);
                return "bundle:" + name(m);
            }
            if (u.archInstanceKey) return instKlasse(u.archInstanceKey);
            return name(top);
        };
        const zaehl = {};
        const roh = rend._renderObjectDirect;
        rend._renderObjectDirect = function (object, material, scene, camera, ...rest) {
            const k = klasse(object) + "|" + passOf(camera);
            const g = object.geometry;
            let cmd = 1,
                tris = 0;
            if (object.isBatchedMesh) {
                cmd = object._multiDrawCount | 0;
                const c = object._multiDrawCounts;
                for (let i = 0; i < cmd; i++) tris += c[i] / 3;
            } else if (g) {
                const n = g.index ? g.index.count : g.attributes.position ? g.attributes.position.count : 0;
                const dr = g.drawRange && Number.isFinite(g.drawRange.count) ? Math.min(g.drawRange.count, n) : n;
                tris = dr / 3;
                if (object.isInstancedMesh) tris *= object.count;
            }
            const e = zaehl[k] || (zaehl[k] = { cmd: 0, obj: 0, tris: 0 });
            e.obj++;
            e.cmd += cmd;
            e.tris += tris;
            return roh.call(this, object, material, scene, camera, ...rest);
        };
        const q = rend.backend && rend.backend.device ? rend.backend.device.queue : null;
        let frameMs = null;
        try {
            st.scene.traverse((n) => {
                if (n.isBundleGroup) n.needsUpdate = true;
            });
            r._schattenAlleNeu();
            if (q) await q.onSubmittedWorkDone();
            const t0 = performance.now();
            r._loopRender(performance.now() / 1000);
            if (q) await q.onSubmittedWorkDone();
            frameMs = Math.round(performance.now() - t0);
        } finally {
            rend._renderObjectDirect = roh;
        }
        const passe = {};
        const klassen = {};
        for (const [k, v] of Object.entries(zaehl)) {
            const [kl, p] = k.split("|");
            const e = passe[p] || (passe[p] = { cmd: 0, tris: 0 });
            e.cmd += v.cmd;
            e.tris += Math.round(v.tris);
            const kk = klassen[kl] || (klassen[kl] = { cmd: 0, tris: 0, je: {} });
            kk.cmd += v.cmd;
            kk.tris += Math.round(v.tris);
            kk.je[p] = v.cmd;
        }
        const gesamt = Object.values(passe).reduce((a, e) => ({ cmd: a.cmd + e.cmd, tris: a.tris + e.tris }), {
            cmd: 0,
            tris: 0,
        });
        const top = Object.entries(klassen)
            .sort((a, b) => b[1].cmd - a[1].cmd)
            .slice(0, o.top || 16)
            .map(([kl, v]) => ({ klasse: kl, cmd: v.cmd, tris: v.tris, je: v.je }));
        // Die Programm-Linse: verschiedene Vertex-/Fragment-Programme und Render-Pipelines. Ein Puffer-Name je
        // Objekt (r184 `NodeBuffer_<id>`) machte jede InstancedMesh zu ihrem eigenen Programm — „familien" zählt
        // die Vertex-Programme ohne Ziffern: liegt `programme.vertex` weit darüber, kompiliert die Welt je Objekt.
        const P = rend._pipelines;
        let programme = null;
        if (P && P.programs) {
            const v = [...P.programs.vertex.values()].map((x) => x.code || "");
            programme = {
                vertex: v.length,
                fragment: P.programs.fragment.size,
                familien: new Set(v.map((c) => c.replace(/\d+/g, "#"))).size,
                pipelines: P.caches ? P.caches.size : null,
            };
        }
        return { gesamt, passe, klassen: top, programme, frameMs, kaskaden: csm ? csm.cascades : 0 };
    })();
}

module.exports = { ZAEHLER_INSTALL: `window.__drawZensus = ${drawZensus.toString()};` };
