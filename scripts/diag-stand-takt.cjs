#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-stand-takt.cjs — IM STAND KOSTET DIE WELT NICHTS (Welle K, Lehre 25, Gebot 7). Befund 07.10. (OMEN, GTX 1060,
// Mess-Wiese, Regler voll, der Spieler STEHT): `_loopVoxelStreaming` 3,27 ms je Frame, dazu `tickArchitectureCulling`,
// `_tickArchitectureLOD`, `_lodTreeVisHeight` und noise2D im Selbstzeit-Top — gezählt an der Radeon (eingeschwungen):
// je Frame ~6 060 Einheiten (Ring 83, Stufen-Wahl 1 710, Cull 3 512, Streu 480, Nah-Streu 138, Nah-Wiese 6, Saum 128) und
// 0 Änderungen. Die Wand fährt die Fege-Takte an der Mess-Wiese (Null-Renderer, der Fern-Ring über seinen Haken, die
// Foundry an — der Produktions-Pfad) und zählt mit der Stand-Linse (scripts/lib/stand-linse.cjs, dieselbe wie `werkbank
// stand`) je Frame die Blatt-Rufe jedes Fege-Takts:
//   (R) RUHE — die Welt steht (der Spieler, das Auge, keine Ankunft): 0 Einheiten in jedem Frame der Ruhe;
//   (S) SCHARF + TREUE — derselbe Stand mit gebrochener Wache (`_standRuht` schläft nie, jeder Takt geht wie vor der
//       Welle): jeder Takt arbeitet (die Linse sieht ihn), und KEINER ändert die Welt (die Wache verschlief nichts);
//   (W) WECKEN — ein Baum entsteht im Stand: Cull und Stufen-Wahl gehen, der Baum trägt danach seine Stufe, die Wache
//       schläft wieder (0 Einheiten);
//   (G) GEHEN — W gehalten: Stufen-Wahlen, Cull und Nah-Streu arbeiten, der Spieler kommt voran — und Gehen kostet nur
//       die Änderung: in derselben Spieler-Zelle geht der Ring nicht, ohne neuen Anker des Fern-Rings der Saum nicht;
//   (T) STROM — nach der Ruhe ein Sprung an einen fremden Ort: der Spieler-Chunk steht (Streaming heilig, Lehre 13);
//   (C) CODE — jeder Fege-Takt fragt `_standRuht` und meldet `_standMeldet`; (P) kein Page-Error.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): ein Befund mit jedem Täter — Arbeit in Ruhe, stumpfe Linse,
// ein verschlafener Wechsel, ein Bau, der nicht weckt, starres Gehen, verhungernder Strom, ein Takt ohne Wache,
// Page-Error — MUSS rot fallen und ihn beim Namen nennen.
//   node scripts/diag-stand-takt.cjs [--selftest]   (npm run gate:stand-takt; Port STAND_TAKT_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const STAND = require("./lib/stand-linse.cjs");

const urteil = (b) => STAND.standUrteil(b);

