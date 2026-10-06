// diag-schatten-werfer.cjs — DIE WERFER-WAND (npm run gate:schatten-werfer).
//
// Befund 04.10. (echte GPU, Mess-Wiese, V18.528): beide CSM-Kaskaden zeichneten DIESELBE Werfer-Menge (k0 = k1 = 209
// Befehle · 1,23 M Dreiecke). Drei Wurzeln: (a) das r184-Addon setzte jede Kaskade auf ein Quadrat mit der Diagonale
// ihrer Frustum-Scheibe — der Blick deckte ein Viertel —, und es stellte die Lichter NACH den Karten (r184 ruft sein
// updateBefore nach den Kaskaden-Pässen); (b) die Region-Bundles trugen EIN Urteil für jeden Pass, das der Haupt-Kamera:
// ein Bundle im Blick warf in beide Kaskaden, eines hinter dem Blick nie; (c) jede Region warf als Ganzes. Die Heilung:
// `_kaskadenPassen` misst die Box an der Scheibe im Licht-Raum (gerastet, texel-geschnappt, nahe Ebene über dem höchsten
// Werfer) im Haken des Haupt-Passes VOR den Karten, `_passSicht` wählt je Schatten-Pass die Regionen (Werfer-Hülle) und
// darin die Werfer (Box je Blatt-Mesh) gegen das Frustum der Pass-Kamera. Im Schatten-Pass ist ein Region-Bundle eine
// Gruppe (die Bundle-Wahrheit am Chokepoint `_renderScene`: unter dem Override-Stoff sammelt kein Render Bundles).
// Der Boden ist EIN Satz außerhalb jedes Bundles — seine Bereiche sind Hüllen der Box (Empfänger-Band und Werfer).
//
// Diese Linse (Null-Renderer, GPU-frei) fährt die ECHTEN Methoden an einer echten CSM-Instanz (Addon-Init mit der
// Haupt-Kamera, wie der erste Material-Bau) und der gebooteten Welt:
//   K1  die Box deckt die EMPFÄNGER: Boden-Punkte im Blick (aus dem Dichte-Feld, nicht aus der Box-Rechnung) liegen im
//       Frustum jeder Kaskade, deren Tiefen-Bereich sie nach dem Addon-Shader lesen (`_cascades`-Uniform des Addons,
//       Fade-Saum aus CSMShadowNode._setupFade abgeschrieben) — mittags und am Abend
//   K2  die Box ist eng: Fläche ≤ 60 % des Addon-Quadrats (Diagonale + Fade-Saum) je Kaskade, waagrechter Blick
//   K3  das Zentrum liegt auf dem Texel-Raster der Licht-Basis; 0,37 m Gehen hält Größe und Raster
//   K7  der Takt hält die Box (Welle C, `_kaskadeHaelt`): rendert eine Kaskade auf ihrem Takt und nichts änderte sich,
//       behält sie ihre Box (dieselbe Lage — die Wahl ihres Passes steht); steigt ein Werfer über ihre nahe Ebene, legt
//       sie neu (und wirft ihn). Die Box-Messungen (K1–K6, W5, die Selbsttests) legen die Box frisch (`alleNeu`).
//   K4  außerhalb des Takts: dieselbe Kamera → keine Kaskade rendert; 40° gedreht → beide rendern (die Scheibe lief
//       aus der Box)
//   K5  die Karte trägt die LÄNGSTE Kante der Referenz-Scheibe bei texelM (kleinste Zweierpotenz)
//   K6  Drehen (360 × 1°, Mittag): die längste Kante je Texel bleibt ≤ 1,05 · texelM; die Rast-Wechsel der Box-Größe
//       (jeder ist ein Neu-Abtasten aller Schatten-Kanten) werden gezählt
//   W1  je Kaskaden-Pass wirft JEDES Bundle genau dann, wenn seine Werfer-Hülle das EINE Gesetz der Pass-Wahl trifft
//       (`_passTrifftBox` in der Lage des Passes: Frustum der Pass-Kamera, Licht-Kapsel gegen die Scheibe), und JEDER
//       Werfer darin ebenso mit seiner Box; nach dem Pass: Haupt-Urteil, jeder Werfer zurück; ein Bundle bleibt Bundle
//   W2  ein Werfer 2 km vor der Kamera (im Haupt-Urteil sichtbar) wirft in keine Kaskade
//   W3  ein Werfer hinter dem Blick (Haupt-Urteil unsichtbar), der in die nahe Kaskade wirft, wirft
//   W4  eine Region mit einem nahen und einem 2 km fernen Werfer: die Region wirft, der ferne Werfer ruht
//   W5  der Boden außerhalb der Bundles: ein Tal in der nahen Scheibe unter jeder Bundle-Hülle empfängt (liegt in der
//       nahen Box), ein Hang 30 m über der nahen Ebene zum Licht hin wirft (die nahe Ebene steigt über ihn)
//   W6  jeder Werfer der Szene ist der Box bekannt: Bundle-Kind, werfender Satz (Boden, Bau-Satz) oder freier Werfer
//       (Tier · Spieler · Insel · Bauplan-Bau als eigene Gruppe)
//   W7  die Sätze je Pass (Befund 05.10., echte GPU, Mess-Wiese: Hauptbild, k0 und k1 zogen je den ganzen Ring,
//       245 696 Dreiecke; der Bau-Satz zog in k1 den Lauf vom ersten bis zum letzten Bereich im Frustum): jeder Pass
//       zeichnet in jedem Satz genau die Zellen, deren Hülle das EINE Gesetz der Pass-Wahl trifft (Höhlen-Zellen nur, wenn
//       die Höhlen-Sicht des Passes sie erreicht, Welle 7), byte-gleich hintereinander, nach dem Pass wieder den Abschnitt
//       des Hauptbilds; ein Pass lässt Ring weg, und am Abend (Sonne im Rücken) trägt die nahe Kaskade Boden hinter dem
//       Blick (der Hang wirft)
//   W8  die Instanz-Wahl je Pass (Befund 06.10., echte GPU, Mess-Wiese: jede globale Baum-Gruppe zog in jedem Pass JEDE
//       Instanz — das Hauptbild auch die Bäume hinter dem Blick, k1 bei schrägem Blick jeden Zwilling, jeder Pass die Stufen,
//       deren Maske vom Auge alles verwirft): gebaute Bäume an bekannten Orten — im Hauptbild zeichnet die L1 nur die
//       Instanzen im Frustum und in ihrem Fenster (nicht hinter dem Blick, nicht jenseits d1), die L0 nicht jenseits d0; der
//       Zwilling wirft mittags in die nahe Scheibe, nicht in die ferne, ein hoher Zwilling mitten in der fernen Scheibe nur
//       dort, und am Abend wirft ein Zwilling HINTER dem Blick in die nahe Scheibe (sein Schatten läuft nach vorn); nach jedem
//       Pass zählt jede Gruppe wieder alle, jede Marke trägt ihren Slot; ein Stoff OHNE Maske (die GPU zeichnet jede Instanz
//       voll) bekommt kein Fenster — seine L1 jenseits d1 zeichnet; die Gruppen der Welt ohne Masken-Stoff stehen beim Namen
//   W9  DAS EINE GESETZ, DREI LESER (W7-Vereinigung — Befund echte GPU, Mess-Wiese, yaw −0,88: boden k1 173 784 Dreiecke
//       über der Ratsche 90 845, die Box der fernen Kaskade umschloss den nahen Boden, die Kapsel galt nur den Bäumen):
//       ein Punkt P in der Box einer Kaskade, dessen Licht-Kapsel ihre Scheibe verfehlt (aus der Welt gesucht) — dort wirft
//       weder ein Werfer eines Bündels noch eine Instanz der Wahl in diese Kaskade, und der Boden-Satz zeichnet dort genau
//       die Zellen des Gesetzes (es schneidet Zellen, die das Frustum allein zöge: nicht vakuös)
//   Z1  die Karten-Ziele: Farbe r8 (der Filter liest sie nur mit shadowMap.transmitted), Tiefe 16 bit, benannt —
//       gesetzt beim Bau des Ziels (die Hülle um setupRenderTarget), nie umgebaut
//   Z2  die Bildziele je Leser: EIN Weg zu compileAsync (`_kompiliere`, gegen das Ziel des Szenen-Passes), EINE
//       Szenen-Tiefe (`_szeneTiefe`), kein Modul-Knoten der linearen Tiefe, kein namenloses Bildziel (convertToTexture)
//   A1  Absenz: kein Frustum-Schreiber nimmt Inseln/Mesh-Tieren den Schatten; das Addon schreibt keine Box (updateBefore
//       und _updateShadowBounds stumm), der Haken des Haupt-Passes stellt die Kaskaden (Konsum), Schatten-Pässe und
//       Kompilate stellen nichts; die Sicht je Pass schaltet keine Bundle-Eigenschaft
//   S1  Selbsttest: die alte Regel (jeder Pass liest das Haupt-Urteil) muss W1/W2/W3/W4 rot machen
//   S3  Selbsttest: die alte Hüllen-Regel (nur Bundles) muss W5 rot machen
//   S4  Selbsttest: die beiden alten Frustum-Schreiber der Tiere fängt die Absenz-Regel
//   S5  Selbsttest: das Addon-_updateShadowBounds schreibt die Kaskaden-Kamera (der Zweit-Schreiber ist echt)
//   S6  Selbsttest: ein Kompilat ohne Wache stellt die Kaskaden
//   S7  Selbsttest: ein zweiter compileAsync-Ruf, eine zweite Szenen-Tiefe machen Z2 rot
//   S8  Selbsttest: die alte Regel (der Satz zeichnet den ganzen Ring in jedem Pass) macht W7 rot
//   S9  Selbsttest: die alte Regel (eine globale Gruppe zeichnet jede Instanz in jedem Pass) macht W8 rot, beim Namen
//   S10 Selbsttest: urteilt EIN Leser nach der alten Box (das Frustum allein, ohne Licht-Kapsel) — die Zellen, die Werfer
//       der Bündel oder die Instanzen —, wird W9 rot und nennt ihn
//
//   node scripts/diag-schatten-werfer.cjs [--selftest]
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.SCHATTEN_WERFER_PORT || 4577);
const SELBSTTEST = process.argv.includes("--selftest");
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

