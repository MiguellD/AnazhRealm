// k4-bild.cjs — studios.K4 „Studio = Welt im Bild" als Probe der Sitzung (punkte.cjs fahreSitzung): je Mesh-Studio DASSELBE
// Werk in der Bühne des Studios und in der warmen Welt der Sitzung, bei gleicher Pose, aus dem Ausgabe-Pfad beider Seiten.
//
//   node k4-bild.cjs <AUS.json> <PORT>          im Spiel-Baum (cwd), WERKBANK_PORT = die Werkbank der Sitzung
//
// DAS WERK: die Bühne nennt es selbst — die Seite läuft im Rahmen einer Gastgeber-Seite, ihr Knopf „In der Welt ansehen" (die
// Hülle, `bruecke({ werk })`) postet { kind, preset, seed, ov } an den Rahmen; die Probe gibt GENAU diese Nachricht der Welt
// (`_studioUebergabeEmpfang`, der EINE Übergabe-Kanal) und setzt das nächste Werk dieser Art (`spawnArchitecture`, Drehung 0,
// der Stempel `_studioStampFor` trägt die Prägung und den Samen `__gestalt`).
// DIE POSE: die Vorschau-Kamera der Welt — Gier 0,6, Neigung 0,32, fov 45, der Abstand aus dem Rahmen-Gesetz der Welt
// (`_workshopRahmen`: die Box füllt 0,7 der Bildkante) an der Box des gesetzten Werks; die Bühne steht im SELBEN Verhältnis
// Abstand/Radius vor ihrer Wurzel. Mittag (die Bühne der Werkbank hält Mittag · Sonne · Sommer).
// DAS BILD: Welt `werkbank bild --klasse ^f:<preset>:L\d$ --wahl 0` (1920 × 1080, Ausgabe-Pfad); die Klasse liest die Probe
// aus der Masken-Datei (jeder Klassen-Pixel trägt 0,6 · Bild + 0,4 · Ton seiner Klasse). Bühne: derselbe Schuss durch ihren
// Ausgabe-Weg (Composer oder Renderer, scripts/lib/albedo-tafel.cjs STUDIOS), die Maske ein Schuss der Wurzel allein in Weiß.
// Bild-Differenz = Anteil der Gestalt-Pixel (Vereinigung beider Masken), die nur eine Seite trägt oder deren Luma um mehr als
// 18 springt; Soll ≤ 2,1 %.
// DIE ALBEDO: die Albedo-Tafel beider Seiten (spec/farbe/albedo-tafel.json; Welt `werkbank albedo --tafel` am Ort der Tafel,
// Labor `diag-albedo-tafel.cjs --labor --echt`), je Studio jede Zeile seines Labors: |Labor/Welt − 1| ≤ 0,10.
// Nach <AUS.json>: { geraet, studios: { <id>: { werk, welt, buehne, differenz, albedo, gruen, grund, sek } }, albedo, fehler }.
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const cp = require("child_process");

const [AUS, PORT_ARG] = process.argv.slice(2);
const PORT = Number(PORT_ARG);
const ROOT = process.cwd();
const WB = require(path.join(ROOT, "scripts", "lib", "welt-boot.cjs"));
const AT = require(path.join(ROOT, "scripts", "lib", "albedo-tafel.cjs"));
const WP = Number(process.env.WERKBANK_PORT);
const DIR = AUS.replace(/\.json$/, "") + "-k4";
fs.mkdirSync(DIR, { recursive: true });
const STUDIOS = ["garage", "portale", "schmiede", "fachwerk", "terrain", "koerperstudio", "tetrapoda"];
const [W, H] = [1920, 1080];
const SOLL = { differenz: 0.021, albedo: 0.1 };
const POSE = { gier: 0.6, neigung: 0.32, fov: 45 };
const TOENE = [[255, 80, 80], [80, 255, 80], [80, 120, 255], [255, 220, 60], [255, 80, 255], [60, 230, 230], [255, 150, 40], [180, 120, 255]];
const t0 = Date.now();
const sek = (t) => +((Date.now() - t) / 1000).toFixed(1);
const ruf = (weg, o) => WB.werkbankRuf(WP, weg, o);
async function welt(code) {
    const r = await ruf("/eval", { code });
    if (!r || !("ergebnis" in r)) throw new Error("eval: " + JSON.stringify(r).slice(0, 300));
    if (r.ergebnis && r.ergebnis.fehler) throw new Error(r.ergebnis.fehler);
    return r.ergebnis;
}
const wb = (args, ms) =>
    cp.spawnSync(process.execPath, [path.join("scripts", "werkbank.cjs"), ...args], {
        encoding: "utf8",
        timeout: ms || 600000,
        maxBuffer: 1 << 28,
        env: { ...process.env, WERKBANK_PORT: String(WP) },
    });

