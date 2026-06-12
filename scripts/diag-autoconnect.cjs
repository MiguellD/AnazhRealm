// diag-autoconnect.cjs — §7.1 (meister-plan): die AUTO-VERBINDUNG im Nachbau-
// Szenario (die V18.162-WAND: erst spielen, dann „GEBAUT ✓"). Der Wagen-Nachbau
// OHNE einen einzigen Dialog-Klick: Parts platzieren/verschieben → Verbindungen
// entstehen von selbst (Besiege-Muster, substanz-emergent) → Räder ROLLEN →
// Sitz-Anker → Rolle FAHRZEUG. Plus die Wände: „✂ Lösen" wird geehrt (kein
// Re-Spawn auf ruhendem Kontakt), Trennen löst nur auto-Geborenes, die Tür/
// Wirbel-Gelenke bleiben der bewussten Hand (Hütten wackeln nie).
//   node scripts/diag-autoconnect.cjs
//
// Exit 1 bei jedem Bruch (das Protokoll zählt sie); Shots in artifacts/.

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

        // S1 — neuer Bauplan + Korpus; ein RAD landet via dem ECHTEN Shape-Drop
        // am Ursprung. Der Korpus schwebt (y 0.85) — der Ursprung berührt ihn
        // NICHT → es darf KEINE Phantom-Verbindung entstehen (ehrlicher Kontakt).
        const s1 = await page.evaluate(() => {
            const r = window.anazhRealm;
            const tab = document.querySelector('[data-tab="werkstatt"]');
            if (tab) tab.click();
            try {
                r._workshopEnsurePreview();
            } catch (_e) {
                /* headless-defensiv */
            }
            if (r.state.blueprints.auto_wagen) delete r.state.blueprints.auto_wagen;
            r.createBlueprint("auto_wagen", "Auto-Wagen");
            r.selectBlueprintForEdit("auto_wagen");
            const bp = r.state.blueprints.auto_wagen;
            r.addPartToBlueprint("auto_wagen", {
                shape: "box",
                material: "holz",
                position: { x: 0, y: 0.85, z: 0 },
                size: { x: 1.3, y: 0.35, z: 2.1 },
            });
            // der ECHTE Nutzer-Pfad: Form aus der Palette ziehen → Ursprung
            r._workshopHandleShapeDrop("cylinder");
            const conns = (bp.connections || []).filter((c) => c.auto);
            return { parts: bp.parts.length, autoAfterDrop: conns.length };
        });
        console.log("S1 Drop ohne Kontakt → kein Phantom:", JSON.stringify(s1));
        if (s1.autoAfterDrop !== 0) brueche.push(`S1: ${s1.autoAfterDrop} Phantom-Verbindung(en) ohne Kontakt`);

        // S2 — das Rad FORMEN (Größe+Rotation wie ein Wagenrad — eigene Gesten,
        // am Ursprung ohne Kontakt), dann an den Platz ZIEHEN (der echte End-
        // Manipulations-Hook): die Verbindung entsteht AM PLATZ — und der
        // liegende Zylinder zählt ROTATIONS-BEWUSST (|R|·s: vertikal 0.62,
        // nicht 0.14 — die rotations-blinde Hülle hätte nie „berührt").
        const s2 = await page.evaluate(() => {
            const r = window.anazhRealm;
            const ws = r._ensureWorkshopState();
            const bp = r.state.blueprints.auto_wagen;
            const dragTo = (idx, pos) => {
                ws.selectedPartIdx = idx;
                const touchesBefore = r._workshopTouchesOf(bp, idx);
                bp.parts[idx].position = pos;
                ws.preview.dragManipulator = { mode: "translate", touchesBefore };
                r._workshopEndManipulation();
            };
            // formen (Scale/Rotate-Gesten am Ursprung — kein Kontakt, kein Effekt)
            bp.parts[1].rotation = { x: 0, y: 0, z: 1.5707963 };
            bp.parts[1].size = { x: 0.62, y: 0.14, z: 0.62 };
            // ans Ziel (unter den Korpus — der rotierte Rad-Scheitel berührt ihn)
            dragTo(1, { x: -0.72, y: 0.34, z: 0.8 });
            const afterPlace = (bp.connections || []).filter((c) => c.auto);
            // und wieder WEG → die auto-Verbindung löst sich
            dragTo(1, { x: 6, y: 0.34, z: 6 });
            const afterAway = (bp.connections || []).filter((c) => c.auto).length;
            // zurück an den Platz (für den weiteren Bau)
            dragTo(1, { x: -0.72, y: 0.34, z: 0.8 });
            return {
                afterPlace: afterPlace.length,
                type: afterPlace[0] && afterPlace[0].type,
                afterAway,
                back: (bp.connections || []).filter((c) => c.auto).length,
            };
        });
        console.log("S2 hin→verbunden · weg→gelöst:", JSON.stringify(s2));
        if (s2.afterPlace !== 1)
            brueche.push(`S2: Platzieren gebar ${s2.afterPlace} statt 1 (rotations-blinder Kontakt?)`);
        if (s2.afterAway !== 0) brueche.push(`S2: Trennen ließ ${s2.afterAway} auto-Verbindungen stehen`);
        if (s2.back !== 1) brueche.push(`S2: Rückkehr gebar ${s2.back} statt 1`);

        // S3 — drei weitere Räder (Drop → formen → an den Platz) = der volle
        // Wagen, NULL Dialog-Klicks. Dann: rollen die Räder (Motion-Rolle rad)?
        const s3 = await page.evaluate(() => {
            const r = window.anazhRealm;
            const ws = r._ensureWorkshopState();
            const bp = r.state.blueprints.auto_wagen;
            const radAt = (x, z) => {
                r._workshopHandleShapeDrop("cylinder");
                const idx = bp.parts.length - 1;
                bp.parts[idx].rotation = { x: 0, y: 0, z: 1.5707963 };
                bp.parts[idx].size = { x: 0.62, y: 0.14, z: 0.62 };
                ws.selectedPartIdx = idx;
                const touchesBefore = r._workshopTouchesOf(bp, idx);
                bp.parts[idx].position = { x, y: 0.34, z };
                ws.preview.dragManipulator = { mode: "translate", touchesBefore };
                r._workshopEndManipulation();
            };
            radAt(0.72, 0.8);
            radAt(-0.72, -0.8);
            radAt(0.72, -0.8);
            const autos = (bp.connections || []).filter((c) => c.auto);
            const roles = r.computeMotionRoles(bp.parts, bp.connections) || [];
            const radCount = roles.filter((x) => x && x.role === "rad").length;
            return { autos: autos.length, radCount, types: autos.map((c) => c.type).join(",") };
        });
        console.log("S3 voller Wagen:", JSON.stringify(s3));
        if (s3.autos !== 4) brueche.push(`S3: ${s3.autos} statt 4 auto-Verbindungen`);
        if (s3.radCount !== 4) brueche.push(`S3: ${s3.radCount} statt 4 Rad-Gelenke — Räder rollen nicht`);

        // S4 — die Substanz-Folge: Material → eisen ⇒ auto-Typ wandert auf
        // Schweißen (der argmax folgt dem Material-Paar — kein Klick nötig).
        const s4 = await page.evaluate(() => {
            const r = window.anazhRealm;
            const bp = r.state.blueprints.auto_wagen;
            for (let i = 0; i < bp.parts.length; i++) {
                r.updatePartInBlueprint("auto_wagen", i, { material: "eisen", recolor: true });
            }
            // der Material-Drop-Hook (hier direkt der Kern — Drop braucht Koordinaten)
            r._workshopLogAutoConnect(r._workshopAutoConnect(bp, 0, r._workshopTouchesOf(bp, 0)));
            const types = (bp.connections || []).filter((c) => c.auto).map((c) => c.type);
            return { types: types.join(","), allWelding: types.every((t) => t === "welding") };
        });
        console.log("S4 Substanz-Folge (eisen):", JSON.stringify(s4));
        if (!s4.allWelding) brueche.push(`S4: auto-Typen folgten der Substanz nicht (${s4.types})`);

        // S5 — „✂ Lösen" wird GEEHRT: Verbindung lösen, Part minimal bewegen
        // (Kontakt BLEIBT — kein Übergang) → sie darf NICHT zurückkommen.
        const s5 = await page.evaluate(() => {
            const r = window.anazhRealm;
            const ws = r._ensureWorkshopState();
            const bp = r.state.blueprints.auto_wagen;
            const idx = bp.connections.findIndex((c) => c.auto);
            const partIdx = bp.connections[idx].partA === 0 ? bp.connections[idx].partB : bp.connections[idx].partA;
            r.removeConnectionFromBlueprint("auto_wagen", idx);
            ws.selectedPartIdx = partIdx;
            const touchesBefore = r._workshopTouchesOf(bp, partIdx);
            bp.parts[partIdx].position.x += 0.01; // ruckeln, Kontakt bleibt
            ws.preview.dragManipulator = { mode: "translate", touchesBefore };
            r._workshopEndManipulation();
            const respawned = (bp.connections || []).some(
                (c) => (c.partA === partIdx && c.partB === 0) || (c.partB === partIdx && c.partA === 0)
            );
            // und: erst WEG, dann WIEDER HIN = ein echter Übergang → sie darf zurück
            ws.selectedPartIdx = partIdx;
            const tb2 = r._workshopTouchesOf(bp, partIdx);
            const old = { ...bp.parts[partIdx].position };
            bp.parts[partIdx].position = { x: 8, y: 0.34, z: 8 };
            ws.preview.dragManipulator = { mode: "translate", touchesBefore: tb2 };
            r._workshopEndManipulation();
            ws.selectedPartIdx = partIdx;
            const tb3 = r._workshopTouchesOf(bp, partIdx);
            bp.parts[partIdx].position = old;
            ws.preview.dragManipulator = { mode: "translate", touchesBefore: tb3 };
            r._workshopEndManipulation();
            const reborn = (bp.connections || []).some(
                (c) => c.auto && ((c.partA === partIdx && c.partB === 0) || (c.partB === partIdx && c.partA === 0))
            );
            return { respawned, reborn };
        });
        console.log("S5 Lösen geehrt · Übergang gebiert neu:", JSON.stringify(s5));
        if (s5.respawned) brueche.push("S5: gelöste Verbindung kam auf ruhendem Kontakt zurück");
        if (!s5.reborn) brueche.push("S5: echter Weg-und-zurück-Übergang gebar KEINE neue Verbindung");

        // S6 — Sitz-Anker → Rolle FAHRZEUG + Sattel in der WELT + Ghost in der
        // Werkstatt (§7.2: bauen → sehen → sitzen ist EIN Punkt).
        const s6 = await page.evaluate(() => {
            const r = window.anazhRealm;
            const bp = r.state.blueprints.auto_wagen;
            bp.connections.push({ type: "sitz", partA: 0, partB: -1, anchor: { x: 0, y: 0.175, z: 0 } });
            r._refreshBlueprintRoleEmergent("auto_wagen");
            const role = r.computeBlueprintRole(bp);
            const world = r._buildFromBlueprint(bp, 0);
            const seat = world.children.find((c) => c.userData && c.userData.isAttachmentVisual);
            const shop = r._buildFromBlueprint(bp, 0, undefined, { connectionLines: true });
            const ghost = shop.children.find((c) => c.userData && c.userData.isSeatGhost);
            const seatInWorld = !!seat;
            const ghostInShop = !!ghost;
            const ghostNotInWorld = !world.children.some((c) => c.userData && c.userData.isSeatGhost);
            r.selectBlueprintForEdit("auto_wagen");
            return { role, seatInWorld, ghostInShop, ghostNotInWorld };
        });
        console.log("S6 Rolle + Sattel + Ghost:", JSON.stringify(s6));
        if (s6.role !== "vehicle") brueche.push(`S6: Rolle ist ${s6.role}, nicht vehicle`);
        if (!s6.seatInWorld) brueche.push("S6: kein Sattel in der Welt-Optik");
        if (!s6.ghostInShop) brueche.push("S6: kein Probesitz-Ghost in der Werkstatt");
        if (!s6.ghostNotInWorld) brueche.push("S6: der Ghost leckt in die WELT (gehört nur der Werkstatt)");

        // S7 — die WAND: Wand-auf-Boden (auto) gebiert KEINE Tür; ein 3er-Turm
        // (auto) KEINE Wirbel-Kette; die BEWUSSTE Hand beide weiterhin.
        const s7 = await page.evaluate(() => {
            const r = window.anazhRealm;
            const mk = (autoFlag) => ({
                name: "_probe",
                parts: [
                    { shape: "box", material: "holz", position: { x: 0, y: 0.15, z: 0 }, size: { x: 6, y: 0.3, z: 6 } },
                    // Wand MITTIG überm Boden → Verbindungs-Achse y (die Tür-Geometrie)
                    { shape: "box", material: "holz", position: { x: 0, y: 1.8, z: 0 }, size: { x: 4, y: 3, z: 0.2 } },
                ],
                connections: [
                    autoFlag
                        ? { type: "lashing", partA: 1, partB: 0, auto: 1 }
                        : { type: "lashing", partA: 1, partB: 0 },
                ],
            });
            const autoRoles = r.computeMotionRoles(mk(true).parts, mk(true).connections) || [];
            const manualRoles = r.computeMotionRoles(mk(false).parts, mk(false).connections) || [];
            const autoTuer = autoRoles.some((x) => x && x.role === "tuer");
            const manualTuer = manualRoles.some((x) => x && x.role === "tuer");
            const tower = (autoFlag) => {
                const p = [0, 1, 2, 3].map((i) => ({
                    shape: "box",
                    material: "stein",
                    position: { x: 0, y: 0.5 + i, z: 0 },
                    size: { x: 1, y: 1, z: 1 },
                }));
                const c = [0, 1, 2].map((i) =>
                    autoFlag
                        ? { type: "masonry", partA: i, partB: i + 1, auto: 1 }
                        : { type: "masonry", partA: i, partB: i + 1 }
                );
                return r.computeMotionRoles(p, c) || [];
            };
            const autoWirbel = tower(true).some((x) => x && x.role === "wirbel");
            const manualWirbel = tower(false).some((x) => x && x.role === "wirbel");
            return { autoTuer, manualTuer, autoWirbel, manualWirbel };
        });
        console.log("S7 Tür/Wirbel nur bewusst:", JSON.stringify(s7));
        if (s7.autoTuer) brueche.push("S7: auto-Verbindung gebar eine TÜR (Hütten wackeln!)");
        if (!s7.manualTuer) brueche.push("S7: bewusste Verbindung gebar KEINE Tür mehr (Regression)");
        if (s7.autoWirbel) brueche.push("S7: auto-Turm gebar eine WIRBEL-Kette");
        if (!s7.manualWirbel) brueche.push("S7: bewusste Kette gebar KEINEN Wirbel mehr (Regression)");

        // Shot: die Werkstatt mit dem auto-verbundenen Wagen (Linien + Sattel + Ghost).
        await page.evaluate(() => {
            const r = window.anazhRealm;
            r.selectBlueprintForEdit("auto_wagen");
            const ws = r._ensureWorkshopState();
            if (ws.preview) ws.preview.dirty = true;
            if (typeof r._workshopRenderPreviewFrame === "function") r._workshopRenderPreviewFrame();
        });
        await new Promise((r) => setTimeout(r, 600));
        await page.screenshot({ path: path.join(ART, "autoconnect-wagen.png") });
        console.log("Shot: autoconnect-wagen.png");
    } catch (e) {
        brueche.push(`Harness: ${e.message}`);
    } finally {
        await browser.close();
        server.kill();
    }
    console.log("\n=== §7.1-NACHBAU-PROTOKOLL ===");
    if (brueche.length === 0) {
        console.log("0 Brüche — der Wagen entsteht OHNE einen Dialog-Klick, die Wände stehen.");
        process.exit(0);
    }
    for (const b of brueche) console.log("BRUCH:", b);
    process.exit(1);
})();
