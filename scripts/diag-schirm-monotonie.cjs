// diag-schirm-monotonie.cjs — DIE SCHIRM-WAND (gate:schirm-monotonie, 06.10.): ein kleinerer Schirm trägt höchstens
// gleich viel Welt — je Pass und Täter-Klasse —, und jedes Gesetz liest den Schirm aus der EINEN Quelle (`_schirm`).
//
// Befund (OMEN GTX 1060, main 2b60988b, EINE Welt, gleiche Stellgrößen): „beim Verkleinern des Fensters verdoppeln sich
// Befehle und Dreiecke" (1080p 124 · 720p/540p 267–276 · zurück 126). Gemessen 06.10. (Radeon 890M, Mess-Wiese, dieselben
// Stellgrößen): die Welt zeichnet in jeder Größe dasselbe — `werkbank zaehlen` 282/283 Befehle bei 1080p, 540p und 4K,
// je gerendertem Frame im Mittel 227–235 von 540p bis 4K. Die Sprung-Zahl war das Perzentil des Werkbank-Laufs über die
// TAKTE: die nahe Kaskade rendert jeden zweiten Frame, das Perzentil sprang zwischen den zwei Moden (540p 273 und im
// nächsten Lauf 176). Und zwei Gesetze lasen den Schirm an der EINEN Quelle vorbei: der Geräte-Seed (innerWidth·dpr,
// VERKEHRT herum: ab 4 MPix 0,1–0,2 weniger Welt) und das Fell-Gesetz (Canvas-Höhe, Rückfall 1080 und 60°).
//
// Die Wand fährt die echte Welt (Null-Renderer, Foundry an; sein Zeichenpuffer ist der Canvas, den der ECHTE
// resize-Handler setzt):
//   Q  QUELLE (kommentar-frei): eine Schirm-Größe (Zeichenpuffer · Canvas-Maß · Fenster-Maß · Bildschirm) liest nur die
//      EINE Quelle `_schirmMessen`; die Erzeuger des Puffers und die UI-Lage stehen namentlich in der Erlaubnis — jede
//      andere Methode ist ein zweiter Weg und wird mit Zeile genannt.
//   K  KONSUM: `_schirm()` folgt dem Fenster, und das Fell-Gesetz liest ihn im echten Takt — derselbe Wolf im selben
//      Abstand trägt sein Fell im großen Fenster und im kleinen nicht (ein kleinerer Schirm schaltet früher ab).
//   M  MONOTONIE: dieselbe Welt (Bühne Mittag · Sonne · Sommer je Takt gehalten, Tiere still, Regler headless voll,
//      eingeschwungen, bis sie nicht mehr wächst) in drei Fenstergrößen, gespiegelt (groß → klein → groß), je Größe drei
//      Proben aus Takten durch den echten Loop: der Szenen-Zensus je Pass (haupt = Kamera-Layer, schatten = castShadow;
//      ein unsichtbarer Ahne betritt keinen Pass) und Täter-Klasse (`_taeterKlasse`). Befehle und Dreiecke im kleineren
//      Fenster ≤ im größeren, geurteilt über Spannen und beide Klammern (Partikel atmen, ein Satz kriecht nach — beides
//      ohne den Schirm, die Drift steht im Bericht).
// SELBSTTEST (--selftest, nach der Messung in derselben Welt): (a) ein eingeschmuggeltes Gesetz liest `_schirm()`
// VERKEHRT (die Probe-Gruppe `schirmProbe` zeichnet mehr Instanzen, je kleiner der Schirm) → M rot, die Klasse genannt;
// (b) eine eingeschmuggelte Zeile liest die Canvas-Höhe an `_schirm` vorbei → Q rot, die Methode genannt; (c) die Quelle
// eingefroren (ein fester Schirm) → K rot.
//   node scripts/diag-schirm-monotonie.cjs [--selftest]       (npm run gate:schirm-monotonie; Port SCHIRM_PORT)
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");

