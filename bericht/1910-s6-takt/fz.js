// 1910 S6-Takt: DER FRAME-ZERLEGER (Seiten-Code für `werkbank eval`, r = Welt). Läuft NACH lauf/profil/takt derselben Sitzung.
// Der echte Loop wie `werkbank lauf` (rAF, __wetterHalten, __ortSchritt, _gameLoopTick, Regler voll, Tiere frei) — je Takt:
//   cpu (dieselbe Spanne wie lauf cpuTaktMs), gerendert (GPU-Leine), die Selbst-Summe je gehüllter Methode (inklusiv, ms),
//   die Kern-Gesetze (tetrapoda verbandZug/herdeZug/rudelPlatz/steuerSchritt), der Matrix-Gang der Szene (scene.updateMatrixWorld),
//   die Render-Pässe (rend._renderScene oben / mit overrideMaterial = Schatten), Stufen-Wechsel (`_gelenkStufe` istFern kippt),
//   neue Leib-Bündel (`_leibBuendelNeu`), wache / laufende / fliehende Tiere, die Knoten wacher Skelette (Matrix-Gang-Last),
//   Gier-Umkehrungen (Vorzeichenwechsel der Gier-Änderung mit |Δ| > 0,01 bzw. 0,05 rad je Takt, wie herde-auswertung.cjs).
// Hüllen sind Funktions-Hüllen am Prototyp / an der Instanz / am Kern-Objekt (kein Proxy). Am Ende alles zurück.
// window.__fzSek (Sekunden, Standard 30). Rückgabe: { kopf, zeilen (je Takt CSV), zusammen }.
const SEK = window.__fzSek || 30;
const EIN = 3;
const st = r.state;
const rend = st.renderer;
const P = Object.getPrototypeOf(r);
const sleep = (ms) => new Promise((s) => setTimeout(s, ms));
const LOOP = [
    "updateFps", "_loopNexusUpdate", "grokTick", "dslTick", "_tickWorldRules", "updatePlayerEmotions", "tickPlayerBoosts",
    "tickCreatureBoosts", "tickPlayerVitals", "tickStatsHud", "tickDayNight", "tickWeatherTransition", "tickFaunaLifecycle",
    "_tickBootPhase3", "_tickBootFernDeko", "symphonyTick", "updateStatusPanel", "_loopGroundCheck", "_loopFrustumCulling",
    "_loopAnimateUfos", "p2pTick", "_loopFixedStep", "_tickHarvest", "_tickKampfSchwung", "_tickPfeile", "_tickBogenZug",
    "_loopSelfAnalysis", "samplePathBuckets", "samplePlayerActivity", "_loopWeatherAndGrowth", "_loopVoxelStreaming",
    "_tickPortalMembranes", "_tickHausTueren", "_tickGenesisOrt", "_updateDorfRauch", "_loopAutoSave", "_applyFixedInterpolation",
    "_loopCamera", "animatePlayerSoul", "tickArchitectureCulling", "tickBuildMode", "tickArchitectures", "tickAffordances",
    "_kernPflichtWand", "_loopShadowUpdate", "_loopRender", "_perfSenseFoldFrame", "_tickFoundryIngest", "_weltStandTakt",
];
const TIEF = [
    "updateCreatures", "_tickEmotionContagion", "_tickKreaturRuhe", "_tickKreaturZiegel", "_tickLeichname",
    "_tickCreatureTaskDirection", "_creatureWariness", "_kreaturVerbandZug", "_kreaturVerbandAlarm", "_creatureCharacterWander",
    "_creatureScentHuntDir", "_creatureHuntDrive", "_kreaturJagdZug", "_applyCreatureSeparation", "_tickKreaturVerhalten",
    "_kreaturHuellenKontakt", "_creatureGroundY", "_standSicht", "_creatureSlopeProben", "_kreaturAuflage", "_kreaturLaufTakt",
    "_animateCompoundMotion", "_tierBaumNeutralStance", "_leibSicht", "_ruheImBild", "_leibBuendelStand", "_kzLeib",
    "_gpuKehraus", "isInFrustum",
];
const NAMEN = LOOP.concat(TIEF).filter((n) => typeof P[n] === "function");
const fehlt = LOOP.concat(TIEF).filter((n) => typeof P[n] !== "function");
const kern = globalThis.__tetrapodaCore;
const KERN = ["verbandZug", "herdeZug", "rudelPlatz", "steuerSchritt"].filter((n) => kern && typeof kern[n] === "function");
const EXTRA = ["matrixGang", "matrixGangN", "renderOben", "schatten", "schattenN", "stufenWechsel", "buendelNeu", "wach",
    "laeuft", "flucht", "knotenWach", "tiere", "kipp001", "kipp005", "kippV001", "tierS", "tierSV", "dt", "nAnim",
    "nVerbandZug", "nLeibStand", "nWariness", "nKernZug"];
