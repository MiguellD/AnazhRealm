// diaet-linse.cjs — DIE DIÄT-LINSE (Welle K, 07.10.): was die Observer-Diät und die Bundles je gerendertem Frame im
// echten Loop arbeiten — und was davon NETTO ihre Arbeit ist. Befund 07.10. (Mess-Wiese, echte GPU, Stand): das
// OMEN-Profil führte `_diaetRefresh` mit 3,77 ms und `_renderBundles` mit 3,43 ms je Frame; beide Zeiten sind
// INKLUSIV und tragen denselben verschachtelten Schatten-Render — er startet am ersten Licht-Empfänger mitten im
// Replay (Pfad szene › replay › Prüfung › Gang › Vorher-Knoten des Schattens), netto 5–9 ms bei 1,3–1,4 Kaskaden je
// Frame, die Diät selbst netto 0,7 (Prüfung) + 1,0 (Gang) ms, der Replay 0,1 ms. Die Linse zählt und zieht jeden
// verschachtelten Bereich vom äußeren ab:
//   Zahl je Frame: Prüfungen · Voll-Refreshs (Grund) · Gänge der Diät über Vorher-Knoten, Knoten und geteilte Gruppen
//                  (und wie viele davon einen Knoten oder eine Gruppe im SELBEN Render wiederholen) · Uploads geteilter
//                  und eigener Gruppen · writeBuffer · Replay-Bürger · Renders
//   Netto je Frame: Prüfung · Gang · Replay · Aufnahme · Voll-Refresh (Knoten · Bindungen · Geometrie) · Schatten-
//                  Render · Szene — und WO der Schatten-Render startet (Pfad der umschließenden Bereiche)
// Urteil (Gebot 7): im Stand wiederholt die Diät keinen Gang (je Knoten und geteilter Gruppe EINMAL je Render).
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
        };
        let c = null;
        const stapel = [];
        let imGang = 0;
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
        const besuch = (art, id) => {
            if (!c) return;
            const k = nf.renderId + ":" + art + ":" + id;
            const v = (c.besuche.get(k) || 0) + 1;
            c.besuche.set(k, v);
            zaehle("gang" + art);
            if (v > 1) zaehle("wiederholt" + art);
        };
        A._diaetRefresh = function (obs, ro, frame, altNR) {
            const v = rahmen("pruef", () => roh.refresh(obs, ro, frame, altNR));
            zaehle("pruef");
            if (frame) c && c.rids.add(frame.renderId);
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
            return roh.ub.call(this, b);
        };
        be.device.queue.writeBuffer = function (buf, off, data, dOff, size) {
            zaehle("writeBuffer");
            zaehle("writeBufferBytes", size != null ? size * (data.BYTES_PER_ELEMENT || 1) : data.byteLength || 0);
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
            return ohneGang(() => rahmen("vollKnoten", () => roh.nUpd.call(this, ro)));
        };
        rend._bindings.updateForRender = function (ro) {
            return ohneGang(() => rahmen("vollBindung", () => roh.bUpd.call(this, ro)));
        };
        rend._geometries.updateForRender = function (ro) {
            return rahmen("vollGeo", () => roh.gUpd.call(this, ro));
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
                    c = { n: {}, ms: {}, grund: {}, schattenPfad: {}, besuche: new Map(), rids: new Set() };
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
    ];
    for (const [name, e, muss] of faelle) {
        const u = diaetUrteil(e);
        if (!u.some((s) => muss.test(s))) fehler.push(`${name}: das Urteil nennt den Täter nicht (${u.join(" · ") || "grün"})`);
    }
    // Drehen und Gehen dürfen Arbeit tragen (die Änderung) — das Urteil fällt dort nie über Wiederholung.
    if (diaetUrteil(Object.assign({}, gruen, { modus: "drehen", zahl: { pruef: 120, wiederholtKnoten: 5 } })).length)
        fehler.push("Drehen fällt rot über Wiederholung");
    return fehler;
}

module.exports = {
    DIAET_INSTALL: `window.__diaetLauf = (o) => (${diaetLauf.toString()})(o);`,
    diaetUrteil,
    selbsttest,
};
