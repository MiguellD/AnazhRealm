// baustein-lesen.cjs <stand.json> [<fall.json> …] — derselbe Standard-Stoff mit und ohne je einen Baustein: je Lauf (FREI_ZERLEGE,
// FREI_SHADER, Eingriff programm-log.js, dazu im Fall der Eingriff baustein/<name>.js) je benanntem Programm der größte
// Fragment-Text seines Stoffs in KB (das Hauptbild; die Würfe sind kleiner). Der Name ist das Objekt des Knoten-Baus (eine Arena
// nennt ihre Glieder), nie die laufende Nummer des Stoffs. Erste Datei = der Stand; jede weitere eine Spalte mit ihrem Unterschied.
// SCHREIB=<ordner>: legt je Lauf die Fragment-Texte der benannten Programme als <lauf>/<name>.wgsl ab (für die uebersetz-sonde).
const fs = require("fs");
const path = require("path");
const kb = (n) => (n / 1000).toFixed(1);
// die Familie beim Namen (die Glieder einer Arena wechseln von Lauf zu Lauf, die Familie nicht)
const FAMILIE = [
    [/impostor#fimp:atlas/, "Karten-Atlas"],
    [/nahWiese:Lf:schale/, "Ferne der Wiese (Schale)"],
    [/nahWiese:Lf/, "Ferne der Wiese (Büschel)"],
    [/nahWiese:L\d/, "Nah-Wiese"],
    [/f:(fichte|tanne|kiefer|laerche)[^,\]]*:2/, "Nadel"],
    [/f:[^,\]]*:2/, "Laub"],
    [/f:[^,\]]*:0/, "Rinde"],
    [/vogel|tier:/, "Leben"],
    [/bodenSatz/, "Boden-Satz"],
    [/formationenSatz/, "Formationen"],
];
const glatt = (s) => {
    const roh = String(s)
        .replace(/MeshStandardNodeMaterial_\d+/g, "")
        .replace(/, … \d+\]/, "]")
        .replace(/\s+/g, " ")
        .trim();
    const f = FAMILIE.find(([re]) => re.test(roh));
    return f ? f[1] : roh;
};
function lies(datei) {
    const b = JSON.parse(fs.readFileSync(datei, "utf8"));
    const jeStoff = new Map(); // Stoff-id → { name, frag (Länge), fkey, vert }
    for (const e of (b.extra || {}).programme || []) {
        const id = (String(e[3]).match(/_(\d+) ¦/) || [])[1];
        if (!id || !/MeshStandard/.test(e[3])) continue;
        const name = glatt(e[4] || String(e[3]).split(" ¦ ")[0]);
        const s = jeStoff.get(id) || { name, frag: 0, fkey: "", vert: 0 };
        if (name.length > s.name.length || /^Arena\[/.test(name)) s.name = name;
        jeStoff.set(id, s);
    }
    for (const p of b.pipes || []) {
        const id = (String(p[2]).match(/_(\d+)$/) || [])[1];
        const s = id && jeStoff.get(id);
        if (!s || !p[4]) continue;
        const [fl, vl] = [Number(String(p[4]).split(":")[0]), Number(String(p[3]).split(":")[0])];
        if (fl > s.frag) [s.frag, s.fkey, s.vert] = [fl, p[4], vl];
    }
    const jeName = new Map();
    for (const s of jeStoff.values()) if (s.frag && (!jeName.has(s.name) || jeName.get(s.name).frag < s.frag)) jeName.set(s.name, s);
    return { datei, b, jeName };
}
const laeufe = process.argv.slice(2).map(lies);
if (!laeufe.length) throw new Error("baustein-lesen.cjs <stand.json> [<fall.json> …]");
const stand = laeufe[0];
const titel = (l) => path.basename(l.datei).replace(/[.]json$/, "");
console.log("FRAGMENT-TEXT je Programm in KB · " + laeufe.map(titel).join(" · "));
for (const [name, s] of [...stand.jeName].sort((x, y) => x[1].frag - y[1].frag)) {
    const zellen = laeufe.map((l, i) => {
        const z = l.jeName.get(name);
        return !z ? "    —" : i === 0 ? kb(z.frag).padStart(6) : (kb(z.frag) + " (" + (z.frag - s.frag >= 0 ? "+" : "") + kb(z.frag - s.frag) + ")").padStart(16);
    });
    console.log(zellen.join(" ") + "  " + name);
}
for (const l of laeufe.slice(1)) for (const name of l.jeName.keys()) if (!stand.jeName.has(name)) console.log("  nur in " + titel(l) + ": " + kb(l.jeName.get(name).frag) + "  " + name);
if (process.env.SCHREIB)
    for (const l of laeufe) {
        const dir = path.join(process.env.SCHREIB, titel(l));
        fs.mkdirSync(dir, { recursive: true });
        for (const [name, s] of l.jeName) {
            const text = (l.b.shader || {})[s.fkey];
            if (text) fs.writeFileSync(path.join(dir, name.replace(/[^A-Za-z0-9#_-]+/g, "_").slice(0, 60) + ".wgsl"), text);
        }
    }