const KOPF = ["cpu", "gerendert"].concat(NAMEN, KERN.map((n) => "kern." + n), EXTRA);
const NK = KOPF.length;
const zeit = new Float64Array(NAMEN.length + KERN.length);
const anz = new Float64Array(NAMEN.length + KERN.length);
const roh = {};
const ab = [];
NAMEN.forEach((n, k) => {
    const f = P[n];
    roh[n] = f;
    P[n] = function () {
        const t = performance.now();
        try {
            return f.apply(this, arguments);
        } finally {
            zeit[k] += performance.now() - t;
            anz[k]++;
        }
    };
    ab.push(() => (P[n] = f));
});
KERN.forEach((n, j) => {
    const k = NAMEN.length + j;
    const f = kern[n];
    kern[n] = function () {
        const t = performance.now();
        try {
            return f.apply(this, arguments);
        } finally {
            zeit[k] += performance.now() - t;
            anz[k]++;
        }
    };
    ab.push(() => (kern[n] = f));
});
// Stufen-Wechsel: der EINE Schalter kippt istFern (Prototyp-Hülle über der Zeit-Hülle nicht nötig: eigene Hülle)
let stufen = 0;
{
    const f = P._gelenkStufe;
    P._gelenkStufe = function (gruppe) {
        const g = gruppe && gruppe.userData && gruppe.userData._gelenk;
        const vor = g ? g.istFern : null;
        const e = f.apply(this, arguments);
        if (g && g.istFern !== vor) stufen++;
        return e;
    };
    ab.push(() => (P._gelenkStufe = f));
}
// Matrix-Gang der Szene (Instanz-Hülle) und die Render-Pässe (rend._renderScene: oben = Tiefe 0, Schatten = overrideMaterial)
let mg = 0,
    mgN = 0,
    oben = 0,
    sch = 0,
    schN = 0,
    tiefe = 0;
