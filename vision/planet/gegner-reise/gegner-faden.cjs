// GEGNER: was der Planet-Faden nach dem Anker weiter traegt - Zeit des Ankers (Wanduhr Rundreise), die Kosten EINER Hydro-Kachel
// im Planet-Faden (derselbe Auftrag, den der EINE Sender jedem Neben-Faden schickt) gegen dieselbe im Voxel-Faden, die Zahl der
// Kacheln nach dem Boot. Null-Renderer.
const { statikServer, nullWelt, hauptLauf } = require("./lib/welt-boot.cjs");
const server = statikServer();
hauptLauf(async () => {
    const { browser, page } = await nullWelt(server, { frist: 300000 }, 60000);
    const out = await page.evaluate(async () => {
        /* eslint-disable no-undef */
        const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
        for (let i = 0; i < 2400 && !(r.state.voxelWorkerReady && r.state.voxelWorkerWorldgenSynced); i++) await sleep(50);
        const t0 = performance.now();
        const a = await r._planetAnker();
        const ankerMs = performance.now() - t0;
        const f = r._nebenFaeden.get("planet");
        const kacheln = (r.state.hydroTiles ? r.state.hydroTiles.size : 0);
        const faeden = [...r._nebenFaeden.keys()];
        // EINE ferne Kachel, zweimal je Faden (die erste kalt), gleiche Bestellung: Rundreise im Planet-Faden und im Voxel-Faden
        const S = r._voxelWorkerSnapshotState && null;
        const zeit = async (fn) => { const t = performance.now(); await fn(); return performance.now() - t; };
        const pl = [], vx = [];
        for (let k = 0; k < 3; k++) {
            const origin = { x: 8192 + 2048 * k, z: -8192 };
            pl.push(await zeit(() => r._nebenAuftrag("planet", { type: "hydro", key: "gegner-p" + k, origin })));
            vx.push(await zeit(() => new Promise((ok, ab) => { const id = r.state.voxelWorkerNextRequestId++; r.state.voxelWorkerPending.set(id, { resolve: ok, reject: ab }); r.state.voxelWorker.postMessage({ type: "hydro", key: "gegner-v" + k, origin: { x: origin.x, z: origin.z + 2048 * 4 }, requestId: id }); })));
        }
        const heim = []; for (let k = 0; k < 2; k++) heim.push(await zeit(() => r._nebenAuftrag("planet", { type: "hydro", key: "heim", origin: null })));
        const fremd = []; for (let k = 0; k < 3; k++) fremd.push(await zeit(() => r._nebenAuftrag("planet", { type: "planet-anker", samen: "gegner-anker-" + k })));
        return { heimImPlanetMs: heim, ankerFremdMs: fremd, samen: a.samen, breite: a.breite * 180 / Math.PI, ankerRundreiseMs: ankerMs, kachelnNachBoot: kacheln, faeden, planetHydroMs: pl, voxelHydroMs: vx };
    });
    console.log(JSON.stringify(out));
    await browser.close();
    server.close();
    process.exit(0);
});
