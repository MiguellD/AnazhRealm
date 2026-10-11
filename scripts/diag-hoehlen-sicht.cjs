#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-hoehlen-sicht.cjs — DIE HÖHLEN-SICHT (Welle 7): die Höhlen-Schicht des Bodens zeichnet nur, was ein Strahl durch
// Luft erreicht. Befund (echte GPU, Mess-Wiese −900/−850): 68 % der Boden-Dreiecke trennen Fels von HÖHLEN-Luft (Luft unter
// der obersten festen Ecke ihrer Spalte), 16–52 m tief, und der Boden-Satz zeichnete sie in jedem Pass (Hauptbild, k0, k1)
// mit. Die Wahl je Pass (`_chunkSatzPass` → `_hoehlenSicht`) läuft vom Auge durch Mündung und Portale (Schirm-Rechteck +
// Tiefe), die Kaskade vom sichtbaren Empfänger zum Licht. Die Wand prüft sie gegen eine UNABHÄNGIGE Wahrheit — Strahlen
// gegen jedes Dreieck des Boden-Satzes (scripts/lib/hoehlen-strahl.cjs) — an der Mess-Wiese, Null-Renderer:
//   (a) SPIEGEL — Main (`_voxelHoehlenGraph` im Sync-Bau) und Worker (`hoehlenGraph`) liefern für dieselben Chunks
//       byte-gleich Positionen, Index, je Dreieck die Zelle seiner Luft und den Graph (Knoten · Mündungen · Seiten · Kanten ·
//       Rand);
//   (b) BILD — je Blick (Wiese · Hang · Mündung · Höhle · Hinaus) trifft jeder Strahl des Auges zuerst eine Zelle, die im
//       Abschnitt des Passes steht: eine Höhlen-Zelle, die aus der Mündung sichtbar ist, darf nie fehlen (sonst ein Loch).
//       Jeder Blick läuft, bis jede Mündung im Bild ihre Horizont-Sperre trägt (die Probe wirkt ganz, nicht nur 8 je Bild);
//   (b') HINAUS — das Auge in Höhlen-Luft, 16 m unter der Wiese (−1041/−738, der Ring um den Spieler dort), der Blick durch
//       die Mündung hinaus: die Strahlen beginnen in der Höhle, laufen an den Sperren vorbei und erreichen Mündungen
//       dahinter (`_hoehlenHinaus`). Die alte Probe — die Sperre ohne den Weg hinaus — ließ dort 3 Zellen weg (2,8 % des
//       Bilds); der Blick ist scharf nur, solange sie dort rot fällt;
//   (c) SCHATTEN — je Blick: jeder Empfänger des Bilds, dessen Weg zur Sonne im Licht-Frustum Boden trifft, trifft einen,
//       den die Kaskade zeichnet (sonst fiele Licht durch Fels: ein Licht-Leck);
//   (d) NICHT LEER — Mündung und Höhle zeigen Höhlen-Flächen, und die Linse ist scharf: ohne die Höhlen-Zellen im Abschnitt
//       nennt sie die fehlenden (sonst prüfte (b) nichts);
//   (e) SCHNITT — die Wiese zeichnet weniger Höhlen-Dreiecke, als ihr Frustum trägt (sonst wäre die Sicht tot);
//   (f) CODE — der EINE Chokepoint liest die Sicht (`_chunkSatzPass` ruft `_hoehlenSicht`, `_chunkSatzAbschnitt` den
//       Stempel des Knotens, `_hoehlenSicht` den Weg hinaus); (g) kein Page-Error;
//   (h) GEDÄCHTNIS — die gemerkte Horizont-Sperre gilt nur dem Boden, den sie gemessen hat: im Stand an der Mündung hält
//       sie (sonst prüfte die Wand nichts), nach einem neuen Boden (`_chunkSatzMarke`: Graben, LOD-Naht) misst der nächste
//       Pass jede Mündung im Bild neu (vorher sperrte ein gegrabener Hang die Mündung dahinter, bis das Auge 0,25 m ging);
//   (i) HIMMELS-LICHT (K02a, Auge 11 bei 762/−138) — der Boden-Stoff liest die Himmels-Sicht je Vertex (`aoNode` =
//       `aHimmel`, `_himmelsSicht` aus dem Höhlen-Graph): kein Höhlen-Vertex trägt mehr Himmel, als sein gerader Abstand zur
//       nächsten Himmels-Fläche lässt, und die Mündung bleibt hell. Vorher lag der volle Himmel auf jeder Höhlen-Wand: 22 m
//       unter dem Fels stand die Ich-Sicht im blaugrauen Schleier (Helligkeit 55,5, ohne Umgebung 0).
//   (j) LICHT DES AUGES — in der Höhle die wahre Normale und das Licht des Auges nach seinem Gesetz, im Freien aus; BLENDUNG:
//       es fällt nicht mit dem Abstand (die Wand in 0,3 m höchstens 1,5× die Karte in 2 m — mit 1/d lag sie weiß). Es ist
//       EIN Term des Boden-Stoffs (`_buildPbrNodeMaterial`, gewichtet mit 1 − `aHimmel`), seine Stärke die geteilte Uniform
//       `atmoUniforms.augenLicht`; die Wand zählt dazu die Wesen in Höhlen-Luft (sie tragen es nicht);
//   (l) SZENEN-LICHT (K15, OMEN 1110-3): unter freiem Himmel trägt jedes Licht der Szene Licht — ein Licht auf Stärke 0
//       steht trotzdem im Licht-Hash JEDES beleuchteten Stoffs und kostet in jedem Fragment (das Punkt-Licht des Auges ab
//       Boot: 0,48 ms je Frame auf der GTX 1060, wo es nicht leuchtete);
//   (k) WIESE UNTER FELS — jeder Höhlen-Vertex ohne Himmel trägt den Stein der Palette (`_bodenFarbeUnterFels`), vorher
//       das Grün der Wiese 25 m über ihm.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): ein Befund mit jedem Täter — Spiegel-Drift, Loch, Licht-Leck,
// leerer Blick, blinde Linse, toter Schnitt, stumpfer Hinaus-Blick, fehlender Chokepoint, Page-Error — MUSS rot fallen und
// ihn beim Namen nennen.
//   node scripts/diag-hoehlen-sicht.cjs [--selftest]   (npm run gate:hoehlen-sicht; Port HOEHLEN_SICHT_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const PFLICHT = ["wiese", "hang", "muendung", "hoehle", "hinaus"];
const IN_HOEHLE = ["muendung", "hoehle", "hinaus"];

