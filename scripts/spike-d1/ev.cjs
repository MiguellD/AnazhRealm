// node ev.cjs <port> <datei.js> [--json aus.json] — schickt den Rumpf an /eval der Werkbank.
const http = require("http");
const fs = require("fs");
const [port, datei] = process.argv.slice(2);
const i = process.argv.indexOf("--json");
const aus = i > 0 ? process.argv[i + 1] : null;
const vor = process.env.EV_VOR || "";
const body = JSON.stringify({ code: vor + fs.readFileSync(datei, "utf8") });
const req = http.request(
    { host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } },
    (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => {
            if (aus) fs.writeFileSync(aus, d);
            try {
                console.log(JSON.stringify(JSON.parse(d), null, 1));
            } catch (_e) {
                console.log(d);
            }
        });
    }
);
req.setTimeout(600000);
req.on("error", (e) => {
    console.error("FEHLER", e.message);
    process.exit(1);
});
req.end(body);
