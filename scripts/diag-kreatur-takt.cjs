#!/usr/bin/env node
// diag-kreatur-takt.cjs — DIE KREATUR-LINSE (npm run gate:kreatur-takt): das Leben der Tiere am ECHTEN Takt.
// Die Proben wohnen in scripts/lib/kreatur-proben.cjs und rufen den ECHTEN Kreatur-Takt (updateCreatures); dieselbe
// Seiten-Funktion läuft hier headless (Null-Renderer, Produktions-Boot) und mit `--werkbank <port>` im sichtbaren
// Fenster der echten GPU.
//   node scripts/diag-kreatur-takt.cjs [--proben a,b] [--selftest] [--teil=k/n] [--werkbank <port>]
//   --selftest  je Probe jeder alte Defekt als Täter (TAETER): er muss sie ROT machen, beim Namen genannt
//   --teil=k/n  Teil k: die längste Probe (DAUER_S) zuerst in den leichtesten Teil, jede in GENAU einem
"use strict";
const { statikServer, CODE_OF_SEITE, werkbankRuf, teilAus, ROOT: root, hauptLauf, nullSeite, urteilEnde, argOpt: opt } = require("./lib/welt-boot.cjs"); // prettier-ignore
const fs = require("fs");
const path = require("path");
const { KREATUR_PROBEN_SRC, PROBEN, TAETER, EIN_LAUF, urteil } = require("./lib/kreatur-proben.cjs");

const PORT = Number(process.env.KREATUR_TAKT_PORT || 4478);
const argv = process.argv.slice(2);
const SELBST = argv.includes("--selftest");
const WERKBANK = opt("--werkbank", null);
// DER ORT der Probe (`--ort stadt-voll`: die volle Stadt der Probe bewohner, am Schirm des Profi-Bands) und seine Täter
const ORT = opt("--ort", null);
const taeterVon = (p) => TAETER[ORT ? `${p}@${ORT}` : p];
// DIE FESTE RAMPE der Prüfbühne (Station S2): jeder Lauf mit dem Querhang misst ihn dort ein zweites Mal, derselbe Täter
const BUEHNE_DATEI = path.join(root, "spec", "pruefbuehne", "welt.json");
const RAMPE = JSON.parse(
    fs.readFileSync(path.join(root, "spec", "pruefbuehne", "stationen.json"), "utf8")
).stationen.find((s) => s.id === "s2-hang30");
if (!RAMPE || !Number.isFinite(RAMPE.winkel))
    throw new Error("die Rampe s2-hang30 fehlt in spec/pruefbuehne/stationen.json");
// Sekunden je Probe samt Täter und fremder Welt, die Zeilen „Sekunden je Probe" ohne --teil (056330d8), unter 1 s zählt 1
const DAUER_S = {
    geister: 1,
    sattel: 1,
    reload: 1,
    huepfer: 1,
    wachsen: 1,
    gier: 5,
    jagd: 77,
    herde: 44,
    peer: 1,
    zufall: 1,
    nexus: 1,
    temperament: 1,
    abstand: 1,
    jagdkreis: 281,
    rudel: 7,
    querhang: 13,
    ferngang: 1,
    gestalt: 1,
    todlage: 1,
    bewohner: 660,
    begegnung: 10,
    tiersatz: 7,
    furcht: 31,
    lebensraum: 21,
    tagesbudget: 15,
    kaskade: 87,
    folgen: 42,
};
const TEIL = teilAus(argv);
const gewaehlt = (() => {
    const alle = opt("--proben", null) ? opt("--proben").split(",") : PROBEN;
    if (!TEIL) return alle;
    const last = Array.from({ length: TEIL.n }, () => ({ s: 0, p: [] }));
    for (const p of [...alle].sort((a, b) => DAUER_S[b] - DAUER_S[a])) {
        if (!(DAUER_S[p] > 0)) throw new Error(`--teil: ${p} ohne gemessene Dauer in DAUER_S — der Teil wäre geraten`);
        const g = last.reduce((m, x) => (x.s < m.s ? x : m));
        [g.s, g.p] = [g.s + DAUER_S[p], g.p.concat(p)];
    }
    return alle.filter((p) => last[TEIL.k - 1].p.includes(p));
})();

