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
//   Urteil:    standUrteil({ ruhe, gehen, wecken, bruch, taeter, schreiber, code, pageErrors }) → [Verletzungen]
//   Wand:      schreiberWand(quelle) → { befunde, schreiber } — jeder Schreiber eines bewachten Zustands und sein Weckruf
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
// Takte mit EIGENER Uhr, die ein Fege-Takt auch im Schlaf ruft (der Nachwuchs im Ring): ihre Blatt-Rufe gehören keinem
// Fege-Takt (gemessen 07.10., Gate beim Gehen: 34,65 Einheiten je Frame „Ring" waren Nachwuchs-Höhen).
const EIGENE_UHR = ["_tickFoliageGrowth"];

function standLinseAn(takte, blaetter, eigeneUhr) {
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
//   TREUE   — mit gebrochener Wache ändert kein Takt die Welt, und jede Treue-Phase geht jeden Takt eine volle Runde;
//   TÄTER   — je Takt mit einer Runde über mehrere Gänge findet die Treue-Phase die still verstellte Einheit in der
//             zweiten Rundenhälfte (Stufen-Wahl, Streu, Saum);
//   SCHREIBER — jeder Schreiber eines bewachten Zustands trägt seinen Weckruf (`schreiberWand`, der Stamm als AST);
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
        return v;
    }
    // DIE RUNDE: eine Treue-Phase geht JEDEN Takt mindestens eine volle Runde (die Einheiten, die er `_standRuht` als Runde
    // nennt) — ein Teil der Runde sähe eine verschlafene Änderung dahinter nie (bis 07.10. liefen die Phasen 6 Frames: an
    // der Mess-Wiese ging die Streu 960 von 1 845 Zellen, der Saum 768 von 1 728 Punkten, die Stufen-Wahl 1 536 von 1 638).
    const runde = (ph, wo) => {
        for (const n of namen) {
            const t = ph && ph.takte[n];
            if (!t || t.runde === undefined) v.push(`LEER: die Treue-Phase ${wo} nennt die Runde von ${n} nicht`);
            else if (!(t.gang >= Math.max(1, t.runde)))
                v.push(
                    `TREUE-LÜCKE: ${n} (${TAKTE[n]}) ging ${wo} ${t.gang} von ${t.runde} Einheiten seiner Runde — die ` +
                        `Treue sah nur einen Teil der Welt`
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
        // Gehen kostet nur die Änderung: der Ring liest die Spieler-Zelle, der Saum die Anker-Generation des Fern-Rings
        if (G.zelleGleich && G.takte.strom && G.takte.strom.summe > 0)
            v.push(
                `GEHEN: der Ring geht ohne Zellen-Wechsel (${G.takte.strom.summe} Einheiten) — Gehen kostet mehr als die Änderung`
            );
        if (G.ankerGleich && G.takte.deckWache && G.takte.deckWache.summe > 0)
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
    for (const x of schreiberUrteil(b.schreiber)) v.push(x);
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

// ─── DIE SCHREIBER-WAND (Gebot 10: die Linse nennt den Täter beim Namen — nie Wachsamkeit) ───
// Die Wache schläft unter ihrem Stempel; was sie weckt, ist der Weckruf an jedem Schreiber eines Zustands, den die Fege-
// Takte lesen. Ein Schreiber ohne Weckruf hielte die Welt unter einer schlafenden Wache fest (bis zum nächsten Schritt des
// Spielers). Warum eine Wand und keine selbst weckende Engstelle: die bewachten Zustände sind drei Behälter verschiedener
// Art (Map, Array, Map) und ein Feld der Chunk-Einträge — ein selbst weckender Behälter ließe die Neu-Zuweisung
// (`= new Map()`, `= []`, `.length = 0`) offen und bräuchte dieselbe Wand. Die Wand liest den Stamm als AST (acorn —
// Kommentare und Zeichenketten fallen mit dem Parser), findet JEDEN Schreiber eines bewachten Zustands — direkt
// (`this.state.F.set`), über einen Alias (`const map = st.F`, `const { F } = st`), über einen Zugriff (eine Methode, die F
// zurückgibt: `_ensureScatterRegionMap()`), per Index, Länge, Zuweisung oder `delete` — und verlangt den Weckruf im
// SELBEN Methoden-Körper (die äußerste Funktion: Methode, statische Zuweisung; Rückrufe darin zählen zu ihr). Ein leerer
// Behälter, wo keiner war (`if (!st.F) st.F = new Map()`, `st.F ||= []`), ändert keine Menge und ist kein Schreiber.
// `boden`: die Boden-Takte (Ring, Saum) lesen den Zustand — der Weckruf ist `_weltRegt(true)`.
const BEWACHT = {
    voxelChunks: { menge: true, boden: true }, // Ring, Saum, Nah-Kacheln (die Boden-Karte)
    waterCells: { menge: false, boden: true }, // ein Feld des Chunk-Eintrags: der Wasser-Weckruf des Rings
    architectures: { menge: true, boden: false }, // Stufen-Wahl, Cull
    scatterRegions: { menge: true, boden: false }, // die Streu-Stufen-Wahl
    scatterHarvested: { menge: true, boden: false }, // die Nah-Streu (die Ernte)
};
const SCHREIB_OPS = new Set([
    "set",
    "delete",
    "clear",
    "add",
    "push",
    "pop",
    "shift",
    "unshift",
    "splice",
    "sort",
    "reverse",
    "fill",
    "copyWithin",
]);

// quelle (Text eines Skripts) → { befunde: [{ methode, feld, zeile, ruf }], schreiber: { feld: [Methoden] }, einheiten }
function schreiberWand(quelle) {
    const acorn = require("acorn");
    const ast = acorn.parse(quelle, { ecmaVersion: "latest", sourceType: "script", locations: true });
    const kinder = (n) => {
        const out = [];
        for (const k in n) {
            if (k === "type" || k === "start" || k === "end" || k === "loc") continue;
            const v = n[k];
            if (Array.isArray(v)) {
                for (const x of v) if (x && typeof x.type === "string") out.push(x);
            } else if (v && typeof v.type === "string") out.push(v);
        }
        return out;
    };
    const istFn = (n) =>
        n.type === "FunctionDeclaration" || n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression";
    const text = (n) => quelle.slice(n.start, n.end).replace(/\s+/g, "");
    const prop = (m) =>
        m && m.type === "MemberExpression"
            ? m.computed
                ? m.property.type === "Literal"
                    ? String(m.property.value)
                    : null
                : m.property.name
            : null;
    const schluessel = (k) =>
        !k ? "?" : k.type === "Identifier" ? k.name : k.type === "Literal" ? String(k.value) : "?";
    // 1. die Einheiten: jede äußerste Funktion; was außerhalb jeder Funktion steht, ist das Modul
    const modul = { name: "(Modul)", knoten: [] };
    const einheiten = [modul];
    const nameVon = (n, e) => {
        if (n.type === "FunctionDeclaration" && n.id) return n.id.name;
        if (!e) return "(anonym)";
        if (e.type === "MethodDefinition") return (e.static ? "static " : "") + schluessel(e.key);
        if (e.type === "AssignmentExpression") return text(e.left);
        if (e.type === "VariableDeclarator") return e.id.type === "Identifier" ? e.id.name : "(anonym)";
        if (e.type === "Property" || e.type === "PropertyDefinition") return schluessel(e.key);
        return "(anonym@" + n.loc.start.line + ")";
    };
    (function sammle(n, eltern) {
        if (istFn(n)) {
            einheiten.push({ name: nameVon(n, eltern), knoten: [n], fn: n });
            return;
        }
        for (const c of kinder(n)) {
            if (!istFn(c) && n === ast) modul.knoten.push(c);
            sammle(c, n);
        }
    })(ast, null);
    // EIN Durchlauf je Einheit (geschachtelte Funktionen zählen zu ihr): er sammelt, was die Wand liest — Deklarationen,
    // Zuweisungen, Rufe, Rückgaben, `delete` — mit dem Urteil „leerer Behälter, wo keiner war" (es liest die Eltern-Kette).
    const leer = (n) =>
        (n.type === "NewExpression" &&
            n.callee.type === "Identifier" &&
            /^(Map|Set|WeakMap|WeakSet)$/.test(n.callee.name) &&
            n.arguments.length === 0) ||
        (n.type === "ArrayExpression" && n.elements.length === 0);
    const hatNicht = (test, ziel) => {
        let ja = false;
        (function such(n) {
            if (ja || !n) return;
            if (n.type === "UnaryExpression" && n.operator === "!" && text(n.argument) === ziel) ja = true;
            else for (const c of kinder(n)) such(c);
        })(test);
        return ja;
    };
    // `if (!st.F) st.F = new Map()` · `st.F ||= []` · `st.F = st.F || new Map()`: ein leerer Behälter, wo keiner war
    const anlage = (a, eltern) => {
        if (a.operator === "||=" || a.operator === "??=") return leer(a.right);
        if (a.operator !== "=") return false;
        const ziel = text(a.left);
        if (
            a.right.type === "LogicalExpression" &&
            (a.right.operator === "||" || a.right.operator === "??") &&
            text(a.right.left) === ziel &&
            leer(a.right.right)
        )
            return true;
        if (!leer(a.right)) return false;
        for (let i = eltern.length - 1; i >= 0; i--) {
            const e = eltern[i];
            if (e.type !== "IfStatement") continue;
            return (eltern[i + 1] || a) === e.consequent && hatNicht(e.test, ziel);
        }
        return false;
    };
    const felder = Object.keys(BEWACHT);
    const istFeld = new Set(felder);
    for (const E of einheiten) {
        const L = (E.l = { dekl: [], zuw: [], ruf: [], rueck: [], del: [] });
        const eltern = [];
        const geh = (n) => {
            const t = n.type;
            if (t === "VariableDeclarator") L.dekl.push(n);
            else if (t === "AssignmentExpression") {
                L.zuw.push(n);
                if (istFeld.has(prop(n.left) || "")) n._anlage = anlage(n, eltern);
            } else if (t === "CallExpression") L.ruf.push(n);
            else if (t === "ReturnStatement") L.rueck.push(n);
            else if (t === "UnaryExpression" && n.operator === "delete") L.del.push(n);
            eltern.push(n);
            for (const c of kinder(n)) if (!(E === modul && istFn(c))) geh(c); // im Modul ist jede Funktion ihre Einheit
            eltern.pop();
        };
        for (const k of E.knoten) geh(k);
    }
    const zugriff = Object.fromEntries(felder.map((f) => [f, new Set()])); // Methoden, die F zurückgeben
    // Ist `n` eine Referenz auf den bewachten Zustand F (in der Einheit E)?
    const istRef = (n, F, E) => {
        if (!n) return false;
        if (n.type === "MemberExpression") return prop(n) === F;
        if (n.type === "Identifier") return E.alias[F].has(n.name);
        if (n.type === "CallExpression") return zugriff[F].has(prop(n.callee) || "");
        if (n.type === "LogicalExpression") return istRef(n.left, F, E);
        return false;
    };
    // die Aliase einer Einheit bis zum Fixpunkt (`const a = st.F; const b = a;`, `const { F } = st`, `x = st.F`)
    const aliase = (E) => {
        E.alias = Object.fromEntries(felder.map((f) => [f, new Set()]));
        for (let neu = true; neu;) {
            neu = false;
            const dazu = (F, name) => {
                if (!E.alias[F].has(name)) {
                    E.alias[F].add(name);
                    neu = true;
                }
            };
            for (const F of felder) {
                if (!BEWACHT[F].menge) continue;
                for (const d of E.l.dekl) {
                    if (!d.init) continue;
                    if (d.id.type === "Identifier" && istRef(d.init, F, E)) dazu(F, d.id.name);
                    if (d.id.type === "ObjectPattern")
                        for (const q of d.id.properties)
                            if (q.type === "Property" && schluessel(q.key) === F) {
                                const v = q.value.type === "AssignmentPattern" ? q.value.left : q.value;
                                if (v.type === "Identifier") dazu(F, v.name);
                            }
                }
                for (const z of E.l.zuw)
                    if (z.operator === "=" && z.left.type === "Identifier" && istRef(z.right, F, E))
                        dazu(F, z.left.name);
            }
        }
    };
    // die Zugriffe bis zum Fixpunkt: eine Methode, die F zurückgibt, ist F (ihr Ruf ist eine Referenz)
    for (let neu = true; neu;) {
        neu = false;
        for (const E of einheiten) {
            aliase(E);
            if (E === modul) continue;
            const kurz = E.name.replace(/^static /, "").replace(/^.*\./, "");
            for (const r of E.l.rueck)
                for (const F of felder)
                    if (BEWACHT[F].menge && r.argument && istRef(r.argument, F, E) && !zugriff[F].has(kurz)) {
                        zugriff[F].add(kurz);
                        neu = true;
                    }
        }
    }
    // die Schreiber und ihre Weckrufe
    const befunde = [];
    const schreiber = Object.fromEntries(felder.map((f) => [f, []]));
    for (const E of einheiten) {
        const schreibt = {};
        const merke = (F, n) => {
            if (!schreibt[F] || n.loc.start.line < schreibt[F]) schreibt[F] = n.loc.start.line;
        };
        let weckt = false,
            wecktBoden = false;
        for (const c of E.l.ruf) {
            const pc = prop(c.callee) || "";
            if (pc === "_weltRegt") {
                weckt = true;
                const a0 = c.arguments[0];
                if (a0 && a0.type === "Literal" && a0.value === true) wecktBoden = true;
            } else if (SCHREIB_OPS.has(pc))
                for (const F of felder) if (BEWACHT[F].menge && istRef(c.callee.object, F, E)) merke(F, c);
        }
        for (const z of E.l.zuw) {
            if (z.left.type !== "MemberExpression") continue;
            const pz = prop(z.left);
            for (const F of felder) {
                if (pz === F) {
                    if (!z._anlage) merke(F, z);
                } else if (BEWACHT[F].menge && (z.left.computed || pz === "length") && istRef(z.left.object, F, E))
                    merke(F, z);
            }
        }
        for (const d of E.l.del) {
            const a = d.argument;
            if (a.type !== "MemberExpression") continue;
            for (const F of felder)
                if (prop(a) === F || (BEWACHT[F].menge && a.computed && istRef(a.object, F, E))) merke(F, d);
        }
        for (const F of Object.keys(schreibt)) {
            schreiber[F].push(E.name);
            if (BEWACHT[F].boden ? !wecktBoden : !weckt)
                befunde.push({
                    methode: E.name,
                    feld: F,
                    zeile: schreibt[F],
                    ruf: BEWACHT[F].boden ? "_weltRegt(true)" : "_weltRegt()",
                });
        }
    }
    return {
        befunde,
        schreiber,
        einheiten: einheiten.length,
        zugriff: Object.fromEntries(felder.map((f) => [f, [...zugriff[f]]])),
    };
}

// Das Urteil der Schreiber-Wand: jeder Schreiber ohne Weckruf beim Namen; eine Wand, die einen bewachten Zustand nie
// schreiben sieht, ist stumpf (ein umbenanntes Feld ließe sie leer laufen).
function schreiberUrteil(s) {
    const v = [];
    if (!s || !s.schreiber) return ["LEER: keine Schreiber-Wand"];
    for (const b of s.befunde)
        v.push(
            `SCHREIBER: ${b.methode} schreibt ${b.feld} (Zeile ${b.zeile}) ohne ${b.ruf} im selben Methoden-Körper — ` +
                `die Wache verschliefe die Änderung`
        );
    for (const F of Object.keys(BEWACHT))
        if (!s.schreiber[F] || s.schreiber[F].length === 0)
            v.push(`STUMPF: die Schreiber-Wand sieht keinen Schreiber von ${F} — der bewachte Zustand heißt anders`);
    return v;
}

module.exports = {
    TAKTE,
    BLAETTER,
    BEWACHT,
    schreiberWand,
    schreiberUrteil,
    standPhase,
    standUrteil,
    STAND_INSTALL:
        `window.__standLinseAn = () => (${standLinseAn.toString()})(${JSON.stringify(TAKTE)}, ${JSON.stringify(BLAETTER)}, ${JSON.stringify(EIGENE_UHR)});` +
        `window.__standPhase = ${standPhase.toString()};` +
        `window.__standLauf = ${standLauf.toString()};`,
};
