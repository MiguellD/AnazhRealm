// k4-bild.cjs — studios.K4 „Studio = Welt im Bild" als Probe der Sitzung (punkte.cjs fahreSitzung): je Mesh-Studio DASSELBE
// Werk in der Bühne des Studios und in der warmen Welt der Sitzung, bei gleicher Pose, aus dem Ausgabe-Pfad beider Seiten.
//
//   node k4-bild.cjs <AUS.json> <PORT> <SEK>    im Spiel-Baum (cwd); PORT = der save-server der Sitzung, SEK = der Deckel des Laufs
//
// IM BROWSER DER SITZUNG (w4-stationen-schnell): die Werkzeuge der Gruppe Stadt (stationen/sitzung-seite.js `sitzungWerkzeug`:
// H.verbinde, H.fahre, H.linse) — die Bühne ist eine zweite Seite derselben Herkunft, das Labor der Albedo läuft als Bibliothek in
// ihr. Bis dahin startete die Probe einen eigenen Browser samt eigenem Server (PORT+3) und das Labor einen dritten (PORT+2).
//
// DAS WERK: die Bühne nennt es selbst — die Seite läuft im Rahmen einer Gastgeber-Seite, ihr Knopf „In der Welt ansehen" (die
// Hülle, `bruecke({ werk })`) postet { kind, preset, seed, ov } an den Rahmen; die Probe gibt GENAU diese Nachricht der Welt
// (`_studioUebergabeEmpfang`, der EINE Übergabe-Kanal) und setzt das nächste Werk dieser Art (`spawnArchitecture`, Drehung 0,
// der Stempel `_studioStampFor` trägt die Prägung und den Samen `__gestalt`).
// DIE POSE: die Vorschau-Kamera der Welt — Gier 0,6, Neigung 0,32, fov 45, der Abstand aus dem Rahmen-Gesetz der Welt
// (`_workshopRahmen`: die Box füllt 0,7 der Bildkante) an der Box des gesetzten Werks; die Bühne steht im SELBEN Verhältnis
// Abstand/Radius vor ihrer Wurzel. Mittag (die Bühne der Werkbank hält Mittag · Sonne · Sommer).
// DAS AUGE AN DER POSE (w4-stationen-schnell): die Stufen-Wahl der Welt misst vom Spieler (`_lodAuge`) — er steht am Fuß der
// Vorschau-Kamera, dann taktet die Welt, bis das Werk als Instanz der Familie f: steht (`__gebautNach`, das EINE Warten auf einen
// Bau). Bis dahin stand der Spieler 16–24 m daneben und die Probe fragte 30 s lang je 100 ms (`_tickFoundryIngest` im Rahmen):
// im ruhenden Loop bestellt kein Takt die Stufe (kein Auftrag in der Foundry), und ein kleines Werk steht dort ohnehin als Karte
// (Wagen, Sichthöhe 1,64 m: L2 ab 12,5 m, `fimp:atlas:L2`) — „steht nach 30 s nicht in der Welt" an GTX b4bcf19c, 24a0f3ef, Radeon
// 715754fc.
// DAS BILD: Welt `werkbank bild --wahl 0` (1920 × 1080, Ausgabe-Pfad), Bühne derselbe Schuss durch ihren Ausgabe-Weg (Composer
// oder Renderer, scripts/lib/albedo-tafel.cjs STUDIOS). DIE GESTALT beider Seiten mit DERSELBEN Rechnung: das Werk allein in Weiß
// vor Schwarz unter derselben Kamera — die Bühne ihre Wurzel (SCHUSS), die Welt die Instanzen der Familie f: ihres Eintrags in
// einer eigenen Szene (WELT_GESTALT). Bis w16-studio-welt las die Welt-Seite die Teilung der Werkbank (`bild --klasse`: ein Pixel
// ist Werk, wo das Bild mit und ohne das Werk um > 18 springt) — sie trug den Boden: die Sprenkel des Schattens unter dem Wagen
// (Radeon 93fe1619 garage-welt.maske.png, 51 762 Pixel nur auf der Welt-Seite) und fremde Exemplare derselben Klasse im Blick.
// Bild-Differenz = Anteil der Gestalt-Pixel (Vereinigung beider Gestalten), die nur eine Seite trägt oder deren Luma um mehr als
// 18 springt; Soll ≤ 2,1 %.
// DIE ALBEDO: die Albedo-Tafel beider Seiten (spec/farbe/albedo-tafel.json; Welt `werkbank albedo --tafel` am Ort der Tafel,
// Labor `diag-albedo-tafel` `messeLabor`), je Studio jede Zeile seines Labors: |Labor/Welt − 1| ≤ 0,10 — gemessen nur für die
// Studios, deren Differenz im Soll liegt (nur sie kann die Albedo GRÜN machen; bis w4-stationen-schnell für jede gemessene).
// Nach <AUS.json>: { geraet, studios: { <id>: { werk, welt, buehne, differenz, albedo, gruen, grund, sek } }, albedo, fehler }.
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const cp = require("child_process");

