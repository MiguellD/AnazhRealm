// diaet-linse.cjs — DIE DIÄT-LINSE (Welle K, 07.10.): was die Observer-Diät und die Bundles je gerendertem Frame im
// echten Loop arbeiten — und was davon NETTO ihre Arbeit ist. Befund 07.10. (Mess-Wiese, echte GPU, Stand): das
// OMEN-Profil führte `_diaetRefresh` mit 3,77 ms und `_renderBundles` mit 3,43 ms je Frame; beide Zeiten sind
// INKLUSIV und tragen denselben verschachtelten Schatten-Render — er startet am ersten Licht-Empfänger mitten im
// Replay (Pfad szene › replay › Prüfung › Gang › Vorher-Knoten des Schattens), netto 5–9 ms bei 1,3–1,4 Kaskaden je
// Frame, die Diät selbst netto 0,7 (Prüfung) + 1,0 (Gang) ms, der Replay 0,1 ms. Die Linse zählt und zieht jeden
// verschachtelten Bereich vom äußeren ab:
//   Zahl je Frame: Prüfungen · Voll-Refreshs (Grund) · Gänge der Diät über Vorher-Knoten, Knoten und geteilte Gruppen
//                  (und wie viele davon einen Knoten oder eine Gruppe im SELBEN Render-Abschnitt wiederholen) · Uploads geteilter
//                  und eigener Gruppen · writeBuffer · Replay-Bürger · Renders
//   Netto je Frame: Prüfung · Gang · Replay · Aufnahme · Voll-Refresh (Knoten · Bindungen · Geometrie) · Schatten-
//                  Render · Szene — und WO der Schatten-Render startet (Pfad der umschließenden Bereiche)
// Urteil (Gebot 7): im Stand wiederholt die Diät keinen Gang (je Knoten und geteilter Gruppe EINMAL je Render-Abschnitt), und
// jeder Voll-Refresh trägt eine Änderung zur GPU (K71, 15.10.: ohne Änderung = kein Gruppen-Upload, kein neuer Puffer, keine
// Textur, jedes geschriebene Byte gleich dem dort liegenden — am Kopf vor K71 an Genesis Third jeder Satz in jedem Render, weil
// sein Ausschnitt je Pass wechselt, und jede Nah-Wiesen-Senke, deren Version ohne neue Matrizen stieg; Täter beim Namen).
//
//   Seite:     window.__diaetLauf({ frames: 90, modus: "ruhe"|"drehen"|"gehen", grad: 1, tiere: "halten"|"frei" })
//   Werkbank:  node scripts/werkbank.cjs diaet [frames] [--modus ruhe] [--tiere halten] | diaet --selbsttest

