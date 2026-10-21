const fs = require("fs");
const { oeffne, klick, warte } = require("./spiel.cjs");
(async () => {
  const o = await oeffne({ profil: __dirname + "/profil-schwung", neu: false });
  const { page, cdp } = o;
  await klick(cdp); await warte(1500);
  await page.evaluate(fs.readFileSync(__dirname + "/zielen.js", "utf8"));
  await page.evaluate(() => window.anazhRealm.setCameraMode("third"));
  await warte(600);
  await page.evaluate(() => window.__zielTier(4));
  await page.evaluate(() => { const r = window.anazhRealm; window.__k = []; window.addEventListener("mousedown", (e) => window.__k.push(["down", performance.now(), e.timeStamp]), true);
    window.__dauer = {}; for (const m of ["_pickArchitectureAtCrosshair", "_pickCreatureAtCrosshair", "_kampfSchwungRahmen", "_pickScatterAtCrosshair", "_kampfKegelZiel", "_raycastWorldHit", "_fadenkreuzStrahl", "_mouseActionStaminaGate", "_kampfZielAbstand", "_kampfZielMerken", "_consumeMouseStamina", "_feelAction", "_playerSwingDauer"]) { const f = r[m]; if (typeof f !== "function") continue; r[m] = function () { const a = performance.now(); const v = f.apply(this, arguments); const d = performance.now() - a; (window.__dauer[m] = window.__dauer[m] || []).push(+d.toFixed(2)); return v; }; }
    for (const m of ["tryMouseBreak", "_beginPlayerSwing", "_tickKampfSchwung"]) { const f = r[m]; let n = 0; r[m] = function () { const v = f.apply(this, arguments); if (m !== "_tickKampfSchwung" || (this.state.player._swing && n++ < 400)) window.__k.push([m, performance.now(), m === "_tickKampfSchwung" ? +this.state.player._swing.t.toFixed(3) : v]); return v; }; } });
  for (let i = 0; i < 3; i++) {
    await page.evaluate(async () => { for (let j = 0; j < 400 && window.anazhRealm.state.player._swing; j++) await new Promise((f) => requestAnimationFrame(f)); window.__k.push(["--", performance.now()]); });
    await warte(300);
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: 960, y: 540, button: "left", clickCount: 1 });
    await warte(30);
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: 960, y: 540, button: "left", clickCount: 1 });
    await warte(700);
  }
  const k = await page.evaluate(() => window.__k);
  let t0 = 0; for (const e of k) { if (e[0] === "down") t0 = e[2]; if (e[0] === "--") t0 = 0; }
  const out = []; let base = null;
  for (const e of k) { if (e[0] === "down") base = e[2]; if (base != null && out.length < 200) out.push(e[0] + "@" + (e[1] - base).toFixed(1) + (e[2] !== undefined && e[0] !== "down" ? "=" + e[2] : "")); }
  console.log(JSON.stringify(await page.evaluate(() => window.__dauer)));
  console.log(out.filter((s) => !s.startsWith("_tickKampfSchwung") || true).slice(0, 60).join(" "));
  await o.browser.close();
})();
