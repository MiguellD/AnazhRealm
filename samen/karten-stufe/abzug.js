const ART = "__ART__", GESTALT = __GESTALT__;
const t0 = performance.now();
const rend = r.state.renderer;
const orig = r._karteAbzugLesen;
let extra = null;
r._karteAbzugLesen = function (z, rt, schicht, fr, at) {
  const B = this._karteBuehneSatz;
  extra = { p: rend.readRenderTargetPixelsAsync(rt, 0, 0, rt.width, rt.height, 2, schicht), saum: Array.from(this._karteSaumVon(at, z, fr, B.laub)), laub: { min: B.laub.min.toArray(), max: B.laub.max.toArray() } };
  return orig.call(this, z, rt, schicht, fr, at);
};
let fertig = null;
try {
  const z0 = [...r._impostorAtlas().zellen.values()].find((q) => q && q.preset === ART && q.variant === GESTALT);
  if (z0) z0._weltNeu = true;
  r._karteAbzug(ART, GESTALT).then((a) => (fertig = a), (e) => (fertig = { fehler: String((e && e.message) || e) }));
  let n = 0;
  while (!fertig && performance.now() - t0 < 600000) {
    n++;
    r._tickImpostorBake();
    await new Promise((s) => setTimeout(s, 150));
  }
} finally {
  r._karteAbzugLesen = orig;
}
if (!fertig || fertig.fehler) return { fehler: fertig ? fertig.fehler : "Zeit" };
const sic = await extra.p;
const at = r._impostorAtlas();
const b64 = (t) => { const u = new Uint8Array(t.buffer, t.byteOffset, t.byteLength); let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const rg = fertig.ringe[1], W = fertig.w;
const zeilen = (t) => t.subarray(rg.y * W * 4, (rg.y + rg.h) * W * 4);
return { ms: Math.round(performance.now() - t0), W, H: fertig.h, ring0: rg, ringe: fertig.ringe, oben: fertig.oben, frame: fertig.frame, saum: extra.saum, laub: extra.laub, alb: b64(zeilen(fertig.albedo)), nrm: b64(zeilen(fertig.normale)), sic: b64(zeilen(new Uint8Array(sic.buffer, sic.byteOffset, sic.byteLength))), fmt: at.fmt, cw: at.cw, ch: at.ch, V: at.V, schwelle: globalThis.__phytoCore.KARTEN_GESETZ.schwelle, sichtSpanne: AnazhRealm.KARTE_SONNEN_SICHT.spanne };
