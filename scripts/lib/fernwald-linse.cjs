// fernwald-linse.cjs — DIE FERNWALD-LINSE der Werkbank (Welle 5, Gebot 10): was der ferne Wald im BILD ist.
// Befund 05.10. (Blick-Tour 10-panorama-45m): jenseits der Mesh-Zone standen glatte, gestreifte, einfarbig hellgrüne
// Ellipsoide — der Kegel-und-Lappen-Satz der gesetzten Bäume im Welt-March. Kein Zähler sah es: Befehle und Dreiecke
// blieben gleich, nur das Bild log. Die Form-Wahrheit (jedes Karten-Ding jenseits der Mesh-Zone ist seine Karte, kein
// Satz, kein Pop am Radius) hält `gate:fernwald`; diese Linse misst, was davon im Bild ankommt.
//
// Je Blick zwei Aufnahmen aus dem Ausgabe-Pfad (Bühne fest, Spiel-Loop ruht): mit und ohne den GESETZTEN Fernwald —
// jedes Karten-Ding (`_archKartenPreset`: Baum, Strauch) jenseits der Mesh-Zone, seine Karten-Slots UND
// jeder Feld-Satz an ihm (so misst dieselbe Linse die alte Welt mit Sätzen und die neue mit Karten). Die Pixel, die sich
// ändern, SIND die Kronen-Fläche des Fernwalds; auf ihr im Band 30–70 % der Bildhöhe je 8×8-Block:
//   glatt     Anteil der Blöcke mit Luminanz-σ < 4 — die einfarbige Fläche (Lappen, Band)
//   hf        Median des |Laplace| der Luminanz — Laub-Textur hoch, glatte Lappen und breite Streifen niedrig
//   vielfalt  σ der Block-Mittel — Höhen-, Art- und Licht-Varianz über den Wald
//   farbe     mittlere sRGB-Farbe der Fläche — die Art-Farbe des Studio-Laubs gegen das blasse Lappen-Grün
// Dazu je Blick die REFERENZ `streu`: dieselben Maße für den gestreuten Wald (jede Karte der Atlas-Gruppe, die keinem
// gesetzten Karten-Ding gehört) — dieselbe Karten-Klasse, die nie Lappen trug. Integration 05.10.: `vielfalt` fiel mit
// dem Schnitt (nord 40,0 → 30,1); die Frage, ob der gesetzte Fernwald damit ärmer ist als der Wald daneben, beantwortet
// der Vergleich mit `streu` im selben Bild, nicht die Zahl der Lappen-Welt.
//
//   Seite:     await window.__fernwaldLinse({ blicke: ["nord"], w: 1280, h: 720 })
//   Werkbank:  node scripts/werkbank.cjs fernwald [--blicke nord,ost]   (nach `umstellen -900 -850`)
"use strict";

// Die fünf Blicke der Mess-Wiese: Name · Auge (x, Höhe über Boden, z) · Ziel (x, Höhe über Boden, z).
const BLICKE = [
    ["nord", -900, 45, -850, -900, 0, -1050],
    ["ost", -900, 45, -850, -700, 0, -850],
    ["west", -900, 45, -850, -1100, 0, -850],
    ["boden-nord", -900, 1.7, -850, -900, 4, -1050],
    ["boden-west", -900, 1.7, -850, -1100, 6, -850],
];