function diaetLauf(opts) {
    return (async () => {
        const o = opts || {};
        const r = window.anazhRealm;
        const A = r.constructor;
        const st = r.state;
        const rend = st.renderer;
        const be = rend.backend;
        const nf = rend._nodes.nodeFrame;
        const nfP = Object.getPrototypeOf(nf);
        const roh = {
            refresh: A._diaetRefresh,
            schreib: A._diaetGeteiltSchreiben,
            szene: rend._renderScene,
            bundle: rend._renderBundle,
            nUpd: rend._nodes.updateForRender,
            bUpd: rend._bindings.updateForRender,
            gUpd: rend._geometries.updateForRender,
            bu: rend._bindings._update,
            ubEigen: Object.prototype.hasOwnProperty.call(be, "updateBinding"),
            ub: be.updateBinding,
            wb: be.device.queue.writeBuffer,
            cb: be.device.createBuffer,
            wt: be.device.queue.writeTexture,
            ubsEigen: Object.prototype.hasOwnProperty.call(be, "updateBindings"),
            ubs: be.updateBindings,
        };
        let c = null;
        const stapel = [];
        let imGang = 0;
        // DER REFRESH OHNE ÄNDERUNG (K71): ein Voll-Refresh, der nichts Neues zur GPU trägt — kein Upload einer Gruppe (r184
        // lädt eine Gruppe nur bei geändertem Wert), kein neuer Puffer, und jedes geschriebene Byte gleicht dem, was an dieser
        // Stelle schon liegt (eine Version, die ein Schreiber ohne Änderung hob). Je Refresh offen bis zum Ende seiner
        // Bindungen; Schreibe zählen beim Render-Objekt, dessen Auffrischung sie trägt.
        const offen = new Map();
        let aktRo = null;
        const kopie = new WeakMap();
        const nameVon = (ro) => {
            const obj = ro && ro.object;
            let nm = (obj && (obj.name || obj.type)) || "?";
            for (let p = obj && obj.parent, i = 0; p && i < 4; p = p.parent, i++)
                if (p.name) {
                    nm = p.name + "/" + nm;
                    break;
                }
            return (ro && ro.material && ro.material.isShadowPassMaterial ? "Schatten " : "") + nm;
        };
        const wirkt = () => {
            const w = aktRo && offen.get(aktRo);
            if (w) w.wirkung++;
        };
        const mitRo = (ro, fn) => {
            const alt = aktRo;
            aktRo = ro;
            try {
                return fn();
            } finally {
                aktRo = alt;
            }
        };
        const rahmen = (name, fn) => {
            if (!c) return fn();
            if (name === "schattenRender") {
                const pfad = stapel.map((x) => x.name).join(" › ") || "(oben)";
                c.schattenPfad[pfad] = (c.schattenPfad[pfad] || 0) + 1;
            }
            const f = { name, kind: 0 };
            stapel.push(f);
            const t0 = performance.now();
            try {
                return fn();
            } finally {
                const d = performance.now() - t0;
                stapel.pop();
                c.ms[name] = (c.ms[name] || 0) + d - f.kind;
                const aussen = stapel[stapel.length - 1];
                if (aussen) aussen.kind += d;
            }
        };
        const zaehle = (k, n = 1) => {
            if (c) c.n[k] = (c.n[k] || 0) + n;
        };
        // Die Wiederholung zählt je RENDER-ABSCHNITT (Render-Id und `info.calls`, wie der Stempel des Gangs): nach einem
        // verschachtelten Render stellt der äußere seine Knoten zu Recht ein zweites Mal.
        const besuch = (art, id) => {
            if (!c) return;
            const k = nf.renderId + ":" + rend.info.calls + ":" + art + ":" + id;
            const v = (c.besuche.get(k) || 0) + 1;
            c.besuche.set(k, v);
            zaehle("gang" + art);
            if (v > 1) zaehle("wiederholt" + art);
        };
        A._diaetRefresh = function (obs, ro, frame, altNR) {
            const v = rahmen("pruef", () => roh.refresh(obs, ro, frame, altNR));
            zaehle("pruef");
            if (frame) c && c.rids.add(frame.renderId);
            if (v && c) offen.set(ro, { name: nameVon(ro), wirkung: 0 });
            if (v && c) {
                zaehle("voll");
                const obj = ro && ro.object;
                let nm = (obj && (obj.name || obj.type)) || "?";
                for (let p = obj && obj.parent, i = 0; p && i < 4; p = p.parent, i++)
                    if (p.name) {
                        nm = p.name + "/" + nm;
                        break;
                    }
                c.grund[nm] = (c.grund[nm] || 0) + 1;
            }
            return v;
        };
        A._diaetGeteiltSchreiben = function (rr, ro, rid) {
            imGang++;
            try {
                return rahmen("gang", () => roh.schreib(rr, ro, rid));
            } finally {
                imGang--;
            }
        };
        nf.updateNode = function (n) {
            if (imGang) besuch("Knoten", n.id);
            return nfP.updateNode.call(this, n);
        };
        nf.updateBeforeNode = function (n) {
            if (imGang) besuch("Vorher", n.id);
            return nfP.updateBeforeNode.call(this, n);
        };
        rend._bindings._update = function (g, alle) {
            if (imGang) besuch("Gruppe", g.id);
            return roh.bu.call(this, g, alle);
        };
        be.updateBinding = function (b) {
            zaehle(b && b.groupNode && b.groupNode.shared === true ? "uploadGeteilt" : "uploadEigen");
            wirkt();
            return roh.ub.call(this, b);
        };
        be.device.queue.writeBuffer = function (buf, off, data, dOff, size) {
            zaehle("writeBuffer");
            zaehle("writeBufferBytes", size != null ? size * (data.BYTES_PER_ELEMENT || 1) : data.byteLength || 0);
            // die Bytes dieses Schreibens gegen das, was an dieser Stelle zuletzt lag (auch im Einschwingen gemerkt)
            const bpe = data.BYTES_PER_ELEMENT || 1;
            const quelle = ArrayBuffer.isView(data) ? data : new Uint8Array(data);
            const u8 = new Uint8Array(
                quelle.buffer,
                quelle.byteOffset + (dOff || 0) * bpe,
                size != null ? size * bpe : quelle.byteLength - (dOff || 0) * bpe
            );
            let m = kopie.get(buf);
            if (!m) kopie.set(buf, (m = new Map()));
            const k = off + ":" + u8.byteLength;
            const alt = m.get(k);
            let gleich = !!alt;
            if (alt)
                for (let i = 0; i < u8.length; i++)
                    if (alt[i] !== u8[i]) {
                        gleich = false;
                        break;
                    }
            if (!gleich) {
                // ein Schreiben über einen anderen Bereich macht dessen Kopie alt
                for (const k2 of m.keys()) {
                    const [o2, n2] = k2.split(":").map(Number);
                    if (k2 !== k && o2 < off + u8.byteLength && off < o2 + n2) m.delete(k2);
                }
                m.set(k, u8.slice());
                wirkt();
            }
            return roh.wb.call(this, buf, off, data, dOff, size);
        };
        // Ein verschachtelter Render (der Schatten, den ein Vorher-Knoten im Gang startet) und ein Voll-Refresh sind nie
        // der Gang: ihre Knoten-Besuche zählen nicht als Wiederholung des äußeren Gangs.
        const ohneGang = (fn) => {
            const alt = imGang;
            imGang = 0;
            try {
                return fn();
            } finally {
                imGang = alt;
            }
        };
        rend._renderScene = function (scene, camera, fb) {
            const schatten = !!(scene && scene.overrideMaterial && scene.overrideMaterial.isShadowPassMaterial);
            zaehle(schatten ? "schattenRenders" : "szenen");
            return ohneGang(() => rahmen(schatten ? "schattenRender" : "szene", () => roh.szene.call(this, scene, camera, fb)));
        };
        rend._renderBundle = function (bundle, sceneRef, lightsNode) {
            const rb = this._bundles.get(bundle.bundleGroup, bundle.camera, this._currentRenderContext);
            const d = this.backend.get(rb);
            const replay = d.bundleGPU !== undefined && bundle.bundleGroup.version === d.version;
            if (replay) zaehle("replayBuerger", d.renderObjects ? d.renderObjects.length : 0);
            else zaehle("aufnahmen");
            return rahmen(replay ? "replay" : "aufnahme", () => roh.bundle.call(this, bundle, sceneRef, lightsNode));
        };
        rend._nodes.updateForRender = function (ro) {
            return mitRo(ro, () => ohneGang(() => rahmen("vollKnoten", () => roh.nUpd.call(this, ro))));
        };
        rend._bindings.updateForRender = function (ro) {
            try {
                return mitRo(ro, () => ohneGang(() => rahmen("vollBindung", () => roh.bUpd.call(this, ro))));
            } finally {
                const w = offen.get(ro);
                if (w) {
                    offen.delete(ro);
                    if (w.wirkung === 0 && c) {
                        zaehle("ohne");
                        c.ohne[w.name] = (c.ohne[w.name] || 0) + 1;
                    }
                }
            }
        };
        rend._geometries.updateForRender = function (ro) {
            return mitRo(ro, () => rahmen("vollGeo", () => roh.gUpd.call(this, ro)));
        };
        // ein neuer Puffer, eine Textur, eine neue Bindegruppe tragen immer eine Änderung
        be.device.createBuffer = function (d) {
            wirkt();
            return roh.cb.call(this, d);
        };
        be.device.queue.writeTexture = function (...a) {
            wirkt();
            return roh.wt.apply(this, a);
        };
        be.updateBindings = function (...a) {
            wirkt();
            return roh.ubs.apply(this, a);
        };
        const N = Number(o.frames) || 90;
        const modus = o.modus || "ruhe";
        if (typeof window.__buehne === "function") window.__buehne();
        if (o.tiere !== "frei" && typeof window.__tiereHalten === "function") window.__tiereHalten();
        const decke = st.perfTargetMs;
        st.perfTargetMs = 1000;
        const gier0 = st.yaw;
        const pos0 = st.playerMesh ? st.playerMesh.position.clone() : null;
        const frames = [];
        let ein = o.ein != null ? Number(o.ein) : 20;
        try {
            await new Promise((fertig) => {
                let i = 0;
                rend.setAnimationLoop((t) => {
                    if (typeof window.__wetterHalten === "function") window.__wetterHalten();
                    if (ein <= 0) {
                        if (modus === "drehen") st.yaw += ((Number(o.grad) || 1) * Math.PI) / 180;
                        if (modus === "gehen" && pos0) {
                            const p = st.playerMesh.position;
                            p.x += Math.sin(st.yaw) * -0.08;
                            p.z += Math.cos(st.yaw) * -0.08;
                        }
                    }
                    const g0 = r._gpuLeine ? r._gpuLeine.gerendert : 0;
                    c = { n: {}, ms: {}, grund: {}, ohne: {}, schattenPfad: {}, besuche: new Map(), rids: new Set() };
                    const t0 = performance.now();
                    try {
                        r._gameLoopTick(t);
                    } finally {
                        c.ms.cpu = performance.now() - t0;
                    }
                    const f = c;
                    c = null;
                    const gerendert = !r._gpuLeine || r._gpuLeine.gerendert > g0;
                    if (ein > 0) return void ein--;
                    if (gerendert) frames.push(f);
                    if (++i >= N) {
                        rend.setAnimationLoop(null);
                        fertig();
                    }
                });
            });
        } finally {
            A._diaetRefresh = roh.refresh;
            A._diaetGeteiltSchreiben = roh.schreib;
            delete nf.updateNode;
            delete nf.updateBeforeNode;
            rend._bindings._update = roh.bu;
            if (roh.ubEigen) be.updateBinding = roh.ub;
            else delete be.updateBinding;
            be.device.queue.writeBuffer = roh.wb;
            be.device.createBuffer = roh.cb;
            be.device.queue.writeTexture = roh.wt;
            if (roh.ubsEigen) be.updateBindings = roh.ubs;
            else delete be.updateBindings;
            rend._renderScene = roh.szene;
            rend._renderBundle = roh.bundle;
            rend._nodes.updateForRender = roh.nUpd;
            rend._bindings.updateForRender = roh.bUpd;
            rend._geometries.updateForRender = roh.gUpd;
            st.perfTargetMs = decke;
            if (modus === "drehen") st.yaw = gier0;
            if (modus === "gehen" && pos0) st.playerMesh.position.copy(pos0);
        }
        const F = Math.max(1, frames.length);
        const mittel = (feld) => {
            const m = {};
            for (const f of frames) for (const [k, v] of Object.entries(f[feld])) m[k] = (m[k] || 0) + v / F;
            for (const k in m) m[k] = Math.round(m[k] * 1000) / 1000;
            return m;
        };
        const zahl = mittel("n");
        zahl.renders = Math.round((frames.reduce((a, f) => a + f.rids.size, 0) / F) * 10) / 10;
        const top = (m, n) =>
            Object.entries(m)
                .sort((a, b) => b[1] - a[1])
                .slice(0, n)
                .map(([k, v]) => `${k}: ${Math.round(v * 10) / 10}`);
        return {
            modus,
            tiere: o.tiere || "halten",
            frames: frames.length,
            zahl,
            netto: mittel("ms"),
            schattenPfad: top(mittel("schattenPfad"), 6),
            vollGrund: top(mittel("grund"), 12),
            ohneAenderung: top(mittel("ohne"), 12),
        };
    })();
}

