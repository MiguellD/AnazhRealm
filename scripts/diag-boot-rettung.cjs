#!/usr/bin/env node
// gate:boot-rettung — DER BOOT VERLIERT DIE WELT DES AKTIV-ZEIGERS NIE.
//
// Die Gegenprüfung Runde 4 fand zwei Formen, in denen der Boot eine rettbare Welt durch eine frische ersetzte: ein
// korrupter Platz mit gültigem `.bak` (die Vorlade fing den Parse-Fehler, ensureWorldMeta vergab eine neue Id samt
// Aktiv-Zeiger, die `.bak`-Rettung in loadState kam nie dran) und eine Welt, die nur in IndexedDB lag (der IDB-Vorlauf lief
// erst nach ensureWorldMeta). Die Rettungs-Kette ist EINE und läuft, BEVOR eine neue Id
// vergeben wird; eine neue Welt erwacht nur, wenn alle drei leer sind — und dann laut. Diese Linse fährt die acht Formen
// der Boot-Sonde des Prüfers (C:\Users\micha\AppData\Local\Temp\claude\pruef4-pruefbuehne\boot-sonde.cjs) und eine neunte:
//
//   platz-ohne-id     der Platz der aktiven Welt trägt einen Save ohne worldId      → die Welt DIESES Platzes
//   platz-ohne-meta   … ohne worldMeta                                             → dito
//   legacy-ohne-id    der Single-Key vor Ring 8 (ohne worldId), kein Zeiger         → migriert, stabil über zwei Boots
//   legacy-ohne-meta  … ohne worldMeta                                             → dito
//   mehrere           zwei Welten, Zeiger auf w2, dann der Wechsel nach w1         → w2, dann w1; w2 bleibt auf ihrem Platz
//   korrupt-bak       Platz und IndexedDB korrupt, `.bak` gültig                   → die Welt aus dem `.bak`
//   nur-idb           kein Platz, die Welt nur in IndexedDB                        → die Welt aus IndexedDB
//   idb-frischer      Platz alt, IndexedDB nachweislich frischer                   → der frischere Stand
//   alles-leer        der Zeiger nennt eine Welt, die nirgends liegt               → eine frische Welt, LAUT (Chat)
//
// Je Form: Boot 1 auf der vorbereiteten Form (die Welt, ihre Marke, Zeiger = Welt, kein fremder Index-Eintrag), dann
// Boot 2 nach einem Save (die Form bleibt stabil). Ein Befund nennt die Form und was der Boot tat.
//
//   node scripts/diag-boot-rettung.cjs [--json datei] [--wurzel dir] [--formen a,b]
//   node scripts/diag-boot-rettung.cjs --selftest   zusätzlich: die Kette liest zum Schein nur den Platz — korrupt-bak,
//                                                    nur-idb und idb-frischer MÜSSEN rot werden, beim Namen
// Port: BOOT_RETTUNG_PORT (Default 4402). Exit 1 bei einem Befund, einem Page-Error oder einem blinden Selbsttest.
"use strict";
const { statikServer, starteBrowser, nullRenderer, hauptLauf, sleep, argOpt: opt, path, fs } = require("./lib/welt-boot.cjs");

const argv = process.argv.slice(2);
const SELBSTTEST = argv.includes("--selftest");
const JSON_AUS = opt("--json", null);
const PORT = Number(process.env.BOOT_RETTUNG_PORT) || 4402;
const root = path.resolve(opt("--wurzel", path.resolve(__dirname, "..")));
const ALLE = [
    "platz-ohne-id",
    "platz-ohne-meta",
    "legacy-ohne-id",
    "legacy-ohne-meta",
    "mehrere",
    "korrupt-bak",
    "nur-idb",
    "idb-frischer",
    "alles-leer",
];
const FORMEN = opt("--formen", ALLE.join(","))
    .split(",")
    .filter((f) => ALLE.includes(f));

// die leere Seite desselben Ursprungs (`/__leer`): hier legt die Linse die Speicher-Form, ohne eine Welt zu booten
const server = statikServer({
    root,
    keinCache: true,
    seiten: { "/__leer": '<!doctype html><meta charset="utf-8"><title>leer</title>' },
});