const [AUS, PORT_ARG, SEK_ARG] = process.argv.slice(2);
const PORT = Number(PORT_ARG);
const ROOT = process.cwd();
const WB = require(path.join(ROOT, "scripts", "lib", "welt-boot.cjs"));
const AT = require(path.join(ROOT, "scripts", "lib", "albedo-tafel.cjs"));
const { sitzungWerkzeug } = require(path.join(__dirname, "sitzung-seite.js"));
// die Werkzeuge lesen ihren argv wie im `node -e` der Proben: der Port, die Ausgabe, der Deckel — und sie laufen wie dort im Spiel-Baum
// (probeBefehl: der Text der Funktion im `node -e`, cwd = Spiel-Baum): ihr `require` löst puppeteer aus dem Spiel-Baum, nie aus dem
// Koordinations-Baum, der kein node_modules trägt (GTX c351b318 … 6a571e3b: „Cannot find module 'puppeteer'“ aus stationen/, Exit 2)
process.argv = [process.argv[0], PORT_ARG, AUS, SEK_ARG];
const H = new Function("require", "module", "return (" + sitzungWerkzeug + ")();")(require("module").createRequire(path.join(ROOT, "k4-bild.cjs")), module);
const DIR = AUS.replace(/\.json$/, "") + "-k4";
fs.mkdirSync(DIR, { recursive: true });
const STUDIOS = ["garage", "portale", "schmiede", "fachwerk", "terrain", "koerperstudio", "tetrapoda"];
const [W, HOEHE] = [1920, 1080];
const SOLL = { differenz: 0.021, albedo: 0.1 };
const POSE = { gier: 0.6, neigung: 0.32, fov: 45 };
const sek = (t) => +((Date.now() - t) / 1000).toFixed(1);
const ruf = (weg, o) => WB.werkbankRuf(H.W, weg, o);
async function welt(code) {
    const r = await ruf("/eval", { code });
    if (!r || !("ergebnis" in r)) throw new Error("eval: " + JSON.stringify(r).slice(0, 300));
    if (r.ergebnis && r.ergebnis.fehler) throw new Error(r.ergebnis.fehler);
    return r.ergebnis;
}
const wb = (args, ms) =>
    cp.spawnSync(process.execPath, [path.join("scripts", "werkbank.cjs"), ...args], {
        encoding: "utf8",
        timeout: ms || 600000,
        maxBuffer: 1 << 28,
        env: { ...process.env, WERKBANK_PORT: String(H.W) },
    });

// ── PNG (8 Bit, RGB/RGBA, ohne Zeilensprung) → RGBA ── je Byte dieselbe Rechnung wie bis w4-stationen-schnell, ohne ein Feld je Byte
// (der Filter einer Zeile ein Zweig, Paeth ohne Destrukturierung; Bank 1920 × 1080 RGBA: 945 → 247 ms je Bild, Byte für Byte gleich)
function pngLesen(datei) {
    const b = fs.readFileSync(datei);
    let [i, w, h, typ] = [8, 0, 0, 0];
    const idat = [];
    while (i < b.length) {
        const n = b.readUInt32BE(i), t = b.toString("ascii", i + 4, i + 8), d = b.subarray(i + 8, i + 8 + n);
        if (t === "IHDR") {
            [w, h, typ] = [d.readUInt32BE(0), d.readUInt32BE(4), d[9]];
            if (d[8] !== 8 || d[12] !== 0) throw new Error(datei + ": PNG nicht 8 Bit ohne Zeilensprung");
        }
        if (t === "IDAT") idat.push(d);
        i += 12 + n;
    }
    const bpp = { 2: 3, 6: 4 }[typ];
    if (!bpp) throw new Error(datei + ": PNG-Farbtyp " + typ);
    const roh = zlib.inflateSync(Buffer.concat(idat)), st = w * bpp, out = new Uint8Array(w * h * 4);
    let vor = new Uint8Array(st), jetzt = new Uint8Array(st);
    for (let y = 0; y < h; y++) {
        const o = y * (st + 1), f = roh[o];
        for (let x = 0; x < st; x++) {
            const z = roh[o + 1 + x], a = x >= bpp ? jetzt[x - bpp] : 0, u = vor[x];
            let v;
            if (f === 0) v = z;
            else if (f === 1) v = z + a;
            else if (f === 2) v = z + u;
            else if (f === 3) v = z + ((a + u) >> 1);
            else {
                const c = x >= bpp ? vor[x - bpp] : 0, p = a + u - c, pa = Math.abs(p - a), pb = Math.abs(p - u), pc = Math.abs(p - c);
                v = z + (pa <= pb && pa <= pc ? a : pb <= pc ? u : c);
            }
            jetzt[x] = v & 255;
        }
        const z0 = y * w * 4;
        if (bpp === 4) out.set(jetzt, z0);
        else for (let x = 0; x < w; x++) (out[z0 + x * 4] = jetzt[x * 3]), (out[z0 + x * 4 + 1] = jetzt[x * 3 + 1]), (out[z0 + x * 4 + 2] = jetzt[x * 3 + 2]), (out[z0 + x * 4 + 3] = 255);
        [vor, jetzt] = [jetzt, vor];
    }
    return { w, h, d: out };
}
const luma = (u8, i) => 0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2];
// die Bild-Differenz über der Vereinigung der Masken
function differenz(lA, mA, lB, mB) {
    let [u, d, beide] = [0, 0, 0];
    for (let p = 0; p < mA.length; p++) {
        if (!mA[p] && !mB[p]) continue;
        u++;
        if (mA[p] && mB[p]) beide++;
        if (!mA[p] || !mB[p] || Math.abs(lA[p] - lB[p]) > 18) d++;
    }
    return { anteil: u ? +(d / u).toFixed(4) : null, gestalt: u, beide };
}

