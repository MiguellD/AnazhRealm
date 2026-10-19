// 1810 B5 Finder: EIN Instrument-Eingriff in die Transport-Schale (stamm/studio-bruecke.js `_foundrySchale`, läuft im Faden):
// je Körper-Auftrag drei Stempel in Epoch-ms (performance.timeOrigin + now) — Eingang im Faden · Studio-Start · Antwort
// gesendet — als Feld `b5` der Antwort; der Haupt-Faden (lieferung-patch, `_foundryAntwort`) rechnet sie auf seine Uhr um.
// Zurück: git -c core.autocrlf=false checkout -- stamm/studio-bruecke.js     node faden-patch.cjs <baum>
"use strict";
const fs = require("fs");
const path = require("path");
const f = path.join(process.argv[2], "stamm", "studio-bruecke.js");
let s = fs.readFileSync(f, "utf8");
if (s.includes("OMEN 1810 B5")) {
    console.log(f, "schon gepatcht");
    process.exit(0);
}
const ers = (a, n) => {
    if (s.split(a).length !== 2) throw new Error(`Anker nicht eindeutig: ${JSON.stringify(a)}`);
    s = s.replace(a, n);
};
ers(
    "        const schreibAuftrag = new Map(); // reqId → Platten-Schlüssel des Studio-Baus, der gerade läuft\n",
    "        const schreibAuftrag = new Map(); // reqId → Platten-Schlüssel des Studio-Baus, der gerade läuft\n" +
        "        const b5 = new Map(); // OMEN 1810 B5 (Instrument): reqId → [Eingang, Studio-Start, Antwort] in Epoch-ms\n" +
        "        const b5jetzt = () => performance.timeOrigin + performance.now();\n" +
        "        const b5fertig = (id) => {\n" +
        "            const z = b5.get(id);\n" +
        "            if (!z) return null;\n" +
        "            b5.delete(id);\n" +
        "            z[2] = b5jetzt();\n" +
        "            return z;\n" +
        "        };\n"
);
ers("                    platte: vonPlatte,\n", "                    platte: vonPlatte,\n                    b5: b5fertig(m.reqId),\n");
ers(
    '            if (msg && msg.type === "asset" && Array.isArray(msg.meshes)) {\n',
    '            if (msg && msg.type === "asset" && Array.isArray(msg.meshes)) {\n                if (!msg.b5) msg.b5 = b5fertig(msg.reqId);\n'
);
ers(
    "            ev.stopImmediatePropagation();\n",
    "            ev.stopImmediatePropagation();\n            b5.set(m.reqId, [b5jetzt(), 0, 0]);\n"
);
ers(
    '                    if (typeof W.onmessage === "function") W.onmessage({ data: weiter });\n',
    '                    const z5 = b5.get(m.reqId);\n                    if (z5) z5[1] = b5jetzt();\n                    if (typeof W.onmessage === "function") W.onmessage({ data: weiter });\n'
);
fs.writeFileSync(f, s);
console.log(f, "gepatcht (B5 Faden-Stempel)");
