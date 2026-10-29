// pack-kanon.cjs — die EINE geteilte Pack-Naht (Gesetz #0, N3 Pack-Kanon).
// `mint-asset-packs.cjs` (das Werkzeug) UND `diag-pack-contract.cjs` (das Gate) LESEN diese
// eine Datei — kein zweiter Boot-/Encode-/Vergleichs-Pfad, der driften kann.
//
// Der Vertrag lebt in `spec/pack/v0/CONTRACT.md`:
//   v0  = der IST-IDB-Kanon (Key `<stempel>~preset|gestalt|lod[|ov:<hash>]` · Val `{meshes}` = Worker-Reply ·
//         Stempel = je gelesenem Kern SHA-256 seiner Quellen).
//   v1  = die Pack-Hülle (cv/key/meta/components + meshes mit b64-Puffern) — die Mint-Artefakte.
//
// Der ROUNDTRIP-BEWEIS (die Kern-Garantie dieser Naht): der Live-Reply wird im Browser
// serialisiert (b64 je Puffer) + UNABHÄNGIG gehasht (crypto.subtle über die rohen Bytes,
// VOR der b64-Kodierung) → das Pack wird geschrieben → in Node zurückgelesen + dekodiert +
// erneut gehasht → sha256 byte-gleich zum Live-Reply. So ist die Kodierung selbst bewiesen
// verlustfrei, nicht nur „gleicher String rein/raus".
"use strict";

const { statikServer, nullSeite } = require("./welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..", "..");


function sha256Hex(buf) {
    return crypto.createHash("sha256").update(buf).digest("hex");
}

// ---------------------------------------------------------------------------
// Kommentar-Stripper (die Falle: der Code darf das Wort im KOMMENTAR tragen,
// der CODE darf es nicht — jeder Source-Grep läuft über den gestrippten Body).
// Strings/Templates bleiben ERHALTEN (die Stempel-Probe sucht "cores.manifest.json",
// das als String-Literal im Code lebt).
const stripComments = require("./stamm.cjs").ohneKommentare;

// ---------------------------------------------------------------------------
// Der Generator-Quellen-Stempel — EXAKT die Formel der Transport-Schale (`_foundrySchale`, ihr `__stamp`), in Node
// nachgerechnet: je Kern SHA-256 über seine Quellen (scripts · lib · bruecke, UTF-8, mit "\n" verbunden), die ersten 16 Hex,
// als `<kern>:<sha>` in Manifest-Folge mit "," verbunden. Die Platte stellt `f<FOUNDRY_PLATTE_FORMAT>|` voran — der
// Pack-Index trägt den reinen Generator-Stempel (den Stempel des echten Boots misst gate:pack-contract `bootLauf`).
function computeStamp(root) {
    const lese = (rel) => fs.readFileSync(path.join(root || ROOT, rel), "utf8");
    const quellen = (k) => ["scripts", "lib", "bruecke"].flatMap((f) => [].concat(k[f] || [])).map(lese);
    return JSON.parse(lese("cores.manifest.json"))
        .map((k) => (k.id || k.ns) + ":" + sha256Hex(Buffer.from(quellen(k).join("\n"), "utf8")).slice(0, 16))
        .join(",");
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
function packFileName(presetId, seed, lod) {
    return `${presetId}-s${seed}-L${lod}.json`;
}

// Aus dem im Browser serialisierten Live-Reply (`__packSer`) die v1-Pack-Hülle bauen.
// Das Pack trägt NUR {itemSize,type,b64} je Puffer (CONTRACT.md §v1) — die unabhängigen
// Browser-Hashes (sha256/bytes) bleiben im `ser` für den Vergleich, reisen NICHT ins Pack.
function packFromReply(ser, meta) {
    return {
        cv: 1,
        key: `${ser.presetId}|${ser.seed}|${ser.lod}`,
        presetId: ser.presetId,
        seed: ser.seed,
        lod: ser.lod,
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
    const tag = ser ? `${ser.presetId}|${ser.seed}|${ser.lod}` : "?";
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
    const f = path.join(dir, packFileName(pack.presetId, pack.seed, pack.lod));
    fs.writeFileSync(f, JSON.stringify(pack) + "\n");
    return f;
}

function readPack(file) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

// ---------------------------------------------------------------------------
// DER EINE BOOT-PFAD (wie gate:fluss): AnazhRealm headless (Null-Renderer, GPU-frei)
// mit ERZWUNGENER Foundry (der Worker bäckt echte Assets im Gate-Kontext; die IDB ist
// headless bewusst AUS → jeder `_foundryRequest` ist ein ECHTER Worker-Reply, genau die
// Wahrheit, die das Pack einfrieren soll).
async function bootRealm(port) {
    const server = statikServer();
    await server.lausche(port);
    const { browser, page } = await nullSeite({ frist: 240000 });
    await server.zeige(page, 30000);
    // Welt bereit = `_gameLoopTick` ist eine Funktion (renderer-unabhängig korrekt, CLAUDE.md).
    await page.evaluate(async () => {
        await window.__weltDa((r) => r.state && r.state.blueprints);
    });
    const close = async () => {
        try {
            await browser.close();
        } catch {}
        server.close();
    };
    return { browser, page, server, close };
}

// Auf den Worker + das Rezeptbuch warten (der Rezept-Reply ist
// ein EIGENER Round-Trip nach ready — auf die WAHRHEIT warten, nicht den Timing-Zufall).
async function waitFoundryReady(page) {
    return page.evaluate(async () => {
        const out = { ready: false, recipeCount: 0, readyMs: -1 };
        const f = r._ensureAssetFoundry();
        if (!f) return out;
        const t0 = performance.now();
        await window.__weltDa(() => !(!f.ready));
        out.ready = true;
        out.readyMs = Math.round(performance.now() - t0);
        await window.__weltDa(() => f.recipeCount > 0);
        out.recipeCount = f.recipeCount || 0;
        return out;
    });
}

// Auf die WARME Bibliothek warten (der Prefetch-Fächer ist durch): _vorrat false +
// Cache gefüllt. Liefert die Cache-Schlüssel (das Inventar der Gestalt-Reise).
async function waitLibraryWarm(page) {
    return page.evaluate(async () => {
        const f = r._foundry;
        await window.__weltDa(() => f && f.cache && f.cache.size > 0 && f._vorrat === false);
        const keys = f && f.cache ? Array.from(f.cache.keys()) : [];
        return { warm: !!(f && f.cache && f.cache.size > 0 && f._vorrat === false), keys };
    });
}

// Den Live-Reply-Serialisierer in die Seite pflanzen: `window.__packSer(preset,seed,lod)`
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
        window.__packSer = async (presetId, seed, lod) => {
            const meshes = await r._foundryRequest(presetId, seed, lod);
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
            return { presetId, seed, lod, meshes: out };
        };
    });
}

module.exports = {
    ROOT,
    sha256Hex,
    stripComments,
    computeStamp,
    readManifest,
    coreIdFor,
    packFromReply,
    comparePackToReply,
    writePack,
    readPack,
    bootRealm,
    waitFoundryReady,
    waitLibraryWarm,
    installPackSerializer,
};
