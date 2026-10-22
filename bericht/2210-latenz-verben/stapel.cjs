// Wo steht die Werkbank-Seite? CDP an Port 4489: Lebenszeichen (Runtime.evaluate mit Frist), dann Debugger.pause → die Aufruf-Kette
const pp = require(process.argv[2]);
(async () => {
    const b = await pp.connect({ browserURL: "http://127.0.0.1:49434", defaultViewport: null, protocolTimeout: 20000 });
    const pages = await b.pages();
    const page = pages.find((p) => /4312/.test(p.url())) || pages[0];
    const c = await page.target().createCDPSession();
    const frist = (p, ms) => Promise.race([p, new Promise((_, n) => setTimeout(() => n(new Error("Frist " + ms + " ms")), ms))]);
    let lebt;
    try {
        lebt = await frist(c.send("Runtime.evaluate", { expression: "JSON.stringify({ l: !!window.__latenz, bilder: window.__latenz && window.__latenz.bilder.length, raf: window.__latenz && window.__latenz.raf, verb: window.__latenz && window.__latenz.verb, fehler: window.__latenz && window.__latenz.fehler, probe: window.__latenz && window.__latenz.probe })", returnByValue: true }), 5000);
        console.log("LEBT", lebt.result.value);
    } catch (e) {
        console.log("ANTWORTET NICHT:", e.message);
    }
    await c.send("Debugger.enable");
    const halt = new Promise((res) => c.once("Debugger.paused", res));
    await c.send("Debugger.pause");
    const p = await frist(halt, 10000).catch((e) => ({ fehler: e.message }));
    if (p.callFrames)
        for (const f of p.callFrames.slice(0, 14)) console.log(`  ${f.functionName || "(anonym)"}  ${(f.url || "").replace(/.*\//, "")}:${f.location.lineNumber + 1}`);
    else console.log("kein Halt:", p.fehler);
    await c.send("Debugger.resume").catch(() => {});
    await c.detach();
    b.disconnect();
})().catch((e) => console.log("FEHLER", e.message));
