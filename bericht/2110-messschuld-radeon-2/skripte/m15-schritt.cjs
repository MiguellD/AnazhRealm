// M15 Klang K4 — der Schritt klingt nach dem Stoff am Fuß: der Spieler geht (W gehalten, echte Eingabe) über Erde und
// Stein (Orte gefunden am Boden-Gesetz `_terrainMaterialAt`, nur zur Wahl des Wegs); der Abgriff ist ein Analyser an
// jedem Schritt-Gain (gefunden an der Erzeugung in _playSchrittOneShot). Je Schritt der Spektral-Schwerpunkt des Bursts.
const fs = require("fs");
const path = require("path");
const { oeffne, klick, taste, warte, WT, klangAn } = require("./spiel.cjs");
const BAND = require(WT + "/scripts/lib/band-urteil.cjs");
const S = __dirname;
const OUT = path.join(S, "roh", "m15-schritt.json");

function haken() {
    const B = window.BaseAudioContext || window.AudioContext;
    const gn = B.prototype.createGain;
    window.__schrittGains = [];
    B.prototype.createGain = function () {
        const g = gn.apply(this, arguments);
        const st = new Error().stack || "";
        if (st.includes("_playSchrittOneShot")) {
            window.__schrittGains.push(g);
            if (window.__schrittAbgriff) try { g.connect(window.__schrittAbgriff); } catch (_e) {}
        }
        return g;
    };
}

