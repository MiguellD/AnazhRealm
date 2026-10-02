// werkbank.cjs — DIE WERKBANK der Look-Arbeit (V18.503): EINE Welt bleibt offen, Fragen gehen per
// Befehl hinein. Befund 01.10.: jede Hypothese startete die Welt neu (Boot + Einschwingen 3–5 min,
// swiftshader 15–100 s je Bild) — 15 Läufe an einem Tag für Fragen, die zusammen ~30 s echte
// Rechenzeit brauchten. Profis tauschen live (Hot-Reload) und lesen Puffer-Ansichten; das hier ist
// der Weg dorthin: die Welt bleibt stehen, eine Methode aus dem Arbeitsbaum wird in die laufende
// Seite getauscht, das Terrain-Material neu gebaut, das Bild ist in Sekunden da.
//
//   node scripts/werkbank.cjs start [--port 4490] [--holz voll|nah|kienspan]
//                                                           Welt + Steuer-Server (bleibt offen)
//   node scripts/werkbank.cjs umstellen <x> <z>            Spieler setzen, einschwingen
//   node scripts/werkbank.cjs bild <px> <py> <pz> <lx> <ly> <lz> [--datei f.png] [--w 640 --h 360]
//                                                           Bühne + echter Frame (Ausgabe-Pfad)
//   node scripts/werkbank.cjs methode <name> [--terrain]   Methode aus anazhRealm.js (Arbeitsbaum)
//                                                           live tauschen; --terrain baut das EINE
//                                                           Chunk-Material neu und hängt es an alle Chunks
//   node scripts/werkbank.cjs eval '<js>'                  Funktionsrumpf in der Seite (r = Welt, T = THREE)
//   node scripts/werkbank.cjs albedo [--nur <regex>] [--ordner d]  DIE ALBEDO-SICHT je Mesh-Klasse
//                                                           (scripts/lib/licht-linsen.cjs; Karte = 0,180)
//   node scripts/werkbank.cjs licht                        DIE LICHT-BILANZ (18-%-Karte, je Licht)
//   node scripts/werkbank.cjs zaehlen [px py pz lx ly lz]  DER DRAW-ZÄHLER: GPU-Befehle + Dreiecke je Pass
//                                                           (Hauptbild · jede Kaskade) und Klasse, ein Frame
//                                                           (scripts/lib/draw-zaehler.cjs)
//   node scripts/werkbank.cjs fluss                        DIE FLUSS-LINSE: was der Foundry-Kanal den Haupt-Thread
//                                                           kostet (Bytes · Entpacken · Platte · Worker-Auslastung);
//                                                           erster Ruf installiert (scripts/lib/fluss-linse.cjs)
//   node scripts/werkbank.cjs takt [n] [--extra a,b]       DIE TAKT-LINSE: CPU je Loop-Subsystem, n Takte, Render
//                                                           ruht (scripts/lib/takt-linse.cjs)
//   node scripts/werkbank.cjs reload | status | stop
//
// Höhen relativ zum Boden: `bild` nimmt py/ly mit Präfix `+` als Abstand über `_voxelSurfaceY(px,pz)`
// bzw. `(lx,lz)` (z. B. `+1.6`). Die Bilder sind dieselbe Aufnahme wie die Beweis-Sonden
// (`scripts/lib/ausgabe-aufnahme.cjs`: Bühne Mittag · Sonne · Sommer, Ausgabe-Pfad).
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const { LINSEN_INSTALL } = require("./lib/licht-linsen.cjs");
const { ZAEHLER_INSTALL } = require("./lib/draw-zaehler.cjs");
const { FLUSS_INSTALL } = require("./lib/fluss-linse.cjs");
const { TAKT_INSTALL } = require("./lib/takt-linse.cjs");

const root = path.resolve(__dirname, "..");
const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : d;
};
const PORT = Number(opt("--port", process.env.WERKBANK_PORT || 4490));
const SEITEN_PORT = PORT - 1;
// Das Holz-Profil der Welt: ohne Wahl erkennt sie swiftshader und fährt „kienspan" (ohne Schatten,
// kleiner Ring) — Kosten-Fragen für das Schöpfer-Holz stellen `--holz voll`.
const HOLZ = opt("--holz", process.env.WERKBANK_HOLZ || "");

