// Rumpf für werkbank eval: Uhr (env UHR via window.__sternUhr), Genesis Ego 40° nach Norden; je Stern im Bild die Kette
const uhr = window.__sternUhr != null ? window.__sternUhr : 0;
const W = window.__sternW || 1920, H = window.__sternH || 1080;
const cam = r.state.camera;
const p0 = window.__sternP0 || (window.__sternP0 = cam.position.clone());
cam.position.copy(p0);
const el = (40 * Math.PI) / 180;
const dir = window.__sternDir || [0, 100 * Math.tan(el), -100];
cam.lookAt(p0.x + dir[0], p0.y + dir[1], p0.z + dir[2]);
cam.updateMatrixWorld(true);
__buehne({ uhr });
if (r.state.playerMesh) r.state.playerMesh.visible = false;
if (window.__weltStehtWarten) await __weltStehtWarten();
const t0 = performance.now();
const auf = await __ausgabeAufnahme(W, H, 1, { satz: "messung" });
const msAuf = performance.now() - t0;
const u8 = auf.u8;
const L = (x, y) => { const i = (y * W + x) * 4; return 0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2]; };
const sf = r.state.starField, U = r.state.starFieldUniforms;
const out = { uhr, W, H, msAuf: +msAuf.toFixed(0), sicht: !!(sf && sf.visible), zeigt: r._sterneZeigen, k: r.state.renderer.toneMappingExposure, pixel: U && U.pixel.value, opacity: U && U.opacity.value, grenze: U && U.grenze ? U.grenze.value : null, auge: U && U.auge ? U.auge.value : null, sterne: [] };
const achse = r._tagAchse ? (() => { try { return r._tagAchse(); } catch (e) { return null; } })() : null;
out.achseGrenze = achse && achse.grenze;
if (sf) {
    sf.updateMatrixWorld(true);
    const m = new T.Matrix4(), v = new T.Vector3(), c = new T.Color();
    const mags = sf.userData.mags, EL = __weltLicht.EINHEIT_LX;
    const SB = r.constructor.HIMMEL ? r.constructor.HIMMEL.sternBild : AnazhRealm.HIMMEL.sternBild;
    const R = sf.userData.radius, pix = U.pixel.value, gp = (pix / R) * (180 / Math.PI);
    const s2 = (SB.a * SB.a) / 2 / (gp * gp) + 1 / 12;
    const kernPeak = SB.kern / (2 * Math.PI * s2);
    const raum = (pix * pix) / (R * R);
    for (let i = 0; i < mags.length; i++) {
        sf.getMatrixAt(i, m); v.setFromMatrixPosition(m).applyMatrix4(sf.matrixWorld);
        const d = v.clone().sub(cam.position).normalize();
        if (d.y < 0.05) continue;
        v.project(cam);
        if (Math.abs(v.x) > 0.95 || Math.abs(v.y) > 0.95 || v.z > 1) continue;
        const x = Math.round(((v.x + 1) / 2) * W), y = Math.round(((1 - v.y) / 2) * H);
        let pk = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) pk = Math.max(pk, L(x + dx, y + dy));
        let sr = 0, n = 0; for (let a = 0; a < 24; a++) { const t = (a * Math.PI) / 12; sr += L(x + Math.round(7 * Math.cos(t)), y + Math.round(7 * Math.sin(t))); n++; }
        sf.getColorAt(i, c);
        const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
        const Lpix = (lum * kernPeak) / raum; // Einheiten am Kern-Pixel (ohne Saum)
        out.sterne.push({ i, m: +mags[i].toFixed(2), x, y, lumE: lum, Lcd: +(Lpix * EL).toExponential(2), Lk: +(U.auge ? lum * U.auge.value * kernPeak : Lpix * out.k).toExponential(2), schirm: +pk.toFixed(1), himmel: +(sr / n).toFixed(1) });
    }
}
// je Klasse 0 · 2 · 4 · 6 (±0,5) der Mittelwert
const kl = {};
for (const g of [-1, 0, 1, 2, 3, 4, 5, 6]) {
    const s = out.sterne.filter((z) => Math.abs(z.m - g) <= 0.5);
    if (!s.length) continue;
    const med = (f) => { const a = s.map(f).sort((p, q) => p - q); return a[a.length >> 1]; };
    kl[g] = { n: s.length, Lcd: med((z) => z.Lcd), Lk: med((z) => z.Lk), schirm: med((z) => z.schirm), himmel: med((z) => z.himmel), ueber8: s.filter((z) => z.schirm - z.himmel >= 8).length };
}
out.klassen = kl;
out.nImBild = out.sterne.length;
out.ueber8 = out.sterne.filter((z) => z.schirm - z.himmel >= 8).length;
delete out.sterne;
return JSON.stringify(out);
