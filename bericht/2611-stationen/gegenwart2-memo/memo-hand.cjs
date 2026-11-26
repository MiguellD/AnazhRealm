// memo-hand.cjs — der Kern-Fächer von planet.kopplung.gegenwart S2 VON HAND, mit dem Code der Station selbst (Leser 2, 26.11.).
// Die Hand liest aus der Station-Datei (stationen/k2-zusammenspiel.js) den Ausdruck, mit dem `s2Kern` belegt wird (acorn; an der
// Basis `new Promise(…)`, am Kandidaten das Memo vor dem Fächer). Sie wertet ihn so aus, wie es die Probe tut: cwd = der Spiel-Baum,
// `samenS2` = der Samen der Welt, PUNKTE_MASCHINE = punkte.cjs des pm-Baums (die Sitzung setzt es, punkte.cjs fahreStation).
// Nichts ist abgeschrieben, die Hand rechnet nichts nach.
//   node memo-hand.cjs <station-datei> <spiel-baum> <pm-punkte.cjs | -> [samen=anazh-realm-seed]
// Ausgabe: EINE Zeile JSON mit dem, was die Station daraus macht (gipfelProzent, landProzent wie k2-zusammenspiel.js aus[2]) und
// dem Fingerabdruck der Saaten (sha256 über samen · gipfel · konv · land · landKonv in der Saat-Folge).
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const [datei, baum, maschine, samen = "anazh-realm-seed"] = process.argv.slice(2);
const acorn = require(require.resolve("acorn", { paths: [path.resolve(baum), __dirname, process.cwd()] }));
const quelle = fs.readFileSync(path.resolve(datei), "utf8");
const funde = [];
(function lauf(n) {
    if (!n || typeof n.type !== "string") return;
    if (n.type === "VariableDeclarator" && n.id && n.id.name === "s2Kern" && n.init) funde.push(quelle.slice(n.init.start, n.init.end));
    for (const k of Object.keys(n)) {
        const v = n[k];
        if (Array.isArray(v)) v.forEach(lauf);
        else if (v && typeof v.type === "string") lauf(v);
    }
})(acorn.parse(quelle, { ecmaVersion: "latest", sourceType: "script", allowHashBang: true }));
if (funde.length !== 1) throw new Error(datei + ": " + funde.length + " Belegungen von s2Kern (Soll 1)");
// die Probe trägt die Leiter als `knapp(L.mess)` (stationen/k2-planet.js, seite.cjs): ohne Zeilen-Kommentare, ohne Einzug — dieselben
// Bytes des Fächer-Arbeiters, also derselbe Schlüssel wie am Gerät
const { knapp } = require(path.join(path.dirname(path.resolve(datei)), "seite.cjs"));
process.chdir(path.resolve(baum));
if (maschine && maschine !== "-") process.env.PUNKTE_MASCHINE = path.resolve(maschine).split(path.sep).join("/");
else delete process.env.PUNKTE_MASCHINE;
const t0 = Date.now();
new Function("samenS2", "require", "process", "return (" + knapp(funde[0]) + ");")(samen, require, process).then((g) => {
    const ms = Date.now() - t0;
    const folge = g.saatFolge || [];
    const je = (g.je || []).slice().sort((a, b) => folge.indexOf(a.samen) - folge.indexOf(b.samen));
    const finger = crypto.createHash("sha256").update(JSON.stringify(je.map((x) => [x.samen, x.gipfel, x.konv, x.land, x.landKonv]))).digest("hex").slice(0, 16);
    console.log(JSON.stringify({
        gipfelProzent: g.gipfel ? Math.round((1000 * g.konv) / g.gipfel) / 10 : null,
        landProzent: g.land ? Math.round((1000 * g.landKonv) / g.land) / 10 : null,
        streuung: g.streuung, saaten: g.saaten, gipfel: g.gipfel, konv: g.konv, land: g.land, landKonv: g.landKonv, antworten: g.antworten,
        unter95: (g.unter95 || []).slice().sort(), finger, kernAus: g.kernAus === undefined ? "(Basis: kein Feld)" : g.kernAus,
        kernSchluessel: g.kernSchluessel, faeden: g.faeden, msFaecher: g.ms, msHand: ms, version: g.version,
    }));
}, (e) => { console.log(JSON.stringify({ wurf: String((e && e.stack) || e).slice(0, 600) })); process.exitCode = 2; });