function fernwaldLinse(opts) {
    return (async () => {
        const r = window.anazhRealm;
        const T = window.THREE;
        const st = r.state;
        st.renderer.setAnimationLoop(null);
        const W = opts.w || 1280,
            H = opts.h || 720;
        const blicke =
            opts.blicke && opts.blicke.length ? opts.alle.filter((b) => opts.blicke.includes(b[0])) : opts.alle;
        const pm = st.playerMesh.position;
        const R = st.architectureCullingRadius;
        // Das Karten-Ding: die EINE Frage des Wirts (B2c fernform "karte": Baum, Strauch).
        const kartenDing = (e) => !!r._archKartenPreset(e);
        const wm = st.weltMarch;
        const L = wm ? wm.listeDaten : null;
        const saetze = [],
            slots = [];
        let fern = 0;
        for (const e of st.architectures) {
            if (!e || !e.position || !kartenDing(e)) continue;
            if (Math.hypot(e.position.x - pm.x, e.position.z - pm.z) <= R) continue;
            fern++;
            if (e._ziegelSlot && L) saetze.push(e._ziegelSlot);
            if (e.instanced && e.instSlots) for (const s of e.instSlots) slots.push(s);
        }
        const gesetzt = new Set();
        for (const e of st.architectures)
            if (e && e.instanced && e.instSlots) for (const s of e.instSlots) gesetzt.add(s.key + "#" + s.slot);
        const atlas = st.archInstanceGroups.get(r.constructor.IMPOSTOR_ATLAS_GRUPPE);
        const streuSlots = [];
        if (atlas && atlas.mesh)
            for (let i = 0; i < atlas.mesh.count; i++)
                if (!gesetzt.has(r.constructor.IMPOSTOR_ATLAS_GRUPPE + "#" + i))
                    streuSlots.push({ key: r.constructor.IMPOSTOR_ATLAS_GRUPPE, slot: i });
        const null3 = new T.Matrix4().makeScale(0, 0, 0);
        const verstecke = (aus, liste) => {
            const nurSlots = liste !== undefined;
            for (const s of liste || slots) {
                const g = st.archInstanceGroups.get(s.key);
                if (!g || !g.mesh) continue;
                if (aus) {
                    s.__fw = new T.Matrix4();
                    g.mesh.getMatrixAt(s.slot, s.__fw);
                    g.mesh.setMatrixAt(s.slot, null3); // ein Null-3×3-Slot zeichnet nichts (der Karten-Shader verwirft ihn)
                } else {
                    g.mesh.setMatrixAt(s.slot, s.__fw);
                    delete s.__fw;
                }
                g.mesh.instanceMatrix.needsUpdate = true;
                // der EINE Chokepoint jeder Mutation der Draw-Wahrheit: das Bündel der Atlas-Gruppe (die Karten in der Wahl)
                // nimmt neu auf
                r._archMeshBundleTouch(g.mesh);
            }
            for (const h of nurSlots ? [] : saetze) {
                const o = h.feld * 32;
                if (aus) {
                    h.__fw = L[o + 3];
                    L[o + 3] = 0;
                } else {
                    L[o + 3] = h.__fw;
                    delete h.__fw;
                }
            }
            if (wm && saetze.length && !nurSlots) wm.liste.needsUpdate = true;
        };
        const boden = (x, z) => r._voxelSurfaceY(x, z);
        const schuss = async (b) => {
            window.__buehne();
            const cam = st.camera;
            cam.position.set(b[1], boden(b[1], b[3]) + b[2], b[3]);
            cam.lookAt(b[4], boden(b[4], b[6]) + b[5], b[6] + 1e-4);
            cam.updateMatrixWorld(true);
            if (st.playerMesh) st.playerMesh.visible = false;
            let auf = null;
            for (let i = 0; i < 3; i++) {
                if (st.fernRing) r._tickFeldPass(st.fernRing);
                r._schattenAlleNeu();
                auf = await window.__ausgabeAufnahme(W, H, 1);
            }
            return new Uint8Array(auf.u8);
        };
        const lum = (u, i) => 0.2126 * u[i] + 0.7152 * u[i + 1] + 0.0722 * u[i + 2];
        const aus = {};
        const masse = (a, o) => {
            const y0 = Math.floor(H * 0.3),
                y1 = Math.floor(H * 0.7);
            const sig = [],
                mitt = [],
                hf = [];
            let n = 0,
                sr = 0,
                sg = 0,
                sb = 0;
            for (let by = y0; by + 8 <= y1; by += 8)
                for (let bx = 8; bx + 16 <= W; bx += 8) {
                    let k = 0,
                        s = 0,
                        s2 = 0,
                        sl = 0;
                    for (let y = by; y < by + 8; y++)
                        for (let x = bx; x < bx + 8; x++) {
                            const i = (y * W + x) * 4;
                            const d =
                                Math.abs(a[i] - o[i]) + Math.abs(a[i + 1] - o[i + 1]) + Math.abs(a[i + 2] - o[i + 2]);
                            if (d < 12) continue; // die Kronen-Fläche: nur, was der Fernwald ändert
                            const l = lum(a, i);
                            sl += Math.abs(
                                4 * l - lum(a, i - 4) - lum(a, i + 4) - lum(a, i - W * 4) - lum(a, i + W * 4)
                            );
                            k++;
                            s += l;
                            s2 += l * l;
                            sr += a[i];
                            sg += a[i + 1];
                            sb += a[i + 2];
                        }
                    n += k;
                    if (k < 48) continue; // ein Block zählt erst, wenn er zu ¾ Krone ist
                    const m = s / k;
                    sig.push(Math.sqrt(Math.max(0, s2 / k - m * m)));
                    mitt.push(m);
                    hf.push(sl / k);
                }
            sig.sort((p, q) => p - q);
            hf.sort((p, q) => p - q);
            const mm = mitt.reduce((p, q) => p + q, 0) / Math.max(1, mitt.length);
            const vielfalt = Math.sqrt(mitt.reduce((p, q) => p + (q - mm) * (q - mm), 0) / Math.max(1, mitt.length));
            return {
                kronenPx: n,
                bloecke: sig.length,
                glatt: sig.length ? +(sig.filter((v) => v < 4).length / sig.length).toFixed(3) : null,
                hf: hf.length ? +hf[Math.floor(hf.length / 2)].toFixed(2) : null,
                vielfalt: +vielfalt.toFixed(2),
                farbe: n ? [sr / n, sg / n, sb / n].map((v) => Math.round(v)) : null,
            };
        };
        for (const b of blicke) {
            const a = await schuss(b);
            verstecke(true);
            let o;
            try {
                o = await schuss(b);
            } finally {
                verstecke(false);
            }
            verstecke(true, streuSlots);
            let oS;
            try {
                oS = await schuss(b);
            } finally {
                verstecke(false, streuSlots);
            }
            aus[b[0]] = Object.assign(masse(a, o), { streu: masse(a, oS) });
        }
        return {
            radius: Math.round(R),
            fernDinge: fern,
            saetze: saetze.length,
            kartenSlots: slots.length,
            streuKarten: streuSlots.length,
            blicke: aus,
        };
    })();
}

module.exports = {
    BLICKE,
    FERNWALD_INSTALL:
        `window.__fernwaldLinse = (o) => (${fernwaldLinse.toString()})` +
        `(Object.assign({ alle: ${JSON.stringify(BLICKE)} }, o || {}));`,
};