const sc = st.scene;
const scEigen = Object.prototype.hasOwnProperty.call(sc, "updateMatrixWorld");
const scRoh = sc.updateMatrixWorld;
sc.updateMatrixWorld = function () {
    const t = performance.now();
    try {
        return scRoh.apply(this, arguments);
    } finally {
        mg += performance.now() - t;
        mgN++;
    }
};
ab.push(() => {
    if (scEigen) sc.updateMatrixWorld = scRoh;
    else delete sc.updateMatrixWorld;
});
const rsRoh = rend._renderScene;
const rsEigen = Object.prototype.hasOwnProperty.call(rend, "_renderScene");
rend._renderScene = function (scene) {
    const t = performance.now();
    const ov = !!(scene && scene.overrideMaterial);
    tiefe++;
    try {
        return rsRoh.apply(this, arguments);
    } finally {
        tiefe--;
        const d = performance.now() - t;
        if (tiefe === 0) oben += d;
        if (ov) {
            sch += d;
            schN++;
        }
    }
};
ab.push(() => {
    if (rsEigen) rend._renderScene = rsRoh;
    else delete rend._renderScene;
});
// Knoten je Skelett (einmal je Leib): die Last des Matrix-Gangs, wenn der Leib wach ist
const knotenVon = new WeakMap();
const knoten = (c) => {
    let n = knotenVon.get(c);
    if (n == null) {
        n = 0;
        c.traverse(() => n++);
        knotenVon.set(c, n);
    }
    return n;
};
const MAXF = Math.ceil(SEK * 200) + 50;
const iAn = (n) => NAMEN.indexOf(n);
const I_ANIM = iAn("_animateCompoundMotion"), I_VZ = iAn("_kreaturVerbandZug"), I_LS = iAn("_leibBuendelStand"), I_WA = iAn("_creatureWariness");
const I_KZ = NAMEN.length + Math.max(KERN.indexOf("verbandZug"), KERN.indexOf("herdeZug"));
const zeilen = new Float64Array(MAXF * NK);
let nf = 0;
let messen = false;
let tVor = null;
const decke = st.perfTargetMs;
st.perfTargetMs = 1000;
window.__buehne();
if (st.playerMesh) st.playerMesh.visible = true;
const wrap = (d) => {
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d;
};
const vbZahl = new Map();
let fehler = null;
rend.setAnimationLoop((t) => {
    window.__wetterHalten();
    zeit.fill(0);
    anz.fill(0);
    stufen = 0;
    mg = mgN = oben = sch = schN = 0;
    const nb0 = r._leibBuendelNeu || 0;
    const g0 = r._gpuLeine ? r._gpuLeine.gerendert : 0;
    const c0 = performance.now();
    try {
        if (window.__ortSchritt) window.__ortSchritt();
        r._gameLoopTick(t);
    } catch (e) {
        fehler = fehler || String(e && e.stack ? e.stack : e).slice(0, 400);
    }
    const cpu = performance.now() - c0;
    const gerendert = !r._gpuLeine || r._gpuLeine.gerendert > g0 ? 1 : 0;
    const dt = tVor == null ? 0 : (t - tVor) / 1000;
    tVor = t;
    if (!messen || nf >= MAXF) return;
    // je Tier: wach, läuft, Flucht, Knoten, Gier-Umkehrungen
    let wach = 0,
        lf = 0,
        fl = 0,
        kn = 0,
        k1 = 0,
        k5 = 0,
        kv1 = 0,
        ts = 0,
        tsv = 0;
    vbZahl.clear();
    for (const c of st.creatures) {
        const u = c && c.userData;
        if (u && u.verband != null) vbZahl.set(u.verband, (vbZahl.get(u.verband) || 0) + 1);
    }
    for (const c of st.creatures) {
        const u = c && c.userData;
        if (!u) continue;
        const imVerband = u.verband != null && (vbZahl.get(u.verband) || 0) >= 2;
        if (u._ruht !== true) {
            wach++;
            kn += knoten(c);
        }
        if (u._steuer && Math.abs(u._steuer.v) > 0.1) lf++;
        if (u._motionZustand === "flucht") fl++;
        const y = c.rotation.y;
        if (u.__s6y != null && dt > 0 && dt < 0.25) {
            const dy = wrap(y - u.__s6y);
            if (Math.abs(dy) > 0.01) {
                if (u.__s6l && Math.sign(dy) !== Math.sign(u.__s6l)) {
                    k1++;
                    if (imVerband) kv1++;
                }
                u.__s6l = dy;
            }
            if (Math.abs(dy) > 0.05) {
                if (u.__s6l5 && Math.sign(dy) !== Math.sign(u.__s6l5)) k5++;
                u.__s6l5 = dy;
            }
            ts += dt;
            if (imVerband) tsv += dt;
        }
        u.__s6y = y;
    }
    const o = nf * NK;
    zeilen[o] = cpu;
    zeilen[o + 1] = gerendert;
    let j = 2;
    for (let k = 0; k < zeit.length; k++) zeilen[o + j++] = zeit[k];
    const ex = [mg, mgN, oben, sch, schN, stufen, (r._leibBuendelNeu || 0) - nb0, wach, lf, fl, kn, st.creatures.length,
        k1, k5, kv1, ts, tsv, dt, I_ANIM >= 0 ? anz[I_ANIM] : 0, I_VZ >= 0 ? anz[I_VZ] : 0, I_LS >= 0 ? anz[I_LS] : 0,
        I_WA >= 0 ? anz[I_WA] : 0, I_KZ >= NAMEN.length ? anz[I_KZ] : 0];
    for (let k = 0; k < ex.length; k++) zeilen[o + j++] = ex[k];
    nf++;
});
try {
    await sleep(EIN * 1000);
    // erste Gier je Tier setzen, dann messen
    messen = true;
    await sleep(SEK * 1000);
    messen = false;
} finally {
    rend.setAnimationLoop(null);
    for (const f of ab) f();
    st.perfTargetMs = decke;
    for (const c of st.creatures) if (c && c.userData) {
        delete c.userData.__s6y;
        delete c.userData.__s6l;
        delete c.userData.__s6l5;
    }
}
// Zusammenfassung über gerenderte Takte: je Spalte Mittel, p95, p99; dazu das Mittel in den Takten mit cpu ≥ p95 und < p50
const idx = [];
for (let i = 0; i < nf; i++) if (zeilen[i * NK + 1] === 1) idx.push(i);
const spalte = (k) => idx.map((i) => zeilen[i * NK + k]);
const cpuS = spalte(0).slice().sort((a, b) => a - b);
const q = (a, p) => (a.length ? a[Math.min(a.length - 1, Math.floor(p * a.length))] : null);
const p50 = q(cpuS, 0.5),
    p95 = q(cpuS, 0.95),
    p99 = q(cpuS, 0.99);
