// paar.cjs — legt je zwei Bilder (main | Zweig) nebeneinander, 2×640×360 mit Beschriftung, als EIN PNG
const puppeteer = require(process.cwd() + "/node_modules/puppeteer-core");
const fs = require("fs"), path = require("path");
const D = process.argv[2], paare = process.argv.slice(3).map((p) => p.split("="));
(async () => {
    const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
    const pg = await b.newPage();
    await pg.setViewport({ width: 1280, height: 384 });
    for (const [aus, l, r] of paare) {
        const img = (f) => "data:image/png;base64," + fs.readFileSync(path.join(D, f)).toString("base64");
        await pg.setContent(`<body style="margin:0;background:#111;color:#fff;font:14px sans-serif"><div style="display:flex">
          <div><div style="height:24px">${l}</div><img src="${img(l)}" width="640" height="360"></div>
          <div><div style="height:24px">${r}</div><img src="${img(r)}" width="640" height="360"></div></div></body>`);
        await pg.screenshot({ path: path.join(D, aus) });
        console.log("ok", aus);
    }
    await b.close();
})();
