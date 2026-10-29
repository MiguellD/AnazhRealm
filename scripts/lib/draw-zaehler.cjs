// draw-zaehler.cjs — DER DRAW-ZÄHLER: GPU-Draw-Befehle und Dreiecke je PASS (Hauptbild · jede
// Schatten-Kaskade) und je KLASSE, an EINEM echten Frame. Die Zahl hier kommt vom Renderer-Draw selbst
// (`_renderObjectDirect`), die Region-Bundles werden für den Zähl-Frame neu aufgenommen (sonst zöge der Replay sie
// ungesehen).
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

// DER SATZ-INHALT (S3 haus, 1b): ein Satz (je Stoff des gesetzten Baus) zeichnet je Pass EINEN Befehl über die Zellen
// seines Abschnitts — die Klasse „bauSatz" verschwieg, wer darin liegt (die rote bau-Ratsche der Mess-Wiese war die
// Feuerstelle, kein Haus). Je Satz-Zeichnung zerfällt der Abschnitt des Passes (`s.abschnitte`: haupt · k<i> · anders) in
// seine Zellen: Zelle → Bereich (`z.bereich.key`, der Schlüssel der Instanz-Gruppe) → die Täter-Klasse des Stamms
// (`instanzKlasse` = `AnazhRealm._instanzKlasse`) — Klasse × Zellen × Dreiecke, dazu die entarteten Lücken des Laufs
// (`lücke`), ohne Rest (ein Rest steht als `REST` im Inhalt: die Linse rechnet falsch). Die Zelle eines Bau-Bereichs ist
// die Instanz gleichen Platzes (`_bauSatzBlock`: je Instanz eine Zelle) — ihr Eintrag (`slotEintrag`: Gruppen-Schlüssel →
// Platz → Bau-Eintrag) ist das Exemplar. Rein: die Werkbank installiert sie (`ZAEHLER_INSTALL`), gate:profiband pflanzt einen
// Bereich und prüft, dass er erscheint (Selbsttest).
function satzInhalt(s, pass, drawTris, instanzKlasse, slotEintrag) {
    const a = s.abschnitte.get(pass === "haupt" ? "haupt" : /^k\d+$/.test(pass) ? pass : "anders");
    const je = new Map();
    let zellTris = 0;
    for (const z of a ? a.liste : []) {
        const b = z.bereich;
        const kl = instanzKlasse(b.key);
        const e = je.get(kl) || { zellen: 0, tris: 0, eintraege: new Set() };
        const t = z.idx.length / 3;
        e.zellen++;
        e.tris += t;
        zellTris += t;
        const ein = slotEintrag ? slotEintrag.get(b.key) : null;
        const id = ein ? ein.get(b.zellen.indexOf(z)) : undefined;
        if (id != null) e.eintraege.add(id);
        je.set(kl, e);
    }
    const luecke = a ? (a.ende - a.n) / 3 : 0;
    if (luecke > 0) je.set("lücke", { zellen: 0, tris: luecke, eintraege: new Set() });
    const rest = Math.round(drawTris - zellTris - luecke);
    if (rest !== 0) je.set("REST", { zellen: 0, tris: rest, eintraege: new Set() });
    return je;
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
        // DER SATZ-INHALT (S3 haus, 1b, `satzInhalt` unten): nur die Bau-Sätze (`userData.bauSatz`: Bau, Ausstattung,
        // Formationen, ihr Wurf) — ihr Bereich ist eine Instanz-Gruppe; Boden und Wasser sind Chunks, die Streu Kacheln (ihr
        // Name ist ihr Täter).
        const satzOf = new Map();
        if (st.chunkSaetze)
            for (const s of st.chunkSaetze.values())
                if (s && s.mesh && s.spec && s.spec.userData && s.spec.userData.bauSatz) satzOf.set(s.mesh, s);
        const inhalt = {};
        const instanzKlasse = (key) => r.constructor._instanzKlasse(key);
        // DIE WAHL DER GPU (`_instanzWahlGpu`): die Zahl eines Zugs zählt der Compute — nach dem Frame liest der Zähler sie
        // aus dem Auftrags-Puffer der Arena, die gezeichneten Instanzen aus ihrer Liste (`spaet`), nie die Zahl der Senke
        const spaet = [];
        const roh = rend._renderObjectDirect;
        rend._renderObjectDirect = function (object, material, scene, camera, ...rest) {
            const kl0 = klasse(object);
            const pass = passOf(scene, camera);
            const k0 = kl0 + "|" + pass;
            const g = object.geometry;
            const satz = satzOf.get(object);
            if (satz && g) {
                const n0 = g.index ? g.index.count : g.attributes.position ? g.attributes.position.count : 0;
                const dr0 = g.drawRange && Number.isFinite(g.drawRange.count) ? Math.min(g.drawRange.count, n0) : n0;
                const je = window.__satzInhalt(satz, pass, dr0 / 3, instanzKlasse, slotEintrag);
                const ziel = inhalt[k0] || (inhalt[k0] = new Map());
                for (const [ikl, v] of je) {
                    const e = ziel.get(ikl) || { zellen: 0, tris: 0, eintraege: new Set() };
                    e.zellen += v.zellen;
                    e.tris += v.tris;
                    for (const id of v.eintraege) e.eintraege.add(id);
                    ziel.set(ikl, e);
                }
            }
            // je Draw EIN Befehl; die ARENA (G1) je Glied einen Zug (`_stapel`), ein leerer Platz in der Klasse ihres ersten Glieds.
            const arena = object.isGeometrieArena === true ? object._stapel[object._stapel.length - 1] : null;
            for (let j = 0; j < (arena ? arena.zuege.length : 1); j++) {
                const senke = arena ? arena.zuege[j] : object.__instanzQuelle || object;
                const kl = arena ? klasse(senke === object ? object.glieder[0] || object : senke) : kl0;
                const k = kl + "|" + pass;
                const gpu = object._wahl; // die Arena der Wahl (`_wahlVor`): ihre Zahl zählt der Compute (unten)
                let tris = arena && !gpu ? (arena.arr[j * 5] / 3) * arena.arr[j * 5 + 1] : 0;
                if (g && !arena) {
                    const n = g.index ? g.index.count : g.attributes.position ? g.attributes.position.count : 0;
                    const dr = g.drawRange && Number.isFinite(g.drawRange.count) ? Math.min(g.drawRange.count, n) : n;
                    tris = dr / 3;
                    if (senke.isInstancedMesh) tris *= senke.count;
                }
                const e = zaehl[k] || (zaehl[k] = { cmd: 0, obj: 0, tris: 0 });
                e.obj += j === 0 ? 1 : 0; // die Render-Objekte (CPU) — eine Arena bucht das ihre beim ersten Glied
                e.cmd++;
                e.tris += tris;
                // Die Nähe der Klasse im Hauptbild, ihre EXEMPLARE: die Bau-Einträge hinter ihren Instanzen (ein Tor zeichnet je
                // Stoff einen Zug, `inst` zählt jede Instanz jedes Zugs, der Eintrag das Tor einmal), ohne Eintrag die Orte (0,5 m).
                const nahe = (ids) => {
                    if (pass !== "haupt" || senke === object) return;
                    const w =
                        nah[kl] ||
                        (nah[kl] = { inst: 0, dMin: Infinity, dMax: 0, orte: new Set(), eintraege: new Set() });
                    const mw = senke.matrixWorld.elements;
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
                    if (senke.isInstancedMesh && senke.instanceMatrix) {
                        const a = senke.instanceMatrix.array;
                        const ein = slotEintrag.get(senke.userData && senke.userData.archInstanceKey);
                        for (const i of ids || Array(senke.count).keys()) {
                            const b = i * 16;
                            miss(a[b + 12], a[b + 13], a[b + 14]);
                            const id = ein ? ein.get(i) : undefined;
                            if (id != null) w.eintraege.add(id);
                        }
                    } else if (g && g.boundingSphere) {
                        const c = g.boundingSphere.center;
                        miss(c.x, c.y, c.z);
                    } else miss(0, 0, 0);
                };
                if (gpu) spaet.push([k, nahe, object, ...arena.wahl.slice(j * 5 + 1, j * 5 + 5)]);
                else nahe(null);
                // Die Spur je unbenanntem Erzeuger (Material × Geometrie × Pass), höchstens 24.
                const stoff =
                    ((material && (material.name || material.type)) || "") + "|" + (g ? g.name || g.type : "");
                const spur = kl.startsWith("UNBENANNT:") ? k + "|" + stoff : null;
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
                        instanzen: senke.isInstancedMesh ? senke.count : null,
                        userData: Object.keys(object.userData || {}).slice(0, 8),
                    });
                }
            }
            return roh.call(this, object, material, scene, camera, ...rest);
        };
        const q = rend.backend && rend.backend.device ? rend.backend.device.queue : null;
        let frameMs = null;
        try {
            window.__bundlesNeu();
            r._schattenAlleNeu();
            if (q) await q.onSubmittedWorkDone();
            const t0 = performance.now();
            // Der Zähler vor dem gezählten Frame: was danach gezeichnet wird, trägt einen höheren (`__pufferZensus`).
            window.__zensusCalls = rend.info.render.calls;
            r._loopRender();
            if (q) await q.onSubmittedWorkDone();
            frameMs = Math.round(performance.now() - t0);
        } finally {
            rend._renderObjectDirect = roh;
        }
        const lies = async (a) => new Uint32Array(await rend.getArrayBufferAsync(a));
        for (const [k, nahe, a, erst, , arg, li] of spaet) {
            const ind = await lies(a._ind); // je Zug: Indizes, Zahl, …, Abschnitt der Liste
            zaehl[k].tris += (ind[arg - 1] / 3) * ind[arg];
            nahe(Array.from((await lies(a.__instanzQuelle.liste)).subarray(li, li + ind[arg]), (x) => x - erst));
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
            const e = passe[p] || (passe[p] = { cmd: 0, tris: 0, ro: 0 });
            e.cmd += v.cmd;
            e.ro += v.obj;
            e.tris += Math.round(v.tris);
            const kk = klassen[kl] || (klassen[kl] = { cmd: 0, tris: 0, je: {}, jeTris: {} });
            kk.cmd += v.cmd;
            kk.tris += Math.round(v.tris);
            kk.je[p] = v.cmd;
            kk.jeTris[p] = Math.round(v.tris);
            // der Satz-Inhalt dieses Passes: Klasse × Zellen × Dreiecke (die größten zuerst), je Klasse ihre Exemplare
            const ih = inhalt[k];
            if (ih) {
                kk.inhalt = kk.inhalt || {};
                kk.inhalt[p] = [...ih.entries()]
                    .map(([ikl, e]) => {
                        const st1 = /:L(\d)$/.exec(ikl);
                        return {
                            klasse: ikl,
                            stufe: st1 ? Number(st1[1]) : null,
                            art: artOf(ikl),
                            zellen: e.zellen,
                            tris: Math.round(e.tris),
                            eintraege: [...e.eintraege],
                        };
                    })
                    .sort((x, y) => y.tris - x.tris);
            }
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
                    ...(v.inhalt ? { inhalt: v.inhalt } : {}),
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
//   verwaist:<Rolle>            nur r184s Register hält ihn: sein Objekt fiel (oder zieht in der Arena) — ein LECK
// Rolle = instanzMatrix (Speicher-Puffer je Instanz) · instanz · index · vertex · speicher. `ruhend` und `verwaist` sind
// Speicher, den kein Bild trägt — die Band-Linse urteilt sie als LECK (band-urteil). Der gezählte Frame setzt
// `window.__zensusCalls` (r184 `info.render.calls` vor dem Frame); `attributeCall` (r184 Geometries) trägt je Attribut den
// Zähler seines letzten Zeichnens.
// DER ZENSUS-PUNKT DER RESIDENZ: der Kehraus des Spiels (`_gpuKehraus`) läuft im Takt GPU_KEHRAUS_MS — die Linse liest am
// Kehraus-Punkt (er läuft hier einmal, gegen den gezählten Frame), sonst stünde ein Takt-Fenster gefallener Gruppen als
// `ruhend` im Urteil. Was danach ohne Bild bleibt, kann der Kehraus nicht nehmen: ein Leck.
function kehrausJetzt() {
    const r = window.anazhRealm;
    if (!r || !Number.isFinite(window.__zensusCalls)) return 0;
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
        if ((!o.geometry && !o.isInstancedMesh) || o.__arena) return; // ein Glied der Arena zeichnet nicht (Kehraus)
        const name = "szene:" + r._taeterKlasse(o);
        geo(o.geometry, name);
        const q = o.__instanzQuelle || o; // die Arena (G1) hält ihre Matrizen an ihrer Quelle, nie in der Geometrie
        if (q.isInstancedMesh) for (const a of [q.instanceMatrix, q.instanceColor, q.liste]) merke(a, name);
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

// DIE FALTUNG EINES VRAM-LABELS — EINE Regel für den Abgriff beim Anlegen (scripts/lib/vram-abgriff.cjs), das Umbuchen des
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

// DER HALTER DES HEAPS (profiband K5, `werkbank puffer --gang`): jedes ArrayBuffer-Byte, das die Welt hält, am Pfad seines
// ersten Halters ab der Welt (Breitensuche = der kürzeste Weg; Map/Set/Array als `[]`, Map-Schlüssel als `[k]`) — die
// Typed-Arrays sind der Heap der Welt (CDP `Runtime.getHeapUsage` backingStorageSize), der Pfad ist der Täter beim Namen.
function heapHalter(r, tiefe) {
    const gesehen = new WeakSet(),
        je = new Map(),
        q = [[r, "r"]];
    for (let i = 0; i < q.length; i++) {
        const [o, p] = q[i];
        q[i] = null;
        const kinder = [];
        if (o instanceof Map) for (const [k, v] of o) kinder.push([v, p + "[]"], [k, p + "[k]"]);
        else if (o instanceof Set || Array.isArray(o)) for (const v of o) kinder.push([v, p + "[]"]);
        for (const k of Object.keys(o))
            if (!Array.isArray(o) || !/^\d+$/.test(k))
                try {
                    kinder.push([o[k], p + "." + k]);
                } catch {}
        for (const [v, pp] of kinder) {
            if (!v || typeof v !== "object" || gesehen.has(v)) continue;
            gesehen.add(v);
            const buf = ArrayBuffer.isView(v) ? v.buffer : v instanceof ArrayBuffer ? v : null;
            if (buf) {
                if (buf !== v && gesehen.has(buf)) continue;
                gesehen.add(buf);
                const k = pp
                    .split(/(?=[.[])/)
                    .slice(0, tiefe)
                    .join("");
                je.set(k, (je.get(k) || 0) + buf.byteLength);
            } else if (v !== globalThis && !(typeof Node !== "undefined" && v instanceof Node)) q.push([v, pp]);
        }
    }
    return [...je];
}
// DAS GANG-URTEIL (`werkbank puffer --gang`): Heap (JS + Typed-Arrays nach GC) und VRAM am Start vor und nach dem Gang; was
// wuchs, nennt der Diff der Halter-Pfade (`heapHalter`) und der VRAM-Erzeuger (`__vramBericht`).
const GANG = { heapMBjeMin: 5, vramMB: 2 };
function gangUrteil({ vor, nach }) {
    const wuchs = (a, b) => {
        const m = new Map(a);
        const d = b.map(([k, x]) => [k, x - (m.get(k) || 0)]).filter(([, x]) => x >= 1);
        return (
            d
                .sort((p, q) => q[1] - p[1])
                .slice(0, 3)
                .map(([k, x]) => k + " +" + x.toFixed(1) + " MB")
                .join(" · ") || "—"
        );
    };
    const mb = (h) => h.map(([k, x]) => [k, x / 1048576]);
    const vg = (g) => g.vram.liste.map((x) => [x.k, x.mb]);
    const rate = (nach.heapMB - vor.heapMB) / nach.min;
    const f = nach.min >= 1 ? [] : ["gang: " + nach.min + " min — zu kurz"];
    if (rate > GANG.heapMBjeMin)
        f.push(
            "heap: +" +
                rate.toFixed(1) +
                " MB/min > " +
                GANG.heapMBjeMin +
                " — Halter: " +
                wuchs(mb(vor.halter), mb(nach.halter))
        );
    // DIE TIERE ZIEHEN FREI: ein Tier mehr oder weniger am Start ist Bestand, nie Drift — je Art erklärt der Unterschied der
    // Zahl den Leib je Tier vom Start (eine neue Art den vom Ende); was der Leib je Tier zulegt, bleibt Drift
    const [vm, nm] = [new Map(vg(vor)), new Map(vg(nach))];
    const bestand = (k) => {
        const [a, b] = [(vor.tiere || {})[k] | 0, (nach.tiere || {})[k] | 0];
        return a ? ((vm.get(k) || 0) / a) * (b - a) : b ? nm.get(k) || 0 : 0;
    };
    const drift = nach.vram.mb - vor.vram.mb - [...new Set([...vm.keys(), ...nm.keys()])].reduce((s, k) => s + bestand(k), 0);
    if (drift > GANG.vramMB)
        f.push(
            "vram: +" +
                drift.toFixed(1) +
                " MB zurück am Start — " +
                wuchs(vg(vor), [...nm].map(([k, x]) => [k, x - bestand(k)]))
        );
    for (const [k, x] of Object.entries((nach.puffer && nach.puffer.halter) || {}))
        if (/ruhend|verwaist/.test(k) && x > 0) f.push("buf:" + k + " " + x + " MB");
    return f;
}
// Selbsttest: ein ungedeckelter Cache ist rot beim Pfad, ein gedeckelter (LRU 2) nicht, VRAM-Drift beim Erzeuger; ein Wolf
// mehr ist Bestand, ein Wolf-Leib, der je Tier zulegt, Drift.
function gangSelbsttest() {
    const r = { state: { lru: new Map(), offen: [] } };
    const lauf = (offen) => {
        const stand = (v) => {
            const halter = heapHalter(r, 3);
            const [a, w] = [50 + v * (offen ? 3 : 1), v ? (offen ? 6.4 : 5.2) : 2.6];
            return {
                min: v,
                heapMB: halter.reduce((s, [, x]) => s + x, 0) / 1048576,
                halter,
                vram: { mb: a + w, liste: [{ k: "buf:a", mb: a }, { k: "buf:szene:tier:wolf", mb: w }] },
                tiere: { "buf:szene:tier:wolf": v ? 2 : 1 },
            };
        };
        const vor = stand(0);
        for (let i = 0; i < 8; i++) {
            if (offen) r.state.offen.push(new Float32Array(262144));
            r.state.lru.set(Math.random(), new Float32Array(262144));
            if (r.state.lru.size > 2) r.state.lru.delete(r.state.lru.keys().next().value);
        }
        return gangUrteil({ vor, nach: stand(1) }).join(" | ");
    };
    const soll =
        "heap: +8.0 MB/min > 5 — Halter: r.state.offen +8.0 MB | vram: +4.2 MB zurück am Start — buf:a +3.0 MB · buf:szene:tier:wolf +1.2 MB";
    return [lauf(false), lauf(true)].join(" / ") === " / " + soll ? [] : ["der Gang urteilt falsch: " + lauf(true)];
}

// DER GANG (profiband K5, `werkbank puffer --gang`): am Start eingeschwungen messen (`stand`, die Puffer-Linse der Werkbank),
// je ein Drittel gehen · fahren (GT, Taste E) · Nacht (Spieler-Wort) über die echten Tasten und den Spiel-Loop, zurück am Start.
async function gangLauf(page, pufferStand, b) {
    const cdp = await page.target().createCDPSession();
    const T = { w: ["KeyW", "w", 87], e: ["KeyE", "e", 69], enter: ["Enter", "", 13] };
    const taste = (n, type) =>
        cdp.send("Input.dispatchKeyEvent", {
            type,
            code: T[n][0],
            key: T[n][1] || "Enter",
            windowsVirtualKeyCode: T[n][2],
            text: type === "keyDown" && T[n][1] ? T[n][1] : undefined,
        });
    const tippe = async (n) => (await taste(n, "keyDown"), await taste(n, "keyUp"));
    // die Fristen zählen präsentierte Bilder (je 300 dreht ein Steckender ab), nie die Wanduhr; ein Tor, in das der Gang
    // lief, verlässt er wieder und kehrt um (die Heimkehr verwirft die Tasten: der Rest der Frist geht mit neuem W)
    const bilder = (n, dreh) =>
        page.evaluate(
            async (n, dreh) => {
                const r = window.anazhRealm,
                    st = r.state;
                for (let i = 0, vor = null; i < n; i++) {
                    await new Promise((f) => requestAnimationFrame(f));
                    if (r._portalOverlay) return (r.exitPortal(), (st.yaw += Math.PI), n - i);
                    if (!dreh || i % 300 < 299) continue;
                    const p = st.playerMesh.position;
                    if (vor && Math.hypot(p.x - vor[0], p.z - vor[1]) < 2) st.yaw += 1.7;
                    vor = [p.x, p.z];
                }
                return 0;
            },
            n,
            dreh
        );
    const ruhig = () =>
        page.evaluate(async () => {
            const raf = () => new Promise((f) => requestAnimationFrame(f));
            // eingeschwungen: 120 Bilder in Folge, in denen die Welt nichts offen hat (`_weltOffen`; die Tiere regen sich weiter)
            for (
                let k = 0, weiter = window.__deckel("die Ruhe der Zählung", Infinity);
                k < 120 && weiter();
                k = Object.values(window.anazhRealm._weltOffen()).some(Boolean) ? 0 : k + 1
            )
                await raf();
        });
    const gehe = async (n) => {
        for (let rest = n; rest > 0; await taste("w", "keyUp"))
            (await taste("w", "keyDown"), (rest = await bilder(rest, true)));
    };
    const drittel = Math.round((Number(b.min) || 6) * 1200);
    await page.evaluate(() =>
        window.anazhRealm.state.renderer.setAnimationLoop((t) => window.anazhRealm._gameLoopTick(t))
    );
    await ruhig();
    await bilder(1200);
    // EINE RUNDE ab dem Start: je ein Drittel gehen · fahren (GT, Taste E; der Gang räumt seinen GT) · das Uhr-Wort, dann
    // zurück an den Start und eingeschwungen. Der EINLAUF (halbe Länge, Mittag, danach Mitternacht) füllt, was beim ersten
    // Gebrauch gedeckelt wächst (die Werkbank der Satz-Blöcke, die Spiegel-Felder, die Leiber der Arten, die Ruhe des Foundry-
    // Cache, die Render-Objekte und Werfer des Sonnen-Schattens); die gemessene Runde geht in die Gegenrichtung über unbereiste
    // Welt und wechselt dieselbe Uhr — was mit der bereisten Welt oder je Wechsel wächst, wächst dort weiter.
    const start = await page.evaluate(() => window.anazhRealm.state.playerMesh.position.toArray());
    const sage = async (wort) => {
        await tippe("enter");
        await cdp.send("Input.insertText", { text: "setze uhrzeit " + wort });
        await tippe("enter");
        await bilder(30);
        return page.evaluate(() => window.anazhRealm.state.timeOfDay);
    };
    const runde = async (n, wort) => {
        const t0 = Date.now();
        await gehe(n);
        await page.evaluate(async () => {
            const r = window.anazhRealm,
                p = r.state.playerMesh.position;
            const e = (window.__gangGT = r.spawnArchitecture(
                "fahrzeug_gt",
                { x: p.x + 2, y: r.getTerrainHeightAt(p.x + 2, p.z) + 0.5, z: p.z },
                { silent: true, precise: true }
            ));
            await window.__gebautNach(e, { bau: () => {}, takt: () => new Promise((f) => requestAnimationFrame(f)) });
        });
        await tippe("e");
        await bilder(60);
        const fahrt = await page.evaluate(() => window.anazhRealm.state.player.mountedArch != null);
        await gehe(n);
        if (fahrt) await tippe("e");
        await page.evaluate(() => window.anazhRealm.removeArchitecture(window.__gangGT));
        const uhr = await sage(wort);
        await gehe(n);
        const min = (Date.now() - t0) / 60000;
        await page.evaluate((s) => window.anazhRealm.state.playerMesh.position.fromArray(s), start);
        await ruhig();
        await bilder(1200);
        return { fahrt, uhr, min };
    };
    const ein = await runde(drittel / 2, "mittag");
    const nacht = await sage("mitternacht");
    await bilder(1200);
    await page.evaluate(() => (window.anazhRealm.state.yaw += Math.PI));
    // die Tiere je Erzeuger (`_taeterKlasse`: `tier:<seele>`) neben dem Stand
    const tiere = () =>
        page.evaluate(() => {
            const n = {};
            for (const { userData: u } of window.anazhRealm.state.creatures)
                if (u && u._tierBaum) n["buf:szene:tier:" + (u.soul || "?")] = (n["buf:szene:tier:" + (u.soul || "?")] | 0) + 1;
            return n;
        });
    const vor = Object.assign(await pufferStand(true, 60), { min: 0, tiere: await tiere() });
    const lauf = await runde(drittel, "mittag");
    const nach = Object.assign(await pufferStand(true, 60), { min: lauf.min, tiere: await tiere() });
    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null));
    await cdp.detach();
    const urteil = gangUrteil({ vor, nach });
    if (!(ein.fahrt && lauf.fahrt)) urteil.push("fahrt: die Taste E nahm den GT 2 m neben dem Spieler nicht");
    if (!(nacht < 0.05 || nacht > 0.95) || Math.abs(ein.uhr - 0.5) > 0.05 || Math.abs(lauf.uhr - 0.5) > 0.05)
        urteil.push(
            `uhr: das Spieler-Wort setzte die Uhr auf ${ein.uhr} · ${nacht} · ${lauf.uhr} (Mittag · Mitternacht · Mittag)`
        );
    return { urteil, heapMB: [vor.heapMB, nach.heapMB], vramMB: [vor.vram.mb, nach.vram.mb], min: lauf.min, tiere: [vor.tiere, nach.tiere] };
}

module.exports = {
    gangLauf,
    gangUrteil,
    gangSelbsttest,
    satzInhalt,
    texturErzeuger,
    vramFalte,
    // Die Faltung lebt ab Dokument-Start (der Abgriff bucht schon beim ersten Anlegen): `page.evaluateOnNewDocument`.
    FALTE_INSTALL: `window.__vramFalte = ${vramFalte.toString()};`,
    ZAEHLER_INSTALL:
        `window.__passName = ${passName.toString()};` +
        `window.__satzInhalt = ${satzInhalt.toString()};` +
        `window.__drawZensus = ${drawZensus.toString()};` +
        `window.__pufferZensus = ${pufferZensus.toString()};` +
        `window.__heapHalter = ${heapHalter.toString()};` +
        `window.__kehrausJetzt = ${kehrausJetzt.toString()};` +
        `window.__texturErzeuger = ${texturErzeuger.toString()};` +
        `window.__texturZensus = ${texturZensus.toString()};`,
};
