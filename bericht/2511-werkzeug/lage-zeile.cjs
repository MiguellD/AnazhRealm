// node lage-zeile.cjs <HH:MM> <text-datei> — setzt EINE neue Zeile „- STAND HH:MM …“ unter den Kopf des Blocks (kein Kopf-Tausch).
const fs = require("fs");
const [, , Z, T] = process.argv;
if (!/^\d\d:\d\d$/.test(Z || "") || !T) throw new Error("Zeit oder Text-Datei fehlt");
const N = "C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/9c27a074-223e-48c0-a5af-60ae0385359b/scratchpad";
const z = fs.readFileSync(N + "/lage-block-19.md", "utf8").split("\n");
if (!z[0].startsWith("**KONTO 19")) throw new Error("Kopf fehlt");
const t = fs.readFileSync(T, "utf8").trim().replace(/\s*\n\s*/g, " ");
z.splice(1, 0, "- STAND " + Z + " (25.11., Zeit aus date): " + t);
fs.writeFileSync(N + "/lage-block-19.md", z.join("\n"));
console.log("Zeilen:", z.length, "· neue Zeile Zeichen:", t.length);