const PORT = Number(process.env.SCHIRM_PORT || 4579);
const root = path.resolve(__dirname, "..");
const SELBST = process.argv.includes("--selftest");
// groß → klein; die Reihe läuft gespiegelt zurück (groß → klein → groß), jede kleinere Größe zwischen zwei Klammern
const GROESSEN = [
    [1280, 720],
    [960, 540],
    [640, 360],
];
const TAKTE = 12; // Takte je Probe
const PROBEN = 3; // Proben je Größe (die Spanne)
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};

// ── Q: die Quelle ─────────────────────────────────────────────────────────────────────────────────────────────────────
const SCHIRM_RE =
    /getDrawingBufferSize\s*\(|domElement\.(?:width|height|clientWidth|clientHeight)\b|\binnerWidth\b|\binnerHeight\b|\bscreen\.(?:width|height|availWidth|availHeight)\b|\bvisualViewport\b/;
const ERLAUBT = {
    _schirmMessen: "die EINE Quelle (Zeichenpuffer + Sichtfeld)",
    _configureRenderer: "Erzeuger des Zeichenpuffers (setSize)",
    init: "Erzeuger: Canvas, Kamera-Seitenverhältnis, resize-Handler",
    _installHelpPopovers: "UI-Lage (Hilfe-Popover im Fenster)",
    _installResizeHandle: "UI-Lage (Panel-Griff)",
};
const KOPF = /^ {4}(?:static\s+)?(?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*$/;
// Block-Kommentare behalten ihre Zeilenumbrüche (die Zeilennummern der Befunde bleiben die der Datei).
function ohneKommentare(src) {
    return src
        .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ""))
        .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
}
function quellBefunde(src) {
    const b = [];
    const zeilen = ohneKommentare(src).split("\n");
    let methode = null;
    let quelleLiest = false;
    zeilen.forEach((z, i) => {
        const k = KOPF.exec(z);
        if (k) methode = k[1];
        if (!SCHIRM_RE.test(z)) return;
        if (methode === "_schirmMessen") quelleLiest = true;
        if (!methode || !ERLAUBT[methode])
            b.push(`${methode || "?"} (Zeile ${i + 1}) liest die Schirm-Größe an \`_schirm\` vorbei: \`${z.trim().slice(0, 90)}\``);
    });
    if (!quelleLiest) b.push("die EINE Quelle `_schirmMessen` liest den Zeichenpuffer nicht (getDrawingBufferSize)");
    if (!/_fellBildschirmGesetz\([^)]*\)\s*\{[\s\S]{0,900}?this\._schirm\(\)\.pxJeM/.test(src))
        b.push("das Fell-Gesetz liest den Schirm nicht aus `_schirm()`");
    return b;
}

