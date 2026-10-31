// diag-gpu-fehler.cjs — DER SELBSTTEST DER GPU-FEHLER-LINSE (scripts/lib/gpu-fehler.cjs). Die Linse
// muss einen Draw ohne gesetzten Vertex-Slot SYNCHRON mit Pipeline und Pass nennen und die Device-Meldung fangen — sonst
// wäre jede „0 Fehler"-Zahl der Werkbank vakuös. Eine nackte WebGPU-Seite (swiftshader, kein Spiel): eine Pipeline mit
// ZWEI Vertex-Puffern, gesetzt nur Slot 0, ein drawIndexed → die Linse nennt Slot 1; dieselbe Pipeline mit beiden Slots →
// kein Eintrag.
//   node scripts/diag-gpu-fehler.cjs --selftest
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const { statikServer, starteBrowser, hauptLauf, sleep, selbsttestEnde } = require("./lib/welt-boot.cjs");
const { GPU_FEHLER_INSTALL, GPU_ABGABE } = require("./lib/gpu-fehler.cjs");

const { errs, check } = require("./lib/welt-boot.cjs").pruefer();

async function probe() {
    const F = window.__gpuFehler;
    if (!F) return { err: "Abgriff fehlt" };
    const adapter = navigator.gpu && (await navigator.gpu.requestAdapter());
    if (!adapter) return { err: "kein Adapter" };
    const dev = await adapter.requestDevice();
    const code = `@vertex fn vs(@location(0) a: vec3f, @location(1) b: f32) -> @builtin(position) vec4f { return vec4f(a * b, 1.0); }
@fragment fn fs() -> @location(0) vec4f { return vec4f(1.0); }`;
    const mod = dev.createShaderModule({ code });
    const pipe = dev.createRenderPipeline({
        label: "probe_zwei_puffer",
        layout: "auto",
        vertex: {
            module: mod,
            entryPoint: "vs",
            buffers: [
                { arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }] },
                { arrayStride: 4, attributes: [{ shaderLocation: 1, offset: 0, format: "float32" }] },
            ],
        },
        fragment: { module: mod, entryPoint: "fs", targets: [{ format: "rgba8unorm" }] },
        primitive: { topology: "triangle-list" },
    });
    const tex = dev.createTexture({ size: [4, 4], format: "rgba8unorm", usage: GPUTextureUsage.RENDER_ATTACHMENT });
    // DIE LEINWAND DER PAUSE (welt-boot `leinwandSeite`): der volle Lauf zeichnet in die Leinwand und hält ihren Pass über eine
    // Schleife von 7 s offen — die Akte (Stillstand 3 s) hält die Seite darin an, der Submit fällt als Folge der Pause
    const leinwand = document.querySelector("canvas").getContext("webgpu");
    leinwand.configure({ device: dev, format: "rgba8unorm" });
    const vb0 = dev.createBuffer({ size: 36, usage: GPUBufferUsage.VERTEX });
    const vb1 = dev.createBuffer({ size: 12, usage: GPUBufferUsage.VERTEX });
    const ib = dev.createBuffer({ size: 12, usage: GPUBufferUsage.INDEX });
    const lauf = (beide) => {
        const enc = dev.createCommandEncoder({ label: "probe_encoder" });
        const pass = enc.beginRenderPass({
            label: beide ? "probe_pass_voll" : "probe_pass_luecke",
            colorAttachments: [{ view: (beide ? leinwand.getCurrentTexture() : tex).createView(), loadOp: "clear", storeOp: "store" }],
        });
        pass.setPipeline(pipe);
        pass.setVertexBuffer(0, vb0);
        if (beide) pass.setVertexBuffer(1, vb1);
        pass.setIndexBuffer(ib, "uint32");
        pass.drawIndexed(3);
        pass.end();
        if (beide) __leinwandSchleife(7000);
        dev.queue.submit([enc.finish()]);
    };
    lauf(false);
    const nachLuecke = F.draws.length;
    await sleep(500); // die Meldung des Lochs kommt an, bevor die Pause den vollen Lauf hält (in ihr verfiele sie)
    lauf(true);
    const nachVoll = F.draws.length;
    await dev.queue.onSubmittedWorkDone();
    await sleep(300);
    return { nachLuecke, nachVoll, draw: F.draws[0] || null, device: F.device.slice(0, 2), folgen: window.__weltPausenFolgen, zerstoert: F.device.filter((d) => /^Destroyed/.test(d.msg)).length };
}

