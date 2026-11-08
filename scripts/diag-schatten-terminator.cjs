#!/usr/bin/env node
// diag-schatten-terminator.cjs — (T) DER TERMINATOR, die Hang-Akne (1110-5; Familie der Bias-Wand `diag-schatten-bias.cjs`).
// Der Schnitt: der Boden trägt die Zuwendung seiner wahren Normale selbst (`receivedShadowNode`, `zuwendungSaum`).
// Die Linse: die Werkbank im Software-Holz (swiftshader, `holz=voll`: Schatten an) an der Prüfbühne, je Sonne am Terminator
// zwei Schüsse von oben im Ausgabe-Pfad (Schatten-Stärke 1 und 0, dieselbe Pipeline), gemessen NUR auf der Rampe (40 × 40
// Weltpunkte, x ±12, z 136–160, auf den Schirm projiziert): die Fleckigkeit = der Anteil der Proben mehr als 25 % neben dem
// Median der Rampe. ROT beim Namen, wenn der Schatten sie um mehr als TERMINATOR_FLECKEN_MAX hebt, wenn eine Sonne fehlt oder
// die Rampe zu wenige Proben trägt (blind).
// Dazu (H) DER HORIZONT (ferne.K4, unten): die Horizont-Karte trägt einen bekannten Grat, der Fern-Ring prüft an ihrem Boden, die
// Luft hinter dem Grat verliert die Sonne, das leere Gitter wirft nichts.
// SELBSTTEST (--selftest, ohne Browser): das Urteil fällt bei Akne (die Zahl von main), fehlender Sonne und blinder Probe rot,
// der Horizont bei leerer Karte, einem Ring an seiner Masche und einer Luft ohne Schatten.
//   node scripts/diag-schatten-terminator.cjs [--selftest] [--port 4609]
"use strict";

// Die Sonne am Terminator der Rampe: 22° aus Azimut 45° (N·L −0,002; main dort 11,7 % fleckig gegen 0,2 % ohne Schatten, bei
// 20° / N·L −0,034 2,2 % — die zweite Sonne fährt der Werkplatz mit SONNEN=2, die CI die schärfste)
const TERMINATOR_SONNEN = Object.freeze(
    [Object.freeze({ e: 22, az: 45 }), Object.freeze({ e: 20, az: 45 })].slice(0, Number(process.env.SONNEN || 1))
);
const TERMINATOR_FLECKEN_MAX = 0.01;
const PROBEN_MIN = 1000;

function terminatorUrteil(zeilen) {
    const befunde = [];
    const n = (zeilen || []).length;
    if (n < TERMINATOR_SONNEN.length)
        befunde.push(`(T) TERMINATOR: ${n} Sonnen gemessen, verlangt ${TERMINATOR_SONNEN.length}`);
    for (const z of zeilen || []) {
        if (!(z.proben >= PROBEN_MIN)) {
            befunde.push(
                `(T) TERMINATOR Sonne ${z.e}°/${z.az}°: ${z.proben || 0} Proben auf der Rampe — die Linse ist blind`
            );
            continue;
        }
        const d = z.fleckenAn - z.fleckenAus;
        if (d > TERMINATOR_FLECKEN_MAX)
            befunde.push(
                `(T) TERMINATOR-AKNE bei N·L ${z.NdotL} (Sonne ${z.e}° aus Azimut ${z.az}°): ${(z.fleckenAn * 100).toFixed(1)} % ` +
                    `der Rampe fleckig, ohne Schatten ${(z.fleckenAus * 100).toFixed(1)} % — TÄTER: am Terminator entscheidet allein ` +
                    "der Schatten-Test (die 2,5D-Lichtung kennt die Zuwendung der Fläche nicht)"
            );
    }
    return befunde;
}

