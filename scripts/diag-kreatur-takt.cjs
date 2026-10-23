#!/usr/bin/env node
// diag-kreatur-takt.cjs — DIE KREATUR-LINSE (npm run gate:kreatur-takt): das Leben der Tiere am ECHTEN Takt.
// Die Proben wohnen in scripts/lib/kreatur-proben.cjs und rufen den ECHTEN Kreatur-Takt (updateCreatures); dieselbe
// Seiten-Funktion läuft hier headless (Null-Renderer, Produktions-Boot) und mit `--werkbank <port>` im sichtbaren
// Fenster der echten GPU (der Spiel-Loop ruht je Probe).
//   node scripts/diag-kreatur-takt.cjs [--proben a,b] [--alle] [--selftest] [--werkbank <port>]
//   --alle      jede Probe (auch die, deren Klasse noch nicht im Gate steht) — der Vorher-Lauf gegen die Basis
//   --selftest  je Gate-Probe jeder alte Defekt als Täter eingespielt (TAETER): jede Probe muss ROT lesen, und zwar aus
//               dem Grund, der den Täter beim Namen nennt
"use strict";
const { statikServer, starteBrowser, CODE_OF_SEITE, nullRenderer, ROOT: root } = require("./lib/welt-boot.cjs");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { KREATUR_PROBEN_SRC, PROBEN, TAETER, urteil } = require("./lib/kreatur-proben.cjs");

const PORT = Number(process.env.KREATUR_TAKT_PORT || 4478);
const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : d;
};
const SELBST = argv.includes("--selftest");
const WERKBANK = opt("--werkbank", null);
// DIE FESTE RAMPE (K16-Q): der Querhang misst auch an der Rampe der Prüfbühne (Station S2, ihre Spec) — die Welt wählt
// ihren Hang nach ihrem Bestand (im K16-Gelände 22,2° in der CI, lokal 22,2° oder 25,5°), die Rampe steht fest
const BUEHNE_DATEI = path.join(root, "spec", "pruefbuehne", "welt.json");
const RAMPE = (() => {
    const st = JSON.parse(
        fs.readFileSync(path.join(root, "spec", "pruefbuehne", "stationen.json"), "utf8")
    ).stationen.find((s) => s.id === "s2-hang30");
    if (!st || !Number.isFinite(st.winkel))
        throw new Error("die Rampe s2-hang30 fehlt in spec/pruefbuehne/stationen.json");
    return { id: st.id, x: st.x, z: st.z, winkel: st.winkel };
})();
// DAS GATE wächst je geschnittener Klasse: eine Probe steht hier, sobald ihr Schnitt im Stamm steht.
const GATE_PROBEN = PROBEN; // jede Probe steht im Gate: jede Klasse der Familie ist geschnitten
const gewaehlt = opt("--proben", null) ? opt("--proben").split(",") : argv.includes("--alle") ? PROBEN : GATE_PROBEN;

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
    const server = statikServer();
    await new Promise((r) => server.listen(PORT, r));
    const browser = await starteBrowser({ art: "null", frist: 900000 });
    const page = await browser.newPage();
    page.setDefaultTimeout(880000);
    const fehler = [];
    page.on("pageerror", (e) => fehler.push((e.stack || e.message).split("\n")[0]));
    await nullRenderer(page);
    const aus = [];
    // Einschwingen: die Welt steht (das EINE Einschwingen, welt-boot `__weltStehtNach`), die Boden-Funktion trägt.
    const einschwingen = () =>
        page.evaluate(() =>
            window.__weltStehtNach(() => {
                try {
                    window.anazhRealm._gameLoopTick(performance.now());
                } catch (_e) {}
            })
        );
    const lauf = (o) =>
        page.evaluate(
            (src, o) => {
                const fn = (0, eval)("(" + src + ")");
                return fn(window.anazhRealm, window.THREE, o);
            },
            KREATUR_PROBEN_SRC,
            o
        );
    const bereit = () =>
        page.waitForFunction(
            () =>
                window.anazhRealm &&
                typeof window.anazhRealm._gameLoopTick === "function" &&
                window.anazhRealm.state &&
                window.anazhRealm.state.voxelWorkerReady,
            { timeout: 120000 }
        );
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await bereit();
        await einschwingen();
        for (const l of laeufe) aus.push(await lauf(l));
        // EINE FREMDE WELT: frische Platte, die Welt aus json importiert und aktiv, neu geladen, eingeschwungen
        const fremdeWelt = async (json) => {
            await page.evaluate(() => {
                try {
                    localStorage.clear();
                } catch (_e) {
                    /* frische Platte */
                }
            });
            await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
            await page.waitForFunction(() => window.anazhRealm && window.anazhRealm.importWorldBeside, {
                timeout: 120000,
            });
            const id = await page.evaluate((json) => {
                const r = window.anazhRealm;
                const res = r.importWorldBeside(json);
                if (!res.ok) return null;
                r.activeWorldSet(res.worldId);
                return res.worldId;
            }, json);
            if (!id) throw new Error(`die Welt ${json.worldMeta.seed} ließ sich nicht importieren`);
            await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
            await bereit();
            const seed = await page.evaluate(() => window.anazhRealm.state.worldMeta.seed);
            if (seed !== json.worldMeta.seed)
                throw new Error(`die Welt ${json.worldMeta.seed} ist nicht aktiv (Seed ${seed})`);
            await einschwingen();
        };
        const mit = (probe) => laeufe.map((l, li) => [l, li]).filter(([l]) => l.proben.includes(probe));
        // DIE RAMPE DER PRÜFBÜHNE (K16-Q): jeder Lauf mit dem Querhang misst ihn ein zweites Mal an der festen Rampe — die
        // Bühne geboren wie im Spiel (importWorldBeside + aktiv + Reload, der Spieler am Fuß der Station), derselbe Täter
        if (mit("querhang").length) {
            const json = JSON.parse(fs.readFileSync(BUEHNE_DATEI, "utf8"));
            json.playerPosition = { x: RAMPE.x, y: 40, z: RAMPE.z - 8 };
            await fremdeWelt(json);
            for (const [l, li] of mit("querhang")) {
                const z = await lauf({ proben: ["querhang"], taeter: l.taeter, hangOrt: RAMPE });
                if (aus[li].querhang) aus[li].querhang.rampe = z.querhang || { fehler: "die Rampe lief nicht" };
            }
        }
        // DIE GEGENPROBE DES LEBENSRAUMS (Tiere K4): die Wildnis einer anderen Saat (die Bühnen-Datei ohne Erbgut und Bestand)
        if (mit("lebensraum").length) {
            const json = JSON.parse(fs.readFileSync(BUEHNE_DATEI, "utf8"));
            delete json.worldMeta.erbgut;
            Object.assign(json.worldMeta, {
                worldId: "lebensraum-gegen",
                slug: "lebensraum-gegen",
                seed: "lebensraum-gegen",
            });
            Object.assign(json, { architectures: [], creatures: [], playerPosition: { x: 0, y: 80, z: 0 } });
            await fremdeWelt(json);
            for (const [l, li] of mit("lebensraum")) {
                const z = await lauf({ proben: ["lebensraum"], taeter: l.taeter });
                if (aus[li].lebensraum) aus[li].lebensraum.gegen = z.lebensraum;
            }
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
            `if (!window.__fehlt) { ${CODE_OF_SEITE} } return await (${KREATUR_PROBEN_SRC})(r, T, ${JSON.stringify(l)});`
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