// Das Urteil über einen Befund: Liste der Verstöße (leer = grün). Rein, im Selbsttest wie im Lauf.
function urteil(b) {
    const v = [];
    if (!b.spiegel || b.spiegel.length === 0) v.push("SPIEGEL: kein Chunk zwischen Main und Worker verglichen");
    for (const sp of b.spiegel || []) {
        if (sp.fehler) {
            v.push(`SPIEGEL: Chunk ${sp.chunk} (LOD ${sp.lod}): ${sp.fehler}`);
            continue;
        }
        for (const [feld, gleich] of Object.entries(sp.felder || {}))
            if (!gleich) v.push(`SPIEGEL: Chunk ${sp.chunk} (LOD ${sp.lod}): ${feld} weicht ab (Main ≠ Worker)`);
    }
    const blicke = new Map((b.blicke || []).map((x) => [x.name, x]));
    for (const name of PFLICHT) if (!blicke.has(name)) v.push(`LEER: Blick ${name} fehlt (kein Standort gefunden)`);
    for (const x of b.blicke || []) {
        if (x.fehlend && x.fehlend.length > 0) {
            const f = x.fehlend[0];
            v.push(
                `LOCH: Blick ${x.name}: ${x.fehlend.length} Zellen fehlen im Abschnitt, zuerst ${f.bereich}` +
                    (f.hoehle ? `#${f.knoten} (Höhle)` : " (Himmel)") +
                    ` am Punkt ${JSON.stringify(f.punkt)}`
            );
        }
        if (x.schatten && x.schatten.lecks && x.schatten.lecks.length > 0) {
            const l = x.schatten.lecks[0];
            v.push(
                `LICHT-LECK: Blick ${x.name}: ${x.schatten.lecks.length} Empfänger, zuerst ${JSON.stringify(l.empfaenger)} — ` +
                    `die erste Fläche zum Licht (${l.zelle}) fehlt in der Kaskade`
            );
        }
        if (x.schatten && !(x.schatten.empfaenger > 0))
            v.push(`LEER: Blick ${x.name}: kein Empfänger im Licht-Frustum (der Schatten prüfte nichts)`);
        if (IN_HOEHLE.includes(x.name) && !(x.hoehle > 0))
            v.push(`LEER: Blick ${x.name} zeigt keine Höhlen-Fläche (${x.strahlen} Strahlen) — (b) prüfte nichts`);
        if (IN_HOEHLE.includes(x.name) && !(x.blind > 0))
            v.push(`LINSE BLIND: Blick ${x.name}: ohne die Höhlen-Zellen im Abschnitt fehlt der Linse nichts`);
        if (x.name === "hinaus" && x.augeInHoehle !== true)
            v.push("LEER: Blick hinaus: das Auge steht nicht in Höhlen-Luft (Fels über ihm, Luft an ihm)");
        if (x.name === "hinaus" && !(x.altFehlend > 0))
            v.push(
                "LINSE STUMPF: Blick hinaus: die alte Probe (die Sperre ohne den Weg hinaus) ließe hier keine Zelle weg — " +
                    "der Blick prüft die Klasse nicht"
            );
        if (x.name === "wiese" && x.hoehleImFrustum > 0 && !(x.hoehleImAbschnitt < x.hoehleImFrustum))
            v.push(
                `KEIN SCHNITT: die Wiese zeichnet ${x.hoehleImAbschnitt} von ${x.hoehleImFrustum} Höhlen-Dreiecken ihres ` +
                    "Frustums — die Höhlen-Sicht wirkt nicht"
            );
    }
    const gd = b.gedaechtnis;
    if (!gd || !(gd.imBild > 0)) v.push("LEER: (h) Gedächtnis: keine Mündung im Bild (die Wand prüfte nichts)");
    else {
        if (!(gd.vor < gd.imBild))
            v.push(
                `LINSE STUMPF: (h) Gedächtnis: im Stand misst jeder Pass ${gd.vor} von ${gd.imBild} Mündungen neu — ` +
                    "die Sperre wird nie gemerkt, die Wand prüfte nichts"
            );
        if (gd.nach < gd.imBild)
            v.push(
                `GEDÄCHTNIS: ${gd.imBild - gd.nach} von ${gd.imBild} Mündungen im Bild behalten ihre Sperre über einen neuen ` +
                    "Boden (`_chunkSatzMarke` im Stand) — ein gegrabener oder gesenkter Hang sperrte die Mündung dahinter weiter"
            );
    }
    const c = b.code || {};
    // (j) DAS LICHT DES AUGES (K02a, Auge 11): in der Höhle trägt die Fläche ihre wahre Normale und das Auge sein Licht
    if (!c.normaleHoehle)
        v.push(
            "CODE: `_buildPbrNodeMaterial` flacht die Normale auch in der Höhle (die 2.5D-Lichtung ohne `aHimmel`) — jede Decke " +
                "und Wand liegt als Wiese im Licht von oben, kein Licht von unten erreicht sie"
        );
    if (!c.augenTerm)
        v.push(
            "CODE: der Boden-Stoff (`_buildPbrNodeMaterial`) trägt den Term des Lichts des Auges nicht (`atmoUniforms.augenLicht` " +
                "× (1 − `aHimmel`)) — die Höhle ist schwarz oder ein Szenen-Licht trägt es überall"
        );
    if (c.augenTerm && !c.augenVorZweig)
        v.push(
            "CODE: der Term des Lichts des Auges liest `normalView`/`positionViewDirection` erst im If-Zweig — r184 baut das " +
                "Emissiv VOR der Lichtung, die Variable stünde nur im Zweig: unter dem Himmel lichtet der Boden mit der Normale 0 " +
                "(schwarz)"
        );
    if (c.augenTerm && c.augenTslFremd)
        v.push(
            `CODE: der Term des Lichts des Auges liest \`${c.augenTslFremd}\` — \`three/tsl\` der Seite kennt den Namen nicht ` +
                "(undefined, der Graph bricht, der Boden ist schwarz)"
        );
    const al = b.augenLicht;
    if (!al || !al.hoehle || !al.frei || !al.augeInHoehle)
        v.push("LEER: (j) Licht des Auges: kein Auge in der Höhlen-Luft gemessen (die Wand prüfte nichts)");
    else {
        const ho = al.hoehle,
            fr = al.frei;
        if (ho.I === null)
            v.push(
                `LICHT DES AUGES: der Boden-Stoff trägt kein Licht des Auges (\`atmoUniforms.augenLicht\` fehlt) — die Ich-Sicht ` +
                    `in der Höhle ${JSON.stringify(ho.auge)} ist schwarz (kein Himmel, keine Sonne, kein Licht)`
            );
        else {
            if (!(ho.h < 1) || !(ho.I > 0))
                v.push(
                    `LICHT DES AUGES: das Auge in der Höhle ${JSON.stringify(ho.auge)} sieht den Himmel ${ho.h} und trägt ` +
                        `Licht ${ho.I} — die Ich-Sicht ist schwarz`
                );
            else if (!(Math.abs(ho.I - ho.soll) <= 1e-3 * Math.max(1, ho.soll)))
                v.push(
                    `LICHT DES AUGES: in der Höhle Stärke ${ho.I}, das Gesetz verlangt ${ho.soll} (Himmel am Auge ${ho.h})`
                );
            if (!(fr.h === 1) || fr.I !== 0)
                v.push(
                    `LICHT DES AUGES: unter freiem Himmel ${JSON.stringify(fr.auge)} brennt es (Himmel ${fr.h}, Stärke ` +
                        `${fr.I}) — die Welt zahlte das Licht auch, wo der Himmel leuchtet`
                );
        }
    }
    // (j) BLENDUNG: das Licht fällt nicht mit dem Abstand — die Wand in Armlänge zeigt ihre Maserung wie die Karte in 2 m
    if (al && al.hoehle && Number.isFinite(al.hoehle.abfall)) {
        const q = Math.pow(2 / 0.3, al.hoehle.abfall);
        if (q > 1.5)
            v.push(
                `BLENDUNG: das Licht des Auges fällt mit 1/d^${al.hoehle.abfall} — die Wand in 0,3 m ist ${q.toFixed(1)}× heller ` +
                    "als die Karte in 2 m (weiß, ohne Maserung; höchstens 1,5×)"
            );
    }
    // (l) SZENEN-LICHT: unter freiem Himmel trägt jedes DIREKTE Licht der Szene Licht (r184 sammelt jedes sichtbare Licht in
    // den Licht-Hash jedes beleuchteten Stoffs — ein direktes Licht auf 0 rechnet trotzdem seine BRDF in jedem Fragment;
    // Umgebung und Halbkugel addieren nur eine Bestrahlung und stehen im Bericht)
    const sl = b.szenenLicht;
    if (!sl || !Array.isArray(sl.frei) || sl.frei.length === 0)
        v.push("LEER: (l) Szenen-Licht: kein Licht der Szene unter freiem Himmel gezählt (die Wand prüfte nichts)");
    else {
        const tot = sl.frei.filter((l) => l.direkt && (!(l.I > 0) || l.schwarz));
        if (tot.length > 0) {
            const t = tot[0];
            const nd = sl.frei.filter((l) => l.direkt).length;
            v.push(
                `SZENEN-LICHT: ${tot.length} von ${nd} direkten Lichtern der Szene tragen unter freiem Himmel nichts, zuerst ` +
                    `\`${t.name || "(ohne Namen)"}\` (${t.typ}, Stärke ${t.I}${t.schwarz ? ", schwarz" : ""}) — jeder beleuchtete ` +
                    `Stoff trägt ${sl.frei.length} Licht-Knoten im Hash, ${tot.length} davon rechnen eine BRDF ohne Licht`
            );
        }
    }
    // (k) UNTER FELS WÄCHST NICHTS: jeder Höhlen-Vertex ohne Himmel trägt den Stein der Palette
    const wf = b.wieseUnterFels;
    if (!wf || !(wf.ohneHimmel > 0))
        v.push("LEER: (k) Wiese unter Fels: kein Höhlen-Vertex ohne Himmel im Boden-Satz (die Wand prüfte nichts)");
    else if (wf.fremd > 0)
        v.push(
            `WIESE UNTER FELS: ${wf.fremd} von ${wf.ohneHimmel} Höhlen-Vertices ohne Himmel tragen nicht den Stein der Palette ` +
                `(${wf.gruen} davon grün), zuerst ${JSON.stringify(wf.erst)} — die Farbe der Säule (Wiese, Feuchte, Schnee) ` +
                "liegt auf dem Höhlen-Boden (`_bodenFarbeUnterFels`)"
        );
    if (!c.passLiest)
        v.push("CODE: `_chunkSatzPass` ruft `_hoehlenSicht` nicht (der Chokepoint wählt die Höhle nicht)");
    if (!c.abschnittLiest) v.push("CODE: `_chunkSatzAbschnitt` liest den Stempel des Höhlen-Knotens nicht");
    if (!c.hinausLiest)
        v.push(
            "CODE: `_hoehlenSicht` ruft `_hoehlenHinaus` nicht (kein Strahl kommt aus einer Höhle an der Sperre vorbei)"
        );
    // (i) HIMMELS-LICHT: keine Höhlen-Wand trägt mehr Himmel, als ihr gerader Abstand zur nächsten Himmels-Fläche lässt,
    // und die Mündung bleibt hell (die Sicht fällt nicht schon an der Kante auf null)
    const hl = b.himmel;
    if (!c.himmelLiest)
        v.push(
            "CODE: `_getVoxelChunkMaterial` liest die Himmels-Sicht nicht (`aoNode` = `aHimmel`) — das Himmels-Licht liegt " +
                "auf jeder Höhlen-Wand"
        );
    if (!hl || !(hl.hoehle > 0))
        v.push("LEER: (i) Himmels-Licht: kein Höhlen-Vertex im Boden-Satz (die Wand prüfte nichts)");
    else {
        if (hl.ohneAttribut)
            v.push(
                `HIMMELS-LICHT: der Boden-Satz trägt keine Himmels-Sicht — ${hl.hoehle} Höhlen-Vertices sehen den vollen ` +
                    `Himmel, ${hl.tief} davon tiefer als ${hl.tiefM} m hinter der nächsten Himmels-Fläche`
            );
        else if (hl.ueber.length > 0) {
            const u = hl.ueber[0];
            v.push(
                `HIMMELS-LICHT: ${hl.ueber.length} von ${hl.hoehle} Höhlen-Vertices tragen mehr Himmel, als ihr Abstand lässt, ` +
                    `zuerst ${JSON.stringify(u.p)}: Himmels-Sicht ${u.v} bei ${u.d} m (höchstens ${u.max})`
            );
        }
        if (!hl.ohneAttribut && !(hl.muendMittel >= hl.muendMin))
            v.push(
                `SCHWARZE MÜNDUNG: ${hl.muend} Höhlen-Vertices in den Mündungs-Boxen tragen im Mittel ` +
                    `${hl.muendMittel} Himmels-Sicht (mindestens ${hl.muendMin}) — der Himmel fällt schon an der Kante weg`
            );
    }
    for (const e of b.pageErrors || []) v.push(`PAGE-ERROR: ${e}`);
    return v;
}

