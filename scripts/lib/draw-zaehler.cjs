// draw-zaehler.cjs — DER DRAW-ZÄHLER (V18.510): GPU-Draw-Befehle und Dreiecke je PASS (Hauptbild · jede
// Schatten-Kaskade) und je KLASSE, an EINEM echten Frame. Befund 02.10.: das HUD (renderer.info) sah die
// Region-Bundles im Replay nicht (148 dc), die GPU führte 29 943 Befehle aus — 97,5 % davon aus
// BatchedMeshes, die unter WebGPU je INSTANZ einen drawIndexed ausgeben. Die Zahl hier kommt vom
// Renderer-Draw selbst (`_renderObjectDirect`), die Region-Bundles werden für den Zähl-Frame neu
// aufgenommen (sonst zöge der Replay sie ungesehen).
//
// DIE TÄTER-KLASSE (W0, Band-Linse): jeder Befehl trägt einen Namen, der den Täter nennt — die Klasse ist die des
// Stamms (`AnazhRealm#_taeterKlasse`, `AnazhRealm._instanzKlasse`): Instanz-Gruppen als `<familie>:<preset>:L<stufe>`
// (f · fimp · fscatter · g), `tier:<seele>`, `spieler`, sonst der Name des Erzeugers; ohne jeden Namen
// `UNBENANNT:<type>` — ein Linsen-Fehler (die Band-Linse ist rot, bis der Erzeuger das Objekt benennt). `unbenannt`
// trägt je Fall eine Spur (Eltern-Kette, Material, Geometrie), die den Erzeuger finden lässt.
//   - Je Klasse im Hauptbild: die Instanzen und ihr Abstand zur Kamera (dMin/dMax; jede Instanz-Senke ist dicht, jede
//     gezeichnete Instanz lebt — `gate:freie-slots`) — eine Nah-Stufe in der Ferne ist der stille L0-Rückfall (die Band-Linse liest `stufenWand`).
//   - `art` = die Studio-Art des Presets (Rezept-`kind` der lebenden Foundry), wo die Klasse ein Foundry-Preset trägt.
//
//   Seite:     window.__drawZensus({ top: 16, alle: false }) → { passe, klassen, unbenannt, programme, frameMs }
//              window.__passName(scene, camera) → haupt · k<i> · post · TRAA · …  (die EINE Pass-Benennung)
//              window.__pufferZensus() → { mb, halter, klassen }  (die GPU-Puffer je Halter: szene · bild · ruhend · verwaist)
//              window.__texturZensus() → { mb, erzeuger: [{erzeuger, mb, n}], unbenannt }  (Textur-Objekte je Erzeuger)
//   Werkbank:  node scripts/werkbank.cjs zaehlen [px py pz lx ly lz]   (Höhen mit `+` relativ zum Boden)
//              node scripts/werkbank.cjs band                          (Klasse × Stufe × Pass gegen den Haushalt)
//   Node:      require("./draw-zaehler.cjs").texturErzeuger — dieselbe Funktion (die Band-Wand prüft sie headless).

// DER NAME EINES PASSES — die EINE Benennung jedes Renders am Chokepoint `_renderScene` (Szene + Kamera): der Draw-Zähler
// (je Befehl), die Pass-Uhr (`lauf`, `zerlegen`) und die Frame-Anatomie lesen sie. Das Hauptbild (die Spiel-Kamera),
// jede Schatten-Kaskade `k<i>` (ohne CSM die EINE Karte des Haupt-Lichts `k0`), die Ausgabe der Post-Kette `post`
// (r184-RenderPipeline-Quad), sonst der Name der Szene (r184 benennt seine Quads: `TRAA`), der Kamera, ihr Typ.
function passName(scene, camera) {
    const st = window.anazhRealm.state;
    if (camera === st.camera) return "haupt";
    const csm = st.csmNode;
    if (csm && csm.lights)
        for (let i = 0; i < csm.lights.length; i++)
            if (csm.lights[i].shadow && csm.lights[i].shadow.camera === camera) return "k" + i;
    const dl = st.directionalLight;
    if (dl && dl.shadow && dl.shadow.camera === camera) return "k0";
    if (scene && scene.name === "Render Pipeline") return "post";
    return (scene && scene.name) || (camera && (camera.name || camera.type)) || "?";
}

