// diag-werkstatt-weg.cjs — DIE WERKSTATT-WEG-LINSE (Welle L Folge, v1-Schritte 3–4: in der Werkstatt bauen, mit der KI
// erschaffen). Die Defekte, die die sichtbare Leben-Schau am 07.10. auf dem v1-Pfad fand
// (artifacts/profiband/leben-schau/befund-v1-pfad.md), je beim NAMEN. Jede Probe ruft den Chokepoint selbst im echten Boot
// (headless, foundry-ON, Null-Renderer der Welt) und misst seine Wirkung.
//
//   D10 — DER SAME EINES SATZES: „pflanz mir einen eichenhain", „setze insel hier", „baue fraktal tempel" und ein KI-Programm
//     ohne Seed ziehen ihre Welt-Substanz (Same, Streuung, Drehung, Größe) aus dem Welt-Strom (`_bauSame`, Γ5), nie aus
//     Math.random. Gemessen: Math.random-Züge je Satz (Befund: Hain 1 + 24, Insel 1, Fraktal 1, KI ohne Seed 13) und die
//     Wiederholung: derselbe Satz an derselben Stelle der Welt-Geschichte ergibt denselben Samen und dieselben Orte.
//
//   L-WORTSCHATZ — DER WORT-KATALOG IST DER REZEPT-KATALOG: jedes Wort löst über die Studio-Arten auf (Rezept-ids, Werk-Namen,
//     Art-Wörter des Art-Gesetzes, Studio-Namen), nie über eine Hand-Liste. Befund: „bau mir ein fachwerkhaus" →
//     „Unbekannter Befehl. Meintest du 'baue dorf hier'?", `_studioBlueprintForWord` null für fachwerkhaus · wagen. Gemessen:
//     die Wörter des Befunds, jede platzierbare Studio-Art ihr Rezept-Wort, „bau mir ein fachwerkhaus" stellt ein Haus in
//     die Welt, und ein unbekanntes Wort („scheune") sagt dem Spieler im Chat, was die Studios kennen.
//
//   node scripts/diag-werkstatt-weg.cjs [--selftest]          Port: WERKSTATT_WEG_PORT (Standard 4623)
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");

const PORT = Number(process.env.WERKSTATT_WEG_PORT || 4623);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

function ohneKommentare(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");
}
function fnBody(src, sigRe) {
    const m = sigRe.exec(src);
    if (!m) return null;
    let i = src.indexOf("{", m.index + m[0].length - 1);
    if (i < 0) return null;
    let depth = 0;
    const start = i;
    for (; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") {
            depth--;
            if (depth === 0) return src.slice(start, i + 1);
        }
    }
    return null;
}

// ── DIE VERDIKTE (pure Funktionen; Browser-Probe UND Selbst-Test). Rückgabe: die Täter beim Namen. ──
const SAETZE = ["hain", "insel", "fraktal", "ki ohne Seed"];
function sameVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    for (const s of SAETZE) {
        const z = m.zuege && m.zuege[s];
        if (z == null) out.push(`${s}: nicht gelaufen`);
        else if (z > 0) out.push(`${s}: ${z} Math.random-Züge`);
    }
    if (!(m.hainBaeume > 0)) out.push("der Hain wuchs nicht (Vorbedingung)");
    if (m.samenGleich !== true) out.push(`derselbe Satz, ein anderer Same (${m.samen && m.samen.join(" ≠ ")})`);
    if (!(m.ortAbweichung === 0)) out.push(`derselbe Same, andere Orte (${m.ortAbweichung} m)`);
    if (!(m.kiOrtAbweichung === 0)) out.push(`das KI-Programm ohne Seed streut anders (${m.kiOrtAbweichung} m)`);
    return out;
}

