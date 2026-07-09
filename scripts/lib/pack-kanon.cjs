// pack-kanon.cjs — die EINE geteilte Pack-Naht (Gesetz #0, N3 Pack-Kanon).
// `mint-asset-packs.cjs` (das Werkzeug) UND `diag-pack-contract.cjs` (das Gate) LESEN diese
// eine Datei — kein zweiter Boot-/Encode-/Vergleichs-Pfad, der driften kann.
//
// Der Vertrag lebt in `spec/pack/v0/CONTRACT.md`:
//   v0  = der IST-IDB-Kanon (Key `preset|seed|lod|season` · Val `{meshes}` = Worker-Reply ·
//         Stempel = SHA-256(Manifest-Text + alle Manifest-Skripte)).
//   v1  = die Pack-Hülle (cv/key/meta/components + meshes mit b64-Puffern) — die Mint-Artefakte.
//
// Der ROUNDTRIP-BEWEIS (die Kern-Garantie dieser Naht): der Live-Reply wird im Browser
// serialisiert (b64 je Puffer) + UNABHÄNGIG gehasht (crypto.subtle über die rohen Bytes,
// VOR der b64-Kodierung) → das Pack wird geschrieben → in Node zurückgelesen + dekodiert +
// erneut gehasht → sha256 byte-gleich zum Live-Reply. So ist die Kodierung selbst bewiesen
// verlustfrei, nicht nur „gleicher String rein/raus".
"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..", "..");

const MIME = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
    ".wasm": "application/wasm",
};

function sha256Hex(buf) {
    return crypto.createHash("sha256").update(buf).digest("hex");
}

// ---------------------------------------------------------------------------
// Kommentar-Stripper (die V18.267-Falle: der Code darf das Wort im KOMMENTAR tragen,
// der CODE darf es nicht — jeder Source-Grep läuft über den gestrippten Body).
// Strings/Templates bleiben ERHALTEN (die Stempel-Probe sucht "cores.manifest.json",
// das als String-Literal im Code lebt).
function stripComments(src) {
    let out = "";
    let i = 0;
    const n = src.length;
    let state = "code"; // code | line | block | sq | dq | tpl
    while (i < n) {
        const c = src[i];
        const d = i + 1 < n ? src[i + 1] : "";
        if (state === "code") {
            if (c === "/" && d === "/") {
                state = "line";
                i += 2;
                continue;
            }
            if (c === "/" && d === "*") {
                state = "block";
                i += 2;
                continue;
            }
            if (c === "'") state = "sq";
            else if (c === '"') state = "dq";
            else if (c === "`") state = "tpl";
            out += c;
            i++;
            continue;
        }
        if (state === "line") {
            if (c === "\n") {
                state = "code";
                out += c;
            }
            i++;
            continue;
        }
        if (state === "block") {
            if (c === "*" && d === "/") {
                state = "code";
                i += 2;
                continue;
            }
            i++;
            continue;
        }
        // Strings/Templates: byte-treu übernehmen, Escapes respektieren.
        if (c === "\\") {
            out += c + d;
            i += 2;
            continue;
        }
        if ((state === "sq" && c === "'") || (state === "dq" && c === '"') || (state === "tpl" && c === "`"))
            state = "code";
        out += c;
        i++;
    }
    return out;
}

// Den Quelltext einer Klassen-Methode grob herausschneiden: vom Methoden-Kopf bis zum
// FRÜHESTEN der genannten Nachfolger-Anker (Source-Proben-Zweck, kein AST nötig).
function methodSource(src, name, nextAnchors) {
    const head = "\n    " + name + "(";
    const start = src.indexOf(head);
    if (start < 0) return null;
    let end = src.length;
    for (const a of nextAnchors || []) {
        const p = src.indexOf("\n    " + a, start + head.length);
        if (p > start && p < end) end = p;
    }
    if (end - start > 20000) end = start + 20000; // Sicherheits-Deckel, falls alle Anker fehlen
    return src.slice(start, end);
}

