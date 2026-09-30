// mint-asset-packs.cjs — N3.3 (Pack-Kanon): die warme Foundry-Bibliothek als Pack-v1-Artefakte
// münzen (`artifacts/packs/<preset>-s<seed>-L<lod>-<season>.json` + `index.json`).
//
// EIN WERKZEUG, KEIN CI-GATE (der Mint ist eine bewusste Handlung; die Dauer-Linse ist
// `gate:pack-contract`). Es bootet AnazhRealm foundry-ON headless (Null-Renderer — die IDB ist
// dort bewusst AUS, also ist JEDER Reply ein echter Live-Worker-Bake), wartet die Bibliothek
// warm (`f._prefetching === false`), liest die `f.cache`-Schlüssel (das Inventar der Gestalt-
// Reise) und friert je Schlüssel den ROHEN Worker-Reply in der v1-Hülle ein (cv/key/meta/
// components + meshes mit base64-Puffern; Vertrag: spec/pack/v0/CONTRACT.md §v1).
//
// DER ROUNDTRIP IST BEWIESEN, NICHT BEHAUPTET: je Puffer wird der sha256 UNABHÄNGIG im Browser
// über die rohen Bytes gerechnet (vor der b64-Kodierung); nach dem Schreiben liest der Mint das
// Artefakt ZURÜCK, dekodiert und vergleicht sha256 + Byte-Länge — eine Divergenz macht den
// Lauf rot (Exit 1). r128 lebt NUR im Mint-Worker (Ü1/Ü2 übersetzt der Host-Chokepoint, N3.5).
//
// SAISON-DISZIPLIN (Asset-Vertrag v1: `season` ist STATEFUL): die Bibliothek ist ein-saisonal
// (state.season) → jeder Reply ist ordnungs-unabhängig deterministisch. Ein künftiger Multi-
// Saison-Mint muss die Zustands-Trajektorie in Saison-Blöcken fahren.
//
//   node scripts/mint-asset-packs.cjs                       # mintet die warme Bibliothek
//   node scripts/mint-asset-packs.cjs --limit 8             # nur die ersten N Schlüssel
//   node scripts/mint-asset-packs.cjs --preset eiche --seed 7 --lod 2 --season summer
//   node scripts/mint-asset-packs.cjs --verify              # bestehende Artefakte gegen
//                                                           # frische Live-Replies richten
// Exit-Codes: 0 = grün · 1 = Divergenz/stale/fehlend · 2 = Harness-Fehler.
"use strict";

const fs = require("fs");
const path = require("path");
const PK = require("./lib/pack-kanon.cjs");

const PORT = Number(process.env.PACK_PORT || 4561);
const OUT_DIR = path.resolve(PK.ROOT, "artifacts", "packs");

function parseArgs(argv) {
    const a = { verify: false, limit: 0, preset: null, seed: null, lod: null, season: null };
    for (let i = 2; i < argv.length; i++) {
        const v = argv[i];
        if (v === "--verify") a.verify = true;
        else if (v === "--limit") a.limit = Number(argv[++i]) || 0;
        else if (v === "--preset") a.preset = String(argv[++i]);
        else if (v === "--seed") a.seed = Number(argv[++i]);
        else if (v === "--lod") a.lod = Number(argv[++i]);
        else if (v === "--season") a.season = String(argv[++i]);
    }
    return a;
}

function parseKey(key) {
    const p = String(key).split("|");
    if (p.length !== 4) return null;
    return { presetId: p[0], seed: Number(p[1]), lod: Number(p[2]), season: p[3] };
}

