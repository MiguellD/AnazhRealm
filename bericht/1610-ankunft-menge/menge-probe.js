// menge-probe.js (aus wald-probe.js) — OMEN-Stationslinse; dazu: Ort je Auftrag + erster Blick, Phasen-Marken, Bäcker-Zeiten.
// wald-probe.js — OMEN-Stationslinse (nicht im Repo), eingespritzt ab dem ersten Skript (evaluateOnNewDocument): die WALD-KETTE
// der Ankunft je Auftrag und je Stück mit Zeitstempel (performance.now, ms ab Navigation).
//   auftrag: je Foundry-Auftrag {id, praefix, tQ (in die Schlange), d (m zum Spieler), tS (an den Worker), tA (Antwort), ok}
//   zug:     je Körper-Schlüssel {key, tZ (erste Anfrage), tF (im Cache), ok}
//   frei:    je Ingest [tIn, tFrei] (der Takt gibt frei)
//   bg:      je _foundryBuildGroup [t, ms, preset, lod]
//   region:  je _scatterRegion [t, ms, key, Zustand danach]
//   karte:   ["send"|"ende", t, key, ok]
//   proben:  alle 100 ms {t, streu: [key grund], bauten: {name: n}, karten: [queue, flug], warte, werk, baecker, frei}
//   sync:    die Takt-Marke (OMEN_TAKTMARKE, 1 ms Spin je Sekunde) für das CPU-Profil
function WALD_PROBE() {
    const W = (window.__wald = { auftrag: [], zug: [], frei: [], bg: [], region: [], karte: [], proben: [], sync: [], send: [] });
    const now = () => Math.round(performance.now());
    const idVon = (m) =>
        (m.type || "") + ":" + (m.presetId || "") + "|" + (m.seed != null ? m.seed : "") + "|" + (m.lod != null ? m.lod : "") + (m.vorrat ? "|vorrat" : "");
    const offen = new Map(); // id → [rec] in der Schlange, noch nicht gesendet
    const pm = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (m, ...r) {
        try {
            if (m && m.type === "get-book" && W.buchAnfrage == null) W.buchAnfrage = now();
            if (m && (m.type === "build-asset" || m.type === "bake-impostor")) {
                const id = idVon(m);
                const q = offen.get(id);
                const rec = q && q.shift();
                if (rec) {
                    rec.tS = now();
                    rec.req = m.reqId || null;
                } else W.send.push([now(), id, m.reqId || null]);
            }
        } catch (_e) {}
        return pm.call(this, m, ...r);
    };
    let gewickelt = false;
    const wickle = (P) => {
        const auf = P._foundryAuftrag;
        if (auf)
            P._foundryAuftrag = function (f, praefix, msg, wo, ...rest) {
                let d = null;
                try {
                    const d2 = this._foundryAuftragD2(wo);
                    if (Number.isFinite(d2)) d = Math.round(Math.sqrt(d2));
                } catch (_e) {}
                const id = idVon(msg || {});
                const rec = { id, praefix, tQ: now(), d, tS: null, tA: null, ok: null };
                if (wo && typeof wo === "object" && Number.isFinite(wo.x) && Number.isFinite(wo.z)) {
                    rec.x = Math.round(wo.x * 10) / 10;
                    rec.z = Math.round(wo.z * 10) / 10;
                }
                W.auftrag.push(rec);
                if (!offen.has(id)) offen.set(id, []);
                offen.get(id).push(rec);
                const p = auf.call(this, f, praefix, msg, wo, ...rest);
                p.then((x) => {
                    rec.tA = now();
                    rec.ok = x ? 1 : 0;
                });
                return p;
            };
        const zug = P._foundryZug;
        if (zug)
            P._foundryZug = function (key) {
                const f = this._foundry;
                const neu = !(f && f.zuege && f.zuege.has(key));
                const p = zug.apply(this, arguments);
                if (neu && p && typeof p.then === "function") {
                    const rec = { key, tZ: now(), tF: null, ok: null };
                    W.zug.push(rec);
                    p.then((ok) => {
                        rec.tF = now();
                        rec.ok = ok ? 1 : 0;
                    });
                }
                return p;
            };
        const it = P._foundryIngestTakt;
        if (it)
            P._foundryIngestTakt = function (x) {
                const p = it.call(this, x);
                if (x != null && p && typeof p.then === "function") {
                    const rec = [now(), null];
                    W.frei.push(rec);
                    p.then(() => (rec[1] = now()));
                }
                return p;
            };
        const bg = P._foundryBuildGroup;
        if (bg)
            P._foundryBuildGroup = function (meshes, o) {
                const t0 = performance.now();
                try {
                    return bg.apply(this, arguments);
                } finally {
                    W.bg.push([Math.round(t0), +(performance.now() - t0).toFixed(1), o && o.preset, o && o.lod]);
                }
            };
        const sr = P._scatterRegion;
        if (sr)
            P._scatterRegion = function (rx, rz) {
                const t0 = performance.now();
                try {
                    return sr.apply(this, arguments);
                } finally {
                    let s = null;
                    try {
                        s = this._streuRegionWartet(rx + "," + rz);
                    } catch (_e) {}
                    W.region.push([Math.round(t0), +(performance.now() - t0).toFixed(1), rx + "," + rz, s]);
                }
            };
        const ib = P._impostorBakeSende;
        if (ib)
            P._impostorBakeSende = function (at, flug) {
                const vor = new Set(flug.keys());
                const n = ib.apply(this, arguments);
                if (n > 0) for (const k of flug.keys()) if (!vor.has(k)) W.karte.push(["send", now(), k, null]);
                return n;
            };
        const ibk = P._foundryIngestBook;
        if (ibk)
            P._foundryIngestBook = function (m) {
                try {
                    if (W.buchAn == null) {
                        W.buchAn = now();
                        W.buchWorker = (m && m._omen) || null;
                    }
                } catch (_e) {}
                return ibk.apply(this, arguments);
            };
        const fa = P._foundryAntwort;
        if (fa)
            P._foundryAntwort = function (f, m) {
                try {
                    if (m && m.type === "impostor")
                        W.backe.push([now(), m.reqId || null, m.presetId || null, m.seed, Object.assign({}, m._omen || {}, { kodier: m._omenKod, schreib: m._omenSchreib, platte: m.platte ? 1 : 0 })]);
                } catch (_e) {}
                return fa.apply(this, arguments);
            };
        const ke = P._karteEndet;
        if (ke)
            P._karteEndet = function (z, ok) {
                W.karte.push(["ende", now(), z && (z.key || z.name || z.id || null), ok ? 1 : 0]);
                return ke.apply(this, arguments);
            };
    };
    setInterval(() => {
        const r = window.anazhRealm;
        if (!r || !r.state) return;
        if (!gewickelt) {
            gewickelt = true;
            wickle(Object.getPrototypeOf(r));
        }
        if (W.zuEnde) return;
        const st = r.state;
        const o = { t: now() };
        try {
            const pm2 = st.playerMesh;
            if (pm2) {
                const liste = [];
                r._streuWartet(pm2.position, liste);
                o.streu = liste;
                const p = pm2.position;
                const R = Number.isFinite(st.architectureCullingRadius) ? st.architectureCullingRadius : 150;
                const b = {};
                for (const e of st.architectures || []) {
                    if (!e || !e.position) continue;
                    const dx = e.position.x - p.x,
                        dz = e.position.z - p.z;
                    if (dx * dx + dz * dz <= R * R && !r._archIsRendered(e)) {
                        const n = String(e.preset || e.presetId || e.blueprintName || e.name || e.kind || e.type || "?");
                        b[n] = (b[n] || 0) + 1;
                    }
                }
                o.bauten = b;
            }
            o.karten = [(r._impostorBakeQueue || []).length, r._impostorBakeFlug ? r._impostorBakeFlug.size : 0];
            const f = r._foundry;
            if (f) {
                o.warte = (f.warte || []).length;
                let werk = 0,
                    baecker = 0;
                for (const k of (f.pending && f.pending.keys()) || []) String(k).startsWith("imp") ? baecker++ : werk++;
                o.werk = werk;
                o.baecker = baecker;
            }
            o.frei = (r._foundryIngestQueue || []).length;
            if (st._weltbildDa) W.zuEnde = true;
        } catch (e) {
            o.fehler = String(e && e.message);
        }
        W.proben.push(o);
    }, 100);
    // DIE PHASEN 0 → Weltbild: die erste Zeit je Marke (20 ms-Poll ab dem ersten Skript)
    W.phase = {};
    const mark = (k, ok) => {
        if (ok && W.phase[k] == null) W.phase[k] = now();
    };
    const phasenPoll = setInterval(() => {
        try {
            mark("dom-interaktiv", document.readyState !== "loading");
            mark("dom-fertig", document.readyState === "complete");
            const r = window.anazhRealm;
            mark("instanz", !!r);
            if (!r || !r.state) return;
            const st = r.state;
            mark("renderer", !!st.renderer);
            mark("renderer-bereit", !!st.rendererReady);
            const f = r._foundry;
            mark("foundry", !!f);
            mark("foundry-worker", !!(f && f.worker));
            mark("buch", !!(f && f.ready && f.recipes));
            mark("erster-chunk", !!(st.voxelChunks && st.voxelChunks.size > 0));
            mark("spieler", !!st.playerMesh);
            try {
                const ring = r._builtRingRadius();
                mark("ring-0", ring != null && ring >= 0);
            } catch (_e) {}
            if (st._weltbildDa) {
                mark("weltbild", true);
                clearInterval(phasenPoll);
            }
        } catch (_e) {}
    }, 20);
    // DIE BÄCKER-ZEITEN: die Antwort jeder Karte trägt im Stations-Bäcker `payload._omen` (Bau · Ansichten · Atlas · Lesen · Programme)
    W.backe = [];
    const lies = (d) => {
        try {
            if (d && d.payload && d.payload._omen) W.backe.push([now(), d.reqId || null, d.presetId || null, d.seed, d.payload._omen]);
        } catch (_e) {}
    };
    const od = Object.getOwnPropertyDescriptor(Worker.prototype, "onmessage");
    if (od && od.set)
        Object.defineProperty(Worker.prototype, "onmessage", {
            configurable: true,
            get: od.get,
            set(fn) {
                od.set.call(this, typeof fn === "function" ? function (e) { lies(e && e.data); return fn.call(this, e); } : fn);
            },
        });
    const ae = Worker.prototype.addEventListener;
    Worker.prototype.addEventListener = function (typ, fn, ...r) {
        if (typ === "message" && typeof fn === "function") {
            const g = function (e) { lies(e && e.data); return fn.call(this, e); };
            return ae.call(this, typ, g, ...r);
        }
        return ae.call(this, typ, fn, ...r);
    };
    // DER ERSTE BLICK: beim ersten Weltbild je Auftrag mit Ort — liegt er im Kegel der Spieler-Kamera (Boden + 10 m)?
    const blickPoll = setInterval(() => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state._weltbildDa || W.blick) return;
        clearInterval(blickPoll);
        try {
            const st = r.state, cam = st.camera, pm = st.playerMesh;
            cam.updateMatrixWorld(true);
            const V = cam.matrixWorldInverse.elements, Pm = cam.projectionMatrix.elements;
            const y0 = pm ? pm.position.y : 0;
            const sicht = (x, y, z) => {
                const vx = V[0] * x + V[4] * y + V[8] * z + V[12], vy = V[1] * x + V[5] * y + V[9] * z + V[13];
                const vz = V[2] * x + V[6] * y + V[10] * z + V[14];
                const cx = Pm[0] * vx + Pm[4] * vy + Pm[8] * vz + Pm[12], cy = Pm[1] * vx + Pm[5] * vy + Pm[9] * vz + Pm[13];
                const cw = Pm[3] * vx + Pm[7] * vy + Pm[11] * vz + Pm[15];
                return cw > 0 && Math.abs(cx / cw) <= 1.1 && Math.abs(cy / cw) <= 1.1;
            };
            let n = 0;
            for (const a of W.auftrag)
                if (Number.isFinite(a.x)) {
                    a.blick = sicht(a.x, y0, a.z) || sicht(a.x, y0 + 10, a.z) ? 1 : 0;
                    n++;
                }
            W.blick = { t: now(), n, kamera: [cam.position.x, cam.position.y, cam.position.z].map((v) => Math.round(v * 10) / 10), fov: cam.fov };
        } catch (e) {
            W.blick = { fehler: String(e && e.message) };
        }
    }, 50);
    function OMEN_TAKTMARKE() {
        const t = performance.now();
        while (performance.now() - t < 1) {}
        return t;
    }
    setInterval(() => W.sync.push(Math.round(OMEN_TAKTMARKE())), 1000);
}
module.exports = { WALD_PROBE };