// ---------------------------------------------------------------------------
// Der Generator-Quellen-Stempel — EXAKT die `_foundryIdbInit`-Formel, in Node nachgerechnet:
// SHA-256 über `manifestText + "\n" + script_1 + "\n" + … ` (UTF-8; srcs.join("\n")).
function computeStamp(root) {
    const r = root || ROOT;
    const manifestText = fs.readFileSync(path.join(r, "cores.manifest.json"), "utf8");
    const manifest = JSON.parse(manifestText);
    const scripts = [];
    if (Array.isArray(manifest)) {
        for (const core of manifest) {
            if (!core || !Array.isArray(core.scripts)) continue;
            for (const s of core.scripts) if (typeof s === "string" && s) scripts.push(s);
        }
    }
    const srcs = [manifestText];
    for (const s of scripts) srcs.push(fs.readFileSync(path.join(r, s), "utf8"));
    return sha256Hex(Buffer.from(srcs.join("\n"), "utf8"));
}

function readManifest(root) {
    return JSON.parse(fs.readFileSync(path.join(root || ROOT, "cores.manifest.json"), "utf8"));
}

// `meta.coreId` — DATEN-getrieben (M8, kein kind-if): Zweit-Kern-Rezepte reisen im gemergten
// Buch mit `panel = <core.id>` (__replyRecipes); sonst führt der Erst-Kern des Manifests.
function coreIdFor(rec, manifest) {
    const first = Array.isArray(manifest) && manifest[0] && manifest[0].id ? manifest[0].id : "phyto";
    if (!rec || typeof rec.panel !== "string") return first;
    for (const core of manifest || []) {
        if (core && core.ns && core.id === rec.panel) return core.id;
    }
    return first;
}

// ---------------------------------------------------------------------------
// Pack v1 — Datei-Namen, Hülle, Roundtrip.
function packFileName(presetId, seed, lod, season) {
    return `${presetId}-s${seed}-L${lod}-${season}.json`;
}

// Aus dem im Browser serialisierten Live-Reply (`__packSer`) die v1-Pack-Hülle bauen.
// Das Pack trägt NUR {itemSize,type,b64} je Puffer (CONTRACT.md §v1) — die unabhängigen
// Browser-Hashes (sha256/bytes) bleiben im `ser` für den Vergleich, reisen NICHT ins Pack.
function packFromReply(ser, meta) {
    return {
        cv: 1,
        key: `${ser.presetId}|${ser.seed}|${ser.lod}|${ser.season}`,
        presetId: ser.presetId,
        seed: ser.seed,
        lod: ser.lod,
        season: ser.season,
        meta: meta || {},
        components: {},
        meshes: (ser.meshes || []).map((m) => {
            const out = { kind: m.kind, mat: m.mat, attrs: {} };
            for (const k of Object.keys(m.attrs || {})) {
                const a = m.attrs[k];
                out.attrs[k] = { itemSize: a.itemSize, type: a.type, b64: a.b64 };
            }
            if (m.index) out.index = { type: m.index.type, b64: m.index.b64 };
            return out;
        }),
    };
}

