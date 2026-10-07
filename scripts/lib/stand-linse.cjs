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
//   TREUE   — mit gebrochener Wache ändert kein Takt die Welt, und jede Treue-Phase geht jeden Takt eine volle,
//             stehende Runde;
//   TÄTER   — je Takt mit einer Runde über mehrere Gänge findet die Treue-Phase die still verstellte Einheit in der
//             zweiten Rundenhälfte (Stufen-Wahl, Streu, Saum);
//   SCHREIBER — jeder Schreiber eines bewachten Zustands ist auf jedem Pfad von seinem Weckruf gedeckt (`schreiberWand`);
//   GEHEN   — beim Gehen arbeiten Ring, Stufen-Wahl und Cull (die Änderung kostet), und der Spieler kommt voran;
//   WECKEN  — ein Bau im Stand weckt Cull und Stufen-Wahl, der Bau steht danach, und die Wache schläft wieder; ein
//             Regler-Schritt weckt den Cull, ein Wahrnehmungs-Schritt (LOD_DISTANCES) Stufen-Wahl und Streu;
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
// Spielers). Warum eine Wand und keine selbst weckende Engstelle: die bewachten Zustände sind Behälter verschiedener Art
// (Map, Array) und Felder der Einträge — ein selbst weckender Behälter ließe die Neu-Zuweisung (`= new Map()`, `= []`,
// `.length = 0`) offen und bräuchte dieselbe Wand. Was die Takte ortsfrei lesen (Regler, Studio-Antwort, Buch,
// Wahrnehmung, LOD-Distanzen), liest der Stempel selbst — dort gibt es keinen Schreiber, der vergessen könnte.
// Die Wand liest den Stamm als AST (acorn — Kommentare und Zeichenketten fallen mit dem Parser) und findet JEDEN Schreiber
// eines bewachten Zustands: direkt (`this.state.F.set`), über Alias (`const map = st.F`, `const { F } = st`, `x = st.F`,
// `for (const m of [st.F])`), Element (`F.get(k).add(…)`, `for (const [k, v] of F)`), Zugriff (eine Methode, ein Getter, ein
// lokaler Pfeil, ein Feld, das F hält), Index, Länge, Zuweisung, Zerlegung, `delete`, `Object.assign`, `op.call/apply`,
// `Reflect.apply` und einen Helfer, der sein Argument schreibt. Der Weckruf muss den Schreiber auf JEDEM PFAD decken: eine
// Weck-Anweisung in der Anweisungsliste des Schreibers oder einer umschließenden Liste derselben Funktion, VOR ihm, oder
// NACH ihm ohne möglichen Austritt dazwischen (`return`, `throw`, `break`, `continue`) — ein Geschwister-Zweig deckt nie,
// ein Rückruf (eine eigene Funktion) nur mit eigenem Weckruf. Weck-Anweisung ist `this._weltRegt()` (für Boden-Zustände
// `_weltRegt(true)`) oder der Ruf einer Methode, die ihn als erste mögliche Tat trägt (`_scatterRegionWork`,
// `_nahWieseNeuIn`). Ein Helfer ohne eigenen Weckruf ist entlastet, wenn JEDER Ruf von ihm gedeckt ist (oder im Eigner-Takt
// liegt, dessen Wirkung `_standMeldet` meldet); sonst nennt die Wand ihn und den ungedeckten Rufer. Ein leerer Behälter, wo
// keiner war (`if (!st.F) st.F = new Map()`, `st.F ||= []`), ändert keine Menge und ist kein Schreiber.
// `boden`: die Boden-Takte (Ring, Saum) lesen den Zustand · `innen`: Elemente sind selbst Mengen · `ersetzen`: ein Feld,
// dessen Wert der Takt liest (nur Ersetzen und `delete` schreiben, nicht sein Inhalt) · `eigner`: nur dieser Fege-Takt liest
// den Zustand — seine eigenen Schreiber melden ihre Wirkung selbst. `A.B` ist das Feld B eines A (`nw.kacheln` mit
// `nw = st.nahWiese`), `A[]` ein Element von A (`A.get(k)`, for-of). `dynamisch`: ein Schreiber mit berechnetem Schlüssel
// auf `state` (`st[k] = …`) — er kann jeden Zustand treffen und braucht den Boden-Weckruf.
const BEWACHT = {
    voxelChunks: { boden: true }, // Ring, Saum, Nah-Kacheln (die Boden-Karte)
    waterCells: { boden: true, ersetzen: true }, // ein Feld des Chunk-Eintrags: der Wasser-Weckruf des Rings liest es
    architectures: {}, // Stufen-Wahl, Cull
    scatterRegions: {}, // die Streu-Stufen-Wahl
    cells: {}, // die Zellen einer Streu-Region (die Streu-Stufen-Wahl geht sie)
    scatterHarvested: { innen: true }, // die Nah-Streu (die Ernte)
    "nahWiese.kacheln": { eigner: "_tickNahWiese" }, // die Kacheln der Nah-Wiese
    "nahStreu.kacheln": { eigner: "_tickNahStreu" }, // die Kacheln der Nah-Streu
    zustand: { eigner: "_tickNahStreu", ersetzen: true }, // der Bau-Zustand einer Nah-Streu-Kachel (null = neu bauen)
    "state[…]": { boden: true, dynamisch: true }, // ein berechneter Schlüssel auf `state`
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

// quelle (Text eines Skripts) → die Analyse; `urteil(gestrichen)` urteilt mit (optional) gestrichenen Weckrufen (Knoten aus
// `weckrufe`) — die Mutations-Probe streicht je einen und braucht dafür keinen zweiten Parser-Lauf.
function schreiberAnalyse(quelle) {
    const acorn = require("acorn");
    const ast = acorn.parse(quelle, { ecmaVersion: "latest", sourceType: "script", locations: true });
    const kinder = (n) => {
        const out = [];
        for (const k in n) {
            if (k === "type" || k === "start" || k === "end" || k === "loc" || k.charCodeAt(0) === 95) continue;
            const v = n[k];
            if (Array.isArray(v)) {
                for (const x of v) if (x && typeof x.type === "string") out.push(x);
            } else if (v && typeof v.type === "string") out.push(v);
        }
        return out;
    };
    const istFn = (n) =>
        n.type === "FunctionDeclaration" || n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression";
    const istSchleife = (n) =>
        n.type === "ForStatement" ||
        n.type === "ForInStatement" ||
        n.type === "ForOfStatement" ||
        n.type === "WhileStatement" ||
        n.type === "DoWhileStatement";
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
    const ohneAwait = (x) => (x && x.type === "AwaitExpression" ? x.argument : x);
    // 1. die Einheiten (jede äußerste Funktion; was außerhalb steht, ist das Modul) und die Eltern-Zeiger (`_p`), in EINEM
    // Durchlauf je Einheit gesammelt: Deklarationen, Zuweisungen, Rufe, Rückgaben, `delete`, for-of
    const modul = { name: "(Modul)", knoten: [], fn: null };
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
        n._p = eltern;
        if (istFn(n)) {
            einheiten.push({
                name: nameVon(n, eltern),
                kurz: "",
                getter: !!eltern && eltern.type === "MethodDefinition" && eltern.kind === "get",
                knoten: [n],
                fn: n,
            });
            return;
        }
        for (const c of kinder(n)) {
            if (!istFn(c) && n === ast) modul.knoten.push(c);
            sammle(c, n);
        }
    })(ast, null);
    for (const E of einheiten) {
        E.kurz = E.name.replace(/^static /, "").replace(/^.*\./, "");
        const L = (E.l = { dekl: [], zuw: [], ruf: [], rueck: [], del: [], forOf: [] });
        const geh = (n, p) => {
            n._p = p;
            const t = n.type;
            if (t === "VariableDeclarator") L.dekl.push(n);
            else if (t === "AssignmentExpression") L.zuw.push(n);
            else if (t === "CallExpression") L.ruf.push(n);
            else if (t === "ReturnStatement") L.rueck.push(n);
            else if (t === "UnaryExpression" && n.operator === "delete") L.del.push(n);
            else if (t === "ForOfStatement") L.forOf.push(n);
            for (const c of kinder(n)) if (!(E === modul && istFn(c))) geh(c, n); // im Modul ist jede Funktion ihre Einheit
        };
        for (const k of E.knoten) geh(k, k._p);
    }
    const felder = Object.keys(BEWACHT);
    // die Pfade: jeder bewachte Zustand, seine Vorgänger (`nahWiese` vor `nahWiese.kacheln`) und seine Elemente (`F[]`)
    const pfade = new Set();
    for (const F of felder) {
        const t = F.split(".");
        for (let i = 1; i <= t.length; i++) {
            const P = t.slice(0, i).join(".");
            pfade.add(P);
            if (P.endsWith("[]")) pfade.add(P.slice(0, -2));
        }
        if (BEWACHT[F].innen) pfade.add(F + "[]");
    }
    const leerJe = () => Object.fromEntries([...pfade].map((P) => [P, new Set()]));
    const zugriff = leerJe(); // Methoden, die P zurückgeben
    const getter = leerJe(); // Getter, die P zurückgeben
    const feldAlias = leerJe(); // Eigenschaften, die P halten (`this._ref = st.F`)
    for (const E of einheiten) {
        E.alias = leerJe();
        E.pfeil = leerJe(); // lokale Pfeile, die P zurückgeben
    }
    const vorgaenger = (P) => {
        const i = P.lastIndexOf(".");
        return i < 0 ? null : P.slice(0, i);
    };
    const letztes = (P) => P.slice(P.lastIndexOf(".") + 1);
    // Ist `n` eine Referenz auf den Pfad P (in der Einheit E)?
    const istRef = (n, P, E) => {
        if (!n) return false;
        switch (n.type) {
            case "ChainExpression":
            case "ParenthesizedExpression":
                return istRef(n.expression, P, E);
            case "LogicalExpression":
                return n.operator === "&&" ? istRef(n.right, P, E) : istRef(n.left, P, E) || istRef(n.right, P, E);
            case "ConditionalExpression":
                return istRef(n.consequent, P, E) || istRef(n.alternate, P, E);
            case "AssignmentExpression":
                return istRef(n.left, P, E);
            case "SequenceExpression":
                return istRef(n.expressions[n.expressions.length - 1], P, E);
            case "Identifier":
                return E.alias[P].has(n.name);
            case "MemberExpression": {
                if (P.endsWith("[]")) return false;
                const p = prop(n);
                if (p === null) return false;
                if (feldAlias[P].has(p) || getter[P].has(p)) return true;
                if (p !== letztes(P)) return false;
                const v = vorgaenger(P);
                return v === null || istRef(n.object, v, E);
            }
            case "CallExpression": {
                const c = n.callee;
                if (P.endsWith("[]"))
                    return c.type === "MemberExpression" && prop(c) === "get" && istRef(c.object, P.slice(0, -2), E);
                if (c.type === "Identifier") return E.pfeil[P].has(c.name);
                return zugriff[P].has(prop(c) || "");
            }
        }
        return false;
    };
    const pfeilGibt = (f, P, E) =>
        !!f &&
        (f.type === "ArrowFunctionExpression" || f.type === "FunctionExpression") &&
        (f.body.type !== "BlockStatement"
            ? istRef(f.body, P, E)
            : f.body.body.length === 1 &&
              f.body.body[0].type === "ReturnStatement" &&
              istRef(f.body.body[0].argument, P, E));
    // 2. Aliase, Zugriffe, Getter und Feld-Aliase bis zum gemeinsamen Fixpunkt
    for (let neu = true, runde = 0; neu && runde < 8; runde++) {
        neu = false;
        const dazu = (S, x) => {
            if (!S.has(x)) {
                S.add(x);
                neu = true;
            }
        };
        for (const E of einheiten) {
            const bindet = (id, init, P) => {
                if (!id || !init) return;
                if (id.type === "Identifier") {
                    if (istRef(init, P, E)) dazu(E.alias[P], id.name);
                    if (pfeilGibt(init, P, E)) dazu(E.pfeil[P], id.name);
                } else if (id.type === "ObjectPattern" && !P.endsWith("[]")) {
                    const v = vorgaenger(P);
                    if (v !== null && !istRef(init, v, E)) return;
                    for (const q of id.properties)
                        if (q.type === "Property" && schluessel(q.key) === letztes(P)) {
                            const w = q.value.type === "AssignmentPattern" ? q.value.left : q.value;
                            if (w.type === "Identifier") dazu(E.alias[P], w.name);
                        }
                }
            };
            for (const P of pfade) {
                for (const d of E.l.dekl) bindet(d.id, d.init, P);
                if (E.fn) for (const q of E.fn.params) if (q.type === "AssignmentPattern") bindet(q.left, q.right, P);
                for (const z of E.l.zuw) {
                    if (z.operator !== "=") continue;
                    if (z.left.type === "Identifier") bindet(z.left, z.right, P);
                    else if (z.left.type === "MemberExpression" && !z.left.computed && !P.endsWith("[]")) {
                        const p = prop(z.left);
                        if (p && p !== letztes(P) && istRef(z.right, P, E)) dazu(feldAlias[P], p);
                    }
                }
                for (const f of E.l.forOf) {
                    const d = f.left.type === "VariableDeclaration" ? f.left.declarations[0].id : f.left;
                    // for (const m of [st.F]) → m ist F
                    if (f.right.type === "ArrayExpression" && f.right.elements.some((x) => istRef(x, P, E)))
                        if (d.type === "Identifier") dazu(E.alias[P], d.name);
                    // for (const [k, v] of F) / for (const v of F.values()) → v ist ein Element
                    if (P.endsWith("[]")) {
                        const M = P.slice(0, -2);
                        const r = f.right;
                        const ueberWerte =
                            r.type === "CallExpression" && prop(r.callee) === "values" && istRef(r.callee.object, M, E);
                        if (
                            istRef(r, M, E) &&
                            d.type === "ArrayPattern" &&
                            d.elements[1] &&
                            d.elements[1].type === "Identifier"
                        )
                            dazu(E.alias[P], d.elements[1].name);
                        if (ueberWerte && d.type === "Identifier") dazu(E.alias[P], d.name);
                    }
                }
                if (E !== modul)
                    for (const r of E.l.rueck)
                        if (r.argument && !P.endsWith("[]") && istRef(r.argument, P, E))
                            dazu(E.getter ? getter[P] : zugriff[P], E.kurz);
            }
        }
    }
    // 3. die Helfer, die ein Argument als Menge schreiben (`_hilf(a, x) { a.push(x) }`): Index je Methode
    const paramSchreib = new Map();
    for (const E of einheiten) {
        if (!E.fn) continue;
        const namen = E.fn.params.map((q) => (q.type === "Identifier" ? q.name : null));
        const geschrieben = new Set();
        const ziel = (o) => {
            const x = o && o.type === "ChainExpression" ? o.expression : o;
            return x && x.type === "Identifier" ? namen.indexOf(x.name) : -1;
        };
        for (const c of E.l.ruf)
            if (c.callee.type === "MemberExpression" && SCHREIB_OPS.has(prop(c.callee) || "")) {
                const i = ziel(c.callee.object);
                if (i >= 0) geschrieben.add(i);
            }
        for (const z of E.l.zuw)
            if (z.left.type === "MemberExpression" && (z.left.computed || prop(z.left) === "length")) {
                const i = ziel(z.left.object);
                if (i >= 0) geschrieben.add(i);
            }
        if (geschrieben.size) paramSchreib.set(E.kurz, geschrieben);
    }
    // 4. die Schreiber: je Einheit und Zustand die Schreib-Knoten
    const leer = (n) =>
        (n.type === "NewExpression" &&
            n.callee.type === "Identifier" &&
            /^(Map|Set|WeakMap|WeakSet)$/.test(n.callee.name) &&
            n.arguments.length === 0) ||
        (n.type === "ArrayExpression" && n.elements.length === 0);
    const nennt = (n, ziel) => {
        let ja = false;
        (function such(x) {
            if (ja || !x) return;
            if (text(x) === ziel) ja = true;
            else for (const c of kinder(x)) such(c);
        })(n);
        return ja;
    };
    // `if (!st.F) st.F = new Map()` (jede Klausel des Tests nennt st.F) · `st.F ||= []` · `st.F = st.F || new Map()` ·
    // `st.F || (st.F = new Map())`: ein leerer Behälter, wo keiner war
    const anlage = (a) => {
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
        const p = a._p;
        if (p && p.type === "LogicalExpression" && p.right === a && p.operator !== "&&" && text(p.left) === ziel)
            return true;
        for (let x = a, e = a._p; e && !istFn(e); x = e, e = e._p) {
            if (e.type !== "IfStatement") continue;
            if (x !== e.consequent) return false;
            const t = e.test;
            const klauseln = [];
            (function teile(k) {
                if (k.type === "LogicalExpression" && k.operator === "||") {
                    teile(k.left);
                    teile(k.right);
                } else klauseln.push(k);
            })(t);
            return (
                klauseln.some((k) => k.type === "UnaryExpression" && k.operator === "!" && text(k.argument) === ziel) &&
                klauseln.every((k) => nennt(k, ziel))
            );
        }
        return false;
    };
    const ziele = (muster, aus) => {
        if (!muster) return aus;
        if (muster.type === "MemberExpression") aus.push(muster);
        else if (muster.type === "ObjectPattern")
            for (const q of muster.properties) ziele(q.type === "RestElement" ? q.argument : q.value, aus);
        else if (muster.type === "ArrayPattern") for (const q of muster.elements) ziele(q, aus);
        else if (muster.type === "AssignmentPattern") ziele(muster.left, aus);
        else if (muster.type === "RestElement") ziele(muster.argument, aus);
        return aus;
    };
    const schreibtFeld = (m, F, E) => {
        // eine Eigenschaft F (oder ihr Vorgänger) wird ersetzt
        const p = prop(m);
        if (p === null) return false;
        let P = F;
        for (;;) {
            if (p === letztes(P)) {
                const v = vorgaenger(P);
                if (v === null || istRef(m.object, v, E)) return true;
            }
            P = vorgaenger(P);
            if (P === null) return false;
        }
    };
    const istOp = (m) => m && m.type === "MemberExpression" && SCHREIB_OPS.has(prop(m) || "");
    // der Inhalt eines Zustands (Ops, Index, Länge, Ziel eines Mutators) — ein `ersetzen`-Feld schreibt nur sein Ersetzen
    const refOderElement = (n, F, E) =>
        !BEWACHT[F].ersetzen && (istRef(n, F, E) || (!!BEWACHT[F].innen && istRef(n, F + "[]", E)));
    for (const E of einheiten) {
        E.schreibt = []; // [{ F, n }]
        const merke = (F, n) => E.schreibt.push({ F, n });
        for (const c of E.l.ruf) {
            const k = c.callee.type === "ChainExpression" ? c.callee.expression : c.callee;
            for (const F of felder) {
                if (istOp(k) && refOderElement(k.object, F, E)) merke(F, c);
                else if (k.type === "MemberExpression" && /^(call|apply)$/.test(prop(k) || "") && istOp(k.object)) {
                    if (refOderElement(c.arguments[0], F, E)) merke(F, c);
                } else if (text(k) === "Reflect.apply" && istOp(c.arguments[0])) {
                    if (refOderElement(c.arguments[1], F, E)) merke(F, c);
                } else if (text(k) === "Object.assign") {
                    const v = vorgaenger(F);
                    if (refOderElement(c.arguments[0], F, E)) merke(F, c);
                    else if (
                        (v === null || istRef(c.arguments[0], v, E)) &&
                        c.arguments
                            .slice(1)
                            .some(
                                (o) =>
                                    o.type === "ObjectExpression" &&
                                    o.properties.some((q) => q.type === "Property" && schluessel(q.key) === letztes(F))
                            )
                    )
                        merke(F, c);
                } else if (k.type === "MemberExpression" && paramSchreib.has(prop(k) || "")) {
                    for (const i of paramSchreib.get(prop(k))) if (refOderElement(c.arguments[i], F, E)) merke(F, c);
                }
            }
        }
        for (const z of E.l.zuw) {
            const L = z.left;
            for (const F of felder) {
                if (L.type === "MemberExpression") {
                    if (schreibtFeld(L, F, E)) {
                        if (!anlage(z)) merke(F, z);
                    } else if ((L.computed || prop(L) === "length") && refOderElement(L.object, F, E)) merke(F, z);
                } else if (L.type === "ObjectPattern" || L.type === "ArrayPattern") {
                    if (ziele(L, []).some((m) => schreibtFeld(m, F, E))) merke(F, z);
                }
            }
        }
        for (const d of E.l.del) {
            const a = d.argument;
            if (a.type !== "MemberExpression") continue;
            for (const F of felder)
                if (schreibtFeld(a, F, E) || (a.computed && refOderElement(a.object, F, E))) merke(F, d);
        }
        // ein berechneter Schlüssel auf `state` (oder einem Alias davon): er kann jeden bewachten Zustand treffen
        const wurzel = new Set(
            E.l.dekl
                .filter((d) => d.id.type === "Identifier" && d.init && prop(d.init) === "state")
                .map((d) => d.id.name)
        );
        const aufState = (m) =>
            !!m &&
            m.type === "MemberExpression" &&
            m.computed &&
            m.property.type !== "Literal" &&
            (prop(m.object) === "state" || (m.object.type === "Identifier" && wurzel.has(m.object.name)));
        for (const z of E.l.zuw) if (aufState(z.left)) merke("state[…]", z);
        for (const d of E.l.del) if (aufState(d.argument)) merke("state[…]", d);
    }
    // 5. die Weckrufe (jeder Ruf von `_weltRegt` im Stamm — die Mutations-Probe streicht je einen)
    const weckrufe = [];
    for (const E of einheiten)
        for (const c of E.l.ruf)
            if (prop(c.callee) === "_weltRegt") weckrufe.push({ knoten: c, methode: E.name, zeile: c.loc.start.line });
    // die Rufe je Methoden-Name (für Wecker und Helfer)
    const methoden = new Map(); // kurz → [Einheit]
    for (const E of einheiten)
        if (E.fn && E !== modul) (methoden.get(E.kurz) || methoden.set(E.kurz, []).get(E.kurz)).push(E);
    const rufer = new Map(); // kurz → [{ E, c }]
    for (const E of einheiten)
        for (const c of E.l.ruf) {
            const k = c.callee.type === "ChainExpression" ? c.callee.expression : c.callee;
            const m = k.type === "MemberExpression" ? prop(k) : null;
            if (m && methoden.has(m)) (rufer.get(m) || rufer.set(m, []).get(m)).push({ E, c });
        }
    // Kann eine Anweisung (oder Liste) ihre Liste verlassen? → Menge der Austritts-Arten
    // (je Anweisung einmal gerechnet: die Austritte hängen an keinem Weckruf — die Mutations-Probe urteilt viele Male)
    const austritte = (s, aus) => {
        if (!s) return aus;
        if (!s._aus) s._aus = [...austritteRoh(s, new Set())];
        for (const a of s._aus) aus.add(a);
        return aus;
    };
    const austritteRoh = (s, aus) => {
        (function geh(n, schleife, wahl) {
            if (!n || istFn(n)) return;
            const t = n.type;
            if (t === "ReturnStatement" || t === "ThrowStatement") aus.add("return");
            else if (t === "BreakStatement") {
                if (n.label) aus.add("label");
                else if (!schleife && !wahl) aus.add("break");
            } else if (t === "ContinueStatement") {
                if (n.label) aus.add("label");
                else if (!schleife) aus.add("continue");
            }
            const s2 = schleife || istSchleife(n);
            const w2 = wahl || t === "SwitchStatement";
            for (const c of kinder(n)) geh(c, s2, w2);
        })(s, false, false);
        return aus;
    };
    const listeVon = (p) =>
        p.type === "BlockStatement" || p.type === "Program" || p.type === "StaticBlock"
            ? p.body
            : p.type === "SwitchCase"
              ? p.consequent
              : null;
    return {
        felder,
        weckrufe,
        einheiten: einheiten.length,
        zugriff: Object.fromEntries(felder.map((f) => [f, [...zugriff[f], ...getter[f]]])),
        // DAS URTEIL bei gestrichenen Weckrufen (`gestrichen`: eine Menge von Ruf-Knoten aus `weckrufe`)
        urteil(gestrichen) {
            const weg = gestrichen || new Set();
            // die Wecker: eine Methode, deren Körper vor jedem möglichen Austritt eine Weck-Anweisung trägt (Fixpunkt)
            const wecker = { welt: new Set(), boden: new Set() };
            const weckRuf = (c, art) => {
                c = ohneAwait(c);
                if (!c || c.type !== "CallExpression" || weg.has(c)) return false;
                const k = c.callee.type === "ChainExpression" ? c.callee.expression : c.callee;
                const m = k.type === "MemberExpression" ? prop(k) : null;
                if (m === "_weltRegt") {
                    const a0 = c.arguments[0];
                    return art !== "boden" || (!!a0 && a0.type === "Literal" && a0.value === true);
                }
                return !!m && wecker[art].has(m);
            };
            const weckAnw = (s, art) =>
                (s.type === "ExpressionStatement" && weckRuf(s.expression, art)) ||
                (s.type === "ReturnStatement" && weckRuf(s.argument, art)) ||
                (s.type === "VariableDeclaration" &&
                    s.declarations.length === 1 &&
                    weckRuf(s.declarations[0].init, art));
            for (let neu = true; neu;) {
                neu = false;
                for (const E of einheiten) {
                    if (!E.fn || E.fn.body.type !== "BlockStatement") continue;
                    for (const art of ["welt", "boden"]) {
                        if (wecker[art].has(E.kurz)) continue;
                        const aus = new Set();
                        for (const s of E.fn.body.body) {
                            if (weckAnw(s, art)) {
                                wecker[art].add(E.kurz);
                                neu = true;
                                break;
                            }
                            if (austritte(s, aus).size) break;
                        }
                    }
                }
            }
            // Deckt eine Weck-Anweisung den Knoten auf jedem Pfad (in seiner eigenen Funktion)?
            const gedeckt = (n, art) => {
                const aus = new Set();
                for (let kind = n, p = n._p; p; kind = p, p = p._p) {
                    if (istFn(p)) return false;
                    const t = p.type;
                    if ((t === "ReturnStatement" || t === "ThrowStatement") && kind === p.argument) aus.add("return");
                    if (t === "IfStatement" && kind === p.test) {
                        austritte(p.consequent, aus);
                        austritte(p.alternate, aus);
                    }
                    if (istSchleife(p) && kind === p.body) {
                        aus.delete("break");
                        aus.delete("continue");
                    }
                    if (t === "SwitchStatement") aus.delete("break");
                    const L = listeVon(p);
                    if (!L) continue;
                    const i = L.indexOf(kind);
                    for (let j = 0; j < i; j++) if (weckAnw(L[j], art)) return true;
                    for (let j = i + 1; j < L.length; j++) {
                        if (!aus.size && weckAnw(L[j], art)) return true;
                        austritte(L[j], aus);
                    }
                }
                return false;
            };
            const imRueckruf = (n, E) => {
                for (let p = n._p; p; p = p._p) if (istFn(p)) return p !== E.fn;
                return false;
            };
            // DIE PFLICHT: ein ungedeckter Schreib-Knoten verpflichtet seine Methode; ein ungedeckter Ruf einer verpflichteten
            // Methode verpflichtet den Rufer (bis zum Fixpunkt) — der Eigner-Takt nimmt die Pflicht für seinen Zustand ab.
            const art = (F) => (BEWACHT[F].boden ? "boden" : "welt");
            const offen = new Map(); // Einheit → Map(F → [{ n, innen, ueber }])
            const schreiber = Object.fromEntries(felder.map((f) => [f, []]));
            const dazu = (E, F, x) => {
                const je = offen.get(E) || offen.set(E, new Map()).get(E);
                const xs = je.get(F) || je.set(F, []).get(F);
                if (xs.some((y) => y.n === x.n)) return false;
                xs.push(x);
                return true;
            };
            const frei = (C, c, F) => C.kurz === BEWACHT[F].eigner || gedeckt(c, art(F));
            for (const E of einheiten)
                for (const { F, n } of E.schreibt) {
                    if (!schreiber[F].includes(E.name)) schreiber[F].push(E.name);
                    if (!frei(E, n, F)) dazu(E, F, { n, innen: imRueckruf(n, E), ueber: null });
                }
            for (let neu = true; neu;) {
                neu = false;
                for (const [E, je] of [...offen])
                    for (const F of [...je.keys()])
                        for (const { E: C, c } of rufer.get(E.kurz) || [])
                            if (!frei(C, c, F) && dazu(C, F, { n: c, innen: imRueckruf(c, C), ueber: E.name }))
                                neu = true;
            }
            // ENTLASTET ist eine verpflichtete Methode, wenn JEDER Ruf von ihr frei ist oder aus einer entlasteten Methode
            // kommt — nie aus einem Rückruf (der läuft später) und nie ohne Rufer (kleinster Fixpunkt: ein Kreis bleibt rot).
            const entlastet = new Set(); // `${name}|${F}`
            const schuld = (E, F) => {
                const rs = rufer.get(E.kurz) || [];
                if (!E.fn || !rs.length) return { C: null };
                for (const { E: C, c } of rs) {
                    if (frei(C, c, F)) continue;
                    if (!imRueckruf(c, C) && entlastet.has(`${C.name}|${F}`)) continue;
                    return { C, c };
                }
                return null;
            };
            for (let neu = true; neu;) {
                neu = false;
                for (const [E, je] of offen)
                    for (const [F, xs] of je) {
                        const s = `${E.name}|${F}`;
                        if (entlastet.has(s) || xs.some((x) => x.innen) || schuld(E, F) !== null) continue;
                        entlastet.add(s);
                        neu = true;
                    }
            }
            const kette = (E, F, tiefe) => {
                const s = schuld(E, F);
                if (!s) return "?";
                if (!s.C) return E.fn ? "kein Rufer im Stamm" : "auf Modul-Ebene";
                const hier = `${s.C.name} (Zeile ${s.c.loc.start.line})`;
                if (imRueckruf(s.c, s.C)) return hier + " im Rückruf";
                return tiefe < 4 && s.C !== E ? hier + " ← " + kette(s.C, F, tiefe + 1) : hier;
            };
            const befunde = [];
            for (const [E, je] of offen)
                for (const [F, xs] of je) {
                    const direkt = xs.filter((x) => x.ueber === null);
                    if (!direkt.length || entlastet.has(`${E.name}|${F}`)) continue;
                    const innen = direkt.find((x) => x.innen);
                    befunde.push({
                        methode: E.name,
                        feld: F,
                        zeile: Math.min(...direkt.map((x) => x.n.loc.start.line)),
                        ruf: art(F) === "boden" ? "_weltRegt(true)" : "_weltRegt()",
                        weil: innen
                            ? `im Rückruf (Zeile ${innen.n.loc.start.line}) ohne eigenen Weckruf`
                            : `ungedeckt über ${kette(E, F, 0)}`,
                    });
                }
            return { befunde, schreiber };
        },
    };
}