function selbsttest() {
    const namen = Object.keys(STAND.TAKTE);
    const phase = (je, frames = 10, wirkt = 0) => ({
        frames,
        summe: je * namen.length * frames,
        takte: Object.fromEntries(
            namen.map((n) => [n, { summe: je * frames, mittel: je, max: je, mitArbeit: je > 0 ? frames : 0, wirkt }])
        ),
    });
    const gruen = {
        ruhe: phase(0, 30),
        bruch: phase(40, 6),
        gehen: (() => {
            const g = Object.assign(phase(30, 40), { weg: 6.2, zelleGleich: true, ankerGleich: true });
            Object.assign(g.takte.strom, { summe: 0, mittel: 0, max: 0, mitArbeit: 0 });
            Object.assign(g.takte.deckWache, { summe: 0, mittel: 0, max: 0, mitArbeit: 0 });
            return g;
        })(),
        wecken: {
            eintrag: true,
            versorgt: true,
            phase: phase(25, 30),
            nachher: phase(0, 20),
            treue: phase(40, 6),
            regler: phase(12, 10),
        },
        strom: { spielerChunk: true, x: -300, z: -850, takte: 40 },
        code: Object.fromEntries(namen.map((n) => [n, { fragt: true, meldet: true }])),
        pageErrors: [],
    };
    const klon = () => JSON.parse(JSON.stringify(gruen));
    const fehler = [];
    const v0 = urteil(klon());
    if (v0.length) fehler.push("der grüne Befund fällt rot: " + v0.join(" · "));
    console.log(`  ${v0.length ? "❌" : "✅"} Selbsttest grün → ${v0.join(" · ") || "grün"}`);
    const faelle = [
        [
            "der Cull-Gang in Ruhe (die Basis)",
            (b) => Object.assign(b.ruhe.takte.archCull, { summe: 105360, mittel: 3512, max: 3512, mitArbeit: 30 }),
            /RUHE: archCull \(tickArchitectureCulling\) arbeitet im Stand — 105360 Einheiten in 30 von 30 Frames/,
        ],
        [
            "ein Ausreißer der Saum-Wache in Ruhe",
            (b) => Object.assign(b.ruhe.takte.deckWache, { summe: 128, mittel: 4.27, max: 128, mitArbeit: 1 }),
            /RUHE: deckWache .* 128 Einheiten in 1 von 30 Frames/,
        ],
        [
            "stumpfe Linse (die Nah-Wiese zählt nichts)",
            (b) => Object.assign(b.bruch.takte.nahWiese, { summe: 0, mittel: 0, max: 0, mitArbeit: 0 }),
            /STUMPF: .* für nahWiese keine Arbeit/,
        ],
        [
            "die Wache verschlief einen Wechsel",
            (b) => (b.bruch.takte.archLod.wirkt = 3),
            /TREUE: archLod \(_tickArchitectureLOD\) änderte mit gebrochener Wache nach der Ruhe die Welt in 3 Gängen/,
        ],
        [
            "ein Bau weckt den Cull nicht",
            (b) => Object.assign(b.wecken.phase.takte.archCull, { summe: 0, mitArbeit: 0 }),
            /WECKEN: ein Bau im Stand weckt archCull nicht/,
        ],
        ["der Bau bleibt ohne Stufe", (b) => (b.wecken.versorgt = false), /WECKEN: der neue Bau trägt/],
        [
            "die Wache verschlief die Stufe des neuen Baums",
            (b) => (b.wecken.treue.takte.archLod.wirkt = 1),
            /TREUE: archLod .* nach dem Bau die Welt in 1 Gängen/,
        ],
        [
            "ein Regler-Schritt weckt den Cull nicht",
            (b) => Object.assign(b.wecken.regler.takte.archCull, { summe: 0, mitArbeit: 0 }),
            /WECKEN: ein Regler-Schritt \(der Cull-Radius\) weckt archCull nicht/,
        ],
        [
            "nach dem Bau schläft die Wache nicht",
            (b) => (b.wecken.nachher = Object.assign(phase(0, 20), { summe: 7020 })),
            /WECKEN: nach dem Bau schläft die Wache nicht wieder \(7020/,
        ],
        [
            "starres Gehen (der Cull hält)",
            (b) => Object.assign(b.gehen.takte.archCull, { summe: 0, mitArbeit: 0 }),
            /STARR: beim Gehen arbeitet archCull nicht/,
        ],
        [
            "der Ring geht beim Gehen in derselben Zelle",
            (b) => Object.assign(b.gehen.takte.strom, { summe: 2490, mitArbeit: 30 }),
            /GEHEN: der Ring geht ohne Zellen-Wechsel \(2490 Einheiten\)/,
        ],
        [
            "der Saum geht beim Gehen ohne neuen Anker",
            (b) => Object.assign(b.gehen.takte.deckWache, { summe: 3840, mitArbeit: 30 }),
            /GEHEN: der Saum geht ohne neuen Anker \(3840 Einheiten\)/,
        ],
        ["Gehen ohne Weg", (b) => (b.gehen.weg = 0.2), /BEWEGUNG: beim Gehen kam der Spieler 0.2 m voran/],
        [
            "das Streaming verhungert nach der Ruhe",
            (b) => (b.strom.spielerChunk = false),
            /STROM: nach dem Sprung an \(-300, -850\) steht der Spieler-Chunk nach 40 Takten nicht/,
        ],
        [
            "ein Takt fragt die Wache nicht",
            (b) => (b.code.streuLod.fragt = false),
            /CODE: _tickScatterLod fragt die Stand-Wache nicht/,
        ],
        [
            "ein Takt meldet seinen Gang nicht",
            (b) => (b.code.nahStreu.meldet = false),
            /CODE: _tickNahStreu meldet seinen Gang nicht/,
        ],
        ["keine Ruhe", (b) => delete b.ruhe, /LEER: keine Ruhe-Phase/],
        ["keine Bruch-Phase", (b) => delete b.bruch, /LEER: keine Bruch-Phase/],
        ["Page-Error", (b) => b.pageErrors.push("TypeError: x"), /PAGE-ERROR: TypeError: x/],
    ];
    for (const [name, tat, muss] of faelle) {
        const b = klon();
        tat(b);
        const v = urteil(b);
        const ok = v.some((x) => muss.test(x));
        if (!ok) fehler.push(`${name}: die Wand nennt den Täter nicht (${muss})`);
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${name}" → rot: ${v.join(" · ") || "(nichts)"}`);
    }
    if (fehler.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist vakuös: " + fehler.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — jeder injizierte Täter fällt rot und wird beim Namen genannt.");
}

if (process.argv.includes("--selftest")) {
    console.log("=== STAND-TAKT — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.STAND_TAKT_PORT) || 4528;
const MESS = { x: -900, z: -850 };
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
    ".wasm": "application/wasm",
};
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

(async () => {
    console.log("=== STAND-TAKT (Welle K) — Null-Renderer, Mess-Wiese, die Stand-Linse je Frame ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 600000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(580000);
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__anazhFernRing = true; // der Fern-Ring (die Saum-Wache) läuft auch ohne GPU — sein Haken
        window.__anazhAutoSettlement = false; // kein Start-Dorf: was es baut, hinge an der Bildrate (die Mess-Bühne)
        window.__codeOf = (fnOrSrc) =>
            String(fnOrSrc)
                .replace(/\/\/.*$/gm, "")
                .replace(/\/\*[\s\S]*?\*\//g, "");
    });
    let befund = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        await page.evaluate(STAND.STAND_INSTALL);
        befund = await page.evaluate(
            async (MESS, TAKTE) => {
                const r = window.anazhRealm,
                    st = r.state;
                const P = Object.getPrototypeOf(r);
                const pause = (ms) => new Promise((ok) => setTimeout(ok, ms || 0));
                let t = performance.now();
                const takt = () => {
                    t += 1000 / 60;
                    try {
                        r._gameLoopTick(t);
                    } catch (_e) {}
                };
                const foundryOffen = () => {
                    const f = r._foundry;
                    return (f && f.pending ? f.pending.size : 0) + (f && f.warte ? f.warte.length : 0);
                };
                // einschwingen: der Ring steht, kein Worker-Auftrag offen, die Foundry-Schlange leer
                const schwinge = async (max) => {
                    let stabil = 0,
                        last = -1;
                    for (let i = 0; i < (max || 6000); i++) {
                        takt();
                        const sz = st.voxelChunks ? st.voxelChunks.size : 0;
                        if (sz === last) stabil++;
                        else {
                            stabil = 0;
                            last = sz;
                        }
                        const offen = (st.voxelMeshPending && st.voxelMeshPending.size > 0) || foundryOffen() > 0;
                        if (i > 60 && stabil > 80 && !offen) break;
                        if (i % 5 === 0) await pause(10);
                    }
                    return last;
                };
                // Der Regler hält (die Mess-Bühne, wie `werkbank stand --regler voll`): headless folgt der Cull-Radius dem
                // PID Frame für Frame ohne die Grenzzyklus-Wand des Spiels (`_nexusPerfActuate`) — ein atmender Radius ist
                // eine echte Eingabe der Wache (er weckt sie, Phase W prüft es), aber kein Stand.
                st.perfRegulator = false;
                st.playerMesh.position.set(MESS.x, r._voxelSurfaceY(MESS.x, MESS.z) + 1.8, MESS.z);
                const ring = await schwinge();
                const aus = { ring, architekturen: (st.architectures || []).length, code: {} };
                const L = window.__standLinseAn();
                const summe = (f) => Object.keys(TAKTE).reduce((a, n) => a + (f[n] | 0), 0);
                // bis die Wache schläft (höchstens n Takte; ein Takt, der nie schläft, fällt in der Ruhe rot)
                const bisRuhe = async (n) => {
                    let still = 0,
                        i = 0;
                    L.frame();
                    for (; i < n && still < 30; i++) {
                        takt();
                        still = summe(L.frame()) === 0 ? still + 1 : 0;
                        if (i % 10 === 0) await pause(5);
                    }
                    return i;
                };
                const phase = async (n, schritt) => {
                    const fs = [];
                    L.frame();
                    for (let i = 0; i < n; i++) {
                        if (schritt) schritt(i);
                        takt();
                        fs.push(L.frame());
                        if (i % 10 === 0) await pause(5);
                    }
                    return window.__standPhase(fs);
                };
                aus.bisRuhe = await bisRuhe(900);
                // (R) RUHE
                aus.ruhe = await phase(30);
                // (S) SCHARF + TREUE: die Wache gebrochen — jeder Takt geht, keiner wirkt
                const ruheRuf = P._standRuht;
                P._standRuht = function (...a) {
                    ruheRuf.apply(this, a);
                    return false;
                };
                try {
                    aus.bruch = await phase(6);
                } finally {
                    P._standRuht = ruheRuf;
                }
                await bisRuhe(300);
                // (W) WECKEN: ein Baum entsteht im Stand
                {
                    const pm = st.playerMesh.position;
                    const x = pm.x + 14,
                        z = pm.z + 9;
                    const e = r.spawnArchitecture("baum_eiche", { x, y: r._voxelSurfaceY(x, z), z }, { rotationY: 0 });
                    const W = { eintrag: !!e };
                    W.phase = await phase(30);
                    W.versorgt = !!e && (Number.isFinite(e._lodLevel) || !!e.mesh || !!e._ziegelSlot);
                    W.stufe = e ? e._lodLevel : null;
                    W.bisRuhe = await bisRuhe(600);
                    W.nachher = await phase(20);
                    // die Treue nach dem Bau: die gebrochene Wache findet nichts, was die schlafende verschlief
                    P._standRuht = function (...a) {
                        ruheRuf.apply(this, a);
                        return false;
                    };
                    try {
                        W.treue = await phase(6);
                    } finally {
                        P._standRuht = ruheRuf;
                    }
                    W.stufeRuhe = e ? e._lodLevel : null;
                    await bisRuhe(300);
                    // ein Regler-Schritt (der Cull-Radius 20 m enger) weckt den Cull-Gang, er räumt den Rand
                    const rad = st.architectureCullingRadius;
                    st.architectureCullingRadius = rad - 20;
                    W.regler = await phase(10);
                    st.architectureCullingRadius = rad;
                    await bisRuhe(600);
                    aus.wecken = W;
                }
                // (G) GEHEN: W gehalten
                {
                    const p0 = st.playerMesh.position.clone();
                    const span = r._voxelChunkConfig(0).span;
                    const zelle = (p) => Math.floor(p.x / span) + "," + Math.floor(p.z / span);
                    const z0 = zelle(p0);
                    const g0 = st.fernRing ? st.fernRing.gen | 0 : -1;
                    st.keys = { w: true };
                    try {
                        aus.gehen = await phase(120);
                    } finally {
                        st.keys = {};
                    }
                    const p1 = st.playerMesh.position;
                    aus.gehen.weg = +Math.hypot(p1.x - p0.x, p1.z - p0.z).toFixed(2);
                    aus.gehen.zelleGleich = zelle(p1) === z0;
                    aus.gehen.ankerGleich = (st.fernRing ? st.fernRing.gen | 0 : -1) === g0;
                }
                // (T) STROM: erst Ruhe, dann der Sprung an einen fremden Ort — der Spieler-Chunk muss kommen
                {
                    await bisRuhe(900);
                    const x = MESS.x + 600,
                        z = MESS.z;
                    st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
                    const span = r._voxelChunkConfig(0).span;
                    const key = `${Math.floor(x / span)},${Math.floor(z / span)}`;
                    let n = 0;
                    for (; n < 600; n++) {
                        takt();
                        if (st.voxelChunks && st.voxelChunks.has(key)) break;
                        if (n % 5 === 0) await pause(10);
                    }
                    aus.strom = { x, z, takte: n, spielerChunk: !!(st.voxelChunks && st.voxelChunks.has(key)) };
                }
                L.aus();
                const code = (f) => (typeof f === "function" ? window.__codeOf(f) : "");
                for (const [n, m] of Object.entries(TAKTE)) {
                    const c = code(P[m]);
                    aus.code[n] = {
                        fragt: c.includes(`this._standRuht("${n}"`),
                        meldet: c.includes(`this._standMeldet("${n}"`),
                    };
                }
                aus.wache =
                    st && r._standWache ? [...r._standWache.takte].map(([n, x]) => [n, x.ruht, x.arbeit]) : null;
                return aus;
            },
            MESS,
            STAND.TAKTE
        );
    } catch (e) {
        befund = { fehler: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();
    if (!befund || befund.fehler) {
        console.log("❌ LAUF-FEHLER: " + (befund ? befund.fehler : "kein Befund"));
        process.exit(1);
    }
    befund.pageErrors = pageErrors;
    const namen = Object.keys(STAND.TAKTE);
    const zeile = (n, x) =>
        `  ${n.padEnd(8)} ${x.frames} Frames · Σ ${x.summe} Einheiten · ` +
        namen.map((k) => `${k} ${x.takte[k] ? x.takte[k].mittel : "?"}`).join(" · ") +
        (namen.some((k) => x.takte[k] && x.takte[k].wirkt > 0)
            ? " · wirkt " + namen.map((k) => `${k} ${x.takte[k].wirkt}`).join(" ")
            : "");
    console.log(
        `  Ring ${befund.ring} Chunks · ${befund.architekturen} Bauten · die Wache schlief nach ${befund.bisRuhe} Takten`
    );
    for (const n of ["ruhe", "bruch", "gehen"]) if (befund[n]) console.log(zeile(n, befund[n]));
    if (befund.gehen) console.log(`  Gehen: ${befund.gehen.weg} m`);
    const W = befund.wecken;
    if (W) {
        console.log(
            `  Wecken: Baum ${W.eintrag ? "steht" : "fehlt"} (Stufe ${W.stufe}, in Ruhe ${W.stufeRuhe}), schläft wieder nach ${W.bisRuhe} Takten`
        );
        if (W.treue) console.log(zeile("treue", W.treue));
        if (W.phase) console.log(zeile("wecken", W.phase));
        if (W.nachher) console.log(zeile("nachher", W.nachher));
        if (W.regler) console.log(zeile("regler", W.regler));
    }
    if (befund.strom)
        console.log(
            `  Strom: Sprung an (${befund.strom.x}, ${befund.strom.z}) — Spieler-Chunk ${befund.strom.spielerChunk ? "steht" : "FEHLT"} nach ${befund.strom.takte} Takten`
        );
    if (befund.wache) console.log(`  Wache (Takt, geschlafen, Einheiten): ${JSON.stringify(befund.wache)}`);
    const v = urteil(befund);
    if (v.length) {
        console.log("\n❌ STAND-TAKT ROT:\n  " + v.join("\n  "));
        process.exit(1);
    }
    console.log(
        "\n✅ STAND-TAKT GRÜN — im Stand geht kein Fege-Takt, die gebrochene Wache findet nichts Verschlafenes, ein Bau weckt, Gehen und Strom arbeiten."
    );
})();
