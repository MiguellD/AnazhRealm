// ausschnitt.cjs <ordner> <aus.png> <x> <y> <w> <h> <zoom> <bild>... — derselbe Ausschnitt aus mehreren Bildern nebeneinander, vergrößert
const puppeteer = require(process.cwd() + "/node_modules/puppeteer-core");
const fs = require("fs"), path = require("path");
const [D, aus, x, y, w, h, z, ...bilder] = process.argv.slice(2);
(async () => {
    const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
    const pg = await b.newPage();
    const W = w * z, H = h * z;
    await pg.setViewport({ width: W * bilder.length, height: H + 22 });
    const zelle = (f) => `<div><div style="height:22px">${f}</div><div style="width:${W}px;height:${H}px;overflow:hidden;position:relative">
      <img src="data:image/png;base64,${fs.readFileSync(path.join(D, f)).toString("base64")}" style="position:absolute;left:${-x * z}px;top:${-y * z}px;width:${1280 * z}px;height:${720 * z}px;image-rendering:auto"></div></div>`;
    await pg.setContent(`<body style="margin:0;background:#111;color:#fff;font:13px sans-serif"><div style="display:flex">${bilder.map(zelle).join("")}</div></body>`);
    await pg.screenshot({ path: path.join(D, aus) });
    await b.close();
    console.log("ok", aus);
})();