// Pack (wie von der Platte gelesen) BYTE-GENAU gegen den Live-Reply richten: dekodiert jedes
// b64 zurück zu Bytes und vergleicht sha256 + Byte-Länge gegen die UNABHÄNGIG im Browser
// (vor der Kodierung) gerechneten Werte. Liefert die Liste der Divergenzen ([] = byte-gleich).
function comparePackToReply(pack, ser) {
    const diffs = [];
    const tag = ser ? `${ser.presetId}|${ser.seed}|${ser.lod}|${ser.season}` : "?";
    if (!pack || !Array.isArray(pack.meshes)) return [`${tag}: Pack ohne meshes`];
    if (pack.cv !== 1) diffs.push(`${tag}: cv ${pack.cv} != 1`);
    if (!ser || !Array.isArray(ser.meshes)) return diffs.concat([`${tag}: Live-Reply fehlt`]);
    if (pack.meshes.length !== ser.meshes.length)
        return diffs.concat([`${tag}: Mesh-Zahl ${pack.meshes.length} vs ${ser.meshes.length}`]);
    for (let i = 0; i < ser.meshes.length; i++) {
        const pm = pack.meshes[i];
        const sm = ser.meshes[i];
        if (pm.kind !== sm.kind) diffs.push(`${tag} Mesh${i}: kind ${pm.kind} vs ${sm.kind}`);
        if (JSON.stringify(pm.mat || null) !== JSON.stringify(sm.mat || null))
            diffs.push(`${tag} Mesh${i}: mat divergiert`);
        const keys = new Set([...Object.keys(pm.attrs || {}), ...Object.keys(sm.attrs || {})]);
        for (const k of keys) {
            const pa = (pm.attrs || {})[k];
            const sa = (sm.attrs || {})[k];
            if (!pa || !sa) {
                diffs.push(`${tag} Mesh${i}.${k}: Attribut nur auf einer Seite`);
                continue;
            }
            if (pa.itemSize !== sa.itemSize)
                diffs.push(`${tag} Mesh${i}.${k}: itemSize ${pa.itemSize} vs ${sa.itemSize}`);
            if (pa.type !== sa.type) diffs.push(`${tag} Mesh${i}.${k}: type ${pa.type} vs ${sa.type}`);
            const buf = Buffer.from(pa.b64 || "", "base64");
            if (buf.length !== sa.bytes) diffs.push(`${tag} Mesh${i}.${k}: Byte-Länge ${buf.length} vs ${sa.bytes}`);
            else if (sha256Hex(buf) !== sa.sha256)
                diffs.push(`${tag} Mesh${i}.${k}: sha256-Divergenz (Bytes verfälscht)`);
        }
        const pIdx = pm.index || null;
        const sIdx = sm.index || null;
        if (!!pIdx !== !!sIdx) diffs.push(`${tag} Mesh${i}: index nur auf einer Seite`);
        else if (pIdx && sIdx) {
            const buf = Buffer.from(pIdx.b64 || "", "base64");
            if (pIdx.type !== sIdx.type) diffs.push(`${tag} Mesh${i}.index: type ${pIdx.type} vs ${sIdx.type}`);
            if (buf.length !== sIdx.bytes)
                diffs.push(`${tag} Mesh${i}.index: Byte-Länge ${buf.length} vs ${sIdx.bytes}`);
            else if (sha256Hex(buf) !== sIdx.sha256) diffs.push(`${tag} Mesh${i}.index: sha256-Divergenz`);
        }
    }
    return diffs;
}

function writePack(dir, pack) {
    fs.mkdirSync(dir, { recursive: true });
    const f = path.join(dir, packFileName(pack.presetId, pack.seed, pack.lod, pack.season));
    fs.writeFileSync(f, JSON.stringify(pack) + "\n");
    return f;
}

function readPack(file) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

