// bev-hand.cjs — die Station mensch.menge.bevoelkerung#1 von Hand in der warmen Welt der Sitzung (save-server :port, Werkbank
// :port+20000). Zwei Wege, beide mit dem Code der Station aus der gegebenen Datei (Basis oder Kandidat) und ihrem Urteil — einmal mit
// dem Adapter der Sitzung (Wolke: „ungenannt“ → ROT), einmal mit dem Adapter der Probe (das Urteil über die WERTE):
//   -            der Probe-Befehl der Station, wie die Sitzung ihn fährt (umstellen --ort genesis, dann die Zählung)
//   <schlüssel>  die Seiten-Funktion der Station (aus ihrem Befehl gelesen) am Dorf <schlüssel> aus r._bewohnerSiedlungen statt am
//                Dorf nächst der Start-Zelle — der Ort des Täters in der Wolke (d:7@100,0: der Wirt hinter einem Haus)
// Art (vor dem Lauf gesetzt, danach zurück):
//   spiel        die Welt, wie sie ist
//   drinnen      Mutante „das Spiel verliert einen Menschen“: nach jedem Takt trägt der Leib des Wirts (rolle gasthaus) `_drinnen`
//                — er steht am Ort, gezeichnet nicht: fehlt 1 → ROT, nie grün
//   node bericht/2611-stationen/bevoelkerung1/bev-hand.cjs <g2.js> [- | schlüssel] [spiel | drinnen] [port 4600]
// Aufruf aus der Wurzel des Spiel-Baums.
"use strict";
const fs = require("fs"), path = require("path"), os = require("os");
const { spawnSync } = require("child_process");
const [datei, dorfK = "-", art = "spiel", port = "4600"] = process.argv.slice(2);
const W = String(Number(port) + 20000);
const ev = (code, ms = 60000) => {
    const p = spawnSync(process.execPath, ["scripts/werkbank.cjs", "eval", code], { encoding: "utf8", env: { ...process.env, WERKBANK_PORT: W }, timeout: ms, maxBuffer: 1 << 26 });
    try { const t = p.stdout; return JSON.parse(t.slice(t.indexOf("{"))); } catch (e) { throw new Error("werkbank eval: " + String(p.stdout || p.stderr).slice(0, 300)); }
};
const SETZE = {
    spiel: ["return 0;", "return 0;"],
    drinnen: [
        "const t0 = r._gameLoopTick; window.__bevHand = t0; r._gameLoopTick = function (...a) { const x = t0.apply(this, a); for (const o of r.state.scene.children) { const u = o && o.userData; if (u && u._feldLageVon && u._feldLageVon.b && u._feldLageVon.b.rolle === 'gasthaus') u._drinnen = true; } return x; }; return 1;",
        "delete r._gameLoopTick; if (r._gameLoopTick !== window.__bevHand) r._gameLoopTick = window.__bevHand; delete window.__bevHand; return 1;",
    ],
};
if (!SETZE[art]) throw new Error("Art " + art + " (spiel · drinnen)");
const S = require(path.resolve(datei)).find((s) => s.kriterium === "karte2.mensch.menge.bevoelkerung" && s.staffel === 1);
if (!S) throw new Error("keine Station karte2.mensch.menge.bevoelkerung#1 in " + datei);
const p = S.probe;
const t0 = Date.now();
let stdout = "", exit = 0, stderr = "";
console.log("SETZE " + art + " " + JSON.stringify(ev(SETZE[art][0]).ergebnis));
try {
    if (dorfK === "-") {
        const aus = path.join(os.tmpdir(), "bev-hand-" + process.pid + ".json");
        const sub = (a) => a.replace(/\{AUS\}/g, aus).replace(/\{PORT\}/g, port).replace(/\{SEK\}/g, String(p.sek));
        const lauf = spawnSync(p.befehl[0], p.befehl.slice(1).map(sub), { encoding: "utf8", timeout: p.sek * 2000, maxBuffer: 1 << 27 });
        stdout = lauf.stdout || ""; stderr = lauf.stderr || ""; exit = lauf.status;
    } else {
        const b = p.befehl[2], a = b.indexOf("eval 'return await ("), e = b.indexOf(")(r, T);'", a);
        let code = b.slice(a + "eval '".length, e + ")(r, T);".length);
        const wahl = "const S = dorf();";
        if (!code.includes(wahl)) throw new Error("die Wahl des Dorfs fehlt im Code der Station");
        code = code.replace(wahl, "const S = r._bewohnerSiedlungen.get(" + JSON.stringify(dorfK) + ");");
        const j = ev(code, 600000);
        stdout = "[linse-gpu] ungenannt\nZAEHLUNG " + JSON.stringify(j.ergebnis || { fehler: String(j.fehler || "ohne Antwort").slice(0, 300) });
    }
} finally {
    console.log("ZURÜCK " + art + " " + JSON.stringify(ev(SETZE[art][1]).ergebnis));
}
console.log("LAUF " + ((Date.now() - t0) / 1000).toFixed(1) + " s · Exit " + exit + " · Dorf " + dorfK);
const zl = (stdout.match(/^ZAEHLUNG (.*)$/m) || [])[1];
if (zl) { const z = JSON.parse(zl); for (const q of z.proben || []) if (q.gesperrt && q.gesperrt.length || q.ist !== q.soll || q.fehlt || q.versuche > 1) console.log("PROBE " + JSON.stringify(q)); console.log("DORF " + z.bewohner + " Bewohner · Orte " + JSON.stringify(z.orte)); }
else console.log(stdout.slice(-1500) + stderr.slice(-1500));
const roh = { exit, stdout, stderr };
const ad = (stdout.match(/\[linse-gpu\][^\n]*/) || [""])[0];
const u = S.urteil(null, roh), w = S.urteil(null, Object.assign({}, roh, { stdout: ad ? stdout.split(ad).join("[linse-gpu] amd/rdna-3 (Probe)") : stdout }));
console.log("Sitzung " + (u.gruen ? "GRÜN" : "ROT") + " · " + String(u.zahl).slice(0, 300));
console.log("Werte   " + (w.gruen ? "GRÜN" : "ROT") + " · " + String(w.zahl).slice(0, 1200));
