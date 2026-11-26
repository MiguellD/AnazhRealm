const fs = require("fs");
const [W, datei, arg] = process.argv.slice(2);
const code = "const ARG = " + arg + ";\n" + fs.readFileSync(datei, "utf8");
fetch("http://localhost:" + W + "/eval", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: "return await (async () => {" + code + "})();", name: "klima-dorf" }) }).then((r) => r.json()).then((j) => console.log(JSON.stringify(j))).catch((e) => console.log("FEHLER", e.message));
