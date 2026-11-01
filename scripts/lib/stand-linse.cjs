// stand-linse.cjs — DIE STAND-LINSE (Lehre 25, Gebot 7): was die Fege-Takte und die langsamen Simulationen je Frame
// ARBEITEN, wenn sich nichts ändert.
//
// Die Linse zählt UNABHÄNGIG von der Stand-Wache (`_standRuht`): sie hüllt die Fege-Takte (wer gerade geht) und ihre
// Blatt-Helfer (was ein Gang je Einheit ruft — Stufen-Wahl, Sichthöhe, Karten-Frage, Ring-Stufe, Saum-Punkt, Kachel-
// Armlänge …) und bucht jeden Blatt-Ruf auf den Takt, der ihn rief. Eine Einheit = ein Blatt-Ruf. Ruhe heißt 0. Dazu je
// Frame die Zeit je Takt (Richtwert — die Zeit misst der OMEN) und die Welt-Matrizen: Knoten, die `updateMatrixWorld`
// besucht, und Matrizen, die `updateMatrix` neu setzt (der Szenen-Graph je Gang).
//
//   Seite:     const L = window.__standLinseAn(); … je Frame L.frame() → { strom: n, archLod: n, … , ms: {…}, matrix }; L.aus()
//              window.__standLauf({ ein, ruhe, n, regler, tiere, sim }) — der echte Loop (rAF): Ruhe mit Wache (B), mit
//              gebrochener Wache (A, jeder Takt geht wie vor der Welle), in der Folge B A A B, danach `sim` s Spielzeit
//              die langsamen Simulationen (S, die Sim-Linse `__simLinseAn`, SIMS unten)
//   Urteil:    standUrteil({ ruhe, gehen, wecken, bruch, taeter, simRuhe, simWecken, pageErrors }) → [Verletzungen]
//   Werkbank:  node scripts/werkbank.cjs stand [n] [--ein s] [--ruhe max-s] [--regler voll|frei] [--tiere frei|halten]
//              [--sim s]
"use strict";

// Die Fege-Takte (Name der Wache → Methode) und ihre Blatt-Helfer.
const TAKTE = {
    strom: "_tickVoxelChunkStreaming",
    archLod: "_tickArchitectureLOD",
    archCull: "tickArchitectureCulling",
    streuLod: "_tickScatterLod",
    nahStreu: "_tickNahStreu",
    nahWiese: "_tickNahWiese",
    deckWache: "_fernRingDeckWache",
};
const BLAETTER = [
    "_voxelChunkLodFor",
    "_pruneDistantVoxelChunks",
    "_lodTreeVisHeight",
    "_chooseLODForDistance",
    "_updateFoundryLodBand",
    "_archKartenPreset",
    "_archIsRendered",
    "_archZiegelFern",
    "_foundryPresetForEntry",
    "_capNexusStructures",
    "_scatterSichtHoehe",
    "_scatterCellTransform",
    "_nahStreuArmlaenge",
    "_foundryBudgetZeile",
    "_foundryFlattenFor",
    "_fernRingPunkt",
    "_terrainMacroSurfaceY",
];
// Takte mit EIGENER Uhr, die ein Fege-Takt auch im Schlaf ruft (der Nachwuchs im Ring): ihre Blatt-Rufe gehören keinem
// Fege-Takt.
const EIGENE_UHR = ["_tickFoliageGrowth"];

// DIE LANGSAMEN SIMULATIONEN (feld.K3): Takte mit eigener Uhr außerhalb der Stand-Wache — Name → [Takte, Zellen (Pfade im state)]. In Ruhe
// arbeitet keine. Eine Einheit = ein Ruf einer Stamm-Methode unter dem Takt oder ein Element seiner Zellen, das er durchgeht;
// unter einem Schreib-Akt (AKTE) zählt die Arbeit der Tat (`akt`), nie der Ruhe.
const SIMS = {
    wasser: [["_tickWorldWaterCA"], ["waterCAActive"]],
    regen: [["_tickRain", "tickWeatherTransition"], []],
    saison: [["_tickSeason"], []],
    nachwuchs: [["_tickScatterRegrow"], ["worldMeta.taten"]],
    wuchs: [["_tickFoliageGrowth"], ["pendingFoliageChunks"]],
    feld: [["_feldTod"], ["lifeField", "emotionField", "wohlBaseline", "lifeField.tod", "emotionField.tod", "wohlBaseline.tod"]],
    brand: [["_tickBrand"], ["brandFeld"]],
};
const AKTE = ["_depositLife", "_depositEmotion", "_observeFieldWohl", "_brandEntfachen"];

// Die Sim-Linse (Seite): hüllt jede Methode des Prototyps und die Zellen jeder Sim (an der Instanz, je Frame neu gelegt).
//   const S = window.__simLinseAn(); je Frame S.frame() → { wasser: n, …, akt: n, je: { wasser: { methode: n } } }; S.aus()
function simLinseAn(sims, akte) {
    const P = Object.getPrototypeOf(r);
    const namen = Object.keys(sims);
    const rolle = Object.fromEntries(akte.map((m) => [m, "akt"]));
    for (const n of namen) for (const m of sims[n][0]) rolle[m] = n;
    const stapel = [];
    let frame;
    const buche = (wer) => {
        const o = stapel.includes("akt") ? "akt" : stapel[stapel.length - 1];
        frame[o]++;
        frame.je[o][wer] = (frame.je[o][wer] | 0) + 1;
    };
    const leer = () => {
        frame = { akt: 0, je: { akt: {} } };
        for (const n of namen) (frame[n] = 0), (frame.je[n] = {});
    };
    leer();
    const orig = {};
    for (const m of Object.getOwnPropertyNames(P)) {
        const f = Object.getOwnPropertyDescriptor(P, m).value;
        if (m === "constructor" || typeof f !== "function") continue;
        orig[m] = f;
        P[m] = function (...a) {
            if (stapel.length) buche(m);
            if (!rolle[m]) return f.apply(this, a);
            stapel.push(rolle[m]);
            try {
                return f.apply(this, a);
            } finally {
                stapel.pop();
            }
        };
    }
    const gehuellt = [];
    const ITER = ["entries", "keys", "values", Symbol.iterator];
    const huelle = (obj, wer) => {
        if (!obj || typeof obj !== "object" || gehuellt.includes(obj)) return;
        gehuellt.push(obj);
        const proto = Object.getPrototypeOf(obj);
        for (const k of ITER)
            obj[k] = function () {
                const it = proto[k].call(this);
                return Object.assign(Object.create(it), {
                    next() {
                        const x = it.next();
                        if (!x.done && stapel.length) buche(wer);
                        return x;
                    },
                });
            };
        obj.forEach = function (cb, dies) {
            for (const [k, v] of this.entries()) cb.call(dies, v, k, this);
        };
    };
    const legen = () => {
        for (const n of namen) for (const z of sims[n][1]) huelle(z.split(".").reduce((o, k) => o && o[k], st), "·" + z);
    };
    legen();
    return {
        frame() {
            const aus = frame;
            leer();
            legen();
            return aus;
        },
        aus() {
            Object.assign(P, orig);
            for (const o of gehuellt) for (const k of [...ITER, "forEach"]) delete o[k];
        },
    };
}

