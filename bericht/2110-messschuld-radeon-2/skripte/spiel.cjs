// spiel.cjs — Mess-Harness (Scratch, nicht im Baum): das echte Spiel im Fenster an der echten GPU,
// der Spiel-Loop läuft selbst (rAF), Eingabe per CDP, Ausgabe-Pfad aus scripts/lib/ausgabe-aufnahme.cjs.
const path = require("path");
const fs = require("fs");
const WT = "C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/mess-2110b";
const puppeteer = require(WT + "/node_modules/puppeteer");
const { echteWebGpuArgs } = require(WT + "/scripts/lib/software-gpu.cjs");
const { AUSGABE_INSTALL } = require(WT + "/scripts/lib/ausgabe-aufnahme.cjs");
const URL0 = process.env.SPIEL_URL || "http://localhost:7960";

async function oeffne({ profil, neu = true, vorDoc = [], headless = false } = {}) {
    if (profil && neu && fs.existsSync(profil)) fs.rmSync(profil, { recursive: true, force: true });
    if (profil) fs.mkdirSync(profil, { recursive: true });
    const browser = await puppeteer.launch({
        headless,
        userDataDir: profil || undefined,
        protocolTimeout: 3600000,
        defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
        args: [...echteWebGpuArgs(), "--window-size=1940,1200", "--autoplay-policy=no-user-gesture-required"],
    });
    const page = (await browser.pages())[0] || (await browser.newPage());
    const fehler = [];
    page.on("pageerror", (e) => fehler.push(String(e.message || e).split("\n")[0]));
    for (const f of vorDoc) await page.evaluateOnNewDocument(f);
    const t0 = Date.now();
    await page.goto(URL0 + "/index.html", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 300000;
        while (!(window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state._weltbildDa) && performance.now() < dl)
            await new Promise((r) => setTimeout(r, 250));
    });
    const bootMs = Date.now() - t0;
    await page.evaluate(AUSGABE_INSTALL);
    await page.bringToFront();
    const cdp = await page.target().createCDPSession();
    return { browser, page, cdp, fehler, bootMs };
}

const TASTEN = {
    w: ["KeyW", "w", 87], a: ["KeyA", "a", 65], s: ["KeyS", "s", 83], d: ["KeyD", "d", 68],
    shift: ["ShiftLeft", "Shift", 16], space: ["Space", " ", 32], v: ["KeyV", "v", 86],
    e: ["KeyE", "e", 69], f: ["KeyF", "f", 70], enter: ["Enter", "Enter", 13], t: ["KeyT", "t", 84],
};
async function taste(cdp, name, typ) {
    const [code, key, vk] = TASTEN[name];
    await cdp.send("Input.dispatchKeyEvent", { type: typ, code, key, windowsVirtualKeyCode: vk, text: typ === "keyDown" && key.length === 1 ? key : undefined });
}
async function tippe(cdp, ms, name) {
    await taste(cdp, name, "keyDown");
    await new Promise((r) => setTimeout(r, ms));
    await taste(cdp, name, "keyUp");
}
async function klick(cdp, x = 960, y = 540, button = "left") {
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button, clickCount: 1 });
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button, clickCount: 1 });
}
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = { oeffne, taste, tippe, klick, warte, WT, URL0 };
// DER KLANG wie der Spieler ihn einschaltet: der Knopf „Klang" (#anazh-symphony-toggle), per CDP-Klick an seiner Stelle
async function klangAn(page, cdp) {
    const box = await page.evaluate(() => {
        const t = document.getElementById("anazh-symphony-toggle");
        if (!t) return null;
        const b = t.getBoundingClientRect();
        return b.width > 0 && b.height > 0 ? { x: b.x + b.width / 2, y: b.y + b.height / 2 } : { versteckt: true };
    });
    if (box && !box.versteckt) await klick(cdp, box.x, box.y);
    else await page.evaluate(() => document.getElementById("anazh-symphony-toggle").click());
    await warte(500);
    return Object.assign({ weg: box && !box.versteckt ? "cdp-klick" : "dom-klick" }, await page.evaluate(() => ({ an: window.anazhRealm.state.symphony.enabled, ctx: window.anazhRealm.state.symphony.ctx && window.anazhRealm.state.symphony.ctx.state })));
}
module.exports.klangAn = klangAn;
