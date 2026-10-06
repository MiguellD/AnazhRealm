#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-chunk-satz.cjs — DER SATZ (Welle B): die Draw-Einheit ist Material × Geometrie über den ganzen
// Ring, nie Chunk × Material. Befund (Inventur der echten GPU, Mess-Wiese −900/−850): der Boden zog
// 78 Chunk-Meshes in JEDEM Pass (234 Befehle), die Klein-Streu je Chunk und Art eine InstancedMesh
// (162), das Wasser je Chunk ein Mesh, die Fern-Deko einen Deck-Zwilling, der platzierte Bau je
// 256-m-Region eine Gruppe je Leaf (`@p:`). Die Wand zählt die Render-Bürger je Klasse direkt im
// Szenen-Baum (Null-Renderer — Bundles sind headless reine Gruppen, die Chunk-Meshes werden gebaut):
//   (a) BODEN — höchstens EIN Objekt trägt das Boden-Material (der Satz, Stitch eingeschlossen),
//       kein `voxelChunk:`-Name lebt im Szenen-Baum;
//   (b) WASSER — höchstens EIN Chunk-Wasser-Objekt (der Satz);
//   (c) STREU — die Nah-Streu (Waldboden 04.10.: Studio-Arten, Kachel-Ring um die Kamera) trägt höchstens EINE
//       InstancedMesh je Senke (Art × Gestalt × Stufe × Teil, ≤ Zahl der Senken), keine Deck-Streu und keine
//       Fern-Deko (beide fielen); je Senke eine dichte Block-Tabelle (lückenlos, Summe = Anzahl = mesh.count, je
//       Block die Ernte-Identitäten), jeder Block gehört einer lebenden Kachel des Rings;
//   (d) BAU — keine Instanz-Gruppe mit `@p:` im Schlüssel, kein `p:`-Region-Bundle;
//   (e) KONSUM — ein Chunk-Abbau und -Wiederaufbau ändert den Satz (Bereiche, Index-Zahl), nie die Zahl
//       der Szenen-Kinder; der Wiederaufbau trifft dieselbe Index-Zahl (deterministisch);
//   (f) TREUE — jeder Satz-Bereich trägt byte-gleich die Arrays seines Chunks (Index um den Bereichs-
//       Anfang verschoben, genau seine Dreiecke als lückenlose Zell-Läufe — Boden/Wasser Viertel, Bau je Instanz); jeder
//       Abschnitt (der Haken des Renders legt ihn) trägt seine Zellen byte-gleich hintereinander, Boden nah → fern;
//   (g) kein Page-Error;
//   (h) BAU-SATZ (Welle 6) — die Draw-Einheit des gesetzten Studio-Baus ist sein STOFF: jede lebende Gruppe einer
//       Satz-Art (`AnazhRealm.BAU_SATZ` je Rezept-kind: Haus, Fels, Kristall, Säulen; ohne Tür-Flügel) hängt an keinem
//       Eltern-Knoten (weder Bundle noch Szene) und lebt als Bereich im Satz ihres Stoffs — n × liveCount Vertices, die
//       erste Instanz in Welt-Lage (Geometrie × Instanz-Matrix), je Instanz eine Zelle. Befund (echte GPU, Mess-Wiese):
//       jede Gestalt zog als eigene Gruppe einen Befehl je Pass — das Dorf 33 (11 Häuser × 3 Stoffe), die Felszacken 34;
//   (i) WACHSEN (Welle 6) — ein wachsender Satz tauscht die Geometrie am SELBEN Mesh (derselbe Inhalt); der Tausch ist
//       sicher, weil `_renderObjektRegister` r184s Geometrie-Hörer herausnimmt (er zerstörte beim verzögerten Entsorgen
//       der alten Geometrie die GPU-Puffer der neuen) — EINE Antwort an der Wurzel, kein frischer Mesh je Wachsen;
//   (j) NEUSCHREIBEN (06.10.) — kein Pass schreibt den Abschnitt eines anderen: die Neuschreib-Linse des Satzes
//       (`s.schreiben`, Index-Bytes je „Verursacher>Abschnitt") zählt über Frames in Ruhe 0 Bytes je Pass, und ein Index,
//       der für Hauptbild + Kaskaden zu klein ist (Kapazität erzwungen klein, Abend mit der Sonne im Rücken), wächst
//       EINMAL statt einander je Frame zu verdrängen — danach 0 Bytes je Frame, fremd wie eigen. Befund (echte GPU,
//       Mess-Wiese, Drehen 1°/Frame): 32 Verdrängungen in 36 Frames, k0 + k1 schrieben einander 2,2 MB je Frame neu.
//   (k) DER LEERE SATZ (Integration W6) — ein Satz ohne Bereich hält seine Kapazität nur bis zur Ruhe-Frist
//       (`ruheTakte`), dann kehrt er am selben Mesh auf seine Start-Kapazität zurück. Befund (echte GPU, Mess-Wiese, drei
//       Wander-Schleifen à 1,2 km): die Bau-Sätze verlassener Dörfer hielten 38,3 MB, die größten ohne einen Bereich.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): ein Zensus mit einem `voxelChunk:0,0:lod0`
// direkt in der Szene, einer Gruppe `x#0@p:0,0`, einem zweiten `streuNah` derselben Senke, einer Fern-Deko, einer
// selbst zeichnenden Satz-Gruppe (`f:zacken:L0`) und einem Haus ohne Bereich MUSS rot fallen und jeden Täter mit
// Namen und Zahl nennen — eine Wand, die hier nicht feuert, ist selbst rot.
//   node scripts/diag-chunk-satz.cjs [--selftest]   (npm run gate:chunk-satz)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

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
    for (const [senke, n] of Object.entries(z.streuNah))
        if (n > 1) v.push(`STREU: ${n} Nah-Streu-InstancedMeshes der Senke ${senke} (Soll ≤ 1 je Senke)`);
    // Eine Streu-InstancedMesh, die keiner Senke gehört (eine alte Senken-Mesh nach dem Wachsen, ein Host-Bauer), ist
    // eine Waise — sie zeichnet ohne Block-Tabelle (Integration 05.10.: die Schranke `Summe ≤ Senken` las dieselbe
    // Map, aus der sie zählte, und sah unsichtbare Senken als Platz).
    if (z.waisen > 0) v.push(`STREU: ${z.waisen} Nah-Streu-InstancedMeshes ohne Senke (Waisen, Soll 0)`);
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
        streuNah: { "blume:1:L2:0": 1, "farn:2:L1:0": 1 },
        waisen: 0,
        deck: 0,
        fern: {},
        pGruppen: [],
        pBundles: [],
        bauSatz: { gruppen: 3, imSatz: 3, selbst: [], ohneBereich: [] },
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
            name: "zweites streuNah derselben Senke",
            z: { ...gruen, streuNah: { "blume:1:L2:0": 2, "farn:2:L1:0": 1 } },
            muss: [/STREU: 2 Nah-Streu-InstancedMeshes der Senke blume:1:L2:0/],
        },
        {
            name: "eine Waise ohne Senke",
            z: { ...gruen, waisen: 1 },
            muss: [/STREU: 1 Nah-Streu-InstancedMeshes ohne Senke/],
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
    ];
    for (const f of faelle) {
        const v = urteil(f.z);
        for (const re of f.muss)
            if (!v.some((s) => re.test(s))) fehler.push(`${f.name}: die Wand nennt den Täter nicht (${re})`);
        console.log(`  ${v.length ? "✅" : "❌"} Selbsttest „${f.name}" → rot: ${v.join(" · ") || "(nichts)"}`);
    }
    // (j) die Neuschreib-Wand: Ruhe ist grün; die alte Verdrängung (die Kaskaden schreiben einander je Frame neu, gemessen
    // 06.10. an der Mess-Wiese) und ein fremder Umzug fallen rot, beim Namen.
    const neuGruen = { ruhe: [{ "haupt>haupt": 1335096, "k0>k0": 1758984 }, {}, {}], druck: [{ "k1>k1": 4096 }, {}] };
    if (urteilNeu(neuGruen).length !== 0)
        fehler.push("die ruhige Messung fällt rot: " + urteilNeu(neuGruen).join(" · "));
    const neuFaelle = [
        {
            name: "die Kaskaden verdrängen einander je Frame",
            m: { druck: [{ "k0>k0": 1758984 }, { "k1>k1": 1090140 }, { "k0>k0": 1758984 }] },
            muss: [/NEUSCHREIBEN \(druck, Frame 2\): k1 schrieb seinen Abschnitt — 1090140 B/, /Frame 3\): k0 schrieb/],
        },
        {
            name: "ein Schatten-Pass schreibt den Abschnitt eines anderen",
            m: { ruhe: [{}, { "k1>k0": 4096 }] },
            muss: [/NEUSCHREIBEN \(ruhe, Frame 2\): k1 schrieb den Abschnitt von k0 — 4096 B/],
        },
    ];
    for (const f of neuFaelle) {
        const v = urteilNeu(f.m);
        for (const re of f.muss)
            if (!v.some((x) => re.test(x))) fehler.push(`${f.name}: die Neuschreib-Wand nennt den Täter nicht (${re})`);
        console.log(`  ${v.length ? "✅" : "❌"} Selbsttest „${f.name}" → rot: ${v.join(" · ") || "(nichts)"}`);
    }
    if (fehler.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist vakuös: " + fehler.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — jeder injizierte Täter fällt rot und wird beim Namen genannt.");
}

