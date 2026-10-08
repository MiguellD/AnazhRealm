// werkbank eval: DER STRAHL-ZÄHLER (0710-7 (3)) — je Strahl des Struktur-Raycasts (`_fieldRaycast`): wer ruft, wie viele Bauten
// der 80-m-Cull durchlässt, wie viele Boxen `_segmentAABB` prüft, wie viele davon die Hülle des Segments überhaupt berühren
// (der Kandidat einer Nachbarschaft), wie viele treffen. Frames = Rufe von `_loopCamera`. Befehl: an | aus | lesen.
const cmd = window.__segCmd || "lesen";
const P = Object.getPrototypeOf(r);
if (!window.__segZ) {
    const Z = (window.__segZ = { an: false });
    const leer = () => {
        Object.assign(Z, {
            frames: 0,
            strahlen: 0,
            rufe: {},
            archGesamt: 0,
            archNah: 0,
            seg: 0,
            obb: 0,
            kandidat: 0,
            treffer: 0,
            laenge: 0,
            typNah: {},
            maxSeg: 0,
        });
    };
    Z.leer = leer;
    leer();
    const fr = P._fieldRaycast;
    r._fieldRaycast = function (sx, sy, sz, ex, ey, ez) {
        if (!Z.an) return fr.call(this, sx, sy, sz, ex, ey, ez);
        Z.strahlen++;
        const st = String(new Error().stack).split("\n");
        let wer = "?";
        for (let i = 2; i < st.length; i++) {
            const m = /at (?:async )?(?:AnazhRealm\.)?([\w$]+)/.exec(st[i]);
            if (m && m[1] !== "_runRaycast" && m[1] !== "_fieldRaycast" && m[1] !== "Object") {
                wer = m[1];
                break;
            }
        }
        Z.rufe[wer] = (Z.rufe[wer] || 0) + 1;
        const mnx = Math.min(sx, ex),
            mxx = Math.max(sx, ex),
            mny = Math.min(sy, ey),
            mxy = Math.max(sy, ey),
            mnz = Math.min(sz, ez),
            mxz = Math.max(sz, ez);
        Z.laenge += Math.hypot(ex - sx, ey - sy, ez - sz);
        const arches = this.state.architectures || [];
        for (const e of arches) {
            if (!e || !e.blockerAABBs || !e.position) continue;
            Z.archGesamt++;
            const rc = 80 + (e._blockerReach || 0);
            if (Math.abs(e.position.x - sx) > rc || Math.abs(e.position.z - sz) > rc) continue;
            Z.archNah++;
            const t = String(e.type).replace(/_\d+$/, "");
            Z.typNah[t] = (Z.typNah[t] || 0) + e.blockerAABBs.length;
            for (const b of e.blockerAABBs)
                if (b.maxX >= mnx && b.minX <= mxx && b.maxZ >= mnz && b.minZ <= mxz && b.topY >= mny && b.botY <= mxy)
                    Z.kandidat++;
        }
        const s0 = Z.seg;
        const o = fr.call(this, sx, sy, sz, ex, ey, ez);
        if (Z.seg - s0 > Z.maxSeg) Z.maxSeg = Z.seg - s0;
        return o;
    };
    const sg = P._segmentAABB;
    r._segmentAABB = function (sx, sy, sz, dx, dy, dz, b) {
        if (Z.an && b !== this._obbSegBox) {
            Z.seg++;
            if (b.obb) Z.obb++;
        }
        const h = sg.call(this, sx, sy, sz, dx, dy, dz, b);
        if (Z.an && h && b !== this._obbSegBox) Z.treffer++;
        return h;
    };
    const lc = P._loopCamera;
    r._loopCamera = function (t) {
        if (Z.an) Z.frames++;
        return lc.call(this, t);
    };
}
const Z = window.__segZ;
if (cmd === "an") {
    Z.leer();
    Z.an = true;
    return "an";
}
if (cmd === "aus") Z.an = false;
const f = Math.max(1, Z.frames);
const s = Math.max(1, Z.strahlen);
const st = r.state;
let boxen = 0,
    mitBox = 0;
for (const e of st.architectures || [])
    if (e && e.blockerAABBs) {
        mitBox++;
        boxen += e.blockerAABBs.length;
    }
return {
    frames: Z.frames,
    strahlenJeFrame: +(Z.strahlen / f).toFixed(2),
    rufeJeFrame: Object.fromEntries(Object.entries(Z.rufe).map(([k, v]) => [k, +(v / f).toFixed(2)])),
    bautenJeStrahl: +(Z.archGesamt / s).toFixed(1),
    bautenNahJeStrahl: +(Z.archNah / s).toFixed(1),
    boxenJeStrahl: +(Z.seg / s).toFixed(1),
    boxenJeFrame: +(Z.seg / f).toFixed(0),
    obbAnteil: +(Z.obb / Math.max(1, Z.seg)).toFixed(3),
    kandidatJeStrahl: +(Z.kandidat / s).toFixed(2),
    trefferJeStrahl: +(Z.treffer / s).toFixed(3),
    maxBoxenEinStrahl: Z.maxSeg,
    laengeJeStrahl: +(Z.laenge / s).toFixed(2),
    welt: { bauten: (st.architectures || []).length, mitBoxen: mitBox, boxen },
    typNahJeStrahl: Object.fromEntries(
        Object.entries(Z.typNah)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(([k, v]) => [k, +(v / s).toFixed(1)])
    ),
    spieler: [st.playerMesh.position.x, st.playerMesh.position.z].map((x) => +x.toFixed(1)),
};