// ── Client ──────────────────────────────────────────────────────────────────────────────────────
function rufe(weg, nutzlast) {
    return new Promise((res, rej) => {
        const body = JSON.stringify(nutzlast || {});
        const req = http.request(
            {
                host: "127.0.0.1",
                port: PORT,
                path: weg,
                method: "POST",
                headers: { "Content-Type": "application/json" },
            },
            (r) => {
                let d = "";
                r.on("data", (c) => (d += c));
                r.on("end", () => {
                    try {
                        res(JSON.parse(d));
                    } catch (_e) {
                        res({ roh: d });
                    }
                });
            }
        );
        req.on("error", rej);
        req.setTimeout(0);
        req.end(body);
    });
}

// Eine Klassen-Methode (4 Leerzeichen eingerückt, prettier-Form) aus dem Quelltext schneiden.
function methodeAusQuelle(quelle, name) {
    const kopf = new RegExp(`\\n    (async )?${name}\\(([^)]*)\\) \\{\\n`);
    const m = kopf.exec(quelle);
    if (!m) return null;
    const start = m.index + 1;
    const ende = quelle.indexOf("\n    }\n", start);
    if (ende < 0) return null;
    const text = quelle.slice(start, ende + 6);
    return `(${m[1] || ""}function ${name}(${m[2]}) {${text.slice(text.indexOf("{\n") + 1)})`;
}

