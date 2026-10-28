// diag-blick.cjs — DIE AUGEN: ein ECHTER Welt-Schuss aus dem Container. Der WebGPU-Frame komponiert nicht in den
// puppeteer-Screenshot: die Welt rendert EINMAL in ein explizites RenderTarget, die Pixel reisen über die
// RENDERER-API zurück (readRenderTargetPixelsAsync, r184 — der Weg des Studio-Bäckers).
//
//   node scripts/diag-blick.cjs [--out DIR] [--zeit 10|22] [--blick wald|boden]
//   Ergebnis: PNG(s) in DIR (Default scratch/blick-*.png) + Exit 0 wenn der Schuss
//   SUBSTANZ trägt (nicht leer/uniform — sonst Exit 1 mit Diagnose).
"use strict";
const { statikServer, bildSeite, webGpuProbe, ROOT: root, hauptLauf } = require("./lib/welt-boot.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.BLICK_PORT || 4461);
const argOut = (() => {
    const i = process.argv.indexOf("--out");
    return i > 0 ? process.argv[i + 1] : root;
})();
const W = 640,
    H = 360;
const server = statikServer();

hauptLauf(async () => {
    await server.lausche(PORT);
    const { browser, page } = await bildSeite({ art: "linse", frist: 600000 }, W, H);
    // KEIN Null-Renderer — die Augen brauchen den echten (WebGPU via swiftshader-Vulkan).
    await server.zeige(page, 60000);
    await page.evaluate(AUSGABE_INSTALL); // die EINE Aufnahme: der echte Frame, getont wie beim Spieler

    await webGpuProbe(page);

    const out = await page.evaluate(
        async (zeitArg, blickArg) => {
            const res = { schuesse: {} };
            const r = await window.__weltDa(() => !(!window.anazhRealm || !window.anazhRealm.state));
            // Settle: die Welt steht (das EINE Einschwingen, welt-boot `__weltStehtNach`, der Takt der Seite)
            await window.__weltStehtNach();
            const rend = r.state.renderer;
            if (!rend) return { fatal: "kein Renderer" };
            res.rendererArt = rend.isWebGPURenderer ? "webgpu" : rend.isWebGLRenderer ? "webgl" : "?";
            res.headlessNull = !!rend._isHeadlessNull;
            if (rend._isHeadlessNull) return res; // ehrlich: ohne echten Renderer kein Schuss

            const cam = r.state.camera;
            const scene = r.state.scene;
            if (!cam || !scene) return { fatal: "kein cam/scene" };
            const schuss = async () => {
                const w = 640,
                    h = 360;
                // die EINE Aufnahme (scripts/lib/ausgabe-aufnahme.cjs): der echte, getonte Frame
                const px = (await window.__ausgabeAufnahme(w, h, 1)).u8;
                if (!px || !px.length) return { ok: false, grund: "keine Pixel" };
                const u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
                // Substanz-Urteil: distinkte Farben + nicht alles eine Fläche.
                const set = new Set();
                let nonzero = 0;
                for (let i = 0; i < u8.length; i += 4 * 97) {
                    set.add(((u8[i] >> 4) << 8) | ((u8[i + 1] >> 4) << 4) | (u8[i + 2] >> 4));
                    if (u8[i] + u8[i + 1] + u8[i + 2] > 12) nonzero++;
                }
                // das PNG (`__png`). GEMESSEN: der WebGPU-Readback liefert die Zeilen bereits TOP-DOWN — kein Y-Flip
                // (der WebGL-Erfahrungswert „bottom-up" gilt hier nicht).
                return { ok: true, farben: set.size, nonzero, png: window.__png(u8, w, h) };
            };

            // Blick einrichten: Augenhöhe in den Wald ODER auf den Boden.
            const pm = r.state.playerMesh && r.state.playerMesh.position;
            if (pm && cam) {
                if (blickArg === "boden") {
                    cam.position.set(pm.x, pm.y + 1.7, pm.z);
                    cam.lookAt(pm.x + 2, pm.y - 2, pm.z + 2);
                } else {
                    cam.position.set(pm.x, pm.y + 1.7, pm.z);
                    cam.lookAt(pm.x + 30, pm.y + 4, pm.z + 30);
                }
                cam.updateMatrixWorld(true);
            }
            // Zeit setzen (Tag/Nacht) über die eine Zeit-Quelle, falls vorhanden.
            try {
                if (zeitArg && r.state.world) r.state.world.timeOfDay = Number(zeitArg) / 24;
            } catch {}
            // Ein paar echte Loop-Ticks, damit Uniforms/Streaming den Blick tragen.
            for (let i = 0; i < 20; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch {}
                await sleep(30);
            }
            res.schuesse.haupt = await schuss("haupt");
            return res;
        },
        process.env.BLICK_ZEIT || (process.argv.includes("--zeit") ? process.argv[process.argv.indexOf("--zeit") + 1] : ""),
        process.argv.includes("--blick") ? process.argv[process.argv.indexOf("--blick") + 1] : "wald"
    );

    await browser.close();
    server.close();

    console.log("\n===== DIE AUGEN (T0) — RT-Readback-Schuss =====");
    if (!out || out.fatal) {
        console.log("FEHLER:", out ? out.fatal : "?"); // die Seiten-Fehler nennt der EINE Sammler (welt-boot)
        process.exit(1);
    }
    console.log(`Renderer: ${out.rendererArt} · headlessNull=${out.headlessNull}`);
    const s = out.schuesse.haupt;
    if (out.headlessNull || !s) {
        console.log("KEIN SCHUSS — Renderer fiel auf Null zurück (WebGPU im Container nicht initialisierbar).");
        process.exit(1);
    }
    if (!s.ok) {
        console.log("SCHUSS LEER:", s.grund);
        process.exit(1);
    }
    const b64 = s.png.split(",")[1];
    const file = path.join(argOut, `blick-${Date.now()}.png`);
    fs.writeFileSync(file, Buffer.from(b64, "base64"));
    const substanz = s.farben >= 8 && s.nonzero > 50;
    console.log(`Schuss: ${file} · distinkte Farben=${s.farben} · nonzero-Proben=${s.nonzero}`);
    console.log(substanz ? "✅ GRÜN — die Augen sehen (Substanz im Bild)." : "❌ ROT — Bild ohne Substanz (leer/uniform).");
    process.exit(substanz ? 0 : 1);
});