if (process.argv.includes("--selftest")) {
    console.log("=== CHUNK-SATZ — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.CHUNK_SATZ_PORT) || 4483;
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

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

(async () => {
    console.log("=== CHUNK-SATZ (Welle B) — Null-Renderer, die Render-Bürger je Klasse ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(280000);
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
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        out = await page.evaluate(async () => {
            const r = window.anazhRealm,
                s = r.state;
            const res = {};
            const pause = () => new Promise((ok) => setTimeout(ok, 0));
            // Einschwingen: der Ring steht (Chunk-Zahl stabil), dann Streu, Wasser und Fern-Deko austreiben.
            let lastSize = -1,
                stable = 0,
                ticks = 0;
            while (ticks < 4000) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                ticks++;
                const sz = s.voxelChunks ? s.voxelChunks.size : 0;
                if (sz === lastSize) stable++;
                else {
                    stable = 0;
                    lastSize = sz;
                }
                if (sz > 20 && stable > 60) break;
                if (ticks % 10 === 0) await pause();
            }
            for (let i = 0; i < 60; i++) if (!r._tickPendingWaterIso(8)) break;
            // Die Nah-Streu: der Kachel-Ring um die Kamera, bis Studio-Teile ankommen und nichts mehr offen ist.
            for (let i = 0; i < 900; i++) {
                r._tickNahStreu();
                const ns = s.nahStreu;
                if (ns && ns.senken.size > 0 && ns.offen === 0) break;
                await new Promise((ok) => setTimeout(ok, 100));
            }
            for (let i = 0; i < 30; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (i % 10 === 0) await pause();
            }
            r._tickChunkSatz();

            // ── DER ZENSUS: Render-Bürger je Klasse im Szenen-Baum (Bundles eingeschlossen).
            const zensus = () => {
                const senkenMeshes = new Set(s.nahStreu ? [...s.nahStreu.senken.values()].map((a) => a.mesh) : []);
                const bodenMat = s.voxelChunkMaterial;
                const z = {
                    boden: { objekte: 0, namen: [], tris: 0 },
                    voxelChunkNamen: [],
                    wasser: { objekte: 0, tris: 0 },
                    streuNah: {},
                    streuInstanzen: 0,
                    waisen: 0,
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
                    if (u.inventar === "streu-klein") {
                        const a = artVon(o);
                        z.streuNah[a] = (z.streuNah[a] || 0) + 1;
                        z.streuInstanzen += o.count;
                        if (!senkenMeshes.has(o)) z.waisen++;
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
                        if (/^glut_var/.test(k)) {
                            z.bau.glut++;
                            if (g.mesh.castShadow) z.bau.glutWerfer++;
                        }
                    }
                if (s._regionBundles)
                    for (const k of s._regionBundles.keys()) if (String(k).startsWith("p:")) z.pBundles.push(k);
                // (h) DER BAU-SATZ: jede lebende Gruppe einer Satz-Art (Rezept-kind in BAU_SATZ, gesetzt, kein
                // Tür-Flügel) zeichnet nie selbst und trägt ihren Bereich treu im Satz ihres Stoffs.
                z.bauSatz = { gruppen: 0, imSatz: 0, selbst: [], ohneBereich: [] };
                const buch = r._foundry && r._foundry.recipes ? r._foundry.recipes : {};
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
                        let treu = !!b && b.vAnzahl === n * g.liveCount && satz.mesh.name === SATZ[rec.kind];
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
                    }
                z.boden.tris = Math.round(z.boden.tris);
                z.wasser.tris = Math.round(z.wasser.tris);
                return z;
            };
            // der Haken des Renders (Hauptbild): der Satz legt seinen Abschnitt — der Zensus zählt, was das Hauptbild zeichnet
            r._passSicht(s.camera, false);
            r._passSicht(s.camera, true);
            res.zensus = zensus();
            let chunks = 0;
            for (const e of s.voxelChunks.values()) if (e && !e.empty && e.mesh) chunks++;
            res.chunks = chunks;

            // ── (c) DER STREU-SATZ: je Senke ist die Block-Tabelle dicht (lückenlos in Puffer-Ordnung, Summe = Anzahl
            // = mesh.count, je Block die Ernte-Identitäten) und jeder Block gehört einer lebenden Kachel des Rings.
            res.streu = { arten: 0, bloecke: 0, dicht: true, fehler: [] };
            const ns = s.nahStreu;
            if (ns)
                for (const [name, a] of ns.senken) {
                    res.streu.arten++;
                    let pos = 0;
                    for (const kk of a.ordnung) {
                        const b = a.bloecke.get(kk);
                        const k = ns.kacheln.get(kk);
                        if (!b || b.start !== pos || b.ids.length !== b.n || !k || !k.senken.has(name)) {
                            res.streu.dicht = false;
                            if (res.streu.fehler.length < 4) res.streu.fehler.push(name + "@" + kk);
                        }
                        pos += b ? b.n : 0;
                        res.streu.bloecke++;
                    }
                    if (pos !== a.anzahl || a.mesh.count !== a.anzahl) {
                        res.streu.dicht = false;
                        if (res.streu.fehler.length < 4)
                            res.streu.fehler.push(`${name}: ${pos}/${a.anzahl}/${a.mesh.count}`);
                    }
                }

            // ── (f) TREUE je Satz: jeder Bereich trägt die Arrays seines Chunks byte-gleich (Views); sein Index (um den
            // Bereichs-Anfang verschoben) trägt genau die Dreiecke des Chunks, als Viertel-Läufe hintereinander (die
            // Viertel decken ihn lückenlos); jeder Abschnitt eines Passes (hier: das Hauptbild, wie der Haken des Renders
            // ihn legt) trägt seine Viertel byte-gleich hintereinander und in der Richtung der Art (Boden nah → fern,
            // Wasser fern → nah). Vorher (kein Satz) ist das unmessbar und fällt benannt rot.
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
            res.saetze = [];
            if (s.chunkSaetze)
                for (const [art, satz] of s.chunkSaetze) {
                    const geo = satz.mesh.geometry;
                    let treu = satz.geom === geo,
                        geprueft = 0;
                    for (const b of satz.ordnung) {
                        if (satz.bloecke.get(b.key) !== b) {
                            treu = false;
                            break;
                        }
                        const g = b.geom;
                        for (const a of satz.attrNamen) {
                            const src = g.attributes[a].array;
                            const dst = geo.attributes[a].array;
                            const is = geo.attributes[a].itemSize;
                            if (src.length !== b.vAnzahl * is || src.buffer !== dst.buffer) treu = false;
                            for (let i = 0; i < src.length && treu; i += 97)
                                if (src[i] !== dst[b.vStart * is + i]) treu = false;
                        }
                        const li = g.index.array;
                        if (li.length !== b.iAnzahl || b.idx.length !== b.iAnzahl) treu = false;
                        if (treu && mengeVon(li, b.vStart) !== mengeVon(b.idx, 0)) treu = false;
                        // die Viertel: Läufe hintereinander, lückenlos über den Bereichs-Index
                        let o = 0;
                        for (const z of b.zellen) {
                            if (z.bereich !== b || z.idx.buffer !== b.idx.buffer || z.idx.byteOffset !== o * 4)
                                treu = false;
                            o += z.idx.length;
                        }
                        if (o !== b.iAnzahl) treu = false;
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
            // Absenz am Code (Kommentare bereinigt): der Boden geht durch den Satz, der platzierte Bau trägt
            // keine Region.
            const code = (f) => (typeof f === "function" ? window.__codeOf(f) : "");
            res.bodenDurchSatz = /_chunkSatzEin\(\s*"boden"/.test(code(r._finalizeVoxelChunkBuild));
            res.stitchDurchSatz = /_chunkSatzEin\(\s*"boden"/.test(code(r._rebuildLodStitchBand));
            res.wasserDurchSatz = /_chunkSatzEin\(\s*"wasser"/.test(code(r._finalizeWaterSheetMesh));
            res.bauOhneRegion = !/"p:"/.test(code(r._archPlacedRegionKey));
            // (i) WACHSEN (Welle 6): ein Satz, der wächst, tauscht die Geometrie am SELBEN Mesh — r184 hängt den
            // Entsorgungs-Hörer einer Geometrie an ihr erstes Render-Objekt und liest dessen Attribute erst beim Entsorgen;
            // eine getauschte Geometrie verlor so ihre GPU-Puffer (echte GPU: „Vertex buffer slot 5 … was not set"). Die
            // Wurzel: `_renderObjektRegister` nimmt den Hörer je Geometrie heraus (der Kehraus trägt die Residenz). Probe
            // am Wasser-Satz: doppelte Kapazität, derselbe Inhalt, derselbe Mesh.
            res.wachsen = null;
            const ws = s.chunkSaetze ? s.chunkSaetze.get("wasser") : null;
            if (ws) {
                const altMesh = ws.mesh,
                    altGeom = ws.geom,
                    altIdx = ws.iSumme,
                    altBereiche = ws.bloecke.size;
                r._chunkSatzGeometrie(ws, ws.vKap * 2, ws.iKap);
                r._tickChunkSatz();
                const ab = abschnitteVon(ws);
                res.wachsen = {
                    derselbe: ws.mesh === altMesh && ws.mesh.parent === s.scene,
                    getauscht: ws.geom !== altGeom && ws.mesh.geometry === ws.geom,
                    inhalt: ws.iSumme === altIdx && ws.bloecke.size === altBereiche && ab.treu && !ab.ueberlapp,
                };
            }
            // Absenz am Code: der Tausch steht im Satz, der Hörer fällt im Register (EINE Antwort, kein frischer Mesh).
            res.tauschSicher =
                /\.mesh\.geometry\s*=/.test(code(r._chunkSatzGeometrie)) &&
                !/_chunkSatzMesh\(/.test(code(r._chunkSatzGeometrie)) &&
                /_geometryDisposeListeners\.delete\(/.test(code(r._renderObjektRegister));
            // (j) NEUSCHREIBEN (06.10.): kein Pass schreibt in Ruhe, und ein Index, der für Hauptbild + Kaskaden zu klein
            // ist, wächst EINMAL, statt dass die Kaskaden einander je Frame verdrängen. Die Kaskaden-Pässe fahren den EINEN
            // Chokepoint `_chunkSatzPass` mit Stellvertreter-Ortho-Kameras über dem Spieler: „ruhe" = enge Boxen
            // (k0 ±120 m, k1 ±400 m), „druck" = beide über den ganzen Ring (der Abend mit der Sonne im Rücken trägt fast den
            // Ring); gemessen je Frame die Bytes der Neuschreib-Linse aller Sätze (`s.schreiben`). Der Selbsttest „alt" fährt
            // die alte Regel (reicht der Index nicht, verdrängt der Umzug jeden anderen Abschnitt außer dem Hauptbild) mit
            // drei Ring-Kaskaden — sie muss je Frame neu schreiben.
            const T = window.THREE;
            const ppos = s.playerMesh.position;
            const ortho = (halb) => {
                const c = new T.OrthographicCamera(-halb, halb, halb, -halb, 0, 1600);
                c.position.set(ppos.x, ppos.y + 800, ppos.z + 1);
                c.lookAt(ppos.x, ppos.y, ppos.z);
                c.updateMatrixWorld(true);
                const m = new T.Matrix4().multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse);
                // die Pass-Kamera und ihre Matrix reisen mit dem Frustum (die Höhlen-Sicht, Welle 7, liest `S.m` und die
                // Drehung der Kamera)
                return { F: new T.Frustum().setFromProjectionMatrix(m, c.coordinateSystem), m, c };
            };
            const S = r._kaskadenSchmier();
            const frame = (frusta) => {
                r._tickChunkSatz();
                r._passSicht(s.camera, false);
                frusta.forEach((o, i) => {
                    S.frustum.copy(o.F);
                    S.m.copy(o.m);
                    r._chunkSatzPass(o.c, false, i, S);
                    r._chunkSatzPass(o.c, true, -1, S);
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
            // der Druck braucht die volle Last: seit der Höhlen-Sicht (Welle 7) tragen die Ring-Kaskaden nur, was ein Empfänger
            // braucht, und der Index reichte — am Exemplar zeichnet hier jede Höhlen-Zelle (die Methode des Stamms bleibt)
            r._hoehlenSicht = function (satz) {
                const st = ++satz.hoehle.stempel;
                for (const b of satz.bloecke.values()) if (b.hoehle) for (const kn of b.hoehle.knoten) kn.sicht = st;
            };
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
                const m = new T.Matrix4().multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse);
                return { F: new T.Frustum().setFromProjectionMatrix(m, c.coordinateSystem), m, c };
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
            // (k) DER LEERE SATZ (Integration W6): ein Satz ohne Bereich kehrt nach der Ruhe-Frist (`ruheTakte`) auf seine
            // Start-Kapazität zurück, am SELBEN Mesh — die Bau-Sätze verlassener Dörfer hielten nach drei Wander-Schleifen
            // 38,3 MB (echte GPU, Mess-Wiese). Probe an einem eigenen Bau-Satz des Gates: gewachsen, ohne Bereich.
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
                for (let i = 0; i <= r.constructor.CHUNK_SATZ_ABSCHNITT.ruheTakte; i++) r._tickChunkSatz();
                const vorFrist = [ls.vKap, ls.iKap];
                r._tickChunkSatz();
                r._tickChunkSatz();
                res.leer = {
                    gross,
                    vorFrist,
                    nach: [ls.vKap, ls.iKap],
                    start: [C.v, C.i],
                    derselbe: ls.mesh === mesh0 && ls.mesh.geometry === ls.geom,
                };
                s.scene.remove(ls.mesh);
                s.chunkSaetze.delete(art);
                s.satzStoffe.delete(art);
            }
            return res;
        });
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
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
            ` · Nah-Streu ${Object.values(z.streuNah).reduce((a, b) => a + b, 0)} Meshes (${z.streuInstanzen} Instanzen)` +
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
    const v = urteil(z);
    check(
        "(a–d) die Draw-Einheit ist Material × Geometrie (Boden · Wasser · Streu · Bau)",
        v.length === 0,
        v.join(" · ") || "sauber"
    );
    check("(a) der Boden lebt im Satz (Ring trägt Chunks)", out.satzDa && out.chunks > 20, `${out.chunks} Chunks`);
    check(
        "(h) BAU-SATZ — der gesetzte Studio-Bau lebt (Satz-Arten im Ring), jede Gruppe als Bereich im Satz ihres Stoffs",
        z.bauSatz.gruppen > 0 && z.bauSatz.imSatz === z.bauSatz.gruppen,
        `${z.bauSatz.imSatz}/${z.bauSatz.gruppen}`
    );
    check(
        "(c) STREU-SATZ — je Senke der Nah-Streu eine dichte Block-Tabelle, jeder Block einer lebenden Kachel",
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
    check(
        "Absenz am Code — Boden · Stitch · Wasser gehen durch _chunkSatzEin, der platzierte Bau trägt kein p:",
        out.bodenDurchSatz && out.stitchDurchSatz && out.wasserDurchSatz && out.bauOhneRegion,
        JSON.stringify({
            boden: out.bodenDurchSatz,
            stitch: out.stitchDurchSatz,
            wasser: out.wasserDurchSatz,
            bau: out.bauOhneRegion,
        })
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
        "(k) DER LEERE SATZ — ohne Bereich hält er seine Kapazität bis zur Ruhe-Frist, danach kehrt er auf die Start-Kapazität zurück (derselbe Mesh)",
        !!le &&
            le.vorFrist[0] === le.gross[0] &&
            le.vorFrist[1] === le.gross[1] &&
            le.nach[0] === le.start[0] &&
            le.nach[1] === le.start[1] &&
            le.gross[0] > le.start[0] &&
            le.derselbe === true,
        JSON.stringify(le)
    );
    check("(g) kein Page-Error", pageErrors.length === 0, pageErrors[0] || "sauber");
    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — der Ring zeichnet je Material EINEN Satz; ein Chunk ist ein Bereich im Puffer, kein Szenen-Objekt."
    );
})();