// ── PNG (8 Bit, RGB/RGBA, ohne Zeilensprung) → RGBA ──
function pngLesen(datei) {
    const b = fs.readFileSync(datei);
    let [i, w, h, typ] = [8, 0, 0, 0];
    const idat = [];
    while (i < b.length) {
        const n = b.readUInt32BE(i), t = b.toString("ascii", i + 4, i + 8), d = b.subarray(i + 8, i + 8 + n);
        if (t === "IHDR") {
            [w, h, typ] = [d.readUInt32BE(0), d.readUInt32BE(4), d[9]];
            if (d[8] !== 8 || d[12] !== 0) throw new Error(datei + ": PNG nicht 8 Bit ohne Zeilensprung");
        }
        if (t === "IDAT") idat.push(d);
        i += 12 + n;
    }
    const bpp = { 2: 3, 6: 4 }[typ];
    if (!bpp) throw new Error(datei + ": PNG-Farbtyp " + typ);
    const roh = zlib.inflateSync(Buffer.concat(idat)), st = w * bpp, out = new Uint8Array(w * h * 4);
    let vor = new Uint8Array(st);
    for (let y = 0; y < h; y++) {
        const f = roh[y * (st + 1)], z = roh.subarray(y * (st + 1) + 1, (y + 1) * (st + 1)), jetzt = new Uint8Array(st);
        for (let x = 0; x < st; x++) {
            const a = x >= bpp ? jetzt[x - bpp] : 0, u = vor[x], c = x >= bpp ? vor[x - bpp] : 0;
            const p = a + u - c, [pa, pb, pc] = [Math.abs(p - a), Math.abs(p - u), Math.abs(p - c)];
            jetzt[x] = (z[x] + [0, a, u, (a + u) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? u : c][f]) & 255;
        }
        for (let x = 0; x < w; x++) for (let k = 0; k < 4; k++) out[(y * w + x) * 4 + k] = k < bpp ? jetzt[x * bpp + k] : 255;
        vor = jetzt;
    }
    return { w, h, d: out };
}
const luma = (u8, i) => 0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2];
// die Klasse aus der Maske der Werkbank: ein Klassen-Pixel trägt round(0,6 · Bild + 0,4 · Ton) seiner Klasse
function klasseAusMaske(bild, maske) {
    const m = new Uint8Array(bild.w * bild.h);
    for (let p = 0; p < m.length; p++) {
        const i = p * 4;
        m[p] = TOENE.some((t) => [0, 1, 2].every((k) => Math.abs(maske.d[i + k] - Math.round(0.6 * bild.d[i + k] + 0.4 * t[k])) <= 2)) ? 1 : 0;
    }
    return m;
}
// die Bild-Differenz über der Vereinigung der Masken
function differenz(lA, mA, lB, mB) {
    let [u, d, beide] = [0, 0, 0];
    for (let p = 0; p < mA.length; p++) {
        if (!mA[p] && !mB[p]) continue;
        u++;
        if (mA[p] && mB[p]) beide++;
        if (!mA[p] || !mB[p] || Math.abs(lA[p] - lB[p]) > 18) d++;
    }
    return { anteil: u ? +(d / u).toFixed(4) : null, gestalt: u, beide };
}

// ── DIE BÜHNE: die Studio-Seite im Rahmen einer Gastgeber-Seite (eigener Browser auf der Karte, eigener Server) ──
const GAST = (pfad) =>
    `<!doctype html><meta charset="utf-8"><body style="margin:0;overflow:hidden"><iframe id="f" src="/${pfad}" style="border:0;width:${W}px;height:${H}px"></iframe>` +
    `<script>window.__werk=null;addEventListener("message",function(e){if(e.data&&e.data.type==="uebergabe")window.__werk=e.data;});</script>`;
