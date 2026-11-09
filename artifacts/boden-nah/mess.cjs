// MESS-VEHIKEL w26-boden-nah (nur WIP, fällt vor der Abgabe): die Schritte der Station material.K2#1 (punkte-maschine g3.js) für den
// Boden — Mess-Wiese, Ego, Blick −0,75, 1920×1080, `bild --arm d --klasse ^bodenSatz$` für d = 0,5 · 1 · 2 — und die Zerlegung der
// glatten 8×8-Blöcke (σ Luma < 4) nach der Luma ihres Blocks; dazu Varianten des Boden-Stoffs LIVE in derselben Welt (die Pose bleibt,
// der Stoff des Bodens baut neu). ≤ 10 Zeilen mit Marke (gpu-probe.yml liest die letzten 10), die Bilder der Blöcke in $RUNNER_TEMP/probe.
"use strict";
/* global process, console */
const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const P = String(process.env.BN_PORT || 4793);
const WB = path.join("scripts", "werkbank.cjs");
const SHA8 = String(process.env.GITHUB_SHA || "lokal").slice(0, 8);
const OUT = path.join(process.env.RUNNER_TEMP || os.tmpdir(), "probe");
const TMP = path.join(os.tmpdir(), "boden-nah-" + process.pid);
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });
const ARM = (process.env.BN_ARM || "0.5,1,2").split(",");
const VARIANTEN = (process.env.BN_VARIANTEN || "main,mikro2,relief1,beide").split(",");
const BILDER = new Set((process.env.BN_BILDER || "main@0.5,main@2").split(","));
const zeile = (s) => console.log(("✅ " + s).slice(0, 598));
const rot = (s) => console.log(("❌ " + s).slice(0, 598));

const json = (t) => {
    const s = String(t || "");
    const e = s.lastIndexOf("}");
    for (const i of [s.startsWith("{") ? 0 : -1, s.indexOf("\n{")])
        if (i >= 0 && e > i)
            try {
                return JSON.parse(s.slice(i, e + 1));
            } catch (_e) {
                /* der nächste Anfang */
            }
    return null;
};
const wb = (args, ms) => {
    const r = cp.spawnSync(process.execPath, [WB, ...args, "--port", P], { encoding: "utf8", timeout: ms || Number(process.env.BN_MS || 300000), maxBuffer: 1 << 28 });
    return { exit: r.status, j: json(r.stdout), rest: String((r.stdout || "") + (r.stderr || "")).slice(-600) };
};
const evalW = (code, ms) => {
    const r = wb(["eval", code], ms);
    if (!r.j || r.j.ergebnis === undefined) throw new Error("eval: " + r.rest.replace(/\s+/g, " ").slice(-300));
    return r.j.ergebnis;
};

// das Einschwingen der Station (g3.js EIN_TAKT)
const EIN_TAKT =
    "const takt = async () => { try { window.__buehne(); r._gameLoopTick(performance.now()); } catch (_e) {} await new Promise((x) => setTimeout(x, 16)); }; " +
    "for (let i = 0; i < 30; i++) await takt(); await window.__weltStehtNach(takt); return 1;";

// der Haken: das Bild und die Maske, die `__klassenMasse` misst (dieselben Bytes wie das Urteil der Station)
const HAKEN =
    "if (!window.__bnHaken) { const o = window.__klassenMasse; window.__klassenMasse = function (F, m, W, H, ...x) { " +
    "window.__bnLetzt = { F: F.slice(0, W * H * 4), m: m.slice(0), W, H }; return o.call(this, F, m, W, H, ...x); }; window.__bnHaken = 1; } return 1;";

