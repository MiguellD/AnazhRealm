// je Hunk des Diffs gegen die Merge-Basis: Atome alt → neu (Kommentare gestrichen wie gate:betriebsgesetz)
const { execSync } = require("child_process");
const stamm = require(require("path").resolve(__dirname, "../../scripts/lib/stamm.cjs"));
const deckeMass = (t) => (t.match(/[\p{L}\p{N}_$]+|[^\s\p{L}\p{N}_$]/gu) || []).length;
const datei = process.argv[2];
const basis = execSync("git merge-base HEAD origin/integ-probe").toString().trim();
const diff = execSync(`git diff -U0 --no-color ${basis} -- ${datei}`).toString();
let alt = [], neu = [], kopf = "";
const aus = [];
const flush = () => {
    if (!kopf) return;
    const a = deckeMass(stamm.ohneKommentare(alt.join("\n")));
    const n = deckeMass(stamm.ohneKommentare(neu.join("\n")));
    aus.push([n - a, kopf, a, n]);
};
for (const z of diff.split("\n")) {
    if (z.startsWith("@@")) { flush(); kopf = z; alt = []; neu = []; }
    else if (z.startsWith("-") && !z.startsWith("---")) alt.push(z.slice(1));
    else if (z.startsWith("+") && !z.startsWith("+++")) neu.push(z.slice(1));
}
flush();
let s = 0;
for (const [d, k, a, n] of aus) { s += d; console.log(String(d).padStart(5), k.slice(0, 40), a, "→", n); }
console.log("Summe", s);
