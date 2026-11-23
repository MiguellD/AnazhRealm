// ort-klasse.cjs — die Klasse „Leiter stellt ihren Ort im Deckel, die Sitzung liest ihn nicht": je Station der Maschine der Text ihrer
// Probe gegen ORT_MUSTER (punkte.cjs `probeOrt`); gezählt je Kriterium (eine Leiter = eine Probe für alle ihre Sprossen).
"use strict";
const fs = require("fs");
const path = require("path");
const P = path.join(__dirname, "pm", "meisterkarte-quelle", "punkte");
const p = fs.readFileSync(path.join(__dirname, "punkte.pm.cjs"), "utf8");
const a = p.indexOf("const ORT_MUSTER = [");
const ORT_MUSTER = new Function("return " + p.slice(a + "const ORT_MUSTER = ".length, p.indexOf("];", a) + 1))();
const ort = (t) => {
    for (const re of ORT_MUSTER) {
        const m = re.exec(t);
        if (m) return m[1];
    }
    return null;
};
const je = new Map();
for (const f of fs.readdirSync(path.join(P, "stationen")).filter((f) => f.endsWith(".js"))) {
    let m;
    try {
        m = require(path.join(P, "stationen", f));
    } catch (e) {
        console.log(f + ": lädt nicht — " + String(e.message).slice(0, 120));
        continue;
    }
    const alle = Array.isArray(m) ? m : m.stationen || m.STATIONEN || Object.values(m).find(Array.isArray) || [];
    for (const st of alle) {
        if (!st || !st.probe || !Array.isArray(st.probe.befehl)) continue;
        const t = st.probe.befehl.map(String).join(" ");
        const k = st.kriterium || st.id;
        if (je.has(k)) continue;
        je.set(k, { datei: f, ort: ort(t), stellt: /await L\.ort\("/.test(t), lOrt: [...new Set(t.match(/await L\.ort\("[^"]+"/g) || [])].slice(0, 4) });
    }
}
const alle = [...je.entries()];
const blind = alle.filter(([, v]) => v.stellt && !v.ort);
console.log("Proben (je Kriterium) " + alle.length + " · stellen ihren Ort selbst " + alle.filter(([, v]) => v.stellt).length + " · davon liest die Sitzung KEINEN Ort " + blind.length + " · ohne Ort überhaupt " + alle.filter(([, v]) => !v.stellt && !v.ort).length);
for (const [k, v] of blind) console.log("  " + v.datei + " · " + k + " · " + v.lOrt.join(" "));
