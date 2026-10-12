// diag-fern-ring.cjs — DER FERN-RING (STUFE 2, das-feld-zeichnet §2: DIE FERNE
// IST FELD). Browser-Linse (Null-Renderer + Hook, das diag-settlement-TEIL-B-
// Muster): jenseits des Voxel-Streaming-Rings zeichnet das EINE Höhen-Gesetz
// (`_terrainMacroSurfaceY(x,z,false)`) den Horizont als 3 Ring-Schalen.
// Gesetze:
//   (1) STRUKTUR — genau 3 Schalen-Meshes, Vertex-Zahlen wie deklariert
//       (FERN_RING.winkel × die Reihen je Schale aus FERN_RING.seite), EIN geteiltes Material.
//   (2) HÖHEN == GESETZ — 60 deterministische Proben-Vertices: |mesh-Höhe −
//       _terrainMacroSurfaceY(snapX, snapZ, false)| < 0.01 (bzw. die flache
//       waterLevel-Klemme; Reihe 0 trägt die Saum-Tauchkante), XZ exakt gesnappt.
//   (3) RE-ZENTRIEREN — Spieler 400 m teleportieren + Ticks pumpen → der Anker
//       wandert QUANTISIERT, der Höhen-Refresh läuft BUDGETIERT durch
//       (≤ refreshVertsProTick je Tick, mehrere Ticks), die Proben stimmen am
//       neuen Ort.
//   (4) HEADLESS-DEFAULT — ohne Hook entsteht KEIN Ring (Null-Renderer ruht).
//   (5) kein pageerror.
//   (6) SICHT-BESITZ (SELBST GESPIELT 16.07.) — mit bereitem Ring weitet die
//       Kamera (far = Schale-3-aussen + 500, alter Wert gemerkt); DIE LUFT trägt
//       (V18.530: scene.fogNode, Sichtweite am Boden ≥ 5 km, mit der Höhe weiter);
//       _fernRingDispose stellt camera.far wieder her (die Klippe war Ring-Besitz).
//   (9) DIE NAHT (K16) — der Ring trägt den Boden-Stoff des Chunks (dieselbe Fabrik: Wege-Karte, Geologie, Licht-
//       Knoten) und dieselbe Höhe: je Kante zwischen gebautem und freiem Chunk die Stufe Ring ↔ Chunk gegen das volle
//       Gesetz (Bias ≤ 0,15 m, p95 ≤ Sehne des Rings im Freien + Abweichung des Chunks + 0,1 m), im Gebauten zeichnet er
//       nicht (die Masken-Karte seines maskNode trägt jeden gezeichneten Chunk, kein gezeichneter Durchstich). Am Ring 3
//       (Stufe 0 und 1) misst die LOCH-PROBE nach der Regel des maskNode (`_fernRingRegel`): wo er verwirft, trifft der
//       senkrechte Strahl ein gezeichnetes Deck (gemorpht, mit Stich-Band), an jeder Kante in Voxel-Kanten der Stufe, innen
//       und außen. Selbsttests: das alte 2-m-Tauchen fällt rot, ohne die Karte sticht die Sehne durch, die alte Zellen-Regel
//       zeigt Löcher.
//   (10) DIE FERN-FARBE OHNE STREIFEN (K16) — längs jeder Ring-Reihe jenseits des Karten-Horizonts der Streifen-Index
//       (RMS Nachbar-Sprung / RMS 4er-Sprung, gefaltet ≈ 1, glatt ≈ 0,25) im Median ≤ 0,5; Selbsttest am Zufall und am Sinus.
//   (11) DAS DACH IST DER BESTAND (K16) — die Deckung des Kronendachs (Fern-Farbe) gegen die Kronen-Deckung, die der Wald-
//       Generator auf 192 × 192 m um den Spieler stehen lässt (0,8–1,25); Selbsttest: die Geburt als Deckung fällt rot.
// Selbsttest (immer mitgeprüft): eine absichtlich verfälschte Erwartung
// (law + 0.5) MUSS rot fallen — die Linse ist nicht vakuös.
//   node scripts/diag-fern-ring.cjs
"use strict";
const puppeteer = require("puppeteer");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.FERN_RING_PORT || 4464);

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
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
    console.log("=== FERN-RING (STUFE 2) — Browser, Null-Renderer + Hook ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        // DER FELD-ZEICHNER (Bänder 7/8): echtes WebGPU trotz Null-Renderer. Unter Windows nahmen die Vulkan-/ANGLE-
        // Schalter den Adapter weg (requestAdapter → null, die Bänder standen auf jeder Basis rot, laeufe=0) — die
        // Schalter je Plattform trägt das EINE Rezept (scripts/lib/software-gpu.cjs).
        args: softwareWebGpuArgs(),
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = {};
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const dl0 = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                !window.anazhRealm.state.scene ||
                !window.anazhRealm.state.playerMesh ||
                !window.anazhRealm.state.worldMeta) &&
            performance.now() < dl0
        )
            await sleep(100);
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.scene) return { fatal: "anazhRealm/scene kam nie" };
        const F = r.constructor.FERN_RING;
        const p0 = { x: r.state.playerMesh.position.x, z: r.state.playerMesh.position.z };

        // ===== (4) HEADLESS-DEFAULT: ohne Hook entsteht KEIN Ring =====
        // (Hook sichern + wiederherstellen — die __anazhAutoSettlement-Disziplin.)
        const prevHook = window.__anazhFernRing;
        delete window.__anazhFernRing;
        for (let t = 0; t < 5; t++) r._tickFernRing(r.state.playerMesh.position);
        res.headlessQuiet = r.state.fernRing === null || r.state.fernRing === undefined;

        // ===== Hook AN: der Ring entsteht, der Refresh läuft budgetiert =====
        window.__anazhFernRing = true;
        // SYNCHRONER Pump-Block (kein await dazwischen — der RAF-Loop darf die
        // Budget-Zählung nicht verwischen): Tick 1 baut + erste Scheibe, dann
        // weiter bis der Cursor durch ist. Je Tick <= refreshVertsProTick.
        let ticks = 0;
        let maxDelta = 0;
        {
            let prevCursor = 0;
            r._tickFernRing(r.state.playerMesh.position);
            const fr0 = r.state.fernRing;
            if (!fr0) return { fatal: "Hook an, aber kein fernRing entstand" };
            prevCursor = fr0.cursor;
            maxDelta = prevCursor;
            ticks = 1;
            while (fr0.cursor < fr0.totalVerts && ticks < 100) {
                r._tickFernRing(r.state.playerMesh.position);
                const d = fr0.cursor - prevCursor;
                if (d > maxDelta) maxDelta = d;
                prevCursor = fr0.cursor;
                ticks++;
            }
        }
        const fr = r.state.fernRing;
        const frBau = fr;
        res.buildTicks = ticks;
        res.buildMaxDelta = maxDelta;
        res.buildBudgeted = maxDelta > 0 && maxDelta <= F.refreshVertsProTick && ticks >= 2;
        res.ready = fr.ready === true;

        // ===== (1) STRUKTUR: 3 Schalen, deklarierte Vertex-Zahlen, EIN Material =====
        // Die Reihen je Schale, unabhängig nachgerechnet: Reihen-Faktor 1 + seite·2π/winkel (die Masche höchstens
        // seite : 1), geometrisch von inner bis aussen.
        const qRing = 1 + (F.seite * 2 * Math.PI) / F.winkel;
        const reihenSoll = fr.schalen.map((sh) => Math.ceil(Math.log(sh.aussen / sh.inner) / Math.log(qRing)) + 1);
        const offSoll = [];
        let summeSoll = 0;
        for (const rr of reihenSoll) {
            offSoll.push(summeSoll);
            summeSoll += rr * F.winkel;
        }
        res.meshCount = fr.meshes.length;
        res.vertCounts = fr.meshes.map((m) => m.geometry.attributes.position.count);
        res.reihen = reihenSoll;
        res.vertsDeclared =
            res.vertCounts.every((c, s) => c === reihenSoll[s] * F.winkel) && fr.totalVerts === summeSoll;
        res.oneMaterial = fr.meshes.every((m) => m.material === fr.material);
        res.sceneMeshes = 0;
        r.state.scene.traverse((n) => {
            if (n.isMesh && n.userData && n.userData.inventar === "fern-ring") res.sceneMeshes++;
        });
        res.visible = fr.meshes.every((m) => m.visible === true);
        res.flags = fr.meshes.every((m) => m.frustumCulled === false && !m.castShadow && !m.receiveShadow);
        // DER LOCH-DECKEL (20.07.): Schale 1 beginnt DIREKT am Spieler (0.5·span)
        // — der Ring deckt jedes Chunk-Loch (die Wasser-Plane samt Spekular bleibt
        // verdeckt); gebaute Chunks decken ihn per Depth. deckZoneRad trägt die
        // Chunk-Ziel-Zone, in der die Reihen das VOLLE Gesetz gesenkt tragen.
        const cfg = r._voxelChunkConfig();
        const targetRing = Math.max(1, Math.min(12, r.state.chunkRingRadius || 4));
        res.innerRandOk =
            Math.abs(fr.schalen[0].inner - cfg.span * 0.5) < 1e-9 &&
            Math.abs(fr.deckZoneRad - (targetRing + 0.5) * cfg.span) < 1e-9;

        // ===== (2) HÖHEN == GESETZ: 60 deterministische Proben-Vertices =====
        // Die Erwartung UNABHÄNGIG nachgerechnet (Schalen-Layout + Snap + Klemme
        // + Saum) — das Gesetz selbst kommt aus _terrainMacroSurfaceY (EINE Quelle).
        const probeVertex = (gIdx, fudge, ring) => {
            const fr = ring || frBau;
            let s = 0;
            while (s < offSoll.length - 1 && gIdx >= offSoll[s + 1]) s++;
            const li = gIdx - offSoll[s];
            const row = (li / F.winkel) | 0;
            const ai = li - row * F.winkel;
            const sh = fr.schalen[s];
            // GEOMETRISCHE Reihen + NAHT-VEREDELUNG (20.07.) — die Erwartung
            // spiegelt das LIVE-Layout (nah dicht, fern weit; Innen-Reihen der
            // ersten Schale tragen das volle Gesetz leicht gesenkt).
            const rad = sh.inner * Math.pow(sh.aussen / sh.inner, row / (reihenSoll[s] - 1));
            const ang = (ai / F.winkel) * Math.PI * 2;
            const sx = Math.round((fr.anchorX + Math.cos(ang) * rad) / sh.snap) * sh.snap;
            const sz = Math.round((fr.anchorZ + Math.sin(ang) * rad) / sh.snap) * sh.snap;
            const wl = Number.isFinite(r.state.waterLevel) ? r.state.waterLevel : 0;
            // DIE NAHT (K16, gespiegelt): die Lage zum Gebauten aus den acht Nachbarn der Schale (_chunkDecktRing ist die Quelle).
            const orte = (rr, aa) => {
                const rd = sh.inner * Math.pow(sh.aussen / sh.inner, rr / (reihenSoll[s] - 1));
                const an = (aa / F.winkel) * Math.PI * 2;
                return [
                    Math.round((fr.anchorX + Math.cos(an) * rd) / sh.snap) * sh.snap,
                    Math.round((fr.anchorZ + Math.sin(an) * rd) / sh.snap) * sh.snap,
                ];
            };
            // an der Naht: der Punkt selbst oder einer der acht um ihn steht im Gebauten (`_fernRingNaht`)
            let naht = false;
            if (s === 0 && rad <= fr.bauZoneRad) {
                naht = r._chunkDecktRing(sx, sz);
                for (let dr = -1; dr <= 1 && !naht; dr++)
                    for (let da = -1; da <= 1 && !naht; da++) {
                        if ((!dr && !da) || row + dr < 0 || row + dr >= reihenSoll[s]) continue;
                        naht = r._chunkDecktRing(...orte(row + dr, (ai + da + F.winkel) % F.winkel));
                    }
            }
            let law = r._terrainMacroSurfaceY(sx, sz, false);
            // LOCH-DECKEL-Formel (gespiegelt): Zone = volles Gesetz −0.3, ×1.35-Blende auf Makro.
            if (s === 0 && rad <= fr.deckZoneRad * 1.35) {
                const w = rad <= fr.deckZoneRad ? 1 : (fr.deckZoneRad * 1.35 - rad) / (fr.deckZoneRad * 0.35);
                const voll = r._terrainMacroSurfaceY(sx, sz, true);
                law = law + (voll - law) * w - 0.3 * w;
            }
            if (naht) law = r._terrainMacroSurfaceY(sx, sz, true);
            let expY = law < wl ? wl - F.wasserDrop : law;
            if (row === 0) expY -= F.saumDrop;
            // Im Gebauten taucht der Ring nicht mehr (K16): er trägt dort das volle Gesetz und verwirft sein Fragment (die
            // Masken-Karte, Band 9).
            // Selbsttest-Verfälschung NACH der Klemme (sonst bliebe eine wasser-
            // geklemmte Probe trotz Fudge grün — der Selbsttest wäre lückenhaft):
            expY += fudge || 0;
            const pos = fr.meshes[s].geometry.attributes.position;
            const okXZ = pos.getX(li) === sx && pos.getZ(li) === sz;
            const okY = Math.abs(pos.getY(li) - expY) < 0.01;
            return { ok: okXZ && okY, okXZ, okY, dy: Math.abs(pos.getY(li) - expY) };
        };
        // 60 Proben, deterministisch über alle Schalen/Reihen gestreut (149 ist
        // teilerfremd zu totalVerts) — inkl. Reihe-0-Saum und Wasser-Klemme.
        const probeAll = (fudge) => {
            let bad = 0;
            let worst = 0;
            for (let k = 0; k < 60; k++) {
                const p = probeVertex((k * 149) % fr.totalVerts, fudge);
                if (!p.ok) bad++;
                if (p.dy > worst) worst = p.dy;
            }
            return { bad, worst };
        };
        const p1 = probeAll(0);
        res.probesBad = p1.bad;
        res.probesWorst = p1.worst;
        // SELBSTTEST: die verfälschte Erwartung (law + 0.5) MUSS rot fallen.
        const pf = probeAll(0.5);
        res.selftestRed = pf.bad === 60;

        // ===== (3) RE-ZENTRIEREN: 400 m Teleport + Ticks pumpen =====
        const oldAnchorX = fr.anchorX;
        const p2 = { x: p0.x + 400, z: p0.z };
        // synchroner Block (Teleport + Pump ohne await — kein RAF-Interleave):
        let ticks2 = 0;
        let maxDelta2 = 0;
        {
            r.state.playerMesh.position.x = p2.x;
            r.state.playerMesh.position.z = p2.z;
            const refreshedBefore = fr.refreshed;
            let prevCursor2 = null;
            const pos2 = { x: p2.x, z: p2.z };
            r._tickFernRing(pos2); // Re-Anker: Cursor 0 + erste Scheibe
            res.anchorMoved = fr.anchorX !== oldAnchorX;
            res.anchorQuantized =
                fr.anchorX === Math.round(p2.x / F.anchorQuant) * F.anchorQuant &&
                fr.anchorZ === Math.round(p2.z / F.anchorQuant) * F.anchorQuant;
            prevCursor2 = fr.cursor;
            maxDelta2 = prevCursor2;
            ticks2 = 1;
            while (fr.cursor < fr.totalVerts && ticks2 < 100) {
                r._tickFernRing(pos2);
                const d = fr.cursor - prevCursor2;
                if (d > maxDelta2) maxDelta2 = d;
                prevCursor2 = fr.cursor;
                ticks2++;
            }
            res.refreshRan = fr.refreshed - refreshedBefore === fr.totalVerts;
            const p3 = probeAll(0);
            res.probes2Bad = p3.bad;
            res.probes2Worst = p3.worst;
        }
        res.reanchorTicks = ticks2;
        res.reanchorBudgeted = maxDelta2 > 0 && maxDelta2 <= F.refreshVertsProTick && ticks2 >= 2;

        // ===== (3b) DAS FERN-FARB-BUDGET: der GPU-Rückruf färbt nicht synchron =====
        // Nach dem ersten Bild rechnet die Setz-Naht keine Fern-Farbe mehr: der Rückruf eines Re-Ankers setzt die
        // Höhen, neue Punkte warten in der Farb-Schlange, die Takte (`_fernFarbTakt`) färben sie leer. Gezählt wird
        // jede Fern-Farbe außerhalb des Budgets (der alte Rückruf rechnete ~8 000 in einem Frame, 10–29 ms).
        {
            const sleep3 = (ms) => new Promise((rs) => setTimeout(rs, ms));
            let ausser = 0;
            let imBudget = false;
            const ffa = r._fernFarbeAt;
            const fft = r._fernFarbTakt;
            r._fernFarbeAt = function (...a) {
                if (!imBudget) ausser++;
                return ffa.apply(this, a);
            };
            r._fernFarbTakt = function (...a) {
                imBudget = true;
                try {
                    return fft.apply(this, a);
                } finally {
                    imBudget = false;
                }
            };
            const pos3 = { x: p2.x + 400, z: p2.z };
            r.state.playerMesh.position.x = pos3.x;
            const laeufe0 = fr.gpuLaeufe || 0;
            r._tickFernRing(pos3); // Re-Anker: der GPU-Flug startet, die erste CPU-Scheibe läuft
            const dl3 = performance.now() + 90000;
            while ((fr.gpuLaeufe || 0) === laeufe0 && performance.now() < dl3) await sleep3(50);
            res.budgetGpu = (fr.gpuLaeufe || 0) > laeufe0;
            res.budgetOffen = fr.farbN; // nach dem Rückruf, vor dem nächsten Takt
            for (let t = 0; t < 600 && (fr.farbN > 0 || fr.cursor < fr.totalVerts); t++) r._tickFernRing(pos3);
            res.budgetLeer = fr.farbN === 0;
            res.budgetAusser = ausser;
            delete r._fernFarbeAt;
            delete r._fernFarbTakt;
            r.state.playerMesh.position.x = p2.x;
        }

        // ===== (6) SICHT-BESITZ: Kamera-Weitung + Höhen-Öffnung + Rücknahme =====
        // Die Weitung geschah beim Pump (Ring wurde ready): far = Schale-3 + 500.
        const camFarWide = F.schalen[F.schalen.length - 1].aussen + 500;
        res.camFar = r.state.camera.far;
        res.camFarWide = camFarWide;
        res.camFarAlt = r._fernRingCamFarAlt;
        res.camWidened =
            r.state.camera.far === camFarWide &&
            Number.isFinite(r._fernRingCamFarAlt) &&
            r._fernRingCamFarAlt < camFarWide;
        // Die HÖHEN-ÖFFNUNG durch den ECHTEN Loop (der Spieler-Hub reist per
        // V18.356-Teleport-Adoption; die Kamera folgt in _loopCamera; die
        // Umgebungs-Proben sind takt-gecacht). `_gameLoopTick` wird erst bei
        // Renderer-Ready zugewiesen — erst darauf warten, dann DETERMINISTISCH
        // pumpen BIS die Bedingung steht (kein Ritt auf dem ~1-Hz-Headless-RAF).
        const dlLoop = performance.now() + 30000;
        while (typeof r._gameLoopTick !== "function" && performance.now() < dlLoop) await sleep(200);
        if (typeof r._gameLoopTick !== "function") res.loopFehler = "_gameLoopTick kam nie (Renderer-Ready)";
        // DIE LUFT TRÄGT (V18.530): kein Wald-Nebel mehr — die Sichtweite (Koschmieder 2 %) ist am Boden ≥ 5 km
        // und wächst mit der Höhe (Dunst-Skalenhöhe). Gelesen nach echten Loop-Takten (Tag-Nacht schreibt die Luft).
        const sichtBei = (y) => {
            r.state.playerMesh.position.y = y;
            for (let i = 0; i < 3; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (e) {
                    res.loopFehler = String(e && e.message);
                }
            }
            return Math.round(r._luftSichtM(r.state.camera.position.y));
        };
        const px = r.state.playerMesh.position.x;
        const pz = r.state.playerMesh.position.z;
        const hy = r.getTerrainHeightAt(px, pz);
        const boden = Number.isFinite(hy) ? hy : 0;
        res.sichtBoden = sichtBei(boden + 1);
        res.sichtHoch = sichtBei(boden + 300);
        res.sichtZurueck = sichtBei(boden + 1);
        res.luftKnoten = !!r.state.scene.fogNode && !r.state.scene.fog;
        res.oeffnungOk =
            !res.loopFehler &&
            res.luftKnoten &&
            res.sichtBoden >= 5000 &&
            res.sichtHoch > res.sichtBoden &&
            Math.abs(res.sichtZurueck - res.sichtBoden) <= res.sichtBoden * 0.01; // der Spieler setzt sich neu
        // Die RÜCKNAHME: der Dispose stellt das alte far wieder her (Ring-Besitz).
        const altVorDispose = r._fernRingCamFarAlt;
        r._fernRingDispose();
        res.disposeRestored = r.state.camera.far === altVorDispose && r.state.fernRing === null;

        // ===== (7) DER FELD-ZEICHNER (Stufe-2-Vollausbau): das Feld malt =====
        // Neubau nach dem Dispose: Tick 1 baut den Ring, startet den EINEN
        // Feld-Flug (das Gelände-Gesetzbuch durch _feldZeichnerHoehen) UND läuft die
        // erste CPU-Scheibe. Dann OHNE weitere Ticks auf den Flug warten:
        // malt das Feld, ist der Ring BEREIT obwohl der CPU-Cursor noch vorn
        // steht — der Horizont steht vor der CPU. Proben: |GPU-Höhe − f64-
        // Gesetz| ≤ 0.5 m (SEH-Band; die Linse gate:dritter-spiegel misst mm,
        // hier zählt der 8-km-Blick). Danach CPU zu Ende pumpen → Band 2 hat
        // bereits bewiesen, dass die Verfeinerung exakt ist.
        const sleep7 = (ms) => new Promise((rs) => setTimeout(rs, ms));
        r._tickFernRing(r.state.playerMesh.position);
        const fr7 = r.state.fernRing;
        res.fzStart = !!(fr7 && (fr7.gpuFlug === true || (fr7.gpuLaeufe || 0) >= 1));
        const dl7 = performance.now() + 90000;
        while (fr7 && (fr7.gpuLaeufe || 0) < 1 && fr7.gpuFlug === true && performance.now() < dl7) await sleep7(100);
        res.fzLaeufe = fr7 ? fr7.gpuLaeufe || 0 : 0;
        res.fzCursor = fr7 ? fr7.cursor : -1;
        res.fzTotal = fr7 ? fr7.totalVerts : -1;
        res.fzReadyVorCpu = !!(fr7 && fr7.ready === true && fr7.cursor < fr7.totalVerts);
        let fzWorst = -1;
        let fzProben = 0;
        if (fr7 && res.fzLaeufe >= 1) {
            fzWorst = 0;
            // DIESELBE Erwartung wie Band 2 (`probeVertex`: Snap · Deck-Zone mit vollem Gesetz · Wasser-Klemme · Saum ·
            // der Ring unter dem Gebauten) — eine eigene Teil-Formel ohne Deck-Zone und Weich-Wand maß 61 m
            // „Abweichung", wo der Ring nur dem gebauten Chunk wich.
            for (let k = 0; k < 60; k++) {
                const g = (fr7.cursor + 1 + ((k * 47) % (fr7.totalVerts - fr7.cursor - 1))) | 0;
                const pv = probeVertex(g, 0, fr7);
                const d7 = pv.okXZ ? pv.dy : Infinity;
                if (d7 > fzWorst) fzWorst = d7;
                fzProben++;
            }
        }
        res.fzWorst = fzWorst;
        res.fzProben = fzProben;
        // CPU zu Ende (die Verfeinerung läuft über den GPU-Anstrich):
        for (let t = 0; t < 100 && fr7 && fr7.cursor < fr7.totalVerts; t++)
            r._tickFernRing(r.state.playerMesh.position);
        res.fzCpuFertig = !!(fr7 && fr7.cursor >= fr7.totalVerts);

        // ===== (8) DER FELD-PASS: die Ferne ganz ohne Schalen-Geometrie =====
        // Der Pass ist Ring-Besitz (_tickFeldPass aus _tickFernRing): warte auf
        // den EINEN Mal-Flug (die Höhen aus gelaende-core), prüfe Struktur + Daten-
        // Parität (Texel-Höhe == f64-Gesetz im Seh-Band), dann die ECHTE
        // Render-Probe: ein WebGPURenderer zeichnet den Fullscreen-Raymarch —
        // der Horizont MUSS Pixel treffen (Kompilat + Lauf + Treffer bewiesen).
        const P8 = r.constructor.FELD_PASS;
        const dl8 = performance.now() + 90000;
        let fp8 = r.state.feldPass;
        // SCHATTIERUNGS-PERSISTENZ (20.07.): sichtbar erst mit gebackenem
        // PANORAMA (der Fragment-March ist tot, der Blick liest das Panorama) —
        // die Probe wartet auf Feld-Anstrich UND Panorama-Bake.
        while ((!fp8 || fp8.laeufe < 1 || !(fp8.panoLaeufe >= 1)) && performance.now() < dl8) {
            r._tickFernRing(r.state.playerMesh.position);
            fp8 = r.state.feldPass;
            await sleep7(100);
        }
        res.fpDa = !!fp8;
        res.fpLaeufe = fp8 ? fp8.laeufe : 0;
        res.fpPanoLaeufe = fp8 ? fp8.panoLaeufe : 0;
        res.fpTexOk = !!(fp8 && fp8.tex && fp8.tex.image.width === P8.az && fp8.tex.image.height === P8.rad);
        res.fpSichtbar = !!(fp8 && fp8.mesh.visible === true);
        let fpWorst = -1;
        if (fp8 && fp8.laeufe >= 1) {
            fpWorst = 0;
            const F8 = r.constructor.FERN_RING;
            const rMin8 = F8.schalen[F8.schalen.length - 1].aussen;
            const wl8 = Number.isFinite(r.state.waterLevel) ? r.state.waterLevel : 0;
            for (let k = 0; k < 40; k++) {
                const ix = (k * 37) % P8.az;
                const iy = (k * 11) % P8.rad;
                const rr = rMin8 + ((iy + 0.5) / P8.rad) * (P8.rMaxM - rMin8);
                const aa = ((ix + 0.5) / P8.az - 0.5) * 2 * Math.PI;
                const law8 = r._terrainMacroSurfaceY(
                    fp8.anchorX + Math.cos(aa) * rr,
                    fp8.anchorZ + Math.sin(aa) * rr,
                    false
                );
                const want8 = law8 < wl8 ? wl8 : law8;
                const d8 = Math.abs(fp8.daten[(iy * P8.az + ix) * 4] - want8);
                if (d8 > fpWorst) fpWorst = d8;
            }
        }
        res.fpWorst = fpWorst;
        // Die ECHTE Render-Probe (der Null-Renderer der Seite zeichnet nie):
        try {
            const szene8 = new THREE.Scene();
            const alterParent = fp8 ? fp8.mesh.parent : null;
            if (fp8) szene8.add(fp8.mesh);
            const cam8 = new THREE.PerspectiveCamera(60, 1.5, 1, 45000);
            const bodenY = r._terrainMacroSurfaceY(fp8.anchorX, fp8.anchorZ, false);
            cam8.position.set(fp8.anchorX, bodenY + 60, fp8.anchorZ);
            cam8.lookAt(fp8.anchorX + 1000, bodenY + 40, fp8.anchorZ);
            cam8.updateMatrixWorld(true);
            fp8.U.camPos.value.copy(cam8.position);
            fp8.U.invVP.value.multiplyMatrices(cam8.projectionMatrix, cam8.matrixWorldInverse).invert();
            const ren8 = new THREE.WebGPURenderer({ antialias: false });
            await ren8.init();
            ren8.setSize(96, 64, false);
            const rt8 = new THREE.RenderTarget(96, 64);
            ren8.setRenderTarget(rt8);
            // Diagnose-Stufe A: Konstant-Farbe (beweist das Fullscreen-Dreieck)
            const echterOut = fp8.mat.outputNode;
            fp8.mat.outputNode = THREE.TSL.vec4(1, 0, 0, 1);
            fp8.mat.needsUpdate = true;
            await ren8.renderAsync(szene8, cam8);
            const bufA = await ren8.readRenderTargetPixelsAsync(rt8, 0, 0, 96, 64);
            let trefferA = 0;
            for (let px = 0; px < 96 * 64; px++) if (bufA[px * 4] > 0) trefferA++;
            res.fpTrefferKonstant = trefferA;
            fp8.mat.outputNode = echterOut;
            fp8.mat.needsUpdate = true;
            await ren8.renderAsync(szene8, cam8);
            const buf8 = await ren8.readRenderTargetPixelsAsync(rt8, 0, 0, 96, 64);
            let treffer8 = 0;
            for (let px = 0; px < 96 * 64; px++) {
                if (buf8[px * 4 + 3] > 0 && buf8[px * 4] + buf8[px * 4 + 1] + buf8[px * 4 + 2] > 0) treffer8++;
            }
            res.fpTreffer = treffer8;
            ren8.dispose();
            if (fp8 && alterParent) alterParent.add(fp8.mesh);
        } catch (e8) {
            res.fpRenderErr = (e8 && e8.message) || String(e8);
        }
        // ===== (8b) DAS EINBLENDEN: die Geburt eines fern entstandenen Satzes dithert ein =====
        // Zwei Probe-Sätze (EIN Kasten) bei sichtbarem Feld-Pass: mit `einblenden` beginnt Texel 5.w bei 1 (ganz
        // verworfen) und der Schwund-Takt löst ihn über WELT_SCHWUND_MS auf 0; ohne erscheint er sofort (0). Der Nebel
        // verdeckte solche Geburten bis V18.530 (ein fern gespawntes Tier ploppte sichtbar).
        try {
            const fp8b = r.state.feldPass;
            if (fp8b && fp8b.mesh) fp8b.mesh.visible = true;
            const wm8 = r._weltMarchEnsure();
            const kasten = () => [{ box: true, c: { x: 0, y: 0, z: 0 }, h: { x: 1, y: 1, z: 1 } }];
            const hE = r._weltKapselSpawn("probe:einblenden", null, kasten, true);
            const hS = r._weltKapselSpawn("probe:sofort", null, kasten, false);
            const L8 = wm8.listeDaten;
            const MS = r.constructor.WELT_SCHWUND_MS;
            res.einStart = hE ? L8[hE.feld * 32 + 23] : -1;
            res.sofortStart = hS ? L8[hS.feld * 32 + 23] : -1;
            await new Promise((rs) => setTimeout(rs, MS / 2));
            r._weltSchwundTakt(wm8);
            res.einMitte = hE ? L8[hE.feld * 32 + 23] : -1;
            await new Promise((rs) => setTimeout(rs, MS / 2 + 60));
            r._weltSchwundTakt(wm8);
            res.einEnde = hE ? L8[hE.feld * 32 + 23] : -1;
            res.einAus = !!hE && !wm8.schwund.has(hE);
            if (hE) r._weltFeldFrei(hE);
            if (hS) r._weltFeldFrei(hS);
        } catch (e8b) {
            res.einErr = String((e8b && e8b.message) || e8b);
        }
        // ===== (9) DIE NAHT: gebauter Boden ↔ Ring — dieselbe Höhe, derselbe Stoff (K16) =====
        // Der Bestand steht still (2 s ohne neuen Chunk), dann baut der Ring SYNCHRON neu (kein await: kein Chunk kommt
        // dazwischen) und die Linse misst, was gezeichnet wird: je Kante zwischen gebautem und freiem Chunk alle 3 m die Höhe
        // des Rings 0,3 m draußen gegen die des Chunks 0,3 m drinnen (Strahl von oben auf die Meshes), im Gebauten auf einem
        // 6-m-Raster den Durchstich (Ring > Chunk + 5 cm), und ob der Ring-Stoff der Boden-Stoff des Chunks ist (die Gesetze
        // `_wegeBodenFarbe` und `_terrainGeologyAlbedo` bauen ihn, die Licht-Knoten des Chunk-Stoffs trägt er).
        try {
            const sleep9 = (ms) => new Promise((rs) => setTimeout(rs, ms));
            const T9 = THREE;
            const gebaut9 = () => {
                let n = 0;
                for (const e of r.state.voxelChunks ? r.state.voxelChunks.values() : [])
                    if (e && !e.empty && e.mesh) n++;
                return n;
            };
            // Der Null-Renderer treibt keinen Loop: die Linse pumpt den Spiel-Takt (das diag-boot-stage-Muster), bis der
            // Ring steht oder der Bestand 3 s ruht. RING 3 (7 × 7, gehalten gegen den Boot-Ramp, das diag-chunk-seam-Muster):
            // die äußere Reihe trägt Stufe 1 (DETAIL_CASCADE, Band 0 bis Ring 2) — die Bau-Kante des Spiels und die
            // Stufen-Naht 0 ↔ 1 stehen im Satz (mit dem 5 × 5-Satz sah die Linse nur Stufe 0).
            const t09 = performance.now();
            const ziel9 = 3;
            r.state.chunkRingRadius = ziel9;
            r.state._activeRingRadius = ziel9;
            let n9 = -1;
            let still9 = performance.now();
            const dl9 = performance.now() + 90000;
            for (let t = 0; performance.now() < dl9; t++) {
                r.state._activeRingRadius = ziel9;
                try {
                    r._gameLoopTick();
                } catch (_e) {
                    /* ein Takt-Fehler zählt im pageerror-Band */
                }
                if (t % 5 === 0) await sleep9(0);
                const n = gebaut9();
                if (n !== n9) {
                    n9 = n;
                    still9 = performance.now();
                } else if (n >= (2 * ziel9 + 1) ** 2 || (n >= 9 && performance.now() - still9 > 3000)) break;
            }
            res.nahtStufen = [...r.state.voxelChunks.values()].reduce((a, e) => {
                if (e && !e.empty && e.mesh) a[e.lod || 0] = (a[e.lod || 0] || 0) + 1;
                return a;
            }, {});
            const tPump9 = performance.now();
            res.nahtChunks = n9;
            const spion = { geo: 0, wege: 0 };
            const tga = r._terrainGeologyAlbedo;
            const wbf = r._wegeBodenFarbe;
            r._terrainGeologyAlbedo = function (...a) {
                spion.geo++;
                return tga.apply(this, a);
            };
            r._wegeBodenFarbe = function (...a) {
                spion.wege++;
                return wbf.apply(this, a);
            };
            r._fernRingDispose();
            const pos9 = r.state.playerMesh.position;
            for (let t = 0; t < 400; t++) {
                r._tickFernRing(pos9);
                const f9 = r.state.fernRing;
                if (f9 && f9.cursor >= f9.totalVerts && f9.farbN === 0) break;
            }
            delete r._terrainGeologyAlbedo;
            delete r._wegeBodenFarbe;
            const fr9 = r.state.fernRing;
            res.nahtStoffGeo = spion.geo;
            res.nahtStoffWege = spion.wege;
            const cm = r.state.voxelChunkMaterial;
            const slots = (m) => ["colorNode", "normalNode", "roughnessNode", "outputNode"].filter((k) => m && m[k]);
            res.nahtSlotsChunk = slots(cm).join(",");
            res.nahtSlotsRing = slots(fr9 && fr9.material).join(",");
            r.state.scene.updateMatrixWorld(true);
            const ray = new T9.Raycaster();
            const ab = new T9.Vector3(0, -1, 0);
            const o9 = new T9.Vector3();
            const hoch = (obj, x, z) => {
                o9.set(x, 4000, z);
                ray.set(o9, ab);
                ray.far = 9000;
                const h = ray.intersectObject(obj, false);
                return h.length ? h[0].point.y : null;
            };
            const span9 = r._voxelChunkConfig().span;
            const wl9 = Number.isFinite(r.state.waterLevel) ? r.state.waterLevel : 0;
            const ringMesh = fr9.meshes[0];
            // DIE RING-HÖHE ÜBER EIN FACH-RASTER (8 m): der Strahl prüft nur die Dreiecke der Schale 0, deren Kasten den Punkt
            // trägt — der Strahl gegen die ganze Schale (15 000 Dreiecke je Probe) trug den Großteil der Linsen-Zeit.
            const ringFach = new Map();
            {
                const P = ringMesh.geometry.attributes.position;
                const I = ringMesh.geometry.index.array;
                for (let t = 0; t < I.length; t += 3) {
                    let x0 = Infinity;
                    let x1 = -Infinity;
                    let z0 = Infinity;
                    let z1 = -Infinity;
                    for (let e = 0; e < 3; e++) {
                        x0 = Math.min(x0, P.getX(I[t + e]));
                        x1 = Math.max(x1, P.getX(I[t + e]));
                        z0 = Math.min(z0, P.getZ(I[t + e]));
                        z1 = Math.max(z1, P.getZ(I[t + e]));
                    }
                    if (x1 - x0 > 400) continue; // nur die nahe Schale (die Bau-Zone)
                    for (let a = Math.floor(x0 / 8); a <= Math.floor(x1 / 8); a++)
                        for (let b = Math.floor(z0 / 8); b <= Math.floor(z1 / 8); b++) {
                            const k = a * 65536 + b;
                            if (!ringFach.has(k)) ringFach.set(k, []);
                            ringFach.get(k).push(t);
                        }
                }
            }
            const rA = new T9.Vector3();
            const rB = new T9.Vector3();
            const rC = new T9.Vector3();
            const rT = new T9.Vector3();
            const ringY = (x, z) => {
                const liste = ringFach.get(Math.floor(x / 8) * 65536 + Math.floor(z / 8));
                if (!liste) return null;
                const P = ringMesh.geometry.attributes.position;
                const I = ringMesh.geometry.index.array;
                o9.set(x, 4000, z);
                ray.set(o9, ab);
                let best = null;
                for (const t of liste) {
                    rA.fromBufferAttribute(P, I[t]);
                    rB.fromBufferAttribute(P, I[t + 1]);
                    rC.fromBufferAttribute(P, I[t + 2]);
                    if (ray.ray.intersectTriangle(rA, rB, rC, false, rT) && (best === null || rT.y > best)) best = rT.y;
                }
                return best;
            };
            const stufen = [];
            const eigen = [];
            const selbst = []; // SELBSTTEST: dieselben Proben mit dem alten 2-m-Tauchen müssen rot fallen
            let bias = 0;
            const sehne = []; // die mittlere Stufe mit Vorzeichen: eine systematische Kante (der alte Ring tauchte −2 m) // die Abweichung des Chunks selbst vom Gesetz (die Surface-Nets-Klasse)
            const durch = [0, 0];
            let durchOhne = 0; // SELBSTTEST: dieselben Punkte ohne die Masken-Karte (die Sehne des Rings im Gebauten)
            const maske9 = [0, 0]; // die Masken-Treue: gezeichnete Chunks mit ihrem Texel / alle
            const loch9 = [0, 0]; // DAS LOCH: verworfene Punkte ohne Deck / verworfene Punkte (nach `_fernRingRegel`)
            const lochZelle = [0, 0]; // SELBSTTEST: dasselbe nach der alten Regel (die ganze Chunk-Zelle verwirft)
            const lochSeite = {}; // der Täter beim Namen: wo die Löcher liegen (Kante −X/+X/−Z/+Z oder innen)
            const lochOrte = []; // die ersten Löcher beim Ort (Punkt, Chunk, Stufe)
            const durchSeite = {}; // ebenso der Durchstich: je Kante:Regel [Zahl, größte Höhe über dem Deck]
            const muendung9 = [0, 0]; // der Einschnitt am Saum (Höhle, Kanal): [Punkte, größte Höhe des Rings über dem Deck]
            const weiche9 = Number(r.constructor.FERN_RING.nahtWeiche) || 0; // der Saum weicht dem Chunk in die Tiefe
            const morphF =
                r.state.atmoUniforms && r.state.atmoUniforms.geomorph ? r.state.atmoUniforms.geomorph.value : 0;
            const morphMemo = new Map();
            const gemorpht = (m) => {
                const A = m.geometry.attributes;
                if (!morphF || !A.aMorphTarget || !A.aMorphWeight) return m;
                let g = morphMemo.get(m);
                if (g) return g;
                const P = A.position;
                const Tg = A.aMorphTarget;
                const Wg = A.aMorphWeight;
                const neu = new Float32Array(P.count * 3);
                for (let v = 0; v < P.count; v++) {
                    const f = morphF * Wg.getX(v);
                    neu[v * 3] = P.getX(v) + (Tg.getX(v) - P.getX(v)) * f;
                    neu[v * 3 + 1] = P.getY(v) + (Tg.getY(v) - P.getY(v)) * f;
                    neu[v * 3 + 2] = P.getZ(v) + (Tg.getZ(v) - P.getZ(v)) * f;
                }
                const geo = new T9.BufferGeometry();
                geo.setAttribute("position", new T9.BufferAttribute(neu, 3));
                geo.setIndex(m.geometry.index);
                g = new T9.Mesh(geo, m.material);
                g.matrixWorld.copy(m.matrixWorld);
                morphMemo.set(m, g);
                return g;
            };
            const seiten = [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
            ];
            for (const [key, e] of r.state.voxelChunks) {
                if (!e || e.empty || !e.mesh) continue;
                const [cx, cz] = key.split(",").map(Number);
                if (!r._chunkDecktRing((cx + 0.5) * span9, (cz + 0.5) * span9)) continue;
                for (const [sx, sz] of seiten) {
                    if (r._chunkDecktRing((cx + 0.5 + sx) * span9, (cz + 0.5 + sz) * span9)) continue;
                    for (let k = 1; k < 14; k++) {
                        const u = (k / 14) * span9;
                        const bx = sx ? cx * span9 + (sx > 0 ? span9 : 0) : cx * span9 + u;
                        const bz = sz ? cz * span9 + (sz > 0 ? span9 : 0) : cz * span9 + u;
                        if (r._terrainMacroSurfaceY(bx, bz, true) < wl9 + 0.5) continue;
                        // Die Stufe relativ zum EINEN Gesetz (der Hang zwischen den Proben zählt nicht): der Chunk dort, wo
                        // seine Deckfläche trägt (0,3 · 0,9 · 1,5 m drinnen — die Kante selbst trägt den Skirt-Vorhang), der Ring
                        // 0,3 m draußen.
                        let dc = null;
                        for (const d of [0.3, 0.9, 1.5]) {
                            const xi = bx - sx * d;
                            const zi = bz - sz * d;
                            const yc = hoch(e.mesh, xi, zi);
                            const g = r._terrainMacroSurfaceY(xi, zi, true);
                            if (yc !== null && Math.abs(yc - g) < 5) {
                                dc = yc - g;
                                break;
                            }
                        }
                        const xo = bx + sx * 0.3;
                        const zo = bz + sz * 0.3;
                        const yr = hoch(ringMesh, xo, zo);
                        if (dc === null || yr === null) continue;
                        eigen.push(Math.abs(dc));
                        const st = yr - r._terrainMacroSurfaceY(xo, zo, true) - dc;
                        stufen.push(Math.abs(st));
                        selbst.push(Math.abs(st - 2));
                        bias += st;
                        // DIE SEHNE DES RINGS selbst (die Referenz): 15 m draußen im Freien, gegen das Gesetz, das er dort trägt.
                        const xf = bx + sx * 15;
                        const zf = bz + sz * 15;
                        if (!r._chunkDecktRing(xf, zf)) {
                            const yf = hoch(ringMesh, xf, zf);
                            const radF = Math.hypot(xf - fr9.anchorX, zf - fr9.anchorZ);
                            const lawF = r._fernRingDeckMisch(
                                fr9,
                                radF,
                                r._terrainMacroSurfaceY(xf, zf, false),
                                r._terrainMacroSurfaceY(xf, zf, true)
                            );
                            if (yf !== null && !(lawF < wl9)) sehne.push(Math.abs(yf - lawF));
                        }
                    }
                }
                // DER RING WEICHT DEM GEBAUTEN: die Masken-Karte des Rings (`fr.maske`, die sein `maskNode` liest) trägt jeden
                // gezeichneten Chunk. Gemessen wird nach der REGEL, die der maskNode zeichnet (`_fernRingRegel`, ihr CPU-Spiegel:
                // 2 verworfen, 1 Saum — der Ring zeichnet und weicht dem Chunk um `nahtWeiche` in die Tiefe —, 0 frei), an den vier
                // Kanten (innen UND außen, 0,05–1,5 m) und im Inneren:
                //   DAS LOCH — die Regel verwirft, und kein Deck (Chunk oder Stich-Band der 3 × 3 Nachbarn) trifft den senkrechten
                //   Strahl: dort zeichnet niemand (Befund der Prüfung 12.10.: die Zelle verwarf, das Deck lag eine halbe Voxel-Kante
                //   versetzt — 47 von 52 Punkten 5 cm innen an der −X-Kante, im Bild eine blaue Linie über die Bau-Kante).
                //   DER DURCHSTICH — der Ring zeichnet (Saum oder frei), ein Deck liegt darunter, und der Ring (im Saum um die
                //   Weiche gesenkt) steht über ihm.
                // Selbsttest: die alte Regel (die ganze Chunk-Zelle verwirft) MUSS Löcher zeigen; ohne Karte sticht die Sehne durch.
                const M9 = fr9.maske;
                const ti = M9 ? cx - M9.uZelle0.value.x : -1;
                const tj = M9 ? cz - M9.uZelle0.value.y : -1;
                const zelleVon = (x, z) => {
                    const a = Math.floor(x / span9) - (M9 ? M9.uZelle0.value.x : 0);
                    const b = Math.floor(z / span9) - (M9 ? M9.uZelle0.value.y : 0);
                    return !!M9 && a >= 0 && b >= 0 && a < M9.n && b < M9.n && M9.daten[(b * M9.n + a) * 4] === 255;
                };
                maske9[1]++;
                if (!!M9 && ti >= 0 && tj >= 0 && ti < M9.n && tj < M9.n && M9.daten[(tj * M9.n + ti) * 4] === 255)
                    maske9[0]++;
                // DAS DECK, WIE ES GEZEICHNET WIRD: der Boden-Stoff zieht die Grenz-Zeile einer feineren Stufe auf die gröbere
                // Fläche (Geomorph, `positionNode` = position + (aMorphTarget − position) · geomorph · aMorphWeight) — der Strahl
                // trifft die gemorphte Fläche, nie die rohe CPU-Lage (die Stufen-Naht 0 ↔ 1 klafft roh bis zu einer Voxel-Kante).
                const decks = [];
                for (let di = -1; di <= 1; di++)
                    for (let dj = -1; dj <= 1; dj++) {
                        const en = r.state.voxelChunks.get(`${cx + di},${cz + dj}`);
                        if (!r._chunkGezeichnet(en)) continue;
                        decks.push(gemorpht(en.mesh));
                        if (en.lodStitchMesh) decks.push(en.lodStitchMesh);
                    }
                const deckY = (x, z) => {
                    o9.set(x, 4000, z);
                    ray.set(o9, ab);
                    ray.far = 9000;
                    const h = ray.intersectObjects(decks, false);
                    return h.length ? h[0].point.y : null;
                };
                const punkte = [];
                for (let i = 0; i < 7; i++)
                    for (let j = 0; j < 7; j++)
                        punkte.push([cx * span9 + 3 + i * 6.2, cz * span9 + 3 + j * 6.2, "innen"]);
                // je Kante in Voxel-Kanten der Stufe (0,03 … 1,6 s, innen und außen): die erste Vertex-Spalte liegt in der ersten
                // Voxel-Spalte, die Glättung schiebt sie bis über deren Rand
                const s9 = r._voxelChunkConfig(e.lod || 0).step;
                for (const d of [0.03, 0.17, 0.33, 0.5, 0.83, 1.05, 1.25, 1.6].flatMap((f) => [f * s9, -f * s9]))
                    for (let k = 1; k < 8; k++) {
                        const u = (k / 8) * span9;
                        punkte.push([cx * span9 + d, cz * span9 + u, "-X"]);
                        punkte.push([(cx + 1) * span9 - d, cz * span9 + u, "+X"]);
                        punkte.push([cx * span9 + u, cz * span9 + d, "-Z"]);
                        punkte.push([cx * span9 + u, (cz + 1) * span9 - d, "+Z"]);
                    }
                for (const [x, z, seite] of punkte) {
                    const regel = typeof r._fernRingRegel === "function" ? r._fernRingRegel(fr9, x, z) : -1;
                    const yc = deckY(x, z);
                    if (regel === 2) {
                        loch9[1]++;
                        if (yc === null) {
                            loch9[0]++;
                            lochSeite[seite] = (lochSeite[seite] || 0) + 1;
                            if (lochOrte.length < 6)
                                lochOrte.push(`(${x.toFixed(2)}|${z.toFixed(2)}) ${cx},${cz} L${e.lod || 0}`);
                        }
                    }
                    if (zelleVon(x, z)) {
                        lochZelle[1]++;
                        if (yc === null) lochZelle[0]++;
                    }
                    if (yc === null || r._terrainMacroSurfaceY(x, z, true) < wl9 + 0.5) continue;
                    const yr = ringY(x, z);
                    if (yr === null) continue;
                    durch[1]++;
                    if (yr > yc + 0.05) durchOhne++;
                    const ueber = yr - (regel === 1 ? weiche9 : 0) - yc;
                    if (regel !== 2 && ueber > 0.05 && yc < r._terrainMacroSurfaceY(x, z, true) - 2) {
                        // DER EINSCHNITT AM SAUM: das Deck liegt mehr als 2 m unter dem Gesetz (Höhlen-Mündung, Kanal — die
                        // Surface-Nets-Abweichung ist ±0,45 m), der Ring trägt das Gesetz (er kennt keinen Einschnitt) — benannt und
                        // gezählt, nicht die Sehne der Naht
                        muendung9[0]++;
                        muendung9[1] = Math.max(muendung9[1], +ueber.toFixed(1));
                    } else if (regel !== 2 && ueber > 0.05) {
                        durch[0]++;
                        const k = `${seite}:${regel}`;
                        const d = durchSeite[k] || (durchSeite[k] = [0, 0]);
                        d[0]++;
                        d[1] = Math.max(d[1], +ueber.toFixed(2));
                    }
                }
            }
            res.zeit9 = [Math.round(tPump9 - t09), Math.round(performance.now() - tPump9)]; // ms: Ring bauen · Proben
            stufen.sort((a, b) => a - b);
            const q = (p) => (stufen.length ? stufen[Math.min(stufen.length - 1, Math.floor(p * stufen.length))] : NaN);
            res.nahtN = stufen.length;
            res.nahtBias = stufen.length ? bias / stufen.length : NaN;
            selbst.sort((a, b) => a - b);
            sehne.sort((a, b) => a - b);
            res.nahtSehneP95 = sehne.length ? sehne[Math.floor(0.95 * sehne.length)] : NaN;
            res.nahtSelbstP95 = selbst.length ? selbst[Math.floor(0.95 * selbst.length)] : NaN;
            res.nahtP50 = q(0.5);
            res.nahtP95 = q(0.95);
            res.nahtMax = stufen.length ? stufen[stufen.length - 1] : NaN;
            eigen.sort((a, b) => a - b);
            res.nahtEigenP95 = eigen.length ? eigen[Math.floor(0.95 * eigen.length)] : NaN;
            res.durchN = durch[1];
            res.durchAnteil = durch[1] ? durch[0] / durch[1] : NaN;
            res.durchOhne = durch[1] ? durchOhne / durch[1] : NaN;
            res.maskeTreue = maske9;
            res.maskNode = !!(fr9.material && fr9.material.maskNode);
            res.regel = typeof r._fernRingRegel === "function";
            res.loch = loch9;
            res.lochZelle = lochZelle;
            res.lochSeite = lochSeite;
            res.lochOrte = lochOrte;
            res.morph = morphF;
            res.durchSeite = durchSeite;
            res.muendung = muendung9;
            res.weiche = weiche9;
            // ===== (10) DIE FERN-FARBE OHNE STREIFEN =====
            // Längs jeder Ring-Reihe jenseits des Karten-Horizonts (das Kronendach trägt) die gezeichnete Farbe (Boden unter
            // dem Dach zur Deckung, Saison 1): der STREIFEN-INDEX = RMS der Sprünge zum Nachbarpunkt / RMS der Sprünge über
            // vier Punkte. Ein bandbegrenztes Bild steigt mit dem Abstand (glatt ≈ 0,25), ein gefaltetes Mosaik springt schon
            // am Nachbarn so weit wie über vier (≈ 1).
            const dachRand = r.constructor.SCATTER.outerM;
            const W9 = r.constructor.FERN_RING.winkel;
            const indizes = [];
            for (let s = 0; s < 2; s++) {
                const sh = fr9.schalen[s];
                const geo = fr9.meshes[s].geometry;
                const C = geo.attributes.color.array;
                const K = geo.attributes.aKrone.array;
                for (let row = 0; row < sh.reihen; row++) {
                    const rad = sh.inner * Math.pow(sh.aussen / sh.inner, row / (sh.reihen - 1));
                    if (rad < dachRand + 16) continue;
                    const L = new Float64Array(W9);

                    let nass = 0;
                    for (let a = 0; a < W9; a++) {
                        const v = row * W9 + a;
                        const al = K[v * 4 + 3];
                        if (al === 0) nass++;
                        const f = (c) => C[v * 3 + c] + (K[v * 4 + c] - C[v * 3 + c]) * al;
                        L[a] = 0.2126 * f(0) + 0.7152 * f(1) + 0.0722 * f(2);
                    }
                    if (nass > W9 / 4) continue;
                    let s1 = 0;
                    let s4 = 0;
                    for (let a = 0; a < W9; a++) {
                        const d1 = L[(a + 1) % W9] - L[a];
                        const d4 = L[(a + 4) % W9] - L[a];
                        s1 += d1 * d1;
                        s4 += d4 * d4;
                    }
                    if (s4 > 0) indizes.push(Math.sqrt(s1 / s4));
                }
            }
            indizes.sort((a, b) => a - b);
            {
                // SELBSTTEST des Index: ein gefaltetes Mosaik (Pseudo-Zufall je Punkt) springt ≥ 0,8, eine glatte Reihe ≤ 0,3.
                const idxVon = (X) => {
                    let a1 = 0;
                    let a4 = 0;
                    for (let a = 0; a < W9; a++) {
                        a1 += (X[(a + 1) % W9] - X[a]) ** 2;
                        a4 += (X[(a + 4) % W9] - X[a]) ** 2;
                    }
                    return Math.sqrt(a1 / a4);
                };
                let h = 12345;
                const zufall = Float64Array.from(
                    { length: W9 },
                    () => (h = (h * 1103515245 + 12345) >>> 0) / 4294967296
                );
                const glatt = Float64Array.from({ length: W9 }, (_, a) => Math.sin((a / W9) * Math.PI * 6));
                res.streifenSelbst = [idxVon(zufall), idxVon(glatt)];
            }
            res.streifenN = indizes.length;
            res.streifenMedian = indizes.length ? indizes[Math.floor(indizes.length / 2)] : NaN;
            res.streifenP90 = indizes.length ? indizes[Math.floor(indizes.length * 0.9)] : NaN;
        } catch (e9) {
            res.nahtErr = String((e9 && e9.stack) || e9).slice(0, 400);
        }
        try {
            // ===== (11) DAS DACH IST DER BESTAND =====
            // Die Deckung des Kronendachs (Fern-Farbe out[6], fussM 0) gegen die Kronen-Deckung, die der Wald-Generator auf
            // derselben Fläche wirklich stehen lässt: 192 × 192 m um den Spieler, jeder stehende Dart (_forestCellDarts +
            // _forestDartSteht, die Perf-Kappung keep) mit seiner Krone (_kronenRadiusFuer) auf ein 1-m-Raster gemalt, je
            // 32-m-Land-Kachel gegen das Mittel der Dach-Deckung (4-m-Raster). SELBSTTEST: das alte Dach (die Geburt als Deckung,
            // phyto-core forestBestand.geburt) fällt rot.
            const H = 96;
            const pp = r.state.playerMesh.position;
            const x0 = Math.round(pp.x) - H;
            const z0 = Math.round(pp.z) - H;
            const N = 2 * H;
            const F = r.constructor.FOREST;
            const seedInt = r._forestSeedInt();
            const fd = r._effectiveFoliageDensity();
            const memo = new Map();
            const cellDarts = (gx, gz) => {
                const k = gx + "," + gz;
                let d = memo.get(k);
                if (!d) memo.set(k, (d = r._forestCellDarts(gx, gz, seedInt)));
                return d;
            };
            const deck = new Uint8Array(N * N);
            for (let gz = Math.floor(z0 / F.cell); gz <= Math.floor((z0 + N) / F.cell); gz++)
                for (let gx = Math.floor(x0 / F.cell); gx <= Math.floor((x0 + N) / F.cell); gx++)
                    for (const d of cellDarts(gx, gz)) {
                        if (!r._forestDartSteht(d, gx, gz, cellDarts) || (fd < 1 && d.keep >= fd)) continue;
                        const rad = r._kronenRadiusFuer(d.sp, d.s);
                        if (!(rad > 0)) continue;
                        for (
                            let j = Math.max(0, Math.floor(d.z - rad - z0));
                            j <= Math.min(N - 1, Math.ceil(d.z + rad - z0));
                            j++
                        )
                            for (
                                let i = Math.max(0, Math.floor(d.x - rad - x0));
                                i <= Math.min(N - 1, Math.ceil(d.x + rad - x0));
                                i++
                            )
                                if ((x0 + i + 0.5 - d.x) ** 2 + (z0 + j + 0.5 - d.z) ** 2 <= rad * rad)
                                    deck[j * N + i] = 1;
                    }
            const core = globalThis.__phytoCore;
            const fbm = (px, pz) => r._forestFbm(px, pz);
            const wl = r.state.waterLevel;
            const t = new Float32Array(7);
            let g = 0;
            let ng = 0;
            let a = 0;
            let alt = 0;
            let na = 0;
            const K = 32;
            for (let kj = 0; kj < N / K; kj++)
                for (let ki = 0; ki < N / K; ki++) {
                    let gk = 0;
                    let ak = 0;
                    let altK = 0;
                    let land = 0;
                    for (let j = 2; j < K; j += 4)
                        for (let i = 2; i < K; i += 4) {
                            const x = x0 + ki * K + i;
                            const z = z0 + kj * K + j;
                            const y = r._terrainMacroSurfaceY(x, z, true);
                            if (!(y > wl + 0.4)) continue;
                            land++;
                            r._fernFarbeTeile(x, y, z, t, null, 0);
                            ak += t[6];
                            altK += core.forestBestand(fbm, x, z, 0).geburt;
                        }
                    if (land < 48) continue;
                    for (let j = 0; j < K; j++) for (let i = 0; i < K; i++) gk += deck[(kj * K + j) * N + ki * K + i];
                    g += gk / (K * K);
                    ng++;
                    a += ak / land;
                    alt += altK / land;
                    na++;
                }
            res.dachKacheln = ng;
            res.dachGemessen = ng ? g / ng : NaN;
            res.dachDeckung = na ? a / na : NaN;
            res.dachAlt = na ? alt / na : NaN;
        } catch (e11) {
            res.dachErr = String((e11 && e11.stack) || e11).slice(0, 400);
        }
        r._fernRingDispose();
        res.fpDisposed = r.state.feldPass === null || r.state.feldPass === undefined;

        // Hook wiederherstellen (sichern + wiederherstellen, nie löschen):
        if (prevHook === undefined) delete window.__anazhFernRing;
        else window.__anazhFernRing = prevHook;
        return res;
    });

    await browser.close();
    server.close();

    if (out.fatal) {
        console.error(`❌ FATAL: ${out.fatal}`);
        process.exit(2);
    }
    check("4: HEADLESS-DEFAULT — ohne Hook entsteht KEIN Ring (Null-Renderer ruht)", out.headlessQuiet === true);
    check(
        "1: genau 3 Schalen-Meshes in der Szene (Draw-Calls gedeckelt)",
        out.meshCount === 3 && out.sceneMeshes === 3,
        `meshes=${out.meshCount} szene=${out.sceneMeshes}`
    );
    check(
        "1: Vertex-Zahlen wie deklariert (winkel×reihen je Schale)",
        out.vertsDeclared === true,
        `counts=${out.vertCounts && out.vertCounts.join("/")}`
    );
    check("1: EIN geteiltes Material für alle Schalen", out.oneMaterial === true);
    check("1: sichtbar erst nach vollem Refresh + frustumCulled/Schatten aus", out.ready && out.visible && out.flags);
    check("1: LOCH-DECKEL — Schale 1 beginnt am Spieler (0.5·span), deckZoneRad = Ziel-Zone", out.innerRandOk === true);
    check(
        "Bau BUDGETIERT über Ticks (je Tick <= refreshVertsProTick, mehrere Ticks — BOOT_PHASE3-Muster)",
        out.buildBudgeted === true,
        `ticks=${out.buildTicks} maxDelta=${out.buildMaxDelta}`
    );
    check(
        "2: HÖHEN == GESETZ — 60 Proben |mesh − _terrainMacroSurfaceY(snap,false)| < 0.01 (inkl. Wasser-Klemme/Saum)",
        out.probesBad === 0,
        `bad=${out.probesBad} worst=${out.probesWorst && out.probesWorst.toFixed(4)}`
    );
    check("SELBSTTEST: die verfälschte Erwartung (law + 0.5) fällt rot (60/60)", out.selftestRed === true);
    check(
        "3: RE-ZENTRIEREN — der Anker wandert QUANTISIERT nach 400-m-Teleport",
        out.anchorMoved === true && out.anchorQuantized === true
    );
    check(
        "3: der Höhen-Refresh läuft budgetiert durch (Budget-Zähler == totalVerts)",
        out.refreshRan === true && out.reanchorBudgeted === true,
        `ticks=${out.reanchorTicks}`
    );
    check(
        "3b: DAS FERN-FARB-BUDGET — der GPU-Rückruf eines Re-Ankers stellt neue Punkte in die Farb-Schlange, die Takte färben sie leer, keine Fern-Farbe außerhalb des Budgets",
        out.budgetGpu === true && out.budgetOffen > 0 && out.budgetLeer === true && out.budgetAusser === 0,
        `gpu=${out.budgetGpu} offen=${out.budgetOffen} leer=${out.budgetLeer} außerhalb=${out.budgetAusser}`
    );
    check(
        "3: die Proben stimmen am NEUEN Ort (Höhen schwimmen nicht)",
        out.probes2Bad === 0,
        `bad=${out.probes2Bad} worst=${out.probes2Worst && out.probes2Worst.toFixed(4)}`
    );
    check(
        "6: KAMERA-WEITUNG — far = Schale-3-aussen + 500, alter Wert gemerkt",
        out.camWidened === true,
        `far=${out.camFar} soll=${out.camFarWide} alt=${out.camFarAlt}`
    );
    check(
        "6: DIE LUFT TRÄGT — scene.fogNode statt Nebel, Sichtweite am Boden ≥ 5 km, aus 300 m weiter (Höhen-Dunst)",
        out.oeffnungOk === true,
        `boden=${out.sichtBoden} hoch=${out.sichtHoch} zurueck=${out.sichtZurueck} knoten=${out.luftKnoten}${out.loopFehler ? " loopFehler=" + out.loopFehler : ""}`
    );
    check("6: DISPOSE-RÜCKNAHME — camera.far kehrt zum alten Wert zurück, Ring entsorgt", out.disposeRestored === true);
    check(
        "7: DER FELD-ZEICHNER startet den Feld-Flug beim vollen Refresh (gelaende-core hoehe im SPIEL konsumiert)",
        out.fzStart === true && out.fzLaeufe >= 1,
        `laeufe=${out.fzLaeufe}`
    );
    check(
        "7: das Feld malt den Horizont VOR der CPU (ready bei cursor < totalVerts)",
        out.fzReadyVorCpu === true,
        `cursor=${out.fzCursor}/${out.fzTotal}`
    );
    check(
        "7: GPU-Höhen im SEH-Band des dritten Spiegels (≤ 0.5 m auf 8 km, 60 Proben)",
        out.fzProben >= 40 && out.fzWorst >= 0 && out.fzWorst <= 0.5,
        `worst=${Number.isFinite(out.fzWorst) ? out.fzWorst.toFixed(4) : out.fzWorst} proben=${out.fzProben}`
    );
    check("7: die CPU verfeinert danach aufs f64-Gesetz durch (Cursor läuft voll)", out.fzCpuFertig === true);
    check(
        "8: DER FELD-PASS existiert, das Feld malte, das PANORAMA ist gebacken (Persistenz)",
        out.fpDa === true &&
            out.fpLaeufe >= 1 &&
            out.fpTexOk === true &&
            out.fpSichtbar === true &&
            out.fpPanoLaeufe >= 1,
        `laeufe=${out.fpLaeufe} pano=${out.fpPanoLaeufe}`
    );
    check(
        "8: Texel-Höhen == f64-Gesetz im Seh-Band (≤ 0.5 m bis 40 km, Wasser flach auf wl)",
        out.fpWorst >= 0 && out.fpWorst <= 0.5,
        `worst=${Number.isFinite(out.fpWorst) ? out.fpWorst.toFixed(4) : out.fpWorst}`
    );
    check(
        "8: die ECHTE Render-Probe trifft — der Fullscreen-Raymarch zeichnet Horizont-Pixel",
        Number.isFinite(out.fpTreffer) && out.fpTreffer > 50,
        `treffer=${out.fpTreffer}${out.fpRenderErr ? " err=" + out.fpRenderErr : ""}`
    );
    check(
        "8b: DAS EINBLENDEN — ein fern geborener Satz beginnt ganz verworfen und löst sich über WELT_SCHWUND_MS auf, ohne Wunsch erscheint er sofort",
        out.einStart > 0.99 &&
            out.sofortStart === 0 &&
            out.einMitte > 0.2 &&
            out.einMitte < 0.8 &&
            out.einEnde === 0 &&
            out.einAus === true,
        `start=${out.einStart} mitte=${out.einMitte} ende=${out.einEnde} aus=${out.einAus} sofort=${out.sofortStart}${out.einErr ? " " + out.einErr : ""}`
    );
    check("8: der Pass fällt mit dem Ring (Dispose)", out.fpDisposed === true);
    check(
        "9: DIE NAHT — der Ring trägt den Boden-Stoff des Chunks (Wege-Karte + Geologie bauen ihn, dieselben Licht-Knoten)",
        out.nahtStoffGeo > 0 && out.nahtStoffWege > 0 && out.nahtSlotsRing === out.nahtSlotsChunk,
        `geologie=${out.nahtStoffGeo} wege=${out.nahtStoffWege} ring=[${out.nahtSlotsRing}] chunk=[${out.nahtSlotsChunk}]` +
            (out.nahtErr ? ` err=${out.nahtErr}` : "")
    );
    check(
        "9: DIE NAHT — dieselbe Höhe: die Stufe Ring (0,3 m draußen) gegen Chunk (drinnen), je gegen das volle Gesetz — keine Kante (Bias ≤ 0,15 m), p95 ≤ die Sehne des Rings im Freien + die Abweichung des Chunks + 0,1 m; Selbsttest: das alte 2-m-Tauchen fällt rot",
        out.nahtN >= 40 &&
            Math.abs(out.nahtBias) <= 0.15 &&
            out.nahtP95 <= out.nahtSehneP95 + out.nahtEigenP95 + 0.1 &&
            out.nahtSelbstP95 > out.nahtSehneP95 + out.nahtEigenP95 + 0.1,
        `chunks=${out.nahtChunks} proben=${out.nahtN} chunk-eigen-p95=${(+out.nahtEigenP95).toFixed(3)} ring-sehne-p95=${(+out.nahtSehneP95).toFixed(3)} bias=${(+out.nahtBias).toFixed(3)} p50=${(+out.nahtP50).toFixed(3)} p95=${(+out.nahtP95).toFixed(3)} max=${(+out.nahtMax).toFixed(3)} selbsttest-p95=${(+out.nahtSelbstP95).toFixed(3)}`
    );
    check(
        "9: DIE NAHT — kein Loch: wo der maskNode verwirft (`_fernRingRegel` 2), trifft der senkrechte Strahl ein Deck (Chunk oder Stich-Band), an allen vier Kanten innen und außen und im Inneren; Selbsttest: die alte Regel (die ganze Chunk-Zelle verwirft) zeigt Löcher",
        out.regel === true &&
            !!out.loch &&
            out.loch[1] >= 500 &&
            out.loch[0] === 0 &&
            !!out.lochZelle &&
            out.lochZelle[0] > 0,
        `regel=${out.regel} verworfen=${(out.loch || [])[1]} loch=${(out.loch || [])[0]} seiten=${JSON.stringify(out.lochSeite || {})} orte=${JSON.stringify(out.lochOrte || [])} geomorph=${out.morph} selbsttest-zelle=${(out.lochZelle || []).join("/")}` +
            (out.regel === true
                ? ""
                : " — TÄTER: der maskNode hat keinen CPU-Spiegel (`_fernRingRegel`), die ganze Zelle verwirft")
    );
    check(
        "9: DIE NAHT — kein Durchstich: wo der Ring zeichnet, liegt er nicht über dem Deck (im Saum um die Weiche gesenkt — er weicht dem Chunk in die Tiefe); Selbsttest: ohne die Karte sticht seine Sehne durch (> 2 %)",
        out.durchN >= 100 &&
            out.durchAnteil === 0 &&
            out.maskNode === true &&
            !!out.maskeTreue &&
            out.maskeTreue[1] > 0 &&
            out.maskeTreue[0] === out.maskeTreue[1] &&
            out.durchOhne > 0.02,
        `proben=${out.durchN} anteil=${(+out.durchAnteil).toFixed(4)} seiten=${JSON.stringify(out.durchSeite || {})} weiche=${out.weiche} einschnitt=${(out.muendung || []).join("/")} stufen=${JSON.stringify(out.nahtStufen || {})} zeit=${(out.zeit9 || []).join("+")}ms maskNode=${out.maskNode} karte=${(out.maskeTreue || []).join("/")} selbsttest-ohne-karte=${(+out.durchOhne).toFixed(4)}`
    );
    check(
        "10: DIE FERN-FARBE OHNE STREIFEN — Streifen-Index (RMS Nachbar-Sprung / RMS 4er-Sprung) im Median ≤ 0,5",
        out.streifenN >= 10 &&
            out.streifenMedian <= 0.5 &&
            !!out.streifenSelbst &&
            out.streifenSelbst[0] >= 0.8 &&
            out.streifenSelbst[1] <= 0.3,
        `reihen=${out.streifenN} median=${(+out.streifenMedian).toFixed(3)} p90=${(+out.streifenP90).toFixed(3)} selbsttest zufall=${(+(out.streifenSelbst || [])[0]).toFixed(2)} glatt=${(+(out.streifenSelbst || [])[1]).toFixed(2)}`
    );
    {
        const q = out.dachGemessen / out.dachDeckung;
        const qAlt = out.dachGemessen / out.dachAlt;
        check(
            "11: DAS DACH IST DER BESTAND — die Deckung des Kronendachs trifft die Kronen-Deckung des gepflanzten Waldes (192 × 192 m, je 32-m-Land-Kachel) im Verhältnis 0,8–1,25; Selbsttest: das alte Dach (die Geburt als Deckung) fällt rot",
            out.dachKacheln >= 8 && q >= 0.8 && q <= 1.25 && !(qAlt >= 0.8 && qAlt <= 1.25),
            `kacheln=${out.dachKacheln} gepflanzt=${(+out.dachGemessen).toFixed(3)} dach=${(+out.dachDeckung).toFixed(3)} verhaeltnis=${q.toFixed(3)} selbsttest-alt=${(+out.dachAlt).toFixed(3)} (${qAlt.toFixed(3)})` +
                (out.dachErr ? ` err=${out.dachErr}` : "")
        );
    }
    check("5: kein pageerror", pageErrors.length === 0, pageErrors[0] || "");

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DER FERN-RING STEHT UND DAS FELD ZEICHNET: 3 Schalen aus dem EINEN Höhen-Gesetz " +
            "(Fern-Wahrheit includeDetail=false, XZ welt-gesnappt), der Feld-Zeichner malt den vollen " +
            "Refresh aus dem Gelände-Gesetzbuch in Takt-Scheiben (die CPU verfeinert aufs f64-Gesetz), budgetierter Refresh, " +
            "quantisiertes Re-Zentrieren, headless-default ruhig."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Fern-Ring-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
