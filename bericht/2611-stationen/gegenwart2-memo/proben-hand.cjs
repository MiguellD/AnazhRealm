// proben-hand.cjs — die Proben einer Station-Datei, geurteilt wie punkte.cjs probenUrteil (st.urteil(p.j, { exit, stdout }) gegen
// p.gruen und p.zahl). Gedruckt: die Proben von planet.kopplung.gegenwart S2 beim Namen mit ihrer Zahl, dann die Summe der Datei.
//   node proben-hand.cjs <stationen/k2-zusammenspiel.js>
"use strict";
const path = require("path");
const stationen = require(path.resolve(process.argv[2]));
let n = 0;
const falsch = [];
for (const st of stationen)
    for (const p of st.proben || []) {
        n++;
        let u;
        try {
            u = st.urteil(p.j || null, { exit: p.exit != null ? p.exit : 0, stdout: p.stdout || "", stderr: "" });
        } catch (e) {
            u = { gruen: null, zahl: "Urteil warf: " + e.message };
        }
        const ok = u && u.gruen === p.gruen && !(p.zahl && !p.zahl.test(String(u.zahl || "")));
        if (!ok) falsch.push(st.kriterium + "#" + st.staffel + " " + p.name + ": " + (u && u.gruen ? "GRÜN" : "ROT") + " (" + (u ? u.zahl : "-") + ")");
        if (st.kriterium === "karte2.planet.kopplung.gegenwart" && st.staffel === 2)
            console.log((ok ? "  ok   " : "  FALSCH ") + (u.gruen ? "GRÜN " : "ROT  ") + p.name + " — " + String(u.zahl || "").slice(0, 200));
    }
console.log(path.basename(process.argv[2]) + ": " + n + " Proben, " + falsch.length + " falsch" + (falsch.length ? "\n" + falsch.join("\n") : ""));
process.exitCode = falsch.length ? 1 : 0;