function drawZensus(opts) {
    return (async () => {
        const o = opts || {};
        const r = window.anazhRealm;
        const st = r.state;
        const rend = st.renderer;
        const csm = st.csmNode;
        const passOf = (scene, camera) => window.__passName(scene, camera);
        // DIE TÄTER-KLASSE ist die des Stamms (`_taeterKlasse`): der Flugschreiber, die Albedo-Sicht und der Szenen-Zensus
        // des Playtests buchen unter denselben Namen.
        const klasse = (obj) => r._taeterKlasse(obj);
        const zaehl = {};
        const nah = {};
        const unbenannt = new Map();
        const cam = st.camera.position;
        // DIE EXEMPLARE (Soll-Zeilen der Messorte): ein Bau-Eintrag belegt je Stoff einen Platz seiner Instanz-Gruppen
        // (`instSlots`: Gruppen-Schlüssel + Platz) — der Eintrag hinter einer gezeichneten Instanz ist das Exemplar. Ohne
        // Eintrag (Satz, Tier, Einzelstück) zählt der Ort.
        const slotEintrag = new Map();
        for (const e of st.architectures || [])
            for (const s of e.instSlots || []) {
                let m = slotEintrag.get(s.key);
                if (!m) slotEintrag.set(s.key, (m = new Map()));
                m.set(s.slot, e.id);
            }
        const roh = rend._renderObjectDirect;
        rend._renderObjectDirect = function (object, material, scene, camera, ...rest) {
            const kl = klasse(object);
            const pass = passOf(scene, camera);
            const k = kl + "|" + pass;
            const g = object.geometry;
            // je Draw EIN Befehl: seit V18.510 ist jedes Leaf eine InstancedMesh (der Batch-Zweig fiel mit dem Batch)
            const cmd = 1;
            let tris = 0;
            if (g) {
                const n = g.index ? g.index.count : g.attributes.position ? g.attributes.position.count : 0;
                const dr = g.drawRange && Number.isFinite(g.drawRange.count) ? Math.min(g.drawRange.count, n) : n;
                tris = dr / 3;
                if (object.isInstancedMesh) tris *= object.count;
            }
            const e = zaehl[k] || (zaehl[k] = { cmd: 0, obj: 0, tris: 0 });
            e.obj++;
            e.cmd += cmd;
            e.tris += tris;
            // Die Nähe der Klasse im Hauptbild: jede Instanz bzw. das Objekt.
            if (pass === "haupt") {
                // Die EXEMPLARE einer Klasse: die Bau-Einträge hinter ihren Instanzen (ein Tor zeichnet je Stoff einen Zug,
                // `inst` zählt jede Instanz jedes Zugs, die Türflügel tragen eigene Orte — der Eintrag zählt das Tor einmal),
                // ohne Eintrag die verschiedenen Orte (auf 0,5 m).
                const w = nah[kl] || (nah[kl] = { inst: 0, dMin: Infinity, dMax: 0, orte: new Set(), eintraege: new Set() });
                const mw = object.matrixWorld.elements;
                const miss = (x, y, z) => {
                    const wx = mw[0] * x + mw[4] * y + mw[8] * z + mw[12];
                    const wy = mw[1] * x + mw[5] * y + mw[9] * z + mw[13];
                    const wz = mw[2] * x + mw[6] * y + mw[10] * z + mw[14];
                    const d = Math.hypot(wx - cam.x, wy - cam.y, wz - cam.z);
                    w.inst++;
                    w.orte.add(Math.round(wx * 2) + "," + Math.round(wy * 2) + "," + Math.round(wz * 2));
                    if (d < w.dMin) w.dMin = d;
                    if (d > w.dMax) w.dMax = d;
                };
                if (object.isInstancedMesh && object.instanceMatrix) {
                    const a = object.instanceMatrix.array;
                    const ein = slotEintrag.get(object.userData && object.userData.archInstanceKey);
                    for (let i = 0; i < object.count; i++) {
                        const b = i * 16;
                        miss(a[b + 12], a[b + 13], a[b + 14]);
                        const id = ein ? ein.get(i) : undefined;
                        if (id != null) w.eintraege.add(id);
                    }
                } else if (g && g.boundingSphere) {
                    const c = g.boundingSphere.center;
                    miss(c.x, c.y, c.z);
                } else miss(0, 0, 0);
            }
            // Die Spur je unbenanntem Erzeuger (Material × Geometrie × Pass), höchstens 24.
            const spur = kl.startsWith("UNBENANNT:")
                ? k + "|" + ((material && (material.name || material.type)) || "") + "|" + (g ? g.name || g.type : "")
                : null;
            if (spur && !unbenannt.has(spur) && unbenannt.size < 24) {
                const kette = [];
                for (let p = object; p && p !== st.scene && kette.length < 6; p = p.parent)
                    kette.push(p.type + (p.name ? "(" + p.name + ")" : ""));
                unbenannt.set(spur, {
                    klasse: kl,
                    pass,
                    kette: kette.join(" < "),
                    material: (material && (material.name || material.type)) || null,
                    geometrie: g ? g.name || g.type : null,
                    vertices: g && g.attributes && g.attributes.position ? g.attributes.position.count : 0,
                    instanzen: object.isInstancedMesh ? object.count : null,
                    userData: Object.keys(object.userData || {}).slice(0, 8),
                });
            }
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
            // Der Zähler vor dem gezählten Frame: was danach gezeichnet wird, trägt einen höheren (`__pufferZensus`).
            window.__zensusCalls = rend.info.render.calls;
            r._loopRender(performance.now() / 1000);
            if (q) await q.onSubmittedWorkDone();
            frameMs = Math.round(performance.now() - t0);
        } finally {
            rend._renderObjectDirect = roh;
        }
        // Die Studio-Art je Foundry-Klasse (Rezept-`kind`): die Band-Wand ordnet über sie, nie über Art-Namen-Listen.
        const rezepte = r._foundry && r._foundry.recipes ? r._foundry.recipes : {};
        const artOf = (kl) => {
            const m = /^(f|fimp|fscatter):([^:]+):/.exec(kl);
            const rz = m ? rezepte[m[2]] : null;
            return rz && rz.kind ? rz.kind : null;
        };
        const passe = {};
        const klassen = {};
        for (const [k, v] of Object.entries(zaehl)) {
            // der Pass steht hinter dem LETZTEN Trenner — Klassen-Namen tragen selbst „|" (Studio-Leaves `f:<preset>|…`);
            // split("|") las ihre Teile als Pässe („1", „2") und nahm die Befehle aus k0/k1
            const t = k.lastIndexOf("|");
            const kl = k.slice(0, t),
                p = k.slice(t + 1);
            const e = passe[p] || (passe[p] = { cmd: 0, tris: 0 });
            e.cmd += v.cmd;
            e.tris += Math.round(v.tris);
            const kk = klassen[kl] || (klassen[kl] = { cmd: 0, tris: 0, je: {}, jeTris: {} });
            kk.cmd += v.cmd;
            kk.tris += Math.round(v.tris);
            kk.je[p] = v.cmd;
            kk.jeTris[p] = Math.round(v.tris);
        }
        const gesamt = Object.values(passe).reduce((a, e) => ({ cmd: a.cmd + e.cmd, tris: a.tris + e.tris }), {
            cmd: 0,
            tris: 0,
        });
        const liste = Object.entries(klassen)
            .sort((a, b) => b[1].cmd - a[1].cmd)
            .slice(0, o.alle ? Infinity : o.top || 16)
            .map(([kl, v]) => {
                const w = nah[kl];
                const st0 = /:L(\d)$/.exec(kl);
                return {
                    klasse: kl,
                    stufe: st0 ? Number(st0[1]) : null,
                    art: artOf(kl),
                    cmd: v.cmd,
                    tris: v.tris,
                    je: v.je,
                    jeTris: v.jeTris,
                    inst: w ? w.inst : 0,
                    exemplare: w ? w.eintraege.size || w.orte.size : 0,
                    dMin: w && Number.isFinite(w.dMin) ? Math.round(w.dMin) : null,
                    dMax: w && w.inst ? Math.round(w.dMax) : null,
                };
            });
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
        return {
            gesamt,
            passe,
            klassen: liste,
            unbenannt: [...unbenannt.values()],
            programme,
            frameMs,
            kaskaden: csm ? csm.cascades : 0,
            kamera: [cam.x, cam.y, cam.z].map((x) => +x.toFixed(1)),
        };
    })();
}