// Die Probe (Seite, über `werkbank eval`): Sonne aus (e, az) für Richtlicht UND `uSunDir`, Schuss von oben auf die Rampe.
const PROBE = `
const V = __SONNE__;
const st = r.state, rend = st.renderer, T = window.THREE;
rend.setAnimationLoop(null);
const cx = 0, cz = 148, y0 = r._voxelSurfaceY(cx, cz);
const lichter = [];
st.scene.traverse((o) => { if (o.isLight && o.shadow) lichter.push(o); });
if (st.csmNode && st.csmNode.lights) for (const l of st.csmNode.lights) if (l && l.shadow && !lichter.includes(l)) lichter.push(l);
const cam = st.camera, W = 240, H = 135;
const er = (V.e * Math.PI) / 180, az = (V.az * Math.PI) / 180;
const L0 = new T.Vector3(Math.sin(az) * Math.cos(er), Math.sin(er), Math.cos(az) * Math.cos(er));
const schuss = async (staerke) => {
  for (const l of lichter) l.shadow.intensity = staerke;
  window.__buehne();
  const dl0 = st.directionalLight; dl0.position.copy(dl0.target.position).addScaledVector(L0, 200); dl0.updateMatrixWorld(true);
  if (!st.windUniforms || !st.windUniforms.uSunDir) throw new Error("ohne uSunDir keine Sonne der Linse");
  st.windUniforms.uSunDir.value.copy(L0);
  cam.position.set(cx, y0 + 25, cz + 0.01); cam.lookAt(cx, y0, cz); cam.updateMatrixWorld(true);
  if (st.playerMesh) st.playerMesh.visible = false;
  // EINE Aufnahme: sie schaltet die Erst-Zeichnung zur Ruhe und wärmt die zeitliche Auflösung mit 32 Frames, in denen die
  // Karten neu werfen (drei Aufnahmen kosteten im Software-Holz 80 s je Sonne)
  return (await window.__ausgabeAufnahme(W, H, 1)).u8;
};
// nur der Boden-Satz zeichnet und wirft (die Rampe ist kahl; das Tor-Rund am Ursprung und die Hindernisse kosteten im Software-Holz
// je Render ~17 s)
const meshes = [];
st.scene.traverse((o) => { if (o.isMesh || o.isSprite || o.isPoints) meshes.push(o); });
const visAlt = new Map(meshes.map((m) => [m, m.visible]));
const bundles = window.__bundlesNeu;
for (const m of meshes) m.visible = visAlt.get(m) && m.name === "bodenSatz";
bundles();
let an, aus;
// der erste Schuss nach dem Sonnen-Wechsel zählt nicht (gemessen: mit und ohne Schatten bildgleich, die Karten warfen noch
// unter der alten Sonne)
try { await schuss(1); an = await schuss(1); aus = await schuss(0); } finally { for (const l of lichter) l.shadow.intensity = 1; for (const m of meshes) m.visible = visAlt.get(m); bundles(); }
cam.updateProjectionMatrix();
const va = [], vb = [], v = new T.Vector3();
for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) {
  const x = -12 + (24 * (i + 0.5)) / 40, z = 136 + (24 * (j + 0.5)) / 40;
  v.set(x, r._voxelSurfaceY(x, z), z).project(cam);
  const px = Math.round((v.x * 0.5 + 0.5) * (W - 1)), py = Math.round((-v.y * 0.5 + 0.5) * (H - 1));
  if (px < 0 || py < 0 || px >= W || py >= H) continue;
  const k = (py * W + px) * 4;
  va.push(luma709(an, k)); vb.push(luma709(aus, k));
}
const med = (a) => { const b = a.slice().sort(aufsteigend); return b[b.length >> 1]; };
const flecken = (a) => { const m = med(a); return a.filter((w) => Math.abs(w - m) > 0.25 * Math.max(m, 4)).length / a.length; };
const e = 0.5, hx = r._voxelSurfaceY(cx + e, cz) - r._voxelSurfaceY(cx - e, cz), hz = r._voxelSurfaceY(cx, cz + e) - r._voxelSurfaceY(cx, cz - e);
const nrm = new T.Vector3(-hx, 2 * e, -hz).normalize();
return { e: V.e, az: V.az, NdotL: +nrm.dot(L0).toFixed(3), proben: va.length, medianAn: +med(va).toFixed(1), medianAus: +med(vb).toFixed(1), fleckenAn: +flecken(va).toFixed(4), fleckenAus: +flecken(vb).toFixed(4) };
`;