(async () => {
    const args = parseArgs(process.argv);
    const manifest = PK.readManifest(PK.ROOT);
    const stamp = PK.computeStamp(PK.ROOT);
    console.log("=== N3.3 — MINT-ASSET-PACKS (Pack-Kanon v1) ===");
    console.log(`  Stempel (Manifest+Skripte): ${stamp.slice(0, 16)}…`);

    // --verify: die bestehenden Artefakte lesen, BEVOR der Browser bootet (fail-fast).
    let verifyFiles = [];
    if (args.verify) {
        if (!fs.existsSync(OUT_DIR)) {
            console.error(`❌ --verify: kein ${path.relative(process.cwd(), OUT_DIR)} — erst minten.`);
            process.exit(1);
        }
        verifyFiles = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".json") && f !== "index.json");
        if (!verifyFiles.length) {
            console.error("❌ --verify: keine Pack-Artefakte gefunden.");
            process.exit(1);
        }
        const idxFile = path.join(OUT_DIR, "index.json");
        if (fs.existsSync(idxFile)) {
            const idx = JSON.parse(fs.readFileSync(idxFile, "utf8"));
            if (idx.stamp && idx.stamp !== stamp) {
                console.error("❌ --verify: Stempel-Mismatch — die Packs sind STALE (Generator-Quelle editiert).");
                console.error(`   Pack-Index: ${String(idx.stamp).slice(0, 16)}… · live: ${stamp.slice(0, 16)}…`);
                process.exit(1);
            }
        }
    }

    const realm = await PK.bootRealm(PORT);
    try {
        const rd = await PK.waitFoundryReady(realm.page, 90000);
        if (!rd.ready || !(rd.recipeCount > 0)) {
            console.error(`❌ Foundry nicht bereit (ready=${rd.ready}, recipes=${rd.recipeCount}).`);
            process.exit(2);
        }
        console.log(`  Worker ready nach ${rd.readyMs} ms · ${rd.recipeCount} Rezepte`);
        await PK.installPackSerializer(realm.page);
        // Das Rezeptbuch für meta.kind/coreId (reine Daten, einmal gezogen).
        const book = await realm.page.evaluate(() => {
            const f = window.anazhRealm._foundry;
            const out = {};
            for (const id in f.recipes || {}) out[id] = { kind: f.recipes[id].kind, panel: f.recipes[id].panel };
            return out;
        });

        // Die Fall-Liste: --verify aus den Artefakten · expliziter Fall · sonst die warme Bibliothek.
        let cases = [];
        if (args.verify) {
            cases = verifyFiles.map((f) => {
                const pack = PK.readPack(path.join(OUT_DIR, f));
                return { presetId: pack.presetId, seed: pack.seed, lod: pack.lod, season: pack.season, file: f };
            });
        } else if (args.preset) {
            cases = [
                {
                    presetId: args.preset,
                    seed: Number.isFinite(args.seed) ? args.seed : 7,
                    lod: Number.isFinite(args.lod) ? args.lod : 2,
                    season: args.season || "summer",
                },
            ];
        } else {
            const lib = await PK.waitLibraryWarm(realm.page, 180000);
            if (!lib.warm) {
                console.error("❌ Bibliothek wurde nicht warm (Prefetch hängt) — kein Inventar zu minten.");
                process.exit(2);
            }
            cases = lib.keys.map(parseKey).filter(Boolean);
            console.log(`  Bibliothek warm: ${cases.length} Cache-Schlüssel`);
        }
        if (args.limit > 0) cases = cases.slice(0, args.limit);

        const index = { cv: 1, stamp, minted: new Date().toISOString(), files: {} };
        let packs = 0;
        let buffers = 0;
        let bytes = 0;
        let skipped = 0;
        const diffs = [];
        for (const c of cases) {
            const ser = await realm.page.evaluate(
                (p, s, l, se) => window.__packSer(p, s, l, se),
                c.presetId,
                c.seed,
                c.lod,
                c.season
            );
            if (!ser) {
                if (args.verify)
                    diffs.push(`${c.presetId}|${c.seed}|${c.lod}|${c.season}: Live-Reply null (Artefakt verwaist?)`);
                else {
                    skipped++;
                    console.log(`  ~ übersprungen (Reply null): ${c.presetId}|${c.seed}|${c.lod}|${c.season}`);
                }
                continue;
            }
            const rec = book[c.presetId] || null;
            const meta = { kind: rec ? rec.kind : undefined, coreId: PK.coreIdFor(rec, manifest) };
            if (args.verify) {
                // Bestehendes Artefakt gegen den frischen Live-Reply richten (byte-genau).
                const pack = PK.readPack(path.join(OUT_DIR, c.file));
                const d = PK.comparePackToReply(pack, ser);
                if (d.length) diffs.push(...d);
                else packs++;
                continue;
            }
            // MINT: Hülle bauen → schreiben → ZURÜCKLESEN → byte-genau gegen den Live-Reply.
            const pack = PK.packFromReply(ser, meta);
            const file = PK.writePack(OUT_DIR, pack);
            const back = PK.readPack(file);
            const d = PK.comparePackToReply(back, ser);
            if (d.length) {
                diffs.push(...d);
                continue;
            }
            packs++;
            index.files[path.basename(file)] = PK.sha256Hex(fs.readFileSync(file));
            for (const m of ser.meshes) {
                for (const k of Object.keys(m.attrs)) {
                    buffers++;
                    bytes += m.attrs[k].bytes;
                }
                if (m.index) {
                    buffers++;
                    bytes += m.index.bytes;
                }
            }
        }
        if (!args.verify && packs > 0) {
            fs.writeFileSync(path.join(OUT_DIR, "index.json"), JSON.stringify(index, null, 2) + "\n");
        }

        console.log(
            args.verify
                ? `  Verifiziert: ${packs}/${cases.length} Artefakte byte-gleich zum Live-Reply`
                : `  Gemintet: ${packs} Packs · ${buffers} Puffer · ${(bytes / 1048576).toFixed(1)} MB roh` +
                      (skipped ? ` · ${skipped} übersprungen` : "")
        );
        if (diffs.length) {
            console.error(`\n❌ ROT — ${diffs.length} Divergenz(en):`);
            for (const d of diffs.slice(0, 12)) console.error("  • " + d);
            process.exit(1);
        }
        if (!packs) {
            console.error("\n❌ ROT — 0 Packs gemintet/verifiziert.");
            process.exit(1);
        }
        console.log(
            args.verify
                ? "\n✅ GRÜN — alle Pack-Artefakte byte-gleich zum Live-Reply (Roundtrip hält)."
                : `\n✅ GRÜN — ${packs} Packs gemintet, jeder zurückgelesen + byte-gleich zum Live-Reply bewiesen → ${path.relative(process.cwd(), OUT_DIR)}`
        );
        process.exit(0);
    } finally {
        await realm.close();
    }
})().catch((e) => {
    console.error("Mint-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
