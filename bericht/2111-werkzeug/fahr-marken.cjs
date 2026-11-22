// node fahr-marken.cjs <log...> — je Log der Fahr-Linse die Marken, an denen zwei Läufe sich trennen: T1/T3 Sim- und Fahr-Weg,
// die T4-Zeile (nach10, abV, abSprung, abWer, hochP05). Liest nur, druckt je Log vier Zeilen.
const fs = require("fs");
for (const f of process.argv.slice(2)) {
  const t = fs.readFileSync(f, "utf8").split("\n");
  const erste = (teil) => t.find((z) => z.includes(teil)) || "";
  const stueck = (z, von, bis) => { const a = z.indexOf(von); if (a < 0) return "-"; const b = bis ? z.indexOf(bis, a) : -1; return z.slice(a, b < 0 ? a + 260 : b); };
  console.log("== " + f.split(/[\\/]/).pop());
  console.log("  T1 " + stueck(erste(" T1 GT geradeaus"), "teleport", " · gier"));
  console.log("  T3 " + stueck(erste(" T3 Pferd"), "teleport", " · gier"));
  const z4 = erste(" T4 Wechsel Third");
  console.log("  T4 " + (z4.includes("✅") ? "GRÜN " : "ROT ") + stueck(z4, '"ego"', '"abFov"') + " " + stueck(z4, '"hochP05"', "}"));
  console.log("  T4 Täter " + stueck(z4, "Täter:", null).slice(0, 420));
}
