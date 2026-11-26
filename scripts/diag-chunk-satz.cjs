#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-chunk-satz.cjs — DER SATZ: die Draw-Einheit ist Material × Geometrie über den ganzen Ring, nie Chunk × Material.
// Die Wand zählt die Render-Bürger je Klasse direkt im
// Szenen-Baum (Null-Renderer — Bundles sind headless reine Gruppen, die Chunk-Meshes werden gebaut):
//   (a) BODEN — höchstens EIN Objekt trägt das Boden-Material (der Satz, Stitch eingeschlossen),
//       kein `voxelChunk:`-Name lebt im Szenen-Baum;
//   (b) WASSER — höchstens EIN Chunk-Wasser-Objekt (der Satz);
//   (c) STREU-BESTAND (w27-takt-streu) — die Draw-Einheit der Nah-Streu (Kachel-Ring um die Kamera) ist ihr STOFF in
//       seiner Arena, die EINE Wahl der GPU wählt je Pflanze: kein Nah-Streu-Objekt zeichnet am Null-Renderer selbst (ohne
//       Arena wählt niemand), kein Streu-Satz lebt, keine Deck-Streu und keine Fern-Deko (beide fielen); jede Senke (Art ×
//       Gestalt × Stufe × Teil) trägt je Kachel einen Block (Σ n ≤ Plätze, je Block die Ernte-Identitäten, jeder Block einer
//       lebenden Kachel des Rings), und jeder Block mit Pflanzen lebt TREU im Bestand seiner Familie — je Platz die Matrix
//       der Pflanze, in der vierten Zeile Fuß und Weite (Elemente 3, 7, 11), die Senke gestempelt für die Wahl (Art 5);
//   (d) BAU — keine Instanz-Gruppe mit `@p:` im Schlüssel, kein `p:`-Region-Bundle;
//   (e) KONSUM — ein Chunk-Abbau und -Wiederaufbau ändert den Satz (die Bereiche des Opfers), nie die Zahl
//       der Szenen-Kinder; das Opfer kehrt mit denselben Indizes und Vertices je Bereich zurück (deterministisch); was
//       der Ring derweil an fremden Chunks streamt und welches Wesen (Tier, Kleintier-Pool) der Szene derweil kommt oder
//       geht, steht beim Namen (`urteilKonsum`, Selbsttest: neun Täter, die alte Summen-Regel an der Geburt eines Tiers);
//   (f) TREUE — jeder Satz-Bereich trägt byte-gleich die Arrays seines Chunks (Index um den Bereichs-
//       Anfang verschoben, genau seine Dreiecke als lückenlose Zell-Läufe — Boden/Wasser Viertel, Bau je Instanz); jeder
//       Abschnitt (der Haken des Renders legt ihn) trägt seine Zellen byte-gleich hintereinander, Boden nah → fern;
//   (g) kein Page-Error;
//   (h) BAU-SATZ — die Draw-Einheit des gesetzten Studio-Baus ist sein STOFF: jede lebende Gruppe einer
//       Satz-Art (`AnazhRealm.BAU_SATZ` je Rezept-kind: Haus, Fels, Kristall, Säulen; ohne Tür-Flügel) hängt an keinem
//       Eltern-Knoten (weder Bundle noch Szene) und lebt als Bereich im Satz ihres Stoffs — n × liveCount Vertices, die
//       erste Instanz in Welt-Lage (Geometrie × Instanz-Matrix), je Instanz eine Zelle;
//   (i) WACHSEN — ein wachsender Satz tauscht an seiner EINEN Geometrie nur den Puffer, der wächst (stadt-takt2: die
//       Vertex-Spalten ODER der Index, derselbe Inhalt, derselbe Mesh); `_renderObjektRegister` nimmt r184s Geometrie-
//       Hörer heraus (er zerstörte beim verzögerten Entsorgen einer getauschten Geometrie die GPU-Puffer der neuen) — EINE
//       Antwort an der Wurzel, kein frischer Mesh je Wachsen;
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
const { statikServer, warteAufWelt, taeterFaelle, selbsttestEnde, nullSeite, pruefer, wandEnde, fehlerText, seiteZu, SELBSTTEST } = require("./lib/welt-boot.cjs");

// (o) die Schwelle des Stufen-Sprungs: ein Wechsel darf die gezeichnete Fläche höchstens so weit versetzen (m)
const STUFEN_SPRUNG_M = 0.1;

