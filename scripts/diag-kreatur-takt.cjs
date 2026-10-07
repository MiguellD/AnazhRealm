#!/usr/bin/env node
// diag-kreatur-takt.cjs — DIE KREATUR-LINSE der Welle L (npm run gate:kreatur-takt). Befund der Leben-Prüfung 06.10.
// (sichtbar gespielt auf der Radeon): die Tiere laufen im Krebsgang (niemand schreibt rotation.y), hüpfen in 21–26 %
// ihrer Frames (ein Würfel je Frame, feste 0,05 s), clearCreatures lässt jedes zweite Tier als Geist stehen, die Geburt
// steht 12–25 m vor dem Spieler, die Beute flieht nie vor dem Jäger, die Witterungs-Jagd läuft auf vier Achsen, und
// jedes Tier im Bild zieht je Frame einen Feld-Strahl (29–37 % der CPU). Keine alte Linse sah es: sie setzten die Gier
// von Hand (diag-tier-gang) oder liefen jenseits des Strahls (diag-tier-separation).
//
// Die Proben wohnen in scripts/lib/kreatur-proben.cjs und rufen den ECHTEN Kreatur-Takt (updateCreatures); dieselbe
// Seiten-Funktion läuft hier headless (Null-Renderer, Produktions-Boot) und mit `--werkbank <port>` im sichtbaren
// Fenster der echten GPU (der Spiel-Loop ruht je Probe).
//   node scripts/diag-kreatur-takt.cjs [--proben a,b] [--alle] [--selftest] [--werkbank <port>]
//   --alle      jede Probe (auch die, deren Klasse noch nicht im Gate steht) — der Vorher-Lauf gegen die Basis
//   --selftest  je Gate-Probe jeder alte Defekt als Täter eingespielt (TAETER): jede Probe muss ROT lesen, und zwar aus
//               dem Grund, der den Täter beim Namen nennt
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { KREATUR_PROBEN_SRC, PROBEN, TAETER, CODE_OF_SRC, urteil } = require("./lib/kreatur-proben.cjs");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.KREATUR_TAKT_PORT || 4478);
const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : d;
};
const SELBST = argv.includes("--selftest");
const WERKBANK = opt("--werkbank", null);
// DAS GATE wächst je geschnittener Klasse: eine Probe steht hier, sobald ihr Schnitt im Stamm steht.
const GATE_PROBEN = PROBEN; // jede Probe steht im Gate: jede Klasse der Familie ist geschnitten
const gewaehlt = opt("--proben", null) ? opt("--proben").split(",") : argv.includes("--alle") ? PROBEN : GATE_PROBEN;

const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};

function rufeWerkbank(code) {
    return new Promise((res, rej) => {
        const body = JSON.stringify({ code });
        const req = http.request(
            {
                host: "127.0.0.1",
                port: Number(WERKBANK),
                path: "/eval",
                method: "POST",
                headers: { "Content-Type": "application/json" },
            },
            (r) => {
                let d = "";
                r.on("data", (c) => (d += c));
                r.on("end", () => {
                    try {
                        res(JSON.parse(d));
                    } catch (_e) {
                        rej(new Error("Werkbank-Antwort: " + d.slice(0, 300)));
                    }
                });
            }
        );
        req.on("error", rej);
        req.setTimeout(0);
        req.end(body);
    });
}

async function headless(laeufe) {
    const server = http.createServer((req, res) => {
        let p = req.url.split("?")[0];
        if (p === "/") p = "/index.html";
        const fp = path.join(root, p);
        if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            if (err) return ((res.statusCode = 404), res.end());
            res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 900000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(880000);
    const fehler = [];
    page.on("pageerror", (e) => fehler.push((e.stack || e.message).split("\n")[0]));
    await page.evaluateOnNewDocument((codeOf) => {
        window.__anazhHeadlessNullRenderer = true;
        window.__codeOf = (0, eval)("(" + codeOf + ")");
    }, CODE_OF_SRC);
    const aus = [];
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        // Einschwingen (plateau-basiert, die V18.273-Lehre): der Ring steht, die Boden-Funktion trägt.
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            let last = -1,
                stabil = 0;
            for (let t = 0; t < 3000; t++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const n = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (n === last) stabil++;
                else {
                    stabil = 0;
                    last = n;
                }
                if (n > 20 && stabil > 40) break;
                if (t % 10 === 0) await new Promise((res) => setTimeout(res, 0));
            }
        });
        for (const l of laeufe) {
            const z = await page.evaluate(
                (src, o) => {
                    const fn = (0, eval)("(" + src + ")");
                    return fn(window.anazhRealm, window.THREE, o);
                },
                KREATUR_PROBEN_SRC,
                l
            );
            aus.push(z);
        }
    } finally {
        await browser.close();
        server.close();
    }
    return { aus, fehler };
}

