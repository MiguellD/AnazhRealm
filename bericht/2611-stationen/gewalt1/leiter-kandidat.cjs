// leiter-kandidat.cjs (= leiter-hand.cjs, wie aufwaerts1/s1-kandidat.cjs) — EINE Leiter einer K2-Perspektive von Hand in einer warmen Welt: der echte Probe-Befehl der Station (aus ihrem Register),
// sein LEITERN auf die eine Leiter geschnitten, gefahren wie die Sitzung (seiteLauf: argv aus · port · sek · art, Werkbank auf port + 20000),
// dann das Urteil der Station über das JSON. Aufruf aus der Wurzel des Spiel-Baums (die Probe liest scripts/lib relativ):
//   node leiter-hand.cjs <stations-datei> <kriterium> <leiter> <port> [nr,nr]
// Rückgabe: je Sprosse das Urteil der Station (gruen · zahl) und die Roh-Werte der Leiter.
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const [datei, kriterium, leiter, port, nurNr] = process.argv.slice(2);
const st = require(path.resolve(datei));
const alle = st.filter((s) => s.kriterium === kriterium);
if (!alle.length) throw new Error("kein Kriterium " + kriterium + " in " + datei);
const p = alle[0].probe;
const art = p.befehl[p.befehl.length - 1];
const kopf = "const LEITERN = {";
const i = art.indexOf(kopf);
const ende = art.indexOf("}; return (", i);
if (i < 0 || ende < 0) throw new Error("kein LEITERN im Probe-Befehl");
const stuecke = art.slice(i + kopf.length, ende).split(/,\n(?="[a-z]+\.[a-z]+\.[a-z0-9]+": \{ sek: \d+, U: )/);
const meins = stuecke.find((s) => s.startsWith(JSON.stringify(leiter) + ": { sek: "));
if (!meins) throw new Error("die Leiter " + leiter + " fehlt in LEITERN (" + stuecke.map((s) => s.slice(0, 40)).join(" | ") + ")");
const artEins = art.slice(0, i + kopf.length) + meins + art.slice(ende);
const aus = path.join(path.dirname(process.argv[1]), "hand-" + leiter + ".json");
fs.rmSync(aus, { force: true });
const sek = Number(meins.match(/sek: (\d+)/)[1]) + 15;
const t0 = Date.now();
const argv = p.befehl.slice(1, -1).map((a) => (a === "{AUS}" ? aus : a === "{PORT}" ? String(port) : a === "{SEK}" ? String(sek) : a));
const lauf = spawnSync(process.execPath, [...argv, artEins], { encoding: "utf8", timeout: (sek + 30) * 1000, maxBuffer: 1 << 26 });
const j = fs.existsSync(aus) ? JSON.parse(fs.readFileSync(aus, "utf8")) : null;
const L = j && j.leitern && j.leitern[leiter];
console.log("LAUF " + ((Date.now() - t0) / 1000).toFixed(1) + " s · Exit " + lauf.status + " · Leiter " + (L ? L.s + " s" + (L.warf ? " warf: " + L.warf : "") + (L.raffer ? " raffer " + JSON.stringify(L.raffer) : "") : "fehlt"));
if (!L) console.log(String(lauf.stdout).slice(-1500) + String(lauf.stderr).slice(-1500));
const nur = nurNr ? nurNr.split(",").map(Number) : null;
for (const s of alle) {
    if (nur && !nur.includes(s.staffel)) continue;
    const u = s.urteil(j, { exit: lauf.status, stdout: lauf.stdout || "", stderr: lauf.stderr || "" });
    console.log("S" + s.staffel + " " + (u.gruen ? "GRÜN" : u.ungemessen ? "UNGEMESSEN" : "ROT") + " · " + String(u.zahl).slice(0, 400));
}
if (L) for (const [nr, v] of Object.entries(L.sprossen || {})) if (!nur || nur.includes(Number(nr))) console.log("ROH S" + nr + " " + JSON.stringify(v).slice(0, 1500));