// die Bereitschaft (die strenge CSP der Seiten erlaubt new Function nur im Aufruf von außen)
const BEREIT = (S) => {
    const g = (n) => new Function(`return typeof ${n} !== "undefined" ? ${n} : undefined;`)();
    const w = g(S.wurzel);
    let n = 0;
    if (w) w.traverse((x) => (n += x.isMesh ? 1 : 0));
    return n > 0 && !!g(S.renderer) && g(S.renderer)._initialized !== false && !!document.querySelector(".h-werk");
};
// der Schuss der Bühne: dieselbe Pose (Richtung + Abstand/Radius) vor der Box ihrer Wurzel, Bild über den Ausgabe-Weg, Maske
// der Wurzel allein in Weiß über den Renderer; zurück Luma und Maske als base64
const SCHUSS = (o) => {
    const g = (n) => (n ? new Function(`return typeof ${n} !== "undefined" ? ${n} : undefined;`)() : undefined);
    const T = window.THREE, R = g(o.S.renderer), sc = g(o.S.szene), wz = g(o.S.wurzel), comp = g(o.S.ausgabe);
    const bb = new T.Box3().setFromObject(wz), c = bb.getCenter(new T.Vector3()), rad = bb.getSize(new T.Vector3()).length() / 2;
    const cam = new T.PerspectiveCamera(o.fov, o.W / o.H, Math.min(0.1, rad / 10), Math.max(200, 32 * rad));
    cam.position.copy(c).addScaledVector(new T.Vector3(...o.blick), o.abstandR * rad);
    cam.lookAt(c);
    cam.updateMatrixWorld(true);
    const lies = () => {
        const k = document.createElement("canvas");
        [k.width, k.height] = [o.W, o.H];
        const x = k.getContext("2d", { willReadFrequently: true });
        x.drawImage(R.domElement, 0, 0, o.W, o.H);
        return x.getImageData(0, 0, o.W, o.H).data;
    };
    const alle = [];
    sc.traverse((x) => (x.isMesh || x.isPoints || x.isLine || x.isSprite) && alle.push([x, x.visible]));
    const unter = (x) => {
        for (let p = x; p; p = p.parent) if (p === wz) return true;
        return false;
    };
    // das Bild: die Bühne, wie sie steht, ohne ihre Lehren (Schilder, Maß-Linien, Raster: Sprite · Line · Points außerhalb der Wurzel)
    const kams = [];
    for (const [x] of alle) if (!x.isMesh && !unter(x)) x.visible = false;
    if (comp && comp.passes) for (const p of comp.passes) if (p && p.camera) kams.push([p, p.camera]), (p.camera = cam);
    if (comp && comp.passes) comp.render();
    else R.render(sc, cam);
    const bild = lies();
    for (const [p, k] of kams) p.camera = k;
    for (const [x, v] of alle) x.visible = v;
    const alt = { bg: sc.background, fog: sc.fog, ov: sc.overrideMaterial, tm: R.toneMapping };
    let maske;
    try {
        for (const [x] of alle) x.visible = x.visible && unter(x);
        [sc.background, sc.fog, sc.overrideMaterial, R.toneMapping] = [new T.Color(0, 0, 0), null, new T.MeshBasicMaterial({ color: 0xffffff }), T.NoToneMapping];
        R.render(sc, cam);
        maske = lies();
    } finally {
        for (const [x, v] of alle) x.visible = v;
        [sc.background, sc.fog, sc.overrideMaterial, R.toneMapping] = [alt.bg, alt.fog, alt.ov, alt.tm];
    }
    const L = new Uint8Array(o.W * o.H), M = new Uint8Array(o.W * o.H);
    for (let p = 0; p < L.length; p++) {
        L[p] = Math.round(0.2126 * bild[p * 4] + 0.7152 * bild[p * 4 + 1] + 0.0722 * bild[p * 4 + 2]);
        M[p] = maske[p * 4] > 127 ? 1 : 0;
    }
    const b64 = (u) => {
        let s = "";
        for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
        return btoa(s);
    };
    const png = (() => {
        const k = document.createElement("canvas");
        [k.width, k.height] = [o.W, o.H];
        k.getContext("2d").putImageData(new ImageData(Uint8ClampedArray.from(bild), o.W, o.H), 0, 0);
        return k.toDataURL("image/png");
    })();
    return { luma: b64(L), maske: b64(M), png, rad: +rad.toFixed(3), mitte: c.toArray().map((v) => +v.toFixed(3)) };
};

