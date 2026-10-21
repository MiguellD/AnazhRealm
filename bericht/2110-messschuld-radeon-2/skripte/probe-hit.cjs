const fs = require("fs");
const { oeffne, klick, warte } = require("./spiel.cjs");
(async () => {
  const o = await oeffne({ profil: __dirname + "/profil-schwung", neu: false });
  const { page, cdp } = o;
  await klick(cdp); await warte(1500);
  await page.evaluate(fs.readFileSync(__dirname + "/zielen.js", "utf8"));
  await page.evaluate(() => window.anazhRealm.setCameraMode("third"));
  await warte(800);
  for (const d of [0.5, 0.65, 0.8, 4]) {
    const a = await page.evaluate((d) => window.__zielTier(d, 0.2), d);
    const vor = await page.evaluate(() => { const r = window.anazhRealm; const R = r._kampfSchwungRahmen({}); const u = r._pickCreatureAtCrosshair(); return { pick: !!u, nah: u && u.point ? +r._kampfZielAbstand(R, u.point).toFixed(2) : null, klinge: +(R.reach + r.constructor._arenaGesetz().schwung.bladeRadiusM).toFixed(2), hp: window.__hsTier.userData.hp ?? window.__hsTier.userData.health }; });
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: 960, y: 540, button: "left", clickCount: 1 });
    await warte(30);
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: 960, y: 540, button: "left", clickCount: 1 });
    const spur = await page.evaluate(async () => { const st = window.anazhRealm.state, out = []; for (let i = 0; i < 90; i++) { await new Promise((f) => requestAnimationFrame(f)); const sw = st.player._swing; out.push([sw ? +sw.t.toFixed(3) : null, Number.isFinite(st.player._hitStopUntil) ? +(st.player._hitStopUntil - performance.now() / 1000).toFixed(3) : null, sw ? sw.hits.size : null]); } return { verb: st.player._mausVerb, out: out.filter((x) => x[0] != null).slice(0, 40) }; });
    console.log(d, JSON.stringify(a.d), a.pick, JSON.stringify(vor), spur.verb, JSON.stringify(spur.out));
  }
  await o.browser.close();
})();