// Die Wörter des Befunds (L-Wortschatz, Drehbuch 18) und ihre Studio-Art; unbekannt bleibt, was kein Studio baut.
const WORT_SOLL = {
    fachwerkhaus: "haus",
    fachwerkhäuser: "haus",
    häuser: "haus",
    wagen: "vehicle",
    gt: "vehicle",
    birken: "tree",
    eiche: "tree",
    feuerstelle: "ausstattung",
    ziehbrunnen: "ausstattung",
    kristall: "rock",
    fels: "rock",
};
const WORT_UNBEKANNT = ["scheune", "quasselstrippe"];
function wortVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    for (const [w, art] of Object.entries(WORT_SOLL)) {
        const e = m.woerter && m.woerter[w];
        if (!e || !e.ziel) out.push(`„${w}" unbekannt`);
        else if (e.art !== art) out.push(`„${w}" → ${e.ziel} (Art ${e.art}, Soll ${art})`);
    }
    for (const w of WORT_UNBEKANNT)
        if (m.woerter && m.woerter[w] && m.woerter[w].ziel) out.push(`„${w}" → ${m.woerter[w].ziel} (geraten)`);
    if (!(m.arten > 0)) out.push("keine platzierbare Studio-Art im Buch (Vorbedingung)");
    if (m.artenOhneWort && m.artenOhneWort.length)
        out.push(`Studio-Arten ohne Wort: ${m.artenOhneWort.slice(0, 6).join(", ")}`);
    if (!(m.hausGebaut > 0)) out.push(`„bau mir ein fachwerkhaus" stellt kein Haus in die Welt („${m.hausZeile}")`);
    if (!/kennt kein Studio/.test(m.absageZeile || "") || !/Fachwerkhaus/.test(m.absageZeile || ""))
        out.push(
            `die Absage eines unbekannten Worts nennt den Katalog nicht („${(m.absageZeile || "").slice(0, 80)}")`
        );
    return out;
}

