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
    function OMEN_TAKTMARKE() {
        const t = performance.now();
        while (performance.now() - t < 1) {}
        return t;
    }
    setInterval(() => W.sync.push(Math.round(OMEN_TAKTMARKE())), 1000);
}
module.exports = { WALD_PROBE };