// Eine Sim-Phase (Frames, Spiel-Sekunden) → je Sim Summe, Frames mit Arbeit und die häufigsten Rufe (`je`); `akt` die Tat.
function simPhase(frames, spielS) {
    const aus = { frames: frames.length, spielS: +(spielS || 0).toFixed(2), sims: {} };
    for (const n of ["akt", ...Object.keys((frames[0] || {}).je || {}).filter((n) => n !== "akt")]) {
        const je = {};
        let summe = 0;
        let mitArbeit = 0;
        for (const f of frames) {
            summe += f[n] | 0;
            if (f[n] > 0) mitArbeit++;
            for (const [m, k] of Object.entries(f.je[n])) je[m] = (je[m] | 0) + k;
        }
        const t = { summe, mitArbeit, je: Object.entries(je).sort((a, b) => b[1] - a[1]).slice(0, 4) };
        if (n === "akt") [aus.akt, aus.aktJe, aus.aktSchreib, aus.aktAlle] = [summe, t.je, je._feldTod | 0, je];
        else aus.sims[n] = t;
    }
    return aus;
}

const simJe = (t) => t.je.map(([m, k]) => `${m} ${k}`).join(", ");
// in Ruhe arbeitet keine Sim, ein Akt (ein Wesen träufelt Leben) höchstens zwei Einheiten je geschriebener Zelle (feld.K3#2)
function simRuheZeilen(R, wo) {
    return Object.keys(SIMS)
        .filter((n) => !R.sims[n] || R.sims[n].summe > 0)
        .map((n) =>
            R.sims[n]
                ? `RUHE-SIM: ${n} (${SIMS[n][0].join(" · ")}) arbeitet in Ruhe ${wo} — ${R.sims[n].summe} Einheiten in ` +
                  `${R.sims[n].mitArbeit} von ${R.frames} Frames (${R.spielS} s; ${simJe(R.sims[n])})`
                : `LEER: die Sim ${n} fehlt in der Ruhe ${wo}`
        )
        .concat(
            R.akt > 2 * (R.aktSchreib | 0)
                ? [`RUHE-TAT: die Akte (${AKTE.join(" · ")}) arbeiten in Ruhe ${wo} über ihre Zellen hinaus — ${R.akt} Einheiten für ` +
                   `${R.aktSchreib | 0} geschriebene (${simJe({ je: R.aktJe || [] })})`]
                : []
        );
}

function standLinseAn(takte, blaetter, eigeneUhr) {
    const P = Object.getPrototypeOf(r);
    const namen = Object.keys(takte);
    const orig = {};
    const stapel = [];
    let frame = {};
    let ms = {};
    const leer = () => Object.fromEntries(namen.map((n) => [n, 0]));
    frame = leer();
    ms = leer();
    for (const n of namen) {
        const m = takte[n];
        if (typeof P[m] !== "function" || orig[m]) continue;
        const f = (orig[m] = P[m]);
        P[m] = function (...a) {
            stapel.push(n);
            const t0 = performance.now();
            try {
                return f.apply(this, a);
            } finally {
                stapel.pop();
                ms[n] += performance.now() - t0;
            }
        };
    }
    for (const b of blaetter) {
        if (typeof P[b] !== "function" || orig[b]) continue;
        const f = (orig[b] = P[b]);
        P[b] = function (...a) {
            const oben = stapel[stapel.length - 1];
            if (oben) frame[oben]++;
            return f.apply(this, a);
        };
    }
    for (const m of eigeneUhr || []) {
        if (typeof P[m] !== "function" || orig[m]) continue;
        const f = (orig[m] = P[m]);
        P[m] = function (...a) {
            stapel.push("");
            try {
                return f.apply(this, a);
            } finally {
                stapel.pop();
            }
        };
    }
    // DIE TREUE: jeder Gang, der die Welt änderte (`_standMeldet(…, gewirkt)`) — nach einer Ruhe zeigt ein Gang mit
    // gebrochener Wache, ob die Wache eine Änderung verschlief (er wirkte dann).
    let wirkt = leer();
    if (typeof P._standMeldet === "function") {
        const f = (orig._standMeldet = P._standMeldet);
        P._standMeldet = function (name, besucht, gewirkt, offen) {
            if (gewirkt && name in wirkt) wirkt[name]++;
            return f.call(this, name, besucht, gewirkt, offen);
        };
    }
    // DIE WELT-MATRIZEN: jeder Besuch von `updateMatrixWorld` (ein Knoten je Gang) und jede neu gesetzte lokale Matrix.
    const O = window.THREE && window.THREE.Object3D ? window.THREE.Object3D.prototype : null;
    const mx = { knoten: 0, compose: 0 };
    const oUMW = O ? O.updateMatrixWorld : null;
    const oUM = O ? O.updateMatrix : null;
    if (O) {
        O.updateMatrixWorld = function (...a) {
            mx.knoten++;
            return oUMW.apply(this, a);
        };
        O.updateMatrix = function (...a) {
            mx.compose++;
            return oUM.apply(this, a);
        };
    }
    return {
        namen,
        frame() {
            const aus = frame;
            aus.ms = ms;
            aus.wirkt = wirkt;
            aus.matrix = { knoten: mx.knoten, compose: mx.compose };
            frame = leer();
            ms = leer();
            wirkt = leer();
            mx.knoten = mx.compose = 0;
            return aus;
        },
        aus() {
            for (const m in orig) P[m] = orig[m];
            if (O) {
                O.updateMatrixWorld = oUMW;
                O.updateMatrix = oUM;
            }
        },
    };
}

