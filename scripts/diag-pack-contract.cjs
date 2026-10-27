// diag-pack-contract.cjs — DIE PACK-KANON-LINSE (N3, `npm run gate:pack-contract`).
//
// Drei Prüfungen (a–b statisch, d der eine Browser-Beweis):
//   (a) `spec/pack/v0/CONTRACT.md` existiert + trägt die Pflicht-Abschnitte (v0-Ist-Kanon ·
//       v1-Schema · must-ignore · Ship-Hook · Ü1/Ü2-Chokepoint).
//   (b) Absenz: keine Labor-Shell reist in den Platten-Stempel; die Stempel-Formel beweist gate:fluss.
//   (d) Browser: EIN Preset (eiche, lod 2) live minten → Artefakt zurücklesen → byte-gleich
//       zum Live-Reply (sha256 je Puffer, UNABHÄNGIG vor der b64-Kodierung gerechnet) + der
//       Hook VERHALTENS-bewiesen (false → null trotz ready-Worker; weg → Meshes).
//
//   --selftest: der Detektor ist NICHT vakuös — ein synthetisches Pack wird geschrieben,
//   korrumpiert (ein Byte geflippt bzw. gekürzt) und MUSS rot vergleichen.
//
//   node scripts/diag-pack-contract.cjs --selftest && node scripts/diag-pack-contract.cjs
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const PK = require("./lib/pack-kanon.cjs");
const { hauptLauf, urteilEnde } = require("./lib/welt-boot.cjs");
const stammLib = require("./lib/stamm.cjs");

const PORT = Number(process.env.PACK_GATE_PORT || 4562);
const CONTRACT = path.join(PK.ROOT, "spec", "pack", "v0", "CONTRACT.md");

let fails = 0;
function check(ok, label) {
    console.log(`  ${ok ? "✅" : "❌"} ${label}`);
    if (!ok) fails++;
    return ok;
}