async function headless(laeufe) {
    const server = statikServer();
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 900000, viewport: ORT ? { width: 1920, height: 1080 } : undefined });
    page.setDefaultTimeout(880000);
    const [aus, dauer] = [[], {}];
    const zeit = async (p, fn) => {
        const t = Date.now();
        const z = await fn();
        dauer[p] = (dauer[p] || 0) + (Date.now() - t) / 1000;
        return z;
    };
    // das EINE Einschwingen (welt-boot `__weltStehtNach`)
    const einschwingen = () =>
        page.evaluate(() =>
            window.__weltStehtNach(() => {
                try {
                    window.anazhRealm._gameLoopTick(performance.now());
                } catch {}
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
    // die EINE Warte der Welt (welt-boot `__weltDa`): erwacht, dazu der Voxel-Worker
    const bereit = () => page.evaluate(() => window.__weltDa((r) => r.state.voxelWorkerReady));
    try {
        await server.zeige(page, 120000, "index.html", "networkidle0");
        await bereit();
        await einschwingen();
        for (const l of laeufe) aus.push(await zeit(l.proben[0], () => lauf(l)));
        // eine fremde Welt aus json: frische Platte, importiert, aktiv, geladen, eingeschwungen
        const fremdeWelt = async (json) => {
            await page.evaluate(() => localStorage.clear());
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
            if (!id) throw new Error(`${json.worldMeta.seed} ließ sich nicht importieren`);
            await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
            await bereit();
            const seed = await page.evaluate(() => window.anazhRealm.state.worldMeta.seed);
            if (seed !== json.worldMeta.seed) throw new Error(`${json.worldMeta.seed} ist nicht aktiv (Seed ${seed})`);
            await einschwingen();
        };
        const mit = (probe) => laeufe.map((l, li) => [l, li]).filter(([l]) => l.proben.includes(probe));
        if (mit("querhang").length) {
            const json = JSON.parse(fs.readFileSync(BUEHNE_DATEI, "utf8"));
            json.playerPosition = { x: RAMPE.x, y: 40, z: RAMPE.z - 8 };
            await zeit("querhang", () => fremdeWelt(json));
            for (const [l, li] of mit("querhang")) {
                const z = await zeit("querhang", () =>
                    lauf({ proben: ["querhang"], taeter: l.taeter, hangOrt: RAMPE })
                );
                if (aus[li].querhang) aus[li].querhang.rampe = z.querhang || { fehler: "die Rampe lief nicht" };
            }
        }
        // die Gegenprobe des Lebensraums (Tiere K4): die Wildnis anderer Saat
        if (mit("lebensraum").length) {
            const json = JSON.parse(fs.readFileSync(BUEHNE_DATEI, "utf8"));
            delete json.worldMeta.erbgut;
            Object.assign(json.worldMeta, {
                worldId: "lebensraum-gegen",
                slug: "lebensraum-gegen",
                seed: "lebensraum-gegen",
            });
            Object.assign(json, { architectures: [], creatures: [], playerPosition: { x: 0, y: 80, z: 0 } });
            await zeit("lebensraum", () => fremdeWelt(json));
            for (const [l, li] of mit("lebensraum")) {
                const z = await zeit("lebensraum", () => lauf({ proben: ["lebensraum"], taeter: l.taeter }));
                if (aus[li].lebensraum) aus[li].lebensraum.gegen = z.lebensraum;
            }
        }
    } finally {
        await browser.close();
        server.close();
    }
    return { aus, dauer };
}

async function imFenster(laeufe) {
    const aus = [];
    for (const l of laeufe) {
        const o = await werkbankRuf(Number(WERKBANK), "/eval", {
            code: `if (!window.__fehlt) { ${CODE_OF_SEITE} } return await (${KREATUR_PROBEN_SRC})(r, T, ${JSON.stringify(l)});`,
        });
        if (!o.ergebnis) throw new Error(o.fehler || o.roh);
        aus.push(o.ergebnis);
    }
    return { aus };
}

hauptLauf(async () => {
    if (!gewaehlt.length) throw new Error("keine Probe gewählt — ohne Messung ROT");
    // je Probe ein Lauf, mit --selftest je Täter ein eigener — die Probe mit EINEM Lauf (`EIN_LAUF`) spielt alle ihre Täter
    // in ihm und gibt je Täter seine Sicht (`sicht`); das Wort, das ihn nennt, bleibt in Node
    const [laeufe, faelle] = [[], []];
    if (SELBST) {
        const ohne = gewaehlt.filter((p) => !(taeterVon(p) && taeterVon(p).length));
        if (ohne.length) {
            console.log(`❌ SELBST-TEST: Proben ohne Täter: ${ohne.join(", ")} — die Linse wäre ungeprüft`);
            process.exit(1);
        }
    }
    for (const p of gewaehlt) {
        const [T, ein] = [SELBST ? taeterVon(p) : [[null]], SELBST && EIN_LAUF.includes(p)];
        if (ein) laeufe.push({ proben: [p], taeter: T.map(([t]) => t), ort: ORT });
        for (const [t, re] of T) faelle.push({ li: ein ? laeufe.length - 1 : laeufe.push({ proben: [p], taeter: t, ort: ORT }) - 1, t, re }); // prettier-ignore
    }
    const t0 = Date.now();
    const { aus, dauer } = WERKBANK ? await imFenster(laeufe) : await headless(laeufe);
    console.log(
        `\n===== DIE KREATUR-LINSE (gate:kreatur-takt) — ${WERKBANK ? "sichtbares Fenster, echte GPU (Werkbank :" + WERKBANK + ")" : "headless, Null-Renderer"}${SELBST ? " — SELBST-TEST (Täter eingespielt)" : ""} =====\n`
    );
    let rot = 0;
    for (const { li, t, re } of faelle) {
        const name = laeufe[li].proben[0];
        const e = aus[li][name];
        const z = e && e.sicht && e.sicht[t] ? { ...e, ...e.sicht[t] } : e;
        const u = urteil(name, z);
        const gruen = t ? !u.ok && re.test(u.grund) : u.ok;
        if (!gruen) rot++;
        console.log(`  ${u.ok ? "✅" : "❌"} ${name.padEnd(9)}${t ? ` [Täter ${t}]` : ""} ${JSON.stringify(z)}`);
        if (!u.ok) console.log(`       ↳ ${u.grund}`);
        if (t)
            console.log(
                `       ${
                    gruen
                        ? "✅ der Täter macht die Probe ROT und wird beim Namen genannt — die Linse sieht ihn"
                        : u.ok
                          ? "❌ der Täter bleibt unsichtbar — die Linse ist blind"
                          : `❌ rot, aber nicht aus seinem Grund (${re}) — die Linse nennt ihn nicht`
                }`
            );
    }
    const je = Object.entries(dauer || {}).map(([p, s]) => `${p}: ${Math.round(s)}`);
    console.log(
        `\n  (${((Date.now() - t0) / 1000).toFixed(0)} s)${je.length ? ` — Sekunden je Probe: ${je.join(", ")}` : ""}`
    );
    urteilEnde(
        rot,
        SELBST
            ? `\n❌ SELBST-TEST ROT — ${rot} Täter unsichtbar oder nicht beim Namen genannt.`
            : `\n❌ ROT — ${rot} Probe(n) verletzt: die Kreaturen tragen ihren Defekt.`,
        SELBST
            ? `\n✅ SELBST-TEST GRÜN — jeder Täter macht seine Probe rot und wird beim Namen genannt (${faelle.length} Täter).`
            : `\n✅ GRÜN — ${gewaehlt.join(" · ")}`
    );
});
