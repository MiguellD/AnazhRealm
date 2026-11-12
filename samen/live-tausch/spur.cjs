// spur.cjs — WEGWERF: die LESE-SPUR einer Messung. EINE Messung (Boot am Genesis-Ort bis zum ersten Weltbild + 60 Takte + ein
// Bild aus dem Ausgabe-Pfad) unter V8-Funktions-Abdeckung: welche Glieder des Stamms führt sie aus? Dann je Landung (die
// letzten Merges): ändert sie ein AUSGEFÜHRTES Glied (träfe die Messung am Hash), oder nur eine geladene Datei (trifft heute)?
//   node samen/live-tausch/spur.cjs [n=12]
const { execFileSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");
const acorn = require(path.join(ROOT, "node_modules/acorn"));
const { statikServer, starteBrowser } = require("../../scripts/lib/welt-boot.cjs");
const { AUSGABE_INSTALL } = require("../../scripts/lib/ausgabe-aufnahme.cjs");
const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 });
const sha = (t) => crypto.createHash("sha256").update(t).digest("hex").slice(0, 16);
function glieder(text) {
    const out = [];
    let baum;
    try {
        baum = acorn.parse(text, { ecmaVersion: "latest", sourceType: "script" });
    } catch {
        return out;
    }
    for (const n of baum.body) {
        if (n.type === "ClassDeclaration")
            for (const m of n.body.body) {
                const k = m.key && (m.key.name || m.key.value);
                out.push({ name: (m.static ? "static " : "") + (m.kind === "get" || m.kind === "set" ? m.kind + " " : "") + k, start: m.start, ende: m.end, hash: sha(text.slice(m.start, m.end)), methode: true });
            }
        else out.push({ name: "@" + sha(text.slice(n.start, Math.min(n.end, n.start + 60))), start: n.start, ende: n.end, hash: sha(text.slice(n.start, n.end)), methode: false });
    }
    return out;
}
(async () => {
    const n = +process.argv[2] || 12;
    const server = statikServer({ keinCache: true });
    await server.lausche(0);
    const browser = await starteBrowser({ art: "linse", frist: 1800000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 640, height: 360 });
    await page.coverage.startJSCoverage({ resetOnNavigation: false, useBlockCoverage: false, includeRawScriptCoverage: true });
    const t0 = Date.now();
    await server.zeige(page, 120000, "index.html?holz=kienspan");
    await page.evaluate(AUSGABE_INSTALL);
    await page.evaluate(async () => {
        await window.__weltDa(() => r && st && st._weltbildDa && r._foundry && r._foundry.recipes);
        await window.__buehne();
        await window.__takte(60, 30);
        await window.__ausgabeAufnahme(640, 360, 1, { satz: "messung" });
    });
    const messMs = Date.now() - t0;
    const abdeckung = await page.coverage.stopJSCoverage();
    await browser.close();
    server.close();
    // je Stamm-Datei: die ausgeführten Funktionen (count > 0) → die ausgeführten Glieder
    const gelaufen = new Map(); // datei → Set(name)
    let alle = 0, methoden = 0, methodenGelaufen = 0;
    for (const e of abdeckung) {
        const m = /\/(stamm\/[\w-]+\.js)/.exec(e.url);
        if (!m || !e.rawScriptCoverage) continue;
        const text = fs.readFileSync(path.join(ROOT, m[1]), "utf8");
        const G = glieder(text);
        const lief = e.rawScriptCoverage.functions.filter((f) => f.ranges[0].count > 0).map((f) => [f.ranges[0].startOffset, f.ranges[0].endOffset]);
        const S = new Set();
        for (const g of G) {
            alle++;
            if (!g.methode) { S.add(g.name); continue; } // eine Außen-Anweisung läuft beim Laden
            methoden++;
            if (lief.some(([a, b]) => a >= g.start && b <= g.ende)) { S.add(g.name); methodenGelaufen++; }
        }
        gelaufen.set(m[1], S);
    }
    console.log(`Messung (Boot Genesis → Weltbild → 60 Takte → Bild, swiftshader): ${messMs} ms; geladen ${gelaufen.size} Stamm-Dateien, ${alle} Glieder, davon ${methoden} Methoden — ausgeführt ${methodenGelaufen} (${((100 * methodenGelaufen) / methoden).toFixed(1)} %)`);
    const merges = git("log", "--first-parent", "--merges", "-" + n, "--format=%H %s").trim().split("\n");
    let trifftDatei = 0, trifftGlied = 0, mitStamm = 0;
    for (const z of merges) {
        const [m, ...rest] = z.split(" ");
        const name = rest.join(" ").replace(/^Merge /, "").replace(/ in integ-probe$/, "");
        const stamm = git("diff", "--name-only", m + "^1", m).trim().split("\n").filter((f) => /^stamm\/.*\.js$/.test(f));
        let geaendert = 0, getroffen = 0;
        const namen = [];
        for (const f of stamm) {
            let a = "", b = "";
            try { a = git("show", m + "^1:" + f); } catch {}
            try { b = git("show", m + ":" + f); } catch {}
            const A = new Map(glieder(a).map((g) => [g.name, g.hash]));
            const S = gelaufen.get(f) || new Set();
            for (const g of glieder(b)) {
                if (A.get(g.name) === g.hash) continue;
                geaendert++;
                // die Spur ist die des KOPFS: ein Glied, das es dort unter dem Namen gibt und das lief (Außen-Anweisungen laufen immer)
                if (!g.methode || S.has(g.name)) { getroffen++; namen.push(g.name.slice(0, 28)); }
            }
        }
        if (stamm.length) { mitStamm++; trifftDatei++; }
        if (getroffen) trifftGlied++;
        console.log(`${name.padEnd(26)} Dateien ${stamm.length} · geänderte Glieder ${String(geaendert).padStart(3)} · davon von der Messung ausgeführt ${String(getroffen).padStart(3)} → je Datei ${stamm.length ? "TRIFFT" : "frei  "} · je Glied ${getroffen ? "TRIFFT" : "frei  "} ${namen.slice(0, 4).join(", ")}`);
    }
    console.log(`Von ${merges.length} Landungen treffen diese Messung: je Datei geurteilt ${trifftDatei}, je ausgeführtem Glied ${trifftGlied} (Kern-Dateien nicht gezählt: sie laufen auch im Faden, den die Abdeckung der Seite nicht sieht)`);
    process.exit(0);
})().catch((e) => (console.error("FEHLER", e), process.exit(1)));
