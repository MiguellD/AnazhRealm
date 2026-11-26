// die Proben (Attrappen und Grün-Fälle) der Stationen einer Datei, wie punkte.cjs:820 sie urteilt: je Probe urteil(j, {exit 0, stdout}) gegen p.gruen
const st = require(require("path").resolve(process.argv[2]));
const nur = process.argv[3] ? new RegExp(process.argv[3]) : null;
let n = 0, falsch = 0;
for (const s of st) {
    if (nur && !nur.test(s.kriterium + "#" + s.staffel)) continue;
    for (const p of s.proben || []) {
        n++;
        const u = s.urteil(p.j || null, { exit: p.exit != null ? p.exit : 0, stdout: p.stdout || "", stderr: "" });
        if (!!u.gruen !== p.gruen) { falsch++; console.log("FALSCH " + s.kriterium + "#" + s.staffel + " · " + p.name + " → " + (u.gruen ? "GRÜN" : "ROT") + " · " + String(u.zahl).slice(0, 200)); }
        else if (p.zahl && !p.zahl.test(String(u.zahl || ""))) { falsch++; console.log("ZAHL " + s.kriterium + "#" + s.staffel + " · " + p.name + " · " + String(u.zahl).slice(0, 600)); }
        if (process.env.ZEIGE && (!nur || nur.test(s.kriterium + "#" + s.staffel))) console.log((u.gruen ? "GRÜN " : "ROT  ") + p.name + " · " + String(u.zahl).slice(0, 700));
    }
}
console.log("PROBEN " + n + " · falsch " + falsch);
process.exitCode = falsch ? 1 : 0;
