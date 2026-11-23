// ort-pruef.cjs — liest punkte.cjs ORT_MUSTER (der Quelltext der Maschine) und fragt: welchen Messort liest die Sitzung aus dem Text
// der Probe same.physik.reaktion, vorher (Blob 897e19ec) und nachher (k2-same.neu.js)?
"use strict";
const fs = require("fs");
const path = require("path");
const D = __dirname;
const p = fs.readFileSync(path.join(D, "punkte.pm.cjs"), "utf8");
const a = p.indexOf("const ORT_MUSTER = [");
const e = p.indexOf("];", a);
const ORT_MUSTER = new Function("return " + p.slice(a + "const ORT_MUSTER = ".length, e + 1))();
const s = fs.readFileSync(path.join(D, "sitzung-seite.pm.js"), "utf8");
const sw = s.slice(s.indexOf("function sitzungWerkzeug() {"), s.indexOf("// der argv einer Probe"));
const seg = (t) => {
    const lr = t.slice(t.indexOf("async function leiterRahmen("), t.indexOf("// ─────────────────────────── DIE LEITER → IHRE STATIONEN"));
    const x = t.indexOf("lauf: async function reaktionLauf(H, P, L) {");
    return sw + lr + t.slice(x, t.indexOf("\n        }),\n", x));
};
for (const [n, f] of [["vorher", "k2-same.pm.js"], ["nachher", "k2-same.neu.js"]]) {
    // der Text steht im argv als JSON-Zeichenkette eines node -e: die Maschine liest `befehl.map(String).join(" ")` — der rohe Text
    const t = seg(fs.readFileSync(path.join(D, f), "utf8"));
    let o = null;
    for (const [i, re] of ORT_MUSTER.entries()) {
        const m = re.exec(t);
        if (m) {
            o = m[1] + " (Muster " + (i + 1) + ")";
            break;
        }
    }
    console.log(n + ": probeOrt → " + o + " · Text " + t.length + " Zeichen");
}
