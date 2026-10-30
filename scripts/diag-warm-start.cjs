// diag-warm-start.cjs — DER WARM-START-BEWEIS:
// gebaute uneditierte Chunk-Geometrie reist als GPU-fertige Bytes in IndexedDB
// (DB "anazhChunkMesh") — der zweite Boot einer Welt liest den Ring aus der
// Platte statt aus dem Meshing-Roundtrip. Vier Bänder (Browser, Null-Renderer;
// der Warm-Start ist headless AUS — die Linse erzwingt ihn per Hook
// window.__anazhChunkIdb = true, das __anazhAutoSettlement-Muster):
//   (1) KALT: Probe-Chunks bauen über den Worker → IDB-Einträge > 0 (gestiftet),
//       Probe-Keys liegen im Store.
//   (2) WARM (page.reload, DIESELBE Welt via saveState): Cache-Hits > 0
//       (state._chunkIdbHits) UND die gebaute Geometrie ist BYTE-GLEICH zum
//       Kalt-Lauf (positions-Array FNV-gehasht, kalt == warm, je Probe-Chunk).
//   (3) EDIT-BYPASS: ein Voxel-Edit (fill) im Footprint → derselbe Chunk geht
//       am Cache VORBEI (per-Key-Hit-Zähler wächst dort nicht) und trägt die
//       Edit-Wahrheit (Hash ändert sich — die Wahrheit schlägt den Cache).
//   (4) SELBSTTEST: verfälschter __stamp → der Init-clear greift (Probe-Key
//       weg, Store geleert).
// Die Linse treibt die Pumpe SELBST (headless yieldet setAnimationLoop nicht —
// dieselbe Test-Naht wie playtest.cjs): kein Streaming-Tick läuft nebenher,
// die Zähler bleiben frei von Ring-Rauschen. Jedes Band läuft als DETACHED
// Job im Page-Kontext (window.__jobDone/__jobOut), Node pollt kurz — ein
// minutenlanges page.evaluate stirbt sonst an „Promise was collected".
//   node scripts/diag-warm-start.cjs

const { statikServer, starteBrowser, hauptLauf } = require("./lib/welt-boot.cjs");
const server = statikServer();

// Startet `fn(arg)` DETACHED im Page-Kontext und pollt das Ergebnis — kein
// langlebiges CDP-Promise (die „Promise was collected"-Falle bei Minuten-Jobs).
async function runJob(page, fn, arg) {
    await page.evaluate(
        (src, vok, a) => {
            window.__jobDone = false;
            window.__jobOut = null;
            const [f, V] = [src, vok].map((s) => new Function("return (" + s + ")")());
            Promise.resolve()
                .then(() => f(a, V))
                .then((o) => {
                    window.__jobOut = o || {};
                    window.__jobDone = true;
                })
                .catch((e) => {
                    window.__jobOut = { err: String((e && e.stack) || e).split("\n")[0] };
                    window.__jobDone = true;
                });
        },
        fn.toString(),
        vokabular.toString(),
        arg === undefined ? null : arg
    );
    await page.waitForFunction(() => window.__jobDone, { timeout: 0, polling: 400 });
    return page.evaluate(() => window.__jobOut);
}

// ===== Die Band-Jobs (laufen 1:1 im Browser; nur `arg` reist hinein) =====

// DAS VOKABULAR der Jobs, EINMAL: Boot abwarten (der Faden bereit und worldgen-synchron, sonst null), der Hasher
// (der EINE Abdruck, welt-boot) und die Chunk-Pumpe — `runJob` reicht es jedem Job als zweites Argument (Jobs reisen
// als Strings; bis hierher stand es als kopierte Präambel in jedem Job).
async function vokabular() {
    /* eslint-disable no-undef */
    const r = await window.__weltDa((r) => r.state && r.state.worldMeta && r.state.worldMeta.seed);
    const st = r.state;
    const bereit = () => st.voxelWorkerReady && st.voxelWorkerWorldgenSynced;
    await window.__weltDa(bereit);
    const chunk = (cx, cz) => (st.voxelChunks && st.voxelChunks.get(cx + "," + cz)) || null;
    const posHashOf = (cx, cz) => {
        const e = chunk(cx, cz);
        return e && e.mesh ? window.__abdruck(e.mesh.geometry) : null;
    };
    const pumpChunk = async (cx, cz, ms) => {
        for (const weiter = window.__deckel(`der Chunk ${cx},${cz}`, ms / 25); weiter(); ) {
            const e = chunk(cx, cz);
            if (e && (e.mesh || e.empty)) return e;
            r._ensureVoxelChunkAt(cx, cz, 0);
            await sleep(25);
        }
        return chunk(cx, cz);
    };
    return bereit() ? { r, st, posHashOf, pumpChunk } : null;
}

