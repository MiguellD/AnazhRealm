// GEGNER: Heap nach zwei GC je Ziel (Haupt-Faden und jeder Faden) an der Heimat, Null-Renderer; Baum als argv[2]
const path = require("path");
const W = path.join(__dirname, "..");
const { statikServer, nullWelt, hauptLauf } = require("./lib/welt-boot.cjs");
const server = statikServer();
hauptLauf(async () => {
    const { browser, page } = await nullWelt(server, { frist: 300000 }, 60000);
    await page.evaluate(async () => {
        const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
        for (let i = 0; i < 2400 && !(r.state.voxelWorkerReady && r.state.voxelWorkerWorldgenSynced); i++) await sleep(50);
        if (typeof r._planetAnker === "function") await r._planetAnker();
        await sleep(8000);
    });
    const ziele = [["main", await page.target().createCDPSession()]];
    for (const w of page.workers()) ziele.push([w.url().split("/").pop().slice(0, 40) + "#" + ziele.length, w.client]);
    const aus = {};
    for (const [n, c] of ziele) {
        try {
            await c.send("HeapProfiler.collectGarbage");
            await c.send("HeapProfiler.collectGarbage");
            const h = await c.send("Runtime.getHeapUsage");
            aus[n] = +(h.usedSize / 1048576).toFixed(2);
        } catch (e) { aus[n] = "x " + e.message.slice(0, 40); }
    }
    const faeden = await page.evaluate(() => (r._nebenFaeden ? [...r._nebenFaeden.keys()] : []));
    const summe = Object.values(aus).filter((x) => typeof x === "number").reduce((a, b) => a + b, 0);
    console.log("HEAP " + JSON.stringify({ baum: path.basename(W), faeden, summeMB: +summe.toFixed(2), je: aus }));
    await browser.close();
    server.close();
    process.exit(0);
});
