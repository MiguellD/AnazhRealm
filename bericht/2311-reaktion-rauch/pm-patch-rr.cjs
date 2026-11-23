// pm-patch-rr.cjs <k2-same.orig.js> <k2-same.js> — same.physik.reaktion gegen den Kopf von punkte-maschine (Blob 897e19ec):
//   S1: das Auge der Leiter steht ZUERST an der Mess-Wiese (`L.ort`), und `masseProbe` nennt ein fernes Auge als Messort (kein Urteil)
//   S2: die Druckwelle gemessen in der Welt (`druckProbe`: drei Ladungen, Radius gegen ∛W) statt „Leser fehlt"
"use strict";
const fs = require("fs");
const path = require("path");
const [von, nach] = process.argv.slice(2);
let t = fs.readFileSync(von, "utf8");
const tausch = (alt, neu) => {
    const n = t.split(alt).length - 1;
    if (n !== 1) throw new Error("Anker " + JSON.stringify(alt.slice(0, 90)) + " steht " + n + "×");
    t = t.replace(alt, () => neu);
};
// (1) die Worte der Leiter
tausch(
    `    // Herde aus 1 · 3 · 9 · 25 Zellen); Druckwelle, Korrosion je Ort, Schmelze fehlen beim Namen; S5 fährt die Saaten der Sitzung (H.seite.SAATEN, der EINE Wechsel`,
    `    // Herde aus 1 · 3 · 9 · 25 Zellen). DER MESSORT DER LEITER IST DIE MESS-WIESE, genannt aus der EINEN Quelle der Orte (\`messort\` von
    // welt-orte: die Sitzung liest ihn aus dem Text der Probe und stellt ihn VOR dem Deckel, punkte.cjs \`probeOrt\`; \`L.ort\` hält ihn im
    // Deckel fest) — das Bild des Brands trägt Flamme und Rauch nur bis \`BRAND.bild.weiteM\` um das Auge der Stufen. Bis 23.11. nannte
    // die Leiter keinen Ort und maß, wo die Probe davor das Auge ließ (Radeon f0a89f7e: 1 093 m vom Herd — Rauch 0 kg, masse_abw_pct
    // 94,45; an der GTX 1050 mit dem Auge am Startplatz nachgestellt: dieselben Zahlen); ein fernes Auge nennt \`masseProbe\` seither als
    // Messort (kein Urteil). S2 misst die Druckwelle (\`druckProbe\`: drei Ladungen verschiedener Energie, je Ladung der Radius, bis zu dem
    // Scheiben brechen, gegen ∛W); Korrosion je Ort, Schmelze fehlen beim Namen; S5 fährt die Saaten der Sitzung (H.seite.SAATEN, der EINE Wechsel`,
);
// (2) der Pfad: das Auge der Stufen und das Platten-Gesetz des Kerns
tausch(
    `            pfad: ["scripts/werkbank.cjs", "stamm/feld-brand.js", "stamm/bau-buch.js", "stamm/bau-vorlagen.js", "stamm/bild-himmel.js", "stamm/kreatur-verhalten.js", "stamm/siedlung-satz.js"],
            welt: [{ wort: "umgesetzt_kg", ab: 0.1, was: "Masse, die die Reaktion in der Welt umsetzt (kg)" }],`,
    `            pfad: ["scripts/werkbank.cjs", "stamm/feld-brand.js", "stamm/stoff-material.js", "stamm/bau-buch.js", "stamm/bau-vorlagen.js", "stamm/bild-himmel.js", "stamm/siedlung-satz.js", "schmiede-core.js", "scripts/lib/welt-orte.cjs", "spec/profiband/haushalt.json"],
            welt: [{ wort: "umgesetzt_kg", ab: 0.1, was: "Masse, die die Reaktion in der Welt umsetzt (kg)" }],`,
);
// (3) das Soll von S2: der Umfang (drei Ladungen) und der Zeuge der Welt (gebrochene Scheiben)
tausch(
    `                2: { soll: [{ wort: "radius_abw_pct", richtung: "≤", wert: 25, wortlaut: "Schadensradius ∝ W^(1/3) ±25 % bei drei Ladungen", feld: "richter" }] },`,
    `                2: {
                    soll: [{ wort: "radius_abw_pct", richtung: "≤", wert: 25, wortlaut: "Schadensradius ∝ W^(1/3) ±25 % bei drei Ladungen", feld: "richter" }],
                    umfang: { verlangt: 3, einheit: "Ladungen verschiedener Energie", wortlaut: "bei drei Ladungen", feld: "richter" },
                    welt: [{ wort: "gebrochen", ab: 3, was: "Scheiben, die die Wellen der Ladungen in der Welt brachen" }],
                },`,
);
// (4) die Wand am Messort in `masseProbe`: das Auge der Stufen gegen die fernste Zelle der Herde
tausch(
    `                                if (Math.max(Math.abs(i), Math.abs(j)) === d && r._brandStoff(cx + i, cz + j, st.spielZeit)) bette.push([cx + i, cz + j]);
`,
    `                                if (Math.max(Math.abs(i), Math.abs(j)) === d && r._brandStoff(cx + i, cz + j, st.spielZeit)) bette.push([cx + i, cz + j]);
                    // DAS AUGE DER PROBE (die Wand am Messort): das Bild des Brands gibt Flamme und Rauch nur Zellen bis \`BRAND.bild.weiteM\` um das
                    // Auge der Stufen (stamm/feld-brand.js \`_brandBild\` über \`_lodAuge\`) — steht es ferner, zeichnet die Welt keinen Ballen, und
                    // die Sprosse fiele an ihrem Messort statt an der Welt (Radeon f0a89f7e: das Auge 1 093 m vom Herd, Rauch 0 kg, masse_abw_pct
                    // 94,45). Dann urteilt die Probe NICHT: sie nennt den Messort beim Namen.
                    const auge = r._lodAuge();
                    const augeM = auge ? Math.hypot(auge.x - ort[0], auge.z - ort[1]) : Infinity;
                    const fernM = auge ? Math.max(...bette.map(([x, z]) => Math.hypot((x + 0.5) * cs - auge.x, (z + 0.5) * cs - auge.z))) + cs * Math.SQRT1_2 : Infinity;
                    if (!(fernM <= B.bild.weiteM))
                        return { messort: "das Auge der Probe steht " + (auge ? Math.round(augeM) + " m vom Messort wiese (" + ort.join(" / ") + "), die fernste Zelle der Herde " + Math.round(fernM) + " m von ihm" : "nirgends (\`_lodAuge\`)") + " — das Bild des Brands trägt Flamme und Rauch bis " + B.bild.weiteM + " m um das Auge (stamm/feld-brand.js \`_brandBild\`)" };
`,
);
tausch(`                async function masseProbe(r) {`, `                async function masseProbe(r, ort) {`);
tausch(
    `                        holz: r3(holz),
                        bett: { stoff: f.zeile.name, leb: r3(f.leb), anteil: f.anteil },`,
    `                        holz: r3(holz),
                        augeM: Math.round(augeM),
                        bett: { stoff: f.zeile.name, leb: r3(f.leb), anteil: f.anteil },`,
);
// (5) die Probe der Druckwelle (der Text der Seite) und das Auge der Leiter
const seite = fs
    .readFileSync(path.join(__dirname, "seite-druck.js"), "utf8")
    .trimEnd()
    .split("\n")
    .map((z) => (z ? "                    " + z : z))
    .join("\n");
