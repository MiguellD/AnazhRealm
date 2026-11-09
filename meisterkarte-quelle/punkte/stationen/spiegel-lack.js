// w26-lack-glas-pm material.K4 Staffel 1 — DIE SPIEGEL-TREUE AN LACK UND SCHEIBE AUS EGO (Seiten-Code für `werkbank eval`,
// r = Welt, T = THREE; Nachfolger von koordination bericht/2910-w3w-glanz/spiegel-lack.js). Ein GT (`fahrzeug_gt`) steht rechts
// vor dem Spieler, die Länge längs seines Blicks — der Ego-Blick (`_loopCamera`, Neigung −0,15) sieht sein Deck unter ~70°, dessen
// Spiegel die Welt über dem Horizont zeigt, die das Bild selbst trägt. Schüsse aus dem Ausgabe-Pfad (1920×1080):
// G die Welt, O_lack ohne den Lack, O_glas ohne die Scheiben; Lack und Scheibe werfen in keinem Schuss Schatten. Die Maske je
// Klasse: das Pixel, das ohne sie um mehr als 18 (je Kanal) anders ist; die Welt-Punkte aus der Tiefe des Schusses G
// (`__spiegelDaten`); das Maß das der Wasser-Station (`__klassenMasse(...).spiegelTreue` an der Ebene, `normale`).
// VIER SCHÄRFUNGEN (w26-lack-glas, gemessen an main 87537d3f und am Zweig, swiftshader; GTX 87537d3f lack −0,6581, glas 0 Blöcke):
// (1) DER LACK IST DER KLARLACK: Lack = Klarlack ≥ 0,5, nie durchsichtig. Bis hier verlangte die Probe zusätzlich Metall ≥ 0,5 —
//     seit dem Re-Mint der Lacke (vehicle-core LACK_ART, material.K1 23.10.: ein uni-Lack ist ein Dielektrikum) trägt das nur
//     Silber, Azurblau und Kupfer: fünf von acht Gestalten fielen als „zu wenig Pixel" (GTX 24a0f3ef, 6b3da705, 1e90e7cd, …).
// (2) DIE GESTALT STEHT: der GT trägt die Gestalt GESTALT = 3 (Tiefschwarz, vehicle-core `lackIndex` 4) über den Stempel des
//     Studios (`studioOv.__gestalt`, der Übergabe-Kanal) — bis hier wählten Same und Ort (`_ortGestaltSame`) je Lauf einen der acht
//     Lacke: dieselbe Welt maß an 77265b04 GTX 0,6432, Radeon −0,0919, und Perlweiß (Albedo ~0,8) zeigt nur den Hauch seines
//     Klarlacks über der Streuung. Der erste Bau einer gestempelten Gestalt steht, bevor seine Gruppen ihre Stoffe tragen (main,
//     frische Welt: 0 Lack-Stoffe) — die Probe taktet, bis eine Gruppe des Eintrags Klarlack zeigt.
// (3) DER SPIEGEL LIEGT IM BILD: der Wagen steht VOR = 6 m voraus (bis hier 3,8 m) — sein Deck (Haube, Heck) spiegelt unter ~70°
//     Einfall die Baum- und Tor-Linie knapp über dem Horizont, die das Bild selbst trägt. Bei 3,8 m lag der ideale Spiegel der
//     Haube (Einfall ~52°) zum größten Teil über dem Bild (die Zeilen-r lasen Randblöcke: dieselbe Welt zweimal 0,1175 und 0,5086),
//     und die Tür spiegelt aus Augenhöhe (1,64 m über einer Tür bei 0,4–0,9 m) nur das Pflaster neben dem Wagen — nach dem
//     8×8-Mittel ein gleichförmiges Grau (dieselbe Tür −0,69 … +0,20 je Lauf).
// (4) DIE EBENE TRÄGT IHREN SPIEGEL: bis zu vier Ebenen der Maske (RANSAC, fester Zufall, nie quer: |n · Blick| ≤ 0,7; dann
//     Haupt-Achsen ≤ 5 cm, ≤ 3 cm) — es gilt die mit den meisten Blöcken, deren Spiegel-Partner im Bild liegen. Bis hier gewann die
//     größte Ebene der Kovarianz, ob ihr Spiegel im Bild lag oder nicht (die Windschutzscheibe: 0 Blöcke, ihr Spiegel liegt hinter
//     der Kamera). An dieser Pose (kienspan, je dreimal): main −0,010 · −0,062 · −0,054, w26-lack-glas 0,774 · 0,775 · 0,751.
// Die Pose prüft sich: steht der Wagen quer (die Normale längs des Blicks), dreht die Probe ihn einmal um 90°.
const st = r.state, rend = st.renderer, cam = st.camera, sc = st.scene;
const W = 1920, H = 1080;
const raf = () => new Promise((f) => requestAnimationFrame(f));
rend.setAnimationLoop(null);
window.__buehne({});
if (st.world) st.world.timeOfDay = 0.5;
r.setTimeOfDay(0.5, "human");
if (st.cameraMode !== "first") r.setCameraMode("first");
const ego = () => {
    st.pitch = -0.15;
    for (let i = 0; i < 30; i++) r._loopCamera(performance.now() + i * 100);
    cam.updateMatrixWorld(true);
    const d = new T.Vector3();
    cam.getWorldDirection(d);
    return { auge: cam.position.clone(), d };
};
let { auge, d } = ego();
const fwd = d.clone().setY(0).normalize(), rechts = new T.Vector3(-fwd.z, 0, fwd.x);
const VOR = 6, SEIT = 2.25;
const mitte = auge.clone().addScaledVector(fwd, VOR).addScaledVector(rechts, SEIT);
const versuche = [];
const GESTALT = 3;
let e = null, ergebnis = null;
const glanzStoffe = (pruef) => {
    const o = [];
    sc.traverse((m) => { if (m.isMesh && m.visible && m.material && pruef(m.material)) o.push(m); });
    return o;
};
const istLack = (m) => m.clearcoat >= 0.5 && m.transparent !== true;
const istGlas = (m) => m.transparent === true && m.clearcoat >= 0.5;
const kovNormale = (pts) => {
    const c = [0, 1, 2].map((k) => pts.reduce((s, p) => s + p[k], 0) / pts.length);
    const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (const p of pts) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) A[i][j] += (p[i] - c[i]) * (p[j] - c[j]);
    // Jacobi-Drehungen: die Eigenvektoren der symmetrischen 3×3
    const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    for (let s = 0; s < 40; s++)
        for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
            if (Math.abs(A[p][q]) < 1e-12) continue;
            const th = 0.5 * Math.atan2(2 * A[p][q], A[q][q] - A[p][p]), cs = Math.cos(th), sn = Math.sin(th);
            for (let k = 0; k < 3; k++) {
                const a = A[k][p], b = A[k][q];
                (A[k][p] = cs * a - sn * b), (A[k][q] = sn * a + cs * b);
            }
            for (let k = 0; k < 3; k++) {
                const a = A[p][k], b = A[q][k];
                (A[p][k] = cs * a - sn * b), (A[q][k] = sn * a + cs * b);
            }
            for (let k = 0; k < 3; k++) {
                const a = V[k][p], b = V[k][q];
                (V[k][p] = cs * a - sn * b), (V[k][q] = sn * a + cs * b);
            }
        }
    const i = [0, 1, 2].reduce((m, k) => (A[k][k] < A[m][m] ? k : m), 0);
    return { c, n: [V[0][i], V[1][i], V[2][i]] };
};
try {
    for (const dreh of [0, Math.PI / 2]) {
        const rot = Math.atan2(-fwd.z, fwd.x) + dreh;
        rend.setAnimationLoop((t) => r._gameLoopTick(t));
        try {
            e = r.spawnArchitecture("fahrzeug_gt", { x: mitte.x, y: r.getTerrainHeightAt(mitte.x, mitte.z) + 0.5, z: mitte.z }, { silent: true, precise: true, rotationY: rot, studioOv: { __gestalt: GESTALT } });
            if (!e) return { ende: "der Wagen setzt nicht", versuche };
            await window.__gebautNach(e, { bau: () => {}, takt: raf });
            // DER WAGEN TRÄGT SEINEN LACK: der erste Bau einer gestempelten Gestalt steht, bevor seine Gruppen ihre Stoffe tragen (main
            // 87537d3f, frische Welt: 0 Lack-Stoffe) — die Probe taktet, bis eine Gruppe des Eintrags Klarlack zeigt (≤ 600 Bilder)
            const lackDa = () => { for (const [, g] of st.archInstanceGroups || []) if (g.slotEntry && g.slotEntry.indexOf(e) >= 0 && g.mesh && g.mesh.visible && g.mesh.material && g.mesh.material.clearcoat >= 0.5) return true; return false; };
            for (let i = 0; i < 600 && !lackDa(); i++) await raf();
            for (let i = 0; i < 30; i++) await raf();
        } finally {
            rend.setAnimationLoop(null);
        }
        ({ auge, d } = ego());
        const lack = glanzStoffe(istLack), glas = glanzStoffe(istGlas);
        const alle = [...lack, ...glas], wurf = alle.map((m) => m.castShadow);
        alle.forEach((m) => (m.castShadow = false));
        window.__bundlesNeu();
        const schuss = async (aus) => {
            aus.forEach((m) => (m.visible = false));
            window.__bundlesNeu();
            try {
                r._schattenAlleNeu();
                return (await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8;
            } finally {
                aus.forEach((m) => (m.visible = true));
                window.__bundlesNeu();
            }
        };
        let G, sp, Ol, Og;
        try {
            G = await schuss([]);
            sp = await window.__spiegelDaten();
            Ol = await schuss(lack);
            Og = await schuss(glas);
        } finally {
            alle.forEach((m, i) => (m.castShadow = wurf[i]));
            window.__bundlesNeu();
        }
        const { tiefe, tw, th, ivp: I } = sp;
        const welt = (p) => {
            const x = p % W, y = (p - x) / W;
            const v = [((x + 0.5) / W) * 2 - 1, 1 - ((y + 0.5) / H) * 2, tiefe[((((y + 0.5) * th) / H) | 0) * tw + ((((x + 0.5) * tw) / W) | 0)]];
            const w = I[3] * v[0] + I[7] * v[1] + I[11] * v[2] + I[15];
            return [0, 1, 2].map((k) => (I[k] * v[0] + I[k + 4] * v[1] + I[k + 8] * v[2] + I[k + 12]) / w);
        };
        const klasse = (O, name, n0) => {
            const roh = [];
            for (let p = 0; p < W * H; p++) {
                const i = p * 4;
                if (Math.max(Math.abs(G[i] - O[i]), Math.abs(G[i + 1] - O[i + 1]), Math.abs(G[i + 2] - O[i + 2])) > 18) roh.push(p);
            }
            if (roh.length < 2000) return { name, pixel: roh.length, fehler: "zu wenig Pixel" };
            const P = roh.map(welt);
            // DIE EBENEN DER KLASSE (RANSAC, fester Zufall): bis zu vier Ebenen nacheinander — je die mit den meisten Punkten ≤ 3 cm unter
            // denen, die nicht quer stehen (|n · Blick| ≤ 0,7), dann Haupt-Achsen über ihre Punkte (≤ 5 cm, ≤ 3 cm); gemessen wird je
            // Ebene, es gilt die mit den meisten Blöcken, deren Spiegel das Bild trägt (je Versuch höchstens 4 000 Punkte gezählt)
            let zufall = 0x9e3779b9;
            const rnd = () => ((zufall = (Math.imul(zufall ^ (zufall >>> 15), 0x2c1b3c6d) + 0x6d2b79f5) >>> 0) / 4294967296);
            const abst = (k, c, n) => Math.abs((P[k][0] - c[0]) * n[0] + (P[k][1] - c[1]) * n[1] + (P[k][2] - c[2]) * n[2]);
            let rest = P.map((_p, k) => k);
            const ebenen = [];
            for (let e4 = 0; e4 < 4 && rest.length >= 2000; e4++) {
                const schritt = Math.max(1, Math.floor(rest.length / 4000));
                let best = null, bestN = 0;
                for (let it = 0; it < 600; it++) {
                    const [a, b, q] = [0, 1, 2].map(() => P[rest[Math.floor(rnd() * rest.length)]]);
                    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [q[0] - a[0], q[1] - a[1], q[2] - a[2]];
                    const x = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], l = Math.hypot(...x);
                    if (!(l > 1e-6)) continue;
                    const nn = x.map((k) => k / l);
                    if (Math.abs(nn[0] * fwd.x + nn[2] * fwd.z) > 0.7) continue;
                    let z = 0;
                    for (let i = 0; i < rest.length; i += schritt) if (abst(rest[i], a, nn) <= 0.03) z++;
                    if (z > bestN) (bestN = z), (best = { c: a, n: nn });
                }
                if (!best) break;
                let { c, n } = best;
                let innen = rest.filter((k) => abst(k, c, n) <= 0.05);
                ({ c, n } = kovNormale(innen.map((k) => P[k])));
                innen = rest.filter((k) => abst(k, c, n) <= 0.03);
                if (innen.length < 2000) break;
                ebenen.push({ c, n, innen });
                const drin = new Set(innen);
                rest = rest.filter((k) => !drin.has(k));
            }
            if (!ebenen.length) return { name, pixel: roh.length, fehler: "keine Ebene" };
            const messe = (eb) => {
                let n = eb.n;
                const za = [auge.x - eb.c[0], auge.y - eb.c[1], auge.z - eb.c[2]];
                if (n[0] * za[0] + n[1] * za[1] + n[2] * za[2] < 0) n = n.map((x) => -x);
                const m = new Uint8Array(W * H);
                for (const k of eb.innen) m[roh[k]] = 1;
                const ms = window.__klassenMasse(G, m, W, H, null, null, Object.assign({}, sp, { normale: n }));
                return { n, m, ms, za };
            };
            const gemessen = ebenen.map(messe);
            const wahl = gemessen.reduce((a, b) => ((b.ms.sp ? b.ms.sp[0] : 0) > (a.ms.sp ? a.ms.sp[0] : 0) ? b : a));
            const c = ebenen[gemessen.indexOf(wahl)].c, innen = ebenen[gemessen.indexOf(wahl)].innen;
            let n = wahl.n;
            const zumAuge = wahl.za, ms = wahl.ms;
            const blick = Math.abs(n[0] * fwd.x + n[2] * fwd.z);
            const zl = Math.hypot(...zumAuge);
            return {
                name, pixel: roh.length, ebene: innen.length, normale: n.map((x) => +x.toFixed(3)),
                einfallGrad: +((Math.acos(Math.min(1, Math.abs((n[0] * zumAuge[0] + n[1] * zumAuge[1] + n[2] * zumAuge[2]) / zl))) * 180) / Math.PI).toFixed(1),
                quer: blick > 0.7, spiegelTreue: ms.spiegelTreue, bloecke: ms.sp ? ms.sp[0] : null, luma: ms.luma,
                ebenen: gemessen.map((g, i) => ({ n: g.n.map((x) => +x.toFixed(3)), px: ebenen[i].innen.length, r: g.ms.spiegelTreue, bloecke: g.ms.sp ? g.ms.sp[0] : null })),
            };
        };
        const vlack = klasse(Ol, "lack");
        const vglas = klasse(Og, "glas");
        versuche.push({ dreh: +dreh.toFixed(3), lack: vlack, glas: vglas, stoffe: { lack: lack.length, glas: glas.length } });
        r.removeArchitecture(e);
        e = null;
        ergebnis = { lack: vlack, glas: vglas };
        if (!(vlack.quer && vglas.quer)) break;
    }
} finally {
    if (e) r.removeArchitecture(e);
}
return {
    ende: "ok", gestalt: GESTALT, vor: VOR,
    stand: { version: r.constructor.VERSION, uhr: st.timeOfDay, wetter: st.weather, saison: st.season, sicht: st.cameraMode },
    auge: auge.toArray().map((x) => +x.toFixed(2)), blick: d.toArray().map((x) => +x.toFixed(3)), wagen: mitte.toArray().map((x) => +x.toFixed(2)),
    ergebnis, versuche,
};