// Kommentare strippen, Strings bewahren (zeichenweise, string-bewusst — die diag-altlasten-Methode).
function ohneKommentare(src) {
    let out = "";
    let mode = "code";
    for (let i = 0; i < src.length; i++) {
        const c = src[i],
            c2 = src[i + 1];
        if (mode === "code") {
            if (c === "/" && c2 === "/") {
                mode = "line";
                i++;
                continue;
            }
            if (c === "/" && c2 === "*") {
                mode = "block";
                i++;
                continue;
            }
            if (c === "'") mode = "sq";
            else if (c === '"') mode = "dq";
            else if (c === "`") mode = "tpl";
            out += c;
            continue;
        }
        if (mode === "line") {
            if (c === "\n") {
                mode = "code";
                out += c;
            }
            continue;
        }
        if (mode === "block") {
            if (c === "*" && c2 === "/") {
                mode = "code";
                i++;
            }
            continue;
        }
        if (c === "\\") {
            out += c + (c2 || "");
            i++;
            continue;
        }
        if ((mode === "sq" && c === "'") || (mode === "dq" && c === '"') || (mode === "tpl" && c === "`")) mode = "code";
        out += c;
    }
    return out;
}

// Z2 — die Bildziele je Leser, gezählt im kommentar-bereinigten Stamm.
function bildZiele(src) {
    const code = ohneKommentare(src);
    const n = (re) => (code.match(re) || []).length;
    return {
        kompilat: n(/\.compileAsync\(/g),
        tiefe: n(/viewportDepthTexture\(/g),
        linear: n(/viewportLinearDepth/g),
        namenlos: n(/convertToTexture\(/g),
    };
}
const bildZieleGut = (z) => z.kompilat === 1 && z.tiefe === 1 && z.linear === 0 && z.namenlos === 0;

function probe(selbsttest) {
    const r = window.anazhRealm;
    const T = window.THREE;
    const st = r.state;
    const A = r.constructor;
    const K = A.SCHATTEN_KASKADE;
    const cam = st.camera;
    const csm = st.csmNode;
    const aus = { selbsttest };
    if (!csm) return Object.assign(aus, { fehler: "keine CSM" });
    // Die Addon-Init, wie sie der erste Material-Bau fährt (Kaskaden-Lichter + Frusta an der Haupt-Kamera).
    if (!csm.camera) csm._init({ camera: cam, renderer: { coordinateSystem: cam.coordinateSystem } });
    // Der Boden-Satz legt seinen Index (wie vor jedem Render) — erst dann ist er sichtbar und eine Hülle der Box.
    r._tickChunkSatz();
    const boden = st.chunkSaetze ? st.chunkSaetze.get("boden") : null;
    aus.bodenBereiche = boden ? boden.bloecke.size : 0;
    const pm = st.playerMesh.position;
    const blick = (yaw) => {
        cam.position.set(pm.x, pm.y + 1.6, pm.z);
        cam.lookAt(pm.x + Math.sin(yaw) * 100, pm.y + 1.6, pm.z + Math.cos(yaw) * 100);
        cam.updateMatrixWorld(true);
        r._loopFrustumCulling(); // das Haupt-Urteil der Bundles für diesen Blick
    };
    const tag = (t) => {
        st.timeOfDay = t;
        if (st.world) st.world.timeOfDay = t;
        r._applyDayNightToScene();
        st.directionalLight.updateMatrixWorld(true);
        st.directionalLight.target.updateMatrixWorld(true);
    };
    // jede Kaskade rendert UND legt ihre Box frisch (die Box-Messungen messen den Fit, nicht den Halt des Takts)
    const alleNeu = () => {
        csm._anazhFit = [];
        csm.lights.forEach((l) => ((l.shadow.autoUpdate = false), (l.shadow.needsUpdate = true)));
    };
    const S = r._kaskadenSchmier();
    // Kamera der Kaskade so, wie `renderShadow` sie stellt (updateMatrices), dann ihr Frustum.
    const frustumVon = (i) => {
        const lw = csm.lights[i];
        lw.shadow.updateMatrices(lw);
        const c = lw.shadow.camera;
        const m = new T.Matrix4().multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse);
        return new T.Frustum().setFromProjectionMatrix(m, c.coordinateSystem);
    };
    // DIE LAGE eines Passes, wie sie der echte Haken legt (`_passWahlLage`: Frustum, Auge, Scheibe der Kaskade, Blende) —
    // das Soll jedes Lesers ist das EINE Gesetz in dieser Lage. i ≥ 0: die Kaskade i, sonst das Hauptbild.
    const lageVon = (i) => {
        const kam = i >= 0 ? csm.lights[i].shadow.camera : cam;
        if (i >= 0) S.frustum.copy(frustumVon(i));
        else {
            cam.updateMatrixWorld(true);
            S.m.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
            S.frustum.setFromProjectionMatrix(S.m, cam.coordinateSystem);
        }
        return r._passWahlLage(S, kam, i);
    };
    // DIE EMPFÄNGER (K1): Boden-Punkte im Blick, aus dem Dichte-Feld (`_voxelSurfaceY`) — unabhängig von der Box-Rechnung.
    // Empfänger ist nur, was ein schatten-lesendes Mesh zeichnet: ein Punkt über einem Bereich des Boden-Satzes. Jenseits
    // zeichnet der Fern-Ring (receiveShadow false) — gemessen 05.10.: ein Hügel 296 m weit (z 273, der Boden-Satz endet bei
    // 222) lag 1 m über der nahen Ebene; bis zum Waldboden hatten die Hüllen der Klein-Streu-Bundles (Region-Kugel
    // R·√½ + 140 m) das Band zufällig darüber gehoben.
    // Welche Kaskade ein Punkt liest, entscheidet der Addon-Shader (CSMShadowNode._setupFade, abgeschrieben): je Kaskade
    // [x, y] = `_cascades[i]` (die Uniform des Addons), Mitte = (x+y)/2, Kante = die nähere Grenze, margin = 0,25·Kante²,
    // csmX = x − margin/2, csmY = y + margin/2 (die letzte Kaskade: y); gelesen wird, wo csmX ≤ L ≤ csmY.
    const liest = (L) => {
        const out = [];
        for (let i = 0; i < csm._cascades.length; i++) {
            const c = csm._cascades[i];
            const mitte = (c.x + c.y) / 2;
            const kante = L < mitte ? c.x : c.y;
            const margin = 0.25 * kante * kante;
            const lo = c.x - margin / 2;
            const hi = i === csm._cascades.length - 1 ? c.y : c.y + margin / 2;
            if (L >= lo && L <= hi) out.push(i);
        }
        return out;
    };
    const empfaenger = () => {
        cam.updateMatrixWorld(true);
        const m = new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
        const blickFr = new T.Frustum().setFromProjectionMatrix(m, cam.coordinateSystem);
        const far = Math.min(cam.far, csm.maxFar);
        const dir = cam.getWorldDirection(new T.Vector3());
        const yaw = Math.atan2(dir.x, dir.z);
        const halb = Math.atan(Math.tan(T.MathUtils.degToRad(cam.fov) / 2) * cam.aspect);
        const fr = csm.lights.map((_l, i) => frustumVon(i));
        const p = new T.Vector3(),
            v = new T.Vector3();
        let n = 0,
            schlecht = 0;
        const jeKaskade = csm.lights.map(() => 0);
        const flaechen = boden ? [...boden.bloecke.values()].filter((b) => b.huelle && !b.huelle.isEmpty()) : null;
        const empfaengt = (x, z) =>
            !flaechen ||
            flaechen.some(
                (b) => x >= b.huelle.min.x && x <= b.huelle.max.x && z >= b.huelle.min.z && z <= b.huelle.max.z
            );
        for (let a = -16; a <= 16; a++) {
            const w = yaw + (a / 16) * halb;
            for (let k = 0; k < 24; k++) {
                const d = 2 + (far - 2) * ((k + 0.5) / 24) ** 1.5;
                const x = cam.position.x + Math.sin(w) * d,
                    z = cam.position.z + Math.cos(w) * d;
                if (!empfaengt(x, z)) continue;
                const y = r._voxelSurfaceY(x, z);
                if (!Number.isFinite(y)) continue;
                p.set(x, y, z);
                if (!blickFr.containsPoint(p)) continue;
                v.copy(p).applyMatrix4(cam.matrixWorldInverse);
                const L = (-v.z - cam.near) / (far - cam.near);
                for (const i of liest(L)) {
                    n++;
                    jeKaskade[i]++;
                    if (!fr[i].containsPoint(p)) schlecht++;
                }
            }
        }
        return { n, schlecht, jeKaskade };
    };
    // Das Addon-Quadrat je Kaskade (CSMShadowNode._updateShadowBounds: Diagonale + Fade-Saum).
    const addonBreite = (i) => {
        const f = csm.frustums[i];
        const p1 = f.vertices.far[0];
        const p2 =
            p1.distanceTo(f.vertices.far[2]) > p1.distanceTo(f.vertices.near[2])
                ? f.vertices.far[2]
                : f.vertices.near[2];
        const far = Math.max(cam.far, csm.maxFar);
        const ld = f.vertices.far[0].z / (far - cam.near);
        return p1.distanceTo(p2) + 0.25 * ld * ld * (far - cam.near);
    };

    // ── K: die Box ──
    tag(0.5);
    blick(0);
    alleNeu();
    r._kaskadenPassen(csm);
    aus.karten = csm._anazhKarten.slice();
    aus.k1Mittag = empfaenger();
    aus.k2 = csm._anazhFit.map((f, i) => {
        const a = addonBreite(i);
        return {
            W: +f.W.toFixed(1),
            H: +f.H.toFixed(1),
            addon: +a.toFixed(1),
            anteil: +((f.W * f.H) / (a * a)).toFixed(3),
        };
    });
    aus.k3 = csm._anazhFit.map((f) => {
        const q = (f.x0 + f.W / 2) / f.texel;
        return Math.abs(q - Math.round(q)) < 1e-6;
    });
    const vorher = csm._anazhFit.map((f) => ({ W: f.W, texel: f.texel }));
    cam.position.x += 0.37;
    cam.updateMatrixWorld(true);
    alleNeu();
    r._kaskadenPassen(csm);
    aus.k3gehen = csm._anazhFit.map((f, i) => {
        const q = (f.x0 + f.W / 2) / f.texel;
        return f.W === vorher[i].W && Math.abs(q - Math.round(q)) < 1e-6;
    });
    // K7 — der Takt hält die Box: ein Takt-Render ohne Änderung behält sie, ein Werfer über der nahen Ebene legt sie neu
    if (boden) {
        tag(0.5);
        blick(0);
        alleNeu();
        r._kaskadenPassen(csm);
        // ein Fit zählt seine Neulegungen (`bild`; er legt dasselbe Objekt neu)
        const vor = csm._anazhFit.map((f) => f.bild);
        csm.lights.forEach((l) => (l.shadow.needsUpdate = true));
        r._kaskadenPassen(csm);
        const gehalten = csm._anazhFit.every((f, i) => f.bild === vor[i]);
        const f0 = csm._anazhFit[0];
        const bild0 = f0.bild;
        const ph = new T.Vector3(f0.x0 + f0.W / 2, f0.y0 + f0.H / 2, f0.zt + 20).applyMatrix4(f0.basisInv.clone().invert());
        const hoch = { huelle: new T.Box3().setFromCenterAndSize(ph, new T.Vector3(6, 6, 6)) };
        boden.bloecke.set("__wc:hoch", hoch);
        let neuGelegt = false,
            wirft = false;
        try {
            csm.lights.forEach((l) => (l.shadow.needsUpdate = true));
            r._kaskadenPassen(csm);
            const f1 = csm._anazhFit[0];
            neuGelegt = f1.bild !== bild0;
            wirft = ph.clone().applyMatrix4(f1.basisInv).z <= f1.zt;
        } finally {
            boden.bloecke.delete("__wc:hoch");
        }
        aus.k7 = { gehalten, neuGelegt, wirft };
    }
    // K4 — außerhalb des Takts
    csm.lights.forEach((l) => ((l.shadow.autoUpdate = false), (l.shadow.needsUpdate = false)));
    r._kaskadenPassen(csm);
    aus.k4still = csm.lights.map((l) => l.shadow.needsUpdate === true);
    blick(0.7);
    csm.lights.forEach((l) => (l.shadow.needsUpdate = false));
    r._kaskadenPassen(csm);
    aus.k4dreh = csm.lights.map((l) => l.shadow.needsUpdate === true);
    // K1 am Abend (lange Schatten, schräge Box)
    tag(0.72);
    blick(0);
    alleNeu();
    r._kaskadenPassen(csm);
    aus.k1Abend = empfaenger();
    // K5 — die längste Kante der Referenz-Scheibe trägt die Karte
    {
        const far = A.PERF_SHADOW_RANGE_MAX * A.SCHATTEN_FERN_FAKTOR;
        const br = [];
        csm.customSplitsCallback(csm.cascades, cam.near, far, br);
        const halb = Math.tan(T.MathUtils.degToRad(cam.fov) / 2) * K.bezugAspekt;
        const saum = [0, 1];
        aus.k5 = aus.karten.map((n, i) => {
            r._kaskadenSaum(br, i, csm.fade === true, saum);
            const dA = cam.near + saum[0] * (far - cam.near),
                dB = cam.near + saum[1] * (far - cam.near);
            const kante = Math.hypot(2 * halb * dB, dB - dA);
            const tx = K.texelM[Math.min(i, K.texelM.length - 1)];
            return {
                n,
                kante: +kante.toFixed(1),
                texel: +(kante / n).toFixed(3),
                soll: tx,
                kleinste: kante / n <= tx && (n >= K.karteMax || kante / (n / 2) > tx),
            };
        });
    }
    // K6 — Drehen: 360 × 1° am Mittag, je Kaskade die längste Kante je Texel und die Rast-Wechsel der Größe
    {
        tag(0.5);
        const k6 = csm.lights.map((l) => ({ maxTexel: 0, wechsel: 0, W: null, H: null, n: l.shadow.mapSize.width }));
        for (let g = 0; g < 360; g++) {
            blick((g * Math.PI) / 180);
            alleNeu();
            r._kaskadenPassen(csm);
            csm._anazhFit.forEach((f, i) => {
                const e = k6[i];
                e.maxTexel = Math.max(e.maxTexel, Math.max(f.W, f.H) / e.n);
                if (e.W !== null && (f.W !== e.W || f.H !== e.H)) e.wechsel++;
                e.W = f.W;
                e.H = f.H;
            });
        }
        aus.k6 = k6.map((e, i) => ({
            maxTexel: +e.maxTexel.toFixed(3),
            soll: K.texelM[Math.min(i, K.texelM.length - 1)],
            wechsel: e.wechsel,
        }));
    }

    // ── W5: der Boden außerhalb der Bundles (Tal empfängt, Hang wirft) ──
    const w5 = (huellenRegel) => {
        tag(0.5);
        blick(0);
        const roh = r._kaskadenHuellen;
        if (huellenRegel) r._kaskadenHuellen = huellenRegel;
        const tal = { huelle: new T.Box3() };
        const hang = { huelle: new T.Box3() };
        try {
            // das Tal: ein Boden IN der nahen Scheibe (1 m über ihrer Unterkante, 95 % ihrer Tiefe), tief unter jeder
            // Bundle-Hülle — ein Empfänger, den nur seine eigene Boden-Hülle ins Band holt
            const ab = r._kaskadenSaum(csm.breaks, 0, csm.fade === true, [0, 1]);
            const mf = csm.mainFrustum.vertices;
            const unten = (t) => {
                const e = [0, 1, 2, 3].map((j) =>
                    new T.Vector3().lerpVectors(mf.near[j], mf.far[j], t).applyMatrix4(cam.matrixWorld)
                );
                e.sort((p, q) => p.y - q.y);
                return e[0].add(e[1]).multiplyScalar(0.5);
            };
            const pt = new T.Vector3().lerpVectors(unten(ab[0]), unten(ab[1]), 0.95);
            pt.y += 1;
            tal.huelle.setFromCenterAndSize(pt, new T.Vector3(20, 2, 20));
            boden.bloecke.set("__w7:tal", tal);
            alleNeu();
            r._kaskadenPassen(csm);
            const talDrin = frustumVon(0).containsPoint(pt);
            // der Hang: im Licht-Raum über dem Zentrum der nahen Box, 30 m über ihrer nahen Ebene
            const f0 = csm._anazhFit[0];
            const ph = new T.Vector3(f0.x0 + f0.W / 2, f0.y0 + f0.H / 2, f0.zt + 30).applyMatrix4(
                f0.basisInv.clone().invert()
            );
            hang.huelle.setFromCenterAndSize(ph, new T.Vector3(6, 6, 6));
            boden.bloecke.set("__w7:hang", hang);
            alleNeu();
            r._kaskadenPassen(csm);
            const f1 = csm._anazhFit[0];
            const lz = ph.clone().applyMatrix4(f1.basisInv).z;
            return { talDrin, hangWirft: lz <= f1.zt, hangZ: +(lz - f1.zt).toFixed(1) };
        } finally {
            boden.bloecke.delete("__w7:tal");
            boden.bloecke.delete("__w7:hang");
            r._kaskadenHuellen = roh;
            if (Object.prototype.hasOwnProperty.call(r, "_kaskadenHuellen")) delete r._kaskadenHuellen;
        }
    };
    if (boden) {
        aus.w5 = w5(null);
        if (selbsttest)
            aus.s3 = w5(function (S2) {
                // DIE ALTE HÜLLEN-REGEL: nur die Region-Bundles
                const a = S2.huellen;
                a.length = 0;
                for (const bg of this.state._regionBundles.values()) {
                    const h = this._bundleWerferHuelle(bg);
                    if (h) a.push(h);
                }
                return a;
            });
    }

    // ── W: die Werfer je Pass ──
    tag(0.5);
    blick(0);
    alleNeu();
    r._kaskadenPassen(csm);
    const map = st._regionBundles;
    const kasten = (x, y, z, s) => {
        const bg = new T.BundleGroup();
        const m = new T.Mesh(new T.BoxGeometry(s, s, s), new T.MeshBasicMaterial());
        m.position.set(x, y, z);
        m.castShadow = true;
        bg.add(m);
        st.scene.add(bg);
        bg.updateMatrixWorld(true);
        return bg;
    };
    // W2 — 2 km vor der Kamera, im Haupt-Urteil sichtbar (so sah die alte Regel ihn: im Blick → wirft)
    const fern = kasten(pm.x, pm.y + 5, pm.z + 2000, 20);
    fern.userData._sichtHaupt = true;
    map.set("__w7:fern", fern);
    // W3 — hinter dem Blick, aber zwischen Licht und naher Scheibe: Box-Zentrum der Kaskade 0, 15 m zum Licht hin
    const f0 = csm._anazhFit[0];
    const hinterInv = f0.basisInv.clone().invert();
    const p3 = new T.Vector3(f0.x0 + f0.W / 2, f0.y0 + f0.H / 2, f0.zt - 15).applyMatrix4(hinterInv);
    const hinter = kasten(p3.x, p3.y, p3.z, 3);
    hinter.userData._sichtHaupt = false;
    map.set("__w7:hinter", hinter);
    // W4 — EINE Region, zwei Werfer: einer in der nahen Box, einer 2 km fern. Die Region wirft (ihre Hülle schneidet die
    // Box), der ferne Werfer ruht im Pass — die Wahl gilt je Werfer, nicht je Region.
    const zwei = kasten(p3.x, p3.y, p3.z, 2);
    const weit = new T.Mesh(new T.BoxGeometry(4, 4, 4), new T.MeshBasicMaterial());
    weit.position.set(pm.x + 2000, pm.y, pm.z);
    weit.castShadow = true;
    zwei.add(weit);
    zwei.updateMatrixWorld(true);
    zwei.userData._sichtHaupt = true;
    map.set("__w7:zwei", zwei);
    const passeAlt = (kamera, nach) => {
        // DIE ALTE REGEL (bis V18.528): jeder Pass liest das Haupt-Urteil
        for (const bg of map.values()) if (bg.userData._sichtHaupt !== undefined) bg.visible = bg.userData._sichtHaupt;
        void kamera;
        void nach;
    };
    const pruefe = (pass) => {
        const w = {
            falsch: 0,
            kindFalsch: 0,
            sichtbar: [],
            fernWirft: false,
            hinterWirft: false,
            zweiWirft: false,
            weitWirft: false,
            bundleBleibt: true,
            zurueck: true,
        };
        for (let i = 0; i < csm.lights.length; i++) {
            const L = lageVon(i);
            const kam = csm.lights[i].shadow.camera;
            pass(kam, false);
            let n = 0;
            for (const bg of map.values()) {
                if (bg.isBundleGroup !== true) w.bundleBleibt = false;
                const h = r._bundleWerferHuelle(bg);
                const soll = h !== null && r._passTrifftBox(L, h, 0);
                if (bg.visible !== soll) w.falsch++;
                if (bg.visible) n++;
            }
            w.sichtbar.push(n);
            // je Werfer: ein werfendes Blatt-Mesh einer werfenden Region zeichnet genau dann, wenn seine Box trifft (ein
            // abgewähltes steht in der Rückkehr-Liste S.ab; ein Mesh, das aus anderer Ursache ruht, wählt der Pass nie)
            const abgewaehlt = new Set(S.ab);
            const kinder = (o) => {
                for (const c of o.children) {
                    if (c.visible === false && !abgewaehlt.has(c)) continue;
                    if (c.isMesh && c.castShadow && c.children.length === 0) {
                        const b = c.userData._werferKind;
                        const soll = !!b && !b.isEmpty() && r._passTrifftBox(L, b, 0);
                        if (c.visible !== soll) w.kindFalsch++;
                    } else if (c.children.length > 0) kinder(c);
                }
            };
            for (const bg of map.values()) if (bg.visible) kinder(bg);
            if (fern.visible) w.fernWirft = true;
            if (i === 0 && hinter.visible) w.hinterWirft = true;
            if (i === 0) {
                w.zweiWirft = zwei.visible;
                w.weitWirft = zwei.visible && weit.visible;
            }
            pass(kam, true);
            for (const bg of map.values()) {
                if (bg.userData._sichtHaupt !== undefined && bg.visible !== bg.userData._sichtHaupt) w.zurueck = false;
                if (bg.isBundleGroup !== true) w.bundleBleibt = false;
            }
            if (weit.visible !== true) w.zurueck = false;
        }
        return w;
    };
    try {
        aus.haupt = [...map.values()].filter((bg) => bg.userData._sichtHaupt === true).length;
        aus.bundles = map.size;
        aus.w = pruefe((k, nach) => r._passSicht(k, nach));
        if (selbsttest) aus.s1 = pruefe(passeAlt);
    } finally {
        for (const [k, bg] of [
            ["__w7:fern", fern],
            ["__w7:hinter", hinter],
            ["__w7:zwei", zwei],
        ]) {
            map.delete(k);
            st.scene.remove(bg);
        }
    }

    // ── W7: die Sätze je Pass — jeder Pass (Hauptbild · jede Kaskade) zeichnet in JEDEM Satz, der in ihm zeichnet (im
    // Schatten-Pass die werfenden: Boden, werfende Bau-Sätze), genau die Zellen, deren Hülle sein Frustum schneidet,
    // byte-gleich hintereinander (jeder Index verglichen); ohne Zelle im Frustum zeichnet der Satz nicht; nach jedem Pass
    // zeigt jeder Satz den Abschnitt des Hauptbilds. Nicht vakuös: ein Pass lässt Viertel des Boden-Rings weg, und die
    // nahe Kaskade trägt Boden, den das Hauptbild nicht sieht (ein Hang hinter dem Blick wirft) — mittags und am Abend. ──
    const w7 = (pass, t, yaw) => {
        tag(t);
        blick(yaw);
        alleNeu();
        const saetze = [...(st.chunkSaetze ? st.chunkSaetze.values() : [])];
        const res = {
            paesse: [],
            falsch: 0,
            taeter: [],
            zurueck: true,
            weg: false,
            hinterWirft: false,
            voll: boden.iSumme / 3,
            bauGeprueft: 0,
        };
        // das Soll: die Zellen, deren Hülle das EINE Gesetz in der Lage des Passes trifft (erst der Bereich, dann seine Zellen);
        // eine Höhlen-Zelle (Welle 7) zählt nur, wenn die Höhlen-Sicht DIESES Passes sie gestempelt hat — ihre Wahrheit
        // prüft gate:hoehlen-sicht (Strahlen gegen den ganzen Boden-Satz), hier zählt die Treue des Abschnitts
        const wahl = (s, L) => {
            const liste = [];
            const stempel = s.hoehle ? s.hoehle.stempel : 0;
            for (const b of s.ordnung) {
                if (!b.huelle || b.huelle.isEmpty() || !r._passTrifftBox(L, b.huelle, 0)) continue;
                for (const z of b.zellen)
                    if (
                        (z.knoten === undefined || z.knoten.sicht === stempel) &&
                        !z.huelle.isEmpty() &&
                        r._passTrifftBox(L, z.huelle, 0)
                    )
                        liste.push(z);
            }
            return liste;
        };
        const hauptDr = new Map();
        // Was ein Lauf zeichnet: die Multimenge seiner Dreiecke (jedes mit seiner Windung, Hash-Summe und -XOR) ohne die
        // entarteten Lücken (drei gleiche Ecken) — der Abschnitt trägt seine Zellen je an ihrem Platz, ein Pass schreibt nur
        // die Änderung seiner Wahl.
        const dreiecke = (arr, a, e, aus) => {
            for (let i = a; i + 2 < e; i += 3) {
                const x = arr[i],
                    y = arr[i + 1],
                    z = arr[i + 2];
                if (x === y && y === z) continue;
                const h = (Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(z, 83492791)) >>> 0;
                aus.s = (aus.s + h) >>> 0;
                aus.x = (aus.x ^ h) >>> 0;
                aus.n++;
            }
            return aus;
        };
        const pruefPass = (kam, i, name, schatten) => {
            const L = lageVon(i);
            pass(kam, false);
            let imBoden = null;
            for (const s of saetze) {
                if (schatten && s.spec.schatten !== true) continue;
                const dr = s.geom.drawRange;
                const idx = s.geom.index.array;
                const soll = wahl(s, L);
                let n = 0;
                const sollM = { s: 0, x: 0, n: 0 };
                for (const z of soll) {
                    n += z.idx.length;
                    dreiecke(z.idx, 0, z.idx.length, sollM);
                }
                const gez = dreiecke(idx, dr.start, dr.start + dr.count, { s: 0, x: 0, n: 0 });
                const inhalt = gez.n === sollM.n && gez.s === sollM.s && gez.x === sollM.x && dr.count >= n;
                const sichtbar = s.mesh.visible === n > 0;
                if (!inhalt || !sichtbar) {
                    res.falsch++;
                    if (res.taeter.length < 6) res.taeter.push(name + ":" + s.spec.name);
                }
                if (s === boden) {
                    res.paesse.push({ name, tris: dr.count / 3, soll: n / 3 });
                    if (n / 3 < res.voll) res.weg = true;
                    imBoden = new Set(soll);
                } else if (s.spec.userData.bauSatz) res.bauGeprueft++;
            }
            pass(kam, true);
            return imBoden;
        };
        const imHaupt = pruefPass(cam, -1, "haupt", false);
        for (const s of saetze) hauptDr.set(s, [s.geom.drawRange.start, s.geom.drawRange.count]);
        for (let i = 0; i < csm.lights.length; i++) {
            const kam = csm.lights[i].shadow.camera;
            const imPass = pruefPass(kam, i, "k" + i, true);
            if (i === 0) for (const z of imPass) if (!imHaupt.has(z)) res.hinterWirft = true;
            for (const s of saetze) {
                const h = hauptDr.get(s);
                if (s.geom.drawRange.start !== h[0] || s.geom.drawRange.count !== h[1]) res.zurueck = false;
            }
        }
        return res;
    };
    if (boden) {
        const passeVoll = (kamera, nach) => {
            // DIE ALTE REGEL (bis 05.10.): der Satz zeichnet den ganzen Ring in jedem Pass
            void kamera;
            void nach;
            boden.mesh.geometry.setDrawRange(0, boden.iSumme);
            boden.mesh.visible = true;
        };
        aus.w7 = [
            w7((k, nach) => r._passSicht(k, nach), 0.5, 0),
            w7((k, nach) => r._passSicht(k, nach), 0.72, Math.PI / 2),
        ];
        if (selbsttest) aus.s8 = w7(passeVoll, 0.5, 0);
        tag(0.5);
        blick(0);
        alleNeu();
        r._kaskadenPassen(csm);
    }

    // ── W8: DIE INSTANZ-WAHL JE PASS (Welle 7) — eine globale Pflanzen-Stufe zeichnet je Pass nur die Instanzen, die sein
    // Frustum schneiden (Schatten-Pass: die Licht-Kapsel gegen die Scheibe der Kaskade) und deren Stufen-Maske vom Auge etwas
    // behält; nach dem Pass zählt sie wieder alle. Gebaute Bäume an bekannten Orten (eine L1, eine L0, ein Zwilling, je über
    // den Produktions-Chokepoint `_archInstanceGroupFor`/`_archGroupAlloc`/`_lodSlotStamp`): je Pass die gezeichnete Menge
    // gegen das Soll, beim Namen. `alt` = die alte Regel (jede Instanz in jedem Pass). ──
    const w8 = (alt) => {
        const lu = r._ensureLodUniforms();
        const D = r.constructor.LOD_DISTANCES;
        const set = r._instanzWahlGruppen();
        const res = {
            falsch: [],
            zurueck: true,
            marken: true,
            gruppen: 0,
            haupt: null,
            k0: null,
            k1: null,
            abend: null,
        };
        const stamm = (stufe) => {
            const g = new T.CylinderGeometry(2, 2, 10, 8, 1);
            g.translate(0, 5, 0);
            const n = g.attributes.position.count;
            g.setAttribute("aLodLevel", new T.BufferAttribute(new Float32Array(n).fill(stufe), 1));
            g.setAttribute("aH0", new T.BufferAttribute(new Float32Array(n).fill(10), 1));
            g.setAttribute("aH0L", new T.BufferAttribute(new Float32Array(n).fill(10), 1));
            return g;
        };
        // der Stoff der Probe trägt die Maske (wie jeder Stufen-Stoff der Foundry, Kanal Farbe: auch der Schattenpass liest
        // sie); die Gruppe U trägt einen Stoff OHNE Maske — die GPU zeichnet jede ihrer Instanzen voll, ein Fenster schnitte
        // dort ein Loch
        const stoff = new T.MeshBasicMaterial();
        stoff.userData.foundryCrossfade = true;
        stoff.userData.foundryCrossfadeKanal = "farbe";
        // die Gruppen der Welt, deren Stoff die Maske nicht trägt (die Wahl liest dort nur das Gesetz, kein Fenster)
        res.ohneMaske = [...set].filter((g) => !r._instanzFensterGilt(g)).map((g) => String(g.key));
        const G = {
            L1: r._archInstanceGroupFor("__w8:baum", 0, { geom: stamm(2), mat: stoff, castShadow: false }, null),
            L0: r._archInstanceGroupFor("__w8:baum", 1, { geom: stamm(1), mat: stoff, castShadow: false }, null),
            Z: r._archInstanceGroupFor(
                "__w8:baum",
                2,
                { geom: stamm(3), mat: stoff, castShadow: true, shadowTwin: true },
                null
            ),
            U: r._archInstanceGroupFor(
                "__w8:baum",
                3,
                { geom: stamm(2), mat: new T.MeshBasicMaterial(), castShadow: false },
                null
            ),
        };
        res.gruppen = Object.values(G).filter((g) => g.wahl).length;
        const M = new T.Matrix4();
        const setze = (g, name, x, z, s) => {
            const ref = r._archGroupAlloc(g, null);
            const y = r._voxelSurfaceY(x, z);
            M.makeScale(s, s, s).setPosition(x, Number.isFinite(y) ? y : pm.y, z);
            g.mesh.setMatrixAt(ref.slot, M);
            r._lodSlotStamp(g, ref.slot, s, false, null);
            (g._w8 || (g._w8 = new Map())).set(ref, name);
            return ref;
        };
        const gezeichnet = (g) => {
            const out = [];
            for (let s = 0; s < g.mesh.count; s++) out.push(g._w8.get(g.slotRef[s]));
            return out.sort().join(",");
        };
        const pruefe = (name, g, soll) => {
            const ist = g.mesh.visible ? gezeichnet(g) : "";
            const s = soll.slice().sort().join(",");
            if (ist !== s)
                res.falsch.push(`${name}: ${r.constructor._instanzKlasse(g.key)} zeichnet [${ist}] statt [${s}]`);
            return ist;
        };
        const danach = () => {
            for (const g of Object.values(G)) {
                if (g.mesh.count !== g.liveCount || g.mesh.visible !== g.liveCount > 0) res.zurueck = false;
                for (let s = 0; s < g.liveCount; s++) if (g.slotRef[s].slot !== s) res.marken = false;
            }
        };
        try {
            if (alt) set.clear();
            // ein neuer Schatten-Takt (die Werfer-Hüllen rechnen je Takt einmal — der Loop zählt ihn, die Linse hier)
            const takt = () => {
                r._shadowFrame = (r._shadowFrame || 0) + 1;
                alleNeu();
                r._kaskadenPassen(csm);
            };
            const uniformen = (auge) => {
                lu.uLodAuge.value.copy(auge);
                lu.uLodPerf.value = 1;
                lu.uLodMaskOn.value = 1;
                lu.uLodRef.value = D.lodRef;
                lu.uLodD0.value = D.thresh01;
                lu.uLodD1.value = D.thresh12;
                lu.uLodFade.value = D.fade;
                lu.uLodFade0.value = D.fade0;
            };
            const kaskade = (i, soll) => {
                const kam = csm.lights[i].shadow.camera;
                frustumVon(i);
                r._passSicht(kam, false);
                const ist = pruefe("k" + i, G.Z, soll);
                r._passSicht(kam, true);
                danach();
                return ist;
            };
            const leere = (g) => {
                for (const ref of [...g._w8.keys()]) {
                    r._archGroupFree(g, ref);
                    g._w8.delete(ref);
                }
            };
            // (1) Mittag, Blick +z: A 20 m voraus (L1, wahrgenommen 20 m — im Fenster), B 20 m hinter dem Blick, C 40 m
            // voraus (jenseits d1: die Maske verwirft alles), D 10 m voraus (das Einblend-Band der L1); E 6 m voraus (L0
            // diesseits d0), F 22 m voraus (L0 jenseits d0); die Zwillinge G 15 m voraus und I 25 m hinter dem Blick — die
            // Mittagssonne wirft G in die nahe Scheibe, keinen in die ferne.
            tag(0.5);
            blick(0);
            const c = cam.position.clone();
            setze(G.L1, "A", c.x, c.z + 20, 1);
            setze(G.L1, "B", c.x, c.z - 20, 1);
            setze(G.L1, "C", c.x, c.z + 40, 1);
            setze(G.L1, "D", c.x + 3, c.z + 10, 1);
            setze(G.L0, "E", c.x, c.z + 6, 1);
            setze(G.L0, "F", c.x, c.z + 22, 1);
            setze(G.Z, "G", c.x, c.z + 15, 1);
            setze(G.Z, "I", c.x, c.z - 25, 1);
            setze(G.U, "U", c.x - 3, c.z + 40, 1); // wie C jenseits d1 — ohne Maske kein Fenster: U zeichnet
            takt();
            uniformen(c);
            r._passSicht(cam, false);
            res.haupt = [
                pruefe("haupt", G.L1, ["A", "D"]),
                pruefe("haupt", G.L0, ["E"]),
                pruefe("haupt", G.U, ["U"]),
            ].join(" · ");
            r._passSicht(cam, true);
            danach();
            res.k0 = kaskade(0, ["G"]);
            res.k1 = kaskade(1, []);
            // (2) Mittag, Blick in Licht-Richtung (der Schatten läuft vom Auge weg): der Zwilling H mitten in der fernen
            // Scheibe, so hoch, dass seine Maske vom Auge etwas behält — er wirft in k1, nicht in k0.
            leere(G.Z);
            const L = new T.Vector3().subVectors(csm.light.target.position, csm.light.position).setY(0).normalize();
            blick(Math.atan2(L.x, L.z));
            const c1 = cam.position.clone();
            const far = Math.min(cam.far, csm.maxFar);
            const b0 = csm.breaks[0] * (far - cam.near);
            const dH = b0 + 0.45 * (far - b0);
            const sH = Math.ceil((12 * dH - 24) / 264) + 1;
            setze(G.Z, "H", c1.x + L.x * dH, c1.z + L.z * dH, sH);
            takt();
            uniformen(c1);
            res.fernH = { tiefe: Math.round(dH), skala: sH, nahGrenze: Math.round(b0) };
            res.k1H = kaskade(1, ["H"]);
            res.k0H = kaskade(0, []);
            // (3) Abend, die Sonne im Rücken: ein 30 m hoher Zwilling 15 m HINTER dem Blick wirft seinen Schatten nach vorn in
            // die nahe Scheibe — er wirft in k0, obwohl das Hauptbild ihn nie sieht.
            leere(G.Z);
            tag(0.72);
            L.subVectors(csm.light.target.position, csm.light.position).setY(0).normalize();
            blick(Math.atan2(L.x, L.z));
            const c2 = cam.position.clone();
            setze(G.Z, "J", c2.x - L.x * 15, c2.z - L.z * 15, 3);
            takt();
            uniformen(c2);
            res.abend = kaskade(0, ["J"]);
        } finally {
            for (const g of Object.values(G)) {
                set.add(g);
                for (const ref of [...(g._w8 || new Map()).keys()]) r._archGroupFree(g, ref);
                r._disposeArchInstanceGroup(g.key);
            }
            if (alt) for (const g of st.archInstanceGroups.values()) if (g.wahl) set.add(g);
            tag(0.5);
            blick(0);
            alleNeu();
            r._kaskadenPassen(csm);
        }
        return res;
    };
    aus.w8 = w8(false);
    if (selbsttest) aus.s9 = w8(true);

    // ── W9: DAS EINE GESETZ, DREI LESER (W7-Vereinigung) — ein Punkt P in der Box einer Kaskade, dessen Licht-Kapsel ihre
    // Scheibe verfehlt (aus der Welt gesucht: das Frustum allein trifft ihn, das Gesetz nicht — für eine Kugel 4,5 m, die
    // jede Probe umschließt). Dort wirft kein Werfer eines Bündels (eine Box 1 m) und keine Instanz der Wahl (ein Zwilling
    // ohne Masken-Stoff: nur das Gesetz urteilt) in diese Kaskade, und in jeder Kaskade zeichnet der Boden-Satz genau die
    // Zellen des Gesetzes; `kapselSchnitt` zählt die Zellen, die das Frustum allein zöge (nicht vakuös). `abweichung` lässt
    // EINEN Leser nach der alten Box urteilen (die Lage ohne Scheibe) — der Selbsttest S10. ──
    const w9 = (abweichung) => {
        const res = { punkt: null, kaskade: -1, werfer: null, instanz: null, zellenFalsch: 0, kapselSchnitt: 0 };
        const P = Object.getPrototypeOf(r);
        const ohneKapsel = (L, fn) => {
            const fit = L ? L.fit : null;
            if (L) L.fit = null;
            try {
                return fn();
            } finally {
                if (L) L.fit = fit;
            }
        };
        if (abweichung === "zellen")
            r._chunkSatzPass = function (kamera, nach, k, S2) {
                return ohneKapsel(S2.lage, () => P._chunkSatzPass.call(this, kamera, nach, k, S2));
            };
        if (abweichung === "werfer")
            r._werferWahlPass = function (m, L, ab) {
                return ohneKapsel(L, () => P._werferWahlPass.call(this, m, L, ab));
            };
        if (abweichung === "instanzen")
            r._instanzWahlPass = function (art, S2) {
                return ohneKapsel(S2.lage, () => P._instanzWahlPass.call(this, art, S2));
            };
        const geo = new T.BoxGeometry(1, 2, 1);
        geo.translate(0, 1, 0);
        const nv = geo.attributes.position.count;
        geo.setAttribute("aLodLevel", new T.BufferAttribute(new Float32Array(nv).fill(3), 1));
        geo.setAttribute("aH0", new T.BufferAttribute(new Float32Array(nv).fill(2), 1));
        geo.setAttribute("aH0L", new T.BufferAttribute(new Float32Array(nv).fill(2), 1));
        const Z = r._archInstanceGroupFor(
            "__w9:zwilling",
            0,
            { geom: geo, mat: new T.MeshBasicMaterial(), castShadow: true, shadowTwin: true },
            null
        );
        const map9 = st._regionBundles;
        let bg = null;
        try {
            tag(0.5);
            blick(0);
            alleNeu();
            r._kaskadenPassen(csm);
            // der Punkt: die ferne Kaskade zuerst (ihre Box umschließt den nahen Boden), dann die nahe
            for (let i = csm.lights.length - 1; i >= 0 && !res.punkt; i--) {
                const L = lageVon(i);
                if (!L.fit) continue;
                let best = null;
                for (let gx = -60; gx <= 60; gx++)
                    for (let gz = -60; gz <= 60; gz++) {
                        const x = cam.position.x + gx * 4,
                            z = cam.position.z + gz * 4;
                        const y0 = r._voxelSurfaceY(x, z);
                        if (!Number.isFinite(y0)) continue;
                        const y = y0 + 1;
                        if (!ohneKapsel(L, () => r._passTrifft(L, x, y, z, 0, 0, 0, 0))) continue;
                        if (r._passTrifft(L, x, y, z, 0, 0, 0, 4.5)) continue;
                        const d = Math.hypot(x - cam.position.x, z - cam.position.z);
                        if (!best || d < best.d) best = { x, y, z, d };
                    }
                if (best) {
                    res.punkt = [best.x, best.y, best.z].map((v) => Math.round(v * 10) / 10);
                    res.kaskade = i;
                }
            }
            if (!res.punkt) return res;
            const [px, py, pz] = res.punkt;
            // der Werfer eines Bündels (eine Box 1 m) und die Instanz der Wahl am Punkt
            bg = new T.BundleGroup();
            const kiste = new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial());
            kiste.position.set(px, py + 0.5, pz);
            kiste.castShadow = true;
            bg.add(kiste);
            st.scene.add(bg);
            bg.updateMatrixWorld(true);
            map9.set("__w9:kapsel", bg);
            const ref = r._archGroupAlloc(Z, null);
            Z.mesh.setMatrixAt(ref.slot, new T.Matrix4().makeTranslation(px, py, pz));
            r._lodSlotStamp(Z, ref.slot, 1, false, null);
            r._shadowFrame = (r._shadowFrame || 0) + 1;
            alleNeu();
            r._kaskadenPassen(csm);
            const saetze = [...(st.chunkSaetze ? st.chunkSaetze.values() : [])].filter((x) => x.spec.schatten === true);
            for (let i = 0; i < csm.lights.length; i++) {
                const kam = csm.lights[i].shadow.camera;
                const L = lageVon(i);
                // das Soll der Zellen (das Gesetz) und der Schnitt der Kapsel (das Frustum allein zöge mehr)
                const soll = new Map();
                for (const sz of saetze) {
                    const menge = new Set();
                    for (const b of sz.ordnung) {
                        if (!b.huelle || b.huelle.isEmpty()) continue;
                        const bGesetz = r._passTrifftBox(L, b.huelle, 0);
                        const bBox = ohneKapsel(L, () => r._passTrifftBox(L, b.huelle, 0));
                        for (const zl of b.zellen) {
                            if (zl.huelle.isEmpty()) continue;
                            const g = bGesetz && r._passTrifftBox(L, zl.huelle, 0);
                            if (g) menge.add(zl);
                            else if (bBox && ohneKapsel(L, () => r._passTrifftBox(L, zl.huelle, 0))) res.kapselSchnitt++;
                        }
                    }
                    soll.set(sz, menge);
                }
                r._passSicht(kam, false);
                if (i === res.kaskade) {
                    res.werfer = bg.visible === true && kiste.visible === true;
                    res.instanz = Z.mesh.count > 0;
                }
                for (const sz of saetze) {
                    // eine Höhlen-Zelle (Welle 7) zählt nur, wenn die Höhlen-Sicht DIESES Passes sie gestempelt hat (W7)
                    const stempel = sz.hoehle ? sz.hoehle.stempel : 0;
                    const menge = new Set(
                        [...soll.get(sz)].filter((zl) => zl.knoten === undefined || zl.knoten.sicht === stempel)
                    );
                    const a = sz.abschnitte.get("k" + i);
                    const ist = new Set(a && sz.mesh.visible ? a.liste : []);
                    let gleich = ist.size === menge.size;
                    if (gleich) for (const zl of menge) if (!ist.has(zl)) gleich = false;
                    if (!gleich) res.zellenFalsch++;
                }
                r._passSicht(kam, true);
            }
            return res;
        } finally {
            delete r._chunkSatzPass;
            delete r._werferWahlPass;
            delete r._instanzWahlPass;
            if (bg) {
                map9.delete("__w9:kapsel");
                st.scene.remove(bg);
            }
            for (const rf of [...Z.slotRef].filter(Boolean)) r._archGroupFree(Z, rf);
            r._disposeArchInstanceGroup(Z.key);
            tag(0.5);
            blick(0);
            alleNeu();
            r._kaskadenPassen(csm);
        }
    };
    aus.w9 = w9(null);
    if (selbsttest) aus.s10 = ["zellen", "werfer", "instanzen"].map((x) => Object.assign({ leser: x }, w9(x)));

    // ── W6: jeder Werfer ist der Box bekannt — ein Bundle-Kind (Werfer-Hülle), ein Boden-Bereich, ein freier Werfer
    // (Tier · Spieler · Insel · Bauplan-Bau als eigene Gruppe). Eine neue Werfer-Klasse außerhalb davon läge über der
    // nahen Ebene der Box (luftM) und verlöre ihren Schatten — die Linse nennt sie beim Namen. ──
    {
        const frei = new Set([
            ...(st.creatures || []),
            ...(st.floatingIslands || []),
            ...(st.architectures || []).map((e) => e && e.mesh).filter(Boolean),
            st.playerMesh,
        ]);
        // jeder WERFENDE Satz (der Boden, die werfenden Bau-Sätze, Welle 6) trägt seine Bereichs-Hüllen in die Box
        // (`_kaskadenHuellen`)
        const satzWerfer = new Set();
        if (st.chunkSaetze)
            for (const s of st.chunkSaetze.values()) if (s.spec.schatten === true) satzWerfer.add(s.mesh);
        const fremd = [];
        for (const top of st.scene.children) {
            if (top.isBundleGroup || frei.has(top) || satzWerfer.has(top)) continue;
            top.traverse((o) => {
                if (o.isMesh && o.castShadow === true) fremd.push((top.name || top.type) + " > " + (o.name || o.type));
            });
        }
        aus.w6 = { fremd: fremd.slice(0, 8), n: fremd.length };
    }

    // ── Z1: die Karten-Ziele — der Knoten baut sein Ziel durch die Hülle (wie r184 setupRenderTarget) ──
    {
        const rt = new T.RenderTarget(8, 8);
        const dt = new T.DepthTexture(8, 8);
        rt.depthTexture = dt;
        const knoten = { setupRenderTarget: () => ({ shadowMap: rt, depthTexture: dt }) };
        r._kaskadenZiele({ _shadowNodes: [knoten] });
        const z = knoten.setupRenderTarget({}, {});
        aus.z1 = {
            farbe: z.shadowMap.texture.format === T.RedFormat,
            tiefe: z.depthTexture.type === T.UnsignedShortType,
            namen: rt.texture.name === "kaskade0:farbe" && dt.name === "kaskade0:tiefe",
            // die echte CSM: jeder Kaskaden-Knoten trägt die Hülle seit der Geburt
            echt:
                csm._shadowNodes.length > 0 &&
                csm._shadowNodes.every((sn) => Object.prototype.hasOwnProperty.call(sn, "setupRenderTarget")),
        };
    }
    // ── Z2 (Seite): der EINE Kompilier-Weg und die EINE Szenen-Tiefe leben in ihren Methoden ──
    aus.z2 = {
        kompiliere: /\.compileAsync\(/.test(window.__codeOf(r._kompiliere)),
        szeneTiefe: /viewportDepthTexture\(/.test(window.__codeOf(r._szeneTiefe)),
    };

    // ── A1: Absenz + Konsum ──
    // die alten Frustum-Schreiber der Tiere: `creature.visible = inFrustum` und `… = this.isInFrustum(creature, frustum)`
    const TIER_SCHREIBER = /\.visible\s*=\s*(?:this\.isInFrustum\(|inFrustum\b)/;
    aus.a1 = {
        inselnFrei: !/isInFrustum\(/.test(window.__codeOf(r._loopFrustumCulling)),
        tiereFrei:
            !TIER_SCHREIBER.test(window.__codeOf(r.updateCreatures)) &&
            !TIER_SCHREIBER.test(window.__codeOf(r._loopFrustumCulling)),
        eigeneMethode: ["updateBefore", "_init", "_updateShadowBounds"].every((k) =>
            Object.prototype.hasOwnProperty.call(csm, k)
        ),
        // kein Umbau nach der Geburt: die Karten-Ziele fallen nie im laufenden Frame (Bind-Gruppen der Bundles)
        keinUmbau: !/\.dispose\(\)|_kaskadenKarten|_kaskadenZiele/.test(window.__codeOf(r._kaskadenPassen)),
        // die Sicht je Pass schaltet keine Bundle-Eigenschaft (die Bundle-Wahrheit am Chokepoint trägt den Schatten-Pass)
        keineBruecke: !/isBundleGroup\s*=[^=]|\.static\s*=[^=]/.test(
            window.__codeOf(r._passSicht) + window.__codeOf(r._passSichtZurueck) + window.__codeOf(r._werferWahl)
        ),
    };
    if (selbsttest)
        aus.s4 =
            TIER_SCHREIBER.test("creature.visible = inFrustum;") &&
            TIER_SCHREIBER.test("creature.visible = this.isInFrustum(creature, frustum)");
    // der Zweit-Schreiber: updateFrustums (Reichweiten-Wechsel) lässt die Kaskaden-Kameras stehen
    {
        const kam = () => csm.lights.map((l) => [l.shadow.camera.left, l.shadow.camera.right, l.shadow.camera.top]);
        const vorK = JSON.stringify(kam());
        csm.updateFrustums();
        aus.a1.zweitStumm = JSON.stringify(kam()) === vorK && csm.breaks.length === csm.cascades;
        if (selbsttest) {
            const eigen = csm._updateShadowBounds;
            delete csm._updateShadowBounds;
            try {
                csm.updateFrustums();
                aus.s5 = JSON.stringify(kam()) !== vorK;
            } finally {
                csm._updateShadowBounds = eigen;
            }
        }
        tag(0.5);
        blick(0);
        alleNeu();
        r._kaskadenPassen(csm);
    }
    {
        const roh = r._kaskadenPassen;
        let n = 0;
        r._kaskadenPassen = function (...a) {
            n++;
            return roh.apply(this, a);
        };
        const lp = csm.lights[0].position.clone();
        let nAddon = -1,
            nSchatten = -1,
            nHaupt = -1,
            nKompilat = -1,
            nOhneWache = -1;
        // ein Kompilat wie r184-compileAsync: der Vorher-Haken der Szene läuft synchron, der Nachher-Haken nie
        const schein = {
            compileAsync(obj, kamera, sc) {
                (sc || obj).onBeforeRender(this, obj, kamera, null);
                return Promise.resolve();
            },
            getRenderTarget: () => null,
            setRenderTarget() {},
            getMRT: () => null,
            setMRT() {},
        };
        const rRoh = st.renderer,
            ppRoh = st.postProcessingFailed;
        try {
            // das Addon-updateBefore ist stumm (es lief NACH den Karten), der Haken des Haupt-Passes stellt die Kaskaden
            csm.updateBefore({});
            nAddon = n;
            st.scene.onBeforeRender(st.renderer, st.scene, csm.lights[0].shadow.camera, null);
            st.scene.onAfterRender(st.renderer, st.scene, csm.lights[0].shadow.camera, null);
            nSchatten = n;
            st.scene.onBeforeRender(st.renderer, st.scene, cam, null);
            st.scene.onAfterRender(st.renderer, st.scene, cam, null);
            nHaupt = n;
            st.renderer = schein;
            st.postProcessingFailed = true; // das Leinwand-Ziel: _kompiliere stellt kein Szenen-Ziel um
            r._kompiliere(st.scene, cam, null);
            nKompilat = n;
            if (selbsttest) {
                Promise.resolve(schein.compileAsync(st.scene, cam, null)); // ohne die Wache
                nOhneWache = n;
            }
        } finally {
            st.renderer = rRoh;
            st.postProcessingFailed = ppRoh;
            delete r._kaskadenPassen;
            st.scene.onAfterRender(st.renderer, st.scene, cam, null);
        }
        aus.a1.konsum = nAddon === 0 && nSchatten === 0 && nHaupt === 1 && nKompilat === 1;
        aus.a1.addonStumm = nAddon === 0 && lp.equals(csm.lights[0].position);
        aus.a1.zaehl = { addon: nAddon, schatten: nSchatten, haupt: nHaupt, kompilat: nKompilat };
        if (selbsttest) aus.s6 = nOhneWache === nKompilat + 1;
    }
    return aus;
}

(async () => {
    await new Promise((res) => server.listen(PORT, "127.0.0.1", res));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__codeOf = (fnOrSrc) =>
            String(fnOrSrc)
                .replace(/\/\/.*$/gm, "")
                .replace(/\/\*[\s\S]*?\*\//g, "");
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.message || String(e)).split("\n")[0]));
    let ok = true;
    const check = (name, cond, detail) => {
        console.log(`  ${cond ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
        if (!cond) ok = false;
    };
    try {
        // Z2 — die Bildziele je Leser im Stamm (GPU-frei, vor dem Boot)
        const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
        const z2 = bildZiele(stamm);
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        // Die Welt plateau-pumpen (der Null-Renderer hat keinen Loop): Chunks > 20 und 40 Takte stabil.
        const welt = await page.evaluate(async () => {
            const r = window.anazhRealm;
            const st = r.state;
            let last = -1,
                stabil = 0,
                takte = 0;
            while (takte < 3000) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                takte++;
                const n = st.voxelChunks ? st.voxelChunks.size : 0;
                if (n === last) stabil++;
                else {
                    stabil = 0;
                    last = n;
                }
                if (n > 20 && stabil > 40) break;
                if (takte % 10 === 0) await new Promise((res) => setTimeout(res, 0));
            }
            // DIE VORAUSSETZUNG BAUEN: seit dem EINEN Karten-Atlas (die Strauch-L2 zeichnet in der globalen Atlas-Gruppe)
            // und dem Waldboden (die Klein-Streu ist Nah-Streu) trägt die Spawn-Welt keine Region-Bundles mehr (gemessen
            // 05.10.: nur "@global"; 14 auf 386f91c, 4 auf b9bf2bc). Vier Regionen um den Spieler bekommen je eine
            // Streu-Instanz über den Produktions-Chokepoint `_scatterInstanceAdd` (echter Region-Schlüssel, echte
            // Region-Kugel) — W1 prüft die Werfer-Wahl je Pass an echten Region-Bundles, nie vakuös.
            const regionen = () =>
                st._regionBundles ? [...st._regionBundles.values()].filter((bg) => bg.userData.cullSphere).length : 0;
            const welt0 = regionen();
            let bauplan = null;
            for (const n in st.blueprints) {
                const fl = r._archFlattenBlueprint(n);
                if (
                    fl &&
                    fl.instanceable &&
                    Array.isArray(fl.leaves) &&
                    fl.leaves.length &&
                    fl.leaves.every((l) => !l.tuer && !l.atlasGruppe && !l.shadowTwin) &&
                    r._archFernRegionKey(n, fl.leaves[0], "0,0") === "0,0" &&
                    r._archGroupCastsShadow(n)
                ) {
                    bauplan = n;
                    break;
                }
            }
            const R = r.constructor.ARCH_REGION_M;
            const pm = st.playerMesh.position;
            const rx0 = Math.round(pm.x / R) - 1,
                rz0 = Math.round(pm.z / R) - 1;
            if (bauplan)
                for (let i = 0; i < 2; i++)
                    for (let j = 0; j < 2; j++) {
                        const rx = rx0 + i,
                            rz = rz0 + j;
                        const x = Math.min(Math.max(pm.x + (i ? 6 : -6), rx * R + 4), (rx + 1) * R - 4);
                        const z = Math.min(Math.max(pm.z + (j ? 6 : -6), rz * R + 4), (rz + 1) * R - 4);
                        const y = r._voxelSurfaceY(x, z);
                        r._scatterInstanceAdd(bauplan, x, Number.isFinite(y) ? y : 0, z, 0, 1, null, rx + "," + rz);
                    }
            return { takte, chunks: last, welt: welt0, bauplan, bundles: regionen() };
        });
        if (!(welt.bundles >= 4)) throw new Error(`keine vier Region-Bundles (${JSON.stringify(welt)})`);
        const a = await page.evaluate(probe, SELBSTTEST);
        if (a.fehler) throw new Error(a.fehler);
        console.log(
            `=== Werfer-Wand: Karten ${a.karten.join("/")} · ${a.bundles} Bundles, Haupt-Urteil ${a.haupt}, Kaskaden-Pässe ${a.w.sichtbar.join("/")} · ${a.bodenBereiche} Boden-Bereiche ===`
        );
        const k1 = (e) => `${e.n - e.schlecht}/${e.n} Boden-Punkte (je Kaskade ${e.jeKaskade.join("/")})`;
        check("K1 die Box deckt die Empfänger (Mittag)", a.k1Mittag.n > 50 && a.k1Mittag.schlecht === 0, k1(a.k1Mittag));
        check("K1 die Box deckt die Empfänger (Abend)", a.k1Abend.n > 50 && a.k1Abend.schlecht === 0, k1(a.k1Abend));
        check(
            "K2 die Box ist eng (≤ 60 % des Addon-Quadrats)",
            a.k2.every((k) => k.anteil <= 0.6),
            a.k2.map((k, i) => `k${i} ${k.W}×${k.H} m vs ${k.addon}² (${Math.round(k.anteil * 100)} %)`).join(" · ")
        );
        check(
            "K3 Zentrum auf dem Texel-Raster",
            a.k3.every(Boolean) && a.k3gehen.every(Boolean),
            `gehen 0,37 m: ${a.k3gehen}`
        );
        check(
            "K4 außerhalb des Takts: still → keine, 40° gedreht → beide rendern",
            a.k4still.every((x) => !x) && a.k4dreh.every(Boolean),
            `still ${a.k4still} · gedreht ${a.k4dreh}`
        );
        if (a.k7)
            check(
                "K7 der Takt hält die Box: ein Takt-Render ohne Änderung behält sie, ein Werfer über der nahen Ebene legt sie neu und wirft",
                a.k7.gehalten && a.k7.neuGelegt && a.k7.wirft,
                JSON.stringify(a.k7)
            );
        check(
            "K5 die Karte trägt die längste Kante bei texelM (kleinste Zweierpotenz)",
            a.k5.every((k) => k.kleinste),
            a.k5.map((k, i) => `k${i} ${k.n}: ${k.kante} m → ${k.texel} m (Soll ${k.soll})`).join(" · ")
        );
        check(
            "K6 Drehen 360°: die längste Box-Kante je Texel ≤ 1,05 · texelM",
            a.k6.every((k) => k.maxTexel <= 1.05 * k.soll),
            a.k6.map((k, i) => `k${i} max ${k.maxTexel} m (Soll ${k.soll}) · ${k.wechsel} Rast-Wechsel`).join(" · ")
        );
        check("W1 jeder Kaskaden-Pass wirft genau die Bundles, deren Werfer-Hülle das Gesetz trifft", a.w.falsch === 0, `${a.w.falsch} falsch`);
        check("W1 … und darin genau die Werfer, deren Box das Gesetz trifft", a.w.kindFalsch === 0, `${a.w.kindFalsch} falsch`);
        check("W1 nach dem Schatten-Pass: Haupt-Urteil, jeder Werfer zurück", a.w.zurueck);
        check("W1 ein Bundle bleibt Bundle (die Sicht je Pass schaltet nur visible)", a.w.bundleBleibt);
        check("W2 der Werfer 2 km vor der Kamera wirft in keine Kaskade", a.w.fernWirft === false);
        check("W3 der Werfer hinter dem Blick wirft in die nahe Kaskade", a.w.hinterWirft === true);
        check(
            "W4 die Region wirft, ihr Werfer 2 km fern ruht (Wahl je Werfer)",
            a.w.zweiWirft === true && a.w.weitWirft === false,
            `Region ${a.w.zweiWirft} · fern ${a.w.weitWirft}`
        );
        check(
            "W5 der Boden außerhalb der Bundles: das Tal empfängt, der Hang wirft",
            !!a.w5 && a.w5.talDrin === true && a.w5.hangWirft === true,
            JSON.stringify(a.w5)
        );
        check(
            "W6 jeder Werfer ist der Box bekannt (Bundle · Satz · Tier · Spieler · Insel · Bauplan-Bau)",
            a.w6.n === 0,
            a.w6.n ? a.w6.fremd.join(" | ") : "keine fremde Werfer-Klasse"
        );
        const w7t = (w) =>
            w.paesse.map((p) => `${p.name} ${Math.round(p.tris)}/${Math.round(w.voll)}`).join(" · ") +
            ` · Bau-Satz-Pässe ${w.bauGeprueft}` +
            (w.taeter.length ? " — falsch: " + w.taeter.join(", ") : "");
        check(
            "W7 die Sätze je Pass: jeder Pass zeichnet in jedem Satz genau die Zellen des Gesetzes, danach das Hauptbild (Mittag · Abend)",
            !!a.w7 && a.w7.every((w) => w.falsch === 0 && w.zurueck && w.weg),
            a.w7
                ? a.w7.map((w) => w7t(w) + (w.zurueck ? "" : " — kein Hauptbild danach")).join(" | ")
                : "kein Boden-Satz"
        );
        check(
            "W7 … die nahe Kaskade trägt Boden hinter dem Blick (Abend, Sonne im Rücken: der Hang wirft)",
            !!a.w7 && a.w7[1].hinterWirft === true
        );
        const w8t = (w) =>
            `${w.gruppen} Wahl-Gruppen · haupt [${w.haupt}] · k0 [${w.k0}] · k1 [${w.k1}] · fern ${JSON.stringify(w.fernH)} k1 [${w.k1H}] k0 [${w.k0H}] · Abend k0 [${w.abend}]` +
            (w.falsch.length ? " — falsch: " + w.falsch.join(" | ") : "");
        check(
            "W8 die Instanz-Wahl je Pass: jede Pflanzen-Stufe zeichnet nur, was ihr Pass sieht (Frustum · Licht-Kapsel gegen die Scheibe · Stufen-Maske vom Auge, nur mit Masken-Stoff), danach wieder alle",
            !!a.w8 && a.w8.gruppen === 4 && a.w8.falsch.length === 0 && a.w8.zurueck && a.w8.marken,
            a.w8 ? w8t(a.w8) + (a.w8.zurueck ? "" : " — count ≠ liveCount nach dem Pass") : "keine W8-Messung"
        );
        console.log(
            `  ℹ W8 Gruppen der Wahl ohne Masken-Stoff (kein Fenster, nur das Gesetz): ${
                a.w8 && a.w8.ohneMaske ? a.w8.ohneMaske.length + (a.w8.ohneMaske.length ? " — " + a.w8.ohneMaske.slice(0, 8).join(" · ") : "") : "?"
            }`
        );
        const w9t = (w) =>
            `P ${JSON.stringify(w.punkt)} in k${w.kaskade} · Werfer ${w.werfer} · Instanz ${w.instanz} · Zellen falsch ${w.zellenFalsch} · Kapsel-Schnitt ${w.kapselSchnitt} Zellen`;
        check(
            "W9 das EINE Gesetz, drei Leser: am Punkt in der Box, dessen Licht-Kapsel die Scheibe verfehlt, wirft weder ein Bündel-Werfer noch eine Instanz, der Boden-Satz zeichnet in jeder Kaskade genau die Zellen des Gesetzes (es schneidet Zellen)",
            !!a.w9 &&
                !!a.w9.punkt &&
                a.w9.werfer === false &&
                a.w9.instanz === false &&
                a.w9.zellenFalsch === 0 &&
                a.w9.kapselSchnitt > 0,
            a.w9 ? w9t(a.w9) : "keine W9-Messung"
        );
        check(
            "Z1 Karten-Ziele: Farbe r8 · Tiefe 16 bit · benannt",
            a.z1.farbe && a.z1.tiefe && a.z1.namen && a.z1.echt,
            JSON.stringify(a.z1)
        );
        check(
            "Z2 Bildziele je Leser: EIN compileAsync (_kompiliere), EINE Szenen-Tiefe (_szeneTiefe), kein namenloses Ziel",
            bildZieleGut(z2) && a.z2.kompiliere && a.z2.szeneTiefe,
            `${JSON.stringify(z2)} · ${JSON.stringify(a.z2)}`
        );
        check("A1 kein Frustum-Schreiber für Inseln", a.a1.inselnFrei);
        check("A1 kein Frustum-Schreiber für Mesh-Tiere", a.a1.tiereFrei);
        check(
            "A1 die CSM fährt Geburt und Fit des Hosts — der Fit im Haken des Haupt-Passes, vor jeder Karte (Konsum)",
            a.a1.eigeneMethode && a.a1.konsum && a.a1.addonStumm,
            JSON.stringify(a.a1.zaehl)
        );
        check("A1 das Addon schreibt keine Box mehr (updateFrustums lässt die Kaskaden-Kameras stehen)", a.a1.zweitStumm);
        check("A1 kein Karten-Umbau im laufenden Frame", a.a1.keinUmbau);
        check("A1 die Sicht je Pass schaltet keine Bundle-Eigenschaft", a.a1.keineBruecke);
        if (SELBSTTEST) {
            const s = a.s1;
            check(
                "S1 Selbsttest: die alte Regel macht W1/W2/W3/W4 rot",
                s.falsch > 0 &&
                    s.kindFalsch > 0 &&
                    s.fernWirft === true &&
                    s.hinterWirft === false &&
                    s.weitWirft === true,
                `falsch ${s.falsch}/${s.kindFalsch} · fern wirft ${s.fernWirft} · hinter wirft ${s.hinterWirft} · weit wirft ${s.weitWirft}`
            );
            check(
                "S3 Selbsttest: die alte Hüllen-Regel (nur Bundles) macht W5 rot",
                !!a.s3 && a.s3.talDrin === false && a.s3.hangWirft === false,
                JSON.stringify(a.s3)
            );
            check(
                "S8 Selbsttest: die alte Regel (der ganze Ring in jedem Pass) macht W7 rot",
                !!a.s8 && a.s8.falsch > 0,
                a.s8 ? w7t(a.s8) : "kein Boden-Satz"
            );
            check(
                "S9 Selbsttest: die alte Regel (jede Instanz in jedem Pass) macht W8 rot und nennt die Klasse",
                // (den fernen Zwilling H allein hält schon die Werfer-Wahl aus k0 — dasselbe Gesetz über die Gruppe als Ganzes)
                !!a.s9 &&
                    a.s9.falsch.some((x) => /^haupt: /.test(x)) &&
                    a.s9.falsch.some((x) => /^k0: /.test(x)) &&
                    a.s9.falsch.some((x) => /__w8:baum/.test(x) || /g:__w8/.test(x)),
                a.s9 ? w8t(a.s9) : "keine Messung"
            );
            for (const s10 of a.s10 || []) {
                const rot =
                    s10.leser === "zellen"
                        ? s10.zellenFalsch > 0
                        : s10.leser === "werfer"
                          ? s10.werfer === true
                          : s10.instanz === true;
                check(
                    `S10 Selbsttest: urteilen die ${s10.leser} nach der alten Box (das Frustum allein), wird W9 rot und nennt sie`,
                    rot,
                    w9t(s10)
                );
            }
            check("S10 Selbsttest lief für alle drei Leser", (a.s10 || []).length === 3);
            check("S4 Selbsttest: die Absenz-Regel fängt beide alten Frustum-Schreiber der Tiere", a.s4 === true);
            check("S5 Selbsttest: das Addon-_updateShadowBounds schreibt die Kaskaden-Kamera", a.s5 === true);
            check("S6 Selbsttest: ein Kompilat ohne Wache stellt die Kaskaden", a.s6 === true);
            const zs = bildZiele(stamm + "\nr.compileAsync(o, k);\nconst t = TSL.viewportDepthTexture();\n");
            check("S7 Selbsttest: ein zweiter Kompilier-Weg, eine zweite Szenen-Tiefe machen Z2 rot", !bildZieleGut(zs));
        }
        check("keine Page-Errors", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));
    } catch (e) {
        check("Lauf", false, (e && e.message) || String(e));
    }
    await browser.close();
    server.close();
    console.log(ok ? "GRÜN schatten-werfer" : "ROT schatten-werfer");
    process.exit(ok ? 0 : 1);
})();
