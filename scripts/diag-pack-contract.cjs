// diag-pack-contract.cjs — DIE PACK-KANON-LINSE (N3, `npm run gate:pack-contract`).
//
// Vier Prüfungen, Node-pur wo möglich (a–c statisch, d der eine Browser-Beweis):
//   (a) `spec/pack/v0/CONTRACT.md` existiert + trägt die Pflicht-Abschnitte (v0-Ist-Kanon ·
//       v1-Schema · must-ignore · Ship-Hook · Ü1/Ü2-Chokepoint).
//   (b) der IDB-Stempel-Code hasht MANIFEST + alle Manifest-Skripte (`_foundryIdbInit`,
//       kommentar-gestrippter Source-Grep — die V18.267-Disziplin) — die Drift-Wand steht.
//   (c) der Ship-Hook `window.__anazhLiveBake === false` lebt im Request-Pfad
//       (`_foundryRequest`), VOR dem Worker-Fallback, hinter dem Disk-first (Source-Probe).
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
function selftest() {
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
            season: "summer",
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
    if (fails) {
        console.error("\n❌ SELBST-TEST ROT — der Detektor ist vakuös.");
        process.exit(1);
    }
    console.log("\n✅ SELBST-TEST GRÜN — ein korruptes Pack-Artefakt wird sicher rot.");
    process.exit(0);
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
        for (const marker of ["<preset>|<seed>|<lod>|<season>", "SHA-256", "__anazhLiveBake", "LEGACY_LICHT", "cv"])
            check(md.includes(marker), `CONTRACT.md trägt den Anker „${marker}"`);
    }

    // (b) + (c) Source-Proben am kommentar-gestrippten Code (V18.267: der Kommentar darf das
    // Wort tragen, der CODE muss es tragen — hier PRÄSENZ-Proben, also gestrippt gegen die
    // Möglichkeit, dass NUR ein Kommentar das Muster trägt).
    const anazh = fs.readFileSync(path.join(PK.ROOT, "anazhRealm.js"), "utf8");
    const idbInit = PK.methodSource(anazh, "_foundryIdbInit", ["_foundryIdbGet("]);
    check(!!idbInit, "_foundryIdbInit im Stamm gefunden");
    if (idbInit) {
        const code = PK.stripComments(idbInit);
        check(/cores\.manifest\.json/.test(code), "Stempel: hasht den MANIFEST-Text (cores.manifest.json im Code)");
        check(/SHA-256/.test(code), "Stempel: SHA-256-Digest im Code");
        check(/core\.scripts/.test(code), "Stempel: sammelt ALLE Manifest-Skripte (core.scripts)");
        check(/manifestText/.test(code), "Stempel: der Manifest-Text reist in den Hash (manifestText)");
    }
    const req = PK.methodSource(anazh, "_foundryRequest", ["_foundryWorkerRequest("]);
    check(!!req, "_foundryRequest im Stamm gefunden");
    if (req) {
        const code = PK.stripComments(req);
        check(/__anazhLiveBake/.test(code), "Ship-Hook: __anazhLiveBake lebt im Request-Pfad (CODE, nicht Kommentar)");
        check(/__anazhLiveBake\s*===\s*false/.test(code), "Ship-Hook: striktes === false (kein truthy-Raten)");
        const iGet = code.indexOf("_foundryIdbGet");
        const iHook = code.indexOf("__anazhLiveBake");
        const iWorker = code.indexOf("_foundryWorkerRequest");
        check(iGet >= 0 && iHook > iGet, "Ordnung: Disk-first VOR dem Hook");
        check(iWorker > iHook, "Ordnung: der Hook VOR dem Worker-Fallback (überspringt ihn)");
    }
    if (fails) {
        console.error(`\n❌ ROT — ${fails} statische Prüfung(en) verletzt (Browser-Teil übersprungen).`);
        process.exit(1);
    }

    // (d) DER ROUNDTRIP-BEWEIS + der Hook VERHALTENS-bewiesen (ein Preset, lod 2 — klein).
    const manifest = PK.readManifest(PK.ROOT);
    const realm = await PK.bootRealm(PORT);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pack-gate-"));
    try {
        const rd = await PK.waitFoundryReady(realm.page, 90000);
        check(rd.ready && rd.recipeCount > 0, `Foundry ready (${rd.readyMs} ms) + Rezepte (${rd.recipeCount})`);
        if (!rd.ready) throw new Error("Foundry nicht bereit");
        await PK.installPackSerializer(realm.page);
        // Hook-Verhalten: false → null TROTZ ready-Worker (der Fallback ist übersprungen).
        const hooked = await realm.page.evaluate(async () => {
            window.__anazhLiveBake = false;
            const m = await window.anazhRealm._foundryRequest("eiche", 5, 2, "summer");
            delete window.__anazhLiveBake; // Default wiederherstellen (die Gate-Hook-Lehre: sichern/restoren)
            return m === null;
        });
        check(hooked, "Verhalten: __anazhLiveBake=false → _foundryRequest null trotz ready-Worker");
        // Default-Pfad: Hook weg → der Worker liefert (byte-Wahrheit für den Roundtrip).
        const ser = await realm.page.evaluate(() => window.__packSer("eiche", 7, 2, "summer"));
        check(
            !!(ser && ser.meshes && ser.meshes.length),
            `Live-Reply eiche|7|2|summer: ${ser ? ser.meshes.length : 0} Meshes`
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
        if (realm.pageErrors.length) console.log("  Seiten-Fehler:", realm.pageErrors.slice(0, 3));
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
        await realm.close();
    }

    if (fails) {
        console.error(`\n❌ ROT — ${fails} Prüfung(en) verletzt (Pack-Kanon N3 nicht bestätigt).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — Vertrag dokumentiert · Stempel-Drift-Wand steht · Ship-Hook lebt · Roundtrip byte-gleich."
    );
    process.exit(0);
}

if (process.argv.includes("--selftest")) selftest();
else
    main().catch((e) => {
        console.error("Gate-Fehler:", (e && e.stack) || e);
        process.exit(2);
    });