// ── M: das Urteil über die Zensus-Reihe (rein, Node) ──────────────────────────────────────────────────────────────────
// reihe = die gespiegelte Folge groß → klein → groß (1280×720 · 960×540 · 640×360 · 960×540 · 1280×720), je Größe
// { groesse, proben: [{ "<klasse>|<pass>": { cmd, tris } }, …] }. Zwei Dinge bewegen die Welt ohne den Schirm: Zufälliges
// (Partikel — der Dorf-Rauch atmet bei fester Größe 23–26 Befehle) und langsames Wachsen (der Wasser-Satz kroch über eine
// Reihe 2124 → 2152 Dreiecke; gemessen 06.10.). Darum urteilt die Wand über SPANNEN und KLAMMERN: eine Größe trägt die
// Proben beider Durchgänge, und VERKEHRT ist eine Klasse erst, wenn JEDE Probe im kleineren Fenster über JEDER im
// größeren liegt — eine Drift hebt die spätere Klammer mit und wird nie als Schirm-Gesetz gelesen (sie steht als DRIFT im
// Bericht, wenn die beiden Enden der Reihe sich nicht treffen).
function monotonieBefunde(reihe) {
    const b = [];
    const L = reihe.length;
    const stufen = (L + 1) / 2; // groß … klein
    const schluessel = new Set(reihe.flatMap((r) => r.proben.flatMap((z) => Object.keys(z))));
    const werte = (r, k, f) => r.proben.map((z) => (z[k] ? z[k][f] : 0));
    const spanne = (w) => ({ lo: Math.min(...w), hi: Math.max(...w) });
    const stufe = (i, k, f) => spanne(i === L - 1 - i ? werte(reihe[i], k, f) : [...werte(reihe[i], k, f), ...werte(reihe[L - 1 - i], k, f)]);
    const zeige = (s) => (s.lo === s.hi ? `${s.lo}` : `${s.lo}–${s.hi}`);
    for (const k of schluessel) {
        const [kl, pass] = [k.slice(0, k.lastIndexOf("|")), k.slice(k.lastIndexOf("|") + 1)];
        for (const f of ["cmd", "tris"]) {
            const was = f === "cmd" ? "Befehle" : "Dreiecke";
            for (let i = 1; i < stufen; i++) {
                const gross = stufe(i - 1, k, f),
                    klein = stufe(i, k, f);
                if (klein.lo > gross.hi)
                    b.push(
                        `VERKEHRT ${kl} · ${pass}: ${was} ${reihe[i].groesse} ${zeige(klein)} > ${reihe[i - 1].groesse} ${zeige(gross)} — ein kleinerer Schirm zeichnet mehr`
                    );
            }
        }
    }
    return b;
}
// Die Drift (Bericht, kein Urteil): Klassen, deren Anfang und Ende der Reihe (dieselbe Größe) sich nicht treffen.
function driftBefunde(reihe) {
    const a = reihe[0],
        e = reihe[reihe.length - 1];
    const aus = [];
    for (const k of new Set([...a.proben, ...e.proben].flatMap((z) => Object.keys(z)))) {
        const w = (r) => r.proben.map((z) => (z[k] ? z[k].tris : 0));
        const [wa, we] = [w(a), w(e)];
        if (Math.min(...we) > Math.max(...wa) || Math.max(...we) < Math.min(...wa))
            aus.push(`${k.replace("|", " · ")} ${Math.min(...wa)}–${Math.max(...wa)} → ${Math.min(...we)}–${Math.max(...we)} Dreiecke`);
    }
    return aus;
}

