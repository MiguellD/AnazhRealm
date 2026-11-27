// umfang-klassen.cjs <leser-aus> [geraet=gtx] — cwd = pm-Baum mit vision/richter. Je Leiter die Front-Sprosse (unterste Leser-Zeile ≠ PUNKT),
// ihre jüngste Akte am Gerät; trägt sie „Umfang nicht erzeugbar“, fällt sie nach dem verlangten Umfang in eine Klasse. Zählt und nennt Beispiele.
const fs = require("fs");
const aus = fs.readFileSync(process.argv[2], "utf8").split(/\r?\n/);
const g = process.argv[3] || "gtx";
const z = new Map();
for (const l of aus) {
    const m = l.match(/^\s{2}(\S+) S (\d+): (PUNKT|0)/);
    if (m) {
        if (!z.has(m[1])) z.set(m[1], new Map());
        z.get(m[1]).set(+m[2], m[3]);
    }
}
const dir = "vision/richter";
const re = new RegExp("^(.*)\\.(\\d+)\\.([0-9a-f]{8})-" + g + "\\.json$");
const je = new Map();
for (const f of fs.readdirSync(dir)) {
    const m = f.match(re);
    if (!m) continue;
    let j;
    try {
        j = JSON.parse(fs.readFileSync(dir + "/" + f, "utf8"));
    } catch (e) {
        continue;
    }
    const t = Date.parse(j.zeit || j.wann || "") || fs.statSync(dir + "/" + f).mtimeMs;
    const k = m[1] + "#" + m[2];
    const a = je.get(k);
    if (!a || t > a.t) je.set(k, { t, j, f });
}
const marke = "Umfang nicht erzeugbar";
const kl = {}, bsp = {};
let fronten = 0, mitAkte = 0;
for (const [id, zl] of z) {
    let f = null;
    for (const nr of [...zl.keys()].sort((a, b) => a - b)) if (zl.get(nr) !== "PUNKT") { f = nr; break; }
    if (f === null) continue;
    fronten++;
    const a = je.get(id + "#" + f);
    if (!a) continue;
    mitAkte++;
    const txt = JSON.stringify(a.j);
    const i = txt.indexOf(marke);
    if (i < 0) continue;
    const u = txt.slice(i + marke.length, i + marke.length + 200).replace(/^[: ]+/, "").split('"')[0];
    let k = "sonst";
    if (/Megastadt|Metropole|10⁵ H|10⁶|Million/i.test(u)) k = "Megastadt/Metropole";
    else if (/Großstadt|10⁴ H|10³ H|Häuser|Viertel|Stadt|Dorf|Siedlung/i.test(u)) k = "Stadt-Größe (Häuser)";
    else if (/Bewohner|Menschen|Leiber|Menge|Personen|Spieler|Jäger|Fahrer|Händler/i.test(u)) k = "Menschen/Rollen";
    else if (/Planet|Kugel|Kontinent|km²|Region|Orbit|global|Saaten|Welten|Mond/i.test(u)) k = "Planet/Region/Saaten";
    else if (/Jahr|Generation|Epoche|Tage|Stunden/i.test(u)) k = "Zeit-Spanne";
    else if (/Tier|Herde|Arten|Pflanz|Wald|Bäume|Fisch|Vögel/i.test(u)) k = "Leben-Zahl";
    kl[k] = (kl[k] || 0) + 1;
    (bsp[k] = bsp[k] || []).push(id + "#" + f + ": " + u.slice(0, 120));
}
console.log("Fronten mit Leser-Zeile " + fronten + " · mit Akte an " + g + " " + mitAkte + " · „" + marke + "“ " + Object.values(kl).reduce((a, b) => a + b, 0));
console.log(Object.entries(kl).sort((a, b) => b[1] - a[1]).map(([k, n]) => k + " " + n).join(" · "));
const zeig = +(process.argv[4] || 6);
for (const k of Object.keys(bsp).sort((a, b) => kl[b] - kl[a])) {
    console.log("== " + k + " (" + kl[k] + ")");
    for (const b of bsp[k].slice(0, zeig)) console.log("  " + b);
}