async function jobKalt(_, V) {
    /* eslint-disable no-undef */
    const W = await V();
    if (!W) return { err: "Voxel-Worker wurde nicht ready/worldgen-synced" };
    const { r, st, posHashOf, pumpChunk } = W;
    const { span } = r._voxelChunkConfig(0);
    const pm = st.playerMesh;
    const pcx = pm ? Math.floor(pm.position.x / span) : 0;
    const pcz = pm ? Math.floor(pm.position.z / span) : 0;
    const cands = [
        [pcx + 3, pcz],
        [pcx - 3, pcz],
        [pcx, pcz + 3],
        [pcx, pcz - 3],
        [pcx + 3, pcz + 3],
        [pcx - 3, pcz - 3],
    ].filter(([cx, cz]) => !st.voxelChunks || !st.voxelChunks.has(cx + "," + cz));
    const t0 = performance.now();
    const probes = [];
    for (const [cx, cz] of cands) {
        const e = await pumpChunk(cx, cz, 60000);
        if (e && e.mesh) probes.push([cx, cz]);
        if (probes.length >= 2) break;
    }
    const kaltMs = Math.round(performance.now() - t0);
    if (probes.length < 2)
        return { err: "keine 2 nicht-leeren Probe-Chunks baubar (Kandidaten: " + cands.length + ")" };
    // Stiftung flushen lassen (fire-and-forget-Puts) + Store befragen.
    await sleep(500);
    const seed = st.worldMeta.seed;
    const keyA = seed + "|" + probes[0][0] + "," + probes[0][1] + "|0";
    const store = await new Promise((resolve) => {
        const req = indexedDB.open("anazhChunkMesh", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("chunks");
        req.onerror = () => resolve({ count: -1, hasKey: null });
        req.onsuccess = () => {
            const db = req.result;
            try {
                const os = db.transaction("chunks", "readonly").objectStore("chunks");
                const c = os.count();
                const g = os.get(keyA);
                c.onsuccess = () =>
                    (g.onsuccess = () => {
                        db.close();
                        resolve({ count: c.result, hasKey: g.result != null });
                    });
                c.onerror = () => {
                    db.close();
                    resolve({ count: -1, hasKey: null });
                };
            } catch {
                db.close();
                resolve({ count: -1, hasKey: null });
            }
        };
    });
    // Welt persistieren, damit der Reload DIESELBE Welt lädt (Seed/Erbgut).
    r.saveState();
    return {
        seed,
        probes,
        kaltMs,
        hashA: posHashOf(probes[0][0], probes[0][1]),
        hashB: posHashOf(probes[1][0], probes[1][1]),
        idbCount: store.count,
        idbHasKeyA: store.hasKey,
        hits: st._chunkIdbHits | 0,
    };
}

async function jobWarm(kaltIn, V) {
    /* eslint-disable no-undef */
    const W = await V();
    if (!W) return { err: "Voxel-Worker wurde nicht ready/worldgen-synced (warm)" };
    const { r, st, posHashOf, pumpChunk } = W;
    if (st.worldMeta.seed !== kaltIn.seed)
        return { err: "Reload lud eine ANDERE Welt (Seed " + st.worldMeta.seed + " != " + kaltIn.seed + ")" };
    const [A, B] = kaltIn.probes;
    const preBuilt =
        !!st.voxelChunks && (st.voxelChunks.has(A[0] + "," + A[1]) || st.voxelChunks.has(B[0] + "," + B[1]));
    if (preBuilt) return { err: "Probe-Chunk war vor der Pumpe schon gebaut (Boot-Verhalten änderte sich)" };
    const t0 = performance.now();
    const eA = await pumpChunk(A[0], A[1], 60000);
    const eB = await pumpChunk(B[0], B[1], 60000);
    const warmMs = Math.round(performance.now() - t0);
    if (!eA || !eA.mesh || !eB || !eB.mesh) return { err: "Warm-Lauf baute die Probe-Chunks nicht" };
    const keyA = A[0] + "," + A[1] + ",0";
    const keyB = B[0] + "," + B[1] + ",0";
    const byKey = st._chunkIdbHitByKey || new Map();
    const out = {
        warmMs,
        hits: st._chunkIdbHits | 0,
        hitA: byKey.get(keyA) | 0,
        hitB: byKey.get(keyB) | 0,
        hashA: posHashOf(A[0], A[1]),
        hashB: posHashOf(B[0], B[1]),
    };
    // BAND 3 — EDIT-BYPASS: ein fill-Edit mitten in Chunk A → der Rebuild
    // MUSS am Cache vorbei (Footprint nicht mehr edit-frei).
    const { span } = r._voxelChunkConfig(0);
    const wx = A[0] * span + span / 2;
    const wz = A[1] * span + span / 2;
    const h = r.getTerrainHeightAt(wx, wz);
    const added = r._addVoxelEdit(wx, h, wz, 3.5, "fill");
    if (!added) return Object.assign(out, { err: "Voxel-Edit wurde nicht angenommen (_addVoxelEdit false)" });
    const hitABefore = byKey.get(keyA) | 0;
    let rebuilt = false;
    for (const weiter = window.__deckel("der Neubau des Chunks", 2400); !rebuilt && weiter(); ) {
        rebuilt = r._rebuildVoxelChunk(A[0], A[1], 0);
        if (!rebuilt) await sleep(25);
    }
    out.rebuilt = rebuilt;
    out.hitABefore = hitABefore;
    out.hitAAfterEdit = (st._chunkIdbHitByKey && st._chunkIdbHitByKey.get(keyA)) | 0;
    out.hashAEdit = posHashOf(A[0], A[1]);
    // BAND 4 (Vorbereitung) — den Stempel VERFÄLSCHEN; der nächste Boot muss
    // den Store leeren (Selbsttest der Drift-Wand).
    out.countBefore = await new Promise((resolve) => {
        const req = indexedDB.open("anazhChunkMesh", 1);
        req.onerror = () => resolve(-1);
        req.onsuccess = () => {
            const db = req.result;
            try {
                const tx = db.transaction("chunks", "readwrite");
                const os = tx.objectStore("chunks");
                os.put("kaputt", "__stamp");
                const c = os.count();
                let n = -1;
                c.onsuccess = () => (n = c.result);
                tx.oncomplete = () => {
                    db.close();
                    resolve(n);
                };
                tx.onerror = () => {
                    db.close();
                    resolve(-1);
                };
            } catch {
                db.close();
                resolve(-1);
            }
        };
    });
    return out;
}

async function jobSelbsttest(kaltIn) {
    /* eslint-disable no-undef */
    const r = await window.__weltDa((r) => r.state && r.state.worldMeta && r.state.worldMeta.seed);
    // die Platte lebt im Faden (Karte hydro-faden): sein erster Auftrag mit Schlüssel (der unberührte Probe-Chunk B) öffnet sie,
    // rechnet den EHRLICHEN Stempel, sieht "kaputt" → clear
    await window.__weltDa(() => r.state.voxelWorkerWorldgenSynced);
    const [bx, bz] = kaltIn.probes[1];
    for (const weiter = window.__deckel("der Chunk B", 2400); weiter() && !r._ensureVoxelChunkAt(bx, bz, 0); )
        await sleep(25);
    const keyA = kaltIn.seed + "|" + kaltIn.probes[0][0] + "," + kaltIn.probes[0][1] + "|0";
    return await new Promise((resolve) => {
        const req = indexedDB.open("anazhChunkMesh", 1);
        req.onerror = () => resolve({ err: "IDB nicht lesbar" });
        req.onsuccess = () => {
            const db = req.result;
            try {
                const os = db.transaction("chunks", "readonly").objectStore("chunks");
                const c = os.count();
                const s = os.get("__stamp");
                const g = os.get(keyA);
                c.onsuccess = () =>
                    (s.onsuccess = () =>
                        (g.onsuccess = () => {
                            db.close();
                            resolve({ count: c.result, keyAWeg: g.result == null, stampNeu: s.result !== "kaputt" });
                        }));
                c.onerror = () => {
                    db.close();
                    resolve({ err: "count scheiterte" });
                };
            } catch {
                db.close();
                resolve({ err: "Transaktion scheiterte" });
            }
        };
    });
}

hauptLauf(async () => {
    await server.lausche(0);
    const browser = await starteBrowser({ art: "null", frist: 300000 });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true; // der Gate-Kontext (kein GPU)
        window.__anazhChunkIdb = true; // den Warm-Start headless ERZWINGEN (Hook-Override in _chunkPlatte)
    });
    await server.zeige(page, 60000);

    // ===== BAND 1: KALT =====
    const kalt = await runJob(page, jobKalt);
    if (kalt.err) {
        console.error("ROT — Kalt-Lauf: " + kalt.err);
        process.exit(1);
    }

    // ===== BAND 2+3: WARM (Reload) — Hits + Byte-Gleichheit + Edit-Bypass =====
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
    const warm = await runJob(page, jobWarm, kalt);
    if (warm.err) {
        console.error("ROT — Warm-Lauf: " + warm.err);
        process.exit(1);
    }

    // ===== BAND 4: verfälschter Stempel → clear greift =====
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
    const selbsttest = await runJob(page, jobSelbsttest, kalt);

    await browser.close();
    server.close();

    console.log("=== WARM-START (DAS FELD ZEICHNET §4) — Chunk-Geometrie aus IndexedDB ===");
    console.log(`  Welt-Seed: ${kalt.seed} · Probe-Chunks: ${JSON.stringify(kalt.probes)}`);
    console.log(
        `  (1) KALT: ${kalt.kaltMs} ms für 2 Probe-Chunks · IDB-Einträge: ${kalt.idbCount} · Probe-Key gestiftet: ${kalt.idbHasKeyA} · Hits (soll 0): ${kalt.hits}`
    );
    console.log(
        `  (2) WARM: ${warm.warmMs} ms für 2 Probe-Chunks · Hits gesamt: ${warm.hits} (A:${warm.hitA} B:${warm.hitB})`
    );
    console.log(`      Byte-Gleichheit A: ${kalt.hashA} == ${warm.hashA} → ${kalt.hashA === warm.hashA}`);
    console.log(`      Byte-Gleichheit B: ${kalt.hashB} == ${warm.hashB} → ${kalt.hashB === warm.hashB}`);
    console.log(
        `  (3) EDIT-BYPASS: Rebuild fertig: ${warm.rebuilt} · Hit-Zähler A vor/nach Edit: ${warm.hitABefore}/${warm.hitAAfterEdit} · Geometrie trägt Edit (Hash neu): ${warm.hashAEdit !== kalt.hashA}`
    );
    if (selbsttest.err) console.log(`  (4) SELBSTTEST-Fehler: ${selbsttest.err}`);
    else
        console.log(
            `  (4) SELBSTTEST: Einträge vor/nach verfälschtem Stempel: ${warm.countBefore}/${selbsttest.count} · Probe-Key weg: ${selbsttest.keyAWeg} · Stempel neu gesetzt: ${selbsttest.stampNeu}`
        );

    const ok =
        kalt.idbCount > 1 && // Stempel + mindestens die Stiftungen
        kalt.idbHasKeyA === true &&
        kalt.hits === 0 && // kalt darf nichts treffen (Store war leer)
        warm.hits > 0 &&
        warm.hitA >= 1 &&
        warm.hitB >= 1 &&
        kalt.hashA != null &&
        kalt.hashA === warm.hashA &&
        kalt.hashB != null &&
        kalt.hashB === warm.hashB &&
        warm.rebuilt === true &&
        warm.hitAAfterEdit === warm.hitABefore && // der Edit-Chunk ging am Cache VORBEI
        warm.hashAEdit !== kalt.hashA && // und trägt die Edit-Wahrheit
        !selbsttest.err &&
        selbsttest.keyAWeg === true &&
        warm.countBefore > selbsttest.count && // clear hat geräumt
        selbsttest.stampNeu === true;
    if (!ok) {
        console.error("\nROT — der Warm-Start-Vertrag steht NICHT (s. Bänder oben).");
        process.exit(1);
    }
    console.log(
        "\nGRÜN — der zweite Boot liest den Ring aus der Platte: gestiftet · getroffen · byte-gleich · Edits schlagen den Cache · Stempel-Wand greift."
    );
    process.exit(0);
});
