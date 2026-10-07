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
//   L-WERKSTATT · FRIEDEN · L-RÜCKMELDUNG — JEDER WEG FÜHRT ZUM STEHENDEN WERK: die Eiche über drei Wege (Werkstatt-FERTIGEN,
//     Rezeptbuch, Hotbar) in drei Lagen (schöpfer · frieden mit dem Material · frieden ohne), je mit dem echten Klick und dem
//     Rechtsklick (`tryMousePlace`) an einem freien Ort. Soll: mit Material bzw. in schöpfer steht das Werk auf jedem Weg,
//     das Material zieht genau EINMAL die Kosten (das Gesetz des Modus: frieden und pfad zahlen, frei nur schöpfer);
//     ohne Material sagt der erste Schritt die Absage im Spieler-Kanal (Chat) oder der Knopf steht gesperrt mit dem
//     Fehlenden. Dazu: Haus und GT aus der Werkstatt, die Suche „haus" findet die Häuser, und die Lichtung der Genesis-
//     Plattform färbt das Phantom rot und sagt beim Setzen laut, warum dort nichts wächst. Befund (Leben-Schau 07.10.):
//     „0 von 3 Wegen", frieden verweigert nur im Log (anazhRealm.js:76375), das Rezeptbuch legte die Eiche ins Inventar
//     und zog das Material doppelt.
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

