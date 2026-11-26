// kosmos-bahn systeme#1, Kandidat 2 am Prüfstand — WIE AM GERÄT: der Befehl der Station (der Text hinter `node -e`, den die Maschine
// fährt) wird gelesen, nie ihr Modul: `H.seite` (FAECHER, HIMMEL_AN) und der Lauf `systemeLauf` reisen als TEXT in diesen Prozess, der
// Fächer schickt HIMMEL_AN als Text in eine Null-Welt des Spiels (welt-boot `nullWelt`), jede Seiten-Probe läuft im Rumpf der Werkbank
// (`/eval`: wirt-wache `evalRumpf`, `new Function("r", "T", "__wirtMarke", …)(r, THREE, …)`). Nur das Gerüst der Leiter ist Attrappe
// (L.je · zeile · leser · gemessen · umfang · rest · preisPose) — es schreibt mit, was die Station urteilt.
// Der Prüfstand bis Kandidat 2 (pruefstand-systeme-s1.cjs) zog MOND_EPHEMERIDE aus dem Modul in Node (`new Function`) und maß 0,082°;
// am Gerät reiste HIMMEL_AN ohne sie und warf an 1460 von 1460 Adressen (OMEN a954d698). Drei Fälle:
//   EICHUNG  die Station von punkte-maschine (alt): ihr Lauf wirft „Cannot read properties of null (reading 'toFixed')“, die Akte
//            „0/1460 … 1460 warfen (MOND_EPHEMERIDE is not defined)“ — die Zeile des Geräts, hier nachgestellt
//   LEER     der Lauf des Kandidaten mit dem alten HIMMEL_AN (der leere Fächer): ein Leser beim Namen, nie ein Wurf
//   VOLL     der Kandidat ganz: gemessen an allen Adressen, ephemeride_abw_grad im Soll ≤ 0,5° (die Sprosse)
// Aufruf: node pruefstand-systeme-s1-kand2.cjs <Spiel-Baum> <punkte-Verzeichnis> <git-Rev der alten Station im punkte-Baum>
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const [SPIEL, PUNKTE, ALT_REV] = process.argv.slice(2);
if (!SPIEL || !PUNKTE || !ALT_REV) throw new Error("Aufruf: <Spiel-Baum> <punkte-Verzeichnis> <git-Rev der alten Station>");
const WBOOT = require(path.join(SPIEL, "scripts/lib/welt-boot.cjs"));
const { evalRumpf } = require(path.join(SPIEL, "scripts/lib/wirt-wache.cjs"));
const acorn = require(require.resolve("acorn", { paths: [SPIEL] }));
const SD = path.join(PUNKTE, "stationen"), SCHLUESSEL = "karte2.planet.kosmos.systeme#1";
const P = require(path.join(PUNKTE, "punkte.cjs"));

// DER BEFEHL EINER STATION (die Datei liegt im Verzeichnis der Stationen: sie zieht ./k2-same.js und ./faecher.js) → die reisenden Texte
function reisend(datei) {
    const m = require(datei);
    const st = m.find((s) => P.schluessel(s) === SCHLUESSEL);
    const b = st.probe ? st.probe.befehl : st.befehl;
    const code = b[b.indexOf("-e") + 1];
    const ast = acorn.parse(code, { ecmaVersion: "latest", sourceType: "script", allowReturnOutsideFunction: true });
    let seite = null, lauf = null;
    const geh = (n) => {
        if (!n || typeof n.type !== "string") return;
        if (n.type === "AssignmentExpression" && n.left.type === "MemberExpression" && n.left.property.name === "seite" && n.right.type === "ObjectExpression") seite = code.slice(n.right.start, n.right.end);
        if (n.type === "FunctionExpression" && n.id && n.id.name === "systemeLauf") lauf = code.slice(n.start, n.end);
        for (const k of Object.keys(n)) for (const c of [n[k]].flat()) if (c && typeof c === "object" && k !== "type") geh(c);
    };
    geh(ast);
    if (!seite || !lauf) throw new Error(datei + ": der Befehl trägt " + (seite ? "" : "kein H.seite ") + (lauf ? "" : "keinen systemeLauf"));
    // wie `node -e`: die Texte werden in einem Rahmen OHNE das Modul der Station gebaut (nur Node und das Gerüst)
    return { seite: new Function("return (" + seite + ");")(), lauf: new Function("return (" + lauf + ");")() };
}
const altDatei = path.join(SD, ".k2-kosmos-alt-" + process.pid + ".js");
fs.writeFileSync(altDatei, cp.execFileSync("git", ["show", ALT_REV + ":meisterkarte-quelle/punkte/stationen/k2-kosmos.js"], { cwd: PUNKTE, encoding: "utf8", maxBuffer: 64 << 20 }));
let ALT, NEU;
try {
    ALT = reisend(altDatei);
    NEU = reisend(path.join(SD, "k2-kosmos.js"));
} finally {
    fs.unlinkSync(altDatei);
}