// Der Schein des Selbsttests: die Rettungs-Kette liest nur den Platz (das Verhalten vor dem Schnitt, an Korrupt und IDB).
function scheinNurPlatz() {
    let inst = null;
    Object.defineProperty(window, "anazhRealm", {
        configurable: true,
        get() {
            return inst;
        },
        set(v) {
            inst = v;
            if (typeof v._weltRettungsKette !== "function") return;
            const roh = v._weltRettungsKette.bind(v);
            v._weltRettungsKette = (id) => {
                const f = roh(id, null);
                return f.quelle === "Platz" ? f : { state: null, quelle: null, befund: ["Schein: nur der Platz"] };
            };
        },
    });
}

// Die Seite ist erwacht (init durchlaufen): ihre Welt, der Zeiger, die Marken, der Index, die letzten Chat-Zeilen.
async function bereit(page) {
    return page.evaluate(async () => {
        const t0 = performance.now();
        {
            await window.__weltDa((w) => w.state && w.state.worldMeta);
            {
                const snap = JSON.stringify(r.buildStateSnapshot());
                const chat = document.getElementById("chat-output");
                return {
                    ok: true,
                    ms: Math.round(performance.now() - t0),
                    welt: r.state.worldMeta.worldId,
                    zeiger: r.activeWorldGet(),
                    marken: (snap.match(/MARK-[A-Z0-9]+/g) || []).filter((x, i, a) => a.indexOf(x) === i),
                    index: r.worldsIndexLoad().map((e) => e.worldId),
                    chat: chat ? chat.textContent.slice(-600) : "",
                };
            }
        }
    });
}