const schwer = idx.filter((i) => zeilen[i * NK] >= p95);
const leicht = idx.filter((i) => zeilen[i * NK] < p50);
const mit = (ii, k) => (ii.length ? ii.reduce((s, i) => s + zeilen[i * NK + k], 0) / ii.length : null);
const r4 = (x) => (x == null ? null : +x.toFixed(4));
const zusammen = {};
for (let k = 2; k < NK; k++) {
    const a = spalte(k).sort((x, y) => x - y);
    zusammen[KOPF[k]] = { mittel: r4(mit(idx, k)), p95: r4(q(a, 0.95)), p99: r4(q(a, 0.99)), schwer: r4(mit(schwer, k)),
        leicht: r4(mit(leicht, k)) };
}
// alle Takte (auch ungerendert) für die Raten
let sek = 0,
    kipp1 = 0,
    kipp5 = 0,
    kippV = 0,
    tS = 0,
    tSV = 0,
    sw = 0,
    bn = 0;
const ki = (n) => KOPF.indexOf(n);
for (let i = 0; i < nf; i++) {
    const o = i * NK;
    sek += zeilen[o + ki("dt")];
    kipp1 += zeilen[o + ki("kipp001")];
    kipp5 += zeilen[o + ki("kipp005")];
    kippV += zeilen[o + ki("kippV001")];
    tS += zeilen[o + ki("tierS")];
    tSV += zeilen[o + ki("tierSV")];
    sw += zeilen[o + ki("stufenWechsel")];
    bn += zeilen[o + ki("buendelNeu")];
}
const csv = [];
for (let i = 0; i < nf; i++) {
    const z = [];
    for (let k = 0; k < NK; k++) {
        const v = zeilen[i * NK + k];
        z.push(v === 0 ? "0" : Math.abs(v) >= 100 ? v.toFixed(0) : +v.toFixed(4));
    }
    csv.push(z.join(","));
}
return {
    sek: +sek.toFixed(2),
    takte: nf,
    gerendert: idx.length,
    cpu: { p50: r4(p50), p95: r4(p95), p99: r4(p99), mittel: r4(mit(idx, 0)), schwerN: schwer.length },
    raten: {
        stufenWechselJeS: r4(sw / sek),
        buendelNeuJeS: r4(bn / sek),
        gierKipp001JeTierS: r4(kipp1 / tS),
        gierKipp005JeTierS: r4(kipp5 / tS),
        gierKipp001JeVerbandsTierS: tSV > 0 ? r4(kippV / tSV) : null,
        gierKipp001JeFreiTierS: tS - tSV > 0 ? r4((kipp1 - kippV) / (tS - tSV)) : null,
        tierS: +tS.toFixed(1),
        verbandsTierS: +tSV.toFixed(1),
    },
    fehlt,
    kern: KERN,
    fehler,
    zusammen,
    kopf: KOPF.join(","),
    zeilen: csv.join("\n"),
};
