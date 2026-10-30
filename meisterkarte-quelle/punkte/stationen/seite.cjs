// stationen/seite.cjs — DIE PROBE AN DER SEITE DER SITZUNG (Zweig proben-leib, 29.10.; das Gesetz des Schöpfers: „eine komplette
// Fahrt durch jedes System max 30 min, inbegriffen die Dauerlast"). Kein Stations-Blatt (punkte.cjs lädt nur g1 … g6): der EINE
// Läufer der Proben, deren Linse bis dahin ihre eigene Welt bootete (diag-koerper-stand, diag-kamera-laub, diag-kampf-gefuehl,
// diag-portal-konformanz, diag-haus-welt — 4–10 min je Station, der Boot und der Rundgang darin). Die Welt steht schon (save-server
// {PORT}, `werkbank start --echt` auf {PORT}+20000, punkte.cjs fahreSitzung); die Probe ruft in ihr die SEITEN-FUNKTIONEN der Linse
// selbst — gelesen aus der Datei des Spiel-Baums am SHA (`H.quelle`, acorn: die benannten Deklarationen der obersten Ebene), nie
// abgeschrieben: die Linse bleibt die EINE Quelle der Messung und ihres Urteils, die Probe wählt nur, was das Kriterium braucht.
// Die Hilfen der Probe (H):
//   ruf(weg, o)   ein Befehl an die Werkbank der Sitzung (POST; `fehler` wirft beim Namen)
//   seite(code)   ein Funktionsrumpf in der Seite (r = Welt, T = THREE; die Werkzeuge der Werkbank und welt-boot stehen dort)
//   quelle(datei, namen, mit, extra)   die benannten Deklarationen, in node ausgewertet (eine Funktion trägt ihren Text: die Seite
//                 bekommt String(fn)); `mit` die freien Namen (halteBis …), `extra` weitere Rückgaben (ein Getter auf ein `let`)
//   cdp()         die Seite der Sitzung als puppeteer-Page (Rahmen, Tastatur, Bild): der Browser der Werkbank über seinen
//                 DevToolsActivePort im Profil werkbank-profil-<WERKBANK_PORT>-*; die Probe trennt sich am Ende, schließt nie
//   frist(s)      DIE FRIST IN DER SEITE: nach s Sekunden (Vorgabe der Deckel des Laufs − 6) wirft jeder Takt (`_gameLoopTick`,
//                 `_loopFixedStep`) — eine Probe über ihrem Deckel hält die Welt der Sitzung nie fest (die Grundstellung danach findet
//                 eine freie Seite); gerissen schreibt der Läufer die Marke „@@PUNKTE@@ FRIST <s> s der Probe gerissen“ (punkte.cjs
//                 FRIST_MARKE: kein Urteil, UNGEMESSEN). Am Ende der Probe fällt die Hülle (w4-sitzung-urteil: sie blieb auf der Instanz,
//                 jede Probe danach in derselben Seite warf an jedem Takt „die Frist der Probe“ — die Grundstellung setzt keine Methode zurück)
//   schritt(n)    die Zeit bis hier („@@PUNKTE@@ ZEIT n s"): wohin die Sekunden der Probe gehen
"use strict";

// der Text einer Funktion für argv: ohne Zeilen-Kommentare, ohne Einzug (wie g2 `knapp`)
const knapp = (fn) => String(fn).replace(/\n\s*\/\/[^\n]*/g, "").replace(/\n\s+/g, "\n");

