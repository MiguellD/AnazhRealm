const { oeffne, klick, taste, warte } = require("./spiel.cjs");
(async () => {
  const o = await oeffne({ profil: __dirname + "/profil-spielgang", neu: false });
  const { page, cdp } = o;
  await klick(cdp); await warte(1000);
  const lage = () => page.evaluate(() => { const st = window.anazhRealm.state, p = st.playerMesh.position; return { p: [+p.x.toFixed(2), +p.z.toFixed(2)], keyW: st.keys && st.keys.w, akt: document.activeElement && (document.activeElement.id || document.activeElement.tagName), lock: st.isPointerLocked, chat: st.chatOpen || st._chatOffen, inv: st.inventoryOpen }; });
  console.log("start", JSON.stringify(await lage()));
  await taste(cdp, "w", "keyDown"); await warte(3000); console.log("W 3s", JSON.stringify(await lage())); await taste(cdp, "w", "keyUp");
  await taste(cdp, "enter", "keyDown"); await taste(cdp, "enter", "keyUp"); await warte(400);
  await cdp.send("Input.insertText", { text: "folge mir" }); await warte(200);
  await taste(cdp, "enter", "keyDown"); await taste(cdp, "enter", "keyUp"); await warte(1500);
  console.log("nach chat", JSON.stringify(await lage()));
  await klick(cdp); await warte(500); await klick(cdp); await warte(500);
  await taste(cdp, "w", "keyDown"); await warte(3000); console.log("W 3s nach chat", JSON.stringify(await lage())); await taste(cdp, "w", "keyUp");
  await o.browser.close();
})();