// Eine Phase (Liste von Frames) → je Takt: Einheiten Summe, Mittel, Max, Frames mit Arbeit; Zeit je Takt; Matrizen.
function standPhase(frames) {
    const aus = { frames: frames.length, takte: {} };
    const namen = frames.length
        ? Object.keys(frames[0]).filter((n) => !["ms", "wirkt", "matrix", "cpu"].includes(n))
        : [];
    const mittel = (f) =>
        frames.length ? +(frames.reduce((a, x) => a + (f(x) || 0), 0) / frames.length).toFixed(3) : 0;
    for (const n of namen) {
        let s = 0,
            max = 0,
            mitArbeit = 0;
        for (const f of frames) {
            const v = f[n] | 0;
            s += v;
            if (v > max) max = v;
            if (v > 0) mitArbeit++;
        }
        aus.takte[n] = {
            summe: s,
            mittel: frames.length ? +(s / frames.length).toFixed(2) : 0,
            max,
            mitArbeit,
            ms: mittel((f) => f.ms && f.ms[n]),
            wirkt: frames.reduce((a, f) => a + ((f.wirkt && f.wirkt[n]) | 0), 0),
        };
    }
    aus.summe = Object.values(aus.takte).reduce((a, t) => a + t.summe, 0);
    aus.ms = +Object.values(aus.takte)
        .reduce((a, t) => a + t.ms, 0)
        .toFixed(3);
    aus.matrix = {
        knoten: mittel((f) => f.matrix && f.matrix.knoten),
        compose: mittel((f) => f.matrix && f.matrix.compose),
    };
    aus.cpu = mittel((f) => f.cpu);
    return aus;
}

// DER ECHTE LOOP (Werkbank, echter Renderer): rAF, der Spiel-Takt wie im Spiel, die Bühne hält Mittag · Sonne · Sommer,
// das Wetter friert. Nach `ein` s und der Ruhe (Chunks gleich, Foundry und Karten-Bäcker leer, höchstens `ruhe` s) misst
// er vier Phasen à n Frames: B (die Wache) · A (die Wache gebrochen: `_standRuht` schläft nie — jeder Takt geht wie vor
// der Welle) · A · B. Gezählt je Phase: Einheiten je Takt, Zeit je Takt, Matrizen je Frame, CPU des Takts.
function standLauf(k) {
    return (async () => {
        const rend = st.renderer;
        const P = Object.getPrototypeOf(r);
        window.__buehne();
        if (k.tiere !== "frei") window.__halten?.();
        const decke = st.perfTargetMs;
        if (k.regler === "voll") st.perfTargetMs = 1000;
        const L = window.__standLinseAn();
        let ziel = null;
        let S = null; // die Sim-Linse (Phase S), nur in ihrer Phase gelegt — sie hüllt jede Methode
        let simZiel = null;
        rend.setAnimationLoop((t) => {
            window.__wetterHalten();
            L.frame();
            if (S) S.frame();
            const c0 = performance.now();
            if (window.__ortSchritt) window.__ortSchritt();
            r._gameLoopTick(t);
            const f = L.frame();
            f.cpu = performance.now() - c0;
            if (ziel) ziel.push(f);
            if (S && simZiel) simZiel.push(S.frame());
        });
        const ruheRuf = P._standRuht;
        const aus = { phasen: {}, folge: [] };
        try {
            await sleep((k.ein || 5) * 1000);
            const zustand = () =>
                [
                    st.voxelChunks ? st.voxelChunks.size : 0,
                    r._weltOffen().foundry, // die Foundry, wie das Wort „die Welt steht" sie zählt (A9)
                    (r._impostorBakeQueue || []).length,
                ].join("|");
            const t0 = performance.now();
            let vor = zustand(),
                ruhigSeit = performance.now();
            while (performance.now() - t0 < (k.ruhe || 120) * 1000) {
                await sleep(250);
                const z = zustand();
                if (z !== vor || !/\|0\|0$/.test(z)) ruhigSeit = performance.now();
                vor = z;
                if (performance.now() - ruhigSeit >= 3000) break;
            }
            aus.ruheNachS = +((performance.now() - t0) / 1000).toFixed(1);
            aus.zustand = vor;
            const n = k.n || 120;
            const fahre = async (name, bruch) => {
                if (bruch)
                    P._standRuht = function (...a) {
                        ruheRuf.apply(this, a);
                        return false;
                    };
                else P._standRuht = ruheRuf;
                // ein Frame Anlauf (die Wache schläft nach einem vollen leeren Gang wieder ein), dann n Frames
                await sleep(400);
                const fs = [];
                ziel = fs;
                while (fs.length < n) await sleep(50);
                ziel = null;
                const ph = window.__standPhase(fs.slice(0, n));
                aus.folge.push(name);
                (aus.phasen[name] = aus.phasen[name] || []).push(ph);
            };
            await fahre("B", false);
            await fahre("A", true);
            await fahre("A", true);
            await fahre("B", false);
            // (S) DIE SIMS (feld.K3): `sim` Sekunden Spielzeit Ruhe, die Sim-Linse zählt jede langsame Simulation
            if (k.sim > 0) {
                P._standRuht = ruheRuf;
                S = window.__simLinseAn();
                await sleep(400);
                const fs = [];
                const z0 = st.spielZeit;
                simZiel = fs;
                while (st.spielZeit - z0 < k.sim) await sleep(250);
                simZiel = null;
                aus.simRuhe = window.__simPhase(fs, st.spielZeit - z0);
            }
        } finally {
            P._standRuht = ruheRuf;
            rend.setAnimationLoop(null);
            if (S) S.aus();
            L.aus();
            st.perfTargetMs = decke;
        }
        aus.ruhe = aus.phasen.B[aus.phasen.B.length - 1];
        aus.ruheOnly = true;
        return aus;
    })();
}