// DIE GPU-PUFFER BEIM NAMEN (W6): die Geometrie-Puffer tragen in r184 kein Label (`buf:?` im VRAM-Abgriff — nach drei
// Wander-Schleifen à 1,2 km 6 334 Puffer · 103 MB ohne Namen). r184 trägt jedes hochgeladene Attribut in
// `renderer.info.memoryMap` (Schlüssel = das Attribut, STARK gehalten, bis `_attributes.delete` es austrägt) — das EINE
// Register dessen, was als Geometrie-Puffer auf der GPU liegt. Hier bekommt jeder Puffer seinen HALTER und wird im
// Abgriff umgebucht (`__vramUmbuchen`):
//   szene:<Täter-Klasse>        ein Objekt des Szenen-Graphen zeichnet ihn (Attribut, Index, Instanz-Daten)
//   bild:<Rolle>                kein Szenen-Objekt, aber der gezählte Frame zeichnete ihn (r184-Quads der Post-Kette)
//   ruhend:<Foundry-Schlüssel>  nur der Foundry-Cache hält ihn — keine Gruppe im Graphen zeichnet ihn
//   verwaist:<Rolle>            nur r184s Register hält ihn: sein Objekt fiel ohne GPU-Abschied — ein LECK
// Rolle = instanzMatrix (Speicher-Puffer je Instanz) · instanz · index · vertex · speicher. `ruhend` und `verwaist` sind
// Speicher, den kein Bild trägt — die Band-Linse urteilt sie als LECK (band-urteil). Der gezählte Frame setzt
// `window.__zensusCalls` (r184 `info.render.calls` vor dem Frame); `attributeCall` (r184 Geometries) trägt je Attribut den
// Zähler seines letzten Zeichnens.
// DER ZENSUS-PUNKT DER RESIDENZ: der Kehraus des Spiels (`_gpuKehraus`) läuft im Takt GPU_KEHRAUS_MS — die Linse liest am
// Kehraus-Punkt (er läuft hier einmal, gegen den gezählten Frame), sonst stünde ein Takt-Fenster gefallener Gruppen als
// `ruhend` im Urteil. Was danach ohne Bild bleibt, kann der Kehraus nicht nehmen: ein Leck.
function kehrausJetzt() {
    const r = window.anazhRealm;
    if (!r || typeof r._gpuKehraus !== "function" || !Number.isFinite(window.__zensusCalls)) return 0;
    r.state._gpuKehrausT = 0;
    return r._gpuKehraus(window.__zensusCalls, performance.now());
}