// Das Urteil über einen Zensus: Liste der Verstöße (leer = grün). Rein, im Selbsttest wie im Lauf.
function urteil(z) {
    const v = [];
    if (z.boden.objekte > 1)
        v.push(
            `BODEN: ${z.boden.objekte} Objekte tragen das Boden-Material (Soll 1, der Satz) — ${z.boden.namen.join(", ")}`
        );
    if (z.voxelChunkNamen.length)
        v.push(
            `BODEN: ${z.voxelChunkNamen.length} \`voxelChunk:\`-Objekte im Szenen-Baum — ${z.voxelChunkNamen.slice(0, 4).join(", ")}`
        );
    if (z.wasser.objekte > 1) v.push(`WASSER: ${z.wasser.objekte} Chunk-Wasser-Objekte (Soll ≤ 1, der Satz)`);
    // Die Nah-Streu zeichnet je Stoff in ihrer Arena (w27-takt-streu): zieht eine Senke am Null-Renderer selbst, zöge ihr
    // Zeichner ohne Wahl jede Pflanze des Rings (W7: 15 Befehle im Hauptbild, auch hinter dem Blick).
    const selbst = Object.entries(z.streuNah);
    if (selbst.length)
        v.push(
            `STREU: ${selbst.reduce((a, [, n]) => a + n, 0)} Nah-Streu-Objekte zeichnen selbst (Soll 0, die Arena ihres ` +
                `Stoffs) — ${selbst
                    .map(([k, n]) => k + (n > 1 ? "×" + n : ""))
                    .slice(0, 4)
                    .join(", ")}`
        );
    const sb = z.streuBestand || { untreu: [], saetze: [] };
    if (sb.untreu.length)
        v.push(`STREU-BESTAND: ${sb.untreu.length} Blöcke ohne treuen Platz — ${sb.untreu.slice(0, 4).join(", ")}`);
    if (sb.saetze.length)
        v.push(`STREU-BESTAND: ${sb.saetze.length} Streu-Sätze leben (gefallen, Soll 0) — ${sb.saetze.slice(0, 2).join(", ")}`);
    if (z.deck > 0) v.push(`STREU: ${z.deck} Deck-Streu-InstancedMeshes (gefallen, Soll 0)`);
    const fernSumme = Object.values(z.fern).reduce(addiere, 0);
    if (fernSumme > 0) v.push(`STREU: ${fernSumme} Fern-Deko-InstancedMeshes (das Kreuz-Fernfeld fiel, Soll 0)`);
    if (z.pGruppen.length)
        v.push(
            `BAU: ${z.pGruppen.length} Instanz-Gruppen mit \`@p:\` im Schlüssel — ${z.pGruppen.slice(0, 4).join(", ")}`
        );
    if (z.pBundles.length)
        v.push(`BAU: ${z.pBundles.length} \`p:\`-Region-Bundles — ${z.pBundles.slice(0, 4).join(", ")}`);
    const bs = z.bauSatz || { selbst: [], ohneBereich: [] };
    if (bs.selbst.length)
        v.push(
            `BAU-SATZ: ${bs.selbst.length} Gruppen einer Satz-Art zeichnen selbst (Soll 0, der Satz ihres Stoffs) — ` +
                bs.selbst.slice(0, 4).join(", ")
        );
    if (bs.ohneBereich.length)
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
    if (z.vertexForm?.length) {
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

// (e) DAS KONSUM-URTEIL (rein): `k` = { opfer, lod, vor, ab, auf, gestreamt, kinder } — je Stand die Zahl der Szenen-Kinder,
// der Bereiche, die Index-Summe und je Bereich [Chunk, Indizes, Vertices] im Boden-Satz; `gestreamt` je Chunk, dessen
// Eintrag der Ring während der Probe tauschte, die Stufe vor → auf (das Opfer, wenn der Ring seinen Wiederaufbau ersetzte);
// `kinder` je Schritt (ab, auf) die Szenen-Kinder, die kamen und gingen, beim Namen (`wesen`: ein Tier oder ein Kleintier-
// Pool der lebenden Welt). Das Urteil gilt dem OPFER: seine Bereiche (Netz und Naht-Band) fallen im Abbau ganz und kehren
// mit denselben Indizes und Vertices zurück; ein fremder Bereich ändert sich nur, wo der Ring streamte (sein Chunk, beim
// Naht-Band ein Nachbar außer dem Opfer); ein Szenen-Kind kommt oder geht nur als Wesen — beides steht beim Namen, jede
// andere Änderung ist der Wiederaufbau selbst und ROT. Bis w28-satz-wand-ruhe verglich die Wand die SUMMEN (Szenen-Kinder,
// Bereiche, Indizes) ohne Detail: ein Tier, das während des Wartens geboren wurde (gemessen: 3 von 240 Proben, Szenen-
// Kinder 50→51, „Tier deer“; der Satz kehrte in 240 von 240 gleich zurück), machte sie rot ohne Zahl — zwei Abgaben am
// 14.11. (CI 43640181613). `alt` fährt diese Regel (der Selbsttest: ihr Täter-Beleg).
const KONSUM_NACHBARN = [-1, 0, 1].flatMap((dx) => [-1, 0, 1].map((dz) => [dx, dz])).filter(([dx, dz]) => dx || dz);
function konsumBefund(k) {
    const G = k.gestreamt || {};
    const naehe = (ck) => {
        const [x, z] = ck.split(",").map(Number);
        return KONSUM_NACHBARN.map(([dx, dz]) => `${x + dx},${z + dz}`).filter((n) => n !== k.opfer && G[n]);
    };
    // wer einen Bereich bewegt haben darf: sein Chunk gestreamt, beim Naht-Band ein gestreamter Nachbar (außer dem Opfer)
    const grund = (key, ck) => {
        const g = [];
        if (ck !== k.opfer && G[ck]) g.push(`${ck} ${G[ck].join("→")}`);
        if (key.startsWith("stitch:")) for (const n of naehe(ck)) g.push(`Nachbar ${n} ${G[n].join("→")}`);
        return g;
    };
    const vergleiche = (A, B) => {
        const fremd = [],
            selbst = [];
        for (const key of new Set([...Object.keys(A.bereiche), ...Object.keys(B.bereiche)])) {
            const a = A.bereiche[key],
                b = B.bereiche[key];
            const ck = (a || b)[0];
            if (ck === k.opfer || (a && b && a[1] === b[1] && a[2] === b[2])) continue;
            const d = { key, vor: a ? a.slice(1) : null, nach: b ? b.slice(1) : null, di: (b ? b[1] : 0) - (a ? a[1] : 0) };
            const g = grund(key, ck);
            (g.length ? fremd : selbst).push(g.length ? { ...d, grund: g } : d);
        }
        return { fremd, selbst };
    };
    const opferVon = (S) =>
        Object.fromEntries(Object.entries(S.bereiche).filter(([, b]) => b[0] === k.opfer).map(([key, b]) => [key, b.slice(1)]));
    const abbau = vergleiche(k.vor, k.ab),
        rueck = vergleiche(k.vor, k.auf);
    const o = { vor: opferVon(k.vor), ab: opferVon(k.ab), auf: opferVon(k.auf) };
    return { G, abbau, rueck, o };
}
function urteilKonsum(k, { alt = false } = {}) {
    if (!k) return ["KONSUM: kein Satz, kein Opfer"];
    const v = [];
    if (alt) {
        if (!(k.auf.kinder === k.vor.kinder && k.auf.anzahl === k.vor.anzahl && k.auf.index === k.vor.index))
            v.push(
                `WIEDERAUFBAU (die Summen-Regel bis w28-satz-wand-ruhe): der Satz kehrt nicht zurück — Bereiche ` +
                    `${k.vor.anzahl}→${k.auf.anzahl}, Indizes ${k.vor.index}→${k.auf.index}, Szenen-Kinder ${k.vor.kinder}→${k.auf.kinder}`
            );
        return v;
    }
    const { G, abbau, rueck, o } = konsumBefund(k);
    const nenne = (L) =>
        L.slice(0, 4)
            .map((x) => `${x.key} ${x.vor ? x.vor.join("/") : "—"}→${x.nach ? x.nach.join("/") : "—"}`)
            .join(", ");
    // die Bilanz: jede Stand-Summe ist die Summe ihrer Bereiche (sonst sieht der Stand je Bereich nicht alles)
    for (const [n, S] of Object.entries({ vor: k.vor, ab: k.ab, auf: k.auf })) {
        const i = Object.values(S.bereiche).reduce((s, b) => s + b[1], 0);
        if (i !== S.index || Object.keys(S.bereiche).length !== S.anzahl)
            v.push(`KONSUM: der Stand ${n} trägt ${S.index} Indizes in ${S.anzahl} Bereichen, die Bereiche ${i} in ${Object.keys(S.bereiche).length}`);
    }
    // die Szene: ein Kind kommt oder geht nur als Wesen der lebenden Welt; die Zahl ist vor + neu − weg (die Liste sieht alles)
    const szene = (schritt, S, K) => {
        if (!K) return void v.push(`${schritt}: die Szenen-Kinder ungenannt (${k.vor.kinder}→${S.kinder})`);
        if (k.vor.kinder + K.neu.length - K.weg.length !== S.kinder)
            v.push(`${schritt}: die Szenen-Kinder ${k.vor.kinder}→${S.kinder}, genannt +${K.neu.length} −${K.weg.length}`);
        for (const [was, L] of [["kam", K.neu], ["ging", K.weg]]) {
            const fremd = L.filter((x) => !x.wesen);
            if (fremd.length)
                v.push(`${schritt}: ${fremd.length} Szenen-Kinder ${was} (kein Wesen) — ${fremd.slice(0, 4).map((x) => x.name).join(", ")}`);
        }
    };
    // ABBAU: das Opfer trug Bereiche und verliert sie alle, die Szene bleibt
    if (!Object.keys(o.vor).length) v.push(`ABBAU: das Opfer ${k.opfer} trägt vor dem Abbau keinen Bereich im Satz`);
    if (Object.keys(o.ab).length) v.push(`ABBAU: das Opfer ${k.opfer} behält nach dem Abbau ${Object.keys(o.ab).join(", ")}`);
    szene("ABBAU", k.ab, k.kinder && k.kinder.ab);
    if (abbau.selbst.length) v.push(`ABBAU: ${abbau.selbst.length} fremde Bereiche ohne Strom geändert — ${nenne(abbau.selbst)}`);
    // WIEDERAUFBAU: das Opfer kehrt mit denselben Bereichen, Indizes und Vertices zurück, nur fremder Strom bewegt Fremdes
    if (G[k.opfer]) v.push(`WIEDERAUFBAU: der Ring ersetzte das Opfer ${k.opfer} während des Wartens (Stufe ${G[k.opfer].join("→")})`);
    for (const key of new Set([...Object.keys(o.vor), ...Object.keys(o.auf)])) {
        const a = o.vor[key],
            b = o.auf[key];
        if (!a || !b || a[0] !== b[0] || a[1] !== b[1])
            v.push(
                `WIEDERAUFBAU: das Opfer ${k.opfer} (L${k.lod}) kehrt anders zurück — ${key} Indizes/Vertices ` +
                    `${a ? a.join("/") : "—"}→${b ? b.join("/") : "—"}`
            );
    }
    szene("WIEDERAUFBAU", k.auf, k.kinder && k.kinder.auf);
    if (rueck.selbst.length)
        v.push(`WIEDERAUFBAU: ${rueck.selbst.length} fremde Bereiche ohne Strom geändert — ${nenne(rueck.selbst)}`);
    return v;
}
// Die Zeile des Befunds (beide Prüfungen drucken sie): das Opfer vor/ab/auf, die Summen, die fremden Änderungen beim Namen.
function konsumZeile(k) {
    if (!k) return "kein Satz";
    const { G, abbau, rueck, o } = konsumBefund(k);
    const st = (S) => ({ kinder: S.kinder, bereiche: S.anzahl, index: S.index });
    return JSON.stringify({
        opfer: k.opfer,
        lod: k.lod,
        opferVor: o.vor,
        opferAb: o.ab,
        opferAuf: o.auf,
        vor: st(k.vor),
        ab: st(k.ab),
        auf: st(k.auf),
        gestreamt: G,
        summenRegel: urteilKonsum(k, { alt: true }).length ? "rot" : "grün",
        fremdAb: abbau.fremd.concat(abbau.selbst),
        fremdAuf: rueck.fremd.concat(rueck.selbst),
        kinder: k.kinder,
    });
}

// Ein grüner Zensus (die Form, die der Lauf liefert) und drei injizierte Täter.
function selbsttest() {
    const gruen = {
        boden: { objekte: 1, namen: ["bodenSatz"] },
        voxelChunkNamen: [],
        wasser: { objekte: 1 },
        streuNah: {},
        streuBestand: { bloecke: 12, treu: 12, untreu: [], saetze: [] },
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
            name: "ein Block ohne treuen Platz im Bestand",
            z: {
                ...gruen,
                streuBestand: { bloecke: 12, treu: 11, untreu: ["farn:2:L1:0@-226,-212 Platz 3: Weite"], saetze: [] },
            },
            muss: [/STREU-BESTAND: 1 Blöcke ohne treuen Platz — farn:2:L1:0@-226,-212 Platz 3: Weite/],
        },
        {
            name: "ein Streu-Satz lebt",
            z: { ...gruen, streuBestand: { bloecke: 12, treu: 12, untreu: [], saetze: ["streuSatz|ab12"] } },
            muss: [/STREU-BESTAND: 1 Streu-Sätze leben .*streuSatz\|ab12/],
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
    taeterFaelle(faelle, urteil, { fehler, gruen });
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
    // (e) das Konsum-Urteil: das Opfer 2,3 (L1, Netz + Naht-Band) fällt und kehrt zurück; der Nachbar 3,3 und 9,9 ruhen
    const bereiche = {
        "2,3": ["2,3", 600, 200],
        "stitch:2,3": ["2,3", 60, 30],
        "3,3": ["3,3", 900, 300],
        "stitch:3,3": ["3,3", 90, 40],
        "9,9": ["9,9", 300, 100],
    };
    const ohneOpfer = { "3,3": bereiche["3,3"], "stitch:3,3": bereiche["stitch:3,3"], "9,9": bereiche["9,9"] };
    const kGruen = {
        opfer: "2,3",
        lod: 1,
        vor: { kinder: 40, anzahl: 5, index: 1950, bereiche },
        ab: { kinder: 40, anzahl: 3, index: 1290, bereiche: ohneOpfer },
        auf: { kinder: 40, anzahl: 5, index: 1950, bereiche },
        gestreamt: {},
        kinder: { ab: { neu: [], weg: [] }, auf: { neu: [], weg: [] } },
    };
    const kMit = (tat) => {
        const z = JSON.parse(JSON.stringify(kGruen));
        tat(z);
        return z;
    };
    // ein fremder Chunk strömt während des Wartens zu (10,9 L2): der Fall der zwei roten Abgaben vom 14.11.
    const zustrom = kMit((z) => {
        z.auf.bereiche["10,9"] = ["10,9", 300, 100];
        z.auf.anzahl = 6;
        z.auf.index = 2250;
        z.gestreamt = { "10,9": [-1, 2] };
    });
    // ein Tier wird während des Wartens geboren (gemessen: Szenen-Kinder 50→51, „Tier deer“) — der Täter des Wacklers
    const geburt = kMit((z) => {
        z.auf.kinder = 41;
        z.kinder.auf.neu = [{ name: "Tier deer c17", wesen: true }];
    });
    const konsumFaelle = [
        { name: "das Opfer fällt und kehrt gleich zurück", z: kGruen },
        { name: "ein Tier wird während des Wartens geboren (ein Wesen beim Namen, kein Befund am Opfer)", z: geburt },
        {
            name: "der Bestäuber-Pool tauscht sein Mesh (ein Wesen)",
            z: kMit((z) => {
                z.kinder.auf.neu = [{ name: "tier:bestaeuber", wesen: true }];
                z.kinder.auf.weg = [{ name: "tier:bestaeuber", wesen: true }];
            }),
        },
        { name: "ein fremder Chunk strömt während des Wartens zu (beim Namen, kein Befund am Opfer)", z: zustrom },
        {
            name: "ein Nachbar wechselt die Stufe, sein Naht-Band folgt (fremder Strom)",
            z: kMit((z) => {
                z.auf.bereiche["3,3"] = ["3,3", 240, 80];
                z.auf.bereiche["stitch:3,3"] = ["3,3", 0, 0];
                z.auf.index = 1950 - 660 - 90;
                z.gestreamt = { "3,3": [0, 1] };
            }),
        },
        {
            name: "der Wiederaufbau bringt das Opfer mit anderer Index-Zahl zurück",
            z: kMit((z) => {
                z.auf.bereiche["2,3"] = ["2,3", 612, 200];
                z.auf.index = 1962;
            }),
            muss: /WIEDERAUFBAU: das Opfer 2,3 \(L1\) kehrt anders zurück — 2,3 Indizes\/Vertices 600\/200→612\/200/,
        },
        {
            name: "der Wiederaufbau verliert das Naht-Band des Opfers",
            z: kMit((z) => {
                delete z.auf.bereiche["stitch:2,3"];
                z.auf.anzahl = 4;
                z.auf.index = 1890;
            }),
            muss: /WIEDERAUFBAU: das Opfer 2,3 \(L1\) kehrt anders zurück — stitch:2,3 Indizes\/Vertices 60\/30→—/,
        },
        {
            name: "das Naht-Band eines ruhenden Nachbarn ändert sich (der Wiederaufbau selbst, kein Strom)",
            z: kMit((z) => {
                z.auf.bereiche["stitch:3,3"] = ["3,3", 120, 40];
                z.auf.index = 1980;
            }),
            muss: /WIEDERAUFBAU: 1 fremde Bereiche ohne Strom geändert — stitch:3,3 90\/40→120\/40/,
        },
        {
            name: "der Abbau behält das Naht-Band des Opfers",
            z: kMit((z) => {
                z.ab.bereiche["stitch:2,3"] = ["2,3", 60, 30];
                z.ab.anzahl = 4;
                z.ab.index = 1350;
            }),
            muss: /ABBAU: das Opfer 2,3 behält nach dem Abbau stitch:2,3/,
        },
        {
            name: "der Ring ersetzt das Opfer während des Wartens",
            z: kMit((z) => (z.gestreamt = { "2,3": [1, 2] })),
            muss: /WIEDERAUFBAU: der Ring ersetzte das Opfer 2,3 während des Wartens \(Stufe 1→2\)/,
        },
        {
            name: "der Wiederaufbau hängt das Netz des Opfers als Szenen-Kind an",
            z: kMit((z) => {
                z.auf.kinder = 41;
                z.kinder.auf.neu = [{ name: "voxelChunk:2,3:lod1", wesen: false }];
            }),
            muss: /WIEDERAUFBAU: 1 Szenen-Kinder kam \(kein Wesen\) — voxelChunk:2,3:lod1/,
        },
        {
            name: "der Abbau nimmt der Szene ein Kind",
            z: kMit((z) => {
                z.ab.kinder = 39;
                z.kinder.ab.weg = [{ name: "lodStitch:2,3", wesen: false }];
            }),
            muss: /ABBAU: 1 Szenen-Kinder ging \(kein Wesen\) — lodStitch:2,3/,
        },
        {
            name: "ein Szenen-Kind kommt ungenannt (die Zahl ohne die Liste)",
            z: kMit((z) => (z.auf.kinder = 41)),
            muss: /WIEDERAUFBAU: die Szenen-Kinder 40→41, genannt \+0 −0/,
        },
        {
            name: "ein Stand, dessen Summe nicht die seiner Bereiche ist",
            z: kMit((z) => (z.auf.index = 1951)),
            muss: /KONSUM: der Stand auf trägt 1951 Indizes in 5 Bereichen, die Bereiche 1950 in 5/,
        },
    ];
    taeterFaelle(konsumFaelle, urteilKonsum, { fehler });
    // der Täter-Beleg des Wacklers: die Summen-Regel bis w28-satz-wand-ruhe fällt an der Geburt eines Tiers (gemessen) und
    // am Zustrom eines fremden Chunks ROT — ohne ein Wort zum Opfer
    taeterFaelle(
        [
            {
                name: "die alte Summen-Regel an der Geburt eines Tiers während des Wartens",
                z: geburt,
                muss: /WIEDERAUFBAU \(die Summen-Regel bis w28-satz-wand-ruhe\).*Szenen-Kinder 40→41/,
            },
            {
                name: "die alte Summen-Regel am Zustrom eines fremden Chunks",
                z: zustrom,
                muss: /WIEDERAUFBAU \(die Summen-Regel bis w28-satz-wand-ruhe\).*Bereiche 5→6, Indizes 1950→2250/,
            },
        ],
        (z) => urteilKonsum(z, { alt: true }),
        { fehler }
    );
    selbsttestEnde(fehler);
}

if (SELBSTTEST) {
    console.log("=== CHUNK-SATZ — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const server = statikServer();

const { errs, check } = pruefer();

(async () => {
    console.log("=== CHUNK-SATZ (Welle B) — Null-Renderer, die Render-Bürger je Klasse ===");
    const { browser, page } = await nullSeite({ frist: 300000 }, server);
    page.setDefaultTimeout(280000);
    let out = null;
    try {
        await warteAufWelt(page, 120000, server);
        out = await page.evaluate(async () => {
            const s = r.state;
            const res = {};
            // DER ORT DES ZENSUS: der Gürtel des Genesis-Orts südlich seiner Mitte (fachwerk `GENESIS_ORT.guertel`, der Wald des
            // Felds) — an der Ankunft trägt sein Freiraum keine Krone, keinen Busch, keinen Fels, der Ring der Nah-Streu (24 m)
            // bliebe leer und (c) urteilte über nichts
            const [M, G] = [r._genesisMitte(), window.__fachwerkCore.GENESIS_ORT.guertel];
            const z = M.z - (G.r0 + G.r1) / 2;
            s.playerMesh.position.set(M.x, r.getTerrainHeightAt(M.x, z) + 1.2, z);
            // Einschwingen: die Welt steht (das EINE Einschwingen, welt-boot `__weltStehtNach`), dann Streu, Wasser und Fern-Deko
            // austreiben.
            await __weltStehtNach(() => {
                __handTakt();
            });
            for (let i = 0; i < 60; i++) if (!r._tickPendingWaterIso(8)) break;
            // Die Nah-Streu: der Kachel-Ring um die Kamera, bis Studio-Teile ankommen und nichts mehr offen ist.
            for (let i = 0; i < 900; i++) {
                r._tickNahStreu();
                const ns = s.nahStreu;
                if (ns && ns.senken.size > 0 && ns.offen === 0) break;
                await sleep(100);
            }
            await window.__takte(30, 0);
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
                    // (c) ein Nah-Streu-Objekt, das selbst zeichnet (am Null-Renderer zieht keine Senke — ohne Arena wählt niemand)
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
                // die erste Instanz, erster Vertex: die Geometrie geo × Instanz-Matrix e, in Welt-Lage im Pool des Satzes (Bereich
                // bereich) auf 1 mm je Achse
                const ersteEcke = (e, geo, satz, bereich) => {
                    const [q, w, o] = [geo.attributes.position.array, satz.geom.attributes.position.array, bereich.vStart * 3];
                    return [0, 1, 2].every(
                        (c) => Math.abs(w[o + c] - (e[c] * q[0] + e[c + 4] * q[1] + e[c + 8] * q[2] + e[c + 12])) <= 1e-3
                    );
                };
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
                        const treu =
                            !!b &&
                            b.vAnzahl === n * g.liveCount &&
                            satz.mesh.name === satzName &&
                            ersteEcke(g.mesh.instanceMatrix.array, g.geom, satz, b);
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
                // (c) DER STREU-BESTAND: jeder Block mit Pflanzen lebt treu im Bestand seiner Familie (`_nahStreuBestand`) — je
                // Platz die Matrix der Pflanze (bis auf die vierte Zeile), Fuß und Weite in den Elementen 3, 7, 11, die Senke
                // für die Wahl gestempelt (Art 5); kein Streu-Satz lebt mehr.
                z.streuBestand = { bloecke: 0, treu: 0, untreu: [], saetze: [] };
                if (s.chunkSaetze) for (const art of s.chunkSaetze.keys()) if (String(art).startsWith("streuSatz")) z.streuBestand.saetze.push(art);
                const ns0 = s.nahStreu;
                if (ns0 && ns0.familien && ns0.bestand)
                    for (const fam of ns0.familien.values()) {
                        const F = ns0.bestand.get(fam.key);
                        for (const a of fam.senken)
                            for (const [kk, b] of a.bloecke) {
                                if (!(b.n > 0)) continue;
                                z.streuBestand.bloecke++;
                                const p = F ? F.bloecke.get(kk) : null;
                                const arr = a.mesh ? a.mesh.instanceMatrix.array : null;
                                let fehl = !p ? "kein Platz" : p.n !== b.n ? `n ${p.n}/${b.n}` : !arr ? "kein Mesh" : "";
                                if (!fehl && !(a.mesh.__wahlGpu === true && a.mesh.__wahlFenster && a.mesh.__wahlFenster[0] === 5)) fehl = "ohne Stempel"; // prettier-ignore
                                for (let j = 0; !fehl && j < b.n; j++) {
                                    const o = (p.s + j) * 16;
                                    for (let e = 0; e < 16 && !fehl; e++)
                                        if (e !== 3 && e !== 7 && e !== 11 && arr[o + e] !== b.matrizen[j * 16 + e]) fehl = `Platz ${j}: Matrix`;
                                    if (!fehl && (arr[o + 3] !== b.fuss[j * 3] || arr[o + 7] !== b.fuss[j * 3 + 1])) fehl = `Platz ${j}: Fuß`;
                                    if (!fehl && !(arr[o + 11] === b.fuss[j * 3 + 2] && arr[o + 11] > 0)) fehl = `Platz ${j}: Weite`;
                                }
                                if (fehl) z.streuBestand.untreu.push(a.key + "@" + kk + " " + fehl);
                                else z.streuBestand.treu++;
                            }
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

            // ── (c) DIE SENKEN DER NAH-STREU: je Senke Σ n der Blöcke ≤ ihre Plätze (der Bestand), je Block die Ernte-Identitäten
            // (n), n × 16 Matrix-Werte und n × 3 Fuß und Weite, jeder Block gehört einer lebenden Kachel des Rings, die ihn kennt.
            res.streu = { arten: 0, bloecke: 0, dicht: true, fehler: [] };
            const ns = s.nahStreu;
            if (ns)
                for (const [name, a] of ns.senken) {
                    res.streu.arten++;
                    let summe = 0;
                    for (const [kk, b] of a.bloecke) {
                        const k = ns.kacheln.get(kk);
                        if (b.ids.length !== b.n || b.matrizen.length !== b.n * 16 || !b.fuss || b.fuss.length !== b.n * 3 || !k || !k.senken.has(name)) { // prettier-ignore
                            res.streu.dicht = false;
                            if (res.streu.fehler.length < 4) res.streu.fehler.push(name + "@" + kk);
                        }
                        summe += b.n;
                        res.streu.bloecke++;
                    }
                    if (summe > a.anzahl || (summe > 0 && !a.mesh)) {
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
                // … samt den Gewichten der gepackten Formen (die vierte Stelle: `aLageU`, `aLageV`, `aVerband` — `_satzBlock` legt sie
                // nur in der Werkbank an, der flüchtige Block trägt sie nicht): die Nachrechnung liefert jedes Attribut, das der Block
                // nicht hält. Bis hier las die Linse das Gewicht am Block — ein flüchtiger Bau-Block (Feuerstelle, unter Last: 3 von 20
                // Läufen, CI voll 8/18 an 00f9064a und 106b754a) brach mit „reading 'array'“
                const g = fl
                    ? {
                          attributes: Object.fromEntries(
                              [...new Set([...Object.keys(nach.attributes), ...Object.keys(b.geom.attributes)])].map((k) => {
                                  const a = b.geom.attributes[k];
                                  return [k, !a || a.array === null ? nach.attributes[k] : a];
                              })
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
                    let treu = true,
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
                    // der Stand JE BEREICH (Schlüssel → Chunk, Indizes, Vertices) samt den Chunk-Einträgen: das Urteil
                    // (`urteilKonsum`) trennt das Opfer von den fremden Chunks, die der Ring während des Wartens streamt
                    const stand = () => {
                        const bereiche = {};
                        for (const [key, b] of satz.bloecke) bereiche[key] = [b.chunkKey, b.iAnzahl, b.vAnzahl];
                        const eintrag = new Map(s.voxelChunks);
                        const kl = s.scene.children.slice();
                        return { kinder: kl.length, anzahl: satz.bloecke.size, index: satz.iSumme, bereiche, eintrag, kl };
                    };
                    // ein Szenen-Kind beim Namen: ein WESEN der lebenden Welt (ein Tier, `_spawnCreature` userData.kind
                    // „creature“, oder ein Kleintier-Pool `tier:…`, `_kleintierZeichnen`) trägt seine Art, alles andere
                    // seinen Namen
                    const kindName = (o) => {
                        const u = o.userData || {};
                        if (u.kind === "creature") return { name: `Tier ${u.gattung || u.soul || "?"} ${u.netId || ""}`.trim(), wesen: true };
                        const n = o.name || u.inventar || o.type;
                        return { name: n, wesen: String(o.name || "").startsWith("tier:") };
                    };
                    const kinderVon = (A, B) => ({
                        neu: B.kl.filter((o) => !A.kl.includes(o)).map(kindName),
                        weg: A.kl.filter((o) => !B.kl.includes(o)).map(kindName),
                    });
                    const vor = stand();
                    r._disposeVoxelChunk(opfer.key);
                    r._tickChunkSatz();
                    const ab = stand();
                    r._rebuildVoxelChunk(cx, cz, opfer.lod, { forceSync: true });
                    const gebaut = s.voxelChunks.get(opfer.key);
                    // der Sync-Bau trägt seine Naht mit der Antwort des Fadens (`boden-ein`, w4-b-boden2)
                    await window.__gebautNach(opfer.key, { fertig: () => !r._weltOffen().chunks });
                    r._tickChunkSatz();
                    const auf = stand();
                    // gestreamt = ein fremder Chunk, dessen Eintrag zwischen vor und auf kam, ging oder getauscht wurde
                    // (Stufe vor → auf, -1 = fehlt); das Opfer selbst, wenn der Ring seinen Wiederaufbau während des
                    // Wartens ersetzte
                    const lodVon = (e) => (e ? (e.empty ? "leer" : e.lod) : -1);
                    const gestreamt = {};
                    for (const k of new Set([...vor.eintrag.keys(), ...auf.eintrag.keys()]))
                        if (k === opfer.key ? auf.eintrag.get(k) !== gebaut : vor.eintrag.get(k) !== auf.eintrag.get(k))
                            gestreamt[k] = [lodVon(vor.eintrag.get(k)), lodVon(auf.eintrag.get(k))];
                    const kinder = { ab: kinderVon(vor, ab), auf: kinderVon(vor, auf) };
                    for (const x of [vor, ab, auf]) {
                        delete x.eintrag;
                        delete x.kl;
                    }
                    res.konsum = { opfer: opfer.key, lod: opfer.lod, vor, ab, auf, gestreamt, kinder };
                }
            }
            // (i) WACHSEN (stadt-takt2): ein Satz, der wächst, tauscht an SEINER Geometrie nur den Puffer, dessen Kapazität
            // wächst — wachsen die Vertices, bleibt der Index derselbe Puffer, wächst der Index, bleibt jede Vertex-Spalte.
            // Bis stadt-takt2 legte jedes Wachsen eine frische Geometrie mit ALLEN Puffern an (headless, stadt-voll gehend:
            // 17,5 ms je Spitzen-Takt in `_chunkSatzGeometrie`, 15,7 ms im Hochladen; der Bau-Satz trug je Index-Wachsen
            // ~42 MiB Vertex-Spalten mit). Probe am kleinsten Satz des Rings (der Tausch ist EIN Weg für jeden Satz): doppelte
            // Index-Kapazität — der Index neu, jede Vertex-Spalte dieselbe, dieselbe Geometrie am selben Mesh, derselbe Inhalt
            // (das Vertex-Wachsen samt Views fährt (k)). Am Kopf vor stadt-takt2 fällt sie rot (die frische Geometrie je
            // Wachsen): ihr Täter-Beleg. Die EINE Geometrie je Satz trägt sie — (f) und (k) prüfen die Bindung nicht mehr.
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
                    altBereiche = ws.bloecke.size,
                    altSpalte = ws.geom.attributes.position,
                    altIndex = ws.geom.index;
                r._chunkSatzGeometrie(ws, ws.vKap, ws.iKap * 2);
                r._tickChunkSatz();
                const ab = abschnitteVon(ws);
                res.wachsen = {
                    satz: wsName,
                    derselbe: ws.mesh === altMesh && ws.mesh.parent === s.scene && ws.mesh.geometry === altGeom,
                    getauscht: ws.geom.index !== altIndex && ws.geom.attributes.position === altSpalte,
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
            // drei Kaskaden verschiedener Weite (Ring, 400 m, 120 m) — sie muss je Frame neu schreiben.
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
            // DIE RUHE-FRIST DES VERDICHTENS LIEGT VOR DER MESSUNG (laub-messer): ein Satz über seinem Ziel schrumpft nach
            // `ruheTakte` Takten (`_chunkSatzVerdichten`) und jeder Pass legt danach seinen Abschnitt neu — eine Änderung, keine
            // Ruhe. Die Frist zählt die Takte des Loops VOR der Probe (die Null-Welt kennt nur den Abschnitt des Hauptbilds,
            // ihre Sätze stehen über dem Ziel): wann sie abläuft, hing an der Wanduhr des Läufers. Vorprüfung 00520c2e (CI):
            // „ruhe, Frame 3: formationenSatz: k0 · k1 schrieb seinen Abschnitt — 5276 B“ — dieselbe Zeile byte-gleich, wenn
            // die Frist des kleinsten Fels-Satzes im dritten Frame abläuft (Gegen-Probe am Kopf); lokal am Vor-Kopf 6113b27e
            // und am Kopf „druck: bodenSatz haupt · k0 · k1“ in 1 von 6 und 1 von 4 Läufen. Die Probe lässt jede offene Frist
            // JETZT ablaufen (der Satz schrumpft vor dem ersten Frame, der nicht zählt); im Fenster verdichtet keiner.
            const ruheT = r.constructor.CHUNK_SATZ_ABSCHNITT.ruheTakte;
            const fristAb = () => {
                for (const x of s.chunkSaetze.values()) if (x.ueberSeit >= 0) x.ueberSeit = x.takt - ruheT;
                r._tickChunkSatz();
            };
            const verdichtet = () => [...s.chunkSaetze.values()].reduce((a, x) => a + (x.verdichtet || 0), 0);
            fristAb();
            let v0 = verdichtet();
            res.neu.messung.ruhe = phase(eng, 5);
            res.neu.verdichtet = verdichtet() - v0;
            fristAb();
            // der Druck braucht die volle Last: seit der Höhlen-Sicht tragen die Ring-Kaskaden nur, was ein Empfänger
            // braucht, und der Index reichte — am Exemplar zeichnet hier jede Höhlen-Zelle (die Methode des Stamms bleibt)
            const vollSicht = function (satz) {
                const st = ++satz.hoehle.stempel;
                for (const b of satz.bloecke.values()) if (b.hoehle) for (const kn of b.hoehle.knoten) kn.sicht = st;
            };
            r._hoehlenSicht = vollSicht;
            // die Kapazität ERZWUNGEN klein: der Index des Boden-Satzes trägt genau die liegenden Abschnitte — zwei
            // Ring-Kaskaden brauchen mehr, gleich wie gross der Ring gerade ist (der Druck hing am Inhalt: mit den Boden-Stufen
            // reichte der Start-Index für beide Ring-Kaskaden, 0× gewachsen)
            const bodenS = s.chunkSaetze.get("boden");
            if (bodenS) r._chunkSatzGeometrie(bodenS, bodenS.vKap, bodenS.iEnde);
            let w0 = wachseSumme();
            v0 = verdichtet();
            try {
                res.neu.messung.druck = phase([ring, ring], 5);
            } finally {
                delete r._hoehlenSicht;
            }
            res.neu.verdichtet += verdichtet() - v0;
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
            // der Selbsttest: die alte Verdrängung (am Exemplar, die Methode des Stamms bleibt), drei Kaskaden (Ring, 400 m, 120 m)
            // DER DRUCK IST ERZWUNGEN, nie geliehen (landmarken-geologie-3): die alte Regel verdrängt erst, wenn der INHALT
            // der Abschnitte samt dem neuen den Index sprengt — bis hier trug den Druck der Formations-Satz der Landmarken am
            // Gürtel (main: 14 Felsbögen + 13 Felstürme aus dem alten Streu-Satz, Frame 2 k0 49 920 B · k1 103 680 B); seit
            // die Landmarken der Geologie folgen, steht dort keine, „die Wand ist vakuös“ (CI Kopf 2, voll 18/18). Die Bühne
            // trägt ihren Druck selbst, im Boden-Satz, der in jeder Welt steht:
            // (1) der Index trägt genau die Abschnitte der Drehung (ihr Hochwasser vergessen, dicht gelegt);
            // (2) die volle Last wie im Druck — die Kaskaden wählen sonst nur, was ein Empfänger des Hauptbilds braucht
            //     (`_hoehlenSichtLicht`), und der Ring trug nicht mehr als die Drehung;
            // (3) drei Kaskaden VERSCHIEDENER Weite — drei gleiche Ringe wählen dieselben Zellen, ein verdrängter Abschnitt
            //     landet auf seinen eigenen Bytes, und `_satzSetze` lädt nichts (am Kopf gemessen: Frame 2–4 je 0 B);
            // (4) die alte Regel maß die Kapazität an der LETZTEN Länge (vor dem Hochwasser, Befund 06.10.): der verdrängte
            //     Abschnitt fällt mit ihr, das Wachsen des Gesetzes rettet ihn nicht (sonst wuchs der Index in Frame 1 auf alle
            //     drei, und keiner zog je wieder um).
            const bodenA = s.chunkSaetze.get("boden");
            if (bodenA) {
                for (const a of bodenA.abschnitte.values()) a.hoch = a.n;
                r._chunkSatzUmlegen(bodenA, null, 0, "haupt");
                r._chunkSatzGeometrie(bodenA, bodenA.vKap, bodenA.iEnde);
            }
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
                            a.hoch = 0;
                        }
                return P._chunkSatzUmlegen.call(this, satz, neu, kapNeu, wer);
            };
            r._hoehlenSicht = vollSicht;
            try {
                res.neu.alt = phase([ring, eng[1], eng[0]], 4);
            } finally {
                delete r._chunkSatzUmlegen;
                delete r._hoehlenSicht;
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
                    derselbe: ls.mesh === mesh0,
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
                let treu = true;
                for (const b of bs.bloecke.values()) treu = treu && bereichTreu(bs, b);
                const o = {
                    gross,
                    vorFrist,
                    nach,
                    inhalt,
                    ziel: Math.max(VD.vMin, Math.ceil(inhalt * VD.luft)),
                    frei: bs.vFrei.length,
                    derselbe: bs.mesh === mesh0,
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
                        o.push(v !== null ? v : NaN);
                    }
                return o;
            };
            const gang = async (dx, n, ohne) => {
                const sprung = [];
                const alle = [];
                let offen = 0;
                if (ohne) r._stufeGewicht = () => 0;
                // (p) DIE FOLGE DES WECHSELS: je Neubau morpht der Faden die Nachbarn, die ihn lesen (`boden-ein`, seine
                // Antwort nennt sie: `folge`, w4-b-boden2) — ein Nachbar, der den Chunk nicht liest (weder seine neue noch seine
                // alte Stufe ist gröber als die des Nachbarn), ist ein LEER-Morph. Die Stufen der Nachbarn zählen, wie der Eintritt
                // sie sah (der Faden spiegelt den Ring in der Reihe seiner Wechsel). Der Selbsttest (`ohne`) fährt die Lawine bis
                // K51-3 nach: jeder Neubau bittet alle acht.
                const folge = { neubau: 0, morphs: 0, leer: 0 };
                const [E0, A0, ctx] = [r._bodenEin, r._bodenAntwort, new Map()];
                r._bodenEin = function (cx, cz, entry, alt) {
                    const nb = {}; // je Chunk des 3×3 seine Stufe, wie der Eintritt ihn sah (−1: keiner)
                    for (let i = 0; i < 9; i++) {
                        const k = cx + (i % 3) - 1 + "," + (cz + ((i / 3) | 0) - 1);
                        nb[k] = s.voxelChunks.get(k)?.mesh ? s.voxelChunks.get(k).lod || 0 : -1;
                    }
                    ctx.set(cx + "," + cz, { lod: entry.lod || 0, alt, nb });
                    folge.neubau++;
                    return E0.call(this, cx, cz, entry, alt);
                };
                r._bodenAntwort = function (msg) {
                    const c = ctx.get(msg.key);
                    for (const k of !c ? [] : ohne ? Object.keys(c.nb).filter((k) => c.nb[k] >= 0) : msg.folge || []) {
                        folge.morphs++;
                        if (!(c.lod > c.nb[k] || (c.alt !== null && c.alt > c.nb[k]))) folge.leer++;
                    }
                    return A0.call(this, msg);
                };
                try {
                    const p = { x: s.stufeAuge.x, y: 0, z: s.stufeAuge.z };
                    for (let i = 0; i < n; i++) {
                        p.x += dx;
                        // das EINE Auge wandert (`_lodAuge`: die Kamera, wo das Rig sie setzt) — der Strom wählt die Stufe an ihm
                        s.camera.position.set(p.x, s.camera.position.y, p.z);
                        s.camera.updateMatrixWorld(true);
                        r._stufeAugeTakt(p);
                        const vor = new Map();
                        for (const [key, e] of s.voxelChunks) {
                            if (!e || e.empty || !e.mesh) continue;
                            const [cx, cz] = key.split(",").map(Number);
                            const soll = r._voxelChunkLodFor(cx, cz, p.x, p.z, e.lod || 0);
                            if (soll !== (e.lod || 0)) vor.set(key, { soll, K: karte(e, key) });
                        }
                        for (const weiter = __deckel("die Soll-Stufen der Chunks", 1400); weiter(); ) {
                            r._tickVoxelChunkStreaming(p);
                            r._tickMorphFolge(); // die Nähte des Fadens wie im Takt
                            await sleep(15);
                            // fertig: jede Stufe gewechselt und jede Naht des Fadens angelegt (`_weltOffen().chunks`)
                            let fertig = !r._weltOffen().chunks;
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
                            ds.sort(aufsteigend);
                            if (!ds.length) continue;
                            for (const d of ds) alle.push(d);
                            sprung.push({
                                key,
                                von: v.K.lod,
                                zu: v.soll,
                                schritt: i,
                                max: +ds[ds.length - 1].toFixed(3),
                                p95: +rang(ds, 0.95).toFixed(3),
                                n: ds.length,
                            });
                        }
                    }
                } finally {
                    delete r._stufeGewicht;
                    delete r._bodenEin;
                    delete r._bodenAntwort;
                }
                sprung.sort((a, b) => b.max - a.max);
                const p95 = sprung.map((x) => x.p95).sort((a, b) => b - a);
                alle.sort(aufsteigend);
                const q = (p) =>
                    alle.length ? +rang(alle, p).toFixed(3) : 0;
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
        out = { error: fehlerText(e) };
    }
    await seiteZu(browser, server, out);
    const z = out.zensus;
    console.log(
        `\n  Zensus: ${out.chunks} Chunks · Boden ${z.boden.objekte} Objekte (${z.boden.tris} Dreiecke) · Wasser ${z.wasser.objekte}` +
            ` · Nah-Streu ${Object.values(z.streuNah).reduce(addiere, 0)} selbst zeichnend, ` +
            `${z.streuBestand.treu}/${z.streuBestand.bloecke} Blöcke treu im Bestand ihrer Familie` +
            ` · Fern ${Object.values(z.fern).reduce(addiere, 0)} · Deck ${z.deck} · @p:-Gruppen ${z.pGruppen.length}` +
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
        "(c) STREU-BESTAND — die Nah-Streu lebt (Blöcke im Ring), jeder Block mit Pflanzen treu im Bestand seiner Familie, kein Streu-Satz",
        z.streuBestand.bloecke > 0 && z.streuBestand.treu === z.streuBestand.bloecke && z.streuBestand.saetze.length === 0,
        `${z.streuBestand.treu}/${z.streuBestand.bloecke}${z.streuBestand.untreu.length ? " — " + z.streuBestand.untreu.slice(0, 3).join(", ") : ""}`
    );
    check(
        "(c) … je Senke der Nah-Streu eine treue Block-Tabelle (Σ n ≤ Plätze, je Block Identitäten, Matrizen, Fuß und Weite), jeder Block einer lebenden Kachel",
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
    const vk = urteilKonsum(k);
    const zeile = konsumZeile(k);
    const vAb = vk.filter((x) => !x.startsWith("WIEDERAUFBAU"));
    const vAuf = vk.filter((x) => !x.startsWith("ABBAU"));
    check(
        "(e) KONSUM — Chunk-Abbau nimmt dem Satz die Bereiche des Opfers, nicht der Szene ein Kind",
        vAb.length === 0,
        (vAb.length ? vAb.join(" · ") + " — " : "") + zeile
    );
    check(
        "(e) KONSUM — das Opfer kehrt in den Satz zurück (seine Bereiche mit denselben Indizes und Vertices, kein Szenen-Kind außer Wesen; fremder Strom und Wesen beim Namen)",
        vAuf.length === 0,
        (vAuf.length ? vAuf.join(" · ") + " — " : "") + zeile
    );
    const wa = out.wachsen;
    check(
        "(i) WACHSEN — ein wachsender Satz tauscht an seiner Geometrie nur den wachsenden Puffer (der r184-Hörer fällt im Register), derselbe Inhalt",
        !!wa && wa.derselbe && wa.getauscht && wa.inhalt && out.tauschSicher === true,
        JSON.stringify(Object.assign({ tauschSicher: out.tauschSicher }, wa || {}))
    );
    const nu = out.neu;
    if (nu) {
        const bytesJeFrame = (frames) =>
            frames
                .slice(1)
                .map((d) => Object.values(d).reduce(addiere, 0))
                .join("/");
        const vNeu = urteilNeu(nu.messung);
        check(
            "(j) NEUSCHREIBEN — kein Pass schreibt in Ruhe, kein Pass den Abschnitt eines anderen (Bytes je Frame nach dem ersten)",
            vNeu.length === 0 && nu.verdichtet === 0,
            (nu.verdichtet ? `im Mess-Fenster verdichtet ${nu.verdichtet}× (die Ruhe-Frist lief in die Messung) · ` : "") +
                (vNeu.slice(0, 3).join(" · ") ||
                    `ruhe ${bytesJeFrame(nu.messung.ruhe)} B · druck ${bytesJeFrame(nu.messung.druck)} B · Boden ${JSON.stringify(nu.boden)}`)
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
            "(j) Selbsttest: die alte Verdrängung (drei Kaskaden: Ring, 400 m, 120 m) schreibt je Frame neu — die Wand nennt sie",
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
    wandEnde(errs, "der Ring zeichnet je Material EINEN Satz; ein Chunk ist ein Bereich im Puffer, kein Szenen-Objekt.");
})();
