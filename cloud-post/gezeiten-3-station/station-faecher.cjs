// DER FÄCHER DER STATION, WÖRTLICH (Bahn gezeiten-3, Vorprüfung 1): `GEZEIT_AN` und die Maße `hubM` · `periodeH` · `benetztDiff` werden
// aus der Stations-Datei geschnitten (kein Nachbau) und im Null-Renderer über ihre Adressen gefahren — 12 Saaten × 25 Stunden der
// Welt-Uhr und die Heimat × 25 Stunden.
//   node cloud-post/gezeiten-3-station/station-faecher.cjs <k2-planet.js> [standard|buehne]
// `buehne`: die Tag-Länge der Bühne (scripts/lib/ausgabe-aufnahme.cjs `buehne`: st.dayLengthMinutes = 1e12) — so steht die Sitzung des
// Richters, sobald eine Probe vor der Station `__buehne` rief (das Laden setzt die Tag-Länge nie zurück).
"use strict";
const fs = require("fs");
const path = require("path");
const WURZEL = path.resolve(__dirname, "..", "..");
const WB = require(path.join(WURZEL, "scripts/lib/welt-boot.cjs"));
const [datei, tag = "standard"] = process.argv.slice(2);
if (!datei || !["standard", "buehne"].includes(tag)) throw new Error("Aufruf: station-faecher.cjs <k2-planet.js> [standard|buehne]");
const text = fs.readFileSync(datei, "utf8");
const ab = text.indexOf("const GEZEIT_AN = async");
const schnitt = (von, bis) => {
    const a = text.indexOf(von, ab);
    const b = text.indexOf(bis, a);
    if (a < 0 || b < 0) throw new Error("die Station trägt den Schnitt nicht: " + von);
    return text.slice(a, b);
};
const GEZEIT_AN = schnitt("const GEZEIT_AN = async", "const jeSaat =");
const MASSE = schnitt("const jeSaat =", "const stunden =");
const server = WB.statikServer();
WB.hauptLauf(async () => {
    const { browser, page } = await WB.nullWelt(server, { da: (r) => r.state && r.state.player, frist: 600000 }, 120000);
    const w = await page.evaluate(
        async ({ GEZEIT_AN, MASSE, tag }) => {
            const r = window.anazhRealm, st = r.state;
            if (tag === "buehne") st.dayLengthMinutes = 1e12;
            const fn = new Function("return (async () => { " + GEZEIT_AN + MASSE + " return { GEZEIT_AN, jeSaat, hubVon, periodeVon, med }; })();");
            const F = await fn();
            const stunden = Array.from({ length: 25 }, (_, h) => h);
            const adressen = [];
            for (let s = 1; s <= 12; s++) for (const h of stunden) adressen.push({ saat: s, ort: null, zeit: h });
            for (const h of stunden) adressen.push({ saat: "heim", ort: null, zeit: h });
            const mit = { bisM: 20000 };
            const l = [];
            const t0 = performance.now();
            for (const a of adressen) {
                const wert = await F.GEZEIT_AN(r, null, a, mit);
                if (wert.spiegel != null) l.push({ a, w: wert });
            }
            const ms = performance.now() - t0;
            const saaten = F.jeSaat(l);
            const je = saaten.map((s) => ({ saat: s[0].a.saat, hub: F.hubVon(s), periode: F.periodeVon(s), nass: Math.max(...s.map((x) => x.w.nass)) - Math.min(...s.map((x) => x.w.nass)), uhr: s.reduce((p, x) => p + x.w.uhr, 0) }));
            return {
                tag: st.dayLengthMinutes,
                adressen: l.length,
                kuesten: saaten.length,
                ms: Math.round(ms),
                hubM: l.length ? Math.max(...saaten.map(F.hubVon)) : null,
                periodeH: F.med(saaten.filter((s) => F.hubVon(s) >= 0.01).map(F.periodeVon)),
                benetztDiff: Math.max(...je.map((x) => x.nass)),
                uhr: je.reduce((p, x) => p + x.uhr, 0),
                je,
            };
        },
        { GEZEIT_AN, MASSE, tag }
    );
    const R = (v, n = 3) => (v == null ? "ungemessen" : v.toFixed(n));
    for (const j of w.je) console.log(`  Saat ${String(j.saat).padStart(4)}: Hub ${R(j.hub)} m · Periode ${R(j.periode)} h · Watt ${j.nass} · Uhr ${j.uhr}`);
    console.log(`STATION ${path.basename(datei)} · Tag ${w.tag} min · hubM ${R(w.hubM)} · periodeH ${R(w.periodeH)} (Soll 12,42 ± 2 %) · benetztDiff ${w.benetztDiff} · ${w.kuesten} Küsten · ${w.adressen} Adressen · Uhr ${w.uhr} · ${w.ms} ms`);
    await browser.close();
    process.exit(0);
});
