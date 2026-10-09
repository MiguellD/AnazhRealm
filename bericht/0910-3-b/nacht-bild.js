// 0910-3 B: EIN Bild aus dem Ausgabe-Pfad (die Welt steht, `nacht-stellen.js` lief davor). Platzhalter __BLICK__.
const st = r.state;
const b = __BLICK__;
const gy = r._voxelSurfaceY(b.px, b.pz);
const ly = r._voxelSurfaceY(b.lx, b.lz) + b.ly;
st.camera.position.set(b.px, gy + b.py, b.pz);
st.camera.lookAt(b.lx, ly, b.lz);
st.camera.updateMatrixWorld(true);
// wie `werkbank bild`: der Spieler aus (die Kamera steht an seinem Platz), der Feld-Pass und die Schatten für diese Kamera,
// zwei Aufnahmen (die erste wärmt)
if (st.playerMesh) st.playerMesh.visible = false;
let auf = null;
for (let i = 0; i < 2; i++) {
    try {
        if (st.fernRing && typeof r._tickFeldPass === "function") r._tickFeldPass(st.fernRing);
    } catch (_e) {}
    r._schattenAlleNeu();
    if (st.traaNode) st.traaNode._jitterIndex = 0;
    auf = await window.__ausgabeAufnahme(1920, 1080, 1);
}
const u8 = auf.u8;
let l = 0;
for (let i = 0; i < u8.length; i += 4) l += 0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2];
const cv = document.createElement("canvas");
cv.width = 1920;
cv.height = 1080;
const ctx = cv.getContext("2d");
const img = ctx.createImageData(1920, 1080);
img.data.set(u8.subarray(0, 1920 * 1080 * 4));
ctx.putImageData(img, 0, 0);
return { name: b.name, hell: +(l / (u8.length / 4)).toFixed(1), belichtung: +st.renderer.toneMappingExposure.toFixed(4), png: cv.toDataURL("image/png") };
