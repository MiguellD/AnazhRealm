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
//   BRENNGLAS — DAS LICHT BRENNT, WO ES SICH BÜNDELT, UND DIE ZERSTÖRUNG NENNT SICH: die Eiche 2,4 m vor der Mitte der
//     Genesis-Plattform (ihr Quarz-Kern ist nach der Tag-Sprache ein Brennglas) übersteht einen ganzen sonnigen Tag; die
//     gebaute Linse (Quarz-Kugel im Bronze-Ring, 1 m über dem Boden) entzündet zu Mittag die Eiche unter sich — erst glimmt
//     sie, dann brennt sie, beides im Spieler-Kanal —, nachts nie, und was den Brennpunkt verlässt, kühlt. Dazu der
//     Zensus der Welt: was das alte Gesetz im 4-m-Kreis jeder Linse erhitzte, was das Licht jetzt erreicht. Befund
//     (Leben-Schau 07.10.): die Werkstatt-Eiche verbrannte nach 20 s Sonne still (Architekturen 125 → 124, nur im Log).
//
//   DER SAME DES WERKS (Gegenprüfung 08.10., ROT 1) — DAS GESETZTE WERK IST DAS PHANTOM, AUCH BEIM MITSPIELER: das Setzen
//     (`confirmBuild`) stellt die Gestalt, Drehung und Tönung, die das Phantom zeigt (EIN Same je Werk, `_werkSame` — dieselbe
//     Gestalt wie Werkstatt-Vorschau und Hand), würfelt nichts aus Math.random, und die Nachricht an den Mitspieler trägt
//     Same und Drehung des Werks: dort steht dasselbe Werk. Der Zähler des Welt-Stroms (`_bauSame`) reist im Welt-Gedächtnis
//     (`worldMeta`): nach einem Reload wiederholt der Strom nie seinen ersten Samen. Befund: der Standard-Same der Wurzel
//     `spawnArchitecture` war Math.random, der Broadcast schickte den Samen 0 (immer Gestalt 1), das Phantom zeigte die
//     Gestalt des Bauplan-Namens und blickte zum Spieler, das Werk stand mit Drehung 0.
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
    const ph = m.phantom || {};
    if (!(ph.meshes > 0)) out.push("kein Phantom im Bau-Modus (Vorbedingung)");
    else if (ph.verworfen > 0)
        out.push(
            `das Phantom ist unsichtbar: ${ph.verworfen}/${ph.meshes} Meshes verwirft der Alpha-Test (Deckkraft < alphaTest)`
        );
    if (!(m.sucheHaus > 0)) out.push(`die Suche „haus" findet kein Haus (${m.sucheHaus})`);
    const l = m.lichtung || {};
    if (l.wand !== "lichtung") out.push(`das Phantom über der Lichtung färbt sich nicht (Urteil ${l.wand})`);
    if (l.steht > 0)
        out.push(`auf der Lichtung steht ${l.steht} Eiche (die Natur-Wand gilt dem Satz, nicht dem Bau-Modus)`);
    if (!/Lichtung/.test(l.zeile || "")) out.push(`die Lichtung verweigert stumm („${(l.zeile || "").slice(0, 50)}")`);
    return out;
}

// Brennglas: { plattform: {steht, maxWaerme, zeilen}, linse: {glimmtBei, brenntBei, steht, zeileGlimmt, zeileBrennt},
// nacht: {waerme, steht}, kuehlung: {nachFokus, nachKuehlen}, zensus: {linsen, altReichweite, imLicht} }.
function brennVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    const p = m.plattform || {};
    if (!p.gesetzt) out.push("die Eiche an der Plattform nicht gesetzt (Vorbedingung)");
    else if (!(p.abstand <= 3)) out.push(`die Eiche steht nicht 2,4 m vor der Mitte (Vorbedingung, ${p.abstand} m)`);
    else if (!p.steht) out.push(`die Eiche 2,4 m vor der Plattform-Mitte verbrannte (nach ${p.verbranntNach} s Sonne)`);
    const l = m.linse || {};
    if (!l.gesetzt) out.push("die gebaute Linse nicht gesetzt (Vorbedingung)");
    else {
        if (l.steht) out.push(`die gebaute Linse entzündet die Eiche unter sich nicht (Wärme ${l.waerme})`);
        if (!/glimmt/.test(l.zeileGlimmt || "")) out.push("das Glimmen schweigt");
        if (!/entzündete/.test(l.zeileBrennt || ""))
            out.push(`die Zerstörung nennt sich nicht („${(l.zeileBrennt || "").slice(0, 50)}")`);
    }
    const n = m.nacht || {};
    if (!(n.waerme === 0) || !n.steht)
        out.push(`nachts erwärmt die Linse (Wärme ${n.waerme}${n.steht ? "" : ", verbrannt"})`);
    const k = m.kuehlung || {};
    if (!(k.nachFokus > 0)) out.push("keine Wärme im Brennpunkt (Vorbedingung)");
    else if (!(k.nachKuehlen === 0))
        out.push(`außerhalb des Brennpunkts kühlt nichts (${k.nachFokus} → ${k.nachKuehlen})`);
    const ra = m.raeumung || {};
    if (!ra.gesetzt || !ra.weg) out.push("die Räumung nahm das Werk des Spielers nicht (Vorbedingung)");
    else if (!/wich/.test(ra.zeile || ""))
        out.push(`die Räumung eines Spieler-Werks schweigt („${(ra.zeile || "").slice(0, 40)}")`);
    return out;
}

