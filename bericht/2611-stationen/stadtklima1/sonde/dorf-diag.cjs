// stadtklima#1 an der Wiese: das Dorf der Probe (dorfSeite, k2-planet.js) und danach die Bedingungen der Pfütze (diag1.js)
const fs = require("fs");
const [W, planet, diag, welche] = process.argv.slice(2);
const t = fs.readFileSync(planet, "utf8");
const a = t.indexOf("async function dorfSeite(r, a) {");
const b = t.indexOf("\n    // DER RUMPF DER PROBE", a);
const dorf = t.slice(a, b);
const ruf = async (weg, o) => { const r = await fetch("http://localhost:" + W + weg, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(o) }); return r.json(); };
(async () => {
    if (welche !== "nur-diag") {
        const u = await ruf("/umstellen", { ort: "wiese" });
        console.log("umstellen", JSON.stringify(u).slice(0, 200));
        const d = await ruf("/eval", { code: "return await (" + dorf + ")(r, " + JSON.stringify({ same: 7, nH: 8 }) + ");", name: "dorf-der-probe" });
        console.log("dorf", JSON.stringify(d).slice(0, 400));
    }
    const g = await ruf("/eval", { code: fs.readFileSync(diag, "utf8"), name: "klima-diag" });
    console.log("diag", JSON.stringify(g));
})().catch((e) => console.log("FEHLER", e.message));