// DER GEGENDRUCK: das Gerät `name` reicht laufend ein und gibt jeden Submit `spaet` ms spät ab (< 0: nie)
async function gegendruck([name, spaet]) {
    const dev = await (await navigator.gpu.requestAdapter()).requestDevice({ label: name });
    const q = dev.queue;
    const roh = q.onSubmittedWorkDone;
    q.onSubmittedWorkDone = () => (spaet < 0 ? new Promise(() => {}) : roh.call(q).then(() => sleep(spaet)));
    setInterval(() => q.submit([dev.createCommandEncoder().finish()]), 50);
}

hauptLauf(async () => {
    if (!process.argv.includes("--selftest")) {
        console.log(
            "Gebrauch: node scripts/diag-gpu-fehler.cjs --selftest (die Linse selbst fährt in der Werkbank: gpu-fehler)"
        );
        process.exit(0);
    }
    console.log("=== SELBST-TEST: die GPU-Fehler-Linse nennt den Draw ohne Vertex-Slot beim Namen ===");
    const seite = "<canvas></canvas><script>__leinwandSchleife=(ms)=>{for(const e=performance.now()+ms;performance.now()<e;);}</script>";
    const server = statikServer({ seiten: { "/": seite } });
    await server.lausche(0);
    const browser = await starteBrowser({ art: "linse", stallMs: 3000 });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(GPU_FEHLER_INSTALL);
    await server.zeige(page, undefined, "");
    const out = await page.evaluate(probe);
    // DIE ABGABE, Stillstand 1,5 s: 3 s spät, aber laufend abgegeben, wartet sie; ohne Bild nennt sie das Bild; hängt
    // ein Gerät, während ein zweites weiter abgibt, nennt sie das hängende
    const abgabe = async (t0 = Date.now()) => ({
        m: await Promise.race([
            GPU_ABGABE(page, 1500),
            new Promise((r) => setTimeout(r, 20000, ["wartet 20 s ohne Namen"])),
        ]),
        s: (Date.now() - t0) / 1000,
    });
    await page.evaluate(gegendruck, ["spaet", 3000]);
    await sleep(3500);
    const spaet = await abgabe();
    await page.evaluate(() => ((window.__raf = requestAnimationFrame), (window.requestAnimationFrame = () => 0)));
    const ohneBild = await abgabe();
    await page.evaluate(() => (window.requestAnimationFrame = window.__raf));
    await page.evaluate(gegendruck, ["haengt", -1]);
    await sleep(500);
    const zwei = await abgabe();
    await browser.close();
    server.close();
    if (out.err) check("Probe lief", false, out.err);
    else {
        const d = out.draw || {};
        check(
            "der Draw ohne Slot 1 steht mit Pipeline und Pass im Protokoll",
            out.nachLuecke === 1 &&
                Array.isArray(d.fehlt) &&
                d.fehlt.join() === "1" &&
                d.pipeline === "probe_zwei_puffer" &&
                d.pass === "probe_pass_luecke",
            d
        );
        check("der Draw mit beiden Slots bleibt still", out.nachVoll === 1, `Einträge ${out.nachVoll}`);
        check("die Leinwand der Pause: der Submit fällt als ihre Folge, das Gerät hört keinen Bruch", out.folgen?.length === 1 && !out.zerstoert, JSON.stringify(out.folgen)); // prettier-ignore
        check(
            "die Device-Meldung (uncapturederror) kommt an, mit dem Pass",
            out.device.length >= 1 && /vertex buffer|slot/i.test(out.device[0].msg),
            JSON.stringify(out.device[0] || null).slice(0, 240)
        );
    }
    const still = (a) => a.m.filter((x) => / s (kein|ohne)/.test(x)).join(" | ");
    check(`ABGABE: 3 s spät, aber laufend abgegeben — sie wartet ${spaet.s} s`, spaet.s > 1.5 && !still(spaet));
    check(
        "ABGABE: die Welt zeichnet kein Bild — rot beim Bild, nie beim Gerät",
        /^1.5 s kein Bild vor/.test(still(ohneBild)),
        still(ohneBild)
    );
    check(
        "ABGABE: ein Gerät hängt, ein zweites gibt ab — rot beim hängenden",
        /^Gerät 3 haengt gibt [^|]*$/.test(still(zwei)),
        still(zwei)
    );
    selbsttestEnde(errs, "die GPU-Fehler-Linse nennt den fehlenden Vertex-Slot mit Pipeline und Pass.");
    process.exit(0);
});
