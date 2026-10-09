// 0710-4 Klasse 3: gate:tier-separation (D) Leib an Leib, (E) Tier am Spieler, (F) Lockstep, Selbst-Test (C) + (C2).
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
// Kopf: die Linse erweitert
ers(
    `//  (C) SELBST-TEST: mit künstlich genullter Separation (_applyCreatureSeparation
//      gestubbt, danach restauriert — die Gate-Hook-Lehre) bleibt das A-Paar
//      GESTAPELT (< 0.2 m) — die Linse feuert, sie ist nicht blind.`,
    `//  (C) SELBST-TEST: mit künstlich genullter Separation UND ohne Leib-Kontakt
//      (_applyCreatureSeparation + _leibKontakte gestubbt, danach restauriert — die
//      Gate-Hook-Lehre) bleibt das A-Paar GESTAPELT (< 0.2 m) — die Linse feuert.
//  (D) LEIB AN LEIB (0710-4, das EINE Impuls-Gesetz): ein Fuchs stößt mit 4 m/s
//      frontal gegen einen stehenden Bären (beide Größe 1, die Steuer-Schritte
//      stehen, nur der Stoß bewegt) und umgekehrt: kein Leib durchdringt den
//      anderen (≥ −0,05 m), sie tauschen Impuls (der Gestoßene bekommt Δv), das
//      Verhältnis der Δv ist das der Massen (±30 %), und der Fuchs fliegt am
//      Bären weiter als der Bär am Fuchs. Vorher: der Fuchs lief durch den Bären.
//  (E) TIER AM SPIELER: ein Wolf mit 4 m/s gegen den stehenden Spieler — der
//      Spieler bekommt seinen Impuls, der Wolf geht nicht durch ihn hindurch.
//  (F) LOCKSTEP: dieselbe Probe (D) zweimal — dieselben Lagen, Bit für Bit.
//  (C2) SELBST-TEST: ohne Leib-Kontakt (_leibKontakte gestubbt) durchdringt der
//      Fuchs den Bären ohne Impuls — (D) liest rot beim Namen.`
);
// das Urteil (pure Funktion) vor dem Server
ers(
    `const mime = {
    ".html": "text/html",`,
    `// (D–F) DAS URTEIL LEIB AN LEIB (0710-4 — pure Funktion, Probe UND Selbst-Test).
const LEIB_SOLL = { tiefM: -0.05, dvMin: 0.05, verhaeltnis: 0.3, flugFaktor: 3 };
function leibVerdict(L) {
    if (!L || !L.fuchsBaer || !L.baerFuchs) return ["leib keine Probe"];
    const v = [];
    for (const [k, name] of [
        ["fuchsBaer", "Fuchs → Bär"],
        ["baerFuchs", "Bär → Fuchs"],
    ]) {
        const m = L[k];
        if (!(m.minAbstand >= LEIB_SOLL.tiefM))
            v.push(\`leib-durchdringung: \${name} — die Leiber stecken \${(-m.minAbstand).toFixed(2)} m ineinander\`);
        if (!(m.dvZiel >= LEIB_SOLL.dvMin))
            v.push(\`leib-ohne-impuls: \${name} — der Gestoßene bekommt \${(m.dvZiel || 0).toFixed(3)} m/s\`);
        else if (
            !(m.massen > 0) ||
            !(Math.abs(m.dvStoesser / m.dvZiel / m.massen - 1) <= LEIB_SOLL.verhaeltnis)
        )
            v.push(
                \`leib-masse: \${name} — Δv \${m.dvStoesser.toFixed(2)} zu \${m.dvZiel.toFixed(2)} m/s gegen das Massen-Verhältnis \${(m.massen || 0).toFixed(1)}\`
            );
    }
    if (!(L.baerFuchs.dvZiel >= LEIB_SOLL.flugFaktor * L.fuchsBaer.dvZiel))
        v.push(
            \`leib-umgekehrt: der Fuchs bekommt am Bären \${(L.baerFuchs.dvZiel || 0).toFixed(2)} m/s, der Bär am Fuchs \${(L.fuchsBaer.dvZiel || 0).toFixed(2)} — der Leichte fliegt nicht\`
        );
    if (L.spieler) {
        if (!(L.spieler.minAbstand >= LEIB_SOLL.tiefM))
            v.push(\`leib-spieler: der Wolf steckt \${(-L.spieler.minAbstand).toFixed(2)} m im Spieler\`);
        if (!(L.spieler.dvSpieler >= LEIB_SOLL.dvMin))
            v.push(\`leib-spieler: der Spieler bekommt \${(L.spieler.dvSpieler || 0).toFixed(3)} m/s vom Wolf\`);
    } else v.push("leib-spieler keine Probe");
    if (L.lockstep !== true) v.push(\`leib-lockstep: zwei gleiche Proben enden verschieden (\${L.lockstepAbw})\`);
    return v;
}
const mime = {
    ".html": "text/html",`
);
// (C): auch der Leib-Kontakt ruht
ers(
    `            const savedSep = r._applyCreatureSeparation;
            r._applyCreatureSeparation = function () {};
            tick(200, 0.05);
            r._applyCreatureSeparation = savedSep; // restaurieren (Gate-Hook-Lehre)`,
    `            const savedSep = r._applyCreatureSeparation;
            r._applyCreatureSeparation = function () {};
            const hatLeib = typeof r._leibKontakte === "function";
            if (hatLeib) r._leibKontakte = function () {};
            tick(200, 0.05);
            r._applyCreatureSeparation = savedSep; // restaurieren (Gate-Hook-Lehre)
            if (hatLeib) delete r._leibKontakte;`
);
// (D)(E)(F)(C2) nach (B2), vor dem Abschluss
ers(
    `            s.maxCreatures = saveMax;
            o.creaturesAfter = s.creatures.length;
            return o;`,
    `            // ── (D) LEIB AN LEIB, (E) TIER AM SPIELER, (F) LOCKSTEP, (C2) SELBST-TEST (0710-4) ──
            {
                const steuerRoh = A._steuerGesetz;
                const steht = Object.create(steuerRoh.call(A));
                steht.steuerSchritt = (st) => {
                    st.v = 0;
                };
                const masse = (c) => (typeof r._leibMasse === "function" ? r._leibMasse(c) : null);
                const leib = {};
                const achse = (c) => {
                    r._kreaturLeib(c, 0, leib);
                    return {
                        ax: c.position.x - leib.fx * leib.halb,
                        az: c.position.z - leib.fz * leib.halb,
                        bx: c.position.x + leib.fx * leib.halb,
                        bz: c.position.z + leib.fz * leib.halb,
                        r: leib.radius,
                    };
                };
                // der Abstand zweier Strecken in der Ebene (die Linse rechnet ihn selbst)
                const streckeAbstand = (P, Q) => {
                    let best = Infinity;
                    const N = 24;
                    for (let i = 0; i <= N; i++) {
                        const px = P.ax + ((P.bx - P.ax) * i) / N;
                        const pz = P.az + ((P.bz - P.az) * i) / N;
                        const ux = Q.bx - Q.ax;
                        const uz = Q.bz - Q.az;
                        const ll = ux * ux + uz * uz;
                        const t = ll > 1e-12 ? Math.max(0, Math.min(1, ((px - Q.ax) * ux + (pz - Q.az) * uz) / ll)) : 0;
                        best = Math.min(best, Math.hypot(px - (Q.ax + ux * t), pz - (Q.az + uz * t)));
                    }
                    return best;
                };
                const stellen = (c, x, z) => {
                    c.position.set(x, r.getTerrainHeightAt(x, z), z);
                    c.rotation.y = Math.PI / 2; // die Achse längs +x
                    c.userData._steuer = { gier: Math.PI / 2, v: 0 };
                    c.userData._stossV = null;
                };
                const vx = (c) => (c.userData._stossV ? c.userData._stossV.x : 0);
                const leibProbe = (stoesserSeele, zielSeele, v0) => {
                    const spot = findSpot(115, 2.6);
                    if (!spot) return null;
                    // ruhige Tiere (ein frohes hüpft und verlässt die Höhe des Leibs)
                    const a = r.spawnCreatureAt(spot.x, spot.y, spot.z, "calm", stoesserSeele, { precise: true, bodySize: 1 });
                    const b = r.spawnCreatureAt(spot.x, spot.y, spot.z, "calm", zielSeele, { precise: true, bodySize: 1 });
                    if (!a || !b) return null;
                    stellen(a, spot.x, spot.z);
                    r._kreaturLeib(a, 0, leib);
                    const reichA = leib.halb + leib.radius;
                    r._kreaturLeib(b, 0, leib);
                    stellen(b, spot.x + reichA + leib.halb + leib.radius + 0.8, spot.z);
                    a.userData._stossV = { x: v0, z: 0 };
                    const res = { minAbstand: Infinity, dvStoesser: 0, dvZiel: 0, massen: null, kontakt: -1 };
                    // die Reibung eines Takts (μ·g·dt) nimmt dem gleitenden Stoßer auch im Stoß-Takt Fahrt — sie zählt nicht
                    const reib = A.STOSS ? (A.STOSS.reibungLeib * Math.abs(s.gravity)) / 60 : 0;
                    const mA = masse(a);
                    const mB = masse(b);
                    res.massen = mA > 0 && mB > 0 ? mB / mA : null;
                    A._steuerGesetz = () => steht;
                    try {
                        let vaVor = vx(a);
                        for (let k = 0; k < 120; k++) {
                            r.updateCreatures(1 / 60);
                            const PA = achse(a);
                            const PB = achse(b);
                            res.minAbstand = Math.min(res.minAbstand, streckeAbstand(PA, PB) - PA.r - PB.r);
                            if (res.kontakt < 0 && vx(b) > 1e-6) {
                                res.kontakt = k;
                                res.dvZiel = vx(b);
                                res.dvStoesser = vaVor - vx(a) - (vaVor > reib ? reib : 0);
                            }
                            vaVor = vx(a);
                        }
                    } finally {
                        A._steuerGesetz = steuerRoh;
                    }
                    res.lage = [a.position.x, a.position.z, b.position.x, b.position.z];
                    cleanup([a, b]);
                    return res;
                };
                o.leib = {
                    fuchsBaer: leibProbe("fuchs", "baer", 4),
                    baerFuchs: leibProbe("baer", "fuchs", 4),
                };
                // (F) LOCKSTEP: dieselbe Probe noch einmal — dieselben Lagen
                const zweit = leibProbe("fuchs", "baer", 4);
                const erst = o.leib.fuchsBaer;
                const abw = erst && zweit ? Math.max(...erst.lage.map((x, i) => Math.abs(x - zweit.lage[i]))) : NaN;
                o.leib.lockstep = abw === 0;
                o.leib.lockstepAbw = abw;
                // (E) TIER AM SPIELER: ein Wolf mit 4 m/s gegen den stehenden Spieler
                {
                    const pmM = s.playerMesh;
                    const w0 = { x: pm.x - 2.2, y: pm.y, z: pm.z };
                    const w = r.spawnCreatureAt(w0.x, w0.y, w0.z, "calm", "wolf", { precise: true, bodySize: 1 });
                    if (w) {
                        stellen(w, pm.x - 2.2, pm.z);
                        w.userData._stossV = { x: 4, z: 0 };
                        s.playerVel.setValue(0, s.playerVel.y(), 0);
                        const sp = { minAbstand: Infinity, dvSpieler: 0 };
                        A._steuerGesetz = () => steht;
                        try {
                            for (let k = 0; k < 90; k++) {
                                r.updateCreatures(1 / 60);
                                const PW = achse(w);
                                const PS = { ax: pmM.position.x, az: pmM.position.z, bx: pmM.position.x, bz: pmM.position.z, r: A.PLAYER_WALL_RADIUS };
                                sp.minAbstand = Math.min(sp.minAbstand, streckeAbstand(PW, PS) - PW.r - PS.r);
                                sp.dvSpieler = Math.max(sp.dvSpieler, Math.hypot(s.playerVel.x(), s.playerVel.z()));
                            }
                        } finally {
                            A._steuerGesetz = steuerRoh;
                        }
                        s.playerVel.setValue(0, s.playerVel.y(), 0);
                        cleanup([w]);
                        o.leib.spieler = sp;
                    }
                }
                // (C2) SELBST-TEST: ohne Leib-Kontakt durchdringt der Fuchs den Bären ohne Impuls
                if (typeof r._leibKontakte === "function") {
                    r._leibKontakte = function () {};
                    try {
                        o.leibOhne = leibProbe("fuchs", "baer", 4);
                    } finally {
                        delete r._leibKontakte;
                    }
                }
            }

            s.maxCreatures = saveMax;
            o.creaturesAfter = s.creatures.length;
            return o;`
);
// Bericht + Checks
ers(
    `        check(!pageErr, \`kein Page-Error (\${pageErr || "sauber"})\`);`,
    `        const L = out.leib || {};
        const lz = (m) =>
            m
                ? \`tiefste Berührung \${m.minAbstand.toFixed(3)} m · Δv Stoßer \${m.dvStoesser.toFixed(2)} / Ziel \${m.dvZiel.toFixed(2)} m/s · Massen \${m.massen === null ? "–" : m.massen.toFixed(1)}\`
                : "–";
        console.log(\`  (D) Fuchs → Bär: \${lz(L.fuchsBaer)}\`);
        console.log(\`  (D) Bär → Fuchs: \${lz(L.baerFuchs)}\`);
        console.log(
            \`  (E) Wolf → Spieler: \${L.spieler ? \`tiefste Berührung \${L.spieler.minAbstand.toFixed(3)} m · Spieler Δv \${L.spieler.dvSpieler.toFixed(2)} m/s\` : "–"} · (F) Lockstep-Abweichung \${L.lockstepAbw}\`
        );
        const lv = leibVerdict(L);
        check(
            lv.length === 0,
            "0710-4 (D–F) LEIB AN LEIB: keine Durchdringung, Impuls-Austausch nach Masse (der Fuchs prallt am Bären ab, der Bär wankt kaum), der Spieler bekommt seinen Stoß, Lockstep" +
                (lv.length ? " — " + lv.join(" · ") : "")
        );
        if (out.leibOhne) {
            const lvOhne = leibVerdict({
                fuchsBaer: out.leibOhne,
                baerFuchs: L.baerFuchs,
                spieler: L.spieler,
                lockstep: true,
            });
            check(
                lvOhne.some((x) => x.startsWith("leib-durchdringung")) && lvOhne.some((x) => x.startsWith("leib-ohne-impuls")),
                \`SELBST-TEST (C2): ohne Leib-Kontakt durchdringt der Fuchs den Bären ohne Impuls — die Linse nennt es (\${lvOhne.slice(0, 2).join(" · ")})\`
            );
        } else check(false, "SELBST-TEST (C2): kein Leib-Kontakt zum Abschalten (_leibKontakte fehlt)");
        const lvAlt = leibVerdict({
            fuchsBaer: { minAbstand: -0.9, dvStoesser: 0, dvZiel: 0, massen: 22 },
            baerFuchs: { minAbstand: -0.9, dvStoesser: 0, dvZiel: 0, massen: 0.045 },
            spieler: { minAbstand: -0.6, dvSpieler: 0 },
            lockstep: true,
        });
        const lvGut = leibVerdict({
            fuchsBaer: { minAbstand: 0, dvStoesser: 4.2, dvZiel: 0.19, massen: 22.4 },
            baerFuchs: { minAbstand: 0, dvStoesser: 0.19, dvZiel: 4.2, massen: 0.045 },
            spieler: { minAbstand: 0, dvSpieler: 2.7 },
            lockstep: true,
        });
        check(
            lvGut.length === 0 &&
                ["leib-durchdringung", "leib-ohne-impuls", "leib-spieler"].every((t) => lvAlt.some((x) => x.startsWith(t))),
            "SELBST-TEST (D): der Befund (durcheinander, ohne Impuls) nennt Durchdringung, Impuls und Spieler; ein Stoß nach Masse bleibt grün"
        );
        check(!pageErr, \`kein Page-Error (\${pageErr || "sauber"})\`);`
);
fs.writeFileSync(p, s);
console.log("ok");