// ---------------------------------------------------------------------------
// --selftest (Node-pur): ein korruptes Pack-Artefakt MUSS rot vergleichen.
async function selftest() {
    console.log("=== PACK-CONTRACT SELBST-TEST (der Detektor feuert) ===");
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pack-selftest-"));
    try {
        // Synthetischer „Live-Reply": kleine bekannte Puffer, sha256 in Node als Browser-Wahrheit.
        const pos = Buffer.from(new Float32Array([0.5, -1.25, 3.75, 2, 4, 8]).buffer);
        const idx = Buffer.from(new Uint32Array([0, 1, 2]).buffer);
        const ser = {
            presetId: "synthetik",
            seed: 1,
            lod: 2,
            meshes: [
                {
                    kind: "bark",
                    mat: { roughness: 0.93 },
                    attrs: {
                        position: {
                            itemSize: 3,
                            type: "Float32Array",
                            bytes: pos.length,
                            b64: pos.toString("base64"),
                            sha256: PK.sha256Hex(pos),
                        },
                    },
                    index: {
                        type: "Uint32Array",
                        bytes: idx.length,
                        b64: idx.toString("base64"),
                        sha256: PK.sha256Hex(idx),
                    },
                },
            ],
        };
        const file = PK.writePack(tmp, PK.packFromReply(ser, { kind: "tree", coreId: "phyto" }));
        check(PK.comparePackToReply(PK.readPack(file), ser).length === 0, "sauberes Pack vergleicht grün");
        // Korruption 1: ein Byte im position-Puffer geflippt → sha256-Divergenz MUSS feuern.
        const bad = PK.readPack(file);
        const buf = Buffer.from(bad.meshes[0].attrs.position.b64, "base64");
        buf[4] ^= 0xff;
        bad.meshes[0].attrs.position.b64 = buf.toString("base64");
        fs.writeFileSync(file, JSON.stringify(bad));
        const d1 = PK.comparePackToReply(PK.readPack(file), ser);
        check(
            d1.some((x) => /position: sha256-Divergenz/.test(x)),
            `korruptes Byte → rot (${d1[0] || "kein Diff!"})`
        );
        // Korruption 2: gekürzter index-Puffer → Byte-Längen-Divergenz MUSS feuern.
        const bad2 = PK.readPack(file);
        bad2.meshes[0].attrs.position.b64 = pos.toString("base64");
        bad2.meshes[0].index.b64 = idx.subarray(0, 8).toString("base64");
        fs.writeFileSync(file, JSON.stringify(bad2));
        const d2 = PK.comparePackToReply(PK.readPack(file), ser);
        check(
            d2.some((x) => /index: Byte-Länge/.test(x)),
            `gekürzter Puffer → rot (${d2[0] || "kein Diff!"})`
        );
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
    // der Boot-Lauf ist nicht vakuös: ein Manifest ohne core.bruecke lässt Laden und Stempel rot werden
    const ohne = JSON.stringify(PK.readManifest(PK.ROOT).map((c) => Object.assign({}, c, { bruecke: undefined })));
    const t = await bootLauf(ohne);
    check(t.laden !== t.sollLaden && t.stempel !== t.sollStempel, "Täter-Manifest ohne core.bruecke → Laden und Stempel rot");
    urteilEnde(fails, "\n❌ SELBST-TEST ROT — der Detektor ist vakuös.", "\n✅ SELBST-TEST GRÜN — ein korruptes Pack-Artefakt wird sicher rot.");
}

// DER BOOT ALS LAUF (B3a): die Geburt des Wirts (`_ensureAssetFoundry` der echten Klasse im vm, `ladeKlasse`) baut den
// Boot-Blob synchron, und der Blob läuft in einem Schein-Faden, der das Manifest `text` liefert, Laden, Abruf und Digest
// mitschreibt. Das Soll kommt aus dem echten Manifest; ohne Blob bei der Geburt nennt `fehler` den Täter.
async function bootLauf(text) {
    const vm = require("vm");
    const { AnazhRealm: A, ctx } = stammLib.ladeKlasse(PK.ROOT);
    const g = vm.runInContext("globalThis", ctx);
    const aus = { geburt: null, fehler: null, laden: null, stempel: null, wand: false };
    let blob = null;
    Object.assign(g, { indexedDB: {}, crypto: { subtle: {} }, location: { href: "http://wirt/index.html" } });
    g.Blob = function (teile) { blob = teile.join(""); }; // prettier-ignore
    g.URL = class extends URL { static createObjectURL() { return "blob:boot"; } }; // prettier-ignore
    g.Worker = function (_u, o) { aus.geburt = (o && o.name) || "ohne Namen"; this.postMessage = () => {}; }; // prettier-ignore
    const wirt = Object.assign(Object.create(A.prototype), { state: {}, _foundryHelfer() {}, _stoffBruch: (w, e) => e || new Error(w) }); // prettier-ignore
    try { A.prototype._ensureAssetFoundry.call(wirt, true); } catch (e) { aus.fehler = e.message; } // prettier-ignore
    const echt = PK.readManifest(PK.ROOT);
    const url = (p) => new URL(p + "?v=" + A.VERSION, "http://wirt/index.html").href;
    const liste = (feld) => echt.flatMap((c) => [].concat(c[feld] || [])).map(url);
    aus.sollLaden = ["lib", "scripts", "bruecke"].flatMap(liste).join(" ");
    const quellen = liste("scripts").concat(liste("bruecke")).map((u) => `<${u}>`);
    aus.sollStempel = [fs.readFileSync(path.join(PK.ROOT, "cores.manifest.json"), "utf8"), ...quellen].join("\n");
    if (!blob) return Object.assign(aus, { fehler: "kein Boot-Blob bei der Geburt — der Haupt-Faden holt das Manifest (fetch) vor ihr" }); // prettier-ignore
    const ord = [];
    const w = { TextEncoder, URL, indexedDB: {}, addEventListener: (t) => ord.push(t), postMessage: (m) => (aus.post = m) };
    w.XMLHttpRequest = function () { this.open = () => {}; this.send = () => (this.responseText = text); }; // prettier-ignore
    w.importScripts = (...u) => (ord.push("laden"), (aus.laden = ord[0] === "message" ? u.join(" ") : "die Schale steht nicht davor")); // prettier-ignore
    w.fetch = (u) => Promise.resolve({ text: () => Promise.resolve(`<${u}>`) });
    w.crypto = { subtle: { digest: (_a, b) => ((aus.stempel = new TextDecoder().decode(b)), new Promise(() => {})) } };
    w.self = w.globalThis = w;
    vm.runInContext(blob, vm.createContext(w));
    w.postMessage({ type: "asset", meshes: [{ position: { array: new Float32Array(3) }, aWind: { array: new Float32Array(3) } }] }); // prettier-ignore
    aus.wand = !!(aus.post && aus.post.meshes[0].position && !aus.post.meshes[0].aWind);
    for (let i = 0; i < 50 && aus.stempel == null; i++) await new Promise((r) => setImmediate(r));
    return aus;
}

// ---------------------------------------------------------------------------
async function main() {
    console.log("=== N3 — PACK-CONTRACT (Vertrag · Stempel · Ship-Hook · Roundtrip) ===");

    // (a) CONTRACT.md + Pflicht-Abschnitte.
    const hasContract = fs.existsSync(CONTRACT);
    check(hasContract, "spec/pack/v0/CONTRACT.md existiert");
    if (hasContract) {
        const md = fs.readFileSync(CONTRACT, "utf8");
        const sections = [
            "## v0 — Schlüssel",
            "## v0 — Wert",
            "## v0 — Stempel",
            "## v0 — Miss/Bust",
            "Der Request-Pfad + der Ship-Hook",
            "## Pack v1 — Schema",
            "must-ignore",
            "## r128→r184-Übersetzung am Chokepoint",
        ];
        for (const s of sections) check(md.includes(s), `CONTRACT.md trägt „${s}"`);
        for (const marker of [
            "<preset>|<gestalt>|<lod>",
            "bruecke_1",
            "SHA-256",
            "__anazhLiveBake",
            "LEGACY_LICHT",
            "cv",
        ])
            check(md.includes(marker), `CONTRACT.md trägt den Anker „${marker}"`);
    }

    // (b) DER BOOT ALS LAUF (B3a, `bootLauf`): Geburt, Laden, Konsum-Wand und Stempel am Lauf der echten Klasse, nie am
    // Text ihres Rumpfs — keine Labor-Datei im Faden und im Stempel; den Ship-Hook beweist (d).
    const lauf = await bootLauf(fs.readFileSync(path.join(PK.ROOT, "cores.manifest.json"), "utf8"));
    check(lauf.geburt === "buch", `Boot: der Faden kommt synchron mit der Geburt und heißt „buch" (${lauf.geburt || lauf.fehler})`);
    const labor = /\/worlds\/[^/?]+\/(?!lib\/)[^?]*\.js|\/(OrbitControls|PointerLockControls|EffectComposer|UnrealBloomPass|FXAAShader)\.js/; // prettier-ignore
    check(lauf.laden === lauf.sollLaden && !labor.test(lauf.laden), "Boot: die Schale steht vor dem Studio, der Faden lädt lib · scripts · bruecke allein aus dem Manifest, keine Labor-Datei (K42)"); // prettier-ignore
    check(lauf.wand, "Boot: die Konsum-Wand (FOUNDRY_LESEN) reist in die Schale — ein ungelesenes Attribut fällt vor dem Transfer");
    check(lauf.stempel === lauf.sollStempel && !labor.test(lauf.stempel), "Stempel: Manifest-Text vor ALLEN core.scripts + core.bruecke (Mesh-Extraktion, Karten-Bäcker), keine Labor-Shell (K42)"); // prettier-ignore
    if (fails) {
        console.error(`\n❌ ROT — ${fails} statische Prüfung(en) verletzt (Browser-Teil übersprungen).`);
        process.exit(1);
    }

    // (d) DER ROUNDTRIP-BEWEIS + der Hook VERHALTENS-bewiesen (ein Preset, lod 2 — klein).
    const manifest = PK.readManifest(PK.ROOT);
    const realm = await PK.bootRealm(PORT);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pack-gate-"));
    try {
        const rd = await PK.waitFoundryReady(realm.page);
        check(rd.ready && rd.recipeCount > 0, `Foundry ready (${rd.readyMs} ms) + Rezepte (${rd.recipeCount})`);
        if (!rd.ready) throw new Error("Foundry nicht bereit");
        await PK.installPackSerializer(realm.page);
        // Hook-Verhalten: false → null TROTZ ready-Worker (der Fallback ist übersprungen).
        const hooked = await realm.page.evaluate(async () => {
            window.__anazhLiveBake = false;
            const m = await window.anazhRealm._foundryRequest("eiche", 5, 2);
            delete window.__anazhLiveBake; // Default wiederherstellen (die Gate-Hook-Lehre: sichern/restoren)
            return m === null;
        });
        check(hooked, "Verhalten: __anazhLiveBake=false → _foundryRequest null trotz ready-Worker");
        // Default-Pfad: Hook weg → der Worker liefert (byte-Wahrheit für den Roundtrip).
        const ser = await realm.page.evaluate(() => window.__packSer("eiche", 7, 2));
        check(
            !!(ser && ser.meshes && ser.meshes.length),
            `Live-Reply eiche|7|2: ${ser ? ser.meshes.length : 0} Meshes`
        );
        if (!ser) throw new Error("kein Live-Reply");
        const rec = await realm.page.evaluate(() => {
            const f = window.anazhRealm._foundry;
            const r = f && f.recipes ? f.recipes.eiche : null;
            return r ? { kind: r.kind, panel: r.panel } : null;
        });
        const pack = PK.packFromReply(ser, { kind: rec ? rec.kind : undefined, coreId: PK.coreIdFor(rec, manifest) });
        check(
            pack.meta.kind === "tree" && pack.meta.coreId === manifest[0].id,
            `meta { kind:${pack.meta.kind}, coreId:${pack.meta.coreId} } aus Buch+Manifest`
        );
        const file = PK.writePack(tmp, pack);
        const back = PK.readPack(file);
        const diffs = PK.comparePackToReply(back, ser);
        let bufs = 0;
        let bytes = 0;
        for (const m of ser.meshes) {
            for (const k of Object.keys(m.attrs)) {
                bufs++;
                bytes += m.attrs[k].bytes;
            }
            if (m.index) {
                bufs++;
                bytes += m.index.bytes;
            }
        }
        check(
            diffs.length === 0,
            `Roundtrip mint→zurücklesen: ${bufs} Puffer · ${(bytes / 1024).toFixed(0)} KB byte-gleich` +
                (diffs.length ? ` (${diffs[0]})` : "")
        );
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
        await realm.close();
    }

    urteilEnde(fails, `\n❌ ROT — ${fails} Prüfung(en) verletzt (Pack-Kanon N3 nicht bestätigt).`, "\n✅ GRÜN — Vertrag dokumentiert · Stempel-Drift-Wand steht · Ship-Hook lebt · Roundtrip byte-gleich.");
}

if (process.argv.includes("--selftest")) selftest();
else
    hauptLauf(main);
