// Teile der Horizont-Zerlegung: der Faden-Haken (Text-Tausch im voxel-worker.js), der Seiten-Haken und die Zeile.
"use strict";

// IM FADEN: je Nachricht Ankunft (onmessage), Start (Reihe), Ende (Antwort) und der Halt der Reihe auf die Regionen
// (`hydroVom`: Halt ab state-set, da mit `fertig`); die Zeiten absolut (timeOrigin + now), die Seite rechnet sie um.
const FADEN_TAUSCH = [
    [
        "self.onmessage = function (e) {",
        "var __ZT = () => performance.timeOrigin + performance.now();\nvar __Z = { halt: null, da: null, reg: 0 };\nvar __cur = null;\n" +
            "var __pm = self.postMessage.bind(self);\n" +
            "self.postMessage = function (m, t) {\n" +
            "    if (m && __cur && m.requestId && (m.type === 'fern-result' || m.type === 'fern-teilung-result'))\n" +
            "        m.__zeit = { an: __cur.__an, start: __cur.__start, ende: __ZT(), halt: __Z.halt, da: __Z.da, reg: __Z.reg };\n" +
            "    return __pm(m, t || []);\n};\n" +
            "self.onmessage = function (e) {\n    e.__an = __ZT();",
    ],
    ["nachricht(reihe.shift());", "{ const __e = reihe.shift(); __e.__start = __ZT(); __cur = __e; nachricht(__e); __cur = null; }"],
    ["function hydroVom(port) {\n    reiheHaelt = true;", "function hydroVom(port) {\n    reiheHaelt = true;\n    __Z.halt = __ZT();"],
    [
        "        if (!e.data.fertig) return void hydroSetzen(e.data.key, e.data.region);",
        "        if (e.data.fertig) __Z.da = __ZT(); else __Z.reg++;\n        if (!e.data.fertig) return void hydroSetzen(e.data.key, e.data.region);",
    ],
];
function fadenTausch(text) {
    for (const [a, b] of FADEN_TAUSCH) {
        if (text.split(a).length !== 2) throw new Error("Faden-Haken: der Anker fehlt oder ist doppelt: " + a.slice(0, 60));
        text = text.replace(a, () => b);
    }
    return text;
}
const faedenWandle = (p, roh) => (roh && /\/voxel-worker\.js$/.test(p) ? Buffer.from(fadenTausch(roh.toString("utf8"))) : roh);

// IN DER SEITE: die Geburt jedes Neben-Fadens, je Auftrag Senden und Antwort samt der Zeiten des Fadens, je 100 ms der Stand
// des Horizonts (Ring bereit, Fortschritt, geteilt, Feld-Läufe, Panorama-Läufe, Voxel-Aufträge offen, Chunks).
function SEITE_HAKEN() {
    const H = (window.__hz = { faeden: {}, auftraege: [], status: [], zeugen: [], karte: {} });
    const jetzt = () => Math.round(performance.now());
    const warte = setInterval(() => {
        const A = typeof AnazhRealm !== "undefined" ? AnazhRealm : null;
        // erst, wenn jede Zone des Stamms getragen ist (die Instanz steht) — sonst ist der Haken ein Zwilling
        if (!A || !window.anazhRealm || !A.prototype._nebenAuftrag || A.prototype._nebenAuftrag.__hz) return;
        const nf = A.prototype._nebenFaden;
        A.prototype._nebenFaden = function (name) {
            const vor = !!(this._nebenFaeden && this._nebenFaeden.has(name));
            const f = nf.apply(this, arguments);
            if (f && !vor) H.faeden[name] = [jetzt(), this.state && this.state.voxelWorkerPending ? this.state.voxelWorkerPending.size : -1];
            return f;
        };
        const na = A.prototype._nebenAuftrag;
        A.prototype._nebenAuftrag = function (name, msg) {
            const st = this.state;
            const e = {
                name,
                art: msg && (msg.art || msg.type),
                n: msg && msg.punkte ? msg.punkte.length / 2 : msg && msg.nz ? msg.nx * msg.nz : 0,
                t: jetzt(),
                nach: !!(st && st._weltbildDa),
            };
            H.auftraege.push(e);
            const p = na.apply(this, arguments);
            p.then(
                (m) => {
                    e.ant = jetzt();
                    const z = m && m.__zeit;
                    if (z) {
                        const o = performance.timeOrigin;
                        const r = (v) => (Number.isFinite(v) ? Math.round(v - o) : null);
                        Object.assign(e, { an: r(z.an), start: r(z.start), ende: r(z.ende), halt: r(z.halt), da: r(z.da), reg: z.reg });
                    }
                },
                () => (e.fehl = 1)
            );
            return p;
        };
        A.prototype._nebenAuftrag.__hz = true;
        // DIE ZEUGEN DER LÜCKEN bis zum Bild (je ≥ 250 ms aus dem Ruf des Spiels oder der Probe): die Terme und der Täter der Bauten
        const wl = A.prototype._weltbildLuecken;
        A.prototype._weltbildLuecken = function (rundum) {
            const L = wl.apply(this, arguments);
            const t = performance.now();
            if (!rundum && !(this.state && this.state._weltbildDa) && !(t - (H._zt || 0) < 250) && H.zeugen.length < 160) {
                H._zt = t;
                const b = L.find((l) => l.term === "bauten");
                let z = "";
                try {
                    z = b ? this._lueckeTaeter(b) || "" : "";
                } catch (e) {
                    z = "Täter warf: " + e.message;
                }
                H.zeugen.push([Math.round(t), b ? b.n : 0, String(z).slice(0, 110), L.map((l) => l.term[0] + (l.term === "horizont" ? "(" + l.satz.split(" ").pop() + ")" : "")).join("")]);
            }
            return L;
        };
        // DIE HORIZONT-KARTE: wann sie entsteht (der erste Leser im Stoff), wann ihr Gitter bestellt wird und wann sie malt
        const hk = A.prototype._horizontKarte;
        A.prototype._horizontKarte = function () {
            if (!H.karte.da) H.karte.da = jetzt();
            return hk.apply(this, arguments);
        };
        const kt = A.prototype._horizontKarteTakt;
        A.prototype._horizontKarteTakt = function () {
            const K = this.state.horizontKarte;
            const m0 = K ? K.malZahl : 0;
            const t0 = performance.now();
            const o = kt.apply(this, arguments);
            const ms = performance.now() - t0;
            H.karte.taktMs = (H.karte.taktMs || 0) + (this.state._weltbildDa ? 0 : ms);
            if (K && K.malZahl > m0 && !H.karte.gemalt) H.karte.gemalt = jetzt();
            return o;
        };
        clearInterval(warte);
    }, 5);
    setInterval(() => {
        if (window.__kalt) window.__kalt.hz = H; // die Kalt-Zeile legt `__kalt` ins JSON
        const r = window.anazhRealm;
        if (!r || !r.state) return;
        const st = r.state;
        if (!window.__hzImmer && st._weltbildDa && performance.now() - st._weltbildDa > 1500) return;
        const fr = st.fernRing;
        const fp = st.feldPass;
        let geteilt = 0;
        try {
            geteilt = fr && fr.ready && r._fernRingGeteilt(fr) ? 1 : 0;
        } catch {}
        H.status.push([
            jetzt(),
            fr ? (fr.ready ? 1 : 0) : -1,
            fr && fr.totalVerts ? Math.round((1000 * fr.cursor) / fr.totalVerts) / 10 : 0,
            geteilt,
            fp ? fp.laeufe : -1,
            fp ? fp.panoLaeufe | 0 : -1,
            st.voxelWorkerPending ? st.voxelWorkerPending.size : -1,
            st.voxelChunks ? st.voxelChunks.size : 0,
        ]);
        if (st._weltbildDa) H.bild = Math.round(st._weltbildDa);
    }, 100);
}

