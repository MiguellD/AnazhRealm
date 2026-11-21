const st = r.state, C = AnazhRealm, D = window.__druckProbe;
// same.physik.reaktion#2 — der SPIKE: drei Ladungen 1 · 8 · 27 kg TNT-Äquivalent am selben Herd, aufsteigend gezündet.
// DAS GESETZ (Vorschlag, Prototyp in der Probe — kein Glied des Stamms): der Spitzen-Überdruck über dem skalierten Abstand
// Z = R ÷ W^(1/3) nach Kinney–Graham (geprüft: 20 kPa bei Z 6,23), der Impuls je Fläche nach ihrer Impuls-Formel (aus dem
// Gedächtnis, an der Quelle nicht geprüft). DIE SCHWELLE FOLGT AUS DER STOFF-ZEILE: die Scheibe ist eine Platte, vier Kanten
// gelenkig, σ = β · p · (b/t)² mit β 0,2874 (Roark, Tafel der Platten) — sie bricht, wo σ die Bruchfestigkeit σ_B ihrer Zeile
// erreicht (der EINE Leser `_stoff`). DIE LESER DER WELT: der Bruch geht durch `_werkBricht` (die Scheibe fällt als freier
// Körper aus ihrem Bock), der Wurf durch das EINE Impuls-Gesetz (`_freiStoss`: dv = Impuls × Fläche ÷ Masse), der Löser trägt
// Scherben und Kisten (`_freiSchritt`). Gemessen: je Ladung und Strahl die fernste gebrochene und die nächste heile Scheibe.
if (!D) return { fehler: "kein Aufbau" };
const r3 = (v) => Math.round(v * 1e3) / 1e3;
const P0 = 101325;
const dp = (R, W) => {
    const Z = R / Math.cbrt(W);
    return (P0 * 808 * (1 + (Z / 4.5) ** 2)) / Math.sqrt(1 + (Z / 0.048) ** 2) / Math.sqrt(1 + (Z / 0.32) ** 2) / Math.sqrt(1 + (Z / 1.35) ** 2);
};
const imp = (R, W) => {
    const Z = R / Math.cbrt(W);
    return (100 * Math.cbrt(W) * 0.067 * Math.sqrt(1 + (Z / 0.23) ** 4)) / (Z * Z * Math.cbrt(1 + (Z / 1.55) ** 3));
};
const zStern = (p) => {
    let [lo, hi] = [0.05, 400];
    for (let i = 0; i < 90; i++) {
        const m = Math.sqrt(lo * hi);
        if (dp(m, 1) > p) lo = m;
        else hi = m;
    }
    return Math.sqrt(lo * hi);
};
const bp = st.blueprints.probe_fenster;
const teil = bp.parts[1];
const zeile = r._stoff(teil.material);
const [b, t] = [teil.size.x, teil.size.z];
const BETA = 0.2874;
const pBruch = (zeile.sigB * t * t) / (BETA * b * b);
const H = D.herd;
const quelle = { x: H.x, y: H.y + 0.5, z: H.z };
const ab = (x, y, z) => Math.hypot(x - quelle.x, y - quelle.y, z - quelle.z);
for (const s of D.scheiben) s.R = ab(s.x, s.y + 0.37, s.z);
const schritte = (n) => {
    for (let i = 0; i < n; i++) r._freiSchritt(C.FIXED_DT);
};
const ladungen = [];
const fehler = [];
for (const W of [1, 8, 27]) {
    const neuGebrochen = [];
    for (const s of D.scheiben) {
        if (!s.heil) continue;
        const sigma = BETA * dp(s.R, W) * (b / t) ** 2;
        if (sigma < zeile.sigB) continue;
        const vorher = new Set(st.architectures);
        try {
            r._werkBricht(s.e, bp, [1]);
        } catch (e) {
            fehler.push("Bruch " + s.strahl + "/" + s.k + ": " + ((e && e.message) || e));
            continue;
        }
        const neu = st.architectures.filter((e) => !vorher.has(e));
        for (const e of neu) D.eigen.add(e);
        const tr = neu.find((e) => e._frei);
        s.heil = false;
        s.bruchBei = W;
        s.e = neu.find((e) => !e._frei) || null;
        s.truemmer = tr || null;
        if (!tr) {
            fehler.push("Bruch " + s.strahl + "/" + s.k + ": kein freier Körper (" + neu.map((e) => e.type).join(",") + ")");
            continue;
        }
        const K = tr._frei;
        s.p0 = K.p.slice();
        const [nx, nz] = [s.x - quelle.x, s.z - quelle.z];
        const n = Math.hypot(nx, nz);
        s.dv = (imp(s.R, W) * b * b) * K.invM;
        r._freiStoss(tr, nx / n, nz / n, s.dv);
        neuGebrochen.push(s);
    }
    const kisten = D.kisten.map((k) => {
        const K = k.e._frei;
        const p0 = K.p.slice();
        const R = ab(p0[0], p0[1], p0[2]);
        const [nx, nz] = [p0[0] - quelle.x, p0[2] - quelle.z];
        const n = Math.hypot(nx, nz);
        const dv = imp(R, W) * 0.36 * K.invM;
        r._freiStoss(k.e, nx / n, nz / n, dv);
        return { k, p0, R, dv, masse: 1 / K.invM };
    });
    schritte(360);
    const strahlen = [0, 1, 2].map((si) => {
        const S = D.scheiben.filter((s) => s.strahl === si);
        const rBruch = Math.max(0, ...S.filter((s) => !s.heil).map((s) => s.R));
        const rHeil = Math.min(Infinity, ...S.filter((s) => s.heil).map((s) => s.R));
        return { rBruch: r3(rBruch), rHeil: r3(rHeil), rMess: r3(Math.sqrt(rBruch * rHeil)) };
    });
    const wurf = neuGebrochen
        .filter((s) => s.truemmer && s.truemmer._frei)
        .map((s) => {
            const p = s.truemmer._frei.p;
            return Math.hypot(p[0] - s.p0[0], p[2] - s.p0[2]);
        })
        .sort((a, c) => a - c);
    const wach = st.architectures.filter((e) => e._frei && !e._frei.schlaf).length;
    ladungen.push({
        W,
        energieMJ: r3(W * 4.184),
        rGerechnet: r3(zStern(pBruch) * Math.cbrt(W)),
        strahlen,
        rMess: r3(strahlen.reduce((a, s) => a + s.rMess, 0) / strahlen.length),
        gebrochen: neuGebrochen.length,
        dvScherbe: neuGebrochen.length ? [r3(Math.min(...neuGebrochen.map((s) => s.dv))), r3(Math.max(...neuGebrochen.map((s) => s.dv)))] : null,
        wurfM: wurf.length ? { min: r3(wurf[0]), median: r3(wurf[wurf.length >> 1]), max: r3(wurf[wurf.length - 1]) } : null,
        kisten: kisten.map((q) => {
            const p = q.k.e._frei.p;
            return { R: r3(q.R), masseKg: r3(q.masse), dv: r3(q.dv), wegM: r3(Math.hypot(p[0] - q.p0[0], p[2] - q.p0[2])), dy: r3(p[1] - q.p0[1]) };
        }),
        wachNach6s: wach,
        ohr: { R: 30, dpPa: r3(dp(30, W)), dB: r3(20 * Math.log10(dp(30, W) / 2e-5)), ankunftS: r3(30 / 343) },
    });
}
// PROPORTIONAL: R ÷ W^(1/3) je Ladung gegen ihr Mittel; dazu der Exponent der drei Punkte (kleinste Quadrate in log-log)
const kk = ladungen.map((l) => l.rMess / Math.cbrt(l.W));
const mittel = kk.reduce((a, c) => a + c, 0) / kk.length;
const lx = ladungen.map((l) => Math.log(l.W)), ly = ladungen.map((l) => Math.log(l.rMess));
const [mx, my] = [lx.reduce((a, c) => a + c, 0) / 3, ly.reduce((a, c) => a + c, 0) / 3];
const exponent = lx.reduce((a, x, i) => a + (x - mx) * (ly[i] - my), 0) / lx.reduce((a, x) => a + (x - mx) ** 2, 0);
return {
    gesetz: "Kinney–Graham über Z = R ÷ W^(1/3), p0 101 325 Pa; Platte σ = 0,2874 · p · (b/t)²",
    scheibe: {
        stoff: zeile.name,
        sigB: zeile.sigB,
        rho: zeile.rho,
        b,
        t,
        pBruchPa: r3(pBruch),
        zStern: r3(zStern(pBruch)),
        zSternBeiDoppelterSigB: r3(zStern(2 * pBruch)),
        glasZeileKern: (() => {
            const g = globalThis.__schmiedeCore.STOFF_GESETZ.zeile("glas");
            return { sigB: g.sigB, rho: r3(g.rho), E: g.E };
        })(),
    },
    ladungen,
    kJeLadung: kk.map(r3),
    radius_abw_pct: r3(Math.max(...kk.map((k) => Math.abs(k / mittel - 1))) * 100),
    gegen_gerechnet_pct: r3(Math.max(...ladungen.map((l) => Math.abs(l.rMess / l.rGerechnet - 1))) * 100),
    exponent: r3(exponent),
    staffel: 1.09,
    welt: { buehne: r._buehneSteht(), werke: st.architectures.length, spieler: [r3(st.playerMesh.position.x), r3(st.playerMesh.position.z)] },
    fehler,
};
