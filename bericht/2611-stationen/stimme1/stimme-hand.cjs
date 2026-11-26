// stimme-hand.cjs — die Leiter erleben.klang.stimme des Kandidaten von Hand in der warmen Welt der Sitzung (save-server :port,
// Werkbank :port+20000): der echte Probe-Befehl der Station aus ihrem Register, gefahren wie die Sitzung, dann je Sprosse das Urteil der
// Station — einmal mit dem Adapter der Sitzung (Wolke: „ungenannt“ → ROT R2), einmal mit dem Adapter der Probe (k2-same probenDer:
// „[linse-gpu] amd/rdna-3.5 Radeon 890M (Probe)“) — das Urteil über die WERTE, das am Gerät fiele. Vor dem Lauf setzt die Art die Welt:
//   spiel      die Welt, wie sie ist
//   heil       Mutante „das geheilte Spiel“: die Stimme liest das Geschlecht der Gestalt (b.genom.sex := Gestalt.gen.sex), danach zurück
//   stumm      Attrappe: kein Bewohner spricht (`_bewohnerLaut` gibt null) — die Tafel bleibt im Soll, der Weg des Spiels fehlt
//   zwilling   Attrappe: die Werkstatt rechnet einen anderen Leib als den des Rufs (hoeheM × 1,1 in postMessage) — nicht bit-gleich
//   pubertaet  Täter von gate:klang-zensus S21: Rachen und Kehle des Manns ohne Pubertät (STIMME.rachen = kehle = 0 in der Seite)
//   node bericht/2611-stationen/stimme1/stimme-hand.cjs <stations-datei k2-erleben.js> [art spiel] [port 4600]
// Aufruf aus der Wurzel des Spiel-Baums (die Probe liest scripts/ relativ).
"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");
const [datei, art = "spiel", port = "4600"] = process.argv.slice(2);
const W = String(Number(port) + 20000);
const ev = (code) => {
    const p = spawnSync(process.execPath, ["scripts/werkbank.cjs", "eval", code], { encoding: "utf8", env: { ...process.env, WERKBANK_PORT: W }, timeout: 60000 });
    try {
        return JSON.parse(p.stdout).ergebnis;
    } catch (e) {
        throw new Error("werkbank eval: " + String(p.stdout || p.stderr).slice(0, 300));
    }
};
const SETZE = {
    spiel: ["return 0;", "return 0;"],
    heil: [
        "const alt = (window.__stimmeHand = []); for (const Sd of r._bewohnerSiedlungen.values()) for (const b of Sd.liste || []) { const G = (Sd.gestalten || [])[b.gestalt]; if (b.genom && G && G.gen) { alt.push([b, b.genom.sex]); b.genom.sex = G.gen.sex; } } return alt.length;",
        "const alt = window.__stimmeHand || []; for (const [b, x] of alt) b.genom.sex = x; delete window.__stimmeHand; return alt.length;",
    ],
    stumm: [
        "window.__stimmeHand = Object.getOwnPropertyDescriptor(r, '_bewohnerLaut') || null; r._bewohnerLaut = () => null; return 1;",
        "delete r._bewohnerLaut; if (window.__stimmeHand) Object.defineProperty(r, '_bewohnerLaut', window.__stimmeHand); delete window.__stimmeHand; return typeof r._bewohnerLaut;",
    ],
    zwilling: [
        "const P = Worker.prototype, alt = P.postMessage; window.__stimmeHand = alt; P.postMessage = function (m, ...rest) { if (m && m.typ === 'ruf' && m.ruf && m.ruf.leib) m = Object.assign({}, m, { ruf: Object.assign({}, m.ruf, { leib: Object.assign({}, m.ruf.leib, { hoeheM: m.ruf.leib.hoeheM * 1.1 }) }) }); return alt.call(this, m, ...rest); }; return 1;",
        "Worker.prototype.postMessage = window.__stimmeHand; delete window.__stimmeHand; return 1;",
    ],
    pubertaet: [
        "const S = window.__klangCore.STIMME; window.__stimmeHand = [S.rachen, S.kehle]; S.rachen = 0; S.kehle = 0; return 1;",
        "const S = window.__klangCore.STIMME; [S.rachen, S.kehle] = window.__stimmeHand; delete window.__stimmeHand; return [S.rachen, S.kehle];",
    ],
};
if (!SETZE[art]) throw new Error("Art " + art + " (spiel · heil · stumm · zwilling · pubertaet)");
const alle = require(path.resolve(datei)).filter((s) => s.kriterium === "karte2.erleben.klang.stimme");
if (!alle.length) throw new Error("keine Station karte2.erleben.klang.stimme in " + datei);
const p = alle[0].probe;
const aus = path.join(os.tmpdir(), "stimme-hand-" + process.pid + ".json");
const t0 = Date.now();
let lauf;
console.log("SETZE " + art + " " + JSON.stringify(ev(SETZE[art][0])));
try {
    const argv = p.befehl.slice(1).map((a) => (a === "{AUS}" ? aus : a === "{PORT}" ? String(port) : a === "{SEK}" ? "35" : a));
    lauf = spawnSync(process.execPath, argv, { encoding: "utf8", timeout: 120000, maxBuffer: 1 << 26 });
} finally {
    console.log("ZURÜCK " + art + " " + JSON.stringify(ev(SETZE[art][1])));
}
const j = fs.existsSync(aus) ? JSON.parse(fs.readFileSync(aus, "utf8")) : null;
fs.rmSync(aus, { force: true });
console.log("LAUF " + ((Date.now() - t0) / 1000).toFixed(1) + " s · Exit " + lauf.status + (p.mutiert ? " · mutiert" : ""));
if (!j) {
    console.log(String(lauf.stdout).slice(-2000) + String(lauf.stderr).slice(-2000));
    process.exit(1);
}
for (const z of j.zeilen || []) console.log("ZEILE " + String(z).slice(0, 900));
const roh = { exit: lauf.status, stdout: lauf.stdout || "", stderr: lauf.stderr || "" };
const probe = Object.assign({}, j, { hw: "[linse-gpu] amd/rdna-3.5 Radeon 890M (Probe)" });
for (const s of alle) {
    const u = s.urteil(j, roh), w = s.urteil(probe, roh);
    console.log("S" + s.staffel + " Sitzung " + (u.gruen ? "GRÜN" : "ROT") + " · " + String(u.zahl).slice(0, 160));
    console.log("S" + s.staffel + " Werte   " + (w.gruen ? "GRÜN" : "ROT") + " · " + String(w.zahl).slice(0, 900));
}
for (const [nr, v] of Object.entries(j.fehler || {})) console.log("WARF S" + nr + " " + v);