// DAS URTEIL (Node, auch im Selbsttest): im Stand wiederholt die Diät keinen Gang — kein Knoten, kein Vorher-Knoten,
// keine geteilte Gruppe zweimal im selben Render. Die Netto-Zeiten sind Richtwerte (die Zeit misst der OMEN).
function diaetUrteil(e) {
    const v = [];
    if (!e || !(e.frames > 0)) return ["DIÄT: kein gerenderter Frame gemessen — die Linse ist blind"];
    const z = e.zahl || {};
    if (!(z.pruef > 0)) v.push("DIÄT: keine Diät-Prüfung gezählt — die Linse ist blind");
    if (e.modus === "ruhe") {
        const w = (z.wiederholtKnoten || 0) + (z.wiederholtVorher || 0) + (z.wiederholtGruppe || 0);
        if (w > 0)
            v.push(
                `RUHE: ${Math.round(w * 10) / 10} wiederholte Gänge je Frame (Knoten ${z.wiederholtKnoten || 0} · Vorher ${z.wiederholtVorher || 0} · Gruppe ${z.wiederholtGruppe || 0}) — dieselbe Arbeit je Programm statt EINMAL je Render`
            );
        // K71: im Stand trägt jeder Voll-Refresh eine Änderung zur GPU — ein Refresh ohne Änderung nennt sein Objekt
        if (z.ohne > 0)
            v.push(
                `RUHE: ${Math.round(z.ohne * 100) / 100} Refreshs ohne Änderung je Frame (${(e.ohneAenderung || []).join(" · ") || "?"}) — die Diät zahlt ohne neuen Eingang`
            );
    }
    return v;
}