async function fahreForm(browser, form, schein) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    const rep = { form, schein: !!schein, befunde: [], boots: [] };
    page.on("dialog", (d) => d.accept().catch(() => {}));
    await nullRenderer(page);
    if (schein) await page.evaluateOnNewDocument(scheinNurPlatz);
    const t0 = Date.now();
    const befund = (s) => rep.befunde.push(s);
    try {
        // Die Form wird auf einer leeren Seite desselben Ursprungs gelegt (localStorage + IndexedDB des Spiels), ohne eine
        // Welt zu booten: ein Save mit seiner Marke im Wissen, vor dem Erst-Spawn (playerPosition null).
        await server.zeige(page, 60000, "__leer");
        const v = await page.evaluate(async (form) => {
            const mit = (marke, id, art) => {
                const s = {
                    playerPosition: null,
                    knowledgeBase: [marke],
                    creatures: [],
                    weather: "sunny",
                    worldMeta: {
                        slug: "boot-probe",
                        seed: "anazh-realm-seed",
                        genVersion: 9,
                        voxelTerrain: true,
                        schemaVersion: "10.5-chunk-delta-v1",
                    },
                };
                if (id) s.worldMeta.worldId = id;
                if (art === "ohne-meta") delete s.worldMeta;
                return s;
            };
            // die IndexedDB des Spiels (dieselbe Datenbank „anazhRealm", Store „worlds", {at, json} je worldId)
            const idbPut = (id, s, roh) =>
                new Promise((res) => {
                    const req = indexedDB.open("anazhRealm", 1);
                    req.onupgradeneeded = () => req.result.createObjectStore("worlds");
                    req.onerror = () => res(false);
                    req.onsuccess = () => {
                        const db = req.result;
                        const tx = db.transaction("worlds", "readwrite");
                        tx.objectStore("worlds").put({ at: Date.now(), json: roh || JSON.stringify(s) }, id);
                        tx.oncomplete = () => {
                            db.close();
                            res(true);
                        };
                        tx.onerror = () => res(false);
                    };
                });
            const idx = (ids) =>
                localStorage.setItem(
                    "anazhRealmWorlds",
                    JSON.stringify(
                        ids.map((id, i) => ({
                            worldId: id,
                            slug: "s" + i,
                            bornAt: Date.now() - 5000,
                            lastPlayed: Date.now() - 5000 + i,
                        }))
                    )
                );
            const platz = (id, s) => localStorage.setItem("anazhRealmState_" + id, JSON.stringify(s));
            const zeiger = (id) => localStorage.setItem("anazhRealmActiveWorld", id);
            if (form === "platz-ohne-id" || form === "platz-ohne-meta") {
                platz("platz-p1", mit("MARK-P1", null, form.slice(6)));
                idx(["platz-p1"]);
                zeiger("platz-p1");
                return { welt: "platz-p1", marke: "MARK-P1", index: ["platz-p1"] };
            }
            if (form === "legacy-ohne-id" || form === "legacy-ohne-meta") {
                localStorage.setItem("anazhRealmState", JSON.stringify(mit("MARK-L1", null, form.slice(7))));
                return { welt: null, marke: "MARK-L1", index: null };
            }
            if (form === "mehrere") {
                platz("welt-w1", mit("MARK-W1", "welt-w1"));
                platz("welt-w2", mit("MARK-W2", "welt-w2"));
                idx(["welt-w1", "welt-w2"]);
                zeiger("welt-w2");
                return { welt: "welt-w2", marke: "MARK-W2", index: ["welt-w1", "welt-w2"] };
            }
            if (form === "korrupt-bak") {
                localStorage.setItem("anazhRealmState_welt-k1", '{"kaputt": ');
                await idbPut("welt-k1", null, '{"kaputt": ');
                await idbPut("welt-k1.bak", mit("MARK-K1", "welt-k1"));
                idx(["welt-k1"]);
                zeiger("welt-k1");
                return { welt: "welt-k1", marke: "MARK-K1", index: ["welt-k1"] };
            }
            if (form === "nur-idb") {
                const ok = await idbPut("welt-i1", mit("MARK-I1", "welt-i1"));
                idx(["welt-i1"]);
                zeiger("welt-i1");
                return { welt: "welt-i1", marke: "MARK-I1", index: ["welt-i1"], idbPut: ok };
            }
            if (form === "idb-frischer") {
                platz("welt-f1", mit("MARK-ALT", "welt-f1"));
                idx(["welt-f1"]);
                zeiger("welt-f1");
                const ok = await idbPut("welt-f1", mit("MARK-NEU", "welt-f1"));
                return { welt: "welt-f1", marke: "MARK-NEU", index: ["welt-f1"], idbPut: ok, alt: "MARK-ALT" };
            }
            if (form === "alles-leer") {
                idx(["welt-leer"]);
                zeiger("welt-leer");
                return { welt: "welt-leer", leer: true };
            }
            return {};
        }, form);
        rep.vorbereitung = v;
        await server.zeige(page, 60000);
        const b1 = await bereit(page);
        rep.boots.push(b1);
        if (!b1.ok) throw new Error("Boot 1 erwachte nicht in 120 s");
        if (v.leer) {
            // EINE NEUE WELT NUR, WENN ALLES LEER IST — UND DANN LAUT
            if (b1.welt === v.welt) befund(`Boot 1 erwachte unter der leeren Id ${v.welt}`);
            if (!b1.chat.includes(v.welt))
                befund("die frische Welt erwachte still (kein Satz im Chat, der die Welt nennt)");
        } else {
            const erwartet = v.welt || b1.zeiger;
            if (b1.welt !== erwartet) befund(`Boot 1 erwachte in ${b1.welt} statt in ${erwartet}`);
            if (b1.zeiger !== b1.welt) befund(`Boot 1: der Zeiger zeigt auf ${b1.zeiger}, die Seite trägt ${b1.welt}`);
            if (!b1.marken.includes(v.marke))
                befund(`Boot 1: die Marke ${v.marke} fehlt (Marken: ${b1.marken.join(",") || "keine"})`);
            if (v.alt && b1.marken.includes(v.alt)) befund(`Boot 1: der ältere Stand (${v.alt}) gewann`);
            if (v.index) {
                const fremd = b1.index.filter((id) => !v.index.includes(id));
                if (fremd.length) befund(`Boot 1 legte eine frische Welt an (${fremd.join(", ")})`);
            }
        }
        if (schein) {
            // der Schein: Boot 1 nennt den Befund
        } else if (form === "mehrere" && b1.ok) {
            // der Wechsel am Ort (`_weltWechsel`): die Welt-Warte (`bereit`) wartet auf sein Erwachen
            await page.evaluate(() => r.switchToWorld("welt-w1", { reload: true })).catch(() => {});
            const b2 = await bereit(page);
            rep.boots.push(b2);
            if (b2.welt !== "welt-w1" || !b2.marken.includes("MARK-W1"))
                befund(`der Wechsel erwachte in ${b2.welt} [${b2.marken.join(",")}] statt in welt-w1 [MARK-W1]`);
            const w2 = await page.evaluate(() =>
                (localStorage.getItem("anazhRealmState_welt-w2") || "").includes("MARK-W2")
            );
            if (!w2) befund("nach dem Wechsel trägt der Platz von welt-w2 seine Marke nicht mehr");
        } else if (!v.leer) {
            // Boot 2: die Seite speichert (wie das Spiel) und lädt neu — die Form bleibt stabil
            await page.evaluate(() => r.saveState());
            await sleep(800);
            await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
            const b2 = await bereit(page);
            rep.boots.push(b2);
            if (b2.welt !== b1.welt || !b2.marken.includes(v.marke))
                befund(
                    `Boot 2 erwachte in ${b2.welt} [${b2.marken.join(",")}] statt stabil in ${b1.welt} [${v.marke}]`
                );
            if (b2.zeiger !== b2.welt) befund(`Boot 2: der Zeiger zeigt auf ${b2.zeiger}, die Seite trägt ${b2.welt}`);
        }
    } catch (e) {
        befund(`ABBRUCH: ${e && e.message ? e.message : e}`);
    } finally {
        rep.ms = Date.now() - t0;
        await ctx.close();
    }
    return rep;
}

