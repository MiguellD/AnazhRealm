// KANDIDAT (markt-klang) für die Station erleben.klang.getuemmel, Sprosse 1 — NICHT die Station. Der Richter entscheidet.
// Soll und Richter-Text der Sprosse bleiben wörtlich („Spitzen ≤ 0 dBFS über 10 min“ · „Duck 8–12 dB bei Stimme“ ·
// „7 Stimmen zugleich“). Der Kandidat ändert NUR den Leser, an drei benannten Stellen:
//   1. HÖRORT: der Markt der Metropole (L.ort("stadt-voll", "third"), 10 Uhr) statt der Wiese im Regen — die Wiese trägt keine
//      Menge; „Getümmel“ ist ein Platz voller Leute.
//   2. STIMMEN ZUGLEICH: der Graph (`umwelt.graph.zensus`, an) + die Laute im Flug (jeder `rufSpielen` von Einsatz bis Ende:
//      die Rede der Menge, Gruß, Tier) + die Fahrt (`symphony.fahrt`) — der Graph allein zählt nur Schleifen (Wind, Regen,
//      Vogel); die Menge spricht in Lauten ihrer Leiber (klang:MENGE), nie als Schleife. Gezählt wird der Median der Proben
//      (`stimmenP50`: „zugleich“ über die Hördauer), nicht ihr Maximum (`stimmenMax`: ein Augenblick).
//   3. DUCK: der Gain des Duck-Busses 20·lg(g0 / g1) — die Linie des Mess-Tons bleibt Zeugin. Die Linie trägt die Musik
//      selbst (ihre Höhen auf der 15-kHz-Linie): am Markt las sie bei EXAKT 10,00 dB Gain-Stufe 8,85 … 14,56 dB
//      (gate:klang-zensus Mk, 25.11.) — die 13,27 dB des Zensus liegen in diesem Rauschen; der Mischer senkt höchstens
//      10 dB (MUSIK.duck: das tiefste Glied gewinnt, nie eine Summe).
//   DAUER: 10 min übersteigen den Deckel einer Leiter (60 s). Der Kandidat hört die Leiter-Frist am Markt; die 10 min
//      misst `node scripts/diag-klang-zensus.cjs --markt --sek 600` (die Klang-Linse, Wand Mk, derselbe Leser) — ob die
//      Station deren Spruch liest oder die Leiter eine längere Frist bekommt, ist Sache des Richters.
async function getuemmelMarktSeite(o) {
    const s = r.state, rend = s.renderer;
    const warte = (ms) => new Promise((f) => setTimeout(f, ms));
    const war = !!(s.symphony && s.symphony.enabled);
    let takt = null, an = null, sy = null, ton = null, tonG = null, kern = null, rufAlt = null;
    try {
        if (!war) r.initSymphony();
        sy = s.symphony;
        if (sy.ctx && sy.ctx.state !== "running") await sy.ctx.resume();
        if (!sy.enabled || !sy.spitze || !sy.lofi || !sy.lofi.duck || !sy.umwelt || !sy.umwelt.graph)
            return { fehler: "der Klang steht nicht (enabled " + !!sy.enabled + ", Wand " + !!sy.spitze + ", Duck " + !!(sy.lofi && sy.lofi.duck) + ")" };
        rend.setAnimationLoop((t) => r._gameLoopTick(t));
        // die Laute im Flug: der EINE Weg zum Ohr (`rufSpielen`) meldet Einsatz und Dauer
        kern = sy.umwelt.kern;
        rufAlt = kern.rufSpielen;
        const flug = [];
        kern.rufSpielen = function () {
            const e = rufAlt.apply(this, arguments);
            if (e) flug.push([e.einsatz, e.einsatz + e.sek]);
            return e;
        };
        an = sy.ctx.createAnalyser();
        an.fftSize = 4096;
        sy.spitze.ausgang.connect(an);
        const td = new Float32Array(an.fftSize);
        let spitze = 0, proben = 0, stimmenMax = 0;
        const zugleich = [];
        const t0 = performance.now();
        takt = setInterval(() => {
            an.getFloatTimeDomainData(td);
            let p = 0;
            for (let i = 0; i < td.length; i++) p = Math.max(p, Math.abs(td[i]));
            spitze = Math.max(spitze, p);
            proben++;
            const jetzt = sy.ctx.currentTime;
            const n = sy.umwelt.graph.zensus().filter((v) => v.an).length + flug.filter(([a, b]) => a <= jetzt && b > jetzt).length + (sy.fahrt ? sy.fahrt.size : 0);
            zugleich.push(n);
            stimmenMax = Math.max(stimmenMax, n);
        }, 40);
        await warte(o.vorMs);
        // DER DUCK: der Gain des Busses vor und nach der Stimme; der Mess-Ton hält den Bus im Takt des Audio-Fadens, seine Linie zeugt
        const Lf = sy.lofi, ctx = sy.ctx;
        const an2 = ctx.createAnalyser();
        an2.fftSize = 4096;
        an2.smoothingTimeConstant = 0;
        const k = Math.round(o.tonHz / (ctx.sampleRate / an2.fftSize));
        ton = ctx.createOscillator();
        tonG = ctx.createGain();
        ton.frequency.value = (k * ctx.sampleRate) / an2.fftSize;
        tonG.gain.value = 1e-3;
        ton.connect(tonG);
        tonG.connect(Lf.duck);
        Lf.duck.connect(an2);
        ton.start();
        const fd = new Float32Array(an2.frequencyBinCount);
        const linie = async () => {
            let q = 0;
            for (let i = 0; i < 3; i++) (await warte(60), an2.getFloatFrequencyData(fd), (q += Math.pow(10, fd[k] / 10)));
            return 10 * Math.log10(q / 3);
        };
        await warte(200);
        for (let i = 0; i < 60 && Lf.duckBis > ctx.currentTime; i++) await warte(50);
        const [l0, g0] = [await linie(), Lf.duck.gain.value];
        const ok = r._musikDuck("gespraech", o.zeichen);
        await warte(o.duckMs);
        const [l1, g1] = [await linie(), Lf.duck.gain.value];
        ton.stop();
        tonG.disconnect();
        Lf.duck.disconnect(an2);
        [ton, tonG] = [null, null];
        while (performance.now() - t0 < o.sek * 1000) await warte(100);
        clearInterval(takt);
        takt = null;
        zugleich.sort((a, b) => a - b);
        return {
            ms: Math.round(performance.now() - t0),
            proben,
            spitzeDbfs: spitze > 0 ? +(20 * Math.log10(spitze)).toFixed(2) : -999,
            stimmenMax,
            stimmenP50: zugleich[zugleich.length >> 1],
            duck: { ok: !!ok, busDb: +(20 * Math.log10(g0 / g1)).toFixed(2), linieDb: +(l0 - l1).toFixed(2), g0: +g0.toFixed(4), g1: +g1.toFixed(4) },
            menge: r._klangZensus().menge,
        };
    } finally {
        if (takt) clearInterval(takt);
        if (ton)
            try {
                ton.stop();
                tonG.disconnect();
            } catch (_e) {}
        if (kern && rufAlt) kern.rufSpielen = rufAlt;
        rend.setAnimationLoop(null);
        if (an && sy && sy.spitze)
            try {
                sy.spitze.ausgang.disconnect(an);
            } catch (_e) {}
        if (!war && s.symphony.enabled) r.disposeSymphony();
    }
}

// der Lauf der Sprosse 1 (statt `L.ort("wiese", "ego")` … in getuemmelLauf, Leiter erleben.klang.getuemmel):
//   await L.ort("stadt-voll", "third");
//   L.preisPose("stadt-voll", "third");
//   await L.ev('r._uhrSetzen(22 / 24, "regler"); r._uhrSetzen(10 / 24, "regler");', 10);
//   const sek = Math.max(6, Math.min(14, L.rest() - 10));
//   const G = await L.ev("return await (" + getuemmelMarktSeite + ")(" + JSON.stringify({ sek, vorMs: Math.round(sek * 300), duckMs: 300, zeichen: 30, tonHz: 15000 }) + ");", Math.max(10, L.rest() - 2));
//   duck = G.duck.busDb  (Zeuge: G.duck.linieDb) · erzeugt = G.stimmenP50 (der Median: „zugleich“, nicht ein Augenblick)
module.exports = { getuemmelMarktSeite };