tausch(
    `                const z = await L.ev("return (" + zaehlen + ")(r);", 30);
                L.zeile("Reaktionen der Stoff-Tafel: " + JSON.stringify(z));
                L.preisPose("wiese", "ego");`,
    `                // DIE DRUCKWELLE NACH DER LADUNG (front-druckwelle, stamm/feld-brand.js \`_ladungJ\` · \`_druckWelle\` · \`_druckWerk\`; schmiede \`plattenLast\`)
                async function druckProbe(r) {
${seite}
                }
                const z = await L.ev("return (" + zaehlen + ")(r);", 30);
                L.zeile("Reaktionen der Stoff-Tafel: " + JSON.stringify(z));
                // DER MESSORT DER LEITER aus der EINEN Quelle der Orte (welt-orte → spec/profiband/haushalt.json): die Sitzung liest ihn aus
                // diesem Text und stellt ihn vor dem Deckel (punkte.cjs \`probeOrt\`), \`L.ort\` hält ihn im Deckel fest (warm ~3 s) — S1 liest
                // das Bild des Brands, das nur um das Auge der Stufen lebt; die Probe endet an derselben Stelle (Preis-Pose)
                const M = require(H.path.resolve("scripts/lib/welt-orte.cjs")).messort("wiese");
                await L.ort(M.id, "ego");
                L.preisPose(M.id, "ego");`,
);
tausch(
    `                    const m = await L.ev("return await (" + masseProbe + ")(r);", 120);`,
    `                    const m = await L.ev("return await (" + masseProbe + ")(r, " + JSON.stringify([M.x, M.z]) + ");", 120);`,
);
// (6) S1: ein fernes Auge ist der Messort, kein Urteil
tausch(
    `                    L.zeile("Masse der Reaktion: " + JSON.stringify(m));
                    if (m.fehler) return L.umfang(1, 0, m.fehler);`,
    `                    L.zeile("Masse der Reaktion: " + JSON.stringify(m));
                    if (m.messort) throw H.messort(new Error("same.physik.reaktion S1: " + m.messort));
                    if (m.fehler) return L.umfang(1, 0, m.fehler);`,
);
// (7) S2: gemessen in der Welt
tausch(
    `                await L.je(2, async () => L.leser(2, "Explosion: kein Gesetz der Druckwelle, keine Ladung — das Wort steht nur als Klemme des Gedränges (stamm/kreatur-verhalten.js:525)"));`,
    `                await L.je(2, async () => {
                    const v = P.sprossen[2].umfang.verlangt;
                    const d = await L.ev("return await (" + druckProbe + ")(r);", 60);
                    L.zeile("Druckwelle der Ladungen: " + JSON.stringify(d));
                    if (d.fehler) return L.umfang(2, d.gemessen, d.fehler);
                    const je = d.ladungen
                        .map((l) => (l.fehler ? "Maß " + l.mass + ": " + l.fehler : l.energieMJ + " MJ: " + l.gebrochen + " von " + l.scheiben + " Scheiben brachen, die fernste in " + l.innenM + " m, die nächste stehende in " + l.aussenM + " m" + (l.radiusM ? " → R " + l.radiusM + " m (R ÷ ∛W " + l.jeW3 + ")" : " — kein Radius zwischen zwei Scheiben")))
                        .join(" · ");
                    if (d.gemessen < v) return L.umfang(2, d.gemessen, "nur " + d.gemessen + " von " + v + " Ladungen verschiedener Energie tragen einen Schadensradius (" + je + ")");
                    L.gemessen(2, { radius_abw_pct: d.radius_abw_pct }, { erzeugt: d.gemessen, welt: { gebrochen: d.gebrochen }, taeter: "SCHADENSRADIUS gegen ∛W (die Welt: R ∝ W^" + d.hoch + "): " + je });
                });`,
);
fs.writeFileSync(nach, t);
// die Texte der Seite, wie die Station sie ruft (String(fn) = der Quelltext der Funktion): für den Lauf an der Werkbank
const fn = (name) => {
    const a = t.indexOf("async function " + name + "(r");
    const e = t.indexOf("\n                }\n", a);
    if (a < 0 || e < 0) throw new Error("die Funktion " + name + " steht nicht");
    return t.slice(a, e + "\n                }".length);
};
for (const name of ["masseProbe", "druckProbe"]) {
    const text = fn(name);
    const ruf = "return await (" + text + ")(r" + (name === "masseProbe" ? ", [-280.4, -1045.6]" : "") + ");";
    new (Object.getPrototypeOf(async function () {}).constructor)("r", "AnazhRealm", "window", ruf);
    fs.writeFileSync(path.join(__dirname, "seite-" + name + ".eval.js"), ruf);
    console.log(name + ": " + text.length + " Zeichen, Syntax ok");
}
console.log("gesetzt " + nach + " (" + t.length + " Zeichen, " + t.split("\n").length + " Zeilen)");
