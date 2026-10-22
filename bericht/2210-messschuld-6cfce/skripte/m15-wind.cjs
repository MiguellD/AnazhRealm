// M15 Klang K2 — gesehen = gehört: 60 s an der Mess-Wiese, der Spiel-Loop läuft, Böen frei, Tiere gehalten.
// Bild: CDP-Screencast des präsentierten Fensters (was der Spieler sieht), Bewegungs-Energie der Halme =
// mittlere |ΔLuma| zwischen Bildern im Boden-Ausschnitt. Ohr: Analyser am Ausgang der Wind-Stimme (Gain hinter dem
// Bandpass, gefunden an der Erzeugung) — RMS. Kreuzkorrelation r beider Reihen (0,5-s-Fenster), Lag-Suche ±3 s.
const fs = require("fs");
const path = require("path");
const { oeffne, klick, warte, WT, klangAn } = require("./spiel.cjs");
const BAND = require(WT + "/scripts/lib/band-urteil.cjs");
const { pngLesen } = require(WT + "/scripts/lib/abnahme-urteil.cjs");
const S = __dirname;
const SEK = Number(process.argv[2] || 60);
const OUT = path.join(S, "roh", "m15-wind.json");

function audioHaken() {
    const B = window.BaseAudioContext || window.AudioContext;
    const bq = B.prototype.createBiquadFilter, gn = B.prototype.createGain;
    window.__paare = [];
    let letzter = null;
    B.prototype.createBiquadFilter = function () {
        const f = bq.apply(this, arguments);
        letzter = f;
        return f;
    };
    B.prototype.createGain = function () {
        const g = gn.apply(this, arguments);
        if (letzter) window.__paare.push({ filter: letzter, gain: g, t: performance.now() });
        letzter = null;
        return g;
    };
}