function selbsttest() {
    const gruen = {
        spiegel: [
            {
                chunk: "0,0",
                lod: 0,
                felder: {
                    position: true,
                    index: true,
                    tri: true,
                    knoten: true,
                    muend: true,
                    seiten: true,
                    kanten: true,
                    rand: true,
                },
            },
        ],
        blicke: [
            {
                name: "wiese",
                strahlen: 10,
                hoehle: 0,
                fehlend: [],
                hoehleImFrustum: 100,
                hoehleImAbschnitt: 10,
                schatten: { empfaenger: 5, lecks: [] },
            },
            { name: "hang", strahlen: 10, hoehle: 0, fehlend: [], schatten: { empfaenger: 5, lecks: [] } },
            {
                name: "muendung",
                strahlen: 10,
                hoehle: 4,
                blind: 2,
                fehlend: [],
                schatten: { empfaenger: 5, lecks: [] },
            },
            { name: "hoehle", strahlen: 10, hoehle: 9, blind: 3, fehlend: [], schatten: { empfaenger: 5, lecks: [] } },
            {
                name: "hinaus",
                strahlen: 10,
                hoehle: 7,
                blind: 3,
                augeInHoehle: true,
                altFehlend: 3,
                fehlend: [],
                schatten: { empfaenger: 5, lecks: [] },
            },
        ],
        gedaechtnis: { vor: 0, nach: 6, imBild: 6 },
        code: {
            passLiest: true,
            abschnittLiest: true,
            hinausLiest: true,
            himmelLiest: true,
            normaleHoehle: true,
            augenTerm: true,
            augenVorZweig: true,
            augenTslFremd: null,
        },
        wieseUnterFels: { ohneHimmel: 700, fremd: 0, gruen: 0, erst: null },
        augenLicht: {
            augeInHoehle: true,
            hoehle: { auge: [-1041, 9, -738], h: 0.2, I: 30, soll: 30, abfall: 0 },
            frei: { auge: [-1041, 30, -738], h: 1, I: 0, soll: 0 },
            wesenInHoehle: 0,
        },
        szenenLicht: {
            frei: [
                { name: "", typ: "AmbientLight", I: 0, schwarz: false, direkt: false },
                { name: "", typ: "DirectionalLight", I: 1, schwarz: false, direkt: true },
                { name: "", typ: "HemisphereLight", I: 0, schwarz: false, direkt: false },
            ],
        },
        himmel: {
            hoehle: 900,
            tief: 300,
            tiefM: 14,
            ueber: [],
            muend: 40,
            muendMittel: 0.5,
            muendMin: 0.15,
            ohneAttribut: false,
        },
        pageErrors: [],
    };
    const fehler = [];
    const g = urteil(gruen);
    if (g.length) fehler.push("der grüne Befund fällt rot: " + g.join(" · "));
    const klon = () => JSON.parse(JSON.stringify(gruen));
    const faelle = [
        ["Spiegel-Drift", (b) => (b.spiegel[0].felder.tri = false), /SPIEGEL: Chunk 0,0 .*tri weicht ab/],
        ["kein Spiegel", (b) => (b.spiegel = []), /SPIEGEL: kein Chunk/],
        [
            "Loch an der Mündung",
            (b) => (b.blicke[2].fehlend = [{ bereich: "-21,-20", knoten: 7, hoehle: true, punkt: [1, 2, 3] }]),
            /LOCH: Blick muendung: 1 Zellen fehlen .*-21,-20#7 \(Höhle\)/,
        ],
        [
            "Licht-Leck",
            (b) => (b.blicke[3].schatten.lecks = [{ empfaenger: [1, 2, 3], zelle: "-22,-20#4", hoehle: true }]),
            /LICHT-LECK: Blick hoehle: 1 Empfänger, .*-22,-20#4/,
        ],
        ["leere Mündung", (b) => (b.blicke[2].hoehle = 0), /LEER: Blick muendung zeigt keine Höhlen-Fläche/],
        ["fehlender Blick", (b) => b.blicke.splice(1, 1), /LEER: Blick hang fehlt/],
        ["blinde Linse", (b) => (b.blicke[3].blind = 0), /LINSE BLIND: Blick hoehle/],
        ["toter Schnitt", (b) => (b.blicke[0].hoehleImAbschnitt = 100), /KEIN SCHNITT: die Wiese zeichnet 100 von 100/],
        [
            "die alte Probe (Loch beim Blick hinaus)",
            (b) =>
                (b.blicke[4].fehlend = [
                    { bereich: "-24,-18", knoten: 64, hoehle: true, punkt: [-1021, 15.8, -734.5] },
                ]),
            /LOCH: Blick hinaus: 1 Zellen fehlen .*-24,-18#64 \(Höhle\)/,
        ],
        ["stumpfer Hinaus-Blick", (b) => (b.blicke[4].altFehlend = 0), /LINSE STUMPF: Blick hinaus/],
        [
            "Auge nicht in der Höhle",
            (b) => (b.blicke[4].augeInHoehle = false),
            /LEER: Blick hinaus: das Auge steht nicht/,
        ],
        ["Weg hinaus fehlt", (b) => (b.code.hinausLiest = false), /CODE: `_hoehlenSicht` ruft `_hoehlenHinaus` nicht/],
        ["Schatten prüft nichts", (b) => (b.blicke[1].schatten.empfaenger = 0), /LEER: Blick hang: kein Empfänger/],
        ["Chokepoint fehlt", (b) => (b.code.passLiest = false), /CODE: `_chunkSatzPass` ruft `_hoehlenSicht` nicht/],
        ["Stempel ungelesen", (b) => (b.code.abschnittLiest = false), /CODE: `_chunkSatzAbschnitt` liest/],
        ["Page-Error", (b) => b.pageErrors.push("TypeError: x"), /PAGE-ERROR: TypeError: x/],
        [
            "die Sperre überlebt den Boden",
            (b) => (b.gedaechtnis.nach = 0),
            /GEDÄCHTNIS: 6 von 6 Mündungen im Bild behalten ihre Sperre/,
        ],
        ["stumpfes Gedächtnis", (b) => (b.gedaechtnis.vor = 6), /LINSE STUMPF: \(h\) Gedächtnis/],
        ["Gedächtnis ohne Mündung", (b) => (b.gedaechtnis = null), /LEER: \(h\) Gedächtnis/],
        // (i) der Befund von Auge 11: der Himmel liegt auf jeder Höhlen-Wand (der Stand vor K02a)
        [
            "Himmel in der Höhle",
            (b) => Object.assign(b.himmel, { ohneAttribut: true }),
            /HIMMELS-LICHT: der Boden-Satz trägt keine Himmels-Sicht — 900 Höhlen-Vertices/,
        ],
        [
            "zu viel Himmel",
            (b) => b.himmel.ueber.push({ p: [762, 11, -140], v: 1, d: 22.4, max: 0.02 }),
            /HIMMELS-LICHT: 1 von 900 Höhlen-Vertices .*[762,11,-140]/,
        ],
        [
            "schwarze Mündung",
            (b) => (b.himmel.muendMittel = 0),
            /SCHWARZE MÜNDUNG: 40 Höhlen-Vertices in den Mündungs-Boxen/,
        ],
        ["Stoff ohne Himmels-Sicht", (b) => (b.code.himmelLiest = false), /CODE: `_getVoxelChunkMaterial` liest/],
        ["Himmel ohne Höhle", (b) => (b.himmel.hoehle = 0), /LEER: \(i\) Himmels-Licht/],
        // (j) der Befund von Auge 11 nach (i): die Höhle schwarz, die Decke als Wiese gelichtet
        ["flache Höhle", (b) => (b.code.normaleHoehle = false), /CODE: `_buildPbrNodeMaterial` flacht die Normale/],
        [
            "kein Licht des Auges",
            (b) => (b.augenLicht.hoehle.I = null),
            /LICHT DES AUGES: der Boden-Stoff trägt kein Licht des Auges .* in der Höhle \[-1041,9,-738\]/,
        ],
        [
            "Licht aus in der Höhle",
            (b) => (b.augenLicht.hoehle.I = 0),
            /LICHT DES AUGES: das Auge in der Höhle .* Licht 0/,
        ],
        [
            "Licht ohne Gesetz",
            (b) => (b.augenLicht.hoehle.I = 3),
            /LICHT DES AUGES: in der Höhle Stärke 3, das Gesetz verlangt 30/,
        ],
        ["Licht im Freien", (b) => (b.augenLicht.frei.I = 5), /LICHT DES AUGES: unter freiem Himmel .* brennt es/],
        ["Stoff ohne Augen-Term", (b) => (b.code.augenTerm = false), /CODE: der Boden-Stoff .* trägt den Term/],
        // die zwei Fallen der Werkbank 11.10. (echte GPU): die Mündung schwarz (Helligkeit 60 statt 123)
        [
            "Normale im Zweig",
            (b) => (b.code.augenVorZweig = false),
            /CODE: der Term .* liest `normalView`\/`positionViewDirection` erst im If-Zweig/,
        ],
        [
            "fremder TSL-Name",
            (b) => (b.code.augenTslFremd = "diffuseContribution"),
            /CODE: der Term .* liest `diffuseContribution` — `three\/tsl` der Seite kennt/,
        ],
        // (l) der Befund von OMEN 1110-3 (GTX 1060, V18.540): das Punkt-Licht des Auges stand ab Boot auf 0 in der Szene
        [
            "Szenen-Licht auf 0",
            (b) =>
                b.szenenLicht.frei.push({
                    name: "augenLicht",
                    typ: "PointLight/AugenLicht",
                    I: 0,
                    schwarz: false,
                    direkt: true,
                }),
            /SZENEN-LICHT: 1 von 2 direkten .*`augenLicht` \(PointLight\/AugenLicht, Stärke 0\) — jeder beleuchtete Stoff trägt 4/,
        ],
        [
            "schwarzes Szenen-Licht",
            (b) => (b.szenenLicht.frei[1].schwarz = true),
            /SZENEN-LICHT: 1 von 1 direkten .*DirectionalLight, Stärke 1, schwarz/,
        ],
        ["Szenen-Licht ungezählt", (b) => (b.szenenLicht = null), /LEER: \(l\) Szenen-Licht/],
        ["Licht ohne Höhle", (b) => (b.augenLicht.augeInHoehle = false), /LEER: \(j\) Licht des Auges/],
        // (j) der Befund der Werkbank 11.10. (echte GPU, Auge 11): mit 1/d lag die Wand in 0,2 m weiß ohne Maserung
        [
            "geblendet",
            (b) => (b.augenLicht.hoehle.abfall = 1),
            /BLENDUNG: das Licht des Auges fällt mit 1\/d\^1 — .* 6\.7×/,
        ],
        // (k) der Befund von Auge 11: der Höhlen-Boden 25 m unter der Wiese trug ihr Grün
        [
            "Wiese unter Fels",
            (b) =>
                Object.assign(b.wieseUnterFels, {
                    fremd: 650,
                    gruen: 420,
                    erst: { p: [762, 9.4, -136], c: [0.05, 0.12, 0.03], fels: [0.14, 0.13, 0.12] },
                }),
            /WIESE UNTER FELS: 650 von 700 Höhlen-Vertices ohne Himmel .*420 davon grün/,
        ],
        ["Fels ohne Höhle", (b) => (b.wieseUnterFels.ohneHimmel = 0), /LEER: \(k\) Wiese unter Fels/],
    ];
    for (const [name, tat, muss] of faelle) {
        const b = klon();
        tat(b);
        const v = urteil(b);
        const ok = v.some((x) => muss.test(x));
        if (!ok) fehler.push(`${name}: die Wand nennt den Täter nicht (${muss})`);
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${name}" → rot: ${v.join(" · ") || "(nichts)"}`);
    }
    if (fehler.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist vakuös: " + fehler.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — jeder injizierte Täter fällt rot und wird beim Namen genannt.");
}

