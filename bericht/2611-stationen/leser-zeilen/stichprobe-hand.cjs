// Stichprobe der Leser-Zeilen von Hand: je Angabe die Zeile im Anker, die alte Zeile in main und die neue Zeile in main
const { execFileSync } = require("child_process"); const fs = require("fs");
const P = JSON.parse(fs.readFileSync(process.argv[2], "utf8")); const kopf = process.argv[3] || "origin/main";
const namen = execFileSync("git", ["ls-tree", "-r", "--full-tree", "--name-only", kopf], { encoding: "utf8", maxBuffer: 1 << 28 }).split("\n");
const pf = (d) => (namen.includes(d) ? d : namen.filter((n) => n.split("/").pop() === d.split("/").pop())[0]);
const show = (rev, p) => { try { return execFileSync("git", ["show", rev + ":" + p], { encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] }).split("\n"); } catch (e) { return null; } };
for (const e of P) {
    const d = e.angabe.split(":")[0], p = pf(d), M = show(kopf, p) || [], z = +e.angabe.split(":")[1].split(/[–-]/)[0];
    const sha = (e.wie || "").split(" ")[1], A = sha ? show(sha, p) : null;
    console.log("## " + e.station + "  " + e.angabe + " " + e.name + "  → :" + e.neu + " (" + e.wie + ")  [" + p + "]");
    console.log("   Anker  :" + z + "  " + (A ? (A[z - 1] || "").trim().slice(0, 110) : "-"));
    console.log("   main   :" + z + "  " + (M[z - 1] || "").trim().slice(0, 110));
    console.log("   main   :" + e.neu + "  " + (M[e.neu - 1] || "").trim().slice(0, 110));
}
