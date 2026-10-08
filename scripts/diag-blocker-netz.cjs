#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-blocker-netz.cjs — DER STRAHL FRAGT SEINE NACHBARSCHAFT (0710-7). Befund (OMEN 0710-6, V18.535, CPU-Profil an der
// Mess-Wiese): `_segmentAABB` trug 8,3–8,9 % der Selbst-Zeit, `_fieldRaycast` weitere 6,5–7 % — die Decken-Probe der Ego-Kamera
// (`_loopCamera` → `_ceilingHeadroom`, ein 4,5-m-Strahl je Frame) prüfte jede Blocker-Box im 80-m-Umkreis: gezählt 22 758
// Slabs je Strahl (419 Bauten, davon 15 570 Boxen Haselbüsche), keine Box berührte das Segment. Der Schnitt: die Nachbarschaft
// der Blocker (`_blockerNetz`, Zellen über die Hülle jedes Eintrags, gestempelt am Bestand), der Strahl fragt nur die Zellen
// seines Segments und je Box ihre Hülle vor dem Slab. Die Wand (Null-Renderer, eine echte Welt mit Dorf, Bäumen und Bauten):
//   (T) TREUE: jeder Strahl trifft byte-gleich wie die Schleife über den ganzen Bestand (das Orakel unten — Treffer, t, Punkt,
//       Normale, auch -0), über kurze, lange (> 80 m, der Nah-Cull), senkrechte, achsparallele und Strahlen aus einer Box — in
//       fünf Runden, zwischen ihnen ändert sich der Bestand (Abriss, Kappe, eine gedrehte und neu gestempelte Hülle, ein neues
//       Array, neue Bäume);
//   (A) ARBEIT: ein Strahl ruft `_segmentAABB` genau für die Boxen, deren Hülle die seines Segments berührt (im Nah-Cull) —
//       vorher für jede Box im 80-m-Umkreis;
//   (K) KONSISTENZ: das Netz ist der Bestand — jeder Eintrag mit Boxen steht in den Zellen seiner Hülle, keine Zelle trägt
//       einen Eintrag außerhalb, die Ordnung des Bestands steigt mit dem Array;
//   (Q) QUELLE: `_fieldRaycast` liest das Netz und keine Schleife über den Bestand; jeder Eintritt (push), Austritt (splice)
//       und jedes Schreiben der Boxen (`_blockerStampReach`) stempelt; kein anderer Schreiber des Bestands im Stamm;
//   (P) kein Page-Error.
//   node scripts/diag-blocker-netz.cjs   (npm run gate:blocker-netz; Port BLOCKER_NETZ_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.BLOCKER_NETZ_PORT || 4604);
const root = path.resolve(__dirname, "..");

const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};
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

