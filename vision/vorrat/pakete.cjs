// Vorkauen für die Vorrats-Batterie: je Paket die Leitern der Karte 2 (Sprossen 1–3), ihre Tafel-Zeilen und die alten Stationen
// mit Stand und Fundstelle. Aufruf: node pakete.cjs <koord-baum> <ziel-ordner>
const fs = require("fs");
const path = require("path");
const [KOORD, ZIEL] = process.argv.slice(2);
const lies = (p) => JSON.parse(fs.readFileSync(path.join(KOORD, p), "utf8"));
const karte = lies("vision/meisterkarte-2.json");
const tafel = lies("vision/richter-tafel.json");
const stand = lies("meisterkarte-quelle/punkte/stand.json");

const L = [];
const lauf = (o) => {
    if (Array.isArray(o)) return o.forEach(lauf);
    if (o && typeof o === "object") {
        if (o.id && Array.isArray(o.sprossen)) L.push(o);
        Object.values(o).forEach(lauf);
    }
};
lauf(karte);

// Fundstellen der Stationen: stationen/gN.js Zeile von `kriterium: "<key>"`
const fund = new Map();
const SDIR = path.join(KOORD, "meisterkarte-quelle/punkte/stationen");
for (const n of fs.readdirSync(SDIR).filter((x) => /^g\d\.js$/.test(x))) {
    fs.readFileSync(path.join(SDIR, n), "utf8")
        .split("\n")
        .forEach((z, i) => {
            const m = /^\s*kriterium: "([^"]+)"/.exec(z);
            if (m) (fund.get(m[1]) || fund.set(m[1], []).get(m[1])).push("stationen/" + n + ":" + (i + 1));
        });
}
// Texte der alten Kriterien
const alt = new Map();
for (const g of ["g1", "g2", "g3", "g4", "g5", "g6"]) {
    const m = require(path.join(KOORD, "meisterkarte-quelle/src", g + ".js"));
    for (const b of m.bereiche) b.kriterien.forEach((x, i) => alt.set(b.key + ".K" + (i + 1), x));
}
const kurz = (s, n) => (typeof s === "string" && s.length > n ? s.slice(0, n) + " …" : s);
const altZeile = (key) => {
    const k = alt.get(key) || {};
    const s = (stand.je && stand.je[key]) || {};
    return {
        kriterium: key,
        text: kurz(k.text || k.name || k.titel || JSON.stringify(k).slice(0, 300), 420),
        staffel: kurz(JSON.stringify(k.staffel || k.staffeln || null), 420),
        punkteAlt: s.punkte,
        fundstellen: fund.get(key) || [],
        stationen: (s.stationen || []).map((x) => ({ id: x.id, geraet: x.geraet, gruen: x.gruen, zahl: kurz(x.zahl, 260), sha: String(x.sha || "").slice(0, 8), gehalten: x.gehalten })),
    };
};

const PAKETE = {
    "01-planet-geologie-relief": ["planet.geologie", "planet.relief"],
    "02-planet-wasser-wetter": ["planet.wasser", "planet.wetter"],
    "03-planet-zeit-erde-kosmos": ["planet.zeit", "planet.erde", "planet.kosmos"],
    "04-leben-pflanzen-tiere": ["leben.pflanzen", "leben.tiere"],
    "05-leben-wasser-oeko": ["leben.wasser", "leben.oeko"],
    "06-leben-evolution-kopplung": ["leben.evolution", "leben.kopplung"],
    "07-mensch-leib-sport": ["mensch.leib", "mensch.sport"],
    "08-mensch-geist-menge": ["mensch.geist", "mensch.menge"],
    "09-mensch-stadt-netz-bau": ["mensch.stadt", "mensch.netz", "mensch.bau"],
    "10-mensch-fahrzeug-nahrung-wirtschaft": ["mensch.fahrzeug", "mensch.nahrung", "mensch.wirtschaft"],
    "11-mensch-macht-kultur": ["mensch.macht", "mensch.kultur"],
    "12-mensch-zeit-zukunft-kopplung": ["mensch.zeit", "mensch.zukunft", "mensch.kopplung"],
    "13-erleben-spieler-schoepfen": ["erleben.spieler", "erleben.schoepfen"],
    "14-erleben-sinn-sinne": ["erleben.sinn", "erleben.sinne"],
    "15-erleben-bild-klang-kopplung": ["erleben.bild", "erleben.klang", "erleben.kopplung"],
    "16-same-physik-entfaltung": ["same.physik", "same.entfaltung"],
    "17-same-massstab-gedaechtnis-preis": ["same.massstab", "same.gedaechtnis", "same.preis"],
    "18-planet-same-kopplung": ["planet.kopplung", "same.kopplung"],
};
fs.mkdirSync(ZIEL, { recursive: true });
const gesehen = new Set();
const zeilen = [];
for (const [name, vor] of Object.entries(PAKETE)) {
    const leitern = L.filter((l) => vor.includes(l.id.split(".").slice(0, 2).join(".")));
    leitern.forEach((l) => gesehen.add(l.id));
    const aus = {
        paket: name,
        kopfSpiel: "e4eeee086ca78f20b27ae87e12761508215fca34",
        preisTreppe: karte.preisTreppe,
        leitern: leitern.map((l) => ({
            id: l.id,
            name: l.name,
            art: l.art,
            misst: l.misst,
            heute: l.heute,
            kern: l.kern,
            fuss: l.fuss,
            beleg: l.beleg,
            sprossen: l.sprossen.slice(0, Math.max(3, (l.heute || 0) + 2)),
            sprossenGesamt: l.sprossen.length,
            tafel: tafel.zeilen.filter((z) => z.leiter === l.id),
            alt: (l.alt || []).map(altZeile),
        })),
    };
    const p = path.join(ZIEL, name + ".json");
    fs.writeFileSync(p, JSON.stringify(aus, null, 1));
    zeilen.push(name + " " + leitern.length + " Leitern, " + Math.round(fs.statSync(p).size / 1024) + " kB");
}
console.log(zeilen.join("\n"));
console.log("Leitern gesamt " + L.length + ", verteilt " + gesehen.size + ", ohne Paket: " + L.filter((l) => !gesehen.has(l.id)).map((l) => l.id).join(" "));
