// ohne-band.cjs <liste,komma> — Koordinator K10, 10.11. 13:25: die Zeit-Stationen fahren wieder (AppHelperCap ist Grund-Last des Geräts);
// nur die Stationen, die /band brauchen (profiband.*), ruhen, bis /band nach w27-gpu-wahl-heil wieder misst. Übrige als Komma-Liste auf
// stdout, die ruhenden auf stderr.
"use strict";
// 19.11.: die Liste darf als Datei reisen („@<datei>“, Komma oder eine je Zeile) — 1 428 Stationen als Argument rissen die Windows-Grenze
const a = String(process.argv[2] || "");
const liste = (a.startsWith("@") ? require("fs").readFileSync(a.slice(1), "utf8") : a).split(/[,\s]+/).map((x) => x.trim()).filter(Boolean);
const ja = liste.filter((s) => !/^profiband\./.test(s)), nein = liste.filter((s) => /^profiband\./.test(s));
process.stderr.write("ruhen (brauchen /band): " + (nein.join(", ") || "keine") + "\n");
process.stdout.write(ja.join(",") + "\n");