// ── DIE BÜHNE: die Studio-Seite im Rahmen einer Gastgeber-Seite — eine zweite Seite derselben Herkunft im Browser der Sitzung;
// die Gastgeber-Seite liefert die Probe selbst (die Anfrage nach /__k4-<studio>.html beantwortet sie, jede andere geht an den
// save-server der Sitzung) ──
const GAST = (pfad) =>
    `<!doctype html><meta charset="utf-8"><body style="margin:0;overflow:hidden"><iframe id="f" src="/${pfad}" style="border:0;width:${W}px;height:${HOEHE}px"></iframe>` +
    `<script>window.__werk=null;addEventListener("message",function(e){if(e.data&&e.data.type==="uebergabe")window.__werk=e.data;});</script>`;
// die Bereitschaft (die strenge CSP der Seiten erlaubt new Function nur im Aufruf von außen)
const BEREIT = (S) => {
    const g = (n) => new Function(`return typeof ${n} !== "undefined" ? ${n} : undefined;`)();
    const w = g(S.wurzel);
    let n = 0;
    if (w) w.traverse((x) => (n += x.isMesh ? 1 : 0));
    return n > 0 && !!g(S.renderer) && g(S.renderer)._initialized !== false && !!document.querySelector(".h-werk");
};
// ein Bild der Bühne (der Rahmen-Seite): die Wartenden der Bühne zählen in Bildern, nie in Sekunden
const BILD = () => new Promise((ok) => requestAnimationFrame(() => ok(1)));
// das Werk, das der Knopf an den Rahmen postet — die Nachricht kommt im nächsten Takt; höchstens 30 Bilder (ohne Werk: der Knopf
// nennt keines, `toast`)
const WERK = () =>
    new Promise((ok) => {
        let n = 0;
        const sieh = () => (window.__werk ? ok({ kind: window.__werk.kind, preset: window.__werk.preset, seed: window.__werk.seed, ov: window.__werk.ov }) : ++n > 30 ? ok(null) : requestAnimationFrame(sieh));
        sieh();
    });
// der Schuss der Bühne: dieselbe Pose (Richtung + Abstand/Radius) vor der Box ihrer Wurzel, Bild über den Ausgabe-Weg, Maske
// der Wurzel allein in Weiß über den Renderer; zurück Luma und Maske als base64
const SCHUSS = (o) => {
    const g = (n) => (n ? new Function(`return typeof ${n} !== "undefined" ? ${n} : undefined;`)() : undefined);
    const T = window.THREE, R = g(o.S.renderer), sc = g(o.S.szene), wz = g(o.S.wurzel), comp = g(o.S.ausgabe);
    // DIE BOX DES WERKS wie in der Welt (RAHMEN: die Geometrie der Instanzen, JEDE Instanz an ihrer Matrix — w16-studio-welt: die
    // Rad-InstancedMesh der Garage zählte bis hier ihre Vorlage am Ursprung, R 2,775 gegen die Welt 2,741, die Mitte 0,2 m tiefer:
    // die Kamera der Bühne stand ~40 px über der der Welt, Radeon 12f2f146): nur die sichtbaren Meshes der Wurzel — ihre Lehren
    // (Maß-Schilder als Sprite, Maß-Linien) hängen IN ihr (garage.js: Schilder und Linien am `vehicle`) und blähten die Box
    // (Radeon 25ac4c0c: garage R 3,902 gegen die Welt 2,854 — die Kamera 37 % weiter, der Wagen 113 847 gegen 211 221 Pixel)
    wz.updateMatrixWorld(true);
    const bb = new T.Box3(), mb = new T.Box3(), im = new T.Matrix4();
    wz.traverseVisible((x) => {
        if (!x.isMesh || !x.geometry) return;
        if (!x.geometry.boundingBox) x.geometry.computeBoundingBox();
        for (let i = 0; i < (x.isInstancedMesh ? x.count : 1); i++) {
            mb.copy(x.geometry.boundingBox);
            if (x.isInstancedMesh) x.getMatrixAt(i, im), mb.applyMatrix4(im);
            bb.union(mb.applyMatrix4(x.matrixWorld));
        }
    });
    const c = bb.getCenter(new T.Vector3()), rad = bb.getSize(new T.Vector3()).length() / 2;
    // DIE KAMERA IM RAHMEN DES WERKS (w16-studio-welt): die Kamera der Welt, ausgedrückt im Rahmen ihres Eintrags (RAHMEN `lokal`), steht
    // hier im Rahmen der Wurzel — dieselbe Lage zum Werk, unabhängig von seiner Drehung und Neigung in der Welt und von der Zerlegung der
    // Boxen (Welt je Instanz-Gruppe, Bühne je Mesh: garage R 2,868 gegen 2,729, die Bühne stand 5 % näher). Bis hier stand sie an der
    // Box der Bühne in Welt-Achsen: die Welt dreht einen Wagen um π/2 (`rotationY`) und neigt ihn zum Gelände.
    const Ms = wz.matrixWorld;
    const cam = new T.PerspectiveCamera(o.fov, o.W / o.H, Math.min(0.1, rad / 10), Math.max(200, 32 * rad));
    cam.position.fromArray(o.lokal.kamera).applyMatrix4(Ms);
    cam.up.fromArray(o.lokal.oben).transformDirection(Ms);
    cam.lookAt(new T.Vector3().fromArray(o.lokal.ziel).applyMatrix4(Ms));
    cam.updateMatrixWorld(true);
    const lies = () => {
        const k = document.createElement("canvas");
        [k.width, k.height] = [o.W, o.H];
        const x = k.getContext("2d", { willReadFrequently: true });
        x.drawImage(R.domElement, 0, 0, o.W, o.H);
        return x.getImageData(0, 0, o.W, o.H).data;
    };
    const unter = (x) => {
        for (let p = x; p; p = p.parent) if (p === wz) return true;
        return false;
    };
    // AUS DEM GRAPHEN, NIE NUR VERBORGEN (w16-studio-welt): r184 zeichnet Linien unter `visible = false` weiter (die Garage: Raster,
    // Zifferblatt und Maß-Linien, 61 350 der Masken-Pixel in 1920 × 1080) — wer nicht ins Bild gehört, verlässt seinen Eltern für
    // den Schuss und kehrt an seinen Platz zurück
    const raus = [];
    const nimm = (wer) => {
        const liste = [];
        sc.traverse((x) => (x.isMesh || x.isPoints || x.isLine || x.isSprite) && wer(x) && liste.push(x));
        for (const x of liste) if (x.parent) raus.push([x, x.parent, x.parent.children.indexOf(x)]), x.parent.remove(x);
    };
    const zurueck = () => {
        for (const [x, pa, i] of raus.reverse()) pa.children.splice(i, 0, x), (x.parent = pa);
        raus.length = 0;
    };
    // das Bild: die Bühne, wie sie steht, ohne ihre Lehren (Schilder, Maß-Linien, Raster: Sprite · Line · Points — auch IN der Wurzel,
    // die Welt trägt keine)
    const kams = [];
    let bild;
    try {
        nimm((x) => !x.isMesh);
        if (comp && comp.passes) for (const p of comp.passes) if (p && p.camera) kams.push([p, p.camera]), (p.camera = cam);
        if (comp && comp.passes) comp.render();
        else R.render(sc, cam);
        bild = lies();
    } finally {
        for (const [p, k] of kams) p.camera = k;
        zurueck();
    }
    const alt = { bg: sc.background, fog: sc.fog, ov: sc.overrideMaterial, tm: R.toneMapping };
    let maske;
    try {
        nimm((x) => !(x.isMesh && x.visible && unter(x)));
        [sc.background, sc.fog, sc.overrideMaterial, R.toneMapping] = [new T.Color(0, 0, 0), null, new T.MeshBasicMaterial({ color: 0xffffff }), T.NoToneMapping];
        R.render(sc, cam);
        maske = lies();
    } finally {
        zurueck();
        [sc.background, sc.fog, sc.overrideMaterial, R.toneMapping] = [alt.bg, alt.fog, alt.ov, alt.tm];
    }
    const L = new Uint8Array(o.W * o.H), M = new Uint8Array(o.W * o.H);
    for (let p = 0; p < L.length; p++) {
        L[p] = Math.round(0.2126 * bild[p * 4] + 0.7152 * bild[p * 4 + 1] + 0.0722 * bild[p * 4 + 2]);
        M[p] = maske[p * 4] > 127 ? 1 : 0;
    }
    const b64 = (u) => {
        let s = "";
        for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
        return btoa(s);
    };
    const png = (() => {
        const k = document.createElement("canvas");
        [k.width, k.height] = [o.W, o.H];
        k.getContext("2d").putImageData(new ImageData(Uint8ClampedArray.from(bild), o.W, o.H), 0, 0);
        return k.toDataURL("image/png");
    })();
    return { luma: b64(L), maske: b64(M), png, rad: +rad.toFixed(3), mitte: c.toArray().map((v) => +v.toFixed(3)) };
};

