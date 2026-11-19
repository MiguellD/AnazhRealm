// SPIKE KOPPLUNG — die Bühne: der headless Stamm der Brand-Linse (Null-Renderer, scripts/lib/welt-boot.cjs, die Familie von
// scripts/lib/stand-linse.cjs). Der Statik-Server liefert im Modus "gesetz"/"fest" an Stelle jedes Originals seine Kopie aus dem
// Temp-Ordner (der EINE Haken `wandle` des Servers); im Modus "vorher" die Originale von main. Danach läuft die Seiten-Bibliothek
// (seite.js, als `window.__spike`) und die Probe des Falls. Die Wanduhr des Laufs steht im Ergebnis (Soll ≤ 60 s).
"use strict";
const fs = require("fs");
const path = require("path");
const { bauKopien, REPO } = require("./kopien.cjs");
const { statikServer, nullWelt, warteAufWelt } = require(path.join(REPO, "scripts/lib/welt-boot.cjs"));
const { messort } = require(path.join(REPO, "scripts/lib/welt-orte.cjs"));

async function buehne(modus, probe, arg) {
    const t0 = Date.now();
    const K = bauKopien(modus);
    const geliefert = new Set();
    const server = statikServer({
        wandle: (p, roh) => {
            const f = K.karte[p];
            if (!f) return roh;
            geliefert.add(p);
            return fs.readFileSync(f);
        },
    });
    const fehler = [];
    let browser;
    try {
        const s = await nullWelt(server, { port: 0, frist: 120000 }, 60000, "index.html", "networkidle0");
        browser = s.browser;
        const page = s.page;
        page.on("pageerror", (e) => fehler.length < 20 && fehler.push(String(e && e.message ? e.message : e).slice(0, 300)));
        page.setDefaultTimeout(55000);
        await warteAufWelt(page, 50000);
        await page.evaluate(fs.readFileSync(path.join(__dirname, "seite.js"), "utf8"));
        const MESS = messort("wiese");
        // der Spieler steht am Ort des Falls (`arg.spieler`), sonst an der Mess-Wiese: dort baut main seinen Ring (Bett, Karten)
        const boot = await page.evaluate((M) => window.__spike.boot(M), (arg && arg.spieler) || { x: MESS.x, z: MESS.z });
        const bootMs = Date.now() - t0;
        const aus = await page.evaluate(probe, Object.assign({ MESS: { x: MESS.x, z: MESS.z }, modus }, arg || {}));
        return {
            modus,
            kopien: Object.keys(K.karte).length,
            geliefert: [...geliefert].sort(),
            ersetzungen: K.log.map((e) => e.datei + ":" + e.name),
            boot,
            bootMs,
            wandMs: Date.now() - t0,
            seitenFehler: fehler,
            aus,
        };
    } finally {
        if (browser) await browser.close().catch(() => {});
        server.close && server.close();
        if (K.ordner) fs.rmSync(K.ordner, { recursive: true, force: true });
    }
}

// Ein Lauf als Kommando: node <fall>.cjs <modus> → JSON auf stdout, Fehler laut (Exit 1)
function lauf(probe, argFn) {
    const modus = process.argv[2] || "gesetz";
    const arg = argFn ? argFn(process.argv.slice(3)) : {};
    const wache = setTimeout(() => {
        console.log(JSON.stringify({ modus, fehler: "Wanduhr > 60 s — abgebrochen" }));
        process.exit(2);
    }, 60000);
    buehne(modus, probe, arg).then(
        (r) => {
            clearTimeout(wache);
            console.log(JSON.stringify(r, null, 1));
            process.exit(0);
        },
        (e) => {
            clearTimeout(wache);
            console.log(JSON.stringify({ modus, fehler: String(e && e.stack ? e.stack : e).slice(0, 2000) }));
            process.exit(1);
        }
    );
}

module.exports = { buehne, lauf };
