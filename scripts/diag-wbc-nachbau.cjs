// diag-wbc-nachbau.cjs — der §8.7-ZUSTANDS-NACHBAU der W-B/W-C/W-D-Wellen
// (V18.171; die V18.64-Fischer-Pflicht): 1366×768 · frieden · leeres Inventar ·
// Konsole zu — die NEUEN Flächen werden GERENDERT, GESHOOTET und VERMESSEN:
//   (a) HOF: 6 Gefühls-Reihen + Natur-<details> + Werte-Balken (Geometrie im
//       Viewport? Reihen sichtbar?)
//   (b) ICH: Boost-Band am Emotions-Block · Haupthand · Mach-Tor-Hint nach
//       ECHTEM fehlgeschlagenem Rüstungs-Akt (sichtbar AM Ort?)
//   (c) STATUSBAR: das Emotions-Wort — und die LOCH-PROBE (Text bleibt bei
//       opacity 0 → unsichtbare Lücke im Flow?)
//   (d) WERKSTATT: die Warum-Zeile + das Intent-Trio im Stats-Panel.
// Shots: artifacts/nachbau-hof.png · nachbau-ich.png · nachbau-werkstatt.png
//   node scripts/diag-wbc-nachbau.cjs
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
    await page.setViewport({ width: 1366, height: 768 });
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message.split("\n")[0]));
    const out = {};
    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 20000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.playerMesh) &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 50));
            // NUTZER-ZUSTAND (§8.7): frieden + leeres Inventar + Konsole zu.
            const r = window.anazhRealm;
            r.setGameMode("frieden");
            r.state.player.inventory = [];
            const cons = document.getElementById("console");
            if (cons) cons.classList.add("collapsed");
        });

        // ===== (a) HOF — Tab klicken, Wesen spawnen + fokussieren, Slide erzwingen =====
        await page.click('#topbar .tab[data-tab="kreaturen"]');
        out.hof = await page.evaluate(() => {
            const r = window.anazhRealm;
            const d = document.querySelector('.drawer[data-drawer="kreaturen"]');
            // Headless-Transition startet nie (V18.171-Lehre) → Endzustand erzwingen.
            d.style.transition = "none";
            d.style.transform = "none";
            const pm = r.state.playerMesh.position;
            const c = r.spawnCreatureAt(pm.x + 5, pm.y, pm.z, "happy", "wesen");
            if (!c) return { fehler: "kein Spawn" };
            c.userData.emotions = { joy: 0.7, awe: 0.15, sorrow: 0.05, hope: 0.3, peace: 0.2, chaos: 0 };
            r.state.hofFocusId = r._creatureProfile(c).id;
            r._renderCreatureListUI();
            const o = { vw: window.innerWidth };
            const sheet = document.querySelector('.drawer[data-drawer="kreaturen"] .hof-spec-sheet');
            if (!sheet) return { fehler: "kein Sheet" };
            const rc = sheet.getBoundingClientRect();
            o.sheet = { x: Math.round(rc.x), w: Math.round(rc.width), bottom: Math.round(rc.bottom) };
            o.imViewport = rc.left >= 0 && rc.right <= window.innerWidth + 1 && rc.bottom <= window.innerHeight + 1;
            const rows = sheet.querySelectorAll(".hof-emotion-rows .emotion");
            o.reihen = rows.length;
            o.reihenSichtbar = Array.from(rows).every((x) => x.getBoundingClientRect().width > 50);
            const joyFill = sheet.querySelector(".hof-emotion-rows .emotion.joy .bar > div");
            o.joyFillPx = joyFill ? Math.round(joyFill.getBoundingClientRect().width) : -1;
            const nat = sheet.querySelector("details.spec-nature-details");
            o.natur = nat ? { offen: nat.open, summarySichtbar: nat.querySelector("summary").offsetWidth > 0 } : null;
            const wb = sheet.querySelector(".spec-col .spec-bar .spec-bar-fill");
            o.werteFillPx = wb ? Math.round(wb.getBoundingClientRect().width) : -1;
            return o;
        });
        await page.screenshot({ path: path.join(ART, "nachbau-hof.png") });

        // ===== (b+c) ICH + STATUSBAR — Tab klicken, Boost injizieren, Armor-Akt scheitern lassen =====
        await page.click('#topbar .tab[data-tab="spieler"]');
        out.ich = await page.evaluate(() => {
            const r = window.anazhRealm;
            const o = {};
            // Boost injizieren → das EINE Band am Emotions-Block.
            const nowSec = performance.now() / 1000;
            r.state.player.boosts = [
                { source: "probe", label: "Quell-Segen", tagDelta: { magieleitung: 0.4 }, expiresAt: nowSec + 90 },
            ];
            r.renderInventoryUI();
            const band = document.querySelector("#ich-boosts-host .ich-boosts");
            o.bandDa = !!band;
            o.bandRect = band
                ? (({ x, y, width }) => ({ x: Math.round(x), y: Math.round(y), w: Math.round(width) }))(
                      band.getBoundingClientRect()
                  )
                : null;
            o.bandImViewport = band
                ? band.getBoundingClientRect().right <= window.innerWidth + 1 &&
                  band.getBoundingClientRect().bottom <= window.innerHeight + 1
                : false;
            // Haupthand-Label sichtbar?
            const eqHost = document.getElementById("inventory-equip");
            o.haupthand = !!eqHost && /Haupthand/.test(eqHost.textContent || "");
            // Der ECHTE fehlgeschlagene Rüstungs-Akt (frieden + leerer Beutel):
            // Select auf den Brustpanzer stellen + change feuern (der UI-Pfad).
            const bpArmor = r.state.blueprints.ruestung_brustpanzer;
            if (bpArmor) delete bpArmor.forgedPrecision;
            const sel = eqHost ? eqHost.querySelector("select.equip-slot-select") : null;
            o.selectDa = !!sel;
            if (sel) {
                sel.value = "ruestung_brustpanzer";
                sel.dispatchEvent(new Event("change", { bubbles: true }));
            }
            const hint = document.querySelector("#inventory-equip .mach-tor-hint");
            o.hint = hint ? hint.textContent : null;
            o.hintSichtbar = hint ? hint.getBoundingClientRect().width > 50 : false;
            const sel2 = document.querySelector("#inventory-equip select.equip-slot-select");
            o.selectZurueck = sel2 ? sel2.value === "" : null;
            return o;
        });
        await page.screenshot({ path: path.join(ART, "nachbau-ich.png") });

        // (c) STATUSBAR-LOCH-PROBE: Emotion an → Wort sichtbar (im Flow); Ruhe →
        // Fade (1.4 s), DANACH verlässt das Item den Flow (display:none) — die
        // End-Verhaltens-Probe wartet den Hide-Timer (1.5 s) ab.
        out.statusbar = await page.evaluate(async () => {
            const r = window.anazhRealm;
            const o = {};
            const lab = document.getElementById("status-emotion");
            const item = document.getElementById("status-emotion-item");
            for (const k of Object.keys(r.state.player.emotions)) r.state.player.emotions[k] = 0;
            r.state.player.emotions.joy = 0.9;
            r._updateEmotionFeedback();
            o.anText = lab ? lab.textContent : null;
            o.anBreite = item ? Math.round(item.getBoundingClientRect().width) : -1;
            o.anImFlow = item ? item.style.display !== "none" : false;
            for (const k of Object.keys(r.state.player.emotions)) r.state.player.emotions[k] = 0;
            r._updateEmotionFeedback();
            o.ruheOpacity = lab ? lab.style.opacity : null;
            await new Promise((res) => setTimeout(res, 1700));
            o.ruheBreiteNachFade = item ? Math.round(item.getBoundingClientRect().width) : -1;
            o.ruheAusDemFlow = item ? item.style.display === "none" : false;
            o.lochBeiRuhe = o.ruheBreiteNachFade > 8;
            // Wieder-Entzünden: das Item kehrt in den Flow zurück.
            r.state.player.emotions.joy = 0.9;
            r._updateEmotionFeedback();
            o.wiederImFlow = item
                ? item.style.display !== "none" && Math.round(item.getBoundingClientRect().width) > 8
                : false;
            for (const k of Object.keys(r.state.player.emotions)) r.state.player.emotions[k] = 0;
            r._updateEmotionFeedback();
            return o;
        });

        // ===== (d) WERKSTATT — Klon wählen → Warum-Zeile + Intent-Trio =====
        await page.click('#topbar .tab[data-tab="werkstatt"]');
        out.werkstatt = await page.evaluate(() => {
            const r = window.anazhRealm;
            const d = document.querySelector('.drawer[data-drawer="werkstatt"]');
            d.style.transition = "none";
            d.style.transform = "none";
            r.cloneBlueprint("baum_eiche", "nachbau_eiche");
            r.selectBlueprintForEdit("nachbau_eiche");
            const o = {};
            const why = document.querySelector(".spec-why-line");
            o.whyText = why ? why.textContent.slice(0, 90) : null;
            o.whySichtbar = why ? why.getBoundingClientRect().width > 80 : false;
            const intent = document.querySelector(".workshop-umwidmen-row");
            o.intentDa = !!intent;
            o.intentAkte = intent ? intent.querySelectorAll(".workshop-umwidmen-btn").length : 0;
            o.intentText = intent ? /⚒ Station/.test(intent.textContent || "") : false;
            o.intentImViewport = intent
                ? intent.getBoundingClientRect().right <= window.innerWidth + 1 &&
                  intent.getBoundingClientRect().left >= -1
                : false;
            delete r.state.blueprints.nachbau_eiche;
            return o;
        });
        await page.screenshot({ path: path.join(ART, "nachbau-werkstatt.png") });

        console.log(JSON.stringify(out, null, 2));
    } finally {
        await browser.close();
        server.kill();
    }
})();