// DIE ZEILE: je Boot der Weg des Horizonts bis zum Bild (s ab Navigation): die Fäden (Geburt, offene Voxel-Aufträge), der Ring
// (Scheiben, erste Bestellung, Halt der Reihe auf die Regionen, erster Start, letztes Ende, Σ Rechnen, längstes Warten in der
// Reihe), die Teilung, das Feld (gesendet, im Faden, Halt, Start, Ende, Antwort), der Stand (Ring bereit, geteilt, Feld, Panorama),
// Gitter/Krone/Kamm vor dem Bild, die Horizont-Karte (da, gemalt) und das Bild. `alle`: auch Aufträge nach dem Bild.
const s = (ms) => (Number.isFinite(ms) ? (ms / 1000).toFixed(2) : "–");
function zeile(H, pre, alle) {
    const A = H.auftraege || [];
    const vor = (L) => L.filter((e) => alle || !e.nach);
    const art = (a) => vor(A.filter((e) => e.art === a));
    const sum = (L, f) => L.reduce((m, e) => m + (f(e) || 0), 0);
    const fa = Object.entries(H.faeden || {}).map(([k, v]) => `${k} ${s(v[0])}(${v[1]})`).join(" ");
    const ring = art("ring");
    const rz = ring.filter((e) => e.ende != null);
    const r0 = rz[0] || {};
    const ringTxt = ring.length
        ? `RING ${ring.length}×${sum(ring, (e) => e.n)}P ab ${s(ring[0].t)} Halt ${s(r0.halt)}→${s(r0.da)}(${r0.reg}) Start ${s(r0.start)} Ende ${s(Math.max(...rz.map((e) => e.ende)))} Σ${s(sum(rz, (e) => e.ende - e.start))} warte≤${s(Math.max(0, ...rz.map((e) => e.start - e.an)))}`
        : "RING –";
    const tei = vor(A.filter((e) => /teilung/.test(e.art)));
    const teiTxt = tei.length ? `TEIL ${tei.length}× ${s(tei[0].t)}→${s(Math.max(...tei.map((e) => e.ant || 0)))}` : "TEIL –";
    const f0 = art("feld")[0];
    const feldTxt = f0
        ? `FELD ${f0.n}P ab ${s(f0.t)} im Faden ${s(f0.an)} Halt ${s(f0.halt)}→${s(f0.da)}(${f0.reg}) Start ${s(f0.start)} Ende ${s(f0.ende)} (${s(f0.ende - f0.start)}) Antw ${s(f0.ant)}`
        : "FELD –";
    const St = H.status || [];
    const erst = (f) => (St.find(f) || [])[0];
    const K = H.karte || {};
    const kr = art("krone");
    return (
        `${pre} FÄDEN ${fa} · ${ringTxt} · ${teiTxt} · ${feldTxt} · Ring ${s(erst((x) => x[1] === 1))} geteilt ${s(erst((x) => x[3] === 1))} ` +
        `Feld ${s(erst((x) => x[4] > 0))} Pano ${s(erst((x) => x[5] > 0))} · Gitter ${art("gitter").length} Krone ${kr.length}/${s(sum(kr.filter((e) => e.ende != null), (e) => e.ende - e.start))} Kamm ${art("kamm").length} · ` +
        `HKarte ${s(K.da)}/${s(K.gemalt)}/${Math.round(K.taktMs || 0)}ms · Bild ${s(H.bild)}`
    );
}

module.exports = { FADEN_TAUSCH, fadenTausch, faedenWandle, SEITE_HAKEN, zeile };
