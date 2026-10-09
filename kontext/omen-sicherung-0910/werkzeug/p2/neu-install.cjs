// Spielt die Seiten-Installation einer geänderten Linse in die laufende Werkbank ein (ohne Neustart der Welt).
// node neu-install.cjs <worktree> <port> <lib> <EXPORT>
const http = require("http");
const path = require("path");
const [wt, port, lib, exp] = process.argv.slice(2);
for (const k of Object.keys(require.cache)) delete require.cache[k];
const code = require(path.join(wt, "scripts", "lib", lib))[exp];
const body = JSON.stringify({ code: code + "; return 1;" });
const req = http.request(
    { host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } },
    (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => console.log(exp, "→", d.slice(0, 200)));
    }
);
req.end(body);