// ── die Welt ──────────────────────────────────────────────────────────────────────────────────────────────────────────
async function welt() {
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
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 900000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: GROESSEN[0][0], height: GROESSEN[0][1], deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const seitenFehler = [];
    page.on("pageerror", (e) => seitenFehler.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(AUSGABE_INSTALL);
    const ende = async () => {
        await browser.close();
        server.close();
    };

    // Boot · Mess-Wiese · Einschwingen · Bühne · stille Tiere · der Wolf der Fell-Probe
    const boot = await page.evaluate(async (groessen) => {
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        const dl = performance.now() + 240000;
        while ((!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") && performance.now() < dl)
            await sleep(100);
        const r = window.anazhRealm;
        if (!r) return { fatal: "keine Welt" };
        if (!r.state.renderer || !r.state.renderer._isHeadlessNull) return { fatal: "kein Null-Renderer" };
        const st = r.state;
        const f = r._ensureAssetFoundry ? r._ensureAssetFoundry() : null;
        while (!(f && f.ready && f.recipeCount > 0) && performance.now() < dl) await sleep(100);
        if (!(f && f.ready)) return { fatal: "Foundry nicht bereit" };
        // DER TAKT der Wand: der echte Loop unter gehaltener Bühne (Mittag, Wetter fest — die Tageszeit lief in der langen
        // Einschwing-Schleife davon und zog Feuerstelle und Zacken mit, gemessen 06.10.).
        window.__schirmTakt = () => {
            st._frameOverBudget = false;
            st.timeOfDay = 0.5;
            if (st.world) st.world.timeOfDay = 0.5;
            window.__wetterHalten();
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            // Der Probe-Wolf behält sein Maß: zwei Schreiber lassen Tiere im Takt wachsen (`updateGrowth` ×1,01, die
            // Nexus-Geste `creatures_size_mul` bis ×3 je Ruf) — ein Lauf traf den Wolf 13,8-fach, nachdem d* stand.
            const wolf = window.__schirmWolf;
            if (wolf && window.__schirmWolfMass) wolf.scale.setScalar(window.__schirmWolfMass);
        };
        const takt = window.__schirmTakt;
        // DER SZENEN-ZENSUS je Täter-Klasse und Pass: haupt = Kamera-Layer, schatten = castShadow; ein unsichtbarer Ahne
        // betritt keinen Pass, eine leere Instanz-Senke zeichnet nicht. Befehle wie der Draw-Zähler (BatchedMesh je Instanz).
        window.__schirmZensus = () => {
            const camLayers = st.camera.layers;
            const z = {};
            const buche = (kl, pass, cmd, tris) => {
                const e = z[kl + "|" + pass] || (z[kl + "|" + pass] = { cmd: 0, tris: 0 });
                e.cmd += cmd;
                e.tris += Math.round(tris);
            };
            const lauf = (o) => {
                if (o.visible === false) return;
                if (o.isMesh || o.isPoints || o.isLine || o.isSprite) {
                    const g = o.geometry;
                    let cmd = 1,
                        tris = 0;
                    if (o.isBatchedMesh) {
                        cmd = o._multiDrawCount | 0;
                        const c = o._multiDrawCounts;
                        for (let i = 0; i < cmd; i++) tris += c[i] / 3;
                    } else if (g) {
                        const nn = g.index ? g.index.count : g.attributes.position ? g.attributes.position.count : 0;
                        const dr =
                            g.drawRange && Number.isFinite(g.drawRange.count) ? Math.min(g.drawRange.count, nn) : nn;
                        tris = dr / 3;
                        if (o.isInstancedMesh) {
                            tris *= o.count;
                            if (!(o.count > 0)) cmd = 0;
                        }
                    }
                    if (cmd > 0) {
                        const kl = r._taeterKlasse(o);
                        if (o.layers.test(camLayers)) buche(kl, "haupt", cmd, tris);
                        if (o.castShadow) buche(kl, "schatten", cmd, tris);
                    }
                }
                for (const c of o.children) lauf(c);
            };
            lauf(st.scene);
            return z;
        };
        const x = -900,
            z = -850;
        st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
        const offen = () =>
            (f.pending ? f.pending.size : 0) +
            (f.warte ? f.warte.length : 0) +
            (r._foundryIngestQueue ? r._foundryIngestQueue.length : 0);
        let stabil = 0,
            last = -1,
            takte = 0;
        while (performance.now() < dl && takte < 3000) {
            takt();
            takte++;
            const sz = st.voxelChunks ? st.voxelChunks.size : 0;
            stabil = sz === last && offen() === 0 ? stabil + 1 : 0;
            last = sz;
            if (takte >= 120 && stabil >= 40) break;
            await sleep(15);
        }
        window.__buehne();
        window.__tiereHalten();
        // DER WOLF DER FELL-PROBE: im Abstand d*, an dem das Fell-Gesetz im großen Fenster trägt (px ≥ pxMin·(1+hyst)) und
        // im kleinen nicht (px < pxMin·(1−hyst)) — das geometrische Mittel der Schwellen der beiden Ränder der Reihe.
        const cam = st.camera;
        const vor = new window.THREE.Vector3();
        cam.getWorldDirection(vor);
        vor.y = 0;
        vor.normalize();
        const wx = cam.position.x + vor.x * 4,
            wz = cam.position.z + vor.z * 4;
        const w = r.spawnCreatureAt(wx, r._voxelSurfaceY(wx, wz) + 0.5, wz, "happy", "wolf", { bodySize: 1 });
        if (!w) return { fatal: "Wolf-Spawn scheiterte" };
        w.userData.task = { name: "wait", args: {}, since: performance.now() / 1000 };
        w.userData.emotions = null;
        window.__schirmWolf = w;
        window.__schirmWolfMass = w.scale.x;
        for (let i = 0; i < 400 && !(w.userData._tierBaum && w.userData._tierBaum.wrap); i++) {
            takt();
            await sleep(15);
        }
        const tB = w.userData._tierBaum;
        if (!tB) return { fatal: "der Wolf trägt keine Studio-Gestalt" };
        // DIE STILLE: gemessen wird erst, wenn die Welt nicht mehr WÄCHST — dreimal in Folge (je 30 Takte) übersteigt keine
        // Klasse ihr bisheriges Maximum (Zufälliges wie der Rauch atmet innerhalb seiner Spanne und hält die Stille nicht auf).
        const hoch = {};
        const waechst = () => {
            let ja = false;
            for (const [k, e] of Object.entries(window.__schirmZensus())) {
                const h = hoch[k] || (hoch[k] = { cmd: -1, tris: -1 });
                if (e.cmd > h.cmd || e.tris > h.tris) ja = true;
                h.cmd = Math.max(h.cmd, e.cmd);
                h.tris = Math.max(h.tris, e.tris);
            }
            return ja;
        };
        waechst();
        let still = 0,
            stillTakte = 0;
        const dlStill = performance.now() + 120000;
        while (still < 3 && performance.now() < dlStill) {
            for (let i = 0; i < 30; i++) {
                takt();
                stillTakte++;
                await sleep(10);
            }
            still = waechst() ? 0 : still + 1;
        }
        // erst nach der Stille: der Wolf steht im Abstand d* seines jetzigen Maßes
        const F = r.constructor.FELL_BILDSCHIRM;
        const breite = F.breiteM * (tB.f || 1) * (w.scale.x || 1);
        const pxJeM = (h) => h / (2 * Math.tan((cam.fov * Math.PI) / 360));
        const gross = groessen[0][1],
            klein = groessen[groessen.length - 1][1];
        const dStern = (breite * Math.sqrt(pxJeM(gross) * pxJeM(klein))) / F.pxMin;
        // horizontal so weit, dass der 3D-Abstand d* ist (die Kamera steht über dem Boden)
        for (let k = 0; k < 3; k++) {
            const dy = cam.position.y - w.position.y;
            const hz = Math.sqrt(Math.max(0.25, dStern * dStern - dy * dy));
            const px = cam.position.x + vor.x * hz,
                pz = cam.position.z + vor.z * hz;
            w.position.set(px, r._voxelSurfaceY(px, pz) + 0.5, pz);
            takt();
            await sleep(15);
        }
        return {
            takte,
            stillTakte,
            still: still >= 3,
            chunks: last,
            foundryOffen: offen(),
            dStern: +dStern.toFixed(2),
            dWolf: +cam.position.distanceTo(w.position).toFixed(2),
            nahGrenze: +(Math.sqrt(r.constructor.TIER_FERN_DIST_SQ) * (w.scale.x || 1)).toFixed(1),
        };
    }, GROESSEN);
    if (boot.fatal) {
        await ende();
        return { fatal: boot.fatal, seitenFehler };
    }

    // Eine Größe: der ECHTE resize-Handler (Viewport), Takte durch den Loop, dann Schirm, Fell und Zensus.
    const phase = async (w, h) => {
        await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
        await new Promise((res) => setTimeout(res, 150));
        return page.evaluate(
            async (TAKTE, PROBEN) => {
                const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
                const r = window.anazhRealm;
                const st = r.state;
                const proben = [];
                for (let p = 0; p < PROBEN; p++) {
                    for (let i = 0; i < TAKTE; i++) {
                        window.__schirmTakt();
                        await sleep(10);
                    }
                    proben.push(window.__schirmZensus());
                }
                const s = r._schirm();
                const w = window.__schirmWolf;
                const tB = w && w.userData._tierBaum;
                return {
                    schirm: { breite: s.breite, hoehe: s.hoehe, pxJeM: s.pxJeM == null ? null : +s.pxJeM.toFixed(1) },
                    fell: tB ? tB._fellAn : null,
                    dWolf: w ? +st.camera.position.distanceTo(w.position).toFixed(2) : null,
                    proben,
                };
            },
            TAKTE,
            PROBEN
        );
    };
    const reihe = async () => {
        const aus = [];
        for (const [w, h] of [...GROESSEN, ...GROESSEN.slice(0, -1).reverse()]) aus.push(Object.assign({ groesse: `${w}×${h}` }, await phase(w, h)));
        return aus;
    };

    const messung = await reihe();
    let selbst = null;
    if (SELBST) {
        selbst = {};
        // (a) ein VERKEHRTES Gesetz: die Probe-Gruppe liest `_schirm()` und zeichnet mehr Instanzen, je kleiner der Schirm
        await page.evaluate(() => {
            const r = window.anazhRealm;
            const T = window.THREE;
            const probe = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial(), 64);
            probe.name = "schirmProbe";
            probe.frustumCulled = false;
            r.state.scene.add(probe);
            const roh = Object.getPrototypeOf(r)._schirmMessen;
            r._schirmMessen = function () {
                const s = roh.call(this);
                r.constructor._instanzZahl(probe, Math.min(64, Math.round((8 * 720) / Math.max(1, s.hoehe))));
                return s;
            };
            window.__schirmProbe = probe;
        });
        selbst.verkehrt = await reihe();
        await page.evaluate(() => {
            const r = window.anazhRealm;
            delete r._schirmMessen;
            r.state.scene.remove(window.__schirmProbe);
        });
        // (c) die Quelle EINGEFROREN: ein fester Schirm (der alte Rückfall 1080) — das Fell folgt dem Fenster nicht mehr
        await page.evaluate(() => {
            const r = window.anazhRealm;
            const roh = Object.getPrototypeOf(r)._schirmMessen;
            r._schirmMessen = function () {
                const s = roh.call(this);
                s.hoehe = 1080;
                s.pxJeM = 1080 / (2 * Math.tan((this.state.camera.fov * Math.PI) / 360));
                return s;
            };
        });
        selbst.eingefroren = await reihe();
        await page.evaluate(() => {
            delete window.anazhRealm._schirmMessen;
        });
    }
    await ende();
    return { boot, messung, selbst, seitenFehler };
}

// K: das Fell-Gesetz folgt dem Schirm (Reihe groß → klein → Kontrolle)
function konsumBefunde(reihe) {
    const b = [];
    const [a, , c] = reihe;
    const kontrolle = reihe[reihe.length - 1];
    if (!(a.schirm.hoehe === GROESSEN[0][1] && c.schirm.hoehe === GROESSEN[2][1]))
        b.push(`der Schirm folgt dem Fenster nicht (${reihe.map((x) => x.schirm.hoehe).join(" → ")} Bildpunkte hoch)`);
    if (!(a.schirm.pxJeM > c.schirm.pxJeM)) b.push(`pxJeM fällt mit dem Fenster nicht (${a.schirm.pxJeM} → ${c.schirm.pxJeM})`);
    if (a.fell !== true) b.push(`der Wolf trägt im großen Fenster (${a.groesse}, ${a.dWolf} m) kein Fell — die Probe ist blind`);
    if (c.fell !== false)
        b.push(`der Wolf trägt im kleinen Fenster (${c.groesse}, ${c.dWolf} m) noch Fell — das Fell-Gesetz liest den Schirm nicht`);
    if (kontrolle.fell !== true) b.push(`zurück im großen Fenster kehrt das Fell nicht zurück (${kontrolle.fell})`);
    return b;
}

(async () => {
    let ok = true;
    const check = (name, befunde) => {
        const gut = befunde.length === 0;
        console.log(`  ${gut ? "✅" : "❌"} ${name}`);
        for (const b of befunde.slice(0, 12)) console.log(`      ${b}`);
        if (befunde.length > 12) console.log(`      … ${befunde.length - 12} weitere`);
        if (!gut) ok = false;
    };
    const src = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    console.log("=== Schirm-Wand: Q · die EINE Quelle ===");
    check("Q jede Schirm-Größe liest `_schirm` (Erzeuger und UI-Lage namentlich erlaubt)", quellBefunde(src));

    const w = await welt();
    if (w.fatal) {
        console.log(`  ❌ Welt: ${w.fatal}`);
        for (const e of w.seitenFehler.slice(0, 4)) console.log(`      ${e}`);
        console.log("ROT schirm-monotonie");
        process.exit(1);
    }
    const b = w.boot;
    console.log(
        `=== Welt: ${b.takte} Takte, ${b.chunks} Chunks, Foundry offen ${b.foundryOffen}, still nach ${b.stillTakte} Takten (${b.still ? "ja" : "NEIN"}) · Fell-Probe d* ${b.dStern} m (Wolf ${b.dWolf} m, Nah-Grenze ${b.nahGrenze} m) ===`
    );
    for (const p of w.messung) {
        const sum = (pass) =>
            Object.entries(p.proben[0])
                .filter(([k]) => k.endsWith("|" + pass))
                .reduce((a, [, e]) => ({ cmd: a.cmd + e.cmd, tris: a.tris + e.tris }), { cmd: 0, tris: 0 });
        const hp = sum("haupt"),
            sp = sum("schatten");
        console.log(
            `  ${p.groesse.padEnd(9)} Schirm ${p.schirm.breite}×${p.schirm.hoehe} pxJeM ${p.schirm.pxJeM} · haupt ${hp.cmd} Befehle ${hp.tris} Dreiecke · schatten ${sp.cmd} / ${sp.tris} · Wolf-Fell ${p.fell}`
        );
    }
    console.log("=== K · das Fell-Gesetz liest den Schirm ===");
    check("K derselbe Wolf: Fell im großen Fenster, keines im kleinen, zurück im großen", konsumBefunde(w.messung));
    console.log("=== M · ein kleinerer Schirm trägt höchstens gleich viel (je Pass und Täter-Klasse) ===");
    check("M Befehle und Dreiecke fallen oder halten von groß nach klein (Spannen, beide Klammern)", monotonieBefunde(w.messung));
    for (const d of driftBefunde(w.messung)) console.log(`      (Drift, ohne Schirm) ${d}`);
    if (w.seitenFehler.length) check("keine Seiten-Fehler", w.seitenFehler.slice(0, 4));

    if (SELBST) {
        console.log("=== SELBSTTEST ===");
        const sa = monotonieBefunde(w.selbst.verkehrt);
        check(
            "S(a) ein verkehrtes Gesetz (schirmProbe liest `_schirm` verkehrt) färbt M rot und nennt die Klasse",
            sa.some((x) => /^VERKEHRT schirmProbe · haupt/.test(x)) ? [] : ["M blieb blind: " + (sa[0] || "kein Befund")]
        );
        for (const x of sa.filter((y) => /schirmProbe/.test(y)).slice(0, 2)) console.log(`      (Selbsttest) ${x}`);
        const eingeschmuggelt = src.replace(
            "const pxJeM = this._schirm().pxJeM;",
            "const pxJeM = this.state.renderer.domElement.height / 1.53;"
        );
        const sb = quellBefunde(eingeschmuggelt);
        check(
            "S(b) eine Zeile liest die Canvas-Höhe an `_schirm` vorbei: Q rot, die Methode genannt",
            eingeschmuggelt !== src && sb.some((x) => /^_fellBildschirmGesetz \(Zeile \d+\)/.test(x))
                ? []
                : ["Q blieb blind: " + (sb[0] || "kein Befund")]
        );
        for (const x of sb.slice(0, 2)) console.log(`      (Selbsttest) ${x}`);
        const sc = konsumBefunde(w.selbst.eingefroren);
        check(
            "S(c) die Quelle eingefroren (fester Schirm 1080): K rot",
            sc.some((x) => /noch Fell|folgt dem Fenster nicht/.test(x)) ? [] : ["K blieb blind"]
        );
        for (const x of sc.slice(0, 2)) console.log(`      (Selbsttest) ${x}`);
    }
    console.log(ok ? "GRÜN schirm-monotonie" : "ROT schirm-monotonie");
    process.exit(ok ? 0 : 1);
})().catch((e) => {
    console.error("SCHIRM-WAND-FEHLER:", (e && e.stack) || e);
    process.exit(1);
});
