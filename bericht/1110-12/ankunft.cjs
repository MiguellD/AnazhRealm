// 1110-12 Nachtrag (Koordinator): DIE ANKUNFT — ab Seiten-Start die Zeit bis zum ersten fertigen Weltbild (`_weltbildDa` des
// Stamms: Boden-Ring, Buch, jeder Bau und Baum im Cull-Radius gezeichnet, Streu, Karten) und bis das Haus am Dorf (−53/−22)
// gezeichnet ist. Echter Chrome mit dem Hardware-Adapter (echteWebGpuArgs des Instruments), frisches Profil (Erst-Boot, kalte
// Platte), danach EIN Neuladen im selben Profil (Zweit-Boot, warme Platte). Die Spiel-Schleife läuft wie im Spiel; je 250 ms
// liest die Sonde den Stand (die Lücke des Ladeschirms mit Zeit).
//   node ankunft.cjs <instrument-root> <seite> <aus.json>
"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");
const [instr, seite, ausDatei] = process.argv.slice(2);
const puppeteer = require(require.resolve("puppeteer", { paths: [instr] }));
const { echteWebGpuArgs } = require(path.join(instr, "scripts/lib/software-gpu.cjs"));
const HAUS = { x: -53, z: -22 };
const DECKEL_MS = 300000;

const stand = () => {
    const r = window.anazhRealm;
    const st = r && r.state;
    const t = performance.now();
    if (!st) return { t, kein: true };
    // das nächste HAUS (Art des Rezepts im Buch) ≤ 20 m um −53/−22
    let haus = null;
    const buch = r._foundry && r._foundry.recipes ? r._foundry.recipes : {};
    for (const e of st.architectures || []) {
        if (!e || !e.position) continue;
        let preset = null;
        try {
            preset = typeof r._foundryPresetForEntry === "function" ? r._foundryPresetForEntry(e) : null;
        } catch (x) {
            preset = null;
        }
        const art = preset && buch[preset] ? buch[preset].kind : null;
        if (art !== "haus") continue;
        const d = Math.hypot(e.position.x - -53, e.position.z - -22);
        if (d <= 20 && (!haus || d < haus.d)) haus = { d: Math.round(d * 10) / 10, preset, gezeichnet: !!r._archIsRendered(e) };
    }
    let fehlt = null;
    try {
        fehlt = st._weltbildDa ? null : r._weltbildFehlt().join(" · ");
    } catch (e) {
        fehlt = "Fehler: " + String((e && e.message) || e).slice(0, 80);
    }
    const pm = st.playerMesh;
    return {
        t,
        da: st._weltbildDa || null,
        erste: st._weltbildErsteFrage || null,
        fehlt,
        haus,
        bauten: (st.architectures || []).length,
        spieler: pm ? [Math.round(pm.position.x), Math.round(pm.position.z)] : null,
    };
};

async function ladung(page, name) {
    const aus = { name, lauf: [], hausMs: null, daMs: null, ersteMs: null, letzteLuecke: null, spieler: null };
    let alt = null;
    const ende = Date.now() + DECKEL_MS;
    while (Date.now() < ende) {
        let s;
        try {
            s = await page.evaluate(stand);
        } catch (e) {
            s = { t: null, kein: true, fehler: String((e && e.message) || e).slice(0, 80) };
        }
        if (s && !s.kein) {
            const sig = s.fehlt || "—";
            if (sig !== alt) {
                aus.lauf.push({ ms: Math.round(s.t), fehlt: s.fehlt, haus: s.haus, bauten: s.bauten });
                alt = sig;
            }
            if (s.fehlt) aus.letzteLuecke = s.fehlt;
            if (s.haus && s.haus.gezeichnet && aus.hausMs == null) {
                aus.hausMs = Math.round(s.t);
                aus.haus = s.haus;
            }
            if (s.da && aus.daMs == null) aus.daMs = Math.round(s.da);
            if (s.erste) aus.ersteMs = Math.round(s.erste);
            aus.spieler = s.spieler;
            if (aus.daMs != null && aus.hausMs != null) break;
        }
        await new Promise((r) => setTimeout(r, 250));
    }
    return aus;
}

(async () => {
    const profil = path.join(os.tmpdir(), `ankunft-profil-${Date.now()}`);
    fs.mkdirSync(profil, { recursive: true });
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: profil,
        protocolTimeout: 600000,
        defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
        args: [...echteWebGpuArgs(), "--window-size=1940,1200"],
    });
    const out = { seite, start: new Date().toISOString(), ladungen: [] };
    try {
        const page = await browser.newPage();
        const fehler = [];
        page.on("pageerror", (e) => fehler.push(String((e && e.message) || e).slice(0, 120)));
        await page.goto(seite + "/index.html", { waitUntil: "domcontentloaded", timeout: 120000 });
        out.ladungen.push(await ladung(page, "erst"));
        await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
        out.ladungen.push(await ladung(page, "zweit"));
        out.seitenFehler = fehler.slice(0, 5);
        out.version = await page.evaluate(() => window.anazhRealm && window.anazhRealm.constructor.VERSION);
    } finally {
        await browser.close().catch(() => {});
        try {
            fs.rmSync(profil, { recursive: true, force: true, maxRetries: 5 });
        } catch (e) {
            /* das Profil bleibt liegen */
        }
    }
    fs.writeFileSync(ausDatei, JSON.stringify(out, null, 1));
    for (const l of out.ladungen)
        console.log(
            `${l.name}: Weltbild ${l.daMs != null ? (l.daMs / 1000).toFixed(1) + " s" : "—"} · Haus ${l.hausMs != null ? (l.hausMs / 1000).toFixed(1) + " s" : "—"} (${l.haus ? l.haus.d + " m, " + l.haus.preset : "kein Haus ≤ 20 m"}) · letzte Lücke ${l.letzteLuecke || "—"}`
        );
})().catch((e) => {
    console.error("ankunft-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
