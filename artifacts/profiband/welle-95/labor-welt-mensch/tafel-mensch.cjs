// K45-2 Bild-Tafel: der Mensch auf Armlänge (Kopf 1,82 m, 75°, 1920×1080) — altes Labor · neues Labor (= Ofen L0) · Welt vorher ·
// Welt nachher (Radeon, Ausgabe-Pfad). node tafel-mensch.cjs <wurzel> <ordner> '<titel-json>'
const path = require("path"),
    fs = require("fs");
const W = process.argv[2],
    O = process.argv[3],
    T = JSON.parse(process.argv[4]);
const puppeteer = require(path.join(W, "node_modules/puppeteer"));
const b64 = (f) => "data:image/png;base64," + fs.readFileSync(path.join(O, f)).toString("base64");
(async () => {
    const b = await puppeteer.launch({ headless: true });
    try {
        const pg = await b.newPage();
        await pg.setViewport({ width: 1800, height: 700 });
        const bilder = { alt: b64("alt-armlaenge.png"), neu: b64("neu-armlaenge.png"), wv: b64("welt-vorher-armlaenge.png"), wn: b64("welt-nachher-armlaenge.png") };
        await pg.evaluate(
            async (B, T) => {
                const lade = (s) =>
                    new Promise((res) => {
                        const i = new Image();
                        i.onload = () => res(i);
                        i.src = s;
                    });
                const I = {};
                for (const k in B) I[k] = await lade(B[k]);
                const c = document.createElement("canvas");
                c.width = 1800;
                c.height = 700;
                document.body.style.margin = 0;
                document.body.appendChild(c);
                const x = c.getContext("2d");
                x.fillStyle = "#111";
                x.fillRect(0, 0, 1800, 700);
                const crop = [660, 140, 600, 720];
                ["alt", "neu", "wv", "wn"].forEach((k, i) => {
                    x.drawImage(I[k], crop[0], crop[1], crop[2], crop[3], i * 450, 40, 450, 540);
                    x.fillStyle = "#eee";
                    x.font = "17px sans-serif";
                    x.fillText(T[k], i * 450 + 8, 26);
                });
                x.fillStyle = "#bbb";
                x.font = "16px sans-serif";
                x.fillText(T.fuss, 10, 610);
                x.fillText(T.fuss2, 10, 636);
            },
            bilder,
            T
        );
        await pg.screenshot({ path: path.join(O, "tafel-mensch-labor-alt-neu-welt.png"), clip: { x: 0, y: 0, width: 1800, height: 650 } });
    } finally {
        await b.close();
    }
})();