// DAS URTEIL (gate:stand-takt; `werkbank stand` urteilt nur über die Ruhe):
//   RUHE    — in KEINEM Frame der Ruhe arbeitet ein Fege-Takt (0 Einheiten);
//   SCHARF  — derselbe Stand mit gebrochener Wache (jeder Takt geht) zeigt JEDEN Takt arbeitend (die Linse sieht ihn);
//   TREUE   — mit gebrochener Wache ändert kein Takt die Welt, und jede Treue-Phase geht jeden Takt eine volle,
//             stehende Runde;
//   TÄTER   — je Takt mit einer Runde über mehrere Gänge findet die Treue-Phase die still verstellte Einheit in der
//             zweiten Rundenhälfte (Stufen-Wahl, Streu, Saum);
//   GEHEN   — beim Gehen arbeiten Ring, Stufen-Wahl und Cull (die Änderung kostet), und der Spieler kommt voran;
//   WECKEN  — ein Bau im Stand weckt Cull und Stufen-Wahl, der Bau steht danach, und die Wache schläft wieder; ein
//             Regler-Schritt weckt den Cull, ein Wahrnehmungs-Schritt (LOD_DISTANCES) Stufen-Wahl und Streu;
//   STROM   — ein Sprung an einen fremden Ort baut den Spieler-Chunk (Streaming heilig), auch nach der Ruhe;
//   PAGE    — kein Page-Error.
// DAS URTEIL DER SIMS (feld.K3): in 60 s Ruhe nach einer Tat (Ernte, Leben) arbeitet keine Sim und kein Akt; ihr Ereignis weckt
// jede (sonst STUMPF), danach schläft sie; der Wasser-Automat geht nach einem Wecken am Fixpunkt genau EINEN Takt; das Feld und
// der Brand arbeiten nur in berührten Zellen.
const BRAND_JE = 64; // je Zelle des Feuers und Schritt: ihr Gang, die Zündung (Bett, Tempo, acht Ankünfte), die Asche
function simUrteil(b, v) {
    const R = b.simRuhe;
    if (!R || !R.frames) v.push("LEER: keine Sim-Ruhe gemessen");
    else {
        if (!(R.spielS >= 59)) v.push(`LEER: die Sim-Ruhe ging ${R.spielS} s Spielzeit (Soll 60 s)`);
        if (!R.vorher || !R.vorher.ernte || !(R.vorher.leben > 0)) v.push("LEER: vor der Sim-Ruhe fehlt die Tat (Ernte, Leben)");
        v.push(...simRuheZeilen(R, "nach einer Tat"));
    }
    const W = b.simWecken || {};
    for (const [n, wer] of [
        ["saison", "ein Saison-Wort"],
        ["regen", "das Wort Regen"],
        ["wuchs", "ein Schritt des Laub-Radius"],
        ["nachwuchs", "die fällige Ernte"],
    ]) {
        const w = W[n];
        if (!w || !w.wach || !w.nachher || w.offen === 0) v.push(`LEER: keine Weck-Probe für ${n}`);
        else {
            if (!(w.wach.sims[n].summe > 0)) v.push(`STUMPF: ${wer} weckt ${n} (${SIMS[n][0].join(" · ")}) nicht`);
            const t = w.nachher.sims[n];
            if (t.summe > 0) v.push(`WECKEN-SIM: nach dem Ereignis schläft ${n} nicht wieder — ${t.summe} Einheiten (${simJe(t)})`);
        }
    }
    if (W.nachwuchs && !W.nachwuchs.nachgewachsen) v.push("NACHWUCHS: die Ernte wuchs zu ihrer Zeit nicht nach");
    // (feld.K3#2) das Feld: vier Wellen Taten, die vorige tot — danach keine Tote in der Karte, die Räumung ging nie über eine
    // ganze Karte (`·lifeField` …) noch über ihr Todes-Rad (`·lifeField.tod` …: sie nimmt die fälligen Eimer aus ihrer Halde) und
    // kostete höchstens zwei Einheiten je geschriebener Zelle
    const F = W.feld;
    if (!F || !F.wellen || F.wellen.length < 4 || !(F.geschrieben > 0)) v.push("LEER: die Feld-Probe schrieb keine vier Wellen");
    else {
        const arbeit = F.welle.sims.feld.summe + F.welle.akt;
        if (!(arbeit > 0)) v.push("STUMPF: die Taten im Feld zeigen der Sim-Linse keine Räumung");
        if (F.wellen.some((w) => w.tote > 0))
            v.push(`FELD-TOTE: nach den Wellen trägt die Karte ${F.wellen.map((w) => w.tote + " von " + w.groesse).join(" · ")} tote Zellen — sie räumt nach einer Schwelle, nicht am Tod`);
        const karte = Object.entries(F.welle.aktAlle || {}).filter(([m]) => /^·[A-Za-z]+(.tod)?$/.test(m));
        if (karte.length || arbeit > 2 * F.geschrieben)
            v.push(`FELD-BESUCH: die Wellen kosteten ${arbeit} Einheiten für ${F.geschrieben} geschriebene Zellen` +
                (karte.length ? `, die Räumung ging über die ganze Karte oder ihr Rad (${karte.map((x) => x.join(" ")).join(", ")})` : "") + " — sie besucht Unberührte");
    }
    // (stoffe.K2 · feld.K3#2) der Brand arbeitet nur in seinen Zellen (≤ BRAND_JE je Zelle und Schritt), seine Front läuft mit
    // dem Wind 0,5–2 m/s, gegen ihn ≤ 0,2 m/s und ohne ihn nirgends ≥ 0,5 m/s (die Mutante), er erlischt im Regen, hinterlässt
    // Asche, leuchtet, glüht und schläft danach
    const Z = W.brand;
    if (!Z || !Z.start) v.push("LEER: an der Mess-Wiese fing kein Brand");
    else {
        const i = Z.zellen.findIndex((n, k) => Z.einheiten[k] > BRAND_JE * n);
        if (!Z.einheiten.some((e) => e > 0)) v.push("STUMPF: der Brand brennt, die Sim-Linse sieht keinen Takt");
        if (i >= 0) v.push(`BRAND-ZELLEN: Schritt ${i + 1} kostete ${Z.einheiten[i]} Einheiten bei ${Z.zellen[i]} brennenden Zellen (Soll ≤ ${BRAND_JE} je Zelle)`);
        if (Z.brennt) v.push(`BRAND-ERLISCHT: im Regen brennen noch ${Z.brennt} Zellen`);
        if (!(Z.mit >= 0.5 && Z.mit <= 2)) v.push(`FRONT-MIT: ${Z.koepfe} Köpfe mit dem Wind, Median ${Z.mit} m/s (Soll 0,5–2)`);
        if (!(Z.gegen <= 0.2)) v.push(`FRONT-GEGEN: gegen den Wind bis ${Z.gegen} m/s (Soll ≤ 0,2)`);
        if (!(Z.ohneWind < 0.5)) v.push(`BRAND-BLIND: ohne Wind läuft die Front bis ${Z.ohneWind} m/s`);
        if (!(Z.asche >= 1) || !(Z.lebNach < Z.lebVor - 0.1)) v.push(`BRAND-ASCHE: ${Z.asche} Aschen, lebendig am Herd ${Z.lebVor} → ${Z.lebNach}`);
        if (!(Z.glut > 0) || !Z.licht) v.push(`BRAND-LESER: glut am Herd +${Z.glut}, Leuchtquelle ${Z.licht ? "da" : "fehlt"}`);
        if (Z.nachher.sims.brand.summe > 0) v.push(`BRAND-RUHE: nach dem Erlöschen arbeitet der Brand — ${Z.nachher.sims.brand.summe} Einheiten`);
    }
    const A = W.wasser;
    if (!A || !(A.chunks > 0)) v.push("LEER: am Fluss weckt die Werk-Setzung keinen Chunk des Automaten");
    else
        A.takte.forEach((t, i) => {
            const wo = `am Fluss (${A.ort}), Wecken ${i + 1}`;
            if (A.bewegt[i] > 0.25) v.push(`LEER: ${wo} bewegte der Automat ${A.bewegt[i]} — kein Fixpunkt`);
            else if (t !== 1)
                v.push(`FIXPUNKT-WASSER: ${wo} ging der Automat ${t} Takte, ${A.gehalten[i]} Chunks blieben ohne Bewegung wach (Soll 1)`);
        });
    return v;
}

