// fluss-linse.cjs — DIE FLUSS-LINSE (V18.511): was der Foundry-Kanal den HAUPT-Thread kostet. Befund 02.10.:
// 262 Studio-Assets = 404 MB liefen beim Boot durch den Haupt-Thread (Klon beim Empfang Σ 600 ms, IDB-Put Σ 3,7 s,
// max 207 ms, IDB-Gets hinter den Schreib-Transaktionen Median 3,3 s) — kein Gate sah es, weil jede Zahl nur je
// Auftrag klein wirkt. Die Linse hängt sich an den Worker-Kanal und misst je Antwort: Bytes, die Entpack-Zeit im
// Haupt-Thread (Chromium deserialisiert beim ersten `ev.data`-Zugriff), die Worker-Arbeit (FIFO: Antwort minus
// max(Senden, vorige Antwort)), das Warten, den Gruppen-Bau und den Ingest-Takt; dazu die Platte, falls der
// Haupt-Thread sie noch anfasst (`_foundryIdbGet/_foundryIdbPut` — seit der Transport-Schale fort).
//
//   Seite:     window.__flussLinse() installiert (idempotent) · window.__flussBericht() → { kanal, haupt, … }
//              FLUSS_INSTALL legt die Linse SELBST an, sobald der Foundry-Worker geboren ist (vor seiner ersten
//              Antwort — sonst sähe sie den Boot-Vorlauf nicht) und stempelt, wann die Bibliothek steht.
//   Werkbank:  node scripts/werkbank.cjs fluss          (der Bericht)

function flussLinse() {
    const r = window.anazhRealm;
    const f = r && r._foundry;
    if (!f || !f.worker) return { fehler: "kein Foundry-Worker" };
    if (window.__fluss) return { schon: true };
    const L = (window.__fluss = { send: new Map(), done: [], idb: [], idbPut: [], bau: [], ingest: [] });
    const bytesOf = (x, seen) => {
        if (!x || typeof x !== "object") return 0;
        if (ArrayBuffer.isView(x) || x instanceof ArrayBuffer) return x.byteLength;
        if (seen.has(x)) return 0;
        seen.add(x);
        let s = 0;
        for (const k in x) s += bytesOf(x[k], seen);
        return s;
    };
    const w = f.worker;
    const pm = w.postMessage.bind(w);
    w.postMessage = function (msg, tr) {
        if (msg && msg.reqId)
            L.send.set(msg.reqId, {
                type: msg.type,
                p: msg.presetId,
                s: msg.seed,
                lod: msg.lod,
                ov: !!msg.ov,
                t: performance.now(),
            });
        return pm(msg, tr);
    };
    const om = w.onmessage;
    w.onmessage = function (ev) {
        const t0 = performance.now();
        const m = ev.data;
        const des = performance.now() - t0;
        const bytes = bytesOf(m, new Set());
        const t1 = performance.now();
        om.call(this, ev);
        const s = m && m.reqId ? L.send.get(m.reqId) : null;
        L.done.push({
            type: m && m.type,
            p: s && s.p,
            lod: s && s.lod,
            tSend: s ? s.t : null,
            tRep: t0,
            des,
            h: performance.now() - t1,
            bytes,
            platte: !!(m && m.platte),
        });
    };
    if (typeof r._foundryIdbGet === "function") {
        const ig = r._foundryIdbGet.bind(r);
        r._foundryIdbGet = (p, s, lod, sea) => {
            const t = performance.now();
            return ig(p, s, lod, sea).then((x) => {
                L.idb.push({ hit: !!x, ms: performance.now() - t });
                return x;
            });
        };
    }
    if (typeof r._foundryIdbPut === "function") {
        const ip = r._foundryIdbPut.bind(r);
        r._foundryIdbPut = (p, s, lod, sea, meshes) => {
            const t = performance.now();
            ip(p, s, lod, sea, meshes);
            L.idbPut.push({ ms: performance.now() - t });
        };
    }
    const bg = r._foundryBuildGroup.bind(r);
    r._foundryBuildGroup = (meshes, stage) => {
        const t = performance.now();
        const g = bg(meshes, stage);
        L.bau.push({ ms: performance.now() - t });
        return g;
    };
    const it = r._foundryIngestTakt.bind(r);
    r._foundryIngestTakt = (x) => {
        const t = performance.now();
        return it(x).then((y) => {
            if (x != null) L.ingest.push(performance.now() - t);
            return y;
        });
    };
    return { installiert: true, offen: f.pending.size };
}