if (process.argv.includes("--selftest")) {
    console.log("=== HÖHLEN-SICHT — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { installHoehlenStrahl } = require("./lib/hoehlen-strahl.cjs");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.HOEHLEN_SICHT_PORT) || 4504;
const ORTE = {
    mess: { x: -900, z: -850 }, // die Mess-Wiese
    // der Blick aus der Höhle hinaus (der Ort der Gegenprüfung): Spieler und Auge 16 m unter der Wiese, Blick nach +x, 6 m
    // hinab
    hinaus: { spieler: [-1041, 11, -738], auge: [-1041, 12.5, -738], ziel: [-941, 6.5, -738] },
};
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
    ".wasm": "application/wasm",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    console.log("=== HÖHLEN-SICHT (Welle 7) — Null-Renderer, Mess-Wiese, Strahl-Wahrheit gegen den Boden-Satz ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 600000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(580000);
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        // dieselbe „Code ohne Kommentare“-Quelle wie der Playtest (Absenz-Greps treffen nie Zitate)
        window.__codeOf = (fnOrSrc) =>
            String(fnOrSrc)
                .replace(/\/\/.*$/gm, "")
                .replace(/\/\*[\s\S]*?\*\//g, "");
    });
    await page.evaluateOnNewDocument(installHoehlenStrahl);
    let befund = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        befund = await page.evaluate(async (ORTE) => {
            const MESS = ORTE.mess,
                HINAUS = ORTE.hinaus;
            const r = window.anazhRealm,
                st = r.state,
                T = window.THREE;
            const pause = (ms) => new Promise((ok) => setTimeout(ok, ms || 0));
            const takt = () => {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            };
            // einschwingen: der Ring steht, kein Worker-Auftrag offen
            let last = -1;
            const schwinge = async () => {
                let stabil = 0;
                last = -1;
                for (let i = 0; i < 6000; i++) {
                    takt();
                    const sz = st.voxelChunks ? st.voxelChunks.size : 0;
                    if (sz === last) stabil++;
                    else {
                        stabil = 0;
                        last = sz;
                    }
                    if (i > 60 && stabil > 80 && !(st.voxelMeshPending && st.voxelMeshPending.size > 0)) break;
                    if (i % 5 === 0) await pause(10);
                }
            };
            // ── an die Mess-Wiese
            st.playerMesh.position.set(MESS.x, r._voxelSurfaceY(MESS.x, MESS.z) + 1.8, MESS.z);
            await schwinge();
            r._tickChunkSatz();
            const s = st.chunkSaetze.get("boden");
            const aus = { spiegel: [], blicke: [], code: {}, ringChunks: last, bereiche: s.bloecke.size };

            // ── (a) SPIEGEL: Main-Sync gegen Worker für Chunks verschiedener Stufe
            const lpc = st.lastPlayerVoxelChunk;
            const kandidaten = [];
            for (const [key, e] of st.voxelChunks) {
                if (!e || e.empty || !e.mesh) continue;
                const [cx, cz] = key.split(",").map(Number);
                kandidaten.push({
                    key,
                    cx,
                    cz,
                    lod: e.lod || 0,
                    d: Math.max(Math.abs(cx - lpc.cx), Math.abs(cz - lpc.cz)),
                });
            }
            kandidaten.sort((a, b) => a.d - b.d || (a.key < b.key ? -1 : 1));
            const wahl = [];
            for (const lod of [0, 1, 2]) {
                const k = kandidaten.filter((c) => c.lod === lod).slice(0, lod === 0 ? 2 : 1);
                wahl.push(...k);
            }
            const gleich = (a, b) => {
                if (!a || !b || a.length !== b.length) return false;
                const x = new Uint8Array(a.buffer, a.byteOffset, a.byteLength),
                    y = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
                for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
                return true;
            };
            for (const c of wahl) {
                try {
                    const w = await r._voxelWorkerComputeChunkMesh(c.cx, c.cz, c.lod);
                    const m = r._buildVoxelChunkData(c.cx, c.cz, c.lod);
                    const g = m && m.mesh ? m.mesh.geometry : null;
                    if (!g || w.empty) {
                        aus.spiegel.push({ chunk: c.key, lod: c.lod, fehler: "leer auf einer Seite" });
                        continue;
                    }
                    const H = g.hoehle,
                        W = w.hoehle || {};
                    aus.spiegel.push({
                        chunk: c.key,
                        lod: c.lod,
                        n: H ? H.n : null,
                        felder: {
                            position: gleich(new Float32Array(w.positions), g.attributes.position.array),
                            index: gleich(new Uint32Array(w.indices), new Uint32Array(g.index.array)),
                            tri: gleich(W.tri, H && H.tri),
                            knoten: gleich(W.knoten, H && H.knoten),
                            muend: gleich(W.muend, H && H.muend),
                            seiten: gleich(W.seiten, H && H.seiten),
                            kanten: gleich(W.kanten, H && H.kanten),
                            rand: gleich(W.rand, H && H.rand),
                        },
                    });
                    g.dispose();
                } catch (e) {
                    aus.spiegel.push({ chunk: c.key, lod: c.lod, fehler: String((e && e.message) || e) });
                }
            }

            // ── Standorte am Gesetz: eine Mündung mit freier Sicht hinein, ein Höhlen-Raum mit Freiraum
            const fest = (x, y, z) => r._fieldDensityAt(x, y, z) > 0;
            const himmel = (x, y, z) => {
                for (let h = y + 1.2; h < y + 60; h += 1.2) if (fest(x, h, z)) return false;
                return true;
            };
            let muendung = null,
                raum = null;
            const span = r._voxelChunkConfig(0).span;
            for (let dcx = -2; dcx <= 2 && !(muendung && raum); dcx++)
                for (let dcz = -2; dcz <= 2 && !(muendung && raum); dcz++)
                    for (let x = (lpc.cx + dcx) * span + 1.8; x < (lpc.cx + dcx + 1) * span; x += 3.6)
                        for (let z = (lpc.cz + dcz) * span + 1.8; z < (lpc.cz + dcz + 1) * span; z += 3.6) {
                            const S = r._voxelSurfaceY(x, z);
                            if (S == null) continue;
                            for (let y = S - 4; y > S - 60; y -= 2) {
                                if (fest(x, y, z)) continue;
                                if (!muendung)
                                    for (const [dx, dz] of [
                                        [1, 0],
                                        [-1, 0],
                                        [0, 1],
                                        [0, -1],
                                    ]) {
                                        if (
                                            fest(x + dx * 3.6, y, z + dz * 3.6) ||
                                            !himmel(x + dx * 3.6, y, z + dz * 3.6)
                                        )
                                            continue;
                                        let L = 0;
                                        while (L < 30 && !fest(x - dx * L, y, z - dz * L)) L += 1;
                                        if (L >= 12) muendung = { x, y, z, dx, dz };
                                        break;
                                    }
                                if (!raum) {
                                    let frei = 99;
                                    for (const [a, b, c] of [
                                        [1, 0, 0],
                                        [-1, 0, 0],
                                        [0, 1, 0],
                                        [0, -1, 0],
                                        [0, 0, 1],
                                        [0, 0, -1],
                                    ]) {
                                        let d = 0;
                                        while (d < 12 && !fest(x + a * d, y + b * d, z + c * d)) d += 0.5;
                                        frei = Math.min(frei, d);
                                    }
                                    if (frei >= 3 && S - y > 12) raum = { x, y, z };
                                }
                            }
                        }
            const boden = (x, z) => r._voxelSurfaceY(x, z);
            const blicke = [];
            const p0 = { x: MESS.x, z: MESS.z };
            blicke.push({
                name: "wiese",
                auge: [p0.x, boden(p0.x, p0.z) + 1.7, p0.z],
                ziel: [p0.x, boden(p0.x, p0.z) + 1.7, p0.z - 100],
            });
            blicke.push({
                name: "hang",
                auge: [p0.x, boden(p0.x, p0.z) + 40, p0.z],
                ziel: [p0.x - 60, boden(p0.x - 60, p0.z - 140), p0.z - 140],
            });
            if (muendung) {
                const m = muendung;
                blicke.push({
                    name: "muendung",
                    auge: [m.x + m.dx * 9, m.y + 1, m.z + m.dz * 9],
                    ziel: [m.x - m.dx * 10, m.y - 1, m.z - m.dz * 10],
                });
            }
            if (raum)
                blicke.push({
                    name: "hoehle",
                    auge: [raum.x, raum.y, raum.z],
                    ziel: [raum.x + 20, raum.y - 3, raum.z + 7],
                });
            aus.orte = { muendung, raum };

            // ── (b)–(e) je Blick: das Hauptbild aus dem Auge (die Spiel-Kamera an den Blick gestellt), dann die Kaskade
            // (Stellvertreter-Licht, schräg, über dem Ziel) — beide über den EINEN Chokepoint
            const cam = st.camera;
            const merk = { p: cam.position.clone(), q: cam.quaternion.clone() };
            const S = r._kaskadenSchmier();
            const L = new T.Vector3(0.35, -0.85, 0.4).normalize(); // die Licht-Richtung (vom Licht fort)
            // die Höhlen-Dreiecke im Abschnitt gegen die, die das EINE Gesetz der Pass-Wahl (`_passTrifftBox`, in der Lage
            // des Hauptbilds) ohne die Höhlen-Sicht zöge
            const zaehl = (liste, lage) => {
                let ab = 0,
                    imFr = 0;
                const drin = new Set(liste);
                for (const b of s.bloecke.values())
                    for (const z of b.zellen)
                        if (z.knoten !== undefined && !z.huelle.isEmpty() && r._passTrifftBox(lage, z.huelle, 0)) {
                            imFr += z.idx.length / 3;
                            if (drin.has(z)) ab += z.idx.length / 3;
                        }
                return { ab, imFr };
            };
            // das Hauptbild eines Blicks, bis jede Mündung im Bild ihre Horizont-Sperre trägt (je Bild höchstens
            // `HOEHLEN_HORIZONT_PROBEN` frische Proben; eine ohne gilt als offen — dann prüfte die Wand die Sperre nicht)
            const hauptbild = (bl) => {
                cam.position.set(bl.auge[0], bl.auge[1], bl.auge[2]);
                cam.lookAt(bl.ziel[0], bl.ziel[1], bl.ziel[2]);
                cam.updateMatrixWorld(true);
                for (let f = 0; f < 400; f++) {
                    r._tickChunkSatz();
                    r._passSicht(cam, false);
                    const offen = s.hoehle && s.hoehle.offen ? s.hoehle.offen.length : 0;
                    if (offen <= r.constructor.HOEHLEN_HORIZONT_PROBEN) break;
                    r._passSicht(cam, true);
                }
                return (s.abschnitte.get("haupt") || { liste: [] }).liste.slice();
            };
            const miss = (bl) => {
                const liste = hauptbild(bl);
                const z = zaehl(liste, S.lage);
                const h = window.__hoehlenStrahl(r, cam, liste, { nx: 160, ny: 90 });
                const ohne = liste.filter((z) => z.knoten === undefined);
                const blind = window
                    .__hoehlenStrahl(r, cam, ohne, { nx: 160, ny: 90 })
                    .fehlend.filter((f) => f.hoehle).length;
                // die Kaskade: orthogonal, das Ziel in der Mitte, weit zum Licht hin
                const licht = new T.OrthographicCamera(-90, 90, 90, -90, 0, 1600);
                licht.coordinateSystem = cam.coordinateSystem;
                licht.updateProjectionMatrix();
                licht.position.set(bl.ziel[0] - L.x * 800, bl.ziel[1] - L.y * 800, bl.ziel[2] - L.z * 800);
                licht.lookAt(bl.ziel[0], bl.ziel[1], bl.ziel[2]);
                licht.updateMatrixWorld(true);
                // dieselbe Lage wie in `_passSicht`: Matrix, Frustum und die Lage des EINEN Gesetzes der Pass-Wahl (der
                // Stellvertreter ist keine Kaskaden-Kamera — er trägt keine Scheibe, das Gesetz urteilt nach seinem Frustum)
                S.m.multiplyMatrices(licht.projectionMatrix, licht.matrixWorldInverse);
                S.frustum.setFromProjectionMatrix(S.m, licht.coordinateSystem);
                r._passWahlLage(S, licht, 0);
                r._chunkSatzPass(licht, false, 0, S);
                const listeK = (s.abschnitte.get("k0") || { liste: [] }).liste.slice();
                r._chunkSatzPass(licht, true, -1, S);
                r._passSicht(cam, true);
                const sch = window.__hoehlenSchatten(r, cam, licht, listeK, { nx: 128, ny: 72 });
                return {
                    name: bl.name,
                    auge: bl.auge.map((v) => +v.toFixed(1)),
                    strahlen: h.strahlen,
                    hoehle: h.hoehle,
                    fehlend: h.fehlend,
                    blind,
                    hoehleImAbschnitt: z.ab,
                    hoehleImFrustum: z.imFr,
                    abschnittTri: liste.reduce((a, x) => a + x.idx.length / 3, 0),
                    kaskadeTri: listeK.reduce((a, x) => a + x.idx.length / 3, 0),
                    schatten: { empfaenger: sch.empfaenger, beschattet: sch.beschattet, lecks: sch.lecks },
                };
            };
            for (const bl of blicke) aus.blicke.push(miss(bl));

            // ── (h) GEDÄCHTNIS: die gemerkte Horizont-Sperre gilt nur dem Boden, den sie gemessen hat. Im Stand an der Mündung
            // (jede Mündung im Bild trägt ihre Sperre) schreibt ein Geomorph-Schreiber einen Boden-Bereich neu
            // (`_chunkSatzMarke`, wie beim Graben oder einer LOD-Naht): der nächste Pass misst jede Mündung im Bild neu.
            const blM = blicke.find((x) => x.name === "muendung");
            if (blM) {
                const H = () => s.hoehle;
                const imPass = () => {
                    r._tickChunkSatz();
                    r._passSicht(cam, false);
                    const o = {
                        offen: H().offen.length,
                        imBild: [...H().muendungen].reduce(
                            (a, kn) => a + kn.tore.filter((t) => t.st === H().stempel).length,
                            0
                        ),
                    };
                    r._passSicht(cam, true);
                    return o;
                };
                hauptbild(blM);
                r._passSicht(cam, true);
                const vor = imPass();
                const bm = [...s.bloecke.values()].find((b) => b.hoehle);
                r._chunkSatzMarke("boden", bm.key, ["aMorphTarget", "aMorphWeight"]);
                const nach = imPass();
                aus.gedaechtnis = { vor: vor.offen, nach: nach.offen, imBild: vor.imBild, bereich: bm.key };
            }

            // ── (b') HINAUS: der Spieler 16 m unter der Wiese (der Ring steht um ihn, LOD 0), das Auge in der Höhlen-Luft,
            // der Blick durch die Mündung hinaus — neu, dann die alte Probe (die Sperre ohne den Weg hinaus, am Exemplar)
            st.playerMesh.position.set(HINAUS.spieler[0], HINAUS.spieler[1], HINAUS.spieler[2]);
            await schwinge();
            r._tickChunkSatz();
            const hin = { name: "hinaus", auge: HINAUS.auge, ziel: HINAUS.ziel };
            const ha = HINAUS.auge;
            const ueber = (() => {
                for (let y = ha[1] + 1.2; y < ha[1] + 60; y += 1.2) if (fest(ha[0], y, ha[2])) return true;
                return false;
            })();
            const xh = miss(hin);
            xh.augeInHoehle = !fest(ha[0], ha[1], ha[2]) && ueber;
            r._hoehlenHinaus = () => {};
            // dieselbe Lage: die Kette hielte die eben gerechnete Wahl (`_passLageGen`, Welle C) — die alte Probe rechnet neu
            if (r._passLagen) r._passLagen.clear();
            const alt = window.__hoehlenStrahl(r, cam, hauptbild(hin), { nx: 160, ny: 90 });
            delete r._hoehlenHinaus;
            xh.altFehlend = alt.fehlend.length;
            xh.altZuerst = alt.fehlend[0] || null;
            aus.blicke.push(xh);
            cam.position.copy(merk.p);
            cam.quaternion.copy(merk.q);
            cam.updateMatrixWorld(true);
            // ── (i) HIMMELS-LICHT: je Höhlen-Vertex des Boden-Satzes (nur in Dreiecken der Höhlen-Luft) die Himmels-Sicht
            // `aHimmel` gegen die unabhängige Wahrheit — den GERADEN Abstand d zum nächsten Vertex einer Himmels-Fläche: der
            // Netz-Weg ist nie kürzer, eine Kante höchstens 2,5 Schritte lang, also trägt keiner mehr als exp(−0,4·d/m) + 0,02 (der
            // gerade Abstand darf durch Fels führen: die Grenze ist nur oben scharf); die Höhlen-Vertices in den Mündungs-Boxen des
            // Graphs (`tore`, Höhlen-Luft neben Himmels-Luft — die Wahrheit des Dichtefelds) tragen im Mittel mindestens 0,15.
            {
                const A = r.constructor;
                const bs = [...r.state.chunkSaetze.values()].find((q) => q.spec && q.spec.name === "bodenSatz");
                const geo = bs && bs.geom;
                const PA = geo && geo.attributes.position;
                const HA = geo && geo.attributes.aHimmel;
                const himmelV = new Set(),
                    hoehleV = new Set();
                for (const b of bs ? bs.bloecke.values() : [])
                    for (const zl of b.zellen || []) {
                        const ziel = zl.knoten ? hoehleV : himmelV;
                        for (let i = 0; i < zl.idx.length; i++) ziel.add(zl.idx[i]);
                    }
                for (const i of himmelV) hoehleV.delete(i);
                const mundV = new Set();
                const pm = new window.THREE.Vector3();
                for (const b of bs ? bs.bloecke.values() : [])
                    for (const zl of b.zellen || []) {
                        const kn = zl.knoten;
                        if (!kn || !kn.tore || kn.tore.length === 0) continue;
                        for (let i = 0; i < zl.idx.length; i++) {
                            const j = zl.idx[i];
                            pm.set(PA.getX(j), PA.getY(j), PA.getZ(j));
                            if (hoehleV.has(j) && kn.tore.some((t) => t.box && t.box.containsPoint(pm))) mundV.add(j);
                        }
                    }
                const L = A.HIMMELS_SICHT ? A.HIMMELS_SICHT.m : 3;
                const TIEF = 14,
                    R = 2,
                    GR = 15;
                const gitter = new Map();
                for (const i of himmelV) {
                    const k =
                        Math.floor(PA.getX(i) / R) +
                        "," +
                        Math.floor(PA.getY(i) / R) +
                        "," +
                        Math.floor(PA.getZ(i) / R);
                    let l = gitter.get(k);
                    if (!l) gitter.set(k, (l = []));
                    l.push(i);
                }
                const abstand = (x, y, z) => {
                    let best = Infinity;
                    const n = Math.ceil(GR / R);
                    const gx = Math.floor(x / R),
                        gy = Math.floor(y / R),
                        gz = Math.floor(z / R);
                    for (let a = -n; a <= n; a++)
                        for (let bb = -n; bb <= n; bb++)
                            for (let c = -n; c <= n; c++) {
                                const l = gitter.get(gx + a + "," + (gy + bb) + "," + (gz + c));
                                if (l)
                                    for (const j of l) {
                                        const d = Math.hypot(PA.getX(j) - x, PA.getY(j) - y, PA.getZ(j) - z);
                                        if (d < best) best = d;
                                    }
                            }
                    return best;
                };
                const hl = {
                    hoehle: hoehleV.size,
                    tief: 0,
                    tiefM: TIEF,
                    ueber: [],
                    muend: mundV.size,
                    muendMittel: null,
                    muendMin: 0.15,
                    ohneAttribut: !HA,
                };
                let ms = 0,
                    k = 0;
                for (const i of hoehleV) {
                    // jeder dritte Vertex (die Kosten der Linse)
                    const x = PA.getX(i),
                        y = PA.getY(i),
                        z = PA.getZ(i);
                    if (k++ % 3 !== 0) continue;
                    const d = abstand(x, y, z);
                    if (d > TIEF) hl.tief++;
                    if (!HA) continue;
                    const v = HA.getX(i);
                    const max = Math.exp((-0.4 * d) / L) + 0.02;
                    if (v > max && hl.ueber.length < 50)
                        hl.ueber.push({
                            p: [x, y, z].map((q) => +q.toFixed(1)),
                            v: +v.toFixed(3),
                            d: +d.toFixed(2),
                            max: +max.toFixed(3),
                        });
                }
                if (HA) for (const i of mundV) ms += HA.getX(i);
                hl.muendMittel = mundV.size ? +(ms / mundV.size).toFixed(3) : null;
                aus.himmel = hl;
                // (k) UNTER FELS WÄCHST NICHTS: jeder Höhlen-Vertex ohne Himmel (aHimmel ≤ 0,001) trägt den Stein der Palette
                // (`BODEN_FARBE.rock`, je Kanal auf 0,002) — nie die Farbe der Säule über ihm
                const CA = geo && geo.attributes.color;
                const fels = A.BODEN_FARBE.rock;
                const wf = { ohneHimmel: 0, fremd: 0, gruen: 0, erst: null };
                if (HA && CA)
                    for (const i of hoehleV) {
                        if (HA.getX(i) > 0.001) continue;
                        wf.ohneHimmel++;
                        const c = [CA.getX(i), CA.getY(i), CA.getZ(i)];
                        if (Math.max(...c.map((q, j) => Math.abs(q - fels[j]))) <= 0.002) continue;
                        wf.fremd++;
                        if (c[1] - (c[0] + c[2]) / 2 > 0) wf.gruen++;
                        if (!wf.erst)
                            wf.erst = {
                                p: [PA.getX(i), PA.getY(i), PA.getZ(i)].map((q) => +q.toFixed(1)),
                                c: c.map((q) => +q.toFixed(3)),
                                fels: fels.map((q) => +q.toFixed(3)),
                            };
                    }
                aus.wieseUnterFels = wf;
            }
            // ── (j) DAS LICHT DES AUGES: das Auge in der Höhlen-Luft (der Hinaus-Blick, 16 m unter der Wiese) und unter freiem
            // Himmel (2 m über der Säulen-Oberkante desselben Orts) — je Ort der Takt der Lichter (`_applyDayNightToScene`),
            // dann der Himmel am Auge und die Stärke des Terms (die Uniform `atmoUniforms.augenLicht` = Farbe × Stärke) gegen
            // sein Gesetz (AUGEN_LICHT, die Belichtung des Takts); (l) unter freiem Himmel jedes Licht der Szene, wie r184 es
            // sammelt (sichtbar, in den Ebenen der Kamera)
            {
                const A = r.constructor.AUGEN_LICHT;
                const B = r.constructor.BELICHTUNG;
                const lichtAm = (p) => {
                    cam.position.set(p[0], p[1], p[2]);
                    cam.updateMatrixWorld(true);
                    r._applyDayNightToScene();
                    const au = st.atmoUniforms && st.atmoUniforms.augenLicht;
                    const farbe = A ? new T.Color(A.farbe) : null;
                    const h = st.himmelAmAuge;
                    const k = st.renderer && st.renderer.toneMappingExposure > 0 ? st.renderer.toneMappingExposure : 1;
                    const soll =
                        A && Number.isFinite(h)
                            ? ((1 - h) * ((B.zielKarte * Math.PI) / 0.18) * Math.pow(A.karteM, A.abfall)) / k
                            : null;
                    const lichter = [];
                    st.scene.traverseVisible((o) => {
                        if (!o.isLight || !o.layers.test(cam.layers)) return;
                        const c = o.color;
                        // die Klasse beim Namen: der Typ, und eine Unterklasse (eigener Licht-Knoten) dazu
                        const stamm = T[o.type];
                        const unter =
                            stamm && Object.getPrototypeOf(o) !== stamm.prototype ? "/" + o.constructor.name : "";
                        lichter.push({
                            name: o.name || "",
                            typ: o.type + unter,
                            I: +(+o.intensity).toFixed(4),
                            schwarz: !!c && c.r + c.g + c.b <= 0,
                            direkt: !(o.isAmbientLight || o.isHemisphereLight || o.isLightProbe),
                        });
                    });
                    return {
                        auge: p.map((v) => +v.toFixed(1)),
                        h: Number.isFinite(h) ? +h.toFixed(3) : null,
                        I: au && farbe && farbe.r > 0 ? +(au.value.r / farbe.r).toFixed(3) : null,
                        soll: soll === null ? null : +(soll > 1e-4 ? soll : 0).toFixed(3),
                        abfall: A ? A.abfall : null,
                        lichter,
                    };
                };
                const ha = HINAUS.auge;
                const frei = [ha[0], r.getTerrainHeightAt(ha[0], ha[2]) + 2, ha[2]];
                const hoe = lichtAm(ha);
                const fr = lichtAm(frei);
                aus.szenenLicht = { frei: fr.lichter, hoehle: hoe.lichter };
                delete hoe.lichter;
                delete fr.lichter;
                // die Wesen in Höhlen-Luft (in einer Luft-Box eines Höhlen-Knotens): der Term liegt im Boden-Stoff, sie tragen
                // das Licht des Auges nicht
                const sb = st.chunkSaetze.get("boden");
                let wesen = 0;
                for (const w of st.creatures || []) {
                    const wp = w && w.position;
                    if (!wp) continue;
                    let drin = false;
                    for (const bl of sb.bloecke.values()) {
                        if (!bl.hoehle) continue;
                        for (const kn of bl.hoehle.knoten) if (kn.luft && kn.luft.containsPoint(wp)) drin = true;
                        if (drin) break;
                    }
                    if (drin) wesen++;
                }
                aus.augenLicht = {
                    hoehle: hoe,
                    frei: fr,
                    augeInHoehle: xh.augeInHoehle === true,
                    wesenInHoehle: wesen,
                    wesen: (st.creatures || []).length,
                };
                cam.position.copy(merk.p);
                cam.quaternion.copy(merk.q);
                cam.updateMatrixWorld(true);
                r._applyDayNightToScene();
            }
            // ── (f) der EINE Chokepoint liest die Sicht
            const code = (f) => (typeof f === "function" ? window.__codeOf(f) : "");
            // der Boden-Stoff trägt die Himmels-Sicht (`himmelsSicht`), der EINE Stoff-Bau liest sie als Verdeckung und als
            // Grenze der 2.5D-Lichtung (die wahre Normale in der Höhle)
            const pbr = code(r._buildPbrNodeMaterial);
            aus.code.himmelLiest =
                /himmelsSicht:\s*true/.test(code(r._getVoxelChunkMaterial)) &&
                /\.aoNode\s*=\s*THREE\.TSL\.attribute\("aHimmel"/.test(pbr);
            aus.code.normaleHoehle = /_flat\.mul\(_hS\)/.test(pbr) && /attribute\("aHimmel"/.test(pbr);
            aus.code.augenTerm = /\.augenLicht\b/.test(pbr) && /_hS\.oneMinus\(\)/.test(pbr);
            // die zwei Fallen des Terms (Werkbank 11.10., echte GPU — der Null-Renderer baut keinen Graph): die geteilten
            // Variablen VOR dem Zweig gelesen, und nur Namen, die `three/tsl` der Seite kennt
            const em = pbr.slice(Math.max(0, pbr.indexOf("emissiveNode")));
            const vorZweig = em.slice(0, Math.max(0, em.indexOf(".If(")));
            aus.code.augenVorZweig =
                /normalView\.toVar\(\)/.test(vorZweig) && /positionViewDirection\.toVar\(\)/.test(vorZweig);
            const fremd = em.slice(0, 4000).match(/\b(diffuseContribution|specularColorBlended)\b/);
            aus.code.augenTslFremd = fremd ? fremd[1] : null;
            aus.code.passLiest = /this\._hoehlenSicht\(/.test(code(r._chunkSatzPass));
            aus.code.abschnittLiest = /\.knoten\.sicht\s*===\s*stempel/.test(code(r._chunkSatzAbschnitt));
            aus.code.hinausLiest = /this\._hoehlenHinaus\(/.test(code(r._hoehlenSicht));
            return aus;
        }, ORTE);
    } catch (e) {
        befund = { fehler: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();
    if (!befund || befund.fehler) {
        console.log("❌ LAUF-FEHLER: " + (befund ? befund.fehler : "kein Befund"));
        process.exit(1);
    }
    befund.pageErrors = pageErrors;
    console.log(`  Ring ${befund.ringChunks} Chunks, ${befund.bereiche} Boden-Bereiche`);
    for (const sp of befund.spiegel)
        console.log(
            `  Spiegel ${sp.chunk} (LOD ${sp.lod}, ${sp.n} Zellen): ` +
                (sp.fehler ||
                    Object.entries(sp.felder)
                        .map(([k, x]) => `${k} ${x ? "=" : "≠"}`)
                        .join(" · "))
        );
    console.log(`  Orte: Mündung ${JSON.stringify(befund.orte.muendung)} · Höhle ${JSON.stringify(befund.orte.raum)}`);
    for (const x of befund.blicke)
        console.log(
            `  Blick ${x.name} ${JSON.stringify(x.auge)}: ${x.strahlen} Strahlen, ${x.hoehle} auf Höhle, fehlend ${x.fehlend.length}, ` +
                `blind-Probe ${x.blind} · Abschnitt ${x.abschnittTri} Dreiecke (Höhle ${x.hoehleImAbschnitt} von ${x.hoehleImFrustum} im ` +
                `Frustum) · Kaskade ${x.kaskadeTri} · Schatten ${x.schatten.empfaenger} Empfänger, ${x.schatten.beschattet} beschattet, ` +
                `${x.schatten.lecks.length} Lecks` +
                (x.name === "hinaus"
                    ? ` · Auge in Höhlen-Luft ${x.augeInHoehle} · die alte Probe ließe ${x.altFehlend} Zellen weg` +
                      (x.altZuerst ? `, zuerst ${x.altZuerst.bereich}#${x.altZuerst.knoten}` : "")
                    : "")
        );
    const gd = befund.gedaechtnis;
    if (gd)
        console.log(
            `  (h) Gedächtnis an der Mündung: ${gd.imBild} Mündungen im Bild · im Stand neu gemessen ${gd.vor} · nach ` +
                `\`_chunkSatzMarke("boden", ${gd.bereich})\` neu gemessen ${gd.nach}`
        );
    const hl = befund.himmel;
    if (hl)
        console.log(
            `  (i) Himmels-Licht: ${hl.hoehle} Höhlen-Vertices (jeder dritte geprüft), ${hl.tief} tiefer als ${hl.tiefM} m · ` +
                (hl.ohneAttribut
                    ? "der Boden-Satz trägt keine Himmels-Sicht"
                    : `über dem Abstand ${hl.ueber.length} · in den Mündungen ${hl.muend}, im Mittel ${hl.muendMittel}`)
        );
    const al = befund.augenLicht;
    if (al)
        console.log(
            `  (j) Licht des Auges: in der Höhle ${JSON.stringify(al.hoehle)} · unter freiem Himmel ${JSON.stringify(al.frei)}` +
                ` · Wesen in Höhlen-Luft ${al.wesenInHoehle} von ${al.wesen} (sie tragen es nicht)`
        );
    const sl = befund.szenenLicht;
    if (sl)
        console.log(
            `  (l) Szenen-Licht: unter freiem Himmel ${sl.frei.length} Lichter (Licht-Knoten je beleuchtetem Stoff): ` +
                sl.frei
                    .map((l) => `${l.typ}${l.name ? " `" + l.name + "`" : ""} ${l.I}${l.direkt ? "" : " (indirekt)"}`)
                    .join(" · ")
        );
    const wu = befund.wieseUnterFels;
    if (wu)
        console.log(
            `  (k) Wiese unter Fels: ${wu.ohneHimmel} Höhlen-Vertices ohne Himmel, ${wu.fremd} nicht Stein (${wu.gruen} grün)` +
                (wu.erst ? `, zuerst ${JSON.stringify(wu.erst)}` : "")
        );
    const v = urteil(befund);
    if (v.length) {
        console.log("\n❌ HÖHLEN-SICHT ROT:\n  " + v.join("\n  "));
        process.exit(1);
    }
    console.log(
        "\n✅ HÖHLEN-SICHT GRÜN — jede sichtbare Höhlen-Fläche steht im Abschnitt, kein Licht-Leck, Main = Worker."
    );
})();