// quelle → { befunde, schreiber, einheiten, zugriff, weckrufe }
function schreiberWand(quelle) {
    const a = schreiberAnalyse(quelle);
    const u = a.urteil();
    return { ...u, einheiten: a.einheiten, zugriff: a.zugriff, weckrufe: a.weckrufe.length };
}

// DIE MUTATIONS-PROBE: je einen Weckruf des Stamms streichen — jeder trägt (die Wand fällt rot beim Namen), sonst ist er
// überflüssig. → [{ methode, zeile, befunde }]
function weckProbe(quelle) {
    const a = schreiberAnalyse(quelle);
    return a.weckrufe.map((w) => ({
        methode: w.methode,
        zeile: w.zeile,
        befunde: a.urteil(new Set([w.knoten])).befunde,
    }));
}

// Das Urteil der Schreiber-Wand: jeder Schreiber ohne Weckruf beim Namen; eine Wand, die einen bewachten Zustand nie
// schreiben sieht, ist stumpf (ein umbenanntes Feld ließe sie leer laufen).
function schreiberUrteil(s) {
    const v = [];
    if (!s || !s.schreiber) return ["LEER: keine Schreiber-Wand"];
    for (const b of s.befunde)
        v.push(
            `SCHREIBER: ${b.methode} schreibt ${b.feld} (Zeile ${b.zeile}) ohne ${b.ruf} auf jedem Pfad — ${b.weil || "ungedeckt"}`
        );
    for (const F of Object.keys(BEWACHT))
        if (!BEWACHT[F].dynamisch && (!s.schreiber[F] || s.schreiber[F].length === 0))
            v.push(`STUMPF: die Schreiber-Wand sieht keinen Schreiber von ${F} — der bewachte Zustand heißt anders`);
    return v;
}

module.exports = {
    TAKTE,
    BLAETTER,
    BEWACHT,
    schreiberAnalyse,
    schreiberWand,
    weckProbe,
    schreiberUrteil,
    standPhase,
    standUrteil,
    STAND_INSTALL:
        `window.__standLinseAn = () => (${standLinseAn.toString()})(${JSON.stringify(TAKTE)}, ${JSON.stringify(BLAETTER)}, ${JSON.stringify(EIGENE_UHR)});` +
        `window.__standPhase = ${standPhase.toString()};` +
        `window.__standLauf = ${standLauf.toString()};`,
};
