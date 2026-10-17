#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-grass-thin.cjs — DIE WIESE IST STUDIO-DEFINIERT (npm run gate:grass-thin, N7.4)
//
// Geschichte: V18.363 baute das Gras-Nach-Dünnen (`_tickGrassThin`) für den Alt-Tuft-Pfad;
// V18.422 entschied „im Studio-Regime dünnt die Wiese NIE" (das Studio-Raster trägt die
// volle Dichte bis zur Sichtkante). N7.4 vollzieht den Abschied: der Alt-Tuft-Bauer
// (`_grassBladeTuftGeometry`) und der Gras-Thin-Tick sind GESCHNITTEN — die Wiese IST das
// Studio-Asset (das P4-Gesetz „wenn kein Gras da ist, ist es so", auf das Gras gehoben).
// Ohne Studio-Pipeline (Test-Hook/Worker-lose Einbettung) wird jede Gras-Zelle bewusst
// gras-los verbucht (Nebel-Front zufrieden, kein Deadlock, KEIN Nachbau).
//
// Diese Linse beweist headless (foundry-off-Welt über den globalen Hook):
//   (a) die Welt baut OHNE Studio → JEDE Gras-Zelle ist bewusst gras-los verbucht
//       (voxelChunkGrass: nur null-Einträge · 0 Halm-Instanzen · Lod-Map gefüllt =
//       die Front ist zufrieden) — und KEIN Page-Error (der Schnitt crasht nirgends);
//   (b) QUELLE (kommentar-bereinigt): kein `_grassBladeTuftGeometry`, kein `_tickGrassThin`,
//       V18.492: der Bau verbucht halm-los (kein InstancedMesh, Pool + Studio-Halm + Stufen-
//       Tick geschnitten), die Halme zeichnet der Terrain-Albedo (`_halmHoch`),
//       der Idle-Pass ruft keinen Gras-Thin mehr.
// Die Boden-Wiese selbst (Parallax-Halme) beweist das Bild (PFLICHT-OFFEN D); der volle
// Playtest prüft ihren Konsum (Boden-Grün → Halm-Gewicht). GPU-frei.
// ─────────────────────────────────────────────────────────────────────────
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const stammLib = require("./lib/stamm.cjs");

// Port über GRASS_THIN_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4331.
const PORT = Number(process.env.GRASS_THIN_PORT || 4331);
const server = statikServer();


