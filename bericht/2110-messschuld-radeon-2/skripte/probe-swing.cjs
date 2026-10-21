const { oeffne, klick, warte } = require("./spiel.cjs");
(async () => {
  const o = await oeffne({ profil: __dirname + "/profil-schwung", neu: false });
  const { page, cdp } = o;
  await klick(cdp); await warte(1500);
  await page.evaluate(() => { const r = window.anazhRealm; window.__trace = []; for (const m of ["tryMouseBreak", "_beginPlayerSwing", "_harvestScatterPick", "_strikeArchitecture"]) { const f = r[m]; r[m] = function () { const v = f.apply(this, arguments); window.__trace.push([m, performance.now(), v]); return v; }; } });
  for (let i = 0; i < 3; i++) {
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: 960, y: 540, button: "left", clickCount: 1 });
    await warte(40);
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: 960, y: 540, button: "left", clickCount: 1 });
    await warte(1200);
  }
  console.log(JSON.stringify(await page.evaluate(() => ({ t: window.__trace, verb: window.anazhRealm.state.player._mausVerb, locked: window.anazhRealm.state.isPointerLocked, kb: window.anazhRealm.state.keybindings }))));
  await o.browser.close();
})();