function pufferZensus() {
    const r = window.anazhRealm;
    const st = r.state;
    const rend = st.renderer;
    const be = rend && rend.backend;
    const reg = rend && rend.info && rend.info.memoryMap;
    if (!be || !reg || typeof be.get !== "function") return null;
    const halter = new Map();
    const merke = (a, name) => {
        if (!a || halter.has(a)) return;
        halter.set(a, name);
        if (a.isInterleavedBufferAttribute && !halter.has(a.data)) halter.set(a.data, name);
    };
    const geo = (g, name) => {
        if (!g || !g.attributes) return;
        for (const k in g.attributes) merke(g.attributes[k], name);
        if (g.index) merke(g.index, name);
        if (g.indirect) merke(g.indirect, name);
    };
    st.scene.traverse((o) => {
        if (!o.geometry && !o.isInstancedMesh) return;
        const name = "szene:" + r._taeterKlasse(o);
        geo(o.geometry, name);
        if (o.isInstancedMesh) {
            merke(o.instanceMatrix, name);
            merke(o.instanceColor, name);
        }
        // Was seine Render-Objekte zeichnen (das Register des Stamms, `_renderObjektRegister`): auch die Knoten-Attribute
        // (r184s InstanceNode zeichnet die Instanz-Farbe aus einem eigenen Attribut).
        for (const ro of o.__renderObjekte || []) if (ro.attributes) for (const a of ro.attributes) merke(a, name);
    });
    const cache = r._foundry && r._foundry.cache;
    if (cache)
        for (const [key, g] of cache) {
            if (!g || typeof g !== "object") continue;
            const name = "ruhend:" + key;
            for (const ch of g.children || []) geo(ch.geometry, name);
            const fl = g._foundryFlat;
            if (fl && Array.isArray(fl.leaves))
                for (const lf of fl.leaves) {
                    geo(lf.geom, name);
                    geo(lf._schattenGeom, name);
                }
        }
    const aufruf = rend._geometries && rend._geometries.attributeCall;
    const bildAb = Number.isFinite(window.__zensusCalls) ? window.__zensusCalls : Infinity;
    const rolle = (a, typ) =>
        typ === "indexAttributes"
            ? "index"
            : a.isInstancedBufferAttribute || a.isStorageInstancedBufferAttribute
              ? a.itemSize === 16 && typ === "storageAttributes"
                  ? "instanzMatrix"
                  : "instanz"
              : typ === "storageAttributes" || typ === "indirectStorageAttributes"
                ? "speicher"
                : "vertex";
    const je = new Map();
    const klassen = new Map();
    let gesamt = 0;
    for (const [a, v] of reg) {
        if (!a || a.isTexture || !v || typeof v !== "object" || !/ttributes$/.test(v.type || "")) continue;
        const d = be.get(a.isInterleavedBufferAttribute ? a.data : a);
        const buf = d && d.buffer;
        if (!buf) continue;
        let name = halter.get(a);
        if (!name || name.startsWith("ruhend:")) {
            const zuletzt = aufruf ? aufruf.get(a) : undefined;
            if (zuletzt >= bildAb) name = "bild:" + rolle(a, v.type);
            else if (!name) name = "verwaist:" + rolle(a, v.type);
        }
        const k = "buf:" + window.__vramFalte(name);
        if (window.__vramUmbuchen) window.__vramUmbuchen(buf, k);
        const b = (buf.__vramH && buf.__vramH.b) || buf.size || 0;
        gesamt += b;
        const h = name.split(":")[0];
        je.set(h, (je.get(h) || 0) + b);
        const kl = h + ":" + name.slice(h.length + 1).split("|")[0];
        const e = klassen.get(kl) || { klasse: kl, bytes: 0, n: 0 };
        e.bytes += b;
        e.n++;
        klassen.set(kl, e);
    }
    const mb = (b) => +(b / 1048576).toFixed(2);
    return {
        mb: mb(gesamt),
        halter: Object.fromEntries([...je.entries()].map(([h, b]) => [h, mb(b)])),
        klassen: [...klassen.values()]
            .sort((x, y) => y.bytes - x.bytes)
            .slice(0, 40)
            .map((e) => ({ klasse: e.klasse, mb: mb(e.bytes), n: e.n })),
    };
}