(async () => {
    const t0 = Date.now();
    const server = WBOOT.statikServer();
    const { browser, page } = await WBOOT.nullWelt(server, { da: (r) => r.state && r.state.player, frist: 300000 }, 120000);
    const tBoot = Date.now() - t0;
    const ev = (code) => page.evaluate((rumpf) => new Function("r", "T", "__wirtMarke", rumpf)(r, THREE, null), evalRumpf(code));
    // das Gerüst der Leiter als Attrappe: es schreibt mit, was die Station urteilt (k2-same.js L.* gleichnamig)
    const fahre = async (lauf, seite) => {
        const spur = [];
        const L = {
            ev: (c) => ev(c),
            rest: () => 60,
            zeile: (z) => spur.push(["zeile", String(z).slice(0, 300)]),
            je: async (nr, f) => (nr === 1 ? f() : null),
            leser: (nr, fehlt, erzeugt) => spur.push(["leser", nr, String(fehlt), erzeugt]),
            gemessen: (nr, mass, beleg) => spur.push(["gemessen", nr, mass, String((beleg && beleg.taeter) || "").slice(0, 300)]),
            umfang: () => null,
            preisPose: () => null,
        };
        const t = Date.now();
        try {
            await lauf({ seite }, {}, L);
            return { spur, ms: Date.now() - t };
        } catch (e) {
            return { spur, ms: Date.now() - t, warf: String((e && e.message) || e) };
        }
    };
    const eich = await fahre(ALT.lauf, ALT.seite);
    const leer = await fahre(NEU.lauf, { ...NEU.seite, HIMMEL_AN: ALT.seite.HIMMEL_AN });
    const voll = await fahre(NEU.lauf, NEU.seite);
    await browser.close();
    server.close();
    const akte = (f) => (f.spur.find((s) => s[0] === "zeile" && /^Systeme S1:/.test(s[1])) || [])[1] || "";
    const leserVon = (f) => f.spur.find((s) => s[0] === "leser" && s[1] === 1);
    const gemVon = (f) => f.spur.find((s) => s[0] === "gemessen" && s[1] === 1);
    const pruef = [
        ["EICHUNG die alte Station wirft am Gerät-Text wie am OMEN (null.toFixed, 1460 warfen MOND_EPHEMERIDE)",
            /Cannot read properties of null \(reading 'toFixed'\)/.test(eich.warf || "") && /Fächer 0\/1460 .*1460 warfen \(MOND_EPHEMERIDE is not defined\)/.test(akte(eich)), eich.warf + " · " + akte(eich).slice(0, 160)],
        ["LEER der leere Fächer ist ein Leser beim Namen (maß 0 von 1460, die Akte trägt den Wurf), kein Wurf",
            !leer.warf && !!leserVon(leer) && /der Fächer maß 0 von 1460 Adressen · Fächer 0\/1460 .*MOND_EPHEMERIDE is not defined/.test(leserVon(leer)[2]) && leserVon(leer)[3] === 0 && !gemVon(leer),
            (leer.warf || "") + " · " + JSON.stringify(leserVon(leer) || null).slice(0, 220)],
        ["VOLL der Kandidat misst alle 1460 Adressen, ephemeride_abw_grad im Soll ≤ 0,5°",
            !voll.warf && !!gemVon(voll) && Number.isFinite(gemVon(voll)[2].ephemeride_abw_grad) && gemVon(voll)[2].ephemeride_abw_grad <= 0.5 && /Fächer 1460\/1460 /.test(akte(voll)) && !leserVon(voll),
            (voll.warf || "") + " · " + JSON.stringify(gemVon(voll) || null).slice(0, 260)],
    ];
    for (const [name, ok, beleg] of pruef) console.log((ok ? "✅ " : "❌ ") + name + "\n     " + beleg);
    console.log(JSON.stringify({ bootMs: tBoot, eichMs: eich.ms, leerMs: leer.ms, vollMs: voll.ms, vollGrad: gemVon(voll) ? gemVon(voll)[2].ephemeride_abw_grad : null }));
    const rot = pruef.filter((p) => !p[1]).length;
    console.log(rot ? "PRÜFSTAND ROT: " + rot + " von 3" : "PRÜFSTAND GRÜN: 3 von 3");
    process.exit(rot ? 1 : 0);
})().catch((e) => {
    console.log("PRÜFSTAND WARF: " + ((e && e.stack) || e));
    process.exit(2);
});