(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await starteBrowser({ art: "null" });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        // N7.4 — die Linse prüft die OHNE-Studio-Welt (der eine Unit-Richter-Hook):
        // dort MUSS die Wiese bewusst gras-los sein (kein Tuft-Nachbau, kein Crash).
        window.__anazhGateNoFoundry = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 60000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 60000,
        });
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            const old = r.state.voxelWorker;
            r.state.voxelWorker = null;
            for (let i = 0; i < 150; i++) {
                r._gameLoopTick();
                await new Promise((res) => setTimeout(res, 0));
            }
            r.state.voxelWorker = old;
        });
        out = await page.evaluate(() => {
            const r = window.anazhRealm,
                st = r.state;
            const o = {};
            // (a) BEHAVIORAL — die foundry-off-Welt: jede Gras-Zelle bewusst gras-los.
            o.chunks = st.voxelChunks ? st.voxelChunks.size : 0;
            o.grassEntries = st.voxelChunkGrass ? st.voxelChunkGrass.size : 0;
            let nonNull = 0,
                instances = 0;
            if (st.voxelChunkGrass)
                for (const inst of st.voxelChunkGrass.values())
                    if (inst) {
                        nonNull++;
                        instances += inst.count || 0;
                    }
            o.grassNonNull = nonNull;
            o.grassInstances = instances;
            o.lodMapSize = st.voxelChunkGrassLod ? st.voxelChunkGrassLod.size : 0;
            // (b) QUELLE — der Schnitt steht (kommentar-bereinigt über den EINEN Absenz-Helfer, sonst V18.267-Falle).
            o.tuftMethodGone = typeof r._grassBladeTuftGeometry === "undefined";
            o.thinMethodGone = typeof r._tickGrassThin === "undefined";
            o.densityMapGone = st.voxelChunkGrassDensity === undefined;
            // V18.492 (die Linse wandert mit dem Gras-Schnitt 21.07.): die Wiese ist
            // BODEN-FUNKTION — der Bau verbucht jede Zelle bewusst halm-los (null), baut
            // KEIN InstancedMesh, die Halm-Maschinerie (Pool/Studio-Geometrie/Stufen-
            // Tick) ist physisch geschnitten, die Halme zeichnet der Terrain-Albedo.
            // halm-los verbucht misst (a) am Zustand; die Parallax-Halme und der Streu-Thin am Ruf (D3c, vorher am Rumpf-TEXT)
            o.existenzGabel = window.__fehlt(r._buildVoxelChunkGrass, /InstancedMesh/);
            const ruft = (f, ziel, k) => {
                const alt = ziel[k],
                    eigen = Object.prototype.hasOwnProperty.call(ziel, k);
                let n = 0;
                ziel[k] = function (...a) { n++; return alt.apply(this, a); };
                try { f(); } catch (_e) { /* ein Wurf nach dem Ruf entwertet den Konsum nicht */ } finally { if (eigen) ziel[k] = alt; else delete ziel[k]; }
                return n > 0;
            };
            o.dichteLiteral =
                typeof r._acquireGrassMesh === "undefined" &&
                typeof r._grassStudioGeometry === "undefined" &&
                typeof r._tickGrassStage === "undefined";
            const T = window.THREE.TSL;
            o.farFactorLiteral = ruft(() => r._terrainGeologyAlbedo(T, T.attribute("color", "vec3"), T.positionWorld), r._rauschAtlas(), "ebene");
            o.keinTuftAufruf = window.__fehlt(r._buildVoxelChunkGrass, /_grassBladeTuftGeometry/);
            o.idleOhneGrasThin = window.__fehlt(r._tickScatterStreaming, /_tickGrassThin/);
            // der Streu-Thin (V18.280) LEBT weiter — der eine verbliebene Thin-Hebel:
            o.streuThinLebt = ruft(() => r._tickScatterStreaming(st.playerMesh.position, performance.now() + 8), r, "_tickFoliageThin");
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Wiese-Studio-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }

    // Statische Doppel-Wand (Node-seitig, ohne Browser-Umweg): das Symbol lebt nirgends im Stamm.
    const staticTuftGone = stammLib.fehlt(null, /_grassBladeTuftGeometry|GRASS_TUFT_BLADES/);
    const staticThinGone = stammLib.fehlt(null, /_tickGrassThin|voxelChunkGrassDensity/);

    const checks = [
        {
            name: `foundry-off-Welt baut (${out.chunks} Chunks) + JEDE Gras-Zelle bewusst gras-los (${out.grassEntries} verbucht, ${out.grassNonNull} non-null, ${out.grassInstances} Halme)`,
            pass: out.chunks > 0 && out.grassEntries > 0 && out.grassNonNull === 0 && out.grassInstances === 0,
        },
        {
            name: `die Front ist zufrieden (Lod-Map ${out.lodMapSize} Einträge — verbucht, nicht übersprungen)`,
            pass: out.lodMapSize > 0 && out.lodMapSize >= out.grassEntries,
        },
        {
            name: "kein Page-Error (der Schnitt crasht nirgends)",
            pass: pageErrors.length === 0,
        },
        {
            name: "Tuft-Bauer + Thin-Tick + Dichte-Map sind geschnitten (Laufzeit + statisch)",
            pass: out.tuftMethodGone && out.thinMethodGone && out.densityMapGone && staticTuftGone && staticThinGone,
        },
        {
            name: "die Wiese ist Boden-Funktion: Zellen halm-los verbucht, kein InstancedMesh, Pool/Studio-Halm/Stufen-Tick geschnitten, Parallax-Halme im Terrain-Albedo",
            pass: out.existenzGabel && out.dichteLiteral && out.farFactorLiteral && out.keinTuftAufruf,
        },
        {
            name: "der Idle-Pass ruft keinen Gras-Thin mehr; der Streu-Thin (V18.280) lebt als der eine Hebel",
            pass: out.idleOhneGrasThin && out.streuThinLebt,
        },
    ];
    console.log("\n=== N7.4 — DIE WIESE IST STUDIO-DEFINIERT (der Tuft-Abschied) ===");
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    if (pageErrors.length) console.log("  Seiten-Fehler:", pageErrors.slice(0, 3));
    if (fails > 0) {
        console.log(`\n❌ ${fails} Prüfung(en) rot`);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — die Wiese ist Studio-definiert: ohne Pipeline bewusst gras-los, kein Nachbau.");
    process.exit(0);
})().catch((e) => {
    console.error("⛔", e);
    process.exit(2);
});