// ── DIE WELT: das Werk setzen (je Studio vom Ort des Spielers beim Start der Probe aus), das Auge an die Pose, takten, bis es
// steht, seine Box und die Pose aus dem Rahmen-Gesetz der Welt ──
const SETZEN = (werk, P) => `const w = ${JSON.stringify(werk)}, P = ${JSON.stringify(P)};
if (!r._studioUebergabeEmpfang(Object.assign({ type: "uebergabe" }, w))) return { fehler: "die Welt nimmt das Werk nicht (" + w.kind + " " + w.preset + ")" };
const name = r._studioBlueprintForWord(w.preset);
if (!name) return { fehler: "kein Bauplan für " + w.preset };
const verb = r._studioWerkVerb(name);
if (verb === "praegung" || verb === "wesen") return { ungemessen: "das Werk ist " + (verb === "praegung" ? "eine Prägung (der Leib des Spielers)" : "ein Wesen (eine lebende Kreatur)") + ", kein gesetzter Bau" };
const stempel = r._studioStampFor(name, undefined, {});
if (stempel === false) return { fehler: "der Stempel lehnt das Werk ab" };
let E = null;
for (const [dx, dz] of [[16, 16], [-16, 16], [16, -16], [-16, -16], [24, 0], [0, 24], [-24, 0], [0, -24]]) {
    E = r.spawnArchitecture(name, { x: P.x + dx, y: P.y, z: P.z + dz }, { seed: 1, rotationY: 0, studioOv: stempel || undefined, werk: true });
    if (E) break;
}
if (!E) return { fehler: "kein Ort trägt " + name };
window.__k4Werk = E;
return { name, typ: E.type, pos: [E.position.x, E.position.y, E.position.z].map((v) => +v.toFixed(2)) };`;
// die Blick-Richtung der Pose (Gier, Neigung) und die Kamera des Rahmen-Gesetzes an einer Box
const POSE_TEXT = (pose) => `const cosP = Math.cos(${pose.neigung}), blick = [cosP * Math.cos(${pose.gier}), Math.sin(${pose.neigung}), cosP * Math.sin(${pose.gier})];
const rahmen = (bb) => { const R = bb.getSize(new T.Vector3()).length() / 2, c = bb.getCenter(new T.Vector3());
    const cam = new T.PerspectiveCamera(${pose.fov}, ${W} / ${HOEHE}, Math.min(0.1, R / 10), Math.max(200, 32 * R));
    return { R, c, dist: r._workshopRahmen({ rahmen: { box: bb, R }, camera: cam, orbit: { yaw: ${pose.gier}, pitch: ${pose.neigung} } }) }; };`;
