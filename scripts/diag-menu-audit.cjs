// diag-menu-audit.cjs — die INVENTUR: pro Raum JEDES klickbare Feld (Knopf/Eingabe/Select/
// Drag/data-cmd), mit Sektion + Art + Label. Die Mess-Stufe vor der Menü-Planung („keine
// halben Sachen": erst Stand messen, dann pro Feld entscheiden wohin/warum).
//   node scripts/diag-menu-audit.cjs > /tmp/menu-audit.txt
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");
const URL = "http://127.0.0.1:4312/index.html";
const ROOMS = ["kreaturen", "spieler", "werkstatt", "bibliothek", "einstellungen"];

function startServer() {
    return new Promise((res, rej) => {
        const p = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        const to = setTimeout(() => rej(new Error("timeout")), 6000);
        p.stdout.on("data", (c) => /läuft/.test(c.toString()) && (clearTimeout(to), res(p)));
        p.on("error", rej);
    });
}
(async () => {
    const server = await startServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 900 });
        await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 12000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.player) &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        // Globales HUD (immer im Bild): Topbar + Statusbar + Konsole
        const audit = async (sel, label) => {
            const list = await page.evaluate((containerSel) => {
                const root = document.querySelector(containerSel);
                if (!root) return null;
                const sectionOf = (el) => {
                    let n = el;
                    while (n && n !== root) {
                        let p = n.previousElementSibling;
                        while (p) {
                            if (/^H[234]$/.test(p.tagName)) return (p.textContent || "").trim().slice(0, 28);
                            p = p.previousElementSibling;
                        }
                        n = n.parentElement;
                    }
                    return "—";
                };
                const out = [];
                const seen = new Set();
                const sels =
                    "button, input, select, textarea, a[href], [draggable='true'], [data-cmd], [role='button'], [contenteditable='true']";
                for (const el of root.querySelectorAll(sels)) {
                    if (seen.has(el)) continue;
                    seen.add(el);
                    const cs = getComputedStyle(el);
                    const vis = cs.display !== "none" && cs.visibility !== "hidden" && el.offsetParent !== null;
                    const tag = el.tagName.toLowerCase();
                    let kind = tag;
                    if (el.hasAttribute("data-cmd")) kind = "CMD";
                    else if (el.getAttribute("draggable") === "true") kind = "drag";
                    else if (tag === "input") kind = "input:" + (el.type || "text");
                    const label = (
                        el.getAttribute("data-cmd") ||
                        el.textContent ||
                        el.getAttribute("aria-label") ||
                        el.placeholder ||
                        el.id ||
                        el.value ||
                        ""
                    )
                        .trim()
                        .replace(/\s+/g, " ")
                        .slice(0, 36);
                    out.push({ k: kind, s: sectionOf(el), l: label, vis });
                }
                return out;
            }, sel);
            console.log(`\n===== ${label} (${sel}) =====`);
            if (!list) {
                console.log("  (nicht gefunden)");
                return;
            }
            console.log(`  ${list.length} klickbare Felder (${list.filter((x) => x.vis).length} sichtbar):`);
            const bySec = {};
            for (const e of list) (bySec[e.s] = bySec[e.s] || []).push(e);
            for (const [sec, els] of Object.entries(bySec)) {
                console.log(`  · [${sec}]`);
                for (const e of els) console.log(`      ${e.vis ? " " : "~"}${e.k.padEnd(11)} ${e.l}`);
            }
        };
        await audit("#topbar", "TOPBAR (global)");
        await audit("#console", "KONSOLE (global)");
        for (const room of ROOMS) {
            await page.evaluate((r) => {
                const tab = document.querySelector(`[data-tab="${r}"]`);
                if (tab) tab.click();
            }, room);
            await new Promise((r) => setTimeout(r, 900));
            const sel = room === "spieler" ? "#inventory-overlay" : `.drawer[data-drawer="${room}"]`;
            const label = {
                kreaturen: "HOF",
                spieler: "ICH",
                werkstatt: "WERKSTATT",
                bibliothek: "BIBLIOTHEK",
                einstellungen: "EINSTELLUNGEN",
            }[room];
            await audit(sel, label);
        }
    } finally {
        await browser.close();
        server.kill();
    }
})();