// ── DIE STATISCHE WAND (Node, kommentarfrei). Liefert [name, ok, detail]. ──
function wand(src) {
    const nc = ohneKommentare(src);
    const muster = fnBody(nc, /\n {4}get chatDslPatterns\(\) \{/) || "";
    const ctx = fnBody(nc, /\n {4}dslCtx\(opts = \{\}\) \{/) || "";
    const streu = fnBody(nc, /\n {4}_dslSpawnStudioItems\(name, pos, n, seed, ctx, jitter\) \{/) || "";
    const zufall = [muster, ctx, streu].map((b) => (b.match(/Math\.random/g) || []).length);
    return [
        [
            "W1 kein Satz würfelt aus Math.random (chatDslPatterns · dslCtx · _dslSpawnStudioItems)",
            muster.length > 0 && ctx.length > 0 && streu.length > 0 && zufall.every((n) => n === 0),
            `Math.random ${zufall.join("/")}`,
        ],
        [
            "W2 der Programm-Strom ohne Seed ist der Welt-Strom (`dslCtx` → `_bauSame`), die Streuung der Strom des Samens",
            /this\._bauSame\("dsl"\)/.test(ctx) &&
                /this\._samenStrom\(baseSeed\)/.test(streu) &&
                !/ctx\.rng\(\)/.test(streu),
        ],
        (() => {
            const aufl = fnBody(nc, /\n {4}_studioBlueprintForWord\(word\) \{/) || "";
            const kat = fnBody(nc, /\n {4}_studioWortKatalog\(\) \{/) || "";
            const wl = fnBody(nc, /\n {4}_studioWordsForPrompt\(nennen = false\) \{/) || "";
            const hand =
                (aufl + kat + wl).match(
                    /"(?:baum_|haus_|fels|stein|kristall|eiche|kiefer|birke|tanne|buche|hain|wald)\w*"/g
                ) || [];
            const brücke = (nc.match(/AnazhRealm\.STUDIO_WORT\b/g) || []).length;
            return [
                "W3 der Wort-Katalog liest den Rezept-Katalog (kein STUDIO_WORT, keine Wort-Literale in Auflöser · Katalog · Wortliste)",
                aufl.length > 0 && kat.length > 0 && wl.length > 0 && brücke === 0 && hand.length === 0,
                `STUDIO_WORT ${brücke} · Wort-Literale ${hand.length}${hand.length ? " (" + hand.slice(0, 4).join(" ") + ")" : ""}`,
            ];
        })(),
    ];
}

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

// ── DIE PROBEN IN DER SEITE (Funktionsrumpf; r = die Welt). ──
async function probe(argW) {
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const out = {};
    const dl0 = performance.now() + 90000;
    while ((!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") && performance.now() < dl0)
        await sleep(100);
    const r = window.anazhRealm;
    const st = r.state;
    const tick = async (n, ms) => {
        for (let i = 0; i < n; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            await sleep(ms || 30);
        }
    };
    const dlB = performance.now() + 90000;
    while (
        performance.now() < dlB &&
        !(
            st.playerMesh &&
            r._foundry &&
            r._foundry.recipes &&
            st.blueprints &&
            st.blueprints.baum_eiche &&
            r._genesisPlattform()
        )
    )
        await tick(1, 100);
    await tick(10, 30);
    // Ein trockener, freier Ort abseits der Genesis-Lichtung (die Natur-Wand hält die Scheibe frei): der Spieler steht dort.
    const plat = r._genesisPlattform();
    const P0 = plat ? plat.position : st.playerMesh.position;
    let frei = null;
    for (let ring = 40; ring <= 160 && !frei; ring += 12)
        for (let k = 0; k < 16 && !frei; k++) {
            const a = (k / 16) * Math.PI * 2;
            const x = P0.x + Math.cos(a) * ring;
            const z = P0.z + Math.sin(a) * ring;
            if (!r._isAboveWaterAt(x, z, 1)) continue;
            if (r._imGrundriss(x, z, 0.8, 12)) continue;
            const y = r._voxelSurfaceY(x, z);
            if (!Number.isFinite(y)) continue;
            if (Math.abs(r._voxelSurfaceY(x + 6, z) - y) > 2.5 || Math.abs(r._voxelSurfaceY(x, z + 6) - y) > 2.5)
                continue;
            frei = { x, y, z };
        }
    const stelle = () => {
        if (!frei) return;
        st.playerMesh.position.set(frei.x, frei.y + 1.2, frei.z);
        st.yaw = 0;
    };
    out.frei = frei;

    // ── D10: der Same eines Satzes ──
    try {
        const m = { gestartet: false, zuege: {} };
        out.same = m;
        if (!frei) throw new Error("kein freier Ort abseits der Lichtung");
        stelle();
        const orig = Math.random;
        let n = 0;
        // Gezählt wird ein Zug der WELT (der Aufrufer steht in anazhRealm.js); die UUID eines neuen three-Objekts
        // (MathUtils.generateUUID beim Bau einer Geometrie) ist keine Welt-Substanz.
        const zaehle = (fn) => {
            n = 0;
            Math.random = function () {
                const rufer = (new Error().stack || "").split("\n")[2] || "";
                if (/anazhRealm\.js/.test(rufer)) n++;
                return orig();
            };
            try {
                return fn();
            } finally {
                Math.random = orig;
            }
        };
        const neue = (vorher) => st.architectures.filter((a) => a && !vorher.has(a));
        const relOrte = (liste) =>
            liste
                .map((a) => [a.position.x - frei.x, a.position.z - frei.z, a.rotationY || 0, a.scale || 1])
                .sort((p, q) => p[0] - q[0] || p[1] - q[1]);
        const abweichung = (A, B) => {
            if (A.length !== B.length || !A.length) return -1;
            let d = 0;
            for (let i = 0; i < A.length; i++) for (let j = 0; j < 4; j++) d = Math.max(d, Math.abs(A[i][j] - B[i][j]));
            return +d.toFixed(6);
        };
        // Der Hain: Satz + Programm, zweimal an derselben Stelle der Welt-Geschichte (der Zähler des Welt-Stroms zurück).
        const hain = () => {
            const vorher = new Set(st.architectures);
            const z0 = Object.assign({}, r._bauSameZaehler || {});
            let gebaut = null;
            zaehle(() => {
                gebaut = r.parseChatToDsl("pflanz mir einen eichenhain");
                if (gebaut) r.dslRun(gebaut.program, { source: "human" });
            });
            const zz = n;
            const liste = neue(vorher);
            for (const a of liste) r.removeArchitecture(a);
            r._bauSameZaehler = z0;
            return { zz, same: gebaut ? gebaut.program[4] : null, orte: relOrte(liste), n: liste.length };
        };
        const h1 = hain();
        stelle();
        const h2 = hain();
        m.zuege.hain = h1.zz;
        m.hainBaeume = h1.n;
        m.samen = [h1.same, h2.same];
        m.samenGleich = h1.same != null && h1.same === h2.same;
        m.ortAbweichung = abweichung(h1.orte, h2.orte);
        zaehle(() => r.parseChatToDsl("setze insel hier"));
        m.zuege.insel = n;
        zaehle(() => r.parseChatToDsl("baue fraktal tempel"));
        m.zuege.fraktal = n;
        // Ein KI-Programm ohne Seed: der Strom des Programms ist der Welt-Strom.
        const ki = () => {
            const vorher = new Set(st.architectures);
            const z0 = Object.assign({}, r._bauSameZaehler || {});
            zaehle(() =>
                r.dslRun(["spawn_studio", "birke", ["at", frei.x + 12, frei.y, frei.z], 3], { source: "llm:grok" })
            );
            const zz = n;
            const liste = neue(vorher);
            for (const a of liste) r.removeArchitecture(a);
            r._bauSameZaehler = z0;
            return { zz, orte: relOrte(liste) };
        };
        const k1 = ki();
        const k2 = ki();
        m.zuege["ki ohne Seed"] = k1.zz;
        m.kiOrtAbweichung = abweichung(k1.orte, k2.orte);
        m.gestartet = true;
    } catch (e) {
        out.same = Object.assign(out.same || {}, { err: (e && e.stack) || String(e) });
    }

    // ── L-Wortschatz: der Wort-Katalog ist der Rezept-Katalog ──
    try {
        const m = { gestartet: false, woerter: {} };
        out.wort = m;
        if (!frei) throw new Error("kein freier Ort abseits der Lichtung");
        const rec = r._foundry.recipes;
        // Die Art eines Bauplans: die Studio-Art, deren Rezept er trägt (das Buch, nie der Name).
        const artVon = (bp) => {
            const pr = bp ? r._foundryPresetForEntry({ type: bp }) : null;
            return pr && rec[pr] ? rec[pr].kind : null;
        };
        for (const w of [...Object.keys(argW.soll), ...argW.unbekannt]) {
            const ziel = r._studioBlueprintForWord(w);
            m.woerter[w] = { ziel, art: artVon(ziel) };
        }
        const PLATZ = ["tree", "rock", "haus", "gate", "vehicle", "ausstattung"];
        const arten = Object.keys(rec).filter((id) => PLATZ.includes(rec[id].kind));
        m.arten = arten.length;
        m.artenOhneWort = arten.filter((id) => !r._studioBlueprintForWord(id));
        // Der Satz an der Welt: „bau mir ein fachwerkhaus" vor dem Spieler (abseits der Lichtung) — ein Haus steht.
        stelle();
        const zeilen = () => [...document.querySelectorAll("#chat-output > div")].map((d) => d.textContent);
        const vorher = new Set(st.architectures);
        const n0 = zeilen().length;
        r.processChatCommand("bau mir ein fachwerkhaus");
        await tick(3, 30);
        const neu = st.architectures.filter((a) => a && !vorher.has(a));
        m.hausGebaut = neu.filter((a) => artVon(a.type) === "haus").length;
        m.hausZeile = zeilen().slice(n0).join(" | ").slice(0, 160);
        for (const a of neu) r.removeArchitecture(a);
        // Ein unbekanntes Wort (ohne KI-Begleiter): die Absage im Spieler-Kanal nennt, was die Studios kennen.
        const llmAlt = st.llm && st.llm.enabled;
        if (st.llm) st.llm.enabled = false;
        const n1 = zeilen().length;
        r.processChatCommand("bau mir eine scheune");
        await tick(1, 30);
        if (st.llm) st.llm.enabled = llmAlt;
        m.absageZeile = zeilen().slice(n1).join(" | ");
        m.gestartet = true;
    } catch (e) {
        out.wort = Object.assign(out.wort || {}, { err: (e && e.stack) || String(e) });
    }
    return out;
}

(async () => {
    const quelle = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST — die Verdikte und die Wand nennen ihre Täter ===");
        const gesund = {
            gestartet: true,
            zuege: { hain: 0, insel: 0, fraktal: 0, "ki ohne Seed": 0 },
            hainBaeume: 6,
            samen: [11, 11],
            samenGleich: true,
            ortAbweichung: 0,
            kiOrtAbweichung: 0,
        };
        check("Selbst-Test D10: gesund == 0 Täter", sameVerdict(gesund).length === 0, sameVerdict(gesund).join(" · "));
        const mit = (o) => Object.assign({}, gesund, o);
        for (const [name, bruch, soll] of [
            [
                "der Hain würfelt (Befund 1 + 24)",
                mit({ zuege: Object.assign({}, gesund.zuege, { hain: 25 }) }),
                "hain: 25 Math.random-Züge",
            ],
            [
                "die Insel würfelt",
                mit({ zuege: Object.assign({}, gesund.zuege, { insel: 1 }) }),
                "insel: 1 Math.random",
            ],
            [
                "das Fraktal würfelt",
                mit({ zuege: Object.assign({}, gesund.zuege, { fraktal: 1 }) }),
                "fraktal: 1 Math.random",
            ],
            [
                "die KI ohne Seed würfelt (Befund 13)",
                mit({ zuege: Object.assign({}, gesund.zuege, { "ki ohne Seed": 13 }) }),
                "ki ohne Seed: 13",
            ],
            [
                "derselbe Satz, ein anderer Same",
                mit({ samen: [11, 12], samenGleich: false }),
                "derselbe Satz, ein anderer Same",
            ],
            ["dieselben Samen, andere Orte", mit({ ortAbweichung: 3.2 }), "derselbe Same, andere Orte"],
            ["die KI streut anders", mit({ kiOrtAbweichung: 1.5 }), "das KI-Programm ohne Seed streut anders"],
            ["kein Hain (vakuös)", mit({ hainBaeume: 0 }), "der Hain wuchs nicht"],
        ]) {
            const v = sameVerdict(bruch);
            check(
                `Selbst-Test D10: ‚${name}' → die Linse nennt ${soll}`,
                v.some((t) => t.startsWith(soll)),
                v.join(" · ")
            );
        }
        // Die Wand: gesund grün, je gebrochene Stelle rot.
        const w0 = wand(quelle);
        check(
            "Selbst-Test Wand: die Quelle ist grün",
            w0.every(([, ok]) => ok),
            w0
                .filter(([, ok]) => !ok)
                .map(([n]) => n)
                .join(" · ")
        );
        for (const [name, bruch, soll] of [
            [
                "die Insel würfelt wieder",
                quelle.replace('this._bauSame("insel")', "Math.floor(Math.random() * 0xffffffff)"),
                "W1",
            ],
            ["der Programm-Strom fällt auf Math.random", quelle.replace('this._bauSame("dsl")', "Math.random()"), "W2"],
            [
                "die Streuung zieht aus dem Programm-Strom",
                quelle.replace("x = pos.x + (wurf() - 0.5)", "x = pos.x + (ctx.rng() - 0.5)"),
                "W2",
            ],
            [
                "die Hand-Liste kehrt zurück",
                quelle.replace(
                    "AnazhRealm._wortFalten = function",
                    'AnazhRealm.STUDIO_WORT = Object.freeze({ haus: "haus_" });\nAnazhRealm._wortFalten = function'
                ),
                "W3",
            ],
            [
                "ein Wort-Literal im Katalog",
                quelle.replace(
                    "const stufen = [new Map(), new Map(), new Map(), new Map()];",
                    'const stufen = [new Map([["fels", "felsbrocken"]]), new Map(), new Map(), new Map()];'
                ),
                "W3",
            ],
        ]) {
            const rot = wand(bruch)
                .filter(([, ok]) => !ok)
                .map(([n]) => n);
            check(
                `Selbst-Test Wand: ‚${name}' → ${soll} rot`,
                rot.some((n) => n.startsWith(soll)),
                rot.join(" · ") || "alles grün"
            );
        }
        // L-Wortschatz: gesund ohne Täter, je Befund-Zustand der Täter beim Namen.
        const artVonSoll = Object.fromEntries(
            Object.entries(WORT_SOLL).map(([w, a]) => [w, { ziel: "x_" + w, art: a }])
        );
        const gesundW = {
            gestartet: true,
            woerter: Object.assign({}, artVonSoll, { scheune: { ziel: null }, quasselstrippe: { ziel: null } }),
            arten: 62,
            artenOhneWort: [],
            hausGebaut: 1,
            absageZeile: '„scheune" kennt kein Studio. Die Studios bauen — Häuser: Haus, Fachwerkhaus …',
        };
        check(
            "Selbst-Test L-Wortschatz: gesund == 0 Täter",
            wortVerdict(gesundW).length === 0,
            wortVerdict(gesundW).join(" · ")
        );
        const mitW = (o) => Object.assign({}, gesundW, o);
        const wortWeg = (w) =>
            mitW({ woerter: Object.assign({}, gesundW.woerter, { [w]: { ziel: null, art: null } }) });
        for (const [name, bruch, soll] of [
            ["fachwerkhaus unbekannt (Befund)", wortWeg("fachwerkhaus"), '„fachwerkhaus" unbekannt'],
            ["wagen unbekannt (Befund)", wortWeg("wagen"), '„wagen" unbekannt'],
            ["Häuser ohne den Plural-Umlaut", wortWeg("häuser"), '„häuser" unbekannt'],
            [
                "fels löst auf ein Haus",
                mitW({ woerter: Object.assign({}, gesundW.woerter, { fels: { ziel: "haus_x", art: "haus" } }) }),
                '„fels" → haus_x',
            ],
            [
                "die Scheune geraten",
                mitW({ woerter: Object.assign({}, gesundW.woerter, { scheune: { ziel: "haus_alemannisch" } }) }),
                '„scheune" → haus_alemannisch',
            ],
            ["eine Studio-Art ohne Wort", mitW({ artenOhneWort: ["zacken"] }), "Studio-Arten ohne Wort: zacken"],
            [
                "der Satz baut kein Haus",
                mitW({ hausGebaut: 0, hausZeile: "Unbekannter Befehl" }),
                '„bau mir ein fachwerkhaus" stellt kein Haus',
            ],
            [
                "die Absage rät (Befund)",
                mitW({ absageZeile: "Unbekannter Befehl. Meintest du: 'baue dorf hier'?" }),
                "die Absage eines unbekannten Worts",
            ],
        ]) {
            const v = wortVerdict(bruch);
            check(
                `Selbst-Test L-Wortschatz: ‚${name}' → die Linse nennt ${soll}`,
                v.some((t) => t.startsWith(soll)),
                v.join(" · ")
            );
        }
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN — die Werkstatt-Weg-Linse nennt ihre Täter beim Namen.");
        process.exit(0);
    }

    console.log("=== W — DIE STATISCHE WAND (Node, kommentarfrei) ===");
    for (const [name, ok, detail] of wand(quelle)) check(name, ok, detail);

    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(probe, { soll: WORT_SOLL, unbekannt: WORT_UNBEKANNT });
    await browser.close();
    server.close();

    console.log("=== D10 — DER SAME EINES SATZES KOMMT AUS DEM WELT-STROM ===");
    const sm = out.same || {};
    if (sm.err) check("D10 Probe ohne Ausnahme", false, sm.err.split("\n")[0]);
    const vS = sameVerdict(sm);
    check(
        "D10 kein Satz würfelt aus Math.random, derselbe Satz an derselben Stelle der Welt-Geschichte ist derselbe Hain",
        vS.length === 0,
        `${sm.gestartet ? `Math.random-Züge ${SAETZE.map((s) => `${s} ${sm.zuege[s]}`).join(" · ")} · Hain ${sm.hainBaeume} Bäume, Samen ${JSON.stringify(sm.samen)}, Orte ±${sm.ortAbweichung} m · KI ohne Seed ±${sm.kiOrtAbweichung} m` : "nicht gestartet"}${vS.length ? " — Täter: " + vS.join(", ") : ""}`
    );
    console.log("=== L-WORTSCHATZ — DER WORT-KATALOG IST DER REZEPT-KATALOG ===");
    const wm = out.wort || {};
    if (wm.err) check("L-Wortschatz Probe ohne Ausnahme", false, wm.err.split("\n")[0]);
    const vW = wortVerdict(wm);
    const bekannt = Object.keys(WORT_SOLL).filter((w) => wm.woerter && wm.woerter[w] && wm.woerter[w].ziel).length;
    check(
        "L-Wortschatz jedes Wort des Befunds löst über die Studio-Arten auf, „bau mir ein fachwerkhaus“ stellt ein Haus, ein unbekanntes Wort hört den Katalog",
        vW.length === 0,
        `${wm.gestartet ? `${bekannt}/${Object.keys(WORT_SOLL).length} Wörter bekannt (fachwerkhaus → ${wm.woerter.fachwerkhaus && wm.woerter.fachwerkhaus.ziel}, wagen → ${wm.woerter.wagen && wm.woerter.wagen.ziel}) · ${wm.arten - (wm.artenOhneWort || []).length}/${wm.arten} Studio-Arten mit Wort · Haus gebaut ${wm.hausGebaut} · Absage „${(wm.absageZeile || "").slice(0, 70)}…"` : "nicht gestartet"}${vW.length ? " — Täter: " + vW.join(", ") : ""}`
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — der Werkstatt-Weg trägt seine benannten Schnitte.");
    process.exit(0);
})().catch((e) => {
    console.error("Werkstatt-Weg-Linse-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
