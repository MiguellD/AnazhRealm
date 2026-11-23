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
    if (camera === st.camera) return "haupt";
    const csm = st.csmNode;
    if (csm?.lights)
        for (let i = 0; i < csm.lights.length; i++)
            if (csm.lights[i].shadow && csm.lights[i].shadow.camera === camera) return "k" + i;
    const dl = st.directionalLight;
    if (dl?.shadow && dl.shadow.camera === camera) return "k0";
    if (scene?.name === "Render Pipeline") return "post";
    return scene?.name || (camera && (camera.name || camera.type)) || "?";
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
        // DIE SICHT (Bild/tiefe): im Hauptbild zeichnet ein Bau-Satz über seine zwei Züge (früh · spät) — je Zug EIN
        // indirekter Zug, dessen Zahl der Compute schreibt; nach dem Frame liest der Zähler je Zug den Auftrag (Dreiecke) und
        // je Haufen sein Ziel (gezeichnet oder nicht) — der Inhalt sind die Zellen der GEZEICHNETEN Haufen (`sichtSpaet`), nie
        // der Abschnitt
        const sichtOf = new Map();
        if (st.chunkSaetze)
            for (const s of st.chunkSaetze.values()) {
                if (s?.mesh && s.spec?.userData?.bauSatz) satzOf.set(s.mesh, s);
                if (s?.sicht) {
                    sichtOf.set(s.sicht.mesh, [s.sicht, s.sicht]);
                    sichtOf.set(s.sicht.spaet.mesh, [s.sicht, s.sicht.spaet]);
                }
            }
        const sichtSpaet = [];
        const inhalt = {};
        const instanzKlasse = (key) => AnazhRealm._instanzKlasse(key);
        // DIE WAHL DER GPU (`_instanzWahlGpu`): die Zahl eines Zugs zählt der Compute — nach dem Frame liest der Zähler sie
        // aus dem Auftrags-Puffer der Arena, die gezeichneten Instanzen aus ihrer Liste (`spaet`), nie die Zahl der Senke
        const spaet = [];
        const roh = rend._renderObjectDirect;
        rend._renderObjectDirect = function (object, material, scene, camera, ...rest) {
            const g = object.geometry;
            const sicht = sichtOf.get(object);
            // EIN INDIREKTER ZUG, DESSEN ZAHL DER ZÄHLER NICHT LIEST (weder Arena noch Sicht), ist ein Täter ohne Namen: die
            // Band-Linse ist ROT bei ihm (bis zur Sicht stand dafür das Wort `IndirectStorageBufferAttribute` in der
            // Rückkehr-Wand) — seine Index-Zahl wäre nie seine Zeichnung
            const fremd = !!(g && g.indirect && object.isGeometrieArena !== true && !sicht);
            const kl0 = fremd ? "UNBENANNT:indirekt " + klasse(object) : klasse(object);
            const pass = passOf(scene, camera);
            const k0 = kl0 + "|" + pass;
            const satz = satzOf.get(object);
            if (sicht) sichtSpaet.push([k0, sicht[0], sicht[1]]);
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
                if (g && !arena && !sicht) {
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
                    } else if (g?.boundingSphere) {
                        const c = g.boundingSphere.center;
                        miss(c.x, c.y, c.z);
                    } else miss(0, 0, 0);
                };
                if (gpu) spaet.push([k, nahe, object, arena.liste, ...arena.wahl.slice(j * 5 + 1, j * 5 + 5)]);
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
                        vertices: g?.attributes?.position ? g.attributes.position.count : 0,
                        instanzen: senke.isInstancedMesh ? senke.count : null,
                        userData: Object.keys(object.userData || {}).slice(0, 8),
                    });
                }
            }
            return roh.call(this, object, material, scene, camera, ...rest);
        };
        const q = rend.backend?.device ? rend.backend.device.queue : null;
        let frameMs = null;
        try {
            __bundlesNeu();
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
        // die Liste ist die der Kamera des Zugs (`_wahlVor`: je Kamera ihre eigene, die Quelle trägt eine Karte) — über die EINE Puffer-Lesung
        const lies = async (a, wer) => new Uint32Array(await window.__pufferLesen(a, "draw-zaehler " + wer));
        for (const [k, nahe, a, liste, erst, , arg, li] of spaet) {
            const ind = await lies(a._ind, "Auftrags-Puffer"); // je Zug: Indizes, Zahl, …, Abschnitt der Liste
            zaehl[k].tris += (ind[arg - 1] / 3) * ind[arg];
            nahe(Array.from((await lies(liste, "Liste des Zugs")).subarray(li, li + ind[arg]), (x) => x - erst));
        }
        // DIE SICHT (Bild/tiefe): die Dreiecke aus dem Auftrag des Zugs, der Inhalt aus den sichtbaren Haufen (ihr Ziel im
        // Sicht-Index; 0xffffffff = verdeckt) — Zelle → Bereich → Instanz-Klasse, ohne Rest
        const dev = rend.backend?.device;
        const roh32 = async (puffer, n) => {
            const groesse = Math.max(4, n * 4);
            const rb = dev.createBuffer({ size: groesse, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
            const e = dev.createCommandEncoder();
            e.copyBufferToBuffer(puffer, 0, rb, 0, groesse);
            dev.queue.submit([e.finish()]);
            await rb.mapAsync(GPUMapMode.READ);
            const aus = new Uint32Array(rb.getMappedRange().slice(0));
            rb.unmap();
            rb.destroy();
            return aus;
        };
        for (const [k, V, Z] of sichtSpaet) {
            const auf = await lies(Z.auftrag, "Auftrag der Sicht");
            zaehl[k].tris += auf[0] / 3;
            const ziel = await roh32(Z.zielPuffer, V.n);
            const tafel = new Uint32Array(V.tafel.buffer);
            const je = inhalt[k] || (inhalt[k] = new Map());
            const gesehen = new Set();
            let summe = 0;
            for (let i = 0; i < V.n; i++) {
                if (ziel[i] === 0xffffffff) continue;
                const z = V.haufenZelle[i];
                const b = z.bereich;
                const kl = instanzKlasse(b.key);
                const e = je.get(kl) || { zellen: 0, tris: 0, eintraege: new Set() };
                if (!gesehen.has(z)) {
                    gesehen.add(z);
                    e.zellen++;
                    const ein = slotEintrag.get(b.key);
                    const id = ein ? ein.get(b.zellen.indexOf(z)) : undefined;
                    if (id != null) e.eintraege.add(id);
                }
                e.tris += tafel[i * 8 + 7] / 3;
                summe += tafel[i * 8 + 7] / 3;
                je.set(kl, e);
            }
            const rest = Math.round(auf[0] / 3 - summe);
            if (rest !== 0) {
                const e = je.get("REST") || { zellen: 0, tris: 0, eintraege: new Set() };
                e.tris += rest;
                je.set("REST", e);
            }
        }
        // Die Studio-Art je Foundry-Klasse (Rezept-`kind`): die Band-Wand ordnet über sie, nie über Art-Namen-Listen.
        const rezepte = r._foundry?.recipes ? r._foundry.recipes : {};
        const artOf = (kl) => {
            const m = /^(f|fimp|fscatter):([^:]+):/.exec(kl);
            const rz = m ? rezepte[m[2]] : null;
            return rz?.kind ? rz.kind : null;
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
                    dMax: w?.inst ? Math.round(w.dMax) : null,
                    ...(v.inhalt ? { inhalt: v.inhalt } : {}),
                };
            });
        // Die Programm-Linse: verschiedene Vertex-/Fragment-Programme und Render-Pipelines. Ein Puffer-Name je
        // Objekt (r184 `NodeBuffer_<id>`) machte jede InstancedMesh zu ihrem eigenen Programm — „familien" zählt
        // die Vertex-Programme ohne Ziffern: liegt `programme.vertex` weit darüber, kompiliert die Welt je Objekt.
        const P = rend._pipelines;
        let programme = null;
        if (P?.programs) {
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
    if (!r || !Number.isFinite(window.__zensusCalls)) return 0;
    st._gpuKehrausT = 0;
    return r._gpuKehraus(window.__zensusCalls, performance.now());
}

function pufferZensus() {
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
        const b = buf.__vramH?.b || buf.size || 0;
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
    const rend = st.renderer;
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
// DER BESTELLER DES JS-HEAPS (aus w28-heap-zensus in die Runde gehoben): `heapHalter` nennt nur die Bytes der Typed Arrays, der
// Behälter-Zensus nur Einträge — was im JS-Heap wächst (Objekte, Closures, die Knoten-Caches des Renderers), blieb ohne Namen
// (Runde reise 18.11.: Heap Runde 2 − Runde 1 +8,3 / +9,3 MB, kein Halter rot). Der Sampling-Heap-Profiler von V8
// (`heapStichprobe`, ab der Start-Lesung der Runde) trägt die NOCH LEBENDEN Bytes je Allokations-Stelle; gebucht zweimal: `stelle`
// die Funktion der Allokation (oft vendor/three), `besteller` der nächste Rahmen des SPIELS darüber (nicht vendor/, nicht nativ) —
// je Funktion · Datei:Zeile ihres Anfangs (der Profiler nennt nur ihn). → { besteller, stelle } je [[Name, MB]] absteigend
const STICH = { intervall: 32768, abMB: 0.05 };
function heapBesteller(profile) {
    const fremd = (u) => !u || /\/vendor\/|\/node_modules\/|^(chrome|devtools|extensions)::?/.test(u);
    const ort = (cf) => {
        let p = cf.url || "";
        try {
            p = new URL(p).pathname.replace(/^\//, "");
        } catch {}
        return `${cf.functionName || "(anonym)"} · ${p ? p + ":" + (cf.lineNumber + 1) : "(nativ)"}`;
    };
    const [stelle, besteller] = [new Map(), new Map()];
    const buche = (m, k, n) => m.set(k, (m.get(k) || 0) + n);
    // iterativ (die Stapel des Spiels sind tief): je Knoten der nächste Spiel-Rahmen von oben her
    const stapel = [[profile.head, null]];
    while (stapel.length) {
        const [k, sp] = stapel.pop();
        const eigen = fremd(k.callFrame.url) ? sp : k.callFrame;
        if (k.selfSize > 0) {
            buche(stelle, ort(k.callFrame), k.selfSize);
            buche(besteller, ort(eigen || k.callFrame), k.selfSize);
        }
        for (const c of k.children || []) stapel.push([c, eigen]);
    }
    const reihe = (m) =>
        [...m]
            .map(([k, b]) => [k, +(b / 1048576).toFixed(2)])
            .filter(([, x]) => x >= STICH.abMB)
            .sort((p, q) => q[1] - p[1]);
    return { besteller: reihe(besteller), stelle: reihe(stelle) };
}
// die Stichprobe an EINER offenen CDP-Sitzung: "an" (nach den GC der Start-Lesung) setzt das Sampling neu auf — ein laufendes
// endet zuerst (`stopSampling` wirft, wenn keines läuft); "lies" nennt die seither lebenden Bytes beim Besteller
async function heapStichprobe(cdp, modus) {
    if (modus === "lies") return heapBesteller((await cdp.send("HeapProfiler.getSamplingProfile")).profile);
    if (modus !== "an") throw new Error(`heapStichprobe: Modus ${modus} (an | lies)`);
    await cdp.send("HeapProfiler.enable");
    await cdp.send("HeapProfiler.stopSampling").catch(() => null);
    await cdp.send("HeapProfiler.startSampling", { samplingInterval: STICH.intervall });
    return { besteller: [], stelle: [] };
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
    const drift =
        nach.vram.mb - vor.vram.mb - [...new Set([...vm.keys(), ...nm.keys()])].reduce((s, k) => s + bestand(k), 0);
    if (drift > GANG.vramMB)
        f.push(
            "vram: +" +
                drift.toFixed(1) +
                " MB zurück am Start — " +
                wuchs(
                    vg(vor),
                    [...nm].map(([k, x]) => [k, x - bestand(k)])
                )
        );
    for (const [k, x] of Object.entries(nach.puffer?.halter || {}))
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
                vram: {
                    mb: a + w,
                    liste: [
                        { k: "buf:a", mb: a },
                        { k: "buf:szene:tier:wolf", mb: w },
                    ],
                },
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

// DER WEG (Preis des Orts, Schnitt 2 „der Speicher folgt dem Blick“): EINE Sitzung fährt Posen und kehrt zur ersten zurück
// (Wiese · Wiese-Ost · Dorf · West · Wiese, je Pose nach zwei GC: `heapMB`, die Typed-Halter `halter` [Pfad, MB], `min` seit
// der vorigen). Was ein Leser im Blick oder in Reichweite liest, lebt; was mit dem Weg wächst, ist ROT beim Pfad seines Halters:
// der Preis je Pose (≤ 400 MB), die Ratsche je Pose (`spec/profiband/weg-*.json`, fällt nur nach unten) und der Zuwachs von der
// ersten Pose bis zur Rückkehr an dieselbe Pose je Minute der Fahrt (≤ 5, die Preis-Treppe).
const WEG = { heapMB: 400, heapMBjeMin: 5 };
function wegUrteil(posen, ratsche) {
    const f = [];
    const soll = new Map(((ratsche && ratsche.posen) || []).map((p) => [p.pose, p.heapMB]));
    const tol = (ratsche && ratsche.toleranzMB) || 0;
    for (const p of posen) {
        if (p.heapMB > WEG.heapMB) f.push(`${p.pose}: Heap ${p.heapMB.toFixed(1)} MB > ${WEG.heapMB} (Preis)`);
        const s = soll.get(p.pose);
        if (s != null && p.heapMB > s + tol)
            f.push(`${p.pose}: Heap ${p.heapMB.toFixed(1)} MB über der Ratsche ${s} + ${tol}`);
    }
    const [a, z] = [posen[0], posen[posen.length - 1]];
    const rueck = z.heapMB - a.heapMB;
    const min = posen.slice(1).reduce((s, p) => s + (p.min || 0), 0);
    const m = new Map(a.halter || []);
    const halter =
        (z.halter || [])
            .map(([k, x]) => [k, x - (m.get(k) || 0)])
            .filter(([, x]) => x >= 1)
            .sort((p, q) => q[1] - p[1])
            .slice(0, 3)
            .map(([k, x]) => k + " +" + x.toFixed(1) + " MB")
            .join(" · ") || "—";
    if (min > 0 && rueck / min > WEG.heapMBjeMin)
        f.push(
            `rückkehr: ${z.pose} +${rueck.toFixed(1)} MB über ${a.pose} in ${min.toFixed(1)} min = ${(rueck / min).toFixed(1)} MB/min > ` +
                `${WEG.heapMBjeMin} — Halter: ${halter}`
        );
    return f;
}
// Selbsttest: je Naht ein Mutant — das Render-Objekt am Stoff nach seiner Geometrie (N1), die Saat, die ihren Chunk überlebt
// (N2), der Bauer nach seinem Stand (N3) — ist ROT beim Pfad seines Halters; derselbe Weg mit Räumung ist GRÜN.
function wegSelbsttest() {
    const fahrt = (mutant) => {
        const r = { state: { ring: new Map(), renderObjekte: [], architectures: [] }, renderer: { bauer: [] } };
        const halter = { N1: r.state.renderObjekte, N2: r.state.architectures, N3: r.renderer.bauer };
        const posen = [];
        for (let i = 0; i < 5; i++) {
            // der Ring folgt dem Blick (zwei Einträge), die drei Nähte tragen je Pose 8 MB
            r.state.ring.set(i, new Float32Array(262144));
            if (r.state.ring.size > 2) r.state.ring.delete(r.state.ring.keys().next().value);
            for (const [n, liste] of Object.entries(halter)) {
                liste.push(new Float32Array(2097152));
                if (n !== mutant) liste.splice(0, liste.length - 1);
            }
            const h = heapHalter(r, 3).map(([k, b]) => [k, b / 1048576]);
            posen.push({ pose: "p" + i, heapMB: 300 + h.reduce((s, [, x]) => s + x, 0), halter: h, min: i ? 1 : 0 });
        }
        return wegUrteil(posen, null).join(" | ");
    };
    const f = [];
    if (fahrt(null)) f.push("der geräumte Weg ist rot: " + fahrt(null));
    for (const [n, p] of [
        ["N1", "r.state.renderObjekte"],
        ["N2", "r.state.architectures"],
        ["N3", "r.renderer.bauer"],
    ]) {
        const u = fahrt(n);
        if (!/rückkehr: /.test(u) || !u.includes(p + " +"))
            f.push(`der Mutant ${n} ist nicht rot beim Pfad ${p}: ${u || "GRÜN"}`);
    }
    return f;
}

// DER RUNDEN-ZENSUS (Preis des Orts, Schnitt 2 „der Speicher folgt dem Blick“; `werkbank runde`): dieselbe Runde zweimal, nach
// jeder an der START-Pose zwei GC — was zwischen Runde 1 und Runde 2 entstand und an der Start-Pose noch lebt, ist das Leck (die
// Drei-Schnappschuss-Methode). Der Zensus zählt JEDE Map/Set/Array am Stamm und an `state` bis Tiefe 2 (schlichte Objekte),
// ein Behälter, den mehrere Namen halten, steht unter dem ersten.
function behaelterZensus(r) {
    const aus = {};
    const groesse = (v) => (v instanceof Map || v instanceof Set ? v.size : Array.isArray(v) ? v.length : null);
    const schlicht = (v) => [Object.prototype, null].includes(Object.getPrototypeOf(v)) && !Array.isArray(v);
    const gesehen = new WeakSet([r.state]);
    const geh = (o, p, tiefe) => {
        for (const k of Object.keys(o)) {
            let v;
            try {
                v = o[k];
            } catch {
                continue;
            }
            if (!v || typeof v !== "object" || gesehen.has(v)) continue;
            gesehen.add(v);
            const g = groesse(v);
            if (g != null) aus[p + "." + k] = g;
            else if (tiefe > 1 && schlicht(v)) geh(v, p + "." + k, tiefe - 1);
        }
    };
    geh(r, "r", 2);
    geh(r.state, "r.state", 2);
    return aus;
}
// DER ZELL-ZENSUS (w28-halter-register; `werkbank runde`): je Gedächtnis der EINEN Tafel (`AnazhRealm.ZELL_GEDAECHTNISSE`) die
// Einträge und die außerhalb des Blicks — eine Zelle, von der kein Teil im Saum (Ring + 2 Chunks um den Spieler) und keiner in der
// Reichweite ihrer Leser liegt; ein Gedächtnis des Rings „boden“ außerhalb Ring + 1, dessen Chunk nicht steht. Gezählt unabhängig vom
// Räumer (die Linse rechnet die Lage selbst). Daneben jeder Behälter mit Zell-Schlüssel („[schicht:]i,j“, auch „o12,3“), der in
// keiner Tafel steht: unangemeldet. `A` die Klasse (die Seite: `AnazhRealm`). → { je: [{ name, n, aussen, bestand }], unangemeldet }
function zellZensus(r, A) {
    A = A || (typeof AnazhRealm !== "undefined" ? AnazhRealm : {});
    const st = r.state;
    const { span, ringRadius: R } = r._voxelChunkConfig(0);
    const p = st.playerMesh.position;
    const [pcx, pcz] = [Math.floor(p.x / span), Math.floor(p.z / span)];
    const lage = (k) => {
        const m = typeof k === "string" && /^(?:([^:,]*):)?(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/.exec(k);
        return m ? [+m[2], +m[3], m[1] || ""] : null;
    };
    const je = [];
    const angemeldet = new Set();
    (A.ZELL_GEDAECHTNISSE || []).forEach((E, i) => {
        const karte = E.karte(r);
        if (karte) angemeldet.add(karte);
        // ein Gedächtnis mit eigener Schranke, das `zaehlen` trägt (ein Halter der Zeichnung), zählt wie ein räumbares
        const o = { name: E.name || "#" + i, n: karte ? karte.size : 0, aussen: 0, bestand: E.bestand || (!E.zaehlen && E.schranke) || null }; // prettier-ignore
        je.push(o);
        if (!karte || !karte.size || o.bestand) return;
        const rw = E.reichweite ? E.reichweite(r) : 0;
        for (const k of karte instanceof Map ? karte.keys() : karte) {
            const ij = E.lage ? E.lage(k) : lage(k);
            if (!ij) continue;
            const Z = typeof E.zelle === "function" ? E.zelle(r, ij[2]) : E.zelle;
            const [m, ab] = typeof Z === "number" ? [Z, 0] : [Z.m, Z.ab];
            const [x0, z0] = [ij[0] * m + ab, ij[1] * m + ab];
            const [c0, c1, d0, d1] = [Math.floor(x0 / span), Math.ceil((x0 + m) / span) - 1, Math.floor(z0 / span), Math.ceil((z0 + m) / span) - 1]; // prettier-ignore
            let drin;
            if (E.ring === "boden") {
                const [mx, mz] = [Math.floor((x0 + m / 2) / span), Math.floor((z0 + m / 2) / span)];
                drin = (Math.abs(mx - pcx) <= R + 1 && Math.abs(mz - pcz) <= R + 1) || !!(st.voxelChunks && st.voxelChunks.has(mx + "," + mz)); // prettier-ignore
            } else
                drin =
                    (c0 <= pcx + R + 2 && c1 >= pcx - R - 2 && d0 <= pcz + R + 2 && d1 >= pcz - R - 2) ||
                    (rw > 0 && x0 <= p.x + rw && x0 + m >= p.x - rw && z0 <= p.z + rw && z0 + m >= p.z - rw);
            if (!drin && !(E.lebt && E.lebt(r, karte instanceof Map ? karte.get(k) : k))) o.aussen++;
        }
    });
    const unangemeldet = {};
    const gesehen = new WeakSet([st]);
    const geh = (o, pfad, tiefe) => {
        for (const k of Object.keys(o)) {
            let v;
            try {
                v = o[k];
            } catch {
                continue;
            }
            if (!v || typeof v !== "object" || gesehen.has(v)) continue;
            gesehen.add(v);
            if (v instanceof Map || v instanceof Set) {
                if (angemeldet.has(v) || !v.size) continue;
                const k0 = v.keys().next().value;
                if (lage(k0)) unangemeldet[pfad + "." + k] = v.size;
            } else if (tiefe > 1 && !Array.isArray(v) && [Object.prototype, null].includes(Object.getPrototypeOf(v)))
                geh(v, pfad + "." + k, tiefe - 1);
        }
    };
    geh(r, "r", 2);
    geh(st, "r.state", 2);
    return { je, unangemeldet };
}
// DER RENDER-OBJEKT-ZENSUS (w28-halter-register): je Objekt der Szene seine Render-Objekte (`__renderObjekte`, das Register der
// Klasse), die eine andere Geometrie tragen als das Objekt oder Attribute, die seine Geometrie nicht mehr trägt — ein Pass, der
// das Objekt nach einem Tausch nicht mehr zeichnete, hielt die alten Puffer (`_renderObjekteFolgen`). Instanz- und verschränkte
// Attribute gehören dem Knoten, nicht der Geometrie. → { fremd, alt, mb }
function renderObjektZensus(r) {
    let fremd = 0,
        alt = 0,
        b = 0;
    const seen = new Set();
    r.state.scene.traverse((o) => {
        const l = o.__renderObjekte;
        if (!l || !l.length) return;
        const g = o.geometry;
        const jetzt = new Set(g ? Object.values(g.attributes || {}) : []);
        if (g && g.index) jetzt.add(g.index);
        for (const ro of l) {
            if (ro.geometry !== g) fremd++;
            else if ((ro.attributes || []).some((a) => !jetzt.has(a) && !a.isInstancedBufferAttribute && !a.isInterleavedBufferAttribute)) alt++; // prettier-ignore
            else continue;
            for (const a of ro.attributes || Object.values(ro.geometry.attributes || {}))
                if (a && a.array && !jetzt.has(a) && !seen.has(a)) (seen.add(a), (b += a.array.byteLength));
        }
    });
    return { fremd, alt, mb: +(b / 1048576).toFixed(2) };
}
// DIE GEBURT DER GEOMETRIEN: r184 zählt `info.memory.geometries` beim ersten Zeichnen einer Geometrie (`Geometries.initGeometry`)
// und zieht erst bei ihrem `dispose` ab — eine Geometrie, die keiner entsorgt, zählt (und hält ihre Attribute in
// `info.memoryMap`, Lehre 27), auch wenn der GC sie nahm. Die Linse merkt je Geometrie die oberste Stamm-Zeile ihres Stapels
// (beim ersten `setAttribute`/`setIndex` — jeder Bau, jeder Klon) und zählt je Geburts-Stelle: gezählt (im Zähler des
// Renderers), davon lebend und verwaist (der GC nahm sie, `dispose` nie), geboren, entsorgt. Fehlt die Naht im Vendor, wirft sie.
function geburtLinse(T, renderer) {
    if (window.__geburt) return window.__geburt.schluessel.size;
    const geo = renderer && renderer._geometries;
    if (!geo || typeof geo.initGeometry !== "function")
        throw new Error("geburtLinse: renderer._geometries.initGeometry fehlt (r184-Naht verschoben)");
    const G = (window.__geburt = { von: new WeakMap(), schluessel: new Map() });
    const stelle = () => {
        const alt = Error.stackTraceLimit;
        Error.stackTraceLimit = 40;
        const s = new Error().stack || "";
        Error.stackTraceLimit = alt;
        const m = /(stamm\/[\w-]+\.js)(?:\?[^:\s)]*)?:(\d+)/.exec(s);
        return m ? m[1] + ":" + m[2] : "ohne Stamm";
    };
    const P = T.BufferGeometry.prototype;
    for (const n of ["setAttribute", "setIndex"]) {
        const f = P[n];
        P[n] = function (...a) {
            if (!G.von.has(this)) G.von.set(this, stelle());
            return f.apply(this, a);
        };
    }
    const init = geo.initGeometry;
    geo.initGeometry = function (ro) {
        const g = ro.geometry;
        const k = G.von.get(g) || "vor der Linse";
        let e = G.schluessel.get(k);
        if (!e) G.schluessel.set(k, (e = { geboren: 0, entsorgt: 0, refs: new Set() }));
        e.geboren++;
        const ref = new WeakRef(g);
        e.refs.add(ref);
        const weg = () => {
            e.entsorgt++;
            e.refs.delete(ref);
            g.removeEventListener("dispose", weg);
        };
        g.addEventListener("dispose", weg);
        return init.call(this, ro);
    };
    return 0;
}
function geburtZensus() {
    const aus = {};
    for (const [k, e] of window.__geburt.schluessel) {
        let lebend = 0;
        for (const ref of e.refs) if (ref.deref()) lebend++;
        aus[k] = { gezaehlt: e.refs.size, lebend, verwaist: e.refs.size - lebend, geboren: e.geboren, entsorgt: e.entsorgt };
    }
    return aus;
}
// DAS URTEIL EINER RUNDE: `stand` = [Start, nach Runde 1, nach Runde 2] an derselben Pose, je { heapMB, geometries, zensus,
// geburt, bildMax, halter }. ROT: Heap Runde 2 − Runde 1 > 5 MB · die Geometrien des Renderers wachsen (beim Namen ihrer Geburts-Stelle) ·
// ein Typed-Halter (`heapHalter`, Pfad Tiefe 3) wächst um ≥ 1 MB (wenige schwere Einträge, die Hydro-Kachel: 1 MB je Eintrag) ·
// ein Behälter wächst von Runde 1 zu Runde 2 (beim Namen und der Zeile seiner Anlage, `anlage(pfad)`) · ein Bild der Runde über
// 101 ms. Die Tafel trägt jeden Wachser mit Start → Runde 1 → Runde 2.
const RUNDE = { heapMB: 5, bildMs: 101, wachsMin: 16, wachsAnteil: 0.05, halterMB: 1, blickMB: 4 };
// WAS MIT DEM WEG WÄCHST, WÄCHST IN JEDER RUNDE (w28-halter-register): ein Behälter oder Halter ist rot, wenn er in BEIDEN Runden um
// die Schwelle wächst (`schwelle(vorher)`, Start → Runde 1 und Runde 1 → Runde 2) — jede Runde fährt neue Orte, der Sack wächst
// je Ort. Ein Halter, der über die Runde sinkt oder schwankt, ist nie rot: zwei Läufe am selben Stamm (Radeon 18.11., d7f31d1a und
// 99421fca, Stamm byte-gleich) nannten `_foundry.cache` 16,4 → 3,2 → 4,4 MB, `renderer.info.memoryMap` 22,5 → 20,8 → 23,4 MB und
// `_teilVolumenMemo` 1 600 → 1 680 → 1 918 einmal rot, einmal nicht — bis hier urteilte allein Runde 1 → Runde 2.
const RUNDE_WACHS = { wachsend: ([s, a, b], schwelle) => a - s >= schwelle(s) && b - a >= schwelle(a) };
// DER BLICK IST VERLASSEN (heap-blick-folgt, „der Speicher folgt dem Blick“): eine Runde mit `blick` startet an einem Ort, den
// noch nichts Fremdes sah (Wiese frisch), fährt in einen anderen Blick (die Stadt) und kehrt zurück — kein Halter trägt danach mehr
// als frisch: was die Stadt in ihm ließ, überlebte den Blick seiner Leser. ROT je Halter (`heapHalter`, Pfad) mit frisch → nach der
// Runde in MB, ab `RUNDE.blickMB` (über dem Wackeln zweier Läufe am selben Stamm, 18.11.: `_foundry.cache` ±3,2 MB). Befund vor dem
// Schnitt (Radeon, Wiese nach der Stadt 436,2 MB): `_bewohnerNah[]` 22,3 MB, `_foundry.cache` 68,1 MB.
function blickUrteil(name, [s, a, b]) {
    const mb = (x, k) => new Map(x.halter || []).get(k) || 0;
    const f = [];
    for (const x of [a, b].filter(Boolean))
        for (const [k] of x.halter || []) {
            const d = mb(x, k) - mb(s, k);
            if (d >= RUNDE.blickMB && !f.some((z) => z.includes(" " + k + " ")))
                f.push(`${name}: Halter ${k} überlebt den Blick — frisch ${mb(s, k).toFixed(1)} → nach der Runde ${mb(x, k).toFixed(1)} MB (+${d.toFixed(1)})`); // prettier-ignore
        }
    return f;
}
function rundenUrteil({ name, stand, blick }, anlage) {
    const [s, a, b] = stand;
    const f = blick ? blickUrteil(name, stand) : [];
    const dh = b.heapMB - a.heapMB;
    if (dh > RUNDE.heapMB) f.push(`${name}: Heap Runde 2 − Runde 1 = +${dh.toFixed(1)} MB > ${RUNDE.heapMB}`);
    const tafel = Object.entries(b.zensus)
        .map(([k, n2]) => ({ name: k, start: s.zensus[k] || 0, r1: a.zensus[k] || 0, r2: n2 }))
        .filter((t) => RUNDE_WACHS.wachsend([t.start, t.r1, t.r2], (v) => Math.max(RUNDE.wachsMin, v * RUNDE.wachsAnteil)))
        .sort((p, q) => q.r2 - q.r1 - (p.r2 - p.r1));
    const un = (b.zell && b.zell.unangemeldet) || {};
    for (const t of tafel) {
        t.anlage = anlage(t.name);
        f.push(`${name}: ${t.name} (${t.anlage}${t.name in un ? ", unangemeldet" : ""}) ${t.start} → ${t.r1} → ${t.r2}`);
    }
    // das Register (`zellZensus`): nach der Runde liegt kein Eintrag eines räumbaren Zell-Gedächtnisses außerhalb des Blicks
    for (const z of (b.zell && b.zell.je) || [])
        if (!z.bestand && z.aussen > 0)
            f.push(`${name}: Zell-Gedächtnis ${z.name} hält ${z.aussen} von ${z.n} Einträgen außerhalb des Blicks (Soll 0)`);
    // die Render-Objekte (`renderObjektZensus`): keines hält nach der Runde getauschte Puffer
    if (b.ro && b.ro.fremd + b.ro.alt > 0)
        f.push(`${name}: ${b.ro.fremd + b.ro.alt} Render-Objekte halten getauschte Puffer (fremde Geometrie ${b.ro.fremd}, alte Attribute ${b.ro.alt}, ${b.ro.mb} MB; Soll 0, \`_renderObjekteFolgen\`)`); // prettier-ignore
    const mb = (x, k) => new Map(x.halter || []).get(k) || 0;
    for (const [k, x] of b.halter || [])
        if (RUNDE_WACHS.wachsend([mb(s, k), mb(a, k), x], () => RUNDE.halterMB))
            f.push(`${name}: Halter ${k} (${anlage(k)}) ${mb(s, k).toFixed(1)} → ${mb(a, k).toFixed(1)} → ${x.toFixed(1)} MB`);
    if (b.geometries > a.geometries) {
        const g = Object.entries(b.geburt)
            .map(([k, e]) => [k, e.gezaehlt - ((a.geburt[k] && a.geburt[k].gezaehlt) || 0), e])
            .filter(([, d]) => d > 0)
            .sort((p, q) => q[1] - p[1])
            .slice(0, 5)
            .map(([k, d, e]) => `${k} +${d} (lebend ${e.lebend}, verwaist ${e.verwaist})`);
        f.push(`${name}: geometries ${s.geometries} → ${a.geometries} → ${b.geometries} — Geburt: ${g.join(" · ") || "?"}`);
    }
    [a, b].forEach((x, i) => {
        if (x.bildMax > RUNDE.bildMs) f.push(`${name}: größtes Bild der Runde ${i + 1} ${x.bildMax.toFixed(1)} ms > ${RUNDE.bildMs}`);
    });
    f.push(...jsHeapUrteil(name, stand, dh));
    return { f, tafel };
}
// DER JS-HEAP BEIM NAMEN (`heapBesteller`, je Stand `besteller` und `stelle`): wer in Runde 1 UND Runde 2 je ≥ 1 MB lebende Bytes
// zulegt, ist rot — der Besteller im Spiel, dazu die Stelle der Allokation, wo sie nicht derselbe Rahmen ist. Wächst der Heap über
// die Schranke, ohne dass einer die Schwelle reißt, nennt EINE Zeile die fünf größten Zuwächse (verstreut).
function jsHeapUrteil(name, [s, a, b], dh) {
    const f = [];
    if (!b.besteller) return f;
    const mb = (x, sicht, k) => new Map(x[sicht] || []).get(k) || 0;
    const benannt = new Set();
    for (const sicht of ["besteller", "stelle"])
        for (const [k, x] of b[sicht] || []) {
            // in BEIDEN Runden um die Schwelle — dasselbe EINE Wachs-Urteil wie Behälter und Halter (`RUNDE_WACHS`), kein Zwilling
            if (benannt.has(k) || !RUNDE_WACHS.wachsend([mb(s, sicht, k), mb(a, sicht, k), x], () => RUNDE.halterMB)) continue; // prettier-ignore
            benannt.add(k);
            f.push(`${name}: JS-Heap ${sicht === "besteller" ? "beim Besteller" : "an der Stelle"} ${k} ${mb(s, sicht, k).toFixed(1)} → ${mb(a, sicht, k).toFixed(1)} → ${x.toFixed(1)} MB`); // prettier-ignore
        }
    if (dh > RUNDE.heapMB && !benannt.size) {
        const d = b.besteller
            .map(([k, x]) => [k, x - mb(a, "besteller", k)])
            .filter(([, x]) => x > 0)
            .sort((p, q) => q[1] - p[1])
            .slice(0, 5);
        f.push(`${name}: der Zuwachs verstreut — Besteller ${d.map(([k, x]) => `${k} +${x.toFixed(2)}`).join(" · ") || "keiner gesampelt"} MB`); // prettier-ignore
    }
    return f;
}
// Selbsttest: ein Leib, der je Runde 1,5 MB lebende Bytes bestellt (über `clone` in vendor/three), ist rot beim Besteller samt
// Datei:Zeile und bei der Stelle; derselbe Leib ohne Zuwachs und ein Cache, der in Runde 1 voll lief, sind grün; ein Heap, der +6 MB in Splittern
// unter der Schwelle wächst, nennt die Splitter beim Besteller.
function jsHeapSelbsttest() {
    const cf = (functionName, url, lineNumber) => ({ functionName, url, lineNumber });
    const M = 1048576;
    const profil = (leib, cache, splitter) => ({
        head: {
            callFrame: cf("(root)", "", 0),
            selfSize: 0,
            children: [
                {
                    callFrame: cf("_bewohnerLeib", "http://h/stamm/koerper-leib.js?v=1", 147),
                    selfSize: 0.5 * M,
                    children: [{ callFrame: cf("clone", "http://h/vendor/three.module.js", 9), selfSize: leib * M, children: [] }],
                },
                { callFrame: cf("_bauBuch", "http://h/stamm/stoff-material.js", 40), selfSize: cache * M, children: [] },
                ...Array.from({ length: 12 }, (_, i) => ({ callFrame: cf("splitter" + i, "http://h/stamm/x.js", i), selfSize: splitter * M, children: [] })), // prettier-ignore
            ],
        },
    });
    // die Start-Lesung trägt nichts (das Sampling beginnt dort, `heapStichprobe` "an"); der Cache füllt sich in Runde 1 und legt in
    // Runde 2 unter der Schwelle zu, der Leib bleibt im Gleichstand bei 0,5 MB oder wächst je Runde um `leib`
    const fahrt = (leib, splitter) => {
        const stand = [{ besteller: [], stelle: [] }, ...[1, 2].map((r) => heapBesteller(profil(leib * r, [0, 3, 3.4][r], splitter * r)))]; // prettier-ignore
        return jsHeapUrteil("a", stand, splitter ? 6 : 0).join(" | ");
    };
    const f = [];
    if (fahrt(0, 0)) f.push("die ruhende Runde ist rot: " + fahrt(0, 0));
    const rot = fahrt(1.5, 0);
    if (!/JS-Heap beim Besteller _bewohnerLeib · stamm\/koerper-leib\.js:148 0\.0 → 2\.0 → 3\.5 MB/.test(rot))
        f.push("der wachsende Leib ist nicht rot beim Besteller: " + (rot || "GRÜN"));
    if (!/JS-Heap an der Stelle clone · vendor\/three\.module\.js:10 0\.0 → 1\.5 → 3\.0 MB/.test(rot))
        f.push("die Stelle des wachsenden Leibs ist nicht rot: " + (rot || "GRÜN"));
    if (/_bauBuch/.test(rot)) f.push("der sinkende Cache ist rot: " + rot);
    if (!/der Zuwachs verstreut — Besteller splitter\d+ · stamm\/x\.js:\d+ \+0\.50/.test(fahrt(0, 0.5)))
        f.push("der verstreute Zuwachs nennt keinen Besteller: " + (fahrt(0, 0.5) || "GRÜN"));
    return f;
}
// Selbsttest: eine Welt mit Ring (folgt dem Blick), einem Zell-Gedächtnis, das jede Runde neue Schlüssel legt (die Zeit im
// Schlüssel, Klasse F2/F3), und einer Geometrie, die je Runde neu gebaut und nie entsorgt wird (F7) — ROT beim Namen des
// Gedächtnisses samt Anlage und bei der Geburts-Stelle; dieselbe Welt mit Räumung nach Abstand ist GRÜN.
function rundenSelbsttest() {
    const fahrt = (mutant) => {
        const r = { state: { ring: new Map(), memo: new Map(), kacheln: new Map(), zmemo: new Map(), playerMesh: { position: { x: 5, z: 5 } } }, _tritt: new Map() }; // prettier-ignore
        r._voxelChunkConfig = () => ({ span: 10, ringRadius: 1 });
        // das Register (`zellZensus`): ein angemeldetes Zell-Gedächtnis (10-m-Zellen, Saum ±3 Chunks) und, im Mutanten, ein
        // ferner Eintrag darin und ein unangemeldetes, das je Runde wächst
        // dazu ein Halter der Zeichnung (`schranke` + `zaehlen`): Körper an ihrer Lage, ein ferner, der zeichnet (`lebt`), steht im
        // Blick; im Mutanten einer fern, der nicht zeichnet
        const leib = { name: "leib", karte: (w) => w.state.leib, zelle: 1, lage: (o) => [o.x, o.z], lebt: (w, o) => o.lebt, schranke: "s", zaehlen: true }; // prettier-ignore
        const A = { ZELL_GEDAECHTNISSE: [{ name: "zmemo", karte: (w) => w.state.zmemo, zelle: 10 }, leib] };
        r.state.leib = new Set([{ x: 5, z: 5 }, { x: 900, z: 0, lebt: true }]);
        if (mutant) r.state.leib.add({ x: -900, z: 0 });
        if (mutant) r._wild = new Map();
        let geom = 10;
        const geburt = {};
        const stand = [];
        for (let runde = 0; runde < 3; runde++) {
            for (let zelle = 0; zelle < 40; zelle++) {
                r.state.ring.set(zelle, 1);
                if (r.state.ring.size > 9) r.state.ring.delete(r.state.ring.keys().next().value);
                r._tritt.set(zelle + ":" + (mutant ? runde : 0), 1);
                r.state.memo.set(zelle, 1);
                r.state.zmemo.set((zelle % 7) - 3 + "," + (mutant && zelle === 39 ? 50 : 0), 1);
                if (mutant) r._wild.set(runde * 40 + zelle + ",0", 1);
                if (!mutant && Math.abs(zelle - 39) > 4) (r._tritt.delete(zelle + ":0"), r.state.memo.delete(zelle));
            }
            // die Kachel der Fernreise (1 MB je Eintrag, zwei je Runde): geräumt bleibt die am Start
            for (const k of [runde * 2, runde * 2 + 1]) r.state.kacheln.set(k, new Float32Array(262144));
            if (!mutant) for (const k of r.state.kacheln.keys()) if (k > 0) r.state.kacheln.delete(k);
            // ein Halter und ein Behälter, die über die Runde sinken und in Runde 2 wieder steigen (der Cache des Buchs, die Karte
            // des Renderers): nie rot, in keiner Fahrt
            r.state.sinkt = new Map(Array.from({ length: [100, 20, 60][runde] }, (_, i) => [i, 1]));
            r.state.sinktPuffer = new Float32Array([4, 1, 2.5][runde] * 262144);
            if (mutant && runde) geburt["stamm/gelaende-fern.js:741"] = { gezaehlt: 8 * runde, lebend: 8 * runde, verwaist: 0 };
            geom = 10 + (mutant ? 8 * runde : 0);
            const halter = heapHalter(r, 3).map(([k, x]) => [k, x / 1048576]);
            const zell = zellZensus(r, A);
            const ro = { fremd: mutant && runde === 2 ? 1 : 0, alt: 0, mb: 0.5 }; // im Mutanten hält ein Pass die alte Geometrie
            stand.push({ heapMB: 300, geometries: geom, zensus: behaelterZensus(r), zell, geburt: { ...geburt }, bildMax: 40, halter, ro }); // prettier-ignore
        }
        return rundenUrteil({ name: "a", stand }, (k) => (k === "r._tritt" ? "stamm/siedlung-wege.js:1014" : "?")).f.join(" | ");
    };
    const f = [];
    const gruen = fahrt(false);
    if (gruen) f.push("die geräumte Runde ist rot: " + gruen);
    const rot = fahrt(true);
    if (!/r\._tritt \(stamm\/siedlung-wege\.js:1014\) 40 → 80 → 120/.test(rot) || !/geometries 10 → 18 → 26 — Geburt: stamm\/gelaende-fern\.js:741 \+8/.test(rot) || !/Halter r\.state\.kacheln \(\?\) 2\.0 → 4\.0 → 6\.0 MB/.test(rot))
        f.push("der Mutant ist nicht rot beim Namen: " + (rot || "GRÜN"));
    if (!/Zell-Gedächtnis zmemo hält 1 von \d+ Einträgen außerhalb des Blicks/.test(rot) || !/r\._wild \(\?, unangemeldet\) 40 → 80 → 120/.test(rot))
        f.push("der Mutant des Registers ist nicht rot beim Namen: " + (rot || "GRÜN"));
    if (!/Zell-Gedächtnis leib hält 1 von 3 Einträgen außerhalb des Blicks/.test(rot))
        f.push("der Mutant des Halters der Zeichnung ist nicht rot beim Namen: " + (rot || "GRÜN"));
    if (!/1 Render-Objekte halten getauschte Puffer \(fremde Geometrie 1/.test(rot))
        f.push("der Mutant der Render-Objekte ist nicht rot: " + (rot || "GRÜN"));
    if (/sinkt/.test(rot)) f.push("ein sinkender Halter ist rot: " + rot);
    const alt = RUNDE_WACHS.wachsend;
    RUNDE_WACHS.wachsend = ([, a, b], schwelle) => b - a >= schwelle(a); // der Mutant: das Urteil allein über Runde 1 → Runde 2
    const einSchritt = fahrt(false);
    // der JS-Heap urteilt am selben Wachs-Urteil: ein Besteller, der erst in Runde 2 zulegt, ist nur im Mutanten rot
    const spaet = () => jsHeapUrteil("j", [{ besteller: [] }, { besteller: [] }, { besteller: [["spaet · stamm/y.js:1", 1.5]] }], 0).join(" | "); // prettier-ignore
    const heapEin = spaet();
    RUNDE_WACHS.wachsend = alt;
    if (!/Halter r\.state\.sinktPuffer/.test(einSchritt) || !/r\.state\.sinkt /.test(einSchritt))
        f.push("der Mutant des Ein-Schritt-Urteils nennt die sinkenden Halter nicht: " + (einSchritt || "GRÜN"));
    if (!/JS-Heap beim Besteller spaet/.test(heapEin) || spaet())
        f.push("der JS-Heap urteilt nicht am EINEN Wachs-Urteil: Mutant " + (heapEin || "GRÜN") + " · richtig " + (spaet() || "GRÜN"));
    // DER BLICK (heap-blick-folgt): der Stand vor dem Register — die Nah-Wahl der Stadt hält nach der Rückkehr 22,3 MB — ist rot beim
    // Halter und seinen MB; ein Cache, der um 2 MB wackelt, und der geräumte Stand nicht
    const frisch = { halter: [["r._bewohnerNah[]", 0.2], ["r._foundry.cache", 10]] };
    const nach = (nah) => ({ halter: [["r._bewohnerNah[]", nah], ["r._foundry.cache", 12]] });
    const blickRot = blickUrteil("blick", [frisch, nach(22.3), nach(22.3)]).join(" | ");
    const blickGruen = blickUrteil("blick", [frisch, nach(0.2), nach(0.3)]).join(" | ");
    if (blickRot !== "blick: Halter r._bewohnerNah[] überlebt den Blick — frisch 0.2 → nach der Runde 22.3 MB (+22.1)" || blickGruen)
        f.push("der Blick urteilt nicht beim Halter: Mutant " + (blickRot || "GRÜN") + " · geräumt " + (blickGruen || "GRÜN"));
    return f;
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
                for (let i = 0, vor = null; i < n; i++) {
                    await new Promise((f) => requestAnimationFrame(f));
                    if (r._portalOverlay) return (r.exitPortal(), (st.yaw += Math.PI), n - i);
                    if (!dreh || i % 300 < 299) continue;
                    const p = pm.position;
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
                let k = 0, weiter = __deckel("die Ruhe der Zählung", Infinity);
                k < 120 && weiter();
                k = Object.values(r._weltOffen()).some(Boolean) ? 0 : k + 1
            )
                await raf();
        });
    const gehe = async (n) => {
        for (let rest = n; rest > 0; await taste("w", "keyUp"))
            (await taste("w", "keyDown"), (rest = await bilder(rest, true)));
    };
    const drittel = Math.round((Number(b.min) || 6) * 1200);
    await page.evaluate(() => st.renderer.setAnimationLoop((t) => r._gameLoopTick(t)));
    await ruhig();
    await bilder(1200);
    // EINE RUNDE ab dem Start: je ein Drittel gehen · fahren (GT, Taste E; der Gang räumt seinen GT) · das Uhr-Wort, dann
    // zurück an den Start und eingeschwungen. Der EINLAUF (halbe Länge, Mittag, danach Mitternacht) füllt, was beim ersten
    // Gebrauch gedeckelt wächst (die Werkbank der Satz-Blöcke, die Spiegel-Felder, die Leiber der Arten, die Ruhe des Foundry-
    // Cache, die Render-Objekte und Werfer des Sonnen-Schattens); die gemessene Runde geht in die Gegenrichtung über unbereiste
    // Welt und wechselt dieselbe Uhr — was mit der bereisten Welt oder je Wechsel wächst, wächst dort weiter.
    const start = await page.evaluate(() => st.playerMesh.position.toArray());
    const sage = async (wort) => {
        await tippe("enter");
        await cdp.send("Input.insertText", { text: "setze uhrzeit " + wort });
        await tippe("enter");
        await bilder(30);
        return page.evaluate(() => st.timeOfDay);
    };
    const runde = async (n, wort) => {
        const t0 = Date.now();
        await gehe(n);
        await page.evaluate(async () => {
            const p = st.playerMesh.position;
            const e = (window.__gangGT = r.spawnArchitecture(
                "fahrzeug_gt",
                { x: p.x + 2, y: r.getTerrainHeightAt(p.x + 2, p.z) + 0.5, z: p.z },
                { silent: true, precise: true }
            ));
            await __gebautNach(e, { bau: () => {}, takt: () => new Promise((f) => requestAnimationFrame(f)) });
        });
        await tippe("e");
        await bilder(60);
        const fahrt = await page.evaluate(() => st.player.mountedArch != null);
        await gehe(n);
        if (fahrt) await tippe("e");
        await page.evaluate(() => r.removeArchitecture(window.__gangGT));
        const uhr = await sage(wort);
        await gehe(n);
        const min = (Date.now() - t0) / 60000;
        await page.evaluate((s) => st.playerMesh.position.fromArray(s), start);
        await ruhig();
        await bilder(1200);
        return { fahrt, uhr, min };
    };
    const ein = await runde(drittel / 2, "mittag");
    const nacht = await sage("mitternacht");
    await bilder(1200);
    await page.evaluate(() => (st.yaw += Math.PI));
    // die Tiere je Erzeuger (`_taeterKlasse`: `tier:<seele>`) neben dem Stand
    const tiere = () =>
        page.evaluate(() => {
            const n = {};
            for (const { userData: u } of st.creatures)
                if (u?._tierBaum)
                    n["buf:szene:tier:" + (u.soul || "?")] = (n["buf:szene:tier:" + (u.soul || "?")] | 0) + 1;
            return n;
        });
    const vor = Object.assign(await pufferStand(true, 60), { min: 0, tiere: await tiere() });
    const lauf = await runde(drittel, "mittag");
    const nach = Object.assign(await pufferStand(true, 60), { min: lauf.min, tiere: await tiere() });
    await page.evaluate(() => st.renderer.setAnimationLoop(null));
    await cdp.detach();
    const urteil = gangUrteil({ vor, nach });
    if (!(ein.fahrt && lauf.fahrt)) urteil.push("fahrt: die Taste E nahm den GT 2 m neben dem Spieler nicht");
    if (!(nacht < 0.05 || nacht > 0.95) || Math.abs(ein.uhr - 0.5) > 0.05 || Math.abs(lauf.uhr - 0.5) > 0.05)
        urteil.push(
            `uhr: das Spieler-Wort setzte die Uhr auf ${ein.uhr} · ${nacht} · ${lauf.uhr} (Mittag · Mitternacht · Mittag)`
        );
    return {
        urteil,
        heapMB: [vor.heapMB, nach.heapMB],
        vramMB: [vor.vram.mb, nach.vram.mb],
        min: lauf.min,
        tiere: [vor.tiere, nach.tiere],
    };
}

module.exports = {
    gangLauf,
    gangUrteil,
    gangSelbsttest,
    wegUrteil,
    wegSelbsttest,
    rundenUrteil,
    rundenSelbsttest,
    heapBesteller,
    heapStichprobe,
    jsHeapSelbsttest,
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
        `window.__behaelterZensus = ${behaelterZensus.toString()};` +
        `window.__zellZensus = ${zellZensus.toString()};` +
        `window.__renderObjektZensus = ${renderObjektZensus.toString()};` +
        `window.__geburtLinse = ${geburtLinse.toString()};` +
        `window.__geburtZensus = ${geburtZensus.toString()};` +
        `window.__kehrausJetzt = ${kehrausJetzt.toString()};` +
        `window.__texturErzeuger = ${texturErzeuger.toString()};` +
        `window.__texturZensus = ${texturZensus.toString()};`,
};
