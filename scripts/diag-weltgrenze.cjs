#!/usr/bin/env node
// gate:weltgrenze — KEIN WELT-ZUSTAND REIST ÜBER EINE WELTGRENZE.
//
// Die Gegenprüfung Runde 2 (10.10.) fand den Spread `{ ...this.state.worldMeta, ...state.worldMeta }` im Restore: jede
// Welt, die ohne Erbgut geladen wurde, behielt das Erbgut, den Anker, die Edits, die Dorf-Zellen und die Stempel der
// Welt davor — über das Welt-Tor „Ersetzen" wurde eine Wildnis-Welt still als Insel gezeichnet und mit dem Erbgut der
// Prüfbühne gespeichert. Diese Linse fährt JEDEN Weg, auf dem eine Welt B die Seite oder den Speicher einer Welt A
// betritt, und nennt jedes Feld von A, das B danach trägt, beim Namen:
//
//   laden     `loadState(B)` in der lebenden Seite (der Engpass jedes Ladens: Boot, „lade zustand", Datei, Tor, Mitspieler)
//   ersetzen  das Welt-Tor „Ersetzen" (`_weltTorImportReplace`)
//   weltpull  der Snapshot des Hosts (`_p2pApplyWorldSnapshot`, Beitritt und Mesh-Resync world-pull)
//   portal    die Einladung / das Adress-Portal (`_importGuestWorld`, danach der Reload des Rufers)
//   geburt    „Neue Welt" (`createNewWorld`) — erlaubt ist nur die Positiv-Liste der Geburt (visibility, creator)
//   reload    B liegt im Speicher, die Seite lädt neu (Boot: Vorlade + Restore)
//
// Welt A ist die frisch gebootete Standard-Welt, in die die Linse ein Zeichen pflanzt: das Erbgut der Prüfbühne
// (spec/pruefbuehne/welt.json), einen Makro-Anker, ein Edit, Dorf-Zellen, die Stempel von Ring, Vorschau und Saat, Rolle,
// Bann-Liste, Adresse, Region, Rechte, Modus, Sichtbarkeit, ein Feld, das dieser Build nicht kennt, die Gedächtnisse der
// Seite (Anker, Ring, Vorschau, Dorf-Zug) und ein Tier. Welt B ist eine Wildnis-Welt ohne all das. Geprüft werden nach
// jedem Weg: das worldMeta der lebenden Seite, die Leser (`_erbgut`, `_macroAnker`, der Worker-Spiegel), die Gedächtnisse,
// der Snapshot der Seite und der Speicher-Eintrag von B. Ein Weg, der neu lädt, wird nach dem Reload geprüft; ein Weg,
// der in der Seite bleibt, bekommt den nächsten Schritt des Spiels (Autosave, Reload) — was dann im Speicher steht, ist B.
//
//   node scripts/diag-weltgrenze.cjs [--json datei] [--wurzel dir] [--wege laden,ersetzen,...]
//                                      (`--wurzel` = der Baum eines anderen Stands: vorher ↔ nachher)
//   node scripts/diag-weltgrenze.cjs --selftest   zusätzlich: der alte Spread am Lade-Engpass zum Schein — der Weg
//                                      „laden" MUSS rot werden, beim Namen
// Port: WELTGRENZE_PORT (Default 4401). Exit 1 bei einem Feld von A in B, einem Page-Error oder einem blinden Selbsttest.
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const SELBSTTEST = argv.includes("--selftest");
const JSON_AUS = opt("--json", null);
const PORT = Number(process.env.WELTGRENZE_PORT) || 4401;
const root = path.resolve(opt("--wurzel", path.resolve(__dirname, "..")));
const ALLE_WEGE = ["laden", "ersetzen", "weltpull", "portal", "geburt", "reload"];
const WEGE = opt("--wege", ALLE_WEGE.join(","))
    .split(",")
    .filter((w) => ALLE_WEGE.includes(w));
const BUEHNE = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "spec", "pruefbuehne", "welt.json"), "utf8"));

const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
    ".svg": "image/svg+xml",
};
const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.setHeader("Cache-Control", "no-store");
        res.end(data);
    });
});