function flussBericht() {
    const L = window.__fluss;
    if (!L) return { fehler: "Linse nicht installiert" };
    const r = window.anazhRealm;
    const pct = (a, q) => {
        if (!a.length) return 0;
        const s = [...a].sort((x, y) => x - y);
        return s[Math.min(s.length - 1, Math.floor(q * s.length))];
    };
    const sum = (a, k) => a.reduce((s, x) => s + (k ? x[k] : x), 0);
    const r1 = (x) => Math.round(x * 10) / 10;
    const kanal = {};
    for (const d of L.done) {
        const k = kanal[d.type] || (kanal[d.type] = { n: 0, mb: 0, desMs: 0, desMax: 0, platte: 0 });
        k.n++;
        k.mb += d.bytes / 1e6;
        k.desMs += d.des;
        k.desMax = Math.max(k.desMax, d.des);
        if (d.platte) k.platte++;
    }
    for (const k of Object.values(kanal)) {
        k.mb = r1(k.mb);
        k.desMs = Math.round(k.desMs);
        k.desMax = r1(k.desMax);
    }
    // Worker-Auslastung (FIFO): Arbeit = Antwort − max(Senden, vorige Antwort) — nur Aufträge mit Sende-Stempel.
    const mitStempel = L.done.filter((d) => d.tSend != null).sort((a, b) => a.tRep - b.tRep);
    let prev = -Infinity,
        arbeit = 0;
    const warte = [];
    for (const d of mitStempel) {
        const start = Math.max(d.tSend, prev);
        arbeit += d.tRep - start;
        warte.push(Math.max(0, start - d.tSend));
        prev = d.tRep;
    }
    const span = mitStempel.length
        ? mitStempel[mitStempel.length - 1].tRep - Math.min(...mitStempel.map((d) => d.tSend))
        : 0;
    const f = r._foundry;
    const des = L.done.map((d) => d.des);
    const ankunft = L.done.map((d) => d.tRep / 1000);
    return {
        kanal,
        // Ankunfts-Fenster (Sekunden seit Seitenstart): erste und letzte Worker-Antwort — der Fluss selbst, ohne den
        // Ingest-Takt (der in einer ruhenden Werkbank-Welt nicht tickt).
        ersteS: ankunft.length ? r1(Math.min(...ankunft)) : null,
        letzteS: ankunft.length ? r1(Math.max(...ankunft)) : null,
        haupt: {
            entpackenMs: Math.round(sum(des)),
            entpackenMax: r1(Math.max(0, ...des)),
            idbPutMs: Math.round(sum(L.idbPut, "ms")),
            idbPutMax: r1(Math.max(0, ...L.idbPut.map((x) => x.ms))),
            idbGetP50: Math.round(
                pct(
                    L.idb.map((x) => x.ms),
                    0.5
                )
            ),
            bauMs: Math.round(sum(L.bau, "ms")),
            bauMax: r1(Math.max(0, ...L.bau.map((x) => x.ms))),
            bauN: L.bau.length,
        },
        worker: {
            auslastung: span ? Math.round((arbeit / span) * 100) / 100 : 0,
            warteP50s: r1(pct(warte, 0.5) / 1000),
            warteP95s: r1(pct(warte, 0.95) / 1000),
        },
        ingest: { n: L.ingest.length, warteP95s: r1(pct(L.ingest, 0.95) / 1000), maxQ: r._foundryIngestMaxQ || 0 },
        cacheMB: r1((f.cacheBytes || 0) / 1e6),
        // Die Fernstufe: der EINE Karten-Atlas (W6) — Zellen, gebacken, davon von der Platte, Atlas-MB, Format.
        karten: (() => {
            const z = typeof r._impostorCensus === "function" ? r._impostorCensus() : null;
            return z
                ? { n: z.zellen, gebacken: z.gebacken, vonPlatte: z.vonPlatte, mb: z.mb, fmt: z.fmt, schichten: z.schichten }
                : { n: 0, gebacken: 0, vonPlatte: 0, mb: 0, fmt: null, schichten: 0 };
        })(),
        heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : null,
        offen: f.pending.size,
        // Wann die Boot-Bibliothek (Prefetch + kritische Arten + Siedlungs-Probe) stand — Sekunden seit Seitenstart.
        bibliothekS: window.__flussBibliothekS || null,
    };
}

// Die Selbst-Installation: wartet auf die Geburt des Foundry-Workers (der Boot weist `f.worker` und `onmessage` in
// EINEM synchronen Block zu, die erste Anfrage folgt erst nach dessen `ready`) und stempelt die stehende Bibliothek.
function flussAuto() {
    const t = setInterval(() => {
        const r = window.anazhRealm;
        const f = r && r._foundry;
        if (f && f.worker && !window.__fluss) window.__flussLinse();
        if (f && f._warmCritical && !window.__flussBibliothekS) {
            window.__flussBibliothekS = Math.round(performance.now() / 100) / 10;
            clearInterval(t);
        }
    }, 20);
}

module.exports = {
    FLUSS_INSTALL: `window.__flussLinse = ${flussLinse.toString()}; window.__flussBericht = ${flussBericht.toString()}; (${flussAuto.toString()})();`,
};
