// Rumpf für werkbank eval: die Zählung der Station (mit − ohne Sternfeld, obere Hälfte, Peak ≥ 8 über flachem Ring) an Uhr __sternUhr
// in der aktuellen Pose (oder Pose 40° Nord), je Auflösung in __sternRes
const uhr = window.__sternUhr != null ? window.__sternUhr : 0;
const cam = r.state.camera;
const p0 = window.__sternP0 || (window.__sternP0 = cam.position.clone());
if (window.__sternPose !== false) {
    cam.position.copy(p0);
    const dir = window.__sternDir || [0, 100 * Math.tan((40 * Math.PI) / 180), -100];
    cam.lookAt(p0.x + dir[0], p0.y + dir[1], p0.z + dir[2]);
    cam.updateMatrixWorld(true);
}
__buehne({ uhr });
if (r.state.playerMesh) r.state.playerMesh.visible = false;
const auf = window.__aufnahmeRuhig || window.__ausgabeAufnahme;
const out = { uhr, sonne: +((Math.asin(r._sonnenRichtung().y) * 180) / Math.PI).toFixed(2), grenze: r.state.starFieldUniforms.grenze.value, res: {} };
for (const [W, H] of window.__sternRes || [[640, 360], [1920, 1080]]) {
    const b = (await auf(W, H, 1, { satz: "messung" })).u8;
    const sf = r.state.starField, par = sf.parent;
    par.remove(sf);
    let o;
    try { o = (await auf(W, H, 1, { satz: "messung" })).u8; } finally { par.add(sf); }
    const lu = (u, i) => 0.2126 * u[i] + 0.7152 * u[i + 1] + 0.0722 * u[i + 2];
    const zaehle = (L) => { let n = 0;
        for (let y = 3; y < (H >> 1) - 3; y++) for (let x = 3; x < W - 3; x++) { const c = L(x, y); let top = true;
            for (let dy = -1; dy <= 1 && top; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const v = L(x + dx, y + dy); if (v > c || (v === c && (dy < 0 || (!dy && dx < 0)))) { top = false; break; } }
            if (!top) continue; let lo = 1e9, hi = -1, sr = 0; for (let k = 0; k < 16; k++) { const a = (k * Math.PI) / 8, v = L(x + Math.round(3 * Math.cos(a)), y + Math.round(3 * Math.sin(a))); sr += v; lo = Math.min(lo, v); hi = Math.max(hi, v); }
            if (c - sr / 16 >= 8 && hi - lo <= 6) n++; } return n; };
    let himmel = 0, nh = 0, maxd = 0;
    for (let y = 0; y < H >> 1; y += 4) for (let x = 0; x < W; x += 4) { himmel += lu(o, (y * W + x) * 4); nh++; }
    for (let i = 0; i < (W * H) / 2 * 4; i += 4) maxd = Math.max(maxd, lu(b, i) - lu(o, i));
    out.res[W + "x" + H] = { sterne: zaehle((x, y) => Math.max(0, lu(b, (y * W + x) * 4) - lu(o, (y * W + x) * 4))), roh: zaehle((x, y) => lu(b, (y * W + x) * 4)), himmel: +(himmel / nh).toFixed(1), maxDiff: +maxd.toFixed(1) };
}
return JSON.stringify(out);
