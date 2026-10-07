// stand-linse.cjs — DIE STAND-LINSE (Welle K, Lehre 25, Gebot 7): was die Fege-Takte je Frame ARBEITEN, wenn sich nichts
// ändert. Befund 07.10. (OMEN, GTX 1060, Mess-Wiese, Regler voll, der Spieler STEHT): `_loopVoxelStreaming` 3,27 ms je
// Frame, dazu `tickArchitectureCulling`, `_tickArchitectureLOD`, `_lodTreeVisHeight` und noise2D im Selbstzeit-Top —
// gezählt (Radeon, eingeschwungen): je Takt 256 Bau-Einträge der Stufen-Wahl, 1540 Einträge des Cull-Gangs, 160 Streu-
// Zellen, 137 Nah-Streu-Kacheln, 128 Saum-Punkte des Fern-Rings (~6 000 noise2D), 25 Ring-Zellen — und 0 Änderungen.
//
// Die Linse zählt UNABHÄNGIG von der Stand-Wache (`_standRuht`): sie hüllt die Fege-Takte (wer gerade geht) und ihre
// Blatt-Helfer (was ein Gang je Einheit ruft — Stufen-Wahl, Sichthöhe, Karten-Frage, Ring-Stufe, Saum-Punkt, Kachel-
// Armlänge …) und bucht jeden Blatt-Ruf auf den Takt, der ihn rief. Eine Einheit = ein Blatt-Ruf. Ruhe heißt 0. Dazu je
// Frame die Zeit je Takt (Richtwert — die Zeit misst der OMEN) und die Welt-Matrizen: Knoten, die `updateMatrixWorld`
// besucht, und Matrizen, die `updateMatrix` neu setzt (der Szenen-Graph je Gang).
//
//   Seite:     const L = window.__standLinseAn(); … je Frame L.frame() → { strom: n, archLod: n, … , ms: {…}, matrix }; L.aus()
//              window.__standLauf({ ein, ruhe, n, regler, tiere }) — der echte Loop (rAF): Ruhe mit Wache (B), mit
//              gebrochener Wache (A, jeder Takt geht wie vor der Welle), in der Folge B A A B
//   Urteil:    standUrteil({ ruhe, gehen, wecken, bruch, code, pageErrors }) → [Verletzungen] (gate:stand-takt)
//   Werkbank:  node scripts/werkbank.cjs stand [n] [--ein s] [--ruhe max-s] [--regler voll|frei] [--tiere frei|halten]
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
    "_tickWaterCANearWake",
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