// DAS AUGE AN DER POSE: die Box des Eintrags aus seinen Blockern (die Instanz steht noch nicht), der Spieler am Fuß der Kamera, die
// Welt taktet, bis das Werk als Instanz der Familie f: steht — das EINE Warten auf einen Bau (`__gebautNach`: der Takt der Seite,
// der Deckel zählt nur Takte ohne Offenes und wirft beim Namen)
const AUGE = (pose) => `const E = window.__k4Werk, K = r.constructor;
${POSE_TEXT(pose)}
const bb = new T.Box3();
for (const b of E.blockerAABBs || []) bb.union(new T.Box3(new T.Vector3(b.minX, b.botY, b.minZ), new T.Vector3(b.maxX, b.topY, b.maxZ)));
if (bb.isEmpty()) bb.setFromCenterAndSize(new T.Vector3(E.position.x, E.position.y + 1, E.position.z), new T.Vector3(2, 2, 2));
const { c, dist } = rahmen(bb);
const [fx, fz] = [c.x + blick[0] * dist, c.z + blick[2] * dist];
r.state.playerMesh.position.set(fx, r.getTerrainHeightAt(fx, fz) + K.PLAYER_FOOT_OFFSET, fz);
// DIE STUFE AM ABSTAND (w16-studio-welt): das Werk steht, wenn die Welt seine Stufe am Auge der Pose bestätigt hat
// („_lodAmAbstand“, die Wahl am echten Abstand — „_archStufeUrteil“) und eine Instanz dieser Stufe trägt (die Stufe davor hält
// ihren Slot, die Blende am Auge verbirgt sie). Bis hier zählte jede Instanz der Familie f: — die Stufe vom Ort des Setzens
// (16–24 m: garage L1) stand sofort, 0 Takte.
E._lodAmAbstand = false;
const steht = () => {
    const kl = new Set();
    for (const [key, g] of r.state.archInstanceGroups || []) {
        const s = g.slotEntry ? g.slotEntry.indexOf(E) : -1;
        if (s >= 0 && !g.shadowTwin && g.geom && /^f:/.test(K._instanzKlasse(key))) kl.add(K._instanzKlasse(key));
    }
    return E._lodAmAbstand === true && [...kl].some((k) => k.endsWith(":L" + (E._lodLevel | 0)));
};
const takte = await window.__gebautNach("das Werk " + E.type + " als Instanz der Familie f: in der Stufe am Auge der Pose", { fertig: steht, bau: () => {} });
return { takte, fuss: [fx, fz].map((v) => +v.toFixed(2)), stufe: E._lodLevel | 0 };`;
const RAHMEN = (pose) => `const E = window.__k4Werk, K = r.constructor, bb = new T.Box3(), b = new T.Box3(), m = new T.Matrix4(), klassen = new Set();
${POSE_TEXT(pose)}
for (const [key, g] of r.state.archInstanceGroups || []) {
    const s = g.slotEntry ? g.slotEntry.indexOf(E) : -1;
    const kl = K._instanzKlasse(key);
    if (s < 0 || g.shadowTwin || !/^f:/.test(kl) || !kl.endsWith(":L" + (E._lodLevel | 0)) || !g.geom) continue;
    if (!g.geom.boundingBox) g.geom.computeBoundingBox();
    for (let i = s; i < g.slotEntry.length; i++) {
        if (g.slotEntry[i] !== E) continue;
        if (g.mesh && g.mesh.isInstancedMesh) g.mesh.getMatrixAt(i, m);
        else r._archEntryWorldMatrix(E, m);
        bb.union(b.copy(g.geom.boundingBox).applyMatrix4(m));
    }
    klassen.add(kl);
}
if (bb.isEmpty()) return { fehler: "das Werk trägt keine Instanz der Familie f: mehr" };
const { R, c, dist } = rahmen(bb);
const kamera = c.clone().addScaledVector(new T.Vector3(...blick), dist), Mw = new T.Matrix4();
r._archEntryWorldMatrix(E, Mw);
const Mi = Mw.clone().invert();
// die Kamera im Rahmen des Eintrags (SCHUSS stellt sie in den Rahmen der Wurzel der Bühne)
const lokal = { kamera: kamera.clone().applyMatrix4(Mi).toArray(), ziel: c.clone().applyMatrix4(Mi).toArray(), oben: new T.Vector3(0, 1, 0).transformDirection(Mi).toArray() };
return { R: +R.toFixed(3), dist: +dist.toFixed(3), blick, mitte: c.toArray(), kamera: kamera.toArray(), lokal, klassen: [...klassen] };`;
// DIE GESTALT DER WELT: die Instanzen der Familie f: des Eintrags in seiner Stufe (dieselben, die RAHMEN zählt) in einer eigenen Szene, Weiß vor
// Schwarz, unter der Kamera des Bilds in ein Ziel 1920 × 1080 (linear, ungetont: Weiß bleibt 255) — ein Byte je Pixel, Zeile 0 oben
const WELT_GESTALT = (k, l, fov) => `const E = window.__k4Werk, K = r.constructor, R = r.state.renderer, sc = new T.Scene(), weiss = new T.MeshBasicMaterial({ color: 0xffffff });
for (const [key, g] of r.state.archInstanceGroups || []) {
    const s = g.slotEntry ? g.slotEntry.indexOf(E) : -1;
    if (s < 0 || g.shadowTwin || !g.geom || !/^f:/.test(K._instanzKlasse(key)) || !K._instanzKlasse(key).endsWith(":L" + (E._lodLevel | 0))) continue;
    // jeder Slot des Eintrags (die Räder tragen vier in EINER Gruppe)
    for (let i = s; i < g.slotEntry.length; i++) {
        if (g.slotEntry[i] !== E) continue;
        const m = new T.Matrix4(), me = new T.Mesh(g.geom, weiss);
        if (g.mesh && g.mesh.isInstancedMesh) g.mesh.getMatrixAt(i, m), m.premultiply(g.mesh.matrixWorld);
        else r._archEntryWorldMatrix(E, m);
        me.matrixAutoUpdate = false;
        me.matrix.copy(m);
        me.frustumCulled = false;
        sc.add(me);
    }
}
if (!sc.children.length) return { fehler: "das Werk trägt keine Instanz der Familie f: für seine Gestalt" };
sc.updateMatrixWorld(true);
const cam = new T.PerspectiveCamera(${fov}, ${W} / ${HOEHE}, 0.05, 4000);
cam.position.set(${k.join(", ")});
cam.lookAt(${l.join(", ")});
cam.updateMatrixWorld(true);
const ziel = new T.RenderTarget(${W}, ${HOEHE}), vor = R.getRenderTarget(), farbe = R.getClearColor(new T.Color()), alpha = R.getClearAlpha();
let px;
try {
    R.setRenderTarget(ziel);
    R.setClearColor(0x000000, 0);
    R.clear();
    R.render(sc, cam);
    px = await R.readRenderTargetPixelsAsync(ziel, 0, 0, ${W}, ${HOEHE});
} finally {
    R.setRenderTarget(vor);
    R.setClearColor(farbe, alpha);
    ziel.dispose();
    weiss.dispose();
}
const oben = !!(R.backend && R.backend.isWebGPUBackend), M = new Uint8Array(${W * HOEHE});
for (let y = 0; y < ${HOEHE}; y++) for (let x = 0; x < ${W}; x++) M[y * ${W} + x] = px[((oben ? y : ${HOEHE} - 1 - y) * ${W} + x) * 4] > 127 ? 1 : 0;
let b = "";
for (let i = 0; i < M.length; i += 0x8000) b += String.fromCharCode.apply(null, M.subarray(i, i + 0x8000));
return { maske: btoa(b), teile: sc.children.length };`;
const WEG = `if (window.__k4Werk) r.removeArchitecture(window.__k4Werk, { still: true }); window.__k4Werk = null; return 1;`;