(async () => {
    const ort = BAND.ladeSpec("wiese").ort;
    const o = await oeffne({ profil: path.join(S, "profil-wind"), vorDoc: [audioHaken, () => { window.__anazhAutoSettlement = false; }] });
    const { page, cdp } = o;
    const klang = await klangAn(page, cdp);
    await klick(cdp); // Zeiger fangen
    await warte(800);
    const stand = await page.evaluate(async (x, z, gier) => {
        const r = window.anazhRealm, st = r.state;
        if (window.__tiereHalten) window.__tiereHalten();
        window.__wetterSetzen && window.__wetterSetzen("sunny");
        st.yaw = gier; st.pitch = -0.12;
        if (st.cameraMode !== "first") r.setCameraMode("first");
        st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
        const dl = performance.now() + 120000;
        while (performance.now() < dl && !(r._weltSteht && r._weltSteht())) await new Promise((f) => setTimeout(f, 250));
        await new Promise((f) => setTimeout(f, 4000));
        const s = st.symphony;
        return { ctx: s.ctx && s.ctx.state, enabled: s.enabled, um: !!s.umwelt, paare: window.__paare.length, steht: r._weltSteht() };
    }, ort.spieler[0], ort.spieler[1], BAND.ortGier(ort));
    // die Wind-Stimme finden: Bandpass unter 1,5 kHz, zuletzt gebaut; Analyser an ihren Gain
    const wahl = await page.evaluate(() => {
        const s = window.anazhRealm.state.symphony;
        const z = s.umwelt.graph.zensus();
        const wind = z.find((v) => v.name === "wind");
        const kand = window.__paare.filter((p) => p.filter.type === "bandpass" && p.filter.frequency.value < 1500 && p.filter.context === s.ctx);
        const p = kand[kand.length - 1];
        if (!p) return { fehler: "keine Wind-Stimme", zensus: z.map((v) => [v.name, v.an, v.db]) };
        const an = s.ctx.createAnalyser();
        an.fftSize = 2048;
        p.gain.connect(an);
        const td = new Float32Array(an.fftSize);
        window.__ohr = [];
        window.__ohrTakt = setInterval(() => {
            an.getFloatTimeDomainData(td);
            let q = 0;
            for (let i = 0; i < td.length; i++) q += td[i] * td[i];
            window.__ohr.push([performance.timeOrigin + performance.now(), Math.sqrt(q / td.length)]);
        }, 50);
        return { wind, hz: p.filter.frequency.value, kandidaten: kand.length, zensus: z.filter((v) => v.an).map((v) => [v.name, +v.db.toFixed(1)]) };
    });
    // Bild: Screencast
    const bilder = [];
    let ziel = null;
    cdp.on("Page.screencastFrame", async (f) => {
        cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
        const png = pngLesen(Buffer.from(f.data, "base64"));
        const W = png.W, H = png.H, d = png.u8;
        // der Boden-Ausschnitt: untere 45 % ohne den Rand, Raster 2 px
        const y0 = Math.floor(H * 0.55), y1 = H - 8, x0 = 8, x1 = W - 8;
        const lum = [];
        for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
            const i = (y * W + x) * 4;
            lum.push(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]);
        }
        bilder.push({ t: f.metadata.timestamp * 1000, lum: Float32Array.from(lum) });
        if (!ziel && bilder.length === 20) ziel = Buffer.from(f.data, "base64");
    });
    const fpsVor = await page.evaluate(async () => {
        let n = 0; const t0 = performance.now();
        await new Promise((res) => { const f = () => (++n < 120 ? requestAnimationFrame(f) : res()); requestAnimationFrame(f); });
        return +(n / ((performance.now() - t0) / 1000)).toFixed(1);
    });
    await cdp.send("Page.startScreencast", { format: "png", everyNthFrame: 3, maxWidth: 960, maxHeight: 540 });
    await warte(SEK * 1000);
    await cdp.send("Page.stopScreencast");
    const ohr = await page.evaluate(() => (clearInterval(window.__ohrTakt), window.__ohr));
    if (ziel) fs.writeFileSync(path.join(S, "roh", "m15-wind-bild.png"), ziel);
    // Reihen in 0,5-s-Fenster
    const t0 = Math.max(bilder[0].t, ohr[0][0]);
    const t1 = Math.min(bilder[bilder.length - 1].t, ohr[ohr.length - 1][0]);
    const FEN = 500;
    const nF = Math.floor((t1 - t0) / FEN);
    const bew = new Array(nF).fill(0), bewN = new Array(nF).fill(0), lau = new Array(nF).fill(0), lauN = new Array(nF).fill(0);
    for (let i = 1; i < bilder.length; i++) {
        const a = bilder[i - 1], b = bilder[i];
        const dt = b.t - a.t;
        if (dt <= 0) continue;
        let s = 0;
        for (let k = 0; k < b.lum.length; k++) s += Math.abs(b.lum[k] - a.lum[k]);
        const e = s / b.lum.length / (dt / 50); // je 50 ms normiert
        const f = Math.floor((b.t - t0) / FEN);
        if (f >= 0 && f < nF) (bew[f] += e), bewN[f]++;
    }
    for (const [t, v] of ohr) {
        const f = Math.floor((t - t0) / FEN);
        if (f >= 0 && f < nF) (lau[f] += v), lauN[f]++;
    }
    const B = [], A = [];
    for (let f = 0; f < nF; f++) if (bewN[f] && lauN[f]) B.push(bew[f] / bewN[f]), A.push(lau[f] / lauN[f]);
    const pear = (x, y) => {
        const n = Math.min(x.length, y.length);
        const mx = x.slice(0, n).reduce((a, b) => a + b, 0) / n, my = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
        let sxy = 0, sxx = 0, syy = 0;
        for (let i = 0; i < n; i++) (sxy += (x[i] - mx) * (y[i] - my)), (sxx += (x[i] - mx) ** 2), (syy += (y[i] - my) ** 2);
        return { r: sxy / Math.sqrt(sxx * syy), n, cvX: Math.sqrt(sxx / n) / mx, cvY: Math.sqrt(syy / n) / my };
    };
    const lags = [];
    for (let L = -6; L <= 6; L++) {
        const x = L >= 0 ? B.slice(L) : B.slice(0, B.length + L);
        const y = L >= 0 ? A.slice(0, A.length - L) : A.slice(-L);
        lags.push({ lagS: L * 0.5, ...pear(x, y) });
    }
    const r0 = lags.find((l) => l.lagS === 0);
    const best = lags.reduce((a, b) => (b.r > a.r ? b : a));
    const erg = { klang, stand, wahl, fpsVor, bilder: bilder.length, ohrProben: ohr.length, fenster: B.length, r0, best, lags, reiheBild: B.map((v) => +v.toFixed(3)), reiheOhr: A.map((v) => +v.toFixed(5)), fehler: o.fehler.slice(0, 5) };
    fs.writeFileSync(OUT, JSON.stringify(erg, null, 1));
    console.log(JSON.stringify({ stand, wahl: { hz: wahl.hz, kand: wahl.kandidaten, zensus: wahl.zensus, fehler: wahl.fehler }, fpsVor, bilder: bilder.length, fenster: B.length, r0, best }));
    await o.browser.close();
})().catch((e) => {
    console.error("FEHLER", e && e.stack);
    process.exit(1);
});