// (H) DER HORIZONT (ferne.K4): das Gitter der Karte (`_horizontKarte`) eben auf 50 m, in der Spalte n/2 eine Wand 200 m hoch, die
// Sonne 5° aus +x; der Pass malt, die Linse liest die Mittel-Zeile der Karte: `grat` = die Texel, deren Schatten-Höhe r über ihrem
// Boden b steht (der Kanal, an dem der Fern-Ring prüft, `_horizontBoden`), so viele, wie der Marsch hinter der Wand trägt (15 an
// der Karte 220²); `luft` = die Farbe der Luft (`luft.farbe`, der Luftschatten) auf einem Strahl 55 m hoch 1 km vor dem Grat gegen
// denselben Strahl außerhalb der Karte; `ring` = die Stoffe des Rings, die den Boden der Karte lesen (`receivedShadowPositionNode`);
// `leer` = dasselbe über dem leeren Gitter (`leerM`, wie vor der ersten Antwort des Fadens) — wirft es, ist die Linse blind.
const HORIZONT = `
const H = r.constructor.HORIZONT_KARTE, n = H.gitter, K = r._horizontKarte(), U = K.U, D = K.hoehen.image.data, f = T.DataUtils, S = T.TSL, q = K.rt.width;
const lies = async (rt, w, y) => Array.from(await r.state.renderer.readRenderTargetPixelsAsync(rt, 0, y, w, 1), f.fromHalfFloat);
const grat = async (h, w) => {
  D.fill(f.toHalfFloat(h));
  for (let j = n / 2; j < n * n; j += n) D[j] = f.toHalfFloat(h + w);
  K.hoehen.needsUpdate = true; U.ursprung.value.set(0, 0); U.licht.value.set(1, 0.0875, 0); U.bezug.value = 0; U.aktiv.value = 1;
  r._atmoZeichne(K.pass, K.rt);
  const p = await lies(K.rt, q, q >> 1);
  return p.filter((v, k) => k % 4 < 1 && v - p[k + 2] > H.bandM).length;
};
const g = await grat(50, 200), a = S.vec3(11e3, 55, S.uv().x.mul(-2e4).add(5e3)), rt = new T.RenderTarget(2, 1, { type: T.HalfFloatType });
r._atmoZeichne(r.constructor._schirmDreieck(() => S.vec4(r._luftEnsure().farbe(a, a.add(S.vec3(500, 0, 0))), 1), "linse-h"), rt);
const l = await lies(rt, 2, 0);
return { grat: g, leer: await grat(-H.leerM, 0), ring: Object.values(r.state.fernRing.stoffe).filter((s) => s.receivedShadowPositionNode).length, luft: l[1] / l[5] };
`;
const horizontUrteil = (z) =>
    [
        [z.grat === 15, `GRAT: ${z.grat} Texel hinter dem Grat im Schatten, das Gesetz 15`],
        [z.leer === 0, `BLIND: das leere Gitter wirft ${z.leer} Texel`],
        [z.ring === 2, `RING: ${z.ring} von 2 Ring-Stoffen lesen den Boden der Karte, die übrigen ihre Masche`],
        [z.luft < 0.99, `LUFT: die Luft im Schatten des Grats trägt ${z.luft} der Luft im Licht`],
    ]
        .filter(([ok]) => !ok)
        .map(([, t]) => "(H) " + t);

