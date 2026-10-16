// VRAM je Klasse aus dem Band-Text zweier Boot-JSONs: node vram.cjs <a.json> <b.json>
const fs = require("fs");
const rd = (f) => {
    const j = JSON.parse(fs.readFileSync(f, "utf8"));
    const b = j.schritte.find((s) => s.name === "band");
    const out = {};
    const such = (x) => {
        if (typeof x === "string") {
            for (const l of x.split("\n")) {
                const m = l.match(/^\s+([0-9.]+) MB\s+(\d+)\s+(\S.*)$/);
                if (m && !(m[3].trim() in out)) out[m[3].trim()] = [+m[1], +m[2]];
            }
        } else if (x && typeof x === "object") Object.values(x).forEach(such);
    };
    such(b && b.ergebnis);
    return out;
};
const [fa, fb] = process.argv.slice(2);
const A = rd(fa), B = rd(fb);
const keys = [...new Set([...Object.keys(A), ...Object.keys(B)])];
const rows = keys
    .map((k) => [k, A[k] || [0, 0], B[k] || [0, 0]])
    .filter((r) => Math.abs(r[1][0] - r[2][0]) >= 0.1 || r[1][0] >= 2)
    .sort((x, y) => y[1][0] - x[1][0]);
console.log(`== ${fa} → ${fb}`);
for (const r of rows.slice(0, 18)) console.log(`  ${r[0].padEnd(30)} ${String(r[1][0]).padStart(5)} (${r[1][1]}) → ${String(r[2][0]).padStart(5)} (${r[2][1]})  ${(r[2][0] - r[1][0]).toFixed(1)}`);