// ── Server ──────────────────────────────────────────────────────────────────────────────────────
async function starte() {
    const puppeteer = require("puppeteer");
    const mime = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".wasm": "application/wasm",
        ".json": "application/json",
        ".css": "text/css",
        ".png": "image/png",
        ".woff2": "font/woff2",
    };
    const seiten = http.createServer((req, res) => {
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
    await new Promise((r) => seiten.listen(SEITEN_PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 3600000,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--enable-unsafe-webgpu",
            "--enable-features=Vulkan",
            "--use-vulkan=swiftshader",
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 640, height: 360 });
    const fehler = [];
    page.on("pageerror", (e) => fehler.push((e.message || String(e)).split("\n")[0]));
    const lade = async () => {
        await page.goto(`http://127.0.0.1:${SEITEN_PORT}/index.html${HOLZ ? `?holz=${HOLZ}` : ""}`, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });
        await page.evaluate(AUSGABE_INSTALL);
        await page.evaluate(LINSEN_INSTALL);
        await page.evaluate(ZAEHLER_INSTALL);
        await page.evaluate(FLUSS_INSTALL);
        await page.evaluate(TAKT_INSTALL);
        await page.evaluate(async () => {
            const dl = performance.now() + 300000;
            while (
                (!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 200));
        });
    };
    await lade();
    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null));

    const umstellen = (x, z) =>
        page.evaluate(
            async (x, z) => {
                const r = window.anazhRealm;
                const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
                r.state.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
                let stabil = 0,
                    last = -1,
                    takte = 0;
                const dl = performance.now() + 150000;
                while (performance.now() < dl) {
                    try {
                        window.__buehne();
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    takte++;
                    const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                    if (sz === last) stabil++;
                    else {
                        stabil = 0;
                        last = sz;
                    }
                    if (takte >= 40 && stabil >= 15) break;
                    await sleep(50);
                }
                return { takte, chunks: last };
            },
            x,
            z
        );

    const bild = (k) =>
        page.evaluate(async (k) => {
            const r = window.anazhRealm;
            const rend = r.state.renderer;
            const boden = (x, z, v) =>
                typeof v === "string" && v[0] === "+" ? r._voxelSurfaceY(x, z) + Number(v.slice(1)) : Number(v);
            const px = Number(k.px),
                pz = Number(k.pz),
                lx = Number(k.lx),
                lz = Number(k.lz);
            const py = boden(px, pz, k.py),
                ly = boden(lx, lz, k.ly);
            rend.setAnimationLoop(null);
            window.__buehne();
            const cam = r.state.camera;
            cam.position.set(px, py, pz);
            cam.lookAt(lx, ly, lz + 1e-4);
            cam.updateMatrixWorld(true);
            if (r.state.playerMesh) r.state.playerMesh.visible = false;
            let auf = null;
            for (let i = 0; i < 2; i++) {
                try {
                    if (r.state.fernRing && typeof r._tickFeldPass === "function") r._tickFeldPass(r.state.fernRing);
                } catch (_e) {}
                if (rend.shadowMap) rend.shadowMap.needsUpdate = true;
                auf = await window.__ausgabeAufnahme(k.w, k.h, 1);
            }
            // Die Welt RUHT zwischen den Befehlen (nur `umstellen` tickt): im Leerlauf fraß der Loop unter
            // swiftshader ~3 Kerne und verfälschte jede andere Messung.
            const u8 = auf.u8,
                W = k.w,
                H = k.h;
            const lum = (i) => 0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2];
            let n = 0,
                l = 0,
                k2 = 0;
            for (let y = Math.floor(H / 2); y < H - 1; y++)
                for (let x = 0; x < W - 1; x++) {
                    const i = (y * W + x) * 4;
                    const a = lum(i);
                    l += a;
                    k2 += Math.abs(a - lum(i + 4)) + Math.abs(a - lum(i + W * 4));
                    n++;
                }
            const cv = document.createElement("canvas");
            cv.width = W;
            cv.height = H;
            const ctx = cv.getContext("2d");
            const img = ctx.createImageData(W, H);
            img.data.set(u8.subarray(0, W * H * 4));
            ctx.putImageData(img, 0, 0);
            return {
                kamera: [px, py, pz].map((v) => +v.toFixed(2)),
                hell: +(l / n).toFixed(1),
                kontrast: +(k2 / (2 * n)).toFixed(2),
                dc: auf.info.drawCalls,
                dreiecke: auf.info.triangles,
                ms: Math.round(auf.ms),
                png: cv.toDataURL("image/png"),
            };
        }, k);

    const steuer = http.createServer((req, res) => {
        let d = "";
        req.on("data", (c) => (d += c));
        req.on("end", async () => {
            const send = (o) => {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(o));
            };
            let b = {};
            try {
                b = d ? JSON.parse(d) : {};
            } catch (_e) {}
            const t0 = Date.now();
            try {
                if (req.url === "/status") {
                    const s = await page.evaluate(() => {
                        const st = window.anazhRealm.state;
                        const p = st.playerMesh.position;
                        return {
                            spieler: [p.x, p.y, p.z].map((v) => +v.toFixed(1)),
                            chunks: st.voxelChunks ? st.voxelChunks.size : 0,
                            wetter: st.weather,
                            saison: st.season,
                        };
                    });
                    return send(Object.assign(s, { fehler: fehler.slice(-5) }));
                }
                if (req.url === "/umstellen")
                    return send(Object.assign(await umstellen(+b.x, +b.z), { ms: Date.now() - t0 }));
                if (req.url === "/bild") {
                    const o = await bild(Object.assign({ w: 640, h: 360 }, b));
                    const datei = path.resolve(
                        b.datei || path.join(root, "artifacts", "werkbank", `bild-${Date.now()}.png`)
                    );
                    fs.mkdirSync(path.dirname(datei), { recursive: true });
                    fs.writeFileSync(datei, Buffer.from(o.png.split(",")[1], "base64"));
                    delete o.png;
                    return send(Object.assign(o, { datei, gesamtMs: Date.now() - t0 }));
                }
                if (req.url === "/eval") {
                    const o = await page.evaluate(
                        (code) =>
                            new Function("r", "T", `return (async () => { ${code} })();`)(
                                window.anazhRealm,
                                window.THREE
                            ),
                        b.code
                    );
                    return send({ ergebnis: o, ms: Date.now() - t0 });
                }
                if (req.url === "/methode") {
                    const quelle = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
                    const src = methodeAusQuelle(quelle, b.name);
                    if (!src) return send({ fehler: `Methode ${b.name} nicht gefunden` });
                    const o = await page.evaluate(
                        (name, src, terrain) => {
                            const r = window.anazhRealm;
                            const fn = (0, eval)(src);
                            Object.getPrototypeOf(r)[name] = fn;
                            const aus = { getauscht: name };
                            if (terrain) {
                                const alt = r.state.voxelChunkMaterial;
                                r.state.voxelChunkMaterial = null;
                                const neu = r._getVoxelChunkMaterial();
                                let n = 0;
                                r.state.scene.traverse((m) => {
                                    if (m.material === alt) {
                                        m.material = neu;
                                        n++;
                                    }
                                });
                                aus.chunksNeu = n;
                            }
                            return aus;
                        },
                        b.name,
                        src,
                        !!b.terrain
                    );
                    return send(Object.assign(o, { ms: Date.now() - t0 }));
                }
                if (req.url === "/albedo") {
                    const liste = await page.evaluate((o) => window.__albedoSicht(o), { nur: b.nur || null });
                    const ordner = path.resolve(b.ordner || path.join(root, "artifacts", "werkbank", "albedo"));
                    fs.mkdirSync(ordner, { recursive: true });
                    for (const e of liste) {
                        fs.writeFileSync(
                            path.join(ordner, e.name.replace(/[^a-z0-9_-]+/gi, "_") + ".png"),
                            Buffer.from(e.png.split(",")[1], "base64")
                        );
                        delete e.png;
                    }
                    return send({ klassen: liste, ordner, ms: Date.now() - t0 });
                }
                if (req.url === "/takt") {
                    const o = await page.evaluate((k) => window.__taktZerlegung(k), {
                        n: Number(b.n) || 120,
                        extra: b.extra ? String(b.extra).split(",") : [],
                    });
                    return send(Object.assign(o, { ms: Date.now() - t0 }));
                }
                if (req.url === "/fluss") {
                    const o = await page.evaluate(() => {
                        const i = window.__flussLinse();
                        return i && i.installiert ? i : window.__flussBericht();
                    });
                    return send(Object.assign(o, { ms: Date.now() - t0 }));
                }
                if (req.url === "/zaehlen") {
                    const o = await page.evaluate(async (k) => {
                        const r = window.anazhRealm;
                        window.__buehne();
                        if (k.px != null) {
                            const boden = (x, z, v) =>
                                typeof v === "string" && v[0] === "+"
                                    ? r._voxelSurfaceY(x, z) + Number(v.slice(1))
                                    : Number(v);
                            const cam = r.state.camera;
                            cam.position.set(+k.px, boden(+k.px, +k.pz, k.py), +k.pz);
                            cam.lookAt(+k.lx, boden(+k.lx, +k.lz, k.ly), +k.lz + 1e-4);
                            cam.updateMatrixWorld(true);
                        }
                        try {
                            if (r.state.fernRing) r._tickFeldPass(r.state.fernRing);
                        } catch (_e) {}
                        return window.__drawZensus({ top: 16 });
                    }, b);
                    return send(Object.assign(o, { ms: Date.now() - t0 }));
                }
                if (req.url === "/licht")
                    return send(
                        Object.assign(await page.evaluate(() => window.__lichtBilanz()), { ms: Date.now() - t0 })
                    );
                if (req.url === "/reload") {
                    await lade();
                    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null));
                    return send({ neu: true, ms: Date.now() - t0 });
                }
                if (req.url === "/stop") {
                    send({ stop: true });
                    // Ports SOFORT frei geben (sonst fand ein Neustart :4489 noch belegt — gemessen 01.10.).
                    seiten.close();
                    steuer.close();
                    await browser.close();
                    process.exit(0);
                }
                send({ fehler: "unbekannter Weg " + req.url });
            } catch (e) {
                send({ fehler: String((e && e.message) || e).split("\n")[0], ms: Date.now() - t0 });
            }
        });
    });
    await new Promise((r) => steuer.listen(PORT, "127.0.0.1", r));
    console.log(`WERKBANK bereit: Steuer 127.0.0.1:${PORT} · Seite :${SEITEN_PORT}`);
}