function standLinseAn(takte, blaetter) {
    const r = window.anazhRealm;
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
            if (stapel.length) frame[stapel[stapel.length - 1]]++;
            return f.apply(this, a);
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
        const r = window.anazhRealm;
        const st = r.state;
        const rend = st.renderer;
        const P = Object.getPrototypeOf(r);
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        window.__buehne();
        if (k.tiere !== "frei" && window.__tiereHalten) window.__tiereHalten();
        const decke = st.perfTargetMs;
        if (k.regler === "voll") st.perfTargetMs = 1000;
        const L = window.__standLinseAn();
        let ziel = null;
        rend.setAnimationLoop((t) => {
            window.__wetterHalten();
            L.frame();
            const c0 = performance.now();
            if (window.__ortSchritt) window.__ortSchritt();
            r._gameLoopTick(t);
            const f = L.frame();
            f.cpu = performance.now() - c0;
            if (ziel) ziel.push(f);
        });
        const ruheRuf = P._standRuht;
        const aus = { phasen: {}, folge: [] };
        try {
            await sleep((k.ein || 5) * 1000);
            const zustand = () => {
                const f = r._foundry;
                return [
                    st.voxelChunks ? st.voxelChunks.size : 0,
                    (f && f.pending ? f.pending.size : 0) + (f && f.warte ? f.warte.length : 0),
                    (r._impostorBakeQueue || []).length + (r._impostorBakePending ? 1 : 0),
                ].join("|");
            };
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
        } finally {
            P._standRuht = ruheRuf;
            rend.setAnimationLoop(null);
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
//   GEHEN   — beim Gehen arbeiten Ring, Stufen-Wahl und Cull (die Änderung kostet), und der Spieler kommt voran;
//   WECKEN  — ein Bau im Stand weckt Cull und Stufen-Wahl, der Bau steht danach, und die Wache schläft wieder;
//   STROM   — ein Sprung an einen fremden Ort baut den Spieler-Chunk (Streaming heilig), auch nach der Ruhe;
//   CODE    — jeder Fege-Takt fragt `_standRuht` und meldet `_standMeldet`;
//   PAGE    — kein Page-Error.
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
    const treue = (ph, wo) => {
        for (const n of namen) {
            const t = ph && ph.takte[n];
            if (t && t.wirkt > 0)
                v.push(
                    `TREUE: ${n} (${TAKTE[n]}) änderte mit gebrochener Wache ${wo} die Welt in ${t.wirkt} Gängen — die ` +
                        `Wache verschlief eine Änderung (eine Eingabe, die der Stempel nicht kennt)`
                );
        }
    };
    if (b.ruheOnly) {
        if (b.phasen && b.phasen.A) treue(b.phasen.A[0], "nach der Ruhe");
        return v;
    }
    const S = b.bruch;
    if (!S || !S.frames) v.push("LEER: keine Bruch-Phase — die Linse ist ungeprüft");
    else {
        treue(S, "nach der Ruhe");
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
        for (const n of ["strom", "archLod", "archCull"])
            if (!G.takte[n] || !(G.takte[n].summe > 0))
                v.push(`STARR: beim Gehen arbeitet ${n} nicht — eine gehaltene Wahl wäre ein Loch`);
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
        else treue(W.treue, "nach dem Bau");
        if (!W.regler) v.push("LEER: kein Regler-Schritt in der Weck-Phase");
        else if (!W.regler.takte.archCull || !(W.regler.takte.archCull.summe > 0))
            v.push("WECKEN: ein Regler-Schritt (der Cull-Radius) weckt archCull nicht — der Rand bliebe stehen");
        if (W.eintrag && !W.versorgt)
            v.push("WECKEN: der neue Bau trägt nach dem Wecken weder Stufe noch Gestalt (der Cull-Gang ging ihn nie)");
        if (!W.nachher || W.nachher.summe > 0)
            v.push(
                `WECKEN: nach dem Bau schläft die Wache nicht wieder (${W.nachher ? W.nachher.summe : "?"} Einheiten in Ruhe)`
            );
    }
    const T = b.strom;
    if (!T) v.push("LEER: keine Strom-Phase");
    else if (!T.spielerChunk)
        v.push(
            `STROM: nach dem Sprung an (${T.x}, ${T.z}) steht der Spieler-Chunk nach ${T.takte} Takten nicht — das Streaming verhungert`
        );
    const c = b.code || {};
    for (const n of Object.keys(TAKTE)) {
        if (!c[n] || !c[n].fragt) v.push(`CODE: ${TAKTE[n]} fragt die Stand-Wache nicht (\`_standRuht\`)`);
        if (!c[n] || !c[n].meldet) v.push(`CODE: ${TAKTE[n]} meldet seinen Gang nicht (\`_standMeldet\`)`);
    }
    for (const e of b.pageErrors || []) v.push(`PAGE-ERROR: ${e}`);
    return v;
}

module.exports = {
    TAKTE,
    BLAETTER,
    standPhase,
    standUrteil,
    STAND_INSTALL:
        `window.__standLinseAn = () => (${standLinseAn.toString()})(${JSON.stringify(TAKTE)}, ${JSON.stringify(BLAETTER)});` +
        `window.__standPhase = ${standPhase.toString()};` +
        `window.__standLauf = ${standLauf.toString()};`,
};