// DIE FALTUNG EINES VRAM-LABELS — EINE Regel für den Abgriff beim Anlegen (werkbank `vramAbgriff`), das Umbuchen des
// Textur-Zensus und das Urteil (band-urteil `erzeugerOf`): eine Ziffern-Folge fällt zu `#`, wenn sie ein Schlüssel-Teil
// ist — hinter einem Trenner (`eiche|3|summer` → `eiche|#|summer`, `NodeBuffer_412` → `NodeBuffer_#`), als r184-
// Kennung vor `_` (`bindingBuffer1381_object`, `bindingBuffer3_render` → `bindingBuffer#_…`) oder ab zwei Ziffern am
// Label-Ende; Namen mit Ziffern bleiben ganz (`r184-ausgabe`, `p2p-namensschild`, `kaskade0`). Die alte Faltung jeder
// Ziffer machte aus `r184-ausgabe` `r#-ausgabe`; ohne die Kennungs-Regel zerfiel der Puffer-Bericht in 4 174 Erzeuger.
function vramFalte(s) {
    return String(s).replace(/(^|[^A-Za-z\d])\d+|(?<=[A-Za-z])\d+(?=_)|(?<=[A-Za-z])\d{2,}$/g, (m, vor) =>
        vor === undefined ? "#" : vor + "#"
    );
}

// DER ERZEUGER EINER TEXTUR: ihr Name (der Stamm benennt jede, die er anlegt — gate:profiband H4); ohne Namen der
// Name ihres Render-Ziels. r184 legt zu jedem Ziel mit Tiefen-Puffer die DepthTexture selbst an (namenlos, ihr
// `renderTarget` zeigt auf das Ziel → `<ziel>:tiefe`) und das Ausgabe-Ziel des Renderers (`isPostProcessingRenderTarget`,
// Tonemapping zur Leinwand) ohne Namen (→ `r184-ausgabe`). Sonst null — ein Linsen-Fehler (`tex:?`).
function texturErzeuger(t) {
    if (t.name) return t.name;
    const rt = t.renderTarget;
    if (!rt) return null;
    const ziel = rt.isPostProcessingRenderTarget
        ? "r184-ausgabe"
        : rt.texture && rt.texture !== t && rt.texture.name
          ? rt.texture.name
          : "";
    if (!ziel) return null;
    return t.isDepthTexture ? ziel + ":tiefe" : ziel;
}

