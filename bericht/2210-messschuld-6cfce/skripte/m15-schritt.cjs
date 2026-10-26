// M15 Klang K4 — der Schritt klingt nach dem Stoff am Fuß: der Spieler geht (W gehalten, echte Eingabe) über drei Stoffe
// (Orte gefunden am Gesetz des Schritts `_schrittMaterialAt`, nur zur Wahl des Wegs); der Abgriff ist ein Analyser an
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
    // DIE ORTE JE STOFF AM GESETZ DES SCHRITTS (26.10.): der Fuß-Stoff ist `_schrittMaterialAt` (derselbe Leser wie der Schritt seit
    // stoffe-k1; am alten Boden-Gesetz `_terrainMaterialAt` wählte die Probe Erde und Stein, und der Fuß nannte dort Gras), und er gilt
    // erst, wenn die Boden-Karte am Ort steht (`_bodenSichtAt` ≠ null, ohne sie fehlt das Gras). Ein Ort trägt seine 12-m-Gangstrecke
    // längs −x (yaw −π/2, koerper-bewegung) zu ≥ 80 % in einem trockenen Stoff. Erst die Wiese um den Spawn, dann fern: derselbe Leser
    // vor geladener Karte nennt Kandidaten (Wald-Laub, Fels, Glut …), der Spieler fährt jeden an, und die Strecke wird geprüft, bevor er geht.
    const gesetz = () => {
        const r = window.anazhRealm;
        const mat = (x, z, karte) => (karte && r._bodenSichtAt(x, z) === null ? null : r._schrittMaterialAt(x, z, r._voxelSurfaceY(x, z)));
        const strecke = (x, z, karte, schritt) => {
            const m = mat(x, z, karte);
            if (!m || m === "wasser") return null;
            const n = 3 * (Math.floor(12 / schritt) + 1);
            let fehl = 0;
            for (let d = 0; d <= 12; d += schritt) for (const q of [-0.5, 0, 0.5]) if (mat(x - d, z + q, karte) !== m && ++fehl > 0.2 * n) return null;
            return m;
        };
        window.__m15 = {
            suche(x0, z0, rad, schon) {
                const fund = {};
                for (let rr = 0; rr <= rad && schon.length + Object.keys(fund).length < 3; rr += 3)
                    for (let i = 0, n = Math.max(1, Math.round(rr * 1.2)); i < n; i++) {
                        const x = x0 + Math.cos((i / n) * 6.283) * rr, z = z0 + Math.sin((i / n) * 6.283) * rr;
                        const m = strecke(x, z, true, 1);
                        if (m && !fund[m] && !schon.includes(m) && schon.length + Object.keys(fund).length < 3) fund[m] = [Math.round(x * 10) / 10, Math.round(z * 10) / 10];
                    }
                return fund;
            },
            kandidaten(x0, z0, schon) {
                const je = {}, aus = [];
                for (let rr = 40; rr <= 2500; rr += 25)
                    for (let i = 0; i < 64; i++) {
                        const x = x0 + Math.cos((i / 64) * 6.283) * rr, z = z0 + Math.sin((i / 64) * 6.283) * rr;
                        const m = strecke(x, z, false, 3);
                        if (!m || schon.includes(m) || (je[m] = je[m] || []).length >= 3 || je[m].some((p) => Math.hypot(p[0] - x, p[1] - z) < 150)) continue;
                        je[m].push([x, z]);
                        aus.push({ m, x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10, rr });
                    }
                return aus;
            },
        };
    };
    const hin = (x, z) => page.evaluate((x, z) => { const r = window.anazhRealm; r.state.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z); }, x, z);
    const karteDa = (x, z) =>
        page.waitForFunction((x, z) => window.anazhRealm._bodenSichtAt(x, z) !== null && window.anazhRealm._bodenSichtAt(x - 12, z) !== null, { timeout: 60000 }, x, z).then(() => true, () => false);
    await page.evaluate(gesetz);
    await hin(ort.spieler[0], ort.spieler[1]);
    await karteDa(ort.spieler[0], ort.spieler[1]);
    const orte = await page.evaluate((x, z) => window.__m15.suche(x, z, 120, []), ort.spieler[0], ort.spieler[1]);
    const fahrten = [];
    if (Object.keys(orte).length < 3) {
        const kand = await page.evaluate((x, z, schon) => window.__m15.kandidaten(x, z, schon), ort.spieler[0], ort.spieler[1], Object.keys(orte));
        for (const k of kand) {
            if (Object.keys(orte).length >= 3 || fahrten.length >= 12) break;
            if (orte[k.m]) continue;
            await hin(k.x, k.z);
            const karte = await karteDa(k.x, k.z);
            await warte(1500);
            const neu = karte ? await page.evaluate((x, z, schon) => window.__m15.suche(x, z, 30, schon), k.x, k.z, Object.keys(orte)) : {};
            fahrten.push({ hinweis: k.m, ort: [k.x, k.z], karte, neu: Object.keys(neu) });
            Object.assign(orte, neu);
        }
    }
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
    const erg = { klang, orte, fahrten, stoffe: {} };
    for (const [m, [x, z]] of Object.entries(orte)) {
        await page.evaluate((x, z) => {
            const r = window.anazhRealm, st = r.state;
            st.yaw = -Math.PI / 2; // Richtung wird unten am Weg gemessen
            st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
            window.__abgriffProben.length = 0;
        }, x, z);
        await karteDa(x, z);
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
    console.log(JSON.stringify({ klang, orte, fahrten, stoffe: Object.fromEntries(Object.entries(erg.stoffe).map(([k, v]) => [k, { wegM: v.wegM, bursts: v.bursts, medianHz: v.medianHz, p10: v.p10, p90: v.p90 }])) }));
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