hauptLauf(async () => {
    const tStart = Date.now();
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "standard", frist: 600000 });
    console.log("\n========= DIE BOOT-RETTUNG — der Boot verliert die Welt des Aktiv-Zeigers nie =========");
    console.log(`  Baum: ${root}`);
    const berichte = [];
    let rot = false;
    for (const form of FORMEN) {
        const rep = await fahreForm(browser, form, false);
        berichte.push(rep);
        const gruen = rep.befunde.length === 0;
        if (!gruen) rot = true;
        const weg = rep.boots.map((b) => (b && b.ok ? `${b.welt} [${b.marken.join(",")}]` : "—")).join(" → ");
        console.log(`  ${gruen ? "✓" : "⛔"} ${form.padEnd(17)} ${weg} · ${(rep.ms / 1000).toFixed(1)} s`);
        for (const f of rep.befunde) console.log(`      ⛔ ${f}`);
    }
    let selbst = null;
    if (SELBSTTEST) {
        const namen = [];
        for (const form of ["korrupt-bak", "nur-idb", "idb-frischer"]) {
            const rep = await fahreForm(browser, form, true);
            if (rep.befunde.length) namen.push(`${form}: ${rep.befunde[0]}`);
        }
        selbst = { benannt: namen };
        console.log(
            `\n  SELBSTTEST (die Kette liest zum Schein nur den Platz): ${namen.length} von 3 Formen rot — ${namen.join(" · ")}`
        );
    }
    if (JSON_AUS) fs.writeFileSync(JSON_AUS, JSON.stringify({ root, berichte, selbst }, null, 1));
    let pass;
    if (SELBSTTEST) {
        pass = !rot && selbst && selbst.benannt.length === 3;
        console.log(
            `\n${pass ? "✅" : "⛔"} SELBSTTEST ${pass ? `GRÜN: ${FORMEN.length} von ${FORMEN.length} Formen erwachen in ihrer Welt — und der Schein fällt rot beim Namen` : "ROT: " + (rot ? "der saubere Lauf ist schon rot" : "der Schein blieb unentdeckt (die Linse ist blind)")}`
        );
    } else {
        pass = !rot;
        console.log(
            `\n${pass ? "✅" : "⛔"} ${pass ? `${FORMEN.length} von ${FORMEN.length} Formen erwachen in ihrer Welt (die leere laut)` : "DER BOOT VERLIERT EINE WELT"}`
        );
    }
    console.log(`  Laufzeit ${((Date.now() - tStart) / 1000).toFixed(1)} s\n`);
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
});
