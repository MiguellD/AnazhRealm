// Eine Zeile je Boot aus dem JSON der Folge (für fortschritt.log)
const j = JSON.parse(require("fs").readFileSync(process.argv[2], "utf8"));
const k = j.kurz || {}, t = [];
const lauf = (n, l) => l && t.push(`${n} p50/p95 ${l.frameMs.p50}/${l.frameMs.p95} CPU p95 ${l.cpuTaktMs.p95} cmds ${l.befehle && l.befehle.mittel} tris ${l.dreiecke && Math.round(l.dreiecke.mittel / 1000)}k ${l.takt ? Math.round(l.takt.mhz) + "MHz" : ""}`);
lauf("voll", k.laufVoll); lauf("frei", k.laufFrei);
if (k.gpuBank) for (const [g, b] of Object.entries(k.gpuBank)) b && t.push(`bank ${g}: ${b.gpuJeFrameMs ?? b.mittelMs ?? JSON.stringify(b).slice(0, 40)}${b.takt ? " " + Math.round(b.takt.mhz || 0) + "MHz" : ""}`);
if (k.band) t.push(`band ${k.band.urteil} vram ${k.band.vramMB}`);
console.log(`urteil ${j.urteil && (j.urteil.gruen === false ? "ROT" : j.urteil.text || JSON.stringify(j.urteil).slice(0, 30))} · ` + t.join(" · "));