(async () => {
    const cmd = argv[0];
    if (cmd === "start") return starte();
    const a = argv.slice(1).filter((x, i, arr) => !x.startsWith("--") && !(i > 0 && arr[i - 1].startsWith("--")));
    let o;
    if (cmd === "status") o = await rufe("/status");
    else if (cmd === "umstellen") o = await rufe("/umstellen", { x: a[0], z: a[1] });
    else if (cmd === "bild")
        o = await rufe("/bild", {
            px: a[0],
            py: a[1],
            pz: a[2],
            lx: a[3],
            ly: a[4],
            lz: a[5],
            datei: opt("--datei"),
            w: Number(opt("--w", 640)),
            h: Number(opt("--h", 360)),
        });
    else if (cmd === "methode") o = await rufe("/methode", { name: a[0], terrain: argv.includes("--terrain") });
    else if (cmd === "eval") o = await rufe("/eval", { code: a[0] });
    else if (cmd === "albedo") o = await rufe("/albedo", { nur: opt("--nur"), ordner: opt("--ordner") });
    else if (cmd === "licht") o = await rufe("/licht");
    else if (cmd === "fluss") o = await rufe("/fluss", {});
    else if (cmd === "takt") o = await rufe("/takt", { n: a[0], extra: opt("--extra", "") });
    else if (cmd === "zaehlen")
        o = await rufe("/zaehlen", a.length >= 6 ? { px: a[0], py: a[1], pz: a[2], lx: a[3], ly: a[4], lz: a[5] } : {});
    else if (cmd === "reload") o = await rufe("/reload");
    else if (cmd === "stop") o = await rufe("/stop");
    else {
        console.log(fs.readFileSync(__filename, "utf8").split('"use strict"')[0].trimEnd());
        process.exit(1);
    }
    console.log(JSON.stringify(o, null, 1));
})().catch((e) => {
    console.error("WERKBANK-FEHLER:", (e && e.message) || e);
    process.exit(1);
});