// ---------------------------------------------------------------------------
// DER EINE BOOT-PFAD (wie gate:foundry-warm): AnazhRealm headless (Null-Renderer, GPU-frei)
// mit ERZWUNGENER Foundry (der Worker bäckt echte Assets im Gate-Kontext; die IDB ist
// headless bewusst AUS → jeder `_foundryRequest` ist ein ECHTER Worker-Reply, genau die
// Wahrheit, die das Pack einfrieren soll).
async function bootRealm(port) {
    const puppeteer = require("puppeteer");
    const server = http.createServer((req, res) => {
        let p = req.url.split("?")[0];
        if (p === "/") p = "/index.html";
        const fp = path.join(ROOT, p);
        if (!fp.startsWith(ROOT)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            if (err) return ((res.statusCode = 404), res.end());
            res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
    await new Promise((r) => server.listen(port, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessSkinResCap = 64;
        window.__anazhHeadlessNullRenderer = true;
        window.__anazhForceFoundry = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Welt bereit = `_gameLoopTick` ist eine Funktion (renderer-unabhängig korrekt, CLAUDE.md).
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                typeof window.anazhRealm._gameLoopTick !== "function" ||
                !window.anazhRealm.state.blueprints) &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });
    const close = async () => {
        try {
            await browser.close();
        } catch (_e) {}
        server.close();
    };
    return { browser, page, server, pageErrors, close };
}

// Auf den Worker + das Rezeptbuch warten (die foundry-warm-Disziplin: der Rezept-Reply ist
// ein EIGENER Round-Trip nach ready — auf die WAHRHEIT warten, nicht den Timing-Zufall).
async function waitFoundryReady(page, timeoutMs) {
    return page.evaluate(async (tmo) => {
        const r = window.anazhRealm;
        const out = { ready: false, recipeCount: 0, readyMs: -1 };
        const f = r._ensureAssetFoundry();
        if (!f) return out;
        const t0 = performance.now();
        const dl = t0 + tmo;
        while (!f.ready && performance.now() < dl) await new Promise((res) => setTimeout(res, 50));
        out.ready = !!f.ready;
        out.readyMs = f.ready ? Math.round(performance.now() - t0) : -1;
        if (!f.ready) return out;
        const dlR = performance.now() + 30000;
        while (!(f.recipeCount > 0) && performance.now() < dlR) await new Promise((res) => setTimeout(res, 100));
        out.recipeCount = f.recipeCount || 0;
        return out;
    }, timeoutMs || 90000);
}

// Auf die WARME Bibliothek warten (der Prefetch-Fächer ist durch): _prefetching false +
// Cache gefüllt. Liefert die Cache-Schlüssel (das Inventar der Gestalt-Reise).
async function waitLibraryWarm(page, timeoutMs) {
    return page.evaluate(async (tmo) => {
        const r = window.anazhRealm;
        const f = r._foundry;
        const dl = performance.now() + tmo;
        while (performance.now() < dl) {
            if (f && f.cache && f.cache.size > 0 && f._prefetching === false) break;
            await new Promise((res) => setTimeout(res, 200));
        }
        const keys = f && f.cache ? Array.from(f.cache.keys()) : [];
        return { warm: !!(f && f.cache && f.cache.size > 0 && f._prefetching === false), keys };
    }, timeoutMs || 180000);
}

// Den Live-Reply-Serialisierer in die Seite pflanzen: `window.__packSer(preset,seed,lod,season)`
// ruft `_foundryRequest` (der EINE Produktions-Pfad) und liefert je Puffer { itemSize, type,
// bytes, b64, sha256 } — sha256 UNABHÄNGIG von b64 über die rohen Bytes (crypto.subtle;
// 127.0.0.1 ist ein secure context). Der Node-Leser beweist damit die Kodierung selbst.
async function installPackSerializer(page) {
    await page.evaluate(() => {
        const b64 = (u) => {
            let s = "";
            for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
            return btoa(s);
        };
        const sha = async (u) => {
            const d = await crypto.subtle.digest("SHA-256", u);
            return Array.from(new Uint8Array(d))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
        };
        window.__packSer = async (presetId, seed, lod, season) => {
            const r = window.anazhRealm;
            const meshes = await r._foundryRequest(presetId, seed, lod, season);
            if (!meshes || !meshes.length) return null;
            const out = [];
            for (const m of meshes) {
                const om = { kind: m.kind || "unknown", mat: m.mat || null, attrs: {} };
                for (const k of Object.keys(m)) {
                    const v = m[k];
                    if (v && v.array && v.itemSize && v.array.buffer) {
                        const u = new Uint8Array(v.array.buffer, v.array.byteOffset, v.array.byteLength);
                        om.attrs[k] = {
                            itemSize: v.itemSize,
                            type: v.array.constructor.name,
                            bytes: u.length,
                            b64: b64(u),
                            sha256: await sha(u),
                        };
                    }
                }
                if (m.index && m.index.buffer) {
                    const u = new Uint8Array(m.index.buffer, m.index.byteOffset, m.index.byteLength);
                    om.index = { type: m.index.constructor.name, bytes: u.length, b64: b64(u), sha256: await sha(u) };
                }
                out.push(om);
            }
            return { presetId, seed, lod, season, meshes: out };
        };
    });
}

module.exports = {
    ROOT,
    sha256Hex,
    stripComments,
    methodSource,
    computeStamp,
    readManifest,
    coreIdFor,
    packFileName,
    packFromReply,
    comparePackToReply,
    writePack,
    readPack,
    bootRealm,
    waitFoundryReady,
    waitLibraryWarm,
    installPackSerializer,
};