// ── DIE WELT: das Werk setzen, warten, bis es steht, seine Box und die Pose aus dem Rahmen-Gesetz der Welt ──
const SETZEN = (werk) => `const w = ${JSON.stringify(werk)};
if (!r._studioUebergabeEmpfang(Object.assign({ type: "uebergabe" }, w))) return { fehler: "die Welt nimmt das Werk nicht (" + w.kind + " " + w.preset + ")" };
const name = r._studioBlueprintForWord(w.preset);
if (!name) return { fehler: "kein Bauplan für " + w.preset };
const verb = r._studioWerkVerb(name);
if (verb === "praegung" || verb === "wesen") return { ungemessen: "das Werk ist " + (verb === "praegung" ? "eine Prägung (der Leib des Spielers)" : "ein Wesen (eine lebende Kreatur)") + ", kein gesetzter Bau" };
const stempel = r._studioStampFor(name, undefined, {});
if (stempel === false) return { fehler: "der Stempel lehnt das Werk ab" };
const P = r.state.playerMesh.position;
let E = null;
for (const [dx, dz] of [[16, 16], [-16, 16], [16, -16], [-16, -16], [24, 0], [0, 24], [-24, 0], [0, -24]]) {
    E = r.spawnArchitecture(name, { x: P.x + dx, y: P.y, z: P.z + dz }, { seed: 1, rotationY: 0, studioOv: stempel || undefined, werk: true });
    if (E) break;
}
if (!E) return { fehler: "kein Ort trägt " + name };
window.__k4Werk = E;
return { name, typ: E.type, pos: [E.position.x, E.position.y, E.position.z].map((v) => +v.toFixed(2)) };`;
const RAHMEN = (pose) => `const E = window.__k4Werk, K = r.constructor, bb = new T.Box3(), b = new T.Box3(), m = new T.Matrix4(), klassen = new Set();
for (const [key, g] of r.state.archInstanceGroups || []) {
    const s = g.slotEntry ? g.slotEntry.indexOf(E) : -1;
    const kl = K._instanzKlasse(key);
    if (s < 0 || g.shadowTwin || !/^f:/.test(kl) || !g.geom) continue;
    if (!g.geom.boundingBox) g.geom.computeBoundingBox();
    if (g.mesh && g.mesh.isInstancedMesh) g.mesh.getMatrixAt(s, m);
    else r._archEntryWorldMatrix(E, m);
    bb.union(b.copy(g.geom.boundingBox).applyMatrix4(m));
    klassen.add(kl);
}
if (bb.isEmpty()) return { wartet: true };
const R = bb.getSize(new T.Vector3()).length() / 2, c = bb.getCenter(new T.Vector3());
const cam = new T.PerspectiveCamera(${pose.fov}, ${W} / ${H}, Math.min(0.1, R / 10), Math.max(200, 32 * R));
const dist = r._workshopRahmen({ rahmen: { box: bb, R }, camera: cam, orbit: { yaw: ${pose.gier}, pitch: ${pose.neigung} } });
const cosP = Math.cos(${pose.neigung}), blick = [cosP * Math.cos(${pose.gier}), Math.sin(${pose.neigung}), cosP * Math.sin(${pose.gier})];
return { R: +R.toFixed(3), dist: +dist.toFixed(3), blick, mitte: c.toArray(), kamera: c.clone().addScaledVector(new T.Vector3(...blick), dist).toArray(), klassen: [...klassen] };`;
const WEG = `if (window.__k4Werk) r.removeArchitecture(window.__k4Werk, { still: true }); window.__k4Werk = null; return 1;`;
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function albedoMessen(aus) {
    // die Welt-Seite am Ort der Tafel (wie diag-albedo-tafel neuMessen), dann die Labor-Seite je Studio
    const t = JSON.parse(fs.readFileSync(path.join("spec", "farbe", "albedo-tafel.json"), "utf8"));
    const gw = (t.gemessen && t.gemessen.welt) || {};
    const um = wb(gw.ort ? ["umstellen", "--ort", gw.ort] : ["umstellen", ...(gw.spieler || [0, 0]).map(String)]);
    if (um.status !== 0) throw new Error("umstellen: Exit " + um.status);
    await welt("await new Promise((x) => setTimeout(x, 10000)); return 1");
    const wd = path.join(DIR, "albedo-welt.json"), ld = path.join(DIR, "albedo-labor.json");
    const a = wb(["albedo", "--tafel", "--datei", wd, "--ordner", path.join(DIR, "albw")]);
    if (!fs.existsSync(wd)) throw new Error("albedo --tafel ohne Messung: Exit " + a.status + " " + String(a.stdout + a.stderr).slice(-300));
    const l = cp.spawnSync(process.execPath, [path.join("scripts", "diag-albedo-tafel.cjs"), "--labor", "--echt", "--datei", ld], {
        encoding: "utf8",
        timeout: 900000,
        maxBuffer: 1 << 28,
        env: { ...process.env, ALBEDO_PORT: String(PORT + 2) },
    });
    if (!fs.existsSync(ld)) throw new Error("Labor ohne Messung: Exit " + l.status + " " + String(l.stdout + l.stderr).slice(-300));
    const [Wm, Lm] = [wd, ld].map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
    aus.albedo = { welt: { echt: Wm.echt === true, eichung: Wm.eichung }, labor: { echt: Lm.echt === true, eichung: (Lm.eichung || {}).labor || {} }, zeilen: [] };
    for (const z of t.zeilen) {
        if (!z.labor || !z.labor.studio) continue;
        const L = (Lm.labor || {})[z.id], Y = (Wm.welt || {})[z.id];
        const v = L && Y && L.Y > 0 && Y.Y > 0 ? +(L.Y / Y.Y).toFixed(4) : null;
        aus.albedo.zeilen.push({ id: z.id, studio: z.labor.studio, labor: L ? L.Y : null, welt: Y ? Y.Y : null, v });
    }
}

