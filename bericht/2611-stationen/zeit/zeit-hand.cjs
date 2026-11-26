// zeit-hand.cjs — DIE UHR DER LEITER von Hand (Leser 2, 26.11., Auftrag des Koordinators 07:37): der ECHTE Probe-Befehl einer
// Station der Karte 2 (Kern k2-planet · Gerüst k2-same · Fabrik k2-mensch), gefahren vom ECHTEN Läufer (punkte.cjs fahreStation)
// gegen die warme Welt einer Werkbank — dann jede Station der Leiter über ihr Urteil (der Leser des Spiels). Gedruckt: die Sekunden der
// Leiter, jede Zeile `@@PUNKTE@@ ZEIT <leiter> <schritt> <ms>` des Stroms, der längste Schritt (seite.cjs laengsterSchritt) und der
// Grund, den die Maschine schreibt. Wie der Selbsttest FRIST IM MESSORT fährt die Probe als `befehl` (ohne Sitzung, ohne Schloss): der
// Port steht schon im Befehl, der Läufer räumt keinen Port; {SEK} ist der Deckel der Probe (die Frist 6 s darunter).
//   Kern: die Probe der Perspektive geschnitten auf die EINE Leiter; [leiter-sek] stellt ihren Deckel (L.sek) — der erzwungene Riss.
// Aufruf im Spiel-Baum (cwd = Wurzel des Spiels, die Werkbank läuft dort mit --seite http://localhost:<S>):
//   node <dies> <punkte-dir> <stations-datei> <leiter> <W-Port> <sek> [leiter-sek]
"use strict";
const fs = require("fs"), path = require("path"), os = require("os");
const [DIR0, DATEI, LEITER, WPORT, SEK, LSEK] = process.argv.slice(2);
const DIR = path.resolve(DIR0);
const P = require(path.join(DIR, "punkte.cjs"));
const { laengsterSchritt } = require(path.join(DIR, "stationen", "seite.cjs"));
const M = require(path.join(DIR, "stationen", DATEI));
const alle = M.filter((s) => s.kriterium === "karte2." + LEITER).sort((a, b) => a.staffel - b.staffel);
if (!alle.length) throw new Error("keine Station karte2." + LEITER + " in " + DATEI);
let befehl = alle[0].probe.befehl.slice();
const ai = befehl.findIndex((a) => String(a).includes("const LEITERN = {"));
if (ai >= 0) {
    const anker = "}; return (async function probeRumpf(";
    if (befehl[ai].split(anker).length !== 2) throw new Error("der Anker des Kerns steht nicht genau einmal in der Art");
    const id = JSON.stringify(LEITER);
    befehl[ai] = befehl[ai].replace(anker, () => "}; for (const k of Object.keys(LEITERN)) if (k !== " + id + ") delete LEITERN[k]; if (!LEITERN[" + id + "]) throw new Error(\"die Leiter fehlt\");" +
        (LSEK ? " LEITERN[" + id + "].sek = " + Number(LSEK) + ";" : "") + " return (async function probeRumpf(");
}
befehl = befehl.map((a) => (a === "{PORT}" ? String(Number(WPORT) - 20000) : a));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "zeit-hand-"));
const ctx = { baum: process.cwd(), koord: path.resolve(DIR, "..", ".."), port: null, aus: path.join(tmp, "aus.json"), roh: path.join(tmp, "roh.out"), geraet: "radeon", bash: null, gpuLauf: null, deckelMinS: Number(SEK) };
const st1 = { ...alle[0], befehl, gpu: false, minuten: 0.05 };
delete st1.probe;
const t0 = Date.now();
P.fahreStation(st1, ctx).then((e) => {
    const roh = fs.existsSync(ctx.roh) ? fs.readFileSync(ctx.roh, "utf8") : "";
    const out = roh.slice(roh.indexOf("\n") + 1); // ohne die Zeile des Befehls
    const zeit = out.split("\n").filter((z) => /^@@PUNKTE@@ ZEIT \S+ \S+ \d+( offen)?\s*$/.test(z));
    const marke = out.split("\n").filter((z) => /^@@PUNKTE@@ (FRIST|MESSORT)/.test(z));
    console.log("HAND " + LEITER + " · " + DATEI + " · Deckel der Probe " + SEK + " s" + (LSEK ? " · Deckel der Leiter " + LSEK + " s" : "") + " · LAUF " + ((Date.now() - t0) / 1000).toFixed(1) + " s · Exit " + e.exit);
    for (const z of marke) console.log("  " + z.slice(0, 300));
    console.log("  ZEIT-Zeilen " + zeit.length + (zeit.length > 40 ? " (die ersten 20 und die letzten 20)" : ""));
    for (const z of zeit.length > 40 ? [...zeit.slice(0, 20), "  …", ...zeit.slice(-20)] : zeit) console.log("    " + z);
    console.log("  der Leser der Uhr (alle Leitern): " + laengsterSchritt(out));
    console.log("  der Läufer S" + alle[0].staffel + ": " + (e.gruen ? "GRÜN" : e.ungemessen ? "UNGEMESSEN" : "ROT") + " · " + String(e.grund || e.zahl).slice(0, 700));
    // jede Station der Leiter über denselben Lauf (ihr Urteil = der Leser des Spiels)
    const j = fs.existsSync(ctx.aus) ? JSON.parse(fs.readFileSync(ctx.aus, "utf8")) : null;
    // die Wolke trägt keine Karte: die GPU-Wand der Station urteilt vor dem Deckel. Darum ein zweites Mal über die Zeugen — dieselbe
    // Funktion, nur die GPU-Zeile benannt (wie nacht1/nacht-hand.cjs); nie ein Urteil eines Geräts
    const hw = "[linse-gpu] amd/rdna-3 (Hand-Lauf der Wolke: Urteil über die Zeugen, kein Bild)";
    for (const [was, lauf, jj] of [["", { exit: e.exit, stdout: out, stderr: "" }, j], [" über die Zeugen", { exit: e.exit, stdout: hw + "\n" + out, stderr: "" }, j && j.leitern === undefined && j.sprossen ? Object.assign({}, j, { hw }) : j]])
        for (const s of alle) {
            let u;
            try {
                u = s.urteil(jj, lauf);
            } catch (x) {
                u = { gruen: false, zahl: "das Urteil warf: " + x.message };
            }
            console.log("  S" + s.staffel + " Urteil" + was + ": " + (u.ohneUrteil ? "UNGEMESSEN · " + u.ohneUrteil : (u.gruen ? "GRÜN · " : "ROT · ") + u.zahl).slice(0, 420));
        }
    fs.rmSync(tmp, { recursive: true, force: true });
});
