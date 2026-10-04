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
//       Anfang verschoben), die Index-Blöcke liegen nah → fern;
//   (g) kein Page-Error.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): ein Zensus mit einem `voxelChunk:0,0:lod0`
// direkt in der Szene, einer Gruppe `x#0@p:0,0`, einem zweiten `streuNah` derselben Senke und einer Fern-Deko MUSS rot
// fallen und jeden Täter mit Namen und Zahl nennen — eine Wand, die hier nicht feuert, ist selbst rot.
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
    const streuSumme = Object.values(z.streuNah).reduce((a, b) => a + b, 0);
    if (streuSumme > z.senken)
        v.push(`STREU: ${streuSumme} Nah-Streu-InstancedMeshes (Soll ≤ ${z.senken} Senken)`);
    if (z.deck > 0) v.push(`STREU: ${z.deck} Deck-Streu-InstancedMeshes (gefallen, Soll 0)`);
    const fernSumme = Object.values(z.fern).reduce((a, b) => a + b, 0);
    if (fernSumme > 0) v.push(`STREU: ${fernSumme} Fern-Deko-InstancedMeshes (das Kreuz-Fernfeld fiel, Soll 0)`);
    if (z.pGruppen.length > 0)
        v.push(
            `BAU: ${z.pGruppen.length} Instanz-Gruppen mit \`@p:\` im Schlüssel — ${z.pGruppen.slice(0, 4).join(", ")}`
        );
    if (z.pBundles.length > 0)
        v.push(`BAU: ${z.pBundles.length} \`p:\`-Region-Bundles — ${z.pBundles.slice(0, 4).join(", ")}`);
    return v;
}

// Ein grüner Zensus (die Form, die der Lauf liefert) und drei injizierte Täter.
function selbsttest() {
    const gruen = {
        boden: { objekte: 1, namen: ["bodenSatz"] },
        voxelChunkNamen: [],
        wasser: { objekte: 1 },
        streuNah: { "blume:1:L2:0": 1, "farn:2:L1:0": 1 },
        senken: 8,
        deck: 0,
        fern: {},
        pGruppen: [],
        pBundles: [],
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
            name: "die Fern-Deko lebt",
            z: { ...gruen, fern: { blume: 1 } },
            muss: [/STREU: 1 Fern-Deko-InstancedMeshes/],
        },
        {
            name: "Deck-Zwilling lebt",
            z: { ...gruen, deck: 3 },
            muss: [/STREU: 3 Deck-Streu-InstancedMeshes/],
        },
    ];
    for (const f of faelle) {
        const v = urteil(f.z);
        for (const re of f.muss)
            if (!v.some((s) => re.test(s))) fehler.push(`${f.name}: die Wand nennt den Täter nicht (${re})`);
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
            const senkenZahl = s.nahStreu ? s.nahStreu.senken.size : 0;
            const zensus = () => {
                const bodenMat = s.voxelChunkMaterial;
                const z = {
                    boden: { objekte: 0, namen: [], tris: 0 },
                    voxelChunkNamen: [],
                    wasser: { objekte: 0, tris: 0 },
                    streuNah: {},
                    streuInstanzen: 0,
                    senken: senkenZahl,
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
                z.boden.tris = Math.round(z.boden.tris);
                z.wasser.tris = Math.round(z.wasser.tris);
                return z;
            };
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

            // ── (f) TREUE je Satz: jeder Bereich trägt die Arrays seines Chunks byte-gleich (Views), der Index ist um
            // den Bereichs-Anfang verschoben, die Blöcke liegen in der Richtung der Art (Boden nah → fern, Wasser
            // fern → nah). Vorher (kein Satz) ist das unmessbar und fällt benannt rot.
            const lpc = s.lastPlayerVoxelChunk;
            res.saetze = [];
            if (s.chunkSaetze)
                for (const [art, satz] of s.chunkSaetze) {
                    const geo = satz.mesh.geometry;
                    const idx = geo.index.array;
                    let treu = true,
                        geprueft = 0,
                        ordnung = true,
                        letzte = null;
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
                        if (li.length !== b.iAnzahl) treu = false;
                        for (let i = 0; i < li.length && treu; i += 31)
                            if (idx[b.iStart + i] !== li[i] + b.vStart) treu = false;
                        geprueft++;
                        if (lpc) {
                            const d = Math.max(Math.abs(b.cx - lpc.cx), Math.abs(b.cz - lpc.cz));
                            if (letzte !== null && (d - letzte) * satz.spec.richtung < 0) ordnung = false;
                            letzte = d;
                        }
                        if (!treu) break;
                    }
                    res.saetze.push({
                        art,
                        treu,
                        geprueft,
                        ordnung,
                        bereiche: satz.bloecke.size,
                        vEnde: satz.vEnde,
                        vKap: satz.vKap,
                        index: geo.drawRange.count,
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
                        index: satz.mesh.geometry.drawRange.count,
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
            `\n  Bau: ${z.bau.gruppen} Gruppen (${z.bau.werfer} werfen) · Glut ${z.bau.glut} (${z.bau.glutWerfer} werfen)\n`
    );
    for (const x of out.saetze || [])
        console.log(
            `  Satz ${x.art}: ${x.bereiche} Bereiche · ${x.vEnde}/${x.vKap} Vertices · ${x.index}/${x.iKap} Indizes · ` +
                `${x.wachse}× gewachsen`
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
        "(c) STREU-SATZ — je Senke der Nah-Streu eine dichte Block-Tabelle, jeder Block einer lebenden Kachel",
        !!out.streu && out.streu.arten > 0 && out.streu.dicht === true,
        out.streu
            ? `${out.streu.arten} Senken · ${out.streu.bloecke} Blöcke${out.streu.fehler.length ? " — " + out.streu.fehler.join(", ") : ""}`
            : "kein Streu-Satz"
    );
    const saetze = out.saetze || [];
    check(
        "(f) TREUE — jeder Satz-Bereich trägt byte-gleich seinen Chunk (Views, Index verschoben)",
        saetze.length > 0 && saetze.every((x) => x.treu),
        saetze.map((x) => `${x.art} ${x.geprueft}`).join(" · ") || "kein Satz"
    );
    check(
        "(f) die Index-Blöcke liegen in der Richtung der Art (Boden nah → fern, Wasser fern → nah)",
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
    check("(g) kein Page-Error", pageErrors.length === 0, pageErrors[0] || "sauber");
    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — der Ring zeichnet je Material EINEN Satz; ein Chunk ist ein Bereich im Puffer, kein Szenen-Objekt."
    );
})();