// die Zerlegung je 8×8-Block ganz in der Klasse: Luma-Mittel und σ; glatt = σ < 4. Bänder der Block-Luma; mit `bild` die Blöcke im Bild
// (glatt rot, gemessen grün gerahmt, außerhalb gedunkelt), halbe Größe
const ZERLEGUNG = (bild) => `
const z = window.__bnLetzt; if (!z) return { fehler: "kein Haken-Bild" };
const { F, m, W, H } = z;
const L = (p) => 0.2126 * F[p * 4] + 0.7152 * F[p * 4 + 1] + 0.0722 * F[p * 4 + 2];
const BAND = [0, 16, 32, 48, 64, 96, 128, 256];
const n = new Array(BAND.length - 1).fill(0), g = n.slice(), sig = n.slice();
const bl = [];
for (let y0 = 0; y0 + 8 <= H; y0 += 8)
  for (let x0 = 0; x0 + 8 <= W; x0 += 8) {
    let voll = true, s = 0, s2 = 0;
    for (let i = 0; i < 64 && voll; i++) { const p = (y0 + (i >> 3)) * W + x0 + (i & 7); voll = m[p] === 1; const l = L(p); s += l; s2 += l * l; }
    if (!voll) continue;
    const mu = s / 64, sd = Math.sqrt(Math.max(0, s2 / 64 - mu * mu));
    let b = 0; while (mu >= BAND[b + 1]) b++;
    n[b]++; sig[b] += sd; if (sd < 4) g[b]++;
    bl.push([x0, y0, sd < 4 ? 1 : 0]);
  }
const N = n.reduce((a, b) => a + b, 0), G = g.reduce((a, b) => a + b, 0);
const aus = { N, G, glatt: N ? +(G / N).toFixed(4) : null,
  baender: BAND.slice(0, -1).map((b, i) => b + ":" + g[i] + "/" + n[i] + "~" + (n[i] ? (sig[i] / n[i]).toFixed(1) : "-")).join(" ") };
if (${bild ? "true" : "false"}) {
  const cv = Object.assign(document.createElement("canvas"), { width: W, height: H });
  const c = cv.getContext("2d");
  const d = new Uint8ClampedArray(F.subarray(0, W * H * 4));
  for (let p = 0; p < W * H; p++) { d[p * 4 + 3] = 255; if (m[p] !== 1) { d[p * 4] >>= 2; d[p * 4 + 1] >>= 2; d[p * 4 + 2] >>= 2; } }
  c.putImageData(new ImageData(d, W, H), 0, 0);
  for (const [x0, y0, gl] of bl) { if (gl) { c.fillStyle = "rgba(255,0,0,0.55)"; c.fillRect(x0, y0, 8, 8); } }
  const k = Object.assign(document.createElement("canvas"), { width: W >> 1, height: H >> 1 });
  k.getContext("2d").drawImage(cv, 0, 0, W >> 1, H >> 1);
  window.__bnPng = k.toDataURL("image/png");
  aus.png = window.__bnPng.length;
}
return aus;`;

// DIE VARIANTEN des Boden-Stoffs (live, die Pose bleibt): `mikro2` das Korn und die Kavität des Mikro-Reliefs doppelt
// (TERRAIN_BUMP korn · kavitaet), `relief1` das Relief der Nähe voll (`_terrainGeologyAlbedo` `_relief` 1 statt 0,4 … 1), `beide`.
// Jede Variante setzt zuerst main zurück (die gemerkten Werte), dann ihre Änderung, und baut den Stoff des Bodens neu.
const VARIANTE = (v) => `
const K = r.constructor, proto = Object.getPrototypeOf(r);
if (!window.__bnMain) window.__bnMain = { bump: K.TERRAIN_BUMP, geo: proto._terrainGeologyAlbedo };
const M = window.__bnMain;
Object.defineProperty(K, "TERRAIN_BUMP", { value: M.bump, configurable: true });
proto._terrainGeologyAlbedo = M.geo;
const v = ${JSON.stringify(v)};
if (v === "mikro2" || v === "beide")
  Object.defineProperty(K, "TERRAIN_BUMP", { value: Object.freeze(Object.assign({}, M.bump, { korn: M.bump.korn * 2, kavitaet: M.bump.kavitaet * 2 })), configurable: true });
let ersetzt = 0;
if (v === "relief1" || v === "beide") {
  const src = M.geo.toString();
  const neu = src.replace(/\\.mul\\(0\\.6\\)(\\s*)\\.add\\(0\\.4\\)/, (_m, s) => (ersetzt++, ".mul(0.0)" + s + ".add(1.0)"));
  proto._terrainGeologyAlbedo = (0, eval)("({" + neu + "})")._terrainGeologyAlbedo;
}
const alt = r.state.voxelChunkMaterial;
r.state.voxelChunkMaterial = null;
const neuM = r._getVoxelChunkMaterial();
let n = 0;
r.state.scene.traverse((o) => { if (o.material === alt) { o.material = neuM; n++; } });
window.__bundlesNeu && window.__bundlesNeu();
return [v, n, ersetzt, K.TERRAIN_BUMP.korn, K.TERRAIN_BUMP.kavitaet];`;

