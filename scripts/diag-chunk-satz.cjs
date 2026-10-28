#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-chunk-satz.cjs — DER SATZ: die Draw-Einheit ist Material × Geometrie über den ganzen Ring, nie Chunk × Material.
// Die Wand zählt die Render-Bürger je Klasse direkt im
// Szenen-Baum (Null-Renderer — Bundles sind headless reine Gruppen, die Chunk-Meshes werden gebaut):
//   (a) BODEN — höchstens EIN Objekt trägt das Boden-Material (der Satz, Stitch eingeschlossen),
//       kein `voxelChunk:`-Name lebt im Szenen-Baum;
//   (b) WASSER — höchstens EIN Chunk-Wasser-Objekt (der Satz);
//   (c) STREU-SATZ (W7) — die Draw-Einheit der Nah-Streu (Kachel-Ring um die Kamera) ist
//       ihr STOFF: kein Nah-Streu-Objekt zeichnet selbst (keine `streuNah:`-/`streu-klein`-Mesh im Szenen-Baum), keine
//       Deck-Streu und keine Fern-Deko (beide fielen); jede Senke (Art × Gestalt × Stufe × Teil) trägt je Kachel einen
//       Block (Σ n = Anzahl, je Block die Ernte-Identitäten, jeder Block einer lebenden Kachel des Rings), und jeder Block
//       mit Pflanzen lebt als Bereich im Streu-Satz seines Stoffs — n × Vertices der Gestalt, die erste Pflanze in
//       Welt-Lage (Geometrie × Matrix), je Stoff EIN Satz;
//   (d) BAU — keine Instanz-Gruppe mit `@p:` im Schlüssel, kein `p:`-Region-Bundle;
//   (e) KONSUM — ein Chunk-Abbau und -Wiederaufbau ändert den Satz (Bereiche, Index-Zahl), nie die Zahl
//       der Szenen-Kinder; der Wiederaufbau trifft dieselbe Index-Zahl (deterministisch);
//   (f) TREUE — jeder Satz-Bereich trägt byte-gleich die Arrays seines Chunks (Index um den Bereichs-
//       Anfang verschoben, genau seine Dreiecke als lückenlose Zell-Läufe — Boden/Wasser Viertel, Bau je Instanz); jeder
//       Abschnitt (der Haken des Renders legt ihn) trägt seine Zellen byte-gleich hintereinander, Boden nah → fern;
//   (g) kein Page-Error;
//   (h) BAU-SATZ — die Draw-Einheit des gesetzten Studio-Baus ist sein STOFF: jede lebende Gruppe einer
//       Satz-Art (`AnazhRealm.BAU_SATZ` je Rezept-kind: Haus, Fels, Kristall, Säulen; ohne Tür-Flügel) hängt an keinem
//       Eltern-Knoten (weder Bundle noch Szene) und lebt als Bereich im Satz ihres Stoffs — n × liveCount Vertices, die
//       erste Instanz in Welt-Lage (Geometrie × Instanz-Matrix), je Instanz eine Zelle;
//   (i) WACHSEN — ein wachsender Satz tauscht die Geometrie am SELBEN Mesh (derselbe Inhalt); der Tausch ist
//       sicher, weil `_renderObjektRegister` r184s Geometrie-Hörer herausnimmt (er zerstörte beim verzögerten Entsorgen
//       der alten Geometrie die GPU-Puffer der neuen) — EINE Antwort an der Wurzel, kein frischer Mesh je Wachsen;
//   (j) NEUSCHREIBEN — kein Pass schreibt den Abschnitt eines anderen: die Neuschreib-Linse des Satzes
//       (`s.schreiben`, Index-Bytes je „Verursacher>Abschnitt") zählt über Frames in Ruhe 0 Bytes je Pass, und ein Index,
//       der für Hauptbild + Kaskaden zu klein ist (Kapazität erzwungen klein, Abend mit der Sonne im Rücken), wächst
//       EINMAL statt einander je Frame zu verdrängen — danach 0 Bytes je Frame, fremd wie eigen.
//   (k) DER SATZ FOLGT SEINEM INHALT — trägt die Kapazität eines Satzes `ruheTakte` Takte lang mehr als
//       `schwelle` × Ziel, schrumpft er am selben Mesh auf Inhalt × `luft`: leer auf vMin/iMin, belegt dicht nach vorn
//       (jeder Bereich treu, jeder Abschnitt neu gelegt). Der Selbsttest fährt die alte Regel (nur der leere Satz kehrt zurück) — sie hält das Hochwasser.
//   (n) DER EINE SATZ-STOFF — je Klasse eines Stoffs (Art · Seh-Klasse · Seite · Durchsicht · Gewebe · Leucht-Gesetz ·
//       Zeitplan · Klarlack, je Satz-Name und Wurf) EIN Bau-Satz; die Regler (Rauheit · Metall · Deckkraft · Emissiv × Glut-
//       Stärke) reisen je Ecke (`aRegler`, `aGlut`), die erste Ecke jeder Gruppe trägt die Regler ihres Studio-Stoffs.
//       Selbsttest: zwei Sätze einer Klasse, ein Satz ohne `aRegler`, eine untreue Ecke.
//   (l) DER WURF-SATZ (S3 haus) — der Satz `bauWurf` (die NUR-WURF-Stufe 3 von Haus und Ausstattung, der EINE Schatten-Stoff)
//       zieht im Hauptbild 0 Befehle und liegt nur auf SHADOW_TWIN_LAYER; die Kaskade zeichnet ihn. Selbsttest: derselbe
//       Satz ohne die Marke `nurWurf` zeichnet im Hauptbild — die Wand nennt ihn.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): ein Zensus mit einem `voxelChunk:0,0:lod0`
// direkt in der Szene, einer Gruppe `x#0@p:0,0`, einer selbst zeichnenden Streu-Senke, einem Block ohne Bereich, einer
// Fern-Deko, einer
// selbst zeichnenden Satz-Gruppe (`f:zacken:L0`) und einem Haus ohne Bereich MUSS rot fallen und jeden Täter mit
// Namen und Zahl nennen — eine Wand, die hier nicht feuert, ist selbst rot.
//   node scripts/diag-chunk-satz.cjs [--selftest]   (npm run gate:chunk-satz)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const { statikServer, warteAufWelt, taeterFaelle, selbsttestEnde, nullSeite, pruefer } = require("./lib/welt-boot.cjs");

// (o) die Schwelle des Stufen-Sprungs: ein Wechsel darf die gezeichnete Fläche höchstens so weit versetzen (m)
const STUFEN_SPRUNG_M = 0.1;

// Das Urteil über einen Zensus: Liste der Verstöße (leer = grün). Rein, im Selbsttest wie im Lauf.
function urteil(z) {
    const v = [];
    if (z.boden.objekte > 1)
        v.push(
            `BODEN: ${z.boden.objekte} Objekte tragen das Boden-Material (Soll 1, der Satz) — ${z.boden.namen.join(", ")}`
        );
    if (z.voxelChunkNamen.length > 0)
        v.push(
            `BODEN: ${z.voxelChunkNamen.length} \`voxelChunk:\`-Objekte im Szenen-Baum — ${z.voxelChunkNamen.slice(0, 4).join(", ")}`
        );
    if (z.wasser.objekte > 1) v.push(`WASSER: ${z.wasser.objekte} Chunk-Wasser-Objekte (Soll ≤ 1, der Satz)`);
    // Die Nah-Streu zeichnet je Stoff im Streu-Satz (W7): jedes Nah-Streu-Objekt im Szenen-Baum zeichnet selbst — eine
    // InstancedMesh je Senke war der Befund (15 Befehle im Hauptbild, auch hinter dem Blick).
    const selbst = Object.entries(z.streuNah);
    if (selbst.length)
        v.push(
            `STREU: ${selbst.reduce((a, [, n]) => a + n, 0)} Nah-Streu-Objekte zeichnen selbst (Soll 0, der Streu-Satz ihres ` +
                `Stoffs) — ${selbst
                    .map(([k, n]) => k + (n > 1 ? "×" + n : ""))
                    .slice(0, 4)
                    .join(", ")}`
        );
    const ss = z.streuSatz || { ohneBereich: [], doppelt: [] };
    if (ss.ohneBereich.length)
        v.push(
            `STREU-SATZ: ${ss.ohneBereich.length} Blöcke ohne treuen Bereich — ${ss.ohneBereich.slice(0, 4).join(", ")}`
        );
    if (ss.doppelt.length)
        v.push(`STREU-SATZ: ${ss.doppelt.length} Stoffe in mehr als einem Satz — ${ss.doppelt.join(", ")}`);
    if (z.deck > 0) v.push(`STREU: ${z.deck} Deck-Streu-InstancedMeshes (gefallen, Soll 0)`);
    const fernSumme = Object.values(z.fern).reduce((a, b) => a + b, 0);
    if (fernSumme > 0) v.push(`STREU: ${fernSumme} Fern-Deko-InstancedMeshes (das Kreuz-Fernfeld fiel, Soll 0)`);
    if (z.pGruppen.length > 0)
        v.push(
            `BAU: ${z.pGruppen.length} Instanz-Gruppen mit \`@p:\` im Schlüssel — ${z.pGruppen.slice(0, 4).join(", ")}`
        );
    if (z.pBundles.length > 0)
        v.push(`BAU: ${z.pBundles.length} \`p:\`-Region-Bundles — ${z.pBundles.slice(0, 4).join(", ")}`);
    const bs = z.bauSatz || { selbst: [], ohneBereich: [] };
    if (bs.selbst.length > 0)
        v.push(
            `BAU-SATZ: ${bs.selbst.length} Gruppen einer Satz-Art zeichnen selbst (Soll 0, der Satz ihres Stoffs) — ` +
                bs.selbst.slice(0, 4).join(", ")
        );
    if (bs.ohneBereich.length > 0)
        v.push(
            `BAU-SATZ: ${bs.ohneBereich.length} Satz-Gruppen ohne treuen Bereich — ${bs.ohneBereich.slice(0, 4).join(", ")}`
        );
    // (n) DER EINE SATZ-STOFF: je Klasse eines Stoffs EIN Bau-Satz, die Regler je Ecke
    const sst = z.satzStoff;
    if (sst) {
        if (sst.zwillinge.length)
            v.push(
                `SATZ-STOFF: ${sst.zwillinge.length} Stoff-Klassen zeichnen in mehr als einem Bau-Satz, getrennt nur durch ihre ` +
                    `Regler (Rauheit · Metall · Deckkraft · Glut) — ${sst.zwillinge.slice(0, 4).join(", ")}`
            );
        if (sst.ohneRegler.length)
            v.push(
                `SATZ-STOFF: ${sst.ohneRegler.length} Bau-Sätze ohne Regler je Ecke (aRegler · aGlut) — ${sst.ohneRegler.slice(0, 4).join(", ")}`
            );
        if (sst.untreu.length)
            v.push(
                `SATZ-STOFF: ${sst.untreu.length} Gruppen tragen nicht die Regler ihres Stoffs — ${sst.untreu.slice(0, 4).join(", ")}`
            );
    }
    // (m) DIE VERTEX-FORM: der Boden-Satz trägt die Normale als snorm8x4 und die Farbe als float16x4 — eine Float32-
    // Normale oder -Farbe im Satz ist der Täter (60 statt 48 B je Vertex, 6 MB des Boden-Satzes)
    const SOLL = { normal: "nint8x4", color: "float16x4" };
    for (const f of z.vertexForm || [])
        if (SOLL[f.attr] && f.form !== SOLL[f.attr])
            v.push(`VERTEX-FORM: ${f.satz} ${f.attr} ${f.form} (Soll ${SOLL[f.attr]}) — ${f.mb} MB`);
    if (z.vertexForm && z.vertexForm.length) {
        const proVertex = z.vertexForm.reduce((a, f) => a + f.bytes, 0);
        if (proVertex > 48) v.push(`VERTEX-FORM: der Boden-Satz trägt ${proVertex} B je Vertex (Soll ≤ 48)`);
    }
    // (n) DIE BODEN-STUFEN (K51, K51-2 nach dem Kasten-Abstand): ein Chunk der Stufe L lebt höchstens bis zum Abstand
    // bis + vorlauf + halt seiner Stufe (`BODEN_STUFEN`, die Tabelle liest die Wand aus der Welt) — jenseits ist er zu
    // fein (Haushalt boden 120k samt Fern-Ring); ein Naht-Band brückt nur, wo der Morph die Naht nicht schliesst
    if (z.stufen) {
        const T = z.stufen.tabelle;
        const grenze = (lod) => {
            const st = T.stufen.find((x) => x.lod === lod);
            return st ? st.bis + T.vorlauf + T.halt : Infinity;
        };
        const fein = z.stufen.chunks.filter((c) => c.d >= grenze(c.lod));
        if (fein.length)
            v.push(
                `BODEN-STUFEN: ${fein.length} Chunks jenseits der Nah-Zone zu fein (${fein.reduce((a, c) => a + c.dreiecke, 0)} ` +
                    `Dreiecke) — ` +
                    fein
                        .slice(0, 4)
                        .map((c) => `${c.key} ${c.d.toFixed(1)} m L${c.lod} (Soll ≥ L${c.lod + 1}) ${c.dreiecke}`)
                        .join(", ")
            );
        const ohne = z.stufen.ohneNot;
        if (ohne.length)
            v.push(
                `BODEN-STUFEN: ${ohne.reduce((a, o) => a + o.n, 0)} Naht-Brücken ohne Not (der Morph trägt beide Enden) — ` +
                    ohne
                        .slice(0, 4)
                        .map((o) => `${o.key} ${o.n}`)
                        .join(", ")
            );
        const los = z.stufen.ohneSatz || [];
        if (los.length) v.push(`BODEN-STUFEN: ${los.length} Naht-Bänder ohne Bereich im Boden-Satz — ${los.slice(0, 4).join(", ")}`);
    }
    return v;
}

