const { oeffne, klick, warte } = require("./spiel.cjs");
(async () => {
  const o = await oeffne({ profil: __dirname + "/profil-schwung", neu: false });
  const { page, cdp } = o;
  const st = () => page.evaluate(() => ({ el: document.pointerLockElement && document.pointerLockElement.tagName, locked: window.anazhRealm.state.isPointerLocked, inv: window.anazhRealm.state.inventoryOpen, schub: window.anazhRealm._uiSchubladeOffen() }));
  console.log("vor", JSON.stringify(await st()));
  await page.bringToFront();
  await klick(cdp); await warte(1000);
  console.log("cdp", JSON.stringify(await st()));
  await page.mouse.click(960, 540); await warte(1000);
  console.log("pmouse", JSON.stringify(await st()));
  const r = await page.evaluate(async () => { try { await window.anazhRealm.state.renderer.domElement.requestPointerLock(); return "ok"; } catch (e) { return String(e); } });
  console.log("direkt", r, JSON.stringify(await st()));
  await o.browser.close();
})();
