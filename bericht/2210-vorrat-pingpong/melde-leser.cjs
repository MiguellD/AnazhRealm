// vorrat-pingpong (Decke): je Melde-Feld einer Existenz-Probe (`out.X = typeof r.Y === "function"`) seine Leser in derselben Datei
// Aufruf im Baum: node melde-leser.cjs <proben.txt>
const fs = require("fs");
for (const z of fs.readFileSync(process.argv[2], "utf8").trim().split("\n")) {
    const m = /^(.+?\.cjs):(\d+):\s*(out|res)\.(\w+) = typeof r\.\w+ === "function"(.*)$/.exec(z);
    if (!m) continue;
    const re = new RegExp("\\." + m[4] + "\\b");
    fs.readFileSync(m[1], "utf8")
        .split("\n")
        .forEach((l, i) => {
            if (i + 1 !== +m[2] && re.test(l)) console.log(`${m[1]}:${i + 1} [${m[4]}] ${l.trim().slice(0, 150)}`);
        });
}