// DER TEXTUR-ZENSUS je Erzeuger: jedes lebende Textur-Objekt des Renderers (`info.memoryMap`, Backend-unabhängig —
// auch auf dem WebGL2-Rückfall), Bytes nach r184s eigener Schätzung. Auf WebGPU bucht er zugleich die GPU-Textur
// jedes Objekts, das erst über sein Ziel einen Namen hat, im VRAM-Abgriff der Werkbank (`__vramUmbuchen`) unter
// diesen Erzeuger um — der Abgriff sieht nur das Label, das beim Anlegen galt. `unbenannt` trägt je namenlosem
// Objekt die Spur (Klasse, Format, Größe, Ziel).
function texturZensus() {
    const rend = window.anazhRealm.state.renderer;
    const backend = rend.backend;
    const je = new Map();
    const unbenannt = [];
    let gesamt = 0,
        n = 0;
    for (const [t, v] of rend.info.memoryMap) {
        if (!t || !t.isTexture) continue;
        const b = typeof v === "number" ? v : 0;
        n++;
        gesamt += b;
        const erz = window.__texturErzeuger(t);
        const key = erz ? erz.split(/[:#|]/)[0] || "?" : "?";
        const e = je.get(key) || { erzeuger: key, bytes: 0, n: 0 };
        e.bytes += b;
        e.n++;
        je.set(key, e);
        if (erz && !t.name && window.__vramUmbuchen && backend && typeof backend.get === "function") {
            const d = backend.get(t);
            for (const g of [d.texture, d.msaaTexture])
                if (g && typeof g.__vramK === "string" && g.__vramK.startsWith("tex:? "))
                    window.__vramUmbuchen(g, "tex:" + window.__vramFalte(erz) + g.__vramK.slice(5));
        }
        if (!erz && unbenannt.length < 24)
            unbenannt.push({
                // Die Art aus r184s eigenen Flaggen (der Klassen-Name ist minifiziert).
                klasse:
                    [
                        "DepthTexture",
                        "CanvasTexture",
                        "DataTexture",
                        "DataArrayTexture",
                        "Data3DTexture",
                        "CubeTexture",
                        "FramebufferTexture",
                        "VideoTexture",
                        "CompressedTexture",
                        "RenderTargetTexture",
                    ].find((a) => t["is" + a] === true) || "Texture",
                tiefe: !!t.isDepthTexture,
                format: t.format,
                typ: t.type,
                groesse: t.image ? [t.image.width, t.image.height] : null,
                ziel: t.renderTarget ? { breite: t.renderTarget.width, hoehe: t.renderTarget.height } : null,
                mb: +(b / 1048576).toFixed(2),
            });
    }
    const mb = (x) => +(x / 1048576).toFixed(2);
    return {
        n,
        mb: mb(gesamt),
        erzeuger: [...je.values()]
            .sort((a, b) => b.bytes - a.bytes)
            .map((e) => ({ erzeuger: e.erzeuger, mb: mb(e.bytes), n: e.n })),
        unbenannt,
    };
}

module.exports = {
    texturErzeuger,
    vramFalte,
    // Die Faltung lebt ab Dokument-Start (der Abgriff bucht schon beim ersten Anlegen): `page.evaluateOnNewDocument`.
    FALTE_INSTALL: `window.__vramFalte = ${vramFalte.toString()};`,
    ZAEHLER_INSTALL:
        `window.__passName = ${passName.toString()};` +
        `window.__drawZensus = ${drawZensus.toString()};` +
        `window.__pufferZensus = ${pufferZensus.toString()};` +
        `window.__kehrausJetzt = ${kehrausJetzt.toString()};` +
        `window.__texturErzeuger = ${texturErzeuger.toString()};` +
        `window.__texturZensus = ${texturZensus.toString()};`,
};