// Die Probe im Seiten-Kontext.
async function probe() {
    const r = window.anazhRealm;
    const st = r.state;
    // DAS ORAKEL: der Struktur-Strahl als Schleife über den ganzen Bestand (die Definition, V18.535) — der Gelände-Teil ist
    // derselbe Weg wie im Spiel (`_fieldSolid` · `_fieldGradient`), die Boxen gehen alle durch `_segmentAABB`.
    const orakel = (sx, sy, sz, ex, ey, ez) => {
        const dx = ex - sx,
            dy = ey - sy,
            dz = ez - sz;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const out = { hit: false, x: ex, y: ey, z: ez, nx: 0, ny: 1, nz: 0, t: 1 };
        if (len < 1e-6) return out;
        const ux = dx / len,
            uy = dy / len,
            uz = dz / len;
        const step = 0.2;
        let bestT = Infinity;
        const prevSolid = r._fieldSolid(sx, sy, sz);
        if (!prevSolid) {
            for (let d = step; d <= len; d += step) {
                const px = sx + ux * d,
                    py = sy + uy * d,
                    pz = sz + uz * d;
                if (r._fieldSolid(px, py, pz)) {
                    let lo = d - step,
                        hi = d;
                    for (let b = 0; b < 8; b++) {
                        const mid = (lo + hi) / 2;
                        if (r._fieldSolid(sx + ux * mid, sy + uy * mid, sz + uz * mid)) hi = mid;
                        else lo = mid;
                    }
                    bestT = hi / len;
                    break;
                }
            }
        } else bestT = 0;
        let structHitT = Infinity,
            sFace = null;
        const arches = st.architectures;
        if (arches && arches.length) {
            for (let a = 0; a < arches.length; a++) {
                const e = arches[a];
                if (!e || !e.blockerAABBs || !e.position) continue;
                const rcCull = 80 + (e._blockerReach || 0);
                if (Math.abs(e.position.x - sx) > rcCull || Math.abs(e.position.z - sz) > rcCull) continue;
                const boxes = e.blockerAABBs;
                for (let bi = 0; bi < boxes.length; bi++) {
                    const hitInfo = r._segmentAABB(sx, sy, sz, dx, dy, dz, boxes[bi]);
                    if (hitInfo && hitInfo.t < structHitT) {
                        structHitT = hitInfo.t;
                        sFace = hitInfo;
                    }
                }
            }
        }
        if (structHitT < bestT) {
            out.hit = true;
            out.t = structHitT;
            out.x = sx + dx * structHitT;
            out.y = sy + dy * structHitT;
            out.z = sz + dz * structHitT;
            out.nx = sFace.nx;
            out.ny = sFace.ny;
            out.nz = sFace.nz;
        } else if (bestT < Infinity) {
            out.hit = true;
            out.t = bestT;
            out.x = sx + dx * bestT;
            out.y = sy + dy * bestT;
            out.z = sz + dz * bestT;
            const g = r._fieldGradient(out.x, out.y, out.z, {});
            out.nx = g.x;
            out.ny = g.y;
            out.nz = g.z;
        }
        out.struktur = structHitT < bestT;
        return out;
    };
    // die Boxen, deren Hülle die des Segments berührt (im Nah-Cull) — so viele Slabs darf ein Strahl rufen
    const beruehrt = (sx, sy, sz, ex, ey, ez) => {
        const M = 1e-6;
        const q = [
            Math.min(sx, ex) - M,
            Math.max(sx, ex) + M,
            Math.min(sy, ey) - M,
            Math.max(sy, ey) + M,
            Math.min(sz, ez) - M,
            Math.max(sz, ez) + M,
        ];
        let n = 0;
        for (const e of st.architectures) {
            if (!e || !e.blockerAABBs || !e.position) continue;
            const rc = 80 + (e._blockerReach || 0);
            if (Math.abs(e.position.x - sx) > rc || Math.abs(e.position.z - sz) > rc) continue;
            for (const b of e.blockerAABBs)
                if (!(
                    b.maxX < q[0] ||
                    b.minX > q[1] ||
                    b.topY < q[2] ||
                    b.botY > q[3] ||
                    b.maxZ < q[4] ||
                    b.minZ > q[5]
                ))
                    n++;
        }
        return n;
    };
    let slabs = 0;
    const sg = Object.getPrototypeOf(r)._segmentAABB;
    r._segmentAABB = function (sx, sy, sz, dx, dy, dz, b) {
        if (b !== this._obbSegBox) slabs++;
        return sg.call(this, sx, sy, sz, dx, dy, dz, b);
    };
    // die Welt: ein Dorf, Bäume, Bauten der Nexus-Schale an einem Ort abseits des Starts
    const pm = st.playerMesh;
    const ox = 1400,
        oz = -1400;
    pm.position.set(ox, r.getTerrainHeightAt(ox, oz) + 1.2, oz);
    st.weatherEffectTime = 0;
    let laeuft = null;
    const ss = r.spawnSettlement;
    r.spawnSettlement = function (o) {
        laeuft = ss.call(this, o);
        return laeuft;
    };
    r.dslRun(["spawn_village", ["at_player"], 4801], { source: "human" });
    if (laeuft) await laeuft;
    r.dslRun(["spawn_village", ["near_player", 40], 4802], { source: "human" });
    if (laeuft) await laeuft;
    for (let k = 0; k < 6; k++)
        r.dslRun(["spawn_tree", ["near_player", 10 + k * 6], 6, k % 2 ? "kiefer" : "eiche", 900 + k], {
            source: "human",
        });
    r.dslRun(["spawn_temple", ["near_player", 30]], { source: "human" });
    // die Strahlen einer Runde: Zufall mit festem Samen, rund um die Boxen des Orts
    let s = 0x6e7a;
    const rng = () => {
        s = (s + 0x6d2b79f5) | 0;
        let x = Math.imul(s ^ (s >>> 15), 1 | s);
        x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
    const ortsBoxen = () => {
        const out = [];
        for (const e of st.architectures)
            if (e && e.blockerAABBs && e.position && Math.hypot(e.position.x - ox, e.position.z - oz) < 120)
                for (const b of e.blockerAABBs) out.push(b);
        return out;
    };
    const runde = (name, n) => {
        const boxen = ortsBoxen();
        const R = {
            name,
            strahlen: 0,
            treffer: 0,
            struktur: 0,
            abweichung: [],
            slabs: 0,
            beruehrt: 0,
            ueberzaehlig: 0,
        };
        const LAENGEN = [0.5, 2.5, 4.5, 10, 30, 95];
        for (let i = 0; i < n; i++) {
            const art = rng();
            let sx, sy, sz;
            if (art < 0.15 && boxen.length) {
                const b = boxen[Math.floor(rng() * boxen.length)];
                sx = b.minX + rng() * (b.maxX - b.minX);
                sy = b.botY + rng() * (b.topY - b.botY);
                sz = b.minZ + rng() * (b.maxZ - b.minZ);
            } else {
                sx = ox - 90 + rng() * 180;
                sz = oz - 90 + rng() * 180;
                const h = r.getTerrainHeightAt(sx, sz);
                sy = (Number.isFinite(h) ? h : 0) - 1 + rng() * 14;
            }
            const L = LAENGEN[Math.floor(rng() * LAENGEN.length)];
            let dx, dy, dz;
            const w = rng();
            if (w < 0.3) {
                dx = 0;
                dy = rng() < 0.7 ? 1 : -1;
                dz = 0;
            } else if (w < 0.4) {
                dx = rng() < 0.5 ? 1 : -1;
                dy = 0;
                dz = 0;
            } else {
                const a = rng() * Math.PI * 2;
                const el = (rng() - 0.5) * Math.PI;
                dx = Math.cos(a) * Math.cos(el);
                dy = Math.sin(el);
                dz = Math.sin(a) * Math.cos(el);
            }
            const ex = sx + dx * L,
                ey = sy + dy * L,
                ez = sz + dz * L;
            const soll = orakel(sx, sy, sz, ex, ey, ez);
            const b0 = beruehrt(sx, sy, sz, ex, ey, ez);
            slabs = 0;
            const ist = r._fieldRaycast(sx, sy, sz, ex, ey, ez);
            R.strahlen++;
            R.slabs += slabs;
            R.beruehrt += b0;
            if (slabs > b0) R.ueberzaehlig++;
            if (soll.hit) R.treffer++;
            if (soll.struktur) R.struktur++;
            const felder = ["hit", "t", "x", "y", "z", "nx", "ny", "nz"];
            const ab = felder.filter((f) => !Object.is(soll[f], ist[f]));
            if (ab.length && R.abweichung.length < 5)
                R.abweichung.push({
                    strahl: [sx, sy, sz, ex, ey, ez].map((v) => +v.toFixed(3)),
                    soll: felder.map((f) => soll[f]),
                    ist: felder.map((f) => ist[f]),
                });
            if (ab.length) R.abweichungen = (R.abweichungen || 0) + 1;
        }
        // die Struktur-Treffer der Runde (Strahlen, die eine Box trifft, bevor das Gelände kommt)
        R.boxen = boxen.length;
        R.bauten = st.architectures.length;
        return R;
    };
    // DIE KONSISTENZ des Netzes gegen den Bestand
    const konsistenz = () => {
        const f = [];
        if (typeof r._blockerNetz !== "function")
            return ["das Spiel kennt keine Nachbarschaft der Blocker (`_blockerNetz`)"];
        const N = r._blockerNetz();
        const im = new Set();
        let seq = -Infinity;
        for (const e of st.architectures) {
            if (!e) continue;
            im.add(e);
            if (e._blockerGen !== N.gen)
                f.push(`${e.type}#${e.id}: nicht im Netz (gen ${e._blockerGen} statt ${N.gen})`);
            if (!(e._blockerSeq > seq)) f.push(`${e.type}#${e.id}: die Ordnung steigt nicht mit dem Array`);
            seq = e._blockerSeq;
            if (e.blockerAABBs && e.blockerAABBs.length) {
                const keys = e._blockerZellen;
                if (!keys || !keys.length) f.push(`${e.type}#${e.id}: trägt Boxen, steht in keiner Zelle`);
                else
                    for (const k of keys)
                        if (!(N.zellen.get(k) || []).includes(e)) f.push(`${e.type}#${e.id}: fehlt in Zelle ${k}`);
                const Z = r.constructor.BLOCKER_ZELLE;
                if (keys && keys[0] !== r.constructor.BLOCKER_RIESE)
                    for (const b of e.blockerAABBs)
                        for (const [x, z] of [
                            [b.minX, b.minZ],
                            [b.maxX, b.maxZ],
                        ]) {
                            const k = Math.floor(x / Z) * 2097152 + Math.floor(z / Z);
                            if (!keys.includes(k))
                                f.push(`${e.type}#${e.id}: eine Box-Ecke liegt in Zelle ${k} außerhalb seiner Zellen`);
                        }
            }
        }
        for (const [k, zelle] of N.zellen)
            for (const e of zelle) if (!im.has(e)) f.push(`Zelle ${k} trägt ${e.type}#${e.id} außerhalb des Bestands`);
        return f.slice(0, 8);
    };
    const aus = { runden: [], konsistenz: [] };
    const N = 1200;
    aus.runden.push(runde("Ort", N));
    aus.konsistenz.push(["Ort", konsistenz()]);
    // (1) Abriss: drei Häuser
    const haeuser = st.architectures.filter((e) => e && typeof e.type === "string" && e.type.startsWith("haus_"));
    for (const h of haeuser.slice(0, 3)) r.removeArchitecture(h);
    // (2) die Kappe nimmt einen Bau
    const bau = st.architectures.find((e) => e && e.blockerAABBs && !e.type.startsWith("haus_"));
    if (bau && typeof r._evictArchitecture === "function") r._evictArchitecture(bau);
    aus.runden.push(runde("Abriss", N));
    aus.konsistenz.push(["Abriss", konsistenz()]);
    // (3) ein Haus dreht sich und stempelt neu
    const h2 = st.architectures.find((e) => e && typeof e.type === "string" && e.type.startsWith("haus_"));
    if (h2) {
        h2.rotationY = (Number.isFinite(h2.rotationY) ? h2.rotationY : 0) + 0.37;
        r._populateBlockerAABBs(h2);
    }
    aus.runden.push(runde("Neu gestempelt", N));
    aus.konsistenz.push(["Neu gestempelt", konsistenz()]);
    // (4) ein neues Array (ein geladener Bestand)
    st.architectures = st.architectures.slice();
    aus.runden.push(runde("Neues Array", N));
    aus.konsistenz.push(["Neues Array", konsistenz()]);
    // (5) neue Bäume
    for (let k = 0; k < 3; k++)
        r.dslRun(["spawn_tree", ["near_player", 20 + k * 9], 5, "eiche", 990 + k], { source: "human" });
    aus.runden.push(runde("Neue Bäume", N));
    aus.konsistenz.push(["Neue Bäume", konsistenz()]);
    // (6) die Decken-Probe am Ort: Slabs je Strahl
    slabs = 0;
    for (let i = 0; i < 50; i++) r._ceilingHeadroom();
    aus.decke = { slabsJeStrahl: slabs / 50, beruehrt: 0 };
    const p0 = pm.position;
    aus.decke.beruehrt = beruehrt(p0.x, p0.y + 0.55, p0.z, p0.x, p0.y + 5.05, p0.z);
    // (Q) die Quelle
    const P = Object.getPrototypeOf(r);
    const code = (f) => (typeof P[f] === "function" ? window.__codeOf(P[f]) : "");
    aus.quelle = {
        strahlFragtNetz: /this\._blockerNetz\(\)/.test(code("_fieldRaycast")),
        strahlSchleife: /this\.state\.architectures/.test(
            code("_fieldRaycast").replace(/const arches = this\.state\.architectures;/, "")
        ),
        stempel: /this\._blockerNetzSetzen\(entry\)/.test(code("_blockerStampReach")),
        eintritt: /this\.state\.architectures\.push\(entry\);\s*this\._blockerEintritt\(entry\);/.test(
            code("spawnArchitecture")
        ),
        abriss: /this\.state\.architectures\.splice\(idx, 1\);\s*this\._blockerAustritt\(entry\);/.test(
            code("removeArchitecture")
        ),
        kappe: /arches\.splice\(idx, 1\);\s*this\._blockerAustritt\(entry\);/.test(code("_evictArchitecture")),
    };
    return aus;
}

function urteil(S, stamm, pageErrors) {
    const rot = [];
    for (const R of S.runden) {
        if (R.abweichungen)
            rot.push(
                `(T) TREUE ${R.name}: ${R.abweichungen} von ${R.strahlen} Strahlen treffen anders als die Schleife über den Bestand — ${JSON.stringify(R.abweichung.slice(0, 2))}`
            );
        if (R.ueberzaehlig)
            rot.push(
                `(A) ARBEIT ${R.name}: ${R.ueberzaehlig} von ${R.strahlen} Strahlen prüfen Boxen, deren Hülle ihr Segment nicht berührt (${(R.slabs / R.strahlen).toFixed(1)} Slabs je Strahl, berührt ${(R.beruehrt / R.strahlen).toFixed(1)}) — Rufer _fieldRaycast`
            );
        if (R.strahlen < 1000 || R.struktur < 100)
            rot.push(
                `(T) ${R.name}: zu wenig Strahlen oder Bau-Treffer (${R.strahlen} Strahlen, ${R.struktur} Bau-Treffer)`
            );
    }
    for (const [name, f] of S.konsistenz) for (const x of f) rot.push(`(K) KONSISTENZ ${name}: ${x}`);
    if (S.decke.slabsJeStrahl > S.decke.beruehrt)
        rot.push(
            `(A) ARBEIT Decke: ${S.decke.slabsJeStrahl} Slabs je Decken-Probe, ihr Segment berührt ${S.decke.beruehrt} Boxen`
        );
    const q = S.quelle;
    if (!q.strahlFragtNetz)
        rot.push("(Q) QUELLE: `_fieldRaycast` fragt die Nachbarschaft nicht (`this._blockerNetz()`)");
    if (q.strahlSchleife)
        rot.push(
            "(Q) QUELLE: `_fieldRaycast` läuft noch über den Bestand (`this.state.architectures` außer der Leer-Prüfung)"
        );
    if (!q.stempel)
        rot.push("(Q) QUELLE: `_blockerStampReach` stempelt die Nachbarschaft nicht (`_blockerNetzSetzen`)");
    if (!q.eintritt)
        rot.push("(Q) QUELLE: der Eintritt (`spawnArchitecture`, push) stempelt nicht (`_blockerEintritt`)");
    if (!q.abriss) rot.push("(Q) QUELLE: der Abriss (`removeArchitecture`, splice) löst nicht (`_blockerAustritt`)");
    if (!q.kappe) rot.push("(Q) QUELLE: die Kappe (`_evictArchitecture`, splice) löst nicht (`_blockerAustritt`)");
    if (stamm.length) rot.push(`(Q) QUELLE: Schreiber des Bestands ohne Stempel: ${stamm.join(" · ")}`);
    for (const e of pageErrors) rot.push(`(P) PAGE-ERROR: ${e}`);
    return rot;
}

// (Q) der Stamm: jeder Schreiber des Bestands — push/splice/pop/shift/unshift auf `this.state.architectures` oder einem Alias,
// eine Zuweisung des Arrays — steht an einer gestempelten Stelle (Zuweisung: das neue Array baut das Netz neu)
function stammSchreiber() {
    const z = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8").split("\n");
    const fremd = [];
    const alias = new Map();
    z.forEach((l, i) => {
        const code = l.replace(/\/\/.*$/, "");
        const m = /(?:const|let)\s+(\w+)\s*=\s*this\.state\.architectures\b/.exec(code);
        if (m) alias.set(m[1], (alias.get(m[1]) || []).concat(i));
    });
    z.forEach((l, i) => {
        const code = l.replace(/\/\/.*$/, "");
        const namen = [
            "this\\.state\\.architectures",
            ...[...alias.keys()].filter((a) => alias.get(a).some((j) => j <= i && i - j < 80)),
        ];
        for (const n of namen) {
            if (!new RegExp(`\\b${n}\\.(push|splice|pop|shift|unshift)\\(`).test(code)) continue;
            const nach = z.slice(i + 1, i + 3).join("\n");
            if (!/this\._blocker(Eintritt|Austritt)\(entry\)/.test(nach)) fremd.push(`Zeile ${i + 1}: ${code.trim()}`);
        }
    });
    return fremd;
}

(async () => {
    const stamm = stammSchreiber();
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__codeOf = (fnOrSrc) =>
            String(fnOrSrc)
                .replace(/\/\/.*$/gm, "")
                .replace(/\/\*[\s\S]*?\*\//g, "");
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 120000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                !window.anazhRealm.state.player ||
                typeof window.anazhRealm._gameLoopTick !== "function") &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });
    const S = await page.evaluate(probe);
    await browser.close();
    server.close();

    console.log(
        "=== DIE NACHBARSCHAFT DER BLOCKER — der Strahl fragt seine Zellen (Null-Renderer, eine echte Welt) ==="
    );
    for (const R of S.runden)
        console.log(
            `  ${R.name.padEnd(15)} ${R.bauten} Bauten, ${R.boxen} Boxen am Ort · ${R.strahlen} Strahlen, ${R.treffer} Treffer · ` +
                `Slabs je Strahl ${(R.slabs / R.strahlen).toFixed(1)} (berührt ${(R.beruehrt / R.strahlen).toFixed(1)}) · ` +
                `Bau-Treffer ${R.struktur} · Abweichungen ${R.abweichungen || 0}`
        );
    console.log(
        `  Decken-Probe am Ort: ${S.decke.slabsJeStrahl} Slabs je Strahl, ihr Segment berührt ${S.decke.beruehrt} Boxen`
    );
    console.log(`  Quelle: ${JSON.stringify(S.quelle)}`);
    const rot = urteil(S, stamm, pageErrors);
    if (rot.length) {
        console.error("\nROT:");
        for (const e of rot) console.error("  • " + e);
        process.exit(1);
    }
    console.log(
        "\nGRÜN — jeder Strahl trifft byte-gleich wie die Schleife über den Bestand und prüft nur die Boxen, die sein Segment berühren; das Netz ist der Bestand."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Blocker-Netz-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
