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
// Dazu (K) DAS KORN IM SCHLAGSCHATTEN (w28-himmel-korn, unten): im Wurf der Gasse von S4 steht nie mehr Korn als im Licht daneben —
// das Himmels-Licht liest dasselbe Korn wie die Sonne (`_mikroStoff`); die Mutante im Lauf gibt dem Boden das zweite Bild zurück.
// SELBSTTEST (--selftest, ohne Browser): das Urteil fällt bei Akne (die Zahl von main), fehlender Sonne und blinder Probe rot,
// der Horizont bei leerer Karte, einem Ring an seiner Masche und einer Luft ohne Schatten, das Korn an den Zahlen von main, ohne
// Wurf im Feld, bei zu wenigen Bildpunkten und bei einer Mutante, die besteht.
//   node scripts/diag-schatten-terminator.cjs [--selftest] [--port 4609]   (die Bilder des Korns: artifacts/schatten-terminator/)
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
const med = (a) => rang(a.slice().sort(aufsteigend));
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

// (K) DAS KORN IM SCHLAGSCHATTEN (w28-himmel-korn): die Gasse der Hindernis-Station S4 (spec/pruefbuehne/stationen.json: zwei Wände
// 8 × 2,5 m längs z) steht quer zur Vormittags-Sonne — die Bühne stellt die Uhr (`uhr`, die EINE Sonnenbahn), nie die Linse das
// Licht: die Sonne steht 36° hoch, die sonnenferne Wand wirft 3,4 m tief auf freien Boden. Das Auge steht in Augenhöhe auf der Kante
// des Wurfs und blickt an ihr entlang: auf einer Seite der Boden im Wurf, auf der anderen derselbe Boden im Licht — zwei Felder
// gleich weit von der Kante (`feld` m), gleich weit vom Auge, im selben Bild des Ausgabe-Pfads (640 × 360, gezeichnet nur der
// Boden-Satz und die Werfer der Bühne). Gemessen je Feld DAS KORN: die Streuung der Luma (Rec. 709, 0–255) um ihr 9 × 9-Mittel,
// über jeden Bildpunkt, dessen Sehstrahl den Boden im Feld trifft; `wurf` = Luma im Wurf / Luma im Licht nennt, ob der
// Schlagschatten im Feld steht. DAS GESETZ: im Wurf leuchtet nur der Himmel, und er liest dasselbe Korn wie die Sonne (die Albedo)
// — bei weniger Licht steht nie mehr Korn: Korn im Wurf / Korn im Licht ≤ `max`.
// Bis w28-himmel-korn legte der Stoff des Mikro-Reliefs ein zweites Bild derselben Höhe in das Himmels-Licht (aoNode, 0,41–2,35 je
// Kiesel): im Schlagschatten des Hauses im Dorf stand σ_hp 9,06 gegen 8,36 im Licht (1,08), ohne es 1,97 gegen 3,72 (0,53; der
// Befund „Hausschatten“ im Zweig koordination, Radeon 890M, 15.11.); an dieser Gasse (Radeon 890M) main 13,94 gegen 14,70 (0,95),
// der Schnitt 5,45 gegen 12,04 (0,45) — `max` 0,6 ist die Zahl der Annahme des Befunds. DIE MUTANTE fährt in jedem Lauf: derselbe Schuss mit dem
// zweiten Bild von damals im aoNode des Bodens (der Boden-Stoff neu gebaut, danach zurück) MUSS reißen — sonst ist die Linse
// blind. Konsum-Leser: der Boden-Stoff der Welt (`_getVoxelChunkMaterial` → `_mikroStoff`), das Programm, das der Schuss zeichnet.
const GASSE = (() => {
    const s4 = require("../spec/pruefbuehne/stationen.json").stationen.find((s) => s.id === "s4-hindernisse");
    const g = s4.koerper.find((k) => k.id === "gasse");
    return g.teile.map((t) => ({ x: g.x + t.mitte[0], z: g.z + t.mitte[2], dicke: t.mass[0], h: t.mass[1], laenge: t.mass[2] }));
})();
// `feld`: die zwei Felder liegen 0,5 … 1,7 m beiderseits der Kante; `wurfMax`: das Feld im Wurf trägt höchstens so viel der Luma
// des Felds im Licht; `mutante`: die drei Zahlen des zweiten Bilds, wie `TERRAIN_BUMP` sie bis w28-himmel-korn trug
const KORN = { uhr: 0.35, feld: [0.5, 1.7], max: 0.6, pixelMin: 1500, wurfMax: 0.75, mutante: { mulde: 0.38, kavitaet: 12, krume: 0.025 } };
// DIE PROBE in der Seite (ihre Worte stehen hier — im Text der Probe zählte jedes als Code): die Sonne der Uhr ist die Richtung
// zu ihr (`_dayNightSunDirection`); die Wand auf der sonnenfernen Seite der Gasse wirft auf freien Boden, die Kante ihres Wurfs
// liegt h · Lx / Ly jenseits ihrer Fläche (`xK`), längs der Wand um h · Lz / Ly geschert (das Feld `zA … zB` liegt 1 m innerhalb).
// DER BODEN-STOFF NEU (die Mutante, wie `werkbank methode --terrain`): jeder Leser des alten zeichnet mit dem neuen. DIE WAHL:
// gezeichnet werden der Boden-Satz und die Werfer der Bühne (jedes werfende Mesh außer der Wiese, der Streu und dem Leib des
// Spielers — auf der Bühne steht nur ihre Saat; die Wiese über dem Boden deckte sonst das Feld). SIE HÄLT IM RENDER (wie
// `linsenZiel`, scripts/lib/licht-linsen.cjs): der Haken jedes Passes (`scene.onBeforeRender` → `_passSicht`) legt die Senken der
// Nah-Wiese für sein Auge neu — nach ihm fällt jedes Mesh ohne die Wahl, auch in den Kaskaden. Der erste Schuss nach dem Wechsel
// der Uhr zählt nicht (die Karten warfen noch unter der alten Sonne). Je Bildpunkt der Ort, an dem sein Sehstrahl den Boden trifft
// (die Ebene der Station): d > 0 zwischen Kante und Wand (im Wurf, Feld S), d < 0 jenseits der Kante (im Licht, Feld L); je Feld
// [Bildpunkte, Summe der Luma, Summe der Quadrate des Rests um das 9 × 9-Mittel].
const KORN_PROBE = `
const V = __KORN__, st = r.state, T = window.THREE, W = 640, H = 360, cam = st.camera, sc = st.scene;
st.renderer.setAnimationLoop(null);
const so = r._dayNightSunDirection(r._sonnenWinkel(V.uhr)), s = Math.sign(so.x);
const wand = V.waende.slice().sort((a, b) => s * (a.x - b.x))[0];
const tiefe = (wand.h * Math.abs(so.x)) / so.y, scher = (-wand.h * so.z) / so.y;
const xK = wand.x - s * (wand.dicke / 2 + tiefe);
const zA = wand.z - wand.laenge / 2 + Math.max(0, scher) + 1, zB = wand.z + wand.laenge / 2 + Math.min(0, scher) - 1;
const y0 = r._voxelSurfaceY(xK, (zA + zB) / 2);
const P = Object.getPrototypeOf(r), roh = P._mikroStoff;
const bodenNeu = () => {
  const alt = st.voxelChunkMaterial;
  st.voxelChunkMaterial = null;
  const neu = r._getVoxelChunkMaterial();
  sc.traverse((m) => m.material === alt && (m.material = neu));
};
if (V.mutante) {
  P._mikroStoff = function (Tm, mat, hoehe, k, stoff) {
    roh.call(this, Tm, mat, hoehe, k, stoff);
    const M = V.mutante, h = hoehe.mul(k), x = h.sub(k.mul(k).mul(M.krume)).mul(M.kavitaet);
    const korn = Tm.float(1.0).add(h.mul(this._stoff(stoff).korn)).max(0.1);
    const bild = Tm.exp(x.mul(Tm.inverseSqrt(x.mul(x).add(1.0))).mul(-Math.log(M.mulde))).div(korn);
    mat.aoNode = mat.aoNode ? mat.aoNode.mul(bild) : bild;
  };
  bodenNeu();
}
const wahl = new Set(), fort = [];
st.playerMesh.visible = false;
sc.traverse((m) => m.isMesh && m.visible && ((m.castShadow && !/^(nahWiese|streu)/.test(m.name)) || m.name === "bodenSatz" ? wahl.add(m) : fort.push(m)));
const waehle = () => sc.traverse((m) => m.isMesh && !wahl.has(m) && (m.visible = false));
const haken = sc.onBeforeRender;
sc.onBeforeRender = (...a) => (haken.apply(sc, a), waehle());
waehle();
window.__bundlesNeu();
const schuss = async () => {
  window.__buehne({ uhr: V.uhr });
  cam.position.set(xK, y0 + 1.7, zA - 3.5);
  cam.lookAt(xK, y0, zB);
  cam.updateMatrixWorld(true);
  return (await window.__ausgabeAufnahme(W, H, 1)).u8;
};
let an;
try { await schuss(); an = await schuss(); } finally {
  sc.onBeforeRender = haken;
  fort.forEach((m) => (m.visible = true));
  if (V.mutante) { P._mikroStoff = roh; bodenNeu(); }
  window.__bundlesNeu();
}
const A = (i) => luma709(an, i * 4), o = cam.position, v = new T.Vector3(), F = { S: [0, 0, 0], L: [0, 0, 0] };
for (let y = 4; y < H - 4; y++) for (let x = 4; x < W - 4; x++) {
  v.set(((x + 0.5) / W) * 2 - 1, 1 - ((y + 0.5) / H) * 2, 0.5).unproject(cam).sub(o);
  const t = (y0 - o.y) / v.y, wz = o.z + v.z * t, d = (o.x + v.x * t - xK) * s;
  if (!(v.y < 0) || wz < zA || wz > zB || Math.abs(d) < V.feld[0] || Math.abs(d) > V.feld[1]) continue;
  const f = d > 0 ? F.S : F.L;
  let m = 0;
  for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) m += A((y + j) * W + x + i);
  const l = A(y * W + x);
  f[0]++; f[1] += l; f[2] += (l - m / 81) ** 2;
}
const z = ([n, summe, quadrate]) => ({ pixel: n, mittel: +(summe / n).toFixed(2), hp: +Math.sqrt(quadrate / n).toFixed(3) });
return { tiefe: +tiefe.toFixed(2), S: z(F.S), L: z(F.L), wurf: +(F.S[1] / F.S[0] / (F.L[1] / F.L[0])).toFixed(3), png: window.__png(an, W, H) };
`;
// das Urteil über das Korn: `z` die Messung des Bodens der Welt, `mut` dieselbe mit dem zweiten Bild (die Mutante des Laufs — trug
// kein Mesh den neu gebauten Boden-Stoff, misst sie die Welt und besteht: BLIND)
function kornUrteil(z, mut) {
    const v = (m) => m.S.hp / m.L.hp;
    const blind = (m) =>
        !m || !m.S || !m.L
            ? "keine Messung"
            : !(m.S.pixel >= KORN.pixelMin && m.L.pixel >= KORN.pixelMin)
              ? `${m.S.pixel} Bildpunkte im Wurf, ${m.L.pixel} im Licht (je ≥ ${KORN.pixelMin}) — blind`
              : !(m.wurf <= KORN.wurfMax) && `Luma Wurf / Licht ${m.wurf} (Soll ≤ ${KORN.wurfMax}, Wurf ${m.tiefe} m) — kein Schlagschatten im Feld`;
    const [b, bm] = [blind(z), blind(mut)];
    return [
        b
            ? "(K) KORN: " + b
            : v(z) > KORN.max &&
              `(K) KORN IM SCHLAGSCHATTEN: σ_hp ${z.S.hp} im Wurf gegen ${z.L.hp} im Licht (${v(z).toFixed(2)}, Soll ≤ ${KORN.max}) — ` +
                  "TÄTER: das Himmels-Licht liest ein eigenes Bild der Höhe (`_mikroStoff`, aoNode)",
        bm
            ? "(K) KORN MUTANTE: " + bm
            : !(v(mut) > KORN.max) && `(K) KORN MUTANTE BLIND: mit dem zweiten Bild im aoNode ${mut.S.hp} gegen ${mut.L.hp} (${v(mut).toFixed(2)})`,
    ].filter(Boolean);
}

