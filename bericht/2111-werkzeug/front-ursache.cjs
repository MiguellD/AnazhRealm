// front-ursache.cjs <leser-aus> — je Leiter die unterste ungebuchte Sprosse; je Gerät die JÜNGSTE Akte; Klasse des Richter-Worts (Apparat ↔ echtes ROT)
const fs = require("fs"), path = require("path");
const z = fs.readFileSync(process.argv[2], "utf8").split(/\r?\n/), dir = "vision/richter", alle = fs.readdirSync(dir);
const leitern = new Map();
for (const l of z) { const m = l.match(/^\s+([a-z0-9.\-]+) S (\d+): (PUNKT|KERN|0)\b(.*)$/i); if (!m) continue; if (!leitern.has(m[1])) leitern.set(m[1], []); leitern.get(m[1]).push({ n: Number(m[2]), stand: m[3], rest: m[4] }); }
const klasse = (w) => /ENAMETOOLONG/.test(w) ? "A:ENAMETOOLONG" : /im Lauf nicht gemessen|die Probe endete vor ihr/.test(w) ? "A:nicht gemessen (Abbruch davor)" : /Frist der Probe|Deckel \d+ s gerissen|Stille seit/.test(w) ? "A:Frist/Deckel gerissen" : /^Start:|spawn /.test(w) ? "A:Start" : /Umfang nicht erzeugbar/.test(w) ? "R:Umfang nicht erzeugbar" : /Leser fehlt|fehlender Leser|kein Leser/.test(w) ? "R:Leser fehlt" : /nicht gebaut|fehlt:/.test(w) ? "R:nicht gebaut"
    // 27.11. 12:15: das Apparat-Wort „Bild (Beleg) fehlt“ zählt nur, wenn VOR ihm kein Wert sein Soll verfehlt (kaskade#1 trug vorn „Umfang nicht erzeugbar“ und stand als Apparat)
    : /Bild \(Beleg\) fehlt|ABNAHME ROT/.test(w) && !/✗|verfehlt|ungemessen/.test(w.replace(/Bild \(Beleg\) fehlt[\s\S]*$/, "").replace(/ABNAHME ROT[\s\S]*$/, "")) ? "A:Bild-Abnahme (Wert grün)" : "R:gemessen ROT";
const zahl = {}, apparat = [];
for (const [name, sp] of leitern) {
    sp.sort((a, b) => a.n - b.n); const f = sp.find((s) => s.stand !== "PUNKT"); if (!f) continue;
    const pre = name + "." + f.n + ".";
    const je = {};
    for (const x of alle) {
        if (!x.startsWith(pre)) continue; const m = /^([0-9a-f]{8})-(gtx|radeon)\.json$/.exec(x.slice(pre.length)); if (!m) continue;
        let j; try { j = JSON.parse(fs.readFileSync(path.join(dir, x), "utf8")); } catch { continue; }
        for (const a of Array.isArray(j) ? j : [j]) for (const g of a.geraete || []) {
            const t = g.zeit || a.zeit || (g.preis && g.preis.fenster && g.preis.fenster.von) || "";
            if (!je[m[2]] || t >= je[m[2]].t) je[m[2]] = { t, kopf: m[1], urteil: (g.richter && (g.richter.urteil || g.richter)) || "—", wert: String((g.richter && g.richter.wert) || ""), preis: (g.preis && (g.preis.urteil || g.preis)) || "—" };
        }
    }
    for (const ger of ["gtx", "radeon"]) {
        const a = je[ger]; const k = !a ? "keine Akte" : a.urteil === "GRÜN" ? "GRÜN" : klasse(a.wert);
        zahl[ger + " · " + k] = (zahl[ger + " · " + k] || 0) + 1;
        if ((a && (k.startsWith("A:") || k === "GRÜN")) || (!a && ger === "gtx")) apparat.push((!a ? name + "#" + f.n + " · gtx KEINE AKTE · Radeon: " + (je.radeon ? je.radeon.urteil + "@" + je.radeon.kopf + " " + je.radeon.wert.slice(0, 90) : "keine Akte") : "") || name + "#" + f.n + " · " + ger + " " + a.kopf + " " + a.t.slice(5, 16) + " · " + k.slice(2) + " · anderes Gerät: " + (je[ger === "gtx" ? "radeon" : "gtx"] ? je[ger === "gtx" ? "radeon" : "gtx"].urteil + "@" + je[ger === "gtx" ? "radeon" : "gtx"].kopf : "keine Akte"));
    }
}
for (const k of Object.keys(zahl).sort()) console.log(String(zahl[k]).padStart(4) + "  " + k);
console.log("== Front-Sprossen, die ein APPARAT-Wort hält (" + apparat.length + "):"); for (const a of apparat) console.log("  " + a);
