// diag-nah-fern.cjs — DIE ALBEDO NAH GEGEN FERN in der CI (0910-8, „die weiße Masse“; Familie `werkbank albedo`). Erst
// der Selbsttest des Urteils (ohne Welt), dann die Werkbank im Software-Holz (swiftshader, kienspan) an der Mess-Wiese:
// `albedo --nah-fern` schießt je Ort im Chunk-Quadrat den Boden-Satz und den Fern-Ring orthogonal aus 420 m über 132 m
// und urteilt beide Leser gegen das Gesetz an der Stelle (`_fernRingTeile`) — ROT beim Namen, wenn einer außerhalb
// seines Bands liegt, zu wenige Orte, ein Schuss leer
// bleibt oder die Karte der Fern-Krone nicht steht.
//
//   node scripts/diag-nah-fern.cjs [--port 4596]
"use strict";
const { argOpt, werkbankTor } = require("./lib/welt-boot.cjs");
const PORT = Number(argOpt("--port", process.env.NAH_FERN_PORT || 4596));

const self = require("child_process").spawnSync(
    process.execPath,
    [require("path").join(__dirname, "werkbank.cjs"), "albedo", "--nah-fern", "--selbsttest"],
    { encoding: "utf8" }
);
process.stdout.write(self.stdout || "");
process.stderr.write(self.stderr || "");
if (self.status !== 0) {
    console.log("❌ diag-nah-fern: der Selbsttest des Urteils ist ROT");
    process.exit(1);
}

(async () => {
    const t0 = Date.now();
    const tor = werkbankTor(PORT);
    const rufe = tor.rufe;
    let code = 1;
    try {
        await tor.bereit;
        const t1 = Date.now();
        const u = rufe(["umstellen", "--ort", "wiese"]);
        if (u.status !== 0) throw new Error("umstellen --ort wiese: " + (u.stdout || u.stderr));
        const t2 = Date.now();
        const a = rufe(["albedo", "--nah-fern"]);
        process.stdout.write(a.stdout || "");
        process.stderr.write(a.stderr || "");
        // eine Linse, die mit `fehler` antwortet, hat nicht geurteilt — die Werkbank endet dann mit Exit 1
        code = a.status === 0 ? 0 : 1;
        console.log(`diag-nah-fern: Start ${((t1 - t0) / 1000).toFixed(0)} s · Umstellen ${((t2 - t1) / 1000).toFixed(0)} s · Linse ${((Date.now() - t2) / 1000).toFixed(0)} s`);
    } catch (e) {
        console.log("❌ diag-nah-fern: " + e.message + "\n" + tor.log.split("\n").slice(-20).join("\n"));
        code = 1;
    } finally {
        tor.stop();
    }
    process.exit(code);
})();
