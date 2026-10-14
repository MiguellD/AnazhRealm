// 1310-15: DER LEIB IM BILD DES SPIELERS — in der laufenden Werkbank-Welt (echter Renderer): die Sicht des Spiels
// (`setCameraMode` third|first), Gier und Neigung gesetzt, die Spiel-Kamera schwingt in Takten ein (`_gameLoopTick`), der
// Leib bleibt sichtbar (die Werkbank-`bild` verbirgt ihn), Tiere aus dem Bild. Aufnahme aus dem Ausgabe-Pfad.
//   node leib-bild.cjs <port> <third|first> <gier> <neigung> <datei.png> [takte]
"use strict";
const http = require("http");
const fs = require("fs");
const [port, sicht, gier, neigung, datei, takte = "90"] = process.argv.slice(2);
const code = `
const st = r.state;
st.renderer.setAnimationLoop(null);
window.__buehne();
for (const c of st.creatures || []) c.visible = false;
r.setCameraMode(${JSON.stringify(sicht)});
st.yaw = ${Number(gier)};
st.pitch = ${Number(neigung)};
for (const k of Object.keys(st.keys || {})) st.keys[k] = false;
let tMs = performance.now();
for (let i = 0; i < ${Number(takte)}; i++) { tMs += 1000 / 60; r._gameLoopTick(tMs); if (i % 15 === 0) await new Promise((q) => setTimeout(q, 0)); }
window.__buehne();
for (const c of st.creatures || []) c.visible = false;
let auf = null;
for (let i = 0; i < 2; i++) { r._schattenAlleNeu(); auf = await window.__ausgabeAufnahme(1920, 1080, 1, { satz: ${JSON.stringify(sicht === "first" ? "messung" : "beweis")} }); }
const cv = document.createElement("canvas"); cv.width = 1920; cv.height = 1080;
const ctx = cv.getContext("2d"); const img = ctx.createImageData(1920, 1080); img.data.set(auf.u8.subarray(0, 1920 * 1080 * 4)); ctx.putImageData(img, 0, 0);
const pm = st.playerMesh, cam = st.camera;
return { png: cv.toDataURL("image/png").split(",")[1], kamera: cam.position.toArray().map((v) => +v.toFixed(2)), spieler: pm.position.toArray().map((v) => +v.toFixed(2)),
  abstand: +cam.position.distanceTo(pm.position).toFixed(2), sicht: st.cameraMode, sichtbar: pm.visible, dc: auf.info && auf.info.drawCalls };`;
const q = http.request({ host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => {
        const j = JSON.parse(d.slice(d.indexOf("{")));
        const e = j.ergebnis || j;
        if (!e.png) { console.log(d.slice(0, 600)); process.exit(1); }
        fs.writeFileSync(datei, Buffer.from(e.png, "base64"));
        delete e.png;
        console.log(JSON.stringify(e));
    });
});
q.end(JSON.stringify({ code }));
