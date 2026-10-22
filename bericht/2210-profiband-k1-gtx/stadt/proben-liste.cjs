// k1-buehnen (b): die Existenz-Proben in scripts/ (proben-alle.txt: Datei:Zeile:Text), deren Methoden der Stamm als Klassen-
// Methode trägt — nur diese fallen (proben-weg.cjs). Aufruf im Baum: node proben-liste.cjs <alle.txt> <aus.txt>
const fs = require("fs");
const stamm = fs.readdirSync("stamm").filter((f) => f.endsWith(".js")).map((f) => fs.readFileSync("stamm/" + f, "utf8")).join("\n");
const out = [];
let fehlt = 0;
for (const z of fs.readFileSync(process.argv[2], "utf8").trim().split("\n")) {
    const ms = [...z.matchAll(/typeof r\.(\w+) === "function"/g)].map((m) => m[1]);
    if (ms.every((m) => new RegExp("\\n    (async |static |get )?" + m + "\\(").test(stamm))) out.push(z);
    else fehlt++;
}
fs.writeFileSync(process.argv[3], out.join("\n"));
console.log("trägt", out.length, "fehlt", fehlt);