// `nur`: die Studios, deren Bild-Differenz im Soll liegt — nur ihre Albedo kann ein Urteil tragen (ein Studio ohne Differenz im Soll
// ist nie GRÜN); das Labor misst nur sie, und nur ihre Zeilen gehen in die Zahl (für die übrigen trägt die Labor-Datei die Werte der
// Tafel, nie eine Messung dieses Laufs)
async function albedoMessen(aus, nur, browser) {
    // die Welt-Seite am Ort der Tafel (wie diag-albedo-tafel neuMessen), dann die Labor-Seite je Studio
    const t = JSON.parse(fs.readFileSync(path.join("spec", "farbe", "albedo-tafel.json"), "utf8"));
    const gw = (t.gemessen && t.gemessen.welt) || {};
    // der Ort der Tafel steht, wenn `umstellen` zurückkommt (der Ring an seinem Ziel, die Welt steht, `__weltStehtNach`)
    const um = wb(gw.ort ? ["umstellen", "--ort", gw.ort] : ["umstellen", ...(gw.spieler || [0, 0]).map(String)]);
    if (um.status !== 0) throw new Error("umstellen: Exit " + um.status);
    const wd = path.join(DIR, "albedo-welt.json");
    const a = wb(["albedo", "--tafel", "--datei", wd, "--ordner", path.join(DIR, "albw")]);
    if (!fs.existsSync(wd)) throw new Error("albedo --tafel ohne Messung: Exit " + a.status + " " + String(a.stdout + a.stderr).slice(-300));
    // DAS LABOR in der Sitzung: diag-albedo-tafel als Bibliothek (`messeLabor`), seine Seiten im Browser der Sitzung — derselbe Server
    // der Sitzung, je Seite das EINE Warten der Linsen (`WARTEN_SEITE`: das Labor schläft in der Seite) und das Fenster des Labors
    const server = {
        lausche: async () => server,
        zeige: (seite, frist, rest = "index.html", warte = "domcontentloaded") => seite.goto("http://localhost:" + PORT + "/" + rest, { waitUntil: warte, timeout: frist }),
        close: () => {},
    };
    const neueSeite = async () => {
        const p = await browser.newPage();
        await p.evaluateOnNewDocument(WB.WARTEN_SEITE);
        await p.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
        return p;
    };
    const L = H.linse("scripts/diag-albedo-tafel.cjs", ["messeLabor"], { stumm: { statikServer: () => server, starteBrowser: async () => ({ newPage: neueSeite, close: async () => {} }) } });
    const Lm = Object.assign(await L.messeLabor({ echt: true, nur, tafel: AT.ladeTafel() }), { echt: true });
    WB.jsonSchreiben(path.join(DIR, "albedo-labor.json"), Lm);
    const Wm = JSON.parse(fs.readFileSync(wd, "utf8"));
    aus.albedo = { welt: { echt: Wm.echt === true, eichung: Wm.eichung }, labor: { echt: Lm.echt === true, eichung: (Lm.eichung || {}).labor || {} }, zeilen: [] };
    for (const z of t.zeilen) {
        if (!z.labor || !z.labor.studio || !nur.includes(z.labor.studio)) continue;
        const L2 = (Lm.labor || {})[z.id], Y = (Wm.welt || {})[z.id];
        const v = L2 && Y && L2.Y > 0 && Y.Y > 0 ? +(L2.Y / Y.Y).toFixed(4) : null;
        aus.albedo.zeilen.push({ id: z.id, studio: z.labor.studio, labor: L2 ? L2.Y : null, welt: Y ? Y.Y : null, v });
    }
}

