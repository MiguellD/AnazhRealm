// TRAA in Bewegung aus dem Ausgabe-Pfad: node bewegung.cjs <port> <ordner>
// Uhren fest (Wind, Knoten), Tiere und Spieler aus; je Weg 32 Frames Ruhe an der Start-Pose, dann N Frames entlang des
// Wegs (die zeitliche Auflösung trägt ihre Geschichte durch die Bewegung), Aufnahme des letzten Frames (1920×1080).
const http = require("http");
const fs = require("fs");
const path = require("path");
const [port, ordner] = process.argv.slice(2);
fs.mkdirSync(ordner, { recursive: true });

const WEGE = [
    // Name, Start x/z, Ende x/z (seitlich), Gier Start/Ende (Bogenmaß, 0 = Blick nach −z)
    { name: "dreh", px: -900, pz: -850, dx: 0, dz: 0, gier0: -0.3, dgier: 0.6, n: 30 },
    { name: "geh", px: -903, pz: -850, dx: 6, dz: 0, gier0: 0, dgier: 0, n: 30 },
];

function code(w) {
    return `
const rend = r.state.renderer;
rend.setAnimationLoop(null);
window.__buehne();
for (const c of r.state.creatures || []) c.visible = false;
if (r.state.playerMesh) r.state.playerMesh.visible = false;
const P = Object.getPrototypeOf(r);
r._loopRender = function () { return P._loopRender.call(this, 1000); };
const nf = rend._nodes.nodeFrame;
nf.update = function () { this.frameId++; this.deltaTime = 0; this.time = 1000; };
const cam = r.state.camera;
const db = rend.getDrawingBufferSize(new T.Vector2());
const W = Math.round(db.x), H = Math.round(db.y);
const rt = new T.RenderTarget(W, H, { depthBuffer: true, samples: 0 });
const vorOut = rend.getOutputRenderTarget(), vorZiel = rend.getRenderTarget();
rend.setOutputRenderTarget(rt);
const W_ = ${JSON.stringify(w)};
const setze = (t) => {
    const x = W_.px + W_.dx * t, z = W_.pz + W_.dz * t;
    const y = r._voxelSurfaceY(x, z) + 1.7;
    const a = W_.gier0 + W_.dgier * t;
    cam.position.set(x, y, z);
    cam.lookAt(x + Math.sin(a) * 30, y - 1.2, z - Math.cos(a) * 30);
    cam.updateMatrixWorld(true);
};
const frame = () => { nf.update(); if (r._schattenAlleNeu) r._schattenAlleNeu(); r._loopRender(1000); };
try {
    setze(0);
    for (let i = 0; i < 32; i++) frame();
    for (let i = 1; i <= W_.n; i++) { setze(i / W_.n); frame(); }
    const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
    const roh = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
    const zeile = W * 4, schritt = roh.length > zeile * H ? Math.ceil(zeile / 256) * 256 : zeile;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d"); const img = ctx.createImageData(W, H);
    for (let y = 0; y < H; y++) img.data.set(roh.subarray(y * schritt, y * schritt + zeile), y * zeile);
    ctx.putImageData(img, 0, 0);
    return cv.toDataURL("image/png");
} finally {
    rend.setOutputRenderTarget(vorOut); rend.setRenderTarget(vorZiel); rt.dispose();
}`;
}

function rufe(c) {
    return new Promise((res, rej) => {
        const req = http.request(
            { host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } },
            (r) => {
                let d = "";
                r.on("data", (x) => (d += x));
                r.on("end", () => res(JSON.parse(d)));
            }
        );
        req.on("error", rej);
        req.setTimeout(0);
        req.end(JSON.stringify({ code: c }));
    });
}

(async () => {
    for (const w of WEGE) {
        const o = await rufe(code(w));
        if (!o || typeof o.ergebnis !== "string") {
            console.log(w.name, "FEHLER", JSON.stringify(o).slice(0, 300));
            continue;
        }
        fs.writeFileSync(path.join(ordner, w.name + ".png"), Buffer.from(o.ergebnis.split(",")[1], "base64"));
        console.log(w.name, "ok", o.ms, "ms");
    }
})();
