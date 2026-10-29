// Der trockene Lauf: der Befehl der Station wörtlich (Platzhalter ersetzt) gegen die Stub-Werkbank, dann ihr Urteil.
//   SPIEL=<Spiel-Baum> node fahre.cjs <station-id> [gruen|linse|skala|halten]
"use strict";
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const [id, modus = "gruen"] = process.argv.slice(2);
const stationen = require(path.resolve(__dirname, "../../../meisterkarte-quelle/punkte/stationen/g6.js"));
const st = stationen.find((s) => s.kriterium + "#" + s.staffel === id);
// der Stub-Baum in einem frischen Temp-Ordner (sein Zustand und die Ausgabe bleiben aus dem Zweig)
const T = __dirname, BAUM = fs.mkdtempSync(path.join(require("os").tmpdir(), "w3v-trocken-")), AUS = path.join(BAUM, id.replace("#", "-") + "-" + modus + ".json");
fs.cpSync(path.join(T, "baum"), BAUM, { recursive: true });
const ers = (s) => s.replace(/\{PORT\}/g, "7811").replace(/\{AUS\}/g, AUS).replace(/\{BAUM\}/g, BAUM).replace(/\{KOORD\}/g, path.resolve(__dirname, "../../.."));
const t0 = Date.now();
const r = spawnSync(st.befehl[0], st.befehl.slice(1).map(ers), {
    cwd: BAUM,
    env: { ...process.env, STUB_MODUS: modus, PATH: path.join(T, "bin") + ":" + process.env.PATH },
    encoding: "utf8",
    maxBuffer: 64 << 20,
});
fs.writeFileSync(AUS.replace(/\.json$/, ".out"), r.stdout + "\n--- stderr ---\n" + r.stderr);
const u = st.urteil(null, { exit: r.status, stdout: r.stdout, stderr: r.stderr });
console.log(id + " [" + modus + "] Exit " + r.status + " in " + ((Date.now() - t0) / 1000).toFixed(1) + " s · " + (u.gruen ? "GRÜN" : "ROT") + " · " + u.zahl);
if (process.env.ZEIGE) console.log(r.stdout.split("\n").slice(0, +process.env.ZEIGE).map((l) => l.slice(0, 400)).join("\n"), "\nSTDERR:", r.stderr.slice(0, 1500));