H.fahre(async function k4Bild(H) {
    const { page: weltSeite, browser } = await H.verbinde();
    const aus = (H.teil = { plan: "studios.K4", pose: POSE, soll: SOLL, leinwand: [W, HOEHE], geraet: null, studios: {}, albedo: null, fehler: [] });
    const t0 = Date.now();
    // der Ort des Spielers beim Start: jedes Werk steht von hier aus (das Auge wandert je Studio an seine Pose)
    const P = await welt("const p = r.state.playerMesh.position; return { x: p.x, y: p.y, z: p.z };");
    // GRÜN zählt nur über der Gestalt beider Seiten (WELT_GESTALT · SCHUSS), nie über einer Teilung, die den Boden trägt
    const dOk = (z) => !!(z && z.differenz && z.differenz.anteil != null && z.differenz.anteil <= SOLL.differenz && z.welt.maske === "gestalt" && z.buehne.maske === "gestalt" && z.welt.pixel > 0 && z.buehne.pixel > 0);
    for (const sid of STUDIOS) {
        // ein Studio an der Frist fällt aus: die Probe trägt kein ganzes Urteil (die EINE Marke, punkte.cjs FRIST_MARKE)
        if (H.rest() < 8) {
            H.fristRiss("Studio " + sid + " und die folgenden ausgelassen");
            break;
        }
        const ts = Date.now(), S = AT.STUDIOS[sid];
        const z = (aus.studios[sid] = { werk: null, welt: null, buehne: null, differenz: null, albedo: null, gruen: false, grund: null, sek: null, teile: {} });
        // die Sekunden je Schritt (der Beleg der Dauer auf der Karte): die Bühne steht · das Werk steht in der Welt · ihr Bild · der Schuss
        const teil = (n, t = z.teile.t || ts) => ((z.teile[n] = sek(t)), (z.teile.t = Date.now()));
        const page = await browser.newPage();
        try {
            await page.setViewport({ width: W, height: HOEHE, deviceScaleFactor: 1 });
            const gast = "http://localhost:" + PORT + "/__k4-" + sid + ".html";
            await page.setRequestInterception(true);
            page.on("request", (q) => (q.url() === gast ? q.respond({ status: 200, contentType: "text/html; charset=utf-8", body: GAST(S.pfad) }) : q.continue()).catch(() => {}));
            await page.goto(gast, { waitUntil: "load", timeout: 120000 });
            const frame = () => page.frames().find((f) => f.url().includes(S.pfad));
            // die Bühne steht: Bild um Bild der Rahmen-Seite, höchstens 600 (bis w4-stationen-schnell 200 × 300 ms Wanduhr)
            for (let n = 0, da = false; !da; n++) {
                da = !!frame() && (await frame().evaluate(BEREIT, S).catch(() => false));
                if (da) break;
                if (n >= 600) throw new Error("die Bühne steht nach 600 Bildern nicht (Wurzel " + S.wurzel + ", Knopf .h-werk)");
                await page.evaluate(BILD);
            }
            teil("buehne");
            if (!aus.geraet)
                aus.geraet = await frame().evaluate((S) => {
                    const R = new Function(`return ${S.renderer};`)();
                    if (R.isWebGPURenderer) return "WebGPU " + (R.backend.device ? R.backend.device.adapterInfo.architecture : "WebGL2-Ersatz");
                    const gl = R.getContext(), e = gl.getExtension("WEBGL_debug_renderer_info");
                    return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
                }, S);
            await frame().evaluate(() => document.querySelector(".h-werk").click());
            z.werk = await page.evaluate(WERK);
            if (!z.werk) throw new Error("die Bühne nennt kein Werk (der Knopf postet keine Übergabe)");
            const gesetzt = await welt(SETZEN(z.werk, P));
            if (gesetzt.ungemessen) {
                z.grund = "ungemessen: " + gesetzt.ungemessen;
                continue;
            }
            // die Welt nach vorn: ihr Takt läuft am Bild (`__seitenTakt`), ein Tab dahinter zeichnet nie
            await weltSeite.bringToFront();
            const auge = await welt(AUGE(POSE));
            const rahmen = await welt(RAHMEN(POSE));
            teil("welt");
            const datei = path.join(DIR, sid + "-welt.png");
            const [k, l] = [rahmen.kamera, rahmen.mitte];
            const bild = await ruf("/bild", { px: k[0], py: k[1], pz: k[2], lx: l[0], ly: l[1], lz: l[2], w: W, h: HOEHE, fov: POSE.fov, wahl: "0", datei });
            if (!bild || !bild.datei || !fs.existsSync(datei)) throw new Error("bild: " + JSON.stringify(bild).slice(0, 300));
            const bw = pngLesen(datei);
            const lw = new Uint8Array(W * HOEHE);
            for (let p = 0; p < lw.length; p++) lw[p] = Math.round(luma(bw.d, p * 4));
            const gw = await welt(WELT_GESTALT(k, l, POSE.fov));
            const kw = new Uint8Array(Buffer.from(gw.maske, "base64"));
            z.welt = { ...gesetzt, takte: auge.takte, fuss: auge.fuss, stufe: auge.stufe, R: rahmen.R, dist: rahmen.dist, klassen: rahmen.klassen, maske: "gestalt", teile: gw.teile, pixel: kw.reduce((s, v) => s + v, 0), abnahme: bild.abnahme || null };
            await welt(WEG);
            teil("bild");
            await page.bringToFront();
            const s = await frame().evaluate(SCHUSS, { S, W, H: HOEHE, fov: POSE.fov, lokal: rahmen.lokal });
            WB.pngDatei(path.join(DIR, sid + "-buehne.png"), s.png);
            const [ls, ms] = [s.luma, s.maske].map((x) => new Uint8Array(Buffer.from(x, "base64")));
            z.buehne = { R: s.rad, maske: "gestalt", pixel: ms.reduce((a, v) => a + v, 0) };
            z.differenz = differenz(lw, kw, ls, ms);
            teil("schuss");
        } catch (e) {
            z.grund = "ROT: " + String((e && e.message) || e).slice(0, 300);
            await welt(WEG).catch(() => {});
        } finally {
            z.sek = sek(ts);
            delete z.teile.t;
            await page.close().catch(() => {});
            await weltSeite.bringToFront().catch(() => {});
            const tl = Object.entries(z.teile).map(([k, v]) => k + " " + v).join(" · ");
            console.log(`K4 ${sid}: Differenz ${z.differenz ? z.differenz.anteil : "—"} · ${z.grund || ""} (${z.sek} s${tl ? ": " + tl : ""})`);
        }
    }
    const imSoll = STUDIOS.filter((sid) => dOk(aus.studios[sid]));
    if (imSoll.length && !H.gerissen)
        try {
            await albedoMessen(aus, imSoll, browser);
        } catch (e) {
            aus.fehler.push("Albedo: " + String((e && e.message) || e).slice(0, 300));
        }
    for (const sid of STUDIOS) {
        // ein Studio hinter der Frist trägt keinen Eintrag (die Marke steht, kein Urteil) — nie ein Wurf, der sie verdeckt
        const z = aus.studios[sid];
        if (!z) continue;
        if (!z.differenz) {
            console.log(`K4 ${sid}: ROT · Differenz — · Albedo — · ${z.grund || ""} (${z.sek} s)`);
            continue;
        }
        const az = ((aus.albedo && aus.albedo.zeilen) || []).filter((x) => x.studio === sid);
        const ab = az.map((x) => (x.v == null ? Infinity : Math.abs(x.v - 1)));
        z.albedo = { zeilen: az.map((x) => x.id + " " + x.v), max: az.length ? +Math.max(...ab).toFixed(4) : null };
        const ok = dOk(z);
        const aOk = z.albedo.max != null && z.albedo.max <= SOLL.albedo;
        z.gruen = ok && aOk;
        // DIE STUFE DER WELT an der Pose beim Namen: die Bühne zeigt L0, die Welt zeichnet am Pose-Abstand die Stufe ihres Gesetzes
        // (fachwerk viktorianisch in 28 m: L2 — ohne Veranda, ohne Gefache, eine andere Palette)
        z.grund =
            (z.welt && z.welt.stufe ? "die Welt zeichnet an der Pose L" + z.welt.stufe + " (die Bühne L0) · " : "") +
            (ok ? "" : "Differenz " + z.differenz.anteil + " > " + SOLL.differenz + " ") +
            (aOk ? "" : "Albedo " + (!ok ? "ungemessen (die Differenz liegt über dem Soll)" : z.albedo.max == null ? "ohne Zeile" : "|L/W − 1| " + z.albedo.max + " > " + SOLL.albedo));
        console.log(`K4 ${sid}: ${z.gruen ? "GRÜN" : "ROT"} · Differenz ${z.differenz.anteil} · Albedo ${z.albedo.max} · ${z.grund || ""} (${z.sek} s)`);
    }
    aus.sek = sek(t0);
    // ein Studio hinter der Frist trägt keinen Eintrag (oben): es ist nie GRÜN — kein Wurf an ihm (Radeon 6a571e3b: „gruen“ von undefined)
    aus.gruen = STUDIOS.filter((s) => aus.studios[s] && aus.studios[s].gruen);
    console.log(`K4 Gerät der Bühne: ${aus.geraet || "ungenannt"}`);
    // die Zahlen der Probe als EINE Zeile (das Urteil liest sie, wo keine Datei steht — die Proben der Station)
    console.log("K4 " + JSON.stringify({ geraet: aus.geraet, studios: Object.fromEntries(Object.entries(aus.studios).map(([id, z]) => [id, { gruen: z.gruen, grund: z.grund, differenz: z.differenz, albedo: z.albedo, welt: z.welt && { maske: z.welt.maske, pixel: z.welt.pixel, stufe: z.welt.stufe }, buehne: z.buehne && { maske: z.buehne.maske, pixel: z.buehne.pixel } }])), fehler: aus.fehler }));
    console.log(`K4 ${aus.gruen.length}/${STUDIOS.length} Mesh-Studios mit Bild-Differenz ≤ ${SOLL.differenz} und Albedo im Rand ${SOLL.albedo} (${aus.sek} s)`);
    return aus;
});