function main() {
    const t0 = Date.now();
    const log = path.join(TMP, "werkbank.log");
    const fd = fs.openSync(log, "w");
    const wk = cp.spawn(process.execPath, [WB, "start", "--port", P, "--ort", "wiese"], { stdio: ["ignore", fd, fd] });
    let adapter = "?";
    try {
        const bis = Date.now() + 240000;
        for (;;) {
            const t = fs.readFileSync(log, "utf8");
            if (/WERKBANK bereit/.test(t)) {
                adapter = (/\[linse-gpu\][^\r\n]*/.exec(t) || ["[linse-gpu] ungenannt"])[0];
                break;
            }
            if (wk.exitCode != null || Date.now() > bis) throw new Error("Werkbank startete nicht: " + t.slice(-300).replace(/\s+/g, " "));
            cp.spawnSync(process.execPath, ["-e", "setTimeout(() => {}, 1000)"]);
        }
        zeile(`BODEN-NAH ${SHA8} · ${adapter} · Start ${((Date.now() - t0) / 1000).toFixed(0)} s`);
        for (const [n, a] of [
            ["fenster", ["fenster", "1920", "1080"]],
            ["wiese", ["umstellen", "--ort", "wiese", "--sicht", "ego"]],
        ]) {
            const r = wb(a);
            if (r.exit !== 0) throw new Error(n + ": Exit " + r.exit + " " + r.rest.replace(/\s+/g, " ").slice(-200));
        }
        evalW(EIN_TAKT, 600000);
        evalW("r.state.pitch = -0.75; return [r.state.cameraMode, r.state.yaw, r.state.pitch]");
        evalW(HAKEN);
        for (const v of VARIANTEN) {
            const vz = evalW(VARIANTE(v));
            const teile = [];
            for (const d of ARM) {
                const datei = path.join(TMP, `${v}-${d}.png`);
                const r = wb(["bild", "0", "0", "0", "0", "0", "0", "--arm", d, "--wahl", "0", "--klasse", "^bodenSatz$", "--datei", datei], 600000);
                const k = r.j && r.j.klasse;
                const m = k && k.klassen && k.klassen.bodenSatz;
                if (!m) {
                    teile.push(`${d}: ${String((r.j && r.j.fehler) || r.rest).replace(/\s+/g, " ").slice(-120)}`);
                    continue;
                }
                const z = evalW(ZERLEGUNG(BILDER.has(`${v}@${d}`)));
                // das Bild in Scheiben (eine große Ausgabe der Werkbank kappt Node beim Exit)
                if (z.png) {
                    let url = "";
                    for (let o = 0; o < z.png; o += 50000) url += evalW(`return window.__bnPng.slice(${o}, ${o + 50000});`);
                    fs.writeFileSync(path.join(OUT, `${SHA8}-${v}-${d}.png`), Buffer.from(url.split(",")[1], "base64"));
                }
                teile.push(
                    `${d} m glatt ${m.glatt} nyq ${m.nyquist} β ${m.beta} L ${m.luma} arm ${k.arm && k.arm.ist} [${z.G}/${z.N} ${z.baender}]`
                );
            }
            zeile(`${v} (${vz.slice(1).join("/")}): ` + teile.join(" | "));
        }
    } catch (e) {
        rot(`BODEN-NAH: ${String((e && e.message) || e).replace(/\s+/g, " ")}`);
        process.exitCode = 1;
    } finally {
        wb(["stop"], 60000);
        try {
            wk.kill();
        } catch (_e) {
            /* schon fort */
        }
        console.log(`✅ BODEN-NAH Dauer ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
}
main();
