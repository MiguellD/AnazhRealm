// diag-audit2.cjs — DER ZWEITE SCHÖPFER-AUDIT, GEMESSEN (12.06.2026 abend).
// KEINE Code-Änderung — reine Messung der gemeldeten Brüche über die ECHTEN
// UI-Pfade, damit der Plan auf WURZELN steht statt auf Vermutungen.
//   node scripts/diag-audit2.cjs
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
    await page.setViewport({ width: 1600, height: 900 });
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message.split("\n")[0]));
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

        // ===== A. ICH: Rüstung anziehen über den ECHTEN Dropdown-Pfad =====
        const a = await page.evaluate(() => {
            const r = window.anazhRealm;
            const out = { mode: r.getGameMode() };
            const tab = document.querySelector('[data-tab="ich"]');
            if (tab) tab.click();
            r.renderInventoryUI();
            const before = r.computePlayerStats();
            out.abwehrVor = before.defense ?? before.abwehr ?? null;
            out.statKeys = Object.keys(before).join(",");
            // (1) wearArmor wie der Dropdown (frieden!): was passiert wirklich?
            const res = r.wearArmor("ruestung_brustpanzer");
            out.wearResult = { ok: res.ok, reason: res.reason || null, missing: res.missing || null };
            out.equippedNach = r.state.player.equipped && r.state.player.equipped.armor;
            const after = r.computePlayerStats();
            out.abwehrNach = after.defense ?? after.abwehr ?? null;
            // (2) der LOW-LEVEL-Pfad (equipArmor, frei): ändert die Rüstung die Stats ÜBERHAUPT?
            r.equipArmor("ruestung_brustpanzer");
            const forced = r.computePlayerStats();
            out.abwehrEquipped = forced.defense ?? forced.abwehr ?? null;
            out.statDeltaSichtbar = JSON.stringify(forced) !== JSON.stringify(before);
            r.equipArmor(null);
            // (3) der Dropdown-ZUSTAND nach Fehlschlag: zeigt das Select die Lüge?
            r.renderInventoryUI();
            const sel = document.querySelector(".equip-slot-select");
            if (sel) {
                sel.value = "ruestung_brustpanzer";
                sel.dispatchEvent(new Event("change", { bubbles: true }));
            }
            const selAfter = document.querySelector(".equip-slot-select");
            out.dropdownZeigt = selAfter ? selAfter.value : null;
            out.echtEquipped = (r.state.player.equipped && r.state.player.equipped.armor) || null;
            out.dropdownLuegt = !!selAfter && selAfter.value !== (out.echtEquipped || "");
            return out;
        });
        console.log("A ICH-Rüstung:", JSON.stringify(a));

        // ===== B. ICH: Boost-Doppel + ausgelaufene Chips + Emotion-Label-Kontrast =====
        const b = await page.evaluate(() => {
            const r = window.anazhRealm;
            const out = {};
            // einen kurzen Boost injizieren + einen abgelaufenen
            const nowS = performance.now() / 1000;
            r.state.player.boosts = r.state.player.boosts || [];
            r.state.player.boosts.push(
                { source: "probe1", label: "Probe-Boost", tagDelta: { härte: 0.2 }, expiresAt: nowS + 120 },
                { source: "probe2", label: "Alt-Boost", tagDelta: { lebendig: 0.1 }, expiresAt: nowS + 0.5 }
            );
            r.renderInventoryUI();
            // WO erscheinen Boost-Texte? Alle Elemente mit dem Probe-Text einsammeln.
            const hits = [];
            document.querySelectorAll("*").forEach((el) => {
                if (el.children.length === 0 && /Probe-Boost|Freude wärmt/.test(el.textContent || "")) {
                    let anc = el;
                    const chain = [];
                    for (let i = 0; i < 5 && anc; i++) {
                        chain.push(anc.id || anc.className || anc.tagName);
                        anc = anc.parentElement;
                    }
                    hits.push(chain.join(" < "));
                }
            });
            out.boostRenderOrte = hits;
            // ausgelaufen: 1s warten simulieren wir via direktem Tick-Aufruf nach Ablauf
            return out;
        });
        await new Promise((r) => setTimeout(r, 1200));
        const b2 = await page.evaluate(() => {
            const r = window.anazhRealm;
            const out = {};
            r._tickBoostChips();
            const chips = Array.from(document.querySelectorAll(".ich-boost-chip")).map((c) => c.textContent);
            out.chipsNachAblauf = chips;
            out.ausgelaufenBleibt = chips.some((t) => /ausgelaufen/.test(t));
            // Emotion-Label-Kontrast im ICH (#status-emotions .name)
            const name = document.querySelector("#status-emotions .emotion .name");
            const value = document.querySelector("#status-emotions .emotion .value");
            const bgEl = document.querySelector(".ich-emotion-block") || document.body;
            const cs = name ? getComputedStyle(name) : null;
            out.emoLabelColor = cs ? cs.color : null;
            out.emoValueColor = value ? getComputedStyle(value).color : null;
            out.emoBlockBg = getComputedStyle(bgEl).backgroundColor;
            // Aufräumen
            r.state.player.boosts = r.state.player.boosts.filter((x) => !/probe/.test(x.source || ""));
            return out;
        });
        console.log("B Boosts/Emotion:", JSON.stringify({ ...b, ...b2 }));

        // ===== C. ICH: Fahrzeug-Karten-Knopf + Umwidmen-Rest + Offhand-Feld =====
        const c = await page.evaluate(() => {
            const r = window.anazhRealm;
            const out = {};
            r.renderRecipeBook();
            const rows = Array.from(document.querySelectorAll("#inventory-recipes .recipe-row"));
            const wagenRow = rows.find((row) => /Wagen/i.test(row.textContent || ""));
            out.wagenKnopf = wagenRow ? (wagenRow.querySelector("button") || {}).textContent : null;
            out.umwidmenImIch = !!Array.from(document.querySelectorAll("summary")).find((s) =>
                /umwidmen/i.test(s.textContent || "")
            );
            // Offhand/Faust-Feld unter dem Viewer (Dopplung zur G-Hotbar?)
            const equipSlots = Array.from(document.querySelectorAll(".equip-slot")).map((e) =>
                (e.textContent || "").slice(0, 40)
            );
            out.equipSlots = equipSlots;
            return out;
        });
        console.log("C ICH-Karten/Umwidmen:", JSON.stringify(c));

        // ===== D. KONSOLE: Inline-Resize vs. Collapse-Zustand =====
        const d = await page.evaluate(async () => {
            const out = {};
            const ich = document.querySelector('[data-tab="ich"]');
            if (ich) ich.click();
            document.querySelectorAll(".drawer.open").forEach((dr) => dr.classList.remove("open"));
            const cons = document.getElementById("console");
            if (!cons) return { fehlt: true };
            const handle = cons.querySelector(".resize-handle");
            out.handleClass = handle ? handle.className : null;
            const r0 = cons.getBoundingClientRect();
            out.start = { w: Math.round(r0.width), h: Math.round(r0.height), collapsed: cons.classList.contains("collapsed") };
            // Drag simulieren: Handle 120px nach oben ziehen (tr wächst nach oben)
            if (handle) {
                const hr = handle.getBoundingClientRect();
                const mk = (type, x, y) =>
                    handle.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }));
                mk("mousedown", hr.x + 4, hr.y + 4);
                window.dispatchEvent(new MouseEvent("mousemove", { clientX: hr.x + 4, clientY: hr.y - 120 }));
                window.dispatchEvent(new MouseEvent("mouseup", {}));
            }
            const r1 = cons.getBoundingClientRect();
            out.nachDrag = { w: Math.round(r1.width), h: Math.round(r1.height), inlineH: cons.style.height };
            // Jetzt EINKLAPPEN: bleibt die Inline-Höhe und bricht den Zustand?
            const toggle = document.getElementById("console-collapse");
            if (toggle) toggle.click();
            const r2 = cons.getBoundingClientRect();
            out.nachCollapse = {
                h: Math.round(r2.height),
                collapsed: cons.classList.contains("collapsed"),
                inlineH: cons.style.height,
            };
            if (toggle) toggle.click(); // wieder auf
            const r3 = cons.getBoundingClientRect();
            out.nachExpand = { h: Math.round(r3.height), inlineH: cons.style.height };
            // Aufräumen: Doppelklick-Reset
            const h2 = cons.querySelector(".resize-handle");
            if (h2) h2.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
            return out;
        });
        console.log("D Konsole:", JSON.stringify(d));

        // ===== E. RITT: schwebt der Reiter? clippt das Ross? =====
        const e = await page.evaluate(async () => {
            const r = window.anazhRealm;
            const out = {};
            const pm = r.state.playerMesh;
            // Wagen spawnen + besteigen
            const sp = { x: pm.position.x + 4, y: pm.position.y, z: pm.position.z };
            const s = r.spawnArchitecture("fahrzeug_wagen", sp, { precise: true });
            const entry = r.state.architectures[r.state.architectures.length - 1];
            r.mountArchitecture(entry);
            for (let i = 0; i < 12; i++) r._gameLoopTick(performance.now() + i * 16);
            const bp = r.state.blueprints.fahrzeug_wagen;
            const seatLocal = r._attachPointFor(bp, "sitz").point;
            const scale = Number.isFinite(entry.scale) ? entry.scale : 1;
            const seatWorldY = entry.position.y + seatLocal.y * scale;
            out.wagen = {
                sitzHeight: entry._sitzHeight,
                seatLocalY: seatLocal.y,
                riderY: Math.round(pm.position.y * 100) / 100,
                seatWorldY: Math.round(seatWorldY * 100) / 100,
                schwebe: Math.round((pm.position.y - seatWorldY) * 100) / 100,
                bottomY: r._compoundBottomY(bp),
                entryY: Math.round(entry.position.y * 100) / 100,
                terrainY: Math.round(r.getTerrainHeightAt(entry.position.x, entry.position.z) * 100) / 100,
            };
            out.wagen.clip =
                Math.round((out.wagen.entryY + out.wagen.bottomY - out.wagen.terrainY) * 100) / 100;
            r.dismountArchitecture && r.dismountArchitecture();
            if (typeof r.unmountArchitecture === "function") r.unmountArchitecture();
            return out;
        });
        console.log("E Ritt:", JSON.stringify(e));

        // ===== F. NEXUS: spawnt at_player wieder AUF dem Spieler? =====
        const f = await page.evaluate(() => {
            const r = window.anazhRealm;
            const out = {};
            const pm = r.state.playerMesh.position;
            // Struktur über den NEXUS-Pfad (source nexus, at_player)
            const prog1 = ["seq", ["spawn_architecture", "temple", ["at_player"]]];
            r.dslRun(prog1, { source: "nexus" });
            const lastA = r.state.architectures[r.state.architectures.length - 1];
            out.strukturDist = lastA
                ? Math.round(Math.hypot(lastA.position.x - pm.x, lastA.position.z - pm.z) * 10) / 10
                : null;
            // Kreatur über den NEXUS-Pfad
            const nC = r.state.creatures.length;
            r.dslRun(["seq", ["spawn_creature", ["at_player"]]], { source: "nexus" });
            const newC = r.state.creatures.length > nC ? r.state.creatures[r.state.creatures.length - 1] : null;
            out.kreaturDist = newC
                ? Math.round(Math.hypot(newC.position.x - pm.x, newC.position.z - pm.z) * 10) / 10
                : null;
            return out;
        });
        console.log("F Nexus-Spawn:", JSON.stringify(f));

        // ===== G. Statusbar-Überlagerung: was rendert unter der Leiste? =====
        const g = await page.evaluate(() => {
            const out = { unterDerLeiste: [] };
            const bar = document.getElementById("status-bar") || document.querySelector(".status-bar");
            const barBottom = bar ? bar.getBoundingClientRect().bottom : 90;
            document.querySelectorAll("body *").forEach((el) => {
                if (el.children.length > 0) return;
                const t = (el.textContent || "").trim();
                if (!t || t.length < 3) return;
                const rc = el.getBoundingClientRect();
                if (rc.top > barBottom - 4 && rc.top < barBottom + 80 && rc.width > 0 && rc.height > 0) {
                    const inDrawer = el.closest(".drawer, #inventory-overlay, #console");
                    if (!inDrawer) out.unterDerLeiste.push({ t: t.slice(0, 50), id: el.id || el.className });
                }
            });
            return out;
        });
        console.log("G Statusbar-Region:", JSON.stringify(g));

        // ===== H. NACHT-BODEN: frisst max() die Struktur? (Pixel-Varianz) =====
        const h = await page.evaluate(() => {
            const r = window.anazhRealm;
            r.processChatCommand && r.processChatCommand("zeit nacht");
            if (typeof r.setTimeOfDay === "function") r.setTimeOfDay(0);
            r.setTerrainNightFloor(0.0);
            return { mode: "nacht", floor: 0 };
        });
        await new Promise((r) => setTimeout(r, 800));
        await page.screenshot({ path: path.join(ART, "audit2-nightfloor-0.png") });
        await page.evaluate(() => window.anazhRealm.setTerrainNightFloor(0.3));
        await new Promise((r) => setTimeout(r, 800));
        await page.screenshot({ path: path.join(ART, "audit2-nightfloor-30.png") });
        await page.evaluate(() => window.anazhRealm.setTerrainNightFloor(0.12));
        console.log("H NightFloor-Shots: audit2-nightfloor-0/30.png", JSON.stringify(h));
    } catch (e2) {
        console.error("Harness:", e2.message);
    } finally {
        await browser.close();
        server.kill();
    }
})();