// Der Same des Werks: { steht, zuege, phantomKey, werkKey, phantomDreh, werkDreh, werkSame, werkTint, gesendetSame,
// empfang: {steht, key, dreh, tint}, reload: {erst, weiter, nachReload} }.
function werkVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    const gleich = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 1e-6;
    if (!(m.steht === 1)) out.push(`das Setzen stellt ${m.steht} Werk(e) (Vorbedingung)`);
    if (m.zuege > 0) out.push(`das Setzen würfelt ${m.zuege}× aus Math.random`);
    if (!m.phantomKey) out.push("kein Studio-Phantom (Vorbedingung)");
    else if (m.phantomKey !== m.werkKey) out.push(`das Phantom zeigt ${m.phantomKey}, es steht ${m.werkKey}`);
    if (!gleich(m.phantomDreh, m.werkDreh))
        out.push(`das Phantom blickt ${m.phantomDreh} rad, das Werk ${m.werkDreh} rad`);
    if (m.gesendetSame !== m.werkSame)
        out.push(`der Mitspieler bekommt den Samen ${m.gesendetSame}, das Werk trägt ${m.werkSame}`);
    const e = m.empfang || {};
    if (!e.steht) out.push("beim Mitspieler steht kein Werk (Vorbedingung)");
    else {
        if (e.key !== m.werkKey) out.push(`beim Mitspieler steht ${e.key} statt ${m.werkKey}`);
        if (!gleich(e.dreh, m.werkDreh)) out.push(`beim Mitspieler blickt das Werk ${e.dreh} rad statt ${m.werkDreh}`);
        if (e.tint !== m.werkTint) out.push(`beim Mitspieler eine andere Tönung (${e.tint} ≠ ${m.werkTint})`);
    }
    const rl = m.reload || {};
    if (rl.erst == null) out.push("der Welt-Strom zieht nicht (Vorbedingung)");
    else if (rl.nachReload === rl.erst)
        out.push(`nach dem Reload wiederholt der Welt-Strom seinen ersten Samen (${rl.erst})`);
    else if (rl.nachReload !== rl.weiter)
        out.push(`nach dem Reload ein fremder Same (${rl.nachReload}, Soll ${rl.weiter})`);
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
        (() => {
            const brenn = fnBody(nc, /\n {4}_tickFocusingAffordances\(dt\) \{/) || "";
            const formel = (nc.match(/\* Math\.PI \* 2 - Math\.PI \/ 2/g) || []).length;
            return [
                "W5 das Brennglas bündelt die Sonne in den Brennpunkt (`_sonnenRichtung` · `_brennpunkte` · `_traegtPunkt`), die Zerstörung spricht der Spieler-Kanal, der Sonnen-Winkel ist EINE Formel",
                /this\._sonnenRichtung\(\)/.test(brenn) &&
                    /this\._brennpunkte\(/.test(brenn) &&
                    /this\._traegtPunkt\(/.test(brenn) &&
                    /this\._spielerSagt\(/.test(brenn) &&
                    !/this\.log\(/.test(brenn) &&
                    formel === 1,
                `Sonnen-Winkel ausgeschrieben ${formel}×`,
            ];
        })(),
        (() => {
            const geist = fnBody(nc, /\n {4}_ghostMaterialFor\(mat\) \{/) || "";
            return [
                "W6 das Phantom übersteht den Alpha-Test (`_ghostMaterialFor`: alphaTest × Deckkraft)",
                geist.includes("g.alphaTest = (Number.isFinite(mat.alphaTest) ? mat.alphaTest : 0) * g.opacity;"),
            ];
        })(),
        (() => {
            const wurzeln = {
                spawnArchitecture: /\n {4}spawnArchitecture\(type, position, opts = \{\}\) \{/,
                spawnIslandAt: /\n {4}spawnIslandAt\(x, y, z, height = 6, opts = \{\}\) \{/,
                spawnUfoAt: /\n {4}spawnUfoAt\(x, y, z\) \{/,
                _workshopRecipeSpec: /\n {4}_workshopRecipeSpec\(bp, kind\) \{/,
                dslCompose: /\n {4}dslCompose\(opts = \{\}\) \{/,
                generateEvolution: /\n {4}generateEvolution\(\) \{/,
                confirmBuild: /\n {4}confirmBuild\(\) \{/,
            };
            const fehlt = [];
            const zuege = [];
            for (const [n, re] of Object.entries(wurzeln)) {
                const b = fnBody(nc, re);
                if (!b) fehlt.push(n);
                else if (/Math\.random/.test(b)) zuege.push(`${n} ${b.match(/Math\.random/g).length}`);
            }
            const same = fnBody(nc, /\n {4}_bauSame\(art\) \{/) || "";
            const zaehler = (nc.match(/_bauSameZaehler/g) || []).length;
            return [
                "W7 kein Werk würfelt aus Math.random (spawnArchitecture · spawnIslandAt · spawnUfoAt · Werkstatt-Würfel · dslCompose · generateEvolution · confirmBuild), der Zähler des Welt-Stroms reist im Welt-Gedächtnis",
                !fehlt.length && !zuege.length && /this\.state\.worldMeta/.test(same) && zaehler === 0,
                `${fehlt.length ? "fehlt " + fehlt.join(", ") + " · " : ""}Math.random ${zuege.join(", ") || "0"} · Sitzungs-Zähler ${zaehler}`,
            ];
        })(),
        (() => {
            const setzen = fnBody(nc, /\n {4}confirmBuild\(\) \{/) || "";
            const hash = (nc.match(/Math\.imul\(\w+, 131\)/g) || []).length;
            const leser = {
                Vorschau: /\n {4}_workshopFoundryPreviewGroup\(bpName\) \{/,
                Hand: /\n {4}_heldFoundryGroup\(bpName\) \{/,
                Phantom: /\n {4}_buildStudioPlacementGhost\(bp\) \{/,
                Setzen: /\n {4}confirmBuild\(\) \{/,
            };
            const ohne = Object.entries(leser)
                .filter(([, re]) => !/this\._werkSame\(/.test(fnBody(nc, re) || ""))
                .map(([n]) => n);
            const null0 = /"spawn_blueprint", bm\.blueprintName, posNode, 0\b/.test(setzen);
            return [
                "W8 EIN Same je Werk (`_werkSame`: Vorschau · Hand · Phantom · Setzen), das Setzen trägt Same und Drehung des Phantoms, die Nachricht an den Mitspieler den Samen des Werks",
                hash === 1 && !ohne.length && /rotationY: dreh/.test(setzen) && !null0,
                `Same-Hash ${hash}× · ohne _werkSame: ${ohne.join(", ") || "keiner"} · Samen 0 im Broadcast ${null0 ? "ja" : "nein"}`,
            ];
        })(),
        (() => {
            const strom = fnBody(nc, /\n {4}_streamRng\(streamName\) \{/) || "";
            return [
                "W9 EIN Strom-Gesetz: `_streamRng` ist der Strom seines Samens (`_samenStrom`), kein zweites LCG",
                /this\._samenStrom\(/.test(strom) && !/1664525/.test(strom),
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

    const orig = Math.random;
    let n = 0;
    // Gezählt wird ein Zug der WELT (der Aufrufer steht in anazhRealm.js); die UUID eines neuen three-Objekts
    // (MathUtils.generateUUID beim Bau einer Geometrie) und die Identität eines Werks (`_newArchId`: ein Name, keine
    // Substanz — er reist mit der Nachricht) sind keine Welt-Substanz.
    const zaehle = (fn) => {
        n = 0;
        Math.random = function () {
            const rufer = (new Error().stack || "").split("\n")[2] || "";
            if (/anazhRealm\.js/.test(rufer) && !/\._newArchId \(/.test(rufer)) n++;
            return orig();
        };
        try {
            return fn();
        } finally {
            Math.random = orig;
        }
    };
    // ── D10: der Same eines Satzes ──
    try {
        const m = { gestartet: false, zuege: {} };
        out.same = m;
        if (!frei) throw new Error("kein freier Ort abseits der Lichtung");
        stelle();
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
            const z0 = JSON.parse(JSON.stringify(st.worldMeta.bauSame || {}));
            let gebaut = null;
            zaehle(() => {
                gebaut = r.parseChatToDsl("pflanz mir einen eichenhain");
                if (gebaut) r.dslRun(gebaut.program, { source: "human" });
            });
            const zz = n;
            const liste = neue(vorher);
            for (const a of liste) r.removeArchitecture(a);
            st.worldMeta.bauSame = z0;
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
            const z0 = JSON.parse(JSON.stringify(st.worldMeta.bauSame || {}));
            zaehle(() =>
                r.dslRun(["spawn_studio", "birke", ["at", frei.x + 12, frei.y, frei.z], 3], { source: "llm:grok" })
            );
            const zz = n;
            const liste = neue(vorher);
            for (const a of liste) r.removeArchitecture(a);
            st.worldMeta.bauSame = z0;
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
                    // Das Phantom im Bild: die Studio-Gestalt (sie heilt den Spender-Geist, sobald das Asset dockt) und je
                    // Mesh, ob ein volles Fragment den Alpha-Test übersteht (r184: Alpha × Deckkraft < alphaTest → verworfen).
                    if (lage === "schöpfer" && weg === "werkstatt") {
                        const bm = st.buildMode;
                        for (let i = 0; i < 300 && bm.phantomStudioPending; i++) {
                            await tick(1, 50);
                            r.tickBuildMode();
                        }
                        let meshes = 0;
                        let verworfen = 0;
                        bm.phantomMesh.traverse((o) => {
                            if (!o.isMesh || !o.material) return;
                            meshes++;
                            const ma = o.material;
                            if ((ma.transparent ? ma.opacity : 1) < (ma.alphaTest || 0)) verworfen++;
                        });
                        m.phantom = { studio: !!bm.phantomMesh.userData.studioGhost, meshes, verworfen };
                    }
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

    // ── Der Same des Werks: das gesetzte Werk ist das Phantom, auch beim Mitspieler ──
    try {
        const m = { gestartet: false };
        out.werk = m;
        if (!frei || !plat) throw new Error("kein freier Ort oder keine Genesis-Plattform");
        const NAME = "baum_eiche";
        const preset = r._foundryPresetForEntry({ type: NAME });
        // Die Gestalt eines Phantoms: der Schlüssel seiner Studio-Gruppe im Foundry-Cache; die eines Werks: ihr Schlüssel aus
        // Same und Stempel (dieselbe Formel wie `_foundryFlattenFor`, Stufe 0 wie das Phantom).
        const keyVon = (grp) => {
            if (!grp || !r._foundry || !r._foundry.cache) return null;
            for (const [k, v] of r._foundry.cache) if (v === grp) return k;
            return null;
        };
        const werkKey = (e) =>
            r._foundryKoerperKey(preset, r._foundryVariantFor(e.seed, preset), 0, r._artifactStudioOv(e));
        const dreh = (e) => (Number.isFinite(e.rotationY) ? +e.rotationY.toFixed(6) : 0);
        const tint = (e) => [e.tintH, e.tintS, e.tintV].map((v) => (Number.isFinite(v) ? v.toFixed(6) : "-")).join("/");
        const finde = (p) => {
            if (!Array.isArray(p)) return null;
            if (p[0] === "spawn_blueprint") return p;
            for (const k of p) {
                const f = finde(k);
                if (f) return f;
            }
            return null;
        };
        const modusAlt = r.getGameMode();
        const p2pAlt = st.p2p;
        const gesendet = [];
        try {
            if (st.buildMode.active) r._clearBuildMode();
            if (st.uiActiveDrawer) r.closeAllDrawers();
            r.setGameMode("schöpfer");
            // ein schräger Blick weg von der Plattform: die Drehung des Phantoms ist nicht 0
            st.playerMesh.position.set(frei.x, frei.y + 1.2, frei.z);
            st.yaw = Math.atan2(frei.x - plat.position.x, frei.z - plat.position.z) + 0.7;
            st.pitch = -0.45;
            await tick(4, 30);
            r.setHotbarSlot(4, NAME);
            if (!(st.buildMode.active && st.buildMode.blueprintName === NAME)) r.selectHotbarSlot(4);
            const bm = st.buildMode;
            r.tickBuildMode();
            for (let i = 0; i < 300 && bm.phantomMesh && !bm.phantomMesh.userData.studioGhost; i++) {
                await tick(1, 50);
                r.tickBuildMode();
            }
            m.phantomKey = bm.phantomMesh ? keyVon(bm.phantomMesh.userData.foundrySrcGroup) : null;
            m.phantomDreh = bm.phantomMesh ? +bm.phantomMesh.rotation.y.toFixed(6) : null;
            // Die Naht zum Mitspieler: das Programm, das der Sender schickt.
            st.p2p = Object.assign({}, p2pAlt || {}, { enabled: true });
            r.p2pBroadcastDsl = (prog) => gesendet.push(JSON.parse(JSON.stringify(prog)));
            const vorher = new Set(st.architectures);
            zaehle(() => r.tryMousePlace());
            m.zuege = n;
            st.p2p = p2pAlt;
            delete r.p2pBroadcastDsl;
            const neu = st.architectures.filter(
                (a) => a && !vorher.has(a) && a.type === NAME && typeof a.id === "string"
            );
            m.steht = neu.length;
            const e = neu[0];
            if (e) {
                m.werkSame = e.seed;
                m.werkKey = werkKey(e);
                m.werkDreh = dreh(e);
                m.werkTint = tint(e);
            }
            const op = finde(gesendet[0]);
            m.gesendetSame = op ? op[3] : null;
            // Der Mitspieler: dasselbe Programm in seiner Welt (das lokale Werk weicht, der Empfänger baut aus der Nachricht).
            for (const a of neu) r.removeArchitecture(a);
            m.empfang = { steht: false };
            if (e && gesendet[0]) {
                r.dslRun(gesendet[0], { source: "remote:pruef" });
                const e2 = st.architectures.find((a) => a && a.id === e.id);
                if (e2) {
                    m.empfang = { steht: true, same: e2.seed, key: werkKey(e2), dreh: dreh(e2), tint: tint(e2) };
                    r.removeArchitecture(e2);
                }
            }
        } finally {
            st.p2p = p2pAlt;
            delete r.p2pBroadcastDsl;
            if (st.buildMode.active) r._clearBuildMode();
            r.setGameMode(modusAlt);
        }
        // Der Welt-Strom über einen Reload: der Snapshot trägt das Welt-Gedächtnis (`worldMeta`), der Restore mischt es
        // über den frischen Stand (`_loadStateRestoreWorldMeta`); die Sitzung vergisst alles, was nicht dort reist.
        const wmAlt = st.worldMeta;
        const zAlt = wmAlt.bauSame ? JSON.parse(JSON.stringify(wmAlt.bauSame)) : undefined;
        const rl = {};
        try {
            rl.erst = r._bauSame("pruef:reload");
            const snapMeta = JSON.parse(JSON.stringify(r.buildStateSnapshot().worldMeta));
            rl.weiter = r._bauSame("pruef:reload");
            st.worldMeta = Object.assign({}, wmAlt, { bauSame: undefined }, snapMeta);
            delete st.worldMeta.scatterPromoted;
            rl.nachReload = r._bauSame("pruef:reload");
        } finally {
            st.worldMeta = wmAlt;
            if (zAlt === undefined) delete wmAlt.bauSame;
            else wmAlt.bauSame = zAlt;
        }
        m.reload = rl;
        m.gestartet = true;
    } catch (e) {
        out.werk = Object.assign(out.werk || {}, { err: (e && e.stack) || String(e) });
    }

    // ── Brennglas: das Licht brennt, wo es sich bündelt, und die Zerstörung nennt sich ──
    try {
        const m = { gestartet: false };
        out.brenn = m;
        if (!frei || !plat) throw new Error("kein freier Ort oder keine Genesis-Plattform");
        const zeilen = () => [...document.querySelectorAll("#chat-output > div")].map((d) => d.textContent);
        const wetterAlt = st.weather;
        const zeitAlt = st.timeOfDay;
        const takt = (s) => r._tickFocusingAffordances(s);
        try {
            st.weather = "sunny";
            // Der Zensus: Linsen der Welt, was das alte Gesetz im 4-m-Kreis erreichte, was das Licht zu Mittag erreicht.
            const R2 = r.constructor.FOCUSING_HEAT_RANGE_M ** 2;
            const linsen = st.architectures.filter((e) => e.affordances && e.affordances.focusing);
            const brennbar = (e) => {
                const b = st.blueprints[e.type];
                return b && (r.computeCompoundTags(b).brennbar || 0) >= r.constructor.BRENNBAR_TAG_MIN;
            };
            const nah = st.architectures.filter(
                (e) =>
                    !(e.affordances && e.affordances.focusing) &&
                    linsen.some((f) => (f.position.x - e.position.x) ** 2 + (f.position.z - e.position.z) ** 2 <= R2) &&
                    brennbar(e)
            );
            st.timeOfDay = 0.5;
            const licht = typeof r._sonnenRichtung === "function" ? r._sonnenRichtung() : null;
            const imLicht =
                licht && typeof r._brennpunkte === "function"
                    ? nah.filter((e) =>
                          linsen.some((f) =>
                              r._brennpunkte(f, licht).some((p) => r._traegtPunkt(e, st.blueprints[e.type], p))
                          )
                      ).length
                    : null;
            m.zensus = { linsen: [...new Set(linsen.map((e) => e.type))], altReichweite: nah.length, imLicht };
            // (1) Die Eiche 2,4 m vor der Plattform-Mitte (der Ort der Leben-Schau; direkt gesetzt — der Bau-Modus hält die
            // Lichtung seit dem Schnitt der Wege frei, hier wird das Brennglas-Gesetz allein gemessen): ein sonniger Tag.
            const P = plat.position;
            const vorn = r._blickVorn ? r._blickVorn(0, 0) : { x: 0, z: 1 };
            const eiche = r.spawnArchitecture(
                "baum_eiche",
                { x: P.x + vorn.x * 2.4, y: P.y + 1.5, z: P.z + vorn.z * 2.4 },
                { precise: true } // bit-treu wie das Setzen (confirmBuild: string-id) — keine Spieler-Klemme
            );
            m.plattform = { gesetzt: !!eiche };
            if (eiche) m.plattform.abstand = +Math.hypot(eiche.position.x - P.x, eiche.position.z - P.z).toFixed(2);
            if (eiche) {
                let maxW = 0;
                let nach = null;
                for (let s = 0; s < 480; s++) {
                    st.timeOfDay = s / 480;
                    takt(1);
                    maxW = Math.max(maxW, eiche.heatBuildup || 0);
                    if (!st.architectures.includes(eiche)) {
                        nach = s;
                        break;
                    }
                }
                m.plattform.steht = st.architectures.includes(eiche);
                m.plattform.maxWaerme = +maxW.toFixed(3);
                m.plattform.verbranntNach = nach;
                if (m.plattform.steht) r.removeArchitecture(eiche);
            }
            // (2) Die gebaute Linse (das Gesetz lebt): Quarz-Kugel im Bronze-Ring, 1 m über dem Boden, die Eiche darunter.
            const LINSE = "__werkstatt_weg_linse";
            st.blueprints[LINSE] = {
                name: LINSE,
                label: "Prüf-Linse",
                parts: [
                    {
                        shape: "sphere",
                        material: "quarz",
                        position: { x: 0, y: 1, z: 0 },
                        size: { x: 0.8, y: 0.8, z: 0.8 },
                    },
                    {
                        shape: "torus",
                        material: "bronze",
                        position: { x: 0, y: 1, z: 0 },
                        size: { x: 0.9, y: 0.15, z: 0.9 },
                    },
                ],
            };
            const L0 = { x: frei.x + 30, y: frei.y, z: frei.z };
            const linse = r.spawnArchitecture(LINSE, L0, { silent: true });
            m.linse = { gesetzt: !!(linse && linse.affordances && linse.affordances.focusing) };
            const baum = () => r.spawnArchitecture("baum_eiche", { x: L0.x + 0.3, y: L0.y, z: L0.z }, { silent: true });
            if (m.linse.gesetzt) {
                // Nachts: 30 s Sonne-Wetter ohne Sonne.
                const b0 = baum();
                st.timeOfDay = 0.0;
                for (let s = 0; s < 30; s++) takt(1);
                m.nacht = { waerme: +(b0.heatBuildup || 0).toFixed(3), steht: st.architectures.includes(b0) };
                // Kühlung: 10 s im Brennpunkt (Mittag), dann 30 s Nacht.
                st.timeOfDay = 0.5;
                for (let s = 0; s < 10; s++) takt(1);
                const nachFokus = +(b0.heatBuildup || 0).toFixed(3);
                st.timeOfDay = 0.0;
                for (let s = 0; s < 30; s++) takt(1);
                m.kuehlung = { nachFokus, nachKuehlen: +(b0.heatBuildup || 0).toFixed(3) };
                if (st.architectures.includes(b0)) r.removeArchitecture(b0);
                // Mittag: glimmen, dann brennen — im Spieler-Kanal.
                r._spielerSagtLetzte = null;
                const b1 = baum();
                st.timeOfDay = 0.5;
                const n0 = zeilen().length;
                let glimmt = null;
                let brennt = null;
                for (let s = 1; s <= 40 && st.architectures.includes(b1); s++) {
                    takt(1);
                    if (
                        glimmt == null &&
                        zeilen()
                            .slice(n0)
                            .some((z) => /glimmt/.test(z))
                    )
                        glimmt = s;
                    if (!st.architectures.includes(b1)) brennt = s;
                }
                const neu = zeilen().slice(n0);
                Object.assign(m.linse, {
                    steht: st.architectures.includes(b1),
                    waerme: +(b1.heatBuildup || 0).toFixed(3),
                    glimmtBei: glimmt,
                    brenntBei: brennt,
                    zeileGlimmt: neu.find((z) => /glimmt/.test(z)) || "",
                    zeileBrennt: neu.find((z) => /entzünd/i.test(z)) || neu.join(" | "),
                });
                if (st.architectures.includes(b1)) r.removeArchitecture(b1);
            }
            if (linse) r.removeArchitecture(linse);
            delete st.blueprints[LINSE];
            // (3) Die Räumung eines Grundrisses nimmt ein Werk des Spielers (string-id, wie das Setzen es trägt): sie nennt es.
            r._spielerSagtLetzte = null;
            const O = { x: frei.x - 30, y: frei.y, z: frei.z };
            const werk = r.spawnArchitecture("baum_eiche", O, { id: "lf-werkstatt-raeumung" });
            const n3 = zeilen().length;
            if (werk) {
                // ein Haus-Grundriss über dem Werk (wie ein Dorf, das über einem gepflanzten Baum gegründet wird) — kurz in der
                // Welt, damit das Grundriss-Gitter ihn kennt
                const haus = {
                    type: "haus_alemannisch",
                    position: { x: O.x, y: O.y, z: O.z },
                    fundament: { ex: 3, ez: 3 },
                };
                st.architectures.push(haus);
                try {
                    r._grundrissRaeumen(haus);
                } finally {
                    st.architectures.splice(st.architectures.indexOf(haus), 1);
                    r._grundrissGitter = null;
                }
            }
            m.raeumung = {
                gesetzt: !!werk,
                weg: !!werk && !st.architectures.includes(werk),
                zeile: zeilen().slice(n3).join(" | "),
            };
            if (werk && st.architectures.includes(werk)) r.removeArchitecture(werk);
        } finally {
            st.weather = wetterAlt;
            st.timeOfDay = zeitAlt;
        }
        m.gestartet = true;
    } catch (e) {
        out.brenn = Object.assign(out.brenn || {}, { err: (e && e.stack) || String(e) });
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
            phantom: { studio: true, meshes: 2, verworfen: 0 },
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
                "das Phantom ist unsichtbar (Befund Leben-Schau)",
                Object.assign({}, gesundG, { phantom: { studio: true, meshes: 2, verworfen: 2 } }),
                "das Phantom ist unsichtbar: 2/2",
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
        // Der Same des Werks: gesund ohne Täter, je Befund-Zustand (Gegenprüfung 08.10.) der Täter beim Namen.
        const gesundK = {
            gestartet: true,
            steht: 1,
            zuege: 0,
            phantomKey: "eiche|2|0",
            werkKey: "eiche|2|0",
            phantomDreh: -0.7,
            werkDreh: -0.7,
            werkSame: 1785671328,
            werkTint: "1.0/0.98/1.0",
            gesendetSame: 1785671328,
            empfang: { steht: true, key: "eiche|2|0", dreh: -0.7, tint: "1.0/0.98/1.0" },
            reload: { erst: 540370045, weiter: 490037188, nachReload: 490037188 },
        };
        check(
            "Selbst-Test Werk-Same: gesund == 0 Täter",
            werkVerdict(gesundK).length === 0,
            werkVerdict(gesundK).join(" · ")
        );
        const mitK = (o) => Object.assign({}, gesundK, o);
        for (const [name, bruch, soll] of [
            ["das Setzen würfelt (Befund: der Standard-Same)", mitK({ zuege: 1 }), "das Setzen würfelt 1×"],
            [
                "das Phantom zeigt eine andere Gestalt (Befund)",
                mitK({ werkKey: "eiche|1|0" }),
                "das Phantom zeigt eiche|2|0, es steht eiche|1|0",
            ],
            ["das Werk steht mit Drehung 0 (Befund)", mitK({ werkDreh: 0 }), "das Phantom blickt -0.7 rad"],
            [
                "der Mitspieler bekommt den Samen 0 (Befund)",
                mitK({ gesendetSame: 0 }),
                "der Mitspieler bekommt den Samen 0",
            ],
            [
                "beim Mitspieler eine andere Gestalt",
                mitK({ empfang: Object.assign({}, gesundK.empfang, { key: "eiche|1|0" }) }),
                "beim Mitspieler steht eiche|1|0",
            ],
            [
                "beim Mitspieler eine andere Tönung (Befund)",
                mitK({ empfang: Object.assign({}, gesundK.empfang, { tint: "0.89/0.92/0.95" }) }),
                "beim Mitspieler eine andere Tönung",
            ],
            [
                "der Zähler vergisst den Reload (Befund)",
                mitK({ reload: { erst: 540370045, weiter: 490037188, nachReload: 540370045 } }),
                "nach dem Reload wiederholt der Welt-Strom",
            ],
        ]) {
            const v = werkVerdict(bruch);
            check(
                `Selbst-Test Werk-Same: ‚${name}' → die Linse nennt ${soll}`,
                v.some((t) => t.startsWith(soll)),
                v.join(" · ")
            );
        }
        // Brennglas: gesund ohne Täter, je Befund-Zustand der Täter beim Namen.
        const gesundB = {
            gestartet: true,
            plattform: { gesetzt: true, abstand: 2.4, steht: true, maxWaerme: 0.2 },
            linse: {
                gesetzt: true,
                steht: false,
                waerme: 1,
                glimmtBei: 10,
                brenntBei: 20,
                zeileGlimmt: "„Eiche“ glimmt im Brennpunkt",
                zeileBrennt: "Die Sonne entzündete durch „Prüf-Linse“ „Eiche“",
            },
            nacht: { waerme: 0, steht: true },
            kuehlung: { nachFokus: 0.5, nachKuehlen: 0 },
            raeumung: { gesetzt: true, weg: true, zeile: "„Eiche“ wich dem Grundriss von „Alemannisch“." },
        };
        check(
            "Selbst-Test Brennglas: gesund == 0 Täter",
            brennVerdict(gesundB).length === 0,
            brennVerdict(gesundB).join(" · ")
        );
        const mitB = (k, o) => Object.assign({}, gesundB, { [k]: Object.assign({}, gesundB[k], o) });
        for (const [name, bruch, soll] of [
            [
                "die Plattform verbrennt die Eiche (Befund)",
                mitB("plattform", { steht: false, verbranntNach: 20 }),
                "die Eiche 2,4 m vor der Plattform-Mitte verbrannte",
            ],
            [
                "die Zerstörung steht nur im Log (Befund)",
                mitB("linse", { zeileBrennt: "" }),
                "die Zerstörung nennt sich nicht",
            ],
            ["das Glimmen schweigt", mitB("linse", { zeileGlimmt: "" }), "das Glimmen schweigt"],
            [
                "das Gesetz ist tot (die Linse brennt nicht)",
                mitB("linse", { steht: true, waerme: 0 }),
                "die gebaute Linse entzündet",
            ],
            ["nachts brennt es", mitB("nacht", { waerme: 1.5, steht: false }), "nachts erwärmt die Linse"],
            ["nichts kühlt", mitB("kuehlung", { nachKuehlen: 0.5 }), "außerhalb des Brennpunkts kühlt nichts"],
            ["die Räumung schweigt", mitB("raeumung", { zeile: "" }), "die Räumung eines Spieler-Werks schweigt"],
        ]) {
            const v = brennVerdict(bruch);
            check(
                `Selbst-Test Brennglas: ‚${name}' → die Linse nennt ${soll}`,
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
            [
                "das Brennglas erhitzt wieder den ganzen 4-m-Kreis",
                quelle.replace("if (this._traegtPunkt(target, targetBp, p)) {", "if (true) {"),
                "W5",
            ],
            [
                "das Phantom verwirft wieder jedes Fragment",
                quelle.replace("g.alphaTest = (Number.isFinite(mat.alphaTest) ? mat.alphaTest : 0) * g.opacity;", ""),
                "W6",
            ],
            [
                "der Sonnen-Winkel ein zweites Mal ausgeschrieben",
                quelle.replace("const sa = this._sonnenWinkel(t);", "const sa = t * Math.PI * 2 - Math.PI / 2;"),
                "W5",
            ],
            [
                "die Wurzel würfelt wieder (Befund)",
                quelle.replace(
                    'const seed = Number.isFinite(opts.seed) ? opts.seed : this._bauSame("bau:" + type);',
                    "const seed = Number.isFinite(opts.seed) ? opts.seed : Math.floor(Math.random() * 0xffffffff);"
                ),
                "W7",
            ],
            [
                "der Zähler wird wieder Sitzungs-Feld",
                quelle.replace(
                    'const z = wm.bauSame && typeof wm.bauSame === "object" ? wm.bauSame : (wm.bauSame = {});',
                    "const z = this._bauSameZaehler || (this._bauSameZaehler = {});"
                ),
                "W7",
            ],
            [
                "der Broadcast schickt wieder den Samen 0 (Befund)",
                quelle.replace(
                    '["spawn_blueprint", bm.blueprintName, posNode, steht.seed, archId,',
                    '["spawn_blueprint", bm.blueprintName, posNode, 0, archId,'
                ),
                "W8",
            ],
            [
                "die Vorschau hasht ihren Samen selbst",
                quelle.replace(
                    "        const seedNum = this._werkSame(bp, bpName);",
                    "        let seedNum = 0;\n        for (const c of String(bpName)) seedNum = (Math.imul(seedNum, 131) + c.charCodeAt(0)) >>> 0;"
                ),
                "W8",
            ],
            [
                "das Setzen vergisst die Drehung des Phantoms (Befund)",
                quelle.replace("                rotationY: dreh,\n", ""),
                "W8",
            ],
            [
                "ein zweites LCG im Strom-Gesetz",
                quelle.replace(
                    "        return this._samenStrom(h >>> 0);",
                    "        let st = h >>> 0 || 1;\n        return () => (st = (st * 1664525 + 1013904223) >>> 0) / 4294967296;"
                ),
                "W9",
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
        `${gm.gestartet ? `${tragen}/6 Wege tragen · ${LAGEN.map((l) => `${l}: ${WEGE.map((w) => zelle(l, w)).join(", ")}`).join(" · ")} · Werkstatt ${JSON.stringify(gm.werke)} · Phantom ${JSON.stringify(gm.phantom)} · Suche „haus" ${gm.sucheHaus} · Lichtung ${JSON.stringify({ wand: gm.lichtung && gm.lichtung.wand, steht: gm.lichtung && gm.lichtung.steht })}` : "nicht gestartet"}${vG.length ? " — Täter: " + vG.join(", ") : ""}`
    );
    console.log("=== DER SAME DES WERKS — DAS GESETZTE WERK IST DAS PHANTOM, AUCH BEIM MITSPIELER ===");
    const km = out.werk || {};
    if (km.err) check("Werk-Same Probe ohne Ausnahme", false, km.err.split("\n")[0]);
    const vK = werkVerdict(km);
    const ke = km.empfang || {};
    const kr = km.reload || {};
    check(
        "Werk-Same das Setzen stellt Gestalt und Drehung des Phantoms ohne Math.random, der Mitspieler baut dasselbe Werk, der Welt-Strom übersteht den Reload",
        vK.length === 0,
        `${km.gestartet ? `Math.random ${km.zuege} · Phantom ${km.phantomKey} @ ${km.phantomDreh} rad → Werk ${km.werkKey} @ ${km.werkDreh} rad (Same ${km.werkSame}) · gesendet Same ${km.gesendetSame} → Mitspieler ${ke.steht ? `${ke.key} @ ${ke.dreh} rad, Tönung ${ke.tint === km.werkTint ? "gleich" : "anders"}` : "nichts"} · Strom ${kr.erst} → ${kr.weiter}, nach Reload ${kr.nachReload}` : "nicht gestartet"}${vK.length ? " — Täter: " + vK.join(", ") : ""}`
    );
    console.log("=== BRENNGLAS — DAS LICHT BRENNT, WO ES SICH BÜNDELT, UND DIE ZERSTÖRUNG NENNT SICH ===");
    const bm = out.brenn || {};
    if (bm.err) check("Brennglas Probe ohne Ausnahme", false, bm.err.split("\n")[0]);
    const vB = brennVerdict(bm);
    const bp_ = bm.plattform || {};
    const bl = bm.linse || {};
    check(
        "Brennglas die Eiche an der Genesis-Plattform übersteht einen sonnigen Tag, die gebaute Linse brennt zu Mittag und sagt es, nachts nie, außerhalb kühlt es",
        vB.length === 0,
        `${bm.gestartet ? `Plattform: ${bp_.steht ? `steht nach 480 s (max. Wärme ${bp_.maxWaerme})` : `verbrannt nach ${bp_.verbranntNach} s`} · Linse: glimmt ${bl.glimmtBei} s, brennt ${bl.brenntBei} s („${(bl.zeileBrennt || "").slice(0, 60)}") · Nacht Wärme ${(bm.nacht || {}).waerme} · Kühlung ${(bm.kuehlung || {}).nachFokus} → ${(bm.kuehlung || {}).nachKuehlen} · Räumung „${((bm.raeumung || {}).zeile || "").slice(0, 60)}" · Zensus ${JSON.stringify(bm.zensus)}` : "nicht gestartet"}${vB.length ? " — Täter: " + vB.join(", ") : ""}`
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
