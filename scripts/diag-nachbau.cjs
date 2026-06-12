// diag-nachbau.cjs — DER NUTZER-BLICK (Schöpfer-Szenario wörtlich): ein Fahrzeug
// NACHBAUEN wie der Schöpfer es versuchte — über die ECHTEN UI-Pfade (Werkstatt:
// neuer Bauplan → Parts → Verbinden-Dialog → Sitz-Anker → Rolle ablesen → Hotbar →
// platzieren → reiten). Screenshot + Bruch-Protokoll bei JEDEM Schritt.
//   node scripts/diag-nachbau.cjs

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve("save-server.js");
const ART = path.resolve("artifacts");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 5000);
        proc.stdout.on("data", (c) => {
            if (!ready && /läuft/.test(c.toString())) {
                ready = true;
                clearTimeout(to);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    if (!fs.existsSync(ART)) fs.mkdirSync(ART, { recursive: true });
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
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1.5 });
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message.split("\n")[0]));
    const brueche = [];
    const shot = async (name) => {
        await new Promise((r) => setTimeout(r, 350));
        await page.screenshot({ path: path.join(ART, `nachbau-${name}.png`) });
        console.log(`Shot: nachbau-${name}.png`);
    };
    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 15000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.playerMesh) &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 50));
        });

        // SCHRITT 1 — Werkstatt öffnen + neuen Bauplan anlegen (wie der Schöpfer).
        const s1 = await page.evaluate(() => {
            const r = window.anazhRealm;
            const tab = document.querySelector('[data-tab="werkstatt"]');
            if (tab) tab.click();
            if (typeof r._workshopEnsurePreview === "function") {
                try {
                    r._workshopEnsurePreview();
                } catch (_e) {
                    /* egal */
                }
            }
            if (r.state.blueprints.mein_wagen) delete r.state.blueprints.mein_wagen;
            const ok = r.createBlueprint("mein_wagen", "Mein Wagen");
            r.selectBlueprintForEdit("mein_wagen");
            return { created: ok === true };
        });
        console.log("S1 neuer Bauplan:", JSON.stringify(s1));
        if (!s1.created) brueche.push("S1: createBlueprint schlug fehl");

        // SCHRITT 2 — Parts bauen wie ein Nutzer: Holz-Korpus + 4 HOLZ-Räder
        // (der Nutzer kennt die Eisen-Antriebs-Regel NICHT — was sagt ihm das System?).
        const s2 = await page.evaluate(() => {
            const r = window.anazhRealm;
            const bp = r.state.blueprints.mein_wagen;
            const add = (part) => r.addPartToBlueprint("mein_wagen", part);
            add({
                shape: "box",
                material: "holz",
                position: { x: 0, y: 0.85, z: 0 },
                size: { x: 1.3, y: 0.35, z: 2.1 },
            });
            const rad = (x, z) =>
                add({
                    shape: "cylinder",
                    material: "holz",
                    position: { x, y: 0.34, z },
                    size: { x: 0.62, y: 0.14, z: 0.62 },
                    rotation: { x: 0, y: 0, z: 1.5707963 },
                });
            rad(-0.72, 0.8);
            rad(0.72, 0.8);
            rad(-0.72, -0.8);
            rad(0.72, -0.8);
            r.selectBlueprintForEdit("mein_wagen");
            return { parts: bp.parts.length };
        });
        console.log("S2 Parts:", JSON.stringify(s2));
        await shot("1-parts");

        // SCHRITT 3 — der VERBINDEN-Dialog über den ECHTEN Klick-Klick-Pfad:
        // connect-Modus + zwei Parts anklicken → öffnet sich der Kachel-Dialog?
        const s3 = await page.evaluate(() => {
            const r = window.anazhRealm;
            const ws = r._ensureWorkshopState();
            ws.manipulatorMode = "connect";
            // der echte Pfad: _workshopHandleConnectClick(0) → (1) → Popover
            r._workshopHandleConnectClick(1); // erster Klick: Rad
            r._workshopHandleConnectClick(0); // zweiter Klick: Korpus
            const ov = document.getElementById("workshop-connect-overlay");
            return {
                dialogOffen: !!ov,
                kacheln: ov ? ov.querySelectorAll(".conn-tile").length : 0,
                vorschlag:
                    ov && ov.querySelector(".conn-tile.suggested")
                        ? ov.querySelector(".conn-tile.suggested").getAttribute("data-conn-type")
                        : null,
            };
        });
        console.log("S3 Verbinden-Dialog:", JSON.stringify(s3));
        if (!s3.dialogOffen) brueche.push("S3: der Verbinden-Dialog öffnete sich NICHT über den Klick-Pfad");
        await shot("2-dialog");

        // SCHRITT 4 — Kachel klicken (Vorschlag) → Verbindung geschrieben? Dann
        // die restlichen 3 Räder verbinden + den SITZ per Face-Snap setzen.
        const s4 = await page.evaluate(() => {
            const r = window.anazhRealm;
            const ws = r._ensureWorkshopState();
            const ov = document.getElementById("workshop-connect-overlay");
            const sug = ov && (ov.querySelector(".conn-tile.suggested") || ov.querySelector(".conn-tile"));
            if (sug) sug.click();
            const bp = r.state.blueprints.mein_wagen;
            // die restlichen Räder (2,3,4) an den Korpus (0) — derselbe Klick-Pfad.
            for (const i of [2, 3, 4]) {
                r._workshopHandleConnectClick(i);
                r._workshopHandleConnectClick(0);
                const ov2 = document.getElementById("workshop-connect-overlay");
                const t = ov2 && (ov2.querySelector(".conn-tile.suggested") || ov2.querySelector(".conn-tile"));
                if (t) t.click();
            }
            // der SITZ: Dialog öffnen (Korpus↔Korpus geht nicht — Anker sitzt auf partA):
            // Anker-Kachel → Face-Pick-Modus → Klick auf die Korpus-Oberseite.
            r._workshopHandleConnectClick(0);
            r._workshopHandleConnectClick(1);
            const ov3 = document.getElementById("workshop-connect-overlay");
            const sitzTile = ov3 && ov3.querySelector('.conn-tile[data-conn-type="sitz"]');
            let pickArmed = false;
            if (sitzTile) {
                sitzTile.click();
                pickArmed = !!(ws.anchorPick && ws.anchorPick.type === "sitz");
            }
            // der Face-Pick-Klick: synthetischer Hit auf die Korpus-OBERSEITE
            // (der echte Maus-Klick raycastet — wir simulieren den Hit, partIdx 0).
            if (pickArmed) {
                r._workshopHandleAnchorPick({ point: new THREE.Vector3(0, 1.03, 0) }, 0);
            }
            const conns = (bp.connections || []).map((c) => ({ t: c.type, a: c.partA, b: c.partB, anchor: c.anchor }));
            return { pickArmed, conns };
        });
        console.log("S4 Verbindungen+Sitz:", JSON.stringify(s4));
        const sitzDa = s4.conns.some((c) => c.t === "sitz" && c.anchor);
        if (!sitzDa) brueche.push("S4: der Sitz-Anker kam NICHT an (Face-Pick-Kette)");
        await shot("3-verbunden");

        // SCHRITT 5 — DIE ROLLEN-WAHRHEIT des Nachbaus: was sagt das System?
        const s5 = await page.evaluate(() => {
            const r = window.anazhRealm;
            const bp = r.state.blueprints.mein_wagen;
            r.selectBlueprintForEdit("mein_wagen");
            const chip = document.querySelector(".spec-role-chip");
            const v = r._blueprintProductVector(bp);
            return {
                emergent: r.computeBlueprintRole(bp),
                chipText: chip ? chip.textContent : null,
                rideable: v.rideable,
                isMoveable: r._isMoveable(bp),
                useKind: r._blueprintUseKind(bp),
                materialHinweis: "holz.magieleitung=0.3 — reicht das für _isMoveable?",
            };
        });
        console.log("S5 ROLLE des Nachbaus:", JSON.stringify(s5, null, 2));
        if (s5.emergent !== "vehicle")
            brueche.push(
                `S5: der NACHGEBAUTE Wagen ist "${s5.emergent}" statt vehicle (rideable=${s5.rideable}, moveable=${s5.isMoveable}) — DER SCHÖPFER-BEFUND LEBT`
            );
        await shot("4-rolle");

        // SCHRITT 6 — Hotbar → platzieren → reiten (der Spieler-Flow).
        const s6 = await page.evaluate(() => {
            const r = window.anazhRealm;
            const out = {};
            r.setGameMode("schöpfer"); // frei platzieren (der Test gilt dem Flow, nicht den Kosten)
            r.setHotbarSlot(2, "mein_wagen");
            r.selectHotbarSlot(2);
            const bm = r.state.buildMode;
            out.phantom = bm.active === true && !!bm.phantomMesh;
            if (out.phantom) {
                const pm = r.state.playerMesh.position;
                bm.phantomMesh.position.set(pm.x + 5, r.getTerrainHeightAt(pm.x + 5, pm.z) + 0.5, pm.z);
                bm.phantomOnGround = true;
                out.placed = r.confirmBuild() === true;
            }
            const entry = (r.state.architectures || []).find((e) => e.type === "mein_wagen");
            out.inWelt = !!entry;
            if (entry) {
                const res = r.mountArchitecture(entry);
                out.mounted = res.ok === true;
                out.mountReason = res.reason || null;
                for (let i = 0; i < 10; i++) r._tickMountedMovement(0.05);
                out.sitzHoehe = entry._sitzHeight;
                out.versinkt = entry.position.y < r.getTerrainHeightAt(entry.position.x, entry.position.z) - 1;
                r.dismountArchitecture();
            }
            return out;
        });
        console.log("S6 Platzieren+Reiten:", JSON.stringify(s6));
        if (!s6.phantom) brueche.push("S6: die Hotbar gab KEIN Platzier-Phantom");
        if (s6.phantom && !s6.placed) brueche.push("S6: confirmBuild schlug fehl");
        if (s6.inWelt && !s6.mounted) brueche.push(`S6: REITEN schlug fehl (${s6.mountReason})`);
        await shot("5-welt");

        console.log("\n=== BRUCH-PROTOKOLL (der Nutzer-Blick) ===");
        if (brueche.length === 0) console.log("KEINE Brüche — der Nachbau-Flow trägt end-to-end.");
        for (const b of brueche) console.log("✗ " + b);
        process.exitCode = brueche.length ? 1 : 0;
    } catch (e) {
        console.error("DIAG-FEHLER:", e.message);
        process.exitCode = 1;
    } finally {
        await browser.close();
        server.kill();
    }
})();