// DER LÄUFER (node, cwd = der Spiel-Baum der Sitzung; argv: {AUS} {PORT} {SEK} art — {SEK} der Deckel DIESES Laufs, punkte.cjs ersetze).
// Exit: der der Art (0 grün nach ihrem Urteil), 2 eine Ausnahme beim Namen, 3 die Frist der Seite riss
async function seiteLauf() {
    const fs = require("fs");
    const path = require("path");
    const [aus, port, sek, artText] = process.argv.slice(1);
    const W = Number(port) + 20000;
    const WB = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const t0 = Date.now();
    const uhr = () => ((Date.now() - t0) / 1000).toFixed(1);
    const H = { aus, port: Number(port), W, sek: Number(sek), WB, ende: [] };
    H.ruf = async (weg, o) => {
        const a = await WB.werkbankRuf(W, weg, o || {});
        if (!a || a.fehler || a.roh !== undefined) throw new Error(weg + ": " + JSON.stringify(a).slice(0, 400));
        return a;
    };
    H.seite = async (code) => (await H.ruf("/eval", { code })).ergebnis;
    H.schritt = (n) => console.log("@@PUNKTE@@ ZEIT " + n + " " + uhr() + " s");
    H.quelle = (datei, namen, mit = {}, extra = "") => {
        const acorn = require(path.resolve("node_modules/acorn"));
        const t = fs.readFileSync(path.resolve(datei), "utf8");
        const teile = [];
        const da = new Set();
        for (const n of acorn.parse(t, { ecmaVersion: "latest", sourceType: "script", allowHashBang: true }).body) {
            const je = n.type === "FunctionDeclaration" ? [n.id.name] : n.type === "VariableDeclaration" ? n.declarations.map((d) => d.id.name) : [];
            if (!je.some((x) => namen.includes(x))) continue;
            teile.push(t.slice(n.start, n.end));
            je.forEach((x) => da.add(x));
        }
        const fehlt = namen.filter((x) => !da.has(x));
        if (fehlt.length) throw new Error(datei + " trägt " + fehlt.join(", ") + " nicht (mehr) auf der obersten Ebene");
        const k = Object.keys(mit);
        return new Function(...k, "require", teile.join("\n") + "\nreturn { " + namen.join(", ") + (extra ? ", " + extra : "") + " };")(...k.map((x) => mit[x]), require);
    };
    H.cdp = async () => {
        if (H.page) return H.page;
        const os = require("os");
        const pp = require(path.resolve("node_modules/puppeteer"));
        const marke = (d) => path.join(d, "DevToolsActivePort");
        const dirs = fs.readdirSync(os.tmpdir()).filter((d) => d.startsWith("werkbank-profil-" + W + "-")).map((d) => path.join(os.tmpdir(), d))
            .filter((d) => fs.existsSync(marke(d))).sort((a, b) => fs.statSync(marke(b)).mtimeMs - fs.statSync(marke(a)).mtimeMs);
        for (const d of dirs) {
            const [p, weg] = fs.readFileSync(marke(d), "utf8").split(/\r?\n/);
            let b = null;
            try {
                b = await pp.connect({ browserWSEndpoint: "ws://127.0.0.1:" + p + weg, defaultViewport: null, protocolTimeout: H.sek * 1000 });
            } catch (_e) {
                continue;
            }
            const alle = (await b.pages()).filter((x) => /\/index\.html/.test(x.url()));
            const seite = alle.find((x) => x.url().includes(":" + port + "/")) || (alle.length === 1 ? alle[0] : null);
            if (!seite) {
                await b.disconnect();
                continue;
            }
            Object.assign(H, { browser: b, profil: d, page: seite });
            return seite;
        }
        throw new Error("kein Browser der Sitzung (DevToolsActivePort in " + os.tmpdir() + "/werkbank-profil-" + W + "-*)");
    };
    H.frist = (s = H.sek - 6) => {
        H.fristS = Math.max(5, s);
        return H.seite("window.__probeFrist = false; const f = performance.now() + " + H.fristS * 1000 + "; window.__probeFristAlt = window.__probeFristAlt || {}; " +
            "for (const m of [\"_gameLoopTick\", \"_loopFixedStep\"]) { const alt = r[m]; if (!(m in window.__probeFristAlt)) window.__probeFristAlt[m] = Object.prototype.hasOwnProperty.call(r, m) ? alt : null; " +
            "r[m] = function () { if (performance.now() > f) { window.__probeFrist = true; throw new Error(\"die Frist der Probe\"); } return alt.apply(this, arguments); }; } return 1;");
    };
    // die Karte der Welt (ihr Zeuge im Log der Werkbank)
    const log = process.env.PUNKTE_SITZUNG_LOG && fs.existsSync(process.env.PUNKTE_SITZUNG_LOG) ? fs.readFileSync(process.env.PUNKTE_SITZUNG_LOG, "utf8") : "";
    for (const z of log.split(/\r?\n/)) if (/^\[linse-gpu\] /.test(z)) console.log(z);
    let code = 0;
    try {
        if (!(H.sek > 6)) throw new Error("der Deckel des Laufs fehlt (argv „" + sek + "“: der Läufer ersetzt den Platzhalter SEK)");
        code = (await eval("(" + artText + ")")(H)) || 0;
    } catch (e) {
        console.log("@@PUNKTE@@ FEHLER " + String((e && e.stack) || e).split("\n").slice(0, 4).join(" | ").slice(0, 600));
        code = 2;
    }
    for (const f of H.ende) await Promise.resolve().then(f).catch(() => {});
    if (H.browser) await H.browser.disconnect().catch(() => {});
    // die Hülle der Frist fällt (das Eigene der Instanz kehrt zurück, sonst wieder der Prototyp); gerissen die EINE Marke (FRIST_MARKE)
    const riss = await H.seite("const alt = window.__probeFristAlt || {}; for (const m of Object.keys(alt)) { if (alt[m]) r[m] = alt[m]; else delete r[m]; } " +
        "delete window.__probeFristAlt; const riss = window.__probeFrist === true; window.__probeFrist = false; return riss;").catch(() => false);
    if (riss === true) {
        console.log("@@PUNKTE@@ FRIST " + H.fristS + " s der Probe gerissen (Deckel " + H.sek + " s): jeder Takt danach warf");
        code = code || 3;
    }
    console.log("@@PUNKTE@@ PROBE " + uhr() + " s · Exit " + code);
    process.exit(code);
}

// DIE PROBE einer Station: der Läufer und die Art (`async (H) => exit`, ohne freie Namen außer H, fs, path, require), der Deckel
// `sek` (die Frist liest der Läufer aus {SEK}, dem Deckel des Laufs — nie eine zweite Zahl); `zusatz` trägt mutiert (die Probe ändert
// die Welt) und ausnahme (der Grund für einen Deckel über 45 s)
const seiteProbe = (sek, art, zusatz = {}) => ({
    sek,
    befehl: ["node", "-e", "(" + knapp(seiteLauf) + ")()", "{AUS}", "{PORT}", "{SEK}", knapp(art)],
    ...zusatz,
});

module.exports = { seiteProbe, knapp };
