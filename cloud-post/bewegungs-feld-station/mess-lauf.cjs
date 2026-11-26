// node mess.cjs <baum> <werkbank-port> <ausgabe-ordner> [yaw,yaw...]
const path = require("path"), fs = require("fs");
const [baum, port, ordner, yaws] = process.argv.slice(2);
const { werkbankRuf } = require(path.join(baum, "scripts/lib/welt-boot.cjs"));
const seite = fs.readFileSync(path.join(__dirname, process.env.SEITE || "seite.js"), "utf8").replace(/^\/\/.*\n/, "");
fs.mkdirSync(ordner, { recursive: true });
const ruf = async (o) => {
    const a = await werkbankRuf(+port, "/eval", { code: `return await (${seite})(${JSON.stringify(o)});` });
    return a && a.ergebnis !== undefined ? a.ergebnis : a;
};
(async () => {
    const blicke = (yaws || "null").split(",").map((y) => (y === "null" ? null : +y));
    const alle = {};
    for (const [k, yaw] of blicke.entries())
        for (const halten of [true, false]) {
            const name = `blick${k}-${halten ? "ruhe" : "lauf"}`;
            const t0 = Date.now();
            const e = await ruf({ yaw, halten, liveMs: 6000, refBilder: 32, png: !halten, maxM: 120 });
            const p = e && e.png;
            if (p) for (const [n, url] of Object.entries(p)) fs.writeFileSync(path.join(ordner, `${name}-${n}.png`), Buffer.from(url.split(",")[1], "base64"));
            if (e) delete e.png;
            alle[name] = e;
            console.log(name, Math.round((Date.now() - t0) / 1000) + " s", JSON.stringify(e && (e.geister || e)).slice(0, 400));
            if (e && e.zensus) console.log("  ZENSUS", JSON.stringify({ bewegt: e.zensus.bewegt, getragen: e.zensus.getragen, anteilOhne: e.zensus.anteilOhne, klassen: Object.fromEntries(Object.entries(e.zensus.klassen).map(([a, b]) => [a, [b.bewegt, b.getragen]])) }));
        }
    fs.writeFileSync(path.join(ordner, "mess.json"), JSON.stringify(alle, null, 1));
})().catch((e) => {
    console.error("MESS-FEHLER", e);
    process.exit(1);
});
