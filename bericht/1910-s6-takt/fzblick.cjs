// 1910 S6-Takt: ein Blick in die Takte einer fz.json — die schwersten Takte und ihre größten Spalten
const fs = require("fs");
const t = fs.readFileSync(process.argv[2], "utf8");
const j = JSON.parse(t.slice(t.indexOf("{"))).ergebnis;
const kopf = j.kopf.split(",");
const rows = j.zeilen.split("\n").map((z) => z.split(",").map(Number));
const ger = rows.filter((r) => r[1] === 1);
console.log("takte", rows.length, "gerendert", ger.length, "fehlt", j.fehlt.join(" "));
const schwer = ger.slice().sort((a, b) => b[0] - a[0]).slice(0, Number(process.argv[3] || 12));
const LOOPN = new Set(["_loopRender", "_loopVoxelStreaming", "_loopWeatherAndGrowth", "_loopFixedStep", "_loopCamera", "tickAffordances", "_loopShadowUpdate", "_tickFoundryIngest", "updateFps", "_perfSenseFoldFrame", "tickArchitectures", "tickArchitectureCulling", "_tickPortalMembranes", "_weltStandTakt", "_loopAutoSave", "tickDayNight", "_tickGenesisOrt", "matrixGang", "schatten", "renderOben", "updateCreatures"]);
for (const r of schwer) {
    const teile = kopf.map((k, i) => [k, r[i]]).filter(([k, v]) => LOOPN.has(k) && v >= 0.3).sort((a, b) => b[1] - a[1]);
    console.log(r[0].toFixed(1), teile.map(([k, v]) => k + " " + v.toFixed(1)).join(" · "));
}
