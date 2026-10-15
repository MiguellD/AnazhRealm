// SPIKE gesetz-strahl — der Fahrer: schickt die Seiten-Datei (gesetz-strahl-seite.js) + EINEN Ruf an die laufende Werkbank.
//   node scripts/spike/gesetz-strahl.cjs <werkbank-port> '<js mit S = window.__strahl>'
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");
const port = Number(process.argv[2]);
const ruf = process.argv[3] || "return S.feld ? 'feld' : 'leer';";
const vorab = process.env.WASSER ? "(0, eval)(" + JSON.stringify(require("../lib/wasser-linse.cjs").WASSER_INSTALL) + ");\n" : "";
const code =
    vorab +
    fs.readFileSync(path.join(__dirname, "gesetz-strahl-seite.js"), "utf8") +
    "\nreturn await (async () => { " + ruf + " })();\n";
const body = JSON.stringify({ code });
const req = http.request(
    { host: "127.0.0.1", port, path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } },
    (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
            console.log(d);
            process.exit(/"fehler"|Error/.test(d) ? 1 : 0);
        });
    }
);
req.on("error", (e) => {
    console.error(e.message);
    process.exit(2);
});
req.end(body);
