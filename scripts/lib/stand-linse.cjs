// stand-linse.cjs — DIE STAND-LINSE (Welle K, Lehre 25, Gebot 7): was die Fege-Takte je Frame ARBEITEN, wenn sich nichts
// ändert. Befund 07.10. (OMEN, GTX 1060, Mess-Wiese, Regler voll, der Spieler STEHT): `_loopVoxelStreaming` 3,27 ms je
// Frame, dazu `tickArchitectureCulling`, `_tickArchitectureLOD`, `_lodTreeVisHeight` und noise2D im Selbstzeit-Top —
// gezählt (Radeon, eingeschwungen): je Takt 256 Bau-Einträge der Stufen-Wahl, 1540 Einträge des Cull-Gangs, 160 Streu-
// Zellen, 137 Nah-Streu-Kacheln, 128 Saum-Punkte des Fern-Rings (~6 000 noise2D), 25 Ring-Zellen — und 0 Änderungen.
//
// Die Linse zählt UNABHÄNGIG von der Stand-Wache (`_standRuht`): sie hüllt die Fege-Takte (wer gerade geht) und ihre
// Blatt-Helfer (was ein Gang je Einheit ruft — Stufen-Wahl, Sichthöhe, Karten-Frage, Ring-Stufe, Saum-Punkt, Kachel-
// Armlänge …) und bucht jeden Blatt-Ruf auf den Takt, der ihn rief. Eine Einheit = ein Blatt-Ruf. Ruhe heißt 0.
//
//   Seite:     const L = window.__standLinseAn(); … je Frame L.frame() → { strom: n, archLod: n, … }; L.aus()
//   Urteil:    standUrteil({ ruhe, gehen, wecken, bruch, code, pageErrors }) → [Verletzungen] (gate:stand-takt)
//   Werkbank:  node scripts/werkbank.cjs stand [n]    (der echte Loop, echter Renderer)
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
    const leer = () => Object.fromEntries(namen.map((n) => [n, 0]));
    frame = leer();
    for (const n of namen) {
        const m = takte[n];
        if (typeof P[m] !== "function" || orig[m]) continue;
        const f = (orig[m] = P[m]);
        P[m] = function (...a) {
            stapel.push(n);
            try {
                return f.apply(this, a);
            } finally {
                stapel.pop();
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
    return {
        namen,
        frame() {
            const aus = frame;
            frame = leer();
            return aus;
        },
        aus() {
            for (const m in orig) P[m] = orig[m];
        },
    };
}

// Eine Phase (Liste von Frames) → je Takt: Einheiten Summe, Mittel, Max, Frames mit Arbeit.
function standPhase(frames) {
    const aus = { frames: frames.length, takte: {} };
    const namen = frames.length ? Object.keys(frames[0]) : Object.keys(TAKTE);
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
        aus.takte[n] = { summe: s, mittel: frames.length ? +(s / frames.length).toFixed(2) : 0, max, mitArbeit };
    }
    aus.summe = Object.values(aus.takte).reduce((a, t) => a + t.summe, 0);
    return aus;
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
    const namen = Object.keys(TAKTE);
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
    if (b.ruheOnly) return v;
    const S = b.bruch;
    if (!S || !S.frames) v.push("LEER: keine Bruch-Phase — die Linse ist ungeprüft");
    else
        for (const n of namen) {
            const t = S.takte[n];
            if (!t || !(t.summe > 0))
                v.push(`STUMPF: mit gebrochener Wache zählt die Linse für ${n} keine Arbeit — sie sähe den Täter nicht`);
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
        v.push(`STROM: nach dem Sprung an (${T.x}, ${T.z}) steht der Spieler-Chunk nach ${T.takte} Takten nicht — das Streaming verhungert`);
    const c = b.code || {};
    for (const n of namen) {
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
        `window.__standPhase = ${standPhase.toString()};`,
};