// (j) DIE NEUSCHREIB-WAND (rein): `m` = { phase: [ {"[Satz|]Verursacher>Abschnitt": Bytes, …} je Frame ] } — die
// Frames NACH dem ersten (er legt die Abschnitte) einer Phase mit unveränderten Frusta schreiben nichts; jede Zeile nennt
// Phase, Frame, Satz, wer wessen Abschnitt schrieb (wer ≠ wen: ein Pass schrieb den Abschnitt eines anderen) und die Bytes.
function urteilNeu(m) {
    const v = [];
    for (const [phase, frames] of Object.entries(m || {}))
        for (let i = 1; i < frames.length; i++)
            for (const [k, b] of Object.entries(frames[i]))
                if (b > 0) {
                    const strich = k.indexOf("|");
                    const satz = strich >= 0 ? k.slice(0, strich) + ": " : "";
                    const [wer, wen] = k.slice(strich + 1).split(">");
                    const was =
                        wer === wen ? `${wer} schrieb seinen Abschnitt` : `${wer} schrieb den Abschnitt von ${wen}`;
                    v.push(`NEUSCHREIBEN (${phase}, Frame ${i + 1}): ${satz}${was} — ${b} B`);
                }
    return v;
}

// Ein grüner Zensus (die Form, die der Lauf liefert) und drei injizierte Täter.
function selbsttest() {
    const gruen = {
        boden: { objekte: 1, namen: ["bodenSatz"] },
        voxelChunkNamen: [],
        wasser: { objekte: 1 },
        streuNah: {},
        streuSatz: { bloecke: 12, imSatz: 12, ohneBereich: [], doppelt: [] },
        deck: 0,
        fern: {},
        pGruppen: [],
        pBundles: [],
        bauSatz: { gruppen: 3, imSatz: 3, selbst: [], ohneBereich: [] },
        satzStoff: { saetze: 4, zwillinge: [], ohneRegler: [], untreu: [] },
        vertexForm: [
            { satz: "bodenSatz", attr: "position", form: "float32x3", bytes: 12, mb: 2.6 },
            { satz: "bodenSatz", attr: "normal", form: "nint8x4", bytes: 4, mb: 0.9 },
            { satz: "bodenSatz", attr: "color", form: "float16x4", bytes: 8, mb: 1.8 },
            { satz: "bodenSatz", attr: "aMorphTarget", form: "float32x3", bytes: 12, mb: 2.6 },
        ],
        stufen: {
            tabelle: {
                vorlauf: 3,
                halt: 4,
                stufen: [
                    { lod: 0, bis: 36, band: 12 },
                    { lod: 1, bis: 100, band: 12 },
                    { lod: 2, bis: 388.8, band: 40 },
                    { lod: 3, bis: Infinity, band: 0 },
                ],
            },
            chunks: [
                { key: "0,0", ring: 0, d: 0, lod: 0, dreiecke: 5300 },
                { key: "1,0", ring: 1, d: 21.6, lod: 0, dreiecke: 5100 },
                { key: "2,0", ring: 2, d: 64.8, lod: 1, dreiecke: 1300 },
                { key: "3,0", ring: 3, d: 108, lod: 2, dreiecke: 280 },
            ],
            jeStufe: { L0: 10400, L1: 1300, L2: 280 },
            naht: 900,
            bruecken: 40,
            ohneNot: [],
        },
    };
    const fehler = [];
    if (urteil(gruen).length !== 0) fehler.push("der grüne Zensus fällt rot: " + urteil(gruen).join(" · "));
    const faelle = [
        {
            name: "voxelChunk:0,0:lod0 direkt in der Szene",
            z: {
                ...gruen,
                boden: { objekte: 2, namen: ["bodenSatz", "voxelChunk:0,0:lod0"] },
                voxelChunkNamen: ["voxelChunk:0,0:lod0"],
            },
            muss: [/BODEN: 2 Objekte.*voxelChunk:0,0:lod0/, /BODEN: 1 `voxelChunk:`-Objekte.*voxelChunk:0,0:lod0/],
        },
        {
            name: "Gruppe x#0@p:0,0",
            z: { ...gruen, pGruppen: ["x#0@p:0,0"] },
            muss: [/BAU: 1 Instanz-Gruppen mit `@p:`.*x#0@p:0,0/],
        },
        {
            name: "eine Streu-Senke zeichnet selbst",
            z: { ...gruen, streuNah: { "blume:1:L2:0": 1 } },
            muss: [/STREU: 1 Nah-Streu-Objekte zeichnen selbst .*blume:1:L2:0/],
        },
        {
            name: "ein Block ohne Bereich im Streu-Satz",
            z: {
                ...gruen,
                streuSatz: { bloecke: 12, imSatz: 11, ohneBereich: ["farn:2:L1:0@-226,-212"], doppelt: [] },
            },
            muss: [/STREU-SATZ: 1 Blöcke ohne treuen Bereich — farn:2:L1:0@-226,-212/],
        },
        {
            name: "die Fern-Deko lebt",
            z: { ...gruen, fern: { blume: 1 } },
            muss: [/STREU: 1 Fern-Deko-InstancedMeshes/],
        },
        {
            name: "Deck-Zwilling lebt",
            z: { ...gruen, deck: 3 },
            muss: [/STREU: 3 Deck-Streu-InstancedMeshes/],
        },
        {
            name: "zwei Tor-Stoffe derselben Klasse, getrennt durch ihre Glut-Stärke",
            z: {
                ...gruen,
                satzStoff: {
                    saetze: 5,
                    zwillinge: ["bauSatz|unknown|0.62|0.00|0|1.00|v:metall|- ×2"],
                    ohneRegler: ["bauSatz|probe|-"],
                    untreu: ["f:maurentor:L1 (Rauheit 0,28 statt 0,59)"],
                },
            },
            muss: [
                /SATZ-STOFF: 1 Stoff-Klassen zeichnen in mehr als einem Bau-Satz.*v:metall/,
                /SATZ-STOFF: 1 Bau-Sätze ohne Regler je Ecke.*bauSatz|probe/,
                /SATZ-STOFF: 1 Gruppen tragen nicht die Regler ihres Stoffs.*maurentor/,
            ],
        },
        {
            name: "eine Felszacken-Gestalt zeichnet als eigene Gruppe",
            z: {
                ...gruen,
                bauSatz: { gruppen: 3, imSatz: 2, selbst: ["f:zacken:L0 (f:zacken|4|0:0)"], ohneBereich: [] },
            },
            muss: [/BAU-SATZ: 1 Gruppen einer Satz-Art zeichnen selbst.*f:zacken:L0/],
        },
        {
            name: "ein Haus ohne Bereich im Satz",
            z: {
                ...gruen,
                bauSatz: {
                    gruppen: 3,
                    imSatz: 2,
                    selbst: [],
                    ohneBereich: ["f:griechisch:L2 (f:griechisch|4|2|ov:x:0)"],
                },
            },
            muss: [/BAU-SATZ: 1 Satz-Gruppen ohne treuen Bereich.*f:griechisch:L2/],
        },
        {
            name: "der Boden-Satz trägt Normale und Farbe in Float32 (die Form vor K44)",
            z: {
                ...gruen,
                vertexForm: [
                    { satz: "bodenSatz", attr: "position", form: "float32x3", bytes: 12, mb: 2.6 },
                    { satz: "bodenSatz", attr: "normal", form: "float32x3", bytes: 12, mb: 2.6 },
                    { satz: "bodenSatz", attr: "color", form: "float32x3", bytes: 12, mb: 2.6 },
                    { satz: "bodenSatz", attr: "aMorphTarget", form: "float32x3", bytes: 12, mb: 2.6 },
                    { satz: "bodenSatz", attr: "aHimmel", form: "float32x1", bytes: 4, mb: 0.9 },
                    { satz: "bodenSatz", attr: "aSchutt", form: "float32x1", bytes: 4, mb: 0.9 },
                    { satz: "bodenSatz", attr: "aMorphWeight", form: "float32x1", bytes: 4, mb: 0.9 },
                ],
            },
            muss: [
                /VERTEX-FORM: bodenSatz normal float32x3 \(Soll nint8x4\)/,
                /VERTEX-FORM: bodenSatz color float32x3 \(Soll float16x4\)/,
                /VERTEX-FORM: der Boden-Satz trägt 60 B je Vertex/,
            ],
        },
        {
            name: "L0 bis Ring 2 und L1 in Ring 3 (die Kette vor K51), jenseits der Halte-Grenze",
            z: {
                ...gruen,
                stufen: {
                    ...gruen.stufen,
                    chunks: [
                        { key: "0,0", ring: 0, d: 0, lod: 0, dreiecke: 5300 },
                        { key: "-21,-18", ring: 2, d: 64.8, lod: 0, dreiecke: 5312 },
                        { key: "-17,-20", ring: 3, d: 108, lod: 1, dreiecke: 1404 },
                    ],
                },
            },
            muss: [
                /BODEN-STUFEN: 2 Chunks jenseits der Nah-Zone zu fein \(6716 Dreiecke\).*-21,-18 64\.8 m L0 \(Soll ≥ L1\)/,
            ],
        },
        {
            name: "das Naht-Band brückt, wo der Morph beide Enden trägt",
            z: { ...gruen, stufen: { ...gruen.stufen, ohneNot: [{ key: "stitch:-19,-18", n: 712 }] } },
            muss: [/BODEN-STUFEN: 712 Naht-Brücken ohne Not.*stitch:-19,-18 712/],
        },
        {
            name: "das Naht-Band zeichnet als eigenes Mesh (kein Bereich im Boden-Satz)",
            z: { ...gruen, stufen: { ...gruen.stufen, ohneSatz: ["-19,-18"] } },
            muss: [/BODEN-STUFEN: 1 Naht-Bänder ohne Bereich im Boden-Satz — -19,-18/],
        },
    ];
    taeterFaelle(faelle, urteil, { fehler });
    // (j) die Neuschreib-Wand: Ruhe ist grün; die alte Verdrängung (die Kaskaden schreiben einander je Frame neu) und
    // ein fremder Umzug fallen rot, beim Namen.
    const neuFaelle = [
        {
            name: "die ruhige Messung",
            z: { ruhe: [{ "haupt>haupt": 1335096, "k0>k0": 1758984 }, {}, {}], druck: [{ "k1>k1": 4096 }, {}] },
        },
        {
            name: "die Kaskaden verdrängen einander je Frame",
            z: { druck: [{ "k0>k0": 1758984 }, { "k1>k1": 1090140 }, { "k0>k0": 1758984 }] },
            muss: [/NEUSCHREIBEN \(druck, Frame 2\): k1 schrieb seinen Abschnitt — 1090140 B/, /Frame 3\): k0 schrieb/],
        },
        {
            name: "ein Schatten-Pass schreibt den Abschnitt eines anderen",
            z: { ruhe: [{}, { "k1>k0": 4096 }] },
            muss: [/NEUSCHREIBEN \(ruhe, Frame 2\): k1 schrieb den Abschnitt von k0 — 4096 B/],
        },
    ];
    taeterFaelle(neuFaelle, urteilNeu, { fehler });
    selbsttestEnde(fehler);
}