(async () => {
    const ort = BAND.ladeSpec("wiese").ort;
    const o = await oeffne({ profil: path.join(S, "profil-schritt"), vorDoc: [haken, () => { window.__anazhAutoSettlement = false; }] });
    const { page, cdp } = o;
    const klang = await klangAn(page, cdp);
    await klick(cdp);
    await warte(800);
    // Orte je Stoff: Spirale um die Mess-Wiese, ein Punkt, dessen 12-m-Strecke längs +x denselben Stoff trägt, trocken
    const orte = await page.evaluate((x0, z0) => {
        const r = window.anazhRealm, st = r.state;
        const mat = (x, z) => { const y = r._voxelSurfaceY(x, z); const w = r._koerperWasser(x, z, y); return Number.isFinite(w) && y < w + 0.02 ? "wasser" : r._terrainMaterialAt(x, z, y); };
        const fund = {};
        for (let rad = 0; rad < 2500 && Object.keys(fund).length < 3; rad += 6) {
            for (let a = 0; a < 48; a++) {
                const x = x0 + Math.cos((a / 48) * 6.283) * rad, z = z0 + Math.sin((a / 48) * 6.283) * rad;
                const m = mat(x, z);
                if (fund[m] || !["erde", "stein", "quarz", "glut"].includes(m)) continue;
                let ok = true;
                for (const rr of [3, 6, 10]) for (let b = 0; b < 16 && ok; b++) if (mat(x + Math.cos(b * 0.3927) * rr, z + Math.sin(b * 0.3927) * rr) !== m) ok = false;
                if (ok) fund[m] = [Math.round(x * 10) / 10, Math.round(z * 10) / 10];
            }
        }
        return fund;
    }, ort.spieler[0], ort.spieler[1]);
    // der Abgriff
    await page.evaluate(() => {
        const s = window.anazhRealm.state.symphony;
        const an = s.ctx.createAnalyser();
        an.fftSize = 1024;
        an.smoothingTimeConstant = 0;
        window.__schrittAbgriff = an;
        const fd = new Float32Array(an.frequencyBinCount), td = new Float32Array(an.fftSize);
        window.__abgriffProben = [];
        window.__abgriffTakt = setInterval(() => {
            an.getFloatTimeDomainData(td);
            let q = 0;
            for (let i = 0; i < td.length; i++) q += td[i] * td[i];
            const rms = Math.sqrt(q / td.length);
            if (rms < 1e-4) return;
            an.getFloatFrequencyData(fd);
            const hz = s.ctx.sampleRate / an.fftSize;
            let num = 0, den = 0;
            for (let k = 1; k < fd.length; k++) { const p = Math.pow(10, fd[k] / 10); num += p * k * hz; den += p; }
            window.__abgriffProben.push({ t: performance.now(), rms, schwer: num / den, mat: window.anazhRealm.state._schrittKlang && window.anazhRealm.state._schrittKlang.letzter && window.anazhRealm.state._schrittKlang.letzter.material });
        }, 8);
    });
    const erg = { klang, orte, stoffe: {} };
    for (const [m, [x, z]] of Object.entries(orte)) {
        await page.evaluate((x, z) => {
            const r = window.anazhRealm, st = r.state;
            st.yaw = -Math.PI / 2; // Richtung wird unten am Weg gemessen
            st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
            window.__abgriffProben.length = 0;
        }, x, z);
        await warte(2500);
        const p0 = await page.evaluate(() => { const p = window.anazhRealm.state.playerMesh.position; return [p.x, p.z]; });
        await page.evaluate(() => (window.__abgriffProben.length = 0));
        await taste(cdp, "w", "keyDown");
        await warte(10000);
        await taste(cdp, "w", "keyUp");
        await warte(600);
        const r = await page.evaluate(() => {
            const P = window.__abgriffProben.slice();
            const st = window.anazhRealm.state, k = st._schrittKlang || {};
            // Bursts: Proben-Folgen mit Lücke < 30 ms
            const bursts = [];
            let cur = null;
            for (const p of P) {
                if (!cur || p.t - cur.t1 > 30) bursts.push((cur = { t0: p.t, t1: p.t, w: 0, sw: 0, mats: {} }));
                cur.t1 = p.t; cur.w += p.rms * p.rms; cur.sw += p.rms * p.rms * p.schwer; cur.mats[p.mat] = (cur.mats[p.mat] || 0) + 1;
            }
            const pos = st.playerMesh.position;
            return { bursts: bursts.map((b) => ({ ms: +(b.t1 - b.t0).toFixed(0), schwerHz: Math.round(b.sw / b.w), mat: Object.keys(b.mats).sort((a, c) => b.mats[c] - b.mats[a])[0] })), schritte: k.schritte, p1: [pos.x, pos.z] };
        });
        const sw = r.bursts.map((b) => b.schwerHz).sort((a, b) => a - b);
        erg.stoffe[m] = { ort: [x, z], wegM: +Math.hypot(r.p1[0] - p0[0], r.p1[1] - p0[1]).toFixed(1), bursts: r.bursts.length, medianHz: sw.length ? sw[sw.length >> 1] : null, p10: sw[Math.floor(sw.length * 0.1)], p90: sw[Math.floor(sw.length * 0.9)], labels: r.bursts.map((b) => b.mat), alle: r.bursts };
    }
    erg.fehler = o.fehler.slice(0, 5);
    fs.writeFileSync(OUT, JSON.stringify(erg, null, 1));
    console.log(JSON.stringify({ klang, orte, stoffe: Object.fromEntries(Object.entries(erg.stoffe).map(([k, v]) => [k, { wegM: v.wegM, bursts: v.bursts, medianHz: v.medianHz, p10: v.p10, p90: v.p90 }])) }));
    await o.browser.close();
})().catch((e) => {
    console.error("FEHLER", e && e.stack);
    process.exit(1);
});
// (Nachtrag) Auswertung je Etikett des Schritts: node m15-schritt.cjs --auswerten
if (process.argv[2] === "--auswerten") {
    const j = require(OUT), je = {};
    for (const v of Object.values(j.stoffe)) for (const b of v.alle) (je[b.mat] = je[b.mat] || []).push(b.schwerHz);
    for (const [m, a] of Object.entries(je)) { a.sort((x, y) => x - y); console.log(m, "n", a.length, "median", a[a.length >> 1], "p10", a[Math.floor(a.length * 0.1)], "p90", a[Math.floor(a.length * 0.9)]); }
    process.exit(0);
}