// L-Werkstatt: je Lage × Weg { bauModus, steht, verbraucht: {mat: n}, zeile, gesperrt }; dazu Werke, Suche, Lichtung.
const WEGE = ["werkstatt", "rezeptbuch", "hotbar"];
const LAGEN = ["schöpfer", "frieden mit Material", "frieden ohne Material"];
function wegVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    const kosten = m.kosten || {};
    if (!Object.keys(kosten).length) out.push("die Eiche kostet nichts (Vorbedingung)");
    for (const lage of LAGEN)
        for (const weg of WEGE) {
            const e = m.wege && m.wege[lage] && m.wege[lage][weg];
            const wo = `${lage} · ${weg}`;
            if (!e) {
                out.push(`${wo}: nicht gelaufen`);
                continue;
            }
            if (e.fehler) out.push(`${wo}: wirft (${e.fehler.slice(0, 60)})`);
            if (lage === "frieden ohne Material") {
                if (e.steht > 0) out.push(`${wo}: steht ohne Material`);
                const laut = /fehlt/.test(e.zeile || "") || (e.gesperrt && /fehlt/i.test(e.gesperrt));
                if (!laut) out.push(`${wo}: stumme Absage („${(e.zeile || "").slice(0, 50)}")`);
                if (e.bauModus && weg !== "hotbar")
                    out.push(`${wo}: FERTIGEN führt in einen Bau-Modus, der nur ablehnen kann`);
                continue;
            }
            if (!(e.steht === 1))
                out.push(
                    `${wo}: ${e.steht} Werk(e) stehen (Soll 1)${e.imInventar ? ", die Eiche liegt im Inventar" : ""}`
                );
            if (lage === "frieden mit Material")
                for (const [mt, n] of Object.entries(kosten))
                    if ((e.verbraucht || {})[mt] !== n)
                        out.push(`${wo}: ${mt} ${(e.verbraucht || {})[mt] || 0}× gezogen (Soll ${n})`);
            if (lage === "schöpfer" && Object.values(e.verbraucht || {}).some((n) => n))
                out.push(`${wo}: schöpfer zahlt`);
        }
    for (const [werk, n] of Object.entries(m.werke || {}))
        if (!(n === 1)) out.push(`Werkstatt ${werk}: ${n} stehen (Soll 1)`);
    if (!(m.sucheHaus > 0)) out.push(`die Suche „haus" findet kein Haus (${m.sucheHaus})`);
    const l = m.lichtung || {};
    if (l.wand !== "lichtung") out.push(`das Phantom über der Lichtung färbt sich nicht (Urteil ${l.wand})`);
    if (l.steht > 0)
        out.push(`auf der Lichtung steht ${l.steht} Eiche (die Natur-Wand gilt dem Satz, nicht dem Bau-Modus)`);
    if (!/Lichtung/.test(l.zeile || "")) out.push(`die Lichtung verweigert stumm („${(l.zeile || "").slice(0, 50)}")`);
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
        (() => {
            const setzen = fnBody(nc, /\n {4}confirmBuild\(\) \{/) || "";
            const craft = fnBody(nc, /\n {4}craftFromRecipe\(name\) \{/) || "";
            const fert = fnBody(nc, /\n {4}fertigeBlueprint\(name\) \{/) || "";
            const logs = (setzen.match(/this\.log\(/g) || []).length;
            const sagt = (setzen.match(/this\._spielerSagt\(/g) || []).length;
            return [
                "W4 EIN Weg jedes Bauwerks: das Rezeptbuch ruft `fertigeBlueprint` (kein Inventar), FERTIGEN fragt `_bauVorabTor`, das Setzen setzt durch die Natur-Wand und sagt jede Absage dem Spieler",
                /kind === "place"\) return this\.fertigeBlueprint\(name\)/.test(craft) &&
                    !/addToInventory/.test(craft) &&
                    /this\._bauVorabTor\(name\)/.test(fert) &&
                    /this\._naturSetzen\(/.test(setzen) &&
                    logs <= 1 &&
                    sagt >= 4,
                `confirmBuild: ${sagt}× Spieler-Kanal, ${logs}× Log`,
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

    // ── L-Werkstatt · frieden · L-Rückmeldung: jeder Weg führt zum stehenden Werk ──
    try {
        const m = { gestartet: false, wege: {}, werke: {} };
        out.weg = m;
        if (!frei || !plat) throw new Error("kein freier Ort oder keine Genesis-Plattform");
        const NAME = "baum_eiche";
        const zeilen = () => [...document.querySelectorAll("#chat-output > div")].map((d) => d.textContent);
        const inv = st.player.inventory;
        const kosten = Object.assign({}, r.checkBuildCost(NAME).cost);
        m.kosten = kosten;
        const leeren = () => {
            for (let i = 0; i < inv.length; i++) inv[i] = null;
        };
        const habe = () => {
            const h = {};
            for (const s of inv) if (s && s.kind === "material") h[s.material] = (h[s.material] || 0) + (s.count || 0);
            return h;
        };
        const imInventar = (n) => inv.some((s) => s && s.kind !== "material" && s.blueprintName === n);
        // Vom Spieler am freien Ort weg von der Plattform geblickt, leicht nach unten: das Phantom liegt vor ihm.
        const yawWeg = Math.atan2(frei.x - plat.position.x, frei.z - plat.position.z);
        const zielen = async (ort, yaw) => {
            st.playerMesh.position.set(ort.x, ort.y + 1.2, ort.z);
            st.yaw = yaw;
            st.pitch = -0.45;
            await tick(4, 30);
            r.tickBuildMode();
        };
        // Je Weg ein eigener Akt des Spielers: die Sperre gegen dieselbe Zeile binnen 2 s (`_spielerSagt`) gilt dem
        // gehaltenen Rechtsklick, nicht dem nächsten Weg — sie wird zwischen den Wegen gelöst.
        const aufraeumen = () => {
            if (st.buildMode.active) r._clearBuildMode();
            if (st.uiActiveDrawer) r.closeAllDrawers();
            if (st.inventoryOpen) r.toggleInventoryOverlay(false);
            if (st.player.equipped) st.player.equipped.held = null;
            r._spielerSagtLetzte = null;
        };
        const klickeWeg = async (weg, name) => {
            const e = {};
            if (weg === "werkstatt") {
                if (st.uiActiveDrawer !== "werkstatt") r.toggleDrawer("werkstatt");
                r.selectBlueprintForEdit(name);
                await tick(2, 30);
                const knopf = document.querySelector("#workshop-action-zone .workshop-fertigen");
                if (!knopf) throw new Error("kein FERTIGEN in der Werkstatt");
                knopf.click();
            } else if (weg === "rezeptbuch") {
                r.toggleInventoryOverlay(true);
                r.renderRecipeBook();
                const lab = String(st.blueprints[name].label || name);
                const zeile = [...document.querySelectorAll("#inventory-recipes .recipe-row")].find(
                    (z) => (z.querySelector(".recipe-name") || {}).textContent === lab
                );
                const knopf = zeile && zeile.querySelector("button");
                if (!knopf) throw new Error("keine Rezept-Zeile");
                if (knopf.disabled) e.gesperrt = knopf.title || "gesperrt";
                knopf.click();
            } else {
                r.setHotbarSlot(4, name);
                if (!(st.buildMode.active && st.buildMode.blueprintName === name)) r.selectHotbarSlot(4);
            }
            return e;
        };
        const lauf = async (lage, weg) => {
            aufraeumen();
            r.setGameMode(lage === "schöpfer" ? "schöpfer" : "frieden");
            leeren();
            if (lage === "frieden mit Material")
                for (const [mt, n] of Object.entries(kosten)) r.addMaterialToInventory(mt, n);
            const h0 = habe();
            const n0 = zeilen().length;
            const vorher = new Set(st.architectures);
            let e = {};
            try {
                await zielen(frei, yawWeg);
                e = await klickeWeg(weg, NAME);
                e.bauModus = !!(st.buildMode.active && st.buildMode.blueprintName === NAME && st.buildMode.phantomMesh);
                if (e.bauModus) {
                    await zielen(frei, yawWeg);
                    r.tryMousePlace();
                }
            } catch (err) {
                e.fehler = String((err && err.message) || err);
            }
            const neu = st.architectures.filter(
                (a) => a && !vorher.has(a) && a.type === NAME && typeof a.id === "string"
            );
            e.steht = neu.length;
            e.imInventar = imInventar(NAME);
            const h1 = habe();
            e.verbraucht = {};
            for (const mt of Object.keys(kosten)) e.verbraucht[mt] = (h0[mt] || 0) - (h1[mt] || 0);
            e.zeile = zeilen().slice(n0).join(" | ");
            for (const a of neu) r.removeArchitecture(a);
            for (let i = 0; i < inv.length; i++) if (inv[i] && inv[i].blueprintName === NAME) inv[i] = null;
            aufraeumen();
            return e;
        };
        const modusAlt = r.getGameMode();
        try {
            for (const lage of ["schöpfer", "frieden mit Material", "frieden ohne Material"]) {
                m.wege[lage] = {};
                for (const weg of ["werkstatt", "rezeptbuch", "hotbar"]) m.wege[lage][weg] = await lauf(lage, weg);
            }
            // Haus und GT aus der Werkstatt (schöpfer): FERTIGEN → Phantom → Rechtsklick.
            for (const [werk, name] of [
                ["Haus", "haus_alemannisch"],
                ["GT", "fahrzeug_gt"],
            ]) {
                aufraeumen();
                r.setGameMode("schöpfer");
                const vorher = new Set(st.architectures);
                try {
                    await zielen(frei, yawWeg);
                    await klickeWeg("werkstatt", name);
                    if (st.buildMode.active) {
                        await zielen(frei, yawWeg);
                        r.tryMousePlace();
                    }
                } catch (_e) {}
                const neu = st.architectures.filter(
                    (a) => a && !vorher.has(a) && a.type === name && typeof a.id === "string"
                );
                m.werke[werk] = neu.length;
                for (const a of neu) r.removeArchitecture(a);
                aufraeumen();
            }
            // Die Suche „haus" in der Werkstatt findet die Häuser.
            r.toggleDrawer("werkstatt");
            const suche = document.getElementById("workshop-search");
            if (suche) {
                suche.value = "haus";
                r._applyWorkshopFilter();
                m.sucheHaus = [...document.querySelectorAll("#workshop-list .workshop-list-row")].filter(
                    (z) => z.style.display !== "none" && /^haus_/.test(z.getAttribute("data-blueprint") || "")
                ).length;
                suche.value = "";
                r._applyWorkshopFilter();
            }
            aufraeumen();
            // Die Lichtung: der Spieler mitten auf der Plattform, die Eiche (schöpfer) 5 m vor ihm.
            r.setGameMode("schöpfer");
            const n0 = zeilen().length;
            const vorher = new Set(st.architectures);
            const P = plat.position;
            r.setHotbarSlot(4, NAME);
            r.selectHotbarSlot(4);
            await zielen({ x: P.x, y: P.y + 1, z: P.z }, yawWeg);
            const ph = st.buildMode.phantomMesh && st.buildMode.phantomMesh.position;
            m.lichtung = {
                wand: st.buildMode.phantomWand || false,
                phantomAbstand: ph ? +Math.hypot(ph.x - P.x, ph.z - P.z).toFixed(1) : null,
            };
            r.tryMousePlace();
            const neu = st.architectures.filter(
                (a) => a && !vorher.has(a) && a.type === NAME && typeof a.id === "string"
            );
            m.lichtung.steht = neu.length;
            m.lichtung.zeile = zeilen().slice(n0).join(" | ");
            for (const a of neu) r.removeArchitecture(a);
            aufraeumen();
        } finally {
            r.setGameMode(modusAlt);
            leeren();
        }
        m.gestartet = true;
    } catch (e) {
        out.weg = Object.assign(out.weg || {}, { err: (e && e.stack) || String(e) });
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
        // L-Werkstatt: gesund ohne Täter, je Befund-Zustand der Täter beim Namen.
        const KOST = { holz: 44, laub: 50 };
        const steht = (verbraucht) => ({ bauModus: true, steht: 1, verbraucht, zeile: "" });
        const gesundG = {
            gestartet: true,
            kosten: KOST,
            wege: {
                schöpfer: { werkstatt: steht({}), rezeptbuch: steht({}), hotbar: steht({}) },
                "frieden mit Material": { werkstatt: steht(KOST), rezeptbuch: steht(KOST), hotbar: steht(KOST) },
                "frieden ohne Material": {
                    werkstatt: { bauModus: false, steht: 0, zeile: "Eiche: fehlt 44× holz · 50× laub — sammeln" },
                    rezeptbuch: { bauModus: false, steht: 0, zeile: "", gesperrt: "Es fehlt: 44× holz, 50× laub" },
                    hotbar: { bauModus: true, steht: 0, zeile: "Eiche: fehlt 44× holz · 50× laub — sammeln" },
                },
            },
            werke: { Haus: 1, GT: 1 },
            sucheHaus: 32,
            lichtung: { wand: "lichtung", steht: 0, zeile: "Eiche: die Lichtung der Genesis-Plattform bleibt frei" },
        };
        check(
            "Selbst-Test L-Werkstatt: gesund == 0 Täter",
            wegVerdict(gesundG).length === 0,
            wegVerdict(gesundG).join(" · ")
        );
        const mitG = (lage, weg, e) => {
            const b = JSON.parse(JSON.stringify(gesundG));
            b.wege[lage][weg] = Object.assign(b.wege[lage][weg], e);
            return b;
        };
        for (const [name, bruch, soll] of [
            [
                "das Rezeptbuch legt ins Inventar (Befund)",
                mitG("schöpfer", "rezeptbuch", { steht: 0, imInventar: true }),
                "schöpfer · rezeptbuch: 0 Werk(e) stehen",
            ],
            [
                "das Rezeptbuch zahlt doppelt",
                mitG("frieden mit Material", "rezeptbuch", { verbraucht: { holz: 88, laub: 100 } }),
                "frieden mit Material · rezeptbuch: holz 88× gezogen",
            ],
            [
                "frieden verweigert nur im Log (Befund)",
                mitG("frieden ohne Material", "hotbar", { zeile: "" }),
                "frieden ohne Material · hotbar: stumme Absage",
            ],
            [
                "FERTIGEN führt in den Bau-Modus ohne Material",
                mitG("frieden ohne Material", "werkstatt", { bauModus: true }),
                "frieden ohne Material · werkstatt: FERTIGEN führt in einen Bau-Modus",
            ],
            [
                "schöpfer zahlt",
                mitG("schöpfer", "hotbar", { verbraucht: { holz: 44 } }),
                "schöpfer · hotbar: schöpfer zahlt",
            ],
            [
                "der GT hat keinen Weg",
                Object.assign({}, gesundG, { werke: { Haus: 1, GT: 0 } }),
                "Werkstatt GT: 0 stehen",
            ],
            [
                "die Suche findet kein Haus (Befund)",
                Object.assign({}, gesundG, { sucheHaus: 0 }),
                'die Suche „haus" findet kein Haus',
            ],
            [
                "die Eiche steht auf der Lichtung",
                Object.assign({}, gesundG, { lichtung: { wand: false, steht: 1, zeile: "" } }),
                "auf der Lichtung steht 1 Eiche",
            ],
        ]) {
            const v = wegVerdict(bruch);
            check(
                `Selbst-Test L-Werkstatt: ‚${name}' → die Linse nennt ${soll}`,
                v.some((t) => t.startsWith(soll)),
                v.join(" · ")
            );
        }
        for (const [name, bruch, soll] of [
            [
                "das Rezeptbuch legt wieder ins Inventar",
                quelle.replace(
                    'if (kind === "place") return this.fertigeBlueprint(name);',
                    'if (kind === "place") { this.addToInventory(name, 1); return { ok: true }; }'
                ),
                "W4",
            ],
            [
                "das Setzen fragt die Natur-Wand nicht",
                quelle.replace("? this._naturSetzen(name, spawnPos, {}, setzen, (wo) => (wand = wo))", "? setzen()"),
                "W4",
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
    console.log("=== L-WERKSTATT · FRIEDEN · L-RÜCKMELDUNG — JEDER WEG FÜHRT ZUM STEHENDEN WERK ===");
    const gm = out.weg || {};
    if (gm.err) check("L-Werkstatt Probe ohne Ausnahme", false, gm.err.split("\n")[0]);
    const vG = wegVerdict(gm);
    const zelle = (lage, weg) => {
        const e = (gm.wege && gm.wege[lage] && gm.wege[lage][weg]) || {};
        if (lage === "frieden ohne Material")
            return `${weg} ${e.steht ? "steht!" : /fehlt/.test(e.zeile || "") ? "sagt es" : e.gesperrt ? "gesperrt" : "stumm"}`;
        return `${weg} ${e.steht}${lage === "frieden mit Material" ? ` (${Object.values(e.verbraucht || {}).join("/")})` : ""}`;
    };
    const tragen = ["schöpfer", "frieden mit Material"].reduce(
        (n, lage) =>
            n + WEGE.filter((w) => gm.wege && gm.wege[lage] && gm.wege[lage][w] && gm.wege[lage][w].steht === 1).length,
        0
    );
    check(
        "L-Werkstatt jeder Weg (Werkstatt · Rezeptbuch · Hotbar) führt zum stehenden Werk, frieden zahlt einmal, jede Absage spricht, die Lichtung sagt warum",
        vG.length === 0,
        `${gm.gestartet ? `${tragen}/6 Wege tragen · ${LAGEN.map((l) => `${l}: ${WEGE.map((w) => zelle(l, w)).join(", ")}`).join(" · ")} · Werkstatt ${JSON.stringify(gm.werke)} · Suche „haus" ${gm.sucheHaus} · Lichtung ${JSON.stringify({ wand: gm.lichtung && gm.lichtung.wand, steht: gm.lichtung && gm.lichtung.steht })}` : "nicht gestartet"}${vG.length ? " — Täter: " + vG.join(", ") : ""}`
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