function selbsttest() {
    const fehler = [];
    const gruen = { modus: "ruhe", frames: 60, zahl: { pruef: 120, gangKnoten: 66, wiederholtKnoten: 0 } };
    if (diaetUrteil(gruen).length) fehler.push("der grüne Lauf fällt rot: " + diaetUrteil(gruen).join(" · "));
    const faelle = [
        ["Gang je Programm", Object.assign({}, gruen, { zahl: { pruef: 120, wiederholtKnoten: 850, wiederholtGruppe: 70 } }), /RUHE: 920 wiederholte Gänge/],
        ["blind (kein Frame)", { modus: "ruhe", frames: 0, zahl: {} }, /kein gerenderter Frame/],
        ["blind (keine Prüfung)", Object.assign({}, gruen, { zahl: { pruef: 0 } }), /keine Diät-Prüfung/],
        [
            "Refresh ohne Änderung (K71: Satz-Ausschnitt, Senke ohne neue Bytes)",
            Object.assign({}, gruen, { zahl: { pruef: 120, ohne: 6.5 }, ohneAenderung: ["bauSatz: 1.7", "nahWiese:L2:0:0: 0.3"] }),
            /RUHE: 6\.5 Refreshs ohne Änderung je Frame \(bauSatz: 1\.7 · nahWiese:L2:0:0: 0\.3\)/,
        ],
    ];
    for (const [name, e, muss] of faelle) {
        const u = diaetUrteil(e);
        if (!u.some((s) => muss.test(s))) fehler.push(`${name}: das Urteil nennt den Täter nicht (${u.join(" · ") || "grün"})`);
    }
    // Drehen und Gehen dürfen Arbeit tragen (die Änderung) — das Urteil fällt dort nie über Wiederholung.
    if (diaetUrteil(Object.assign({}, gruen, { modus: "drehen", zahl: { pruef: 120, wiederholtKnoten: 5, ohne: 3 } })).length)
        fehler.push("Drehen fällt rot über Wiederholung oder Refresh ohne Änderung");
    return fehler;
}

module.exports = {
    DIAET_INSTALL: `window.__diaetLauf = (o) => (${diaetLauf.toString()})(o);`,
    diaetUrteil,
    selbsttest,
};
