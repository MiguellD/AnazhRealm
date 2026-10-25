const { execFileSync } = require("child_process");
const fs = require("fs");
const d = "spec/stamm/modul-karte.json";
const st = (n) => JSON.parse(execFileSync("git", ["show", `:${n}:${d}`], { encoding: "utf8", maxBuffer: 1 << 26 }));
const [B, O, T] = [st(1), st(2), st(3)];
const drei = (b, o, t) => {
    const sb = new Set(b), so = new Set(o), st = new Set(t);
    const out = o.filter((x) => !(sb.has(x) && !st.has(x)));
    for (const x of t) if (!so.has(x) && !sb.has(x)) out.push(x);
    return out;
};
const J = (x) => JSON.stringify(x);
if (J(O.quelle) !== J(T.quelle) && J(T.quelle) !== J(B.quelle) && J(O.quelle) !== J(B.quelle)) throw new Error("quelle beidseitig");
const quelle = J(O.quelle) === J(B.quelle) ? T.quelle : O.quelle;
const ordnung = drei(B.ordnung.map(J), O.ordnung.map(J), T.ordnung.map(J)).map((s) => JSON.parse(s));
const mods = {};
const keys = [...new Set([...Object.keys(O.module), ...Object.keys(T.module)])];
for (const k of keys) {
    const b = B.module[k] || [], o = O.module[k], t = T.module[k];
    if (!o) { if (b.length && J(b) === J(t)) continue; mods[k] = t; continue; }
    if (!t) { if (b.length && J(b) === J(o)) continue; mods[k] = o; continue; }
    const m = drei(b, o, t);
    mods[k] = J(o.slice().sort()) === J(o) ? m.sort() : m;
}
const s = JSON.stringify;
const ord = ordnung.map((r, i) => `  ${s(r).replace(/","/g, '", "')}${i < ordnung.length - 1 ? "," : ""}`);
const ks = Object.keys(mods);
const mod = ks.map((k, i) => `  ${s(k)}: ${s(mods[k]).replace(/","/g, '", "')}${i < ks.length - 1 ? "," : ""}`);
fs.writeFileSync(d, ["{", ` "quelle": ${s(quelle)},`, ' "ordnung": [', ...ord, " ],", ' "module": {', ...mod, " }", "}", ""].join("\n"));
console.log("Karte 3-Wege:", ks.length, "Module");