function selbsttest() {
    const f = [];
    const z = (fa, fb, proben) => ({
        e: 22,
        az: 45,
        NdotL: -0.002,
        proben: proben ?? 1600,
        fleckenAn: fa,
        fleckenAus: fb,
    });
    const ruhig = [z(0, 0), Object.assign(z(0, 0), { e: 20, NdotL: -0.034 })];
    const pruefe = (name, b, muss) => {
        const ok = muss ? b.some((x) => muss.test(x)) : b.length === 0;
        if (!ok) f.push(`${name}: ${b.join(" · ") || "(grün)"}`);
    };
    pruefe("ruhig", terminatorUrteil(ruhig), null);
    pruefe(
        "main (11,6 % fleckig)",
        terminatorUrteil([z(0.1156, 0.0019), ruhig[1]]),
        /TERMINATOR-AKNE bei N·L -0\.002 .*11\.6 %.*TÄTER/
    );
    pruefe("keine Sonne", terminatorUrteil([]), /0 Sonnen gemessen/);
    pruefe("blind", terminatorUrteil([z(0, 0, 120), ruhig[1]]), /120 Proben .* blind/);
    for (const [k, v, muss] of [[], ["leer", 3, /BLIND/], ["ring", 0, /RING: 0/], ["luft", 1, /LUFT/]])
        pruefe("Horizont " + k, horizontUrteil({ grat: 15, leer: 0, ring: 2, luft: 0.8, [k]: v }), muss);
    return f;
}

if (require.main === module) {
    require("./lib/welt-boot.cjs").selbsttestEnde(selbsttest(), "das Terminator-Urteil nennt die Hang-Akne beim Namen");
    if (process.argv.includes("--selftest")) process.exit(0);
    const i = process.argv.indexOf("--port");
    const PORT = Number(i >= 0 ? process.argv[i + 1] : process.env.SCHATTEN_TERMINATOR_PORT || 4609);
    (async () => {
        const t0 = Date.now();
        const tor = require("./lib/welt-boot.cjs").werkbankTor(PORT, ["--holz", "voll"]);
        const rufe = tor.rufe;
        let code = 1;
        try {
            await tor.bereit;
            console.log(`  Start: ${((Date.now() - t0) / 1000).toFixed(0)} s`);
            for (const a of [
                ["umstellen", "--ort", "buehne", "--pose", "ost"],
                ["umstellen", "0", "120"],
            ]) {
                const tu = Date.now();
                const u = rufe(a);
                console.log(`  ${a.join(" ")}: ${((Date.now() - tu) / 1000).toFixed(0)} s`);
                if (u.status !== 0) throw new Error(a.join(" ") + ": " + (u.stdout || u.stderr));
            }
            const zeilen = [];
            for (const s of TERMINATOR_SONNEN) {
                const tp = Date.now();
                const o = rufe(["eval", PROBE.replace("__SONNE__", JSON.stringify(s))]);
                console.log(`  Probe ${s.e}°/${s.az}°: ${((Date.now() - tp) / 1000).toFixed(0)} s`);
                const t = o.stdout || "";
                const j = JSON.parse(t.slice(t.indexOf("{")));
                if (!j.ergebnis) throw new Error("die Probe lieferte nichts: " + t.slice(0, 300));
                zeilen.push(j.ergebnis);
                console.log(
                    `  Sonne ${s.e}°/${s.az}° · N·L ${j.ergebnis.NdotL} · ${j.ergebnis.proben} Proben · fleckig mit Schatten ` +
                        `${(j.ergebnis.fleckenAn * 100).toFixed(1)} %, ohne ${(j.ergebnis.fleckenAus * 100).toFixed(1)} % · Median ` +
                        `${j.ergebnis.medianAn} / ${j.ergebnis.medianAus}`
                );
            }
            const t = rufe(["eval", HORIZONT]).stdout || "";
            const hz = JSON.parse(t.slice(t.indexOf("{"))).ergebnis || {};
            console.log("  (H) " + JSON.stringify(hz));
            const b = [...terminatorUrteil(zeilen), ...horizontUrteil(hz)];
            for (const x of b) console.log("  ❌ " + x);
            console.log(
                b.length
                    ? "❌ ROT — Terminator oder Horizont"
                    : "✅ GRÜN — der Terminator ohne Akne, die Karte trägt den Grat"
            );
            code = b.length ? 1 : 0;
        } catch (e) {
            console.log("❌ diag-schatten-terminator: " + e.message + "\n" + tor.log.split("\n").slice(-15).join("\n"));
            code = 1;
        } finally {
            tor.stop();
            console.log(`diag-schatten-terminator: ${((Date.now() - t0) / 1000).toFixed(0)} s`);
        }
        process.exit(code);
    })();
}
