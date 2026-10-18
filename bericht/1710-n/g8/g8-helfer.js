// g8-helfer.js — in der Seite installiert (Werkbank /eval): window.__g8 = { dump, gpuVergleich, spur, nullen, zurueck, kipp }
// Probe der Karte G8 (OMEN 18.10., Finder): die Arena im oberen und unteren k0-Zustand in EINER Welt.
const r0 = window.anazhRealm;
window.__g8 = (() => {
    const r = r0,
        AR = r.constructor,
        st = r.state,
        rend = st.renderer,
        be = rend.backend,
        dev = be.device;
    const pn = (cam) => window.__passName(null, cam);
    const buf = (a) => {
        if (!a || !rend._attributes.has(a)) return null;
        const d = be.get(a);
        return (d && d.buffer) || null;
    };
    const lies = async (b, bytes) => {
        const size = Math.min(b.size, Math.ceil(bytes / 4) * 4);
        const s = dev.createBuffer({ size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
        const enc = dev.createCommandEncoder();
        enc.copyBufferToBuffer(b, 0, s, 0, size);
        dev.queue.submit([enc.finish()]);
        await s.mapAsync(GPUMapMode.READ);
        const c = s.getMappedRange().slice(0);
        s.unmap();
        s.destroy();
        return c;
    };
    const arenen = () => [...(AR.__arenen || new Map()).values()];
    const lagerListe = () => [...(AR.__lager || new Map()).values()];
    const eltern = (a) => (a.parent ? a.parent.userData.regionKey || a.parent.name || a.parent.type : null);
    function dump() {
        const LL = lagerListe();
        const lid = new Map(LL.map((l, i) => [l, i]));
        const jetzt = performance.now();
        const out = {
            lagerBau: AR.__lagerBau | 0,
            folgen: AR.__arenaFolgen | 0,
            arenaJetzt: AR.__arenaJetzt,
            arenen: [],
            lager: [],
        };
        for (const a of arenen()) {
            const e = {
                id: a.id,
                lager: lid.get(a._lager),
                side: a.material.side,
                mat: a.material.id,
                mask: a.layers.mask,
                fest: a._fest,
                vis: a.visible,
                eltern: eltern(a),
                kindIdx: a.parent ? a.parent.children.indexOf(a) : -1,
                kinder: a.parent ? a.parent.children.length : 0,
                stufe: a.userData.buendelStufe,
                nCap: a._nCap,
                nBelegt: a._nBelegt,
                nFrei: a._nFrei.slice(0, 12),
                segCap: a._segCap,
                segZahl: a._segZahl,
                segN: a._segN,
                indLen: a._ind ? a._ind.array.length : 0,
                geoId: a.geometry.id,
                idxIstLager: a.geometry.index === a._lager.index,
                idxTyp: a.geometry.index ? a.geometry.index.array.constructor.name : null,
                wartend: a._wartend.size,
                lebend: a._lebend,
                folgt: a._folgt,
                glieder: [],
                zuege: {},
                zuegeB: {},
            };
            for (const m of a.glieder) {
                const z = m.__arenaZ,
                    b = a._lager.gestalten.get(z.gestalt);
                e.glieder.push({
                    id: m.id,
                    name: m.name,
                    n: m.count | 0,
                    stufe: m.userData && m.userData.buendelStufe,
                    gestalt: z.gestalt,
                    nv: b && b.nv,
                    ni: b && b.ni,
                    bv: b && b.bv,
                    fi: b && b.fi,
                    alterMs: b ? Math.round(jetzt - b.zuletzt) : null,
                    erst: z.erst,
                    cap: z.cap,
                    kl: r._taeterKlasse ? r._taeterKlasse(m) : null,
                });
            }
            for (const [nm, reg] of [
                ["zuege", a._zuege],
                ["zuegeB", a._zuegeB],
            ])
                for (const [cam, z] of reg) {
                    const k = z.offs.length;
                    e[nm][pn(cam)] = {
                        seg: z.seg,
                        offs: z.offs.slice(),
                        plaetze: z.plaetze,
                        tri: Math.round(z.tri),
                        zuege: z.zuege.map((m) => m.id),
                        arr: z.arr ? Array.from(z.arr.subarray(0, Math.max(k, z.plaetze) * 5)) : null,
                    };
                }
            out.arenen.push(e);
        }
        for (const l of LL) {
            const gs = [...l.gestalten.entries()];
            out.lager.push({
                i: lid.get(l),
                key: l.key.slice(l.key.indexOf("|") + 1, l.key.indexOf("|") + 160),
                vCap: l.vCap,
                iCap: l.iCap,
                liegt: l.liegt,
                iLiegt: l.iLiegt,
                neu: l.neu,
                idxTyp: l.index ? l.index.array.constructor.name : null,
                gestalten: gs.length,
                liegend: gs.filter(([, b]) => b.bv >= 0).length,
                gestaltListe: gs.map(([k, b]) => [k, b.nv, b.ni, b.bv, b.fi, b.nutzer, Math.round(jetzt - b.zuletzt)]),
                arenen: [...l.arenen].map((a) => a.id),
                vFrei: l.vFrei.slice(0, 24),
                iFrei: l.iFrei.slice(0, 24),
                attr: Object.fromEntries(
                    Object.entries(l.attr || {}).map(([k, a]) => [k, a.array.constructor.name + "x" + a.itemSize])
                ),
            });
        }
        return out;
    }
    // GPU-Seite gegen CPU: je Zug der Kamera `pass` die Aufträge (GPU-Puffer), die Gestalt an bv/fi gegen die Quelle des Glieds,
    // die Matrizen, und die projizierte Fläche je Zug (Pixel der Karte, über alle Instanzen, aus den GPU-Daten)
    async function gpuVergleich(pass) {
        pass = pass || "k0";
        const csm = st.csmNode;
        const licht = csm && csm.lights ? csm.lights[Number(pass.slice(1)) || 0] : null;
        const cam = licht ? licht.shadow.camera : null;
        const ms = licht ? licht.shadow.mapSize : null;
        const PV = new T.Matrix4();
        if (cam) PV.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
        const W = new T.Matrix4(),
            M = new T.Matrix4(),
            v0 = new T.Vector3(),
            v1 = new T.Vector3(),
            v2 = new T.Vector3();
        const aus = { pass, map: ms ? [ms.x, ms.y] : null, arenen: [] };
        for (const a of arenen()) {
            for (const [c, zz] of a._zuege) {
                if (pn(c) !== pass) continue;
                const L = a._lager;
                const ib = buf(a._ind),
                    xb = buf(a.geometry.index),
                    pb = buf(a.geometry.attributes.position),
                    mb = buf(a.__instanzQuelle.instanceMatrix);
                const e = { id: a.id, seg: zz.seg, n: zz.offs.length, fehlt: [ib ? "" : "ind", xb ? "" : "idx", pb ? "" : "pos", mb ? "" : "mat"].join(""), draws: [] };
                if (!ib || !xb || !pb || !mb) {
                    aus.arenen.push(e);
                    continue;
                }
                const indG = new Uint32Array(await lies(ib, a._ind.array.byteLength));
                const xa = a.geometry.index.array;
                const xg = await lies(xb, xa.byteLength);
                const idxG = xa instanceof Uint16Array ? new Uint16Array(xg) : new Uint32Array(xg);
                const posG = new Float32Array(await lies(pb, a.geometry.attributes.position.array.byteLength));
                const matG = new Float32Array(await lies(mb, a.__instanzQuelle.instanceMatrix.array.byteLength));
                let idxDiff = 0,
                    posDiff = 0,
                    matDiff = 0;
                for (let i = 0; i < Math.min(idxG.length, xa.length); i++) if (idxG[i] !== xa[i]) idxDiff++;
                const pa = a.geometry.attributes.position.array;
                for (let i = 0; i < Math.min(posG.length, pa.length); i++) if (posG[i] !== pa[i]) posDiff++;
                const ma = a.__instanzQuelle.instanceMatrix.array;
                for (let i = 0; i < Math.min(matG.length, ma.length); i++) if (matG[i] !== ma[i]) matDiff++;
                Object.assign(e, { idxTyp: xa.constructor.name, idxLen: xa.length, idxDiff, posLen: pa.length / 3, posDiff, matDiff });
                for (let j = 0; j < zz.offs.length; j++) {
                    const w = zz.offs[j] / 4;
                    const g = Array.from(indG.subarray(w, w + 5)),
                        cpu = Array.from(a._ind.array.subarray(w, w + 5));
                    const [ni, n, fi, bv, fe] = g;
                    const m = zz.zuege[j];
                    const gb = m && m.__arenaZ ? L.gestalten.get(m.__arenaZ.gestalt) : null;
                    // die GPU-Gestalt gegen die Quelle des Glieds
                    let quelleDiff = null,
                        mn = Infinity,
                        mx = -Infinity;
                    for (let i = fi; i < fi + ni; i++) {
                        const v = idxG[i];
                        if (v < mn) mn = v;
                        if (v > mx) mx = v;
                    }
                    if (m && m.geometry && m.geometry.index) {
                        quelleDiff = 0;
                        const qi = m.geometry.index.array,
                            qp = m.geometry.attributes.position.array,
                            s0 = Math.max(0, m.geometry.drawRange.start | 0);
                        for (let i = 0; i < ni; i++) if (idxG[fi + i] !== qi[s0 + i]) quelleDiff++;
                        for (let i = 0; i < Math.min(qp.length, (mx + 1) * 3); i++)
                            if (posG[bv * 3 + i] !== qp[i]) quelleDiff++;
                    }
                    // die Fläche in Pixeln der Karte (Summe |Dreieck|, alle Instanzen), aus den GPU-Daten
                    let flaeche = 0,
                        aussen = 0;
                    if (cam && ms) {
                        for (let k = 0; k < n; k++) {
                            W.fromArray(matG, (fe + k) * 16);
                            M.multiplyMatrices(PV, W);
                            for (let t = fi; t + 2 < fi + ni; t += 3) {
                                const p = (q, v) => v.fromArray(posG, (idxG[q] + bv) * 3).applyMatrix4(M);
                                p(t, v0);
                                p(t + 1, v1);
                                p(t + 2, v2);
                                const A = Math.abs((v1.x - v0.x) * (v2.y - v0.y) - (v2.x - v0.x) * (v1.y - v0.y)) * 0.5;
                                const px = A * (ms.x / 2) * (ms.y / 2);
                                if (Math.abs(v0.x) > 1.5 || Math.abs(v0.y) > 1.5) aussen += px;
                                flaeche += px;
                            }
                        }
                    }
                    e.draws.push({
                        gpu: g,
                        cpu,
                        gleich: g.join() === cpu.join(),
                        glied: m ? m.id : null,
                        name: m ? m.name : null,
                        gestaltJetzt: gb ? [gb.bv, gb.fi, gb.nv, gb.ni] : null,
                        idxSpanne: [mn, mx],
                        quelleDiff,
                        flaechePx: Math.round(flaeche),
                        aussenPx: Math.round(aussen),
                    });
                }
                aus.arenen.push(e);
            }
        }
        return aus;
    }
    // Die Spur des Loops: ms lang der Spiel-Loop wie `lauf`, je Frame Schreibe-Bytes je Puffer, Bündel-Aufnahmen je Bündel@Pass,
    // Render-Pässe, Bündel-Ausführungen, Arena-Züge je Arena@Pass, Lager-/Arena-Ereignisse
    async function spur(ms) {
        const z = { ticks: 0, gerendert: 0, k0: 0, write: {}, writeN: 0, writeB: 0, rec: {}, passes: 0, exec: 0, execB: 0, zug: {}, ev: {} };
        const label = new Map();
        const add = (x, n) => {
            const b = buf(x);
            if (b) label.set(b, n);
        };
        for (const a of arenen()) {
            add(a._ind, "ind#" + a.id);
            add(a.__instanzQuelle.instanceMatrix, "mat#" + a.id);
            add(a.__instanzQuelle.windArt, "wind#" + a.id);
            for (const k in a.geometry.attributes) {
                const at = a.geometry.attributes[k];
                if (at.isInstancedBufferAttribute) add(at, "ia:" + k + "#" + a.id);
            }
        }
        let li = 0;
        for (const l of lagerListe()) {
            for (const k in l.attr || {}) add(l.attr[k], "L" + li + ":" + k);
            add(l.index, "L" + li + ":index");
            li++;
        }
        const ab = [];
        const haken = (o, key, fn) => {
            const eigen = Object.prototype.hasOwnProperty.call(o, key);
            const alt = o[key];
            o[key] = fn(alt);
            ab.push(() => {
                if (eigen) o[key] = alt;
                else delete o[key];
            });
        };
        haken(dev.queue, "writeBuffer", (alt) =>
            function (b, off, data, dOff, size) {
                let n;
                if (data instanceof ArrayBuffer) n = size != null ? size : data.byteLength - (dOff || 0);
                else n = (size != null ? size : data.length - (dOff || 0)) * (data.BYTES_PER_ELEMENT || 1);
                const k = label.get(b) || "?" + (b.label || "") + ":" + b.size;
                const e = z.write[k] || (z.write[k] = [0, 0]);
                e[0]++;
                e[1] += n;
                z.writeN++;
                z.writeB += n;
                return alt.apply(this, arguments);
            }
        );
        haken(rend, "_renderBundle", (alt) =>
            function (e, t, r2) {
                const o = this._bundles.get(e.bundleGroup, e.camera, this._currentRenderContext);
                const u = this.backend.get(o);
                if (e.bundleGroup.version !== u.version || u.bundleGPU === undefined) {
                    const k = (e.bundleGroup.userData.regionKey || e.bundleGroup.name || e.bundleGroup.id) + "@" + pn(e.camera);
                    z.rec[k] = (z.rec[k] || 0) + 1;
                }
                return alt.call(this, e, t, r2);
            }
        );
        haken(rend, "_renderScene", (alt) =>
            function (scene, camera, ...rest) {
                if (pn(camera) === "k0") z.k0++;
                return alt.call(this, scene, camera, ...rest);
            }
        );
        haken(GPUCommandEncoder.prototype, "beginRenderPass", (alt) =>
            function () {
                z.passes++;
                return alt.apply(this, arguments);
            }
        );
        haken(GPURenderPassEncoder.prototype, "executeBundles", (alt) =>
            function (bs) {
                z.exec++;
                z.execB += bs.length;
                return alt.apply(this, arguments);
            }
        );
        haken(r, "_arenaZug", (alt) =>
            function (a, renderer, camera) {
                const k = a.id + "@" + pn(camera) + (renderer._currentRenderBundle ? "/auf" : "");
                z.zug[k] = (z.zug[k] || 0) + 1;
                return alt.call(this, a, renderer, camera);
            }
        );
        const GA = AR.__arenaK.prototype;
        for (const f of ["_neuAuf", "_indNeu", "_geoNeu", "_folgen", "_fallen"])
            haken(GA, f, (alt) =>
                function () {
                    z.ev[f] = (z.ev[f] || 0) + 1;
                    return alt.apply(this, arguments);
                }
            );
        const LP = lagerListe().length ? Object.getPrototypeOf(lagerListe()[0]) : null;
        if (LP)
            for (const f of ["bauen", "kopie", "raeumen"])
                haken(LP, f, (alt) =>
                    function () {
                        z.ev["L." + f] = (z.ev["L." + f] || 0) + 1;
                        return alt.apply(this, arguments);
                    }
                );
        const t0 = performance.now();
        try {
            await new Promise((res) => {
                rend.setAnimationLoop((t) => {
                    if (window.__wetterHalten) window.__wetterHalten();
                    const g0 = r._gpuLeine ? r._gpuLeine.gerendert : 0;
                    r._gameLoopTick(t);
                    z.ticks++;
                    if (!r._gpuLeine || r._gpuLeine.gerendert > g0) z.gerendert++;
                    if (performance.now() - t0 > ms) {
                        rend.setAnimationLoop(null);
                        res();
                    }
                });
            });
            await dev.queue.onSubmittedWorkDone();
        } finally {
            rend.setAnimationLoop(null);
            while (ab.length) ab.pop()();
        }
        // je gerendertem Frame
        const f = Math.max(1, z.gerendert);
        z.jeFrame = {
            writeN: +(z.writeN / f).toFixed(1),
            writeKB: +(z.writeB / f / 1024).toFixed(1),
            passes: +(z.passes / f).toFixed(2),
            exec: +(z.exec / f).toFixed(2),
            execB: +(z.execB / f).toFixed(2),
            rec: +(Object.values(z.rec).reduce((s, x) => s + x, 0) / f).toFixed(2),
        };
        z.write = Object.fromEntries(Object.entries(z.write).sort((x, y) => y[1][1] - x[1][1]).slice(0, 40));
        return z;
    }
    // die Instanz-Zahl der Züge einer Kamera auf der GPU auf 0 (ohne Aufnahme, ohne Takt) — und zurück aus der CPU-Kopie
    function nullen(pass, nur) {
        const done = [];
        for (const a of arenen()) {
            if (nur && !nur.includes(a.id)) continue;
            for (const [c, zz] of a._zuege) {
                if (pn(c) !== pass) continue;
                const b = buf(a._ind);
                if (!b) continue;
                for (const off of zz.offs) dev.queue.writeBuffer(b, off + 4, new Uint32Array([0]));
                done.push([a.id, zz.offs.length]);
            }
        }
        return done;
    }
    function zurueck(pass, nur) {
        const done = [];
        for (const a of arenen()) {
            if (nur && !nur.includes(a.id)) continue;
            for (const [c, zz] of a._zuege) {
                if (pn(c) !== pass) continue;
                const b = buf(a._ind);
                if (!b) continue;
                for (const off of zz.offs) dev.queue.writeBuffer(b, off + 4, a._ind.array, off / 4 + 1, 1);
                done.push([a.id, zz.offs.length]);
            }
        }
        return done;
    }
    // die Arenen der Kamera `pass`
    function arenenVon(pass) {
        const ids = [];
        for (const a of arenen()) for (const [c] of a._zuege) if (pn(c) === pass) ids.push(a.id);
        return ids;
    }
    // Kipp-Versuche: "lager" = die Lager der k0-Arenen bauen neu; "folgen" = die k0-Arenen folgen (neue Objekte)
    function kipp(art, pass) {
        const ids = arenenVon(pass || "k0");
        const as = arenen().filter((a) => ids.includes(a.id));
        if (art === "lager") {
            const ls = new Set(as.map((a) => a._lager));
            for (const l of ls) l.neu = true;
            return { lager: ls.size, arenen: ids };
        }
        if (art === "folgen") {
            for (const a of as) a._folgen();
            return { folgen: ids };
        }
        return null;
    }
    // DER UMSCHALTER JE PASS (taktimmun): die Arenen `ids` ziehen in Pass `pass` 0 Instanzen — ihr `_auftraege` schreibt wie immer,
    // danach setzt der Haken die Instanz-Zahl jedes Zugs auf 0 und schreibt den Abschnitt neu (kein Lager, keine Aufnahme berührt)
    let ausAb = null;
    function aus(pass, ids) {
        an();
        const GA = AR.__arenaK.prototype,
            alt = GA._auftraege;
        const set = ids ? new Set(ids) : null;
        GA._auftraege = function (zug, camera, renderer, auf) {
            alt.call(this, zug, camera, renderer, auf);
            if (camera && (!set || set.has(this.id)) && pn(camera) === pass && zug.offs.length) {
                const basis = zug.seg * this._segCap * 5;
                for (let k = 0; k < zug.offs.length; k++) zug.arr[k * 5 + 1] = 0;
                const b = buf(this._ind);
                if (b) dev.queue.writeBuffer(b, basis * 4, this._ind.array, basis, zug.offs.length * 5);
            }
        };
        ausAb = () => {
            GA._auftraege = alt;
        };
        return ids;
    }
    function an() {
        if (ausAb) ausAb();
        ausAb = null;
        return 1;
    }
    // DIE REIHE (taktimmun): die Arenen `ids` zeichnen in jedem losen Render in DIESER Folge (nur im Gleichstand von Gruppe,
    // renderOrder, Schicht und Tiefe — sonst r184s Folge wie immer); null: zurück zur Zeichen-Folge des Stamms
    function reihe(ids) {
        if (!ids) {
            rend.setOpaqueSort(AR._zeichenFolge);
            return 0;
        }
        const prio = new Map(ids.map((id, i) => [id, i]));
        const f = AR._zeichenFolge;
        rend.setOpaqueSort((a, b) => {
            const pa = prio.get(a.object.id),
                pb = prio.get(b.object.id);
            if (
                pa !== undefined &&
                pb !== undefined &&
                pa !== pb &&
                a.groupOrder === b.groupOrder &&
                a.renderOrder === b.renderOrder &&
                AR._zeichenRang(a.object) === AR._zeichenRang(b.object) &&
                a.z === b.z
            )
                return pa - pb;
            return f(a, b);
        });
        return ids;
    }
    // die Folge der Züge eines Passes (ein Render-Objekt-Haken für einen Frame): Objekt-id, Klasse, Dreiecke
    async function folge(pass) {
        const liste = [];
        const roh = rend._renderObjectDirect;
        rend._renderObjectDirect = function (object, material, scene, camera, ...rest) {
            if (pn(camera) === pass) {
                const g = object.geometry;
                liste.push([object.id, r._taeterKlasse ? r._taeterKlasse(object) : object.name, object.isGeometrieArena ? "arena" : "", material ? material.side : null]);
            }
            return roh.call(this, object, material, scene, camera, ...rest);
        };
        try {
            r._schattenAlleNeu();
            for (let i = 0; i < 6 && !liste.length; i++) {
                if (window.__wetterHalten) window.__wetterHalten();
                r._loopRender();
                await dev.queue.onSubmittedWorkDone();
            }
        } finally {
            rend._renderObjectDirect = roh;
        }
        return liste;
    }
    // DER VERLAUF (je Frame): k0-ms (Pass-Uhr) neben der Signatur der k0-Arena-Züge (Render-Objekt, Programme, GPU-Pipeline,
    // Puffer), den Schreib-Bytes in die Puffer der k0-Arenen, k1 im Frame, CPU-Takt — in Stücken von `stueck` s (Pool lesen)
    const sn = new WeakMap();
    let snN = 0;
    const sid = (o) => {
        if (!o) return 0;
        if (!sn.has(o)) sn.set(o, ++snN);
        return sn.get(o);
    };
    const programme = new Map(); // Programm-id → { stage, code-Länge, Hash, code (nur für Arenen in k0) }
    const hash = (s) => {
        let h = 2166136261;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
        return h.toString(16);
    };
    async function verlauf(sek, stueck) {
        stueck = stueck || 10;
        const sigs = new Map(); // Signatur-Text → Nummer
        const frames = [];
        let akt = null; // die Züge des laufenden Frames in k0
        const ab = [];
        const haken = (o, key, fn) => {
            const eigen = Object.prototype.hasOwnProperty.call(o, key);
            const alt = o[key];
            o[key] = fn(alt);
            ab.push(() => {
                if (eigen) o[key] = alt;
                else delete o[key];
            });
        };
        haken(be, "draw", (alt) =>
            function (ro, info) {
                if (akt && ro.object && ro.camera && pn(ro.camera) === "k0") {
                    const p = ro.pipeline;
                    const vp = p && p.vertexProgram,
                        fp = p && p.fragmentProgram;
                    for (const x of [vp, fp])
                        if (x && !programme.has(x.id))
                            programme.set(x.id, { stage: x.stage, n: x.code.length, h: hash(x.code), code: ro.object.isGeometrieArena ? x.code : null, obj: ro.object.id });
                    const gp = p ? be.get(p).pipeline : null;
                    const m = ro.material;
                    akt.push(
                        [ro.object.id, sid(ro), vp ? vp.id : 0, fp ? fp.id : 0, sid(gp), m ? m.id : 0, m ? m.side : -1, ro.object.isGeometrieArena ? [sid(buf(ro.object.geometry.index)), sid(buf(ro.object.geometry.attributes.position)), sid(buf(ro.object._ind)), sid(buf(ro.object.__instanzQuelle.instanceMatrix))].join("/") : ""].join(":")
                    );
                }
                return alt.call(this, ro, info);
            }
        );
        let bytes = 0;
        const arenaPuffer = new Set();
        haken(dev.queue, "writeBuffer", (alt) =>
            function (b, off, data, dOff, size) {
                if (akt && arenaPuffer.has(b)) {
                    let n;
                    if (data instanceof ArrayBuffer) n = size != null ? size : data.byteLength - (dOff || 0);
                    else n = (size != null ? size : data.length - (dOff || 0)) * (data.BYTES_PER_ELEMENT || 1);
                    bytes += n;
                }
                return alt.apply(this, arguments);
            }
        );
        const ev = {};
        const GA = AR.__arenaK.prototype;
        for (const f of ["_neuAuf", "_indNeu", "_geoNeu", "_folgen", "_fallen"])
            haken(GA, f, (alt) =>
                function () {
                    ev[f] = (ev[f] || 0) + 1;
                    return alt.apply(this, arguments);
                }
            );
        const LP = Object.getPrototypeOf(lagerListe()[0]);
        haken(LP, "bauen", (alt) =>
            function () {
                const k = "bauen:L" + lagerListe().indexOf(this);
                ev[k] = (ev[k] || 0) + 1;
                return alt.apply(this, arguments);
            }
        );
        const uhr = window.__passUhr();
        uhr.messen = true;
        const je = {};
        const t0 = performance.now();
        let tStueck = t0;
        try {
            for (;;) {
                await new Promise((res) => {
                    rend.setAnimationLoop((t) => {
                        if (window.__wetterHalten) window.__wetterHalten();
                        arenaPuffer.clear();
                        for (const a of arenen()) {
                            for (const x of [a._ind, a.__instanzQuelle.instanceMatrix, a.geometry.index, a.geometry.attributes.position]) {
                                const b = buf(x);
                                if (b) arenaPuffer.add(b);
                            }
                        }
                        akt = [];
                        bytes = 0;
                        for (const k in ev) delete ev[k];
                        const c0 = performance.now();
                        const f = rend.info.frame;
                        r._gameLoopTick(t);
                        const sig = akt.join(" ");
                        if (!sigs.has(sig)) sigs.set(sig, sigs.size);
                        frames.push({ f, i: sigs.get(sig), cpu: +(performance.now() - c0).toFixed(2), b: bytes, ev: Object.keys(ev).length ? Object.assign({}, ev) : undefined, t: Math.round(performance.now() - t0) });
                        akt = null;
                        if (performance.now() - tStueck > stueck * 1000) {
                            rend.setAnimationLoop(null);
                            res();
                        }
                    });
                });
                await dev.queue.onSubmittedWorkDone();
                const j = (await uhr.lesen()) || {};
                for (const [p, e] of Object.entries(j)) {
                    const z = je[p] || (je[p] = {});
                    Object.assign(z, e);
                }
                tStueck = performance.now();
                if (performance.now() - t0 > sek * 1000) break;
            }
        } finally {
            rend.setAnimationLoop(null);
            akt = null;
            uhr.ab();
            while (ab.length) ab.pop()();
        }
        // je Frame: k0 ms, k1 ms, haupt ms
        for (const fr of frames) {
            const k = String(fr.f);
            if (je.k0 && je.k0[k] != null) fr.k0 = +je.k0[k].toFixed(3);
            if (je.k1 && je.k1[k] != null) fr.k1 = +je.k1[k].toFixed(3);
            if (je.haupt && je.haupt[k] != null) fr.h = +je.haupt[k].toFixed(3);
        }
        return { frames, sigs: [...sigs.keys()] };
    }
    // DIE PHASE (taktimmun, EINE Welt): n Frames wie die Bank (`__bankRunde`: Schatten-Takt + `_loopRender`), je Frame die Pass-Uhr.
    // "leer": vor jedem Frame wartet die CPU, bis die GPU leer ist (kein Vorgänger läuft, wenn k0 beginnt); "dicht": die Frames
    // hintereinander (der Vorgänger läuft noch). Zurück: k0/haupt je Frame, die Wanduhr der GPU je Frame (dicht = GPU-gebunden).
    async function phase(modus, n, runden) {
        const q = dev.queue;
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        rend.setAnimationLoop(null);
        const k0 = [],
            k1 = [],
            haupt = [],
            summe = [],
            wand = [];
        for (let rd = 0; rd < runden; rd++) {
            const uhr = window.__passUhr();
            uhr.messen = true;
            await q.onSubmittedWorkDone();
            const t0 = performance.now();
            let warte = 0;
            try {
                for (let i = 0; i < n; i++) {
                    if (modus === "leer") {
                        const w0 = performance.now();
                        await q.onSubmittedWorkDone();
                        await sleep(1);
                        warte += performance.now() - w0;
                    }
                    if (window.__wetterHalten) window.__wetterHalten();
                    if (rend._nodes && rend._nodes.nodeFrame) {
                        rend._nodes.nodeFrame.update();
                        rend.info.frame = rend._nodes.nodeFrame.frameId;
                    }
                    r._loopShadowUpdate();
                    r._loopRender();
                }
                await q.onSubmittedWorkDone();
                wand.push((performance.now() - t0 - warte) / n);
                const j = (await uhr.lesen()) || {};
                for (const [p, arr] of [
                    ["k0", k0],
                    ["k1", k1],
                    ["haupt", haupt],
                ])
                    if (j[p]) for (const v of Object.values(j[p])) arr.push(v);
                const fs = {};
                for (const e of Object.values(j)) for (const [f, v] of Object.entries(e)) fs[f] = (fs[f] || 0) + v;
                for (const v of Object.values(fs)) summe.push(v);
            } finally {
                uhr.ab();
            }
        }
        const med = (a) => {
            const s = a.slice().sort((x, y) => x - y);
            return s.length ? +s[Math.floor(s.length / 2)].toFixed(3) : null;
        };
        const oben = (a) => +(a.filter((x) => x > 0.45).length / Math.max(1, a.length)).toFixed(2);
        return { modus, n, runden, k0: med(k0), k0n: k0.length, k0oben: oben(k0), k1: med(k1), k1n: k1.length, haupt: med(haupt), summe: med(summe), wandJeFrame: med(wand), k0roh: k0.map((x) => +x.toFixed(3)) };
    }
    // DER TAKT MIT VERSATZ (taktimmun, EINE Welt): der Spiel-Loop wie `lauf` (rAF, Leine, Präsentieren), aber jeder Takt
    // beginnt `d` ms nach seinem rAF (Warte-Schleife) — die Lage des Frames zur Bildwiederholung wandert, nichts sonst. Je Frame
    // k0-ms und die Phase des k0-Renders (ms seit dem rAF-Zeitstempel).
    async function takt(d, sek) {
        const q = dev.queue;
        rend.setAnimationLoop(null);
        const uhr = window.__passUhr();
        uhr.messen = true;
        const frames = [];
        let rafT = 0,
            ph = null;
        const altRS = rend._renderScene;
        const eigen = Object.prototype.hasOwnProperty.call(rend, "_renderScene");
        rend._renderScene = function (scene, cam, ...rest) {
            if (ph === null && pn(cam) === "k0") ph = performance.now() - rafT;
            return altRS.call(this, scene, cam, ...rest);
        };
        const decke = st.perfTargetMs;
        st.perfTargetMs = 1000;
        window.__buehne();
        const t0 = performance.now();
        try {
            await new Promise((res) => {
                rend.setAnimationLoop((t) => {
                    const c = performance.now();
                    while (performance.now() - c < d) {}
                    rafT = t;
                    ph = null;
                    if (window.__wetterHalten) window.__wetterHalten();
                    const f = rend.info.frame;
                    r._gameLoopTick(t);
                    frames.push({ f, ph: ph === null ? null : +ph.toFixed(2), lag: +(c - t).toFixed(2) });
                    if (performance.now() - t0 > sek * 1000) {
                        rend.setAnimationLoop(null);
                        res();
                    }
                });
            });
            await q.onSubmittedWorkDone();
            const j = (await uhr.lesen()) || {};
            for (const fr of frames) {
                const k = String(fr.f);
                if (j.k0 && j.k0[k] != null) fr.k0 = +j.k0[k].toFixed(3);
            }
        } finally {
            rend.setAnimationLoop(null);
            st.perfTargetMs = decke;
            if (eigen) rend._renderScene = altRS;
            else delete rend._renderScene;
            uhr.ab();
        }
        const k0 = frames.filter((f) => f.k0 != null);
        const s = k0.map((f) => f.k0).sort((a, b) => a - b);
        return { d, sek, frames: frames.length, k0n: k0.length, k0: s.length ? s[Math.floor(s.length / 2)] : null, oben: +(k0.filter((f) => f.k0 > 0.45).length / Math.max(1, k0.length)).toFixed(2), roh: k0.map((f) => [f.ph, f.lag, f.k0]) };
    }
    // DIE TRENNUNG (taktimmun): woher kommt der obere Gipfel? "rafBank": rAF-Loop (präsentiert je Frame) mit NUR dem Render der Bank
    // (Schatten-Takt + `_loopRender`, kein Spiel-Takt); "tickDicht": n volle Spiel-Takte hintereinander in EINER Aufgabe (kein
    // Präsentieren dazwischen), die Leine weit (GPU_FRAMES_IM_FLUG 99, danach zurück). Je Frame k0 aus der Pass-Uhr.
    async function trennung(art, sek, n) {
        const q = dev.queue;
        rend.setAnimationLoop(null);
        const uhr = window.__passUhr();
        uhr.messen = true;
        const decke = st.perfTargetMs;
        st.perfTargetMs = 1000;
        window.__buehne();
        const imFlug = AR.GPU_FRAMES_IM_FLUG;
        const k0 = [];
        try {
            if (art === "rafBank") {
                const t0 = performance.now();
                await new Promise((res) => {
                    rend.setAnimationLoop(() => {
                        if (window.__wetterHalten) window.__wetterHalten();
                        r._loopShadowUpdate();
                        r._loopRender();
                        if (performance.now() - t0 > sek * 1000) {
                            rend.setAnimationLoop(null);
                            res();
                        }
                    });
                });
            } else {
                AR.GPU_FRAMES_IM_FLUG = 99;
                let t = performance.now();
                for (let i = 0; i < n; i++) {
                    if (window.__wetterHalten) window.__wetterHalten();
                    if (rend.info.autoReset === true) rend.info.reset();
                    rend._nodes.nodeFrame.update();
                    rend.info.frame = rend._nodes.nodeFrame.frameId;
                    t += 1000 / 120;
                    r._gameLoopTick(t);
                }
            }
            await q.onSubmittedWorkDone();
            const j = (await uhr.lesen()) || {};
            if (j.k0) for (const v of Object.values(j.k0)) k0.push(+v.toFixed(3));
        } finally {
            AR.GPU_FRAMES_IM_FLUG = imFlug;
            rend.setAnimationLoop(null);
            st.perfTargetMs = decke;
            uhr.ab();
        }
        const s = k0.slice().sort((a, b) => a - b);
        const u = s.filter((x) => x <= 0.45),
            o = s.filter((x) => x > 0.45);
        return { art, k0n: k0.length, k0: s.length ? s[Math.floor(s.length / 2)] : null, oben: +(o.length / Math.max(1, s.length)).toFixed(2), unten50: u.length ? u[Math.floor(u.length / 2)] : null, oben50: o.length ? o[Math.floor(o.length / 2)] : null, roh: k0 };
    }
    function programmCode(ids) {
        const o = {};
        for (const [id, p] of programme) if (!ids || ids.includes(id)) o[id] = p;
        return o;
    }
    return { dump, gpuVergleich, spur, nullen, zurueck, arenenVon, kipp, aus, an, reihe, folge, verlauf, phase, takt, trennung, programmCode, buf, lies };
})();
return Object.keys(window.__g8);
