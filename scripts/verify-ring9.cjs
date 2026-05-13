// End-to-End-Verifikation Ring 9: tatsächliche UI-Interaktion + Edge-Cases.
// Parallel zu playtest.cjs, fokussiert auf Welt-Tor-Klick-Pfade die Daten-
// Plane-Tests nicht abdecken.
const path = require("path");
const { spawn } = require("child_process");
const puppeteer = require("puppeteer");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SERVER_URL = "http://127.0.0.1:4312/";

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn(process.execPath, ["save-server.js"], {
            cwd: PROJECT_ROOT,
            stdio: ["ignore", "pipe", "pipe"],
        });
        let ready = false;
        const timeout = setTimeout(() => {
            if (!ready) reject(new Error("Save-Server startete nicht innerhalb 5 s"));
        }, 5000);
        proc.stdout.on("data", (chunk) => {
            if (!ready && /läuft/.test(chunk.toString())) {
                ready = true;
                clearTimeout(timeout);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const failures = [];
    const log = (ok, name, detail) => {
        console.log(`${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) failures.push(name);
    };

    try {
        const page = await browser.newPage();
        const consoleErrors = [];
        const failedRequests = [];
        page.on("pageerror", (e) => consoleErrors.push("page: " + e.message));
        page.on("console", (m) => {
            if (m.type() === "error") consoleErrors.push("console: " + m.text());
        });
        page.on("requestfailed", (req) =>
            failedRequests.push(`${req.url()} (${req.failure() && req.failure().errorText})`)
        );
        page.on("response", (res) => {
            if (res.status() >= 400) failedRequests.push(`${res.url()} → ${res.status()}`);
        });
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await new Promise((r) => setTimeout(r, 8000));

        // 1. Dialog sichtbar nach _openWeltTorDialog
        const dlg1 = await page.evaluate(() => {
            const r = window.anazhRealm;
            const fake = {
                worldMeta: { worldId: "src-aaaa", slug: "fremder-hain", bornAt: Date.now(), seed: "x-y-z" },
                worldJournal: { entries: [], seen: {} },
                architectures: [],
                blueprints: [],
            };
            r._openWeltTorDialog(fake, { name: "fremd.json", size: 100 });
            const d = document.getElementById("world-tor-dialog");
            return {
                hasOpenAttr: d.hasAttribute("open"),
                offsetHeight: d.offsetHeight,
                summaryText: document.getElementById("world-tor-summary").textContent,
                pendingFile: r.state.pendingImport && r.state.pendingImport.fileName,
            };
        });
        log(dlg1.hasOpenAttr, "1.1 Dialog hat 'open'-Attribut nach showModal");
        log(dlg1.offsetHeight > 50, "1.2 Dialog ist sichtbar", `offsetHeight=${dlg1.offsetHeight}`);
        log(/fremder-hain/.test(dlg1.summaryText), "1.3 Summary nennt ankommenden Slug");
        log(dlg1.pendingFile === "fremd.json", "1.4 pendingImport.fileName korrekt gesetzt");

        // 2. Cancel-Button schließt + räumt
        const cancel = await page.evaluate(() => {
            const r = window.anazhRealm;
            document.getElementById("world-tor-cancel").click();
            const d = document.getElementById("world-tor-dialog");
            return { open: d.hasAttribute("open"), pending: r.state.pendingImport };
        });
        log(!cancel.open, "2.1 Dialog schließt nach Cancel-Click");
        log(cancel.pending === null, "2.2 pendingImport ist null nach Cancel");

        // 3. Daneben-Button → importWorldBeside läuft
        const beside = await page.evaluate(() => {
            const r = window.anazhRealm;
            const fake = {
                worldMeta: {
                    worldId: "src-bbbb",
                    slug: "echo-hain",
                    bornAt: Date.now(),
                    seed: "alpha-beta",
                    parentWorlds: ["ahnen-cccc"],
                },
                worldJournal: {
                    entries: [{ id: 1, at: Date.now(), tick: 0, type: "genesis", text: "Ich war einmal" }],
                    seen: { genesis: true },
                },
                architectures: [],
                blueprints: [],
            };
            const beforeIdx = r.worldsIndexLoad().length;
            const beforeActive = r.activeWorldGet();
            r._openWeltTorDialog(fake, { name: "echo.json", size: 200 });
            document.getElementById("world-tor-beside").click();
            const afterIdx = r.worldsIndexLoad();
            return {
                pending: r.state.pendingImport,
                indexDelta: afterIdx.length - beforeIdx,
                hasEchoSlug: afterIdx.some((e) => e.slug === "echo-hain"),
                activeUnchanged: r.activeWorldGet() === beforeActive,
            };
        });
        log(beside.pending === null, "3.1 pendingImport geräumt nach Beside-Click");
        log(beside.indexDelta === 1, "3.2 Index wuchs um 1 nach Beside", `delta=${beside.indexDelta}`);
        log(beside.hasEchoSlug, "3.3 Importierte Welt 'echo-hain' im Index");
        log(beside.activeUnchanged, "3.4 Aktive Welt unverändert nach Beside");

        // 4. parentWorlds-Chain bleibt erhalten
        const chain = await page.evaluate(() => {
            const r = window.anazhRealm;
            const echo = r.worldsIndexLoad().find((e) => e.slug === "echo-hain");
            const save = JSON.parse(localStorage.getItem(r.worldStorageKey(echo.worldId)));
            return {
                parents: save.worldMeta.parentWorlds,
                schema: save.worldMeta.schemaVersion,
                hasWitness: save.worldJournal.entries.some((e) => e.type === "witness"),
                keptOriginalEntries: save.worldJournal.entries.some(
                    (e) => e.type === "genesis" && e.text === "Ich war einmal"
                ),
            };
        });
        log(chain.parents && chain.parents.includes("ahnen-cccc"), "4.1 parentWorlds bewahrt bestehende Ahnen");
        log(chain.parents && chain.parents.includes("src-bbbb"), "4.2 parentWorlds enthält Source-ID");
        log(
            chain.parents && chain.parents.length === 2,
            "4.3 parentWorlds hat genau 2 (append, not replace)",
            `len=${chain.parents && chain.parents.length}`
        );
        log(chain.schema === "9.0-tor-v1", "4.4 Schema-Marker 9.0-tor-v1");
        log(chain.hasWitness, "4.5 Witness-Eintrag in importierter Welt");
        log(chain.keptOriginalEntries, "4.6 Original-Journal-Einträge bewahrt");

        // 5. Fusion-Button disabled
        const fuse = await page.evaluate(() => {
            const r = window.anazhRealm;
            r._openWeltTorDialog(
                { worldMeta: { worldId: "tmp", slug: "test", bornAt: Date.now() } },
                { name: "x.json", size: 1 }
            );
            const btn = document.getElementById("world-tor-fuse");
            const isDisabled = btn.disabled;
            btn.click();
            const stillOpen = document.getElementById("world-tor-dialog").hasAttribute("open");
            return { isDisabled, dialogStillOpen: stillOpen };
        });
        log(fuse.isDisabled, "5.1 Fusion-Button ist disabled");
        log(fuse.dialogStillOpen, "5.2 Dialog bleibt offen nach disabled-Click");
        await page.evaluate(() => document.getElementById("world-tor-cancel").click());

        // 6. Edge: ohne worldJournal
        const noJournal = await page.evaluate(() => {
            const r = window.anazhRealm;
            const fake = { worldMeta: { worldId: "no-journal", slug: "leer-1", bornAt: Date.now() } };
            const result = r.importWorldBeside(fake, { reload: false });
            return {
                ok: result.ok,
                slug: result.slug,
                hasWitnessInNew:
                    result.ok &&
                    (() => {
                        const save = JSON.parse(localStorage.getItem(r.worldStorageKey(result.worldId)) || "{}");
                        return (
                            save.worldJournal &&
                            save.worldJournal.entries &&
                            save.worldJournal.entries.some((e) => e.type === "witness")
                        );
                    })(),
            };
        });
        log(noJournal.ok, "6.1 Import ohne Journal: ok=true");
        log(noJournal.slug === "leer-1", "6.2 Slug aus worldMeta übernommen");
        log(noJournal.hasWitnessInNew, "6.3 Witness-Eintrag auch ohne ursprüngliches Journal erzeugt");

        // 7. Edge: ohne worldMeta
        const noMeta = await page.evaluate(() => {
            const r = window.anazhRealm;
            const fake = { architectures: [], blueprints: [] };
            const result = r.importWorldBeside(fake, { reload: false });
            return { ok: result.ok, hasId: !!result.worldId, slug: result.slug };
        });
        log(noMeta.ok, "7.1 Import ohne worldMeta: ok=true");
        log(noMeta.hasId, "7.2 Frische worldId vergeben");
        log(noMeta.slug && noMeta.slug.length > 0, "7.3 Slug-Fallback aktiv", `slug='${noMeta.slug}'`);

        // 8. null-Snapshot
        const nullParsed = await page.evaluate(() => {
            const r = window.anazhRealm;
            const result = r.importWorldBeside(null, { reload: false });
            return { ok: result.ok, reason: result.reason };
        });
        log(!nullParsed.ok && nullParsed.reason, "8.1 null-Snapshot wird abgewiesen", `reason='${nullParsed.reason}'`);

        // 9. Close-Event räumt pendingImport
        const esc = await page.evaluate(() => {
            const r = window.anazhRealm;
            r._openWeltTorDialog({ worldMeta: { worldId: "esc", slug: "esc-1" } }, { name: "esc.json", size: 1 });
            const before = r.state.pendingImport !== null;
            const d = document.getElementById("world-tor-dialog");
            d.dispatchEvent(new Event("close", { bubbles: true }));
            return { before, after: r.state.pendingImport };
        });
        log(esc.before, "9.1 pendingImport war vor close gesetzt");
        log(esc.after === null, "9.2 Close-Event räumt pendingImport");

        // 10. Replace-Pfad
        const replace = await page.evaluate(() => {
            const r = window.anazhRealm;
            const fake = {
                worldMeta: { worldId: "replace-src", slug: "uebernehme", bornAt: Date.now(), seed: "x" },
                playerPosition: { x: 99, y: 50, z: 99 },
                worldJournal: { entries: [], seen: {} },
                architectures: [],
                blueprints: [],
            };
            r._openWeltTorDialog(fake, { name: "rep.json", size: 100 });
            document.getElementById("world-tor-replace").click();
            return {
                pending: r.state.pendingImport,
                worldMetaSlug: r.state.worldMeta.slug,
            };
        });
        log(replace.pending === null, "10.1 Replace räumt pendingImport");
        log(
            replace.worldMetaSlug === "uebernehme",
            "10.2 Replace übernimmt importierten Slug",
            `slug=${replace.worldMetaSlug}`
        );

        // Page-Errors
        log(
            consoleErrors.length === 0,
            "11.1 Keine Console-Errors während Verifikation",
            consoleErrors.length ? consoleErrors.join(" ::: ").slice(0, 600) : ""
        );
        log(
            failedRequests.length === 0,
            "11.2 Keine 4xx/5xx-Responses",
            failedRequests.length ? failedRequests.join(" ::: ").slice(0, 600) : ""
        );
    } finally {
        await browser.close();
        server.kill();
    }

    if (failures.length > 0) {
        console.log(`\n❌ ${failures.length} Verifikationen fehlgeschlagen: ${failures.join(", ")}`);
        process.exit(1);
    } else {
        console.log(`\n✅ Alle Verifikationen OK`);
    }
})().catch((e) => {
    console.error("Verifikation-Crash:", e);
    process.exit(1);
});