// Die Schwelle eines synchronen Chunk-Baus im Takt (ORT, K69-2): ein halber Frame des Profi-Bands (16,7 ms).
const SYNC_CHUNK_MS = 8;
function standUrteil(b) {
    const v = [];
    const namen = b.namen || Object.keys(TAKTE);
    const R = b.ruhe;
    if (!R || !R.frames) v.push("LEER: keine Ruhe-Phase gemessen");
    else
        for (const n of namen) {
            const t = R.takte[n];
            if (!t) v.push(`LEER: der Takt ${n} fehlt in der Ruhe-Phase`);
            else if (t.summe > 0)
                v.push(
                    `RUHE: ${n} (${TAKTE[n]}) arbeitet im Stand — ${t.summe} Einheiten in ${t.mitArbeit} von ${R.frames} ` +
                        `Frames (Mittel ${t.mittel}, max ${t.max}): ein Fege-Takt rechnet seine Nachbarschaft neu, obwohl sich nichts änderte`
                );
        }
    // TREUE: derselbe Stand mit gebrochener Wache — jeder Takt geht, und keiner ändert die Welt (sonst verschlief die
    // Wache eine Änderung: eine Eingabe, die der Stempel nicht kennt).
    const treue = (ph, wo, ohne) => {
        for (const n of namen) {
            const t = ph && ph.takte[n];
            if (t && t.wirkt > 0 && !(ohne && n in ohne))
                v.push(
                    `TREUE: ${n} (${TAKTE[n]}) änderte mit gebrochener Wache ${wo} die Welt in ${t.wirkt} Gängen — die ` +
                        `Wache verschlief eine Änderung (eine Eingabe, die der Stempel nicht kennt)`
                );
        }
    };
    if (b.ruheOnly) {
        if (b.phasen && b.phasen.A) treue(b.phasen.A[0], "nach der Ruhe");
        if (b.simRuhe) v.push(...simRuheZeilen(b.simRuhe, "(echter Loop)"));
        return v;
    }
    simUrteil(b, v);
    // DIE RUNDE: eine Treue-Phase geht JEDEN Takt mindestens eine volle Runde (die Einheiten, die er `_standRuht` als Runde
    // nennt) — ein Teil der Runde sähe eine verschlafene Änderung dahinter nie.
    const runde = (ph, wo) => {
        for (const n of namen) {
            const t = ph && ph.takte[n];
            if (!t || t.runde === undefined) v.push(`LEER: die Treue-Phase ${wo} nennt die Runde von ${n} nicht`);
            else if (!(t.gang >= t.runde))
                v.push(
                    `TREUE-LÜCKE: ${n} (${TAKTE[n]}) ging ${wo} ${t.gang} von ${t.runde} Einheiten seiner Runde — die ` +
                        `Treue sah nur einen Teil der Welt`
                );
            // die Runde muss während der Phase stehen: wächst sie, liegen die neuen Einheiten hinter dem Cursor ungesehen
            if (t && t.rundeVon !== undefined)
                v.push(
                    `TREUE-LÜCKE: ${n} (${TAKTE[n]}) änderte ${wo} seine Runde (${t.rundeVon} → ${t.runde} Einheiten) — ` +
                        `Einheiten hinter dem Cursor blieben ungesehen`
                );
        }
    };
    const S = b.bruch;
    if (!S || !S.frames) v.push("LEER: keine Bruch-Phase — die Linse ist ungeprüft");
    else {
        treue(S, "nach der Ruhe");
        runde(S, "nach der Ruhe");
        for (const n of namen) {
            const t = S.takte[n];
            if (!t || !(t.summe > 0))
                v.push(
                    `STUMPF: mit gebrochener Wache zählt die Linse für ${n} keine Arbeit — sie sähe den Täter nicht`
                );
        }
    }
    const G = b.gehen;
    if (!G || !G.frames) v.push("LEER: keine Geh-Phase");
    else {
        for (const n of ["archLod", "archCull", "streuLod", "nahStreu"])
            if (!G.takte[n] || !(G.takte[n].summe > 0))
                v.push(`STARR: beim Gehen arbeitet ${n} nicht — eine gehaltene Wahl wäre ein Loch`);
        // Gehen kostet nur die Änderung: der Ring liest die Spieler-Zelle, der Saum die Chunk-Menge und die Anker-Generation des
        // Fern-Rings — beide prüft nur ein Gang, der in seiner Zelle bleibt (tritt er über die Grenze, wechseln Chunks ihre Stufe,
        // und Ring und Saum gehen zu Recht)
        if (G.zelleGleich === false) v.push("LEER: der Gang verließ seine Zelle — Ring und Saum ungeprüft");
        if (G.zelleGleich && G.takte.strom && G.takte.strom.summe > 0)
            v.push(
                `GEHEN: der Ring geht ohne Zellen-Wechsel (${G.takte.strom.summe} Einheiten) — Gehen kostet mehr als die Änderung`
            );
        if (G.zelleGleich && G.ankerGleich && G.takte.deckWache && G.takte.deckWache.summe > 0)
            v.push(
                `GEHEN: der Saum geht ohne neuen Anker (${G.takte.deckWache.summe} Einheiten) — Gehen kostet mehr als die Änderung`
            );
        if (G.zelleGleich === undefined || G.ankerGleich === undefined)
            v.push("LEER: die Geh-Phase nennt Zelle und Anker nicht");
        if (!(G.weg > 1)) v.push(`BEWEGUNG: beim Gehen kam der Spieler ${G.weg} m voran (Soll > 1 m)`);
    }
    const W = b.wecken;
    if (!W) v.push("LEER: keine Weck-Phase");
    else {
        if (!W.eintrag) v.push("WECKEN: der Bau im Stand entstand nicht");
        for (const n of ["archCull", "archLod"])
            if (!W.phase || !W.phase.takte[n] || !(W.phase.takte[n].summe > 0))
                v.push(`WECKEN: ein Bau im Stand weckt ${n} nicht — die Wache verschliefe die Welt`);
        if (!W.treue) v.push("LEER: keine Treue nach dem Bau");
        else {
            treue(W.treue, "nach dem Bau");
            runde(W.treue, "nach dem Bau");
        }
        if (!W.regler) v.push("LEER: kein Regler-Schritt in der Weck-Phase");
        else if (!W.regler.takte.archCull || !(W.regler.takte.archCull.summe > 0))
            v.push("WECKEN: ein Regler-Schritt (der Cull-Radius) weckt archCull nicht — der Rand bliebe stehen");
        // der Stempel liest die Wahrnehmung selbst (kein Weckruf am Schreiber): eine neue LOD-Distanz weckt die Stufen-Wahlen
        if (!W.wahrnehmung) v.push("LEER: kein Wahrnehmungs-Schritt in der Weck-Phase");
        else
            for (const n of ["archLod", "streuLod"])
                if (!W.wahrnehmung.takte[n] || !(W.wahrnehmung.takte[n].summe > 0))
                    v.push(
                        `WECKEN: ein Wahrnehmungs-Schritt (LOD_DISTANCES, ohne Weckruf) weckt ${n} nicht — der Stempel ` +
                            `liest die Wahrnehmung nicht`
                    );
        if (W.eintrag && !W.versorgt)
            v.push("WECKEN: der neue Bau trägt nach dem Wecken weder Stufe noch Gestalt (der Cull-Gang ging ihn nie)");
        if (!W.nachher || W.nachher.summe > 0)
            v.push(
                `WECKEN: nach dem Bau schläft die Wache nicht wieder (${W.nachher ? W.nachher.summe : "?"} Einheiten in Ruhe)`
            );
    }
    // DIE TÄTER: jeder Takt, dessen Runde mehrere Gänge braucht (Runde × Frames > Gang — der Gang eines Frames deckt sie
    // nicht), trägt in der zweiten Hälfte seiner Runde eine still verstellte Einheit (eine Änderung ohne Weckruf); die
    // Treue-Phase muss jede finden — sonst ist sie für die zweite Rundenhälfte blind.
    const X = b.taeter;
    if (!X || !X.phase || !X.je) v.push("LEER: keine Täter-Probe der Treue");
    else {
        for (const n of namen) {
            const t = X.phase.takte[n];
            const x = X.je[n];
            const mehrGang = !!t && t.runde * X.phase.frames > t.gang;
            if (!x) {
                if (mehrGang)
                    v.push(
                        `LEER: kein Täter für ${n} (${TAKTE[n]}) — seine Runde (${t.runde} Einheiten) braucht mehrere Gänge`
                    );
                continue;
            }
            if (!(x.stelle >= x.runde / 2))
                v.push(
                    `LEER: der Täter von ${n} steht an Stelle ${x.stelle} von ${x.runde} — nicht in der zweiten Rundenhälfte`
                );
            if (!t || !(t.wirkt > 0))
                v.push(
                    `TREUE-TÄTER: die Treue-Phase sah die verschlafene Einheit von ${n} (${TAKTE[n]}) an Stelle ${x.stelle} ` +
                        `von ${x.runde} nicht (gegangen ${t ? t.gang : "?"}) — für die zweite Rundenhälfte ist die Treue blind`
                );
        }
        treue(X.phase, "mit den Tätern", X.je); // die Takte ohne Täter bleiben treu
        runde(X.phase, "mit den Tätern");
    }
    // (U) STUFE: ein reiner Stufen-Wechsel (dieselbe Fläche im Gesetz, der Morph trägt sie) regt nur die Boden-Karte —
    // nie Stufen-Wahl, Cull, Streu, Ring oder Saum, nie Wald-Setzung oder Sichthöhen
    const U = b.stufe;
    if (!U) v.push("LEER: keine Stufen-Phase");
    else if (!(U.wechsel > 0)) v.push("STUFE: kein Stufen-Wechsel geschah — die Probe ist stumpf");
    else {
        const fremd = Object.entries(U.takte || {}).filter(([n, x]) => x > 0 && n !== "nahWiese" && n !== "nahStreu");
        if (fremd.length)
            v.push(
                `STUFE: ${U.wechsel} Stufen-Wechsel ohne Form-Änderung wecken ${fremd.map(([n, x]) => `${n} (${x} Einheiten)`).join(", ")}`
            );
        for (const m of ["_lodTreeVisHeight", "_forestStehtFrei", "_forestCellDarts"])
            if ((U.rufe || {})[m] > 0)
                v.push(
                    `STUFE: ${U.wechsel} Stufen-Wechsel ohne Form-Änderung rufen ${m} ${U.rufe[m]}× (Wald-Setzung, Sichthöhen)`
                );
    }
    // (O) ORT: ein Erdbau abseits wirft nur, was er ändern kann — der Stand des Walds (an ihm hängt die Gestalt jedes
    // Orts), die fernen Wald-Zellen, die fernen Chunk-Gedächtnisse und der Stand eines fernen Chunks bleiben.
    const O = b.ort;
    if (!O) v.push("LEER: keine Ort-Phase");
    else if (!O.gelegt) v.push("LEER: die Ort-Phase legte keinen Erdbau — die Probe ist stumpf");
    else if (!(O.darts && O.darts.fern > 0))
        v.push(`LEER: die Ort-Phase sah keine fernen Wald-Zellen (über ${O.fern} m) — die Probe ist stumpf`);
    else {
        const wo = `der Erdbau bei (${O.ort})`;
        const riss =
            `die ${O.takte} Takte danach planten ${O.plan} Wald-Zellen neu (\`_forestCellDarts › planForestCell\`), ` +
            `der längste ${O.maxTaktMs} ms`;
        if (O.standNach !== O.standVor)
            v.push(
                `ORT: ${wo} warf das Dart-Gedächtnis der Welt (Stand des Walds ${O.standVor} → ${O.standNach}: die Gestalt ` +
                    `jedes Orts fällt mit, \`_erdbauSetzen\`) — ${riss}`
            );
        if (O.darts.gehalten < O.darts.fern)
            v.push(
                `ORT: ${wo} warf ${O.darts.fern - O.darts.gehalten} von ${O.darts.fern} fernen Wald-Zellen (über ${O.fern} m, ` +
                    `\`_erdbauSetzen\`) — ${riss}`
            );
        for (const [n, c] of Object.entries(O.chunks || {}))
            if (c.gehalten < c.fern)
                v.push(
                    `ORT: ${wo} warf ${c.fern - c.gehalten} von ${c.fern} fernen Chunk-Gedächtnissen (${n}, über ${O.fern} m)`
                );
        // die Räumung seines Grunds speichert die Welt nie synchron (`removeArchitecture › saveState`)
        const Q = O.raeumung;
        if (!Q || !(Q.abbau > 0)) v.push("LEER: die Ort-Phase räumte keine Natur — der Abbau ist ungeprüft");
        else if (Q.saves > 0)
            v.push(
                `ORT: der Abbau von ${Q.abbau} Natur-Stücken speicherte die Welt ${Q.saves}× synchron (\`removeArchitecture › ` +
                    `saveState\`, Σ ${Q.saveMs} ms) — räumt ein Dorf beim Nähern seinen Grund, liegt je Stück ein voller Save im Takt`
            );
        // das Solo-Haus (Vorschau, KI): der Wirt baut nie das ganze Haus im Kern, um die Kamin-Spitze zu finden — sie reist mit der Hülle
        const H = O.kamin;
        if (!H || !H.gesetzt) v.push("LEER: die Ort-Phase setzte kein Solo-Haus — die Wurzel ist ungeprüft");
        else if (H.bau > 0)
            v.push(
                `ORT: das Solo-Haus (${H.kultur}) baute seinen Kern ${H.bau}× im Haupt-Faden (\`spawnArchitecture › ` +
                    `chimneyTipFromParams › massBau\`, ${H.ms} ms) — die Kamin-Spitze reist mit der Hülle aus dem Worker ` +
                    `(\`__huelle.kamin\` → \`_hausHuelleSetzen\`), der Wirt baut kein Haus`
            );
        // der Baum in frischem Wald (ein Hof-Baum des Dorfs, `_naturSetzen`): seine Zellen plant die Schlange des Walds im Takt
        const Wd = O.wald;
        if (!Wd || !Wd.gesetzt)
            v.push("LEER: die Ort-Phase setzte keinen Baum in frischem Wald — der Wald-Plan ist ungeprüft");
        else {
            if (Wd.synchron > 0)
                v.push(
                    `ORT: der Baum in frischem Wald bei (${Wd.ort}) plante ${Wd.synchron} Wald-Zellen synchron ` +
                        `(\`_ortGestaltSame › _forestStehtFrei › planForestCell\`, ${Wd.ms} ms) — die Gestalt plant am Stück ` +
                        `im Aufrufer, die Ausstattung eines Dorfs wird eine Lawine neben dem Takt`
                );
            if (!Number.isInteger(Wd.gestalt))
                v.push(
                    `ORT: die Gestalt des Baums in frischem Wald steht nach ${Wd.takte} Takten nicht — die Schlange des ` +
                        `Walds (\`_tickWaldPlan\`) plant seine Zellen nicht`
                );
            if (Wd.maxTaktMs > 40)
                v.push(
                    `ORT: die Schlange des Walds plante in EINEM Takt ${Wd.maxTaktMs} ms (${Wd.maxTaktZellen} Zellen) — ` +
                        `ihr Budget (\`WALD_PLAN.ms\`) hält nicht`
                );
        }
        // das Haus im Satz: sein Wieder-Eintritt (jeder Stufen-Wechsel) legt keine Ecke frisch an (`_satzBlock`)
        const SH = O.satzHaus;
        if (!SH || !SH.gesetzt || !(SH.bloecke > 0) || !(SH.ecken >= 1000))
            v.push(
                `LEER: die Ort-Phase brachte kein Haus in den Bau-Satz (` +
                    (SH && SH.gesetzt
                        ? `${SH.kultur}, ${SH.gruppen || 0} Gruppen, ${SH.ecken || 0} Ecken nach ${SH.takte} Takten`
                        : "keins gesetzt") +
                    `) — der Satz-Block ist ungeprüft`
            );
        else if (SH.frischKB > 64)
            v.push(
                `ORT: das Haus im Satz (${SH.kultur}, ${SH.ecken} Ecken in ${SH.gruppen} Gruppen) legte beim Wieder-Eintritt ` +
                    `${(SH.frischKB / 1024).toFixed(1)} MB frisch an (\`_tickBauSatz › _bauSatzBlock › _satzBlock\`, ` +
                    `${SH.bloecke} Blöcke) — jeder Stufen-Wechsel eines Hauses schreibt seine Ecken neu in den Heap, die volle ` +
                    `Sammlung fällt in den Takt`
            );
        if (!O.stand || !O.stand.key)
            v.push("LEER: die Ort-Phase fand keinen fernen Chunk für den Stand der Worker-Antworten");
        else if (!O.stand.gleich)
            v.push(
                `ORT: ${wo} verwarf die Worker-Antworten des fernen Chunks ${O.stand.key} (Stand ${O.stand.vor} → ` +
                    `${O.stand.nach}) — der Worker baut fern neu, was der Erdbau nie berührt`
            );
        // DER ERDBAU UNTER DEM SPIELER: der Chunk-Stoff entsteht im Worker, nie im Haupt-Faden (Lehre 14) — ein Takt,
        // der einen Chunk synchron baut (`_buildVoxelChunkData`) über SYNC_CHUNK_MS, ist der Riss beim Namen seiner Rufer.
        const AS = O.amSpieler;
        if (!AS || !AS.gelegt)
            v.push("LEER: die Ort-Phase legte keinen Erdbau unter dem Spieler — die Probe ist stumpf");
        else if (!(AS.dirty > 0))
            v.push("LEER: der Erdbau unter dem Spieler markierte keinen Chunk zum Neubau — die Probe ist stumpf");
        else {
            const riss = (AS.sync || []).filter((s) => s.ms > SYNC_CHUNK_MS);
            if (riss.length) {
                const max = riss.reduce((a, s) => (s.ms > a.ms ? s : a), riss[0]);
                v.push(
                    `ORT: der Erdbau unter dem Spieler bei (${AS.ort}) baute ${riss.length} Chunk${riss.length > 1 ? "s" : ""} ` +
                        `synchron im Haupt-Faden (\`${max.kette} › _buildVoxelChunkData\`, der längste ${max.ms} ms) — ` +
                        `der Chunk-Stoff entsteht im Worker`
                );
            }
            if (!AS.heil)
                v.push(
                    `ORT: der Erdbau unter dem Spieler bei (${AS.ort}) heilt nicht — nach ${AS.takte} Takten warten noch ` +
                        `Chunks auf ihren Neubau`
                );
        }
    }
    const T = b.strom;
    if (!T) v.push("LEER: keine Strom-Phase");
    else if (!T.spielerChunk)
        v.push(
            `STROM: nach dem Sprung an (${T.x}, ${T.z}) steht der Spieler-Chunk nach ${T.takte} Takten nicht — das Streaming verhungert`
        );
    // der Wald am fremden Ort: jede frische Zelle plant die Schlange des Walds (`_tickWaldPlan`, K69) — ein anderer Aufrufer
    // plant sie am Stück im Takt
    if (T) {
        const Wd = T.wald;
        if (!Wd) v.push("LEER: die Strom-Phase zählte den Wald-Plan nicht");
        else if (Wd.aussen > 0)
            v.push(
                `STROM: ${Wd.aussen} frische Wald-Zellen plante nicht die Schlange des Walds, sondern \`${Wd.taeter}\` ` +
                    `(${Wd.ms} ms, bis ${Wd.maxTakt} in EINEM Takt) — der Plan liegt am Stück im Aufrufer`
            );
        else if (!(Wd.imJob > 0))
            v.push("LEER: die Strom-Phase sah keinen frischen Wald — der Wald-Plan am fremden Ort ist ungeprüft");
    }
    const N = b.nachschub;
    if (!N) v.push("LEER: keine Nachschub-Probe (die Streu nach der Schlange des Walds)");
    else if (N.warten.length && (N.schlange > 0 || N.foundry > 0))
        v.push(
            `NACHSCHUB: nach ${N.takte} Takten plant die Schlange des Walds noch ${N.schlange} Zellen, die Foundry hat ` +
                `${N.foundry} Aufträge offen — ${N.warten.length} Streu-Regionen warten (${N.warten.join(", ")})`
        );
    else if (N.warten.length)
        v.push(
            `NACHSCHUB: ${N.warten.length} Streu-Regionen warten, obwohl die Schlange des Walds leer ist und kein Asset ` +
                `aussteht (${N.warten.join(", ")}) — nichts baut sie neu (_scatterRefillPending, _tickWaldPlan)`
        );
    // (K) DIE FÜHRUNG FERN: führt ein Studio die Kamera jenseits des Rings (`kameraFuehren`, eine Sonde), steht die Welt — kein
    // Fege-Takt wartet auf Boden, den kein Strom baut
    const KF = b.fuehrung;
    if (!KF) v.push("LEER: keine Führungs-Phase (die Kamera jenseits des Rings)");
    else if (!KF.steht)
        v.push(
            `FÜHRUNG: die Kamera bei (${KF.x}, ${KF.z}), ${KF.abstand} m neben dem Spieler — die Welt steht nach ${KF.takte} ` +
                `Takten nicht: ${KF.grund} (ein Fege-Takt wartet auf Boden jenseits des Rings, den kein Strom baut)`
        );
    // (W) WACH: ein Fege-Takt mit Offenem hält die Welt wach, beim Namen
    if (!/Fege-Takt[^]*archCull/.test(b.wach || "")) v.push(`WACH: ein Fege-Takt mit Offenem hält die Welt nicht wach beim Namen (${b.wach || "—"})`);
    // (B) BAKE-SCHULD: die Welt steht erst ohne Schuld der Bake-Uhr, „offen" nennt die Felder
    const BS = b.schuld || {};
    if (BS.rest !== 0 || !(BS.abgewiesen > 0) || !/Felder offen/.test(BS.grund))
        v.push(`BAKE-SCHULD: steht nach ${BS.takte} Takten mit ${BS.rest} offenen Fits (${BS.abgewiesen} abgewiesen, ${BS.grund})`);
    // (D) DORF: erst nach dem letzten Haus des Akts steht die Welt
    const D = b.dorf || {};
    if (!(D.placed > 0) || typeof D.steht !== "number")
        v.push(`DORF: die Welt stand nach ${D.steht} Takten mit dem Dorf im Flug (${D.placed} Häuser gesetzt)`);
    // (F) FIXPUNKT: „die Welt steht" (A9) heißt, ohne Eingabe wirkt nichts mehr — nach einem Regler-Schritt mit Wirkung geht nach
    // dem Wort kein Fege-Takt mehr (er stand sonst mitten in seiner Runde)
    if (b.fixWach !== false) v.push(`FIXPUNKT: die Welt hieß stehend — ${b.fixWach}: Stufen-Wahl und Streu gingen noch`);
    const fix = b.fix || [];
    if (!fix.length) v.push("LEER: keine Fixpunkt-Phase");
    else if (!fix.some((F) => F.wirkte > 0 || F.fehler)) v.push("LEER: der Regler-Schritt wirkte nicht — die Fixpunkt-Phase ist stumpf");
    for (const F of fix)
        if (F.fehler) v.push(`FIXPUNKT: nach dem Regler-Schritt steht die Welt nie — ${F.fehler}`);
        else
            for (const [n, t] of Object.entries(F.nach.takte))
                if (t.summe > 0)
                    v.push(
                        `FIXPUNKT: die Welt stand nach ${F.takte} Takten, danach ging ${n} (${TAKTE[n]}) ohne Eingabe noch ${t.summe} ` +
                            `Einheiten in ${t.mitArbeit} von ${F.nach.frames} Takten (${t.wirkt} Wirkungen) — „steht" mitten in seiner Runde`
                    );
    for (const e of b.pageErrors || []) v.push(`PAGE-ERROR: ${e}`);
    return v;
}

module.exports = {
    TAKTE,
    SIMS,
    standUrteil,
    STAND_INSTALL:
        `window.__standLinseAn = () => (${standLinseAn.toString()})(${JSON.stringify(TAKTE)}, ${JSON.stringify(BLAETTER)}, ${JSON.stringify(EIGENE_UHR)});` +
        `window.__simLinseAn = () => (${simLinseAn.toString()})(${JSON.stringify(SIMS)}, ${JSON.stringify(AKTE)});` +
        `window.__simPhase = ${simPhase.toString()};` +
        `window.__standPhase = ${standPhase.toString()};` +
        `window.__standLauf = ${standLauf.toString()};`,
};