async function main() {
    const aus = { plan: "studios.K4", pose: POSE, soll: SOLL, leinwand: [W, H], geraet: null, studios: {}, albedo: null, fehler: [] };
    try {
        await albedoMessen(aus);
    } catch (e) {
        aus.fehler.push("Albedo: " + String((e && e.message) || e).slice(0, 300));
    }
    const seiten = Object.fromEntries(STUDIOS.map((s) => ["/k4-" + s + ".html", GAST(AT.STUDIOS[s].pfad)]));
    const server = WB.statikServer({ seiten });
    await server.lausche(PORT + 3);
    const b = await WB.starteBrowser({ art: "echt", frist: 600000, zusatz: [`--window-size=${W},${H}`], viewport: { width: W, height: H, deviceScaleFactor: 1 } });
    try {
        for (const sid of STUDIOS) {
            const ts = Date.now(), S = AT.STUDIOS[sid];
            const z = (aus.studios[sid] = { werk: null, welt: null, buehne: null, differenz: null, albedo: null, gruen: false, grund: null, sek: null });
            const page = await b.newPage();
            try {
                await server.zeige(page, 120000, "k4-" + sid + ".html", "load");
                const frame = () => page.frames().find((f) => f.url().includes(S.pfad));
                for (let i = 0; !(frame() && (await frame().evaluate(BEREIT, S).catch(() => false))); i++) {
                    if (i > 200) throw new Error("die Bühne steht nach 60 s nicht (Wurzel " + S.wurzel + ", Knopf .h-werk)");
                    await WB.sleep(300);
                }
                if (!aus.geraet)
                    aus.geraet = await frame().evaluate((S) => {
                        const R = new Function(`return ${S.renderer};`)();
                        if (R.isWebGPURenderer) return "WebGPU " + (R.backend.device ? R.backend.device.adapterInfo.architecture : "WebGL2-Ersatz");
                        const gl = R.getContext(), e = gl.getExtension("WEBGL_debug_renderer_info");
                        return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
                    }, S);
                await frame().evaluate(() => document.querySelector(".h-werk").click());
                await WB.sleep(300);
                z.werk = await page.evaluate(() => window.__werk && { kind: window.__werk.kind, preset: window.__werk.preset, seed: window.__werk.seed, ov: window.__werk.ov });
                if (!z.werk) throw new Error("die Bühne nennt kein Werk (der Knopf postet keine Übergabe)");
                const gesetzt = await welt(SETZEN(z.werk));
                if (gesetzt.ungemessen) {
                    z.grund = "ungemessen: " + gesetzt.ungemessen;
                    continue;
                }
                let rahmen = { wartet: true };
                for (let i = 0; rahmen.wartet; i++) {
                    if (i > 60) throw new Error("das Werk " + gesetzt.name + " steht nach 30 s nicht in der Welt (keine Instanz der Familie f:)");
                    await WB.sleep(500);
                    rahmen = await welt(RAHMEN(POSE));
                }
                const datei = path.join(DIR, sid + "-welt.png");
                const [k, l] = [rahmen.kamera, rahmen.mitte];
                const bild = await ruf("/bild", { px: k[0], py: k[1], pz: k[2], lx: l[0], ly: l[1], lz: l[2], w: W, h: H, fov: POSE.fov, wahl: "0", klasse: "^f:" + esc(z.werk.preset) + ":L\\d$", datei });
                if (!bild || !bild.datei || !fs.existsSync(datei)) throw new Error("bild: " + JSON.stringify(bild).slice(0, 300));
                const bw = pngLesen(datei), mw = pngLesen(datei.replace(/\.png$/, ".maske.png"));
                const lw = new Uint8Array(W * H);
                for (let p = 0; p < lw.length; p++) lw[p] = Math.round(luma(bw.d, p * 4));
                const kw = klasseAusMaske(bw, mw);
                z.welt = { ...gesetzt, R: rahmen.R, dist: rahmen.dist, klassen: rahmen.klassen, pixel: kw.reduce((s, v) => s + v, 0), abnahme: bild.abnahme || null };
                await welt(WEG);
                const s = await frame().evaluate(SCHUSS, { S, W, H, fov: POSE.fov, blick: rahmen.blick, abstandR: rahmen.dist / rahmen.R });
                WB.pngDatei(path.join(DIR, sid + "-buehne.png"), s.png);
                const [ls, ms] = [s.luma, s.maske].map((x) => new Uint8Array(Buffer.from(x, "base64")));
                z.buehne = { R: s.rad, pixel: ms.reduce((a, v) => a + v, 0) };
                z.differenz = differenz(lw, kw, ls, ms);
                const az = ((aus.albedo && aus.albedo.zeilen) || []).filter((x) => x.studio === sid);
                const ab = az.map((x) => (x.v == null ? Infinity : Math.abs(x.v - 1)));
                z.albedo = { zeilen: az.map((x) => x.id + " " + x.v), max: az.length ? +Math.max(...ab).toFixed(4) : null };
                const dOk = z.differenz.anteil != null && z.differenz.anteil <= SOLL.differenz && z.welt.pixel > 0 && z.buehne.pixel > 0;
                const aOk = z.albedo.max != null && z.albedo.max <= SOLL.albedo;
                z.gruen = dOk && aOk;
                z.grund = (dOk ? "" : "Differenz " + z.differenz.anteil + " > " + SOLL.differenz + " ") + (aOk ? "" : "Albedo " + (z.albedo.max == null ? "ohne Zeile" : "|L/W − 1| " + z.albedo.max + " > " + SOLL.albedo));
            } catch (e) {
                z.grund = "ROT: " + String((e && e.message) || e).slice(0, 300);
                await welt(WEG).catch(() => {});
            } finally {
                z.sek = sek(ts);
                await page.close().catch(() => {});
                console.log(`K4 ${sid}: ${z.gruen ? "GRÜN" : "ROT"} · Differenz ${z.differenz ? z.differenz.anteil : "—"} · Albedo ${z.albedo ? z.albedo.max : "—"} · ${z.grund || ""} (${z.sek} s)`);
            }
        }
    } finally {
        await b.close().catch(() => {});
        server.close();
    }
    aus.sek = sek(t0);
    aus.gruen = STUDIOS.filter((s) => aus.studios[s].gruen);
    fs.writeFileSync(AUS, JSON.stringify(aus, null, 1));
    console.log(`K4 Gerät der Bühne: ${aus.geraet || "ungenannt"}`);
    console.log(`K4 ${aus.gruen.length}/${STUDIOS.length} Mesh-Studios mit Bild-Differenz ≤ ${SOLL.differenz} und Albedo im Rand ${SOLL.albedo} (${aus.sek} s)`);
}
main().then(
    () => process.exit(0),
    (e) => {
        console.error("K4 ROT: " + ((e && e.stack) || e));
        process.exit(1);
    }
);