async function imFenster(laeufe) {
    const aus = [];
    for (const l of laeufe) {
        const o = await rufeWerkbank(
            `window.__codeOf = window.__codeOf || (${CODE_OF_SRC}); return await (${KREATUR_PROBEN_SRC})(r, T, ${JSON.stringify(l)});`
        );
        if (o.fehler) throw new Error(o.fehler);
        aus.push(o.ergebnis);
    }
    return { aus, fehler: [] };
}

(async () => {
    if (!gewaehlt.length) {
        console.log("gate:kreatur-takt — noch keine Probe im Gate (GATE_PROBEN leer); --alle fährt jede Probe.");
        process.exit(0);
    }
    // Der Selbsttest: je Probe jeder ihrer Täter in einem eigenen Lauf; das Wort, das ihn nennt, bleibt in Node.
    const nennt = [];
    const laeufe = SELBST
        ? gewaehlt.flatMap((p) =>
              (TAETER[p] || []).map(([t, re]) => {
                  nennt.push(re);
                  return { proben: [p], taeter: t };
              })
          )
        : [{ proben: gewaehlt }];
    if (SELBST) {
        const ohne = gewaehlt.filter((p) => !(TAETER[p] && TAETER[p].length));
        if (ohne.length) {
            console.log(`❌ SELBST-TEST: Proben ohne Täter: ${ohne.join(", ")} — die Linse wäre ungeprüft`);
            process.exit(1);
        }
    }
    const t0 = Date.now();
    const { aus, fehler } = WERKBANK ? await imFenster(laeufe) : await headless(laeufe);
    console.log(
        `\n===== DIE KREATUR-LINSE (gate:kreatur-takt) — ${WERKBANK ? "sichtbares Fenster, echte GPU (Werkbank :" + WERKBANK + ")" : "headless, Null-Renderer"}${SELBST ? " — SELBST-TEST (Täter eingespielt)" : ""} =====\n`
    );
    let rot = 0;
    const zeilen = [];
    aus.forEach((erg, li) => {
        for (const name of laeufe[li].proben) {
            const z = erg[name];
            const u = urteil(name, z);
            zeilen.push({ name, z, u });
            const gruen = SELBST ? !u.ok && nennt[li].test(u.grund) : u.ok;
            if (!gruen) rot++;
            const marke = u.ok ? "✅" : "❌";
            const wer = SELBST ? ` [Täter ${laeufe[li].taeter}]` : "";
            console.log(`  ${marke} ${name.padEnd(9)}${wer} ${JSON.stringify(z)}`);
            if (!u.ok) console.log(`       ↳ ${u.grund}`);
            if (SELBST)
                console.log(
                    `       ${
                        gruen
                            ? "✅ der Täter macht die Probe ROT und wird beim Namen genannt — die Linse sieht ihn"
                            : u.ok
                              ? "❌ der Täter bleibt unsichtbar — die Linse ist blind"
                              : `❌ rot, aber nicht aus seinem Grund (${nennt[li]}) — die Linse nennt ihn nicht`
                    }`
                );
        }
    });
    if (fehler.length) {
        console.log(`\n  ❌ Seiten-Fehler: ${fehler.slice(0, 3).join(" | ")}`);
        rot++;
    }
    console.log(`\n  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    if (rot) {
        console.log(
            SELBST
                ? `\n❌ SELBST-TEST ROT — ${rot} Täter unsichtbar oder nicht beim Namen genannt.`
                : `\n❌ ROT — ${rot} Probe(n) verletzt: die Kreaturen tragen ihren Defekt.`
        );
        process.exit(1);
    }
    console.log(
        SELBST
            ? `\n✅ SELBST-TEST GRÜN — jeder Täter macht seine Probe rot und wird beim Namen genannt (${zeilen.length} Täter).`
            : `\n✅ GRÜN — ${zeilen.map((z) => z.name).join(" · ")}`
    );
    process.exit(0);
})().catch((e) => {
    console.error("KREATUR-LINSE-FEHLER:", e);
    process.exit(1);
});