// Die Prüfer in der Seite (überleben jeden Reload: evaluateOnNewDocument).
function seitenPruefer() {
    const T = "GRENZE-A";
    // Die Werte von A ohne Platz für das Zeichen (Aufzählungen): A trägt je einen, den B nie von selbst trägt.
    const A_STUFEN = {
        role: "host",
        regionsActive: true,
        guestRights: "mitschöpfer",
        gameMode: "pfad",
        visibility: "gelistet",
    };
    // Was B ohne eigenen Wert trägt: die Vorlage der Seite (Konstruktor) — die Wege setzen ihre Rolle selbst.
    const VORLAGE = {
        role: "solo",
        regionsActive: false,
        guestRights: "frieden",
        gameMode: "frieden",
        visibility: "privat",
    };
    // Die Pfade, an denen das Zeichen von A steht (Schlüssel oder Wert), gekürzt auf die Ebene des Feldes.
    const pfade = (obj, wurzel, tiefe = 2) => {
        const out = new Set();
        const kurz = (p) =>
            p
                .split(/(?=[.[])/)
                .slice(0, tiefe)
                .join("");
        const geh = (v, p, t) => {
            if (t > 14 || out.size > 60) return;
            if (typeof v === "string") {
                if (v.includes(T)) out.add(kurz(p));
            } else if (Array.isArray(v)) {
                v.forEach((x, i) => geh(x, `${p}[${i}]`, t + 1));
            } else if (v instanceof Set || v instanceof Map) {
                geh(Array.from(v.keys()), p, t + 1);
            } else if (v && typeof v === "object") {
                for (const k of Object.keys(v)) {
                    if (k.includes(T)) out.add(kurz(`${p}.${k}`));
                    geh(v[k], `${p}.${k}`, t + 1);
                }
            }
        };
        geh(obj, wurzel, 0);
        return Array.from(out);
    };
    window.__grenze = {
        T,
        // Welt B: eine Wildnis-Welt ohne Erbgut, Anker, Edits, Dörfer und Stempel — geboren wie jede neue Welt, gebaut,
        // BEVOR A ihr Zeichen trägt.
        bauB(slug) {
            const r = window.anazhRealm;
            const b = r._buildEmptyWorldSnapshot(r._generateFreshWorldMeta(slug), false);
            return JSON.parse(JSON.stringify(b));
        },
        // Welt A trägt ihr Zeichen: jedes welt-eigene Feld, die Gedächtnisse der Seite und ein Tier.
        pflanzeA(buehneErbgut) {
            const r = window.anazhRealm;
            const wm = r.state.worldMeta;
            const anker = Object.assign(r._makeMacroAnker("grenze-a-anker"), { herkunft: T });
            Object.assign(wm, A_STUFEN, {
                erbgut: Object.assign({ herkunft: T }, buehneErbgut),
                macro: anker,
                voxelEdits: [{ x: 12345, y: 10, z: 12345, r: 2, strength: 48, mode: "carve", herkunft: T }],
                settlementCells: { [T]: { seed: 7, nH: 3, x: 12345, z: 12345 }, start: { herkunft: T } },
                genesisPortalRing: T,
                portalPreviewFachwerk: T,
                portalPreviewGarage: T,
                saat: [{ dsl: T }],
                saatGesaet: T,
                bauSame: { [T]: 3 },
                parentWorlds: [T],
                hostInfo: { url: T, roomId: T, peerId: T },
                banList: { peerIds: [T], vibePassKeys: [] },
                worldAddress: { label: T },
                currentRegionKey: T,
                creator: T,
                fusionStrategy: T,
                grenzeFremd: T,
            });
            r._erbgutCache = null;
            r._macroAnkerCache = anker;
            r._genesisRingFertig = true;
            r._portalPreviewFertig = Object.assign(Object.create(null), { fachwerk: true });
            r._autoSettlementRejected = new Set([T]);
            r._autoSettlementStartHopeless = true;
            r._autoSettlementQueue = { plan: { slots: [], name: T }, origin: { x: 0, z: 0 }, idx: 0, cellKey: T };
            r._stlWegeKeys = new Set([T]);
            const pm = r.state.playerMesh;
            const x = pm ? pm.position.x + 6 : 6;
            const z = pm ? pm.position.z + 6 : 6;
            const tier = r.spawnCreatureAt(x, r.getTerrainHeightAt(x, z) + 1, z, "happy", null, { precise: true });
            if (tier && tier.userData) tier.userData.name = T;
            return { erbgut: r._erbgut().terme.map((t) => t.art), tier: !!tier };
        },
        // Die lebende Seite in Welt B: jedes Feld von A beim Namen. `ganz` = auch der volle Snapshot der Seite (nach einem
        // Reload; in der Seite trägt das Leben der alten Welt nur der Reload fort, die Türen laden neu).
        befundeLive(erlaubt, ganz) {
            const r = window.anazhRealm;
            const ok = new Set(erlaubt || []);
            const out = [];
            const wm = r.state.worldMeta || {};
            for (const p of pfade(wm, "worldMeta")) if (!ok.has(p)) out.push(p);
            for (const k of Object.keys(A_STUFEN)) {
                const pfad = `worldMeta.${k}`;
                if (ok.has(pfad) || wm[k] !== A_STUFEN[k]) continue;
                out.push(`${pfad} (= ${JSON.stringify(A_STUFEN[k])} von A)`);
            }
            const e = r._erbgut();
            if (!(e.terme.length === 1 && e.terme[0].art === "wildnis"))
                out.push(`Leser _erbgut() [${e.terme.map((t) => t.art).join(", ")}]`);
            for (const p of pfade(r._macroAnker(), "Leser _macroAnker()", 1)) out.push(p);
            const ws = r._voxelWorkerSnapshotState();
            for (const p of pfade(ws, "Worker-Spiegel")) out.push(p);
            if (!(ws.erbgut && ws.erbgut.wildnis === 1)) out.push("Worker-Spiegel.erbgut (keine Wildnis)");
            const ged = {
                _macroAnkerCache: pfade(r._macroAnkerCache, "x").length > 0,
                _genesisRingFertig: r._genesisRingFertig === true,
                _portalPreviewFertig: !!(r._portalPreviewFertig && r._portalPreviewFertig.fachwerk),
                _autoSettlementRejected: !!(r._autoSettlementRejected && r._autoSettlementRejected.has(T)),
                _autoSettlementStartHopeless: r._autoSettlementStartHopeless === true,
                _autoSettlementQueue: !!(r._autoSettlementQueue && r._autoSettlementQueue.cellKey === T),
                _stlWegeKeys: !!(r._stlWegeKeys && r._stlWegeKeys.has(T)),
            };
            for (const k of Object.keys(ged)) if (ged[k]) out.push(`Gedächtnis this.${k}`);
            if (ganz) {
                const snap = r.buildStateSnapshot();
                for (const p of pfade(snap, "Snapshot", 3)) if (!ok.has(p.replace(/^Snapshot\./, ""))) out.push(p);
            }
            return Array.from(new Set(out));
        },
        // Der Speicher-Eintrag von B (die Wahrheit des nächsten Boots).
        befundeSpeicher(weltId, erlaubt) {
            const r = window.anazhRealm;
            const ok = new Set(erlaubt || []);
            const roh = localStorage.getItem(r.worldStorageKey(weltId));
            if (!roh) return [`Speicher: kein Eintrag für ${weltId}`];
            const s = JSON.parse(roh);
            const out = pfade(s, "Speicher", 3).filter((p) => !ok.has(p.replace(/^Speicher\./, "")));
            const wm = s.worldMeta || {};
            for (const k of Object.keys(A_STUFEN)) {
                const pfad = `worldMeta.${k}`;
                if (ok.has(pfad) || wm[k] !== A_STUFEN[k]) continue;
                out.push(`Speicher.${pfad} (= ${JSON.stringify(A_STUFEN[k])} von A)`);
            }
            if (wm.erbgut != null) out.push("Speicher.worldMeta.erbgut");
            return out;
        },
        VORLAGE,
    };
}

async function bereit(page, weltId) {
    return page.evaluate(async (weltId) => {
        const t0 = performance.now();
        while (performance.now() - t0 < 120000) {
            const r = window.anazhRealm;
            if (
                r &&
                typeof r._gameLoopTick === "function" &&
                r.state &&
                r.state.worldMeta &&
                (!weltId || r.state.worldMeta.worldId === weltId)
            )
                return { ok: true, ms: Math.round(performance.now() - t0), welt: r.state.worldMeta.worldId };
            await new Promise((res) => setTimeout(res, 50));
        }
        const r = window.anazhRealm;
        return { ok: false, welt: r && r.state && r.state.worldMeta ? r.state.worldMeta.worldId : null };
    }, weltId || null);
}

// Ein Weg in einem frischen Browser-Kontext (eigener Speicher): A booten, B bauen, A zeichnen, den Weg gehen, B prüfen.
async function fahreWeg(browser, weg, schein) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    const rep = { weg, schein, befunde: [], erlaubt: [], boot: [], navigiert: null };
    let pageErr = null;
    page.on("pageerror", (err) => {
        pageErr = (err.stack || err.message).split("\n")[0];
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.evaluateOnNewDocument(seitenPruefer);
    const t0 = Date.now();
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        const a = await bereit(page, null);
        rep.boot.push(a.ms);
        if (!a.ok) throw new Error("Welt A nicht bereit nach 120 s");
        const B = await page.evaluate(() => window.__grenze.bauB("grenze-b"));
        const bId = B.worldMeta.worldId;
        rep.pflanzung = await page.evaluate((e) => window.__grenze.pflanzeA(e), BUEHNE.worldMeta.erbgut);
        if (schein) {
            // DER ALTE SPREAD ZUM SCHEIN: nach jedem Laden mischt sich das worldMeta der alten Welt darunter.
            await page.evaluate(() => {
                const r = window.anazhRealm;
                const roh = r.loadState.bind(r);
                r.loadState = (s) => {
                    const alt = r.state.worldMeta;
                    const e = roh(s);
                    r.state.worldMeta = { ...alt, ...r.state.worldMeta };
                    r._erbgutCache = null;
                    return e;
                };
            });
        }
        // Der Weg. Lädt er neu, prüft die Linse nach dem Reload; bleibt er in der Seite, folgt der nächste Schritt des
        // Spiels (der Autosave, dann der Reload).
        const tuer = weg === "ersetzen" || weg === "weltpull" || weg === "geburt";
        const nav = tuer
            ? page
                  .waitForNavigation({ waitUntil: "domcontentloaded", timeout: 4000 })
                  .then(() => true)
                  .catch(() => false)
            : Promise.resolve(false);
        let ziel = bId;
        let erlaubt = [];
        const lauf = await page
            .evaluate(
                (weg, B) => {
                    const r = window.anazhRealm;
                    if (weg === "laden") {
                        r.loadState(B);
                        return { inSeite: window.__grenze.befundeLive([], false) };
                    }
                    if (weg === "ersetzen") {
                        r.state.pendingImport = { parsed: B, fileName: "grenze-b.json" };
                        r._weltTorImportReplace();
                        return {};
                    }
                    if (weg === "weltpull") {
                        r.state.p2p.pendingWorldSnapshot = true;
                        r._p2pApplyWorldSnapshot("grenze-host", B, { reload: true });
                        return {};
                    }
                    if (weg === "portal") {
                        const id = r._importGuestWorld(
                            B,
                            { url: "ws://127.0.0.1:9", roomId: B.worldMeta.worldId, peerId: "grenze-host" },
                            null
                        );
                        try {
                            localStorage.setItem("anazh.p2p.enabled", "false");
                        } catch (_e) {
                            /* die Linse wählt keinen Host an */
                        }
                        return { id };
                    }
                    if (weg === "geburt") {
                        const id = r.createNewWorld({ slug: "grenze-geburt", reload: true });
                        return { id };
                    }
                    if (weg === "reload") {
                        localStorage.setItem(r.worldStorageKey(B.worldMeta.worldId), JSON.stringify(B));
                        r.worldsIndexUpsert({
                            worldId: B.worldMeta.worldId,
                            slug: B.worldMeta.slug,
                            bornAt: B.worldMeta.bornAt,
                            lastPlayed: Date.now(),
                        });
                        r.activeWorldSet(B.worldMeta.worldId);
                        return {};
                    }
                    return {};
                },
                weg,
                B
            )
            .catch((e) => ({ abbruch: String(e && e.message ? e.message : e) }));
        rep.navigiert = await nav;
        if (lauf && lauf.inSeite) for (const f of lauf.inSeite) rep.befunde.push(`in der Seite: ${f}`);
        if (weg === "geburt" && lauf && lauf.id) {
            ziel = lauf.id;
            // DIE POSITIV-LISTE DER GEBURT: die Wahl des Schöpfers reist in die neue Welt (Sichtbarkeit, Schöpfer).
            erlaubt = ["worldMeta.visibility", "worldMeta.creator"];
        }
        if (weg === "portal" && lauf && lauf.id) ziel = lauf.id;
        rep.erlaubt = erlaubt;
        if (weg === "laden") {
            // der Engpass in der Seite: geprüft ist, was er hinterlässt (die Seite selbst wechselt die Welt nur über den
            // Reload — die Türen laden neu, die übrigen Wege prüfen das)
            if (pageErr) rep.befunde.push(`PAGE-ERROR: ${pageErr}`);
            rep.befunde = Array.from(new Set(rep.befunde));
            rep.ms = Date.now() - t0;
            await ctx.close();
            return rep;
        }
        if (weg === "portal" || weg === "reload") {
            // der Rufer lädt neu (die Einladung, der Boot): kein Autosave dazwischen
            await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
        } else if (!rep.navigiert) {
            // in der Seite geblieben: der nächste Schritt des Spiels — der Autosave schreibt, was die Seite trägt
            await page.evaluate(() => window.anazhRealm.saveState()).catch(() => {});
            rep.befunde.push(
                ...(await page.evaluate((id, ok) => window.__grenze.befundeSpeicher(id, ok), ziel, erlaubt)).map(
                    (f) => `nach dem Autosave: ${f}`
                )
            );
            await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
        }
        // (lud die Tür neu, ist ihr Speicher-Eintrag die Welt)
        const b = await bereit(page, ziel);
        rep.boot.push(b.ms);
        if (!b.ok) throw new Error(`Welt B (${ziel}) nicht bereit nach 120 s (aktiv: ${b.welt})`);
        rep.befunde.push(
            ...(await page.evaluate((id, ok) => window.__grenze.befundeSpeicher(id, ok), ziel, erlaubt)).map(
                (f) => `nach dem Reload: ${f}`
            )
        );
        rep.befunde.push(
            ...(await page.evaluate((ok) => window.__grenze.befundeLive(ok, true), erlaubt)).map(
                (f) => `nach dem Reload: ${f}`
            )
        );
    } catch (e) {
        rep.befunde.push(`ABBRUCH: ${e && e.message ? e.message : e}`);
    }
    if (pageErr) rep.befunde.push(`PAGE-ERROR: ${pageErr}`);
    rep.ms = Date.now() - t0;
    rep.befunde = Array.from(new Set(rep.befunde));
    await ctx.close();
    return rep;
}

(async () => {
    const tStart = Date.now();
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    console.log("\n========= DIE WELTGRENZE — kein Feld von A reist nach B =========");
    console.log(`  Baum: ${root}`);
    const berichte = [];
    let rot = false;
    for (const weg of WEGE) {
        const rep = await fahreWeg(browser, weg, false);
        berichte.push(rep);
        const gruen = rep.befunde.length === 0;
        if (!gruen) rot = true;
        console.log(
            `  ${gruen ? "✓" : "⛔"} ${weg.padEnd(9)} ${rep.navigiert ? "lud neu" : "blieb in der Seite"} · Boot ${rep.boot.join(" + ")} ms · ${(rep.ms / 1000).toFixed(1)} s${rep.erlaubt.length ? ` · Positiv-Liste ${rep.erlaubt.map((p) => p.split(".")[1]).join(", ")}` : ""} · ${gruen ? "0 Felder von A" : rep.befunde.length + " Befunde"}`
        );
        for (const f of rep.befunde) console.log(`      ⛔ ${f}`);
    }
    let selbst = null;
    if (SELBSTTEST) {
        const rep = await fahreWeg(browser, "laden", true);
        const namen = rep.befunde.filter((f) => f.startsWith("in der Seite: worldMeta."));
        selbst = { benannt: namen, befunde: rep.befunde };
        console.log(
            `\n  SELBSTTEST (der alte Spread am Lade-Engpass zum Schein): ${namen.length} Felder von A beim Namen — ${namen
                .map((f) => f.replace("in der Seite: ", ""))
                .slice(0, 8)
                .join(", ")}${namen.length > 8 ? " …" : ""}`
        );
    }
    if (JSON_AUS) fs.writeFileSync(JSON_AUS, JSON.stringify({ root, berichte, selbst }, null, 1));
    let pass;
    if (SELBSTTEST) {
        pass = !rot && selbst && selbst.benannt.length > 0;
        console.log(
            `\n${pass ? "✅" : "⛔"} SELBSTTEST ${pass ? "GRÜN: auf keinem Weg trägt B ein Feld von A — und der alte Spread fällt rot beim Namen" : "ROT: " + (rot ? "der saubere Lauf ist schon rot" : "der Schein blieb unentdeckt (die Linse ist blind)")}`
        );
    } else {
        pass = !rot;
        console.log(
            `\n${pass ? "✅" : "⛔"} ${pass ? `Auf ${WEGE.length} von ${WEGE.length} Wegen trägt B 0 Felder von A` : "EIN WELT-ZUSTAND REIST ÜBER DIE WELTGRENZE"}`
        );
    }
    console.log(`  Laufzeit ${((Date.now() - tStart) / 1000).toFixed(1)} s\n`);
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
})().catch((e) => {
    console.error("⛔", e && e.stack ? e.stack : e);
    process.exit(1);
});
