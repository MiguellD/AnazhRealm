// diag-nah-fern.cjs — DIE ALBEDO NAH GEGEN FERN in der CI (0910-8, „die weiße Masse“; Familie `werkbank albedo`). Erst der
// Selbsttest des Urteils (ohne Welt), dann die Werkbank im Software-Holz (swiftshader, kienspan) an der Mess-Wiese:
// `albedo --nah-fern` schießt je Ort im Chunk-Quadrat den Boden-Satz und den Fern-Ring orthogonal aus 420 m über 132 m und
// urteilt beide Leser gegen das Gesetz an der Stelle (`_fernRingTeile`) — ROT beim Namen, wenn einer außerhalb seines Bands
// liegt (main 2c8deda9 an der echten GPU: der Boden-Satz +60 … +144 %), zu wenige Orte, ein Schuss leer bleibt oder die
// Karte der Fern-Krone nicht steht. Gemessen 11.10. im Software-Holz: Start 4–7 s, Umstellen 9–17 s, Linse 4 s.
//
//   node scripts/diag-nah-fern.cjs [--port 4596]
"use strict";
const { spawn, spawnSync } = require("child_process");
const path = require("path");

const argv = process.argv.slice(2);
const i = argv.indexOf("--port");
const PORT = Number(i >= 0 ? argv[i + 1] : process.env.NAH_FERN_PORT || 4596);
const WB = path.join(__dirname, "werkbank.cjs");
const env = Object.assign({}, process.env, { WERKBANK_PORT: String(PORT) });
const rufe = (args, ms) => spawnSync(process.execPath, [WB, ...args], { env, encoding: "utf8", timeout: ms || 240000 });

const self = rufe(["albedo", "--nah-fern", "--selbsttest"], 30000);
process.stdout.write(self.stdout || "");
process.stderr.write(self.stderr || "");
if (self.status !== 0) {
    console.log("❌ diag-nah-fern: der Selbsttest des Urteils ist ROT");
    process.exit(1);
}

(async () => {
    const t0 = Date.now();
    const kind = spawn(process.execPath, [WB, "start", "--port", String(PORT)], { env, stdio: ["ignore", "pipe", "pipe"] });
    let log = "";
    const bereit = new Promise((res, rej) => {
        const frist = setTimeout(() => rej(new Error("die Werkbank stand nach 180 s nicht bereit")), 180000);
        const lies = (d) => {
            log += d;
            if (/WERKBANK bereit/.test(log)) {
                clearTimeout(frist);
                res();
            }
        };
        kind.stdout.on("data", lies);
        kind.stderr.on("data", lies);
        kind.on("exit", (c) => rej(new Error(`die Werkbank endete vor dem Start (Exit ${c})`)));
    });
    let code = 1;
    try {
        await bereit;
        const t1 = Date.now();
        const u = rufe(["umstellen", "--ort", "wiese"]);
        if (u.status !== 0 || /"fehler"/.test(u.stdout || "")) throw new Error("umstellen --ort wiese: " + (u.stdout || u.stderr));
        const t2 = Date.now();
        const a = rufe(["albedo", "--nah-fern"]);
        process.stdout.write(a.stdout || "");
        process.stderr.write(a.stderr || "");
        // eine Linse, die mit `fehler` antwortet, hat nicht geurteilt — ROT (bis 14.10. endete die Werkbank dann mit Exit 0, und
        // das Tor stand grün, während die Linse an `_fernRingTeile` brach)
        code = a.status === 0 && !/"fehler"/.test(a.stdout || "") ? 0 : 1;
        if (a.status === null) console.log(`❌ diag-nah-fern: die Linse antwortete nicht in ${240} s (${a.signal || "Frist"})`);
        console.log(`diag-nah-fern: Start ${((t1 - t0) / 1000).toFixed(0)} s · Umstellen ${((t2 - t1) / 1000).toFixed(0)} s · Linse ${((Date.now() - t2) / 1000).toFixed(0)} s`);
    } catch (e) {
        console.log("❌ diag-nah-fern: " + e.message + "\n" + log.split("\n").slice(-20).join("\n"));
        code = 1;
    } finally {
        rufe(["stop"], 30000);
        try {
            kind.kill();
        } catch (_e) {}
    }
    process.exit(code);
})();