function selbsttest() {
    const f = [];
    const z = (fa, fb, proben) => ({
        e: 22,
        az: 45,
        NdotL: -0.002,
        proben: proben == null ? 1600 : proben,
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
    // (K) das Korn: die Zahlen des Befunds am Dorf (main 9,06 gegen 8,36, ohne das zweite Bild 1,97 gegen 3,72)
    const k = (hpS, hpL, pixel = 9000, wurf = 0.16) => ({ wurf, S: { pixel, hp: hpS }, L: { pixel: 9000, hp: hpL } });
    const [welt, main] = [k(1.97, 3.72), k(9.06, 8.36)];
    pruefe("Korn ruhig", kornUrteil(welt, main), null);
    pruefe("Korn main", kornUrteil(main, main), /KORN IM SCHLAGSCHATTEN: σ_hp 9\.06 .*1\.08.*`_mikroStoff`/);
    pruefe("Korn blind", kornUrteil(k(1.97, 3.72, 300), main), /300 Bildpunkte im Wurf.*blind/);
    pruefe("Korn ohne Wurf", kornUrteil(k(1.97, 3.72, 9000, 0.98), main), /kein Schlagschatten im Feld/);
    pruefe("Korn Mutante besteht", kornUrteil(welt, welt), /MUTANTE BLIND/);
    return f;
}

if (require.main === module) {
    require("./lib/welt-boot.cjs").selbsttestEnde(
        selbsttest(),
        "das Terminator-Urteil nennt die Hang-Akne beim Namen, das Korn-Urteil das zweite Bild im Schlagschatten"
    );
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
            // (K) das Korn im Schlagschatten: an der Gasse von S4 der Boden der Welt, dann die Mutante (das zweite Bild)
            const zurGasse = ["umstellen", String(GASSE[0].x - 5), String(GASSE[0].z - GASSE[0].laenge / 2 - 4)];
            const uk = rufe(zurGasse);
            if (uk.status !== 0) throw new Error(zurGasse.join(" ") + ": " + (uk.stdout || uk.stderr));
            const korn = {};
            for (const [name, mutante] of Object.entries({ welt: null, mutante: KORN.mutante })) {
                const auf = { uhr: KORN.uhr, waende: GASSE, feld: KORN.feld, mutante };
                const ko = rufe(["eval", KORN_PROBE.replace("__KORN__", JSON.stringify(auf))]).stdout || "";
                const e = (korn[name] = JSON.parse(ko.slice(ko.indexOf("{"))).ergebnis);
                if (!e) throw new Error("die Korn-Probe " + name + ": " + ko.slice(0, 300));
                // das Auge neben der Zahl: die zwei Schüsse (Welt, Mutante) als Bild — der Probe-Post nimmt sie auf
                require("./lib/welt-boot.cjs").pngDatei(`artifacts/schatten-terminator/korn-${name}.png`, e.png);
                delete e.png;
                console.log(
                    `  (K) ${name} · Korn σ_hp im Wurf ${e.S.hp} gegen ${e.L.hp} im Licht = ${(e.S.hp / e.L.hp).toFixed(3)} · ` +
                        `Luma ${e.S.mittel} / ${e.L.mittel} · ${e.S.pixel} px · Wurf ${e.tiefe} m`
                );
            }
            const b = [...terminatorUrteil(zeilen), ...horizontUrteil(hz), ...kornUrteil(korn.welt, korn.mutante)];
            for (const x of b) console.log("  ❌ " + x);
            console.log(
                b.length
                    ? "❌ ROT — Terminator, Horizont oder Korn"
                    : "✅ GRÜN — der Terminator ohne Akne, die Karte trägt den Grat, im Schlagschatten steht das Korn der Albedo"
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
