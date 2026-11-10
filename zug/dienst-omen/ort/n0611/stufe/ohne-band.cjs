// ohne-band.cjs <liste,komma> — Koordinator K10, 10.11. 13:25: die Zeit-Stationen fahren wieder (AppHelperCap ist Grund-Last des Geräts);
// nur die Stationen, die /band brauchen (profiband.*), ruhen, bis /band nach w27-gpu-wahl-heil wieder misst. Übrige als Komma-Liste auf
// stdout, die ruhenden auf stderr.
"use strict";
const liste = String(process.argv[2] || "").split(",").map((x) => x.trim()).filter(Boolean);
const ja = liste.filter((s) => !/^profiband\./.test(s)), nein = liste.filter((s) => /^profiband\./.test(s));
process.stderr.write("ruhen (brauchen /band): " + (nein.join(", ") || "keine") + "\n");
process.stdout.write(ja.join(",") + "\n");
