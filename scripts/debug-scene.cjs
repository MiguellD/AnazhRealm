const { spawn } = require("child_process");
const puppeteer = require("puppeteer");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", ["save-server.js"], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const timeout = setTimeout(() => {
            if (!ready) reject(new Error("Save-Server"));
        }, 5000);
        proc.stdout.on("data", (chunk) => {
            if (!ready && /läuft/.test(chunk.toString())) {
                ready = true;
                clearTimeout(timeout);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--no-sandbox",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 900 });
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded" });
        await new Promise((r) => setTimeout(r, 5000));

        const info = await page.evaluate(() => {
            const r = window.anazhRealm;
            // Reset versuchen wie im screenshot.cjs
            if (r.state.playerBody && r.state.tmpTransform && r.state.tmpVec1) {
                const t = r.state.tmpTransform;
                t.setIdentity();
                t.setOrigin(r.setVec(r.state.tmpVec1, 0, 10, 0));
                r.state.playerBody.setWorldTransform(t);
                r.state.playerBody.setLinearVelocity(r.setVec(r.state.tmpVec2, 0, 0, 0));
            }
            r.state.yaw = 0;
            return { afterReset: { px: r.state.playerMesh.position.x, py: r.state.playerMesh.position.y, pz: r.state.playerMesh.position.z } };
        });
        console.log("Direkt nach reset:", JSON.stringify(info));

        // 1 Sekunde Physik laufen lassen
        await new Promise((r) => setTimeout(r, 1000));

        const after = await page.evaluate(() => {
            const r = window.anazhRealm;
            // Strukturen vorher cleanen, dann spawnen
            for (const a of r.state.architectures.slice()) {
                if (a.mesh) {
                    r.state.scene.remove(a.mesh);
                    r._disposeSoulGroup(a.mesh);
                }
            }
            r.state.architectures = [];
            const py = r.state.playerMesh.position.y;
            r.spawnArchitecture("village", { x: -14, y: py, z: 18 }, { seed: 7 });
            r.spawnArchitecture("temple", { x: 0, y: py, z: 22 }, { seed: 11 });
            r.spawnArchitecture("waterfall", { x: 14, y: py, z: 18 }, { seed: 3 });
            return {
                player: { x: r.state.playerMesh.position.x, y: r.state.playerMesh.position.y, z: r.state.playerMesh.position.z },
                yaw: r.state.yaw,
                pitch: r.state.pitch,
                camMode: r.state.cameraMode,
                cam: { x: r.state.camera.position.x, y: r.state.camera.position.y, z: r.state.camera.position.z },
                arch: r.state.architectures.map((a) => ({ id: a.id, type: a.type, x: a.mesh.position.x, y: a.mesh.position.y, z: a.mesh.position.z, children: a.mesh.children.length })),
            };
        });
        console.log("Nach Spawn (1s spaeter):", JSON.stringify(after, null, 2));

        await page.evaluate(() => { window.anazhRealm.setCameraMode("third"); });
        await new Promise((r) => setTimeout(r, 800));
        const camThird = await page.evaluate(() => {
            const r = window.anazhRealm;
            return {
                player: { x: r.state.playerMesh.position.x, y: r.state.playerMesh.position.y, z: r.state.playerMesh.position.z },
                cam: { x: r.state.camera.position.x, y: r.state.camera.position.y, z: r.state.camera.position.z },
            };
        });
        console.log("3rd-Person-Pose:", JSON.stringify(camThird, null, 2));
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((e) => { console.error(e); process.exit(1); });