if (process.argv.includes("--selftest")) {
    console.log("=== CHUNK-SATZ — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const PORT = Number(process.env.CHUNK_SATZ_PORT) || 4483;
const server = statikServer();

const { check, ende } = pruefer();

(async () => {
    console.log("=== CHUNK-SATZ (Welle B) — Null-Renderer, die Render-Bürger je Klasse ===");
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 300000 });
    page.setDefaultTimeout(280000);
    let out = null;
    try {
        await server.zeige(page, 120000, "index.html", "networkidle0");
        await warteAufWelt(page, 120000);
        out = await page.evaluate(async () => {
            const r = window.anazhRealm,
                s = r.state;
            const res = {};
            // Einschwingen: die Welt steht (das EINE Einschwingen, welt-boot `__weltStehtNach`), dann Streu, Wasser und Fern-Deko
            // austreiben.
            await window.__weltStehtNach(() => {
                try {
                    r._gameLoopTick(performance.now());
                } catch {}
            });
            for (let i = 0; i < 60; i++) if (!r._tickPendingWaterIso(8)) break;
            // Die Nah-Streu: der Kachel-Ring um die Kamera, bis Studio-Teile ankommen und nichts mehr offen ist.
            for (let i = 0; i < 900; i++) {
                r._tickNahStreu();
                const ns = s.nahStreu;
                if (ns && ns.senken.size > 0 && ns.offen === 0) break;
                await sleep(100);
            }
            for (let i = 0; i < 30; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch {}
                if (i % 10 === 0) await sleep(0);
            }
            r._tickChunkSatz();

            // ── DER ZENSUS: Render-Bürger je Klasse im Szenen-Baum (Bundles eingeschlossen).
            const zensus = () => {
                const bodenMat = s.voxelChunkMaterial;
                const z = {
                    boden: { objekte: 0, namen: [], tris: 0 },
                    voxelChunkNamen: [],
                    wasser: { objekte: 0, tris: 0 },
                    streuNah: {},
                    deck: 0,
                    fern: {},
                    pGruppen: [],
                    pBundles: [],
                    szeneKinder: s.scene.children.length,
                    renderBuerger: 0,
                };
                const tris = (o) => {
                    const g = o.geometry;
                    if (!g) return 0;
                    const n = g.index ? g.index.count : g.attributes.position ? g.attributes.position.count : 0;
                    const dr = g.drawRange && Number.isFinite(g.drawRange.count) ? Math.min(g.drawRange.count, n) : n;
                    return (dr / 3) * (o.isInstancedMesh ? o.count : 1);
                };
                const artVon = (o) => (o.name && o.name.startsWith("streuNah:") ? o.name.slice(9) : o.name || "?");
                s.scene.traverse((o) => {
                    if (!o.isMesh || o.visible === false) return;
                    if (o.isInstancedMesh && !(o.count > 0)) return;
                    z.renderBuerger++;
                    const u = o.userData || {};
                    if (typeof o.name === "string" && o.name.startsWith("voxelChunk:")) z.voxelChunkNamen.push(o.name);
                    if (bodenMat && o.material === bodenMat) {
                        z.boden.objekte++;
                        if (z.boden.namen.length < 6) z.boden.namen.push(o.name || u.inventar || o.type);
                        z.boden.tris += tris(o);
                    }
                    if (u.chunkSatz === "wasser" || /^chunk-water/.test(String(u.hydroKind || ""))) {
                        z.wasser.objekte++;
                        z.wasser.tris += tris(o);
                    }
                    // (c) ein Nah-Streu-Objekt, das selbst zeichnet (die Senke zeichnet nie — ihr Stoff-Satz zeichnet)
                    if (
                        u.inventar === "streu-klein" ||
                        (typeof o.name === "string" && o.name.startsWith("streuNah:"))
                    ) {
                        const a = artVon(o);
                        z.streuNah[a] = (z.streuNah[a] || 0) + 1;
                    }
                    if (u.inventar === "deck-streu") z.deck++;
                    if (u.inventar === "deko-fernfeld") {
                        const a = artVon(o);
                        z.fern[a] = (z.fern[a] || 0) + 1;
                    }
                });
                // BAU: die platzierten Gruppen (nicht Streu) mit lebenden Instanzen — Draws im Hauptbild bzw. in
                // jeder Kaskade (castShadow); die Glut-Gruppen getrennt.
                z.bau = { gruppen: 0, werfer: 0, glut: 0, glutWerfer: 0 };
                if (s.archInstanceGroups)
                    for (const [k, g] of s.archInstanceGroups) {
                        if (String(k).includes("@p:")) z.pGruppen.push(k);
                        if (String(k).startsWith("fscatter:") || !g.mesh || !(g.mesh.count > 0)) continue;
                        if (String(k).includes("@") && !String(k).includes("@p:")) continue; // Streu-Regionen
                        z.bau.gruppen++;
                        if (g.mesh.castShadow) z.bau.werfer++;
                        // die Glut: Lichtquellen-Stoffe (emissiv — das Glutbett der Feuerstelle, das Herdfeuer)
                        const em = g.mesh.material && g.mesh.material.emissive;
                        if (em && (em.r || em.g || em.b)) {
                            z.bau.glut++;
                            if (g.mesh.castShadow) z.bau.glutWerfer++;
                        }
                    }
                if (s._regionBundles)
                    for (const k of s._regionBundles.keys()) if (String(k).startsWith("p:")) z.pBundles.push(k);
                // (n) DER EINE SATZ-STOFF: die Klasse jedes Bau-Satzes = sein Stoff ohne die Regler, die je Ecke reisen
                z.satzStoff = { saetze: 0, zwillinge: [], ohneRegler: [], untreu: [] };
                {
                    const klassen = new Map();
                    if (s.chunkSaetze)
                        for (const [art, satz] of s.chunkSaetze) {
                            if (!satz.spec.userData?.bauSatz || satz.spec.nurWurf) continue;
                            const u = satz.spec.mat.userData || {};
                            const mp = Object.assign({}, u.foundryMp || {});
                            const durch = typeof mp.opacity === "number" && mp.opacity < 1;
                            for (const k of ["roughness", "metalness", "emissive", "emissiveIntensity", "opacity"])
                                delete mp[k];
                            const kl =
                                satz.spec.name +
                                "|" +
                                window.__phytoCore.budgetStoff(u.foundryKind, mp) +
                                (durch ? "|durch" : "") +
                                (satz.spec.schatten ? "|w" : "|-");
                            z.satzStoff.saetze++;
                            if (!klassen.has(kl)) klassen.set(kl, []);
                            klassen.get(kl).push(art);
                            if (!satz.geom.attributes.aRegler || !satz.geom.attributes.aGlut)
                                z.satzStoff.ohneRegler.push(art.slice(0, 60));
                        }
                    for (const [kl, arts] of klassen)
                        if (arts.length > 1) z.satzStoff.zwillinge.push(kl + " ×" + arts.length);
                }
                // (h) DER BAU-SATZ: jede lebende Gruppe einer Satz-Art (Rezept-kind in BAU_SATZ, gesetzt, kein
                // Tür-Flügel) zeichnet nie selbst und trägt ihren Bereich treu im Satz ihres Stoffs.
                z.bauSatz = { gruppen: 0, imSatz: 0, selbst: [], ohneBereich: [] };
                const buch = r._foundry?.recipes ? r._foundry.recipes : {};
                const SATZ = r.constructor.BAU_SATZ || {};
                if (s.archInstanceGroups)
                    for (const [k, g] of s.archInstanceGroups) {
                        const m = /^f:([^|]+)\|/.exec(String(k));
                        if (!m || String(k).includes("@") || g.tuer || !(g.liveCount > 0)) continue;
                        const rec = buch[m[1]];
                        if (!rec || !SATZ[rec.kind]) continue;
                        z.bauSatz.gruppen++;
                        const name = r._taeterKlasse(g.mesh) + " (" + String(k).slice(0, 40) + ")";
                        if (!g.satz || g.mesh.parent) {
                            z.bauSatz.selbst.push(name);
                            continue;
                        }
                        const satz = s.chunkSaetze ? s.chunkSaetze.get(g.satz) : null;
                        const b = satz ? satz.bloecke.get(k) : null;
                        const n = g.geom.attributes.position.count;
                        // der Schatten-Zwilling einer Satz-Art (die NUR-WURF-Stufe 3, S3 haus) lebt im Wurf-Satz `bauWurf`
                        // seines Stoffs (`_bauSatzArt`), jede gezeigte Gruppe im Satz ihrer Art
                        const satzName = g.shadowTwin ? "bauWurf" : SATZ[rec.kind];
                        let treu = !!b && b.vAnzahl === n * g.liveCount && satz.mesh.name === satzName;
                        if (treu) {
                            // die erste Instanz, erster Vertex: Geometrie × Instanz-Matrix, in Welt-Lage im Pool
                            const e = g.mesh.instanceMatrix.array;
                            const q = g.geom.attributes.position.array;
                            const w = satz.geom.attributes.position.array;
                            const o = b.vStart * 3;
                            const soll = [
                                e[0] * q[0] + e[4] * q[1] + e[8] * q[2] + e[12],
                                e[1] * q[0] + e[5] * q[1] + e[9] * q[2] + e[13],
                                e[2] * q[0] + e[6] * q[1] + e[10] * q[2] + e[14],
                            ];
                            for (let c = 0; c < 3; c++) if (Math.abs(w[o + c] - soll[c]) > 1e-3) treu = false;
                        }
                        if (treu) z.bauSatz.imSatz++;
                        else z.bauSatz.ohneBereich.push(name);
                        // (n) die erste Ecke trägt die Regler des Studio-Stoffs der Gruppe (snorm8: 1/127)
                        const ar = treu && !g.shadowTwin ? satz.geom.attributes.aRegler : null;
                        if (ar) {
                            const u = g.mesh.material.userData || {};
                            const R = window.__phytoCore.budgetRegler(u.foundryKind, u.foundryMp || null);
                            const a = ar.array,
                                o = b.vStart * 4;
                            const ist = [a[o] / 127, a[o + 1] / 127, a[o + 2] / 127];
                            const soll = [R.r, R.mt, R.op];
                            if (ist.some((x, c) => Math.abs(x - soll[c]) > 0.005))
                                z.satzStoff.untreu.push(
                                    `${name}: ${ist.map((x) => x.toFixed(2)).join("/")} statt ${soll.map((x) => x.toFixed(2)).join("/")}`
                                );
                        }
                    }
                // (c) DER STREU-SATZ: jeder Block mit Pflanzen lebt als Bereich im Satz seines Stoffs — n × Vertices der
                // Gestalt, die erste Pflanze, erster Vertex: Geometrie × Matrix, in Welt-Lage im Pool; je Stoff EIN Satz.
                z.streuSatz = { bloecke: 0, imSatz: 0, ohneBereich: [], doppelt: [] };
                const stoffe = new Map();
                if (s.chunkSaetze)
                    for (const [art, satz] of s.chunkSaetze)
                        if (satz.spec.userData.streuSatz) {
                            const u = satz.spec.mat.uuid;
                            stoffe.set(u, (stoffe.get(u) || 0) + 1);
                            if (stoffe.get(u) === 2) z.streuSatz.doppelt.push(art);
                        }
                if (s.nahStreu)
                    for (const a of s.nahStreu.senken.values())
                        for (const [kk, b] of a.bloecke) {
                            if (!(b.n > 0)) continue;
                            z.streuSatz.bloecke++;
                            const satz = s.chunkSaetze ? s.chunkSaetze.get(a.satz) : null;
                            const bb = satz ? satz.bloecke.get(a.key + "@" + kk) : null;
                            const n = a.geo.attributes.position.count;
                            let treu = !!bb && bb.vAnzahl === n * b.n && satz.spec.mat === a.mat;
                            if (treu) {
                                const e = b.matrizen;
                                const q = a.geo.attributes.position.array;
                                const w = satz.geom.attributes.position.array;
                                const o = bb.vStart * 3;
                                const soll = [
                                    e[0] * q[0] + e[4] * q[1] + e[8] * q[2] + e[12],
                                    e[1] * q[0] + e[5] * q[1] + e[9] * q[2] + e[13],
                                    e[2] * q[0] + e[6] * q[1] + e[10] * q[2] + e[14],
                                ];
                                for (let c = 0; c < 3; c++) if (Math.abs(w[o + c] - soll[c]) > 1e-3) treu = false;
                            }
                            if (treu) z.streuSatz.imSatz++;
                            else z.streuSatz.ohneBereich.push(a.key + "@" + kk);
                        }
                z.boden.tris = Math.round(z.boden.tris);
                z.wasser.tris = Math.round(z.wasser.tris);
                // (m) DIE VERTEX-FORM des Boden-Satzes: je Attribut die Form, die die GPU bekommt (Typ × Breite, normiert)
                // und seine Bytes im Satz — die Wand liest das Array, nie die Deklaration
                z.vertexForm = [];
                const bs = s.chunkSaetze ? s.chunkSaetze.get("boden") : null;
                if (bs)
                    for (const [name, a] of Object.entries(bs.geom.attributes)) {
                        const typ = a.array.constructor.name.replace("Array", "").toLowerCase();
                        z.vertexForm.push({
                            satz: bs.spec.name,
                            attr: name,
                            form: (a.normalized ? "n" : "") + typ + "x" + a.itemSize,
                            bytes: a.array.BYTES_PER_ELEMENT * a.itemSize,
                            mb: +(a.array.byteLength / 1048576).toFixed(2),
                        });
                    }
                // (n) DIE BODEN-STUFEN: je gebautem Chunk sein Ring um den Spieler-Chunk, seine Stufe und seine
                // Dreiecke; je Naht-Band die Brücken (rohe Kante → grobe Fläche), deren beide Enden der Morph ganz trägt
                // (Gewicht 1) — die Wand liest die Netze, nie die Tabelle
                const BS = r.constructor.BODEN_STUFEN;
                z.stufen = {
                    tabelle: { vorlauf: BS.vorlauf, halt: BS.halt, stufen: BS.stufen.map((x) => ({ ...x })) },
                    chunks: [],
                    jeStufe: {},
                    naht: 0,
                    bruecken: 0,
                    ohneNot: [],
                    ohneSatz: [],
                };
                const lpc = s.lastPlayerVoxelChunk;
                const auge = s.stufeAuge;
                const S0 = r._voxelChunkConfig(0).span;
                if (lpc && auge)
                    for (const [key, e] of s.voxelChunks) {
                        if (!e || e.empty || !e.mesh) continue;
                        const [cx, cz] = key.split(",").map(Number);
                        const ring = Math.max(Math.abs(cx - lpc.cx), Math.abs(cz - lpc.cz));
                        const lod = Number.isFinite(e.lod) ? e.lod : 0;
                        const g = e.mesh.geometry;
                        const n = g.index ? g.index.count / 3 : 0;
                        const d = Math.max(
                            Math.max(cx * S0 - auge.x, 0, auge.x - (cx + 1) * S0),
                            Math.max(cz * S0 - auge.z, 0, auge.z - (cz + 1) * S0)
                        );
                        z.stufen.chunks.push({ key, ring, d, lod, dreiecke: n });
                        z.stufen.jeStufe["L" + lod] = (z.stufen.jeStufe["L" + lod] || 0) + n;
                        const st = e.lodStitchMesh ? e.lodStitchMesh.geometry : null;
                        if (!st) continue;
                        z.stufen.naht += st.index.count / 3;
                        const bs = s.chunkSaetze && s.chunkSaetze.get("boden");
                        if (!bs?.bloecke.has("stitch:" + key)) z.stufen.ohneSatz.push(key);
                        // die rohe Lage jedes Chunk-Vertex → sein Morph-Gewicht
                        const P = g.attributes.position.array,
                            W = g.attributes.aMorphWeight.array;
                        const gewicht = new Map();
                        for (let v = 0; v < W.length; v++)
                            gewicht.set(P[v * 3] + "," + P[v * 3 + 1] + "," + P[v * 3 + 2], r._morphNaht(W[v]));
                        const Q = st.attributes.position.array;
                        let ohneNot = 0;
                        for (let q = 0; q + 11 < Q.length; q += 12) {
                            const wa = gewicht.get(Q[q] + "," + Q[q + 1] + "," + Q[q + 2]);
                            const wb = gewicht.get(Q[q + 3] + "," + Q[q + 4] + "," + Q[q + 5]);
                            if (wa === undefined || wb === undefined) continue; // ein Skirt (er hängt am Ziel)
                            z.stufen.bruecken++;
                            if (wa >= 1 && wb >= 1) ohneNot++;
                        }
                        if (ohneNot) z.stufen.ohneNot.push({ key: "stitch:" + key, n: ohneNot });
                    }
                return z;
            };
            // der Haken des Renders (Hauptbild): der Satz legt seinen Abschnitt — der Zensus zählt, was das Hauptbild zeichnet
            r._passSicht(s.camera, false);
            r._passSicht(s.camera, true);
            res.zensus = zensus();
            let chunks = 0;
            for (const e of s.voxelChunks.values()) if (e && !e.empty && e.mesh) chunks++;
            res.chunks = chunks;

            // ── (c) DIE SENKEN DER NAH-STREU: je Senke Σ n der Blöcke = Anzahl, je Block die Ernte-Identitäten (n) und n × 16
            // Matrix-Werte, jeder Block gehört einer lebenden Kachel des Rings, die ihn kennt.
            res.streu = { arten: 0, bloecke: 0, dicht: true, fehler: [] };
            const ns = s.nahStreu;
            if (ns)
                for (const [name, a] of ns.senken) {
                    res.streu.arten++;
                    let summe = 0;
                    for (const [kk, b] of a.bloecke) {
                        const k = ns.kacheln.get(kk);
                        if (b.ids.length !== b.n || b.matrizen.length !== b.n * 16 || !k || !k.senken.has(name)) {
                            res.streu.dicht = false;
                            if (res.streu.fehler.length < 4) res.streu.fehler.push(name + "@" + kk);
                        }
                        summe += b.n;
                        res.streu.bloecke++;
                    }
                    if (summe !== a.anzahl || a.mesh !== undefined) {
                        res.streu.dicht = false;
                        if (res.streu.fehler.length < 4) res.streu.fehler.push(`${name}: ${summe}/${a.anzahl}`);
                    }
                }

            // ── (f) TREUE je Satz: jeder Bereich trägt die Arrays seines Chunks byte-gleich (Views); sein Index (um den
            // Bereichs-Anfang verschoben) trägt genau die Dreiecke des Chunks, als Viertel-Läufe hintereinander (die
            // Viertel decken ihn lückenlos); jeder Abschnitt eines Passes (hier: das Hauptbild, wie der Haken des Renders
            // ihn legt) trägt seine Viertel byte-gleich hintereinander und in der Richtung der Art (Boden nah → fern,
            // Wasser fern → nah).
            const lpc = s.lastPlayerVoxelChunk;
            // die Dreiecke als Multimenge (ordnungsfrei): Summe und XOR eines Hashes je Dreieck
            const mengeVon = (arr, plus) => {
                let summe = 0,
                    xor = 0;
                for (let i = 0; i + 2 < arr.length; i += 3) {
                    const h =
                        (Math.imul(arr[i] + plus, 73856093) ^
                            Math.imul(arr[i + 1] + plus, 19349663) ^
                            Math.imul(arr[i + 2] + plus, 83492791)) >>>
                        0;
                    summe = (summe + h) >>> 0;
                    xor = (xor ^ h) >>> 0;
                }
                return summe + ":" + xor;
            };
            // DIE ABSCHNITTE eines Satzes: jeder Lauf [start, start + ende) zeichnet GENAU die Dreiecke seiner Zellen (als
            // Multimenge: jedes Dreieck mit seiner Windung, Hash-Summe und -XOR) und sonst nur entartete Lücken (drei gleiche
            // Ecken); ein dichter Lauf trägt seine Zellen in der Richtung der Art; jeder in seiner Kapazität, keiner überlappt
            // einen anderen; das Hauptbild liegt bei 0 (ein Umlegen mitten im Frame lässt den Lauf unberührt, den der
            // aufgezeichnete Befehl des Haupt-Passes liest).
            const dreieckH = (a, b, c) =>
                (Math.imul(a, 73856093) ^ Math.imul(b, 19349663) ^ Math.imul(c, 83492791)) >>> 0;
            const laufTreu = (idx, start, ende, zellen) => {
                let sGez = 0,
                    xGez = 0,
                    nGez = 0,
                    sSoll = 0,
                    xSoll = 0,
                    nSoll = 0;
                for (let i = start; i + 2 < start + ende; i += 3) {
                    const a = idx[i],
                        b = idx[i + 1],
                        c = idx[i + 2];
                    if (a === b && b === c) continue; // die entartete Lücke
                    const h = dreieckH(a, b, c);
                    sGez = (sGez + h) >>> 0;
                    xGez = (xGez ^ h) >>> 0;
                    nGez++;
                }
                for (const z of zellen)
                    for (let i = 0; i + 2 < z.idx.length; i += 3) {
                        const a = z.idx[i],
                            b = z.idx[i + 1],
                            c = z.idx[i + 2];
                        if (a === b && b === c) continue;
                        const h = dreieckH(a, b, c);
                        sSoll = (sSoll + h) >>> 0;
                        xSoll = (xSoll ^ h) >>> 0;
                        nSoll++;
                    }
                return nGez === nSoll && sGez === sSoll && xGez === xSoll;
            };
            const abschnitteVon = (satz) => {
                const idx = satz.geom.index.array;
                const o = {
                    treu: true,
                    ordnung: true,
                    hauptN: null,
                    hauptBei0: true,
                    ueberlapp: false,
                    n: 0,
                    luecken: 0,
                };
                const laeufe = [];
                for (const [key, a] of satz.abschnitte) {
                    let n = 0,
                        letzte = null;
                    for (const z of a.liste) {
                        n += z.idx.length;
                        if (lpc && a.dicht) {
                            const b = z.bereich;
                            const d = Math.max(Math.abs(b.cx - lpc.cx), Math.abs(b.cz - lpc.cz));
                            if (letzte !== null && (d - letzte) * satz.spec.richtung < 0) o.ordnung = false;
                            letzte = d;
                        }
                    }
                    if (!laufTreu(idx, a.start, a.ende, a.liste)) o.treu = false;
                    if (
                        n !== a.n ||
                        a.n > a.ende ||
                        a.ende > a.kap ||
                        a.start + a.kap > satz.iEnde ||
                        satz.iEnde > satz.iKap
                    )
                        o.treu = false;
                    if (key === "haupt") {
                        o.hauptN = a.n;
                        if (a.start !== 0) o.hauptBei0 = false;
                    }
                    if (a.kap > 0) laeufe.push([a.start, a.start + a.kap]);
                    o.luecken += a.ende - a.n;
                    o.n++;
                }
                laeufe.sort((x, y) => x[0] - y[0]);
                for (let i = 1; i < laeufe.length; i++) if (laeufe[i][0] < laeufe[i - 1][1]) o.ueberlapp = true;
                return o;
            };
            // EIN BEREICH TREU im Satz: seine Views zeigen byte-gleich in die Satz-Arrays an seiner Lage, sein Index ist der
            // Chunk-Index um den Bereichs-Anfang verschoben (als Multimenge), die Viertel liegen als Läufe hintereinander und
            // decken ihn lückenlos — (f) für jeden Bereich jedes Satzes, (k) nach dem Verdichten.
            const bereichTreu = (satz, b) => {
                const geo = satz.mesh.geometry;
                if (satz.bloecke.get(b.key) !== b) return false;
                // ein FLÜCHTIGER Block (K69, `_satzBlock`) hält seine Werte nicht: die Linse rechnet ihn aus seiner Quelle
                // nach (Geometrie × Instanz-Matrizen, dieselbe Rechnung) — gepackte Werte und Index gegen den Satz
                const fl = b.geom.fluechtig === true;
                if (fl && (b.geom.index !== null || !Array.isArray(b.geom.quelle))) return false;
                const nach = fl ? r._satzBlock(...b.geom.quelle) : null;
                const g = fl
                    ? {
                          attributes: Object.fromEntries(
                              Object.entries(b.geom.attributes).map(([k, a]) => [
                                  k,
                                  a.array === null ? nach.attributes[k] : a,
                              ])
                          ),
                          index: nach.index,
                      }
                    : b.geom;
                if (fl)
                    for (const fa of satz.attr || [])
                        if (fa.form && b.geom.attributes[fa.name].array !== null) return false;
                // ein Satz ohne Formen-Liste (vor K44) trägt jedes Attribut als View
                for (const fa of satz.attr || satz.attrNamen.map((name) => ({ name, form: null }))) {
                    const a = fa.name;
                    const src = g.attributes[a].array;
                    const dst = geo.attributes[a].array;
                    const is = geo.attributes[a].itemSize;
                    if (fa.form) {
                        // gepackt: der Chunk trägt sein Float32-Array, der Satz genau dessen Packung (`_satzPacke`)
                        if (src.length !== b.vAnzahl * fa.is || src.buffer === dst.buffer || is !== 4) return false;
                        const soll = new dst.constructor(b.vAnzahl * 4);
                        r.constructor._satzPacke(
                            fa.form,
                            src,
                            fa.is,
                            soll,
                            0,
                            b.vAnzahl,
                            fa.w ? g.attributes[fa.w].array : undefined
                        );
                        for (let i = 0; i < soll.length; i += 97) if (soll[i] !== dst[b.vStart * 4 + i]) return false;
                        continue;
                    }
                    if (src.length !== b.vAnzahl * is || src.buffer !== dst.buffer) return false;
                    for (let i = 0; i < src.length; i += 97) if (src[i] !== dst[b.vStart * is + i]) return false;
                }
                const li = g.index.array;
                if (li.length !== b.iAnzahl || b.idx.length !== b.iAnzahl) return false;
                if (mengeVon(li, b.vStart) !== mengeVon(b.idx, 0)) return false;
                let o = 0;
                for (const z of b.zellen) {
                    if (z.bereich !== b || z.idx.buffer !== b.idx.buffer || z.idx.byteOffset !== o * 4) return false;
                    o += z.idx.length;
                }
                return o === b.iAnzahl;
            };
            res.saetze = [];
            if (s.chunkSaetze)
                for (const [art, satz] of s.chunkSaetze) {
                    let treu = satz.geom === satz.mesh.geometry,
                        geprueft = 0;
                    for (const b of satz.ordnung) {
                        treu = treu && bereichTreu(satz, b);
                        geprueft++;
                        if (!treu) break;
                    }
                    const ab = abschnitteVon(satz);
                    res.saetze.push({
                        art,
                        treu,
                        geprueft,
                        ordnung: ab.ordnung,
                        abschnittTreu: ab.treu && ab.hauptBei0 && !ab.ueberlapp,
                        bereiche: satz.bloecke.size,
                        vEnde: satz.vEnde,
                        vKap: satz.vKap,
                        index: satz.iSumme,
                        haupt: ab.hauptN,
                        iEnde: satz.iEnde,
                        iKap: satz.iKap,
                        wachse: satz.wachse,
                    });
                }
            // ── (e) KONSUM: ein trockener Chunk (nicht der Spieler-Chunk) fällt und kehrt zurück.
            const satz = s.chunkSaetze ? s.chunkSaetze.get("boden") : null;
            res.satzDa = !!satz;
            if (satz) {
                let opfer = null;
                for (const [key, e] of s.voxelChunks) {
                    if (!e || e.empty || !e.mesh || e.waterCells) continue;
                    if (lpc && key === `${lpc.cx},${lpc.cz}`) continue;
                    opfer = { key, lod: e.lod };
                    break;
                }
                if (opfer) {
                    const [cx, cz] = opfer.key.split(",").map(Number);
                    const stand = () => ({
                        kinder: s.scene.children.length,
                        bereiche: satz.bloecke.size,
                        index: satz.iSumme,
                    });
                    const vor = stand();
                    r._disposeVoxelChunk(opfer.key);
                    r._tickChunkSatz();
                    const ab = stand();
                    r._rebuildVoxelChunk(cx, cz, opfer.lod, { forceSync: true });
                    r._tickChunkSatz();
                    const auf = stand();
                    res.konsum = { opfer: opfer.key, vor, ab, auf };
                }
            }
            // (i) WACHSEN: ein Satz, der wächst, tauscht die Geometrie am SELBEN Mesh — r184 hängt den
            // Entsorgungs-Hörer einer Geometrie an ihr erstes Render-Objekt und liest dessen Attribute erst beim Entsorgen;
            // eine getauschte Geometrie verlor so ihre GPU-Puffer (echte GPU: „Vertex buffer slot 5 … was not set"). Die
            // Wurzel: `_renderObjektRegister` nimmt den Hörer je Geometrie heraus (der Kehraus trägt die Residenz). Probe
            // am kleinsten Satz des Rings (der Tausch ist EIN Weg für jeden Satz; am Mess-Ort der K16-Landform steht kein
            // Wasser im Ring — die Probe hing an einem 12-Vertex-Wasserfleck der alten Welt): doppelte Kapazität, derselbe
            // Inhalt, derselbe Mesh.
            res.wachsen = null;
            let ws = null;
            let wsName = null;
            for (const [name, sa] of s.chunkSaetze ? s.chunkSaetze : [])
                if (sa?.mesh && sa.bloecke && sa.bloecke.size > 0 && (!ws || sa.vKap < ws.vKap))
                    ((ws = sa), (wsName = String(name).split("|")[0]));
            if (ws) {
                const altMesh = ws.mesh,
                    altGeom = ws.geom,
                    altIdx = ws.iSumme,
                    altBereiche = ws.bloecke.size;
                r._chunkSatzGeometrie(ws, ws.vKap * 2, ws.iKap);
                r._tickChunkSatz();
                const ab = abschnitteVon(ws);
                res.wachsen = {
                    satz: wsName,
                    derselbe: ws.mesh === altMesh && ws.mesh.parent === s.scene,
                    getauscht: ws.geom !== altGeom && ws.mesh.geometry === ws.geom,
                    inhalt: ws.iSumme === altIdx && ws.bloecke.size === altBereiche && ab.treu && !ab.ueberlapp,
                };
            }
            // der Hörer fällt im Register: ein Stub-Renderer in der r184-Form (gate:vendor-anker) —
            // die neue Geometrie behält keinen Entsorgungs-Hörer, der beim Tausch ihre GPU-Puffer mitnähme
            {
                const h = () => {};
                const geos = { _geometryDisposeListeners: new Map(), info: { memory: { geometries: 1 } } };
                geos.initGeometry = (ro) => (ro.geometry.addEventListener("dispose", h), geos._geometryDisposeListeners.set(ro.geometry, h));
                r._renderObjektRegister({ _objects: Object.create({ createRenderObject: () => null }), _geometries: geos });
                const g = new window.THREE.BufferGeometry();
                geos.initGeometry({ geometry: g });
                res.tauschSicher = !geos._geometryDisposeListeners.has(g) && !g.hasEventListener("dispose", h);
            }
            // (j) NEUSCHREIBEN: kein Pass schreibt in Ruhe, und ein Index, der für Hauptbild + Kaskaden zu klein
            // ist, wächst EINMAL, statt dass die Kaskaden einander je Frame verdrängen. Die Kaskaden-Pässe fahren den EINEN
            // Chokepoint `_chunkSatzPass` mit Stellvertreter-Ortho-Kameras über dem Spieler: „ruhe" = enge Boxen
            // (k0 ±120 m, k1 ±400 m), „druck" = beide über den ganzen Ring (der Abend mit der Sonne im Rücken trägt fast den
            // Ring); gemessen je Frame die Bytes der Neuschreib-Linse aller Sätze (`s.schreiben`). Der Selbsttest „alt" fährt
            // die alte Regel (reicht der Index nicht, verdrängt der Umzug jeden anderen Abschnitt außer dem Hauptbild) mit
            // drei Ring-Kaskaden — sie muss je Frame neu schreiben.
            const T = window.THREE;
            const ppos = s.playerMesh.position;
            // Die Stellvertreter sind Ortho-Kameras (keine Kaskaden-Kameras: ihre Lage trägt keine Scheibe — das Gesetz der
            // Pass-Wahl urteilt nach ihrem Frustum allein).
            const ortho = (halb) => {
                const c = new T.OrthographicCamera(-halb, halb, halb, -halb, 0, 1600);
                c.position.set(ppos.x, ppos.y + 800, ppos.z + 1);
                c.lookAt(ppos.x, ppos.y, ppos.z);
                c.updateMatrixWorld(true);
                return c;
            };
            const S = r._kaskadenSchmier();
            // je Stellvertreter dieselbe Lage wie in `_passSicht`: die Matrix der Pass-Kamera (die Höhlen-Sicht, Welle 7,
            // liest `S.m` und die Drehung der Kamera), ihr Frustum und die Lage des Gesetzes
            const frame = (kameras) => {
                r._tickChunkSatz();
                r._passSicht(s.camera, false);
                kameras.forEach((c, i) => {
                    S.m.multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse);
                    S.frustum.setFromProjectionMatrix(S.m, c.coordinateSystem);
                    r._passWahlLage(S, c, i);
                    r._chunkSatzPass(c, false, i, S);
                    r._chunkSatzPass(c, true, -1, S);
                });
                r._passSicht(s.camera, true);
            };
            const stand = () => {
                const o = {};
                for (const satz of s.chunkSaetze.values())
                    for (const [k, b] of Object.entries(satz.schreiben)) {
                        const name = satz.spec.name + "|" + k; // die Bau-Sätze je Name (die Art trägt den Stoff)
                        o[name] = (o[name] || 0) + b;
                    }
                return o;
            };
            const phase = (frusta, n) => {
                const aus = [];
                let vor = stand();
                for (let i = 0; i < n; i++) {
                    frame(frusta);
                    const jetzt = stand();
                    const d = {};
                    for (const [k, b] of Object.entries(jetzt)) if (b - (vor[k] || 0) > 0) d[k] = b - (vor[k] || 0);
                    aus.push(d);
                    vor = jetzt;
                }
                return aus;
            };
            const wachseSumme = () => [...s.chunkSaetze.values()].reduce((a, x) => a + x.wachse, 0);
            const eng = [ortho(120), ortho(400)],
                ring = ortho(4000);
            res.neu = { messung: {}, wachse: {} };
            res.neu.messung.ruhe = phase(eng, 5);
            // der Druck braucht die volle Last: seit der Höhlen-Sicht tragen die Ring-Kaskaden nur, was ein Empfänger
            // braucht, und der Index reichte — am Exemplar zeichnet hier jede Höhlen-Zelle (die Methode des Stamms bleibt)
            r._hoehlenSicht = function (satz) {
                const st = ++satz.hoehle.stempel;
                for (const b of satz.bloecke.values()) if (b.hoehle) for (const kn of b.hoehle.knoten) kn.sicht = st;
            };
            // die Kapazität ERZWUNGEN klein: der Index des Boden-Satzes trägt genau die liegenden Abschnitte — zwei
            // Ring-Kaskaden brauchen mehr, gleich wie gross der Ring gerade ist (der Druck hing am Inhalt: mit den Boden-Stufen
            // reichte der Start-Index für beide Ring-Kaskaden, 0× gewachsen)
            const bodenS = s.chunkSaetze.get("boden");
            if (bodenS) r._chunkSatzGeometrie(bodenS, bodenS.vKap, bodenS.iEnde);
            let w0 = wachseSumme();
            try {
                res.neu.messung.druck = phase([ring, ring], 5);
            } finally {
                delete r._hoehlenSicht;
            }
            res.neu.wachse.druck = wachseSumme() - w0;
            res.neu.boden = (() => {
                const b = s.chunkSaetze.get("boden");
                const o = {};
                for (const [k, a] of b.abschnitte) o[k] = a.n;
                return { abschnitte: o, iKap: b.iKap, iSumme: b.iSumme };
            })();
            res.neu.treu = [...s.chunkSaetze.values()].every((x) => {
                const ab = abschnitteVon(x);
                return ab.treu && ab.hauptBei0 && !ab.ueberlapp;
            });
            // DREHEN (36 × 1°): das Hauptbild dreht sich, die Kaskaden-Boxen laufen vor dem Blick mit — jeder Pass ändert
            // seine Wahl je Frame. Gemessen: die Bytes gegen die Änderung (die Indizes der Zellen, die kommen oder gehen,
            // × 4 B) und die Treue jedes Abschnitts nach jedem Frame; „alt" fährt dieselbe Drehung mit der alten Regel (dicht
            // ab dem ersten Unterschied neu) — vorher schrieb jeder Pass beim Drehen 0,5–0,7 MB je Frame (Mess-Wiese).
            const vorne = (halb, yaw) => {
                const c = new T.OrthographicCamera(-halb, halb, halb, -halb, 0, 1600);
                const cx = ppos.x + Math.sin(yaw) * halb * 0.5,
                    cz = ppos.z + Math.cos(yaw) * halb * 0.5;
                c.position.set(cx, ppos.y + 800, cz + 1);
                c.lookAt(cx, ppos.y, cz);
                c.updateMatrixWorld(true);
                return c;
            };
            const wahlStand = () => {
                const m = new Map();
                for (const satz of s.chunkSaetze.values())
                    for (const [k, a] of satz.abschnitte) m.set(satz.art + "|" + k, new Set(a.liste));
                return m;
            };
            const drehen = (n) => {
                const cam = s.camera;
                const p0 = cam.position.clone(),
                    q0 = cam.quaternion.clone();
                const blick = (yaw) => {
                    cam.position.set(ppos.x, ppos.y + 1.7, ppos.z);
                    cam.lookAt(ppos.x + Math.sin(yaw) * 100, ppos.y + 1.7, ppos.z + Math.cos(yaw) * 100);
                    cam.updateMatrixWorld(true);
                    frame([vorne(120, yaw), vorne(400, yaw)]);
                };
                blick(0);
                blick(0);
                const o = { frames: n, bytes: 0, aenderung: 0, untreu: 0 };
                let vor = stand(),
                    wahlVor = wahlStand();
                for (let i = 1; i <= n; i++) {
                    blick((i * Math.PI) / 180);
                    const jetzt = stand();
                    for (const [k, b] of Object.entries(jetzt)) o.bytes += b - (vor[k] || 0);
                    vor = jetzt;
                    const wahl = wahlStand();
                    for (const [k, menge] of wahl) {
                        const alt = wahlVor.get(k) || new Set();
                        for (const z of menge) if (!alt.has(z)) o.aenderung += z.idx.length * 4;
                        for (const z of alt) if (!menge.has(z)) o.aenderung += z.idx.length * 4;
                    }
                    wahlVor = wahl;
                    for (const satz of s.chunkSaetze.values()) {
                        const ab = abschnitteVon(satz);
                        if (!ab.treu || ab.ueberlapp || !ab.hauptBei0) o.untreu++;
                    }
                }
                cam.position.copy(p0);
                cam.quaternion.copy(q0);
                cam.updateMatrixWorld(true);
                return o;
            };
            // EINE Vor-Drehung ohne Wertung: die erste Drehung trägt das Wachsen der Abschnitte (ihr Hochwasser, das
            // Umlegen), das die alte Regel danach geschenkt bekam — beide Regeln messen aus demselben gewachsenen Stand
            // (5 MB Umlegen, im zweiten 0)
            drehen(36);
            res.neu.dreh = drehen(36);
            const P = Object.getPrototypeOf(r);
            r._chunkSatzTausch = function (satz, a, liste, n, wer) {
                return P._chunkSatzDicht.call(this, satz, a, liste, n, wer, true);
            };
            try {
                res.neu.drehAlt = drehen(36);
            } finally {
                delete r._chunkSatzTausch;
            }
            // der Selbsttest: die alte Verdrängung (am Exemplar, die Methode des Stamms bleibt), drei Ring-Kaskaden
            r._chunkSatzUmlegen = function (satz, neu, kapNeu, wer) {
                const h = satz.abschnitte.get("haupt");
                let summe = 0;
                for (const a of satz.abschnitte.values()) summe += a === neu ? kapNeu : this._chunkSatzKap(a.n);
                if (summe > satz.iKap)
                    for (const a of satz.abschnitte.values())
                        if (a !== h && a !== neu) {
                            this._chunkSatzLeer(a);
                            a.kap = 0;
                            a.start = 0;
                        }
                return P._chunkSatzUmlegen.call(this, satz, neu, kapNeu, wer);
            };
            try {
                res.neu.alt = phase([ring, ring, ring], 4);
            } finally {
                delete r._chunkSatzUmlegen;
            }
            phase(eng, 2);
            // (k) DER SATZ FOLGT SEINEM INHALT (W7; der leere Satz der W6-Integration ist sein Fall „Inhalt 0"): trägt
            // die Kapazität eines Satzes `ruheTakte` Takte lang mehr als `schwelle` × Ziel, schrumpft er auf Inhalt ×
            // `luft` — am SELBEN Mesh, die Bereiche dicht nach vorn, jeder treu, jeder Abschnitt im nächsten Pass neu
            // gelegt und treu. Zwei Proben: LEER (ein eigener Bau-Satz des Gates, gewachsen, ohne Bereich → vMin/iMin)
            // und BELEGT (der Boden-Satz: die drei vordersten Bereiche treten aus — Löcher —, der Satz wächst ×3, nach
            // der Frist dicht auf Inhalt × luft). Der Selbsttest fährt BELEGT mit der alten Regel (nur ein leerer Satz
            // kehrt zurück): er hält sein Hochwasser.
            const VD = r.constructor.CHUNK_SATZ_VERDICHTEN;
            const RT = r.constructor.CHUNK_SATZ_ABSCHNITT.ruheTakte;
            const ruhe = (n) => {
                for (let i = 0; i < n; i++) r._tickChunkSatz();
            };
            res.leer = null;
            {
                const art = "gate:leer|probe|-";
                (s.satzStoffe || (s.satzStoffe = new Map())).set(art, {
                    name: "gateLeerSatz",
                    mat: new T.MeshBasicMaterial(),
                    wurf: false,
                });
                const ls = r._chunkSatz(art);
                const C = r.constructor.CHUNK_SATZ.bau;
                r._chunkSatzGeometrie(ls, C.v * 4, C.i * 4);
                const mesh0 = ls.mesh,
                    gross = [ls.vKap, ls.iKap];
                ruhe(RT);
                const vorFrist = [ls.vKap, ls.iKap];
                ruhe(2);
                res.leer = {
                    gross,
                    vorFrist,
                    nach: [ls.vKap, ls.iKap],
                    ziel: [VD.vMin, VD.iMin],
                    derselbe: ls.mesh === mesh0 && ls.mesh.geometry === ls.geom,
                };
                s.scene.remove(ls.mesh);
                s.chunkSaetze.delete(art);
                s.satzStoffe.delete(art);
            }
            const belegt = (alteRegel) => {
                const bs = s.chunkSaetze.get("boden");
                if (!bs) return null;
                ruhe(RT + 2); // was frühere Phasen anstießen, liegt
                const raus = [...bs.bloecke.values()]
                    .sort((x, y) => x.vStart - y.vStart)
                    .slice(0, 3)
                    .map((b) => ({ key: b.key, geom: b.geom, chunkKey: b.chunkKey }));
                for (const x of raus) r._chunkSatzAus("boden", x.key);
                r._chunkSatzGeometrie(bs, bs.vKap * 3, bs.iKap * 2);
                const mesh0 = bs.mesh;
                let inhalt = 0;
                for (const b of bs.bloecke.values()) inhalt += b.vAnzahl;
                const gross = [bs.vKap, bs.iKap, bs.vEnde];
                if (alteRegel)
                    r._chunkSatzVerdichten = function (satz) {
                        return satz.bloecke.size === 0 ? P._chunkSatzVerdichten.call(this, satz) : false;
                    };
                let vorFrist;
                try {
                    ruhe(RT);
                    vorFrist = [bs.vKap, bs.iKap];
                    ruhe(2);
                } finally {
                    if (alteRegel) delete r._chunkSatzVerdichten;
                }
                const nach = [bs.vKap, bs.iKap, bs.vEnde];
                // der Haken des Renders legt das Hauptbild neu
                r._passSicht(s.camera, false);
                r._passSicht(s.camera, true);
                const ab = abschnitteVon(bs);
                let treu = bs.geom === bs.mesh.geometry;
                for (const b of bs.bloecke.values()) treu = treu && bereichTreu(bs, b);
                const o = {
                    gross,
                    vorFrist,
                    nach,
                    inhalt,
                    ziel: Math.max(VD.vMin, Math.ceil(inhalt * VD.luft)),
                    frei: bs.vFrei.length,
                    derselbe: bs.mesh === mesh0 && bs.mesh.geometry === bs.geom,
                    treu,
                    abschnittTreu: ab.treu && ab.hauptBei0 && !ab.ueberlapp,
                    haupt: ab.hauptN,
                };
                for (const x of raus) r._chunkSatzEin("boden", x.key, x.geom, x.chunkKey);
                return o;
            };
            res.belegt = belegt(false);
            res.belegtAlt = belegt(true);
            // (l) DER WURF-SATZ (S3 haus, `bauWurf` — die NUR-WURF-Stufe 3 von Haus und Ausstattung im Satz ihres Schatten-
            // Stoffs): im Hauptbild wählt er keine Zelle und zieht keinen Befehl (drawRange 0), sein Mesh liegt NUR auf
            // SHADOW_TWIN_LAYER, eine Kaskade zeichnet seine Zelle. Selbsttest: derselbe Satz ohne die Marke `nurWurf` zeichnet
            // im Hauptbild — die Wand nennt ihn.
            const wurfProbe = (marke) => {
                const A = r.constructor;
                const art = "bauWurf|probe" + (marke ? "" : "-alt") + "|S";
                if (!s.satzStoffe) s.satzStoffe = new Map();
                s.satzStoffe.set(art, {
                    name: "bauWurf",
                    mat: new T.MeshBasicMaterial(),
                    wurf: true,
                    nurWurf: marke,
                    attr: A.BAU_WURF_ATTR,
                });
                const g = new T.BoxGeometry(4, 4, 4);
                const n = g.attributes.position.count;
                g.setAttribute("aDeckt", new T.BufferAttribute(new Float32Array(n).fill(1), 1));
                for (const a of ["aLodLevel", "aH0", "aH0L"])
                    g.setAttribute(a, new T.BufferAttribute(new Float32Array(n), 1));
                const vor = new T.Vector3();
                s.camera.getWorldDirection(vor);
                const p = s.camera.position.clone().addScaledVector(vor, 12);
                const im = new T.Matrix4().makeTranslation(p.x, p.y, p.z).toArray();
                r._chunkSatzEin(art, "probe#wurf", r._satzBlock(g, im, null, 1, A.BAU_WURF_ATTR, "probe"), "0,0");
                const satz = s.chunkSaetze.get(art);
                r._tickChunkSatz();
                r._passSicht(s.camera, false);
                const haupt = satz.geom.drawRange.count;
                const c = ortho(120);
                S.m.multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse);
                S.frustum.setFromProjectionMatrix(S.m, c.coordinateSystem);
                r._passWahlLage(S, c, 0);
                r._chunkSatzPass(c, false, 0, S);
                const kaskade = satz.geom.drawRange.count;
                r._chunkSatzPass(c, true, -1, S);
                r._passSicht(s.camera, true);
                const o = { haupt, kaskade, schicht: satz.mesh.layers.mask, soll: 1 << A.SHADOW_TWIN_LAYER };
                r._chunkSatzAus(art, "probe#wurf");
                return o;
            };
            res.wurf = wurfProbe(true);
            res.wurfAlt = wurfProbe(false);
            return res;
        });
        // (o) DER STUFEN-SPRUNG: das Auge geht in 2-m-Schritten; je Schritt jeder Chunk, der die Stufe wechselt — seine
        // gezeichnete Fläche (Lage + (Ziel − Lage) · `_morphFaktor`, die Boden-Karte des Stoffs) vor dem Wechsel gegen die des
        // neuen Netzes am selben Auge, auf einem 2-m-Raster im Chunk. Selbsttest: derselbe Gang zurück ohne das Stufen-Gewicht
        // (die Ring-Kette K51 morphte nur die Naht) springt.
        out.sprung = await page.evaluate(async () => {
            const r = window.anazhRealm;
            const s = r.state;
            const S = r._voxelChunkConfig(0).span;
            const karte = (e, key) => {
                const g = e.mesh.geometry;
                const P = g.attributes.position.array,
                    Z = g.attributes.aMorphTarget.array,
                    W = g.attributes.aMorphWeight.array;
                const L = new Float32Array(P.length);
                for (let v = 0; v < W.length; v++) {
                    const f = r._morphFaktor(W[v], P[v * 3], P[v * 3 + 2]);
                    for (let k = 0; k < 3; k++) L[v * 3 + k] = P[v * 3 + k] + (Z[v * 3 + k] - P[v * 3 + k]) * f;
                }
                const [cx, cz] = key.split(",").map(Number);
                const k = r._bodenKarteAusMesh(L, g.index ? g.index.array : null, null, cx, cz, e.lod || 0);
                return { lod: e.lod || 0, surfMap: k && k.hoehe, cx, cz };
            };
            const proben = (K) => {
                const o = [];
                for (let z = 1; z < S; z += 2)
                    for (let x = 1; x < S; x += 2) {
                        const v = K.surfMap ? r._bodenKarteBilinear(K, K.cx, K.cz, K.cx * S + x, K.cz * S + z) : null;
                        o.push(v ? v.y : NaN);
                    }
                return o;
            };
            const gang = async (dx, n, ohne) => {
                const sprung = [];
                const alle = [];
                let offen = 0;
                if (ohne) r._stufeGewicht = () => 0;
                // (p) DIE FOLGE DES WECHSELS: je Neubau die Bitten seiner Nachbarn an die Folge-Schlange (`_morphFolge`,
                // fahrt-takt) — ein Nachbar, der den Chunk nicht liest (weder seine neue noch seine alte Stufe ist gröber als die
                // des Nachbarn), ist ein LEER-Morph. Der Selbsttest (`ohne`) fährt die Lawine bis K51-3 nach: jeder Neubau bittet
                // alle acht.
                const folge = { neubau: 0, morphs: 0, leer: 0 };
                const F0 = r._finalizeVoxelChunkBuild,
                    FS = (s._morphFolge ||= new Map());
                const lodVon = new Map();
                for (const [key, e] of s.voxelChunks) if (e && !e.empty && e.mesh) lodVon.set(key, e.lod || 0);
                let ctx = null;
                r._finalizeVoxelChunkBuild = function (cx, cz, lod, ...rest) {
                    const key = cx + "," + cz;
                    ctx = { cx, cz, lod, alt: lodVon.has(key) ? lodVon.get(key) : null };
                    folge.neubau++;
                    try {
                        const e = F0.call(this, cx, cz, lod, ...rest);
                        if (ohne)
                            for (let dx = -1; dx <= 1; dx++)
                                for (let dz = -1; dz <= 1; dz++)
                                    if (dx || dz) FS.set(cx + dx + "," + (cz + dz), 0);
                        return e;
                    } finally {
                        ctx = null;
                        lodVon.set(key, lod);
                    }
                };
                FS.set = function (k, v) {
                    const nb = ctx && s.voxelChunks.get(k);
                    if (nb && !nb.empty && nb.mesh) {
                        folge.morphs++;
                        const nl = nb.lod || 0;
                        if (!(ctx.lod > nl || (ctx.alt !== null && ctx.alt > nl))) folge.leer++;
                    }
                    return Map.prototype.set.call(this, k, v);
                };
                try {
                    const p = { x: s.stufeAuge.x, y: 0, z: s.stufeAuge.z };
                    for (let i = 0; i < n; i++) {
                        p.x += dx;
                        r._stufeAugeTakt(p);
                        const vor = new Map();
                        for (const [key, e] of s.voxelChunks) {
                            if (!e || e.empty || !e.mesh) continue;
                            const [cx, cz] = key.split(",").map(Number);
                            const soll = r._voxelChunkLodFor(cx, cz, p.x, p.z, e.lod || 0);
                            if (soll !== (e.lod || 0)) vor.set(key, { soll, K: karte(e, key) });
                        }
                        for (const weiter = window.__deckel("die Soll-Stufen der Chunks", 1400); weiter(); ) {
                            r._tickVoxelChunkStreaming(p);
                            r._tickMorphFolge(Infinity); // die Folge-Schlange wie im Takt
                            await sleep(15);
                            let fertig = true;
                            for (const [key, v] of vor) {
                                const e = s.voxelChunks.get(key);
                                if (!e || (e.lod || 0) !== v.soll) fertig = false;
                            }
                            if (fertig) break;
                        }
                        for (const [key, v] of vor) {
                            const e = s.voxelChunks.get(key);
                            if (!e || !e.mesh || (e.lod || 0) !== v.soll) {
                                offen++;
                                continue;
                            }
                            const a = proben(v.K),
                                b = proben(karte(e, key));
                            const ds = [];
                            for (let q = 0; q < a.length; q++)
                                if (a[q] === a[q] && b[q] === b[q]) ds.push(Math.abs(a[q] - b[q]));
                            ds.sort((x, y) => x - y);
                            if (!ds.length) continue;
                            for (const d of ds) alle.push(d);
                            sprung.push({
                                key,
                                von: v.K.lod,
                                zu: v.soll,
                                schritt: i,
                                max: +ds[ds.length - 1].toFixed(3),
                                p95: +ds[Math.floor(0.95 * ds.length)].toFixed(3),
                                n: ds.length,
                            });
                        }
                    }
                } finally {
                    delete r._stufeGewicht;
                    delete r._finalizeVoxelChunkBuild;
                    delete FS.set;
                }
                sprung.sort((a, b) => b.max - a.max);
                const p95 = sprung.map((x) => x.p95).sort((a, b) => b - a);
                alle.sort((a, b) => a - b);
                const q = (p) =>
                    alle.length ? +alle[Math.min(alle.length - 1, Math.floor(p * alle.length))].toFixed(3) : 0;
                return {
                    wechsel: sprung.length,
                    offen,
                    proben: alle.length,
                    p50: q(0.5),
                    p90: q(0.9),
                    p95: q(0.95),
                    max: sprung.length ? sprung[0].max : 0,
                    chunkP95: p95[0] || 0,
                    top: sprung.slice(0, 3),
                    folge,
                };
            };
            const mit = await gang(2, 30, false);
            const ohne = await gang(-2, 30, true);
            return { mit, ohne };
        });
    } catch (e) {
        out = { error: e?.message || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        process.exit(1);
    }
    const z = out.zensus;
    console.log(
        `\n  Zensus: ${out.chunks} Chunks · Boden ${z.boden.objekte} Objekte (${z.boden.tris} Dreiecke) · Wasser ${z.wasser.objekte}` +
            ` · Nah-Streu ${Object.values(z.streuNah).reduce((a, b) => a + b, 0)} selbst zeichnend, ` +
            `${z.streuSatz.imSatz}/${z.streuSatz.bloecke} Blöcke im Streu-Satz ihres Stoffs` +
            ` · Fern ${Object.values(z.fern).reduce((a, b) => a + b, 0)} · Deck ${z.deck} · @p:-Gruppen ${z.pGruppen.length}` +
            ` · p:-Bundles ${z.pBundles.length} · Render-Bürger ${z.renderBuerger} · Szenen-Kinder ${z.szeneKinder}` +
            `\n  Bau: ${z.bau.gruppen} Gruppen (${z.bau.werfer} werfen) · Glut ${z.bau.glut} (${z.bau.glutWerfer} werfen)` +
            ` · Bau-Satz ${z.bauSatz.imSatz}/${z.bauSatz.gruppen} Gruppen im Satz ihres Stoffs\n`
    );
    for (const x of out.saetze || [])
        console.log(
            `  Satz ${x.art}: ${x.bereiche} Bereiche · ${x.vEnde}/${x.vKap} Vertices · ${x.index} Indizes im Ring, ` +
                `Hauptbild-Abschnitt ${x.haupt} · Abschnitte bis ${x.iEnde}/${x.iKap} · ${x.wachse}× gewachsen`
        );
    console.log("");
    const alle = urteil(z);
    const vn = alle.filter((x) => x.startsWith("BODEN-STUFEN"));
    const v = alle.filter((x) => !x.startsWith("BODEN-STUFEN"));
    check(
        "(a–d) die Draw-Einheit ist Material × Geometrie (Boden · Wasser · Streu · Bau)",
        v.length === 0,
        v.join(" · ") || "sauber"
    );
    const zs = z.stufen;
    const jenseits = zs.chunks.filter((c) => c.ring >= 2).length;
    check(
        "(n) BODEN-STUFEN — kein Chunk jenseits der Halte-Grenze seiner Stufe (Kasten-Abstand ≥ bis + vorlauf + halt, K51-2); " +
            "das Naht-Band brückt nur, wo der Morph nicht trägt",
        jenseits > 0 && zs.naht > 0 && vn.length === 0,
        `${zs.chunks.length} Chunks (${jenseits} jenseits) · je Stufe ${JSON.stringify(zs.jeStufe)} · Naht ${zs.naht} ` +
            `Dreiecke (${zs.bruecken} Brücken)` +
            (vn.length ? " — " + vn.join(" · ") : "")
    );
    // (o) DER STUFEN-SPRUNG: der Wechsel geschieht deckungsgleich — höchstens STUFEN_SPRUNG_M zwischen der
    // Fläche vor und nach dem Wechsel; der Selbsttest ohne das Stufen-Gewicht MUSS darüber liegen
    const SP = out.sprung || {};
    const fmt = (g) =>
        g
            ? `${g.wechsel} Wechsel (${g.offen} offen, ${g.proben} Proben) · p50 ${g.p50} · p90 ${g.p90} · p95 ${g.p95} · max ${g.max} m · ` +
              JSON.stringify(g.top)
            : "keine Messung";
    check(
        `(o) STUFEN-SPRUNG — der Wechsel deckungsgleich (p90 der Proben ≤ ${STUFEN_SPRUNG_M} m zwischen alter und neuer Fläche)`,
        !!SP.mit && SP.mit.wechsel >= 3 && SP.mit.offen === 0 && SP.mit.p90 <= STUFEN_SPRUNG_M,
        fmt(SP.mit)
    );
    check(
        "(o) Selbsttest: derselbe Gang ohne das Stufen-Gewicht (nur der Naht-Morph, die Kette K51) springt — die Wand nennt ihn",
        !!SP.ohne && SP.ohne.wechsel >= 3 && SP.ohne.p90 > STUFEN_SPRUNG_M,
        fmt(SP.ohne)
    );
    // (p) DIE FOLGE DES WECHSELS: ein Stufen-Wechsel morpht nur die Nachbarn, die den Chunk lesen — die Lawine (jeder
    // Neubau morphte alle acht, OMEN 1410-boden gehend: Frame p95 28,7 → 41,6 ms) fällt rot beim Namen
    const fo = (g) =>
        g?.folge
            ? `${g.folge.neubau} Neubauten · ${g.folge.morphs} Folge-Bitten · ${g.folge.leer} leer`
            : "keine Messung";
    check(
        "(p) FOLGE DES WECHSELS — kein Leer-Morph: ein Neubau bittet nur Nachbarn, die seine neue oder alte Stufe lesen",
        !!SP.mit && !!SP.mit.folge && SP.mit.folge.neubau >= 3 && SP.mit.folge.leer === 0,
        fo(SP.mit)
    );
    check(
        "(p) Selbsttest: die Lawine (jeder Neubau bittet alle acht Nachbarn) — die Wand nennt die Leer-Morphs",
        !!SP.ohne && !!SP.ohne.folge && SP.ohne.folge.leer > 0,
        fo(SP.ohne)
    );
    check("(a) der Boden lebt im Satz (Ring trägt Chunks)", out.satzDa && out.chunks > 20, `${out.chunks} Chunks`);
    check(
        "(h) BAU-SATZ — der gesetzte Studio-Bau lebt (Satz-Arten im Ring), jede Gruppe als Bereich im Satz ihres Stoffs",
        z.bauSatz.gruppen > 0 && z.bauSatz.imSatz === z.bauSatz.gruppen,
        `${z.bauSatz.imSatz}/${z.bauSatz.gruppen}`
    );
    check(
        "(c) STREU-SATZ — die Nah-Streu lebt (Blöcke im Ring), jeder Block mit Pflanzen als Bereich im Streu-Satz seines Stoffs",
        z.streuSatz.bloecke > 0 && z.streuSatz.imSatz === z.streuSatz.bloecke,
        `${z.streuSatz.imSatz}/${z.streuSatz.bloecke}`
    );
    check(
        "(c) … je Senke der Nah-Streu eine treue Block-Tabelle (Σ n = Anzahl, je Block Identitäten und Matrizen), jeder Block einer lebenden Kachel, keine Senke zeichnet",
        !!out.streu && out.streu.arten > 0 && out.streu.dicht === true,
        out.streu
            ? `${out.streu.arten} Senken · ${out.streu.bloecke} Blöcke${out.streu.fehler.length ? " — " + out.streu.fehler.join(", ") : ""}`
            : "kein Streu-Satz"
    );
    const saetze = out.saetze || [];
    check(
        "(f) TREUE — jeder Satz-Bereich trägt byte-gleich seinen Chunk (Views, Index verschoben, lückenlose Viertel)",
        saetze.length > 0 && saetze.every((x) => x.treu),
        saetze.map((x) => `${x.art} ${x.geprueft}`).join(" · ") || "kein Satz"
    );
    check(
        "(f) TREUE — jeder Abschnitt trägt seine Viertel byte-gleich hintereinander, in seiner Kapazität",
        saetze.length > 0 && saetze.every((x) => x.abschnittTreu) && saetze.some((x) => x.haupt > 0),
        saetze.map((x) => `${x.art} Hauptbild ${x.haupt}/${x.index}`).join(" · ")
    );
    check(
        "(f) die Viertel eines Abschnitts liegen in der Richtung der Art (Boden nah → fern, Wasser fern → nah)",
        saetze.length > 0 && saetze.every((x) => x.ordnung)
    );
    const k = out.konsum;
    check(
        "(e) KONSUM — Chunk-Abbau ändert den Satz, nicht die Szene",
        !!k && k.ab.kinder === k.vor.kinder && k.ab.bereiche < k.vor.bereiche && k.ab.index < k.vor.index,
        k ? JSON.stringify(k) : "kein Satz"
    );
    check(
        "(e) KONSUM — der Wiederaufbau kehrt in den Satz zurück (dieselbe Index-Zahl, dieselben Szenen-Kinder)",
        !!k && k.auf.kinder === k.vor.kinder && k.auf.bereiche === k.vor.bereiche && k.auf.index === k.vor.index
    );
    const wa = out.wachsen;
    check(
        "(i) WACHSEN — ein wachsender Satz tauscht die Geometrie am selben Mesh (der r184-Hörer fällt im Register), derselbe Inhalt",
        !!wa && wa.derselbe && wa.getauscht && wa.inhalt && out.tauschSicher === true,
        JSON.stringify(Object.assign({ tauschSicher: out.tauschSicher }, wa || {}))
    );
    const nu = out.neu;
    if (nu) {
        const bytesJeFrame = (frames) =>
            frames
                .slice(1)
                .map((d) => Object.values(d).reduce((a, b) => a + b, 0))
                .join("/");
        const vNeu = urteilNeu(nu.messung);
        check(
            "(j) NEUSCHREIBEN — kein Pass schreibt in Ruhe, kein Pass den Abschnitt eines anderen (Bytes je Frame nach dem ersten)",
            vNeu.length === 0,
            vNeu.slice(0, 3).join(" · ") ||
                `ruhe ${bytesJeFrame(nu.messung.ruhe)} B · druck ${bytesJeFrame(nu.messung.druck)} B · Boden ${JSON.stringify(nu.boden)}`
        );
        check(
            "(j) … der zu kleine Index wächst unter Druck (beide Kaskaden über dem Ring), statt zu verdrängen; jeder Abschnitt treu",
            nu.wachse.druck >= 1 && nu.treu === true,
            `${nu.wachse.druck}× gewachsen · treu ${nu.treu}`
        );
        const dr = nu.dreh,
            da = nu.drehAlt;
        check(
            "(j) DREHEN — jeder Pass schreibt nur die Änderung seiner Wahl (36 × 1°, Kaskaden vor dem Blick), jeder Abschnitt nach jedem Frame treu",
            !!dr && !!da && dr.untreu === 0 && da.untreu === 0 && dr.bytes <= 0.25 * da.bytes,
            dr && da
                ? `je Frame ${Math.round(dr.bytes / dr.frames)} B (Änderung ${Math.round(dr.aenderung / dr.frames)} B) · ` +
                      `die alte Regel ${Math.round(da.bytes / da.frames)} B · untreu ${dr.untreu}/${da.untreu}`
                : "keine Messung"
        );
        const vAlt = urteilNeu({ alt: nu.alt });
        check(
            "(j) Selbsttest: die alte Verdrängung (drei Ring-Kaskaden) schreibt je Frame neu — die Wand nennt sie",
            vAlt.length > 0,
            vAlt.slice(0, 2).join(" · ") || "(nichts — die Wand ist vakuös)"
        );
    } else check("(j) NEUSCHREIBEN gemessen", false, "keine Messung");
    const le = out.leer;
    check(
        "(k) DER SATZ FOLGT SEINEM INHALT — leer: bis zur Ruhe-Frist hält er, danach schrumpft er auf vMin/iMin (derselbe Mesh)",
        !!le &&
            le.vorFrist[0] === le.gross[0] &&
            le.vorFrist[1] === le.gross[1] &&
            le.nach[0] === le.ziel[0] &&
            le.nach[1] === le.ziel[1] &&
            le.gross[0] > le.ziel[0] &&
            le.derselbe === true,
        JSON.stringify(le)
    );
    const be = out.belegt;
    check(
        "(k) … belegt: nach der Frist dicht auf Inhalt × luft — Bereiche treu, Hauptbild-Abschnitt neu und treu, derselbe Mesh",
        !!be &&
            be.vorFrist[0] === be.gross[0] &&
            be.nach[0] === be.ziel &&
            be.nach[2] === be.inhalt &&
            be.frei === 0 &&
            be.nach[1] < be.gross[1] &&
            be.treu === true &&
            be.abschnittTreu === true &&
            be.haupt > 0 &&
            be.derselbe === true,
        JSON.stringify(be)
    );
    const ba = out.belegtAlt;
    check(
        "(k) Selbsttest: die alte Regel (nur ein leerer Satz kehrt zurück) hält das Hochwasser des Boden-Satzes — die Wand nennt es",
        !!ba && ba.nach[0] === ba.gross[0] && ba.nach[0] > ba.ziel * 1.5,
        ba ? `Boden-Satz hält ${ba.nach[0]} Vertices für ${ba.inhalt} Inhalt (Ziel ${ba.ziel})` : "keine Messung"
    );
    const wu = out.wurf,
        wa2 = out.wurfAlt;
    check(
        "(l) WURF-SATZ — der nurWurf-Satz (bauWurf) zieht im Hauptbild 0 Befehle, liegt nur auf SHADOW_TWIN_LAYER, die Kaskade zeichnet ihn",
        !!wu && wu.haupt === 0 && wu.kaskade > 0 && wu.schicht === wu.soll,
        JSON.stringify(wu)
    );
    check(
        "(l) Selbsttest: derselbe Satz ohne die Marke nurWurf zeichnet im Hauptbild — die Wand nennt ihn",
        !!wa2 && wa2.haupt > 0,
        wa2 ? `Hauptbild ${wa2.haupt} Indizes ohne die Marke` : "keine Messung"
    );
    ende("der Ring zeichnet je Material EINEN Satz; ein Chunk ist ein Bereich im Puffer, kein Szenen-Objekt.");
})();
