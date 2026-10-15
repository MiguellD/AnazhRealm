// node sonde-ruf.cjs <start|stop|bericht> — schickt die Sonde an die Werkbank (:8702/eval)
const fs = require("fs");
const http = require("http");
const path = require("path");
const arg = process.argv[2] || "bericht";
const code = `const SPIKE_ARG=${JSON.stringify(arg)};\n` + fs.readFileSync(path.join(__dirname, process.argv[3] || "sonde.js"), "utf8");
const body = JSON.stringify({ code });
const req = http.request(
    { host: "127.0.0.1", port: 8702, path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } },
    (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => {
            try {
                console.log(JSON.stringify(JSON.parse(d), null, 1));
            } catch (_e) {
                console.log(d);
            }
        });
    }
);
req.on("error", (e) => {
    console.error("FEHLER", e.message);
    process.exit(1);
});
req.end(body);
