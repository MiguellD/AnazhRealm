// Die CPU des Abstands-Marschs in einer Null-Welt (kein GPU-Prozess): Spieler an die Mess-Wiese, Chunks bauen lassen, dann
// marsch-mess.js. node null-marsch.cjs <spiel-baum> [port]
"use strict";
const path = require("path");
const fs = require("fs");
const baum = path.resolve(process.argv[2] || "/home/user/spiel-a");
process.chdir(baum);
const { statikServer, nullSeite } = require(path.join(baum, "scripts/lib/welt-boot.cjs"));
const { messort } = require(path.join(baum, "scripts/lib/welt-orte.cjs"));
const SP = "/tmp/claude-0/-home-user-AnazhRealm/5349db1b-b38b-5a7e-8191-e2588ec49c10/scratchpad";
(async () => {
    const t0 = Date.now();
    const server = statikServer();
    await server.lausche(Number(process.argv[3] || 4761));
    const { browser, page } = await nullSeite({ frist: 600000 });
    try {
        await server.zeige(page);
        await page.evaluate(() => window.__weltDa((x) => x.state.worldMeta && x.state.worldMeta.worldId));
        const m = messort("wiese");
        console.log("Welt da nach " + ((Date.now() - t0) / 1000).toFixed(1) + " s · Wiese " + JSON.stringify(m.spieler || m));
        const sp = m.spieler || [m.x, m.z];
        await page.evaluate(async (x, z, gier) => {
            const s = r.state;
            window.__anazhAutoSettlement = false;
            s.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
            if (Number.isFinite(gier)) (s.yaw = gier), (s.pitch = 0);
            r.setCameraMode("first");
            await window.__weltStehtNach(null, 3000);
        }, sp[0], sp[1], m.blick && Number.isFinite(m.gier) ? m.gier : null);
        console.log("Welt steht nach " + ((Date.now() - t0) / 1000).toFixed(1) + " s · Chunks " + (await page.evaluate(() => r.state.voxelChunks.size)));
        const code = fs.readFileSync(path.join(SP, process.argv[4] || "marsch-mess.js"), "utf8");
        for (let i = 0; i < (process.argv[5] ? 1 : 2); i++) {
            const e = await page.evaluate((c) => new Function("r", "T", "return (async () => { " + c + " })();")(window.anazhRealm, window.THREE), code);
            console.log("MARSCH " + JSON.stringify(e));
        }
    } finally {
        await browser.close();
        server.close();
    }
})().catch((e) => (console.log("FEHLER " + (e && e.stack)), (process.exitCode = 1)));
